// taverna-vida: a vida da taverna à noite (os interiores 2.0, P7 — D-760 a D-766), em Node, pelo qa/nodemundo.js, no mundo pronto
// (a metrópole): as pessoas pelas tarefas delas, a hora delas, a vontade de cada uma, o dinheiro das casas e o estoque do povo.
//  v1 uma noite inteira: quantos estão em cada taverna à noite, quantos sentados à mesa (sempre sobre o assento), quantos servidos
//     à mesa pelo taverneiro (a caneca das mãos dele à do freguês, paga ali), quantas músicas e com que instrumento (o do povo, do
//     couro que o povo teve), quantos entraram andando da porta e saíram andando até ela, quantas trocas de lugar sem motivo (nenhuma),
//     a porta aberta enquanto a taverna atende — e o verificador limpo
//  v2 um save e um load no meio da noite: cada freguês volta ao seu banquinho, e o mesmo save carregado duas vezes vive o mesmo futuro
//  v3 a pessoa que morre sentada: sai da mesa e do livro do dia, ninguém fica no lugar dela por ela, a caneca não some sem linha
//  v4 o deus tira a bebida do estoque: nada servido do nada; quem tem companhia fica à mesa, quem está só vai para casa
//  v5 o taverneiro preso: ninguém mais servido pelas mãos dele; quem espera se serve no balcão; o dia fecha sem ele e ninguém fica
//  v7 a taverna viva (D-806 a D-810), na mesma noite da v1: cada ato novo — o brinde, os ossinhos, a dança, as palmas, o canto, o
//     cochilo, a mesa limpa, as canecas recolhidas, a gorjeta, a expulsão, o fechamento — contado com a sua causa no livro do dia e
//     visto nas pessoas; a conversa das mesas: cada fala com a sua fonte (o boato que a pessoa sabe, a festa, a guerra, a colheita,
//     a bebida) — nenhuma solta —, e as canecas e os pratos deixados nas mesas até o taverneiro recolher
//  v8 a briga passada do primeiro sangue: o taverneiro, se é de pôr para fora, põe o brigão na rua — o ato de dois —, que não volta
//  a taverna no mundo que acontece (a T1 da quarta onda, D-812 a D-825), cada parte da sua própria base (o mundo pronto vivido até
//  a hora dela):
//  v9 a guerra à porta: o alarme fecha o dia (ninguém mais servido), quem está dentro se esconde, o taverneiro tranca ou abre a casa
//     ao povo da rua pela índole dele (a escolha pura, TC.escolha); o save no meio — quem se escondia volta escondido, a tranca fica —;
//     o bando que saqueia força a porta trancada contra a madeira e a tranca, e ela cede (sem armados lá dentro, pela mão da prova);
//     passado o perigo, a porta fica arrombada até o taverneiro a consertar com a madeira pelo livro, e a taverna reabre
//  v10 o luto pelo governante: nenhuma música, a conversa baixa e de luto, um brinde à memória, nenhuma festa; passado o luto, a
//     festa do novo governante
//  v11 a tempestade: mais gente entra nas tavernas que na mesma hora sem chuva
//  v12 uma festa de cada causa (a conquista, a vitória, o novo governante, a cidade que cresce, a colheita, o casamento, o filho, a
//     casa que prosperou), cada uma pelo que o mundo registra; e uma noite de festa inteira: o discurso e a crônica, o prato da festa,
//     a rodada da casa pelo livro, os bardos tocando juntos, os enfeites pelo livro, a dança de roda, o concurso de bebida e a torcida
//  v13 o save no meio da festa: a festa e o concurso voltam como eram, e o mesmo save vive o mesmo futuro
//  v14 o fiado: o freguês de sempre sem moeda bebe na conta (o livro, os laços); passado o prazo, marcado nos laços do taverneiro e
//     não servido; com o dinheiro, paga a conta
//  v15 a queda de braço: dois fortes à mesa (o ofício pesado e a bebida pela mão da prova; a índole para isso), a aposta pelo livro, a
//     mesa torcendo
//  v16 o fogo perto (todos saem, não reabre), a fome do povo (sem prato, nada comprado), a doença na cidade (pouca gente, os doentes
//     nenhum) e a festa da cidade (mais gente)
//  v17 dois que entram no mesmo passo do salto tomam dois banquinhos (L-1980)
//  e nenhum erro de módulo nem aviso no console.
//   ONLY=v9,v12 node qa/taverna-vida.js     (só essas partes; as da T1 não precisam da noite da v1)
//   node qa/taverna-vida.js [mundo]          (≈ 3 min; a noite inteira é a v1 — as outras partem de um retrato dela)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js', 'qa/taverna-vida-inv.js'] });
const D = G.Depot, A = G.Act, T = G.Taverna, In = G.Interiors, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna-vida ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
const ONLY = (process.env.ONLY || '').split(',').map(x => x.trim()).filter(Boolean); const WANT = k => !ONLY.length || ONLY.includes(k);
const OLD = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].some(WANT); // (the night of the v1 and the cases of its snapshot)
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock(); // (T-1740: Date.now stands still)
M.pronto(world); M.viver(12);
const S = () => G.S;
// (the rules this proof watches: the tavern's life and the trades' — the S2 and worse —, each look)
const watch = bad => { for (const q of QA.check().filter(q => q.sev <= 2 && (q.sys === 'taverna' || q.sys === 'oficio' || q.sys === 'int' || q.sys === 'lar'))) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
// (the ledger's lines as they are written: [n, day, clock, from, to, good, n, op, code, by])
const seen = []; D.onMove.push(e => { seen.push({ t: e[2], from: e[3], to: e[4], k: e[5], n: e[6], op: e[7], c: e[8], by: e[9] }); });
// (who went in by the door: every call of the door, and the walk it gave — G.Vg.enter)
const entered = []; const enter0 = G.Vg.enter; G.Vg.enter = function (v, b, t) { const s = enter0.apply(this, arguments); if (b && b.type === 'taverna') entered.push({ v: v.id, b: b.id, s, task: t && t.type }); return s; };
const taverns = () => [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built);
// (the night of the proof in the god's peace — no storm, no war at the gates, no feast of the town —: what it measures is the
// tavern's evening, not the weather's; the days of the freguesia's proofs the same, T-910)
const god0 = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god0(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: true }; } };
const atTables = op => Object.keys(op.data.mesa).length;
// (v7: the acts of the living tavern as the people show them, and every word said at a table — with the source it came from: a rumour
// the speaker knows, a line of the tables' talk, or another word of the tavern's own — checked as it is said)
const ACTS = ['brinde', 'jogo-ossos', 'danca', 'palmas', 'cantar-junto', 'cochilo', 'limpar-mesa', 'recolher-canecas', 'gorjeta', 'expulsar', 'fechar'];
const actSeen = {}; const said = [];
const tpl = key => { const out = []; for (const c of Object.keys(G.Falas.PACK)) for (const t of G.Falas.PACK[c][key] || []) out.push(new RegExp('^' + t.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\w+\}/g, '.+') + '$', 'i')); return out; };
const TALK = ['mesa_festa', 'mesa_guerra', 'mesa_colheita', 'mesa_bebida', 'mesa_luto', 'mesa_festa_casa'].map(k => [k, tpl(k)]);
// (and the tavern's words of the world that happens — T1: the memory's toast, the feast's speech, the slate, the match, the shelter)
const OWN = ['pedir_taverna', 'sem_servico', 'sem_dinheiro', 'rodada_mesa', 'gorjeta_obrigado', 'musica_sim', 'musica_nao', 'acabou', 'cheia',
  'brinde_memoria', 'festa_discurso', 'fiado_sim', 'fiado_nao', 'fiado_paga', 'concurso_desafio', 'concurso_vence', 'abrigar_chama', 'abrigar_tranca'].map(k => [k, tpl(k)]);
{ const say0 = G.Talk.say; G.Talk.say = function (v, txt) {
  if (v && v.task && v.task.type === 'tavern' && v.inside) { let why = null; const Bo = G.Boatos;
    if (Bo) for (const r of Bo.list()) { const how = Bo.sabe(v, r); if (how && Bo.frase(r, Bo.deQuem(v, r), how) === txt) { why = 'boato'; break; } }
    if (!why) for (const [k, L] of TALK) if (L.some(re => re.test(txt))) { why = k; break; }
    if (!why) for (const [k, L] of OWN) if (L.some(re => re.test(txt))) { why = 'taverna:' + k; break; }
    // (the words of a game of dice — the call, the guess, the hit, the out, the cheat seen —: said by one of a game of now, still in it or
    // just out of it, T4's)
    if (!why && G.JogoDados && G.JogoDados.jogos && G.JogoDados.jogos().some(op => op.data.quem.includes(v.id))) why = 'dados';
    said.push({ id: v.id, txt, why, drunk: !!(G.Ebrio && G.Ebrio.alegre(v)) }); }
  return say0.apply(this, arguments); }; }
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
// (a place's key — the piece and its place —, and the errand's phase: a place that changes with the same phase is a push)
const placeKey = pl => (pl ? (pl.it ? pl.item + ':' + pl.q : pl.use) : '-');
const phaseOf = v => { const t = v.task; return t ? `${t.type}:${t.st}:${t.use || ''}:${t.near || ''}` : '-'; };

