// interacao: a interação do corpo com o ambiente (20e; D-395 a D-409).   [ONLY=n1,n5] node qa/interacao.js [mundo]
// Em Node, sem navegador: a simulação (qa/nodemundo.js) com os arquivos do corpo depois dela (o espaço, as pessoas do 3D, o
// encarnar, as mãos, o controle do corpo e os clipes das mãos), como o qa/visual/porta.js. O corpo é tomado pela porta do jogo e
// as mãos pedem ao mundo como o jogador pede — pelas mãos do corpo (G.Possess.apply), feitas no passo do mundo; «a mão da prova»
// (god) só põe a cena: uma coisa na mochila, uma pessoa num lugar, alguém em casa, uma porta trancada. As telas não estão aqui (a
// tela dos guardados, o destaque, o anel do segurar: qa/interacao-tela.js, no navegador): só as portas do mundo que elas pedem.
//  n1 os verbos de uma pessoa: o E conversa; o F dá algo (sem nada na mochila, não, com a razão); para os seus, o E segurado
//     abraça; o verbo que outra parte traz para uma pessoa (o «Desafiar» da 20f) toma o F, e o «Dar» vai para o cartão; o F
//     devolve a tela dos guardados com a pessoa do outro lado;
//  n2 a troca de alvo: com várias coisas ao alcance, a lista dos outros começa pelo do I.best, vai da esquerda para a direita
//     do corpo, uma entrada por coisa (o bicho manso é um só para o «Observar» e o «Fazer carinho»), os nomes não mudam de uma
//     olhada para a outra, e o I.best é o de sempre;
//  n3 pegar e largar: o que se larga fica no chão (sem a marca do povo), o E o pega (o passo até lá, a mão desce, o mundo o põe na
//     mochila: «apanhou»), o E segurado o pega e o segura na mão;
//  n4 os guardados, pelas portas do mundo: guardar em casa e tirar de volta (o livro), o armazém do povo dá uma ferramenta do que
//     tem e a recebe de volta como o seu bem (D-371), a casa de outra família recusa com a razão; os móveis que guardam dizem de
//     quem são (a casa, o armazém, a prateleira, a banca);
//  n5 dar: a coisa sai da mochila e entra na de quem recebe (o livro, «dar»), os dois se conheceram de frente, quem recebe
//     agradece; a um bebê, a quem está longe, a quem dorme: não, com a razão;
//  n6 bater à porta: com alguém acordado em casa, ele responde e abre a quem conhece (a porta pela mão dele); trancada, fica
//     trancada; sem ninguém, ninguém abre; dormindo, ninguém responde; a própria porta, a chave;
//  n7 os casos ruins: o save no meio de uma troca (o pedido não acontece e nada se perde), quem ia receber morre no meio, a
//     casa queima com coisas guardadas, a mão do deus segura quem ia receber, outro pega antes a coisa do chão;
//  n9 os usos dos móveis: os gestos das mãos são clipes (o contato dentro do tempo deles); as regras de aquecer, ler, deitar e rezar
//     com a pose; a cama da casa que não é a sua se oferece para descansar, a sua é o sono, a de outra família nunca; a reza num
//     templo dá ao deus o que a dos fiéis dá;
//  n8 o verificador limpo (e as regras novas da interação) e nenhum erro de módulo nem do console.
const path = require('path');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js', 'qa/visual/corpo-qa.js', 'qa/interacao-inv.js'] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | interacao ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const It = G.Itens, Inv = G.Inv, Po = G.Possess, D = G.Depot, V = G.Village, W = G.W, I = G.Interact, In = G.Interiors;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
M.pronto(WORLD); const S0 = G.S; void S0;
const S = () => G.S; const TL = G.Space.TILE; const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const frames = n => { for (let k = 0; k < n; k++) frame(); };
const still = n => { for (let k = 0; k < (n || 2); k++) G.Avatar.frame(RDT); };
const said = []; G.IncUI = G.IncUI || {}; G.IncUI.toast = t => { said.push(t); }; // (the words the hands' acts say: no HUD in Node)
const qk = q => q.sys + '|' + q.msg.replace(/#\d+/g, '#');
let base = new Set(QA.check().filter(q => q.sev <= 2).map(qk));
const novas = () => QA.check().filter(q => (q.sev <= 2 && !base.has(qk(q))) || q.sys === 'interacao').map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const byId = (a, b) => a.id - b.id;
const people = f => [...S().villagers.values()].filter(f).sort(byId);
const grown = o => o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && !o.ug && !o.held && !o.air && !o.inside;
const ask = f => { const it = Po.apply(f); frame(); return it.res || { ok: false, why: 'sem resposta' }; };
const lastN = () => { const L = D.ledger(); return L.length ? L[L.length - 1][0] : 0; };
const lines = (n0, f) => D.ledger().filter(e => e[0] > n0 && (!f || f(e)));
const busyDone = (n) => { for (let k = 0; k < (n || 300) && G.Avatar.busy(); k++) frame(); frames(3); };
const errs = () => { const e = M.erros(); return Object.keys(e.mod).length || e.console.length ? `erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 3).join(' | ')}` : ''; };
// (an open tile of ground near a point, tiles: walkable, out of doors, no building on it)
const openNear = (x, y, r0) => { for (let d = r0 || 0; d < 14; d++) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const px = Math.floor(x + Math.cos(a) * d) + 0.5, py = Math.floor(y + Math.sin(a) * d) + 0.5; if (W.inb(px, py) && W.walkableXY(px, py) && !S().occ[W.idx(px, py)] && !S().treeAt[W.idx(px, py)] && !S().objAt[W.idx(px, py)]) return [px, py]; } return null; };
// (the body put at a point, tiles, facing a point; the world stopped meanwhile)
const st = () => G.Avatar.state();
const at = (x, y, fx, fy) => { if (!G.Avatar.place(x, y)) return false; still(3); const b = st(); b.yaw = Math.atan2((fy - y), (fx - x)); G.Avatar.input.camYaw = b.yaw; still(2); return true; };
// (a thing put in the body's bag by the proof's hand — born of the world, the ledger's «teste»)
const gift = (v, k, n) => god(() => D.make('m:' + v.id, k, n || 1, { code: 'teste', by: v.id }));
// (the people about a point sent off a few strides — those who would be the target instead —, and back after)
const aside = []; const clearAround = (x, y, R, keep) => god(() => { for (const o of S().villagers.values()) if (!keep.includes(o.id) && !o.inside && G.dist(o.x, o.y, x, y) < R) { aside.push([o, o.x, o.y]); o.x += 40; o.y += 40; } for (const a of S().animals.values()) if (G.dist(a.x, a.y, x, y) < R) { aside.push([a, a.x, a.y]); a.x += 40; a.y += 40; } });
const back = () => { god(() => { for (const [o, x, y] of aside) { o.x = x; o.y = y; } }); aside.length = 0; };

