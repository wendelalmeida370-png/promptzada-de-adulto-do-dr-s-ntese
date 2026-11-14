// obra-casa: a casa ampliada por cima da família (L-371, a regra do P1) — a casa velha fica inteira a obra toda, nas duas
// vistas, e o andaime da nova sobe em volta dela com a obra; pronta, a casa nova; largada, a velha de novo — em Node, num
// mundo de grama feito à mão (fidelidade-lib):
//   node qa/visual/obra-casa.js
// Para cada passo que a cidade dá (cabana → casa, casa → sobrado, sobrado → ínsula) e cada povo, a casa velha de pé e com o
// seu registro, depois feita obra como a cidade a faz (city.js upgradeHomes, village.js improve: o tipo o novo, não pronta,
// o velho no upgradeFrom, o registro como estava):
//   1. o 3D, a 10 %, 50 % e 95 % da obra: desenhado pela casca do registro — a da casa velha —, o desenho de perto da casa
//      velha todo dentro dele (as células cobertas), o andaime por cima, mais alto com a obra; de longe, a casa velha
//   2. o deus, nos mesmos três: o desenho da casa velha (pela casca do registro, como o tipo que era, ou o desenho de antes
//      dele), nunca o canteiro; o topo do andaime de sobre as paredes velhas até sobre as novas, com a obra
//   3. pronta (Interiors.complete refaz o registro, como o Village.completeBuilding): a casa nova nas duas vistas, sem obra
//   4. largada (a obra abandonada: o tipo o velho de novo, de pé): a casa velha de novo, como era
//   e nenhum erro do jogo
'use strict';
const F = require('./fidelidade-lib.js');
const { G, M } = F.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | obra-casa ${name} | ${info}`); if (!c) fails.push(name); };
const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const STEPS = [['hut', 'house'], ['house', 'sobrado'], ['sobrado', 'insula']];
const PS = [0.1, 0.5, 0.95];
const R = G.Render, B3 = G.Build3D, In = G.Interiors, A = G.Arch, Art = G.Art;
F.blank();
// (pictures' masks on one grid)
const masks = (...pics) => { const mk = F.gridFor(...pics); return pics.map(p => F.measure(F.paint3D(p, mk()))); };
// (how much of a's cells b covers)
const covered = (a, b) => { let n = 0, k = 0; for (let q = 0; q < a.mask.length; q++) if (a.mask[q]) { n++; if (b.mask[q]) k++; } return n ? k / n : 1; };
// (the cells b has that a has not: what the work adds to the old house — its scaffold)
const added = (a, b) => { let k = 0; for (let q = 0; q < a.mask.length; q++) if (b.mask[q] && !a.mask[q]) k++; return k; };
const iou = (a, b) => { let i = 0, u = 0; for (let q = 0; q < a.mask.length; q++) { if (a.mask[q] && b.mask[q]) i++; if (a.mask[q] || b.mask[q]) u++; } return u ? i / u : 1; };
// (the work, as the city starts it: the type the new one, not built, the old one in upgradeFrom; the record as it was)
const work = (b, from, to, p) => { const def = G.BDEF[to]; b.type = to; b.built = false; b.progress = p; b.upgradeFrom = from; b.need = Object.assign({ wood: 0, stone: 0 }, def.cost); b.incoming = { wood: 0, stone: 0 }; };
// (the old house as the god's view draws it: the type it was, the same record)
const asOld = b => ({ id: b.id, type: b.upgradeFrom, w: b.w, h: b.h, style: b.style, v: b.v, wd: b.wd, ip: b.ip });
const shellKey = s => JSON.stringify(s && s.shell);

const bad1 = [], bad2 = [], bad3 = [], bad4 = []; let n1 = 0, n2 = 0, viaShell = 0, viaOld = 0, n3 = 0, n4 = 0; let rise = '';
let id = 9000;
for (const [from, to] of STEPS) for (const st of STY) {
  const b = F.put(from, st, (id += 7));
  if (!b.ip) { bad1.push(`${from}/${st}: sem registro`); F.drop(b); continue; }
  const sh0 = B3.shellOf(b); const near0 = F.near(b), far0 = F.far(b); const q = R.quarter();
  const geo0 = sh0 && A.homeGeo ? A.homeGeo(b, In.shellOf(b), q) : null;
  const tops = [];
  for (const p of PS) {
    work(b, from, to, p);
    // ---- 1. the 3D ----
    n1++; const S = B3.shellOf(b); const near = F.near(b), far = F.far(b);
    const [m0, m1] = masks(near0, near); const [f0, f1] = masks(far0, far);
    const cov = covered(m0, m1), fiou = iou(f0, f1); tops.push(m1.tip); // (the scaffold's poles: the picture's highest cell)
    if (!S || shellKey(S) !== shellKey(sh0)) bad1.push(`${from}→${to}/${st} ${p * 100}%: ${S ? 'outra casca' : 'sem casca'}`);
    else if (cov < 0.98) bad1.push(`${from}→${to}/${st} ${p * 100}%: a casa velha coberta só ${(cov * 100).toFixed(1)}%`);
    else if (added(m0, m1) < 10) bad1.push(`${from}→${to}/${st} ${p * 100}%: sem andaime em volta da casa (${added(m0, m1)} células a mais)`);
    else if (fiou < 0.97) bad1.push(`${from}→${to}/${st} ${p * 100}%: de longe outra (${fiou.toFixed(2)})`);
    // ---- 2. the god ----
    n2++; const o = R.siteOld(b, true);
    if (!o) bad2.push(`${from}→${to}/${st} ${p * 100}%: nada da casa velha`);
    else if (o.shell) { viaShell++; const g = A.homeGeo(asOld(b), In.shellOf(b), q); if (JSON.stringify(o.spr.H) !== JSON.stringify(g) || (geo0 && JSON.stringify(g) !== JSON.stringify(geo0))) bad2.push(`${from}→${to}/${st} ${p * 100}%: o desenho pela casca não é o da casa velha`); }
    else { viaOld++; const dv = R.doorView(asOld(b)); if (o.spr !== Art.building(from, b.v, b.style, b.wd, dv.back)) bad2.push(`${from}→${to}/${st} ${p * 100}%: o desenho de antes não é o da casa velha`); }
  }
  // (the scaffold higher with the work, in the 3D and the god's)
  const gt = PS.map(p => { b.progress = p; return R.siteTop(b, R.siteOld(b, false)); });
  if (!(tops[0] <= tops[1] + 1e-6 && tops[1] <= tops[2] + 1e-6 && tops[2] > tops[0])) bad1.push(`${from}→${to}/${st}: o andaime do 3D não sobe com a obra (${tops.map(t => (t / F.ZPX).toFixed(1)).join(' → ')} m)`);
  if (!(gt[0] < gt[1] && gt[1] < gt[2])) bad2.push(`${from}→${to}/${st}: o andaime do deus não sobe com a obra (${gt.join(' → ')} px)`);
  if (!rise) rise = `${from}→${to}/${st}: o andaime no 3D ${tops.map(t => (t / F.ZPX).toFixed(1)).join(' → ')} m, no deus ${gt.map(z => (z / F.ZPX).toFixed(1)).join(' → ')} m`;
  // ---- 3. done: the record made the new type's ----
  n3++; const c = Object.assign({}, b), ip0 = JSON.parse(JSON.stringify(b.ip)); b.built = true; b.progress = 1; b.upgradeFrom = null; In.complete(b);
  const S3 = B3.shellOf(b);
  // (the record the new type's, of a family the new type has — the shell may be the old one's where the two types share it: a
  // two-storey house and a sobrado of the same people —; the god without the old house, its picture the new type's)
  if (b.ip.t !== to) bad3.push(`${from}→${to}/${st}: o registro ficou ${b.ip.t}`);
  else if (!S3 || !In.familiesFor(b.ip).ok.includes(b.ip.f)) bad3.push(`${from}→${to}/${st}: ${S3 ? 'a família ' + b.ip.f + ' não é do tipo novo' : 'sem casca'}`);
  else if (R.siteOld(b, true)) bad3.push(`${from}→${to}/${st}: o deus ainda desenha a casa velha`);
  else if (!A.homeKey(b, In.shellOf(b), q)) bad3.push(`${from}→${to}/${st}: sem o desenho da casa nova pela casca`);
  // ---- 4. given up (from the work again): the old house as it was ----
  // (the work as it was before it was done — its record the old house's —, then given up as Vg's abandonSite does: the type the
  // old one again, built)
  n4++; Object.assign(b, c); b.ip = ip0; b.type = from; b.upgradeFrom = null; b.built = true; b.progress = 1;
  const S4 = B3.shellOf(b); const near4 = F.near(b); const [n0, n4m] = masks(near0, near4);
  if (!S4 || R.siteOld(b, true)) bad4.push(`${from}/${st}: ${S4 ? 'o deus ainda desenha a obra' : 'sem casca'}`);
  else if (iou(n0, n4m) < 0.9) bad4.push(`${from}/${st}: a casa velha de volta outra (${iou(n0, n4m).toFixed(2)})`);
  F.drop(b);
}
ok('1. o 3D: a casa velha inteira pela casca do registro, o andaime em volta subindo com a obra; de longe, a casa velha', !bad1.length,
  bad1.length ? bad1.slice(0, 4).join(' · ') : `${n1} obras (3 passos × 6 povos × 10, 50 e 95 %): a casa velha toda coberta, o andaime em volta dela; ${rise}`);
ok('2. o deus: o desenho da casa velha a obra toda, nunca o canteiro; o andaime subindo com a obra', !bad2.length,
  bad2.length ? bad2.slice(0, 4).join(' · ') : `${n2} obras: ${viaShell} pela casca do registro como a casa velha, ${viaOld} pelo desenho de antes dela (a parte do quadro acabou: o substituto de um quadro)`);
ok('3. pronta: o registro refeito para o tipo novo, a casa nova nas duas vistas', !bad3.length, bad3.length ? bad3.slice(0, 4).join(' · ') : `${n3} casas prontas: o registro do tipo novo numa família dele, o deus sem a obra e com a casa nova pela casca`);
ok('4. largada: a casa velha de novo, como era, sem obra', !bad4.length, bad4.length ? bad4.slice(0, 4).join(' · ') : `${n4} obras largadas: a casa velha de volta`);
const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
