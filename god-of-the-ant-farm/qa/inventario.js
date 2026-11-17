// inventario: o que a pessoa leva e segura (a base do corpo, 20c; D-336, D-370 a D-376).   [ONLY=i1,i5] node qa/inventario.js [mundo]
// Em Node, com o possess.js e o interact.js (o corpo e as mãos dele), no mundo pronto «cidade» (ou o dado). As portas do mundo
// são pedidas como o corpo as pede — pelas mãos dele (G.Possess.apply), feitas no passo do mundo —; «a mão da prova» (god) só
// põe a cena: uma pessoa num lugar, ferramentas no armazém, uma arte que o povo aprende.
// O catálogo e o kit:
//  i1 o catálogo: a grafia canônica (machado → machado.pedra, vara.madeira → vara), toda chave com a sua descrição, o melhor
//     material pelas artes, o que cada coisa vale no armazém, a tabela congelada (escrever nela quebra na hora);
//  i2 o kit é puro e fiel ao mundo: o guerreiro de cada povo (a lança e o escudo do grego, o machado do nórdico, a clava do
//     asteca), cada companhia (o espadachim com a espada, o arqueiro com o arco na mão do arco e a faca no cinto, a milícia
//     com a clava e sem elmo), o material das artes do povo, o ato (o machado de quem corta; a luta mantém a arma que se tem), a
//     carga nos braços (a lança vai para as costas); mil perguntas não mudam o mundo nem o acaso;
//  i3 as coisas de verdade (D-374): o corpo tomado pela primeira vez ganha as coisas do ofício (código «kit», uma vez só): o
//     machado do lenhador nas costas e no atalho; tomado de novo, nada; a pessoa que recebe uma coisa segura a dela e o kit nos
//     outros lugares;
// A mochila e o armazém:
//  i4 pegar uma ferramenta no armazém (ferramentas → um machado do melhor material do povo, no livro: o bem sai, a coisa entra,
//     «coisa»); longe do armazém, no armazém de outro povo, sem o bem, sem a arte: recusado com a razão; e a volta (o machado
//     devolvido conta de novo como ferramenta);
//  i5 equipar, guardar e sacar: o machado na mão, guardado no cinto e sacado; a picareta de duas mãos leva o escudo para as
//     costas; o escudo na outra mão; a coisa que não cabe no lugar; o que não está na mochila;
//  i6 a carga nas mãos com a espada na mão: uma carga pelo depósito esvazia as mãos na hora (a espada no cinto, o escudo nas
//     costas); uma carga posta pelo mundo à mão (sem o depósito) aparece no que se segura na hora e no equipamento dentro de um
//     segundo; com a carga, nada entra na mão;
//  i7 largar e pegar do chão: a coisa no chão (sem a marca do povo: os carregadores não a levam), pegada de volta; longe demais,
//     e uma caixa de serviço não se pega;
//  i8 a capacidade (D-373): o adulto leva 25 kg, a criança 7,5; a mochila cheia recusa; o depósito e o inventário dizem o mesmo
//     lugar; os anos tiram o limite e nada se perde (o verificador limpo);
//  i9 dar e tirar: dar a outra pessoa (que precisa ter lugar), tirar da mochila alheia (recusado), guardar em casa e pegar de
//     volta, a casa de outra família (recusado);
//  i10 a coisa no estoque conta como o seu bem (D-371): a casa esvaziada no armazém pela porta do mundo leva o machado como
//     ferramenta; nenhuma coisa no estoque;
//  i11 os atalhos: o atalho põe na mão e guarda; o elmo vai à cabeça e sai; o atalho vazio diz como encher;
// O save e a morte:
//  i12 salvar e carregar no meio: a mochila, os lugares, os atalhos, a marca do kit e a coisa no chão voltam iguais; o corpo
//     volta; as portas seguem;
//  i13 a morte com coisas (D-375): quem morre na sua cidade deixa as coisas em casa (no chão da casa, «herdado»); quem cai longe
//     deixa-as no chão onde caiu, com a marca do povo — e a mão de quem passa as leva ao armazém como o bem delas —; quem morre
//     na água deixa-as em casa; o corpo do deus morre com coisas;
//  i14 um save danificado (D-376): números podres, chaves desconhecidas e fora da grafia, a mochila que é uma lista, mais coisas
//     do que se aguenta, um lugar que nomeia o que não há, duas mãos ocupadas pela coisa de duas mãos, nove atalhos, a marca do
//     kit de texto: abre sem erro, consertado, o verificador limpo;
//  i15 um save antigo (qa/oldsave_7.json, sem mochila nem equipamento): abre, ninguém leva nada, o que se segura é o kit, e o
//     corpo ganha as coisas do ofício;
// O mundo:
//  i16 as telas não escrevem: o mesmo mundo com e sem «quadros» (as portas de leitura entre os passos e as portas do mundo pedidas
//     de fora do passo, recusadas) é idêntico; e o pedido de fora fica contado para o verificador;
//  x1 os casos ruins: o pedido de um corpo devolvido e o de um corpo morto não acontecem; a casa com coisas que cai; o deus
//     segura o corpo na mão; e nenhum erro de módulo nem do console.
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'js/interact.js', 'qa/inventario-inv.js'] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = (...ks) => !ONLY || ks.some(k => ONLY.includes(k));
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | inventario ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const Inv = G.Inv, It = G.Itens, Po = G.Possess, D = G.Depot, V = G.Village, W = G.W;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = null, base = new Set();
const qk = q => q.sys + '|' + q.msg.replace(/#\d+/g, '#');
const open = w => { S = typeof w === 'string' ? M.pronto(w) : w(); M.viver(1); base = new Set(QA.check().filter(q => q.sev <= 2).map(qk)); return S; };
// (the verifier: nothing new of S0–S2, and nothing at all of the inventory's rules)
const novas = () => QA.check().filter(q => (q.sev <= 2 && !base.has(qk(q))) || q.sys === 'inventario').map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const fpOf = () => { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + JSON.stringify(S.rng); };
const invCanon = () => JSON.stringify((QA.canonMore.find(c => c[0] === 'inventario') || [0, () => null])[1]());
const byId = (a, b) => a.id - b.id;
const people = f => [...S.villagers.values()].filter(f).sort(byId);
const grown = v => v.age >= 18 && v.age < 55 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air;
const errs = () => { const e = M.erros(); return Object.keys(e.mod).length || e.console.length ? `erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 3).join(' | ')}` : ''; };
// the body taken (by the game's door) and the hands' asking — the world does it in its step
const take = v => { const r = Po.take(v); M.viver(0.1); return !!(r && r.ok !== false && Po.is(v)); };
const ask = f => { const it = Po.apply(f); M.viver(0.1); return it.res || { ok: false, why: 'sem resposta' }; };
const put = (v, x, y) => { god(() => { v.x = x; v.y = y; v.inside = 0; v.sleeping = false; v.hunger = 5; v.energy = 100; }); M.viver(0.1); };
const keyIn = (v, kind) => Object.keys(v.mochila || {}).find(k => It.parse(k)[0] === kind) || null;
const lines = (n0, f) => D.ledger().filter(e => e[0] > n0 && (!f || f(e)));
const lastN = () => { const L = D.ledger(); return L.length ? L[L.length - 1][0] : 0; };
// a store of a town, and someone of that town the god can take, standing at its door
const storeOf = set => V.dropoffs(set.id).sort(byId)[0] || null;
function atStore(pref) {
  for (const set of [...S.settlements.values()].sort(byId)) {
    const b = storeOf(set); if (!b) continue;
    const vs = people(o => o.set === set.id && grown(o) && o.home && Po.can(o).ok && (!pref || pref(o)));
    if (vs.length) return { set, b, v: vs[0], fid: V.facOfSet(set.id) };
  }
  return null;
}
// (a tile of open ground beside a building: where a body stands at its walls — the building's own front tile is under its roof)
const door = b => { for (let d = 1; d <= 3; d++) for (let y = b.y - d; y < b.y + b.h + d; y++) for (let x = b.x - d; x < b.x + b.w + d; x++) { if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) continue; if (W.inb(x + 0.5, y + 0.5) && W.walkableXY(x + 0.5, y + 0.5) && !S.occ[W.idx(x + 0.5, y + 0.5)]) return [x + 0.5, y + 0.5]; } return V.frontTile(b); };
// (a tile of open ground near someone: out of doors, walkable, no building on it)
const outdoors = v => { for (let d = 0; d < 12; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, -d]]) { const x = Math.floor(v.x) + dx + 0.5, y = Math.floor(v.y) + dy + 0.5; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)]) return [x, y]; } return null; };
// (someone whose trade carries nothing: the parts that place things by hand start from an empty body)
const plain = o => !Object.values(Inv.trade(o)).some(x => typeof x === 'string');
const stock = (fid, k) => (G.Fac.get(fid).stock[k] || 0);
// (a good given to a people's store by the proof's hand: with its part — the metal of the store's tools and weapons, 20h, D-442)
const give = (fid, k, n, of) => god(() => D.make('f:' + fid, k, n, { code: 'teste', part: true, of }));
const teach = (fid, t) => god(() => { const f = G.Fac.get(fid); if (f && !f.tech.known[t]) G.Civ.learn(f, t, 'divina'); });

