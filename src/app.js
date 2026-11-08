import { POKEYELLOW_DATA } from "./data/pokeyellow-data.js";
import { PokeYellowEngine } from "./engine.js";
import { GameBoyAudio } from "./audio.js";

const engine = new PokeYellowEngine(POKEYELLOW_DATA);
const audio = new GameBoyAudio(POKEYELLOW_DATA.music);

// State
const state = {
  currentZone: engine.zonesByConst.PALLET_TOWN,
  lastOutdoorMap: { mapConst: "PALLET_TOWN", warpIndex: 0 },
  viewMode: "gb", // Default to "gb" so LIVE PLAYABLE OVERWORLD (160x144 NATIVE GB) is the only visible screen when playing!
  showBorder: false,
  showEntitiesOnZoneMap: false, // Default false so the Full Zone Map matches the clean Pallet Town reference image 1:1 on load!
  showWarpsOnZoneMap: false,
  showGridOnZoneMap: false,
  showHiddenObjects: false,
  noClip: false,
  autoSurf: false, // Surfing requires explicitly using HM03 SURF (or a party Pokémon's SURF move)
  strengthActive: false, // Enabled in the current zone by using HM04 STRENGTH
  wildEncountersEnabled: true,
  zoneZoom: "fit", // "fit" | 1 | 2 | 3
  categoryFilter: "canonical220", // "canonical220" | "town" | "route" | "indoor" | "dungeon" | "all224"
  searchQuery: "",
  townMapFilterCoords: null,
  visitedZones: new Set(["PALLET_TOWN"]),
  seenPokemon: new Set(),
  caughtPokemon: new Set(),
  defeatedTrainers: new Set(),
  events: {
    oakRescuedInGrass: false, // EVENT_FOLLOWED_OAK_INTO_LAB (scripts/PalletTown.asm)
    gotStarterPikachu: false, // EVENT_GOT_STARTER (scripts/OaksLab.asm:1033)
    battledRivalInLab: false, // EVENT_BATTLED_RIVAL_IN_OAKS_LAB (scripts/OaksLab.asm)
    enteredBluesHouse: false, // EVENT_ENTERED_BLUES_HOUSE (scripts/BluesHouse.asm:14)
    gotTownMap: false, // EVENT_GOT_TOWN_MAP (scripts/BluesHouse.asm:47)
    daisyWalking: false, // EVENT_DAISY_WALKING (scripts/PalletTown.asm:208)
    gotPotionSample: false, // EVENT_GOT_POTION_SAMPLE (scripts/Route1.asm:24)
    gotOaksParcel: false, // EVENT_GOT_OAKS_PARCEL (scripts/ViridianMart.asm:34)
    gotPokedex: false, // EVENT_GOT_POKEDEX (scripts/OaksLab.asm:549)
    seenOldManTutorial: false, //Viridian City Old Man Catching Tutorial (scripts/ViridianCity.asm)
    helpedBill: false, // EVENT_HELPED_BILL_AT_CAPE (scripts/BillsHouse.asm)
    rescuedMrFuji: false, // EVENT_RESCUED_MR_FUJI (scripts/PokemonTower7F.asm)
    wokeRoute12Snorlax: false, // EVENT_FIGHT_ROUTE12_SNORLAX (scripts/Route12.asm)
    wokeRoute16Snorlax: false, // EVENT_FIGHT_ROUTE16_SNORLAX (scripts/Route16.asm)
  },
  party: [],
  bag: [], // Player starts with 0 items; items and HMs are acquired in-game!
  player: {
    x: 5,
    y: 6,
    renderX: 5,
    renderY: 6,
    dir: "DOWN",
    walking: false,
    stepParity: false,
    mode: "walk", // "walk" (wWalkBikeSurfState=0) | "bike" (1) | "surf" (2)
    surfSprite: "seel", // "seel" (SeelSprite) or "surfing_pikachu" (SurfingPikachuSprite if Pikachu knows SURF)
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
    visible: false, // Appears after Prof. Oak gives Red starter Pikachu in Oak's Lab!
    spawnDelayed: false, // PIKACHU_SPAWN_DELAYED when stepping from water onto land
    friendship: 90, // Initial friendship level in Pokémon Yellow ($5a = 90)
    mood: 128, // $80 neutral mood (engine/movie/oak_speech/init_player_data.asm:18)
    stepCounter: 0,
    moodIndex: 0,
  },
  activeEmote: null,
  emoteTimer: null,
  npcs: [],
  dialogue: null, // { title, pages: [], pageIndex: 0, pikachuMood: null, elevatorOptions: null }
  battle: null, // { species, level, hp, maxHp, playerHp, playerMaxHp, log, caught, finished }
  startMenu: {
    open: false,
    cursor: 0, // Saved menu item index (wBattleAndStartSavedMenuItem: 0..6)
    subView: null, // null | "POKEDEX" | "POKEMON" | "ITEM" | "RED" | "SAVE" | "OPTION"
    subCursor: 0,
    selectedDexSpecies: null,
  },
  selectedElevatorDest: {},
};

