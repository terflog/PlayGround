import { POKEYELLOW_DATA } from "./data/pokeyellow-data.js";
import { PokeYellowEngine } from "./engine.js";
import { GameBoyAudio } from "./audio.js";

const engine = new PokeYellowEngine(POKEYELLOW_DATA);
const audio = new GameBoyAudio(POKEYELLOW_DATA.music);

// State
const state = {
  currentZone: engine.zonesByConst.PALLET_TOWN,
  lastOutdoorMap: { mapConst: "PALLET_TOWN", warpIndex: 0 },
  viewMode: "split", // "split" | "zone" | "gb"
  showBorder: false,
  showEntitiesOnZoneMap: false, // Default false so the Full Zone Map matches the clean Pallet Town reference image 1:1 on load!
  showWarpsOnZoneMap: false,
  showGridOnZoneMap: false,
  showHiddenObjects: false,
  noClip: false,
  autoSurf: true,
  wildEncountersEnabled: true,
  zoneZoom: "fit", // "fit" | 1 | 2 | 3
  categoryFilter: "canonical220", // "canonical220" | "town" | "route" | "indoor" | "dungeon" | "all224"
  searchQuery: "",
  townMapFilterCoords: null,
  visitedZones: new Set(["PALLET_TOWN"]),
  caughtPokemon: new Set(["PIKACHU"]),
  defeatedTrainers: new Set(),
  player: {
    x: 5,
    y: 6,
    renderX: 5,
    renderY: 6,
    dir: "DOWN",
    walking: false,
    stepParity: false,
    mode: "walk", // "walk" | "bike" | "surf"
    moveAnim: null,
  },
  pikachu: {
    x: 5,
    y: 5,
    renderX: 5,
    renderY: 5,
    dir: "DOWN",
    walking: false,
    stepParity: false,
    visible: true,
    friendship: 220,
    moodIndex: 0,
  },
  activeEmote: null,
  emoteTimer: null,
  npcs: [],
  dialogue: null, // { title, pages: [], pageIndex: 0, pikachuMood: null, elevatorOptions: null }
  battle: null, // { species, level, hp, maxHp, playerHp, playerMaxHp, log, caught, finished }
  selectedElevatorDest: {},
};

const PIKACHU_MOODS = [
  {
    frames: ["pikachu_heart_1", "pikachu_heart_2"],
    emote: "heart",
    title: "PIKACHU's Mood: Adoring ♥",
    text: "PIKACHU: Pika-pii! ♥\n\nPIKACHU is beaming with happiness and nuzzling close to RED!",
  },
  {
    frames: ["pikachu_2_hearts_1", "pikachu_2_hearts_2"],
    emote: "heart",
    title: "PIKACHU's Mood: Overjoyed ♥♥",
    text: "PIKACHU: Pikachuuu! ♥♥\n\nPIKACHU looks thrilled to be traveling through Kanto with you!",
  },
  {
    frames: ["pikachu_excited_1", "pikachu_excited_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Excited ♪",
    text: "PIKACHU: Pi-pika! ♪\n\nPIKACHU is hopping around energetically and ready for adventure!",
  },
  {
    frames: ["pikachu_wink_1", "pikachu_wink_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Playful ★",
    text: "PIKACHU: Pika! ★\n\nPIKACHU gave you a confident wink!",
  },
  {
    frames: ["pikachu_lightning_1", "pikachu_lightning_2"],
    emote: "bolt",
    title: "PIKACHU's Mood: Charged Up ⚡",
    text: "PIKACHU: PIKA-CHU!! ⚡\n\nStatic electricity is crackling from PIKACHU's red cheeks!",
  },
];

const ELEVATOR_FLOORS = {
  CELADON_MART_ELEVATOR: [
    { label: "1F — Service Counter", destConst: "CELADON_MART_1F", warpIndex: 4 },
    { label: "2F — Trainer's Market", destConst: "CELADON_MART_2F", warpIndex: 2 },
    { label: "3F — TV Game Shop", destConst: "CELADON_MART_3F", warpIndex: 2 },
    { label: "4F — Wiseman Gifts", destConst: "CELADON_MART_4F", warpIndex: 2 },
    { label: "5F — Drug Store", destConst: "CELADON_MART_5F", warpIndex: 2 },
  ],
  ROCKET_HIDEOUT_ELEVATOR: [
    { label: "B1F — Upper Hideout", destConst: "ROCKET_HIDEOUT_B1F", warpIndex: 3 },
    { label: "B2F — Maze Floor", destConst: "ROCKET_HIDEOUT_B2F", warpIndex: 3 },
    { label: "B4F — Giovanni's Quarters", destConst: "ROCKET_HIDEOUT_B4F", warpIndex: 1 },
  ],
  SILPH_CO_ELEVATOR: [
    { label: "1F — Reception Lobby", destConst: "SILPH_CO_1F", warpIndex: 2 },
    { label: "2F — 2nd Floor", destConst: "SILPH_CO_2F", warpIndex: 1 },
    { label: "3F — 3rd Floor", destConst: "SILPH_CO_3F", warpIndex: 1 },
    { label: "4F — 4th Floor", destConst: "SILPH_CO_4F", warpIndex: 1 },
    { label: "5F — 5th Floor", destConst: "SILPH_CO_5F", warpIndex: 1 },
    { label: "6F — 6th Floor", destConst: "SILPH_CO_6F", warpIndex: 1 },
    { label: "7F — 7th Floor", destConst: "SILPH_CO_7F", warpIndex: 1 },
    { label: "8F — 8th Floor", destConst: "SILPH_CO_8F", warpIndex: 1 },
    { label: "9F — 9th Floor", destConst: "SILPH_CO_9F", warpIndex: 1 },
    { label: "10F — 10th Floor", destConst: "SILPH_CO_10F", warpIndex: 1 },
    { label: "11F — President's Office", destConst: "SILPH_CO_11F", warpIndex: 1 },
  ],
};

const STORAGE_KEY = "pokeyellow_220_save_v1";

function saveProgress() {
  try {
    const payload = {
      visitedZones: Array.from(state.visitedZones),
      caughtPokemon: Array.from(state.caughtPokemon),
      defeatedTrainers: Array.from(state.defeatedTrainers),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.visitedZones)) {
      data.visitedZones.forEach((z) => state.visitedZones.add(z));
    }
    if (Array.isArray(data.caughtPokemon)) {
      data.caughtPokemon.forEach((p) => state.caughtPokemon.add(p));
    }
    if (Array.isArray(data.defeatedTrainers)) {
      data.defeatedTrainers.forEach((t) => state.defeatedTrainers.add(t));
    }
  } catch {
    // Ignore malformed saved state
  }
}

function getTrainerBattleEntry(npc, zone) {
  if (!npc || npc.kind === "item") return null;
  const key = `${zone.constName}:${npc.name}:${npc.id}`;
  const label = `${npc.name} ${npc.sprite} ${zone.constName}`.toUpperCase();

  if (label.includes("BROCK")) return { trainerName: "LEADER BROCK", species: "ONIX", level: 12, key };
  if (label.includes("MISTY")) return { trainerName: "LEADER MISTY", species: "STARMIE", level: 21, key };
  if (label.includes("SURGE")) return { trainerName: "LT. SURGE", species: "RAICHU", level: 28, key };
  if (label.includes("ERIKA")) return { trainerName: "LEADER ERIKA", species: "GLOOM", level: 32, key };
  if (label.includes("KOGA")) return { trainerName: "LEADER KOGA", species: "VENOMOTH", level: 50, key };
  if (label.includes("SABRINA")) return { trainerName: "LEADER SABRINA", species: "ALAKAZAM", level: 50, key };
  if (label.includes("BLAINE")) return { trainerName: "LEADER BLAINE", species: "ARCANINE", level: 54, key };
  if (label.includes("GIOVANNI")) return { trainerName: "BOSS GIOVANNI", species: "PERSIAN", level: 53, key };
  if (label.includes("LORELEI")) return { trainerName: "ELITE LORELEI", species: "LAPRAS", level: 56, key };
  if (label.includes("BRUNO")) return { trainerName: "ELITE BRUNO", species: "MACHAMP", level: 58, key };
  if (label.includes("AGATHA")) return { trainerName: "ELITE AGATHA", species: "GENGAR", level: 60, key };
  if (label.includes("LANCE")) return { trainerName: "ELITE LANCE", species: "DRAGONITE", level: 62, key };
  if (label.includes("BLUE") || label.includes("RIVAL")) return { trainerName: "RIVAL BLUE", species: "EEVEE", level: 25, key };
  if (label.includes("JESSIE") || label.includes("JAMES") || label.includes("ROCKET")) {
    return { trainerName: "TEAM ROCKET", species: "MEOWTH", level: 24, key };
  }
  if (label.includes("MEWTWO")) return { trainerName: null, species: "MEWTWO", level: 70, key };
  if (label.includes("ZAPDOS")) return { trainerName: null, species: "ZAPDOS", level: 50, key };
  if (label.includes("ARTICUNO")) return { trainerName: null, species: "ARTICUNO", level: 50, key };
  if (label.includes("MOLTRES")) return { trainerName: null, species: "MOLTRES", level: 50, key };
  if (label.includes("SNORLAX")) return { trainerName: null, species: "SNORLAX", level: 30, key };

  if (npc.kind === "trainer") {
    const pool = ["RATTATA", "PIDGEOTTO", "SANDSHREW", "NIDORINO", "KADABRA", "MACHOKE"];
    const pick = pool[(npc.id + zone.zoneNumber) % pool.length];
    return {
      trainerName: npc.name.replace(/_/g, " "),
      species: pick,
      level: Math.min(55, 10 + Math.floor(zone.zoneNumber / 5)),
      key,
    };
  }
  return null;
}

function findDefaultSpawn(zone, spawnWarpIndex = null) {
  if (spawnWarpIndex !== null && zone.warps[spawnWarpIndex]) {
    const w = zone.warps[spawnWarpIndex];
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileAtWarp = engine.getCollisionTileAtStep(zone, w.x, w.y);
    // If emerging onto an outdoor door tile, step 1 tile down if passable
    if (
      zone.romId < 0x25 &&
      ts.doorSet.has(tileAtWarp) &&
      w.y + 1 < zone.height * 2
    ) {
      return { x: w.x, y: w.y + 1, dir: "DOWN" };
    }
    return { x: w.x, y: w.y, dir: "DOWN" };
  }

  // For Pallet Town default spawn right between Red's House and Oak's Lab
  if (zone.constName === "PALLET_TOWN") {
    return { x: 5, y: 6, dir: "DOWN" };
  }

  // If the zone has warps, spawn near the first warp or center
  if (zone.warps.length > 0) {
    const w = zone.warps[0];
    if (zone.romId < 0x25 && w.y + 1 < zone.height * 2) {
      return { x: w.x, y: w.y + 1, dir: "DOWN" };
    }
    if (w.y > 0 && engine.isStepPassable(zone, w.x, w.y, w.x, w.y - 1)) {
      return { x: w.x, y: w.y - 1, dir: "UP" };
    }
    return { x: w.x, y: w.y, dir: "DOWN" };
  }

  // Otherwise find nearest passable tile to center
  const cx = Math.floor(zone.width);
  const cy = Math.floor(zone.height);
  const ts = engine.tilesetsByConst[zone.tileset];
  for (let r = 0; r < Math.max(zone.width, zone.height) * 2; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const sx = cx + dx;
        const sy = cy + dy;
        if (sx >= 0 && sx < zone.width * 2 && sy >= 0 && sy < zone.height * 2) {
          const tid = engine.getCollisionTileAtStep(zone, sx, sy);
          if (ts.passableSet.has(tid)) {
            return { x: sx, y: sy, dir: "DOWN" };
          }
        }
      }
    }
  }
  return { x: cx, y: cy, dir: "DOWN" };
}