// ------------------------------ the body ------------------------------
// (someone of a town with a house of a plan, a store of the people in it, grown and awake: the body lived through every case)
let BODY = null;
for (const set of [...S().settlements.values()].sort(byId)) {
  const st0 = V.dropoffs(set.id).sort(byId)[0]; if (!st0) continue;
  const vs = people(o => o.set === set.id && grown(o) && o.home && Po.can(o).ok && !o.sleeping && In.has(S().buildings.get(o.home)) && V.bedsOf(S().buildings.get(o.home)) > 0);
  if (vs.length) { BODY = { v: vs[0], set, store: st0, fid: V.facOfSet(set.id), home: S().buildings.get(vs[0].home) }; break; }
}
if (!BODY) { ok('n0 um corpo para a prova', false, 'nenhuma pessoa com casa de planta numa cidade com armazém'); process.exit(1); }
const v = BODY.v;
god(() => { G.Vg.endTask(v); v.hunger = 5; v.energy = 100; });
if (!Po.take(v).ok) { ok('n0 encarnar', false, v.name); process.exit(1); }
G.Avatar.attach(v, 0); frames(6);
console.log(`(${v.name}#${v.id}, de ${BODY.set.name}; a casa ${BODY.home.type}#${BODY.home.id}; o armazém ${BODY.store.type}#${BODY.store.id})`);
// (a spot of open ground with room round it, near the body's town: the stage of the cases on the ground)
const SPOT = openNear(BODY.set.cx || v.x, BODY.set.cy || v.y, 3) || [v.x, v.y];

