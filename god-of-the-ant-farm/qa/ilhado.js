// L-126: cut off from home — someone in a pocket of their own town's land they cannot walk out of (a quay the god sank
// around, cliffs closing in), a ruler stranded on a land of strangers, a castaway in a pocket beside home. The stray rule
// and the castaways must take each somewhere: never "living where they cannot walk" for days, never "home" every day
// without moving a step, never a ruler made a guest or a captive for being cut off.
// node ev.js 5 continente 128 4 2 ilhado.js
const S = G.S, W = G.W, N = G.N; const out = [], fails = [];
const reach = (v, set) => W.reachesTown(v, set);
const strays = () => QA.check().filter(q => /não chega a pé/.test(q.msg) && q.sev <= 2);
// a pocket: a free land tile 3–8 tiles from the town, its eight neighbours turned to cliff (land for the map of lands, no
// way for the feet) — the walking map hears of it as the god's earth does
function pocket(set, used) {
  const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
  for (let r = 3; r <= 8; r++) for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2; const x = Math.floor(cx + Math.cos(a) * r), y = Math.floor(cy + Math.sin(a) * r);
    let ok = true;
    for (let dy = -2; dy <= 2 && ok; dy++) for (let dx = -2; dx <= 2 && ok; dx++) { const xx = x + dx, yy = y + dy; if (!W.inb(xx, yy)) { ok = false; break; } const i = yy * N + xx; if (!W.isLand(i) || S.occ[i] || S.cliff[i] || used.has(i)) ok = false; }
    if (!ok || !W.walkable(y * N + x) || !W.reachesTownXY(x + 0.5, y + 0.5, set)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const i = (y + dy) * N + x + dx; used.add(i); if (dx || dy) S.cliff[i] = 1; }
    S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk && W.touchWalk();
    return [x + 0.5, y + 0.5];
  }
  return null;
}
const put = (v, p) => { G.Vg.endTask(v); v.x = p[0]; v.y = p[1]; v.path = null; v.inside = 0; v._stray = 0; };
const f = G.Fac.all().find(f => { const l = S.villagers.get(f.leader); return l && !l.captive && !l.aboard && !l.wrecked && S.settlements.get(l.set); });
if (!f) return { fails: ['nenhum povo com governante em terra'], out };
const L = S.villagers.get(f.leader); const home = S.settlements.get(L.set);
const folk = [...S.villagers.values()].filter(v => v !== L && v.set === home.id && v.age >= 16 && !v.captive && !v.aboard && !v.wrecked && !v.jail);
if (folk.length < 2) return { fails: ['a cidade do governante tem gente de menos'], out };
const [M, C] = folk; const used = new Set();
// 1. the ruler and a townsman, each in a pocket beside their own town
const pL = pocket(home, used), pM = pocket(home, used), pC = pocket(home, used);
if (!pL || !pM || !pC) return { fails: ['sem lugar para os bolsões perto de ' + home.name], out };
put(L, pL); put(M, pM); put(C, pC);
// 2. a castaway in the third pocket: home is the same land, and no way home on foot
C.wrecked = { ship: 0, name: 'o barco', d: S.day, fac: home.fac, exp: 0, x: C.x, y: C.y };
const bio0 = (C.bio || []).filter(b => b[1] === 'wrecked').length;
out.push(`${f.name}: ${L.name} (governante), ${M.name} e ${C.name} (náufrago) presos em bolsões perto de ${home.name}; alcançam a cidade: ${[L, M, C].map(v => reach(v, home))}`);
if ([L, M, C].some(v => reach(v, home))) fails.push('o bolsão não isolou');
let worst = [], cameHome = 0;
QA.run(3, 50, () => {
  const s = strays(); if (s.length) worst = s;
  if (C.wrecked === null && !reach(C, home) && !C.captive && S.villagers.get(C.id)) cameHome++;
  return false;
});
const bio1 = (C.bio || []).filter(b => b[1] === 'wrecked').length;
out.push(`depois de 3 dias: governante ${L.name}: alcança ${reach(L, home)}, náufrago ${!!L.wrecked}, ainda governa ${G.Fac.get(f.id).leader === L.id}, cativo ${!!L.captive}, hóspede ${!!L.guestOf}` +
  ` · ${M.name}: alcança ${reach(M, S.settlements.get(M.set))} · ${C.name}: náufrago ${!!C.wrecked}, alcança ${reach(C, S.settlements.get(C.set) || home)}, "voltou" ${bio1 - bio0}×`);
if (worst.length) fails.push('morando onde não chega a pé por dias: ' + worst.map(q => q.msg).slice(0, 2).join(' | '));
if (S.villagers.get(L.id) && (L.captive || L.guestOf) && G.Fac.get(f.id).leader === L.id) fails.push('o governante isolado virou cativo ou hóspede');
if (cameHome) fails.push(`o náufrago "voltou para casa" sem sair do bolsão (${cameHome} vezes)`);
const pol = QA.check().filter(q => q.sys === 'pol' && q.sev <= 2); if (pol.length) fails.push('política: ' + pol.map(q => q.msg).slice(0, 2).join(' | '));
// 3. the ruler on a land of strangers: no town of their own on it — never a guest, never a captive for that
const own = new Set(G.Fac.settlementsOf(f.id).map(s => s.id));
const far = [...S.settlements.values()].find(s => !own.has(s.id) && !G.Fac.settlementsOf(f.id).some(o => W.townsLinked(o, s)));
if (far && S.villagers.get(L.id) && G.Fac.get(f.id).leader === L.id) {
  const p = W.randomNear ? W.randomNear(far.cx + 6, far.cy + 6, 4) : null;
  const q = p && W.walkableXY(p[0], p[1]) ? p : [far.cx + 0.5, far.cy + 0.5];
  put(L, q); L.wrecked = null; L.guestOf = null;
  let bad = [];
  QA.run(3, 50, () => { const s = strays().filter(x => x.msg.includes('#' + L.id)); if (s.length) bad = s; return false; });
  // (and not left "recently" cut off for good — the old rule never started a ruler's count, so the checker only ever said
  // "recente")
  const still = QA.check().filter(q => /não chega a pé/.test(q.msg) && q.msg.includes('#' + L.id));
  out.push(`${L.name} posto perto de ${far.name} (outro povo, outra terra): vivo ${!!S.villagers.get(L.id)}, náufrago ${!!L.wrecked}, cativo ${!!L.captive}, hóspede ${!!L.guestOf}, ainda governa ${G.Fac.get(f.id).leader === L.id}, ainda isolado ${still.length ? still[0].msg : 'não'}`);
  if (bad.length) fails.push('governante em terra estranha morando onde não chega a pé: ' + bad[0].msg);
  if (still.length) fails.push('três dias depois, o governante continua morando onde não chega a pé: ' + still[0].msg);
  if (G.Fac.get(f.id).leader === L.id && (L.captive || L.guestOf)) fails.push('o governante em terra estranha virou cativo ou hóspede');
} else out.push('sem terra de outro povo fora do alcance a pé para a parte 3');
const all = QA.check().filter(q => q.sev <= 2); if (all.length) fails.push('verificador no fim: ' + all.map(q => q.msg).slice(0, 3).join(' | '));
return { fails, out };
