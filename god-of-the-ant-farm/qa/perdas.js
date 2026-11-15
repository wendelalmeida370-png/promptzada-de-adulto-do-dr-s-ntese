// perdas: o braço perdido e a casa perdida são coisas diferentes (L-712).   [ONLY=p1,p3] node qa/perdas.js [mundo]
// A pessoa guarda em `v.lost` os membros que perdeu (carnage.js: armL, armR; o corpo, a força das mãos, o passo do trabalho,
// a luta e a tela leem dali). O «por que dorme na rua» (social.js) guardava no MESMO campo a casa perdida — { day, why } —
// quando a casa de alguém era destruída, e o apagava quando a pessoa ia para a rua. Com isso: (a) todo morador de uma casa
// destruída (fogo, terremoto, raio, guerra) passava a contar como alguém que perdeu um membro — o trabalho a 85% para sempre
// e, na tela, «Sem uma perna» —, a menos que fosse parar na rua; (b) quem tinha perdido um braço e ficava sem teto ganhava
// o braço de volta. Agora a casa perdida tem o seu campo (`v.roofLost`), e `v.lost` é só do corpo.
// A casa cai pela porta do jogo (G.Village.destroyBuilding), o dia da rua é o do jogo (G.Social.update, chamado na hora pela
// mão da prova), os braços, os do jogo (o campo que o carnage.js escreve).
// p1 quem mora numa casa que pega fogo não perde membro nenhum: a força das mãos e o passo do trabalho ficam como estavam;
// p2 quem já tinha perdido um braço continua sem ele depois que a casa cai;
// p3 sem teto, o dia da rua diz o porquê certo (o fogo), e o braço perdido continua perdido;
// p4 save e load entre a casa cair e o dia da rua: o porquê e o braço atravessam;
// p5 o verificador: um `v.lost` que não é de membros é acusado (S2);
// p6 um save de antes (a casa perdida escrita no campo dos membros): ao abrir, a casa perdida vai para o campo dela e o
//    campo dos membros fica limpo — e o porquê da rua sai certo;
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | perdas ${name} | ${info}`); if (!c) fails.push(name); };
const Vg = G.Vg, V = G.Village, D = G.Depot;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S;
const open = () => { S = M.pronto(WORLD); M.viver(1); S.time = 0.3; S.weather.storm = 0; S.weather.rain = 0; };
const limbs = v => (v.lost ? Object.keys(v.lost).filter(k => v.lost[k]).sort().join('+') || 'vazio' : 'nenhum');
const said = id => QA.check().filter(q => /L-712/.test(q.msg) && q.msg.includes('#' + id)).map(q => `[S${q.sev}] ${q.msg}`);
// a family's house standing in a town at peace: two grown ones of it or more, whole of body, at home in their town
const used = new Set();
function house() {
  for (const b of [...S.buildings.values()].sort((a, c) => a.id - c.id)) {
    if (used.has(b.id) || !b.built || b.upgradeFrom || !G.BDEF[b.type].housing || b.type === 'barraco' || !V.livable(b) || (G.War.threat && G.War.threat(b.set))) continue;
    const L = [...S.villagers.values()].filter(v => v.home === b.id && v.set === b.set && !v.captive && !v.jail && !v.aboard && !v.ug);
    const grown = L.filter(v => v.age >= 18 && v.age < 60 && !v.lost && !(S.avatar && S.avatar.id === v.id));
    if (grown.length >= 2 && L.length === [...S.villagers.values()].filter(v => v.home === b.id).length) { used.add(b.id); return { b, L, grown }; }
  }
  return null;
}
const burn = b => god(() => V.destroyBuilding(b, 'fire'));
// the day of the street, by the game's own door (G.Social.update: a town each call), run now by the test's hand — the
// round of the day begun again —, with the people of the case without a roof as it passes (`keep`: a town with an empty
// house gives it to them at the next step, and the round of the next morning would find them housed)
const streetDay = keep => god(() => { keep(); G.mod('social.day', -1); for (let k = 0; k <= S.settlements.size; k++) G.Social.update(0); });

if (on('p1')) {
  open(); const h = house();
  if (!h) ok('p1 a casa que pega fogo não tira membro de ninguém', false, 'nenhuma casa de família com dois adultos inteiros');
  else {
    const v = h.grown[0]; const s0 = D.strength(v), w0 = Vg.workMul(v), l0 = limbs(v);
    burn(h.b);
    const s1 = D.strength(v), w1 = Vg.workMul(v), l1 = limbs(v); const q = said(v.id);
    ok('p1 a casa que pega fogo não tira membro de ninguém', l0 === 'nenhum' && l1 === 'nenhum' && Math.abs(s1 - s0) < 1e-9 && Math.abs(w1 - w0) < 1e-9 && !q.length,
      `${v.name} #${v.id}, de ${h.b.type}#${h.b.id}: a casa pegou fogo → membros perdidos ${l0} → ${l1}; a força das mãos ${s0} → ${s1}; o passo do trabalho ${w0.toFixed(3)} → ${w1.toFixed(3)}; o verificador ${q.length ? 'acusa: ' + q[0].slice(0, 120) : 'calado'}`);
  }
}
if (on('p2')) {
  open(); const h = house();
  if (!h) ok('p2 o braço perdido continua perdido depois que a casa cai', false, 'nenhuma casa de família com dois adultos inteiros');
  else {
    const v = h.grown[0]; god(() => { v.lost = { armL: true }; v.lostT = S.clock; });
    const s0 = D.strength(v), l0 = limbs(v);
    burn(h.b);
    const s1 = D.strength(v), l1 = limbs(v);
    ok('p2 o braço perdido continua perdido depois que a casa cai', l0 === 'armL' && l1 === 'armL' && Math.abs(s1 - s0) < 1e-9,
      `${v.name} #${v.id}, sem o braço esquerdo, de ${h.b.type}#${h.b.id}: a casa pegou fogo → membros perdidos ${l0} → ${l1}; a força das mãos ${s0} → ${s1}`);
  }
}
if (on('p3') || on('p4')) {
  open(); const h = house();
  if (!h) ok('p3 sem teto, o porquê é o fogo e o braço continua perdido', false, 'nenhuma casa de família com dois adultos inteiros');
  else {
    const [v, w] = h.grown; god(() => { v.lost = { armL: true, armR: true }; v.lostT = S.clock; });
    burn(h.b);
    // (the house gone, its people have no roof: the day of the street finds them — the test's hand keeps them roofless until it does)
    const ids = h.L.map(o => o.id);
    const roofless = () => god(() => { for (const id of ids) { const o = S.villagers.get(id); if (o) o.home = 0; } });
    roofless();
    if (on('p4')) {
      M.salvarCarregar(); S = G.S;
      const v2 = S.villagers.get(v.id), w2 = S.villagers.get(w.id);
      streetDay(roofless);
      ok('p4 save e load entre a casa cair e o dia da rua: o porquê e o braço atravessam', !!v2 && !!w2 && limbs(v2) === 'armL+armR' && limbs(w2) === 'nenhum' && !!v2.rua && v2.ruaWhy === 'fogo' && !!w2.rua && w2.ruaWhy === 'fogo',
        `depois do load e do dia da rua: ${v2 ? `${v2.name} sem os dois braços → membros ${limbs(v2)}, na rua ${v2.rua ? 'desde o dia ' + v2.rua : 'NÃO'}, porque «${G.Social.whyText(v2) || v2.ruaWhy || '?'}»` : 'SUMIU'}; ${w2 ? `${w2.name}, inteiro → membros ${limbs(w2)}, na rua ${w2.rua ? 'sim' : 'NÃO'}, porque «${G.Social.whyText(w2) || w2.ruaWhy || '?'}»` : 'SUMIU'}`);
    }
    if (on('p3')) {
      const a = S.villagers.get(v.id), c = S.villagers.get(w.id);
      if (!on('p4')) streetDay(roofless);
      const sA = D.strength(a), wC = Vg.workMul(c);
      ok('p3 sem teto, o porquê é o fogo e o braço continua perdido', !!a.rua && a.ruaWhy === 'fogo' && limbs(a) === 'armL+armR' && sA === 0 && !!c.rua && c.ruaWhy === 'fogo' && limbs(c) === 'nenhum',
        `${a.name} #${a.id}, sem os dois braços: na rua ${a.rua ? 'desde o dia ' + a.rua : 'NÃO'}, porque «${G.Social.whyText(a) || a.ruaWhy || '?'}»; membros perdidos ${limbs(a)}, a força das mãos ${sA}; ${c.name}, inteiro: na rua ${c.rua ? 'sim' : 'NÃO'}, porque «${G.Social.whyText(c) || c.ruaWhy || '?'}», membros perdidos ${limbs(c)}, o passo do trabalho ${wC.toFixed(3)}`);
    }
  }
}
if (on('p5')) {
  open(); const h = house();
  if (!h) ok('p5 o verificador vê um «lost» que não é de membros', false, 'nenhuma casa de família com dois adultos inteiros');
  else {
    const v = h.grown[0]; const q0 = said(v.id);
    god(() => { v.lost = { day: S.day, why: 'fogo' }; }); const q1 = said(v.id);
    god(() => { v.lost = { armR: true }; }); const q2 = said(v.id);
    god(() => { v.lost = null; });
    ok('p5 o verificador vê um «lost» que não é de membros', !q0.length && q1.length > 0 && !q2.length,
      `${v.name} #${v.id}: inteiro, o verificador ${q0.length ? 'ACUSA' : 'calado'}; com a casa perdida escrita no campo dos membros, ${q1.length ? 'acusa: ' + q1[0].slice(0, 130) : 'CALADO'}; sem o braço direito, ${q2.length ? 'ACUSA' : 'calado'}`);
  }
}
if (on('p6')) {
  open(); const h = house();
  if (!h) ok('p6 um save de antes: a casa perdida sai do campo dos membros ao abrir', false, 'nenhuma casa de família com dois adultos inteiros');
  else {
    const [v, w] = h.grown; const ids = h.L.map(o => o.id);
    burn(h.b); god(() => { for (const id of ids) { const o = S.villagers.get(id); if (o) o.home = 0; } });
    // (the save as the game of before wrote it: the house lost in the field of the limbs, and no field of its own)
    const o = JSON.parse(G.Save.serialize()); let n = 0;
    for (const q of o.villagers) if (ids.includes(q.id)) { q.lost = q.roofLost; delete q.roofLost; n++; }
    G.Save.apply(o); S = G.S;
    const v2 = S.villagers.get(v.id), w2 = S.villagers.get(w.id); const q0 = v2 ? said(v2.id) : ['sumiu'];
    const moved = !!v2 && !v2.lost && !!v2.roofLost && v2.roofLost.why === 'fogo' && !!w2 && !w2.lost && !!w2.roofLost;
    streetDay(() => god(() => { for (const id of ids) { const p = S.villagers.get(id); if (p) p.home = 0; } }));
    // (the day of the street asks who is in town: not one gone under the ground — the oracle in her cave —, at sea or taken)
    const there = [v2, w2].filter(p => p && S.villagers.has(p.id) && !p.ug && !p.aboard && !p.captive);
    const told = p => `${p.name} com membros perdidos ${limbs(p)}, na rua ${p.rua ? 'sim' : 'NÃO'}, porque «${G.Social.whyText(p) || p.ruaWhy || '?'}»`;
    ok('p6 um save de antes: a casa perdida sai do campo dos membros ao abrir', n >= 2 && moved && !q0.length && there.length > 0 && there.every(p => !!p.rua && p.ruaWhy === 'fogo' && limbs(p) === 'nenhum'),
      `${n} da casa com a casa perdida escrita no campo dos membros, no save; depois de abrir: a casa perdida ${moved ? 'no campo dela, o dos membros limpo' : 'FORA do campo dela'}, o verificador ${q0.length ? 'acusa' : 'calado'}; no dia da rua: ${there.map(told).join('; ') || 'NINGUÉM da casa na cidade'}${[v2, w2].filter(p => p && !there.includes(p)).map(p => `; ${p.name} fora da conta (${p.ug ? 'debaixo da terra' : p.aboard ? 'a bordo' : p.captive ? 'cativa' : 'morta'})`).join('')}`);
  }
}
ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `\nperdas: ${fails.length} falha(s): ${fails.join(', ')}` : '\nperdas: tudo passou');
process.exit(fails.length ? 1 : 0);
