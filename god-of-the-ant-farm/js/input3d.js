'use strict';
// ============================================================
//  Input3D: the hands of the player in the body — the keys, the
//  mouse, the fingers — turned into wishes (walk this way, run,
//  jump, use) for the controller and the camera. The keys are
//  bindings, not letters written in the code: one table of
//  actions, each with its keys, changeable by the player and
//  kept in this browser. The listeners are put on once, when
//  the 3D view first opens, and only listen while the body is
//  being lived (nothing piles up however many times one goes
//  down and up again).
// ============================================================
(function (G) {
  const In = G.Input3D = { down: {}, onAction: null, locked: false, touch: false };
  // the actions and their default keys (e.key, lower case)
  const ACTIONS = In.ACTIONS = [
    ['frente', 'Andar para a frente', ['w', 'arrowup']], ['tras', 'Andar para trás', ['s', 'arrowdown']], ['esquerda', 'Andar para a esquerda', ['a', 'arrowleft']], ['direita', 'Andar para a direita', ['d', 'arrowright']],
    ['correr', 'Correr (segurar)', ['shift']], ['pular', 'Pular', [' ']], ['interagir', 'Interagir', ['e']], ['agachar', 'Andar agachado (segurar)', ['c']], ['sentar', 'Sentar no chão / levantar', ['x']], ['acenar', 'Acenar', ['v']], ['dancar', 'Dançar / parar', ['b']],
    ['ficha', 'Quem sou eu', ['tab']], ['diario', 'Diário de Vida', ['j']], ['deus', 'Voltar ao Modo Deus', ['g']], ['menu', 'Menu / pausa', ['escape']],
  ];
  const DEF = {}; for (const [a, , k] of ACTIONS) DEF[a] = k.slice();
  let binds = JSON.parse(JSON.stringify(DEF));
  try { const o = JSON.parse(localStorage.getItem('gotaf-keys') || 'null'); if (o && typeof o === 'object') for (const a in DEF) if (Array.isArray(o[a]) && o[a].every(k => typeof k === 'string')) binds[a] = o[a].slice(0, 3); } catch (e) { }
  In.binds = () => binds;
  In.keyName = k => ({ ' ': 'Espaço', shift: 'Shift', control: 'Ctrl', alt: 'Alt', tab: 'Tab', escape: 'Esc', enter: 'Enter', arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', backspace: '⌫' })[k] || k.toUpperCase();
  In.label = a => (binds[a] || []).map(In.keyName).join(' / ');
  In.rebind = function (a, k) {
    if (!DEF[a] || !k) return false;
    // (a key does one thing: taken from any other action that had it; the new key replaces the action's first key,
    // the second one — the arrows beside WASD — stays)
    for (const b in binds) binds[b] = binds[b].filter(x => x !== k);
    binds[a] = [k].concat((binds[a] || []).slice(1).filter(x => x !== k)).slice(0, 2);
    try { localStorage.setItem('gotaf-keys', JSON.stringify(binds)); } catch (e) { }
    return true;
  };
  In.resetBinds = () => { binds = JSON.parse(JSON.stringify(DEF)); try { localStorage.removeItem('gotaf-keys'); } catch (e) { } };
  const actionOf = k => { for (const a in binds) if (binds[a].includes(k)) return a; return null; };
  In.actionOf = actionOf;
  let waiting = null; // (the action being given a new key)
  In.listen = (a, cb) => { waiting = { a, cb }; };

  // ------------------------------ keys ------------------------------
  // (main.js hands every key here first; true = it was the body's)
  In.key = function (e, isDown) {
    const k = (e.key || '').toLowerCase();
    if (waiting && isDown) { e.preventDefault(); const w = waiting; waiting = null; if (k !== 'escape') In.rebind(w.a, k); w.cb && w.cb(); return true; }
    const a = actionOf(k);
    if (k === 'tab' || k === ' ' || (a && a !== 'menu')) e.preventDefault();
    if (!a) return false;
    const was = !!In.down[a]; In.down[a] = isDown;
    if (isDown && !was && In.onAction) In.onAction(a);
    if (isDown && a === 'pular' && !was) G.Avatar.input.jump = true;
    return true;
  };
  In.clear = () => { In.down = {}; stick = null; look = null; };
  // the wish of the feet, from the keys or the stick
  In.axes = function () {
    const d = In.down; let mx = 0, mz = 0;
    if (d.frente) mz += 1; if (d.tras) mz -= 1; if (d.direita) mx += 1; if (d.esquerda) mx -= 1;
    if (stick && stick.on) { mx += stick.x; mz += -stick.y; }
    return { mx: G.clamp(mx, -1, 1), mz: G.clamp(mz, -1, 1), run: !!d.correr || !!(stick && stick.run), sneak: !!d.agachar };
  };

  // ------------------------------ mouse and fingers ------------------------------
  let canvas = null, drag = null, stick = null, look = null;
  const live = () => G.Modes && G.Modes.is('INC') && !G.Modes.panel();
  In.init = function (cv) {
    if (canvas) return; canvas = cv;
    cv.addEventListener('mousedown', e => {
      if (!live()) return; G.Audio && G.Audio.init && G.Audio.init();
      if (e.button === 0 && !In.locked && cv.requestPointerLock && !In.noLock) { try { const p = cv.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (err) { } }
      drag = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { drag = null; });
    window.addEventListener('mousemove', e => {
      if (!live()) return;
      if (In.locked) { G.Cam3D.look(e.movementX || 0, e.movementY || 0); return; }
      if (drag) { G.Cam3D.look(e.clientX - drag.x, e.clientY - drag.y); drag.x = e.clientX; drag.y = e.clientY; }
    });
    cv.addEventListener('wheel', e => { e.preventDefault(); if (live()) G.Cam3D.zoom(e.deltaY); }, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      const was = In.locked; In.locked = document.pointerLockElement === canvas;
      // (the browser gives the mouse back on Esc: that is the menu, as the player meant)
      if (was && !In.locked && G.Modes && G.Modes.is('INC') && !G.Modes.panel()) G.Modes.menu(true);
    });
    // fingers: the left half is the stick, the right half turns the camera
    cv.addEventListener('touchstart', e => {
      if (!live()) return; e.preventDefault(); In.touch = true; G.IncUI && G.IncUI.touchOn();
      for (const t of e.changedTouches) {
        if (t.clientX < window.innerWidth * 0.45 && !stick) stick = { id: t.identifier, ox: t.clientX, oy: t.clientY, x: 0, y: 0, on: true, run: false };
        else if (!look) look = { id: t.identifier, x: t.clientX, y: t.clientY };
      }
      G.IncUI && G.IncUI.stick(stick);
    }, { passive: false });
    cv.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (stick && t.identifier === stick.id) { const dx = t.clientX - stick.ox, dy = t.clientY - stick.oy; const r = 56; const l = Math.hypot(dx, dy); const k = l > r ? r / l : 1; stick.x = dx * k / r; stick.y = dy * k / r; stick.run = l > r * 1.35; }
        else if (look && t.identifier === look.id) { G.Cam3D.look((t.clientX - look.x) * 1.4, (t.clientY - look.y) * 1.4); look.x = t.clientX; look.y = t.clientY; }
      }
      G.IncUI && G.IncUI.stick(stick);
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) { if (stick && t.identifier === stick.id) stick = null; if (look && t.identifier === look.id) look = null; } G.IncUI && G.IncUI.stick(stick); };
    cv.addEventListener('touchend', end); cv.addEventListener('touchcancel', end);
  };
  In.unlock = () => { if (document.pointerLockElement && document.exitPointerLock) { In.locked = false; document.exitPointerLock(); } };
  // (an on-screen button: the same action as its key)
  In.press = function (a, on) {
    if (on === undefined) { if (In.onAction) In.onAction(a); if (a === 'pular') G.Avatar.input.jump = true; return; }
    In.down[a] = on; if (on && a === 'pular') G.Avatar.input.jump = true;
  };
})(window.G);
