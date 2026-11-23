// luz-inv: as regras do verificador para a luz de dentro (os interiores 2.0, a frente P1 — D-700 a D-709, js/luz3d.js):
//   · toda chama desenhada dentro de um prédio tem a sua causa no mundo agora (S3): o fogo de um lar, de um fogão, de uma forja só
//     com o prédio queimando (G.Atmos.fire: a família dormindo, o lar apagado), o lampadário e o altar só com alguém acordado
//     dentro (G.Atmos.lit), a lamparina da decoração com o seu porquê (G.Dentro3D.fontes, P5);
//   · a luz de dentro não vaza (S2): no volume desenhado, fora dos cômodos não há fogo, e nenhum voxel de cômodo tem a luz de um
//     fogo de outro andar;
//   · o volume desenhado é o da planta e das fontes de agora, ou o próximo está assando (S3: um volume velho que ficou);
//   · nenhuma luz de verdade de um prédio acende outro (S2): a máscara de cada luz diz o volume do seu prédio.
// O que o mundo tem é contado aqui de novo das portas do mundo (G.Atmos, a planta, as portas abertas que o 3D desenha); o que está
// desenhado é perguntado ao desenho (Build3D.flames, G.Luz3D.of / state, FX3D.lamps). Só com o 3D do corpo desenhado. Carregado
// depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.luz = function () {
    const out = []; const L = G.Luz3D, B3 = G.Build3D, At = G.Atmos, S = G.S; if (!L || !B3 || !B3.opened || !At || !G.Realm || !G.Realm.on) return out;
    // (what is drawn is of the last frame: compared with the world only while the world has not stepped since)
    if (L.frameClock !== S.clock) return out;
    const open = B3.opened(); const byId = new Map(open.map(o => [o.id, o]));
    // the flames drawn inside: each with its cause now
    for (const q of B3.flames || []) {
      const bid = q[4]; if (!bid) continue; const b = S.buildings.get(bid); if (!b) { out.push([3, `uma chama desenhada dentro do prédio #${bid}, que não existe`]); continue; }
      const p = G.Space.planMade ? G.Space.planMade(b) : null; const id = String(q[5] || '').split(':').slice(1).join(':');
      const it = p && p.items.find(i => String(i.id) === id); const tag = `${b.type}#${b.id}`;
      if (it && it.fire && !At.fire(b)) out.push([3, `${tag}: o fogo de ${it.kind} desenhado aceso sem nada queimando no prédio (G.Atmos.fire)`]);
      else if (it && !it.fire && L.LAMPS[it.kind] && !At.lit(b)) out.push([3, `${tag}: ${it.kind} desenhado aceso sem ninguém acordado dentro (G.Atmos.lit)`]);
      if (!byId.has(bid)) out.push([3, `${tag}: uma chama de dentro desenhada com o prédio fechado`]);
    }
    // the volumes drawn: of the plan and the sources now (or the next one baking); no fire out of the rooms, nor of another storey
    for (const o of open) {
      const b = S.buildings.get(o.id); const p = b && G.Space.planMade ? G.Space.planMade(b) : null; if (!p) continue; const v = L.of(b); const st = L.state(o.id); const tag = `${b.type}#${b.id}`;
      if (!v || !st) continue;
      const want = L.sig(L.sources(b, p), (o.open || []).slice().sort((a, c) => a - c).join('.'));
      if (st.sig !== want && st.jsig !== want && S.clock - (st.at || 0) > 2) out.push([3, `${tag}: o volume de luz desenhado é de outras fontes ou outras portas (${String(st.sig).slice(0, 60)} ≠ ${want.slice(0, 60)})`]);
      const d = v.d1; let leak = 0; for (let q = 0; q < d.length; q += 4) if (d[q + 3] === 0 && d[q + 1] > 0) leak++;
      if (leak) out.push([2, `${tag}: o fogo vaza do volume de luz para fora dos cômodos (${leak} voxels)`]);
      if (!(st.src || []).some(s => s.forca > 0)) { let lit = 0; for (let q = 1; q < d.length; q += 4) if (d[q] > 0) lit++; if (lit) out.push([2, `${tag}: o volume tem fogo sem nenhuma fonte acesa (${lit} voxels)`]); }
    }
    // the real lights: a light of an inside lights its own building's volume only
    const F3 = G.FX3D; if (F3 && F3.lamps && F3.lampsIn) for (const l of F3.lampsIn()) { if (!l.bid || l.i <= 0) continue; const s = L.slotOf(l.bid);
      if (l.mask !== (s >= 0 ? s : 9)) out.push([2, `a luz de uma chama de dentro do prédio #${l.bid} com a máscara de outro volume (${l.mask} ≠ ${s})`]); }
    return out;
  };
  QA.more.push(function (add) { for (const [sev, msg] of QA.luz()) add('luz', sev, msg); });
})();