// ---------------- v1 the whole night ----------------
let SNAP = null; const shot = {}; // (the snapshot for the other cases: the tables fullest after 0,66)
if (OLD) {
  calm();
  const bad = [];
  // (the day lived as it comes — the morning's work wears the people as it does; the clock is never pushed: the keepers would be
  // asleep at the opening, and nobody tired by the evening)
  while (S().time < 0.5) { calm(); M.viver(1); }
  const tv = taverns(); const st = new Map();
  for (const b of tv) st.set(b.id, { max: 0, seat: 0, who: new Set(), at07: -1, at08: -1, swaps: 0, outs: 0, left: 0, airs: 0, door: 0, doorBad: 0, last: new Map(), was: new Set() });
  const led0 = seen.length; let n = 0, tocando = 0, comInstr = 0, semInstr = 0, instrOk = 0, best = 0, bestAt = 0;
  let bebes = 0, bebesColo = 0, passa = 0, passaAberta = 0; // (the babies inside a building with who carries them; who passes a door)
  while (S().time < T.horas(tv[0]).fecha + 0.012 && n < 2400) {
    calm(); M.viver(0.5); n++;
    for (const b of tv) {
      const s = st.get(b.id); const op = T.dia(b);
      const ins = []; for (const v of S().villagers.values()) if (v.inside === b.id) ins.push(v);
      s.max = Math.max(s.max, ins.length);
      let seated = 0; const now = new Set();
      for (const v of ins) {
        s.who.add(v.id); now.add(v.id); const t = v.task; const pl = In.placeOf(v); if (ACTS.includes(v.act)) actSeen[v.act] = (actSeen[v.act] || 0) + 1;
        const sp = pl && pl.it ? pl.it.spots[pl.q] : null;
        if (t && t.type === 'tavern' && t.st >= 2 && t.st < 6 && !G.Vg.entering(v) && !G.Vg.leaving(v)) { if (sp && sp.on && SEATK[pl.it.kind]) seated++; else s.airs++; }
        const k = placeKey(pl), ph = phaseOf(v); const w = s.last.get(v.id);
        if (w && w.ph === ph && w.k !== k && v.age >= 2 && !(pl && (pl.with || pl.use === 'saida')) && !G.Vg.entering(v) && !G.Vg.leaving(v)) { s.swaps++; if (s.swaps <= 2) console.log(`   (troca: #${v.id} ${ph} de ${w.k} para ${k} às ${S().time.toFixed(3)}; o lugar guardado ${JSON.stringify(t && t.lugar)})`); }
        s.last.set(v.id, { k, ph });
        // (the musician at the stage: the instrument in the hands — the people's, of the hide it had —, or the voice alone)
        if (t && t.type === 'tavern' && t.st === 6 && v.act === 'play') { tocando++; const h = G.Inv && G.Inv.held ? G.Inv.held(v) : {}; const fid = G.Fac.idOfV(v); const can = G.Origem.matOK(fid, 'couro', G.Inv.artsOf(v));
          const k2 = h.mao || ''; if (/^(lira|tambor)/.test(k2)) comInstr++; else semInstr++; if ((can && /^(lira|tambor)/.test(k2) && (k2 === 'tambor') === ((G.Fac.civOfV ? G.Fac.civOfV(v) : v.civ) === 'asteca')) || (!can && !k2)) instrOk++; }
      }
      // (who walked out: inside, and at their walk to the door)
      for (const v of ins) if (G.Vg.leaving(v) && !s.was.has(v.id)) { s.outs++; s.was.add(v.id); }
      for (const id of [...s.was]) if (!now.has(id)) s.was.delete(id);
      for (const id of [...s.last.keys()]) if (!now.has(id)) { s.last.delete(id); s.left++; }
      s.seat = Math.max(s.seat, seated);
      const tm = S().time; if (s.at07 < 0 && tm >= 0.7) s.at07 = ins.length; if (s.at08 < 0 && tm >= 0.8) s.at08 = ins.length;
      // (the door: open while the tavern serves)
      if (op && T.aberta(b) && b.ip && In.plan(b) && In.plan(b).entrance) { s.door++; const ds = In.doorState(b, In.plan(b).entrance.door); if (!ds || (ds.state !== 'aberta' && ds.state !== 'bloqueada')) s.doorBad++; }
      if (op && tm >= 0.66 && atTables(op) > best) { best = atTables(op); bestAt = b.id; if (tm < 0.76) { SNAP = G.Save.serialize(); shot.b = b.id; shot.t = tm; shot.mesa = JSON.parse(JSON.stringify(op.data.mesa)); } }
    }
    // (every building: a baby inside with who carries it, in the arms — D-660; who passes the way in, the door open for them — D-766)
    if (n % 4 === 0) for (const v of S().villagers.values()) {
      if (!(v.inside > 0)) continue; const b = S().buildings.get(v.inside); if (!b || !b.ip || !In.ready(b)) continue;
      if (v.age < 2 && !(v.sleeping && v.home === b.id)) { const c = S().villagers.get(v.carrier); if (c && c.inside === b.id) { bebes++; const pl = In.placeOf(v); if (pl && pl.with === c.id) bebesColo++; } }
      if (In.passage(v)) { const p = In.plan(b); const e = p && p.entrance; if (e) { passa++; const ds = In.doorState(b, e.door); if (ds && (ds.state === 'aberta' || ds.state === 'bloqueada')) passaAberta++; } }
    }
    if (n % 10 === 0) watch(bad);
  }
  // (the ledger of the night: the rounds handed over at the table from the server's hands, and the ones taken at the counter)
  let porMao = 0, noBalcao = 0, semPagar = 0;
  for (let i = led0; i < seen.length; i++) { const e = seen[i]; if (!e || e.c !== 'taverna' || e.k === 'moedas') continue; if (String(e.from).startsWith('v:')) porMao++; else if (String(e.from).startsWith('b:')) noBalcao++; }
  const town = b => S().settlements.get(b.set);
  for (const b of tv) { const s = st.get(b.id); console.log(`   #${b.id} ${town(b).name} (${(G.Fac.get(V.facOfSet(b.set)) || {}).civ}, ${V.pop(b.set)} hab, ${b.w * 4} m): no máximo ${s.max} dentro e ${s.seat} sentados à mesa; às 0,70 ${Math.max(0, s.at07)}, às 0,80 ${Math.max(0, s.at08)}; ${s.who.size} pessoas na noite; ${s.outs} saíram andando até a porta; trocas de lugar sem motivo ${s.swaps}; fora do assento ${s.airs}; porta fechada na hora ${s.doorBad} de ${s.door}`); }
  const ops = A.all().filter(op => op.def === 'taverna' && op.data && op.data.day === S().day);
  const serv = ops.reduce((a, op) => a + op.data.servidos, 0), sets = ops.reduce((a, op) => a + (op.data.sets || 0), 0), musicos = new Set(ops.flatMap(op => op.data.musicos || [])).size, cheia = ops.reduce((a, op) => a + op.data.cheia, 0);
  const walked = entered.filter(e => e.s > 0).length;
  const all = [...st.values()]; const swaps = all.reduce((a, s) => a + s.swaps, 0), airs = all.reduce((a, s) => a + s.airs, 0), outs = all.reduce((a, s) => a + s.outs, 0), doorBad = all.reduce((a, s) => a + s.doorBad, 0);
  const full = all.filter(s => s.max >= 8).length, maxIn = Math.max(...all.map(s => s.max)), maxSeat = Math.max(...all.map(s => s.seat));
  console.log(`   a noite: ${serv} servidos (${porMao} à mesa pelas mãos de quem serve, ${noBalcao} no balcão), ${sets} músicas de ${musicos} músicos (${comInstr} instantes com o instrumento, ${semInstr} com a voz só), ${entered.length} entradas pela porta (${walked} andando até o lugar), ${outs} saídas andando, ${cheia} recusas na porta`);
  ok('v1 a noite cheia', maxIn >= 10 && full >= 2 && all.filter(s => s.at07 >= 4).length >= 3, `no máximo ${maxIn} numa taverna (${maxSeat} sentados), ${full} tavernas com 8 ou mais, ${all.filter(s => s.at07 >= 4).length} com 4 ou mais às 0,70 — antes: no máximo 0 a 6, vazias às 0,75 (E/RELATORIO.md)`);
  ok('v1 sentado é no assento', airs === 0 && maxSeat >= 6, `${airs} amostras de alguém à mesa fora de um banquinho, banco ou cadeira`);
  ok('v1 servido à mesa', porMao >= 5 && porMao >= noBalcao, `${porMao} rodadas levadas à mesa e pagas ali, ${noBalcao} no balcão (quem serve longe)`);
  ok('v1 o músico e o instrumento', sets >= 2 && tocando > 0 && instrOk === tocando, `${sets} músicas, ${tocando} instantes tocando, ${instrOk} com o instrumento do povo do couro que ele teve (ou a voz, sem couro)`);
  ok('v1 pela porta', entered.length >= 10 && walked >= entered.length * 0.8 && outs >= 10, `${entered.length} entradas pela porta, ${walked} com a caminhada até o lugar; ${outs} saídas andando`);
  ok('v1 cada um no seu lugar', swaps === 0, `${swaps} trocas de lugar sem mudar de afazer`);
  ok('v1 a porta aberta', doorBad === 0 && passa > 0 && passaAberta === passa, `${doorBad} amostras com a taverna aberta e a porta fechada; ${passaAberta} de ${passa} passagens pela porta de um prédio com ela aberta`);
  ok('v1 o bebê no colo', bebesColo === bebes, `${bebesColo} de ${bebes} amostras de um bebê dentro de um prédio com quem o carrega, no colo dele`);
  ok('v1 o verificador', !bad.length, bad.join(' / ') || 'limpo');
  if (!SNAP) ok('v1 o retrato', false, 'nenhuma taverna com gente à mesa depois das 0,66 para as outras partes');
  // ---------------- v7 the living tavern: each act with its cause, each word with its source ----------------
  {
    const atos = {}, falas = {}; let lav = 0, gorj = 0;
    for (const op of ops) { const d = op.data; for (const a of Object.keys(d.atos || {})) { const e = atos[a] || (atos[a] = {}); for (const w of Object.keys(d.atos[a])) e[w] = (e[w] || 0) + d.atos[a][w]; }
      for (const w of Object.keys(d.falas || {})) falas[w] = (falas[w] || 0) + d.falas[w]; lav += d.lavadas || 0; gorj += d.gorjetas || 0; }
    const CAUSE = { brinde: ['rodada', 'chegada'], 'jogo-ossos': ['indole', 'corpo', 'aposta'], danca: ['indole', 'bebida'], palmas: ['musica'], 'cantar-junto': ['bebida', 'indole'], cochilo: ['cansaco', 'bebida'], 'limpar-mesa': ['mesa-deixada', 'chao-sujo'], 'recolher-canecas': ['canecas-vazias'], gorjeta: ['musica', 'corpo'], expulsar: ['briga'], fechar: ['hora'] };
    const odd = []; for (const a of Object.keys(atos)) if (CAUSE[a]) for (const w of Object.keys(atos[a])) if (!CAUSE[a].includes(w)) odd.push(`${a} por «${w}»`);
    const count = a => Object.values(atos[a] || {}).reduce((x, y) => x + y, 0);
    console.log(`   os atos da noite (no livro do dia, com a causa): ${ACTS.map(a => `${a} ${count(a)}${atos[a] ? ' (' + Object.keys(atos[a]).map(w => w + ' ' + atos[a][w]).join(', ') + ')' : ''}`).join('; ')}`);
    console.log(`   vistos nas pessoas (amostras): ${ACTS.map(a => `${a} ${actSeen[a] || 0}`).join(', ')}; ${lav} canecas e pratos recolhidos, ${Math.round(gorj * 10) / 10} de gorjeta`);
    // (the acts of the people seen without their count in the book: none — every one has its cause)
    const unseen = ACTS.filter(a => (actSeen[a] || 0) > 0 && a !== 'expulsar' && !count(a));
    // (the common ones every night of a full room has; the music's — the claps, the song, the dance, the coin — by the songs the night had)
    const must = ['brinde', 'cochilo', 'fechar']; const lack = must.filter(a => !count(a)); const chores = count('limpar-mesa') + count('recolher-canecas'); const music = count('palmas') + count('cantar-junto') + count('danca');
    const kinds = ACTS.filter(a => count(a) > 0).length;
    ok('v7 a taverna viva: cada ato com a sua causa', !odd.length && !unseen.length && !lack.length && chores > 0 && music > 0 && kinds >= 7,
      `${kinds} dos ${ACTS.length} atos na noite${lack.length ? '; FALTARAM ' + lack.join(', ') : ''}${chores ? '' : '; nenhuma mesa limpa'}${music ? '' : '; ninguém respondeu à música'}${odd.length ? '; CAUSA ESTRANHA: ' + odd.join(', ') : ''}${unseen.length ? '; VISTO SEM CAUSA: ' + unseen.join(', ') : ''} (a expulsão, a v8; a gorjeta e os ossinhos do corpo, a c15 da taverna-corpo)`);
    const loose = said.filter(x => !x.why); const talk = said.filter(x => x.why === 'boato' || TALK.some(([k]) => k === x.why));
    const jokes = said.filter(x => x.why === 'mesa_bebida'); const soberJ = jokes.filter(x => !x.drunk).length;
    const by = {}; for (const x of said) by[x.why || '?'] = (by[x.why || '?'] || 0) + 1;
    console.log(`   as falas das mesas: ${Object.keys(by).map(k => k + ' ' + by[k]).join(', ')}; no livro: ${JSON.stringify(falas)}${loose.length ? '; SOLTAS: ' + [...new Set(loose.map(x => x.txt))].slice(0, 8).map(x => '«' + x + '»').join(' ') : ''}`);
    if (talk.length) console.log(`   (por exemplo: ${talk.slice(0, 4).map(x => '«' + x.txt + '»').join(' ')})`);
    ok('v7 a conversa das mesas fala do mundo: cada fala com a sua fonte', talk.length >= 5 && !loose.length && !soberJ && Object.keys(falas).every(w => G.Taverna.WHY_FALA.includes(w)),
      `${talk.length} falas das mesas (${Object.keys(falas).map(w => w + ' ' + falas[w]).join(', ')}), ${loose.length} sem causa, ${soberJ} brincadeiras de bêbado ditas sóbrio`);
  }
}

