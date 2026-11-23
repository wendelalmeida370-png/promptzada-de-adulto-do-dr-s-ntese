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
//   d8 o desenho: as malhas por instância (uma por coisa, parte e padrão) com tantas instâncias quanto as partes das coisas, e o
//      orçamento da biblioteca (o js/decomesh.js ≤ 1 MB, cada coisa no seu orçamento de triângulos)
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
  const pl = D.plan(b, plan(b), true); let parts = 0; for (const t of pl.list) parts += G.Mesh3D.parts('deco-' + t.k).length;
  let inst = 0, tris = 0; for (const m of meshes) { inst += m.count; tris += m.count * m.geometry.index.count / 3; }
  const ROOT = path.join(__dirname, '..'); const kb = fs.statSync(path.join(ROOT, 'js', 'decomesh.js')).size / 1024; const B = G.DECO.budget; const bad = [];
  for (const n of Object.keys(G.MESH3D)) { if (!/^deco-/.test(n) || /@1$/.test(n)) continue; const d = G.MESH3D[n], d1 = G.MESH3D[n + '@1']; const lim = G.DECO.big.includes(d.kind) ? B.grande : B.coisa;
    if (d.t > lim) bad.push(`${n} ${d.t} > ${lim}`); if (!d1) bad.push(`${n} sem o nível do meio`); else if (d1.t > Math.max(d.t * B.meio, B.meioMin)) bad.push(`${n}@1 ${d1.t}`);
    for (const p of d.parts) if (!G.DECO.parts.includes(p[0])) bad.push(`${n}: parte ${p[0]}`); }
  ok('d8 o desenho por instâncias e o orçamento: uma malha por coisa, parte e padrão; as instâncias as partes das coisas; o arquivo ≤ 1 MB e cada coisa no seu orçamento', meshes.length > 0 && inst <= parts && inst >= parts * 0.7 && kb <= 1024 && !bad.length, `${b.type}#${b.id}: ${pl.list.length} coisas, ${meshes.length} malhas, ${inst} instâncias de ${parts} partes, ${Math.round(tris)} triângulos; decomesh.js ${kb.toFixed(0)} KB${bad.length ? '; fora: ' + bad.slice(0, 4).join(', ') : ''}`);
}

const e = M.erros(); if (!M.limpo()) console.log('  erros:', JSON.stringify(e.mod), e.console.slice(0, 5).join(' | '));
ok('sem erro de módulo nem aviso no console', M.limpo(), JSON.stringify(e.mod));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
