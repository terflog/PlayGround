// Authentic Generation I CryData Table (pret/pokeyellow data/pokemon/cries.asm: [baseCry, pitch, length])
const GEN1_CRY_DATA = {
  BULBASAUR: [0x0f, 0x80, 0x01], IVYSAUR: [0x0f, 0x20, 0x80], VENUSAUR: [0x0f, 0x00, 0xc0],
  CHARMANDER: [0x04, 0x60, 0x40], CHARMELEON: [0x04, 0x20, 0x40], CHARIZARD: [0x00, 0x00, 0x80],
  SQUIRTLE: [0x1d, 0x60, 0x40], WARTORTLE: [0x18, 0x20, 0x40], BLASTOISE: [0x13, 0x00, 0x80],
  CATERPIE: [0x16, 0x80, 0x20], METAPOD: [0x1c, 0xcc, 0x01], BUTTERFREE: [0x16, 0x77, 0x40],
  WEEDLE: [0x15, 0xee, 0x01], KAKUNA: [0x13, 0xff, 0x01], BEEDRILL: [0x13, 0x60, 0x80],
  PIDGEY: [0x0e, 0xdf, 0x04], PIDGEOTTO: [0x14, 0x28, 0xc0], PIDGEOT: [0x14, 0x11, 0xff],
  RATTATA: [0x22, 0x00, 0x80], RATICATE: [0x22, 0x20, 0xff], SPEAROW: [0x10, 0x00, 0x80],
  FEAROW: [0x0d, 0x40, 0xa0], EKANS: [0x17, 0x12, 0x40], ARBOK: [0x17, 0xe0, 0x10],
  PIKACHU: [0x0f, 0xee, 0x01], RAICHU: [0x09, 0xee, 0x88], SANDSHREW: [0x00, 0x20, 0x40],
  SANDSLASH: [0x00, 0xff, 0xff], NIDORAN_F: [0x01, 0x00, 0x80], NIDORINA: [0x01, 0x2c, 0xe0],
  NIDOQUEEN: [0x0a, 0x00, 0x80], NIDORAN_M: [0x00, 0x00, 0x80], NIDORINO: [0x00, 0x2c, 0xe0],
  NIDOKING: [0x09, 0x00, 0x80], CLEFAIRY: [0x19, 0xcc, 0x01], CLEFABLE: [0x19, 0xaa, 0x20],
  VULPIX: [0x24, 0x4f, 0x10], NINETALES: [0x24, 0x88, 0x60], JIGGLYPUFF: [0x0e, 0xff, 0x35],
  WIGGLYTUFF: [0x0e, 0x68, 0x60], ZUBAT: [0x1d, 0xe0, 0x80], GOLBAT: [0x1d, 0xfa, 0x80],
  ODDISH: [0x08, 0xdd, 0x01], GLOOM: [0x08, 0xaa, 0x40], VILEPLUME: [0x23, 0x22, 0xff],
  PARAS: [0x1e, 0x42, 0xff], PARASECT: [0x1e, 0x42, 0xff], VENONAT: [0x1a, 0x44, 0xbf],
  VENOMOTH: [0x1a, 0x29, 0x80], DIGLETT: [0x0b, 0xaa, 0x01], DUGTRIO: [0x0b, 0x2a, 0x10],
  MEOWTH: [0x19, 0x77, 0x10], PERSIAN: [0x19, 0x99, 0xff], PSYDUCK: [0x21, 0x20, 0x60],
  GOLDUCK: [0x21, 0xff, 0x40], MANKEY: [0x0a, 0xdd, 0x60], PRIMEAPE: [0x0a, 0xaf, 0x40],
  GROWLITHE: [0x1f, 0x20, 0x40], ARCANINE: [0x15, 0x00, 0x80], POLIWAG: [0x0e, 0xff, 0xff],
  POLIWHIRL: [0x0e, 0x77, 0x60], POLIWRATH: [0x0e, 0x00, 0xff], ABRA: [0x1c, 0xc0, 0x01],
  KADABRA: [0x1c, 0xa8, 0xc0], ALAKAZAM: [0x1c, 0x98, 0xff], MACHOP: [0x1f, 0xee, 0x01],
  MACHOKE: [0x1f, 0x48, 0x60], MACHAMP: [0x1f, 0x08, 0xc0], BELLSPROUT: [0x21, 0x55, 0x01],
  WEEPINBELL: [0x25, 0x44, 0x20], VICTREEBEL: [0x25, 0x66, 0xcc], TENTACOOL: [0x1a, 0x00, 0x80],
  TENTACRUEL: [0x1a, 0xee, 0xff], GEODUDE: [0x24, 0xf0, 0x10], GRAVELER: [0x24, 0x00, 0x80],
  GOLEM: [0x12, 0xe0, 0x40], PONYTA: [0x25, 0x00, 0x80], RAPIDASH: [0x25, 0x20, 0xc0],
  SLOWPOKE: [0x02, 0x00, 0x80], SLOWBRO: [0x1f, 0x00, 0x80], MAGNEMITE: [0x1c, 0x80, 0x60],
  MAGNETON: [0x1c, 0x20, 0xc0], FARFETCH_D: [0x10, 0xdd, 0x01], DODUO: [0x0b, 0xbb, 0x01],
  DODRIO: [0x0b, 0x99, 0x20], SEEL: [0x0c, 0x88, 0xc0], DEWGONG: [0x0c, 0x23, 0xff],
  GRIMER: [0x05, 0x00, 0x80], MUK: [0x07, 0xef, 0xff], SHELLDER: [0x18, 0x00, 0x80],
  CLOYSTER: [0x18, 0x6f, 0xe0], GASTLY: [0x1c, 0x00, 0x80], HAUNTER: [0x1c, 0x30, 0x40],
  GENGAR: [0x07, 0x00, 0xff], ONIX: [0x17, 0xff, 0xc0], DROWZEE: [0x0d, 0x88, 0x20],
  HYPNO: [0x0d, 0xee, 0x40], KRABBY: [0x20, 0x20, 0xe0], KINGLER: [0x20, 0xee, 0xe0],
  VOLTORB: [0x06, 0xed, 0x80], ELECTRODE: [0x06, 0xa8, 0x90], EXEGGCUTE: [0x0b, 0x00, 0x80],
  EXEGGUTOR: [0x0d, 0x00, 0x80], CUBONE: [0x19, 0x00, 0x80], MAROWAK: [0x08, 0x4f, 0x60],
  HITMONLEE: [0x12, 0x80, 0xc0], HITMONCHAN: [0x0c, 0xee, 0xc0], LICKITUNG: [0x0c, 0x00, 0x80],
  KOFFING: [0x12, 0xe6, 0xdd], WEEZING: [0x12, 0xff, 0xff], RHYHORN: [0x04, 0x00, 0x80],
  RHYDON: [0x11, 0x00, 0x80], CHANSEY: [0x14, 0x0a, 0xc0], TANGELA: [0x12, 0x00, 0x80],
  KANGASKHAN: [0x03, 0x00, 0x80], HORSEA: [0x19, 0x99, 0x10], SEADRA: [0x19, 0x3c, 0x01],
  GOLDEEN: [0x16, 0x80, 0x40], SEAKING: [0x16, 0x10, 0xff], STARYU: [0x1e, 0x02, 0x20],
  STARMIE: [0x1e, 0x00, 0x80], MR_MIME: [0x20, 0x08, 0x40], SCYTHER: [0x16, 0x00, 0x80],
  JYNX: [0x0d, 0xff, 0xff], ELECTABUZZ: [0x06, 0x8f, 0xff], MAGMAR: [0x04, 0xff, 0x30],
  PINSIR: [0x14, 0x00, 0x80], TAUROS: [0x1d, 0x11, 0x40], MAGIKARP: [0x17, 0x80, 0x00],
  GYARADOS: [0x17, 0x00, 0x80], LAPRAS: [0x1b, 0x00, 0x80], DITTO: [0x0e, 0xff, 0xff],
  EEVEE: [0x1a, 0x88, 0x60], VAPOREON: [0x1a, 0xaa, 0xff], JOLTEON: [0x1a, 0x3d, 0x80],
  FLAREON: [0x1a, 0x10, 0x20], PORYGON: [0x25, 0xaa, 0xff], OMANYTE: [0x1f, 0xf0, 0x01],
  OMASTAR: [0x1f, 0xff, 0x40], KABUTO: [0x16, 0xbb, 0x40], KABUTOPS: [0x18, 0xee, 0x01],
  AERODACTYL: [0x23, 0x20, 0xf0], SNORLAX: [0x05, 0x55, 0x01], ARTICUNO: [0x09, 0x80, 0x40],
  ZAPDOS: [0x18, 0xff, 0x80], MOLTRES: [0x09, 0xf8, 0x40], DRATINI: [0x0f, 0x60, 0x40],
  DRAGONAIR: [0x0f, 0x40, 0x80], DRAGONITE: [0x0f, 0x3c, 0xc0], MEWTWO: [0x1e, 0x99, 0xff],
  MEW: [0x1e, 0xee, 0xff],
};

