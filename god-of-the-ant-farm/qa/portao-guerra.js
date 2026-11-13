// portao-guerra: a guerra pergunta ao mapa de regiões se o exército chega a pé (L-731) — provocado de propósito.
//   [ONLY=p1,p3] node qa/portao-guerra.js [mundo]      (o mundo pronto «anos100»: Mênfis, murada pelo próprio mundo, o único muro
//   dos mundos prontos que fecha a cidade de verdade com os portões fechados — os outros vazam por ruas sem portão e por hortas,
//   pomares, currais e cemitérios na linha, L-732 —, e as outras cidades do povo ligadas a ela por terra)
// O portão que o alarme fecha reabre; a busca de caminho do instante (W.findPath) o acha fechado, e o planejador da guerra, que
// perguntava a ela, dizia «não há caminho»: nenhum exército contra a capital murada em alarme, nenhum socorro para a cidade
// murada sitiada, e o mar para o que se alcançava a pé. O mapa de regiões (W.townsLinked) conta o portão fechado como aberto
// — e a cidade fechada de verdade continua sem caminho.
// p1 o exército contra a capital murada de portões fechados: os portões fechados pelo alarme (a mão da prova toca o alarme), a
//    busca do instante sem caminho, o mapa a ligar as duas cidades — e a convocação acontece, com a frente numa cidade do povo;
// p2 o save no meio: os portões fechados atravessam o save, e a convocação acontece depois do load;
// p3 o socorro da cidade murada sitiada: um exército de verdade marcha, chega e cerca a capital murada (os portões fecham-se
//    sozinhos, pelo alarme do ataque) — e o povo sitiado chama o socorro de outra cidade sua;
// p4 a cidade fechada de verdade: o anel do muro inteiro emparedado pela mão da prova — o mapa e a busca dizem que não há
//    caminho, e ninguém é convocado contra ela;
// e o verificador (S0 a S2) limpo do começo ao fim, sem erros de módulo nem do console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'anos100';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | portao-guerra ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = (sec, until) => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 50 === 0) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
const W = () => G.W; const N2 = () => G.N * G.N;

// the world of every case: the ready world, two peoples of it at war by the test's hand — the attacker the largest people
// whose capital is not walled, the defender a people whose walled capital has another town of its own linked to it by land
let A, B, tg, ca, w;
const setup = () => {
  M.pronto(WORLD); M.viver(1);
  const walled = f => { const c = G.Fac.capitalOf(f.id); const wl = c && G.Siege.wallOf(c.id); return wl && wl.done && wl.fac === f.id && wl.gates.length ? wl : null; };
  const live0 = G.Fac.all().filter(f => f.alive && G.Fac.capitalOf(f.id));
  B = live0.filter(f => walled(f) && G.Fac.settlementsOf(f.id).some(s => s !== G.Fac.capitalOf(f.id) && W().townsLinked(s, G.Fac.capitalOf(f.id)))).sort((p, q) => G.Fac.pop(q.id) - G.Fac.pop(p.id))[0];
  if (!B) return 'nenhum povo com a capital murada e outra cidade ligada a ela por terra';
  tg = G.Fac.capitalOf(B.id);
  A = live0.filter(f => f !== B && !walled(f) && W().townsLinked(G.Fac.capitalOf(f.id), tg)).sort((p, q) => G.Fac.pop(q.id) - G.Fac.pop(p.id))[0];
  if (!A) return `nenhum povo de capital sem muro ligado por terra a ${tg.name}`;
  ca = G.Fac.capitalOf(A.id);
  // (the other wars of the world end: the case looks at one; the granary of the attacker filled, as a realm that means to march)
  for (const x of G.Fac.all()) for (const y of G.Fac.all()) if (x.id < y.id && G.Fac.atWar(x.id, y.id)) { const r = G.Fac.rel(x.id, y.id); r.st = 'tregua'; r.truce = G.DAY_LEN * 30; r.since = G.S.day; G.Wars.onPeace(x, y, 'sem vencedores', null); G.War.onPeace(x, y); }
  A.stock.food = Math.max(A.stock.food, G.Fac.pop(A.id) * 7);
  G.Politics.declareWar(A, B, 'ambicao'); live(2);
  w = G.Wars.warOf(A.id, B.id);
  return w ? null : `${A.name} e ${B.name}: a guerra declarada pela mão da prova não começou`;
};
const wallOf = () => G.Siege.wallOf(tg.id);
const shutNow = () => { const wl = wallOf(); return wl.gates.filter(i => G.S.wall[i] === 4).length; };
const instant = () => !!W().findPath(ca.cx, ca.cy, tg.cx, tg.cy, true, N2());
const armyOf = a => a ? `${a.name || 'exército'} #${a.id}, ${a.members.length} convocados, a frente em ${(G.S.settlements.get(a.front) || {}).name || '?'}` : 'nenhum';

