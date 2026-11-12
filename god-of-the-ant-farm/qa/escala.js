// escala: o cenário da escala dos prédios na cidade (D-106, a Arquitetura Monumental; o especialista da cidade — D-115 a D-117),
// em Node, na metrópole pronta (o lote de 6 do palácio — e8, e15, e17b —, nos mundos prontos que o têm, a metrópole primeiro: T-627).
// Com só o degrau clássico de cada tipo, nada muda (e0). Com os degraus grandes ligados por
// geradores de teste registrados só aqui (a forma clássica do povo num lote maior: as formas grandes de verdade são do M1 e do
// M2), a aldeia escolhe o pequeno e a capital o grande (e1); sem terra, o degrau de baixo (e2); abrir espaço com as regras (e3:
// só casas baixas e campos da própria cidade, o limite do degrau, os campos mudam de lugar e as famílias ganham mais camas do
// que perdem, a linha na crônica; e3x o juiz do lote, regra a regra); o save no meio da obra grande (e4); o deus derruba no
// meio (e5); a cidade que encolhe (e6); a ampliação no lugar (e7: o mesmo id, o nome, a história, a conta do que cresce, o save
// no meio, pronta; e8 o palácio e o seu patrono; e9 a ampliação que ninguém alcança volta ao que era); a obra grande guarda a
// pedra da cidade (e10, D-117); um save de antes igual (e11); a mesma semente, a mesma escolha (e12); os palácios pela escada
// (e13); a mão do deus prefere o chão que o pódio cobre (e14). A terra e o pedido (D-120): a renda de pedra pelo livro e o degrau
// maior só com a pedra de vinte anos (e15); a vez da obra grande só com a cidade alimentada e em casa (e16); de fora e de dentro,
// e quem não acha terra diz por quê (e17); limpar o lote — a rua menor que o anel junta, a madeira para a obra (e18); os jogos do
// Coliseu pelos lugares da planta (e19); o porquê de cada capital nos três mundos prontos (e20); a obra que espera um tijolo que
// não vem volta à pedra, a que espera há mais tempo primeiro (e24, L-540). Onde o povo já tem a forma grande de verdade (o
// Coliseu romano do M1, os palácios do M2), a prova usa a dele.
//   node qa/escala.js            (ONLY=e1,e3 só esses; VERB=1 conta mais)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const VERB = !!process.env.VERB;
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | escala ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S, V, Es, D;
const abre = w => { M.pronto(w || 'metropole'); S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; return S; };
// (as cidades pelo que são, nunca pelo nome — cada mundo refeito muda os tamanhos, os nomes e quem é a capital, T-477, T-493,
// T-496: as capitais dos povos vivos, a mais povoada primeiro; a do povo de um estilo — a romana, a do Coliseu do M1 —; a maior
// cidade; e um lote de um degrau pela busca do jogo, com o dia de ontem esquecido)
const capitais = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
const doPovo = civ => capitais().find(s => G.Civ.idOfFac(s.fac) === civ) || null;
const maior = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0] || null;
const loteDe = (s, type, n) => { s._noSite = {}; const p = sim(() => V.findSite(s, type, undefined, n)); s._noSite = {}; return p; };
// (a case's premise in the ready worlds as the game forms it: the metrópole first, and the next worlds when it has none — the
// metrópole of the generation 18, older and bigger, has no lot of 6 for a palace near any town by the game's own search: water,
// another town's buildings, relief — e20 —; the «cidade» of the year 20 has one by each of its capitals, T-627. → what fn found,
// with .mundo, the world left open; or null)
const MUNDOS = ['metropole', 'mundial', 'mega', 'cidade'];
const acha = fn => { for (const w of MUNDOS) { abre(w); const r = fn(); if (r) return Object.assign(r, { mundo: w }); } return null; };
const degrau = (t, n) => Es.steps(t).find(s => s.n === n);
const soma = o => Object.values(o || {}).reduce((a, x) => a + (x || 0), 0);
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y} (${b.esc || '-'})` : 'nada');
const ocupa = b => { for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (S.occ[y * G.N + x] !== b.id) return false; return true; };
const pedra = (set, n) => D.make('f:' + set.fac, 'stone', n, { code: 'teste' });
// (a renda de pedra do povo, como o livro a conta — f.pedra, D-120 —: a prova a põe alta onde só a terra e a escolha estão em jogo)
const rico = (set, n) => { G.Fac.get(set.fac).pedra = [S.day, 0, n === undefined ? 100 : n]; };
// (o save e a carga fazem um G.S novo: a prova passa a olhar o de agora; a crônica tem teto — as linhas novas, pelo número delas)
const salva = () => { const k = M.salvarCarregar(); S = G.S; return k; };
const marca = () => G.S.logN || 0;
const linhas = (n0, rx) => G.S.history.filter(e => e.n > n0 && rx.test(e.txt));
const civicas = set => sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin' && G.BDEF[o.type].civic) V.completeBuilding(o); });
// (o verificador S0–S2 e os erros do jogo — a conta da obra de um degrau o qa.js confere pelo degrau, L-535)
function checa() {
  const out = [];
  for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }

// ------------------------------ e0: só o degrau clássico ------------------------------
// (a referência do mundo de antes da escada: com cada povo sabendo só o degrau clássico de cada tipo — G.Escala.choose dando o
// clássico, como antes das formas grandes —, nenhum degrau abre espaço, o planejador não amplia nada, não guarda a pedra, não
// tira do acaso do mundo, e nenhuma cidade guarda lote. Com as formas do M1 e do M2, todo povo tem alguma forma grande e não
// sobrou cidade «quieta» para ser a referência — T-399 —: a referência é a escada só clássica, pedida assim na prova; e os
// tipos que ainda não têm degrau maior em povo nenhum — a biblioteca, o mercado, o paço municipal — escolhem o clássico de
// verdade em toda cidade. Os banhos têm degrau maior desde as termas grandes (T-784, D-183), mas só nos povos da terma — o
// romano, o grego e o clássico —: nos outros três, com desenho próprio dos banhos, o clássico em toda cidade (D-182), e
// num povo da terma só a cidade que justifica o degrau o escolhe)
const PUB = ['maravilha', 'teatro', 'temple', 'palacio', 'grande_palacio', 'palacio_colossal', 'paco', 'monument', 'banhos', 'biblioteca', 'mercado', 'administracao'];
// (a town with a great work of the world's own already going up when the ready world was saved — a step the ladder chose before
// the proof — is not of the classic reference: that work keeps its stone whatever the proof asks now. In the metrópole of the
// generation 14, Argos's great palace of 8 and Tenochtitlan's theatre of 6, T-477)
run('e0', () => {
  abre(); const choose0 = Es.choose; let classic = 0, opens = 0, grew = 0, great = 0, mexeu = 0, guardou = 0, cidades = 0;
  const doMundo = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && V.greatWork(s, V.counts(s.id))).map(s => s.name);
  Es.choose = (set, type) => [Es.classic(type)];
  try {
    for (const set of S.settlements.values()) {
      const fac = G.Fac.get(set.fac); if (!fac || doMundo.includes(set.name)) continue; cidades++; const c = V.counts(set.id);
      for (const t of PUB) { classic++; if (Es.choose(set, t).some(s => V.opens(t, s))) opens++; }
      const rng0 = S.rng;
      if (sim(() => V.grow(set, fac, c))) grew++;
      if (V.greatWork(set, c)) great++;
      if (S.rng !== rng0) mexeu++;
    }
  } finally { Es.choose = choose0; }
  ok('e0 só o clássico: nada muda', !opens && !grew && !great && !mexeu && cidades > 0, `${cidades} cidades, ${classic} escadas só com o clássico: nenhuma abre espaço (${opens}); ampliações ${grew}, obras que guardam a pedra ${great}, o acaso do mundo tocado ${mexeu}${doMundo.length ? `; fora da referência, com a obra grande do mundo já em obra: ${doMundo.join(', ')}` : ''}`);
  const sem = ['biblioteca', 'mercado', 'administracao']; let maior = [];
  for (const set of S.settlements.values()) for (const t of sem) if (Es.choose(set, t).some(st => st.n !== Es.n0(t))) maior.push(`${set.name}/${t}`);
  ok('e0b os tipos sem degrau maior escolhem o clássico', !maior.length, maior.length ? `com degrau maior: ${maior.slice(0, 4).join(', ')}` : `${sem.join(', ')}: o clássico em toda cidade`);
  // (the baths: a bigger step only where the people is one of the thermae's and the town justifies it — its ladder's req)
  const TERMA = ['romano', 'grego', 'classico'], OUTROS = ['egipcio', 'asteca', 'nordico']; const errado = []; let da = 0, n = 0;
  const pode = st => Es.steps('banhos').filter(q => !q.classico && Es.can('banhos', st, q.n)).map(q => q.n);
  for (const st of TERMA) if (pode(st).join() !== '5,7') errado.push(`${st} sabe ${pode(st).join(',') || 'nenhum'}`);
  for (const st of OUTROS) if (pode(st).length) errado.push(`${st} sabe ${pode(st).join(',')}`);
  for (const set of S.settlements.values()) { const f = G.Fac.get(set.fac); if (!f) continue; n++; const st = G.Civ.idOfFac(set.fac) || 'classico'; const pop = V.pop(set.id);
    const big = Es.choose(set, 'banhos').filter(q => q.n !== Es.n0('banhos')).map(q => q.n); const want = TERMA.includes(st) ? Es.steps('banhos').filter(q => !q.classico && (!q.req.pop || pop >= q.req.pop) && (!q.req.tier || (set.tier || 0) >= q.req.tier)).map(q => q.n).reverse() : [];
    if (big.length) da++; if (big.join() !== want.join()) errado.push(`${set.name} (${st}, ${pop} hab., grau ${set.tier}): escolhe ${big.join(',') || 'só o clássico'}, devia ${want.join(',') || 'só o clássico'}`); }
  ok('e0c os banhos: o degrau maior só nos povos da terma, e só na cidade que o justifica', !errado.length && n > 0, errado.length ? errado.slice(0, 4).join('; ') : `o romano, o grego e o clássico sabem as termas de 5 e de 7 casas; o egípcio, o asteca e o nórdico, só o seu; das ${n} cidades do mundo, ${da} justificam um degrau maior hoje`);
});

// ------------------------------ os geradores de teste (só nesta prova) ------------------------------
const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const GERA = { maravilha: [10, 13], teatro: [6, 8, 10], temple: [4, 6, 8], palacio: [6], grande_palacio: [8], palacio_colossal: [10], paco: [3], monument: [4] };
{ abre(); for (const t in GERA) for (const st of STY) { const F0 = G.Forma.of(t, st); if (!F0) continue; G.Forma.def(t, st, () => ({ els: F0.els, door: F0.door, body: F0.body, amphi: F0.amphi, stalls: F0.stalls, bays: F0.bays }), GERA[t]); } }

// ------------------------------ e1: a aldeia escolhe o pequeno, a capital o grande ------------------------------
// (pelo que são, não pelo nome: a capital, a maior que escolhe primeiro o templo de 4; a aldeia, a menor de todas; cada uma com
// lote para o seu. Na metrópole da geração 15 Mênfis, a de antes, já justifica o grande templo de 6, e nenhuma cidade ficou
// abaixo do nível 2 — a aldeia de antes não existe mais, T-493)
run('e1', () => {
  abre(); const vivas = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && V.pop(s.id) >= 3);
  const cabe = n => s => { s._noSite = {}; const p = sim(() => V.findSite(s, 'temple', undefined, n)); s._noSite = {}; return !!p; };
  const cap = vivas.filter(s => Es.choose(s, 'temple')[0].n === 4).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id).find(cabe(4));
  const vila = vivas.slice().sort((a, b) => V.pop(a.id) - V.pop(b.id) || a.id - b.id).find(cabe(2));
  if (!ok('e1 a capital e a aldeia', !!cap && !!vila && cap !== vila, `${cap ? cap.name : 'nenhuma cidade que escolha o templo de 4 com lote para ele'}; ${vila ? vila.name : 'nenhuma aldeia'}`)) return;
  const cC = Es.choose(cap, 'temple'), cV = Es.choose(vila, 'temple'); const fmt = ch => ch.map(s => s.id + '/' + s.n).join(' > ');
  ok('e1a a escolha', cC[0].id === 'templo' && cV[0].id === 'santuario' && cV.length === 1, `${vila.name} (${V.pop(vila.id)} pessoas, nível ${vila.tier || 0}) escolhe ${fmt(cV)}; ${cap.name} (${V.pop(cap.id)} pessoas, nível ${cap.tier}) escolhe ${fmt(cC)}`);
  rico(cap); const b = sim(() => V.startProject(cap, 'temple')); const st = degrau('temple', 4); const bill = Es.bill('temple', st);
  ok('e1b a capital ergue o grande', !!b && b.w === 4 && b.h === 4 && b.esc === 'templo' && !!b.ip && b.ip.n === 4 && V.workOf(b) === bill.work && Math.abs(soma(V.bill(b)) - soma(bill.cost)) < 1e-6 && ocupa(b),
    `${lado(b)} a ${b ? G.dist(b.x + 2, b.y + 2, cap.cx, cap.cy).toFixed(0) : '?'} casas do centro: a conta ${b ? JSON.stringify(V.bill(b)) : '?'} (o degrau: ${JSON.stringify(bill.cost)}, o tipo: ${JSON.stringify(G.BDEF.temple.cost)}), o trabalho ${b ? V.workOf(b) : '?'} (o tipo: ${G.BDEF.temple.work}), o registro da planta de ${b && b.ip ? b.ip.n : '?'} casas`);
  const bv = sim(() => V.startProject(vila, 'temple'));
  ok('e1c a aldeia ergue o pequeno', !!bv && bv.w === 2 && bv.esc === 'santuario', `${vila.name}: ${lado(bv)}`);
  const c = checa(); ok('e1d verificador', c.ok, c.txt);
});

// ------------------------------ e2: sem terra, o degrau de baixo ------------------------------
run('e2', () => {
  abre();
  // (com a pedra para o degrau grande, a busca dele sem nada hoje — o lote livre e o espaço aberto, como a cidade os guarda de um dia
  // para o outro, set._noSite —: o degrau de baixo; com a D-120 toda capital da metrópole que justifica o templo de 4 acha lote)
  const cabe2 = s => { s._noSite = {}; const p = sim(() => V.findSite(s, 'temple', undefined, 2)); s._noSite = {}; return !!p; };
  const set = [...S.settlements.values()].filter(s => Es.choose(s, 'temple')[0].n === 4).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id).find(cabe2);
  if (!ok('e2a uma cidade que justifica o templo de 4', !!set, set ? `${set.name} (${V.pop(set.id)} pessoas), com lote para o santuário` : 'nenhuma')) return;
  set._noSite = { 'temple:4': S.day, 'temple:4:abre': S.day };
  rico(set); const b = sim(() => V.startProject(set, 'temple'));
  ok('e2b o degrau de baixo', !!b && b.w === 2 && b.esc === 'santuario', `${set.name} ergue ${lado(b)}`);
  // (a maravilha não tem degrau de baixo: o antigo só fica nos que já estão de pé)
  const mv = Es.choose(set, 'maravilha'); const bm = sim(() => V.startProject(set, 'maravilha'));
  ok('e2c a maravilha sem terra não vira a antiga', mv.every(s => !s.legado) && (!bm || bm.w >= 10), `${set.name} escolhe ${mv.map(s => s.id + '/' + s.n).join(' > ')} e ergue ${lado(bm)}`);
});

// ------------------------------ e3: abrir espaço, com as regras ------------------------------
// (a cidade: a menor que justifica o templo de 4 — o primeiro degrau que ela escolhe —, por quem é e não pelo nome: na metrópole da
// geração 14, Óstia, a de antes, tinha 16 pessoas e escolhia o santuário de 2, e o templo nunca abria espaço, T-477)
const templo4 = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && Es.choose(s, 'temple')[0].n === 4).sort((a, c) => V.pop(a.id) - V.pop(c.id) || a.id - c.id)[0] || null;
// (a velha quadra: casas baixas da cidade, de pé, em cada lote livre de 4 casas que o planejador acharia — até não sobrar nenhum:
// na metrópole da geração 16, mais nova, Argos, de 51 pessoas, tinha 40 lotes livres de 4, e a quadra de antes parava em 16, T-564)
const enche = (set, quadra) => {
  let P = null, k = 0;
  for (; k < 100; k++) { set._noSite = {}; P = sim(() => V.findSite(set, 'temple', undefined, 4)); if (!P) break; for (const [dx, dy] of k === 0 && !quadra.length ? [[0, 0], [2, 2]] : [[1, 1]]) quadra.push(sim(() => V.addBuilding('house', P[0] + dx, P[1] + dy, set.id, true)).id); }
  set._noSite = {}; return { P, k };
};
// (o que o espaço derruba é da regra — V.openSite: o lote com menos a derrubar, um campo antes de uma casa —, e a prova o arma pela
// mão do deus: enquanto o espaço do templo de 4 não tomar o que o caso pede — um campo, uma casa com as suas camas —, ela derruba o
// que ele tomaria, e a velha quadra enche o lote que uma fazenda derrubada deixa livre. Na metrópole da geração 17, Tenochtitlan
// abria o espaço numa plantação, nenhuma casa caía, e a regra das famílias ficava sem prova)
const campo = (o, ids) => !G.BDEF[o.type].housing && !(o.type === 'horta' && o.home && ids.includes(o.home)); // (não o quintal que cai com a sua casa)
const casa = o => !!G.BDEF[o.type].housing;
const arma = (set, quer, quadra) => {
  const st = degrau('temple', 4); const caiu = []; let plantou = '';
  for (let r = 0; r < 40; r++) {
    set._noSite = {}; const o = sim(() => V.openSite(set, 'temple', st)); set._noSite = {};
    if (!o || o.demolish.some(id => quer(S.buildings.get(id), o.demolish))) break;
    // (a field wanted, and none in the way of a lot the step would open — the metrópole of the generation 18: only the old block's
    // houses, and with them down no lot left to open —: the god's hand plants a field of the town where the houses of the lot the
    // step opens stood, on its corner — of a kind the town has a lot to move to, the step's rule: a field comes down only with a
    // lot of its kind to go to, and Tenochtitlan has none for a farm, T-626). The meteor leaves ruins, and the hand clears them
    // before it plants — a field put down on a ruin takes its ground from under it, and the work that opens the lot later took
    // the ruin's tile: «ruin#3273: 1 casa(s) do terreno marcadas como de temple#27037», in the metrópole of the generation 19
    if (quer === campo && !plantou) {
      const x = o[0], y = o[1]; const tipo = ['farm', 'pomar', 'plantacao', 'vinhedo', 'apiario'].find(t => { set._noSite = {}; const p = sim(() => V.findSite(set, t)); set._noSite = {}; return !!p && !p.demolish; });
      if (tipo) sim(() => { for (const id of o.demolish) { const b = S.buildings.get(id); if (!b) continue; caiu.push(b.type); V.destroyBuilding(b, 'meteor'); if (S.buildings.get(id) === b && b.type === 'ruin') V.removeBuilding(b); } const f = V.addBuilding(tipo, x, y, set.id, true); if (f) { plantou = ` e plantou ${V.buildName(f)} #${f.id} (${tipo}) no lote ${x},${y}`; G.W.touchWalk(); } });
      if (plantou) continue;
    }
    sim(() => { for (const id of o.demolish) { const x = S.buildings.get(id); caiu.push(x.type); V.destroyBuilding(x, 'meteor'); } });
    enche(set, quadra);
  }
  return caiu.length || plantou ? ` (antes, a mão do deus derrubou ${caiu.join(', ') || 'nada'}${plantou})` : '';
};
// (o espaço aberto: o templo que a cidade ergue; o que caiu — o quintal de uma casa, a horta da família (urban.js), cai com a casa,
// L-079: é da casa, não um prédio nem um campo que o degrau derruba; na metrópole da geração 16 o templo de Argos derrubou um campo
// e uma choupana, e a horta da choupana foi com ela, T-564 —; o que sobe noutro lugar, e as camas de um e de outro)
function abreEspaco(set) {
  const antes = new Map(); for (const o of S.buildings.values()) if (o.set === set.id) antes.set(o.id, o.type);
  const casaDe = new Map(); for (const o of S.buildings.values()) if (o.set === set.id && o.type === 'horta' && o.home) casaDe.set(o.id, o.home);
  const id0 = S.nextId, h0 = marca();
  set._noSite = {}; rico(set); const b = sim(() => V.startProject(set, 'temple'));
  const foi0 = [...antes.keys()].filter(id => !S.buildings.has(id)); const quintais = foi0.filter(id => casaDe.has(id) && foi0.includes(casaDe.get(id)));
  const foi = foi0.filter(id => !quintais.includes(id)); const tipos = foi.map(id => antes.get(id));
  const novos = [...S.buildings.values()].filter(o => o.id >= id0 && o !== b && o.set === set.id); const casas = novos.filter(o => G.BDEF[o.type].housing);
  return {
    b, foi, tipos, casas, linha: linhas(h0, /abriu espaço/)[0], qt: quintais.length ? ` (e ${quintais.length} quintal com a sua casa)` : '',
    camasFoi: foi.reduce((s, id) => s + (G.BDEF[antes.get(id)].housing || 0), 0), camasNovas: casas.reduce((s, o) => s + G.BDEF[o.type].housing, 0),
    camposFoi: tipos.filter(t => !G.BDEF[t].housing).length, camposNovos: novos.length - casas.length,
    perto: b ? novos.filter(o => o.x + o.w > b.x - 1 && o.x < b.x + b.w + 1 && o.y + o.h > b.y - 1 && o.y < b.y + b.h + 1) : [],
    semCasa: [...S.villagers.values()].filter(v => v.home && !S.buildings.has(v.home)),
  };
}
run('e3', () => {
  abre(); const set = templo4(); if (!set) { ok('e3a sem lote livre', false, 'nenhuma cidade que justifica o templo de 4'); return; } const lim = V.openLimit(4);
  const quadra = []; const { P, k } = enche(set, quadra);
  if (!ok('e3a sem lote livre', !P, `${k} lotes livres de 4 casas tomados por ${quadra.length} casas baixas da cidade; nenhum sobrou`)) return;
  const mao = arma(set, campo, quadra);
  const pub = () => [...S.buildings.values()].filter(o => o.set === set.id && o.type !== 'ruin' && (G.BDEF[o.type].civic || o.type === 'temple' || o.type === 'monument')).length;
  const farms = () => [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'farm').length;
  const pub0 = pub(), farms0 = farms();
  const { b, foi, tipos, casas, linha, qt, camasFoi, camasNovas, camposFoi, camposNovos, perto, semCasa } = abreEspaco(set);
  ok('e3b abre espaço', !!b && b.w === 4 && b.esc === 'templo' && foi.length > 0 && ocupa(b), `${set.name} ergue ${lado(b)} derrubando ${foi.length}: ${tipos.join(', ')}${qt}${mao}`);
  ok('e3c só casas baixas e campos da cidade', tipos.every(t => V.OPEN[t]) && pub() === pub0 + 1 && farms() >= Math.min(2, farms0), `os públicos ${pub0} → ${pub()} (só o templo novo), as fazendas ${farms0} → ${farms()}`);
  ok('e3d o limite do degrau', foi.length <= lim.bld && camasFoi <= lim.beds, `${foi.length} prédios e ${camasFoi} camas${qt} (o limite do degrau de 4: ${lim.bld} e ${lim.beds})`);
  // (a mudança pela regra do que caiu — relocation, village.js —: cada campo num lote novo do seu tipo, nenhum no lote nem no anel
  // do templo; as famílias de casa derrubada, mais camas do que perderam; sem casa no lote aberto, nenhuma casa nova: a regra só
  // ergue casa para as camas perdidas. O espaço armado num campo; a casa que cai é o e3h)
  const familias = camasFoi > 0 ? camasNovas > camasFoi : camasNovas === 0;
  ok('e3e mais camas do que derrubou; os campos mudam de lugar', familias && camposFoi > 0 && camposNovos === camposFoi && !perto.length, `as famílias: ${camasFoi} camas derrubadas, ${camasNovas} em ${casas.length} casas novas (${casas.map(o => o.type).join(', ')})${camasFoi ? '' : ' — nenhuma casa no lote aberto, nenhuma casa nova'}; campos ${camposFoi} → ${camposNovos} em lote novo${qt}; nenhum no lote nem no anel do templo`);
  ok('e3f a crônica e as famílias', !!linha && !semCasa.length, `«${linha ? linha.txt : 'nenhuma linha'}»; ninguém com casa derrubada por casa (${semCasa.length})`);
  const c = checa(); ok('e3g verificador', c.ok, c.txt);
  // (e3h: a casa que cai — o mesmo mundo aberto de novo, a mesma cidade e a mesma quadra, e o espaço armado numa casa)
  abre(); const set2 = templo4(); const quadra2 = []; const q2 = enche(set2, quadra2); const mao2 = arma(set2, casa, quadra2);
  const A = abreEspaco(set2);
  ok('e3h a casa que cai: as famílias ganham mais camas do que perdem', !q2.P && !!A.b && A.b.w === 4 && A.b.esc === 'templo' && A.camasFoi > 0 && A.camasNovas > A.camasFoi && A.camposNovos === A.camposFoi && !A.perto.length && !A.semCasa.length && !!A.linha,
    `${set2.name} ergue ${lado(A.b)} derrubando ${A.tipos.join(', ') || 'nada'}${A.qt}${mao2}: ${A.camasFoi} camas derrubadas, ${A.camasNovas} em ${A.casas.length} casas novas (${A.casas.map(o => o.type).join(', ')}); campos ${A.camposFoi} → ${A.camposNovos} em lote novo; ${A.perto.length} no lote ou no anel; ${A.semCasa.length} com casa derrubada por casa; «${A.linha ? A.linha.txt : 'nenhuma linha'}»`);
  const c2 = checa(); ok('e3i verificador', c2.ok, c2.txt);
});
// ------------------------------ e3x: o juiz do lote, regra a regra ------------------------------
run('e3x', () => {
  abre(); const set = templo4(); if (!set) { ok('e3x0 um lote livre', false, 'nenhuma cidade que justifica o templo de 4'); return; } set._noSite = {}; const P = sim(() => V.findSite(set, 'temple', undefined, 4));
  if (!ok('e3x0 um lote livre', !!P, P ? `${set.name}: o lote de 4 em ${P.join(',')}` : 'nenhum')) return;
  const juiz = () => V.lotFor(set, 'temple', 4, P[0], P[1]);
  const com = (lista, f) => { const os = lista.map(([t, sid, dx, dy]) => sim(() => V.addBuilding(t, P[0] + dx, P[1] + dy, sid, true))); const r = f(); sim(() => { for (const o of os) V.removeBuilding(o); }); return r; };
  const outra = [...S.settlements.values()].find(s => s.id !== set.id && s.fac !== set.fac) || [...S.settlements.values()].find(s => s.id !== set.id);
  const L0 = juiz();
  const L1 = com([['house', set.id, 1, 1]], juiz), L2 = com([['house', set.id, 0, 0], ['hut', set.id, 2, 2]], juiz);
  const R1 = com([['house', set.id, 0, 0], ['house', set.id, 2, 0], ['hut', set.id, 1, 2]], juiz); // (três: o limite do degrau de 4 é dois)
  const R2 = com([['well', set.id, 1, 1]], juiz), L3 = com([['sobrado', set.id, 1, 1]], juiz), R4 = com([['house', outra.id, 1, 1]], juiz), R5 = com([['insula', set.id, 1, 1]], juiz);
  ok('e3x as regras', !!L0 && !L0.gone.length && !!L1 && L1.gone.length === 1 && !!L2 && L2.gone.length === 2 && L2.beds === 10 && !R1 && !R2 && !!L3 && L3.beds === 9 && !R4 && !R5,
    `livre: ${L0 ? 'cabe' : 'não'}; uma casa baixa da cidade: ${L1 ? 'cai (' + L1.gone.length + ')' : 'não'}; duas (${L2 ? L2.beds : '?'} camas): ${L2 ? 'caem' : 'não'}; três (o limite): ${R1 ? 'CAEM' : 'não'}; um poço: ${R2 ? 'CAI' : 'não'}; um sobrado (como no quarteirão): ${L3 ? 'cai (' + L3.beds + ' camas)' : 'NÃO'}; uma ínsula: ${R5 ? 'CAI' : 'não'}; a casa de ${outra.name}: ${R4 ? 'CAI' : 'não'}`);
  // (as duas últimas fazendas: uma fazenda da cidade no lote cai só se, sem ela, ficam duas)
  const F = [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'farm').length;
  const rf = com([['farm', set.id, 0, 0]], juiz);
  ok('e3x as duas últimas fazendas', !!rf === (F >= 2), `${set.name} com ${F} fazendas e mais uma no lote: ela ${rf ? 'cai' : 'fica'} (sem ela ficam ${F})`);
});