// ================================================================ the catalog
if (on('i1')) {
  const bad = [];
  if (It.canon('machado') !== 'machado.pedra' || It.canon('machado.ferro') !== 'machado.ferro' || It.canon('vara.madeira') !== 'vara' || It.canon('vara') !== 'vara' || It.canon('machado.ouro') !== null || It.canon('wood') !== 'wood' || It.canon('nada') !== null) bad.push('a grafia canônica');
  for (const kind in It.KINDS) for (const m of It.KINDS[kind].mats) { const k = It.keyOf(kind, m); const d = It.def(k); if (!d || d.id !== k || d.mat !== m || !(d.peso > 0) || !It.THINGS.has(k) || It.canon(k) !== k) bad.push('def ' + k); }
  if (It.def('machado').id !== 'machado.pedra') bad.push('def de machado sem material');
  const arts = { bronze: 1 }, iron = { bronze: 1, ferro: 1 };
  if (It.best('machado', null) !== 'machado.pedra' || It.best('machado', arts) !== 'machado.bronze' || It.best('machado', iron) !== 'machado.ferro' || It.best('espada', null) !== null || It.best('espada', arts) !== 'espada.bronze' || It.best('arco', null) !== null || It.best('arco', { arco: 1 }) !== 'arco') bad.push('o melhor material pelas artes');
  const b1 = It.bemOf('machado.ferro'), b2 = It.bemOf('flecha.bronze'), b3 = It.bemOf('cajado'), b4 = It.bemOf('food');
  if (!b1 || b1.k !== 'ferramentas' || b1.n !== 1 || !b2 || b2.k !== 'armas' || b2.n !== 0.05 || !b3 || b3.k !== 'wood' || !b4 || b4.k !== 'food') bad.push('o que vale no armazém');
  if (!It.fromBem('ferramentas').includes('machado') || !It.fromBem('armas').includes('escudo') || !It.fromBem('wood').includes('tocha')) bad.push('o bem que vira coisa');
  if (It.nome('machado.ferro') !== 'machado de ferro' || It.nome('flecha.pedra', 20) !== 'flechas de pedra' || It.nome('vara') !== 'vara de pescar') bad.push('os nomes');
  if (It.guarda('lanca.bronze') !== 'costas' || It.guarda('espada.ferro') !== 'cinto' || It.mao('escudo.madeira') !== 'outra' || It.mao('tocha') !== 'outra' || It.veste('elmo.bronze') !== 'cabeca') bad.push('onde vai');
  // (frozen: in the game's files — all of them 'use strict' — a write throws at once; here, the table says it is frozen and keeps its values)
  const frozen = [It.KINDS, It.KINDS.machado, It.KINDS.machado.tags, It.MATS, It.MATS.ferro, It.def('machado.ferro')].every(o => Object.isFrozen(o));
  let threw = false; try { (function () { 'use strict'; It.KINDS.machado.peso = 9; })(); } catch (e) { threw = true; }
  if (!frozen || !threw || It.KINDS.machado.peso !== 1.8) bad.push('a tabela não está congelada');
  ok('i1 o catálogo: a grafia, a descrição, o melhor material, o valor, a tabela congelada', !bad.length, bad.length ? 'FALHOU: ' + bad.join(', ') : `${It.THINGS.size} coisas; machado → ${It.canon('machado')}; ferramentas → ${It.fromBem('ferramentas').join(', ')}; um machado de ferro vale ${It.valor('machado.ferro')} moedas`);
}

// ================================================================ the kit
if (on('i2')) {
  open(WORLD);
  const sets = [...S.settlements.values()].sort(byId); const bad = []; const said = [];
  // (people of each people, made into a warrior, a levy of each company, an archer — copies: the kit reads them, never writes)
  const civs = new Map(); for (const set of sets) { const o = people(x => x.set === set.id && grown(x))[0]; if (o && !civs.has(G.Fac.civOfV(o))) civs.set(G.Fac.civOfV(o), o); }
  const WANT = { grego: ['lanca', 'escudo'], romano: ['lanca', 'escudo'], nordico: ['machado', 'escudo'], egipcio: ['lanca', 'escudo'], asteca: ['clava', 'escudo'] };
  const kindOf = k => (k ? It.parse(k)[0] : null);
  const fp0 = fpOf();
  for (const [civ, o] of civs) {
    const w = Object.assign({}, o, { role: 'guerreiro', unit: null, arm: null, act: '', carry: null, elite: null, gear: null });
    const k = Inv.kit(w); const want = WANT[civ] || ['lanca', 'escudo']; const arts = Inv.artsOf(o);
    // (the material is what the people has had — the art only permits: 20h, D-442 —; the helmet in bronze, iron or leather had, else none)
    if (kindOf(k.mao) !== want[0] || kindOf(k.outra) !== want[1] || (k.cabeca || null) !== Inv.made('elmo', o)) bad.push(`o guerreiro ${civ}: ${JSON.stringify(k)}`);
    if (k.mao && k.mao !== Inv.made(want[0], o)) bad.push(`o material do ${civ}: ${k.mao} (o povo faria ${Inv.made(want[0], o)})`);
    for (const s of Inv.SLOTS) { const x = k[s]; if (x && !G.Origem.matOK(G.Fac.idOfV(o), It.def(x).mat, arts)) bad.push(`o kit do ${civ} com ${x}, de um material que o povo não teve`); }
    said.push(`${civ}: ${k.mao} + ${k.outra} + ${k.cabeca}`);
    const sw = Inv.kit(Object.assign({}, w, { unit: 'espadachim' })); if (Inv.made('espada', o) ? kindOf(sw.mao) !== 'espada' : kindOf(sw.mao) !== 'lanca') bad.push(`o espadachim ${civ}: ${sw.mao}`);
    const ar = Inv.kit(Object.assign({}, w, { unit: 'arqueiro', arm: 'arco' })); if (kindOf(ar.outra) !== 'arco' || ar.mao || kindOf(ar.cinto) !== 'faca') bad.push(`o arqueiro ${civ}: ${JSON.stringify(ar)}`);
    const mi = Inv.kit(Object.assign({}, w, { role: 'lenhador', unit: 'milicia' })); if (kindOf(mi.mao) !== 'clava' || mi.outra || mi.cabeca) bad.push(`a milícia ${civ}: ${JSON.stringify(mi)}`);
    const be = Inv.kit(Object.assign({}, w, { unit: 'elite', elite: 'berserker' })); if (civ === 'nordico' && (kindOf(be.mao) !== 'machado' || be.outra)) bad.push(`o berserker: ${JSON.stringify(be)}`);
    const ch = Inv.kit(Object.assign({}, w, { role: 'lenhador', act: 'chop' })); if (kindOf(ch.mao) !== 'machado') bad.push(`quem corta: ${ch.mao}`);
    const fi = Inv.kit(Object.assign({}, w, { act: 'fight' })); if (fi.mao !== k.mao) bad.push(`quem luta troca a arma: ${fi.mao} por ${k.mao}`);
    const ca = Inv.kit(Object.assign({}, w, { carry: { k: 'wood', n: 2 } })); if (ca.mao || ca.outra || (kindOf(ca.costas) !== want[0] && kindOf(ca.costas) !== want[1] && kindOf(ca.cinto) !== want[0])) bad.push(`com a carga: ${JSON.stringify(ca)}`);
  }
  // (the trades: the lumberjack's axe on the back, the elder's staff in the hand, a child nothing)
  const lj = people(x => grown(x))[0]; const t1 = Inv.kit(Object.assign({}, lj, { role: 'lenhador', act: '', carry: null, unit: null, arm: null, gear: null })); if (kindOf(t1.costas) !== 'machado' || t1.mao) bad.push(`o lenhador: ${JSON.stringify(t1)}`);
  const el = Inv.kit(Object.assign({}, lj, { role: 'anciao', age: 66, act: '', carry: null, unit: null, arm: null, gear: null })); if (el.mao !== 'cajado') bad.push(`o ancião: ${JSON.stringify(el)}`);
  const kid = people(x => x.age >= 3 && x.age < 12)[0]; if (kid && Object.values(Inv.kit(kid)).some(x => typeof x === 'string')) bad.push('uma criança com coisas');
  // (pure: a thousand questions change nothing of the world, nor its chance; the same answer for the same person)
  const all = people(() => true); let same = true; for (let r = 0; r < 3; r++) for (const o of all) { const a = JSON.stringify(Inv.kit(o)), b = JSON.stringify(Inv.held(o)); if (a !== b && !Inv.real(o)) same = false; }
  const fp1 = fpOf();
  ok('i2 o kit: fiel ao mundo, de cada povo e companhia, do ofício e do ato, e puro', !bad.length && same && fp0 === fp1, `${said.join('; ')}${bad.length ? ' — FALHOU: ' + bad.slice(0, 5).join(' | ') : ''}${same ? '' : ' — o kit muda de uma pergunta para outra'}${fp0 === fp1 ? '' : ' — O MUNDO MUDOU com as perguntas'}`);
}

