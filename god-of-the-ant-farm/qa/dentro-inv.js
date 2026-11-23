// dentro-inv: as regras do verificador para a decoração com causa (os interiores 2.0, a frente P5 — D-740 a D-749, js/dentro3d.js e
// G.Atmos.within): o que um prédio mostra por dentro é o que o mundo tem, e está onde pode estar.
//   · nada sem causa (S3): cada coisa tem o seu porquê, e o porquê é verdade agora — a jarra só com bebida no livro, o pão só com o
//     grão de um pão na comida, o presunto só com carne, a réstia só com a horta, o saco só com grão, a caneca na mesa só de quem bebeu,
//     a panela só com o fogo cozinhando, a lamparina só com o que queimar, acesa só com alguém acordado no escuro, o pano só onde o
//     povo tece, a teia só na casa velha e sem cuidado, os riscos de carvão só dos anos de doses servidas;
//   · nada vem do nada (S2): nenhum barro onde o povo nunca teve a cerâmica, nenhum metal que ele não tem;
//   · nada flutuando (S3): o que pousa, pousa num tampo ou numa prateleira da peça (as âncoras do modelo), no chão do andar; o que
//     pende, pende de uma parede ou do soalho de cima; o que fica na parede, encostado nela;
//   · nada no caminho nem dentro de um móvel (S3): o que fica no chão fora do corredor, das portas, das escadas e de onde se usa uma
//     peça (o keepClear da planta) e fora de toda peça; o que pende do teto acima das cabeças e das peças;
//   · nada fora do lote (S2).
// O que o prédio tem é perguntado ao mundo (G.Atmos.within, e de novo aqui o livro, a comida, a gente); onde cada coisa está, ao
// G.Dentro3D.plan; onde ela pode estar, à planta (as paredes, os andares, a grade, o keepClear) — nunca às contas do dentro3d.js. As
// regras são QA.dentro(lista); o verificador olha os interiores abertos pelo 3D e, sem 3D, as tavernas e meia dúzia de casas com a
// planta já feita. Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  const FLOOR_UP = 0.012;
  const CLAY = { jarra: 1, 'jarra-alta': 1, anforeta: 1, pote: 1, caneca: 1, taca: 1, copo: 1, lamparinaBarro: 1 };
  const has = (W, list, k) => W[list].some(q => q.k === k);
  const cereal = W => W.comida.some(q => ['trigo', 'cevada', 'sorgo', 'arroz', 'milho'].includes(q.k));
  // the cause of each thing, read again from what the building has now (G.Atmos.within): true, or what is missing
  const CAUSA = {
    jarra: W => W.bebida.length || W.bens.some(q => q.como === 'potes') || 'jarra sem bebida no livro',
    'jarra-alta': W => W.bebida.some(q => q.k === 'cerveja') || 'jarra alta sem cerveja',
    anforeta: W => W.bebida.some(q => q.k === 'vinho') || W.bens.some(q => q.como === 'anforeta') || 'ânfora sem vinho nem azeite',
    pote: W => W.bebida.some(q => q.k === 'mel') || W.bens.some(q => q.como === 'pote' || q.como === 'potes') || 'pote sem hidromel, mel nem a louça da casa',
    cabaca: W => W.bebida.some(q => q.k === 'pulque') || 'cabaça sem pulque',
    'jarro-madeira': W => W.bebida.length || W.bens.some(q => ['anforeta', 'pote', 'potes'].includes(q.como)) || 'jarro sem bebida nem guardados',
    caneca: W => !!W.louca || 'caneca sem louça (nem fregueses nem moradores)', taca: W => !!W.louca || 'taça sem louça', copo: W => !!W.louca || 'copo sem louça', 'caneca-madeira': W => !!W.louca || 'caneca sem louça',
    tigela: W => W.mesa.some(q => q.prato) || W.comida.length > 0 || 'tigela sem comida', prato: W => W.mesa.some(q => q.prato) || W.comida.length > 0 || 'prato sem comida',
    'prato-peixe': W => W.mesa.some(q => q.prato === 'peixe') || has(W, 'comida', 'peixe') || 'prato de peixe sem peixe',
    pao: W => W.comida.some(q => q.pao) || 'pão sem o grão de um pão na comida', tortilhas: W => has(W, 'comida', 'milho') || W.mesa.some(q => q.prato === 'milho') || 'tortilhas sem milho',
    queijo: W => W.bens.some(q => q.k === 'queijo') || 'queijo sem queijo na casa',
    presunto: W => has(W, 'comida', 'carne') || W.bens.some(q => q.k === 'carne_seca') || 'presunto sem carne',
    'peixe-seco': W => has(W, 'comida', 'peixe') || W.bens.some(q => q.k === 'bacalhau' || q.k === 'atum') || 'peixe seco sem peixe',
    alho: W => has(W, 'comida', 'horta') || 'réstia de alho sem a horta', ervas: W => has(W, 'comida', 'horta') || 'ervas sem a horta', milho: W => has(W, 'comida', 'milho') || 'milho pendurado sem milho',
    saco: W => cereal(W) || 'saco sem grão', cesto: W => W.comida.some(q => ['fruta', 'ovos', 'marisco'].includes(q.k)) || 'cesto sem fruta, ovos nem mariscos',
    lenha: W => !!W.lenha || 'lenha sem madeira no armazém do povo',
    panela: W => !!W.cozinha || 'panela sem fogo cozinhando', caldeirao: W => (!!W.cozinha && !!W.metal) || 'caldeirão sem fogo cozinhando ou sem metal',
    lamparina: W => (!!W.luz && !!W.luz.oleo) || 'lamparina sem óleo para queimar', vela: W => (!!W.luz && W.luz.cera) || 'vela sem cera',
    'pano-dobrado': W => W.weave || W.bens.some(q => q.k === 'tecido') || 'pano onde o povo não tece',
    tapete: W => (!!W.pano && (W.pano.tapete || W.weave)) || 'tapete sem tecelagem nem riqueza', tapecaria: W => (!!W.pano && W.pano.tapecaria) || 'tapeçaria sem tecelagem nem riqueza',
    cavilha: () => true, // (the peg of what hangs: its own cause, checked with it)
    suporte: W => !!W.luz || 'suporte de lamparina sem o que queimar',
    'rabisco-a': W => W.rabiscos > 0 || 'riscos de carvão sem doses servidas', 'rabisco-b': W => W.rabiscos > 0 || 'riscos sem doses', 'rabisco-c': W => W.rabiscos > 0 || 'riscos sem doses', 'rabisco-d': W => W.rabiscos > 0 || 'riscos sem doses',
    teia: W => !!W.teia || 'teia numa casa nova ou cuidada',
  };
  QA.dentroCausa = CAUSA; // (for the guard: every thing of the file has its cause here — rule 296)
  // (the walls' faces of a storey, as the plan has them: the distance of a point to the nearest face)
  const faceDist = (p, lv, x, z) => { let d = 1e9; for (const w of p.walls) { if (w.lv !== lv) continue; const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L2 = ax * ax + az * az || 1; const t = G.clamp(((x - w.a[0]) * ax + (z - w.a[1]) * az) / L2, 0, 1); d = Math.min(d, Math.hypot(x - w.a[0] - ax * t, z - w.a[1] - az * t) - w.t / 2); } return d; };
  const ovR = (a, c, m) => a[0] < c[2] + m && c[0] < a[2] + m && a[1] < c[3] + m && c[1] < a[3] + m;
  // (what a storey keeps clear, the plan's own: the doors' ways, the stairs, the corridor — turned to the lot — and where one stands)
  const keep = (p, lv) => { const In = G.Interiors, P0 = p._P, s = p.side, L = p.lot.w; const out = [];
    if (P0 && P0.keepClear) for (const r of P0.keepClear(lv)) { const a = In.toLoc(s, L, r[0], r[1]), c = In.toLoc(s, L, r[2], r[3]); out.push([Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1])]); }
    for (const it of p.items) if (it.lv === lv) for (const sp of it.spots || []) if (!sp.on) out.push([sp.x - 0.25, sp.z - 0.25, sp.x + 0.25, sp.z + 0.25]);
    return out; };
  QA.dentro = function (list) {
    const out = []; const D = G.Dentro3D, At = G.Atmos, In = G.Interiors; if (!D || !D.plan || !At || !At.within || !G.MESH3D) return out;
    for (const b of list) {
      if (!b || !b.built || b.type === 'ruin') continue; const p = G.Space.planMade ? G.Space.planMade(b) : null; if (!p || !p.grid) continue;
      const W = At.within(b); const pl = D.plan(b, p, true); const tag = `${b.type}#${b.id}`; const L = p.lot.w; const S = D.surfacesOf ? D.surfacesOf(b, p) : [];
      const counts = {}; for (const t of pl.list) counts[t.k] = (counts[t.k] || 0) + 1;
      // what the counts may be at most, by the world: a vessel a unit of drink (and the open one), the marks, the cups of the seats
      const units = W.bebida.reduce((n, q) => n + q.n + (q.aberta ? 1 : 0), 0) + 1 + W.bens.reduce((n, q) => n + (['anforeta', 'pote', 'potes'].includes(q.como) ? q.n : 0), 0);
      const vessels = ['jarra', 'jarra-alta', 'anforeta', 'pote', 'cabaca', 'jarro-madeira'].reduce((n, k) => n + (counts[k] || 0), 0);
      if (vessels > units + 1) out.push([3, `${tag}: ${vessels} jarras e ânforas desenhadas para ${units - 1} unidade(s) de bebida e guardados`, b.id]);
      const marks = ['rabisco-a', 'rabisco-b', 'rabisco-c', 'rabisco-d'].reduce((n, k) => n + (counts[k] || 0), 0); if (marks > W.rabiscos) out.push([3, `${tag}: ${marks} riscos de carvão para ${W.rabiscos} (doses servidas: ${b.served || 0})`, b.id]);
      for (const t of pl.list) {
        const m = G.MESH3D['deco-' + t.k]; const what = `${tag}: ${t.k} (${t.on}, ${t.key})`;
        if (!m) { out.push([3, `${what} sem modelo`, b.id]); continue; }
        // the cause
        if (!t.why) out.push([3, `${what} sem o porquê`, b.id]);
        const c = CAUSA[t.k]; const r = c ? c(W, t) : 'coisa sem regra de causa no verificador'; if (r !== true && !(r && typeof r !== 'string')) out.push([3, `${what}: ${r}`, b.id]);
        if (CLAY[t.k] && !W.barro) out.push([2, `${what} de barro onde o povo nunca teve a cerâmica (nada vem do nada)`, b.id]);
        if (t.k === 'caldeirao' && !W.metal) out.push([2, `${what} de metal onde o povo não tem metal`, b.id]);
        if (t.lit && !(W.luz && W.luz.acesa)) out.push([3, `${what} acesa sem ninguém acordado no escuro (${W.luz ? W.luz.why : 'nada para queimar'})`, b.id]);
        // in the lot
        if (!(t.x > 0 && t.x < L && t.z > 0 && t.z < L)) out.push([2, `${what} fora do lote (${t.x}, ${t.z})`, b.id]);
        const l = p.levels.find(q => q.lv === t.lv); if (!l) { out.push([3, `${what} num andar que a planta não tem`, b.id]); continue; }
        const sx = t.s[0], sz = t.s[2], c0 = Math.abs(Math.cos(t.ry)), s0 = Math.abs(Math.sin(t.ry));
        const hw = (m.w / 2 * sx) * c0 + (m.d / 2 * sz) * s0, hd = (m.w / 2 * sx) * s0 + (m.d / 2 * sz) * c0; const R = [t.x - hw, t.z - hd, t.x + hw, t.z + hd];
        // nothing floating, nothing in the way, nothing in a piece
        if (t.on === 'tampo' || t.on === 'prateleira') {
          const it = p.items.find(q => q.id === t.it); if (!it) { out.push([3, `${what} sobre uma peça que a planta não tem`, b.id]); continue; }
          if (!(t.x > it.r[0] - 0.06 && t.x < it.r[2] + 0.06 && t.z > it.r[1] - 0.06 && t.z < it.r[3] + 0.06)) out.push([3, `${what} fora do tampo da sua peça (${it.kind})`, b.id]);
          if (!S.some(s => s.it === it && Math.abs(s.y - t.y) < 0.02)) out.push([3, `${what} flutuando: a ${t.y} m, sem tampo nem prateleira de ${it.kind} a essa altura`, b.id]);
        } else if (t.on === 'chao') {
          if (Math.abs(t.y - (l.y + FLOOR_UP)) > 0.02) out.push([3, `${what} flutuando: a ${(t.y - l.y).toFixed(3)} m do chão`, b.id]);
          const C = In.CELL; const cell = In.cell(b, t.lv, t.x, t.z); if (cell !== C.FLOOR && cell !== C.DOOR) out.push([3, `${what} sobre o que não é chão (${cell})`, b.id]);
          if (t.k !== 'tapete') {
            for (const it of p.items) if (it.lv === t.lv && (it.parts || [it.r]).some(q => ovR(R, q, -0.015))) { out.push([3, `${what} dentro de ${it.kind}`, b.id]); break; }
            if (keep(p, t.lv).some(q => ovR(R, q, -0.03))) out.push([3, `${what} no caminho (o corredor, uma porta, uma escada, onde se usa uma peça)`, b.id]);
          } else if (p.stairs.some(st => (st.lv0 === t.lv || st.lv1 === t.lv) && ovR(R, st.r, -0.02))) out.push([3, `${what} sobre uma escada`, b.id]);
        } else if (t.on === 'parede') {
          const d = faceDist(p, t.lv, t.x, t.z); if (d > m.d / 2 * sz + 0.1) out.push([3, `${what} longe da parede (${d.toFixed(2)} m)`, b.id]);
          if (d < -0.01) out.push([3, `${what} dentro da parede`, b.id]);
        } else if (t.on === 'teto' || t.on === 'canto') {
          let ceil = p.shell && Number.isFinite(p.shell.eave) ? p.shell.eave : Infinity; for (const q of p.levels) if (q.y > l.y + 0.5 && (q.areas || [q.area]).some(r => r && t.x > r[0] && t.x < r[2] && t.z > r[1] && t.z < r[3])) ceil = Math.min(ceil, q.y);
          const top = t.y + m.h * t.s[1]; if (Math.abs(top - ceil) > 0.12) out.push([3, `${what} pendurado a ${top.toFixed(2)} m sem teto ali (${ceil === Infinity ? 'nenhum' : ceil.toFixed(2)})`, b.id]);
          if (t.on === 'teto' && t.y - l.y < 1.9) out.push([3, `${what} pendurado na altura das cabeças (${(t.y - l.y).toFixed(2)} m)`, b.id]);
          if (t.on === 'teto') for (const it of p.items) if (it.lv === t.lv && ovR(R, it.r, -0.02) && t.y < l.y + (it.y || 0) + it.h + 0.05 && !it.fire) { out.push([3, `${what} dentro de ${it.kind}`, b.id]); break; }
        }
      }
      // nothing over another: on the walls (a peg and what hangs from it, a lamp's shelf and its lamp, go together) and on the floor
      const pair = t => t.key.replace(/^(cavilha|pende)\//, 'p/').replace(/^(parede-luz\/\d+).*$/, '$1');
      const wall = pl.list.filter(t => t.on === 'parede'), floor = pl.list.filter(t => t.on === 'chao' && t.k !== 'tapete');
      for (let i = 0; i < wall.length; i++) for (let j = i + 1; j < wall.length; j++) { const a = wall[i], c = wall[j]; if (pair(a) === pair(c)) continue; const ma = G.MESH3D['deco-' + a.k], mc = G.MESH3D['deco-' + c.k]; if (!ma || !mc) continue;
        const dx = Math.hypot(a.x - c.x, a.z - c.z), ya = [a.y, a.y + ma.h * a.s[1]], yc = [c.y, c.y + mc.h * c.s[1]];
        if (dx < (ma.w * a.s[0] + mc.w * c.s[0]) / 2 - 0.02 && Math.min(ya[1], yc[1]) - Math.max(ya[0], yc[0]) > 0.02) out.push([4, `${tag}: ${a.k} e ${c.k} um sobre o outro na parede (${a.key}, ${c.key})`, b.id]); }
      for (let i = 0; i < floor.length; i++) for (let j = i + 1; j < floor.length; j++) { const a = floor[i], c = floor[j]; if (a.r && c.r && ovR(a.r, c.r, -0.02)) out.push([3, `${tag}: ${a.k} e ${c.k} um dentro do outro no chão`, b.id]); }
      // the lights given to the light of the inside (G.Luz3D) are the lamps lit among the things
      const lit = pl.list.filter(t => t.lit).length; if (pl.fontes.length !== lit) out.push([3, `${tag}: ${pl.fontes.length} luzes da decoração para ${lit} lamparina(s) acesa(s)`, b.id]);
    }
    return out;
  };
  QA.more.push(function (add) {
    const S = G.S; if (!S || !G.Dentro3D) return; const list = [];
    // (the insides the 3D has open; without it, the taverns and a few houses whose plans are made — the checker makes no plan)
    if (G.Build3D && G.Build3D.opened && G.Realm && G.Realm.on) for (const o of G.Build3D.opened()) { const b = S.buildings.get(o.id); if (b) list.push(b); }
    if (!list.length && G.Space && G.Space.planMade) { let h = 0; for (const b of S.buildings.values()) { if (list.length >= 14) break; if (!b.built || !G.Space.planMade(b)) continue; if (b.type === 'taverna') list.push(b); else if (h < 6 && G.BDEF[b.type] && G.BDEF[b.type].housing) { list.push(b); h++; } } }
    for (const [sev, msg, id] of QA.dentro(list)) add('dentro', sev, msg, id);
  });
})();