// ================================================================ n1 the verbs of a person
if (on('n1')) {
  const out = [];
  const o = people(x => x.id !== v.id && grown(x) && !x.sleeping && !Po.kin(v, x) && x.age >= 16)[0];
  if (!o) ok('n1 os verbos de uma pessoa', false, 'nenhum estranho');
  else {
    const p = openNear(SPOT[0], SPOT[1], 0); clearAround(p[0], p[1], 3, [v.id, o.id]);
    god(() => { G.Vg.endTask(o); G.Vg.setTask(o, { type: 'idle', wait: 30, pri: 0.3 }); o.x = p[0] + 0.25; o.y = p[1]; o.path = null; o.moving = false; });
    at(p[0], p[1], o.x, o.y);
    const b = I.best(); const of = I.offer(b); const F = of && of.verbs.find(x => x.k === 'outra');
    const empty = !Inv.list(v).length;
    out.push(`E «${b ? b.label : '-'}», F «${F ? F.label + (F.ok ? '' : ' — ' + F.why) : '-'}»`);
    // (with nothing in the bag, no giving on the F: the verb is not said)
    const r1 = b && b.id === 'pessoa' && b.t.o.id === o.id && (empty ? !F : !!F && /^Dar algo a /.test(F.label) && F.ok);
    // (another part's verb for F on a person — the fight's challenge —: it takes the key; the giving goes to the card)
    I.verb('pessoa', { id: 'prova-desafio', k: 'outra', label: 'Desafiar (prova)', run: () => ({ ok: true, msg: 'desafiado' }) });
    const of2 = I.offer(I.best()); const F2 = of2.verbs.find(x => x.k === 'outra'); const dar = of2.more.find(x => x.id === 'dar');
    const rr = I.runVerb('outra'); const rd = I.runVerb('outra', I.best(), 'dar');
    I.unverb('pessoa', 'prova-desafio'); const of3 = I.offer(I.best());
    out.push(`com a 20f: F «${F2 ? F2.label : '-'}», no cartão «${dar ? dar.label : '-'}»; F → ${rr && rr.msg}; o «Dar» pelo cartão → ${rd && rd.panel ? rd.panel.kind + ' #' + rd.panel.id : JSON.stringify(rd)}`);
    const r2 = !!F2 && F2.label === 'Desafiar (prova)' && rr && rr.msg === 'desafiado' && (empty ? !dar : !!dar && rd && rd.panel && rd.panel.kind === 'dar' && rd.panel.id === o.id && of3.verbs.find(x => x.k === 'outra').id === 'dar');
    // (one's own: E held is the hug)
    const k = people(x => x.id !== v.id && Po.kin(v, x) && x.age >= 2 && !x.aboard && !x.held && !x.jail && !x.captive && !x.ug)[0]; let r3 = true;
    if (k) { const p2 = openNear(SPOT[0] + 3, SPOT[1] + 3, 0); clearAround(p2[0], p2[1], 3, [v.id, k.id]); god(() => { G.Vg.endTask(k); k.inside = 0; k.sleeping = false; k.energy = 100; G.Vg.setTask(k, { type: 'idle', wait: 30, pri: 0.3 }); k.x = p2[0] + 0.25; k.y = p2[1]; k.path = null; k.fear = 0; }); at(p2[0], p2[1], k.x, k.y);
      const ob = I.offer(I.best()); const H = ob && ob.verbs.find(x => x.k === 'segurar'); r3 = !!H && /^(Abraçar|Consolar) /.test(H.label); out.push(`${Po.kin(v, k)}: E segurado «${H ? H.label : '-'}»`); }
    else out.push('(sem família por perto: o abraço fica para o navegador)');
    back();
    ok('n1 os verbos de uma pessoa: E conversa, F dá, E segurado abraça os seus; o verbo de outra parte toma o F e o «Dar» vai para o cartão', r1 && r2 && r3, out.join(' · '));
  }
}

// ================================================================ n2 switching between the targets in reach
// (two things let fall before the body — to its left and to its right —, a third behind it: the list of the others)
let GROUND = [];
if (on('n2') || on('n3') || on('n7')) {
  const p = openNear(SPOT[0] + 6, SPOT[1], 0); clearAround(p[0], p[1], 4, [v.id]);
  const k1 = It.keyOf('machado', 'pedra'), k2 = It.keyOf('faca', 'pedra'), k3 = It.keyOf('cesto', It.KINDS.cesto.mats[0]);
  gift(v, k1); gift(v, k2); gift(v, k3);
  // (laid where the body stands, by its own hands: G.Inv.drop — then the body steps back)
  const lay = (x, y, k) => { G.Avatar.place(x, y); still(2); return ask(w => G.Inv.drop(w, k, 1)); };
  const a = lay(p[0] + 0.3, p[1] - 0.25, k1), b = lay(p[0] + 0.3, p[1] + 0.25, k2), c = lay(p[0] - 0.45, p[1], k3);
  GROUND = [a.g, b.g, c.g];
  at(p[0], p[1], p[0] + 1, p[1]);
  if (on('n2')) {
    const sn = I.scan(); const best = I.best(sn); const L = I.candidates(sn); const L2 = I.candidates();
    const keys = L.map(c2 => c2.key).join(','), keys2 = L2.map(c2 => c2.key).join(',');
    const mine = L.filter(c2 => c2.id === 'chao'); const order = L.map(c2 => `${c2.label} (${(c2.ang * 57.3).toFixed(0)}°)`).join(' · ');
    const firstIsBest = !!best && L.some(c2 => c2.first && c2.key === I.keyOf(best));
    const leftRight = L.every((c2, i) => i === 0 || L[i - 1].ang <= c2.ang + 1e-9 || L[i - 1].t.here || L[i - 1].p.here);
    const things = new Set(L.map(c2 => c2.thing)); const oneEach = things.size === L.length;
    // (a tame beast in reach is one thing, whoever offers it)
    let beast = '(sem bicho manso perto)';
    const pet = [...S().animals.values()].find(x => { const d = G.Animals.DEF[x.kind]; return !x.dead && !x.held && d && d.cls !== 'water' && d.cls !== 'air' && (x.dom || x.tamed || d.dom || d.pet); });
    let beastOne = true;
    if (pet) { const q = [[0.28, 0], [-0.28, 0], [0, 0.28], [0, -0.28]].map(([dx, dy]) => [pet.x + dx, pet.y + dy]).find(([x, y]) => W.inb(x, y) && W.walkableXY(x, y)); if (q) { at(q[0], q[1], pet.x, pet.y); const C = I.candidates(); const n = C.filter(c2 => c2.thing === 'a' + pet.id).length; const offers = I.scan().all.filter(e => e.t.a === pet).length; beastOne = n <= 1; beast = `o ${G.Animals.DEF[pet.kind].name}: ${offers} ofertas, ${n} entrada na lista`; } at(p[0], p[1], p[0] + 1, p[1]); }
    ok('n2 a troca de alvo: a lista começa pelo I.best, vai da esquerda para a direita, uma entrada por coisa, os nomes firmes', firstIsBest && mine.length >= 2 && leftRight && oneEach && keys === keys2 && beastOne,
      `${L.length} ao alcance: ${order}; I.best «${best ? best.label : '-'}»; ${beast}`);
  }
}

