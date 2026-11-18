// sociedade-corpo: node qa/sociedade-corpo.js [mundo=cidade] [ONLY=c1,c2,…] — a sociedade com o corpo do jogador (22b, as fases 3, 4 e 4b),
// em Node, num mundo pronto, com o corpo encarnado (o molde do qa/interacao.js):
//   c1 a faixa do corpo: o que a pessoa vivida sabe vira a linha «Dizem que…» na versão dela, o deus não ouve boatos, a crônica de
//      outra cidade só chega pela conversa (knows.hearsNow) e a da própria cidade na hora
//   c2 os verbos na pessoa: os do corpo estão no cartão (os botões, as teclas de número), um a tecla; um verbo pedido pelas mãos só
//      muda o mundo no passo dele (Possess.apply), e a resposta é a do mundo
//   c3 cumprimentar e elogiar: os dois lados do laço, o feito contado; o desconfiado desconfia do elogio
//   c4 beijar: o par aceita; o estranho sem atração recusa; o agressivo empurra; na frente de muita gente o tímido se afasta; o beijo de quem tem par, visto pelo par, é traição (a marca, o boato, o casal na porta)
//   c5 insultar e discutir: a marca de quem insultou, quem viu pensa pior; o agressivo parte para cima (uma briga do mundo, um crime);
//      o amigo do corpo por perto toma o seu lado (a marca «defendeu»)
//   c6 convidar para beber: a rodada é do corpo pelo livro («rodada»), o convidado vai à taverna; sem moedas, não; o corpo deixado
//      no meio do convite (o deus volta ao céu) não deixa nada pendurado
//   c7 pedir em casamento: com atração e afeto, o casal pela porta (Vg.pair, «pedido»); sem, a recusa
//   c8 fazer as pazes: quem perdoa tira as marcas leves; o rancoroso não
//   c9 perguntar o que se diz: o boato que o outro sabe passa ao corpo por nome, na versão do outro
//   c10 adotar (4b): o órfão vai morar na casa do corpo, vai junto com a família, é família para os laços e para o corpo; a criança
//      que tem medo do corpo não vai
//   c11 o dia da cidade dá o órfão (4b): a quem mais gosta dele e tem casa (a família antes); morto quem o criava, outro o cria; o
//      save guarda; o corpo nunca é escolhido pelo dia
//   c12 o corpo morre no meio de uma resposta: quem respondia volta ao seu dia
// Erro de módulo ou aviso do jogo é falha.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js', 'qa/sociedade-inv.js'] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (k, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | sociedade-corpo ${k} | ${info}`); if (!c) fails.push(k); };
const Po = G.Possess, I = G.Interact, L = G.Lacos, B = G.Boatos, SV = G.SocVerbos, Tu = G.Tutela, D = G.Depot;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const RDT = 1 / 30; const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); }; const frames = n => { for (let k = 0; k < n; k++) frame(); };
const still = n => { for (let k = 0; k < (n || 2); k++) G.Avatar.frame(RDT); };
G.IncUI = G.IncUI || {}; G.IncUI.toast = () => { };
const soc = () => QA.check().filter(q => q.sys === 'sociedade' && q.sev <= 3);
const byId = (a, b) => a.id - b.id; const people = f => [...G.S.villagers.values()].filter(f).sort(byId);
const free = o => o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && !o.ug && !o.held && !o.air && !o.inside && !o.sleeping;
const openNear = (x, y) => { for (let d = 0; d < 14; d++) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const px = Math.floor(x + Math.cos(a) * d) + 0.5, py = Math.floor(y + Math.sin(a) * d) + 0.5; if (G.W.walkableXY(Math.floor(px), Math.floor(py)) && !G.W.blocked(G.W.idx(Math.floor(px), Math.floor(py)))) return [px, py]; } return null; };
const at = (x, y, fx, fy) => { if (!G.Avatar.place(x, y)) return false; still(3); const b = G.Avatar.state(); b.yaw = Math.atan2(fy - y, fx - x); G.Avatar.input.camYaw = b.yaw; still(2); return true; };
const busyDone = () => { for (let k = 0; k < 300 && G.Avatar.busy(); k++) frame(); frames(2); };
// (the body and the other face to face on open ground, the others of the place a few strides off; the other idle)
const aside = []; const back = () => { god(() => { for (const [o, x, y] of aside) { o.x = x; o.y = y; } }); aside.length = 0; };
function face2(v, o) {
  const p = openNear(v.x, v.y) || [v.x, v.y];
  god(() => { for (const q of G.S.villagers.values()) if (q !== v && q !== o && !q.inside && G.dist(q.x, q.y, p[0], p[1]) < 4) { aside.push([q, q.x, q.y]); q.x += 40; } G.Vg.endTask(o); G.Vg.setTask(o, { type: 'idle', wait: 30, pri: 0.3 }); o.x = p[0] + 0.3; o.y = p[1]; o.path = null; o.moving = false; o.sleeping = false; o.inside = 0; });
  at(p[0], p[1], o.x, o.y);
}
// (a verb of the body on the one it faces, by the card's way: its id among the verbs of the target; the world's step answers)
function verbo(id) {
  const b = I.best(); if (!b || b.id !== 'pessoa') return { ok: false, msg: 'sem alvo (' + (b ? b.id + ' ' + b.label : 'nada') + ')' };
  const r = I.runVerb('outra', b, 'soc-' + id); if (!r) return { ok: false, msg: 'sem verbo' };
  if (!r.ok) return r;
  for (let k = 0; k < 20 && r.ask && !r.ask.res; k++) frame();
  busyDone(); return { ok: true, res: r.ask && r.ask.res, msg: r.msg };
}
M.pronto(WORLD); const S = () => G.S;
// the body: a grown one with a house, in a town with others
// (the world to the morning first: people awake and out of doors)
{ let k = 0; while (k++ < 300 && (G.isNight() || G.isEvening() || G.S.time < 0.15)) M.viver(1); }
let v = null; for (const set of [...S().settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id)) { const vs = people(o => o.set === set.id && o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && o.home && S().buildings.get(o.home) && G.Village.bedsOf(S().buildings.get(o.home)) > 0); if (vs.length > 3) { v = vs[0]; break; } }
if (v) god(() => { G.Vg.endTask(v); v.sleeping = false; v.inside = 0; });
if (!v || !Po.take(v).ok) { ok('c0 encarnar', false, v ? `${v.name}: ${JSON.stringify(Po.can(v))}` : 'ninguém'); process.exit(1); }
god(() => { v.hunger = 5; v.energy = 100; }); G.Avatar.attach(v, 0); frames(6);
const town = S().settlements.get(v.set); const BODY0 = v;
console.log(`(${v.name}#${v.id}, de ${town.name})`);
const avail = o => o.age >= 18 && o.age < 60 && !o.captive && !o.jail && !o.aboard && !o.ug && !o.held && !o.air;
const others = () => people(o => o !== v && o.set === v.set && avail(o) && !Po.kin(v, o));

