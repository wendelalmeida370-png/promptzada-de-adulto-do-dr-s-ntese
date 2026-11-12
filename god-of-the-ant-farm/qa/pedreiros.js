// pedreiros: as minas e os pedreiros (L-785) — Bairros Vivos, o agente M, 3ª rodada, em Node, num mundo pronto.
// Medido (a semente 211 da árvore juntada, o save do ano 81): um povo de 146 pessoas, com rocha em volta de todas as cidades e
// quinze obras à espera de pedra (o alvo do armazém em 491, o estoque em 1), recebia 6 a 9 de pedra por ano — os seus seis
// «mineiros» estavam todos no minério. O planejador dá às minas uma turma (o que soma aos pedreiros da cidade para elas) e
// o economy.js punha na mina todo «mineiro» sem posto enquanto houvesse lugar, quatro por mina: não sobrava quem quebrasse
// pedra. Agora as minas levam só a turma que o planejador lhes deu (set.minaN); os outros «mineiros» são da pedra. No mesmo
// save, nos três anos seguintes: 81, 37 e 56 de pedra por ano.
//   q1  a porta: em toda cidade com mina, os «mineiros» com posto na mina são no máximo a turma do planejador (set.minaN)
//   q2  a pedra em falta no armazém de todo povo: há «mineiros» sem posto, que quebram pedra (a tarefa 'mine' ou 'quarry') e
//       a entregam; o mesmo sem a regra (o controle da própria prova): mais gente na mina, menos na pedra
//   q3  o save no meio: os mesmos postos, o verificador limpo
//   q4  o save de antes (sem set.minaN): ao abrir ninguém perde o posto; a porta (E.place) com a turma em 0 e em 1
//   q5  o minério continua a sair: onde o planejador dá turma à mina e há mineiros, a mina tem gente
//   node qa/pedreiros.js [mundo]        (ONLY=q1,q2 só esses)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/pedreiros-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const MUNDO = process.argv[2] || process.env.MUNDO || 'mega';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | pedreiros ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, D, E;
const pega = () => { S = G.S; V = G.Village; D = G.Depot; E = G.Eco; return S; };
function checa() {
  const out = []; for (const q of QA.check()) if (q.sev <= 2 || q.sys === 'pedreiros') out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
const veio = b => { const o = S.ores && S.ores.find(q => q.id === b.ore); return !!o && o.amt > 0; };
const minas = s => [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'mina' && b.built && veio(b));
const cidades = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && minas(s).length);
const mineiros = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'mineiro' && !v.captive);
const naMina = v => !!v.job && (S.buildings.get(v.job) || {}).type === 'mina';
const postos = () => [...S.villagers.values()].filter(v => v.role === 'mineiro' && !v.captive).map(v => v.id + ':' + (v.job || 0)).sort().join(' ');
// (the stone of every people's store taken away by the proof's hand: every town short of stone)
const semPedra = () => sim(() => { for (const f of G.Fac.all()) if (f.alive && (f.stock.stone || 0) > 0) D.use('f:' + f.id, 'stone', f.stock.stone, { code: 'teste', mine: true }); });
const conta = () => { let T = 0, Mn = 0, P = 0, mais = []; for (const s of cidades()) { T++; const m = mineiros(s); const p = m.filter(naMina).length; Mn += m.length; P += p; if (s.minaN === undefined || p > s.minaN) mais.push(`${s.name}: ${p} com posto, a turma ${s.minaN}`); } return { T, Mn, P, mais }; };

// ------------------------------ q1: a porta ------------------------------
run('q1', () => {
  M.pronto(MUNDO); pega(); for (let t = 0; t < 10; t++) M.viver(1);
  const c = conta(); const v = checa();
  ok('q1 os mineiros na mina são no máximo a turma do planejador', c.T >= 1 && c.Mn >= 1 && !c.mais.length && v.ok, `${MUNDO}, 10 s vividos: ${c.T} cidades com mina de veio vivo, ${c.Mn} «mineiros», ${c.P} com posto na mina, ${c.Mn - c.P} da pedra; ${c.mais.length ? 'ACIMA DA TURMA: ' + c.mais.join('; ') : 'nenhuma cidade acima da turma'}; ${v.txt}`);
});