// 38 Base Cry Contour Templates (relative frequency multipliers & sweep directions matching audio/cry_commands.asm)
const BASE_CRY_CONTOURS = [
  [[1.0, 1.35], [1.28, 0.82], [0.95, 0.72]],
  [[1.15, 0.9], [0.92, 1.32], [1.25, 0.88]],
  [[0.85, 1.12], [1.08, 0.78], [0.82, 0.65]],
  [[0.78, 1.18], [1.14, 0.84], [0.9, 1.05]],
  [[1.22, 0.86], [0.95, 1.4], [1.3, 0.76]],
  [[0.72, 0.92], [0.88, 0.64], [0.68, 0.55]],
  [[1.45, 1.85], [1.75, 1.2], [1.55, 1.92]],
  [[0.68, 1.05], [0.98, 0.62], [0.74, 0.88]],
  [[1.32, 1.68], [1.52, 1.15], [1.28, 1.55]],
  [[0.92, 1.42], [1.36, 0.88], [1.04, 1.24]],
  [[0.88, 1.25], [1.18, 0.76], [0.94, 0.68]],
  [[1.38, 1.1], [1.15, 1.52], [1.44, 1.05]],
  [[1.05, 1.48], [1.38, 1.12], [1.18, 0.86]],
  [[0.96, 0.74], [0.82, 1.18], [1.12, 0.78]],
  [[1.28, 1.62], [1.48, 1.18], [1.35, 1.72]],
  [[1.12, 1.54], [1.42, 0.96], [1.08, 1.36]],
  [[1.42, 1.08], [1.18, 1.64], [1.5, 1.12]],
  [[0.76, 1.14], [1.06, 0.7], [0.82, 0.62]],
  [[0.84, 1.22], [1.12, 0.8], [0.9, 1.1]],
  [[0.74, 1.08], [1.02, 0.68], [0.78, 0.92]],
  [[1.18, 1.58], [1.46, 1.04], [1.22, 0.88]],
  [[1.52, 1.18], [1.26, 1.68], [1.44, 1.08]],
  [[1.35, 1.72], [1.58, 1.22], [1.4, 1.65]],
  [[0.9, 1.32], [1.24, 0.78], [0.86, 1.08]],
  [[1.08, 0.82], [0.9, 1.34], [1.26, 0.86]],
  [[1.25, 1.62], [1.5, 1.14], [1.32, 1.54]],
  [[1.16, 0.88], [0.96, 1.42], [1.34, 0.92]],
  [[0.94, 1.36], [1.28, 1.02], [1.08, 0.82]],
  [[1.38, 0.96], [1.08, 1.56], [1.46, 1.02]],
  [[1.02, 1.44], [1.32, 0.88], [0.98, 1.22]],
  [[1.28, 0.92], [1.04, 1.48], [1.38, 1.1]],
  [[0.86, 1.26], [1.18, 0.82], [0.92, 1.14]],
  [[1.2, 0.84], [0.94, 1.38], [1.28, 0.88]],
  [[1.06, 1.46], [1.36, 0.94], [1.04, 0.78]],
  [[1.44, 1.12], [1.22, 1.66], [1.52, 1.18]],
  [[0.98, 1.38], [1.28, 0.84], [0.94, 1.18]],
  [[0.82, 1.18], [1.1, 0.74], [0.86, 1.02]],
  [[1.14, 1.52], [1.4, 0.98], [1.12, 1.38]],
];

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

  playSweepNote(startFreq, endFreq, durMs, type = "square", volume = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    if (!Number.isFinite(startFreq) || startFreq <= 0) return;
    if (this.activeOscillators.size >= 16) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      const f0 = Math.max(40, Math.min(8000, startFreq));
      const f1 = Math.max(40, Math.min(8000, endFreq || startFreq));
      const durSec = Math.max(0.02, (Number(durMs) || 60) / 1000);
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f1, now + durSec);

      const safeVol = Math.max(0.002, Math.min(1, Number(volume) || 0.3));
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

  // Synthesize authentic species-specific Gen I Pokémon Cry (PlayCry in home/audio.asm & data/pokemon/cries.asm)
  playPokemonCry(species, options = {}) {
    if (!this.init()) return false;
    const sp = String(species || "PIKACHU").toUpperCase();
    const faintFactor = options && options.faint ? 0.74 : 1.0;

    // Special Pikachu Yellow voice cry ("Pika-Pika!")
    if (sp === "PIKACHU") {
      const pikaSeq = [
        [1180, 1520, 58],
        [1460, 1320, 54],
        [1240, 1760, 85],
      ];
      let delay = 0;
      pikaSeq.forEach(([f0, f1, dur]) => {
        const id = setTimeout(() => {
          const idx = this.sfxTimers.indexOf(id);
          if (idx !== -1) this.sfxTimers.splice(idx, 1);
          this.playSweepNote(f0 * faintFactor, f1 * faintFactor, dur, "square", 0.38);
        }, delay);
        this.sfxTimers.push(id);
        delay += dur + 12;
      });
      return true;
    }

    const [baseCryId, pitchByte, lengthByte] =
      GEN1_CRY_DATA[sp] || [0x00, 0x40, 0x80];
    const contour =
      BASE_CRY_CONTOURS[baseCryId % BASE_CRY_CONTOURS.length] ||
      BASE_CRY_CONTOURS[0];

    // Map Gen I pitch byte (0x00..0xFF) & length byte (0x00..0xFF) to frequency & step timing
    const signedPitch = pitchByte > 127 ? pitchByte - 256 : pitchByte;
    const rootFreq = (340 + signedPitch * 1.45 + (baseCryId % 11) * 18) * faintFactor;
    const segDurMs = Math.max(42, Math.min(135, 58 + (lengthByte / 255) * 68));

    let offsetMs = 0;
    contour.forEach(([m0, m1], idx) => {
      const dur = idx === contour.length - 1 ? segDurMs * 1.25 : segDurMs;
      const id = setTimeout(() => {
        const pos = this.sfxTimers.indexOf(id);
        if (pos !== -1) this.sfxTimers.splice(pos, 1);
        this.playSweepNote(
          rootFreq * m0,
          rootFreq * m1,
          dur,
          idx % 2 === 0 ? "square" : "sawtooth",
          0.36
        );
      }, offsetMs);
      this.sfxTimers.push(id);
      offsetMs += dur * 0.92;
    });
    return true;
  }
}