// ---------------- v6 the way from the door to each seat ----------------
// (the plan's walk, as the drawing walks it — In.pathIn —: every leg on the floor one walks, the first from the door too — never
// round the jamb of the doorway, L-1920 —; the last only onto the seat's piece)
if (WANT('v6')) {
  let legs = 0, badL = 0, none = 0, goals = 0, badG = 0; const ex = [];
  for (const b of taverns()) {
    const p = In.plan(b); const t = In.table(b); if (!p || !p.ok || !t) continue;
    for (const e of t.byUse.get('sentar') || []) {
      const pl = In.freeFor(b, e.it.id, e.q) || { lv: e.lv, x: e.x, z: e.z, it: e.it, item: e.it.id, q: e.q }; const w = In.pathIn(b, pl); if (!w) { none++; continue; }
      const P = w.pts; const lastOn = !!(pl.it && (pl.it.spots[pl.q] || {}).on);
      for (let i = 1; i < P.length; i++) { if (P[i][2] !== P[i - 1][2]) continue; if (lastOn && i === P.length - 1) continue; legs++;
                // (the first leg from the threshold the way in stands on: its first In.THRESH metres are the doorway's)
        const goalLeg = i === P.length - (lastOn ? 2 : 1); const okL = goalLeg ? In.sight(p, P[i][2], P[i], P[i - 1], In.STAND) && (i !== 1 || In.sight(p, P[i][2], P[i - 1], P[i], In.THRESH)) : In.sight(p, P[i][2], P[i - 1], P[i], i === 1 ? In.THRESH : 0);
        if (goalLeg) { goals++; if (!okL) badG++; continue; }
        if (!okL) { badL++; if (ex.length < 3) ex.push(`#${b.id} ${e.it.kind} perna ${i}`); } }
    }
  }
  // (the leg to the standing point at the seat: the feet's rule there — a point wedged between two pieces may be seen from no cell
  // of the walk: T-1821 —, at most one in a hundred)
  ok('v6 o caminho da porta', legs > 50 && badL === 0 && none === 0 && badG <= Math.max(1, goals * 0.01), `${legs - goals} pernas da porta aos assentos, ${badL} fora do chão que se anda${ex.length ? ' (' + ex.join(', ') + ')' : ''}; ${badG} de ${goals} últimas pernas até o assento por entre as peças; ${none} assentos sem caminho`);
}