if (on('c1')) {
  const K = Po.knows; const A = town; const Z = [...S().settlements.values()].find(t => t.id !== A.id && G.dist(t.cx, t.cy, A.cx, A.cy) > 20);
  const folk = people(o => o.set === A.id && o.age >= 18 && o !== v);
  const r = god(() => B.nasce('homicidio', { set: A.id, a: folk[0].id, q: folk[1].id, n: { a: folk[0].name, s: A.name }, p0: 1000 }));
  const p = folk.find(o => o !== folk[0] && o !== folk[1] && B.sabe(o, r) === 'boato'); const line = p ? K.boatos(p).find(n => n.id === r.id) : null;
  const god0 = K.boatos(null);
  const h = Z ? [K.hearsNow(p, { txt: 'x', x: Z.cx, y: Z.cy }), K.hearsNow(p, { txt: 'x', x: A.cx, y: A.cy }), K.hearsNow(p, { txt: 'x' }), K.hearsNow(null, { txt: 'x', x: Z.cx, y: Z.cy })] : [false, true, true, true];
  ok('c1 a-faixa-do-corpo', !!line && line.txt.startsWith('Dizem que ') && line.txt.includes(folk[1].name) && !god0.length && h[0] === false && h[1] && h[2] && h[3],
    `${p ? p.name : '—'} ouve: «${line ? line.txt : '—'}»; o deus: ${god0.length} boatos; a crônica de ${Z ? Z.name : 'outra cidade'} na hora: ${h[0] ? 'SIM' : 'não (só pela conversa)'}, a da própria cidade: ${h[1] ? 'sim' : 'NÃO'}`);
}

