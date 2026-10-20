// pesca: a pescaria provocada de propósito (C1, a atividade 02) — no mundo pronto «metrópole».   node qa/pesca.js
// p0 olhar a água não escreve nada (um mundo que ninguém pescou volta do save sem livro); p1 o peixe é contado (cada peixe pego sai do pesqueiro daquela água, pelo livro-razão: 'pesca'); p2 pescar demais
// esvazia a água, a pesca rende cada vez menos e some das opções (a do corpo diz por quê; os pescadores do povo vão a
// outra água); p3 o peixe volta, pela conta da vida (a mesma conta a qualquer hora em que se olhe); p4 o barco pesca do
// mesmo pesqueiro e volta leve de uma água vazia; p5 save no meio: o pesqueiro volta igual (e o resto do mundo também);
// p6 o aprendiz ao lado do mestre aprende a pescar (e sozinho não); p7 o corpo do deus pesca pela mesma porta (a mesma
// água, o mesmo peixe, o mesmo livro); p8 sem água, gelo ou água funda demais para o jeito do povo: não há pesca; p9 a
// tempestade tira todo mundo da beira da água; p10 quem pesca morre com o peixe na mão; p11 o salto: os pesqueiros
// continuam contados; p12 o jeito de cada povo (as mãos, o arpão, a linha, a rede); e o verificador limpo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | pesca ${name} | ${info}`); if (!c) fails.push(name); };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan'));
const watch = () => { const bb = bad(); if (bb.length) { console.log('   verificador no meio:', bb.slice(0, 2).map(q => q.msg).join(' · ')); return true; } return false; };
const D = G.Depot, A = G.Act, P = G.Pesca, W = G.W, T = G.T;
const r2 = x => Math.round(x * 100) / 100;
let S;
const fine = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (until && until()) return true; } return false; };
const book = f => D.ledger().filter(f);
if (!P) { console.log('FALHOU | pesca | G.Pesca não existe'); process.exit(1); }

M.pronto('metropole'); S = G.S; M.viver(2); G.inSim++;
S.time = 0.15; S.weather.storm = 0;
const N = G.N;
// a shore of a town: a dry tile its people reach, beside a water of the kind asked (the nearest to the town, by id order)
function shore(set, kinds, not) {
  let best = null, bd = 1e9;
  for (let dy = -28; dy <= 28; dy++) for (let dx = -28; dx <= 28; dx++) {
    const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; if (!W.inb(x, y)) continue;
    const i = y * N + x; if (S.type[i] < T.SAND || S.type[i] === T.RIVER || !W.walkable(i)) continue;
    for (const [ax, ay] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const wx = x + ax, wy = y + ay; if (!W.inb(wx, wy)) continue; const j = wy * N + wx;
      if (S.type[j] > T.RIVER || (S.ice && S.ice[j])) continue;
      const k = G.Waters.kind(wx + 0.5, wy + 0.5); if (kinds && !kinds.includes(k)) continue;
      if (not && not.includes(P.idAt(wx + 0.5, wy + 0.5))) continue;
      if (not && P.abundance(wx + 0.5, wy + 0.5) < 0.6) continue; // (a fresh water: the grounds already fished are left for others)
      const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { lx: x + 0.5, ly: y + 0.5, wx: wx + 0.5, wy: wy + 0.5, kind: k, id: P.idAt(wx + 0.5, wy + 0.5) }; }
    }
  }
  return best;
}
// a grown person of the town, free (not the god's body, not at sea, not in a cell), the first by id
const person = (set, not) => [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && v.age < 55 && !v.captive && !v.jail && !v.aboard && !v.ug && !(not || []).includes(v.id)).sort((a, b) => a.id - b.id)[0];
// (the test's hand: a person put at the water's edge, hands free, a little skill)
function atEdge(v, sp) { G.Vg.endTask(v); if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true }); v.x = sp.lx; v.y = sp.ly; v.path = null; }
const towns = [...S.settlements.values()].filter(s => G.Village.pop(s.id) > 20).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
const town = towns.find(s => shore(s, ['sea', 'river', 'lake', 'rock', 'mud', 'reef'])) || towns[0];
const sp = shore(town, ['sea', 'river', 'lake', 'rock', 'mud', 'reef']);
const used = [sp.id]; const fresh = () => { const q = shore(town, null, used) || sp; used.push(q.id); return q; };
console.log(`(${town.name}: ${G.Village.pop(town.id)} habitantes; a beira d'água em ${sp.lx},${sp.ly}, água de ${sp.kind}, pesqueiro ${sp.id} de ${r2(P.cap(sp.id))} peixes; o jeito do povo: ${P.how(town.fac)})`);