// ------------------------------ q2, q3: a pedra em falta ------------------------------
run('q2', () => {
  const vive = semRegra => {
    M.pronto(MUNDO); pega(); M.reseed(41); const c0 = E.CREW_CAP; if (semRegra) E.CREW_CAP = false;
    let entregas = 0; const fn = e => { if (e[5] !== 'stone' || e[8] !== 'entrega') return; const v = S.villagers.get(+String(e[3]).slice(2)); if (v && v.role === 'mineiro') entregas += e[6]; };
    D.onMove.push(fn);
    try {
      const quebram = new Set(); let livres = 0, P = 0, Mn = 0;
      for (let t = 0; t < 150; t++) {
        semPedra(); M.viver(1);
        for (const s of cidades()) for (const v of mineiros(s)) if (!naMina(v) && v.task && (v.task.type === 'mine' || v.task.type === 'quarry')) quebram.add(v.id);
        if (t === 60) { const c = conta(); P = c.P; Mn = c.Mn; livres = c.Mn - c.P; }
      }
      const v = semRegra ? null : checa();
      return { livres, P, Mn, quebram: quebram.size, entregas: Math.round(entregas), v, fn };
    } finally { E.CREW_CAP = c0; const k = D.onMove.indexOf(fn); if (k >= 0) D.onMove.splice(k, 1); }
  };
  const com = vive(false);
  // (q3: the save, at the end of the life with the rule)
  const antes = postos(); M.salvarCarregar(); pega(); const depois = postos(); const c3 = conta(); const v3 = checa();
  const sem = vive(true);
  ok('q2 com a pedra em falta, há mineiros na pedra', com.livres >= 1 && com.quebram >= 1 && com.entregas > 0 && com.v.ok && com.P < sem.P && com.livres > sem.livres,
    `a pedra tirada do armazém de todo povo, 150 s: com a regra, ${com.Mn} «mineiros» nas cidades com mina — ${com.P} na mina, ${com.livres} da pedra; ${com.quebram} deles quebraram pedra e entregaram ${com.entregas}; ${com.v.txt}. Sem a regra (o controle): ${sem.Mn} «mineiros» — ${sem.P} na mina, ${sem.livres} da pedra; ${sem.quebram} quebraram pedra e entregaram ${sem.entregas}`);
  ok('q3 o save: os mesmos postos', antes === depois && !c3.mais.length && v3.ok, `os postos dos «mineiros» ${antes === depois ? 'iguais' : 'MUDARAM'} depois do save; ${c3.mais.length ? 'acima da turma: ' + c3.mais.join('; ') : 'nenhuma cidade acima da turma'}; ${v3.txt}`);
});

// ------------------------------ q4: o save de antes, e a porta ------------------------------
run('q4', () => {
  M.pronto(MUNDO); pega(); for (let t = 0; t < 6; t++) M.viver(1);
  // (a town whose mines have a crew: as a save of before — no count —, nobody loses the post when the posts are given again)
  const set = cidades().filter(s => mineiros(s).some(naMina)).sort((a, c) => mineiros(c).length - mineiros(a).length || a.id - c.id)[0];
  if (!ok('q4a uma cidade com gente na mina', !!set, set ? `${set.name}: ${mineiros(set).length} «mineiros», ${mineiros(set).filter(naMina).length} na mina, a turma ${set.minaN}` : 'nenhuma no mundo')) return;
  // (a save of before has no count: the rule of before — every idle miner down the mine while there is a place —, and nobody
  // who had a post loses it; the rule holds from the town's first sharing of hands on)
  const n0 = set.minaN; const tinham = mineiros(set).filter(naMina).map(v => v.id + ':' + v.job); const M0 = mineiros(set).length;
  delete set.minaN; sim(() => E.place(set)); const ficam = tinham.every(k => mineiros(set).some(v => v.id + ':' + v.job === k)); const semConta = mineiros(set).filter(naMina).length;
  // (the door: no crew — nobody in the mine; a crew of one — one)
  set.minaN = 0; sim(() => E.place(set)); const z = mineiros(set).filter(naMina).length;
  set.minaN = 1; sim(() => E.place(set)); const um = mineiros(set).filter(naMina).length;
  set.minaN = n0; sim(() => E.place(set));
  ok('q4b o save de antes fica como estava; a porta com a turma em 0 e em 1', ficam && semConta >= tinham.length && z === 0 && um === 1, `sem a conta da turma (um save de antes): quem tinha posto ${ficam ? 'fica' : 'PERDEU'}, e os sem posto descem como antes (${semConta} dos ${M0} na mina); a turma em 0: ${z} na mina; em 1: ${um}`);
});

// ------------------------------ q5: o minério continua a sair ------------------------------
run('q5', () => {
  M.pronto(MUNDO); pega(); for (let t = 0; t < 30; t++) M.viver(1);
  const com = cidades().filter(s => (s.minaN || 0) >= 1 && mineiros(s).length >= 1); const vazias = com.filter(s => !mineiros(s).some(naMina));
  ok('q5 a mina com turma tem gente', com.length >= 1 && !vazias.length, `${MUNDO}, 30 s: ${cidades().length} cidades com mina de veio vivo, ${com.length} com turma dada pelo planejador e mineiros: ${com.map(s => `${s.name} ${mineiros(s).filter(naMina).length}/${s.minaN}`).join(', ')}${vazias.length ? '; SEM NINGUÉM NA MINA: ' + vazias.map(s => s.name).join(', ') : ''}`);
});

console.log(fails.length ? `PEDREIROS: FALHOU (${fails.join(', ')})` : `PEDREIROS: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
