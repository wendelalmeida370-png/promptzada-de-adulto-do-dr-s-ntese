// origem-inv: as regras do verificador para a origem das coisas (a parte 20h; D-440, D-441 a D-447) — carregado depois do
// qa/qa.js (QA.more), juntado a ele pelo qa/junta-inv.js. Lê os campos do mundo direto (S.orig, o livro-razão, as mochilas, as
// casas, os armazéns): um erro do próprio G.Origem não fica escondido pelo código que ele confere. O sistema «origem»:
//   · cada divisão (S.orig.p) guarda partes conhecidas do seu bem (o cereal de cada campo, o peixe, a carne…; o bronze, o ferro, a
//     pedra das ferramentas e das armas), cada uma uma contagem finita acima de zero (S2);
//   · **a divisão de cada armazém soma a contagem**: o que as partes de um armazém de povo dizem é o que ele tem, sempre que a
//     contagem não mudou desde que as partes foram feitas (S1);
//   · **nenhuma coisa de um material que o povo nunca teve**: o bronze, o ferro, o couro, o ouro de uma coisa na mochila, na casa,
//     ou das ferramentas e armas de um armazém, entrou no povo (S.orig.had: o livro sabe) (S2); e o kit que se desenha também (S2);
//   · **o livro sabe de onde vem**: o minério, o cobre, o estanho e o ouro nascem só da mina (ou da veia de uma caverna) — nada
//     feito do nada com outro código —; as ferramentas e as armas de metal nascem só da fornada da forja que gastou o seu metal (o
//     estanho da liga no bronze), ou voltam de uma coisa feita delas (S2);
//   · as armas e as ferramentas de origem desconhecida (que nada no mundo de agora faz) (S3).
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  const EPS = 1e-4;
  const ORE = { minerio: 1, cobre: 1, estanho: 1, ouro: 1 };
  const ORE_OK = { mina: 1, desfeito: 1, teste: 1 };
  const METAL_GOOD = { armas: 1, ferramentas: 1 };
  let seenN = 0, seenS = null; // (the ledger's count at the last look)
  QA.more.push(function (add, s) {
    const O = G.Origem, It = G.Itens; if (!O || !It) return;
    const o = s.orig; if (!o) return;
    const D = G.Depot;
    // (the parts: known, finite, above zero)
    for (const ref in o.p || {}) {
      const h = o.p[ref]; if (!h || typeof h !== 'object') { add('origem', 2, `${ref}: a divisão não é um objeto`); continue; }
      for (const k in h) {
        if (!O.KEPT[k]) { add('origem', 2, `${ref}: divisão de um bem que não se divide (${k})`); continue; }
        for (const t in h[k]) { const n = h[k][t]; if (!O.KEPT[k][t]) add('origem', 2, `${ref}: parte desconhecida «${t}» de ${k}`); else if (!fin(n) || n <= 0) add('origem', 2, `${ref}: ${k}.${t} = ${n}`); }
      }
    }
    // (each people's store: the parts add up to what it has — when the count has not changed since they were made)
    const T = o.t || {};
    for (const f of s.factions.values()) for (const k in O.KEPT) {
      const ref = 'f:' + f.id; const t = T[ref + '|' + k]; const now = f.stock[k] || 0;
      if (t === undefined || Math.abs(now - t) > 1e-6) continue;
      const p = (o.p[ref] && o.p[ref][k]) || {}; let sum = 0; for (const x in p) sum += p[x];
      if (Math.abs(sum - now) > 0.01) add('origem', 1, `${f.name}: a divisão de ${k} soma ${sum.toFixed(2)} e o armazém tem ${now.toFixed(2)}`);
    }
    // (no thing of a material the people never had: the bags, the houses, the stores' metal tools and weapons, the kit drawn)
    const had = (fid, m) => !!(o.had && o.had[fid] && o.had[fid][m]);
    const needs = m => m === 'bronze' || m === 'ferro' || m === 'couro' || m === 'ouro' || m === 'barro';
    const facOfSet = id => { const st = s.settlements.get(id); return st ? st.fac : 0; };
    for (const v of s.villagers.values()) {
      const fid = facOfSet(v.set); if (!fid) continue;
      const b = v.mochila;
      if (b && typeof b === 'object') for (const k in b) { if (!It.THINGS.has(k) || !(b[k] > EPS)) continue; const m = It.def(k).mat; if (needs(m) && !had(fid, m)) add('origem', 2, `${v.name} #${v.id}: ${k} na mochila, e o povo dele nunca teve ${m}`, v.id); }
      if (!G.Inv || v.age < 2) continue;
      const kit = G.Inv.kit(v); const arts = G.Inv.artsOf(v);
      for (const sl of G.Inv.SLOTS) { const k = kit[sl]; if (!k || !It.THINGS.has(k)) continue; const m = It.def(k).mat; if (!O.matOK(fid, m, arts)) add('origem', 2, `${v.name} #${v.id}: o kit desenha ${k} (${sl}), e o povo dele não tem ${m}`, v.id); }
    }
    for (const bd of s.buildings.values()) {
      const I = bd.inv; if (!I) continue; const fid = facOfSet(bd.set); if (!fid) continue;
      for (const k in I) { if (!It.THINGS.has(k) || !(I[k] > EPS)) continue; const m = It.def(k).mat; if (needs(m) && !had(fid, m)) add('origem', 2, `${bd.type} #${bd.id}: ${k} guardado, e o povo nunca teve ${m}`); }
    }
    for (const f of s.factions.values()) for (const k in METAL_GOOD) {
      const p = (o.p['f:' + f.id] && o.p['f:' + f.id][k]) || {};
      for (const m of ['bronze', 'ferro']) if (p[m] > EPS && !had(f.id, m)) add('origem', 2, `${f.name}: ${k} de ${m} no armazém, e o povo nunca teve ${m}`);
      if (p['?'] > 0.01) add('origem', 3, `${f.name}: ${p['?'].toFixed(1)} de ${k} de metal desconhecido`);
    }
    // (the ledger since the last look: the ores only from the mine; the metal tools and weapons only from the forge's batch that
    // used its metal, or back from a thing made of them)
    if (seenS !== s) { seenS = s; seenN = s.ledgerN || 0; }
    const L = D.ledger(); const from = seenN; seenN = s.ledgerN || 0;
    for (let i = 0; i < L.length; i++) {
      const e = L[i]; if (e[0] <= from) continue;
      if (e[3] !== '@mundo') continue;
      const k = e[5], code = e[8];
      if (ORE[k] && !ORE_OK[code]) add('origem', 2, `${k} feito do nada (código «${code}», para ${e[4]}): o minério só sai da mina`);
      if (METAL_GOOD[k] && code !== 'desfeito' && code !== 'teste') {
        if (code === 'fornada') {
          // (an operation let go since — kept a day and a half — can no longer be asked: only one still kept is judged)
          const op = G.Act.get(e[7]); const d = op && op.data; const R = op && G.Oficio ? G.Oficio.rx(op) : null;
          if (op && (!R || R.k !== k)) add('origem', 2, `${k} de uma fornada que não é da forja (op ${e[7]})`);
          else if (op && R.mat && !(d.usado > EPS)) add('origem', 2, `${k} de ${R.mat} de uma fornada que não gastou o seu metal (op ${op.id})`);
          else if (op && R.mat === 'bronze' && !(d.liga > EPS)) add('origem', 2, `${k} de bronze de uma fornada sem o estanho da liga (op ${op.id})`);
          else if (!op && !e[7]) add('origem', 2, `${k} de uma fornada sem operação (para ${e[4]})`);
        } else {
          // (a thing back into a store: a line just before is the thing leaving the world, with the same cause)
          let ok = false; for (let j = i - 1; j >= Math.max(0, i - 3) && !ok; j--) { const pr = L[j]; ok = pr[4] === '@uso' && pr[8] === code && It.THINGS.has(pr[5]) && (It.feitoDe(pr[5]) || []).some(x => x.k === k); }
          if (!ok) add('origem', 2, `${k} de metal feito do nada (código «${code}», para ${e[4]})`);
        }
      }
    }
  });
})();
