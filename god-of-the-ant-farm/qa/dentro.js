// dentro: a decoração com causa (os interiores 2.0, a frente P5 — D-740 a D-749): o que um prédio mostra por dentro é o que o mundo
// tem (G.Atmos.within), posto onde pode estar (G.Dentro3D) — em Node, sem placa (qa/visual/tres-node.js: os arquivos do 3D do jogo,
// a geometria que o jogo faz), num mundo pronto (a metrópole):
//   d1 puro: o within e o plano de cada prédio duas vezes iguais, de uma cópia também; nenhum sorteio (nem o do mundo nem o do olhar)
//      e o mundo como estava
//   d2 o estoque que acaba: a cerveja de uma taverna servida até o fim (G.Depot.use) — as jarras somem da prateleira, o desenho é
//      refeito (G.Dentro3D.step) e só ele
//   d3 a família que vai dormir: com alguém acordado no escuro e o que queimar, a lamparina acesa (e a luz dela para o G.Luz3D); todos
//      deitados, ela apaga — a luz some, a coisa fica
//   d4 o povo sem tear: com o tear e a casa rica, o pano dobrado e o tapete; sem o tear nem pano no armazém, nenhum pano
//   d5 a mão do deus muda o estoque: a cerveja dada (G.Depot.make) aparece nas jarras; a carne dada, o presunto pendurado
//   d6 o save no meio: o plano de cada prédio (as coisas, os lugares, as luzes) igual antes e depois de salvar e carregar
//   d7 o verificador (qa/dentro-inv.js) limpo no mundo e de olhos abertos: uma coisa sem causa, uma flutuando e uma no corredor
//      plantadas, as três acusadas
//   d8 o desenho: as malhas por instância (uma por coisa, parte e padrão) com tantas instâncias quanto as partes que aparecem, e o
//      orçamento da biblioteca (o js/decomesh.js ≤ 2,5 MB, D-748; cada coisa no seu orçamento de triângulos)
//   d9 o prato da mesa (D-748): o mundo vivido até alguém ser servido de comer — o prato esvazia pelo que se comeu (o estágio, os
//      bocados à vista), o vapor só enquanto quente e some ao esfriar (At.COOL), um save no meio da refeição igual, o prato vazio na
//      mesa ao acabar; e o que fica na mesa depois que o freguês levanta (o registro da P7, plantado) até recolher
//   d10 as velas e as lamparinas gastam a noite (D-749): a vela no tanto que resta (a conta da P7, plantada), a chama no topo dela;
//      acabada, nenhuma; a lamparina com pouco azeite, a luz mais fraca; de manhã, a vela nova só com cera no armazém
//   d11 a lenha junto do fogo: a pilha pelo que há (a conta da taverna, plantada; e o lugar do prédio no livro — trazida, queimada)
//   d12 depois da briga: os cacos (a caneca de madeira não quebra) e a poça de vinho no chão, até alguém limpar (o registro, plantado)
//   d13 a lousa da porta: o prato do dia pelo que a cozinha tem (o cardápio), o porte da casa, por fora na parede da frente
//   d14 as mesas vivas: os ossinhos na mesa do jogo (a marca da P7, plantada); os anéis de cerveja pelos anos de doses
//   d15 a quarta onda (T7, D-880 a D-889; os estados das frentes T1, T2, T4 e T5 plantados na forma do contrato): a festa com os
//      enfeites pelo material (as guirlandas das flores e da horta, as bandeirolas só onde se tece, o estandarte do povo, as pétalas,
//      as velas da festa) e o prato do povo pelo que a receita gastou; a porta trancada (a tranca por dentro) e a arrombada (a folha
//      caída, as lascas); a poça e a roupa molhada que secam; os dados nas faces jogadas, o copo, as cartas e o monte; quem desmaiou
//      (a caneca caída, a bebida em volta); um save no meio
//  d16 a decoração por uso e por ofício (F7, D-1010, D-1011): a regra e o construtor de um uso, a regra e o desenho de um ofício, as
//      leituras de verdade (o que cada peça guarda pelo livro, o ofício pelo kit e pela origem), os casos ruins
//  d17 a luz de cada povo (D-1012, L-2252): a lamparina de cada povo e o que ela queima — a lucerna de barro (a de bronze da casa rica
//      romana), a lamparina aberta do Nilo com sal no óleo, a de pedra-sabão do norte, a de pé alto da aurora das cidades —, o ocote do
//      lago sem lamparina nem vela, a vela rica do norte, a lanterna de chifre de Roma, o braseiro do frio, os lampadários pelo que o
//      povo queima neles; cada luz pelo G.Luz3D.LAMPS; o sal, o óleo e a cera tirados pela mão do deus; o save no meio
//  d18 o pano tem dono (L-2251): com a terra mais cara posta em todo prédio, o tapete e a tapeçaria só de uma casa ou da taverna; a
//      terra cara de um prédio não é a riqueza de ninguém
//   node qa/dentro.js            ONLY=d1,d2 …
'use strict';
const path = require('path'), fs = require('fs');
const T = require('./visual/tres-node.js'); const { G, M, THREE } = T.load({ extra: ['qa/dentro-inv.js'] });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
const WORLD = process.argv[2] || 'metropole'; M.pronto(WORLD);
const D = G.Dentro3D, At = G.Atmos, Sp = G.Space, S = () => G.S;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | dentro ${name} | ${info}`); if (!c) fails.push(name); return c; };
const plan = b => Sp.planNow(b);
const taverns = () => [...S().buildings.values()].filter(b => b.built && b.type === 'taverna' && plan(b));
const houses = n => [...S().buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && plan(b)).slice(0, n);
const count = (b, ks) => D.plan(b, plan(b), true).list.filter(t => ks.includes(t.k)).length;
const fresh = () => At.flush(); // (the world changed by the test's hand within the same instant)
const inSim = fn => { G.inSim++; try { return fn(); } finally { G.inSim--; } };
// (an inside open as Build3D keeps one — its building, its plan, where its plan starts in the world, its material —, for D.draw)
const openOf = b => ({ b, p: plan(b), out: { at: [b.x * Sp.TILE, Sp.plinth(b).y0, b.y * Sp.TILE] }, MI: new THREE.MeshBasicMaterial(), shade: () => { }, items: null });
const drawOpen = o => { const grp = new THREE.Group(); const meshes = []; D.draw(o, grp, meshes); o.items = { grp, meshes }; return meshes; };
const VESSELS = ['jarra', 'jarra-alta', 'anforeta', 'pote', 'cabaca', 'jarro-madeira'];
// (the lights of the decoration: the lamp of each people, the candle, the ocote, the brazier, the lantern — D-1012)
const LUZES = ['lamparina', 'lamparina-pires', 'lamparina-pedra', 'lamparina-pe', 'vela', 'ocote', 'braseira', 'lanterna'];

if (want('d1')) {
  const cnt = [0, 0]; G.rngWatch = k => { cnt[k]++; };
  const r0 = JSON.stringify(G.S.rng); const sum = () => { let h = 0; for (const b of S().buildings.values()) h = (h * 31 + Math.round((b.hp || 0) * 7) + Object.values(b.inv || {}).reduce((a, c) => a + c, 0) * 13) % 1e9; for (const v of S().villagers.values()) h = (h * 7 + (v.inside || 0) + (v.sleeping ? 1 : 0)) % 1e9; return h; }; const h0 = sum();
  const list = taverns().concat(houses(30)); const diff = []; let n = 0, things = 0;
  for (const b of list) { const p = plan(b); const a = JSON.stringify(At.within(b)); fresh(); const c = JSON.stringify(At.within(b));
    // (a copy of the plan — with its builder, as the plan keeps it: what it keeps clear —: the same things)
    const cp = JSON.parse(JSON.stringify(p)); Object.defineProperty(cp, '_P', { enumerable: false, value: p._P });
    const pa = JSON.stringify(D.plan(b, p, true).list); const pc = JSON.stringify(D.plan(b, cp, true).list);
    n++; things += JSON.parse(pa).length; if (a !== c || pa !== pc) diff.push(`${b.type}#${b.id}`); }
  G.rngWatch = null;
  ok('d1 puro: o within e o plano iguais duas vezes e de uma cópia da planta; nenhum sorteio; o mundo como estava', n > 20 && !diff.length && !cnt[0] && !cnt[1] && JSON.stringify(G.S.rng) === r0 && sum() === h0, `${n} prédios, ${things} coisas${diff.length ? '; diferentes: ' + diff.slice(0, 5).join(', ') : ''}; sorteios do mundo ${cnt[0]}, do olhar ${cnt[1]}`);
}

if (want('d2')) {
  // ---- the stock that runs out: a tavern's beer served to the last drop
  const b = taverns().find(q => (q.inv.cerveja || 0) >= 1) || taverns()[0]; let info = '', good = false;
  if (b) {
    const beer = () => D.plan(b, plan(b), true).list.filter(t => VESSELS.includes(t.k) && /de cerveja no livro/.test(t.why)).length;
    if ((b.inv.cerveja || 0) < 3) inSim(() => G.Depot.make('b:' + b.id, 'cerveja', 3 - (b.inv.cerveja || 0), { code: 'prova' })); fresh();
    const o = openOf(b); drawOpen(o); const d0 = D.drawn(o); const v0 = beer(); const n0 = Math.floor(b.inv.cerveja + 1e-6);
    // (one unit less: one jar less; then all of it)
    inSim(() => G.Depot.use('b:' + b.id, 'cerveja', 1, { code: 'prova' })); fresh(); const v1 = beer();
    inSim(() => G.Depot.use('b:' + b.id, 'cerveja', b.inv.cerveja, { code: 'prova' })); fresh(); const v2 = beer(); const all = count(b, VESSELS);
    // (the drawing: made again by the step only when the cause changed — and its meshes in the furniture's list, the old ones gone)
    S().clock += 1; D.step(o); const d1 = D.drawn(o); const same = d1.sig; S().clock += 1; D.step(o); const d2 = D.drawn(o);
    const lost = o.items.meshes.filter(m => !o.items.grp.children.some(g => g.children && g.children.includes(m)));
    info = `${b.type}#${b.id} ${b.style}: ${n0} jarra(s) de cerveja no livro → ${v0} jarras de cerveja desenhadas, uma a menos → ${v1}, acabou → ${v2} (vasos de outras bebidas: ${all}); o desenho refeito ${d0.sig !== d1.sig ? 'sim' : 'não'} (${d0.n} → ${d1.n} coisas), de novo sem causa nova ${d2.sig === same ? 'não' : 'sim'}; malhas soltas ${lost.length}`;
    good = v0 === n0 && v1 === v0 - 1 && v2 === 0 && d0.sig !== d1.sig && d2.sig === same && !lost.length;
  }
  ok('d2 o estoque que acaba: as jarras somem da prateleira com a cerveja servida, e o desenho é refeito só então', good, info);
}