function initZoneNpcs(zone) {
  return zone.objects.map((o) => ({
    ...o,
    x: o.x,
    y: o.y,
    originX: o.x,
    originY: o.y,
    renderX: o.x,
    renderY: o.y,
    facing:
      o.dir === "UP" || o.dir === "DOWN" || o.dir === "LEFT" || o.dir === "RIGHT"
        ? o.dir
        : "DOWN",
    isWalking: false,
    stepParity: false,
    moveAnim: null,
    collected: false,
  }));
}

export function loadZone(target, options = {}) {
  let zone = null;
  if (typeof target === "object" && target !== null) {
    zone = target;
  } else if (typeof target === "number") {
    zone = engine.zonesByNumber[target] || engine.zonesByRomId[target];
  } else if (typeof target === "string") {
    const clean = target.trim();
    if (clean.startsWith("0x") || clean.startsWith("0X")) {
      zone = engine.zonesByRomId[parseInt(clean, 16)];
    } else if (/^\d+$/.test(clean)) {
      zone = engine.zonesByNumber[parseInt(clean, 10)];
    } else {
      zone =
        engine.zonesByConst[clean.toUpperCase()] ||
        engine.allZones.find(
          (z) =>
            z.headerName.toLowerCase() === clean.toLowerCase() ||
            z.displayName.toLowerCase() === clean.toLowerCase()
        );
    }
  }
  if (!zone) return null;

  // Record outdoor map for LAST_MAP indoor exit warps
  if (state.currentZone && state.currentZone.romId < 0x25) {
    state.lastOutdoorMap = {
      mapConst: state.currentZone.constName,
      warpIndex: options.fromOutdoorWarpIndex ?? 0,
    };
  } else if (zone.romId >= 0x25 && zone.defaultParent) {
    if (!state.lastOutdoorMap || options.resetParent) {
      state.lastOutdoorMap = { ...zone.defaultParent };
    }
  }

  state.currentZone = zone;
  state.visitedZones.add(zone.constName);
  saveProgress();
  state.npcs = initZoneNpcs(zone);
  state.dialogue = null;

  const spawn =
    options.x !== undefined && options.y !== undefined
      ? { x: options.x, y: options.y, dir: options.dir || state.player.dir }
      : findDefaultSpawn(zone, options.warpIndex ?? null);

  state.player.x = spawn.x;
  state.player.y = spawn.y;
  state.player.renderX = spawn.x;
  state.player.renderY = spawn.y;
  state.player.dir = spawn.dir || "DOWN";
  state.player.walking = false;
  state.player.moveAnim = null;
  if (zone.romId >= 0x25 && state.player.mode === "bike") {
    state.player.mode = "walk";
  }

  // Place Pikachu 1 step behind Red
  const behindOffsets = {
    DOWN: [0, -1],
    UP: [0, 1],
    LEFT: [1, 0],
    RIGHT: [-1, 0],
  };
  const [bx, by] = behindOffsets[state.player.dir] || [0, -1];
  const px = Math.max(0, Math.min(zone.width * 2 - 1, spawn.x + bx));
  const py = Math.max(0, Math.min(zone.height * 2 - 1, spawn.y + by));
  state.pikachu.x = px;
  state.pikachu.y = py;
  state.pikachu.renderX = px;
  state.pikachu.renderY = py;
  state.pikachu.dir = state.player.dir;
  state.pikachu.walking = false;
  state.pikachu.moveAnim = null;

  audio.playTrack(zone.music);
  updateUIForCurrentZone();
  renderAllCanvases();
  return zone;
}

function triggerEmote(emoteKey, durationMs = 1500) {
  state.activeEmote = emoteKey;
  if (state.emoteTimer) clearTimeout(state.emoteTimer);
  state.emoteTimer = setTimeout(() => {
    state.activeEmote = null;
  }, durationMs);
}

