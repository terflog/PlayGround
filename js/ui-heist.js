(function () {
  const R = window.REDLINE;
  const G = R.game;
  const U = R.ui;
  const esc = U.esc;
  const icon = U.icon;

  function suspicionLabel(v) {
    if (v <= 29) return { text: 'CLEAN', cls: 'is-clean' };
    if (v <= 59) return { text: 'WATCHFUL', cls: 'is-warm' };
    if (v <= 84) return { text: 'HUNTED', cls: 'is-hot' };
    return { text: 'GOING LOUD', cls: 'is-critical' };
  }

  function tacticFor(stats, h, chance) {
    if (h.distance <= 0) {
      return chance >= 0.6
        ? 'Good odds. Throw now, before a patrol wanders past.'
        : 'The odds are thin. A distraction first would improve the throw.';
    }
    if (stats.stealth >= 5) return 'Stealth is elite. Sneak in, save the distraction for the last stretch.';
    if (stats.tech >= 5) return 'Tech is elite. Hack the cameras early and keep suspicion near zero.';
    if (stats.muscle >= 5) return 'Muscle is elite. Smash through two rooms, then distract the noise away.';
    if (stats.charm >= 5) return 'Charm is elite. Distract once suspicion passes 50, then coast to the target.';
    return 'No single edge. Alternate sneak and hack, and save the partner ability for a bad turn.';
  }

  function actionButton(kind, ic, title, desc, badge, opts = {}) {
    const disabled = Boolean(opts.disabled);
    return `<button class="heist-action ${opts.cls || ''} ${disabled ? 'is-disabled' : ''}" data-action="heist" data-id="${kind}" ${disabled ? 'disabled' : ''} title="${esc(desc)}">
      <span class="ha-key">${opts.key}</span>
      <span class="ha-icon">${icon(ic, 20)}</span>
      <span class="ha-copy"><strong>${esc(title)}</strong><em>${esc(desc)}</em></span>
      <span class="ha-badge ${opts.tone || ''}">${badge}</span>
    </button>`;
  }

  function heistView(s) {
    const h = s.heist;
    const m = h.mission;
    const sp = R.SPECIES[m.target];
    const partner = s.roster.find((x) => x.uid === h.partnerId) || G.activePartner(s);
    const wsp = G.speciesOf(partner);
    const stats = G.partnerStats(partner, s);
    const sec = m.security;
    const drift = 1 + Math.floor(sec / 2);
    const chance = G.captureChance(s, m, partner, h.alert);
    const status = suspicionLabel(h.alert);
    const total = Math.max(1, h.startDistance);
    const done = Math.max(0, total - h.distance);
    const pct = Math.min(100, (done / total) * 100);
    const atTarget = h.distance <= 0;
    const sneakEst = Math.round(Math.max(2, 8 + sec * 2 - stats.stealth * 1.6)) + drift;
    const hackEst = Math.round(6 + sec * 1.2 - stats.tech * 2) + drift;
    const smashEst = Math.round(Math.max(5, 16 + sec * 2 - stats.muscle * 1.8)) + drift;
    const distractDrop = Math.max(1, Math.round(12 + stats.charm * 2.5) - drift);
    const nodes = Array.from({ length: total }, (_, i) => {
      const left = total === 1 ? 0 : (i / (total - 1)) * 100;
      return `<span class="map-node ${i < done ? 'is-done' : ''} ${i === done && !atTarget ? 'is-current' : ''}" style="left:${left}%"></span>`;
    }).join('');
    const tag = m.tag;
    const actionPanel = `<div class="panel action-panel">
      <div class="panel-head"><span class="eyebrow">MOVE</span><span class="turn-count">TURN ${h.turn + 1}</span></div>
      <div class="action-grid">
        ${actionButton('sneak', 'footprints', 'Sneak', 'one room · quiet', `+${sneakEst}`, { key: '1', disabled: atTarget, tone: 'cold' })}
        ${actionButton('distract', 'spark', 'Distract', h.usedAbility ? 'ability spent' : wsp.ability, h.usedAbility ? '—' : `-${distractDrop}`, { key: '2', disabled: h.usedAbility, tone: 'good' })}
        ${actionButton('hack', 'chip', 'Hack', 'one room · cameras', `${hackEst <= 0 ? '' : '+'}${hackEst}`, { key: '3', disabled: atTarget, tone: hackEst <= 0 ? 'good' : 'mid' })}
        ${actionButton('smash', 'fist', 'Smash', 'two rooms · loud', `+${smashEst}`, { key: '4', disabled: atTarget, tone: 'bad' })}
        ${actionButton('ball', 'ball', 'Throw ball', atTarget ? 'capture attempt' : 'reach the target first', atTarget ? R.fmtPct(chance) : '—', {
          key: '5', disabled: !atTarget || h.balls <= 0, cls: 'heist-action--ball', tone: 'gold'
        })}
        <button class="heist-action heist-action--bail" data-action="bail">
          <span class="ha-key">6</span>
          <span class="ha-icon">${icon('back', 20)}</span>
          <span class="ha-copy"><strong>Bail out</strong><em>leave with 22% pay</em></span>
          <span class="ha-badge">safe</span>
        </button>
      </div>
      <div class="action-foot">
        <span>${atTarget ? 'The target is in reach. Make the throw count.' : `${h.distance} room${h.distance === 1 ? '' : 's'} to the target.`}</span>
        <span class="key-hint">KEYS 1–6</span>
      </div>
    </div>`;

    return `<section class="heist-view ${m.final ? 'heist-view--final' : ''}">
      <div class="heist-head">
        <div>
          <div class="eyebrow ${m.final ? 'eyebrow--gold' : ''}">${m.final ? 'THE LAST JOB // NO BACKUP' : 'OPERATION LIVE // ' + esc(m.location)}</div>
          <h1>${esc(m.location)}</h1>
          <p class="view-sub">${esc(m.crewLine)}</p>
        </div>
        <div class="heist-live">
          <span class="live-dot"></span>
          <div><em>SUSPICION</em><strong class="${status.cls}">${status.text}</strong></div>
        </div>
      </div>

      <div class="heist-grid">
        <div class="heist-main">
          <div class="target-band panel" style="--tc:${R.typeColor(sp)}">
            <div class="target-art"><span class="target-halo"></span>${R.sprite(sp, 112)}</div>
            <div class="target-copy">
              <div class="eyebrow">THE MARK</div>
              <div class="target-title"><h2>${esc(sp.name)}</h2>${U.typeBadge(sp)}</div>
              <p>${esc(sp.tagline)}</p>
              <div class="target-meta">
                <span>${icon('shield', 13)} Security ${m.security}/5</span>
                <span>${icon('ball', 13)} Base catch ${R.fmtPct(m.catchRate)}</span>
                ${tag ? `<span class="mission-tag tag--${tag.tone || 'cool'}">${esc(tag.label)}</span>` : ''}
              </div>
            </div>
            <div class="target-chance">
              <em>CAPTURE NOW</em>
              <strong>${R.fmtPct(chance)}</strong>
              <span>${h.balls} ball${h.balls === 1 ? '' : 's'} left</span>
            </div>
          </div>

          <div class="panel map-panel">
            <div class="map-top"><span>ENTRY</span><span class="map-center">${atTarget ? 'POSITION REACHED' : `${h.distance} ROOMS TO TARGET`}</span><span>TARGET</span></div>
            <div class="map-track ${atTarget ? 'is-target' : ''}">
              <span class="map-fill" style="width:${pct}%"></span>
              ${nodes}
              <span class="map-actor" style="left:${pct}%"><i>R</i></span>
              <span class="map-target">${icon('ball', 16)}</span>
            </div>
            <div class="map-legend"><span><i class="legend-dot is-done"></i> Cleared</span><span><i class="legend-dot"></i> Unseen</span><span><i class="legend-dot is-mark"></i> The mark</span></div>
          </div>

          <div class="panel alert-panel ${status.cls}">
            <div class="alert-head">
              <span class="eyebrow">SUSPICION</span>
              <strong>${Math.round(h.alert)}<em>%</em></strong>
            </div>
            <div class="alert-bar">
              <span class="alert-fill" style="width:${h.alert}%"></span>
              <span class="alert-mark" style="left:30%"><em>30</em></span>
              <span class="alert-mark" style="left:70%"><em>70</em></span>
              <span class="alert-mark alert-mark--end" style="left:100%"><em>100</em></span>
            </div>
            <div class="alert-foot">
              ${icon('eye', 14)}
              <span>${h.alert <= 29 ? 'Still clean. Capture chances are at their best.' : h.alert <= 59 ? 'A guard looked twice. Keep it quiet and it stays a look.' : h.alert <= 84 ? 'They know someone is inside. One loud move could end this.' : 'Run. Or make the throw of your life.'}</span>
            </div>
          </div>

          <div class="heist-chips">
            <span class="heist-chip">${icon('footprints', 15)} <em>ROOMS</em><strong>${h.distance}</strong></span>
            <span class="heist-chip">${icon('ball', 15)} <em>BALLS</em><strong>${h.balls}</strong></span>
            <span class="heist-chip" style="--tc:${R.typeColor(wsp)}">${R.sprite(wsp, 28)} <em>PARTNER</em><strong>${esc(wsp.name)}</strong></span>
            <span class="heist-chip ${h.usedAbility ? 'is-spent' : ''}">${icon('spark', 15)} <em>ABILITY</em><strong>${h.usedAbility ? 'SPENT' : 'READY'}</strong></span>
          </div>

          <div class="panel heist-footer">
            <div class="hf-cell">
              <span class="eyebrow">JOB VALUE</span>
              <div class="hf-rewards">
                <span><em>PAYOUT</em><strong>${R.money(m.credits)}</strong></span>
                <span><em>REP</em><strong>+${m.rep}</strong></span>
                <span><em>HEAT</em><strong>+${m.heat}</strong></span>
              </div>
              <span class="hf-note">${m.tag ? esc(m.tag.label) : 'Standard job'} · base capture ${R.fmtPct(m.catchRate)}</span>
            </div>
            <div class="hf-cell">
              <span class="eyebrow">PARTNER EDGE</span>
              <div class="hf-stats">
                ${['stealth', 'muscle', 'tech', 'charm'].map((k) => `<span><em>${k.toUpperCase()}</em><i><b style="width:${Math.min(100, (stats[k] / 12) * 100)}%"></b></i><strong>${stats[k]}</strong></span>`).join('')}
              </div>
              <span class="hf-note">${esc(wsp.ability)} ${h.usedAbility ? '· spent' : '· ready'}</span>
            </div>
            <div class="hf-cell">
              <span class="eyebrow">TACTICAL READ</span>
              <p>${esc(tacticFor(stats, h, chance))}</p>
            </div>
          </div>
        </div>

        <div class="heist-side">
          ${actionPanel}
          <div class="panel log-panel">
            <div class="panel-head"><span class="eyebrow">RUN LOG</span>${icon('clock', 15)}</div>
            <div class="log-list">
              ${h.log.map((l, i) => `<div class="log-entry log--${l.tone || 'neutral'} ${i === 0 ? 'is-new' : ''}"><span class="log-mark"></span><p>${esc(l.text)}</p></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  Object.assign(U, { heistView, suspicionLabel });
})();
