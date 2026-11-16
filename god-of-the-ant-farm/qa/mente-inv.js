// mente-inv: as regras do verificador para o cérebro e a luta dos bichos (D-290 a D-299) — carregado depois do qa/qa.js
// (QA.more) e juntado a ele pelo qa/junta-inv.js. Lê os bichos, as mentes (a.mind), as feridas (a.wnd) e as presas seguras
// (a.caught, a.wnd.h) — nenhuma pergunta muda o mundo. Os sistemas «mente» e «luta»:
//   · a presa segura tem quem a segure: vivo e na lista do mundo (ou, se não, a própria presa o vê no seu passo seguinte e se
//     solta — um módulo que roda depois dos bichos, a toca ou a migração, mudou o caçador neste passo: só o bicho que não tem esse
//     passo, o de casa, o da cidade, o do mar e o do céu, falha aqui); quem a segura, segurando-a, perto dela, e a marca da presa
//     (a.wnd.h) diz o mesmo; ninguém é seguro por dois (S1/S2);
//   · a mente: os números de 0 a 1 entre 0 e 1 e finitos, o sexo 0 ou 1, o cio e a prenhez não ao mesmo tempo, a prenhez com pai
//     (S1 o não finito, S2 o resto);
//   · as feridas: o sangue entre 0 e 4, a manqueira e as seis zonas entre 0 e 1, finitos (S1/S2);
//   · a mãe de um filhote existe — ou o laço é desfeito no giro social (no máximo 30 s de relógio depois, S3);
//   · ninguém num estado de caça, de luta ou de corte sem um alvo que existe, nem preso nele além do tempo dele (S2);
//   · o gesto do cérebro e da luta é um que a espécie faz (o qa.js já confere; aqui, o gesto segurado de um estado que acabou).
//   · o caçador selvagem e a pessoa (D-297b): nenhum leão, tigre, urso, lobo… à vontade a um braço de uma pessoa por mais de
//     oito segundos (S3) — ele a vê e reage: vigia, recua, ameaça ou caça; e as vezes que gente o feriu (mente.mh) de 0 a 5 (S2).
// O que guarda entre duas olhadas (desde quando cada um está num estado, desde quando o laço da mãe aponta para ninguém) fica
// aqui, nunca no mundo, e recomeça com um mundo novo, um save aberto ou um relógio que voltou atrás.
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  let since = new Map(), orphan = new Map(), ease = new Map(), pS = null, pC = -1;
  // (the longest a beast stays in each state of the brain and the fight, in seconds of the clock, with room)
  const LIMIT = { hold: 110, contest: 70, court: 80, stand: 40, trail: 100, patrol: 70, play: 40, digest: 200, wait: 40, eye: 30, shy: 20 };
  const TARGET = { chase: 1, stalk: 1, flank: 1, pounce: 1, hold: 1, strike: 1, trail: 1, stand: 1, contest: 1, court: 1, play: 1, young: 1, suckle: 1, eye: 1 };
  // (the states of a beast at its ease: a wild hunter in one of them with a person at arm's length, for seconds on end, is the
  // old walk beside people as if nobody were there — D-297b)
  const EASE = { idle: 1, wander: 1, graze: 1, rest: 1, sleep: 1, groom: 1, social: 1, play: 1, seek: 1, range: 1, shun: 1, patrol: 1, mark: 1, heat: 1, court: 1, nurse: 1, suckle: 1, hide: 1, watch: 1, digest: 1 };
  const rule = function (add, s) {
    const A = G.Animals; if (!A || !G.Mente || !G.Luta) return;
    if (s !== pS || s.clock < pC) { since = new Map(); orphan = new Map(); ease = new Map(); }
    if (s.clock - pC > 15) { since = new Map(); ease = new Map(); } // (how long in a state is judged only between looks close together: T-1310)
    const now = new Map(), orph = new Map(), easeNow = new Map(); const holders = new Map();
    for (const a of s.animals.values()) {
      const nm = `${a.kind}#${a.id}`;
      // ---- the hold, from the held one's side
      const D = A.DEF[a.kind];
      const own = D && (D.cls === 'land' || D.cls === 'amph') && !D.dom && !D.town && !a.dom; // (it has the step that lets go)
      if (a.caught) {
        const h = s.animals.get(a.caught); const r = a.wnd && a.wnd.h;
        if (a.dead) add('luta', 1, `${nm} morto e ainda seguro por #${a.caught}`, a.id);
        else if (!own) add('luta', 1, `${nm} (que não tem o passo que se solta) seguro por #${a.caught} — nenhum bicho de casa, da cidade, do mar ou do céu é pegado assim`, a.id);
        else if (h && !h.dead && h.state === 'hold' && h.target === a.id) {
          if (!r || r[0] !== h.id) add('luta', 2, `${nm} seguro por #${h.id} sem a marca da presa (a.wnd.h) dizer o mesmo`, a.id);
          const E = A.DEF[h.kind]; const far = G.dist(a.x, a.y, h.x, h.y);
          if (D && E && far > (D.size + E.size) * 0.6 + 0.6) add('luta', 2, `${nm} seguro por ${h.kind}#${h.id} a ${far.toFixed(2)} dele (os dois corpos de uma pegada ficam juntos)`, a.id);
        }
      } else if (a.wnd && a.wnd.h && !a.dead) add('luta', 2, `${nm} com a marca de presa segura (#${a.wnd.h[0]}) e ninguém a segurando`, a.id);
      // (a prey dead this very step is the holder's meal at its next: not a hold gone wrong)
      if (a.state === 'hold' && !a.dead && !a.held) { const p = s.animals.get(a.target); if (!p || (p.caught !== a.id && !p.dead)) add('luta', 2, `${nm} em «hold» sem presa segura (alvo ${a.target})`, a.id); holders.set(a.target, (holders.get(a.target) || 0) + 1); }
      // ---- the mind
      const m = a.mind;
      if (m) {
        for (const k of ['st', 'en', 'f', 'g', 'rk', 'so']) { const v = m[k]; if (!fin(v)) add('mente', 1, `${nm}: a mente.${k} = ${v}`, a.id); else if (v < -1e-6 || v > 1 + 1e-6) add('mente', 2, `${nm}: a mente.${k} = ${v} fora de 0 a 1`, a.id); }
        if (m.sx !== 0 && m.sx !== 1) add('mente', 2, `${nm}: o sexo ${m.sx}`, a.id);
        for (const k of ['es', 'pg', 'mk', 'wn']) if (!fin(m[k])) add('mente', 1, `${nm}: a mente.${k} = ${m[k]}`, a.id);
        if (m.mh !== undefined && (!fin(m.mh) || m.mh < 0 || m.mh > 5)) add('mente', 2, `${nm}: a mente.mh = ${m.mh} (as vezes que gente o feriu, de 0 a 5)`, a.id);
        if (m.es > 0 && m.pg > 0) add('mente', 2, `${nm}: no cio e prenhe ao mesmo tempo`, a.id);
        if (m.pg > 0 && !m.pa) add('mente', 2, `${nm}: prenhe sem pai`, a.id);
        if (m.pg > 0 && m.sx !== 0) add('mente', 2, `${nm}: um macho prenhe`, a.id);
        if (m.mom && !a.dead) { const mo = A.find(m.mom); if (!mo || mo.dead) { const t0 = orphan.get(a.id); const t = t0 === undefined ? s.clock : t0; orph.set(a.id, t); if (s.clock - t > 30) add('mente', 3, `${nm}: a mãe (#${m.mom}) não existe há ${Math.round(s.clock - t)} s e o laço não foi desfeito`, a.id); } }
      }
      // ---- the wounds
      const w = a.wnd;
      if (w) {
        if (!fin(w.b) || !fin(w.l) || !Array.isArray(w.z) || w.z.length !== 6 || !w.z.every(fin)) add('luta', 1, `${nm}: ferida inválida ${JSON.stringify(w).slice(0, 80)}`, a.id);
        else { if (w.b < 0 || w.b > 4.0001) add('luta', 2, `${nm}: sangrando ${w.b} por segundo`, a.id); if (w.l < 0 || w.l > 1.0001 || w.z.some(z => z < 0 || z > 1.0001)) add('luta', 2, `${nm}: ferida fora de 0 a 1`, a.id); if ((w.j !== undefined && !fin(w.j)) || (w.v !== undefined && !fin(w.v))) add('luta', 1, `${nm}: a mandíbula ou o veneno não finitos`, a.id); }
      }
      // ---- the states: a target, and an end
      if (!a.dead && (LIMIT[a.state] || TARGET[a.state])) {
        const p = since.get(a.id); const t = p && p.st === a.state ? p.t : s.clock; now.set(a.id, { st: a.state, t });
        if (LIMIT[a.state] && s.clock - t > LIMIT[a.state]) add('luta', 2, `${nm} preso em «${a.state}» há ${Math.round(s.clock - t)} s`, a.id);
        // (a target gone this very step — swallowed, into a den — is let go at the next: only one gone for seconds is wrong)
        if (TARGET[a.state] && a.target && s.clock - t > 3 && !s.animals.get(a.target) && !s.villagers.get(a.target) && !A.find(a.target)) add('luta', 2, `${nm} em «${a.state}» com um alvo que não existe (#${a.target})`, a.id);
      }
    }
    for (const [id, n] of holders) if (n > 1) add('luta', 1, `#${id} seguro por ${n} ao mesmo tempo`, id);
    // ---- the wild hunter and the person: never at its ease beside one (D-297b)
    if (A.MAN && A.nearMan) for (const a of s.animals.values()) {
      if (a.dead || !A.MAN.has(a.kind) || !EASE[a.state] || a.tamed || a.dom || a.summoned || a.raid || a.legend || a.caught || a.held || a.mig || a.z > 3 || a.grown < 0.6 || a.angry > 0) continue;
      if (a.kind === 'croc' && s.type[G.W.idx(a.x, a.y)] <= G.T.RIVER) continue; // (the croc in the water: its lurk is its watch)
      let v = null; A.nearMan(a.x, a.y, 2.5, q => { if (!v && !q.dead && !q.inside && !q.aboard && !q.held && !q.air && G.dist2(q.x, q.y, a.x, a.y) < 6.25) v = q; });
      if (!v) continue;
      const p = ease.get(a.id); const t = p && p.v === v.id ? p.t : s.clock; easeNow.set(a.id, { v: v.id, t });
      if (s.clock - t > 8) add('mente', 3, `${a.kind}#${a.id} em «${a.state}» a ${G.dist(a.x, a.y, v.x, v.y).toFixed(1)} de ${v.name || 'uma pessoa'} há ${Math.round(s.clock - t)} s, como se ninguém estivesse ali`, a.id);
    }
    since = now; orphan = orph; ease = easeNow; pS = s; pC = s.clock;
  };
  QA.more.push(rule); QA.mente = rule;
})();