// ================================================================ n3 picking up and letting go
if (on('n3') && GROUND.length) {
  const out = []; const p = [v.x, v.y];
  const find = g => I.candidates().find(c2 => c2.id === 'chao' && c2.t.g === g);
  const c1 = find(GROUND[0]); const n0 = lastN(); const d0 = (S().avatar.deeds.apanhou || 0); const k1 = c1 ? c1.t.k : null; const had = k1 ? Inv.count(v, k1) : 0;
  if (c1) { I.run(I.asChoice(c1)); busyDone(); }
  const got = k1 && Inv.count(v, k1) === had + 1 && !(S().loose || []).some(o => o.id === GROUND[0]);
  const led = lines(n0, e => e[8] === 'apanhou' && e[9] === v.id && e[3] === 'g:' + GROUND[0] && e[4] === 'm:' + v.id);
  const d1 = S().avatar.deeds.apanhou || 0; out.push(`E «${c1 ? c1.label : '-'}»: na mochila ${got}, no livro ${led.length}, feitos ${d0} → ${d1}`);
  // (E held: picked and in the hand)
  { const g = (S().loose || []).find(o => o.id === GROUND[1]); if (g) at(g.x - 0.2, g.y, g.x, g.y); }
  const c2 = find(GROUND[1]); let held = false;
  if (c2) { const of = I.offer(I.asChoice(c2)); const H = of.verbs.find(x => x.k === 'segurar'); out.push(`E segurado «${H ? H.label : '-'}»`); I.runVerb('segurar', I.asChoice(c2)); busyDone(); held = Inv.held(v).mao === c2.t.k; out.push(`na mão: ${Inv.held(v).mao}`); }
  // (and let go again: on the ground, no people's mark — the town's porters leave it —, the body's own E picks it up)
  const k3 = k1; const r = ask(w => G.Inv.drop(w, k3, 1)); const lo = (S().loose || []).find(o => o.id === r.g);
  out.push(`largado: ${r.ok ? 'no chão #' + r.g + (lo && !lo.fac ? ' sem a marca do povo' : '') : r.why}`);
  void p;
  ok('n3 pegar e largar: o E pega o que está no chão (o passo, a mão, o livro), o E segurado pega e segura, o que se larga fica no chão', got && led.length === 1 && d1 === d0 + 1 && held && r.ok && !!lo && !lo.fac, out.join(' · '));
  if (r.ok) GROUND[0] = r.g;
}

