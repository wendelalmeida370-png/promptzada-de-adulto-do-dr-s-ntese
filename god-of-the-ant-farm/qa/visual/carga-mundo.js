// carga-mundo: what the 3D shows of the goods of the world is the world's — in Node, without a graphics card (qa/visual/
// tres-node.js: the game's own 3D files, building the same geometry the game builds):
//   node qa/visual/carga-mundo.js [mundo]       (default: the ready world «cidade»)
// The proofs (the adendo's §5 in the 3D: the presentation never ahead of reality):
//   1. a store's heaps are its people's stock, by the god's view's rule (render.js drawPiles): as many heaps as goods it has,
//      none when the stock is empty, and drawn again — the chunk's signature — only when a count changes
//   2. the crates on a quay are the world's own (b.crates): each drawn once, on the ground, by the god's view's crate spot; a
//      crate taken leaves the others where they were, a new one takes a free place
//   3. the hands of a docker go to the crate the world hands out next, and the crate in the hands is no longer on the quay
//   4. what fell from someone's arms (S.loose) lies where it fell, as the thing it is
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | carga-mundo ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'cidade');
const S = G.S, L = G.Space.TILE, C = 16; const P3 = G.People3D, PR = G.Props3D, B3 = G.Build3D;
const chunkOf = b => [Math.floor(b.x / C) * C, Math.floor(b.y / C) * C];

// ------------------------------ 1. a store's heaps are its people's stock ------------------------------
{ const stores = [...S.buildings.values()].filter(b => b.built && PR.shows(b)).sort((a, b) => a.id - b.id);
  let n = 0, bad = []; for (const b of stores) { const want = PR.piles(b); const got = { wood: 0, stone: 0, food: 0 }; for (const p of PR.pieces(b)) if (p.pile) got[p.pile[0]] = p.pile[1];
    n++; if (got.wood !== want[0] || got.stone !== want[1] || got.food !== want[2]) bad.push(`${b.type}#${b.id}: ${JSON.stringify(got)} para [${want}]`); }
  ok('o pátio de cada armazém mostra o estoque do povo pela regra do Modo Deus (lenha até 8, pedra até 6, comida até 6)', n > 0 && !bad.length, `${n} armazéns${bad.length ? '; ' + bad.slice(0, 3).join(' · ') : ': cada monte com a conta certa'}`);
  const b = stores[0]; const f = b && G.Fac.ofSet(b.set);
  if (!b || !f) ok('o armazém vazio não mostra nada; o desenho muda com a conta', false, 'nenhum armazém');
  else {
    const keep = Object.assign({}, f.stock); const [cx, cy] = chunkOf(b);
    f.stock.wood = 0; f.stock.stone = 0; f.stock.food = 0; const empty = PR.pieces(b).filter(p => p.pile).length; const s0 = B3.sig(cx, cy, C);
    const cap = G.Village.cap(f.id); f.stock.wood = cap * 0.3; const s1 = B3.sig(cx, cy, C); const w1 = PR.piles(b)[0];
    f.stock.wood = cap * 0.3 + cap * 0.01; const s2 = B3.sig(cx, cy, C); // (more wood within the same eighth: the same heap)
    f.stock.wood = cap * 0.9; const s3 = B3.sig(cx, cy, C); const w3 = PR.piles(b)[0];
    Object.assign(f.stock, keep);
    ok('o armazém vazio não mostra nada; o desenho é refeito quando a conta muda, e só então', empty === 0 && s1 !== s0 && s2 === s1 && s3 !== s1 && w1 === 3 && w3 === 8, `vazio: ${empty} montes · lenha 30%: ${w1} (assinatura ${s1 !== s0 ? 'mudou' : 'igual'}) · +1%: ${s2 === s1 ? 'igual' : 'mudou'} · 90%: ${w3} (${s3 !== s1 ? 'mudou' : 'igual'})`);
  } }