if (on('c2')) {
  const o = others()[0]; face2(v, o);
  const of = I.offer(I.best()); const mine = [...of.verbs, ...of.more].filter(x => /^soc-/.test(x.id));
  const pend0 = Po.pending(); const af0 = (L.sente(o, v) || { afeto: 0 }).afeto;
  const b = I.best(); const r = I.runVerb('outra', b, 'soc-cumprimentar'); const queued = Po.pending() > pend0; const af1 = (L.sente(o, v) || { afeto: 0 }).afeto;
  for (let k = 0; k < 20 && r && r.ask && !r.ask.res; k++) frame(); busyDone(); const af2 = (L.sente(o, v) || { afeto: 0 }).afeto;
  ok('c2 os-verbos-na-pessoa', mine.length >= 8 && queued && af1 === af0 && af2 !== af0 && !!(r && r.ask && r.ask.res && r.ask.res.ok) && /cumprimento/.test(r.msg),
    `${mine.length} verbos do corpo em ${o.name} (${mine.map(x => x.label.split(' ')[0]).join(', ')}); pedido: ${queued ? 'na fila do mundo' : 'FEITO NA HORA'}, o laço ${af0} → ${af1} (antes do passo) → ${af2}; «${r ? r.msg : '—'}»`);
  back();
}

if (on('c3')) {
  const o = others()[1]; face2(v, o); const d0 = (S().avatar.deeds || {}).elogio || 0;
  const Z0 = { afeto: 0, respeito: 0, confianca: 0 }; const b0 = L.sente(o, v) || Z0; const r = verbo('elogiar'); const b1 = L.sente(o, v) || Z0;
  const believes = /gosta/.test(r.msg); const d1 = (S().avatar.deeds || {}).elogio || 0;
  ok('c3 elogiar', r.ok && d1 === d0 + 1 && (believes ? b1.respeito > b0.respeito : b1.confianca < b0.confianca + 1), `${o.name}: «${r.msg}» (respeito ${b0.respeito} → ${b1.respeito}, confiança ${b0.confianca} → ${b1.confianca}; desconfiado ${G.Indole.faceta(o, 'desconfiado').toFixed(2)})`);
  back();
}

if (on('c4')) {
  const out = []; let good = true;
  // a stranger with no attraction: the kiss refused
  const st = others().find(o => o.g !== v.g && !(L.sente(o, v) || { atracao: 0 }).atracao && o.id !== (others()[1] || {}).id); if (st) { face2(v, st); const r = verbo('beijar'); out.push(`${st.name}: «${r.msg}»`); good = good && r.ok && /recusa|empurra|afasta/.test(r.msg) && !L.lembra(st, v.id).some(m => m[0] === 'beijou'); back(); }
  // one drawn to the body: the kiss
  const lv = others().find(o => o.g !== v.g && o !== st && !o.partner && o.id !== (others()[1] || {}).id) || others().find(o => o.g !== v.g && o !== st);
  if (lv) { god(() => { for (let k = 0; k < 5; k++) L.ato(v, lv, 'corte', { b: { atr: 2 } }); L.ato(v, lv, 'conversa'); L.ato(v, lv, 'conversa'); }); face2(v, lv); const s0 = L.sente(lv, v); const r = verbo('beijar'); const s1 = L.sente(lv, v); out.push(`${lv.name} (atração ${s0.atracao}, afeto ${s0.afeto}): «${r.msg}» → atração ${s1.atracao}`); good = good && /beijam/.test(r.msg) && s1.atracao >= s0.atracao; back(); }
  ok('c4 beijar', !!st && !!lv && good, out.join('; '));
}