// ------------------------------ e4 e e5: o save no meio da obra grande, e o deus que derruba ------------------------------
run('e4', () => {
  abre(); const set = doPovo('romano'); const b = set && sim(() => V.handFound(set, 'maravilha', 'maravilha', { R: 60 })); // (a capital romana: o Coliseu do M1)
  if (!ok('e4a a obra grande', !!b && b.w === 10 && !b.built, `${set ? set.name : 'nenhuma capital do povo romano'}: ${lado(b)}, a conta ${b ? JSON.stringify(V.bill(b)) : '?'}, o trabalho ${b ? V.workOf(b) : '?'}`)) return;
  pedra(set, 200); M.saltar(2);
  const o = S.buildings.get(b.id); const foto = x => JSON.stringify([x.x, x.y, x.w, x.h, x.esc, x.built, +x.progress.toFixed(6), x.need, x.brick, x.troca, x.ip && x.ip.n, x.ip && x.ip.h.length]);
  const f0 = foto(o); const p0 = o.progress; salva(); const o2 = S.buildings.get(b.id);
  ok('e4b o save no meio', !!o2 && foto(o2) === f0 && ocupa(o2), `${(p0 * 100).toFixed(0)}% depois de 2 anos; depois do save: ${o2 ? (foto(o2) === f0 ? 'o mesmo prédio, a mesma conta e o mesmo andamento' : 'MUDOU: ' + foto(o2)) : 'SUMIU'}`);
  M.saltar(1); const o3 = S.buildings.get(b.id);
  ok('e4c a obra segue', !!o3 && o3.progress >= p0, `um ano depois: ${o3 ? (o3.progress * 100).toFixed(0) + '%' : 'sumiu'}`);
  const c = checa(); ok('e4d verificador', c.ok, c.txt);
  // e5: o deus derruba no meio
  sim(() => V.destroyBuilding(o3, 'meteor')); const r = S.buildings.get(b.id);
  ok('e5a o deus derruba', !!r && r.type === 'ruin' && r.origType === 'maravilha' && r.w === 10 && !D.exists('o:' + b.id), `${r ? lado(r) + ' (era ' + r.origType + ')' : 'sumiu'}; o que a obra tinha recebido ${D.exists('o:' + b.id) ? 'AINDA NA OBRA' : 'foi com ela, no livro'}`);
  salva(); const c2 = checa(); ok('e5b verificador, depois do save', c2.ok, c2.txt);
  const rr = S.buildings.get(b.id); rr.ruinT = 0.01; M.viver(2);
  let presos = 0; for (let y = rr.y; y < rr.y + rr.h; y++) for (let x = rr.x; x < rr.x + rr.w; x++) if (S.occ[y * G.N + x] === b.id) presos++;
  ok('e5c a ruína some e o lote fica livre', !S.buildings.has(b.id) && !presos, `a ruína ${S.buildings.has(b.id) ? 'AINDA DE PÉ' : 'se foi'}; casas ainda dela: ${presos}`);
});

// ------------------------------ e6: a cidade que encolhe ------------------------------
run('e6', () => {
  abre(); const set = maior(); const b = set && sim(() => V.handFound(set, 'temple', 'templo', { built: true, R: 60 }));
  if (!ok('e6a o templo grande de pé', !!b && b.w === 4 && b.built, `${set ? set.name + ' (' + V.pop(set.id) + ')' : 'nenhuma cidade'}: ${lado(b)}`)) return;
  const quem = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v._ruler).sort((a, c) => c.age - a.age || a.id - c.id);
  sim(() => { for (const v of quem) { if ([...S.villagers.values()].filter(o => o.set === set.id).length < 30) break; V.kill(v, 'old'); } });
  const ch = Es.choose(set, 'temple'); const fac = G.Fac.get(set.fac);
  const g = sim(() => V.grow(set, fac, V.counts(set.id))); const o = S.buildings.get(b.id);
  ok('e6b a cidade que encolheu escolhe o pequeno, o grande fica', ch[0].id === 'santuario' && !!o && o.w === 4 && o.esc === 'templo' && o.built && (!g || g.id !== b.id), `${set.name} com ${V.pop(set.id)} pessoas escolhe ${ch.map(s => s.id + '/' + s.n).join(' > ')}; o templo continua ${o ? lado(o) : 'SUMIU'}`);
  const c = checa(); ok('e6c verificador', c.ok, c.txt);
});

