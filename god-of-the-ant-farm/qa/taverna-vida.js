// taverna-vida: a vida da taverna à noite (os interiores 2.0, P7 — D-760 a D-766), em Node, pelo qa/nodemundo.js, no mundo pronto
// (a metrópole): as pessoas pelas tarefas delas, a hora delas, a vontade de cada uma, o dinheiro das casas e o estoque do povo.
//  v1 uma noite inteira: quantos estão em cada taverna à noite, quantos sentados à mesa (sempre sobre o assento), quantos servidos
//     à mesa pelo taverneiro (a caneca das mãos dele à do freguês, paga ali), quantas músicas e com que instrumento (o do povo, do
//     couro que o povo teve), quantos entraram andando da porta e saíram andando até ela, quantas trocas de lugar sem motivo (nenhuma),
//     a porta aberta enquanto a taverna atende — e o verificador limpo
//  v2 um save e um load no meio da noite: cada freguês volta ao seu banquinho, e o mesmo save carregado duas vezes vive o mesmo futuro
//  v3 a pessoa que morre sentada: sai da mesa e do livro do dia, ninguém fica no lugar dela por ela, a caneca não some sem linha
//  v4 o deus tira a bebida do estoque: nada servido do nada; quem tem companhia fica à mesa, quem está só vai para casa; e a vontade
//     da noite sem bebida — só o faminto inteira, e só onde há prato (L-2142)
//  v5 o taverneiro preso: ninguém mais servido pelas mãos dele; quem espera se serve no balcão; o dia fecha sem ele e ninguém fica
//  v7 a taverna viva (D-806 a D-810), na mesma noite da v1: cada ato novo — o brinde, os ossinhos, a dança, as palmas, o canto, o
//     cochilo, a mesa limpa, as canecas recolhidas, a gorjeta, a expulsão, o fechamento — contado com a sua causa no livro do dia e
//     visto nas pessoas; a conversa das mesas: cada fala com a sua fonte (o boato que a pessoa sabe, a festa, a guerra, a colheita,
//     a bebida) — nenhuma solta —, e as canecas e os pratos deixados nas mesas até o taverneiro recolher
//  v8 a briga passada do primeiro sangue: o taverneiro, se é de pôr para fora, põe o brigão na rua — o ato de dois —, que não volta
//  e nenhum erro de módulo nem aviso no console.
//   node qa/taverna-vida.js [mundo]          (≈ 3 min; a noite inteira é a v1 — as outras partem de um retrato dela)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js', 'qa/taverna-vida-inv.js'] });
const D = G.Depot, A = G.Act, T = G.Taverna, In = G.Interiors, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna-vida ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
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
const TALK = ['mesa_festa', 'mesa_guerra', 'mesa_colheita', 'mesa_bebida'].map(k => [k, tpl(k)]);
const OWN = ['pedir_taverna', 'sem_servico', 'sem_dinheiro', 'rodada_mesa', 'gorjeta_obrigado', 'musica_sim', 'musica_nao', 'acabou', 'cheia'].map(k => [k, tpl(k)]);
{ const say0 = G.Talk.say; G.Talk.say = function (v, txt) {
  if (v && v.task && v.task.type === 'tavern' && v.inside) { let why = null; const Bo = G.Boatos;
    if (Bo) for (const r of Bo.list()) { const how = Bo.sabe(v, r); if (how && Bo.frase(r, Bo.deQuem(v, r), how) === txt) { why = 'boato'; break; } }
    if (!why) for (const [k, L] of TALK) if (L.some(re => re.test(txt))) { why = k; break; }
    if (!why) for (const [k, L] of OWN) if (L.some(re => re.test(txt))) { why = 'taverna:' + k; break; }
    said.push({ id: v.id, txt, why, drunk: !!(G.Ebrio && G.Ebrio.alegre(v)) }); }
  return say0.apply(this, arguments); }; }
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
// (a place's key — the piece and its place —, and the errand's phase: a place that changes with the same phase is a push)
const placeKey = pl => (pl ? (pl.it ? pl.item + ':' + pl.q : pl.use) : '-');
const phaseOf = v => { const t = v.task; return t ? `${t.type}:${t.st}:${t.use || ''}:${t.near || ''}` : '-'; };

// ---------------- v1 the whole night ----------------
let SNAP = null; const shot = {}; // (the snapshot for the other cases: the tables fullest after 0,66)
{
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
    console.log(`   as falas das mesas: ${Object.keys(by).map(k => k + ' ' + by[k]).join(', ')}; no livro: ${JSON.stringify(falas)}${loose.length ? '; SOLTAS: ' + loose.slice(0, 3).map(x => '«' + x.txt + '»').join(' ') : ''}`);
    if (talk.length) console.log(`   (por exemplo: ${talk.slice(0, 4).map(x => '«' + x.txt + '»').join(' ')})`);
    ok('v7 a conversa das mesas fala do mundo: cada fala com a sua fonte', talk.length >= 5 && !loose.length && !soberJ && Object.keys(falas).every(w => G.Taverna.WHY_FALA.includes(w)),
      `${talk.length} falas das mesas (${Object.keys(falas).map(w => w + ' ' + falas[w]).join(', ')}), ${loose.length} sem causa, ${soberJ} brincadeiras de bêbado ditas sóbrio`);
  }
}

// ---------------- v6 the way from the door to each seat ----------------
// (the plan's walk, as the drawing walks it — In.pathIn —: every leg on the floor one walks, the first from the door too — never
// round the jamb of the doorway, L-1920 —; the last only onto the seat's piece)
{
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
    // (and the night's wish by the shelf: with no drink only the hungry go at their whole wish, for the plate — and only where there is a
    // plate: the god takes the food too, and the hungry one wants it as much as the fed one, L-2142)
    const w = [...S().villagers.values()].find(q => q.set === b.set && q.age >= 20 && q.age < 50 && !q.captive && !q.aboard); let wl = 'ninguém da cidade', wok = false;
    if (w) { const h0 = w.hunger; const wf = h => { w.hunger = h; return T.wish(w, b); };
      god(() => { for (const k of DR) { const n = D.get(ref, k); if (n > 0) D.use(ref, k, n, { code: 'deus', part: true }); } }); // (what came back since: taken again)
      const fed = wf(5), hungry = wf(60), food = D.free(ref, 'food');
      god(() => { const n = D.get(ref, 'food'); if (n > 0) D.use(ref, 'food', n, { code: 'deus', part: true }); });
      const fed0 = wf(5), hungry0 = wf(60); w.hunger = h0;
      wok = (food < 1 || hungry > fed + 1e-9) && Math.abs(hungry0 - fed0) < 1e-9;
      wl = `sem bebida: com ${Math.round(food * 100) / 100} de comida na prateleira o faminto ${Math.round(hungry * 100) / 100} e o saciado ${Math.round(fed * 100) / 100}; sem comida também, o faminto ${Math.round(hungry0 * 100) / 100} e o saciado ${Math.round(fed0 * 100) / 100}`; }
    ok('v4 a vontade sem nada para servir', wok, `${w ? w.name + ' #' + w.id + ', ' : ''}${wl}`);
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
const er = M.erros(); const errs = Object.keys(er.mod).length + er.console.length;
ok('sem erros', !errs, errs ? JSON.stringify(er).slice(0, 300) : 'nenhum erro de módulo nem aviso no console');
console.log(`(${Math.round(clock() - c0)} s de máquina)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: taverna-vida');
process.exit(fails.length ? 1 : 0);
