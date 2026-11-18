// feicao-inv: as regras do verificador para o genoma e a feição (22a — D-551 a D-553). O genoma é o que se vê de uma pessoa,
// herdado; estas regras conferem, a cada olhada do verificador, contadas aqui de novo direto dos campos do mundo:
//   · toda pessoa viva tem um genoma válido (56 caracteres do alfabeto: dois alelos de seis bits para cada um dos 28 genes) — S3;
//   · cada alelo de quem nasceu de pais que o mundo lembra e que têm genoma vem de um deles (o da mãe e o do pai, ou a um passo
//     de mutação deles): pega quem escrever o genoma à mão — S2 (num save de antes do genoma, as cores de quem já tinha nascido
//     são as que ele tinha: os genes da cor só de quem nasceu depois, L-1674);
//   · os mortos do registro guardam o genoma que tinham (o pai morto antes do parto ainda passa os genes) — S3;
//   · a feição desenhada (G.Feicao, onde o 3D está) tem números: a cor de cada um é uma cor e a altura fica nos ±8% — S4;
//   · a forma desenhada (os pesos dos alvos, D-554) fica na caixa — S4 —, e o coto e a barriga da gravidez só com a causa no mundo
//     (o membro perdido, v.lost; a gravidez, v.preg) — S3;
//   · a memória dos retratos do painel do deus (G.Retrato3D, D-645) não passa do teto — S4.
// Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ge = G.Genoma; if (!Ge || !s || !s.villagers) return;
    let bad = 0, kin = 0, ex = '', ek = ''; const desde = G.mod ? G.mod('genoma.desde') : undefined;
    for (const v of s.villagers.values()) {
      if (!Ge.valid(v.genoma)) { if (!bad++) ex = `${v.name} #${v.id} (${typeof v.genoma === 'string' ? v.genoma.length + ' caracteres' : String(v.genoma)})`; continue; }
      const m = v.mother ? G.person(v.mother) : null, f = v.father ? G.person(v.father) : null;
      const old = Number.isFinite(desde) && !(v.born > desde); // (born before an old save got its genomes: the colour is the one it had, L-1674)
      if (m && f && Ge.valid(m.genoma) && Ge.valid(f.genoma) && !Ge.fromParents(v.genoma, m.genoma, f.genoma, old ? Ge.COLOR : null)) { if (!kin++) ek = `${v.name} #${v.id}`; }
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
    // (the shape: every weight a number in its box; a stump only on who lost that limb, a pregnant belly only on who carries a child —
    // the mark always with its cause in the world, D-556)
    const X = F.IDX; let wb = 0, wc = 0, ew = '', ec = '';
    for (const v of s.villagers.values()) { const o = F.of(v); if (!o || !o.w) continue; const w = o.w, lo = v.lost || {};
      for (let i = 0; i < w.length; i++) if (!(Math.abs(w[i]) <= 1.6)) { if (!wb++) ew = `${v.name} #${v.id} (${F.ALVOS[i].name} ${w[i]})`; break; }
      if (!(o.greyT >= 0 && o.greyT <= 0.92) || (o.greyT > 0 && (v.age || 0) < o.cinza)) { if (!wb++) ew = `${v.name} #${v.id} (o grisalho ${o.greyT} aos ${v.age | 0} anos, o gene diz ${o.cinza})`; } // (the grey only from the gene's age, D-635)
      const leg = (v.id || 0) % 2 ? X.cotoPernaD : X.cotoPernaE, other = leg === X.cotoPernaD ? X.cotoPernaE : X.cotoPernaD;
      const bad = (w[X.cotoBracoE] > 0 && !lo.armL) || (w[X.cotoBracoD] > 0 && !lo.armR) || (w[leg] > 0 && !lo.leg) || w[other] > 0 || (w[X.gestante] > 0 && !(v.preg > 0));
      if (bad && !wc++) ec = `${v.name} #${v.id}`; }
    if (wb) add('genoma', 4, `${wb} pessoa(s) com a forma desenhada fora da caixa — ${ew}`);
    if (wc) add('genoma', 3, `${wc} pessoa(s) com um coto ou a barriga da gravidez sem a causa no mundo (v.lost, v.preg) — ${ec}`);
    // (the portraits of the god's panel, D-645: the view's memory under its cap — a face kept per change of the face, never more)
    const RT = G.Retrato3D; if (RT && RT.size && RT.size() > RT.CAP) add('genoma', 4, `a memória dos retratos do painel com ${RT.size()} rostos, acima do teto de ${RT.CAP}`);
  });
})();