// ------------------------------ e7: a ampliação no lugar ------------------------------
// (um santuário de pé no meio de um lote livre de 4 casas, numa cidade que já justifica o templo de 4 — e não o de 6, que a
// ampliação pediria: a menor que o escolhe, templo4(); Mênfis, a de antes, justifica o de 6 na metrópole da geração 15, T-493 —:
// o planejador o amplia)
function santuario(set) {
  set._noSite = {}; const P = sim(() => V.findSite(set, 'temple', undefined, 4)); if (!P) return null;
  return sim(() => V.handFound(set, 'temple', 'santuario', { x: P[0] + 2, y: P[1] + 2, R: 0, built: true }));
}
run('e7', () => {
  abre(); const set = templo4(); const fac = G.Fac.get(set.fac); const b0 = santuario(set);
  if (!ok('e7a o santuário', !!b0 && b0.w === 2 && b0.built, `${set.name}: ${lado(b0)}`)) return;
  civicas(set); pedra(set, 100);
  const id = b0.id, x0 = b0.x, y0 = b0.y, nm0 = V.buildName(b0), h0 = b0.ip.h.map(f => f.join(':')), walk0 = S.walkVer, hi = marca();
  const r = sim(() => V.grow(set, fac, V.counts(set.id)));
  if (!ok('e7b o planejador amplia', !!r && r.id === id, `V.grow ampliou ${lado(r)}`)) return;
  const B0 = Es.bill('temple', degrau('temple', 2)), B1 = Es.bill('temple', degrau('temple', 4));
  const dentro = r.x <= x0 && r.y <= y0 && r.x + r.w >= x0 + 2 && r.y + r.h >= y0 + 2;
  ok('e7c o mesmo prédio, maior', r.w === 4 && r.esc === 'templo' && !r.built && dentro && ocupa(r) && S.walkVer > walk0 && V.buildName(r) === nm0 && !!r.amp && r.amp.de === 2 && r.amp.esc === 'santuario',
    `#${r.id} «${V.buildName(r)}» de ${r.amp ? r.amp.de : '?'} para ${r.w} casas, o lote de antes dentro do novo (${x0},${y0} em ${r.x},${r.y}); o mapa avisado (${walk0} → ${S.walkVer})`);
  const h1 = r.ip.h.map(f => f.join(':')); const fato = r.ip.h[r.ip.h.length - 1];
  ok('e7d a mesma história, e o fato novo', h0.every((f, k) => h1[k] === f) && fato[1] === 'ampliado' && r.ip.n === 4, `a história de antes (${h0.length} fatos) inteira, e «${fato.join(' ')}»; o registro da planta de ${r.ip.n} casas`);
  const dv = V.delivered(r); const conta = soma(V.bill(r)), deve = soma(B1.cost) - soma(B0.cost); const lenha = D.ledger().filter(e => e[8] === 'clareira' && e[4] === 'o:' + r.id).length;
  ok('e7e a conta do que cresce', soma(dv) === (dv.wood || 0) && (dv.wood || 0) === lenha && Math.abs(conta - deve) < 1e-6 && r.progress > 0 && r.progress < 1, `a conta ${JSON.stringify(V.bill(r))} = o degrau de 4 menos o de 2 (${deve}); na obra só a madeira do chão novo (${dv.wood || 0}, ${lenha} toras no livro); o andamento começa na parte que está de pé (${(r.progress * 100).toFixed(0)}%)`);
  ok('e7f a crônica', linhas(hi, /começou a ampliar/).length > 0, (linhas(hi, /ampli/)[0] || { txt: 'nenhuma linha' }).txt);
  const c = checa(); ok('e7g verificador', c.ok, c.txt);
  const foto = x => JSON.stringify([x.x, x.y, x.w, x.esc, x.built, x.amp, x.need, x.troca, x.brick, +x.progress.toFixed(6), x.ip.n]);
  const f0 = foto(r); salva(); const r2 = S.buildings.get(id);
  ok('e7h o save no meio da ampliação', !!r2 && foto(r2) === f0 && ocupa(r2), r2 ? (foto(r2) === f0 ? 'a mesma obra, o mesmo lote' : 'MUDOU ' + foto(r2)) : 'SUMIU');
  const hj = marca(); sim(() => V.completeBuilding(r2));
  ok('e7i pronta', r2.built && !!r2.amp && r2.amp.fim === S.day && linhas(hj, /terminou a ampliação/).length > 0 && G.Interiors.plan(r2).ok, `${lado(r2)}; «${(linhas(hj, /ampli/)[0] || { txt: '-' }).txt}»; a planta de 4 casas ${G.Interiors.plan(r2).ok ? 'feita' : 'NÃO'}`);
  const c2 = checa(); ok('e7j verificador', c2.ok, c2.txt);
});
// ------------------------------ e8: o palácio que cresce, e o seu patrono ------------------------------
run('e8', () => {
  let set = null, b0 = null; const P6 = degrau('palacio', 6);
  // (um palácio clássico de pé num lugar com 6 casas livres em volta: o pódio de 3 m não basta perto destas capitais (D-115), e
  // aqui ele vai a 6 m só para pôr o palácio — o juiz é o mesmo. Nos mundos prontos, a metrópole primeiro: T-627)
  const pod = V.PODIUM; V.PODIUM = 4;
  try {
    const got = acha(() => {
      for (const s of [...S.settlements.values()].filter(o => (o.tier || 0) >= 2).sort((a, c) => V.pop(c.id) - V.pop(a.id))) {
        s._noSite = {}; const P = sim(() => V.findSite(s, 'palacio', undefined, 6)); if (!P) continue;
        const b = sim(() => V.handFound(s, 'palacio', 'antigo', { x: P[0] + 3, y: P[1] + 3, R: 0, built: true })); if (b) return { set: s, b0: b };
      }
      return null;
    });
    if (got) { set = got.set; b0 = got.b0; }
    if (!ok('e8a o palácio de antes', !!b0 && b0.w === 3, b0 ? `${got.mundo}: ${set.name}: ${lado(b0)}, de ${b0.patron || 'ninguém'}` : `nenhuma cidade com lugar (${MUNDOS.join(', ')})`)) return;
    const pat = b0.patronId && S.villagers.get(b0.patronId); const nm0 = V.buildName(b0); const id = b0.id;
    const pos = V.growLot(set, b0, P6); const r = pos && sim(() => V.enlarge(b0, P6, pos));
    ok('e8b o palácio cresce, o patrono mora nele', !!r && r.id === id && r.w === 6 && V.buildName(r) === nm0 && r.patron === b0.patron && (!pat || pat.palace === id),
      `${r ? lado(r) : 'nada'} «${r ? V.buildName(r) : '-'}»; ${pat ? pat.name + ' com o palácio #' + pat.palace : 'sem patrono vivo'}`);
    const c = checa(); ok('e8c verificador', c.ok, c.txt);
  } finally { V.PODIUM = pod; }
});
// ------------------------------ e9: a ampliação que ninguém alcança volta ao que era ------------------------------
run('e9', () => {
  abre(); const set = templo4(); const fac = G.Fac.get(set.fac); const b0 = santuario(set);
  if (!ok('e9a o santuário', !!b0, lado(b0))) return;
  civicas(set); pedra(set, 100); const x0 = b0.x, y0 = b0.y, id = b0.id;
  const r = sim(() => V.grow(set, fac, V.counts(set.id))); if (!ok('e9b ampliado', !!r && r.id === id, lado(r))) return;
  const big = { x: r.x, y: r.y }; r.unreach = 4; const hi = marca();
  sim(() => V.growStuck(set)); const o = S.buildings.get(id);
  let livre = 0; for (let y = big.y; y < big.y + 4; y++) for (let x = big.x; x < big.x + 4; x++) if (!(x >= x0 && x < x0 + 2 && y >= y0 && y < y0 + 2) && !S.occ[y * G.N + x]) livre++;
  ok('e9c volta ao que era', !!o && o.built && o.w === 2 && o.x === x0 && o.y === y0 && o.esc === 'santuario' && !o.amp && ocupa(o) && livre === 12 && !D.exists('o:' + id) && linhas(hi, /desistiu de ampliar/).length > 0,
    `${lado(o)}; as 12 casas da ampliação livres (${livre}); «${(linhas(hi, /ampli/)[0] || { txt: '-' }).txt}»`);
  const c = checa(); ok('e9d verificador', c.ok, c.txt);
});

// ------------------------------ e10: a obra grande guarda a pedra da cidade (D-117) ------------------------------
// (Roma com as obras dela todas de pé — o planejador com lugar para começar outras —, um ano com a maravilha em obra e um ano sem
// ela: os extras de pedra que a cidade começa em cada um; o que ela precisa para viver e para se guardar, nos dois)
const NEED = ['storehouse', 'farm', 'well', 'workshop', 'praca', 'mercado', 'temple', 'celeiro', 'doca', 'quartel', 'torre', 'muralha', 'portao', 'wall', 'gate'];
// (the town: the biggest where the wonder the god's hand founds still waits for stone — the rocks broken on its lot go into the
// work, D-121: in the metrópole of the generation 14 Roma's Colosseum got all its stone from the rocks of its lot, waited only for
// bricks, and was no great work waiting for stone, T-477 —; the year of the comparison only there)
function extras(comObra, sid) {
  abre(); const set = S.settlements.get(sid); sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin') V.completeBuilding(o); });
  const b = comObra ? sim(() => V.handFound(set, 'maravilha', 'maravilha', { R: 60 })) : null; const great = V.greatWork(set, V.counts(set.id));
  if (comObra && !(b && great && great.id === b.id)) return { set, b, great, out: null };
  const id0 = S.nextId; M.saltar(1); const out = [];
  for (const o of S.buildings.values()) if (o.id >= id0 && o.set === set.id) { const d = G.BDEF[o.type === 'ruin' ? o.origType : o.type]; if (d && !d.housing && (d.cost.stone || 0) >= 8 && !NEED.includes(o.type)) out.push(o.type); }
  return { set, b, great, out };
}
run('e10', () => {
  abre(); const ids = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && Es.can('maravilha', G.Civ.idOfFac(s.fac) || 'classico', 10)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id).map(s => s.id);
  let A = null; const tried = []; for (const sid of ids) { A = extras(true, sid); tried.push(`${A.set.name} ${A.b ? 'pedra ' + (A.b.need.stone || 0) : '-'}`); if (A.out) break; }
  if (!ok('e10a a maravilha em obra guarda a pedra', !!A && !!A.out, A && A.out ? `${A.set.name}: ${lado(A.b)} espera pedra (${A.b.need.stone}): é a obra grande da cidade` : `nenhuma cidade onde a maravilha espera pedra (${tried.join(' · ')})`)) return;
  const B = extras(false, A.set.id);
  ok('e10b nenhum extra de pedra começa enquanto ela espera', !A.out.length, `um ano com a obra grande: ${A.out.length} extras de pedra (${A.out.join(', ') || '-'}); sem ela: ${B.out.length} (${B.out.join(', ') || '-'})${B.out.length ? '' : ' — neste ano a prova não distingue'}`);
});

// ------------------------------ e13: os palácios pela escada ------------------------------
// (o grande palácio e o colossal vão para fora da cidade, no chão aberto da corte — court.js —, agora do tamanho do degrau tentado:
// o planejador pede à corte o lote de 8 e de 10 casas. Perto das capitais da metrópole não há lote dessa largura nem com 6 m de
// pódio (D-115): a prova é num mundo novo, a semente do soak, com a terra ainda aberta)
run('e13', () => {
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4, temper: 'normal' }); S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; M.saltar(3);
  const pod = V.PODIUM; const out = []; let bom = 0, ruim = 0, ergueu = null;
  try {
    for (const set of [...S.settlements.values()].sort((a, c) => V.pop(c.id) - V.pop(a.id)).slice(0, 4)) {
      for (const [t, n] of [['grande_palacio', 8], ['palacio_colossal', 10]]) {
        set._noSite = {}; const p = sim(() => V.findSite(set, t, undefined, n)); if (!p) { out.push(`${set.name} ${t}/${n}: -`); continue; }
        let livre = true; for (let y = p[1]; y < p[1] + n; y++) for (let x = p[0]; x < p[0] + n; x++) if (S.occ[y * G.N + x] || S.wall[y * G.N + x]) livre = false;
        const d = G.dist(p[0] + n / 2, p[1] + n / 2, set.cx, set.cy); const Rc = Math.round((set.radius || 8) + (t === 'palacio_colossal' ? 12 : 8));
        const bem = livre && G.W.slope(p[0], p[1], n, n) <= V.PODIUM && V.siteReached(set, p[0], p[1], { w: n, h: n });
        if (bem) bom++; else ruim++; out.push(`${set.name} ${t}/${n} a ${d.toFixed(0)} casas (a corte vai a ${Rc})${bem ? '' : ' RUIM'}`);
        if (bem && !ergueu && t === 'grande_palacio') { rico(set); ergueu = sim(() => V.startProject(set, t)); }
      }
    }
    ok('e13a a corte acha o lote do degrau', bom > 0 && !ruim, out.join(' · '));
    ok('e13b o grande palácio pela escada', !ergueu || (ergueu.w === 8 && ergueu.esc === 'grande_palacio'), ergueu ? `ergue ${lado(ergueu)}` : 'nenhuma capital com lote para o de 8 (só o lote foi provado)');
    const c = checa(); ok('e13c verificador', c.ok, c.txt);
  } finally { V.PODIUM = pod; }
});

// ------------------------------ e14: a mão do deus prefere o chão que o pódio cobre ------------------------------
// (no raio dela, um lote de até 3 m com o anel sem penhasco antes de um mais perto e mais íngreme; sem nenhum, o mais perto. A
// cidade pelo chão que tem, não pelo nome: a primeira cujo lote livre mais perto é íngreme demais e que tem no raio um que o pódio
// cobre — Óstia, a de antes, não tem nenhum assim na metrópole da geração 15, e a mão ficava com o íngreme, como deve, T-493)
run('e14', () => {
  abre(); const n = 4; const N = G.N;
  const livre = (x, y) => { for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return false; const i = ty * N + tx; if (S.occ[i] || S.wall[i] || S.type[i] < G.T.SAND) return false; if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0)) return false; } return true; };
  const plano = (x, y) => { if (G.W.slope(x, y, n, n) > V.PODIUM) return false; for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) if ((ty < y || ty >= y + n || tx < x || tx >= x + n) && S.cliff[ty * N + tx]) return false; return true; };
  const busca = s => { const ox = Math.floor(s.cx), oy = Math.floor(s.cy); let perto = null, flat = null;
    for (let r = 0; r <= 40 && !(perto && flat); r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - 2, y = oy + dy - 2; if (!livre(x, y)) continue; if (!perto) perto = { x, y, sl: G.W.slope(x, y, n, n) }; if (!flat && plano(x, y)) flat = { x, y }; }
    return { perto, flat }; };
  const set = [...S.settlements.values()].filter(s => G.Fac.get(s.fac)).sort((a, c) => a.id - c.id).find(s => { const q = busca(s); return !!q.perto && q.perto.sl > V.PODIUM && !!q.flat; });
  if (!ok('e14 uma cidade com o lote mais perto íngreme e um plano no raio', !!set, set ? set.name : 'nenhuma')) return;
  const { perto, flat } = busca(set);
  const b = sim(() => V.handFound(set, 'temple', 'templo', { R: 40 })); const sl = b ? G.W.slope(b.x, b.y, n, n) : 99;
  ok('e14 a mão do deus prefere o pódio', !!b && sl <= V.PODIUM && b.x === flat.x && b.y === flat.y, `o lote livre mais perto de ${set.name}: ${perto.x},${perto.y} com ${(perto.sl * 1.5).toFixed(1)} m; o mais perto que o pódio cobre, ${flat.x},${flat.y}; a mão pôs ${lado(b)} com ${(sl * 1.5).toFixed(1)} m (o mais perto era íngreme demais: foi a outro)`);
});