// ---------------- p1 the army against the walled capital with its gates shut ----------------
let snap = null;
if (want('p1') || want('p2')) {
  const why = setup();
  if (why) { ok('p1 o exército contra a capital murada de portões fechados', false, 'precondição: ' + why); }
  else {
    tg.alarmT = 600; live(1); // (the alarm of an enemy at the gates: the gates shut — siege.js, gatesTick)
    const shut = shutNow(), gates = wallOf().gates.length, path = instant(), linked = W().townsLinked(ca, tg);
    snap = G.Save.serialize();
    if (want('p1')) {
      const a = G.Wars.mobilize(w, A, 'campanha', tg, {});
      const front = a && G.S.settlements.get(a.front);
      ok('p1 o exército contra a capital murada de portões fechados', shut === gates && !path && linked && !!a && !!front && front.fac === A.id,
        `${A.name} contra ${B.name}: ${tg.name} murada, ${shut} de ${gates} portões fechados pelo alarme; a busca do instante de ${ca.name} até lá: ${path ? 'acha caminho' : 'sem caminho'}; o mapa de regiões: ${linked ? 'ligadas' : 'NÃO ligadas'} — a convocação: ${armyOf(a)}`);
    }
  }
}

// ---------------- p2 the save in the middle: the gates shut through it, and the call after the load ----------------
if (want('p2')) {
  if (!snap) ok('p2 o save no meio', false, 'precondição: o mundo do p1 não se armou');
  else {
    G.S = null; M.abrir(JSON.parse(snap)); A = G.Fac.get(A.id); B = G.Fac.get(B.id); tg = G.S.settlements.get(tg.id); ca = G.S.settlements.get(ca.id); w = G.Wars.warOf(A.id, B.id);
    const shut = shutNow(), gates = wallOf().gates.length, path = instant(), linked = W().townsLinked(ca, tg);
    const a = w && G.Wars.mobilize(w, A, 'campanha', tg, {});
    ok('p2 o save no meio', shut === gates && !path && linked && !!a,
      `depois do load: ${shut} de ${gates} portões de ${tg.name} fechados (o alarme em ${Math.round(tg.alarmT || 0)}); a busca do instante ${path ? 'acha caminho' : 'sem caminho'}; o mapa ${linked ? 'liga' : 'NÃO liga'} — a convocação: ${armyOf(a)}`);
  }
}

