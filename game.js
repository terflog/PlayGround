(() => {
  'use strict';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height, T = 16;
  const $ = id => document.getElementById(id);

  // Pre-build a 1998 Game Boy Color Bayer-Dither + Pixel Grain texture for authentic source-material grit
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = W;
  grainCanvas.height = H;
  const gctx = grainCanvas.getContext('2d');
  (() => {
    const img = gctx.createImageData(W, H);
    const d = img.data;
    const bayer4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const b = bayer4[y & 3][x & 3];
        const hash = ((x * 374761 + y * 668265) ^ (x * y * 19)) & 31;
        const dark = b < 5 || hash < 4;
        d[i] = dark ? 16 : 245;
        d[i + 1] = dark ? 20 : 238;
        d[i + 2] = dark ? 28 : 210;
        d[i + 3] = dark ? 24 : 9;
      }
    }
    gctx.putImageData(img, 0, 0);
  })();

  const ui = {
    status: $('status-line'),
    area: $('area-label'),
    level: $('level'),
    hpBar: $('hp-bar'),
    hpText: $('hp-text'),
    buddyCount: $('buddy-count'),
    wins: $('win-count'),
    noteTitle: $('note-title'),
    note: $('field-note'),
    goal: $('goal-text'),
    goalCheck: $('goal-check'),
    progress: $('goal-progress'),
    action: $('action-label'),
    toast: $('toast'),
    playerNameDisplay: $('player-name-display'),
    rocketRivalDisplay: $('rocket-rival-display'),
    heroRivalDisplay: $('hero-rival-display'),
    rankDisplay: $('rank-display'),
    rankTierPill: $('rank-tier-pill'),
    meritDisplay: $('merit-display'),
    rankBar: $('rank-bar'),
    gruntCallsign: $('grunt-callsign'),
    jobLedger: $('job-ledger'),
    fundsReadout: $('funds-readout'),
    starterName: $('starter-name'),
    starterOrigin: $('starter-origin'),
    partnerBadgeIcon: $('partner-badge-icon'),
    bikeToggle: $('bike-toggle'),
    upgradeSummaryPill: $('upgrade-summary-pill'),
    upgradePlayerName: $('upgrade-player-name'),
    upgradeBaseName: $('upgrade-base-name'),
    upgradeBizName: $('upgrade-biz-name'),
    btnUpgradePlayer: $('btn-upgrade-player'),
    btnUpgradeBase: $('btn-upgrade-base'),
    btnUpgradeBiz: $('btn-upgrade-biz'),
    execMgmtBar: $('exec-mgmt-bar'),
    execMgmtStatus: $('exec-mgmt-status'),
    btnExecMgmt: $('btn-exec-mgmt'),
    introOverlay: $('intro-overlay'),
    introForm: $('intro-form'),
    playerInput: $('player-name-input'),
    rocketRivalInput: $('rocket-rival-input'),
    heroRivalInput: $('hero-rival-input')
  };

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // 5-Tier Organization Promotion Ladder
  const RANKS = [
    { title: 'PROBATIONARY GRUNT', minMerits: 0, nextMerits: 25 },
    { title: 'FIELD GRUNT', minMerits: 25, nextMerits: 50 },
    { title: 'ROCKET AGENT', minMerits: 50, nextMerits: 80 },
    { title: 'ROCKET ELITE', minMerits: 80, nextMerits: 115 },
    { title: 'ROCKET EXECUTIVE', minMerits: 115, nextMerits: 150 }
  ];

  // Unique Team Rocket Poké Ball Tiers used for stealing Trainer & Wild Pokémon!
  const ROCKET_BALL_TYPES = [
    { name: 'R-SNATCH BALL', short: 'R-BALL', bonusAtk: 4, bonusHp: 6 },
    { name: 'DARK CLONE BALL', short: 'CLONE BALL', bonusAtk: 7, bonusHp: 10 },
    { name: 'SILPH SNAG BALL', short: 'SNAG BALL', bonusAtk: 10, bonusHp: 14 },
    { name: 'SHADOW R-ORB', short: 'SHADOW ORB', bonusAtk: 14, bonusHp: 18 },
    { name: 'MASTER R-BALL', short: 'MASTER R', bonusAtk: 20, bonusHp: 25 }
  ];

  // 3 Upgrade Tracks Unlocked by Ranking Up or Direct Syndicate Investment
  const PLAYER_UPGRADES = [
    { lvl: 1, name: 'LV.1 STOLEN BIKE & R-BALL', atkBonus: 0, hpBonus: 0, cost: 80 },
    { lvl: 2, name: 'LV.2 TURBO BIKE & CLONE BALL', atkBonus: 5, hpBonus: 8, cost: 110 },
    { lvl: 3, name: 'LV.3 SILPH SNAGGLER GLOVE', atkBonus: 12, hpBonus: 16, cost: 140 },
    { lvl: 4, name: 'LV.4 ELITE SHADOW SNATCHER', atkBonus: 20, hpBonus: 26, cost: 180 },
    { lvl: 5, name: 'LV.5 EXECUTIVE MASTER R-BALL', atkBonus: 32, hpBonus: 40, cost: 0 }
  ];

  const BASE_UPGRADES = [
    { lvl: 1, name: 'LV.1 RUNDOWN BARRACKS', label: 'RUNDOWN ROCKET BASE', cost: 90 },
    { lvl: 2, name: 'LV.2 PATCHED WALLS & MED-POD', label: 'FORTIFIED ROCKET BASE', cost: 120 },
    { lvl: 3, name: 'LV.3 WAR ROOM & RADAR ARRAY', label: 'ROCKET COMMAND BUNKER', cost: 150 },
    { lvl: 4, name: 'LV.4 R-BALL SNATCH FOUNDRY', label: 'SYNDICATE CITADEL #07', cost: 190 },
    { lvl: 5, name: 'LV.5 EXECUTIVE FORTRESS HQ', label: 'EXECUTIVE FORTRESS HQ', cost: 0 }
  ];

  const BIZ_UPGRADES = [
    { lvl: 1, name: 'LV.1 BACK-ALLEY HUSTLE', cornerPay: 100, daycarePay: 120, slotMult: 1.0, xpGain: 16, cost: 100 },
    { lvl: 2, name: 'LV.2 MAGNET COILS & INCUBATOR', cornerPay: 160, daycarePay: 180, slotMult: 1.3, xpGain: 22, cost: 130 },
    { lvl: 3, name: 'LV.3 VIP CASINO & BREEDING LAB', cornerPay: 230, daycarePay: 250, slotMult: 1.6, xpGain: 28, cost: 170 },
    { lvl: 4, name: 'LV.4 FUSION SYNDICATE & ARENA', cornerPay: 320, daycarePay: 340, slotMult: 2.0, xpGain: 36, cost: 210 },
    { lvl: 5, name: 'LV.5 KANTO MONOPOLY TYCOON', cornerPay: 450, daycarePay: 480, slotMult: 3.0, xpGain: 48, cost: 0 }
  ];

  // Underground Fight Tournament Tiers inside the Game Corner (unlock as story & rank progress!)
  const TOURNEY_TIERS = [
    {
      tier: 1,
      title: 'TIER 1: CELLAR BRAWL',
      trainer: 'PIT BRAWLER KNOX',
      enemy: { name: 'MACHOP', kind: 'FIGHTING', color: '#8ea4b8', accent: '#546a7d', level: 5, maxHp: 22, hp: 22 },
      prize: 180,
      merits: 35
    },
    {
      tier: 2,
      title: 'TIER 2: SEWER CAGE MATCH',
      trainer: 'SMUGGLER ZANE',
      enemy: { name: 'ARBOK', kind: 'POISON', color: '#9c6ade', accent: '#5d3891', level: 7, maxHp: 26, hp: 26 },
      prize: 260,
      merits: 45
    },
    {
      tier: 3,
      title: 'TIER 3: SYNDICATE BLOODSPORT',
      trainer: 'ROCKET ENFORCER',
      enemy: { name: 'RHYHORN', kind: 'ROCK', color: '#9b968e', accent: '#66615b', level: 9, maxHp: 30, hp: 30 },
      prize: 360,
      merits: 55
    },
    {
      tier: 4,
      title: 'TIER 4: BLACK-MARKET FINALS',
      trainer: 'CHAMPION CHALLENGER',
      enemy: { name: 'GYARADOS', kind: 'WATER/DRAGON', color: '#4d92d6', accent: '#2c5a8f', level: 11, maxHp: 36, hp: 36 },
      prize: 500,
      merits: 70
    },
    {
      tier: 5,
      title: 'TIER 5: APEX GRAND PRIX',
      trainer: 'BOSS PHANTOM',
      enemy: { name: 'ARMORED MEWTWO', kind: 'PSYCHIC/APEX', color: '#c39cf5', accent: '#7a4ec2', level: 14, maxHp: 44, hp: 44 },
      prize: 850,
      merits: 100
    }
  ];

  // 4 Kanto Gyms that come under your Team Rocket control when beaten or stolen from!
  const KANTO_GYMS = [
    {
      id: 1,
      gymName: 'PEWTER GYM',
      leader: 'LEADER BROCK',
      enemy: { name: 'ONIX', kind: 'ROCK/GROUND', color: '#9b968e', accent: '#66615b', level: 6, maxHp: 25, hp: 25 },
      tribute: 180,
      merits: 35
    },
    {
      id: 2,
      gymName: 'CERULEAN GYM',
      leader: 'LEADER MISTY',
      enemy: { name: 'STARMIE', kind: 'WATER/PSYCHIC', color: '#9c78db', accent: '#f6cb49', level: 8, maxHp: 29, hp: 29 },
      tribute: 250,
      merits: 40
    },
    {
      id: 3,
      gymName: 'VERMILION GYM',
      leader: 'LT. SURGE',
      enemy: { name: 'RAICHU', kind: 'ELECTRIC', color: '#f09436', accent: '#f6cb49', level: 10, maxHp: 34, hp: 34 },
      tribute: 340,
      merits: 50
    },
    {
      id: 4,
      gymName: 'VIRIDIAN GYM',
      leader: 'WARDEN KOGA',
      enemy: { name: 'RHYDON', kind: 'GROUND/ROCK', color: '#878b94', accent: '#52565e', level: 12, maxHp: 40, hp: 40 },
      tribute: 480,
      merits: 65
    }
  ];

  // Elite 4 Roster unlocked via Victory Road at Top Rank (Rocket Executive)!
  const ELITE_FOUR = [
    {
      stage: 1,
      title: 'ELITE 4 #1: LORELEI',
      enemy: { name: 'LAPRAS', kind: 'ICE/WATER', color: '#68a8e8', accent: '#4272a8', level: 13, maxHp: 38, hp: 38 },
      prize: 450,
      merits: 60
    },
    {
      stage: 2,
      title: 'ELITE 4 #2: BRUNO',
      enemy: { name: 'MACHAMP', kind: 'FIGHTING', color: '#7a94a8', accent: '#4d6070', level: 14, maxHp: 42, hp: 42 },
      prize: 550,
      merits: 70
    },
    {
      stage: 3,
      title: 'ELITE 4 #3: AGATHA',
      enemy: { name: 'GENGAR', kind: 'GHOST/POISON', color: '#76529c', accent: '#462c66', level: 15, maxHp: 45, hp: 45 },
      prize: 650,
      merits: 80
    },
    {
      stage: 4,
      title: 'ELITE 4 #4: LANCE',
      enemy: { name: 'DRAGONITE', kind: 'DRAGON/FLYING', color: '#f0a848', accent: '#b87228', level: 16, maxHp: 50, hp: 50 },
      prize: 900,
      merits: 100
    }
  ];

  // Exact 1/3 chance for each of the 3 Pokémon Red Version Starters inside the 1 Poké Ball on the stolen bike
  const RED_STARTERS = [
    {
      baseName: 'BULBASAUR',
      name: 'BULBASAUR',
      fusedPrefix: 'VENU-SPLICE',
      number: '#001',
      kind: 'GRASS STARTER (1/3)',
      move1: 'VINE WHIP',
      fusedMove1: 'PLASMA VINE',
      move2: 'TACKLE',
      color: '#6ec287',
      accent: '#3b8c58'
    },
    {
      baseName: 'CHARMANDER',
      name: 'CHARMANDER',
      fusedPrefix: 'CHAR-SPLICE',
      number: '#004',
      kind: 'FIRE STARTER (1/3)',
      move1: 'EMBER',
      fusedMove1: 'DARK FLARE',
      move2: 'SCRATCH',
      color: '#f08750',
      accent: '#c9502e'
    },
    {
      baseName: 'SQUIRTLE',
      name: 'SQUIRTLE',
      fusedPrefix: 'BLAST-SPLICE',
      number: '#007',
      kind: 'WATER STARTER (1/3)',
      move1: 'WATER GUN',
      fusedMove1: 'HYDRO CANNON',
      move2: 'TACKLE',
      color: '#6db7d6',
      accent: '#3d7fa3'
    }
  ];

  function rollRedStarter() {
    // Strict 1/3rd probability (0 = BULBASAUR, 1 = CHARMANDER, 2 = SQUIRTLE)
    const idx = Math.floor(Math.random() * 3);
    return { ...RED_STARTERS[idx] };
  }

  const creatures = [
    { name: 'PIDGEY', kind: 'FLYING', color: '#c9a679', accent: '#8c6843', hp: 20 },
    { name: 'RATTATA', kind: 'NORMAL', color: '#a878c2', accent: '#754d8f', hp: 19 },
    { name: 'ODDISH', kind: 'GRASS', color: '#5c78b8', accent: '#499e62', hp: 22 },
    { name: 'GROWLITHE', kind: 'FIRE', color: '#ee8848', accent: '#423a38', hp: 24 }
  ];

  const SLOT_SYMBOLS = [
    { id: 'R', label: 'R', name: 'ROCKET R', color: '#e04848', bg: '#2b1b24', payout: 300, merits: 35, orb: 1 },
    { id: '7', label: '7', name: 'LUCKY 7', color: '#f6cb49', bg: '#2f2918', payout: 240, merits: 30, orb: 1 },
    { id: 'BOLT', label: '⚡', name: 'THUNDER', color: '#ffe066', bg: '#1e3042', payout: 170, merits: 25, orb: 0 },
    { id: 'STAR', label: '★', name: 'GOLD STAR', color: '#9be5aa', bg: '#1c3329', payout: 140, merits: 20, orb: 0 },
    { id: 'CHERRY', label: '🍒', name: 'CHERRY', color: '#ff8787', bg: '#33202a', payout: 100, merits: 15, orb: 0 }
  ];

  const game = {
    mode: 'intro', // Starts on Team Rocket Initiation with character naming dossier open
    playerName: 'JESS',
    rocketRival: 'VIPER',
    heroRival: 'RED',
    bikeStolen: false,
    ridingBike: false,
    starter: rollRedStarter(),
    rankIndex: 0,
    playerUpgradeIdx: 0,
    baseUpgradeIdx: 0,
    bizUpgradeIdx: 0,
    tourneyTierCleared: 0,
    gymsControlled: 0,
    eliteFourCleared: 0,
    bredCount: 0,
    fusionLevel: 0,
    fusionAtkBonus: 0,
    fusionMult: 1,
    stolenCount: 0,
    stolenPokemon: [],
    advBaseOps: 0,
    advGymOps: 0,
    advBizOps: 0,
    merits: 0,
    funds: 100,
    orbs: 5,
    potions: 2,
    cornerShifts: 0,
    daycareShifts: 0,
    heistDone: 0,
    steps: 0,
    wins: 0,
    caught: 0,
    level: 5,
    xp: 0,
    maxHp: 30,
    hp: 30,
    x: 7,
    y: 8,
    facing: 'down',
    moveClock: 0,
    buddyTrail: [{ x: 7, y: 7 }],
    toastTimer: 0,
    message: 'Complete Team Rocket Initiation in the Rundown Base and steal the Rival Protagonist’s Bike!',
    talkedVex: false,
    defeatedRocketRival: false,
    defeatedHeroRival: false,
    battle: null,
    daycareBanner: 'SURFACE DAYCARE & INFINITE EXPONENTIAL GENE-SPLICING FUSION LAB!',
    mgmtBanner: 'EXECUTIVE COMMAND: MANAGE FORTRESS BASE, CONTROLLED GYMS & SYNDICATE!',
    slots: {
      spinning: false,
      rigged: false,
      reels: [0, 1, 2],
      stopTimes: [0, 0, 0],
      locked: [true, true, true],
      lastWin: 0,
      spins: 0,
      banner: '1: SPIN SLOTS • 2: WORK/RIG • 3: UNDERGROUND FIGHT TOURNEY!'
    },
    sound: true,
    keys: {},
    lastTime: 0,
    anim: 0,
    grassEncounterCooldown: 0
  };

  const mapW = 32, mapH = 26;
  const path = new Set();
  const addPath = (x1, y1, x2, y2) => {
    let x = x1, y = y1;
    path.add(`${x},${y}`);
    while (x !== x2) { x += Math.sign(x2 - x); path.add(`${x},${y}`); }
    while (y !== y2) { y += Math.sign(y2 - y); path.add(`${x},${y}`); }
  };

  addPath(7, 9, 7, 16);
  addPath(5, 16, 12, 16);
  addPath(12, 19, 12, 8);
  addPath(12, 8, 18, 8);
  addPath(12, 12, 26, 12);
  addPath(26, 12, 26, 5);
  addPath(12, 19, 19, 19);

  const baseBounds = { x1: 2, y1: 2, x2: 11, y2: 9, doorX: 7, doorY: 9 };
  const bikeSpot = { x: 7, y: 10 };
  const grassAreas = [
    { x: 21, y: 7, w: 4, h: 4 },
    { x: 23, y: 13, w: 6, h: 7 },
    { x: 4, y: 19, w: 7, h: 4 }
  ];
  const ponds = [{ x: 28, y: 2, w: 3, h: 3 }];
  const solids = new Set();

  for (let x = 0; x < mapW; x++) { solids.add(`${x},0`); solids.add(`${x},${mapH - 1}`); }
  for (let y = 0; y < mapH; y++) { solids.add(`0,${y}`); solids.add(`${mapW - 1},${y}`); }

  for (let x = baseBounds.x1; x <= baseBounds.x2; x++) {
    solids.add(`${x},${baseBounds.y1}`);
    if (x !== baseBounds.doorX) solids.add(`${x},${baseBounds.y2}`);
  }
  for (let y = baseBounds.y1; y <= baseBounds.y2; y++) {
    solids.add(`${baseBounds.x1},${y}`);
    solids.add(`${baseBounds.x2},${y}`);
  }
  [[3, 3], [4, 3], [10, 3], [3, 8]].forEach(([cx, cy]) => solids.add(`${cx},${cy}`));

  const buildings = [
    { x: 14, y: 4, w: 6, h: 4, type: 'corner', label: 'GAME CORNER' },
    { x: 3, y: 12, w: 5, h: 4, type: 'daycare', label: 'DAYCARE' },
    { x: 17, y: 15, w: 5, h: 3, type: 'gym', label: 'KANTO GYM' },
    { x: 24, y: 2, w: 4, h: 2, type: 'victoryGate', label: 'VICTORY ROAD' }
  ];
  buildings.forEach(b => {
    for (let y = b.y; y < b.y + b.h; y++)
      for (let x = b.x; x < b.x + b.w; x++)
        solids.add(`${x},${y}`);
  });

  const trees = [
    [21, 3], [22, 3], [29, 6], [30, 7],
    [28, 21], [29, 21], [30, 21], [12, 23], [13, 23], [14, 23], [15, 23],
    [16, 23], [17, 23], [18, 23], [19, 23], [20, 23], [21, 23], [22, 23],
    [23, 23], [24, 23], [25, 23], [26, 23], [27, 23], [28, 23], [29, 23]
  ];
  trees.forEach(([x, y]) => solids.add(`${x},${y}`));

  const npcs = {
    vex: { x: 7, y: 4, role: 'vex' },
    rocketRival: { x: 9, y: 6, role: 'rocketRival' },
    heroRival: { x: 8, y: 10, role: 'heroRival' },
    cornerBoss: { x: 16, y: 8, role: 'cornerBoss' },
    daycareKeeper: { x: 5, y: 16, role: 'daycareKeeper' },
    gymLeader: { x: 19, y: 18, role: 'gymLeader' },
    victoryGuard: { x: 26, y: 4, role: 'victoryGuard' }
  };

  function currentRocketBall() {
    const idx = clamp(Math.max(game.playerUpgradeIdx, game.baseUpgradeIdx), 0, ROCKET_BALL_TYPES.length - 1);
    return ROCKET_BALL_TYPES[idx];
  }

  function inRundownBase(x, y) {
    return x >= baseBounds.x1 && x <= baseBounds.x2 && y >= baseBounds.y1 && y <= baseBounds.y2;
  }

  function currentUnlockedTourneyTier() {
    return clamp(Math.max(game.rankIndex + 1, game.tourneyTierCleared + 1), 1, TOURNEY_TIERS.length);
  }

  function isTopRank() {
    return game.rankIndex >= RANKS.length - 1;
  }

  function currentAreaName() {
    if (game.mode === 'slots') return 'GAME CORNER & UNDERGROUND ARENA';
    if (game.mode === 'daycare') return 'DAYCARE BREEDING & FUSION LAB';
    if (game.mode === 'management') return 'EXECUTIVE BASE, GYM & BIZ MGMT';
    if (game.mode === 'battle' && game.battle?.tourneyTier) return `UNDERGROUND TOURNEY TIER ${game.battle.tourneyTier}`;
    if (game.mode === 'battle' && game.battle?.gymId) return `${game.battle.gymName} TAKEOVER`;
    if (game.mode === 'battle' && game.battle?.eliteStage) return `VICTORY ROAD • ELITE 4 #${game.battle.eliteStage}`;
    if (inRundownBase(game.x, game.y)) return BASE_UPGRADES[game.baseUpgradeIdx].label;
    if (Math.abs(game.x - npcs.cornerBoss.x) + Math.abs(game.y - npcs.cornerBoss.y) <= 3) return 'GAME CORNER PLAZA';
    if (Math.abs(game.x - npcs.daycareKeeper.x) + Math.abs(game.y - npcs.daycareKeeper.y) <= 3) return 'DAYCARE & LAB ENTRANCE';
    if (Math.abs(game.x - npcs.gymLeader.x) + Math.abs(game.y - npcs.gymLeader.y) <= 3) return `KANTO GYM (${game.gymsControlled}/4 CONTROLLED)`;
    if (Math.abs(game.x - npcs.victoryGuard.x) + Math.abs(game.y - npcs.victoryGuard.y) <= 4) return 'VICTORY ROAD GATE';
    if (game.x > 19 || game.y > 18) return 'ROUTE 1 TALL GRASS';
    return 'OUTSIDE ROCKET BASE';
  }

  function tileType(x, y) {
    if (x < 0 || y < 0 || x >= mapW || y >= mapH) return 'wall';
    if (inRundownBase(x, y)) return 'baseFloor';
    if (ponds.some(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h)) return 'water';
    if (path.has(`${x},${y}`)) return 'path';
    if (grassAreas.some(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h)) return 'tall';
    return 'grass';
  }

  function npcAt(x, y) {
    return Object.values(npcs).find(n => n.x === x && n.y === y) || null;
  }

  function solid(x, y) {
    return solids.has(`${x},${y}`) || tileType(x, y) === 'water' || Boolean(npcAt(x, y));
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // Draws a 2x2 checkerboard dither pattern like 1998 Game Boy Color Pokémon Yellow tiles
  function ditherRect(x, y, w, h, colorA, colorB, step = 2) {
    rect(x, y, w, h, colorA);
    ctx.fillStyle = colorB;
    const rx = Math.round(x), ry = Math.round(y);
    for (let py = 0; py < h; py += step) {
      for (let px = (py % (step * 2) === 0 ? 0 : step); px < w; px += step * 2) {
        ctx.fillRect(rx + px, ry + py, 1, 1);
      }
    }
  }

  // Classic 1998 Pokémon Yellow double-bordered frame with corner rivets
  function drawRetroBox(x, y, w, h, fill = '#f8f4e0', borderOuter = '#181820', borderInner = '#485058') {
    const rx = Math.round(x), ry = Math.round(y), rw = Math.round(w), rh = Math.round(h);
    rect(rx, ry, rw, rh, borderOuter);
    rect(rx + 1, ry + 1, rw - 2, rh - 2, fill);
    rect(rx + 2, ry + 2, rw - 4, rh - 4, borderInner);
    rect(rx + 3, ry + 3, rw - 6, rh - 6, fill);
    // Corner rivets
    rect(rx + 2, ry + 2, 2, 2, borderOuter);
    rect(rx + rw - 4, ry + 2, 2, 2, borderOuter);
    rect(rx + 2, ry + rh - 4, 2, 2, borderOuter);
    rect(rx + rw - 4, ry + rh - 4, 2, 2, borderOuter);
  }

  function pixelText(text, x, y, size = 8, color = '#fff', align = 'left') {
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.fillText(text, Math.round(x), Math.round(y));
  }

  function rounded(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  // Draws the Unique Team Rocket R-Snatch / Dark Clone Poké Ball sprite!
  function drawRocketBall(px, py, scale = 1) {
    ctx.save();
    ctx.translate(Math.round(px), Math.round(py));
    ctx.scale(scale, scale);
    // 1px dark outline circle (10x10 pixel ball)
    rect(-5, -5, 10, 10, '#10141c');
    // Top hemisphere: jet black with purple/crimson dither highlight
    rect(-4, -4, 8, 4, '#24222e');
    rect(-3, -4, 2, 2, '#5c5270');
    // Bottom hemisphere: dark gunmetal & crimson
    rect(-4, 1, 8, 3, '#38303e');
    // Center clasp & crimson 'R' emblem
    rect(-4, 0, 8, 1, '#10141c');
    rect(-1, -3, 3, 3, '#e04848');
    rect(-1, 0, 2, 2, '#f6cb49');
    ctx.restore();
  }

  function stealRivalBike() {
    if (game.bikeStolen && game.starter) return game.starter;
    const chosenStarter = rollRedStarter();
    game.starter = chosenStarter;
    game.bikeStolen = true;
    game.ridingBike = true;
    game.heistDone = 1;
    game.x = bikeSpot.x;
    game.y = bikeSpot.y;
    game.facing = 'down';
    game.buddyTrail = [{ x: bikeSpot.x, y: bikeSpot.y - 1 }];
    game.message = `Left Team Rocket Initiation, met ${game.heroRival}, and stole his Bike! Its 1 Poké Ball contained ${chosenStarter.name} (1/3 Red Starter)!`;
    showToast(`🚲 Stole ${game.heroRival}'s Bike! 1 Poké Ball had ${chosenStarter.name}!`);
    updateUI();
    return chosenStarter;
  }

  function ensureBikeStolen() {
    if (!game.bikeStolen || !game.starter) {
      stealRivalBike();
    }
  }

  function drawTerrain(tx, ty, sx, sy) {
    const type = tileType(tx, ty);
    const seed = (tx * 92821 + ty * 68917) % 97;
    if (type === 'baseFloor') {
      const isWall =
        (ty === baseBounds.y1 || (ty === baseBounds.y2 && tx !== baseBounds.doorX) || tx === baseBounds.x1 || tx === baseBounds.x2);
      if (isWall) {
        rect(sx, sy, T, T, '#181820');
        ditherRect(sx + 1, sy + 1, T - 2, T - 2, game.baseUpgradeIdx >= 2 ? '#232e42' : '#323846', '#1e222b', 2);
        rect(sx, sy, T, 3, game.baseUpgradeIdx >= 3 ? '#f6cb49' : '#586274');
        rect(sx + 2, sy + 5, T - 4, 8, game.baseUpgradeIdx >= 1 ? '#2e3b4e' : '#3d282c');
        if (game.baseUpgradeIdx === 0) rect(sx + 3, sy + 7, 4, 3, '#7d4842');
      } else {
        const floorA = game.baseUpgradeIdx >= 2 ? '#2b3548' : '#3c4250';
        const floorB = game.baseUpgradeIdx >= 2 ? '#222b3b' : '#2e3340';
        ditherRect(sx, sy, T, T, (tx + ty) % 2 === 0 ? floorA : floorB, '#20242e', 3);
        rect(sx, sy, T, 1, '#232834');
        rect(sx, sy, 1, T, '#232834');
        if (game.baseUpgradeIdx >= 3 && tx === 7 && ty >= 4 && ty <= 9) {
          ditherRect(sx + 2, sy, T - 4, T, '#a82834', '#7a1c24', 2);
        }
        if (game.baseUpgradeIdx === 0) {
          if (seed % 4 === 0) {
            rect(sx + 3, sy + 4, 6, 1, '#181c24');
            rect(sx + 7, sy + 5, 1, 5, '#181c24');
          }
          if (seed % 7 === 0) {
            ditherRect(sx + 8, sy + 9, 5, 4, '#243440', '#18222a', 2);
          }
        }
      }
    } else if (type === 'grass') {
      // Detailed GBC dithered meadow grass tile with pixel blades
      ditherRect(sx, sy, T, T, seed % 5 === 0 ? '#78b880' : '#82c28a', '#64a26c', 3);
      rect(sx + 2, sy + 3, 2, 2, '#4a8854');
      rect(sx + 10, sy + 11, 2, 2, '#4a8854');
      if (seed % 6 === 0) {
        rect(sx + 5, sy + 6, 2, 2, '#b0e2a8');
        rect(sx + 11, sy + 4, 2, 1, '#3e7848');
      }
    } else if (type === 'path') {
      // Grainy cobbled dirt path like Pokémon Yellow routes
      ditherRect(sx, sy, T, T, '#d8be84', '#be9e64', 2);
      rect(sx + ((seed % 9) + 2), sy + 4, 3, 2, '#9c7e4c');
      rect(sx + 3, sy + 11, 4, 2, '#ecd8a6');
      rect(sx + 11, sy + 9, 2, 2, '#866a3c');
    } else if (type === 'tall') {
      // Classic GBC dense V-blade tall grass with dark outlines
      ditherRect(sx, sy, T, T, '#68ac70', '#488854', 2);
      const sway = Math.sin(game.anim * 0.003 + tx * 2 + ty) * 1.2;
      rect(sx + 2, sy + 8 + sway, 3, 7, '#183824');
      rect(sx + 3, sy + 7 + sway, 2, 7, '#3c884e');
      rect(sx + 6, sy + 4 + sway, 3, 10, '#183824');
      rect(sx + 7, sy + 4 + sway, 2, 9, '#4ca25e');
      rect(sx + 11, sy + 5 - sway, 3, 9, '#183824');
      rect(sx + 12, sy + 4 - sway, 2, 9, '#58b468');
    } else if (type === 'water') {
      ditherRect(sx, sy, T, T, '#60a8c8', '#4888a8', 2);
      rect(sx, sy, 16, 2, '#98dcf0');
      rect(sx + 3, sy + 7 + Math.sin(game.anim * 0.002 + tx) * 2, 6, 2, '#b8f0ff');
    } else {
      ditherRect(sx, sy, T, T, '#78b880', '#609c68', 3);
    }
  }

  function drawRundownBaseDetails(camX, camY) {
    const rx = 6 * T - camX + 6;
    const ry = 5 * T - camY + 2;
    const logoColor = game.baseUpgradeIdx >= 2 ? '#ff4747' : '#b83b3b';
    rect(rx - 1, ry - 1, 22, 24, '#181820');
    ditherRect(rx, ry, 20, 22, game.baseUpgradeIdx >= 2 ? '#1c2436' : '#2c313d', '#181c24', 2);
    rect(rx + 3, ry + 2, 4, 18, logoColor);
    rect(rx + 7, ry + 2, 8, 4, logoColor);
    rect(rx + 12, ry + 5, 4, 5, logoColor);
    rect(rx + 7, ry + 9, 7, 4, logoColor);
    rect(rx + 10, ry + 13, 6, 7, logoColor);
    if (game.baseUpgradeIdx === 0) {
      rect(rx + 4, ry + 8, 12, 1, '#3a404d');
      rect(rx + 2, ry + 15, 10, 1, '#353b47');
    }

    [[3, 3], [4, 3], [10, 3], [3, 8]].forEach(([cx, cy], idx) => {
      const sx = cx * T - camX, sy = cy * T - camY;
      rect(sx, sy + 1, 16, 15, '#181820');
      if (idx === 1 && game.baseUpgradeIdx >= 1) {
        ditherRect(sx + 1, sy + 2, 14, 13, '#24473b', '#183028', 2);
        rect(sx + 3, sy + 4, 10, 9, '#63e6be');
        pixelText('+', sx + 8, sy + 4, 8, '#17263a', 'center');
      } else if (idx === 2 && game.baseUpgradeIdx >= 2) {
        ditherRect(sx + 1, sy + 2, 14, 13, '#1e3554', '#142238', 2);
        rect(sx + 3, sy + 4, 10, 9, '#4dabf7');
      } else {
        ditherRect(sx + 1, sy + 2, 14, 13, idx === 2 ? '#394b59' : '#73533d', '#4a3424', 2);
        rect(sx + 2, sy + 3, 12, 3, idx === 2 ? '#597b8c' : '#8f694d');
        rect(sx + 4, sy + 8, 8, 2, '#181c24');
      }
    });

    const bx = 7 * T - camX - 50;
    const by = 2 * T - camY - 5;
    drawRetroBox(bx, by, 116, 13, '#1e1824', '#10141c', '#633248');
    pixelText(BASE_UPGRADES[game.baseUpgradeIdx].label, bx + 58, by + 3, 6, game.baseUpgradeIdx >= 2 ? '#f6cb49' : '#ff7a72', 'center');
  }

  function drawParkedBikeWithPokeball(px, py) {
    const x = Math.round(px), y = Math.round(py);
    rect(x - 8, y + 6, 16, 3, 'rgba(0,0,0,0.35)');
    rect(x - 7, y + 1, 5, 6, '#181820');
    rect(x - 6, y + 2, 3, 4, '#d5dde6');
    rect(x + 2, y + 1, 5, 6, '#181820');
    rect(x + 3, y + 2, 3, 4, '#d5dde6');
    rect(x - 5, y, 9, 2, '#e04848');
    rect(x - 2, y - 3, 3, 4, '#e04848');
    rect(x + 2, y - 5, 2, 6, '#e04848');
    rect(x + 1, y - 6, 4, 2, '#181820');
    // 1 Red/White Poké Ball sitting in the front bike basket!
    rect(x + 3, y - 5, 6, 3, '#e04848');
    rect(x + 3, y - 2, 6, 2, '#ffffff');
    rect(x + 5, y - 3, 2, 2, '#181820');
    drawRetroBox(x - 30, y - 20, 60, 11, '#2b141c', '#10141c', '#e04848');
    pixelText('🚲 BIKE + 1 BALL', x, y - 18, 6, '#f6cb49', 'center');
  }

  function drawRedStarter(px, py, scale = 1, starterObj = null) {
    const st = starterObj || game.starter || RED_STARTERS[1];
    const baseKey = st.baseName || st.name;
    ctx.save();
    ctx.translate(Math.round(px), Math.round(py));
    ctx.scale(scale, scale);
    rect(-9, 8, 18, 3, 'rgba(0,0,0,0.35)');

    if (baseKey === 'BULBASAUR') {
      // 1px dark outline + dithered bulb & spots
      rect(-7, -14, 14, 10, '#181820');
      ditherRect(-6, -13, 12, 8, game.fusionLevel > 0 ? '#9c52d9' : '#3f9959', '#2b6e3f', 2);
      rect(-4, -15, 8, 4, game.fusionLevel > 0 ? '#d88cff' : '#76d884');
      rect(-9, -8, 18, 15, '#181820');
      ditherRect(-8, -7, 16, 13, '#6ec287', '#52a26b', 2);
      rect(-7, 4, 4, 5, '#3b7c54');
      rect(3, 4, 4, 5, '#3b7c54');
      rect(2, -4, 3, 3, '#2d6e46');
      rect(-5, -4, 3, 3, '#fff');
      rect(1, -4, 3, 3, '#fff');
      rect(-4, -4, 2, 3, '#d94848');
      rect(1, -4, 2, 3, '#d94848');
    } else if (baseKey === 'SQUIRTLE') {
      rect(5, -2, 7, 7, '#181820');
      ditherRect(6, -1, 5, 5, '#5aa0c2', '#3d7fa3', 2);
      rect(-7, -11, 14, 15, '#181820');
      ditherRect(-6, -10, 12, 13, game.fusionLevel > 0 ? '#5d3b8c' : '#b87d4b', '#875830', 2);
      rect(-8, -14, 15, 12, '#181820');
      ditherRect(-7, -13, 13, 10, '#6db7d6', '#5298b8', 2);
      rect(-6, -3, 11, 9, '#f5e4b8');
      rect(-4, -1, 7, 1, '#c7b07e');
      rect(-6, 5, 4, 4, '#5298b8');
      rect(2, 5, 4, 4, '#5298b8');
      rect(-4, -9, 2, 3, '#181820');
      rect(2, -9, 2, 3, '#181820');
      rect(-4, -9, 1, 1, '#fff');
      rect(2, -9, 1, 1, '#fff');
    } else {
      // CHARMANDER with 1px dark outline & dithered tail flame
      rect(6, -1, 6, 5, '#181820');
      rect(7, 0, 4, 3, '#f08750');
      rect(10, -6, 6, 7, '#e04848');
      rect(11, -9, 4, 5, game.fusionLevel > 0 ? '#66e0ff' : '#f6cb49');
      rect(-7, -14, 14, 18, '#181820');
      ditherRect(-6, -13, 12, 16, '#f08750', '#d46b38', 2);
      rect(-4, -3, 8, 8, '#f7e2a4');
      rect(-4, -9, 2, 3, '#181820');
      rect(2, -9, 2, 3, '#181820');
      rect(-4, -9, 1, 1, '#fff');
      rect(2, -9, 1, 1, '#fff');
      rect(-5, 4, 4, 5, '#c25828');
      rect(2, 4, 4, 5, '#c25828');
    }
    if (game.fusionLevel > 0) {
      rect(-5, -10, 9, 2, '#66e0ff');
      rect(-2, -17, 4, 3, '#ff5c8a');
    }
    ctx.restore();
  }

  function drawTree(sx, sy) {
    rect(sx + 5, sy + 9, 7, 8, '#181820');
    rect(sx + 6, sy + 9, 5, 7, '#7c5238');
    rect(sx, sy + 4, 16, 9, '#181820');
    ditherRect(sx + 1, sy + 5, 14, 7, '#39895c', '#286844', 2);
    rect(sx + 2, sy + 1, 12, 8, '#181820');
    ditherRect(sx + 3, sy + 2, 10, 7, '#4b9b66', '#387c50', 2);
    rect(sx + 5, sy, 6, 5, '#68b87e');
  }

  function drawBuilding(b, cameraX, cameraY) {
    const x = b.x * T - cameraX, y = b.y * T - cameraY, w = b.w * T, h = b.h * T;
    rect(x + 1, y + 4, w - 2, h - 3, '#181820');
    if (b.type === 'corner') {
      ditherRect(x + 2, y + 8, w - 4, h - 7, game.bizUpgradeIdx >= 2 ? '#3b244d' : '#2d233b', '#1d1528', 2);
      ditherRect(x, y + 4, w, 9, game.bizUpgradeIdx >= 2 ? '#8a5a19' : '#5e2750', '#381430', 2);
      for (let i = 0; i < b.w; i++) {
        rect(x + i * T + 1, y + 5, 7, 5, i % 2 === 0 ? '#e04848' : '#f6cb49');
      }
      rect(x + 6, y + 15, w - 12, h - 18, '#3d2f52');
      rect(x + 8, y + 19, 20, 14, '#181820');
      pixelText('777', x + 18, y + 22, 6, '#f6cb49', 'center');
      rect(x + w - 28, y + 19, 20, 14, '#181820');
      pixelText('🥊T' + currentUnlockedTourneyTier(), x + w - 18, y + 22, 6, '#ff6b6b', 'center');
      rect(x + w / 2 - 7, y + h - 18, 14, 18, '#181820');
      rect(x + w / 2 - 5, y + h - 16, 10, 14, '#f6cb49');
      drawRetroBox(x + w / 2 - 44, y - 5, 88, 13, '#1d1326', '#10141c', '#e04848');
      pixelText('🎰 CORNER & ARENA', x + w / 2, y - 2, 6, '#f6cb49', 'center');
    } else if (b.type === 'daycare') {
      ditherRect(x + 2, y + 8, w - 4, h - 7, '#f1dfbd', '#d8c49e', 2);
      ditherRect(x, y + 5, w, 8, game.bizUpgradeIdx >= 1 ? '#3b8f68' : '#66a97b', '#2b684c', 2);
      for (let i = 0; i < b.w; i++) {
        rect(x + i * T + 1, y + 5, 7, 5, '#82c596');
      }
      rect(x + w / 2 - 6, y + h - 17, 12, 17, '#6e4c36');
      rect(x + 7, y + 18, 14, 11, '#58d69d');
      rect(x + w - 21, y + 18, 14, 11, '#9c6ade');
      drawRetroBox(x + w / 2 - 42, y - 5, 84, 13, '#1e2e38', '#10141c', '#58d69d');
      pixelText('🧬 DAYCARE & LABS', x + w / 2, y - 2, 6, '#8ef0c0', 'center');
    } else if (b.type === 'gym') {
      const controlled = game.gymsControlled > 0;
      ditherRect(x + 2, y + 7, w - 4, h - 6, controlled ? '#2e1d28' : '#d7c6a2', controlled ? '#1c1018' : '#b8a47e', 2);
      ditherRect(x, y + 4, w, 8, controlled ? '#c93b35' : '#52799c', '#181820', 2);
      rect(x + w / 2 - 6, y + h - 16, 12, 16, controlled ? '#f6cb49' : '#896248');
      drawRetroBox(x + w / 2 - 44, y - 5, 88, 13, controlled ? '#29141d' : '#1e2d3d', '#10141c', '#f6cb49');
      pixelText(
        controlled ? `R GYM (${game.gymsControlled}/4 YOURS)` : '🏅 KANTO GYM (0/4)',
        x + w / 2,
        y - 2,
        6,
        controlled ? '#f6cb49' : '#fff',
        'center'
      );
    } else if (b.type === 'victoryGate') {
      const unlocked = isTopRank();
      ditherRect(x + 2, y + 4, w - 4, h - 2, unlocked ? '#3b2e18' : '#2b303c', '#181820', 2);
      rect(x, y + 2, w, 6, unlocked ? '#f6cb49' : '#576072');
      drawRetroBox(x + w / 2 - 46, y - 6, 92, 13, unlocked ? '#2b2110' : '#181e29', '#10141c', unlocked ? '#f6cb49' : '#576072');
      pixelText(
        unlocked ? '🏆 VICTORY RD: OPEN' : '🔒 VICTORY RD (TOP RANK)',
        x + w / 2,
        y - 3,
        6,
        unlocked ? '#f6cb49' : '#aeb8c5',
        'center'
      );
    }
  }

  function drawPerson(px, py, type, frame = 0) {
    const x = Math.round(px), y = Math.round(py);
    rect(x - 6, y + 9, 13, 3, 'rgba(0,0,0,0.38)');
    if (type === 'hero') {
      if (game.bikeStolen && game.ridingBike) {
        rect(x - 8, y + 5, 5, 6, '#181820');
        rect(x - 7, y + 6, 3, 4, '#cfd8e3');
        rect(x + 3, y + 5, 5, 6, '#181820');
        rect(x + 4, y + 6, 3, 4, '#cfd8e3');
        rect(x - 5, y + 4, 10, 2, game.playerUpgradeIdx >= 1 ? '#f6cb49' : '#e04848');
      }
      // 1px dark outline around Team Rocket Grunt head & tunic
      rect(x - 6, y - 9, 12, 10, '#181820');
      rect(x - 5, y - 8, 10, 9, '#f0c79c');
      rect(x - 3, y - 5, 2, 2, '#181820');
      rect(x + 2, y - 5, 2, 2, '#181820');
      rect(x - 7, y - 13, 14, 6, '#181820');
      rect(x - 6, y - 12, 12, 5, '#232730');
      rect(x - 4, y - 9, 9, 2, game.playerUpgradeIdx >= 2 ? '#f6cb49' : '#e04848');
      rect(x - 7, y - 1, 14, 10, '#181820');
      rect(x - 6, y, 12, 8, game.playerUpgradeIdx >= 3 ? '#3b1e2e' : '#262b36');
      rect(x - 2, y + 1, 4, 5, '#e04848'); // Red 'R' chest insignia
      rect(x - 6, y + 5, 12, 2, '#4a5264'); // Utility belt with R-Snatch Balls!
      rect(x - 4, y + 5, 2, 2, '#e04848');
      rect(x + 3, y + 5, 2, 2, '#e04848');
      rect(x - 5, y + 7, 4, 5, '#181820');
      rect(x + 2, y + 7, 4, 5, '#181820');
      if (frame % 2) {
        rect(x - 7, y + 11, 4, 2, '#10141c');
        rect(x + 2, y + 11, 4, 2, '#10141c');
      }
    } else if (type === 'vex') {
      rect(x - 6, y - 9, 12, 10, '#181820');
      rect(x - 5, y - 8, 10, 9, '#ecc39a');
      rect(x - 7, y - 12, 14, 5, '#591e29');
      rect(x - 5, y - 9, 10, 2, '#f6cb49');
      rect(x - 7, y, 14, 9, '#3d1c26');
      rect(x - 2, y + 2, 4, 5, '#f6cb49');
      rect(x - 5, y + 8, 4, 4, '#181820');
      rect(x + 2, y + 8, 4, 4, '#181820');
    } else if (type === 'rocketRival') {
      rect(x - 6, y - 9, 12, 10, '#181820');
      rect(x - 5, y - 8, 10, 9, '#f2c9a0');
      rect(x - 6, y - 12, 12, 5, '#6c3b7a');
      rect(x - 6, y, 12, 8, '#30243d');
      rect(x - 2, y + 2, 4, 4, '#ff6b6b');
      rect(x - 5, y + 7, 4, 5, '#181820');
      rect(x + 2, y + 7, 4, 5, '#181820');
    } else if (type === 'heroRival') {
      rect(x - 6, y - 9, 12, 10, '#181820');
      rect(x - 5, y - 8, 10, 9, '#f2c99e');
      rect(x - 6, y - 12, 12, 5, '#d94b43');
      rect(x - 3, y - 10, 6, 2, '#ffffff');
      rect(x - 6, y, 12, 8, '#3b73b5');
      rect(x - 5, y + 7, 4, 5, '#181820');
      rect(x + 2, y + 7, 4, 5, '#181820');
    } else if (type === 'cornerBoss' || type === 'gymLeader') {
      rect(x - 6, y - 9, 12, 10, '#181820');
      rect(x - 5, y - 8, 10, 9, '#f0c79c');
      rect(x - 6, y - 12, 12, 4, type === 'gymLeader' ? '#b83b3b' : '#47224a');
      rect(x - 6, y, 12, 8, type === 'gymLeader' ? '#4a5d73' : '#d9a338');
      rect(x - 5, y + 7, 4, 5, '#181820');
      rect(x + 2, y + 7, 4, 5, '#181820');
    } else {
      rect(x - 6, y - 9, 12, 10, '#181820');
      rect(x - 5, y - 8, 10, 9, '#f2c99e');
      rect(x - 6, y - 11, 12, 4, '#d9c8a9');
      rect(x - 6, y, 12, 8, '#559e72');
      rect(x - 5, y + 7, 4, 5, '#181820');
      rect(x + 2, y + 7, 4, 5, '#181820');
    }
  }

  function nearbyInteraction() {
    if (!game.bikeStolen && Math.abs(game.x - bikeSpot.x) + Math.abs(game.y - bikeSpot.y) <= 3) {
      return 'stealBike';
    }
    for (const key of Object.keys(npcs)) {
      const n = npcs[key];
      if (Math.abs(game.x - n.x) + Math.abs(game.y - n.y) <= 2) return n.role;
    }
    if (tileType(game.x, game.y) === 'tall') return 'tall';
    return null;
  }

  function drawMap() {
    const camX = clamp(game.x * T - W / 2 + 8, 0, mapW * T - W);
    const camY = clamp(game.y * T - H / 2 + 8, 0, mapH * T - H);
    const startX = Math.floor(camX / T), startY = Math.floor(camY / T);

    for (let ty = startY; ty <= startY + H / T; ty++) {
      for (let tx = startX; tx <= startX + W / T; tx++) {
        drawTerrain(tx, ty, tx * T - camX, ty * T - camY);
      }
    }

    drawRundownBaseDetails(camX, camY);

    for (let y = startY; y <= startY + H / T; y++) {
      for (let x = startX; x <= startX + W / T; x++) {
        if (tileType(x, y) === 'grass' && (x * 7 + y * 13) % 31 === 0) {
          rect(x * T - camX + 7, y * T - camY + 8, 2, 2, '#f3d16a');
          rect(x * T - camX + 9, y * T - camY + 7, 2, 2, '#fff0c1');
        }
      }
    }

    buildings.forEach(b => drawBuilding(b, camX, camY));
    trees.forEach(([x, y]) => drawTree(x * T - camX, y * T - camY));

    for (let x = 8; x < 11; x++) {
      const fx = x * T - camX, fy = 14 * T - camY;
      rect(fx, fy, 2, 8, '#ae8858');
      rect(fx + 7, fy, 2, 8, '#ae8858');
      rect(fx, fy + 2, 9, 2, '#c29a66');
    }
    drawWild(creatures[2], 9 * T + 8 - camX, 13 * T + 8 - camY, 0.45);
    if (game.bredCount > 0 || game.bizUpgradeIdx >= 2) {
      drawWild(creatures[3], 10 * T + 8 - camX, 13 * T + 8 - camY, 0.45);
    }

    if (!game.bikeStolen) {
      drawParkedBikeWithPokeball(bikeSpot.x * T + 8 - camX, bikeSpot.y * T + 8 - camY);
    }

    Object.values(npcs).forEach(n => {
      const nx = n.x * T + 8 - camX;
      const ny = n.y * T + 8 - camY;
      if (nx > -20 && nx < W + 20 && ny > -20 && ny < H + 20) {
        drawPerson(nx, ny, n.role, game.anim >> 8);
        let tag = '';
        if (n.role === 'vex') tag = 'CMDR. VEX';
        else if (n.role === 'rocketRival') tag = game.rocketRival;
        else if (n.role === 'heroRival') tag = game.heroRival;
        else if (n.role === 'cornerBoss') tag = 'SLOTS & ARENA';
        else if (n.role === 'daycareKeeper') tag = 'DAYCARE & LAB';
        else if (n.role === 'gymLeader') tag = `GYM (${game.gymsControlled}/4)`;
        else if (n.role === 'victoryGuard') tag = isTopRank() ? 'ELITE 4 OPEN' : 'TOP RANK REQ';
        if (tag) {
          drawRetroBox(nx - 28, ny - 24, 56, 10, '#18202c', '#10141c', '#485058');
          pixelText(tag, nx, ny - 22, 6, '#f6cb49', 'center');
        }
      }
    });

    if (game.bikeStolen && game.starter) {
      const buddy = game.buddyTrail[0] || { x: game.x, y: game.y - 1 };
      drawRedStarter(buddy.x * T + 8 - camX, buddy.y * T + 8 - camY, 0.78, game.starter);
    }
    drawPerson(game.x * T + 8 - camX, game.y * T + 8 - camY, 'hero', game.anim >> 7);

    drawRetroBox(5, 5, 178, 28, '#172230', '#10141c', '#586274');
    pixelText(currentAreaName(), 11, 9, 7, '#fff3d4');
    pixelText(`${game.playerName} • ${RANKS[game.rankIndex].title}`, 11, 20, 6, '#f6cb49');

    drawRetroBox(W - 160, 5, 155, 19, '#172230', '#10141c', '#e04848');
    drawRocketBall(W - 149, 14, 0.8);
    pixelText(
      `${currentRocketBall().short} ×${game.orbs} • STOLEN:${game.stolenCount}`,
      W - 76,
      11,
      6,
      '#9be5aa',
      'center'
    );

    const near = nearbyInteraction();
    if (near) {
      let promptText = 'SPACE · INTERACT';
      if (near === 'stealBike') promptText = `SPACE · STEAL ${game.heroRival}'S BIKE & BALL`;
      else if (near === 'vex') promptText = 'SPACE · PROMOTE & EXEC MGMT';
      else if (near === 'rocketRival') promptText = `SPACE · BATTLE & STEAL FROM ${game.rocketRival}`;
      else if (near === 'heroRival') promptText = `SPACE · BATTLE & STEAL FROM ${game.heroRival}`;
      else if (near === 'cornerBoss') promptText = 'SPACE · SLOTS & UNDERGROUND TOURNEY';
      else if (near === 'daycareKeeper') promptText = 'SPACE · DAYCARE & BREED/FUSION LAB';
      else if (near === 'gymLeader') promptText = 'SPACE · CONQUER GYM FOR ROCKET';
      else if (near === 'victoryGuard') promptText = 'SPACE · VICTORY ROAD & ELITE 4';
      else if (near === 'tall') promptText = 'SPACE · SEARCH TALL GRASS';
      drawRetroBox(W - 202, H - 25, 196, 19, '#172230', '#10141c', '#f6cb49');
      pixelText(promptText, W - 104, H - 18, 6, '#f6cb49', 'center');
    }
  }

  function drawIntroScene() {
    ditherRect(0, 0, W, H, '#1e2430', '#151922', 2);
    drawRetroBox(10, 6, W - 20, 36, '#2b1822', '#10141c', '#e04848');
    pixelText('TEAM ROCKET INITIATION — RUNDOWN BASE #07', W / 2, 12, 8, '#ff7a72', 'center');
    pixelText(`GRUNT: ${game.playerName}  |  ROCKET RIVAL: ${game.rocketRival}  |  PROTAGONIST: ${game.heroRival}`, W / 2, 25, 6, '#f6cb49', 'center');

    drawPerson(64, 184, 'hero', 0);
    drawParkedBikeWithPokeball(118, 184);
    drawRedStarter(178, 184, 0.9, RED_STARTERS[0]);
    drawRedStarter(228, 184, 0.9, RED_STARTERS[1]);
    drawRedStarter(278, 184, 0.9, RED_STARTERS[2]);
    drawPerson(330, 184, 'heroRival', 0);
  }

  function drawWild(mon, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const c = mon.color, a = mon.accent;
    rect(-21, 7, 43, 7, 'rgba(0,0,0,0.35)');
    rect(-18, -10, 36, 26, '#181820');
    if (mon.name === 'ODDISH') {
      ditherRect(-15, -8, 30, 22, c, '#3b5284', 2);
      rect(-10, -15, 20, 11, c);
      rect(-8, -20, 5, 8, a);
      rect(4, -22, 5, 10, a);
      rect(-11, -9, 4, 4, '#ff6b6b');
      rect(6, -9, 4, 4, '#ff6b6b');
    } else if (mon.name === 'GROWLITHE' || mon.name === 'PIKACHU' || mon.name === 'RAICHU') {
      ditherRect(-16, -9, 32, 24, c, a, 2);
      rect(-13, -16, 9, 10, c);
      rect(5, -16, 9, 10, c);
      rect(-7, -4, 4, 5, '#fff2cf');
      rect(5, -4, 4, 5, '#fff2cf');
      rect(-6, -3, 2, 4, '#181820');
      rect(6, -3, 2, 4, '#181820');
      rect(12, -17, 7, 6, '#f3c75e');
    } else {
      ditherRect(-17, -9, 34, 24, c, a, 2);
      rect(-11, -15, 22, 10, c);
      rect(-18, -5, 7, 8, a);
      rect(11, -4, 8, 8, a);
      rect(-8, -6, 4, 4, '#f8f0d7');
      rect(5, -6, 4, 4, '#f8f0d7');
      rect(-7, -5, 2, 3, '#181820');
      rect(6, -5, 2, 3, '#181820');
    }
    ctx.restore();
  }

  function drawBattle() {
    const b = game.battle;
    if (!b) return;
    const starter = game.starter || RED_STARTERS[1];
    const rBall = currentRocketBall();
    const isSpecial = Boolean(b.tourneyTier || b.gymId || b.eliteStage);

    ditherRect(0, 0, W, 108, isSpecial ? '#2b1420' : b.trainer ? '#2f283b' : '#c8dec4', isSpecial ? '#1d0d16' : '#9cbc98', 2);
    ditherRect(0, 108, W, 76, isSpecial ? '#3d1e2e' : b.trainer ? '#473e57' : '#84b88c', '#588864', 2);
    rect(0, 107, W, 3, '#181820');

    if (b.tourneyTier) {
      drawRetroBox(192, 7, 182, 18, '#3b1522', '#10141c', '#e04848');
      pixelText(`🥊 UNDERGROUND TOURNEY • TIER ${b.tourneyTier}/5`, 283, 13, 6, '#fff7d6', 'center');
    } else if (b.gymId) {
      drawRetroBox(192, 7, 182, 18, '#2b2210', '#10141c', '#d4ab39');
      pixelText(`🏅 GYM TAKEOVER • ${b.gymName}`, 283, 13, 6, '#f6cb49', 'center');
    } else if (b.eliteStage) {
      drawRetroBox(192, 7, 182, 18, '#281536', '#10141c', '#9c6ade');
      pixelText(`🏆 VICTORY ROAD • ELITE 4 #${b.eliteStage}/4`, 283, 13, 6, '#fff7d6', 'center');
    }

    ctx.fillStyle = isSpecial ? '#542032' : '#64986c';
    ctx.beginPath(); ctx.ellipse(281, 106, 66, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isSpecial ? '#421828' : '#52845a';
    ctx.beginPath(); ctx.ellipse(93, 168, 77, 15, 0, 0, Math.PI * 2); ctx.fill();

    // Opponent classic GBC double-bordered status box
    drawRetroBox(10, 9, 180, 44, '#f8f4e0', '#181820', '#485058');
    pixelText(b.trainer ? `${b.trainer}: ${b.enemy.name}` : b.enemy.name, 18, 16, 7, '#181820');
    pixelText(`:L${b.enemy.level}`, 180, 16, 7, '#181820', 'right');
    pixelText('HP:', 18, 34, 7, '#b83b3b');
    rect(38, 35, 140, 7, '#181820');
    rect(39, 36, 138, 5, '#d8d6c8');
    rect(39, 36, Math.max(1, 138 * b.enemy.hp / b.enemy.maxHp), 5, b.enemy.hp / b.enemy.maxHp < 0.25 ? '#e24838' : '#4ca858');
    drawWild(b.enemy, 282, 88, 1.05);

    // If pending R-Ball steal animation, draw the Unique Team Rocket R-Ball locking onto the enemy Pokémon!
    if (b.pendingCapture) {
      drawRocketBall(252, 68, 1.8);
      pixelText('★ R-SNATCH LOCK! ★', 282, 46, 7, '#f6cb49', 'center');
    }

    // Player & Stolen Red Starter double-bordered GBC status box
    drawRetroBox(190, 129, 184, 48, '#f8f4e0', '#181820', '#485058');
    pixelText(`${game.playerName}'S ${starter.name}`, 198, 136, 7, '#181820');
    pixelText(`:L${game.level}`, 366, 136, 7, '#181820', 'right');
    pixelText(`${game.hp}/${game.maxHp}`, 366, 150, 7, '#354352', 'right');
    rect(198, 162, 168, 7, '#181820');
    rect(199, 163, 166, 5, '#d8d6c8');
    rect(199, 163, Math.max(1, 166 * game.hp / game.maxHp), 5, game.hp / game.maxHp < 0.25 ? '#e24838' : '#4ca858');
    drawRedStarter(91, 145, 1.35, starter);

    // Classic Pokémon Yellow double-bordered bottom battle menu box
    drawRetroBox(0, 182, W, 34, '#f8f4e0', '#181820', '#485058');
    if (b.phase === 'menu') {
      pixelText(`ORDERS FOR ${starter.name} (SPLICE ×${game.fusionMult} | ${rBall.name}):`, 10, 187, 6.5, '#181820');
      const opts = [
        [`1 ${starter.move1}`, '⚡'],
        [`2 ${starter.move2}`, '↝'],
        [`3 RATION ×${game.potions}`, '+'],
        [`4 STEAL (${rBall.short} ×${game.orbs})`, 'R']
      ];
      opts.forEach((o, i) => {
        const x = 6 + i * 94;
        drawRetroBox(x, 197, 90, 15, i === 3 ? '#2b1620' : '#fffdf3', '#181820', '#586274');
        pixelText(o[0], x + 4, 201, 5.8, i === 3 ? '#f6cb49' : '#181820');
      });
    } else {
      pixelText(b.message || 'Ready for battle!', 10, 190, 7, '#181820');
      pixelText('SPACE · CONTINUE ▾', 374, 203, 6, '#b83b3b', 'right');
    }
  }

  function drawSlotsMiniGame() {
    const s = game.slots;
    const biz = BIZ_UPGRADES[game.bizUpgradeIdx];
    const unlockedTier = currentUnlockedTourneyTier();
    ditherRect(0, 0, W, H, '#1b1224', '#120b18', 2);
    drawRetroBox(14, 5, W - 28, 175, '#281526', '#10141c', '#e04848');

    drawRetroBox(26, 12, W - 52, 26, '#461e38', '#10141c', '#f6cb49');
    pixelText(`★ GAME CORNER SLOTS & UNDERGROUND FIGHT ARENA ★`, W / 2, 16, 7, '#fff7d6', 'center');
    pixelText(`GRUNT ${game.playerName} • ₽${game.funds} • TOURNEY UNLOCKED: TIER ${unlockedTier}/5`, W / 2, 26, 6, '#ffe066', 'center');

    const reelW = 84, reelH = 68, startX = 48, reelY = 43;
    for (let i = 0; i < 3; i++) {
      const rx = startX + i * (reelW + 16);
      drawRetroBox(rx - 2, reelY - 2, reelW + 4, reelH + 4, '#f8f4e5', '#181820', s.locked[i] ? '#f6cb49' : '#e04848');

      const symIndex = s.locked[i]
        ? s.reels[i]
        : Math.floor((game.anim * 0.025 + i * 2) % SLOT_SYMBOLS.length);
      const sym = SLOT_SYMBOLS[symIndex];

      ditherRect(rx + 4, reelY + 4, reelW - 8, reelH - 8, sym.bg, '#140c18', 2);
      pixelText(sym.label, rx + reelW / 2, reelY + 12, 22, sym.color, 'center');
      pixelText(sym.name, rx + reelW / 2, reelY + 46, 6, '#f4f1e7', 'center');
    }

    drawRetroBox(26, 116, W - 52, 54, '#180d17', '#10141c', '#586274');
    pixelText('🥊 UNDERGROUND FIGHT TOURNAMENT TIERS (UNLOCK WITH RANK & WINS):', W / 2, 121, 6, '#ff8787', 'center');
    for (let t = 0; t < TOURNEY_TIERS.length; t++) {
      const tx = 35 + t * 64;
      const isCleared = t < game.tourneyTierCleared;
      const isOpen = t + 1 <= unlockedTier;
      drawRetroBox(tx, 131, 60, 17, isCleared ? '#2d6a4f' : isOpen ? '#b82e38' : '#262b38', '#10141c', '#f6cb49');
      pixelText(`T${t + 1} ${isCleared ? '✓' : isOpen ? 'OPEN' : 'LOCK'}`, tx + 30, 136, 6, '#fff', 'center');
    }
    pixelText(s.rigged ? 'MAGNET RIGGED: NEXT SPIN GUARANTEED 3× R JACKPOT!' : s.banner, W / 2, 154, 6, s.rigged ? '#8ef0c0' : '#f6cb49', 'center');

    drawRetroBox(0, 182, W, 34, '#f8f4e0', '#181820', '#485058');
    pixelText('GAME CORNER & UNDERGROUND ARENA CONTROLS (1-4 / CLICK):', 10, 187, 6, '#181820');
    const btns = [
      s.spinning ? '1 STOP REEL' : '1 SPIN (₽10)',
      `2 WORK (+₽${biz.cornerPay})`,
      `3 FIGHT TIER ${unlockedTier}`,
      '4 EXIT TO MAP'
    ];
    btns.forEach((label, i) => {
      const bx = 6 + i * 94;
      drawRetroBox(bx, 196, 90, 15, i === 0 ? '#f6cb49' : i === 1 ? '#e04848' : i === 2 ? '#5d2b70' : '#28394a', '#181820', '#485058');
      pixelText(label, bx + 45, 200, 6, i === 0 ? '#181820' : '#ffffff', 'center');
    });
  }

  function drawDaycareAndLab() {
    const biz = BIZ_UPGRADES[game.bizUpgradeIdx];
    const st = game.starter || RED_STARTERS[1];
    ditherRect(0, 0, W, 68, '#355c47', '#244232', 2);
    ditherRect(0, 68, W, 114, '#141f2c', '#0d1520', 2);
    rect(0, 66, W, 3, '#f6cb49');

    drawRetroBox(14, 6, W - 28, 25, '#244232', '#10141c', '#8ef0c0');
    pixelText(`🥚 DAYCARE & INFINITE EXPONENTIAL FUSION LAB (SPLICE LV.${game.fusionLevel} • ×${game.fusionMult})`, W / 2, 11, 6.2, '#8ef0c0', 'center');
    pixelText(`SHIFTS: ${game.daycareShifts}  |  BRED: ${game.bredCount}  |  NEXT SPLICE GAIN: ×${Math.pow(2, game.fusionLevel)} EXPONENTIAL`, W / 2, 20, 6, '#f6cb49', 'center');

    drawRetroBox(18, 36, 166, 110, '#132422', '#10141c', '#58d69d');
    pixelText('UNDERGROUND BREEDING LAB', 101, 43, 6, '#63e6be', 'center');
    drawRetroBox(75, 56, 52, 58, '#2b5c4f', '#10141c', '#58d69d');
    rounded(93, 76, 16, 22, 7, '#fff3d4');
    rect(97, 82, 4, 4, '#6ec287');
    rect(102, 89, 3, 3, '#6ec287');
    pixelText(`BRED SQUAD: +${game.bredCount} POKÉMON`, 101, 120, 6, '#d8f5e5', 'center');
    pixelText('2: BREED EGG (+PARTY & +HP)', 101, 131, 6, '#f6cb49', 'center');

    drawRetroBox(200, 36, 166, 110, '#1d1329', '#10141c', '#d88cff');
    pixelText('INFINITE DNA SPLICING LAB', 283, 43, 6, '#d88cff', 'center');
    drawRetroBox(246, 56, 72, 58, '#381e52', '#10141c', '#d88cff');
    drawRedStarter(282, 92, 1.25, st);
    pixelText(`${st.name} (×${game.fusionMult} EXP)`, 283, 120, 6, '#f3d9fa', 'center');
    pixelText('3: INFINITE SPLICE (×2^N EXP!)', 283, 131, 6, '#f6cb49', 'center');

    drawRetroBox(18, 150, W - 36, 26, '#0f1722', '#10141c', '#485058');
    pixelText(game.daycareBanner, W / 2, 159, 6, '#8ef0c0', 'center');

    drawRetroBox(0, 182, W, 34, '#f8f4e0', '#181820', '#485058');
    pixelText('DAYCARE & INFINITE SPLICING LAB CONTROLS (CLICK OR 1-4):', 10, 187, 6, '#181820');
    const btns = [
      `1 SHIFT (+₽${biz.daycarePay})`,
      '2 BREED EGG (LAB)',
      '3 SPLICE DNA (EXP)',
      '4 EXIT TO MAP'
    ];
    btns.forEach((label, i) => {
      const bx = 6 + i * 94;
      drawRetroBox(bx, 196, 90, 15, i === 0 ? '#f6cb49' : i === 1 ? '#2b8a62' : i === 2 ? '#5d2b70' : '#28394a', '#181820', '#485058');
      pixelText(label, bx + 45, 200, 6, i === 0 ? '#181820' : '#ffffff', 'center');
    });
  }

  function drawExecutiveManagement() {
    ditherRect(0, 0, W, H, '#17121e', '#100c16', 2);
    drawRetroBox(12, 6, W - 24, 30, '#361928', '#10141c', '#f6cb49');
    pixelText('★ TOP RANK EXECUTIVE: ADVANCED BASE, GYM & BUSINESS MANAGEMENT ★', W / 2, 12, 6.2, '#f6cb49', 'center');
    pixelText(`EXECUTIVE ${game.playerName} • GYMS: ${game.gymsControlled}/4 • STOLEN: ${game.stolenCount} • ₽${game.funds}`, W / 2, 23, 6, '#8ef0c0', 'center');

    const cols = [
      { title: 'ADV. BASE OPS', sub: `FORTRESS LV.${game.baseUpgradeIdx + 1 + game.advBaseOps}`, stat: `+2 R-BALLS & +₽350`, color: '#2b1e38', key: '1: BASE OPS' },
      { title: 'ADV. GYM OPS', sub: `${game.gymsControlled}/4 GYMS YOURS`, stat: `TRIBUTE +₽${220 + game.gymsControlled * 150}`, color: '#38221e', key: '2: GYM TRIBUTE' },
      { title: 'ADV. BIZ OPS', sub: `SYNDICATE LV.${game.bizUpgradeIdx + 1 + game.advBizOps}`, stat: `DIVIDEND +₽400`, color: '#1b332b', key: '3: BIZ SYNDICATE' }
    ];
    cols.forEach((c, i) => {
      const cx = 14 + i * 120;
      drawRetroBox(cx, 40, 116, 104, c.color, '#10141c', '#f6cb49');
      pixelText(c.title, cx + 58, 50, 7, '#f6cb49', 'center');
      pixelText(c.sub, cx + 58, 68, 6, '#ffffff', 'center');
      pixelText(c.stat, cx + 58, 90, 6, '#8ef0c0', 'center');
      drawRetroBox(cx + 10, 116, 96, 18, '#f6cb49', '#181820', '#b88d19');
      pixelText(c.key, cx + 58, 122, 6, '#17263a', 'center');
    });

    drawRetroBox(14, 148, W - 28, 28, '#0f1722', '#10141c', '#485058');
    pixelText(game.mgmtBanner, W / 2, 158, 6, '#f6cb49', 'center');

    drawRetroBox(0, 182, W, 34, '#f8f4e0', '#181820', '#485058');
    const btns = ['1 ADV. BASE OPS', '2 ADV. GYM OPS', '3 ADV. BIZ OPS', '4 VICTORY RD / MAP'];
    btns.forEach((label, i) => {
      const bx = 6 + i * 94;
      drawRetroBox(bx, 196, 90, 15, i < 3 ? '#d4ab39' : '#28394a', '#181820', '#485058');
      pixelText(label, bx + 45, 200, 6, i < 3 ? '#181820' : '#ffffff', 'center');
    });
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    if (game.mode === 'intro') drawIntroScene();
    else if (game.mode === 'map') drawMap();
    else if (game.mode === 'battle') drawBattle();
    else if (game.mode === 'slots') drawSlotsMiniGame();
    else if (game.mode === 'daycare') drawDaycareAndLab();
    else if (game.mode === 'management') drawExecutiveManagement();
    // Apply grainy 1998 Game Boy Color source-material texture pass over the entire frame
    ctx.drawImage(grainCanvas, 0, 0);
  }

  function showToast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.add('show');
    clearTimeout(game.toastTimer);
    game.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2600);
  }

  function addMerits(amount, reason) {
    game.merits += amount;
    let promoted = false;
    while (game.rankIndex < RANKS.length - 1 && game.merits >= RANKS[game.rankIndex].nextMerits) {
      game.rankIndex++;
      game.playerUpgradeIdx = Math.max(game.playerUpgradeIdx, game.rankIndex);
      game.baseUpgradeIdx = Math.max(game.baseUpgradeIdx, game.rankIndex);
      game.bizUpgradeIdx = Math.max(game.bizUpgradeIdx, game.rankIndex);
      game.maxHp += 5;
      game.hp = game.maxHp;
      game.orbs += 1;
      promoted = true;
    }
    if (promoted) {
      const newRank = RANKS[game.rankIndex].title;
      if (isTopRank()) {
        showToast(`★ TOP RANK (${newRank})! Unlocked Victory Road, Elite 4 & Advanced Base/Gym/Biz Management!`);
      } else {
        showToast(`★ PROMOTED TO ${newRank}! Unlocked Lv.${game.rankIndex + 1} Upgrades & ${currentRocketBall().name}!`);
      }
    } else if (reason) {
      showToast(`${reason} (+${amount} Rocket Merits)`);
    }
    updateUI();
  }

  function buyTrackUpgrade(track) {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    if (track === 'player' && game.playerUpgradeIdx < PLAYER_UPGRADES.length - 1) {
      const cost = PLAYER_UPGRADES[game.playerUpgradeIdx].cost;
      if (game.funds >= cost) {
        game.funds -= cost;
        game.playerUpgradeIdx++;
        game.maxHp += 6;
        game.hp = game.maxHp;
        game.message = `Unlocked Player Upgrade: ${PLAYER_UPGRADES[game.playerUpgradeIdx].name}! (+6 Max HP & ${currentRocketBall().name})`;
        addMerits(15, `Unlocked ${PLAYER_UPGRADES[game.playerUpgradeIdx].name}`);
      } else {
        showToast(`Need ₽${cost} for Player Upgrade! Work at Game Corner or Daycare.`);
      }
    } else if (track === 'base' && game.baseUpgradeIdx < BASE_UPGRADES.length - 1) {
      const cost = BASE_UPGRADES[game.baseUpgradeIdx].cost;
      if (game.funds >= cost) {
        game.funds -= cost;
        game.baseUpgradeIdx++;
        game.orbs += 2;
        game.message = `Unlocked Base Upgrade: ${BASE_UPGRADES[game.baseUpgradeIdx].name}! Base fortified & +2 ${currentRocketBall().name}s!`;
        addMerits(15, `Unlocked ${BASE_UPGRADES[game.baseUpgradeIdx].name}`);
      } else {
        showToast(`Need ₽${cost} for Base Upgrade! Work at Game Corner or Daycare.`);
      }
    } else if (track === 'biz' && game.bizUpgradeIdx < BIZ_UPGRADES.length - 1) {
      const cost = BIZ_UPGRADES[game.bizUpgradeIdx].cost;
      if (game.funds >= cost) {
        game.funds -= cost;
        game.bizUpgradeIdx++;
        game.message = `Unlocked Business Upgrade: ${BIZ_UPGRADES[game.bizUpgradeIdx].name}! Higher Game Corner & Daycare payouts!`;
        addMerits(15, `Unlocked ${BIZ_UPGRADES[game.bizUpgradeIdx].name}`);
      } else {
        showToast(`Need ₽${cost} for Business Upgrade! Work at Game Corner or Daycare.`);
      }
    }
    updateUI();
  }

  function updateUI() {
    const rankObj = RANKS[game.rankIndex];
    const pUpg = PLAYER_UPGRADES[game.playerUpgradeIdx];
    const bUpg = BASE_UPGRADES[game.baseUpgradeIdx];
    const zUpg = BIZ_UPGRADES[game.bizUpgradeIdx];
    const rBall = currentRocketBall();

    ui.level.textContent = game.level;
    ui.hpBar.style.width = `${clamp((100 * game.hp) / game.maxHp, 0, 100)}%`;
    ui.hpText.textContent = `${game.hp} / ${game.maxHp}`;
    ui.buddyCount.textContent = `${game.gymsControlled} / 4`;
    ui.wins.textContent = String(game.heistDone + game.wins + game.cornerShifts + game.daycareShifts + game.fusionLevel + game.stolenCount).padStart(2, '0');
    ui.area.textContent = currentAreaName();
    ui.status.textContent = game.message;

    ui.playerNameDisplay.textContent = `GRUNT ${game.playerName}`;
    ui.rocketRivalDisplay.textContent = `${game.rocketRival} / ${game.heroRival}`;
    ui.heroRivalDisplay.textContent = `${game.gymsControlled}/4 GYMS • ${isTopRank() ? 'VICTORY RD OPEN' : 'RANK 5 REQ'}`;

    if (ui.starterName && game.starter) {
      ui.starterName.textContent = `${game.starter.name} (${game.starter.number})`;
    }
    if (ui.starterOrigin && game.starter) {
      ui.starterOrigin.innerHTML = `<i></i>STOLEN BIKE 1 POKÉ BALL (${game.starter.kind}) • SPLICE ×${game.fusionMult}`;
    }
    if (ui.partnerBadgeIcon && game.starter) {
      ui.partnerBadgeIcon.style.background = game.starter.color;
      ui.partnerBadgeIcon.style.borderColor = game.starter.accent;
    }

    if (ui.bikeToggle) {
      ui.bikeToggle.querySelector('span').textContent = !game.bikeStolen
        ? `🚲 Steal ${game.heroRival}'s Bike`
        : game.ridingBike
          ? '🚲 Bike: Riding'
          : '🚲 Bike: Walking';
    }

    ui.rankDisplay.textContent = rankObj.title;
    ui.rankTierPill.textContent = `RANK ${game.rankIndex + 1} / ${RANKS.length}`;
    if (game.rankIndex < RANKS.length - 1) {
      ui.meritDisplay.textContent = `${game.merits} / ${rankObj.nextMerits} MERITS`;
      const pct = clamp(((game.merits - rankObj.minMerits) / (rankObj.nextMerits - rankObj.minMerits)) * 100, 6, 100);
      ui.rankBar.style.width = `${pct}%`;
    } else {
      ui.meritDisplay.textContent = `${game.merits} MERITS (TOP RANK!)`;
      ui.rankBar.style.width = '100%';
    }

    if (ui.upgradeSummaryPill) {
      ui.upgradeSummaryPill.textContent = `P:LV.${pUpg.lvl} • B:LV.${bUpg.lvl} • $:LV.${zUpg.lvl}`;
    }
    if (ui.upgradePlayerName) ui.upgradePlayerName.textContent = pUpg.name;
    if (ui.upgradeBaseName) ui.upgradeBaseName.textContent = bUpg.name;
    if (ui.upgradeBizName) ui.upgradeBizName.textContent = zUpg.name;

    if (ui.btnUpgradePlayer) {
      const max = game.playerUpgradeIdx >= PLAYER_UPGRADES.length - 1;
      ui.btnUpgradePlayer.textContent = max ? 'MAXED' : `UPGRADE (₽${pUpg.cost})`;
      ui.btnUpgradePlayer.classList.toggle('maxed', max);
    }
    if (ui.btnUpgradeBase) {
      const max = game.baseUpgradeIdx >= BASE_UPGRADES.length - 1;
      ui.btnUpgradeBase.textContent = max ? 'MAXED' : `UPGRADE (₽${bUpg.cost})`;
      ui.btnUpgradeBase.classList.toggle('maxed', max);
    }
    if (ui.btnUpgradeBiz) {
      const max = game.bizUpgradeIdx >= BIZ_UPGRADES.length - 1;
      ui.btnUpgradeBiz.textContent = max ? 'MAXED' : `UPGRADE (₽${zUpg.cost})`;
      ui.btnUpgradeBiz.classList.toggle('maxed', max);
    }

    if (ui.execMgmtBar && ui.execMgmtStatus) {
      const unlocked = isTopRank();
      ui.execMgmtBar.classList.toggle('unlocked', unlocked);
      ui.execMgmtStatus.textContent = unlocked
        ? '★ TOP RANK UNLOCKED: ADV. BASE, GYM & BIZ MGMT'
        : '🔒 TOP RANK: ADV. BASE, GYM & BIZ MGMT';
    }

    ui.gruntCallsign.textContent = `GRUNT ${game.playerName} • ${rankObj.title}`;
    ui.jobLedger.textContent = `🚲 ${game.starter.name} (×${game.fusionMult}) • STOLEN: ${game.stolenCount} • GYMS: ${game.gymsControlled}/4`;
    ui.fundsReadout.textContent = `FUNDS: ₽${game.funds} • ${rBall.short}S: ${game.orbs}`;

    ui.noteTitle.textContent = `${rBall.name} (STOLEN: ${game.stolenCount}) • GYMS: ${game.gymsControlled}/4 • SPLICE ×${game.fusionMult}`;
    ui.note.textContent = `Use Unique Team Rocket ${rBall.name}s to STEAL Trainer or Wild Pokémon! Infinite Splicing gives ×2^N returns. Top Rank unlocks Victory Road & Executive Management.`;

    if (isTopRank()) {
      ui.goal.textContent = `Top Rank unlocked! Steal Pokémon with ${rBall.name}s, conquer Elite 4 & run Executive Management`;
      ui.goalCheck.textContent = '✓';
      ui.progress.style.width = '100%';
    } else {
      ui.goal.textContent = `Steal Pokémon with ${rBall.short}s, take over Gyms & reach Top Rank (${game.merits}/${rankObj.nextMerits} Merits)`;
      ui.goalCheck.textContent = game.merits > 0 ? '★' : '○';
      ui.progress.style.width = `${clamp(20 + game.merits, 20, 98)}%`;
    }

    if (game.mode === 'intro') ui.action.textContent = 'STEAL BIKE & START';
    else if (game.mode === 'battle') ui.action.textContent = 'BATTLE ACT';
    else if (game.mode === 'slots') ui.action.textContent = game.slots.spinning ? 'STOP REEL' : 'SPIN SLOTS';
    else if (game.mode === 'daycare') ui.action.textContent = 'SPLICE DNA (EXP)';
    else if (game.mode === 'management') ui.action.textContent = 'RUN EXEC OPS';
    else ui.action.textContent = 'INTERACT / TALK';
  }

  function sanitizeName(val, fallback) {
    const cleaned = (val || '').trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 10);
    return cleaned || fallback;
  }

  function confirmIntroNames(e) {
    if (e) e.preventDefault();
    game.playerName = sanitizeName(ui.playerInput.value, 'JESS');
    game.rocketRival = sanitizeName(ui.rocketRivalInput.value, 'VIPER');
    game.heroRival = sanitizeName(ui.heroRivalInput.value, 'RED');

    ui.playerInput.value = game.playerName;
    ui.rocketRivalInput.value = game.rocketRival;
    ui.heroRivalInput.value = game.heroRival;

    ui.introOverlay.hidden = true;
    if (game.mode === 'intro') {
      game.mode = 'map';
      stealRivalBike();
    } else {
      updateUI();
    }
  }

  function openIntroModal() {
    ui.playerInput.value = game.playerName;
    ui.rocketRivalInput.value = game.rocketRival;
    ui.heroRivalInput.value = game.heroRival;
    ui.introOverlay.hidden = false;
    game.mode = 'intro';
    updateUI();
  }

  function openGameCornerSlots() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    game.x = 16;
    game.y = 9;
    game.facing = 'up';
    game.mode = 'slots';
    game.slots.spinning = false;
    game.slots.locked = [true, true, true];
    game.slots.banner = `1: SPIN SLOTS • 2: WORK/RIG • 3: FIGHT UNDERGROUND TOURNEY (TIER ${currentUnlockedTourneyTier()})!`;
    game.message = `Entered Rocket Game Corner! Play the Slot Machine or descend to the Underground Fight Tournament (Tier ${currentUnlockedTourneyTier()}/5 unlocked)!`;
    updateUI();
  }

  function startUndergroundTournament() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    const tierNum = currentUnlockedTourneyTier();
    const tObj = TOURNEY_TIERS[tierNum - 1];
    const enemy = { ...tObj.enemy, hp: tObj.enemy.maxHp };
    game.mode = 'battle';
    game.battle = {
      trainer: `${tObj.title} • ${tObj.trainer}`,
      rivalKind: 'tourney',
      tourneyTier: tierNum,
      tourneyPrize: tObj.prize,
      tourneyMerits: tObj.merits,
      enemy,
      phase: 'intro',
      message: `🥊 Underground Fight Tournament (${tObj.title})! ${tObj.trainer} sent out ${enemy.name} (Lv.${enemy.level})!`,
      turn: 0
    };
    game.message = game.battle.message;
    updateUI();
  }

  function challengeNextGym() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    game.x = 19;
    game.y = 19;
    game.facing = 'up';
    const gymIdx = Math.min(game.gymsControlled, KANTO_GYMS.length - 1);
    const gObj = KANTO_GYMS[gymIdx];
    const enemy = { ...gObj.enemy, hp: gObj.enemy.maxHp };
    game.mode = 'battle';
    game.battle = {
      trainer: `${gObj.gymName} • ${gObj.leader}`,
      rivalKind: 'gym',
      gymId: gObj.id,
      gymName: gObj.gymName,
      tourneyPrize: gObj.tribute,
      tourneyMerits: gObj.merits,
      enemy,
      phase: 'intro',
      message: `🏅 Gym Takeover Battle! Defeat ${gObj.leader} or STEAL ${enemy.name} with your ${currentRocketBall().name} to put ${gObj.gymName} under your control!`,
      turn: 0
    };
    game.message = game.battle.message;
    updateUI();
  }

  function enterVictoryRoadAndElite4() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    if (!isTopRank()) {
      addMerits(150, 'Promoted to Top Rank (Rocket Executive) for Victory Road');
    }
    game.x = 26;
    game.y = 5;
    game.facing = 'up';
    const stageIdx = Math.min(game.eliteFourCleared, ELITE_FOUR.length - 1);
    const eObj = ELITE_FOUR[stageIdx];
    const enemy = { ...eObj.enemy, hp: eObj.enemy.maxHp };
    game.mode = 'battle';
    game.battle = {
      trainer: eObj.title,
      rivalKind: 'elite4',
      eliteStage: eObj.stage,
      tourneyPrize: eObj.prize,
      tourneyMerits: eObj.merits,
      enemy,
      phase: 'intro',
      message: `🏆 Victory Road -> Indigo Plateau! Challenging ${eObj.title} (${enemy.name} Lv.${enemy.level})!`,
      turn: 0
    };
    game.message = game.battle.message;
    updateUI();
  }

  function openExecutiveManagement() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    if (!isTopRank()) {
      addMerits(150, 'Promoted to Top Rank (Rocket Executive) for Executive Management');
    }
    game.mode = 'management';
    game.mgmtBanner = 'SELECT 1 (ADV. BASE OPS), 2 (ADV. GYM TRIBUTE) OR 3 (ADV. BIZ SYNDICATE)!';
    game.message = `Opened Top-Rank Advanced Base, Gym & Business Management Console!`;
    updateUI();
  }

  function runExecutiveOperation(kind) {
    ensureBikeStolen();
    if (kind === 'base') {
      game.advBaseOps++;
      game.funds += 350;
      game.orbs += 2;
      game.maxHp += 8;
      game.hp = game.maxHp;
      game.mgmtBanner = `ADV. BASE OPS #${game.advBaseOps}: DEPLOYED GRUNT PATROLS (+₽350, +2 ${currentRocketBall().short}S, +8 MAX HP)!`;
      game.message = game.mgmtBanner;
      showToast(`Advanced Base Ops: +₽350, +2 ${currentRocketBall().name}s & +8 Max HP!`);
    } else if (kind === 'gym') {
      game.advGymOps++;
      if (game.gymsControlled < 4) game.gymsControlled++;
      const tribute = 220 + game.gymsControlled * 150;
      game.funds += tribute;
      game.level++;
      game.mgmtBanner = `ADV. GYM OPS #${game.advGymOps}: ${game.gymsControlled}/4 GYMS UNDER CONTROL! COLLECTED +₽${tribute} TRIBUTE!`;
      game.message = game.mgmtBanner;
      showToast(`Advanced Gym Management: ${game.gymsControlled}/4 Gyms Controlled (+₽${tribute})!`);
    } else if (kind === 'biz') {
      game.advBizOps++;
      game.funds += 400;
      game.bredCount++;
      game.caught++;
      game.mgmtBanner = `ADV. BIZ OPS #${game.advBizOps}: CASINO & LAB AUTOMATION PAID +₽400 & +1 BRED POKÉMON!`;
      game.message = game.mgmtBanner;
      showToast('Advanced Business Management: +₽400 & +1 Bred Specimen!');
    }
    updateUI();
  }

  function startOrStopSlotSpin() {
    const s = game.slots;
    if (s.spinning) {
      const nextIdx = s.locked.findIndex(locked => !locked);
      if (nextIdx !== -1) lockReel(nextIdx);
      return;
    }
    if (game.funds < 10 && !s.rigged) {
      workGameCornerShift();
      return;
    }
    if (!s.rigged) game.funds -= 10;
    s.spinning = true;
    s.spins++;
    s.locked = [false, false, false];
    const now = performance.now();
    s.stopTimes = [now + 320, now + 620, now + 920];
    s.banner = 'REELS SPINNING... PRESS SPACE OR CLICK TO LOCK REELS!';
    updateUI();
  }

  function lockReel(idx) {
    const s = game.slots;
    if (s.locked[idx]) return;
    s.locked[idx] = true;
    if (s.rigged) {
      s.reels[idx] = 0;
    } else if (idx > 0 && Math.random() < 0.48) {
      s.reels[idx] = s.reels[0];
    } else {
      s.reels[idx] = rnd(0, SLOT_SYMBOLS.length - 1);
    }
    if (s.locked.every(Boolean)) finishSlotSpin();
  }

  function finishSlotSpin() {
    const s = game.slots;
    const biz = BIZ_UPGRADES[game.bizUpgradeIdx];
    s.spinning = false;
    const [r0, r1, r2] = s.reels;
    const sym0 = SLOT_SYMBOLS[r0];
    if (r0 === r1 && r1 === r2) {
      const winFunds = Math.round(sym0.payout * biz.slotMult);
      game.funds += winFunds;
      if (sym0.orb) game.orbs += sym0.orb;
      s.lastWin = winFunds;
      s.rigged = false;
      s.banner = `JACKPOT! 3× ${sym0.name}! WON +₽${winFunds}${sym0.orb ? ` & +1 ${currentRocketBall().short}` : ''}!`;
      game.message = `Slot Jackpot at the Game Corner! Won +₽${winFunds} and +${sym0.merits} Merits!`;
      addMerits(sym0.merits, `Slot Jackpot (3× ${sym0.name})`);
    } else if (r0 === r1 || r1 === r2 || r0 === r2) {
      const pairSym = r0 === r1 ? SLOT_SYMBOLS[r0] : SLOT_SYMBOLS[r2];
      const winFunds = Math.round(90 * biz.slotMult);
      game.funds += winFunds;
      s.lastWin = winFunds;
      s.rigged = false;
      s.banner = `NICE MATCH! PAIR OF ${pairSym.name}S! WON +₽${winFunds} & +15 MERITS!`;
      game.message = `Matched a pair of ${pairSym.name}s on the Game Corner slots! +₽${winFunds}.`;
      addMerits(15, 'Game Corner Slot Match');
    } else {
      s.lastWin = 0;
      s.rigged = false;
      s.banner = 'NO MATCH! PRESS 2 TO WORK SHIFT & RIG THE MACHINE FOR A JACKPOT!';
      game.message = 'Reels missed! Tip: Work a Game Corner shift (2) to rig the next spin!';
      updateUI();
    }
  }

  function workGameCornerShift() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    const biz = BIZ_UPGRADES[game.bizUpgradeIdx];
    game.cornerShifts++;
    game.funds += biz.cornerPay;
    game.slots.rigged = true;
    game.slots.banner = `SHIFT WORKED (+₽${biz.cornerPay})! MAGNET RIGGED: SPIN NOW FOR 3× R JACKPOT!`;
    game.message = `Grunt ${game.playerName} worked a Game Corner shift (+₽${biz.cornerPay}, +25 Merits) and rigged the slot reels!`;
    addMerits(25, 'Worked Game Corner Shift');
    if (game.mode !== 'slots') openGameCornerSlots();
  }

  function openDaycareAndLabs() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    game.x = 5;
    game.y = 17;
    game.facing = 'up';
    game.mode = 'daycare';
    performDaycareShiftOnly();
  }

  function performDaycareShiftOnly() {
    const biz = BIZ_UPGRADES[game.bizUpgradeIdx];
    game.daycareShifts++;
    game.funds += biz.daycarePay;
    game.hp = game.maxHp;
    game.xp += biz.xpGain;
    let leveled = false;
    while (game.xp >= 24) {
      game.xp -= 24;
      game.level++;
      game.maxHp += 3;
      game.hp = game.maxHp;
      leveled = true;
    }
    const stName = game.starter ? game.starter.name : 'Starter';
    game.daycareBanner = `SHIFT COMPLETE (+₽${biz.daycarePay})! PRESS 2 TO BREED EGG OR 3 FOR INFINITE EXPONENTIAL SPLICE!`;
    game.message = `Worked a Daycare shift (+₽${biz.daycarePay}, ${stName} healed${leveled ? ` & Lv.${game.level}` : ''}) and accessed the Underground Breeding & Fusion Labs!`;
    addMerits(25, 'Worked Daycare Shift');
  }

  function breedUndergroundEgg() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    game.mode = 'daycare';
    game.bredCount++;
    game.caught++;
    game.maxHp += 6;
    game.hp = game.maxHp;
    game.daycareBanner = `UNDERGROUND BREEDING LAB: HATCHED HIGH-IV SPECIMEN #0${game.bredCount} (+1 PARTY, +6 MAX HP)!`;
    game.message = `Underground Breeding Lab hatched a high-IV Rocket specimen (+1 Party Pokémon, +6 Max HP, +30 Merits)!`;
    addMerits(30, 'Underground Lab: Bred Specimen');
  }

  // Infinite DNA Splicing with Exponential (2^N) Returns!
  function fuseUndergroundPartner() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    game.mode = 'daycare';
    game.fusionLevel++;
    const expMult = Math.pow(2, game.fusionLevel - 1);
    game.fusionMult = Math.pow(2, game.fusionLevel);
    const expHpGain = 12 * expMult;
    const expAtkGain = 8 * expMult;
    const expFundsGain = 60 * expMult;
    const expMeritGain = Math.round(35 * Math.pow(1.5, game.fusionLevel - 1));

    game.level += 1;
    game.maxHp += expHpGain;
    game.hp = game.maxHp;
    game.fusionAtkBonus += expAtkGain;
    game.funds += expFundsGain;

    if (game.starter) {
      game.starter.name = `${game.starter.fusedPrefix}-${game.fusionLevel}X`;
      game.starter.move1 = game.starter.fusedMove1;
      game.starter.kind = `INFINITE SPLICE LV.${game.fusionLevel} (×${game.fusionMult} EXP)`;
    }
    game.daycareBanner = `INFINITE SPLICE LV.${game.fusionLevel} (×${game.fusionMult} EXP): +${expHpGain} HP, +${expAtkGain} ATK & +₽${expFundsGain}!`;
    game.message = `Underground Fusion Lab spliced ${game.starter.name} (Exponential ×${game.fusionMult}: +${expHpGain} Max HP, +${expAtkGain} ATK, +₽${expFundsGain})!`;
    addMerits(expMeritGain, `Infinite Splice Lv.${game.fusionLevel} (×${game.fusionMult})`);
  }

  function reportForPromotion() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    if (game.mode === 'slots' || game.mode === 'daycare') game.mode = 'map';
    const prevRank = game.rankIndex;
    const needed = RANKS[game.rankIndex].nextMerits - game.merits;
    const grant = Math.max(25, needed);
    game.talkedVex = true;
    addMerits(grant, 'Commander Vex Promotion');
    const newRankTitle = RANKS[game.rankIndex].title;
    if (game.rankIndex > prevRank) {
      game.message = `Commander Vex: “Promoted to ${newRankTitle}, ${game.playerName}! Unlocked ${PLAYER_UPGRADES[game.playerUpgradeIdx].name}, ${BASE_UPGRADES[game.baseUpgradeIdx].name}, ${BIZ_UPGRADES[game.bizUpgradeIdx].name}${isTopRank() ? ', Victory Road & Advanced Management' : ''}!”`;
    } else {
      game.message = `Commander Vex: “You hold Top Rank (${newRankTitle}), ${game.playerName}! Victory Road (Elite 4) and Advanced Base, Gym & Business Management are yours!”`;
    }
    updateUI();
  }

  function move(dir) {
    if (game.mode !== 'map') return;
    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    if (!delta) return;
    game.facing = dir;
    const nx = game.x + delta[0], ny = game.y + delta[1];
    if (!solid(nx, ny)) {
      game.buddyTrail.unshift({ x: game.x, y: game.y });
      if (game.buddyTrail.length > 4) game.buddyTrail.pop();
      game.x = nx;
      game.y = ny;
      game.steps++;
      if (!game.bikeStolen && ny >= baseBounds.doorY) {
        stealRivalBike();
        return;
      }
      if (tileType(game.x, game.y) === 'tall' && game.grassEncounterCooldown <= 0 && Math.random() < 0.2) {
        game.grassEncounterCooldown = 6;
        beginWildBattle();
      }
      updateUI();
    } else {
      const hitNpc = npcAt(nx, ny);
      if (hitNpc) interactWithRole(hitNpc.role);
    }
  }

  function interactWithRole(role) {
    if (role === 'stealBike') {
      stealRivalBike();
    } else if (role === 'vex') {
      if (isTopRank()) openExecutiveManagement();
      else reportForPromotion();
    } else if (role === 'rocketRival') {
      beginRivalBattle('rocket');
    } else if (role === 'heroRival') {
      beginRivalBattle('hero');
    } else if (role === 'cornerBoss') {
      openGameCornerSlots();
    } else if (role === 'daycareKeeper') {
      openDaycareAndLabs();
    } else if (role === 'gymLeader') {
      challengeNextGym();
    } else if (role === 'victoryGuard') {
      enterVictoryRoadAndElite4();
    } else if (role === 'tall') {
      beginWildBattle();
    }
  }

  function interact() {
    if (game.mode === 'intro') {
      confirmIntroNames();
      return;
    }
    if (!game.bikeStolen) {
      stealRivalBike();
      return;
    }
    if (game.mode === 'slots') {
      startOrStopSlotSpin();
      return;
    }
    if (game.mode === 'daycare') {
      fuseUndergroundPartner();
      return;
    }
    if (game.mode === 'management') {
      runExecutiveOperation('gym');
      return;
    }
    if (game.mode === 'battle') {
      battleContinue();
      return;
    }
    if (game.mode !== 'map') return;
    const near = nearbyInteraction();
    if (near) {
      interactWithRole(near);
    } else {
      game.message = `Grunt ${game.playerName} (${RANKS[game.rankIndex].title}) rides ${game.heroRival}'s stolen bike with ${game.starter.name}.`;
      updateUI();
    }
  }

  function beginWildBattle() {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    const base = creatures[rnd(0, creatures.length - 1)];
    const enemy = {
      ...base,
      level: rnd(3, Math.max(4, game.level)),
      maxHp: base.hp + rnd(0, 4)
    };
    enemy.hp = enemy.maxHp;
    game.mode = 'battle';
    game.battle = {
      trainer: null,
      rivalKind: null,
      enemy,
      phase: 'intro',
      message: `A wild ${enemy.name} jumped out at ${game.playerName}'s ${game.starter.name}!`,
      turn: 0
    };
    game.message = game.battle.message;
    updateUI();
  }

  function beginRivalBattle(kind) {
    if (game.mode === 'intro') confirmIntroNames();
    ensureBikeStolen();
    const isRocket = kind === 'rocket';
    const trainerName = isRocket ? `ROCKET RIVAL ${game.rocketRival}` : `PROTAGONIST ${game.heroRival}`;
    const enemy = isRocket
      ? { name: 'KOFFING', kind: 'POISON', color: '#8d73b8', accent: '#553c7a', level: game.level, maxHp: 24, hp: 24 }
      : { name: 'PIKACHU', kind: 'ELECTRIC', color: '#f6cb49', accent: '#d98a2b', level: game.level, maxHp: 26, hp: 26 };
    game.mode = 'battle';
    game.battle = {
      trainer: trainerName,
      rivalKind: kind,
      enemy,
      phase: 'intro',
      message: isRocket
        ? `${game.rocketRival}: “You stole ${game.heroRival}'s bike AND got ${game.starter.name}?! That promotion is mine, ${game.playerName}!”`
        : `${game.heroRival}: “Grunt ${game.playerName}! Give back my stolen Bike and my ${game.starter.name} Poké Ball right now!”`,
      turn: 0
    };
    game.message = game.battle.message;
    updateUI();
  }

  function enemyTurn() {
    const b = game.battle;
    if (!b || game.mode !== 'battle') return;
    const damage = rnd(2, 5);
    game.hp = Math.max(1, game.hp - damage);
    b.phase = 'enemyMsg';
    b.message = `${b.enemy.name} counterattacked! ${game.starter.name} took −${damage} HP.`;
    game.message = b.message;
    updateUI();
  }

  function attack(kind) {
    const b = game.battle;
    if (!b || b.phase !== 'menu') return;
    const starter = game.starter || RED_STARTERS[1];
    const pUpg = PLAYER_UPGRADES[game.playerUpgradeIdx];
    const rBall = currentRocketBall();

    if (kind === 'snack') {
      if (game.potions <= 0) {
        b.phase = 'enemyMsg';
        b.message = 'No Rations left in your Rocket kit!';
        return;
      }
      game.potions--;
      const healed = Math.min(16 + pUpg.lvl * 4, game.maxHp - game.hp);
      game.hp += healed;
      b.phase = 'enemyMsg';
      b.message = `${starter.name} ate a Rocket Ration! Restored +${healed || 1} HP.`;
      updateUI();
      return;
    }

    // Unique Team Rocket Poké Ball Stealing Mechanic (works on BOTH Trainer Pokémon & Wild Pokémon!)
    if (kind === 'orb') {
      if (game.orbs <= 0) {
        game.orbs = 1; // Emergency R-Snatch Ball from Rocket belt so stealing is always available
      }
      game.orbs--;
      b.phase = 'enemyMsg';
      b.pendingCapture = true;
      if (b.trainer) {
        b.message = `Threw a Unique Team Rocket ${rBall.name} to STEAL ${b.trainer}'s ${b.enemy.name}!`;
      } else {
        b.message = `Threw a Team Rocket ${rBall.name} to snatch wild ${b.enemy.name}!`;
      }
      game.message = b.message;
      updateUI();
      return;
    }

    const moveLabel = kind === 'spark' ? starter.move1 : starter.move2;
    const damage = (kind === 'spark' ? rnd(12, 16) : rnd(8, 12)) + game.level + pUpg.atkBonus + game.fusionAtkBonus;
    b.enemy.hp = Math.max(0, b.enemy.hp - damage);
    b.turn++;
    if (b.enemy.hp <= 0) {
      game.wins++;
      game.xp += 14;
      const prizeFunds = b.tourneyPrize || (b.trainer ? 150 : 70);
      const earnedMerits = b.tourneyMerits || (b.trainer ? 40 : 25);
      game.funds += prizeFunds;
      if (game.xp >= 24) {
        game.xp -= 24;
        game.level++;
        game.maxHp += 3;
        game.hp = game.maxHp;
      }
      b.phase = 'winMsg';
      if (b.rivalKind === 'tourney') {
        game.tourneyTierCleared = Math.max(game.tourneyTierCleared, b.tourneyTier);
        b.message = `Won Underground Tournament Tier ${b.tourneyTier}! +₽${prizeFunds} & +${earnedMerits} Merits! Next Tier Unlocked!`;
      } else if (b.rivalKind === 'gym') {
        if (game.gymsControlled < 4) game.gymsControlled++;
        b.message = `Conquered ${b.gymName}! ${b.gymName} is now under your Team Rocket control (${game.gymsControlled}/4 Gyms)! +₽${prizeFunds}!`;
      } else if (b.rivalKind === 'elite4') {
        game.eliteFourCleared = Math.max(game.eliteFourCleared, b.eliteStage);
        b.message = `Conquered ${b.trainer} on Victory Road (${game.eliteFourCleared}/4 Elite 4)! +₽${prizeFunds} & +${earnedMerits} Merits!`;
      } else if (b.rivalKind === 'rocket') {
        game.defeatedRocketRival = true;
        b.message = `Defeated Rocket Rival ${game.rocketRival} with ${starter.name}! +₽${prizeFunds} & +${earnedMerits} Merits!`;
      } else if (b.rivalKind === 'hero') {
        game.defeatedHeroRival = true;
        b.message = `Defeated Protagonist ${game.heroRival} and kept his stolen bike! +₽${prizeFunds} & +${earnedMerits} Merits!`;
      } else {
        b.message = `Wild ${b.enemy.name} fainted! Earned +₽${prizeFunds} & +${earnedMerits} Merits!`;
      }
      game.message = b.message;
      addMerits(earnedMerits, b.trainer ? `Defeated ${b.trainer}` : `Defeated ${b.enemy.name}`);
    } else {
      b.phase = 'enemyMsg';
      b.message = `${starter.name} used ${moveLabel}! −${damage} HP to ${b.enemy.name}!`;
      b.pendingEnemy = true;
    }
    updateUI();
  }

  function battleContinue() {
    const b = game.battle;
    if (!b) return;
    if (b.phase === 'intro') {
      b.phase = 'menu';
      return;
    }
    if (b.phase === 'enemyMsg') {
      if (b.pendingCapture) {
        b.pendingCapture = false;
        const rBall = currentRocketBall();
        const stolenName = b.enemy.name;
        const wasTrainer = Boolean(b.trainer);
        game.caught++;
        game.stolenCount++;
        game.stolenPokemon.push(stolenName);
        game.wins++;
        game.maxHp += rBall.bonusHp;
        game.hp = game.maxHp;
        game.fusionAtkBonus += rBall.bonusAtk;

        const prizeFunds = (b.tourneyPrize || (wasTrainer ? 160 : 90)) + 50;
        const earnedMerits = (b.tourneyMerits || (wasTrainer ? 45 : 35));
        game.funds += prizeFunds;

        if (b.rivalKind === 'tourney') {
          game.tourneyTierCleared = Math.max(game.tourneyTierCleared, b.tourneyTier);
        } else if (b.rivalKind === 'gym') {
          if (game.gymsControlled < 4) game.gymsControlled++;
        } else if (b.rivalKind === 'elite4') {
          game.eliteFourCleared = Math.max(game.eliteFourCleared, b.eliteStage);
        } else if (b.rivalKind === 'rocket') {
          game.defeatedRocketRival = true;
        } else if (b.rivalKind === 'hero') {
          game.defeatedHeroRival = true;
        }

        const wasTourney = b.rivalKind === 'tourney';
        game.mode = wasTourney ? 'slots' : 'map';
        game.battle = null;
        game.grassEncounterCooldown = 7;
        game.message = wasTrainer
          ? `STOLE ${b.trainer}'s ${stolenName} using a Team Rocket ${rBall.name}! (+${rBall.bonusHp} HP, +${rBall.bonusAtk} ATK, +₽${prizeFunds})${b.gymId ? ` & took control of ${b.gymName} (${game.gymsControlled}/4)!` : '!'}`
          : `Snatched wild ${stolenName} using a Team Rocket ${rBall.name}! (+${rBall.bonusHp} HP, +${rBall.bonusAtk} ATK, +₽${prizeFunds})!`;
        addMerits(earnedMerits, `Stole ${stolenName} with ${rBall.name}`);
        return;
      }
      if (b.pendingEnemy) {
        b.pendingEnemy = false;
        enemyTurn();
        return;
      }
      b.phase = 'menu';
      return;
    }
    if (b.phase === 'winMsg') {
      const wasTourney = b.rivalKind === 'tourney';
      game.mode = wasTourney ? 'slots' : 'map';
      game.battle = null;
      game.grassEncounterCooldown = 7;
      updateUI();
    }
  }

  function keyDown(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      if (e.key === 'Enter') confirmIntroNames(e);
      return;
    }

    const key = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(key)) {
      e.preventDefault();
    }
    if (game.keys[key]) return;
    game.keys[key] = true;

    if (game.mode === 'intro') {
      if (key === 'enter' || key === ' ') confirmIntroNames(e);
      return;
    }

    if (game.mode === 'slots') {
      if (key === '1' || key === ' ' || key === 'enter' || key === 'z') startOrStopSlotSpin();
      else if (key === '2' || key === 'r') workGameCornerShift();
      else if (key === '3' || key === 't') startUndergroundTournament();
      else if (key === '4' || key === 'escape' || key === 'x') {
        game.mode = 'map';
        game.message = `Stepped out of the Rocket Game Corner & Underground Arena with ₽${game.funds}.`;
        updateUI();
      }
      return;
    }

    if (game.mode === 'daycare') {
      if (key === '1') performDaycareShiftOnly();
      else if (key === '2') breedUndergroundEgg();
      else if (key === '3' || key === ' ' || key === 'enter') fuseUndergroundPartner();
      else if (key === '4' || key === 'escape' || key === 'x') {
        game.mode = 'map';
        game.message = `Stepped out of the Daycare & Underground Breeding/Fusion Lab.`;
        updateUI();
      }
      return;
    }

    if (game.mode === 'management') {
      if (key === '1') runExecutiveOperation('base');
      else if (key === '2' || key === ' ' || key === 'enter') runExecutiveOperation('gym');
      else if (key === '3') runExecutiveOperation('biz');
      else if (key === '4' || key === 'escape' || key === 'x') {
        game.mode = 'map';
        updateUI();
      }
      return;
    }

    if (game.mode === 'battle') {
      if (game.battle?.phase === 'menu') {
        if (key === '1' || key === 'z' || key === ' ' || key === 'enter') attack('spark');
        else if (key === '2' || key === 'x') attack('tail');
        else if (key === '3') attack('snack');
        else if (key === '4') attack('orb');
      } else if (key === ' ' || key === 'enter' || key === 'z') {
        battleContinue();
      }
      return;
    }

    if (key === 'b') {
      if (!game.bikeStolen) stealRivalBike();
      else {
        game.ridingBike = !game.ridingBike;
        showToast(game.ridingBike ? `Riding ${game.heroRival}'s stolen bike!` : 'Disembarked stolen bike.');
        updateUI();
      }
      return;
    }
    if (key === 'g') { openGameCornerSlots(); return; }
    if (key === 'c') { openDaycareAndLabs(); return; }
    if (key === 'm') { challengeNextGym(); return; }
    if (key === 'v') { enterVictoryRoadAndElite4(); return; }
    if (key === 'e') { openExecutiveManagement(); return; }
    if (key === 'p') { reportForPromotion(); return; }

    const dirs = {
      arrowup: 'up', w: 'up',
      arrowdown: 'down', s: 'down',
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right'
    };
    if (dirs[key]) move(dirs[key]);
    else if (key === ' ' || key === 'enter' || key === 'z') interact();
  }

  function keyUp(e) {
    game.keys[e.key.toLowerCase()] = false;
  }

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);

  document.querySelectorAll('.preset-list').forEach(group => {
    const targetId = group.dataset.target;
    const inputEl = $(targetId);
    group.querySelectorAll('.name-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.name-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        inputEl.value = btn.dataset.name;
        game.playerName = sanitizeName(ui.playerInput.value, 'JESS');
        game.rocketRival = sanitizeName(ui.rocketRivalInput.value, 'VIPER');
        game.heroRival = sanitizeName(ui.heroRivalInput.value, 'RED');
        updateUI();
      });
    });
  });

  [ui.playerInput, ui.rocketRivalInput, ui.heroRivalInput].forEach(inp => {
    inp.addEventListener('input', () => {
      game.playerName = sanitizeName(ui.playerInput.value, 'JESS');
      game.rocketRival = sanitizeName(ui.rocketRivalInput.value, 'VIPER');
      game.heroRival = sanitizeName(ui.heroRivalInput.value, 'RED');
      updateUI();
    });
  });

  ui.introForm.addEventListener('submit', confirmIntroNames);
  $('rename-toggle').addEventListener('click', openIntroModal);
  if (ui.bikeToggle) {
    ui.bikeToggle.addEventListener('click', () => {
      if (game.mode === 'intro') confirmIntroNames();
      else if (!game.bikeStolen) stealRivalBike();
      else {
        game.ridingBike = !game.ridingBike;
        showToast(game.ridingBike ? `Riding ${game.heroRival}'s stolen bike!` : 'Walking with stolen bike.');
        updateUI();
      }
    });
  }

  if (ui.btnUpgradePlayer) ui.btnUpgradePlayer.addEventListener('click', () => buyTrackUpgrade('player'));
  if (ui.btnUpgradeBase) ui.btnUpgradeBase.addEventListener('click', () => buyTrackUpgrade('base'));
  if (ui.btnUpgradeBiz) ui.btnUpgradeBiz.addEventListener('click', () => buyTrackUpgrade('biz'));
  if (ui.btnExecMgmt) ui.btnExecMgmt.addEventListener('click', () => openExecutiveManagement());

  document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
    const dir = btn.dataset.dir;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (game.mode === 'intro') confirmIntroNames();
      move(dir);
    });
  });

  $('action-button').addEventListener('click', () => {
    if (game.mode === 'battle' && game.battle?.phase === 'menu') attack('spark');
    else interact();
  });

  $('work-corner-button').addEventListener('click', () => openGameCornerSlots());
  $('work-daycare-button').addEventListener('click', () => openDaycareAndLabs());
  if ($('gym-battle-button')) $('gym-battle-button').addEventListener('click', () => challengeNextGym());
  if ($('victory-road-button')) $('victory-road-button').addEventListener('click', () => enterVictoryRoadAndElite4());
  $('rank-up-button').addEventListener('click', () => reportForPromotion());

  if ($('btn-spin-slots')) {
    $('btn-spin-slots').addEventListener('click', () => {
      if (game.mode !== 'slots') openGameCornerSlots();
      startOrStopSlotSpin();
    });
  }
  if ($('btn-rig-slots')) {
    $('btn-rig-slots').addEventListener('click', () => workGameCornerShift());
  }
  if ($('btn-fight-tourney')) {
    $('btn-fight-tourney').addEventListener('click', () => startUndergroundTournament());
  }
  if ($('btn-breed-lab')) {
    $('btn-breed-lab').addEventListener('click', () => breedUndergroundEgg());
  }
  if ($('btn-fusion-lab')) {
    $('btn-fusion-lab').addEventListener('click', () => fuseUndergroundPartner());
  }
  if ($('btn-battle-rivals')) {
    $('btn-battle-rivals').addEventListener('click', () => {
      beginRivalBattle(game.defeatedHeroRival ? 'rocket' : 'hero');
    });
  }
  if ($('btn-catch-wild')) {
    $('btn-catch-wild').addEventListener('click', () => {
      if (game.mode === 'intro') confirmIntroNames();
      ensureBikeStolen();
      if (game.mode !== 'battle' || !game.battle) {
        beginWildBattle();
      }
      // Throw Unique Team Rocket R-Ball to STEAL Trainer or Wild Pokémon!
      game.battle.phase = 'menu';
      attack('orb');
      battleContinue();
    });
  }
  if ($('btn-return-map')) {
    $('btn-return-map').addEventListener('click', () => {
      if (game.mode === 'intro') confirmIntroNames();
      ensureBikeStolen();
      game.mode = 'map';
      game.battle = null;
      game.message = `Returned to Overworld Map (${currentAreaName()}).`;
      updateUI();
    });
  }

  canvas.addEventListener('pointerdown', e => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) * W) / r.width;
    const y = ((e.clientY - r.top) * H) / r.height;
    if (game.mode === 'slots') {
      if (y >= 192) {
        const slot = clamp(Math.floor(x / 96), 0, 3);
        if (slot === 0) startOrStopSlotSpin();
        else if (slot === 1) workGameCornerShift();
        else if (slot === 2) startUndergroundTournament();
        else {
          game.mode = 'map';
          updateUI();
        }
      } else if (y >= 118 && y <= 155) {
        startUndergroundTournament();
      } else {
        startOrStopSlotSpin();
      }
      return;
    }
    if (game.mode === 'daycare') {
      if (y >= 192) {
        const slot = clamp(Math.floor(x / 96), 0, 3);
        if (slot === 0) performDaycareShiftOnly();
        else if (slot === 1) breedUndergroundEgg();
        else if (slot === 2) fuseUndergroundPartner();
        else {
          game.mode = 'map';
          updateUI();
        }
      } else if (x < W / 2) {
        breedUndergroundEgg();
      } else {
        fuseUndergroundPartner();
      }
      return;
    }
    if (game.mode === 'management') {
      if (y >= 192) {
        const slot = clamp(Math.floor(x / 96), 0, 3);
        if (slot === 0) runExecutiveOperation('base');
        else if (slot === 1) runExecutiveOperation('gym');
        else if (slot === 2) runExecutiveOperation('biz');
        else {
          game.mode = 'map';
          updateUI();
        }
      } else {
        const col = clamp(Math.floor(x / 128), 0, 2);
        runExecutiveOperation(['base', 'gym', 'biz'][col]);
      }
      return;
    }
    if (game.mode === 'battle') {
      if (game.battle?.phase === 'menu' && y > 195) {
        const slot = clamp(Math.floor(x / 96), 0, 3);
        attack(['spark', 'tail', 'snack', 'orb'][slot]);
      } else if (game.battle?.phase !== 'menu') {
        battleContinue();
      }
    } else if (game.mode === 'map' && nearbyInteraction()) {
      interact();
    }
  });

  $('sound-toggle').addEventListener('click', e => {
    game.sound = !game.sound;
    e.currentTarget.querySelector('span').textContent = game.sound ? 'Sound on' : 'Sound off';
    showToast(game.sound ? 'Sound is on' : 'Sound is off');
  });

  function loop(now) {
    const dt = Math.min(40, now - game.lastTime);
    game.lastTime = now;
    game.anim = now;

    if (game.mode === 'slots' && game.slots.spinning) {
      for (let i = 0; i < 3; i++) {
        if (!game.slots.locked[i] && now >= game.slots.stopTimes[i]) {
          lockReel(i);
        }
      }
    }

    if (game.mode === 'map') {
      game.moveClock += dt;
      if (game.grassEncounterCooldown > 0) game.grassEncounterCooldown -= dt / 1000;
      const stepInterval = game.ridingBike ? Math.max(75, 105 - game.playerUpgradeIdx * 7) : 150;
      if (game.moveClock > stepInterval) {
        let dir = null;
        if (game.keys.arrowup || game.keys.w) dir = 'up';
        else if (game.keys.arrowdown || game.keys.s) dir = 'down';
        else if (game.keys.arrowleft || game.keys.a) dir = 'left';
        else if (game.keys.arrowright || game.keys.d) dir = 'right';
        if (dir) {
          move(dir);
          game.moveClock = 0;
        }
      }
    }
    render();
    requestAnimationFrame(loop);
  }

  updateUI();
  requestAnimationFrame(loop);
})();