// ------------------------------ e15: a renda de pedra e o pedido (D-120) ------------------------------
// (o livro conta a pedra que as mãos do povo trazem ao estoque — a entrega —, não a que a prova põe; um degrau maior de uma obra
// pública só com a pedra de vinte anos — a do estoque e a renda —, o clássico pela pedra guardada, como antes)
run('e15', () => {
  // (a capital: a mais povoada com lote para o palácio de 6, pela busca do jogo)
  // (nos mundos prontos, a metrópole primeiro: T-627)
  const got = acha(() => { const c = capitais().find(s => !!loteDe(s, 'palacio', 6)); return c ? { set: c } : null; }); const set = got && got.set;
  if (!ok('e15 uma capital com lote para o palácio de 6', !!set, set ? `${got.mundo}: ${set.name}` : `nenhuma (${MUNDOS.join(', ')})`)) return;
  const f = G.Fac.get(set.fac); const fid = f.id; const P6 = degrau('palacio', 6);
  // (the people's count of the day begun clean, in the ledger's own form — f.pedra —: the income is the bigger of today's and
  // yesterday's, and in the metrópole of the generation 14 Roma's people had brought 144 yesterday, more than the 12 of the case:
  // the income did not move, T-477)
  f.pedra = [S.day, 0, 0];
  const i0 = V.stoneIncome(fid); sim(() => { D.make('f:' + fid, 'stone', 12, { code: 'entrega' }); D.make('f:' + fid, 'stone', 5, { code: 'teste' }); }); const i1 = V.stoneIncome(fid);
  ok('e15a a renda pelo livro', i1 === i0 + 12, `antes ${i0}, depois de 12 entregues e 5 postas pela prova: ${i1}`);
  sim(() => D.use('f:' + fid, 'stone', f.stock.stone || 0, { code: 'teste' })); const B = Es.bill('palacio', P6).cost.stone;
  const com = n => { f.pedra = [S.day, 0, n]; return V.affords(set, 'palacio', P6); };
  const pouca = Math.floor(B * 0.7 / V.YEARS) - 1, bastante = Math.ceil(B / V.YEARS);
  const a0 = com(0), a1 = com(pouca), a2 = com(bastante); const g0 = (f.pedra = [S.day, 0, 0], V.stoneGate(set, 'palacio', 60)), g1 = (f.pedra = [S.day, 0, bastante], V.stoneGate(set, 'palacio', 60));
  ok('e15b o palácio de 6 pela renda', !a0 && !a1 && a2 && !g0 && g1, `a pedra do degrau ${B} (menos o tijolo, se houver); o estoque vazio: com renda 0 ${a0 ? 'PAGA' : 'não paga'}, ${pouca}/ano ${a1 ? 'PAGA' : 'não paga'}, ${bastante}/ano ${a2 ? 'paga' : 'NÃO PAGA'}; o portão da corte: ${g0 ? 'ABRE' : 'fecha'} e ${g1 ? 'abre' : 'FECHA'}`);
  f.pedra = [S.day, 0, 0]; set._noSite = {}; const n0 = S.nextId; const b0 = sim(() => V.startProject(set, 'palacio')); const nada = !b0 && S.nextId === n0;
  f.pedra = [S.day, 0, bastante]; set._noSite = {}; const b1 = sim(() => V.startProject(set, 'palacio'));
  ok('e15c sem a pedra, o degrau maior fica para depois', nada && !!b1 && b1.w === 6 && b1.esc === 'palacio', `sem renda: ${nada ? 'nada começa' : 'COMEÇOU ' + lado(b0)}; com ${bastante}/ano: ${lado(b1)}`);
  const sant = Es.steps('temple')[0]; const t0 = V.affords(set, 'temple', sant, 30); pedra(set, 30); const t1 = V.affords(set, 'temple', sant, 30);
  ok('e15d o clássico pela pedra guardada', !t0 && t1, `o santuário pedindo 30 de pedra: com o estoque vazio ${t0 ? 'PAGA' : 'não'}, com 30 ${t1 ? 'paga' : 'NÃO'}`);
  const c = checa(); ok('e15e verificador', c.ok, c.txt);
});

// ------------------------------ e16: a vez da obra grande só com a cidade alimentada e em casa (D-120) ------------------------------
run('e16', () => {
  // (a capital alimentada e em casa — ninguém crescido sem casa —, a mais povoada onde a mão do deus acha lote para o palácio de 6)
  abre(); let set = null, b = null;
  for (const s of capitais()) { if (!V.foodSafe(s.fac) || V.housingInfo(s.id).homeless) continue; b = sim(() => V.handFound(s, 'palacio', 'palacio', { R: 60 })); if (b) { set = s; break; } }
  if (!ok('e16a a obra grande', !!b && b.w === 6 && !b.built, b ? `${set.name}: ${lado(b)}` : 'nenhuma capital alimentada e em casa com lote para o palácio de 6')) return;
  const fid = set.fac; const f = G.Fac.get(fid);
  const fed = V.foodSafe(fid), hi = V.housingInfo(set.id); const v1 = V.vez(set), p1 = V.workPri(b);
  // (a comida de volta pelo depósito até o lugar que o povo tem: o depósito não põe o que não cabe, e na metrópole refeita depois
  // da geração 15 Roma guardava 1238 com lugar para 1080 — tudo o que voltava era recusado, e a cidade ficava sem comida, T-496)
  const food = f.stock.food || 0; sim(() => D.use('f:' + fid, 'food', food, { code: 'teste' })); const v2 = V.vez(set), p2 = V.workPri(b);
  sim(() => D.make('f:' + fid, 'food', food, { code: 'teste', part: true }));
  const adulto = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 16 && v.home && !v.captive).sort((a, c) => a.id - c.id)[0]; const casa = adulto.home;
  adulto.home = 0; const v3 = V.vez(set), p3 = V.workPri(b); adulto.home = casa; const v4 = V.vez(set);
  const santo = sim(() => V.handFound(set, 'temple', 'santuario', { R: 60 })); const p5 = santo ? V.workPri(santo) : 0;
  ok('e16b a vez', fed && !hi.homeless && v1 === 1 && p1 === -V.GREAT_PRI && v2 === 0 && p2 === 0 && v3 === 0 && p3 === 0 && v4 === 1 && !p5,
    `${set.name} alimentada (${Math.round(food)} de comida para ${G.Fac.pop(fid)}) e em casa: a vez ${v1} (${p1}); sem comida: ${v2} (${p2}); um adulto sem casa: ${v3} (${p3}); de volta: ${v4}; um santuário em obra: ${p5}`);
  salva(); const s2 = S.settlements.get(set.id); ok('e16c a vez vai no save', !!s2 && (s2.vez || 0) === v4, `depois do save: ${s2 ? s2.vez : 'SEM A CIDADE'}`);
});

// ------------------------------ e17: de fora e de dentro (D-120) ------------------------------
// (o Coliseu romano procura até o raio e vinte; o palácio, até o raio e seis e depois doze; quem não acha diz por quê, com números)
run('e17', () => {
  // (a capital romana, cuja maravilha fica fora da cidade, e a mais povoada das capitais cuja maravilha fica dentro)
  abre(); const roma = doPovo('romano'), argos = capitais().find(s => !V.fora(s, 'maravilha'));
  if (!ok('e17 a capital romana e uma de maravilha dentro', !!roma && !!argos, `${roma ? roma.name : 'nenhuma capital romana'}; ${argos ? argos.name : 'nenhuma capital de maravilha dentro'}`)) return;
  const r1 = V.reachOf(roma, 'maravilha').join(), r2 = V.reachOf(roma, 'palacio').join(), r3 = V.reachOf(argos, 'maravilha').join();
  ok('e17a de fora e de dentro', r1 === '20' && r2 === '6,12' && r3 === '6,12', `o Coliseu de ${roma.name} até o raio e ${r1}; o palácio de ${roma.name} ${r2}; a maravilha de ${argos.name} ${r3}`);
  const w = V.landWhy(roma, 'maravilha', 10); roma._noSite = {}; const q = sim(() => V.findSite(roma, 'maravilha', undefined, 10));
  const R10 = Math.round(G.Urban.radius(roma, { w: 10 }, V.pop(roma.id))) + 20;
  ok('e17c o Coliseu sem terra diz por quê', w.R === R10 && (w.free || !q) && /\d/.test(w.txt), `«${w.txt}»`);
  // (the Roman capital's palace of 6 by the game's search, within its reach — in the ready worlds, the metrópole first, where the
  // Roman capital has a lot of 6: in the generation 18 only the «cidade» has one, the metrópole's Roma «sem terra», e20, T-627.
  // After e17c, which reads the metrópole's Roma)
  const got = acha(() => { const r = doPovo('romano'); if (!r) return null; r._noSite = {}; const P = sim(() => V.findSite(r, 'palacio', undefined, 6)); return P ? { r, p: P } : null; });
  const r6 = got && got.r, p = got && got.p; const R = r6 ? G.Urban.radius(r6, { w: 6 }, V.pop(r6.id)) : 0;
  const d = p ? G.dist(p[0] + 3, p[1] + 3, r6.cx, r6.cy) : 0;
  ok('e17b o palácio de 6 de Roma, dentro do alcance', !!p && !p.demolish && d <= R + 12, p ? `${got.mundo}: ${r6.name}: em ${p.join(',')}, a ${d.toFixed(0)} casas (o raio ${R})` : `${roma.name}: sem lote (${MUNDOS.join(', ')})`);
});

// ------------------------------ e18: limpar o lote — as ruas menores que o anel junta, a madeira para a obra (D-120) ------------------------------
run('e18', () => {
  // (a cidade e o lote pelo que são: a menor que justifica o templo de 4 — templo4() —, depois as capitais; a primeira com lote de 4
  // pela busca do jogo cujo anel inteiro se anda — por onde o anel junta as pontas da rua que a prova pinta —, e sem nenhum assim, a
  // primeira com lote)
  abre(); const N = G.N; const anel = ([x, y]) => { for (let ty = y - 1; ty <= y + 4; ty++) for (let tx = x - 1; tx <= x + 4; tx++) if ((ty < y || ty >= y + 4 || tx < x || tx >= x + 4) && !G.W.walkable(ty * N + tx)) return false; return true; };
  const cands = [...new Set([templo4(), ...capitais()].filter(Boolean))]; let set = null, P = null;
  for (const s of cands) { const p = loteDe(s, 'temple', 4); if (p && anel(p)) { set = s; P = p; break; } }
  if (!set) for (const s of cands) { const p = loteDe(s, 'temple', 4); if (p) { set = s; P = p; break; } }
  if (!ok('e18a um lote de 4', !!P, P ? `${set.name}: ${P.join(',')}` : 'nenhum')) return;
  const [x, y] = P; const row = y + 1; const salvo = [];
  const pinta = (tx, ty, r) => { const i = ty * N + tx; salvo.push([i, S.road[i]]); S.road[i] = r; };
  for (let tx = x - 1; tx <= x + 4; tx++) pinta(tx, row, 1); // (uma rua de terra de lado a lado, do anel ao anel)
  const L1 = V.lotFor(set, 'temple', 4, x, y);
  const volta = []; for (let tx = x - 1; tx <= x + 4; tx++) volta.push([tx, y - 1], [tx, y + 4]); // (as fileiras de cima e de baixo do anel, inteiras)
  const tampa = volta.map(([tx, ty]) => sim(() => V.addBuilding('house', tx, ty, set.id, true)));
  const L2 = V.lotFor(set, 'temple', 4, x, y); const sem = V.relinks(set, x, y, 4, null);
  sim(() => { for (const o of tampa) V.removeBuilding(o); });
  pinta(x + 2, row, 3); const L3 = V.lotFor(set, 'temple', 4, x, y);
  for (const [i, r] of salvo.reverse()) S.road[i] = r;
  ok('e18b a rua menor que o anel junta', !!L1 && !L2 && !sem && !L3, `uma rua de terra cortando o lote: ${L1 ? 'cabe (o anel junta as pontas)' : 'NÃO CABE'}; com as voltas do anel fechadas por casas: ${L2 ? 'CABE' : 'não'}; com um trecho de estrada: ${L3 ? 'CABE' : 'não'}`);
  // (a madeira das árvores do lote vai para a obra do degrau maior, posta no lote P como a cidade a põe — V.startProject no lote
  // que o V.findSite deu. A mão do deus, pedida no canto do lote, toma o ponto pelo meio, lê o raio 0 como 40 e quer seco o anel
  // inteiro — o de P, à beira do rio, tem quatro casas de água: na metrópole da geração 15 pôs o templo a 27 casas, onde havia
  // três árvores, T-493)
  let plant = 0; for (let ty = y; ty < y + 4; ty++) for (let tx = x; tx < x + 4; tx++) if (!S.treeAt[ty * N + tx] && G.Nature.addTree(tx + 0.5, ty + 0.5, 'oak', 0.9)) plant++;
  let grown = 0; for (let ty = y; ty < y + 4; ty++) for (let tx = x; tx < x + 4; tx++) { const t = S.trees.get(S.treeAt[ty * N + tx]); if (t && t.stage === 'grow' && t.size > 0.5) grown++; }
  const l0 = (S.ledgerN || 0); const b = sim(() => V.startProject(set, 'temple', P, degrau('temple', 4)));
  const lenha = D.ledger().filter(e => e[0] > l0 && e[8] === 'clareira'); const naObra = b ? lenha.filter(e => e[4] === 'o:' + b.id).length : 0;
  ok('e18c a madeira do lote vai para a obra', !!b && b.x === x && b.y === y && grown > 0 && naObra === Math.min(grown, Es.bill('temple', degrau('temple', 4)).cost.wood), `${grown} árvores crescidas no lote (${plant} plantadas pela prova): ${naObra} toras na obra ${b ? '#' + b.id : '-'}, ${lenha.length - naObra} no estoque`);
  const c = checa(); ok('e18d verificador', c.ok, c.txt);
});

