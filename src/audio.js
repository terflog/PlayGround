// Authentic Game Boy 3-Channel Chiptune Synthesizer & Sound Effects Engine
export class GameBoyAudio {
  constructor(musicTracks) {
    this.tracks = musicTracks || {};
    this.ctx = null;
    this.enabled = false;
    this.currentTrackName = null;
    this.timers = [];
    this.activeOscillators = new Set();
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.14;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return true;
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

  scheduleChannelLoop(ch, tickMs) {
    if (!this.enabled || !this.ctx) return;
    let offsetMs = 0;
    const waveType = ch.ch === 3 ? "triangle" : "square";
    const chVol = ch.ch === 2 ? 0.35 : ch.ch === 1 ? 0.22 : 0.28;

    for (const [midi, ticks] of ch.notes) {
      const durMs = Math.max(20, ticks * tickMs);
      if (midi > 0) {
        const timer = setTimeout(() => {
          if (!this.enabled || !this.ctx) return;
          this.playNote(this.midiToFreq(midi), durMs * 0.9, waveType, chVol);
        }, offsetMs);
        this.timers.push(timer);
      }
      offsetMs += durMs;
    }

    if (offsetMs > 100) {
      const loopTimer = setTimeout(() => {
        if (this.enabled) this.scheduleChannelLoop(ch, tickMs);
      }, offsetMs);
      this.timers.push(loopTimer);
    }
  }

  playNote(freq, durMs, type = "square", volume = 0.25) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const durSec = durMs / 1000;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + durSec + 0.01);
    this.activeOscillators.add(osc);
    osc.onended = () => {
      this.activeOscillators.delete(osc);
      gain.disconnect();
    };
  }

  playSfx(kind) {
    if (!this.enabled) return;
    if (!this.init()) return;
    if (kind === "blip") {
      this.playNote(987.77, 45, "square", 0.35);
      setTimeout(() => this.playNote(1318.51, 55, "square", 0.35), 40);
    } else if (kind === "warp") {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => this.playNote(f, 55, "square", 0.35), i * 45);
      });
    } else if (kind === "ledge") {
      [440, 587, 784].forEach((f, i) => {
        setTimeout(() => this.playNote(f, 50, "square", 0.3), i * 38);
      });
    } else if (kind === "bump") {
      this.playNote(130, 80, "square", 0.3);
    } else if (kind === "pika") {
      [1174, 1480, 1318, 1760].forEach((f, i) => {
        setTimeout(() => this.playNote(f, 65, "square", 0.4), i * 60);
      });
    } else if (kind === "thunder") {
      [1567, 1318, 1046, 880, 1760, 1396].forEach((f, i) => {
        setTimeout(() => this.playNote(f, 55, "sawtooth", 0.4), i * 45);
      });
    }
  }
}
