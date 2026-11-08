(function () {
  const R = window.REDLINE;
  const G = R.game;
  const U = R.ui;
  const esc = U.esc;
  const icon = U.icon;
  const money = R.money;

  function statLine(label, value, cls = '') {
    return `<div class="result-line ${cls}"><span>${esc(label)}</span><strong>${value}</strong></div>`;
  }

  // ------------------------------------------------------------------ prep
  function showPrep(missionId, partnerUid) {
    const s = R.state;
    const mission = s.board.find((m) => m.id === missionId);
    if (!mission) { U.toast('That lead has gone cold.', 'warn'); return; }
    U.prepMission = mission.id;
    if (partnerUid && s.roster.some((m) => m.uid === partnerUid)) U.prepPartner = partnerUid;
    if (!U.prepPartner || !s.roster.some((m) => m.uid === U.prepPartner)) U.prepPartner = s.activeId;
    const partner = s.roster.find((m) => m.uid === U.prepPartner) || G.activePartner(s);
    const sp = R.SPECIES[mission.target];
    const psp = G.speciesOf(partner);
    const chance = G.captureChance(s, mission, partner, 0);
    const tag = mission.tag;
    const options = s.roster.map((mon) => {
      const msp = G.speciesOf(mon);
      const stats = G.partnerStats(mon, s);
      const selected = mon.uid === partner.uid;
      return `<button class="partner-option ${selected ? 'is-selected' : ''}" data-action="prep-select" data-id="${mon.uid}" style="--tc:${R.typeColor(msp)}">
        <span class="po-sprite">${R.sprite(msp, 62)}</span>
        <span class="po-copy">
          <span class="po-name">${esc(msp.name)} ${selected ? icon('check', 13) : ''}</span>
          <em>${esc(msp.ability)} · PWR ${msp.power}</em>
          <span class="po-stats">${['stealth', 'muscle', 'tech', 'charm'].map((k) => `<i title="${k}">${stats[k]}</i>`).join('')}</span>
        </span>
      </button>`;
    }).join('');

    const body = `<div class="prep-grid">
      <div class="prep-mission" style="--tc:${R.typeColor(sp)}">
        <div class="prep-art"><span class="target-halo"></span>${R.sprite(sp, 138)}<span class="prep-tier">TIER ${mission.tier} · SEC ${mission.security}</span></div>
        <div class="eyebrow">THE MARK</div>
        <h3>${esc(sp.name)} ${U.typeBadge(sp)}</h3>
        <p>${esc(mission.flavor)}</p>
        ${tag ? `<div class="prep-tag tag--${tag.tone || 'cool'}">${esc(tag.label)} · ${esc(tag.desc)}</div>` : ''}
        <div class="prep-facts">
          <span>${icon('map', 14)} ${esc(mission.location)}</span>
          <span>${icon('footprints', 14)} ${mission.distance} rooms</span>
          <span>${icon('ball', 14)} ${R.fmtPct(mission.catchRate)} base catch</span>
        </div>
        <div class="prep-rewards">
          ${U.rewardChip('cash', 'PAYOUT', money(mission.credits))}
          ${U.rewardChip('star', 'REP', '+' + mission.rep)}
          ${U.rewardChip('flame', 'HEAT', '+' + mission.heat)}
        </div>
        <div class="prep-chance">
          <span>CAPTURE WITH ${esc(psp.name.toUpperCase())}</span>
          <strong>${R.fmtPct(chance)}</strong>
          <em>at 0% suspicion</em>
        </div>
      </div>
      <div class="prep-crew">
        <div class="prep-crew-head">
          <div><div class="eyebrow">CHOOSE YOUR PARTNER</div><h3>Who is coming in with you?</h3></div>
          <span class="status-chip">${icon('ball', 14)} ${s.balls} balls</span>
        </div>
        <div class="partner-options">${options}</div>
        <div class="prep-tip">${icon('spark', 14)} Abilities and stats matter: Stealth keeps you quiet, Muscle moves fast, Tech kills cameras, Charm creates distractions.</div>
        ${s.balls <= 0 ? `<div class="prep-warning">${icon('flame', 15)} No Rocket Balls. You can reach the target, but you cannot capture it. Buy balls first or bail with partial pay.</div>` : ''}
        <button class="btn btn-primary btn-block btn-launch" data-action="launch" data-id="${mission.id}" ${s.heat >= 100 ? 'disabled' : ''}>
          ${icon('arrow', 17)} ${s.heat >= 100 ? 'Heat maxed · lay low first' : `Launch operation`}
        </button>
      </div>
    </div>`;
    U.openModal(U.modalShell('JOB PREP // ' + mission.location.toUpperCase(), 'Plan the heist', body, { gold: mission.final }), 'modal--wide');
  }

  // ------------------------------------------------------------------ result
  function rewardRows(result) {
    const rows = [];
    if (result.kind === 'success') {
      rows.push(statLine('Payout', '+' + money(result.credits), 'is-good'));
      rows.push(statLine('Reputation', '+' + result.rep, 'is-good'));
      rows.push(statLine('Heat gained', '+' + Math.round(result.heat), 'is-hot'));
      if (result.clean) rows.push(statLine('Clean getaway bonus', 'applied', 'is-gold'));
      if (result.fencedValue) rows.push(statLine('Fenced (racks full)', '+' + money(result.fencedValue), 'is-gold'));
    } else if (result.kind === 'busted') {
      rows.push(statLine('Credits lost', '-' + money(result.loss), 'is-bad'));
      rows.push(statLine('Heat gained', '+' + Math.round(result.heat), 'is-hot'));
      rows.push(statLine('Balls left', String(R.state ? R.state.balls : 0)));
    } else {
      rows.push(statLine('Partial payout', '+' + money(result.credits), 'is-good'));
      rows.push(statLine('Reputation', '+' + result.rep, 'is-good'));
      rows.push(statLine('Heat gained', '+' + Math.round(result.heat), 'is-hot'));
    }
    return rows.join('');
  }

  function showResult(result) {
    if (!result) return;
    U.resultOpen = true;
    const s = R.state;
    const m = result.mission;
    const sp = R.SPECIES[m.target];
    const victory = Boolean(result.victory);
    const kindClass = victory ? 'is-victory' : result.kind === 'success' ? 'is-success' : result.kind === 'busted' ? 'is-busted' : 'is-retreat';
    const stamp = victory ? 'EMPIRE' : result.kind === 'success' ? (result.clean ? 'CLEAN' : 'DONE') : result.kind === 'busted' ? 'BUSTED' : 'BAILED';
    const title = victory ? 'THE EMPIRE IS YOURS' : result.kind === 'success' ? (result.clean ? 'Clean getaway' : 'The job is done') : result.kind === 'busted' ? 'You got busted' : 'You made the call';
    const kicker = victory ? 'THE LAST JOB // COMPLETE' : result.kind === 'success' ? 'OPERATION COMPLETE // ' + m.location.toUpperCase() : result.kind === 'busted' ? 'OPERATION FAILED // ' + m.location.toUpperCase() : 'OPERATION ABORTED // ' + m.location.toUpperCase();
    const subtitle = victory
      ? 'Mewtwo is in the ball. The cave is yours. The chair was always going to be yours.'
      : result.kind === 'success'
        ? `${sp.name} is in the bag. ${result.clean ? 'Nobody saw a thing.' : 'It got loud, but it worked.'}`
        : result.kind === 'busted'
          ? `The guards caught up. ${sp.name} stays put, and the precinct has your description.`
          : `You slipped out before it went bad. ${sp.name} stays on the board — for now.`;

    const capturedBlock = result.captured ? `<div class="captured-block" style="--tc:${R.typeColor(sp)}">
      <span class="captured-label">${victory ? 'LEGENDARY ACQUIRED' : 'NEW CREW MEMBER'}</span>
      <span class="captured-sprite">${R.sprite(sp, 92)}</span>
      <div><strong>${esc(sp.name)}</strong>${U.typeBadge(sp)}<span>${esc(sp.ability)} · PWR ${sp.power}</span></div>
      <span class="captured-note">${victory ? 'The base has a new centrepiece.' : 'Added to your roster.'}</span>
    </div>` : '';
    const fencedBlock = result.fenced ? `<div class="captured-block is-fenced" style="--tc:${R.typeColor(result.fenced)}">
      <span class="captured-label">RACKS FULL · FENCED</span>
      <span class="captured-sprite">${R.sprite(result.fenced, 76)}</span>
      <div><strong>${esc(result.fenced.name)}</strong><span>Sold to a quiet man with a van.</span></div>
      <span class="captured-note">+${money(result.fencedValue)}</span>
    </div>` : '';
    const raidBlock = result.raid ? `<div class="raid-block">${icon('flame', 18)}<div><strong>POLICE RAID</strong><span>The heat hit 100%. They took ${money(result.raid.loss)} and kicked in the loading bay door. Heat reset to 55%.</span></div></div>` : '';
    const promoBlock = result.promotion ? `<div class="promo-nudge">${icon('trophy', 16)} Promotion is ready — take it from the sidebar.</div>` : '';
    const victoryExtra = victory ? `<div class="victory-stats">
      <span><em>FINAL RANK</em><strong>Boss</strong></span>
      <span><em>CREW</em><strong>${s.roster.length}</strong></span>
      <span><em>JOBS</em><strong>${s.stats.heists}</strong></span>
      <span><em>WINGS</em><strong>3/3</strong></span>
    </div><p class="victory-copy">You started with a second-hand uniform and a borrowed Meowth. Now the cave answers to you. Team Rocket is not a job anymore. It is an empire.</p>` : '';

    const body = `<div class="result-card ${kindClass}">
      <div class="result-art" style="--tc:${R.typeColor(sp)}"><span class="target-halo"></span>${R.sprite(sp, victory ? 140 : 110)}<span class="result-stamp">${stamp}</span></div>
      <div class="result-main">
        <div class="eyebrow ${victory ? 'eyebrow--gold' : ''}">${kicker}</div>
        <h2>${title}</h2>
        <p class="result-sub">${subtitle}</p>
        ${victory ? victoryExtra : `<div class="result-rows">${rewardRows(result)}${statLine('Suspicion at exit', Math.round(result.alert) + '%', result.alert <= 29 ? 'is-gold' : 'is-hot')}</div>`}
        ${capturedBlock}
        ${fencedBlock}
        ${raidBlock}
        ${promoBlock}
      </div>
    </div>
    <div class="result-actions">
      ${victory
        ? `<button class="btn btn-gold" data-action="result-close">${icon('trophy', 16)} Keep running the empire</button>
           <button class="btn btn-ghost" data-action="result-base">${icon('home', 15)} See the base</button>`
        : `<button class="btn btn-primary" data-action="result-close">${icon('map', 15)} Back to the board</button>
           ${result.captured ? `<button class="btn btn-ghost" data-action="result-roster">${icon('users', 15)} View roster</button>` : ''}`}
    </div>`;
    U.openModal(body, 'modal--result');
  }

  // ------------------------------------------------------------------ promotion
  function showPromotion(info) {
    if (!info) return;
    const rank = R.RANKS[info.rank];
    const unlocked = info.boss ? null : R.FACILITIES.find((f) => f.rank === info.rank);
    const body = `<div class="promo-modal" style="--rank-color:${info.color}">
      <div class="promo-emblem"><span class="rank-stars">${'★'.repeat(info.rank + 1)}</span><span class="rank-r">R</span></div>
      <div class="eyebrow eyebrow--gold">PROMOTED FROM ${esc(info.previous.toUpperCase())}</div>
      <h2>${esc(info.name)}</h2>
      <p class="promo-motto">${esc(info.motto)}</p>
      <div class="promo-payout">${icon('cash', 16)} ${money(info.reward)} signing bonus</div>
      ${info.boss
        ? `<div class="promo-unlock is-boss">${icon('expand', 18)} <div><strong>BASE EXPANSION UNLOCKED</strong><span>Three new wings. Higher facility caps. A bigger base. The final job waits beyond all three.</span></div></div>`
        : unlocked
          ? `<div class="promo-unlock">${icon(unlocked.icon, 18)} <div><strong>NEW FACILITY · ${esc(unlocked.name)}</strong><span>${esc(unlocked.blurb)}</span></div></div>`
          : ''}
      <button class="btn btn-primary btn-block" data-action="close-modal">${icon('arrow', 15)} Take the rank</button>
    </div>`;
    U.openModal(body, 'modal--promo');
  }

  // ------------------------------------------------------------------ misc
  function confirmBail() {
    const s = R.state;
    if (!s.heist) return;
    const body = `<div class="confirm-body">
      <p>Leave the operation now? You keep 22% of the payout and slip away, but the lead is gone.</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" data-action="close-modal">${icon('back', 15)} Keep going</button>
        <button class="btn btn-primary" data-action="confirm-bail">${icon('arrow', 15)} Bail out</button>
      </div>
    </div>`;
    U.openModal(U.modalShell('FALLBACK PLAN', 'Abort the job?', body));
  }

  function confirmFence(uid) {
    const s = R.state;
    const mon = s.roster.find((m) => m.uid === uid);
    if (!mon) return;
    const sp = G.speciesOf(mon);
    const value = G.fenceValue(mon);
    const body = `<div class="fence-confirm" style="--tc:${R.typeColor(sp)}">
      <span class="fence-sprite">${R.sprite(sp, 92)}</span>
      <p>Fence <strong>${esc(sp.name)}</strong> for <strong>${money(value)}</strong>? They will not be in your roster anymore.</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" data-action="close-modal">Keep them</button>
        <button class="btn btn-primary" data-action="confirm-fence" data-id="${uid}">${icon('cash', 15)} Fence for ${money(value)}</button>
      </div>
    </div>`;
    U.openModal(U.modalShell('THE FENCE', 'Sell this Pokémon?', body));
  }

  function helpModal() {
    const s = R.state;
    const body = `<div class="help-grid">
      <section><h3>${icon('map', 16)} The loop</h3><p>Pick a lead on the Job Board. Choose a partner, sneak into the facility, reach the target, and throw a ball. Every job pays credits and reputation. Reputation unlocks ranks. Ranks unlock base facilities.</p></section>
      <section><h3>${icon('footprints', 16)} Heist actions</h3><p><strong>Sneak</strong> is quiet. <strong>Hack</strong> trades a room for camera trouble. <strong>Smash</strong> moves two rooms but makes noise. <strong>Distract</strong> uses your partner's ability once. <strong>Throw ball</strong> only works at the target. <strong>Bail</strong> keeps 22%.</p></section>
      <section><h3>${icon('flame', 16)} Suspicion & heat</h3><p>Suspicion rises every action. At 100% you are busted and lose credits. Finishing under 30% earns a clean getaway bonus. Mission heat carries over. At 100% heat, police raid the base. Lay low to cool down.</p></section>
      <section><h3>${icon('trophy', 16)} Ranks & the base</h3><p>Promote when your reputation hits the next threshold. Facilities add capacity, capture chance, heat reduction and payouts. At <strong>Boss</strong> rank you unlock three expansion wings that make the base bigger and raise every facility cap.</p></section>
      <section><h3>${icon('skull', 16)} The final job</h3><p>Build all three Boss wings to expose the last operation: steal Mewtwo from Cerulean Cave. It is hard, expensive, and the only way to finish the story.</p></section>
      <section><h3>${icon('box', 16)} Saving</h3><p>Your career saves automatically in this browser. If you need a clean slate, erase it below.</p>
      <button class="btn btn-ghost btn-sm btn-danger" data-action="erase-save">${icon('trash', 14)} Erase career</button></section>
    </div>
    <div class="help-foot"><span>Keyboard in a heist: 1 sneak · 2 distract · 3 hack · 4 smash · 5 ball · 6 bail</span><button class="btn btn-primary btn-sm" data-action="close-modal">Got it</button></div>`;
    U.openModal(U.modalShell('THE ROCKET DOSSIER', 'How to play', body), 'modal--help');
  }

  function confirmErase() {
    const body = `<div class="confirm-body">
      <p>Erase the current career, every stolen Pokémon, and all base upgrades? This cannot be undone.</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" data-action="close-modal">Keep playing</button>
        <button class="btn btn-primary btn-danger" data-action="confirm-erase">${icon('trash', 15)} Erase everything</button>
      </div>
    </div>`;
    U.openModal(U.modalShell('POINT OF NO RETURN', 'Erase career?', body));
  }

  function expansionComplete() {
    const body = `<div class="expansion-complete">
      <div class="expansion-seal">${icon('expand', 36)}</div>
      <div class="eyebrow eyebrow--gold">ALL THREE WINGS ONLINE</div>
      <h2>The base is bigger.</h2>
      <p>East Wing, Underground Vault, Rooftop Deck. The floor plan is now the size of a small criminal kingdom, and every facility can climb three levels higher.</p>
      <div class="expansion-list">${R.EXPANSIONS.map((e) => `<span style="--exp:${e.color}">${icon(e.icon, 16)} ${esc(e.bonus)}</span>`).join('')}</div>
      <div class="final-callout">${icon('skull', 18)} <div><strong>THE FINAL JOB IS LIVE</strong><span>Cerulean Cave. Mewtwo. Everything you have built leads here.</span></div></div>
      <button class="btn btn-gold btn-block" data-action="go-final">${icon('arrow', 16)} Open the final operation</button>
    </div>`;
    U.openModal(U.modalShell('BOSS EXPANSION COMPLETE', 'All wings built', body, { gold: true }), 'modal--promo');
  }

  Object.assign(U, {
    showPrep, showResult, showPromotion, confirmBail, confirmFence,
    helpModal, confirmErase, expansionComplete
  });
})();