if (on('c4')) {
  // a betrayal: one with a partner kisses the body with the partner beside them — the mark, the rumour, the couple at its door
  const o = people(x => x !== v && x.set === v.set && avail(x) && x.g !== v.g && x.partner && S().villagers.has(x.partner) && S().villagers.get(x.partner) !== v && !G.Vg.relatedClose(v, x))[0];
  if (!o) ok('c4 a-traicao', false, 'ninguém casado do outro sexo na cidade');
  else {
    const p = S().villagers.get(o.partner);
    god(() => { for (let k = 0; k < 6; k++) L.ato(v, o, 'corte', { b: { atr: 2 } }); for (let k = 0; k < 4; k++) L.ato(v, o, 'conversa'); });
    face2(v, o); god(() => { G.Vg.endTask(p); p.x = o.x + 0.6; p.y = o.y + 0.4; p.inside = 0; p.sleeping = false; G.Vg.setTask(p, { type: 'idle', wait: 30, pri: 0.3 }); });
    const r = verbo('beijar'); const mk = L.lembra(p, o.id).find(m => m[0] === 'traiu'); const rb = B.list().find(q => q.k === 'traicao' && q.a === o.id);
    ok('c4 a-traicao', /alguém viu/.test(r.msg) && !!mk && !!rb, `${o.name}, de ${p.name}: «${r.msg}»; ${p.name} guarda «traiu» ${mk ? '(peso ' + mk[3] + ')' : 'NÃO'}; o boato «${rb ? B.texto(rb, v.set) : '—'}»; o casal ${o.partner === p.id ? 'continua' : 'desfeito'}`);
    back();
  }
}

if (on('c5')) {
  const o = others().find(x => G.Indole.faceta(x, 'agressivo') < 0.5) || others()[2];
  // a friend of the body near: takes its side
  const fr = others().find(x => x !== o); god(() => { for (let k = 0; k < 8; k++) L.ato(fr, v, 'conversa'); });
  face2(v, o); god(() => { G.Vg.endTask(fr); fr.x = o.x - 0.6; fr.y = o.y + 0.5; fr.inside = 0; fr.sleeping = false; G.Vg.setTask(fr, { type: 'idle', wait: 30, pri: 0.3 }); });
  const r = verbo('insultar'); const mk = L.lembra(o, v.id).find(m => m[0] === 'insultou'); const def = L.lembra(v, fr.id).find(m => m[0] === 'defendeu');
  ok('c5 insultar', r.ok && !!mk && !!def, `${o.name}: «${r.msg}»; a marca «insultou» ${mk ? 'guardada' : 'NÃO'}; ${fr.name}, amig${fr.g === 'f' ? 'a' : 'o'} do corpo, ${def ? 'tomou o seu lado' : 'NÃO TOMOU'}`);
  back();
  // the aggressive one, alone, hit hard: a blow back — a brawl of the world, a crime
  const ag = people(x => x !== v && x.set === v.set && avail(x) && !Po.kin(v, x) && x !== fr).sort((a, b) => G.Indole.faceta(b, 'agressivo') + G.Indole.faceta(b, 'impulsivo') - G.Indole.faceta(a, 'agressivo') - G.Indole.faceta(a, 'impulsivo'))[0];
  god(() => { for (let k = 0; k < 3; k++) L.ato(v, ag, 'agressao'); L.marca(ag, 'bateu', v.id, 80); });
  face2(v, ag); const c0 = (S().crimes || []).length; const r2 = verbo('insultar');
  const fought = ag.task && ag.task.type === 'combat' && ag.task.id === v.id; const cr = (S().crimes || []).slice(c0).find(c => c.thief === ag.id && c.victim === v.id);
  ok('c5 a-briga', r2.ok && (fought ? !!cr : /devolve|baixa/.test(r2.msg)), `${ag.name} (agressivo ${G.Indole.faceta(ag, 'agressivo').toFixed(2)}, guarda que levou uma surra): «${r2.msg}»${fought ? `, um crime do mundo: ${cr ? cr.kind : 'NENHUM'}` : ''}`);
  god(() => G.Vg.endTask(ag)); back();
}

