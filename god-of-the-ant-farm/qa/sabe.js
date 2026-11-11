// sabe: a tela que respeita o que o personagem sabe (Bairros Vivos, BV-6; D-170 a D-172).   [ONLY=b1,p2] node qa/sabe.js [mundo]
// A tela do corpo era onisciente: dizia o nome de qualquer bairro, de qualquer pessoa e as moedas de qualquer casa. Agora
// pergunta a uma porta só, G.Possess.knows (só leitura), que responde pelo que a pessoa vivida poderia saber — a vida que o
// mundo já guarda (a família, a casa, o ofício, a rua, a biografia, o que os povos sabem uns dos outros) mais um registro
// pequeno do que ela viveu nas mãos do deus (v.ken: quem conheceu de frente, os bairros onde os pés estiveram), escrito só
// pelo possess.js, dentro do passo do mundo. Em Node, com o possess.js, o interact.js (os cartões) e o diario-ui.js.
// O bairro (na maior cidade de bairros do mundo pronto):
//  b1 num bairro que o personagem não conhece, a linha do lugar é o que se vê («ruas de oficinas…»), sem o nome; dois
//     bairros de vocação diferente dão descrições diferentes; a verdade do mundo (Possess.where) continua lá, para o deus;
//  b2 no mesmo dia continua a descrição; no dia seguinte («esteve lá») a linha diz o nome;
//  b3 noutro bairro desconhecido, uma conversa com quem mora lá diz o nome na hora; com quem não é de lá, não;
//  b4 o bairro onde mora, o onde trabalha, o coração antigo e os da família: pelo nome; e o bairro onde morou continua
//     sabido depois que a casa muda (o registro);
//  b5 o que se vê vem da vida do bairro: depois de dias de fornadas (G.Urban.note, a porta do mundo) o bairro ganha o perfil
//     «de oficinas», e quem não sabe o nome dele lê «…cheiro de forno»;
//  b6 duas cidades coladas: num bairro de uma, mais perto do meio da outra, a linha diz a cidade do chão (L-761);
// A vila de um bairro só e os povos que nunca se viram (um mundo novo, pequeno):
//  v1 quem mora no povoado sabe o nome dele; um forasteiro de um povo que nunca encontrou este vê «um acampamento…», sem
//     o nome — e, de um estranho de lá, «um(a) … estrangeiro(a)»; depois de falar com alguém do lugar, sabe o nome;
//  v2 as notícias: a de um povoado que o personagem não sabe nomear não chega aos ouvidos; a do seu povoado e a sem lugar, sim;
//     e perguntar não cria a relação entre dois povos que nunca se viram;
//  v3 na vila do mundo pronto (rank até 2) com campos de nome: todo morador sabe os campos e todos se conhecem; quem é de
//     uma cidade do mesmo povo não sabe o nome dos campos de lá;
// A pessoa:
//  p1 o estranho não tem nome: no letreiro, na conversa («Conversar com o mineiro»), no «está dormindo», na ficha (o que
//     se vê: o ofício pela roupa, a idade) — e o nome dele não aparece em nenhum desses textos;
//  p2 depois de uma conversa (G.Possess.meet no passo do mundo, o que a conversa faz) → o nome; os dois se lembram; a
//     ficha de quem acabou de dizer quem é tem o nome e o ofício, mas não as memórias nem a família que o corpo não conhece;
//  p3 depois de uma compra na banca (G.Act.perform, a porta do mundo) → o nome de quem vende;
//  p4 a família e a casa, sempre e inteiras (as memórias na ficha); a rua, o ofício, quem governa, pelo nome;
//  p5 a pessoa conhecida morre: o nome continua sabido, nada quebra;
//  p6 a oferta do mundo que diz o nome de alguém («Servir …») o troca pelo que se vê, quando o corpo não o conhece;
//  p7 a história que outro tece em volta de alguém (o alvo de uma vingança) não aparece no «Quem sou eu» dele nem na ficha
//     dele lida pela família; o deus a lê;
// A casa:
//  c1 as moedas e quem está em casa agora: só da própria casa; as da casa alheia em nenhum texto (o cartão dela, a ficha do
//     dono, o diário, a linha do lugar); o estoque só do armazém do próprio povo;
// O deus e a troca:
//  g1 sem ninguém (o Modo Deus) todas as portas respondem tudo, e os cartões do deus são os de antes (a ficha inteira, as
//     moedas, todos os nomes);
//  t1 trocar de corpo troca o que se sabe; e o que cada um viveu fica com ele (voltando ao primeiro, ele ainda conhece);
// O save:
//  s1 save/load no meio: o corpo volta, e as respostas da porta são as mesmas (o registro foi no save, com a pessoa);
//  s2 um save com o registro danificado é consertado ao abrir (nada inválido para o verificador, nenhum erro);
//  s3 um save antigo (qa/oldsave_7.json, sem registro nenhum) abre, e a porta responde;
// O mundo:
//  w1 as telas não escrevem: o mesmo mundo com e sem «quadros» (todas as portas de leitura, os cartões, o diário, e um
//     G.Possess.meet pedido de fora do passo) entre os passos é idêntico — o estado canônico, o acaso, as relações dos povos;
//  x1 os casos ruins: o bairro conhecido some, o deus tira a casa do corpo, o corpo morre — nada quebra, e o verificador
//     (com as regras «sabe») fica limpo; e nenhum erro de módulo nem de console.
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'js/interact.js', 'js/diario-ui.js', 'qa/sabe-inv.js'] });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = (...ks) => !ONLY || ks.some(k => ONLY.includes(k));
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | sabe ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const Po = G.Possess, K = Po.knows, U = G.Urban, I = G.Interact, V = G.Village, W = G.W, D = G.Depot, A = G.Act, DU = G.DiarioUI;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = null, base = new Set();
const qk = q => q.sys + '|' + q.msg.replace(/#\d+/g, '#');
const open = w => { S = typeof w === 'string' ? M.pronto(w) : w(); M.viver(1); base = new Set(QA.check().filter(q => q.sev <= 2).map(qk)); return S; };
// (the verifier: nothing new of S0–S2, and nothing at all of the rules of what one knows)
const novas = () => QA.check().filter(q => (q.sev <= 2 && !base.has(qk(q))) || q.sys === 'sabe').map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const fp = () => { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + JSON.stringify(S.rng); };
const pop = s => V.pop(s.id);
const byId = (a, b) => a.id - b.id;
const people = f => [...S.villagers.values()].filter(f).sort(byId);
const grown = v => v.age >= 18 && v.age < 60 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air;
const homeOf = v => (v.home ? S.buildings.get(v.home) : null);
const qOf = b => (b ? U.at(b.x + (b.w || 1) / 2, b.y + (b.h || 1) / 2) : null);
// the biggest city of quarters of the world, and its quarters with ground
const city = () => [...S.settlements.values()].filter(s => (s.tier || 0) >= 3 && U.districtsOf(s).length >= 3).sort((a, b) => pop(b) - pop(a) || a.id - b.id)[0] || null;
// a tile of a quarter where the body can stand
function spotIn(q) {
  for (const c of q.cells) { const [cx, cy] = U.cellXY(c); for (let dy = 0; dy < U.C; dy++) for (let dx = 0; dx < U.C; dx++) { const x = cx + dx + 0.5, y = cy + dy + 0.5; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)] && U.at(x, y) === q) return [x, y]; } }
  return null;
}
// the body taken (by the game's door), and put somewhere by the test's hand; a step of the world after each
const take = v => { const r = Po.take(v); M.viver(0.1); return r && r.ok !== false && Po.is(v); };
const put = (v, p) => { god(() => { v.x = p[0]; v.y = p[1]; v.inside = 0; v.sleeping = false; v.hunger = 5; v.energy = 100; }); M.viver(0.1); };
// a meeting, as the talk of the body makes it: asked by the hands, done by the world in its step
const meet = id => { const it = Po.apply(() => ({ ok: true, first: Po.meet(id) })); M.viver(0.1); return it.res; };
const prov = id => I.list.find(p => p.id === id);
// someone of a city the body can be, living there with a home
const bodies = set => people(v => v.set === set.id && grown(v) && homeOf(v) && Po.can(v).ok);
const errs = () => { const e = M.erros(); return Object.keys(e.mod).length || e.console.length ? `erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 3).join(' | ')}` : ''; };