// ------------------------------ e19: os jogos do Coliseu, pelos lugares da planta (D-120) ------------------------------
// (o Coliseu de Roma de pé: os lugares do público — as fileiras e o pódio, 'assistir' — e da areia — 'lutar' — que a planta do
// degrau tem; os lutadores, um posto para cada lugar de luta; um dia de jogos: os lutadores na areia, o público nas fileiras,
// tantos quantos vêm, e no fim ninguém lá dentro)
run('e19', () => {
  abre(); const set = doPovo('romano'); const In = G.Interiors, Tt = G.Teatro, E = G.Eco; // (a capital romana: o Coliseu do M1)
  let b = set && sim(() => V.handFound(set, 'maravilha', 'maravilha', { R: 60, built: true }));
  if (!ok('e19a o Coliseu de pé', !!b && b.w === 10 && b.built && G.Interiors.plan(b).ok, set ? `${set.name}: ${lado(b)}` : 'nenhuma capital do povo romano')) return;
  const T = In.table(b); const of = u => (T && T.byUse.get(u)) || []; const assentos = of('assistir').filter(e => e.it.kind === 'fileira').length, emPe = of('assistir').filter(e => e.it.kind === 'marca').length;
  const ver = of('assistir').length, luta = of('lutar').length, jb = E.jobsOf(b);
  ok('e19b os lugares da planta', assentos >= 700 && emPe >= 50 && luta === 8 && !!jb && jb.n === luta && jb.role === 'ator', `${assentos} assentos nas fileiras e ${emPe} em pé no pódio (${ver} para ver), ${luta} na areia; os postos: ${jb ? jb.n + ' de ' + jb.role : 'nenhum'}`);
  // (a day of games: the town's feast of the day out of the show's hours — D-130: the ludi of a Roman town, from 0,30 to 0,438,
  // fall on the doors of the Colosseum, open at 0,40 for the walk from the far end of the town, and that day the games are the
  // feast's own; the metrópole of the generation 14 was saved on such a day, T-477 —: the world goes on a year, at most three,
  // to a day that leaves the show its hours)
  const choca = () => { const fw = G.Fest && G.Fest.window ? G.Fest.window(set) : null; const h = Tt.horas(b); return !!fw && fw[0] < h.fecha && fw[1] > h.abre; };
  for (let k = 0; k < 3 && choca(); k++) { const id = b.id; M.saltar(1); b = S.buildings.get(id); }
  // (and who rules rules through the games: the term of the ruler begun today (f.term, the polity's), no election of the world's
  // own in the middle of them — on the day after the ludi the republic of Lavínio elected Sexto at 0,426, with the doors open, and
  // Flávia, called to the throne, was of the court, T-477)
  G.Fac.get(set.fac).term = S.day;
  // (os lutadores: oito adultos de Roma no ofício, a cada um o seu posto pelo repartidor do povo — E.place —; livres para o dia
  // pela regra do chamado do palco (callActors: nada que pese mais que o dia de trabalho, as mãos sem carga), nunca quem governa
  // nem a corte do camarote, que vão aos seus lugares, e alimentados e descansados para os jogos, como a corte: na metrópole da
  // 14ª rodada, entre os oito primeiros estavam quem governa, uma mercadora numa caravana e três que a fome e o sono levaram do
  // palco — a peça das 0,60 sem ninguém nele, e o espetáculo acabou «sem atores», T-533)
  const rei0 = G.Politics.ruler(G.Fac.get(set.fac));
  const sobra = v => v.set === set.id && v.age >= 18 && v.age <= 55 && !v.captive && !v.jail && !v.aboard && v.role !== 'guerreiro' && v !== rei0 && Tt.boxOf(v, b) !== 'corte' && !(v.carry && v.carry.n > 1e-6) && !(v.task && (v.task.pri || 0) > 1);
  let n = 0; for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) { if (n >= luta) break; if (!sobra(v) || v.role === 'ator') continue; v.role = 'ator'; v.job = 0; sim(() => G.Vg.endTask(v)); v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 85); n++; }
  sim(() => E.place(set)); const cast = Tt.actorsOf(b);
  // (o camarote — D-125 —: quem governa e até cinco da corte de Roma — a família de quem governa, depois os nobres do povo (o
  // grupo 'nobreza' do polity.js) —, descansados e com as moedas da entrada: até quatro no banco, o quinto nas fileiras)
  const rei = G.Politics.ruler(G.Fac.get(set.fac));
  const corte = [...S.villagers.values()].filter(v => v !== rei && v.set === set.id && v.age >= 16 && !v.captive && !v.jail && !v.aboard && v.role !== 'ator' && Tt.boxOf(v, b) === 'corte').sort((a, c) => a.id - c.id).slice(0, 5);
  if (VERB) console.log('  a corte:', corte.map(v => `${v.name} #${v.id} ${v.grp || '-'}`).join(', '), '; quem governa:', rei.name, rei.set === set.id ? 'em Roma' : 'fora');
  // (trazidos à porta do Coliseu — quem governa mora noutra cidade —, para chegarem nos jogos de hoje, de mãos livres: o que
  // traziam vai aonde ia antes, pela regra da carga que não segue (A.holdCarry, Village.kill) — a de um trabalho no chão onde
  // estavam, para outra mão; a de um lugar ao seu lugar (a casa leva tudo o que é seu, D-059); a sem destino ao armazém do povo;
  // a água derramada —, no livro, com o motivo da prova. Com carga nos braços, Cornélia, que governa Roma de outra cidade, não
  // foi mandada aos jogos (o Tt.visit pede as mãos livres, D-094), e o camarote nunca teve o seu trono, na reg16 e na ponta)
  const maosLivres = v => { const c = v.carry; if (!c || !(c.n > 1e-6)) return; const fid = G.Fac.idOfV(v), op = c.op ? G.Act.get(c.op) : null;
    if (op && G.Act.live(op)) D.drop('v:' + v.id, c.k, c.n, v.x, v.y, { op: op.id, code: 'pousou', by: v.id, fac: fid });
    else if (c.k === 'water') D.use('v:' + v.id, 'water', c.n, { code: 'agua', by: v.id, mine: true });
    else if (c.to && D.exists(c.to)) D.move('v:' + v.id, c.to, c.k, c.n, { code: 'teste', by: v.id, part: true, floor: c.to[0] === 'h' });
    if (v.carry && v.carry.n > 1e-6 && D.exists('f:' + fid)) D.move('v:' + v.id, 'f:' + fid, v.carry.k, v.carry.n, { code: 'teste', by: v.id, part: true });
    if (v.carry && v.carry.n > 1e-6) D.drop('v:' + v.id, v.carry.k, v.carry.n, v.x, v.y, { code: 'pousou', by: v.id, fac: fid }); };
  const porta = G.Vg.door(b); for (const v of [rei, ...corte]) { sim(() => { G.Vg.endTask(v); maosLivres(v); }); v.inside = 0; v.sleeping = false; v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 85); v.x = porta[0] + 1 + (v.id % 3); v.y = porta[1] + 1; v.path = null; D.make(E.coinRef(v), 'moedas', 5, { code: 'teste' }); }
  let caixa = null, caixaSalvo = null; const lugar = v => { const p = In.placeOf(v); return p ? { use: p.use, kind: p.it ? p.it.kind : '-', st: p.st, pose: p.pose, quadril: Math.round((p.y + In.SIT_H) * 100) / 100 } : null; };
  // (toda a corte lá dentro, da lista da prova ou não — quem mais da corte vem aos jogos disputa o banco pela mesma regra: na
  // metrópole refeita depois da geração 15, quatro da família de Antônia, dois de fora da lista, tinham o banco, e três nobres
  // da lista ficaram nas fileiras, como a regra manda, T-496 —: cada um com o seu lugar e se é da família de quem governa)
  const parente = v => { const r = G.Politics.ruler(G.Fac.get(set.fac)); return !!r && (v.id === r.partner || v.mother === r.id || v.father === r.id || r.mother === v.id || r.father === v.id || (!!r.mother && v.mother === r.mother) || (!!r.father && v.father === r.father)); };
  const daCorte = () => [...S.villagers.values()].filter(v => v.inside === b.id && v.task && v.task.type === 'teatro' && Tt.boxOf(v, b) === 'corte').sort((a, c) => a.id - c.id).map(v => ({ id: v.id, kin: parente(v), q: lugar(v) }));
  S.time = Tt.EARLY - 0.02; S.weather.rain = 0; S.weather.storm = 0; S.time = Math.max(S.time, Tt.opensAt(b) - 0.01);
  // (um dia de jogos com o céu limpo: os eventos do acaso do mundo desligados pelo botão do jogo — G.DV.events, o do modo
  // desenvolvedor —, passo a passo. Na metrópole da geração 15 a tempestade do mundo veio às 0,555, e com ela todos os de
  // prioridade abaixo de 1,05 vão se abrigar em casa: o camarote saiu antes da peça, T-493)
  // (e os lutadores no ofício durante os jogos, pela mão do deus, como o lazer.js segura o seu ator: o repartidor, a cada 4 s, os
  // pode levar ao ofício que a cidade pede mais (D-090, o corte dos ofícios) — na metrópole da 16ª rodada, com os rebanhos do
  // L-637 pedindo pastores, as três lutadoras de Roma deixaram o ofício cinco segundos depois do posto, antes das portas, e o
  // espetáculo nunca abriu, T-569)
  const castIds = cast.map(v => v.id);
  const segura = () => { for (const id of castIds) { const v = S.villagers.get(id); if (v && (v.role !== 'ator' || v.job !== b.id)) { v.role = 'ator'; v.job = b.id; } } };
  const passo = () => { segura(); const e0 = G.DV.events; G.DV.events = 0; try { M.viver(1); } finally { if (e0 === undefined) delete G.DV.events; else G.DV.events = e0; } segura(); };
  let op = null; for (let k = 0; k < 40 && !op; k++) { passo(); op = Tt.dia(b); }
  let salvo = null; // (o save no meio dos jogos: os lutadores de volta à areia, cada um no seu lugar de luta)
  if (!ok('e19c os jogos do dia', cast.length > 0 && !!op, `${cast.length} lutadores com o posto no Coliseu; o espetáculo ${op ? '#' + op.id + ' aberto' : 'NÃO abriu'}`)) return;
  let mais = 0, quem = 0, naAreia = 0, nasFileiras = 0;
  for (let k = 0; k < 160 && Tt.dia(b); k++) {
    passo();
    if (op.data.fase === 'portas' && !caixa) { caixa = { mandados: 0 }; for (const v of [rei, ...corte]) { const t = sim(() => Tt.visit(v, b)); if (t) caixa.mandados++; else if (VERB) console.log('  não foi aos jogos:', v.name, v.id, 'tarefa', v.task && v.task.type, 'moedas', E.purse(v), 'chega', G.W.reaches(v, ...G.Vg.door(b)), 'dentro', v.inside, 'dorme', v.sleeping); } }
    if (VERB && caixa && k % 15 === 0) console.log(`  k${k} ${op.data.fase}:`, [rei, ...corte].map(v => `${v.name}#${v.id} ${v.task ? v.task.type + '/' + v.task.st : '-'} ${v.inside === b.id ? 'dentro ' + ((In.placeOf(v) || {}).use || '?') : 'fora'}`).join(' | '));
    // (no camarote, quem governa e os da corte que vieram — um chamado do mundo pode levar algum antes —, depois de um passo dentro)
    if (op.data.fase === 'peca' && caixa && !caixa.rei && rei.inside === b.id && corte.some(v => v.inside === b.id)) { const vieram = corte.filter(v => v.inside === b.id); caixa = Object.assign(caixa, { rei: lugar(rei), corte: vieram.map(lugar), ids: vieram.map(v => v.id), todos: daCorte() }); }
    if (op.data.fase === 'portas' || op.data.fase === 'peca') for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) { if (v.set !== set.id || v.age < 16 || v.role === 'ator' || v.sleeping || v.inside || (v.task && (v.task.type === 'teatro' || (v.task.pri || 0) >= 1))) continue; if (sim(() => Tt.visit(v, b))) quem++; }
    if (op.data.fase === 'peca') { let fi = 0, ar = 0; for (const v of S.villagers.values()) { if (v.inside !== b.id) continue; const p = In.placeOf(v); if (p && p.use === 'assistir') fi++; if (p && p.use === 'lutar') ar++; }
      mais = Math.max(mais, Object.keys(op.data.plateia).length); nasFileiras = Math.max(nasFileiras, fi); naAreia = Math.max(naAreia, ar);
      if (ar && !salvo) { const id = b.id, oid = op.id; const antes = caixa && caixa.rei; salva(); b = S.buildings.get(id); op = G.Act.get(oid); passo();
        if (antes) caixaSalvo = { rei: lugar(S.villagers.get(rei.id)), corte: caixa.ids.map(id => lugar(S.villagers.get(id))), todos: daCorte() };
        const lut = Object.keys(op.data.atores).map(k => S.villagers.get(+k)).filter(Boolean); salvo = { ar, usos: lut.map(v => (v.task && v.task.use) || '-'), naAreia: lut.filter(v => { const p = In.placeOf(v); return p && p.use === 'lutar'; }).length }; } }
  }
  ok('e19g o save no meio dos jogos', !!salvo && salvo.naAreia > 0 && salvo.usos.every(u => u === 'lutar'), salvo ? `${salvo.ar} na areia antes do save; depois, os lutadores com a tarefa de ${[...new Set(salvo.usos)].join(', ')} e ${salvo.naAreia} num lugar de luta` : 'sem save (ninguém na areia)');
  // (o camarote: quem governa sentado no trono, o quadril no assento de 0,5 m; o banco da planta cheio da corte que veio,
  // sentada — a família de quem governa antes dos nobres —, quem passa dele nas fileiras; e o save no meio dos jogos devolve cada
  // um ao seu lugar)
  const usos = L => L.map(q => (q ? q.use : '-')); const nb = (T.byUse.get('corte') || []).length;
  const okR = q => !!q && q.use === 'trono' && q.kind === 'trono-camarote' && q.st === 'sit' && q.pose === 'sentado' && Math.abs(q.quadril - 0.5) < 1e-6;
  const banco = L => L.filter(e => e.q && e.q.use === 'corte'), fora = L => L.filter(e => !(e.q && e.q.use === 'corte'));
  const okC = L => !!L && L.length > 0 && nb > 0 && banco(L).length === Math.min(nb, L.length) && banco(L).every(e => e.q.kind === 'banco-corte' && e.q.st === 'sit') && fora(L).every(e => e.q && e.q.use === Tt.seatUse(b)) && !(banco(L).some(e => !e.kin) && fora(L).some(e => e.kin));
  const diz = L => `a corte lá dentro ${L.length} (${L.filter(e => e.kin).length} da família): no banco de ${nb}, ${banco(L).length} (${banco(L).filter(e => e.kin).length} da família); nas fileiras ${fora(L).filter(e => e.q && e.q.use === Tt.seatUse(b)).length} de ${fora(L).length}`;
  ok('e19h o camarote: quem governa no trono, a corte no banco', !!caixa && okR(caixa.rei) && okC(caixa.todos), caixa && caixa.rei ? `${rei.name} no ${caixa.rei.kind} (${caixa.rei.use}, ${caixa.rei.pose}, o quadril a ${caixa.rei.quadril} m); ${diz(caixa.todos)}; da lista da prova, ${caixa.corte.length} dos ${corte.length} vieram: ${usos(caixa.corte).join(', ')}` : `${caixa ? caixa.mandados : 0} de ${1 + corte.length} mandados aos jogos; o camarote não encheu`);
  ok('e19i o save no meio dos jogos devolve o camarote', !!caixaSalvo && okR(caixaSalvo.rei) && okC(caixaSalvo.todos), caixaSalvo ? `depois do save: ${caixaSalvo.rei ? caixaSalvo.rei.use : '-'}; ${diz(caixaSalvo.todos)}` : 'sem save');
  M.viver(2); // (os bebês no colo saem com quem os carrega, no passo seguinte)
  const lista = [...S.villagers.values()].filter(v => v.inside === b.id); const dentro = lista.length;
  if (VERB || dentro) console.log('  lá dentro:', lista.map(v => { const c = v.carrier && S.villagers.get(v.carrier); return `${v.id} ${v.role} ${v.task ? v.task.type + '/' + v.task.st + '/' + (v.task.use || '') : '-'} colo ${v.carrier || 0}${c ? ' (' + c.role + ', dentro de ' + c.inside + ', ' + (c.task ? c.task.type : '-') + ')' : ''}`; }).join(' · '));
  ok('e19d os lutadores na areia, o público nas fileiras', naAreia > 0 && naAreia <= luta && nasFileiras > 0 && nasFileiras <= ver && mais <= ver, `no auge, ${mais} na plateia (${nasFileiras} em lugares de ver) e ${naAreia} lutando na areia; ${quem} chamados aos jogos`);
  ok('e19e no fim, ninguém lá dentro', !Tt.dia(b) && !dentro, `o espetáculo ${Tt.dia(b) ? 'AINDA ABERTO' : op.st + ' (' + (op.why || '') + ')'}; ${dentro} lá dentro`);
  const c = checa(); ok('e19f verificador', c.ok, c.txt);
});

