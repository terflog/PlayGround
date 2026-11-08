import { TILE, TILE_SIZE } from './kanto-data.js';

export class SpriteRenderer {
  constructor() {
    this.tileCache = new Map();
  }

  drawTile(ctx, tile, screenX, screenY, worldX, worldY, timeMs) {
    const s = TILE_SIZE;
    const hash = ((worldX * 374761393) ^ (worldY * 668265263)) >>> 0;
    const wave = Math.sin(timeMs * 0.003 + worldX * 0.6 + worldY * 0.4);

    switch (tile) {
      case TILE.DEEP_WATER: {
        ctx.fillStyle = '#0f4c81';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#155e9b';
        const offset = Math.floor((timeMs * 0.012 + worldX * 3) % 8);
        ctx.fillRect(screenX + 4 + offset, screenY + 10, 12, 3);
        ctx.fillRect(screenX + 14 - offset, screenY + 24, 10, 3);
        break;
      }

      case TILE.WATER: {
        ctx.fillStyle = '#2589d8';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#60bbf7';
        const shift = Math.round(wave * 3);
        ctx.fillRect(screenX + 6 + shift, screenY + 9, 11, 3);
        ctx.fillRect(screenX + 16 - shift, screenY + 23, 12, 3);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(screenX + 8 + shift, screenY + 9, 4, 2);
        break;
      }

      case TILE.SAND: {
        ctx.fillStyle = '#f3d59b';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#dfc082';
        ctx.fillRect(screenX + (hash % 18) + 4, screenY + ((hash >> 4) % 18) + 4, 4, 3);
        ctx.fillRect(screenX + ((hash >> 8) % 20) + 6, screenY + ((hash >> 12) % 20) + 10, 3, 3);
        break;
      }

      case TILE.GRASS: {
        ctx.fillStyle = '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#4bb340';
        if (hash % 3 === 0) {
          ctx.fillRect(screenX + 6, screenY + 10, 3, 5);
          ctx.fillRect(screenX + 10, screenY + 12, 3, 4);
        } else if (hash % 3 === 1) {
          ctx.fillRect(screenX + 22, screenY + 20, 3, 5);
          ctx.fillRect(screenX + 18, screenY + 22, 3, 4);
        }
        break;
      }

      case TILE.TALL_GRASS: {
        ctx.fillStyle = '#4bb340';
        ctx.fillRect(screenX, screenY, s, s);
        const sway = Math.round(Math.sin(timeMs * 0.004 + worldX * 0.8 + worldY * 0.5) * 1.5);
        // Dark green base blades
        ctx.fillStyle = '#19732d';
        for (let row = 0; row < 2; row++) {
          const by = screenY + 6 + row * 15;
          for (let col = 0; col < 3; col++) {
            const bx = screenX + 5 + col * 10 + sway;
            ctx.fillRect(bx, by + 4, 7, 9);
            ctx.fillStyle = '#2ea44f';
            ctx.fillRect(bx + 1, by, 5, 8);
            ctx.fillStyle = '#86efac';
            ctx.fillRect(bx + 2, by, 2, 3);
            ctx.fillStyle = '#19732d';
          }
        }
        break;
      }

      case TILE.FLOWER: {
        ctx.fillStyle = '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
        const bob = Math.round(Math.sin(timeMs * 0.005 + worldX) * 1.5);
        const colors = ['#f43f5e', '#facc15', '#38bdf8'];
        const c1 = colors[hash % 3];
        const c2 = colors[(hash + 1) % 3];
        // Stem & leaves
        ctx.fillStyle = '#2b8a3e';
        ctx.fillRect(screenX + 9, screenY + 12, 3, 6);
        ctx.fillRect(screenX + 23, screenY + 22, 3, 6);
        // Petals
        ctx.fillStyle = c1;
        ctx.fillRect(screenX + 6 + bob, screenY + 7, 8, 7);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screenX + 9 + bob, screenY + 9, 3, 3);

        ctx.fillStyle = c2;
        ctx.fillRect(screenX + 20 - bob, screenY + 18, 8, 7);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screenX + 23 - bob, screenY + 20, 3, 3);
        break;
      }

      case TILE.ROAD: {
        ctx.fillStyle = '#e7c888';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#d4b26f';
        ctx.fillRect(screenX + 3, screenY + 3, 5, 3);
        ctx.fillRect(screenX + 22, screenY + 19, 6, 3);
        ctx.fillStyle = '#f5deb3';
        ctx.fillRect(screenX + 12, screenY + 11, 4, 3);
        break;
      }

