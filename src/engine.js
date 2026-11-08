// Authentic Pokémon Yellow (pret/pokeyellow) Rendering & Overworld Simulation Engine

export function unpack2Bit(b64, width, height) {
  const bin = atob(b64);
  const out = new Uint8Array(width * height);
  let idx = 0;
  for (let i = 0; i < bin.length; i++) {
    const byte = bin.charCodeAt(i);
    if (idx < out.length) out[idx++] = (byte >> 6) & 3;
    if (idx < out.length) out[idx++] = (byte >> 4) & 3;
    if (idx < out.length) out[idx++] = (byte >> 2) & 3;
    if (idx < out.length) out[idx++] = byte & 3;
  }
  return out;
}

export function unpackBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function createLazy2BitMap(sourceDict, maxEntries = 28) {
  const cache = {};
  const keysQueue = [];
  const src = sourceDict || {};
  return new Proxy(cache, {
    get(target, prop) {
      if (typeof prop !== "string") return target[prop];
      if (prop in target) return target[prop];
      const raw = src[prop];
      if (!raw) return undefined;
      while (keysQueue.length >= maxEntries) {
        const oldest = keysQueue.shift();
        if (oldest) delete target[oldest];
      }
      const unpacked = {
        width: raw.width,
        height: raw.height,
        pixels: unpack2Bit(raw.data, raw.width, raw.height),
      };
      target[prop] = unpacked;
      keysQueue.push(prop);
      return unpacked;
    },
    has(target, prop) {
      return prop in target || prop in src;
    },
    ownKeys() {
      return Reflect.ownKeys(src);
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop in src) {
        return { enumerable: true, configurable: true };
      }
      return undefined;
    },
  });
}

export class PokeYellowEngine {
  constructor(data) {
    this.data = data;
    this.palettes = data.palettes;

    // Bounded VRAM caches (evicts inactive tilesets/sprites on map swaps like 8KB GB VRAM)
    this.gfxSheets = createLazy2BitMap(data.tilesets.gfx, 4);

    this.bstData = {};
    for (const [k, v] of Object.entries(data.tilesets.bst)) {
      this.bstData[k] = unpackBytes(v);
    }

    this.flowerFrames = data.tilesets.flowers.map((b64) => unpack2Bit(b64, 8, 8));
    this.tilesetsById = {};
    this.tilesetsByConst = {};
    for (const ts of data.tilesets.tilesets) {
      ts.passableSet = new Set(ts.passableTiles);
      ts.warpSet = new Set(ts.warpTiles);
      ts.doorSet = new Set(ts.doorTiles);
      ts.counterSet = new Set(ts.counterTiles);
      this.tilesetsById[ts.id] = ts;
      this.tilesetsByConst[ts.constName] = ts;
    }

    // Bounded VRAM sprite banks
    this.spriteSheets = createLazy2BitMap(data.sprites.sheets, 24);
    this.spriteConstToKey = data.sprites.constToKey;
    this.pikachuFaces = createLazy2BitMap(data.sprites.pikachuFaces, 6);
    this.emotes = createLazy2BitMap(data.sprites.emotes, 8);
    this.pokemonSprites = createLazy2BitMap(data.sprites.pokemon, 16);
    this.trainerSprites = createLazy2BitMap(data.sprites.trainers || {}, 8);

    // 1. The 1-Byte Map ID System (0x00..0xFF), MBC3 ROM Banking (0x0000-0x3FFF Bank 0 + 0x4000-0x7FFF Swappable Banks 1-63), & FarCall Stack
    this.hLoadedROMBank = 0x01; // Active 16KB ROM bank mapped at 0x4000–0x7FFF
    this.bankStack = []; // Hardware stack for Bank 0 FarCall / Bankswitch
    this.mapHeaderBanks = new Uint8Array(256);
    this.wOverworldMap = new Uint8Array(1600);
    this.wOverworldMapStride = 0;
    this.wCurMapConst = null;
    this.wCurMapBlocks = null;
    this.mapHeaderById = new Array(256).fill(null);

    const self = this;
    this.allZones = data.zones.map((z, idx) => {
      const conns = z.connections || {};
      const connectionsByte =
        (conns.north ? 8 : 0) |
        (conns.south ? 4 : 0) |
        (conns.west ? 2 : 0) |
        (conns.east ? 1 : 0);
      const romBank = (idx % 63) + 1; // Banks 0x01..0x3F in MBC3 0x4000-0x7FFF window
      const romAddress = 0x4000 + ((idx * 184) & 0x3fff);
      const copy = { ...z, connectionsByte, romBank, romAddress };
      Object.defineProperty(copy, "blockBytes", {
        enumerable: true,
        configurable: true,
        get() {
          if (self.wCurMapConst === z.constName && self.wCurMapBlocks) {
            return self.wCurMapBlocks;
          }
          return self.farCall(romBank, () => unpackBytes(z.blocks));
        },
      });
      return copy;
    });
    this.canonicalZones = this.allZones.filter((z) => z.isCanonical220);
    this.zonesByConst = {};
    this.zonesByNumber = {};
    this.zonesByRomId = {};
    for (const z of this.allZones) {
      this.zonesByConst[z.constName] = z;
      this.zonesByNumber[z.zoneNumber] = z;
      if (!this.zonesByRomId[z.romId]) {
        this.zonesByRomId[z.romId] = z;
        if (z.romId >= 0 && z.romId < 256) {
          this.mapHeaderById[z.romId] = z;
          this.mapHeaderBanks[z.romId] = z.romBank;
        }
      }
    }

    // Animation state (matches home/vcopy.asm UpdateMovingBgTiles)
    this.animCounter = 0; // 0..7
    this.animateTiles = true;
    this.paletteMode = "reference"; // "reference" | "sgb" | "cgb" | "dmg"
    this.cutTrees = new Set(); // Step coordinates cleared by HM01 CUT ("ZONE:sx,sy")
    this.flashIlluminated = false; // Dark cave illumination via HM05 FLASH
  }

