import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  TILE,
  CITIES,
  LANDMARKS,
  ROUTES,
  GYM_BADGES,
  NPCS,
  SIGNS,
  CRYSTAL_EVENTS,
} from './kanto-data.js';
import { KantoMap } from './kanto-map.js';
import { SpriteRenderer } from './sprites.js';
import { JoypadController } from './joypad.js';
import { KantoAudio } from './audio.js';

class KantoExplorerApp {
  constructor() {
    this.canvas = document.getElementById('world-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.titleScreenEl = document.getElementById('title-screen');
    this.titleCanvas = document.getElementById('title-canvas');
    this.titleCtx = this.titleCanvas.getContext('2d');
    this.titleStageBadge = document.getElementById('title-stage-indicator');

    this.map = new KantoMap();
    this.sprites = new SpriteRenderer();
    this.audio = new KantoAudio();

    // Player state (Starts in Pallet Town square looking toward Route 1 & Oak's Lab)
    this.player = {
      x: 42.5,
      y: 95.5,
      dir: 'down',
      mode: 'walk', // 'walk' | 'run' | 'bike' | 'surf'
      bikeActive: false,
      isMoving: false,
      walkCycle: 0,
      jumpTimer: 0,
      jumpHeight: 0,
      stepsTaken: 0,
    };

    // Camera state (world tile coordinates)
    this.camera = {
      x: this.player.x,
      y: this.player.y,
      zoom: 1.0,
    };

    // Title sequence state
    this.inTitleSequence = true;
    this.titleStartTime = performance.now();
    this.titleStars = Array.from({ length: 70 }, (_, i) => ({
      x: ((i * 97) % 100) / 100,
      y: ((i * 53) % 100) / 100,
      size: (i % 3) + 1.2,
      phase: i * 0.7,
    }));

    // Progression, Crystal Story Events & Discovery state
    this.collectedBadges = new Set();
    this.completedCrystalEvents = new Set();
    this.crystalKeyItems = new Set(['GS Ball']);
    this.activeCutscene = null; // { event, stepIndex, stepStartTime }
    this.cutsceneCooldown = 0;

    this.discoveredRegions = new Set(['pallet-town']);
    this.sightedPokemon = new Set(['Pikachu']);
    this.currentRegion = this.map.getRegionAt(Math.floor(this.player.x), Math.floor(this.player.y));
    this.waypoint = {
      x: CRYSTAL_EVENTS[3].x,
      y: CRYSTAL_EVENTS[3].y,
      name: 'Viridian Forest GS Ball Shrine',
    };
    this.grassCooldown = 0;
    this.healCooldown = 0;
    this.particles = [];

    this.initUI();
    this.initJoypad();
    this.preRenderMinimapBase();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  initUI() {
    // Title sequence start button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.dismissTitleSequence();
      });
    }

    // Clicking anywhere on the title canvas also starts
    this.titleCanvas?.addEventListener('click', () => {
      this.dismissTitleSequence();
    });

    // Replay Title Button in HUD
    document.getElementById('btn-replay-title')?.addEventListener('click', () => {
      this.openTitleSequence();
    });

    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound');
    soundBtn?.addEventListener('click', () => {
      const on = this.audio.toggle();
      soundBtn.textContent = on ? '🔊 SFX ON' : '🔇 MUTED';
      soundBtn.classList.toggle('is-muted', !on);
    });

    // Zoom Toggle
    const zoomBtn = document.getElementById('btn-zoom');
    zoomBtn?.addEventListener('click', () => {
      const levels = [1.0, 1.25, 0.8];
      const idx = levels.indexOf(this.camera.zoom);
      this.camera.zoom = levels[(idx + 1) % levels.length];
      zoomBtn.textContent = `🔍 ${Math.round(this.camera.zoom * 100)}%`;
    });

    // Joypad Mode Toggle
    const padStyleBtn = document.getElementById('btn-joypad-style');
    const joypadHousing = document.getElementById('joypad-base');
    padStyleBtn?.addEventListener('click', () => {
      const isClassic = joypadHousing?.classList.toggle('classic-dpad-mode');
      padStyleBtn.textContent = isClassic ? '🕹️ D-PAD' : '🕹️ ANALOG';
      this.audio.playBlip(520, 0.05);
    });

    // Crystal Story Events Modal Toggle
    document.getElementById('btn-crystal-quests')?.addEventListener('click', () => {
      this.toggleCrystalModal(true);
    });
    document.getElementById('btn-close-crystal')?.addEventListener('click', () => {
      this.toggleCrystalModal(false);
    });

    // Mini-map click opens Full Town Map
    document.getElementById('minimap-card')?.addEventListener('click', () => {
      this.toggleTownMapModal(true);
    });
    document.getElementById('btn-open-map-hud')?.addEventListener('click', () => {
      this.toggleTownMapModal(true);
    });
    document.getElementById('btn-close-map')?.addEventListener('click', () => {
      this.toggleTownMapModal(false);
    });

    // Dialog Box continue / advance cutscene button
    document.getElementById('btn-dialog-ok')?.addEventListener('click', () => {
      this.handleDialogAdvance();
    });

    // Tap directly on canvas to interact with adjacent NPC/Sign/Crystal Event
    this.canvas.addEventListener('click', () => {
      if (!this.inTitleSequence) {
        if (this.activeCutscene) {
          this.handleDialogAdvance();
        } else {
          this.interactWithFacingTile();
        }
      }
    });

