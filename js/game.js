(function () {
  const R = window.REDLINE;
  const SAVE_KEY = 'rocket-redline-save-v1';

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const round = (n) => Math.round(n);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const uid = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  R.clamp = clamp;
  R.rand = rand;
  R.pick = pick;
  R.fmtPct = (n) => Math.round(n * 100) + '%';

  function makeMon(speciesId, extra = {}) {
    return Object.assign({
      uid: uid(),
      species: speciesId,
      caughtOn: 1,
      starter: false
    }, extra);
  }

  function newGame() {
    const starter = makeMon(R.STARTER_ID, { starter: true, caughtOn: 0 });
    return {
      version: 1,
      started: false,
      rank: 0,
      creds: 300,
      rep: 0,
      heat: 8,
      balls: 6,
      day: 1,
      roster: [starter],
      activeId: starter.uid,
      facilities: { storage: 0, dojo: 0, lab: 0, garage: 0, propaganda: 0, bribe: 0 },
      expansions: { east: false, vault: false, rooftop: false },
      board: [],
      stats: { heists: 0, captures: 0, busts: 0, retreats: 0, raids: 0, earned: 0 },
      sound: true,
      empire: false,
      finalWon: false,
      lastResult: null,
      lastPromotion: null,
      seenHelp: false
    };
  }

  function normalize(state) {
    const fresh = newGame();
    const merged = Object.assign(fresh, state || {});
    merged.facilities = Object.assign({}, fresh.facilities, state && state.facilities);
    merged.expansions = Object.assign({}, fresh.expansions, state && state.expansions);
    merged.stats = Object.assign({}, fresh.stats, state && state.stats);
    if (!Array.isArray(merged.roster) || !merged.roster.length) {
      const starter = makeMon(R.STARTER_ID, { starter: true, caughtOn: 0 });
      merged.roster = [starter];
      merged.activeId = starter.uid;
    }
    if (!merged.roster.some((m) => m.uid === merged.activeId)) merged.activeId = merged.roster[0].uid;
    merged.board = Array.isArray(merged.board) ? merged.board.filter((m) => m && m.id !== 'sim') : [];
    return merged;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const state = normalize(parsed);
      if (!state.board.length) fillBoard(state);
      ensureFinalMission(state);
      return state;
    } catch (err) {
      console.warn('Save could not be read', err);
      return null;
    }
  }

  function save() {
    if (!R.state) return;
    try {
      const copy = Object.assign({}, R.state);
      copy.heist = null;
      copy.lastResult = null;
      copy.lastPromotion = null;
      localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    } catch (err) {
      console.warn('Save failed', err);
    }
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
  }

  function speciesOf(mon) {
    return R.SPECIES[mon && mon.species] || R.SPECIES[R.STARTER_ID];
  }

  function activePartner(state) {
    return state.roster.find((m) => m.uid === state.activeId) || state.roster[0];
  }

  function dojoLevel(state) { return state.facilities.dojo || 0; }

  function partnerStats(mon, state) {
    const base = speciesOf(mon).stats;
    const bonus = dojoLevel(state || R.state);
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v + bonus]));
  }

  function expansionCount(state) {
    return R.EXPANSIONS.reduce((n, e) => n + (state.expansions[e.id] ? 1 : 0), 0);
  }

  function facilityMax(state) {
    return 5 + expansionCount(state);
  }

  function capacity(state) {
    let cap = 8 + state.facilities.storage * 4;
    if (state.expansions.east) cap += 4;
    if (state.expansions.vault) cap += 6;
    if (state.expansions.rooftop) cap += 8;
    return cap;
  }

  function facilityCost(state, facility) {
    return round(facility.baseCost * Math.pow(facility.growth, state.facilities[facility.id] || 0));
  }

  function canBuyFacility(state, facility) {
    return state.rank >= facility.rank && (state.facilities[facility.id] || 0) < facilityMax(state);
  }

  function ballPackCost(state) {
    return Math.max(90, 160 - (state.facilities.lab || 0) * 12);
  }

  function layLowCost(state) {
    return Math.max(25, 75 - (state.facilities.bribe || 0) * 8);
  }

  function rerollCost(state) {
    return 40 + state.rank * 10;
  }

  function fenceValue(mon) {
    const sp = speciesOf(mon);
    return round(45 + sp.power * 55 + sp.tier * 25);
  }

  function creditMult(state) {
    return 1 + (state.facilities.propaganda || 0) * 0.08 + (state.expansions.vault ? 0.10 : 0);
  }

  function repMult(state) {
    return 1 + (state.facilities.propaganda || 0) * 0.08 + (state.expansions.east ? 0.05 : 0);
  }

  function heatMult(state) {
    return Math.max(0.2, 1 - (state.facilities.garage || 0) * 0.08);
  }

  function makeMission(state, opts = {}) {
    const rankTier = R.RANKS[state.rank].tier;
    const tier = opts.tier || clamp(rankTier + pick([-1, 0, 0, 0, 1]), 1, 6);
    const locations = R.LOCATIONS.filter((l) => l.tier === tier);
    const location = pick(locations);
    const pool = R.SPECIES_LIST.filter((s) => s.id !== 'mewtwo' && s.tier <= tier && s.tier >= Math.max(1, tier - 1));
    const sp = pick(pool);
    const difficulty = clamp(1 + Math.floor(rankTier / 2) + Math.floor(Math.random() * 3), 1, 5);
    const security = clamp(1 + Math.floor(difficulty * 0.55) + Math.floor(Math.random() * 2), 1, 5);
    const tag = Math.random() < 0.4 ? pick(R.MISSION_TAGS) : null;
    const tagMod = tag || { creds: 1, rep: 1, heat: 1, catch: 0, distance: 0 };
    const cleanMult = rand(0.9, 1.12);
    const credits = round((60 + tier * 55 + difficulty * 40) * cleanMult * tagMod.creds);
    const rep = round((7 + difficulty * 3 + tier * 3) * tagMod.rep);
    const heat = round((4 + difficulty * 2 + tier * 2) * tagMod.heat);
    const distance = Math.max(3, 4 + difficulty + tagMod.distance);
    const catchRate = clamp(sp.catch - (difficulty - 1) * 0.022 + tagMod.catch, 0.08, 0.9);
    return {
      id: 'op-' + uid(),
      location: location.name,
      flavor: location.flavor,
      tier,
      difficulty,
      security,
      target: sp.id,
      catchRate,
      credits,
      rep,
      heat,
      distance,
      tag,
      crewLine: pick([
        'A janitor left the side door propped open.',
        'Their night shift is one person and a radio.',
        'The target was seen near the loading bay.',
        'A storm is rolling in. Good cover.',
        'Someone sold us the patrol schedule. It looks real.',
        'The local police are busy with a much louder problem.'
      ])
    };
  }

  function finalMission() {
    return {
      id: 'final-op',
      final: true,
      location: 'Cerulean Cave',
      flavor: 'Deep water, older stone, and something that has been waiting for a challenger with worse intentions.',
      tier: 6,
      difficulty: 5,
      security: 5,
      target: 'mewtwo',
      catchRate: 0.10,
      credits: 9000,
      rep: 0,
      heat: 50,
      distance: 9,
      tag: { id: 'final', label: 'THE LAST JOB', tone: 'gold', desc: 'No backup. No second chances. Bring balls.' },
      crewLine: 'The cave is not on any map. That has never stopped you before.'
    };
  }

  function makeUniqueMission(state, existing) {
    let mission = makeMission(state);
    for (let i = 0; i < 12 && existing.some((m) => !m.final && m.target === mission.target); i++) {
      mission = makeMission(state);
    }
    return mission;
  }

  function fillBoard(state) {
    state.board = [];
    for (let i = 0; i < 3; i++) state.board.push(makeUniqueMission(state, state.board));
  }

  function ensureFinalMission(state) {
    const allExp = R.EXPANSIONS.every((e) => state.expansions[e.id]);
    if (allExp && !state.finalWon && !state.board.some((m) => m.final)) {
      state.board.unshift(finalMission());
    }
  }

  function replaceMission(state, mission) {
    if (mission && mission.final) return;
    const idx = state.board.findIndex((m) => m.id === mission.id);
    if (idx === -1) return;
    state.board[idx] = makeUniqueMission(state, state.board.filter((m) => m.id !== mission.id));
    ensureFinalMission(state);
  }

  function canPromote(state) {
    return state.rank < R.RANKS.length - 1 && state.rep >= R.RANKS[state.rank + 1].rep;
  }

  function promote(state) {
    if (!canPromote(state)) return null;
    const before = state.rank;
    state.rank += 1;
    const rank = R.RANKS[state.rank];
    state.creds += rank.reward;
    fillBoard(state);
    ensureFinalMission(state);
    const info = {
      rank: state.rank,
      name: rank.name,
      reward: rank.reward,
      color: rank.color,
      motto: rank.motto,
      boss: rank.name === 'Boss',
      previous: R.RANKS[before].name
    };
    state.lastPromotion = info;
    save();
    return info;
  }

  function buyFacility(state, id) {
    const f = R.FACILITIES.find((x) => x.id === id);
    if (!f) return { ok: false, msg: 'Unknown facility.' };
    if (state.rank < f.rank) return { ok: false, msg: `${f.name} unlocks at ${R.RANKS[f.rank].name}.` };
    const lvl = state.facilities[id] || 0;
    if (lvl >= facilityMax(state)) {
      return { ok: false, msg: expansionCount(state) < 3 ? 'Level cap reached. Buy a base expansion.' : 'Maximum level reached.' };
    }
    const cost = facilityCost(state, f);
    if (state.creds < cost) return { ok: false, msg: `Need ${R.money(cost - state.creds)} more.` };
    state.creds -= cost;
    state.facilities[id] = lvl + 1;
    save();
    return { ok: true, msg: `${f.name} upgraded to level ${lvl + 1}.`, level: lvl + 1 };
  }

  function buyExpansion(state, id) {
    const e = R.EXPANSIONS.find((x) => x.id === id);
    if (!e) return { ok: false, msg: 'Unknown expansion.' };
    if (state.rank < R.RANKS.length - 1) return { ok: false, msg: 'Only a Boss can expand the base.' };
    if (state.expansions[id]) return { ok: false, msg: 'Already built.' };
    if (state.creds < e.cost) return { ok: false, msg: `Need ${R.money(e.cost - state.creds)} more.` };
    state.creds -= e.cost;
    state.expansions[id] = true;
    const all = R.EXPANSIONS.every((x) => state.expansions[x.id]);
    ensureFinalMission(state);
    save();
    return { ok: true, msg: `${e.name} added to the base.`, all };
  }

  function layLow(state) {
    if (state.heat <= 0) return { ok: false, msg: 'Nobody is looking for you. Enjoy it.' };
    const cost = layLowCost(state);
    if (state.creds < cost) return { ok: false, msg: `Need ${R.money(cost - state.creds)} to pay off the street.` };
    state.creds -= cost;
    state.heat = clamp(state.heat - 28, 0, 100);
    state.day += 1;
    save();
    return { ok: true, msg: `Heat reduced by 28. A quiet day costs ${R.money(cost)}.` };
  }

  function buyBalls(state) {
    const cost = ballPackCost(state);
    if (state.creds < cost) return { ok: false, msg: `Need ${R.money(cost - state.creds)} for a pack.` };
    state.creds -= cost;
    state.balls += 5;
    save();
    return { ok: true, msg: '5 Rocket Balls added to your bag.' };
  }

  function rerollBoard(state) {
    const cost = rerollCost(state);
    if (state.creds < cost) return { ok: false, msg: `Need ${R.money(cost - state.creds)} to buy new intel.` };
    state.creds -= cost;
    const final = state.board.find((m) => m.final);
    state.board = [];
    for (let i = 0; i < 3; i++) state.board.push(makeUniqueMission(state, state.board));
    if (final && !state.finalWon) state.board.unshift(final);
    save();
    return { ok: true, msg: 'The board has been refreshed.' };
  }

  function setActive(state, uid) {
    if (!state.roster.some((m) => m.uid === uid)) return { ok: false, msg: 'That Pokémon is not in the base.' };
    state.activeId = uid;
    save();
    return { ok: true, msg: `${speciesOf(state.roster.find((m) => m.uid === uid)).name} is now your active partner.` };
  }

  function fenceMon(state, uid) {
    const mon = state.roster.find((m) => m.uid === uid);
    if (!mon) return { ok: false, msg: 'Not found.' };
    if (state.roster.length <= 1) return { ok: false, msg: 'You cannot fence your last Pokémon.' };
    const value = fenceValue(mon);
    state.roster = state.roster.filter((m) => m.uid !== uid);
    if (state.activeId === uid) state.activeId = state.roster[0].uid;
    state.creds += value;
    state.stats.earned += value;
    save();
    return { ok: true, msg: `${speciesOf(mon).name} fenced for ${R.money(value)}.`, value };
  }

  // ------------------------------------------------------------------ heist
  function captureChance(state, mission, partner, alert) {
    const sp = speciesOf(partner);
    const lab = state.facilities.lab || 0;
    let chance = mission.catchRate + sp.power * 0.022 + lab * 0.04;
    if (state.expansions.rooftop) chance += 0.05;
    chance -= alert * 0.0025;
    return clamp(chance, 0.06, 0.94);
  }

  function startHeist(state, missionId, partnerUid) {
    if (state.heat >= 100) return { ok: false, msg: 'Heat is maxed. Lay low before another job.' };
    const mission = state.board.find((m) => m.id === missionId);
    if (!mission) return { ok: false, msg: 'That operation is no longer on the board.' };
    if (partnerUid) state.activeId = partnerUid;
    const partner = activePartner(state);
    state.heist = {
      mission,
      partnerId: partner.uid,
      distance: mission.distance,
      startDistance: mission.distance,
      alert: 0,
      balls: state.balls,
      usedAbility: false,
      turn: 0,
      status: 'active',
      lastTone: '',
      log: [{
        text: `${partner ? speciesOf(partner).name : 'Your crew'} slips into ${mission.location}. ${mission.crewLine}`,
        tone: 'neutral'
      }]
    };
    save();
    return { ok: true };
  }

  function heistLog(h, text, tone) {
    h.log.unshift({ text, tone: tone || 'neutral' });
    if (h.log.length > 26) h.log.length = 26;
    h.lastTone = tone || 'neutral';
  }

  function afterAction(h, mission) {
    h.turn += 1;
    const drift = 1 + Math.floor(mission.security / 2);
    h.alert = clamp(h.alert + drift, 0, 100);
    if (h.alert >= 100) finishBust(h, mission);
  }

  function heistAction(state, kind) {
    const h = state.heist;
    if (!h || h.status !== 'active') return { ok: false };
    const mission = h.mission;
    const partner = state.roster.find((m) => m.uid === h.partnerId) || activePartner(state);
    const stats = partnerStats(partner, state);
    const sp = speciesOf(partner);
    const sec = mission.security;
    let consumeTurn = true;

    if (kind === 'sneak') {
      if (h.distance <= 0) {
        heistLog(h, 'The target is right there. Throw a ball.', 'warn');
        return { ok: false };
      }
      const gain = Math.round(Math.max(2, 8 + sec * 2 - stats.stealth * 1.6 + rand(-2, 3)));
      h.alert = clamp(h.alert + gain, 0, 100);
      h.distance = Math.max(0, h.distance - 1);
      heistLog(h, `Sneak. One room cleared. Suspicion +${gain}.`, 'good');
    } else if (kind === 'distract') {
      if (h.usedAbility) {
        heistLog(h, `${sp.name} has already used ${sp.ability} this job.`, 'warn');
        return { ok: false };
      }
      h.usedAbility = true;
      const drop = Math.round(12 + stats.charm * 2.5);
      h.alert = clamp(h.alert - drop, 0, 100);
      heistLog(h, `${sp.name} uses ${sp.ability}. Suspicion -${drop}.`, 'good');
    } else if (kind === 'hack') {
      if (h.distance <= 0) {
        heistLog(h, 'No cameras left to worry about. The target is in reach.', 'warn');
        return { ok: false };
      }
      const delta = Math.round(6 + sec * 1.2 - stats.tech * 2);
      h.alert = clamp(h.alert + delta, 0, 100);
      h.distance = Math.max(0, h.distance - 1);
      heistLog(h, delta <= 0
        ? `Hack. The feed loops cleanly. Suspicion ${delta}.`
        : `Hack. The system glitches. Suspicion +${delta}.`, delta <= 0 ? 'good' : 'neutral');
    } else if (kind === 'smash') {
      if (h.distance <= 0) {
        heistLog(h, 'Nothing between you and the target but air.', 'warn');
        return { ok: false };
      }
      const moved = Math.min(2, h.distance);
      const gain = Math.round(Math.max(5, 16 + sec * 2 - stats.muscle * 1.8 + rand(-2, 4)));
      h.alert = clamp(h.alert + gain, 0, 100);
      h.distance = Math.max(0, h.distance - moved);
      heistLog(h, `Smash through ${moved} rooms. Suspicion +${gain}.`, 'bad');
    } else if (kind === 'ball') {
      if (h.distance > 0) {
        heistLog(h, 'Not close enough to throw. Keep moving.', 'warn');
        return { ok: false };
      }
      if (h.balls <= 0) {
        heistLog(h, 'Your ball pouch is empty. Bail out or find another way.', 'bad');
        return { ok: false };
      }
      h.balls -= 1;
      state.balls = h.balls;
      const chance = captureChance(state, mission, partner, h.alert);
      const success = Math.random() < chance;
      consumeTurn = false;
      if (success) {
        heistLog(h, `Ball away. ${R.SPECIES[mission.target].name} is yours.`, 'capture');
        finishSuccess(h, mission, partner);
        return { ok: true, captured: true };
      }
      const noise = Math.round(10 + sec * 2);
      h.alert = clamp(h.alert + noise, 0, 100);
      heistLog(h, `The ball breaks open. It was a ${R.fmtPct(chance)} throw. Suspicion +${noise}.`, 'bad');
      if (h.alert >= 100) finishBust(h, mission);
      return { ok: true, captured: false };
    } else if (kind === 'bail') {
      return { ok: false, needsConfirm: true };
    } else {
      return { ok: false };
    }

    if (consumeTurn) afterAction(h, mission);
    save();
    return { ok: true };
  }

  function checkRaid(state, result) {
    if (state.heat < 100) return;
    const loss = round(state.creds * 0.2);
    state.creds = Math.max(0, state.creds - loss);
    state.heat = 55;
    state.stats.raids = (state.stats.raids || 0) + 1;
    result.raid = { loss };
    result.heatAfter = state.heat;
  }

  function finishSuccess(h, mission, partner) {
    const state = R.state;
    const sp = R.SPECIES[mission.target];
    const clean = h.alert <= 29;
    let credits = round(mission.credits * creditMult(state) * (clean ? 1.15 : 1));
    let rep = round(mission.rep * repMult(state) * (clean ? 1.2 : 1));
    const result = {
      kind: 'success',
      mission,
      partner,
      alert: h.alert,
      clean,
      credits,
      rep,
      captured: null,
      fenced: null,
      fencedValue: 0,
      raid: null,
      final: Boolean(mission.final)
    };

    if (mission.final) {
      const mon = makeMon('mewtwo', { caughtOn: state.day, trophy: true });
      state.roster.push(mon);
      state.activeId = mon.uid;
      state.finalWon = true;
      state.empire = true;
      result.captured = mon;
      result.victory = true;
      rep = 0;
      result.rep = 0;
    } else if (state.roster.length < capacity(state)) {
      const mon = makeMon(mission.target, { caughtOn: state.day });
      state.roster.push(mon);
      result.captured = mon;
      state.stats.captures += 1;
    } else {
      const mon = makeMon(mission.target, { caughtOn: state.day });
      const value = fenceValue(mon);
      credits += value;
      result.fenced = sp;
      result.fencedValue = value;
      state.stats.captures += 1;
    }

    let heat = mission.heat * heatMult(state) + h.alert * 0.12 - (state.facilities.bribe || 0) * 3;
    if (state.expansions.rooftop) heat -= 10;
    heat = round(Math.max(0, heat));

    state.creds += credits;
    state.rep += rep;
    state.heat = clamp(state.heat + heat, 0, 100);
    state.balls = h.balls;
    state.stats.heists += 1;
    state.stats.earned += credits;
    state.day += 1;
    h.status = 'won';

    result.credits = credits;
    result.rep = rep;
    result.heat = heat;
    checkRaid(state, result);
    result.promotion = canPromote(state);
    result.nextRank = R.RANKS[state.rank + 1] ? R.RANKS[state.rank + 1].name : '';

    if (mission.final) {
      state.board = state.board.filter((m) => !m.final);
    } else {
      replaceMission(state, mission);
    }
    state.heist = null;
    state.lastResult = result;
    save();
    return result;
  }

  function finishBust(h, mission) {
    const state = R.state;
    const partner = state.roster.find((m) => m.uid === h.partnerId) || activePartner(state);
    const loss = round(Math.min(state.creds * 0.15, 100 + mission.tier * 30));
    state.creds = Math.max(0, state.creds - loss);
    state.heat = clamp(state.heat + 20, 0, 100);
    state.balls = h.balls;
    state.stats.busts += 1;
    state.stats.heists += 1;
    state.day += 1;
    h.status = 'busted';
    h.alert = 100;

    const result = {
      kind: 'busted',
      mission,
      partner,
      alert: 100,
      loss,
      heat: 20,
      raid: null,
      final: Boolean(mission.final)
    };
    checkRaid(state, result);
    result.promotion = canPromote(state);
    result.nextRank = R.RANKS[state.rank + 1] ? R.RANKS[state.rank + 1].name : '';
    replaceMission(state, mission);
    state.heist = null;
    state.lastResult = result;
    save();
    return result;
  }

  function retreat(state) {
    const h = state.heist;
    if (!h || h.status !== 'active') return null;
    const mission = h.mission;
    const partner = state.roster.find((m) => m.uid === h.partnerId) || activePartner(state);
    const credits = round(mission.credits * 0.22 * creditMult(state));
    const rep = round(mission.rep * 0.12 * repMult(state));
    let heat = round(Math.max(0, mission.heat * 0.5 * heatMult(state) + h.alert * 0.08));
    state.creds += credits;
    state.rep += rep;
    state.heat = clamp(state.heat + heat, 0, 100);
    state.balls = h.balls;
    state.stats.heists += 1;
    state.stats.retreats += 1;
    state.day += 1;
    h.status = 'retreat';
    const result = {
      kind: 'retreat',
      mission,
      partner,
      credits,
      rep,
      heat,
      alert: h.alert,
      raid: null,
      final: Boolean(mission.final)
    };
    checkRaid(state, result);
    result.promotion = canPromote(state);
    result.nextRank = R.RANKS[state.rank + 1] ? R.RANKS[state.rank + 1].name : '';
    replaceMission(state, mission);
    state.heist = null;
    state.lastResult = result;
    save();
    return result;
  }

  R.game = {
    SAVE_KEY,
    clamp,
    makeMon,
    newGame,
    normalize,
    load,
    save,
    clearSave,
    speciesOf,
    activePartner,
    partnerStats,
    expansionCount,
    facilityMax,
    capacity,
    facilityCost,
    canBuyFacility,
    ballPackCost,
    layLowCost,
    rerollCost,
    fenceValue,
    creditMult,
    repMult,
    heatMult,
    makeMission,
    finalMission,
    fillBoard,
    ensureFinalMission,
    canPromote,
    promote,
    buyFacility,
    buyExpansion,
    layLow,
    buyBalls,
    rerollBoard,
    setActive,
    fenceMon,
    captureChance,
    startHeist,
    heistAction,
    retreat
  };
})();