function resolveWarpDestination(zone, warp) {
  let destConst = warp.destConst;
  let destWarpIdx = warp.destWarpIndex;
  if (destConst === "LAST_MAP") {
    if (
      state.lastOutdoorMap &&
      engine.zonesByConst[state.lastOutdoorMap.mapConst]
    ) {
      destConst = state.lastOutdoorMap.mapConst;
    } else if (zone.defaultParent) {
      destConst = zone.defaultParent.mapConst;
    } else {
      destConst = "PALLET_TOWN";
    }
  }
  // Check if we are exiting an elevator that had a floor chosen
  if (
    ELEVATOR_FLOORS[zone.constName] &&
    state.selectedElevatorDest[zone.constName]
  ) {
    const chosen = state.selectedElevatorDest[zone.constName];
    destConst = chosen.destConst;
    destWarpIdx = chosen.warpIndex;
  }
  return { destConst, destWarpIdx };
}

function checkWarpAtStep(zone, sx, sy) {
  for (let i = 0; i < zone.warps.length; i++) {
    const w = zone.warps[i];
    if (w.x === sx && w.y === sy) {
      return { warp: w, warpIdx: i };
    }
  }
  return null;
}

function isWaterTile(zone, tileId) {
  return (
    (zone.tileset === "OVERWORLD" ||
      zone.tileset === "FOREST" ||
      zone.tileset === "PLATEAU" ||
      zone.tileset === "CAVERN" ||
      zone.tileset === "SHIP_PORT") &&
    (tileId === 0x14 || tileId === 0x32 || tileId === 0x48)
  );
}

function attemptStep(dir) {
  if (state.dialogue || state.battle) return;
  if (state.player.moveAnim) return;

  const zone = state.currentZone;
  state.player.dir = dir;

  const dx = dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0;
  const dy = dir === "UP" ? -1 : dir === "DOWN" ? 1 : 0;
  const targetX = state.player.x + dx;
  const targetY = state.player.y + dy;

  // 1. Check if standing on a warp tile at the edge of an indoor room and pressing outward
  const standingWarp = checkWarpAtStep(zone, state.player.x, state.player.y);
  if (standingWarp) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const curTile = engine.getCollisionTileAtStep(
      zone,
      state.player.x,
      state.player.y
    );
    const pushingOut =
      (dir === "DOWN" && state.player.y === zone.height * 2 - 1) ||
      (dir === "UP" && state.player.y === 0) ||
      (dir === "LEFT" && state.player.x === 0) ||
      (dir === "RIGHT" && state.player.x === zone.width * 2 - 1) ||
      (zone.romId >= 0x25 && dir === "DOWN" && ts.warpSet.has(curTile));
    if (pushingOut) {
      const { destConst, destWarpIdx } = resolveWarpDestination(
        zone,
        standingWarp.warp
      );
      audio.playSfx("warp");
      loadZone(destConst, {
        warpIndex: destWarpIdx,
        fromOutdoorWarpIndex: standingWarp.warpIdx,
      });
      return;
    }
  }

  // 2. Check map border connections (North / South / West / East seamless transition!)
  const conns = zone.connections || {};
  if (targetY < 0 && conns.north) {
    const targetZone = engine.zonesByConst[conns.north.targetConst];
    if (targetZone) {
      const newX = targetX - conns.north.offset * 2;
      const newY = targetZone.height * 2 - 1;
      if (newX >= 0 && newX < targetZone.width * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "UP" });
        return;
      }
    }
  }
  if (targetY >= zone.height * 2 && conns.south) {
    const targetZone = engine.zonesByConst[conns.south.targetConst];
    if (targetZone) {
      const newX = targetX - conns.south.offset * 2;
      const newY = 0;
      if (newX >= 0 && newX < targetZone.width * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "DOWN" });
        return;
      }
    }
  }
  if (targetX < 0 && conns.west) {
    const targetZone = engine.zonesByConst[conns.west.targetConst];
    if (targetZone) {
      const newX = targetZone.width * 2 - 1;
      const newY = targetY - conns.west.offset * 2;
      if (newY >= 0 && newY < targetZone.height * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "LEFT" });
        return;
      }
    }
  }
  if (targetX >= zone.width * 2 && conns.east) {
    const targetZone = engine.zonesByConst[conns.east.targetConst];
    if (targetZone) {
      const newX = 0;
      const newY = targetY - conns.east.offset * 2;
      if (newY >= 0 && newY < targetZone.height * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "RIGHT" });
        return;
      }
    }
  }

  // Bounds check inside current zone
  if (
    targetX < 0 ||
    targetX >= zone.width * 2 ||
    targetY < 0 ||
    targetY >= zone.height * 2
  ) {
    audio.playSfx("bump");
    return;
  }

  // 3. Check one-way ledge jump!
  if (
    !state.noClip &&
    engine.canJumpLedge(zone, state.player.x, state.player.y, dir)
  ) {
    const landX = state.player.x + dx * 2;
    const landY = state.player.y + dy * 2;
    if (
      landX >= 0 &&
      landX < zone.width * 2 &&
      landY >= 0 &&
      landY < zone.height * 2
    ) {
      audio.playSfx("ledge");
      startPlayerMove(landX, landY, dir, 260, true);
      return;
    }
  }

  // 4. Check NPC collision
  if (!state.noClip) {
    for (const npc of state.npcs) {
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (npc.collected) continue;
      if (npc.x === targetX && npc.y === targetY) {
        audio.playSfx("bump");
        return;
      }
    }
  }

  // 5. Check tile passability or water surfing
  const targetTile = engine.getCollisionTileAtStep(zone, targetX, targetY);
  const water = isWaterTile(zone, targetTile);
  const passable =
    state.noClip ||
    engine.isStepPassable(zone, state.player.x, state.player.y, targetX, targetY) ||
    (water && (state.player.mode === "surf" || state.autoSurf));

  // Also allow stepping directly onto a warp_event coordinate (e.g. stairs/doors)
  const targetWarp = checkWarpAtStep(zone, targetX, targetY);

  if (!passable && !targetWarp) {
    audio.playSfx("bump");
    return;
  }

  if (water && state.player.mode !== "surf") {
    state.player.mode = "surf";
  } else if (!water && state.player.mode === "surf") {
    state.player.mode = "walk";
  }

  const dur = state.player.mode === "bike" ? 105 : 165;
  startPlayerMove(targetX, targetY, dir, dur, false);
}

function startPlayerMove(destX, destY, dir, durationMs, isLedgeJump = false) {
  const prevPlayerX = state.player.x;
  const prevPlayerY = state.player.y;

  state.player.walking = true;
  state.player.stepParity = !state.player.stepParity;
  state.player.moveAnim = {
    fromX: state.player.x,
    fromY: state.player.y,
    toX: destX,
    toY: destY,
    startTime: performance.now(),
    duration: durationMs,
    isLedgeJump,
  };

  // Move Pikachu to Red's previous step
  if (state.pikachu.visible) {
    const pdx = prevPlayerX - state.pikachu.x;
    const pdy = prevPlayerY - state.pikachu.y;
    let pdir = dir;
    if (Math.abs(pdx) + Math.abs(pdy) > 0) {
      if (Math.abs(pdx) >= Math.abs(pdy)) {
        pdir = pdx > 0 ? "RIGHT" : "LEFT";
      } else {
        pdir = pdy > 0 ? "DOWN" : "UP";
      }
    }
    state.pikachu.dir = pdir;
    state.pikachu.walking = true;
    state.pikachu.stepParity = !state.pikachu.stepParity;
    state.pikachu.moveAnim = {
      fromX: state.pikachu.x,
      fromY: state.pikachu.y,
      toX: prevPlayerX,
      toY: prevPlayerY,
      startTime: performance.now(),
      duration: durationMs,
    };
  }
}