// ================================================================ the kit made real
if (on('i3')) {
  open(WORLD);
  const v = people(o => grown(o) && o.role === 'lenhador' && Po.can(o).ok)[0];
  const n0 = lastN();
  const tk = v && take(v); const bag1 = v ? JSON.stringify(v.mochila) : '', eq1 = v ? Inv.equipOf(v) : null;
  const kit1 = lines(n0, e => e[8] === 'kit' && e[4] === 'm:' + (v && v.id));
  const held1 = v ? Inv.held(v) : null;
  // (given back and taken again: nothing new; the axe dropped, the trade changed, taken again: still nothing — once in a life)
  if (v) { Po.release('deus'); M.viver(0.2); take(v); }
  const kit2 = lines(n0, e => e[8] === 'kit' && e[4] === 'm:' + (v && v.id));
  const ax = v ? keyIn(v, 'machado') : null;
  if (v) { const p = outdoors(v); if (p) put(v, p[0], p[1]); }
  const dr = v && ax ? ask(w => Inv.drop(w, ax)) : null;
  if (v) { god(() => { v.role = 'guerreiro'; }); Po.release('deus'); M.viver(0.2); take(v); }
  const kit3 = lines(n0, e => e[8] === 'kit' && e[4] === 'm:' + (v && v.id));
  // (someone given a thing: theirs in their hands when held, the kit in the other places)
  const o = people(x => grown(x) && x.id !== (v && v.id) && (x.role === 'cacador' || x.role === 'construtor'))[0] || people(x => grown(x) && x.id !== (v && v.id))[0];
  const ok1 = !!v && tk && kit1.length === 1 && eq1.costas === It.keyOf('machado', It.bestMat('machado', Inv.artsOf(v))) && eq1.atalhos[0] === eq1.costas && eq1.kit > 0 && held1.real && held1.costas === eq1.costas;
  let ok2 = false, ho = null;
  if (o) { god(() => { D.make('m:' + o.id, 'faca.pedra', 1, { code: 'teste' }); Inv.equip(o, 'faca.pedra', 'cinto'); }); ho = Inv.held(o); const kt = Inv.kit(o); ok2 = ho.real && ho.cinto === 'faca.pedra' && (kt.mao ? ho.mao === kt.mao : true); }
  ok('i3 as coisas do ofício viram de verdade uma vez só; quem recebe uma coisa a segura, e o kit nos outros lugares', ok1 && kit2.length === 1 && !!dr && dr.ok && kit3.length === 1 && ok2 && !novas().length,
    v ? `${v.name}, lenhador: a mochila ${bag1}, os lugares ${JSON.stringify({ costas: eq1.costas, atalho1: eq1.atalhos[0], kit: eq1.kit })}; linhas «kit»: ${kit1.length} → tomado de novo ${kit2.length} → sem o machado e guerreiro ${kit3.length}; ${o ? `${o.name} (${o.role}) com uma faca: ${JSON.stringify(ho)}` : 'ninguém para receber'}${novas().length ? ' — ' + novas().slice(0, 3).join(' | ') : ''}` : 'nenhum lenhador para tomar');
}