if (on('c6')) {
  const tav = G.Taverna && G.Village.byType ? null : null; void tav;
  let o = null;
  // (an evening with the tavern open: the world's hour put by the proof's hand to the tavern's, and the tavern opened)
  const b = (G.Eco.byType(v.set, 'taverna') || [])[0];
  if (!b) ok('c6 convidar', true, `pulado: ${town.name} não tem taverna`);
  else {
    // (the world lived on to an hour the tavern is open: its keeper at hand, its shelf full — the world's own opening)
    // (and something on its shelf, by the proof's hand: a town with nothing to pour never opens it)
    god(() => { D.make('b:' + b.id, 'food', 6, { code: 'teste' }); D.make('b:' + b.id, G.Taverna.menu(b).length ? G.Taverna.menu(b)[0].k : 'cerveja', 6, { code: 'teste' }); });
    for (let k = 0; k < 400 && !G.Taverna.aberta(b); k++) M.viver(1);
    god(() => { G.Vg.endTask(v); v.sleeping = false; v.inside = 0; }); frames(3);
    // (the guest: one who likes the body well enough and is not at sea or asleep at this hour)
    o = others().find(x => !x.sleeping && (L.sente(x, v) || { afeto: 0 }).afeto >= 0 && !L.ferida(x, v) && G.Indole.ax(x, 'ext') >= 40) || others().find(x => !x.sleeping);
    god(() => { for (let k = 0; k < 3; k++) L.ato(o, v, 'conversa'); });
    const coin = G.Taverna.withCoin(b); if (coin) god(() => D.make(G.Eco.coinRef(v), 'moedas', 5, { code: 'teste', by: v.id }));
    face2(v, o); const n0 = D.ledger().length; const r = verbo('beber');
    const paid = D.ledger().slice(n0).some(e => JSON.stringify(e).includes('rodada'));
    const goes = o.task && o.task.type === 'tavern';
    const why = `a taverna ${G.Taverna.aberta(b) ? 'aberta' : 'FECHADA'} (dia ${G.Taverna.dia(b) ? 'sim' : 'não'}, taverneiro ${G.Taverna.keeperOf(b) ? G.Taverna.keeperOf(b).name : 'nenhum'}, hora ${S().time.toFixed(2)}), a escolha do corpo: ${G.Taverna.pick(v) ? 'esta' : 'NENHUMA'}`;
    ok('c6 convidar', G.Taverna.aberta(b) && r.ok && /taverna|não vai/.test(r.msg) && (/taverna/.test(r.msg) ? goes && (!coin || paid) : true), `${why}; ${o.name}: «${r.msg}»${coin ? `; a rodada pelo livro: ${paid ? 'sim' : 'NÃO'}` : ' (um povo sem moeda)'}; vai: ${goes ? 'sim' : 'não'}`);
    // the god leaves the body in the middle of it: nothing hangs
    Po.release('deus'); frames(30); const bad = soc();
    ok('c6 o-corpo-deixado', M.limpo() && !bad.length, `o deus volta ao céu com ${o.name} a caminho da taverna: ${o.task ? o.task.type : 'sem tarefa'}; ${bad.length ? bad[0].msg : 'nada pendurado'}`);
    Po.take(v); G.Avatar.attach(v, 0); frames(6); back();
  }
}

if (on('c7')) {
  // (two of the other sex, not of the family, made single by the proof's hand at the couple's door; the body too)
  const cand = people(o => o !== v && o.set === v.set && avail(o) && o.g !== v.g && !G.Vg.relatedClose(v, o) && !Po.kin(v, o)).sort((a, b) => (L.find(a, v.id) ? 1 : 0) - (L.find(b, v.id) ? 1 : 0) || a.id - b.id);
  const no = cand[0], yes = cand[1];
  god(() => { for (const x of [v, no, yes].filter(Boolean)) if (x.partner) { const p = S().villagers.get(x.partner); G.Vg.unpair(x, 'teste'); if (p) G.Vg.unpair(p, 'teste'); } });
  if (!no || !yes) ok('c7 casamento', false, 'sem solteiros na cidade');
  else {
    // (one who does not care for the body — two discussions by the proof's hand — refuses)
    god(() => { L.ato(v, no, 'discussao'); L.ato(v, no, 'discussao'); });
    face2(v, no); const r1 = verbo('casar'); back();
    const how = []; const hk = (p, q, como, on1) => { if (on1) how.push(como); }; G.Vg.pairHooks.push(hk);
    god(() => { for (let k = 0; k < 6; k++) L.ato(v, yes, 'corte', { b: { atr: 2 } }); for (let k = 0; k < 5; k++) L.ato(v, yes, 'conversa'); });
    face2(v, yes); const r2 = verbo('casar'); G.Vg.pairHooks.splice(G.Vg.pairHooks.indexOf(hk), 1);
    ok('c7 casamento', /recusa|cedo/.test(r1.msg) && no.partner !== v.id && v.partner === yes.id && yes.partner === v.id && how.includes('pedido'), `${no.name}: «${r1.msg}»; ${yes.name}: «${r2.msg}» (pela porta: ${how.join(', ') || 'nada'})`);
    back();
  }
}

