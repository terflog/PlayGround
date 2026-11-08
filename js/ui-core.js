(function () {
  const R = window.REDLINE;
  const G = R.game;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const ui = {
    tab: 'base',
    prepMission: null,
    prepPartner: null,
    modalOpen: false,
    resultOpen: false,
    started: false,
    lastActionAt: 0
  };
  R.ui = ui;

  // ------------------------------------------------------------------ icons
  const ICONS = {
    home: '<path d="M3 11.2 12 4l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c.4-3.2 2.8-5.2 6.2-5.2s5.8 2 6.2 5.2"/><path d="M16 5.4a3 3 0 0 1 0 5.6M17.5 15.1c2.2.5 3.5 2.2 3.7 4.9"/>',
    box: '<path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
    dumbbell: '<path d="M6 8v8M2 10v4M18 8v8M22 10v4M6 12h12"/>',
    flask: '<path d="M9 3h6M10 3v6L5 20h14L14 9V3"/><path d="M7.3 15h9.4"/>',
    car: '<path d="M5 15.5l1.2-5 2-3h7.6l2 3 1.2 5"/><path d="M3 15.5h18v4H3z"/><circle cx="7" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/><path d="M12 10V3"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v6M18 9v6"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><circle cx="12" cy="12" r="3"/>',
    flame: '<path d="M12 22c4.2 0 7-3 7-7 0-3.2-2-6.2-4.3-8.4.1 3.1-1.9 4.4-3 5.3-.6-4-2.7-6.6-5-8.9 1.1 4.3-1.7 6.6-1.7 12 0 4 3 7 7 7Z"/><path d="M12 19c1.6 0 2.7-1.2 2.7-2.8 0-1.5-1.1-2.7-2.2-3.7-.1 1.4-1.2 2.1-1.7 2.9-.4 1.7.3 3.6 1.2 3.6Z"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z"/>',
    skull: '<path d="M12 2a8 8 0 0 0-8 8c0 3 2 5 4 6v3h8v-3c2-1 4-3 4-6a8 8 0 0 0-8-8Z"/><circle cx="9" cy="10" r="1.4"/><circle cx="15" cy="10" r="1.4"/><path d="M10 15h4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M5 13l4 4L19 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4 2.3c-.9.6-1.5 1.1-1.5 2.2"/><path d="M12 17h.01"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a4.2 4.2 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    vault: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/>',
    tower: '<path d="M7 21V9l5-6 5 6v12M10 21v-7h4v7"/><path d="M12 3v3M4 21h16"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    footprints: '<path d="M8 4c1.7 0 3 1.6 3 3.7 0 1.5-.6 2.5-.6 4.1 0 1.5.6 2.2.6 3.7 0 1.7-1.3 3-3 3s-3-1.3-3-3c0-1.5.6-2.2.6-3.7 0-1.6-.6-2.6-.6-4.1C5 5.6 6.3 4 8 4Z"/><path d="M17 10c1.4 0 2.5 1.3 2.5 3 0 1.2-.5 2-.5 3.3 0 1.2.5 1.8.5 3 0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5c0-1.2.5-1.8.5-3 0-1.3-.5-2.1-.5-3.3 0-1.7 1.1-3 2.5-3Z"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="10" y="10" width="4" height="4"/>',
    spark: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/>',
    fist: '<path d="M6 11V7.5a2 2 0 0 1 4 0V11m0-4.5a2 2 0 0 1 4 0V11m0-3.5a2 2 0 0 1 4 0V11m0-2.5a2 2 0 0 1 4 0V15c0 4-2.5 6-6 6h-2c-3.8 0-6-2.2-6-6v-3a2 2 0 0 1 4 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>'
  };

  function icon(name, size = 18, cls = '') {
    const body = ICONS[name] || ICONS.star;
    return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  // ------------------------------------------------------------------ sound
  let audioCtx = null;
  const SOUNDS = {
    click: [[240, 0.035, 'triangle', 0.016]],
    good: [[420, 0.06, 'triangle', 0.02], [620, 0.08, 'triangle', 0.018]],
    bad: [[150, 0.1, 'sawtooth', 0.022], [110, 0.16, 'sawtooth', 0.018]],
    capture: [[523, 0.07, 'triangle', 0.025], [659, 0.07, 'triangle', 0.025], [784, 0.13, 'triangle', 0.025]],
    promote: [[392, 0.09, 'triangle', 0.025], [523, 0.09, 'triangle', 0.025], [659, 0.09, 'triangle', 0.025], [1046, 0.2, 'triangle', 0.022]],
    start: [[196, 0.12, 'sawtooth', 0.02], [294, 0.16, 'triangle', 0.02]],
    alarm: [[740, 0.08, 'square', 0.02], [560, 0.08, 'square', 0.02], [740, 0.12, 'square', 0.02]]
  };

  function sound(name) {
    if (!R.state || !R.state.sound) return;
    const pattern = SOUNDS[name];
    if (!pattern) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      let t = audioCtx.currentTime;
      for (const [freq, dur, type, gain] of pattern) {
        const osc = audioCtx.createOscillator();
        const amp = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        amp.gain.setValueAtTime(0.0001, t);
        amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
        amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(amp).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
        t += dur * 0.78;
      }
    } catch (err) { /* audio is a bonus, not a requirement */ }
  }

  // ------------------------------------------------------------------ toasts
  function toast(message, tone = 'info') {
    const root = document.getElementById('toast-root');
    if (!root) return;
    while (root.children.length >= 3) root.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = `toast toast--${tone}`;
    el.innerHTML = `<span class="toast-mark"></span><span class="toast-text">${esc(message)}</span>`;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    setTimeout(() => {
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), 240);
    }, 3400);
  }

  // ------------------------------------------------------------------ modals
  function openModal(html, cls = '') {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop" data-close="1">
      <div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>
    </div>`;
    ui.modalOpen = true;
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    ui.modalOpen = false;
    document.body.classList.remove('modal-open');
  }

  function modalShell(kicker, title, body, options = {}) {
    return `<div class="modal-head">
      <div>
        <div class="eyebrow ${options.gold ? 'eyebrow--gold' : ''}">${esc(kicker)}</div>
        <h2 class="modal-title">${title}</h2>
      </div>
      <button class="icon-btn modal-x" data-action="close-modal" aria-label="Close">${icon('x', 18)}</button>
    </div>
    <div class="modal-body">${body}</div>`;
  }

  // ------------------------------------------------------------- shared bits
  function nextRank(state) { return R.RANKS[state.rank + 1] || null; }

  function rankProgress(state) {
    const cur = R.RANKS[state.rank];
    const next = nextRank(state);
    if (!next) return { pct: 100, label: 'TOP RANK', cur, next: null };
    const pct = Math.max(0, Math.min(100, ((state.rep - cur.rep) / (next.rep - cur.rep)) * 100));
    return { pct, label: `${state.rep} / ${next.rep} REP`, cur, next };
  }

  function typeBadge(sp) {
    return `<span class="type-badge" style="--tc:${R.typeColor(sp)}"><i></i>${esc(sp.type)}</span>`;
  }

  function pips(level, max, cls = '') {
    let out = '';
    for (let i = 0; i < max; i++) out += `<span class="pip ${i < level ? 'is-on' : ''}"></span>`;
    return `<span class="pips ${cls}" aria-label="${level} of ${max}">${out}</span>`;
  }

  function meter(value, cls = '') {
    const v = Math.max(0, Math.min(100, value));
    return `<span class="meter ${cls}"><span class="meter-fill" style="width:${v}%"></span></span>`;
  }

  function heatClass(heat) {
    return heat >= 85 ? 'is-critical' : heat >= 65 ? 'is-hot' : heat >= 35 ? 'is-warm' : 'is-cool';
  }

  function rewardChip(ic, label, value, cls = '') {
    return `<span class="reward-chip ${cls}">${icon(ic, 14)}<span><em>${esc(label)}</em><strong>${value}</strong></span></span>`;
  }

  // ------------------------------------------------------------- base diorama
  function baseArt(state) {
    const rank = R.RANKS[state.rank];
    const totalLevels = Object.values(state.facilities).reduce((a, b) => a + b, 0);
    const winCount = Math.min(24, 3 + totalLevels * 2);
    let wins = '';
    let i = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        wins += `<rect class="win ${i < winCount ? 'is-lit' : ''}" x="${354 + c * 50}" y="${116 + r * 27}" width="18" height="11" rx="1"/>`;
        i++;
      }
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        wins += `<rect class="win ${i < winCount ? 'is-lit' : ''}" x="${264 + c * 32}" y="${154 + r * 20}" width="13" height="8" rx="1"/>`;
        i++;
      }
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        wins += `<rect class="win ${i < winCount ? 'is-lit' : ''}" x="${580 + c * 26}" y="${160 + r * 18}" width="12" height="8" rx="1"/>`;
        i++;
      }
    }
    const boss = state.rank >= R.RANKS.length - 1;
    const ex = state.expansions;
    const east = ex.east
      ? `<path d="M640 205V126l80-24v103Z" fill="#151a21" stroke="#3a414d" stroke-width="1.5"/>
         <rect x="658" y="140" width="16" height="10" rx="1" class="win is-lit"/>
         <rect x="686" y="134" width="16" height="10" rx="1" class="win is-lit"/>
         <rect x="658" y="160" width="16" height="10" rx="1" class="win is-lit"/>
         <rect x="686" y="154" width="16" height="10" rx="1" class="win is-lit"/>
         <path d="M700 205v-58" stroke="#e44343" stroke-width="2" opacity=".7"/>`
      : boss ? `<path d="M640 205V126l80-24v103Z" fill="none" stroke="#e44343" stroke-width="1.4" stroke-dasharray="5 7" opacity=".35">
         <animate attributeName="opacity" values=".2;.55;.2" dur="3.4s" repeatCount="indefinite"/></path>` : '';
    const rooftop = ex.rooftop
      ? `<rect x="382" y="53" width="136" height="9" rx="2" fill="#202630" stroke="#59616e"/>
         <path d="M450 53V20" stroke="#59616e" stroke-width="2"/>
         <circle cx="450" cy="19" r="4" class="beacon"/>
         <path d="M397 53v-8h18v8M485 53v-8h18v8" fill="#151a21" stroke="#3a414d"/>
         <path d="M410 45h-30M490 45h30" stroke="#e44343" stroke-width="1.5" opacity=".5"/>`
      : boss ? `<rect x="382" y="53" width="136" height="9" rx="2" fill="none" stroke="#e44343" stroke-dasharray="5 7" opacity=".35"/>` : '';
    const vault = ex.vault
      ? `<rect x="388" y="214" width="132" height="34" rx="4" fill="#151a21" stroke="#f0c75e" stroke-width="1.4"/>
         <rect x="400" y="224" width="44" height="13" rx="2" fill="#f0c75e" opacity=".22"/>
         <rect x="452" y="224" width="56" height="13" rx="2" fill="#f0c75e" opacity=".14"/>
         <circle cx="510" cy="231" r="4" fill="#f0c75e" opacity=".8"/>
         <path d="M420 240v-16M432 240v-16M444 240v-16M456 240v-16" stroke="#f0c75e" stroke-width="1" opacity=".25"/>`
      : boss ? `<rect x="388" y="214" width="132" height="34" rx="4" fill="none" stroke="#f0c75e" stroke-dasharray="5 7" opacity=".3"/>` : '';
    const alarm = state.heat >= 75 ? `<path d="M0 26 900 70M0 60 900 110" stroke="#e44343" stroke-width="1.2" opacity=".18"/>` : '';
    return `<svg class="base-svg" viewBox="0 0 900 260" role="img" aria-label="A drawing of the Redline base, rank ${esc(rank.name)}">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0b0e14"/><stop offset="1" stop-color="#07080b"/>
        </linearGradient>
        <radialGradient id="cityGlow" cx="50%" cy="100%" r="70%">
          <stop offset="0" stop-color="#e44343" stop-opacity=".24"/><stop offset="1" stop-color="#e44343" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e44343" stop-opacity=".22"/><stop offset="1" stop-color="#e44343" stop-opacity="0"/>
        </linearGradient>
        <pattern id="gridPat" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#252b35" stroke-width=".6"/>
        </pattern>
      </defs>
      <rect width="900" height="260" fill="url(#skyGrad)"/>
      <rect width="900" height="260" fill="url(#gridPat)" opacity=".65"/>
      <circle cx="736" cy="48" r="21" fill="#f0c75e" opacity=".09"/>
      <circle cx="736" cy="48" r="11" fill="#f0c75e" opacity=".2"/>
      <path d="M0 205V171h34v-26h27v32h31v-44h29v27h27v-22h31v39h28v-18h33v-31h28v45h30v-24h34v33h29v-40h31v36h27v-29h30v40h33v-16h36v28h34v-25h31v42h29v-18h36v31h38v-22h35v45h31v-27h30v17h29v-35h29v55Z" fill="#0b0e12"/>
      <path d="M0 205V188h900v17Z" fill="#0a0c10"/>
      <ellipse cx="450" cy="208" rx="390" ry="34" fill="url(#cityGlow)"/>
      <path d="M450 30 260 205h380Z" fill="url(#beamGrad)" opacity=".45"/>
      ${alarm}
      <path d="M214 205v-82l108-24v106Z" fill="#12161c" stroke="#2e343d" stroke-width="1.4"/>
      <path d="M214 123l108-24v10l-108 24Z" fill="#1b2028"/>
      <path d="M322 205V95l128-33 128 33v110Z" fill="#171c24" stroke="#353c47" stroke-width="1.6"/>
      <path d="M322 95l128-33 128 33-20 8-108-27-108 27Z" fill="#232934"/>
      <path d="M450 62v143M322 121h256" stroke="#242a33" stroke-width="1"/>
      <path d="M570 205v-70l82-23v93Z" fill="#12161c" stroke="#2e343d" stroke-width="1.4"/>
      <path d="M570 135l82-23v10l-82 23Z" fill="#1b2028"/>
      ${east}
      ${rooftop}
      ${vault}
      <rect x="300" y="197" width="286" height="8" fill="#1d232c"/>
      <path d="M300 197h286" stroke="#e44343" stroke-width="1.5" opacity=".55"/>
      <path d="M322 197h26M374 197h26M426 197h26M478 197h26M530 197h26" stroke="#080a0d" stroke-width="6"/>
      <rect x="480" y="104" width="142" height="58" fill="none" stroke="#262d37" stroke-width="1"/>
      <rect x="417" y="78" width="66" height="36" rx="2" fill="#0a0c10" stroke="#e44343" stroke-width="1.8"/>
      <text x="450" y="103" text-anchor="middle" class="svg-r">R</text>
      <circle cx="450" cy="74" r="2.4" class="beacon"/>
      ${wins}
      <rect x="440" y="176" width="22" height="29" fill="#0a0c10" stroke="#3b424e"/>
      <rect x="443" y="179" width="16" height="26" fill="#e44343" opacity=".16"/>
      <circle cx="468" cy="192" r="2" fill="#f0c75e" opacity=".8"/>
      <path d="M714 205v-36M700 169h28l-4 -8h-20Z" fill="none" stroke="#4b525e" stroke-width="1.4"/>
      <circle cx="714" cy="164" r="3" fill="#f0c75e" opacity=".65"/>
      <text x="32" y="38" class="svg-kicker">REDLINE BASE // ${esc(rank.name.toUpperCase())}</text>
      <text x="32" y="56" class="svg-sub">DAY ${state.day} · HEAT ${Math.round(state.heat)}% · ${R.EXPANSIONS.every((e) => state.expansions[e.id]) ? 'FULL EXPANSION' : 'BASE EXPANSION ' + G.expansionCount(state) + '/3'}</text>
      <text x="868" y="38" text-anchor="end" class="svg-kicker">CREW ${state.roster.length}/${G.capacity(state)}</text>
      <text x="868" y="56" text-anchor="end" class="svg-sub">FACILITIES ${Object.values(state.facilities).reduce((a, b) => a + b, 0)} / ${R.FACILITIES.length * G.facilityMax(state)}</text>
    </svg>`;
  }

  // ------------------------------------------------------------------ chrome
  function renderTopbar() {
    const s = R.state;
    const heat = Math.round(s.heat);
    const box = document.getElementById('topres');
    if (!box) return;
    box.innerHTML = `
      <span class="res res--credits" title="Credits">${icon('cash', 15)}<span class="res-label">CREDS</span><strong>${R.money(s.creds)}</strong></span>
      <span class="res res--rep" title="Reputation">${icon('star', 15)}<span class="res-label">REP</span><strong>${s.rep}</strong></span>
      <span class="res res--heat ${heatClass(heat)}" title="Police heat">${icon('flame', 15)}<span class="res-label">HEAT</span><strong>${heat}%</strong></span>
      <span class="res res--balls" title="Rocket Balls">${icon('ball', 15)}<span class="res-label">BALLS</span><strong>${s.balls}</strong></span>`;
    const day = document.getElementById('day-label');
    if (day) day.textContent = String(s.day).padStart(2, '0');
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.innerHTML = icon(s.sound ? 'sound' : 'mute', 18);
      soundBtn.setAttribute('aria-label', s.sound ? 'Mute sound' : 'Turn sound on');
    }
  }

  function renderSidebar() {
    const s = R.state;
    const side = document.getElementById('sidebar');
    if (!side) return;
    const rank = R.RANKS[s.rank];
    const prog = rankProgress(s);
    const next = prog.next;
    const active = G.activePartner(s);
    const activeSp = G.speciesOf(active);
    const finalOnBoard = s.board.some((m) => m.final);
    const unlock = R.FACILITIES.find((f) => f.rank === s.rank + 1);
    const nav = [
      { id: 'base', icon: 'home', label: 'The Base', meta: `${Object.values(s.facilities).reduce((a, b) => a + b, 0)} upgrades` },
      { id: 'ops', icon: 'map', label: 'Operations', meta: finalOnBoard ? 'FINAL JOB LIVE' : `${s.board.filter((m) => !m.final).length} leads` },
      { id: 'roster', icon: 'users', label: 'Roster', meta: `${s.roster.length}/${G.capacity(s)} Pokémon` }
    ];
    side.innerHTML = `
      <div class="rank-card" style="--rank-color:${rank.color}">
        <div class="rank-emblem">
          <span class="rank-stars">${'★'.repeat(s.rank + 1)}</span>
          <span class="rank-r">R</span>
          <span class="rank-index">0${s.rank + 1}</span>
        </div>
        <div class="rank-copy">
          <div class="eyebrow">RANK ${s.rank + 1} / ${R.RANKS.length}</div>
          <h2>${esc(rank.name)}</h2>
          <p>${esc(rank.motto)}</p>
        </div>
        <div class="rank-progress">
          <div class="rank-progress-top"><span>${esc(prog.label)}</span><span>${next ? esc(next.name) : 'MAX'}</span></div>
          ${meter(prog.pct, 'meter--rank')}
        </div>
        ${G.canPromote(s)
          ? `<button class="btn btn-promote" data-action="promote">${icon('trophy', 15)} Promotion ready</button>`
          : next
            ? `<div class="rank-next">${s.rep < next.rep ? `${next.rep - s.rep} rep to ${esc(next.name)}` : 'Promotion available'}</div>`
            : `<div class="rank-next rank-next--boss">BASE EXPANSION ${G.expansionCount(s)}/3</div>`}
      </div>
      <nav class="side-nav" aria-label="Sections">
        ${nav.map((n) => `<button class="nav-item ${ui.tab === n.id ? 'is-active' : ''}" data-action="tab" data-id="${n.id}">
          ${icon(n.icon, 18)}<span class="nav-copy"><strong>${esc(n.label)}</strong><em>${esc(n.meta)}</em></span>
          ${n.id === 'ops' && finalOnBoard ? '<span class="nav-dot"></span>' : ''}
        </button>`).join('')}
      </nav>
      <button class="partner-mini" data-action="tab" data-id="roster" title="Manage roster">
        <span class="partner-mini-sprite" style="--tc:${R.typeColor(activeSp)}">${R.sprite(activeSp, 60)}</span>
        <span class="partner-mini-copy">
          <em>ACTIVE PARTNER</em>
          <strong>${esc(activeSp.name)}</strong>
          <span>${esc(activeSp.ability)}</span>
        </span>
        ${icon('arrow', 16)}
      </button>
      <div class="side-note">
        <span class="eyebrow">NEXT UNLOCK</span>
        <strong>${s.rank >= R.RANKS.length - 1 ? (G.expansionCount(s) < 3 ? 'Boss base expansion' : 'The final job') : esc(unlock ? unlock.name : 'Unknown')}</strong>
        <span>${s.rank >= R.RANKS.length - 1 ? 'Build all three wings, then take the cave.' : esc(next ? `at ${next.name} rank` : '')}</span>
      </div>
      <button class="help-link" data-action="help">${icon('help', 15)} How to play</button>`;
  }

  function renderMobileNav() {
    const buttons = document.querySelectorAll('.mobile-nav [data-action="tab"]');
    buttons.forEach((b) => {
      b.classList.toggle('is-active', !R.state.heist && ui.tab === b.dataset.id);
      if (R.state.heist) b.classList.add('is-locked');
      else b.classList.remove('is-locked');
    });
    const canPromo = !!R.state && !R.state.heist && G.canPromote(R.state);
    const badge = document.getElementById('mobile-promo');
    if (badge) badge.classList.toggle('is-on', canPromo);
    const cta = document.getElementById('mobile-promo-cta');
    if (cta) cta.classList.toggle('is-on', canPromo);
  }

  function render() {
    const s = R.state;
    if (!s) return;
    renderTopbar();
    renderSidebar();
    document.body.classList.toggle('in-heist', Boolean(s.heist));
    const view = document.getElementById('view');
    if (!view) return;
    if (s.heist) {
      ui.tab = 'heist';
      view.innerHTML = ui.heistView(s);
      const log = view.querySelector('.log-list');
      if (log) log.scrollTop = 0;
    } else {
      if (ui.tab === 'heist') ui.tab = 'ops';
      if (ui.tab === 'ops') view.innerHTML = ui.opsView(s);
      else if (ui.tab === 'roster') view.innerHTML = ui.rosterView(s);
      else view.innerHTML = ui.baseView(s);
    }
    renderMobileNav();
    if (s.lastResult && !ui.resultOpen) ui.showResult(s.lastResult);
  }

  function setTab(tab) {
    if (R.state.heist) {
      toast('Finish the operation first. Nobody walks out mid-job.', 'warn');
      sound('bad');
      return;
    }
    if (!['base', 'ops', 'roster'].includes(tab)) return;
    ui.tab = tab;
    sound('click');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startGame() {
    if (ui.started) return;
    const saved = R.pendingSave;
    R.state = saved || G.newGame();
    R.state.started = true;
    if (!R.state.board.length) G.fillBoard(R.state);
    G.ensureFinalMission(R.state);
    R.pendingSave = null;
    ui.started = true;
    ui.tab = 'base';
    const intro = document.getElementById('intro');
    const app = document.getElementById('app');
    if (intro) intro.classList.add('is-hidden');
    if (app) app.classList.remove('is-hidden');
    document.body.classList.add('game-on');
    G.save();
    render();
    sound('start');
    if (!R.state.seenHelp) {
      setTimeout(() => {
        if (!R.state.seenHelp) {
          R.state.seenHelp = true;
          G.save();
          toast('New here? The dossier in the sidebar explains the job.', 'info');
        }
      }, 900);
    }
  }

  Object.assign(ui, {
    esc, icon, sound, toast, openModal, closeModal, modalShell,
    nextRank, rankProgress, typeBadge, pips, meter, heatClass, rewardChip,
    baseArt, render, setTab, startGame
  });
})();
