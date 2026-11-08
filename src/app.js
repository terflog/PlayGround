import { POKEYELLOW_DATA } from "./data/pokeyellow-data.js";
import { PokeYellowEngine } from "./engine.js";
import { GameBoyAudio } from "./audio.js";

const engine = new PokeYellowEngine(POKEYELLOW_DATA);
const audio = new GameBoyAudio(POKEYELLOW_DATA.music);

// Authentic Gen 1 Items Catalog & Prices (from data/items/prices.asm & marts.asm)
export const ITEM_CATALOG = {
  MASTER_BALL: {
    id: "MASTER_BALL",
    name: "MASTER BALL",
    price: 0,
    kind: "ball",
    catchMult: 255,
    desc: "The ultimate BALL! Catches any wild POKéMON without fail.",
  },
  ULTRA_BALL: {
    id: "ULTRA_BALL",
    name: "ULTRA BALL",
    price: 1200,
    kind: "ball",
    catchMult: 2.0,
    desc: "High-performance BALL with a higher catch rate than GREAT BALL.",
  },
  GREAT_BALL: {
    id: "GREAT_BALL",
    name: "GREAT BALL",
    price: 600,
    kind: "ball",
    catchMult: 1.5,
    desc: "A good, high-quality BALL with a better catch rate than POKé BALL.",
  },
  POKE_BALL: {
    id: "POKE_BALL",
    name: "POKé BALL",
    price: 200,
    kind: "ball",
    catchMult: 1.0,
    desc: "Standard tool used for catching wild POKéMON.",
  },
  POTION: {
    id: "POTION",
    name: "POTION",
    price: 300,
    kind: "heal",
    healHp: 20,
    desc: "Restores 20 HP to a party POKéMON.",
  },
  SUPER_POTION: {
    id: "SUPER_POTION",
    name: "SUPER POTION",
    price: 700,
    kind: "heal",
    healHp: 50,
    desc: "Restores 50 HP to a party POKéMON.",
  },
  HYPER_POTION: {
    id: "HYPER_POTION",
    name: "HYPER POTION",
    price: 1500,
    kind: "heal",
    healHp: 200,
    desc: "Restores 200 HP to a party POKéMON.",
  },
  MAX_POTION: {
    id: "MAX_POTION",
    name: "MAX POTION",
    price: 2500,
    kind: "heal",
    healHp: 999,
    desc: "Fully restores HP of a party POKéMON.",
  },
  FULL_RESTORE: {
    id: "FULL_RESTORE",
    name: "FULL RESTORE",
    price: 3000,
    kind: "heal",
    healHp: 999,
    cureStatus: true,
    desc: "Fully restores HP and cures all status problems of a POKéMON.",
  },
  REVIVE: {
    id: "REVIVE",
    name: "REVIVE",
    price: 1500,
    kind: "revive",
    revivePct: 0.5,
    desc: "Revives a fainted POKéMON and restores half its maximum HP.",
  },
  MAX_REVIVE: {
    id: "MAX_REVIVE",
    name: "MAX REVIVE",
    price: 4000,
    kind: "revive",
    revivePct: 1.0,
    desc: "Revives a fainted POKéMON and fully restores its HP.",
  },
  FRESH_WATER: {
    id: "FRESH_WATER",
    name: "FRESH WATER",
    price: 200,
    kind: "heal",
    healHp: 50,
    desc: "Mineral water from Celadon Dept. Roof! Restores 50 HP.",
  },
  SODA_POP: {
    id: "SODA_POP",
    name: "SODA POP",
    price: 300,
    kind: "heal",
    healHp: 60,
    desc: "Fizzy soda from Celadon Dept. Roof! Restores 60 HP.",
  },
  LEMONADE: {
    id: "LEMONADE",
    name: "LEMONADE",
    price: 350,
    kind: "heal",
    healHp: 80,
    desc: "Sweet lemonade from Celadon Dept. Roof! Restores 80 HP.",
  },
  ANTIDOTE: {
    id: "ANTIDOTE",
    name: "ANTIDOTE",
    price: 100,
    kind: "status",
    healHp: 10,
    cureStatus: true,
    desc: "Cures a poisoned POKéMON (+10 HP).",
  },
  BURN_HEAL: {
    id: "BURN_HEAL",
    name: "BURN HEAL",
    price: 250,
    kind: "status",
    healHp: 10,
    cureStatus: true,
    desc: "Heals a POKéMON suffering from a burn (+10 HP).",
  },
  ICE_HEAL: {
    id: "ICE_HEAL",
    name: "ICE HEAL",
    price: 250,
    kind: "status",
    healHp: 10,
    cureStatus: true,
    desc: "Defrosts a frozen POKéMON (+10 HP).",
  },
  AWAKENING: {
    id: "AWAKENING",
    name: "AWAKENING",
    price: 200,
    kind: "status",
    healHp: 10,
    cureStatus: true,
    desc: "Awakens a sleeping POKéMON (+10 HP).",
  },
  PARLYZ_HEAL: {
    id: "PARLYZ_HEAL",
    name: "PARLYZ HEAL",
    price: 200,
    kind: "status",
    healHp: 10,
    cureStatus: true,
    desc: "Cures a paralyzed POKéMON (+10 HP).",
  },
  FULL_HEAL: {
    id: "FULL_HEAL",
    name: "FULL HEAL",
    price: 600,
    kind: "status",
    healHp: 25,
    cureStatus: true,
    desc: "Eliminates all status problems of one POKéMON.",
  },
  ESCAPE_ROPE: {
    id: "ESCAPE_ROPE",
    name: "ESCAPE ROPE",
    price: 550,
    kind: "field",
    desc: "Use in a cave or room to warp back to the last outdoor town!",
  },
  REPEL: {
    id: "REPEL",
    name: "REPEL",
    price: 350,
    kind: "repel",
    steps: 100,
    desc: "Prevents weak wild POKéMON from appearing for 100 steps.",
  },
  SUPER_REPEL: {
    id: "SUPER_REPEL",
    name: "SUPER REPEL",
    price: 500,
    kind: "repel",
    steps: 200,
    desc: "Prevents wild POKéMON from appearing for 200 steps.",
  },
  MAX_REPEL: {
    id: "MAX_REPEL",
    name: "MAX REPEL",
    price: 700,
    kind: "repel",
    steps: 250,
    desc: "Prevents wild POKéMON from appearing for 250 steps.",
  },
  POKE_DOLL: {
    id: "POKE_DOLL",
    name: "POKé DOLL",
    price: 1000,
    kind: "field",
    desc: "An attractive doll! Distracts any wild POKéMON to flee.",
  },
  RARE_CANDY: {
    id: "RARE_CANDY",
    name: "RARE CANDY",
    price: 4800,
    kind: "level",
    desc: "Raises the level of a selected party POKéMON by 1!",
  },
  FIRE_STONE: {
    id: "FIRE_STONE",
    name: "FIRE STONE",
    price: 2100,
    kind: "stone",
    evolves: { EEVEE: "FLAREON", VULPIX: "NINETALES", GROWLITHE: "ARCANINE" },
    desc: "Evolves EEVEE, VULPIX, or GROWLITHE!",
  },
  THUNDER_STONE: {
    id: "THUNDER_STONE",
    name: "THUNDER STONE",
    price: 2100,
    kind: "stone",
    evolves: { EEVEE: "JOLTEON" },
    desc: "Evolves EEVEE into JOLTEON! (Partner PIKACHU refuses it!)",
  },
  WATER_STONE: {
    id: "WATER_STONE",
    name: "WATER STONE",
    price: 2100,
    kind: "stone",
    evolves: {
      EEVEE: "VAPOREON",
      POLIWHIRL: "POLIWRATH",
      SHELLDER: "CLOYSTER",
      STARYU: "STARMIE",
    },
    desc: "Evolves EEVEE, POLIWHIRL, SHELLDER, or STARYU!",
  },
  LEAF_STONE: {
    id: "LEAF_STONE",
    name: "LEAF STONE",
    price: 2100,
    kind: "stone",
    evolves: {
      GLOOM: "VILEPLUME",
      WEEPINBELL: "VICTREEBEL",
      EXEGGCUTE: "EXEGGUTOR",
    },
    desc: "Evolves GLOOM, WEEPINBELL, or EXEGGCUTE!",
  },
  MOON_STONE: {
    id: "MOON_STONE",
    name: "MOON STONE",
    price: 2100,
    kind: "stone",
    evolves: {
      NIDORINA: "NIDOQUEEN",
      NIDORINO: "NIDOKING",
      CLEFAIRY: "CLEFABLE",
      JIGGLYPUFF: "WIGGLYTUFF",
    },
    desc: "Evolves CLEFAIRY, JIGGLYPUFF, NIDORINA, or NIDORINO!",
  },
  HP_UP: {
    id: "HP_UP",
    name: "HP UP",
    price: 9800,
    kind: "vitamin",
    stat: "maxHp",
    boost: 6,
    desc: "Increases the MAX HP of one party POKéMON!",
  },
  PROTEIN: {
    id: "PROTEIN",
    name: "PROTEIN",
    price: 9800,
    kind: "vitamin",
    stat: "atk",
    boost: 4,
    desc: "Increases the ATTACK stat of one party POKéMON!",
  },
  IRON: {
    id: "IRON",
    name: "IRON",
    price: 9800,
    kind: "vitamin",
    stat: "def",
    boost: 4,
    desc: "Increases the DEFENSE stat of one party POKéMON!",
  },
  CARBOS: {
    id: "CARBOS",
    name: "CARBOS",
    price: 9800,
    kind: "vitamin",
    stat: "spd",
    boost: 4,
    desc: "Increases the SPEED stat of one party POKéMON!",
  },
  CALCIUM: {
    id: "CALCIUM",
    name: "CALCIUM",
    price: 9800,
    kind: "vitamin",
    stat: "spc",
    boost: 4,
    desc: "Increases the SPECIAL stat of one party POKéMON!",
  },
  NUGGET: {
    id: "NUGGET",
    name: "NUGGET",
    price: 10000,
    kind: "treasure",
    desc: "Made of pure gold! Can be sold at any POKé MART for ¥5,000.",
  },
};

// Authentic City-by-City Poké Mart Stock (from data/items/marts.asm)
export const MART_STOCKS = {
  VIRIDIAN_MART: ["POKE_BALL", "POTION", "ANTIDOTE", "PARLYZ_HEAL", "BURN_HEAL"],
  PEWTER_MART: [
    "POKE_BALL",
    "POTION",
    "ESCAPE_ROPE",
    "ANTIDOTE",
    "BURN_HEAL",
    "AWAKENING",
    "PARLYZ_HEAL",
  ],
  CERULEAN_MART: [
    "POKE_BALL",
    "POTION",
    "ESCAPE_ROPE",
    "REPEL",
    "ANTIDOTE",
    "BURN_HEAL",
    "AWAKENING",
    "PARLYZ_HEAL",
  ],
  VERMILION_MART: [
    "POKE_BALL",
    "SUPER_POTION",
    "ICE_HEAL",
    "AWAKENING",
    "PARLYZ_HEAL",
    "REPEL",
  ],
  LAVENDER_MART: [
    "GREAT_BALL",
    "SUPER_POTION",
    "REVIVE",
    "ESCAPE_ROPE",
    "SUPER_REPEL",
    "ANTIDOTE",
    "BURN_HEAL",
    "ICE_HEAL",
    "PARLYZ_HEAL",
  ],
  CELADON_MART_1F: [
    "POKE_BALL",
    "GREAT_BALL",
    "POTION",
    "SUPER_POTION",
    "REVIVE",
    "ESCAPE_ROPE",
  ],
  CELADON_MART_2F: [
    "GREAT_BALL",
    "SUPER_POTION",
    "REVIVE",
    "SUPER_REPEL",
    "ANTIDOTE",
    "BURN_HEAL",
    "ICE_HEAL",
    "AWAKENING",
    "PARLYZ_HEAL",
  ],
  CELADON_MART_3F: [
    "POKE_DOLL",
    "GREAT_BALL",
    "SUPER_POTION",
    "REVIVE",
  ],
  CELADON_MART_4F: [
    "POKE_DOLL",
    "FIRE_STONE",
    "THUNDER_STONE",
    "WATER_STONE",
    "LEAF_STONE",
  ],
  CELADON_MART_5F: [
    "HP_UP",
    "PROTEIN",
    "IRON",
    "CARBOS",
    "CALCIUM",
    "RARE_CANDY",
  ],
  CELADON_MART_ROOF: ["FRESH_WATER", "SODA_POP", "LEMONADE"],
  FUCHSIA_MART: [
    "ULTRA_BALL",
    "GREAT_BALL",
    "HYPER_POTION",
    "REVIVE",
    "FULL_HEAL",
    "SUPER_REPEL",
  ],
  SAFFRON_MART: [
    "GREAT_BALL",
    "HYPER_POTION",
    "MAX_REPEL",
    "ESCAPE_ROPE",
    "FULL_HEAL",
    "REVIVE",
  ],
  CINNABAR_MART: [
    "ULTRA_BALL",
    "GREAT_BALL",
    "HYPER_POTION",
    "MAX_REPEL",
    "ESCAPE_ROPE",
    "FULL_HEAL",
    "REVIVE",
  ],
  INDIGO_PLATEAU_LOBBY: [
    "ULTRA_BALL",
    "GREAT_BALL",
    "FULL_RESTORE",
    "MAX_POTION",
    "FULL_HEAL",
    "REVIVE",
    "MAX_REPEL",
  ],
};

function createInitialPartyAndStorage() {
  const starterPika = engine.createPokemonInstance("PIKACHU", 25, [
    "THUNDERBOLT",
    "QUICK_ATTACK",
    "THUNDER_WAVE",
    "SLAM",
  ]);
  starterPika.isPartnerPikachu = true;

  const pidgeotto = engine.createPokemonInstance("PIDGEOTTO", 18, [
    "WING_ATTACK",
    "QUICK_ATTACK",
    "GUST",
    "SAND_ATTACK",
  ]);

  const box1 = [
    engine.createPokemonInstance("BULBASAUR", 15, [
      "VINE_WHIP",
      "RAZOR_LEAF",
      "LEECH_SEED",
      "TACKLE",
    ]),
    engine.createPokemonInstance("CHARMANDER", 15, [
      "EMBER",
      "SLASH",
      "SCRATCH",
      "LEER",
    ]),
    engine.createPokemonInstance("SQUIRTLE", 15, [
      "WATER_GUN",
      "BUBBLE",
      "BITE",
      "TACKLE",
    ]),
    engine.createPokemonInstance("EEVEE", 20, [
      "QUICK_ATTACK",
      "BITE",
      "TAKE_DOWN",
      "SAND_ATTACK",
    ]),
    engine.createPokemonInstance("LAPRAS", 25, [
      "SURF",
      "ICE_BEAM",
      "BODY_SLAM",
      "CONFUSE_RAY",
    ]),
    engine.createPokemonInstance("SNORLAX", 30, [
      "BODY_SLAM",
      "HEADBUTT",
      "AMNESIA",
      "REST",
    ]),
  ];

  return {
    party: [starterPika, pidgeotto],
    pcBoxes: [
      { name: "BOX 1 (KANTO)", list: box1 },
      { name: "BOX 2", list: [] },
      { name: "BOX 3", list: [] },
      { name: "BOX 4", list: [] },
    ],
  };
}

const initMonsters = createInitialPartyAndStorage();

