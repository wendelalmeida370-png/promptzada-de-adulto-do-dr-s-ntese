// corpo-fera: node qa/corpo-fera.js [mundo] — a morte do corpo encarnado por uma fera (L-698). O mundo conta a morte na crônica
// com a fera dela («foi devorada por um rinoceronte aos 35 anos», Village.kill); o corpo põe nessa mesma linha o fim do deus
// («— com o deus vivendo em seu corpo», Possess.record), procurando-a pelo texto da morte. O texto procurado era o do registro dos
// mortos (S.dead), que não guarda a fera: «uma fera». Não achava a linha do mundo e escrevia outra — a crônica ficava com duas
// linhas para uma morte, com duas feras (a Izel da e19 na reg19). No mundo pronto «cidade»:
// f1 um adulto tomado pelo deus (Possess.take) e morto por um rinoceronte: uma linha só da morte na crônica, a do mundo, com a fera
//    e o fim do deus;
// f2 o mesmo com uma fera que ninguém viu (sem lastBeast: «uma fera»): uma linha só, com o fim do deus;
// e o verificador limpo (S0–S2), sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js'] });
M.pronto(process.argv[2] || 'cidade');
const S = G.S; const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-fera ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const bad = () => QA.check().filter(q => q.sev <= 2).map(q => `[S${q.sev}] ${q.msg}`);
const base = new Set(bad());
// (a grown-up out of doors the god can take, by id — never by name)
const pick = (not) => [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.inside && !not.includes(o.id) && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
// (the body taken and killed by a beast; the lines of its death in the chronicle since)
function dies(v, beast) {
  const h0 = S.history.length; const took = G.Possess.take(v);
  if (!took || took.ok === false) return { took: false, why: took && took.why };
  v.lastBeast = beast; god(() => G.Village.kill(v, 'beast'));
  const lines = S.history.slice(h0).filter(e => e.txt.includes(v.name) && /devorad/.test(e.txt)).map(e => e.txt);
  return { took: true, avatar: !!S.avatar, dead: !S.villagers.has(v.id), lines };
}
const end = /— com o deus vivendo em seu corpo\.$/;
const used = [];
{ // f1: a named beast
  const v = pick(used); if (v) used.push(v.id);
  const r = v ? dies(v, 'rhino') : null;
  ok('f1 morto por um rinoceronte com o deus no corpo: uma linha só, a do mundo, com a fera e o fim do deus', !!r && r.took && r.dead && !r.avatar && r.lines.length === 1 && /rinoceronte/.test(r.lines[0]) && end.test(r.lines[0]),
    !v ? 'ninguém para tomar' : !r.took ? `não tomou ${v.name}: ${r.why}` : `${v.name} #${v.id}: ${r.lines.length} linha(s) — ${r.lines.map(t => `«${t}»`).join(' · ') || 'nenhuma'}`);
}
{ // f2: a beast nobody saw
  const v = pick(used); if (v) used.push(v.id);
  const r = v ? dies(v, undefined) : null;
  ok('f2 morto por uma fera sem nome com o deus no corpo: uma linha só, com o fim do deus', !!r && r.took && r.dead && !r.avatar && r.lines.length === 1 && /uma fera/.test(r.lines[0]) && end.test(r.lines[0]),
    !v ? 'ninguém para tomar' : !r.took ? `não tomou ${v.name}: ${r.why}` : `${v.name} #${v.id}: ${r.lines.length} linha(s) — ${r.lines.map(t => `«${t}»`).join(' · ') || 'nenhuma'}`);
}
M.viver(0.1); const b = bad().filter(q => !base.has(q)), me = Object.keys(G.modErr || {});
ok('verificador', b.length === 0 && !me.length, `${b.length ? b.slice(0, 4).join(' | ') : 'limpo (S0–S2)'}; erro de módulo: ${me.length ? JSON.stringify(G.modErr) : 'nenhum'}`);
console.log(fails.length ? `FALHARAM: ${fails.join(', ')}` : 'tudo passou');
process.exitCode = fails.length ? 1 : 0;