// ================================================================ the store
let ctx = null; // (the body at a store, for the parts that follow)
function body(pref) {
  open(WORLD); const c = atStore(pref); if (!c) return null;
  take(c.v); const [x, y] = door(c.b); put(c.v, x, y); return c;
}
if (on('i4')) {
  const c = body(); if (!c) ok('i4 o armazém', false, 'nenhuma cidade com armazém e alguém para tomar');
  else {
    const { v, fid } = c; const f = G.Fac.get(fid); const bad = [];
    // (no metal tools in the store: a pick of stone, made of the store's stone and wood — what it is made of: 20h, D-442)
    const s0 = stock(fid, 'stone'), m0 = lastN(); const r0 = ask(w => Inv.make(w, 'picareta')); const s1 = stock(fid, 'stone');
    const stoneOut = lines(m0).filter(e => e[3] === 'f:' + fid && e[4] === '@uso' && (e[5] === 'stone' || e[5] === 'wood') && e[8] === 'coisa').length;
    if (r0.ok && !(r0.k === 'picareta.pedra' && Math.abs(s0 - s1 - 0.5) < 1e-6 && stoneOut === 2)) bad.push(`a de pedra: ${JSON.stringify(r0)} pedra ${s0}→${s1}, ${stoneOut} linhas`);
    if (r0.ok) ask(w => Inv.unmake(w, r0.k));
    // (bronze tools in the store, of a people that knows the bronze: a pick of bronze, one of them)
    teach(fid, 'bronze'); give(fid, 'ferramentas', 3, 'bronze'); const t0 = stock(fid, 'ferramentas'); const b0 = G.Origem.parts('f:' + fid, 'ferramentas').bronze || 0; const n0 = lastN();
    const r1 = ask(w => Inv.make(w, 'picareta')); const key = r1.k;
    const L = lines(n0); const out = L.find(e => e[3] === 'f:' + fid && e[4] === '@uso' && e[5] === 'ferramentas' && e[8] === 'coisa'), inn = L.find(e => e[3] === '@mundo' && e[4] === 'm:' + v.id && e[5] === key && e[8] === 'coisa');
    const t1 = stock(fid, 'ferramentas'); const b1 = G.Origem.parts('f:' + fid, 'ferramentas').bronze || 0;
    if (!(r1.ok && key === 'picareta.bronze' && Inv.count(v, key) === 1 && Math.abs(t0 - t1 - 1) < 1e-6 && Math.abs(b0 - b1 - 1) < 1e-6 && out && inn)) bad.push(`a troca: ${JSON.stringify(r1)} ${t0}→${t1} (bronze ${b0}→${b1}) livro ${!!out}/${!!inn}`);
    // (a weapon the people cannot make; another people's store; away from the store)
    const r2 = ask(w => (!f.tech.known.arco ? Inv.make(w, 'arco') : Inv.make(w, 'espada', 'ferro'))); // (a thing of an art the people does not know: the bow, or the iron — it knows the bronze now, 20h)
    const away = people(o => o.set !== c.set.id && grown(o))[0]; const otherSt = away ? storeOf(S.settlements.get(away.set)) : null;
    let r3 = null; if (otherSt && V.facOfSet(otherSt.set) !== fid) { const [x, y] = door(otherSt); put(v, x, y); r3 = ask(w => Inv.make(w, 'machado')); }
    const far = (() => { for (let d = 8; d < 30; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const x = c.b.x + 0.5 + dx, y = c.b.y + 0.5 + dy; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)] && !Inv.storeNear(Object.assign({}, v, { x, y }))) return [x, y]; } return null; })();
    let r4 = null; if (far) { put(v, ...far); r4 = ask(w => Inv.make(w, 'machado')); }
    // (and back: the tool given back counts as a tool again)
    const [x, y] = door(c.b); put(v, x, y); const t2 = stock(fid, 'ferramentas'); const n1 = lastN();
    const r5 = ask(w => Inv.unmake(w, key)); const t3 = stock(fid, 'ferramentas'); const b3 = G.Origem.parts('f:' + fid, 'ferramentas').bronze || 0;
    const back = lines(n1).filter(e => e[8] === 'devolveu');
    if (!r0.ok && !/pedra|madeira/.test(r0.why)) bad.push('sem ferramentas de metal: ' + JSON.stringify(r0));
    if (r2.ok || !/não sabe/.test(r2.why)) bad.push('sem a arte: ' + JSON.stringify(r2));
    if (Math.abs(b3 - b1 - 1) > 1e-6) bad.push(`a volta ao bronze do armazém: ${b1}→${b3}`);
    if (r3 && (r3.ok || !/armazém do seu povo/.test(r3.why))) bad.push('o armazém de outro povo: ' + JSON.stringify(r3));
    if (!far || r4.ok || !/armazém/.test(r4.why)) bad.push('longe: ' + JSON.stringify(r4));
    if (!(r5.ok && Math.abs(t3 - t2 - 1) < 1e-6 && Inv.count(v, key) === 0 && back.length === 2 && !Object.keys(f.stock).some(k => It.isThing(k)))) bad.push(`a volta: ${JSON.stringify(r5)} ${t2}→${t3} linhas ${back.length}`);
    const nv = novas();
    ok('i4 pegar uma ferramenta no armazém (no livro) e devolvê-la; as recusas com a razão', !bad.length && !nv.length, `${v.name}: sem ferramentas de metal ${r0.ok ? r0.k + ' (da pedra e da madeira do armazém)' : '«' + r0.why + '»'} → com ferramentas de bronze: ${key} (${t0} → ${t1} no armazém, linhas «coisa» ${out ? 'f→uso' : '?'} e ${inn ? 'mundo→mochila' : '?'}); «${r2.why}»; ${r3 ? `outro povo: «${r3.why}»` : '(nenhum outro povo com armazém)'}; longe: «${r4 ? r4.why : '?'}»; devolvido: ${t2} → ${t3}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
  }
}

// ================================================================ equip, stow, draw
if (on('i5', 'i6', 'i11')) {
  const c = body(plain) || body(); ctx = c;
  if (!c) ok('i5 equipar', false, 'ninguém no armazém');
  else {
    const { v, fid } = c; const f = G.Fac.get(fid);
    teach(fid, 'bronze'); give(fid, 'ferramentas', 4, 'bronze'); give(fid, 'armas', 4, 'bronze'); // (of bronze: the store gives what it has, 20h)
    for (const k of ['machado', 'picareta']) ask(w => Inv.make(w, k));
    for (const k of ['espada', 'escudo', 'elmo']) ask(w => Inv.make(w, k));
    const ax = keyIn(v, 'machado'), pk = keyIn(v, 'picareta'), sw = keyIn(v, 'espada'), sh = keyIn(v, 'escudo'), hm = keyIn(v, 'elmo');
    if (on('i5')) {
      const bad = []; const st = [];
      let r = ask(w => Inv.equip(w, ax)); if (!(r.ok && v.equip.mao === ax)) bad.push('o machado na mão ' + JSON.stringify(r)); st.push(`mão: ${v.equip.mao}`);
      r = ask(w => Inv.stow(w)); const where = ['cinto', 'costas'].find(s => v.equip[s] === ax); if (!(r.ok && !v.equip.mao && where)) bad.push('guardado ' + JSON.stringify(r)); st.push(`guardado: ${where}`);
      r = ask(w => Inv.draw(w)); if (!(r.ok && v.equip.mao === ax && !v.equip[where])) bad.push('sacado ' + JSON.stringify(r)); st.push(`sacado: ${v.equip.mao}`);
      r = ask(w => Inv.equip(w, sh)); if (!(r.ok && v.equip.outra === sh && v.equip.mao === ax)) bad.push('o escudo na outra ' + JSON.stringify(r)); st.push(`escudo: ${v.equip.outra}`);
      r = ask(w => Inv.equip(w, pk, 'mao')); if (!(r.ok && v.equip.mao === pk && !v.equip.outra && v.equip.costas === sh)) bad.push('a picareta de duas mãos ' + JSON.stringify(v.equip)); st.push(`picareta: mão ${v.equip.mao}, costas ${v.equip.costas}, machado ${['cinto', 'costas'].find(s => v.equip[s] === ax) || 'na mochila'}`);
      const r1 = ask(w => Inv.equip(w, hm, 'mao')); if (r1.ok) bad.push('o elmo na mão');
      const r2 = ask(w => Inv.equip(w, 'lanca.ferro')); if (r2.ok) bad.push('o que não está na mochila');
      r = ask(w => Inv.equip(w, hm)); if (!(r.ok && v.equip.cabeca === hm)) bad.push('o elmo na cabeça');
      r = ask(w => Inv.equip(w, sw)); if (!(r.ok && v.equip.mao === sw)) bad.push('a espada'); // (the pickaxe goes where it rides)
      r = ask(w => Inv.equip(w, sh, 'outra')); const h = Inv.held(v);
      if (!(r.ok && v.equip.outra === sh && h.mao === sw && h.outra === sh && h.cabeca === hm && h.real)) bad.push('espada e escudo ' + JSON.stringify(h));
      const nv = novas();
      ok('i5 equipar, guardar, sacar; as duas mãos; o que não cabe e o que não há', !bad.length && !nv.length, `${v.name}: ${st.join('; ')}; «${r1.why}»; «${r2.why}»; no fim ${JSON.stringify(Inv.held(v))}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
    }
    if (on('i6')) {
      for (const sl of Inv.SLOTS) if (v.equip && v.equip[sl]) ask(w => Inv.unequip(w, sl));
      ask(w => Inv.equip(w, sw, 'mao')); ask(w => Inv.equip(w, sh, 'outra'));
      const bad = [];
      // (a load by the depot: from the store into the arms — the hands empty in the same step)
      god(() => D.move('f:' + fid, 'v:' + v.id, 'wood', 1, { code: 'teste', by: v.id }));
      const e1 = Inv.equipOf(v); const h1 = Inv.held(v);
      if (!(v.carry && !e1.mao && !e1.outra && e1.cinto === sw && e1.costas === sh && !h1.mao && !h1.outra)) bad.push(`pelo depósito: ${JSON.stringify(e1)}`);
      const r1 = ask(w => Inv.equip(w, sw, 'mao'));
      if (r1.ok) bad.push('a espada na mão com a carga');
      // (the load put down at the store; the sword back in the hand; then a load put in the arms by a hand of the world that does
      // not pass by the depot — the gathering's G.Vg.fillHands)
      god(() => G.Vg.toStore(v, fid, 'teste')); ask(w => Inv.equip(w, sw, 'mao')); ask(w => Inv.equip(w, sh, 'outra'));
      god(() => G.Vg.fillHands(v, 'food', 1)); const h2 = Inv.held(v), e2 = Inv.equipOf(v);
      M.viver(1.2); const e3 = Inv.equipOf(v);
      if (!(h2.mao === null && h2.outra === null && (h2.cinto === sw || h2.costas === sw) && e2.mao === sw)) bad.push(`na hora, o que se segura: ${JSON.stringify(h2)} (o equipamento ${e2.mao})`);
      if (!(v.carry && !e3.mao && !e3.outra && e3.cinto === sw)) bad.push(`depois de um segundo: ${JSON.stringify(e3)}`);
      god(() => G.Vg.toStore(v, fid, 'teste'));
      const nv = novas();
      ok('i6 a carga nas mãos com a espada na mão: a espada no cinto, o escudo nas costas', !bad.length && !nv.length, `pelo depósito: mão ${e1.mao}, cinto ${e1.cinto}, costas ${e1.costas}; «${r1.why}»; posta pelo mundo à mão: o que se segura na hora ${JSON.stringify({ mao: h2.mao, cinto: h2.cinto })}, o equipamento depois de 1,2 s ${JSON.stringify({ mao: e3.mao, cinto: e3.cinto })}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
    }
    if (on('i11')) {
      const bad = [];
      let r = ask(w => Inv.shortcut(w, 1, ax)); r = ask(w => Inv.shortcut(w, 2, hm));
      if (v.equip.mao === ax) ask(w => Inv.stow(w));
      if (v.equip.cabeca) ask(w => Inv.unequip(w, 'cabeca'));
      const q1 = ask(w => Inv.quick(w, 1)); const a1 = v.equip.mao;
      const q2 = ask(w => Inv.quick(w, 1)); const a2 = v.equip.mao;
      const q3 = ask(w => Inv.quick(w, 2)); const a3 = v.equip.cabeca;
      const q4 = ask(w => Inv.quick(w, 2)); const a4 = v.equip.cabeca;
      const q5 = ask(w => Inv.quick(w, 4));
      const q6 = ask(w => Inv.shortcut(w, 3, ax)); const dup = v.equip.atalhos.filter(k => k === ax).length;
      if (!(q1.ok && a1 === ax && q2.ok && a2 !== ax && q3.ok && a3 === hm && q4.ok && !a4 && !q5.ok && q6.ok && dup === 1)) bad.push(JSON.stringify([q1, q2, q3, q4, q5].map(x => x.did || x.why)));
      const nv = novas();
      ok('i11 os atalhos: na mão e guardado, o elmo na cabeça e fora, o atalho vazio', !bad.length && !nv.length, `atalho 2 (${ax}): ${q1.did} → ${q2.did}; atalho 3 (${hm}): ${q3.did} → ${q4.did}; atalho 5: «${q5.why}»; o mesmo machado num atalho só (${dup})${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
    }
  }
}

