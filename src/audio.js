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

// Authentic 38 Base Cry Channel Definitions from pret/pokeyellow audio/sfx/cries.asm (SFX_Cry00..SFX_Cry25):
// Each entry has:
// - ch5: Pulse 1 sequence of [length (0..15 -> +1 frames), vol (0..15), reg11 (11-bit GB freq register)]
// - ch6: Pulse 2 sequence of [length, vol, reg11] running simultaneously in parallel
// - ch8: Noise sequence of [length, vol, polyFreqHz] running simultaneously in parallel
// - duty5 / duty6: GB pulse duty cycle index (0=12.5%, 1=25%, 2=50%, 3=75%)
const SFX_BASE_CRIES = [
  // 0x00: SFX_Cry00 (NidoranM, Charizard, Sandshrew)
  { duty5: 2, duty6: 1, ch5: [[1, 15, 0x550], [1, 15, 0x5d0], [1, 15, 0x620], [5, 13, 0x590], [3, 9, 0x520]], ch6: [[1, 14, 0x580], [1, 14, 0x600], [1, 14, 0x660], [5, 12, 0x5c0], [3, 8, 0x540]], ch8: [[3, 9, 1400], [5, 7, 900], [3, 4, 650]] },
  // 0x01: SFX_Cry01 (NidoranF, Nidorina)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x610], [1, 14, 0x5c0], [2, 15, 0x650], [4, 12, 0x5e0], [3, 8, 0x580]], ch6: [[1, 13, 0x640], [1, 13, 0x5f0], [2, 14, 0x680], [4, 11, 0x610], [3, 7, 0x5b0]], ch8: [[2, 8, 1800], [5, 6, 1200]] },
  // 0x02: SFX_Cry02 (Slowpoke)
  { duty5: 2, duty6: 2, ch5: [[3, 14, 0x480], [3, 15, 0x4c0], [4, 13, 0x460], [6, 10, 0x420]], ch6: [[3, 12, 0x498], [3, 13, 0x4d8], [4, 12, 0x478], [6, 9, 0x438]], ch8: [[6, 6, 600], [8, 4, 480]] },
  // 0x03: SFX_Cry03 (Kangaskhan)
  { duty5: 3, duty6: 1, ch5: [[1, 15, 0x4d0], [2, 15, 0x560], [2, 14, 0x510], [4, 13, 0x590], [4, 9, 0x4c0]], ch6: [[1, 14, 0x500], [2, 14, 0x590], [2, 13, 0x540], [4, 12, 0x5c0], [4, 8, 0x4f0]], ch8: [[4, 10, 950], [6, 8, 720], [3, 4, 520]] },
  // 0x04: SFX_Cry04 (Charmander, Charmeleon, Rhyhorn, Magmar)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x5c0], [1, 15, 0x640], [1, 14, 0x590], [3, 15, 0x680], [4, 11, 0x610], [3, 7, 0x5a0]], ch6: [[1, 13, 0x5f0], [1, 14, 0x670], [1, 13, 0x5c0], [3, 14, 0x6b0], [4, 10, 0x640], [3, 6, 0x5d0]], ch8: [[3, 9, 1650], [4, 7, 1300], [4, 4, 980]] },
  // 0x05: SFX_Cry05 (Grimer, Snorlax)
  { duty5: 2, duty6: 0, ch5: [[3, 15, 0x430], [3, 14, 0x470], [4, 13, 0x410], [6, 10, 0x3d0]], ch6: [[3, 14, 0x448], [3, 13, 0x488], [4, 12, 0x428], [6, 9, 0x3e8]], ch8: [[5, 10, 520], [7, 8, 410], [4, 5, 340]] },
  // 0x06: SFX_Cry06 (Voltorb, Electrode, Electabuzz)
  { duty5: 0, duty6: 1, ch5: [[1, 15, 0x670], [1, 15, 0x6f0], [1, 15, 0x640], [1, 15, 0x6d0], [2, 14, 0x720], [4, 11, 0x690]], ch6: [[1, 14, 0x6a0], [1, 14, 0x710], [1, 14, 0x670], [1, 14, 0x6f0], [2, 13, 0x740], [4, 10, 0x6b0]], ch8: [[2, 11, 2600], [3, 9, 2100], [4, 6, 1700]] },
  // 0x07: SFX_Cry07 (Muk, Gengar)
  { duty5: 3, duty6: 0, ch5: [[2, 15, 0x490], [2, 15, 0x520], [2, 14, 0x470], [3, 14, 0x550], [5, 10, 0x450]], ch6: [[2, 14, 0x4b8], [2, 14, 0x548], [2, 13, 0x498], [3, 13, 0x578], [5, 9, 0x478]], ch8: [[4, 10, 820], [6, 8, 620], [4, 5, 480]] },
  // 0x08: SFX_Cry08 (Oddish, Gloom, Marowak)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x630], [1, 15, 0x690], [2, 15, 0x6e0], [3, 13, 0x660], [3, 9, 0x600]], ch6: [[1, 13, 0x660], [1, 14, 0x6c0], [2, 14, 0x700], [3, 12, 0x690], [3, 8, 0x630]], ch8: [[3, 7, 1900], [5, 5, 1450]] },
  // 0x09: SFX_Cry09 (Raichu, Nidoking, Articuno, Moltres)
  { duty5: 2, duty6: 1, ch5: [[1, 15, 0x580], [2, 15, 0x630], [1, 14, 0x5e0], [3, 15, 0x690], [4, 12, 0x5f0], [3, 8, 0x560]], ch6: [[1, 14, 0x5b0], [2, 14, 0x660], [1, 13, 0x610], [3, 14, 0x6c0], [4, 11, 0x620], [3, 7, 0x590]], ch8: [[3, 9, 1550], [5, 7, 1250], [4, 4, 900]] },
  // 0x0A: SFX_Cry0A (Nidoqueen, Mankey, Primeape)
  { duty5: 1, duty6: 0, ch5: [[1, 15, 0x540], [2, 15, 0x5d0], [2, 14, 0x520], [3, 14, 0x5a0], [4, 10, 0x4e0]], ch6: [[1, 14, 0x570], [2, 14, 0x600], [2, 13, 0x550], [3, 13, 0x5d0], [4, 9, 0x510]], ch8: [[4, 10, 1150], [5, 8, 860], [3, 5, 640]] },
  // 0x0B: SFX_Cry0B (Diglett, Dugtrio, Doduo, Dodrio, Exeggcute)
  { duty5: 0, duty6: 2, ch5: [[1, 15, 0x660], [1, 14, 0x600], [1, 15, 0x690], [1, 14, 0x620], [2, 15, 0x6c0], [3, 10, 0x640]], ch6: [[1, 13, 0x690], [1, 13, 0x630], [1, 14, 0x6c0], [1, 13, 0x650], [2, 14, 0x6f0], [3, 9, 0x670]], ch8: [[2, 8, 2200], [4, 6, 1750]] },
  // 0x0C: SFX_Cry0C (Seel, Dewgong, Hitmonchan, Lickitung)
  { duty5: 2, duty6: 1, ch5: [[2, 15, 0x590], [2, 15, 0x620], [3, 14, 0x5d0], [4, 11, 0x540]], ch6: [[2, 13, 0x5c0], [2, 14, 0x650], [3, 13, 0x600], [4, 10, 0x570]], ch8: [[4, 7, 1350], [5, 5, 1050]] },
  // 0x0D: SFX_Cry0D (Fearow, Drowzee, Hypno, Exeggutor, Jynx)
  { duty5: 1, duty6: 3, ch5: [[2, 15, 0x5c0], [1, 14, 0x550], [2, 15, 0x610], [3, 13, 0x580], [4, 9, 0x510]], ch6: [[2, 14, 0x5f0], [1, 13, 0x580], [2, 14, 0x640], [3, 12, 0x5b0], [4, 8, 0x540]], ch8: [[3, 8, 1450], [5, 6, 1100], [3, 4, 850]] },
  // 0x0E: SFX_Cry0E (Pidgey, Jigglypuff, Wigglytuff, Poliwag, Poliwhirl, Poliwrath, Ditto)
  { duty5: 2, duty6: 2, ch5: [[1, 15, 0x640], [2, 15, 0x6b0], [2, 14, 0x670], [3, 14, 0x6f0], [3, 10, 0x690]], ch6: [[1, 13, 0x668], [2, 14, 0x6d8], [2, 13, 0x698], [3, 13, 0x718], [3, 9, 0x6b8]], ch8: [[2, 6, 2000], [4, 4, 1600]] },
  // 0x0F: SFX_Cry0F (Bulbasaur, Ivysaur, Venusaur, Pikachu, Dratini, Dragonair, Dragonite)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x5b0], [2, 15, 0x650], [1, 14, 0x5f0], [3, 15, 0x6a0], [4, 11, 0x5c0], [3, 8, 0x560]], ch6: [[1, 14, 0x5e0], [2, 14, 0x680], [1, 13, 0x620], [3, 14, 0x6d0], [4, 10, 0x5f0], [3, 7, 0x590]], ch8: [[3, 8, 1600], [4, 7, 1200], [4, 4, 920]] },
  // 0x10: SFX_Cry10 (Spearow, Farfetch'd)
  { duty5: 0, duty6: 1, ch5: [[1, 15, 0x680], [1, 15, 0x610], [1, 15, 0x6c0], [2, 14, 0x650], [3, 11, 0x6e0]], ch6: [[1, 14, 0x6b0], [1, 14, 0x640], [1, 14, 0x6f0], [2, 13, 0x680], [3, 10, 0x708]], ch8: [[2, 9, 2400], [4, 7, 1900]] },
  // 0x11: SFX_Cry11 (Rhydon)
  { duty5: 3, duty6: 0, ch5: [[2, 15, 0x4b0], [2, 15, 0x540], [2, 14, 0x4e0], [4, 14, 0x580], [4, 10, 0x4a0]], ch6: [[2, 14, 0x4e0], [2, 14, 0x570], [2, 13, 0x510], [4, 13, 0x5b0], [4, 9, 0x4d0]], ch8: [[4, 11, 880], [5, 9, 680], [4, 5, 500]] },
  // 0x12: SFX_Cry12 (Golem, Hitmonlee, Koffing, Weezing, Tangela)
  { duty5: 1, duty6: 0, ch5: [[2, 15, 0x510], [2, 14, 0x590], [2, 14, 0x4e0], [4, 13, 0x550], [4, 9, 0x4b0]], ch6: [[2, 14, 0x540], [2, 13, 0x5c0], [2, 13, 0x510], [4, 12, 0x580], [4, 8, 0x4e0]], ch8: [[4, 9, 1050], [5, 7, 780], [3, 4, 580]] },
  // 0x13: SFX_Cry13 (Blastoise, Kakuna, Beedrill)
  { duty5: 2, duty6: 1, ch5: [[1, 15, 0x520], [2, 15, 0x5b0], [2, 15, 0x560], [3, 14, 0x5f0], [4, 10, 0x500]], ch6: [[1, 14, 0x550], [2, 14, 0x5e0], [2, 14, 0x590], [3, 13, 0x620], [4, 9, 0x530]], ch8: [[3, 10, 1100], [5, 8, 820], [4, 5, 620]] },
  // 0x14: SFX_Cry14 (Pidgeotto, Pidgeot, Chansey, Pinsir)
  { duty5: 2, duty6: 2, ch5: [[2, 15, 0x5e0], [2, 15, 0x670], [2, 14, 0x620], [3, 14, 0x6b0], [4, 10, 0x5d0]], ch6: [[2, 13, 0x610], [2, 14, 0x6a0], [2, 13, 0x650], [3, 13, 0x6e0], [4, 9, 0x600]], ch8: [[3, 8, 1750], [5, 6, 1350], [3, 4, 1000]] },
  // 0x15: SFX_Cry15 (Weedle, Arcanine)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x5f0], [2, 15, 0x680], [2, 14, 0x630], [4, 13, 0x5b0], [3, 9, 0x550]], ch6: [[1, 14, 0x620], [2, 14, 0x6b0], [2, 13, 0x660], [4, 12, 0x5e0], [3, 8, 0x580]], ch8: [[3, 8, 1600], [5, 6, 1180]] },
  // 0x16: SFX_Cry16 (Caterpie, Butterfree, Goldeen, Seaking, Scyther, Kabuto)
  { duty5: 0, duty6: 2, ch5: [[1, 15, 0x670], [1, 15, 0x6d0], [2, 14, 0x650], [3, 13, 0x6b0], [3, 9, 0x620]], ch6: [[1, 13, 0x6a0], [1, 14, 0x700], [2, 13, 0x680], [3, 12, 0x6e0], [3, 8, 0x650]], ch8: [[2, 7, 2100], [4, 5, 1650]] },
  // 0x17: SFX_Cry17 (Ekans, Arbok, Onix, Magikarp, Gyarados)
  { duty5: 3, duty6: 1, ch5: [[2, 15, 0x530], [2, 15, 0x5c0], [2, 14, 0x570], [4, 14, 0x610], [4, 10, 0x4f0]], ch6: [[2, 14, 0x560], [2, 14, 0x5f0], [2, 13, 0x5a0], [4, 13, 0x640], [4, 9, 0x520]], ch8: [[4, 10, 1250], [5, 8, 920], [4, 5, 680]] },
  // 0x18: SFX_Cry18 (Wartortle, Shellder, Cloyster, Kabutops, Zapdos)
  { duty5: 1, duty6: 0, ch5: [[1, 15, 0x600], [1, 15, 0x690], [2, 15, 0x640], [3, 14, 0x6d0], [4, 10, 0x5d0]], ch6: [[1, 14, 0x630], [1, 14, 0x6c0], [2, 14, 0x670], [3, 13, 0x700], [4, 9, 0x600]], ch8: [[3, 9, 1950], [5, 7, 1500], [3, 4, 1100]] },
  // 0x19: SFX_Cry19 (Clefairy, Clefable, Meowth, Persian, Cubone, Horsea, Seadra)
  { duty5: 2, duty6: 1, ch5: [[1, 15, 0x620], [2, 15, 0x6a0], [1, 14, 0x650], [3, 14, 0x6e0], [3, 10, 0x630]], ch6: [[1, 13, 0x650], [2, 14, 0x6d0], [1, 13, 0x680], [3, 13, 0x710], [3, 9, 0x660]], ch8: [[2, 7, 1850], [4, 5, 1400]] },
  // 0x1A: SFX_Cry1A (Venonat, Venomoth, Tentacool, Tentacruel, Eevee, Vaporeon, Jolteon, Flareon)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x610], [2, 15, 0x680], [2, 14, 0x640], [3, 15, 0x6c0], [3, 11, 0x5f0]], ch6: [[1, 14, 0x640], [2, 14, 0x6b0], [2, 13, 0x670], [3, 14, 0x6f0], [3, 10, 0x620]], ch8: [[3, 7, 1750], [4, 5, 1350]] },
  // 0x1B: SFX_Cry1B (Lapras)
  { duty5: 2, duty6: 2, ch5: [[3, 15, 0x5a0], [3, 15, 0x630], [3, 14, 0x5f0], [5, 12, 0x560]], ch6: [[3, 13, 0x5c8], [3, 14, 0x658], [3, 13, 0x618], [5, 11, 0x588]], ch8: [[4, 6, 1200], [6, 4, 950]] },
  // 0x1C: SFX_Cry1C (Metapod, Abra, Kadabra, Alakazam, Magnemite, Magneton, Gastly, Haunter)
  { duty5: 0, duty6: 1, ch5: [[1, 15, 0x660], [1, 15, 0x6e0], [1, 14, 0x620], [2, 15, 0x6a0], [2, 14, 0x710], [3, 10, 0x640]], ch6: [[1, 14, 0x690], [1, 14, 0x710], [1, 13, 0x650], [2, 14, 0x6d0], [2, 13, 0x738], [3, 9, 0x670]], ch8: [[2, 8, 2300], [4, 6, 1800], [3, 4, 1350]] },
  // 0x1D: SFX_Cry1D (Squirtle, Zubat, Golbat, Tauros)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x5d0], [2, 15, 0x660], [1, 14, 0x610], [3, 15, 0x6a0], [4, 11, 0x5f0]], ch6: [[1, 14, 0x600], [2, 14, 0x690], [1, 13, 0x640], [3, 14, 0x6d0], [4, 10, 0x620]], ch8: [[3, 8, 1700], [4, 6, 1300], [3, 4, 980]] },
  // 0x1E: SFX_Cry1E (Paras, Parasect, Staryu, Starmie, Mewtwo, Mew)
  { duty5: 2, duty6: 0, ch5: [[1, 15, 0x640], [2, 15, 0x6d0], [2, 14, 0x680], [3, 15, 0x710], [4, 11, 0x620]], ch6: [[1, 14, 0x670], [2, 14, 0x700], [2, 13, 0x6b0], [3, 14, 0x738], [4, 10, 0x650]], ch8: [[3, 8, 2050], [4, 6, 1600], [4, 4, 1200]] },
  // 0x1F: SFX_Cry1F (Growlithe, Machop, Machoke, Machamp, Slowbro, Omanyte, Omastar)
  { duty5: 3, duty6: 1, ch5: [[1, 15, 0x560], [2, 15, 0x5f0], [2, 14, 0x590], [3, 14, 0x630], [4, 10, 0x530]], ch6: [[1, 14, 0x590], [2, 14, 0x620], [2, 13, 0x5c0], [3, 13, 0x660], [4, 9, 0x560]], ch8: [[3, 9, 1300], [5, 7, 980], [3, 4, 720]] },
  // 0x20: SFX_Cry20 (Krabby, Kingler, Mr. Mime)
  { duty5: 0, duty6: 2, ch5: [[1, 15, 0x650], [1, 15, 0x5e0], [1, 15, 0x680], [2, 14, 0x610], [3, 13, 0x6b0], [3, 9, 0x5f0]], ch6: [[1, 14, 0x680], [1, 14, 0x610], [1, 14, 0x6b0], [2, 13, 0x640], [3, 12, 0x6e0], [3, 8, 0x620]], ch8: [[2, 9, 2150], [4, 7, 1650], [3, 4, 1250]] },
  // 0x21: SFX_Cry21 (Psyduck, Golduck, Bellsprout)
  { duty5: 1, duty6: 2, ch5: [[2, 15, 0x5c0], [2, 14, 0x640], [2, 15, 0x5f0], [3, 13, 0x670], [4, 9, 0x590]], ch6: [[2, 13, 0x5f0], [2, 13, 0x670], [2, 14, 0x620], [3, 12, 0x6a0], [4, 8, 0x5c0]], ch8: [[3, 8, 1500], [5, 6, 1150]] },
  // 0x22: SFX_Cry22 (Rattata, Raticate)
  { duty5: 0, duty6: 1, ch5: [[1, 15, 0x670], [1, 15, 0x6f0], [1, 14, 0x640], [2, 15, 0x6c0], [3, 11, 0x610]], ch6: [[1, 14, 0x6a0], [1, 14, 0x718], [1, 13, 0x670], [2, 14, 0x6f0], [3, 10, 0x640]], ch8: [[2, 10, 2350], [3, 8, 1850], [3, 5, 1400]] },
  // 0x23: SFX_Cry23 (Vileplume, Aerodactyl)
  { duty5: 2, duty6: 0, ch5: [[2, 15, 0x580], [2, 15, 0x620], [2, 14, 0x5c0], [4, 14, 0x670], [4, 10, 0x550]], ch6: [[2, 14, 0x5b0], [2, 14, 0x650], [2, 13, 0x5f0], [4, 13, 0x6a0], [4, 9, 0x580]], ch8: [[4, 9, 1400], [5, 7, 1050], [4, 4, 780]] },
  // 0x24: SFX_Cry24 (Vulpix, Ninetales, Geodude, Graveler)
  { duty5: 1, duty6: 2, ch5: [[1, 15, 0x5e0], [2, 15, 0x660], [2, 14, 0x600], [3, 14, 0x690], [4, 10, 0x5b0]], ch6: [[1, 14, 0x610], [2, 14, 0x690], [2, 13, 0x630], [3, 13, 0x6c0], [4, 9, 0x5e0]], ch8: [[3, 8, 1650], [4, 6, 1250], [3, 4, 920]] },
  // 0x25: SFX_Cry25 (Weepinbell, Victreebel, Ponyta, Rapidash, Porygon)
  { duty5: 2, duty6: 1, ch5: [[1, 15, 0x600], [2, 15, 0x690], [2, 14, 0x630], [3, 15, 0x6d0], [4, 10, 0x5e0]], ch6: [[1, 14, 0x630], [2, 14, 0x6c0], [2, 13, 0x660], [3, 14, 0x700], [4, 9, 0x610]], ch8: [[3, 8, 1800], [4, 6, 1400], [3, 4, 1050]] },
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
    this.dutyWaves = null;
    this.lfsrBuffer = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.16;
        this.masterGain.connect(this.ctx.destination);
        this.buildHardwareTables();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  // Build authentic Game Boy Pulse Duty-Cycle PeriodicWaves (12.5%, 25%, 50%, 75%) & 15-bit LFSR Noise Buffer
  buildHardwareTables() {
    if (!this.ctx || this.dutyWaves) return;
    try {
      const duties = [0.125, 0.25, 0.5, 0.75];
      const harmonics = 32;
      this.dutyWaves = duties.map((d) => {
        const real = new Float32Array(harmonics + 1);
        const imag = new Float32Array(harmonics + 1);
        for (let n = 1; n <= harmonics; n++) {
          real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d);
          imag[n] = (2 / (n * Math.PI)) * (1 - Math.cos(n * Math.PI * d));
        }
        return this.ctx.createPeriodicWave(real, imag);
      });

      // 15-bit Game Boy LFSR (Linear Feedback Shift Register: XOR bit 0 and bit 1)
      const sr = this.ctx.sampleRate || 44100;
      const len = Math.floor(sr * 1.2);
      this.lfsrBuffer = this.ctx.createBuffer(1, len, sr);
      const data = this.lfsrBuffer.getChannelData(0);
      let lfsr = 0x7fff;
      for (let i = 0; i < len; i++) {
        const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
        lfsr = (lfsr >> 1) | (bit << 14);
        data[i] = (lfsr & 1) ? 0.85 : -0.85;
      }
    } catch {}
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

  // Convert 11-bit Game Boy APU frequency register + wFrequencyModifier (pitch byte) to Hz:
  // f_Hz = 131072 / (2048 - ((reg + signedPitch) & 0x7FF))
  gbRegToFreq(reg11, pitchByte, faintFactor = 1.0) {
    const signedOffset = pitchByte > 127 ? pitchByte - 256 : pitchByte;
    const modReg = Math.max(0x180, Math.min(0x7d8, reg11 + signedOffset));
    const hz = (131072 / (2048 - modReg)) * faintFactor;
    return Math.max(55, Math.min(6000, hz));
  }

  // Convert Game Boy note length (0..15) + wTempoModifier (length byte) to seconds at 59.7275 Hz
  gbFramesToSec(noteLen, lengthByte, faintFactor = 1.0) {
    const frames = (noteLen + 1) * ((lengthByte + 160) / 256);
    const sec = (frames / 59.7275) / faintFactor;
    return Math.max(0.018, Math.min(0.45, sec));
  }

  // Synthesize authentic 3-Channel Game Boy APU Pokémon Cry (Ch5 Pulse 1 + Ch6 Pulse 2 + Ch8 LFSR Noise)
  playPokemonCry(species, options = {}) {
    if (!this.init() || !this.ctx || !this.masterGain) return false;
    const sp = String(species || "PIKACHU").toUpperCase();
    const faintFactor = options && options.faint ? 0.76 : 1.0;

    // Pokémon Yellow Pikachu 1-bit PCM vocal cry ("Pika-Pika!" dual-formant + consonant burst)
    if (sp === "PIKACHU") {
      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        const gain2 = this.ctx.createGain();
        if (this.dutyWaves && this.dutyWaves[1]) {
          osc1.setPeriodicWave(this.dutyWaves[1]);
          osc2.setPeriodicWave(this.dutyWaves[2]);
        } else {
          osc1.type = "square";
          osc2.type = "triangle";
        }
        // "Pi" (high front vowel) -> "ka" (open mid vowel) -> "chuuu!" (rising-falling glide)
        const syl = [
          { t: 0.0, d: 0.08, f1: 1120 * faintFactor, f2: 2240 * faintFactor, v: 0.34 },
          { t: 0.1, d: 0.09, f1: 880 * faintFactor, f2: 1560 * faintFactor, v: 0.32 },
          { t: 0.21, d: 0.18, f1: 1280 * faintFactor, f2: 1920 * faintFactor, v: 0.36 },
        ];
        gain1.gain.setValueAtTime(0.001, now);
        gain2.gain.setValueAtTime(0.001, now);
        for (const s of syl) {
          osc1.frequency.setValueAtTime(s.f1, now + s.t);
          osc1.frequency.exponentialRampToValueAtTime(s.f1 * 1.18, now + s.t + s.d);
          osc2.frequency.setValueAtTime(s.f2, now + s.t);
          osc2.frequency.exponentialRampToValueAtTime(s.f2 * 0.92, now + s.t + s.d);
          gain1.gain.setValueAtTime(s.v, now + s.t);
          gain1.gain.exponentialRampToValueAtTime(0.002, now + s.t + s.d);
          gain2.gain.setValueAtTime(s.v * 0.65, now + s.t);
          gain2.gain.exponentialRampToValueAtTime(0.002, now + s.t + s.d);
        }
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(this.masterGain);
        gain2.connect(this.masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.42);
        osc2.stop(now + 0.42);
        this.activeOscillators.add(osc1);
        this.activeOscillators.add(osc2);
        osc1.onended = () => {
          this.activeOscillators.delete(osc1);
          try { gain1.disconnect(); } catch {}
        };
        osc2.onended = () => {
          this.activeOscillators.delete(osc2);
          try { gain2.disconnect(); } catch {}
        };
      } catch {}
      return true;
    }

    const [baseCryId, pitchByte, lengthByte] =
      GEN1_CRY_DATA[sp] || [0x00, 0x40, 0x80];
    const baseDef =
      SFX_BASE_CRIES[baseCryId % SFX_BASE_CRIES.length] || SFX_BASE_CRIES[0];

    try {
      const now = this.ctx.currentTime;

      // Schedule Pulse Channel (Ch5 or Ch6) on a single hardware-timed oscillator
      const schedulePulseChannel = (seq, dutyIdx, volScale) => {
        if (!Array.isArray(seq) || seq.length === 0) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        if (this.dutyWaves && this.dutyWaves[dutyIdx]) {
          osc.setPeriodicWave(this.dutyWaves[dutyIdx]);
        } else {
          osc.type = "square";
        }
        let t = now;
        for (let i = 0; i < seq.length; i++) {
          const [len, vol, reg11] = seq[i];
          const dur = this.gbFramesToSec(len, lengthByte, faintFactor);
          const freq = this.gbRegToFreq(reg11, pitchByte, faintFactor);
          const amp = Math.max(0.002, (vol / 15) * volScale);
          osc.frequency.setValueAtTime(freq, t);
          if (i + 1 < seq.length) {
            const nextFreq = this.gbRegToFreq(seq[i + 1][2], pitchByte, faintFactor);
            osc.frequency.exponentialRampToValueAtTime(
              Math.max(55, (freq + nextFreq) * 0.5),
              t + dur
            );
          }
          gain.gain.setValueAtTime(amp, t);
          gain.gain.exponentialRampToValueAtTime(Math.max(0.002, amp * 0.45), t + dur);
          t += dur;
        }
        gain.gain.setValueAtTime(0.001, t);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(t + 0.015);
        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try { gain.disconnect(); } catch {}
        };
      };

      // Schedule Simultaneous Ch5 (Pulse 1) and Ch6 (Pulse 2)
      schedulePulseChannel(baseDef.ch5, baseDef.duty5 ?? 2, 0.34);
      schedulePulseChannel(baseDef.ch6, baseDef.duty6 ?? 1, 0.28);

      // Schedule Simultaneous Ch8 (15-bit LFSR Polynomial Noise)
      if (this.lfsrBuffer && Array.isArray(baseDef.ch8) && baseDef.ch8.length > 0) {
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = this.lfsrBuffer;
        noiseSrc.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 2.2;
        const nGain = this.ctx.createGain();
        let nt = now;
        for (const [len, vol, polyHz] of baseDef.ch8) {
          const dur = this.gbFramesToSec(len, lengthByte, faintFactor);
          const amp = Math.max(0.002, (vol / 15) * 0.22);
          filter.frequency.setValueAtTime(
            Math.max(200, Math.min(6000, polyHz * faintFactor)),
            nt
          );
          nGain.gain.setValueAtTime(amp, nt);
          nGain.gain.exponentialRampToValueAtTime(0.002, nt + dur);
          nt += dur;
        }
        nGain.gain.setValueAtTime(0.001, nt);
        noiseSrc.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.masterGain);
        noiseSrc.start(now);
        noiseSrc.stop(nt + 0.015);
        noiseSrc.onended = () => {
          try {
            noiseSrc.disconnect();
            filter.disconnect();
            nGain.disconnect();
          } catch {}
        };
      }
    } catch {}
    return true;
  }
}
