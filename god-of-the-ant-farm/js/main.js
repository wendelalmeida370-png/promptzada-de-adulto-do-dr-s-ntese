'use strict';
// ============================================================
//  Main: game loop, simulation stepping, input, camera,
//  menu, intro, new world / continue, autosave
// ============================================================
(function (G) {
  let N = G.N; const W = G.W;
  G.mapHooks.push(n => { N = n; });
  const M = G.Main = { mode: 'menu', modalOpen: false, lastSpeed: 1 };
  const I = G.Input = { power: null, held: null, keys: {}, mouse: { x: 0, y: 0, down: false, btn: -1, sx: 0, sy: 0, lx: 0, ly: 0, dragged: false, onCanvas: false }, hoverT: 0 };
  G.speed = 1;
  const $ = s => document.querySelector(s);
  let canvas;

  // ------------------------------ world setup ------------------------------
  function spawnPeople(sx, sy, k, civ) {
    const S = G.S;
    const fac = G.Fac.create(civ ? { civ } : { ci: [0, 1, 2, 3][k] });
    const set = G.Village.addSettlement(G.Village.newSettlementName(fac.id), sx, sy, fac.id);
    fac.capital = set.id;
    const cf = G.Village.addBuilding('campfire', Math.floor(sx), Math.floor(sy), set.id, true);
    set.campfire = cf.id; set.lit = true;
    const make = o => {
      let x = sx, y = sy;
      for (let t = 0; t < 10; t++) { const a = G.rr(0, 6.28), r = G.rr(1.3, 2.4); x = sx + Math.cos(a) * r; y = sy + Math.sin(a) * r; if (W.walkableXY(x, y)) break; }
      return G.Vg.create(Object.assign({ x, y, set: set.id }, o));
    };
    const pair = (a, b) => { a.partner = b.id; b.partner = a.id; };
    const first = k === 0 && !civ;
    const mara = make({ name: first ? 'Mara' : undefined, g: 'f', age: 38 }), oren = make({ name: first ? 'Oren' : undefined, g: 'm', age: 41 }); pair(mara, oren);
    const lina = make({ name: first ? 'Lina' : undefined, g: 'f', age: 19, mother: mara.id, father: oren.id }); mara.kids.push(lina.id); oren.kids.push(lina.id);
    make({ name: first ? 'Taren' : undefined, g: 'm', age: 22 });
    const f2 = make({ g: 'f', age: 26 }), m2 = make({ g: 'm', age: 28 }); pair(f2, m2);
    const kid = make({ age: 5, mother: f2.id, father: m2.id }); f2.kids.push(kid.id); m2.kids.push(kid.id);
    const f3 = make({ g: 'f', age: 23 }), m3 = make({ g: 'm', age: 24 }); pair(f3, m3);
    make({ g: 'f', age: 20 }); make({ g: 'm', age: 31 });
    S.stats.couples += 3;
    return fac;
  }
  function setupWorld(seed, opts) {
    opts = Object.assign({ type: 'ilha', size: 64, tribes: 1, temper: 'normal' }, opts || {});
    G.FX.list.length = 0; G.FX.floaters.length = 0; G.FX.bolts.length = 0; G.FX.rings.length = 0; G.FX.glows.length = 0;
    G.setMapSize(opts.size);
    G.Render.setView(0);
    G.Caves && G.Caves.reset(); G.Render.setUnder && G.Render.setUnder(0, true); G.Cinema.reset && G.Cinema.reset();
    G.genWorld(seed, opts);
    const S = G.S;
    S.temper = opts.temper || 'normal';
    G.War.reset();
    G.City && G.City.reset();
    G.Naval && G.Naval.reset();
    G.Siege && G.Siege.reset();
    G.Carnage && G.Carnage.reset();
    G.Life && G.Life.reset();
    G.Powers.resetMiracles && G.Powers.resetMiracles();
    // 'classico' keeps the original nameless tribes; otherwise each people gets a civilization
    const civs = opts.classic ? S.starts.map(() => null) : G.Biome.matchCivs(G.Civ.assign(opts.civs, S.starts.length), S.starts);
    const facs = S.starts.map(([x, y], k) => spawnPeople(x, y, k, civs[k]));
    G.Animals.populate();
    G.Village.forceUpdate();
    G.Politics && G.Politics.init();
    G.Fac.updateTerritory();
    G.Lore && G.Lore.genesis(opts);
    G.Render.buildTerrain(); G.Render.initSky();
    S.popHist = [];
    S.stats.maxPop = S.villagers.size;
    if (facs.length > 1) {
      for (const f of facs) { const c = G.Fac.capitalOf(f.id); const l = G.Politics.ruler(f); G.Village.log(`${f.name}${l ? ', guiad' + G.Fac.oa(f) + ' por ' + l.name + ',' : ''} acendeu sua fogueira em ${c.name}.`, 'campfire', c.cx, c.cy); }
      G.Village.log(`${facs.length} povos despertaram em cantos distantes ${S.mapType === 'arquipelago' ? 'do arquipélago' : S.mapType === 'mar' ? 'de ilhas separadas pelo mar' : S.mapType === 'continente' ? 'do continente' : S.mapType === 'istmo' ? 'das duas terras' : 'da ilha'}. Nenhum sabe dos outros.`, 'eye');
    } else G.Village.log('Onze almas despertaram ao redor de uma fogueira.', 'campfire', S.start[0], S.start[1]);
    return S;
  }
  M.lastOpts = (() => { const d = { type: 'ilha', size: 80, tribes: 3, temper: 'normal', classic: 0, civs: [], clima: 'variado' }; try { return Object.assign(d, JSON.parse(localStorage.getItem('gotaf-setup') || 'null') || {}); } catch (e) { return d; } })();

  // ------------------------------ modes ------------------------------
  M.toMenu = function () {
    G.Cinema.stop(); G.Photo.stop();
    M.mode = 'menu';
    G.UI.showHUD(false); G.UI.select(null); G.UI.setPower(null); G.UI.closeModal();
    setupWorld((Math.random() * 1e9) | 0, { type: 'ilha', size: 64, tribes: 2 });
    const S = G.S;
    G.Render.centerOn(S.start[0], S.start[1], 1.35);
    M.menuBase = [G.Render.cam.x, G.Render.cam.y];
    G.speed = 1;
    $('#menu').classList.remove('hidden', 'fade');
    $('#intro').classList.add('hidden');
    refreshMenu();
  };
  function refreshMenu() {
    const info = G.Save.info();
    const b = $('#btn-continue');
    b.disabled = !info;
    $('#continue-info').textContent = info ? `Dia ${info.day} · ${info.pop} ${info.pop === 1 ? 'habitante' : 'habitantes'} · ${G.ERAS[info.era] || ''}` : 'Nenhum mundo salvo';
  }
  M.newGame = function (opts) {
    G.Audio.init();
    opts = opts || M.lastOpts;
    M.lastOpts = opts; try { localStorage.setItem('gotaf-setup', JSON.stringify(opts)); } catch (e) { }
    G.UI.closeModal(); G.UI.select(null); G.UI.setPower(null);
    setupWorld((Date.now() ^ (Math.random() * 1e9)) >>> 0, opts);
    G.UI.viewFac = G.Fac.all()[0].id;
    const S = G.S;
    $('#menu').classList.add('fade');
    setTimeout(() => $('#menu').classList.add('hidden'), 900);
    G.UI.showHUD(false);
    M.mode = 'intro'; M.introT = 0;
    G.UI.setSpeed(1);
    // camera: from the whole island to the campfire
    G.Render.centerOn(N / 2, N / 2, 0.62 * 64 / N);
    M.introFrom = [G.Render.cam.x, G.Render.cam.y];
    const [fx, fy] = G.Render.proj(S.start[0], S.start[1], W.groundH(S.start[0], S.start[1]));
    M.introTo = [fx, fy - 10];
    const intro = $('#intro'); intro.classList.remove('hidden');
    intro.querySelectorAll('p').forEach(p => p.classList.remove('show'));
    G.Save.save(true);
    // a later start: no intro, the years pass at once (the world lives them, the god watches the map)
    const LATER = { anos30: ['anos30', 'livre'], cidades: ['cidade', 'fartura'], imperios: ['metropole', 'fartura'] };
    if (LATER[opts.start]) { endIntro(); G.Skip.start(LATER[opts.start][0], LATER[opts.start][1], { opening: true }); }
  };
  function endIntro() {
    if (M.mode !== 'intro') return;
    M.mode = 'game';
    const intro = $('#intro');
    intro.querySelectorAll('p').forEach(p => p.classList.remove('show'));
    setTimeout(() => intro.classList.add('hidden'), 700);
    G.Render.cam.x = M.introTo[0]; G.Render.cam.y = M.introTo[1]; G.Render.cam.zoom = G.Render.cam.tz = 2.0;
    G.UI.showHUD(true); G.Minimap.reset();
    setTimeout(() => G.UI.notice(G.Fac.all().length > 1 ? 'Dica: escolha um poder (teclas 1–8, Tab troca a aba) e clique no mapa. R abre o painel dos Reinos.' : 'Dica: escolha um poder na barra de baixo (teclas 1–8, Tab troca a aba) e clique no mapa.', 'eye'), 1500);
  }
  function updateIntro(dt) {
    M.introT += dt;
    const t = M.introT;
    const k = G.easeInOut(G.clamp((t - 0.3) / 8.5, 0, 1));
    const cam = G.Render.cam;
    cam.zoom = cam.tz = G.lerp(0.62 * 64 / N, 2.0, k);
    cam.x = G.lerp(M.introFrom[0], M.introTo[0], k); cam.y = G.lerp(M.introFrom[1], M.introTo[1], k);
    const ps = document.querySelectorAll('#intro p');
    ps[0].classList.toggle('show', t > 0.8 && t < 6.4);
    ps[1].classList.toggle('show', t > 2.6 && t < 6.4);
    ps[2].classList.toggle('show', t > 7.4 && t < 11.8);
    if (t > 12.6) endIntro();
  }
  M.continueGame = function () {
    G.Audio.init();
    G.UI.select(null); G.UI.setPower(null);
    G.FX.list.length = 0; G.FX.floaters.length = 0;
    if (!G.Save.load()) { G.UI.toast('Não foi possível carregar', 'O save parece corrompido ou inexistente.', 'skull'); return; }
    $('#menu').classList.add('fade');
    setTimeout(() => $('#menu').classList.add('hidden'), 700);
    $('#intro').classList.add('hidden');
    M.mode = 'game';
    G.UI.setSpeed(1);
    G.UI.showHUD(true); G.Minimap.reset();
    G.UI.viewFac = (G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id))[0] || {}).id || 0;
    G.UI.notice(`Bem-vindo de volta. Dia ${G.S.day}, ${G.S.villagers.size} habitantes.`, 'eye');
  };

  // ------------------------------ simulation ------------------------------
  function step(dt) {
    const S = G.S;
    S.clock += dt;
    S.time += dt / G.DAY_LEN;
    if (S.time >= 1) {
      S.time -= 1; S.day++;
      (S.popHist = S.popHist || []).push(S.villagers.size); if (S.popHist.length > 500) S.popHist.shift();
      G.Village.onNewDay();
    }
    G.Nature.update(dt);
    G.Village.update(dt);
    G.Vg.updateAll(dt);
    G.Life && G.Life.update(dt);
    G.Carnage && G.Carnage.update(dt);
    G.Animals.updateAll(dt);
    G.Caves && G.Caves.update(dt);
    G.Pets && G.Pets.update(dt);
    G.Powers.update(dt);
    G.Lore && G.Lore.update(dt);
    G.Events.update(dt);
  }
  // at high speed the steps get a little longer and the frame has a time budget:
  // if the world is too big for the machine, the game runs as fast as it can instead of freezing
  function simulate(dt, budget) {
    if (dt <= 0) return 0;
    const base = G.speed >= 16 ? 0.1 : G.speed >= 8 ? 0.075 : 0.05;
    const steps = Math.ceil(dt / base);
    const h = dt / steps;
    const t0 = performance.now(); let done = 0;
    for (let k = 0; k < steps; k++) { step(h); done += h; if (budget && performance.now() - t0 > budget) break; }
    return done;
  }
  G.debug = {
    run(seconds) { const t0 = performance.now(); let s = 0; while (s < seconds) { step(0.05); s += 0.05; } return performance.now() - t0; },
    step,
  };

  // ------------------------------ picking ------------------------------
  const BH = { quarteirao: 70, sobrado: 44, insula: 56, campfire: 12, hut: 26, house: 28, storehouse: 34, farm: 6, well: 22, workshop: 40, temple: 46, monument: 72, cemetery: 10, ruin: 8, quartel: 38, torre: 46, cercado: 10 };
  function pick(px, py, mobileOnly) {
    const S = G.S; const R = G.Render; const cam = R.cam;
    let best = null, bd = 1e9;
    const rad = Math.max(11, 8 * cam.zoom);
    if (R.under && S.ug) return pickUnder(px, py, mobileOnly, rad);
    const test = (e, lift) => {
      const [wx, wy] = R.proj(e.x, e.y, W.groundH(e.x, e.y));
      const [sx, sy] = R.worldPxToScreen(wx, wy - (e.z || 0));
      const d = Math.hypot(px - sx, py - (sy - lift * cam.zoom));
      if (d < rad && d < bd) { bd = d; best = e; }
    };
    for (const v of S.villagers.values()) { if (v.inside || v.held || v.aboard || (v.age < 2 && v.carried)) continue; test(v, v.age < 16 ? 4 : 6); }
    for (const s of S.ships) test(s, 8);
    for (const a of S.animals.values()) { if (a.held) continue; test(a, 3); }
    if (best || mobileOnly) return best;
    // the door of a cave
    if (G.Caves) for (const cv of G.Caves.all()) for (const m of cv.mouths) {
      const [wx, wy] = R.proj(m.x + 0.5, m.y + 0.5, W.groundH(m.x + 0.5, m.y + 0.5)); const [sx, sy] = R.worldPxToScreen(wx, wy - 5);
      if (Math.hypot(px - sx, py - sy) < rad * 1.2) return G.Caves.selectCave(cv);
    }
    let bb = null, bdep = -1e9;
    for (const b of S.buildings.values()) {
      const [cx, cy] = G.Village.center(b); const base = W.maxH(b.x, b.y, b.w, b.h);
      const [wx, wy] = R.proj(cx, cy, base);
      const [sx, sy] = R.worldPxToScreen(wx, wy);
      const hw = (b.w + b.h) * 8 * cam.zoom, top = (BH[b.type] || 20) * cam.zoom, bot = (b.w + b.h) * 4 * cam.zoom;
      if (px > sx - hw && px < sx + hw && py > sy - top - bot * 0.6 && py < sy + bot) {
        // favour the diamond footprint for flat things
        const dep = G.Render.depth(cx, cy) + (b.w + b.h) / 2;
        if (dep > bdep) { bdep = dep; bb = b; }
      }
    }
    if (bb) return bb;
    // the sea's own things: stacks, arches, grottos, blue holes, ice — and from close, the bottom
    if (G.Sea) { const [x, y] = R.screenToTile(px, py); const th = G.Sea.pickThing(x, y, cam.zoom); if (th) return th; }
    return null;
  }
  M.pick = pick;
  // under the ground: the people in the caves, or the cave itself
  function pickUnder(px, py, mobileOnly, rad) {
    const S = G.S; const R = G.Render; const cam = R.cam;
    let best = null, bd = 1e9;
    for (const id of G.Caves.inside) {
      const v = S.villagers.get(id); if (!v || v.age < 2) continue;
      const [wx, wy] = R.proj(v.x, v.y, G.Caves.floorAt(v.x, v.y)); const [sx, sy] = R.worldPxToScreen(wx, wy);
      const d = Math.hypot(px - sx, py - (sy - 6 * cam.zoom)); if (d < rad && d < bd) { bd = d; best = v; }
    }
    if (best || mobileOnly) return best;
    const [x, y] = R.screenToTile(px, py); const U = S.ug;
    // a beast, a glow-worm, a crystal, a painting...
    const th = G.Caves.pickThing(x, y); if (th) return th;
    for (let r = 0; r <= 1; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const tx = Math.floor(x) + dx, ty = Math.floor(y) + dy; if (!W.inb(tx, ty)) continue;
      const cv = G.Caves.at(ty * G.N + tx); if (cv) return G.Caves.selectCave(cv);
    }
    return null;
  }

  // ------------------------------ divine hand ------------------------------
  function grab(e, px, py) {
    if (e.inside || e.dead) return;
    e.held = true; e.air = false;
    if (!e.kind) { G.Vg.endTask(e); e.fear = Math.min(100, e.fear + 22); G.Vg.emote(e, 'fear', 4); e.path = null; }
    else { e.state = 'idle'; e.moving = false; }
    I.held = { e, sx: px, sy: py, hist: [[performance.now(), px, py]] };
    G.Audio.play('grab');
    G.S.stats.powers.hand = (G.S.stats.powers.hand || 0) + 1;
    G.Powers.witness(e.x, e.y, 10, 0, 5);
    if (G.UI.selected !== e) G.UI.select(e);
  }
  function release() {
    const h = I.held; I.held = null; if (!h) return;
    const e = h.e; e.held = false;
    const R = G.Render; const zoom = R.cam.zoom;
    const now = performance.now();
    let old = h.hist[0]; for (const p of h.hist) if (now - p[0] < 110) { old = p; break; }
    const dts = Math.max(0.03, (now - old[0]) / 1000);
    const svx = (h.sx - old[1]) / dts / zoom, svy = (h.sy - old[2]) / dts / zoom; // world px/s
    const Z = 40;
    const [tx, ty] = R.screenToTile(h.sx, h.sy + (8 + Z) * zoom);
    e.x = G.clamp(tx, 0.5, N - 0.5); e.y = G.clamp(ty, 0.5, N - 0.5);
    e.z = Z; e.air = true;
    const hx = svx, hy = svy * 0.5;
    let vx = (hx / 16 + hy / 8) / 2, vy = (hy / 8 - hx / 16) / 2;
    const sp = Math.hypot(vx, vy); if (sp > 9) { vx *= 9 / sp; vy *= 9 / sp; }
    e.vx = vx; e.vy = vy; e.vz = G.clamp(-svy * 0.7, 0, 520) + 30;
    if (Math.hypot(svx, svy) > 500) { G.Powers.witness(e.x, e.y, 10, -2, 10); G.Audio.play('power'); }
  }

  // ------------------------------ input ------------------------------
  function setupInput() {
    canvas = $('#game');
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('mousedown', e => {
      G.Audio.init();
      if (M.mode === 'intro') { endIntro(); return; }
      if (M.mode !== 'game') return;
      const m = I.mouse;
      m.down = true; m.btn = e.button; m.sx = m.lx = e.clientX; m.sy = m.ly = e.clientY; m.dragged = false;
      // the middle button, or Shift with the left, turns the world
      m.turn = e.button === 1 || (e.button === 0 && e.shiftKey); m.turning = false; m.vel = 0; m.t = performance.now();
      if (m.turn) { e.preventDefault(); return; }
      if (e.button === 0 && I.power === 'hand') { const ent = pick(e.clientX, e.clientY, true); if (ent) grab(ent, e.clientX, e.clientY); }
    });
    window.addEventListener('mousemove', e => {
      const m = I.mouse; m.x = e.clientX; m.y = e.clientY; m.onCanvas = e.target === canvas;
      if (I.held) { I.held.sx = e.clientX; I.held.sy = e.clientY; I.held.hist.unshift([performance.now(), e.clientX, e.clientY]); if (I.held.hist.length > 12) I.held.hist.pop(); }
      else if (m.down && m.turn) {
        if (!m.dragged && Math.abs(e.clientX - m.sx) > 4) { m.dragged = true; m.turning = true; G.Render.spinBegin(); G.Cinema.manual(); }
        if (m.turning) { const da = -(e.clientX - m.lx) * 0.0065, tn = performance.now(), dt = Math.max(1, tn - m.t) / 1000; m.t = tn; G.Render.spinBy(da); m.vel = m.vel ? m.vel * 0.5 + (da / dt) * 0.5 : da / dt; }
      }
      else if (m.down) {
        if (!m.dragged && Math.hypot(e.clientX - m.sx, e.clientY - m.sy) > 5) m.dragged = true;
        if (m.dragged) { const cam = G.Render.cam; cam.x -= (e.clientX - m.lx) / cam.zoom; cam.y -= (e.clientY - m.ly) / cam.zoom; cam.follow = 0; cam.target = null; G.Cinema.manual(); }
      }
      m.lx = e.clientX; m.ly = e.clientY;
    });
    window.addEventListener('mouseup', e => {
      const m = I.mouse; if (!m.down) return;
      m.down = false;
      if (m.turn) { if (m.turning) G.Render.spinRelease(m.vel * Math.max(0, 1 - (performance.now() - m.t) / 180)); m.turn = m.turning = false; return; }
      if (I.held) { release(); return; }
      if (M.mode !== 'game' || m.dragged) return;
      if (G.Cinema.on) { if (e.target === canvas) { G.Cinema.stop(); const ent = pick(e.clientX, e.clientY, true); if (ent) G.UI.select(ent); } return; }
      if (G.Photo.on) return;
      click(e.clientX, e.clientY, e.button);
    });
    canvas.addEventListener('dblclick', e => {
      if (M.mode !== 'game' || I.power || G.Cinema.on || G.Photo.on) return;
      const ent = pick(e.clientX, e.clientY, true);
      if (ent) { G.UI.select(ent); G.Render.cam.follow = ent.id; }
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (M.mode !== 'game') return;
      G.Cinema.manual();
      const cam = G.Render.cam;
      cam.tz = G.clamp(cam.tz * Math.exp(-e.deltaY * 0.0016), G.Render.minZoom(), 3.6);
      cam.anchor = [e.clientX, e.clientY];
    }, { passive: false });
    window.addEventListener('keydown', e => {
      if (G.Skip && G.Skip.on) { if (e.key === 'Escape' || e.key === ' ') { e.preventDefault(); G.Skip.stop(); } return; }
      if (M.modalOpen && e.key === 'Escape') { G.UI.closeModal(); return; }
      if (M.mode === 'intro') { endIntro(); return; }
      if (M.mode !== 'game') return;
      const k = e.key;
      I.keys[k.toLowerCase()] = true;
      if (M.modalOpen) { if (k === 'Escape') G.UI.closeModal(); return; }
      // photo: the world is frozen; only leaving (and panning with WASD)
      if (G.Photo.on) { if (k === 'Escape' || k === 'p' || k === 'P') G.Photo.stop(); else if (k === 'q' || k === 'Q') G.Render.rotate(-1); else if (k === 'e' || k === 'E') G.Render.rotate(1); else if (k === 'Tab') e.preventDefault(); return; }
      // cinema: only pause, speed, next scene and leaving — the rest would open the interface
      if (G.Cinema.on) {
        if (k === 'Escape' || k === 'c' || k === 'C') G.Cinema.stop();
        else if (k === 'n' || k === 'N') G.Cinema.next();
        else if (k === 'g' || k === 'G') G.Cinema.setWar(G.Cinema.war() ? null : {});
        else if (k === ' ') { e.preventDefault(); if (G.speed === 0) G.UI.setSpeed(M.lastSpeed || 1); else { M.lastSpeed = G.speed; G.UI.setSpeed(0); } }
        else if (k === '+' || k === '=') { const sp = [0, 1, 2, 4, 8, 16]; G.UI.setSpeed(sp[Math.min(sp.length - 1, sp.indexOf(G.speed) + 1)]); }
        else if (k === '-' || k === '_') { const sp = [0, 1, 2, 4, 8, 16]; G.UI.setSpeed(sp[Math.max(0, sp.indexOf(G.speed) - 1)]); }
        else if (k === 'Tab') e.preventDefault();
        return;
      }
      if (k >= '1' && k <= '9') { const p = G.UI.tabPowers()[+k - 1]; if (p) G.UI.setPower(I.power === p.id ? null : p.id); }
      else if (k === 'Tab') { e.preventDefault(); G.UI.nextTab(e.shiftKey ? -1 : 1); }
      else if (k === 'r' || k === 'R') G.UI.openRealms();
      else if (k === 'l' || k === 'L') G.Lore.openBook();
      else if (k === 'm' || k === 'M') G.Minimap.toggle();
      else if (k === 'u' || k === 'U') G.Render.setUnder(!G.Render.under);
      else if (k === 'j' || k === 'J') G.Skip.open();
      else if (k === 'q' || k === 'Q') G.Render.rotate(-1);
      else if (k === 'e' || k === 'E') G.Render.rotate(1);
      else if (k === 'b' || k === 'B') { G.Render.showBorders = !G.Render.showBorders; G.UI.notice(G.Render.showBorders ? 'Fronteiras visíveis.' : 'Fronteiras ocultas.', 'eye'); }
      else if (k === ' ') { e.preventDefault(); if (G.speed === 0) G.UI.setSpeed(M.lastSpeed || 1); else { M.lastSpeed = G.speed; G.UI.setSpeed(0); } }
      else if (k === 'Escape') { if (I.held) release(); else if (I.power) G.UI.setPower(null); else if (G.UI.selected) G.UI.select(null); else G.UI.openPause(); }
      else if (k === 'f' || k === 'F') { const s = G.UI.selected; if (s && s.x !== undefined && !s.type && !s.dead) G.Render.cam.follow = G.Render.cam.follow === s.id ? 0 : s.id; }
      else if (k === 'h' || k === 'H') G.UI.toggleChronicle();
      else if (k === 'c' || k === 'C') { if (I.held) release(); G.Cinema.start(); }
      else if (k === 'g' || k === 'G') { if (I.held) release(); G.Cinema.start({ war: 1 }); }
      else if (k === 'p' || k === 'P') { if (I.held) release(); G.Photo.start(); }
      else if (k === 't' || k === 'T') { const s = G.UI.selected; if (s && !s.type && !s.kind) G.UI.openTree(s.id); }
      else if (k === '+' || k === '=') { const sp = [0, 1, 2, 4, 8, 16]; G.UI.setSpeed(sp[Math.min(sp.length - 1, sp.indexOf(G.speed) + 1)]); }
      else if (k === '-' || k === '_') { const sp = [0, 1, 2, 4, 8, 16]; G.UI.setSpeed(sp[Math.max(0, sp.indexOf(G.speed) - 1)]); }
    });
    window.addEventListener('keyup', e => { I.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', () => { I.keys = {}; });
    // touch
    let tStart = null, pinch = null;
    canvas.addEventListener('touchstart', e => {
      e.preventDefault(); G.Audio.init();
      if (M.mode === 'intro') { endIntro(); return; }
      if (M.mode !== 'game') return;
      if (e.touches.length === 2) {
        const [a, b] = e.touches; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: G.Render.cam.tz, a: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX), acc: 0, turning: false, vel: 0, t: performance.now() }; tStart = null; return;
      }
      const t = e.touches[0]; tStart = { x: t.clientX, y: t.clientY, lx: t.clientX, ly: t.clientY, moved: false };
      if (I.power === 'hand') { const ent = pick(t.clientX, t.clientY, true); if (ent) grab(ent, t.clientX, t.clientY); }
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (pinch && e.touches.length === 2) {
        const [a, b] = e.touches; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        // the twist of the two fingers turns the world with them (once it is clearly a twist, not a pinch)
        const ang = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX); let da = ang - pinch.a; pinch.a = ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        const tn = performance.now(), dt = Math.max(1, tn - pinch.t) / 1000; pinch.t = tn;
        if (!pinch.turning) { pinch.acc += da; if (Math.abs(pinch.acc) > 0.13 && d > 40) { pinch.turning = true; G.Render.spinBegin(); G.Render.spinBy(pinch.acc); pinch.vel = 0; } }
        else { G.Render.spinBy(da); pinch.vel = pinch.vel ? pinch.vel * 0.5 + (da / dt) * 0.5 : da / dt; }
        G.Render.cam.tz = G.clamp(pinch.z * d / pinch.d, G.Render.minZoom(), 3.6);
        if (!pinch.turning) G.Render.cam.anchor = [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2];
        G.Cinema.manual(); return;
      }
      const t = e.touches[0]; if (!tStart) return;
      if (I.held) { I.held.sx = t.clientX; I.held.sy = t.clientY; I.held.hist.unshift([performance.now(), t.clientX, t.clientY]); if (I.held.hist.length > 12) I.held.hist.pop(); return; }
      if (Math.hypot(t.clientX - tStart.x, t.clientY - tStart.y) > 8) tStart.moved = true;
      if (tStart.moved) { const cam = G.Render.cam; cam.x -= (t.clientX - tStart.lx) / cam.zoom; cam.y -= (t.clientY - tStart.ly) / cam.zoom; cam.follow = 0; G.Cinema.manual(); }
      tStart.lx = t.clientX; tStart.ly = t.clientY;
    }, { passive: false });
    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      if (I.held) { release(); tStart = null; return; }
      if (pinch && e.touches.length < 2) { if (pinch.turning) G.Render.spinRelease(pinch.vel * Math.max(0, 1 - (performance.now() - pinch.t) / 180)); pinch = null; return; }
      if (tStart && !tStart.moved && M.mode === 'game') { if (G.Cinema.on) { G.Cinema.stop(); const ent = pick(tStart.x, tStart.y, true); if (ent) G.UI.select(ent); } else if (!G.Photo.on) click(tStart.x, tStart.y, 0); }
      tStart = null;
    }, { passive: false });
    canvas.addEventListener('touchcancel', () => { if (pinch && pinch.turning) G.Render.spinRelease(0); pinch = null; tStart = null; if (I.held) release(); });
    // menu buttons
    $('#btn-new').onclick = () => { G.Audio.init(); G.Audio.play('click'); G.UI.openSetup(); };
    $('#btn-continue').onclick = () => { G.Audio.init(); G.Audio.play('click'); M.continueGame(); };
    $('#btn-howto').onclick = () => { G.Audio.init(); G.Audio.play('click'); G.UI.openHelp(); };
    $('#intro').addEventListener('click', () => endIntro());
    document.addEventListener('visibilitychange', () => { if (document.hidden && M.mode === 'game') G.Save.save(true); });
    window.addEventListener('pagehide', () => { if (M.mode === 'game') G.Save.save(true); });
  }
  function click(px, py, btn) {
    const R = G.Render;
    if (btn === 2) { if (I.power) G.UI.setPower(null); else G.UI.select(null); return; }
    if (btn !== 0) return;
    if (I.power && I.power !== 'hand') {
      if (R.under && !(G.Powers.byId(I.power) || {}).under) { G.UI.notice('Volte à superfície (U) para usar este poder.', 'eye'); return; }
      const [x, y] = R.screenToTile(px, py);
      if (G.Powers.cast(I.power, x, y)) { G.UI.update(1, true); G.Render.shake(0.05); if (G.S.faith < G.Powers.byId(I.power).cost) G.UI.setPower(null); }
      else G.UI.notice(G.S.faith < G.Powers.byId(I.power).cost ? 'Fé insuficiente para este poder.' : (G.Powers.why || 'Não é possível usar isso aí.'), 'eye');
      return;
    }
    if (I.power === 'hand') return;
    const ent = pick(px, py);
    G.UI.select(ent);
    if (!ent) { const [x, y] = R.screenToTile(px, py); if (W.inb(x, y)) G.FX.ring(x, y, 0.05, 0.45, 0.45, 'rgba(255,255,255,0.8)', 1.2); }
  }

  // ------------------------------ loop ------------------------------
  let lastT = performance.now(), saveT = 0, hoverT = 0;
  function loop(now) {
    const rdt = Math.min(0.1, Math.max(0, (now - lastT) / 1000)); lastT = now;
    // the years are being skipped: the world only lives, nothing is drawn
    if (G.S && G.Skip && G.Skip.on) { G.Skip.frame(rdt); requestAnimationFrame(loop); return; }
    if (G.S) {
      const cam = G.Render.cam;
      let sp = G.speed;
      if (M.mode === 'menu') {
        sp = 1;
        const t = now / 1000;
        cam.x = M.menuBase[0] + Math.sin(t * 0.06) * 170; cam.y = M.menuBase[1] + Math.cos(t * 0.045) * 70;
      } else if (M.mode === 'intro') { sp = 1; updateIntro(rdt); }
      if (M.modalOpen && M.mode === 'game') sp = 0;
      const want = rdt * sp;
      // the simulation may use most of the frame at 8x and 16x, never all of it
      const dt = simulate(want, sp >= 8 ? 38 : sp > 2 ? 60 : 0);
      if (sp >= 8 && rdt > 0) { M.realSpeed = (M.realSpeed || sp) * 0.95 + (dt / rdt) * 0.05; } else M.realSpeed = sp;
      // keyboard panning
      if (M.mode === 'game' && !M.modalOpen) {
        const k = I.keys; const v = 520 * rdt / cam.zoom;
        let dx = 0, dy = 0;
        if (k.w || k.arrowup) dy -= v; if (k.s || k.arrowdown) dy += v; if (k.a || k.arrowleft) dx -= v; if (k.d || k.arrowright) dx += v;
        if (dx || dy) { cam.x += dx; cam.y += dy; cam.follow = 0; cam.target = null; }
      }
      if (M.mode === 'game') { G.Cinema.tick(rdt); G.Cinema.update(rdt); G.Photo.update(rdt); }
      G.Render.update(rdt, dt);
      G.FX.update(dt > 0 ? dt : 0, rdt);
      G.Sky && G.Sky.update(dt > 0 ? dt : 0, rdt);
      // hover & preview
      hoverT -= rdt;
      if (M.mode === 'game' && hoverT <= 0 && !I.mouse.down && !G.Cinema.on && !G.Photo.on) {
        hoverT = 0.05;
        const m = I.mouse;
        if (m.onCanvas) {
          if (I.power && I.power !== 'hand') { const [x, y] = G.Render.screenToTile(m.x, m.y); G.Render.preview = { power: I.power, x, y }; G.Render.hover = null; }
          else { G.Render.preview = null; G.Render.hover = pick(m.x, m.y, I.power === 'hand'); }
          canvas.style.cursor = I.held ? 'grabbing' : I.power === 'hand' ? (G.Render.hover ? 'grab' : 'default') : I.power ? 'crosshair' : (G.Render.hover ? 'pointer' : 'default');
        } else { G.Render.hover = null; G.Render.preview = null; }
      }
      G.Render.frame(rdt);
      G.Render.perfSample(rdt);
      G.Audio.update(rdt);
      if (M.mode === 'game') {
        G.UI.update(rdt);
        G.Minimap.update(rdt);
        saveT += rdt; if (saveT > 45) { saveT = 0; G.Save.save(true); }
      }
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('load', () => {
    G.Render.init($('#game'));
    G.UI.init();
    G.Cinema.init();
    G.Photo.init();
    G.Minimap.init();
    setupInput();
    M.toMenu();
    requestAnimationFrame(loop);
    // fonts can load late; redraw texts
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { });
  });
})(window.G);
