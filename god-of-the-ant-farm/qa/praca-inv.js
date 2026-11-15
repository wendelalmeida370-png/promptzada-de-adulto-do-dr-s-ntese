// praca-inv: as regras do verificador para a praça ao fim da tarde (Bairros Vivos, D-225, D-226) — carregado depois do
// qa/qa.js (QA.more), como o freguesia-inv.js; o líder o junta (qa/junta-inv.js). Lê as pessoas e os prédios — nenhuma
// pergunta muda o mundo. Valem enquanto houver quem pare na praça por vontade sua (G.Praca.urge / go, a tarefa 'praca'):
//   · ninguém cativo ou preso, nem criança, com a conversa da praça (S2) — a vontade é de quem é livre e crescido;
//   · a conversa é numa praça ou num mercado de pé, da cidade da pessoa (S2);
//   · ninguém na conversa com uma carga nas mãos, nem dormindo (S3) — as mãos ocupadas, D-094;
//   · ninguém na conversa fora das horas da praça — de noite, de madrugada (S3): o escuro manda para casa;
//   · nenhuma praça com mais gente na conversa do que comporta (S3) — quem vem a caminho conta.
(function () {
  if (!window.QA || !QA.more) return;
  const rule = function (add, s) {
    const Pr = G.Praca; if (!Pr || !Pr.holds) return;
    const at = new Map();
    for (const v of s.villagers.values()) {
      const t = v.task; if (!t || t.type !== 'praca') continue;
      const nm = `${v.name} #${v.id}`; const b = s.buildings.get(t.id);
      if (v.captive || v.jail) add('praca', 2, `${nm} ${v.captive ? 'cativo' : 'preso'} na conversa da praça`);
      if (v.age < 16) add('praca', 2, `${nm}, ${Math.floor(v.age)} anos, na conversa da praça`);
      if (!b || !b.built || (b.type !== 'praca' && b.type !== 'mercado')) { add('praca', 2, `${nm} na conversa de uma praça que não está de pé (#${t.id})`); continue; }
      if (b.set !== v.set) add('praca', 2, `${nm} na conversa da praça de outra cidade (#${b.id})`);
      if (v.carry && v.carry.n > 1e-6) add('praca', 3, `${nm} na conversa da praça com uma carga nas mãos (${v.carry.k})`);
      if (v.sleeping) add('praca', 3, `${nm} na conversa da praça dormindo`);
      if (s.time >= Pr.SHUT + 0.012 || s.time < Pr.OPEN - 0.012) add('praca', 3, `${nm} na conversa da praça às ${s.time.toFixed(2)} — fora das horas dela (${Pr.OPEN} a ${Pr.SHUT})`);
      at.set(b.id, (at.get(b.id) || 0) + 1);
    }
    for (const [id, n] of at) { const b = s.buildings.get(id); if (b && n > Pr.holds(b)) add('praca', 3, `${b.type === 'praca' ? 'a praça' : 'a porta do mercado'} #${id} com ${n} na conversa, e comporta ${Pr.holds(b)}`); }
  };
  QA.more.push(rule); QA.praca = rule;
})();