// State
const state = {
  currentZone: engine.zonesByConst.PALLET_TOWN,
  lastOutdoorMap: { mapConst: "PALLET_TOWN", warpIndex: 0 },
  lastPokeCenterMap: "VIRIDIAN_POKECENTER",
  viewMode: "split", // "split" | "zone" | "gb"
  showBorder: false,
  showEntitiesOnZoneMap: false, // Default false so the Full Zone Map matches the clean Pallet Town reference image 1:1 on load!
  showWarpsOnZoneMap: false,
  showGridOnZoneMap: false,
  showHiddenObjects: false,
  noClip: false,
  autoSurf: true,
  wildEncountersEnabled: true,
  repelSteps: 0,
  zoneZoom: "fit",
  categoryFilter: "canonical220",
  searchQuery: "",
  townMapFilterCoords: null,
  visitedZones: new Set(["PALLET_TOWN"]),
  pokedexOwned: new Set([
    "PIKACHU",
    "PIDGEOTTO",
    "BULBASAUR",
    "CHARMANDER",
    "SQUIRTLE",
    "EEVEE",
    "LAPRAS",
    "SNORLAX",
  ]),
  pokedexSeen: new Set([
    "PIKACHU",
    "PIDGEY",
    "PIDGEOTTO",
    "RATTATA",
    "SPEAROW",
    "BULBASAUR",
    "CHARMANDER",
    "SQUIRTLE",
    "EEVEE",
    "LAPRAS",
    "SNORLAX",
    "CHANSEY",
  ]),
  money: 3500,
  bag: {
    POKE_BALL: 5,
    GREAT_BALL: 2,
    POTION: 3,
    SUPER_POTION: 2,
    REVIVE: 1,
    ANTIDOTE: 2,
    PARLYZ_HEAL: 1,
    ESCAPE_ROPE: 1,
  },
  pcItemStorage: {
    RARE_CANDY: 3,
    MOON_STONE: 1,
    THUNDER_STONE: 1,
    FIRE_STONE: 1,
    WATER_STONE: 1,
    LEAF_STONE: 1,
    NUGGET: 1,
    MASTER_BALL: 1,
  },
  party: initMonsters.party,
  pcBoxes: initMonsters.pcBoxes,
  currentBoxIndex: 0,
  activeFacility: null, // null | "pokecenter" | "mart"
  pcActiveTab: "heal", // "heal" | "bill" | "redpc" | "oak"
  pcStatusText:
    "Welcome to our POKéMON CENTER! We heal your POKéMON back to perfect health!",
  martActiveTab: "buy", // "buy" | "sell" | "bag" | "all"
  martZoneConst: "VIRIDIAN_MART",
  martStatusText: "Hi there! May I help you? Select an item to buy or sell!",
  player: {
    x: 5,
    y: 6,
    renderX: 5,
    renderY: 6,
    dir: "DOWN",
    walking: false,
    stepParity: false,
    mode: "walk", // "walk" | "bike" | "surf"
    moveAnim: null,
  },
  pikachu: {
    x: 5,
    y: 5,
    renderX: 5,
    renderY: 5,
    dir: "DOWN",
    walking: false,
    stepParity: false,
    visible: true,
    friendship: 220,
    moodIndex: 0,
  },
  activeEmote: null,
  emoteTimer: null,
  npcs: [],
  dialogue: null, // { title, pages: [], pageIndex: 0, pikachuMood: null, elevatorOptions: null, extraActions: null }
  battle: null,
  selectedElevatorDest: {},
};

const PIKACHU_MOODS = [
  {
    frames: ["pikachu_heart_1", "pikachu_heart_2"],
    emote: "heart",
    title: "PIKACHU's Mood: Adoring ♥",
    text: "PIKACHU: Pika-pii! ♥\n\nPIKACHU is beaming with happiness and nuzzling close to RED!",
  },
  {
    frames: ["pikachu_2_hearts_1", "pikachu_2_hearts_2"],
    emote: "heart",
    title: "PIKACHU's Mood: Overjoyed ♥♥",
    text: "PIKACHU: Pikachuuu! ♥♥\n\nPIKACHU looks thrilled to be traveling through Kanto with you!",
  },
  {
    frames: ["pikachu_excited_1", "pikachu_excited_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Excited ♪",
    text: "PIKACHU: Pi-pika! ♪\n\nPIKACHU is hopping around energetically and ready for adventure!",
  },
  {
    frames: ["pikachu_wink_1", "pikachu_wink_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Playful ★",
    text: "PIKACHU: Pika! ★\n\nPIKACHU gave you a confident wink!",
  },
  {
    frames: ["pikachu_lightning_1", "pikachu_lightning_2"],
    emote: "bolt",
    title: "PIKACHU's Mood: Charged Up ⚡",
    text: "PIKACHU: PIKA-CHU!! ⚡\n\nStatic electricity is crackling from PIKACHU's red cheeks!",
  },
];

const ELEVATOR_FLOORS = {
  CELADON_MART_ELEVATOR: [
    { label: "1F — Service Counter", destConst: "CELADON_MART_1F", warpIndex: 4 },
    { label: "2F — Trainer's Market", destConst: "CELADON_MART_2F", warpIndex: 2 },
    { label: "3F — TV Game Shop", destConst: "CELADON_MART_3F", warpIndex: 2 },
    { label: "4F — Wiseman Gifts", destConst: "CELADON_MART_4F", warpIndex: 2 },
    { label: "5F — Drug Store", destConst: "CELADON_MART_5F", warpIndex: 2 },
  ],
  ROCKET_HIDEOUT_ELEVATOR: [
    { label: "B1F — Upper Hideout", destConst: "ROCKET_HIDEOUT_B1F", warpIndex: 3 },
    { label: "B2F — Maze Floor", destConst: "ROCKET_HIDEOUT_B2F", warpIndex: 3 },
    { label: "B4F — Giovanni's Quarters", destConst: "ROCKET_HIDEOUT_B4F", warpIndex: 1 },
  ],
  SILPH_CO_ELEVATOR: [
    { label: "1F — Reception Lobby", destConst: "SILPH_CO_1F", warpIndex: 2 },
    { label: "2F — 2nd Floor", destConst: "SILPH_CO_2F", warpIndex: 1 },
    { label: "3F — 3rd Floor", destConst: "SILPH_CO_3F", warpIndex: 1 },
    { label: "4F — 4th Floor", destConst: "SILPH_CO_4F", warpIndex: 1 },
    { label: "5F — 5th Floor", destConst: "SILPH_CO_5F", warpIndex: 1 },
    { label: "6F — 6th Floor", destConst: "SILPH_CO_6F", warpIndex: 1 },
    { label: "7F — 7th Floor", destConst: "SILPH_CO_7F", warpIndex: 1 },
    { label: "8F — 8th Floor", destConst: "SILPH_CO_8F", warpIndex: 1 },
    { label: "9F — 9th Floor", destConst: "SILPH_CO_9F", warpIndex: 1 },
    { label: "10F — 10th Floor", destConst: "SILPH_CO_10F", warpIndex: 1 },
    { label: "11F — President's Office", destConst: "SILPH_CO_11F", warpIndex: 1 },
  ],
};

function findDefaultSpawn(zone, spawnWarpIndex = null) {
  if (spawnWarpIndex !== null && zone.warps[spawnWarpIndex]) {
    const w = zone.warps[spawnWarpIndex];
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileAtWarp = engine.getCollisionTileAtStep(zone, w.x, w.y);
    if (
      zone.romId < 0x25 &&
      ts.doorSet.has(tileAtWarp) &&
      w.y + 1 < zone.height * 2
    ) {
      return { x: w.x, y: w.y + 1, dir: "DOWN" };
    }
    return { x: w.x, y: w.y, dir: "DOWN" };
  }

  if (zone.constName === "PALLET_TOWN") {
    return { x: 5, y: 6, dir: "DOWN" };
  }

  if (zone.warps.length > 0) {
    const w = zone.warps[0];
    if (zone.romId < 0x25 && w.y + 1 < zone.height * 2) {
      return { x: w.x, y: w.y + 1, dir: "DOWN" };
    }
    if (w.y > 0 && engine.isStepPassable(zone, w.x, w.y, w.x, w.y - 1)) {
      return { x: w.x, y: w.y - 1, dir: "UP" };
    }
    return { x: w.x, y: w.y, dir: "DOWN" };
  }

  const cx = Math.floor(zone.width);
  const cy = Math.floor(zone.height);
  const ts = engine.tilesetsByConst[zone.tileset];
  for (let r = 0; r < Math.max(zone.width, zone.height) * 2; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const sx = cx + dx;
        const sy = cy + dy;
        if (sx >= 0 && sx < zone.width * 2 && sy >= 0 && sy < zone.height * 2) {
          const tid = engine.getCollisionTileAtStep(zone, sx, sy);
          if (ts.passableSet.has(tid)) {
            return { x: sx, y: sy, dir: "DOWN" };
          }
        }
      }
    }
  }
  return { x: cx, y: cy, dir: "DOWN" };
}

function initZoneNpcs(zone) {
  return zone.objects.map((o) => ({
    ...o,
    x: o.x,
    y: o.y,
    originX: o.x,
    originY: o.y,
    renderX: o.x,
    renderY: o.y,
    facing:
      o.dir === "UP" || o.dir === "DOWN" || o.dir === "LEFT" || o.dir === "RIGHT"
        ? o.dir
        : "DOWN",
    isWalking: false,
    stepParity: false,
    moveAnim: null,
    collected: false,
    defeated: false,
  }));
}

export function loadZone(target, options = {}) {
  let zone = null;
  if (typeof target === "object" && target !== null) {
    zone = target;
  } else if (typeof target === "number") {
    zone = engine.zonesByNumber[target] || engine.zonesByRomId[target];
  } else if (typeof target === "string") {
    const clean = target.trim();
    if (clean.startsWith("0x") || clean.startsWith("0X")) {
      zone = engine.zonesByRomId[parseInt(clean, 16)];
    } else if (/^\d+$/.test(clean)) {
      zone = engine.zonesByNumber[parseInt(clean, 10)];
    } else {
      zone =
        engine.zonesByConst[clean.toUpperCase()] ||
        engine.allZones.find(
          (z) =>
            z.headerName.toLowerCase() === clean.toLowerCase() ||
            z.displayName.toLowerCase() === clean.toLowerCase()
        );
    }
  }
  if (!zone) return null;

  if (state.currentZone && state.currentZone.romId < 0x25) {
    state.lastOutdoorMap = {
      mapConst: state.currentZone.constName,
      warpIndex: options.fromOutdoorWarpIndex ?? 0,
    };
  } else if (zone.romId >= 0x25 && zone.defaultParent) {
    if (!state.lastOutdoorMap || options.resetParent) {
      state.lastOutdoorMap = { ...zone.defaultParent };
    }
  }

  if (zone.constName.includes("POKECENTER")) {
    state.lastPokeCenterMap = zone.constName;
  }

  state.currentZone = zone;
  state.visitedZones.add(zone.constName);
  state.npcs = initZoneNpcs(zone);
  state.dialogue = null;
  state.activeFacility = null;
  renderFacilityModals();
  renderDialogueModal();

  const spawn =
    options.x !== undefined && options.y !== undefined
      ? { x: options.x, y: options.y, dir: options.dir || state.player.dir }
      : findDefaultSpawn(zone, options.warpIndex ?? null);

  state.player.x = spawn.x;
  state.player.y = spawn.y;
  state.player.renderX = spawn.x;
  state.player.renderY = spawn.y;
  state.player.dir = spawn.dir || "DOWN";
  state.player.walking = false;
  state.player.moveAnim = null;
  if (zone.romId >= 0x25 && state.player.mode === "bike") {
    state.player.mode = "walk";
  }

  // Place Pikachu 1 step behind Red
  const behindOffsets = {
    DOWN: [0, -1],
    UP: [0, 1],
    LEFT: [1, 0],
    RIGHT: [-1, 0],
  };
  const [bx, by] = behindOffsets[state.player.dir] || [0, -1];
  const px = Math.max(0, Math.min(zone.width * 2 - 1, spawn.x + bx));
  const py = Math.max(0, Math.min(zone.height * 2 - 1, spawn.y + by));
  state.pikachu.x = px;
  state.pikachu.y = py;
  state.pikachu.renderX = px;
  state.pikachu.renderY = py;
  state.pikachu.dir = state.player.dir;
  state.pikachu.walking = false;
  state.pikachu.moveAnim = null;

  audio.playTrack(zone.music);
  updateUIForCurrentZone();
  renderAllCanvases();
  return zone;
}

function triggerEmote(emoteKey, durationMs = 1500) {
  state.activeEmote = emoteKey;
  if (state.emoteTimer) clearTimeout(state.emoteTimer);
  state.emoteTimer = setTimeout(() => {
    state.activeEmote = null;
  }, durationMs);
}

function resolveWarpDestination(zone, warp) {
  let destConst = warp.destConst;
  let destWarpIdx = warp.destWarpIndex;
  if (destConst === "LAST_MAP") {
    if (
      state.lastOutdoorMap &&
      engine.zonesByConst[state.lastOutdoorMap.mapConst]
    ) {
      destConst = state.lastOutdoorMap.mapConst;
    } else if (zone.defaultParent) {
      destConst = zone.defaultParent.mapConst;
    } else {
      destConst = "PALLET_TOWN";
    }
  }
  if (
    ELEVATOR_FLOORS[zone.constName] &&
    state.selectedElevatorDest[zone.constName]
  ) {
    const chosen = state.selectedElevatorDest[zone.constName];
    destConst = chosen.destConst;
    destWarpIdx = chosen.warpIndex;
  }
  return { destConst, destWarpIdx };
}

function checkWarpAtStep(zone, sx, sy) {
  for (let i = 0; i < zone.warps.length; i++) {
    const w = zone.warps[i];
    if (w.x === sx && w.y === sy) {
      return { warp: w, warpIdx: i };
    }
  }
  return null;
}

function isWaterTile(zone, tileId) {
  return (
    (zone.tileset === "OVERWORLD" ||
      zone.tileset === "FOREST" ||
      zone.tileset === "PLATEAU" ||
      zone.tileset === "CAVERN" ||
      zone.tileset === "SHIP_PORT") &&
    (tileId === 0x14 || tileId === 0x32 || tileId === 0x48)
  );
}

// Check if a step coordinate (sx, sy) in `zone` is a Pokémon Center PC or Red's House 2F PC!
export function isComputerTileAtStep(zone, sx, sy) {
  if (!zone) return false;
  if (sx < 0 || sy < 0 || sx >= zone.width * 2 || sy >= zone.height * 2) {
    return false;
  }
  const collTile = engine.getCollisionTileAtStep(zone, sx, sy);
  const topTile = engine.getTileIdAt8x8(zone, sx * 2, sy * 2);
  // In POKECENTER and MART (Indigo Plateau Lobby), PC monitor is collision tile $52 / top tile $42
  if (
    (zone.tileset === "POKECENTER" || zone.tileset === "MART") &&
    (collTile === 0x52 || topTile === 0x42 || (zone.tileset === "POKECENTER" && sx === 13 && sy === 3))
  ) {
    return true;
  }
  // In REDS_HOUSE_2F, Red's PC is at (0, 1) with collision tile $32 / top tile $42
  if (zone.constName === "REDS_HOUSE_2F" && sx === 0 && (sy === 1 || sy === 0)) {
    return true;
  }
  return false;
}

