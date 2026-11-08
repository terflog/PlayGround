// Authentic Game Boy 3-Channel Chiptune Synthesizer & Sound Effects Engine
export class GameBoyAudio {
  constructor(musicTracks) {
    this.tracks = musicTracks || {};
    this.ctx = null;
    this.enabled = false;
    this.currentTrackName = null;
    this.timers = new Set();
    this.sfxTimers = new Set();
    this.activeOscillators = new Set();
    this.masterGain = null;
  }

  _setMusicTimer(fn, delayMs) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, Math.max(0, delayMs));
    this.timers.add(id);
    return id;
  }

  _setSfxTimer(fn, delayMs) {
    const id = setTimeout(() => {
      this.sfxTimers.delete(id);
      fn();
    }, Math.max(0, delayMs));
    this.sfxTimers.add(id);
    return id;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.14;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        const resumePromise = this.ctx.resume();
        if (resumePromise && typeof resumePromise.catch === "function") {
          resumePromise.catch(() => {});
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      if (this.currentTrackName) {
        this.playTrack(this.currentTrackName, true);
      }
    } else {
      this.stopMusic();
    }
    return this.enabled;
  }

  stopMusic() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    for (const t of this.sfxTimers) clearTimeout(t);
    this.sfxTimers.clear();
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeOscillators.clear();
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  playTrack(trackName, forceRestart = false) {
    if (!forceRestart && this.currentTrackName === trackName && this.timers.size > 0) {
      return;
    }
    this.currentTrackName = trackName;
    if (!this.enabled) return;
    if (!this.init()) return;

    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    const track = this.tracks[trackName] || this.tracks.MUSIC_PALLET_TOWN;
    if (!track || !Array.isArray(track.channels)) return;

    const tickMs = Math.max(8, (track.tempo || 150) * 0.11);

    for (const ch of track.channels) {
      this.scheduleChannelLoop(ch, tickMs);
    }
  }

  scheduleChannelLoop(ch, tickMs) {
    if (!this.enabled || !this.ctx || !ch || !Array.isArray(ch.notes)) return;
    let offsetMs = 0;
    const waveType = ch.ch === 3 ? "triangle" : "square";
    const chVol = ch.ch === 2 ? 0.35 : ch.ch === 1 ? 0.22 : 0.28;

    for (const note of ch.notes) {
      if (!Array.isArray(note)) continue;
      const [midi, ticks] = note;
      const durMs = Math.max(20, (Number(ticks) || 1) * tickMs);
      if (midi > 0) {
        this._setMusicTimer(() => {
          if (!this.enabled || !this.ctx) return;
          this.playNote(this.midiToFreq(midi), durMs * 0.9, waveType, chVol);
        }, offsetMs);
      }
      offsetMs += durMs;
    }

    if (offsetMs > 100) {
      this._setMusicTimer(() => {
        if (this.enabled) this.scheduleChannelLoop(ch, tickMs);
      }, offsetMs);
    }
  }

  playNote(freq, durMs, type = "square", volume = 0.25) {
    if (!this.ctx || !this.masterGain) return;
    if (!Number.isFinite(freq) || freq <= 0 || !Number.isFinite(durMs) || durMs <= 0) {
      return;
    }
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      const durSec = Math.max(0.01, durMs / 1000);
      const safeVol = Math.max(0.002, Math.min(1, Number(volume) || 0.25));
      gain.gain.setValueAtTime(safeVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + durSec + 0.01);
      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try {
          gain.disconnect();
        } catch {}
      };
    } catch {
      // Ignore transient Web Audio scheduling errors
    }
  }

  playSfx(kind) {
    if (!this.enabled) return;
    if (!this.init()) return;
    if (kind === "blip") {
      this.playNote(987.77, 45, "square", 0.35);
      this._setSfxTimer(() => {
        if (this.enabled) this.playNote(1318.51, 55, "square", 0.35);
      }, 40);
    } else if (kind === "warp") {
      [523, 659, 784, 1046].forEach((f, i) => {
        this._setSfxTimer(() => {
          if (this.enabled) this.playNote(f, 55, "square", 0.35);
        }, i * 45);
      });
    } else if (kind === "ledge") {
      [440, 587, 784].forEach((f, i) => {
        this._setSfxTimer(() => {
          if (this.enabled) this.playNote(f, 50, "square", 0.3);
        }, i * 38);
      });
    } else if (kind === "bump") {
      this.playNote(130, 80, "square", 0.3);
    } else if (kind === "pika") {
      [1174, 1480, 1318, 1760].forEach((f, i) => {
        this._setSfxTimer(() => {
          if (this.enabled) this.playNote(f, 65, "square", 0.4);
        }, i * 60);
      });
    } else if (kind === "thunder") {
      [1567, 1318, 1046, 880, 1760, 1396].forEach((f, i) => {
        this._setSfxTimer(() => {
          if (this.enabled) this.playNote(f, 55, "sawtooth", 0.4);
        }, i * 45);
      });
    }
  }
}
