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
    const c = D.plan(b, plan(b), true); const litC = c.list.filter(t => t.lit).length; const lampsC = c.list.filter(t => t.k === 'lamparina' || t.k === 'vela').length; const srcC = (G.Luz3D ? G.Luz3D.sources(b, plan(b)) : []).filter(s => /^d:/.test(String(s.id))).length;
    for (const [v, s] of saved) v.sleeping = s; if (guest) guest.inside = 0;
    info = `${b.type}#${b.id} ${b.style} às ${S0.time}: acordados → ${litA} acesa(s), ${srcA} luz(es) da decoração no G.Luz3D; todos deitados → ${litC} acesa(s) (${lampsC} lamparina(s) apagada(s) no lugar), ${srcC} luz(es)`;
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
    const doneOk = !endSeen || !endSeen.q || (endSeen.q.prato === '?' && endSeen.st === 4 && endSeen.t && endSeen.t.k === 'comida-provisao') || !endSeen.q.prato;
    info = `taverna#${bid}: #${vid} comendo ${f.op.data.mesa[vid] ? '' : ''}(${eat[0] ? eat[0].t && eat[0].t.k : '-'}), achado depois de ${f.w} s do mundo; estágios ${eat.map(r => r.st).join('→')}, comida à vista ${eat.map(r => r.bites).join('→')}; vapor ${hot0 ? `${eat.map(r => r.steam).join('')} (calor ${eat.filter(r => r.steam).map(r => r.heat.toFixed(2)).join('→')})` : 'nenhum (prato frio)'}; save no meio ${saved === null ? 'não houve' : saved ? 'igual' : 'DIFERENTE'}; ao acabar ${endSeen ? (endSeen.q ? `${endSeen.t ? endSeen.t.k + ' st ' + endSeen.st : '-'} (${endSeen.q.why})` : 'levantou-se: a mesa limpa') : 'ainda comendo'}`;
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
  const b = taverns()[0]; const f = b && G.Fac.ofSet(b.set);
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
    info = `taverna#${b.id}: a vela inteira → ${whole.c} vela(s) no tanto ${whole.vs}, chama a ${whole.fy[0] && whole.fy[0].toFixed(3)}; 55% gasta → ${half.vs}, chama a ${half.fy[0] && half.fy[0].toFixed(3)}; um toco → ${stub.vs}; acabou → ${out.c} vela(s), ${out.l} lamparina(s); o azeite cheio → luz ${oilFull.fl[0]}, quase no fim → ${oilLow.fl[0]}; de manhã sem cera no armazém → ${noWax} vela(s), com cera → ${wax} luz(es) na mesa`;
    good = whole.c > 0 && whole.vs === 0 && half.vs === 2 && stub.vs === 3 && half.fy[0] < whole.fy[0] && stub.fy[0] < half.fy[0] && out.c === 0 && out.l === 0 && oilFull.l > 0 && oilLow.fl[0] < oilFull.fl[0] && noWax === 0 && wax > 0 && [whole, half, stub, out, oilFull, oilLow].every(r => !r.qa);
  }
  T0.luz = was; S0.time = t0; fresh();
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

const e = M.erros(); if (!M.limpo()) console.log('  erros:', JSON.stringify(e.mod), e.console.slice(0, 5).join(' | '));
ok('sem erro de módulo nem aviso no console', M.limpo(), JSON.stringify(e.mod));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
