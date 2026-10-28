// planta-deus: a planta no Modo Deus, no navegador (rodado pelo ev.js) — no mundo pronto metrópole, de cada tipo de prédio
// com planta, abrir a planta pelo painel, subir piso por piso, fechar; ela abre sem travar o quadro, fecha, e o mundo não muda.
// Depois, com o modo desenvolvedor (Parte 7.4): sobre cada planta o chão que a porta alcança, os pontos de uso e as pontas
// das escadas (verde onde o corpo fica, vermelho onde não), e no painel o relatório geométrico do prédio — o mesmo do
// qa/geometria.js (In.report) —, desenhados sem erro, nenhuma falha, e o mundo igual
//   node qa/ev.js 7 continente 128 4 0 qa/planta-deus.js
const wait = ms => new Promise(r => setTimeout(r, ms));
const In = G.Interiors; const out = []; let bad = 0;
// (the test's frames are its own — ev.js stops the page's —: each is drawn here, and timed)
const draw = () => { const a = performance.now(); if (G.Render.update) G.Render.update(1 / 60, 0); G.Render.frame(1 / 60); return performance.now() - a; };
G.Ready.load('metropole'); for (let k = 0; k < 60 && !(G.S.buildings.size > 400); k++) await wait(250); await wait(500);
if (G.UI.closeModal) G.UI.closeModal(); G.UI.setSpeed(0);
const before = JSON.stringify(QA.canon());
const one = {}; for (const b of G.S.buildings.values()) if (b.built && b.ip && In.TYPES[b.ip.t] && !one[b.type]) one[b.type] = b;
for (const t of Object.keys(one)) {
  const b = one[t]; G.UI.select(b); G.Render.cam.follow = 0; G.Render.panTo(b.x + b.w / 2, b.y + b.h / 2); G.Render.cam.zoom = G.Render.cam.tz = 4;
  draw(); G.PlanView.act('plan', b);
  let k = 0, worst = 0; while (!G.PlanView.drawn(b) && k++ < 400) { worst = Math.max(worst, draw()); await wait(1); }
  const open = G.PlanView.drawn(b); const drawnMs = draw();
  const p = open ? In.plan(b) : null; const n = p ? p.levels.length : 0; const html = G.PlanView.panelHTML(b, s => s);
  for (let q = 0; q < n; q++) { G.PlanView.act('plan-up', b); worst = Math.max(worst, draw()); }
  for (let q = 0; q < n; q++) { G.PlanView.act('plan-down', b); draw(); }
  G.PlanView.act('plan', b); draw(); const closed = !G.PlanView.drawn(b);
  const good = open && closed && /Fechar a planta/.test(html);
  out.push(`${t} #${b.id}: ${open ? `aberta depois de ${k} quadros (o mais lento ${worst.toFixed(0)} ms; com a planta, ${drawnMs.toFixed(0)} ms)` : 'NÃO ABRIU'}, ${n} ${n === 1 ? 'piso' : 'pisos'}, ${closed ? 'fechou' : 'NÃO FECHOU'}`);
  if (!good) bad++;
}
// (the dev mode's look: the report in the panel, the geometry drawn over the plan)
const dev = G.Dev.on; G.Dev.on = true; const geo = [];
for (const t of Object.keys(one)) {
  const b = one[t]; G.UI.select(b); G.Render.cam.follow = 0; G.Render.panTo(b.x + b.w / 2, b.y + b.h / 2); G.Render.cam.zoom = G.Render.cam.tz = 4;
  draw(); G.PlanView.act('plan', b);
  let k = 0; while (!G.PlanView.drawn(b) && k++ < 400) { draw(); await wait(1); }
  const p = G.PlanView.drawn(b) ? In.plan(b) : null; const ms = draw();
  const html = G.PlanView.panelHTML(b, s => s); const said = /Geometria:/.test(html); const shown = (html.match(/✗/g) || []).length;
  const list = p ? In.report(b, p, { world: true }) : []; const nF = list.filter(x => x.k === 'FALHA').length;
  geo.push(`${t} #${b.id}: ${!p ? 'NÃO ABRIU' : said ? `${nF} ${nF === 1 ? 'falha' : 'falhas'}${nF ? ' (' + list.filter(x => x.k === 'FALHA').map(x => x.what).slice(0, 2).join('; ') + ')' : ''}, ${list.length - nF} ${list.length - nF === 1 ? 'escolha' : 'escolhas'}, no painel ${shown} ✗; com o desenho, ${ms.toFixed(0)} ms` : 'SEM O RELATÓRIO NO PAINEL'}`);
  if (!p || !said || nF || shown !== Math.min(4, nF)) bad++;
  G.PlanView.act('plan', b); draw();
}
G.Dev.on = dev;
G.UI.select(null);
const same = JSON.stringify(QA.canon()) === before; if (!same) bad++;
return { tipos: out, desenvolvedor: geo, mundoIgual: same, falhas: bad, veredito: bad ? 'FALHOU' : 'PASSOU' };
