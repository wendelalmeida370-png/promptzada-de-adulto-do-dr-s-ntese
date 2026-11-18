// solto: o corpo solto no meio de um gesto (22c; o aberto do L-1713).   [ONLY=s1,s3] node qa/solto.js [mundo]
// Em Node, com o 3D do jogo só como geometria (qa/visual/tres-node.js): o corpo é tomado pela porta do jogo, o controle do corpo
// (avatar.js) e o desenho das pessoas (People3D, com a pele: Body3D) rodam quadro a quadro, e o corpo é solto — pelo deus, pela morte
// de outra pessoa não, pela porta do jogo: G.Possess.release — no meio de um gesto. Depois, a pessoa volta ao mundo e é desenhada
// como as outras, e cada quadro é olhado pelo verificador do desenho (People3D.check, Body3D.check: números, uma pessoa por linha,
// a bacia de cada um perto de onde o mundo a tem, ninguém nu). Uma vez, no qa/interacao-tela.js w7/w8, o Body3D.check viu «corpo
// 8: a pelve a 0.01 m de onde a pessoa está (altura 3140689.24)» depois de o corpo ser solto no meio do gesto de falar (L-1713).
//  s1 o gesto de falar (o E numa pessoa: «Conversar»), solto em cinco momentos dele, e tomado de novo depois;
//  s2 o gole da caneca e o golpe de um trabalho (um gesto com a coisa na mão, um com janelas de corte), soltos no meio;
//  s3 andando (o trote), agachado e no meio de um pulo, soltos; e o corpo solto no mesmo quadro em que foi tomado;
//  s4 o save no meio de um gesto e o corpo solto logo depois do load;
//  s5 o gesto cortado no meio — o verbo do cartão que corta o falar (Avatar.cancelAct, a correção do L-1713) —, o corpo posto noutro
//     lugar no meio dele, as pessoas em volta levadas quarenta casas e trazidas de volta no meio dele (como a prova da tela faz);
//  s9 nenhum erro de módulo nem do console.
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M } = T.load({ extra: [] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null; const on = k => !ONLY || ONLY.has(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | solto ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
M.pronto(WORLD); M.viver(1);
const Po = G.Possess, Av = G.Avatar, P3 = G.People3D, B3 = G.Body3D, I = G.Interact, W = G.W; const TL = G.Space.TILE; const RDT = 1 / 30;
const S = () => G.S; const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const byId = (a, b) => a.id - b.id;
const people = f => [...S().villagers.values()].filter(f).sort(byId);
const grown = o => o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && !o.ug && !o.held && !o.air && !o.inside && !o.sleeping;
// (a frame of the game: the world's step in the body's time, the body's controller, the people drawn round the body — each frame
// looked at by the drawing's own verifier; the first thing it says is kept, with the frame and the case)
let seen = [], fno = 0, skinOn = false;
const look = (why) => { fno++; const out = (P3.check ? P3.check() : []).concat(B3 && B3.check ? B3.check() : []); if (B3 && B3.rows > 0) skinOn = true; if (out.length && seen.length < 6) seen.push(`${why} (quadro ${fno}): ${out[0]}`); };
const frame = (why) => { G.debug.step(RDT * G.Space.TIME); if (Av.on) Av.frame(RDT); const b = Av.on && Av.state ? Av.state() : null; const f = b ? { X: b.X, Z: b.Z } : FOCUS; P3.update(RDT, f); look(why || 'quadro'); };
const frames = (n, why) => { for (let k = 0; k < n; k++) frame(why); };
const openNear = (x, y) => { for (let d = 0; d < 14; d++) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const px = Math.floor(x + Math.cos(a) * d) + 0.5, py = Math.floor(y + Math.sin(a) * d) + 0.5; if (W.inb(px, py) && W.walkableXY(px, py) && !S().occ[W.idx(px, py)]) return [px, py]; } return null; };
let FOCUS = { X: 0, Z: 0 };
// the body: someone grown and awake of the biggest town; another near it to talk to
const set = [...S().settlements.values()].sort((a, b) => b.pop - a.pop || a.id - b.id)[0];
const cands = people(o => o.set === set.id && grown(o) && Po.can(o).ok);
const v = cands[0], o = cands.find(x => x !== v && !Po.kin(v, x)) || cands[1];
const SPOT = openNear(set.cx || v.x, set.cy || v.y) || [v.x, v.y]; FOCUS = { X: SPOT[0] * TL, Z: SPOT[1] * TL };
const stage = () => god(() => { for (const p of [v, o]) { G.Vg.endTask(p); p.hunger = 5; p.energy = 100; p.sleeping = false; p.inside = 0; } v.x = SPOT[0]; v.y = SPOT[1]; o.x = SPOT[0] + 0.3; o.y = SPOT[1]; o.path = null; o.moving = false; G.Vg.setTask(o, { type: 'idle', wait: 30, pri: 0.3 }); });
// (the body taken by the game's door, put at the spot facing the other; its controller attached as the game does)
function take() { stage(); const r = Po.take(v); if (!r || r.ok === false) return false; Av.attach(v, 0); frames(4, 'tomado'); if (Av.place) Av.place(v.x, v.y); frames(3, 'posto'); const b = Av.state(); b.yaw = Math.atan2(o.y - v.y, o.x - v.x); Av.input.camYaw = b.yaw; frames(3, 'virado'); return Po.is(v); }
function release() { Po.release('deus'); Av.detach(); }
const busy = () => !!(Av.busy && Av.busy());

if (!v || !o) { ok('s0 duas pessoas para a prova', false, 'ninguém'); process.exit(1); }
console.log(`(${v.name}#${v.id} e ${o.name}#${o.id}, em ${set.name})`);

if (on('s1')) {
  // the word: the E on the other — «Conversar» — and the body let go at five moments of the gesture, then drawn as the world has it
  const said = []; seen = [];
  for (const at of [1, 4, 10, 20, 35]) {
    if (!take()) { said.push(`tomar: não (${at})`); continue; }
    const b0 = I.best(); const r = b0 && b0.id === 'pessoa' ? I.runVerb('usar', b0) : null; const was = busy();
    frames(at, `falando, ${at} quadros`); const mid = busy();
    release(); frames(45, `solto aos ${at} quadros do gesto`);
    said.push(`${at}: ${r && r.ok !== false ? 'falou' : 'não falou (' + (r && r.why) + ')'}${was ? ', no gesto' : ''}${mid ? ', solto no meio' : ''}`);
  }
  // (and taken again after: the body's own memory begun again)
  const again = take(); frames(10, 'tomado de novo'); release(); frames(20, 'solto de novo');
  ok('s1 o corpo solto no meio do gesto de falar: o desenho limpo em todo quadro', !seen.length && again && skinOn, (seen.length ? 'VERIFICADOR: ' + seen.join(' · ') + ' — ' : '') + said.join('; ') + (skinOn ? '' : ' (SEM A PELE: o Body3D não desenhou)'));
}

if (on('s2')) {
  // the cup at the lips and a stroke of a work: a gesture with the thing in the hand, one with windows to cut it
  const said = []; seen = [];
  if (take()) { god(() => { G.Depot.make('m:' + v.id, 'caneca.madeira', 1, { code: 'teste', by: v.id }); G.Inv.equip(v, 'caneca.madeira', 'mao'); });
    // (the body drinking as the world's people do: its act the drink's, its clip the drink's — the controller's act, the hands)
    const r = Av.act ? Av.act({ anim: 'drink', dur: 2.6, clip: 'ato-beber' }) : null; frames(25, 'bebendo'); said.push(`o gole: ${r && r.ok === false ? r.why : busy() ? 'no meio' : 'acabado'}`);
    release(); frames(40, 'solto no meio do gole'); }
  if (take()) { const tr = G.Trabalho; const r = tr && tr.swing ? tr.swing(v) : Av.act ? Av.act({ anim: 'chop', dur: 1.6, clip: 'machado', cancelAt: [0.8, 1] }) : null; frames(20, 'golpeando'); said.push(`o golpe: ${busy() ? 'no meio' : 'acabado'}`);
    release(); frames(40, 'solto no meio do golpe'); }
  ok('s2 solto no meio do gole e do golpe: o desenho limpo', !seen.length, (seen.length ? 'VERIFICADOR: ' + seen.join(' · ') + ' — ' : '') + said.join('; '));
}

if (on('s3')) {
  const said = []; seen = [];
  // (walking: the trot the keys give)
  if (take()) { Av.input.y = 1; frames(30, 'trotando'); release(); Av.input.y = 0; frames(40, 'solto trotando'); said.push('trotando'); }
  // (crouched, and in the air of a jump)
  if (take()) { if (Av.crouch) Av.crouch(true); frames(15, 'agachado'); release(); frames(40, 'solto agachado'); said.push('agachado'); }
  if (take()) { Av.input.jump = true; frames(6, 'pulando'); Av.input.jump = false; release(); frames(40, 'solto no ar'); said.push('no pulo'); }
  // (let go in the frame it was taken)
  stage(); if (Po.take(v).ok) { Av.attach(v, 0); release(); frames(30, 'solto no quadro em que foi tomado'); said.push('no mesmo quadro'); }
  ok('s3 solto trotando, agachado, no pulo e no quadro em que foi tomado: o desenho limpo', !seen.length, (seen.length ? 'VERIFICADOR: ' + seen.join(' · ') + ' — ' : '') + said.join('; '));
}

if (on('s4')) {
  // the save in the middle of the word, the load, and the body let go right after it
  seen = []; let said = '';
  if (take()) { const b0 = I.best(); if (b0 && b0.id === 'pessoa') I.runVerb('usar', b0); frames(8, 'falando');
    const txt = G.Save.serialize ? G.Save.serialize() : null; if (txt) { release(); G.Save.load(typeof txt === 'string' ? JSON.parse(txt) : txt); frames(3, 'carregado');
      const w = S().villagers.get(v.id); if (w && Po.take(w).ok) { Av.attach(w, 0); frames(5, 'tomado depois do load'); release(); frames(40, 'solto depois do load'); said = 'salvo, carregado, tomado e solto'; } else said = 'carregado (sem tomar de novo)'; }
    else { said = 'sem a porta do save em Node'; release(); } }
  ok('s4 o save no meio do gesto e o corpo solto depois do load: o desenho limpo', !seen.length, (seen.length ? 'VERIFICADOR: ' + seen.join(' · ') + ' — ' : '') + said);
}

if (on('s5')) {
  // the gesture let go — cut: the word cut by a verb the card asks (Avatar.cancelAct, L-1713), at five moments of it; the body put
  // elsewhere in the middle of it (Avatar.place, as the screen's proof puts it); the people round it sent forty tiles off and back
  // in the middle of it (the screen's proof clears the stage so) — each frame looked at
  const said = []; seen = [];
  if (take()) {
    for (const at of [1, 3, 8, 15, 30]) { const b0 = I.best(); const r = b0 && b0.id === 'pessoa' ? I.runVerb('usar', b0) : null; frames(at, `falando ${at}`); const mid = busy(); if (Av.cancelAct) Av.cancelAct(); frames(30, `o gesto cortado aos ${at} quadros`); said.push(`${at}: ${r && r.ok !== false ? 'falou' : 'não'}${mid ? ', cortado no meio' : ''}`); }
    { const b0 = I.best(); if (b0 && b0.id === 'pessoa') I.runVerb('usar', b0); frames(6, 'falando'); const r = I.runVerb('outra', I.best(), 'dar'); frames(30, 'o «Dar» do cartão no meio do gesto'); said.push(`o «Dar»: ${r ? (r.panel ? 'a tela de dar' : r.why || r.msg || 'feito') : '-'}`); }
    { const b0 = I.best(); if (b0 && b0.id === 'pessoa') I.runVerb('usar', b0); frames(5, 'falando'); const p = openNear(SPOT[0] + 6, SPOT[1] + 6); if (p && Av.place) Av.place(p[0], p[1]); frames(30, 'posto noutro lugar no meio do gesto'); said.push('posto noutro lugar'); }
    { const b0 = I.best(); const away = []; god(() => { for (const q of S().villagers.values()) if (q.id !== v.id && !q.inside && G.dist(q.x, q.y, v.x, v.y) < 6) { away.push([q, q.x, q.y]); q.x += 40; q.y += 40; } });
      if (b0 && b0.id === 'pessoa') I.runVerb('usar', b0); frames(4, 'falando, os outros longe'); god(() => { for (const [q, x, y] of away) { q.x = x; q.y = y; } }); frames(30, 'os outros de volta no meio do gesto'); said.push(`${away.length} mandados longe e de volta`); }
    release(); frames(20, 'solto'); }
  ok('s5 o gesto cortado no meio (o verbo do cartão), o corpo posto noutro lugar, os outros levados e trazidos: o desenho limpo', !seen.length, (seen.length ? 'VERIFICADOR: ' + seen.join(' · ') + ' — ' : '') + said.join('; '));
}

const E = M.erros(); ok('s9 nenhum erro de módulo nem do console', !Object.keys(E.mod || {}).length && !E.console.length, `módulos ${JSON.stringify(E.mod || {})}; console ${E.console.slice(0, 3).join(' | ') || 'limpo'}`);
console.log(fails.length ? `SOLTO: ${fails.length} falha(s): ${fails.join(', ')}` : 'SOLTO: ok');
process.exit(fails.length ? 1 : 0);