  // MBC3 Bank Register Write (0x2000–0x3FFF): Swaps active 16KB ROM bank into 0x4000–0x7FFF window
  switchRomBank(bankId) {
    const cleanBank = Math.max(1, Math.min(63, Number(bankId) || 1));
    this.hLoadedROMBank = cleanBank;
    return cleanBank;
  }

  // Bank 0 FarCall_hl / Bankswitch Routine (home/bankswitch.asm):
  // 1. Push current bank onto stack -> 2. Jump via Bank 0 -> 3. Write target bank to MBC3 -> 4. Run target -> 5. Restore caller bank
  farCall(targetBank, callback) {
    const prevBank = this.hLoadedROMBank;
    this.bankStack.push(prevBank);
    try {
      this.switchRomBank(targetBank);
      return callback();
    } finally {
      const restored = this.bankStack.pop() ?? prevBank;
      this.switchRomBank(restored);
    }
  }

  // 3 & 4. Dynamic Tile Block Mapping + Overworld Connection Vector Stitching into wOverworldMap WRAM
  loadMapIntoWRAM(zone) {
    if (!zone) return;
    const w = zone.width;
    const h = zone.height;
    const stride = w + 6;
    const totalH = h + 6;
    const needed = stride * totalH;
    if (this.wOverworldMap.length < needed) {
      this.wOverworldMap = new Uint8Array(needed);
    }
    this.wOverworldMapStride = stride;
    this.wCurMapConst = zone.constName;
    this.wOverworldMap.fill(zone.borderBlock, 0, needed);

    // FarCall into zone's ROM bank to stream compressed blocks into WRAM center
    const curBlocks = this.farCall(zone.romBank, () => unpackBytes(zone.blocks));
    this.wCurMapBlocks = curBlocks;
    for (let by = 0; by < h; by++) {
      const srcRow = by * w;
      const dstRow = (by + 3) * stride + 3;
      for (let bx = 0; bx < w; bx++) {
        this.wOverworldMap[dstRow + bx] = curBlocks[srcRow + bx];
      }
    }

    // Stitch 3-block border strips from connected neighbor maps using FarCall across ROM banks
    const conns = zone.connections || {};
    if ((zone.connectionsByte & 8) && conns.north) {
      const target = this.zonesByConst[conns.north.targetConst];
      if (target) {
        const nb = this.farCall(target.romBank, () => unpackBytes(target.blocks));
        for (let by = -3; by < 0; by++) {
          const ty = target.height + by;
          if (ty < 0 || ty >= target.height) continue;
          for (let bx = -3; bx < w + 3; bx++) {
            const tx = bx - conns.north.offset;
            if (tx >= 0 && tx < target.width) {
              this.wOverworldMap[(by + 3) * stride + (bx + 3)] =
                nb[ty * target.width + tx];
            }
          }
        }
      }
    }
    if ((zone.connectionsByte & 4) && conns.south) {
      const target = this.zonesByConst[conns.south.targetConst];
      if (target) {
        const nb = this.farCall(target.romBank, () => unpackBytes(target.blocks));
        for (let by = h; by < h + 3; by++) {
          const ty = by - h;
          if (ty < 0 || ty >= target.height) continue;
          for (let bx = -3; bx < w + 3; bx++) {
            const tx = bx - conns.south.offset;
            if (tx >= 0 && tx < target.width) {
              this.wOverworldMap[(by + 3) * stride + (bx + 3)] =
                nb[ty * target.width + tx];
            }
          }
        }
      }
    }
    if ((zone.connectionsByte & 2) && conns.west) {
      const target = this.zonesByConst[conns.west.targetConst];
      if (target) {
        const nb = this.farCall(target.romBank, () => unpackBytes(target.blocks));
        for (let by = -3; by < h + 3; by++) {
          const ty = by - conns.west.offset;
          if (ty < 0 || ty >= target.height) continue;
          for (let bx = -3; bx < 0; bx++) {
            const tx = target.width + bx;
            if (tx >= 0 && tx < target.width) {
              this.wOverworldMap[(by + 3) * stride + (bx + 3)] =
                nb[ty * target.width + tx];
            }
          }
        }
      }
    }
    if ((zone.connectionsByte & 1) && conns.east) {
      const target = this.zonesByConst[conns.east.targetConst];
      if (target) {
        const nb = this.farCall(target.romBank, () => unpackBytes(target.blocks));
        for (let by = -3; by < h + 3; by++) {
          const ty = by - conns.east.offset;
          if (ty < 0 || ty >= target.height) continue;
          for (let bx = w; bx < w + 3; bx++) {
            const tx = bx - w;
            if (tx >= 0 && tx < target.width) {
              this.wOverworldMap[(by + 3) * stride + (bx + 3)] =
                nb[ty * target.width + tx];
            }
          }
        }
      }
    }
  }

