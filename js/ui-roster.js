(function () {
  const R = window.REDLINE;
  const G = R.game;
  const U = R.ui;
  const esc = U.esc;
  const icon = U.icon;
  const money = R.money;

  function monCard(s, mon) {
    const sp = G.speciesOf(mon);
    const stats = G.partnerStats(mon, s);
    const active = s.activeId === mon.uid;
    const value = G.fenceValue(mon);
    const canFence = s.roster.length > 1;
    return `<article class="mon-card ${active ? 'is-active' : ''}" style="--tc:${R.typeColor(sp)}">
      <div class="mon-art">
        <div class="mon-halo"></div>
        ${R.sprite(sp, 112)}
        <span class="mon-power">PWR ${sp.power}</span>
        ${mon.starter ? '<span class="mon-starter">INHERITED</span>' : mon.trophy ? '<span class="mon-trophy">TROPHY</span>' : ''}
        ${active ? '<span class="deployed-stamp">DEPLOYED</span>' : ''}
      </div>
      <div class="mon-body">
        <div class="mon-title-row"><h3>${esc(sp.name)}</h3>${U.typeBadge(sp)}</div>
        <div class="mon-ability">${icon('spark', 13)} ${esc(sp.ability)}</div>
        <p class="mon-tagline">${esc(sp.tagline)}</p>
        <div class="mon-stats">
          ${['stealth', 'muscle', 'tech', 'charm'].map((k) => `<div class="mon-stat">
            <span>${k.toUpperCase()}</span>
            <i><b style="width:${Math.min(100, (stats[k] / 12) * 100)}%"></b></i>
            <strong>${stats[k]}</strong>
          </div>`).join('')}
        </div>
        <div class="mon-actions">
          ${active
            ? `<span class="active-label">${icon('check', 14)} Active partner</span>`
            : `<button class="btn btn-sm btn-primary" data-action="active" data-id="${mon.uid}">${icon('arrow', 13)} Deploy</button>`}
          <button class="btn btn-sm btn-ghost btn-fence" data-action="fence" data-id="${mon.uid}" ${canFence ? '' : 'disabled'}>
            ${icon('cash', 13)} Fence · ${money(value)}
          </button>
        </div>
      </div>
    </article>`;
  }

  function rosterView(s) {
    const cap = G.capacity(s);
    const active = G.activePartner(s);
    const best = [...s.roster].sort((a, b) => G.speciesOf(b).power - G.speciesOf(a).power)[0];
    const totalPower = s.roster.reduce((n, m) => n + G.speciesOf(m).power, 0);
    return `<section class="view-head">
      <div>
        <div class="eyebrow">CREW // ${s.roster.length} OF ${cap}</div>
        <h1>Stolen Roster</h1>
        <p class="view-sub">Every Pokémon here has a previous owner and a story. Only one of them can be deployed at a time.</p>
      </div>
      <div class="head-status">
        <span class="status-chip">${icon('users', 15)} ${s.roster.length}/${cap} capacity</span>
        <span class="status-chip">${icon('star', 15)} ${totalPower} total power</span>
      </div>
    </section>

    <div class="capacity-panel panel">
      <div class="capacity-copy">
        <div class="eyebrow">STORAGE BAY</div>
        <strong>${s.roster.length} <em>/ ${cap}</em></strong>
        <span>${s.roster.length >= cap ? 'Full. Caught Pokémon will be fenced automatically.' : `${cap - s.roster.length} racks still empty`}</span>
      </div>
      <div class="capacity-meter">${U.meter((s.roster.length / cap) * 100, 'meter--capacity')}</div>
      <div class="capacity-side">
        <span>BEST PARTNER</span><strong>${esc(G.speciesOf(best).name)} · PWR ${G.speciesOf(best).power}</strong>
      </div>
    </div>

    <div class="roster-grid">
      ${s.roster.map((m) => monCard(s, m)).join('')}
      ${Array.from({ length: Math.max(0, Math.min(3, cap - s.roster.length)) }, () => `<div class="empty-slot">
        <span>${icon('box', 26)}</span>
        <strong>EMPTY RACK</strong>
        <em>Steal a Pokémon to fill it.</em>
      </div>`).join('')}
    </div>

    <div class="roster-foot">
      <div class="foot-note">${icon('flask', 15)} Training Dojo adds +1 to every partner stat per level.</div>
      <div class="foot-note">${icon('cash', 15)} Fence duplicates to free racks and fund the base.</div>
    </div>`;
  }

  Object.assign(U, { rosterView, monCard });
})();