function onPlayerStepCompleted() {
  const zone = state.currentZone;
  const sx = state.player.x;
  const sy = state.player.y;

  updateCoordinatesUI();

  // Check if stepped onto a door / staircase warp
  const hitWarp = checkWarpAtStep(zone, sx, sy);
  if (hitWarp) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileId = engine.getCollisionTileAtStep(zone, sx, sy);
    // In Gen 1, doors, stairs, and cave entrances warp immediately on step;
    // indoor exit mats at the bottom edge warp either on step or when pressing Down.
    const isBottomExitMat =
      zone.romId >= 0x25 &&
      sy === zone.height * 2 - 1 &&
      !ts.doorSet.has(tileId);
    if (!isBottomExitMat) {
      const { destConst, destWarpIdx } = resolveWarpDestination(
        zone,
        hitWarp.warp
      );
      audio.playSfx("warp");
      loadZone(destConst, {
        warpIndex: destWarpIdx,
        fromOutdoorWarpIndex: hitWarp.warpIdx,
      });
      return;
    }
  }

  // Check wild Pokémon encounter in tall grass / caves / water
  if (state.wildEncountersEnabled) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileId = engine.getCollisionTileAtStep(zone, sx, sy);
    const inGrass = tileId === ts.grassTile;
    const inCaveOrDungeon =
      zone.category === "dungeon" && zone.wild.grassRate > 0;
    const onWater = isWaterTile(zone, tileId) && zone.wild.waterRate > 0;

    if (inGrass && zone.wild.grass.length > 0) {
      if (Math.random() < 0.14) {
        triggerWildEncounter(zone.wild.grass);
      }
    } else if (onWater && zone.wild.water.length > 0) {
      if (Math.random() < 0.1) {
        triggerWildEncounter(zone.wild.water);
      }
    } else if (inCaveOrDungeon && zone.wild.grass.length > 0) {
      if (Math.random() < 0.06) {
        triggerWildEncounter(zone.wild.grass);
      }
    }
  }
}

// Interact with what is in front of Red (A button / Space / Enter)
export function interactInFront() {
  if (state.battle) return;
  if (state.dialogue) {
    advanceDialogue();
    return;
  }

  const zone = state.currentZone;
  const dx =
    state.player.dir === "LEFT" ? -1 : state.player.dir === "RIGHT" ? 1 : 0;
  const dy =
    state.player.dir === "UP" ? -1 : state.player.dir === "DOWN" ? 1 : 0;
  const fx = state.player.x + dx;
  const fy = state.player.y + dy;

  // 1. Check if facing following Pikachu!
  if (
    state.pikachu.visible &&
    state.pikachu.x === fx &&
    state.pikachu.y === fy
  ) {
    openPikachuInteraction();
    return;
  }

  // 2. Check Elevator control panel
  if (ELEVATOR_FLOORS[zone.constName]) {
    for (const s of zone.signs) {
      if (s.x === fx && s.y === fy) {
        openElevatorMenu(zone.constName);
        return;
      }
    }
  }

  // 3. Check Signs (bg_events)
  for (const s of zone.signs) {
    if (s.x === fx && s.y === fy) {
      audio.playSfx("blip");
      openDialogue("SIGNPOST", s.text);
      return;
    }
  }

  // 4. Check NPCs / Items (including 2 steps away across counter tiles in PokéCenters & Marts!)
  const ts = engine.tilesetsByConst[zone.tileset];
  const frontTile = engine.getCollisionTileAtStep(zone, fx, fy);
  const acrossCounter = ts.counterSet.has(frontTile);
  const checkCoords = [[fx, fy]];
  if (acrossCounter) {
    checkCoords.push([fx + dx, fy + dy]);
  }

  for (const [cx, cy] of checkCoords) {
    for (const npc of state.npcs) {
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (npc.collected) continue;
      if (npc.x === cx && npc.y === cy) {
        // Turn NPC toward player
        const opp = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
        npc.facing = opp[state.player.dir] || "DOWN";
        if (npc.kind === "item") {
          npc.collected = true;
        }
        audio.playSfx("blip");
        const trainerEntry = getTrainerBattleEntry(npc, zone);
        openDialogue(npc.name.replace(/_/g, " "), npc.text, {
          trainerBattle: trainerEntry,
        });
        return;
      }
    }
  }
}

export function openPikachuInteraction() {
  const opp = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  state.pikachu.dir = opp[state.player.dir] || "DOWN";
  const mood = PIKACHU_MOODS[state.pikachu.moodIndex % PIKACHU_MOODS.length];
  state.pikachu.moodIndex++;
  triggerEmote(mood.emote, 2400);
  audio.playSfx("pika");
  openDialogue(mood.title, mood.text, { pikachuMood: mood });
}

function openElevatorMenu(elevatorConst) {
  audio.playSfx("blip");
  const floors = ELEVATOR_FLOORS[elevatorConst];
  state.dialogue = {
    title: `${state.currentZone.displayName} — Select Floor`,
    pages: ["Which floor would you like to go to?"],
    pageIndex: 0,
    elevatorConst,
    elevatorOptions: floors,
  };
  renderDialogueModal();
}

export function openDialogue(title, rawText, extra = {}) {
  const pages = String(rawText || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (pages.length === 0) pages.push("...");
  state.dialogue = {
    title,
    pages,
    pageIndex: 0,
    ...extra,
  };
  renderDialogueModal();
}

function advanceDialogue() {
  if (!state.dialogue) return;
  if (state.dialogue.pageIndex + 1 < state.dialogue.pages.length) {
    state.dialogue.pageIndex++;
    audio.playSfx("blip");
    renderDialogueModal();
  } else {
    state.dialogue = null;
    renderDialogueModal();
  }
}

export function triggerWildEncounter(poolOrEntry, trainerMeta = null) {
  let level = 5;
  let species = "PIDGEY";
  if (Array.isArray(poolOrEntry) && Array.isArray(poolOrEntry[0])) {
    // Gen 1 slot weights: 20%, 20%, 15%, 10%, 10%, 10%, 5%, 5%, 4%, 1%
    const pick = poolOrEntry[Math.floor(Math.random() * poolOrEntry.length)];
    level = pick[0];
    species = pick[1];
  } else if (Array.isArray(poolOrEntry)) {
    level = poolOrEntry[0];
    species = poolOrEntry[1];
  }
  const maxHp = 14 + level * 3;
  const trainerName = trainerMeta?.trainerName || null;
  state.battle = {
    species,
    level,
    hp: maxHp,
    maxHp,
    playerHp: 68,
    playerMaxHp: 68,
    trainerName,
    trainerKey: trainerMeta?.key || null,
    log: trainerName
      ? `${trainerName} wants to battle! ${trainerName} sent out ${species.replace(/_/g, " ")} (Lv.${level})!`
      : `Wild ${species.replace(/_/g, " ")} (Lv.${level}) appeared in ${state.currentZone.displayName}!`,
    finished: false,
  };
  audio.playSfx("thunder");
  renderBattleModal();
}

// Render functions for Modals & Inspector UI
function renderDialogueModal() {
  const modal = document.getElementById("dialogue-overlay");
  if (!modal) return;
  if (!state.dialogue) {
    modal.classList.add("hidden");
    return;
  }
  modal.classList.remove("hidden");
  document.getElementById("dialogue-title").textContent = state.dialogue.title;
  document.getElementById("dialogue-text").textContent =
    state.dialogue.pages[state.dialogue.pageIndex];

  const pikaBox = document.getElementById("dialogue-pika-box");
  if (state.dialogue.pikachuMood) {
    pikaBox.classList.remove("hidden");
    const faceCanvas = document.getElementById("dialogue-pika-canvas");
    const frameKey =
      state.dialogue.pikachuMood.frames[
        Math.floor(performance.now() / 320) % 2
      ];
    engine.render2BitGraphicToCanvas(
      faceCanvas,
      engine.pikachuFaces[frameKey],
      "PAL_PIKACHU_PORTRAIT"
    );
  } else {
    pikaBox.classList.add("hidden");
  }

  const elevBox = document.getElementById("dialogue-elevator-options");
  if (state.dialogue.elevatorOptions) {
    elevBox.classList.remove("hidden");
    elevBox.innerHTML = "";
    state.dialogue.elevatorOptions.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "gb-floor-btn";
      btn.textContent = opt.label;
      btn.onclick = () => {
        state.selectedElevatorDest[state.dialogue.elevatorConst] = opt;
        audio.playSfx("warp");
        state.dialogue = null;
        renderDialogueModal();
        loadZone(opt.destConst, { warpIndex: opt.warpIndex });
      };
      elevBox.appendChild(btn);
    });
  } else {
    elevBox.classList.add("hidden");
  }

  const battleBtn = document.getElementById("dialogue-battle-btn");
  if (battleBtn) {
    if (state.dialogue.trainerBattle) {
      const tb = state.dialogue.trainerBattle;
      battleBtn.classList.remove("hidden");
      battleBtn.textContent = tb.trainerName
        ? `⚔️ BATTLE ${tb.trainerName}`
        : `⚔️ BATTLE ${tb.species}`;
      battleBtn.onclick = () => {
        state.dialogue = null;
        renderDialogueModal();
        triggerWildEncounter([tb.level, tb.species], tb);
      };
    } else {
      battleBtn.classList.add("hidden");
    }
  }
}