function attemptStep(dir) {
  if (state.dialogue || state.battle || state.activeFacility) return;
  if (state.player.moveAnim) return;

  const zone = state.currentZone;
  state.player.dir = dir;

  const dx = dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0;
  const dy = dir === "UP" ? -1 : dir === "DOWN" ? 1 : 0;
  const targetX = state.player.x + dx;
  const targetY = state.player.y + dy;

  // 1. Check if standing on a warp tile at the edge of an indoor room and pressing outward
  const standingWarp = checkWarpAtStep(zone, state.player.x, state.player.y);
  if (standingWarp) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const curTile = engine.getCollisionTileAtStep(
      zone,
      state.player.x,
      state.player.y
    );
    const pushingOut =
      (dir === "DOWN" && state.player.y === zone.height * 2 - 1) ||
      (dir === "UP" && state.player.y === 0) ||
      (dir === "LEFT" && state.player.x === 0) ||
      (dir === "RIGHT" && state.player.x === zone.width * 2 - 1) ||
      (zone.romId >= 0x25 && dir === "DOWN" && ts.warpSet.has(curTile));
    if (pushingOut) {
      const { destConst, destWarpIdx } = resolveWarpDestination(
        zone,
        standingWarp.warp
      );
      audio.playSfx("warp");
      loadZone(destConst, {
        warpIndex: destWarpIdx,
        fromOutdoorWarpIndex: standingWarp.warpIdx,
      });
      return;
    }
  }

  // 2. Check map border connections (North / South / West / East seamless transition!)
  const conns = zone.connections || {};
  if (targetY < 0 && conns.north) {
    const targetZone = engine.zonesByConst[conns.north.targetConst];
    if (targetZone) {
      const newX = targetX - conns.north.offset * 2;
      const newY = targetZone.height * 2 - 1;
      if (newX >= 0 && newX < targetZone.width * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "UP" });
        return;
      }
    }
  }
  if (targetY >= zone.height * 2 && conns.south) {
    const targetZone = engine.zonesByConst[conns.south.targetConst];
    if (targetZone) {
      const newX = targetX - conns.south.offset * 2;
      const newY = 0;
      if (newX >= 0 && newX < targetZone.width * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "DOWN" });
        return;
      }
    }
  }
  if (targetX < 0 && conns.west) {
    const targetZone = engine.zonesByConst[conns.west.targetConst];
    if (targetZone) {
      const newX = targetZone.width * 2 - 1;
      const newY = targetY - conns.west.offset * 2;
      if (newY >= 0 && newY < targetZone.height * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "LEFT" });
        return;
      }
    }
  }
  if (targetX >= zone.width * 2 && conns.east) {
    const targetZone = engine.zonesByConst[conns.east.targetConst];
    if (targetZone) {
      const newX = 0;
      const newY = targetY - conns.east.offset * 2;
      if (newY >= 0 && newY < targetZone.height * 2) {
        loadZone(targetZone, { x: newX, y: newY, dir: "RIGHT" });
        return;
      }
    }
  }

  // Bounds check inside current zone
  if (
    targetX < 0 ||
    targetX >= zone.width * 2 ||
    targetY < 0 ||
    targetY >= zone.height * 2
  ) {
    audio.playSfx("bump");
    return;
  }

  // 3. Check one-way ledge jump!
  if (
    !state.noClip &&
    engine.canJumpLedge(zone, state.player.x, state.player.y, dir)
  ) {
    const landX = state.player.x + dx * 2;
    const landY = state.player.y + dy * 2;
    if (
      landX >= 0 &&
      landX < zone.width * 2 &&
      landY >= 0 &&
      landY < zone.height * 2
    ) {
      audio.playSfx("ledge");
      startPlayerMove(landX, landY, dir, 260, true);
      return;
    }
  }

  // 4. Check NPC collision
  if (!state.noClip) {
    for (const npc of state.npcs) {
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (npc.collected) continue;
      if (npc.x === targetX && npc.y === targetY) {
        audio.playSfx("bump");
        return;
      }
    }
  }

  // 5. Check tile passability or water surfing
  const targetTile = engine.getCollisionTileAtStep(zone, targetX, targetY);
  const water = isWaterTile(zone, targetTile);
  const passable =
    state.noClip ||
    engine.isStepPassable(zone, state.player.x, state.player.y, targetX, targetY) ||
    (water && (state.player.mode === "surf" || state.autoSurf));

  const targetWarp = checkWarpAtStep(zone, targetX, targetY);

  if (!passable && !targetWarp) {
    audio.playSfx("bump");
    return;
  }

  if (water && state.player.mode !== "surf") {
    state.player.mode = "surf";
  } else if (!water && state.player.mode === "surf") {
    state.player.mode = "walk";
  }

  const dur = state.player.mode === "bike" ? 105 : 165;
  startPlayerMove(targetX, targetY, dir, dur, false);
}

function startPlayerMove(destX, destY, dir, durationMs, isLedgeJump = false) {
  const prevPlayerX = state.player.x;
  const prevPlayerY = state.player.y;

  state.player.walking = true;
  state.player.stepParity = !state.player.stepParity;
  state.player.moveAnim = {
    fromX: state.player.x,
    fromY: state.player.y,
    toX: destX,
    toY: destY,
    startTime: performance.now(),
    duration: durationMs,
    isLedgeJump,
  };

  if (state.pikachu.visible) {
    const pdx = prevPlayerX - state.pikachu.x;
    const pdy = prevPlayerY - state.pikachu.y;
    let pdir = dir;
    if (Math.abs(pdx) + Math.abs(pdy) > 0) {
      if (Math.abs(pdx) >= Math.abs(pdy)) {
        pdir = pdx > 0 ? "RIGHT" : "LEFT";
      } else {
        pdir = pdy > 0 ? "DOWN" : "UP";
      }
    }
    state.pikachu.dir = pdir;
    state.pikachu.walking = true;
    state.pikachu.stepParity = !state.pikachu.stepParity;
    state.pikachu.moveAnim = {
      fromX: state.pikachu.x,
      fromY: state.pikachu.y,
      toX: prevPlayerX,
      toY: prevPlayerY,
      startTime: performance.now(),
      duration: durationMs,
    };
  }
}

function onPlayerStepCompleted() {
  const zone = state.currentZone;
  const sx = state.player.x;
  const sy = state.player.y;

  if (state.repelSteps > 0) {
    state.repelSteps--;
  }

  updateCoordinatesUI();

  // Check if stepped onto a door / staircase warp
  const hitWarp = checkWarpAtStep(zone, sx, sy);
  if (hitWarp) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileId = engine.getCollisionTileAtStep(zone, sx, sy);
    const isBottomExitMat =
      zone.romId >= 0x25 &&
      sy === zone.height * 2 - 1 &&
      !ts.doorSet.has(tileId);
    if (!isBottomExitMat) {
      const { destConst, destWarpIdx } = resolveWarpDestination(
        zone,
        hitWarp.warp
      );
      audio.playSfx("warp");
      loadZone(destConst, {
        warpIndex: destWarpIdx,
        fromOutdoorWarpIndex: hitWarp.warpIdx,
      });
      return;
    }
  }

  // Check wild Pokémon encounter in tall grass / caves / water
  if (state.wildEncountersEnabled && state.repelSteps <= 0) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileId = engine.getCollisionTileAtStep(zone, sx, sy);
    const inGrass = tileId === ts.grassTile;
    const inCaveOrDungeon =
      zone.category === "dungeon" && zone.wild.grassRate > 0;
    const onWater = isWaterTile(zone, tileId) && zone.wild.waterRate > 0;

    if (inGrass && zone.wild.grass.length > 0) {
      if (Math.random() < 0.14) {
        triggerWildEncounter(zone.wild.grass);
      }
    } else if (onWater && zone.wild.water.length > 0) {
      if (Math.random() < 0.1) {
        triggerWildEncounter(zone.wild.water);
      }
    } else if (inCaveOrDungeon && zone.wild.grass.length > 0) {
      if (Math.random() < 0.06) {
        triggerWildEncounter(zone.wild.grass);
      }
    }
  }
}

// Interact with what is in front of Red (A button / Space / Enter)
export function interactInFront() {
  if (state.battle) return;
  if (state.activeFacility) return;
  if (state.dialogue) {
    advanceDialogue();
    return;
  }

  const zone = state.currentZone;
  const dx =
    state.player.dir === "LEFT" ? -1 : state.player.dir === "RIGHT" ? 1 : 0;
  const dy =
    state.player.dir === "UP" ? -1 : state.player.dir === "DOWN" ? 1 : 0;
  const fx = state.player.x + dx;
  const fy = state.player.y + dy;

  // 1. Check if facing a Pokémon Center PC or Red's House 2F PC!
  if (
    isComputerTileAtStep(zone, fx, fy) ||
    isComputerTileAtStep(zone, state.player.x, state.player.y)
  ) {
    openPokeCenterModal(zone.constName === "REDS_HOUSE_2F" ? "redpc" : "bill");
    return;
  }

  // 2. Check if facing following Pikachu!
  if (
    state.pikachu.visible &&
    state.pikachu.x === fx &&
    state.pikachu.y === fy
  ) {
    openPikachuInteraction();
    return;
  }

  // 3. Check Elevator control panel
  if (ELEVATOR_FLOORS[zone.constName]) {
    for (const s of zone.signs) {
      if (s.x === fx && s.y === fy) {
        openElevatorMenu(zone.constName);
        return;
      }
    }
  }

  // 4. Check Celadon Rooftop Vending Machines or Signs (bg_events)
  for (const s of zone.signs) {
    if (s.x === fx && s.y === fy) {
      if (
        zone.constName === "CELADON_MART_ROOF" &&
        s.text.toUpperCase().includes("VENDING")
      ) {
        openMartModal("buy", "CELADON_MART_ROOF");
        return;
      }
      audio.playSfx("blip");
      openDialogue("SIGNPOST", s.text);
      return;
    }
  }

  // 5. Check NPCs / Items (including 2 steps away across counter tiles in PokéCenters & Marts!)
  const ts = engine.tilesetsByConst[zone.tileset];
  const frontTile = engine.getCollisionTileAtStep(zone, fx, fy);
  const acrossCounter = ts.counterSet.has(frontTile);
  const checkCoords = [[fx, fy]];
  if (acrossCounter) {
    checkCoords.push([fx + dx, fy + dy]);
  }

  for (const [cx, cy] of checkCoords) {
    for (const npc of state.npcs) {
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (npc.collected) continue;
      if (npc.x === cx && npc.y === cy) {
        interactWithNpc(npc);
        return;
      }
    }
  }
}

export function interactWithNpc(npc) {
  if (!npc) return;
  const zone = state.currentZone;
  const opp = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  npc.facing = opp[state.player.dir] || "DOWN";

  // 1. Item Ball pickup on overworld
  if (npc.kind === "item") {
    npc.collected = true;
    const rawItem = (npc.extra || "POTION").toUpperCase();
    const itemKey = ITEM_CATALOG[rawItem] ? rawItem : "POTION";
    state.bag[itemKey] = (state.bag[itemKey] || 0) + 1;
    audio.playSfx("buy");
    updateHudTelemetry();
    openDialogue(
      "FOUND ITEM!",
      `${npc.text}\n\nPut ${ITEM_CATALOG[itemKey].name} into the BAG!`
    );
    return;
  }

  const upName = (npc.name || "").toUpperCase();

  // 2. Nurse Joy in Pokémon Centers (or Indigo Plateau Lobby) -> Full PokéCenter Heal & PC Service!
  if (npc.sprite === "SPRITE_NURSE" || upName.includes("NURSE")) {
    openPokeCenterModal("heal");
    return;
  }

  // 3. Chansey beside Nurse Joy in Pokémon Centers -> Heals Party & Pikachu Friendship!
  if (npc.sprite === "SPRITE_CHANSEY" || upName.includes("CHANSEY")) {
    healPartyAtPokeCenter(true);
    openDialogue(
      "POKéMON CENTER CHANSEY",
      `${npc.text}\n\nCHANSEY's gentle song restored your party's HP & PP and filled PIKACHU with joy! ♥`,
      {
        extraActions: [
          {
            label: "🏥 Open PokéCenter & PC",
            onClick: () => {
              state.dialogue = null;
              renderDialogueModal();
              openPokeCenterModal("heal");
            },
          },
          ...(npc.battle
            ? [
                {
                  label: "⚔️ Friendly Spar",
                  onClick: () => {
                    state.dialogue = null;
                    renderDialogueModal();
                    triggerTrainerBattle(npc);
                  },
                },
              ]
            : []),
        ],
      }
    );
    return;
  }

  // 4. Poké Mart Clerk (in any Town Mart, Celadon Dept. Store, or Indigo Plateau Lobby) -> Full Poké Mart Shop!
  if (npc.sprite === "SPRITE_CLERK" || upName.includes("CLERK")) {
    openMartModal("buy", zone.constName);
    return;
  }

  // 5. Cable Club Receptionist -> Keep area usable for later content (standard dialogue + optional room access)
  if (
    npc.sprite === "SPRITE_LINK_RECEPTIONIST" ||
    upName.includes("LINK_RECEPTIONIST")
  ) {
    audio.playSfx("blip");
    openDialogue(npc.name.replace(/_/g, " "), npc.text, {
      extraActions: [
        {
          label: "🚪 Enter Trade Center",
          onClick: () => {
            state.dialogue = null;
            renderDialogueModal();
            loadZone("TRADE_CENTER", { resetParent: false });
          },
        },
        {
          label: "🏟️ Enter Colosseum",
          onClick: () => {
            state.dialogue = null;
            renderDialogueModal();
            loadZone("COLOSSEUM", { resetParent: false });
          },
        },
      ],
    });
    return;
  }

  // 6. Official Trainers, Gym Leaders, Rival Blue, Giovanni, Jessie & James, Elite Four, Snorlax, Legendaries
  const isMajorBossOrTrainer =
    npc.kind === "trainer" ||
    npc.sprite === "SPRITE_BLUE" ||
    npc.sprite === "SPRITE_GIOVANNI" ||
    npc.sprite === "SPRITE_LORELEI" ||
    npc.sprite === "SPRITE_BRUNO" ||
    npc.sprite === "SPRITE_AGATHA" ||
    npc.sprite === "SPRITE_LANCE" ||
    npc.sprite === "SPRITE_SNORLAX" ||
    upName.includes("JESSIE") ||
    upName.includes("JAMES") ||
    upName.includes("RIVAL") ||
    upName.includes("ARTICUNO") ||
    upName.includes("ZAPDOS") ||
    upName.includes("MOLTRES") ||
    upName.includes("MEWTWO");

  if (isMajorBossOrTrainer && npc.battle && !npc.defeated) {
    audio.playSfx("blip");
    openDialogue(
      npc.battle.trainerName || npc.name.replace(/_/g, " "),
      npc.battle.battleText || npc.text,
      {
        onFinish: () => triggerTrainerBattle(npc),
        extraActions: [
          {
            label: "⚔️ START BATTLE!",
            onClick: () => {
              state.dialogue = null;
              renderDialogueModal();
              triggerTrainerBattle(npc);
            },
          },
        ],
      }
    );
    return;
  }

  // 7. Standard Town / Indoor NPC: show authentic dialogue + optional "⚔️ Challenge to Battle" button
  audio.playSfx("blip");
  const extraActions = [];
  if (npc.battle) {
    extraActions.push({
      label: `⚔️ Battle (${npc.battle.trainerName})`,
      onClick: () => {
        state.dialogue = null;
        renderDialogueModal();
        triggerTrainerBattle(npc);
      },
    });
  }
  openDialogue(
    npc.name.replace(/_/g, " "),
    npc.defeated && npc.battle?.afterBattleText
      ? npc.battle.afterBattleText
      : npc.text,
    { extraActions }
  );
}