// ------------------------------ e21: o campo guardado para a obra grande (D-121) ------------------------------
// (num mundo novo, a capital no nível da guarda e um chão aplainado pela prova perto dela — qa/guarda-lib.js, a mesma que as
// provas do V usam —, a guarda é a do jogo, V.reservaDia: a prova não depende de onde a terra sobra no rumo do mundo, T-448. As
// buscas o deixam de fora; o save; o deus põe um poço nele (solta; tirado o poço, a cidade guarda de novo); a cidade que perde
// o nível; o fogo passa; as pedras do lote quebradas para a obra fundada nele; noutra capital, o deus afoga o meio do lote; a
// cidade que some; o verificador)
const GL = require('./guarda-lib.js');
run('e21', () => {
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4, temper: 'normal' }); S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; M.saltar(3);
  const h0 = marca(); const g = GL.guarda(G, { provoca: true }); const set = g && S.settlements.get(g.set);
  if (!ok('e21a uma capital no nível da guarda, num chão aplainado', !!set, set ? `${set.name} (${G.Civ.idOfFac(set.fac)}, nível ${g.tier} → ${set.tier}): ${V.resWork(set).type} ${V.resWork(set).steps.map(s => s.n).join('/')}` : 'nenhuma capital guardou')) return;
  const R = V.reserva(set);
  let livre = !!R; if (R) for (let y = R.y; y < R.y + R.n; y++) for (let x = R.x; x < R.x + R.n; x++) { const o = S.occ[y * G.N + x] && S.buildings.get(S.occ[y * G.N + x]); if (o && !(o.set === set.id && V.OPEN[o.type] && !G.BDEF[o.type].housing)) livre = false; }
  ok('e21b a cidade guarda o lote', !!R && R.n === Es.steps(R.type).find(s => s.id === R.esc).n && livre && linhas(h0, /guardou um campo/).length > 0, R ? `${R.type}/${R.esc}: ${R.n} × ${R.n} em ${R.x},${R.y}, a ${G.dist(R.x + R.n / 2, R.y + R.n / 2, set.cx, set.cy).toFixed(0)} casas; «${(linhas(h0, /guardou/)[0] || { txt: '-' }).txt}»` : 'nada guardado');
  if (!R) return;
  const casa = V.resOver(set, 'house', R.x + 1, R.y + 1, 1, 1, true), campo = V.resOver(set, 'farm', R.x, R.y, 3, 3, false), obra = V.resOver(set, R.type, R.x, R.y, R.n, R.n, true);
  let busca = 0; for (let k = 0; k < 6; k++) { set._noSite = {}; const p = sim(() => V.findSite(set, 'house')); if (p && p[0] < R.x + R.n && p[0] + 1 > R.x && p[1] < R.y + R.n && p[1] + 1 > R.y) busca++; }
  ok('e21c as buscas o deixam de fora', casa === set && !campo && !obra && !busca, `uma casa nele: ${casa ? 'barrada' : 'LIVRE'}; um campo da cidade: ${campo ? 'BARRADO' : 'pode'}; a obra dele: ${obra ? 'BARRADA' : 'pode'}; 6 buscas de casa: ${busca} nele`);
  salva(); const set2 = S.settlements.get(set.id); const R2 = V.reserva(set2);
  ok('e21d o save', JSON.stringify(R2) === JSON.stringify(R), `depois do save: ${JSON.stringify(R2)}`);
  const c0 = checa(); ok('e21e verificador', c0.ok, c0.txt);
  // (o deus põe um poço no lote: o lote se solta; o deus o tira, e no dia seguinte a cidade guarda de novo, sem prédio no lote)
  const poco = sim(() => V.addBuilding('well', R.x + 2, R.y + 2, set2.id, true)); const solto = V.reserva(set2), why = set2.urb.resGone && set2.urb.resGone.why;
  sim(() => V.removeBuilding(poco)); set2.urb.resGone.day = S.day - 1; const R3 = sim(() => V.reservaDia(set2));
  ok('e21f o deus põe um poço nele', !solto && why === 'ocupada' && !!R3, `com o poço #${poco.id}: ${solto ? 'AINDA GUARDADO' : 'solto (' + why + ')'}; tirado o poço, no dia seguinte: ${R3 ? `guardado em ${R3.x},${R3.y}` : 'NENHUM'}`);
  if (!R3) return;
  // (a cidade abaixo de cidade: guarda até RES_YEARS anos; depois, solta)
  set2.tier = V.RES_TIER - 1; const a = sim(() => V.reservaDia(set2)); set2.urb.res.lost = S.day - V.RES_YEARS; const b = sim(() => V.reservaDia(set2));
  ok('e21g a cidade que perde o nível', !!a && !b && set2.urb.resGone.why === 'nivel', `no primeiro ano abaixo: ${a ? 'guardado' : 'SOLTO'}; depois de ${V.RES_YEARS} anos: ${b ? 'AINDA GUARDADO' : 'solto (' + set2.urb.resGone.why + ')'}`);
  set2.tier = Math.max(3, V.RES_TIER); set2.urb.resGone.day = S.day - 1; const R5 = sim(() => V.reservaDia(set2));
  if (!ok('e21i guardado outra vez', !!R5, R5 ? `${R5.x},${R5.y}` : 'sem lote')) return;
  // (o fogo num campo do lote guardado passa: o lote fica — Argos o largava pelo trigo em chamas, numa vida do zero)
  const fi = (R5.y + 1) * G.N + R5.x + 1; const f0 = S.fire[fi]; S.fire[fi] = 5; const R5f = sim(() => V.reservaDia(set2)); S.fire[fi] = f0;
  ok('e21n o fogo no lote guardado passa', !!R5f && R5f.x === R5.x && R5f.y === R5.y, R5f ? `com fogo em ${R5.x + 1},${R5.y + 1}: o lote fica` : `com fogo: SOLTO (${set2.urb.resGone && set2.urb.resGone.why})`);
  if (!R5f) return;
  // (e21r: um campo do lote guardado queimado pela porta do jogo — um pomar da própria cidade posto no lote, e destruído pelo fogo
  // (V.destroyBuilding): fica a ruína dele três dias. O lote fica guardado na hora e no olhar do dia seguinte, e o verificador não
  // acusa nada em cima dele; a obra não é fundada enquanto a ruína está lá (V.resSite), e é quando ela some — L-686, D-149)
  { const N = G.N; const spot = (() => { for (let y = R5.y; y + 3 <= R5.y + R5.n; y++) for (let x = R5.x; x + 3 <= R5.x + R5.n; x++) { let free = true; for (let dy = 0; dy < 3 && free; dy++) for (let dx = 0; dx < 3; dx++) { const i = (y + dy) * N + x + dx; if (S.occ[i] || S.treeAt[i] || S.objAt[i] || S.road[i] || S.type[i] < G.T.SAND) { free = false; break; } } if (free) return [x, y]; } return null; })();
    const lote = () => (set2.urb.res ? `${set2.urb.res.x},${set2.urb.res.y}` : 'SOLTO (' + (set2.urb.resGone && set2.urb.resGone.why) + ')');
    if (!spot) ok('e21r a ruína de um campo do lote guardado passa como o fogo', false, 'sem três por três casas livres no lote para o pomar');
    else { const pm = sim(() => V.addBuilding('pomar', spot[0], spot[1], set2.id, true)); const kept0 = !!set2.urb.res;
      sim(() => V.destroyBuilding(pm, 'fire')); const ruin = pm.type === 'ruin' && S.buildings.has(pm.id); const cheque = () => QA.check().filter(q => /campo guardado/.test(q.msg)).map(q => q.msg);
      const v0 = cheque(); const Ra = sim(() => V.reservaDia(set2)); const v1 = cheque(); const site0 = set2.urb.res ? sim(() => V.resSite(set2, set2.urb.res.type, set2.urb.res.n)) : null;
      sim(() => V.removeBuilding(pm)); const site1 = set2.urb.res ? sim(() => V.resSite(set2, set2.urb.res.type, set2.urb.res.n)) : null;
      ok('e21r a ruína de um campo do lote guardado passa como o fogo', kept0 && ruin && !!Ra && !v0.length && !v1.length && !site0 && !!site1,
        `um pomar da cidade em ${spot[0]},${spot[1]} do lote (${kept0 ? 'o lote fica' : 'O LOTE SOLTOU'}), queimado: ${ruin ? 'a ruína dele no lote' : 'SEM RUÍNA'}; o lote na hora e no olhar do dia seguinte: ${lote()}; o verificador: ${[...v0, ...v1][0] || 'nada'}; a obra com a ruína lá: ${site0 ? 'FUNDARIA' : 'espera'}; a ruína sumida: ${site1 ? 'funda' : 'NÃO FUNDA'}`); } }
  if (!set2.urb.res) return;
  // (a obra fundada no lote: as pedras do lote quebradas para ela, o lote solto — as pedras no meio do lote, onde fica o degrau
  // fundado, centrado no lote (V.resSite): postas a partir do canto, a obra de 10 no lote de 13 de Mênfis, num mundo do zero com
  // os consertos da 16ª rodada, deixou de fora a primeira fileira, onde as três estavam, e nenhuma foi quebrada, T-570)
  const mid5 = [R5.x + R5.n / 2, R5.y + R5.n / 2]; const cel5 = []; for (let y = R5.y; y < R5.y + R5.n; y++) for (let x = R5.x; x < R5.x + R5.n; x++) cel5.push([x, y]);
  cel5.sort((p, q) => G.dist2(p[0] + 0.5, p[1] + 0.5, mid5[0], mid5[1]) - G.dist2(q[0] + 0.5, q[1] + 0.5, mid5[0], mid5[1]) || p[1] - q[1] || p[0] - q[0]);
  let pedras = 0; for (const [x, y] of cel5) { if (pedras >= 3) break; if (!S.occ[y * G.N + x] && !S.treeAt[y * G.N + x] && !S.objAt[y * G.N + x] && G.Nature.addRock(x + 0.5, y + 0.5, 40)) pedras++; }
  // (um campo da cidade começado no lote guardado — o campo da própria cidade não solta o lote —, com madeira já entregue à obra
  // dele: a obra grande fundada no lote o derruba, e o que a obra do campo tinha volta ao estoque do povo, no livro, como uma
  // obra largada. Sumia com ela: a farm#12117 da mega da geração 16, com 4 de madeira, L-632)
  const fd = G.BDEF.farm; let fp = null;
  for (let y = R5.y; y + fd.h <= R5.y + R5.n && !fp; y++) for (let x = R5.x; x + fd.w <= R5.x + R5.n && !fp; x++) {
    let livre5 = true; for (let ty = y; ty < y + fd.h && livre5; ty++) for (let tx = x; tx < x + fd.w; tx++) if (S.occ[ty * G.N + tx]) { livre5 = false; break; }
    if (livre5) fp = [x, y];
  }
  const roca = fp && sim(() => V.addBuilding('farm', fp[0], fp[1], set2.id, false));
  if (roca) sim(() => D.make('o:' + roca.id, 'wood', 4, { code: 'prova' }));
  rico(set2); const L0 = S.ledgerN || 0; set2._noSite = {}; const w = sim(() => V.startProject(set2, R5.type));
  const dentro = w && w.x >= R5.x && w.y >= R5.y && w.x + w.w <= R5.x + R5.n && w.y + w.h <= R5.y + R5.n;
  const pedra5 = D.ledger().filter(e => e[0] > L0 && e[8] === 'pedreira').reduce((s, e) => s + e[6], 0);
  ok('e21j a obra no lote guardado, com a pedra do lote', !!w && dentro && !V.reserva(set2) && set2.urb.resGone.why === 'fundada' && pedra5 >= 40, `${lado(w)}${dentro ? ' dentro do lote' : ' FORA DO LOTE'}; o lote ${V.reserva(set2) ? 'AINDA GUARDADO' : 'solto (' + set2.urb.resGone.why + ')'}; ${pedras} pedras postas no lote, ${pedra5} de pedra quebrada pelo livro`);
  const volta = roca ? D.ledger().filter(e => e[0] > L0 && e[3] === 'o:' + roca.id && e[8] === 'obra-da-cidade').reduce((n, e) => n + e[6], 0) : 0; const cR = checa();
  ok('e21p o campo começado no lote, derrubado pela obra grande, devolve o que a obra dele tinha', !!roca && !S.buildings.has(roca.id) && Math.abs(volta - 4) < 1e-6 && cR.ok, roca ? `farm#${roca.id} (obra, 4 de madeira entregue) ${S.buildings.has(roca.id) ? 'AINDA DE PÉ' : 'derrubado'}; de volta ao estoque do povo pelo livro: ${volta}; ${cR.txt}` : 'nenhum lugar para o campo no lote');
  // (o verificador vê um prédio num lote guardado — a prova o põe à mão, sem o V.addBuilding)
  const s3 = [...S.settlements.values()].sort((a, c) => a.id - c.id).find(o => o.id !== set2.id && [...S.buildings.values()].some(q => q.set === o.id && q.built && !V.OPEN[q.type])); // (do mundo de agora: o save fez outro)
  if (s3) {
    const any = [...S.buildings.values()].find(o => o.set === s3.id && o.built && !V.OPEN[o.type]);
    const st = Es.steps(R5.type).find(q => q.id === R5.esc); (s3.urb || (s3.urb = { d: [], names: [] })).res = { type: R5.type, esc: R5.esc, n: st.n, x: any.x, y: any.y, d: S.day, chk: S.day, lost: 0 };
    const viu = QA.check().filter(q => q.sys === 'escala' && /campo guardado/.test(q.msg)); s3.urb.res = null;
    ok('e21k o verificador vê um prédio no lote', viu.length > 0, viu.length ? viu[0].msg.slice(0, 160) : 'NÃO VIU');
  }
  // (noutra capital, pela mesma guarda de prova: o chão muda — o deus afoga o meio do lote, G.Powers.reshape para baixo —, e o lote
  // não serve mais. Um meteoro num chão aplainado deixa a cratera dentro do pódio: o lote, que ainda serve, ficaria)
  const g4 = GL.guarda(G, { provoca: true, fora: [set2.id] }); const s4 = g4 && S.settlements.get(g4.set); const R4 = s4 && V.reserva(s4);
  const m = R4 && sim(() => { G.Powers.reshape(R4.x + R4.n / 2, R4.y + R4.n / 2, 3, -1); return V.reservaDia(s4); });
  ok('e21h o chão muda (o deus afoga o meio do lote)', !!R4 && !m && s4.urb.resGone.why === 'terra', R4 ? `${s4.name}: guardado em ${R4.x},${R4.y}; depois da água: ${m ? 'AINDA GUARDADO' : 'solto (' + s4.urb.resGone.why + ')'}` : 'nenhuma outra capital guardou');
  // (a cidade que some: o lote vai com ela — a terceira capital, pela mesma guarda)
  const g6 = GL.guarda(G, { provoca: true, fora: [set2.id].concat(s4 ? [s4.id] : []) }); const s6 = g6 && S.settlements.get(g6.set);
  if (!s6) ok('e21l a cidade que some', false, 'nenhuma outra capital guardou');
  else { const R6 = V.reserva(s6); const id6 = s6.id; const outra = [...S.settlements.values()].find(o => o.id !== id6);
    // (a cidade sem ninguém, deixada ao vento: a gente dela morre antes)
    sim(() => { for (const v of [...S.villagers.values()]) if (v.set === id6) V.kill(v, 'old'); V.abandon(s6); }); ok('e21l a cidade que some', !S.settlements.has(id6) && !V.resOver(outra, 'house', R6.x, R6.y, R6.n, R6.n, true), `${s6.name} abandonada com o lote guardado em ${R6.x},${R6.y}: o lote foi com ela`); }
  const c = checa(); ok('e21m verificador', c.ok, c.txt);
});

// (o muro passa ao lado do campo guardado, como ao lado da praça: na metrópole pronta, uma cidade sem muro, o muro planejado; um
// campo guardado posto à mão atravessando o lado norte dele; o muro de novo, erguido de uma vez — nenhuma casa do muro no lote,
// que o abre como a praça. Roma largava o seu pelo muro posto em cima, numa vida do zero)
run('e21o', () => {
  abre(); const Sg = G.Siege;
  const s = [...S.settlements.values()].filter(o => !Sg.wallOf(o.id) && G.Fac.get(o.fac)).sort((a, c) => V.pop(c.id) - V.pop(a.id)).find(o => { const w = sim(() => Sg.raiseWalls(o, 'pedra', false)); if (!w) return false; S.walls.splice(S.walls.indexOf(w), 1); o._box = w.box; return true; });
  if (!ok('e21o uma cidade sem muro, com o muro planejado', !!s, s ? `${s.name}: o muro em ${s._box.join(',')}` : 'nenhuma')) return;
  const [x0, y0, x1] = s._box; const u = s.urb || (s.urb = { d: [], names: [] }); const r0 = u.res;
  u.res = { type: 'maravilha', esc: 'maravilha', n: 10, x: Math.round((x0 + x1) / 2) - 5, y: y0 - 5, d: S.day, chk: S.day, lost: 0 }; const R = u.res;
  const no = i => { const x = i % G.N, y = (i / G.N) | 0; return x >= R.x && x < R.x + R.n && y >= R.y && y < R.y + R.n; };
  // (as casas do lote que viram muro agora: o muro de antes que o lote já tinha não é deste — na metrópole da geração 15, onze casas
  // do muro de Argos no lote de 10 posto ao norte do de Tebas, T-493)
  const muro0 = []; for (let y = R.y; y < R.y + R.n; y++) for (let x = R.x; x < R.x + R.n; x++) muro0.push(S.wall[y * G.N + x]);
  const w = sim(() => Sg.raiseWalls(s, 'pedra', true)); const plano = w ? w.tiles.filter(no).length : -1;
  let erguido = 0, velho = 0, k0 = 0; for (let y = R.y; y < R.y + R.n; y++) for (let x = R.x; x < R.x + R.n; x++, k0++) { if (muro0[k0]) velho++; else if (S.wall[y * G.N + x]) erguido++; }
  // (sem o campo, o mesmo muro passaria por ele: o plano de antes tinha casas do lado norte dentro do lote)
  let antes = 0; for (let x = R.x; x < R.x + R.n; x++) if (x >= s._box[0] && x <= s._box[2] && y0 >= R.y && y0 < R.y + R.n) antes++;
  ok('e21o o muro passa ao lado do campo guardado', !!w && w.tiles.length > 0 && antes > 0 && plano === 0 && erguido === 0, w ? `o muro de ${w.tiles.length} casas: sem o campo, ${antes} casas do lado norte cairiam no lote; com ele, ${plano} no plano e ${erguido} erguidas nele${velho ? ` (${velho} de um muro de antes)` : ''}` : 'sem muro');
  // (desfeito: o muro e o campo de teste)
  if (w) { for (const i of w.tiles) { S.wall[i] = 0; S.wallFac[i] = 0; delete S.wallHp[i]; } S.walls.splice(S.walls.indexOf(w), 1); G.W.touchWalk(); }
  u.res = r0 || null; delete s._box;
});