function renderBattleModal() {
  const modal = document.getElementById("battle-overlay");
  if (!modal) return;
  if (!state.battle) {
    modal.classList.add("hidden");
    return;
  }
  modal.classList.remove("hidden");
  const b = state.battle;
  document.getElementById("battle-foe-name").textContent =
    b.species.replace(/_/g, " ");
  document.getElementById("battle-foe-lv").textContent = `:L${b.level}`;
  const foePct = Math.max(0, Math.round((b.hp / b.maxHp) * 100));
  const foeBar = document.getElementById("battle-foe-hp-fill");
  foeBar.style.width = `${foePct}%`;
  foeBar.style.background =
    foePct > 50 ? "#22c55e" : foePct > 20 ? "#eab308" : "#ef4444";

  const playerPct = Math.max(0, Math.round((b.playerHp / b.playerMaxHp) * 100));
  document.getElementById("battle-player-hp-fill").style.width = `${playerPct}%`;
  document.getElementById("battle-player-hp-nums").textContent = `${b.playerHp}/${b.playerMaxHp}`;
  document.getElementById("battle-log-text").textContent = b.log;

  // Draw sprites
  const foeCanvas = document.getElementById("battle-foe-canvas");
  const foeSpr =
    engine.pokemonSprites[b.species] || engine.pokemonSprites.PIDGEY;
  engine.render2BitGraphicToCanvas(foeCanvas, foeSpr, state.currentZone.palette);

  const backCanvas = document.getElementById("battle-player-canvas");
  engine.render2BitGraphicToCanvas(
    backCanvas,
    engine.pokemonSprites.PIKACHU_BACK,
    "PAL_YELLOWMON"
  );
}

function executeBattleAction(action) {
  const b = state.battle;
  if (!b) return;
  if (b.finished || action === "run") {
    state.battle = null;
    renderBattleModal();
    return;
  }
  if (action === "ball") {
    if (b.trainerName) {
      audio.playSfx("bump");
      b.log = `${b.trainerName} blocked the POKé BALL! Don't be a thief!`;
      renderBattleModal();
      return;
    }
    audio.playSfx("warp");
    b.hp = 0;
    b.finished = true;
    state.caughtPokemon.add(b.species);
    saveProgress();
    updateUIForCurrentZone();
    b.log = `RED threw a POKé BALL! Gotcha! ${b.species.replace(/_/g, " ")} was caught! (${state.caughtPokemon.size} species in Pokédex)`;
    renderBattleModal();
    return;
  }
  const dmg =
    action === "thunderbolt"
      ? Math.max(8, Math.floor(b.maxHp * 0.65))
      : Math.max(5, Math.floor(b.maxHp * 0.42));
  audio.playSfx("thunder");
  b.hp = Math.max(0, b.hp - dmg);
  const moveLabel =
    action === "thunderbolt" ? "THUNDERBOLT" : "QUICK ATTACK";
  if (b.hp === 0) {
    b.finished = true;
    if (b.trainerKey) {
      state.defeatedTrainers.add(b.trainerKey);
      saveProgress();
    }
    const foeTitle = b.trainerName
      ? `${b.trainerName}'s ${b.species.replace(/_/g, " ")}`
      : `Wild ${b.species.replace(/_/g, " ")}`;
    b.log = `PIKACHU used ${moveLabel}! ${foeTitle} fainted! PIKACHU gained ${b.level * 18} EXP!`;
  } else {
    const counterDmg = Math.max(1, Math.floor(b.level * 0.4));
    b.playerHp = Math.max(1, b.playerHp - counterDmg);
    b.log = `PIKACHU used ${moveLabel}! Wild ${b.species.replace(/_/g, " ")} used TACKLE (-${counterDmg} HP)!`;
  }
  renderBattleModal();
}

function getFilteredZones() {
  const q = state.searchQuery.trim().toLowerCase();
  return engine.allZones.filter((z) => {
    if (state.categoryFilter === "canonical220" && !z.isCanonical220) {
      return false;
    }
    if (
      state.categoryFilter === "town" ||
      state.categoryFilter === "route" ||
      state.categoryFilter === "indoor" ||
      state.categoryFilter === "dungeon"
    ) {
      if (!z.isCanonical220 || z.category !== state.categoryFilter) return false;
    }
    if (state.townMapFilterCoords) {
      const [tx, ty] = state.townMapFilterCoords;
      if (z.townMapX !== tx || z.townMapY !== ty) return false;
    }
    if (!q) return true;
    return (
      z.displayName.toLowerCase().includes(q) ||
      z.constName.toLowerCase().includes(q) ||
      z.headerName.toLowerCase().includes(q) ||
      z.regionName.toLowerCase().includes(q) ||
      z.tileset.toLowerCase().includes(q) ||
      z.romHex.toLowerCase().includes(q) ||
      `#${String(z.zoneNumber).padStart(3, "0")}`.includes(q) ||
      String(z.zoneNumber) === q
    );
  });
}

function renderZoneList() {
  const listEl = document.getElementById("zone-list");
  if (!listEl) return;
  const filtered = getFilteredZones();
  const countEl = document.getElementById("zone-filter-count");
  if (countEl) {
    countEl.textContent = `${filtered.length} shown`;
  }

  listEl.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const z of filtered) {
    const item = document.createElement("button");
    item.type = "button";
    const isActive = z.constName === state.currentZone.constName;
    item.className = `zone-item ${isActive ? "active" : ""}`;
    item.dataset.zoneConst = z.constName;

    const catBadge =
      z.category === "town"
        ? "CITY"
        : z.category === "route"
        ? "ROUTE"
        : z.category === "dungeon"
        ? "DUNGEON"
        : "INDOOR";

    item.innerHTML = `
      <span class="zone-num">#${String(z.zoneNumber).padStart(3, "0")}</span>
      <span class="zone-main">
        <span class="zone-title">${z.displayName}</span>
        <span class="zone-meta">${z.constName} • ${z.width}×${z.height} blk (${z.width * 32}×${z.height * 32}px) • ${z.tileset}</span>
      </span>
      <span class="zone-tag tag-${z.category}">${catBadge}</span>
    `;
    item.onclick = () => {
      loadZone(z, { resetParent: true });
    };
    frag.appendChild(item);
  }
  listEl.appendChild(frag);
}