// ================================================================ n4 the things kept, by the doors of the world
if (on('n4')) {
  const out = []; const bad = []; const H = BODY.home; const st0 = BODY.store; const fid = BODY.fid;
  // (at the house's door: put in, taken back)
  const hd = G.Vg.door(H); at(hd[0], hd[1], H.x + H.w / 2, H.y + H.h / 2);
  const k = It.keyOf('faca', 'pedra'); if (!Inv.count(v, k)) gift(v, k);
  const n0 = lastN(); const a = ask(w => I.stash(w, 'h:' + H.id, k, 1)); const inH = D.get('h:' + H.id, k);
  const b = ask(w => I.fetch(w, 'h:' + H.id, k, 1)); const back2 = Inv.count(v, k);
  const led = lines(n0, e => (e[3] === 'm:' + v.id && e[4] === 'h:' + H.id) || (e[3] === 'h:' + H.id && e[4] === 'm:' + v.id));
  out.push(`casa: guardar ${a.ok ? 'sim' : a.why} (na casa ${inH}), tirar ${b.ok ? 'sim' : b.why}, ${led.length} linhas no livro`);
  if (!a.ok || !b.ok || inH < 1 || back2 < 1 || led.length < 2) bad.push('a casa');
  // (another family's house: refused, with the reason)
  const other = [...S().buildings.values()].filter(x => x.built && x.id !== H.id && D.exists('h:' + x.id) && x.set === H.set).sort(byId)[0];
  if (other) { const od = G.Vg.door(other); at(od[0], od[1], other.x, other.y); const r = ask(w => I.stash(w, 'h:' + other.id, k, 1)); out.push(`casa alheia: ${r.ok ? 'GUARDOU' : r.why}`); if (r.ok) bad.push('a casa de outra família'); }
  // (the people's store: a tool of what it has, and back as its good)
  const sd = G.Vg.door(st0); at(sd[0], sd[1], st0.x + st0.w / 2, st0.y + st0.h / 2);
  // (a stone pick is made of the store's stone and wood — what a thing is made of comes out of the store and goes back: 20h, D-442)
  const pk0 = It.keyOf('picareta', 'pedra'); const mats = (It.feitoDe(pk0) || []).map(x => x.k); god(() => { for (const g of mats) D.make('f:' + fid, g, 4, { code: 'teste', part: true }); });
  const amt = () => mats.map(g => Math.round(D.get('f:' + fid, g) * 100) / 100).join('/');
  const t0 = amt(); const c = ask(w => I.fetch(w, 'f:' + fid, pk0, 1)); const t1 = amt();
  const pk = c.ok ? c.k : null; const e2 = pk ? ask(w => I.stash(w, 'f:' + fid, pk, 1)) : { ok: false, why: '-' }; const t2 = amt();
  out.push(`armazém: pegar ${c.ok ? pk : c.why} (${mats.join('/')} ${t0} → ${t1}), devolver ${e2.ok ? 'sim' : e2.why} (→ ${t2}; nenhuma coisa no estoque: ${!Object.keys(G.Fac.get(fid).stock).some(x => It.THINGS.has(x))})`);
  if (!c.ok || t1 === t0 || !e2.ok || t2 !== t0 || Object.keys(G.Fac.get(fid).stock).some(x => It.THINGS.has(x))) bad.push('o armazém');
  // (the furniture says whose it keeps: a house's pieces the house, a store's bins the people's, a shelf the building's)
  const seen = {}; for (const B of [...S().buildings.values()].filter(x => x.built && In.has(x)).sort(byId).slice(0, 400)) { const pl = G.Space.planNow(B); if (!pl || !pl.items) continue; for (const it of pl.items) { if (!it.store) continue; const ref = I.holderOf(B, it); const want = it.store.dep === 'casa' ? 'h' : it.store.dep === 'povo' ? 'f' : ['b', 'z']; const got = ref ? ref.split(':')[0] : null; seen[it.store.dep] = (seen[it.store.dep] || 0) + 1; if (ref && !(Array.isArray(want) ? want.includes(got) : got === want)) bad.push(`o móvel ${it.kind} de ${B.type}#${B.id} → ${ref}`); if (ref && !D.exists(ref)) bad.push(`${ref} não existe`); } }
  out.push(`móveis que guardam: ${JSON.stringify(seen)}`);
  // (and indoors, the provider of the furniture that keeps: its pieces in reach, by the body's eyes indoors — the proof's hand on
  // the eyes alone: Avatar.indoors is the controller's, and the body is not walked in)
  const pl = G.Space.planNow(H); const piece = pl && pl.items ? pl.items.find(it => it.store && it.store.dep === 'casa') : null;
  if (piece) { const ind0 = G.Avatar.indoors; const ctx0 = I.ctx; const X = H.x * TL + (piece.r[0] + piece.r[2]) / 2, Z = H.y * TL + (piece.r[1] + piece.r[3]) / 2;
    G.Avatar.indoors = () => ({ b: H, p: pl, lv: piece.lv }); I.ctx = () => ({ v, X: X - 0.9, Y: 0, Z, yaw: 0, x: (X - 0.9) / TL, y: Z / TL });
    const ts = I.list.find(q => q.id === 'guardados').find(I.ctx()); const tg = ts.find(t => t.it === piece);
    const lb = tg ? I.list.find(q => q.id === 'guardados').label(I.ctx(), tg) : '-'; const cn = tg ? I.list.find(q => q.id === 'guardados').can(I.ctx(), tg) : { ok: false };
    G.Avatar.indoors = ind0; I.ctx = ctx0; out.push(`dentro: «${lb}» → ${tg ? tg.ref : '-'} (${cn.ok ? 'pode' : cn.why})`); if (!tg || tg.ref !== 'h:' + H.id || !cn.ok) bad.push('o móvel da casa dentro'); }
  ok('n4 os guardados pelas portas do mundo: a casa, o armazém (uma ferramenta do que tem, e de volta como o seu bem), a casa alheia, os móveis de cada um', !bad.length, out.join(' · ') + (bad.length ? ' — FALHOU: ' + bad.join(', ') : ''));
}