// ---------------- p3 the relief of the walled town under siege ----------------
if (want('p3')) {
  const why = setup();
  if (why) ok('p3 o socorro da cidade murada sitiada', false, 'precondição: ' + why);
  else {
    // (an attacker strong enough to besiege, and a besieged people strong enough to send a relief — six in ten of the besiegers
    // at the least, Wars.plan —: grown by the test's hand, as the realms of the volta.js, the attacker at its town nearest the
    // walled capital, the besieged at its town nearest it, where the relief gathers. With the anos100 as it comes, the Clã de
    // Hrafn called 9, spread over its towns, and the levy went home; grown, its host of 50 laid the siege, and Casa de Amon could
    // raise 33 and then 27 as the battle went, under the 30 a relief needs)
    const near = f => G.Fac.settlementsOf(f.id).filter(s => s !== tg && W().townsLinked(s, tg)).sort((p, q) => G.dist(p.cx, p.cy, tg.cx, tg.cy) - G.dist(q.cx, q.cy, tg.cx, tg.cy))[0];
    const grow = (f, at, n) => { const want0 = G.Fac.pop(f.id) + n; let k = 0; while (at && G.Fac.pop(f.id) < want0 && k++ < 6000) { const ang = G.R() * 6.283, r = G.R() * (at.radius || 6); const p = G.W.nearestLand(at.cx + Math.cos(ang) * r, at.cy + Math.sin(ang) * r, 5); if (p) G.Vg.create({ set: at.id, x: p[0], y: p[1], age: 18 + G.R() * 30 }); } f.stock.food = Math.max(f.stock.food, G.Fac.pop(f.id) * 7); f.stock.armas = (f.stock.armas || 0) + Math.round(n * 0.2); };
    const front = near(A), sister = near(B);
    grow(A, front, 100); grow(B, sister, 220); G.Fac.updateTerritory(); live(5);
    // (a real army: called while the gates are open, it marches, comes and besieges — the alarm of the attack shuts the gates)
    const a = G.Wars.mobilize(w, A, 'campanha', tg, {});
    let ph = a ? a.phase : '-';
    const host = () => a && G.Wars.army(a.id);
    live(G.DAY_LEN * 3, () => { const x = host(); ph = x ? x.phase : 'desfeito'; return !x || x.done || x.phase === 'cerco'; });
    const sieged = () => { const x = host(); return !!x && !x.done && x.phase === 'cerco'; };
    if (!sieged()) ok('p3 o socorro da cidade murada sitiada', false, `precondição: o exército de ${A.name} (${armyOf(a)}) não chegou a cercar ${tg.name} em três dias (fase: ${ph})`);
    else {
      // (the siege laid, the gates shut by its alarm: the realm's planner looks at the town again — the wait of its last look,
      // 0,4 of a day, is the test's hand's to end: the levies of defence it raised as the host marched set it)
      live(30, () => shutNow() === wallOf().gates.length || !sieged());
      const shut = shutNow(), gates = wallOf().gates.length, path = instant();
      const others = G.Fac.settlementsOf(B.id).filter(s => s !== tg && W().townsLinked(s, tg)).map(s => s.name);
      const relief = () => G.Wars.state().armies.find(x => x.fac === B.id && x.relief && !x.done);
      if (w.planD) w.planD[tg.id] = 0;
      live(20, () => !!relief() || !sieged());
      const r = relief();
      ok('p3 o socorro da cidade murada sitiada', shut === gates && !path && others.length > 0 && !!r,
        `${tg.name} cercada por ${armyOf(host() || a)}; ${shut} de ${gates} portões fechados; a busca do instante ${path ? 'acha caminho' : 'sem caminho'}; as outras cidades de ${B.name} ligadas a ela por terra: ${others.join(', ') || 'nenhuma'} (a leva possível: ${G.Wars.levySize(B, 3, G.Wars.adults(B.id))}) — o socorro: ${r ? armyOf(r) : 'NENHUM'}`);
    }
  }
}

// ---------------- p4 the town shut for real: no way, no army ----------------
if (want('p4')) {
  const why = setup();
  if (why) ok('p4 a cidade fechada de verdade', false, 'precondição: ' + why);
  else {
    // (every tile of the wall's ring walled up by the test's hand, its gates and its ways too, and the map told)
    const wl = wallOf(); const S = G.S; let up = 0;
    for (const i of wl.tiles.concat(wl.gates, wl.ways || [])) if (S.wall[i] !== 1 && G.W.ground(i)) { S.wall[i] = 1; up++; }
    G.W.touchWalk(); live(1);
    const path = instant(), linked = W().townsLinked(ca, tg), can = W().canWalk(ca.cx, ca.cy, tg.cx, tg.cy, true);
    const a = G.Wars.mobilize(w, A, 'campanha', tg, {});
    // (the ring may not close the town — the deep water and a ford are the wall there —: then it is not shut, and the case says so)
    ok('p4 a cidade fechada de verdade', !path && !linked && !can && !a,
      `${tg.name} com o anel do muro inteiro emparedado (${up} casas): a busca do instante ${path ? 'ACHA caminho' : 'sem caminho'}; o mapa ${linked || can ? 'AINDA LIGA (o anel não fecha a cidade)' : 'sem caminho'} — a convocação: ${a ? 'ACONTECEU: ' + armyOf(a) : 'nenhuma'}`);
  }
}

const e = M.erros(); const mods = Object.keys(e.mod);
console.log(`${mods.length || e.console.length ? 'FALHOU' : 'PASSOU'} | portao-guerra erros | módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 3).join(' · ') || 'nada'}`);
if (mods.length || e.console.length) fails.push('erros');
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
