// corpo-dentro: quem é tomado dentro de um prédio fica dentro dele (L-741).   [ONLY=d1,d3] node qa/corpo-dentro.js [mundo]
// O deus toma o corpo de alguém onde a pessoa está: quem está dentro de um prédio com planta é tomado no cômodo, de pé no
// lugar que o mundo lhe deu ali (possess.js, Po.take). Uma mudança de depois — «quem fica sem tarefa dentro de um prédio sai
// pela porta com o afazer seguinte» — passou a valer também para a marca do corpo: a tarefa tinha acabado antes da marca, e
// a marca punha o corpo para fora, à porta, com o piso de dentro ainda escrito. Agora a marca do corpo não o tira do lugar.
// A casa é do mundo pronto, a noite é a do jogo, o corpo é tomado e devolvido pelas portas do jogo (G.Possess.take, release).
// d1 quem dorme em casa, tomado: está dentro dela, num chão da planta, com o piso escrito e a tarefa do corpo;
// d2 vários, em vários prédios de planta feita: todos os que a planta deixa de pé ficam dentro; nenhum com o piso de dentro
//    escrito e o corpo fora;
// d3 quem está na rua, tomado: fica na rua, sem piso de dentro;
// d4 save e load com o corpo dentro: depois do load segue dentro, no mesmo lugar;
// d5 devolvido dentro do cômodo, sai pela porta com o afazer seguinte (a regra de antes continua);
// d6 o verificador: o corpo com o piso de dentro escrito e fora do prédio é acusado (S2);
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js'] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const Po = G.Possess, Sp = G.Space, V = G.Village;
let S;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// the world at night, people in their beds
const night = () => { S = M.pronto(WORLD); S.weather.storm = 0; S.weather.rain = 0; S.time = 0.86; M.viver(12); };
const said = id => QA.check().filter(q => q.sys === 'avatar' && q.msg.includes('#' + id)).map(q => `[S${q.sev}] ${q.msg}`);
// who is indoors in a building whose plan is made, and can be taken — the lowest ids first; `skip`, those already used
const indoors = skip => [...S.villagers.values()].sort((a, b) => a.id - b.id).filter(v => { if (skip && skip.has(v.id)) return false; if (!(v.inside > 0) || v.age < 12) return false; const b = S.buildings.get(v.inside); return !!b && !!(Sp.planNow && Sp.planNow(b)) && Po.can(v).ok; });
const inLot = (v, b) => v.x >= b.x - 0.01 && v.x <= b.x + (b.w || 1) + 0.01 && v.y >= b.y - 0.01 && v.y <= b.y + (b.h || 1) + 0.01;
const state = v => { const a = S.avatar; return { in: v.inside || 0, lv: a ? a.lv : undefined, task: v.task ? v.task.type : 'nenhuma', plan: !!(v.inside && Po.onPlan(v)) }; };
const txt = (v, b, s) => `${v.name} #${v.id} em ${b.type}#${b.id}: ${s.in === b.id ? 'dentro' : s.in ? 'dentro de OUTRO (' + s.in + ')' : 'FORA, à porta'}, piso ${s.lv === null || s.lv === undefined ? 'nenhum' : s.lv}, ${s.plan ? 'num chão da planta' : 'fora da planta'}, tarefa ${s.task}`;