  getOrCreateImageData(canvas, ctx, w, h) {
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    if (
      !canvas._cachedImgData ||
      canvas._cachedImgData.width !== w ||
      canvas._cachedImgData.height !== h
    ) {
      canvas._cachedImgData = ctx.createImageData(w, h);
    }
    return canvas._cachedImgData;
  }

  getPaletteColors(palName, mode = this.paletteMode) {
    if (mode === "reference") {
      // Exact match to the user's Pallet Town reference image (subtle lavender-white paper bg + crisp 4-shade grays)
      if (palName === "PAL_PALLET") {
        return [
          [252, 246, 255],
          [184, 184, 184],
          [112, 112, 112],
          [20, 20, 20],
        ];
      }
      return [
        [250, 250, 250],
        [182, 182, 182],
        [110, 110, 110],
        [20, 20, 20],
      ];
    }
    if (mode === "dmg") {
      return [
        [224, 248, 208],
        [136, 192, 112],
        [52, 104, 86],
        [8, 24, 32],
      ];
    }
    if (mode === "cgb") {
      return (
        this.palettes.cgb[palName] ||
        this.palettes.cgb.PAL_ROUTE || [
          [255, 255, 255],
          [140, 230, 80],
          [90, 180, 255],
          [24, 24, 24],
        ]
      );
    }
    // SGB
    return (
      this.palettes.sgb[palName] ||
      this.palettes.sgb.PAL_ROUTE || [
        [255, 255, 247],
        [189, 214, 156],
        [189, 222, 255],
        [49, 49, 49],
      ]
    );
  }

  getSpriteAccentColor(spriteKey, mode = this.paletteMode, basePal) {
    if (mode !== "cgb") {
      return basePal[1];
    }
    if (
      spriteKey === "pikachu" ||
      spriteKey === "surfing_pikachu" ||
      spriteKey === "Zapdos"
    ) {
      return [255, 208, 0];
    }
    if (
      spriteKey === "red" ||
      spriteKey === "red_bike" ||
      spriteKey === "poke_ball" ||
      spriteKey === "mom" ||
      spriteKey === "flare"
    ) {
      return [235, 45, 45];
    }
    if (
      spriteKey === "blue" ||
      spriteKey === "officer_jenny" ||
      spriteKey === "guard" ||
      spriteKey === "sailor" ||
      spriteKey === "lance" ||
      spriteKey === "swimmer"
    ) {
      return [55, 115, 245];
    }
    if (
      spriteKey === "girl" ||
      spriteKey === "nurse" ||
      spriteKey === "chansey" ||
      spriteKey === "clefairy" ||
      spriteKey === "jigglypuff" ||
      spriteKey === "jessie" ||
      spriteKey === "daisy" ||
      spriteKey === "beauty" ||
      spriteKey === "lorelei"
    ) {
      return [245, 95, 155];
    }
    if (
      spriteKey === "bulbasaur" ||
      spriteKey === "oddish" ||
      spriteKey === "safari_zone_worker" ||
      spriteKey === "koga"
    ) {
      return [50, 195, 75];
    }
    if (
      spriteKey === "james" ||
      spriteKey === "channeler" ||
      spriteKey === "agatha" ||
      spriteKey === "mr_fuji"
    ) {
      return [170, 95, 235];
    }
    return [215, 130, 55];
  }

  // Get block ID at (bx, by) in a zone using the pre-stitched wOverworldMap WRAM buffer!
  getBlockAt(zone, bx, by) {
    if (!zone) return 0;
    if (this.wCurMapConst === zone.constName && this.wOverworldMapStride > 0) {
      if (bx >= -3 && bx < zone.width + 3 && by >= -3 && by < zone.height + 3) {
        return this.wOverworldMap[(by + 3) * this.wOverworldMapStride + (bx + 3)];
      }
      return zone.borderBlock;
    }
    if (bx >= 0 && bx < zone.width && by >= 0 && by < zone.height) {
      return zone.blockBytes[by * zone.width + bx];
    }
    const conns = zone.connections || {};
    // Check North connection (by in -3..-1)
    if (by < 0 && by >= -3 && conns.north) {
      const target = this.zonesByConst[conns.north.targetConst];
      if (target) {
        const tx = bx - conns.north.offset;
        const ty = target.height + by;
        if (tx >= 0 && tx < target.width && ty >= 0 && ty < target.height) {
          return target.blockBytes[ty * target.width + tx];
        }
      }
    }
    // Check South connection (by in height..height+2)
    if (by >= zone.height && by < zone.height + 3 && conns.south) {
      const target = this.zonesByConst[conns.south.targetConst];
      if (target) {
        const tx = bx - conns.south.offset;
        const ty = by - zone.height;
        if (tx >= 0 && tx < target.width && ty >= 0 && ty < target.height) {
          return target.blockBytes[ty * target.width + tx];
        }
      }
    }
    // Check West connection (bx in -3..-1)
    if (bx < 0 && bx >= -3 && conns.west) {
      const target = this.zonesByConst[conns.west.targetConst];
      if (target) {
        const tx = target.width + bx;
        const ty = by - conns.west.offset;
        if (tx >= 0 && tx < target.width && ty >= 0 && ty < target.height) {
          return target.blockBytes[ty * target.width + tx];
        }
      }
    }
    // Check East connection (bx in width..width+2)
    if (bx >= zone.width && bx < zone.width + 3 && conns.east) {
      const target = this.zonesByConst[conns.east.targetConst];
      if (target) {
        const tx = bx - zone.width;
        const ty = by - conns.east.offset;
        if (tx >= 0 && tx < target.width && ty >= 0 && ty < target.height) {
          return target.blockBytes[ty * target.width + tx];
        }
      }
    }
    return zone.borderBlock;
  }

