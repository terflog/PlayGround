(function () {
  const R = window.REDLINE;
  const G = R.game;
  const U = R.ui;
  const esc = U.esc;
  const icon = U.icon;
  const money = R.money;

  const FAC_COLORS = {
    storage: '#f0c75e', dojo: '#e05a5a', lab: '#65d6c0',
    garage: '#e89a4b', propaganda: '#b08ce8', bribe: '#72d39a'
  };

  function facilityCard(s, f) {
    const lvl = s.facilities[f.id] || 0;
    const max = G.facilityMax(s);
    const locked = s.rank < f.rank;
    const cost = G.facilityCost(s, f);
    const atMax = lvl >= max;
    const color = FAC_COLORS[f.id] || '#f0c75e';
    const can = !locked && !atMax;
    const label = locked ? `Unlocks at ${R.RANKS[f.rank].name}` : atMax ? 'Fully upgraded' : `Upgrade · ${money(cost)}`;
    const nextEffect = can ? f.effect(lvl + 1) : null;
    return `<article class="facility-card ${locked ? 'is-locked' : ''} ${atMax ? 'is-max' : ''}" style="--fac:${color}">
      <div class="facility-top">
        <span class="facility-icon">${icon(f.icon, 22)}</span>
        <div class="facility-name">
          <div class="factitle-row"><h3>${esc(f.name)}</h3><span class="facility-lv">LV ${lvl}<em>/${max}</em></span></div>
          ${U.pips(lvl, max)}
        </div>
      </div>
      <p class="facility-blurb">${esc(f.blurb)}</p>
      <div class="facility-effect">
        <span>${lvl ? esc(f.effect(lvl)) : 'No upgrades installed'}</span>
        ${nextEffect ? `<em>Next: ${esc(nextEffect)}</em>` : ''}
      </div>
      <button class="btn btn-facility ${locked ? 'is-disabled' : atMax ? 'is-maxed' : ''}" data-action="facility" data-id="${f.id}">
        ${locked ? icon('lock', 14) : atMax ? icon('check', 14) : icon('arrow', 14)}
        <span>${esc(label)}</span>
      </button>
    </article>`;
  }

  function expansionCard(s, e) {
    const owned = s.expansions[e.id];
    const canAfford = s.creds >= e.cost;
    return `<article class="expansion-card ${owned ? 'is-owned' : ''}" style="--exp:${e.color}">
      <div class="expansion-head">
        <span class="expansion-icon">${icon(e.icon, 24)}</span>
        <div><div class="eyebrow">WING 0${R.EXPANSIONS.indexOf(e) + 1}</div><h3>${esc(e.name)}</h3></div>
        ${owned ? `<span class="owned-stamp">${icon('check', 13)} BUILT</span>` : ''}
      </div>
      <p>${esc(e.blurb)}</p>
      <div class="expansion-bonus">${esc(e.bonus)}</div>
      ${owned
        ? `<div class="expansion-built">Structural upgrade online · +1 facility level cap</div>`
        : `<button class="btn btn-gold ${canAfford ? '' : 'is-unaffordable'}" data-action="expansion" data-id="${e.id}">
             ${icon('expand', 15)} Build · ${money(e.cost)}
           </button>`}
    </article>`;
  }

  function rankRail(s) {
    const prog = U.rankProgress(s);
    if (G.canPromote(s)) {
      const next = R.RANKS[s.rank + 1];
      return `<div class="panel promo-panel is-ready">
        <div class="eyebrow eyebrow--gold">PROMOTION READY</div>
        <h3>${esc(next.name)}</h3>
        <p>${esc(next.motto)}</p>
        <div class="promo-reward">${icon('cash', 15)} ${money(next.reward)} signing bonus</div>
        <button class="btn btn-primary btn-block" data-action="promote">${icon('trophy', 16)} Take the rank</button>
      </div>`;
    }
    const next = prog.next;
    return `<div class="panel promo-panel">
      <div class="eyebrow">RANK PROGRESS</div>
      <div class="promo-rank-row"><h3>${esc(prog.cur.name)}</h3><span>${esc(prog.label)}</span></div>
      ${U.meter(prog.pct, 'meter--rank')}
      ${next
        ? `<p class="promo-next">Next: <strong>${esc(next.name)}</strong> · ${next.rep - s.rep > 0 ? `${next.rep - s.rep} rep to go` : 'ready to promote'}</p>`
        : `<p class="promo-next">You are the Boss. The only way left is bigger.</p>`}
      <div class="ladder">${R.RANKS.map((r, i) => `<span class="ladder-step ${i <= s.rank ? 'is-done' : ''} ${i === s.rank + 1 ? 'is-next' : ''}" title="${esc(r.name)}"><i></i><em>${esc(r.name.slice(0, 3))}</em></span>`).join('')}</div>
    </div>`;
  }

  function baseView(s) {
    const cap = G.capacity(s);
    const boss = s.rank >= R.RANKS.length - 1;
    const allExp = R.EXPANSIONS.every((e) => s.expansions[e.id]);
    const totalLevels = Object.values(s.facilities).reduce((a, b) => a + b, 0);
    const active = G.activePartner(s);
    const sp = G.speciesOf(active);
    return `<section class="view-head">
      <div>
        <div class="eyebrow">THE HIDEOUT // DAY ${s.day}</div>
        <h1>Redline Base</h1>
        <p class="view-sub">A warehouse with a criminal amount of ambition. Keep the lights on, the heat down, and the racks full.</p>
      </div>
      <div class="head-status">
        <span class="status-chip">${icon('users', 15)} ${s.roster.length}/${cap} crew</span>
        <span class="status-chip ${U.heatClass(s.heat)}">${icon('flame', 15)} ${Math.round(s.heat)}% heat</span>
        <span class="status-chip">${icon('box', 15)} ${totalLevels} upgrades</span>
      </div>
    </section>

    <div class="base-layout">
      <div class="base-col">
        <div class="diorama panel ${s.heat >= 75 ? 'is-hot' : ''}">
          ${U.baseArt(s)}
          <div class="diorama-tag"><span class="live-dot"></span> NEON DISTRICT · ${boss ? 'BOSS CLEARANCE' : 'GRUNT CLEARANCE'}</div>
        </div>

        ${s.heat >= 65 ? `<div class="alert-banner ${s.heat >= 85 ? 'is-critical' : ''}">
          ${icon('flame', 18)}<div><strong>${s.heat >= 85 ? 'THE POLICE ARE AT THE DOOR' : 'HEAT IS RISING'}</strong><span>${s.heat >= 85 ? 'Lay low now or the next job ends in a raid.' : 'A quiet day costs credits. A raid costs more.'}</span></div>
          <button class="btn btn-sm" data-action="laylow">Lay low · ${money(G.layLowCost(s))}</button>
        </div>` : ''}

        <div class="section-head">
          <div><div class="eyebrow">FLOOR PLAN</div><h2>Facilities</h2></div>
          <span class="section-note">Level cap ${G.facilityMax(s)}${boss && !allExp ? ' · expansions raise the cap' : ''}</span>
        </div>
        <div class="facility-grid">${R.FACILITIES.map((f) => facilityCard(s, f)).join('')}</div>

        <div class="section-head section-head--boss">
          <div><div class="eyebrow ${boss ? 'eyebrow--gold' : ''}">BOSS PRIVILEGE</div><h2>Base Expansion</h2></div>
          <span class="section-note">${boss ? `${G.expansionCount(s)}/3 wings built` : 'Unlocks at Boss rank'}</span>
        </div>
        ${boss
          ? `<div class="expansion-intro ${allExp ? 'is-complete' : ''}">
              <p>${allExp ? 'All three wings are online. The cave has a new name on the map, and the final job is live.' : 'A Boss gets to build. Each new wing makes the base bigger and raises every facility level cap by one.'}</p>
              ${allExp ? `<button class="btn btn-gold" data-action="tab" data-id="ops">${icon('skull', 16)} View the final job</button>` : ''}
            </div>
            <div class="expansion-grid">${R.EXPANSIONS.map((e) => expansionCard(s, e)).join('')}</div>`
          : `<div class="expansion-locked panel">
              ${icon('lock', 24)}
              <div><strong>THE BASE CAN STILL GROW</strong><span>Reach Boss rank to unlock three expansion wings, higher facility caps, and the last operation.</span></div>
              <div class="locked-preview">${R.EXPANSIONS.map((e) => `<span>${icon(e.icon, 15)} ${esc(e.name)}</span>`).join('')}</div>
            </div>`}
      </div>

      <aside class="rail">
        ${rankRail(s)}
        <div class="panel quick-panel">
          <div class="panel-head"><span class="eyebrow">QUICK ACTIONS</span>${icon('clock', 15)}</div>
          <button class="quick-action" data-action="laylow">
            <span class="quick-icon quick-icon--heat">${icon('flame', 18)}</span>
            <span class="quick-copy"><strong>Lay low</strong><em>-28 heat · +1 day</em></span>
            <span class="quick-cost">${money(G.layLowCost(s))}</span>
          </button>
          <button class="quick-action" data-action="balls">
            <span class="quick-icon quick-icon--ball">${icon('ball', 18)}</span>
            <span class="quick-copy"><strong>Buy 5 balls</strong><em>${s.balls} in bag</em></span>
            <span class="quick-cost">${money(G.ballPackCost(s))}</span>
          </button>
          <div class="quick-foot">Every ball is a chance. Every chance is a story.</div>
        </div>

        <div class="panel crew-panel">
          <div class="panel-head"><span class="eyebrow">ACTIVE PARTNER</span><span class="live-dot"></span></div>
          <div class="crew-feature" style="--tc:${R.typeColor(sp)}">
            <span class="crew-sprite">${R.sprite(sp, 84)}</span>
            <div><h3>${esc(sp.name)}</h3>${U.typeBadge(sp)}<p>${esc(sp.ability)}</p></div>
          </div>
          <div class="crew-line"><span>Capture power</span><strong>+${Math.round(sp.power * 2.2)}%</strong></div>
          <div class="crew-line"><span>Crew capacity</span><strong>${s.roster.length} / ${cap}</strong></div>
          <button class="btn btn-ghost btn-block" data-action="tab" data-id="roster">${icon('users', 15)} Manage roster</button>
        </div>

        <div class="panel intel-panel">
          <div class="eyebrow">STREET TALK</div>
          <p>${esc(pickTip(s))}</p>
        </div>
      </aside>
    </div>`;
  }

  function pickTip(s) {
    const tips = [
      'A clean job under 30% suspicion pays better. Patience is a weapon.',
      'Your partner\'s Charm fuels the distraction. Save it for when the alarm climbs.',
      'Balls are cheap. Getting caught is not.',
      'Facility levels raise the level cap after you become Boss.',
      'Fencing duplicates keeps the racks clear and the wallet heavy.',
      'Heat at 100% triggers a police raid and a very awkward meeting.',
      'The safest way through a door is usually a Pokémon that does not fit through it.'
    ];
    return tips[(s.day + s.roster.length) % tips.length];
  }

  function missionCard(s, m, index) {
    const sp = R.SPECIES[m.target];
    const active = G.activePartner(s);
    const chance = G.captureChance(s, m, active, 0);
    const tag = m.tag;
    const tagCls = tag ? `tag--${tag.tone || 'cool'}` : '';
    const diffBars = Array.from({ length: 5 }, (_, i) => `<i class="${i < m.difficulty ? 'is-on' : ''}"></i>`).join('');
    const secBars = Array.from({ length: 5 }, (_, i) => `<i class="${i < m.security ? 'is-on' : ''}"></i>`).join('');
    return `<article class="mission-card ${m.final ? 'mission-card--final' : ''}" style="--tc:${R.typeColor(sp)}">
      <div class="mission-art">
        <div class="mission-index">${m.final ? 'BOSS' : 'LEAD 0' + (index + 1)}</div>
        <div class="mission-halo"></div>
        ${R.sprite(sp, m.final ? 132 : 104)}
        <div class="mission-tier">TIER ${m.tier}</div>
      </div>
      <div class="mission-body">
        <div class="mission-topline">
          <span class="mission-loc">${icon('map', 13)} ${esc(m.location)}</span>
          ${tag ? `<span class="mission-tag ${tagCls}">${esc(tag.label)}</span>` : '<span class="mission-tag tag--none">UNMARKED</span>'}
        </div>
        <div class="mission-title-row">
          <h3>${esc(sp.name)}</h3>
          ${U.typeBadge(sp)}
          <span class="rarity">${'◆'.repeat(Math.min(5, sp.tier))}</span>
        </div>
        <p class="mission-flavor">${esc(m.flavor)}</p>
        <div class="mission-stat-grid">
          ${U.rewardChip('cash', 'PAYOUT', money(m.credits))}
          ${U.rewardChip('star', 'REP', '+' + m.rep)}
          ${U.rewardChip('flame', 'HEAT', '+' + m.heat, m.heat >= 20 ? 'is-hot' : '')}
          ${U.rewardChip('ball', 'CAPTURE', R.fmtPct(chance))}
        </div>
        <div class="mission-meta-row">
          <span class="threat"><em>SECURITY</em><span class="bar-pips">${secBars}</span></span>
          <span class="threat"><em>DIFFICULTY</em><span class="bar-pips bar-pips--gold">${diffBars}</span></span>
          <span class="rooms-left">${icon('footprints', 13)} ${m.distance} rooms</span>
        </div>
        ${tag ? `<div class="mission-tag-desc">${esc(tag.desc)}</div>` : ''}
      </div>
      <div class="mission-cta">
        <button class="btn ${m.final ? 'btn-gold' : 'btn-primary'} btn-block" data-action="mission" data-id="${m.id}">
          ${m.final ? `${icon('skull', 16)} Take the last job` : `${icon('arrow', 16)} Plan heist`}
        </button>
        <span class="mission-sub">${s.balls > 0 ? `${s.balls} balls ready` : 'No balls · buy some'}</span>
      </div>
    </article>`;
  }

  function opsView(s) {
    const final = s.board.find((m) => m.final);
    const missions = s.board.filter((m) => !m.final);
    const active = G.activePartner(s);
    const sp = G.speciesOf(active);
    return `<section class="view-head">
      <div>
        <div class="eyebrow">OPERATIONS // DAY ${s.day}</div>
        <h1>Job Board</h1>
        <p class="view-sub">Three leads. Pick one before the trail goes cold. The board refreshes after every job.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-ghost" data-action="reroll">${icon('eye', 15)} New intel · ${money(G.rerollCost(s))}</button>
        <span class="status-chip ${U.heatClass(s.heat)}">${icon('flame', 15)} ${Math.round(s.heat)}% heat</span>
      </div>
    </section>

    ${s.heat >= 100 ? `<div class="alert-banner is-critical">${icon('flame', 18)}<div><strong>HEAT MAXED</strong><span>The police are watching the doors. Lay low before you launch another job.</span></div><button class="btn btn-sm" data-action="laylow">Lay low · ${money(G.layLowCost(s))}</button></div>`
      : s.heat >= 65 ? `<div class="alert-banner">${icon('flame', 18)}<div><strong>THE STREET IS NERVOUS</strong><span>Heat is high. A clean job cools things down; a loud one invites a raid.</span></div><button class="btn btn-sm" data-action="laylow">Lay low · ${money(G.layLowCost(s))}</button></div>` : ''}

    <div class="ops-layout">
      <div class="ops-list">
        ${final ? missionCard(s, final, 0) : ''}
        ${missions.map((m, i) => missionCard(s, m, final ? i + 1 : i)).join('')}
      </div>
      <aside class="rail">
        <div class="panel partner-card" style="--tc:${R.typeColor(sp)}">
          <div class="panel-head"><span class="eyebrow">ON THE JOB</span><span class="live-dot"></span></div>
          <div class="partner-hero">
            <span class="partner-hero-sprite">${R.sprite(sp, 104)}</span>
            <div><h3>${esc(sp.name)}</h3>${U.typeBadge(sp)}<p>${esc(sp.ability)}</p></div>
          </div>
          <div class="mini-stats">${['stealth', 'muscle', 'tech', 'charm'].map((k) => `<span><em>${k.slice(0, 1).toUpperCase()}</em><i style="--v:${Math.min(100, (G.partnerStats(active, s)[k] / 12) * 100)}%"></i></span>`).join('')}</div>
          <div class="partner-note">You can switch partners in the prep screen.</div>
          <button class="btn btn-ghost btn-block" data-action="tab" data-id="roster">${icon('users', 15)} Open roster</button>
        </div>

        <div class="panel gear-panel">
          <div class="panel-head"><span class="eyebrow">GEAR</span>${icon('box', 15)}</div>
          <div class="gear-line"><span>${icon('ball', 15)} Rocket Balls</span><strong>${s.balls}</strong></div>
          <div class="gear-line"><span>${icon('flask', 15)} Lab bonus</span><strong>+${(s.facilities.lab || 0) * 4}%</strong></div>
          <div class="gear-line"><span>${icon('car', 15)} Heat reduction</span><strong>${Math.round((1 - G.heatMult(s)) * 100)}%</strong></div>
          <button class="btn btn-ghost btn-block" data-action="balls">${icon('ball', 15)} Buy 5 · ${money(G.ballPackCost(s))}</button>
        </div>

        <div class="panel heat-panel ${U.heatClass(s.heat)}">
          <div class="panel-head"><span class="eyebrow">POLICE HEAT</span><strong>${Math.round(s.heat)}%</strong></div>
          ${U.meter(s.heat, 'meter--heat')}
          <p>${s.heat >= 85 ? 'Raid imminent. Lay low.' : s.heat >= 65 ? 'Patrols are doubling up.' : s.heat >= 35 ? 'The precinct is asking questions.' : 'Nobody important is looking.'}</p>
          <button class="btn btn-sm btn-block" data-action="laylow">Lay low · ${money(G.layLowCost(s))}</button>
        </div>

        <div class="panel intel-panel">
          <div class="eyebrow">FIELD NOTE</div>
          <p>${esc(pickTip(s))}</p>
        </div>
      </aside>
    </div>`;
  }

  Object.assign(U, { baseView, opsView, facilityCard, missionCard });
})();