if (on('d1') || on('d4') || on('d5')) {
  night(); const v = indoors().find(o => o.inside === o.home && o.sleeping) || indoors()[0];
  if (!v) ok('d1 quem dorme em casa, tomado, fica dentro', false, 'ninguém dentro de um prédio de planta feita à noite');
  else {
    const b = S.buildings.get(v.inside); const slept = v.sleeping;
    const r = god(() => Po.take(v)); const s = state(v); const q = said(v.id);
    if (on('d1')) ok('d1 quem dorme em casa, tomado, fica dentro', r.ok && s.in === b.id && s.lv !== null && s.lv !== undefined && s.plan && inLot(v, b) && s.task === 'avatar' && !v.sleeping && !q.length,
      `${slept ? 'dormia' : 'estava'} em casa → tomado: ${txt(v, b, s)}; o verificador ${q.length ? 'acusa: ' + q[0].slice(0, 130) : 'calado'}`);
    if (on('d4')) {
      const p0 = [v.x.toFixed(2), v.y.toFixed(2), s.lv].join(',');
      M.salvarCarregar(); S = G.S; const v2 = S.villagers.get(v.id); const b2 = S.buildings.get(b.id); const s2 = state(v2); const q2 = said(v.id);
      const p1 = [v2.x.toFixed(2), v2.y.toFixed(2), s2.lv].join(',');
      ok('d4 save e load com o corpo dentro: segue dentro, no mesmo lugar', !!S.avatar && S.avatar.id === v.id && s2.in === b.id && s2.plan && p0 === p1 && s2.task === 'avatar' && !q2.length,
        `antes do save ${p0}; depois do load ${S.avatar ? txt(v2, b2, s2) : 'SEM corpo'}, em ${p1}; o verificador ${q2.length ? 'acusa: ' + q2[0].slice(0, 130) : 'calado'}`);
    }
    if (on('d5')) {
      const v3 = S.villagers.get(v.id); const b3 = S.buildings.get(b.id);
      god(() => Po.release('deus')); const in0 = v3.inside === b3.id;
      // (given back in the room: the next errand of the world takes them out by the door, or leaves them in it — to bed)
      M.viver(6); const t = v3.task ? v3.task.type : 'nenhuma';
      const fine = !S.avatar && (v3.inside === b3.id ? ['sleep', 'lar', 'eat', 'family'].includes(t) || v3.sleeping : true);
      ok('d5 devolvido dentro, segue pela regra do mundo', in0 && fine, `devolvido ${in0 ? 'dentro' : 'FORA'}; seis segundos depois: ${v3.inside === b3.id ? 'dentro' : 'saiu pela porta'}, tarefa ${t}${v3.sleeping ? ', dormindo' : ''}`);
    }
  }
}
if (on('d2')) {
  night(); const seen = new Set(), rows = []; let inN = 0, doorN = 0, bad = 0; const types = new Set();
  for (let k = 0; k < 14; k++) {
    // (one of each building first, then whoever is left)
    const L = indoors(seen); const v = L.find(o => !types.has(S.buildings.get(o.inside).type)) || L[0]; if (!v) break;
    seen.add(v.id); const b = S.buildings.get(v.inside); types.add(b.type);
    const r = god(() => Po.take(v)); const s = state(v); const q = said(v.id);
    // (out at the door only when the plan has no floor for the feet in the place, beside it, or by the way in — then no inner floor)
    const fine = r.ok && (s.in === b.id ? s.lv !== null && s.plan : s.in === 0 && s.lv === null) && !q.length;
    if (s.in === b.id) inN++; else doorN++; if (!fine) { bad++; rows.push(txt(v, b, s) + (q.length ? ' — ' + q[0].slice(0, 90) : '')); }
    god(() => Po.release('deus'));
  }
  ok('d2 vários prédios: todos ficam dentro, nenhum com o piso de dentro e o corpo fora', seen.size >= 5 && !bad && inN >= seen.size - 1,
    `${seen.size} pessoas tomadas dentro de ${types.size} tipos de prédio (${[...types].join(', ')}): ${inN} ficaram dentro, ${doorN} à porta${bad ? `; ${bad} ERRADAS: ${rows.slice(0, 3).join(' · ')}` : ''}`);
}
if (on('d3')) {
  S = M.pronto(WORLD); S.time = 0.4; M.viver(8);
  const v = [...S.villagers.values()].sort((a, b) => a.id - b.id).find(o => !o.inside && o.age >= 16 && Po.can(o).ok);
  if (!v) ok('d3 quem está na rua, tomado, fica na rua', false, 'ninguém na rua que o deus possa viver');
  else { const x = v.x, y = v.y; const r = god(() => Po.take(v)); const a = S.avatar; const q = said(v.id);
    ok('d3 quem está na rua, tomado, fica na rua', r.ok && !v.inside && a && a.lv === null && Math.hypot(v.x - x, v.y - y) < 0.01 && v.task && v.task.type === 'avatar' && !q.length,
      `${v.name} #${v.id}, na rua: ${v.inside ? 'DENTRO de ' + v.inside : 'na rua'}, piso ${a && a.lv !== null ? a.lv : 'nenhum'}, a ${Math.hypot(v.x - x, v.y - y).toFixed(2)} de onde estava; o verificador ${q.length ? 'acusa: ' + q[0].slice(0, 120) : 'calado'}`);
    god(() => Po.release('deus')); }
}
if (on('d6')) {
  night(); const v = indoors()[0];
  if (!v) ok('d6 o verificador vê o piso de dentro com o corpo fora', false, 'ninguém dentro de um prédio de planta feita à noite');
  else {
    const b = S.buildings.get(v.inside); god(() => Po.take(v)); const q0 = said(v.id);
    // (the lie: the body out at the door, the inner floor still written — what the mark did)
    const keep = [v.inside, v.x, v.y]; const lv0 = S.avatar.lv; const d = G.Vg.door(b);
    god(() => { v.inside = 0; v.x = d[0]; v.y = d[1]; if (S.avatar.lv === null) S.avatar.lv = 0; }); const q1 = said(v.id).filter(m => /L-741/.test(m));
    god(() => { v.inside = keep[0]; v.x = keep[1]; v.y = keep[2]; S.avatar.lv = lv0; }); const q2 = said(v.id);
    ok('d6 o verificador vê o piso de dentro com o corpo fora', !q0.length && q1.length > 0 && !q2.length,
      `${v.name} #${v.id}: tomado dentro, o verificador ${q0.length ? 'ACUSA' : 'calado'}; posto à porta com o piso de dentro escrito, ${q1.length ? 'acusa: ' + q1[0].slice(0, 140) : 'CALADO'}; de volta ao cômodo, ${q2.length ? 'ACUSA' : 'calado'}`);
    god(() => Po.release('deus'));
  }
}
ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `\ncorpo-dentro: ${fails.length} falha(s): ${fails.join(', ')}` : '\ncorpo-dentro: tudo passou');
process.exit(fails.length ? 1 : 0);