// the other cases: from the snapshot of the fullest table of the night
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(SNAP)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const B = () => S().buildings.get(shot.b);
const god = f => { G.inSim++; try { f(); } finally { G.inSim--; } };
const digest = op => JSON.stringify([op.data.servidos, op.data.receita, Object.keys(op.data.mesa).sort(), Object.values(op.data.mesa).map(m => [m.st, m.it, m.q, m.r]), op.data.fila, S().rng]);
if (SNAP) {
  // ---------------- v2 a save and a load in the middle of the night ----------------
  {
    fresh(); const op = T.dia(B()); let back = 0, onSeat = 0, n = 0;
    for (const id of Object.keys(shot.mesa)) { const m = shot.mesa[id]; if (m.body) continue; n++; const v = S().villagers.get(+id); if (!v || !v.task || v.task.type !== 'tavern' || v.inside !== shot.b) continue; back++; const pl = In.placeOf(v); if (!m.it || (pl && pl.item === m.it && pl.q === m.q)) onSeat++; }
    const L = []; for (let k = 0; k < 2; k++) { fresh(); for (let s = 0; s < 12; s++) M.viver(1); const o = T.dia(B()); L.push(o ? digest(o) : 'fechada'); }
    ok('v2 save e load', !!op && back === n && onSeat === back && L[0] === L[1], `${back} de ${n} fregueses de volta à mesa, ${onSeat} no mesmo banquinho; a mesma noite carregada duas vezes ${L[0] === L[1] ? 'vive o mesmo futuro' : 'SE SEPARA'}`);
  }
  // ---------------- v3 the one who dies seated ----------------
  {
    fresh(); const op = T.dia(B()); const bad = [];
    const vid = Object.keys(op.data.mesa).map(Number).find(id => { const v = S().villagers.get(id); return v && v.task && v.task.type === 'tavern' && v.task.st >= 2 && !op.data.mesa[id].body; });
    const v = S().villagers.get(vid); const seat = v && v.task.lugar ? v.task.lugar.slice(0, 2) : null; const led0 = seen.length;
    god(() => V.kill(v, 'teste', true));
    for (let s = 0; s < 4; s++) { M.viver(1); watch(bad); }
    const o = T.dia(B()); const gone = !o || !o.data.mesa[vid]; const someone = seat && [...S().villagers.values()].some(q => q.inside === shot.b && q.task && q.task.lugar && q.task.lugar[0] === seat[0] && q.task.lugar[1] === seat[1] && q.id === vid);
    const lost = seen.slice(led0).filter(e => e && String(e.from) === 'v:' + vid && e.k !== 'moedas');
    ok('v3 quem morre sentado', !!v && gone && !someone && !bad.length, `${v ? v.name : '?'} morreu à mesa: ${gone ? 'saiu do livro do dia' : 'AINDA À MESA'}, o lugar ${someone ? 'ainda dele' : 'livre'}, ${lost.length} linha(s) do livro com o que tinha nas mãos; ${bad.join(' / ') || 'verificador limpo'}`);
  }
  // ---------------- v4 the god takes the drink from the shelf ----------------
  {
    fresh(); const b = B(); const ref = 'b:' + b.id; const DR = ['vinho', 'mel', 'cerveja', 'pulque'];
    god(() => { for (const k of DR) { const n = D.get(ref, k); if (n > 0) D.use(ref, k, n, { code: 'deus', part: true }); } });
    const op = T.dia(b); const led0 = seen.length; const at0 = op ? atTables(op) : 0; const bad = []; const left0 = DR.map(k => D.get(ref, k)).reduce((x, y) => x + y, 0);
    // (what was already in the hands — the cups on their way to a table, the ones being drunk —: theirs still; nothing more)
    let inHands = 0; for (const v of S().villagers.values()) if (v.carry && op && v.carry.op === op.id && DR.includes(v.carry.k)) inHands += v.carry.n;
    for (let s = 0; s < 12; s++) { M.viver(1); if (s % 4 === 3) watch(bad); }
    // (this tavern's rounds: the others' shelves are untouched)
    const L = seen.slice(led0).filter(e => e && e.c === 'taverna' && DR.includes(e.k) && op && e.op === op.id); const fromShelf = L.filter(e => String(e.from).startsWith('b:')).length; const handed = L.filter(e => String(e.from).startsWith('v:')).reduce((a, e) => a + e.n, 0);
    // (what came onto the shelf since by a door of its own — the keeper's purchase at the store, the vat's batch —: no drink of nothing)
    const restock = seen.slice(led0).filter(e => e && e.to === ref && DR.includes(e.k) && e.c !== 'taverna-volta').reduce((a, e) => a + e.n, 0);
    const o = T.dia(b); const at = o ? Object.keys(o.data.mesa).map(Number) : [];
    // (who stays at a table with nothing to drink stays for the company: someone else at the same table)
    const alone = at.filter(id => { const m = o.data.mesa[id]; const v = S().villagers.get(id); return m.dry && !at.some(q => q !== id && ((o.data.mesa[q].g && o.data.mesa[q].g === m.g) || T.fond(v, S().villagers.get(q)))); }).length;
    if (!(handed <= inHands + restock + 1e-6)) console.log('   (v4: na prateleira depois da mão do deus ' + left0 + '; ' + JSON.stringify(seen.slice(led0).filter(e => e && DR.includes(e.k) && op && e.op === op.id)) + ')');
    ok('v4 o deus tira a bebida', fromShelf === 0 && handed <= inHands + restock + 1e-6 && alone === 0 && !bad.length, `${fromShelf} rodadas da prateleira vazia (do nada), ${Math.round(handed * 100) / 100} de bebida passada de mão em mão (havia ${Math.round(inHands * 100) / 100} nas mãos, ${Math.round(restock * 100) / 100} chegou à prateleira pelo livro — comprada, da cuba); ${at0} à mesa antes, ${at.length} depois, ${alone} sem bebida e sem companhia; ${bad.join(' / ') || 'verificador limpo'}`);
  }
  // ---------------- v5 the keeper jailed ----------------
  {
    fresh(); const b = B(); const k = T.keeperOf(b); const jail = [...S().buildings.values()].find(q => q.type === 'cadeia' && q.built);
    if (!k || !jail) ok('v5 o taverneiro preso', true, `${!k ? 'sem taverneiro' : 'sem cadeia neste mundo'} — a parte não se aplica (T-1820)`);
    else {
      const led0 = seen.length; const bad = [];
      god(() => { k.jail = jail.id; k.jailUntil = S().day + 3; G.Vg.setTask(k, { type: 'wander', pri: 0 }); });
      let closed = false; for (let s = 0; s < 45; s++) { M.viver(1); if (s % 5 === 4) watch(bad); if (!T.dia(b)) { closed = true; } }
      const byHim = seen.slice(led0 + 1).filter(e => e && e.c === 'taverna' && e.k !== 'moedas' && e.by === k.id && e.t > S().clock - 40).length;
      const self = seen.slice(led0).filter(e => e && e.c === 'taverna' && e.k !== 'moedas' && String(e.from).startsWith('b:')).length;
      const left = [...S().villagers.values()].filter(v => v.inside === b.id && v.task && v.task.type === 'tavern').length;
      ok('v5 o taverneiro preso', !T.keeperOf(b) && closed && byHim === 0 && left === 0 && !bad.length, `${k.name} na cadeia: ${byHim} rodadas pelas mãos dele depois, ${self} servidas no balcão por quem esperava, o dia ${closed ? 'fechou sem ele' : 'NÃO FECHOU'}, ${left} ainda à mesa; ${bad.join(' / ') || 'verificador limpo'}`);
    }
  }
}
// ---------------- v8 the brawler put out ----------------
if (SNAP) {
  fresh(); const bad = [];
  // (a tavern with two of the world at the same table and a keeper of the índole to put one out — else any: the keeper who would not)
  let pick = null; for (const b of taverns()) { const op = T.dia(b); const k = T.keeperOf(b); if (!op || !k) continue; const at = Object.keys(op.data.mesa).map(Number).filter(id => { const v = S().villagers.get(id); return v && !op.data.mesa[id].body && v.task && v.task.type === 'tavern' && v.task.st >= 2 && v.task.st <= 5 && v.age >= 18; });
    for (const a of at) { const o = at.find(q => q !== a && op.data.mesa[q].g === op.data.mesa[a].g); if (o) { const c = { b, a, o, brave: T.brave(k) }; if (!pick || (c.brave && !pick.brave)) pick = c; break; } } if (pick && pick.brave) break; }
  if (!pick) ok('v8 a expulsão', false, 'nenhuma mesa com dois para brigar');
  else {
    const { b, a, o, brave } = pick; const A1 = S().villagers.get(a), O1 = S().villagers.get(o); const k = T.keeperOf(b);
    god(() => { G.Ebrio.prova(A1, G.Ebrio.limiar(A1, 'bebado') + 0.1); A1.drinks = 3; G.Ebrio.prova(O1, G.Ebrio.limiar(O1, 'bebado') + 0.1); T.briga(A1, O1); });
    let blood = false, outT = 0; const t0 = S().clock;
    while (S().clock - t0 < 30) { M.viver(0.25); const op = T.dia(b); if (!op) break; if (op.data.briga) blood = true; if (!op.data.mesa[a] && !outT) outT = S().clock; if (outT && S().clock - outT > 4) break; watch(bad); }
    const op = T.dia(b); const back = !!op && !!op.data.mesa[a]; const n = op ? (op.data.atos && op.data.atos.expulsar ? op.data.atos.expulsar.briga : 0) : 0;
    const walked = A1.saiT > 0 || (A1.task && A1.task.type !== 'tavern');
    ok('v8 a briga passada do primeiro sangue: o taverneiro de pôr para fora põe o brigão na rua, e ele não volta esta noite', brave ? blood && !!outT && !back && n === 1 && A1.tavDay === S().day && G.Taverna.urge(A1, null) === 0 && !bad.length : blood && n === 0 && !bad.length,
      `${k.name} ${brave ? 'é de pôr para fora' : 'não é de pôr ninguém para fora'}; ${A1.name} começou contra ${O1.name}: primeiro sangue ${blood ? 'sim' : 'não'}; ${outT ? `posto para fora em ${(outT - t0).toFixed(1)} s, saindo pela porta ${walked ? 'sim' : 'não'}` : 'ninguém posto para fora'}; ${back ? 'VOLTOU à mesa' : 'não voltou'}; ${bad.join(' / ') || 'verificador limpo'}`);
  }
}
// ================= the tavern in the world that happens (T1 of the fourth wave, D-812 to D-825) =================
// (each case from its own base: the ready world lived calm to the hour of the case, from the morning of its day — the feasts are
// planned before the opening)
if (WANT('v9') || WANT('v10') || WANT('v11') || WANT('v12') || WANT('v13') || WANT('v14') || WANT('v15') || WANT('v16') || WANT('v17')) {
  const TC = G.TavernaContexto, TF = G.TavernaFesta; const god1 = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
  const led = []; D.onMove.push(e => led.push({ t: e[2], from: e[3], to: e[4], k: e[5], n: e[6], op: e[7], c: e[8], by: e[9] }));
  const logs = []; { const l0 = G.Village.log; G.Village.log = function (txt, ic, x, y) { logs.push({ txt: String(txt), ic, t: S().clock }); return l0.apply(this, arguments); }; }
  const talks = []; { const s0 = G.Talk.say; G.Talk.say = function (v, txt, o) { if (v) talks.push({ id: v.id, txt: String(txt), style: o && o.style, t: S().clock }); return s0.apply(this, arguments); }; }
  const fullest = () => { let b = null, bn = -1; for (const q of taverns()) { const op = T.dia(q); const n = op ? Object.keys(op.data.mesa).length : -1; if (n > bn) { bn = n; b = q; } } return b; };
  let BASE = null; const base = () => { if (!BASE) { M.pronto(world); while (S().time < 0.45) { calm(); M.viver(1); } BASE = G.Save.serialize(); } M.reseed(4243); G.Save.apply(JSON.parse(BASE)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
  const liveTo = (t, quiet) => { let n = 0; while (S().time < t && n < 4000) { if (!quiet) calm(); M.viver(0.5); n++; } };
  const watchW = bad => { for (const q of QA.check().filter(q => q.sev <= 3 && q.sys === 'taverna')) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
  // ---------------- v9 the war at the door ----------------
  if (WANT('v9')) {
    base(); liveTo(0.66); const bad = [];
    // (of the taverns with people at the tables, the one with the fewest armed of its people round it — the town's defenders would keep the
    // raid off its door: T-1880)
    const armedNear = q => { const dr = G.Vg.door(q); const fid = V.facOfSet(q.set); let n = 0; for (const o of S().villagers.values()) if (!o.inside && G.Fac.idOfV(o) === fid && G.Vg.armedFor(o) && G.dist(o.x, o.y, dr[0], dr[1]) < 24) n++; return n; };
    const cands = taverns().filter(q => T.dia(q) && Object.keys(T.dia(q).data.mesa).length >= 4 && T.keeperOf(q)).sort((p, q) => armedNear(p) - armedNear(q) || p.id - q.id);
    const b = cands[0] || fullest(); const set = S().settlements.get(b.set); const P = G.Fac.get(set.fac); const k = T.keeperOf(b); const guests = Object.keys(T.dia(b).data.mesa).length;
    const Q = G.Fac.all().filter(f => f.alive && f.id !== P.id).sort((a, c) => G.Fac.pop(c.id) - G.Fac.pop(a.id))[0];
    S().divinePeace = 0; god1(() => G.Politics.declareWar(Q, P, 'ambicao'));
    // (the alarm of the town: the day shuts, who is at the tables hides there, the keeper bars or opens the house — his choice)
    const choice = TC.escolha(k, b); set.alarmT = 60; const l0 = led.length; let shutAt = 0, hid = 0, crouch = 0, barred = 0, keepAct = {};
    for (let i = 0; i < 240 && !(b.tranca && TC.hiders(b).length); i++) { M.viver(0.25); if (!T.dia(b) && !shutAt) shutAt = S().clock; hid = Math.max(hid, TC.hiders(b).length); crouch = Math.max(crouch, TC.hiders(b).filter(v => v.act === 'esconder').length); if (k.act) keepAct[k.act] = 1; if (i % 8 === 0) watchW(bad); }
    const ds = () => In.doorState(b, In.plan(b).entrance.door).state; if (b.tranca) barred = ds() === 'trancada' ? 1 : 0;
    const served = led.slice(l0).filter(e => e.c === 'taverna' && e.from === 'b:' + b.id && e.t > shutAt + 1).length;
    ok('v9 a guerra à porta: a taverna fecha, quem está dentro se esconde, o taverneiro tranca ou abriga pela índole', !!shutAt && served === 0 && hid >= 2 && crouch >= 1 && !!b.abrigo && b.abrigo.k === choice.k && barred === 1 && (choice.k === 'trancar' ? !!keepAct.trancar : !!keepAct.abrigar && !!keepAct.trancar),
      `${set.name}, ${guests} às mesas; o alarme: o dia fechou ${shutAt ? 'sim' : 'não'}, ${served} servidos depois; ${hid} escondidos (${crouch} agachados); ${k.name} (coragem ${(k.courage || 0).toFixed(2)}, empatia ${G.Indole.faceta(k, 'empatico').toFixed(2)}) escolheu ${b.abrigo ? b.abrigo.k : '-'} (${choice.why}); a porta ${ds()}; os atos dele: ${Object.keys(keepAct).join(', ')}`);
    // (the save in the middle: the hiding as it was, the bar kept)
    { const n0 = TC.hiders(b).length; const tr = JSON.stringify(b.tranca); const s1 = G.Save.serialize(); M.reseed(4244); G.Save.apply(JSON.parse(s1)); G.Main.mode = 'game'; M.viver(0.3); const b2 = S().buildings.get(b.id);
      ok('v9 o save no meio da guerra: quem se escondia volta escondido, a tranca fica', TC.hiders(b2).length === n0 && JSON.stringify(b2.tranca) === tr && In.doorState(b2, In.plan(b2).entrance.door).state === 'trancada', `${n0} escondidos antes, ${TC.hiders(b2).length} depois do load; a tranca ${b2.tranca ? 'mantida' : 'perdida'}`); }
    // (the raid at its door: a band that loots; the armed of the inside — G.Vg.armedFor — go out at the first blow; with none armed the
    // door gives: the hand of the proof leaves the hiders unarmed, the band many — T-1880)
    const b2 = S().buildings.get(b.id); const set2 = S().settlements.get(b2.set); const P2 = G.Fac.get(set2.fac); const Q2 = G.Fac.get(Q.id);
    const armed = TC.hiders(b2).filter(v => G.Vg.armedFor(v)).length;
    god1(() => { for (const v of TC.hiders(b2)) { v.courage = Math.min(v.courage || 0, 0.3); if (v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'arqueiro') v.role = 'agricultor'; } });
    const dr = G.Vg.door(b2); const men = [...S().villagers.values()].filter(v => G.Fac.idOfV(v) === Q2.id && v.age >= 18 && v.age < 45 && !v.captive && !v.aboard && !v.jail && !v.ug && !(v.task && v.task.type === 'band')).slice(0, 24);
    let band = null; god1(() => { for (const [i, v] of men.entries()) { const p = G.W.nearestLand(dr[0] + 3 + (i % 5), dr[1] + 2 + Math.floor(i / 5), 6); v.x = p[0] + 0.5; v.y = p[1] + 0.5; v.inside = 0; v.path = null; v.role = 'guerreiro'; v.hp = 100; } G.Politics.leaderPe(Q2).cru = 0.2; band = G.War.makeBand(Q2, P2, set2, men, 'saque', { landed: true }); });
    const l1 = led.length; let blows = 0, arromb = 0, brokeAt = 0, exposed = 0, h0 = TC.hiders(b2).length; set2.alarmT = 200;
    for (let i = 0; i < 1200 && !brokeAt; i++) { M.viver(0.25); if (men.some(v => v.act === 'arrombar')) arromb = 1; blows = Math.max(blows, (b2.tranca && b2.tranca.g) || (b2.porta && b2.porta.golpes) || 0); if (b2.porta && b2.porta.k === 'arrombada') brokeAt = S().clock; if (i % 8 === 0) watchW(bad); }
    M.viver(1); exposed = h0 - TC.hiders(b2).length; const st2 = In.doorState(b2, In.plan(b2).entrance.door).state;
    const loot = led.slice(l1).filter(e => e.c === 'saque' && e.from === 'b:' + b2.id).length;
    ok('v9 o arrombamento: o bando que saqueia força a porta trancada, contra a madeira e a tranca, e ela cede', arromb && blows >= 2 && !!brokeAt && st2 === 'arrombada' && exposed >= 1,
      `${men.length} do bando de ${Q2.name}; ${armed} armados lá dentro antes da mão da prova; ${blows} golpes na porta (força ${TC.hpOf(b2)}: a madeira e a tranca ${G.Origem.had(P2.id, 'ferro') ? 'de ferro' : 'de madeira'}); ${brokeAt ? 'arrombada' : 'NÃO cedeu'}; a porta ${st2}; ${exposed} expostos; ${loot} saques da prateleira`);
    // (the danger past — the band retreats, the god's hand: G.War.retreat —: the all clear, the door stays broken till the keeper mends it
    // with wood by the ledger, and the tavern opens again)
    god1(() => { if (G.War.bands.has(band.id)) G.War.retreat(band); set2.alarmT = 0; }); const l2 = led.length; let still = 0, mended = 0;
    // (the god's peace over the war — calm(): the fights end, the mending is the keeper's, whoever keeps the house now)
    for (let i = 0; i < 1600; i++) { calm(); M.viver(0.5); if (b2.porta) still++; else { mended = S().clock; break; } }
    const wood = led.slice(l2).filter(e => e.c === 'porta-madeira' || e.c === 'porta-conserto'); const st3 = In.doorState(b2, In.plan(b2).entrance.door).state;
    if (!mended) { const kk = T.keeperOf(b2); console.log(`   (o conserto: taverneiro ${kk ? kk.name + ' ' + (kk.task ? kk.task.type : '-') : 'nenhum'}; devido ${TC.consertoDue(b2)}; a lenha da casa ${D.free('b:' + b2.id, 'wood')}; a sobra do povo ${G.Casa.spare(set2, 'wood')}; o contexto ${JSON.stringify(TC.of(b2))})`); }
    // (and the tavern opens again: at once within its hours, else at its next opening)
    for (let i = 0; i < 900 && !T.dia(b2); i++) { calm(); M.viver(0.5); } const op3 = T.dia(b2);
    ok('v9 depois: a porta fica arrombada até o conserto, com a madeira pelo livro, e a taverna reabre', still > 4 && !!mended && wood.some(e => e.c === 'porta-madeira') && wood.some(e => e.c === 'porta-conserto') && st3 !== 'arrombada' && TC.hiders(b2).length === 0 && !b2.tranca && !!op3,
      `${still} olhadas arrombada; ${mended ? 'consertada' : 'NÃO consertada'} (${wood.map(e => e.c + ' ' + e.n).join(', ') || 'sem madeira'}); a porta ${st3}; ${TC.hiders(b2).length} escondidos; a taverna ${op3 ? 'reaberta' : 'fechada'} às ${S().time.toFixed(2)}`);
    ok('v9 o verificador', !bad.length, bad.join(' / ') || 'limpo');
  }
  // ---------------- v10 the mourning ----------------
  if (WANT('v10')) {
    base(); liveTo(0.5); const bad = [];
    const b = taverns().find(q => T.keeperOf(q)) || taverns()[0]; const fid = V.facOfSet(b.set); const f = G.Fac.get(fid); const r = S().villagers.get(f.leader);
    god1(() => G.Village.kill(r, 'old')); const lu = TC.luto(fid); const t0 = talks.length; const tDeath = S().clock;
    let sets0 = 0; const L = taverns().filter(q => V.facOfSet(q.set) === fid);
    for (const q of L) { const op = T.dia(q); if (op) sets0 += op.data.sets || 0; }
    liveTo(0.86); let sets = 0, mem = 0, lutoF = 0, guests = 0, feasts = 0;
    for (const q of L) { const op = A.all().filter(o => o.def === 'taverna' && o.at === q.id && o.data.day === S().day).pop(); if (!op) continue; const d = op.data; sets += d.sets || 0; mem += (d.atos && d.atos.brinde && d.atos.brinde.memoria) || 0; lutoF += (d.falas && d.falas.luto) || 0; guests += d.mesas || 0; if (q.festa && q.festa.dia === S().day && q.festa.discurso > tDeath) feasts++; watchW(bad); }
    const whisper = talks.slice(t0).filter(x => x.style === 'whisper').length;
    // (the new ruler drunk to when the mourning is over: the days set past, by the proof's hand)
    const rr = f.rulers[f.rulers.length - 1]; const prev = f.rulers[f.rulers.length - 2];
    god1(() => { prev.to = S().day - 2; rr.from = S().day - 2; for (const q of L) { delete q.festa; if (q.festas) q.festas = q.festas.filter(x => !/^gov:/.test(x)); } G.mod('tf.olha', 0); }); M.viver(1);
    const gov = L.filter(q => q.festa && q.festa.motivo === 'governante').length;
    ok('v10 o luto pelo governante: sem música, a conversa baixa, um brinde à memória — e o novo governante festejado depois do luto', !!lu && sets === sets0 && mem >= 1 && lutoF >= 1 && whisper >= 1 && feasts === 0 && gov >= 1,
      `${r.name} morreu (o luto: ${lu ? lu.quem : '-'}); nas ${L.length} tavernas do povo: ${sets - sets0} músicas depois, ${mem} brindes à memória, ${lutoF} falas do luto (${whisper} em voz baixa), ${feasts} festas; passado o luto, ${gov} festas do novo governante`);
    ok('v10 o verificador', !bad.length, bad.join(' / ') || 'limpo');
  }
  // ---------------- v11 the storm ----------------
  // (the same evening from the same moment, with the storm and without it: who is under the roofs of the taverns at the hour many go home,
  // and who of those caught out in the street by an open tavern's door — nearer to it than to home — goes in)
  if (WANT('v11')) {
    const caught = () => { const L = []; for (const v of S().villagers.values()) { if (v.inside || v.age < 16 || v.captive || v.aboard || v.jail || A.isBody(v) || (v.task && v.task.type === 'tavern')) continue; for (const b of taverns()) { if (!T.aberta(b) || b.set !== v.set) continue; const dr = G.Vg.door(b); const d = G.dist(v.x, v.y, dr[0], dr[1]); if (d > 14) continue; const h = v.home && S().buildings.get(v.home); const hd = h ? G.Vg.door(h) : null; if (hd && G.dist(v.x, v.y, hd[0], hd[1]) <= d) continue; L.push(v.id); break; } } return L; };
    const count = storm => { base(); liveTo(0.66); const ids = new Set(caught()); const e0 = entered.length; const S0 = S(); let most = 0;
      while (S().time < 0.8) { if (storm) { S0.weather.storm = Math.max(S0.weather.storm || 0, 40); S0.weather.rain = 0.9; } else calm(); M.viver(0.5); if (S().time > 0.76) { let n = 0; for (const b of taverns()) { const op = T.dia(b); if (op) n += Object.keys(op.data.mesa).length; } most = Math.max(most, n); } }
      const went = new Set(entered.slice(e0).filter(e => ids.has(e.v)).map(e => e.v)); return [ids.size, went.size, most]; };
    const [n0, calmN, calmM] = count(false); const [n1, stormN, stormM] = count(true);
    // (more of those caught out go in, and nobody under a roof goes out into it — a full house stays full: the tables are as many, T-1883)
    ok('v11 a tempestade: mais gente se abriga na taverna', n0 === n1 && stormN > calmN && stormM >= calmM, `das 0,66 às 0,80: às mesas depois das 0,76, ${calmM} sem chuva e ${stormM} com a tempestade (quem está fica sob o teto); de ${n0} na rua junto à porta de uma taverna aberta, mais perto dela que de casa, ${calmN} entraram sem chuva e ${stormN} com ela`);
  }
  // ---------------- v12 the feasts, one of each cause ----------------
  if (WANT('v12') || WANT('v13')) {
    const bad = []; const got = {};
    // (each cause in its own load: what the world records of it set as it happens — the conquest's town, the victory, the new ruler, the
    // town's step, the barns full, the keeper's wedding —, and the look plans the feast of it; the child and the house that prospered,
    // where the ready world has them, or by the world's own record set by the proof)
    const setups = {
      conquista: b => { const fid = V.facOfSet(b.set); const s = [...S().settlements.values()].find(q => q.fac !== fid && q.id !== b.set); if (!s) return false; const was = s.fac; s.fac = fid; s.origFac = was; s.conq = S().day; return true; },
      vitoria: b => { S().settlements.get(b.set).victory = S().day; return true; },
      governante: b => { const f = G.Fac.get(V.facOfSet(b.set)); const v = [...S().villagers.values()].find(o => G.Fac.idOfV(o) === f.id && o.age > 30 && o.id !== f.leader && !o.captive); if (!v) return false; G.Politics.endReign(f, 'mandato'); G.Politics.crown(f, v, 'eleicao', true); return true; },
      cidade: b => { const s = S().settlements.get(b.set); G.mod('tf.best.' + s.id, s.best || 0); s.best = (s.best || 0) + 1; return true; },
      colheita: b => { const fid = V.facOfSet(b.set); const f = G.Fac.get(fid); G.mod('tf.farto.' + fid, 0); const need = Math.ceil(V.cap(fid) * 0.95 - (f.stock.food || 0)); if (need > 0) V.addStock('food', need, fid, 'trigo'); return (f.stock.food || 0) >= V.cap(fid) * 0.9; },
      casamento: b => { const k = T.keeperOf(b); if (!k) return false; if (k.partner) G.Vg.unpair(k, 'prova'); const o = [...S().villagers.values()].find(q => q.g !== k.g && !q.partner && q.age >= 18 && q.age < 60 && q.set === k.set && !q.captive && !(G.Vg.relatedClose && G.Vg.relatedClose(k, q))); if (!o) return false; G.Vg.pair(k, o, 'casamento'); return true; },
      filho: b => { const k = T.keeperOf(b); if (!k) return false; let mom = k.g === 'f' ? k : S().villagers.get(k.partner); if (!mom || mom.g !== 'f') { const o = [...S().villagers.values()].find(q => q.g !== k.g && !q.partner && q.age >= 18 && q.age < 40 && q.set === k.set && !q.captive && !(G.Vg.relatedClose && G.Vg.relatedClose(k, q))); if (!o) return false; if (k.partner) G.Vg.unpair(k, 'prova'); G.Vg.pair(k, o, 'casamento'); mom = k.g === 'f' ? k : o; } const n0 = (k.kids || []).length; V.birth(mom); return (k.kids || []).length > n0; },
      prospera: b => { const h = b.ip && b.ip.h; if (!Array.isArray(h)) return false; const last = h.filter(x => x[1] === 'riqueza').pop(); h.push([S().day, 'riqueza', String(Math.min(2, (last ? +last[2] : 0) + 1))]); return true; },
    };
    if (WANT('v12')) for (const m of TF.MOTIVOS) {
      base(); let done = false;
      for (const b of taverns()) {
        if (!T.keeperOf(b)) continue;
        god1(() => { for (const q of taverns()) { delete q.festa; delete q.festaQ; } });
        if (!god1(() => setups[m](b))) continue;
        if (m === 'filho') god1(() => { delete b.festaQ; }); // (the wedding of the child's proof is not the cause looked at)
        god1(() => G.mod('tf.olha', 0)); M.viver(1); M.viver(4.5);
        if (b.festa && b.festa.motivo === m) { got[m] = b.festa.causa; done = true; break; }
      }
      if (!done) got[m] = null;
    }
    const miss = TF.MOTIVOS.filter(m => !got[m]);
    if (WANT('v12')) ok('v12 as comemorações com causa: uma de cada causa, cada uma pelo que o mundo registra', !miss.length, `${TF.MOTIVOS.filter(m => got[m]).map(m => `${m} («${got[m]}»)`).join('; ')}${miss.length ? ' — FALTARAM ' + miss.join(', ') : ''}`);
    // (one feast night in full: the speech and the chronicle, the dish, the round of the house, the bards, the decorations by the ledger,
    // the dance in a ring, the drinking match and the cheering)
    base(); const l0 = led.length, g0 = logs.length;
    god1(() => { for (const b of taverns()) { delete b.festa; TF.plan(b, 'cidade', `${S().settlements.get(b.set).name} virou cidade grande`); } });
    let ring = 0, cheer = 0, cb = 0, inMatch = 0, bardsAt = 0; let SNAPF = null;
    while (S().time < 0.85) { calm(); M.viver(0.5);
      for (const b of taverns()) { const op = T.dia(b); if (!op) continue; const d = op.data; if (d.roda) ring = Math.max(ring, d.roda.quem.length);
        for (const id of Object.keys(d.mesa)) { const v = S().villagers.get(+id); if (!v) continue; if (v.act === 'torcer') cheer++; if (v.act === 'concurso-bebida') inMatch++; if (v.act === 'play' && b.festa && b.festa.bardos.includes(v.id)) bardsAt++; }
        if (!SNAPF && d.concurso && !d.concurso.fim && d.concurso.n >= 1) SNAPF = { s: G.Save.serialize(), b: b.id, c: JSON.stringify(d.concurso.quem), f: JSON.stringify(b.festa) }; }
      if (S().time > 0.6 && (S().clock | 0) % 10 === 0) watchW(bad); }
    const fe = taverns().map(b => b.festa).filter(Boolean); const ops = A.all().filter(o => o.def === 'taverna' && o.data && o.data.day === S().day);
    const speech = ops.filter(o => o.data.atos && o.data.atos.discurso).length; const casa = led.slice(l0).filter(e => e.c === 'rodada-casa').length; const banq = ops.reduce((n, o) => n + (o.data.banquete || 0), 0);
    const enf = led.slice(l0).filter(e => e.c === 'enfeites'); const kinds = new Set(fe.flatMap(f => f.enfeites.map(e => e.k))); const tocaram = fe.reduce((n, f) => Math.max(n, (f.tocaram || []).length), 0);
    const ofTown = fe.every(f => (f.tocaram || []).every(id => { const v = S().villagers.get(id) || G.person(id); return !!v; }));
    const matches = ops.filter(o => o.data.concursoN).length; const won = ops.filter(o => o.data.atos && o.data.atos['concurso-bebida']).length; const chron = logs.slice(g0).filter(x => /^Festa na taverna/.test(x.txt)).length;
    const pratos = fe.filter(f => f.prato).length;
    if (WANT('v12')) ok('v12 a noite da festa: o discurso, o prato da festa, a rodada da casa, os bardos juntos, os enfeites pelo livro, a roda, o concurso e a torcida', speech >= 5 && chron >= 5 && casa >= 5 && (pratos === 0 || banq >= 1) && tocaram >= 2 && ofTown && enf.length >= 3 && kinds.size >= 4 && ring >= TF.RODA && matches >= 1 && won >= 1 && cheer >= 1 && inMatch >= 1,
      `${fe.length} festas: ${speech} discursos (${chron} na crônica), ${casa} rodadas da casa pelo livro, ${pratos} com o prato da festa e ${banq} pratos dele servidos, até ${tocaram} bardos juntos (${bardsAt} instantes tocando), ${enf.length} gastos de enfeites (${[...kinds].join(', ')}), a roda até ${ring}, ${matches} concursos (${won} com vencedor), ${cheer} instantes de torcida`);
    // ---------------- v13 the save in the middle of the feast ----------------
    if (WANT('v13')) {
      if (!SNAPF) ok('v13 o save no meio da festa', false, 'nenhum concurso em curso para o retrato');
      else { const fp = () => { const b = S().buildings.get(SNAPF.b); const op = T.dia(b); return JSON.stringify([b.festa && b.festa.fase, b.festa && b.festa.bardos, op && op.data.concurso && [op.data.concurso.n, op.data.concurso.rodadas, op.data.concurso.fora, op.data.concurso.vence], op && op.data.servidos, op && Object.keys(op.data.mesa).length]); };
        M.reseed(5151); G.Save.apply(JSON.parse(SNAPF.s)); G.Main.mode = 'game'; const b = S().buildings.get(SNAPF.b); const same = JSON.stringify(b.festa) === SNAPF.f && T.dia(b) && T.dia(b).data.concurso && JSON.stringify(T.dia(b).data.concurso.quem) === SNAPF.c;
        M.viver(20); const A1 = fp(); M.reseed(5151); G.Save.apply(JSON.parse(SNAPF.s)); G.Main.mode = 'game'; M.viver(20); const A2 = fp();
        ok('v13 o save no meio da festa: a festa e o concurso voltam como eram, e o mesmo save vive o mesmo futuro', !!same && A1 === A2, `a festa e o concurso ${same ? 'iguais' : 'DIFERENTES'} depois do load; 20 s depois, duas vezes: ${A1 === A2 ? 'iguais' : 'DIFERENTES ' + A1 + ' / ' + A2}`); }
    }
    ok('v12 o verificador', !bad.length, bad.join(' / ') || 'limpo');
  }
  // ---------------- v14 the slate ----------------
  if (WANT('v14')) {
    base(); liveTo(0.62); const bad = [];
    // (a regular of a house with coin at its tables, and the keeper trusts him: his purse emptied by the proof's hand — by the ledger)
    // (the ready world's houses remember few nights yet: the proof's hand writes one of the town as a regular of five nights, «o de sempre» the
    // house's drink — the memory the closing writes, b.freg)
    let pick = null; for (const b of taverns()) { const op = T.dia(b); const k = T.keeperOf(b); if (!op || !k || !G.Eco.coinage(V.facOfSet(b.set))) continue; const c = [...S().villagers.values()].find(o => o.set === b.set && o.age >= 18 && o.age < 60 && !o.inside && !o.captive && !o.aboard && G.Eco.coinRef(o) !== G.Eco.coinRef(k) && !(o.task && o.task.pri >= 2)); if (!c) continue; god1(() => { const L = b.freg || (b.freg = []); const dk = T.drinkOn(b) || 'cerveja'; L.push([c.id, 5, S().day - 1, { [dk]: 4 }]); }); pick = { b, c, k }; break; }
    if (!pick) ok('v14 o fiado', false, 'nenhum freguês de sempre numa taverna com moeda');
    else { const { b, c, k } = pick; const l0 = led.length;
      god1(() => { G.Lacos.ato(c, k, 'cumpriu'); G.Lacos.ato(c, k, 'cumpriu'); const n = D.get(G.Eco.coinRef(c), 'moedas'); if (n > 0) D.move(G.Eco.coinRef(c), 'f:' + V.facOfSet(b.set), 'moedas', n, { code: 'prova', by: c.id }); });
      const okF = T.fiadoOk(b, c, T.PRICE.drink, k);
      // (he goes to the tavern by his own wish — the proof calls the errand, as the evening would)
      god1(() => G.Vg.setTask(c, { type: 'tavern', id: b.id, op: T.dia(b).id, pri: 0.5, st: 0 }));
      for (let i = 0; i < 240 && !led.slice(l0).some(e => e.c === 'fiado' && e.to === 'v:' + c.id); i++) M.viver(0.5);
      const onSlate = led.slice(l0).filter(e => e.c === 'fiado' && e.to === 'v:' + c.id).length; const q = T.fiado(b, c); const mk = G.Lacos.lembra(c, k.id).some(x => x[0] === 'deve');
      ok('v14 o fiado: o freguês de sempre sem moeda bebe na conta, que a casa guarda no livro e nos laços', okF && onSlate >= 1 && !!q && q.deve > 0 && mk, `${c.name} em ${S().settlements.get(b.set).name}, de ${k.name}: confia ${okF ? 'sim' : 'não'}; ${onSlate} rodadas fiadas pelo livro; a conta ${q ? q.deve : '-'}; a dívida nos laços ${mk ? 'sim' : 'não'}`);
      // (the term past — the debt's day set back by the proof's hand —: the town's day breaks it, the keeper's ties mark him; at the
      // closing the house's book says so, and the keeper serves him no more till he pays)
      god1(() => { for (const x of c.marcas || []) if (x[0] === 'deve' && x[1] === k.id) x[2] = S().day - 20; G.Convivio.dayOf(S().settlements.get(c.set)); const op = T.dia(b); if (op) T.close(op, 'prova'); });
      const cal = T.caloteiro(b, c); const traiu = G.Lacos.lembra(k, c.id).some(x => x[0] === 'traiu');
      // (the next night: he comes — his purse empty again by the proof's hand: the day's wages would pay the slate —, and is not served)
      const d0 = S().day; while (S().day === d0 || S().time < 0.6) { calm(); M.viver(1); }
      const b2 = b, c2 = c, k2 = T.keeperOf(b2) || k;
      god1(() => { const n = D.get(G.Eco.coinRef(c2), 'moedas'); if (n > 0) D.move(G.Eco.coinRef(c2), 'f:' + V.facOfSet(b2.set), 'moedas', n, { code: 'prova', by: c2.id }); });
      const l1 = led.length; const nao0 = talks.length;
      // (with the keeper at his counter: the slate is his — one serving oneself in his absence is not served by him)
      for (let i = 0; i < 240 && !(T.dia(b2) && T.serving(b2)); i++) { calm(); M.viver(0.5); }
      god1(() => G.Vg.setTask(c2, { type: 'tavern', id: b2.id, op: T.dia(b2).id, pri: 0.5, st: 0 })); for (let i = 0; i < 80 && !talks.slice(nao0).some(x => /deve|Fiado não/.test(x.txt)); i++) M.viver(0.5);
      const servedC = led.slice(l1).filter(e => (e.c === 'taverna' || e.c === 'fiado') && e.to === 'v:' + c2.id && e.k !== 'moedas').length; const said = talks.slice(nao0).some(x => /deve|Fiado não/.test(x.txt));
      // (with the coins for it: he pays the slate at the counter, by the ledger, and the ties are put right)
      god1(() => { D.move('f:' + V.facOfSet(b2.set), G.Eco.coinRef(c2), 'moedas', 4, { code: 'prova', by: c2.id }); G.Vg.setTask(c2, { type: 'tavern', id: b2.id, op: T.dia(b2).id, pri: 0.5, st: 0 }); c2.tavDay = -1; });
      for (let i = 0; i < 240 && !(T.dia(b2) && T.serving(b2)); i++) { calm(); M.viver(0.5); }
      const l2 = led.length; for (let i = 0; i < 120 && T.fiado(b2, c2); i++) M.viver(0.5);
      const paid = led.slice(l2).filter(e => e.c === 'fiado' && e.k === 'moedas' && e.from === G.Eco.coinRef(c2)).length; const pagou = G.Lacos.lembra(k2, c2.id).some(x => x[0] === 'pagou');
      ok('v14 a conta com prazo: quem não paga fica marcado nos laços do taverneiro e não é servido até pagar; com o dinheiro, paga', cal && traiu && servedC === 0 && said && paid >= 1 && !T.fiado(b2, c2) && pagou,
        `passado o prazo: caloteiro ${cal ? 'sim' : 'não'}, «traiu» nos laços ${traiu ? 'sim' : 'não'}; na noite seguinte ${servedC} rodadas servidas a ele${said ? ' («pague a conta»)' : ''}; com o dinheiro: ${paid} pagamentos pelo livro, a conta ${T.fiado(b2, c2) ? 'aberta' : 'zerada'}, «pagou» ${pagou ? 'sim' : 'não'}${paid ? '' : ` (ele: ${c2.task ? c2.task.type + ':' + c2.task.st : '-'}${T.dia(b2) && T.dia(b2).data.mesa[c2.id] ? ', à mesa st ' + T.dia(b2).data.mesa[c2.id].st + (T.dia(b2).data.mesa[c2.id].out ? ' out ' + T.dia(b2).data.mesa[c2.id].out : '') : ', fora da mesa'}; dentro ${c2.inside === b2.id ? 'sim' : 'não'}; ${G.Eco.purse(c2)} moedas; o taverneiro ${k2.task ? k2.task.type + ':' + k2.task.st : '-'})`}`);
      watchW(bad); ok('v14 o verificador', !bad.length, bad.join(' / ') || 'limpo'); }
  }
  // ---------------- v15 the arm wrestle ----------------
  // (a feast night: at each table of three or more, two are given by the proof's hand the heavy trade, the drink of the night and the índole
  // for it — T-1882 —; the world decides when, at which table and who wins)
  if (WANT('v15')) {
    base(); const bad = []; god1(() => { for (const b of taverns()) { delete b.festa; TF.plan(b, 'cidade', 'a cidade cresceu'); } }); liveTo(0.62);
    const pairs = [];
    for (let i = 0; i < 40 && !pairs.length && S().time < 0.78; i++) { M.viver(1);
      for (const b of taverns()) { const op = T.dia(b); if (!op) continue; const by = {}; for (const id of Object.keys(op.data.mesa)) { const m = op.data.mesa[id]; const v = S().villagers.get(+id); if (!v || m.corpo || !m.g || v.age < 20 || v.age > 50) continue; (by[m.g] = by[m.g] || []).push(v); } for (const g of Object.keys(by)) if (by[g].length >= 3 && pairs.length < 6) pairs.push({ b, g, L: by[g] }); } }
    if (!pairs.length) ok('v15 a queda de braço', false, 'nenhuma mesa com três');
    else { const l0 = led.length;
      god1(() => { for (const { L } of pairs) for (const v of L.slice(0, 2)) { v.role = 'ferreiro'; v.hp = 100; v.energy = Math.max(v.energy, 80); v.drinks = Math.max(2, v.drinks || 0); const I = v.indole; if (I) { I[0] = Math.max(I[0], 80); I[6] = Math.max(I[6], 85); I[2] = Math.min(I[2], 30); } } });
      let w = null, wb = null, fim = null, seenA = 0, seenT = 0, seenR = 0;
      for (let i = 0; i < 600 && !fim; i++) { M.viver(0.5);
        for (const { b, g, L } of pairs) { const op = T.dia(b); if (!op) continue; const x = (op.data.braco || {})[g]; if (x && !w) { w = x; wb = { b, g, L }; } }
        if (w) { const op = T.dia(wb.b); const P = [S().villagers.get(w.a), S().villagers.get(w.b)]; if (P.some(v => v && v.act === 'queda-de-braco')) seenA++; if (op && !w.fim) { const by = Object.keys(op.data.mesa).filter(id => String(op.data.mesa[id].g) === String(wb.g) && +id !== w.a && +id !== w.b).map(id => S().villagers.get(+id)).filter(Boolean); if (by.length) seenR++; if (by.some(v => v.act === 'torcer')) seenT++; } if (w.fim) fim = w; if (!op) break; }
        if (!w && S().time > 0.86) break; }
      const bet = led.slice(l0).filter(e => e.c === 'aposta-braco').length; const op = wb && (T.dia(wb.b) || A.all().filter(o => o.def === 'taverna' && o.at === wb.b.id).pop());
      const A1 = w && S().villagers.get(w.a), C1 = w && S().villagers.get(w.b);
      ok('v15 a queda de braço: dois fortes à mesa, pela índole e pela bebida, a aposta pelo livro, a mesa torcendo', !!w && !!fim && seenA >= 1 && seenT >= 1 && !!(op && op.data.atos && op.data.atos.torcer && op.data.atos.torcer.braco >= 1) && (w.vence === w.a || w.vence === w.b) && (!w.aposta || bet >= 1) && !!(op && op.data.atos && op.data.atos['queda-de-braco']),
        `${pairs.length} mesas com dois fortes; ${w ? `${A1 ? A1.name : '-'} (força ${A1 ? TF.forca(A1) : '-'}) e ${C1 ? C1.name : '-'} (${C1 ? TF.forca(C1) : '-'}), a queda de braço (${w.por}), venceu ${S().villagers.get(w.vence) ? S().villagers.get(w.vence).name : '-'}; aposta ${w.aposta} (${bet} pelo livro)` : 'NENHUMA'}; ${seenA} instantes no ato, ${seenT} com a mesa torcendo (${seenR} com alguém mais à mesa); a torcida contada ${op && op.data.atos && op.data.atos.torcer ? op.data.atos.torcer.braco || 0 : 0}×`);
      watchW(bad); ok('v15 o verificador', !bad.length, bad.join(' / ') || 'limpo'); }
  }
  // ---------------- v16 the context: the fire close by, the hunger, the sickness, the town's feast ----------------
  if (WANT('v16')) {
    base(); liveTo(0.64); const bad = [];
    const b = fullest(); const op = T.dia(b); const n0 = Object.keys(op.data.mesa).length; const fid = V.facOfSet(b.set); const f = G.Fac.get(fid);
    // (the fire next to its lot: the day shuts, everyone out — none hides —, and it does not open while it burns)
    const tile = G.W.idx(b.x + b.w + 1, b.y); god1(() => { S().fire[tile] = 0.9; }); M.viver(1.5);
    const out = !T.dia(b) && TC.hiders(b).length === 0; let reopen = 0; for (let i = 0; i < 10; i++) { god1(() => { S().fire[tile] = 0.9; }); M.viver(0.5); if (T.dia(b)) reopen++; }
    god1(() => { S().fire[tile] = 0; });
    ok('v16 o fogo perto: todos saem e a taverna não reabre enquanto arde', out && !reopen, `${n0} às mesas; o fogo ao lado: o dia fechou e ninguém se escondeu ${out ? 'sim' : 'NÃO'}; ${reopen} reaberturas com o fogo`);
    // (the people's hunger: no plate on the menu, none bought for the shelf; the drink of the shelf)
    base(); liveTo(0.62); const b2 = fullest(); const fid2 = V.facOfSet(b2.set); const f2 = G.Fac.get(fid2); const k2 = T.keeperOf(b2);
    god1(() => { const keep = Math.floor(G.Fac.pop(fid2) * 2.5 * 0.5); const n = Math.max(0, Math.floor((f2.stock.food || 0) - keep)); if (n > 0) D.use('f:' + fid2, 'food', n, { code: 'prova' }); });
    // (the context is read once a moment)
    M.viver(0.1); const l0 = led.length; const menuFood = T.menu(b2).some(x => x.k === 'food'); const carta = T.cartaOf(b2).some(x => x.sort === 'comer' && x.ok); M.viver(30);
    const bought = led.slice(l0).filter(e => e.from === 'f:' + fid2 && e.to === 'v:' + (k2 && k2.id) && e.k === 'food').length;
    ok('v16 a fome do povo: sem comida na taverna, e a bebida pelo estoque', TC.fome(b2) && !menuFood && !carta && bought === 0, `a fome ${TC.fome(b2) ? 'sim' : 'não'}; o prato no cardápio ${menuFood ? 'sim' : 'não'}, na carta ${carta ? 'sim' : 'não'}; ${bought} compras de comida para a prateleira; a bebida: ${T.menu(b2).filter(x => x.k !== 'food').map(x => x.k).join(', ') || 'nenhuma'}`);
    // (the sickness of the town: the sick do not go, the others fewer; the town's feast: more)
    // (no feast at all for the baseline: the tavern's, and the town's afterglow of its last festival, set.feast)
    base(); liveTo(0.6); const b3 = fullest(); const s3 = S().settlements.get(b3.set); god1(() => { delete b3.festa; s3.feast = 0; }); M.viver(0.1);
    // (of the town, the ones whose wish is not at either end — the share of the nights moves in the middle)
    const folk = [...S().villagers.values()].filter(v => v.set === s3.id && v.age >= 16 && !v.captive && !v.inside && T.wish(v, b3) > 0.05 && T.wish(v, b3) < 0.6);
    const w0 = folk.slice(0, 40).reduce((n, v) => n + T.wish(v, b3), 0);
    god1(() => { for (const v of folk.slice(0, Math.ceil(folk.length * 0.15))) v.sick = 60; }); M.viver(0.1); // (the context is read once a moment)
    const sickW = folk.slice(0, Math.ceil(folk.length * 0.15)).reduce((n, v) => n + T.wish(v, b3), 0); const w1 = folk.slice(0, 40).reduce((n, v) => n + (v.sick > 0 ? 0 : T.wish(v, b3)), 0);
    god1(() => { for (const v of folk) v.sick = 0; s3.feast = 140; }); M.viver(0.1); // (the feast of the town: a victory's, going on)
    const w2 = folk.slice(0, 40).reduce((n, v) => n + T.wish(v, b3), 0);
    ok('v16 a doença na cidade: pouca gente, e os doentes nenhum; a festa da cidade: a taverna cheia', sickW === 0 && w1 < w0 && w2 > w0, `a vontade de 40 da cidade: ${w0.toFixed(1)} sem doença; com 15% doentes, ${w1.toFixed(1)} (os doentes ${sickW.toFixed(1)}); no dia da festa da cidade, ${w2.toFixed(1)}`);
    watchW(bad); ok('v16 o verificador', !bad.length, bad.join(' / ') || 'limpo');
  }
  // ---------------- v17 two who come in at the same step of the skip: two seats (L-1980) ----------------
  if (WANT('v17')) {
    base(); liveTo(0.62); const b = taverns().find(q => T.dia(q) && In.freeCount(q, ['sentar', 'comer']) >= 2); const op = T.dia(b);
    const two = [...S().villagers.values()].filter(v => v.age >= 18 && !v.inside && v.set === b.set && !v.captive && !v.aboard && !(v.task && v.task.pri >= 2)).slice(0, 2);
    const got = []; G.Skip.on = true; G.part += 1000; G.inSim++;
    try { for (const v of two) { G.Vg.setTask(v, { type: 'tavern', id: b.id, op: op.id, pri: 0.5, st: 0 }); const pl = In.hold(v, b, ['sentar', 'comer'], null, 1); got.push(pl ? pl.item + '#' + pl.q : 'nenhum'); v.task.use = pl ? pl.use : 'sentar'; G.Vg.enter(v, b, v.task); } }
    finally { G.inSim--; G.Skip.on = false; }
    const dup = QA.check().filter(q => q.sys === 'taverna' && /tomado por/.test(q.msg)).length;
    ok('v17 dois que entram no mesmo passo do salto: dois banquinhos', got[0] !== got[1] && got[0] !== 'nenhum' && !dup, `${got.join(' e ')}; o verificador: ${dup ? dup + ' lugares tomados por dois' : 'limpo'}`);
  }
}
const er = M.erros(); const errs = Object.keys(er.mod).length + er.console.length;
ok('sem erros', !errs, errs ? JSON.stringify(er).slice(0, 300) : 'nenhum erro de módulo nem aviso no console');
console.log(`(${Math.round(clock() - c0)} s de máquina)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: taverna-vida');
process.exit(fails.length ? 1 : 0);