  // Get 8x8 tile ID at 8x8 tile coordinate (tx, ty) in zone
  getTileIdAt8x8(zone, tx, ty) {
    if (!zone) return 0;
    const stepX = Math.floor(tx / 2);
    const stepY = Math.floor(ty / 2);
    if (this.cutTrees && this.cutTrees.has(`${zone.constName}:${stepX},${stepY}`)) {
      return zone.tileset === "GYM" ? 0x11 : 0x2c;
    }
    const bx = Math.floor(tx / 4);
    const by = Math.floor(ty / 4);
    const subX = ((tx % 4) + 4) % 4;
    const subY = ((ty % 4) + 4) % 4;
    const blockId = this.getBlockAt(zone, bx, by);
    const ts = this.tilesetsByConst[zone.tileset];
    if (!ts) return 0;
    const bst = this.bstData[ts.bstKey];
    if (!bst) return 0;
    const offset = blockId * 16 + subY * 4 + subX;
    return offset >= 0 && offset < bst.length ? bst[offset] : 0;
  }

  // In Pokémon Gen I (engine/overworld/player_state.asm _GetTileAndCoordsInFrontOfPlayer),
  // each 16x16 step cell (stepX, stepY) uses its lower-left 8x8 tile (stepX*2, stepY*2 + 1)
  // for passability, grass, warp tiles, ledges, and pair collisions!
  getCollisionTileAtStep(zone, stepX, stepY) {
    return this.getTileIdAt8x8(zone, stepX * 2, stepY * 2 + 1);
  }