      case TILE.PAVED: {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 0.5, screenY + 0.5, s - 1, s - 1);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(screenX + 3, screenY + 3, s - 6, s - 6);
        break;
      }

      case TILE.PLAZA: {
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 4);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(screenX + 6, screenY + 6, s - 12, s - 12);
        break;
      }

      case TILE.BRIDGE: {
        ctx.fillStyle = '#2589d8';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#9c6634';
        ctx.fillRect(screenX, screenY + 1, s, s - 2);
        ctx.fillStyle = '#b97a42';
        for (let i = 2; i < s; i += 7) {
          ctx.fillRect(screenX + i, screenY + 3, 5, s - 6);
        }
        ctx.fillStyle = '#6f451e';
        ctx.fillRect(screenX, screenY + 2, s, 3);
        ctx.fillRect(screenX, screenY + s - 5, s, 3);
        break;
      }

      case TILE.CYCLING_ROAD: {
        ctx.fillStyle = '#475569';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(screenX + 2, screenY, s - 4, s);
        if (worldY % 2 === 0) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(screenX + s / 2 - 2, screenY + 6, 4, s - 12);
        }
        break;
      }

      case TILE.TREE:
      case TILE.FOREST_TREE: {
        const isDark = tile === TILE.FOREST_TREE;
        ctx.fillStyle = isDark ? '#2d6a3e' : '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
        // Trunk shadow & trunk
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(screenX + 5, screenY + s - 7, s - 10, 6);
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(screenX + 13, screenY + s - 10, 10, 8);
        // Layered GBA style tree canopy
        ctx.fillStyle = isDark ? '#0f3923' : '#1b5e20';
        ctx.fillRect(screenX + 3, screenY + 4, s - 6, s - 10);
        ctx.fillStyle = isDark ? '#1a5632' : '#2e7d32';
        ctx.fillRect(screenX + 5, screenY + 3, s - 10, s - 13);
        ctx.fillStyle = isDark ? '#2d7a47' : '#4caf50';
        ctx.fillRect(screenX + 8, screenY + 5, s - 16, 10);
        break;
      }

      case TILE.MOUNTAIN: {
        ctx.fillStyle = '#785a3c';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#9c7853';
        ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 6);
        ctx.fillStyle = '#b8946e';
        ctx.fillRect(screenX + 5, screenY + 4, s - 12, 10);
        ctx.fillStyle = '#4e3824';
        ctx.fillRect(screenX, screenY + s - 4, s, 4);
        break;
      }

      case TILE.CLIFF_LEDGE: {
        ctx.fillStyle = '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#6e4e2e';
        ctx.fillRect(screenX, screenY + s - 12, s, 9);
        ctx.fillStyle = '#9c7853';
        ctx.fillRect(screenX, screenY + s - 14, s, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(screenX, screenY + s - 3, s, 3);
        break;
      }

      case TILE.FENCE: {
        ctx.fillStyle = '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(screenX + 2, screenY + 12, s - 4, 14);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(screenX + 4, screenY + 8, 6, 20);
        ctx.fillRect(screenX + 15, screenY + 8, 6, 20);
        ctx.fillRect(screenX + 26, screenY + 8, 6, 20);
        ctx.fillRect(screenX + 2, screenY + 14, s - 4, 4);
        break;
      }

      case TILE.BUILDING_WALL: {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(screenX, screenY + s - 5, s, 5);
        // Window pane
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(screenX + 8, screenY + 7, s - 16, 14);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(screenX + 10, screenY + 9, 6, 5);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX + 8, screenY + 7, s - 16, 14);
        break;
      }

      case TILE.ROOF_RED:
      case TILE.ROOF_BLUE:
      case TILE.ROOF_GOLD:
      case TILE.ROOF_SLATE:
      case TILE.ROOF_PURPLE:
      case TILE.ROOF_GREEN: {
        const palettes = {
          [TILE.ROOF_RED]: ['#dc2626', '#ef4444', '#fca5a5'],
          [TILE.ROOF_BLUE]: ['#0284c7', '#0ea5e9', '#7dd3fc'],
          [TILE.ROOF_GOLD]: ['#b45309', '#eab308', '#fef08a'],
          [TILE.ROOF_SLATE]: ['#334155', '#475569', '#94a3b8'],
          [TILE.ROOF_PURPLE]: ['#6b21a8', '#9333ea', '#d8b4fe'],
          [TILE.ROOF_GREEN]: ['#15803d', '#22c55e', '#86efac'],
        };
        const [dark, main, light] = palettes[tile];
        ctx.fillStyle = main;
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = dark;
        for (let ry = 4; ry < s; ry += 9) {
          ctx.fillRect(screenX, screenY + ry, s, 3);
        }
        ctx.fillStyle = light;
        ctx.fillRect(screenX + 2, screenY + 1, s - 4, 2);
        break;
      }

      case TILE.DOOR: {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(screenX + 6, screenY + 4, s - 12, s - 4);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(screenX + 8, screenY + 6, s - 16, s - 8);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(screenX + s - 13, screenY + 18, 3, 3);
        break;
      }

      case TILE.SIGN: {
        ctx.fillStyle = '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(screenX + 8, screenY + 27, 20, 5);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(screenX + 15, screenY + 18, 6, 12);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(screenX + 5, screenY + 6, 26, 15);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(screenX + 8, screenY + 9, 20, 3);
        ctx.fillRect(screenX + 8, screenY + 14, 15, 3);
        break;
      }

      case TILE.CAVE_DOOR: {
        ctx.fillStyle = '#785a3c';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s, s * 0.42, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s, s * 0.32, Math.PI, 0);
        ctx.fill();
        break;
      }

      case TILE.FOUNTAIN: {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(screenX + 4, screenY + 4, s - 8, s - 8);
        const splash = Math.abs(Math.sin(timeMs * 0.006)) * 5;
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(screenX + 14, screenY + 10 - splash, 8, 12 + splash);
        break;
      }

      case TILE.SHIP_DECK: {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 4);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(screenX, screenY + s - 4, s, 4);
        break;
      }

      case TILE.HEAL_PAD: {
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(screenX, screenY, s, s);
        // Pokéball emblem on Pokémon Center entrance pad
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, 11, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX + s / 2 - 11, screenY + s / 2 - 1.5, 22, 3);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case TILE.ICE_FLOOR: {
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(screenX + 3, screenY + 3, s - 6, s - 6);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(screenX + 6, screenY + 8, 12, 4);
        break;
      }

      default: {
        ctx.fillStyle = '#5ac54f';
        ctx.fillRect(screenX, screenY, s, s);
      }
    }
  }

  drawNPC(ctx, npc, screenX, screenY, timeMs, hasBadge = false) {
    const s = TILE_SIZE;
    const bob = Math.round(Math.sin(timeMs * 0.004 + npc.x) * 1.5);

    if (npc.isSnorlax) {
      // Iconic giant Sleeping Snorlax sprite
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(screenX + s / 2, screenY + s - 4, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#115e59';
      ctx.beginPath();
      ctx.ellipse(screenX + s / 2, screenY + s / 2 + 2, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(screenX + s / 2, screenY + s / 2 + 4, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sleeping eyes & Zzz
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(screenX + 12, screenY + 10, 4, 2);
      ctx.fillRect(screenX + 20, screenY + 10, 4, 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Zzz', screenX + s - 4, screenY + 4 + bob);
      return;
    }

    if (npc.isLegendary) {
      // Legendary Bird Overworld Sprite (Zapdos or Articuno)
      const isZapdos = npc.isLegendary === 'zapdos';
      const flap = Math.round(Math.sin(timeMs * 0.008) * 3);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(screenX + s / 2, screenY + s - 4, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isZapdos ? '#facc15' : '#38bdf8';
      // Wings
      ctx.beginPath();
      ctx.moveTo(screenX + s / 2, screenY + 14);
      ctx.lineTo(screenX - 4, screenY + 4 + flap);
      ctx.lineTo(screenX + 6, screenY + 22);
      ctx.moveTo(screenX + s / 2, screenY + 14);
      ctx.lineTo(screenX + s + 4, screenY + 4 + flap);
      ctx.lineTo(screenX + s - 6, screenY + 22);
      ctx.fill();

      // Body & crest
      ctx.fillStyle = isZapdos ? '#eab308' : '#0284c7';
      ctx.beginPath();
      ctx.arc(screenX + s / 2, screenY + 16, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + s / 2 - 4, screenY + 13, 2, 2);
      ctx.fillRect(screenX + s / 2 + 2, screenY + 13, 2, 2);
      return;
    }

    // Standard Human NPC / Gym Leader sprite
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(screenX + s / 2, screenY + s - 5, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX + 11, screenY + 24, 5, 7);
    ctx.fillRect(screenX + 20, screenY + 24, 5, 7);

    // Torso / Coat
    ctx.fillStyle = npc.outfit || '#3b82f6';
    ctx.fillRect(screenX + 9, screenY + 14 + bob * 0.3, 18, 12);

    // Head
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(screenX + 10, screenY + 5 + bob * 0.3, 16, 11);

    // Hair / Hat
    ctx.fillStyle = npc.hair || '#475569';
    ctx.fillRect(screenX + 9, screenY + 3 + bob * 0.3, 18, 5);

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(screenX + 13, screenY + 10 + bob * 0.3, 2, 3);
    ctx.fillRect(screenX + 21, screenY + 10 + bob * 0.3, 2, 3);

    // Floating Gym Badge indicator above Gym Leaders
    if (npc.badgeId) {
      ctx.fillStyle = hasBadge ? '#22c55e' : '#facc15';
      ctx.beginPath();
      ctx.arc(screenX + s / 2, screenY - 4 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  drawPlayer(ctx, player, screenX, screenY, timeMs) {
    const s = TILE_SIZE;
    const isMoving = player.isMoving;
    const stepPhase = isMoving ? Math.sin(player.walkCycle * 10) : 0;
    const bounce = isMoving ? Math.abs(stepPhase) * 2.5 : Math.sin(timeMs * 0.004) * 0.6;
    const jumpOffset = player.jumpHeight || 0;

    // Ground / Water Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.ellipse(screenX + s / 2, screenY + s - 5, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const drawY = screenY - bounce - jumpOffset;

    // If Surfing on water, draw Lapras mount underneath player!
    if (player.mode === 'surf') {
      const surfBob = Math.sin(timeMs * 0.006) * 2;
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(screenX + s / 2, screenY + s - 6, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lapras shell & head
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(screenX + s / 2, drawY + 24 + surfBob, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      const headOffsetX = player.dir === 'left' ? -12 : player.dir === 'right' ? 12 : 0;
      ctx.fillRect(screenX + s / 2 + headOffsetX - 4, drawY + 12 + surfBob, 8, 12);
    }

    // If Riding Bicycle, draw Bicycle wheels & frame!
    if (player.mode === 'bike') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(screenX + 10, drawY + 28, 5, 0, Math.PI * 2);
      ctx.arc(screenX + 26, drawY + 28, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(screenX + 10, drawY + 28);
      ctx.lineTo(screenX + 18, drawY + 21);
      ctx.lineTo(screenX + 26, drawY + 28);
      ctx.stroke();
    }

    // Legs / Striding animation
    const leftLegY = drawY + 23 + (stepPhase > 0 ? -2.5 : 1);
    const rightLegY = drawY + 23 + (stepPhase < 0 ? -2.5 : 1);
    ctx.fillStyle = '#1d4ed8'; // Classic blue jeans
    ctx.fillRect(screenX + 11, leftLegY, 6, 7);
    ctx.fillRect(screenX + 19, rightLegY, 6, 7);

    // Running Shoes (Red & White)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(screenX + 10, leftLegY + 5, 7, 3);
    ctx.fillRect(screenX + 19, rightLegY + 5, 7, 3);

    // Trainer Jacket (Iconic Kanto Red Jacket with White Trim)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(screenX + 8, drawY + 13, 20, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(screenX + 15, drawY + 13, 6, 11);

    // Backpack (visible from side/up)
    if (player.dir === 'up' || player.dir === 'left' || player.dir === 'right') {
      ctx.fillStyle = '#eab308';
      const bagX = player.dir === 'left' ? screenX + 22 : player.dir === 'right' ? screenX + 5 : screenX + 10;
      ctx.fillRect(bagX, drawY + 14, 16 && (player.dir === 'up' ? 16 : 6), 10);
    }

    // Arms swinging
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(screenX + 5, drawY + 14 - stepPhase * 2, 4, 9);
    ctx.fillRect(screenX + 27, drawY + 14 + stepPhase * 2, 4, 9);

    // Head / Face
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(screenX + 9, drawY + 4, 18, 11);

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX + 8, drawY + 5, 20, 4);

    // Directional Eyes
    ctx.fillStyle = '#0f172a';
    if (player.dir === 'down') {
      ctx.fillRect(screenX + 12, drawY + 9, 3, 4);
      ctx.fillRect(screenX + 21, drawY + 9, 3, 4);
    } else if (player.dir === 'left') {
      ctx.fillRect(screenX + 10, drawY + 9, 3, 4);
    } else if (player.dir === 'right') {
      ctx.fillRect(screenX + 23, drawY + 9, 3, 4);
    }

    // Iconic Kanto Trainer Red Cap with White Front Semicircle
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(screenX + 8, drawY + 1, 20, 6);
    ctx.fillStyle = '#ffffff';
    if (player.dir !== 'up') {
      const badgeX = player.dir === 'left' ? screenX + 9 : player.dir === 'right' ? screenX + 21 : screenX + 14;
      ctx.fillRect(badgeX, drawY + 2, 8, 3);
    }
    // Cap visor
    ctx.fillStyle = '#b91c1c';
    if (player.dir === 'down') {
      ctx.fillRect(screenX + 8, drawY + 5, 20, 2);
    } else if (player.dir === 'left') {
      ctx.fillRect(screenX + 5, drawY + 5, 12, 2);
    } else if (player.dir === 'right') {
      ctx.fillRect(screenX + 19, drawY + 5, 12, 2);
    }
  }
}