if (want('d3')) {
  // ---- the family that goes to bed: the lamp goes out
  const S0 = S(); const t0 = S0.time; S0.time = 0.8; let info = '', good = false;
  const pick = [...S0.buildings.values()].find(b => b.built && b.type === 'taverna' && plan(b) && At.within(b).luz) || houses(80).find(b => At.within(b).luz);
  if (pick) {
    const b = pick; const inside = [...S0.villagers.values()].filter(v => v.inside === b.id); const saved = inside.map(v => [v, v.sleeping]);
    // (someone awake inside: who is there, or a neighbour brought in by the test's hand)
    let guest = null; if (!inside.length) { guest = [...S0.villagers.values()].find(v => !v.inside && v.age >= 18 && !v.aboard && !v.jail); if (guest) { guest.inside = b.id; guest.sleeping = false; } } else inside.forEach(v => { v.sleeping = false; });
    fresh(); const a = D.plan(b, plan(b), true); const litA = a.list.filter(t => t.lit).length; const srcA = (G.Luz3D ? G.Luz3D.sources(b, plan(b)) : []).filter(s => /^d:/.test(String(s.id))).length;
    for (const v of S0.villagers.values()) if (v.inside === b.id) v.sleeping = true; fresh();
    const c = D.plan(b, plan(b), true); const litC = c.list.filter(t => t.lit).length; const lampsC = c.list.filter(t => LUZES.includes(t.k)).length; const srcC = (G.Luz3D ? G.Luz3D.sources(b, plan(b)) : []).filter(s => /^d:/.test(String(s.id))).length;
    for (const [v, s] of saved) v.sleeping = s; if (guest) guest.inside = 0;
    info = `${b.type}#${b.id} ${b.style} às ${S0.time}: acordados → ${litA} acesa(s), ${srcA} luz(es) da decoração no G.Luz3D; todos deitados → ${litC} acesa(s) (${lampsC} luz(es) apagada(s) no lugar), ${srcC} luz(es)`;
    good = litA > 0 && srcA === a.fontes.length && litC === 0 && srcC === 0 && lampsC >= litA;
  }
  S0.time = t0; fresh();
  ok('d3 a família que vai dormir: a lamparina acesa com alguém acordado no escuro apaga quando todos se deitam', good, info);
}

if (want('d4')) {
  // ---- the people without a loom: no cloth
  const S0 = S(); let info = '', good = false;
  const h = houses(400).find(b => At.within(b).weave && b.inv && plan(b).items.some(it => it.kind === 'arca'));
  if (h) {
    const coin0 = h.coin, el0 = h.elite; h.coin = 200; fresh();
    const cloth = () => count(h, ['pano-dobrado', 'tapete', 'tapecaria']);
    const a = cloth(); const f = G.Fac.ofSet(h.set); const L = f.eco.last || (f.eco.last = {}); const v0 = L.veste; const st0 = f.stock.tecido || 0; const ti0 = (h.inv && h.inv.tecido) || 0;
    L.veste = { tear: 0, bicho: 0, pano: 0, seda: 0 }; f.stock.tecido = 0; if (h.inv) h.inv.tecido = 0; fresh(); const c = cloth(); const W = At.within(h);
    L.veste = v0; f.stock.tecido = st0; if (h.inv) h.inv.tecido = ti0; h.coin = coin0; h.elite = el0; fresh();
    info = `${h.type}#${h.id} ${h.style} rica (200 moedas): com o tear ${a} pano(s); sem tear nem pano no armazém ${c} (o povo tece: ${W.weave})`;
    good = a > 0 && c === 0 && !W.weave;
  }
  ok('d4 o povo sem tear: o pano dobrado e o tapete só onde o povo tece', good, info);
}

if (want('d5')) {
  // ---- the god's hand changes the stock: beer given to a tavern, meat to another
  const list = taverns(); const b = list.find(q => !(q.inv.cerveja >= 1) && !(q.inv.vinho >= 1) && !(q.inv.mel >= 1)) || list[0]; let info = '', good = false;
  if (b) {
    const v0 = count(b, VESSELS), h0 = count(b, ['presunto']); const carne0 = G.Origem.parts('b:' + b.id, 'food').carne || 0;
    inSim(() => { G.Depot.make('b:' + b.id, 'cerveja', 4, { code: 'mao-do-deus' }); G.Depot.make('b:' + b.id, 'food', 2, { code: 'mao-do-deus', rec: { of: 'carne' } }); G.Origem.came && G.Origem.came('b:' + b.id, 'food', 2, 'carne', 'a mão do deus'); }); fresh();
    const v1 = count(b, VESSELS), h1 = count(b, ['presunto']); const carne1 = G.Origem.parts('b:' + b.id, 'food').carne || 0;
    info = `${b.type}#${b.id} ${b.style}: 4 de cerveja dados → vasos ${v0} → ${v1}; carne ${carne0.toFixed(1)} → ${carne1.toFixed(1)}, presuntos ${h0} → ${h1}`;
    good = v1 >= v0 + 4 && (carne1 <= carne0 + 0.1 || h1 > h0);
  }
  ok('d5 a mão do deus muda o estoque: a cerveja dada nas jarras, a carne dada pendurada', good, info);
}

