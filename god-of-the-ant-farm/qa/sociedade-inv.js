// sociedade-inv: as regras do verificador da sociedade (22b, D-570 a D-589) — carregado depois do qa/qa.js (QA.more); o líder o junta
// (qa/junta-inv.js). Lê as pessoas, as cidades e as portas puras da sociedade (G.Indole, G.Lacos, G.Fama) — nenhuma pergunta muda o
// mundo. O sistema «sociedade»:
//   · a índole de toda pessoa: nove inteiros de 0 a 99 (S1 — faltar depois do load é um save que perdeu quem a pessoa é);
//   · os laços: no máximo 16 para um adulto e 8 para uma criança (S1); ninguém com laço consigo (S1), nem dois laços para o mesmo
//     (S2); só para quem vive, ou morreu há dois dias ou menos — a passada do dia tira os mortos (S3), nunca para quem não existiu
//     (S2); cada número inteiro e, somado à família implícita, dentro dos seus limites (S1); o dia do último contato não depois de hoje
//     (S2); nenhum laço gravado igual à base da família — quatro zeros: desperdício (S4);
//   · as marcas (fase 2): no máximo 8 (S1), de um tipo conhecido (S2), de alguém que existe ou existiu (S2), de um dia não depois de
//     hoje (S2), peso inteiro de 1 a 100 (S2);
//   · a fama (fase 2): no máximo 4 comunidades (S1), de uma cidade ou de um povo que existe (S3), renome 0..100 e estima −100..100 (S2);
//     a memória da cidade: no máximo 12 lembranças (S2), de um tipo conhecido (S3).
(function () {
  if (!window.QA || !QA.more) return;
  const isInt = x => Number.isInteger(x);
  const rule = function (add, s) {
    const L = G.Lacos, I = G.Indole; if (!L || !I || !I.ok) return;
    for (const v of s.villagers.values()) {
      const nm = `${v.name} #${v.id}`;
      if (!I.ok(v.indole)) add('sociedade', 1, `${nm}: a índole não é de nove inteiros de 0 a 99 (${JSON.stringify(v.indole)})`, v.id);
      const a = v.lacos;
      if (a !== undefined && a !== null) {
        if (!Array.isArray(a)) { add('sociedade', 1, `${nm}: os laços não são uma lista`, v.id); continue; }
        const cap = v.age < 16 ? L.CAP_KID : L.CAP;
        if (a.length > cap) add('sociedade', 1, `${nm}: ${a.length} laços, acima do teto de ${cap}`, v.id);
        const seen = new Set();
        for (const t of a) {
          if (!Array.isArray(t) || t.length !== 7 || !t.every(isInt)) { add('sociedade', 1, `${nm}: um laço que não é de sete inteiros (${JSON.stringify(t)})`, v.id); continue; }
          const id = t[0];
          if (id === v.id) add('sociedade', 1, `${nm}: um laço consigo`, v.id);
          if (seen.has(id)) add('sociedade', 2, `${nm}: dois laços para #${id}`, v.id); seen.add(id);
          const o = s.villagers.get(id), d = s.dead.get(id);
          if (!o && !d) add('sociedade', 2, `${nm}: um laço com #${id}, que nunca existiu`, v.id);
          else if (!o && d && s.day - (d.died || 0) > 2) add('sociedade', 3, `${nm}: um laço com ${d.name} #${id}, morto há ${s.day - (d.died || 0)} dias`, v.id);
          const b = o ? L.base(v, o) : [0, 0, 0, 0];
          const lim = [[-100, 100], [-100, 100], [-100, 100], [0, 100]];
          for (let k = 0; k < 4; k++) { const x = b[k] + t[k + 1]; if (x < lim[k][0] || x > lim[k][1]) add('sociedade', 1, `${nm}: o laço com #${id} fora dos limites (${['afeto', 'confiança', 'respeito', 'atração'][k]} ${x})`, v.id); }
          if (t[5] > s.day) add('sociedade', 2, `${nm}: o laço com #${id} de um dia que não chegou (${t[5]} > ${s.day})`, v.id);
          if (!t[1] && !t[2] && !t[3] && !t[4] && !(L.marked && L.marked(v, id))) add('sociedade', 4, `${nm}: um laço com #${id} igual à base da família (quatro zeros)`, v.id);
        }
      }
      const m = v.marcas;
      if (m !== undefined && m !== null) {
        if (!Array.isArray(m)) add('sociedade', 1, `${nm}: as marcas não são uma lista`, v.id);
        else {
          if (m.length > (L.MARCAS || 8)) add('sociedade', 1, `${nm}: ${m.length} marcas, acima do teto`, v.id);
          for (const k of m) {
            if (!Array.isArray(k) || k.length < 4) { add('sociedade', 2, `${nm}: uma marca torta (${JSON.stringify(k)})`, v.id); continue; }
            if (L.MARCA && !Object.prototype.hasOwnProperty.call(L.MARCA, k[0])) add('sociedade', 2, `${nm}: uma marca de tipo desconhecido «${k[0]}»`, v.id);
            if (!s.villagers.has(k[1]) && !s.dead.has(k[1])) add('sociedade', 2, `${nm}: a marca «${k[0]}» de #${k[1]}, que não existe nem existiu`, v.id);
            if (!isInt(k[2]) || k[2] > s.day) add('sociedade', 2, `${nm}: a marca «${k[0]}» de um dia que não chegou`, v.id);
            if (!isInt(k[3]) || k[3] < 1 || k[3] > 100) add('sociedade', 2, `${nm}: a marca «${k[0]}» com peso ${k[3]}`, v.id);
          }
        }
      }
      const f = v.fama;
      if (f !== undefined && f !== null) {
        if (!Array.isArray(f)) add('sociedade', 1, `${nm}: a fama não é uma lista`, v.id);
        else {
          if (f.length > 4) add('sociedade', 1, `${nm}: fama em ${f.length} comunidades, acima de 4`, v.id);
          for (const c of f) {
            if (!Array.isArray(c) || c.length < 4) { add('sociedade', 2, `${nm}: uma fama torta`, v.id); continue; }
            if (!s.settlements.has(c[0]) && !(G.Fama && G.Fama.lembrada && G.Fama.lembrada(c[0]))) add('sociedade', 3, `${nm}: fama numa cidade que não existe (#${c[0]})`, v.id);
            if (!isInt(c[1]) || c[1] < 0 || c[1] > 100 || !isInt(c[2]) || c[2] < -100 || c[2] > 100) add('sociedade', 2, `${nm}: a fama fora dos limites (${JSON.stringify(c)})`, v.id);
          }
        }
      }
    }
    for (const set of s.settlements.values()) {
      const m = set.memoria; if (m === undefined || m === null) continue;
      if (!Array.isArray(m)) { add('sociedade', 2, `${set.name}: a memória da cidade não é uma lista`); continue; }
      if (m.length > 12) add('sociedade', 2, `${set.name}: ${m.length} lembranças, acima de 12`);
      for (const k of m) if (!Array.isArray(k) || (G.Fama && G.Fama.TIPOS && !Object.prototype.hasOwnProperty.call(G.Fama.TIPOS, k[0]))) add('sociedade', 3, `${set.name}: uma lembrança de tipo desconhecido (${JSON.stringify(k).slice(0, 60)})`);
    }
  };
  QA.more.push(rule); QA.sociedade = rule;
})();