// ------------------------------ e22: a audiência no palácio (D-124) ------------------------------
// (o palácio de 6 de Roma de pé, com planta: quem governa no trono, a cidade entra pelos lugares da planta — 'audiencia' e os de
// visitante, 'sentar', até o M2 pôr os de pé da sala do trono —, a ronda fica; o save no meio; quem governa morre no meio; o deus
// derruba o palácio no meio; o voto e o pão iguais, na praça)
const DIST = (v, b) => { const d = G.Vg.door(b); return Math.round(G.dist(v.x, v.y, d[0], d[1])); };
// (the capital and its palace by the rule of the audience — Co.audPalace: the people's best palace, in its capital, standing with
// its plan —: the first people with a ruler whose capital has its palace of 6 standing, else one with no palace at all, where the
// god's hand raises it. In the metrópole of the generation 14 Roma had its own palace of 6, and the one the proof raised beside it
// was never the audience's: everyone went to the old one, and nobody came into the new, T-477. Among those, first a capital with
// people for the audience to pass the visitors' seats — more than the 24 the proof brings to the door: Texcoco, of 17, called
// 10 —, then the ruler the years are least like to take in the middle — the death of old age begins at 55 and grows with the
// years past it (villagers.js): in the metrópole remade after the generation 15 both palaces of 6 standing were of rulers of 68,
// and Egil died of old age fourteen seconds into the audience —, then the palace standing, T-496)
function audiencia(chama) {
  abre(); const Co = G.Court, P = G.Politics, In = G.Interiors;
  const caps = G.Fac.all().filter(o => o.alive && P.ruler(o) && G.Fac.capitalOf(o.id)).sort((a, c) => a.id - c.id);
  const seis = o => { const p = Co.audPalace(o); return p && p.w === 6 ? p : null; };
  const gente = o => { const c = G.Fac.capitalOf(o.id), r0 = P.ruler(o); let n = 0; for (const v of S.villagers.values()) if (v.set === c.id && v.age >= 14 && !v.captive && !v.jail && v !== r0) n++; return n; };
  const nota = o => [gente(o) > 24 ? 0 : 1, Math.max(0, P.ruler(o).age - 55), seis(o) ? 0 : 1];
  const f = caps.filter(o => seis(o) || !Co.bestPalace(o)).map(o => [nota(o), o]).sort((a, c) => a[0][0] - c[0][0] || a[0][1] - c[0][1] || a[0][2] - c[0][2] || a[1].id - c[1].id).map(q => q[1])[0];
  if (!f) return { set: null, f: null, b: null, r: null };
  const set = G.Fac.capitalOf(f.id);
  const b = seis(f) || sim(() => V.handFound(set, 'palacio', 'palacio', { R: 60, built: true })); const r = P.ruler(f);
  if (!b || !r || Co.audPalace(f) !== b) return { set, f, b, r };
  for (const v of [r, ...[...S.villagers.values()].filter(o => o.set === set.id && o.age >= 14 && !o.captive).sort((a, c) => a.id - c.id).slice(0, 40)]) { sim(() => G.Vg.endTask(v)); v.inside = 0; v.sleeping = false; v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 85); }
  const dr = G.Vg.door(b); r.x = dr[0] + 1; r.y = dr[1] + 1;
  for (const v of [...S.villagers.values()].filter(o => o.set === set.id && o.age >= 14 && !o.captive && o !== r).sort((a, c) => a.id - c.id).slice(0, 24)) { v.x = dr[0] + 2 + (v.id % 5); v.y = dr[1] + 2 + (v.id % 3); v.path = null; }
  const vigia = [...S.villagers.values()].filter(o => o.set === set.id && o.age >= 16 && !o.captive && o !== r).sort((a, c) => c.id - a.id)[0];
  sim(() => G.Vg.setTask(vigia, { type: 'ronda', pts: [[dr[0] + 2, dr[1] + 2], [dr[0] + 3, dr[1] + 2]], k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' })); vigia.x = dr[0] + 2; vigia.y = dr[1] + 2;
  // (a hora da audiência fora das festas da capital e da cidade de quem governa — a festa chama a sua cidade inteira, onde cada
  // um estiver, e quem governa também (D-126): na metrópole refeita depois da geração 15 Egil mora em Uppsala, governa do palácio
  // de Hedeby, e a festa de Uppsala, às 0,46, o tirou do trono vinte segundos depois da audiência, T-496 —: a hora da manhã que
  // deixa à audiência o seu tempo antes da festa ou depois dela)
  const fws = [set, S.settlements.get(r.set)].filter((s, k, L) => !!s && L.indexOf(s) === k).map(s => (G.Fest && G.Fest.window ? G.Fest.window(s) : null)).filter(Boolean);
  const dura = (Co.AUD_DUR + 5) / G.DAY_LEN;
  const hora = [0.35, 0.3, 0.4, 0.25, 0.45, 0.5, 0.55].find(t => fws.every(fw => t + dura <= fw[0] || t >= fw[1]));
  // (e quem governa governa a audiência inteira: o mandato começado hoje — f.term, o do polity.js, como nos jogos do e19 —, nenhuma
  // eleição do mundo no meio dela: na metrópole refeita, Febe venceu Jasão em Argos dez segundos depois da audiência, T-496)
  f.term = S.day;
  S.time = hora === undefined ? 0.35 : hora; const okA = chama === null ? false : sim(() => (chama ? chama(f, set) : Co.audiencia(f, 'teste'))); const ronda = vigia.task && vigia.task.type; const longe = DIST(vigia, b);
  return { set, f, b, r, vigia, ronda, longe, okA, In, Co, P };
}
run('e22', () => {
  let A = audiencia(); const { b, r } = A;
  if (!ok('e22a o palácio pronto e quem governa', !!b && !!r && !!b.ip && A.okA && !!A.f.aud, b ? `${lado(b)}, ${r ? r.name : 'sem governante'}; audiência ${A.okA ? 'chamada' : 'NÃO CHAMADA'}` : 'sem palácio')) return;
  const T22 = A.In.table(b); const porUso = A.Co.AUD_USES.map(u => `${(T22.byUse.get(u) || []).length} ${u}`).join(' + ');
  const lugares = A.Co.audRoom(b); const chamados = A.f.aud.who.length;
  M.viver(25);
  const dentro = [...S.villagers.values()].filter(v => v.inside === b.id && v.task && v.task.kind === 'audiencia' && !v.task.throne); const usos = dentro.map(v => (A.In.placeOf(v) || {}).use || 'sem lugar');
  const tr = A.In.placeOf(r); const th = T22.items.find(it => it.kind === 'trono');
  // (os lugares de pé do M2 diante do trono — marcas da planta, em fileiras a um metro, tantas quantas a sala do trono de cada povo
  // comporta: 50 no palácio de 6 da geração 14, 47 no nórdico da 15, T-493 — fazem a audiência crescer além dos assentos de
  // visitante: mais marcas do que assentos, chamados mais do que eles, e de pé nas marcas)
  const aud = (T22.byUse.get('audiencia') || []).length, sentar = (T22.byUse.get('sentar') || []).length;
  ok('e22b quem governa no trono, a cidade nos lugares', !!tr && !!th && tr.item === th.id && tr.use === 'sentar' && dentro.length > 0 && chamados <= lugares && usos.every(u => A.Co.AUD_USES.includes(u)) && aud > sentar && chamados > sentar - 1 && usos.filter(u => u === 'audiencia').length > 1,
    `${r.name} ${tr ? `no ${tr.it && tr.it.kind || 'lugar'} (${tr.use})` : 'SEM LUGAR'} do palácio ${G.Civ.idOfFac(A.f.id) || 'classico'}; ${chamados} chamados para ${lugares} lugares (${porUso}, menos o assento do trono); dentro: ${dentro.length} — ${[...new Set(usos)].map(u => u + ' ' + usos.filter(x => x === u).length).join(', ')}`);
  ok('e22c a ronda fica', !A.f.aud.who.includes(A.vigia.id) && A.ronda === 'ronda', `${A.vigia.name}, a ${A.longe} casas da porta: ${A.f.aud.who.includes(A.vigia.id) ? 'CHAMADO' : 'não chamado'}, na ${A.ronda || '-'} ao chamado`);
  const c1 = checa(); ok('e22d verificador', c1.ok, c1.txt);
  // (o verificador vê: a audiência apagada à mão com a cidade nela; quem está nela dentro de outro prédio)
  const aud1 = A.f.aud; A.f.aud = null; const q1 = QA.check().filter(q => q.sys === 'escala' && q.sev === 2 && /não tem audiência/.test(q.msg)).length; A.f.aud = aud1;
  const fo = dentro[0]; const casa = [...S.buildings.values()].find(o => o.built && o.type === 'house' && o.set === A.set.id); let q2 = -1;
  if (fo && casa) { fo.inside = casa.id; q2 = QA.check().filter(q => q.sys === 'escala' && q.sev === 2 && /dentro de outro/.test(q.msg)).length; fo.inside = b.id; }
  ok('e22m o verificador vê', q1 >= dentro.length && q2 === 1, `com a audiência apagada à mão: ${q1} avisos S2 (${dentro.length} dentro e os que vêm); ${fo && casa ? `${fo.name} posto noutra casa: ${q2}` : fo ? 'nenhuma casa da cidade para pôr alguém' : 'ninguém lá dentro para pôr noutra casa'}`);
  const aud0 = JSON.stringify(A.f.aud); const ids = dentro.map(v => v.id); salva(); const f2 = G.Fac.get(A.f.id);
  const volta = ids.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.kind === 'audiencia' && v.inside === b.id; }).length;
  ok('e22e o save no meio', !!f2.aud && JSON.stringify(f2.aud) === aud0 && volta === ids.length, `a audiência ${f2.aud ? 'continua' : 'SUMIU'}; ${volta} de ${ids.length} de volta lá dentro`);
  // (who is still in it: in the audience of the case's people — the audience of another people going on meanwhile is theirs: in
  // the metrópole of the round 15, Ivar, crowned in the Clã de Hrafn, sat his own throne at his coronation while Argos's ended, T-535)
  const naDe = fid => [...S.villagers.values()].filter(v => v.task && v.task.kind === 'audiencia' && v.task.fid === fid).length;
  sim(() => V.kill(S.villagers.get(r.id), 'old')); M.viver(4); const r2 = naDe(f2.id);
  ok('e22f quem governa morre no meio', !f2.aud && !r2, `${f2.aud ? 'a audiência AINDA DURA' : 'a audiência acabou'}; ${r2} ainda nela`);
  A = audiencia(); M.viver(15); const n3 = naDe(A.f.id);
  sim(() => V.destroyBuilding(S.buildings.get(A.b.id), 'meteor')); M.viver(4); const n4 = naDe(A.f.id); const fora = [...S.villagers.values()].filter(v => v.inside === A.b.id).length;
  ok('e22g o deus derruba o palácio no meio', A.okA && n3 > 0 && !A.f.aud && !n4 && !fora, `${n3} na audiência; depois do palácio caído: ${n4} nela, ${fora} lá dentro`);
  const c2 = checa(); ok('e22i verificador', c2.ok, c2.txt);
  // (o voto e o pão: com o palácio pronto de pé, onde o povo se junta — Po.forum: a praça da cidade, e sem praça diante do
  // assento do poder, Po.seat, como antes (L-781: iam à porta do palácio com a praça vazia ao lado) —; nenhuma audiência)
  A = audiencia(null); const seat = G.Polity.forum(A.set); const praca = [];
  for (const why of ['voto', 'pao']) {
    sim(() => G.Polity.crowd(A.set, why)); const L = [...S.villagers.values()].filter(v => v.task && v.task.type === 'assembly');
    praca.push(`${why}: ${L.length} na praça${L.every(v => v.task.kind === 'assembly' && v.task.x === seat[0] && v.task.y === seat[1]) ? ', onde o povo se junta' : ' (FORA DO LUGAR)'}`);
    if (!L.length || !L.every(v => v.task.kind === 'assembly' && v.task.x === seat[0] && v.task.y === seat[1])) praca.push('FALHA');
    for (const v of L) sim(() => G.Vg.endTask(v));
  }
  ok('e22h o voto e o pão iguais', !praca.includes('FALHA') && !A.f.aud && !!A.b, `com ${lado(A.b)} de pé — ${praca.join('; ')}; audiência: ${A.f.aud ? 'CHAMADA' : 'nenhuma'}`);
  // (as três chamadas: a resposta à petição — Po.crowd 'audiencia' —, a coroação, a chegada de um embaixador vivo)
  A = audiencia((f, set) => G.Polity.crowd(set, 'audiencia')); const pet = A.f.aud && A.f.aud.why;
  A = audiencia(null); const novo = [...S.villagers.values()].filter(v => v.set === A.set.id && v.age >= 20 && !v.captive && v !== A.r && v !== A.vigia && !v.task && G.dist(v.x, v.y, ...G.Vg.door(A.b)) < 12).sort((a, c) => a.id - c.id)[0];
  sim(() => { A.P.endReign(A.f, 'teste'); A.P.crown(A.f, novo, 'teste', true); }); const cor = A.f.aud && A.f.aud.ruler === novo.id ? A.f.aud.why : '-';
  A = audiencia(null); const de = G.Fac.all().find(o => o !== A.f && o.alive && G.Fac.rel(o.id, A.f.id)); const env = de && [...S.villagers.values()].find(v => G.Fac.ofV(v) === de && v.age >= 16 && !v.captive);
  if (env) sim(() => A.P.deliver(de, A.f, 'contato', env)); const emb = A.f.aud && A.f.aud.why;
  ok('e22j as três chamadas', pet === 'peticao' && cor === 'coroacao' && emb === 'embaixada', `a resposta à petição: ${pet || 'NADA'}; a coroação de ${novo ? novo.name : '-'}: ${cor}; o emissário ${env ? env.name : '-'} de ${de ? de.name : '-'}: ${emb || 'NADA'}`);
  // (sem palácio pronto com planta, a resposta à petição não chama ninguém — como antes da D-124)
  const sem = G.Fac.all().map(f => G.Fac.capitalOf(f.id)).filter(c => c && !G.Court.audPalace(G.Fac.get(c.fac)))[0];
  const n0 = [...S.villagers.values()].filter(v => v.task && v.task.type === 'assembly').length; if (sem) sim(() => G.Polity.crowd(sem, 'audiencia'));
  const n1 = [...S.villagers.values()].filter(v => v.task && v.task.type === 'assembly').length;
  ok('e22k sem palácio, nenhuma reunião', !!sem && n1 === n0 && !G.Fac.get(sem.fac).aud, sem ? `${sem.name}: ${n1 - n0} chamados, audiência ${G.Fac.get(sem.fac).aud ? 'CHAMADA' : 'nenhuma'}` : 'toda capital tem palácio pronto');
  const c3 = checa(); ok('e22l verificador', c3.ok, c3.txt);
});

