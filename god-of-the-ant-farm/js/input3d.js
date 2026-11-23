'use strict';
// ============================================================
//  Input3D: the hands of the player in the body — the keys, the
//  mouse, a game controller, the fingers — turned into wishes
//  (walk this way and this fast, run, jump, dodge, use) for the
//  controller and the camera. The keys are bindings, not letters
//  written in the code: one table of actions, each with its keys
//  — the mouse's buttons and wheel among them (mouse0, mouse1,
//  mouse2, wheelup, wheeldown) — and its controller buttons
//  (pad0…pad16, the standard mapping), changeable by the player
//  and kept in this browser. The listeners are put on once, when
//  the 3D view first opens, and only listen while the body is
//  being lived (nothing piles up however many times one goes
//  down and up again). Nothing here touches the world.
//  (20b, D-339, D-355 to D-369: the controller polled each frame,
//  analog sticks with dead zones and curves; the fingers' stick
//  analog too, and the buttons of the screen by context, from a
//  registry; the mouse given back after a panel without another
//  click where the browser lets it; no key left held when the
//  window loses the focus.)
// ============================================================
(function (G) {
  const In = G.Input3D = { down: {}, onAction: null, locked: false, touch: false, device: 'kb', walk: false };
  // the actions and their default keys (e.key, lower case; the mouse's: mouse0 the left button, mouse1 the middle, mouse2 the
  // right, mouse3 and mouse4 the side ones, wheelup and wheeldown)
  const ACTIONS = In.ACTIONS = [
    ['frente', 'Andar para a frente', ['w', 'arrowup']], ['tras', 'Andar para trás', ['s', 'arrowdown']], ['esquerda', 'Andar para a esquerda', ['a', 'arrowleft']], ['direita', 'Andar para a direita', ['d', 'arrowright']],
    ['correr', 'Disparar (segurar)', ['shift']], ['andar', 'Andar devagar / trotar (alternar)', ['capslock']], ['pular', 'Pular / subir na borda', [' ']], ['interagir', 'Interagir', ['e']], ['agachar', 'Agachar / levantar', ['c']], ['sentar', 'Sentar no chão / levantar', ['x']], ['acenar', 'Acenar', ['v']], ['dancar', 'Dançar / parar', ['b']],
    ['ficha', 'Quem sou eu', ['tab']], ['diario', 'Diário de Vida', ['j']], ['tela', 'Mostrar / esconder a tela', ['h']], ['deus', 'Voltar ao Modo Deus', ['g']], ['menu', 'Menu / pausa', ['escape']],
    // (the gameplay base, D-339: the bag and the quick things — JOGABILIDADE.md; the fight's and the hands' actions come with
    // their modules, by In.def)
    ['inventario', 'Inventário e equipamento', ['i']], ['rapido1', 'Atalho 1', ['1']], ['rapido2', 'Atalho 2', ['2']], ['rapido3', 'Atalho 3', ['3']], ['rapido4', 'Atalho 4', ['4']], ['rapido5', 'Atalho 5', ['5']],
    // (the movement's and the second wave's, 20b: the dodge, the target held, the other shoulder; the second verb, the blow, the
    // guard, the weapon put away or drawn — keys that fight nothing: no Ctrl (Ctrl+W shuts the tab), no Alt (it takes the focus))
    ['esquivar', 'Esquivar', ['q']], ['travar', 'Travar a mira num alvo', ['mouse1', 'z']], ['ombro', 'Trocar o ombro da câmera', ['t']],
    // (the interiors 2.0, D-731: the room seen from over its cut ceiling, asked and given back by the player — Cam3D.vista)
    ['vista', 'Vista da sala (de cima, dentro de casa)', ['o']],
    ['outra', 'Outra ação (o segundo verbo)', ['f']], ['atacar', 'Atacar', ['mouse0']], ['defender', 'Defender / mirar', ['mouse2']], ['guardar', 'Guardar / sacar a arma', ['r']],
  ];
  // (the controller's buttons, the standard mapping: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Back, 9 Start, 10 the left stick
  // pressed, 11 the right one, 12–15 the cross, 16 the middle button)
  const PAD0 = {
    pular: ['pad0'], esquivar: ['pad1'], interagir: ['pad2'], outra: ['pad3'], agachar: ['pad4'], guardar: ['pad5'], defender: ['pad6'], atacar: ['pad7'],
    inventario: ['pad8'], menu: ['pad9'], correr: ['pad10'], travar: ['pad11'], rapido1: ['pad12'], rapido2: ['pad15'], rapido3: ['pad13'], rapido4: ['pad14'],
  };
  const DEF = {}; for (const [a, , k] of ACTIONS) DEF[a] = k.slice();
  let binds = JSON.parse(JSON.stringify(DEF)); const kept = new Set(); let saved = null;
  try { const o = JSON.parse(localStorage.getItem('gotaf-keys') || 'null'); if (o && typeof o === 'object') { saved = o; for (const a in DEF) if (Array.isArray(o[a]) && o[a].every(k => typeof k === 'string')) { binds[a] = o[a].slice(0, 3); kept.add(a); } } } catch (e) { }
  // (a key does one thing: an action that came after the keys were kept — the kept table has none for it — gives up a key
  // the player had already given to another)
  for (const a in DEF) if (!kept.has(a)) binds[a] = binds[a].filter(k => !Object.keys(binds).some(b => b !== a && binds[b].includes(k)));
  In.binds = () => binds;
  let pads = JSON.parse(JSON.stringify(PAD0));
  try { const o = JSON.parse(localStorage.getItem('gotaf-pad') || 'null'); if (o && typeof o === 'object') for (const a in o) if (Array.isArray(o[a]) && o[a].every(k => /^pad\d+$/.test(k))) pads[a] = o[a].slice(0, 2); } catch (e) { }
  In.padBinds = () => pads;
  // an action a module brings (the fight, the hands — D-339): its keys as kept in this browser, or its own defaults less those
  // another action already has; nothing if it exists. A controller button too, the same way (pad)
  In.def = function (a, label, keys, pad) {
    if (DEF[a]) return false;
    ACTIONS.push([a, label, keys.slice()]); DEF[a] = keys.slice();
    const k = saved && Array.isArray(saved[a]) && saved[a].every(q => typeof q === 'string') ? saved[a].slice(0, 3) : null;
    binds[a] = k || keys.filter(q => !Object.keys(binds).some(b => binds[b].includes(q)));
    if (pad && !pads[a]) pads[a] = pad.filter(q => !Object.keys(pads).some(b => pads[b].includes(q)));
    return true;
  };
  // who listens to an action (D-339): on(a, f) for the press — f(a) returning true takes it from the default handling —, onUp(a,
  // f) for the letting go; the press reaches them only while the body is lived and the menu shut (modes.js), the letting go always
  const subs = {}, subsUp = {};
  In.on = (a, f) => { (subs[a] || (subs[a] = [])).push(f); };
  In.onUp = (a, f) => { (subsUp[a] || (subsUp[a] = [])).push(f); };
  In.fire = function (a) { const L = subs[a]; let took = false; if (L) for (const f of L) if (f(a)) took = true; return took; };
  const fireUp = a => { const L = subsUp[a]; if (L) for (const f of L) f(a); };
  const KEYN = { ' ': 'Espaço', shift: 'Shift', control: 'Ctrl', alt: 'Alt', tab: 'Tab', escape: 'Esc', enter: 'Enter', arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', backspace: '⌫', capslock: 'Caps Lock',
    mouse0: 'Clique esquerdo', mouse1: 'Botão do meio', mouse2: 'Clique direito', mouse3: 'Botão lateral 1', mouse4: 'Botão lateral 2', wheelup: 'Roda para cima', wheeldown: 'Roda para baixo' };
  const PADN = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3', '↑ (cruz)', '↓ (cruz)', '← (cruz)', '→ (cruz)', 'Guia'];
  In.keyName = k => KEYN[k] || (/^pad\d+$/.test(k) ? PADN[+k.slice(3)] || k : k.toUpperCase());
  // (the keys of an action, as the screen says them: the controller's when it is the one in the hands)
  In.label = a => (In.device === 'pad' && pads[a] && pads[a].length ? pads[a] : binds[a] || []).map(In.keyName).join(' / ');
  In.keyLabel = a => (binds[a] || []).map(In.keyName).join(' / ');
  In.padLabel = a => (pads[a] || []).map(In.keyName).join(' / ');
  In.rebind = function (a, k) {
    if (!DEF[a] || !k) return false;
    if (/^pad\d+$/.test(k)) return In.rebindPad(a, k);
    // (a key does one thing: taken from any other action that had it; the new key replaces the action's first key,
    // the second one — the arrows beside WASD — stays)
    for (const b in binds) binds[b] = binds[b].filter(x => x !== k);
    binds[a] = [k].concat((binds[a] || []).slice(1).filter(x => x !== k)).slice(0, 2);
    try { localStorage.setItem('gotaf-keys', JSON.stringify(binds)); } catch (e) { }
    return true;
  };
  In.rebindPad = function (a, k) {
    if (!DEF[a] || !/^pad\d+$/.test(k)) return false;
    for (const b in pads) pads[b] = pads[b].filter(x => x !== k);
    pads[a] = [k];
    try { localStorage.setItem('gotaf-pad', JSON.stringify(pads)); } catch (e) { }
    return true;
  };
  In.resetBinds = () => { binds = JSON.parse(JSON.stringify(DEF)); pads = JSON.parse(JSON.stringify(PAD0)); try { localStorage.removeItem('gotaf-keys'); localStorage.removeItem('gotaf-pad'); } catch (e) { } };
  const actionOf = k => { const T = /^pad\d+$/.test(k) ? pads : binds; for (const a in T) if (T[a].includes(k)) return a; return null; };
  In.actionOf = actionOf;
  let waiting = null; // (the action being given a new key)
  In.listen = (a, cb) => { waiting = { a, cb, t: performance.now() }; };
  In.listening = () => !!waiting;
  // (a key given to an action while one is being listened for: the next key, button or controller button)
  function take(k) { const w = waiting; waiting = null; if (k !== 'escape') In.rebind(w.a, k); w.cb && w.cb(); return true; }

  // ------------------------------ one input, of any device ------------------------------
  // (a key, a mouse button, a controller button: its action pressed or let go; the body's own presses — the jump, the dodge, the
  // crouch — are left for the controller's step; the rest go to Modes, which hands them to whoever listens)
  // (fresh: a key's own new press — not a repeat — is a press even if its letting go was never heard: a keyup lost while a dialog or
  // another window had the focus, or never sent)
  function hit(k, isDown, e, fresh) {
    const a = actionOf(k); if (!a) return false;
    const was = !!In.down[a]; In.down[a] = isDown;
    if (isDown && (!was || fresh)) { if (a === 'pular') G.Avatar.input.jump = true; if (In.onAction) In.onAction(a, e); }
    if (!isDown && was) fireUp(a);
    return true;
  }
  In.hit = hit; // (for the proofs: an input as a device gives it)

  // ------------------------------ keys ------------------------------
  // (main.js hands every key here first; true = it was the body's)
  In.key = function (e, isDown) {
    const k = (e.key || '').toLowerCase();
    if (waiting && isDown) { e.preventDefault(); return take(k); }
    In.device = 'kb';
    // (the walk kept to on Caps Lock follows the key's own light — on a Mac its press and its release are one each, D-355)
    if (binds.andar && binds.andar.includes('capslock') && e.getModifierState) { const on = !!e.getModifierState('CapsLock'); const was = In.walk; In.walk = on;
      if (k === 'capslock') { if (on !== was && G.IncUI && G.IncUI.toast) G.IncUI.toast(on ? 'Andando devagar (Caps Lock).' : 'Trotando.', 1.4); return true; } }
    const a = actionOf(k);
    if (k === 'tab' || k === ' ' || (a && a !== 'menu')) e.preventDefault();
    if (!a) return false;
    if (e.repeat && isDown && In.down[a]) return true; // (the key held: its repeats are no new presses)
    hit(k, isDown, e, isDown && !e.repeat);
    return true;
  };
  // (everything held let go at once — a panel that wants the hands, the window losing the focus: each letting go heard, D-355)
  In.release = function () {
    for (const a in In.down) if (In.down[a]) { In.down[a] = false; fireUp(a); }
    In.down = {}; stick = null; look = null; padRun = false; padHeld.fill(false);
    G.IncUI && G.IncUI.stick && G.IncUI.stick(null);
  };
  In.clear = In.release;
  // the wish of the feet, from the keys, the stick of the fingers and the controller's: x right, z ahead, analog (the length of
  // the push is how fast: all of it the jog — D-355); run the sprint asked; walk the walk kept to
  In.axes = function () {
    const d = In.down; let mx = 0, mz = 0;
    if (d.frente) mz += 1; if (d.tras) mz -= 1; if (d.direita) mx += 1; if (d.esquerda) mx -= 1;
    { const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; } }
    if (stick && stick.on) { mx += stick.x; mz += -stick.y; }
    if (padAx.on) { mx += padAx.x; mz += padAx.z; }
    const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
    if (padRun && padAx.m < 0.3) padRun = false; // (the controller's sprint, pressed once, lasts while the stick is pushed)
    return { mx, mz, run: !!d.correr || !!(stick && stick.run) || padRun || !!touchRun, sneak: false, walk: In.walk };
  };

  // ------------------------------ the controller (the Gamepad API, the standard mapping) ------------------------------
  // the sticks: a round dead zone, then the push stretched back to 0–1 — the left as it is (the walk and the jog are in its
  // length), the right on a curve (fine at the middle, quick at the edge); the triggers pressed past half and let go under a third
  const PAD = In.PAD = { dead: 0.2, lookDead: 0.14, lookCurve: 2, trig: 0.5, trigOff: 0.33 };
  const padAx = { x: 0, z: 0, m: 0, on: false }, padHeld = new Array(17).fill(false); let padRun = false, padId = null, touchRun = false;
  const dz = (x, y, d, c) => { const m = Math.hypot(x, y); if (m < d) return [0, 0, 0]; const k = Math.min(1, (m - d) / (1 - d)); const s = Math.pow(k, c || 1) / m; return [x * s, y * s, Math.pow(k, c || 1)]; };
  In.dz = dz; // (for the proofs)
  In.pad = () => (padId ? { id: padId, axes: padAx, held: padHeld.slice(), run: padRun } : null);
  let padFake = null; In.fakePad = p => { padFake = p; }; // (for the proofs: a controller of the proof's own, as navigator.getGamepads gives one)
  In.poll = function (rdt) {
    let gp = padFake;
    if (!gp && typeof navigator !== 'undefined' && navigator.getGamepads) { const L = navigator.getGamepads() || []; for (const p of L) if (p && p.connected && (p.mapping === 'standard' || !gp)) gp = p; }
    if (!gp) { if (padId) { padId = null; padAx.on = false; for (let i = 0; i < padHeld.length; i++) if (padHeld[i]) { padHeld[i] = false; hit('pad' + i, false); } } return; }
    if (padId !== gp.id) { padId = gp.id; G.IncUI && G.IncUI.toast && G.Modes && G.Modes.inc() && G.IncUI.toast('Controle conectado.', 2.4); }
    const ax = gp.axes || [];
    const [lx, ly, lm] = dz(ax[0] || 0, ax[1] || 0, PAD.dead, 1); padAx.x = lx; padAx.z = -ly; padAx.m = lm; padAx.on = lm > 0;
    const [rx, ry, rm] = dz(ax[2] || 0, ax[3] || 0, PAD.lookDead, PAD.lookCurve);
    let used = lm > 0 || rm > 0;
    const live = G.Modes && G.Modes.is('INC') && !G.Modes.panel();
    if (rm > 0 && live) G.Cam3D.lookPad(rx, ry, rdt);
    const B = gp.buttons || [];
    for (let i = 0; i < Math.min(B.length, padHeld.length); i++) {
      const q = B[i]; const v = typeof q === 'object' ? q.value || (q.pressed ? 1 : 0) : +q || 0; const p = typeof q === 'object' && q.pressed;
      // (a trigger by its value alone — the browsers call it pressed from a tenth on —, with its band; a button pressed or past half)
      const on = i === 6 || i === 7 ? (padHeld[i] ? v > PAD.trigOff : v > PAD.trig) : (p || v > 0.5);
      if (on === padHeld[i]) continue; padHeld[i] = on; used = true;
      if (waiting && on) { take('pad' + i); continue; }
      // (the sprint on the stick pressed: a latch, on until the stick lets go — or pressed again)
      if (actionOf('pad' + i) === 'correr') { if (on) padRun = !padRun; continue; }
      hit('pad' + i, on);
    }
    if (used) In.device = 'pad';
  };

  // ------------------------------ mouse and fingers ------------------------------
  let canvas = null, drag = null, stick = null, look = null, want = false;
  const live = () => G.Modes && G.Modes.is('INC') && !G.Modes.panel();
  const lockIt = () => { if (!canvas || In.locked || In.noLock || !canvas.requestPointerLock) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (err) { } };
  // (a panel wants the cursor: the mouse is let go — the keys held stay held: what the panel is for is not the feet — and it is
  // taken back when the panel shuts, without another click where the browser lets it: D-355)
  In.free = function () { if (In.locked) want = true; In.unlock(); };
  In.regain = function () { if (!want) return; want = false; if (G.Modes && G.Modes.is('INC') && !G.Modes.panel()) lockIt(); };
  In.wantsLock = () => want; // (for the proofs)
  In.init = function (cv) {
    if (canvas) return; canvas = cv;
    cv.addEventListener('mousedown', e => {
      if (!live()) return; G.Audio && G.Audio.init && G.Audio.init(); In.device = 'kb';
      if (waiting) return; // (the window's own catch has it)
      // (the left button with the mouse free takes it: the first click is the look, not a blow)
      if (e.button === 0 && !In.locked) { lockIt(); drag = { x: e.clientX, y: e.clientY }; return; }
      if (e.button === 1) e.preventDefault(); // (the middle button: no scrolling of the page)
      hit('mouse' + e.button, true, e);
    });
    window.addEventListener('mouseup', e => { drag = null; if (canvas && In.down) { const a = actionOf('mouse' + e.button); if (a && In.down[a]) hit('mouse' + e.button, false, e); } });
    window.addEventListener('mousemove', e => {
      if (!live()) return;
      if (In.locked) { G.Cam3D.look(e.movementX || 0, e.movementY || 0); return; }
      if (drag) { G.Cam3D.look(e.clientX - drag.x, e.clientY - drag.y); drag.x = e.clientX; drag.y = e.clientY; }
    });
    // (the wheel: an action's, when one has it; else the eye in and out)
    cv.addEventListener('wheel', e => { e.preventDefault(); if (!live() || waiting) return; const k = e.deltaY < 0 ? 'wheelup' : 'wheeldown';
      if (actionOf(k)) { hit(k, true, e); hit(k, false, e); return; } G.Cam3D.zoom(e.deltaY); }, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    // (a button of the mouse or its wheel given to an action from the menu, over the menu itself: caught before the page sees it —
    // and the click that follows is the menu's no more)
    let swallow = false;
    window.addEventListener('mousedown', e => { if (!waiting || performance.now() - waiting.t < 200) return; e.preventDefault(); e.stopPropagation(); swallow = true; take('mouse' + e.button); }, true);
    window.addEventListener('click', e => { if (swallow) { swallow = false; e.preventDefault(); e.stopPropagation(); } }, true);
    window.addEventListener('contextmenu', e => { if (waiting || swallow) e.preventDefault(); }, true);
    window.addEventListener('wheel', e => { if (!waiting || performance.now() - waiting.t < 200) return; e.preventDefault(); take(e.deltaY < 0 ? 'wheelup' : 'wheeldown'); }, { capture: true, passive: false });
    document.addEventListener('pointerlockchange', () => {
      const was = In.locked; In.locked = document.pointerLockElement === canvas;
      // (the browser gives the mouse back on Esc: that is the menu, as the player meant)
      if (was && !In.locked && G.Modes && G.Modes.is('INC') && !G.Modes.panel()) G.Modes.menu(true);
    });
    // (the window losing the focus — another window, a tab, a dialog —: nothing left held, D-355)
    window.addEventListener('blur', () => In.release());
    document.addEventListener('visibilitychange', () => { if (document.hidden) In.release(); });
    // fingers: the left part is the stick, the right part turns the camera
    cv.addEventListener('touchstart', e => {
      if (!live()) return; e.preventDefault(); In.touch = true; In.device = 'touch'; G.IncUI && G.IncUI.touchOn();
      for (const t of e.changedTouches) {
        if (t.clientX < window.innerWidth * 0.45 && !stick) stick = { id: t.identifier, ox: t.clientX, oy: t.clientY, x: 0, y: 0, m: 0, on: true, run: false };
        else if (!look) look = { id: t.identifier, x: t.clientX, y: t.clientY };
      }
      G.IncUI && G.IncUI.stick(stick);
    }, { passive: false });
    cv.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (stick && t.identifier === stick.id) touchStick(stick, t.clientX - stick.ox, t.clientY - stick.oy);
        else if (look && t.identifier === look.id) { G.Cam3D.look((t.clientX - look.x) * 1.4 * (G.Cam3D.OPT.touchSens || 1), (t.clientY - look.y) * 1.4 * (G.Cam3D.OPT.touchSens || 1)); look.x = t.clientX; look.y = t.clientY; }
      }
      G.IncUI && G.IncUI.stick(stick);
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) { if (stick && t.identifier === stick.id) stick = null; if (look && t.identifier === look.id) look = null; } G.IncUI && G.IncUI.stick(stick); };
    cv.addEventListener('touchend', end); cv.addEventListener('touchcancel', end);
  };
  // the fingers' stick: a ring of R pixels; a dead zone at its middle, then the push in its length — a little the walk, the
  // ring's edge the jog —, and past the ring by a third the sprint (D-355)
  const TOUCH = In.TOUCH = { R: 56, dead: 0.12, run: 1.3 };
  function touchStick(s, dx, dy) {
    const R = TOUCH.R; const l = Math.hypot(dx, dy); const k = l > R ? R / l : 1; const m = Math.min(1, l / R);
    const q = m < TOUCH.dead ? 0 : (m - TOUCH.dead) / (1 - TOUCH.dead); const n = l > 1e-6 ? q / m : 0;
    s.x = dx * k / R * n; s.y = dy * k / R * n; s.m = q; s.run = l > R * TOUCH.run; s.vx = dx * k / R; s.vy = dy * k / R; // (vx, vy: where the thumb's knob is drawn)
  }
  In.touchStick = (dx, dy) => { const s = stick || { x: 0, y: 0 }; touchStick(s, dx, dy); return s; }; // (for the proofs)
  In.unlock = () => { if (document.pointerLockElement && document.exitPointerLock) { In.locked = false; document.exitPointerLock(); } };
  // (an on-screen button: the same action as its key — a press (on omitted), held (on true / false))
  In.press = function (a, on) {
    if (on === undefined) { if (a === 'pular') G.Avatar.input.jump = true; if (In.onAction) In.onAction(a); return; }
    const was = !!In.down[a]; In.down[a] = on; if (on && !was && a === 'pular') G.Avatar.input.jump = true;
    if (on && !was && a !== 'pular' && a !== 'correr' && In.onAction) In.onAction(a);
    if (!on && was) fireUp(a);
  };
  // (the run of the fingers' button: a toggle, not a key held — the thumb is on the stick)
  In.touchRun = on => { touchRun = on === undefined ? !touchRun : !!on; return touchRun; };
  // the buttons of the screen for the fingers (D-339, D-355): each a registered action, shown when its moment is — when(), asked a
  // few times a second —, with its label (a word, or a function giving one), held (press and let go) or pressed once, or a toggle
  // whose state on() says; slot: 'acao' (round the right thumb) or 'canto' (the corner). A module brings its own: the second wave
  // the blow and the guard, the bag its button (20c, in its own place on the hotbar)
  const BTN = In.BUTTONS = []; In.btnVer = 0;
  In.button = function (a, o) {
    const k = BTN.findIndex(q => q.a === a); const d = Object.assign({ a, label: a, slot: 'acao', order: 50 }, o || {});
    if (k >= 0) BTN[k] = d; else BTN.push(d); BTN.sort((p, q) => p.order - q.order); In.btnVer++; return d;
  };
  In.unbutton = a => { const k = BTN.findIndex(q => q.a === a); if (k >= 0) { BTN.splice(k, 1); In.btnVer++; } };
  // (the movement's own: the jump, the sprint, the crouch, the dodge, the hands, the target — and the menu in the corner)
  // (under a roof, with nothing to fight — no blow taken, nobody coming at the body, no weapon in its hand —, the run and the
  // fight's three rest: a room is no place to sprint, and five of the eight buttons over the owner's tavern were of a fight, D-733.
  // The screen asks IncUI.calm before it shows one of these)
  In.CALM = { correr: 1, esquivar: 1, atacar: 1, defender: 1 };
  In.button('pular', { label: 'Pular', order: 10 });
  In.button('interagir', { label: () => In.keyLabel('interagir') || 'E', order: 12 });
  In.button('correr', { label: 'Correr', toggle: true, on: () => touchRun, order: 20 });
  In.button('esquivar', { label: 'Esquivar', order: 22, when: () => !!(G.Avatar.state() && G.Avatar.state().ground) });
  In.button('agachar', { label: 'Agachar', toggle: true, on: () => !!(G.Avatar.crouched && G.Avatar.crouched()), order: 30 });
  In.button('travar', { label: 'Travar', toggle: true, on: () => !!(G.Cam3D.locked && G.Cam3D.locked()), order: 40, when: () => !!(G.Cam3D.locked && G.Cam3D.locked()) || !!(G.Modes && G.Modes.lockCandidate && G.Modes.lockCandidate()) });
  // (the «Vista da sala»: only under a roof — lit while the eye is over the room)
  In.button('vista', { label: 'Vista', toggle: true, on: () => !!(G.Cam3D.vistaOn && G.Cam3D.vistaOn()), order: 36, when: () => !!(G.Cam3D.under && G.Cam3D.under()) });
  In.button('menu', { label: '☰', slot: 'canto', order: 90 });
})(window.G);
