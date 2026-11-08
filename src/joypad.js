// Interactive On-Screen Joypad Controller (Analog Thumbstick + Directional D-Pad + Keyboard Sync)

export class JoypadController {
  constructor({
    baseEl,
    stickEl,
    dirButtons,
    readoutEl,
    btnA,
    btnB,
    btnBike,
    btnMap,
    onInteract,
    onToggleBike,
    onToggleMap,
  }) {
    this.baseEl = baseEl;
    this.stickEl = stickEl;
    this.dirButtons = dirButtons || [];
    this.readoutEl = readoutEl;
    this.btnA = btnA;
    this.btnB = btnB;
    this.btnBike = btnBike;
    this.btnMap = btnMap;

    this.onInteract = onInteract;
    this.onToggleBike = onToggleBike;
    this.onToggleMap = onToggleMap;

    // Normalized movement vector (-1..1)
    this.pointerVec = { x: 0, y: 0 };
    this.buttonDirs = new Set();
    this.keyDirs = new Set();

    this.activePointerId = null;
    this.maxRadius = 44;
    this.deadzone = 0.14;
    this.isRunningHeld = false;

    this.initEvents();
  }

  initEvents() {
    // 1. Draggable Analog Thumbstick & Base
    if (this.baseEl) {
      this.baseEl.addEventListener('pointerdown', (e) => {
        // Ignore if directly clicking a cardinal button that handles its own pointerdown
        if (e.target.closest('[data-dpad-btn]')) return;
        e.preventDefault();
        this.activePointerId = e.pointerId;
        try {
          this.baseEl.setPointerCapture(e.pointerId);
        } catch {}
        this.updateFromPointer(e);
      });

      this.baseEl.addEventListener('pointermove', (e) => {
        if (this.activePointerId !== e.pointerId) return;
        e.preventDefault();
        this.updateFromPointer(e);
      });

      const endPointer = (e) => {
        if (this.activePointerId !== e.pointerId) return;
        this.activePointerId = null;
        this.pointerVec.x = 0;
        this.pointerVec.y = 0;
        this.renderJoypadVisuals();
      };

      this.baseEl.addEventListener('pointerup', endPointer);
      this.baseEl.addEventListener('pointercancel', endPointer);
    }

    // 2. Cardinal Directional Pad Buttons (Up / Down / Left / Right)
    for (const btn of this.dirButtons) {
      const dir = btn.dataset.dir;
      if (!dir) continue;

      const startDir = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.buttonDirs.add(dir);
        try {
          btn.setPointerCapture(e.pointerId);
        } catch {}
        this.renderJoypadVisuals();
      };

      const stopDir = (e) => {
        e.preventDefault();
        this.buttonDirs.delete(dir);
        this.renderJoypadVisuals();
      };

      btn.addEventListener('pointerdown', startDir);
      btn.addEventListener('pointerup', stopDir);
      btn.addEventListener('pointercancel', stopDir);
      btn.addEventListener('pointerleave', stopDir);
    }

