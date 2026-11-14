// relento: quem dorme ao relento perto de casa, e o save (L-705).   [ONLY=r1,r3] node qa/relento.js [mundo]
// Quem dorme fora de casa a poucos passos da própria porta é defeito (S3, L-371) — menos quando há um porquê, que a tarefa
// guarda: o caminho de casa acabou fora da porta duas vezes e a noite ficou onde a pessoa estava (t.re, L-231), ou o sono foi
// escolhido para outra cama ou para nenhuma e a casa veio depois (t.stay, T-485). As tarefas não vão no save: o gancho da
// casa devolvia o sono ao relento sem o porquê, e depois de cada load o verificador lia essas pessoas como quem acabou de
// escolher a rua à porta de casa. Agora o save guarda o porquê e o load o devolve.
// A mão da prova deita a pessoa a quatro casas da porta com a tarefa como o jogo a deixa em cada caso (o estado depois do
// L-231; o de quem se deitou sem casa) — o que se prova é o save, não como se chega lá.
// r1 a noite onde se está (t.re = 3): o verificador calado antes do save e depois do load;
// r2 o sono escolhido sem casa (t.stay = 0), a casa dada depois: calado antes e depois;
// r3 o controle: quem dorme à porta de casa sem porquê nenhum é acusado antes e depois do load (a regra do L-371 não afrouxou);
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | relento ${name} | ${info}`); if (!c) fails.push(name); };
const Vg = G.Vg, W = G.W, V = G.Village;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = M.pronto(WORLD);
const said = id => QA.check().filter(q => q.sys === 'lar' && /dorme ao relento/.test(q.msg) && q.msg.includes('#' + id + ':')).map(q => `[S${q.sev}] ${q.msg}`);
const used = new Set();
// an adult at home in their own town, the house standing, and a dry spot four or five tiles from its front that walks to it
function stage() {
  for (const v of [...S.villagers.values()].sort((a, b) => a.id - b.id)) {
    if (used.has(v.id) || v.age < 18 || v.age > 55 || v.captive || v.jail || v.aboard || v.ug || v.held || v.air || v.guestOf || v.hp < 70 || (S.avatar && S.avatar.id === v.id) || Vg.handsBusy(v) || (v.carry && v.carry.n > 1e-6)) continue;
    const h = v.home && S.buildings.get(v.home); if (!h || !h.built || h.set !== v.set || !V.livable(h) || (G.War.threat && G.War.threat(v.set))) continue;
    const [fx, fy] = V.frontTile(h);
    for (let r = 4; r <= 5; r++) for (let a = 0; a < 16; a++) {
      const x = Math.floor(fx + Math.cos(a * 0.3927) * r) + 0.5, y = Math.floor(fy + Math.sin(a * 0.3927) * r) + 0.5;
      if (!W.inb(x, y) || !W.dryXY(x, y) || S.occ[W.idx(x, y)] || S.road[W.idx(x, y)] || !W.canWalk(x, y, fx, fy, true)) continue;
      used.add(v.id); return { v, h, x, y, fx, fy };
    }
  }
  return null;
}
// asleep out of doors at (x, y), deep in the night, fed, the task as given
function lay(st, task) {
  const { v, x, y } = st;
  god(() => { S.time = 0.88; S.weather.storm = 0; S.weather.rain = 0; Vg.endTask(v); v.inside = 0; v.x = x; v.y = y; v.path = null; v.moving = false; v.hunger = 10; v.energy = 20; Vg.setTask(v, Object.assign({ type: 'sleep', pri: 1.5, st: 2, home: 0, kind: 'sleep' }, task)); v.sleeping = true; });
}
// lives `sec` seconds; what the checker said of this person on the way, and whether they slept on where they lay
function night(id, sec) {
  const out = new Set(); let slept = true;
  for (let t = 0; t < sec; t += 0.5) { M.viver(0.5); const v = S.villagers.get(id); if (!v || !v.sleeping || v.inside || !v.task || v.task.type !== 'sleep') slept = false; for (const q of said(id)) out.add(q); }
  return { said: [...out], slept };
}
// (the world may call anyone out of a sleep — an order's meeting, a fire, a storm —: the case is of one who slept on the nine
// seconds before the save; who was called is not the case, and the next one is tried — Neferu, of the «cidade», rose for
// her order's conclave six seconds after she lay down)
function run(name, task0, want, why) {
  const called = [];
  for (let k = 0; k < 6; k++) {
    const st = stage(); if (!st) break;
    const { v, h } = st; const id = v.id; const task = typeof task0 === 'function' ? task0(v) : task0;
    lay(st, task);
    const a = night(id, 9);
    if (!a.slept) { called.push(`${v.name}: ${v.task ? v.task.type : 'sem tarefa'}`); continue; }
    M.salvarCarregar(); S = G.S;
    const v2 = S.villagers.get(id); const t2 = v2 && v2.task;
    const back = !!(v2 && v2.sleeping && !v2.inside && t2 && t2.type === 'sleep');
    const kept = !!t2 && (task.re || 0) === (t2.re || 0) && (task.stay === undefined ? t2.stay === undefined : t2.stay === task.stay);
    const b = night(id, 9);
    const good = want === 'calado' ? !a.said.length && !b.said.length : a.said.length > 0 && b.said.length > 0;
    return ok(name, back && kept && good,
      `${v.name} #${id}, a ${G.dist(st.x, st.y, st.fx, st.fy).toFixed(1)} casas da porta de ${h.type}#${h.id} (${why}): antes do save o verificador ${a.said.length ? 'acusa' : 'calado'}; depois do load ${back ? 'dorme no mesmo lugar' : 'NÃO dorme mais ali (' + (t2 ? t2.type : 'sem tarefa') + ')'}, a tarefa ${t2 ? `re ${t2.re || 0}, stay ${t2.stay === undefined ? 'nenhum' : t2.stay}` : 'NENHUMA'} (${kept ? 'o porquê guardado' : 'o porquê PERDIDO'}), o verificador ${b.said.length ? 'acusa: ' + b.said[0].slice(0, 110) : 'calado'}${called.length ? '; antes: ' + called.join(', ') + ' (chamados pelo mundo)' : ''}`);
  }
  ok(name, false, called.length ? `ninguém dormiu os nove segundos antes do save: ${called.join(', ')}` : 'nenhum adulto com casa de pé e um chão seco a quatro casas da porta');
}

if (on('r1')) run('r1 a noite onde se está (o caminho de casa acabou fora da porta): calado antes e depois do load', { re: 3 }, 'calado', 't.re = 3, L-231');
if (on('r2')) run('r2 o sono escolhido sem casa, a casa dada depois: calado antes e depois do load', { stay: 0 }, 'calado', 't.stay = 0, T-485');
if (on('r3')) run('r3 o controle: à porta de casa sem porquê é acusado antes e depois do load', v => ({ stay: v.home }), 'acusa', 'o sono escolhido para esta casa, nenhum porquê');

ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `\nrelento: ${fails.length} falha(s): ${fails.join(', ')}` : '\nrelento: tudo passou');
process.exit(fails.length ? 1 : 0);
