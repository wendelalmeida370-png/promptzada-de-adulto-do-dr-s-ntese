// coalizao: node qa/coalizao.js [mundo] — a guerra mundial do império tem dois lados de verdade (L-370).
// «Um império grande demais: os outros povos se uniram contra ele». A Grande Coalizão do mundo pronto «mundial» de 28/10
// era os quatro povos grandes — aliados e vassalos do império — contra Mileto, um povo de oito pessoas: nenhuma guerra
// mundial, e nenhuma batalha para o duelo de campeões. Aqui, num mundo pronto, com um povo pequeno fundado de propósito:
//  c1 todos os povos grandes amigos do império (aliados): só os vassalos ficam com ele, e os aliados vão para a coalizão
//  c2 todos os povos grandes vassalos do império, e só o povo pequeno contra ele: a guerra mundial do império não começa
//  c3 um povo grande sem laço com o império: a coalizão começa como sempre, com ele contra o império
//  e o verificador limpo (S0–S2 novos), sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | coalizao ${name} | ${info}`); if (!c) fails.push(name); };
const KEY = process.argv[2] || 'metropole';
const nm = id => (G.Fac.get(id) || {}).name || '#' + id;
// (the world, the empire — the strongest people — and a small people founded on purpose: six grown people of the weakest
// great people, free, in a town of their own)
const setup = () => {
  M.pronto(KEY); const S = G.S;
  const big = () => G.Fac.all().filter(f => f.alive && G.Fac.pop(f.id) >= 12);
  const top = big().sort((a, b) => G.Politics.strength(b.id) - G.Politics.strength(a.id) || a.id - b.id)[0];
  const from = big().filter(f => f !== top).sort((a, b) => G.Politics.strength(a.id) - G.Politics.strength(b.id) || a.id - b.id)[0];
  const vs = from ? [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === from.id && v.age >= 18 && v.age < 55 && !v.captive && !v.aboard && !v.jail && !v.ug && v.id !== from.leader && v.role !== 'guerreiro' && !(S.avatar && S.avatar.id === v.id)).sort((a, b) => a.id - b.id).slice(0, 6) : [];
  for (const v of vs) G.Vg.endTask(v);
  const small = vs.length === 6 ? G.War.foundFree(vs, null, 'revolta') : null;
  const others = big().filter(f => f !== top);
  return { S, top, small, others };
};
// (a bond of a people with the empire, by the test's hand: an alliance, or a vassal's oath)
const bind = (f, top, st) => { const r = G.Fac.rel(f.id, top.id); if (!r) return false; if (r.st === 'guerra' && G.War) G.War.onPeace(f, top); r.st = st; r.op = 60; if (st === 'vassalo') r.over = top.id; else delete r.over; return true; };
let base = null;
const fresh = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const sides = w => w ? w.blocs.map(b => b.map(nm).join(', ')).join(' contra ') : 'nenhuma';
// c1 — every great people a friend of the empire: only its vassals stand by it
{
  const { S, top, small, others } = setup(); base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const ally = others[0], vass = others.slice(1);
  const bound = small && ally && bind(ally, top, 'alianca') && vass.every(f => bind(f, top, 'vassalo'));
  const w = bound ? G.WorldWar.start('imperio') : null;
  const allyAgainst = !!w && w.blocs[1].includes(ally.id) && !w.blocs[0].includes(ally.id);
  ok('c1 todos os povos grandes amigos do império: os aliados vão para a coalizão', bound && !!w && allyAgainst && vass.every(f => w.blocs[0].includes(f.id)),
    !small ? 'o povo pequeno não foi fundado (nenhum lugar livre)' : !bound ? 'sem relação entre os povos grandes e o império' : `o império ${top.name}; ${ally.name} aliado, ${vass.length} vassalo(s); ${small.name} (${G.Fac.pop(small.id)} pessoas): ${w ? w.name + ' — ' + sides(w) : 'NENHUMA guerra mundial'}`);
  const nv = fresh(); if (nv.length) ok('c1 verificador', false, nv.slice(0, 3).join(' · '));
}
// c2 — every great people the empire's vassal, and only the small people against it: no world war of the empire
{
  const { S, top, small, others } = setup(); base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const bound = small && others.length && others.every(f => bind(f, top, 'vassalo'));
  const w = bound ? G.WorldWar.start('imperio') : null;
  ok('c2 só um povo pequeno contra o império e seus vassalos: a guerra mundial não começa', bound && !w && !G.WorldWar.active(),
    !small ? 'o povo pequeno não foi fundado (nenhum lugar livre)' : !bound ? 'sem relação entre os povos grandes e o império' : `o império ${top.name} com ${others.length} vassalo(s) grande(s); contra ele só ${small.name} (${G.Fac.pop(small.id)} pessoas): ${w ? 'COMEÇOU ' + w.name + ' — ' + sides(w) : 'nenhuma guerra mundial'}`);
  const nv = fresh(); if (nv.length) ok('c2 verificador', false, nv.slice(0, 3).join(' · '));
}
// c3 — one great people with no bond to the empire: the coalition, as always, with it against the empire
{
  const { S, top, small, others } = setup(); base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const free = others[0], vass = others.slice(1);
  const r = free && G.Fac.rel(free.id, top.id); if (r && r.st !== 'guerra') { r.st = 'paz'; r.op = -10; delete r.over; }
  const bound = !!r && vass.every(f => bind(f, top, 'vassalo'));
  const w = bound ? G.WorldWar.start('imperio') : null;
  ok('c3 um povo grande sem laço com o império: a coalizão começa, com ele contra o império', bound && !!w && w.blocs[1].includes(free.id) && vass.every(f => w.blocs[0].includes(f.id)),
    !bound ? 'sem relação entre os povos grandes e o império' : `o império ${top.name} com ${vass.length} vassalo(s); ${free.name} sem laço: ${w ? w.name + ' — ' + sides(w) : 'NENHUMA guerra mundial'}`);
  const nv = fresh(); if (nv.length) ok('c3 verificador', false, nv.slice(0, 3).join(' · '));
}
const er = M.erros(); const mods = Object.keys(er.mod);
ok('erros', !mods.length && !er.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${er.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