function renderKantoTownMap() {
  const canvas = document.getElementById("kanto-town-map-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cellW = W / 16;
  const cellH = H / 16;

  ctx.fillStyle = "#162436";
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 16; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellW, 0);
    ctx.lineTo(i * cellW, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellH);
    ctx.lineTo(W, i * cellH);
    ctx.stroke();
  }

  // Group zones by (townMapX, townMapY)
  const coordMap = {};
  for (const z of engine.canonicalZones) {
    const key = `${z.townMapX},${z.townMapY}`;
    if (!coordMap[key]) coordMap[key] = [];
    coordMap[key].push(z);
  }

  for (const [key, zonesAtPoint] of Object.entries(coordMap)) {
    const [gx, gy] = key.split(",").map(Number);
    const hasTown = zonesAtPoint.some((z) => z.category === "town");
    const hasDungeon = zonesAtPoint.some((z) => z.category === "dungeon");
    const px = gx * cellW;
    const py = gy * cellH;

    if (hasTown) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
    } else if (hasDungeon) {
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(px + 3, py + 3, cellW - 6, cellH - 6);
    } else {
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(px + 4, py + 4, cellW - 8, cellH - 8);
    }
  }

  // Highlight active zone's Kanto Town Map coordinate
  const cur = state.currentZone;
  const cx = cur.townMapX * cellW;
  const cy = cur.townMapY * cellH;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
}

function updateCoordinatesUI() {
  const z = state.currentZone;
  const ts = engine.tilesetsByConst[z.tileset];
  const tid = engine.getCollisionTileAtStep(z, state.player.x, state.player.y);
  const posEl = document.getElementById("hud-player-pos");
  if (posEl) {
    posEl.textContent = `Step (${state.player.x}, ${state.player.y}) • Block (${Math.floor(
      state.player.x / 2
    )}, ${Math.floor(state.player.y / 2)}) • Tile $${tid
      .toString(16)
      .toUpperCase()
      .padStart(2, "0")}`;
  }
}

function updateUIForCurrentZone() {
  const z = state.currentZone;
  document.getElementById("active-zone-badge").textContent = `ZONE #${String(
    z.zoneNumber
  ).padStart(3, "0")} / 220`;
  document.getElementById("active-zone-title").textContent = z.displayName;
  document.getElementById("active-zone-subtitle").textContent = `${z.constName} (ROM ${z.romHex}) • ${z.regionName} • ${z.width}×${z.height} Blocks (${z.width * 32}×${z.height * 32} px) • Tileset: ${z.tileset}`;

  document.getElementById("visited-counter").textContent = `${state.visitedZones.size} / 220 Visited`;
  const caughtEl = document.getElementById("caught-counter");
  if (caughtEl) {
    caughtEl.textContent = `🔴 ${state.caughtPokemon.size} Caught`;
  }

  updateCoordinatesUI();
  renderKantoTownMap();

  // Highlight active row in zone list
  document.querySelectorAll(".zone-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.zoneConst === z.constName);
  });

  // Update Connections & Warps inspector
  const connBox = document.getElementById("inspector-connections");
  connBox.innerHTML = "";
  const dirs = ["north", "south", "west", "east"];
  let hasConns = false;
  for (const d of dirs) {
    const c = z.connections && z.connections[d];
    if (c) {
      hasConns = true;
      const targetZ = engine.zonesByConst[c.targetConst];
      const btn = document.createElement("button");
      btn.className = "conn-chip";
      btn.innerHTML = `<span class="conn-dir">${d.toUpperCase()}</span> <span>${
        targetZ ? `#${String(targetZ.zoneNumber).padStart(3, "0")} ${targetZ.displayName}` : c.targetConst
      }</span>`;
      btn.onclick = () => loadZone(c.targetConst, { resetParent: true });
      connBox.appendChild(btn);
    }
  }
  if (!hasConns) {
    connBox.innerHTML = `<span class="muted-note">Indoor / self-contained segment (uses Warps)</span>`;
  }

  // Warps
  const warpBox = document.getElementById("inspector-warps");
  warpBox.innerHTML = "";
  if (z.warps.length === 0) {
    warpBox.innerHTML = `<span class="muted-note">No warp events in this segment</span>`;
  } else {
    z.warps.forEach((w, idx) => {
      const resolved = resolveWarpDestination(z, w);
      const targetZ = engine.zonesByConst[resolved.destConst];
      const btn = document.createElement("button");
      btn.className = "warp-chip";
      btn.innerHTML = `<span class="warp-idx">W${idx + 1} (${w.x},${w.y})</span> <span>→ ${
        targetZ
          ? `#${String(targetZ.zoneNumber).padStart(3, "0")} ${targetZ.displayName}`
          : resolved.destConst
      }</span>`;
      btn.onclick = () => {
        audio.playSfx("warp");
        loadZone(resolved.destConst, {
          warpIndex: resolved.destWarpIdx,
          fromOutdoorWarpIndex: idx,
        });
      };
      warpBox.appendChild(btn);
    });
  }

  // Signs & NPCs
  const npcBox = document.getElementById("inspector-entities");
  npcBox.innerHTML = "";
  z.signs.forEach((s, idx) => {
    const btn = document.createElement("button");
    btn.className = "entity-chip sign-chip";
    btn.textContent = `Sign S${idx + 1} (${s.x},${s.y}): "${s.text.slice(0, 42)}${
      s.text.length > 42 ? "…" : ""
    }"`;
    btn.onclick = () => {
      audio.playSfx("blip");
      openDialogue(`SIGNPOST (${s.x}, ${s.y})`, s.text);
    };
    npcBox.appendChild(btn);
  });
  state.npcs.forEach((npc) => {
    const btn = document.createElement("button");
    btn.className = "entity-chip npc-chip";
    const trainerEntry = getTrainerBattleEntry(npc, z);
    btn.textContent = `${trainerEntry ? "⚔️ " : ""}${npc.name.replace(/_/g, " ")} (${npc.x},${npc.y})${
      !npc.defaultVisible ? " [Event]" : ""
    }`;
    btn.onclick = () => {
      audio.playSfx("blip");
      openDialogue(npc.name.replace(/_/g, " "), npc.text, {
        trainerBattle: trainerEntry,
      });
    };
    npcBox.appendChild(btn);
  });
  if (z.signs.length === 0 && state.npcs.length === 0) {
    npcBox.innerHTML = `<span class="muted-note">No signs or NPCs in this segment</span>`;
  }

  // Wild Pokémon
  const wildBox = document.getElementById("inspector-wild");
  wildBox.innerHTML = "";
  const allWild = [...(z.wild.grass || []), ...(z.wild.water || [])];
  if (allWild.length === 0) {
    wildBox.innerHTML = `<span class="muted-note">No wild Pokémon encounters in this zone</span>`;
  } else {
    const seen = new Set();
    allWild.forEach(([lv, sp]) => {
      const key = `${sp}:${lv}`;
      if (seen.has(key)) return;
      seen.add(key);
      const btn = document.createElement("button");
      btn.className = "wild-chip";
      btn.textContent = `${sp.replace(/_/g, " ")} Lv.${lv}`;
      btn.onclick = () => triggerWildEncounter([lv, sp]);
      wildBox.appendChild(btn);
    });
  }
}

function renderAllCanvases() {
  const fullCanvas = document.getElementById("full-zone-canvas");
  const gbCanvas = document.getElementById("gb-screen-canvas");

  if (fullCanvas && state.viewMode !== "gb") {
    engine.renderFullZone(fullCanvas, state.currentZone, {
      showBorder: state.showBorder,
      showEntities: state.showEntitiesOnZoneMap,
      showWarps: state.showWarpsOnZoneMap,
      showGrid: state.showGridOnZoneMap,
      showHiddenObjects: state.showHiddenObjects,
      playerState: state.player,
      pikachuState: state.pikachu,
      npcStates: state.npcs,
    });
  }

  if (gbCanvas && state.viewMode !== "zone") {
    engine.renderGameBoyViewport(
      gbCanvas,
      state.currentZone,
      state.player,
      state.pikachu,
      state.npcs,
      state.showHiddenObjects,
      state.activeEmote
    );
  }
}

// 220-Zone Visual Atlas Modal
function openVisualAtlasModal() {
  const modal = document.getElementById("atlas-modal");
  modal.classList.remove("hidden");
  renderAtlasGrid();
}

