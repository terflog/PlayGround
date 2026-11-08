// Authentic Game Boy 3-Channel Chiptune Synthesizer & Sound Effects Engine
export class GameBoyAudio {
  constructor(musicTracks) {
    this.tracks = musicTracks || {};
    this.ctx = null;
    this.enabled = false;
    this.currentTrackName = null;
    this.timers = [];
    this.sfxTimers = [];
    this.activeOscillators = new Set();
    this.masterGain = null;
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
        this.ctx.resume().catch(() => {});
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
    this.timers = [];
    for (const t of this.sfxTimers) clearTimeout(t);
    this.sfxTimers = [];
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
    if (!forceRestart && this.currentTrackName === trackName && this.timers.length > 0) {
      return;
    }
    this.currentTrackName = trackName;
    if (!this.enabled) return;
    if (!this.init()) return;

    this.stopMusic();
    const track = this.tracks[trackName] || this.tracks.MUSIC_PALLET_TOWN;
    if (!track || !track.channels) return;

    const tickMs = Math.max(8, (track.tempo || 150) * 0.11);

    for (const ch of track.channels) {
      this.scheduleChannelLoop(ch, tickMs);
    }
  }

  scheduleChannelLoop(ch, tickMs, noteIdx = 0) {
    if (!this.enabled || !this.ctx) return;
    const notes = ch?.notes;
    if (!Array.isArray(notes) || notes.length === 0) return;
    const idx = noteIdx % notes.length;
    const [midi, ticks] = notes[idx];
    const durMs = Math.max(20, (ticks || 1) * tickMs);
    const waveType = ch.ch === 3 ? "triangle" : "square";
    const chVol = ch.ch === 2 ? 0.35 : ch.ch === 1 ? 0.22 : 0.28;

    if (midi > 0) {
      this.playNote(this.midiToFreq(midi), durMs * 0.9, waveType, chVol);
    }

    const timer = setTimeout(() => {
      const pos = this.timers.indexOf(timer);
      if (pos !== -1) this.timers.splice(pos, 1);
      if (this.enabled && this.ctx) {
        this.scheduleChannelLoop(ch, tickMs, (idx + 1) % notes.length);
      }
    }, durMs);
    this.timers.push(timer);
  }

  playNote(freq, durMs, type = "square", volume = 0.25) {
    if (!this.ctx || !this.masterGain) return;
    if (!Number.isFinite(freq) || freq <= 0) return;
    if (this.activeOscillators.size >= 16) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, Math.min(20000, freq)), now);

      const durSec = Math.max(0.015, (Number(durMs) || 40) / 1000);
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
    } catch {}
  }

  playSfx(kind) {
    if (!this.enabled) return;
    if (!this.init()) return;
    const schedule = (fn, delay) => {
      const id = setTimeout(() => {
        const idx = this.sfxTimers.indexOf(id);
        if (idx !== -1) this.sfxTimers.splice(idx, 1);
        if (this.enabled) fn();
      }, delay);
      this.sfxTimers.push(id);
    };
    if (kind === "blip") {
      this.playNote(987.77, 45, "square", 0.35);
      schedule(() => this.playNote(1318.51, 55, "square", 0.35), 40);
    } else if (kind === "warp") {
      [523, 659, 784, 1046].forEach((f, i) => {
        schedule(() => this.playNote(f, 55, "square", 0.35), i * 45);
      });
    } else if (kind === "ledge") {
      [440, 587, 784].forEach((f, i) => {
        schedule(() => this.playNote(f, 50, "square", 0.3), i * 38);
      });
    } else if (kind === "bump") {
      this.playNote(130, 80, "square", 0.3);
    } else if (kind === "pika") {
      [1174, 1480, 1318, 1760].forEach((f, i) => {
        schedule(() => this.playNote(f, 65, "square", 0.4), i * 60);
      });
    } else if (kind === "thunder") {
      [1567, 1318, 1046, 880, 1760, 1396].forEach((f, i) => {
        schedule(() => this.playNote(f, 55, "sawtooth", 0.4), i * 45);
      });
    }
  }

  // Synthesize authentic species-specific Gen I Pokémon Cry (PlayCry in home/audio.asm)
  playPokemonCry(species, baseStats = null) {
    if (!this.init()) return false;
    const sp = String(species || "PIKACHU").toUpperCase();
    let hash = 0;
    for (let i = 0; i < sp.length; i++) {
      hash = (hash * 31 + sp.charCodeAt(i)) & 0xffff;
    }
    const baseFreq = 260 + ((baseStats?.spd || (hash & 0x7f)) * 4.2);
    const modFreq = 320 + ((baseStats?.spc || ((hash >> 4) & 0x7f)) * 4.8);
    const tailFreq = 220 + ((baseStats?.atk || ((hash >> 8) & 0x7f)) * 3.9);
    const stepMs = Math.max(42, Math.min(95, 110 - (baseStats?.spd || 50) * 0.4));
    const notes =
      sp === "PIKACHU"
        ? [1174, 1480, 1318, 1760]
        : [baseFreq, modFreq, baseFreq * 0.88, tailFreq, modFreq * 1.12];

    notes.forEach((f, i) => {
      const id = setTimeout(() => {
        const idx = this.sfxTimers.indexOf(id);
        if (idx !== -1) this.sfxTimers.splice(idx, 1);
        this.playNote(f, stepMs * 1.1, i % 2 === 0 ? "square" : "sawtooth", 0.38);
      }, i * stepMs);
      this.sfxTimers.push(id);
    });
    return true;
  }
}