// ============================================================================
// POKéMON CENTER & COMPUTER (BILL'S PC / RED'S PC / OAK'S PC) FUNCTIONALITY
// ============================================================================

export function healPartyAtPokeCenter(silentModal = false) {
  for (const mon of state.party) {
    mon.hp = mon.maxHp;
    mon.status = null;
    for (const mv of mon.moves) {
      mv.pp = mv.maxPp;
    }
  }
  state.pikachu.friendship = Math.min(255, state.pikachu.friendship + 15);
  triggerEmote("heart", 2200);
  audio.playSfx("heal");
  state.pcStatusText =
    "♪ Ding-ding-ding-ding-ding! ♪ Thank you! Your POKéMON are fighting fit and all HP & PP are 100% restored!";
  updateHudTelemetry();
  if (!silentModal && state.activeFacility === "pokecenter") {
    renderFacilityModals();
  }
}

export function openPokeCenterModal(initialTab = "heal") {
  state.dialogue = null;
  renderDialogueModal();
  state.activeFacility = "pokecenter";
  state.pcActiveTab = initialTab;
  if (initialTab === "bill") {
    audio.playSfx("pc");
    state.pcStatusText =
      "Accessed BILL'S PC! POKéMON Storage System opened. Withdraw or Deposit POKéMON below.";
  } else if (initialTab === "redpc") {
    audio.playSfx("pc");
    state.pcStatusText =
      "Accessed RED'S PC! Item Storage System opened. Withdraw, Deposit, or Use items.";
  } else if (initialTab === "oak") {
    audio.playSfx("pc");
    state.pcStatusText = `PROF. OAK'S PC: You have seen ${state.pokedexSeen.size} and owned ${state.pokedexOwned.size} POKéMON species!`;
  } else {
    audio.playSfx("blip");
    state.pcStatusText =
      "Welcome to our POKéMON CENTER! Shall we heal your POKéMON back to perfect health?";
  }
  renderFacilityModals();
}

export function depositPartyPokemonToPc(partyIdx) {
  if (state.party.length <= 1) {
    state.pcStatusText = "You can't deposit your last POKéMON!";
    renderFacilityModals();
    return false;
  }
  const box = state.pcBoxes[state.currentBoxIndex];
  if (box.list.length >= 20) {
    state.pcStatusText = `${box.name} is full (20/20)! Switch to another BOX first.`;
    renderFacilityModals();
    return false;
  }
  const [removed] = state.party.splice(partyIdx, 1);
  box.list.push(removed);
  audio.playSfx("pc");
  state.pcStatusText = `${removed.nickname} (Lv.${removed.level}) was stored in ${box.name}!`;
  updateHudTelemetry();
  renderFacilityModals();
  return true;
}

export function withdrawPokemonFromPc(boxPokemonIdx) {
  if (state.party.length >= 6) {
    state.pcStatusText =
      "Your PARTY is full (6/6)! Deposit a POKéMON into the BOX first.";
    renderFacilityModals();
    return false;
  }
  const box = state.pcBoxes[state.currentBoxIndex];
  const [withdrawn] = box.list.splice(boxPokemonIdx, 1);
  if (!withdrawn) return false;
  state.party.push(withdrawn);
  state.pokedexOwned.add(withdrawn.species);
  state.pokedexSeen.add(withdrawn.species);
  audio.playSfx("pc");
  state.pcStatusText = `Withdrew ${withdrawn.nickname} (Lv.${withdrawn.level}) from ${box.name} to your PARTY!`;
  updateHudTelemetry();
  renderFacilityModals();
  return true;
}

export function depositItemToPc(itemId) {
  if (!state.bag[itemId] || state.bag[itemId] <= 0) return false;
  state.bag[itemId]--;
  if (state.bag[itemId] <= 0) delete state.bag[itemId];
  state.pcItemStorage[itemId] = (state.pcItemStorage[itemId] || 0) + 1;
  audio.playSfx("pc");
  state.pcStatusText = `Stored 1× ${ITEM_CATALOG[itemId]?.name || itemId} in RED'S PC!`;
  renderFacilityModals();
  return true;
}

export function withdrawItemFromPc(itemId) {
  if (!state.pcItemStorage[itemId] || state.pcItemStorage[itemId] <= 0) return false;
  state.pcItemStorage[itemId]--;
  if (state.pcItemStorage[itemId] <= 0) delete state.pcItemStorage[itemId];
  state.bag[itemId] = (state.bag[itemId] || 0) + 1;
  audio.playSfx("pc");
  state.pcStatusText = `Withdrew 1× ${ITEM_CATALOG[itemId]?.name || itemId} from RED'S PC into your BAG!`;
  renderFacilityModals();
  return true;
}

// ============================================================================
// POKé MART & DEPARTMENT STORE FUNCTIONALITY (BUY / SELL / USE BAG)
// ============================================================================

export function openMartModal(initialTab = "buy", martZoneConst = null) {
  state.dialogue = null;
  renderDialogueModal();
  state.activeFacility = "mart";
  state.martActiveTab = initialTab;
  const zConst = martZoneConst || state.currentZone.constName;
  state.martZoneConst = MART_STOCKS[zConst] ? zConst : "VIRIDIAN_MART";
  audio.playSfx("blip");
  state.martStatusText =
    initialTab === "sell"
      ? "What would you like to sell from your BAG?"
      : initialTab === "bag"
      ? "Select an item from your BAG to use on your POKéMON!"
      : "Hi there! May I help you? Welcome to the POKéMON MART!";
  renderFacilityModals();
}

export function buyMartItem(itemId, qty = 1) {
  const item = ITEM_CATALOG[itemId];
  if (!item) return false;
  const totalCost = item.price * qty;
  if (state.money < totalCost) {
    audio.playSfx("bump");
    state.martStatusText = `You don't have enough money! (Need ¥${totalCost.toLocaleString()}, have ¥${state.money.toLocaleString()})`;
    renderFacilityModals();
    return false;
  }
  state.money -= totalCost;
  state.bag[itemId] = (state.bag[itemId] || 0) + qty;
  audio.playSfx("buy");
  state.martStatusText = `Here you are! Bought ${qty}× ${item.name} for ¥${totalCost.toLocaleString()}. Thank you!`;
  updateHudTelemetry();
  renderFacilityModals();
  return true;
}

export function sellBagItem(itemId, qty = 1) {
  const item = ITEM_CATALOG[itemId];
  if (!item || !state.bag[itemId] || state.bag[itemId] < qty) return false;
  const unitSell = Math.max(50, Math.floor(item.price / 2));
  const totalGain = unitSell * qty;
  state.bag[itemId] -= qty;
  if (state.bag[itemId] <= 0) delete state.bag[itemId];
  state.money += totalGain;
  audio.playSfx("buy");
  state.martStatusText = `Sold ${qty}× ${item.name} for ¥${totalGain.toLocaleString()}!`;
  updateHudTelemetry();
  renderFacilityModals();
  return true;
}

export function useBagItemOnParty(itemId, targetPartyIndex = 0) {
  const item = ITEM_CATALOG[itemId];
  if (!item || !state.bag[itemId] || state.bag[itemId] <= 0) return false;
  const mon = state.party[targetPartyIndex] || state.party[0];
  if (!mon) return false;

  if (item.kind === "repel") {
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    state.repelSteps = item.steps;
    audio.playSfx("blip");
    const msg = `RED sprayed ${item.name}! Wild POKéMON will be repelled for ${item.steps} steps.`;
    state.martStatusText = msg;
    state.pcStatusText = msg;
    renderFacilityModals();
    return true;
  }

  if (itemId === "ESCAPE_ROPE") {
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    state.activeFacility = null;
    renderFacilityModals();
    audio.playSfx("warp");
    const dest = state.lastOutdoorMap?.mapConst || "PALLET_TOWN";
    loadZone(dest, { warpIndex: state.lastOutdoorMap?.warpIndex || 0 });
    return true;
  }

  if (item.kind === "heal" || item.kind === "status") {
    if (mon.hp <= 0 && !item.revivePct) {
      const msg = `${mon.nickname} has fainted! Use a REVIVE or visit a POKéMON CENTER first.`;
      state.martStatusText = msg;
      state.pcStatusText = msg;
      renderFacilityModals();
      return false;
    }
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    const prevHp = mon.hp;
    mon.hp = Math.min(mon.maxHp, mon.hp + (item.healHp || 20));
    if (item.cureStatus) mon.status = null;
    audio.playSfx("heal");
    const msg = `Used ${item.name} on ${mon.nickname}! Restored ${mon.hp - prevHp} HP (${mon.hp}/${mon.maxHp}).`;
    state.martStatusText = msg;
    state.pcStatusText = msg;
    updateHudTelemetry();
    renderFacilityModals();
    return true;
  }

  if (item.kind === "revive") {
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    mon.hp = Math.max(1, Math.floor(mon.maxHp * (item.revivePct || 0.5)));
    mon.status = null;
    audio.playSfx("heal");
    const msg = `${mon.nickname} was revived by ${item.name} (${mon.hp}/${mon.maxHp} HP)!`;
    state.martStatusText = msg;
    state.pcStatusText = msg;
    updateHudTelemetry();
    renderFacilityModals();
    return true;
  }

  if (item.kind === "level") {
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    const upgraded = engine.createPokemonInstance(mon.species, mon.level + 1);
    mon.level = upgraded.level;
    mon.maxHp = upgraded.maxHp;
    mon.hp = upgraded.maxHp;
    mon.atk = upgraded.atk;
    mon.def = upgraded.def;
    mon.spd = upgraded.spd;
    mon.spc = upgraded.spc;
    mon.moves = upgraded.moves;
    audio.playSfx("victory");
    const msg = `${mon.nickname} grew to Lv.${mon.level}! All stats increased!`;
    state.martStatusText = msg;
    state.pcStatusText = msg;
    updateHudTelemetry();
    renderFacilityModals();
    return true;
  }

  if (item.kind === "vitamin") {
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    mon[item.stat] = (mon[item.stat] || 20) + item.boost;
    if (item.stat === "maxHp") mon.hp += item.boost;
    audio.playSfx("heal");
    const msg = `${mon.nickname}'s ${item.stat.toUpperCase()} rose after taking ${item.name}!`;
    state.martStatusText = msg;
    state.pcStatusText = msg;
    updateHudTelemetry();
    renderFacilityModals();
    return true;
  }

  if (item.kind === "stone") {
    // Authentic Pokémon Yellow: Partner Pikachu refuses the Thunder Stone!
    if (itemId === "THUNDER_STONE" && mon.species === "PIKACHU") {
      audio.playSfx("pika");
      triggerEmote("shock", 2000);
      const msg =
        "PIKACHU: Pika-pi!! (PIKACHU batted the THUNDER STONE away! It refuses to evolve!)";
      state.martStatusText = msg;
      state.pcStatusText = msg;
      renderFacilityModals();
      return false;
    }
    const targetSpecies = item.evolves && item.evolves[mon.species];
    if (!targetSpecies) {
      const msg = `${item.name} had no effect on ${mon.nickname}.`;
      state.martStatusText = msg;
      state.pcStatusText = msg;
      renderFacilityModals();
      return false;
    }
    state.bag[itemId]--;
    if (state.bag[itemId] <= 0) delete state.bag[itemId];
    const oldName = mon.nickname;
    const evolved = engine.createPokemonInstance(targetSpecies, mon.level);
    mon.species = evolved.species;
    mon.nickname = evolved.nickname;
    mon.maxHp = evolved.maxHp;
    mon.hp = evolved.maxHp;
    mon.atk = evolved.atk;
    mon.def = evolved.def;
    mon.spd = evolved.spd;
    mon.spc = evolved.spc;
    mon.types = evolved.types;
    mon.moves = evolved.moves;
    state.pokedexOwned.add(mon.species);
    state.pokedexSeen.add(mon.species);
    audio.playSfx("victory");
    const msg = `Congratulations! Your ${oldName} evolved into ${mon.nickname}!`;
    state.martStatusText = msg;
    state.pcStatusText = msg;
    updateHudTelemetry();
    renderFacilityModals();
    return true;
  }

  return false;
}