    // 3. Action Buttons (A, B, Bike, Map)
    if (this.btnA) {
      this.btnA.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.btnA.classList.add('is-pressed');
        this.onInteract?.();
      });
      const releaseA = () => this.btnA.classList.remove('is-pressed');
      this.btnA.addEventListener('pointerup', releaseA);
      this.btnA.addEventListener('pointercancel', releaseA);
      this.btnA.addEventListener('pointerleave', releaseA);
    }

    if (this.btnB) {
      this.btnB.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.isRunningHeld = true;
        this.btnB.classList.add('is-pressed');
      });
      const releaseB = () => {
        this.isRunningHeld = false;
        this.btnB.classList.remove('is-pressed');
      };
      this.btnB.addEventListener('pointerup', releaseB);
      this.btnB.addEventListener('pointercancel', releaseB);
      this.btnB.addEventListener('pointerleave', releaseB);
    }

    if (this.btnBike) {
      this.btnBike.addEventListener('click', (e) => {
        e.preventDefault();
        this.onToggleBike?.();
      });
    }

    if (this.btnMap) {
      this.btnMap.addEventListener('click', (e) => {
        e.preventDefault();
        this.onToggleMap?.();
      });
    }

    // 4. Keyboard Controls (Synced visually with the On-Screen Joypad!)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        this.keyDirs.add('up');
        this.renderJoypadVisuals();
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        this.keyDirs.add('down');
        this.renderJoypadVisuals();
      } else if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        this.keyDirs.add('left');
        this.renderJoypadVisuals();
      } else if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        this.keyDirs.add('right');
        this.renderJoypadVisuals();
      } else if (key === 'shift' || key === 'x') {
        this.isRunningHeld = true;
        this.btnB?.classList.add('is-pressed');
      } else if (key === ' ' || key === 'enter' || key === 'z') {
        if (!e.repeat) {
          this.btnA?.classList.add('is-pressed');
          this.onInteract?.();
        }
      } else if (key === 'b') {
        if (!e.repeat) this.onToggleBike?.();
      } else if (key === 'm') {
        if (!e.repeat) this.onToggleMap?.();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') this.keyDirs.delete('up');
      else if (key === 'arrowdown' || key === 's') this.keyDirs.delete('down');
      else if (key === 'arrowleft' || key === 'a') this.keyDirs.delete('left');
      else if (key === 'arrowright' || key === 'd') this.keyDirs.delete('right');
      else if (key === 'shift' || key === 'x') {
        this.isRunningHeld = false;
        this.btnB?.classList.remove('is-pressed');
      } else if (key === ' ' || key === 'enter' || key === 'z') {
        this.btnA?.classList.remove('is-pressed');
      }
      this.renderJoypadVisuals();
    });
  }

  updateFromPointer(e) {
    const rect = this.baseEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxR = Math.min(rect.width, rect.height) * 0.34 || this.maxRadius;
    this.maxRadius = maxR;

    if (dist < 1) {
      this.pointerVec.x = 0;
      this.pointerVec.y = 0;
    } else {
      const clamped = Math.min(dist, maxR) / maxR;
      const nx = dx / dist;
      const ny = dy / dist;
      this.pointerVec.x = nx * clamped;
      this.pointerVec.y = ny * clamped;
    }
    this.renderJoypadVisuals();
  }

  getState() {
    let vx = this.pointerVec.x;
    let vy = this.pointerVec.y;

    // Combine D-pad buttons & keyboard if analog stick isn't actively dragged
    if (Math.hypot(vx, vy) < this.deadzone) {
      vx = 0;
      vy = 0;
      if (this.buttonDirs.has('left') || this.keyDirs.has('left')) vx -= 1;
      if (this.buttonDirs.has('right') || this.keyDirs.has('right')) vx += 1;
      if (this.buttonDirs.has('up') || this.keyDirs.has('up')) vy -= 1;
      if (this.buttonDirs.has('down') || this.keyDirs.has('down')) vy += 1;
      const mag = Math.hypot(vx, vy);
      if (mag > 1) {
        vx /= mag;
        vy /= mag;
      }
    }

    const magnitude = Math.min(1, Math.hypot(vx, vy));
    const active = magnitude >= this.deadzone;

    let dir = null;
    if (active) {
      if (Math.abs(vx) > Math.abs(vy)) {
        dir = vx < 0 ? 'left' : 'right';
      } else {
        dir = vy < 0 ? 'up' : 'down';
      }
    }

    return {
      vx: active ? vx : 0,
      vy: active ? vy : 0,
      magnitude: active ? magnitude : 0,
      active,
      dir,
      isRunning: this.isRunningHeld || magnitude > 0.85,
    };
  }

  setSimulatedVector(vx, vy) {
    this.pointerVec.x = Math.max(-1, Math.min(1, vx));
    this.pointerVec.y = Math.max(-1, Math.min(1, vy));
    this.renderJoypadVisuals();
  }

  renderJoypadVisuals() {
    const state = this.getState();
    const offsetPxX = Math.round(state.vx * this.maxRadius);
    const offsetPxY = Math.round(state.vy * this.maxRadius);

    if (this.stickEl) {
      this.stickEl.style.transform = `translate3d(${offsetPxX}px, ${offsetPxY}px, 0)`;
      this.stickEl.classList.toggle('is-active', state.active);
    }

    for (const btn of this.dirButtons) {
      const d = btn.dataset.dir;
      const isLit =
        this.buttonDirs.has(d) ||
        this.keyDirs.has(d) ||
        (d === 'up' && state.vy < -0.35) ||
        (d === 'down' && state.vy > 0.35) ||
        (d === 'left' && state.vx < -0.35) ||
        (d === 'right' && state.vx > 0.35);
      btn.classList.toggle('is-active', isLit);
    }

    if (this.readoutEl) {
      if (!state.active) {
        this.readoutEl.textContent = 'IDLE';
      } else {
        const dirLabel = state.dir ? state.dir.toUpperCase() : 'MOVE';
        this.readoutEl.textContent = dirLabel;
      }
    }
  }
}
