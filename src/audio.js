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

// 38 Distinct Base Cry Synthesis Profiles (matching SFX_Cry00..SFX_Cry25 in audio/cry_commands.asm)
// Each entry: { steps: [[m0, m1, durWeight, wave], ...], detune: ratio, noise: [freqHz, gain] }
const BASE_CRY_CONTOURS = [
  // 0x00: NidoranM / Charizard / Sandshrew (2-part rising roar + gritty tail)
  { steps: [[0.75, 1.35, 1.1, "square"], [1.3, 0.95, 0.7, "sawtooth"], [0.95, 1.48, 1.4, "square"], [1.4, 0.62, 1.6, "sawtooth"]], detune: 1.018, noise: [950, 0.14] },
  // 0x01: NidoranF / Nidorina (3-chirp staccato squeak)
  { steps: [[1.25, 1.65, 0.6, "square"], [0.9, 1.35, 0.5, "square"], [1.35, 1.85, 0.7, "square"], [1.7, 1.05, 1.1, "triangle"]], detune: 1.012, noise: [1800, 0.08] },
  // 0x02: Slowpoke (long, slow, sleepy downward drawl)
  { steps: [[0.82, 0.76, 2.2, "triangle"], [0.76, 0.92, 1.8, "square"], [0.9, 0.58, 2.8, "triangle"]], detune: 1.006, noise: [520, 0.06] },
  // 0x03: Kangaskhan (deep double-stomp bellow)
  { steps: [[0.62, 0.95, 1.2, "sawtooth"], [0.55, 0.85, 0.9, "square"], [0.85, 1.18, 1.5, "sawtooth"], [1.1, 0.52, 1.9, "sawtooth"]], detune: 0.985, noise: [680, 0.18] },
  // 0x04: Charmander / Rhyhorn / Magmar (bright lizards chirp -> raspy tail)
  { steps: [[1.1, 1.72, 0.75, "square"], [1.65, 1.15, 0.55, "square"], [1.18, 1.88, 0.95, "sawtooth"], [1.8, 0.88, 1.35, "square"]], detune: 1.022, noise: [1450, 0.12] },
  // 0x05: Grimer / Snorlax (low, heavy, rumbling bass yawn)
  { steps: [[0.52, 0.68, 1.9, "sawtooth"], [0.66, 0.48, 1.7, "triangle"], [0.58, 0.42, 2.4, "sawtooth"]], detune: 0.988, noise: [420, 0.16] },
  // 0x06: Voltorb / Electrode / Electabuzz (rapid electric buzz-trill)
  { steps: [[1.4, 1.95, 0.4, "sawtooth"], [1.1, 1.85, 0.4, "square"], [1.45, 2.05, 0.4, "sawtooth"], [1.15, 1.9, 0.4, "square"], [1.5, 2.15, 0.45, "sawtooth"], [2.0, 0.9, 0.9, "square"]], detune: 1.035, noise: [2600, 0.15] },
  // 0x07: Muk / Gengar (menacing dark vibrato descent)
  { steps: [[0.95, 0.65, 1.1, "sawtooth"], [0.72, 1.08, 0.9, "square"], [1.05, 0.58, 1.3, "sawtooth"], [0.68, 0.45, 1.8, "sawtooth"]], detune: 0.978, noise: [760, 0.17] },
  // 0x08: Oddish / Gloom / Marowak (clear 2-syllable whistle)
  { steps: [[1.15, 1.55, 0.8, "triangle"], [1.5, 1.85, 0.9, "square"], [1.3, 0.95, 1.2, "triangle"]], detune: 1.01, noise: [1200, 0.05] },
  // 0x09: Raichu / Nidoking / Articuno / Moltres (majestic sweeping legendary cry)
  { steps: [[0.9, 1.45, 1.0, "square"], [1.4, 1.82, 1.1, "triangle"], [1.75, 1.25, 0.9, "square"], [1.3, 1.92, 1.3, "sawtooth"], [1.85, 0.85, 1.6, "triangle"]], detune: 1.016, noise: [1650, 0.11] },
  // 0x0A: Nidoqueen / Mankey / Primeape (screeching Simian bark)
  { steps: [[1.35, 0.85, 0.65, "sawtooth"], [0.95, 1.55, 0.7, "square"], [1.45, 0.78, 0.8, "sawtooth"], [0.88, 1.42, 1.1, "sawtooth"]], detune: 1.028, noise: [1900, 0.18] },
  // 0x0B: Diglett / Doduo / Exeggcute (fast 4-pip chattering chirp)
  { steps: [[1.3, 1.7, 0.42, "square"], [1.1, 1.55, 0.42, "square"], [1.35, 1.8, 0.42, "square"], [1.2, 1.65, 0.42, "square"], [1.5, 1.05, 0.75, "triangle"]], detune: 1.015, noise: [2100, 0.07] },
  // 0x0C: Seel / Dewgong / Hitmonchan / Lickitung (smooth barking arpeggio)
  { steps: [[0.88, 1.22, 0.9, "triangle"], [1.2, 1.52, 0.9, "square"], [1.48, 0.92, 1.4, "triangle"]], detune: 1.008, noise: [980, 0.08] },
  // 0x0D: Fearow / Drowzee / Exeggutor / Jynx (warbling hypnotic vibrato)
  { steps: [[1.15, 0.92, 0.6, "square"], [0.92, 1.22, 0.6, "triangle"], [1.22, 0.88, 0.6, "square"], [0.88, 1.28, 0.6, "triangle"], [1.25, 0.75, 1.2, "square"]], detune: 1.02, noise: [1100, 0.09] },
  // 0x0E: Pidgey / Jigglypuff / Poliwag / Ditto (rapid fluttering bird/fairy trill)
  { steps: [[1.25, 1.68, 0.48, "triangle"], [1.62, 1.28, 0.48, "square"], [1.3, 1.78, 0.52, "triangle"], [1.72, 1.18, 0.65, "square"]], detune: 1.009, noise: [1750, 0.06] },
  // 0x0F: Bulbasaur / Ivysaur / Venusaur / Dratini / Dragonite (iconic 2-phrase frog/dragon cry!)
  { steps: [[0.92, 1.38, 1.0, "square"], [1.32, 0.82, 0.75, "sawtooth"], [0.78, 0.78, 0.35, "triangle"], [0.88, 1.48, 1.25, "square"], [1.42, 0.68, 1.55, "sawtooth"]], detune: 1.014, noise: [1050, 0.13] },
  // 0x10: Spearow / Farfetch'd (sharp avian squawk)
  { steps: [[1.55, 1.05, 0.5, "sawtooth"], [1.1, 1.85, 0.65, "square"], [1.75, 0.95, 0.95, "sawtooth"]], detune: 1.024, noise: [2300, 0.14] },
  // 0x11: Rhydon (heavy armored horn blast)
  { steps: [[0.58, 0.92, 1.3, "sawtooth"], [0.88, 0.64, 0.9, "sawtooth"], [0.7, 1.15, 1.5, "square"], [1.08, 0.52, 1.8, "sawtooth"]], detune: 0.982, noise: [620, 0.19] },
  // 0x12: Golem / Hitmonlee / Koffing / Tangela (percussive martial/rock crunch)
  { steps: [[0.72, 1.18, 0.7, "sawtooth"], [1.12, 0.68, 0.7, "square"], [0.78, 1.28, 0.8, "sawtooth"], [1.22, 0.58, 1.4, "sawtooth"]], detune: 0.99, noise: [840, 0.2] },
  // 0x13: Blastoise / Kakuna / Beedrill (buzzing cannon/insect drone)
  { steps: [[0.82, 1.12, 0.75, "sawtooth"], [1.08, 0.85, 0.65, "square"], [0.88, 1.25, 0.9, "sawtooth"], [1.2, 0.62, 1.5, "sawtooth"]], detune: 1.026, noise: [1300, 0.16] },
  // 0x14: Pidgeotto / Pidgeot / Chansey / Pinsir (sweeping crest call)
  { steps: [[1.05, 1.58, 0.95, "square"], [1.52, 1.18, 0.8, "triangle"], [1.22, 1.72, 1.1, "square"], [1.65, 0.88, 1.4, "triangle"]], detune: 1.012, noise: [1500, 0.1] },
  // 0x15: Weedle / Arcanine (high-to-low howl/squeak)
  { steps: [[1.48, 1.92, 0.65, "square"], [1.85, 1.25, 0.85, "sawtooth"], [1.3, 0.78, 1.35, "square"]], detune: 1.015, noise: [1600, 0.11] },
  // 0x16: Caterpie / Butterfree / Goldeen / Scyther / Kabuto (delicate fluttering wing-trill)
  { steps: [[1.35, 1.75, 0.38, "triangle"], [1.65, 1.25, 0.38, "square"], [1.4, 1.85, 0.38, "triangle"], [1.75, 1.3, 0.38, "square"], [1.5, 1.95, 0.65, "triangle"]], detune: 1.007, noise: [2400, 0.05] },
  // 0x17: Ekans / Arbok / Onix / Magikarp / Gyarados (hissing serpent/leviathan roar!)
  { steps: [[0.68, 1.22, 1.1, "sawtooth"], [1.18, 0.75, 0.95, "sawtooth"], [0.82, 1.38, 1.25, "square"], [1.32, 0.55, 1.85, "sawtooth"]], detune: 0.984, noise: [1150, 0.22] },
  // 0x18: Wartortle / Shellder / Cloyster / Kabutops / Zapdos (sharp crackling shell/lightning burst)
  { steps: [[1.28, 1.88, 0.55, "sawtooth"], [1.12, 1.72, 0.5, "square"], [1.35, 1.98, 0.65, "sawtooth"], [1.9, 0.85, 1.2, "square"]], detune: 1.03, noise: [2200, 0.17] },
  // 0x19: Clefairy / Meowth / Cubone / Horsea (cute bell-like 3-note chime)
  { steps: [[1.18, 1.48, 0.65, "triangle"], [1.45, 1.12, 0.55, "square"], [1.22, 1.68, 1.05, "triangle"]], detune: 1.005, noise: [1400, 0.04] },
  // 0x1A: Venonat / Tentacool / Eevee / Vaporeon / Jolteon / Flareon (lyrical fox/aquatic trill)
  { steps: [[1.08, 1.52, 0.7, "triangle"], [1.48, 1.18, 0.6, "square"], [1.24, 1.74, 0.85, "triangle"], [1.68, 0.96, 1.1, "square"]], detune: 1.011, noise: [1550, 0.07] },
  // 0x1B: Lapras (whale song harmonic glide)
  { steps: [[0.85, 1.28, 1.6, "triangle"], [1.25, 1.48, 1.4, "triangle"], [1.42, 0.92, 2.1, "square"]], detune: 1.004, noise: [650, 0.05] },
  // 0x1C: Metapod / Abra / Kadabra / Alakazam / Magnemite / Gastly (psychic/metallic phase pulse)
  { steps: [[1.45, 0.95, 0.5, "square"], [0.98, 1.55, 0.5, "sawtooth"], [1.5, 0.88, 0.5, "square"], [0.92, 1.62, 0.5, "sawtooth"], [1.58, 0.72, 1.1, "square"]], detune: 1.038, noise: [1950, 0.1] },
  // 0x1D: Squirtle / Zubat / Golbat / Tauros (bubbly/ultrasonic 4-bounce cry)
  { steps: [[1.15, 1.58, 0.58, "square"], [1.5, 1.08, 0.52, "triangle"], [1.18, 1.68, 0.68, "square"], [1.62, 0.92, 1.05, "triangle"]], detune: 1.016, noise: [1680, 0.09] },
  // 0x1E: Paras / Staryu / Starmie / Mewtwo / Mew (cosmic resonant shimmer)
  { steps: [[1.22, 1.78, 0.7, "triangle"], [1.72, 1.32, 0.65, "square"], [1.38, 1.92, 0.85, "triangle"], [1.85, 1.12, 0.8, "square"], [1.45, 2.05, 1.35, "triangle"]], detune: 1.019, noise: [2050, 0.08] },
  // 0x1F: Growlithe / Machop / Machoke / Machamp / Omanyte (brawling double-bark)
  { steps: [[0.95, 1.42, 0.65, "sawtooth"], [1.35, 0.82, 0.55, "square"], [0.98, 1.52, 0.85, "sawtooth"], [1.45, 0.72, 1.15, "sawtooth"]], detune: 1.021, noise: [1250, 0.15] },
  // 0x20: Krabby / Kingler / Mr. Mime (clicking pincer/clown arpeggio)
  { steps: [[1.32, 0.92, 0.45, "square"], [0.95, 1.45, 0.45, "square"], [1.4, 0.88, 0.45, "square"], [0.92, 1.55, 0.85, "triangle"]], detune: 1.025, noise: [2250, 0.12] },
  // 0x21: Psyduck / Golduck / Bellsprout (quacking 3-honk cadence)
  { steps: [[1.02, 1.32, 0.7, "sawtooth"], [0.92, 1.25, 0.7, "square"], [1.08, 1.48, 0.95, "sawtooth"], [1.4, 0.82, 1.1, "triangle"]], detune: 1.017, noise: [1350, 0.13] },
  // 0x22: Rattata / Raticate (fast, scratchy rodent double-squeak)
  { steps: [[1.38, 1.92, 0.48, "sawtooth"], [1.8, 1.12, 0.42, "square"], [1.28, 1.98, 0.68, "sawtooth"]], detune: 1.028, noise: [2500, 0.16] },
  // 0x23: Vileplume / Aerodactyl (soaring prehistoric shriek)
  { steps: [[1.12, 1.75, 0.9, "sawtooth"], [1.68, 1.22, 0.75, "square"], [1.28, 1.88, 1.1, "sawtooth"], [1.8, 0.78, 1.65, "sawtooth"]], detune: 1.022, noise: [1750, 0.18] },
  // 0x24: Vulpix / Ninetales / Geodude / Graveler (yip / rocky resonance)
  { steps: [[0.92, 1.36, 0.75, "square"], [1.3, 0.88, 0.65, "sawtooth"], [0.96, 1.44, 1.15, "square"]], detune: 1.014, noise: [1100, 0.14] },
  // 0x25: Weepinbell / Victreebel / Ponyta / Rapidash / Porygon (cyber/whinnying glissando)
  { steps: [[0.98, 1.58, 0.7, "square"], [1.52, 1.15, 0.65, "triangle"], [1.2, 1.78, 0.8, "square"], [1.72, 0.92, 1.3, "sawtooth"]], detune: 1.02, noise: [1600, 0.11] },
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
    this.cryTimers = [];
    this.activeOscillators = new Set();
    this.masterGain = null;
    this.noiseBuffer = null;

    // Automatically unlock AudioContext on first user interaction so cries always play
    if (typeof window !== "undefined") {
      const unlock = () => {
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener("pointerdown", unlock, { passive: true });
      window.addEventListener("keydown", unlock, { passive: true });
      window.addEventListener("touchstart", unlock, { passive: true });
    }
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

  // Game Boy Channel 4 LFSR Noise Burst for authentic Pokémon cry texture
  playNoiseBurst(filterFreq, durMs, volume = 0.12) {
    if (!this.ctx || !this.masterGain) return;
    try {
      if (!this.noiseBuffer) {
        const sr = this.ctx.sampleRate;
        const len = Math.floor(sr * 0.5);
        this.noiseBuffer = this.ctx.createBuffer(1, len, sr);
        const data = this.noiseBuffer.getChannelData(0);
        let lfsr = 0x7fff;
        for (let i = 0; i < len; i++) {
          const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
          lfsr = (lfsr >> 1) | (bit << 14);
          data[i] = (lfsr & 1) ? 0.8 : -0.8;
        }
      }
      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(Math.max(120, Math.min(6000, filterFreq || 1000)), now);
      filter.Q.setValueAtTime(2.2, now);
      const gain = this.ctx.createGain();
      const durSec = Math.max(0.02, (Number(durMs) || 80) / 1000);
      gain.gain.setValueAtTime(Math.max(0.005, Math.min(0.4, volume)), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start(now);
      src.stop(now + durSec + 0.01);
    } catch {}
  }

  // Synthesize authentic species-specific Gen I Pokémon Cry (PlayCry in home/audio.asm & data/pokemon/cries.asm)
  playPokemonCry(species, options = {}) {
    if (!this.init()) return false;
    for (const t of this.cryTimers) clearTimeout(t);
    this.cryTimers = [];

    const sp = String(species || "PIKACHU").toUpperCase();
    const faintFactor = options && options.faint ? 0.72 : 1.0;

    // Special Pikachu Yellow voice cry ("Pika-Pika!")
    if (sp === "PIKACHU") {
      const pikaSeq = [
        [1180, 1560, 62, "square"],
        [1480, 1310, 56, "triangle"],
        [1260, 1820, 95, "square"],
      ];
      let delay = 0;
      pikaSeq.forEach(([f0, f1, dur, w]) => {
        const id = setTimeout(() => {
          const idx = this.cryTimers.indexOf(id);
          if (idx !== -1) this.cryTimers.splice(idx, 1);
          this.playSweepNote(f0 * faintFactor, f1 * faintFactor, dur, w, 0.36);
          this.playSweepNote(f0 * 1.012 * faintFactor, f1 * 1.012 * faintFactor, dur, "triangle", 0.2);
        }, delay);
        this.cryTimers.push(id);
        delay += dur + 14;
      });
      return true;
    }

    const [baseCryId, pitchByte, lengthByte] =
      GEN1_CRY_DATA[sp] || [0x00, 0x40, 0x80];
    const profile =
      BASE_CRY_CONTOURS[baseCryId % BASE_CRY_CONTOURS.length] ||
      BASE_CRY_CONTOURS[0];

    // Map unsigned Gen I pitchByte (0x00..0xFF) across a wide 165 Hz .. 1,180 Hz range
    // and unsigned lengthByte (0x00..0xFF) across 30ms .. 145ms base step duration
    let speciesSalt = 0;
    for (let i = 0; i < sp.length; i++) {
      speciesSalt = (speciesSalt * 17 + sp.charCodeAt(i)) & 0xff;
    }
    const rootFreq =
      (165 + (pitchByte / 255) * 760 + (baseCryId % 9) * 24 + (speciesSalt % 37)) *
      faintFactor;
    const baseStepMs = Math.max(28, Math.min(155, 34 + (lengthByte / 255) * 96));
    const detune = profile.detune || 1.015;
    const [noiseFreq, noiseVol] = profile.noise || [1100, 0.1];

    let offsetMs = 0;
    profile.steps.forEach(([m0, m1, durWeight, wave], idx) => {
      const dur = Math.max(24, baseStepMs * (durWeight || 1.0));
      const id = setTimeout(() => {
        const pos = this.cryTimers.indexOf(id);
        if (pos !== -1) this.cryTimers.splice(pos, 1);
        // Channel 1: Lead Pulse
        this.playSweepNote(
          rootFreq * m0,
          rootFreq * m1,
          dur,
          wave || "square",
          0.34
        );
        // Channel 2: Detuned Harmony / Counter-Sweep Pulse
        this.playSweepNote(
          rootFreq * m0 * detune,
          rootFreq * m1 * (2 - detune),
          dur * 0.95,
          idx % 2 === 0 ? "sawtooth" : "square",
          0.2
        );
        // Channel 4: LFSR Noise rasp on accented cry steps
        if (idx === 0 || idx === profile.steps.length - 1) {
          this.playNoiseBurst(noiseFreq * faintFactor, dur * 0.85, noiseVol);
        }
      }, offsetMs);
      this.cryTimers.push(id);
      offsetMs += dur * 0.88;
    });
    return true;
  }
}
