// inventario-inv: as regras do verificador para o que a pessoa leva e segura (a base do corpo, 20c: D-336, D-370 a D-376) —
// carregado depois do qa/qa.js (QA.more / QA.canonMore), juntado a ele pelo qa/junta-inv.js. Lê os campos do mundo direto (os
// mesmos que o G.Inv lê): um erro do próprio inventário não fica escondido pelo código que ele confere. O sistema «inventario»:
//   · a mochila (v.mochila) é um objeto de chaves conhecidas, na grafia canônica (D-370), cada uma uma contagem finita acima de
//     zero — uma coisa, inteira —, nem água nem moedas (S1/S2); poucas chaves (S3); nunca acima do limite que a pessoa já teve
//     (G.Inv.capPeak: o que os anos tiram do limite fica, D-373) (S2);
//   · o equipamento (v.equip) só tem os seus lugares, o atalho e a marca do kit (S3); cada lugar nomeia uma coisa que cabe nele
//     (S2) e **o que está equipado está na mochila** — nunca mais lugares de uma chave do que a mochila tem dela (S1); uma coisa
//     de duas mãos deixa a outra mão vazia (S2); os cinco atalhos nomeiam coisas da mochila, cada uma uma vez (S3);
//   · uma carga nos braços esvazia as mãos: carga e mão ocupada vistas juntas em duas olhadas seguidas, a 1,5 s do mundo uma
//     da outra, é mão que não largou (S2);
//   · **o livro bate**: o que cada mochila tinha na olhada anterior, mais o que o livro-razão pôs nela e menos o que tirou dela
//     desde então, é o que ela tem agora — uma mochila que muda sem o livro, ou um morto que leva as coisas sem lançamento (S1);
//   · nenhuma coisa no estoque de um povo como coisa: lá ela conta como o bem dela (D-371) (S1);
//   · as portas do inventário pedidas fora do passo do mundo (uma tela que muda o mundo sozinha) (S3).
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  const EPS = 1e-4;
  const SLOTS = ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo'], EQ = new Set(SLOTS.concat(['atalhos', 'kit']));
  let snap = null, snapS = null, snapN = 0, both = null; // (the bags at the last look, and the ledger's count then; the loads with full hands)
  QA.more.push(function (add, s) {
    const It = G.Itens, Inv = G.Inv; if (!It || !Inv) return;
    const now = new Map(); const loads = new Map();
    for (const v of s.villagers.values()) {
      const nm = `${v.name} #${v.id}`; const b = v.mochila, e = v.equip;
      if (b !== undefined) {
        if (!b || typeof b !== 'object' || Array.isArray(b)) add('inventario', 1, `${nm}: a mochila não é uma mochila (${JSON.stringify(b).slice(0, 40)})`, v.id);
        else {
          const keys = Object.keys(b); if (keys.length > 48) add('inventario', 3, `${nm}: ${keys.length} chaves na mochila`, v.id);
          const m = {};
          for (const k of keys) {
            const n = b[k];
            if (!fin(n) || n <= EPS) { add('inventario', 1, `${nm}: ${k} = ${n} na mochila`, v.id); continue; }
            if (!It.def(k) || It.canon(k) !== k) add('inventario', 2, `${nm}: chave ${k} na mochila (desconhecida ou fora da grafia canônica)`, v.id);
            else if (k === 'water' || k === 'moedas') add('inventario', 2, `${nm}: ${k} na mochila (a água vai num pote, as moedas no bolso)`, v.id);
            else if (It.THINGS.has(k) && Math.abs(n - Math.round(n)) > EPS) add('inventario', 2, `${nm}: ${n} de ${k} — uma coisa vai inteira`, v.id);
            m[k] = n;
          }
          now.set(v.id, m);
          const w = Inv.weight(v), cap = Inv.capPeak(v); if (w > cap + 0.01) add('inventario', 2, `${nm}: a mochila pesa ${w.toFixed(1)} kg, acima do que ela já aguentou (${cap} kg)`, v.id);
        }
      }
      if (e !== undefined) {
        if (!e || typeof e !== 'object' || Array.isArray(e)) { add('inventario', 1, `${nm}: o equipamento não é um equipamento`, v.id); continue; }
        for (const x in e) if (!EQ.has(x)) add('inventario', 3, `${nm}: lugar desconhecido no equipamento (${x})`, v.id);
        const bag = b && typeof b === 'object' ? b : {}; const used = {};
        for (const sl of SLOTS) {
          const k = e[sl]; if (k === null || k === undefined) continue;
          if (typeof k !== 'string' || !It.THINGS.has(k)) { add('inventario', 2, `${nm}: ${sl} = ${JSON.stringify(k)}`, v.id); continue; }
          if (!It.fits(k, sl)) add('inventario', 2, `${nm}: ${k} não cabe em ${sl}`, v.id);
          used[k] = (used[k] || 0) + 1;
        }
        for (const k in used) if (!(bag[k] + EPS >= used[k])) add('inventario', 1, `${nm}: ${k} equipado em ${used[k]} lugar(es) e ${bag[k] || 0} na mochila — o equipado está sempre na mochila`, v.id);
        const two = k => typeof k === 'string' && It.THINGS.has(k) && It.def(k).maos >= 2;
        if ((two(e.mao) && e.outra) || (two(e.outra) && e.mao)) add('inventario', 2, `${nm}: ${two(e.mao) ? e.mao : e.outra} é de duas mãos e a outra mão segura ${two(e.mao) ? e.outra : e.mao}`, v.id);
        const q = e.atalhos;
        if (q !== undefined && (!Array.isArray(q) || q.length !== 5)) add('inventario', 3, `${nm}: os atalhos não são cinco`, v.id);
        else if (Array.isArray(q)) { const seen = new Set(); for (const k of q) { if (k === null) continue; if (typeof k !== 'string' || !(bag[k] > EPS) || seen.has(k)) { add('inventario', 3, `${nm}: atalho ${JSON.stringify(k)} que não é da mochila (ou repetido)`, v.id); break; } seen.add(k); } }
        if (e.kit !== undefined && !(fin(e.kit) && e.kit >= 0)) add('inventario', 3, `${nm}: a marca do kit é ${JSON.stringify(e.kit)}`, v.id);
        if ((e.mao || e.outra) && v.carry && fin(v.carry.n) && v.carry.n > 1e-6) loads.set(v.id, s.clock);
      }
    }
    // ---- a load in the arms empties the hands (the world's round keeps it within a second)
    if (both && both.s === s) for (const [id, t] of loads) { const t0 = both.m.get(id); if (t0 !== undefined && t - t0 >= 1.5) { const v = s.villagers.get(id); add('inventario', 2, `${v ? v.name : '?'} #${id}: carrega ${v && v.carry ? v.carry.k : '?'} com ${v && v.equip ? v.equip.mao || v.equip.outra : '?'} na mão há ${(t - t0).toFixed(1)} s`, id); } }
    { const m = new Map(); for (const [id, t] of loads) m.set(id, both && both.s === s && both.m.has(id) ? both.m.get(id) : t); both = { s, m }; }
    // ---- the ledger agrees: what each bag had + what the ledger put in − what it took out = what it has now
    const L = s.ledger || []; const lastN = L.length ? L[L.length - 1][0] : (s.ledgerN || 0);
    if (snap && snapS === s && L.length && (L[0][0] <= snapN + 1 || snapN >= lastN)) {
      const delta = new Map();
      for (let i = L.length - 1; i >= 0 && L[i][0] > snapN; i--) {
        const e = L[i]; const k = e[5], n = e[6];
        for (const [ref, sg] of [[e[3], -1], [e[4], 1]]) if (typeof ref === 'string' && ref.charCodeAt(0) === 109 && ref[1] === ':') { const id = +ref.slice(2); const d = delta.get(id) || {}; d[k] = (d[k] || 0) + sg * n; delta.set(id, d); }
      }
      const ids = new Set([...snap.keys(), ...now.keys(), ...delta.keys()]);
      for (const id of ids) {
        const a = snap.get(id) || {}, b = now.get(id) || {}, d = delta.get(id) || {};
        for (const k of new Set(Object.keys(a).concat(Object.keys(b), Object.keys(d)))) {
          const want = (a[k] || 0) + (d[k] || 0), has = b[k] || 0;
          if (Math.abs(want - has) > 0.01) { const v = s.villagers.get(id); add('inventario', 1, `${v ? v.name : 'o morto'} #${id}: ${k} na mochila ${has}, o livro diz ${+want.toFixed(4)} (tinha ${a[k] || 0}, o livro moveu ${+(d[k] || 0).toFixed(4)})`, id); break; }
        }
      }
    }
    snap = now; snapS = s; snapN = lastN;
    // ---- no thing in a people's store as a thing (D-371)
    for (const f of s.factions.values()) for (const k in f.stock || {}) if (It.THINGS.has(k) || It.isThing(k)) { add('inventario', 1, `estoque de ${f.name}: ${k} como coisa (devia contar como ${(It.bemOf(It.canon(k) || k) || {}).k || 'o seu bem'})`); break; }
    for (const o of s.loose || []) if (It.THINGS.has(o.k) && Math.abs(o.n - Math.round(o.n)) > EPS) add('inventario', 3, `no chão #${o.id}: ${o.n} de ${o.k}`);
    // ---- the doors asked from outside the world's step
    if (Inv.outside && Inv.outside() > 0) add('inventario', 3, `${Inv.outside()} pedido(s) às portas do inventário fora do passo do mundo (uma tela que pede sem o Possess.apply)`);
  });
  // (the bags and the equipment go in the save with their people: the canonical state carries them, so a round trip that loses
  // a thing, a place or a quick key is seen — and so is a screen that wrote them)
  QA.canonMore.push(['inventario', () => (G.S ? [...G.S.villagers.values()].filter(v => v.mochila || v.equip).sort((a, b) => a.id - b.id).map(v => {
    const b = v.mochila || {}; const e = v.equip || {};
    return [v.id, Object.keys(b).sort().map(k => k + '=' + Math.round(b[k] * 1e4) / 1e4).join(','), ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo'].map(s => e[s] || '').join('|'), (e.atalhos || []).map(k => k || '').join('|'), e.kit || 0];
  }) : null)]);
})();
