(function () {
  const R = window.REDLINE;
  const G = R.game;
  const U = R.ui;

  function finishResultAndRender(tab) {
    const s = R.state;
    s.lastResult = null;
    U.resultOpen = false;
    G.save();
    U.closeModal();
    if (tab) U.tab = tab;
    U.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function act(action, id) {
    const s = R.state;
    if (!s && action !== 'start') return;

    switch (action) {
      case 'start': {
        U.startGame();
        break;
      }
      case 'tab': {
        U.setTab(id);
        break;
      }
      case 'facility': {
        const res = G.buyFacility(s, id);
        U.toast(res.msg, res.ok ? 'good' : 'warn');
        U.sound(res.ok ? 'good' : 'bad');
        U.render();
        break;
      }
      case 'expansion': {
        const res = G.buyExpansion(s, id);
        U.toast(res.msg, res.ok ? 'gold' : 'warn');
        U.sound(res.ok ? 'promote' : 'bad');
        U.render();
        if (res.ok && res.all) setTimeout(() => U.expansionComplete(), 260);
        break;
      }
      case 'promote': {
        const info = G.promote(s);
        if (info) {
          U.sound('promote');
          U.showPromotion(info);
          U.render();
        }
        break;
      }
      case 'laylow': {
        const res = G.layLow(s);
        U.toast(res.msg, res.ok ? 'good' : 'warn');
        U.sound(res.ok ? 'good' : 'bad');
        U.render();
        break;
      }
      case 'balls': {
        const res = G.buyBalls(s);
        U.toast(res.msg, res.ok ? 'good' : 'warn');
        U.sound(res.ok ? 'good' : 'bad');
        U.render();
        break;
      }
      case 'reroll': {
        const res = G.rerollBoard(s);
        U.toast(res.msg, res.ok ? 'good' : 'warn');
        U.sound(res.ok ? 'good' : 'bad');
        U.render();
        break;
      }
      case 'mission': {
        U.sound('click');
        U.showPrep(id);
        break;
      }
      case 'prep-select': {
        U.sound('click');
        U.showPrep(U.prepMission, id);
        break;
      }
      case 'launch': {
        const res = G.startHeist(s, id, U.prepPartner);
        if (!res.ok) {
          U.toast(res.msg, 'warn');
          U.sound('bad');
          break;
        }
        U.closeModal();
        U.tab = 'heist';
        U.sound('start');
        U.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      case 'heist': {
        const before = s.heist;
        const res = G.heistAction(s, id);
        if (!res.ok && !s.lastResult) {
          U.toast('That move is not available right now.', 'warn');
          U.sound('bad');
          U.render();
          break;
        }
        if (s.lastResult) {
          const kind = s.lastResult.kind;
          U.tab = 'ops';
          U.sound(kind === 'busted' ? 'bad' : kind === 'retreat' ? 'bad' : s.lastResult.captured ? 'capture' : 'good');
          U.render();
        } else {
          const tone = before && before.lastTone;
          U.sound(tone === 'bad' ? 'bad' : tone === 'capture' ? 'capture' : tone === 'good' ? 'good' : 'click');
          U.render();
        }
        break;
      }
      case 'bail': {
        U.confirmBail();
        break;
      }
      case 'confirm-bail': {
        U.closeModal();
        G.retreat(s);
        U.tab = 'ops';
        U.sound('bad');
        U.render();
        break;
      }
      case 'result-close': {
        finishResultAndRender('ops');
        U.sound('click');
        break;
      }
      case 'result-roster': {
        finishResultAndRender('roster');
        U.sound('click');
        break;
      }
      case 'result-base': {
        finishResultAndRender('base');
        U.sound('click');
        break;
      }
      case 'active': {
        const res = G.setActive(s, id);
        U.toast(res.msg, res.ok ? 'good' : 'warn');
        U.sound(res.ok ? 'good' : 'bad');
        U.render();
        break;
      }
      case 'fence': {
        U.confirmFence(id);
        break;
      }
      case 'confirm-fence': {
        const res = G.fenceMon(s, id);
        U.closeModal();
        U.toast(res.msg, res.ok ? 'gold' : 'warn');
        U.sound(res.ok ? 'good' : 'bad');
        U.render();
        break;
      }
      case 'help': {
        U.sound('click');
        U.helpModal();
        break;
      }
      case 'sound': {
        s.sound = !s.sound;
        G.save();
        if (s.sound) U.sound('click');
        U.toast(s.sound ? 'Sound on.' : 'Sound off.', 'info');
        U.render();
        break;
      }
      case 'erase-save': {
        U.confirmErase();
        break;
      }
      case 'confirm-erase': {
        G.clearSave();
        window.location.reload();
        break;
      }
      case 'go-final': {
        U.closeModal();
        U.tab = 'ops';
        U.render();
        break;
      }
      case 'close-modal': {
        U.closeModal();
        U.render();
        break;
      }
      default:
        break;
    }
  }

  function onClick(event) {
    const el = event.target.closest('[data-action]');
    if (!el) return;
    if (el.disabled) return;
    event.preventDefault();
    act(el.dataset.action, el.dataset.id);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      if (R.state && R.state.lastResult && U.resultOpen) {
        finishResultAndRender('ops');
        return;
      }
      if (U.modalOpen) U.closeModal();
      return;
    }
    if (!R.state || !R.state.heist || U.modalOpen) return;
    if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const map = { '1': 'sneak', '2': 'distract', '3': 'hack', '4': 'smash', '5': 'ball' };
    if (map[event.key]) {
      event.preventDefault();
      act('heist', map[event.key]);
    } else if (event.key === '6') {
      event.preventDefault();
      act('bail');
    }
  }

  function boot() {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);

    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.addEventListener('click', (event) => {
        if (event.target.classList && event.target.classList.contains('modal-backdrop')) {
          if (U.resultOpen) return;
          U.closeModal();
        }
      });
    }

    R.pendingSave = G.load();
    const note = document.getElementById('intro-save');
    if (note) {
      if (R.pendingSave) {
        const s = R.pendingSave;
        note.innerHTML = `<span class="save-dot"></span> Career found · <strong>Rank ${esc(R.RANKS[s.rank].name)}</strong> · Day ${s.day} · ${R.money(s.creds)} <em>Start resumes</em>`;
      } else {
        note.innerHTML = `<span class="save-dot is-new"></span> New career · <strong>Rank Grunt</strong> · one borrowed Meowth <em>Progress saves automatically</em>`;
      }
    }

    if (new URLSearchParams(window.location.search).get('autostart') === '1') {
      setTimeout(() => U.startGame(), 30);
    }
  }

  function esc(v) {
    return String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