// ------------------------------ e23: os serviços abertos com a comida garantida (D-102) ------------------------------
// (o teto dos ofícios guarda uma pessoa para cada serviço aberto — o taverneiro de cada taverna, um ator de cada teatro ou arena,
// um estivador do cais com caixas e armazém — quando a comida do povo está garantida, V.foodSafe; com ela em risco, como antes; o
// corte do resto mínimo os deixa; na vida, a taverna e o teatro da cidade ficam com quem os abra; o save
// devolve os ofícios como estavam; o verificador vê o serviço vazio)
// (the town: the biggest with a tavern and a theatre open and its food safe — by what it has, not by its name: in the metrópole
// of the generation 14 Mênfis, the one of before, had no theatre, T-477 —; where none has both, the biggest whose food is safe,
// with the one it lacks raised by the god's hand — and where the hand finds no lot for it, the next: in the metrópole of the
// generation 15 no town has both, and Mênfis, the biggest, has no lot for a theatre within the hand's radius, T-493)
// (the food kept safe by the god's hand — the people's store up to a tenth over the line V.foodSafe draws, as far as it holds —:
// in the life of the case the guarded services are the premise, and the town at the line lost it on the way — Roma in the
// metrópole of the generation 18, 675 of food for 180, the services opened and the food not safe at the end, T-628)
const farto = fid => { const f = G.Fac.get(fid); if (!f) return; const pop = G.Fac.pop(fid), cap = V.cap(fid); const want = Math.min(cap, Math.max(pop * 2.5 * V.FOOD_DAYS * 1.1, cap * 0.92)); const n = want - (f.stock.food || 0); if (n > 0) sim(() => D.make('f:' + fid, 'food', n, { code: 'teste', part: true })); };
const servicos = () => {
  const E = G.Eco; const fed = s => G.Fac.get(s.fac) && V.foodSafe(s.fac); const tem = s => { const sv = E.services(s); return sv.taverneiro >= 1 && sv.ator >= 1; };
  const L = [...S.settlements.values()].filter(fed).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  const both = L.find(tem); if (both) return both;
  for (const set of L) {
    const sv = E.services(set);
    if (!(sv.taverneiro >= 1)) sim(() => V.handFound(set, 'taverna', Es.classic('taverna').id, { R: 40, built: true }));
    if (!(sv.ator >= 1)) sim(() => V.handFound(set, 'teatro', 'teatro', { R: 40, built: true }));
    // (and the world on a second and a half: the buildings by town and type the trades count from — E.byType — are made again once
    // a second, and the theatre raised now enters them at the next: asked in the same second, the theatre of Mênfis, raised by the
    // hand in the metrópole of the generation 17, asked for no actor)
    if (tem(set)) { M.viver(1.5); return set; }
  }
  return null;
};
run('e23', () => {
  abre(); const E = G.Eco; const set = servicos(); if (!set) { ok('e23a o teto guarda os serviços com a comida garantida', false, 'nenhuma cidade com a comida garantida em que a taverna e o teatro abram'); return; } const f = G.Fac.get(set.fac);
  const papel = r => [...S.villagers.values()].filter(v => v.set === set.id && v.role === r).length;
  const sv = E.services(set); const ask = sim(() => E.demand(set, f, 25));
  const pede = { taverneiro: ask.taverneiro || 0, ator: ask.ator || 0, oleiro: 2, ferreiro: 2, mercador: 1, feirante: 2 };
  // (um teto de 1 — quatro mãos crescidas —: o primeiro da fila leva a única mão; com a comida garantida, os serviços abertos a mais)
  const seguro = V.foodSafe(f.id); const deu = E.share(Object.assign({}, pede), set, f, 4);
  const fs0 = V.foodSafe; V.foodSafe = () => false; const antes = E.share(Object.assign({}, pede), set, f, 4); V.foodSafe = fs0;
  // (the hands kept are one for each service open of what the town asks — E.kept: two taverns, two keepers; the town of the
  // generation 19 has two, and the case asked one)
  const guarda = r => Math.min(pede[r], sv[r]);
  ok('e23a o teto guarda os serviços com a comida garantida', seguro && sv.taverneiro >= 1 && sv.ator >= 1 && deu.taverneiro === guarda('taverneiro') && deu.ator === guarda('ator') && antes.taverneiro + antes.ator + antes.oleiro + antes.ferreiro + antes.mercador + antes.feirante === 1,
    `abertos ${JSON.stringify(sv)}; pedem ${JSON.stringify(pede)}, teto 1 — com a comida garantida ${JSON.stringify(deu)}; em risco ${JSON.stringify(antes)}`);
  const w1 = { taverneiro: 1, ator: 2, oleiro: 1 }; const n1 = E.cut(w1, 3, { taverneiro: 1, ator: 1 });
  ok('e23b o corte do resto deixa os serviços guardados', n1 === 2 && w1.taverneiro === 1 && w1.ator === 1 && w1.oleiro === 0, `corta 3 de ${JSON.stringify({ taverneiro: 1, ator: 2, oleiro: 1 })} guardando um taverneiro e um ator: ${n1} cortados, ${JSON.stringify(w1)}`);
  const t0 = papel('taverneiro'), a0 = papel('ator'); for (let k = 0; k < 80; k++) { farto(f.id); M.viver(5); } const c1 = checa();
  ok('e23c na vida, a taverna e o teatro abertos', papel('taverneiro') >= 1 && papel('ator') >= 1 && V.foodSafe(f.id) && c1.ok, `${set.name}: taverneiros ${t0} → ${papel('taverneiro')}, atores ${a0} → ${papel('ator')} em dois dias; ${c1.txt}`);
  // (saved where no turn of age waits for the dealing: the load gives the role of an age turned in the four seconds before the
  // save — 2, 16, 62 —, the captive's and a trade to a grown one with none at once, and the world at its next dealing; the
  // dealing's clock starts over at every load, so the load cannot know when that would be — T-534. A baby born then was the
  // same, and is born a baby now, L-630)
  const pend = () => [...S.villagers.values()].some(v => v.set === set.id && (v.captive ? v.role !== 'cativo' : v.age < 2 ? v.role !== 'bebe' : v.age < 16 ? v.role !== 'crianca' : v.age >= 62 ? v.role !== 'anciao' : !v.role || v.role === 'bebe' || v.role === 'crianca' || v.role === 'anciao'));
  for (let k = 0; k < 120 && pend(); k++) M.viver(0.1);
  const roles = [...S.villagers.values()].filter(v => v.set === set.id).map(v => v.id + ':' + v.role).join(); salva(); const s2 = S.settlements.get(set.id);
  const roles2 = [...S.villagers.values()].filter(v => v.set === s2.id).map(v => v.id + ':' + v.role).join();
  ok('e23d o save devolve os ofícios', roles === roles2, roles === roles2 ? 'os mesmos ofícios, um por um, depois de carregar' : 'OS OFÍCIOS MUDARAM NO LOAD');
  // (o verificador vê: a taverna sem ninguém do ofício por três dias, a comida garantida — tirados os taverneiros à mão, sem passo)
  const kept = [...S.villagers.values()].filter(v => v.set === s2.id && v.role === 'taverneiro'); for (const v of kept) v.role = 'coletor';
  const vazia = () => QA.check().filter(q => q.sys === 'escala' && /a taverna sem ninguém/.test(q.msg) && q.msg.startsWith(s2.name)).length;
  farto(s2.fac); const q0 = vazia(); const d0 = S.day; S.day += 3; const q3 = vazia(); S.day = d0; for (const v of kept) v.role = 'taverneiro';
  ok('e23e o verificador vê', !q0 && q3 === 1, `sem taverneiro: no primeiro dia ${q0}, três dias depois ${q3}`);
});

// ------------------------------ e24: o tijolo que não vem (L-540) ------------------------------
// (a obra que espera tijolo há um dia volta à pedra quando o tijolo a caminho — o livre no estoque do povo, o das prateleiras das
// olarias da cidade e o que as fornadas delas ainda vão dar — não cobre o que as obras da cidade esperam: as que esperam há mais
// tempo primeiro, até o resto caber; a de hoje espera. Antes, um tijolo no estoque ou uma fornada a caminho seguravam todas: o
// teatro de Tenochtitlan ficou 18 anos a 85%, 40 adobes a fazer, com 118 de pedra no estoque. Com o tijolo coberto, ninguém volta)
run('e24', () => {
  abre(); const E = G.Eco, O = G.Oficio;
  const set = [...S.settlements.values()].find(s => E.brickOf(s.fac) && [...S.buildings.values()].some(o => o.set === s.id && o.type === 'olaria' && o.built));
  if (!set) return ok('e24 o tijolo que não vem', false, 'nenhuma cidade com olaria num povo de tijolo');
  const k = E.brickOf(set.fac), ref = 'f:' + set.fac;
  const lacks = b => Math.max(0, (b.need[k] || 0) - ((b.incoming && b.incoming[k]) || 0));
  const works = () => [...S.buildings.values()].filter(o => o.set === set.id && !o.built && o.type !== 'ruin' && o.brick && o.brick.k === k && lacks(o) > 0);
  const have = () => { let n = D.free(ref, k); for (const o of S.buildings.values()) if (o.set === set.id && o.type === 'olaria') { n += D.get('b:' + o.id, k); for (const op of O.batches(o)) { const R = O.rx(op); if (R && R.k === k) n += Math.max(0, op.data.n - op.data.feitos - op.data.quebrados); } } return n; };
  const livre = (w, h, taken) => {
    for (let r = 3; r < 26; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; let good = true;
      for (let yy = y - 1; yy <= y + h && good; yy++) for (let xx = x - 1; xx <= x + w && good; xx++) { if (!G.W.inb(xx, yy)) { good = false; break; } const i = yy * G.N + xx; if (S.occ[i] || !G.W.walkable(i) || S.road[i] || taken.some(p => xx >= p[0] - 1 && xx <= p[0] + w && yy >= p[1] - 1 && yy <= p[1] + h)) good = false; }
      if (good) return [x, y];
    }
    return null;
  };
  // (um tijolo só no estoque — antes, ele segurava todas —, e três casas novas: duas esperam há dias, a terceira é de hoje)
  const f0 = D.free(ref, k); if (f0 > 0) D.use(ref, k, f0, { code: 'teste', mine: true }); D.make(ref, k, 1, { code: 'teste' });
  const taken = [], hs = [];
  for (let n = 0; n < 3; n++) { const p = livre(G.BDEF.house.w, G.BDEF.house.h, taken); if (!p) break; taken.push(p); hs.push(V.addBuilding('house', p[0], p[1], set.id, false)); }
  if (hs.length < 3 || hs.some(b => !b.brick)) return ok('e24 o tijolo que não vem', false, `${set.name}: ${hs.length} casas novas, ${hs.filter(b => b.brick).length} com tijolo`);
  hs[0].brick.day = S.day - 3; hs[1].brick.day = S.day - 2; hs[2].brick.day = S.day;
  const want0 = V.brickWant(set, k), have0 = have();
  const elig = works().filter(o => S.day - (o.brick.day || 0) >= 1).sort((a, b) => (a.brick.day || 0) - (b.brick.day || 0) || a.id - b.id);
  const st0 = new Map(works().map(o => [o.id, { lack: lacks(o), stone: o.need.stone || 0, back: o.brick.back || 0 }]));
  V.onNewDay();
  const back = elig.filter(o => !(lacks(o) > 0)); const prefix = back.every(o => elig.indexOf(o) < back.length);
  const conta = back.every(o => { const z = st0.get(o.id); return Math.abs((o.need.stone || 0) - z.stone - z.lack) < 1e-6 && Math.abs((o.brick.back || 0) - z.back - z.lack) < 1e-6; });
  const want1 = V.brickWant(set, k), have1 = have();
  ok('e24a sem o tijolo para todas, as que esperam há mais tempo voltam à pedra', want0 > have0 && back.length > 0 && prefix && conta && lacks(hs[2]) > 0 && (want1 <= have1 + 1e-6 || back.length === elig.length),
    `${set.name} (${k}): as obras esperam ${want0}, vêm ${have0} (1 no estoque); das ${elig.length} que esperam há um dia ou mais, ${back.length} voltaram à pedra, as mais antigas primeiro (${back.map(o => o.type + '#' + o.id + ' do ano ' + o.brick.day).slice(0, 4).join(', ')}), a pedra no lugar do que faltava; a de hoje espera; agora esperam ${want1}, vêm ${have1}`);
  D.make(ref, k, Math.ceil(V.brickWant(set, k)) + 5, { code: 'teste' }); hs[2].brick.day = S.day - 2; const l2 = lacks(hs[2]);
  V.onNewDay(); const c = checa();
  ok('e24b com o tijolo coberto, ninguém volta', l2 > 0 && lacks(hs[2]) === l2 && c.ok, `a casa de dois dias espera ${l2} de ${k}, com o estoque cobrindo todas: depois do dia, espera ${lacks(hs[2])}; ${c.txt}`);
});

// ------------------------------ e25: o palácio do governante no lugar do palácio, na fila das obras cívicas (L-541) ------------------------------
// (o planejador da cidade pede o palácio antes do teatro, dos banhos e da maravilha; o da corte o troca pelo que o governante quer
// — e o punha no fim da fila: com uma obra cívica grande de cada vez, o palácio esperava cada praça, mercado, biblioteca, teatro e
// banho que a cidade crescendo pedia, e nenhuma capital dos mundos de teste ergueu um. Agora ele entra antes dos rivais da coroa)
// (the capitals of a city or more: one with no palace yet wants the plain one — a ruler of middling vanity, 0,45 —; one with a
// palace wants a grander one when its ruler is vain — 0,95: the court's rule (court.js, G.City.plan): a palace only gives way to
// a far grander one —, the same rule putting it before the crown's rivals. In the metrópole of the generation 17, a young world,
// every capital of a city already had its palace, and none was left to ask for the first one)
run('e25', () => {
  abre(); const P = G.Politics, Co = G.Court;
  const caps = [...S.factions.values()].map(f => G.Fac.capitalOf(f.id)).filter(s => s && (s.tier || 0) >= 3 && f0(s));
  function f0(s) { return G.Fac.get(s.fac); }
  const out = []; let bad = 0, seen = 0;
  for (const set of caps) {
    const f = f0(set), r = P.ruler(f); if (!r || f.gov === 'tribo') continue;
    const cur = Co.bestPalace(f);
    P.persona(r).vai = cur ? 0.95 : 0.45; f.rulerSince = S.day - 5; rico(set, 100); pedra(set, 200); civicas(set);
    const want = []; sim(() => G.City.plan(set, f, V.counts(set.id), want, V.pop(set.id)));
    const p = want.findIndex(t => Co.RANK[t] && (!cur || Co.RANK[t] > Co.RANK[cur.type])), q = want.findIndex(t => t === 'teatro' || t === 'banhos' || t === 'maravilha');
    if (p < 0 || q < 0) { out.push(`${set.name}${cur ? ` (com ${cur.type})` : ''}: ${want.join(', ') || 'nada'}`); continue; }
    seen++; if (p > q) bad++; out.push(`${set.name}${cur ? ` (com ${cur.type})` : ''}: ${want.join(', ')}`);
  }
  ok('e25 o palácio do governante vem antes do teatro, dos banhos e da maravilha', seen > 0 && !bad, `${seen} capitais com o palácio e um rival na fila — ${out.join(' · ')}`);
});

// ------------------------------ e20: cada capital que não ergue a obra grande diz por quê ------------------------------
run('e20', () => {
  for (const w of ['metropole', 'mundial', 'mega']) {
    abre(w); const caps = [...new Set([...S.factions.values()].map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, b) => V.pop(b.id) - V.pop(a.id)).slice(0, 4);
    const out = []; let mudo = 0;
    for (const set of caps) for (const t of ['maravilha', 'palacio', 'palacio_colossal']) {
      const st = Es.choose(set, t)[0]; if (!st || st.n === Es.n0(t)) continue; const r = V.landWhy(set, t, st.n); if (!/\d/.test(r.txt)) mudo++;
      out.push(`${set.name} ${t}/${st.n}: ${r.free ? r.free + ' lotes' : 'sem terra — ' + Object.keys(r.why).filter(k => r.why[k]).sort((a, b) => r.why[b] - r.why[a]).slice(0, 2).map(k => k + ' ' + Math.round(100 * r.why[k] / r.lots) + '%').join(', ')}`);
    }
    ok(`e20 ${w}: o porquê de cada capital`, !mudo && out.length > 0, out.join(' · '));
  }
});

// ------------------------------ e11: um save de antes igual ------------------------------
run('e11', () => {
  abre(); let sem = 0, fora = 0; const lotes = new Map();
  for (const b of S.buildings.values()) { if (b.esc === undefined) sem++; if (b.type !== 'ruin' && G.BDEF[b.type] && Es.of(b).n !== b.w) fora++; lotes.set(b.id, `${b.x},${b.y},${b.w},${b.h}`); }
  const rt = QA.roundTrip(); S = G.S; const esc = QA.check().filter(q => q.sys === 'escala');
  ok('e11a o save de antes abre igual', !fora && !esc.length && !rt.diff.length, `${S.buildings.size} prédios, ${sem} sem degrau gravado (de antes): o degrau de cada um é o do seu tamanho (fora: ${fora}); a escala no verificador: ${esc.length}; ida e volta pelo save: ${rt.diff.length ? rt.diff.slice(0, 3).join(' · ') : 'sem diferença'}`);
  M.saltar(1); let mudou = 0; for (const b of S.buildings.values()) if (lotes.has(b.id) && lotes.get(b.id) !== `${b.x},${b.y},${b.w},${b.h}` && !b.amp) mudou++;
  ok('e11b nada se refaz à força', !mudou, `um ano depois, ${mudou} prédios de antes com outro lote sem uma ampliação`);
});

// ------------------------------ e12: a mesma semente, a mesma escolha ------------------------------
run('e12', () => {
  const vez = () => { abre(); const set = maior(); rico(set); const b = sim(() => V.startProject(set, 'temple')); M.saltar(1); return `${lado(b)} · ` + require('crypto').createHash('sha1').update(G.Save.serialize()).digest('hex').slice(0, 16); };
  const a = vez(), b = vez();
  ok('e12 a mesma semente, a mesma escolha', a === b, `${a}${a === b ? ' — igual nas duas vezes' : ' ≠ ' + b}`);
});

console.log(fails.length ? `FALHOU: ${fails.join(', ')} (${ms()} ms)` : `PASSOU (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
