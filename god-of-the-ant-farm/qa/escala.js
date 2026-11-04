// escala: o cenário da escala dos prédios na cidade (D-106, a Arquitetura Monumental; o especialista da cidade — D-115 a D-117),
// em Node, na metrópole pronta. Com só o degrau clássico de cada tipo, nada muda (e0). Com os degraus grandes ligados por
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
// Coliseu pelos lugares da planta (e19); o porquê de cada capital nos três mundos prontos (e20). Onde o povo já tem a forma
// grande de verdade (o Coliseu romano do M1, os palácios do M2), a prova usa a dele.
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
const cidade = nome => [...S.settlements.values()].find(s => s.name === nome);
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
// tipos que ainda não têm degrau maior em povo nenhum — os banhos, a biblioteca, o mercado, o paço municipal — escolhem o
// clássico de verdade em toda cidade)
const PUB = ['maravilha', 'teatro', 'temple', 'palacio', 'grande_palacio', 'palacio_colossal', 'paco', 'monument', 'banhos', 'biblioteca', 'mercado', 'administracao'];
run('e0', () => {
  abre(); const choose0 = Es.choose; let classic = 0, opens = 0, grew = 0, great = 0, mexeu = 0, guardou = 0, cidades = 0;
  Es.choose = (set, type) => [Es.classic(type)];
  try {
    for (const set of S.settlements.values()) {
      const fac = G.Fac.get(set.fac); if (!fac) continue; cidades++; const c = V.counts(set.id);
      for (const t of PUB) { classic++; if (Es.choose(set, t).some(s => V.opens(t, s))) opens++; }
      const rng0 = S.rng;
      if (sim(() => V.grow(set, fac, c))) grew++;
      if (V.greatWork(set, c)) great++;
      if (S.rng !== rng0) mexeu++;
    }
  } finally { Es.choose = choose0; }
  ok('e0 só o clássico: nada muda', !opens && !grew && !great && !mexeu && cidades > 0, `${cidades} cidades, ${classic} escadas só com o clássico: nenhuma abre espaço (${opens}); ampliações ${grew}, obras que guardam a pedra ${great}, o acaso do mundo tocado ${mexeu}`);
  const sem = ['banhos', 'biblioteca', 'mercado', 'administracao']; let maior = [];
  for (const set of S.settlements.values()) for (const t of sem) if (Es.choose(set, t).some(st => st.n !== Es.n0(t))) maior.push(`${set.name}/${t}`);
  ok('e0b os tipos sem degrau maior escolhem o clássico', !maior.length, maior.length ? `com degrau maior: ${maior.slice(0, 4).join(', ')}` : `${sem.join(', ')}: o clássico em toda cidade`);
});

// ------------------------------ os geradores de teste (só nesta prova) ------------------------------
const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const GERA = { maravilha: [10, 13], teatro: [6, 8, 10], temple: [4, 6, 8], palacio: [6], grande_palacio: [8], palacio_colossal: [10], paco: [3], monument: [4] };
{ abre(); for (const t in GERA) for (const st of STY) { const F0 = G.Forma.of(t, st); if (!F0) continue; G.Forma.def(t, st, () => ({ els: F0.els, door: F0.door, body: F0.body, amphi: F0.amphi, stalls: F0.stalls, bays: F0.bays }), GERA[t]); } }

