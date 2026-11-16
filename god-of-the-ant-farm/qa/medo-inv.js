// medo-inv: as regras do verificador para o medo das feras (D-310) — carregado depois do qa/qa.js (QA.more), como o dia-inv.js;
// o líder o junta (qa/junta-inv.js). Lê as pessoas, os bichos e as portas do medo (G.Vg.dread, G.Vg.armedFor) — nenhuma
// pergunta muda o mundo. O sistema «medo»:
//   · ninguém que não pode lutar fica à toa ao lado de uma fera que caça gente (S3): a duas casas de um leão, de um tigre, de
//     um urso, de um crocodilo fora d'água, de um lobo, quem não é dos armados, não está a fugir nem a lutar, não está dentro
//     de casa, preso, a bordo, numa cena, nem é o corpo do deus, não fica mais de seis segundos do mundo — a pessoa foge ao
//     ver a fera (o dono viu um aldeão passar tranquilo do lado de um leão). Quem come com a fome acima de 85 come (L-725).
// Com as olhadas a mais de doze segundos uma da outra a regra não fala (é das provas que olham de perto: qa/medo.js).
// O que guarda entre duas olhadas (desde quando cada um está ao lado de cada fera) fica aqui, nunca no mundo, e recomeça com
// um mundo novo, um save aberto ou um relógio que voltou atrás.
(function () {
  if (!window.QA || !QA.more) return;
  let since = new Map(), pS = null, pC = -1;
  const NEAR = 2, LONG = 6;
  const STILL = { flee: 1, fight: 1, combat: 1, band: 1, scene: 1, jail: 1, cela: 1, levado: 1, aboard: 1, embark: 1, condemned: 1, escorted: 1, swim: 1, refugio: 1, hide: 1, army: 1 };
  const rule = function (add, s) {
    const Vg = G.Vg; if (!Vg || !Vg.dread || !Vg.DREAD_HUNTS) return;
    // (looks more than twelve seconds apart say nothing of one standing still: a skip, a life looked at year by year)
    if (s !== pS || s.clock < pC || s.clock - pC > 12) since = new Map();
    const body = s.avatar ? s.avatar.id : 0; const now = new Map();
    const fearsome = []; for (const a of s.animals.values()) if (Vg.DREAD_HUNTS[a.kind] && Vg.dread(a) >= 0.6) fearsome.push(a);
    if (fearsome.length) for (const v of s.villagers.values()) {
      if (v.id === body || v.inside || v.held || v.air || v.aboard || v.ug || v.age < 2 || v.jail || v.captive) continue;
      const t = v.task; if (t && STILL[t.type]) continue;
      if (v.age >= 16 && Vg.armedFor(v)) continue;
      if (v.hunger > 85 && t && (t.type === 'eat' || t.type === 'forage' || (t.type === 'lar' && t.meal))) continue;
      for (const a of fearsome) {
        if (G.dist2(v.x, v.y, a.x, a.y) > NEAR * NEAR) continue;
        const key = v.id + ':' + a.id; const t0 = since.has(key) ? since.get(key) : s.clock; now.set(key, t0);
        if (s.clock - t0 > LONG) add('medo', 3, `${v.name} #${v.id} (${t ? t.type : 'sem tarefa'}) está há ${(s.clock - t0).toFixed(0)} s a ${G.dist(v.x, v.y, a.x, a.y).toFixed(1)} casas de ${G.Animals.DEF[a.kind].nameA} #${a.id} sem fugir`, v.id);
      }
    }
    since = now; pS = s; pC = s.clock;
  };
  QA.more.push(rule); QA.medo = rule;
})();