// ================================================================ n5 giving
if (on('n5')) {
  const out = []; const bad = []; const o = people(x => x.id !== v.id && grown(x) && !x.sleeping && x.age >= 16 && Inv.room(x, It.keyOf('faca', 'pedra')) >= 1)[0];
  if (!o) ok('n5 dar', false, 'ninguém para receber');
  else {
    const p = openNear(SPOT[0] - 5, SPOT[1], 0); clearAround(p[0], p[1], 3, [v.id, o.id]); at(p[0], p[1], p[0] + 1, p[1]);
    god(() => { G.Vg.endTask(o); G.Vg.setTask(o, { type: 'idle', wait: 30, pri: 0.3 }); o.x = p[0] + 0.3; o.y = p[1]; o.path = null; o.moving = false; });
    const k = It.keyOf('faca', 'pedra'); if (!Inv.count(v, k)) gift(v, k);
    const n0 = lastN(); const c0 = Inv.count(o, k), m0 = Inv.count(v, k); const d0 = S().avatar.deeds.dadiva || 0; const kn0 = Po.knows.person(v, o);
    const r = ask(w => I.give(w, o, k, 1));
    const led = lines(n0, e => e[8] === 'dar' && e[3] === 'm:' + v.id && e[4] === 'm:' + o.id);
    const talk = G.Talk ? G.Talk.list.filter(x => x.id === o.id).map(x => x.txt) : [];
    out.push(`a ${o.name}: ${r.ok ? 'dado' : r.why} (${m0} → ${Inv.count(v, k)}, ${c0} → ${Inv.count(o, k)}), ${led.length} linha «dar», feitos ${d0} → ${S().avatar.deeds.dadiva || 0}, conhecia ${kn0} → ${Po.knows.person(v, o)}, disse «${talk.slice(-1)[0] || ''}»`);
    if (!r.ok || Inv.count(o, k) !== c0 + 1 || Inv.count(v, k) !== m0 - 1 || led.length !== 1 || (S().avatar.deeds.dadiva || 0) !== d0 + 1 || !(Po.knows.person(v, o) >= 1) || !talk.length) bad.push('o dar');
    // (to a baby, to someone far, to someone asleep: refused with the reason)
    const baby = people(x => x.age < 2 && !x.inside)[0]; if (baby) { const g = I.canGive(v, baby); out.push(`ao bebê: ${g.why}`); if (g.ok) bad.push('o bebê'); }
    gift(v, k); god(() => { o.x += 3; }); const far = I.canGive(v, o); out.push(`longe: ${far.why}`); if (far.ok) bad.push('longe');
    god(() => { o.x -= 3; o.sleeping = true; }); const sl = I.canGive(v, o); out.push(`dormindo: ${sl.why}`); if (sl.ok) bad.push('dormindo'); god(() => { o.sleeping = false; });
    back();
    ok('n5 dar: a coisa vai de uma mochila para a outra (o livro), os dois se conhecem, quem recebe agradece; ao bebê, longe, dormindo: não', !bad.length, out.join(' · '));
  }
}

// ================================================================ n6 knocking at a door
if (on('n6')) {
  const out = []; const bad = [];
  // (a house of a plan of someone else's family, with someone of it — the case puts them in and takes them out)
  const H = [...S().buildings.values()].filter(x => x.built && x.id !== v.home && In.has(x) && G.BDEF[x.type] && G.BDEF[x.type].housing && G.Space.planNow(x) && people(o => o.home === x.id && o.age >= 16).length).sort(byId)[0];
  if (!H) ok('n6 bater à porta', false, 'nenhuma casa alheia com morador');
  else {
    const pl = G.Space.planNow(H); const d = pl.doors.find(q => q.kind !== 'vao' && q.outer) || pl.doors.find(q => q.kind !== 'vao'); const r0 = people(o => o.home === H.id && o.age >= 16)[0];
    const others = people(o => o.home === H.id && o.id !== r0.id);
    const set = (inside, sleeping) => god(() => { for (const o of others) { o.inside = 0; } G.Vg.endTask(r0); r0.inside = inside ? H.id : 0; r0.sleeping = !!sleeping; r0.energy = sleeping ? 3 : 100; r0.fear = 0; In.useDoor(H, d.id, 'destrancar', r0); In.useDoor(H, d.id, 'fechar', r0); });
    const knock = () => ask(w => I.knocked(w, H, d));
    set(false); const a = knock(); out.push(`vazia: «${a.msg}»`); if (!a.ok || !a.none) bad.push('vazia');
    set(true, true); const b = knock(); out.push(`dormindo: «${b.msg}»`); if (!b.ok || !b.asleep) bad.push('dormindo');
    set(true, false); const known = Po.knows.person(r0, v) > 0 || !!Po.kin(r0, v); const c = knock(); const s1 = In.doorState(H, d.id).state; out.push(`acordad${r0.g === 'f' ? 'a' : 'o'} (${known ? 'conhece o corpo' : 'não conhece'}): «${c.msg}», a porta ${s1}`);
    if (!c.ok || c.by !== r0.id || s1 !== 'aberta') bad.push('acordado');
    set(true, false); god(() => In.useDoor(H, d.id, 'trancar', r0)); const e = knock(); const s2 = In.doorState(H, d.id).state; out.push(`trancada: «${e.msg}», a porta ${s2}`); if (!e.ok || s2 !== 'trancada') bad.push('trancada');
    set(false); god(() => { r0.inside = 0; });
    // (one's own door: the key — locked by one's own hand, in the world's step)
    const hp = G.Space.planNow(BODY.home); const hdr = hp && hp.doors.find(q => q.kind !== 'vao'); let own = '(sem porta)';
    if (hdr) { const lk = ask(w => In.useDoor(BODY.home, hdr.id, 'trancar', w)); const s3 = In.doorState(BODY.home, hdr.id).state; const ul = ask(w => In.useDoor(BODY.home, hdr.id, 'destrancar', w)); own = `a própria: trancar ${lk.ok ? s3 : lk.why}, destrancar ${ul.ok ? In.doorState(BODY.home, hdr.id).state : ul.why}`; if (!lk.ok || s3 !== 'trancada' || !ul.ok) bad.push('a própria porta'); }
    out.push(own);
    ok('n6 bater à porta: vazia ninguém abre, dormindo ninguém responde, acordado responde e abre, trancada fica trancada; a própria, a chave', !bad.length, out.join(' · '));
  }
}

