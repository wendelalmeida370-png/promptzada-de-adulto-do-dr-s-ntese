// dia-inv: as regras do verificador para o dia de cada um (D-240, L-915) — carregado depois do qa/qa.js (QA.more), como o
// praca-inv.js; o líder o junta (qa/junta-inv.js). Lê as pessoas, o relógio e as portas do passo do dia e do descanso
// (G.pace, G.Vg.resting) — nenhuma pergunta muda o mundo. O sistema «dia»:
//   · o passo do dia é o da porta: 1, ou o do sol que se demora (G.LINGER) — nunca outro (S2);
//   · ninguém descansa a andar, a dormir, nem num afazer de trabalho (S2): o descanso é do corpo parado e à toa — a
//     caminhada cansa como caminhada e o trabalho como trabalho, seja qual for o gesto;
//   · ninguém acordado cansa mais depressa do que o dia (S3): entre duas olhadas do verificador a até doze segundos uma
//     da outra, com o sol a demorar-se no meio, a energia de quem está acordado não cai mais do que os centésimos do dia
//     que passaram deixam (100/80 por centésimo; o velho 1,12; quem foge 1,6). É a marca do L-915: a energia a correr em
//     segundos com o relógio do dia a 0,35. Só olha a queda que os segundos explicam e o dia não: uma queda maior do que
//     os segundos dão é um golpe (o inverno do deus, a ressaca, a mão de uma prova), não o cansaço — fica de fora. Com as
//     olhadas a mais de doze segundos a regra não fala (num salto, numa vida olhada de ano em ano): é das provas que
//     olham de perto (qa/dia.js).
// O que guarda entre duas olhadas (a energia, o relógio do dia e os segundos de cada um) fica aqui, nunca no mundo, e
// recomeça com um mundo novo, um save aberto ou um relógio que voltou atrás.
(function () {
  if (!window.QA || !QA.more) return;
  let prev = new Map(), pS = null, pC = -1;
  const NEAR = 12;   // (seconds between two looks, at the most, for the tiredness to be judged)
  const rule = function (add, s) {
    const Vg = G.Vg; if (!Vg || !Vg.resting || G.pace === undefined) return;
    // ---- the pace of the step is the door's
    if (!(G.pace === 1 || G.pace === G.LINGER)) add('dia', 2, `o passo do dia é ${G.pace}: só pode ser 1 ou o do sol que se demora (${G.LINGER})`);
    const body = s.avatar ? s.avatar.id : 0;
    if (s !== pS || s.clock < pC) prev = new Map();
    const now = new Map(); const tDay = s.day + s.time; const K = G.DAY_K || 2;
    for (const v of s.villagers.values()) {
      const t = v.task; const nm = `${v.name} #${v.id}`;
      // ---- nobody rests on the move, asleep or at work
      if (Vg.resting(v)) {
        if (v.sleeping) add('dia', 2, `${nm} em descanso e a dormir (o descanso é de quem está acordado)`, v.id);
        if (v.moving) add('dia', 2, `${nm} em descanso e a andar (${t ? t.type : 'sem afazer'}): a caminhada cansa como caminhada`, v.id);
        if (v.id !== body && t && t.kind === 'work') add('dia', 2, `${nm} em descanso num afazer de trabalho (${t.type}): o trabalho cansa como trabalho`, v.id);
      }
      // ---- nobody awake tires faster than the day
      if (v.age < 2) continue;
      const flee = !!t && (t.type === 'flee' || t.type === 'swim');
      const p = prev.get(v.id);
      if (p && !p.sl && !v.sleeping && !p.swim && !(t && t.type === 'swim')) {
        const ds = s.clock - p.c; const dc = (tDay - p.t) * 100;
        if (ds > 0 && ds <= NEAR && dc >= 0 && dc * K < ds * 0.9) { // (the sun lingered between the two looks)
          const f = 1.25 * (v.age >= 62 ? 1.12 : 1) * (flee || p.flee ? 1.6 : 1); const tol = 0.15 + 0.05 * ds;
          const drop = p.e - v.energy; const dayMax = dc * f, secMax = (ds / K) * f;
          if (drop > dayMax + tol && drop <= secMax + tol) add('dia', 3, `${nm} cansou ${drop.toFixed(2)} em ${dc.toFixed(2)} centésimos do dia (${ds.toFixed(1)} s, com o sol a demorar-se): o dia dá no máximo ${dayMax.toFixed(2)}`, v.id);
        }
      }
      now.set(v.id, { e: v.energy, t: tDay, c: s.clock, sl: !!v.sleeping, flee, swim: !!t && t.type === 'swim' });
    }
    prev = now; pS = s; pC = s.clock;
  };
  QA.more.push(rule); QA.dia = rule;
})();
