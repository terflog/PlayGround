const RANKS = [
  { name: 'GRUNT I', short: 'grunt', rep: 0, unlock: 'Your own Poké Ball stash' },
  { name: 'GRUNT II', short: 'grunt', rep: 80, unlock: 'A proper crew bunkroom' },
  { name: 'GRUNT III', short: 'grunt', rep: 200, unlock: 'The R&D workbench' },
  { name: 'FIELD AGENT', short: 'agent', rep: 380, unlock: 'A second hideout wing' },
  { name: 'EXECUTIVE', short: 'executive', rep: 650, unlock: 'The Boss’s private elevator' },
  { name: 'BOSS', short: 'boss', rep: 1000, unlock: 'Unlimited base expansion' }
];
const MISSIONS = [
  { id: 'meadow', name: 'Quiet in the Meadow', region: 'ROUTE 01', area: 'Verdant outskirts', desc: 'A skittish grass-type has been spotted by the old footpath.', emoji: '🌱', target: 'Spriglet', type: 'LEAF', risk: 'low', payout: 95, rep: 36, unlock: 0, scene: 'hills', detail: 'A shy little sprout with a brave heart. Likes warm windowsills.' },
  { id: 'shore', name: 'Low Tide, High Hopes', region: 'CERULEAN COAST', area: 'North tide pools', desc: 'Something splashy is playing far from the lifeguard station.', emoji: '🦭', target: 'Bubblit', type: 'TIDAL', risk: 'medium', payout: 130, rep: 48, unlock: 0, scene: 'water', detail: 'An aquatic daydreamer. It naps with one eye open.' },
  { id: 'orchard', name: 'Trouble at the Orchard', region: 'ROUTE 05', area: 'Redleaf orchard', desc: 'A tiny fire-type keeps setting off the orchard’s motion alarms.', emoji: '🦊', target: 'Emberfox', type: 'EMBER', risk: 'medium', payout: 155, rep: 52, unlock: 0, scene: 'hills', detail: 'A fox kit with a pocket-sized flame and a giant personality.' },
  { id: 'pines', name: 'The Midnight Rustle', region: 'VIRIDIAN WOODS', area: 'Pine-shadow trail', desc: 'A rare nocturnal critter is rummaging around the ranger’s camp.', emoji: '🦉', target: 'Noctowl', type: 'DUSK', risk: 'high', payout: 210, rep: 72, unlock: 1, scene: 'town', detail: 'A watchful night flyer. Absolutely not impressed by your disguises.' },
  { id: 'cliffs', name: 'Up on the Rooftops', region: 'PEWTER SECTOR', area: 'Slatewind cliffs', desc: 'A nimble electric-type has made the radio tower its new playground.', emoji: '🐈', target: 'Voltkit', type: 'SPARK', risk: 'high', payout: 255, rep: 88, unlock: 2, scene: 'factory', detail: 'A lightning-fast alley cat. The radio tower misses its fuse box.' },
  { id: 'factory', name: 'The Old Power Plant', region: 'POWER PLANT', area: 'Abandoned generator hall', desc: 'An unusually powerful creature is glowing in the control room.', emoji: '🐉', target: 'Draklet', type: 'DRAGON', risk: 'high', payout: 310, rep: 105, unlock: 3, scene: 'factory', detail: 'An ambitious little dragon with absolutely no respect for authority.' }
];
const UPGRADES = [
  { id: 'bunks', name: 'Crew Bunkroom', icon: '▤', cost: 180, rank: 0, desc: 'A bed beats the back of a van. Crew morale (and recovery) improves.', effect: 'Raises roster capacity to 5.', apply: s => { s.capacity = 5; } },
  { id: 'kit', name: 'Field Kit Locker', icon: '▣', cost: 280, rank: 1, desc: 'Fresh disguise kits, spare capsules, and a suspicious amount of rope.', effect: 'Better mission prep. +10% operation payout.', apply: s => { s.bonus = Math.max(s.bonus, .1); } },
  { id: 'lab', name: 'R&D Workbench', icon: '⌬', cost: 420, rank: 2, desc: 'A proper place to study what your new recruits can do.', effect: 'Improves field reports. +12 reputation per success.', apply: s => { s.repBonus = Math.max(s.repBonus, 12); } },
  { id: 'wing', name: 'Second Hideout Wing', icon: '⌂', cost: 680, rank: 3, desc: 'Extra bunks, a briefing room, and a door that actually locks.', effect: 'Raises roster capacity to 9.', apply: s => { s.capacity = 9; } },
  { id: 'lift', name: 'Boss’s Private Elevator', icon: '↟', cost: 920, rank: 4, desc: 'A very subtle elevator that goes to a very secret floor.', effect: 'Better intel. +15% operation payout.', apply: s => { s.bonus = Math.max(s.bonus, .25); } },
  { id: 'expansion', name: 'Expand the Compound', icon: '✦', cost: 1200, rank: 5, bossOnly: true, desc: 'You run the region now. Build a proper HQ — and keep building.', effect: 'Adds a new HQ level, room, and roster slots.', repeat: true, apply: s => { s.baseLevel++; s.capacity += 3; } },
  { id: 'training', name: 'Creature Training Yard', icon: '♧', cost: 1550, rank: 5, bossOnly: true, desc: 'A roomy, secure place for your partners to train and play.', effect: 'Adds an HQ wing and 3 creature beds.', repeat: true, apply: s => { s.baseLevel++; s.capacity += 3; } },
  { id: 'comms', name: 'Encrypted Comms Room', icon: '⌁', cost: 1900, rank: 5, bossOnly: true, desc: 'Intercept the whispers before they become wanted posters.', effect: 'Adds an HQ wing and 3 creature beds.', repeat: true, apply: s => { s.baseLevel++; s.capacity += 3; } }
];
const DEFAULT = { cash: 240, rep: 0, roster: [], upgrades: [], baseLevel: 1, capacity: 3, bonus: 0, repBonus: 0, sound: true, ops: 0, version: 1 };
let state = loadState();
let activeMission = null;
let encounter = null;
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('rocket-ops-save'));
    if (saved && saved.version === 1) return { ...DEFAULT, ...saved, roster: Array.isArray(saved.roster) ? saved.roster : [], upgrades: Array.isArray(saved.upgrades) ? saved.upgrades : [] };
  } catch (e) { console.warn('Save could not be read.', e); }
  return { ...DEFAULT, roster: [], upgrades: [] };
}
function save() { localStorage.setItem('rocket-ops-save', JSON.stringify(state)); }
function rankIndex(rep = state.rep) { for (let i = RANKS.length - 1; i >= 0; i--) if (rep >= RANKS[i].rep) return i; return 0; }
function currentRank() { return rankIndex(); }
function cashFormat(n) { return Math.floor(n).toLocaleString('en-US'); }
function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function render() { renderHeader(); renderMissions(); renderProgress(); renderHQ(); renderUpgrades(); renderRoster(); }
function renderHeader() {
  const rank = currentRank(), next = RANKS[rank + 1];
  document.getElementById('money').textContent = cashFormat(state.cash);
  document.getElementById('rep').textContent = cashFormat(state.rep);
  document.getElementById('profile-rank').textContent = RANKS[rank].name;
  document.getElementById('greeting-rank').textContent = RANKS[rank].short;
  document.getElementById('rank-name').textContent = RANKS[rank].name;
  const start = RANKS[rank].rep, end = next ? next.rep : start + 1;
  const progress = next ? Math.max(0, Math.min(100, (state.rep - start) / (end - start) * 100)) : 100;
  document.getElementById('rank-progress-bar').style.width = progress + '%';
  document.getElementById('rank-progress-text').textContent = next ? `${state.rep - start} / ${end - start} REP` : 'MAX RANK REACHED';
  document.getElementById('next-rank-label').textContent = next ? `NEXT: ${next.name}` : 'TEAM ROCKET';
  document.getElementById('nav-upgrades').textContent = state.upgrades.length;
  document.getElementById('nav-roster').textContent = state.roster.length;
  document.getElementById('sound-toggle').textContent = state.sound ? '♫' : '♪';
  document.querySelectorAll('.money-inline').forEach(el => el.textContent = cashFormat(state.cash));
}
function renderMissions() {
  const rank = currentRank();
  document.getElementById('mission-grid').innerHTML = MISSIONS.map((m,i) => {
    const unlocked = rank >= m.unlock;
    return `<article class="mission-card"><div class="mission-art"><span class="art-tag">${m.region}</span><span class="art-number">0${i+1}</span><div class="art-scene"><span class="scene-sun"></span><span class="scene-tree"></span><span class="scene-town"></span><span class="scene-factory"></span><span class="scene-hills"></span>${m.scene === 'water' ? '<span class="scene-water"><span class="scene-hills"></span></span>' : ''}</div></div><div class="mission-info"><div class="mission-name-row"><span class="mission-name">${m.name}</span><span class="risk ${m.risk}">${m.risk.toUpperCase()} RISK</span></div><p class="mission-desc">${m.desc}</p><div class="mission-footer"><div class="rewards"><span class="reward-cash">₽ ${m.payout}</span><span>✳ ${m.rep} REP</span></div><button class="mission-launch ${unlocked?'':'locked'}" data-mission="${m.id}" ${unlocked?'':'disabled'}>${unlocked?'BRIEFING ↗':`RANK ${RANKS[m.unlock].name}`}</button></div></div></article>`;
  }).join('');
  document.querySelectorAll('[data-mission]').forEach(btn => btn.addEventListener('click', () => beginMission(btn.dataset.mission)));
}
function renderProgress() {
  const index = currentRank(), max = RANKS.length - 1;
  document.querySelector('.climb-track').style.setProperty('--climb-progress', `${index / max * 100}%`);
  document.getElementById('climb-track').innerHTML = RANKS.map((r,i) => `<div class="rank-node ${i<index?'done':''} ${i===index?'current':''}"><i>${i<index?'✓':i===index?'★':''}</i><span>${r.name.replace('FIELD ','')}</span></div>`).join('');
  const next = RANKS[index + 1];
  document.getElementById('next-unlock').innerHTML = next ? `<span class="unlock-icon">✦</span><span>Next unlock: <b>${next.unlock}</b></span><strong>${next.rep - state.rep} REP TO GO</strong>` : `<span class="unlock-icon">★</span><span><b>Boss rank achieved.</b> The compound is yours to shape.</span><strong>MAX RANK</strong>`;
}
function hqName() { return state.baseLevel === 1 ? 'The Old Storehouse' : state.baseLevel === 2 ? 'The Rocket Annex' : state.baseLevel === 3 ? 'The Underground HQ' : `Rocket Compound · Wing ${state.baseLevel - 2}`; }
function renderHQ() {
  const name = hqName(), rank = currentRank();
  document.getElementById('hq-level').textContent = `LEVEL ${String(state.baseLevel).padStart(2,'0')}`;
  document.getElementById('hq-name').textContent = name;
  document.getElementById('scene-hq-name').textContent = name.toUpperCase();
  document.getElementById('hq-description').textContent = state.baseLevel === 1 ? 'A modest start. Every empire has one.' : state.baseLevel === 2 ? 'A second door, now with actual locks.' : 'The regional operation runs from here.';
  document.getElementById('hq-slots').textContent = '▰ '.repeat(Math.min(state.capacity,12)).trim() + (state.capacity < 9 ? ' ▱'.repeat(9-state.capacity) : '');
  document.getElementById('base-level-big').textContent = String(state.baseLevel).padStart(2,'0');
  document.getElementById('base-rank-req').textContent = rank === 5 ? 'BOSS · COMPOUND UNLOCKED' : 'CURRENT HEADQUARTERS';
  document.getElementById('scene-upgrade-count').textContent = state.upgrades.length;
  document.getElementById('camouflage').textContent = ['D','C','B','A','A+'][Math.min(4,state.upgrades.length)];
  document.getElementById('scene-next').textContent = rank === 5 ? 'BOSS AUTHORITY · EXPAND ↗' : `RANK UP TO ${rank < 3 ? 'EXPAND' : 'UNLOCK BOSS EXPANSION'} ↗`;
}
function renderUpgrades() {
  const rank = currentRank();
  document.getElementById('upgrade-grid').innerHTML = UPGRADES.map(u => {
    const bought = !u.repeat && state.upgrades.includes(u.id);
    const unlocked = rank >= u.rank && (!u.bossOnly || rank === 5);
    const affordable = state.cash >= u.cost;
    const level = u.repeat ? state.upgrades.filter(id => id === u.id).length : bought ? 1 : 0;
    const status = bought ? 'INSTALLED' : !unlocked ? (u.bossOnly ? 'BOSS RANK' : `${RANKS[u.rank].name} REQUIRED`) : `₽ ${cashFormat(u.cost)}`;
    return `<article class="upgrade-card ${unlocked?'':'locked-card'}"><div class="upgrade-card-top"><span class="upgrade-icon">${u.icon}</span><div><h3>${u.name}${u.repeat && level ? ` · ${level+1}` : ''}</h3><span class="upgrade-level">${bought?'INSTALLED':u.repeat && level?'LEVEL '+(level+1):u.bossOnly?'COMPOUND UPGRADE':'AVAILABLE UPGRADE'}</span></div></div><p>${u.desc}</p><div class="upgrade-card-foot"><span class="upgrade-unlock">${status}</span><button class="buy-button" data-upgrade="${u.id}" ${!unlocked||bought||!affordable?'disabled':''}>${bought?'✓ DONE':!unlocked?'LOCKED':!affordable?'NEED FUNDS':'INSTALL'}</button></div></article>`;
  }).join('');
  document.querySelectorAll('[data-upgrade]').forEach(btn => btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgrade)));
}
function renderRoster() {
  const count = state.roster.length;
  document.getElementById('roster-total').textContent = String(count).padStart(2,'0');
  document.getElementById('roster-count-label').textContent = `${count} CREATURE${count===1?'':'S'}`;
  document.getElementById('roster-capacity').textContent = `${count} / ${state.capacity} SLOTS`;
  document.getElementById('roster-summary-text').textContent = count ? `${count} new friend${count===1?'':'s'} in the hideout. They're growing on us.` : 'No assets on record yet.';
  const grid = document.getElementById('roster-grid');
  if (!count) { grid.innerHTML = `<div class="empty-roster"><div class="empty-icon">♧</div><h3>Room for a few good friends.</h3><p>Run a field operation to meet your first companion.</p><button data-goto="operations">FIND AN OPERATION ↗</button></div>`; grid.querySelector('[data-goto]').addEventListener('click', () => setView('operations')); return; }
  grid.innerHTML = state.roster.map((c,i) => `<article class="creature-card"><div class="creature-art"><span class="creature-type">${c.type}</span><span class="creature-index">№ ${String(i+1).padStart(3,'0')}</span><span class="creature-emoji">${c.emoji}</span></div><div class="creature-details"><div><h3>${escapeHTML(c.name)}</h3><span class="creature-mood">✦</span></div><p>${escapeHTML(c.detail)}</p><div class="creature-stats"><span>RECRUITED <b>${escapeHTML(c.date)}</b></span><span>FRIENDSHIP <b>NEW</b></span></div></div></article>`).join('');
}
function beginMission(id) {
  const mission = MISSIONS.find(m => m.id === id); if (!mission || currentRank() < mission.unlock) return;
  activeMission = mission;
  encounter = { capture: 0, alert: 0, turns: 0, result: null };
  showModal(`<div class="modal-head"><div><div class="modal-kicker">FIELD BRIEFING · ${mission.region}</div><h2 id="modal-title">${mission.name}</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"><div class="mission-brief"><div class="brief-creature">${mission.emoji}</div><div><b>${mission.target} · ${mission.type}</b><p>${mission.area} · ${mission.risk.toUpperCase()} RISK</p></div></div><div class="encounter-bar-row"><span>CAPSULE LOCK</span><b id="capture-value">0%</b></div><div class="encounter-bar"><span id="capture-bar" style="width:0%"></span></div><div class="encounter-bar-row"><span>CREATURE ALERT</span><b id="alert-value">0%</b></div><div class="encounter-bar red"><span id="alert-bar" style="width:0%"></span></div><div class="encounter-log" id="encounter-log">${mission.target} hasn’t noticed you yet. Pick an approach.</div><div class="action-grid"><button class="action-button" data-action="sneak"><span class="action-emoji">🥷</span><b>Sneak closer</b><span>STEADY · LOW ALERT</span></button><button class="action-button" data-action="bait"><span class="action-emoji">🍓</span><b>Offer a treat</b><span>QUICK · MEDIUM ALERT</span></button><button class="action-button" data-action="capsule"><span class="action-emoji">🔴</span><b>Toss a capsule</b><span>FAST · NEED 65% LOCK</span></button></div><div class="modal-tip">TIP: A distracted target is easier to catch. Four moves before they bolt.</div></div>`);
  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => takeAction(btn.dataset.action)));
}
function takeAction(action) {
  if (!encounter || encounter.result) return;
  const e = encounter, m = activeMission;
  const log = document.getElementById('encounter-log');
  e.turns++;
  let message = '';
  if (action === 'sneak') { e.capture += 23; e.alert += m.risk === 'high' ? 8 : 4; message = `You inch through the grass. ${m.target} glances over, but stays put.`; }
  if (action === 'bait') { e.capture += 35; e.alert += m.risk === 'high' ? 21 : 15; message = `${m.target} is very interested in the treat. Your teammate inches closer.`; }
  if (action === 'capsule') {
    if (e.capture < 65) { e.alert += 28; message = `The capsule bounces off a rock. ${m.target} is startled! Build a better lock first.`; }
    else if (e.alert >= 82) { e.alert = Math.min(100,e.alert + 10); message = `${m.target} dodges the capsule at the last second. One more careful move?`; }
    else { e.capture = 100; message = `Direct hit! The capsule wiggles once... twice... click! ${m.target} is on the team.`; e.result = 'win'; }
  }
  e.capture = Math.min(100,e.capture); e.alert = Math.min(100,e.alert);
  if (e.alert >= 100) { e.result = 'fail'; message = `${m.target} slipped away in the commotion. The crew is already scouting the next lead.`; }
  else if (e.turns >= 5 && !e.result) { e.result = 'fail'; message = `${m.target} got wise and made a run for it. We’ll get them next time.`; }
  log.textContent = message;
  document.getElementById('capture-value').textContent = `${e.capture}%`;
  document.getElementById('capture-bar').style.width = `${e.capture}%`;
  document.getElementById('alert-value').textContent = `${e.alert}%`;
  document.getElementById('alert-bar').style.width = `${e.alert}%`;
  if (e.result) {
    document.querySelectorAll('[data-action]').forEach(b => b.disabled = true);
    window.setTimeout(() => finishMission(e.result), 850);
  } else {
    document.querySelector('[data-action="capsule"]').disabled = e.capture < 65;
  }
}
function finishMission(result) {
  const m = activeMission;
  if (result === 'win') {
    const cash = Math.round(m.payout * (1 + state.bonus));
    const rep = m.rep + state.repBonus;
    state.cash += cash; state.rep += rep; state.ops++;
    const already = state.roster.some(c => c.id === m.id);
    if (!already && state.roster.length < state.capacity) state.roster.unshift({ id:m.id, name:m.target, type:m.type, emoji:m.emoji, detail:m.detail, date:`OP ${String(state.ops).padStart(2,'0')}` });
    else if (!already) state.roster.unshift({ id:m.id, name:m.target, type:m.type, emoji:m.emoji, detail:m.detail, date:`OP ${String(state.ops).padStart(2,'0')}` });
    const oldRank = currentRank(); save(); render();
    const newRank = currentRank();
    const duplicate = already ? `${m.target} was already in your roster, but the operation still paid off.` : state.roster.length > state.capacity ? `${m.target} joined the team. Capacity’s tight — get a bigger bunkroom!` : `${m.target} is settling into the hideout. It seems to like the old storehouse.`;
    const rankUp = newRank > oldRank;
    const promotion = rankUp ? `<div class="boss-unlock">✦ PROMOTION: <b>${RANKS[newRank].name}</b> — ${newRank === 5 ? 'Boss rank achieved! Base expansion is now unlocked.' : `New access: ${RANKS[newRank].unlock}.`}</div>` : '';
    showModal(`<div class="modal-head"><div><div class="modal-kicker">OPERATION COMPLETE · ${m.region}</div><h2 id="modal-title">A new friend.</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"><div class="result-wrap"><div class="result-icon">✓</div><h3>Nice work, Rocket.</h3><p>${duplicate}</p><div class="result-rewards"><span>+ ₽ ${cashFormat(cash)}</span><span>+ ✳ ${rep} REP</span></div>${promotion}<button class="primary-button" data-finish>BACK TO HQ ↗</button></div></div>`);
    document.querySelector('[data-finish]').addEventListener('click', () => closeModal());
  } else {
    state.cash = Math.max(0,state.cash - 10); save(); render();
    showModal(`<div class="modal-head"><div><div class="modal-kicker">OPERATION ENDED · ${m.region}</div><h2 id="modal-title">They got away.</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"><div class="result-wrap"><div class="result-icon fail">↗</div><h3>Not every plan works.</h3><p>We lost ₽ 10 replacing the damaged equipment. The crew’s already back at the drawing board.</p><div class="result-rewards"><span>BETTER LUCK NEXT TIME</span></div><button class="primary-button" data-finish>BACK TO HQ ↗</button></div></div>`);
    document.querySelector('[data-finish]').addEventListener('click', () => closeModal());
  }
}
function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id); if (!u) return;
  const level = state.upgrades.filter(x => x === id).length;
  if (currentRank() < u.rank || u.bossOnly && currentRank() !== 5 || !u.repeat && state.upgrades.includes(id) || state.cash < u.cost) return;
  const priorRank = currentRank(); state.cash -= u.cost; state.upgrades.push(id); u.apply(state); save(); render();
  showModal(`<div class="modal-head"><div><div class="modal-kicker">HEADQUARTERS · INSTALLATION COMPLETE</div><h2 id="modal-title">${u.name} installed.</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"><div class="result-wrap"><div class="upgrade-modal-icon">${u.icon}</div><h3>${u.repeat?'A bigger, better HQ.':'The operation grows.'}</h3><p>${u.effect}</p><div class="result-rewards"><span>HIDEOUT LEVEL ${String(state.baseLevel).padStart(2,'0')}</span><span>${state.capacity} CREATURE BEDS</span></div>${priorRank === 5 ? `<div class="boss-unlock">As boss, the compound is yours to keep expanding. Every new wing adds more creature beds.</div>` : ''}<button class="primary-button" data-finish>BACK TO HQ ↗</button></div></div>`);
  document.querySelector('[data-finish]').addEventListener('click', closeModal);
}
function showModal(html) {
  const back = document.getElementById('modal-backdrop'); document.getElementById('modal').innerHTML = html; back.classList.add('open'); back.setAttribute('aria-hidden','false');
  const close = document.querySelector('.modal-close'); if (close) close.addEventListener('click', closeModal);
  back.onclick = e => { if (e.target === back && !encounter) closeModal(); };
}
function closeModal() { document.getElementById('modal-backdrop').classList.remove('open'); document.getElementById('modal-backdrop').setAttribute('aria-hidden','true'); encounter = null; activeMission = null; }
function buySound() { state.sound = !state.sound; save(); renderHeader(); }
function setView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `${name}-view`));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const labels = { operations:'OPERATIONS', hideout:'HIDEOUT', roster:'ROSTER' };
  document.getElementById('breadcrumb-view').textContent = labels[name] || 'OPERATIONS';
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.goto)));
document.getElementById('sound-toggle').addEventListener('click', buySound);
document.getElementById('profile-button').addEventListener('click', () => showModal(`<div class="modal-head"><div><div class="modal-kicker">FIELD DIVISION · OPERATIVE FILE</div><h2 id="modal-title">${RANKS[currentRank()].name}</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"><p style="color:#7d887e;line-height:1.6;font-size:12px">You’re a Team Rocket field operative with a talent for creative problem-solving and an increasingly crowded hideout. Earn reputation to climb the ranks, unlock base upgrades, and eventually take the whole compound in hand.</p><div class="result-rewards"><span>${state.ops} OPERATIONS</span><span>${state.roster.length} COMPANIONS</span></div></div>`));
document.getElementById('reset-button').addEventListener('click', () => showModal(`<div class="modal-head"><div><div class="modal-kicker">FIELD DIVISION · CAUTION</div><h2 id="modal-title">Start from scratch?</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"><p style="color:#7d887e;line-height:1.6;font-size:12px">This permanently clears your local save, rank, upgrades, and roster.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="modal-close" style="width:auto;padding:0 12px">CANCEL</button><button class="primary-button" id="confirm-reset" style="background:#bb5d4b">RESET GAME</button></div></div>`));
document.addEventListener('click', e => {
  if (e.target.id === 'confirm-reset') { localStorage.removeItem('rocket-ops-save'); state = { ...DEFAULT, roster:[], upgrades:[] }; save(); render(); closeModal(); setView('operations'); showToast('Fresh start. The region awaits.'); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !encounter) closeModal(); });
function showToast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }
render();
