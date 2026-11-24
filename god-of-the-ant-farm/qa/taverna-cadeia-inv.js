// taverna-cadeia-inv: as regras do verificador para a cadeia da taverna (a quarta onda, T3 — D-840 a D-849) — carregado depois do
// qa/qa.js (QA.more), juntado a ele pelo qa/junta-inv.js. Lê o mundo e o livro-razão (G.Depot.ledger) — nenhuma pergunta muda nada:
//   · quem tem o ofício da casa (o cozinheiro, o cervejeiro) trabalha numa taverna de pé, ou em nenhuma; e uma casa tem no máximo um
//     de cada (S2);
//   · cada brassagem e cada panelada vivas estão numa taverna de pé, numa etapa que a receita tem, com os montes finitos e o que
//     separaram na tulha e na despensa ainda lá (S2);
//   · **nada vem do nada**: a tulha só guarda cereal de comida (o grão da cerveja: 20h) e as partes do grão de cada brassagem são de
//     cereal; a cerveja e o hidromel que uma brassagem fez na prateleira não passam do que ela gastou (um jarro por grão, dois potes
//     por mel); nada nasce na despensa nem na tulha — só chega pelas mãos; o prato da panela é a comida da despensa movida à
//     prateleira da mesma casa (S2);
//   · os registros da casa bem formados: a memória das noites (b.tvo), a bebida da casa na prateleira (b.adega: não mais do que ela
//     tem), os pratos da cozinha (b.prato) (S3).
(function () {
  if (!window.QA || !QA.more) return;
  const EPS = 1e-4; const fin = Number.isFinite;
  const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
  const YIELD = { cerveja: 1, mel: 2 }; // (what a batch makes of each unit of its input, at most: act of the vat, js/taverna-oficios.js)
  let seenN = 0, seenS = null; const made = new Map(); // (the ledger's count at the last look; what each batch made since the world began)
  QA.more.push(function (add, s) {
    const TO = G.TavernaOficios, D = G.Depot, O = G.Origem; if (!TO || !D) return;
    const taverna = id => { const b = s.buildings.get(id); return b && b.type === 'taverna' && b.built ? b : null; };
    // ---- the house's people
    const posts = new Map();
    for (const v of s.villagers.values()) {
      if (v.role !== 'cozinheiro' && v.role !== 'cervejeiro') continue; const nm = `${v.name} #${v.id}`;
      if (v.job && !taverna(v.job)) add('tavcadeia', 2, `${nm} (${v.role}): trabalha no prédio #${v.job}, que não é uma taverna de pé`, v.id);
      if (v.job && !v.captive) { const k = v.job + ':' + v.role; if (posts.has(k)) add('tavcadeia', 2, `taverna #${v.job}: dois ${v.role === 'cozinheiro' ? 'cozinheiros' : 'cervejeiros'} (#${posts.get(k)} e #${v.id})`, v.id); else posts.set(k, v.id); }
    }
    // ---- the batches and the pots
    for (const op of s.acts || []) {
      if ((op.def !== 'brassagem' && op.def !== 'panelada') || !LIVE[op.st]) continue; const d = op.data || {}; const nm = `${op.def} #${op.id}`;
      const b = taverna(op.at); if (!b) { add('tavcadeia', 2, `${nm}: o lugar ${op.at} não é uma taverna de pé, e segue`); continue; }
      const R = op.def === 'brassagem' ? TO.BREW[d.k] : null; const st = op.def === 'brassagem' ? (R ? R.st : null) : TO.POT_ST;
      if (!st) { add('tavcadeia', 2, `${nm}: sem receita («${d.k}»)`); continue; }
      if (!fin(d.s) || d.s < 0 || d.s >= st.length) add('tavcadeia', 2, `${nm}: numa etapa que a receita não tem (${d.s})`);
      for (const k of ['got', 'molho', 'mosto', 'panela', 'feito', 'azedas', 'usado', 'lenha']) if (d[k] !== undefined && (!fin(d[k]) || d[k] < -EPS)) add('tavcadeia', 2, `${nm}: o monte ${k} = ${d[k]}`);
      const ref = (op.def === 'brassagem' ? 'e:' : 'k:') + b.id; const kk = op.def === 'brassagem' ? (R.in) : 'food';
      if (d.got > EPS && D.get(ref, kk) + EPS < d.got) add('tavcadeia', 2, `${nm}: separou ${d.got} de ${kk} em ${ref}, que só tem ${D.get(ref, kk)}`);
      if (op.def === 'panelada' && d.panela > d.got + EPS) add('tavcadeia', 2, `${nm}: ${d.panela} na panela de ${d.got} separados`);
      if (op.def === 'brassagem' && d.de && O) for (const t in d.de) if (!(O.FOOD[t] && O.FOOD[t].cereal)) add('tavcadeia', 2, `${nm}: a cerveja de «${t}», que não é cereal (20h)`);
    }
    // ---- the pantries: only on a tavern; the brewer's store keeps only the cereal of the food
    for (const b of s.buildings.values()) {
      for (const f of ['despensa', 'tulha']) { const L = b[f]; if (L === undefined) continue; if (b.type !== 'taverna' && L && Object.keys(L).some(k => L[k] > EPS)) add('tavcadeia', 2, `${b.type} #${b.id}: ${f} cheia num prédio que não é taverna`); if (L && typeof L === 'object') for (const k in L) if (!fin(L[k]) || L[k] < -EPS) add('tavcadeia', 2, `taverna #${b.id}: ${f}.${k} = ${L[k]}`); }
      if (b.type !== 'taverna' || !b.built) continue;
      if (O && D.get('e:' + b.id, 'food') > EPS) { const p = O.parts('e:' + b.id, 'food'); for (const t in p) if (p[t] > EPS && !(O.FOOD[t] && O.FOOD[t].cereal)) add('tavcadeia', t === '?' ? 3 : 2, `taverna #${b.id}: ${p[t].toFixed(2)} de «${t}» na tulha do cervejeiro, que só guarda cereal`); }
      const a = b.adega; if (a !== undefined) { if (!a || typeof a !== 'object') add('tavcadeia', 3, `taverna #${b.id}: a adega não é um registro`); else for (const k in a) { const e = a[k]; if (!e || !fin(e.n) || e.n < -EPS || !fin(e.q) || e.q < -EPS || e.q > 1 + EPS) add('tavcadeia', 3, `taverna #${b.id}: a ${k} da casa mal formada (${JSON.stringify(e)})`); else if (e.n > D.get('b:' + b.id, k) + 0.01) add('tavcadeia', 3, `taverna #${b.id}: ${e.n} de ${k} da casa, e a prateleira tem ${D.get('b:' + b.id, k)}`); } }
      const o = b.tvo; if (o !== undefined) { if (!o || typeof o !== 'object') add('tavcadeia', 3, `taverna #${b.id}: a memória das noites não é um registro`); else for (const k of ['n', 'ref', 'rb', 'sc', 'sb', 'dev']) if (!fin(o[k]) || o[k] < -EPS) { add('tavcadeia', 3, `taverna #${b.id}: a memória das noites com ${k} = ${o[k]}`); break; } }
      const P = b.prato; if (P !== undefined && P && typeof P === 'object') for (const t in P) if (!fin(P[t]) || P[t] < -EPS || !(O && O.FOOD[t])) { add('tavcadeia', 3, `taverna #${b.id}: o prato da cozinha de «${t}» = ${P[t]}`); break; }
    }
    // ---- the ledger since the last look: nothing born in the pantries; the beer and the mead of a batch no more than it used; the pot's
    // dishes only from the pantry to the shelf of the same house
    if (seenS !== s) { seenS = s; seenN = s.ledgerN || 0; made.clear(); }
    const L = D.ledger(); const from = seenN; seenN = s.ledgerN || 0;
    for (const e of L) {
      if (e[0] <= from) continue; const src = e[3], to = e[4], k = e[5], n = e[6], code = e[8];
      if (src === '@mundo' && typeof to === 'string' && (to[0] === 'k' || to[0] === 'e') && to[1] === ':') add('tavcadeia', 2, `${n} de ${k} nasceu na ${to[0] === 'k' ? 'despensa' : 'tulha'} da taverna #${to.slice(2)} (código «${code}»): só chega pelas mãos`);
      if (src === '@mundo' && code === 'fornada' && (k === 'cerveja' || k === 'mel')) {
        const op = G.Act.get(e[7]); if (!op || op.def !== 'brassagem') continue;
        const m = (made.get(op.id) || 0) + n; made.set(op.id, m);
        if (m > (op.data.usado || 0) * (YIELD[op.data.k] || 1) + 0.01) add('tavcadeia', 2, `brassagem #${op.id}: fez ${m.toFixed(2)} de ${k} e gastou ${op.data.usado} de ${op.data.k === 'mel' ? 'mel' : 'grão'} (nada vem do nada)`);
      }
      if (code === 'cozinha' && !(typeof src === 'string' && src[0] === 'k' && src[1] === ':' && to === 'b:' + src.slice(2))) add('tavcadeia', 2, `o prato da panela foi de ${src} para ${to}: só da despensa à prateleira da mesma casa`);
    }
  });
})();
