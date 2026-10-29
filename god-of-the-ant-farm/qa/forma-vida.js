// forma-vida: o cenário dos prédios com planta pela forma (D-093, D-096, D-097, a fase E; P3) num mundo de verdade, cada caso
// provocado de propósito, com um save no meio:
//   1. o mundo aberto pelo menu (os registros de antes viram os da forma ao abrir, In.migrate): todo prédio de um tipo com
//      planta pela forma — o palácio, os banhos, o paço, o mercado, o celeiro egípcio e o asteca, o teatro, a maravilha, o
//      monumento, o templo — com a família da forma onde ela se arma, e a planta válida; o verificador sem nada da forma
//      nem dos interiores
//   2. o caso ruim provocado: um mercado com uma família da receita, da versão de agora (um caminho que esquecesse a forma) —
//      o verificador o acusa (S2 forma) —; de volta à da forma, nada
//   3. salvar e carregar no meio: as famílias, as cascas de longe e as plantas as mesmas
//   4. um save de antes: os registros da versão anterior, de uma família da receita, viram os da forma ao abrir
//   5. o deus derruba um mercado (a ruína dele) e a cidade funda outro no lugar (G.Village.addBuilding → In.found): a ruína
//      sem queixa, o novo pela forma, com planta válida
//   6. o mapa muda: o chão sob um celeiro de cúpulas sobe — a planta continua válida, o quadro dela no chão da forma
//   7. a vida anda e quem está num desses prédios morre no meio: o verificador limpo, nenhum erro de módulo
//   8. onde a rua diante da entrada está mais de um passo abaixo do chão (o lote caindo para ela), os degraus que o corpo sobe
//      (Space.entryFits): diante da porta de um chão de base própria, ou do pé do lance da forma sobre uma base maciça
//   node qa/forma-vida.js [mundo]     (mundial: os tipos em vários povos)
'use strict';
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js', 'qa/forma-inv.js'] }); const In = G.Interiors, Sp = G.Space;
const KEY = process.argv[2] || 'mundial';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | forma-vida ${name} | ${info}`); if (!c) fails.push(name); };
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const some = L => (process.env.VERB ? L : L.slice(0, 3));
// (the form's family of a type: the one it prefers where it is laid out, or its only one)
const famOf = t => { const T = In.TYPES[t]; return T ? T.formFam || (T.fams || []).find(f => /^forma\./.test(f)) || null : null; };
const formed = () => [...G.S.buildings.values()].filter(b => b.built && b.type !== 'ruin' && b.ip && famOf(b.type) && G.Forma.has(b.type, b.style));
const fits = b => In.familiesFor(b.ip).ok.includes(famOf(b.type));
const qa = () => QA.check().filter(q => q.sys === 'forma' || q.sys === 'int');
const said = L => L.slice(0, 4).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ');
M.pronto(KEY); In.uncache();
// ---------------------------------------------------------------- 1. opened by the menu
{
  const all = formed(); const out = [], n = {};
  for (const b of all) {
    const ff = famOf(b.type); n[b.type] = (n[b.type] || 0) + 1;
    if (b.ip.f !== ff && fits(b)) out.push(`${b.type}#${b.id} (${b.style}) com ${b.ip.f}`);
    const p = In.plan(b); if (!p || !p.ok) out.push(`${b.type}#${b.id} (${b.style}): planta inválida (${p ? (p.errs || []).slice(0, 2).join('; ') : '-'})`);
  }
  const q = qa();
  ok('1 o mundo aberto: os prédios de planta pela forma na família dela, com planta válida; o verificador limpo', all.length >= 20 && !out.length && !q.length,
    `${all.length} prédios (${Object.keys(n).sort().map(t => t + ' ' + n[t]).join(', ')})${out.length ? '; ' + some(out).join(' / ') : ''}${q.length ? '; ' + said(q) : ''}`);
}
// ---------------------------------------------------------------- 2. the bad case, provoked
{
  const m = formed().find(b => b.type === 'mercado' && b.ip.f === famOf('mercado') && In.familiesFor(b.ip).ok.some(f => f !== famOf('mercado')));
  if (!m) ok('2 um mercado com a família da receita é acusado', false, 'nenhum mercado com outra família que se arme');
  else {
    const f0 = m.ip.f, f1 = In.familiesFor(m.ip).ok.find(f => f !== f0);
    m.ip.f = f1; In.uncache(); const bad = qa().filter(q => q.sys === 'forma' && q.msg.includes('#' + m.id));
    m.ip.f = f0; In.uncache(); const after = qa();
    ok('2 um mercado com a família da receita é acusado; de volta à da forma, nada', bad.length === 1 && bad[0].sev === 2 && !after.length, `#${m.id} com ${f1}: ${bad.length ? said(bad) : 'nada'}; de volta: ${after.length ? said(after) : 'nada'}`);
  }
}
// ---------------------------------------------------------------- 3. a save and a load in the middle
{
  const was = new Map(formed().map(b => [b.id, { f: b.ip.f, sh: strip(In.shellOf(b)) }]));
  M.salvarCarregar(); In.uncache(); const out = [];
  for (const [id, w] of was) {
    const b = G.S.buildings.get(id); if (!b || !b.ip) { out.push(`#${id} sumiu`); continue; }
    if (b.ip.f !== w.f) out.push(`#${id}: ${w.f} → ${b.ip.f}`); else if (strip(In.shellOf(b)) !== w.sh) out.push(`#${id}: outra casca`);
    const p = In.plan(b); if (!p || !p.ok) out.push(`#${id}: planta inválida`);
  }
  const q = qa();
  ok('3 salvar e carregar no meio: as famílias, as cascas de longe e as plantas as mesmas', !out.length && !q.length, `${was.size} prédios${out.length ? '; ' + some(out).join(' / ') : ''}${q.length ? '; ' + said(q) : ''}`);
}
// ---------------------------------------------------------------- 4. a save of before
{
  const o = JSON.parse(G.Save.serialize()); const old = []; const ids = new Set(formed().map(b => b.id));
  for (const sb of o.buildings) {
    const b = G.S.buildings.get(sb.id); if (!b || !sb.ip || !ids.has(b.id) || !In.TYPES[b.type].formFam) continue;
    const f1 = In.familiesFor(b.ip).ok.find(f => f !== famOf(b.type)); if (!f1) continue;
    sb.ip.f = f1; sb.ip.v = In.REC_V - 1; old.push({ id: sb.id, t: b.type, f1 });
  }
  M.abrir(o); In.uncache();
  const bad = old.filter(q => { const b = G.S.buildings.get(q.id); return !b || !b.ip || b.ip.f !== famOf(q.t) || b.ip.v !== In.REC_V || !Sp.onForm(b) || !In.plan(b).ok; });
  const ts = [...new Set(old.map(q => q.t))].sort(); const q = qa();
  ok('4 um save de antes, da família da receita: os registros viram os da forma ao abrir', old.length >= 10 && !bad.length && !q.length,
    `${old.length - bad.length} de ${old.length} (${ts.join(', ')})${bad.length ? '; ficou: ' + some(bad.map(x => `#${x.id} ${x.t}`)).join(', ') : ''}${q.length ? '; ' + said(q) : ''}`);
}
// ---------------------------------------------------------------- 5. the god pulls a market down, the town founds another
{
  const m = formed().find(b => b.type === 'mercado'); const { x, y, set } = m; const id0 = m.id;
  G.inSim++; try { G.Village.destroyBuilding(m, 'deus'); } finally { G.inSim--; }
  const ruin = G.S.buildings.get(id0); const q1 = qa();
  G.inSim++; let nb = null; try { G.Village.removeBuilding(ruin); nb = G.Village.addBuilding('mercado', x, y, set, true); } finally { G.inSim--; }
  In.uncache(); const p = In.plan(nb); const q2 = qa();
  ok('5 o mercado derrubado vira ruína sem queixa; o novo, fundado no lugar, pela forma e com planta válida', ruin && ruin.type === 'ruin' && !q1.length && nb.ip && nb.ip.f === famOf('mercado') && p.ok && !q2.length,
    `a ruína #${id0} (${ruin ? ruin.type : '-'})${q1.length ? ': ' + said(q1) : ''}; o novo #${nb.id} (${nb.style}) ${nb.ip ? nb.ip.f : 'sem registro'}, ${p.ok ? 'válida' : (p.errs || []).slice(0, 2).join('; ')}${q2.length ? '; ' + said(q2) : ''}`);
}
// ---------------------------------------------------------------- 6. the ground under a granary of domes rises
{
  const g = formed().find(b => b.type === 'celeiro' && b.ip.f === famOf('celeiro'));
  if (!g) ok('6 o chão sob um celeiro de cúpulas sobe', false, `neste mundo (${KEY}) não há celeiro egípcio nem asteca`);
  else {
    const S = G.S, N = G.N; const p0 = Sp.plinth(g);
    for (let yy = g.y; yy <= g.y + g.h; yy++) for (let xx = g.x; xx <= g.x + g.w; xx++) S.H[yy * (N + 1) + xx] += 0.6; // (the heights at the corners of the tiles: N + 1 a row)
    S.typeVer++; G.W.invalidateLand(); In.uncache();
    const p = In.plan(g), pl = Sp.plinth(g); const q = qa();
    // (and the feet from the street in by the way in, every 2 cm, a metre on: never a step the body does not take, on the floor —
    // where they stand the highest under its soles, a sole's reach before and behind its middle: a body never stands in the hand's
    // gap between the street's steps and the form's)
    const e = p.entrance, TL = Sp.TILE; const ox = e.out[0], oz = e.out[1], dx = e.x - ox, dz = e.z - oz, d = Math.hypot(dx, dz); let prev = null, step = 0, foot = 0;
    const surf = (X, Z) => { const ins = Sp.indoor(X, Z, 0, g.id); return ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); };
    const F = In.BODY.feet, ux = dx / d, uz = dz / d;
    for (let t = 0; t <= d + 1.0; t += 0.02) { const X = g.x * TL + ox + ux * t, Z = g.y * TL + oz + uz * t; foot = Math.max(surf(X, Z), surf(X + ux * F, Z + uz * F), surf(X - ux * F, Z - uz * F)); if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot; }
    foot = surf(g.x * TL + ox + ux * (d + 1.0), g.y * TL + oz + uz * (d + 1.0));
    const want = pl.hi + p.levels[0].y + Sp.FLOOR_UP;
    ok('6 o chão sob um celeiro de cúpulas sobe: a planta válida, o quadro dela no chão da forma, os pés da rua ao chão dela', pl.hi > p0.hi + 0.5 && p.ok && Sp.onForm(g) && Math.abs(pl.y0 - pl.hi) < 1e-9 && step <= In.BODY.step + 0.01 && Math.abs(foot - want) < 0.03 && !q.length,
      `#${g.id} (${g.style}, lado ${g.ip.s}): o quadro de ${p0.hi.toFixed(2)} a ${pl.hi.toFixed(2)} m, ${p.ok ? 'válida' : (p.errs || []).slice(0, 2).join('; ')}; o maior degrau ${step.toFixed(2)} m, os pés a ${(foot - want).toFixed(3)} m do chão${q.length ? '; ' + said(q) : ''}`);
  }
}
// ---------------------------------------------------------------- 7. life goes on; someone inside dies
{
  M.viver(30); const ids = new Set(formed().map(b => b.id));
  const v = [...G.S.villagers.values()].find(p => p.inside && ids.has(p.inside)); let who = 'ninguém dentro deles agora';
  if (v) { who = `${v.name} #${v.id} em ${G.S.buildings.get(v.inside).type}#${v.inside}`; G.inSim++; try { G.Village.kill(v, 'old'); } finally { G.inSim--; } M.viver(5); }
  const q = qa();
  ok('7 a vida anda; quem está dentro morre no meio: o verificador limpo', !q.length, `${who}${q.length ? '; ' + said(q) : ''}`);
}
// ---------------------------------------------------------------- 8. the steps before every way in
// (where the street before a building's way in is more than a body's step below its floor — a lot falling away to it —, Space
// reckons the steps up: before the door of a ground on its own base, before the foot of the form's flight up a solid one;
// a way in with none, the feet would meet a wall of the slope's height: L-390)
{
  const out = []; let n = 0, low = 0; const TL = Sp.TILE;
  for (const b of formed()) {
    const p = In.plan(b); if (!p || !p.ok || !p.entrance || !p.entrance.out) continue; n++;
    // (the plinth's top — the form's ground, where its flight or its floor begins — over the street a hand out of the lot's edge
    // before the way in, on its line: the street's own steps there if Space laid them)
    const e = p.entrance, pl = Sp.plinth(b); const ux = e.x - e.out[0], uz = e.z - e.out[1], d = Math.hypot(ux, uz), Lw = b.w * TL, Ld = b.h * TL;
    let t = 0; for (; t < 8; t += 0.05) { const x = e.x - ux / d * t, z = e.z - uz / d * t; if (x < -0.05 || z < -0.05 || x > Lw + 0.05 || z > Ld + 0.05) break; }
    const sx = b.x * TL + e.x - ux / d * t, sz = b.y * TL + e.z - uz / d * t; const drop = pl.y0 - Math.max(Sp.footAt(sx / TL, sz / TL), Sp.stepTop(sx, sz));
    if (drop <= In.BODY.step + 0.01) continue; low++;
    const ef = Sp.entryFits(b, p); if (ef.kind === 'nenhum' || !ef.ok) out.push(`${b.type}#${b.id} (${b.style}, ${b.ip.f}): a rua ${drop.toFixed(2)} m abaixo do alto do plinto, ${ef.kind === 'nenhum' ? 'sem degraus' : `degraus que não cabem (${ef.kind}, o pé ${ef.foot} m)`}`);
  }
  ok('8 diante de toda entrada com a rua mais de um passo abaixo do chão da forma, os degraus que o corpo sobe', n && !out.length, `${low} de ${n} entradas sobre a rua${out.length ? '; ' + some(out).join(' / ') + (out.length > 3 ? ` (e mais ${out.length - 3})` : '') : ''}`);
}
const err = M.erros(); ok('sem erros de módulo', M.limpo(), M.limpo() ? 'nenhum' : JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