// Authentic 7-tier Pikachu Happiness Lookup Table (engine/pikachu/pikachu_pic_animation.asm:38-89)
const PIKACHU_HAPPINESS_TIERS = [
  {
    maxFriendship: 50,
    frames: ["pikachu_surprised_1", "pikachu_surprised_2"],
    emote: "bolt",
    title: "PIKACHU's Mood: Wary ⚡",
    text: "PIKACHU: Pika...?\n\nPIKACHU is still cautious and unsure about traveling with you.",
  },
  {
    maxFriendship: 100,
    frames: ["pikachu_smile_1", "pikachu_smile_2"],
    emote: "question",
    title: "PIKACHU's Mood: Curious ?",
    text: "PIKACHU: Pika-pi?\n\nPIKACHU is watching your lead with growing curiosity.",
  },
  {
    maxFriendship: 130,
    frames: ["pikachu_happy_1", "pikachu_happy_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Warming Up ♪",
    text: "PIKACHU: Pika! ♪\n\nPIKACHU is starting to warm up to you!",
  },
  {
    maxFriendship: 160,
    frames: ["pikachu_wink_1", "pikachu_wink_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Friendly ★",
    text: "PIKACHU: Pika-pika! ★\n\nPIKACHU gave you a cheerful wink!",
  },
  {
    maxFriendship: 200,
    frames: ["pikachu_excited_1", "pikachu_excited_2"],
    emote: "happy",
    title: "PIKACHU's Mood: Excited ♪",
    text: "PIKACHU: Pi-pika! ♪\n\nPIKACHU is hopping around energetically and ready for adventure!",
  },
  {
    maxFriendship: 250,
    frames: ["pikachu_heart_1", "pikachu_heart_2"],
    emote: "heart",
    title: "PIKACHU's Mood: Adoring ♥",
    text: "PIKACHU: Pika-pii! ♥\n\nPIKACHU is beaming with happiness and nuzzling close to RED!",
  },
  {
    maxFriendship: 255,
    frames: ["pikachu_2_hearts_1", "pikachu_2_hearts_2"],
    emote: "heart",
    title: "PIKACHU's Mood: Overjoyed ♥♥",
    text: "PIKACHU: Pikachuuu! ♥♥\n\nPIKACHU adores you with all its heart!",
  },
];

// HappinessChangeTable (engine/events/pikachu_happiness.asm:90-104)
const HAPPINESS_DELTAS = {
  LEVELUP: [5, 3, 2],
  USEDITEM: [5, 3, 2],
  USEDXITEM: [1, 1, 0],
  GYMLEADER: [3, 2, 1],
  USEDTMHM: [1, 1, 0],
  WALKING: [2, 1, 1],
  DEPOSITED: [-3, -3, -5],
  FAINTED: [-1, -1, -1],
};

export function modifyPikachuHappiness(action) {
  const row = HAPPINESS_DELTAS[action];
  if (!row) return state.pikachu.friendship;
  const f = state.pikachu.friendship;
  const tier = f < 100 ? 0 : f < 200 ? 1 : 2;
  const delta = row[tier];
  state.pikachu.friendship = Math.max(0, Math.min(255, f + delta));
  return state.pikachu.friendship;
}

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

const STORAGE_KEY = "pokeyellow_220_save_v4";

const ITEM_CATALOG = {
  HM01_CUT: { id: "HM01_CUT", name: "HM01 CUT", qty: 1, kind: "hm", moveId: "CUT" },
  HM02_FLY: { id: "HM02_FLY", name: "HM02 FLY", qty: 1, kind: "hm", moveId: "FLY" },
  HM03_SURF: { id: "HM03_SURF", name: "HM03 SURF", qty: 1, kind: "hm", moveId: "SURF" },
  HM04_STRENGTH: { id: "HM04_STRENGTH", name: "HM04 STRENGTH", qty: 1, kind: "hm", moveId: "STRENGTH" },
  HM05_FLASH: { id: "HM05_FLASH", name: "HM05 FLASH", qty: 1, kind: "hm", moveId: "FLASH" },
  POKE_BALL: { id: "POKE_BALL", name: "POKé BALL", qty: 1, kind: "ball", mult: 1.0 },
  GREAT_BALL: { id: "GREAT_BALL", name: "GREAT BALL", qty: 1, kind: "ball", mult: 1.5 },
  ULTRA_BALL: { id: "ULTRA_BALL", name: "ULTRA BALL", qty: 1, kind: "ball", mult: 2.0 },
  MASTER_BALL: { id: "MASTER_BALL", name: "MASTER BALL", qty: 1, kind: "ball", mult: 255.0 },
  POTION: { id: "POTION", name: "POTION", qty: 1, kind: "heal", hp: 20 },
  SUPER_POTION: { id: "SUPER_POTION", name: "SUPER POTION", qty: 1, kind: "heal", hp: 50 },
  FULL_RESTORE: { id: "FULL_RESTORE", name: "FULL RESTORE", qty: 1, kind: "heal", hp: 999, cure: true },
  RARE_CANDY: { id: "RARE_CANDY", name: "RARE CANDY", qty: 1, kind: "candy" },
  THUNDER_STONE: { id: "THUNDER_STONE", name: "THUNDER STONE", qty: 1, kind: "stone" },
  FIRE_STONE: { id: "FIRE_STONE", name: "FIRE STONE", qty: 1, kind: "stone" },
  WATER_STONE: { id: "WATER_STONE", name: "WATER STONE", qty: 1, kind: "stone" },
  LEAF_STONE: { id: "LEAF_STONE", name: "LEAF STONE", qty: 1, kind: "stone" },
  MOON_STONE: { id: "MOON_STONE", name: "MOON STONE", qty: 1, kind: "stone" },
  POKE_FLUTE: { id: "POKE_FLUTE", name: "POKé FLUTE", qty: 1, kind: "flute" },
  TOWN_MAP: { id: "TOWN_MAP", name: "TOWN MAP", qty: 1, kind: "map" },
  OAKS_PARCEL: { id: "OAKS_PARCEL", name: "OAK's PARCEL", qty: 1, kind: "key" },
  SS_TICKET: { id: "SS_TICKET", name: "S.S. TICKET", qty: 1, kind: "key" },
};

export function giveBagItem(itemKey, count = 1) {
  const def = ITEM_CATALOG[itemKey];
  if (!def) return null;
  const existing = state.bag.find((it) => it.id === def.id);
  if (existing) {
    if (def.kind !== "hm" && def.kind !== "map" && def.kind !== "flute") {
      existing.qty = Math.min(99, existing.qty + Math.max(1, count));
    }
    saveProgress();
    return existing;
  }
  const entry = { ...def, qty: Math.max(1, count) };
  state.bag.push(entry);
  saveProgress();
  return entry;
}

export function hasHmOrMove(moveId) {
  const cleanId = String(moveId || "").toUpperCase();
  const knownInParty = state.party.some(
    (m) => Array.isArray(m.moves) && m.moves.some((mv) => mv.id === cleanId)
  );
  if (knownInParty) return true;
  return state.bag.some((it) => it.kind === "hm" && it.moveId === cleanId);
}

const SPECIAL_TYPES = new Set([
  "FIRE",
  "WATER",
  "GRASS",
  "ELECTRIC",
  "ICE",
  "PSYCHIC",
  "DRAGON",
]);

function getMoveObj(moveId) {
  const mv = POKEYELLOW_DATA.battle?.moves?.[moveId];
  if (mv) {
    return {
      id: mv.id,
      name: mv.name,
      type: mv.type,
      power: mv.power,
      accuracy: mv.accuracy,
      pp: mv.pp,
      maxPp: mv.pp,
      effect: mv.effect,
    };
  }
  return {
    id: moveId,
    name: String(moveId || "TACKLE").replace(/_M$/, "").replace(/_/g, " "),
    type: "NORMAL",
    power: 40,
    accuracy: 100,
    pp: 35,
    maxPp: 35,
    effect: "NO_ADDITIONAL_EFFECT",
  };
}

export function buildMonInstance(speciesKey, level = 10, customMoveIds = null) {
  const cleanKey = String(speciesKey || "PIKACHU").toUpperCase();
  const base = POKEYELLOW_DATA.battle?.pokemonStats?.[cleanKey] ||
    POKEYELLOW_DATA.battle?.pokemonStats?.PIKACHU || {
      species: cleanKey,
      hp: 45,
      atk: 55,
      def: 45,
      spd: 60,
      spc: 50,
      types: ["NORMAL"],
      catchRate: 190,
      baseExp: 64,
      baseMoves: ["TACKLE"],
      learnset: [],
    };

  const lv = Math.max(1, Math.min(100, Number(level) || 10));
  const maxHp = Math.floor(((base.hp + 15) * 2 * lv) / 100) + lv + 10;
  const atk = Math.floor(((base.atk + 15) * 2 * lv) / 100) + 5;
  const def = Math.floor(((base.def + 15) * 2 * lv) / 100) + 5;
  const spd = Math.floor(((base.spd + 15) * 2 * lv) / 100) + 5;
  const spc = Math.floor(((base.spc + 15) * 2 * lv) / 100) + 5;

  let moveIds = [];
  if (Array.isArray(customMoveIds) && customMoveIds.length > 0) {
    moveIds = customMoveIds.slice(0, 4);
  } else {
    const known = [...(base.baseMoves || ["TACKLE"])];
    for (const [learnLv, mId] of base.learnset || []) {
      if (learnLv <= lv && !known.includes(mId)) {
        known.push(mId);
      }
    }
    moveIds = known.slice(-4);
  }
  if (moveIds.length === 0) moveIds = ["TACKLE"];

  return {
    species: cleanKey,
    nickname: cleanKey.replace(/_/g, " "),
    level: lv,
    hp: maxHp,
    maxHp,
    atk,
    def,
    spd,
    spc,
    types: base.types || ["NORMAL"],
    catchRate: base.catchRate ?? 120,
    baseExp: base.baseExp ?? 64,
    status: "OK", // "OK" | "PAR" | "PSN" | "SLP" | "BRN" | "FRZ"
    moves: moveIds.map((mId) => getMoveObj(mId)),
  };
}

function initDefaultParty() {
  if (state.party.length > 0) return;
  // Used as a safety fallback when a battle/HM is invoked directly via API before the Oak intro event
  state.party = [buildMonInstance("PIKACHU", 5)];
  state.caughtPokemon.add("PIKACHU");
  state.events.gotStarterPikachu = true;
  syncPikachuOverworldState();
}

export function isStarterPikachuAlive() {
  // IsStarterPikachuAliveInOurParty (engine/pikachu/pikachu_status.asm)
  const pika = state.party.find((m) => m.species === "PIKACHU");
  return Boolean(pika && pika.hp > 0);
}

export function isSurfingPikachuInParty() {
  // IsSurfingPikachuInParty (home/map_objects.asm:71-113)
  return state.party.some(
    (m) =>
      m.species === "PIKACHU" &&
      Array.isArray(m.moves) &&
      m.moves.some((mv) => mv.id === "SURF")
  );
}

export function syncPikachuOverworldState() {
  // LoadSurfingPlayerSpriteGraphicsByState (home/overworld.asm:1745-1770)
  state.player.surfSprite = isSurfingPikachuInParty()
    ? "surfing_pikachu"
    : "seel";

  // ShouldPikachuSpawn (engine/pikachu/pikachu_follow.asm:1-19):
  // Pikachu only spawns in overworld when wWalkBikeSurfState == 0 ("walk"),
  // not delayed by exiting Surf, and starter Pikachu is conscious in party.
  const shouldSpawn =
    state.player.mode === "walk" &&
    !state.pikachu.spawnDelayed &&
    isStarterPikachuAlive();

  state.pikachu.visible = shouldSpawn;
  if (!shouldSpawn) {
    state.pikachu.walking = false;
    state.pikachu.moveAnim = null;
  }
}

export function healParty() {
  for (const mon of state.party) {
    mon.hp = mon.maxHp;
    mon.status = "OK";
    for (const mv of mon.moves) {
      mv.pp = mv.maxPp;
    }
  }
  syncPikachuOverworldState();
}

function saveProgress() {
  try {
    const payload = {
      visitedZones: Array.from(state.visitedZones),
      seenPokemon: Array.from(state.seenPokemon),
      caughtPokemon: Array.from(state.caughtPokemon),
      defeatedTrainers: Array.from(state.defeatedTrainers),
      friendship: state.pikachu.friendship,
      events: { ...state.events },
      paletteMode: engine.paletteMode,
      wildEncountersEnabled: state.wildEncountersEnabled,
      party: state.party.map((m) => ({
        species: m.species,
        nickname: m.nickname,
        level: m.level,
        hp: m.hp,
        maxHp: m.maxHp,
        atk: m.atk,
        def: m.def,
        spd: m.spd,
        spc: m.spc,
        status: m.status,
        exp: m.exp || 0,
        moves: (m.moves || []).map((mv) => ({
          id: mv.id,
          pp: mv.pp,
        })),
      })),
      bag: state.bag.map((it) => ({ ...it })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    if (Array.isArray(data.visitedZones)) {
      data.visitedZones.forEach((z) => {
        if (typeof z === "string" && engine.zonesByConst[z]) {
          state.visitedZones.add(z);
        }
      });
    }
    if (Array.isArray(data.seenPokemon)) {
      data.seenPokemon.forEach((p) => {
        if (typeof p === "string" && POKEYELLOW_DATA.battle?.pokemonStats?.[p]) {
          state.seenPokemon.add(p);
        }
      });
    }
    if (Array.isArray(data.caughtPokemon)) {
      data.caughtPokemon.forEach((p) => {
        if (typeof p === "string" && POKEYELLOW_DATA.battle?.pokemonStats?.[p]) {
          state.caughtPokemon.add(p);
          state.seenPokemon.add(p);
        }
      });
    }
    if (Array.isArray(data.defeatedTrainers)) {
      data.defeatedTrainers.forEach((t) => {
        if (typeof t === "string") state.defeatedTrainers.add(t);
      });
    }
    if (typeof data.friendship === "number" && Number.isFinite(data.friendship)) {
      state.pikachu.friendship = Math.max(0, Math.min(255, Math.round(data.friendship)));
    }
    if (data.events && typeof data.events === "object") {
      for (const k of Object.keys(state.events)) {
        if (k in data.events) {
          state.events[k] = Boolean(data.events[k]);
        }
      }
    }
    if (
      typeof data.paletteMode === "string" &&
      ["reference", "sgb", "cgb", "dmg"].includes(data.paletteMode)
    ) {
      engine.paletteMode = data.paletteMode;
    }
    if (typeof data.wildEncountersEnabled === "boolean") {
      state.wildEncountersEnabled = data.wildEncountersEnabled;
    }
    if (Array.isArray(data.party) && data.party.length > 0) {
      const restored = [];
      for (const savedMon of data.party.slice(0, 6)) {
        if (!savedMon || typeof savedMon.species !== "string") continue;
        const sp = savedMon.species.toUpperCase();
        if (!POKEYELLOW_DATA.battle?.pokemonStats?.[sp]) continue;
        const moveIds = Array.isArray(savedMon.moves)
          ? savedMon.moves.map((mv) => (typeof mv === "string" ? mv : mv?.id)).filter(Boolean)
          : null;
        const mon = buildMonInstance(sp, savedMon.level || 5, moveIds);
        if (typeof savedMon.nickname === "string" && savedMon.nickname.trim()) {
          mon.nickname = savedMon.nickname.trim().slice(0, 12);
        }
        if (typeof savedMon.hp === "number" && Number.isFinite(savedMon.hp)) {
          mon.hp = Math.max(0, Math.min(mon.maxHp, Math.round(savedMon.hp)));
        }
        if (
          typeof savedMon.status === "string" &&
          ["OK", "PAR", "PSN", "SLP", "BRN", "FRZ"].includes(savedMon.status)
        ) {
          mon.status = mon.hp > 0 ? savedMon.status : "OK";
        }
        if (typeof savedMon.exp === "number" && Number.isFinite(savedMon.exp)) {
          mon.exp = Math.max(0, Math.floor(savedMon.exp));
        }
        if (Array.isArray(savedMon.moves)) {
          mon.moves.forEach((mv, idx) => {
            const savedMv = savedMon.moves[idx];
            if (savedMv && typeof savedMv.pp === "number" && Number.isFinite(savedMv.pp)) {
              mv.pp = Math.max(0, Math.min(mv.maxPp, Math.round(savedMv.pp)));
            }
          });
        }
        restored.push(mon);
      }
      if (restored.length > 0 && restored.some((m) => m.species === "PIKACHU")) {
        if (restored.every((m) => m.hp <= 0)) {
          restored[0].hp = restored[0].maxHp;
        }
        state.party = restored;
      }
    }
    if (Array.isArray(data.bag)) {
      state.bag = data.bag
        .filter((it) => it && typeof it.id === "string" && typeof it.name === "string")
        .map((it) => ({
          ...(ITEM_CATALOG[it.id] || it),
          qty: Math.max(1, Math.min(99, Number(it.qty) || 1)),
        }));
    }
  } catch {
    // Ignore malformed saved state
  }
}

function resolveTrainerSpriteKey(trainerClass, trainerSprite, npcSprite) {
  if (trainerSprite && engine.trainerSprites[trainerSprite]) {
    return trainerSprite;
  }
  if (trainerClass) {
    const clean = trainerClass
      .replace(/^OPP_/, "")
      .replace(/^JR_TRAINER_M$/, "JR_TRAINERM")
      .replace(/^JR_TRAINER_F$/, "JR_TRAINERF")
      .replace(/^COOLTRAINER_M$/, "COOLTRAINERM")
      .replace(/^COOLTRAINER_F$/, "COOLTRAINERF")
      .replace(/^BUG_CATCHER$/, "BUGCATCHER")
      .replace(/^BIRD_KEEPER$/, "BIRDKEEPER")
      .replace(/^BLACK_BELT$/, "BLACKBELT")
      .replace(/^SUPER_NERD$/, "SUPERNERD");
    if (engine.trainerSprites[clean]) return clean;
  }
  const sprMap = {
    SPRITE_OAK: "PROF_OAK",
    SPRITE_BLUE: "RIVAL1",
    SPRITE_GIOVANNI: "GIOVANNI",
    SPRITE_JESSIE: "JESSIEJAMES",
    SPRITE_JAMES: "JESSIEJAMES",
    SPRITE_ROCKET: "ROCKET",
    SPRITE_COOLTRAINER_M: "COOLTRAINERM",
    SPRITE_COOLTRAINER_F: "COOLTRAINERF",
    SPRITE_SUPER_NERD: "SUPERNERD",
    SPRITE_GENTLEMAN: "GENTLEMAN",
    SPRITE_SAILOR: "SAILOR",
    SPRITE_SWIMMER: "SWIMMER",
    SPRITE_BEAUTY: "BEAUTY",
    SPRITE_SCIENTIST: "SCIENTIST",
    SPRITE_CHANNELER: "CHANNELER",
    SPRITE_HIKER: "HIKER",
    SPRITE_BIKER: "BIKER",
    SPRITE_FISHER: "FISHER",
    SPRITE_YOUNGSTER: "YOUNGSTER",
    SPRITE_GIRL: "LASS",
    SPRITE_LORELEI: "LORELEI",
    SPRITE_BRUNO: "BRUNO",
    SPRITE_AGATHA: "AGATHA",
    SPRITE_LANCE: "LANCE",
  };
  return sprMap[npcSprite] || null;
}

const KANTO_DEX_ORDER = [
  "BULBASAUR", "IVYSAUR", "VENUSAUR", "CHARMANDER", "CHARMELEON", "CHARIZARD",
  "SQUIRTLE", "WARTORTLE", "BLASTOISE", "CATERPIE", "METAPOD", "BUTTERFREE",
  "WEEDLE", "KAKUNA", "BEEDRILL", "PIDGEY", "PIDGEOTTO", "PIDGEOT",
  "RATTATA", "RATICATE", "SPEAROW", "FEAROW", "EKANS", "ARBOK",
  "PIKACHU", "RAICHU", "SANDSHREW", "SANDSLASH", "NIDORAN_F", "NIDORINA",
  "NIDOQUEEN", "NIDORAN_M", "NIDORINO", "NIDOKING", "CLEFAIRY", "CLEFABLE",
  "VULPIX", "NINETALES", "JIGGLYPUFF", "WIGGLYTUFF", "ZUBAT", "GOLBAT",
  "ODDISH", "GLOOM", "VILEPLUME", "PARAS", "PARASECT", "VENONAT",
  "VENOMOTH", "DIGLETT", "DUGTRIO", "MEOWTH", "PERSIAN", "PSYDUCK",
  "GOLDUCK", "MANKEY", "PRIMEAPE", "GROWLITHE", "ARCANINE", "POLIWAG",
  "POLIWHIRL", "POLIWRATH", "ABRA", "KADABRA", "ALAKAZAM", "MACHOP",
  "MACHOKE", "MACHAMP", "BELLSPROUT", "WEEPINBELL", "VICTREEBEL", "TENTACOOL",
  "TENTACRUEL", "GEODUDE", "GRAVELER", "GOLEM", "PONYTA", "RAPIDASH",
  "SLOWPOKE", "SLOWBRO", "MAGNEMITE", "MAGNETON", "FARFETCH_D", "DODUO",
  "DODRIO", "SEEL", "DEWGONG", "GRIMER", "MUK", "SHELLDER",
  "CLOYSTER", "GASTLY", "HAUNTER", "GENGAR", "ONIX", "DROWZEE",
  "HYPNO", "KRABBY", "KINGLER", "VOLTORB", "ELECTRODE", "EXEGGCUTE",
  "EXEGGUTOR", "CUBONE", "MAROWAK", "HITMONLEE", "HITMONCHAN", "LICKITUNG",
  "KOFFING", "WEEZING", "RHYHORN", "RHYDON", "CHANSEY", "TANGELA",
  "KANGASKHAN", "HORSEA", "SEADRA", "GOLDEEN", "SEAKING", "STARYU",
  "STARMIE", "MR_MIME", "SCYTHER", "JYNX", "ELECTABUZZ", "MAGMAR",
  "Pinsir".toUpperCase(), "TAUROS", "MAGIKARP", "GYARADOS", "LAPRAS", "DITTO",
  "EEVEE", "VAPOREON", "JOLTEON", "FLAREON", "PORYGON", "OMANYTE",
  "OMASTAR", "KABUTO", "KABUTOPS", "AERODACTYL", "SNORLAX", "ARTICUNO",
  "ZAPDOS", "MOLTRES", "DRATINI", "DRAGONAIR", "DRAGONITE", "MEWTWO", "MEW"
];

function getOrderedPokedexEntries() {
  const statsMap = POKEYELLOW_DATA.battle?.pokemonStats || {};
  return KANTO_DEX_ORDER.map((sp, idx) => {
    const st = statsMap[sp] ||
      statsMap[sp.replace("_", "")] || {
        species: sp,
        hp: 50,
        atk: 50,
        def: 50,
        spd: 50,
        spc: 50,
        types: ["NORMAL"],
        evolutions: [],
        baseMoves: ["TACKLE"],
      };
    return { ...st, species: st.species || sp, dexNum: idx + 1 };
  });
}

const KANTO_GYM_BADGES = [
  { id: "BOULDER", name: "BOULDERBADGE", leader: "BROCK", zone: "PEWTER_GYM" },
  { id: "CASCADE", name: "CASCADEBADGE", leader: "MISTY", zone: "CERULEAN_GYM" },
  { id: "THUNDER", name: "THUNDERBADGE", leader: "LT.SURGE", zone: "VERMILION_GYM" },
  { id: "RAINBOW", name: "RAINBOWBADGE", leader: "ERIKA", zone: "CELADON_GYM" },
  { id: "SOUL", name: "SOULBADGE", leader: "KOGA", zone: "FUCHSIA_GYM" },
  { id: "MARSH", name: "MARSHBADGE", leader: "SABRINA", zone: "SAFFRON_GYM" },
  { id: "VOLCANO", name: "VOLCANOBADGE", leader: "BLAINE", zone: "CINNABAR_GYM" },
  { id: "EARTH", name: "EARTHBADGE", leader: "GIOVANNI", zone: "VIRIDIAN_GYM" },
];

export function getEarnedBadges() {
  const earned = [];
  for (const b of KANTO_GYM_BADGES) {
    const isEarned = Array.from(state.defeatedTrainers).some((k) =>
      k.startsWith(`${b.zone}:`) && k.toUpperCase().includes(b.leader.replace(".", "_"))
    );
    if (isEarned) earned.push(b);
  }
  return earned;
}

function getTrainerBattleEntry(npc, zone) {
  if (!npc || npc.kind === "item" || !npc.battle) return null;
  // Cannot battle any trainer before receiving a Pokémon!
  if (state.party.length === 0 || !state.events.gotStarterPikachu) return null;
  // Rival Blue in Oak's Lab only battles when Red walks south to exit the lab
  if (zone.constName === "OAKS_LAB" && npc.name === "OAKSLAB_RIVAL") return null;

  const b = npc.battle;
  const isGenuineTrainer =
    Boolean(b.isWild) ||
    (Boolean(b.trainerClass) && b.trainerClass !== "OPP_PROF_OAK");
  if (!isGenuineTrainer) return null;
  if (!Array.isArray(b.party) || b.party.length === 0) return null;

  const key = `${zone.constName}:${npc.name}:${npc.id}`;
  const isEliteOrChamp =
    zone.constName === "LORELEIS_ROOM" ||
    zone.constName === "BRUNOS_ROOM" ||
    zone.constName === "AGATHAS_ROOM" ||
    zone.constName === "LANCES_ROOM" ||
    zone.constName === "CHAMPIONS_ROOM";
  if (state.defeatedTrainers.has(key) && !isEliteOrChamp) {
    return null;
  }

  const firstMon = b.party[0];
  return {
    key,
    isWild: Boolean(b.isWild),
    trainerClass: b.trainerClass || null,
    trainerName: b.isWild ? null : b.trainerName,
    trainerSprite: resolveTrainerSpriteKey(b.trainerClass, b.trainerSprite, npc.sprite),
    party: b.party,
    species: firstMon[1],
    level: firstMon[0],
    battleText: b.battleText || "",
    endBattleText: b.endBattleText || "Impossible! You defeated my POKéMON!",
  };
}

function findDefaultSpawn(zone, spawnWarpIndex = null) {
  if (spawnWarpIndex !== null && zone.warps[spawnWarpIndex]) {
    const w = zone.warps[spawnWarpIndex];
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileAtWarp = engine.getCollisionTileAtStep(zone, w.x, w.y);
    // If emerging onto an outdoor door tile, step 1 tile down if passable
    if (
      zone.romId < 0x25 &&
      ts.doorSet.has(tileAtWarp) &&
      w.y + 1 < zone.height * 2
    ) {
      return { x: w.x, y: w.y + 1, dir: "DOWN" };
    }
    return { x: w.x, y: w.y, dir: "DOWN" };
  }

  // For Pallet Town default spawn right between Red's House and Oak's Lab
  if (zone.constName === "PALLET_TOWN") {
    return { x: 5, y: 6, dir: "DOWN" };
  }

  // If the zone has warps, spawn near the first warp or center
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

  // Otherwise find nearest passable tile to center
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
  const now = performance.now();
  // PalletTownDaisyScript (scripts/PalletTown.asm:203-215):
  // Returning to Pallet Town after getting Town Map in Blue's House switches Daisy to walking state!
  if (
    zone.constName === "PALLET_TOWN" &&
    state.events.gotTownMap &&
    state.events.enteredBluesHouse
  ) {
    state.events.daisyWalking = true;
  }
  // BluesHouseDefaultScript (scripts/BluesHouse.asm:13-18):
  if (zone.constName === "BLUES_HOUSE") {
    state.events.enteredBluesHouse = true;
  }

  return zone.objects.map((o, idx) => {
    let defaultVisible = o.defaultVisible;
    let collected = false;
    if (zone.constName === "BLUES_HOUSE") {
      if (o.name === "BLUESHOUSE_DAISY1") {
        defaultVisible = !state.events.daisyWalking; // TOGGLE_DAISY_SITTING
      } else if (o.name === "BLUESHOUSE_DAISY2") {
        defaultVisible = state.events.daisyWalking; // TOGGLE_DAISY_WALKING
      } else if (o.name === "BLUESHOUSE_TOWN_MAP" && state.events.gotTownMap) {
        collected = true; // TOGGLE_TOWN_MAP hidden once Daisy gives it to Red
      }
    } else if (zone.constName === "OAKS_LAB") {
      if (o.name === "OAKSLAB_OAK1") {
        defaultVisible = Boolean(
          state.events.oakRescuedInGrass || state.events.gotStarterPikachu
        );
      } else if (
        o.name === "OAKSLAB_EEVEE_POKE_BALL" &&
        state.events.gotStarterPikachu
      ) {
        collected = true; // Snatched by Rival Blue during the lab intro cutscene
      } else if (
        (o.name === "OAKSLAB_POKEDEX1" || o.name === "OAKSLAB_POKEDEX2") &&
        state.events.gotPokedex
      ) {
        collected = true; // TOGGLE_POKEDEX_1 & 2 hidden after Oak gives them to Red & Blue
      }
    } else if (zone.constName === "VIRIDIAN_CITY") {
      const oldManAwake = state.events.gotPokedex || state.events.gotOaksParcel;
      if (o.name === "VIRIDIANCITY_OLD_MAN_SLEEPY") {
        defaultVisible = !oldManAwake; // TOGGLE_OLD_MAN_1 (blocking road before coffee/parcel)
      } else if (o.name === "VIRIDIANCITY_OLD_MAN") {
        defaultVisible = oldManAwake; // TOGGLE_OLD_MAN_2 (awake & stepped aside at (17,5))
      }
    } else if (zone.constName === "BILLS_HOUSE") {
      if (o.name === "BILLSHOUSE_BILL_POKEMON") {
        defaultVisible = !state.events.helpedBill;
      } else if (o.name === "BILLSHOUSE_BILL1") {
        defaultVisible = Boolean(state.events.helpedBill);
      }
    } else if (zone.constName === "ROUTE_12") {
      if (o.name === "ROUTE12_SNORLAX" && state.events.wokeRoute12Snorlax) {
        collected = true;
      }
    } else if (zone.constName === "ROUTE_16") {
      if (o.name === "ROUTE16_SNORLAX" && state.events.wokeRoute16Snorlax) {
        collected = true;
      }
    } else if (zone.constName === "POKEMON_TOWER_7F") {
      if (o.name === "POKEMONTOWER7F_JESSIE" || o.name === "POKEMONTOWER7F_JAMES") {
        defaultVisible = !state.events.rescuedMrFuji;
      } else if (o.name === "POKEMONTOWER7F_MR_FUJI" && state.events.rescuedMrFuji) {
        collected = true;
      }
    }
    return {
      ...o,
      defaultVisible,
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
      nextMoveTime: now + 350 + (idx % 8) * 160 + Math.random() * 900,
      collected,
    };
  });
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

  // Record outdoor map for LAST_MAP indoor exit warps
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

  // Ensure elevator maps always have a valid return floor if entered directly
  if (ELEVATOR_FLOORS[zone.constName] && !state.selectedElevatorDest[zone.constName]) {
    const prevConst = state.currentZone?.constName;
    const matchFloor = ELEVATOR_FLOORS[zone.constName].find(
      (f) => f.destConst === prevConst
    );
    state.selectedElevatorDest[zone.constName] =
      matchFloor || ELEVATOR_FLOORS[zone.constName][0];
  }

  heldDirs.clear();
  engine.loadMapIntoWRAM(zone);
  state.currentZone = zone;
  state.strengthActive = false;
  if (
    zone.constName !== "ROCK_TUNNEL_1F" &&
    zone.constName !== "ROCK_TUNNEL_B1F"
  ) {
    engine.flashIlluminated = false;
  }
  state.visitedZones.add(zone.constName);
  saveProgress();
  state.npcs = initZoneNpcs(zone);
  if (state.dialogue) {
    state.dialogue = null;
    renderDialogueModal();
  }
  if (state.startMenu.open) {
    state.startMenu.open = false;
    state.startMenu.subView = null;
    state.startMenu.selectedDexSpecies = null;
    renderStartMenu();
  }

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
  const spawnTile = engine.getCollisionTileAtStep(zone, spawn.x, spawn.y);
  if (isWaterTile(zone, spawnTile)) {
    state.player.mode = "surf";
  } else if (state.player.mode === "surf") {
    state.player.mode = "walk";
  }

  // Place Pikachu 1 step behind Red (if tile is dry land)
  const behindOffsets = {
    DOWN: [0, -1],
    UP: [0, 1],
    LEFT: [1, 0],
    RIGHT: [-1, 0],
  };
  const [bx, by] = behindOffsets[state.player.dir] || [0, -1];
  const px = Math.max(0, Math.min(zone.width * 2 - 1, spawn.x + bx));
  const py = Math.max(0, Math.min(zone.height * 2 - 1, spawn.y + by));
  const pikaTile = engine.getCollisionTileAtStep(zone, px, py);
  const pikaOnWater = isWaterTile(zone, pikaTile);
  state.pikachu.x = pikaOnWater ? spawn.x : px;
  state.pikachu.y = pikaOnWater ? spawn.y : py;
  state.pikachu.renderX = state.pikachu.x;
  state.pikachu.renderY = state.pikachu.y;
  state.pikachu.dir = state.player.dir;
  state.pikachu.walking = false;
  state.pikachu.moveAnim = null;
  state.pikachu.spawnDelayed = false;
  syncPikachuOverworldState();

  audio.playTrack(zone.music);
  updateUIForCurrentZone();
  renderAllCanvases();

  // ViridianMartDefaultScript (scripts/ViridianMart.asm:19-46):
  // Entering Viridian Mart for the first time automatically triggers Clerk's Oak's Parcel callout!
  if (zone.constName === "VIRIDIAN_MART" && !state.events.gotOaksParcel) {
    state.events.gotOaksParcel = true;
    giveBagItem("OAKS_PARCEL", 1);
    audio.playSfx("blip");
    openDialogue(
      "POKéMON MART CLERK",
      "Hey! You came from PALLET TOWN?\n\nYou know PROF. OAK, right? His order came in. Will you take it to him?\n\nRED got OAK's PARCEL!"
    );
  }

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
  let destConst = warp?.destConst || "PALLET_TOWN";
  let destWarpIdx = warp?.destWarpIndex ?? 0;

  // Check if we are exiting an elevator that had a floor chosen or default floor
  if (ELEVATOR_FLOORS[zone.constName]) {
    const chosen =
      state.selectedElevatorDest[zone.constName] ||
      ELEVATOR_FLOORS[zone.constName][0];
    if (chosen) {
      destConst = chosen.destConst;
      destWarpIdx = chosen.warpIndex;
    }
  }

  if (destConst === "LAST_MAP" || !engine.zonesByConst[destConst]) {
    if (
      state.lastOutdoorMap &&
      engine.zonesByConst[state.lastOutdoorMap.mapConst]
    ) {
      destConst = state.lastOutdoorMap.mapConst;
      if (state.lastOutdoorMap.warpIndex !== undefined) {
        destWarpIdx = state.lastOutdoorMap.warpIndex;
      }
    } else if (zone.defaultParent && engine.zonesByConst[zone.defaultParent.mapConst]) {
      destConst = zone.defaultParent.mapConst;
      destWarpIdx = zone.defaultParent.warpIndex ?? 0;
    } else {
      destConst = "PALLET_TOWN";
      destWarpIdx = 0;
    }
  }

  const targetZone = engine.zonesByConst[destConst];
  if (targetZone && targetZone.warps.length > 0) {
    if (destWarpIdx < 0 || destWarpIdx >= targetZone.warps.length) {
      destWarpIdx = 0;
    }
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

function isCuttableTreeTile(zone, tileId) {
  if (!zone) return false;
  return (
    (zone.tileset === "OVERWORLD" && tileId === 0x3d) ||
    (zone.tileset === "GYM" && tileId === 0x50)
  );
}

const KANTO_FLY_DESTINATIONS = [
  { label: "PALLET TOWN", destConst: "PALLET_TOWN", warpIndex: 0 },
  { label: "VIRIDIAN CITY", destConst: "VIRIDIAN_CITY", warpIndex: 0 },
  { label: "PEWTER CITY", destConst: "PEWTER_CITY", warpIndex: 2 },
  { label: "CERULEAN CITY", destConst: "CERULEAN_CITY", warpIndex: 2 },
  { label: "VERMILION CITY", destConst: "VERMILION_CITY", warpIndex: 0 },
  { label: "LAVENDER TOWN", destConst: "LAVENDER_TOWN", warpIndex: 0 },
  { label: "CELADON CITY", destConst: "CELADON_CITY", warpIndex: 3 },
  { label: "FUCHSIA CITY", destConst: "FUCHSIA_CITY", warpIndex: 1 },
  { label: "SAFFRON CITY", destConst: "SAFFRON_CITY", warpIndex: 3 },
  { label: "CINNABAR ISLAND", destConst: "CINNABAR_ISLAND", warpIndex: 3 },
  { label: "INDIGO PLATEAU", destConst: "INDIGO_PLATEAU", warpIndex: 0 },
];

export function teachHmMove(moveId, targetMon = null) {
  initDefaultParty();
  const cleanId = String(moveId || "").toUpperCase();
  const existing = state.party.find(
    (m) => Array.isArray(m.moves) && m.moves.some((mv) => mv.id === cleanId)
  );
  if (existing && !targetMon) return existing;

  const mon = targetMon || state.party[0];
  if (!mon) return null;
  if (!Array.isArray(mon.moves)) mon.moves = [];
  if (!mon.moves.some((mv) => mv.id === cleanId)) {
    const moveObj = getMoveObj(cleanId);
    if (mon.moves.length < 4) {
      mon.moves.push(moveObj);
    } else {
      mon.moves[3] = moveObj;
    }
    modifyPikachuHappiness("USEDTMHM");
    syncPikachuOverworldState();
    saveProgress();
  }
  return mon;
}

export function useFieldMove(moveId, options = {}) {
  initDefaultParty();
  const cleanId = String(moveId || "").toUpperCase();
  const autoTeach = options.teachIfMissing !== false;
  let userMon = state.party.find(
    (m) => Array.isArray(m.moves) && m.moves.some((mv) => mv.id === cleanId)
  );
  if (!userMon && autoTeach) {
    userMon = teachHmMove(cleanId);
  }
  if (!userMon) {
    audio.playSfx("bump");
    openDialogue(
      `HM — ${cleanId}`,
      `No POKéMON in RED's party knows ${cleanId} yet! Teach it using the HM in your ITEM bag.`
    );
    return false;
  }

  if (state.startMenu.open) {
    state.startMenu.open = false;
    state.startMenu.subView = null;
    state.startMenu.selectedDexSpecies = null;
    renderStartMenu();
  }

  const zone = state.currentZone;
  const dx =
    state.player.dir === "LEFT" ? -1 : state.player.dir === "RIGHT" ? 1 : 0;
  const dy =
    state.player.dir === "UP" ? -1 : state.player.dir === "DOWN" ? 1 : 0;
  const fx = state.player.x + dx;
  const fy = state.player.y + dy;
  const inBounds =
    fx >= 0 && fx < zone.width * 2 && fy >= 0 && fy < zone.height * 2;
  const frontTile = inBounds
    ? engine.getCollisionTileAtStep(zone, fx, fy)
    : -1;

  if (cleanId === "SURF") {
    if (state.player.mode === "surf") {
      audio.playSfx("blip");
      openDialogue(
        "HM03 SURF",
        `${userMon.nickname} is already surfing across the water!`
      );
      return true;
    }
    const blockedByNpc = state.npcs.some(
      (n) =>
        !n.collected &&
        (n.defaultVisible || state.showHiddenObjects) &&
        n.x === fx &&
        n.y === fy
    );
    if (!inBounds || blockedByNpc || !isWaterTile(zone, frontTile)) {
      audio.playSfx("bump");
      openDialogue(
        "HM03 SURF",
        `Can't SURF here!\n\nFace the water's edge and use HM03 SURF.`
      );
      return false;
    }
    // Activate SURF and step onto the water tile
    audio.playSfx("warp");
    state.player.mode = "surf";
    state.pikachu.spawnDelayed = false;
    syncPikachuOverworldState();
    startPlayerMove(fx, fy, state.player.dir, 165, false);
    openDialogue(
      "HM03 SURF",
      `${userMon.nickname} used SURF!\n\nRED got on ${userMon.nickname}!`
    );
    renderAllCanvases(true);
    return true;
  }

  if (cleanId === "CUT") {
    const ts = engine.tilesetsByConst[zone.tileset];
    if (inBounds && isCuttableTreeTile(zone, frontTile)) {
      engine.cutTrees.add(`${zone.constName}:${fx},${fy}`);
      audio.playSfx("ledge");
      renderAllCanvases(true);
      openDialogue(
        "HM01 CUT",
        `${userMon.nickname} hacked away with CUT!\n\nThe small tree was cut down!`
      );
      return true;
    }
    if (inBounds && ts && frontTile === ts.grassTile) {
      engine.cutTrees.add(`${zone.constName}:${fx},${fy}`);
      audio.playSfx("ledge");
      renderAllCanvases(true);
      openDialogue(
        "HM01 CUT",
        `${userMon.nickname} cleared the tall grass with CUT!`
      );
      return true;
    }
    audio.playSfx("bump");
    openDialogue(
      "HM01 CUT",
      `There isn't anything to CUT here!\n\nStand facing a small tree or tall grass and use HM01 CUT.`
    );
    return false;
  }

  if (cleanId === "FLY") {
    if (zone.romId >= 0x25 && zone.category !== "town" && zone.category !== "route") {
      audio.playSfx("bump");
      openDialogue("HM02 FLY", `Can't use FLY inside a building or dungeon!`);
      return false;
    }
    audio.playSfx("blip");
    state.dialogue = {
      title: `HM02 FLY — ${userMon.nickname}`,
      pages: ["Where would you like to FLY to?"],
      pageIndex: 0,
      elevatorConst: "HM02_FLY",
      elevatorOptions: KANTO_FLY_DESTINATIONS,
    };
    renderDialogueModal();
    return true;
  }

  if (cleanId === "STRENGTH") {
    state.strengthActive = true;
    audio.playSfx("thunder");
    openDialogue(
      "HM04 STRENGTH",
      `${userMon.nickname} used STRENGTH!\n\n${userMon.nickname}'s saving energy makes it possible to move boulders around!`
    );
    return true;
  }

  if (cleanId === "FLASH") {
    engine.flashIlluminated = true;
    audio.playSfx("thunder");
    renderAllCanvases(true);
    openDialogue(
      "HM05 FLASH",
      `${userMon.nickname} used FLASH!\n\nA blinding FLASH illuminates the area!`
    );
    return true;
  }

  return false;
}

function attemptStep(dir) {
  if (state.dialogue || state.battle || state.startMenu.open) return;
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
    if (zone.constName === "PALLET_TOWN" && !state.events.gotStarterPikachu) {
      triggerOakIntroGrassEvent();
      return;
    }
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

  // 4. Check NPC collision (and HM04 STRENGTH boulder pushing!)
  if (!state.noClip) {
    for (const npc of state.npcs) {
      if (!npc.defaultVisible && !state.showHiddenObjects) continue;
      if (npc.collected) continue;
      if (npc.x === targetX && npc.y === targetY) {
        if (npc.sprite === "SPRITE_BOULDER" && state.strengthActive && !npc.moveAnim) {
          const bx = targetX + dx;
          const by = targetY + dy;
          const ts = engine.tilesetsByConst[zone.tileset];
          const destTile =
            bx >= 0 && bx < zone.width * 2 && by >= 0 && by < zone.height * 2
              ? engine.getCollisionTileAtStep(zone, bx, by)
              : -1;
          const canPush =
            bx >= 0 &&
            bx < zone.width * 2 &&
            by >= 0 &&
            by < zone.height * 2 &&
            engine.isStepPassable(zone, targetX, targetY, bx, by) &&
            !(ts && (ts.doorSet.has(destTile) || ts.warpSet.has(destTile))) &&
            !(state.pikachu.visible && state.pikachu.x === bx && state.pikachu.y === by) &&
            !state.npcs.some(
              (other) =>
                other !== npc &&
                !other.collected &&
                (other.defaultVisible || state.showHiddenObjects) &&
                other.x === bx &&
                other.y === by
            );
          if (canPush) {
            const fromX = npc.x;
            const fromY = npc.y;
            npc.x = bx;
            npc.y = by;
            npc.moveAnim = {
              fromX,
              fromY,
              toX: bx,
              toY: by,
              startTime: performance.now(),
              duration: 210,
            };
            audio.playSfx("ledge");
            renderAllCanvases(true);
            return;
          }
        }
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

  // Also allow stepping directly onto a warp_event coordinate (e.g. stairs/doors)
  const targetWarp = checkWarpAtStep(zone, targetX, targetY);

  if (!passable && !targetWarp) {
    audio.playSfx("bump");
    return;
  }

  const wasSurfing = state.player.mode === "surf";
  if (water && state.player.mode !== "surf") {
    // Entering water (ItemUseSurfboard in engine/items/item_effects.asm:715):
    // wWalkBikeSurfState = 2 -> ShouldPikachuSpawn hides following Pikachu!
    state.player.mode = "surf";
    state.pikachu.spawnDelayed = false;
    syncPikachuOverworldState();
  } else if (!water && wasSurfing) {
    // Stepping from water onto land (ItemUseSurfboard.stopSurfing in engine/items/item_effects.asm:743):
    // wWalkBikeSurfState = 0 with PIKACHU_SPAWN_DELAYED so Pikachu does not spawn on the water tile behind Red!
    state.player.mode = "walk";
    state.pikachu.spawnDelayed = true;
    state.pikachu.x = targetX;
    state.pikachu.y = targetY;
    state.pikachu.renderX = targetX;
    state.pikachu.renderY = targetY;
    syncPikachuOverworldState();
  } else if (!water && state.player.mode === "walk" && state.pikachu.spawnDelayed) {
    // Next walking step on dry land: clear PIKACHU_SPAWN_DELAYED so Pikachu emerges at Red's land tile!
    state.pikachu.spawnDelayed = false;
    state.pikachu.x = state.player.x;
    state.pikachu.y = state.player.y;
    state.pikachu.renderX = state.player.x;
    state.pikachu.renderY = state.player.y;
    syncPikachuOverworldState();
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

  // Move Pikachu to Red's previous step
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

  state.pikachu.stepCounter = (state.pikachu.stepCounter || 0) + 1;
  if (state.pikachu.stepCounter % 16 === 0 && state.pikachu.visible) {
    modifyPikachuHappiness("WALKING");
  }

  updateCoordinatesUI();

  // Area-Specific Step Triggers:
  // A. Pallet Town Intro Event with Professor Oak (scripts/PalletTown.asm:34-185)
  if (
    zone.constName === "PALLET_TOWN" &&
    !state.events.gotStarterPikachu &&
    sy <= 1 &&
    (sx === 10 || sx === 11)
  ) {
    triggerOakIntroGrassEvent();
    return;
  }

  // B. Oak's Lab First Rival Battle when walking south toward the exit after receiving Pikachu (scripts/OaksLab.asm:250-355)
  if (
    zone.constName === "OAKS_LAB" &&
    state.events.gotStarterPikachu &&
    !state.events.battledRivalInLab &&
    sy >= 6
  ) {
    triggerRivalLabBattle();
    return;
  }

  // C. Viridian City Old Man Roadblock (before coffee/parcel) & Catching Tutorial (after coffee/parcel) (scripts/ViridianCity.asm:65-175)
  if (zone.constName === "VIRIDIAN_CITY" && sx === 19 && sy === 9) {
    const oldManAwake = state.events.gotPokedex || state.events.gotOaksParcel;
    if (!oldManAwake) {
      audio.playSfx("bump");
      state.player.y = 10;
      state.player.renderY = 10;
      state.player.dir = "UP";
      renderAllCanvases(true);
      openDialogue(
        "VIRIDIAN GIRL",
        "Wait! Don't go out!\n\nOh Grandpa! Don't be so mean! He hasn't had his coffee yet.\n\nYou can't go through here until Grandpa wakes up!"
      );
      return;
    } else if (!state.events.seenOldManTutorial) {
      triggerViridianOldManTutorial();
      return;
    }
  }

  // Check if stepped onto a door / staircase warp
  const hitWarp = checkWarpAtStep(zone, sx, sy);
  if (hitWarp) {
    const ts = engine.tilesetsByConst[zone.tileset];
    const tileId = engine.getCollisionTileAtStep(zone, sx, sy);
    // In Gen 1, doors, stairs, and cave entrances warp immediately on step;
    // indoor exit mats at the bottom edge warp either on step or when pressing Down.
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
  if (state.wildEncountersEnabled) {
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

function checkInGameGiftOrEvent(npc, zone) {
  const upName = `${zone.constName} ${npc.name}`.toUpperCase();
  const giveGiftMon = (species, level) => {
    state.seenPokemon.add(species);
    state.caughtPokemon.add(species);
    if (!state.party.some((m) => m.species === species) && state.party.length < 6) {
      state.party.push(buildMonInstance(species, level));
    }
    saveProgress();
    updateUIForCurrentZone();
    return `\n\nRED received ${species.replace(/_/g, " ")} (:L${level})!`;
  };

  // 1. Summer Beach House Surfing Dude: teaches starter Pikachu SURF (BIT_PIKACHU_SPAWN_SURFING)
  if (zone.constName === "SUMMER_BEACH_HOUSE" && upName.includes("SURFIN")) {
    const pika = state.party.find((m) => m.species === "PIKACHU");
    if (pika && !pika.moves.some((mv) => mv.id === "SURF")) {
      const surfMove = getMoveObj("SURF");
      if (pika.moves.length < 4) {
        pika.moves.push(surfMove);
      } else {
        pika.moves[3] = surfMove;
      }
      syncPikachuOverworldState();
      return `\n\nPIKACHU learned SURF! Now PIKACHU can ride its surfboard on water!`;
    }
  }
  // 2. Canonical pret/pokeyellow Gift Pokémon scripts:
  if (zone.constName === "CERULEAN_MELANIES_HOUSE" && upName.includes("MELANIE")) {
    return giveGiftMon("BULBASAUR", 10); // scripts/CeruleanMelaniesHouse.asm:37
  }
  if (zone.constName === "ROUTE_24" && upName.includes("COOLTRAINER_M4")) {
    return giveGiftMon("CHARMANDER", 10); // scripts/Route24.asm:301
  }
  if (zone.constName === "VERMILION_CITY" && upName.includes("JENNY")) {
    return giveGiftMon("SQUIRTLE", 10); // scripts/VermilionCity_2.asm:24
  }
  if (zone.constName === "MT_MOON_POKECENTER" && upName.includes("MAGIKARP")) {
    return giveGiftMon("MAGIKARP", 5); // scripts/MtMoonPokecenter_2.asm:23
  }
  if (zone.constName === "SILPH_CO_7F" && upName.includes("WORKER_M1")) {
    return giveGiftMon("LAPRAS", 15); // scripts/SilphCo7F.asm:296
  }
  if (zone.constName === "CELADON_MANSION_ROOF_HOUSE" && upName.includes("EEVEE")) {
    return giveGiftMon("EEVEE", 25); // scripts/CeladonMansionRoofHouse.asm:16
  }
  if (zone.constName === "FIGHTING_DOJO" && upName.includes("HITMONLEE")) {
    return giveGiftMon("HITMONLEE", 30); // scripts/FightingDojo.asm:244
  }
  if (zone.constName === "FIGHTING_DOJO" && upName.includes("HITMONCHAN")) {
    return giveGiftMon("HITMONCHAN", 30); // scripts/FightingDojo.asm:278
  }
  // 3. Canonical Hidden Machine (HM01–HM05), Key Item & Ground Item Ball scripts:
  if (zone.constName === "SS_ANNE_CAPTAINS_ROOM" && upName.includes("CAPTAIN")) {
    giveBagItem("HM01_CUT", 1);
    return `\n\nRED received HM01 (CUT) from the CAPTAIN!`;
  }
  if (zone.constName === "ROUTE_16_FLY_HOUSE" && upName.includes("GIRL")) {
    giveBagItem("HM02_FLY", 1);
    return `\n\nRED received HM02 (FLY)!`;
  }
  if (zone.constName === "SAFARI_ZONE_SECRET_HOUSE" && upName.includes("GURU")) {
    giveBagItem("HM03_SURF", 1);
    return `\n\nRED received HM03 (SURF)!`;
  }
  if (zone.constName === "WARDENS_HOUSE" && upName.includes("WARDEN")) {
    giveBagItem("HM04_STRENGTH", 1);
    return `\n\nRED received HM04 (STRENGTH) from the WARDEN!`;
  }
  if (zone.constName === "ROUTE_2_GATE" && upName.includes("AIDE")) {
    giveBagItem("HM05_FLASH", 1);
    return `\n\nRED received HM05 (FLASH) from OAK's AIDE!`;
  }
  if (zone.constName === "SILPH_CO_11F" && upName.includes("PRESIDENT")) {
    giveBagItem("MASTER_BALL", 1);
    return `\n\nPRESIDENT: You saved SILPH CO. from TEAM ROCKET! Please take our secret prototype MASTER BALL!\n\nRED received a MASTER BALL!`;
  }
  if (zone.constName === "HALL_OF_FAME" && upName.includes("OAK")) {
    healParty();
    const partyNames = state.party.map((m) => `${m.nickname} (:L${m.level})`).join(", ");
    return `\n\nOAK: Heartfelt congratulations, RED! You and ${partyNames} are now officially recorded in the POKéMON LEAGUE HALL OF FAME!`;
  }
  if (zone.constName === "MR_FUJIS_HOUSE" && upName.includes("MR_FUJI")) {
    giveBagItem("POKE_FLUTE", 1);
    return `\n\nRED received a POKé FLUTE from MR. FUJI!`;
  }
  if (zone.constName === "ROUTE_1" && npc.name === "ROUTE1_YOUNGSTER1") {
    if (!state.events.gotPotionSample) {
      state.events.gotPotionSample = true;
      giveBagItem("POTION", 1);
      return `\n\nRED received a free sample POTION!`;
    }
    return `\n\nWe also carry POKé BALLs for catching POKéMON!`;
  }
  if (zone.constName === "VIRIDIAN_MART" && npc.sprite === "SPRITE_CLERK") {
    if (!state.events.gotOaksParcel) {
      state.events.gotOaksParcel = true;
      giveBagItem("OAKS_PARCEL", 1);
      return `\n\nYou came from PALLET TOWN? Here, please deliver OAK's PARCEL to PROF. OAK!\n\nRED got OAK's PARCEL!`;
    }
  }
  if (zone.constName === "OAKS_LAB" && npc.sprite === "SPRITE_OAK") {
    if (state.events.gotOaksParcel && !state.events.gotPokedex) {
      state.events.gotPokedex = true;
      state.bag = state.bag.filter((it) => it.id !== "OAKS_PARCEL");
      state.npcs.forEach((n) => {
        if (n.name === "OAKSLAB_POKEDEX1" || n.name === "OAKSLAB_POKEDEX2") {
          n.collected = true;
        }
      });
      giveBagItem("POKE_BALL", 5);
      return `\n\nOAK: Oh! That's the custom POKé BALL I ordered! Thank you, RED!\n\nRED delivered OAK's PARCEL and received a POKéDEX and 5 POKé BALLs!`;
    }
    return "";
  }
  if (npc.sprite === "SPRITE_CLERK") {
    giveBagItem("POKE_BALL", 5);
    giveBagItem("POTION", 3);
    if (zone.constName.startsWith("CELADON_MART")) {
      giveBagItem("FIRE_STONE", 1);
      giveBagItem("WATER_STONE", 1);
      giveBagItem("LEAF_STONE", 1);
      giveBagItem("THUNDER_STONE", 1);
    }
    return `\n\nPicked up POKé BALLs & POTIONs at the POKéMON MART!`;
  }
  if (npc.kind === "item" && npc.sprite === "SPRITE_POKE_BALL") {
    let foundKey = "POTION";
    if (upName.includes("MOON_STONE")) foundKey = "MOON_STONE";
    else if (upName.includes("FIRE_STONE")) foundKey = "FIRE_STONE";
    else if (upName.includes("WATER_STONE")) foundKey = "WATER_STONE";
    else if (upName.includes("LEAF_STONE")) foundKey = "LEAF_STONE";
    else if (upName.includes("THUNDER_STONE")) foundKey = "THUNDER_STONE";
    else if (upName.includes("RARE_CANDY")) foundKey = "RARE_CANDY";
    else if (upName.includes("FULL_RESTORE")) foundKey = "FULL_RESTORE";
    else if (upName.includes("SUPER_POTION") || upName.includes("MAX_POTION")) foundKey = "SUPER_POTION";
    else if (upName.includes("MASTER_BALL")) foundKey = "MASTER_BALL";
    else if (upName.includes("ULTRA_BALL")) foundKey = "ULTRA_BALL";
    else if (upName.includes("GREAT_BALL")) foundKey = "GREAT_BALL";
    else if (upName.includes("BALL")) foundKey = "POKE_BALL";
    const added = giveBagItem(foundKey, 1);
    if (added) {
      return `\n\nRED found ${added.name} and put it in the BAG!`;
    }
  }
  return "";
}

// Interact with what is in front of Red (A button / Space / Enter)
export function interactInFront() {
  if (state.battle) return;
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

  // 1. Check if facing following Pikachu!
  if (
    state.pikachu.visible &&
    state.pikachu.x === fx &&
    state.pikachu.y === fy
  ) {
    openPikachuInteraction();
    return;
  }

  // 2. Check Elevator control panel
  if (ELEVATOR_FLOORS[zone.constName]) {
    for (const s of zone.signs) {
      if (s.x === fx && s.y === fy) {
        openElevatorMenu(zone.constName);
        return;
      }
    }
  }

  // 3. Check Signs (bg_events)
  for (const s of zone.signs) {
    if (s.x === fx && s.y === fy) {
      audio.playSfx("blip");
      if (zone.constName === "GAME_CORNER" && s.x === 9 && s.y === 4) {
        openDialogue(
          "GAME CORNER POSTER",
          "Hey! A switch behind the poster!? Let's push it!\n\nWhoa! A secret staircase to the TEAM ROCKET HIDEOUT appeared!",
          {
            onComplete: () => {
              audio.playSfx("warp");
              loadZone("ROCKET_HIDEOUT_B1F", { warpIndex: 0 });
            },
          }
        );
        return;
      }
      openDialogue("SIGNPOST", s.text);
      return;
    }
  }

  // 4. Check NPCs / Items (including 2 steps away across counter tiles in PokéCenters & Marts!)
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
        if (npc.sprite === "SPRITE_BOULDER") {
          audio.playSfx("blip");
          if (state.strengthActive) {
            openDialogue(
              "BOULDER",
              "STRENGTH made it possible to move boulders around! Walk into the boulder to push it."
            );
          } else {
            openDialogue(
              "BOULDER",
              "It's a big boulder, but a POKéMON may be able to move it.",
              hasHmOrMove("STRENGTH")
                ? {
                    fieldMoveAction: {
                      label: "🪨 USE HM04 STRENGTH",
                      moveId: "STRENGTH",
                    },
                  }
                : {}
            );
          }
          return;
        }
        triggerNpcDialogue(npc, zone);
        return;
      }
    }
  }

  // 5. Check HM overworld obstacles in front of Red (Cuttable Tree or Water Shoreline)
  if (fx >= 0 && fx < zone.width * 2 && fy >= 0 && fy < zone.height * 2) {
    if (isCuttableTreeTile(zone, frontTile)) {
      audio.playSfx("blip");
      openDialogue(
        "SMALL TREE",
        "This tree can be CUT!",
        hasHmOrMove("CUT")
          ? {
              fieldMoveAction: {
                label: "🌳 USE HM01 CUT",
                moveId: "CUT",
              },
            }
          : {}
      );
      return;
    }
    if (isWaterTile(zone, frontTile) && state.player.mode !== "surf") {
      audio.playSfx("blip");
      openDialogue(
        "WATER'S EDGE",
        "The water is calm and dyed a deep blue.",
        hasHmOrMove("SURF")
          ? {
              fieldMoveAction: {
                label: "🌊 USE HM03 SURF",
                moveId: "SURF",
              },
            }
          : {}
      );
      return;
    }
  }
}

export function triggerNpcDialogue(npc, zone = state.currentZone) {
  if (!npc || !zone) return;
  // Turn NPC toward player (unless inanimate item ball / map book)
  if (
    npc.kind !== "item" &&
    npc.sprite !== "SPRITE_POKE_BALL" &&
    npc.sprite !== "SPRITE_POKEDEX" &&
    npc.sprite !== "SPRITE_BOOK_MAP_DEX"
  ) {
    const opp = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    npc.facing = opp[state.player.dir] || "DOWN";
  }

  //Only actual Poké Ball ground items disappear when picked up; NPCs NEVER disappear!
  // (Except OAKSLAB_EEVEE_POKE_BALL before Oak's Lab event, which belongs to Oak/Blue)
  if (
    npc.kind === "item" &&
    npc.sprite === "SPRITE_POKE_BALL" &&
    npc.name !== "OAKSLAB_EEVEE_POKE_BALL"
  ) {
    npc.collected = true;
  }

  // Authentic Oak's Lab Eevee Poké Ball & Starter Pikachu event (scripts/OaksLab.asm)
  if (zone.constName === "OAKS_LAB") {
    if (npc.name === "OAKSLAB_EEVEE_POKE_BALL") {
      audio.playSfx("blip");
      if (state.events.oakRescuedInGrass && !state.events.gotStarterPikachu) {
        openDialogue(
          "PROF. OAK'S LAB",
          "BLUE: No fair! Gramps, I want this one!\n\nBLUE pushed RED aside and snatched the POKé BALL! BLUE received an EEVEE!\n\nOAK: BLUE! What are you doing?! ...RED, this is the wild POKéMON I caught earlier in the tall grass. You can have it!\n\nRED received a PIKACHU (:L5)!",
          {
            onComplete: () => {
              awardStarterPikachuInLab();
            },
          }
        );
      } else {
        openDialogue(
          "POKé BALL",
          "That's a POKé BALL. There's a POKéMON inside! PROF. OAK isn't here right now."
        );
      }
      return;
    }
    if (
      npc.name === "OAKSLAB_OAK1" &&
      state.events.oakRescuedInGrass &&
      !state.events.gotStarterPikachu
    ) {
      audio.playSfx("blip");
      openDialogue(
        "PROF. OAK",
        "OAK: Here, RED! Go ahead and take that POKé BALL!\n\nBLUE: No fair! I want this one! BLUE snatched the EEVEE!\n\nOAK: RED, take this wild PIKACHU I caught earlier!\n\nRED received a PIKACHU (:L5)!",
        {
          onComplete: () => {
            awardStarterPikachuInLab();
          },
        }
      );
      return;
    }
  }

  // Viridian City Old Man Pokémon Catching Tutorial (scripts/ViridianCity.asm)
  if (zone.constName === "VIRIDIAN_CITY") {
    if (
      npc.name === "VIRIDIANCITY_OLD_MAN" ||
      npc.name === "VIRIDIANCITY_OLD_MAN2"
    ) {
      triggerViridianOldManTutorial();
      return;
    }
  }

  // Bill's House Teleporter Experiment (scripts/BillsHouse.asm)
  if (zone.constName === "BILLS_HOUSE") {
    if (npc.name === "BILLSHOUSE_BILL_POKEMON") {
      audio.playSfx("warp");
      state.events.helpedBill = true;
      npc.collected = true;
      const humanBill = state.npcs.find((n) => n.name === "BILLSHOUSE_BILL1");
      if (humanBill) humanBill.defaultVisible = true;
      giveBagItem("SS_TICKET", 1);
      renderAllCanvases(true);
      openDialogue(
        "BILL — POKéMANIAC",
        "Hiya! I'm a POKéMON... No I'm not! Call me BILL!\n\nMy TELEPORTER experiment combined me with a POKéMON! Thanks for running the Cell Separator!\n\nTake this S.S. TICKET for the S.S. ANNE in VERMILION CITY!\n\nRED received an S.S. TICKET!"
      );
      return;
    }
    if (npc.name === "BILLSHOUSE_BILL1") {
      audio.playSfx("blip");
      giveBagItem("SS_TICKET", 1);
      openDialogue(
        "BILL",
        "Thanks again, bud! Use that S.S. TICKET to board the S.S. ANNE at VERMILION HARBOR!"
      );
      return;
    }
  }

  // Sleeping Snorlax on Route 12 & Route 16 (scripts/Route12.asm & scripts/Route16.asm)
  if (
    (zone.constName === "ROUTE_12" && npc.name === "ROUTE12_SNORLAX") ||
    (zone.constName === "ROUTE_16" && npc.name === "ROUTE16_SNORLAX")
  ) {
    const hasFlute = state.bag.some((it) => it.id === "POKE_FLUTE");
    if (!hasFlute) {
      audio.playSfx("blip");
      openDialogue(
        "SLEEPING SNORLAX",
        "A giant SNORLAX is sleeping peacefully blocking the road!\n\nYou need the POKé FLUTE from MR. FUJI in LAVENDER TOWN to wake it up."
      );
      return;
    }
    audio.playSfx("pika");
    npc.collected = true;
    if (zone.constName === "ROUTE_12") {
      state.events.wokeRoute12Snorlax = true;
    } else {
      state.events.wokeRoute16Snorlax = true;
    }
    saveProgress();
    renderAllCanvases(true);
    openDialogue(
      "POKé FLUTE",
      "RED played the POKé FLUTE!\n\nSNORLAX woke up in a grumpy rage and attacked!",
      {
        onComplete: () => {
          triggerWildEncounter([30, "SNORLAX"]);
        },
      }
    );
    return;
  }

  // Pokémon Tower 7F — Rescuing Mr. Fuji (scripts/PokemonTower7F.asm)
  if (zone.constName === "POKEMON_TOWER_7F" && npc.name === "POKEMONTOWER7F_MR_FUJI") {
    audio.playSfx("warp");
    state.events.rescuedMrFuji = true;
    giveBagItem("POKE_FLUTE", 1);
    openDialogue(
      "MR. FUJI",
      "MR. FUJI: Thank you for rescuing me from TEAM ROCKET!\n\nCome with me to my home at the foot of POKéMON TOWER. Please take this POKé FLUTE!\n\nRED received a POKé FLUTE!",
      {
        onComplete: () => {
          loadZone("MR_FUJIS_HOUSE", { warpIndex: 0 });
        },
      }
    );
    return;
  }

  // Authentic BluesHouse.asm Daisy & Town Map script (scripts/BluesHouse.asm:26-88)
  if (zone.constName === "BLUES_HOUSE") {
    if (npc.name === "BLUESHOUSE_DAISY1") {
      audio.playSfx("blip");
      if (!state.events.gotTownMap) {
        state.events.gotTownMap = true;
        // Hide TOGGLE_TOWN_MAP (BLUESHOUSE_TOWN_MAP at (3,3)) while keeping Daisy visible!
        const townMapObj = state.npcs.find((o) => o.name === "BLUESHOUSE_TOWN_MAP");
        if (townMapObj) {
          townMapObj.collected = true;
        }
        if (!state.bag.some((it) => it.id === "TOWN_MAP")) {
          state.bag.push({ id: "TOWN_MAP", name: "TOWN MAP", qty: 1, kind: "map" });
        }
        updateUIForCurrentZone();
        openDialogue(
          "DAISY OAK",
          "Grandpa asked you to run an errand? Here, this will help you!\n\nRED got a TOWN MAP!"
        );
      } else {
        openDialogue(
          "DAISY OAK",
          "Use the TOWN MAP to find out where you are."
        );
      }
      return;
    }
    if (npc.name === "BLUESHOUSE_DAISY2") {
      audio.playSfx("blip");
      openDialogue(
        "DAISY OAK",
        "Spending time with your POKéMON makes them more friendly to you."
      );
      return;
    }
    if (npc.name === "BLUESHOUSE_TOWN_MAP") {
      audio.playSfx("blip");
      openDialogue("TOWN MAP", "It's a big map! This is useful!");
      return;
    }
  }

  if (npc.sprite === "SPRITE_NURSE" || npc.sprite === "SPRITE_MOM") {
    healParty();
  }
  const giftSuffix = checkInGameGiftOrEvent(npc, zone);
  audio.playSfx("blip");
  const trainerEntry = getTrainerBattleEntry(npc, zone);
  const npcKey = `${zone.constName}:${npc.name}:${npc.id}`;
  const isDefeated = state.defeatedTrainers.has(npcKey);
  const baseText =
    isDefeated && npc.battle?.afterBattleText
      ? npc.battle.afterBattleText
      : npc.text;
  openDialogue(npc.name.replace(/_/g, " "), baseText + giftSuffix, {
    trainerBattle: trainerEntry,
  });
}

export function awardStarterPikachuInLab() {
  state.events.oakRescuedInGrass = true;
  state.events.gotStarterPikachu = true;
  if (!state.party.some((m) => m.species === "PIKACHU")) {
    state.party.unshift(buildMonInstance("PIKACHU", 5));
  }
  state.caughtPokemon.add("PIKACHU");
  state.seenPokemon.add("PIKACHU");
  state.seenPokemon.add("EEVEE");
  const eeveeBall = state.npcs.find((n) => n.name === "OAKSLAB_EEVEE_POKE_BALL");
  if (eeveeBall) eeveeBall.collected = true;
  const oak1 = state.npcs.find((n) => n.name === "OAKSLAB_OAK1");
  if (oak1) oak1.defaultVisible = true;
  state.pikachu.x = Math.max(0, state.player.x - 1);
  state.pikachu.y = state.player.y;
  state.pikachu.renderX = state.pikachu.x;
  state.pikachu.renderY = state.pikachu.y;
  state.pikachu.dir = "RIGHT";
  state.pikachu.spawnDelayed = false;
  syncPikachuOverworldState();
  triggerEmote("heart", 2600);
  audio.playSfx("pika");
  saveProgress();
  updateUIForCurrentZone();
  renderAllCanvases(true);
}

export function startScriptedCatchScene(mode = "OAK_PIKACHU") {
  heldDirs.clear();
  if (state.dialogue) {
    state.dialogue = null;
    renderDialogueModal();
  }
  const isOak = mode === "OAK_PIKACHU";
  const foeMon = buildMonInstance(isOak ? "PIKACHU" : "RATTATA", 5);
  state.seenPokemon.add(foeMon.species);
  saveProgress();
  const demoPlayerMon = {
    species: isOak ? "PROF_OAK" : "OLD_MAN",
    nickname: isOak ? "PROF. OAK" : "OLD MAN",
    level: 5,
    hp: 20,
    maxHp: 20,
    atk: 15,
    def: 15,
    spd: 15,
    spc: 15,
    types: ["NORMAL"],
    status: "OK",
    moves: [getMoveObj("TACKLE")],
    trainerSpriteKey: isOak ? "PROF_OAK" : "GAMBLER",
  };

  const messages = isOak
    ? [
        `Wild PIKACHU\nappeared!`,
        `PROF. OAK used\nPOKé BALL!`,
        `All right! PIKACHU\nwas caught!`,
        `OAK: Whew... That\nwas close!`,
        `Wild POKéMON live in\ntall grass! Come with\nme to my POKéMON LAB!`,
      ]
    : [
        `Wild RATTATA\nappeared!`,
        `OLD MAN: First, you\nneed to weaken the\ntarget POKéMON!`,
        `OLD MAN used\nPOKé BALL!`,
        `All right! RATTATA\nwas caught!`,
        `OLD MAN: And that's\nhow you catch POKéMON!`,
      ];

  state.battle = {
    isTrainer: false,
    isSafari: false,
    isScriptedCatch: true,
    scriptedMode: mode,
    demoPlayerMon,
    safariBalls: 30,
    trainerName: null,
    trainerSprite: null,
    trainerKey: null,
    endBattleText: null,
    enemyParty: [foeMon],
    activeEnemyIdx: 0,
    activePlayerIdx: 0,
    species: foeMon.species,
    level: foeMon.level,
    hp: foeMon.hp,
    maxHp: foeMon.maxHp,
    playerHp: demoPlayerMon.hp,
    playerMaxHp: demoPlayerMon.maxHp,
    menuState: "MESSAGE",
    mainCursor: 0,
    moveCursor: 0,
    moveSwapIndex: null,
    bagCursor: 0,
    partyCursor: 0,
    partySubCursor: 0,
    forcedSwitch: false,
    showTrainerSprite: false,
    log: messages[0],
    messageQueue: messages.slice(1),
    finished: true,
    onComplete: isOak
      ? () => {
          state.events.oakRescuedInGrass = true;
          loadZone("OAKS_LAB", { x: 5, y: 3, dir: "UP" });
          openDialogue(
            "PROF. OAK'S LAB — INTRO EVENT",
            "BLUE: Gramps! I'm fed up with waiting!\n\nOAK: Let me think... Oh, that's right, I told you to come! Just wait!\n\nOAK: Here, RED! There is 1 POKéMON left inside this POKé BALL on the table. Go ahead, it's yours!\n\nBLUE: No fair! Gramps, I want this one! BLUE pushed RED aside and snatched the POKé BALL! BLUE received an EEVEE!\n\nOAK: BLUE! What are you doing?! ...RED, this is the wild POKéMON I caught earlier in the tall grass. You can have it!\n\nRED received a PIKACHU (:L5)!",
            {
              onComplete: () => {
                awardStarterPikachuInLab();
              },
            }
          );
        }
      : () => {
          state.events.seenOldManTutorial = true;
          saveProgress();
          openDialogue(
            "VIRIDIAN OLD MAN",
            "If the target POKéMON is tough to catch, weaken it or inflict a status like SLEEP or PARALYSIS first!"
          );
        },
  };
  audio.playSfx("thunder");
  renderBattleModal();
}

export function triggerOakIntroGrassEvent() {
  const zone = state.currentZone;
  if (!zone || zone.constName !== "PALLET_TOWN") return;
  const oakObj = state.npcs.find((n) => n.name === "PALLETTOWN_OAK");
  if (oakObj) {
    oakObj.defaultVisible = true;
    oakObj.x = state.player.x;
    oakObj.y = Math.min(zone.height * 2 - 1, state.player.y + 1);
    oakObj.renderX = oakObj.x;
    oakObj.renderY = oakObj.y;
    oakObj.facing = "UP";
  }
  state.player.dir = "DOWN";
  renderAllCanvases(true);
  audio.playSfx("blip");
  openDialogue(
    "PROF. OAK",
    "OAK: Hey! Wait! Don't go out!\n\nOAK: It's unsafe! Wild POKéMON live in tall grass!",
    {
      onComplete: () => {
        startScriptedCatchScene("OAK_PIKACHU");
      },
    }
  );
}

export function triggerRivalLabBattle() {
  state.events.battledRivalInLab = true;
  saveProgress();
  const rival = state.npcs.find((n) => n.name === "OAKSLAB_RIVAL");
  if (rival) {
    rival.x = state.player.x;
    rival.y = Math.max(0, state.player.y - 1);
    rival.renderX = rival.x;
    rival.renderY = rival.y;
    rival.facing = "DOWN";
  }
  state.player.dir = "UP";
  renderAllCanvases(true);
  audio.playSfx("blip");
  const tb = {
    key: "OAKS_LAB:OAKSLAB_RIVAL:1",
    isWild: false,
    trainerClass: "RIVAL1",
    trainerName: "RIVAL BLUE",
    trainerSprite: "RIVAL1",
    party: [[5, "EEVEE"]],
    species: "EEVEE",
    level: 5,
    battleText: "Wait RED! Let's check out our POKéMON!",
    endBattleText: "WHAT? Unbelievable! I picked the wrong POKéMON!",
  };
  openDialogue(
    "RIVAL BLUE",
    "BLUE: Wait RED! Let's check out our POKéMON!\n\nCome on, I'll take you on!",
    {
      trainerBattle: tb,
      onComplete: () => {
        triggerWildEncounter([5, "EEVEE"], tb);
      },
    }
  );
}

export function triggerViridianOldManTutorial() {
  audio.playSfx("blip");
  openDialogue(
    "VIRIDIAN OLD MAN",
    "OLD MAN: Ahh, I've had my coffee now and I feel great!\n\nSure, you can go through! Wait! Are you in a hurry?\n\nI'll show you how to catch POKéMON — watch what I do!",
    {
      onComplete: () => {
        startScriptedCatchScene("OLD_MAN");
      },
    }
  );
}

export function openPikachuInteraction() {
  if (!isStarterPikachuAlive()) {
    audio.playSfx("bump");
    openDialogue(
      "PIKACHU",
      "Walk into the tall grass at the north exit of PALLET TOWN to meet PROF. OAK and receive your starter PIKACHU!"
    );
    return;
  }
  const opp = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  state.pikachu.dir = opp[state.player.dir] || "DOWN";
  const f = state.pikachu.friendship;
  const mood =
    PIKACHU_HAPPINESS_TIERS.find((t) => f <= t.maxFriendship) ||
    PIKACHU_HAPPINESS_TIERS[PIKACHU_HAPPINESS_TIERS.length - 1];
  state.pikachu.moodIndex++;
  // Talking to Pikachu builds bond (+5 friendship) after displaying current friendship
  const shownFriendship = state.pikachu.friendship;
  modifyPikachuHappiness("USEDITEM");
  triggerEmote(mood.emote, 2400);
  audio.playSfx("pika");
  openDialogue(
    `${mood.title} (Friendship: ${shownFriendship}/255)`,
    mood.text,
    { pikachuMood: mood }
  );
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
  heldDirs.clear();
  if (state.startMenu.open) {
    state.startMenu.open = false;
    state.startMenu.subView = null;
    state.startMenu.selectedDexSpecies = null;
    renderStartMenu();
  }
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
    const onComplete = state.dialogue.onComplete;
    state.dialogue = null;
    renderDialogueModal();
    if (typeof onComplete === "function") {
      onComplete();
    }
  }
}

function getTypeEffectiveness(moveType, defTypes) {
  let mult = 1.0;
  const chart = POKEYELLOW_DATA.battle?.typeChart || [];
  for (const dt of defTypes || []) {
    for (const [atkT, defT, m] of chart) {
      if (atkT === moveType && defT === dt) {
        mult *= m;
      }
    }
  }
  return mult;
}

function calcGen1Damage(attacker, defender, move) {
  if (!move || move.power === 0) {
    return { damage: 0, effectiveness: 1.0, crit: false };
  }
  if (move.effect === "SPECIAL_DAMAGE_EFFECT") {
    const fixed =
      move.id === "SONICBOOM"
        ? 20
        : move.id === "DRAGON_RAGE"
        ? 40
        : attacker.level;
    return { damage: fixed, effectiveness: 1.0, crit: false };
  }
  // Gen 1 critical hit rate based on base Speed
  const critChance = Math.min(0.25, (attacker.spd || 50) / 512);
  const crit = Math.random() < critChance;
  const lv = crit ? attacker.level * 2 : attacker.level;

  const isSpecial = SPECIAL_TYPES.has(move.type);
  const A = isSpecial ? attacker.spc : attacker.atk;
  const D = Math.max(1, isSpecial ? defender.spc : defender.def);

  let baseDmg = Math.floor(
    Math.floor((Math.floor((2 * lv) / 5 + 2) * move.power * A) / D) / 50
  ) + 2;

  // STAB (Same-Type Attack Bonus)
  if (attacker.types && attacker.types.includes(move.type)) {
    baseDmg = Math.floor(baseDmg * 1.5);
  }

  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  if (effectiveness === 0) {
    return { damage: 0, effectiveness: 0, crit: false };
  }
  baseDmg = Math.floor(baseDmg * effectiveness);

  // Random variance (217..255)/255
  const rand = 217 + Math.floor(Math.random() * 39);
  const finalDmg = Math.max(1, Math.floor((baseDmg * rand) / 255));
  return { damage: finalDmg, effectiveness, crit };
}

export function triggerWildEncounter(poolOrEntry, trainerMeta = null) {
  heldDirs.clear();
  if (state.dialogue) {
    state.dialogue = null;
    renderDialogueModal();
  }
  if (state.startMenu.open) {
    state.startMenu.open = false;
    state.startMenu.subView = null;
    state.startMenu.selectedDexSpecies = null;
    renderStartMenu();
  }
  if (state.player.moveAnim) {
    state.player.x = state.player.moveAnim.toX;
    state.player.y = state.player.moveAnim.toY;
    state.player.renderX = state.player.x;
    state.player.renderY = state.player.y;
    state.player.walking = false;
    state.player.moveAnim = null;
  }
  if (state.pikachu.moveAnim) {
    state.pikachu.x = state.pikachu.moveAnim.toX;
    state.pikachu.y = state.pikachu.moveAnim.toY;
    state.pikachu.renderX = state.pikachu.x;
    state.pikachu.renderY = state.pikachu.y;
    state.pikachu.walking = false;
    state.pikachu.moveAnim = null;
  }

  initDefaultParty();
  // Ensure at least one party Pokémon is conscious
  if (state.party.every((m) => m.hp <= 0)) {
    healParty();
  }
  const activePlayerIdx = Math.max(
    0,
    state.party.findIndex((m) => m.hp > 0)
  );

  let enemyParty = [];
  if (trainerMeta && Array.isArray(trainerMeta.party) && trainerMeta.party.length > 0) {
    enemyParty = trainerMeta.party.map(([lv, sp]) => buildMonInstance(sp, lv));
  } else {
    let level = 5;
    let species = "PIDGEY";
    if (Array.isArray(poolOrEntry) && poolOrEntry.length > 0 && Array.isArray(poolOrEntry[0])) {
      const pick = poolOrEntry[Math.floor(Math.random() * poolOrEntry.length)];
      level = pick[0] ?? 5;
      species = pick[1] || "PIDGEY";
    } else if (Array.isArray(poolOrEntry) && poolOrEntry.length >= 2) {
      level = poolOrEntry[0] ?? 5;
      species = poolOrEntry[1] || "PIDGEY";
    } else if (typeof poolOrEntry === "string" && poolOrEntry.trim()) {
      species = poolOrEntry.trim().toUpperCase();
    } else if (poolOrEntry && typeof poolOrEntry === "object" && poolOrEntry.species) {
      species = poolOrEntry.species;
      level = poolOrEntry.level ?? 5;
    }
    enemyParty = [buildMonInstance(species, level)];
  }

  const isTrainer = Boolean(trainerMeta && !trainerMeta.isWild && trainerMeta.trainerName);
  const isSafari =
    !isTrainer &&
    state.currentZone &&
    state.currentZone.constName.startsWith("SAFARI_ZONE");

  const firstFoe = enemyParty[0];
  if (firstFoe?.species) {
    state.seenPokemon.add(firstFoe.species);
    saveProgress();
  }
  const pMon = state.party[activePlayerIdx];

  // Open directly in MAIN_MENU (DisplayBattleMenu in engine/battle/core.asm) with intro banner text
  const introLog = isTrainer
    ? `${trainerMeta.trainerName} sent out\n${firstFoe.nickname}!`
    : `Wild ${firstFoe.nickname}\nappeared!`;

  state.battle = {
    isTrainer,
    isSafari,
    safariBalls: 30,
    trainerName: isTrainer ? trainerMeta.trainerName : null,
    trainerSprite: trainerMeta?.trainerSprite || null,
    trainerKey: trainerMeta?.key || null,
    endBattleText: trainerMeta?.endBattleText || null,
    enemyParty,
    activeEnemyIdx: 0,
    activePlayerIdx,
    // Compatibility properties for HUD / tests
    species: firstFoe.species,
    level: firstFoe.level,
    hp: firstFoe.hp,
    maxHp: firstFoe.maxHp,
    playerHp: pMon.hp,
    playerMaxHp: pMon.maxHp,
    // Authentic engine/battle/core.asm menu state machine:
    // "MAIN_MENU" | "FIGHT_MENU" | "BAG_MENU" | "PARTY_MENU" | "PARTY_SUB" | "PARTY_STATS" | "MESSAGE"
    menuState: "MAIN_MENU",
    mainCursor: 0, // 0: FIGHT, 1: PKMN, 2: ITEM, 3: RUN
    moveCursor: 0, // 0..3
    moveSwapIndex: null, // SELECT key move swap index (SwapMovesInMenu)
    bagCursor: 0,
    partyCursor: activePlayerIdx,
    partySubCursor: 0, // 0: SWITCH, 1: STATS, 2: CANCEL
    forcedSwitch: false,
    showTrainerSprite: false,
    log: introLog,
    messageQueue: [],
    finished: false,
  };
  audio.playSfx("thunder");
  renderBattleModal();
}

function syncBattleTopLevelProps(b) {
  if (!b) return;
  const foe = b.enemyParty[b.activeEnemyIdx] || b.enemyParty[0];
  const pMon =
    b.demoPlayerMon || state.party[b.activePlayerIdx] || state.party[0];
  if (foe) {
    b.species = foe.species;
    b.level = foe.level;
    b.hp = foe.hp;
    b.maxHp = foe.maxHp;
  }
  if (pMon) {
    b.playerHp = pMon.hp;
    b.playerMaxHp = pMon.maxHp;
  }
}

function startEvolutionAnimation(evoStep) {
  const b = state.battle;
  if (!b || !evoStep || !evoStep.mon) return;
  const mon = evoStep.mon;
  const targetKey = String(evoStep.target || "").toUpperCase();
  b.evolution = {
    mon,
    oldSpecies: mon.species,
    oldName: mon.nickname,
    newSpecies: targetKey,
    newName: targetKey.replace(/_/g, " "),
    startTime: performance.now(),
    duration: 2800,
    cancelled: false,
    completed: false,
  };
  b.menuState = "EVOLVING";
  b.log = `What? ${mon.nickname}\nis evolving! (Press B to stop)`;
  audio.playSfx("pika");
  renderBattleModal();
}

export function cancelEvolutionAnimation() {
  // Matches Evolution_CheckForCancel -> .evolutionCancelled -> CancelledEvolution
  // (engine/movie/evolution.asm:138-156 & engine/pokemon/evos_moves.asm:137)
  const b = state.battle;
  if (!b || b.menuState !== "EVOLVING" || !b.evolution) return false;
  const evo = b.evolution;
  evo.cancelled = true;
  b.evolution = null;
  audio.playSfx("bump");
  b.log = `Huh? ${evo.oldName}\nstopped evolving!`;
  b.menuState = "MESSAGE";
  syncBattleTopLevelProps(b);
  renderBattleModal();
  return true;
}

export function completeEvolutionAnimation() {
  // Completes EvolveMon (engine/movie/evolution.asm:60-72 & engine/pokemon/evos_moves.asm:138-239)
  const b = state.battle;
  if (!b || b.menuState !== "EVOLVING" || !b.evolution) return false;
  const evo = b.evolution;
  b.evolution = null;
  const evoMsgs = [];
  evolvePokemon(evo.mon, evo.newSpecies, evoMsgs, { skipIntroText: true });
  audio.playSfx("warp");
  syncBattleTopLevelProps(b);
  if (evoMsgs.length > 0) {
    b.log = evoMsgs[0];
    b.messageQueue = [...evoMsgs.slice(1), ...(b.messageQueue || [])];
  } else {
    b.log = `${evo.oldName} evolved\ninto ${evo.newName}!`;
  }
  b.menuState = "MESSAGE";
  renderBattleModal();
  return true;
}

function queueBattleMessages(messages, afterState = "MAIN_MENU") {
  const b = state.battle;
  if (!b) return;
  const clean = messages.filter(Boolean);
  if (clean.length === 0) {
    b.menuState = afterState;
    renderBattleModal();
    return;
  }
  b.afterMessageState = afterState;
  const first = clean[0];
  b.messageQueue = clean.slice(1);
  if (typeof first === "object" && first.type === "EVOLVE") {
    startEvolutionAnimation(first);
    return;
  }
  b.log = first;
  b.menuState = "MESSAGE";
  renderBattleModal();
}

function advanceBattleMessage() {
  const b = state.battle;
  if (!b) return;
  if (b.messageQueue && b.messageQueue.length > 0) {
    const nextItem = b.messageQueue.shift();
    if (typeof nextItem === "object" && nextItem.type === "EVOLVE") {
      startEvolutionAnimation(nextItem);
      return;
    }
    audio.playSfx("blip");
    b.log = nextItem;
    renderBattleModal();
    return;
  }
  if (b.finished) {
    const onComplete = b.onComplete;
    state.battle = null;
    renderBattleModal();
    if (typeof onComplete === "function") {
      onComplete();
    }
    return;
  }
  if (b.forcedSwitch) {
    b.menuState = "PARTY_MENU";
    renderBattleModal();
    return;
  }
  b.showTrainerSprite = false;
  b.menuState = b.afterMessageState || "MAIN_MENU";
  renderBattleModal();
}

function performMoveAttack(attacker, defender, move, isEnemyTurn = false) {
  const msgs = [];
  const prefix = isEnemyTurn ? `Enemy ${attacker.nickname}` : attacker.nickname;

  if (attacker.status === "SLP") {
    if (Math.random() < 0.35) {
      attacker.status = "OK";
      msgs.push(`${prefix}\nwoke up!`);
    } else {
      msgs.push(`${prefix}\nis fast asleep!`);
      return msgs;
    }
  }
  if (attacker.status === "FRZ") {
    msgs.push(`${prefix}\nis frozen solid!`);
    return msgs;
  }
  if (attacker.status === "PAR" && Math.random() < 0.25) {
    msgs.push(`${prefix}'s\nfully paralyzed!`);
    return msgs;
  }

  if (move.pp > 0) move.pp--;
  msgs.push(`${prefix} used\n${move.name}!`);

  // Check accuracy
  if (Math.random() * 100 > (move.accuracy || 100)) {
    msgs.push(`${prefix}'s\nattack missed!`);
    return msgs;
  }

  // Status-only moves
  const effect = String(move.effect || "");
  if (move.power === 0) {
    if (effect.includes("PARALYZE") || move.id === "THUNDER_WAVE" || move.id === "STUN_SPORE" || move.id === "GLARE") {
      if (defender.status === "OK") {
        defender.status = "PAR";
        msgs.push(`${defender.nickname} was\nparalyzed! It may not attack!`);
      } else {
        msgs.push(`But it failed!`);
      }
    } else if (effect.includes("SLEEP") || move.id === "SLEEP_POWDER" || move.id === "SING" || move.id === "HYPNOSIS" || move.id === "SPORE") {
      if (defender.status === "OK") {
        defender.status = "SLP";
        msgs.push(`${defender.nickname}\nfell asleep!`);
      } else {
        msgs.push(`But it failed!`);
      }
    } else if (effect.includes("POISON") || move.id === "POISONPOWDER" || move.id === "TOXIC") {
      if (defender.status === "OK") {
        defender.status = "PSN";
        msgs.push(`${defender.nickname}\nwas poisoned!`);
      } else {
        msgs.push(`But it failed!`);
      }
    } else if (move.id === "RECOVER" || move.id === "SOFTBOILED" || move.id === "REST") {
      attacker.hp = attacker.maxHp;
      msgs.push(`${prefix}\nregained health!`);
    } else if (effect.includes("DEFENSE_DOWN")) {
      defender.def = Math.max(5, Math.floor(defender.def * 0.8));
      msgs.push(`${defender.nickname}'s\nDEFENSE fell!`);
    } else if (effect.includes("ATTACK_DOWN")) {
      defender.atk = Math.max(5, Math.floor(defender.atk * 0.8));
      msgs.push(`${defender.nickname}'s\nATTACK fell!`);
    } else {
      attacker.spd = Math.min(999, Math.floor(attacker.spd * 1.25));
      msgs.push(`${prefix}'s\nstats rose!`);
    }
    return msgs;
  }

  // Damaging move
  const { damage, effectiveness, crit } = calcGen1Damage(attacker, defender, move);
  if (effectiveness === 0) {
    msgs.push(`It doesn't affect\n${defender.nickname}!`);
    return msgs;
  }

  defender.hp = Math.max(0, defender.hp - damage);
  if (crit) {
    msgs.push(`Critical hit!`);
  }
  if (effectiveness > 1) {
    msgs.push(`It's super effective!`);
  } else if (effectiveness < 1) {
    msgs.push(`It's not very effective...`);
  }

  // Secondary status effects
  if (defender.hp > 0 && defender.status === "OK") {
    if (effect.includes("PARALYZE_SIDE_EFFECT") && Math.random() < 0.2) {
      defender.status = "PAR";
      msgs.push(`${defender.nickname} was\nparalyzed!`);
    } else if (effect.includes("BURN_SIDE_EFFECT") && Math.random() < 0.2) {
      defender.status = "BRN";
      msgs.push(`${defender.nickname} was\nburned!`);
    } else if (effect.includes("POISON_SIDE_EFFECT") && Math.random() < 0.25) {
      defender.status = "PSN";
      msgs.push(`${defender.nickname} was\npoisoned!`);
    } else if (effect.includes("FREEZE_SIDE_EFFECT") && Math.random() < 0.1) {
      defender.status = "FRZ";
      msgs.push(`${defender.nickname} was\nfrozen solid!`);
    }
  }

  // Drain moves
  if (effect === "DRAIN_HP_EFFECT" && damage > 0) {
    const healed = Math.max(1, Math.floor(damage / 2));
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healed);
    msgs.push(`Sucked health from\n${defender.nickname}!`);
  } else if (effect === "RECOIL_EFFECT" && damage > 0) {
    const recoil = Math.max(1, Math.floor(damage / 4));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    msgs.push(`${prefix}'s hit\nwith recoil!`);
  }

  return msgs;
}

export function evolvePokemon(mon, newSpeciesKey, msgs = [], options = {}) {
  // Matches TryEvolvingMon & EvolveMon (engine/pokemon/evos_moves.asm:111-239)
  const targetKey = String(newSpeciesKey || "").toUpperCase();
  const newBase = POKEYELLOW_DATA.battle?.pokemonStats?.[targetKey];
  if (!mon || !newBase) return false;

  const oldName = mon.nickname;
  const newName = targetKey.replace(/_/g, " ");
  if (!options.skipIntroText) {
    msgs.push(`What? ${oldName}\nis evolving!`);
  }

  const lv = mon.level;
  const oldMaxHp = mon.maxHp;
  const newMaxHp = Math.floor(((newBase.hp + 15) * 2 * lv) / 100) + lv + 10;
  const hpDiff = Math.max(0, newMaxHp - oldMaxHp);

  mon.species = targetKey;
  if (oldName === oldName.toUpperCase()) {
    mon.nickname = newName; // RenameEvolvedMon (engine/pokemon/evos_moves.asm:159)
  }
  mon.maxHp = newMaxHp;
  mon.hp = Math.min(newMaxHp, mon.hp + hpDiff); // engine/pokemon/evos_moves.asm:188-206
  mon.atk = Math.floor(((newBase.atk + 15) * 2 * lv) / 100) + 5;
  mon.def = Math.floor(((newBase.def + 15) * 2 * lv) / 100) + 5;
  mon.spd = Math.floor(((newBase.spd + 15) * 2 * lv) / 100) + 5;
  mon.spc = Math.floor(((newBase.spc + 15) * 2 * lv) / 100) + 5;
  mon.types = newBase.types || ["NORMAL"];
  mon.catchRate = newBase.catchRate ?? mon.catchRate;
  mon.baseExp = newBase.baseExp ?? mon.baseExp;

  msgs.push(`${oldName} evolved\ninto ${newName}!`);

  // LearnMoveFromLevelUp on evolved species (engine/pokemon/evos_moves.asm:214)
  for (const [learnLv, mId] of newBase.learnset || []) {
    if (learnLv === lv && !mon.moves.some((mv) => mv.id === mId)) {
      const newMove = getMoveObj(mId);
      if (mon.moves.length < 4) {
        mon.moves.push(newMove);
      } else {
        mon.moves[0] = newMove;
      }
      msgs.push(`${mon.nickname} learned\n${newMove.name}!`);
    }
  }

  state.seenPokemon.add(targetKey);
  state.caughtPokemon.add(targetKey);
  saveProgress();
  updateUIForCurrentZone();
  return true;
}

export function levelUpPokemon(mon, msgs = [], options = {}) {
  if (!mon || mon.level >= 100) return false;
  mon.level = Math.min(100, mon.level + 1);
  if (mon.species === "PIKACHU") {
    modifyPikachuHappiness("LEVELUP");
  }
  const base = POKEYELLOW_DATA.battle?.pokemonStats?.[mon.species];
  if (base) {
    const lv = mon.level;
    const oldMaxHp = mon.maxHp;
    mon.maxHp = Math.floor(((base.hp + 15) * 2 * lv) / 100) + lv + 10;
    mon.hp = Math.min(mon.maxHp, mon.hp + Math.max(1, mon.maxHp - oldMaxHp));
    mon.atk = Math.floor(((base.atk + 15) * 2 * lv) / 100) + 5;
    mon.def = Math.floor(((base.def + 15) * 2 * lv) / 100) + 5;
    mon.spd = Math.floor(((base.spd + 15) * 2 * lv) / 100) + 5;
    mon.spc = Math.floor(((base.spc + 15) * 2 * lv) / 100) + 5;
    msgs.push(`${mon.nickname} grew to\nlevel ${lv}!`);

    // Check data/pokemon/evos_moves.asm learnset for this level
    for (const [learnLv, mId] of base.learnset || []) {
      if (learnLv === lv && !mon.moves.some((mv) => mv.id === mId)) {
        const newMove = getMoveObj(mId);
        if (mon.moves.length < 4) {
          mon.moves.push(newMove);
        } else {
          mon.moves[0] = newMove;
        }
        msgs.push(`${mon.nickname} learned\n${newMove.name}!`);
      }
    }

    // Check EVOLVE_LEVEL in data/pokemon/evos_moves.asm (EvolutionAfterBattle)
    for (const evo of base.evolutions || []) {
      if (evo.method === "LEVEL" && lv >= evo.level) {
        if (options.interactive && state.battle) {
          msgs.push({ type: "EVOLVE", mon, target: evo.target });
        } else {
          evolvePokemon(mon, evo.target, msgs);
        }
        break;
      }
    }
  }
  return true;
}

function awardExpAndCheckLevelUp(mon, expGain, msgs) {
  if (!mon || mon.level >= 100) return;
  mon.exp = (mon.exp || 0) + expGain;
  let levelsGained = 0;
  let hasQueuedEvo = false;
  while (mon.level < 100 && levelsGained < 10) {
    const needed = Math.max(20, mon.level * mon.level * 2);
    if (mon.exp < needed) break;
    mon.exp -= needed;
    levelsGained++;
    const prevLen = msgs.length;
    levelUpPokemon(mon, msgs, { interactive: !hasQueuedEvo });
    if (msgs.slice(prevLen).some((m) => typeof m === "object" && m.type === "EVOLVE")) {
      hasQueuedEvo = true;
    }
  }
}

function handleEnemyFainted(b, msgs) {
  const foe = b.enemyParty[b.activeEnemyIdx];
  const pMon = state.party[b.activePlayerIdx];
  const expGain = Math.max(12, Math.floor((foe.baseExp * foe.level) / 7));
  msgs.push(
    `${b.isTrainer ? "Enemy " : "Wild "}${foe.nickname}\nfainted!`,
    `${pMon.nickname} gained\n${expGain} EXP. Points!`
  );
  awardExpAndCheckLevelUp(pMon, expGain, msgs);

  // Check if trainer has another conscious Pokémon
  const nextEnemyIdx = b.enemyParty.findIndex((m, idx) => idx > b.activeEnemyIdx && m.hp > 0);
  if (nextEnemyIdx !== -1) {
    b.activeEnemyIdx = nextEnemyIdx;
    const nextFoe = b.enemyParty[nextEnemyIdx];
    if (nextFoe?.species) {
      state.seenPokemon.add(nextFoe.species);
      saveProgress();
    }
    syncBattleTopLevelProps(b);
    msgs.push(`${b.trainerName} sent out\n${nextFoe.nickname}!`);
    queueBattleMessages(msgs, "MAIN_MENU");
  } else {
    b.finished = true;
    if (b.isTrainer) {
      if (b.trainerKey) {
        state.defeatedTrainers.add(b.trainerKey);
        saveProgress();
        // If Game Corner Rocket guarding poster is defeated, he steps away
        if (b.trainerKey.startsWith("GAME_CORNER:GAMECORNER_ROCKET")) {
          const rNpc = state.npcs.find((n) => n.name === "GAMECORNER_ROCKET");
          if (rNpc) rNpc.collected = true;
        }
      }
      b.showTrainerSprite = Boolean(b.trainerSprite);
      msgs.push(`RED defeated\n${b.trainerName}!`);
      if (b.endBattleText) {
        msgs.push(b.endBattleText.split("\n\n")[0]);
      }
      // Check if defeated trainer is a Kanto Gym Leader
      const gymBadge = KANTO_GYM_BADGES.find(
        (gb) =>
          b.trainerKey &&
          b.trainerKey.startsWith(`${gb.zone}:`) &&
          b.trainerKey.toUpperCase().includes(gb.leader.replace(".", "_"))
      );
      if (gymBadge) {
        modifyPikachuHappiness("GYMLEADER");
        msgs.push(`RED received the\n${gymBadge.name}!`);
      }
      // Check if defeated trainer is Champion Rival Blue in Champions Room
      if (b.trainerKey && b.trainerKey.startsWith("CHAMPIONS_ROOM:")) {
        msgs.push(
          `OAK: RED! You have\nbecome the new\nPOKéMON LEAGUE CHAMPION!`
        );
        b.onComplete = () => {
          loadZone("HALL_OF_FAME", { x: 5, y: 5, dir: "UP" });
          const partySummary = state.party
            .map((m) => `${m.nickname} (:L${m.level})`)
            .join(", ");
          openDialogue(
            "INDIGO PLATEAU — HALL OF FAME",
            `OAK: Welcome to the HALL OF FAME, RED!\n\nPOKéMON LEAGUE CHAMPIONS:\nRED & ${partySummary}\n\nCongratulations on completing your KANTO journey!`
          );
        };
      }
    }
    syncBattleTopLevelProps(b);
    queueBattleMessages(msgs, "MAIN_MENU");
  }
}

function handlePlayerFainted(b, msgs) {
  const pMon = state.party[b.activePlayerIdx];
  msgs.push(`${pMon.nickname}\nfainted!`);
  syncPikachuOverworldState();
  const nextAliveIdx = state.party.findIndex((m) => m.hp > 0);
  if (nextAliveIdx !== -1) {
    b.forcedSwitch = true;
    b.partyCursor = nextAliveIdx;
    msgs.push(`Use next POKéMON?`);
    queueBattleMessages(msgs, "PARTY_MENU");
  } else {
    b.finished = true;
    healParty();
    msgs.push(`RED is out of\nusable POKéMON!`, `RED scurried to a\nPOKéMON CENTER!`);
    queueBattleMessages(msgs, "MAIN_MENU");
  }
}

function executePlayerMove(moveIndex) {
  const b = state.battle;
  if (!b || b.finished) return;
  const pMon = state.party[b.activePlayerIdx];
  const foe = b.enemyParty[b.activeEnemyIdx];
  if (!pMon || !foe) return;
  if (!Array.isArray(pMon.moves) || pMon.moves.length === 0) {
    pMon.moves = [getMoveObj("TACKLE")];
  }
  const safeIdx = Math.max(0, Math.min(pMon.moves.length - 1, Number(moveIndex) || 0));
  let move = pMon.moves[safeIdx];
  if (!move) return;

  if (move.pp <= 0) {
    const hasAnyPp = pMon.moves.some((mv) => mv && mv.pp > 0);
    if (hasAnyPp) {
      audio.playSfx("bump");
      queueBattleMessages([`No PP left for\nthis move!`], "FIGHT_MENU");
      return;
    }
    // Gen I STRUGGLE fallback when all moves are out of PP
    move = {
      id: "STRUGGLE",
      name: "STRUGGLE",
      type: "NORMAL",
      power: 50,
      accuracy: 100,
      pp: 1,
      maxPp: 1,
      effect: "RECOIL_EFFECT",
    };
  }

  b.moveCursor = safeIdx;
  audio.playSfx("thunder");

  const msgs = [];
  const enemyMove =
    foe.moves[Math.floor(Math.random() * foe.moves.length)] || getMoveObj("TACKLE");

  const playerPriority = move.id === "QUICK_ATTACK" ? 1 : 0;
  const enemyPriority = enemyMove.id === "QUICK_ATTACK" ? 1 : 0;
  const playerFirst =
    playerPriority > enemyPriority ||
    (playerPriority === enemyPriority && pMon.spd >= foe.spd);

  if (playerFirst) {
    msgs.push(...performMoveAttack(pMon, foe, move, false));
    syncBattleTopLevelProps(b);
    if (foe.hp <= 0) {
      handleEnemyFainted(b, msgs);
      return;
    }
    msgs.push(...performMoveAttack(foe, pMon, enemyMove, true));
    syncBattleTopLevelProps(b);
    if (pMon.hp <= 0) {
      handlePlayerFainted(b, msgs);
      return;
    }
  } else {
    msgs.push(...performMoveAttack(foe, pMon, enemyMove, true));
    syncBattleTopLevelProps(b);
    if (pMon.hp <= 0) {
      handlePlayerFainted(b, msgs);
      return;
    }
    msgs.push(...performMoveAttack(pMon, foe, move, false));
    syncBattleTopLevelProps(b);
    if (foe.hp <= 0) {
      handleEnemyFainted(b, msgs);
      return;
    }
  }

  queueBattleMessages(msgs, "MAIN_MENU");
}

function executeBagItem(bagIndex) {
  const b = state.battle;
  if (!b || b.finished) return;

  // Last row in DisplayBagMenu is CANCEL
  if (bagIndex >= state.bag.length) {
    audio.playSfx("blip");
    b.menuState = "MAIN_MENU";
    renderBattleModal();
    return;
  }

  const item = state.bag[bagIndex];
  if (!item || item.qty <= 0) {
    audio.playSfx("bump");
    return;
  }

  const pMon = state.party[b.activePlayerIdx];
  const foe = b.enemyParty[b.activeEnemyIdx];

  if (item.kind === "ball") {
    if (b.isTrainer) {
      audio.playSfx("bump");
      queueBattleMessages(
        [
          `RED used\n${item.name}!`,
          `The trainer blocked the BALL!\nDon't be a thief!`,
        ],
        "MAIN_MENU"
      );
      return;
    }
    if (item.id !== "MASTER_BALL") item.qty = Math.max(1, item.qty - 1);
    audio.playSfx("warp");
    foe.hp = 0;
    b.finished = true;
    syncBattleTopLevelProps(b);
    state.caughtPokemon.add(foe.species);
    if (state.party.length < 6 && !state.party.some((m) => m.species === foe.species)) {
      state.party.push(buildMonInstance(foe.species, foe.level));
    }
    saveProgress();
    updateUIForCurrentZone();
    queueBattleMessages(
      [
        `RED used\n${item.name}!`,
        `All right! ${foe.nickname}\nwas caught!`,
      ],
      "MAIN_MENU"
    );
    return;
  }

  if (item.kind === "heal") {
    item.qty = Math.max(1, item.qty - 1);
    audio.playSfx("warp");
    const prevHp = pMon.hp;
    pMon.hp = Math.min(pMon.maxHp, pMon.hp + item.hp);
    if (item.cure) pMon.status = "OK";
    const recovered = pMon.hp - prevHp;
    const msgs = [
      `RED used\n${item.name}!`,
      recovered > 0
        ? `${pMon.nickname} recovered\nby ${recovered} HP!`
        : `${pMon.nickname}'s HP is\nalready full!`,
    ];
    // Enemy gets a turn after item use
    const enemyMove =
      foe.moves[Math.floor(Math.random() * foe.moves.length)] || getMoveObj("TACKLE");
    msgs.push(...performMoveAttack(foe, pMon, enemyMove, true));
    syncBattleTopLevelProps(b);
    if (pMon.hp <= 0) {
      handlePlayerFainted(b, msgs);
      return;
    }
    queueBattleMessages(msgs, "MAIN_MENU");
    return;
  }

  if (item.kind === "candy") {
    item.qty = Math.max(1, item.qty - 1);
    audio.playSfx("warp");
    const msgs = [`RED used\n${item.name}!`];
    levelUpPokemon(pMon, msgs, { interactive: true });
    syncBattleTopLevelProps(b);
    queueBattleMessages(msgs, "MAIN_MENU");
    return;
  }

  if (item.kind === "stone") {
    // Matches ItemUseEvoStone & CheckEvolveWithUsedStone (engine/items/item_effects.asm:790-849)
    if (pMon.species === "PIKACHU" && item.id === "THUNDER_STONE") {
      // IsThisPartyMonStarterPikachu -> RefusingText (engine/items/item_effects.asm:812-825)
      audio.playSfx("pika");
      queueBattleMessages(
        [
          `RED used\n${item.name}!`,
          `${pMon.nickname} refused\nto evolve!`,
        ],
        "MAIN_MENU"
      );
      return;
    }
    const base = POKEYELLOW_DATA.battle?.pokemonStats?.[pMon.species];
    const matchEvo = (base?.evolutions || []).find(
      (ev) => ev.method === "ITEM" && ev.item === item.id
    );
    if (!matchEvo) {
      audio.playSfx("bump");
      queueBattleMessages(
        [`RED used\n${item.name}!`, `It won't have any effect!`],
        "MAIN_MENU"
      );
      return;
    }
    item.qty = Math.max(1, item.qty - 1);
    audio.playSfx("warp");
    const msgs = [
      `RED used\n${item.name}!`,
      { type: "EVOLVE", mon: pMon, target: matchEvo.target },
    ];
    syncBattleTopLevelProps(b);
    queueBattleMessages(msgs, "MAIN_MENU");
    return;
  }

  if (item.kind === "flute") {
    audio.playSfx("pika");
    for (const m of state.party) {
      if (m.status === "SLP") m.status = "OK";
    }
    if (foe.status === "SLP") foe.status = "OK";
    queueBattleMessages(
      [
        `RED played the\nPOKé FLUTE!`,
        `Now, that's a catchy tune!\nAll sleeping POKéMON woke up!`,
      ],
      "MAIN_MENU"
    );
  }
}

function executePartySwitch(targetPartyIdx) {
  const b = state.battle;
  if (!b) return;
  const chosen = state.party[targetPartyIdx];
  if (!chosen) return;

  if (chosen.hp <= 0) {
    audio.playSfx("bump");
    const promptEl = document.getElementById("battle-party-prompt");
    if (promptEl) promptEl.textContent = "There's no will to fight!";
    return;
  }
  if (targetPartyIdx === b.activePlayerIdx) {
    audio.playSfx("bump");
    const promptEl = document.getElementById("battle-party-prompt");
    if (promptEl) promptEl.textContent = `${chosen.nickname} is already out!`;
    return;
  }

  const prevMon = state.party[b.activePlayerIdx];
  const wasForced = b.forcedSwitch;
  b.activePlayerIdx = targetPartyIdx;
  b.forcedSwitch = false;
  b.moveCursor = 0;
  audio.playSfx("warp");

  const msgs = [];
  if (!wasForced && prevMon.hp > 0) {
    msgs.push(`${prevMon.nickname} enough!\nCome back!`);
  }
  msgs.push(`Go! ${chosen.nickname}!`);

  if (!wasForced) {
    const foe = b.enemyParty[b.activeEnemyIdx];
    const enemyMove =
      foe.moves[Math.floor(Math.random() * foe.moves.length)] || getMoveObj("TACKLE");
    msgs.push(...performMoveAttack(foe, chosen, enemyMove, true));
    syncBattleTopLevelProps(b);
    if (chosen.hp <= 0) {
      handlePlayerFainted(b, msgs);
      return;
    }
  } else {
    syncBattleTopLevelProps(b);
  }

  queueBattleMessages(msgs, "MAIN_MENU");
}

function executeSafariAction(safariIdx) {
  const b = state.battle;
  if (!b) return;
  const foe = b.enemyParty[b.activeEnemyIdx];
  if (safariIdx === 0) {
    // Throw SAFARI BALL
    b.safariBalls = Math.max(0, b.safariBalls - 1);
    audio.playSfx("warp");
    foe.hp = 0;
    b.finished = true;
    syncBattleTopLevelProps(b);
    state.caughtPokemon.add(foe.species);
    if (state.party.length < 6 && !state.party.some((m) => m.species === foe.species)) {
      state.party.push(buildMonInstance(foe.species, foe.level));
    }
    saveProgress();
    updateUIForCurrentZone();
    queueBattleMessages(
      [
        `RED used\nSAFARI BALL!`,
        `All right! ${foe.nickname}\nwas caught!`,
      ],
      "MAIN_MENU"
    );
  } else if (safariIdx === 1) {
    // BAIT
    audio.playSfx("blip");
    queueBattleMessages(
      [`RED threw some BAIT!`, `Wild ${foe.nickname}\nis eating!`],
      "MAIN_MENU"
    );
  } else if (safariIdx === 2) {
    // THROW ROCK
    audio.playSfx("thunder");
    foe.hp = Math.max(1, Math.floor(foe.hp * 0.7));
    syncBattleTopLevelProps(b);
    queueBattleMessages(
      [`RED threw a ROCK!`, `Wild ${foe.nickname}\nis angry!`],
      "MAIN_MENU"
    );
  } else {
    // RUN
    audio.playSfx("ledge");
    b.finished = true;
    queueBattleMessages([`Got away safely!`], "MAIN_MENU");
  }
}

export function executeBattleAction(action) {
  const b = state.battle;
  if (!b) return;
  if (b.finished || action === "run") {
    if (b.isTrainer && !b.finished && action === "run") {
      audio.playSfx("bump");
      queueBattleMessages(
        [`No! There's no running\nfrom a trainer battle!`],
        "MAIN_MENU"
      );
      return;
    }
    audio.playSfx("ledge");
    state.battle = null;
    renderBattleModal();
    return;
  }
  if (action === "ball") {
    executeBagItem(0);
    return;
  }
  if (action === "thunderbolt") {
    executePlayerMove(0);
    return;
  }
  if (action === "quickattack") {
    executePlayerMove(Math.min(1, state.party[b.activePlayerIdx].moves.length - 1));
    return;
  }
}

function handleBattleInput(input) {
  const b = state.battle;
  if (!b) return;

  if (b.menuState === "EVOLVING") {
    // Evolution_CheckForCancel (engine/movie/evolution.asm:138-156):
    // Pressing B during the evolution animation cancels the evolution!
    if (input === "B") {
      cancelEvolutionAnimation();
    } else if (input === "A") {
      completeEvolutionAnimation();
    }
    return;
  }

  if (b.menuState === "MESSAGE") {
    if (input === "A" || input === "B") {
      advanceBattleMessage();
    }
    return;
  }

  if (b.menuState === "MAIN_MENU") {
    // 2x2 Grid:
    // 0: FIGHT (top-left)  | 1: PKMN (top-right)
    // 2: ITEM  (bot-left)  | 3: RUN  (bot-right)
    if (input === "RIGHT" && (b.mainCursor === 0 || b.mainCursor === 2)) {
      b.mainCursor += 1;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "LEFT" && (b.mainCursor === 1 || b.mainCursor === 3)) {
      b.mainCursor -= 1;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "DOWN" && (b.mainCursor === 0 || b.mainCursor === 1)) {
      b.mainCursor += 2;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "UP" && (b.mainCursor === 2 || b.mainCursor === 3)) {
      b.mainCursor -= 2;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "A") {
      audio.playSfx("blip");
      if (b.isSafari) {
        executeSafariAction(b.mainCursor);
        return;
      }
      if (b.mainCursor === 0) {
        b.menuState = "FIGHT_MENU";
        renderBattleModal();
      } else if (b.mainCursor === 1) {
        b.partyCursor = b.activePlayerIdx;
        b.menuState = "PARTY_MENU";
        renderBattleModal();
      } else if (b.mainCursor === 2) {
        b.menuState = "BAG_MENU";
        renderBattleModal();
      } else if (b.mainCursor === 3) {
        if (b.isTrainer) {
          audio.playSfx("bump");
          queueBattleMessages(
            [`No! There's no running\nfrom a trainer battle!`],
            "MAIN_MENU"
          );
        } else {
          audio.playSfx("ledge");
          b.finished = true;
          queueBattleMessages([`Got away safely!`], "MAIN_MENU");
        }
      }
    }
    return;
  }

  if (b.menuState === "FIGHT_MENU") {
    const pMon = state.party[b.activePlayerIdx];
    const numMoves = pMon.moves.length;
    if (input === "UP") {
      // Matches SelectMenuItem_CursorUp wrap-around in engine/battle/core.asm
      b.moveCursor = (b.moveCursor - 1 + numMoves) % numMoves;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "DOWN") {
      // Matches SelectMenuItem_CursorDown wrap-around in engine/battle/core.asm
      b.moveCursor = (b.moveCursor + 1) % numMoves;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "SELECT") {
      // Matches SwapMovesInMenu in engine/battle/core.asm (lines 2926-3008)
      audio.playSfx("blip");
      if (b.moveSwapIndex === null) {
        b.moveSwapIndex = b.moveCursor;
      } else {
        const tmp = pMon.moves[b.moveSwapIndex];
        pMon.moves[b.moveSwapIndex] = pMon.moves[b.moveCursor];
        pMon.moves[b.moveCursor] = tmp;
        b.moveSwapIndex = null;
      }
      renderBattleModal();
    } else if (input === "B") {
      audio.playSfx("blip");
      b.moveSwapIndex = null;
      b.menuState = "MAIN_MENU";
      renderBattleModal();
    } else if (input === "A") {
      b.moveSwapIndex = null;
      executePlayerMove(b.moveCursor);
    }
    return;
  }

  if (b.menuState === "BAG_MENU") {
    const totalRows = state.bag.length + 1; // +1 for CANCEL
    if (input === "UP") {
      b.bagCursor = Math.max(0, b.bagCursor - 1);
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "DOWN") {
      b.bagCursor = Math.min(totalRows - 1, b.bagCursor + 1);
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "B") {
      audio.playSfx("blip");
      b.menuState = "MAIN_MENU";
      renderBattleModal();
    } else if (input === "A") {
      executeBagItem(b.bagCursor);
    }
    return;
  }

  if (b.menuState === "PARTY_MENU") {
    const count = state.party.length;
    if (input === "UP") {
      b.partyCursor = (b.partyCursor - 1 + count) % count;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "DOWN") {
      b.partyCursor = (b.partyCursor + 1) % count;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "B") {
      if (!b.forcedSwitch) {
        audio.playSfx("blip");
        b.menuState = "MAIN_MENU";
        renderBattleModal();
      }
    } else if (input === "A") {
      audio.playSfx("blip");
      b.partySubCursor = 0;
      b.menuState = "PARTY_SUB";
      renderBattleModal();
    }
    return;
  }

  if (b.menuState === "PARTY_SUB") {
    if (input === "UP") {
      b.partySubCursor = (b.partySubCursor + 2) % 3;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "DOWN") {
      b.partySubCursor = (b.partySubCursor + 1) % 3;
      audio.playSfx("blip");
      renderBattleModal();
    } else if (input === "B") {
      audio.playSfx("blip");
      b.menuState = "PARTY_MENU";
      renderBattleModal();
    } else if (input === "A") {
      audio.playSfx("blip");
      if (b.partySubCursor === 0) {
        executePartySwitch(b.partyCursor);
      } else if (b.partySubCursor === 1) {
        b.menuState = "PARTY_STATS";
        renderBattleModal();
      } else {
        b.menuState = "PARTY_MENU";
        renderBattleModal();
      }
    }
    return;
  }

  if (b.menuState === "PARTY_STATS") {
    if (input === "A" || input === "B") {
      audio.playSfx("blip");
      b.menuState = "PARTY_SUB";
      renderBattleModal();
    }
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

  const battleBtn = document.getElementById("dialogue-battle-btn");
  if (battleBtn) {
    if (state.dialogue.trainerBattle) {
      const tb = state.dialogue.trainerBattle;
      battleBtn.classList.remove("hidden");
      battleBtn.textContent = tb.trainerName
        ? `⚔️ BATTLE ${tb.trainerName}`
        : `⚔️ BATTLE ${tb.species}`;
      battleBtn.onclick = () => {
        state.dialogue = null;
        renderDialogueModal();
        triggerWildEncounter([tb.level, tb.species], tb);
      };
    } else if (state.dialogue.fieldMoveAction) {
      const fma = state.dialogue.fieldMoveAction;
      battleBtn.classList.remove("hidden");
      battleBtn.textContent = fma.label;
      battleBtn.onclick = () => {
        state.dialogue = null;
        renderDialogueModal();
        useFieldMove(fma.moveId);
      };
    } else {
      battleBtn.classList.add("hidden");
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
  syncBattleTopLevelProps(b);

  const foe = b.enemyParty[b.activeEnemyIdx] || b.enemyParty[0];
  const pMon =
    b.demoPlayerMon || state.party[b.activePlayerIdx] || state.party[0];
  if (!foe || !pMon) {
    state.battle = null;
    modal.classList.add("hidden");
    return;
  }

  // 1. Enemy HUD (DrawEnemyHUDAndHPBar & SetupEnemyPartyPokeballs)
  const foeNameEl = document.getElementById("battle-foe-name");
  if (foeNameEl) foeNameEl.textContent = foe.nickname;
  const foeLvEl = document.getElementById("battle-foe-lv");
  if (foeLvEl) {
    foeLvEl.textContent = foe.status !== "OK" ? foe.status : `:L${foe.level}`;
  }
  const foePct = Math.max(0, Math.round((foe.hp / Math.max(1, foe.maxHp)) * 100));
  const foeBar = document.getElementById("battle-foe-hp-fill");
  if (foeBar) {
    foeBar.style.width = `${foePct}%`;
    foeBar.style.background =
      foePct > 50 ? "#22c55e" : foePct > 20 ? "#eab308" : "#ef4444";
  }

  const ballsBox = document.getElementById("battle-foe-balls");
  if (ballsBox) {
    if (b.isTrainer) {
      ballsBox.classList.remove("hidden");
      ballsBox.innerHTML = "";
      for (let i = 0; i < 6; i++) {
        const m = b.enemyParty[i];
        const span = document.createElement("span");
        if (!m) {
          span.className = "pball-icon empty";
          span.textContent = "·";
        } else if (m.hp <= 0) {
          span.className = "pball-icon fainted";
          span.textContent = "×";
        } else if (m.status !== "OK") {
          span.className = "pball-icon status";
          span.textContent = "●";
        } else {
          span.className = "pball-icon alive";
          span.textContent = "●";
        }
        ballsBox.appendChild(span);
      }
    } else {
      ballsBox.classList.add("hidden");
    }
  }

  // 2. Player HUD (DrawPlayerHUDAndHPBar)
  const pNameEl = document.getElementById("battle-player-name");
  if (pNameEl) pNameEl.textContent = pMon.nickname;
  const pLvEl = document.getElementById("battle-player-lv");
  if (pLvEl) {
    pLvEl.textContent = pMon.status !== "OK" ? pMon.status : `:L${pMon.level}`;
  }
  const playerPct = Math.max(0, Math.round((pMon.hp / pMon.maxHp) * 100));
  const pBar = document.getElementById("battle-player-hp-fill");
  pBar.style.width = `${playerPct}%`;
  pBar.style.background =
    playerPct > 50 ? "#22c55e" : playerPct > 20 ? "#eab308" : "#ef4444";
  document.getElementById("battle-player-hp-nums").textContent = `${String(
    pMon.hp
  ).padStart(2, " ")}/${String(pMon.maxHp).padStart(2, " ")}`;

  // 3. Draw Front & Back Sprites
  const foeCanvas = document.getElementById("battle-foe-canvas");
  if (b.showTrainerSprite && b.trainerSprite && engine.trainerSprites[b.trainerSprite]) {
    engine.render2BitGraphicToCanvas(
      foeCanvas,
      engine.trainerSprites[b.trainerSprite],
      state.currentZone.palette
    );
  } else {
    const foeSpr =
      engine.pokemonSprites[foe.species] || engine.pokemonSprites.PIDGEY;
    engine.render2BitGraphicToCanvas(foeCanvas, foeSpr, state.currentZone.palette);
  }

  const backCanvas = document.getElementById("battle-player-canvas");
  const backSpr =
    (pMon.trainerSpriteKey && engine.trainerSprites[pMon.trainerSpriteKey]) ||
    engine.pokemonSprites[`${pMon.species}_BACK`] ||
    engine.pokemonSprites.PIKACHU_BACK;
  engine.render2BitGraphicToCanvas(backCanvas, backSpr, "PAL_YELLOWMON");

  // 4. Bottom MESSAGE_BOX text & blinking prompt
  const logEl = document.getElementById("battle-log-text");
  if (logEl) {
    logEl.textContent = b.menuState === "FIGHT_MENU" ? "" : b.log;
  }
  const promptEl = document.getElementById("battle-msg-prompt");
  if (promptEl) {
    promptEl.classList.toggle("hidden", b.menuState !== "MESSAGE");
  }

  // 5. BATTLE_MENU_TEMPLATE (8,12..19,17) vs SAFARI_BATTLE_MENU_TEMPLATE (0,12..19,17)
  const mainMenuEl = document.getElementById("battle-main-menu");
  const safariMenuEl = document.getElementById("battle-safari-menu");
  const showMainOverlay =
    b.menuState === "MAIN_MENU" || b.menuState === "BAG_MENU";

  if (mainMenuEl && safariMenuEl) {
    if (showMainOverlay && !b.isSafari) {
      mainMenuEl.classList.remove("hidden");
      safariMenuEl.classList.add("hidden");
      mainMenuEl.querySelectorAll("[data-bmenu-idx]").forEach((btn) => {
        const idx = Number(btn.dataset.bmenuIdx);
        const curSpan = btn.querySelector(".bcursor");
        if (curSpan) {
          // PlaceUnfilledArrowMenuCursor ('▷') when submenu is open
          curSpan.textContent =
            idx === b.mainCursor
              ? b.menuState === "MAIN_MENU"
                ? "▶"
                : "▷"
              : " ";
        }
      });
    } else if (showMainOverlay && b.isSafari) {
      safariMenuEl.classList.remove("hidden");
      mainMenuEl.classList.add("hidden");
      const ballLbl = document.getElementById("safari-ball-label");
      if (ballLbl) ballLbl.textContent = `BALL×${String(b.safariBalls).padStart(2, " ")}`;
      safariMenuEl.querySelectorAll("[data-smenu-idx]").forEach((btn) => {
        const idx = Number(btn.dataset.smenuIdx);
        const curSpan = btn.querySelector(".bcursor");
        if (curSpan) curSpan.textContent = idx === b.mainCursor ? "▶" : " ";
      });
    } else {
      mainMenuEl.classList.add("hidden");
      safariMenuEl.classList.add("hidden");
    }
  }

  // 6. MoveSelectionMenu (4,12..19,17) + PrintMenuItem TYPE/PP Box (0,8..10,12)
  const fightWrap = document.getElementById("battle-fight-wrap");
  if (fightWrap) {
    if (b.menuState === "FIGHT_MENU") {
      fightWrap.classList.remove("hidden");
      const curMove =
        pMon.moves[b.moveCursor] || pMon.moves[0] || getMoveObj("TACKLE");
      const moveTypeEl = document.getElementById("battle-move-type");
      const movePpEl = document.getElementById("battle-move-pp");
      if (moveTypeEl) moveTypeEl.textContent = curMove.type;
      if (movePpEl) {
        movePpEl.textContent = `${String(curMove.pp).padStart(2, " ")}/${String(
          curMove.maxPp
        ).padStart(2, " ")}`;
      }

      const movesList = document.getElementById("battle-moves-list");
      movesList.innerHTML = "";
      for (let i = 0; i < 4; i++) {
        const mv = pMon.moves[i];
        const row = document.createElement("button");
        row.type = "button";
        row.className = "bmove-row";
        const cursorChar =
          i === b.moveCursor
            ? "▶"
            : i === b.moveSwapIndex
            ? "▷"
            : " ";
        row.innerHTML = `<span class="bcursor">${cursorChar}</span><span>${
          mv ? mv.name : "-"
        }</span>`;
        if (mv) {
          row.onmouseenter = () => {
            b.moveCursor = i;
            document.getElementById("battle-move-type").textContent = mv.type;
            document.getElementById("battle-move-pp").textContent = `${String(
              mv.pp
            ).padStart(2, " ")}/${String(mv.maxPp).padStart(2, " ")}`;
            movesList.querySelectorAll(".bmove-row .bcursor").forEach((cEl, cIdx) => {
              cEl.textContent =
                cIdx === i ? "▶" : cIdx === b.moveSwapIndex ? "▷" : " ";
            });
          };
          row.onclick = (e) => {
            e.stopPropagation();
            executePlayerMove(i);
          };
        } else {
          row.disabled = true;
        }
        movesList.appendChild(row);
      }
    } else {
      fightWrap.classList.add("hidden");
    }
  }

  // 7. LIST_MENU_BOX (4,2..19,12): Bag Item Menu (DisplayBagMenu)
  const bagBox = document.getElementById("battle-bag-box");
  if (bagBox) {
    if (b.menuState === "BAG_MENU") {
      bagBox.classList.remove("hidden");
      const bagList = document.getElementById("battle-bag-list");
      bagList.innerHTML = "";
      state.bag.forEach((item, idx) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "bbag-row";
        row.innerHTML = `<span class="bbag-left"><span class="bcursor">${
          idx === b.bagCursor ? "▶" : " "
        }</span><span>${item.name}</span></span><span class="bbag-qty">×${String(
          item.qty
        ).padStart(2, " ")}</span>`;
        row.onmouseenter = () => {
          b.bagCursor = idx;
          bagList.querySelectorAll(".bbag-row .bcursor").forEach((cEl, cIdx) => {
            cEl.textContent = cIdx === idx ? "▶" : " ";
          });
        };
        row.onclick = (e) => {
          e.stopPropagation();
          executeBagItem(idx);
        };
        bagList.appendChild(row);
      });
      // CANCEL row at end of bag list
      const cancelIdx = state.bag.length;
      const cancelRow = document.createElement("button");
      cancelRow.type = "button";
      cancelRow.className = "bbag-row";
      cancelRow.innerHTML = `<span class="bbag-left"><span class="bcursor">${
        b.bagCursor === cancelIdx ? "▶" : " "
      }</span><span>CANCEL</span></span><span></span>`;
      cancelRow.onclick = (e) => {
        e.stopPropagation();
        executeBagItem(cancelIdx);
      };
      bagList.appendChild(cancelRow);
    } else {
      bagBox.classList.add("hidden");
    }
  }

  // 8b. EvolveMon Stage (0,0..19,11): Back-and-forth sprite animation (engine/movie/evolution.asm)
  const evoStage = document.getElementById("battle-evo-stage");
  if (evoStage) {
    if (b.menuState === "EVOLVING" && b.evolution) {
      evoStage.classList.remove("hidden");
      const evo = b.evolution;
      const elapsed = performance.now() - evo.startTime;
      const t = Math.min(1, elapsed / evo.duration);
      // Accelerating back-and-forth swap (Evolution_BackAndForthAnim in engine/movie/evolution.asm:49-59)
      const periodMs = Math.max(70, 260 - t * 180);
      const showNew = t > 0.15 && Math.floor(elapsed / periodMs) % 2 === 1;
      evoStage.classList.toggle("evo-flash-silhouette", t > 0.15 && t < 0.92);
      const evoCanvas = document.getElementById("battle-evo-canvas");
      const sprKey = showNew ? evo.newSpecies : evo.oldSpecies;
      const spr = engine.pokemonSprites[sprKey] || engine.pokemonSprites.PIKACHU;
      engine.render2BitGraphicToCanvas(evoCanvas, spr, "PAL_YELLOWMON");
    } else {
      evoStage.classList.add("hidden");
      evoStage.classList.remove("evo-flash-silhouette");
    }
  }

  // 8. DisplayPartyMenu (0,0..19,17) + SWITCH_STATS_CANCEL_MENU_TEMPLATE + StatusScreen
  const partyScreen = document.getElementById("battle-party-screen");
  if (partyScreen) {
    const inParty =
      b.menuState === "PARTY_MENU" ||
      b.menuState === "PARTY_SUB" ||
      b.menuState === "PARTY_STATS";
    if (inParty) {
      partyScreen.classList.remove("hidden");
      const pList = document.getElementById("battle-party-list");
      pList.innerHTML = "";
      state.party.forEach((mon, idx) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = `bparty-row ${idx === b.partyCursor ? "selected" : ""}`;
        const pct = Math.max(0, Math.round((mon.hp / mon.maxHp) * 100));
        const barColor =
          pct > 50 ? "#22c55e" : pct > 20 ? "#eab308" : "#ef4444";
        const curChar =
          idx === b.partyCursor
            ? b.menuState === "PARTY_MENU"
              ? "▶"
              : "▷"
            : " ";
        const iconChar = mon.species === "PIKACHU" ? "⚡" : "◓";
        row.innerHTML = `
          <span class="bcursor">${curChar}</span>
          <span class="bparty-icon">${iconChar}</span>
          <div class="bparty-main">
            <div class="bparty-top">
              <span>${mon.nickname}${idx === b.activePlayerIdx ? " ★" : ""}</span>
              <span>${mon.hp <= 0 ? "FNT" : mon.status !== "OK" ? mon.status : `:L${mon.level}`}</span>
            </div>
            <div class="bparty-hp-wrap">
              <span class="hp-tag">HP:</span>
              <div class="hp-track"><div class="hp-fill" style="width:${pct}%;background:${barColor}"></div></div>
            </div>
          </div>
          <span class="bparty-nums">${mon.hp}/${mon.maxHp}</span>
        `;
        row.onclick = (e) => {
          e.stopPropagation();
          audio.playSfx("blip");
          b.partyCursor = idx;
          b.partySubCursor = 0;
          b.menuState = "PARTY_SUB";
          renderBattleModal();
        };
        pList.appendChild(row);
      });

      const subMenu = document.getElementById("battle-party-sub-menu");
      if (subMenu) {
        if (b.menuState === "PARTY_SUB") {
          subMenu.classList.remove("hidden");
          subMenu.querySelectorAll("[data-psub-act]").forEach((btn, sIdx) => {
            const cEl = btn.querySelector(".bcursor");
            if (cEl) cEl.textContent = sIdx === b.partySubCursor ? "▶" : " ";
          });
        } else {
          subMenu.classList.add("hidden");
        }
      }

      const statsModal = document.getElementById("battle-stats-modal");
      if (statsModal) {
        if (b.menuState === "PARTY_STATS") {
          statsModal.classList.remove("hidden");
          const sMon = state.party[b.partyCursor] || pMon;
          const sBase = POKEYELLOW_DATA.battle?.pokemonStats?.[sMon.species];
          const evoList = (sBase?.evolutions || [])
            .map((ev) =>
              ev.method === "LEVEL"
                ? `LV.${ev.level}→${ev.target}`
                : ev.method === "ITEM"
                ? `${ev.item.replace("_STONE", "")}→${ev.target}`
                : `TRADE→${ev.target}`
            )
            .join(", ");
          const content = document.getElementById("battle-stats-content");
          content.innerHTML = `
            <div class="stats-top-grid">
              <canvas id="party-stats-canvas" width="40" height="40" style="width:48px;height:48px"></canvas>
              <div>
                <div><strong>${sMon.nickname}</strong> &nbsp;:L${sMon.level}</div>
                <div>HP: ${sMon.hp}/${sMon.maxHp} &nbsp;TYPE/${sMon.types.join("/")}</div>
                <div>EVO: ${evoList || "FINAL STAGE"}</div>
              </div>
            </div>
            <div class="stats-mid-grid">
              <div>ATTACK &nbsp;${sMon.atk}<br/>DEFENSE ${sMon.def}</div>
              <div>SPEED &nbsp;&nbsp;${sMon.spd}<br/>SPECIAL ${sMon.spc}</div>
            </div>
            <div class="stats-moves-box">
              ${sMon.moves
                .map(
                  (mv) =>
                    `<div style="display:flex;justify-content:space-between"><span>• ${mv.name}</span><span>PP ${mv.pp}/${mv.maxPp}</span></div>`
                )
                .join("")}
            </div>
          `;
          const stCanvas = document.getElementById("party-stats-canvas");
          const spr =
            engine.pokemonSprites[sMon.species] || engine.pokemonSprites.PIKACHU;
          engine.render2BitGraphicToCanvas(stCanvas, spr, "PAL_YELLOWMON");
        } else {
          statsModal.classList.add("hidden");
        }
      }
    } else {
      partyScreen.classList.add("hidden");
    }
  }
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

  // Subtle grid
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

  // Group zones by (townMapX, townMapY)
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

  // Highlight active zone's Kanto Town Map coordinate
  const cur = state.currentZone;
  const cx = cur.townMapX * cellW;
  const cy = cur.townMapY * cellH;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
}

function updateCoordinatesUI() {
  const z = state.currentZone;
  const ts = engine.tilesetsByConst[z.tileset];
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
}

function updateUIForCurrentZone() {
  const z = state.currentZone;
  if (!z) return;
  const badgeEl = document.getElementById("active-zone-badge");
  if (badgeEl) {
    badgeEl.textContent = `ZONE #${String(z.zoneNumber).padStart(3, "0")} / 220`;
  }
  const titleEl = document.getElementById("active-zone-title");
  if (titleEl) {
    titleEl.textContent = z.displayName;
  }
  const subEl = document.getElementById("active-zone-subtitle");
  if (subEl) {
    subEl.textContent = `${z.constName} (ROM ${z.romHex}) • ${z.regionName} • ${z.width}×${z.height} Blocks (${z.width * 32}×${z.height * 32} px) • Tileset: ${z.tileset}`;
  }

  const visitedEl = document.getElementById("visited-counter");
  if (visitedEl) {
    visitedEl.textContent = `${state.visitedZones.size} / 220 Visited`;
  }
  const caughtEl = document.getElementById("caught-counter");
  if (caughtEl) {
    caughtEl.textContent = `🔴 ${state.caughtPokemon.size} Caught`;
  }

  updateCoordinatesUI();
  if (state.viewMode !== "gb") {
    renderKantoTownMap();
  }

  // Highlight active row in zone list
  document.querySelectorAll(".zone-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.zoneConst === z.constName);
  });

  // Update Connections & Warps inspector
  const connBox = document.getElementById("inspector-connections");
  if (!connBox) return;
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

  // Signs & NPCs
  const npcBox = document.getElementById("inspector-entities");
  npcBox.innerHTML = "";
  z.signs.forEach((s, idx) => {
    const btn = document.createElement("button");
    btn.className = "entity-chip sign-chip";
    btn.textContent = `Sign S${idx + 1} (${s.x},${s.y}): "${s.text.slice(0, 42)}${
      s.text.length > 42 ? "…" : ""
    }"`;
    btn.onclick = () => {
      audio.playSfx("blip");
      openDialogue(`SIGNPOST (${s.x}, ${s.y})`, s.text);
    };
    npcBox.appendChild(btn);
  });
  state.npcs.forEach((npc) => {
    if (npc.collected) return;
    if (!npc.defaultVisible && !state.showHiddenObjects) return;
    const btn = document.createElement("button");
    btn.className = "entity-chip npc-chip";
    const trainerEntry = getTrainerBattleEntry(npc, z);
    btn.textContent = `${trainerEntry ? "⚔️ " : ""}${npc.name.replace(/_/g, " ")} (${npc.x},${npc.y})${
      !npc.defaultVisible ? " [Event]" : ""
    }`;
    btn.onclick = () => {
      triggerNpcDialogue(npc, z);
    };
    npcBox.appendChild(btn);
  });
  if (z.signs.length === 0 && state.npcs.length === 0) {
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

let lastRenderSig = "";

function computeRenderSignature() {
  const z = state.currentZone;
  const p = state.player;
  const pk = state.pikachu;
  let sig = `${z?.constName}|${state.viewMode}|${engine.paletteMode}|${engine.animCounter}|${engine.cutTrees.size}|${engine.flashIlluminated}|${state.showBorder}|${state.showEntitiesOnZoneMap}|${state.showWarpsOnZoneMap}|${state.showGridOnZoneMap}|${state.showHiddenObjects}|${state.activeEmote}|${p.renderX.toFixed(2)},${p.renderY.toFixed(2)},${p.dir},${p.walking},${p.stepParity},${p.mode},${p.surfSprite}|${pk.visible},${pk.renderX.toFixed(2)},${pk.renderY.toFixed(2)},${pk.dir},${pk.walking},${pk.stepParity}`;
  for (let i = 0; i < state.npcs.length; i++) {
    const n = state.npcs[i];
    if (!n.defaultVisible && !state.showHiddenObjects) continue;
    if (n.collected) continue;
    sig += `|${n.renderX.toFixed(2)},${n.renderY.toFixed(2)},${n.facing},${n.isWalking},${n.stepParity}`;
  }
  return sig;
}

function renderAllCanvases(force = true) {
  if (!force) {
    if (state.battle) return; // Battle screen covers the entire LCD viewport
    const sig = computeRenderSignature();
    if (sig === lastRenderSig) return;
    lastRenderSig = sig;
  } else {
    lastRenderSig = computeRenderSignature();
  }

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

// Authentic Generation I In-Game START Menu (home/start_menu.asm & engine/menus/draw_start_menu.asm)
const START_MENU_SECTIONS = [
  "POKEDEX",
  "POKEMON",
  "ITEM",
  "RED",
  "SAVE",
  "OPTION",
  "EXIT",
];

export function toggleStartMenu() {
  if (state.battle || state.dialogue) return;
  heldDirs.clear();
  state.startMenu.open = !state.startMenu.open;
  state.startMenu.subView = null;
  state.startMenu.selectedDexSpecies = null;
  state.startMenu.partyActionOpen = false;
  state.startMenu.partyActionCursor = 0;
  state.startMenu.partyStatsOpen = false;
  state.startMenu.partySwitchIdx = null;
  audio.playSfx("blip");
  renderStartMenu();
}

function getPartyActionItems(mon) {
  const hmSet = new Set(["CUT", "FLY", "SURF", "STRENGTH", "FLASH"]);
  const fieldMoves = (mon?.moves || [])
    .filter((m) => hmSet.has(m.id))
    .map((m) => ({ type: "HM", id: m.id, label: m.name }));
  return [
    ...fieldMoves,
    { type: "STATS", label: "STATS" },
    { type: "SWITCH", label: "SWITCH" },
    { type: "CANCEL", label: "CANCEL" },
  ];
}

function useBagItemInStartMenu(itemIndex) {
  const sm = state.startMenu;
  if (itemIndex >= state.bag.length) {
    audio.playSfx("blip");
    sm.subView = null;
    renderStartMenu();
    return;
  }
  const item = state.bag[itemIndex];
  if (!item) return;
  if (item.kind === "hm" && item.moveId) {
    if (state.party.length === 0) {
      audio.playSfx("bump");
      return;
    }
    teachHmMove(item.moveId, state.party[0]);
    useFieldMove(item.moveId);
    return;
  }
  if (item.kind === "flute") {
    sm.open = false;
    sm.subView = null;
    renderStartMenu();
    audio.playSfx("pika");
    openDialogue("POKé FLUTE", "RED played the POKé FLUTE! Now, that's a catchy tune!");
    return;
  }
  if (state.party.length === 0) {
    audio.playSfx("bump");
    return;
  }
  const lead = state.party[0];
  if (item.kind === "heal") {
    item.qty = Math.max(1, item.qty - 1);
    lead.hp = Math.min(lead.maxHp, lead.hp + item.hp);
    if (item.cure) lead.status = "OK";
    modifyPikachuHappiness("USEDITEM");
    audio.playSfx("warp");
    renderStartMenu();
  } else if (item.kind === "candy") {
    item.qty = Math.max(1, item.qty - 1);
    const msgs = [];
    levelUpPokemon(lead, msgs);
    audio.playSfx("warp");
    renderStartMenu();
  } else if (item.kind === "stone") {
    if (lead.species === "PIKACHU" && item.id === "THUNDER_STONE") {
      audio.playSfx("pika");
    } else {
      const base = POKEYELLOW_DATA.battle?.pokemonStats?.[lead.species];
      const matchEvo = (base?.evolutions || []).find(
        (ev) => ev.method === "ITEM" && ev.item === item.id
      );
      if (matchEvo) {
        item.qty = Math.max(1, item.qty - 1);
        evolvePokemon(lead, matchEvo.target, []);
        audio.playSfx("warp");
      } else {
        audio.playSfx("bump");
      }
    }
    renderStartMenu();
  } else {
    audio.playSfx("blip");
  }
}

export function handleStartMenuInput(input) {
  const sm = state.startMenu;
  if (!sm.open) return;

  if (sm.subView === "POKEDEX") {
    const allStats = getOrderedPokedexEntries();
    const count = allStats.length;
    if (sm.selectedDexSpecies) {
      if (input === "A" || input === "B" || input === "START") {
        audio.playSfx("blip");
        sm.selectedDexSpecies = null;
        renderStartMenu();
      }
      return;
    }
    if (input === "UP") {
      sm.subCursor = (sm.subCursor - 1 + count) % count;
      audio.playSfx("blip");
      renderStartMenu();
    } else if (input === "DOWN") {
      sm.subCursor = (sm.subCursor + 1) % count;
      audio.playSfx("blip");
      renderStartMenu();
    } else if (input === "A") {
      const chosen = allStats[sm.subCursor];
      const isSeen =
        chosen &&
        (state.seenPokemon.has(chosen.species) ||
          state.caughtPokemon.has(chosen.species));
      if (isSeen) {
        audio.playSfx("blip");
        sm.selectedDexSpecies = chosen.species;
        renderStartMenu();
      } else {
        audio.playSfx("bump");
      }
    } else if (input === "B" || input === "START") {
      audio.playSfx("blip");
      sm.subView = null;
      renderStartMenu();
    }
    return;
  }

  if (sm.subView === "POKEMON") {
    const count = state.party.length;
    if (count === 0) {
      if (input === "A" || input === "B" || input === "START") {
        audio.playSfx("blip");
        sm.subView = null;
        renderStartMenu();
      }
      return;
    }
    if (sm.partyStatsOpen) {
      if (input === "A" || input === "B" || input === "START") {
        audio.playSfx("blip");
        sm.partyStatsOpen = false;
        renderStartMenu();
      }
      return;
    }
    if (sm.partyActionOpen) {
      const mon = state.party[sm.subCursor] || state.party[0];
      const acts = getPartyActionItems(mon);
      if (input === "UP") {
        sm.partyActionCursor = (sm.partyActionCursor - 1 + acts.length) % acts.length;
        audio.playSfx("blip");
        renderStartMenu();
      } else if (input === "DOWN") {
        sm.partyActionCursor = (sm.partyActionCursor + 1) % acts.length;
        audio.playSfx("blip");
        renderStartMenu();
      } else if (input === "B") {
        audio.playSfx("blip");
        sm.partyActionOpen = false;
        renderStartMenu();
      } else if (input === "A") {
        const act = acts[sm.partyActionCursor];
        audio.playSfx("blip");
        if (!act || act.type === "CANCEL") {
          sm.partyActionOpen = false;
          renderStartMenu();
        } else if (act.type === "STATS") {
          sm.partyStatsOpen = true;
          renderStartMenu();
        } else if (act.type === "SWITCH") {
          sm.partyActionOpen = false;
          sm.partySwitchIdx = sm.subCursor;
          renderStartMenu();
        } else if (act.type === "HM") {
          sm.partyActionOpen = false;
          useFieldMove(act.id, { teachIfMissing: false });
        }
      }
      return;
    }
    if (input === "UP") {
      sm.subCursor = (sm.subCursor - 1 + count) % count;
      audio.playSfx("blip");
      renderStartMenu();
    } else if (input === "DOWN") {
      sm.subCursor = (sm.subCursor + 1) % count;
      audio.playSfx("blip");
      renderStartMenu();
    } else if (input === "B" || input === "START") {
      audio.playSfx("blip");
      if (sm.partySwitchIdx !== null) {
        sm.partySwitchIdx = null;
      } else {
        sm.subView = null;
      }
      renderStartMenu();
    } else if (input === "A") {
      audio.playSfx("blip");
      if (sm.partySwitchIdx !== null) {
        const fromIdx = sm.partySwitchIdx;
        const toIdx = sm.subCursor;
        const tmp = state.party[fromIdx];
        state.party[fromIdx] = state.party[toIdx];
        state.party[toIdx] = tmp;
        sm.partySwitchIdx = null;
        saveProgress();
        renderStartMenu();
      } else {
        sm.partyActionOpen = true;
        sm.partyActionCursor = 0;
        renderStartMenu();
      }
    }
    return;
  }

  if (sm.subView === "ITEM") {
    const totalRows = state.bag.length + 1; // +1 for CANCEL
    if (input === "UP") {
      sm.subCursor = Math.max(0, sm.subCursor - 1);
      audio.playSfx("blip");
      renderStartMenu();
    } else if (input === "DOWN") {
      sm.subCursor = Math.min(totalRows - 1, sm.subCursor + 1);
      audio.playSfx("blip");
      renderStartMenu();
    } else if (input === "B" || input === "START") {
      audio.playSfx("blip");
      sm.subView = null;
      renderStartMenu();
    } else if (input === "A") {
      useBagItemInStartMenu(sm.subCursor);
    }
    return;
  }

  if (sm.subView) {
    if (input === "B" || input === "START" || input === "A") {
      audio.playSfx("blip");
      sm.subView = null;
      renderStartMenu();
    }
    return;
  }

  // Top-level DrawStartMenu (home/start_menu.asm:14-85)
  if (input === "UP") {
    // Wrap around from top (0) to bottom (6) (home/start_menu.asm:18-34)
    sm.cursor = (sm.cursor + 6) % 7;
    audio.playSfx("blip");
    renderStartMenu();
  } else if (input === "DOWN") {
    // Wrap around from bottom (6) to top (0) (home/start_menu.asm:35-51)
    sm.cursor = (sm.cursor + 1) % 7;
    audio.playSfx("blip");
    renderStartMenu();
  } else if (input === "B" || input === "START") {
    // CloseStartMenu (home/start_menu.asm:57-58)
    audio.playSfx("blip");
    sm.open = false;
    renderStartMenu();
  } else if (input === "A") {
    audio.playSfx("blip");
    const chosen = START_MENU_SECTIONS[sm.cursor];
    if (chosen === "EXIT") {
      sm.open = false;
      renderStartMenu();
    } else {
      sm.subView = chosen;
      sm.subCursor = 0;
      sm.selectedDexSpecies = null;
      sm.partyActionOpen = false;
      sm.partyStatsOpen = false;
      sm.partySwitchIdx = null;
      renderStartMenu();
    }
  }
}

export function renderStartMenu() {
  const overlay = document.getElementById("start-menu-overlay");
  if (!overlay) return;
  const sm = state.startMenu;
  if (!sm.open) {
    overlay.classList.add("hidden");
    return;
  }
  overlay.classList.remove("hidden");

  const menuBox = document.getElementById("start-menu-box");
  menuBox.querySelectorAll("[data-smenu-item]").forEach((btn) => {
    const idx = Number(btn.dataset.smenuItem);
    const curEl = btn.querySelector(".bcursor");
    if (curEl) {
      curEl.textContent = idx === sm.cursor ? (sm.subView ? "▷" : "▶") : " ";
    }
  });

  const subPanel = document.getElementById("start-sub-panel");
  const subTitle = document.getElementById("start-sub-title");
  const subBody = document.getElementById("start-sub-body");
  if (!sm.subView) {
    subPanel.classList.add("hidden");
    return;
  }
  subPanel.classList.remove("hidden");
  subBody.innerHTML = "";

  if (sm.subView === "POKEDEX") {
    if (subTitle) subTitle.textContent = `POKéDEX — OWN: ${state.caughtPokemon.size}/151`;
    const allStats = getOrderedPokedexEntries();
    if (sm.selectedDexSpecies) {
      // ShowPokedexDataInternal (engine/menus/pokedex.asm): Authentic Gen I 2-half Data Screen
      const sp = sm.selectedDexSpecies;
      const entry = allStats.find((s) => s.species === sp) || allStats[0];
      const dexIdx = entry.dexNum;
      const base = POKEYELLOW_DATA.battle.pokemonStats[sp] || entry;
      const evoStr =
        (base.evolutions || [])
          .map((e) =>
            e.method === "LEVEL"
              ? `LV.${e.level}→${e.target}`
              : e.method === "ITEM"
              ? `${e.item.replace("_STONE", "")}→${e.target}`
              : `TRADE→${e.target}`
          )
          .join(", ") || "NONE";
      const wrap = document.createElement("div");
      wrap.className = "gb-pokedex-data";
      wrap.innerHTML = `
        <div class="gb-dex-data-top">
          <div class="gb-dex-sprite-col">
            <canvas id="start-dex-canvas" width="56" height="56" style="width:56px;height:56px"></canvas>
            <span>No.${String(Math.max(1, dexIdx)).padStart(3, "0")}</span>
          </div>
          <div class="gb-dex-info-col">
            <div>${sp.replace(/_/g, " ")}</div>
            <div>${base.types.join("/")}</div>
            <div>HT &nbsp;&nbsp;${base.hp > 65 ? `4'07"` : `1'08"`}</div>
            <div>WT &nbsp;&nbsp;${(base.hp * 0.4 + 6).toFixed(1)}lb</div>
          </div>
        </div>
        <div class="gb-dex-divider"></div>
        <div class="gb-dex-data-bottom">
          <div>HP:${base.hp} ATK:${base.atk} DEF:${base.def} SPD:${base.spd} SPC:${base.spc}</div>
          <div>EVO: ${evoStr}</div>
          <div>MOVES: ${(base.baseMoves || []).slice(0, 3).join(", ")}</div>
          <span class="gb-prompt-arrow">▼</span>
        </div>
      `;
      wrap.onclick = () => {
        audio.playSfx("blip");
        sm.selectedDexSpecies = null;
        renderStartMenu();
      };
      subBody.appendChild(wrap);
      const c = document.getElementById("start-dex-canvas");
      const spr = engine.pokemonSprites[sp] || engine.pokemonSprites.PIKACHU;
      engine.render2BitGraphicToCanvas(c, spr, "PAL_YELLOWMON");
      return;
    }

    // ShowPokedexMenu (engine/menus/pokedex.asm): CONTENTS list on left, SEEN/OWN + DATA/CRY/AREA/QUIT on right
    const dexMenu = document.createElement("div");
    dexMenu.className = "gb-pokedex-menu";
    const leftCol = document.createElement("div");
    leftCol.className = "gb-pokedex-left";
    leftCol.innerHTML = `<div class="gb-pokedex-title">CONTENTS</div>`;
    const listWrap = document.createElement("div");
    listWrap.className = "gb-pokedex-list";

    allStats.forEach((st, idx) => {
      const owned = state.caughtPokemon.has(st.species);
      const seen = owned || state.seenPokemon.has(st.species);
      const isSelected = idx === sm.subCursor;
      const row = document.createElement("button");
      row.type = "button";
      row.className = `gb-dex-row ${isSelected ? "active" : ""}`;
      row.innerHTML = `
        <div class="gb-dex-num">${String(idx + 1).padStart(3, "0")}</div>
        <div class="gb-dex-name-line">
          <span class="bcursor">${isSelected ? "▶" : " "}</span>
          <span style="width:11px;display:inline-block">${owned ? "◓" : " "}</span>
          <span>${seen ? st.species.replace(/_/g, " ") : "----------"}</span>
        </div>
      `;
      row.onclick = () => {
        sm.subCursor = idx;
        if (seen) {
          audio.playSfx("blip");
          sm.selectedDexSpecies = st.species;
        } else {
          audio.playSfx("bump");
        }
        renderStartMenu();
      };
      listWrap.appendChild(row);
    });
    leftCol.appendChild(listWrap);

    const rightCol = document.createElement("div");
    rightCol.className = "gb-pokedex-right";
    const seenCount = Math.max(state.caughtPokemon.size, state.seenPokemon.size);
    rightCol.innerHTML = `
      <div class="gb-pokedex-counts">
        <div>SEEN<div class="gb-pokedex-count-num">${Math.min(151, seenCount)}</div></div>
        <div>OWN<div class="gb-pokedex-count-num">${state.caughtPokemon.size}</div></div>
      </div>
      <div class="gb-pokedex-cmds">
        <button type="button" class="gb-pokedex-cmd-btn" data-dex-cmd="DATA">▶DATA</button>
        <button type="button" class="gb-pokedex-cmd-btn" data-dex-cmd="CRY"> CRY</button>
        <button type="button" class="gb-pokedex-cmd-btn" data-dex-cmd="AREA"> AREA</button>
        <button type="button" class="gb-pokedex-cmd-btn" data-dex-cmd="QUIT"> QUIT</button>
      </div>
    `;
    rightCol.querySelectorAll("[data-dex-cmd]").forEach((btn) => {
      btn.onclick = () => {
        const cmd = btn.dataset.dexCmd;
        const cur = allStats[sm.subCursor];
        const isSeen =
          cur &&
          (state.seenPokemon.has(cur.species) ||
            state.caughtPokemon.has(cur.species));
        if (cmd === "DATA") {
          if (isSeen) {
            audio.playSfx("blip");
            sm.selectedDexSpecies = cur.species;
            renderStartMenu();
          } else {
            audio.playSfx("bump");
          }
        } else if (cmd === "CRY") {
          if (isSeen) {
            audio.playSfx("pika");
          } else {
            audio.playSfx("bump");
          }
        } else if (cmd === "AREA") {
          audio.playSfx("blip");
        } else if (cmd === "QUIT") {
          audio.playSfx("blip");
          sm.subView = null;
          renderStartMenu();
        }
      };
    });

    dexMenu.appendChild(leftCol);
    dexMenu.appendChild(rightCol);
    subBody.appendChild(dexMenu);
    const activeRow = listWrap.querySelector(".gb-dex-row.active");
    if (activeRow && typeof activeRow.scrollIntoView === "function") {
      activeRow.scrollIntoView({ block: "nearest" });
    }
  } else if (sm.subView === "POKEMON") {
    if (subTitle) subTitle.textContent = `PARTY POKéMON (${state.party.length}/6)`;
    // Authentic Gen I DisplayPartyMenu (engine/menus/party_menu.asm)
    const partyScreen = document.createElement("div");
    partyScreen.className = "battle-party-screen";
    partyScreen.style.position = "relative";
    partyScreen.style.width = "100%";
    partyScreen.style.height = "100%";

    const pList = document.createElement("div");
    pList.className = "battle-party-list";

    if (state.party.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.style.padding = "12px 8px";
      emptyMsg.textContent = "RED has no POKéMON yet!";
      pList.appendChild(emptyMsg);
    } else {
      state.party.forEach((mon, idx) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = `bparty-row ${idx === sm.subCursor ? "selected" : ""}`;
        const pct = Math.max(0, Math.round((mon.hp / Math.max(1, mon.maxHp)) * 100));
        const barColor =
          pct > 50 ? "#22c55e" : pct > 20 ? "#eab308" : "#ef4444";
        const curChar =
          idx === sm.subCursor
            ? sm.partyActionOpen
              ? "▷"
              : "▶"
            : idx === sm.partySwitchIdx
            ? "▷"
            : " ";
        const iconChar = mon.species === "PIKACHU" ? "⚡" : "◓";
        row.innerHTML = `
          <span class="bcursor">${curChar}</span>
          <span class="bparty-icon">${iconChar}</span>
          <div class="bparty-main">
            <div class="bparty-top">
              <span>${mon.nickname}</span>
              <span>${mon.hp <= 0 ? "FNT" : mon.status !== "OK" ? mon.status : `:L${mon.level}`}</span>
            </div>
            <div class="bparty-hp-wrap">
              <span class="hp-tag">HP:</span>
              <div class="hp-track"><div class="hp-fill" style="width:${pct}%;background:${barColor}"></div></div>
            </div>
          </div>
          <span class="bparty-nums">${String(mon.hp).padStart(2, " ")}/${String(mon.maxHp).padStart(2, " ")}</span>
        `;
        row.onclick = () => {
          audio.playSfx("blip");
          if (sm.partySwitchIdx !== null) {
            const fromIdx = sm.partySwitchIdx;
            const tmp = state.party[fromIdx];
            state.party[fromIdx] = state.party[idx];
            state.party[idx] = tmp;
            sm.partySwitchIdx = null;
            sm.subCursor = idx;
            saveProgress();
            renderStartMenu();
          } else {
            sm.subCursor = idx;
            sm.partyActionOpen = true;
            sm.partyActionCursor = 0;
            renderStartMenu();
          }
        };
        pList.appendChild(row);
      });
    }

    const footer = document.createElement("div");
    footer.className = "gb-poke-box battle-party-footer";
    footer.innerHTML = `<span>${
      sm.partySwitchIdx !== null ? "Move POKéMON where?" : "Choose a POKéMON."
    }</span>`;

    partyScreen.appendChild(pList);
    partyScreen.appendChild(footer);

    // Bottom-right Party Action Submenu (HM moves + STATS / SWITCH / CANCEL)
    if (sm.partyActionOpen && state.party[sm.subCursor]) {
      const selMon = state.party[sm.subCursor];
      const acts = getPartyActionItems(selMon);
      const subMenu = document.createElement("div");
      subMenu.className = "gb-poke-box battle-party-sub-menu";
      acts.forEach((act, aIdx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bmenu-item";
        btn.innerHTML = `<span class="bcursor">${
          aIdx === sm.partyActionCursor ? "▶" : " "
        }</span>${act.label}`;
        btn.onclick = (e) => {
          e.stopPropagation();
          sm.partyActionCursor = aIdx;
          handleStartMenuInput("A");
        };
        subMenu.appendChild(btn);
      });
      partyScreen.appendChild(subMenu);
    }

    // Authentic Gen I StatusScreen Modal
    if (sm.partyStatsOpen && state.party[sm.subCursor]) {
      const sMon = state.party[sm.subCursor];
      const allStats = getOrderedPokedexEntries();
      const dexNum = (allStats.find((s) => s.species === sMon.species)?.dexNum) || 25;
      const statsModal = document.createElement("div");
      statsModal.className = "gb-poke-box battle-stats-modal";
      statsModal.innerHTML = `
        <div class="battle-stats-content">
          <div class="stats-top-grid">
            <div style="display:flex;flex-direction:column;align-items:center">
              <canvas id="start-party-stats-canvas" width="56" height="56" style="width:48px;height:48px"></canvas>
              <span>No.${String(Math.max(1, dexNum)).padStart(3, "0")}</span>
            </div>
            <div>
              <div><strong>${sMon.nickname}</strong> &nbsp;:L${sMon.level}</div>
              <div>HP: ${sMon.hp}/${sMon.maxHp} &nbsp;${sMon.status}</div>
              <div>TYPE1/ ${sMon.types.join("/")}</div>
              <div>OT/ RED</div>
            </div>
          </div>
          <div class="stats-mid-grid">
            <div>ATTACK &nbsp;${sMon.atk}<br/>DEFENSE ${sMon.def}</div>
            <div>SPEED &nbsp;&nbsp;${sMon.spd}<br/>SPECIAL ${sMon.spc}</div>
          </div>
          <div class="stats-moves-box">
            ${sMon.moves
              .map(
                (mv) =>
                  `<div style="display:flex;justify-content:space-between"><span>${mv.name}</span><span>PP ${mv.pp}/${mv.maxPp}</span></div>`
              )
              .join("")}
          </div>
        </div>
      `;
      statsModal.onclick = () => {
        audio.playSfx("blip");
        sm.partyStatsOpen = false;
        renderStartMenu();
      };
      partyScreen.appendChild(statsModal);
      setTimeout(() => {
        const stCanvas = document.getElementById("start-party-stats-canvas");
        const spr =
          engine.pokemonSprites[sMon.species] || engine.pokemonSprites.PIKACHU;
        engine.render2BitGraphicToCanvas(stCanvas, spr, "PAL_YELLOWMON");
      }, 0);
    }

    subBody.appendChild(partyScreen);
  } else if (sm.subView === "ITEM") {
    if (subTitle) subTitle.textContent = `ITEM BAG`;
    const bagWrap = document.createElement("div");
    bagWrap.style.padding = "8px 10px";
    bagWrap.style.display = "flex";
    bagWrap.style.flexDirection = "column";
    bagWrap.style.gap = "3px";
    bagWrap.style.height = "100%";
    bagWrap.style.overflowY = "auto";

    if (state.bag.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.style.padding = "4px 2px";
      emptyEl.textContent = "No items in BAG.";
      bagWrap.appendChild(emptyEl);
    }
    state.bag.forEach((item, idx) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "bbag-row";
      row.innerHTML = `<span class="bbag-left"><span class="bcursor">${
        idx === sm.subCursor ? "▶" : " "
      }</span><span>${item.name}</span></span><span class="bbag-qty">${
        item.kind === "hm" ? "HM" : `×${String(item.qty).padStart(2, " ")}`
      }</span>`;
      row.onclick = () => {
        sm.subCursor = idx;
        useBagItemInStartMenu(idx);
      };
      bagWrap.appendChild(row);
    });
    const cancelIdx = state.bag.length;
    const cancelRow = document.createElement("button");
    cancelRow.type = "button";
    cancelRow.className = "bbag-row";
    cancelRow.innerHTML = `<span class="bbag-left"><span class="bcursor">${
      sm.subCursor === cancelIdx ? "▶" : " "
    }</span><span>CANCEL</span></span><span></span>`;
    cancelRow.onclick = () => {
      useBagItemInStartMenu(cancelIdx);
    };
    bagWrap.appendChild(cancelRow);
    subBody.appendChild(bagWrap);
  } else if (sm.subView === "RED") {
    if (subTitle) subTitle.textContent = `TRAINER CARD — RED`;
    const earnedIds = new Set(getEarnedBadges().map((b) => b.id));
    const badgeLine1 = KANTO_GYM_BADGES.slice(0, 4)
      .map((b) => `${earnedIds.has(b.id) ? "●" : "○"} ${b.id}`)
      .join(" ");
    const badgeLine2 = KANTO_GYM_BADGES.slice(4, 8)
      .map((b) => `${earnedIds.has(b.id) ? "●" : "○"} ${b.id}`)
      .join(" ");
    const cardWrap = document.createElement("div");
    cardWrap.style.padding = "8px 10px";
    cardWrap.style.display = "flex";
    cardWrap.style.flexDirection = "column";
    cardWrap.style.gap = "5px";
    cardWrap.innerHTML = `
      <div class="stats-top-grid">
        <canvas id="start-red-canvas" width="40" height="40" style="width:48px;height:48px"></canvas>
        <div>
          <div><strong>NAME/</strong> RED</div>
          <div><strong>MONEY/</strong> ¥${3000 + state.defeatedTrainers.size * 350}</div>
          <div><strong>PIKA ♥/</strong> ${state.pikachu.friendship}/255</div>
        </div>
      </div>
      <div><strong>ZONES VISITED:</strong> ${state.visitedZones.size} / 220</div>
      <div><strong>POKéDEX OWN:</strong> ${state.caughtPokemon.size} / 151</div>
      <div><strong>BADGES (${earnedIds.size}/8):</strong><br/>${badgeLine1}<br/>${badgeLine2}</div>
    `;
    subBody.appendChild(cardWrap);
    const rc = document.getElementById("start-red-canvas");
    const spr = engine.trainerSprites.BROCK || engine.pokemonSprites.PIKACHU;
    engine.render2BitGraphicToCanvas(rc, spr, "PAL_REDMON");
  } else if (sm.subView === "SAVE") {
    if (subTitle) subTitle.textContent = `SAVE GAME (sMainData)`;
    saveProgress();
    const saveWrap = document.createElement("div");
    saveWrap.style.padding = "8px 10px";
    saveWrap.style.display = "flex";
    saveWrap.style.flexDirection = "column";
    saveWrap.style.gap = "4px";
    saveWrap.innerHTML = `
      <div><strong>PLAYER:</strong> RED</div>
      <div><strong>BADGES:</strong> ${getEarnedBadges().length}</div>
      <div><strong>POKéDEX:</strong> ${state.caughtPokemon.size}</div>
      <div class="gb-poke-box" style="margin-top:8px;padding:6px 8px">
        Saving... Don't turn off the power!<br/>
        <strong>RED saved the game!</strong>
      </div>
    `;
    subBody.appendChild(saveWrap);
  } else if (sm.subView === "OPTION") {
    if (subTitle) subTitle.textContent = `OPTION`;
    const optWrap = document.createElement("div");
    optWrap.style.padding = "8px 10px";
    optWrap.style.display = "flex";
    optWrap.style.flexDirection = "column";
    optWrap.style.gap = "5px";
    const palRow = document.createElement("button");
    palRow.type = "button";
    palRow.className = "sub-list-row";
    palRow.innerHTML = `<span>PALETTE MODE</span><span>${engine.paletteMode.toUpperCase()}</span>`;
    palRow.onclick = () => {
      const modes = ["reference", "sgb", "cgb", "dmg"];
      const next = modes[(modes.indexOf(engine.paletteMode) + 1) % modes.length];
      engine.paletteMode = next;
      const sel = document.getElementById("palette-select");
      if (sel) sel.value = next;
      audio.playSfx("blip");
      renderAllCanvases();
      renderStartMenu();
    };
    const bgmRow = document.createElement("button");
    bgmRow.type = "button";
    bgmRow.className = "sub-list-row";
    bgmRow.innerHTML = `<span>SOUND / BGM</span><span>${audio.enabled ? "ON" : "OFF"}</span>`;
    bgmRow.onclick = () => {
      const on = audio.toggle();
      const btn = document.getElementById("btn-audio-toggle");
      if (btn) {
        btn.textContent = on ? "🔊 BGM: ON" : "🔇 BGM: OFF";
        btn.classList.toggle("active", on);
      }
      renderStartMenu();
    };
    const wildRow = document.createElement("button");
    wildRow.type = "button";
    wildRow.className = "sub-list-row";
    wildRow.innerHTML = `<span>WILD ENCOUNTERS</span><span>${state.wildEncountersEnabled ? "ON" : "OFF"}</span>`;
    wildRow.onclick = () => {
      state.wildEncountersEnabled = !state.wildEncountersEnabled;
      audio.playSfx("blip");
      renderStartMenu();
    };
    optWrap.appendChild(palRow);
    optWrap.appendChild(bgmRow);
    optWrap.appendChild(wildRow);
    subBody.appendChild(optWrap);
  }
}

// 220-Zone Visual Atlas Modal
function openVisualAtlasModal() {
  const modal = document.getElementById("atlas-modal");
  modal.classList.remove("hidden");
  renderAtlasGrid();
}

let atlasThumbCanvas = null;
let atlasObserver = null;

function renderAtlasGrid() {
  const grid = document.getElementById("atlas-grid");
  if (!grid) return;
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

  const countLbl = document.getElementById("atlas-count-label");
  if (countLbl) {
    countLbl.textContent = `Showing ${zones.length} Loadable Zone Segments`;
  }
  if (atlasObserver) {
    atlasObserver.disconnect();
    atlasObserver = null;
  }
  grid.innerHTML = "";

  if (!atlasThumbCanvas) {
    atlasThumbCanvas = document.createElement("canvas");
  }

  if (typeof IntersectionObserver !== "undefined") {
    atlasObserver = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const img = entry.target;
          obs.unobserve(img);
          const zConst = img.dataset.zoneConst;
          const zObj = engine.zonesByConst[zConst];
          if (zObj) {
            engine.renderFullZone(atlasThumbCanvas, zObj, {
              showBorder: false,
              showEntities: false,
              showWarps: false,
              showGrid: false,
            });
            img.src = atlasThumbCanvas.toDataURL("image/png");
          }
        }
      },
      { root: grid, rootMargin: "200px" }
    );
  }

  const frag = document.createDocumentFragment();
  zones.forEach((z) => {
    const card = document.createElement("div");
    card.className = `atlas-card ${
      z.constName === state.currentZone.constName ? "active" : ""
    }`;
    const thumbImg = document.createElement("img");
    thumbImg.className = "atlas-thumb-canvas";
    thumbImg.alt = z.displayName;
    thumbImg.dataset.zoneConst = z.constName;
    if (atlasObserver) {
      atlasObserver.observe(thumbImg);
    }

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

    card.appendChild(thumbImg);
    card.appendChild(info);
    card.onclick = () => {
      document.getElementById("atlas-modal")?.classList.add("hidden");
      loadZone(z, { resetParent: true });
    };
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

// Main 60fps loop with error boundary & dirty-state throttling
let lastAnimTick = 0;
let lastEvoSpriteKey = "";
const heldDirs = new Set();

function gameLoop(now) {
  try {
    if (document.hidden) {
      requestAnimationFrame(gameLoop);
      return;
    }

    // 1. Update water & flower tile animation counter every 280ms (matching ~20 Game Boy frames)
    if (now - lastAnimTick > 280) {
      lastAnimTick = now;
      engine.animCounter = (engine.animCounter + 1) & 7;
      if (state.dialogue && state.dialogue.pikachuMood) {
        const faceCanvas = document.getElementById("dialogue-pika-canvas");
        const frames = state.dialogue.pikachuMood.frames;
        if (faceCanvas && Array.isArray(frames) && frames.length > 0) {
          const frameKey = frames[Math.floor(now / 320) % frames.length];
          engine.render2BitGraphicToCanvas(
            faceCanvas,
            engine.pikachuFaces[frameKey],
            "PAL_PIKACHU_PORTRAIT"
          );
        }
      }
    }

    // 1b. Update active EvolveMon animation without full DOM rebuilds every frame
    if (state.battle && state.battle.menuState === "EVOLVING" && state.battle.evolution) {
      const evo = state.battle.evolution;
      const elapsed = now - evo.startTime;
      if (elapsed >= evo.duration) {
        lastEvoSpriteKey = "";
        completeEvolutionAnimation();
      } else {
        const t = Math.min(1, elapsed / evo.duration);
        const periodMs = Math.max(70, 260 - t * 180);
        const showNew = t > 0.15 && Math.floor(elapsed / periodMs) % 2 === 1;
        const sprKey = showNew ? evo.newSpecies : evo.oldSpecies;
        const evoStage = document.getElementById("battle-evo-stage");
        if (evoStage) {
          evoStage.classList.toggle("evo-flash-silhouette", t > 0.15 && t < 0.92);
        }
        if (sprKey !== lastEvoSpriteKey) {
          lastEvoSpriteKey = sprKey;
          const evoCanvas = document.getElementById("battle-evo-canvas");
          const spr = engine.pokemonSprites[sprKey] || engine.pokemonSprites.PIKACHU;
          engine.render2BitGraphicToCanvas(evoCanvas, spr, "PAL_YELLOWMON");
        }
      }
    }

    // 2. Update Player smooth step interpolation
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
      !state.startMenu.open
    ) {
      const lastDir = Array.from(heldDirs).pop();
      attemptStep(lastDir);
    }

    // 3. Fluid 60fps NPC movement & idle turning (skip while in battle)
    if (!state.battle && state.currentZone) {
      const zone = state.currentZone;
      const ts = engine.tilesetsByConst[zone.tileset];
      for (const npc of state.npcs) {
        if (!npc.defaultVisible && !state.showHiddenObjects) continue;
        if (npc.collected) continue;

        // 3a. Interpolate active 16-frame step animation (UpdateSpriteInWalkingAnimation)
        if (npc.moveAnim) {
          const na = npc.moveAnim;
          const nt = Math.min(1, (now - na.startTime) / na.duration);
          npc.renderX = na.fromX + (na.toX - na.fromX) * nt;
          npc.renderY = na.fromY + (na.toY - na.fromY) * nt;
          npc.isWalking = nt > 0.12 && nt < 0.88;
          if (nt >= 1) {
            npc.renderX = npc.x;
            npc.renderY = npc.y;
            npc.isWalking = false;
            npc.moveAnim = null;
          }
          continue;
        }

        // 3b. Per-NPC random movement delay timer (SPRITESTATEDATA2_MOVEMENTDELAY)
        if (state.dialogue || state.startMenu.open) continue;
        if (now < (npc.nextMoveTime || 0)) continue;
        npc.nextMoveTime = now + 650 + Math.random() * 1450;

        if (npc.movement === "WALK") {
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
            nx < zone.width * 2 &&
            ny >= 0 &&
            ny < zone.height * 2 &&
            !(nx === state.player.x && ny === state.player.y) &&
            !(state.pikachu.visible && nx === state.pikachu.x && ny === state.pikachu.y) &&
            !state.npcs.some(
              (other) =>
                other !== npc &&
                !other.collected &&
                (other.defaultVisible || state.showHiddenObjects) &&
                other.x === nx &&
                other.y === ny
            ) &&
            engine.isStepPassable(zone, npc.x, npc.y, nx, ny)
          ) {
            const destTile = engine.getCollisionTileAtStep(zone, nx, ny);
            if (ts && !ts.doorSet.has(destTile) && !ts.warpSet.has(destTile)) {
              const fromX = npc.x;
              const fromY = npc.y;
              npc.x = nx;
              npc.y = ny;
              npc.stepParity = !npc.stepParity;
              npc.isWalking = true;
              npc.moveAnim = {
                fromX,
                fromY,
                toX: nx,
                toY: ny,
                startTime: now,
                duration: 265, // 16 Game Boy frames at 60fps
              };
            }
          }
        } else if (
          npc.movement === "STAY" &&
          (npc.dir === "ANY_DIR" || npc.dir === "UP_DOWN" || npc.dir === "LEFT_RIGHT")
        ) {
          // ChangeFacingDirection in engine/overworld/movement.asm:144, 245
          const dirs =
            npc.dir === "UP_DOWN"
              ? ["UP", "DOWN"]
              : npc.dir === "LEFT_RIGHT"
              ? ["LEFT", "RIGHT"]
              : ["DOWN", "UP", "LEFT", "RIGHT"];
          npc.facing = dirs[Math.floor(Math.random() * dirs.length)];
        }
      }
    }

    renderAllCanvases(false);
  } catch (err) {
    console.error("GameLoop recovered from error:", err);
  }
  requestAnimationFrame(gameLoop);
}

function setupControlsAndEvents() {
  // Keyboard controls
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
    if (state.battle) {
      if (keyToDir[e.code]) {
        e.preventDefault();
        handleBattleInput(keyToDir[e.code]);
      } else if (
        e.code === "Space" ||
        e.code === "Enter" ||
        e.code === "KeyZ"
      ) {
        e.preventDefault();
        handleBattleInput("A");
      } else if (e.code === "KeyX" || e.code === "Backspace") {
        e.preventDefault();
        handleBattleInput("B");
      } else if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        handleBattleInput("SELECT");
      } else if (e.code === "Escape") {
        e.preventDefault();
        state.battle = null;
        renderBattleModal();
      }
      return;
    }

    if (state.startMenu.open) {
      if (keyToDir[e.code]) {
        e.preventDefault();
        handleStartMenuInput(keyToDir[e.code]);
      } else if (
        e.code === "Space" ||
        e.code === "KeyZ"
      ) {
        e.preventDefault();
        handleStartMenuInput("A");
      } else if (e.code === "KeyX" || e.code === "Backspace" || e.code === "Escape") {
        e.preventDefault();
        handleStartMenuInput("B");
      } else if (e.code === "Enter" || e.code === "KeyM") {
        e.preventDefault();
        handleStartMenuInput("START");
      }
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
      interactInFront();
    } else if (e.code === "KeyM") {
      e.preventDefault();
      toggleStartMenu();
    } else if (e.code === "KeyX" || e.code === "Escape") {
      if (state.dialogue) {
        state.dialogue = null;
        renderDialogueModal();
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

  window.addEventListener("blur", () => {
    heldDirs.clear();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      heldDirs.clear();
    }
  });

  // On-screen D-pad & A/B buttons
  document.querySelectorAll("[data-dpad]").forEach((btn) => {
    const dir = btn.dataset.dpad;
    const startHold = (e) => {
      e.preventDefault();
      if (state.battle) {
        handleBattleInput(dir);
        return;
      }
      if (state.startMenu.open) {
        handleStartMenuInput(dir);
        return;
      }
      heldDirs.add(dir);
      attemptStep(dir);
    };
    const endHold = () => heldDirs.delete(dir);
    btn.addEventListener("mousedown", startHold);
    btn.addEventListener("mouseup", endHold);
    btn.addEventListener("mouseleave", endHold);
    btn.addEventListener("touchstart", startHold, { passive: false });
    btn.addEventListener("touchend", endHold);
    btn.addEventListener("touchcancel", endHold);
  });

  document.getElementById("btn-gb-a")?.addEventListener("click", () => {
    if (state.battle) {
      handleBattleInput("A");
    } else if (state.startMenu.open) {
      handleStartMenuInput("A");
    } else {
      interactInFront();
    }
  });
  document.getElementById("btn-gb-b")?.addEventListener("click", () => {
    if (state.dialogue) {
      state.dialogue = null;
      renderDialogueModal();
    } else if (state.battle) {
      handleBattleInput("B");
    } else if (state.startMenu.open) {
      handleStartMenuInput("B");
    } else {
      state.player.mode = state.player.mode === "bike" ? "walk" : "bike";
      if (state.player.mode === "walk") {
        state.pikachu.spawnDelayed = false;
        state.pikachu.x = state.player.x;
        state.pikachu.y = state.player.y;
        state.pikachu.renderX = state.player.x;
        state.pikachu.renderY = state.player.y;
      }
      syncPikachuOverworldState();
    }
  });
  document.getElementById("btn-gb-start")?.addEventListener("click", () => {
    if (state.startMenu.open) {
      handleStartMenuInput("START");
    } else {
      toggleStartMenu();
    }
  });
  document.getElementById("btn-gb-select")?.addEventListener("click", () => {
    if (state.battle) {
      handleBattleInput("SELECT");
    } else {
      openPikachuInteraction();
    }
  });

  // Click on Full Zone Canvas to teleport / walk or trigger warp!
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
        audio.playSfx("blip");
        openDialogue(`SIGNPOST (${s.x}, ${s.y})`, s.text);
        return;
      }
    }
    // Otherwise move Red + Pikachu there (respecting HM03 SURF for water tiles)
    const clickTile = engine.getCollisionTileAtStep(z, stepX, stepY);
    const clickWater = isWaterTile(z, clickTile);
    if (clickWater && state.player.mode !== "surf" && !state.autoSurf) {
      audio.playSfx("bump");
      openDialogue(
        "WATER'S EDGE",
        "The water is deep! Stand at the shoreline and use HM03 SURF to cross.",
        {
          fieldMoveAction: {
            label: "🌊 USE HM03 SURF",
            moveId: "SURF",
          },
        }
      );
      return;
    }
    state.player.mode = clickWater ? "surf" : "walk";
    state.player.x = stepX;
    state.player.y = stepY;
    state.player.renderX = stepX;
    state.player.renderY = stepY;
    const adjX = Math.max(0, stepX - 1);
    const adjTile = engine.getCollisionTileAtStep(z, adjX, stepY);
    state.pikachu.x = isWaterTile(z, adjTile) ? stepX : adjX;
    state.pikachu.y = stepY;
    state.pikachu.renderX = state.pikachu.x;
    state.pikachu.renderY = state.pikachu.y;
    state.pikachu.spawnDelayed = false;
    syncPikachuOverworldState();
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
      const workspace = document.getElementById("workspace");
      if (stage) stage.dataset.viewMode = state.viewMode;
      if (workspace) workspace.dataset.viewMode = state.viewMode;
      if (state.viewMode !== "gb") {
        renderZoneList();
        renderKantoTownMap();
      }
      renderAllCanvases(true);
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
    if (state.player.mode === "walk") {
      state.pikachu.spawnDelayed = false;
      state.pikachu.x = state.player.x;
      state.pikachu.y = state.player.y;
      state.pikachu.renderX = state.player.x;
      state.pikachu.renderY = state.player.y;
    }
    syncPikachuOverworldState();
    e.currentTarget.classList.toggle("active", state.player.mode === "bike");
  });
  document.getElementById("btn-check-pikachu")?.addEventListener("click", () => {
    openPikachuInteraction();
  });
  document.getElementById("caught-counter")?.addEventListener("click", () => {
    audio.playSfx("blip");
    const caughtList = Array.from(state.caughtPokemon)
      .map((s) => s.replace(/_/g, " "))
      .join(", ");
    openDialogue(
      "RED'S POKéDEX & JOURNEY LOG",
      `POKéDEX CAUGHT (${state.caughtPokemon.size}): ${caughtList}\n\nKANTO ZONES VISITED: ${state.visitedZones.size} / 220 • TRAINERS DEFEATED: ${state.defeatedTrainers.size}`
    );
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

  // Dialogue & Authentic Gen I Battle Menu buttons
  document.getElementById("dialogue-textbox")?.addEventListener("click", (e) => {
    if (e.target.closest("#dialogue-battle-btn")) return;
    advanceDialogue();
  });
  document.getElementById("dialogue-next-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    advanceDialogue();
  });
  document.getElementById("dialogue-close-btn")?.addEventListener("click", () => {
    state.dialogue = null;
    renderDialogueModal();
  });

  document.getElementById("battle-exit-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    state.battle = null;
    renderBattleModal();
  });

  document.getElementById("battle-msg-box")?.addEventListener("click", () => {
    if (state.battle && state.battle.menuState === "MESSAGE") {
      advanceBattleMessage();
    }
  });

  document.querySelectorAll("[data-bmenu-idx]").forEach((btn) => {
    const idx = Number(btn.dataset.bmenuIdx);
    btn.addEventListener("mouseenter", () => {
      if (state.battle && state.battle.menuState === "MAIN_MENU") {
        state.battle.mainCursor = idx;
        renderBattleModal();
      }
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!state.battle) return;
      state.battle.mainCursor = idx;
      state.battle.menuState = "MAIN_MENU";
      handleBattleInput("A");
    });
  });

  document.querySelectorAll("[data-smenu-idx]").forEach((btn) => {
    const idx = Number(btn.dataset.smenuIdx);
    btn.addEventListener("mouseenter", () => {
      if (state.battle && state.battle.menuState === "MAIN_MENU") {
        state.battle.mainCursor = idx;
        renderBattleModal();
      }
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!state.battle) return;
      state.battle.mainCursor = idx;
      state.battle.menuState = "MAIN_MENU";
      handleBattleInput("A");
    });
  });

  document.getElementById("battle-fight-back-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    handleBattleInput("B");
  });

  document.getElementById("battle-party-close-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    handleBattleInput("B");
  });

  document.querySelectorAll("[data-psub-act]").forEach((btn, idx) => {
    btn.addEventListener("mouseenter", () => {
      if (state.battle && state.battle.menuState === "PARTY_SUB") {
        state.battle.partySubCursor = idx;
        renderBattleModal();
      }
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!state.battle) return;
      state.battle.partySubCursor = idx;
      handleBattleInput("A");
    });
  });

  document.getElementById("battle-stats-close-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    handleBattleInput("B");
  });

  document.getElementById("battle-evo-cancel-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    cancelEvolutionAnimation();
  });

  // In-game START Menu item click listeners
  document.querySelectorAll("[data-smenu-item]").forEach((btn) => {
    const idx = Number(btn.dataset.smenuItem);
    btn.addEventListener("mouseenter", () => {
      if (state.startMenu.open && !state.startMenu.subView) {
        state.startMenu.cursor = idx;
        renderStartMenu();
      }
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.startMenu.cursor = idx;
      state.startMenu.subView = null;
      handleStartMenuInput("A");
    });
  });

  document.getElementById("start-sub-back-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    handleStartMenuInput("B");
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
  loadZone,
  interactInFront,
  openPikachuInteraction,
  triggerWildEncounter,
  handleBattleInput,
  executeBattleAction,
  buildMonInstance,
  evolvePokemon,
  levelUpPokemon,
  cancelEvolutionAnimation,
  completeEvolutionAnimation,
  modifyPikachuHappiness,
  triggerNpcDialogue,
  toggleStartMenu,
  handleStartMenuInput,
  renderStartMenu,
  healParty,
  useFieldMove,
  teachHmMove,
  giveBagItem,
  hasHmOrMove,
  triggerOakIntroGrassEvent,
  triggerViridianOldManTutorial,
  startScriptedCatchScene,
  awardStarterPikachuInLab,
};

window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  setupControlsAndEvents();
  if (state.viewMode !== "gb") {
    renderZoneList();
  }
  loadZone("PALLET_TOWN");
  requestAnimationFrame(gameLoop);
});
