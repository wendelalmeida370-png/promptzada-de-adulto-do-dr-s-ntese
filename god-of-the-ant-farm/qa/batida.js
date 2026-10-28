// batida: node qa/batida.js [mundo] — a batida de uma história escreve a frase dela no livro, e só isso (L-320); e uma cena que
// começa sem a sua história volta sem quebrar (L-321).
// A batida (G.Stories.beat) é uma frase do roteiro que a história conta num momento — a sentença lida, o chamado da família,
// a herança, a volta para casa: escolhe o texto da chave e o põe como capítulo. Com o L-215 (27/10), a vez de cada história no
// laço virou uma função com o mesmo nome — e no JavaScript, de duas declarações com o mesmo nome, a última vence: as 162
// batidas passaram a rodar a vez inteira da história, fora de hora, sem escrever a frase. Achado pela cena da praça do
// cadafalso, que quebrava ao começar («scene cd-praca TypeError», gerando o mundo pronto dos mil anos): a história do
// cadafalso, ao nascer, conta a sentença numa batida — que rodava a vez dela antes de ela entrar na lista, e a vez pedia a cena.
//  b1 a batida escreve o capítulo com a chave dela e não roda a vez da história
//  b2 o salto, ano a ano até três batidas (ou três anos): as batidas escrevem (capítulos de verdade) e nenhuma cena começa
//     para uma história fora da lista
//  b3 cada cena que lê a sua história, começada sem ela (com gente de verdade, e uma sentença na justiça para mostrar), volta
//     sem quebrar
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | batida ${name} | ${info}`); if (!c) fails.push(name); };
const S = M.pronto(process.argv[2] || 'metropole');
const St = G.Stories; const Sn = G.Scene;

// b1 — one beat, by hand, on a story of the world (a storylet of the test's own, so the words never depend on the cast)
{
  const all = St.state().stories; const s = all.find(x => x.st === 'ativa') || all[all.length - 1];
  if (!s) ok('b1 a batida escreve e não roda a vez da história', false, 'o mundo não tem história nenhuma');
  else {
    St.storylet('qa-batida', { text: [() => 'Uma frase da prova.'] });
    const d = St.DEF[s.type]; const t0 = d.tick; let ticks = 0; d.tick = function () { ticks++; return t0 ? t0.apply(this, arguments) : undefined; };
    const before = s.chapters.slice(); let r, err = null;
    try { r = St.beat(s, 'qa-batida'); } catch (e) { err = e; } finally { d.tick = t0; }
    const wrote = !!(r && r.k === 'qa-batida' && s.chapters.includes(r));
    ok('b1 a batida escreve e não roda a vez da história', !err && wrote && ticks === 0, `história #${s.id} (${s.type}): ${err ? 'quebrou: ' + err.message : (wrote ? 'escreveu «' + r.txt + '»' : 'não escreveu nada') + `; a vez da história rodou ${ticks} vez(es)`}`);
    s.chapters = before; delete St.BEATS['qa-batida'];
  }
}

// b2 — the skip, a year at a time until three beats (or three years): the beats the stories tell, and the scenes asked for
// stories that are not on the list
{
  const ob = St.beat; let calls = 0, wrote = 0; const keys = {};
  St.beat = function (story, key) { calls++; const r = ob.apply(this, arguments); if (r && r.txt) { wrote++; keys[key] = (keys[key] || 0) + 1; } return r; };
  const op = Sn.play; const absent = [];
  Sn.play = function (key, o) { if (o && o.story && !St.get(o.story)) absent.push(`${key} (história #${o.story}, ano ${G.S.day})`); return op.apply(this, arguments); };
  let years = 0; try { while (years < 3 && calls < 3) { M.saltar(1); years++; } } finally { St.beat = ob; Sn.play = op; }
  const top = Object.entries(keys).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k} ${n}`).join(', ');
  ok('b2 o salto: as batidas escrevem', calls > 0 && wrote > 0, `${years} ano(s): ${calls} batidas, ${wrote} com a frase no livro${top ? ' (' + top + ')' : ''}`);
  ok('b2 o salto: nenhuma cena sem a sua história', !absent.length, absent.length ? `${absent.length}: ${absent.slice(0, 3).join(' · ')}` : 'nenhuma');
}

// b3 — every scene that reads its story, begun without it (the helpers look through the justice's sentences: one to show)
{
  const people = [...S.villagers.values()].filter(v => v.age >= 16).sort((a, b) => a.id - b.id).slice(0, 8);
  const J = G.Justice; const jl = J.list; J.list = () => [{ id: -1, x: 0, y: 0, ids: [], done: [] }];
  const bad = [], seen = [];
  try {
    for (const [key, d] of Object.entries(Sn.defs)) {
      if (!d.gen || !/c\.story\(\)/.test(d.gen.toString())) continue;
      seen.push(key); const roles = {};
      const ctx = { story: () => null, v: r => (roles[r] || (roles[r] = people[Object.keys(roles).length % people.length])), take: () => true, data: {}, cast: {}, sc: { t: 0 } };
      const c = new Proxy(ctx, { get: (o, k) => (k in o ? o[k] : () => ({})) });
      let n = 0, res;
      try { const g = d.gen(c); let r = g.next(); for (; !r.done && n < 60; r = g.next(1)) n++; res = r.done ? r.value : '(não acabou)'; } catch (e) { bad.push(`${key}: ${e.message}`); continue; }
      if (res !== 'sem') bad.push(`${key}: voltou ${res}`);
    }
  } finally { J.list = jl; }
  ok('b3 cada cena sem a sua história volta sem quebrar', seen.length > 20 && !bad.length, `${seen.length} cenas leem a história; ${bad.length ? 'quebram ou seguem: ' + bad.join(' · ') : 'todas voltam «sem»'}`);
}

const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
