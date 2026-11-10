// cidade-obras: as obras abertas da cidade fazendo o que a folha do P4 diz delas (qa/categorias/p4.js: a categoria «cidade»
// da matriz por prédio, D-089) — em Node, sem navegador (qa/nodemundo.js):
//   node qa/cidade-obras.js [mundo]       (padrão: o mundo pronto «cidade»; a c2 num mundo novo)
//  c1 o balde do poço contra o fogo: um fogo aceso a poucos passos de um poço de uma cidade — quem o combate enche o balde no
//     poço (diante dele), joga a água no fogo, e o fogo apaga
//  c2 a entrega na fogueira: num mundo novo, a aldeia que ainda não tem armazém — a fogueira é o depósito: a carga sai das
//     mãos (v:) para o estoque do povo (f:) diante da fogueira, pelo livro (a entrega), e o estoque cresce com ela
//  e o verificador limpo (S0 a S2 novos), sem erro de módulo
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cidade-obras ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const world = process.argv[2] || 'cidade';
let S = M.pronto(world); const W = G.W, N = G.N, V = G.Village;
let base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const fresh = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `S${q.sev} ${q.sys}: ${q.msg}`);
const qa = [];

// ------------------------------ c1. the well's bucket against the fire ------------------------------
{ // (a well of a town with people about it, and something that burns a few steps from it — a tree, a bush, the grass of a warm land —,
  // nothing built there: the fire the god lights; the ones who fight it fill their bucket at the nearest well within 14 tiles of
  // them — Villagers' runFire —, so a fire in the ring two to six tiles around the well, the corners some 8 tiles off)
  // (the longest fire first — a tree burns some thirteen seconds, a bush five, the grass four and a half (nature.js) —, the wells
  // by id: the bucket has the walk to the well and back to the fire to make. In the «cidade» of the generation 17 the first well
  // had only grass by it, at 3,2 tiles: it burned out in 5 s, with Coatlicue's bucket filled and still on its way)
  const RANK = { tree: 0, bush: 1, grass: 2 };
  let pick = null;
  for (const w of [...S.buildings.values()].filter(b => b.type === 'well' && b.built).sort((a, b) => a.id - b.id)) {
    const near = [...S.villagers.values()].filter(v => v.set === w.set && v.age >= 16 && v.age < 62 && !v.inside && !v.aboard && G.dist(v.x, v.y, w.x + 0.5, w.y + 0.5) < 14).length; if (near < 3) continue;
    for (let r = 2; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = w.x + dx, y = w.y + dy; if (!W.inb(x, y)) continue; const i = y * N + x;
      const fu = G.Nature.fuel(i); if (!(fu in RANK) || S.occ[i] || S.road[i]) continue; // (nothing built nor sown: no building, no crop)
      if (!pick || RANK[fu] < RANK[pick.fu]) pick = { w, i, x, y, fu };
    }
    if (pick && pick.fu === 'tree') break;
  }
  if (!pick) ok('c1 o balde do poço contra o fogo', false, 'nenhum poço com gente perto e algo que queime a poucos passos');
  else {
    const { w, i, x, y } = pick; const front = V.frontTile(w);
    // (the weather dry while the case lasts — the test's hand, as the compras c9's: the rain puts a fire out by the world's rule,
    // and the «cidade» of the generation 17 opens at night in a storm, 0,85 of rain: the grass the god lit went out in 0,8 s,
    // before anyone got to the well)
    const dry = () => { S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0; }; dry();
    const lit = god(() => G.Nature.ignite(i, 0.9));
    let filled = null, threw = 0, fighters = new Set(), out = -1;
    const fireNear = () => { for (const j of G.Nature.fireSet) { const fx = j % N, fy = (j / N) | 0; if (Math.abs(fx - x) <= 6 && Math.abs(fy - y) <= 6) return true; } return false; };
    // (up to two minutes of the world, looked at every step of it: the throw is a step or two of the task — looked at every
    // half a second it was seen or not by the luck of where the half second fell, 1 frame on the P4's branch, 0 in the junction)
    for (let k = 0; k < 1200; k++) {
      dry(); M.viver(0.1);
      for (const v of S.villagers.values()) { const t = v.task; if (!t || t.type !== 'fire') continue; fighters.add(v.id);
        if (t.st === 2 && v.act === 'fill' && G.dist(v.x, v.y, front[0], front[1]) < 1.6 && !filled) filled = v.name;
        if (t.st === 5 && !t.beat && v.act === 'throw') threw++; }
      if (!fireNear()) { out = +((k + 1) * 0.1).toFixed(1); break; }
    }
    ok('c1 o balde do poço contra o fogo: quem o combate enche o balde no poço, joga a água, e o fogo apaga', lit && !!filled && threw > 0 && out > 0,
      `${pick.fu} a ${G.dist(x + 0.5, y + 0.5, w.x + 0.5, w.y + 0.5).toFixed(1)} casas do poço #${w.id}: ${lit ? 'aceso' : 'não acendeu'}; ${fighters.size} combatendo; ${filled ? filled + ' encheu o balde no poço' : 'ninguém encheu o balde no poço'}; ${threw} quadros jogando água; ${out > 0 ? 'apagado em ' + out + ' s' : 'ainda queimando em 120 s'}`);
    qa.push(...fresh());
  }
}

// ------------------------------ c2. the delivery at the fire of a village with no storehouse ------------------------------
{ // (a world new: its villages have only their fire — the store comes later —, and what the hands bring is delivered there)
  S = M.novo({ seed: 41, type: 'continente', size: 96, tribes: 2 }); base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const D = G.Depot; const got = []; const book = e => { if (e[8] !== 'entrega' || !/^v:/.test(e[3]) || !/^f:/.test(e[4])) return; const v = S.villagers.get(e[9]); const t = v && v.task; const d = t && t.drop && S.buildings.get(t.drop); got.push({ k: e[5], n: e[6], at: d ? d.type : '-', set: v ? v.set : 0, fid: e[4] }); };
  D.onMove.push(book);
  const noStore = s => !V.dropoffs(s.id).some(b => b.type !== 'campfire');
  let k = 0; for (; k < 360 && !got.some(g => g.at === 'campfire'); k++) M.viver(0.5);
  D.onMove.splice(D.onMove.indexOf(book), 1);
  const at = got.find(g => g.at === 'campfire'); const s = at && S.settlements.get(at.set);
  ok('c2 a entrega na fogueira: numa aldeia sem armazém, a carga sai das mãos para o estoque do povo diante da fogueira, pelo livro', !!at && !!s && noStore(s) && at.n > 0,
    at ? `${at.n} de ${at.k} entregues na fogueira de ${s ? s.name : '?'} (${s && noStore(s) ? 'sem armazém' : 'com armazém'}) em ${((k + 1) * 0.5).toFixed(1)} s; ${got.length} entregas ao todo` : `nenhuma entrega numa fogueira em ${k * 0.5} s (${got.length} entregas)`);
  qa.push(...fresh());
}

// (the verifier — what weighs, S0 to S2, new — and no module error)
{ const e = M.erros(); ok('verificador e módulos', !qa.length && JSON.stringify(e.mod) === '{}' && !e.console.length, `${qa.slice(0, 3).join(' · ') || 'verificador limpo'} · ${JSON.stringify(e.mod)}${e.console.length ? ' · ' + e.console.slice(0, 2).join(' | ') : ''}`); }
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
