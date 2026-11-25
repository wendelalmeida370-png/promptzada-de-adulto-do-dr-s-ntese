// kit-inv: as regras do verificador para o motor da planta dos interiores 3 (a frente K: F1, F6, F13 — D-990 a D-993) —
// carregado depois do qa/qa.js (QA.more), como o praca-inv.js; o líder o junta (qa/junta-inv.js). Lê os registros, a tabela das
// versões e as plantas já feitas (nunca faz uma planta: o que o cache do jogo tem) — nenhuma pergunta muda o mundo:
//   · o degrau de riqueza de um registro (rec.q) é 0, 1 ou 2, só num tipo cujo uso tem a sua regra (In.wealthRule), e é o que o
//     último fato 'riqueza' dele diz — só o interiors.js o escreve, com o fato (S2; sem regra, S3: F6, regra 273);
//   · a versão de cada tipo (In.VERSION_T) é de um tipo do jogo, um inteiro de 1 para cima (S3: F13);
//   · numa planta feita, cada grupo de um posto (plan.groups) tem as suas peças na planta e cada assento dele sobre a peça — ninguém
//     sentado no ar (S2: F1, regra 271); cada zona de um posto (plan.zones) dentro do lote e com o seu papel (S3)
(function () {
  if (!window.QA || !QA.more) return;
  let turn = 0;
  const rule = function (add, s) {
    const In = G.Interiors; if (!In || !In.TYPES) return;
    const blds = [...s.buildings.values()].filter(b => b.ip && In.TYPES[b.ip.t]);
    // ---- the wealth of now (F6)
    if (In.wealthDays) for (const b of blds) {
      const r = b.ip; if (r.q === undefined) continue; const nm = `${b.type}#${b.id}`;
      if (!(Number.isInteger(r.q) && r.q >= 0 && r.q <= 2)) { add('kit', 2, `${nm}: o degrau de riqueza ${r.q} (0 a 2: F6, D-992)`); continue; }
      if (!In.wealthDays(b)) add('kit', 3, `${nm}: o degrau de riqueza ${r.q} num tipo (${r.t}) sem a regra dela (In.wealthRule: F6, D-992)`);
      let last = null; for (const f of r.h || []) if (Array.isArray(f) && f[1] === 'riqueza') last = f;
      if (last && String(r.q) !== String(last[2])) add('kit', 2, `${nm}: o degrau de riqueza ${r.q}, e o último fato dele diz ${last[2]} (dia ${last[0]}) — só o interiors.js o escreve, com o fato (regra 273)`);
    }
    // ---- each type's grammar (F13)
    if (In.VERSION_T) for (const [t, n] of Object.entries(In.VERSION_T)) if (!In.TYPES[t] || !(Number.isInteger(n) && n >= 1)) add('kit', 3, `a versão do tipo ${t}: ${n} (um tipo do jogo, um inteiro de 1 para cima: F13, D-990)`);
    // ---- the posts' groups and zones of the plans made (F1, D-993): a few each round, of the plans the game has made
    const made = blds.filter(b => In.ready && In.ready(b)); if (!made.length) return;
    for (let k = 0; k < Math.min(6, made.length); k++) {
      const b = made[(turn++ * 7919) % made.length]; const p = In.plan(b); if (!p || !p.ok) continue; const nm = `${b.type}#${b.id}`;
      const byId = new Map(p.items.map(it => [it.id, it]));
      for (const g of p.groups || []) {
        if (!g.papel) add('kit', 3, `${nm}: o grupo ${g.id} da planta sem o papel de quem senta ali (F1)`);
        for (const id of g.items || []) { const it = byId.get(id); if (!it) { add('kit', 2, `${nm}: o grupo ${g.id} (${g.papel}) com a peça ${id}, que a planta não tem`); continue; }
          const sit = it.spots.filter(sp => sp.use === 'sentar'); if (sit.some(sp => !sp.on)) add('kit', 2, `${nm}: no grupo ${g.id} (${g.papel}), ${it.kind} com um lugar de sentar fora da peça — sentado no ar (regra 271)`); }
      }
      const L = p.lot ? p.lot.w : 0;
      for (const z of p.zones || []) {
        if (!z.papel) add('kit', 3, `${nm}: a zona ${z.id} da planta sem o papel de quem trabalha ali (F1)`);
        if (!(z.r[0] >= -1e-6 && z.r[1] >= -1e-6 && z.r[2] <= L + 1e-6 && z.r[3] <= L + 1e-6)) add('kit', 3, `${nm}: a zona ${z.id} (${z.papel}) fora do lote (${z.r.join(', ')})`);
      }
    }
  };
  QA.more.push(rule); QA.kit = rule;
})();
