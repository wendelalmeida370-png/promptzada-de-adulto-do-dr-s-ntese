// meio-inv: as regras do verificador para o meio dos bichos (D-300 a D-309) — carregado depois do qa/qa.js (QA.more), e
// juntado ao qa.js pelo junta-inv.js. Só lê: os bichos, o a.meio de cada um, o que o G.Meio diz do que cada um faz agora
// (G.Meio.phase) e o mapa; nenhuma pergunta muda o mundo. O sistema «meio»:
//   · o a.meio de cada bicho tem os números no lugar: th, wet, mud, dust, cold e hot entre 0 e 1; wx/wy e bx/by uma casa do
//     mapa ou -1 (os dois juntos); al entre 0 e 60; g o índice de um gesto ou 0 (S2);
//   · quem bebe (o estado «beber», já na água) está à beira de água doce — um rio ou um lago a menos de casa e meia, nunca só
//     o mar —, e a água em que bebe é doce (S2);
//   · quem está na toca está na sua toca (a.meio.bx/by, a menos de casa e meia), e quem está no abrigo, no lugar dele (S2);
//   · nenhum bicho da terra que não nada parado na água funda de um rio ou de um lago sem gelo nem ponte (S2);
//   · o bicho num estado do G.Meio tem o registro desse estado (G.Meio.phase) — sem ele, o estado é órfão: nada o move nem o
//     acaba (S3);
//   · na travessia, quem está na água está perto do rio da sua travessia (S3);
//   · o medo das pessoas e os lugares de beber são números: o medo entre 0 e 1, os goles contados nunca negativos (S2);
//   · de dia, a fera e o gigante que a cidade afasta (G.Meio.shunned: sem fome de quem caça gente ou rebanho, sem raiva) não
//     ficam à toa dentro de uma cidade: o mesmo bicho visto lá dentro, parado, andando ou num afazer do meio (nem saindo, nem
//     caçando, nem fugindo, nem comendo), em duas olhadas a doze segundos ou mais, é a cidade que não o afastou (S3; D-305).
(function () {
  if (!window.QA || !QA.more) return;
  const fin = Number.isFinite;
  // (who was seen inside a town by day, and since when: the memory of the checks, of this world only)
  const inTown = new Map(); let inWorld = null;
  const rule = function (add, s) {
    const Mi = G.Meio; if (!Mi || !Mi.phase || !Mi.MINE) return;
    const T = G.T, D = G.Animals.DEF; const N = Math.round(Math.sqrt(s.type.length));
    const water = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const tx = Math.floor(x + dx * 0.75), ty = Math.floor(y + dy * 0.75); if (tx < 0 || ty < 0 || tx >= N || ty >= N) continue; const i = ty * N + tx; if (s.type[i] === T.RIVER && !(s.ice && s.ice[i])) return true; } return false; };
    let bad = 0, orphan = 0, wet = 0;
    for (const a of s.animals.values()) {
      if (a.dead) continue; const m = a.meio; const nm = `${a.kind}#${a.id}`;
      if (m) {
        for (const k of ['th', 'wet', 'mud', 'dust', 'cold', 'hot']) if (!fin(m[k]) || m[k] < 0 || m[k] > 1) { if (bad++ < 4) add('meio', 2, `${nm}: a.meio.${k} = ${m[k]} (de 0 a 1)`, a.id); }
        for (const [p, q] of [['wx', 'wy'], ['bx', 'by']]) { const x = m[p], y = m[q]; if (!fin(x) || !fin(y) || (x < 0) !== (y < 0) || x < -1 || y < -1 || x >= N || y >= N || x !== Math.round(x) || y !== Math.round(y)) { if (bad++ < 4) add('meio', 2, `${nm}: a.meio.${p}/${q} = ${x}/${y} não é uma casa do mapa nem -1`, a.id); } }
        if (!fin(m.al) || m.al < 0 || m.al > 60 || !fin(m.g) || m.g < 0 || m.g > G.Gestos.ids.length) { if (bad++ < 4) add('meio', 2, `${nm}: a.meio.al/g = ${m.al}/${m.g}`, a.id); }
      }
      if (!Mi.MINE[a.state]) continue;
      const r = Mi.phase(a);
      if (!r) { if (orphan++ < 3) add('meio', 3, `${nm} no estado «${a.state}» do meio sem o registro dele (G.Meio.phase): nada o move nem o acaba`, a.id); continue; }
      if (a.state === 'beber' && r.p >= 1) {
        const wi = r.wi; const ok = wi >= 0 && s.type[wi] === T.RIVER;
        if (!ok || !water(a.x, a.y) || Math.hypot(a.x - ((wi % N) + 0.5), a.y - (((wi / N) | 0) + 0.5)) > 1.6) { if (wet++ < 4) add('meio', 2, `${nm} bebendo longe de água doce (em ${a.x.toFixed(1)},${a.y.toFixed(1)}; a água dele ${ok ? 'a ' + Math.hypot(a.x - ((wi % N) + 0.5), a.y - (((wi / N) | 0) + 0.5)).toFixed(1) + ' casas' : 'não é rio nem lago'})`, a.id); }
      }
      if (a.state === 'toca' && r.p >= 1 && m && m.bx >= 0 && Math.hypot(a.x - (m.bx + 0.5), a.y - (m.by + 0.5)) > 1.6) add('meio', 2, `${nm} na toca a ${Math.hypot(a.x - (m.bx + 0.5), a.y - (m.by + 0.5)).toFixed(1)} casas da sua toca`, a.id);
      if (a.state === 'abrigo' && r.p >= 1 && Math.hypot(a.x - r.gx, a.y - r.gy) > 1.6) add('meio', 2, `${nm} no abrigo a ${Math.hypot(a.x - r.gx, a.y - r.gy).toFixed(1)} casas do seu lugar`, a.id);
      if (a.state === 'travessia' && r.p === 2) { const c = (Mi.crossings() || []).find(q => Math.hypot(q.x - r.gx, q.y - r.gy) < 12 || Math.hypot(q.fx - r.gx, q.fy - r.gy) < 12); if (!c || Math.hypot(a.x - c.x, a.y - c.y) > 14) add('meio', 3, `${nm} atravessando longe do rio da sua travessia`, a.id); }
    }
    // no land beast that cannot swim standing in deep water
    let deep = 0;
    for (const a of s.animals.values()) {
      if (a.dead || a.held || a.air) continue; const sp = D[a.kind]; if (!sp || sp.cls !== 'land' || sp.swims || (a.z || 0) > 3) continue;
      const tx = Math.floor(a.x), ty = Math.floor(a.y); if (tx < 0 || ty < 0 || tx >= N || ty >= N) continue; const i = ty * N + tx;
      if (s.type[i] === T.RIVER && s.deep[i] && !s.road[i] && !(s.ice && s.ice[i]) && a.state !== 'leave' && !a.moving) { if (deep++ < 3) add('meio', 2, `${a.kind}#${a.id} (que não nada) parado na água funda`, a.id); }
    }
    const pl = Mi.places ? Mi.places() : []; for (const p of pl) if (!fin(p.n) || p.n < 0) { add('meio', 2, `um lugar de beber com ${p.n} goles`); break; }
    if (Mi.fearAt) { const f = Mi.fearAt(N / 2, N / 2); if (!fin(f) || f < 0 || f > 1) add('meio', 2, `o medo das pessoas = ${f}`); }
    // the town by day: the shunned one does not stay among the houses
    if (Mi.shunned && Mi.townAt) {
      if (inWorld !== s) { inWorld = s; inTown.clear(); } let late = 0; const seen = new Set();
      for (const a of s.animals.values()) {
        const calm = a.state === 'idle' || a.state === 'wander' || a.state === 'graze' || a.state === 'lurk' || (Mi.MINE[a.state] && a.state !== 'beber' && a.state !== 'sair');
        if (a.dead || !calm || !Mi.shunned(a)) continue; const st = Mi.townAt(a.x, a.y); if (!st || Math.hypot(a.x - st.cx, a.y - st.cy) >= (st.radius || 8)) continue;
        seen.add(a.id); const t0 = inTown.get(a.id); if (t0 === undefined || t0 > s.clock) { inTown.set(a.id, s.clock); continue; }
        if (s.clock - t0 >= 12 && late++ < 3) add('meio', 3, `${a.kind}#${a.id} de dia dentro de ${st.name || 'uma cidade'} há ${(s.clock - t0).toFixed(0)} s, ${a.state}, sem sair`, a.id);
      }
      for (const id of [...inTown.keys()]) if (!seen.has(id)) inTown.delete(id);
    }
  };
  QA.more.push(rule); QA.meio = rule;
})();