function renderAtlasGrid() {
  const grid = document.getElementById("atlas-grid");
  const q = (document.getElementById("atlas-search-input")?.value || "")
    .trim()
    .toLowerCase();
  const cat =
    document.getElementById("atlas-cat-select")?.value || "canonical220";

  const zones = engine.allZones.filter((z) => {
    if (cat === "canonical220" && !z.isCanonical220) return false;
    if (
      (cat === "town" ||
        cat === "route" ||
        cat === "indoor" ||
        cat === "dungeon") &&
      (!z.isCanonical220 || z.category !== cat)
    ) {
      return false;
    }
    if (!q) return true;
    return (
      z.displayName.toLowerCase().includes(q) ||
      z.constName.toLowerCase().includes(q) ||
      String(z.zoneNumber) === q
    );
  });

  document.getElementById("atlas-count-label").textContent = `Showing ${zones.length} Loadable Zone Segments`;
  grid.innerHTML = "";

  zones.forEach((z) => {
    const card = document.createElement("div");
    card.className = `atlas-card ${
      z.constName === state.currentZone.constName ? "active" : ""
    }`;
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.className = "atlas-thumb-canvas";
    engine.renderFullZone(thumbCanvas, z, {
      showBorder: false,
      showEntities: false,
      showWarps: false,
      showGrid: false,
    });

    const info = document.createElement("div");
    info.className = "atlas-card-info";
    info.innerHTML = `
      <div class="atlas-card-top">
        <span class="zone-num">#${String(z.zoneNumber).padStart(3, "0")}</span>
        <span class="zone-tag tag-${z.category}">${z.category.toUpperCase()}</span>
      </div>
      <div class="atlas-card-name">${z.displayName}</div>
      <div class="atlas-card-sub">${z.constName} • ${z.width}×${z.height} blk</div>
    `;

    card.appendChild(thumbCanvas);
    card.appendChild(info);
    card.onclick = () => {
      document.getElementById("atlas-modal").classList.add("hidden");
      loadZone(z, { resetParent: true });
    };
    grid.appendChild(card);
  });
}

// Main 60fps loop
let lastAnimTick = 0;
let lastNpcTick = 0;
const heldDirs = new Set();

function gameLoop(now) {
  // 1. Update water & flower tile animation counter every 280ms (matching ~20 Game Boy frames)
  if (now - lastAnimTick > 280) {
    lastAnimTick = now;
    engine.animCounter = (engine.animCounter + 1) & 7;
    if (state.dialogue && state.dialogue.pikachuMood) {
      renderDialogueModal();
    }
  }

  // 2. Update Player smooth step interpolation
  if (state.player.moveAnim) {
    const anim = state.player.moveAnim;
    const t = Math.min(1, (now - anim.startTime) / anim.duration);
    state.player.renderX = anim.fromX + (anim.toX - anim.fromX) * t;
    let jumpArc = 0;
    if (anim.isLedgeJump) {
      jumpArc = -Math.sin(t * Math.PI) * 0.75;
    }
    state.player.renderY = anim.fromY + (anim.toY - anim.fromY) * t + jumpArc;

    if (state.pikachu.moveAnim) {
      const pa = state.pikachu.moveAnim;
      state.pikachu.renderX = pa.fromX + (pa.toX - pa.fromX) * t;
      state.pikachu.renderY = pa.fromY + (pa.toY - pa.fromY) * t;
    }

    if (t >= 1) {
      state.player.x = anim.toX;
      state.player.y = anim.toY;
      state.player.renderX = anim.toX;
      state.player.renderY = anim.toY;
      state.player.walking = false;
      state.player.moveAnim = null;

      if (state.pikachu.moveAnim) {
        state.pikachu.x = state.pikachu.moveAnim.toX;
        state.pikachu.y = state.pikachu.moveAnim.toY;
        state.pikachu.renderX = state.pikachu.x;
        state.pikachu.renderY = state.pikachu.y;
        state.pikachu.walking = false;
        state.pikachu.moveAnim = null;
      }

      onPlayerStepCompleted();
    }
  } else if (heldDirs.size > 0 && !state.dialogue && !state.battle) {
    const lastDir = Array.from(heldDirs).pop();
    attemptStep(lastDir);
  }

  // 3. Gentle NPC wander for WALK NPCs
  if (now - lastNpcTick > 1600 && !state.dialogue && !state.battle) {
    lastNpcTick = now;
    for (const npc of state.npcs) {
      if (npc.movement !== "WALK" || npc.isWalking) continue;
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (Math.random() < 0.35) {
        const dirs =
          npc.dir === "UP_DOWN"
            ? ["UP", "DOWN"]
            : npc.dir === "LEFT_RIGHT"
            ? ["LEFT", "RIGHT"]
            : ["DOWN", "UP", "LEFT", "RIGHT"];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        npc.facing = d;
        const dx = d === "LEFT" ? -1 : d === "RIGHT" ? 1 : 0;
        const dy = d === "UP" ? -1 : d === "DOWN" ? 1 : 0;
        const nx = npc.x + dx;
        const ny = npc.y + dy;
        if (
          Math.abs(nx - npc.originX) <= 2 &&
          Math.abs(ny - npc.originY) <= 2 &&
          nx >= 0 &&
          nx < state.currentZone.width * 2 &&
          ny >= 0 &&
          ny < state.currentZone.height * 2 &&
          !(nx === state.player.x && ny === state.player.y) &&
          !(nx === state.pikachu.x && ny === state.pikachu.y) &&
          engine.isStepPassable(state.currentZone, npc.x, npc.y, nx, ny)
        ) {
          npc.x = nx;
          npc.y = ny;
          npc.renderX = nx;
          npc.renderY = ny;
          npc.stepParity = !npc.stepParity;
        }
      }
    }
  }

  renderAllCanvases();
  requestAnimationFrame(gameLoop);
}

