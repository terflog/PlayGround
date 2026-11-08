// Retro GBA/GBC Chiptune & SFX Synthesizer using Web Audio API

export class KantoAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastStepTime = 0;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playBlip(660, 0.08);
    }
    return this.enabled;
  }

  playTone(freq, duration = 0.08, type = 'square', volume = 0.06, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playBlip(freq = 587.33, duration = 0.06) {
    this.playTone(freq, duration, 'square', 0.05, 0);
    this.playTone(freq * 1.25, duration, 'square', 0.04, duration * 0.7);
  }

  playStep(mode = 'walk') {
    const now = performance.now();
    const interval = mode === 'bike' ? 140 : mode === 'run' ? 180 : 250;
    if (now - this.lastStepTime < interval) return;
    this.lastStepTime = now;
    if (mode === 'surf') {
      this.playTone(240, 0.07, 'sine', 0.03, 0);
    } else if (mode === 'bike') {
      this.playTone(320, 0.03, 'triangle', 0.025, 0);
    } else {
      this.playTone(170, 0.035, 'triangle', 0.025, 0);
    }
  }

  playLedgeHop() {
    this.playTone(330, 0.07, 'square', 0.06, 0);
    this.playTone(494, 0.09, 'square', 0.06, 0.06);
    this.playTone(659, 0.11, 'square', 0.05, 0.13);
  }

  playBikeBell() {
    this.playTone(1046.5, 0.09, 'triangle', 0.07, 0);
    this.playTone(1318.5, 0.14, 'triangle', 0.07, 0.08);
  }

  playHealJingle() {
    // Classic 5-note Pokémon Center healing chime: B4 - B4 - B4 - G#4 - E5
    const notes = [
      { f: 493.88, d: 0.14, t: 0.0 },
      { f: 493.88, d: 0.14, t: 0.16 },
      { f: 493.88, d: 0.14, t: 0.32 },
      { f: 415.3, d: 0.18, t: 0.48 },
      { f: 659.25, d: 0.36, t: 0.68 },
    ];
    for (const n of notes) {
      this.playTone(n.f, n.d, 'triangle', 0.08, n.t);
    }
  }

  playBadgeFanfare() {
    const notes = [
      { f: 523.25, d: 0.1, t: 0.0 },
      { f: 659.25, d: 0.1, t: 0.11 },
      { f: 783.99, d: 0.1, t: 0.22 },
      { f: 1046.5, d: 0.32, t: 0.34 },
    ];
    for (const n of notes) {
      this.playTone(n.f, n.d, 'square', 0.07, n.t);
    }
  }

  playStartFanfare() {
    const notes = [
      { f: 440, d: 0.09, t: 0.0 },
      { f: 554.37, d: 0.09, t: 0.09 },
      { f: 659.25, d: 0.11, t: 0.18 },
      { f: 880, d: 0.28, t: 0.3 },
    ];
    for (const n of notes) {
      this.playTone(n.f, n.d, 'square', 0.06, n.t);
    }
  }
}
