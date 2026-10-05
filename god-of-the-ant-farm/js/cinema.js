'use strict';
// ============================================================
//  Cinema: a director camera that watches the world by itself.
//  Every second it weighs what is happening — festivals, armies,
//  fleets, births, fires, a shepherd with his flock — and goes
//  there: a soft pan when it is close, a cut through black when
//  it is far, a slow drift while it lingers. The interface hides
//  behind letterbox bars and a caption tells what we are seeing.
// ============================================================
(function (G) {
  const C = G.Cinema = { on: false };
  const W = G.W;
  const $ = s => document.querySelector(s);
  const S = () => G.S;
  const R = () => G.Render;
  const TAU = Math.PI * 2;

  let el = null;
  let shot = null, prevKey = '', evalT = 0, manualT = 0, hintT = 0, statusT = 0, lastSpeed = -1;
  let clock = 0, logN = 0, events = [], seen = new Map(), seenKind = new Map();
  let vx = 0, vy = 0, lz = 0, tvx = 0, tvy = 0, lastTx = null, lastTy = 0;
  let fade = null, cap = { hideAt: 0, showAt: -1, sub: '' };
  let saved = null;

  // ------------------------------ overlay ------------------------------
  C.init = function () {
    const d = document.createElement('div'); d.id = 'cinema';
    d.innerHTML = `<div class="cine-bar top"></div><div class="cine-bar bot"></div>
      <div class="cine-cap"><div class="cine-kick"></div><div class="cine-title"></div><div class="cine-sub"></div></div>
      <div class="cine-hint">Modo cinema · <kbd>N</kbd> próxima cena · <kbd>Espaço</kbd> pausa · <kbd>+</kbd>/<kbd>−</kbd> velocidade · <kbd>Esc</kbd> ou clique para sair</div>
      <div class="cine-status"></div><div class="cine-war"></div><div class="cine-fade"></div>`;
    document.body.appendChild(d);
    el = { root: d, cap: d.querySelector('.cine-cap'), kick: d.querySelector('.cine-kick'), title: d.querySelector('.cine-title'), sub: d.querySelector('.cine-sub'), hint: d.querySelector('.cine-hint'), status: d.querySelector('.cine-status'), fade: d.querySelector('.cine-fade'), war: d.querySelector('.cine-war') };
    window.addEventListener('mousemove', () => { if (C.on) { hintT = 2.6; document.body.classList.remove('cine-nocursor'); } });
    // the fronts bar: one chip per battlefield, so a single war can be followed to its end
    const stop = e => e.stopPropagation();
    el.war.addEventListener('pointerdown', stop); el.war.addEventListener('touchstart', stop, { passive: true }); el.war.addEventListener('touchend', stop);
    el.war.addEventListener('click', e => {
      e.stopPropagation();
      const bt = e.target.closest('button'); if (!bt) return;
      G.Audio && G.Audio.play('click');
      if (bt.dataset.x !== undefined) { C.setWar(null); return; }
      C.setWar({ front: bt.dataset.f || null });
    });
    // the alert: a battle is about to start somewhere — one click to watch it
    const al = document.createElement('div'); al.id = 'war-alert'; al.className = 'hidden';
    al.innerHTML = `<span class="wa-ic">${G.ICON ? G.ICON.sword : ''}</span><span class="wa-txt"><b></b><small></small></span><button class="wa-go">Assistir</button><button class="wa-x" title="Fechar">×</button>`;
    document.body.appendChild(al);
    el.alert = al;
    al.querySelector('.wa-go').onclick = () => { G.Audio && G.Audio.play('click'); const f = alertFront; hideAlert(); C.start({ war: 1, front: f }); };
    al.querySelector('.wa-x').onclick = () => hideAlert();
  };

  C.start = function (opts) {
    if (C.on && opts && opts.war) { C.setWar({ front: opts.front || null }); return; }
    if (C.on || !G.Main || G.Main.mode !== 'game' || !el) return;
    C.on = true; hideAlert();
    war = opts && opts.war ? { front: opts.front || null, quiet: 0 } : null;
    fronts = computeFronts(); uiSig = ''; warUi();
    const Rn = R(), cam = Rn.cam;
    G.UI.select(null); G.UI.setPower(null); G.UI.showHUD(false); $('#tooltip').classList.add('hidden');
    saved = { borders: Rn.showBorders, under: Rn.under };
    Rn.showBorders = false; Rn.hover = null; Rn.preview = null;
    cam.follow = 0; cam.target = null; cam.anchor = null; cam.tz = cam.zoom;
    clock = 0; shot = null; prevKey = ''; evalT = 0.5; manualT = 0; hintT = 4.5; statusT = 0; lastSpeed = G.speed;
    vx = vy = 0; lz = Math.log(cam.zoom); lastTx = null; fade = null;
    // the last few entries of the chronicle are still news
    events = []; logN = Math.max(0, (S().logN || 0) - 3); seen = new Map(); seenKind = new Map();
    el.root.classList.add('on'); el.cap.classList.remove('show'); el.fade.classList.remove('on');
    if (war) { statusT = 0; flash(war.front ? 'Câmera de guerra · ' + frontName(war.front) : 'Câmera de guerra'); }
  };
  C.stop = function () {
    if (!C.on) return;
    C.on = false;
    const Rn = R(), cam = Rn.cam;
    shot = null; fade = null; war = null; el.root.classList.remove('war'); el.war.innerHTML = ''; uiSig = '';
    el.root.classList.remove('on'); el.cap.classList.remove('show'); el.fade.classList.remove('on');
    document.body.classList.remove('cine-nocursor');
    // leaving the film keeps the place it was showing: inside a cave, we stay inside
    if (saved) { Rn.showBorders = saved.borders; }
    cam.follow = 0; cam.target = null; cam.anchor = null; cam.tz = cam.zoom;
    if (G.Main.mode === 'game') G.UI.showHUD(true);
  };
  C.toggle = () => (C.on ? C.stop() : C.start());
  // into the war camera (o = { front }), or back to the whole world (null)
  C.setWar = function (o) {
    if (!C.on) return;
    const was = war ? war.front : undefined;
    war = o ? { front: o.front || null, quiet: 0 } : null;
    uiSig = ''; warUi();
    if (war && was === war.front) return;
    flash(war ? (war.front ? 'Seguindo · ' + frontName(war.front) : 'Câmera de guerra · todas as frentes') : 'Cinema · o mundo todo');
    // cut straight to the war (or away from it)
    if (shot) seen.set(shot.key, clock);
    shot = null; manualT = 0; evalT = 0.1;
  };
  C.war = () => (war ? { front: war.front } : null);
  C.fronts = () => fronts.map(f => ({ key: f.key, name: f.name, phase: f.phase, n: f.n }));
  // the player took the camera: the director waits a little, then takes it back
  C.manual = function () { if (!C.on) return; manualT = 7; shot = null; fade = null; el.fade.classList.remove('on'); hideCap(); };
  C.next = function () { if (!C.on) return; if (shot) seen.set(shot.key, clock); manualT = 0; direct(true); };

  // ------------------------------ subjects ------------------------------
  const vAt = id => () => { const v = S().villagers.get(id); return v && !v.dead && !v.inside && !v.aboard ? [v.x, v.y, 10] : null; };
  const aAt = id => () => { const a = S().animals.get(id); return a && !a.dead ? [a.x, a.y, 5] : null; };
  const shipAt = id => () => { const s = S().ships.find(o => o.id === id); return s ? [s.x, s.y, 8] : null; };
  const place = (x, y) => (G.Village.nearSettlementName(x, y) || 'Os ermos');
  const facName = id => { const f = G.Fac.get(id); return f ? f.name : ''; };
  const trim = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
  // a town fits the frame: iso tiles are 32 px wide and 16 px tall
  const zoomFit = r => { r = Math.max(3, r); return G.clamp(Math.min(0.62 * R().VH / (22 * r), 0.8 * R().VW / (45 * r)), R().minZoom() * 1.05, 1.8); };
  const kickOf = (...a) => a.filter(Boolean).join(' · ');

  // festivals: what each stage looks like, and how much it is worth watching
  const STAGE = { gather: 'o povo se reúne', march: 'a procissão', return: 'a procissão de volta', rite: 'o rito', feast: 'o banquete', vigil: 'a noite com os mortos', dance: 'a dança de roda', perform: 'o teatro', race: 'a corrida', wrestle: 'a luta', duel: 'os gladiadores', bout: 'o combate diante da pedra', crown: 'a coroa do campeão', blot: 'o blót', speech: 'o recitador das leis', water: 'a água nova do rio', smash: 'a cerâmica quebrada', dark: 'todos os fogos apagados', newfire: 'o fogo novo', relight: 'os lares reacesos', climb: 'a subida da pirâmide', end: 'a festa' };
  const STAGE_SC = { gather: -22, end: -14, feast: -2, march: 12, return: 2, rite: 12, climb: 18, newfire: 20, dark: 10, duel: 16, bout: 16, race: 12, wrestle: 10, dance: 8, blot: 14, perform: 8, smash: 8, crown: 8, water: 6, speech: 0, vigil: 6, relight: 10 };
  const MOVING = { march: 1, return: 1, race: 1, climb: 1 };
  const LEADS = ['victim', 'bearer', 'athlete', 'gladiator', 'runner', 'leader', 'priest'];
  function festLead(fe) {
    for (const r of LEADS) for (const id of fe.roles[r] || []) { const v = S().villagers.get(id); if (v && !v.dead && !v.inside) return v; }
    return null;
  }
  function festivals(out) {
    if (!G.Fest) return;
    for (const fe of G.Fest.list()) {
      if (!fe.sname) continue;
      const d = G.Fest.DEF[fe.key]; const set = S().settlements.get(fe.set); if (!d || !set) continue;
      const spot = fe.C || fe.A || [set.cx, set.cy];
      const name = (fe.grand ? 'Grandes ' : '') + d.name;
      // what is left of it, in real seconds at this speed: no point arriving for the last minute
      let left = fe.sdur - fe.stT; for (let k = fe.stage + 1; k < fe.plan.length; k++) left += fe.plan[k][1] * fe.len;
      const soon = left / Math.max(1, G.speed) < 5 ? -30 : 0;
      out.push({
        key: 'fest:' + fe.id, kind: 'fest', score: 70 + (d.sacred ? 6 : 0) + (fe.grand ? 10 : 0) + (STAGE_SC[fe.sname] || 0) + Math.min(10, fe.parts.length / 5) + soon,
        zoom: MOVING[fe.sname] ? 1.9 : 2.15, dur: 14,
        pos() { const l = MOVING[fe.sname] && festLead(fe); return l ? [l.x, l.y, 10] : [spot[0], spot[1], 6]; },
        alive: () => G.Fest.list().includes(fe),
        kick: kickOf(set.name, facName(fe.fac)), title: name, subFn: () => G.cap(STAGE[fe.sname] || 'a festa') + ' — ' + d.desc,
      });
    }
  }

  // armies: the host is shown whole — the camera watches where most of it stands
  function centroid(ids, max) {
    const Sv = S().villagers; let x = 0, y = 0, n = 0;
    const step = Math.max(1, Math.floor(ids.length / (max || 16)));
    for (let k = 0; k < ids.length; k += step) { const v = Sv.get(ids[k]); if (v && !v.dead && !v.inside) { x += v.x; y += v.y; n++; } }
    return n ? [x / n, y / n, 8] : null;
  }
  const PHASE = {
    reunir: [46, 'O exército se reúne', 1.8], marcha: [62, 'Em marcha', 1.55], posicao: [58, 'Tomando posição', 1.5], batalha: [96, 'Batalha campal', 1.55],
    invadir: [92, 'O assalto', 1.4], assalto: [92, 'O assalto', 1.4], ataque: [84, 'O ataque', 1.5], retorno: [28, 'A volta para casa', 1.6],
    cercar: [76, 'Cercando a cidade', 1.35], cerco: [62, 'O cerco', 1.3], guerrilha: [72, 'Guerrilha', 1.6],
  };
  function armies(out) {
    if (!G.War) return;
    const Sv = S().villagers;
    for (const b of G.War.bands.values()) {
      const alive = b.members.filter(id => { const v = Sv.get(id); return v && !v.dead; });
      if (alive.length < 3) continue;
      const A = b.army; const tgt = S().settlements.get(b.set);
      let ph = A ? A.phase : b.st; if (b.st === 'retorno') ph = 'retorno';
      if (!A && b.st === 'marcha') ph = 'marcha';
      const P = PHASE[ph] || PHASE.marcha;
      const def = b.goal === 'defesa';
      const siege = !!b.siege || ph === 'cerco';
      let score = P[0] + Math.min(14, alive.length / 6) + (def && ph !== 'batalha' ? -12 : 0) + (siege ? 24 : 0) + (b.loot && ph === 'retorno' && (b.captives || b.loot.food > 20) ? 10 : 0);
      const f = facName(b.fac), en = facName(b.enemy);
      const gen = A && Sv.get(A.gen);
      const title = siege ? `O cerco de ${tgt ? tgt.name : '?'}` : def ? (ph === 'batalha' ? 'Batalha campal' : `A defesa de ${tgt ? tgt.name : '?'}`) : ph === 'invadir' || ph === 'assalto' || ph === 'ataque' ? `O ataque a ${tgt ? tgt.name : '?'}` : P[1];
      const who = `${alive.length} ${alive.length === 1 ? 'soldado' : 'soldados'} de ${f}`;
      const sub = def ? `${who} defendem a cidade contra ${en}` + (A && A.strat ? ` — ${G.Army.STRAT[A.strat]}` : '')
        : ph === 'retorno' ? `${who} voltam para casa` + (b.captives ? ` com ${b.captives} ${b.captives === 1 ? 'cativo' : 'cativos'}` : '')
        : `${who} contra ${en}` + (gen ? `, sob ${gen.g === 'f' ? 'a' : 'o'} ${G.roleName(gen).toLowerCase()} ${gen.name}` : '') + (A && A.strat ? ` — ${G.Army.STRAT[A.strat]}` : '');
      const members = alive;
      // a pitched battle is one scene for both hosts, filmed between them
      const foe = ph === 'batalha' && A && A.foeHost ? G.War.bands.get(A.foeHost) : null;
      out.push({
        key: foe ? 'battle:' + Math.min(b.id, foe.id) + ':' + Math.max(b.id, foe.id) : 'band:' + b.id, kind: 'war', score, front: 'set:' + b.set, zoom: siege ? 1.3 : P[2], dur: ph === 'batalha' || siege ? 16 : 12,
        pos: () => { const a = centroid(members, 18); const o = foe && G.War.bands.has(foe.id) && centroid(foe.members, 18); return a && o ? [(a[0] + o[0]) / 2, (a[1] + o[1]) / 2, 8] : a || o; },
        alive: () => G.War.bands.has(b.id),
        kick: kickOf(tgt && tgt.name, f), title, sub,
        // a second look, closer: the general, or whoever is fighting
        close: () => {
          const g = gen && !gen.dead && !gen.inside ? gen : null;
          const pick = g || Sv.get(members[(Math.random() * members.length) | 0]);
          if (!pick || pick.dead) return null;
          return { kind: 'war', zoom: 2.6, dur: 10, mark: 1, pos: vAt(pick.id), alive: () => G.War.bands.has(b.id) && !!Sv.get(pick.id), kick: title, title: pick.name, subFn: () => `${G.roleName(pick)} — ${G.Vg.taskText(pick)}` };
        },
      });
    }
  }

  // ships
  function fleets(out) {
    for (const s of S().ships) {
      let score = 0, title = '', sub = '';
      const f = facName(s.fac);
      if (s.burn > 0) { score = 84; title = 'Um navio em chamas'; sub = `a tripulação de ${f} luta contra o fogo`; }
      else if (s.st === 'fireship') { score = 88; title = 'O brulote'; sub = `um barco em chamas lançado por ${f} contra a frota inimiga`; }
      else if (s.kind === 'guerra' && s.st === 'hunt') { score = 78; title = 'Batalha naval'; sub = `as galeras de ${f} caçam os navios inimigos`; }
      else if (s.st === 'sail') { score = s.purpose === 'colony' ? 60 : 72; title = s.purpose === 'colony' ? 'Rumo a uma nova terra' : 'Uma frota de invasão'; sub = s.purpose === 'colony' ? `colonos de ${f} atravessam o mar` : `guerreiros de ${f} atravessam o mar para a batalha`; }
      else if (s.st === 'land') { score = 74; title = 'O desembarque'; sub = `os guerreiros de ${f} saltam na praia`; }
      else if (s.kind === 'guerra' && s.st === 'patrol') { score = 30; title = 'Patrulha'; sub = `uma galera de ${f} vigia a costa`; }
      else if (s.kind === 'mercante' && s.st === 'go') { score = 32; title = 'Um navio mercante'; sub = `${f} leva mercadorias para um porto estrangeiro`; }
      else if (s.kind === 'explorador' && s.st !== 'idle') { score = 36; title = 'Explorando o mar'; sub = `um barco de ${f} procura terras desconhecidas`; }
      else if (s.kind === 'pesca' && s.st === 'fish') { score = 24; title = 'Pescadores'; sub = `as redes de ${f} no mar`; }
      if (!score) continue;
      const warish = score > 60;
      out.push({ key: 'ship:' + s.id, kind: warish ? 'war' : 'sea', score, zoom: 1.9, dur: 11, pos: shipAt(s.id), alive: () => S().ships.includes(s), kick: place(s.x, s.y), title, sub, front: !warish || s.purpose === 'colony' ? null : s.target && s.st === 'land' ? 'set:' + s.target : 'mar' });
    }
  }

  // ------------------------------ the war camera ------------------------------
  // A part of the cinema that films nothing but the war: the fronts, the column
  // on the road, the defenders forming up, a flank going round, soldiers hidden
  // in the woods waiting for the enemy, the archers, the rams at the gate.
  let war = null, fronts = [], uiSig = '', warUiT = 0, frontT = 0, cidN = 0;
  let alertT = 0, alertFront = null, alertPri = 0;
  const watched = new Map(), alertCd = new Map();
  const shortFac = id => { const f = G.Fac.get(id); return f ? f.name.split(' ').pop() : '?'; };
  const aliveOf = ids => { const Sv = S().villagers; let n = 0; for (const id of ids) { const v = Sv.get(id); if (v && !v.dead) n++; } return n; };
  function coPos(co) { let x = 0, y = 0, n = 0; for (const v of co.alive || []) if (v && !v.dead && !v.inside) { x += v.x; y += v.y; n++; } return n ? [x / n, y / n, 8] : null; }
  const coAlive = co => (co.alive || []).filter(v => v && !v.dead).length;
  const unitOf = co => { const u = G.Army && G.Army.UNIT[co.kind]; return u ? u.name.toLowerCase() : 'companhia'; };
  function bandPhase(b) { const A = b.army; let ph = A ? A.phase : b.st; if (b.st === 'retorno') ph = 'retorno'; if (!A && b.st === 'marcha') ph = 'marcha'; return ph; }
  const PH_WORD = { reunir: 'reunindo tropas', marcha: 'em marcha', posicao: 'em posição', batalha: 'batalha!', invadir: 'assalto', assalto: 'assalto', ataque: 'ataque', retorno: 'retirada', cercar: 'cercando', cerco: 'cerco', guerrilha: 'guerrilha', emboscada: 'emboscada armada' };
  const HOT = { 'batalha!': 1, assalto: 1, ataque: 1, cerco: 1, 'emboscada armada': 1, 'batalha naval': 1 };
  function computeFronts() {
    const m = new Map();
    if (G.War) for (const b of G.War.bands.values()) {
      const n = aliveOf(b.members); if (n < 2) continue;
      const set = S().settlements.get(b.set); if (!set) continue;
      const def = b.goal === 'defesa', key = 'set:' + set.id;
      let fr = m.get(key);
      if (!fr) m.set(key, fr = { key, set: set.id, name: set.name, att: def ? b.enemy : b.fac, dfn: set.fac, n: 0, heat: -1, phase: '', x: set.cx, y: set.cy });
      if (!def) fr.att = b.fac;
      fr.n += n;
      let ph = bandPhase(b); if (b.army && b.army.strat === 'emboscada' && ph === 'posicao' && b.army.cos.some(co => co.hidden)) ph = 'emboscada';
      const h = (PHASE[ph] || PHASE.marcha)[0] + (b.siege || ph === 'cerco' ? 20 : 0) + (ph === 'emboscada' ? 30 : 0) - (def && ph !== 'batalha' ? 10 : 0);
      if (h > fr.heat) { fr.heat = h; fr.phase = PH_WORD[ph] || ph; }
    }
    // the sea: invasion fleets, galleys on the hunt, a ship on fire
    for (const s of S().ships) {
      const hot = s.burn > 0 || s.st === 'fireship' || (s.kind === 'guerra' && s.st === 'hunt') || ((s.st === 'sail' || s.st === 'land') && s.purpose === 'raid');
      if (!hot) continue;
      let fr = m.get('mar'); if (!fr) m.set('mar', fr = { key: 'mar', name: 'No mar', att: s.fac, dfn: s.enemy || null, n: 0, heat: 58, phase: 'guerra no mar', x: s.x, y: s.y });
      fr.n++; if (s.kind === 'guerra' && s.st === 'hunt') { fr.heat = 80; fr.phase = 'batalha naval'; }
    }
    // a front does not vanish the moment its soldiers regroup or a galley turns home
    const now = performance.now() / 1000;
    for (const f of m.values()) f.seen = now;
    for (const f of fronts) if (!m.has(f.key) && now - (f.seen || 0) < 10) m.set(f.key, f);
    return [...m.values()].sort((a, b) => b.heat - a.heat);
  }
  function frontNear(x, y) {
    let best = null, bd = 24;
    for (const f of fronts) { if (f.key === 'mar') continue; const d = G.dist(x, y, f.x, f.y); if (d < bd) { bd = d; best = f.key; } }
    return best;
  }
  const anyWar = () => G.Fac.all().some(a => G.Fac.all().some(b => a.id < b.id && G.Fac.atWar(a.id, b.id)));
  function frontName(key) { const f = fronts.find(o => o.key === key); return f ? f.name : key === 'mar' ? 'No mar' : 'a batalha'; }

  // the close-ups only the war camera looks for
  function warDetails(out) {
    if (!G.War) return;
    const Sv = S().villagers;
    for (const b of G.War.bands.values()) {
      const set = S().settlements.get(b.set); if (!set) continue;
      const A = b.army, front = 'set:' + b.set, def = b.goal === 'defesa';
      const f = facName(b.fac), en = facName(b.enemy);
      const kick = kickOf(set.name, f), ph = bandPhase(b), n = aliveOf(b.members);
      if (n < 2) continue;
      const gen = A && Sv.get(A.gen), genOk = gen && !gen.dead && !gen.inside;
      const live = () => G.War.bands.has(b.id);
      // the column on the road, filmed from its head
      if (ph === 'marcha' && !def) {
        const leadId = genOk ? gen.id : b.members.find(id => { const v = Sv.get(id); return v && !v.dead && !v.inside; });
        if (leadId) out.push({ key: 'col:' + b.id, kind: 'march', front, score: 72, zoom: 1.55, dur: 12, pos: vAt(leadId), alive: () => live() && bandPhase(b) === 'marcha', kick, title: 'A coluna em marcha',
          subFn: () => { const l = Sv.get(leadId); const d = l ? Math.round(G.dist(l.x, l.y, set.cx, set.cy)) : 0; return `${aliveOf(b.members)} soldados de ${f} na estrada para ${set.name}, a ${d} passos das casas` + (genOk ? ` — à frente, ${G.roleName(gen).toLowerCase()} ${gen.name}` : ''); } });
      }
      if (!A) continue;
      // at home: the defenders take their places (or hide)
      if (def && (A.phase === 'reunir' || A.phase === 'posicao')) {
        const hid = A.cos.filter(co => co.hidden && coAlive(co));
        if (A.strat === 'emboscada' && hid.length) {
          const hp = coPos(hid[0]);
          // who is walking into it?
          let foe = null, fd = 1e9;
          for (const o of G.War.bands.values()) {
            if (o.fac !== b.enemy || o.set !== b.set || bandPhase(o) !== 'marcha') continue;
            const og = o.army ? Sv.get(o.army.gen) : null; const op = og ? [og.x, og.y] : centroid(o.members, 8);
            if (op && hp) { const d = G.dist(op[0], op[1], hp[0], hp[1]); if (d < fd) { fd = d; foe = { o, id: og ? og.id : null }; } }
          }
          const nh = hid.reduce((a, co) => a + coAlive(co), 0);
          out.push({ key: 'amb:' + b.id, kind: 'ambush', front, score: foe && fd < 28 ? 93 : 74, zoom: 2.0, dur: 11, pos: () => coPos(hid[0]), alive: () => live() && hid[0].hidden, kick, title: 'Emboscada',
            subFn: () => (foe && fd < 40 ? `${nh} soldados de ${f} esperam escondidos na mata. ${en} vem pela estrada e ainda não viu nada.` : `${nh} soldados de ${f} se escondem na mata, à espera de ${en}`) });
          if (foe && foe.id && fd < 26) out.push({ key: 'trap:' + foe.o.id, kind: 'march', front, score: 88, zoom: 1.7, dur: 9, pos: vAt(foe.id), alive: () => G.War.bands.has(foe.o.id) && bandPhase(foe.o) === 'marcha' && hid[0].hidden, kick: kickOf(set.name, facName(foe.o.fac)), title: 'Rumo à armadilha',
            sub: `${facName(foe.o.fac)} marcha sem saber que ${f} espera na floresta` });
        } else {
          out.push({ key: 'def:' + b.id, kind: 'defense', front, score: A.phase === 'reunir' ? 66 : 60, zoom: 1.45, dur: 11, pos: () => centroid(b.members, 18), alive: () => live() && (b.army.phase === 'reunir' || b.army.phase === 'posicao'), kick,
            title: A.phase === 'reunir' ? 'As defesas se organizam' : A.strat === 'muralha' ? 'Nas muralhas' : A.strat === 'colina' ? 'No alto da colina' : A.strat === 'rio' ? 'No vau do rio' : 'A linha de defesa',
            sub: `${n} soldados de ${f} esperam ${en}` + (A.strat && G.Army ? ` — ${G.Army.STRAT[A.strat]}` : '') });
        }
      }
      // the ambush is sprung
      if (A.strat === 'emboscada' && A.phase === 'batalha' && (A.bt || 0) < 16) out.push({ key: 'ambush!:' + b.id, kind: 'ambush', front, score: 99, zoom: 1.8, dur: 10, pos: () => centroid(b.members, 18), alive: live, kick, title: 'A emboscada!', sub: `os soldados de ${f} saem da floresta e caem sobre o flanco de ${en}` });
      if (A.phase === 'batalha') {
        for (const co of A.cos) {
          const k = coAlive(co); if (!k) continue;
          const cl = () => live() && coAlive(co) > 0;
          if (co.rout) { out.push({ key: 'rout:' + co.id, kind: 'rout', front, score: 86, zoom: 2.0, dur: 8, pos: () => coPos(co), alive: cl, kick, title: 'A debandada', sub: `os ${unitOf(co)} de ${f} quebram a formação e fogem do campo` }); continue; }
          if (co.order === 'flanquear') out.push({ key: 'flank:' + co.id, kind: 'flank', front, score: 96, zoom: 1.8, dur: 10, pos: () => coPos(co), alive: () => cl() && (co.order === 'flanquear' || co.order === 'carregar'), kick, title: 'O flanco', sub: `${G.cap(unitOf(co))} de ${f} contornam pela ala ${co.wing === 'e' ? 'esquerda' : 'direita'} para cair sobre ${en}` });
          else if (co.order === 'carregar' && co.kind === 'cavalaria') out.push({ key: 'charge:' + co.id, kind: 'flank', front, score: 90, zoom: 2.0, dur: 8, pos: () => coPos(co), alive: cl, kick, title: 'A carga', sub: `a cavalaria de ${f} cai sobre o flanco de ${en}` });
          else if (co.kind === 'arqueiro' && k >= 2) out.push({ key: 'arch:' + co.id, kind: 'archers', front, score: 82, zoom: 2.1, dur: 9, pos: () => coPos(co), alive: cl, kick, title: 'Os arqueiros', sub: `${k} arqueiros de ${f} atiram sobre as linhas de ${en}` });
        }
        if (genOk) out.push({ key: 'gen:' + b.id, kind: 'general', front, score: 76, zoom: 2.5, dur: 9, mark: 1, pos: vAt(gen.id), alive: () => live() && !gen.dead, kick, title: gen.name, subFn: () => `${G.roleName(gen)} de ${f}, no meio da batalha — ${aliveOf(b.members)} soldados ainda de pé` });
      }
      // the siege: engines and the wall
      for (const e of b.engines || []) {
        const word = e.kind === 'ariete' ? 'O aríete' : e.kind === 'torre' ? 'A torre de cerco' : 'A catapulta';
        const sub = e.kind === 'ariete' ? `${f} bate no portão de ${set.name}` : e.kind === 'torre' ? `a torre de ${f} rola contra a muralha de ${set.name}` : `as pedras de ${f} voam sobre as muralhas de ${set.name}`;
        out.push({ key: 'eng:' + e.id, kind: 'engine', front, score: e.moving || e.hit > 0 ? 90 : 80, zoom: 2.2, dur: 9, pos: () => [e.x, e.y, 10], alive: () => !!(b.engines && b.engines.includes(e)), kick, title: word, sub });
      }
      if (b.siege) { const sg = b.siege; out.push({ key: 'wall:' + b.id, kind: 'wall', front, score: 84, zoom: 2.2, dur: 9, pos: () => [sg.x, sg.y, 6], alive: () => b.siege === sg, kick, title: 'Na muralha', sub: `os soldados de ${f} golpeiam a muralha de ${set.name}` }); }
    }
    // where the lines met: the thick of it
    for (const bt of G.War.battles) {
      if (G.War.clock - bt.last > 7) continue;
      if (!bt._cid) bt._cid = ++cidN;
      const tot = Object.values(bt.dead).reduce((a, n) => a + n, 0);
      // the thick of it moves: film the fighters still at it around the first blood
      const hot = () => { let x = 0, y = 0, k = 0; for (const o of G.War.fighters) if (!o.dead && G.dist2(o.x, o.y, bt.x, bt.y) < 196) { x += o.x; y += o.y; k++; } return k >= 2 ? [x / k, y / k, 6] : [bt.x, bt.y, 6]; };
      out.push({ key: 'melee:' + bt._cid, kind: 'melee', front: frontNear(bt.x, bt.y), score: 84 + Math.min(10, tot), zoom: 2.2, dur: 9, pos: hot, alive: () => G.War.clock - bt.last < 12, kick: place(bt.x, bt.y), title: 'Corpo a corpo',
        subFn: () => { const t = Object.values(bt.dead).reduce((a, n) => a + n, 0); return `${t} ${t === 1 ? 'morto' : 'mortos'} até agora` + (bt.names.length ? ` — entre eles ${bt.names.join(', ')}` : ''); } });
    }
  }

  // the bar with the fronts (in war mode), or one chip to go there (in the plain cinema)
  function warUi() {
    if (!el) return;
    let sig, html;
    if (war) {
      sig = 'w|' + (war.front || '') + '|' + fronts.map(f => f.key + ':' + f.phase).join(',');
      if (sig === uiSig) return;
      const ww = G.WorldWar && G.WorldWar.active();
      html = `<button data-x class="cw-t" title="Sair da câmera de guerra (G) e voltar ao cinema do mundo todo">${G.ICON ? G.ICON.sword : ''}<span>${ww ? 'Guerra Mundial' : 'Câmera de guerra'}</span><em>×</em></button>` +
        (fronts.length > 1 ? `<button data-f="" class="${war.front ? '' : 'on'}">Todas as frentes</button>` : '') +
        fronts.map(f => `<button data-f="${f.key}" class="${war.front === f.key ? 'on' : HOT[f.phase] && war.front ? 'hot' : ''}" style="--a:${f.att ? G.Fac.hex(f.att) : '#888'};--d:${f.dfn ? G.Fac.hex(f.dfn) : '#888'}"><i></i><b>${f.key === 'mar' ? 'No mar' : (f.att ? shortFac(f.att) + ' × ' : '') + f.name}</b><small>${f.phase}</small></button>`).join('') +
        '';
    } else {
      sig = 'n|' + fronts.length;
      if (sig === uiSig) return;
      html = fronts.length ? `<button data-f="" class="cw-go">${G.ICON ? G.ICON.sword : ''}Seguir só a guerra <small>${fronts.length} ${fronts.length === 1 ? 'frente' : 'frentes'}</small></button>` : '';
    }
    uiSig = sig; el.war.innerHTML = html;
    el.root.classList.toggle('war', !!war);
  }
  function flash(t) { el.status.textContent = t; el.status.classList.add('show'); statusT = 2.6; cap.flash = t; }

  // outside the cinema: the sword button and the alerts when a battle is about to start
  function hideAlert() { if (el && el.alert) el.alert.classList.add('hidden'); alertT = 0; alertPri = 0; }
  function alertOf(text, sub, front, pri) {
    if (!el || !el.alert || C.on || (G.Photo && G.Photo.on) || G.Main.modalOpen || (G.Skip && G.Skip.on)) return;
    if (alertT > 0 && pri < alertPri) return;
    const ck = front + '|' + text, now = performance.now() / 1000;
    if (now - (alertCd.get(ck) || -1e9) < 60) return;
    alertCd.set(ck, now);
    alertFront = front; alertPri = pri; alertT = pri >= 3 ? 14 : 10;
    el.alert.querySelector('b').textContent = text; el.alert.querySelector('small').textContent = sub || '';
    el.alert.classList.remove('hidden'); el.alert.classList.remove('pop'); void el.alert.offsetWidth; el.alert.classList.add('pop');
    G.Audio && G.Audio.play && G.Audio.play('horn');
  }
  let wwSeen = -1;
  function watch() {
    if (!G.War) return;
    // the world war breaks out: the loudest alert there is
    const ww = G.WorldWar && G.WorldWar.active();
    if (ww && wwSeen !== ww.start) { wwSeen = ww.start; alertOf(`Guerra Mundial: ${ww.name.replace(/^(a|o) /, '')}`, 'o mundo inteiro pegou em armas', null, 5); }
    const seenNow = new Set();
    for (const b of G.War.bands.values()) {
      seenNow.add('b' + b.id);
      const set = S().settlements.get(b.set); if (!set) continue;
      const A = b.army; let ph = bandPhase(b);
      if (A && A.strat === 'emboscada' && ph === 'posicao' && A.cos.some(co => co.hidden)) ph = 'emboscada';
      const old = watched.get('b' + b.id); watched.set('b' + b.id, ph);
      if (old === ph || aliveOf(b.members) < 3) continue;
      const f = facName(b.fac), en = facName(b.enemy), front = 'set:' + b.set, def = b.goal === 'defesa';
      if (ph === 'batalha' && A && A.strat === 'emboscada') alertOf('Emboscada!', `${f} cai sobre ${en} perto de ${set.name}`, front, 4);
      else if (ph === 'batalha') alertOf('Batalha campal', `${f} e ${en} formam as linhas perto de ${set.name}`, front, 4);
      else if (ph === 'cerco') alertOf(`O cerco de ${set.name}`, `${f} cerca a cidade de ${en}`, front, 3);
      else if ((ph === 'invadir' || ph === 'assalto' || ph === 'ataque') && !def) alertOf(`O ataque a ${set.name}`, `${f} avança contra as casas de ${en}`, front, 3);
      else if (ph === 'emboscada') alertOf('Uma emboscada armada', `${f} se esconde na mata à espera de ${en}`, front, 2);
      else if (ph === 'marcha' && !def && old) alertOf(`${shortFac(b.fac)} marcha contra ${set.name}`, `${aliveOf(b.members)} soldados na estrada`, front, 1);
    }
    for (const s of S().ships) {
      if (s.purpose !== 'raid' && !(s.kind === 'guerra' && s.st === 'hunt')) continue;
      const k = 's' + s.id, st = s.st; seenNow.add(k);
      const old = watched.get(k); watched.set(k, st); if (old === st) continue;
      const tg = s.target && S().settlements.get(s.target);
      if (s.purpose === 'raid' && st === 'sail') alertOf('Uma frota de invasão', `${facName(s.fac)} cruza o mar${tg ? ' rumo a ' + tg.name : ''}`, 'mar', 2);
      else if (s.purpose === 'raid' && st === 'land' && tg) alertOf('O desembarque', `${facName(s.fac)} salta na praia perto de ${tg.name}`, 'set:' + tg.id, 3);
      else if (s.kind === 'guerra' && st === 'hunt') alertOf('Batalha naval', `as galeras de ${facName(s.fac)} caçam navios inimigos`, 'mar', 2);
    }
    for (const k of [...watched.keys()]) if (!seenNow.has(k)) watched.delete(k);
  }
  C.tick = function (rdt) {
    if (!el || G.Main.mode !== 'game') return;
    frontT -= rdt;
    if (frontT <= 0) {
      frontT = 0.5;
      if (!C.on) fronts = computeFronts();
      watch();
      const btn = document.getElementById('btn-war');
      if (btn) { const n = fronts.length; btn.classList.toggle('hidden', !n); btn.classList.toggle('ww', !!(G.WorldWar && G.WorldWar.active())); const i = btn.querySelector('i'); if (i && i.textContent !== String(n)) i.textContent = n; }
    }
    if (alertT > 0) { alertT -= rdt; if (alertT <= 0) hideAlert(); }
  };
  C.reset = function () { watched.clear(); alertCd.clear(); fronts = []; hideAlert(); };

  // the chronicle: things that just happened, where they happened
  const EV = {
    meteor: [92, 'Do céu'], bolt: [80, 'Um raio'], wave: [90, 'O mar avança'], mountain: [88, 'A terra se move'], massacre: [88, 'Massacre'], siege: [84, 'Cerco'], sacrifice: [80, 'Sacrifício'],
    fire: [76, 'Fogo!'], plague: [72, 'A peste'], war: [72, 'Guerra'], settle: [74, 'Uma nova aldeia'], wonder: [82, 'Uma maravilha'], monument: [66, 'Um monumento'], temple: [62, 'Um templo'],
    era: [78, 'Uma nova era'], city: [72, 'A cidade cresce'], crown: [68, 'O poder muda de mãos'], tyrant: [70, 'Tirania'], split: [68, 'Um povo se divide'], peace: [60, 'Paz'], ally: [54, 'Aliança'],
    baby: [56, 'Um nascimento'], heart: [52, 'Amor'], grave: [44, 'Uma morte'], skull: [62, 'Uma morte'], chain: [52, 'Cativos'], free: [66, 'Liberdade'], general: [64, 'Um general'],
    wolf: [58, 'Feras'], sick: [50, 'Doença'], heal: [46, 'Cura'], trade: [40, 'Comércio'], envoy: [46, 'Emissários'], prophecy: [64, 'Profecia'], estatua: [56, 'Uma estátua'], aqueduct: [60, 'O aqueduto'],
    wall: [46, 'Muralhas'], ship: [48, 'Um navio'], naval: [72, 'Guerra no mar'], battle: [84, 'Batalha'], army: [70, 'O exército'], theft: [50, 'Roubo'], storm: [58, 'Tempestade'], tech: [46, 'Uma descoberta'], feira: [46, 'A feira'],
    administracao: [44, 'O governo'], coletoria: [40, 'Os impostos'], mercado_negro: [46, 'O mercado negro'], boat: [40, 'Barcos'], road: [30, 'Estradas'], cart: [34, 'Carroças'],
    curral: [34, 'Rebanhos'], estabulo: [36, 'Cavalos'], mina: [36, 'A mina'], forja: [34, 'A forja'], ourives: [34, 'Ouro'], olaria: [32, 'A olaria'], taverna: [34, 'A taverna'],
    tecelagem: [32, 'A tecelagem'], acougue: [30, 'O açougue'], deer: [40, 'A vida selvagem'], flower: [42, 'Fertilidade'], rain: [40, 'Chuva'], lore: [40, 'Lenda'], pop: [40, 'O povo'], campfire: [30, 'Uma fogueira'],
    sea: [58, 'O mar'], saga: [72, 'Uma história'], workshop: [28, 'Uma oficina'], house: [22, 'Casas novas'], hut: [22, 'Cabanas novas'], farm: [20, 'Uma plantação'], storehouse: [22, 'Um celeiro'], well: [22, 'Um poço'], coin: [30, 'Moedas'],
  };
  const WAR_IC = { war: 1, siege: 1, massacre: 1, battle: 1, army: 1, naval: 1, general: 1, chain: 1, skull: 1 };
  function chronicle(out) {
    const H = S().history; const n0 = S().logN || 0;
    if (n0 > logN) {
      for (let k = H.length - 1; k >= 0 && H[k].n > logN; k--) { const e = H[k]; if (e.x !== undefined && EV[e.ic] && e.d >= S().day - 1) events.push({ e, born: clock }); }
      logN = n0;
    }
    events = events.filter(o => clock - o.born < 24);
    for (const o of events) {
      const e = o.e; const [base, word] = EV[e.ic];
      out.push({
        key: 'log:' + e.n, kind: 'log:' + e.ic, score: base - (clock - o.born) * 0.9, zoom: base >= 70 ? 1.7 : 2.3, dur: 10,
        drift: 1, pos: () => [e.x, e.y, 6], alive: () => true, kick: kickOf(place(e.x, e.y), 'Dia ' + e.d), title: word, sub: trim(e.txt, 190), fromLog: true,
        front: WAR_IC[e.ic] ? (e.ic === 'naval' ? 'mar' : frontNear(e.x, e.y)) : null,
      });
    }
  }

  // fire on the map, whether or not someone wrote it down
  function fires(out) {
    const fs = G.Nature && G.Nature.fireSet; if (!fs || !fs.size) return;
    const N = G.N; let pick = -1, town = false;
    for (const i of fs) { const b = S().occ[i] > 0; if (pick < 0 || (b && !town)) { pick = i; town = b; if (b) break; } }
    const x = (pick % N) + 0.5, y = ((pick / N) | 0) + 0.5;
    const nm = G.Village.nearSettlementName(x, y);
    out.push({
      key: 'fire:' + ((x / 12) | 0) + ':' + ((y / 12) | 0), kind: 'fire', score: 54 + Math.min(26, fs.size) + (town ? 12 : 0), zoom: 1.8, dur: 10, drift: 1, pos: () => [x, y, 8], alive: () => fs.size > 0,
      kick: nm || 'Os ermos', title: town && nm ? `Fogo em ${nm}` : 'Incêndio na mata',
      subFn: () => { let k = 0; for (const v of S().villagers.values()) if (v.task && v.task.type === 'fire' && G.dist2(v.x, v.y, x, y) < 400) k++; return `${fs.size} ${fs.size === 1 ? 'foco' : 'focos'} de fogo` + (k ? ` · ${k} ${k === 1 ? 'pessoa luta' : 'pessoas lutam'} contra as chamas` : ''); },
    });
  }

  // everyday life: someone doing something worth a closer look
  const LIFE = {
    court: 46, play: 40, celebrate: 44, social: 32, tavern: 36, pray: 32, fish: 36, herd: 40, fodder: 32, chop: 32, build: 38, mine: 34, minejob: 34, quarry: 32, craft: 36, farm: 30,
    hunt: 46, sell: 36, shop: 30, penwork: 32, slaughter: 30, mint: 36, taxes: 38, steal: 52, drill: 40, patrol: 28, guard: 26, swim: 38, explore: 36, migrate: 42, deliver: 24, haul: 24,
    restock: 22, serve: 30, desk: 26, pave: 30, dig: 30, tend: 30, forage: 28, gather: 26, condemned: 58, escape: 54, flee: 46, fire: 56, hide: 38, visit: 30, citylife: 26, fetch: 24, wander: 16, idle: 10, eat: 18,
    appr: 48, water: 30, corpse: 54, callwork: 46, family: 34,
  };
  function life(out) {
    const all = [...S().villagers.values()]; if (!all.length) return;
    let best = [];
    for (let k = 0; k < Math.min(70, all.length); k++) {
      const v = all[(Math.random() * all.length) | 0];
      if (v.dead || v.inside || v.aboard || v.held || !v.task) continue;
      const tt = v.task.type; let sc = LIFE[tt]; if (sc === undefined) continue;
      if (v.act === 'dance' || v.act === 'mourn') sc += 8;
      if (v.age < 12) sc += 6; if (v.age >= 60) sc += 3;
      if (tt === 'fest' || tt === 'band' || tt === 'combat') continue;
      best.push([sc + Math.random() * 10, v]);
    }
    best.sort((a, b) => b[0] - a[0]);
    for (const [sc, v] of best.slice(0, 3)) {
      out.push({
        key: 'v:' + v.id, kind: 'life', score: sc, zoom: 2.75, dur: 11, mark: 1, pos: vAt(v.id), alive: () => { const q = S().villagers.get(v.id); return !!q && !q.dead; },
        kick: kickOf(place(v.x, v.y), facName(G.Fac.idOfV(v))), title: v.name + (v.age < 1 ? ', recém-nascid' + (v.g === 'f' ? 'a' : 'o') : `, ${Math.floor(v.age)} anos`),
        subFn: () => `${G.roleName(v)} — ${G.Vg.taskText(v)}`,
      });
    }
  }

  // wild animals: a hunt, a herd
  function beasts(out) {
    const all = [...S().animals.values()]; if (!all.length) return;
    let hunt = null, herd = null;
    for (let k = 0; k < Math.min(90, all.length); k++) {
      const a = all[(Math.random() * all.length) | 0];
      if (a.dead || a.dom || a.held) continue;
      const d = G.Animals.DEF[a.kind]; if (!d) continue;
      if (!hunt && a.state === 'chase' && a.target) hunt = a;
      else if (!herd && d.size >= 1 && d.cls !== 'air') herd = a;
      if (hunt && herd) break;
    }
    if (hunt) {
      const d = G.Animals.DEF[hunt.kind]; const prey = S().animals.get(hunt.target) || S().villagers.get(hunt.target);
      const pn = prey ? (prey.kind ? (G.Animals.DEF[prey.kind] || {}).name : prey.name) : null;
      out.push({ key: 'a:' + hunt.id, kind: 'wild', score: 56, zoom: 2.4, dur: 10, mark: 1, pos: aAt(hunt.id), alive: () => !!S().animals.get(hunt.id), kick: place(hunt.x, hunt.y), title: `${d.g === 'f' ? 'A' : 'O'} ${d.name.toLowerCase()} caça`, sub: pn ? `atrás de ${prey.kind ? (G.Animals.DEF[prey.kind].g === 'f' ? 'uma ' : 'um ') + pn.toLowerCase() : pn}` : 'a vida selvagem longe das cidades' });
    }
    if (herd) {
      const d = G.Animals.DEF[herd.kind];
      out.push({ key: 'a:' + herd.id, kind: 'wild', score: 26 + Math.random() * 10, zoom: 2.3, dur: 10, pos: aAt(herd.id), alive: () => !!S().animals.get(herd.id), kick: place(herd.x, herd.y), title: d.name, sub: 'a vida selvagem longe das cidades' });
    }
  }

  // the small hours: stories by the fire, families at the door, the line at the well
  function evenings(out) {
    if (!G.Life) return;
    const Sx = S();
    for (const s of G.Life.tales()) {
      if (!s.begin) continue;
      const set = Sx.settlements.get(s.set); const el = Sx.villagers.get(s.elder); if (!el) continue;
      out.push({ key: 'tale:' + s.set + ':' + s.day, kind: 'tale', score: 68 + s.kids.length * 2, zoom: 2.7, dur: 14, drift: 1, pos: () => [s.x, s.y, 6], alive: () => G.Life.tales().includes(s),
        kick: kickOf(set && set.name, 'Histórias ao pé do fogo'), title: `${el.name} conta às crianças`, sub: `“${trim(s.tale.txt, 170)}”` });
    }
    for (const f of G.Life.fams()) {
      if (f.members.size < 3) continue;
      const names = [...f.members.keys()].map(id => Sx.villagers.get(id)).filter(Boolean);
      const adults = names.filter(v => v.age >= 16).map(v => v.name), kids = names.filter(v => v.age < 16).map(v => v.name);
      out.push({ key: 'fam:' + f.key, kind: 'family', score: 50 + f.members.size * 3, zoom: 2.9, dur: 11, drift: 1, pos: () => [f.x, f.y, 5], alive: () => G.Life.fams().includes(f) && f.members.size > 1,
        kick: place(f.x, f.y), title: 'Fim de tarde em família', sub: `${adults.join(' e ')}${kids.length ? `, com ${kids.length === 1 ? 'o pequeno' : 'as crianças'} ${kids.join(', ')}` : ''} — na porta de casa, até a noite chegar` });
    }
    for (const q of G.Life.queues()) {
      if (q.n < 3) continue;
      out.push({ key: 'queue:' + q.key, kind: 'queue', score: 34 + q.n * 3, zoom: 2.7, dur: 10, drift: 1, pos: () => [q.x, q.y, 5], alive: () => G.Life.queueLen(q.key) > 0,
        kick: place(q.x, q.y), title: q.key.startsWith('well') ? 'A fila do poço' : 'A fila da feira', subFn: () => q.key.startsWith('well') ? `${G.Life.queueLen(q.key)} pessoas esperando a vez de tirar água, com o jarro na mão` : `${G.Life.queueLen(q.key)} pessoas esperando a vez na barraca` });
    }
  }
  // after the battle: the dead where they fell, the pyre
  function aftermath(out) {
    if (!G.Carnage) return;
    const cells = new Map();
    for (const c of G.Carnage.list()) { const k = ((c.x / 6) | 0) + ':' + ((c.y / 6) | 0); let l = cells.get(k); if (!l) cells.set(k, l = []); l.push(c); }
    for (const [k, l] of cells) {
      if (l.length < 3) continue;
      const cx = l.reduce((a, c) => a + c.x, 0) / l.length, cy = l.reduce((a, c) => a + c.y, 0) / l.length;
      const crows = l.some(c => c.crows); const st = G.Carnage.stage(l[0]);
      out.push({ key: 'dead:' + k, kind: 'dead', score: 52 + Math.min(22, l.length * 2) + (crows ? 8 : 0), zoom: 2.3, dur: 12, drift: 1, pos: () => [cx, cy, 4], alive: () => true, front: frontNear(cx, cy),
        kick: place(cx, cy), title: st === 'bones' ? 'Os ossos da batalha' : 'O campo dos mortos',
        subFn: () => { const n = G.Carnage.list().filter(c => G.dist(c.x, c.y, cx, cy) < 5).length; const busy = G.Carnage.list().some(c => c.claim && G.dist(c.x, c.y, cx, cy) < 5); return `${n} ${n === 1 ? 'corpo' : 'corpos'} ${G.Carnage.STAGE[st]}${crows ? ', e os corvos' : ''}${busy ? ' — alguém veio arrastá-los' : ' — ninguém veio buscá-los ainda'}`; } });
    }
    for (const p of G.Carnage.pyres()) {
      if (p.burn <= 0) continue;
      out.push({ key: 'pyre:' + p.id + ':' + p.bodies, kind: 'dead', score: 66, zoom: 2.4, dur: 11, drift: 1, pos: () => [p.x, p.y, 8], alive: () => p.burn > 0,
        kick: place(p.x, p.y), title: 'A pira dos inimigos', sub: `${p.bodies} ${p.bodies === 1 ? 'corpo queimado' : 'corpos queimados'} aqui, longe das casas` });
    }
  }
  // establishing shots: a town from above, the fair, a prayer, the whole world
  function places(out) {
    const Sx = S(); const t = Sx.time;
    const dusk = t > 0.62 && t < 0.8, night = G.isNight(), dawn = t > 0.02 && t < 0.12;
    const pop = new Map(); for (const v of Sx.villagers.values()) pop.set(v.set, (pop.get(v.set) || 0) + 1);
    for (const set of Sx.settlements.values()) {
      const n = pop.get(set.id) || 0; if (!n) continue;
      const tier = set.tier || 0;
      out.push({
        key: 'set:' + set.id, kind: 'place', score: 24 + tier * 3 + Math.min(8, n / 40) + (dusk ? 16 : night ? 10 : dawn ? 8 : 0) + Math.random() * 6, zoom: zoomFit((set.radius || 6) * 0.75), dur: 12, drift: 1,
        pos: () => [set.cx, set.cy, 4], alive: () => Sx.settlements.has(set.id), kick: facName(set.fac), title: set.name,
        subFn: () => { const t = Sx.time; return `${(G.City && G.City.TIERS[set.tier || 0]) || ''} · ${n} ${n === 1 ? 'habitante' : 'habitantes'}${G.isNight() ? ' · a cidade à noite' : t > 0.62 ? ' · o fim do dia' : t > 0.02 && t < 0.14 ? ' · a névoa da manhã' : ''}${G.Pets ? (() => { const w = G.Pets.words(G.Pets.count(set.id)); return w ? ' · ' + w : ''; })() : ''}`; },
      });
      if (G.Eco && G.Eco.fairOpen() && tier >= 1) {
        const fb = G.Eco.byType(set.id, 'feira')[0];
        if (fb) { const [x, y] = G.Village.center(fb); out.push({ key: 'fair:' + fb.id, kind: 'place', score: 44, zoom: 2.3, dur: 11, drift: 1, pos: () => [x, y, 4], alive: () => Sx.buildings.has(fb.id) && G.Eco.fairOpen(), kick: set.name, title: 'Dia de feira', sub: 'barracas, rebanhos, mercadores de fora — e quem regateia cada moeda' }); }
      }
    }
    const pr = Sx.prayer;
    if (pr && G.Events && G.Events.PRAYER && G.Events.PRAYER[pr.kind]) out.push({ key: 'pray:' + pr.set + ':' + pr.kind, kind: 'place', score: 54, zoom: 2.2, dur: 10, drift: 1, pos: () => [pr.x, pr.y, 6], alive: () => Sx.prayer === pr, kick: place(pr.x, pr.y), title: 'Uma prece', sub: `${G.Events.PRAYER[pr.kind].ask} — e olham para o céu, para você` });
    const rainbow = G.Sky && G.Sky.state.rainbow > 4;
    if (rainbow) { const s0 = [...Sx.settlements.values()].sort((a, b) => (b.tier || 0) - (a.tier || 0))[0]; if (s0) out.push({ key: 'rainbow:' + Sx.day, kind: 'sky', score: 74, zoom: zoomFit((s0.radius || 8) * 1.2), dur: 11, drift: 1, pos: () => [s0.cx, s0.cy, 4], alive: () => G.Sky.state.rainbow > 0, kick: s0.name, title: 'Arco-íris', sub: 'a chuva passou' }); }
    // the land itself: peaks in the low sun, waterfalls seen from the side where they fall, still lakes
    if (G.Relief) {
      const Rv = R(); const light = dusk || dawn ? 18 : night ? -12 : 0;
      for (const p of G.Relief.places()) {
        if (p.kind === 'pico') out.push({ key: 'peak:' + p.name, kind: 'land', score: 26 + light + Math.min(10, p.h / 4) + Math.random() * 8, zoom: 1.35, dur: 12, drift: 1, pos: () => [p.x, p.y, 14], alive: () => true, kick: 'As montanhas', title: p.name, sub: `${p.alt} de altitude${G.isNight() ? ' · sob as estrelas' : Sx.time > 0.6 ? ' · o sol se põe atrás do pico' : Sx.time < 0.14 ? ' · a névoa ainda nos vales' : ''}` });
        else if (p.kind === 'cachoeira') {
          const f = (Sx.relief.falls || []).find(q => q.name === p.name); let view;
          if (f) for (let r = 0; r < 4; r++) { const ok = (() => { const d = (x, y) => r === 0 ? x + y : r === 1 ? G.N - y + x : r === 2 ? 2 * G.N - x - y : y + G.N - x; return d(f.x + 0.5, f.y + 0.5) < d(f.tx + 0.5, f.ty + 0.5); })(); if (ok) { view = r; break; } }
          out.push({ key: 'fall:' + p.name, kind: 'land', score: 30 + light * 0.6 + Math.min(12, p.drop * 3) + Math.random() * 8, zoom: 2.9, dur: 11, drift: 1, view, pos: () => [p.x, p.y, 4], alive: () => true, kick: 'As águas', title: p.name, sub: p.alt });
        } else if (p.kind === 'lago' && p.n >= 6) out.push({ key: 'lake:' + p.name, kind: 'land', score: 22 + light + Math.random() * 8, zoom: 1.9, dur: 11, drift: 1, pos: () => [p.x, p.y, 2], alive: () => true, kick: 'As águas', title: p.name, sub: p.alt });
      }
      void Rv;
    }
    const nf = G.Fac.all().length;
    out.push({ key: 'world', kind: 'world', score: 16 + (dawn ? 16 : 0) + Math.random() * 6, zoom: R().minZoom() * 1.12, dur: 12, drift: 1, pos: () => [G.N / 2, G.N / 2, 0], alive: () => true, kick: `Dia ${Sx.day}`, title: (Sx.lore && Sx.lore.world) || 'O mundo', sub: `${Sx.villagers.size} almas · ${nf} ${nf === 1 ? 'povo' : 'povos'} · ${Sx.settlements.size} ${Sx.settlements.size === 1 ? 'povoado' : 'povoados'}` });
  }

  // the caves: bats at dusk, the people inside (a funeral, the hidden, the oracle, a painter), outlaws by their fire and on the prowl
  // the sea's own moments: a turtle on the beach, the little ones running, the shining waves, dolphins at the bow
  function sea(out) {
    const Sx = S(), Sea = G.Sea; if (!Sea || !Sea.floor) return;
    const n = Sea.nest;
    if (n && (n.st === 'crawl' || n.st === 'dig')) out.push({ key: 'nest:' + n.id, kind: 'sea', score: 66, zoom: 2.8, dur: 12, drift: 1, pos: () => [n.x, n.y, 4], alive: () => Sea.nest === n && n.st !== 'wait', kick: 'Na noite quente', title: 'Uma tartaruga sobe a praia', sub: n.st === 'dig' ? 'cava um buraco na areia e põe os ovos' : 'arrasta-se para fora do mar, até onde a onda não chega' });
    if (n && n.st === 'hatch') out.push({ key: 'hatch:' + n.id, kind: 'sea', score: 88, zoom: 2.7, dur: 14, drift: 1, pos: () => [n.x + n.nx * 0.3, n.y + n.ny * 0.3, 4], alive: () => Sea.nest === n && n.st === 'hatch', kick: 'Ao entardecer', title: 'As tartaruguinhas nascem', subFn: () => `${n.babies.filter(b => b.done === 'sea').length} já chegaram ao mar${n.taken ? ` · as gaivotas levaram ${n.taken}` : ''}` });
    if (Sea.glowing() && Sea.tideChains) {
      const ch = Sea.tideChains.find(c => Sea.temp(Sea.tideSegs[c.segs[0]][7]) > 0.45 && c.P.length > 5);
      if (ch) { const p = ch.P[ch.P.length >> 1]; out.push({ key: 'glow:' + Sx.day, kind: 'sea', score: 70, zoom: 2.1, dur: 12, drift: 1, pos: () => [p[0], p[1], 2], alive: () => Sea.glowing(), kick: 'À noite', title: 'O mar brilha', sub: 'cada onda que quebra acende de azul' }); }
    }
    const wc = Sea.carcass;
    if (wc) { const cutting = [...Sx.villagers.values()].filter(v => v.task && v.task.type === 'baleia').length; out.push({ key: 'whale:' + wc.day, kind: 'sea', score: cutting ? 80 : 62, zoom: 2.3, dur: 13, drift: 1, pos: () => [wc.x, wc.y, 6], alive: () => Sea.carcass === wc, kick: 'Na praia', title: 'Uma baleia encalhou', subFn: () => cutting ? `${cutting} pessoas cortam a carne e levam em cestos` : 'as gaivotas brigam pelo que sobra' }); }
    for (const a of Sx.animals.values()) if (a.state === 'ride') { out.push({ key: 'dolph:' + a.ride, kind: 'sea', score: 60, zoom: 2.4, dur: 10, drift: 1, pos: () => [a.x, a.y, 4], alive: () => a.state === 'ride', kick: 'No mar', title: 'Golfinhos na proa', sub: 'saltam na onda que o barco levanta' }); break; }
    if (Sea.lowTide()) { let v = null; for (const q of Sx.villagers.values()) if (q.task && (q.task.type === 'mariscar' || q.task.type === 'pocas') && q.task.st === 2) { v = q; break; } if (v) out.push({ key: 'tide:' + Sx.day + ':' + Math.round(Sx.time * 4), kind: 'sea', score: 46, zoom: 2.7, dur: 10, mark: 1, pos: () => [v.x, v.y, 4], alive: () => !!(v.task && (v.task.type === 'mariscar' || v.task.type === 'pocas')), kick: 'Maré baixa', title: v.name, subFn: () => G.Vg.taskText(v) }); }
  }
  function caves(out) {
    const Sx = S(); if (!G.Caves || !Sx.ug) return;
    const SC = { tomb: 78, refuge: 76, raid: 86, oracle: 66, pilgrim: 58, paint: 66, treasure: 72, explore: 58, mine: 52, guano: 40 };
    for (const cv of G.Caves.all()) {
      const m = cv.mouths[0];
      const ph = G.Caves.batPhase(cv);
      if (m && ph && ph.out === 1 && ph.k < 0.7 && cv.bats > 40) out.push({ key: 'bats:' + cv.id + ':' + Sx.day, kind: 'cave', score: 60 + Math.min(14, cv.bats / 16), zoom: 2.0, dur: 11, drift: 1, pos: () => [m.x + 0.5, m.y + 0.5, 16], alive: () => !!G.Caves.batPhase(cv), kick: 'O entardecer', title: cv.name, sub: `${cv.bats} morcegos saem para caçar insetos na noite` });
      let best = null, bs = 0, n = 0;
      for (const id of G.Caves.inside) { const v = Sx.villagers.get(id); if (!v || v.ug !== cv.id || v.age < 3 || !v.task || v.task.type !== 'caverna' || v.task.st < 2) continue; n++; const sc = SC[v.task.kind] || 45; if (sc > bs) { bs = sc; best = v; } }
      if (best) { const v = best; out.push({ key: 'cave:' + cv.id + ':' + v.task.kind, kind: 'cave', under: 1, score: bs + Math.min(10, n * 2), zoom: 2.6, dur: 12, mark: 1, pos: () => { const q = Sx.villagers.get(v.id); return q && q.ug ? [q.x, q.y, 6] : null; }, alive: () => { const q = Sx.villagers.get(v.id); return !!q && !!q.ug; }, kick: cv.name, title: v.name, subFn: () => `${G.roleName(v)} — ${G.Vg.taskText(v)}` }); }
      const b = cv.bandits;
      if (b && b.camp >= 0 && (G.isNight() || G.isEvening())) { const cx = b.camp % G.N + 0.5, cy = ((b.camp / G.N) | 0) + 0.5; out.push({ key: 'den:' + cv.id + ':' + Sx.day, kind: 'cave', under: 1, score: 56, zoom: 2.7, dur: 11, drift: 1, pos: () => [cx, cy, 6], alive: () => !!cv.bandits, kick: cv.name, title: b.name, sub: `${b.n} foras-da-lei em volta do fogo, sob ${b.leader}` }); }
      const a = G.Caves.actors.find(q => q.cave === cv.id && q.lead && q.delay <= 0);
      if (a && b) out.push({ key: 'prowl:' + cv.id + ':' + Sx.day + ':' + a.st, kind: 'war', score: 74, zoom: 2.4, dur: 12, pos: () => [a.x, a.y, 6], alive: () => G.Caves.actors.includes(a), kick: 'Na calada da noite', title: b.name, sub: a.st ? 'voltam para a caverna com o que roubaram' : `vão assaltar ${(Sx.settlements.get(a.set) || {}).name || 'a vila'}` });
    }
  }

  // ------------------------------ the director ------------------------------
  function candidates() {
    let out = [];
    fronts = computeFronts();
    if (war) {
      // the war camera: only what belongs to the war (to one front, when one was chosen)
      armies(out); fleets(out); chronicle(out); aftermath(out); warDetails(out);
      if (war.front && !fronts.some(f => f.key === war.front)) { war.front = null; uiSig = ''; if (shot) seen.set(shot.key, clock); shot = null; flash(fronts.length ? 'Essa frente acabou · seguindo as outras' : anyWar() ? 'Nenhum exército em campo agora' : 'A guerra acabou'); }
      out = out.filter(c => c.front && (!war.front || c.front === war.front));
      // what is happening now beats what the chronicle already told
      for (const c of out) if (c.fromLog) c.score -= 12;
    } else {
      festivals(out); armies(out); fleets(out); chronicle(out); fires(out); life(out); beasts(out); places(out); evenings(out); aftermath(out); caves(out); sea(out); if (G.Stories && G.Stories.shots) G.Stories.shots(out);
      // the war's close-ups also show up now and then in the plain cinema
      const wd = []; warDetails(wd); for (const c of wd) { c.score -= 14; out.push(c); }
    }
    // not the same thing again so soon, not always the same kind of thing
    for (const c of out) {
      const last = seen.get(c.key);
      // the big things (a battle, a siege, a great festival) come back sooner
      if (last !== undefined) c.score -= c.score >= 85 ? Math.max(0, 30 - (clock - last) * 0.6) : Math.max(0, 50 - (clock - last) * 0.28);
      const lk = seenKind.get(c.kind); if (lk !== undefined && (!shot || c.key !== shot.key)) c.score -= Math.max(0, 16 - (clock - lk) * 0.25);
      c.score += Math.random() * 6;
    }
    out.sort((a, b) => b.score - a.score);
    // the same scene offered twice (a battle seen from both hosts): keep the better
    const keys = new Set(); out = out.filter(c => (keys.has(c.key) ? false : (keys.add(c.key), true)));
    return out;
  }
  function direct(force) {
    const list = candidates();
    // the war camera never lingers on something that is not (or no longer) its war
    if (shot && war && !shot.parent && (!shot.front || (war.front && shot.front !== war.front))) force = true;
    if (shot) {
      const alive = shot.alive() && shot.pos();
      if (shot.subFn) { const s = shot.subFn(); if (s !== cap.sub) { cap.sub = s; el.sub.textContent = trim(s, 200); if (shot.t > 3) { el.cap.classList.add('show'); cap.hideAt = clock + 6; } } }
      const best = list.find(c => c.key !== shot.key && c.key !== shot.parent);
      const hold = shot.t < 5 && !!shot.pos();
      if (!force && hold) return;
      const same = list.find(c => c.key === (shot.parent || shot.key));
      // the war camera weighs the scene as it is now (an ambush springing beats a column that is still walking)
      const bar = war ? (same ? same.score : shot.score - 20) + 10 : shot.score + 26;
      if (!force && alive && shot.t < shot.dur && !(best && best.score > bar && (!war || shot.t > 3))) return;
      // a long battle or festival: a second look from closer, then back out
      if (!force && alive && same && same.score >= 70 && best && same.score >= best.score - 8 && !shot.parent && same.close) {
        const cl = same.close(); if (cl) { cl.key = same.key + ':close'; cl.parent = same.key; cl.score = same.score; return take(cl); }
      }
      seen.set(shot.key, clock); if (shot.parent) seen.set(shot.parent, clock);
      if (best) return take(best);
      shot = null; return;
    }
    if (list[0]) take(list[0]);
  }
  function take(c) {
    const Rn = R(), cam = Rn.cam;
    const p = c.pos(); if (!p) return;
    c.t = 0; c.push = (Math.random() < 0.7 ? 1 : -1) * G.rr(0.06, 0.14); c.driftA = Math.random() * TAU;
    c.zoom = G.clamp(c.zoom * (G.speed >= 8 && !c.drift ? 0.8 : 1), Rn.minZoom(), 3.4);
    const [tx, ty] = target(c, p);
    const far = Math.hypot(tx - cam.x, ty - cam.y) * cam.zoom > Math.hypot(Rn.VW, Rn.VH) * 1.1 || (c.view !== undefined && c.view !== Rn.rot()) || !!c.under !== !!Rn.under;
    prevKey = shot ? shot.key : ''; shot = c; lastTx = null; seenKind.set(c.kind, clock);
    hideCap();
    if (far || !prevKey) { fade = { t: 0, jumped: false }; el.fade.classList.add('on'); cap.showAt = clock + 1.05; }
    else { fade = null; cap.showAt = clock + 0.9; }
    cap.sub = c.subFn ? c.subFn() : c.sub;
  }
  // world pixel the camera aims at for this subject position
  function target(c, p) {
    const [sx, sy] = R().proj(p[0], p[1], (c.under ? G.Caves.floorAt(p[0], p[1]) : W.groundH(G.clamp(p[0], 0, G.N - 0.01), G.clamp(p[1], 0, G.N - 0.01))));
    let x = sx, y = sy - (p[2] || 0);
    if (c.drift) { const d = (c.t || 0) * 9 / Math.max(0.5, c.zoom); x += Math.cos(c.driftA) * d; y += Math.sin(c.driftA) * d * 0.6; }
    return [x, y];
  }
  function hideCap() { el.cap.classList.remove('show'); cap.showAt = -1; }
  function showCap(c) {
    el.kick.textContent = c.kick || ''; el.title.textContent = c.title || ''; el.sub.textContent = trim(cap.sub || '', 200);
    el.cap.classList.add('show'); cap.hideAt = clock + (c.fromLog ? 8.5 : 7);
  }

  // ------------------------------ per frame ------------------------------
  C.update = function (rdt) {
    if (!C.on) return;
    if (G.Main.mode !== 'game') { C.stop(); return; }
    clock += rdt;
    // the hint, the mouse pointer and the speed badge
    hintT -= rdt; el.hint.classList.toggle('show', hintT > 0);
    if (hintT <= 0) document.body.classList.add('cine-nocursor');
    if (G.speed !== lastSpeed) { lastSpeed = G.speed; statusT = 2.2; cap.flash = ''; }
    statusT -= rdt;
    const st = G.speed === 0 ? 'Pausado' : statusT > 0 ? (cap.flash || `Velocidade ${G.speed}x`) : '';
    if (statusT <= 0) cap.flash = '';
    if (el.status.textContent !== st) el.status.textContent = st;
    el.status.classList.toggle('show', !!st);
    warUiT -= rdt;
    if (warUiT <= 0) {
      warUiT = 0.8;
      if (war) { if (!fronts.length) { war.quiet += 0.8; if (war.quiet > 5) { war = null; flash(anyWar() ? 'Nenhum exército em campo agora · o cinema volta ao mundo' : 'A guerra acabou · o cinema volta ao mundo'); } } else war.quiet = 0; }
      warUi();
    }
    // WASD or the arrows: the player is flying the camera
    const k = G.Input.keys; if (k.w || k.a || k.s || k.d || k.arrowup || k.arrowdown || k.arrowleft || k.arrowright) C.manual();
    if (manualT > 0) { manualT -= rdt; if (manualT <= 0) { evalT = 0; prevKey = ''; } return; }
    evalT -= rdt; if (evalT <= 0) { evalT = 0.8; direct(false); }
    if (!shot) return;
    const Rn = R(), cam = Rn.cam;
    cam.follow = 0; cam.target = null; cam.anchor = null;
    if (fade && !fade.jumped) {
      fade.t += rdt;
      if (fade.t < 0.5) return;
      if (!!shot.under !== !!Rn.under) Rn.setUnder(shot.under ? 1 : 0, true);
      if (shot.view !== undefined && shot.view !== Rn.rot()) Rn.turnTo(shot.view);
      const p = shot.pos(); if (p) { shot.last = p; const [tx, ty] = target(shot, p); cam.x = tx; cam.y = ty; }
      vx = vy = 0; lz = Math.log(shot.zoom * (1 - shot.push * 0.5)); cam.zoom = cam.tz = Math.exp(lz);
      if (shot.view !== undefined) Rn.paintVisible();
      fade.jumped = true; el.fade.classList.remove('on');
    }
    if (fade && fade.jumped && (fade.t += rdt) > 1.2) fade = null;
    shot.t += rdt;
    const p = shot.pos() || shot.last; if (!p) return;
    shot.last = p;
    let [tx, ty] = target(shot, p);
    // follow a moving subject without lagging behind it: lead by its own speed
    if (lastTx !== null && rdt > 0) { const ix = (tx - lastTx) / rdt, iy = (ty - lastTy) / rdt; const a = Math.min(1, rdt * 3); tvx += (G.clamp(ix, -900, 900) - tvx) * a; tvy += (G.clamp(iy, -900, 900) - tvy) * a; }
    else { tvx = tvy = 0; }
    lastTx = tx; lastTy = ty;
    const K = shot.t < 3.5 ? 2.2 : 4.5, D = 2 * Math.sqrt(K);
    const gx = tx + tvx * D / K, gy = ty + tvy * D / K;
    const h = Math.min(rdt, 0.05);
    for (let s = rdt; s > 1e-4; s -= h) {
      const dt = Math.min(h, s);
      vx += ((gx - cam.x) * K - vx * D) * dt; vy += ((gy - cam.y) * K - vy * D) * dt;
      cam.x += vx * dt; cam.y += vy * dt;
    }
    // zoom: settle on the shot, then a slow push in (or out)
    const zt = shot.zoom * (1 + shot.push * G.clamp(shot.t / shot.dur, 0, 1.4));
    lz += (Math.log(zt) - lz) * Math.min(1, rdt * (shot.t < 3.5 ? 0.9 : 0.5));
    cam.zoom = cam.tz = G.clamp(Math.exp(lz), Rn.minZoom(), 3.6);
    // captions
    if (cap.showAt >= 0 && clock >= cap.showAt) { cap.showAt = -1; showCap(shot); }
    if (cap.hideAt && clock > cap.hideAt && el.cap.classList.contains('show')) { el.cap.classList.remove('show'); cap.hideAt = 0; }
  };
  // a soft halo under the feet of whoever the caption is about, for the first seconds
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ground.push(function (c, proj) {
    if (!C.on || !shot || !shot.mark || !shot.last || (fade && !fade.jumped)) return;
    const t = shot.t; const a = G.clamp((t - 0.8) / 0.8, 0, 1) * G.clamp((7.5 - t) / 1.5, 0, 1);
    if (a <= 0) return;
    const x = shot.last[0], y = shot.last[1];
    const p = proj(x, y, W.groundH(G.clamp(x, 0, G.N - 0.01), G.clamp(y, 0, G.N - 0.01)));
    c.save(); c.globalAlpha = a;
    const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], 10); g.addColorStop(0, 'rgba(255,232,165,0.42)'); g.addColorStop(1, 'rgba(255,232,165,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(p[0], p[1], 10, 5, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,226,150,0.8)'; c.lineWidth = 1; c.beginPath(); c.ellipse(p[0], p[1], 7, 3.5, 0, 0, TAU); c.stroke();
    c.restore();
  });
  G.renderHooks.ground.push(function (c, proj) {
    if (!C.on || !war || !G.War || R().under) return;
    const gh = (x, y) => W.groundH(G.clamp(x, 0, G.N - 0.01), G.clamp(y, 0, G.N - 0.01));
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const b of G.War.bands.values()) {
      const A = b.army; if (!A || (war.front && 'set:' + b.set !== war.front)) continue;
      const col = G.Fac.hex(b.fac);
      if (A.phase === 'marcha' && b.goal !== 'defesa') {
        const g = S().villagers.get(A.gen);
        // where it has been: a faint trodden line
        if (A.trail && A.trail.length > 2) {
          c.strokeStyle = col; c.globalAlpha = 0.28; c.lineWidth = 2; c.setLineDash([]); c.beginPath();
          const tr = A.trail, from = Math.max(0, tr.length - 90);
          for (let k = from; k < tr.length; k++) { const p = proj(tr[k][0], tr[k][1], gh(tr[k][0], tr[k][1])); if (k === from) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
          c.stroke();
        }
        // where it is going: a dashed arrow to the town
        if (g && !g.dead) {
          const n = Math.max(2, Math.ceil(G.dist(g.x, g.y, b.tx, b.ty) / 1.5));
          c.strokeStyle = col; c.globalAlpha = 0.55; c.lineWidth = 1.6; c.setLineDash([5, 5]); c.lineDashOffset = -clock * 14; c.beginPath();
          let last = null, prev = null;
          for (let k = 0; k <= n; k++) { const x = g.x + (b.tx - g.x) * k / n, y = g.y + (b.ty - g.y) * k / n; const p = proj(x, y, gh(x, y)); if (k === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); prev = last; last = p; }
          c.stroke(); c.setLineDash([]);
          if (prev && last) { const a = Math.atan2(last[1] - prev[1], last[0] - prev[0]); c.fillStyle = col; c.globalAlpha = 0.75; c.beginPath(); c.moveTo(last[0] + Math.cos(a) * 6, last[1] + Math.sin(a) * 6); c.lineTo(last[0] + Math.cos(a + 2.5) * 6, last[1] + Math.sin(a + 2.5) * 6); c.lineTo(last[0] + Math.cos(a - 2.5) * 6, last[1] + Math.sin(a - 2.5) * 6); c.fill(); }
        }
      }
      // the hidden: a slow ring breathing in the woods, so the viewer knows where to look
      for (const co of A.cos) {
        if (!co.hidden) continue; const p0 = coPos(co); if (!p0) continue;
        let sp = 0; for (const v of co.alive || []) if (v && !v.dead) sp = Math.max(sp, G.dist(v.x, v.y, p0[0], p0[1]));
        const k = 0.5 + 0.5 * Math.sin(clock * 2.2), r = Math.max(1.6, sp + 0.9) + k * 0.25;
        c.globalAlpha = 0.4 + 0.35 * k; c.strokeStyle = col; c.lineWidth = 1.4; c.setLineDash([4, 4]); c.lineDashOffset = -clock * 6;
        c.beginPath();
        for (let a = 0; a <= 28; a++) { const x = p0[0] + Math.cos(a / 28 * TAU) * r, y = p0[1] + Math.sin(a / 28 * TAU) * r; const p = proj(x, y, gh(x, y)); if (a === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
        c.stroke(); c.setLineDash([]);
      }
    }
    c.restore();
  });
  C.list = () => candidates().slice(0, 12).map(c => `${c.key} ${c.title} ${Math.round(c.score)}`);
  C.shot = () => (shot ? { key: shot.key, kind: shot.kind, title: shot.title, t: shot.t, score: shot.score } : null);
})(window.G);
