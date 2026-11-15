// gera-save-g196: o save velho da parte c6 do qa/casa-dentro.js (D-196), feito pelo código de ANTES de a casa ganhar o seu
// núcleo — o 16310aa, a gramática das plantas na versão 2, os registros na versão 4. Num mundo pequeno (uma ilha, um povo),
// vivido até haver uma cabana com a família dentro à noite: o corpo encarnado numa pessoa da casa, dentro dela, com um lugar
// da planta de então tomado pelas mãos (S.avatar.use: uma peça pelo número e a chave da planta de então), a família em casa
// (a ceia, o sono: o gancho do G.Lar as guarda). Salvo ali. A planta dessa cabana muda com a gramática nova — a peça desse
// número é outra —, e o save tem de abrir: o corpo solto do lugar que não existe mais, dentro de casa onde a planta o deixa
// ou à porta, a família em casa, o verificador limpo.
//   node qa/gera-save-g196.js SAIDA.json      (na árvore do 16310aa; o save gerado foi para qa/save-g196.json)
const fs = require('fs'); const path = require('path');
const M = require('./nodemundo.js'); const G = M.load({ qa: false, extra: ['js/space.js', 'js/possess.js'] });
const In = G.Interiors; const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
M.novo({ seed: 9, type: 'ilha', size: 64, tribes: 1 }); const S = G.S;
// (to the night of a day when a hut has its people in it)
const housing = b => !!(b && b.built && b.type !== 'ruin' && G.BDEF[b.type] && G.BDEF[b.type].housing && b.ip);
let pick = null;
for (let k = 0; k < 9000 && !pick; k++) {
  S.weather.storm = 0; G.debug.step(0.1); if (k % 20 || !(S.time > 0.74 && S.time < 0.8)) continue;
  for (const b of S.buildings.values()) {
    if (!housing(b)) continue; const res = [...S.villagers.values()].filter(v => v.home === b.id && v.inside === b.id); if (res.length < 2) continue;
    const v = res.find(o => o.age >= 18 && o.age < 60 && !o.sleeping && G.Possess.can(o).ok); if (!v || !G.Space.planNow(b)) continue;
    pick = { b, v }; break;
  }
}
if (!pick) throw new Error('nenhuma casa com a família dentro à noite');
const { b, v } = pick; const p = In.plan(b); const TL = G.Space.TILE;
const took = G.Possess.take(v); if (!took.ok) throw new Error('não encarnou: ' + took.why);
// (the body by a piece of the plan, on its floor; a place of it taken by its hands)
let pl = null;
sim(() => {
  for (const it of p.items) for (const [q, sp] of it.spots.entries()) {
    if (pl || !sp.ok || sp.use === 'acesso') continue; const f = In.freeFor(b, it.id, q); if (!f || !f.at) continue;
    v.inside = b.id; v.x = b.x + f.at[0] / TL; v.y = b.y + f.at[1] / TL; v.path = null; v.moving = false; G.Possess.setLevel(it.lv);
    if (G.Possess.use(v, b, f)) pl = f;
  }
});
if (!pl) throw new Error('o corpo não tomou lugar nenhum');
for (let k = 0; k < 5; k++) G.debug.step(0.1);
const out = process.argv[2] || path.join(__dirname, 'save-g196.json'); const s = G.Save.serialize(); fs.writeFileSync(out, s);
const u = S.avatar.use; const e = M.erros();
console.log(`gravado ${out}: ${s.length} caracteres; dia ${S.day}, hora ${S.time.toFixed(2)}; ${b.type}#${b.id} (${b.ip.f}, registro v ${b.ip.v}, gramática ${In.VERSION}); o corpo ${v.name} #${v.id} em ${u ? u.it + ':' + u.q + ' (' + u.use + ', chave ' + u.key + ')' : 'NENHUM LUGAR'}; dentro: ${[...S.villagers.values()].filter(o => o.inside === b.id).map(o => o.name + (o.sleeping ? ' (dorme)' : o.task ? ' (' + o.task.type + (o.task.what ? ':' + o.task.what : '') + ')' : '')).join(', ')}; peças: ${p.items.map(i => i.kind).join(' ')}; erros ${JSON.stringify(e.mod)} ${e.console.length}`);
