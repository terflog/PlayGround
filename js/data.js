(function () {
  const R = (window.REDLINE = window.REDLINE || {});

  R.RANKS = [
    { name: 'Grunt', rep: 0, tier: 1, reward: 0, color: '#9aa1ab', motto: 'Nobody. Yet.' },
    { name: 'Runner', rep: 40, tier: 2, reward: 160, color: '#78c9a0', motto: 'Fast hands. Faster feet.' },
    { name: 'Agent', rep: 110, tier: 3, reward: 300, color: '#66b9dd', motto: 'Trusted with the good ball.' },
    { name: 'Lieutenant', rep: 220, tier: 4, reward: 460, color: '#b68ce6', motto: 'People fear the uniform now.' },
    { name: 'Executive', rep: 360, tier: 5, reward: 760, color: '#f0b45e', motto: 'You have a key to the liquor cabinet.' },
    { name: 'Boss', rep: 520, tier: 6, reward: 1600, color: '#f05a5a', motto: 'The chair is warm. Take it.' }
  ];

  R.TYPES = {
    Normal: '#b9b6a2', Electric: '#f2d24b', Poison: '#b47bd8', Flying: '#9cc4e4',
    Fighting: '#df8264', Ghost: '#8f7bd0', Fire: '#f08a4b', Ground: '#d6b46a',
    Psychic: '#ef82a8', Water: '#69a9e6', Rock: '#b5a078', Dragon: '#7e8ee8'
  };

  R.LOCATIONS = [
    { tier: 1, name: 'Viridian Forest', flavor: 'A green maze full of campers and easy marks.' },
    { tier: 1, name: 'Route 3', flavor: 'Dust, rope bridges, and trainers who never look up.' },
    { tier: 1, name: 'Pewter Museum', flavor: 'Ancient fossils, modern locks, one sleepy guard.' },
    { tier: 2, name: 'Mt. Moon', flavor: 'Echoes hide footsteps. The moon hides everything else.' },
    { tier: 2, name: 'Cerulean Cape', flavor: 'Sea spray, rich tourists, and a very smug gym crowd.' },
    { tier: 2, name: 'Vermilion Docks', flavor: 'Crates stacked to the ceiling. Nobody counts them twice.' },
    { tier: 3, name: 'Safari Zone', flavor: 'Warden is drunk. The fences are not.' },
    { tier: 3, name: 'Rocket Game Corner', flavor: 'Your own house. Which makes stealing from it awkward.' },
    { tier: 3, name: 'Pokemon Tower', flavor: 'The ghosts here have seen worse than you.' },
    { tier: 4, name: 'Seafoam Islands', flavor: 'A frozen labyrinth with a current running through it.' },
    { tier: 4, name: 'Cinnabar Mansion', flavor: 'Burnt journals, broken elevators, a fortune in old labs.' },
    { tier: 4, name: 'Power Plant', flavor: 'Ten thousand volts and one bored night guard.' },
    { tier: 5, name: 'Silph Co.', flavor: 'Glass towers, keycards, and a security budget larger than your crew.' },
    { tier: 5, name: 'Saffron Dojo', flavor: 'Fighting types. Terrible at locking doors.' },
    { tier: 5, name: 'Victory Road', flavor: 'Every trainer in the region passes through. So does every mistake.' },
    { tier: 6, name: 'Indigo Plateau', flavor: 'The league itself. Armed, watched, and unbearably smug.' },
    { tier: 6, name: 'Cerulean Cave', flavor: 'The cave they do not put on maps. The one that whispers.' },
    { tier: 6, name: 'Rocket HQ', flavor: 'Borrowing from the boss. If this works, it is a promotion.' }
  ];

  const species = [
    {
      id: 'rattata', name: 'Rattata', tier: 1, type: 'Normal', catch: 0.76, power: 1,
      stats: { stealth: 4, muscle: 2, tech: 2, charm: 1 }, ability: 'Squeak & Scramble',
      tagline: 'Chews through anything. Including the plan.',
      colors: { body: '#8b6bb1', shade: '#694c8d', belly: '#ddcdea', accent: '#f3e8fa' },
      look: { ears: 'round', tail: 'thin', whiskers: true, fangs: true, brows: true }
    },
    {
      id: 'pidgey', name: 'Pidgey', tier: 1, type: 'Flying', catch: 0.72, power: 1,
      stats: { stealth: 3, muscle: 2, tech: 2, charm: 2 }, ability: 'Dust Gust',
      tagline: 'Small, loud, and impossible to catch indoors.',
      colors: { body: '#bb8b50', shade: '#8f6537', belly: '#f3e4c0', accent: '#e8b95c' },
      look: { ears: 'tuft', beak: true, wings: true, tail: 'fan' }
    },
    {
      id: 'magikarp', name: 'Magikarp', tier: 1, type: 'Water', catch: 0.86, power: 1,
      stats: { stealth: 1, muscle: 1, tech: 1, charm: 2 }, ability: 'Splash',
      tagline: 'Worthless in a fight. Worth a fortune in a crate.',
      colors: { body: '#e06a3b', shade: '#b34a24', belly: '#f4c58f', accent: '#f2d06b' },
      look: { body: 'fish', lips: true, fins: true, tail: 'fish' }
    },
    {
      id: 'psyduck', name: 'Psyduck', tier: 1, type: 'Water', catch: 0.62, power: 2,
      stats: { stealth: 2, muscle: 2, tech: 3, charm: 3 }, ability: 'Headache Pulse',
      tagline: 'Constantly confused. Occasionally psychic.',
      colors: { body: '#f0cf5a', shade: '#c9a83c', belly: '#fdf0b8', accent: '#e6973b' },
      look: { tuft: true, beak: true, droopy: true }
    },
    {
      id: 'meowth', name: 'Meowth', tier: 2, type: 'Normal', catch: 0.62, power: 2,
      stats: { stealth: 2, muscle: 2, tech: 3, charm: 5 }, ability: 'Pay Day',
      tagline: 'Talks a guard out of a key, then charges him for the advice.',
      colors: { body: '#f2dfb2', shade: '#d0b77b', belly: '#fff5da', accent: '#e8b93f' },
      look: { ears: 'cat', tail: 'curl', coin: true, whiskers: true }
    },
    {
      id: 'zubat', name: 'Zubat', tier: 2, type: 'Poison', catch: 0.66, power: 2,
      stats: { stealth: 5, muscle: 2, tech: 2, charm: 2 }, ability: 'Echo Veil',
      tagline: 'No eyes. No problem. No ceiling either.',
      colors: { body: '#7d8ac9', shade: '#5b67a3', belly: '#b9c2eb', accent: '#9f6bd1' },
      look: { ears: 'bat', wings: true, closedEyes: true, fangs: true }
    },
    {
      id: 'ekans', name: 'Ekans', tier: 2, type: 'Poison', catch: 0.62, power: 2,
      stats: { stealth: 4, muscle: 3, tech: 2, charm: 1 }, ability: 'Silent Coil',
      tagline: 'Fits through vents. Holds a grudge.',
      colors: { body: '#a06bc4', shade: '#7b4a9b', belly: '#e4c8f2', accent: '#f0d45c' },
      look: { ears: 'none', tail: 'coil', fangs: true, brows: true }
    },
    {
      id: 'growlithe', name: 'Growlithe', tier: 2, type: 'Fire', catch: 0.52, power: 3,
      stats: { stealth: 2, muscle: 4, tech: 2, charm: 2 }, ability: 'Hot Pursuit',
      tagline: 'Loyal to whoever is holding the food.',
      colors: { body: '#e8893c', shade: '#c06422', belly: '#f7dfb0', accent: '#3b2b22' },
      look: { ears: 'pointy', stripes: true, mane: true, tail: 'fluff' }
    },
    {
      id: 'cubone', name: 'Cubone', tier: 2, type: 'Ground', catch: 0.56, power: 3,
      stats: { stealth: 2, muscle: 4, tech: 2, charm: 2 }, ability: 'Bone Toss',
      tagline: 'The helmet is creepy. The throwing arm is useful.',
      colors: { body: '#a78b63', shade: '#806747', belly: '#e7d4ac', accent: '#f2ead8' },
      look: { skull: true, tail: 'thin', club: true }
    },
    {
      id: 'pikachu', name: 'Pikachu', tier: 3, type: 'Electric', catch: 0.43, power: 3,
      stats: { stealth: 3, muscle: 2, tech: 5, charm: 3 }, ability: 'Blackout',
      tagline: 'One spark kills the camera feed. Also the lights. Also the backup.',
      colors: { body: '#f4d648', shade: '#d1ae26', belly: '#f9ec9a', accent: '#e9554a' },
      look: { ears: 'pika', tail: 'bolt', cheeks: true }
    },
    {
      id: 'eevee', name: 'Eevee', tier: 3, type: 'Normal', catch: 0.51, power: 3,
      stats: { stealth: 3, muscle: 3, tech: 3, charm: 4 }, ability: 'Adaptive Instinct',
      tagline: 'Fits into any crew, any vent, any very small bag.',
      colors: { body: '#b9824f', shade: '#946334', belly: '#f0dfbb', accent: '#e9c98a' },
      look: { ears: 'long', mane: true, tail: 'fluff' }
    },
    {
      id: 'gastly', name: 'Gastly', tier: 3, type: 'Ghost', catch: 0.41, power: 3,
      stats: { stealth: 4, muscle: 1, tech: 4, charm: 2 }, ability: 'Fog Bank',
      tagline: 'A gas leak with a sense of humor.',
      colors: { body: '#5b4a7c', shade: '#3f3159', belly: '#8d78ad', accent: '#c8b8e8' },
      look: { gas: true, floating: true, fangs: true, brows: true }
    },
    {
      id: 'koffing', name: 'Koffing', tier: 3, type: 'Poison', catch: 0.56, power: 3,
      stats: { stealth: 2, muscle: 2, tech: 4, charm: 3 }, ability: 'Smokescreen',
      tagline: 'A walking smoke bomb with a skull painted on.',
      colors: { body: '#8c5fa8', shade: '#6c4486', belly: '#c39bd8', accent: '#d8b9e8' },
      look: { ears: 'none', craters: true, floating: true, fumes: true }
    },
    {
      id: 'drowzee', name: 'Drowzee', tier: 3, type: 'Psychic', catch: 0.56, power: 3,
      stats: { stealth: 2, muscle: 2, tech: 3, charm: 5 }, ability: 'Sleep Suggestion',
      tagline: 'Makes guards dream of overtime and walk away.',
      colors: { body: '#c9a15a', shade: '#a37f3e', belly: '#f0dcac', accent: '#8a5b3d' },
      look: { ears: 'long', rings: true, longNose: true, droopy: true }
    },
    {
      id: 'machop', name: 'Machop', tier: 4, type: 'Fighting', catch: 0.52, power: 4,
      stats: { stealth: 2, muscle: 6, tech: 2, charm: 1 }, ability: 'Door Removal',
      tagline: 'The plan is simple: there is no door anymore.',
      colors: { body: '#9aa7b5', shade: '#74808f', belly: '#d7dee6', accent: '#5e6874' },
      look: { ears: 'none', muscles: true, crest: true, brows: true }
    },
    {
      id: 'onix', name: 'Onix', tier: 4, type: 'Rock', catch: 0.31, power: 4,
      stats: { stealth: 1, muscle: 6, tech: 2, charm: 1 }, ability: 'Tunnel',
      tagline: 'A freight train with a personal grudge against floors.',
      colors: { body: '#9a927f', shade: '#78715f', belly: '#c8c2ae', accent: '#5c5649' },
      look: { body: 'rock', segments: true, brows: true }
    },
    {
      id: 'mr_mime', name: 'Mr. Mime', tier: 4, type: 'Psychic', catch: 0.37, power: 4,
      stats: { stealth: 2, muscle: 2, tech: 4, charm: 5 }, ability: 'Invisible Wall',
      tagline: 'Mimes a locked door until the guards believe it is locked.',
      colors: { body: '#e8a8c8', shade: '#c47fa2', belly: '#f7dbe8', accent: '#6e8fd6' },
      look: { clown: true, tuft: true, ears: 'pointy' }
    },
    {
      id: 'slowpoke', name: 'Slowpoke', tier: 4, type: 'Water', catch: 0.62, power: 4,
      stats: { stealth: 2, muscle: 2, tech: 3, charm: 4 }, ability: 'Blissful Ignore',
      tagline: 'By the time it notices the alarm, you are already gone.',
      colors: { body: '#e8a0b0', shade: '#c67b8d', belly: '#f7d8de', accent: '#f0e6d8' },
      look: { ears: 'round', droopy: true, tail: 'thin' }
    },
    {
      id: 'snorlax', name: 'Snorlax', tier: 5, type: 'Normal', catch: 0.23, power: 5,
      stats: { stealth: 1, muscle: 6, tech: 2, charm: 3 }, ability: 'Roadblock',
      tagline: 'Blocks the only exit. Technically, that is a plan.',
      colors: { body: '#5f8a9e', shade: '#456b7c', belly: '#e9dfc2', accent: '#c9b995' },
      look: { body: 'big', sleepy: true, ears: 'round' }
    },
    {
      id: 'dratini', name: 'Dratini', tier: 5, type: 'Dragon', catch: 0.31, power: 5,
      stats: { stealth: 3, muscle: 3, tech: 4, charm: 3 }, ability: 'Serpent Slip',
      tagline: 'Legendary bloodline. Alarmingly good at vents.',
      colors: { body: '#6f9bd9', shade: '#4f78b0', belly: '#d7e7f7', accent: '#f0d76b' },
      look: { body: 'serpent', horn: true, fins: true, gentle: true }
    },
    {
      id: 'arcanine', name: 'Arcanine', tier: 5, type: 'Fire', catch: 0.3, power: 5,
      stats: { stealth: 2, muscle: 5, tech: 3, charm: 3 }, ability: 'Thunder Road',
      tagline: 'The fastest getaway in the region. Also the loudest.',
      colors: { body: '#e07a3a', shade: '#b85a22', belly: '#f5e3c0', accent: '#2f2a26' },
      look: { ears: 'pointy', mane: true, stripes: true, tail: 'fluff' }
    },
    {
      id: 'mewtwo', name: 'Mewtwo', tier: 6, type: 'Psychic', catch: 0.12, power: 6,
      stats: { stealth: 5, muscle: 6, tech: 6, charm: 3 }, ability: 'Psychic Dominance',
      tagline: 'The reason the cave is not on the map. The reason you came anyway.',
      colors: { body: '#9d8fc4', shade: '#776a9e', belly: '#d9d1ea', accent: '#5f4f87' },
      look: { ears: 'none', horn: true, mewtwo: true, tail: 'mewtwo', brows: true }
    }
  ];

  R.SPECIES = {};
  for (const s of species) R.SPECIES[s.id] = s;
  R.SPECIES_LIST = species;

  R.FACILITIES = [
    {
      id: 'storage', name: 'Storage Bay', icon: 'box', rank: 0, baseCost: 170, growth: 1.62,
      blurb: 'Steel racks, index cards, and absolutely no questions.',
      effect: (lvl) => `+${lvl * 4} Pokémon capacity`
    },
    {
      id: 'dojo', name: 'Training Dojo', icon: 'dumbbell', rank: 1, baseCost: 280, growth: 1.68,
      blurb: 'A punching bag, a whiteboard, and one very motivational poster.',
      effect: (lvl) => `+${lvl} to every partner stat`
    },
    {
      id: 'lab', name: 'Forgery Lab', icon: 'flask', rank: 2, baseCost: 420, growth: 1.7,
      blurb: 'Custom balls, dead-bolt diagrams, and a chemistry set.',
      effect: (lvl) => `+${lvl * 4}% capture · cheaper balls`
    },
    {
      id: 'garage', name: 'Getaway Garage', icon: 'car', rank: 3, baseCost: 620, growth: 1.72,
      blurb: 'Three vans, two plates each, one very calm driver.',
      effect: (lvl) => `-${lvl * 8}% heat gained`
    },
    {
      id: 'propaganda', name: 'Propaganda Office', icon: 'radio', rank: 4, baseCost: 900, growth: 1.74,
      blurb: 'A radio tower and a man who is very good at lying.',
      effect: (lvl) => `+${lvl * 8}% credits & reputation`
    },
    {
      id: 'bribe', name: 'Bribe Network', icon: 'cash', rank: 4, baseCost: 1050, growth: 1.76,
      blurb: 'A filing cabinet full of envelopes. All labeled "birdseed".',
      effect: (lvl) => `-${lvl * 3} heat per job · cheap lay-low`
    }
  ];

  R.EXPANSIONS = [
    {
      id: 'east', name: 'East Wing', cost: 1600, icon: 'users',
      bonus: '+4 capacity · +5% reputation', blurb: 'A second dorm block, a bigger crew, and room to breathe.',
      color: '#e06060'
    },
    {
      id: 'vault', name: 'Underground Vault', cost: 3000, icon: 'vault',
      bonus: '+6 capacity · +10% credits', blurb: 'Dig deep. Store everything. Let nobody see the ledger.',
      color: '#f0c75e'
    },
    {
      id: 'rooftop', name: 'Rooftop Deck', cost: 4800, icon: 'tower',
      bonus: '-10 heat · +5% capture', blurb: 'A helipad, a radio mast, and a view of the city you now own.',
      color: '#65d6c0'
    }
  ];

  R.MISSION_TAGS = [
    {
      id: 'rush', label: 'RUSH JOB', tone: 'hot',
      desc: '+35% payout · +50% heat', creds: 1.35, rep: 1.1, heat: 1.5, catch: 0, distance: 0
    },
    {
      id: 'quiet', label: 'QUIET NIGHT', tone: 'cool',
      desc: '-45% heat · -15% payout', creds: 0.85, rep: 1, heat: 0.55, catch: 0, distance: 0
    },
    {
      id: 'vip', label: "COLLECTOR'S LIST", tone: 'gold',
      desc: '+50% reputation · -5% capture', creds: 1, rep: 1.5, heat: 1, catch: -0.05, distance: 0
    },
    {
      id: 'inside', label: 'INSIDE JOB', tone: 'cool',
      desc: 'Two rooms closer to the target', creds: 0.95, rep: 1, heat: 1, catch: 0, distance: -2
    },
    {
      id: 'payday', label: 'PAYDAY', tone: 'gold',
      desc: '+50% credits · -20% reputation', creds: 1.5, rep: 0.8, heat: 1, catch: 0, distance: 0
    }
  ];

  R.STARTER_ID = 'meowth';

  // ---------------------------------------------------------------- sprites
  function eye(x, y, look, colors) {
    if (look.closedEyes) {
      return `<path d="M${x - 6} ${y} q6 5 12 0" fill="none" stroke="#1b1720" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    if (look.sleepy) {
      return `<path d="M${x - 6} ${y} q6 5 12 0" fill="none" stroke="#1b1720" stroke-width="2.8" stroke-linecap="round"/>`;
    }
    const pupil = look.gas ? '#f9e7a0' : '#1b1720';
    let out = `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="6.2" fill="${pupil}"/>
      <circle cx="${x - 1.5}" cy="${y - 2.6}" r="1.5" fill="#fff" opacity=".9"/>`;
    if (look.droopy) out += `<path d="M${x - 6.5} ${y - 4.4} q6.5 -3 13 0" fill="none" stroke="${colors.shade}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (look.brows) out += `<path d="M${x - 7} ${y - 10} l12 -3" stroke="${colors.shade}" stroke-width="2.6" stroke-linecap="round"/>`;
    return out;
  }

  function tailMarkup(kind, c) {
    switch (kind) {
      case 'bolt':
        return `<path d="M91 74 L111 55 L99 53 L114 30 L89 51 L102 54 L87 67 Z" fill="${c.accent}" stroke="${c.shade}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'curl':
        return `<path d="M92 78 q27 7 22 -16 q-4 -16 -17 -6" fill="none" stroke="${c.shade}" stroke-width="9" stroke-linecap="round"/>
                <path d="M92 78 q27 7 22 -16 q-4 -16 -17 -6" fill="none" stroke="${c.body}" stroke-width="5" stroke-linecap="round"/>`;
      case 'thin':
        return `<path d="M92 80 q27 5 26 -19" fill="none" stroke="${c.shade}" stroke-width="4" stroke-linecap="round"/>`;
      case 'fluff':
        return `<circle cx="101" cy="76" r="13" fill="${c.shade}"/><circle cx="108" cy="66" r="8" fill="${c.body}"/>`;
      case 'fish':
        return `<path d="M96 66 L118 48 L114 66 L118 83 Z" fill="${c.accent}" stroke="${c.shade}" stroke-width="2"/>`;
      case 'fan':
        return `<path d="M92 78 L116 62 L112 80 L118 90 Z" fill="${c.shade}"/>`;
      case 'coil':
        return `<path d="M88 90 q18 10 22 -4 q3 -12 -11 -12" fill="none" stroke="${c.shade}" stroke-width="9" stroke-linecap="round"/>`;
      case 'mewtwo':
        return `<path d="M93 76 q34 10 30 -22 q-2 -14 -12 -6" fill="none" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>`;
      default:
        return '';
    }
  }

  function earsMarkup(kind, c) {
    switch (kind) {
      case 'cat':
        return `<path d="M33 44 L27 17 L51 34 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M35 39 L32 25 L45 34 Z" fill="${c.belly}"/>
                <path d="M87 44 L93 17 L69 34 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M85 39 L88 25 L75 34 Z" fill="${c.belly}"/>`;
      case 'pika':
        return `<path d="M37 42 L26 4 L45 10 L49 38 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M30 16 L27 4 L38 8 L39 15 Z" fill="#2b2622"/>
                <path d="M83 42 L94 4 L75 10 L71 38 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M90 16 L93 4 L82 8 L81 15 Z" fill="#2b2622"/>`;
      case 'pointy':
        return `<path d="M34 45 L28 18 L50 35 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M36 39 L33 27 L44 35 Z" fill="${c.belly}"/>
                <path d="M86 45 L92 18 L70 35 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M84 39 L87 27 L76 35 Z" fill="${c.belly}"/>`;
      case 'round':
        return `<circle cx="33" cy="39" r="15" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4"/>
                <circle cx="33" cy="39" r="8" fill="${c.belly}"/>
                <circle cx="87" cy="39" r="15" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4"/>
                <circle cx="87" cy="39" r="8" fill="${c.belly}"/>`;
      case 'long':
        return `<ellipse cx="31" cy="25" rx="10" ry="22" transform="rotate(-18 31 25)" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4"/>
                <ellipse cx="32" cy="26" rx="4.5" ry="13" transform="rotate(-18 32 26)" fill="${c.belly}"/>
                <ellipse cx="89" cy="25" rx="10" ry="22" transform="rotate(18 89 25)" fill="${c.body}" stroke="${c.shade}" stroke-width="2.4"/>
                <ellipse cx="88" cy="26" rx="4.5" ry="13" transform="rotate(18 88 26)" fill="${c.belly}"/>`;
      case 'bat':
        return `<path d="M35 45 L14 22 L30 18 L45 35 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.2" stroke-linejoin="round"/>
                <path d="M85 45 L106 22 L90 18 L75 35 Z" fill="${c.body}" stroke="${c.shade}" stroke-width="2.2" stroke-linejoin="round"/>`;
      case 'tuft':
        return `<path d="M52 31 q8 -20 16 0 q-8 -7 -16 0" fill="${c.body}" stroke="${c.shade}" stroke-width="2" stroke-linejoin="round"/>`;
      default:
        return '';
    }
  }

  R.sprite = function sprite(sp, size = 100, opts = {}) {
    const c = sp.colors;
    const L = sp.look || {};
    const body = L.body || 'round';
    let back = '';
    let front = '';
    let bodyMarkup = '';

    back += tailMarkup(L.tail, c);

    if (L.wings) {
      back += `<path d="M39 60 Q9 38 8 70 Q20 70 30 78 Q18 86 34 86 Z" fill="${c.shade}" opacity=".95"/>
               <path d="M81 60 Q111 38 112 70 Q100 70 90 78 Q102 86 86 86 Z" fill="${c.shade}" opacity=".95"/>`;
    }
    if (L.floating) {
      back += `<circle cx="25" cy="78" r="13" fill="${c.accent}" opacity=".18"/>
               <circle cx="96" cy="72" r="9" fill="${c.accent}" opacity=".2"/>
               <circle cx="91" cy="92" r="5" fill="${c.accent}" opacity=".22"/>`;
    }
    if (L.gas) {
      back += `<circle cx="30" cy="62" r="17" fill="${c.body}" opacity=".55"/>
               <circle cx="90" cy="62" r="17" fill="${c.body}" opacity=".55"/>
               <circle cx="42" cy="44" r="13" fill="${c.body}" opacity=".4"/>
               <circle cx="78" cy="44" r="13" fill="${c.body}" opacity=".4"/>`;
    }

    back += earsMarkup(L.ears, c);

    if (body === 'fish') {
      bodyMarkup = `<ellipse cx="57" cy="68" rx="42" ry="25" fill="${c.body}" stroke="${c.shade}" stroke-width="2.5"/>
        <path d="M28 60 q-14 -12 -18 8 q14 3 20 0" fill="${c.belly}" stroke="${c.shade}" stroke-width="2"/>
        <ellipse cx="60" cy="76" rx="27" ry="13" fill="${c.belly}"/>`;
    } else if (body === 'big') {
      bodyMarkup = `<ellipse cx="60" cy="69" rx="41" ry="36" fill="${c.body}" stroke="${c.shade}" stroke-width="2.5"/>
        <ellipse cx="60" cy="77" rx="29" ry="25" fill="${c.belly}"/>
        <ellipse cx="26" cy="71" rx="10" ry="15" fill="${c.body}" stroke="${c.shade}" stroke-width="2"/>
        <ellipse cx="94" cy="71" rx="10" ry="15" fill="${c.body}" stroke="${c.shade}" stroke-width="2"/>`;
    } else if (body === 'rock') {
      bodyMarkup = `<circle cx="61" cy="88" r="25" fill="${c.body}" stroke="${c.shade}" stroke-width="2.5"/>
        <circle cx="56" cy="62" r="20" fill="${c.body}" stroke="${c.shade}" stroke-width="2.5"/>
        <circle cx="64" cy="40" r="16" fill="${c.body}" stroke="${c.shade}" stroke-width="2.5"/>
        <ellipse cx="64" cy="72" rx="12" ry="14" fill="${c.belly}" opacity=".7"/>`;
    } else {
      const rx = body === 'serpent' ? 32 : 35;
      const ry = body === 'serpent' ? 28 : 33;
      bodyMarkup = `<ellipse cx="60" cy="68" rx="${rx}" ry="${ry}" fill="${c.body}" stroke="${c.shade}" stroke-width="2.5"/>
        <ellipse cx="60" cy="79" rx="${rx * 0.62}" ry="${ry * 0.54}" fill="${c.belly}"/>`;
    }

    if (body !== 'rock') {
      bodyMarkup += `<ellipse cx="27" cy="74" rx="8" ry="12" transform="rotate(22 27 74)" fill="${c.body}" stroke="${c.shade}" stroke-width="2"/>
        <ellipse cx="93" cy="74" rx="8" ry="12" transform="rotate(-22 93 74)" fill="${c.body}" stroke="${c.shade}" stroke-width="2"/>
        <ellipse cx="47" cy="101" rx="11" ry="6" fill="${c.shade}"/>
        <ellipse cx="73" cy="101" rx="11" ry="6" fill="${c.shade}"/>`;
    }

    if (L.fins) {
      front += `<path d="M24 58 L10 44 L18 64 Z" fill="${c.accent}" stroke="${c.shade}" stroke-width="2"/>
                <path d="M96 58 L110 44 L102 64 Z" fill="${c.accent}" stroke="${c.shade}" stroke-width="2"/>`;
    }
    if (L.mane) {
      front += `<circle cx="32" cy="74" r="10" fill="${c.belly}"/><circle cx="88" cy="74" r="10" fill="${c.belly}"/>
                <circle cx="42" cy="84" r="8" fill="${c.belly}"/><circle cx="78" cy="84" r="8" fill="${c.belly}"/>`;
    }
    if (L.stripes) {
      front += `<path d="M40 47 l10 5 M37 58 l11 5 M84 47 l-10 5" stroke="${c.accent}" stroke-width="4" stroke-linecap="round" opacity=".75"/>`;
    }
    if (L.rings) {
      front += `<path d="M32 78 q28 12 56 0 M36 88 q24 8 48 0" fill="none" stroke="${c.shade}" stroke-width="2.4" opacity=".45"/>`;
    }
    if (L.muscles) {
      front += `<path d="M39 63 q-7 12 2 18 M81 63 q7 12 -2 18" fill="none" stroke="${c.shade}" stroke-width="2.4"/>
                <path d="M52 79 q8 5 16 0" fill="none" stroke="${c.shade}" stroke-width="2.2"/>`;
    }
    if (L.craters) {
      front += `<circle cx="38" cy="53" r="5" fill="${c.shade}" opacity=".65"/>
                <circle cx="82" cy="80" r="4" fill="${c.shade}" opacity=".65"/>
                <circle cx="74" cy="49" r="3" fill="${c.shade}" opacity=".65"/>`;
    }
    if (L.segments) {
      front += `<path d="M39 84 q22 9 44 0 M45 60 q15 7 30 0" fill="none" stroke="${c.shade}" stroke-width="2.5"/>`;
    }
    if (L.clown) {
      front += `<ellipse cx="60" cy="67" rx="25" ry="24" fill="#fdf4f7"/>
                <path d="M36 42 q6 -14 17 -8 M84 42 q-6 -14 -17 -8" fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (L.fumes) {
      front += `<circle cx="30" cy="44" r="5" fill="${c.accent}" opacity=".5"/><circle cx="91" cy="40" r="4" fill="${c.accent}" opacity=".5"/>`;
    }

    // eyes and face
    const eyeY = L.clown ? 66 : 63;
    front += eye(49, eyeY, L, c) + eye(71, eyeY, L, c);

    if (L.cheeks) {
      front += `<circle cx="38" cy="74" r="6" fill="${c.accent}" opacity=".8"/>
                <circle cx="82" cy="74" r="6" fill="${c.accent}" opacity=".8"/>`;
    }
    if (L.coin) {
      front += `<ellipse cx="60" cy="42" rx="8" ry="6" fill="${c.accent}" stroke="#b98614" stroke-width="2"/>
                <ellipse cx="60" cy="42" rx="4" ry="2.6" fill="#fff3b0" opacity=".8"/>`;
    }
    if (L.skull) {
      front += `<path d="M31 50 q29 -22 58 0 l0 10 q-29 12 -58 0 Z" fill="#f1ead6" stroke="#b8aa8c" stroke-width="2"/>
                <path d="M52 63 l0 7 M68 63 l0 7" stroke="#9b8c70" stroke-width="2.6"/>
                <path d="M33 50 l-5 -10 l11 3 Z" fill="#f1ead6"/>`;
    }
    if (L.club) {
      front += `<path d="M96 84 L114 58" stroke="#e7dcc2" stroke-width="6" stroke-linecap="round"/>
                <circle cx="116" cy="54" r="7" fill="#e7dcc2" stroke="#b8aa8c" stroke-width="2"/>`;
    }
    if (L.beak) {
      front += `<path d="M54 72 L60 82 L66 72 Z" fill="${c.accent}" stroke="${c.shade}" stroke-width="1.8"/>`;
    } else if (L.lips) {
      front += `<path d="M51 75 q9 -6 18 0 q-9 9 -18 0" fill="${c.accent}" stroke="${c.shade}" stroke-width="1.8"/>`;
    } else if (L.longNose) {
      front += `<path d="M60 62 q-4 14 -1 18 q5 4 8 -2" fill="none" stroke="${c.shade}" stroke-width="2.6" stroke-linecap="round"/>`;
      front += `<path d="M53 79 q7 3 14 0" fill="none" stroke="#1b1720" stroke-width="2" stroke-linecap="round"/>`;
    } else if (L.mewtwo) {
      front += `<path d="M54 76 q6 4 12 0" fill="none" stroke="#3a2e54" stroke-width="2.2" stroke-linecap="round"/>`;
    } else {
      front += `<path d="M55 75 q5 4 10 0" fill="none" stroke="#3a2e34" stroke-width="2.2" stroke-linecap="round"/>`;
    }

    if (L.whiskers) {
      front += `<path d="M33 74 L14 70 M33 79 L15 80 M87 74 L106 70 M87 79 L105 80" stroke="${c.shade}" stroke-width="1.5" opacity=".8"/>`;
    }
    if (L.fangs) {
      front += `<path d="M52 78 l3 6 l4 -6 M64 78 l4 6 l3 -6" fill="#fff8e7" stroke="#d9cdb4" stroke-width="1"/>`;
    }
    if (L.horn) {
      front += `<path d="M56 36 L60 18 L65 36 Z" fill="${c.belly}" stroke="${c.shade}" stroke-width="2"/>`;
    }
    if (L.crest) {
      front += `<path d="M48 38 q12 -16 24 0 q-12 -6 -24 0" fill="${c.accent}" stroke="${c.shade}" stroke-width="1.8"/>`;
    }

    const label = `${sp.name} sprite`;
    return `<svg class="poke-sprite ${opts.className || ''}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${label}">
      <ellipse cx="60" cy="108" rx="31" ry="6" fill="rgba(0,0,0,.38)"/>
      ${back}
      ${bodyMarkup}
      ${front}
    </svg>`;
  };

  R.typeColor = (sp) => R.TYPES[sp.type] || '#b9b6a2';

  R.money = (n) => '$' + Math.max(0, Math.round(n)).toLocaleString('en-US');
})();
