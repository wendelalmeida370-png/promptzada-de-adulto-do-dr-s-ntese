// grao: o grão de uma fazenda é do mundo, não do desenho nem da interface (L-394). Em Node, com o 3D carregado (visual/
// tres-node.js): um mundo pronto vivido duas vezes do mesmo save, numa fazenda de grão ainda não calculado cuja cidade é
// conquistada por um povo de outro grão — uma vida com o desenho e a interface (a cada segundo, desde antes da conquista: o
// chão e o prédio do 3D da fazenda, como a descida os pede — o Ground3D.tileCol de cada casa dela e o Build3D.nearGeo do
// pedaço dela —, o cartão da fazenda na visão de Deus (UI.select) e no corpo (Interact.buildingCard), o letreiro da obra pronta
// (FX.complete, com a câmera perto o bastante para lê-lo)), a outra sem. As duas dão o mesmo grão, o mesmo nome da fazenda e
// a mesma impressão do mundo (QA.canon). Antes do Estates.grainFor, o desenho gravava o grão do povo de antes da conquista
// (Estates.grainOf escreve b.grain) e o mundo sem ninguém olhando, o do povo de depois; antes de o Village.nameOf ler pelo
// grainFor, o cartão e o letreiro faziam o mesmo. E, em toda fazenda do mundo, o grainFor dá o grão que o grainOf daria, sem
// tirar do acaso do mundo e sem gravar nada na fazenda.
//   node qa/grao.js [mundo]        (mundial, sem argumento)
'use strict';
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M } = T.load();
// (the page's media query, which the god's card asks — a phone's screen or not —: a desktop's, as nodemundo's DOM of make-believe
// has none)
if (typeof window.matchMedia !== 'function') window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
const key = process.argv[2] || 'mundial';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | grao ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(key);
const S0 = G.S, W = G.W, N = G.N;
// (the grain the views and the interface read — Estates.grainFor — is the one the world's grainOf would work out, on every
// farm of the world: no draw on the world's chance, nothing written on the farm)
{ let n = 0, draws = 0; const bad = []; const rng0 = JSON.stringify(S0.rng), w0 = G.rngWatch;
  for (const b of S0.buildings.values()) {
    if (b.type !== 'farm' || !b.built) continue; n++; const had = b.grain;
    G.rngWatch = k => { if (!k) draws++; }; const a = G.Estates.grainFor(b); G.rngWatch = w0;
    if (b.grain !== had) bad.push(`#${b.id}: o grainFor gravou o grão`);
    const c = G.Estates.grainOf(b); if (had === undefined) delete b.grain; else b.grain = had; // (what the world's would give; the farm as it was)
    if (a !== c) bad.push(`#${b.id}: grainFor «${a && a.name}», grainOf «${c && c.name}»`);
  }
  ok('o grainFor dá o grão que o grainOf daria, sem acaso e sem gravar', n > 0 && !bad.length && !draws && JSON.stringify(S0.rng) === rng0, `${n} fazendas${bad.length ? ': ' + bad.slice(0, 4).join(' · ') : ''}; sorteios do mundo ${draws}`); }
// (the grain a people gives a farm on its ground: estates.js's rule, read here only to choose the case)
const grainBy = (b, civ) => { const i = W.idx(b.x + 1, b.y + 1); const bio = S0.biome ? S0.biome[i] : 0;
  let wet = 0; for (let dy = -2; dy <= 4; dy++) for (let dx = -2; dx <= 4; dx++) { const x = b.x + dx, y = b.y + dy; if (W.inb(x, y) && S0.type[y * N + x] === G.T.RIVER) wet++; }
  return civ === 'asteca' ? 'milho' : (bio === 3 || bio === 4) && wet ? 'arroz' : bio === 2 || bio === 1 || civ === 'nordico' ? 'cevada' : bio === 5 ? 'sorgo' : 'trigo'; };
// the case: a built farm in a town, and a living people of another grain to take the town
let pick = null;
for (const b of S0.buildings.values()) {
  if (b.type !== 'farm' || !b.built) continue; const set = S0.settlements.get(b.set); if (!set) continue; const fa = G.Fac.get(set.fac); if (!fa || !fa.alive) continue;
  const g0 = grainBy(b, fa.civ);
  const fb = G.Fac.all().find(f => f.alive && f.id !== fa.id && grainBy(b, f.civ) !== g0); if (!fb) continue;
  pick = { id: b.id, set: set.id, fa: fa.id, fb: fb.id, g0, g1: grainBy(b, fb.civ) }; break;
}
if (!pick) { ok('o caso', false, `no ${key}, nenhuma fazenda numa cidade que um povo de outro grão possa tomar`); process.exit(1); }
console.log(`a fazenda #${pick.id} de ${S0.settlements.get(pick.set).name} (${G.Fac.get(pick.fa).civ}: ${pick.g0}), tomada por ${G.Fac.get(pick.fb).name} (${G.Fac.get(pick.fb).civ}: ${pick.g1})`);
// (its grain not yet worked out by the world — a farm of the first days)
delete S0.buildings.get(pick.id).grain;
const snap = G.Save.serialize();
const B3 = G.Build3D, G3 = G.Ground3D;
// one life: the town taken, a minute lived — drawn and looked at, or not — and then the world names the farm, as a story does
function life(drawn) {
  M.abrir(JSON.parse(snap)); const S = G.S; const b = S.buildings.get(pick.id); const [cx, cy] = G.Village.center(b);
  const draw = () => { if (!drawn) return; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) G3.tileCol(y * N + x, x, y);
    const r = B3.nearGeo(b.x, b.y, 1); for (const k in r) if (r[k] && r[k].dispose) r[k].dispose();
    // (the interface: the farm's card in the god's view and in the body's, the sign of a work done read up close)
    G.UI.select(b); G.UI.select(null); G.Interact.buildingCard(b, { id: 0 });
    const z = G.Render.cam.zoom; G.Render.cam.zoom = 2; G.FX.complete(cx, cy, b); G.Render.cam.zoom = z; };
  draw();
  G.War.conquer(S.settlements.get(pick.set), { fac: pick.fb, loot: { food: 0, wood: 0, stone: 0 }, members: [], captives: [], campaign: null });
  for (let t = 0; t < 60; t++) { M.viver(1); draw(); }
  const name = G.Village.nameOf('farm', b); return { grain: b.grain || '', name, canon: QA.canon(), errs: M.erros() };
}
const A = life(true), B = life(false);
ok('o mesmo grão com e sem desenho', A.grain === B.grain, `com o desenho «${A.grain}», sem «${B.grain}» (o povo de depois da conquista: ${pick.g1})`);
ok('o mesmo nome da fazenda', A.name === B.name, `com «${A.name}», sem «${B.name}»`);
const d = QA.diff(A.canon, B.canon);
ok('a mesma impressão do mundo (QA.canon)', !d.length, d.length ? d.slice(0, 6).join(' · ') : 'igual');
ok('sem erro do jogo', !Object.keys(A.errs.mod).length && !Object.keys(B.errs.mod).length && !A.errs.console.length && !B.errs.console.length, JSON.stringify(A.errs.mod) + ' ' + A.errs.console.slice(0, 2).join(' | '));
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