// ------------------------------ 2. the crates on a quay are the world's ------------------------------
const docks = [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id);
for (const d of docks) G.Naval.dockInfo(d); // (the quay's record, as the world's people make it when they first use it)
// (a quay whose spot for the crates is dry ground, where the docker who goes there stands by them — see the end: the ones
// whose spot falls in a ford)
const wetAt = (x, y) => { const i = G.W.idx(x, y); const t = S.type[i]; return (t === G.T.RIVER && !S.road[i] && !(S.ice && S.ice[i])) || (t <= G.T.SEA && !(S.dry && S.dry[i])); };
const dock = docks.find(d => { const p = P3.crateSpot(d); return p && !wetAt(p[0], p[1]); });
const frame = (focus) => P3.update(1 / 30, focus);
const onQuay = d => P3.lying.filter(e => e[5] === d.id);
if (!dock) ok('as caixas do cais são as do mundo', false, 'nenhuma doca neste mundo');
else {
  const sp = P3.crateSpot(dock); const focus = { X: sp[0] * L, Y: 0, Z: sp[1] * L };
  // (the quay's crates, as the boats and the ships set them down: fish, and a cargo)
  dock.crates = []; let id0 = S.nextId;
  for (let k = 0; k < 6; k++) dock.crates.push({ id: S.nextId++, k: k < 4 ? 'food' : 'sal', n: 4, col: k < 4 ? '#a8c0d0' : '#ece8de', fish: k < 4 ? 'arenque' : undefined, op: 0 });
  const before = JSON.stringify([dock.crates, dock._dock, dock.wd]); for (let k = 0; k < 30; k++) frame(focus); const a = onQuay(dock);
  ok('o 3D só lê o cais: 30 quadros desenhando as caixas, e b.crates, o registro do cais e o lado da água como estavam', JSON.stringify([dock.crates, dock._dock, dock.wd]) === before, 'b.crates, b._dock, b.wd: ' + (JSON.stringify([dock.crates, dock._dock, dock.wd]) === before ? 'iguais' : 'mudaram'));
  const ids = a.map(e => e[4]).sort((x, y) => x - y).join(','), want = dock.crates.map(c => c.id).sort((x, y) => x - y).join(',');
  let apart = Infinity; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) apart = Math.min(apart, Math.hypot(a[i][0] - a[j][0], a[i][2] - a[j][2]));
  // (on dry ground: the crate's foot on the land, never in the water)
  const T2 = G.T; const dry = (x, y) => { const i = G.W.idx(x, y); const t = S.type[i]; return !((t === T2.RIVER && !S.road[i]) || t <= T2.SEA); };
  const ground = a.every(e => dry(e[0] / L, e[2] / L) && Math.abs(e[1] - G.People3D.FORM[e[3]].sz[1] / 2 - (G.W.groundH(e[0] / L, e[2] / L) * G.Space.HM)) < 0.05);
  const near = a.every(e => Math.hypot(e[0] - focus.X, e[2] - focus.Z) < 4.5);
  const forms = a.filter(e => e[3] === 'caixaPeixe').length === 4 && a.filter(e => e[3] === 'caixa').length === 2;
  ok('as caixas do cais são as do mundo: cada uma uma vez, no chão, junto ao lugar do Modo Deus, a de peixe aberta e a de carga fechada', ids === want && apart >= 0.45 && ground && near && forms, `${a.length} desenhadas de ${dock.crates.length}; a menor distância entre duas ${apart.toFixed(2)} m; ${ground ? 'no chão seco' : 'fora do chão ou na água'}; ${near ? 'junto ao lugar do cais' : 'longe'}; ${forms ? '4 de peixe abertas, 2 fechadas' : 'formas erradas'}`);
  // (taken: the first one — the others stay where they were; set down: a new one takes a free place)
  const where = new Map(a.map(e => [e[4], [e[0], e[2]]])); const gone = dock.crates.shift(); frame(focus); const b2 = onQuay(dock);
  const still = b2.every(e => { const w = where.get(e[4]); return w && Math.hypot(w[0] - e[0], w[1] - e[2]) < 1e-6; }) && !b2.some(e => e[4] === gone.id);
  dock.crates.unshift({ id: S.nextId++, k: 'food', n: 3, col: '#a8c0d0', fish: 'arenque', op: 0 }); frame(focus); const c2 = onQuay(dock); const nw = c2.find(e => e[4] === dock.crates[0].id);
  const free = !!nw && c2.every(e => e === nw || Math.hypot(e[0] - nw[0], e[2] - nw[2]) > 0.3) && c2.filter(e => e !== nw).every(e => { const w = where.get(e[4]); return w && Math.hypot(w[0] - e[0], w[1] - e[2]) < 1e-6; });
  ok('uma caixa tirada não mexe nas outras; uma caixa posta toma um lugar livre', still && free && b2.length === 5 && c2.length === 6, `tirada a ${gone.id}: ${b2.length} ficam, ${still ? 'cada uma no seu lugar' : 'mexeram'}; posta a ${dock.crates[0].id}: ${free ? 'num lugar livre' : 'em cima de outra'}`);

  // ------------------------------ 3. the docker's hands go to the crate handed out next ------------------------------
  const first = c2.find(e => e[4] === dock.crates[0].id);
  const v = [...S.villagers.values()].filter(o => o.age >= 20 && !o.inside).sort((x, y) => x.id - y.id)[0];
  const s = { yaw: Math.atan2(first[2] - focus.Z, first[0] - focus.X), X: focus.X, Z: focus.Z }; const carry0 = v.carry, act0 = v.act; v.carry = null; v.act = 'lift';
  const Lk = () => { const Lv = P3.look(v); Lv.ground = 0; return Lv; };
  let Lr = null; for (let k = 0; k < 24; k++) { Lr = Lk(); P3.reachOf(s, v, Lr, focus.X, 0, focus.Z, 1 / 30); }
  const r = Lr.reach; const atIt = r && Math.hypot(r.X - first[0], r.Y - first[1], r.Z - first[2]) < 0.01;
  // (the world's contact: the crate passes from the quay to the hands — as fishers.js does it)
  const c = dock.crates.shift(); v.carry = { k: c.k, n: c.n, crate: 1, cid: c.id, fish: c.fish, fishCol: c.col }; v.x = focus.X / L; v.y = focus.Z / L; v.inside = 0;
  frame(focus); const there = onQuay(dock).some(e => e[4] === c.id); const H = P3.held(v, null);
  ok('as mãos do estivador vão à caixa que o mundo entrega primeiro; passada às mãos, ela não está mais no cais', !!atIt && !there && H && H.form === 'caixaPeixe', `o alcance ${r ? 'a ' + Math.hypot(r.X - first[0], r.Y - first[1], r.Z - first[2]).toFixed(3) + ' m da caixa ' + first[4] : 'nenhum'}; depois do contato: ${there ? 'ainda no cais' : 'fora do cais'}, nas mãos ${H ? H.form : 'nada'}`);
  v.carry = carry0; v.act = act0;

  // ------------------------------ 4. what fell from someone's arms lies where it fell ------------------------------
  const loose = S.loose || (S.loose = []); const o = { id: S.nextId++, k: 'sal', n: 2, x: focus.X / L + 0.4, y: focus.Z / L + 0.2, op: 0, cid: 0, fac: G.Village.facOfSet(dock.set), day: S.day };
  loose.push(o); frame(focus); const e = P3.lying.find(q => q[4] === o.id); loose.splice(loose.indexOf(o), 1);
  ok('o que caiu das mãos de alguém fica onde caiu, como a coisa que é', !!e && Math.hypot(e[0] - o.x * L, e[2] - o.y * L) < 1e-6 && e[3] === 'saco', e ? `${e[3]} em (${(e[0] / L).toFixed(2)}, ${(e[2] / L).toFixed(2)})` : 'não desenhado');
  void id0;
}

{ const wetQ = docks.filter(d => { const p = P3.crateSpot(d); return p && wetAt(p[0], p[1]); }); if (wetQ.length) console.log(`  (o mundo: ${wetQ.length} de ${docks.length} docas com o lugar das caixas num vau — fishers.js crateSpot; o 3D as põe na terra seca atrás: ${wetQ.map(d => d.id).join(', ')})`); }
const er = M.erros(); ok('sem erros de módulo nem do console', M.limpo(), JSON.stringify(er.mod) + ' ' + er.console.slice(0, 3).join(' | '));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