  isStepPassable(zone, fromStepX, fromStepY, toStepX, toStepY) {
    if (!zone) return false;
    const ts = this.tilesetsByConst[zone.tileset];
    if (!ts) return false;
    const targetTile = this.getCollisionTileAtStep(zone, toStepX, toStepY);
    if (!ts.passableSet.has(targetTile)) {
      return false;
    }
    // Check elevation pair collisions (data/tilesets/pair_collision_tile_ids.asm)
    const fromTile = this.getCollisionTileAtStep(zone, fromStepX, fromStepY);
    for (const [tsName, t1, t2] of this.data.tilesets.pairCollisions) {
      if (tsName === zone.tileset) {
        if (
          (fromTile === t1 && targetTile === t2) ||
          (fromTile === t2 && targetTile === t1)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  // Check if moving in `dir` ("DOWN" | "LEFT" | "RIGHT") from (stepX, stepY) triggers a ledge hop
  canJumpLedge(zone, stepX, stepY, dir) {
    if (zone.tileset !== "OVERWORLD") return false;
    const standTile = this.getCollisionTileAtStep(zone, stepX, stepY);
    const dx = dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0;
    const dy = dir === "DOWN" ? 1 : 0;
    if (dx === 0 && dy === 0) return false;
    const frontTile = this.getCollisionTileAtStep(zone, stepX + dx, stepY + dy);
    for (const l of this.data.tilesets.ledges) {
      if (l.dir === dir && l.standTile === standTile && l.ledgeTile === frontTile) {
        return true;
      }
    }
    return false;
  }

  // Draw a single 8x8 background tile into an RGBA Uint8ClampedArray buffer
  drawTile8x8(
    buf,
    bufW,
    bufH,
    destX,
    destY,
    ts,
    tileId,
    pal
  ) {
    const sheet = this.gfxSheets[ts.gfxKey];
    if (!sheet) return;

    // Check flower animation on tile $03 (home/vcopy.asm)
    if (tileId === 0x03 && ts.anim === "WATER_FLOWER") {
      let fIdx = 0;
      if (this.animateTiles) {
        const c = this.animCounter & 3;
        fIdx = c < 2 ? 0 : c === 2 ? 1 : 2;
      }
      const fPixels = this.flowerFrames[fIdx];
      for (let py = 0; py < 8; py++) {
        const dy = destY + py;
        if (dy < 0 || dy >= bufH) continue;
        for (let px = 0; px < 8; px++) {
          const dx = destX + px;
          if (dx < 0 || dx >= bufW) continue;
          const val = fPixels[py * 8 + px];
          const c = pal[3 - val];
          const off = (dy * bufW + dx) * 4;
          buf[off] = c[0];
          buf[off + 1] = c[1];
          buf[off + 2] = c[2];
          buf[off + 3] = 255;
        }
      }
      return;
    }

    const tileCol = tileId & 0x0f;
    const tileRow = tileId >> 4;
    const srcX0 = tileCol * 8;
    const srcY0 = tileRow * 8;
    if (srcY0 + 8 > sheet.height) return;

    // Check water ripple shift on tile $14
    let waterShift = 0;
    if (
      tileId === 0x14 &&
      this.animateTiles &&
      (ts.anim === "WATER" || ts.anim === "WATER_FLOWER")
    ) {
      const c = this.animCounter & 7;
      waterShift = c < 4 ? c : 8 - c;
    }

    for (let py = 0; py < 8; py++) {
      const dy = destY + py;
      if (dy < 0 || dy >= bufH) continue;
      const sy = srcY0 + py;
      for (let px = 0; px < 8; px++) {
        const dx = destX + px;
        if (dx < 0 || dx >= bufW) continue;
        const sx = srcX0 + ((px + waterShift) & 7);
        const val = sheet.pixels[sy * sheet.width + sx];
        const c = pal[3 - val];
        const off = (dy * bufW + dx) * 4;
        buf[off] = c[0];
        buf[off + 1] = c[1];
        buf[off + 2] = c[2];
        buf[off + 3] = 255;
      }
    }
  }

  // Draw a 16x16 OAM sprite into RGBA buffer with Game Boy OBP0 transparency
  drawSprite16x16(
    buf,
    bufW,
    bufH,
    destX,
    destY,
    spriteKey,
    dir = "DOWN",
    walking = false,
    flipWalk = false,
    pal,
    underGrass = false,
    zone = null,
    stepX = 0,
    stepY = 0
  ) {
    const sheet = this.spriteSheets[spriteKey] || this.spriteSheets.red;
    if (!sheet) return;

      let frameIdx = 0;
      let flipX = false;

      if (sheet.height >= 96) {
        if (dir === "DOWN") {
          frameIdx = walking ? 3 : 0;
          flipX = walking && flipWalk;
        } else if (dir === "UP") {
          frameIdx = walking ? 4 : 1;
          flipX = walking && flipWalk;
        } else if (dir === "LEFT") {
          frameIdx = walking ? 5 : 2;
          flipX = false;
        } else if (dir === "RIGHT") {
          frameIdx = walking ? 5 : 2;
          flipX = true;
        }
      } else if (sheet.height >= 48) {
        if (dir === "DOWN") frameIdx = 0;
        else if (dir === "UP") frameIdx = 1;
        else if (dir === "LEFT") frameIdx = 2;
        else if (dir === "RIGHT") {
          frameIdx = 2;
          flipX = true;
        }
      } else {
        frameIdx = 0;
      }

      if ((frameIdx + 1) * 16 > sheet.height) {
        frameIdx = 0;
      }
      const srcY0 = frameIdx * 16;
      const accent = this.getSpriteAccentColor(spriteKey, this.paletteMode, pal);

    for (let py = 0; py < 16; py++) {
      const dy = destY + py;
      if (dy < 0 || dy >= bufH) continue;
      for (let px = 0; px < 16; px++) {
        const dx = destX + px;
        if (dx < 0 || dx >= bufW) continue;
        const sx = flipX ? 15 - px : px;
        const val = sheet.pixels[(srcY0 + py) * sheet.width + sx];
        // In Game Boy OAM (rOBP0): val 3 is transparent, val 2 is white (pal[0]), val 1 is accent/gray (pal[1]), val 0 is black (pal[3])
        if (val === 3) continue;
        // Authentic tall-grass masking on bottom half of sprite
        if (underGrass && py >= 8 && ((px + py) & 1) === 0) continue;

        const c = val === 2 ? pal[0] : val === 1 ? accent : pal[3];
        const off = (dy * bufW + dx) * 4;
        buf[off] = c[0];
        buf[off + 1] = c[1];
        buf[off + 2] = c[2];
        buf[off + 3] = 255;
      }
    }
  }

  // Render an entire zone segment (width*32 x height*32 pixels) onto a Canvas
  renderFullZone(
    canvas,
    zone,
    options = {}
  ) {
    const {
      showBorder = false,
      showEntities = true,
      showWarps = false,
      showGrid = false,
      showHiddenObjects = false,
      playerState = null,
      pikachuState = null,
      npcStates = null,
    } = options;

    const borderBlocks = showBorder ? 1 : 0;
    const totalBlocksW = zone.width + borderBlocks * 2;
    const totalBlocksH = zone.height + borderBlocks * 2;
    const pxW = totalBlocksW * 32;
    const pxH = totalBlocksH * 32;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = this.getOrCreateImageData(canvas, ctx, pxW, pxH);
    const buf = imgData.data;

    const ts = this.tilesetsByConst[zone.tileset];
    const bst = this.bstData[ts.bstKey];
    const pal = this.getPaletteColors(zone.palette);

    for (let by = -borderBlocks; by < zone.height + borderBlocks; by++) {
      for (let bx = -borderBlocks; bx < zone.width + borderBlocks; bx++) {
        const blockId = this.getBlockAt(zone, bx, by);
        const destBlockX = (bx + borderBlocks) * 32;
        const destBlockY = (by + borderBlocks) * 32;
        for (let ty = 0; ty < 4; ty++) {
          for (let tx = 0; tx < 4; tx++) {
            const stepX = bx * 2 + Math.floor(tx / 2);
            const stepY = by * 2 + Math.floor(ty / 2);
            const isCut =
              this.cutTrees &&
              this.cutTrees.has(`${zone.constName}:${stepX},${stepY}`);
            const tileId = isCut
              ? zone.tileset === "GYM"
                ? 0x11
                : 0x2c
              : bst[blockId * 16 + ty * 4 + tx] || 0;
            this.drawTile8x8(
              buf,
              pxW,
              pxH,
              destBlockX + tx * 8,
              destBlockY + ty * 8,
              ts,
              tileId,
              pal
            );
          }
        }
      }
    }

    const originPx = borderBlocks * 32;

    if (showEntities) {
      // Draw zone objects (NPCs, items, trainers)
      const list = npcStates || zone.objects;
      for (const obj of list) {
        if (!obj.defaultVisible && !showHiddenObjects) continue;
        if (obj.collected) continue;
        const sprKey = this.spriteConstToKey[obj.sprite] || "red";
        const ox = originPx + Math.round((obj.renderX ?? obj.x) * 16);
        const oy = originPx + Math.round((obj.renderY ?? obj.y) * 16) - 4;
        const dir =
          obj.facing ||
          (obj.dir === "UP" || obj.dir === "DOWN" || obj.dir === "LEFT" || obj.dir === "RIGHT"
            ? obj.dir
            : "DOWN");
        const onGrass =
          this.getCollisionTileAtStep(
            zone,
            Math.round(obj.renderX ?? obj.x),
            Math.round(obj.renderY ?? obj.y)
          ) === ts.grassTile;
        this.drawSprite16x16(
          buf,
          pxW,
          pxH,
          ox,
          oy,
          sprKey,
          dir,
          Boolean(obj.isWalking),
          Boolean(obj.stepParity),
          pal,
          onGrass
        );
      }

      // Draw following Pikachu & Player if in this zone (ShouldPikachuSpawn: only when walking!)
      if (
        pikachuState &&
        pikachuState.visible &&
        (!playerState || playerState.mode === "walk")
      ) {
        const px = originPx + Math.round(pikachuState.renderX * 16);
        const py = originPx + Math.round(pikachuState.renderY * 16) - 4;
        const onGrass =
          this.getCollisionTileAtStep(
            zone,
            Math.round(pikachuState.renderX),
            Math.round(pikachuState.renderY)
          ) === ts.grassTile;
        this.drawSprite16x16(
          buf,
          pxW,
          pxH,
          px,
          py,
          "pikachu",
          pikachuState.dir,
          pikachuState.walking,
          pikachuState.stepParity,
          pal,
          onGrass
        );
      }

      if (playerState) {
        const rx = originPx + Math.round(playerState.renderX * 16);
        const ry = originPx + Math.round(playerState.renderY * 16) - 4;
        const onGrass =
          this.getCollisionTileAtStep(
            zone,
            Math.round(playerState.renderX),
            Math.round(playerState.renderY)
          ) === ts.grassTile;
        const sprKey =
          playerState.mode === "bike"
            ? "red_bike"
            : playerState.mode === "surf"
            ? playerState.surfSprite || "seel"
            : "red";
        this.drawSprite16x16(
          buf,
          pxW,
          pxH,
          rx,
          ry,
          sprKey,
          playerState.dir,
          playerState.walking,
          playerState.stepParity,
          pal,
          onGrass
        );
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Optional overlays (Collision grid, Warp markers, Sign markers, Connection borders)
    if (showBorder && borderBlocks > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 204, 0, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(originPx + 0.5, originPx + 0.5, zone.width * 32 - 1, zone.height * 32 - 1);
      ctx.restore();
    }

    if (showGrid) {
      ctx.save();
      ctx.font = "bold 7px monospace";
      for (let sy = 0; sy < zone.height * 2; sy++) {
        for (let sx = 0; sx < zone.width * 2; sx++) {
          const tileId = this.getCollisionTileAtStep(zone, sx, sy);
          const passable = ts.passableSet.has(tileId);
          const isGrass = tileId === ts.grassTile;
          const gx = originPx + sx * 16;
          const gy = originPx + sy * 16;
          if (!passable) {
            ctx.fillStyle = "rgba(220, 38, 38, 0.26)";
            ctx.fillRect(gx, gy, 16, 16);
          } else if (isGrass) {
            ctx.fillStyle = "rgba(34, 197, 94, 0.28)";
            ctx.fillRect(gx, gy, 16, 16);
          }
          ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
          ctx.strokeRect(gx + 0.5, gy + 0.5, 15, 15);
        }
      }
      ctx.restore();
    }

    if (showWarps) {
      ctx.save();
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      zone.warps.forEach((w, idx) => {
        const wx = originPx + w.x * 16;
        const wy = originPx + w.y * 16;
        ctx.fillStyle = "rgba(37, 99, 235, 0.88)";
        ctx.fillRect(wx + 1, wy + 1, 14, 14);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(wx + 1.5, wy + 1.5, 13, 13);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`W${idx + 1}`, wx + 8, wy + 8);
      });
      zone.signs.forEach((s, idx) => {
        const sx = originPx + s.x * 16;
        const sy = originPx + s.y * 16;
        ctx.fillStyle = "rgba(217, 119, 6, 0.88)";
        ctx.fillRect(sx + 1, sy + 1, 14, 14);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 1.5, sy + 1.5, 13, 13);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`S${idx + 1}`, sx + 8, sy + 8);
      });
      ctx.restore();
    }
  }

  // Render authentic 160x144 Game Boy viewport centered on Player
  renderGameBoyViewport(
    canvas,
    zone,
    playerState,
    pikachuState,
    npcStates,
    showHiddenObjects = false,
    activeEmote = null
  ) {
    const W = 160;
    const H = 144;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = this.getOrCreateImageData(canvas, ctx, W, H);
    const buf = imgData.data;

    const ts = this.tilesetsByConst[zone.tileset];
    const bst = this.bstData[ts.bstKey];
    const pal = this.getPaletteColors(zone.palette);

    // In Pokémon Yellow, player is rendered at screen (64, 60) [tile (8, 8) minus 4px vertical sprite offset]
    const camX = Math.round(playerState.renderX * 16) - 64;
    const camY = Math.round(playerState.renderY * 16) - 64;

    const startTileX = Math.floor(camX / 8) - 1;
    const endTileX = Math.ceil((camX + W) / 8) + 1;
    const startTileY = Math.floor(camY / 8) - 1;
    const endTileY = Math.ceil((camY + H) / 8) + 1;

    for (let ty = startTileY; ty <= endTileY; ty++) {
      const by = Math.floor(ty / 4);
      const subY = ((ty % 4) + 4) % 4;
      const screenY = ty * 8 - camY;
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const bx = Math.floor(tx / 4);
        const subX = ((tx % 4) + 4) % 4;
        const stepX = Math.floor(tx / 2);
        const stepY = Math.floor(ty / 2);
        const isCut =
          this.cutTrees &&
          this.cutTrees.has(`${zone.constName}:${stepX},${stepY}`);
        const blockId = this.getBlockAt(zone, bx, by);
        const tileId = isCut
          ? zone.tileset === "GYM"
            ? 0x11
            : 0x2c
          : bst[blockId * 16 + subY * 4 + subX] || 0;
        const screenX = tx * 8 - camX;
        this.drawTile8x8(buf, W, H, screenX, screenY, ts, tileId, pal);
      }
    }

    // Dark cave shadow in Rock Tunnel when HM05 FLASH has not been used
    if (
      (zone.constName === "ROCK_TUNNEL_1F" ||
        zone.constName === "ROCK_TUNNEL_B1F") &&
      !this.flashIlluminated
    ) {
      const darkColor = pal[3];
      for (let py = 0; py < H; py++) {
        const dy = py - 68;
        for (let px = 0; px < W; px++) {
          const dx = px - 72;
          const distSq = dx * dx + dy * dy;
          if (distSq > 784) {
            const off = (py * W + px) * 4;
            buf[off] = darkColor[0];
            buf[off + 1] = darkColor[1];
            buf[off + 2] = darkColor[2];
          }
        }
      }
    }

    // Draw NPCs
    const list = npcStates || zone.objects;
    for (const obj of list) {
      if (!obj.defaultVisible && !showHiddenObjects) continue;
      if (obj.collected) continue;
      const sprKey = this.spriteConstToKey[obj.sprite] || "red";
      const sx = Math.round((obj.renderX ?? obj.x) * 16) - camX;
      const sy = Math.round((obj.renderY ?? obj.y) * 16) - camY - 4;
      if (sx < -16 || sx > W || sy < -16 || sy > H) continue;
      const dir =
        obj.facing ||
        (obj.dir === "UP" || obj.dir === "DOWN" || obj.dir === "LEFT" || obj.dir === "RIGHT"
          ? obj.dir
          : "DOWN");
      const onGrass =
        this.getCollisionTileAtStep(
          zone,
          Math.round(obj.renderX ?? obj.x),
          Math.round(obj.renderY ?? obj.y)
        ) === ts.grassTile;
      this.drawSprite16x16(
        buf,
        W,
        H,
        sx,
        sy,
        sprKey,
        dir,
        Boolean(obj.isWalking),
        Boolean(obj.stepParity),
        pal,
        onGrass
      );
    }

    // Draw Pikachu follower (ShouldPikachuSpawn: only when wWalkBikeSurfState == 0 / walking)
    if (
      pikachuState &&
      pikachuState.visible &&
      playerState.mode === "walk"
    ) {
      const px = Math.round(pikachuState.renderX * 16) - camX;
      const py = Math.round(pikachuState.renderY * 16) - camY - 4;
      const onGrass =
        this.getCollisionTileAtStep(
          zone,
          Math.round(pikachuState.renderX),
          Math.round(pikachuState.renderY)
        ) === ts.grassTile;
      this.drawSprite16x16(
        buf,
        W,
        H,
        px,
        py,
        "pikachu",
        pikachuState.dir,
        pikachuState.walking,
        pikachuState.stepParity,
        pal,
        onGrass
      );
      if (activeEmote && this.emotes[activeEmote]) {
        this.drawRaw2BitSprite(
          buf,
          W,
          H,
          px,
          py - 16,
          this.emotes[activeEmote],
          pal,
          false
        );
      }
    }

    // Draw Player (Red)
    const rx = Math.round(playerState.renderX * 16) - camX;
    const ry = Math.round(playerState.renderY * 16) - camY - 4;
    const onGrass =
      this.getCollisionTileAtStep(
        zone,
        Math.round(playerState.renderX),
        Math.round(playerState.renderY)
      ) === ts.grassTile;
    const sprKey =
      playerState.mode === "bike"
        ? "red_bike"
        : playerState.mode === "surf"
        ? playerState.surfSprite || "seel"
        : "red";
    this.drawSprite16x16(
      buf,
      W,
      H,
      rx,
      ry,
      sprKey,
      playerState.dir,
      playerState.walking,
      playerState.stepParity,
      pal,
      onGrass
    );

    ctx.putImageData(imgData, 0, 0);
  }

  drawRaw2BitSprite(buf, bufW, bufH, destX, destY, spriteObj, pal, opaqueBg = true) {
    if (!spriteObj) return;
    for (let py = 0; py < spriteObj.height; py++) {
      const dy = destY + py;
      if (dy < 0 || dy >= bufH) continue;
      for (let px = 0; px < spriteObj.width; px++) {
        const dx = destX + px;
        if (dx < 0 || dx >= bufW) continue;
        const val = spriteObj.pixels[py * spriteObj.width + px];
        if (!opaqueBg && val === 3) continue;
        const c = pal[3 - val];
        const off = (dy * bufW + dx) * 4;
        buf[off] = c[0];
        buf[off + 1] = c[1];
        buf[off + 2] = c[2];
        buf[off + 3] = 255;
      }
    }
  }

  render2BitGraphicToCanvas(canvas, spriteObj, palName = "PAL_YELLOWMON") {
    if (!canvas || !spriteObj) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = this.getOrCreateImageData(
      canvas,
      ctx,
      spriteObj.width,
      spriteObj.height
    );
    const pal = this.getPaletteColors(palName);
    this.drawRaw2BitSprite(
      imgData.data,
      spriteObj.width,
      spriteObj.height,
      0,
      0,
      spriteObj,
      pal,
      true
    );
    ctx.putImageData(imgData, 0, 0);
  }

  // Render species-specific sprite indicator for Party Menu (data/pokemon/menu_icons.asm & species sprites)
  renderPartyMonIcon(canvas, mon) {
    if (!canvas || !mon) return;
    const sp = String(mon.species || "PIKACHU").toUpperCase();
    const dedicated16x16 = {
      PIKACHU:
        Array.isArray(mon.moves) && mon.moves.some((m) => m.id === "SURF")
          ? "surfing_pikachu"
          : "pikachu",
      BULBASAUR: "bulbasaur",
      ODDISH: "oddish",
      GLOOM: "oddish",
      VILEPLUME: "oddish",
      CHANSEY: "chansey",
      CLEFAIRY: "clefairy",
      CLEFABLE: "clefairy",
      JIGGLYPUFF: "jigglypuff",
      WIGGLYTUFF: "jigglypuff",
      SANDSHREW: "sandshrew",
      SANDSLASH: "sandshrew",
      SNORLAX: "snorlax",
      SEEL: "seel",
      DEWGONG: "seel",
      VOLTORB: "poke_ball",
      ELECTRODE: "poke_ball",
      OMANYTE: "fossil",
      OMASTAR: "fossil",
      KABUTO: "fossil",
      KABUTOPS: "fossil",
    };

    const pal = this.getPaletteColors("PAL_YELLOWMON");
    const spr16Key = dedicated16x16[sp];
    if (spr16Key && this.spriteSheets[spr16Key]) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imgData = this.getOrCreateImageData(canvas, ctx, 16, 16);
      imgData.data.fill(0);
      this.drawSprite16x16(
        imgData.data,
        16,
        16,
        0,
        0,
        spr16Key,
        "DOWN",
        (this.animCounter & 1) === 1,
        false,
        pal,
        false
      );
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // For all other species, render their tight-cropped specific species sprite with transparent background
    const spriteObj = this.pokemonSprites[sp] || this.pokemonSprites.PIKACHU;
    if (!spriteObj) return;
    if (!spriteObj._bbox) {
      let minX = spriteObj.width,
        minY = spriteObj.height,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < spriteObj.height; y++) {
        for (let x = 0; x < spriteObj.width; x++) {
          if (spriteObj.pixels[y * spriteObj.width + x] !== 3) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX) {
        minX = 0;
        minY = 0;
        maxX = spriteObj.width - 1;
        maxY = spriteObj.height - 1;
      }
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const side = Math.max(bw, bh);
      spriteObj._bbox = { minX, minY, bw, bh, side };
    }

    const { minX, minY, bw, bh, side } = spriteObj._bbox;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = this.getOrCreateImageData(canvas, ctx, side, side);
    const buf = imgData.data;
    buf.fill(0);
    const padX = Math.floor((side - bw) / 2);
    const padY = Math.floor((side - bh) / 2);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const val = spriteObj.pixels[(minY + y) * spriteObj.width + (minX + x)];
        if (val === 3) continue;
        const c = pal[3 - val];
        const off = ((padY + y) * side + (padX + x)) * 4;
        buf[off] = c[0];
        buf[off + 1] = c[1];
        buf[off + 2] = c[2];
        buf[off + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }
}