if (on('c8')) {
  const kind = people(o => o !== v && o.set === v.set && avail(o) && !Po.kin(v, o)).sort((a, b) => (G.Indole.ax(b, 'ama') - G.Indole.faceta(b, 'rancoroso') * 99) - (G.Indole.ax(a, 'ama') - G.Indole.faceta(a, 'rancoroso') * 99));
  const soft = kind[0], hard = kind[kind.length - 1];
  god(() => { for (const o of [soft, hard]) { L.ato(v, o, 'insulto'); L.marca(o, 'insultou', v.id, 30); } L.marca(hard, 'bateu', v.id, 95); for (let k = 0; k < 3; k++) L.ato(v, hard, 'agressao'); });
  face2(v, soft); const r1 = verbo('pazes'); const m1 = L.lembra(soft, v.id).some(m => m[0] === 'insultou'); back();
  face2(v, hard); const r2 = verbo('pazes'); const m2 = L.lembra(hard, v.id).some(m => m[0] === 'bateu'); back();
  ok('c8 as-pazes', /aceita/.test(r1.msg) && !m1 && /não aceita/.test(r2.msg) && m2, `${soft.name} (bondade ${G.Indole.ax(soft, 'ama')}): «${r1.msg}», a marca ${m1 ? 'FICOU' : 'saiu'}; ${hard.name} (rancor ${G.Indole.faceta(hard, 'rancoroso').toFixed(2)}): «${r2.msg}»`);
}

if (on('c9')) {
  const o = others().find(x => (L.sente(x, v) || { afeto: 0 }).afeto > -20 && !L.ferida(x, v)) || others()[0];
  const two = people(x => x !== v && x !== o && x.set === v.set && x.age >= 10); const [va, vq] = [two[0], two[1]];
  const r = god(() => B.nasce('agressao', { set: v.set, a: va.id, q: vq.id, n: { a: va.name, s: town.name }, p0: 200 }));
  god(() => B.ensina(o, r, 'viu', 0));
  // (what the other tells is the freshest it knows that the body does not — this one, or another the town already says)
  const had = new Set((v.sabe || []).map(q => q[0]));
  face2(v, o); const res = verbo('novidades'); const e = (v.sabe || []).find(q => !had.has(q[0])); const told = e && B.byId(e[0]);
  ok('c9 o-que-se-diz', !!told && e[1] === 'ouviu' && res.msg.includes(B.texto(told, e[3])), `${o.name}: «${res.msg}»; o corpo sabe agora por nome: ${e ? e[1] + ' (o boato #' + e[0] + (e[0] === r.id ? ', o que ' + o.name + ' viu' : '') + ')' : 'NÃO'}`);
  back();
}

if (on('c10')) {
  // (a body with room in its house: another grown one of the town lived for this case, and the first one back after)
  const ad = people(o => o !== v && o.set === v.set && o.age >= 22 && o.age < 55 && !o.captive && !o.jail && !o.aboard && o.home && G.Village.bedsOf(S().buildings.get(o.home)) > 0 && Tu.carga(o) <= 3)[0];
  if (ad) { Po.release('deus'); frames(4); god(() => { G.Vg.endTask(ad); ad.sleeping = false; ad.inside = 0; }); Po.take(ad); G.Avatar.attach(ad, 0); frames(6); }
  const v0 = v; v = Po.body() || v;
  const kid = people(o => o.set === v.set && o.age >= 6 && o.age < 13 && !o.captive && !Po.kin(v, o))[0];
  const scared = people(o => o.set === v.set && o.age >= 6 && o.age < 13 && !o.captive && o !== kid && !Po.kin(v, o))[0];
  if (!kid) ok('c10 adotar', false, 'nenhuma criança na cidade');
  else {
    // (the proof's hand makes them orphans: the parents to another town's records — the world's door would kill them)
    god(() => { for (const c of [kid, scared].filter(Boolean)) for (const pid of [c.mother, c.father]) { const p = S().villagers.get(pid); if (p) G.Village.kill(p, 'old'); } for (const c of [kid, scared].filter(Boolean)) c.tutor = 0; });
    god(() => { for (const c of [kid, scared].filter(Boolean)) G.Vg.endTask(c); });
    // (the child who fears the body first: it does not go)
    if (scared) { god(() => { L.marca(scared, 'bateu', v.id, 80); L.ato(v, scared, 'agressao'); }); face2(v, scared); const r2 = verbo('adotar'); ok('c10 com-medo-nao', !scared.tutor && /não quer/.test(r2.msg), `${scared.name}, que apanhou do corpo: «${r2.msg}»`); back(); }
    face2(v, kid); const r = verbo('adotar'); back();
    god(() => G.Village.forceUpdate && G.Village.forceUpdate()); frames(10);
    const pt = v.partner && S().villagers.get(v.partner);
    const fam = G.Vg.familyOf([v, pt].filter(Boolean), v.set, () => true) || [];
    ok('c10 adotar', !!ad && kid.tutor === v.id && Tu.de(kid) === v && Po.kin(v, kid) && L.kin(kid, v) === 'pai' && fam.includes(kid), `${kid.name}: «${r.msg}» — quem a cria: ${Tu.de(kid) ? Tu.de(kid).name : 'ninguém'}; para o corpo é ${Po.kin(v, kid) || '—'}; vai junto: ${fam.includes(kid) ? 'sim' : 'NÃO'}; mora ${kid.home === v.home ? 'na casa do corpo' : 'noutra casa (#' + kid.home + ')'}`);
  }
}