function renderFacilityModals() {
  const pcModal = document.getElementById("pokecenter-overlay");
  const martModal = document.getElementById("mart-overlay");

  if (pcModal) {
    if (state.activeFacility !== "pokecenter") {
      pcModal.classList.add("hidden");
    } else {
      pcModal.classList.remove("hidden");
      document.getElementById("pokecenter-title").textContent =
        state.currentZone.constName === "REDS_HOUSE_2F"
          ? "💻 RED'S BEDROOM PC"
          : `🏥 ${state.currentZone.displayName.toUpperCase()}`;
      document.getElementById("pokecenter-status-msg").textContent =
        state.pcStatusText;

      document.querySelectorAll("[data-pc-tab]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.pcTab === state.pcActiveTab);
      });

      const body = document.getElementById("pokecenter-body");
      body.innerHTML = "";

      if (state.pcActiveTab === "heal") {
        const healBtn = document.createElement("button");
        healBtn.className = "fac-primary-btn";
        healBtn.textContent = "❤️ HEAL PARTY TO 100% HP & PP";
        healBtn.onclick = () => healPartyAtPokeCenter(false);
        body.appendChild(healBtn);

        state.party.forEach((mon, idx) => {
          const row = document.createElement("div");
          row.className = "fac-row";
          const movesStr = mon.moves
            .map((m) => `${m.name} (${m.pp}/${m.maxPp})`)
            .join(", ");
          row.innerHTML = `
            <div class="fac-row-main">
              <span class="fac-row-title">#${idx + 1} ${mon.nickname} :L${mon.level} [${mon.types.join("/")}]</span>
              <span class="fac-row-sub">HP: ${mon.hp}/${mon.maxHp} • ${movesStr}</span>
            </div>
            <div class="fac-row-actions">
              ${
                idx > 0
                  ? `<button type="button" class="fac-mini-btn secondary" data-lead-idx="${idx}">Make Lead</button>`
                  : `<span class="fac-row-sub">★ LEAD</span>`
              }
            </div>
          `;
          const leadBtn = row.querySelector("[data-lead-idx]");
          if (leadBtn) {
            leadBtn.onclick = () => {
              const [chosen] = state.party.splice(idx, 1);
              state.party.unshift(chosen);
              state.pcStatusText = `${chosen.nickname} is now your lead POKéMON!`;
              renderFacilityModals();
            };
          }
          body.appendChild(row);
        });
      } else if (state.pcActiveTab === "bill") {
        // Bill's PC: Box selector + Party Deposit + Box Withdraw
        const boxBar = document.createElement("div");
        boxBar.className = "fac-row";
        const box = state.pcBoxes[state.currentBoxIndex];
        boxBar.innerHTML = `
          <div class="fac-row-main">
            <span class="fac-row-title">💻 ACTIVE STORAGE: ${box.name} (${box.list.length}/20)</span>
            <span class="fac-row-sub">Party: ${state.party.length}/6 • Deposit from Party or Withdraw from Box</span>
          </div>
          <div class="fac-row-actions"></div>
        `;
        const boxActs = boxBar.querySelector(".fac-row-actions");
        state.pcBoxes.forEach((b, bIdx) => {
          const bBtn = document.createElement("button");
          bBtn.className = `fac-mini-btn ${
            bIdx === state.currentBoxIndex ? "" : "secondary"
          }`;
          bBtn.textContent = `B${bIdx + 1}`;
          bBtn.onclick = () => {
            state.currentBoxIndex = bIdx;
            audio.playSfx("pc");
            state.pcStatusText = `Switched to ${state.pcBoxes[bIdx].name}!`;
            renderFacilityModals();
          };
          boxActs.appendChild(bBtn);
        });
        body.appendChild(boxBar);

        // Party section (Deposit)
        state.party.forEach((mon, idx) => {
          const row = document.createElement("div");
          row.className = "fac-row";
          row.innerHTML = `
            <div class="fac-row-main">
              <span class="fac-row-title">[PARTY #${idx + 1}] ${mon.nickname} :L${mon.level}</span>
              <span class="fac-row-sub">HP ${mon.hp}/${mon.maxHp} • ${mon.types.join("/")}</span>
            </div>
            <div class="fac-row-actions">
              <button type="button" class="fac-mini-btn secondary">Deposit → Box</button>
            </div>
          `;
          row.querySelector("button").onclick = () => depositPartyPokemonToPc(idx);
          body.appendChild(row);
        });

        // Box section (Withdraw)
        if (box.list.length === 0) {
          const empty = document.createElement("div");
          empty.className = "fac-row";
          empty.innerHTML = `<span class="fac-row-sub">${box.name} is currently empty.</span>`;
          body.appendChild(empty);
        } else {
          box.list.forEach((mon, bIdx) => {
            const row = document.createElement("div");
            row.className = "fac-row";
            row.innerHTML = `
              <div class="fac-row-main">
                <span class="fac-row-title">[BOX] ${mon.nickname} :L${mon.level}</span>
                <span class="fac-row-sub">HP ${mon.hp}/${mon.maxHp} • ${mon.types.join("/")}</span>
              </div>
              <div class="fac-row-actions">
                <button type="button" class="fac-mini-btn">← Withdraw</button>
              </div>
            `;
            row.querySelector("button").onclick = () =>
              withdrawPokemonFromPc(bIdx);
            body.appendChild(row);
          });
        }
      } else if (state.pcActiveTab === "redpc") {
        // Red's PC: Item Storage (Withdraw from PC / Deposit from Bag / Use on Lead)
        const pcEntries = Object.entries(state.pcItemStorage).filter(
          ([, c]) => c > 0
        );
        const bagEntries = Object.entries(state.bag).filter(([, c]) => c > 0);

        pcEntries.forEach(([itemId, count]) => {
          const info = ITEM_CATALOG[itemId] || {
            name: itemId,
            desc: "Stored item",
          };
          const row = document.createElement("div");
          row.className = "fac-row";
          row.innerHTML = `
            <div class="fac-row-main">
              <span class="fac-row-title">[PC BOX] ${info.name} ×${count}</span>
              <span class="fac-row-sub">${info.desc}</span>
            </div>
            <div class="fac-row-actions">
              <button type="button" class="fac-mini-btn">Withdraw ×1</button>
            </div>
          `;
          row.querySelector("button").onclick = () => withdrawItemFromPc(itemId);
          body.appendChild(row);
        });

        bagEntries.forEach(([itemId, count]) => {
          const info = ITEM_CATALOG[itemId] || {
            name: itemId,
            desc: "Bag item",
          };
          const row = document.createElement("div");
          row.className = "fac-row";
          row.innerHTML = `
            <div class="fac-row-main">
              <span class="fac-row-title">[BAG] ${info.name} ×${count}</span>
              <span class="fac-row-sub">${info.desc}</span>
            </div>
            <div class="fac-row-actions">
              <button type="button" class="fac-mini-btn" data-act="use">Use</button>
              <button type="button" class="fac-mini-btn secondary" data-act="dep">Deposit</button>
            </div>
          `;
          row.querySelector('[data-act="use"]').onclick = () =>
            useBagItemOnParty(itemId, 0);
          row.querySelector('[data-act="dep"]').onclick = () =>
            depositItemToPc(itemId);
          body.appendChild(row);
        });
      } else if (state.pcActiveTab === "oak") {
        const ratingRow = document.createElement("div");
        ratingRow.className = "fac-row";
        ratingRow.innerHTML = `
          <div class="fac-row-main">
            <span class="fac-row-title">PROF. OAK'S POKéDEX EVALUATION</span>
            <span class="fac-row-sub">POKéMON Seen: ${state.pokedexSeen.size} / 151 • POKéMON Owned: ${state.pokedexOwned.size} / 151</span>
            <span class="fac-row-sub">Zones Visited: ${state.visitedZones.size} / 220 • Money: ¥${state.money.toLocaleString()}</span>
            <span class="fac-row-sub">"OAK: Good! I see you and PIKACHU are working hard filling your POKéDEX!"</span>
          </div>
        `;
        body.appendChild(ratingRow);
      }
    }
  }

  if (martModal) {
    if (state.activeFacility !== "mart") {
      martModal.classList.add("hidden");
    } else {
      martModal.classList.remove("hidden");
      const martZone =
        engine.zonesByConst[state.martZoneConst] || state.currentZone;
      document.getElementById("mart-title").textContent = `🛒 ${martZone.displayName.toUpperCase()}`;
      document.getElementById("mart-money-badge").textContent = `¥${state.money.toLocaleString()}`;
      document.getElementById("mart-status-msg").textContent =
        state.martStatusText;

      document.querySelectorAll("[data-mart-tab]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.martTab === state.martActiveTab);
      });

      const body = document.getElementById("mart-body");
      body.innerHTML = "";

      if (state.martActiveTab === "buy" || state.martActiveTab === "all") {
        const stockIds =
          state.martActiveTab === "all"
            ? Object.keys(ITEM_CATALOG).filter((k) => ITEM_CATALOG[k].price > 0)
            : MART_STOCKS[state.martZoneConst] || MART_STOCKS.VIRIDIAN_MART;

        stockIds.forEach((itemId) => {
          const item = ITEM_CATALOG[itemId];
          if (!item) return;
          const owned = state.bag[itemId] || 0;
          const row = document.createElement("div");
          row.className = "fac-row";
          row.innerHTML = `
            <div class="fac-row-main">
              <span class="fac-row-title">${item.name} — ¥${item.price.toLocaleString()} <small>(In Bag: ${owned})</small></span>
              <span class="fac-row-sub">${item.desc}</span>
            </div>
            <div class="fac-row-actions">
              <button type="button" class="fac-mini-btn" data-qty="1">Buy ×1</button>
              <button type="button" class="fac-mini-btn secondary" data-qty="5">×5</button>
            </div>
          `;
          row.querySelector('[data-qty="1"]').onclick = () =>
            buyMartItem(itemId, 1);
          row.querySelector('[data-qty="5"]').onclick = () =>
            buyMartItem(itemId, 5);
          body.appendChild(row);
        });
      } else if (state.martActiveTab === "sell") {
        const bagEntries = Object.entries(state.bag).filter(([, c]) => c > 0);
        if (bagEntries.length === 0) {
          body.innerHTML = `<div class="fac-row"><span class="fac-row-sub">Your BAG is currently empty.</span></div>`;
        } else {
          bagEntries.forEach(([itemId, count]) => {
            const item = ITEM_CATALOG[itemId] || {
              name: itemId,
              price: 200,
              desc: "",
            };
            const sellVal = Math.max(50, Math.floor(item.price / 2));
            const row = document.createElement("div");
            row.className = "fac-row";
            row.innerHTML = `
              <div class="fac-row-main">
                <span class="fac-row-title">${item.name} ×${count}</span>
                <span class="fac-row-sub">Sell value: ¥${sellVal.toLocaleString()} each</span>
              </div>
              <div class="fac-row-actions">
                <button type="button" class="fac-mini-btn">Sell ×1</button>
              </div>
            `;
            row.querySelector("button").onclick = () => sellBagItem(itemId, 1);
            body.appendChild(row);
          });
        }
      } else if (state.martActiveTab === "bag") {
        const bagEntries = Object.entries(state.bag).filter(([, c]) => c > 0);
        if (bagEntries.length === 0) {
          body.innerHTML = `<div class="fac-row"><span class="fac-row-sub">Your BAG is empty.</span></div>`;
        } else {
          bagEntries.forEach(([itemId, count]) => {
            const item = ITEM_CATALOG[itemId] || {
              name: itemId,
              desc: "",
            };
            const row = document.createElement("div");
            row.className = "fac-row";
            row.innerHTML = `
              <div class="fac-row-main">
                <span class="fac-row-title">${item.name} ×${count}</span>
                <span class="fac-row-sub">${item.desc}</span>
              </div>
              <div class="fac-row-actions">
                <button type="button" class="fac-mini-btn">Use on ${
                  state.party[0]?.nickname || "Lead"
                }</button>
              </div>
            `;
            row.querySelector("button").onclick = () =>
              useBagItemOnParty(itemId, 0);
            body.appendChild(row);
          });
        }
      }
    }
  }
}

export function openPikachuInteraction() {
  const opp = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  state.pikachu.dir = opp[state.player.dir] || "DOWN";
  const mood = PIKACHU_MOODS[state.pikachu.moodIndex % PIKACHU_MOODS.length];
  state.pikachu.moodIndex++;
  triggerEmote(mood.emote, 2400);
  audio.playSfx("pika");
  openDialogue(mood.title, mood.text, { pikachuMood: mood });
}

function openElevatorMenu(elevatorConst) {
  audio.playSfx("blip");
  const floors = ELEVATOR_FLOORS[elevatorConst];
  state.dialogue = {
    title: `${state.currentZone.displayName} — Select Floor`,
    pages: ["Which floor would you like to go to?"],
    pageIndex: 0,
    elevatorConst,
    elevatorOptions: floors,
  };
  renderDialogueModal();
}