// ================================================================ n7 the bad cases
if (on('n7')) {
  const out = []; const bad = []; const k = It.keyOf('faca', 'pedra');
  // (a) the save in the middle of a giving: asked, saved and loaded before the world's step — it never happened, nothing lost
  { const o = people(x => x.id !== v.id && grown(x) && !x.sleeping)[0]; god(() => { o.x = v.x + 0.3; o.y = v.y; });
    if (!Inv.count(v, k)) gift(v, k); const tot0 = D.total(k); const it = Po.apply(w => I.give(w, o, k, 1)); M.salvarCarregar(); frames(4);
    const v2 = G.S.villagers.get(v.id); const tot1 = D.total(k); const still2 = !!(G.S.avatar && G.S.avatar.id === v.id);
    out.push(`save no meio: o pedido ${it.res ? (it.res.ok ? 'FEITO' : 'recusado') : 'não feito'}, ${k} no mundo ${tot0} → ${tot1}, o corpo ${still2 ? 'continua' : 'SAIU'}`);
    if ((it.res && it.res.ok) || Math.abs(tot1 - tot0) > 1e-9 || !v2 || !still2) bad.push('o save no meio');
    if (!G.Avatar.state()) { G.Avatar.attach(G.S.villagers.get(v.id), 0); frames(3); } }
  const V0 = G.S.villagers.get(v.id);
  // (b) the one to receive dies in the middle: asked, and dead before the world's step — refused, the thing still the body's
  { const o = people(x => x.id !== V0.id && grown(x) && !x.sleeping)[0]; god(() => { o.x = V0.x + 0.3; o.y = V0.y; }); if (!Inv.count(V0, k)) gift(V0, k);
    const m0 = Inv.count(V0, k), tot0 = D.total(k); const it = Po.apply(w => { const t = G.S.villagers.get(o.id); return t ? I.give(w, t, k, 1) : { ok: false, why: 'Não está mais aqui.' }; }); god(() => V.kill(o, 'old')); frame();
    out.push(`quem ia receber morre: ${it.res ? (it.res.ok ? 'DADO' : it.res.why) : 'sem resposta'}, a mochila ${m0} → ${Inv.count(V0, k)}, no mundo ${tot0} → ${D.total(k)}`);
    if (!it.res || it.res.ok || Inv.count(V0, k) !== m0 || Math.abs(D.total(k) - tot0) > 1e-9) bad.push('a morte no meio'); }
  // (c) the house burns with things kept in it: the holder is gone, the hands are refused cleanly
  { const H = G.S.buildings.get(BODY.home.id); if (H) { const hd = G.Vg.door(H); at(hd[0], hd[1], H.x, H.y); if (!Inv.count(V0, k)) gift(V0, k); const a = ask(w => I.stash(w, 'h:' + H.id, k, 1));
      god(() => V.damageBuilding(H, 1e6, 'fire')); frames(2); const gone = !D.exists('h:' + H.id); const b = ask(w => I.fetch(w, 'h:' + H.id, k, 1));
      out.push(`a casa queima: guardou ${a.ok}, a casa ${gone ? 'não existe mais' : 'AINDA EXISTE'} (${(G.S.buildings.get(H.id) || { type: '-' }).type}), tirar → ${b.ok ? 'TIROU' : b.why}`);
      if (!a.ok || (gone && b.ok)) bad.push('a casa queimada'); } }
  // (d) the god's hand holds the one to receive: no giving to someone in the air
  { const o = people(x => x.id !== V0.id && grown(x) && !x.sleeping)[0]; god(() => { o.x = V0.x + 0.3; o.y = V0.y; G.Vg.endTask(o); o.held = true; });
    const g = I.canGive(V0, o); out.push(`na mão do deus: ${g.ok ? 'DEU' : g.why}`); if (g.ok) bad.push('a mão do deus'); god(() => { o.held = false; }); }
  // (e) another picks up first the thing on the ground: the body's stoop gets there and finds nothing — said so, nothing doubled
  { const p = openNear(V0.x + 2, V0.y, 0); G.Avatar.place(p[0], p[1]); still(2); if (!Inv.count(V0, k)) gift(V0, k); const r = ask(w => G.Inv.drop(w, k, 1));
    const o = people(x => x.id !== V0.id && grown(x) && !x.sleeping && Inv.room(x, k) >= 1)[0]; at(p[0] - 0.25, p[1], p[0], p[1]);
    const c = I.candidates().find(q => q.id === 'chao' && q.t.g === r.g); const m0 = Inv.count(V0, k), o0 = Inv.count(o, k), tot0 = D.total(k); said.length = 0;
    if (c) { I.run(I.asChoice(c)); god(() => { o.x = p[0]; o.y = p[1] + 0.2; G.Inv.pick(o, r.g); }); busyDone(); }
    out.push(`outro pega antes: ${c ? 'o corpo foi pegar' : 'NÃO ACHOU A COISA'}; o corpo ${m0} → ${Inv.count(V0, k)}, ${o.name} ${o0} → ${Inv.count(o, k)}, no mundo ${tot0} → ${D.total(k)}; disse «${said.join(' / ')}»`);
    if (!c || Inv.count(V0, k) !== m0 || Inv.count(o, k) !== o0 + 1 || Math.abs(D.total(k) - tot0) > 1e-9 || !said.some(t => /Alguém pegou primeiro/.test(t))) bad.push('outro pega antes'); }
  ok('n7 os casos ruins: o save no meio, quem ia receber morre, a casa queima, a mão do deus, outro pega antes', !bad.length, out.join(' · ') + (bad.length ? ' — FALHOU: ' + bad.join(', ') : ''));
}