// ------------------------------ e1: a aldeia escolhe o pequeno, a capital o grande ------------------------------
run('e1', () => {
  abre(); const cap = cidade('Mênfis');
  const vila = [...S.settlements.values()].filter(s => V.pop(s.id) >= 3 && V.pop(s.id) < 30 && (s.tier || 0) <= 1).sort((a, b) => V.pop(a.id) - V.pop(b.id) || a.id - b.id)[0];
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
run('e3', () => {
  abre(); const set = cidade('Óstia'); const lim = V.openLimit(4);
  // (a velha quadra: casas baixas da cidade, de pé, em cada lote livre de 4 casas que o planejador acharia — até não sobrar nenhum)
  let P, k = 0; const quadra = [];
  for (; k < 16; k++) { set._noSite = {}; P = sim(() => V.findSite(set, 'temple', undefined, 4)); if (!P) break; for (const [dx, dy] of k === 0 ? [[0, 0], [2, 2]] : [[1, 1]]) quadra.push(sim(() => V.addBuilding('house', P[0] + dx, P[1] + dy, set.id, true)).id); }
  if (!ok('e3a sem lote livre', !P, `${k} lotes livres de 4 casas tomados por ${quadra.length} casas baixas da cidade; nenhum sobrou`)) return;
  const antes = new Map(); for (const o of S.buildings.values()) if (o.set === set.id) antes.set(o.id, o.type);
  const pub = () => [...S.buildings.values()].filter(o => o.set === set.id && o.type !== 'ruin' && (G.BDEF[o.type].civic || o.type === 'temple' || o.type === 'monument')).length;
  const farms = () => [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'farm').length;
  const pub0 = pub(), farms0 = farms(), id0 = S.nextId, h0 = marca();
  set._noSite = {}; rico(set); const b = sim(() => V.startProject(set, 'temple'));
  const foi = [...antes.keys()].filter(id => !S.buildings.has(id)); const tipos = foi.map(id => antes.get(id));
  const novos = [...S.buildings.values()].filter(o => o.id >= id0 && o !== b && o.set === set.id);
  const camasFoi = foi.reduce((s, id) => s + (G.BDEF[antes.get(id)].housing || 0), 0), camasNovas = novos.reduce((s, o) => s + (G.BDEF[o.type].housing || 0), 0);
  const camposFoi = tipos.filter(t => !G.BDEF[t].housing).length, camposNovos = novos.filter(o => !G.BDEF[o.type].housing).length;
  const linha = linhas(h0, /abriu espaço/)[0];
  ok('e3b abre espaço', !!b && b.w === 4 && b.esc === 'templo' && foi.length > 0 && ocupa(b), `${set.name} ergue ${lado(b)} derrubando ${foi.length}: ${tipos.join(', ')}`);
  ok('e3c só casas baixas e campos da cidade', tipos.every(t => V.OPEN[t]) && pub() === pub0 + 1 && farms() >= Math.min(2, farms0), `os públicos ${pub0} → ${pub()} (só o templo novo), as fazendas ${farms0} → ${farms()}`);
  ok('e3d o limite do degrau', foi.length <= lim.bld && camasFoi <= lim.beds, `${foi.length} prédios e ${camasFoi} camas (o limite do degrau de 4: ${lim.bld} e ${lim.beds})`);
  const perto = novos.filter(o => o.x + o.w > b.x - 1 && o.x < b.x + b.w + 1 && o.y + o.h > b.y - 1 && o.y < b.y + b.h + 1);
  ok('e3e mais camas do que derrubou; os campos mudam de lugar', camasNovas > camasFoi && camposNovos === camposFoi && !perto.length, `as famílias: ${camasFoi} camas derrubadas, ${camasNovas} em ${novos.filter(o => G.BDEF[o.type].housing).length} casas novas (${novos.filter(o => G.BDEF[o.type].housing).map(o => o.type).join(', ')}); campos ${camposFoi} → ${camposNovos} em lote novo; nenhum no lote nem no anel do templo`);
  const semCasa = [...S.villagers.values()].filter(v => v.home && !S.buildings.has(v.home));
  ok('e3f a crônica e as famílias', !!linha && !semCasa.length, `«${linha ? linha.txt : 'nenhuma linha'}»; ninguém com casa derrubada por casa (${semCasa.length})`);
  const c = checa(); ok('e3g verificador', c.ok, c.txt);
});
// ------------------------------ e3x: o juiz do lote, regra a regra ------------------------------
run('e3x', () => {
  abre(); const set = cidade('Óstia'); set._noSite = {}; const P = sim(() => V.findSite(set, 'temple', undefined, 4));
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
  abre(); const set = cidade('Roma'); const b = sim(() => V.handFound(set, 'maravilha', 'maravilha', { R: 60 }));
  if (!ok('e4a a obra grande', !!b && b.w === 10 && !b.built, `${set.name}: ${lado(b)}, a conta ${b ? JSON.stringify(V.bill(b)) : '?'}, o trabalho ${b ? V.workOf(b) : '?'}`)) return;
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
  abre(); const set = cidade('Mênfis'); const b = sim(() => V.handFound(set, 'temple', 'templo', { built: true, R: 60 }));
  if (!ok('e6a o templo grande de pé', !!b && b.w === 4 && b.built, `${set.name} (${V.pop(set.id)}): ${lado(b)}`)) return;
  const quem = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v._ruler).sort((a, c) => c.age - a.age || a.id - c.id);
  sim(() => { for (const v of quem) { if ([...S.villagers.values()].filter(o => o.set === set.id).length < 30) break; V.kill(v, 'old'); } });
  const ch = Es.choose(set, 'temple'); const fac = G.Fac.get(set.fac);
  const g = sim(() => V.grow(set, fac, V.counts(set.id))); const o = S.buildings.get(b.id);
  ok('e6b a cidade que encolheu escolhe o pequeno, o grande fica', ch[0].id === 'santuario' && !!o && o.w === 4 && o.esc === 'templo' && o.built && (!g || g.id !== b.id), `${set.name} com ${V.pop(set.id)} pessoas escolhe ${ch.map(s => s.id + '/' + s.n).join(' > ')}; o templo continua ${o ? lado(o) : 'SUMIU'}`);
  const c = checa(); ok('e6c verificador', c.ok, c.txt);
});

// ------------------------------ e7: a ampliação no lugar ------------------------------
// (um santuário de pé no meio de um lote livre de 4 casas, numa cidade que já justifica o templo de 4: o planejador o amplia)
function santuario(set) {
  set._noSite = {}; const P = sim(() => V.findSite(set, 'temple', undefined, 4)); if (!P) return null;
  return sim(() => V.handFound(set, 'temple', 'santuario', { x: P[0] + 2, y: P[1] + 2, R: 0, built: true }));
}
run('e7', () => {
  abre(); const set = cidade('Mênfis'); const fac = G.Fac.get(set.fac); const b0 = santuario(set);
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
  abre(); let set = null, b0 = null; const P6 = degrau('palacio', 6);
  // (um palácio clássico de pé num lugar com 6 casas livres em volta: o pódio de 3 m não basta perto destas capitais (D-115), e
  // aqui ele vai a 6 m só para pôr o palácio — o juiz é o mesmo)
  const pod = V.PODIUM; V.PODIUM = 4;
  try {
    for (const s of [...S.settlements.values()].filter(o => (o.tier || 0) >= 2).sort((a, c) => V.pop(c.id) - V.pop(a.id))) {
      s._noSite = {}; const P = sim(() => V.findSite(s, 'palacio', undefined, 6)); if (!P) continue;
      b0 = sim(() => V.handFound(s, 'palacio', 'antigo', { x: P[0] + 3, y: P[1] + 3, R: 0, built: true })); if (b0) { set = s; break; }
    }
    if (!ok('e8a o palácio de antes', !!b0 && b0.w === 3, b0 ? `${set.name}: ${lado(b0)}, de ${b0.patron || 'ninguém'}` : 'nenhuma cidade com lugar')) return;
    const pat = b0.patronId && S.villagers.get(b0.patronId); const nm0 = V.buildName(b0); const id = b0.id;
    const pos = V.growLot(set, b0, P6); const r = pos && sim(() => V.enlarge(b0, P6, pos));
    ok('e8b o palácio cresce, o patrono mora nele', !!r && r.id === id && r.w === 6 && V.buildName(r) === nm0 && r.patron === b0.patron && (!pat || pat.palace === id),
      `${r ? lado(r) : 'nada'} «${r ? V.buildName(r) : '-'}»; ${pat ? pat.name + ' com o palácio #' + pat.palace : 'sem patrono vivo'}`);
    const c = checa(); ok('e8c verificador', c.ok, c.txt);
  } finally { V.PODIUM = pod; }
});
// ------------------------------ e9: a ampliação que ninguém alcança volta ao que era ------------------------------
run('e9', () => {
  abre(); const set = cidade('Mênfis'); const fac = G.Fac.get(set.fac); const b0 = santuario(set);
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
function extras(comObra) {
  abre(); const set = cidade('Roma'); sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin') V.completeBuilding(o); });
  const b = comObra ? sim(() => V.handFound(set, 'maravilha', 'maravilha', { R: 60 })) : null; const great = V.greatWork(set, V.counts(set.id));
  const id0 = S.nextId; M.saltar(1); const out = [];
  for (const o of S.buildings.values()) if (o.id >= id0 && o.set === set.id) { const d = G.BDEF[o.type === 'ruin' ? o.origType : o.type]; if (d && !d.housing && (d.cost.stone || 0) >= 8 && !NEED.includes(o.type)) out.push(o.type); }
  return { b, great, out };
}
run('e10', () => {
  const A = extras(true);
  if (!ok('e10a a maravilha em obra guarda a pedra', !!A.b && !!A.great && A.great.id === A.b.id, `${lado(A.b)} espera pedra (${A.b ? A.b.need.stone : '?'}): ${A.great ? 'é a obra grande da cidade' : 'NÃO é vista'}`)) return;
  const B = extras(false);
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
// (no raio dela, um lote de até 3 m com o anel sem penhasco antes de um mais perto e mais íngreme; sem nenhum, o mais perto)
run('e14', () => {
  abre(); const set = cidade('Óstia'); const n = 4; const N = G.N; const ox = Math.floor(set.cx), oy = Math.floor(set.cy);
  const livre = (x, y) => { for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return false; const i = ty * N + tx; if (S.occ[i] || S.wall[i] || S.type[i] < G.T.SAND) return false; if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0)) return false; } return true; };
  let perto = null; for (let r = 0; r <= 40 && !perto; r++) for (let dy = -r; dy <= r && !perto; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - 2, y = oy + dy - 2; if (livre(x, y)) { perto = { x, y, r, sl: G.W.slope(x, y, n, n) }; break; } }
  const b = sim(() => V.handFound(set, 'temple', 'templo', { R: 40 })); const sl = b ? G.W.slope(b.x, b.y, n, n) : 99;
  ok('e14 a mão do deus prefere o pódio', !!b && sl <= V.PODIUM, `o lote livre mais perto de ${set.name}: ${perto ? `${perto.x},${perto.y} com ${(perto.sl * 1.5).toFixed(1)} m` : '-'}; a mão pôs ${lado(b)} com ${(sl * 1.5).toFixed(1)} m${perto && perto.sl > V.PODIUM ? ' (o mais perto era íngreme demais: foi a outro)' : ''}`);
});

// ------------------------------ e15: a renda de pedra e o pedido (D-120) ------------------------------
// (o livro conta a pedra que as mãos do povo trazem ao estoque — a entrega —, não a que a prova põe; um degrau maior de uma obra
// pública só com a pedra de vinte anos — a do estoque e a renda —, o clássico pela pedra guardada, como antes)
run('e15', () => {
  abre(); const set = cidade('Roma'); const f = G.Fac.get(set.fac); const fid = f.id; const P6 = degrau('palacio', 6);
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
  abre(); const set = cidade('Roma'); const fid = set.fac; const f = G.Fac.get(fid);
  const b = sim(() => V.handFound(set, 'palacio', 'palacio', { R: 60 })); if (!ok('e16a a obra grande', !!b && b.w === 6 && !b.built, lado(b))) return;
  const fed = V.foodSafe(fid), hi = V.housingInfo(set.id); const v1 = V.vez(set), p1 = V.workPri(b);
  const food = f.stock.food || 0; sim(() => D.use('f:' + fid, 'food', food, { code: 'teste' })); const v2 = V.vez(set), p2 = V.workPri(b);
  sim(() => D.make('f:' + fid, 'food', food, { code: 'teste' }));
  const adulto = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 16 && v.home && !v.captive).sort((a, c) => a.id - c.id)[0]; const casa = adulto.home;
  adulto.home = 0; const v3 = V.vez(set), p3 = V.workPri(b); adulto.home = casa; const v4 = V.vez(set);
  const santo = sim(() => V.handFound(set, 'temple', 'santuario', { R: 60 })); const p5 = santo ? V.workPri(santo) : 0;
  ok('e16b a vez', fed && !hi.homeless && v1 === 1 && p1 === -V.GREAT_PRI && v2 === 0 && p2 === 0 && v3 === 0 && p3 === 0 && v4 === 1 && !p5,
    `${set.name} alimentada (${Math.round(food)} de comida para ${G.Fac.pop(fid)}) e em casa: a vez ${v1} (${p1}); sem comida: ${v2} (${p2}); um adulto sem casa: ${v3} (${p3}); de volta: ${v4}; um santuário em obra: ${p5}`);
  salva(); const s2 = cidade('Roma'); ok('e16c a vez vai no save', (s2.vez || 0) === v4, `depois do save: ${s2.vez}`);
});

// ------------------------------ e17: de fora e de dentro (D-120) ------------------------------
// (o Coliseu romano procura até o raio e vinte; o palácio, até o raio e seis e depois doze; quem não acha diz por quê, com números)
run('e17', () => {
  abre(); const roma = cidade('Roma'), argos = cidade('Argos');
  const r1 = V.reachOf(roma, 'maravilha').join(), r2 = V.reachOf(roma, 'palacio').join(), r3 = V.reachOf(argos, 'maravilha').join();
  ok('e17a de fora e de dentro', r1 === '20' && r2 === '6,12' && r3 === '6,12', `o Coliseu de Roma até o raio e ${r1}; o palácio de Roma ${r2}; a maravilha de Argos ${r3}`);
  roma._noSite = {}; const p = sim(() => V.findSite(roma, 'palacio', undefined, 6)); const R = G.Urban.radius(roma, { w: 6 }, V.pop(roma.id));
  const d = p ? G.dist(p[0] + 3, p[1] + 3, roma.cx, roma.cy) : 0;
  ok('e17b o palácio de 6 de Roma, dentro do alcance', !!p && !p.demolish && d <= R + 12, p ? `em ${p.join(',')}, a ${d.toFixed(0)} casas (o raio ${R})` : 'sem lote');
  const w = V.landWhy(roma, 'maravilha', 10); roma._noSite = {}; const q = sim(() => V.findSite(roma, 'maravilha', undefined, 10));
  const R10 = Math.round(G.Urban.radius(roma, { w: 10 }, V.pop(roma.id))) + 20;
  ok('e17c o Coliseu sem terra diz por quê', w.R === R10 && (w.free || !q) && /\d/.test(w.txt), `«${w.txt}»`);
});

// ------------------------------ e18: limpar o lote — as ruas menores que o anel junta, a madeira para a obra (D-120) ------------------------------
run('e18', () => {
  abre(); const set = cidade('Óstia'); set._noSite = {}; const P = sim(() => V.findSite(set, 'temple', undefined, 4)); const N = G.N;
  if (!ok('e18a um lote de 4', !!P, P ? P.join(',') : 'nenhum')) return;
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
  // (a madeira das árvores do lote vai para a obra do degrau maior)
  let plant = 0; for (let ty = y; ty < y + 4; ty++) for (let tx = x; tx < x + 4; tx++) if (!S.treeAt[ty * N + tx] && G.Nature.addTree(tx + 0.5, ty + 0.5, 'oak', 0.9)) plant++;
  let grown = 0; for (let ty = y; ty < y + 4; ty++) for (let tx = x; tx < x + 4; tx++) { const t = S.trees.get(S.treeAt[ty * N + tx]); if (t && t.stage === 'grow' && t.size > 0.5) grown++; }
  const l0 = (S.ledgerN || 0); const b = sim(() => V.handFound(set, 'temple', 'templo', { x, y, R: 0 }));
  const lenha = D.ledger().filter(e => e[0] > l0 && e[8] === 'clareira'); const naObra = b ? lenha.filter(e => e[4] === 'o:' + b.id).length : 0;
  ok('e18c a madeira do lote vai para a obra', !!b && b.x === x && b.y === y && grown > 0 && naObra === Math.min(grown, Es.bill('temple', degrau('temple', 4)).cost.wood), `${grown} árvores crescidas no lote (${plant} plantadas pela prova): ${naObra} toras na obra ${b ? '#' + b.id : '-'}, ${lenha.length - naObra} no estoque`);
  const c = checa(); ok('e18d verificador', c.ok, c.txt);
});

// ------------------------------ e19: os jogos do Coliseu, pelos lugares da planta (D-120) ------------------------------
// (o Coliseu de Roma de pé: os lugares do público — as fileiras e o pódio, 'assistir' — e da areia — 'lutar' — que a planta do
// degrau tem; os lutadores, um posto para cada lugar de luta; um dia de jogos: os lutadores na areia, o público nas fileiras,
// tantos quantos vêm, e no fim ninguém lá dentro)
run('e19', () => {
  abre(); const set = cidade('Roma'); const In = G.Interiors, Tt = G.Teatro, E = G.Eco;
  let b = sim(() => V.handFound(set, 'maravilha', 'maravilha', { R: 60, built: true }));
  if (!ok('e19a o Coliseu de pé', !!b && b.w === 10 && b.built && G.Interiors.plan(b).ok, lado(b))) return;
  const T = In.table(b); const of = u => (T && T.byUse.get(u)) || []; const assentos = of('assistir').filter(e => e.it.kind === 'fileira').length, emPe = of('assistir').filter(e => e.it.kind === 'marca').length;
  const ver = of('assistir').length, luta = of('lutar').length, jb = E.jobsOf(b);
  ok('e19b os lugares da planta', assentos >= 700 && emPe >= 50 && luta === 8 && !!jb && jb.n === luta && jb.role === 'ator', `${assentos} assentos nas fileiras e ${emPe} em pé no pódio (${ver} para ver), ${luta} na areia; os postos: ${jb ? jb.n + ' de ' + jb.role : 'nenhum'}`);
  // (os lutadores: oito adultos de Roma no ofício, a cada um o seu posto pelo repartidor do povo — E.place)
  const sobra = v => v.set === set.id && v.age >= 18 && v.age <= 55 && !v.captive && !v.jail && !v.aboard && v.role !== 'guerreiro';
  let n = 0; for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) { if (n >= luta) break; if (!sobra(v) || v.role === 'ator') continue; v.role = 'ator'; v.job = 0; sim(() => G.Vg.endTask(v)); n++; }
  sim(() => E.place(set)); const cast = Tt.actorsOf(b);
  S.time = Tt.EARLY - 0.02; S.weather.rain = 0; S.weather.storm = 0; S.time = Math.max(S.time, Tt.opensAt(b) - 0.01);
  let op = null; for (let k = 0; k < 40 && !op; k++) { M.viver(1); op = Tt.dia(b); }
  let salvo = null; // (o save no meio dos jogos: os lutadores de volta à areia, cada um no seu lugar de luta)
  if (!ok('e19c os jogos do dia', cast.length > 0 && !!op, `${cast.length} lutadores com o posto no Coliseu; o espetáculo ${op ? '#' + op.id + ' aberto' : 'NÃO abriu'}`)) return;
  let mais = 0, quem = 0, naAreia = 0, nasFileiras = 0;
  for (let k = 0; k < 160 && Tt.dia(b); k++) {
    M.viver(1);
    if (op.data.fase === 'portas' || op.data.fase === 'peca') for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) { if (v.set !== set.id || v.age < 16 || v.role === 'ator' || v.sleeping || v.inside || (v.task && (v.task.type === 'teatro' || (v.task.pri || 0) >= 1))) continue; if (sim(() => Tt.visit(v, b))) quem++; }
    if (op.data.fase === 'peca') { let fi = 0, ar = 0; for (const v of S.villagers.values()) { if (v.inside !== b.id) continue; const p = In.placeOf(v); if (p && p.use === 'assistir') fi++; if (p && p.use === 'lutar') ar++; }
      mais = Math.max(mais, Object.keys(op.data.plateia).length); nasFileiras = Math.max(nasFileiras, fi); naAreia = Math.max(naAreia, ar);
      if (ar && !salvo) { const id = b.id, oid = op.id; salva(); b = S.buildings.get(id); op = G.Act.get(oid); M.viver(1);
        const lut = Object.keys(op.data.atores).map(k => S.villagers.get(+k)).filter(Boolean); salvo = { ar, usos: lut.map(v => (v.task && v.task.use) || '-'), naAreia: lut.filter(v => { const p = In.placeOf(v); return p && p.use === 'lutar'; }).length }; } }
  }
  ok('e19g o save no meio dos jogos', !!salvo && salvo.naAreia > 0 && salvo.usos.every(u => u === 'lutar'), salvo ? `${salvo.ar} na areia antes do save; depois, os lutadores com a tarefa de ${[...new Set(salvo.usos)].join(', ')} e ${salvo.naAreia} num lugar de luta` : 'sem save (ninguém na areia)');
  M.viver(2); // (os bebês no colo saem com quem os carrega, no passo seguinte)
  const lista = [...S.villagers.values()].filter(v => v.inside === b.id); const dentro = lista.length;
  if (VERB || dentro) console.log('  lá dentro:', lista.map(v => { const c = v.carrier && S.villagers.get(v.carrier); return `${v.id} ${v.role} ${v.task ? v.task.type + '/' + v.task.st + '/' + (v.task.use || '') : '-'} colo ${v.carrier || 0}${c ? ' (' + c.role + ', dentro de ' + c.inside + ', ' + (c.task ? c.task.type : '-') + ')' : ''}`; }).join(' · '));
  ok('e19d os lutadores na areia, o público nas fileiras', naAreia > 0 && naAreia <= luta && nasFileiras > 0 && nasFileiras <= ver && mais <= ver, `no auge, ${mais} na plateia (${nasFileiras} em lugares de ver) e ${naAreia} lutando na areia; ${quem} chamados aos jogos`);
  ok('e19e no fim, ninguém lá dentro', !Tt.dia(b) && !dentro, `o espetáculo ${Tt.dia(b) ? 'AINDA ABERTO' : op.st + ' (' + (op.why || '') + ')'}; ${dentro} lá dentro`);
  const c = checa(); ok('e19f verificador', c.ok, c.txt);
});