// ================================================================ the ground
if (on('i7')) {
  const c = body(); if (!c) ok('i7 o chão', false, 'ninguém');
  else {
    const { v, fid } = c; give(fid, 'ferramentas', 2); ask(w => Inv.make(w, 'faca'));
    const k = keyIn(v, 'faca'); const bad = [];
    // (a step off the store's door, on open ground)
    const [x0, y0] = door(c.b); let spot = null; for (let d = 1; d < 6 && !spot; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const x = x0 + dx, y = y0 + dy; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)]) { spot = [x, y]; break; } }
    put(v, ...spot); const n0 = lastN();
    const r1 = ask(w => Inv.drop(w, k)); const g = (S.loose || []).find(o => o.id === r1.g);
    if (!(r1.ok && g && g.k === k && g.n === 1 && !g.fac && !g.op && Inv.count(v, k) === 0 && lines(n0, e => e[8] === 'largou').length === 1 && !G.Vg.groundLoad(g))) bad.push('largar ' + JSON.stringify(r1) + JSON.stringify(g));
    M.viver(20); const still = (S.loose || []).find(o => o.id === r1.g);
    if (!still) bad.push('os carregadores levaram o que foi largado de propósito');
    // (too far, then near: picked up)
    put(v, spot[0] + 3, spot[1]); const r2 = ask(w => Inv.pick(w, r1.g));
    put(v, ...spot); const near = Inv.near(v); const r3 = ask(w => Inv.pick(w, r1.g));
    if (r2.ok || !(r3.ok && Inv.count(v, k) === 1 && !(S.loose || []).some(o => o.id === r1.g) && near.some(o => o.g === r1.g))) bad.push(`pegar: longe ${JSON.stringify(r2)}, perto ${JSON.stringify(r3)}`);
    // (an operation's crate on the ground is the porters')
    // (asked in the same step it is set down: an operation of no use ends at its own next look, and its crate is nobody's then)
    // (its books kept: the crate taken from its source, the store, and back there when the test is done)
    let r4 = null, r5 = null; god(() => { D.make('f:' + fid, 'wood', 1, { code: 'teste', part: true }); const op = G.Act.start(Object.keys(G.Act.DEFS)[0], { why: 'teste', from: 'f:' + fid, goods: { wood: 1 } }); if (op) { const d = D.drop('f:' + fid, 'wood', 1, v.x, v.y, { op: op.id, code: 'teste' }); r4 = d.g; r5 = Inv.pick(v, r4); D.move('g:' + r4, 'f:' + fid, 'wood', 1, { op: op.id, code: 'teste' }); G.Act.end(op, 'cancel', 'teste'); } });
    if (r4 && (!r5 || r5.ok)) bad.push('a caixa de um serviço ' + JSON.stringify(r5));
    const nv = novas();
    ok('i7 largar no chão e pegar de volta; longe demais; a caixa do serviço', !bad.length && !nv.length, `${k} largado em ${spot.map(z => z.toFixed(1)).join(',')} (sem marca de povo; 20 s depois ${still ? 'ainda lá' : 'SUMIU'}); longe: «${r2.why}»; perto: ${r3.ok ? 'de volta à mochila' : r3.why}${r5 ? `; a caixa: «${r5.why}»` : ''}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
  }
}

// ================================================================ capacity
if (on('i8')) {
  open(WORLD); const bad = [];
  const a = people(o => grown(o) && !(o.traits || []).includes('Resistente'))[0], k = people(o => o.age >= 3 && o.age < 9)[0];
  const ca = Inv.cap(a), ck = k ? Inv.cap(k) : 0;
  if (ca !== 25 || (k && ck !== 7.5)) bad.push(`os limites ${ca} e ${ck}`);
  // (a bag filled: shields of four kilos — six go in, the seventh does not; the depot says the same room)
  const n6 = god(() => D.make('m:' + a.id, 'escudo.madeira', 6, { code: 'teste' })); const r7 = god(() => D.make('m:' + a.id, 'escudo.madeira', 1, { code: 'teste' }));
  const room = Inv.room(a, 'faca.pedra'), droom = D.room('m:' + a.id, 'faca.pedra');
  if (!(n6.ok && n6.n === 6 && !r7.ok && room === droom && room === Math.floor((25 - Inv.weight(a) + 1e-6) / It.peso('faca.pedra')))) bad.push(`cheia: ${JSON.stringify(n6)} ${JSON.stringify(r7)} lugar ${room}/${droom}`);
  const kr = k ? god(() => D.make('m:' + k.id, 'escudo.madeira', 2, { code: 'teste' })) : { ok: false };
  if (k && kr.ok) bad.push('a criança levou dois escudos');
  // (the years take the limit: the bag stays, nothing more goes in, the checker is clean)
  god(() => { a.age = 66; }); M.viver(1.5); const w66 = Inv.weight(a);
  const r8 = god(() => D.make('m:' + a.id, 'faca.pedra', 1, { code: 'teste' }));
  if (!(Math.abs(w66 - 24) < 1e-6 && Inv.cap(a) === 15 && !r8.ok && Inv.room(a, 'faca.pedra') === 0)) bad.push(`os anos: ${w66} kg, limite ${Inv.cap(a)}, ${JSON.stringify(r8)}`);
  // (no water, no coins in the bag)
  if (Inv.room(a, 'water') || Inv.room(a, 'moedas')) bad.push('água ou moedas na mochila');
  const nv = novas();
  ok('i8 a capacidade: 25 kg o adulto, 7,5 a criança; cheia recusa; os anos tiram o limite e nada se perde', !bad.length && !nv.length, `${a.name}: ${ca} kg, seis escudos de 4 kg (${Inv.weight(a)} kg com eles) e o sétimo «${r7.why}»; ${k ? `${k.name}, ${Math.floor(k.age)} anos: ${ck} kg` : ''}; aos 66 anos o limite ${Inv.cap(a)} kg, a mochila ainda ${w66} kg, «${r8.why}»${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
}

// ================================================================ give and take
if (on('i9')) {
  const c = body(plain) || body(); if (!c) ok('i9 dar e tirar', false, 'ninguém');
  else {
    const { v, fid } = c; give(fid, 'ferramentas', 3); ask(w => Inv.make(w, 'machado')); ask(w => Inv.make(w, 'martelo'));
    const ax = keyIn(v, 'machado'), mt = keyIn(v, 'martelo'); const bad = [];
    const o = people(x => grown(x) && x.id !== v.id && x.home && x.home !== v.home)[0];
    // (far from the one to give to: refused; then beside them)
    const r0 = ask(w => Inv.give(w, o, mt)); const farOk = !r0.ok && /Longe/.test(r0.why) || G.dist(v.x, v.y, o.x, o.y) <= Inv.HAND_R;
    god(() => { o.x = v.x + 0.6; o.y = v.y; o.inside = 0; });
    const n0 = lastN(); const r1 = ask(w => Inv.give(w, o, mt)); const L1 = lines(n0, e => e[8] === 'dar');
    if (!farOk) bad.push('dar de longe ' + JSON.stringify(r0));
    if (!(r1.ok && Inv.count(o, mt) === 1 && Inv.count(v, mt) === 0 && L1.length === 1 && L1[0][3] === 'm:' + v.id && L1[0][4] === 'm:' + o.id)) bad.push('dar ' + JSON.stringify(r1));
    const r2 = ask(w => Inv.take(w, 'm:' + o.id, mt));
    if (r2.ok || Inv.count(o, mt) !== 1) bad.push('tirar da mochila alheia ' + JSON.stringify(r2));
    // (the one who cannot carry more)
    god(() => { D.make('m:' + o.id, 'couraca.couro', 5, { code: 'teste', part: true }); D.make('m:' + o.id, 'flecha.pedra', Inv.room(o, 'flecha.pedra'), { code: 'teste' }); });
    const r3 = ask(w => Inv.give(w, o, ax)); if (r3.ok) bad.push('dar a quem não aguenta');
    // (one's house, and another family's)
    // (one's house: from afar refused; at its door, in and out)
    const H = 'h:' + v.home; const r3b = ask(w => Inv.put(w, H, ax)); const hb = S.buildings.get(v.home);
    if (r3b.ok && !Inv.reaches(v, H)) bad.push('guardar em casa de longe');
    put(v, ...door(hb)); const r4 = ask(w => Inv.put(w, H, ax)); const inH = D.get(H, ax);
    const r5 = ask(w => Inv.take(w, H, ax)); const back = Inv.count(v, ax);
    const r6 = ask(w => Inv.put(w, 'h:' + o.home, ax));
    if (!(r4.ok && inH === 1 && r5.ok && back === 1 && !r6.ok)) bad.push(`a casa: ${JSON.stringify([r4, r5, r6])}`);
    const nv = novas();
    ok('i9 dar, tirar da mochila alheia, guardar em casa e pegar de volta, a casa alheia', !bad.length && !nv.length, `${v.name} deu ${mt} a ${o.name}; tirar de volta: «${r2.why}»; dar a quem está cheio: «${r3.why}»; em casa: ${inH} e de volta ${back}; a casa de outra família: «${r6.why}»${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
  }
}

// ================================================================ a thing in a store counts as its good
if (on('i10')) {
  open(WORLD); const bad = [];
  const o = people(x => grown(x) && x.home)[0]; const fid = G.Fac.idOfV(o); const H = 'h:' + o.home;
  god(() => { const [x, y] = door(S.buildings.get(o.home)); o.x = x; o.y = y; o.inside = 0; D.make('m:' + o.id, 'machado.pedra', 1, { code: 'teste' }); Inv.put(o, H, 'machado.pedra'); });
  // (a thing comes back to the store as what it is made of — a stone axe as its stone and its wood, a bronze one as one of the
  // store's bronze tools: 20h, D-442)
  const p0 = stock(fid, 'stone'); const inH = D.get(H, 'machado.pedra');
  // (the house's goods into the store, by the world's door the fallen shack and the court use: G.Depot.store)
  const n = god(() => D.store(H, fid, 'machado.pedra', 1, { code: 'ruína' }));
  const p1 = stock(fid, 'stone'); const full = k => stock(fid, k) >= G.Village.cap(fid) - 1;
  give(fid, 'ferramentas', 1, 'bronze'); // (the people has had bronze: a bronze axe of its own)
  const t0 = stock(fid, 'ferramentas'), q0 = G.Origem.parts('f:' + fid, 'ferramentas').bronze || 0;
  god(() => { D.make('m:' + o.id, 'machado.bronze', 1, { code: 'teste' }); D.move('m:' + o.id, 'f:' + fid, 'machado.bronze', 1, { code: 'teste' }); });
  const t1 = stock(fid, 'ferramentas'), q1 = G.Origem.parts('f:' + fid, 'ferramentas').bronze || 0;
  // (and an arrow's stone and wood, a staff's wood)
  god(() => { D.make('m:' + o.id, 'flecha.pedra', 20, { code: 'teste' }); D.make('m:' + o.id, 'cajado', 1, { code: 'teste' }); });
  const a0 = stock(fid, 'stone'), w0 = stock(fid, 'wood');
  god(() => { D.move('m:' + o.id, 'f:' + fid, 'flecha.pedra', 20, { code: 'teste' }); D.move('m:' + o.id, 'f:' + fid, 'cajado', 1, { code: 'teste' }); });
  const a1 = stock(fid, 'stone'), w1 = stock(fid, 'wood');
  if (!(inH === 1 && n === 1 && (Math.abs(p1 - p0 - 0.5) < 1e-6 || full('stone')) && D.get(H, 'machado.pedra') === 0 && Math.abs(t1 - t0 - 1) < 1e-6 && Math.abs(q1 - q0 - 1) < 1e-6 && (Math.abs(a1 - a0 - 0.25) < 1e-6 || full('stone')) && (Math.abs(w1 - w0 - 0.75) < 1e-6 || full('wood')))) bad.push(`pedra ${p0}→${p1}, ferramentas ${t0}→${t1} (bronze ${q0}→${q1}), pedra das flechas ${a0}→${a1}, madeira ${w0}→${w1}`);
  const things = [...S.factions.values()].flatMap(f => Object.keys(f.stock).filter(k => It.isThing(k)));
  // (the proof's hand set Neferu at her door, out of the house, within the same instant of the world: the atmosphere counts who is
  // inside once per instant, and its door for the proofs says the world changed by hand — T-1404)
  if (G.Atmos && G.Atmos.flush) G.Atmos.flush();
  const nv = novas();
  ok('i10 a coisa que chega ao armazém conta como o que ela é feita; nenhuma coisa no estoque', !bad.length && !things.length && !nv.length, `o machado de pedra da casa de ${o.name} levado ao armazém: pedra ${p0} → ${p1}; um de bronze: ferramentas ${t0} → ${t1} (de bronze ${q0} → ${q1}); vinte flechas e o cajado → pedra ${a0} → ${a1}, madeira ${w0} → ${w1}${things.length ? ' — COISAS NO ESTOQUE: ' + things.join(',') : ''}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''}`);
}

// ================================================================ save and load in the middle
if (on('i12')) {
  const c = body(o => o.role === 'lenhador') || body(); if (!c) ok('i12 salvar e carregar', false, 'ninguém');
  else {
    const { v, fid } = c; teach(fid, 'bronze'); give(fid, 'armas', 3); give(fid, 'ferramentas', 2);
    ask(w => Inv.make(w, 'espada')); ask(w => Inv.make(w, 'escudo')); ask(w => Inv.make(w, 'faca'));
    const sw = keyIn(v, 'espada'), sh = keyIn(v, 'escudo'), fk = keyIn(v, 'faca');
    ask(w => Inv.equip(w, sw)); ask(w => Inv.equip(w, sh)); ask(w => Inv.shortcut(w, 4, sw));
    const [x0, y0] = door(c.b); let spot = null; for (let d = 1; d < 6 && !spot; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const x = x0 + dx, y = y0 + dy; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)]) { spot = [x, y]; break; } }
    put(v, ...spot); const dr = ask(w => Inv.drop(w, fk));
    const ic0 = invCanon(), h0 = JSON.stringify(Inv.held(v)), g0 = JSON.stringify((S.loose || []).filter(o => o.id === dr.g).map(o => [o.id, o.k, o.n]));
    M.salvarCarregar(); S = G.S; M.viver(0.3);
    const v2 = S.villagers.get(v.id);
    const ic1 = invCanon(), h1 = v2 ? JSON.stringify(Inv.held(v2)) : '', g1 = JSON.stringify((S.loose || []).filter(o => o.id === dr.g).map(o => [o.id, o.k, o.n]));
    const r = v2 ? ask(w => Inv.stow(w)) : { ok: false }; const p = v2 ? ask(w => Inv.pick(w, dr.g)) : { ok: false };
    const nv = novas();
    ok('i12 salvar e carregar no meio: a mochila, os lugares, os atalhos, o chão voltam; as portas seguem', ic0 === ic1 && h0 === h1 && g0 === g1 && g1 !== '[]' && !!v2 && Po.is(v2) && r.ok && p.ok && !nv.length && !errs(),
      `${v.name}: ${h0} → ${h1 === h0 ? 'igual' : h1}; o registro ${ic0 === ic1 ? 'igual' : 'DIFERENTE'}; no chão ${g1}; depois: guardar ${r.ok ? 'ok' : r.why}, pegar ${p.ok ? 'ok' : p.why}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''} ${errs()}`);
  }
}

// ================================================================ death with things
if (on('i13')) {
  open(WORLD); const bad = []; const said = [];
  const arm = (o, k) => god(() => { D.make('m:' + o.id, k, 1, { code: 'teste' }); Inv.equip(o, k); });
  // (dies among their own: in their town, by the house)
  const a = people(x => grown(x) && x.home && G.Urban.at(x.x, x.y) && G.Urban.at(x.x, x.y).set === x.set && !Po.is(x))[0];
  if (a) { arm(a, 'machado.pedra'); arm(a, 'faca.pedra'); const H = 'h:' + a.home; const n0 = lastN(); god(() => V.kill(a, 'sick')); const her = lines(n0, e => e[8] === 'herdado' && e[3] === 'm:' + a.id && e[4] === H); if (!(D.get(H, 'machado.pedra') >= 1 && D.get(H, 'faca.pedra') >= 1 && her.length === 2)) bad.push(`na cidade: ${her.length} linhas, casa ${D.get(H, 'machado.pedra')}`); said.push(`${a.name} morreu na cidade: as coisas em casa (${her.length} linhas «herdado»)`); }
  // (falls far away: on the ground where they fell, with the people's mark — what a passing hand takes to the store as its good)
  const b = people(x => grown(x) && x.home && !Po.is(x) && x.id !== (a && a.id))[0];
  let far = null; if (b) { for (let r = 40; r < S.N && !far; r += 4) for (let k = 0; k < 16 && !far; k++) { const x = b.x + Math.cos(k / 16 * 6.283) * r, y = b.y + Math.sin(k / 16 * 6.283) * r; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)] && !G.Urban.at(x, y) && V.nearestSettlement(x, y) && G.dist(x, y, V.nearestSettlement(x, y).cx, V.nearestSettlement(x, y).cy) > 34) far = [x, y]; } }
  let g = null;
  if (b && far) { arm(b, 'lanca.pedra'); god(() => { b.x = far[0]; b.y = far[1]; b.inside = 0; }); const fid = G.Fac.idOfV(b); god(() => V.kill(b, 'war')); g = (S.loose || []).find(o => o.k === 'lanca.pedra' && Math.abs(o.x - far[0]) < 0.01); if (!(g && g.fac === fid && G.Vg.groundLoad(g))) bad.push('longe: ' + JSON.stringify(g));
    // (a hand of the world passes: up into its arms and to the store, by the doors of the errand that picks up a plain load)
    // (and the spear of stone reaches the store as its wood and stone: 20h, D-442)
    const p = people(x => grown(x) && G.Fac.idOfV(x) === fid && !x.carry && !Po.is(x))[0]; const a0 = stock(fid, 'wood');
    if (p && g) { god(() => { D.move('g:' + g.id, 'v:' + p.id, g.k, 1, { code: 'apanhou', by: p.id }); G.Vg.toStore(p, fid, 'entrega'); }); const a1 = stock(fid, 'wood'); if (!(Math.abs(a1 - a0 - 0.75) < 1e-6 || a0 >= G.Village.cap(fid) - 1)) bad.push(`ao armazém: madeira ${a0} → ${a1}`); said.push(`${b.name} caiu longe: a lança no chão com a marca do povo; quem passa a leva ao armazém (madeira ${a0} → ${stock(fid, 'wood')})`); }
  } else said.push('(ninguém para cair longe)');
  // (dies in the water: to the house)
  const c = people(x => grown(x) && x.home && !Po.is(x) && x.id !== (a && a.id) && x.id !== (b && b.id))[0];
  let wet = null; if (c) for (let r = 1; r < 60 && !wet; r++) for (let k = 0; k < 24 && !wet; k++) { const x = c.x + Math.cos(k / 24 * 6.283) * r, y = c.y + Math.sin(k / 24 * 6.283) * r; if (W.inb(x, y) && !W.walkableXY(x, y) && !S.occ[W.idx(x, y)] && !G.Urban.at(x, y)) wet = [x, y]; }
  if (c && wet) { arm(c, 'faca.pedra'); const H = 'h:' + c.home; const h0 = D.get(H, 'faca.pedra'); god(() => { c.x = wet[0]; c.y = wet[1]; c.inside = 0; }); god(() => V.kill(c, 'drown')); if (D.get(H, 'faca.pedra') !== h0 + 1) bad.push('na água'); said.push(`${c.name} morreu na água: a faca em casa`); }
  // (the god's body dies with things)
  const d = people(x => grown(x) && x.home && Po.can(x).ok && x.role === 'lenhador')[0] || people(x => grown(x) && x.home && Po.can(x).ok)[0];
  if (d) { take(d); const had = Object.keys(d.mochila || {}).length; god(() => V.kill(d, 'sick')); M.viver(0.3); said.push(`o corpo do deus (${d.name}) morreu com ${had} coisa(s): ${S.avatar ? 'AINDA ENCARNADO' : 'o deus volta'}`); if (S.avatar) bad.push('o corpo morto continua'); }
  M.viver(2);
  const nv = novas();
  ok('i13 a morte com coisas: em casa, no chão onde caiu (e de lá ao armazém), da água para casa; o corpo do deus', !bad.length && !nv.length && !errs(), `${said.join('; ')}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''} ${errs()}`);
}

// ================================================================ a damaged save
if (on('i14')) {
  open(WORLD);
  const vs = people(x => grown(x)).slice(0, 4); const ids = vs.map(x => x.id);
  const o = JSON.parse(G.Save.serialize());
  const rec = id => o.villagers.find(x => x.id === id);
  Object.assign(rec(ids[0]), { mochila: { machado: 1, 'machado.pedra': 2.6, 'lanca.ouro': 1, food: NaN, dragao: 4, water: 2, moedas: 9, 'escudo.madeira': -3, 'couraca.ferro': 200 }, equip: { mao: 'machado', outra: 'lanca.pedra', costas: 7, cinto: 'faca.pedra', cabeca: 'machado.pedra', corpo: null, atalhos: ['machado.pedra', 'machado.pedra', 'x', null, null, null, null, null, null], kit: 'abc', asa: 'escudo' } });
  Object.assign(rec(ids[1]), { mochila: ['machado.pedra'], equip: 'tudo' });
  Object.assign(rec(ids[2]), { carry: null, mochila: { 'lanca.pedra': 1, 'escudo.madeira': 1 }, equip: { mao: 'lanca.pedra', outra: 'escudo.madeira', atalhos: null } });
  Object.assign(rec(ids[3]), { mochila: null, equip: { mao: null } });
  let threw = ''; try { M.abrir(o); S = G.S; M.viver(1.2); } catch (e) { threw = e.message; }
  const v0 = S.villagers.get(ids[0]), v1 = S.villagers.get(ids[1]), v2 = S.villagers.get(ids[2]), v3 = S.villagers.get(ids[3]);
  const bad = [];
  if (v0) { const b = v0.mochila || {}; if (b['machado.pedra'] !== 3 || b.machado !== undefined || b['lanca.ouro'] || b.food || b.dragao || b.water || b.moedas || b['escudo.madeira'] || Inv.weight(v0) > Inv.capPeak(v0) + 1e-6) bad.push('a mochila 0: ' + JSON.stringify(b)); const e = v0.equip || {}; if (e.mao !== 'machado.pedra' || e.outra || e.costas || e.cinto || e.cabeca || e.asa !== undefined || !Array.isArray(e.atalhos) || e.atalhos.length !== 5 || e.atalhos[1] || e.kit !== 0) bad.push('o equipamento 0: ' + JSON.stringify(e)); }
  if (v1 && (v1.mochila !== undefined || v1.equip !== undefined)) bad.push('a lista e o texto: ' + JSON.stringify([v1.mochila, v1.equip]));
  if (v2 && (!v2.equip || v2.equip.mao !== 'lanca.pedra' || v2.equip.outra || v2.equip.costas !== 'escudo.madeira')) bad.push('as duas mãos: ' + JSON.stringify(v2.equip));
  if (v3 && (v3.mochila !== undefined || v3.equip !== undefined)) bad.push('o vazio: ' + JSON.stringify([v3.mochila, v3.equip]));
  const inv = QA.check().filter(q => q.sys === 'inventario' || q.sev <= 1);
  ok('i14 um save danificado abre consertado: nenhum erro, o verificador limpo', !threw && !bad.length && !inv.length && !errs(), threw ? 'ERRO: ' + threw : `${v0 ? JSON.stringify(v0.mochila) + ' ' + JSON.stringify(Inv.equipOf(v0)) : ''}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${inv.length ? ' — ' + inv.slice(0, 3).map(q => q.msg).join(' | ') : ''} ${errs()}`);
}

// ================================================================ an old save
if (on('i15')) {
  let threw = ''; const file = path.join(__dirname, 'oldsave_7.json');
  try { open(() => M.abrir(JSON.parse(fs.readFileSync(file, 'utf8')))); } catch (e) { threw = e.message; }
  const any = threw ? 1 : people(x => x.mochila !== undefined || x.equip !== undefined).length;
  const same = threw ? false : people(() => true).every(x => JSON.stringify(Inv.held(x)) === JSON.stringify(Inv.kit(x)));
  const v = threw ? null : people(x => grown(x) && Po.can(x).ok && Inv.trade(x) && Object.values(Inv.trade(x)).some(k => typeof k === 'string'))[0];
  const t = v ? take(v) : false; const made = v ? Object.keys(v.mochila || {}) : [];
  const nv = threw ? [] : novas();
  ok('i15 um save antigo: ninguém leva nada, o kit é o que se segura, o corpo ganha as coisas do ofício', !threw && !any && same && !!v && t && made.length > 0 && !nv.length && !errs(), threw ? 'ERRO: ' + threw : `${path.basename(file)}: dia ${S.day}, ${S.villagers.size} pessoas, ${any} com mochila; held = kit ${same}; ${v ? `${v.name} (${v.role}) tomado: ${made.join(', ')}` : 'ninguém com ofício'}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''} ${errs()}`);
}

// ================================================================ the screens do not write
if (on('i16')) {
  open(WORLD); const c = atStore(); take(c.v); const [x, y] = door(c.b); put(c.v, x, y); give(c.fid, 'ferramentas', 2);
  const s0 = G.Save.serialize();
  const run = frames => {
    G.Save.apply(JSON.parse(s0)); S = G.S; const v = S.villagers.get(c.v.id);
    for (let k = 0; k < 40; k++) {
      if (k === 5) { const it = Po.apply(w => Inv.make(w, 'machado')); void it; }
      if (k === 15) Po.apply(w => Inv.equip(w, keyIn(w, 'machado')));
      if (frames) for (const o of S.villagers.values()) { Inv.held(o); Inv.kit(o); Inv.list(o); Inv.room(o, 'faca.pedra'); Inv.equipOf(o); Inv.weight(o); Inv.near(o); Inv.storeNear(o); }
      if (frames && k % 7 === 0) { Inv.equip(v, 'machado.pedra'); Inv.drop(v, 'machado.pedra'); Inv.make(v, 'faca'); Inv.quick(v, 0); Inv.realize(v); }
      G.debug.step(0.1);
    }
    return [fpOf(), Inv.outside()];
  };
  const [a, oa] = run(true), [b, ob] = run(false);
  ok('i16 as telas não escrevem: o mesmo mundo com e sem quadros; o pedido de fora do passo recusado e contado', a === b && oa > 0 && ob === 0, `com quadros ${a}, sem ${b}; pedidos de fora: ${oa} e ${ob}`);
}

// ================================================================ the bad cases
if (on('x1')) {
  open(WORLD); const bad = []; const said = []; let threw = '';
  try {
    const c = atStore(); const v = c.v; take(v); const [x, y] = door(c.b); put(v, x, y); give(c.fid, 'ferramentas', 3);
    // (asked, and the body given back before the world's step: it never happened)
    const it = Po.apply(w => Inv.make(w, 'machado')); Po.release('deus'); M.viver(0.2);
    if (keyIn(v, 'machado') && Inv.count(v, keyIn(v, 'machado')) > (Inv.trade(v).costas ? 1 : 0)) bad.push('o pedido do corpo devolvido aconteceu');
    said.push(`o pedido do corpo devolvido: ${it.res && it.res.dropped ? 'não aconteceu' : JSON.stringify(it.res)}`);
    // (the body dies with a request waiting)
    take(v); const it2 = Po.apply(w => Inv.make(w, 'picareta')); god(() => V.kill(v, 'sick')); M.viver(0.2);
    said.push(`o pedido do corpo morto: ${it2.res && it2.res.dropped ? 'não aconteceu' : JSON.stringify(it2.res)}`);
    // (a house with things in it falls)
    const o = people(q => grown(q) && q.home)[0]; const H = o.home;
    god(() => { const [x0, y0] = door(S.buildings.get(H)); o.x = x0; o.y = y0; o.inside = 0; D.make('m:' + o.id, 'martelo.pedra', 1, { code: 'teste' }); Inv.put(o, 'h:' + H, 'martelo.pedra'); });
    const inH = D.get('h:' + H, 'martelo.pedra'); const hb = S.buildings.get(H); god(() => V.destroyBuilding(hb)); M.viver(0.5);
    said.push(`a casa com um martelo (${inH}) caiu: ${S.buildings.has(H) ? S.buildings.get(H).type : 'sumiu'}`);
    if (inH !== 1) bad.push('o martelo não entrou na casa');
    // (the god holds the body in the hand: the things stay with the person)
    const p = people(q => grown(q) && Po.can(q).ok)[0]; take(p); god(() => { D.make('m:' + p.id, 'faca.pedra', 1, { code: 'teste' }); Inv.equip(p, 'faca.pedra'); });
    god(() => { p.held = true; }); M.viver(0.3); const still = Inv.count(p, 'faca.pedra'); god(() => { p.held = false; }); M.viver(0.3);
    said.push(`o deus segurou o corpo: ${S.avatar ? 'ainda encarnado' : 'o corpo voltou ao mundo'}, a faca ${still ? 'com a pessoa' : 'SUMIU'}`);
    if (!still) bad.push('a faca sumiu na mão do deus');
  } catch (e) { threw = e.message + ' ' + String(e.stack).split('\n')[1]; }
  const nv = novas();
  ok('x1 os casos ruins: o pedido de um corpo devolvido ou morto não acontece, a casa cai, a mão do deus — nada quebra', !threw && !bad.length && !nv.length && !errs(), threw ? 'ERRO: ' + threw : `${said.join('; ')}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}${nv.length ? ' — ' + nv.slice(0, 3).join(' | ') : ''} ${errs()}`);
}
console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'tudo passou');
process.exitCode = fails.length ? 1 : 0;