// ================================================================ the quarter
if (on('b1', 'b2', 'b3', 'b4', 'b5', 'b6')) {
  open(WORLD); const set = city();
  if (!set) for (const k of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']) ok(k, false, `nenhuma cidade de bairros em ${WORLD}`);
  else {
    const qs = U.districtsOf(set);
    // (someone with three quarters of their city they cannot name: two of different vocations, and a third with someone of it)
    const localOf = (q, not) => people(o => o.id !== not && o.set === set.id && grown(o) && (qOf(homeOf(o)) === q || qOf(o.job ? S.buildings.get(o.job) : null) === q))[0] || null;
    let v = null, q1 = null, q2 = null, q3 = null;
    for (const o of bodies(set)) {
      const u = qs.filter(q => !K.district(o, q) && spotIn(q)); const c3 = u.find(q => localOf(q, o.id)); const rest = u.filter(q => q !== c3);
      const c2 = rest.length ? rest.find(q => q.k !== rest[0].k) : null; if (c3 && c2) { v = o; q1 = rest[0]; q2 = c2; q3 = c3; break; }
    }
    if (!v) for (const k of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']) ok(k, false, `em ${set.name}, ninguém com três bairros desconhecidos (${qs.length} bairros)`);
    else {
      const tk = take(v);
      // ---------------- b1
      put(v, spotIn(q1)); const w1 = K.where(v); const truth = Po.where(v);
      put(v, spotIn(q2)); const w2 = K.where(v);
      if (on('b1')) ok('b1 no bairro desconhecido, o que se vê, sem o nome', tk && !!w1 && !w1.district && !w1.txt.includes(q1.name) && w1.seen.length > 5 && w1.txt.toLowerCase().startsWith(w1.seen.toLowerCase()) && w1.txt.endsWith('— ' + set.name) && w1.knows.district === '' && truth.district === q1.name
        && !w2.txt.includes(q2.name) && w2.seen !== w1.seen,
        `${v.name}, de ${set.name}: em ${q1.name} [${q1.k}] a tela diz «${w1.txt}» (o mundo: «${truth.district}»); em ${q2.name} [${q2.k}], «${w2.txt}»`);
      // ---------------- b2
      if (on('b2')) {
        put(v, spotIn(q1)); M.viver(3); const same = K.where(v);
        // (the day turned by the world's own clock, the test's hand on the hour: the last moments of the night)
        const d0 = S.day; S.time = 0.985; for (let k = 0; k < 400 && S.day === d0; k++) M.viver(0.5);
        god(() => { v.hunger = 5; v.energy = 100; v.sleeping = false; }); M.viver(0.1);
        const next = Po.is(v) ? K.where(v) : null;
        ok('b2 no mesmo dia a descrição; no dia seguinte, o nome', !same.district && !same.txt.includes(q1.name) && S.day === d0 + 1 && !!next && next.district === q1.name && next.txt === `${q1.name}, ${set.name}` && next.knows.district === 'esteve',
          `${v.name} em ${q1.name}: no dia ${d0} «${same.txt}»; no dia ${S.day} ${next ? `«${next.txt}» (${next.knows.district})` : 'o corpo não é mais do deus'}`);
      }
      // ---------------- b3
      if (on('b3')) {
        if (!Po.is(v)) take(v);
        put(v, spotIn(q3)); const before = K.where(v);
        // (someone who does not know this quarter says nothing of it; someone who lives or works in it names it)
        const out = people(o => o.id !== v.id && !K.district(o, q3) && grown(o))[0];
        const loc = localOf(q3, v.id);
        const r0 = out ? meet(out.id) : null; const mid = K.where(v);
        const r1 = loc ? meet(loc.id) : null; const after = K.where(v);
        ok('b3 quem é do bairro diz o nome; quem não é, não', !before.district && !!out && !!r0 && !mid.district && !mid.txt.includes(q3.name) && !!loc && !!r1 && after.district === q3.name && after.knows.district === 'contaram',
          `${v.name} em ${q3.name} [${q3.k}]: «${before.txt}»; depois de falar com ${out ? out.name + ' (de fora)' : 'ninguém de fora'}: «${mid.txt}»; com ${loc ? loc.name + ' (de lá)' : 'NINGUÉM de lá'}: «${after.txt}» (${after.knows.district})`);
      }
      // ---------------- b4
      if (on('b4')) {
        // (the one whose house is asked after: someone who lives out of the old heart, lived by the god a moment)
        const m = bodies(set).find(o => { const h = qOf(homeOf(o)); return h && !h.whole && h.k !== 'centro'; }) || v; take(m);
        const hq = qOf(homeOf(m)); const why = {}; let bad = '';
        for (const o of bodies(set)) {
          const h = qOf(homeOf(o)), j = qOf(o.job ? S.buildings.get(o.job) : null);
          if (h && !h.whole) { const r = K.district(o, h); why[r] = (why[r] || 0) + 1; if (r !== 'mora') bad = bad || `${o.name} não sabe o bairro onde mora (${h.name}: «${r}»)`; }
          if (j && !j.whole && j !== h) { const r = K.district(o, j); why[r] = (why[r] || 0) + 1; if (r !== 'trabalha') bad = bad || `${o.name} não sabe o bairro onde trabalha (${j.name}: «${r}»)`; }
          for (const q of qs) if (q.k === 'centro' && q !== h && q !== j && K.district(o, q) !== 'centro') bad = bad || `${o.name} não sabe o coração da cidade (${q.name})`;
          for (const id of [o.mother, o.father, o.partner].concat(o.kids || [])) { const p = id && S.villagers.get(id); const pq = p && p.set === set.id ? qOf(homeOf(p)) : null; if (pq && !pq.whole && !K.district(o, pq)) bad = bad || `${o.name} não sabe o bairro da família (${pq.name})`; }
        }
        // (where one lived stays known: the record keeps it, told — asked with no home, no work and no family there)
        const rec = m.ken && hq && !hq.whole ? m.ken.q.find(e => e[0] === hq.id) : null;
        const lone = hq && !hq.whole ? K.district({ id: m.id, set: m.set, home: 0, job: 0, kids: [], ken: m.ken, bio: [] }, hq) : '';
        ok('b4 onde mora, onde trabalha, o coração, os da família; e onde morou', !bad && !!hq && !hq.whole && !!rec && rec[2] === 1 && (hq.k === 'centro' || lone === 'contaram'),
          bad || `${bodies(set).length} moradores de ${set.name}: ${JSON.stringify(why)}; ${m.name} mora em ${hq && !hq.whole ? hq.name : 'chão sem bairro'}: no registro ${JSON.stringify(rec)}, e sem a casa, o ofício e a família ainda o sabe («${lone}»)`);
      }
      // ---------------- b5
      if (on('b5')) {
        // (what is seen follows what happens: batches out of the kilns of q2, day after day, by the world's own door — the
        // quarter earns its profile, and the line of someone who cannot name it says it)
        const o5 = bodies(set).find(o => !K.district(o, q2)) || v; take(o5); put(o5, spotIn(q2)); const s0 = K.seen(q2, o5.x, o5.y); let days = 0;
        for (; days < 14 && !U.is(q2, 'oficinas'); days++) {
          god(() => { for (const c of q2.cells) { const [cx, cy] = U.cellXY(c); U.note(cx + 1, cy + 1, 'oficio', 3); } });
          const d0 = S.day; S.time = 0.985; for (let k = 0; k < 400 && S.day === d0; k++) M.viver(0.5); M.viver(3);
        }
        // (a body that was not there on any of those days: someone else of the city who cannot name the quarter)
        const o6 = bodies(set).find(o => o.id !== o5.id && !K.district(o, q2)); if (o6) { take(o6); put(o6, spotIn(q2)); }
        const w5 = o6 ? K.where(o6) : null;
        ok('b5 o que se vê vem da vida do bairro', U.is(q2, 'oficinas') && !!w5 && !w5.district && /cheiro de forno/.test(w5.txt) && !/cheiro de forno/.test(s0) && !w5.txt.includes(q2.name),
          `${q2.name} [${q2.k}]: antes «${s0}»; depois de ${days} dias de fornadas (perfil: ${U.profile(q2) || 'nenhum'}), para ${o6 ? o6.name : 'ninguém'}: «${w5 ? w5.txt : '-'}»`);
      }
      // ---------------- b6
      if (on('b6')) {
        // (two towns side by side: a spot on a quarter of one, nearer the middle of the other — the line says the town whose
        // ground it is. The line said «Bairro dos Guerreiros-Águia, Birka», of a quarter of Tenochtitlan: L-761)
        let hit = null;
        for (const s of [...S.settlements.values()].sort(byId)) { for (const d of U.districtsOf(s)) { const p = spotIn(d); if (!p) continue; let nb = null, nd = 1e9; for (const o of S.settlements.values()) { const dd = G.dist(o.cx, o.cy, p[0], p[1]); if (dd < nd) { nd = dd; nb = o; } } if (nb && nb.id !== s.id) { hit = { s, d, p, nb }; break; } } if (hit) break; }
        if (!hit) ok('b6 duas cidades coladas: a linha diz a cidade do chão', true, `em ${WORLD} nenhum bairro fica mais perto do meio de outra cidade (nada a provar)`);
        else {
          const o7 = people(o => o.set === hit.s.id && grown(o) && homeOf(o) && Po.can(o).ok)[0]; const tk7 = o7 ? take(o7) : false; if (o7) put(o7, hit.p);
          const w7 = o7 ? K.where(o7) : null, t7 = o7 ? Po.where(o7) : null;
          ok('b6 duas cidades coladas: a linha diz a cidade do chão', tk7 && !!w7 && w7.town === hit.s.name && !w7.txt.includes(hit.nb.name) && (w7.txt.endsWith(', ' + hit.s.name) || w7.txt.endsWith('— ' + hit.s.name)),
            o7 ? `${o7.name} em ${hit.d.name}, de ${hit.s.name}, mais perto do meio de ${hit.nb.name} (o mais perto, para o mundo: ${t7.near}): a tela diz «${w7.txt}»` : `ninguém de ${hit.s.name} para viver`);
        }
      }
      const nv = novas(), e = errs(); ok('b verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
    }
  }
}

// ================================================================ the small town, and peoples that never met
if (on('v1', 'v2')) {
  open(() => { const s = M.novo({ seed: 77, type: 'arquipelago', size: 96, tribes: 3 }); M.viver(30); return s; });
  const sets = [...S.settlements.values()].sort(byId); const A0 = sets[0];
  const unmet = (a, b) => { const F = G.Fac.get(a); const r = F && F.rel ? F.rel[b] : null; return !(r && r.met); };
  const B0 = sets.find(s => s.fac !== A0.fac && unmet(A0.fac, s.fac));
  const loc = people(v => v.set === A0.id && grown(v))[0]; const far = B0 ? people(v => v.set === B0.id && grown(v) && Po.can(v).ok)[0] : null;
  if (!B0 || !loc || !far) { ok('v1', false, `o mundo novo não tem dois povos que nunca se viram (${sets.length} povoados)`); ok('v2', false, 'idem'); }
  else {
    if (on('v1')) {
      const mine = K.town(loc, A0), dist = K.district(loc, { whole: 1, set: A0.id });
      const tk = take(far); put(far, [A0.cx + 0.5, A0.cy + 1.5]); const w0 = K.where(far);
      const someone = people(o => o.set === A0.id && o.age >= 16 && o.id !== far.id)[0]; const lk = K.name(far, someone), card0 = I.personCard(someone, far);
      const r = meet(loc.id); const w1 = K.where(far);
      ok('v1 a vila de um bairro só: quem mora sabe; o forasteiro vê, e pergunta', mine === 'mora' && dist === 'mora' && tk && !w0.txt.includes(A0.name) && /^Um acampamento|^Uma aldeia|^Uma vila/.test(w0.txt) && w0.knows.town === ''
        && /estrangeir[oa]$/.test(lk) && !lk.includes(someone.name) && !JSON.stringify(card0).includes(someone.name) && !!r && w1.txt === A0.name && w1.knows.town === 'contaram',
        `${loc.name} de ${A0.name} (rank ${A0.tier || 0}): «${mine}»; ${far.name}, de ${B0.name} (os dois povos nunca se viram), posto em ${A0.name}: «${w0.txt}»; ${someone.name} é para ele «${lk}»; depois de falar com ${loc.name}: «${w1.txt}» (${w1.knows.town})`);
    }
    if (on('v2')) {
      // (the chronicle's lines: of the other people's town, of one's own, of no place — and asking makes no record of a
      // relation between two peoples that never met: G.Fac.rel would)
      const rels = () => { let n = 0; for (const f of S.factions.values()) n += Object.keys(f.rel || {}).length; return n; }; const r0 = rels();
      const there = { txt: 'algo em ' + B0.name, x: B0.cx, y: B0.cy }, here = { txt: 'algo em ' + A0.name, x: A0.cx, y: A0.cy }, nowhere = { txt: 'algo no mundo' };
      const h = [K.hears(loc, there), K.hears(loc, here), K.hears(loc, nowhere), K.hears(null, there)];
      for (const s of sets) for (const o of people(x => x.age >= 16).slice(0, 12)) { K.town(o, s); K.looks(people(x => x.set === s.id)[0] || o, o); }
      ok('v2 as notícias: só de onde o personagem poderia ter ouvido', h[0] === false && h[1] === true && h[2] === true && h[3] === true && rels() === r0, `${loc.name} de ${A0.name}: de ${B0.name} (povo nunca visto) ${h[0] ? 'OUVE' : 'não ouve'}; do seu povoado ${h[1] ? 'ouve' : 'NÃO ouve'}; sem lugar ${h[2] ? 'ouve' : 'NÃO ouve'}; o deus ${h[3] ? 'ouve' : 'NÃO ouve'}; relações entre povos criadas pelas perguntas: ${rels() - r0}`);
    }
    const nv = novas(), e = errs(); ok('v verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
  }
}

// ================================================================ the small town with named fields (the vila of the ready world)
if (on('v3')) {
  open(WORLD);
  const vila = [...S.settlements.values()].filter(s => (s.tier || 0) <= K.SMALL && U.districtsOf(s).length >= 1 && pop(s) >= 6).sort((a, b) => pop(b) - pop(a) || a.id - b.id)[0];
  if (!vila) ok('v3 na vila todos sabem os campos e uns aos outros', false, `nenhuma vila com um bairro de nome em ${WORLD}`);
  else {
    const folk = people(v => v.set === vila.id && v.age >= 16 && !v.captive); const qs = U.districtsOf(vila); let badQ = 0, badP = 0, pairs = 0; const why = {};
    for (const a of folk) { for (const q of qs) if (!K.district(a, q)) badQ++; for (const b of folk) if (a !== b) { pairs++; const h = K.how(a, b); why[h.why] = (why[h.why] || 0) + 1; if (!h.n) badP++; } }
    // (and someone of a city of the same people cannot name the vila's fields, nor its people)
    const out = people(v => v.set !== vila.id && grown(v) && G.Fac.idOfV(v) === vila.fac && (S.settlements.get(v.set).tier || 0) >= 3)[0];
    const oq = out ? qs.filter(q => K.district(out, q)).length : -1, op = out ? folk.filter(b => K.person(out, b)).length : -1;
    ok('v3 na vila todos sabem os campos e uns aos outros', folk.length >= 4 && !badQ && !badP && (!out || (oq === 0 && op < folk.length)),
      `${vila.name} (rank ${vila.tier || 0}, ${folk.length} adultos, ${qs.map(q => q.name).join(', ')}): ${badQ} que não sabem os campos, ${badP} de ${pairs} pares que não se conhecem ${JSON.stringify(why)}; ${out ? `${out.name}, de ${S.settlements.get(out.set).name} (mesmo povo): sabe ${oq} dos ${qs.length} campos e conhece ${op} dos ${folk.length}` : 'ninguém de uma cidade do mesmo povo'}`);
  }
}

// ================================================================ the person
if (on('p1', 'p2', 'p3', 'p4', 'p5', 'p6')) {
  open(WORLD); const set = city();
  const cand = set ? bodies(set) : []; let v = null, st = null;
  // (a body and a stranger to it, asleep — the world opens in the night —, of the same city)
  for (const o of cand) { const s2 = people(x => x.set === set.id && x.age >= 18 && x.sleeping && !K.person(o, x) && !K.person(x, o))[0]; if (s2) { v = o; st = s2; break; } }
  if (!v) ok('p', false, `em ${set ? set.name : WORLD}, nenhum par de estranhos`);
  else {
    const tk = take(v); const P = prov('pessoa');
    // ---------------- p1
    const lbl0 = P.label({ v }, { o: st }), can0 = P.can({ v }, { o: st }), nm0 = K.name(v, st), card0 = I.personCard(st, v);
    const texts0 = [lbl0, can0.why || '', nm0, JSON.stringify(card0)];
    if (on('p1')) ok('p1 o estranho não tem nome: no letreiro, na conversa, na ficha', tk && K.person(v, st) === 0 && texts0.every(t => !t.includes(st.name)) && lbl0 === `Conversar com ${K.looks(st, v).o}` && /está dormindo\.$/.test(can0.why || '') && card0.knows === 0 && !card0.bio.length && !card0.parents.length && !card0.set && nm0 === G.cap(K.looks(st, v).um),
      `${v.name} diante de ${st.name}: letreiro «${nm0}», «${lbl0}», «${can0.why}», ficha «${card0.name} · ${card0.sub} · ${card0.doing}»`);
    // ---------------- p2
    if (on('p2')) {
      const told = I.personCard(st, v, true); const r = meet(st.id);
      const lbl1 = P.label({ v }, { o: st }), card1 = I.personCard(st, v), how = K.how(v, st), back = K.how(st, v);
      const fam = [st.mother, st.father, st.partner].concat(st.kids || []).map(id => id && G.person(id)).filter(Boolean).filter(p => !K.person(v, p));
      ok('p2 depois da conversa, o nome; os dois se lembram; a ficha não conta a vida', !!r && r.first === true && how.n === 1 && how.why === 'encontro' && back.n === 1 && lbl1 === `Conversar com ${st.name}` && K.name(v, st) === st.name
        && told.name.startsWith(st.name) && told.knows === 1 && !told.bio.length && !told.traits.length && !told.from && card1.why === 'de conversa' && fam.every(p => !JSON.stringify(card1).includes(p.name)) && v.ken.p.includes(st.id) && st.ken.p.includes(v.id),
        `${v.name} e ${st.name}: «${lbl1}», ficha «${card1.name} · ${card1.sub}», «${card1.why}»; memórias na ficha ${told.bio.length}, parentes dela que ${v.name} não conhece e a ficha não diz: ${fam.length}; ${st.name} também o conhece (${back.why})`);
    }
    // ---------------- p4
    if (on('p4')) {
      const kin = people(o => o.id !== v.id && Po.kin(v, o)), house = people(o => o.id !== v.id && o.home === v.home);
      const F = G.Fac.ofV(v); const ruler = F && F.leader ? S.villagers.get(F.leader) : null;
      const near = people(o => o.id !== v.id && o.set === v.set && homeOf(o) && o.home !== v.home && !Po.kin(v, o) && G.dist(homeOf(o).x + homeOf(o).w / 2, homeOf(o).y + homeOf(o).h / 2, homeOf(v).x + homeOf(v).w / 2, homeOf(v).y + homeOf(v).h / 2) <= K.NEAR);
      const work = people(o => o.id !== v.id && v.job && o.job === v.job && !Po.kin(v, o) && o.home !== v.home);
      const k1 = kin[0]; const cardK = k1 ? I.personCard(k1, v) : null;
      const okKin = kin.every(o => K.person(v, o) === 2) && house.every(o => K.person(v, o) === 2);
      const okNear = near.every(o => K.person(v, o) >= 1) && work.every(o => K.person(v, o) >= 1) && (!ruler || K.person(v, ruler) >= 1);
      ok('p4 a família e a casa, inteiras; a rua, o ofício e quem governa, pelo nome', (kin.length + house.length) > 0 && okKin && okNear && (!cardK || (cardK.knows === 2 && cardK.name.startsWith(k1.name) && cardK.bio.length === Math.min(6, G.Life.bioList(k1).length) && cardK.why === '')),
        `${v.name}: ${kin.length} parentes e ${house.length} da casa (todos inteiros: ${okKin}); ${near.length} vizinhos, ${work.length} do mesmo ofício${ruler ? ', governante ' + ruler.name + ' («' + K.how(v, ruler).why + '»)' : ''} (todos pelo nome: ${okNear})${k1 ? `; a ficha de ${k1.name} com ${cardK.bio.length} memórias` : ''}`);
    }
    // ---------------- p6
    if (on('p6')) {
      const st2 = people(x => x.set === set.id && x.age >= 18 && x.id !== st.id && !K.person(v, x))[0]; const kn = people(o => o.id !== v.id && K.person(v, o) >= 1)[0];
      const o1 = st2 ? { cust: st2.id, label: `Servir ${st2.name} (bebida)`, why: `${st2.name} não quer mais nada.` } : null, o2 = kn ? { cust: kn.id, label: `Servir ${kn.name} (bebida)` } : null;
      const s1 = o1 ? I.said(v, o1, o1.label) : '', s1w = o1 ? I.said(v, o1, o1.why) : '', s2 = o2 ? I.said(v, o2, o2.label) : '';
      // (and the words join as the language joins them: «a o ferreiro» is «ao ferreiro», «de a ferreira», «da ferreira»)
      const L2 = st2 ? K.looks(st2, v) : null, f2 = st2 && st2.g === 'f';
      const s3 = st2 ? I.said(v, { to: st2.id }, `Dar o bebê a ${st2.name}`) : '', s4 = st2 ? I.said(v, { cust: st2.id }, `Levar à banca de ${st2.name}`) : '';
      ok('p6 a oferta que diz o nome de um estranho diz o que se vê', !!o1 && !!o2 && s1 === `Servir ${L2.o} (bebida)` && s1w === `${G.cap(L2.o)} não quer mais nada.` && s2 === o2.label && s3 === `Dar o bebê ${f2 ? 'à' : 'ao'} ${L2.w}` && s4 === `Levar à banca ${f2 ? 'da' : 'do'} ${L2.w}`,
        `«${o1 ? o1.label : '-'}» → «${s1}»; «${o1 ? o1.why : '-'}» → «${s1w}»; «Dar o bebê a …» → «${s3}»; «…banca de …» → «${s4}»; de um conhecido fica «${s2}»`);
    }
    // ---------------- p3
    if (on('p3')) {
      // (a stall open with its merchant at the counter, by day; a body that does not know the merchant, with coins at home)
      Po.release('deus'); let z = null, m = null, b3 = null, why = 'nenhuma banca aberta com o mercador no balcão';
      for (let k = 0; k < 6 && !b3; k++) {
        S.time = 0.2; M.viver(15);
        for (const q of G.Biz.all().filter(q => G.Biz.manned(q)).sort(byId)) {
          const ow = S.villagers.get(q.owner); const sp = G.Biz.spots(q); if (!ow || !sp) continue;
          const c = people(o => o.set === q.set && grown(o) && homeOf(o) && o.id !== ow.id && !K.person(o, ow) && Po.can(o).ok)[0];
          if (c) { z = q; m = ow; b3 = c; break; } why = `a banca de ${ow.name} não tem um estranho que possa comprar`;
        }
      }
      if (!b3) ok('p3 depois de uma compra, o nome de quem vende', false, why);
      else {
        const h = homeOf(b3); god(() => D.make('h:' + h.id, 'moedas', 30, { code: 'teste' }));
        const tk3 = take(b3); const sp = G.Biz.spots(z); put(b3, sp.buyer); const n0 = K.name(b3, m);
        // (what someone is at may name a third: «Indo comprar … na banca de Meresankh» — on the card of one just spoken to,
        // the merchant the body does not know is what is seen of her; no step of the world in between)
        const c2 = people(o => o.set === z.set && grown(o) && o.id !== b3.id && o.id !== m.id)[0]; const t0 = c2 ? c2.task : null; let doing = '', raw = '';
        if (c2) { c2.task = { type: 'compra', biz: z.id, st: 0, k: Object.keys(z.inv)[0] || 'food', pri: 0.3 }; raw = G.Vg.taskText(c2); doing = I.personCard(c2, b3, true).doing; c2.task = t0; }
        const veiled = !c2 || !raw.includes(m.name) ? null : !doing.includes(m.name) && /banca d[ao] /.test(doing);
        let r = { ok: false, why: 'sem oferta de compra' }; const tried = [];
        for (const o of A.offers(b3, b3.x, b3.y, 2).filter(o => o.act === 'comprar' && o.biz === z.id && o.ok !== false)) { r = god(() => A.perform(b3, o)); tried.push(`${o.label}: ${r.ok ? 'feito' : r.why}`); if (r.ok) break; }
        const how = K.how(b3, m), back = K.how(m, b3);
        ok('p3 depois de uma compra, o nome de quem vende', tk3 && !n0.includes(m.name) && veiled !== false && r.ok && how.n === 1 && how.why === 'encontro' && back.n >= 1 && K.name(b3, m) === m.name,
          `${b3.name} na banca de ${m.name} (antes: «${n0}»${veiled === null ? '' : `; o que outro faz, «${raw}», na ficha: «${doing}»`}): ${tried.join('; ') || r.why} → «${K.name(b3, m)}» (${how.why})`);
        Po.release('deus'); M.viver(0.2);
      }
    }
    // ---------------- p5
    if (on('p5')) {
      if (!Po.is(v)) take(v); if (!v.ken || !v.ken.p.includes(st.id)) meet(st.id);
      const name = st.name, id = st.id; god(() => V.kill(st, 'sick')); M.viver(0.5);
      const rec = G.person(id); const how = rec ? K.how(v, rec) : { n: -1 }; const hb = st.home ? S.buildings.get(st.home) : null; const card = hb ? I.buildingCard(hb, v) : null;
      ok('p5 a pessoa conhecida morre: o nome continua sabido, nada quebra', !S.villagers.has(id) && !!rec && how.n === 1 && K.name(v, rec) === name && v.ken.p.includes(id) && (!card || !JSON.stringify(card.rows).includes(name)) && Po.is(v),
        `${name} morreu; para ${v.name} continua «${rec ? K.name(v, rec) : '?'}» (${how.why}); o cartão da casa dela ${card ? 'não a lista mais' : '(sem casa)'}`);
    }
    const nv = novas(), e = errs(); ok('p verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
  }
}

// ================================================================ the stories others weave around someone
if (on('p7')) {
  // (someone sought, mourned or plotted against in another's story — its target, its victim —, alive and able to be lived:
  // the story is not theirs to read; the god reads it on their card. In the world of the cases, else in the «cidade», where
  // Quinto has sworn against Tito)
  let tg = null, story = null, where = '';
  for (const w of [...new Set([WORLD, 'cidade'])]) {
    open(w);
    for (const s of (S.saga ? S.saga.stories : []).filter(x => x.st === 'ativa' && x.title).sort(byId)) { for (const k of ['target', 'victim', 'captive', 'lost', 'ruler']) { const o = typeof s.cast[k] === 'number' ? S.villagers.get(s.cast[k]) : null; const i = o ? G.Stories.of(o.id).indexOf(s) : -1; if (o && o.id !== s.protag && Po.can(o).ok && i >= 0 && i < 3) { tg = o; story = s; break; } } if (tg) break; }
    if (tg) { where = w; break; }
  }
  if (!tg) ok('p7 a história que outro tece em volta de alguém não é dele para ler', true, `em ${WORLD} e na cidade, nenhuma história ativa com alguém vivo no elenco além de quem a conduz (nada a provar)`);
  else {
    const tk7 = take(tg); const mine = Po.context().stories; const kin = people(o => o.id !== tg.id && Po.kin(o, tg))[0];
    const gods = I.personCard(tg, null).stories, kins = kin ? I.personCard(tg, kin).stories : [];
    const own = G.Stories.of(tg.id).filter(s => s.protag === tg.id);
    ok('p7 a história que outro tece em volta de alguém não é dele para ler', tk7 && !mine.some(s => s.id === story.id) && mine.length === own.length && gods.includes(story.title) && !kins.includes(story.title),
      `(${where}) ${tg.name} está em «${story.title}» (de ${(G.person(story.protag) || {}).name}): na ficha «Quem sou eu» ${mine.some(s => s.id === story.id) ? 'APARECE' : 'não aparece'} (as suas: ${mine.length}); o deus a lê na ficha dele (${gods.includes(story.title)})${kin ? `; ${kin.name}, da família, não (${!kins.includes(story.title)})` : ''}`);
    const nv = novas(), e = errs(); ok('p7 verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
  }
}

// ================================================================ the house
if (on('c1')) {
  open(WORLD); const set = city();
  let v = null, ot = null;
  // (a body with a house, and a house of strangers to it — nobody of it known to the body)
  for (const o of set ? bodies(set) : []) { const h2 = [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && b.id !== o.home && b.coin !== undefined).sort(byId).find(b => { const r = people(x => x.home === b.id); return r.length && r.every(x => !K.person(o, x)); }); if (h2) { v = o; ot = h2; break; } }
  if (!v) ok('c1 as moedas: só da própria casa', false, `em ${set ? set.name : WORLD}, nenhuma casa de estranhos com moedas`);
  else {
    const h = homeOf(v); const coin = b => Math.round(D.get('h:' + b.id, 'moedas'));
    // (two amounts that are nobody else's: 5555 in the body's own house, 7777 in the strangers')
    god(() => { D.make('h:' + h.id, 'moedas', 5555 - coin(h), { code: 'teste' }); D.make('h:' + ot.id, 'moedas', 7777 - coin(ot), { code: 'teste' }); });
    const tk = take(v); put(v, V.door(ot)); const owner = people(x => x.home === ot.id && x.age >= 16)[0] || people(x => x.home === ot.id)[0];
    const mine = I.buildingCard(h, v), theirs = I.buildingCard(ot, v), gods = I.buildingCard(ot, null);
    const texts = [JSON.stringify(theirs), JSON.stringify(I.personCard(owner, v)), JSON.stringify(I.personCard(owner, v, true)), DU.page(v, { mine: true }).html, JSON.stringify(K.where(v)), JSON.stringify(Po.context())];
    const row = (c, k) => c.rows.find(r => r[0] === k);
    // (the people's store: of one's own people, the stock; of another people, nothing of it)
    const store = b => !!(G.BDEF[b.type] && G.BDEF[b.type].dropoff) && b.built; const fid = G.Fac.idOfV(v);
    const sMine = [...S.buildings.values()].filter(b => store(b) && V.facOfSet(b.set) === fid).sort(byId)[0], sTheirs = [...S.buildings.values()].filter(b => store(b) && V.facOfSet(b.set) !== fid).sort(byId)[0];
    const cm = sMine ? I.buildingCard(sMine, v) : null, ct = sTheirs ? I.buildingCard(sTheirs, v) : null;
    ok('c1 as moedas e quem está em casa: só da própria casa; o estoque só do próprio povo', tk && coin(h) === 5555 && coin(ot) === 7777 && K.house(v, h) && !K.house(v, ot) && !!row(mine, 'Moedas da família') && row(mine, 'Moedas da família')[1] === 5555 && !!row(mine, 'Em casa agora')
      && !row(theirs, 'Moedas da família') && !row(theirs, 'Em casa agora') && texts.every(t => !t.includes('7777')) && /não conhece/.test(row(theirs, 'Moram aqui')[1]) && people(x => x.home === ot.id).every(x => !JSON.stringify(theirs).includes(x.name))
      && !!row(gods, 'Moedas da família') && row(gods, 'Moedas da família')[1] === 7777 && (!cm || !!row(cm, 'No estoque do povo')) && (!ct || !row(ct, 'No estoque do povo')),
      `${v.name}: a sua casa mostra ${row(mine, 'Moedas da família') ? row(mine, 'Moedas da família')[1] : 'NADA'} moedas; a de ${owner.name} (7777, estranhos): «${theirs.rows.map(r => r.join(': ')).join(' · ')}» — o 7777 em ${texts.filter(t => t.includes('7777')).length} dos ${texts.length} textos do corpo; o deus vê ${row(gods, 'Moedas da família') ? row(gods, 'Moedas da família')[1] : 'NADA'}; o estoque: do seu povo ${cm ? (row(cm, 'No estoque do povo') ? 'sim' : 'NÃO') : '(sem armazém)'}, de outro povo ${ct ? (row(ct, 'No estoque do povo') ? 'SIM' : 'não') : '(sem armazém)'}`);
    const nv = novas(), e = errs(); ok('c verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
  }
}

// ================================================================ the god, and another body
if (on('g1', 't1')) {
  open(WORLD); const set = city(); const cand = set ? bodies(set) : [];
  if (on('g1')) {
    const o = cand.find(x => x.mother && G.Life.bioList(x).length >= 2) || cand[0]; const h = o && homeOf(o); const q = set && U.districtsOf(set)[0];
    const c = o ? I.personCard(o, null) : null; const nm = id => { const p = id && G.person(id); return p ? p.name + (p.dead ? ' (†)' : '') : null; };
    const bio = o ? G.Life.bioList(o).slice(-6).reverse().map(e => e.txt) : []; const bc = h ? I.buildingCard(h, null) : null; const res = h ? people(x => x.home === h.id) : [];
    const all = !!o && people(x => x.set === set.id).every(x => K.person(null, x) === 2) && U.districtsOf(set).every(d => !!K.district(null, d)) && [...S.settlements.values()].every(s => !!K.town(null, s)) && [...S.buildings.values()].slice(0, 50).every(b => K.house(null, b) && K.stock(null, b));
    ok('g1 o deus sabe tudo: todas as portas, e os cartões de antes', all && !!c && c.knows === 2 && c.name.startsWith(o.name) && JSON.stringify(c.bio.map(e => e.txt)) === JSON.stringify(bio) && JSON.stringify(c.parents) === JSON.stringify([nm(o.mother), nm(o.father)].filter(Boolean)) && JSON.stringify(c.traits) === JSON.stringify(o.traits) && c.why === ''
      && !!bc && res.every(x => JSON.stringify(bc.rows).includes(x.name)) && (h.coin === undefined || !!bc.rows.find(r => r[0] === 'Moedas da família')) && K.name(null, o) === o.name && DU.page(o, { god: true }).html.length > 20,
      o ? `sem corpo: ${people(x => x.set === set.id).length} pessoas, ${U.districtsOf(set).length} bairros e ${S.settlements.size} cidades de ${set.name}, todos sabidos (${all}); a ficha de ${o.name} com ${c.bio.length} memórias, ${c.parents.length} pais, ${c.traits.length} jeitos; a casa com ${res.length} moradores pelo nome${h.coin !== undefined ? ' e as moedas' : ''}` : 'ninguém');
  }
  if (on('t1')) {
    // (two bodies of the city, and someone the first knows and the second does not; a stranger to the first, met by it)
    let a = null, b = null, x = null;
    for (const p of cand) { for (const q of cand) { if (q === p) continue; const y = people(o => o.set === set.id && o.id !== p.id && o.id !== q.id && K.how(p, o).n === 1 && K.person(q, o) === 0)[0]; if (y) { a = p; b = q; x = y; break; } } if (a) break; }
    const y = a ? people(o => o.set === set.id && o.age >= 18 && o.id !== a.id && o.id !== b.id && !K.person(a, o) && !K.person(b, o))[0] : null;
    if (!a || !y) ok('t1 trocar de corpo troca o que se sabe', false, 'sem dois corpos com conhecidos diferentes');
    else {
      const tA = take(a); meet(y.id); const nA = [K.name(Po.body(), x), K.name(Po.body(), y)], wA = K.where(Po.body()).txt, metA = S.avatar.met.slice();
      const tB = take(b); const nB = [K.name(Po.body(), x), K.name(Po.body(), y)], wB = K.where(Po.body()).txt, metB = S.avatar.met.slice();
      const tA2 = take(a); const nA2 = [K.name(Po.body(), x), K.name(Po.body(), y)];
      ok('t1 trocar de corpo troca o que se sabe; o que cada um viveu fica com ele', tA && tB && tA2 && nA[0] === x.name && nA[1] === y.name && !nB[0].includes(x.name) && !nB[1].includes(y.name) && metA.includes(y.id) && !metB.length && nA2[1] === y.name && a.ken.p.includes(y.id) && !(b.ken && b.ken.p.includes(y.id)),
        `${a.name} conhece ${x.name} («${K.how(a, x).why}») e conheceu ${y.name}: «${nA.join('», «')}», em «${wA}»; no corpo de ${b.name}: «${nB.join('», «')}», em «${wB}»; de volta a ${a.name}: «${nA2.join('», «')}»`);
    }
  }
  const nv = novas(), e = errs(); ok('g verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
}

// ================================================================ the save
if (on('s1', 's2', 's3')) {
  if (on('s1', 's2')) {
    open(WORLD); const set = city(); const qs = set ? U.districtsOf(set) : [];
    let v = null, q = null; for (const o of set ? bodies(set) : []) { const u = qs.find(d => !K.district(o, d) && spotIn(d)); if (u) { v = o; q = u; break; } }
    if (!v) ok('s', false, 'ninguém com um bairro desconhecido');
    else {
      const st = people(x => x.set === set.id && x.age >= 18 && x.id !== v.id && !K.person(v, x))[0]; const loc = people(o => o.id !== v.id && o.set === set.id && qOf(homeOf(o)) === q)[0];
      take(v); put(v, spotIn(q)); if (st) meet(st.id); if (loc) meet(loc.id);
      const probe = () => { const b = Po.body(); return b ? JSON.stringify([b.id, K.where(b).txt, people(x => x.set === set.id).map(x => K.how(b, x).n).join(''), U.districtsOf(S.settlements.get(set.id)).map(d => K.district(b, d)).join(','), b.ken]) : 'sem corpo'; };
      if (on('s1')) {
        const before = probe(), ken0 = JSON.stringify(v.ken); const n = M.salvarCarregar(); S = G.S; M.viver(0.1); const after = probe(); const v2 = S.villagers.get(v.id);
        ok('s1 save/load no meio: o corpo volta e sabe o mesmo', before === after && !!S.avatar && S.avatar.id === v.id && JSON.stringify(v2.ken) === ken0 && v2.ken.p.length >= 1 && v2.ken.q.length >= 1,
          `${v.name}: «${K.where(v2).txt}», ${v2.ken.p.length} conhecidos e ${v2.ken.q.length} lugares no registro, antes e depois (${n} caracteres)${before === after ? '' : ' — DIFERENTE: ' + before.slice(0, 120) + ' ≠ ' + after.slice(0, 120)}`);
      }
      { const nv = novas(), e = errs(); ok('s verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo'); }
      if (on('s2')) {
        // (the record damaged in the save, each in its own way; everyone else's as it was)
        const id0 = v.id; const o = JSON.parse(G.Save.serialize()); const vs = o.villagers.filter(x => x.set === set.id && x.id !== id0).slice(0, 6);
        const me = o.villagers.find(x => x.id === id0);
        me.ken = { p: [me.id, me.id, -4, 'x', 3.5, vs[0].id, vs[0].id, 1e12], q: [[0, 1, 1], 'a', [q.id, 9e9, 7], [q.id, 1, 0], [-set.id, NaN, 1], null] };
        vs[1].ken = 5; vs[2].ken = 'tudo'; vs[3].ken = { p: 'x' }; vs[4].ken = null; vs[5].ken = { p: new Array(500).fill(0).map((_, k) => k + 1), q: new Array(90).fill(0).map((_, k) => [k + 1, 0, 0]) };
        let threw = ''; try { G.Save.apply(o); S = G.S; M.viver(0.2); } catch (e2) { threw = e2.message; }
        // (nothing invalid left for the verifier — S0 to S2; that a meeting is of two, S3, a damaged save may have broken:
        // the test broke it itself)
        const b = S.villagers.get(id0); const bad = QA.check().filter(x => x.sys === 'sabe' && x.sev <= 2).map(x => x.msg); const k = b && b.ken;
        const big = S.villagers.get(vs[5].id).ken; const e = errs();
        ok('s2 um registro danificado no save é consertado ao abrir', !threw && !bad.length && !e && !!k && !k.p.includes(id0) && k.p.length === 1 && k.p[0] === vs[0].id && k.p.every(Number.isInteger) && new Set(k.p).size === k.p.length && k.q.every(q2 => Array.isArray(q2) && q2[1] <= S.day && (q2[2] === 0 || q2[2] === 1)) && [1, 2, 3, 4].every(i => S.villagers.get(vs[i].id).ken === undefined || typeof S.villagers.get(vs[i].id).ken === 'object')
          && big.p.length <= K.P_MAX && big.q.length <= K.Q_MAX,
          threw ? 'ERRO ao abrir: ' + threw : bad.length ? bad.slice(0, 3).join(' | ') : e || `${b.name}: ${JSON.stringify(k)}; o de 500 pessoas e 90 lugares ficou com ${big.p.length} e ${big.q.length}`);
      }
    }
  }
  if (on('s3')) {
    let threw = ''; const file = path.join(__dirname, 'oldsave_7.json');
    try { open(() => M.abrir(JSON.parse(fs.readFileSync(file, 'utf8')))); } catch (e2) { threw = e2.message; }
    if (threw) ok('s3 um save antigo abre, e a porta responde', false, 'ERRO ao abrir: ' + threw);
    else {
      const none = [...S.villagers.values()].every(x => x.ken === undefined);
      const set = [...S.settlements.values()].sort((a, b) => pop(b) - pop(a) || a.id - b.id)[0]; const v = people(x => x.set === set.id && grown(x) && Po.can(x).ok)[0];
      const tk = v ? take(v) : false; M.viver(2); const w = v ? K.where(v) : null; const n = v ? people(x => x.set === set.id).map(x => K.person(v, x)) : [];
      const nv = novas(), e = errs();
      ok('s3 um save antigo abre, e a porta responde', none && tk && !!w && w.txt.length > 2 && !!v.ken && n.length > 0 && !nv.length && !e,
        `dia ${S.day}, ${S.villagers.size} pessoas, nenhuma com registro ao abrir (${none}); ${v ? `${v.name} de ${set.name}: «${w.txt}», conhece ${n.filter(x => x > 0).length} de ${n.length}` : 'ninguém para viver'}${nv.length ? ' — ' + nv.slice(0, 2).join(' | ') : ''}${e ? ' — ' + e : ''}`);
    }
  }
}

// ================================================================ the screens write nothing
if (on('w1')) {
  open(WORLD); const set = city(); const v0 = set ? bodies(set)[0] : null;
  if (!v0) ok('w1 as telas não escrevem no mundo', false, 'ninguém para viver');
  else {
    take(v0); const st = people(x => x.set === set.id && x.age >= 18 && !K.person(v0, x))[0]; if (st) meet(st.id);
    const save = G.Save.serialize(); const id = v0.id; const N = 120;
    const rels = () => { let n = 0; for (const f of S.factions.values()) n += Object.keys(f.rel || {}).length; return n; };
    // (a frame: every door that only reads, asked from outside the world's step, as the screens ask — and a meeting asked
    // from there, which the world must not do)
    let asked = 0;
    const frame = k => {
      const was = G.inSim; G.inSim = 0;
      try {
        const b = Po.body(); if (!b) return; K.where(b); Po.where(b); Po.context(); DU.page(b, { mine: true }); const P = prov('pessoa');
        const near = [...S.villagers.values()].filter(o => o.id !== b.id && Math.abs(o.x - b.x) < 14 && Math.abs(o.y - b.y) < 14).slice(0, 12);
        for (const o of near) { K.how(b, o); K.name(b, o); K.call(b, o); K.looks(o, b); P.label({ v: b }, { o }); P.can({ v: b }, { o }); I.personCard(o, b); I.personCard(o, b, true); I.canHug(b, o); asked++; }
        for (const s of S.settlements.values()) { K.town(b, s); for (const d of U.districtsOf(s)) { K.district(b, d); K.seen(d, d.x, d.y); } }
        for (const bd of [...S.buildings.values()].filter(q => Math.abs(q.x - b.x) < 10 && Math.abs(q.y - b.y) < 10).slice(0, 10)) { K.house(b, bd); K.stock(b, bd); I.buildingCard(bd, b); }
        for (const e of S.history.slice(-12)) K.hears(b, e);
        const far = [...S.villagers.values()][(k * 53) % S.villagers.size]; if (far) { K.how(b, far); K.looks(far, b); Po.meet(far.id); }
      } finally { G.inSim = was; }
    };
    const run = frames => { G.Save.apply(JSON.parse(save)); S = G.S; const r0 = rels(); for (let k = 0; k < N; k++) { G.debug.step(0.1); if (frames) frame(k); } return { fp: fp(), rels: rels() - r0, ken: JSON.stringify([...S.villagers.values()].filter(x => x.ken).sort(byId).map(x => [x.id, x.ken])), body: !!S.avatar && S.avatar.id === id }; };
    const a = run(false), b = run(true), c = run(false);
    ok('w1 as telas não escrevem no mundo: com e sem quadros, idêntico', a.fp === b.fp && a.fp === c.fp && a.ken === b.ken && b.rels === a.rels && a.body && b.body && asked > 50,
      `${N} passos com o corpo de ${v0.name}: sem quadros ${a.fp.slice(0, 20)}…, com ${asked} perguntas das telas ${b.fp.slice(0, 20)}…, sem de novo ${c.fp.slice(0, 20)}…; registros iguais: ${a.ken === b.ken}; relações de povos criadas pelas telas: ${b.rels - a.rels}`);
    const nv = novas(), e = errs(); ok('w verificador', !nv.length && !e, nv.slice(0, 3).join(' | ') || e || 'limpo');
  }
}

// ================================================================ the bad cases
if (on('x1')) {
  open(WORLD); const set = city(); const qs = set ? U.districtsOf(set) : [];
  let v = null, q = null; for (const o of set ? bodies(set) : []) { const u = qs.find(d => !K.district(o, d) && spotIn(d) && d.k !== 'centro'); if (u) { v = o; q = u; break; } }
  if (!v) ok('x1 os casos ruins', false, 'ninguém com um bairro desconhecido');
  else {
    const loc = people(o => o.id !== v.id && o.set === set.id && qOf(homeOf(o)) === q)[0];
    take(v); put(v, spotIn(q)); if (loc) meet(loc.id); const knew = K.district(v, q);
    // (the quarter the body knew is gone — a quarter that lost its ground fades away, urban.js —: asked by a quarter that is
    // no more, and standing where it was)
    let threw = ''; const steps = [];
    try {
      god(() => { set.urb.d.splice(set.urb.d.indexOf(q), 1); U.ver++; }); M.viver(0.2); steps.push(`o bairro ${q.name} sumiu: «${K.where(v).txt}», e perguntado por ele: «${K.district(v, q)}»`);
      // (the god takes the body's house away)
      const h = homeOf(v); god(() => V.removeBuilding(h)); M.viver(0.5); steps.push(`a casa tirada: K.house ${K.house(v, h)}, «${K.where(v).txt}»`);
      // (the body dies)
      god(() => V.kill(v, 'sick')); M.viver(0.5); steps.push(`o corpo morreu: avatar ${S.avatar ? 'AINDA' : 'nenhum'}, a porta do deus responde ${K.person(null, loc || v)}`);
    } catch (e2) { threw = e2.message + ' ' + String(e2.stack).split('\n')[1]; }
    const nv = novas(), e = errs();
    ok('x1 o bairro some, a casa some, o corpo morre: nada quebra', !threw && knew === (loc ? 'contaram' : '') && !S.avatar && !nv.length && !e, threw ? 'ERRO: ' + threw : `${steps.join('; ')}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}${e ? ' — ' + e : ''}`);
  }
}
console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'tudo passou');
process.exitCode = fails.length ? 1 : 0;