// ------------------------------ e21: o campo guardado para a obra grande (D-121) ------------------------------
// (num mundo novo, a terra ainda aberta: a capital que vira cidade guarda o lote do maior degrau da sua obra grande; as buscas o
// deixam de fora; o save; o deus põe um poço nele (solta, e outro se guarda); a cidade que perde o nível; o meteoro; as pedras do
// lote quebradas para a obra fundada nele; a cidade que some; o verificador)
run('e21', () => {
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4, temper: 'normal' }); S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; M.saltar(3);
  const caps = [...new Set([...S.factions.values()].map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  const set = caps.find(s => V.resWork(s)); if (!ok('e21a uma capital com obra grande', !!set, set ? `${set.name} (${G.Civ.idOfFac(set.fac)}): ${V.resWork(set).type} ${V.resWork(set).steps.map(s => s.n).join('/')}` : 'nenhuma')) return;
  const t0 = set.tier; set.tier = 3; const h0 = marca(); const r = sim(() => V.reservaDia(set)); const R = V.reserva(set);
  let livre = !!R; if (R) for (let y = R.y; y < R.y + R.n; y++) for (let x = R.x; x < R.x + R.n; x++) { const o = S.occ[y * G.N + x] && S.buildings.get(S.occ[y * G.N + x]); if (o && !(o.set === set.id && V.OPEN[o.type] && !G.BDEF[o.type].housing)) livre = false; }
  ok('e21b a cidade guarda o lote', !!R && R.n === Es.steps(R.type).find(s => s.id === R.esc).n && livre && linhas(h0, /guardou um campo/).length > 0, R ? `${R.type}/${R.esc}: ${R.n} × ${R.n} em ${R.x},${R.y}, a ${G.dist(R.x + R.n / 2, R.y + R.n / 2, set.cx, set.cy).toFixed(0)} casas; «${(linhas(h0, /guardou/)[0] || { txt: '-' }).txt}»` : 'nada guardado');
  if (!R) return;
  const casa = V.resOver(set, 'house', R.x + 1, R.y + 1, 1, 1, true), campo = V.resOver(set, 'farm', R.x, R.y, 3, 3, false), obra = V.resOver(set, R.type, R.x, R.y, R.n, R.n, true);
  let busca = 0; for (let k = 0; k < 6; k++) { set._noSite = {}; const p = sim(() => V.findSite(set, 'house')); if (p && p[0] < R.x + R.n && p[0] + 1 > R.x && p[1] < R.y + R.n && p[1] + 1 > R.y) busca++; }
  ok('e21c as buscas o deixam de fora', casa === set && !campo && !obra && !busca, `uma casa nele: ${casa ? 'barrada' : 'LIVRE'}; um campo da cidade: ${campo ? 'BARRADO' : 'pode'}; a obra dele: ${obra ? 'BARRADA' : 'pode'}; 6 buscas de casa: ${busca} nele`);
  salva(); const set2 = cidade(set.name); const R2 = V.reserva(set2);
  ok('e21d o save', JSON.stringify(R2) === JSON.stringify(R), `depois do save: ${JSON.stringify(R2)}`);
  const c0 = checa(); ok('e21e verificador', c0.ok, c0.txt);
  // (o deus põe um poço no lote: o lote se solta, e no dia seguinte a cidade guarda outro, sem o poço)
  const poco = sim(() => V.addBuilding('well', R.x + 2, R.y + 2, set2.id, true)); const solto = V.reserva(set2), why = set2.urb.resGone && set2.urb.resGone.why;
  set2.urb.resGone.day = S.day - 1; const R3 = sim(() => V.reservaDia(set2)); const sobre = R3 && poco.x >= R3.x && poco.x < R3.x + R3.n && poco.y >= R3.y && poco.y < R3.y + R3.n;
  ok('e21f o deus põe um poço nele', !solto && why === 'ocupada' && !!R3 && !sobre, `com o poço #${poco.id}: ${solto ? 'AINDA GUARDADO' : 'solto (' + why + ')'}; no dia seguinte: ${R3 ? `outro em ${R3.x},${R3.y}${sobre ? ' — SOBRE O POÇO' : ''}` : 'nenhum'}`);
  if (!R3) return;
  // (a cidade abaixo de cidade: guarda até RES_YEARS anos; depois, solta)
  set2.tier = 2; const a = sim(() => V.reservaDia(set2)); set2.urb.res.lost = S.day - V.RES_YEARS; const b = sim(() => V.reservaDia(set2));
  ok('e21g a cidade que perde o nível', !!a && !b && set2.urb.resGone.why === 'nivel', `no primeiro ano abaixo: ${a ? 'guardado' : 'SOLTO'}; depois de ${V.RES_YEARS} anos: ${b ? 'AINDA GUARDADO' : 'solto (' + set2.urb.resGone.why + ')'}`);
  set2.tier = 3; set2.urb.resGone.day = S.day - 1; const R4 = sim(() => V.reservaDia(set2));
  // (o meteoro no meio do lote: o chão muda, o lote não serve mais)
  const m = sim(() => { G.Powers.meteorImpact({ x: R4.x + R4.n / 2, y: R4.y + R4.n / 2, r: 3.4, t: 0, delay: 0 }); return V.reservaDia(set2); });
  ok('e21h o meteoro', !!R4 && !m && set2.urb.resGone.why === 'terra', `${R4 ? 'guardado de novo em ' + R4.x + ',' + R4.y : '-'}; depois do meteoro: ${m ? 'AINDA GUARDADO' : 'solto (' + set2.urb.resGone.why + ')'}`);
  // (a obra fundada no lote: as pedras do lote quebradas para ela, o lote solto)
  set2.urb.resGone.day = S.day - 1; const R5 = sim(() => V.reservaDia(set2));
  if (!ok('e21i guardado outra vez', !!R5, R5 ? `${R5.x},${R5.y}` : 'sem lote')) return;
  let pedras = 0; for (let y = R5.y; y < R5.y + R5.n && pedras < 3; y++) for (let x = R5.x; x < R5.x + R5.n && pedras < 3; x++) if (!S.occ[y * G.N + x] && !S.treeAt[y * G.N + x] && !S.objAt[y * G.N + x] && G.Nature.addRock(x + 0.5, y + 0.5, 40)) pedras++;
  rico(set2); const L0 = S.ledgerN || 0; set2._noSite = {}; const w = sim(() => V.startProject(set2, R5.type));
  const dentro = w && w.x >= R5.x && w.y >= R5.y && w.x + w.w <= R5.x + R5.n && w.y + w.h <= R5.y + R5.n;
  const pedra5 = D.ledger().filter(e => e[0] > L0 && e[8] === 'pedreira').reduce((s, e) => s + e[6], 0);
  ok('e21j a obra no lote guardado, com a pedra do lote', !!w && dentro && !V.reserva(set2) && set2.urb.resGone.why === 'fundada' && pedra5 >= 40, `${lado(w)}${dentro ? ' dentro do lote' : ' FORA DO LOTE'}; o lote ${V.reserva(set2) ? 'AINDA GUARDADO' : 'solto (' + set2.urb.resGone.why + ')'}; ${pedras} pedras postas no lote, ${pedra5} de pedra quebrada pelo livro`);
  // (o verificador vê um prédio num lote guardado — a prova o põe à mão, sem o V.addBuilding)
  const s3 = [...S.settlements.values()].sort((a, c) => a.id - c.id).find(o => o.id !== set2.id && [...S.buildings.values()].some(q => q.set === o.id && q.built && !V.OPEN[q.type])); // (do mundo de agora: o save fez outro)
  if (s3) {
    const any = [...S.buildings.values()].find(o => o.set === s3.id && o.built && !V.OPEN[o.type]);
    const st = Es.steps(R5.type).find(q => q.id === R5.esc); (s3.urb || (s3.urb = { d: [], names: [] })).res = { type: R5.type, esc: R5.esc, n: st.n, x: any.x, y: any.y, d: S.day, chk: S.day, lost: 0 };
    const viu = QA.check().filter(q => q.sys === 'escala' && /campo guardado/.test(q.msg)); s3.urb.res = null;
    ok('e21k o verificador vê um prédio no lote', viu.length > 0, viu.length ? viu[0].msg.slice(0, 160) : 'NÃO VIU');
  }
  // (a cidade que some: o lote vai com ela)
  const s6 = [...new Set([...S.factions.values()].map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => a.id - c.id).find(o => o.id !== set2.id && V.resWork(o));
  if (s6) { s6.tier = 3; const R6 = sim(() => V.reservaDia(s6)); const id6 = s6.id; const outra = [...S.settlements.values()].find(o => o.id !== id6);
    // (a cidade sem ninguém, deixada ao vento: a gente dela morre antes)
    if (R6) { sim(() => { for (const v of [...S.villagers.values()]) if (v.set === id6) V.kill(v, 'old'); V.abandon(s6); }); ok('e21l a cidade que some', !S.settlements.has(id6) && !V.resOver(outra, 'house', R6.x, R6.y, R6.n, R6.n, true), `${s6.name} abandonada com o lote guardado em ${R6.x},${R6.y}: o lote foi com ela`); } else ok('e21l a cidade que some', false, `${s6.name} não guardou lote`); }
  set.tier = t0;
  const c = checa(); ok('e21m verificador', c.ok, c.txt);
});

// ------------------------------ e22: a audiência no palácio (D-124) ------------------------------
// (o palácio de 6 de Roma de pé, com planta: quem governa no trono, a cidade entra pelos lugares da planta — 'audiencia' e os de
// visitante, 'sentar', até o M2 pôr os de pé da sala do trono —, a ronda fica; o save no meio; quem governa morre no meio; o deus
// derruba o palácio no meio; o voto e o pão iguais, na praça)
const DIST = (v, b) => { const d = G.Vg.door(b); return Math.round(G.dist(v.x, v.y, d[0], d[1])); };
function audiencia(chama) {
  abre(); const set = cidade('Roma'); const f = G.Fac.get(set.fac); const Co = G.Court, P = G.Politics, In = G.Interiors;
  const b = sim(() => V.handFound(set, 'palacio', 'palacio', { R: 60, built: true })); const r = P.ruler(f);
  if (!b || !r) return { set, f, b, r };
  for (const v of [r, ...[...S.villagers.values()].filter(o => o.set === set.id && o.age >= 14 && !o.captive).sort((a, c) => a.id - c.id).slice(0, 40)]) { sim(() => G.Vg.endTask(v)); v.inside = 0; v.sleeping = false; v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 85); }
  const dr = G.Vg.door(b); r.x = dr[0] + 1; r.y = dr[1] + 1;
  for (const v of [...S.villagers.values()].filter(o => o.set === set.id && o.age >= 14 && !o.captive && o !== r).sort((a, c) => a.id - c.id).slice(0, 24)) { v.x = dr[0] + 2 + (v.id % 5); v.y = dr[1] + 2 + (v.id % 3); v.path = null; }
  const vigia = [...S.villagers.values()].filter(o => o.set === set.id && o.age >= 16 && !o.captive && o !== r).sort((a, c) => c.id - a.id)[0];
  sim(() => G.Vg.setTask(vigia, { type: 'ronda', pts: [[dr[0] + 2, dr[1] + 2], [dr[0] + 3, dr[1] + 2]], k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' })); vigia.x = dr[0] + 2; vigia.y = dr[1] + 2;
  S.time = 0.35; const okA = chama === null ? false : sim(() => (chama ? chama(f, set) : Co.audiencia(f, 'teste'))); const ronda = vigia.task && vigia.task.type; const longe = DIST(vigia, b);
  return { set, f, b, r, vigia, ronda, longe, okA, In, Co, P };
}
run('e22', () => {
  let A = audiencia(); const { b, r } = A;
  if (!ok('e22a o palácio pronto e quem governa', !!b && !!r && !!b.ip && A.okA && !!A.f.aud, b ? `${lado(b)}, ${r ? r.name : 'sem governante'}; audiência ${A.okA ? 'chamada' : 'NÃO CHAMADA'}` : 'sem palácio')) return;
  const lugares = A.Co.AUD_USES.reduce((n, u) => n + A.In.slots(b, u).length, 0) - 1; const chamados = A.f.aud.who.length;
  M.viver(25);
  const dentro = [...S.villagers.values()].filter(v => v.inside === b.id && v.task && v.task.kind === 'audiencia' && !v.task.throne); const usos = dentro.map(v => (A.In.placeOf(v) || {}).use || 'sem lugar');
  const tr = A.In.placeOf(r); const th = A.In.slots(b, 'audiencia')[0];
  ok('e22b quem governa no trono, a cidade nos lugares', !!tr && tr.item === th.item.id && tr.use === 'sentar' && dentro.length > 0 && chamados <= lugares && usos.every(u => A.Co.AUD_USES.includes(u)) && usos.includes('audiencia'),
    `${r.name} ${tr ? `no ${tr.it && tr.it.kind || 'lugar'} (${tr.use})` : 'SEM LUGAR'}; ${chamados} chamados para ${lugares} lugares (${A.Co.AUD_USES.join(' e ')}); dentro: ${dentro.length} — ${[...new Set(usos)].map(u => u + ' ' + usos.filter(x => x === u).length).join(', ')}`);
  ok('e22c a ronda fica', !A.f.aud.who.includes(A.vigia.id) && A.ronda === 'ronda', `${A.vigia.name}, a ${A.longe} casas da porta: ${A.f.aud.who.includes(A.vigia.id) ? 'CHAMADO' : 'não chamado'}, na ${A.ronda || '-'} ao chamado`);
  const c1 = checa(); ok('e22d verificador', c1.ok, c1.txt);
  // (o verificador vê: a audiência apagada à mão com a cidade nela; quem está nela dentro de outro prédio)
  const aud1 = A.f.aud; A.f.aud = null; const q1 = QA.check().filter(q => q.sys === 'escala' && q.sev === 2 && /não tem audiência/.test(q.msg)).length; A.f.aud = aud1;
  const fo = dentro[0]; const casa = [...S.buildings.values()].find(o => o.built && o.type === 'house' && o.set === A.set.id); fo.inside = casa.id;
  const q2 = QA.check().filter(q => q.sys === 'escala' && q.sev === 2 && /dentro de outro/.test(q.msg)).length; fo.inside = b.id;
  ok('e22m o verificador vê', q1 >= dentro.length && q2 === 1, `com a audiência apagada à mão: ${q1} avisos S2 (${dentro.length} dentro e os que vêm); ${fo.name} posto noutra casa: ${q2}`);
  const aud0 = JSON.stringify(A.f.aud); const ids = dentro.map(v => v.id); salva(); const f2 = G.Fac.get(A.f.id);
  const volta = ids.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.kind === 'audiencia' && v.inside === b.id; }).length;
  ok('e22e o save no meio', !!f2.aud && JSON.stringify(f2.aud) === aud0 && volta === ids.length, `a audiência ${f2.aud ? 'continua' : 'SUMIU'}; ${volta} de ${ids.length} de volta lá dentro`);
  sim(() => V.kill(S.villagers.get(r.id), 'old')); M.viver(4); const r2 = [...S.villagers.values()].filter(v => v.task && v.task.kind === 'audiencia').length;
  ok('e22f quem governa morre no meio', !f2.aud && !r2, `${f2.aud ? 'a audiência AINDA DURA' : 'a audiência acabou'}; ${r2} ainda nela`);
  A = audiencia(); M.viver(15); const n3 = [...S.villagers.values()].filter(v => v.task && v.task.kind === 'audiencia').length;
  sim(() => V.destroyBuilding(S.buildings.get(A.b.id), 'meteor')); M.viver(4); const n4 = [...S.villagers.values()].filter(v => v.task && v.task.kind === 'audiencia').length; const fora = [...S.villagers.values()].filter(v => v.inside === A.b.id).length;
  ok('e22g o deus derruba o palácio no meio', A.okA && n3 > 0 && !A.f.aud && !n4 && !fora, `${n3} na audiência; depois do palácio caído: ${n4} nela, ${fora} lá dentro`);
  const c2 = checa(); ok('e22i verificador', c2.ok, c2.txt);
  // (o voto e o pão: com o palácio pronto de pé, na praça, diante do assento do poder — Po.seat —, como antes; nenhuma audiência)
  A = audiencia(null); const seat = G.Polity.seat(A.f); const praca = [];
  for (const why of ['voto', 'pao']) {
    sim(() => G.Polity.crowd(A.set, why)); const L = [...S.villagers.values()].filter(v => v.task && v.task.type === 'assembly');
    praca.push(`${why}: ${L.length} na praça${L.every(v => v.task.kind === 'assembly' && v.task.x === seat[0] && v.task.y === seat[1]) ? ', diante do assento' : ' (FORA DO ASSENTO)'}`);
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
  const vez = () => { abre(); const set = cidade('Mênfis'); rico(set); const b = sim(() => V.startProject(set, 'temple')); M.saltar(1); return `${lado(b)} · ` + require('crypto').createHash('sha1').update(G.Save.serialize()).digest('hex').slice(0, 16); };
  const a = vez(), b = vez();
  ok('e12 a mesma semente, a mesma escolha', a === b, `${a}${a === b ? ' — igual nas duas vezes' : ' ≠ ' + b}`);
});

console.log(fails.length ? `FALHOU: ${fails.join(', ')} (${ms()} ms)` : `PASSOU (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