// ================================================================ n9 the uses of the furniture
// (the rules of the uses — aquecer, ler, deitar, rezar —: where each is offered, what stops it, what the world does at the take,
// the body's pose there a clip of the interaction's; the prayer at a temple's place gives the god what the faithful's does)
if (on('n9')) {
  const out = []; const bad = []; const V0 = G.S.villagers.get(v.id); const H = G.S.buildings.get(V0.home);
  // (the gestures of the hands are clips, registered with their contact inside their time)
  const Q = Array.isArray(G.ANIM_CLIPS) ? G.ANIM_CLIPS : []; const ids = Q.map(e => e[0]);
  for (const id of ['apanhar', 'bater', 'abrir', 'dar', 'aquecer', 'ler']) { const e = Q.find(q => q[0] === id); if (!e || !(e[1].events.contact > 0 && e[1].events.contact < 1) || !(e[1].acts || []).includes(id)) bad.push('o clipe ' + id); }
  out.push(`clipes: ${ids.filter(i => ['apanhar', 'bater', 'abrir', 'dar', 'aquecer', 'ler'].includes(i)).join(', ')}`);
  for (const u of ['aquecer', 'ler', 'deitar', 'rezar']) { const r = I.useRuleOf(u); if (!r || !r.label || !r.st) bad.push('a regra ' + u); else if (r.st !== 'sleep' && r.st !== 'pray' && !ids.includes(r.st)) bad.push(`a pose ${r.st} de ${u} não é clipe`); }
  // (a bed: in one's own house, a bed not one's own is offered to rest; one's own is the sleep's; another family's, never)
  if (H && In.has(H)) {
    const bd = In.bedOf(V0); const beds = In.slots(H, 'deitar'); const dr = I.useRuleOf('deitar'); const ctx = { v: V0 };
    const own = beds.find(s => bd && s.item === bd.item); const other = beds.find(s => !bd || s.item !== bd.item);
    if (own && dr.show(ctx, H, { it: own.item, b: H })) bad.push('a própria cama oferecida para descansar');
    if (other && !dr.show(ctx, H, { it: other.item, b: H })) bad.push('a outra cama da casa não oferecida');
    out.push(`camas da casa: ${beds.length} (a própria ${own ? 'é o sono' : '-'}, outra ${other ? 'para descansar' : '-'})`);
    const H2 = [...G.S.buildings.values()].find(b => b.id !== H.id && In.has(b) && In.slots(b, 'deitar').length); if (H2) { const c = dr.can(ctx, { b: H2 }); const op = god(() => dr.op(V0, H2, {})); out.push(`cama de outra família: ${c.why}`); if (c.ok || op.ok) bad.push('a cama de outra família'); }
    const opH = god(() => dr.op(V0, H, {})); if (!opH.ok) bad.push('descansar na própria casa');
  }
  // (the fire: the words of the cold where it is cold; reading: the library's words in a library)
  { const r = I.useRuleOf('aquecer').op(V0, H || {}, {}); out.push(`junto ao fogo: «${r.msg}»`); if (!r.ok || !r.msg) bad.push('aquecer'); }
  // (the prayer at a temple's place — the rule's act —: the five seconds of the world and the faith given, as at the temple's door)
  const T = [...G.S.buildings.values()].filter(b => b.built && b.type === 'temple' && b.set === V0.set).sort(byId)[0] || [...G.S.buildings.values()].filter(b => b.built && b.type === 'temple').sort(byId)[0];
  if (T) { const td = G.Vg.door(T); at(td[0], td[1], T.x + T.w / 2, T.y + T.h / 2); god(() => { if (G.S.faith > 900) G.S.faith = 500; }); const f0 = G.S.faith, r0 = S().avatar.deeds.reza || 0; // (the faith under its cap, by the proof's hand)
    I.useRuleOf('rezar').act(I.ctx(), T); busyDone(900); out.push(`a reza no templo: a fé ${f0.toFixed(2)} → ${G.S.faith.toFixed(2)}, rezas ${r0} → ${S().avatar.deeds.reza || 0}`);
    if (!(G.S.faith > f0) || (S().avatar.deeds.reza || 0) !== r0 + 1) bad.push('a reza'); }
  else out.push('(sem templo: a reza fica para outro mundo)');
  ok('n9 os usos dos móveis: os clipes das mãos, as regras com a pose, a cama da casa e a de outra família, o fogo, a reza no templo', !bad.length, out.join(' · ') + (bad.length ? ' — FALHOU: ' + bad.join(', ') : ''));
}

// ================================================================ n8 the checker
{ const nv = novas(); const e = errs(); ok('n8 o verificador limpo (com as regras da interação) e nenhum erro', !nv.length && !e, nv.length ? nv.slice(0, 4).join(' · ') : e || 'limpo'); }
console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