export function openDialogue(title, rawText, extra = {}) {
  const pages = String(rawText || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (pages.length === 0) pages.push("...");
  state.dialogue = {
    title,
    pages,
    pageIndex: 0,
    ...extra,
  };
  renderDialogueModal();
}

function advanceDialogue() {
  if (!state.dialogue) return;
  if (state.dialogue.pageIndex + 1 < state.dialogue.pages.length) {
    state.dialogue.pageIndex++;
    audio.playSfx("blip");
    renderDialogueModal();
  } else {
    const onFinish = state.dialogue.onFinish;
    state.dialogue = null;
    renderDialogueModal();
    if (typeof onFinish === "function") {
      onFinish();
    }
  }
}

// ============================================================================
// AUTHENTIC GEN 1 WILD & TRAINER BATTLE ENGINE
// ============================================================================

function ensureHealthyPlayerLead() {
  let idx = state.party.findIndex((m) => m.hp > 0);
  if (idx === -1) {
    // Emergency revive lead so player is never soft-locked
    state.party[0].hp = state.party[0].maxHp;
    idx = 0;
  }
  return idx;
}

export function triggerWildEncounter(poolOrEntry) {
  let level = 5;
  let species = "PIDGEY";
  if (Array.isArray(poolOrEntry) && Array.isArray(poolOrEntry[0])) {
    const pick = poolOrEntry[Math.floor(Math.random() * poolOrEntry.length)];
    level = pick[0];
    species = pick[1];
  } else if (Array.isArray(poolOrEntry)) {
    level = poolOrEntry[0];
    species = poolOrEntry[1];
  }
  const foeMon = engine.createPokemonInstance(species, level);
  state.pokedexSeen.add(foeMon.species);
  const playerIdx = ensureHealthyPlayerLead();

  state.battle = {
    isWild: true,
    trainerName: null,
    trainerSpriteObj: null,
    npcRef: null,
    enemyParty: [foeMon],
    enemyIndex: 0,
    playerIndex: playerIdx,
    subMenu: null, // null | "bag" | "pkmn"
    log: `Wild ${foeMon.nickname} (Lv.${foeMon.level}) appeared in ${state.currentZone.displayName}!`,
    endBattleText: null,
    finished: false,
  };
  audio.playSfx("thunder");
  renderBattleModal();
}

export function triggerTrainerBattle(npcOrProfile) {
  const prof = npcOrProfile?.battle || npcOrProfile;
  if (!prof || !Array.isArray(prof.party) || prof.party.length === 0) return;

  const enemyParty = prof.party.map(([lv, sp]) => {
    const m = engine.createPokemonInstance(sp, lv);
    state.pokedexSeen.add(m.species);
    return m;
  });

  const playerIdx = ensureHealthyPlayerLead();
  const trainerSpriteObj = prof.isWild
    ? null
    : engine.getTrainerSpriteObj(prof, npcOrProfile?.sprite);

  state.battle = {
    isWild: Boolean(prof.isWild),
    trainerName: prof.trainerName || "PKMN TRAINER",
    trainerSpriteObj,
    npcRef: npcOrProfile?.battle ? npcOrProfile : null,
    enemyParty,
    enemyIndex: 0,
    playerIndex: playerIdx,
    subMenu: null,
    log: prof.isWild
      ? `${enemyParty[0].nickname} (Lv.${enemyParty[0].level}) attacked!`
      : `${prof.trainerName} wants to battle! Sent out ${enemyParty[0].nickname} (Lv.${enemyParty[0].level})!`,
    endBattleText: prof.endBattleText || "What an incredible battle!",
    finished: false,
  };
  audio.playSfx("thunder");
  renderBattleModal();
}

function calcGen1Damage(attacker, defender, move) {
  if (!move.power || move.power <= 0) {
    return { damage: 0, eff: 1, crit: false };
  }
  const eff = engine.getTypeEffectiveness(move.type, defender.types);
  if (eff === 0) {
    return { damage: 0, eff: 0, crit: false };
  }
  const crit = Math.random() < Math.min(0.25, (attacker.spd || 50) / 512);
  const lv = crit ? attacker.level * 2 : attacker.level;
  const specialTypes = new Set([
    "FIRE",
    "WATER",
    "GRASS",
    "ELECTRIC",
    "ICE",
    "PSYCHIC",
    "DRAGON",
  ]);
  const isSpec = specialTypes.has(move.type);
  const atkStat = Math.max(1, isSpec ? attacker.spc : attacker.atk);
  const defStat = Math.max(1, isSpec ? defender.spc : defender.def);
  const stab = attacker.types.includes(move.type) ? 1.5 : 1.0;
  const rand = 0.85 + Math.random() * 0.15;

  const baseDmg =
    (((2 * lv) / 5 + 2) * move.power * (atkStat / defStat)) / 50 + 2;
  const finalDmg = Math.max(1, Math.floor(baseDmg * stab * eff * rand));
  return { damage: finalDmg, eff, crit };
}

function executePlayerMoveInBattle(moveIndex) {
  const b = state.battle;
  if (!b || b.finished) return;
  const playerMon = state.party[b.playerIndex];
  const foeMon = b.enemyParty[b.enemyIndex];
  if (!playerMon || !foeMon) return;

  const mv = playerMon.moves[moveIndex] || playerMon.moves[0];
  if (mv.pp > 0) mv.pp--;

  audio.playSfx("thunder");

  // Status/non-damaging move handling
  let msg = `${playerMon.nickname} used ${mv.name}!`;
  if (!mv.power || mv.power <= 0) {
    const statBonus = Math.max(2, Math.floor(playerMon.level * 0.35));
    playerMon.atk += statBonus;
    foeMon.hp = Math.max(0, foeMon.hp - statBonus);
    msg += ` Foe ${foeMon.nickname} was disrupted (-${statBonus} HP)!`;
  } else {
    const { damage, eff, crit } = calcGen1Damage(playerMon, foeMon, mv);
    foeMon.hp = Math.max(0, foeMon.hp - damage);
    if (eff === 0) msg += " It had no effect!";
    else {
      if (crit) msg += " Critical hit!";
      if (eff > 1) msg += " It's super effective!";
      else if (eff < 1) msg += " It's not very effective...";
      msg += ` (-${damage} HP)`;
    }
  }

  // Check if Foe Pokémon fainted
  if (foeMon.hp <= 0) {
    const expGain = Math.max(12, Math.floor((foeMon.baseExp * foeMon.level) / 5));
    playerMon.exp += expGain;
    msg += ` Foe ${foeMon.nickname} fainted! (+${expGain} EXP)`;

    // Check level-up
    const nextLvExp = Math.pow(playerMon.level + 1, 3);
    if (playerMon.exp >= nextLvExp && playerMon.level < 100) {
      const nextInst = engine.createPokemonInstance(
        playerMon.species,
        playerMon.level + 1
      );
      playerMon.level = nextInst.level;
      playerMon.maxHp = nextInst.maxHp;
      playerMon.hp = nextInst.maxHp;
      playerMon.atk = nextInst.atk;
      playerMon.def = nextInst.def;
      playerMon.spd = nextInst.spd;
      playerMon.spc = nextInst.spc;
      msg += ` ${playerMon.nickname} grew to Lv.${playerMon.level}!`;
    }

    // Check if Trainer has another Pokémon
    if (b.enemyIndex + 1 < b.enemyParty.length) {
      b.enemyIndex++;
      const nextFoe = b.enemyParty[b.enemyIndex];
      state.pokedexSeen.add(nextFoe.species);
      b.log = `${msg} ${b.trainerName} sent out ${nextFoe.nickname} (Lv.${nextFoe.level})!`;
      updateHudTelemetry();
      renderBattleModal();
      return;
    }

    // Battle won!
    b.finished = true;
    audio.playSfx("victory");
    if (!b.isWild) {
      const prize = Math.max(200, foeMon.level * 45);
      state.money += prize;
      if (b.npcRef) b.npcRef.defeated = true;
      b.log = `${msg} Defeated ${b.trainerName}! "${b.endBattleText}" Got ¥${prize.toLocaleString()} for winning!`;
    } else {
      if (b.npcRef && b.npcRef.sprite === "SPRITE_SNORLAX") {
        b.npcRef.collected = true;
      }
      b.log = `${msg} Wild ${foeMon.nickname} was defeated!`;
    }
    updateHudTelemetry();
    renderBattleModal();
    return;
  }

  // Enemy counter-attack
  enemyCounterTurn(msg);
}

function enemyCounterTurn(prefixMsg) {
  const b = state.battle;
  if (!b || b.finished) return;
  const playerMon = state.party[b.playerIndex];
  const foeMon = b.enemyParty[b.enemyIndex];
  const foeMove =
    foeMon.moves[Math.floor(Math.random() * foeMon.moves.length)] ||
    engine.getMove("TACKLE");
  const { damage, eff } = calcGen1Damage(foeMon, playerMon, foeMove);
  const actualDmg = Math.max(1, damage || Math.floor(foeMon.level * 0.35));
  playerMon.hp = Math.max(0, playerMon.hp - actualDmg);

  let enemyMsg = ` Foe ${foeMon.nickname} used ${foeMove.name} (-${actualDmg} HP)!`;
  if (eff > 1) enemyMsg += " Super effective!";

  if (playerMon.hp <= 0) {
    const nextAlive = state.party.findIndex((m) => m.hp > 0);
    if (nextAlive !== -1) {
      b.playerIndex = nextAlive;
      enemyMsg += ` ${playerMon.nickname} fainted! Go, ${state.party[nextAlive].nickname}!`;
    } else {
      // Heal party so player can continue exploring
      for (const m of state.party) m.hp = m.maxHp;
      b.finished = true;
      enemyMsg += ` All POKéMON fainted! Rushed to POKéMON CENTER and restored party!`;
    }
  }

  b.log = `${prefixMsg}${enemyMsg}`;
  updateHudTelemetry();
  renderBattleModal();
}

function throwBallInBattle(ballId = "POKE_BALL") {
  const b = state.battle;
  if (!b || b.finished) return;
  if (!b.isWild) {
    audio.playSfx("bump");
    b.log =
      "The trainer blocked the BALL! Don't be a thief! (Only wild POKéMON can be caught!)";
    renderBattleModal();
    return;
  }

  const ball = ITEM_CATALOG[ballId] || ITEM_CATALOG.POKE_BALL;
  if (state.bag[ballId] && state.bag[ballId] > 0) {
    state.bag[ballId]--;
    if (state.bag[ballId] <= 0) delete state.bag[ballId];
  }

  const foeMon = b.enemyParty[b.enemyIndex];
  audio.playSfx("warp");

  const hpFactor = (3 * foeMon.maxHp - 2 * foeMon.hp) / (3 * foeMon.maxHp);
  const catchChance =
    ball.catchMult >= 255
      ? 1.0
      : Math.min(0.95, Math.max(0.35, hpFactor * 0.65 * (ball.catchMult || 1)));

  if (Math.random() <= catchChance) {
    foeMon.hp = foeMon.maxHp;
    state.pokedexOwned.add(foeMon.species);
    state.pokedexSeen.add(foeMon.species);
    let destStr = "";
    if (state.party.length < 6) {
      state.party.push(foeMon);
      destStr = `Added ${foeMon.nickname} to your PARTY (${state.party.length}/6)!`;
    } else {
      const box = state.pcBoxes[state.currentBoxIndex];
      box.list.push(foeMon);
      destStr = `PARTY is full (6/6) — ${foeMon.nickname} was transferred to ${box.name} in BILL'S PC!`;
    }
    if (b.npcRef && b.npcRef.sprite === "SPRITE_SNORLAX") {
      b.npcRef.collected = true;
    }
    b.finished = true;
    audio.playSfx("victory");
    b.log = `RED used ${ball.name}! Gotcha! ${foeMon.nickname} (Lv.${foeMon.level}) was caught! ${destStr}`;
    updateHudTelemetry();
    renderBattleModal();
  } else {
    b.subMenu = null;
    enemyCounterTurn(`RED threw a ${ball.name}! Shoot! It was so close too!`);
  }
}

// Render functions for Modals & Inspector UI
function renderDialogueModal() {
  const modal = document.getElementById("dialogue-overlay");
  if (!modal) return;
  if (!state.dialogue) {
    modal.classList.add("hidden");
    return;
  }
  modal.classList.remove("hidden");
  document.getElementById("dialogue-title").textContent = state.dialogue.title;
  document.getElementById("dialogue-text").textContent =
    state.dialogue.pages[state.dialogue.pageIndex];

  const pikaBox = document.getElementById("dialogue-pika-box");
  if (state.dialogue.pikachuMood) {
    pikaBox.classList.remove("hidden");
    const faceCanvas = document.getElementById("dialogue-pika-canvas");
    const frameKey =
      state.dialogue.pikachuMood.frames[
        Math.floor(performance.now() / 320) % 2
      ];
    engine.render2BitGraphicToCanvas(
      faceCanvas,
      engine.pikachuFaces[frameKey],
      "PAL_PIKACHU_PORTRAIT"
    );
  } else {
    pikaBox.classList.add("hidden");
  }

  const elevBox = document.getElementById("dialogue-elevator-options");
  if (state.dialogue.elevatorOptions) {
    elevBox.classList.remove("hidden");
    elevBox.innerHTML = "";
    state.dialogue.elevatorOptions.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "gb-floor-btn";
      btn.textContent = opt.label;
      btn.onclick = () => {
        state.selectedElevatorDest[state.dialogue.elevatorConst] = opt;
        audio.playSfx("warp");
        state.dialogue = null;
        renderDialogueModal();
        loadZone(opt.destConst, { warpIndex: opt.warpIndex });
      };
      elevBox.appendChild(btn);
    });
  } else {
    elevBox.classList.add("hidden");
  }

  const extraBox = document.getElementById("dialogue-extra-actions");
  if (extraBox) {
    if (
      Array.isArray(state.dialogue.extraActions) &&
      state.dialogue.extraActions.length > 0
    ) {
      extraBox.classList.remove("hidden");
      extraBox.innerHTML = "";
      state.dialogue.extraActions.forEach((act) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gb-action-chip";
        btn.textContent = act.label;
        btn.onclick = act.onClick;
        extraBox.appendChild(btn);
      });
    } else {
      extraBox.classList.add("hidden");
      extraBox.innerHTML = "";
    }
  }
}

function renderBattleModal() {
  const modal = document.getElementById("battle-overlay");
  if (!modal) return;
  if (!state.battle) {
    modal.classList.add("hidden");
    return;
  }
  modal.classList.remove("hidden");
  const b = state.battle;
  const foeMon = b.enemyParty[b.enemyIndex] || b.enemyParty[0];
  const playerMon = state.party[b.playerIndex] || state.party[0];

  document.getElementById("battle-foe-name").textContent = b.isWild
    ? foeMon.nickname
    : `${foeMon.nickname}`;
  document.getElementById("battle-foe-lv").textContent = `:L${foeMon.level}`;

  const foeBallsEl = document.getElementById("battle-foe-balls");
  if (foeBallsEl) {
    foeBallsEl.textContent = b.enemyParty
      .map((m) => (m.hp > 0 ? "●" : "○"))
      .join("");
  }

  const foePct = Math.max(0, Math.round((foeMon.hp / foeMon.maxHp) * 100));
  const foeBar = document.getElementById("battle-foe-hp-fill");
  foeBar.style.width = `${foePct}%`;
  foeBar.style.background =
    foePct > 50 ? "#22c55e" : foePct > 20 ? "#eab308" : "#ef4444";

  document.getElementById("battle-player-name").textContent =
    playerMon.nickname;
  document.getElementById("battle-player-lv").textContent = `:L${playerMon.level}`;

  const playerBallsEl = document.getElementById("battle-player-balls");
  if (playerBallsEl) {
    playerBallsEl.textContent = state.party
      .map((m) => (m.hp > 0 ? "●" : "○"))
      .join("");
  }

  const playerPct = Math.max(
    0,
    Math.round((playerMon.hp / playerMon.maxHp) * 100)
  );
  const playerBar = document.getElementById("battle-player-hp-fill");
  playerBar.style.width = `${playerPct}%`;
  playerBar.style.background =
    playerPct > 50 ? "#22c55e" : playerPct > 20 ? "#eab308" : "#ef4444";

  document.getElementById(
    "battle-player-hp-nums"
  ).textContent = `${playerMon.hp}/${playerMon.maxHp}`;
  document.getElementById("battle-log-text").textContent = b.log;

  // Draw Trainer Badge Sprite if Trainer battle
  const trainerCanvas = document.getElementById("battle-trainer-canvas");
  if (trainerCanvas) {
    if (!b.isWild && b.trainerSpriteObj) {
      trainerCanvas.classList.remove("hidden");
      engine.render2BitGraphicToCanvas(
        trainerCanvas,
        b.trainerSpriteObj,
        state.currentZone.palette
      );
    } else {
      trainerCanvas.classList.add("hidden");
    }
  }

  // Draw Enemy Pokémon Front Sprite
  const foeCanvas = document.getElementById("battle-foe-canvas");
  const foeSpr =
    engine.pokemonSprites[foeMon.species] || engine.pokemonSprites.PIDGEY;
  engine.render2BitGraphicToCanvas(foeCanvas, foeSpr, state.currentZone.palette);

  // Draw Player Pokémon Back Sprite
  const backCanvas = document.getElementById("battle-player-canvas");
  const backSpr =
    engine.pokemonSprites[`${playerMon.species}_BACK`] ||
    engine.pokemonSprites.PIKACHU_BACK;
  engine.render2BitGraphicToCanvas(
    backCanvas,
    backSpr,
    playerMon.species === "PIKACHU" ? "PAL_YELLOWMON" : state.currentZone.palette
  );

  // Render Sub-Panel (Bag items or Party Switch)
  const subPanel = document.getElementById("battle-sub-panel");
  if (subPanel) {
    if (!b.subMenu || b.finished) {
      subPanel.classList.add("hidden");
      subPanel.innerHTML = "";
    } else if (b.subMenu === "bag") {
      subPanel.classList.remove("hidden");
      subPanel.innerHTML = "";
      const usableIds = [
        "POKE_BALL",
        "GREAT_BALL",
        "ULTRA_BALL",
        "MASTER_BALL",
        "POTION",
        "SUPER_POTION",
        "HYPER_POTION",
        "MAX_POTION",
        "FULL_RESTORE",
      ].filter((id) => (state.bag[id] || 0) > 0);
      if (usableIds.length === 0) {
        subPanel.innerHTML = `<span class="fac-row-sub">No usable battle items in BAG!</span>`;
      } else {
        usableIds.forEach((id) => {
          const item = ITEM_CATALOG[id];
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "fac-mini-btn";
          btn.textContent = `${item.name} ×${state.bag[id]}`;
          btn.onclick = () => {
            if (item.kind === "ball") {
              throwBallInBattle(id);
            } else {
              useBagItemOnParty(id, b.playerIndex);
              b.subMenu = null;
              b.log = `RED used ${item.name} on ${playerMon.nickname}!`;
              renderBattleModal();
            }
          };
          subPanel.appendChild(btn);
        });
      }
    } else if (b.subMenu === "pkmn") {
      subPanel.classList.remove("hidden");
      subPanel.innerHTML = "";
      state.party.forEach((m, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `fac-mini-btn ${
          idx === b.playerIndex ? "" : "secondary"
        }`;
        btn.textContent = `${m.nickname} :L${m.level} (${m.hp}/${m.maxHp})`;
        btn.onclick = () => {
          if (m.hp <= 0) return;
          b.playerIndex = idx;
          b.subMenu = null;
          b.log = `Come back! Go, ${m.nickname}!`;
          renderBattleModal();
        };
        subPanel.appendChild(btn);
      });
    }
  }

  // Render Battle Move / Action Buttons
  const grid = document.getElementById("battle-moves-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (b.finished) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "battle-btn";
    closeBtn.style.gridColumn = "1 / -1";
    closeBtn.textContent = "▶ CONTINUE OVERWORLD (SPACE / ENTER)";
    closeBtn.onclick = () => {
      state.battle = null;
      renderBattleModal();
    };
    grid.appendChild(closeBtn);
    return;
  }

  // Show up to 2 signature moves + BAG/BALL + PKMN/RUN so all 4 buttons fit cleanly
  const m0 = playerMon.moves[0] || { name: "TACKLE", type: "NORMAL" };
  const m1 = playerMon.moves[1] || playerMon.moves[0] || { name: "QUICK ATTACK", type: "NORMAL" };

  const btnMove0 = document.createElement("button");
  btnMove0.type = "button";
  btnMove0.className = "battle-btn";
  btnMove0.textContent = `⚔️ ${m0.name}`;
  btnMove0.onclick = () => executePlayerMoveInBattle(0);
  grid.appendChild(btnMove0);

  const btnMove1 = document.createElement("button");
  btnMove1.type = "button";
  btnMove1.className = "battle-btn";
  btnMove1.textContent = `⚡ ${m1.name}`;
  btnMove1.onclick = () => executePlayerMoveInBattle(playerMon.moves[1] ? 1 : 0);
  grid.appendChild(btnMove1);

  const btnBag = document.createElement("button");
  btnBag.type = "button";
  btnBag.className = "battle-btn";
  btnBag.textContent = b.isWild ? "🔴 BALL / BAG" : "🎒 BAG / HEAL";
  btnBag.onclick = () => {
    if (b.isWild && !b.subMenu) {
      // Quick-throw best ball or open bag
      const bestBall =
        (state.bag.ULTRA_BALL && "ULTRA_BALL") ||
        (state.bag.GREAT_BALL && "GREAT_BALL") ||
        (state.bag.POKE_BALL && "POKE_BALL") ||
        "POKE_BALL";
      throwBallInBattle(bestBall);
    } else {
      b.subMenu = b.subMenu === "bag" ? null : "bag";
      renderBattleModal();
    }
  };
  grid.appendChild(btnBag);

  const btnSwitchOrRun = document.createElement("button");
  btnSwitchOrRun.type = "button";
  btnSwitchOrRun.className = "battle-btn";
  btnSwitchOrRun.textContent =
    state.party.length > 1 ? "🔄 PKMN / RUN" : "🏃 RUN / CLOSE";
  btnSwitchOrRun.onclick = () => {
    if (b.subMenu !== "pkmn" && state.party.length > 1) {
      b.subMenu = "pkmn";
      // Also allow closing battle on second click
      renderBattleModal();
    } else {
      state.battle = null;
      renderBattleModal();
    }
  };
  grid.appendChild(btnSwitchOrRun);
}