// ---------------- p0: looking at a water writes nothing: in a world nobody fished yet, the offers and the abundance read
// the waters full and leave no book; its save loads with no book either (the vida curta's year 1 found {} after a load)
{
  const keep = S.pesca; S.pesca = null; // (the test's hand: a world where nobody fished yet)
  const v = person(town); atEdge(v, sp);
  const offs = A.offers(v, v.x, v.y).filter(o => o.def === 'pesca'); const ab = P.abundance(sp.wx, sp.wy); P.stock(sp.wx, sp.wy);
  const looked = S.pesca;
  const rt = QA.roundTrip(); S = G.S; G.Main.mode = 'game';
  const loaded = S.pesca;
  ok('p0 olhar não escreve', looked === null && !loaded && !rt.diff.length && ab === 1 && offs.length >= 1,
    `${offs.length} oferta(s) de pesca e a água a ${Math.round(ab * 100)}%: o livro dos pesqueiros ${looked === null ? 'continuou sem existir' : 'NASCEU de uma leitura: ' + JSON.stringify(looked)}; depois do save, ${!loaded ? 'sem livro' : 'COM LIVRO: ' + JSON.stringify(loaded)}; a ida e volta: ${rt.diff.length ? rt.diff.slice(0, 2).join(' · ') : 'sem diferença'}`);
  if (keep) S.pesca = keep; // (the grounds the world had fished come back)
}
// ---------------- p1: every fish caught leaves the ground of that water, through the ledger
{
  const v = person(town); atEdge(v, sp); v.fishXp = 40;
  const s0 = P.stock(sp.wx, sp.wy); const L0 = S.ledgerN;
  let took = 0, casts = 0, got = 0, kinds = new Set(), last = null;
  for (let k = 0; k < 40 && got < 3; k++) {
    const r = P.cast(v, sp.wx, sp.wy); casts++;
    if (r.ok) { took += r.took; got++; kinds.add(r.name); last = r; if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true }); }
  }
  const s1 = P.stock(sp.wx, sp.wy);
  const lines = book(e => e[0] > L0 && e[8] === 'pesca' && e[4] === 'v:' + v.id);
  ok('p1 o peixe é contado', got >= 1 && Math.abs((s0.n - s1.n) - took) < 1e-3 && lines.length === got && lines.every(e => e[3] === '@mundo') && !bad().length,
    `${v.name} lançou ${casts} vezes e pegou ${got} (${[...kinds].join(', ')}): o pesqueiro ${r2(s0.n)} → ${r2(s1.n)} (saíram ${took} peixes, a conta ${Math.abs((s0.n - s1.n) - took) < 1e-3 ? 'fecha' : 'NÃO fecha'}); no livro ${lines.length} lançamento(s) 'pesca' para as mãos${last ? ` (o último: ${last.n} de ${last.k === 'food' ? 'comida' : last.k})` : ''}`);
}
// ---------------- p2: fishing too hard empties the water: less and less, then no fishing there
{
  const v = person(town); atEdge(v, sp); v.fishXp = 120;
  const yields = []; let casts = 0, empty = null;
  for (let round = 0; round < 40 && !empty; round++) {
    let n = 0; for (let k = 0; k < 10; k++) { const r = P.cast(v, sp.wx, sp.wy); casts++; if (r.ok) { n += r.took; if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true }); } if (r.empty) { empty = r; break; } }
    yields.push(n);
  }
  const ab = P.abundance(sp.wx, sp.wy);
  // (the body's offer there says so; the people's fishers look elsewhere)
  const offer = A.offers(v, sp.lx, sp.ly, 1.6).find(o => o.def === 'pesca');
  const half = Math.max(1, Math.floor(yields.length / 2)); const sum = L => L.reduce((a, b) => a + b, 0);
  const falling = yields.length >= 3 && sum(yields.slice(-half)) < sum(yields.slice(0, half));
  ok('p2 pescar demais esvazia', !!empty && ab < P.EMPTY && falling && !!offer && offer.ok === false && /sem peixe/.test(offer.why) && !bad().length,
    `${casts} lançamentos no mesmo pesqueiro: o que se pegou a cada 10 — ${yields.join(', ')}; ${empty ? `vazio ("${empty.why}")` : 'NÃO esvaziou'}, ${Math.round(ab * 100)}% do peixe; a oferta do corpo ali: ${offer ? (offer.ok ? 'ainda pesca' : `não (${offer.why})`) : 'nenhuma'}`);
}
// ---------------- p3: the fish come back, by the logistic — the same number whenever one looks
{
  const g = S.pesca[sp.id].slice(); const K = P.cap(sp.id); const s0 = P.stock(sp.wx, sp.wy);
  const n0 = Math.min(K, Math.max(g[0], K * P.SEED));
  const law = clock => K / (1 + ((K - n0) / n0) * Math.exp(-P.RATE * Math.max(0, (clock - g[1]) / G.DAY_LEN)));
  // (the test's hand on the clock, the world not stepped: what the water holds half a day, a day, three days from now)
  const c0 = S.clock; const at = [];
  for (const d of [0.5, 1, 3]) { S.clock = c0 + d * G.DAY_LEN; at.push([P.stock(sp.wx, sp.wy).n, law(S.clock)]); }
  S.clock = c0;
  const look = [P.stock(sp.wx, sp.wy).n, P.stock(sp.wx, sp.wy).n];
  const fits = at.every(([a, b]) => Math.abs(a - b) < 1e-9) && at[0][0] > s0.n && at[2][0] > at[1][0] && at[1][0] > at[0][0];
  ok('p3 o peixe volta', fits && look[0] === look[1] && look[0] === s0.n && JSON.stringify(S.pesca[sp.id]) === JSON.stringify(g),
    `o pesqueiro pescado (${r2(s0.n)} de ${r2(K)}): em meio dia ${r2(at[0][0])}, em um dia ${r2(at[1][0])}, em três ${r2(at[2][0])} — ${fits ? 'a conta da vida' : 'NÃO bate com a conta da vida (' + at.map(q => r2(q[1])).join(', ') + ')'}; olhar não muda nada (${look.map(r2).join(', ')})`);
}
// ---------------- p4: the boat fishes the same ground, and comes back light from an empty water
{
  const Nv = G.Naval; const boats = S.ships.filter(s => s.kind === 'pesca' && s.st === 'idle' && (s.crew || []).length).sort((a, b) => a.id - b.id);
  const s = boats[0];
  let info = 'nenhum barco de pesca parado com tripulação', fine4 = false;
  if (s) {
    const crew = s.crew.map(id => S.villagers.get(id)).filter(v => v && !v.aboard && !v.captive);
    for (const v of crew) Nv.board(v, s);
    // (a spot of the open sea near its home, a full ground and an empty one)
    const sea = []; for (let dy = -20; dy <= 20; dy++) for (let dx = -20; dx <= 20; dx++) { const x = Math.floor(s.x) + dx, y = Math.floor(s.y) + dy; if (W.inb(x, y) && S.type[y * N + x] <= T.SEA && Nv.compAt(x + 0.5, y + 0.5) === Nv.compAt(s.x, s.y)) sea.push([x + 0.5, y + 0.5]); }
    const ids = [...new Set(sea.map(p => P.idAt(p[0], p[1])))].filter(id => P.cap(id) > 40).sort((a, b) => a - b);
    const at = id => sea.find(p => P.idAt(p[0], p[1]) === id);
    const trip = id => { const p = at(id); s.x = p[0]; s.y = p[1]; s.path = null; s.shoal = 0; s.spot = null; const c0 = s.cargo || 0; const n0 = P.stock(p[0], p[1]).n; s.st = 'fish'; s.t = 99; s.dur = 1; Nv.RUN.pesca(s, 0.1); const got = (s.cargo || 0) - c0; const n1 = P.stock(p[0], p[1]).n; s.st = 'idle'; s.cargo = 0; return { got, lost: r2(n0 - n1), ab0: n0 / P.cap(id) }; };
    if (ids.length >= 2) {
      const full = ids[0], emptyId = ids[1];
      S.pesca[emptyId] = [r2(P.cap(emptyId) * 0.06), Math.round(S.clock * 100) / 100]; // (the test's hand: a water fished out yesterday)
      const a = trip(full), b = trip(emptyId);
      fine4 = a.got >= 1 && Math.abs(a.got - a.lost) < 1e-3 && b.got <= Math.max(1, a.got * 0.25) && Math.abs(b.got - b.lost) < 1e-3;
      info = `${G.Naval.title ? G.Naval.title(s) : 'o barco'} com ${crew.length} a bordo: na água cheia pegou ${a.got} (o pesqueiro perdeu ${a.lost}); na água pescada demais (${Math.round(b.ab0 * 100)}%) pegou ${b.got} (perdeu ${b.lost})`;
    } else info = 'o barco não tem duas águas de mar aberto por perto';
    for (const v of Nv.aboardOf(s)) Nv.unboard(v, null);
  }
  ok('p4 o barco', fine4 && !bad().length, info);
}
// ---------------- p5: a save in the middle: the grounds come back the same (and the rest of the world too)
{
  const before = JSON.stringify(S.pesca); const ab0 = P.abundance(sp.wx, sp.wy);
  const rt = QA.roundTrip ? QA.roundTrip() : { diff: [] };
  const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; S = G.S;
  const after = JSON.stringify(S.pesca); const ab1 = P.abundance(sp.wx, sp.wy);
  ok('p5 save no meio', before === after && Math.abs(ab0 - ab1) < 1e-9 && !rt.diff.length && !bad().length,
    `${Object.keys(S.pesca).length} pesqueiro(s) pescado(s) no save: ${before === after ? 'voltaram iguais' : 'MUDARAM'}; a água da beira com ${Math.round(ab1 * 100)}% do peixe (antes ${Math.round(ab0 * 100)}%); a ida e volta do verificador: ${rt.diff.length ? rt.diff.slice(0, 2).join(' · ') : 'sem diferença'}`);
}
// ---------------- p6: the apprentice beside the master learns to fish (and alone does not)
{
  // (a child of nine to fifteen whose parent fishes; another child, alone, for the comparison)
  const kids = [...S.villagers.values()].filter(v => v.set === town.id && v.age >= 9 && v.age < 15 && !v.captive).sort((a, b) => a.id - b.id);
  const kid = kids.find(k => [k.mother, k.father].some(id => { const p = S.villagers.get(id); return p && p.set === town.id && !p.captive && !p.aboard && p.age < 60; }));
  const other = kids.find(k => k !== kid);
  let info = 'nenhuma criança com pai ou mãe na cidade', ok6 = false;
  if (kid) {
    const sp2 = fresh();
    const par = [kid.mother, kid.father].map(id => S.villagers.get(id)).find(p => p && p.set === town.id && !p.captive && !p.aboard && p.age < 60);
    par.role = par.role === 'pescador' ? 'pescador' : 'coletor'; atEdge(par, sp2); par.fishXp = 100;
    const fishT = () => G.Vg.setTask(par, { type: 'fish', spot: W.idx(sp2.lx, sp2.ly), x: sp2.lx, y: sp2.ly, wx: Math.sign(sp2.wx - sp2.lx), wy: Math.sign(sp2.wy - sp2.ly), pri: 1.2 });
    fishT(); kid.x = sp2.lx + 0.6; kid.y = sp2.ly; kid.path = null; G.Vg.endTask(kid);
    const xp0 = kid.fishXp || 0, xo0 = other ? other.fishXp || 0 : 0;
    let followed = 0;
    for (let k = 0; k < 900; k++) {
      M.viver(0.1);
      if (!par.task || par.task.type !== 'fish') { if (par.carry) D.use('v:' + par.id, par.carry.k, par.carry.n, { code: 'teste', mine: true }); par.x = sp2.lx; par.y = sp2.ly; fishT(); }
      if (!kid.task || kid.task.type !== 'appr') G.Life.apprenticeTask(kid, G.Vg.H);
      if (kid.task && kid.task.type === 'appr') followed++;
    }
    const gain = (kid.fishXp || 0) - xp0, gainO = other ? (other.fishXp || 0) - xo0 : 0;
    ok6 = followed > 300 && gain > 2 && gain > gainO + 2;
    info = `${kid.name} (${Math.floor(kid.age)} anos) ao lado de ${par.name} pescando: a mão para a pesca ${r2(xp0)} → ${r2(kid.fishXp || 0)} (${Math.round(followed / 10)} s aprendendo)${other ? `; ${other.name}, sem mestre na água, ${r2(xo0)} → ${r2(other.fishXp || 0)}` : ''}; o ofício: ${JSON.stringify(kid.learn || {})}`;
  }
  ok('p6 o aprendiz', ok6 && !bad().length, info);
}
// ---------------- p7: the god's body fishes through the same door
{
  S.weather.storm = 0;
  const sp3 = fresh();
  const v = person(town); atEdge(v, sp3); v.fishXp = 60;
  const tk = G.Possess.take(v); M.viver(0.2); v.x = sp3.lx; v.y = sp3.ly;
  const o = A.offers(v, v.x, v.y, 1.6).find(q => q.def === 'pesca');
  const s0 = P.stock(o ? o.x : sp3.wx, o ? o.y : sp3.wy).n; const L0 = S.ledgerN;
  let r = { ok: false, why: 'sem oferta' }, tries = 0;
  if (o && o.ok) for (; tries < 30 && !r.ok; tries++) { r = A.perform(v, o); M.viver(0.1); }
  const line = book(e => e[0] > L0 && e[8] === 'pesca' && e[4] === 'v:' + v.id)[0];
  const s1 = P.stock(o ? o.x : sp3.wx, o ? o.y : sp3.wy).n;
  const held = !!(v.carry && v.carry.n >= 1 && v.carry.fish);
  G.Possess.release('deus'); M.viver(0.2);
  ok('p7 o corpo pesca pela mesma porta', tk.ok && !!o && o.label === P.GEAR[P.how(town.fac)].label && r.ok && !!line && held && s1 < s0 - 0.5 && !bad().length,
    `${v.name} pelo deus: a oferta "${o ? o.label : '—'}"${o && !o.ok ? ` (${o.why})` : ''}; ${tries} lançamento(s): ${r.ok ? r.msg : r.why}; nas mãos ${held ? v.carry.n + ' de ' + (v.carry.k === 'food' ? 'comida' : v.carry.k) + ' (' + v.carry.fish + ')' : 'NADA'}; no livro ${line ? `'pesca' ${line[6]} para ${line[4]}` : 'NADA'}; o pesqueiro ${r2(s0)} → ${r2(s1)}`);
  if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true });
}
// ---------------- p8: no water, ice, a water too deep for the people's way: no fishing
{
  const v = person(town);
  // (inland: the town's centre, or the driest tile near it)
  let inland = null; for (let r = 0; r < 20 && !inland; r++) for (let dy = -r; dy <= r && !inland; dy++) for (let dx = -r; dx <= r; dx++) { const x = Math.floor(town.cx) + dx, y = Math.floor(town.cy) + dy; if (W.inb(x, y) && W.walkable(y * N + x) && !P.edge(x + 0.5, y + 0.5, 2.5)) { inland = [x + 0.5, y + 0.5]; break; } }
  const none = inland ? !A.offers(v, inland[0], inland[1], 1.6).some(q => q.def === 'pesca') : false;
  // (ice on the water at the edge — the god's winter: the test's hand on S.ice)
  const sp4 = fresh(); const j = W.idx(sp4.wx, sp4.wy);
  const ice0 = S.ice; S.ice = S.ice || new Uint8Array(N * N); const was = S.ice[j]; S.ice[j] = 1;
  const iced = P.can(v, sp4.wx, sp4.wy, 'linha'); S.ice[j] = was; if (!ice0) S.ice = ice0;
  // (deep water from the shore with bare hands)
  let deep = null; for (let i = 0; i < N * N && !deep; i++) if (S.type[i] === T.DEEP) deep = [(i % N) + 0.5, Math.floor(i / N) + 0.5];
  const hands = deep ? P.can(v, deep[0], deep[1], 'maos') : { ok: false, why: 'sem água funda no mapa' };
  ok('p8 sem água, sem pesca', none && !iced.ok && /congelada/.test(iced.why) && !hands.ok && !bad().length,
    `no meio da terra ${inland ? (none ? 'nenhuma oferta de pesca' : 'HÁ oferta de pesca') : 'nenhum lugar seco'}; na água congelada: ${iced.ok ? 'PESCA' : iced.why}; com as mãos na água funda: ${hands.ok ? 'PESCA' : hands.why}`);
}
// ---------------- p9: a storm takes everyone off the water's edge
{
  const v = person(town); const sp5 = fresh(); atEdge(v, sp5);
  S.weather.storm = 1;
  const c = P.can(v, sp5.wx, sp5.wy, P.how(town.fac));
  G.Vg.setTask(v, { type: 'fish', spot: W.idx(sp5.lx, sp5.ly), x: sp5.lx, y: sp5.ly, wx: Math.sign(sp5.wx - sp5.lx), wy: Math.sign(sp5.wy - sp5.ly), pri: 1 });
  const L0 = S.ledgerN; fine(40, () => { S.weather.storm = 1; return false; });
  const caught = book(e => e[0] > L0 && e[8] === 'pesca').length;
  S.weather.storm = 0;
  ok('p9 a tempestade', !c.ok && /tempestade/.test(c.why) && !caught && !(v.task && v.task.type === 'fish') && !bad().length,
    `na tempestade: "${c.why}"; ${v.name} mandado pescar: ${v.task ? 'agora ' + v.task.type : 'parou'}; peixes pegos no mundo inteiro em 40 s de tempestade: ${caught}`);
}
// ---------------- p10: the one who fishes dies with the catch in the hands
{
  const v = person(town); const sp6 = fresh(); atEdge(v, sp6); v.fishXp = 200;
  let r = { ok: false }; for (let k = 0; k < 60 && !r.ok; k++) r = P.cast(v, sp6.wx, sp6.wy);
  const n = v.carry ? v.carry.n : 0; const vid = v.id;
  G.Village.kill(v, 'teste'); M.viver(1);
  ok('p10 morre com o peixe na mão', r.ok && n >= 1 && !S.villagers.has(vid) && !bad().length && M.limpo(), `${r.ok ? `pegou ${n} e morreu na beira d'água` : 'não pegou nada'}: o verificador ${bad().length ? bad()[0].msg : 'limpo'}, sem erro de módulo: ${M.limpo()}`);
}
// ---------------- p11: the skip: the grounds stay counted
{
  M.saltar(1);
  const badG = Object.keys(S.pesca).filter(id => { const g = S.pesca[id]; const K = P.cap(+id); return !(Array.isArray(g) && isFinite(g[0]) && isFinite(g[1]) && g[0] >= 0 && g[0] <= K + 1e-6 && g[1] <= S.clock + 1); });
  const fished = Object.keys(S.pesca).length;
  ok('p11 o salto', fished >= 1 && !badG.length && !bad().length && M.limpo(), `um ano de salto: ${fished} pesqueiro(s) pescado(s) no mundo, ${badG.length ? 'INVÁLIDOS: ' + badG.slice(0, 3).join(', ') : 'todos dentro do que comportam'}`);
}
// ---------------- p12: the way of each people
{
  const ways = G.Fac.all().map(f => `${f.name} (${f.civ || '—'}): ${P.GEAR[P.how(f.id)].name}`);
  const all = G.Fac.all().every(f => P.GEAR[P.how(f.id)]);
  // (and a people that does not know the boat — the test's hand on what it knows, put back after: with bronze the line,
  // without it the spear; a people of the water knows the net anyway)
  const f = G.Fac.all().find(q => !({ nordico: 1, egipcio: 1, asteca: 1 })[q.civ]) || G.Fac.all()[0]; const k0 = Object.assign({}, f.tech.known);
  delete f.tech.known.navegacao; const withBronze = (f.tech.known.bronze = f.tech.known.bronze || G.S.day, P.how(f.id));
  delete f.tech.known.bronze; delete f.tech.known.ferro; const bare = P.how(f.id);
  f.tech.known = k0;
  const civOk = withBronze === 'linha' && bare === 'arpao';
  ok('p12 o jeito de cada povo', all && ways.length >= 2 && civOk, `${ways.join(' · ')}; ${f.name} sem barco: com bronze ${P.GEAR[withBronze].name}, sem metal ${P.GEAR[bare].name}`);
}
const e = M.erros();
ok('limpo', M.limpo(), M.limpo() ? 'sem erro de módulo nem aviso no console' : `erros de módulo ${JSON.stringify(e.mod)}; console: ${e.console.slice(0, 3).join(' | ')}`);
console.log(fails.length ? `PESCA: FALHOU (${fails.join(', ')})` : 'PESCA: ok');
process.exit(fails.length ? 1 : 0);