function setupControlsAndEvents() {
  // Keyboard controls
  const keyToDir = {
    ArrowUp: "UP",
    KeyW: "UP",
    ArrowDown: "DOWN",
    KeyS: "DOWN",
    ArrowLeft: "LEFT",
    KeyA: "LEFT",
    ArrowRight: "RIGHT",
    KeyD: "RIGHT",
  };

  window.addEventListener("keydown", (e) => {
    if (
      document.activeElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT")
    ) {
      return;
    }
    if (keyToDir[e.code]) {
      e.preventDefault();
      const dir = keyToDir[e.code];
      heldDirs.add(dir);
      attemptStep(dir);
    } else if (
      e.code === "Space" ||
      e.code === "Enter" ||
      e.code === "KeyZ"
    ) {
      e.preventDefault();
      interactInFront();
    } else if (e.code === "KeyX" || e.code === "Escape") {
      if (state.dialogue) {
        state.dialogue = null;
        renderDialogueModal();
      } else if (state.battle) {
        state.battle = null;
        renderBattleModal();
      }
    } else if (e.code === "BracketLeft") {
      stepZoneNumber(-1);
    } else if (e.code === "BracketRight") {
      stepZoneNumber(1);
    } else if (e.code === "KeyP") {
      openPikachuInteraction();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (keyToDir[e.code]) {
      heldDirs.delete(keyToDir[e.code]);
    }
  });

  // On-screen D-pad & A/B buttons
  document.querySelectorAll("[data-dpad]").forEach((btn) => {
    const dir = btn.dataset.dpad;
    const startHold = (e) => {
      e.preventDefault();
      heldDirs.add(dir);
      attemptStep(dir);
    };
    const endHold = () => heldDirs.delete(dir);
    btn.addEventListener("mousedown", startHold);
    btn.addEventListener("mouseup", endHold);
    btn.addEventListener("mouseleave", endHold);
    btn.addEventListener("touchstart", startHold, { passive: false });
    btn.addEventListener("touchend", endHold);
  });

  document.getElementById("btn-gb-a")?.addEventListener("click", () => {
    interactInFront();
  });
  document.getElementById("btn-gb-b")?.addEventListener("click", () => {
    if (state.dialogue) {
      state.dialogue = null;
      renderDialogueModal();
    } else if (state.battle) {
      state.battle = null;
      renderBattleModal();
    } else {
      state.player.mode = state.player.mode === "bike" ? "walk" : "bike";
    }
  });
  document.getElementById("btn-gb-start")?.addEventListener("click", () => {
    openVisualAtlasModal();
  });
  document.getElementById("btn-gb-select")?.addEventListener("click", () => {
    openPikachuInteraction();
  });

  // Click on Full Zone Canvas to teleport / walk or trigger warp!
  const fullCanvas = document.getElementById("full-zone-canvas");
  fullCanvas?.addEventListener("click", (e) => {
    const rect = fullCanvas.getBoundingClientRect();
    const scaleX = fullCanvas.width / rect.width;
    const scaleY = fullCanvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const borderOffset = state.showBorder ? 32 : 0;
    const stepX = Math.floor((px - borderOffset) / 16);
    const stepY = Math.floor((py - borderOffset) / 16);
    const z = state.currentZone;
    if (stepX < 0 || stepX >= z.width * 2 || stepY < 0 || stepY >= z.height * 2) {
      return;
    }
    // Check if clicked on a Warp
    const wHit = checkWarpAtStep(z, stepX, stepY);
    if (wHit) {
      const resolved = resolveWarpDestination(z, wHit.warp);
      audio.playSfx("warp");
      loadZone(resolved.destConst, {
        warpIndex: resolved.destWarpIdx,
        fromOutdoorWarpIndex: wHit.warpIdx,
      });
      return;
    }
    // Check if clicked on a Sign
    for (const s of z.signs) {
      if (s.x === stepX && s.y === stepY) {
        audio.playSfx("blip");
        openDialogue(`SIGNPOST (${s.x}, ${s.y})`, s.text);
        return;
      }
    }
    // Otherwise move Red + Pikachu there and show entities on map
    state.player.x = stepX;
    state.player.y = stepY;
    state.player.renderX = stepX;
    state.player.renderY = stepY;
    state.pikachu.x = Math.max(0, stepX - 1);
    state.pikachu.y = stepY;
    state.pikachu.renderX = state.pikachu.x;
    state.pikachu.renderY = state.pikachu.y;
    updateCoordinatesUI();
  });

  // Click on Kanto Town Map canvas
  const tmCanvas = document.getElementById("kanto-town-map-canvas");
  tmCanvas?.addEventListener("click", (e) => {
    const rect = tmCanvas.getBoundingClientRect();
    const gx = Math.floor(((e.clientX - rect.left) / rect.width) * 16);
    const gy = Math.floor(((e.clientY - rect.top) / rect.height) * 16);
    const matches = engine.canonicalZones.filter(
      (z) => z.townMapX === gx && z.townMapY === gy
    );
    if (matches.length > 0) {
      loadZone(matches[0], { resetParent: true });
    }
  });

  // Top bar & Toolbar buttons
  document.querySelectorAll("[data-view-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.viewMode = btn.dataset.viewMode;
      document.querySelectorAll("[data-view-mode]").forEach((b) => {
        b.classList.toggle("active", b.dataset.viewMode === state.viewMode);
      });
      const stage = document.getElementById("main-stage");
      stage.dataset.viewMode = state.viewMode;
      renderAllCanvases();
    });
  });

  document.getElementById("palette-select")?.addEventListener("change", (e) => {
    engine.paletteMode = e.target.value;
    renderAllCanvases();
  });

  document.getElementById("btn-prev-zone")?.addEventListener("click", () => {
    stepZoneNumber(-1);
  });
  document.getElementById("btn-next-zone")?.addEventListener("click", () => {
    stepZoneNumber(1);
  });

  document.getElementById("btn-toggle-entities")?.addEventListener("click", (e) => {
    state.showEntitiesOnZoneMap = !state.showEntitiesOnZoneMap;
    e.currentTarget.classList.toggle("active", state.showEntitiesOnZoneMap);
  });
  document.getElementById("btn-toggle-warps")?.addEventListener("click", (e) => {
    state.showWarpsOnZoneMap = !state.showWarpsOnZoneMap;
    e.currentTarget.classList.toggle("active", state.showWarpsOnZoneMap);
  });
  document.getElementById("btn-toggle-grid")?.addEventListener("click", (e) => {
    state.showGridOnZoneMap = !state.showGridOnZoneMap;
    e.currentTarget.classList.toggle("active", state.showGridOnZoneMap);
  });
  document.getElementById("btn-toggle-border")?.addEventListener("click", (e) => {
    state.showBorder = !state.showBorder;
    e.currentTarget.classList.toggle("active", state.showBorder);
  });
  document.getElementById("btn-toggle-bike")?.addEventListener("click", (e) => {
    state.player.mode = state.player.mode === "bike" ? "walk" : "bike";
    e.currentTarget.classList.toggle("active", state.player.mode === "bike");
  });
  document.getElementById("btn-check-pikachu")?.addEventListener("click", () => {
    openPikachuInteraction();
  });
  document.getElementById("caught-counter")?.addEventListener("click", () => {
    audio.playSfx("blip");
    const caughtList = Array.from(state.caughtPokemon)
      .map((s) => s.replace(/_/g, " "))
      .join(", ");
    openDialogue(
      "RED'S POKéDEX & JOURNEY LOG",
      `POKéDEX CAUGHT (${state.caughtPokemon.size}): ${caughtList}\n\nKANTO ZONES VISITED: ${state.visitedZones.size} / 220 • TRAINERS DEFEATED: ${state.defeatedTrainers.size}`
    );
  });
  document.getElementById("btn-audio-toggle")?.addEventListener("click", (e) => {
    const on = audio.toggle();
    e.currentTarget.textContent = on ? "🔊 BGM: ON" : "🔇 BGM: OFF";
    e.currentTarget.classList.toggle("active", on);
  });

  // Zone Browser Filters & Search
  document.querySelectorAll("[data-cat-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.categoryFilter = btn.dataset.catFilter;
      state.townMapFilterCoords = null;
      document.querySelectorAll("[data-cat-filter]").forEach((b) => {
        b.classList.toggle("active", b.dataset.catFilter === state.categoryFilter);
      });
      renderZoneList();
    });
  });

  document.getElementById("zone-search-input")?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderZoneList();
  });

  // Dialogue & Battle buttons
  document.getElementById("dialogue-next-btn")?.addEventListener("click", () => {
    advanceDialogue();
  });
  document.getElementById("dialogue-close-btn")?.addEventListener("click", () => {
    state.dialogue = null;
    renderDialogueModal();
  });

  document.querySelectorAll("[data-battle-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      executeBattleAction(btn.dataset.battleAct);
    });
  });

  // Visual Atlas modal
  document.getElementById("btn-open-atlas")?.addEventListener("click", () => {
    openVisualAtlasModal();
  });
  document.getElementById("btn-close-atlas")?.addEventListener("click", () => {
    document.getElementById("atlas-modal").classList.add("hidden");
  });
  document.getElementById("atlas-search-input")?.addEventListener("input", () => {
    renderAtlasGrid();
  });
  document.getElementById("atlas-cat-select")?.addEventListener("change", () => {
    renderAtlasGrid();
  });
}

function stepZoneNumber(delta) {
  const maxZone = state.categoryFilter === "all224" ? 224 : 220;
  let nextNum = state.currentZone.zoneNumber + delta;
  if (nextNum < 1) nextNum = maxZone;
  if (nextNum > maxZone) nextNum = 1;
  loadZone(nextNum, { resetParent: true });
}

// Expose global API for programmatic inspection & testing
window.POKEYELLOW = {
  engine,
  state,
  zones: engine.canonicalZones, // Exact 220 unique loadable Kanto zone segments
  allHeaders: engine.allZones, // All 224 ROM map headers
  loadZone,
  interactInFront,
  openPikachuInteraction,
  triggerWildEncounter,
};

window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  setupControlsAndEvents();
  renderZoneList();
  loadZone("PALLET_TOWN");
  requestAnimationFrame(gameLoop);
});