if (on('c10') && Po.body() !== BODY0) { Po.release('deus'); frames(4); god(() => { G.Vg.endTask(BODY0); BODY0.sleeping = false; BODY0.inside = 0; }); Po.take(BODY0); G.Avatar.attach(BODY0, 0); frames(6); v = BODY0; }

if (on('c12')) {
  const o = others()[0]; if (o && Po.body()) {
    face2(v, o); verbo('cumprimentar'); const was = o.task && o.task.type;
    god(() => G.Village.kill(Po.body(), 'old')); frames(40);
    ok('c12 o-corpo-morre', o.task ? o.task.type !== 'resposta' : true, `${o.name} respondia (${was || '—'}); o corpo morreu: agora ${o.task ? o.task.type : 'sem tarefa'}`);
  }
}

if (on('c11')) {
  M.pronto(WORLD); const S1 = G.S; const set = [...S1.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  const kid = [...S1.villagers.values()].filter(o => o.set === set.id && o.age >= 3 && o.age < 12 && !o.captive).sort(byId)[0];
  const gp = [...S1.villagers.values()].filter(o => o.set === set.id && o.age >= 25 && o.age < 60 && !o.captive && o.home && o.id !== kid.mother && o.id !== kid.father).sort(byId);
  god(() => { for (const pid of [kid.mother, kid.father]) { const p = S1.villagers.get(pid); if (p) G.Village.kill(p, 'old'); } });
  // (one who may take it in, not of the blood, made fond of it by the proof's hand: the most fond wins over a stranger)
  const fond = gp.find(a => S1.villagers.has(a.id) && G.Tutela.pode(a, kid) && !G.Tutela.parente(kid, a)) || gp[0], other = gp[1];
  god(() => { for (let k = 0; k < 20; k++) L.ato(fond, kid, 'conversa'); });
  god(() => Tu.dayOf(set)); const t1 = Tu.de(kid);
  god(() => G.Village.kill(t1, 'old')); god(() => Tu.dayOf(set)); const t2 = Tu.de(kid);
  const save = G.Save.serialize(); M.abrir(JSON.parse(save)); const k2 = G.S.villagers.get(kid.id); const t3 = G.Tutela.de(k2);
  ok('c11 o-dia-da-cidade', (t1 === fond || (t1 && G.Tutela.parente(kid, t1))) && !!t2 && t2 !== t1 && !!t3 && t3.id === t2.id, `${kid.name}, órfã${kid.g === 'f' ? '' : 'o'}: o dia a deu a ${t1 ? t1.name : 'NINGUÉM'} (que mais gostava del${kid.g === 'f' ? 'a' : 'e'}); morto, a ${t2 ? t2.name : 'NINGUÉM'}; depois do load: ${t3 ? t3.name : 'NINGUÉM'}`);
  void other;
  const bad = soc(); ok('c11 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

{ const bad = soc(); ok('verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : M.limpo() ? 'limpo' : JSON.stringify(M.erros()).slice(0, 300)); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
