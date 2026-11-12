// oficio-fica: o ofício é da pessoa, e muda devagar, por causa (D-210 a D-212; fecha o T-840).   [ONLY=x1,x4] node qa/oficio-fica.js
// O repartidor de ofícios (village.js, assignJobs) refazia os ofícios a cada 4 s pela necessidade do instante, e quem trocava
// era sorteado: na metrópole pronta 231 trocas por dia entre 337 adultos (0,69 por adulto por dia; 195 trocaram em dois dias,
// 62 três vezes ou mais), na mega 110 por dia entre 261 (0,42). Agora o que cada ofício pede é a memória da cidade (set.ofm, uma
// média lenta do que o instante pede), quem troca é a mão mais nova do ofício (v.roleDay) e fica ao menos V.TRADE_MIN dias no
// ofício que tomou, e a fome, a guerra e a obra grande com a vez puxam na hora — quem é puxado guarda o ofício de onde saiu
// (v.roleBack) e volta a ele. Cada troca do repartidor diz a causa (G.Village.tradeLog).
// x1 a metrópole pronta vivida dois dias (no passo): as trocas pela necessidade abaixo do teto, ninguém troca duas vezes pela
//    necessidade em menos de V.TRADE_MIN dias, toda troca com a causa dita, nenhum cativo no repartidor; a casa guarda a cara
//    (quem mora nela com um ofício que ela mostra — a lenha, a rede, o escudo — tem o mesmo dois dias depois), e o que há em
//    volta das casas muda pouco;
// x2 o mesmo na mega pronta (um dia e meio);
// x3 um mundo do zero: 30 anos de salto — as trocas dos anos 20 a 30 abaixo do teto, o armazém de nenhum povo esvaziou, o povo
//    cresceu — e um dia no passo;
// x4 a fome puxa e devolve: o armazém do povo a zero, e as mãos vão aos ofícios que dão de comer na hora, guardando o ofício e os
//    dias que tinham; o armazém cheio, e voltam ao ofício delas;
// x5 a guerra puxa: declarada, os soldados saem dos outros ofícios na hora, guardando o ofício de onde saíram — os bravos, não
//    as mãos mais novas;
// x6 a vaga: morre quem tinha sozinho um ofício de oficina, e outro o toma (o posto também);
// x7 a oficina nova: a cidade ganha uma olaria, e ela ganha gente;
// x8 o moço que faz dezesseis anos ganha ofício (o primeiro: os dias dele começam V.TRADE_MIN atrás), o velho o larga (e não
//    volta a ofício nenhum);
// x9 o corpo do deus, o preso e quem está no mar não têm o ofício trocado — num ofício que a cidade não pede, de onde o
//    repartidor tira a mão ao lado deles —, e soltos, têm;
// x10 o save no meio: o load não troca ninguém nem mexe na memória, o mesmo save carregado duas vezes vive o mesmo futuro, e um
//    save de antes (sem os campos novos) carrega e vive;
// x11 o salto e o passo: a memória de uma cidade chega ao mesmo lugar no mesmo tempo de mundo nos dois ritmos;
// x12 o celeiro por graus: os agricultores que o instante pede vão de um a dois por fazenda em proporção, entre sete décimos da
//    marca do celeiro e a marca — não num interruptor;
// x13 a obra grande com a vez puxa: uma obra à espera de pedra ganha a vez (D-174), e a turma dela se junta na hora;
// e nenhum erro, e o verificador limpo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/oficio-fica-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | oficio-fica ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const V = G.Village; const DAY = G.DAY_LEN;
const TMIN = V.TRADE_MIN === undefined ? 3 : V.TRADE_MIN;
// the ceilings (changes for the need that lasted, per grown hand, per day): the measure of before in each line
const TETO = 0.12, ANTES = { metropole: 0.69, mega: 0.42 };
// (what the houses show of their people's trades — G.Atmos.about, D-163 —: the changes a day before, by this proof's own count
// run on the game of before; the ceiling is six tenths of it, a war in the middle of the days counted)
const VOLTA = { metropole: 156, mega: 75 }, SHOWN = ['lenhador', 'pescador', 'cacador', 'guerreiro', 'arqueiro', 'tecelao', 'agricultor', 'coletor', 'vinhateiro'];
const FICA = { metropole: '83 de 133, 62 %', mega: '67 de 88, 76 %' };
const KID = { bebe: 1, crianca: 1, anciao: 1, cativo: 1 };
const grown = v => v.age >= 16 && v.age < 62 && !v.captive;
const adults = pred => [...G.S.villagers.values()].filter(v => grown(v) && (!pred || pred(v))).sort((a, b) => a.id - b.id);
const inv = () => QA.check().filter(q => q.sys === 'oficio' && q.sev <= 3).map(q => `[S${q.sev}] ${q.msg}`);
const clean = () => (M.limpo() ? '' : ' · ERROS: ' + JSON.stringify(M.erros()).slice(0, 300));
// (every change the dealing writes, kept past the 600 of its own list)
const LOG = []; if (V.tradeLog) V.tradeLog.push = function (e) { LOG.push(e); return Array.prototype.push.call(this, e); };
// a watch over everybody's trade: each step, who changed (and what the dealing said of it)
function watch() {
  const roles = new Map(); for (const v of G.S.villagers.values()) roles.set(v.id, v.role || null);
  const T = { ch: [], l0: LOG.length, t0: G.S.clock, capt: 0 };
  T.tick = () => {
    for (const v of G.S.villagers.values()) { const p = roles.get(v.id), r = v.role || null; if (p === undefined) { roles.set(v.id, r); continue; } if (p !== r) { T.ch.push({ t: G.S.clock, id: v.id, from: p, to: r, captive: !!v.captive }); roles.set(v.id, r); } }
  };
  T.live = (seg, each) => { const n = Math.round(seg / 0.1); for (let k = 0; k < n; k++) { if (each) each(k); G.debug.step(0.1); T.tick(); } };
  T.log = () => LOG.slice(T.l0);
  // (a change into a trade that the dealing did not say: the black market's own door — economy.js — is the only other one here)
  T.unsaid = () => { const L = T.log(); return T.ch.filter(c => c.to && !KID[c.to] && c.to !== 'contrabandista' && !L.some(e => e.id === c.id && e.to === c.to && Math.abs(e.t - c.t) < 0.35)); };
  return T;
}
const rate = (L, days) => { const n = L.filter(e => e.why === 'falta').length; const A = adults().length; return { n, A, r: n / Math.max(0.01, days) / Math.max(1, A) }; };
// (two changes for the need that lasted, of one person, less than V.TRADE_MIN days apart — a first trade between them, of one set free or arrested, starts over)
const twice = L => { const last = new Map(); let bad = null; for (const e of L) { if (e.why === 'novo') last.delete(e.id); if (e.why !== 'falta') continue; const p = last.get(e.id); if (p !== undefined && e.day - p < TMIN) bad = bad || e; last.set(e.id, e.day); } return bad; };
const whys = L => { const o = {}; for (const e of L) o[e.why] = (o[e.why] || 0) + 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ') || 'nenhuma'; };
const housing = b => !!(b && b.built && G.BDEF[b.type] && G.BDEF[b.type].housing);

// ---------------------------------------------------------------- x1, x2: the ready worlds lived
function ready(key, name, dias) {
  M.pronto(key);
  // (a quarter of a day first: a world of before has no memory yet, and its first dealing starts from the instant's)
  M.viver(0.25 * DAY);
  const T = watch(); const S = G.S;
  // the woodcutters' houses, and what lies about every house
  const shown0 = []; for (const v of S.villagers.values()) if (grown(v) && SHOWN.includes(v.role) && housing(S.buildings.get(v.home))) shown0.push([v.id, v.role, v.home]);
  const sigs = () => { G.Atmos.flush(); const m = new Map(); for (const b of G.S.buildings.values()) if (housing(b)) m.set(b.id, G.Atmos.about(b).sig); return m; };
  let sg = sigs(), about = 0; const hit = new Set();
  T.live(dias * DAY, k => { if (k % 40 === 39) { const n = sigs(); for (const [id, x] of n) { const o = sg.get(id); if (o !== undefined && Math.floor(o / 64) !== Math.floor(x / 64)) { about++; hit.add(id); } } sg = n; } });
  const L = T.log(); const R = rate(L, dias); const bad = twice(L); const un = T.unsaid();
  const capt = L.filter(e => T.ch.some(c => c.id === e.id && c.captive && Math.abs(c.t - e.t) < 0.35));
  ok(`${name} as trocas pela necessidade`, R.r <= TETO && R.n > 0, `${key}, ${dias} dias no passo: ${R.n} trocas pela necessidade entre ${R.A} adultos = ${R.r.toFixed(3)} por adulto por dia (o teto: ${TETO}; antes ${ANTES[key]}); todas as do repartidor: ${whys(L)}`);
  const ages = L.filter(e => e.why === 'falta').map(e => G.S.villagers.get(e.id)).filter(Boolean).map(v => v.age).sort((a, b) => a - b); const all = adults().map(v => v.age).sort((a, b) => a - b);
  const mid = l => (l.length ? l[l.length >> 1] : 0);
  ok(`${name} quem troca é a mão mais nova`, ages.length > 0 && mid(ages) <= mid(all) + 2, `a idade do meio de quem trocou pela necessidade: ${Math.floor(mid(ages))} anos; a de todos os adultos: ${Math.floor(mid(all))} (as mãos mais novas de um ofício são os moços)`);
  ok(`${name} ninguém troca duas vezes às pressas`, !bad, bad ? `a pessoa #${bad.id} trocou pela necessidade duas vezes em menos de ${TMIN} dias (${bad.from} → ${bad.to}, no dia ${bad.day})` : `nenhuma pessoa trocou pela necessidade duas vezes em menos de ${TMIN} dias (${new Set(L.filter(e => e.why === 'falta').map(e => e.id)).size} pessoas trocaram: a idade do meio delas ${ages.length ? Math.floor(ages[ages.length >> 1]) : '-'} anos, a de todos os adultos ${all.length ? Math.floor(all[all.length >> 1]) : '-'})`);
  ok(`${name} toda troca com a causa dita`, !un.length && L.every(e => e.why), un.length ? `${un.length} trocas sem causa dita: ${un.slice(0, 4).map(c => `#${c.id} ${c.from} → ${c.to}`).join(', ')}` : `${T.ch.filter(c => c.to && !KID[c.to]).length} mudanças para um ofício, todas ditas pelo repartidor (ou a porta do mercado clandestino)`);
  ok(`${name} nenhum cativo no repartidor`, !capt.length, capt.length ? `${capt.length} cativos com o ofício trocado: #${capt[0].id}` : `${[...G.S.villagers.values()].filter(v => v.captive).length} cativos no mundo, nenhum com ofício dado`);
  // (the same person, still of the trade the house shows, still of the house — of those alive, grown and living there; the
  // woodcutter's wood at the door among them)
  let kept = 0, tot = 0, wk = 0, wt = 0; const moved = new Set(T.ch.map(c => c.id));
  for (const [id, r, h] of shown0) { const v = G.S.villagers.get(id); if (!v || !grown(v) || v.home !== h) continue; tot++; const same = v.role === r && !moved.has(id); if (same) kept++; if (r === 'lenhador') { wt++; if (same) wk++; } }
  ok(`${name} a casa guarda a cara`, tot > 0 && kept >= tot * 0.75, `dos ${tot} moradores com um ofício que a casa mostra (a lenha, a rede, o escudo…), ${kept} ficaram com ele os ${dias} dias inteiros (${Math.round(100 * kept / Math.max(1, tot))} %; o piso: 75 %; antes: ${FICA[key]}); os lenhadores: ${wk} de ${wt}`);
  const teto = Math.round(VOLTA[key] * 0.6);
  ok(`${name} o que há em volta das casas`, about / dias <= teto, `os ofícios que as casas mostram mudaram ${about} vezes em ${dias} dias (${(about / dias).toFixed(0)} por dia, em ${hit.size} casas; o teto: ${teto} por dia; antes: ${VOLTA[key]} por dia)`);
  const q = inv(); ok(`${name} o verificador e os erros`, !q.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + clean());
}
if (on('x1')) ready('metropole', 'x1 a metrópole:', 2);
if (on('x2')) ready('mega', 'x2 a mega:', 1.5);

// ---------------------------------------------------------------- x3: a world from nothing
if (on('x3')) {
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4 }); const p0 = G.S.villagers.size;
  let fome = 0; const kill0 = V.kill; V.kill = function (v, cause) { if (cause === 'hunger') fome++; return kill0.apply(this, arguments); };
  // (the lowest a people's store came to, a head, looked at each year: a day's eating is two and a half)
  let low = Infinity; const store = () => { for (const f of G.Fac.all()) { const p = G.Fac.pop(f.id); if (p >= 4 && f.alive !== false) low = Math.min(low, (f.stock.food || 0) / p); } };
  for (let y = 0; y < 20; y++) { M.saltar(1); store(); } const l0 = LOG.length; const d0 = G.S.day; let adultDays = 0;
  for (let y = 0; y < 10; y++) { M.saltar(1); store(); adultDays += adults().length; }
  const L = LOG.slice(l0); const n = L.filter(e => e.why === 'falta').length; const r = n / Math.max(1, adultDays); const bad = twice(L);
  ok('x3 do zero: as trocas no salto', r <= TETO && !bad, `semente 103, os anos 20 a 30 no salto (dia ${d0} a ${G.S.day}): ${n} trocas pela necessidade em ${adultDays} adultos-dia = ${r.toFixed(3)} por adulto por dia (o teto: ${TETO}); todas: ${whys(L)}${bad ? ` · a pessoa #${bad.id} trocou duas vezes às pressas` : ''}`);
  ok('x3 do zero: o armazém nunca esvaziou, o povo cresceu', low >= 1.5 && fome <= 5 && G.S.villagers.size >= p0 * 2, `em 30 anos: a comida por pessoa mais baixa de um povo, olhada a cada ano, ${low.toFixed(2)} (o piso: 1,5 — um dia de comer são 2,5); ${fome} mortos de fome (gente longe de casa: o teto 5); ${p0} pessoas → ${G.S.villagers.size} em ${G.S.settlements.size} cidades`);
  const T = watch(); T.live(DAY); const L2 = T.log(); const R = rate(L2, 1); const un = T.unsaid();
  ok('x3 do zero: um dia no passo', R.r <= TETO && !un.length && !twice(L2), `${R.n} trocas pela necessidade entre ${R.A} adultos = ${R.r.toFixed(3)} por adulto por dia; todas: ${whys(L2)}; sem causa dita: ${un.length}`);
  V.kill = kill0; const q = inv(); ok('x3 o verificador e os erros', !q.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + clean());
}

// the biggest town of a ready world (by its grown hands), with its people
const biggest = pred => { let best = null, bn = 0; for (const s of [...G.S.settlements.values()].sort((a, b) => a.id - b.id)) { if (pred && !pred(s)) continue; const n = adults(v => v.set === s.id).length; if (n > bn) { bn = n; best = s; } } return best; };

// ---------------------------------------------------------------- x4: hunger pulls, and gives back
if (on('x4')) {
  M.pronto('metropole'); M.viver(0.25 * DAY);
  const set = biggest(s => !G.Fac.enemiesOf(s.fac).length); const f = G.Fac.get(set.fac); const pop = G.Fac.pop(f.id);
  const day0 = new Map(), back0 = new Map(); for (const v of G.S.villagers.values()) { day0.set(v.id, v.roleDay); back0.set(v.id, v.roleBack || null); }
  const T = watch(); const food0 = f.stock.food;
  // (the people's store at nothing for a third of a day — the test's hand, each step: the fields keep bringing)
  T.live(70, () => god(() => { f.stock.food = 0; }));
  const FOOD = { coletor: 1, agricultor: 1, pescador: 1, fruticultor: 1 };
  // each one pulled, once: the trade kept to go back to — the one left, or the one an emergency before had already kept
  // (… or the one the first emergency of these seconds took him from: the great work's gang gives its hands to the hunger too)
  const first = new Map(); for (const e of T.log()) if ((e.why === 'fome' || e.why === 'guerra' || e.why === 'obra') && !first.has(e.id)) first.set(e.id, e.from);
  const own = new Map(); for (const e of T.log()) if (e.why === 'fome' && !own.has(e.id)) own.set(e.id, { e, keep: back0.get(e.id) || first.get(e.id) || e.from });
  const P = [...own.values()].map(o => ({ o, v: G.S.villagers.get(o.e.id) })).filter(p => p.v);
  // (one sent on to a third trade by the need meanwhile keeps the trade to go back to; his days start over)
  const sentOn = new Set(T.log().filter(e => e.why === 'falta').map(e => e.id));
  const kept = P.filter(p => (p.v.role === p.o.keep ? !p.v.roleBack : p.v.roleBack === p.o.keep) && (sentOn.has(p.v.id) || p.v.roleDay === day0.get(p.v.id)));
  if (process.env.DBG) for (const p of P) if (!kept.includes(p)) console.log(`  #${p.v.id}: é ${p.v.role}, volta a ${p.v.roleBack}, guardaria ${p.o.keep}; o dia ${p.v.roleDay} (era ${day0.get(p.v.id)}) | ` + T.log().filter(e => e.id === p.v.id).map(e => `${e.from}→${e.to} ${e.why}`).join(' '));
  ok('x4 a fome puxa na hora', P.length >= 3 && [...own.values()].every(o => FOOD[o.e.to]) && kept.length === P.length, `${set.name} (${adults(v => v.set === set.id).length} adultos; o povo tinha ${Math.round(food0)} de comida para ${pop}): com o armazém a zero, em 70 s ${own.size} mãos foram aos ofícios que dão de comer (${[...new Set([...own.values()].map(o => `${o.e.from} → ${o.e.to}`))].slice(0, 6).join(', ')}); cada uma guarda o ofício a que volta e o dia em que o tinha tomado: ${kept.length} de ${P.length}`);
  // (the store full again: they go back to their own — but for the ones another emergency calls meanwhile, or the dead)
  god(() => { f.stock.food = Math.max(food0, pop * 12); });
  const home = new Map(); let seen = LOG.length, days = 0;
  const look = () => { for (; seen < LOG.length; seen++) { const e = LOG[seen]; const o = own.get(e.id); if (!o || home.has(e.id)) continue; const v = G.S.villagers.get(e.id); if (e.why === 'volta' && e.to === o.keep) home.set(e.id, { ok: !!v && !v.roleBack && v.roleDay === day0.get(e.id) }); else if (e.why !== 'volta') home.set(e.id, { other: e.why }); } };
  while (days < 2 && home.size < own.size) { T.live(0.125 * DAY, look); days += 0.125; }
  // (another emergency may call one before he is back — the great work, a war —; one sent to a third trade by the need
  // that lasted was not given back)
  const EMERG = { fome: 1, guerra: 1, obra: 1 };
  const went = [...home.values()]; const backN = went.filter(h => h.ok !== undefined).length, backOk = went.filter(h => h.ok).length, called = went.filter(h => h.other && EMERG[h.other]).length, astray = went.filter(h => h.other && !EMERG[h.other]).length;
  const waiting = [...own.keys()].filter(id => !home.has(id) && G.S.villagers.get(id) && grown(G.S.villagers.get(id)));
  ok('x4 e devolve', backN >= 3 && backN >= (backN + waiting.length + astray) * 0.7 && backOk === backN, `com o armazém cheio, em ${days} dias ${backN} das ${own.size} mãos puxadas voltaram ao ofício delas («volta»), com os dias que tinham nele (${backOk}); ${called} foram chamadas antes por outra emergência (${[...new Set(went.filter(h => h.other && EMERG[h.other]).map(h => h.other))].join(', ') || '—'}); mandadas a um terceiro ofício pela necessidade: ${astray}; ainda fora do ofício delas: ${waiting.length}${waiting.length ? ' (' + waiting.slice(0, 4).map(id => `#${id} ${own.get(id).keep} → ${G.S.villagers.get(id).role}`).join(', ') + ')' : ''}`);
  const un = T.unsaid(); const q = inv(); ok('x4 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
}

// ---------------------------------------------------------------- x5: the war pulls
if (on('x5')) {
  M.pronto('metropole'); M.viver(0.25 * DAY);
  const F = G.Fac.all().filter(f => f.alive !== false).sort((a, b) => a.id - b.id); let pair = null;
  for (const a of F) { if (G.Fac.enemiesOf(a.id).length) continue; for (const b of F) { if (b === a || G.Fac.enemiesOf(b.id).length) continue; const r = a.rel && a.rel[b.id] || b.rel && b.rel[a.id]; if (r && r.met && r.st !== 'guerra' && adults(v => G.Fac.idOfV(v) === a.id).length >= 20) { pair = [a, b]; break; } } if (pair) break; }
  if (!pair) ok('x5 a guerra puxa', false, 'nenhum par de povos em paz que já se encontraram');
  else {
    const [a, b] = pair; const w0 = adults(v => G.Fac.idOfV(v) === a.id && v.role === 'guerreiro').length; const A = adults(v => G.Fac.idOfV(v) === a.id).length;
    const T = watch(); god(() => G.Politics.declareWar(a, b, 'ambicao')); T.live(90);
    const L = T.log().filter(e => e.why === 'guerra'); const P = L.map(e => ({ e, v: G.S.villagers.get(e.id) })).filter(p => p.v && p.v.role === 'guerreiro');
    const w1 = adults(v => G.Fac.idOfV(v) === a.id && v.role === 'guerreiro').length;
    // (the war calls the brave, not the newest hands — a town's newest hands are its young)
    const side = new Set(L.map(e => e.set)); const called = new Set(L.map(e => e.id)); const mean = l => l.reduce((x, v) => x + v.courage, 0) / Math.max(1, l.length);
    const cc = mean(adults(v => called.has(v.id))), co = mean(adults(v => side.has(v.set) && !called.has(v.id) && v.role !== 'guerreiro'));
    ok('x5 a guerra chama os bravos', cc >= co + 0.05, `a coragem média de quem foi chamado: ${cc.toFixed(2)}; a de quem ficou nos ofícios, nas mesmas cidades: ${co.toFixed(2)}`);
    ok('x5 a guerra puxa na hora', L.length >= 3 && P.every(p => p.v.roleBack === p.e.from) && w1 > w0, `${a.name} declara guerra a ${b.name}: em 90 s ${L.length} mãos chamadas às armas pela guerra (os soldados de ${a.name}: ${w0} → ${w1}, de ${A} adultos); cada uma guarda o ofício de onde saiu: ${P.filter(p => p.v.roleBack === p.e.from).length} de ${P.length}`);
    const un = T.unsaid(); const q = inv(); ok('x5 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
  }
}

// ---------------------------------------------------------------- x6: the post left empty
if (on('x6')) {
  M.pronto('metropole'); M.viver(0.25 * DAY); const S = G.S;
  // one who alone has a workplace's trade in the town, at the post, the town's memory asking for the one hand — a trade whose
  // place asks its hand whatever the store has (a hive asks nobody without its keeper), in a town with hands to give: two or
  // more in the woods, the fields of berries and the quarry (a town that asks more hands than it has gives nobody, before as now: T-950)
  const STEADY = ['taverneiro', 'ator', 'foguista', 'copista', 'carcereiro', 'oleiro', 'mercador', 'feirante', 'escriba', 'cobrador'];
  const cases = [];
  for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    const A = adults(v => v.set === set.id); if (A.length < 15 || !set.ofm || G.Fac.enemiesOf(set.fac).length) continue; const by = {};
    if (A.filter(v => v.role === 'coletor' || v.role === 'lenhador' || v.role === 'mineiro').length < 2) continue;
    for (const v of A) if (v.job && STEADY.includes(v.role)) (by[v.role] = by[v.role] || []).push(v);
    for (const r of STEADY) { if (!by[r] || by[r].length !== 1 || !(set.ofm[r] >= 0.9)) continue; const v = by[r][0]; if (S.avatar && S.avatar.id === v.id) continue; const f = G.Fac.get(set.fac); if (f && f.leader === v.id) continue; cases.push({ set, r, v, b: v.job }); break; }
    if (cases.length >= 4) break;
  }
  if (cases.length < 2) ok('x6 a vaga', false, `só ${cases.length} cidade(s) com um ofício de oficina de uma mão só e mãos para dar`);
  const T = watch(); for (const c of cases) god(() => V.kill(c.v, 'sick'));
  let days = 0; const filled = c => adults(v => v.set === c.set.id && v.role === c.r && v.job === c.b)[0];
  while (days < 1 && !cases.every(filled)) { T.live(0.125 * DAY); days += 0.125; }
  for (const c of cases) { const n = filled(c); const e = n && T.log().find(x => x.id === n.id && x.to === c.r);
    ok(`x6 a vaga: ${G.ROLE[c.r][0].toLowerCase()} de ${c.set.name}`, !!n && !!e, n ? `${c.v.name}, a única mão do ofício, morreu; ${n.name} tomou o ofício e o posto em até ${days} dias (${e ? `«${e.why}»: vinha de ${e.from || 'nenhum ofício'}` : 'sem causa dita'})` : `${c.v.name} morreu e em ${days} dias ninguém tomou o ofício (a memória da cidade pede ${Math.round((c.set.ofm[c.r] || 0) * 100) / 100})`); }
  // (and it is the dealing that gives the hand: half of the posts or more taken by one who had another trade, within half a
  // day — not only by a youth who came of age meanwhile)
  const moved = cases.filter(c => { const n = filled(c); const e = n && T.log().find(x => x.id === n.id && x.to === c.r); return e && e.from && (e.why === 'falta' || e.why === 'volta') && e.t - T.t0 <= 0.5 * DAY; }).length;
  if (cases.length >= 2) ok('x6 a vaga: a mão vem de outro ofício', moved * 2 >= cases.length, `${moved} dos ${cases.length} postos foram tomados em meio dia por uma mão que tinha outro ofício (a necessidade que durou); os outros, por um moço que fez dezesseis anos`);
  const un = T.unsaid(); const q = inv(); ok('x6 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
}

// ---------------------------------------------------------------- x7: a new workshop
if (on('x7')) {
  M.pronto('metropole'); M.viver(0.25 * DAY); const S = G.S;
  const has = (set, t) => [...S.buildings.values()].some(b => b.set === set.id && b.type === t);
  // (a workshop the town has none of — a pottery, a hall of scribes, a tavern, a fair —, in a town at peace, not hungry, with
  // hands in the woods to give)
  const NEW = [['olaria', 'oleiro'], ['administracao', 'escriba'], ['taverna', 'taverneiro'], ['feira', 'feirante']]; let c = null;
  for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    const A = adults(v => v.set === set.id); const f = G.Fac.get(set.fac);
    if (A.length < 20 || !f || G.Fac.enemiesOf(f.id).length || f.stock.food < G.Fac.pop(f.id) * 4 || A.filter(v => v.role === 'coletor' || v.role === 'lenhador' || v.role === 'mineiro').length < 3) continue;
    for (const [t, r] of NEW) {
      if (has(set, t)) continue; const pos = god(() => V.findSite(set, t)); if (!pos) continue;
      const b = god(() => { const x = V.addBuilding(t, pos[0], pos[1], set.id, true); G.W.touchWalk(); return x; }); if (b) { c = { set, b, t, r }; break; }
    }
    if (c) break;
  }
  if (!c) ok('x7 a oficina nova', false, 'nenhuma cidade de vinte adultos em paz, sem fome, com mãos no mato, sem uma das oficinas e com chão para ela');
  else {
    const T = watch(); let days = 0; const at = () => adults(v => v.set === c.set.id && v.role === c.r && v.job === c.b.id);
    while (days < 1.25 && !at().length) { T.live(0.125 * DAY); days += 0.125; }
    const w = at(); const e = w.length && T.log().find(x => x.id === w[0].id && x.to === c.r);
    ok('x7 a oficina nova ganha gente', w.length > 0 && !!e, `${c.set.name} ganhou ${V.buildName ? V.buildName(c.b) : c.t} (pela mão da prova): em ${days} dias ${w.length ? `${w.map(v => v.name).join(' e ')} ${w.length > 1 ? 'trabalham' : 'trabalha'} nela como ${G.ROLE[c.r][w[0].g === 'f' ? 1 : 0].toLowerCase()} (${e ? `«${e.why}», de ${e.from || 'nenhum ofício'}` : 'sem causa dita'})` : 'ninguém foi trabalhar nela'}`);
    const un = T.unsaid(); const q = inv(); ok('x7 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
  }
}

// ---------------------------------------------------------------- x8: the young take a trade, the old leave it
if (on('x8')) {
  M.pronto('cidade'); M.viver(0.25 * DAY); const S = G.S; const set = biggest();
  const kid = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 13 && v.age < 15.9 && !v.captive && !v.held).sort((a, b) => a.id - b.id)[0];
  const old = adults(v => v.set === set.id && v.age >= 50 && v.role && !KID[v.role] && !(S.avatar && S.avatar.id === v.id) && G.Fac.get(set.fac).leader !== v.id)[0];
  if (!kid || !old) ok('x8 o moço e o velho', false, `faltou gente em ${set.name}: uma criança de 13 a 15 anos (${kid ? 'há' : 'não há'}), um adulto de 50 ou mais (${old ? 'há' : 'não há'})`);
  else {
    const T = watch(); const r0 = old.role;
    god(() => { kid.age = 15.999; kid.born = S.day - 15.999; old.age = 61.999; old.born = S.day - 61.999; old.roleBack = r0 === 'lenhador' ? 'coletor' : 'lenhador'; });
    T.live(12); const e = T.log().find(x => x.id === kid.id);
    ok('x8 o moço ganha ofício', !!kid.role && !KID[kid.role] && !!e && e.why === 'novo' && kid.roleDay === e.day - TMIN && !kid.roleBack, `${kid.name}, de ${set.name}, fez dezesseis anos: ${kid.role && !KID[kid.role] ? `é ${G.ROLE[kid.role][kid.g === 'f' ? 1 : 0].toLowerCase()}` : `ficou «${kid.role}»`} (${e ? `«${e.why}»` : 'sem causa dita'}; os dias do primeiro ofício começam ${TMIN} atrás: dia ${kid.roleDay}, hoje ${G.S.day})`);
    ok('x8 o velho larga o ofício', old.role === 'anciao' && !old.roleBack, `${old.name}, ${G.ROLE[r0][old.g === 'f' ? 1 : 0].toLowerCase()}, fez sessenta e dois: é «${old.role}»${old.roleBack ? `, e ainda voltaria a ${old.roleBack}` : ', e não volta a ofício nenhum'}`);
    const un = T.unsaid(); const q = inv(); ok('x8 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
  }
}

// ---------------------------------------------------------------- x9: the god's body, the prisoner, who is at sea
if (on('x9')) {
  M.pronto('metropole'); M.viver(0.25 * DAY); const S = G.S;
  const builtIn = (set, t) => [...S.buildings.values()].find(b => b.set === set.id && b.type === t && b.built);
  const anyIn = (set, t) => [...S.buildings.values()].some(b => b.set === set.id && b.type === t);
  // (a trade the town does not ask: a workplace's with no such workplace in the town — a goldsmith with no goldsmith's —; a
  // sailor of a town with no quay)
  const ghost = set => ['ourives', 'ferreiro', 'tecelao', 'acougueiro', 'escriba', 'copista', 'foguista', 'cobrador', 'cavalarico'].find(r => !(G.Eco.JOB_OF[r] || []).some(t => anyIn(set, t)) && !((set.ofm && set.ofm[r]) > 0.05)) || null;
  const FIELD = { lenhador: 1, coletor: 1, agricultor: 1, mineiro: 1, cacador: 1, construtor: 1 };
  const pool = set => { const f = G.Fac.get(set.fac); return adults(v => v.set === set.id && FIELD[v.role] && v.age >= 20 && v.age < 50 && !v.aboard && !v.ug && !v.jail && !v.held && !v.roleBack && !(f && f.leader === v.id) && G.Possess.can(v).ok); };
  const peace = s => !G.Fac.enemiesOf(s.fac).length;
  const setA = biggest(s => peace(s) && !!builtIn(s, 'cadeia') && !!ghost(s) && pool(s).length >= 4);
  const setB = biggest(s => peace(s) && !anyIn(s, 'doca') && pool(s).length >= (setA && s.id === setA.id ? 6 : 2));
  if (!setA || !setB) ok('x9 o corpo, o preso, quem está no mar', false, `faltou cidade em paz: com cadeia, um ofício sem oficina e quatro mãos do campo (${setA ? setA.name : 'nenhuma'}); sem cais e com duas (${setB ? setB.name : 'nenhuma'})`);
  else {
    const r1 = ghost(setA); const pa = pool(setA); const [body, pris, c1, c2] = pa; const [sailor, c3] = pool(setB).filter(v => !pa.slice(0, 4).includes(v));
    const jail = builtIn(setA, 'cadeia');
    const away0 = G.Naval.away; G.Naval.away = v => v.id === sailor.id || away0(v); // (the test's hand: this one is at sea)
    const took = G.Possess.take(body);
    god(() => {
      for (const v of [body, pris, c1, c2]) { v.role = r1; v.job = 0; v.roleDay = S.day - 5; v.roleBack = null; }
      for (const v of [sailor, c3]) { v.role = 'marinheiro'; v.job = 0; v.roleDay = S.day - 5; v.roleBack = null; }
      pris.jail = jail.id; pris.jailUntil = S.day + 5; G.Vg.setTask(pris, { type: 'wander', pri: 1 });
    });
    const T = watch(); const odd = v => v.role === r1 || v.role === 'marinheiro'; const nm = r => G.ROLE[r][0].toLowerCase();
    let days = 0; while (days < 1 && [c1, c2, c3].some(odd)) { T.live(0.125 * DAY); days += 0.125; }
    const ctl = [c1, c2, c3].filter(v => !odd(v)).length; const kept = [body, pris, sailor].filter(odd);
    ok('x9 o repartidor tira a mão ao lado', took.ok && ctl === 3, `seis mãos num ofício que a cidade não pede (${nm(r1)} em ${setA.name}, sem a oficina; marinheiro em ${setB.name}, sem cais): em ${days} dias ${ctl} das 3 que podiam trocar trocaram (${[c1, c2, c3].map(v => v.role).join(', ')})`);
    ok('x9 o corpo do deus, o preso e quem está no mar ficam', took.ok && kept.length === 3 && !!pris.jail, `o corpo do deus (${body.name}: ${body.role}), ${pris.jail ? 'o preso' : 'o preso (JÁ SOLTO)'} (${pris.name}: ${pris.role}) e quem está no mar (${sailor.name}: ${sailor.role}) ${kept.length === 3 ? 'ficaram com o ofício' : 'TIVERAM o ofício trocado'}`);
    // (set free, they are dealt like anyone)
    G.Possess.release('deus'); G.Naval.away = away0; god(() => { pris.jail = 0; pris.jailUntil = 0; G.Vg.endTask(pris); });
    let d2 = 0; while (d2 < 1 && [body, pris, sailor].some(odd)) { T.live(0.125 * DAY); d2 += 0.125; }
    ok('x9 e soltos, trocam', ![body, pris, sailor].some(odd), `soltos, em ${d2} dias: ${[body, pris, sailor].map(v => `${v.name} ${v.role}`).join(', ')}`);
    const un = T.unsaid(); const q = inv(); ok('x9 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
  }
}

// ---------------------------------------------------------------- x10: the save in the middle
if (on('x10')) {
  M.pronto('metropole'); M.viver(0.3 * DAY);
  const canon = () => JSON.stringify([[...G.S.villagers.values()].sort((a, b) => a.id - b.id).map(v => [v.id, v.role || '', v.roleDay === undefined || v.roleDay === null ? '' : v.roleDay, v.roleBack || '', v.job || 0]), [...G.S.settlements.values()].sort((a, b) => a.id - b.id).map(s => [s.id, s.ofm ? Object.keys(s.ofm).sort().map(r => r + ':' + s.ofm[r]).join(' ') : ''])]);
  const mem = () => [...G.S.settlements.values()].filter(s => s.ofm).length;
  // (two hands in a trade their town does not ask — the test's hand, right before the save: the next dealing would move them
  // at once, and the load must not be that dealing)
  { const anyIn = (set, t) => [...G.S.buildings.values()].some(b => b.set === set.id && b.type === t); const set = biggest(s => !anyIn(s, 'ourives') && !G.Fac.enemiesOf(s.fac).length);
    const two = set ? adults(v => v.set === set.id && (v.role === 'coletor' || v.role === 'lenhador' || v.role === 'agricultor') && !v.roleBack && !v.jail && !v.aboard).slice(0, 2) : [];
    god(() => { for (const v of two) { v.role = 'ourives'; v.job = 0; v.roleDay = G.S.day - 5; } }); ok('x10 duas mãos por trocar na hora do save', two.length === 2, set ? `${two.map(v => v.name).join(' e ')}, de ${set.name}, ourives sem ourivesaria` : 'nenhuma cidade em paz sem ourivesaria'); }
  const c0 = canon(); const save = G.Save.serialize(); const l0 = LOG.length;
  G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; const c1 = canon(); const atLoad = LOG.length - l0;
  ok('x10 o load não decide nada', c0 === c1 && atLoad === 0 && mem() > 0, `depois do load os ofícios, os dias, os ofícios a que se volta, os postos e a memória de ${mem()} cidades são os de antes (${c0 === c1 ? 'iguais' : 'DIFERENTES'}); trocas feitas pelo load: ${atLoad}`);
  const fut = () => { const a = LOG.length; M.viver(0.5 * DAY); return canon() + JSON.stringify(LOG.slice(a).map(e => [e.id, e.from, e.to, e.why, e.day])); };
  const fa = fut(); const na = LOG.length; G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; const fb = fut();
  ok('x10 o mesmo save, o mesmo futuro', fa === fb, `o mesmo save carregado duas vezes e vivido meio dia: ${fa === fb ? 'os mesmos ofícios, as mesmas trocas pelas mesmas causas' : 'futuros DIFERENTES'} (${LOG.length - na} trocas no meio dia)`);
  // (a save of before: none of the new fields)
  const o = JSON.parse(save); for (const v of o.villagers) { delete v.roleDay; delete v.roleBack; } for (const s of o.settlements) delete s.ofm;
  G.Save.apply(o); G.Main.mode = 'game'; const lb = LOG.length; const T = watch(); T.live(0.75 * DAY); const L = LOG.slice(lb); const un = T.unsaid();
  const R = rate(L, 0.75); const q = inv();
  ok('x10 um save de antes', mem() > 0 && !un.length && !q.length && M.limpo() && R.r <= TETO * 3, `sem os campos novos: carrega, a memória das cidades começa do instante (${mem()} cidades) e o mundo vive três quartos de dia — ${L.length} trocas (${whys(L)}), ${R.r.toFixed(3)} pela necessidade por adulto por dia no primeiro dia (a memória nasce do instante); ` + (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + clean());
}

// ---------------------------------------------------------------- x11: the jump and the step
if (on('x11')) {
  M.pronto('metropole'); M.viver(0.25 * DAY); const S0 = G.S;
  // a town with a temple: it asks one priest, or two, whatever the hour — its memory of the priests, wiped by the test's hand,
  // comes back to that at the memory's own pace
  const temple = s => [...G.S.buildings.values()].some(b => b.set === s.id && b.type === 'temple' && b.built);
  const set0 = biggest(s => temple(s) && s.ofm && s.ofm.sacerdote >= 0.99); void S0;
  if (!set0) ok('x11 o salto e o passo', false, 'nenhuma cidade com templo e a memória de um sacerdote');
  else {
    const id = set0.id; const want = Math.round(set0.ofm.sacerdote); const save = G.Save.serialize(); const SEG = 100;
    const run = jump => {
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; const set = G.S.settlements.get(id); god(() => { set.ofm.sacerdote = 0; });
      if (jump) { G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3; try { for (let k = 0; k < SEG; k++) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; } } else M.viver(SEG);
      return G.S.settlements.get(id).ofm.sacerdote / want;
    };
    const a = run(false), b = run(true); const exp = 1 - Math.exp(-SEG / (V.TRADE_TAU * DAY));
    ok('x11 o salto e o passo', Math.abs(a - b) <= 0.06 && Math.abs(a - exp) <= 0.08 && Math.abs(b - exp) <= 0.08, `${set0.name} pede ${want} sacerdote(s); a memória, zerada pela mão da prova, ${SEG} s de mundo depois lembra ${(a * 100).toFixed(1)} % disso no passo e ${(b * 100).toFixed(1)} % no salto (a conta: ${(exp * 100).toFixed(1)} %)`);
    ok('x11 os erros', M.limpo(), 'nenhum erro' + clean());
  }
}

// ---------------------------------------------------------------- x12: the granary by degrees
if (on('x12')) {
  M.pronto('metropole'); M.viver(0.25 * DAY); const S = G.S;
  const farms = s => [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'farm' && b.built).length;
  const set = biggest(s => !G.Fac.enemiesOf(s.fac).length && farms(s) >= 4);
  if (!set || !V.tradeAsked) ok('x12 o celeiro por graus', false, 'nenhuma cidade em paz com quatro fazendas');
  else {
    const f = G.Fac.get(set.fac); const mark = Math.max(50, G.Fac.pop(f.id) * (S.blessed ? 5 : 7)); const n = farms(set);
    // (the store held at a level for two dealings — the test's hand —, and what the instant asks of the farmers read)
    const at = x => { for (let k = 0; k < 90; k++) { god(() => { f.stock.food = mark * x; }); G.debug.step(0.1); } return (V.tradeAsked(set.id) || {}).agricultor; };
    const full = at(1.3), mid = at(0.85), low = at(0.6);
    ok('x12 o celeiro por graus', full < mid && mid < low && low - full >= 2, `${set.name} (${n} fazendas; a marca do celeiro: ${Math.round(mark)}): com o celeiro a 130 % da marca o instante pede ${full} agricultores, a 85 % pede ${mid}, a 60 % pede ${low} (antes: ${full} acima da marca e ${low} logo abaixo dela — um interruptor)`);
    ok('x12 os erros', M.limpo(), 'nenhum erro' + clean());
  }
}

// ---------------------------------------------------------------- x13: the great work with its turn pulls
if (on('x13')) {
  M.pronto('metropole'); M.viver(0.25 * DAY); const S = G.S;
  // a work that waits for stone in a town at peace with no great work keeping its stone yet: the test's hand gives it the
  // turn (set.vez, set.gw — the planner's own marks, held each step: the planner writes them again each time it plans)
  let c = null;
  for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    const A = adults(v => v.set === set.id).length; if (A < 30 || G.Fac.enemiesOf(set.fac).length || V.keeps(set) > 0) continue;
    const b = [...S.buildings.values()].sort((x, y) => x.id - y.id).find(x => x.set === set.id && !x.built && x.type !== 'ruin' && x.need && (x.need.stone || 0) > ((x.incoming && x.incoming.stone) || 0) + 2);
    if (b) { c = { set, b, A }; break; }
  }
  if (!c) ok('x13 a obra grande puxa', false, 'nenhuma cidade em paz de trinta adultos com uma obra à espera de pedra e sem obra grande com a vez');
  else {
    // (the town as it was before the turn came: one builder, the others foragers — the test's hand, the memory with them)
    const gang = Math.ceil(c.A * V.GANG); const bs = adults(v => v.set === c.set.id && v.role === 'construtor' && !(S.avatar && S.avatar.id === v.id)).slice(1);
    god(() => { for (const v of bs) { v.role = 'coletor'; v.job = 0; v.roleDay = S.day - 5; v.roleBack = null; } c.set.ofm.construtor = 1; c.set.ofm.coletor = (c.set.ofm.coletor || 0) + bs.length; });
    const n0 = adults(v => v.set === c.set.id && v.role === 'construtor').length;
    const T = watch(); T.live(45, () => god(() => { c.set.vez = 1; c.set.gw = c.b.id; }));
    const keeps = V.keeps(c.set); const n1 = adults(v => v.set === c.set.id && v.role === 'construtor').length; const L = T.log().filter(e => e.why === 'obra' && e.set === c.set.id);
    const kept = L.filter(e => { const v = G.S.villagers.get(e.id); return v && (v.role !== 'construtor' || v.roleBack === e.from); }).length;
    ok('x13 a obra grande com a vez puxa na hora', keeps > 0 && n1 >= gang - 1 && L.length >= Math.min(3, gang - 2) && kept === L.length, `${c.set.name} (${c.A} adultos): ${V.buildName ? V.buildName(c.b) : c.b.type} ganha a vez e guarda ${Math.round(keeps)} de pedra; a turma é de ${gang} construtores: ${n0} → ${n1} em 45 s, ${L.length} chamados pela obra (cada um guarda o ofício de onde saiu: ${kept})`);
    const un = T.unsaid(); const q = inv(); ok('x13 o verificador e os erros', !q.length && !un.length && M.limpo(), (q.length ? q.slice(0, 3).join(' · ') : 'o verificador limpo') + `; trocas sem causa dita: ${un.length}` + clean());
  }
}

console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