function getFilteredZones() {
  const q = state.searchQuery.trim().toLowerCase();
  return engine.allZones.filter((z) => {
    if (state.categoryFilter === "canonical220" && !z.isCanonical220) {
      return false;
    }
    if (
      state.categoryFilter === "town" ||
      state.categoryFilter === "route" ||
      state.categoryFilter === "indoor" ||
      state.categoryFilter === "dungeon"
    ) {
      if (!z.isCanonical220 || z.category !== state.categoryFilter) return false;
    }
    if (state.townMapFilterCoords) {
      const [tx, ty] = state.townMapFilterCoords;
      if (z.townMapX !== tx || z.townMapY !== ty) return false;
    }
    if (!q) return true;
    return (
      z.displayName.toLowerCase().includes(q) ||
      z.constName.toLowerCase().includes(q) ||
      z.headerName.toLowerCase().includes(q) ||
      z.regionName.toLowerCase().includes(q) ||
      z.tileset.toLowerCase().includes(q) ||
      z.romHex.toLowerCase().includes(q) ||
      `#${String(z.zoneNumber).padStart(3, "0")}`.includes(q) ||
      String(z.zoneNumber) === q
    );
  });
}

function renderZoneList() {
  const listEl = document.getElementById("zone-list");
  if (!listEl) return;
  const filtered = getFilteredZones();
  const countEl = document.getElementById("zone-filter-count");
  if (countEl) {
    countEl.textContent = `${filtered.length} shown`;
  }

  listEl.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const z of filtered) {
    const item = document.createElement("button");
    item.type = "button";
    const isActive = z.constName === state.currentZone.constName;
    item.className = `zone-item ${isActive ? "active" : ""}`;
    item.dataset.zoneConst = z.constName;

    const catBadge =
      z.category === "town"
        ? "CITY"
        : z.category === "route"
        ? "ROUTE"
        : z.category === "dungeon"
        ? "DUNGEON"
        : "INDOOR";

    item.innerHTML = `
      <span class="zone-num">#${String(z.zoneNumber).padStart(3, "0")}</span>
      <span class="zone-main">
        <span class="zone-title">${z.displayName}</span>
        <span class="zone-meta">${z.constName} • ${z.width}×${z.height} blk (${z.width * 32}×${z.height * 32}px) • ${z.tileset}</span>
      </span>
      <span class="zone-tag tag-${z.category}">${catBadge}</span>
    `;
    item.onclick = () => {
      loadZone(z, { resetParent: true });
    };
    frag.appendChild(item);
  }
  listEl.appendChild(frag);
}

function renderKantoTownMap() {
  const canvas = document.getElementById("kanto-town-map-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cellW = W / 16;
  const cellH = H / 16;

  ctx.fillStyle = "#162436";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 16; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellW, 0);
    ctx.lineTo(i * cellW, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellH);
    ctx.lineTo(W, i * cellH);
    ctx.stroke();
  }

  const coordMap = {};
  for (const z of engine.canonicalZones) {
    const key = `${z.townMapX},${z.townMapY}`;
    if (!coordMap[key]) coordMap[key] = [];
    coordMap[key].push(z);
  }

  for (const [key, zonesAtPoint] of Object.entries(coordMap)) {
    const [gx, gy] = key.split(",").map(Number);
    const hasTown = zonesAtPoint.some((z) => z.category === "town");
    const hasDungeon = zonesAtPoint.some((z) => z.category === "dungeon");
    const px = gx * cellW;
    const py = gy * cellH;

    if (hasTown) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
    } else if (hasDungeon) {
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(px + 3, py + 3, cellW - 6, cellH - 6);
    } else {
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(px + 4, py + 4, cellW - 8, cellH - 8);
    }
  }

  const cur = state.currentZone;
  const cx = cur.townMapX * cellW;
  const cy = cur.townMapY * cellH;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
}

function updateHudTelemetry() {
  const partyEl = document.getElementById("hud-party-summary");
  if (partyEl) {
    const totalHp = state.party.reduce((acc, m) => acc + m.hp, 0);
    const totalMax = state.party.reduce((acc, m) => acc + m.maxHp, 0) || 1;
    const pct = Math.round((totalHp / totalMax) * 100);
    const lead = state.party[0];
    partyEl.textContent = `⚡ Party: ${state.party.length}/6 (${
      lead ? `${lead.nickname} :L${lead.level}` : ""
    } • ${pct}% HP)`;
  }
  const moneyEl = document.getElementById("hud-money");
  if (moneyEl) {
    moneyEl.textContent = `¥${state.money.toLocaleString()}`;
  }
}

function updateCoordinatesUI() {
  const z = state.currentZone;
  const tid = engine.getCollisionTileAtStep(z, state.player.x, state.player.y);
  const posEl = document.getElementById("hud-player-pos");
  if (posEl) {
    posEl.textContent = `Step (${state.player.x}, ${state.player.y}) • Block (${Math.floor(
      state.player.x / 2
    )}, ${Math.floor(state.player.y / 2)}) • Tile $${tid
      .toString(16)
      .toUpperCase()
      .padStart(2, "0")}`;
  }
  updateHudTelemetry();
}

function updateUIForCurrentZone() {
  const z = state.currentZone;
  document.getElementById("active-zone-badge").textContent = `ZONE #${String(
    z.zoneNumber
  ).padStart(3, "0")} / 220`;
  document.getElementById("active-zone-title").textContent = z.displayName;
  document.getElementById("active-zone-subtitle").textContent = `${z.constName} (ROM ${z.romHex}) • ${z.regionName} • ${z.width}×${z.height} Blocks (${z.width * 32}×${z.height * 32} px) • Tileset: ${z.tileset}`;

  document.getElementById("visited-counter").textContent = `${state.visitedZones.size} / 220 Visited`;

  updateCoordinatesUI();
  renderKantoTownMap();

  document.querySelectorAll(".zone-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.zoneConst === z.constName);
  });

  // Update Connections & Warps inspector
  const connBox = document.getElementById("inspector-connections");
  connBox.innerHTML = "";
  const dirs = ["north", "south", "west", "east"];
  let hasConns = false;
  for (const d of dirs) {
    const c = z.connections && z.connections[d];
    if (c) {
      hasConns = true;
      const targetZ = engine.zonesByConst[c.targetConst];
      const btn = document.createElement("button");
      btn.className = "conn-chip";
      btn.innerHTML = `<span class="conn-dir">${d.toUpperCase()}</span> <span>${
        targetZ ? `#${String(targetZ.zoneNumber).padStart(3, "0")} ${targetZ.displayName}` : c.targetConst
      }</span>`;
      btn.onclick = () => loadZone(c.targetConst, { resetParent: true });
      connBox.appendChild(btn);
    }
  }
  if (!hasConns) {
    connBox.innerHTML = `<span class="muted-note">Indoor / self-contained segment (uses Warps)</span>`;
  }

  // Warps
  const warpBox = document.getElementById("inspector-warps");
  warpBox.innerHTML = "";
  if (z.warps.length === 0) {
    warpBox.innerHTML = `<span class="muted-note">No warp events in this segment</span>`;
  } else {
    z.warps.forEach((w, idx) => {
      const resolved = resolveWarpDestination(z, w);
      const targetZ = engine.zonesByConst[resolved.destConst];
      const btn = document.createElement("button");
      btn.className = "warp-chip";
      btn.innerHTML = `<span class="warp-idx">W${idx + 1} (${w.x},${w.y})</span> <span>→ ${
        targetZ
          ? `#${String(targetZ.zoneNumber).padStart(3, "0")} ${targetZ.displayName}`
          : resolved.destConst
      }</span>`;
      btn.onclick = () => {
        audio.playSfx("warp");
        loadZone(resolved.destConst, {
          warpIndex: resolved.destWarpIdx,
          fromOutdoorWarpIndex: idx,
        });
      };
      warpBox.appendChild(btn);
    });
  }

  // Signs, PC Computers & NPCs
  const npcBox = document.getElementById("inspector-entities");
  npcBox.innerHTML = "";

  // If this zone has a Pokémon Center PC or Red's House 2F PC, surface a direct Computer chip!
  if (
    z.tileset === "POKECENTER" ||
    z.constName === "INDIGO_PLATEAU_LOBBY" ||
    z.constName === "REDS_HOUSE_2F"
  ) {
    const pcBtn = document.createElement("button");
    pcBtn.className = "entity-chip";
    pcBtn.textContent =
      z.constName === "REDS_HOUSE_2F"
        ? "💻 RED'S PC (0,1) [Item & Box Storage]"
        : "💻 POKéMON CENTER PC (13,3) [Bill's & Red's Storage]";
    pcBtn.onclick = () =>
      openPokeCenterModal(z.constName === "REDS_HOUSE_2F" ? "redpc" : "bill");
    npcBox.appendChild(pcBtn);
  }

  z.signs.forEach((s, idx) => {
    const btn = document.createElement("button");
    btn.className = "entity-chip sign-chip";
    btn.textContent = `Sign S${idx + 1} (${s.x},${s.y}): "${s.text.slice(0, 42)}${
      s.text.length > 42 ? "…" : ""
    }"`;
    btn.onclick = () => {
      if (
        z.constName === "CELADON_MART_ROOF" &&
        s.text.toUpperCase().includes("VENDING")
      ) {
        openMartModal("buy", "CELADON_MART_ROOF");
        return;
      }
      audio.playSfx("blip");
      openDialogue(`SIGNPOST (${s.x}, ${s.y})`, s.text);
    };
    npcBox.appendChild(btn);
  });

  state.npcs.forEach((npc) => {
    const btn = document.createElement("button");
    btn.className = "entity-chip npc-chip";
    const up = npc.name.toUpperCase();
    const roleTag =
      npc.sprite === "SPRITE_NURSE" || up.includes("NURSE")
        ? " [🏥 Heal & PC]"
        : npc.sprite === "SPRITE_CLERK" || up.includes("CLERK")
        ? " [🛒 Mart Shop]"
        : npc.kind === "trainer"
        ? " [⚔️ Trainer]"
        : npc.kind === "item"
        ? " [🔴 Item]"
        : "";
    btn.textContent = `${npc.name.replace(/_/g, " ")} (${npc.x},${npc.y})${roleTag}${
      !npc.defaultVisible ? " [Event]" : ""
    }`;
    btn.onclick = () => interactWithNpc(npc);
    npcBox.appendChild(btn);
  });

  if (npcBox.children.length === 0) {
    npcBox.innerHTML = `<span class="muted-note">No signs or NPCs in this segment</span>`;
  }

  // Wild Pokémon
  const wildBox = document.getElementById("inspector-wild");
  wildBox.innerHTML = "";
  const allWild = [...(z.wild.grass || []), ...(z.wild.water || [])];
  if (allWild.length === 0) {
    wildBox.innerHTML = `<span class="muted-note">No wild Pokémon encounters in this zone</span>`;
  } else {
    const seen = new Set();
    allWild.forEach(([lv, sp]) => {
      const key = `${sp}:${lv}`;
      if (seen.has(key)) return;
      seen.add(key);
      const btn = document.createElement("button");
      btn.className = "wild-chip";
      btn.textContent = `${sp.replace(/_/g, " ")} Lv.${lv}`;
      btn.onclick = () => triggerWildEncounter([lv, sp]);
      wildBox.appendChild(btn);
    });
  }
}

function renderAllCanvases() {
  const fullCanvas = document.getElementById("full-zone-canvas");
  const gbCanvas = document.getElementById("gb-screen-canvas");

  if (fullCanvas && state.viewMode !== "gb") {
    engine.renderFullZone(fullCanvas, state.currentZone, {
      showBorder: state.showBorder,
      showEntities: state.showEntitiesOnZoneMap,
      showWarps: state.showWarpsOnZoneMap,
      showGrid: state.showGridOnZoneMap,
      showHiddenObjects: state.showHiddenObjects,
      playerState: state.player,
      pikachuState: state.pikachu,
      npcStates: state.npcs,
    });
  }

  if (gbCanvas && state.viewMode !== "zone") {
    engine.renderGameBoyViewport(
      gbCanvas,
      state.currentZone,
      state.player,
      state.pikachu,
      state.npcs,
      state.showHiddenObjects,
      state.activeEmote
    );
  }
}

// 220-Zone Visual Atlas Modal
function openVisualAtlasModal() {
  const modal = document.getElementById("atlas-modal");
  modal.classList.remove("hidden");
  renderAtlasGrid();
}

function renderAtlasGrid() {
  const grid = document.getElementById("atlas-grid");
  const q = (document.getElementById("atlas-search-input")?.value || "")
    .trim()
    .toLowerCase();
  const cat =
    document.getElementById("atlas-cat-select")?.value || "canonical220";

  const zones = engine.allZones.filter((z) => {
    if (cat === "canonical220" && !z.isCanonical220) return false;
    if (
      (cat === "town" ||
        cat === "route" ||
        cat === "indoor" ||
        cat === "dungeon") &&
      (!z.isCanonical220 || z.category !== cat)
    ) {
      return false;
    }
    if (!q) return true;
    return (
      z.displayName.toLowerCase().includes(q) ||
      z.constName.toLowerCase().includes(q) ||
      String(z.zoneNumber) === q
    );
  });

  document.getElementById("atlas-count-label").textContent = `Showing ${zones.length} Loadable Zone Segments`;
  grid.innerHTML = "";

  zones.forEach((z) => {
    const card = document.createElement("div");
    card.className = `atlas-card ${
      z.constName === state.currentZone.constName ? "active" : ""
    }`;
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.className = "atlas-thumb-canvas";
    engine.renderFullZone(thumbCanvas, z, {
      showBorder: false,
      showEntities: false,
      showWarps: false,
      showGrid: false,
    });

    const info = document.createElement("div");
    info.className = "atlas-card-info";
    info.innerHTML = `
      <div class="atlas-card-top">
        <span class="zone-num">#${String(z.zoneNumber).padStart(3, "0")}</span>
        <span class="zone-tag tag-${z.category}">${z.category.toUpperCase()}</span>
      </div>
      <div class="atlas-card-name">${z.displayName}</div>
      <div class="atlas-card-sub">${z.constName} • ${z.width}×${z.height} blk</div>
    `;

    card.appendChild(thumbCanvas);
    card.appendChild(info);
    card.onclick = () => {
      document.getElementById("atlas-modal").classList.add("hidden");
      loadZone(z, { resetParent: true });
    };
    grid.appendChild(card);
  });
}

// Main 60fps loop
let lastAnimTick = 0;
let lastNpcTick = 0;
const heldDirs = new Set();