if (want('d6')) {
  // ---- the save in the middle: the same things in the same places, the same lights
  const ids = taverns().concat(houses(40)).map(b => b.id); const snap = () => ids.map(id => { const b = S().buildings.get(id); const p = plan(b); if (!p) return id + ':-'; const pl = D.plan(b, p, true); return id + ':' + JSON.stringify(pl.list.map(t => [t.k, t.x, t.y, t.z, t.ry, t.key])) + ':' + JSON.stringify(pl.fontes); });
  const a = snap(); const n = a.reduce((k, s) => k + (s.match(/\["/g) || []).length, 0); M.salvarCarregar(); const c = snap(); const d = a.filter((x, k) => x !== c[k]);
  ok('d6 o save no meio: as coisas, os lugares e as luzes de cada prédio iguais antes e depois de salvar e carregar', !d.length && n > 50, `${ids.length} prédios, ${n} coisas${d.length ? '; diferentes: ' + d.slice(0, 3).map(x => x.slice(0, 80)).join(' | ') : ''}`);
}

if (want('d7')) {
  // ---- the checker: clean in the world, and its eyes open
  const list = taverns().concat(houses(60)); const out = QA.dentro(list).filter(q => q[0] <= 3);
  const b = list.find(q => q.type === 'taverna' && !At.within(q).comida.some(c => c.k === 'carne')) || list[0]; const p = plan(b); const pl = D.plan(b, p, true);
  const lv = p.entryLv || 0; const l = p.levels.find(q => q.lv === lv); const cl = D.clear(p, lv)[0]; const t0 = pl.list.find(t => t.on === 'tampo' || t.on === 'prateleira');
  const planted = [Object.assign({}, t0 || {}, { k: 'presunto', on: 'chao', x: p.items[0].x, z: p.items[0].z, y: l.y + 0.012, why: 'plantado sem causa', key: 'plantado-1', s: [1, 1, 1], ry: 0, lv }),
    t0 ? Object.assign({}, t0, { y: t0.y + 0.35, key: 'plantado-2' }) : null,
    Object.assign({ k: 'lenha', on: 'chao', x: (cl[0] + cl[2]) / 2, z: (cl[1] + cl[3]) / 2, y: l.y + 0.012, ry: 0, s: [1, 1, 1], lv, why: 'plantada no caminho', key: 'plantado-3' })].filter(Boolean);
  for (const t of planted) pl.list.push(t);
  const caught = QA.dentro([b]).map(q => q[1]); pl.list.splice(pl.list.length - planted.length, planted.length);
  const got = [caught.some(m => /presunto/.test(m) && /sem carne/.test(m)), caught.some(m => /plantado-2/.test(m) && /flutuando/.test(m)), caught.some(m => /plantado-3/.test(m) && /no caminho/.test(m))];
  ok('d7 o verificador limpo no mundo e de olhos abertos: o sem causa, o que flutua e o que fica no caminho, acusados', !out.length && got.every(Boolean), `${list.length} prédios: ${out.length} problema(s)${out.length ? ' — ' + out.slice(0, 4).map(q => q[1]).join(' | ') : ''}; plantados acusados: ${got.join(', ')}`);
}

if (want('d8')) {
  // ---- the drawing and the budget
  const b = taverns().sort((a, c) => D.plan(c, plan(c), true).list.length - D.plan(a, plan(a), true).list.length)[0]; const o = openOf(b); const meshes = drawOpen(o);
  const NM = k => (/^(comida|bebida)-/.test(k) ? k : 'deco-' + k);
  const pl = D.plan(b, plan(b), true); let parts = 0; for (const t of pl.list) parts += G.Mesh3D.parts(NM(t.k)).filter(pt => D.shows(pt, t)).length;
  let inst = 0, tris = 0; for (const m of meshes) { if (/^dentro:vapor/.test(m.name)) continue; inst += m.count; tris += m.count * m.geometry.index.count / 3; }
  const ROOT = path.join(__dirname, '..'); const kb = fs.statSync(path.join(ROOT, 'js', 'decomesh.js')).size / 1024; const B = G.DECO.budget; const bad = [];
  for (const n of Object.keys(G.MESH3D)) { if (!/^(deco|comida|bebida)-/.test(n) || /@1$/.test(n)) continue; const d = G.MESH3D[n], d1 = G.MESH3D[n + '@1']; const lim = /^(comida|bebida)-/.test(n) ? B.prato : G.DECO.big.includes(d.kind) ? B.grande : B.coisa;
    if (d.t > lim) bad.push(`${n} ${d.t} > ${lim}`); if (!d1) bad.push(`${n} sem o nível do meio`); else if (d1.t > Math.max(d.t * B.meio, B.meioMin)) bad.push(`${n}@1 ${d1.t}`);
    for (const p of d.parts) { if (!G.DECO.parts.includes(p[0])) bad.push(`${n}: parte ${p[0]}`); if (!D.paintable(p[0])) bad.push(`${n}: a parte ${p[0]} sem tinta no dentro3d.js`); } }
  ok(`d8 o desenho por instâncias e o orçamento: uma malha por coisa, parte e padrão; as instâncias as partes das coisas; o arquivo no seu orçamento (${B.arquivo} MB) e cada coisa no seu`, meshes.length > 0 && inst <= parts && inst >= parts * 0.7 && kb <= B.arquivo * 1024 && !bad.length, `${b.type}#${b.id}: ${pl.list.length} coisas, ${meshes.length} malhas, ${inst} instâncias de ${parts} partes, ${Math.round(tris)} triângulos; decomesh.js ${kb.toFixed(0)} KB${bad.length ? '; fora: ' + bad.slice(0, 4).join(', ') : ''}`);
}

// ------------------------------ what is served and the marks of the night (D-748, D-749) ------------------------------
const NM = k => (/^(comida|bebida)-/.test(k) ? k : 'deco-' + k);
const shown = t => (G.Mesh3D.parts(NM(t.k)) || []).filter(pt => D.shows(pt, t));
// (how much of the food shows: the bites still there, and the level of a broth or of a heap — the quarters left of it)
const bites = t => { const L = shown(t); return L.filter(pt => /^[bf]\d$/.test(pt)).length + (L.some(pt => /^n(\d|v)$/.test(pt)) ? 4 - (t.st | 0) : 0); };
const dentroQA = b => QA.dentro([b]).filter(q => q[0] <= 3);
// (a tavern with the night going: the world lived from the evening until someone at its tables has just been served — kept for the
// parts after; k, what was served: the plate, or anything)
let BUSY = null;
function busy(k) {
  const look = () => { for (const b of taverns()) { const op = G.Taverna.dia(b); if (!op) continue;
    for (const id of Object.keys(op.data.mesa)) { const m = op.data.mesa[id]; const v = S().villagers.get(+id); if (v && v.carry && v.carry.op === op.id && m.st === 3 && !m.corpo && (!k || v.carry.k === k) && S().clock - (m.cup || 0) < 1.2 && S().time < G.Taverna.leaveOf(v, b) - 0.08) return { b, v, op }; } } return null; };
  if (BUSY && (!k || BUSY.k === k)) return BUSY;
  const S0 = S(); if (S0.time < 0.55 || S0.time > 0.95) S0.time = 0.62; let f = null, w = 0;
  for (; w < 420 && !(f = look()); w += 0.5) M.viver(0.5);
  BUSY = f ? Object.assign(f, { k, w }) : null; return BUSY;
}
// (the thing of a guest's at the tables: his plate, his cup)
const ofGuest = (b, id, what) => D.plan(b, plan(b), true).list.find(t => t.key.endsWith(`/mesa/${id}/${what}`)) || null;

if (want('d9')) {
  // ---- the plate that empties by what was eaten, the steam that goes as it cools, the empty cup on the table until the keeper takes
  // it — and a save in the middle of the meal
  let info = '', good = false; const f = busy('food');
  if (f) {
    let b = f.b; const vid = f.v.id; const bid = b.id; let o = openOf(b); drawOpen(o); const rows = []; let saved = null, after = null, endSeen = null;
    const sample = () => { b = S().buildings.get(bid); fresh(); const W = At.within(b); const q = W.mesa.find(x => x.id === vid); const t = ofGuest(b, vid, 'prato');
      D.step(o); const d = D.drawn(o); return { c: +S().clock.toFixed(1), q, t, st: t ? t.st | 0 : -1, bites: t ? bites(t) : -1, quente: q ? q.quente : 0, steam: d ? d.steam : 0, heat: d && d.heat.length ? d.heat[0][0] : 0 }; };
    for (let k = 0; k < 16; k++) {
      const r = sample(); rows.push(r); if (!r.q || r.q.ps === 4 || !r.q.prato) { endSeen = r; break; }
      // (the save in the middle: the stage, the plate and its steam the same after it)
      if (!saved && r.st >= 1) { const a = JSON.stringify([r.q, r.t && [r.t.k, r.t.st, r.t.quente, r.t.x, r.t.z]]); M.salvarCarregar(); b = S().buildings.get(bid); o = openOf(b); drawOpen(o); const r2 = sample();
        saved = a === JSON.stringify([r2.q, r2.t && [r2.t.k, r2.t.st, r2.t.quente, r2.t.x, r2.t.z]]); after = r2; }
      M.viver(1);
    }
    const eat = rows.filter(r => r.q && r.q.prato && r.q.ps < 4); const mono = eat.every((r, i) => !i || r.st >= eat[i - 1].st) && eat.every(r => r.st === r.q.ps);
    const fewer = eat.length > 1 && eat[eat.length - 1].bites < eat[0].bites; const hot0 = eat[0] && eat[0].quente;
    const cooled = eat.filter(r => r.c - (eat[0].q.t0 || 0) >= At.COOL + 1); const steamGone = !hot0 || (cooled.length ? cooled.every(r => !r.quente && r.steam === 0) : true);
    const steamFirst = !hot0 || (eat[0].steam > 0 && eat.filter(r => r.quente).every((r, i, L) => !i || r.heat <= L[i - 1].heat + 1e-6));
    // (done: the empty plate of the meal on the table while the guest sits on — the round's own; gone with the guest, or with the next round served)
    // (the empty plate on the table: the world's record of what is left — P7's d.sujo, the dish its own — or, without it, the round's)
    const leftPlate = endSeen ? D.plan(S().buildings.get(bid), plan(S().buildings.get(bid)), true).list.find(t => /^comida-/.test(t.k) && (t.st | 0) === 4 && (/\/mesa\/s/.test(t.key) || t.key.endsWith(`/mesa/${vid}/prato`))) : null;
    const gw = S().villagers.get(vid); const doneOk = !endSeen || !!leftPlate || !gw || gw.inside !== bid; // (or the guest gone, and the keeper's hands took it)
    if (endSeen && leftPlate) endSeen.t = leftPlate;
    info = `taverna#${bid}: #${vid} comendo ${f.op.data.mesa[vid] ? '' : ''}(${eat[0] ? eat[0].t && eat[0].t.k : '-'}), achado depois de ${f.w} s do mundo; estágios ${eat.map(r => r.st).join('→')}, comida à vista ${eat.map(r => r.bites).join('→')}; vapor ${hot0 ? `${eat.map(r => r.steam).join('')} (calor ${eat.filter(r => r.steam).map(r => r.heat.toFixed(2)).join('→')})` : 'nenhum (prato frio)'}; save no meio ${saved === null ? 'não houve' : saved ? 'igual' : 'DIFERENTE'}; ao acabar ${endSeen ? (endSeen.t ? `${endSeen.t.k} st ${endSeen.t.st | 0} na mesa (${/\/mesa\/s/.test(endSeen.t.key) ? 'o registro do que ficou na mesa, P7' : 'a rodada acabada'})` : endSeen.q ? `- (${endSeen.q.why})` : 'levantou-se: a mesa limpa') : 'ainda comendo'}`;
    good = eat.length >= 3 && mono && fewer && steamFirst && steamGone && saved !== false && doneOk && !dentroQA(b).length;
  } else info = 'nenhuma taverna serviu de comer em 420 s do mundo';
  // (what the guests leave once up, until the keeper's hands take it — P7's record, read when it is kept: the empty cup on the table)
  const b = taverns().find(q => G.Taverna.dia(q)) || taverns()[0]; let left = '';
  if (b) { const p = plan(b); const tabs = p.items.filter(it => /^mesa/.test(it.kind)); let s = null, slv = 0;
    for (const it of p.items) for (const sp of it.spots || []) if (!s && sp.use === 'sentar' && tabs.some(t => t.lv === it.lv && Math.hypot(Math.max(t.r[0] - sp.x, 0, sp.x - t.r[2]), Math.max(t.r[1] - sp.z, 0, sp.z - t.r[3])) < 0.8)) { s = sp; slv = it.lv; }
    if (s) { b.sujo = [{ x: s.x, z: s.z, lv: slv, k: 'cerveja', resto: 0 }, { x: s.x, z: s.z, lv: slv, k: 'food', prato: 'peixe', resto: 0.4 }]; fresh();
      const L = D.plan(b, p, true).list.filter(t => /\/mesa\/s/.test(t.key)); const cup = L.find(t => /^bebida-/.test(t.k)), dish = L.find(t => /^comida-/.test(t.k));
      const qa1 = dentroQA(b); delete b.sujo; fresh(); const L2 = D.plan(b, p, true).list.filter(t => /\/mesa\/s/.test(t.key));
      left = `; o que ficou na mesa (o registro da P7): ${cup ? `${cup.k} st ${cup.st}` : 'sem caneca'}, ${dish ? `${dish.k} st ${dish.st} (com resto)` : 'sem prato'} → recolhido: ${L2.length} coisa(s)`;
      good = good && !!cup && cup.st === 4 && !!dish && dish.k === 'comida-peixe' && dish.st === 2 && !L2.length && !qa1.length; } }
  ok('d9 o prato esvazia pelo que se comeu, o vapor some ao esfriar, o vazio fica na mesa até recolher, o save no meio', good, info + left);
}

if (want('d10')) {
  // ---- the candles and the lamps spend the night: the candle as much of it as is left (T.luz — P7's count of what burnt by the book —,
  // planted here), the flame at its top; burnt out, none; the lamp low on oil, its light lower; the morning's new candle only with wax
  const T0 = G.Taverna, was = T0.luz; const S0 = S(); const t0 = S0.time; S0.time = 0.8; let info = '', good = false;
  // (a tavern of a people that lights candles and lamps of oil — Rome's, G.Atmos.LUZ, D-1012 —, else the first read as Rome's: its style)
  const b = taverns().find(q => (At.LUZ[q.style] || At.LUZ.classico).vela === 1) || taverns()[0]; const f = b && G.Fac.ofSet(b.set); const st0 = b ? b.style : null;
  if (b && (At.LUZ[b.style] || At.LUZ.classico).vela !== 1) b.style = 'romano';
  if (b && f) {
    const inside = [...S0.villagers.values()].filter(v => v.inside === b.id); let guest = null; if (!inside.some(v => !v.sleeping)) { guest = [...S0.villagers.values()].find(v => !v.inside && v.age >= 18 && !v.aboard && !v.jail); if (guest) { guest.inside = b.id; guest.sleeping = false; } }
    inSim(() => { G.Depot.make('f:' + f.id, 'cera', 3, { code: 'prova' }); });
    const read = (vela, azeite) => { T0.luz = vela === undefined ? was : () => ({ vela, azeite }); fresh(); const pl = D.plan(b, plan(b), true); const c = pl.list.filter(t => t.k === 'vela'); const l = pl.list.filter(t => t.k === 'lamparina');
      return { c: c.length, vs: c.length ? c[0].vs | 0 : -1, l: l.length, fy: pl.fontes.filter(s => s.kind === 'vela').map(s => s.y), fl: pl.fontes.filter(s => s.kind === 'lamparina').map(s => s.forca), qa: dentroQA(b).length }; };
    const whole = read(1, 0), half = read(0.45, 0), stub = read(0.1, 0), out = read(0, 0), oilFull = read(0, 1), oilLow = read(0, 0.12);
    // (the morning, uncounted: the candle stands only with wax in the store)
    // (no count of tonight's: the house's real one — P7's T.luz, D-811 — lit by an earlier part's evening, left out here, T-1830)
    T0.luz = () => ({}); inSim(() => G.Depot.use('f:' + f.id, 'cera', f.stock.cera || 0, { code: 'prova' })); fresh(); const noWax = D.plan(b, plan(b), true).list.filter(t => t.k === 'vela').length;
    inSim(() => G.Depot.make('f:' + f.id, 'cera', 2, { code: 'prova' })); fresh(); const wax = D.plan(b, plan(b), true).list.filter(t => t.k === 'vela' || t.k === 'lamparina').length;
    if (guest) guest.inside = 0;
    info = `taverna#${b.id} ${st0 === b.style ? b.style : st0 + ' lida como romana'}: a vela inteira → ${whole.c} vela(s) no tanto ${whole.vs}, chama a ${whole.fy[0] && whole.fy[0].toFixed(3)}; 55% gasta → ${half.vs}, chama a ${half.fy[0] && half.fy[0].toFixed(3)}; um toco → ${stub.vs}; acabou → ${out.c} vela(s), ${out.l} lamparina(s); o azeite cheio → luz ${oilFull.fl[0]}, quase no fim → ${oilLow.fl[0]}; de manhã sem cera no armazém → ${noWax} vela(s), com cera → ${wax} luz(es) na mesa`;
    good = whole.c > 0 && whole.vs === 0 && half.vs === 2 && stub.vs === 3 && half.fy[0] < whole.fy[0] && stub.fy[0] < half.fy[0] && out.c === 0 && out.l === 0 && oilFull.l > 0 && oilLow.fl[0] < oilFull.fl[0] && noWax === 0 && wax > 0 && [whole, half, stub, out, oilFull, oilLow].every(r => !r.qa);
  }
  if (b) b.style = st0; T0.luz = was; S0.time = t0; fresh();
  ok('d10 as velas e as lamparinas gastam a noite: a vela pelo que resta, a chama no topo dela, a lamparina pelo azeite; a vela nova só com cera', good, info);
}

if (want('d11')) {
  // ---- the firewood by the fire goes down as the fire burns it and comes back when someone brings it from the store: the tavern's
  // own count (T.luz, planted), and the building's own wood in the book (G.Depot: burnt by 'lenha', brought by a move)
  const T0 = G.Taverna, was = T0.luz; let info = '', good = false;
  const b = taverns().find(q => plan(q).items.some(it => it.fire));
  if (b) {
    const pile = () => { fresh(); const t = D.plan(b, plan(b), true).list.find(x => x.k === 'lenha'); return t ? 4 - (t.st | 0) : 0; };
    const logs = () => { const t = D.plan(b, plan(b), true).list.find(x => x.k === 'lenha'); return t ? shown(t).length : 0; };
    const counted = [2, 1.2, 0.3, 0].map(n => { T0.luz = () => ({ lenha: n }); const q = pile(); return [n, q, logs()]; });
    T0.luz = was;
    // (the building's own wood: brought from the store, burnt, brought again)
    const f = G.Fac.ofSet(b.set); const book = [];
    // (from none: the keeper buys the night's wood — P7's D-811 —, and an earlier part's evening may have left some by the fire, T-1830)
    if ((b.inv && b.inv.wood) > 0) inSim(() => G.Depot.use('b:' + b.id, 'wood', b.inv.wood, { code: 'prova' }));
    const r0 = inSim(() => G.Depot.move('f:' + f.id, 'b:' + b.id, 'wood', 2, { code: 'prova' }));
    if (r0 && r0.ok) { book.push(['trazida 2', pile()]); inSim(() => G.Depot.use('b:' + b.id, 'wood', 1.6, { code: 'lenha' })); book.push(['queimou 1,6', pile()]);
      inSim(() => G.Depot.use('b:' + b.id, 'wood', b.inv.wood || 0, { code: 'lenha' })); book.push(['queimou tudo', pile()]);
      inSim(() => G.Depot.move('f:' + f.id, 'b:' + b.id, 'wood', 1, { code: 'prova' })); book.push(['trazida 1', pile()]); }
    info = `taverna#${b.id}: pela conta da taverna ${counted.map(([n, q, l]) => `${n} de lenha → ${q}/4 da pilha (${l} parte(s))`).join(', ')}; pelo livro ${book.length ? book.map(([w, q]) => `${w} → ${q}/4`).join(', ') : `o lugar do prédio não guarda lenha (${r0 && r0.why})`}`;
    good = counted[0][1] === 4 && counted[1][1] === 3 && counted[2][1] === 1 && counted[3][1] === 0 && counted[0][2] > counted[2][2] && (!book.length || (book[0][1] === 4 && book[1][1] === 1 && book[2][1] === 0 && book[3][1] === 2)) && !dentroQA(b).length;
  }
  T0.luz = was; fresh();
  ok('d11 a lenha junto do fogo diminui pelo que o fogo queima e volta quando alguém a traz', good, info);
}

if (want('d12')) {
  // ---- after a brawl: the shards of the mug broken on the floor (of clay; the mug of turned wood lies whole), the spill until someone
  // cleans it — P7's record (b.chao), planted at two points of the floor
  let info = '', good = false; const b = taverns().find(q => G.Atmos.within(q).barro) || taverns()[0];
  if (b) {
    const p = plan(b); const lv = p.entryLv || 0; const C = G.Interiors.CELL; const pts = [];
    for (let z = 0.5; z < p.lot.w && pts.length < 2; z += 0.37) for (let x = 0.5; x < p.lot.w && pts.length < 2; x += 0.41) if (G.Interiors.cell(b, lv, x, z) === C.FLOOR && G.Interiors.cell(b, lv, x + 0.3, z) === C.FLOOR && !pts.some(q => Math.hypot(q[0] - x, q[1] - z) < 1)) pts.push([x, z]);
    b.chao = [{ k: 'cacos', x: pts[0][0], z: pts[0][1], lv }, { k: 'poca', x: pts[1][0], z: pts[1][1], lv, bebida: 'vinho', n: 0.8 }]; fresh();
    const W = G.Atmos.within(b); const L = D.plan(b, p, true).list.filter(t => t.solto); const shard = L.find(t => t.k === 'cacos' || t.k === 'caneca-caida'), pool = L.find(t => t.k === 'poca');
    const o = openOf(b); drawOpen(o); const qa1 = dentroQA(b);
    delete b.chao; fresh(); const L2 = D.plan(b, p, true).list.filter(t => t.solto);
    info = `taverna#${b.id} (${W.barro ? 'o povo tem barro' : 'sem barro'}): ${shard ? shard.k : 'nada'} e ${pool ? `poça de vinho (cor ${pool.c && pool.c.liquido}, ${pool.s[0]} da poça)` : 'nada'} no chão; o verificador ${qa1.length ? qa1.map(q => q[1]).join(' | ') : 'limpo'}; limpo o chão → ${L2.length} coisa(s)`;
    good = !!shard && shard.k === (W.barro ? 'cacos' : 'caneca-caida') && !!pool && pool.c && pool.c.liquido[0] < 120 && Math.abs(pool.s[0] - 0.8) < 1e-6 && !qa1.length && !L2.length;
  }
  ok('d12 depois da briga: os cacos da caneca e a poça do que se derramou no chão, até alguém limpar', good, info);
}

if (want('d13')) {
  // ---- the slate at the door: the dish of the day by what the kitchen has today — the menu's own reading —, outside on the front wall
  // by the door, at the eyes; the slate, the board or the painted plaque by the house's porte
  let info = '', good = false; const T0 = G.Taverna; const b = taverns().find(q => G.Depot.get('b:' + q.id, 'food') >= 1) || taverns()[0];
  if (b) {
    const read = () => { fresh(); const W = G.Atmos.within(b); const t = D.plan(b, plan(b), true).list.find(x => x.on === 'fora'); return { W, t, words: t ? D.words(t.lousa) : [] }; };
    const a = read(); const look = T0.look(b); const dish = T0.cartaOf(b).find(x => x.sort === 'comer' && x.ok);
    const food = G.Depot.get('b:' + b.id, 'food'); inSim(() => G.Depot.use('b:' + b.id, 'food', food, { code: 'prova' })); const c = read();
    inSim(() => G.Depot.make('b:' + b.id, 'food', 2, { code: 'prova' })); const d = read();
    const o = openOf(b); drawOpen(o); const qa1 = dentroQA(b);
    info = `taverna#${b.id} ${b.style} (porte ${look.porte}: ${look.why || '-'}): ${a.t ? `${a.t.k} na parede da frente a ${a.t.y.toFixed(2)} m` : 'sem lousa'} — «${a.words.join(' / ')}» (o cardápio: ${dish ? dish.nome : 'nada'}); a cozinha sem comida → «${c.words.join(' / ')}»; comida de novo → «${d.words.join(' / ')}»; o verificador ${qa1.length ? qa1.map(q => q[1]).join(' | ') : 'limpo'}`;
    const K = { carta: 'placa', quadro: 'quadro', lousa: 'lousa' };
    good = !!a.t && a.t.k === K[look.porte] && (!dish || a.t.lousa.prato.de === (dish.de || '?')) && c.t && c.words[1] === 'Sem comida' && d.t && d.words[1] !== 'Sem comida' && !qa1.length;
  }
  ok('d13 a lousa na porta diz o prato do dia pelo que a cozinha tem, com o porte da casa', good, info);
}

if (want('d14')) {
  // ---- the living tables: the knucklebones on the table where a game is played (P7's mark at the table, planted), the rings of beer
  // of the years of doses on the boards
  let info = '', good = false; const f = busy();
  const b = f ? S().buildings.get(f.b.id) : taverns()[0];
  if (b) {
    const op = G.Taverna.dia(b); const seated = op ? Object.keys(op.data.mesa).filter(id => { const v = S().villagers.get(+id); const pl = v && G.Interiors.placeOf(v); return pl && !op.data.mesa[id].corpo; }) : [];
    let game = 'sem freguês sentado';
    // (the world's own games at the tables — P7's living tavern, D-806 — counted first: the planted one is one more, and gone again, T-1830)
    const gOf = id => String(op.data.mesa[id].g); const playing = new Set(seated.filter(id => op.data.mesa[id].jogo || S().villagers.get(+id).act === 'jogo-ossos').map(gOf).concat(Object.keys(op.data.jogo || {})));
    const seatedFree = seated.filter(id => !playing.has(gOf(id)));
    // (one at a table — a seat by the fire has no board for the bones —: the first of them whose planted game shows)
    { const nb = () => { fresh(); return D.plan(b, plan(b), true).list.filter(t => t.k === 'ossos').length; }; const b0 = nb(); const hit = seatedFree.find(id => { const m = op.data.mesa[id]; m.jogo = 1; const n = nb(); delete m.jogo; return n > b0; }); if (hit) seatedFree.splice(0, seatedFree.length, hit, ...seatedFree.filter(id => id !== hit)); } if (seatedFree.length) seated.splice(0, seated.length, ...seatedFree);
    const nw = () => { fresh(); return D.plan(b, plan(b), true).list.filter(t => t.k === 'ossos').length; }; const nBase = seated.length ? nw() : 0;
    if (seated.length) { const m = op.data.mesa[seated[0]]; m.jogo = 1; fresh(); const n1 = D.plan(b, plan(b), true).list.filter(t => t.k === 'ossos').length - nBase; const qa1 = dentroQA(b); delete m.jogo; fresh(); const n0 = D.plan(b, plan(b), true).list.filter(t => t.k === 'ossos').length - nBase;
      game = `o jogo à mesa de #${seated[0]} → ${n1} jogo(s) de ossinhos; acabou → ${n0}${qa1.length ? '; ' + qa1.map(q => q[1]).join(' | ') : ''}`; good = n1 === 1 && n0 === 0 && !qa1.length; }
    const sv = b.served; const rings = n => { b.served = n; fresh(); return D.plan(b, plan(b), true).list.filter(t => /^mancha-/.test(t.k)).length; };
    const r0 = rings(0), r1 = rings(60), r2 = rings(400); const qa2 = dentroQA(b); b.served = sv; fresh();
    // (the keeper's cloth over his shoulder: said by within, given to the drawing of the body by G.Dentro3D.ombro)
    fresh(); const Wb = G.Atmos.within(b); const om = Wb.ombro ? D.ombro(S().villagers.get(Wb.ombro.id)) : null;
    info = `taverna#${b.id}: ${game}; anéis de cerveja com 0 doses → ${r0}, 60 → ${r1}, 400 → ${r2}; o pano no ombro ${Wb.ombro ? (om ? `de #${Wb.ombro.id} (${om.parts.join(', ')})` : 'SEM o desenho') : `nenhum (${G.Atmos.within(b).weave ? 'o taverneiro fora do balcão' : 'o povo não tece'})`}${qa2.length ? '; ' + qa2.map(q => q[1]).join(' | ') : ''}`;
    good = good && r0 === 0 && r1 === 3 && r2 >= 6 && r2 <= 10 && !qa2.length && (!Wb.ombro || (!!om && om.parts.length > 0));
  }
  ok('d14 as mesas vivas: os ossinhos na mesa do jogo, os anéis de cerveja pelos anos de doses', good, info);
}

// ------------------------------ the fourth wave: what is seen of it (the front T7, D-880 to D-889) ------------------------------
if (want('d15')) {
  // ---- the feast with its decorations by what each is made of and its platter by what the recipe spent; the door barred and the door
  // broken in; the spill and the wet clothes that dry; the games at the tables; who fainted; and a save in the middle. The states of the
  // fronts T1, T2, T4 and T5 planted in the contract's form (planos/taverna-onda4.md), as their fronts will write them
  let info = [], good = true; const In = G.Interiors; const b = taverns().find(q => plan(q).items.some(it => /^mesa/.test(it.kind))) || taverns()[0];
  const p = plan(b); const S0 = S(); const list = () => { fresh(); return D.plan(b, plan(b), true).list; };
  const kinds = L => L.reduce((o, t) => (o[t.k] = (o[t.k] || 0) + 1, o), {});
  const check = (name, c, txt) => { info.push(`${c ? '' : '✗ '}${name}: ${txt}`); if (!c) good = false; };
  // (1) the feast
  const W0 = At.within(b); const civ = W0.civ;
  // (the feast in the form the front T1 keeps it — its motive one of TF.MOTIVOS, its bards, its phase —: the save drops any other, T-2151)
  b.festa = { motivo: 'conquista', causa: 'a vitória do reino', dia: S0.day, ate: S0.day, prato: { de: ['carne', 'fruta', 'trigo'] }, bardos: [], fase: 1,
    enfeites: [{ k: 'guirlanda', de: 'flora' }, { k: 'guirlanda', de: 'horta' }, { k: 'fita', de: 'pano' }, { k: 'estandarte', de: 'pano' }, { k: 'petalas', de: 'flora' }, { k: 'vela', de: 'cera' }, { k: 'fogos', de: 'nada' }] };
  let L = list(); let K = kinds(L); const W1 = At.within(b);
  const plat = L.find(t => /^comida-festa-/.test(t.k)); const shownX = plat ? shown(plat).filter(pt => /^x-/.test(pt)).sort() : [];
  check('a festa', !!K['guirlanda-flores'] && !!K['guirlanda-horta'] && (W1.weave ? !!K.bandeirolas : !K.bandeirolas) && !!K['estandarte-' + civ] && !!K.petalas && L.some(t => t.k === 'vela' && t.festa) && !!plat && plat.k === 'comida-festa-' + civ && JSON.stringify(shownX) === JSON.stringify(['x-carne', 'x-fruta', 'x-pao']) && !W1.festa.enfeites.some(e => e.k === 'fogos'),
    `${civ}, ${W1.weave ? 'o povo tece' : 'sem tear'}: guirlanda de flores ${K['guirlanda-flores'] || 0}, da horta ${K['guirlanda-horta'] || 0}, bandeirolas ${K.bandeirolas || 0}, estandarte ${K['estandarte-' + civ] || 0}, pétalas ${K.petalas || 0}, velas da festa ${L.filter(t => t.k === 'vela' && t.festa).length}; o prato ${plat ? plat.k : '-'} com ${shownX.join('+')} (a receita: carne, fruta, trigo); o enfeite sem material conhecido fora`);
  const qaF = dentroQA(b); check('o verificador na festa', !qaF.length, qaF.length ? qaF.map(q => q[1]).join(' | ') : 'limpo');
  // (2) the door: barred (the world's own door state: a person made it so, b.ip.dr) and broken in (T1's state, planted by its door)
  const door = p.entrance ? p.entrance.door : -1; const dr0 = b.ip.dr ? Object.assign({}, b.ip.dr) : null; const bar0 = list().some(t => t.k === 'tranca'); // (the world's own door, before: locked by the house's rule at night, perhaps)
  b.ip.dr = Object.assign({}, b.ip.dr || {}, { [door]: 2 }); L = list(); const bar = L.find(t => t.k === 'tranca');
  check('a porta trancada', !!bar && bar.on === 'parede' && In.doorState(b, door).state === 'trancada', bar ? `a tranca atravessada por dentro, a ${bar.y.toFixed(2)} m, ${bar.s[0].toFixed(2)} da largura` : 'sem tranca');
  // (the save in the middle: the feast, the barred door and a spill as they were — the things in the same places)
  b.chao = [{ k: 'poca', x: p.entrance ? p.entrance.x : 2, z: p.entrance ? p.entrance.z : 2, lv: 0, bebida: 'vinho', n: 1, t: Math.round(S0.clock * 10) / 10 }];
  const snap = () => JSON.stringify(D.plan(S().buildings.get(b.id), plan(S().buildings.get(b.id)), true).list.filter(t => t.festa || /^(tranca|poca)$/.test(t.k)).map(t => [t.k, t.x, t.y, t.z, t.de || null]));
  fresh(); const before = snap(); M.salvarCarregar(); fresh(); const after = snap(); const b2 = S().buildings.get(b.id);
  check('o save no meio', before === after && before.length > 20, `${JSON.parse(before).length} coisas da festa, da porta e do chão — ${before === after ? 'iguais' : 'DIFERENTES'} depois de salvar e carregar`);
  // (broken in: the leaf fallen inside, the splinters — the leaf in the doorway not drawn)
  const ds = In.doorState; In.doorState = (bb, id) => (bb && bb.id === b2.id && id === door ? { state: 'arrombada', by: 'prova' } : ds(bb, id));
  L = (() => { fresh(); return D.plan(b2, plan(b2), true).list; })(); const fallen = L.find(t => t.k === 'porta-caida'), spl = L.find(t => t.k === 'lascas');
  const qaD = QA.dentro([b2]).filter(q => q[0] <= 3); In.doorState = ds;
  check('a porta arrombada', !!fallen && !!spl && fallen.solto && !L.some(t => t.k === 'tranca') && !qaD.length, `${fallen ? 'a folha caída dentro' : 'sem folha'}, ${spl ? 'as lascas na soleira' : 'sem lascas'}${qaD.length ? '; ' + qaD.map(q => q[1]).join(' | ') : ''}`);
  // (3) the spill that dries, the wet clothes that dry
  const pool = () => { fresh(); const t = D.plan(b2, plan(b2), true).list.find(x => x.k === 'poca' && /^chao\//.test(x.key)); return t ? +t.s[0].toFixed(2) : 0; };
  b2.chao = [{ k: 'poca', x: 0, z: 0, lv: 0, bebida: 'cerveja', n: 1, t: S().clock }];
  { const C = In.CELL; let at = null; for (let z = 0.6; z < p.lot.w && !at; z += 0.4) for (let x = 0.6; x < p.lot.w && !at; x += 0.4) if (In.cell(b2, 0, x, z) === C.FLOOR) at = [x, z]; b2.chao[0].x = at[0]; b2.chao[0].z = at[1]; }
  const p0 = pool(); S().clock += 12; const p1 = pool(); S().clock += 14; const p2 = pool(); S().clock -= 26; delete b2.chao;
  const v = [...S().villagers.values()].find(q => q.age >= 18 && !q.inside); const mo0 = v.molhado; v.molhado = { t: S().clock, k: 'vinho' };
  const m0 = At.molhado(v); S().clock += 15; const m1 = At.molhado(v); S().clock += 16; const m2 = At.molhado(v); S().clock -= 31; v.molhado = mo0;
  check('a poça e o molhado que secam', p0 > p1 && p1 > 0 && p2 === 0 && m0 && m0.n === 1 && m0.k === 'vinho' && m1 && m1.n > 0.4 && m1.n < 0.6 && !m2, `a poça ${p0} → 12 s ${p1} → 26 s ${p2 || 'seca'}; a roupa molhada de vinho ${m0 && m0.n} → 15 s ${m1 && m1.n} → 31 s ${m2 ? m2.n : 'seca'}`);
  // (4) the games at a table: the dice on the faces thrown, their cup; the tablets of the game of cards and the deck (T4's and T5's
  // doors, planted)
  const pj = plan(b2); const tab = pj.items.find(it => /^mesa/.test(it.kind) && D.surfacesOf(b2, pj).some(s => s.it === it && s.k === 'tampo' && s.w > 0.5)); const g0 = tab ? In.groupOf(b2, tab.id) : -1;
  G.JogoDados = { atMesa: (bb, g) => (bb.id === b2.id && g === g0 ? { dados: [6, 3, 1], copo: 1, mat: 'osso' } : null) };
  G.Cartas = { atMesa: (bb, g) => (bb.id === b2.id && g === g0 ? { mesa: 3, maos: 2, monte: 12, mat: 'papiro' } : null) };
  L = (() => { fresh(); return D.plan(b2, plan(b2), true).list; })(); const dice = L.filter(t => t.k === 'dado'); const cup = L.find(t => t.k === 'copo-dados'), cards = L.find(t => t.k === 'cartas'), deck = L.find(t => t.k === 'monte');
  const qaJ = QA.dentro([b2]).filter(q => q[0] <= 3); delete G.JogoDados; delete G.Cartas; L = (() => { fresh(); return D.plan(b2, plan(b2), true).list; })();
  check('os jogos na mesa', dice.length === 3 && JSON.stringify(dice.map(t => t.face)) === '[6,3,1]' && !!dice[0].pre && !dice[2].pre && !!cup && !!cards && cards.cmat === 'papiro' && !!deck && !qaJ.length && !L.some(t => /^(dado|cartas|monte|copo-dados)$/.test(t.k)),
    `${dice.length} dados nas faces ${dice.map(t => t.face).join(', ')}, o copo ${cup ? 'sim' : 'não'}, as cartas de ${cards ? cards.cmat : '-'} e o monte ${deck ? 'sim' : 'não'}; o jogo acabado → nada na mesa${qaJ.length ? '; ' + qaJ.map(q => q[1]).join(' | ') : ''}`);
  // (5) who fainted: the cup fallen from the hand, the drink round it
  const w = [...S().villagers.values()].find(q => q.age >= 18 && !q.inside && !q.aboard); const sv = { inside: w.inside, act: w.act, x: w.x, y: w.y };
  { const C = In.CELL; let at = null; for (let z = 1.2; z < p.lot.w - 1 && !at; z += 0.3) for (let x = 1.2; x < p.lot.w - 1 && !at; x += 0.3) if (In.cell(b2, 0, x, z) === C.FLOOR && In.cell(b2, 0, x + 0.45, z) === C.FLOOR) at = [x, z];
    w.inside = b2.id; w.act = 'desmaio'; w.x = b2.x + at[0] / Sp.TILE; w.y = b2.y + at[1] / Sp.TILE; }
  L = (() => { fresh(); return D.plan(b2, plan(b2), true).list; })(); const mug = L.find(t => t.key === `caido/${w.id}/caneca`), sp = L.find(t => t.key === `caido/${w.id}/poca`); const qaC = QA.dentro([b2]).filter(q => q[0] <= 3);
  Object.assign(w, sv); L = (() => { fresh(); return D.plan(b2, plan(b2), true).list; })();
  check('quem desmaiou', !!mug && !!sp && !qaC.length && !L.some(t => /^caido\//.test(t.key)), `${mug ? 'a caneca caída ao lado' : 'sem caneca'}, ${sp ? 'a bebida no chão em volta' : 'sem poça'}; levantou → ${L.some(t => /^caido\//.test(t.key)) ? 'ficou' : 'nada'}${qaC.length ? '; ' + qaC.map(q => q[1]).join(' | ') : ''}`);
  // (the feast over: nothing of it left; the door as it was)
  delete b2.festa; b2.ip.dr = dr0; L = (() => { fresh(); return D.plan(b2, plan(b2), true).list; })();
  check('a festa acabada, a porta como era', !L.some(t => t.festa) && L.some(t => t.k === 'tranca') === bar0, `${L.filter(t => t.festa).length} coisa(s) da festa, ${L.filter(t => t.k === 'tranca').length} tranca(s) (antes: ${bar0 ? 1 : 0}, a regra da casa)`);
  ok('d15 a quarta onda: a festa pelo material e o prato pela receita, a porta trancada e a arrombada, a poça e o molhado que secam, os jogos na mesa, quem desmaiou, o save no meio', good, `taverna#${b.id} — ` + info.join('; '));
}

// ------------------------------ the decoration by use and by trade (the interiors 3, the front L — F7, D-1010, D-1011) ------------------------------
if (want('d16')) {
  // ---- a use's rule and builder and a trade's rule and drawer, registered as a wave's own file would (here, by the proof); the true
  // readings (what each piece keeps by the book, the trade by the kit and the origin); the bad cases — a field no rule declared, the save
  // in the middle, the smith who leaves his post, the forge that falls —; and all of it taken away, the forge as it was. Last of the parts:
  // the vocabulary keeps the fields the proof brought (their empty values)
  const info = []; let good = true; const check = (name, c, txt) => { info.push(`${c ? '' : '✗ '}${name}: ${txt}`); if (!c) good = false; };
  const In = G.Interiors, Dp = G.Depot, Of = G.Oficio; const all = [...S().buildings.values()].filter(q => q.built && q.type !== 'ruin' && plan(q));
  const forges = all.filter(q => q.type === 'forja'); const fb = forges.find(q => At.oficio(q).quem.some(x => x.oficio === 'ferreiro')) || forges[0];
  const stl = all.filter(q => q.type === 'storehouse' || q.type === 'celeiro' || q.type === 'armazem'); const hs = houses(60);
  const snap = q => JSON.stringify(D.plan(q, plan(q), true).list.map(t => [t.k, t.x, t.y, t.z, t.ry, t.key, t.why]));
  if (fb) {
    const fid = G.Fac.ofSet(fb.set).id; const ofi = At.oficio(fb); const smith = ofi.quem.find(x => x.oficio === 'ferreiro');
    // (1) the trade by the kit and the origin: the smith's hammer in the best material his people has; the batches; what the shelf keeps
    const ham = smith ? smith.kit.find(x => x.tipo === 'martelo') : null; const want0 = At.ler.coisa('martelo', fid);
    const ks = []; for (const p in Of.trade(fb).rx) if (!ks.includes(Of.trade(fb).rx[p].k)) ks.push(Of.trade(fb).rx[p].k);
    const feitoOk = ks.every(k => { const n = Dp.get('b:' + fb.id, k); const e = ofi.feito.find(x => x.k === k); return n > 1e-6 ? !!e && Math.abs(e.n - Math.round(n * 100) / 100) < 1e-9 && (!G.Origem.kept(k) || !!e.partes) : !e; });
    check('o ofício pelo kit e pela origem', !!smith && !!ham && ham.k === want0 && ofi.obra.length === Of.batches(fb).length && feitoOk,
      `forja#${fb.id} ${fb.style}: ${ofi.quem.length} no posto ou em casa (${ofi.quem.map(x => `#${x.v} ${x.oficio}${x.aqui ? ' aqui' : ''}`).join(', ')}); o martelo ${ham ? ham.k : '-'} (o povo faria ${want0}); fornadas ${ofi.obra.length} (${ofi.obra.map(x => x.why).join(' · ') || 'nenhuma'}); na prateleira ${ofi.feito.map(x => x.why).join(' · ') || 'nada do que ela faz'}`);
  } else check('o ofício pelo kit e pela origem', false, 'nenhuma forja com planta');
  // (2) what each piece keeps, by the book: a house's pieces as the depot splits its goods; a storehouse's as the share of the people's
  // store it keeps, never more than the piece holds
  { let nh = 0, bad = []; for (const h of hs) { const g = At.guardado(h); const sl = Dp.slots('h:' + h.id); for (const s of sl) { if (s.k === 'moedas') continue; const r = g.find(q => q.it === s.m); if (!r || Math.abs((r.bens[s.k] || 0) - s.n) > 1e-6) bad.push(`casa#${h.id} peça ${s.m} ${s.k}`); } nh++; }
    let ns = 0, over = 0, sum = 0, cap = 0; for (const s of stl) { const g = At.guardado(s).filter(q => q.dep === 'povo'); const sh = Dp.share(s); let tot = 0; for (const k in sh) if (k !== 'moedas') tot += sh[k];
      const n = g.reduce((a, q) => a + q.n, 0); const c = g.reduce((a, q) => a + q.cap, 0); if (n > Math.min(tot, c) + 1e-6 || g.some(q => q.n > q.cap + 1e-6)) over++; sum += n; cap += c; ns++; }
    // (and the fill the boxes draw — In.state — is that same reading: what the piece keeps over its room, L-2250)
    let nf = 0, fb2 = []; for (const q of hs.concat(stl)) { const st = In.state(q); const g = At.guardado(q); for (const id in st.items) { const f = st.items[id].fill; if (!Number.isFinite(f)) continue; nf++; const it = plan(q).items.find(x => String(x.id) === id); const r = g.find(x => String(x.it) === id);
      const want = r && it ? Math.round(G.clamp(r.n / it.store.cap, 0, 1) * 100) / 100 : 0; if (Math.abs(f - want) > 1e-9) fb2.push(`${q.type}#${q.id} peça ${id}: ${f} para ${want}`); } }
    check('o que cada peça guarda, pelo livro', nh > 10 && !bad.length && ns > 0 && !over && nf > 50 && !fb2.length, `${nh} casas: as peças como o depósito reparte (${bad.length ? 'DIFERENTES ' + bad.slice(0, 3).join(', ') : 'iguais'}); ${ns} armazéns e celeiros: ${sum.toFixed(1)} nas peças de ${cap} de lugar, a parte do armazém do povo que guardam${over ? `; ${over} além do que cabe` : ''}; o enchimento de ${nf} peças desenhadas o mesmo${fb2.length ? ' — DIFERENTE: ' + fb2.slice(0, 3).join(', ') : ''}`); }
  // (3) a use's rule: its field in every within, filled where the use is; a field no rule declared, refused and counted
  const base = fb ? snap(fb) : ''; const W0 = fb ? JSON.stringify(At.within(fb)) : '';
  const offR = At.withinRule('forja', (q, c) => { const o = c.ler.oficio(q); return { bigorna: Object.freeze({ n: o.obra.length, why: `${o.obra.length} fornada(s) em curso (G.Oficio)` }), semRegra: 1 }; }, { campos: { bigorna: null } });
  fresh(); const Wf = fb ? At.within(fb) : null; const Wh = At.within(hs[0]); const ruin = At.within({ built: false });
  check('a regra do uso', !!Wf && !!Wf.bigorna && Wf.bigorna.n === At.oficio(fb).obra.length && Wh.bigorna === null && ruin.bigorna === null && (G.Atmos.withinErr['forja.semRegra'] | 0) >= 1 && At.VOC().includes('bigorna'),
    `forja: ${Wf && Wf.bigorna ? Wf.bigorna.why : '-'}; uma casa: ${JSON.stringify(Wh.bigorna)}; o prédio que não está de pé: ${JSON.stringify(ruin.bigorna)}; o campo que ninguém declarou recusado e contado (${JSON.stringify(G.Atmos.withinErr)})`);
  // (4) a trade's rule and drawer: what the smith's post shows — his hammer, hung on a peg near the forge's fire (K.pendura)
  const offT = At.oficioRule('ferreiro', (q, e, c) => ({ ferramentas: Object.freeze([c.ler.coisa('martelo', c.fid)].filter(Boolean)), why: `as ferramentas do ferreiro #${e.v} (o kit, no material do povo)` }));
  const offD = D.oficio('ferreiro', (ctx, K, e) => { K.pendura(ctx, e.ferramentas.map((k, i) => ({ k: 'cavilha', key: k + i, why: e.why })), ctx.p.items.filter(it => it.fire), { tag: 'oficio/' + e.v, teto: false }); });
  fresh(); let hung = [], near0 = true;
  if (fb) { const p = plan(fb); hung = D.plan(fb, p, true).list.filter(t => /^oficio\//.test(t.key)); const fires = p.items.filter(it => it.fire); near0 = hung.every(t => t.on === 'parede' && (!fires.length || Math.min(...fires.map(it => Math.hypot(it.x - t.x, it.z - t.z))) < 4.6)); }
  const Wo = fb ? At.within(fb).oficios : []; const qa1 = fb ? dentroQA(fb) : [];
  check('a regra e o desenho do ofício', !!fb && Wo.some(x => x.oficio === 'ferreiro' && x.ferramentas.length) && hung.length >= 2 && near0 && !qa1.length && At.within(hs[0]).oficios !== undefined,
    `${Wo.map(x => `#${x.v} ${x.oficio} (${x.ferramentas.join(', ')})`).join(', ') || 'ninguém'}; ${hung.length} coisa(s) nas cavilhas da forja perto do fogo${qa1.length ? '; ' + qa1.map(q => q[1]).join(' | ') : ''}`);
  // (4b) the marks of the years by a count of the world (K.riscos — the days of who is held, the tallies of a barracks, in a wave): a
  // builder of the use puts n of them on the walls, each on a free stretch, none over another, keyed by its own tag; taken away, none
  if (fb) { const offB = D.builder('forja', (ctx, K) => { K.riscos(ctx, 5, { tag: 'prova-dias', perto: ctx.p.items.filter(it => it.fire), why: 'cinco marcas de uma conta do mundo (a prova)' }); });
    fresh(); const M5 = D.plan(fb, plan(fb), true).list.filter(t => /^prova-dias\//.test(t.key)); offB(); fresh(); const M0 = D.plan(fb, plan(fb), true).list.filter(t => /^prova-dias\//.test(t.key));
    const apart = M5.every((a, i) => M5.every((c, j) => i >= j || Math.hypot(a.x - c.x, a.z - c.z) > 0.05 || Math.abs(a.y - c.y) > 0.1));
    check('as marcas dos anos por uma conta (K.riscos)', M5.length === 5 && M5.every(t => t.on === 'parede' && /^rabisco-/.test(t.k)) && apart && !M0.length, `forja#${fb.id}: ${M5.length} marca(s) nas paredes (${M5.map(t => t.key).join(', ')}); o construtor tirado → ${M0.length}`); }
  // (5) the save in the middle: the same within and the same things after the load (the rules are code; what they read, the world)
  if (fb) { const a = JSON.stringify(At.within(fb)) + snap(fb); M.salvarCarregar(); fresh(); const b2 = S().buildings.get(fb.id); const c = JSON.stringify(At.within(b2)) + snap(b2);
    check('o save no meio', a === c, a === c ? 'iguais depois de salvar e carregar' : 'DIFERENTES depois do load'); }
  // (6) the smith leaves his post; (7) the forge falls (a ruin: nothing inside, the fields empty, no trade)
  const fb2 = fb && S().buildings.get(fb.id);
  if (fb2) { const v = [...S().villagers.values()].find(x => x.job === fb2.id && x.role === 'ferreiro'); const j0 = v ? v.job : 0, h0 = v ? v.home : 0;
    if (v) { v.job = 0; v.home = 0; } fresh(); const W2 = At.within(fb2); if (v) { v.job = j0; v.home = h0; } fresh();
    check('o ferreiro que deixa o posto', !!v && !W2.oficios.some(x => x.v === v.id), v ? `#${v.id} fora do posto e de casa → ${W2.oficios.length} no ofício da forja` : 'nenhum ferreiro no posto');
    const t0 = fb2.type; fb2.type = 'ruin'; fresh(); const Wr = At.within(fb2), Or = At.oficio(fb2), Gr = At.guardado(fb2); fb2.type = t0; fresh();
    check('a forja que cai', Wr.bigorna === null && Array.isArray(Wr.oficios) && !Wr.oficios.length && !Or.quem.length && !Gr.length, 'a ruína: os campos vazios, nenhum ofício, nada guardado'); }
  // (8) all taken away: the forge's things as before the rules came
  offD(); offT(); offR(); fresh();
  if (fb2) { const after = snap(fb2); check('tudo tirado', after === base && !At.within(fb2).bigorna, after === base ? 'as coisas da forja como eram' : 'as coisas da forja DIFERENTES das de antes'); }
  check('o kit dos construtores', Object.isFrozen(D.KIT) && ['pack', 'scatter', 'beside', 'near', 'byWall', 'pendura', 'hangFood', 'riscos', 'wallSpots', 'onWall', 'runs', 'ceilAt', 'floorFree', 'hv', 'casa', 'taverna'].every(k => typeof D.KIT[k] === 'function'), Object.keys(D.KIT).length + ' portas');
  void W0;
  ok('d16 a decoração por uso e por ofício: a regra e o construtor de um uso, a regra e o desenho de um ofício, as leituras de verdade, os casos ruins', good, info.join('; '));
}

// ------------------------------ the light of each people (the interiors 3, the front L — D-1012, L-2252) ------------------------------
if (want('d17')) {
  // ---- the light of each people, with what it burns (G.Atmos.LUZ): the lamp each people makes and its stuff — the lucerna of clay (the
  // Roman's of bronze in the rich house), the saucer of the Nile with salt in its oil, the soapstone of the north, the stone lamp on its
  // foot of the dawn of the cities —; the lake with no lamp of oil nor candle, the ocote on its wall; the candle of the north the rich
  // house's only; the Greek's brazier in the cold; the lantern of horn by the door of a rich Roman house; each flame's light the
  // G.Luz3D.LAMPS's; the lamp stands by what their people burns; the bad cases — the salt gone, the oil and the wax gone by the god's hand,
  // the save in the middle — and the verifier clean on each
  const info = []; let good = true; const check = (name, c, txt) => { info.push(`${c ? '' : '✗ '}${name}: ${txt}`); if (!c) good = false; };
  const S0 = S(); const t0 = S0.time; S0.time = 0.9; const L3 = G.Luz3D; const Dp = G.Depot; const LUZ = At.LUZ;
  const civOf = b => b.style || ((G.Fac.ofSet(b.set) || {}).civ) || 'classico';
  const homes = [...S().buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && plan(b) && plan(b).items.some(it => D.KIT.CORE.includes(it.kind))).sort((a, c) => a.id - c.id);
  // (someone awake inside a house, in the dark: who is there woken, or a neighbour brought in — given back after)
  const guests = []; const wake = b => { const inn = [...S().villagers.values()].filter(v => v.inside === b.id); if (inn.length) { for (const v of inn) { guests.push([v, v.inside, v.sleeping]); v.sleeping = false; } return; }
    const g = [...S().villagers.values()].find(v => !v.inside && v.age >= 18 && !v.aboard && !v.jail && !guests.some(q => q[0] === v)); if (g) { guests.push([g, g.inside, g.sleeping]); g.inside = b.id; g.sleeping = false; } };
  const LIGHT = ['lamparina', 'lamparina-pires', 'lamparina-pedra', 'lamparina-pe', 'vela', 'ocote', 'braseira', 'lanterna'];
  const lights = b => D.plan(b, plan(b), true).list.filter(t => LIGHT.includes(t.k));
  const by = {}; for (const b of homes) { const c = civOf(b); (by[c] = by[c] || []).push(b); }
  for (const c of Object.keys(by)) for (const b of by[c].slice(0, 6)) wake(b); fresh();
  const peoples = Object.keys(by).sort(); const seen = {};
  // (1) each people's own lamp where it has the oil, of its stuff; the lake none — its ocote, lit —; every light's colour, strength and
  // flame the G.Luz3D.LAMPS's of what burns in it; the verifier clean
  for (const c of peoples) { const P = LUZ[c] || LUZ.classico; let n = 0; const bad = [];
    for (const b of by[c].slice(0, 6)) { const W = At.within(b); const L = lights(b); const pl = D.plan(b, plan(b), true); n++; seen[c] = (seen[c] || 0) + L.length;
      if (!W.luz) continue;
      if (!P.k && (W.luz.k || W.luz.oleo || W.luz.cera || L.some(t => /^lamparina|^vela$/.test(t.k)))) bad.push(`#${b.id} com lamparina ou vela`);
      if (P.k && W.luz.oleo && W.luz.k !== P.k) bad.push(`#${b.id} a lamparina ${W.luz.k} (o povo faz ${P.k})`);
      if (L.some(t => /^lamparina/.test(t.k) && t.k !== P.k)) bad.push(`#${b.id} uma lamparina de outro povo`);
      if (c === 'nordico' && W.luz.oleo && W.luz.mat !== 'pedra-sabao') bad.push(`#${b.id} a lamparina de ${W.luz.mat}`);
      if (P.tocha && W.luz.tocha && W.luz.acesa && !L.some(t => t.k === P.tocha && t.lit)) bad.push(`#${b.id} sem o ocote aceso`);
      for (const f of pl.fontes) { const t = pl.list.find(q => 'd:' + q.key === f.id); const Lm = t && L3.LAMPS[t.luz || (t.k === 'vela' ? 'vela' : 'lamparina')];
        if (!Lm || JSON.stringify(f.cor) !== JSON.stringify(Lm.cor) || f.chama !== Lm.chama || f.kind !== (Lm.kind || t.luz)) bad.push(`#${b.id} a luz de ${t ? t.k : '?'} fora do seu LAMPS`); }
      const q = dentroQA(b); if (q.length) bad.push(`#${b.id}: ${q.map(x => x[1]).slice(0, 2).join(' | ')}`); }
    check(`a luz do ${c}`, !bad.length && n > 0, `${n} casa(s): ${by[c].slice(0, 3).map(b => { const W = At.within(b); return W.luz ? `${W.luz.k || (W.luz.tocha ? 'ocote' : '-')} de ${W.luz.mat}${W.luz.oleo ? ' com ' + W.luz.oleo : ''}${W.luz.sal ? ' e sal' : ''}${W.luz.cera ? ', vela' : ''}${W.luz.acesa ? ' (acesa)' : ''}` : 'nada que queimar'; }).join('; ')}${bad.length ? '; ' + bad.slice(0, 3).join(', ') : ''}`); }
  // (2) the dawn of the cities: the stone lamp on its foot, of stone, with the people's oil (a house of the others read as of the classical
  // people: its style — the within's own reading)
  { const b = (by.romano || by.grego || by.egipcio || [])[0]; if (b) { const s0 = b.style; b.style = 'classico'; fresh(); const W = At.within(b); const L = lights(b); const q = dentroQA(b); b.style = s0; fresh();
    check('a luz do clássico', !!W.luz && (!W.luz.oleo || (W.luz.k === 'lamparina-pe' && W.luz.mat === 'pedra' && L.some(t => t.k === 'lamparina-pe'))) && !W.luz.cera && !q.length, W.luz ? `${W.luz.k} de ${W.luz.mat}${W.luz.oleo ? ' com ' + W.luz.oleo : ''}${W.luz.cera ? ', vela' : ', nenhuma vela'}${q.length ? '; ' + q.map(x => x[1]).join(' | ') : ''}` : 'nada que queimar'); } }
  // (3) the salt in the oil of the Nile: with it, the clearer flame; the salt gone (the god's hand), the plain lamp; given back
  { const b = (by.egipcio || []).find(q => At.within(q).luz && At.within(q).luz.oleo); if (b) { const f = G.Fac.ofSet(b.set); const ref = 'h:' + b.id;
    const s0 = Dp.get('f:' + f.id, 'sal'), h0 = Dp.get(ref, 'sal'); if (s0 < 1 && h0 < 1) inSim(() => Dp.make('f:' + f.id, 'sal', 2, { code: 'prova' })); fresh();
    const a = At.within(b).luz; const fa = D.plan(b, plan(b), true).fontes; const s1 = Dp.get('f:' + f.id, 'sal'); inSim(() => { if (s1 > 0) Dp.use('f:' + f.id, 'sal', s1, { code: 'prova' }); if (h0 > 0) Dp.use(ref, 'sal', h0, { code: 'prova' }); }); fresh();
    const c = At.within(b).luz; const fc = D.plan(b, plan(b), true).fontes;
    inSim(() => { if (s0 > 0) Dp.make('f:' + f.id, 'sal', s0, { code: 'prova' }); if (h0 > 0) Dp.make(ref, 'sal', h0, { code: 'prova' }); }); fresh();
    const sal = L3.LAMPS['lamparina-sal'].cor; check('o sal no óleo do Nilo', a.sal === 1 && a.luz === 'lamparina-sal' && (!a.acesa || fa.some(s => JSON.stringify(s.cor) === JSON.stringify(sal))) && !c.sal && c.luz !== 'lamparina-sal' && fc.every(s => JSON.stringify(s.cor) !== JSON.stringify(sal)) && At.within(b).luz.sal === (s0 >= 1 || h0 >= 1 ? 1 : 0),
      `com sal no armazém: ${a.luz}${a.acesa ? ` (${fa.length} chama(s) da cor clara)` : ''}; sem o sal (a mão do deus): ${c.luz}; o sal de volta: ${At.within(b).luz.luz}`); } }
  // (4) the candle of the north, the rich house's: a poor one with wax has none, the same rich has it
  { const b = (by.nordico || []).find(q => At.within(q).luz && At.rich(q) < 2); if (b) { const f = G.Fac.ofSet(b.set); const w0 = Dp.get('f:' + f.id, 'cera'); if (w0 < 1) inSim(() => Dp.make('f:' + f.id, 'cera', 2, { code: 'prova' })); const c0 = b.coin; fresh();
    const a = At.within(b).luz; b.coin = 400; fresh(); const r = At.within(b).luz; const L = lights(b); b.coin = c0; if (w0 < 1) inSim(() => Dp.use('f:' + f.id, 'cera', 2, { code: 'prova' })); fresh();
    check('a vela do nórdico, da casa rica', !!a && !a.cera && !!r && r.cera && !L.some(t => t.k === 'lamparina' || t.k === 'lamparina-pires' || t.k === 'lamparina-pe'), `pobre (${c0 | 0} moedas), com cera no armazém: ${a && a.cera ? 'vela' : 'sem vela'}; rica: ${r && r.cera ? 'vela' : 'sem vela'}, ${L.map(t => t.k).join(', ')}`); } }
  // (5) the Roman's rich house: its lamp of bronze where the people has had it; the lantern of horn by the door where the people has horn
  { const b = (by.romano || []).find(q => At.within(q).luz && At.within(q).luz.oleo); if (b) { const f = G.Fac.ofSet(b.set); const c0 = b.coin; const k0 = Dp.get('f:' + f.id, 'chifre'); b.coin = 400;
    if (k0 < 1) inSim(() => Dp.make('f:' + f.id, 'chifre', 1, { code: 'prova' })); fresh(); const W = At.within(b); const L = lights(b); const qa1 = QA.dentro([b]).filter(q => q[0] <= 3 || /lanterna/.test(q[1]));
    if (k0 < 1) inSim(() => Dp.use('f:' + f.id, 'chifre', 1, { code: 'prova' })); b.coin = c0; fresh(); const W2 = At.within(b);
    const bronze = G.Origem.matOK(f.id, 'bronze', f.tech ? f.tech.known : null); const ln = L.find(t => t.k === 'lanterna');
    check('a casa rica romana: o bronze e a lanterna de chifre', (!bronze || W.luz.mat === 'bronze') && !!W.luz.lanterna && !!ln && ln.on === 'parede' && !W2.luz.lanterna && !qa1.length,
      `rica: a lamparina de ${W.luz.mat} (o povo ${bronze ? 'teve' : 'não teve'} o bronze), ${L.filter(t => t.k === 'lanterna').length} lanterna(s) de chifre junto da porta${ln ? ` (${ln.lmat}, ${ln.lit ? 'acesa' : 'apagada'})` : ''}; sem o chifre e pobre: ${W2.luz.lanterna ? 'lanterna' : 'nenhuma'}${qa1.length ? '; ' + qa1.map(q => q[1]).join(' | ') : ''}`); } }
  // (6) the Greek's brazier with the cold (G.Atmos.cold where the house stands): at noon of a land not cold, none; on a cold night, and in
  // the god's sudden winter over the house, on the floor by where the family sits, its embers lit
  { const gs = (by.grego || []).filter(q => At.within(q).luz); const cx = q => At.cold(q.x + q.w / 2, q.y + q.h / 2);
    S0.time = 0.45; fresh(); const b = gs.find(q => cx(q) === 0) || gs[0]; const noon = b ? { c: cx(b), br: !!(At.within(b).luz || {}).braseira } : null; S0.time = 0.9; fresh();
    if (b) { const night = { c: cx(b), br: !!At.within(b).luz.braseira }; const wi = S().winters || (S().winters = []); wi.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, r: 6, t: 30 }); fresh();
      const c = At.within(b).luz; const L = lights(b); const qa1 = dentroQA(b); const src = L3.sources(b, plan(b)).filter(s => s.luz === 'braseira'); wi.pop(); fresh();
      check('o braseiro grego no frio', noon.br === (noon.c >= 1) && night.br === (night.c >= 1) && !!c.braseira && c.braseira.frio === 2 && L.some(t => t.k === 'braseira' && t.on === 'chao') && (!c.acesa || src.length > 0) && !qa1.length,
        `casa#${b.id} ao meio-dia (frio ${noon.c}): ${noon.br ? 'braseiro' : 'nenhum'}; de noite (frio ${night.c}): ${night.br ? 'braseiro' : 'nenhum'}; o inverno do deus (frio ${c.braseira ? c.braseira.frio : 0}): ${L.filter(t => t.k === 'braseira').length} braseiro(s) no chão, ${src.length} luz(es) de brasa${qa1.length ? '; ' + qa1.map(q => q[1]).join(' | ') : ''}`); } }
  // (7) the lamp stands by what their people burns: lit only with it; all of it gone (the god's hand), dark; given back
  { const stands = [...S().buildings.values()].filter(b => b.built && plan(b) && plan(b).items.some(it => it.kind === 'lampadario')).sort((a, c) => a.id - c.id); let lit = 0; const bad = []; let dark = null;
    for (const b of stands) { wake(b); fresh(); const src = L3.sources(b, plan(b)).filter(s => plan(b).items.some(it => it.id === s.id && it.kind === 'lampadario')); const q = At.luzPeca(b, 'lampadario');
      if (src.length && !q) bad.push(`${b.type}#${b.id} aceso sem o que queimar`); if (!src.length && q && At.lit(b)) bad.push(`${b.type}#${b.id} apagado com ${q.comb.join(', ')}`);
      if (src.length && q && JSON.stringify(src[0].cor) !== JSON.stringify(L3.LAMPS[q.luz].cor)) bad.push(`${b.type}#${b.id} a cor da chama`); lit += src.length; }
    const b = stands.find(q => L3.sources(q, plan(q)).some(s => plan(q).items.some(it => it.id === s.id && it.kind === 'lampadario')));
    if (b) { const f = G.Fac.ofSet(b.set); const K = ['azeite', 'oleo', 'cera', 'wood']; const keep = {}; const refs = ['f:' + f.id, (G.Village.bedsOf(b) > 0 ? 'h:' : 'b:') + b.id];
      inSim(() => { for (const r of refs) for (const k of K) { const n = Dp.get(r, k); if (n > 0) { keep[r + k] = n; Dp.use(r, k, n, { code: 'prova' }); } } }); fresh();
      const n0 = L3.sources(b, plan(b)).filter(s => plan(b).items.some(it => it.id === s.id && it.kind === 'lampadario')).length;
      inSim(() => { for (const r of refs) for (const k of K) if (keep[r + k]) Dp.make(r, k, keep[r + k], { code: 'prova' }); }); fresh();
      const n1 = L3.sources(b, plan(b)).filter(s => plan(b).items.some(it => it.id === s.id && it.kind === 'lampadario')).length;
      dark = `${b.type}#${b.id} ${civOf(b)}: sem óleo, cera nem lenha → ${n0} chama(s); de volta → ${n1}`; if (n0 || !n1) bad.push('o lampadário não segue o que se queima'); }
    check('os lampadários pelo que o povo queima', stands.length > 0 && lit > 0 && !bad.length, `${stands.length} prédio(s) com lampadário, ${lit} chama(s) acesas; ${dark || '-'}${bad.length ? '; ' + bad.slice(0, 3).join(', ') : ''}`); }
  // (8) the save in the middle: the world as it was — who was woken and brought in by the proof's hand given back (a guest put inside by
  // hand is no stay of the world's, and the load does not keep it), its own hour —, the light of every house tried the same after the load
  for (const [v, ins, sl] of guests) { v.inside = ins; v.sleeping = sl; } guests.length = 0; S0.time = t0;
  { const ids = peoples.flatMap(c => by[c].slice(0, 6)).map(b => b.id); const snap = () => ids.map(id => { const b = S().buildings.get(id); const W = At.within(b); return id + ':' + JSON.stringify(W.luz) + JSON.stringify(D.plan(b, plan(b), true).fontes); });
    fresh(); const a = snap(); M.salvarCarregar(); fresh(); const c = snap(); const d = a.filter((x, k) => x !== c[k]);
    const k0 = a.findIndex((x, k) => x !== c[k]); const at = k0 < 0 ? 0 : [...a[k0]].findIndex((ch, k) => ch !== c[k0][k]);
    check('o save no meio', !d.length, d.length ? `${d.length} diferentes: #${ids[k0]} antes …${a[k0].slice(Math.max(0, at - 60), at + 80)}… depois …${c[k0].slice(Math.max(0, at - 60), at + 80)}…` : `${ids.length} casas iguais (${a.filter(x => /"acesa":1/.test(x)).length} com a luz acesa)`); }
  S().time = t0; fresh();
  ok('d17 a luz de cada povo: a lamparina de cada povo e o que ela queima, o ocote do lago, o sal do Nilo, a vela rica do norte, o bronze e a lanterna de Roma, o braseiro do frio, os lampadários, o save no meio', good, info.join('; ') + ` — coisas de luz por povo ${JSON.stringify(seen)}`);
}

// ------------------------------ the cloth has an owner (the interiors 3, the front L — L-2251) ------------------------------
if (want('d18')) {
  // ---- the rug and the hanging only of a household (the house, the seat) or of a building whose use says whose wealth it shows (the
  // tavern: its keeper's house): every building of the world read with its ground at its dearest — the town's portrait of the day,
  // planted (G.Urban.peek): the square, the market, the granary, the storehouse of a people that weaves had the rug of their ground —;
  // the rich house and the tavern keep theirs; the verifier clean on them; the portrait given back, all as it was
  const U = G.Urban; const peek0 = U.peek; const dear = Object.freeze({ cells: { get: () => ({ value: 90 }) } });
  const all = [...S().buildings.values()].filter(q => q.built && q.type !== 'ruin' && plan(q)).sort((a, c) => a.id - c.id);
  const owned = q => G.Village.bedsOf(q) > 0 || At.rulesOf(q).some(r => r.dono);
  const read = () => { fresh(); const out = { rugs: {}, bad: [], weave: 0, rich: 0, ownedPano: 0, whyBad: [] };
    for (const q of all) { const W = At.within(q); const L = D.plan(q, plan(q), true).list; const n = L.filter(t => t.k === 'tapete' || t.k === 'tapecaria').length; if (n) out.rugs[q.type] = (out.rugs[q.type] || 0) + n;
      if (owned(q)) { if (W.pano) out.ownedPano++; continue; } if (W.weave) out.weave++; if (W.rico >= 2) out.rich++;
      if (W.pano || n) out.bad.push(`${q.type}#${q.id}`); if (!/de ninguém/.test(W.why.riqueza || '')) out.whyBad.push(`${q.type}#${q.id}`); }
    return out; };
  const before = read(); U.peek = () => dear; let dearR = null, qa1 = [];
  try { dearR = read(); const sample = all.filter(q => !owned(q) && At.within(q).weave).slice(0, 12).concat(all.filter(q => owned(q) && At.within(q).pano).slice(0, 8)); qa1 = QA.dentro(sample).filter(q => q[0] <= 3); }
  finally { U.peek = peek0; fresh(); }
  const after = read(); const same = JSON.stringify(before.rugs) === JSON.stringify(after.rugs);
  const good = dearR.weave > 5 && dearR.rich > 5 && !dearR.bad.length && !before.bad.length && !dearR.whyBad.length && dearR.ownedPano > 0 && !qa1.length && same;
  ok('d18 o pano tem dono: o tapete e a tapeçaria só de uma casa ou da taverna de quem a toca; a terra cara de um prédio não é riqueza de ninguém (L-2251)', good,
    `a terra mais cara posta em todo prédio: ${dearR.rich} prédios sem dono «ricos» pela terra (${dearR.weave} de povo que tece) → ${dearR.bad.length ? 'com pano: ' + dearR.bad.slice(0, 5).join(', ') : 'nenhum pano neles'}; ${dearR.ownedPano} casas e tavernas com o seu pano; tapetes e tapeçarias por tipo ${JSON.stringify(dearR.rugs)}; o porquê da terra ${dearR.whyBad.length ? 'ERRADO em ' + dearR.whyBad.slice(0, 3).join(', ') : '«de ninguém»'}; o verificador ${qa1.length ? qa1.map(q => q[1]).slice(0, 3).join(' | ') : 'limpo'}; o retrato devolvido: ${same ? 'tudo como era' : 'DIFERENTE'} (${JSON.stringify(after.rugs)})`);
}

const e = M.erros(); if (!M.limpo()) console.log('  erros:', JSON.stringify(e.mod), e.console.slice(0, 5).join(' | '));
ok('sem erro de módulo nem aviso no console', M.limpo(), JSON.stringify(e.mod));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