    this.buildTownMapModalContent();
    this.buildCrystalModalContent();
    this.updateHUD();
  }

  initJoypad() {
    this.joypad = new JoypadController({
      baseEl: document.getElementById('joypad-base'),
      stickEl: document.getElementById('joypad-stick'),
      dirButtons: Array.from(document.querySelectorAll('[data-dpad-btn]')),
      readoutEl: document.getElementById('joypad-readout'),
      btnA: document.getElementById('btn-a'),
      btnB: document.getElementById('btn-b'),
      btnBike: document.getElementById('btn-bike'),
      btnMap: document.getElementById('btn-map'),
      onInteract: () => {
        if (this.inTitleSequence) {
          this.dismissTitleSequence();
          return;
        }
        const dialogEl = document.getElementById('dialog-box');
        if (dialogEl && !dialogEl.classList.contains('hidden')) {
          this.handleDialogAdvance();
        } else {
          this.interactWithFacingTile();
        }
      },
      onToggleBike: () => this.toggleBicycle(),
      onToggleMap: () => this.toggleTownMapModal(),
    });
  }

  openTitleSequence() {
    this.inTitleSequence = true;
    this.titleStartTime = performance.now();
    this.titleScreenEl?.classList.remove('is-dismissed');
  }

  dismissTitleSequence() {
    if (!this.inTitleSequence) return;
    this.inTitleSequence = false;
    this.audio.playStartFanfare();
    this.titleScreenEl?.classList.add('is-dismissed');
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.showBanner(this.currentRegion.name, this.currentRegion.subtitle, this.currentRegion.color);
  }

  toggleBicycle() {
    if (this.player.mode === 'surf') {
      this.showToast('🌊 Cannot ride the Bicycle while Surfing on Lapras!');
      return;
    }
    this.player.bikeActive = !this.player.bikeActive;
    this.audio.playBikeBell();
    const bikeBtn = document.getElementById('btn-bike');
    bikeBtn?.classList.toggle('is-active', this.player.bikeActive);
    this.showToast(
      this.player.bikeActive
        ? '🚲 Mounted the Miracle Cycle! Move with the Joypad at 2x speed!'
        : '👟 Dismounted Bicycle. Walking / Running Shoes active.'
    );
    this.updateHUD();
  }

  handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    if (this.titleCanvas) {
      this.titleCanvas.width = Math.floor(w * dpr);
      this.titleCanvas.height = Math.floor(h * dpr);
      this.titleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  preRenderMinimapBase() {
    this.minimapBase = document.createElement('canvas');
    this.minimapBase.width = MAP_WIDTH;
    this.minimapBase.height = MAP_HEIGHT;
    const mctx = this.minimapBase.getContext('2d');

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const t = this.map.getTile(x, y);
        let c = '#4bb340';
        if (t === TILE.DEEP_WATER) c = '#0c4a6e';
        else if (t === TILE.WATER) c = '#0284c7';
        else if (t === TILE.SAND) c = '#fcd34d';
        else if (t === TILE.ROAD || t === TILE.BRIDGE) c = '#f59e0b';
        else if (t === TILE.CYCLING_ROAD) c = '#94a3b8';
        else if (t === TILE.PAVED || t === TILE.PLAZA) c = '#e2e8f0';
        else if (t === TILE.TREE || t === TILE.FOREST_TREE) c = '#15803d';
        else if (t === TILE.MOUNTAIN) c = '#78350f';
        else if (t === TILE.ROOF_RED || t === TILE.ROOF_GOLD || t === TILE.ROOF_BLUE) c = '#ef4444';
        else if (t === TILE.CRYSTAL_SHRINE) c = '#38bdf8';
        mctx.fillStyle = c;
        mctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // ===========================================================================
  // POKÉMON CRYSTAL-EXCLUSIVE SCRIPTED STORY EVENTS ENGINE
  // ===========================================================================
  startCrystalEvent(evt, warpPlayer = false) {
    if (!evt) return;
    this.toggleCrystalModal(false);
    this.toggleTownMapModal(false);

    if (warpPlayer) {
      this.player.x = evt.x + 0.5;
      this.player.y = evt.y + 0.5;
      this.player.dir = 'up';
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      this.currentRegion = this.map.getRegionAt(evt.x, evt.y);
      this.discoveredRegions.add(this.currentRegion.id);
    }

    this.player.isMoving = false;
    this.activeCutscene = {
      event: evt,
      stepIndex: 0,
      stepStartTime: performance.now(),
    };

    this.audio.playCrystalChime();
    this.spawnLeafParticles(evt.x + 0.5, evt.y + 0.5, evt.color);
    this.renderCurrentCutsceneStep();
  }

  renderCurrentCutsceneStep() {
    if (!this.activeCutscene) return;
    const { event, stepIndex } = this.activeCutscene;
    const step = event.steps[stepIndex];
    if (!step) return;

    const stepBadge = document.getElementById('dialog-step-badge');
    const okBtn = document.getElementById('btn-dialog-ok');
    if (stepBadge) {
      stepBadge.textContent = `💎 ${event.chapter} • SCENE ${stepIndex + 1}/${event.steps.length}`;
      stepBadge.classList.remove('hidden');
    }
    if (okBtn) {
      okBtn.textContent =
        stepIndex + 1 < event.steps.length ? 'A • NEXT SCENE ▸' : 'A • COMPLETE EVENT ★';
    }

    this.openDialog(step.speaker, step.text, true);
  }

  handleDialogAdvance() {
    if (this.activeCutscene) {
      const { event, stepIndex } = this.activeCutscene;
      if (stepIndex + 1 < event.steps.length) {
        this.activeCutscene.stepIndex += 1;
        this.activeCutscene.stepStartTime = performance.now();
        this.audio.playBlip(740, 0.06);
        this.spawnLeafParticles(event.x + 0.5, event.y + 0.5, event.color);
        this.renderCurrentCutsceneStep();
      } else {
        // Complete the scripted Crystal story event!
        this.completedCrystalEvents.add(event.id);
        if (event.rewardItem) this.crystalKeyItems.add(event.rewardItem);
        if (event.pokemonUnlocked) this.sightedPokemon.add(event.pokemonUnlocked);
        this.activeCutscene = null;
        this.cutsceneCooldown = 3.5;
        this.audio.playBadgeFanfare();
        this.closeDialog();
        this.buildCrystalModalContent();
        this.updateHUD();
        this.showToast(
          `💎 CRYSTAL EVENT COMPLETED: "${event.title}"! Obtained ${event.rewardItem}!`
        );
      }
      return;
    }
    this.closeDialog();
  }

  buildCrystalModalContent() {
    const listEl = document.getElementById('crystal-events-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    for (const evt of CRYSTAL_EVENTS) {
      const isDone = this.completedCrystalEvents.has(evt.id);
      const card = document.createElement('div');
      card.className = `crystal-event-card ${isDone ? 'is-completed' : ''}`;
      card.innerHTML = `
        <div>
          <div class="crystal-card-top">
            <span class="crystal-chapter-tag">${evt.chapter}</span>
            <span class="crystal-status-pill ${isDone ? 'done' : ''}">
              ${isDone ? '✓ COMPLETED' : '💎 ACTIVE ON MAP'}
            </span>
          </div>
          <div class="crystal-card-title">${evt.title}</div>
          <div class="crystal-card-loc">📍 ${evt.locationName} (X:${evt.x}, Y:${evt.y})</div>
        </div>
        <p class="crystal-card-desc">${evt.summary}</p>
        <div class="crystal-card-reward">🎁 Reward: ${evt.rewardItem} • Pokédex: ${evt.pokemonUnlocked}</div>
        <div class="crystal-card-actions">
          <button type="button" class="map-btn-waypoint" data-crystal-guide="${evt.id}">
            🧭 Compass Guide
          </button>
          <button type="button" class="btn-crystal-trigger" data-crystal-trigger="${evt.id}">
            🎬 ${isDone ? 'Replay Scene' : 'Trigger Scene'}
          </button>
        </div>
      `;

      card.querySelector('[data-crystal-guide]')?.addEventListener('click', () => {
        this.waypoint = { x: evt.x, y: evt.y, name: evt.title };
        this.audio.playBlip(660, 0.06);
        this.toggleCrystalModal(false);
        this.showToast(`🧭 Compass Waypoint set to Crystal Event: ${evt.locationName}!`);
        this.updateHUD();
      });

      card.querySelector('[data-crystal-trigger]')?.addEventListener('click', () => {
        this.startCrystalEvent(evt, true);
      });

      listEl.appendChild(card);
    }
  }

  toggleCrystalModal(forceState) {
    const modal = document.getElementById('crystal-modal');
    if (!modal) return;
    const shouldOpen =
      typeof forceState === 'boolean' ? forceState : modal.classList.contains('hidden');
    if (shouldOpen) this.buildCrystalModalContent();
    modal.classList.toggle('hidden', !shouldOpen);
    this.audio.playBlip(shouldOpen ? 680 : 440, 0.05);
  }

  update(dt, timeMs) {
    void timeMs;
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.grassCooldown > 0) this.grassCooldown -= dt;
    if (this.healCooldown > 0) this.healCooldown -= dt;
    if (this.cutsceneCooldown > 0) this.cutsceneCooldown -= dt;

    // During an active scripted Crystal cutscene, smoothly pan camera to the scene center
    if (this.activeCutscene) {
      const evt = this.activeCutscene.event;
      const lerp = Math.min(1, dt * 8);
      this.camera.x += (evt.x + 0.5 - this.camera.x) * lerp;
      this.camera.y += (evt.y - 0.5 - this.camera.y) * lerp;
      return;
    }

    // Ledge hop animation timer
    if (this.player.jumpTimer > 0) {
      this.player.jumpTimer = Math.max(0, this.player.jumpTimer - dt);
      const progress = 1 - this.player.jumpTimer / 0.28;
      this.player.jumpHeight = Math.sin(progress * Math.PI) * 14;
      this.player.y += dt * 6.5;
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      return;
    } else {
      this.player.jumpHeight = 0;
    }

    // Read Joypad state
    const pad = this.joypad.getState();

    if (pad.active) {
      this.player.isMoving = true;
      if (pad.dir) this.player.dir = pad.dir;

      const curTile = this.map.getTile(Math.floor(this.player.x), Math.floor(this.player.y));
      if (curTile === TILE.WATER) {
        this.player.mode = 'surf';
      } else if (this.player.bikeActive || curTile === TILE.CYCLING_ROAD) {
        this.player.mode = 'bike';
      } else if (pad.isRunning) {
        this.player.mode = 'run';
      } else {
        this.player.mode = 'walk';
      }

      const baseSpeed =
        this.player.mode === 'bike'
          ? 9.2
          : this.player.mode === 'surf'
          ? 7.2
          : this.player.mode === 'run'
          ? 6.8
          : 4.5;

      const speed = baseSpeed * Math.max(0.55, pad.magnitude);
      const moveX = pad.vx * speed * dt;
      const moveY = pad.vy * speed * dt;

      this.movePlayerWithSlide(moveX, moveY);
      this.player.walkCycle += dt * (speed * 0.28);
      this.audio.playStep(this.player.mode);
    } else {
      this.player.isMoving = false;
      const curTile = this.map.getTile(Math.floor(this.player.x), Math.floor(this.player.y));
      if (curTile === TILE.WATER) this.player.mode = 'surf';
      else if (this.player.bikeActive) this.player.mode = 'bike';
      else this.player.mode = 'walk';
    }

    // Smooth camera follow
    const lerp = Math.min(1, dt * 12);
    this.camera.x += (this.player.x - this.camera.x) * lerp;
    this.camera.y += (this.player.y - this.camera.y) * lerp;

    // Check current tile triggers
    const tx = Math.floor(this.player.x);
    const ty = Math.floor(this.player.y);
    this.checkTileTriggers(tx, ty);
  }

  canOccupy(x, y) {
    const r = 0.28;
    const points = [
      [x - r, y - r],
      [x + r, y - r],
      [x - r, y + r],
      [x + r, y + r],
    ];
    for (const [px, py] of points) {
      const tx = Math.floor(px);
      const ty = Math.floor(py);
      if (this.map.isSolid(tx, ty)) return false;
      if (this.map.isLedge(tx, ty)) return false;
      for (const npc of NPCS) {
        if (tx === npc.x && ty === npc.y) return false;
      }
    }
    return true;
  }

  movePlayerWithSlide(dx, dy) {
    const startX = this.player.x;
    const startY = this.player.y;

    // One-way cliff ledge hop downward
    if (dy > 0.01 && Math.abs(dy) >= Math.abs(dx)) {
      const targetTileX = Math.floor(this.player.x);
      const ledgeTileY = Math.floor(this.player.y + 0.55);
      if (
        this.map.isLedge(targetTileX, ledgeTileY) &&
        !this.map.isSolid(targetTileX, ledgeTileY + 1)
      ) {
        this.player.dir = 'down';
        this.player.jumpTimer = 0.28;
        this.audio.playLedgeHop();
        this.spawnLeafParticles(this.player.x, this.player.y + 1, '#d97706');
        return;
      }
    }

    if (dx !== 0) {
      if (this.canOccupy(this.player.x + dx, this.player.y)) {
        this.player.x += dx;
      } else {
        const slideStep = Math.abs(dx) * 0.65;
        if (this.canOccupy(this.player.x + dx, this.player.y - slideStep)) {
          this.player.y -= slideStep;
        } else if (this.canOccupy(this.player.x + dx, this.player.y + slideStep)) {
          this.player.y += slideStep;
        }
      }
    }

    if (dy !== 0) {
      if (this.canOccupy(this.player.x, this.player.y + dy)) {
        this.player.y += dy;
      } else {
        const slideStep = Math.abs(dy) * 0.65;
        if (this.canOccupy(this.player.x - slideStep, this.player.y + dy)) {
          this.player.x -= slideStep;
        } else if (this.canOccupy(this.player.x + slideStep, this.player.y + dy)) {
          this.player.x += slideStep;
        }
      }
    }

    const distMoved = Math.hypot(this.player.x - startX, this.player.y - startY);
    this.player.stepsTaken += distMoved;
  }

  checkTileTriggers(tx, ty) {
    // 1. Check proximity to uncompleted Pokémon Crystal Scripted Story Events!
    if (!this.activeCutscene && this.cutsceneCooldown <= 0) {
      for (const evt of CRYSTAL_EVENTS) {
        if (this.completedCrystalEvents.has(evt.id)) continue;
        const dist = Math.hypot(this.player.x - (evt.x + 0.5), this.player.y - (evt.y + 0.5));
        if (dist <= evt.triggerRadius) {
          this.startCrystalEvent(evt, false);
          return;
        }
      }
    }

    // 2. Region transition check
    const region = this.map.getRegionAt(tx, ty);
    if (region.id !== this.currentRegion.id) {
      this.currentRegion = region;
      this.discoveredRegions.add(region.id);
      this.showBanner(region.name, region.subtitle, region.color);
      this.updateHUD();
    }

    // 3. Waypoint arrival check
    if (this.waypoint && Math.hypot(tx - this.waypoint.x, ty - this.waypoint.y) < 3.2) {
      this.showToast(`📍 Arrived at destination: ${this.waypoint.name}!`);
      this.audio.playBlip(784, 0.08);
      this.waypoint = null;
      this.updateHUD();
    }

    // 4. Pokémon Center Healing Pad
    if (this.map.getTile(tx, ty) === TILE.HEAL_PAD && this.healCooldown <= 0) {
      this.healCooldown = 5.0;
      this.audio.playHealJingle();
      this.spawnLeafParticles(this.player.x, this.player.y, '#f43f5e');
      this.showToast('💖 Pokémon Center: Your Pokémon team has been restored to full health!');
    }

    // 5. Tall Grass rustle & Wild Kanto Pokémon Sighting
    if (this.map.isTallGrass(tx, ty) && this.player.isMoving && this.grassCooldown <= 0) {
      this.grassCooldown = 1.6;
      this.spawnLeafParticles(tx + 0.5, ty + 0.5, '#22c55e');
      const pool = this.currentRegion.pokemon || [
        'Pidgey',
        'Pikachu',
        'Eevee',
        'Bulbasaur',
        'Charmander',
        'Squirtle',
      ];
      const wild = pool[Math.floor(Math.random() * pool.length)];
      const isNew = !this.sightedPokemon.has(wild);
      this.sightedPokemon.add(wild);
      if (isNew || Math.random() < 0.45) {
        this.audio.playBlip(659, 0.05);
        this.showToast(
          isNew
            ? `✨ NEW KANTO POKÉDEX SIGHTING: Wild ${wild} appeared in ${this.currentRegion.name}!`
            : `🌿 Wild ${wild} rustled through the tall grass in ${this.currentRegion.name}!`
        );
        this.updateHUD();
      }
    }
  }

  spawnLeafParticles(wx, wy, color = '#4ade80') {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      this.particles.push({
        x: wx,
        y: wy,
        vx: Math.cos(angle) * 2.4,
        vy: Math.sin(angle) * 2.4 - 1.0,
        color,
        life: 0.5,
      });
    }
  }

  interactWithFacingTile() {
    const dirOffsets = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [ox, oy] = dirOffsets[this.player.dir] || [0, 1];
    const ptx = Math.floor(this.player.x);
    const pty = Math.floor(this.player.y);
    const targetX = ptx + ox;
    const targetY = pty + oy;

    // 0. Check nearby Crystal Scripted Story Event (allows triggering or replaying with A button!)
    const crystalEvt = CRYSTAL_EVENTS.find(
      (e) => Math.hypot(e.x - ptx, e.y - pty) <= 3.0
    );
    if (crystalEvt) {
      this.startCrystalEvent(crystalEvt, false);
      return;
    }

    // 1. Check NPCs
    const npc =
      NPCS.find((n) => n.x === targetX && n.y === targetY) ||
      NPCS.find((n) => Math.abs(n.x - ptx) <= 1 && Math.abs(n.y - pty) <= 1);

    if (npc) {
      if (npc.badgeId) {
        const badge = GYM_BADGES.find((b) => b.id === npc.badgeId);
        if (badge && !this.collectedBadges.has(badge.id)) {
          this.collectedBadges.add(badge.id);
          this.audio.playBadgeFanfare();
          this.spawnLeafParticles(npc.x + 0.5, npc.y + 0.5, '#facc15');
          this.openDialog(
            `🏅 ${npc.name} — ${badge.name.toUpperCase()} EARNED!`,
            `${badge.quote}\n\nYou received the ${badge.name} (${this.collectedBadges.size}/8 Kanto Gym Badges)!`
          );
          this.updateHUD();
          return;
        }
      }
      if (npc.isLegendary) {
        this.sightedPokemon.add(npc.name.replace('Legendary ', ''));
        this.audio.playBadgeFanfare();
        this.updateHUD();
      }
      this.audio.playBlip(587, 0.06);
      this.openDialog(`${npc.name} (${npc.role})`, npc.dialog);
      return;
    }

    // 2. Check Signs
    const sign =
      SIGNS.find((s) => s.x === targetX && s.y === targetY) ||
      SIGNS.find((s) => Math.abs(s.x - ptx) <= 1 && Math.abs(s.y - pty) <= 1);
    if (sign) {
      this.audio.playBlip(523, 0.05);
      this.openDialog(`🪧 ${sign.title}`, sign.text);
      return;
    }

    // 3. Check Building Doors
    const building = this.map.buildings.find(
      (b) =>
        (b.doorX === targetX && b.doorY === targetY) ||
        (Math.abs(b.doorX - ptx) <= 1 && Math.abs(b.doorY - pty) <= 1)
    );
    if (building) {
      if (building.type === 'pokecenter') {
        this.audio.playHealJingle();
        this.openDialog(
          `🏥 ${building.label}`,
          'Nurse Joy: “Welcome to our Pokémon Center! We’ve restored your tired Pokémon to full health. We hope to see you again!”'
        );
      } else if (building.type === 'gym') {
        this.audio.playBlip(660, 0.06);
        this.openDialog(
          `🏛️ ${building.label}`,
          `Official Pokémon League Gym in ${this.currentRegion.name}. Talk to the Gym Leader standing outside to earn this city’s Gym Badge!`
        );
      } else {
        this.audio.playBlip(520, 0.05);
        this.openDialog(
          `🏠 ${building.label}`,
          `You inspected ${building.label} in ${this.currentRegion.name}. (${this.currentRegion.description})`
        );
      }
      return;
    }

    this.audio.playBlip(440, 0.04);
    this.showToast(`🧭 Exploring ${this.currentRegion.name} — ${this.currentRegion.subtitle}`);
  }

  openDialog(title, body, isCutscene = false) {
    const box = document.getElementById('dialog-box');
    const titleEl = document.getElementById('dialog-title');
    const textEl = document.getElementById('dialog-text');
    const stepBadge = document.getElementById('dialog-step-badge');
    const okBtn = document.getElementById('btn-dialog-ok');
    if (!box || !titleEl || !textEl) return;
    if (!isCutscene) {
      stepBadge?.classList.add('hidden');
      if (okBtn) okBtn.textContent = 'A • CONTINUE ▾';
    }
    titleEl.textContent = title;
    textEl.textContent = body;
    box.classList.remove('hidden');
  }

  closeDialog() {
    const box = document.getElementById('dialog-box');
    if (box) box.classList.add('hidden');
    this.audio.playBlip(480, 0.04);
  }

  showBanner(title, subtitle, accentColor = '#22c55e') {
    const banner = document.getElementById('region-banner');
    const titleEl = document.getElementById('banner-title');
    const subEl = document.getElementById('banner-subtitle');
    if (!banner || !titleEl || !subEl) return;
    titleEl.textContent = title;
    subEl.textContent = subtitle;
    banner.style.borderColor = accentColor;
    banner.classList.add('is-visible');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      banner.classList.remove('is-visible');
    }, 3200);
  }

  showToast(message) {
    const toast = document.getElementById('discovery-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3400);
  }

  updateHUD() {
    const locNameEl = document.getElementById('hud-location-name');
    const locSubEl = document.getElementById('hud-location-sub');
    const coordsEl = document.getElementById('hud-coords');
    const crystalCountEl = document.getElementById('hud-crystal-count');
    const badgesEl = document.getElementById('hud-badges-count');
    const dexEl = document.getElementById('hud-dex-count');
    const modeBadgeEl = document.getElementById('hud-mode-badge');
    const waypointEl = document.getElementById('waypoint-label');

    if (locNameEl) locNameEl.textContent = this.currentRegion.name;
    if (locSubEl) locSubEl.textContent = this.currentRegion.subtitle;
    if (coordsEl) {
      coordsEl.textContent = `X:${Math.floor(this.player.x)} Y:${Math.floor(this.player.y)}`;
    }
    if (crystalCountEl) {
      crystalCountEl.textContent = `${this.completedCrystalEvents.size} / ${CRYSTAL_EVENTS.length}`;
    }
    if (badgesEl) badgesEl.textContent = `${this.collectedBadges.size} / 8`;
    if (dexEl) dexEl.textContent = `${this.sightedPokemon.size}`;
    if (modeBadgeEl) {
      const labels = {
        walk: '👟 WALK',
        run: '⚡ RUN',
        bike: '🚲 BIKE',
        surf: '🌊 SURF (LAPRAS)',
      };
      modeBadgeEl.textContent = labels[this.player.mode] || '👟 WALK';
    }
    if (waypointEl) {
      if (this.waypoint) {
        const dist = Math.round(
          Math.hypot(this.player.x - this.waypoint.x, this.player.y - this.waypoint.y)
        );
        waypointEl.textContent = `🧭 ${this.waypoint.name} (${dist}m)`;
      } else {
        waypointEl.textContent = '🧭 Tap Map to set Waypoint';
      }
    }
  }

  buildTownMapModalContent() {
    const listEl = document.getElementById('town-map-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const allDestinations = [
      ...CITIES.map((c) => ({ ...c, group: 'City / Town' })),
      ...LANDMARKS.map((l) => ({ ...l, group: 'Landmark' })),
    ];

    for (const dest of allDestinations) {
      const item = document.createElement('div');
      item.className = 'map-dest-card';
      item.innerHTML = `
        <div class="map-dest-header">
          <span class="map-dest-dot" style="background:${dest.color}"></span>
          <div>
            <div class="map-dest-title">${dest.name}</div>
            <div class="map-dest-slogan">${dest.slogan}</div>
          </div>
        </div>
        <p class="map-dest-desc">${dest.description}</p>
        <div class="map-dest-actions">
          <button type="button" class="map-btn-waypoint" data-wp="${dest.id}">🧭 Guide</button>
          <button type="button" class="map-btn-fly" data-fly="${dest.id}">🦅 Fly Here</button>
        </div>
      `;

      item.querySelector('[data-wp]')?.addEventListener('click', () => {
        this.waypoint = { x: dest.spawn.x, y: dest.spawn.y, name: dest.name };
        this.audio.playBlip(660, 0.06);
        this.toggleTownMapModal(false);
        this.showToast(`🧭 Compass Waypoint set to ${dest.name}! Follow the golden arrow.`);
        this.updateHUD();
      });

      item.querySelector('[data-fly]')?.addEventListener('click', () => {
        this.flyToDestination(dest);
      });

      listEl.appendChild(item);
    }
  }

  flyToDestination(dest) {
    this.player.x = dest.spawn.x + 0.5;
    this.player.y = dest.spawn.y + 0.5;
    this.player.dir = 'down';
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.discoveredRegions.add(dest.id);
    this.currentRegion = this.map.getRegionAt(dest.spawn.x, dest.spawn.y);
    this.audio.playBadgeFanfare();
    this.toggleTownMapModal(false);
    this.spawnLeafParticles(this.player.x, this.player.y, dest.color);
    this.showBanner(dest.name, dest.slogan, dest.color);
    this.showToast(`🦅 Pidgeot used FLY! Landed safely in ${dest.name}.`);
    this.updateHUD();
  }

  toggleTownMapModal(forceState) {
    const modal = document.getElementById('town-map-modal');
    if (!modal) return;
    const shouldOpen =
      typeof forceState === 'boolean' ? forceState : modal.classList.contains('hidden');
    modal.classList.toggle('hidden', !shouldOpen);
    this.audio.playBlip(shouldOpen ? 620 : 440, 0.05);
    if (shouldOpen) {
      this.renderFullTownMapOverview();
    }
  }

  renderFullTownMapOverview() {
    const canvas = document.getElementById('full-kanto-map-canvas');
    if (!canvas || !this.minimapBase) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.minimapBase, 0, 0, w, h);

    const sx = w / MAP_WIDTH;
    const sy = h / MAP_HEIGHT;

    // Draw connecting route lines
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
    ctx.lineWidth = 2.5;
    for (const r of ROUTES) {
      ctx.strokeRect(
        r.bounds.x1 * sx,
        r.bounds.y1 * sy,
        (r.bounds.x2 - r.bounds.x1) * sx,
        (r.bounds.y2 - r.bounds.y1) * sy
      );
    }

    // Draw City Nodes & Names
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    for (const city of CITIES) {
      const cx = city.spawn.x * sx;
      const cy = city.spawn.y * sy;
      ctx.fillStyle = city.color;
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      const tw = ctx.measureText(city.name).width + 8;
      ctx.fillRect(cx - tw / 2, cy - 19, tw, 12);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(city.name, cx, cy - 9);
    }

    // Draw Crystal Scripted Event Beacons on Full Map
    for (const evt of CRYSTAL_EVENTS) {
      const ex = evt.x * sx;
      const ey = evt.y * sy;
      ctx.fillStyle = this.completedCrystalEvents.has(evt.id) ? '#4ade80' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(ex, ey - 6);
      ctx.lineTo(ex + 6, ey);
      ctx.lineTo(ex, ey + 6);
      ctx.lineTo(ex - 6, ey);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Player Position Marker
    const px = this.player.x * sx;
    const py = this.player.y * sy;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
      const clickY = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;
      let nearest = null;
      let bestDist = Infinity;
      for (const dest of [...CITIES, ...LANDMARKS]) {
        const d = Math.hypot(dest.spawn.x - clickX, dest.spawn.y - clickY);
        if (d < bestDist) {
          bestDist = d;
          nearest = dest;
        }
      }
      if (nearest && bestDist < 18) {
        this.flyToDestination(nearest);
      }
    };
  }

  renderCrystalEventsAndCutscene(ctx, camPixelX, camPixelY, startCol, endCol, startRow, endRow, timeMs) {
    for (const evt of CRYSTAL_EVENTS) {
      if (evt.x < startCol - 8 || evt.x > endCol + 8 || evt.y < startRow - 8 || evt.y > endRow + 8)
        continue;

      const isActive = this.activeCutscene && this.activeCutscene.event.id === evt.id;
      const isCompleted = this.completedCrystalEvents.has(evt.id);
      const stepIdx = isActive ? this.activeCutscene.stepIndex : 0;
      const stepProgress = isActive
        ? Math.min(1, (timeMs - this.activeCutscene.stepStartTime) / 900)
        : 0;

      // Ground Crystal Beacon Ring
      const bx = Math.round((evt.x + 0.5) * TILE_SIZE - camPixelX);
      const by = Math.round((evt.y + 0.5) * TILE_SIZE - camPixelY);
      const pulseR = 14 + Math.sin(timeMs * 0.005) * 4;

      ctx.save();
      ctx.strokeStyle = isCompleted ? 'rgba(74, 222, 128, 0.7)' : evt.color;
      ctx.lineWidth = isActive ? 3.5 : 2;
      ctx.beginPath();
      ctx.arc(bx, by, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      // Special Scripted Cutscene Visual Effects (Aurora Rings, Time Ripples, Trinity Lightning)
      if (isActive) {
        for (let r = 1; r <= 3; r++) {
          const ringR = ((timeMs * 0.06 + r * 28) % 90) + 12;
          ctx.strokeStyle = evt.color;
          ctx.globalAlpha = Math.max(0.1, 1 - ringR / 102);
          ctx.beginPath();
          ctx.arc(bx, by, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // Draw Event Actors (Suicune, Eusine, Celebi, Raikou, Entei, Team Rocket)
      for (const actor of evt.actors) {
        let ax = actor.x;
        let ay = actor.y;
        let jumpArcY = 0;

        if (isActive && stepIdx >= 1) {
          const target = actor.leapTo || actor.walkTo;
          if (target) {
            const t = stepIdx === 1 ? stepProgress : 1;
            ax = actor.x + (target.x - actor.x) * t;
            ay = actor.y + (target.y - actor.y) * t;
            if (actor.leapTo && stepIdx === 1) {
              jumpArcY = Math.sin(t * Math.PI) * 28;
            }
          }
        }

        const sx = Math.round(ax * TILE_SIZE - camPixelX);
        const sy = Math.round(ay * TILE_SIZE - camPixelY - jumpArcY);
        this.sprites.drawCrystalActor(ctx, actor, sx, sy, timeMs, isCompleted);
      }

      // Draw floating Crystal Event title tag when player approaches
      const dist = Math.hypot(evt.x + 0.5 - this.player.x, evt.y + 0.5 - this.player.y);
      if (dist < 6.5 && !isActive) {
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        const tag = isCompleted ? `💎 [A] Replay: ${evt.title}` : `💎 CRYSTAL EVENT: ${evt.title}`;
        const tw = ctx.measureText(tag).width + 12;
        ctx.fillStyle = 'rgba(8, 47, 73, 0.92)';
        ctx.fillRect(bx - tw / 2, by - 34, tw, 15);
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx - tw / 2, by - 34, tw, 15);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillText(tag, bx, by - 23);
      }
    }
  }

  renderWorld(timeMs) {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = '#0f4c81';
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.translate(viewW / 2, viewH / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    const effW = viewW / this.camera.zoom;
    const effH = viewH / this.camera.zoom;

    const camPixelX = this.camera.x * TILE_SIZE;
    const camPixelY = this.camera.y * TILE_SIZE;

    const startCol = Math.max(0, Math.floor((camPixelX - effW / 2) / TILE_SIZE) - 1);
    const endCol = Math.min(MAP_WIDTH - 1, Math.ceil((camPixelX + effW / 2) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor((camPixelY - effH / 2) / TILE_SIZE) - 1);
    const endRow = Math.min(MAP_HEIGHT - 1, Math.ceil((camPixelY + effH / 2) / TILE_SIZE) + 1);

    // 1. Draw visible map tiles
    for (let y = startRow; y <= endRow; y++) {
      const screenY = Math.round(y * TILE_SIZE - camPixelY);
      for (let x = startCol; x <= endCol; x++) {
        const screenX = Math.round(x * TILE_SIZE - camPixelX);
        const tile = this.map.getTile(x, y);
        this.sprites.drawTile(ctx, tile, screenX, screenY, x, y, timeMs);
      }
    }

    // 2. Draw Building Roof Signs
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    for (const b of this.map.buildings) {
      if (b.x + b.w < startCol || b.x > endCol || b.y + b.h < startRow || b.y > endRow) continue;
      const cx = Math.round((b.x + b.w / 2) * TILE_SIZE - camPixelX);
      const cy = Math.round((b.y + 1.15) * TILE_SIZE - camPixelY);
      const labelW = ctx.measureText(b.label).width + 8;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(cx - labelW / 2, cy - 9, labelW, 12);
      ctx.fillStyle = '#fef08a';
      ctx.fillText(b.label, cx, cy);
    }

    // 3. Draw Pokémon Crystal Scripted Story Event Beacons & Actors
    this.renderCrystalEventsAndCutscene(
      ctx,
      camPixelX,
      camPixelY,
      startCol,
      endCol,
      startRow,
      endRow,
      timeMs
    );

    // 4. Draw NPCs in visible bounds
    for (const npc of NPCS) {
      if (npc.x < startCol - 1 || npc.x > endCol + 1 || npc.y < startRow - 1 || npc.y > endRow + 1)
        continue;
      const nx = Math.round(npc.x * TILE_SIZE - camPixelX);
      const ny = Math.round(npc.y * TILE_SIZE - camPixelY);
      const hasBadge = npc.badgeId ? this.collectedBadges.has(npc.badgeId) : false;
      this.sprites.drawNPC(ctx, npc, nx, ny, timeMs, hasBadge);

      const dist = Math.hypot(npc.x + 0.5 - this.player.x, npc.y + 0.5 - this.player.y);
      if (dist < 4.5) {
        ctx.font = 'bold 10px sans-serif';
        const tag = `[A] ${npc.name}`;
        const tw = ctx.measureText(tag).width + 10;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(nx + TILE_SIZE / 2 - tw / 2, ny - 18, tw, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(tag, nx + TILE_SIZE / 2, ny - 8);
      }
    }

    // 5. Draw Player Trainer
    const playerScreenX = Math.round(this.player.x * TILE_SIZE - camPixelX - TILE_SIZE / 2);
    const playerScreenY = Math.round(this.player.y * TILE_SIZE - camPixelY - TILE_SIZE / 2);
    this.sprites.drawPlayer(ctx, this.player, playerScreenX, playerScreenY, timeMs);

    // 6. Draw Particles
    for (const p of this.particles) {
      const px = Math.round(p.x * TILE_SIZE - camPixelX);
      const py = Math.round(p.y * TILE_SIZE - camPixelY);
      ctx.fillStyle = p.color;
      ctx.fillRect(px - 3, py - 3, 6, 6);
    }

    // 7. Draw Compass Waypoint Guiding Arrow around Player
    if (this.waypoint && !this.activeCutscene) {
      const dx = this.waypoint.x + 0.5 - this.player.x;
      const dy = this.waypoint.y + 0.5 - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 3.0) {
        const angle = Math.atan2(dy, dx);
        const orbitR = 46;
        const ax = Math.cos(angle) * orbitR;
        const ay = Math.sin(angle) * orbitR;
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  renderMinimap(timeMs) {
    if (!this.minimapCtx || !this.minimapBase) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.minimapBase, 0, 0, w, h);

    const sx = w / MAP_WIDTH;
    const sy = h / MAP_HEIGHT;

    // City dots
    for (const c of CITIES) {
      ctx.fillStyle = c.color;
      ctx.fillRect(c.spawn.x * sx - 2, c.spawn.y * sy - 2, 4, 4);
    }

    // Crystal Event Diamond Dots on Mini-Map
    for (const evt of CRYSTAL_EVENTS) {
      ctx.fillStyle = this.completedCrystalEvents.has(evt.id) ? '#4ade80' : '#67e8f9';
      ctx.fillRect(evt.x * sx - 2, evt.y * sy - 2, 4, 4);
    }

    // Waypoint marker
    if (this.waypoint) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.waypoint.x * sx, this.waypoint.y * sy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Blinking player dot
    const pulse = Math.sin(timeMs * 0.01) > -0.3;
    if (pulse) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(this.player.x * sx, this.player.y * sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  renderTitleSequence(timeMs) {
    if (!this.inTitleSequence || !this.titleCtx) return;
    const ctx = this.titleCtx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const elapsed = (timeMs - this.titleStartTime) / 1000;

    let stageLabel = 'STAGE 1 • SUICUNE CRYSTAL STARBURST';
    if (elapsed >= 1.6 && elapsed < 3.4) {
      stageLabel = 'STAGE 2 • KANTO & CRYSTAL SHOWCASE';
    } else if (elapsed >= 3.4) {
      stageLabel = 'STAGE 3 • KANTO OVERWORLD READY';
    }
    if (this.titleStageBadge && this.titleStageBadge.textContent !== stageLabel) {
      this.titleStageBadge.textContent = stageLabel;
    }

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(9, 14, 34, 0.88)');
    grad.addColorStop(0.5, 'rgba(14, 38, 68, 0.68)');
    grad.addColorStop(1, 'rgba(10, 18, 36, 0.90)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling Kanto & Crystal Starfield
    for (const s of this.titleStars) {
      const alpha = 0.35 + 0.65 * Math.abs(Math.sin(timeMs * 0.003 + s.phase));
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha.toFixed(2)})`;
      ctx.fillRect(s.x * w, s.y * h * 0.65, s.size, s.size);
    }

    // Animated Crystal Aurora Ribbon & Running Suicune Silhouette across the sky
    const shootProgress = (elapsed * 0.42) % 1.3;
    if (shootProgress <= 1.0) {
      const sx = w * (0.08 + shootProgress * 0.84);
      const sy = h * (0.1 + Math.sin(shootProgress * Math.PI * 2) * 0.04);
      const tailGrad = ctx.createLinearGradient(sx - 120, sy, sx, sy);
      tailGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      tailGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.75)');
      tailGrad.addColorStop(1, 'rgba(103, 232, 249, 0.98)');
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx - 120, sy + 12);
      ctx.quadraticCurveTo(sx - 60, sy - 14, sx, sy);
      ctx.stroke();

      this.sprites.drawCrystalActor(ctx, { type: 'suicune', x: 0, y: 0 }, sx - 18, sy - 18, timeMs);
    }

    // Animated Kanto Mountain & Pokémon Tower Silhouette Horizon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.78);
    ctx.lineTo(w * 0.18, h * 0.68);
    ctx.lineTo(w * 0.35, h * 0.76);
    ctx.lineTo(w * 0.52, h * 0.64);
    ctx.lineTo(w * 0.7, h * 0.75);
    ctx.lineTo(w * 0.85, h * 0.69);
    ctx.lineTo(w, h * 0.77);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  loop(timeMs) {
    const dt = Math.min(0.05, (timeMs - this.lastFrameTime) / 1000);
    this.lastFrameTime = timeMs;

    if (this.inTitleSequence) {
      const elapsed = (timeMs - this.titleStartTime) * 0.0005;
      this.camera.x = 42.5 + Math.sin(elapsed) * 6;
      this.camera.y = 88.0 + Math.cos(elapsed * 0.8) * 7;
      this.renderWorld(timeMs);
      this.renderTitleSequence(timeMs);
    } else {
      this.update(dt, timeMs);
      this.renderWorld(timeMs);
      if (Math.floor(timeMs / 100) !== Math.floor((timeMs - dt * 1000) / 100)) {
        this.updateHUD();
      }
    }

    this.renderMinimap(timeMs);
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__kantoApp = new KantoExplorerApp();
});