function gameLoop(now) {
  if (now - lastAnimTick > 280) {
    lastAnimTick = now;
    engine.animCounter = (engine.animCounter + 1) & 7;
    if (state.dialogue && state.dialogue.pikachuMood) {
      renderDialogueModal();
    }
  }

  if (state.player.moveAnim) {
    const anim = state.player.moveAnim;
    const t = Math.min(1, (now - anim.startTime) / anim.duration);
    state.player.renderX = anim.fromX + (anim.toX - anim.fromX) * t;
    let jumpArc = 0;
    if (anim.isLedgeJump) {
      jumpArc = -Math.sin(t * Math.PI) * 0.75;
    }
    state.player.renderY = anim.fromY + (anim.toY - anim.fromY) * t + jumpArc;

    if (state.pikachu.moveAnim) {
      const pa = state.pikachu.moveAnim;
      state.pikachu.renderX = pa.fromX + (pa.toX - pa.fromX) * t;
      state.pikachu.renderY = pa.fromY + (pa.toY - pa.fromY) * t;
    }

    if (t >= 1) {
      state.player.x = anim.toX;
      state.player.y = anim.toY;
      state.player.renderX = anim.toX;
      state.player.renderY = anim.toY;
      state.player.walking = false;
      state.player.moveAnim = null;

      if (state.pikachu.moveAnim) {
        state.pikachu.x = state.pikachu.moveAnim.toX;
        state.pikachu.y = state.pikachu.moveAnim.toY;
        state.pikachu.renderX = state.pikachu.x;
        state.pikachu.renderY = state.pikachu.y;
        state.pikachu.walking = false;
        state.pikachu.moveAnim = null;
      }

      onPlayerStepCompleted();
    }
  } else if (
    heldDirs.size > 0 &&
    !state.dialogue &&
    !state.battle &&
    !state.activeFacility
  ) {
    const lastDir = Array.from(heldDirs).pop();
    attemptStep(lastDir);
  }

  if (
    now - lastNpcTick > 1600 &&
    !state.dialogue &&
    !state.battle &&
    !state.activeFacility
  ) {
    lastNpcTick = now;
    for (const npc of state.npcs) {
      if (npc.movement !== "WALK" || npc.isWalking) continue;
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (Math.random() < 0.35) {
        const dirs =
          npc.dir === "UP_DOWN"
            ? ["UP", "DOWN"]
            : npc.dir === "LEFT_RIGHT"
            ? ["LEFT", "RIGHT"]
            : ["DOWN", "UP", "LEFT", "RIGHT"];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        npc.facing = d;
        const dx = d === "LEFT" ? -1 : d === "RIGHT" ? 1 : 0;
        const dy = d === "UP" ? -1 : d === "DOWN" ? 1 : 0;
        const nx = npc.x + dx;
        const ny = npc.y + dy;
        if (
          Math.abs(nx - npc.originX) <= 2 &&
          Math.abs(ny - npc.originY) <= 2 &&
          nx >= 0 &&
          nx < state.currentZone.width * 2 &&
          ny >= 0 &&
          ny < state.currentZone.height * 2 &&
          !(nx === state.player.x && ny === state.player.y) &&
          !(nx === state.pikachu.x && ny === state.pikachu.y) &&
          engine.isStepPassable(state.currentZone, npc.x, npc.y, nx, ny)
        ) {
          npc.x = nx;
          npc.y = ny;
          npc.renderX = nx;
          npc.renderY = ny;
          npc.stepParity = !npc.stepParity;
        }
      }
    }
  }

  renderAllCanvases();
  requestAnimationFrame(gameLoop);
}

function setupControlsAndEvents() {
  const keyToDir = {
    ArrowUp: "UP",
    KeyW: "UP",
    ArrowDown: "DOWN",
    KeyS: "DOWN",
    ArrowLeft: "LEFT",
    KeyA: "LEFT",
    ArrowRight: "RIGHT",
    KeyD: "RIGHT",
  };

  window.addEventListener("keydown", (e) => {
    if (
      document.activeElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT")
    ) {
      return;
    }
    if (keyToDir[e.code]) {
      e.preventDefault();
      const dir = keyToDir[e.code];
      heldDirs.add(dir);
      attemptStep(dir);
    } else if (
      e.code === "Space" ||
      e.code === "Enter" ||
      e.code === "KeyZ"
    ) {
      e.preventDefault();
      if (state.battle && state.battle.finished) {
        state.battle = null;
        renderBattleModal();
      } else {
        interactInFront();
      }
    } else if (e.code === "KeyX" || e.code === "Escape") {
      if (state.activeFacility) {
        state.activeFacility = null;
        renderFacilityModals();
      } else if (state.dialogue) {
        state.dialogue = null;
        renderDialogueModal();
      } else if (state.battle) {
        state.battle = null;
        renderBattleModal();
      }
    } else if (e.code === "BracketLeft") {
      stepZoneNumber(-1);
    } else if (e.code === "BracketRight") {
      stepZoneNumber(1);
    } else if (e.code === "KeyP") {
      openPikachuInteraction();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (keyToDir[e.code]) {
      heldDirs.delete(keyToDir[e.code]);
    }
  });

  // On-screen D-pad & A/B buttons
  document.querySelectorAll("[data-dpad]").forEach((btn) => {
    const dir = btn.dataset.dpad;
    const startHold = (e) => {
      e.preventDefault();
      heldDirs.add(dir);
      attemptStep(dir);
    };
    const endHold = () => heldDirs.delete(dir);
    btn.addEventListener("mousedown", startHold);
    btn.addEventListener("mouseup", endHold);
    btn.addEventListener("mouseleave", endHold);
    btn.addEventListener("touchstart", startHold, { passive: false });
    btn.addEventListener("touchend", endHold);
  });

  document.getElementById("btn-gb-a")?.addEventListener("click", () => {
    if (state.battle && state.battle.finished) {
      state.battle = null;
      renderBattleModal();
    } else {
      interactInFront();
    }
  });
  document.getElementById("btn-gb-b")?.addEventListener("click", () => {
    if (state.activeFacility) {
      state.activeFacility = null;
      renderFacilityModals();
    } else if (state.dialogue) {
      state.dialogue = null;
      renderDialogueModal();
    } else if (state.battle) {
      state.battle = null;
      renderBattleModal();
    } else {
      state.player.mode = state.player.mode === "bike" ? "walk" : "bike";
    }
  });
  document.getElementById("btn-gb-start")?.addEventListener("click", () => {
    openVisualAtlasModal();
  });
  document.getElementById("btn-gb-select")?.addEventListener("click", () => {
    openPikachuInteraction();
  });

  // Click on Full Zone Canvas to teleport / walk, trigger warp, or open PC / NPC!
  const fullCanvas = document.getElementById("full-zone-canvas");
  fullCanvas?.addEventListener("click", (e) => {
    const rect = fullCanvas.getBoundingClientRect();
    const scaleX = fullCanvas.width / rect.width;
    const scaleY = fullCanvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const borderOffset = state.showBorder ? 32 : 0;
    const stepX = Math.floor((px - borderOffset) / 16);
    const stepY = Math.floor((py - borderOffset) / 16);
    const z = state.currentZone;
    if (stepX < 0 || stepX >= z.width * 2 || stepY < 0 || stepY >= z.height * 2) {
      return;
    }
    // Check if clicked on a Pokémon Center PC or Red's House 2F PC
    if (isComputerTileAtStep(z, stepX, stepY)) {
      openPokeCenterModal(z.constName === "REDS_HOUSE_2F" ? "redpc" : "bill");
      return;
    }
    // Check if clicked on an NPC
    for (const npc of state.npcs) {
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (npc.collected) continue;
      if (npc.x === stepX && npc.y === stepY) {
        interactWithNpc(npc);
        return;
      }
    }
    // Check if clicked on a Warp
    const wHit = checkWarpAtStep(z, stepX, stepY);
    if (wHit) {
      const resolved = resolveWarpDestination(z, wHit.warp);
      audio.playSfx("warp");
      loadZone(resolved.destConst, {
        warpIndex: resolved.destWarpIdx,
        fromOutdoorWarpIndex: wHit.warpIdx,
      });
      return;
    }
    // Check if clicked on a Sign
    for (const s of z.signs) {
      if (s.x === stepX && s.y === stepY) {
        if (
          z.constName === "CELADON_MART_ROOF" &&
          s.text.toUpperCase().includes("VENDING")
        ) {
          openMartModal("buy", "CELADON_MART_ROOF");
          return;
        }
        audio.playSfx("blip");
        openDialogue(`SIGNPOST (${s.x}, ${s.y})`, s.text);
        return;
      }
    }
    // Otherwise move Red + Pikachu there
    state.player.x = stepX;
    state.player.y = stepY;
    state.player.renderX = stepX;
    state.player.renderY = stepY;
    state.pikachu.x = Math.max(0, stepX - 1);
    state.pikachu.y = stepY;
    state.pikachu.renderX = state.pikachu.x;
    state.pikachu.renderY = state.pikachu.y;
    updateCoordinatesUI();
  });

  // Click on Kanto Town Map canvas
  const tmCanvas = document.getElementById("kanto-town-map-canvas");
  tmCanvas?.addEventListener("click", (e) => {
    const rect = tmCanvas.getBoundingClientRect();
    const gx = Math.floor(((e.clientX - rect.left) / rect.width) * 16);
    const gy = Math.floor(((e.clientY - rect.top) / rect.height) * 16);
    const matches = engine.canonicalZones.filter(
      (z) => z.townMapX === gx && z.townMapY === gy
    );
    if (matches.length > 0) {
      loadZone(matches[0], { resetParent: true });
    }
  });

  // Top bar & Toolbar buttons
  document.querySelectorAll("[data-view-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.viewMode = btn.dataset.viewMode;
      document.querySelectorAll("[data-view-mode]").forEach((b) => {
        b.classList.toggle("active", b.dataset.viewMode === state.viewMode);
      });
      const stage = document.getElementById("main-stage");
      stage.dataset.viewMode = state.viewMode;
      renderAllCanvases();
    });
  });

  document.getElementById("palette-select")?.addEventListener("change", (e) => {
    engine.paletteMode = e.target.value;
    renderAllCanvases();
  });

  document.getElementById("btn-prev-zone")?.addEventListener("click", () => {
    stepZoneNumber(-1);
  });
  document.getElementById("btn-next-zone")?.addEventListener("click", () => {
    stepZoneNumber(1);
  });

  document.getElementById("btn-toggle-entities")?.addEventListener("click", (e) => {
    state.showEntitiesOnZoneMap = !state.showEntitiesOnZoneMap;
    e.currentTarget.classList.toggle("active", state.showEntitiesOnZoneMap);
  });
  document.getElementById("btn-toggle-warps")?.addEventListener("click", (e) => {
    state.showWarpsOnZoneMap = !state.showWarpsOnZoneMap;
    e.currentTarget.classList.toggle("active", state.showWarpsOnZoneMap);
  });
  document.getElementById("btn-toggle-grid")?.addEventListener("click", (e) => {
    state.showGridOnZoneMap = !state.showGridOnZoneMap;
    e.currentTarget.classList.toggle("active", state.showGridOnZoneMap);
  });
  document.getElementById("btn-toggle-border")?.addEventListener("click", (e) => {
    state.showBorder = !state.showBorder;
    e.currentTarget.classList.toggle("active", state.showBorder);
  });
  document.getElementById("btn-toggle-bike")?.addEventListener("click", (e) => {
    state.player.mode = state.player.mode === "bike" ? "walk" : "bike";
    e.currentTarget.classList.toggle("active", state.player.mode === "bike");
  });
  document.getElementById("btn-check-pikachu")?.addEventListener("click", () => {
    openPikachuInteraction();
  });

  // Facility Toolbar & HUD Pill Buttons
  document.getElementById("btn-open-pokecenter")?.addEventListener("click", () => {
    openPokeCenterModal("heal");
  });
  document.getElementById("btn-open-mart")?.addEventListener("click", () => {
    openMartModal("buy", state.currentZone.constName);
  });
  document.getElementById("btn-open-party")?.addEventListener("click", () => {
    openPokeCenterModal("bill");
  });
  document.getElementById("hud-party-summary")?.addEventListener("click", () => {
    openPokeCenterModal("bill");
  });
  document.getElementById("hud-money")?.addEventListener("click", () => {
    openMartModal("buy", state.currentZone.constName);
  });

  // Facility Modal Tabs & Close Buttons
  document.getElementById("pokecenter-close-btn")?.addEventListener("click", () => {
    state.activeFacility = null;
    renderFacilityModals();
  });
  document.querySelectorAll("[data-pc-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openPokeCenterModal(btn.dataset.pcTab);
    });
  });

  document.getElementById("mart-close-btn")?.addEventListener("click", () => {
    state.activeFacility = null;
    renderFacilityModals();
  });
  document.querySelectorAll("[data-mart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.martActiveTab = btn.dataset.martTab;
      renderFacilityModals();
    });
  });

  document.getElementById("btn-audio-toggle")?.addEventListener("click", (e) => {
    const on = audio.toggle();
    e.currentTarget.textContent = on ? "🔊 BGM: ON" : "🔇 BGM: OFF";
    e.currentTarget.classList.toggle("active", on);
  });

  // Zone Browser Filters & Search
  document.querySelectorAll("[data-cat-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.categoryFilter = btn.dataset.catFilter;
      state.townMapFilterCoords = null;
      document.querySelectorAll("[data-cat-filter]").forEach((b) => {
        b.classList.toggle("active", b.dataset.catFilter === state.categoryFilter);
      });
      renderZoneList();
    });
  });

  document.getElementById("zone-search-input")?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderZoneList();
  });

  // Dialogue buttons
  document.getElementById("dialogue-next-btn")?.addEventListener("click", () => {
    advanceDialogue();
  });
  document.getElementById("dialogue-close-btn")?.addEventListener("click", () => {
    state.dialogue = null;
    renderDialogueModal();
  });

  // Visual Atlas modal
  document.getElementById("btn-open-atlas")?.addEventListener("click", () => {
    openVisualAtlasModal();
  });
  document.getElementById("btn-close-atlas")?.addEventListener("click", () => {
    document.getElementById("atlas-modal").classList.add("hidden");
  });
  document.getElementById("atlas-search-input")?.addEventListener("input", () => {
    renderAtlasGrid();
  });
  document.getElementById("atlas-cat-select")?.addEventListener("change", () => {
    renderAtlasGrid();
  });
}

function stepZoneNumber(delta) {
  const maxZone = state.categoryFilter === "all224" ? 224 : 220;
  let nextNum = state.currentZone.zoneNumber + delta;
  if (nextNum < 1) nextNum = maxZone;
  if (nextNum > maxZone) nextNum = 1;
  loadZone(nextNum, { resetParent: true });
}

// Expose global API for programmatic inspection & testing
window.POKEYELLOW = {
  engine,
  state,
  zones: engine.canonicalZones, // Exact 220 unique loadable Kanto zone segments
  allHeaders: engine.allZones, // All 224 ROM map headers
  ITEM_CATALOG,
  MART_STOCKS,
  loadZone,
  interactInFront,
  interactWithNpc,
  openPikachuInteraction,
  openPokeCenterModal,
  healPartyAtPokeCenter,
  depositPartyPokemonToPc,
  withdrawPokemonFromPc,
  depositItemToPc,
  withdrawItemFromPc,
  openMartModal,
  buyMartItem,
  sellBagItem,
  useBagItemOnParty,
  triggerWildEncounter,
  triggerTrainerBattle,
};

window.addEventListener("DOMContentLoaded", () => {
  setupControlsAndEvents();
  renderZoneList();
  loadZone("PALLET_TOWN");
  requestAnimationFrame(gameLoop);
});
