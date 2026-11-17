// feicao-inv: as regras do verificador para o genoma e a feição (22a — D-551 a D-553). O genoma é o que se vê de uma pessoa,
// herdado; estas regras conferem, a cada olhada do verificador, contadas aqui de novo direto dos campos do mundo:
//   · toda pessoa viva tem um genoma válido (56 caracteres do alfabeto: dois alelos de seis bits para cada um dos 28 genes) — S3;
//   · cada alelo de quem nasceu de pais que o mundo lembra e que têm genoma vem de um deles (o da mãe e o do pai, ou a um passo
//     de mutação deles): pega quem escrever o genoma à mão — S2;
//   · os mortos do registro guardam o genoma que tinham (o pai morto antes do parto ainda passa os genes) — S3;
//   · a feição desenhada (G.Feicao, onde o 3D está) tem números: a cor de cada um é uma cor e a altura fica nos ±8% — S4.
// Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ge = G.Genoma; if (!Ge || !s || !s.villagers) return;
    let bad = 0, kin = 0, ex = '', ek = '';
    for (const v of s.villagers.values()) {
      if (!Ge.valid(v.genoma)) { if (!bad++) ex = `${v.name} #${v.id} (${typeof v.genoma === 'string' ? v.genoma.length + ' caracteres' : String(v.genoma)})`; continue; }
      const m = v.mother ? G.person(v.mother) : null, f = v.father ? G.person(v.father) : null;
      if (m && f && Ge.valid(m.genoma) && Ge.valid(f.genoma) && !Ge.fromParents(v.genoma, m.genoma, f.genoma)) { if (!kin++) ek = `${v.name} #${v.id}`; }
    }
    if (bad) add('genoma', 3, `${bad} pessoa(s) viva(s) sem um genoma válido — ${ex}`);
    if (kin) add('genoma', 2, `${kin} pessoa(s) com um alelo que não vem do pai nem da mãe (o genoma escrito à mão?) — ${ek}`);
    let dead = 0, ed = ''; for (const r of s.dead.values()) if (!Ge.valid(r.genoma)) { if (!dead++) ed = `${r.name} #${r.id}`; }
    if (dead) add('genoma', 3, `${dead} morto(s) do registro sem o genoma que tinham — ${ed}`);
    const F = G.Feicao; if (!F) return;
    let n = 0; for (const v of s.villagers.values()) {
      if (n++ > 40) break; const o = F.of(v); if (!o) continue;
      if (!/^#[0-9a-f]{6}$/.test(o.skin) || !/^#[0-9a-f]{6}$/.test(o.hair) || !/^#[0-9a-f]{6}$/.test(o.iris) || !(Math.abs(o.alt - 1) <= 0.0801)) { add('genoma', 4, `a feição desenhada de ${v.name} #${v.id} sem números (pele ${o.skin}, cabelo ${o.hair}, íris ${o.iris}, altura ×${o.alt})`); break; }
    }
  });
})();
