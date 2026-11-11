// juntar: o povo se junta na praça (a lacuna «cidade/juntar» da matriz por prédio; Bairros Vivos, o agente M), em Node, num
// mundo pronto. A auditoria dos ajuntamentos que o mundo tem: a sentença e a execução já eram na praça (justice.js,
// squareSpot), a festa também (festivals.js, place 'praca'), o chamado ao trabalho na praça ou no templo (life.js), a história
// ao pé do fogo fica no fogo, a audiência é do palácio (D-124). O voto e o pão (Po.crowd, polity.js) iam para onde o governante
// recebe — a porta do palácio, quando há um — com a praça vazia ao lado: passam a ser na praça, pela porta Po.forum.
//   j1  o voto na praça: a capital com praça e palácio — os chamados vão à praça, e chegam
//   j2  o pão na praça
//   j3  sem praça, onde o governante recebe (como antes)
//   j4  a audiência continua no palácio; a ronda fica no posto (D-103)
//   j5  duas praças: a mais antiga; a praça que o deus tira no meio; o save
//   node qa/juntar.js [mundo]        (ONLY=j1,j3 só esses)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const MUNDO = process.argv[2] || process.env.MUNDO || 'metropole';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | juntar ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Po;
const pega = () => { S = G.S; V = G.Village; Po = G.Polity; return S; };
const abre = () => { M.pronto(MUNDO); return pega(); };
function checa() {
  const out = [];
  for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
const capitais = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
const pracas = set => [...S.buildings.values()].filter(b => b.set === set.id && b.built && b.type === 'praca').sort((a, c) => a.id - c.id);
const palacio = set => { const f = G.Fac.get(set.fac); const p = f && G.Court && G.Court.bestPalace ? G.Court.bestPalace(f) : null; return p && p.built && p.set === set.id ? p : null; };
const chamados = (set, why) => [...S.villagers.values()].filter(v => v.set === set.id && v.task && v.task.type === 'assembly' && v.task.why === why);
const naPraca = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
// (the capital with a square and a palace standing, the most peopled first; where one has no square, the god's hand raises one —
// and a chief's hall where it has no palace: the premise armed, never the rule)
function arma() {
  abre(); let best = null;
  for (const set of capitais()) { if (V.pop(set.id) < 12) continue; if (pracas(set).length && palacio(set)) return { set, posta: '' }; if (!best) best = set; }
  if (!best) return null; const posta = [];
  if (!pracas(best).length) { const b = sim(() => V.handFound(best, 'praca', G.Escala.n0('praca'), { built: true, R: 40 })); if (!b) return null; posta.push('a praça'); }
  if (!palacio(best)) { const b = sim(() => V.handFound(best, 'paco', G.Escala.n0('paco'), { built: true, R: 40 })); if (!b) return null; posta.push('a casa do chefe'); }
  return pracas(best).length && palacio(best) ? { set: best, posta: posta.join(' e ') } : null;
}
// (everyone of the town free of whatever they were at, awake and near: the crowd has whom to call)
function livres(set, at) { sim(() => { for (const v of S.villagers.values()) if (v.set === set.id && !v.captive && !v.jail && !v.aboard && v.age >= 8 && !(S.avatar && S.avatar.id === v.id) && G.dist(v.x, v.y, at[0], at[1]) < 20 && !(v.task && v.task.type === 'ronda')) { if (v.inside) v.inside = 0; v.sleeping = false; G.Vg.endTask(v); } }); }
function junta(why) {
  const a = arma(); if (!ok(`${why}a a capital com praça e palácio`, !!a, a ? `${a.set.name} (${V.pop(a.set.id)} pessoas)${a.posta ? ': ' + a.posta + ' pela mão do deus' : ''}` : 'nenhuma capital onde armar a premissa')) return null;
  const { set } = a; const f = G.Fac.get(set.fac); const sq = pracas(set)[0]; const pal = palacio(set); const seat = Po.seat(f); const forum = Po.forum(set); const c = V.center(sq);
  ok(`${why}b a porta: a praça`, Math.abs(forum[0] - c[0]) < 1e-9 && Math.abs(forum[1] - c[1]) < 1e-9 && !naPraca(sq, seat[0], seat[1]), `Po.forum: (${forum[0]}, ${forum[1]}), o meio da praça #${sq.id}; onde o governante recebe (Po.seat): (${seat[0].toFixed(1)}, ${seat[1].toFixed(1)}), diante de ${pal.type}#${pal.id}, a ${G.dist(seat[0], seat[1], c[0], c[1]).toFixed(1)} casas da praça`);
  livres(set, forum); sim(() => Po.crowd(set, why === 'j1' ? 'voto' : 'pao'));
  const L = chamados(set, why === 'j1' ? 'voto' : 'pao'); const fora = L.filter(v => !naPraca(sq, v.task.x, v.task.y));
  ok(`${why}c os chamados vão à praça`, L.length >= 3 && !fora.length, `${L.length} chamados ${why === 'j1' ? 'ao voto' : 'ao pão'}; com o alvo fora da praça: ${fora.length}`);
  const ids = L.map(v => v.id); M.viver(14);
  const perto = ids.map(i => S.villagers.get(i)).filter(v => v && G.dist(v.x, v.y, c[0], c[1]) <= 5.2), noPal = ids.map(i => S.villagers.get(i)).filter(v => v && G.dist(v.x, v.y, seat[0], seat[1]) < G.dist(v.x, v.y, c[0], c[1]) && G.dist(v.x, v.y, seat[0], seat[1]) <= 4);
  ok(`${why}d e chegam`, perto.length >= Math.ceil(ids.length / 2) && noPal.length <= perto.length / 3, `14 s depois: ${perto.length} dos ${ids.length} a menos de 5 casas do meio da praça; diante do palácio: ${noPal.length}`);
  return { set, sq, pal, ids };
}
run('j1', () => { const r = junta('j1'); if (!r) return; const c = checa(); ok('j1e verificador', c.ok, c.txt); });
run('j2', () => { const r = junta('j2'); if (!r) return; const c = checa(); ok('j2e verificador', c.ok, c.txt); });

// ------------------------------ j3: sem praça ------------------------------
run('j3', () => {
  abre(); let set = capitais().find(s => !pracas(s).length && V.pop(s.id) >= 8);
  if (!set) { set = capitais().find(s => V.pop(s.id) >= 8); if (set) sim(() => { for (const b of pracas(set)) V.removeBuilding(b); }); }
  if (!ok('j3a a capital sem praça', !!set && !pracas(set).length, set ? `${set.name} (${V.pop(set.id)} pessoas)` : 'nenhuma capital')) return;
  const f = G.Fac.get(set.fac); const seat = Po.seat(f); const forum = Po.forum(set);
  ok('j3b onde o governante recebe, como antes', !!seat && Math.abs(forum[0] - seat[0]) < 1e-9 && Math.abs(forum[1] - seat[1]) < 1e-9, `Po.forum (${forum[0].toFixed(1)}, ${forum[1].toFixed(1)}) = Po.seat (${seat[0].toFixed(1)}, ${seat[1].toFixed(1)})`);
  // (a town that is no capital, with no square: its own middle — never the capital's seat)
  const vila = [...S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Fac.capitalOf(s.fac) !== s && !pracas(s).length);
  if (vila) { const p = Po.forum(vila); ok('j3c a vila sem praça', Math.abs(p[0] - vila.cx) < 1e-9 && Math.abs(p[1] - vila.cy) < 1e-9, `${vila.name}: o meio dela (${p[0].toFixed(1)}, ${p[1].toFixed(1)})`); }
  livres(set, forum); sim(() => Po.crowd(set, 'voto')); const L = chamados(set, 'voto');
  ok('j3d os chamados vão para lá', L.length >= 1 && L.every(v => Math.abs(v.task.x - forum[0]) < 1e-9 && Math.abs(v.task.y - forum[1]) < 1e-9), `${L.length} chamados ao voto, todos para onde o governante recebe`);
  M.viver(10); const c = checa(); ok('j3e verificador', c.ok, c.txt);
});

// ------------------------------ j4: a audiência no palácio; a ronda no posto ------------------------------
run('j4', () => {
  const a = arma(); if (!ok('j4a a capital com praça e palácio', !!a, a ? a.set.name : 'sem premissa')) return;
  const { set } = a; const forum = Po.forum(set); const sq = pracas(set)[0];
  livres(set, forum); sim(() => Po.crowd(set, 'audiencia'));
  const noVoto = chamados(set, 'audiencia'); const aud = [...S.villagers.values()].filter(v => v.task && v.task.type === 'assembly' && v.task.kind === 'audiencia');
  ok('j4b a audiência não vai à praça', !noVoto.length && aud.every(v => !naPraca(sq, v.task.x, v.task.y)), `chamados à praça pela audiência: ${noVoto.length}; em audiência, no palácio: ${aud.length}`);
  // (the watch on its round stays there: D-103)
  const guarda = [...S.villagers.values()].find(v => v.set === set.id && !v.captive && v.age >= 16 && G.dist(v.x, v.y, forum[0], forum[1]) < 20 && !(v.task && v.task.type === 'assembly'));
  if (guarda) {
    sim(() => { G.Vg.endTask(guarda); guarda.task = null; G.Vg.setTask(guarda, { type: 'ronda', pri: 1 }); });
    const era = guarda.task && guarda.task.type; sim(() => Po.crowd(set, 'voto'));
    ok('j4c a ronda fica no posto', era !== 'ronda' || guarda.task.type === 'ronda', `${guarda.name}, em ${era === 'ronda' ? 'ronda' : 'outra tarefa (' + era + ': a ronda não se armou)'}: depois do chamado ao voto, ${guarda.task ? guarda.task.type : 'sem tarefa'}`);
  }
  M.viver(10); const c = checa(); ok('j4d verificador', c.ok, c.txt);
});

// ------------------------------ j5: duas praças; o deus tira a praça no meio; o save ------------------------------
run('j5', () => {
  const a = arma(); if (!ok('j5a a capital com praça e palácio', !!a, a ? a.set.name : 'sem premissa')) return;
  const { set } = a; const velha = pracas(set)[0];
  const nova = sim(() => V.handFound(set, 'praca', G.Escala.n0('praca'), { built: true, R: 50, x: Math.floor(set.cx) + 9, y: Math.floor(set.cy) + 9 }));
  const forum = Po.forum(set); const c = V.center(velha);
  ok('j5b a praça mais antiga', !!nova && nova.id > velha.id && Math.abs(forum[0] - c[0]) < 1e-9 && Math.abs(forum[1] - c[1]) < 1e-9, `duas praças (#${velha.id} e ${nova ? '#' + nova.id : 'nenhuma nova'}): o povo se junta na #${velha.id}`);
  livres(set, forum); sim(() => Po.crowd(set, 'voto')); const n = chamados(set, 'voto').length;
  // (the god takes the square away with the people on their way: they end where they were going, nobody stuck, no error)
  sim(() => V.destroyBuilding(velha, 'meteor')); M.viver(40);
  const ainda = chamados(set, 'voto').length; const depois = Po.forum(set); const c2 = nova ? V.center(nova) : null;
  ok('j5c o deus tira a praça no meio', n >= 1 && ainda === 0 && (!c2 || (Math.abs(depois[0] - c2[0]) < 1e-9 && Math.abs(depois[1] - c2[1]) < 1e-9)), `${n} a caminho do voto; 40 s depois de a praça cair, ainda chamados: ${ainda}; o próximo ajuntamento: na praça #${nova ? nova.id : '—'}`);
  const k = checa(); ok('j5d verificador', k.ok, k.txt);
  sim(() => Po.crowd(set, 'pao')); M.viver(3); M.salvarCarregar(); pega(); M.viver(10);
  const k2 = checa(); ok('j5e o save no meio de um ajuntamento', k2.ok, k2.txt);
});

console.log(fails.length ? `JUNTAR: FALHOU (${fails.join(', ')})` : `JUNTAR: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
