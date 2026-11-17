// combate: o combate do corpo (20f, D-410 a D-424) — em Node, sem navegador (a simulação do qa/nodemundo.js com o controle do corpo,
// a câmera, as teclas, os clipes e as mãos do combate por cima; quadros dirigidos à mão, como o main.js os dá):
//   node qa/combate.js [mundo]            (padrão: o mundo pronto «cidade»; ONLY=c1,c4 roda só essas partes)
//   node qa/combate.js mundo BASE [semente|mundo pronto]   c12: as lutas do mundo (uma guerra, sem corpo) iguais às de outra árvore do jogo
//                                             (BASE: a pasta do jogo de antes, ex. uma cópia do 76e3cae) — a mesma semente, o
//                                             mesmo mundo, a mesma impressão
// As provas:
//   c1  as armas: cada coisa na mão faz o seu jeito de lutar (o punho, a faca, a espada, o machado, a clava, a lança, a de duas
//       mãos); o golpe mede o dano do catálogo e o material (a de ferro mais que a de bronze, a de pedra menos), o alcance da arma
//   c2  o golpe pelo corpo: acerta quem está dentro do arco e do alcance (a cápsula de cada um), erra quem está atrás, longe, fora
//       do arco; a lança alcança mais e varre menos; o elmo e a couraça seguram a parte deles; um bicho pelo contorno (G.Corpo)
//   c3  a guarda do corpo: o aparo (a guarda erguida na hora) não deixa nada passar e joga para trás quem golpeou; a guarda segurada
//       toma a parte do escudo ou da arma; de costas, nada; a flecha só o escudo segura; a guarda sacudida não apara
//   c4  a esquiva: no meio do rolar nada acerta; antes e depois, sim
//   c5  as mãos: do aperto ao gesto no mesmo quadro; o golpe acerta no contato do gesto (o quadro em que o ato chega lá), uma
//       vez só; gasta o fôlego dele; sem fôlego não sai; o golpe se vê chegar (o preparo antes do contato); três apertos, três
//       golpes em sequência; segurando, o pesado carregado — mais forte, mais caro
//   c6  o arco: a flecha sai da mochila, voa e acerta pelo corpo; a que erra cai e se pega de volta; o livro diz cada passo;
//       mirar (defender com o arco na mão) e puxar e soltar pelas teclas
//   c7  o crime: bater em gente do próprio povo é crime visto por quem está perto; matar é outro; quem é da lei vai atrás
//   c8  o duelo: o F numa pessoa — o guerreiro aceita, a criança e o velho recusam —; quem duela luta no tempo do corpo; os golpes
//       do duelo não são crime; rende-se quem cai abaixo do limite, ninguém morre
//   c9  os casos ruins: o save no meio de um golpe (nada acerta depois) e de um duelo (o duelo volta, quem duela luta); a flecha
//       no ar atravessa o save; o alvo morre no meio; a mão do deus o pega; a fera morde o corpo de guarda; o corpo morre no meio
//       do duelo; o corpo devolvido com a flecha no ar
//   c10 as lutas do mundo desenhadas com os golpes novos: quem luta (o ato «fight») tem o gesto da arma que segura, no relógio do
//       golpe do mundo; quem luta com o corpo, no tempo do corpo; o tranco e a queda
//   c11 o verificador limpo (S0–S2), sem erro de módulo nem do console; e ele vê uma flecha no ar sem corpo (posta pela prova)
const path = require('path');
const MODE = process.argv[2];
if (MODE === 'mundo') { mundo(process.argv[3], process.argv[4] || 4242); return; }
const M = require(path.join(__dirname, 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/cam3d.js', 'js/input3d.js', 'js/combate-clips.js', 'js/combate-ui.js', 'qa/combate-inv.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | combate ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
M.pronto(MODE || 'cidade');
let S = G.S; const W = G.W, TL = G.Space.TILE, Av = G.Avatar, C3 = G.Cam3D, IN = Av.input, Cb = G.Combate, U = G.CombateUI, In = G.Input3D, D = G.Depot, It = G.Itens;
U.proof = true;
const r2 = x => Math.round(x * 100) / 100;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const CAM = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000 };
const RDT = 1 / 60;
function frame(rdt) {
  rdt = rdt || RDT; IN.camYaw = C3.yaw; IN.lock = C3.locked(); IN.aim = C3.aiming();
  G.debug.step(rdt * G.Space.TIME); Av.frame(rdt);
  const p = Av.pos(); if (p) C3.update(rdt, Object.assign({ h: 1.75 }, p), CAM);
  U.frame(rdt);
}
const frames = (n, f) => { for (let k = 0; k < n; k++) { frame(); if (f && f(k)) return k; } return -1; };
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; IN.walk = false; IN.jump = false; IN.dodge = false; IN.crouch = false; for (const a in In.down) In.down[a] = false; };
const press = a => { In.down[a] = true; In.fire(a); };
const release = a => In.press(a, false);
let base = new Set(); const qk = e => e.sys + '|' + e.msg.replace(/\s*\([^)]*\)\s*$/, '');
const vbad = () => QA.check().filter(q => q.sev <= 2 && !base.has(qk(q)));
// (the stage: the longest straight way of open ground three tiles wide — as the movement's proof finds it)
function corridor() {
  const okT = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return !(!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.type[i] <= G.T.RIVER || S.slope[i] > 1.0 || S.wall[i]); };
  const wide = (x, y, dx, dy) => okT(x, y) && okT(x - dy, y + dx) && okT(x + dy, y - dx) && okT(x - 2 * dy, y + 2 * dx) && okT(x + 2 * dy, y - 2 * dx);
  let best = 0, at = null;
  for (let y = 3; y < G.N - 3; y++) for (let x = 3; x < G.N - 3; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { let n = 0; while (n < 14 && wide(x + dx * n, y + dy * n, dx, dy)) n++; if (n > best) { best = n; at = { x, y, dx, dy, n }; } }
  return at;
}
const COR = corridor();
const X0 = COR ? COR.x + 0.5 + COR.dx * 3 : 0, Y0 = COR ? COR.y + 0.5 + COR.dy * 3 : 0, YAW = COR ? Math.atan2(COR.dy, COR.dx) : 0;
const fwd = (d, side) => [X0 + Math.cos(YAW) * d / TL - Math.sin(YAW) * (side || 0) / TL, Y0 + Math.sin(YAW) * d / TL + Math.cos(YAW) * (side || 0) / TL];
const used = new Set();
const pickAdult = (f) => [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 45 && !(o.lost && (o.lost.leg || o.lost.armL || o.lost.armR)) && !(o.sick > 0) && !o.captive && !o.jail && !o.aboard && !used.has(o.id) && (!f || f(o))).sort((a, b) => a.id - b.id)[0];
const v0 = pickAdult(o => G.Possess.can(o).ok); if (v0) used.add(v0.id);
if (!COR || !v0) { ok('palco', false, !COR ? 'nenhum corredor aberto' : 'ninguém para viver'); process.exit(1); }
console.log(`(palco: ${COR.n} casas em ${COR.x},${COR.y}; o corpo: ${v0.name} #${v0.id}, ${v0.role})`);
// (the body lived at the stage's start, facing along it, a bag of the proof's own: the things given by the proof's hand)
function live(v, yaw) {
  if (G.Possess.body()) G.Possess.release('deus'); Av.detach();
  G.Vg.endTask(v); v.inside = 0; v.x = X0; v.y = Y0; v.path = null; v.hp = 100; v.sleeping = false; v.downT = 0; v.stagT = 0; v.hunger = 10; v.energy = 90; v.carry = null;
  const r = G.Possess.take(v); if (!r.ok) return false;
  Av.attach(v, yaw === undefined ? YAW : yaw); stop(); C3.attach(Av.pos(), yaw === undefined ? YAW : yaw); C3.unlock(); C3.aim(false); C3.pitch = 0.26; Av.rest();
  frames(4); return true;
}
function arm(v, keys) { god(() => { for (const k of Object.keys(G.Inv.bag(v))) D.use('m:' + v.id, k, G.Inv.count(v, k), { code: 'prova' }); for (const [k, s, n] of keys) { D.make('m:' + v.id, k, n || 1, { code: 'prova' }); if (s) G.Inv.equip(v, k, s); } }); }
// (someone of the world put by the proof's hand before the body, at d metres and `side` metres to its right, facing it, idle)
function stand(o, d, side) { const [x, y] = fwd(d, side); G.Vg.endTask(o); o.inside = 0; o.x = x; o.y = y; o.path = null; o.hp = 100; o.downT = 0; o.stagT = 0; o.sleeping = false; o.moving = false; G.faceTo(o, X0 - x, Y0 - y); o.held = false; return o; }
const strikeNow = (v, sp) => god(() => Cb.strike(v, sp));
// (nobody else on the stage: whoever stands within reach of it is put a few tiles back along the way — the proof's hand)
function clear(keep) { const K = new Set(keep.map(o => o.id)); for (const o of S.villagers.values()) { if (K.has(o.id) || o.inside || o.aboard) continue; if (Math.hypot(o.x - X0, o.y - Y0) > 3) continue; for (const d of [-26, -22, 30, 34]) { const [x, y] = fwd(d, 0); if (W.inb(x, y) && W.walkableXY(x, y)) { G.Vg.endTask(o); o.x = x; o.y = y; o.path = null; break; } } } }
const calm = o => o.role !== 'guerreiro' && !o.unit && !(G.Crime && G.Crime.law(o));

// ================================ c1: as armas ================================
if (want('c1')) {
  const v = v0; live(v); const out = []; let bad = [];
  const cases = [[null, 'punho'], ['faca.bronze', 'faca'], ['espada.bronze', 'espada'], ['espada.ferro', 'espada'], ['machado.pedra', 'machado'], ['machado.ferro', 'machado'], ['clava', 'clava'], ['martelo.bronze', 'clava'], ['lanca.pedra', 'lanca'], ['lanca.ferro', 'lanca'], ['picareta.bronze', 'duas'], ['cesto', 'punho']];
  const dealt = {};
  for (const [k, cls] of cases) {
    arm(v, k ? [[k, It.def(k).maoSlot || 'mao']] : []); const w = Cb.weapon(v); const d = r2(Cb.dealt(v, w, Cb.move(w.cls, 0), 0));
    dealt[k || 'nada'] = d; out.push(`${k || 'mãos vazias'} → ${w.cls} ${d} a ${r2(Cb.reachOf(w, Cb.move(w.cls, 0)))} m`);
    if (w.cls !== cls) bad.push(`${k}: ${w.cls} (devia ser ${cls})`);
  }
  if (!(dealt['espada.ferro'] > dealt['espada.bronze'])) bad.push('a espada de ferro não fere mais que a de bronze');
  if (!(dealt['machado.ferro'] > dealt['machado.pedra'])) bad.push('o machado de ferro não fere mais que o de pedra');
  if (!(dealt['espada.bronze'] > dealt.nada * 2)) bad.push('a espada não fere bem mais que o punho');
  const lw = (arm(v, [['lanca.pedra', 'mao']]), Cb.weapon(v)), ew = (arm(v, [['espada.bronze', 'mao']]), Cb.weapon(v));
  if (!(Cb.reachOf(lw, Cb.move('lanca', 0)) > Cb.reachOf(ew, Cb.move('espada', 0)) + 0.6)) bad.push('a lança não alcança mais que a espada');
  const heavy = Cb.dealt(v, ew, Cb.move('espada', -1), 1) / Cb.dealt(v, ew, Cb.move('espada', 0), 0);
  if (!(heavy > 2)) bad.push(`o pesado carregado só ${r2(heavy)}× o leve`);
  ok('c1 as-armas', !bad.length, `${out.join(' · ')}; o pesado carregado da espada ${r2(heavy)}× o leve${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c2: o golpe pelo corpo ================================
let crimeSeen = null;
if (want('c2') || want('c7')) {
  const v = v0; live(v); arm(v, [['espada.bronze', 'mao']]);
  const t = pickAdult(o => o.set === v.set && G.Fac.idOfV(o) === G.Fac.idOfV(v) && calm(o)); used.add(t.id);
  const res = []; const bad = [];
  const tryAt = (d, side, yaw, wantHit, what) => { stand(t, d, side); t.hp = 100; clear([v, t]); const r = strikeNow(v, { i: 0, yaw: yaw === undefined ? YAW : yaw }); const hit = r.ok && r.hits.some(h => h.id === t.id); res.push(`${what}: ${hit ? 'acertou ' + r2(100 - t.hp) : 'errou'}`); if (hit !== wantHit) bad.push(what); return r; };
  tryAt(1.0, 0, undefined, true, 'espada a 1 m de frente');
  tryAt(2.3, 0, undefined, false, 'a 2,3 m');
  tryAt(-1.0, 0, undefined, false, 'a 1 m atrás');
  tryAt(0.8, 0.6, undefined, true, 'a 1 m, 37° ao lado');
  tryAt(0.2, 1.1, undefined, false, 'a 1,1 m, 80° ao lado');
  arm(v, [['lanca.pedra', 'mao']]);
  tryAt(2.1, 0, undefined, true, 'lança a 2,1 m');
  tryAt(2.1, 1.2, undefined, false, 'lança a 2,1 m e 1,2 m ao lado (30°)');
  // (what the one struck wears keeps its share: the cuirass on the trunk)
  arm(v, [['espada.bronze', 'mao']]); arm(t, [['couraca.bronze', 'corpo']]); stand(t, 1, 0); t.hp = 100; clear([v, t]);
  const w = Cb.weapon(v); const exp = r2(Cb.dealt(v, w, Cb.move('espada', 0), 0) * (1 - Cb.armour(G.Inv.held(t), 'corpo')));
  const rr = strikeNow(v, { i: 0, yaw: YAW }); const got = rr.hits[0] ? rr.hits[0].amt : -1;
  if (Math.abs(got - exp) > 0.02) bad.push(`com a couraça: ${got} (devia ${exp})`);
  arm(t, []);
  // (a beast by its footprint: a deer before the body)
  stand(t, -3, 0); clear([v, t]); const [bx, by] = fwd(1.6, 0); const deer = god(() => G.Animals.spawn('deer', bx, by, { age: 3, grown: 1, hunger: 0.1, t: 999, scan: 999, rest: 0 })); G.faceTo(deer, 0, 1);
  const hp0 = deer.hp; const rd = strikeNow(v, { i: 0, yaw: YAW }); const bh = rd.hits.find(h => h.beast);
  if (!bh || !(deer.hp < hp0)) bad.push(`o cervo a 1,6 m não foi acertado (${deer.hp}/${hp0})`);
  res.push(`o cervo: ${bh ? 'acertou ' + bh.amt : 'errou'}`);
  god(() => G.Animals.remove(deer));
  crimeSeen = (S.crimes || []).filter(c => c.thief === v.id);
  ok('c2 o-golpe-pelo-corpo', !bad.length, `${res.join(' · ')}; com a couraça de bronze ${got} (${exp} esperado)${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c7: o crime ================================
if (want('c7') && crimeSeen) {
  const v = v0; const bad = [];
  const ag = crimeSeen.filter(c => c.kind === 'agressao');
  if (!ag.length) bad.push('nenhum crime de agressão');
  const seen = ag.length ? ag[0].seen.length : 0;
  // (a death: the body kills one of its own)
  const t = pickAdult(o => o.set === v.set && G.Fac.idOfV(o) === G.Fac.idOfV(v) && calm(o)); used.add(t.id); live(v); arm(v, [['espada.ferro', 'mao']]);
  stand(t, 1, 0); t.hp = 5; clear([v, t]); strikeNow(v, { i: 0, yaw: YAW });
  const dead = !S.villagers.has(t.id); const hom = (S.crimes || []).find(c => c.thief === v.id && c.victim === t.id && c.kind === 'homicidio');
  if (!dead) bad.push('o golpe não matou'); if (!hom) bad.push('nenhum crime de morte');
  const rec = S.dead.get(t.id);
  // (one of the law who saw it goes after the body)
  const law = [...S.villagers.values()].find(o => o.task && o.task.type === 'prender' && o.task.id === v.id);
  ok('c7 o-crime', !bad.length, `${ag.length} agressão(ões) (a primeira vista por ${seen}); a morte: ${hom ? 'crime «homicidio» de ' + hom.vname : 'NENHUM'} — ${rec ? rec.name + ' ' + G.Village.deathText(rec) : '?'}; ${law ? `${law.name} (${law.role}) vai atrás do corpo` : 'ninguém da lei viu'}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c3: a guarda do corpo ================================
if (want('c3')) {
  const v = v0; live(v); arm(v, [['espada.bronze', 'mao'], ['escudo.madeira', 'outra']]);
  const a = pickAdult(o => o.id !== v.id); used.add(a.id); stand(a, 1, 0);
  const res = [], bad = []; const T = Cb.bodyTime();
  const hit = (amt, cause, from) => { const h0 = v.hp; god(() => G.Vg.damage(v, amt, cause, false, from.id)); const t = r2(h0 - v.hp); v.hp = 100; return t; };
  const wait = s => { const t0 = S.clock; frames(Math.ceil(s / T / RDT) + 1); return r2(S.clock - t0); };
  // the parry: the guard raised a moment before
  wait(Cb.SPAM + 0.1); god(() => Cb.guard(v, true)); const st0 = a.stagT || 0; const p = hit(10, 'war', a);
  res.push(`o aparo: ${p} de vida`); if (p !== 0) bad.push(`o aparo deixou passar ${p}`); if (!(a.stagT > S.clock && a.stagT > st0)) bad.push('quem golpeou não foi jogado para trás');
  // the guard held, past the parry's moment
  wait(Cb.PARRY + 0.05); const g = hit(10, 'war', a); const share = Cb.guardOf(Cb.weapon(v));
  res.push(`a guarda do escudo: ${g} de 10 (o escudo de madeira ${r2(share)})`); if (Math.abs(g - r2(10 * (1 - share))) > 0.02) bad.push(`a guarda deixou ${g} (devia ${r2(10 * (1 - share))})`);
  // from behind
  stand(a, -1, 0); const b = hit(10, 'war', a); res.push(`de costas: ${b}`); if (b !== 10) bad.push(`de costas a guarda segurou (${b})`);
  // the arrow: the shield takes it; the sword alone does not
  stand(a, 6, 0); const ar = hit(10, 'arrow', a); res.push(`a flecha no escudo: ${ar}`); if (!(ar < 10)) bad.push('o escudo não segurou a flecha');
  god(() => Cb.guard(v, false)); arm(v, [['espada.bronze', 'mao']]); god(() => Cb.guard(v, true)); wait(Cb.PARRY + 0.05);
  const as = hit(10, 'arrow', a); res.push(`a flecha na espada: ${as}`); if (as !== 10) bad.push(`a espada segurou a flecha (${as})`);
  // the guard flicked up and down: no parry
  stand(a, 1, 0); god(() => Cb.guard(v, false)); god(() => Cb.guard(v, true)); god(() => Cb.guard(v, false)); god(() => Cb.guard(v, true));
  const sp = hit(10, 'war', a); res.push(`a guarda sacudida: ${sp}`); if (sp === 0) bad.push('a guarda sacudida aparou');
  god(() => Cb.guard(v, false)); const none = hit(10, 'war', a); res.push(`sem guarda: ${none}`); if (none !== 10) bad.push(`sem guarda ${none}`);
  // a beast's bite on the guard: the blocked share, a giant's half of it
  ok('c3 a-guarda', !bad.length, `${res.join(' · ')}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c4: a esquiva ================================
if (want('c4')) {
  const v = v0; live(v); arm(v, [['espada.bronze', 'mao']]); const a = [...S.villagers.values()].find(o => used.has(o.id) && o.id !== v.id) || pickAdult(); stand(a, 1.5, 0);
  const res = [], bad = []; let inWin = null, before = null, after = null;
  const try1 = () => { const h0 = v.hp; god(() => G.Vg.damage(v, 8, 'war', false, a.id)); const t = r2(h0 - v.hp); v.hp = 100; return t; };
  before = try1();
  IN.mz = 1; IN.dodge = true; let seen = false;
  frames(80, () => { const d = Av.dodging(); if (d) { seen = true; const w = Cb.IFRAME[d.kind]; if (inWin === null && d.u > w[0] + 0.05 && d.u < w[1] - 0.05) inWin = { k: d.kind, u: r2(d.u), t: try1() }; } else if (seen) return true; return false; });
  stop(); frames(10); after = try1();
  res.push(`antes ${before} · no meio da esquiva (${inWin ? inWin.k + ' a ' + inWin.u : '—'}) ${inWin ? inWin.t : '—'} · depois ${after}`);
  if (!inWin || inWin.t !== 0) bad.push('o golpe no meio da esquiva acertou'); if (before !== 8 || after !== 8) bad.push('fora da esquiva o golpe não acertou');
  ok('c4 a-esquiva', !bad.length, `${res.join(' ')}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c5: as mãos ================================
if (want('c5')) {
  const v = v0; live(v); arm(v, [['espada.bronze', 'mao']]); const t = [...S.villagers.values()].filter(o => used.has(o.id) && o.id !== v.id && S.villagers.has(o.id))[0] || pickAdult();
  used.add(t.id); stand(t, 1.0, 0); t.hp = 100; clear([v, t]); const bad = [], res = [];
  const b = Av.state(); const caps = b.caps.stamina; const mv = Cb.move('espada', 0);
  // the press: the gesture begins in the same frame; the blow lands once, at its contact
  const st0 = b.stamina; press('atacar'); const a0 = Av.actNow(); release('atacar');
  if (!a0 || a0.anim !== mv.clip) bad.push(`o aperto não começou o golpe no mesmo quadro (${a0 ? a0.anim : 'nada'})`);
  const spent = r2(st0 - b.stamina); if (Math.abs(spent - mv.fol) > 0.5) bad.push(`gastou ${spent} de fôlego (devia ${mv.fol})`);
  let hitAt = -1, n = 0, uAt = 0; const h0 = t.hp;
  frames(60, k => { const a = Av.actNow(); if (t.hp < h0 && hitAt < 0) { hitAt = k; uAt = a ? r2(a.t / a.dur) : 1; } if (t.hp < h0) n++; return !a && hitAt >= 0; });
  const lands = r2(100 - t.hp); res.push(`do aperto ao gesto: 0 quadros; o golpe acertou ${lands} no quadro ${hitAt} (o ato a ${uAt}, o contato a ${mv.hit}), gastou ${spent} de fôlego`);
  if (hitAt < 0) bad.push('o golpe não acertou'); else if (Math.abs(uAt - mv.hit) > 0.08) bad.push(`acertou a ${uAt} do gesto (o contato é ${mv.hit})`);
  if (Math.abs(lands - r2(Cb.dealt(v, Cb.weapon(v), mv, 0))) > 0.05) bad.push(`acertou ${lands} uma vez (devia ${r2(Cb.dealt(v, Cb.weapon(v), mv, 0))})`);
  // the blow seen before it lands: the windup before the contact, far from the contact's pose
  const C = G.Anim3D.CLIPS[mv.clip]; const P = q => G.Anim3D.playClip({}, C, q, 1);
  const wind = P(mv.hit * 0.55), hitP = P(mv.hit); const sw = Math.abs(wind.shRp - hitP.shRp) * 57.3;
  res.push(`o preparo: o ombro ${Math.round(sw)}° do contato, ${Math.round((mv.hit * mv.dur) * 1000)} ms antes`); if (!(sw > 60)) bad.push(`o preparo quase igual ao contato (${Math.round(sw)}°)`);
  // three presses: three blows in a row
  frames(30); const seenI = []; stand(t, 1.0, 0); t.hp = 100;
  for (let k = 0; k < 3; k++) { press('atacar'); release('atacar'); frames(Math.round(mv.dur * 0.62 / RDT), () => { const s = U.state(); if (s.cur && s.cur.i !== undefined && !seenI.includes(s.cur.i)) seenI.push(s.cur.i); return false; }); }
  frames(60, () => !Av.actNow());
  res.push(`três apertos: os golpes ${seenI.join(', ')}`); if (seenI.join() !== '0,1,2') bad.push(`a sequência ${seenI.join(',')} (devia 0,1,2)`);
  // held: the heavy one charging, then let go — stronger, dearer
  frames(30); Av.rest(); stand(t, 1.0, 0); t.hp = 100; const s1 = b.stamina; press('atacar'); let charging = false;
  frames(Math.round(0.75 / RDT), () => { if (U.state().mode === 'carga') charging = true; return false; });
  const ch = U.state().chargeT; release('atacar'); const H = Cb.move('espada', -1); const cost = r2(s1 - b.stamina);
  frames(90, () => !Av.actNow() && t.hp < 100);
  const heavy = r2(100 - t.hp), light = r2(Cb.dealt(v, Cb.weapon(v), mv, 0));
  res.push(`segurando 0,75 s: ${charging ? 'carregou' : 'NÃO carregou'} ${r2(ch)} s, acertou ${heavy} (o leve ${light}), gastou ${cost}`);
  if (!charging) bad.push('segurar não carregou'); if (!(heavy > light * 1.8)) bad.push(`o pesado ${heavy} não é bem mais que o leve ${light}`); if (!(cost >= H.fol - 1)) bad.push(`o pesado gastou ${cost} (devia ${H.fol})`);
  // no breath: no blow
  b.stamina = 0.5; press('atacar'); release('atacar'); const none = Av.actNow(); res.push(`sem fôlego: ${none ? 'golpeou' : 'não golpeou'}`); if (none && none.anim === mv.clip) bad.push('sem fôlego, golpeou'); Av.rest();
  frames(30);
  ok('c5 as-maos', !bad.length, `${res.join(' · ')} (o fôlego do adulto: ${caps})${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c6: o arco ================================
if (want('c6')) {
  const v = v0; live(v); arm(v, [['arco', 'outra'], ['flecha.bronze', null, 10]]);
  const t = [...S.villagers.values()].filter(o => used.has(o.id) && o.id !== v.id && S.villagers.has(o.id))[0] || pickAdult(); used.add(t.id);
  const bad = [], res = []; const L0 = D.ledger ? null : null; void L0;
  stand(t, 10, 0); t.hp = 100;
  // the shot at the chest of someone 10 m ahead, by the arrow's own fall
  const p = Av.pos(); const from = [p.X + Math.cos(YAW) * 0.3, p.Y + 1.42, p.Z + Math.sin(YAW) * 0.3]; const tX = t.x * TL, tZ = t.y * TL, tY = G.Space.groundY(tX, tZ) + 1.25;
  const aimAt = (X, Y, Z, k) => { const dx = X - from[0], dy = Y - from[1], dz = Z - from[2]; const dh = Math.hypot(dx, dz); const sp = Cb.SPEED * (0.55 + 0.45 * k); const tt = dh / sp; const vy = (dy + 0.5 * Cb.GRAV * tt * tt) / tt; const n = Math.hypot(dx / tt, vy, dz / tt); return [dx / tt / n, vy / n, dz / tt / n]; };
  const n0 = Cb.arrows(v); const r = god(() => Cb.shoot(v, { from, dir: aimAt(tX, tY, tZ, 1), k: 1 }));
  const inAir = Cb.flights().length; let flew = 0;
  frames(120, () => { flew++; return !Cb.flights().length; });
  const n1 = Cb.arrows(v); res.push(`a 10 m: ${r.ok ? 'atirou' : 'NÃO atirou: ' + r.why}; ${inAir} no ar; ${flew} quadros de voo; acertou ${r2(100 - t.hp)}; flechas ${n0} → ${n1}`);
  if (!r.ok || inAir !== 1) bad.push('a flecha não saiu'); if (!(t.hp < 100)) bad.push('a flecha não acertou'); if (n1 !== n0 - 1) bad.push(`a mochila ${n0} → ${n1}`);
  // a miss: up into the empty air ahead — it falls, and is picked up again
  stand(t, 3, 4); const r2b = god(() => Cb.shoot(v, { from, dir: [Math.cos(YAW) * 0.9, 0.42, Math.sin(YAW) * 0.9], k: 0.6 }));
  frames(240, () => !Cb.flights().length);
  const fell = (S.loose || []).filter(o => /^flecha/.test(o.k)).sort((a, b) => b.id - a.id)[0];
  const dist = fell ? r2(G.dist(fell.x, fell.y, X0, Y0) * TL) : 0; let picked = null;
  if (fell) { v.x = fell.x; v.y = fell.y; Av.detach(); Av.attach(v, YAW); frames(2); picked = god(() => G.Inv.pick(v, fell.id)); }
  res.push(`o tiro no vazio: ${r2b.ok ? 'atirou' : 'não'}; ${fell ? `caiu a ${dist} m` : 'NÃO CAIU'}; ${picked && picked.ok ? 'pega de volta' : 'não pega: ' + (picked ? picked.why : '-')}; flechas ${Cb.arrows(v)}`);
  if (!fell) bad.push('a flecha que errou não caiu no chão'); else if (!(picked && picked.ok)) bad.push('a flecha caída não se pega');
  // the ledger: every step of the arrows, said
  const codes = new Set(); for (const e of (D.log ? D.log() : S.ledger || [])) if (e && e[8] && /^flecha/.test(String(e[8]))) codes.add(e[8]);
  res.push(`o livro: ${[...codes].sort().join(', ') || '(sem as linhas)'}`);
  // the keys: the aim with defender, the draw with atacar, let go
  live(v); arm(v, [['arco', 'outra'], ['flecha.bronze', null, 5]]); const k0 = Cb.arrows(v);
  press('defender'); frames(5); const aiming = C3.aiming(); press('atacar'); frames(Math.round(0.8 / RDT)); const drawn = U.state().drawT; release('atacar'); frames(2);
  const flying = Cb.flights().length; frames(200, () => !Cb.flights().length); release('defender'); frames(3);
  res.push(`as teclas: defender ${aiming ? 'mirou' : 'NÃO mirou'}; atacar puxou ${r2(drawn)} s; soltou: ${flying ? 'a flecha voou' : 'NADA voou'}; flechas ${k0} → ${Cb.arrows(v)}; ao soltar defender, mira ${C3.aiming() ? 'ainda' : 'desfeita'}`);
  if (!aiming || !flying || Cb.arrows(v) !== k0 - 1 || C3.aiming()) bad.push('as teclas do arco');
  ok('c6 o-arco', !bad.length, `${res.join(' · ')}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c8: o duelo ================================
if (want('c8')) {
  const v = v0; live(v); arm(v, [['espada.bronze', 'mao']]); const bad = [], res = [];
  const F = G.Fac.idOfV(v);
  const war = pickAdult(o => o.role === 'guerreiro' && G.Fac.idOfV(o) === F && o.hp >= 60) || pickAdult(o => o.courage > 0.8 && G.Fac.idOfV(o) === F);
  const kid = [...S.villagers.values()].filter(o => o.age >= 8 && o.age < 14 && G.Fac.idOfV(o) === F).sort((a, b) => a.id - b.id)[0];
  const old = [...S.villagers.values()].filter(o => o.age >= 65 && G.Fac.idOfV(o) === F).sort((a, b) => a.id - b.id)[0];
  for (const [o, nm] of [[kid, 'a criança'], [old, 'o velho']]) { if (!o) continue; stand(o, 1.2, 0); const r = god(() => Cb.challenge(v, o)); res.push(`${nm}: ${r.ok ? 'ACEITOU' : 'recusou («' + r.why + '»)'}`); if (r.ok) bad.push(`${nm} aceitou`); }
  if (!war) { ok('c8 o-duelo', false, 'nenhum guerreiro para desafiar'); }
  else {
    used.add(war.id); war.courage = Math.max(war.courage, 0.9); stand(war, 1.5, 0); war.hp = 100;
    // the F on the person: the verb of the provider, «Desafiar»
    const p = G.Interact.list.find(q => q.id === 'pessoa'); const vb = p && p.verbs ? p.verbs(G.Interact.ctx(), { o: war, X: war.x * TL, Z: war.y * TL }) : [];
    const fv = vb.find(x => x.k === 'outra'); res.push(`o F: ${fv ? '«' + fv.label(G.Interact.ctx(), { o: war }) + '»' : 'NENHUM VERBO'}`); if (!fv) bad.push('sem o verbo Desafiar');
    const r = god(() => Cb.challenge(v, war)); res.push(`${war.name} (${war.role}): ${r.ok ? 'aceitou' : 'recusou: ' + r.why}`);
    if (!r.ok) bad.push('o guerreiro recusou');
    else {
      const crimes0 = (S.crimes || []).filter(c => c.victim === war.id).length; const hits = []; clear([v, war]);
      // (the world's own blows at the body, counted where war.js gives them — hit or missed)
      const s0 = G.War.strike; G.War.strike = function (a, o) { if (o && o.id === v.id && a.id === war.id) hits.push(S.clock); return s0.apply(this, arguments); };
      // the other comes at the body, on the body's clock; after eight seconds the body strikes back until the other yields
      let k = 0; const T = Cb.bodyTime(); let near = 9;
      frames(Math.round(30 / RDT), i => {
        if (v.hp < 60) v.hp = 100; // (the proof keeps the body standing: the other's blows are counted, not the yielding of the body)
        near = Math.min(near, G.dist(v.x, v.y, war.x, war.y) * TL);
        if (i % 60 === 0) clear([v, war]);
        if (i > 8 / RDT) { const dd = G.dist(v.x, v.y, war.x, war.y) * TL; C3.yaw = Math.atan2(war.y - v.y, war.x - v.x); IN.mz = dd > 1.15 ? 0.7 : 0;
          if (dd <= 1.3 && i % 30 === 0 && war.hp > Cb.YIELD + 1) { k++; strikeNow(v, { i: 0, yaw: C3.yaw }); } }
        return !Cb.duel();
      });
      stop(); G.War.strike = s0; res.push(`ele chegou a ${r2(near)} m do corpo`); if (near > 1.9) bad.push(`quem duela golpeia de ${r2(near)} m`);
      const gaps = hits.slice(1).map((t, i) => (t - hits[i]) / T).filter(g => g < 3); const mg = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      const end = Cb.events().filter(e => e.kind === 'fim').pop();
      res.push(`${hits.length} golpes dele (acertados ou não), um a cada ${r2(mg)} s do corpo (o sorteio da guerra, 0,8 a 1,1 s, no tempo do corpo); ${k} golpes do corpo; fim: ${end ? end.how : 'NÃO ACABOU'}; ${war.name} com ${r2(war.hp)} de vida, ${S.villagers.has(war.id) ? 'vivo' : 'MORTO'}; crimes contra ele ${crimes0} → ${(S.crimes || []).filter(c => c.victim === war.id).length}`);
      if (hits.length < 3 || !(mg > 0.7 && mg < 1.4)) bad.push(`os golpes dele a cada ${r2(mg)} s do corpo`);
      if (!end || end.how !== 'rendeu') bad.push('o duelo não acabou com quem se rendeu');
      if (!S.villagers.has(war.id)) bad.push('o duelo matou'); if ((S.crimes || []).filter(c => c.victim === war.id).length !== crimes0) bad.push('o duelo virou crime');
      if (war.task && war.task.duel) bad.push('quem se rendeu continua lutando');
    }
  }
  ok('c8 o-duelo', !bad.length, `${res.join(' · ')}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c9: os casos ruins ================================
if (want('c9')) {
  const bad = [], res = [];
  const v = v0; live(v); arm(v, [['espada.bronze', 'mao']]);
  const t = pickAdult(o => o.id !== v.id && G.Fac.idOfV(o) === G.Fac.idOfV(v)); used.add(t.id);
  // (a save opened as the game opens it: the body back in the god's hands by the save, the controller attached again)
  const reload = () => { const body = S.avatar && S.avatar.id; M.salvarCarregar(); S = G.S; const b = body && S.villagers.get(body); Av.detach(); if (b && S.avatar) { Av.attach(b, YAW); C3.attach(Av.pos(), YAW); } stop(); return b; };
  // the save in the middle of a blow: nothing lands after it
  stand(t, 1, 0); press('atacar'); release('atacar'); frames(3); const hp0 = t.hp; const vb = reload(); const t2 = S.villagers.get(t.id);
  frames(60); res.push(`o save no meio do golpe: ${t2 && t2.hp === hp0 ? 'nada acertou depois' : 'ACERTOU DEPOIS'}`); if (!t2 || t2.hp !== hp0) bad.push('um golpe de antes do save acertou depois');
  // the save in the middle of a duel
  const w = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && o.id !== vb.id && !o.captive && !o.jail && !o.aboard && !(o.sick > 0) && !(o.lost && (o.lost.armL || o.lost.armR)) && G.Fac.idOfV(o) === G.Fac.idOfV(vb) && !G.Possess.kin(vb, o) && !G.Vg.handsBusy(o)).sort((a, b) => a.id - b.id)[0]; let duelOk = false;
  if (w) { w.hp = 100; G.Vg.endTask(w); }
  let why = w ? '' : 'ninguém para desafiar';
  if (w) { used.add(w.id); w.courage = 0.95; stand(w, 1.5, 0); clear([vb, w]); const r = god(() => Cb.challenge(vb, w)); why = r.ok ? '' : r.why; if (r.ok) { frames(30); const d0 = !!Cb.duel(); reload(); const w2 = S.villagers.get(w.id); duelOk = !!(Cb.duel() && w2 && w2.task && w2.task.type === 'combat' && w2.task.duel); if (!duelOk) why = `antes ${d0 ? 'em duelo' : 'SEM duelo'}; depois ${Cb.duel() ? 'duelo' : 'sem duelo'}, ${w2 ? w2.task ? w2.task.type : 'sem tarefa' : 'sumiu'}`; frames(30); } }
  res.push(`o save no meio do duelo: ${duelOk ? 'o duelo voltou, quem duela luta' : 'PERDIDO (' + why + ')'}`); if (!duelOk) bad.push('o duelo não atravessou o save');
  // the body dies in the middle of the duel: the duel goes with it
  const vb2 = G.Possess.body(); if (Cb.duel() && vb2) { god(() => G.Village.kill(vb2, 'war')); frames(2); res.push(`o corpo morre no duelo: ${Cb.duel() ? 'O DUELO FICOU' : 'o duelo acabou'}`); if (Cb.duel()) bad.push('o duelo ficou sem o corpo'); }
  // a fresh body for the rest
  const v2 = pickAdult(o => G.Possess.can(o).ok); used.add(v2.id); const lv = live(v2); if (!lv) res.push('(não viveu o corpo novo)'); arm(v2, [['espada.bronze', 'mao'], ['arco', null], ['flecha.bronze', null, 4]]);
  // the arrow in the air through a save: it flies on, and its ledger is whole
  god(() => G.Inv.equip(v2, 'arco', 'outra')); const p = Av.pos();
  clear([v2]); const sh = god(() => Cb.shoot(v2, { from: [p.X, p.Y + 1.42, p.Z], dir: [Math.cos(YAW) * 0.8, 0.6, Math.sin(YAW) * 0.8], k: 0.8 })); const ev0 = Cb.events().length; frames(2); if (!sh.ok) res.push(`(o tiro: ${sh.why})`); else if (!Cb.flights().length) res.push(`(a flecha: ${JSON.stringify(Cb.events().slice(-2))})`);
  const air0 = Cb.flights().length; reload(); const air1 = Cb.flights().length; frames(300, () => !Cb.flights().length); const air2 = Cb.flights().length;
  res.push(`a flecha no ar no save: ${air0} → ${air1} depois do load → ${air2} quando desceu`); if (air0 !== 1 || air1 !== 1 || air2 !== 0) bad.push('a flecha no ar não atravessou o save');
  // the body given back with an arrow in the air: down where it is
  const vb3 = G.Possess.body(); const pp = Av.pos(); god(() => Cb.shoot(vb3, { from: [pp.X, pp.Y + 1.42, pp.Z], dir: [Math.cos(YAW) * 0.7, 0.7, Math.sin(YAW) * 0.7], k: 0.8 })); frames(1);
  const loose0 = (S.loose || []).filter(o => /^flecha/.test(o.k)).length; G.Possess.release('deus'); Av.detach();
  const loose1 = (S.loose || []).filter(o => /^flecha/.test(o.k)).length; res.push(`o corpo devolvido com a flecha no ar: ${Cb.flights().length ? 'FICOU NO AR' : 'desceu'} (${loose0} → ${loose1} no chão)`); if (Cb.flights().length || loose1 !== loose0 + 1) bad.push('a flecha ficou no ar sem corpo');
  // the target dies in the middle of a blow; the god's hand takes it
  live(vb3); arm(vb3, [['espada.bronze', 'mao']]); const t3 = pickAdult(o => o.id !== vb3.id); used.add(t3.id); stand(t3, 1, 0);
  press('atacar'); release('atacar'); frames(4); god(() => G.Village.kill(t3, 'old')); frames(60); res.push('o alvo morre no meio: sem erro');
  const t4 = pickAdult(o => o.id !== vb3.id); used.add(t4.id); stand(t4, 1, 0); t4.held = true; const rh = strikeNow(vb3, { i: 0, yaw: YAW }); t4.held = false;
  res.push(`na mão do deus: ${rh.hits.length ? 'ACERTOU' : 'não acertou'}`); if (rh.hits.length) bad.push('acertou quem está na mão do deus');
  // a beast bites the body at its guard: the shield's share; a giant's, half of it
  arm(vb3, [['espada.bronze', 'mao'], ['escudo.bronze', 'outra']]); god(() => Cb.guard(vb3, true)); frames(Math.ceil((Cb.PARRY + 0.05) / RDT));
  const [bx, by] = fwd(1.6, 0); const lion = god(() => G.Animals.spawn('lion', bx, by, { age: 6, grown: 1, hunger: 0.1, t: 999, scan: 999, rest: 0 }));
  vb3.lastBeastId = lion.id; vb3.lastBeast = 'lion'; const h0 = vb3.hp; god(() => G.Vg.damage(vb3, 20, 'beast')); const lb = r2(h0 - vb3.hp); vb3.hp = 100;
  const rh2 = god(() => G.Animals.spawn('rhino', bx, by + 0.01, { age: 8, grown: 1, hunger: 0.1, t: 999, scan: 999, rest: 0 })); vb3.lastBeastId = rh2.id; vb3.lastBeast = 'rhino';
  const h1 = vb3.hp; god(() => G.Vg.damage(vb3, 20, 'beast')); const rb = r2(h1 - vb3.hp); vb3.hp = 100;
  res.push(`a mordida do leão na guarda: ${lb} de 20; a chifrada do rinoceronte: ${rb} de 20`); if (!(lb < 20 && rb > lb && rb < 20)) bad.push('a guarda contra as feras');
  god(() => { G.Animals.remove(lion); G.Animals.remove(rh2); Cb.guard(vb3, false); });
  const e = M.erros(); if (Object.keys(e.mod).length || e.console.length) bad.push('erros: ' + JSON.stringify(e.mod) + ' ' + e.console.slice(0, 2).join(' | '));
  ok('c9 os-casos-ruins', !bad.length, `${res.join(' · ')}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c10: as lutas do mundo, desenhadas ================================
if (want('c10')) {
  const bad = [], res = []; const A = G.Anim3D;
  const f = pickAdult(o => G.Possess.can(o).ok); const e = pickAdult(o => o.id !== f.id); used.add(f.id); used.add(e.id);
  if (G.Possess.body()) G.Possess.release('deus'); Av.detach();
  stand(f, 2, 0); f.x = X0; f.y = Y0; G.Vg.setTask(f, { type: 'combat', id: e.id, pri: 4.2, any: true, kind: 'combat' }); f.act = 'fight'; f.actT = 0;
  const k = Cb.classOf(G.Inv.held(f).mao); const st = A.stateOf(f, 0); const C = A.CLIPS[st];
  const u = C && C.period > 0 ? A.loopTime(C, 0, C.period) : -1;
  res.push(`quem luta: «${st}» (${k}), o contato no golpe do mundo: ${r2(u)} = ${C ? C.events.contact : '?'}, a cada ${C ? C.period : '?'} s do mundo`);
  if (st !== 'cb-mundo-' + k || !C || Math.abs(u - C.events.contact) > 1e-6) bad.push('o gesto de quem luta');
  // the one fighting the body: on the body's clock
  const vb = pickAdult(o => G.Possess.can(o).ok && o.id !== e.id); used.add(vb.id); live(vb); G.Vg.setTask(e, { type: 'combat', id: vb.id, pri: 4.2, any: true, kind: 'combat' }); e.act = 'fight'; e.actT = 0; e.downT = 0; e.stagT = 0;
  const st2 = A.stateOf(e, 0); const C2 = A.CLIPS[st2]; res.push(`quem luta com o corpo: «${st2}», a cada ${C2 ? r2(C2.period) : '?'} s do mundo`);
  if (!/^cb-corpo-/.test(st2) || !C2 || Math.abs(C2.period - 1.1 * Cb.bodyTime()) > 1e-6) bad.push('o gesto de quem luta com o corpo');
  e.stagT = S.clock + 0.2; const st3 = A.stateOf(e, 0); e.stagT = 0; e.downT = S.clock + 1; const st4 = A.stateOf(e, 0); e.downT = 0;
  res.push(`o tranco: «${st3}»; a queda: «${st4}»`); if (st3 !== 'cb-tranco' || st4 !== 'knocked') bad.push('o tranco ou a queda');
  G.Vg.endTask(e);
  // the clips: all registered, none refused; every act the fight gives the body has its line of sound
  const mine = Object.keys(A.CLIPS).filter(c => /^cb-/.test(c)); const miss = []; for (const cls in Cb.MOVES) for (const m of [...Cb.MOVES[cls].l, Cb.MOVES[cls].p]) if (!A.CLIPS[m.clip]) miss.push(m.clip);
  const sound = ['golpe', 'guarda', 'mirar'].filter(a => !G.Audio || !G.Audio.ATO || !G.Audio.ATO[a]);
  res.push(`${mine.length} clipes do combate, ${A.clipErr.length} recusados; sem som: ${sound.join(', ') || 'nenhum'}`);
  if (miss.length || A.clipErr.length || sound.length) bad.push(`clipes que faltam ${miss.join(',')}; recusados ${A.clipErr.join('; ')}; sem som ${sound}`);
  ok('c10 as-lutas-do-mundo-desenhadas', !bad.length, `${res.join(' · ')}${bad.length ? ' — ERRADO: ' + bad.join('; ') : ''}`);
}

// ================================ c11: o verificador ================================
{
  const e = M.erros(); const bad = vbad();
  ok('c11a verificador-limpo', !bad.length && !Object.keys(e.mod).length && !e.console.length, `${bad.length ? bad.slice(0, 4).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`).join(' · ') : 'limpo (S0–S2)'}; módulos ${JSON.stringify(e.mod)}; console ${e.console.length ? e.console.slice(0, 2).join(' | ') : 'limpo'}`);
  if (want('c11')) {
    if (G.Possess.body()) G.Possess.release('deus'); Av.detach();
    const c = S.combate || (S.combate = { duel: null, fl: [], br: [] }); const f = { id: S.nextId++, by: v0.id, fac: 0, k: 'flecha.bronze', n: 1, bow: 'arco', kk: 1, X: X0 * TL, Y: 20, Z: Y0 * TL, vx: 1, vy: 0, vz: 0, t: 0.1 };
    c.fl.push(f); const seen = QA.check().filter(q => q.sys === 'combate'); c.fl.splice(c.fl.indexOf(f), 1);
    ok('c11b o-verificador-ve', seen.some(q => /sem um corpo vivido/.test(q.msg)), seen.length ? seen.map(q => `[S${q.sev}] ${q.msg}`).slice(0, 3).join(' · ') : 'NÃO VIU a flecha posta no ar sem corpo');
  }
}
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);

// ================================ c12: as lutas do mundo iguais às de antes ================================
// (a world of the seed, two peoples at war, lived two hundred seconds with nobody's body — here and in the other tree of the game:
// the same deaths, the same chance, the same print of the world — less the fight's own record, which the other tree has not —; each
// tree in a process of its own)
function mundo(baseDir, seed) {
  const cp = require('child_process'), fs = require('fs');
  const here = path.join(__dirname, '..'); const there = baseDir ? path.resolve(baseDir) : null;
  if (!there || !fs.existsSync(path.join(there, 'index.html'))) { console.log('FALHOU | combate c12 | dê a pasta do jogo de antes: node qa/combate.js mundo BASE'); process.exit(1); }
  const code = root => `const M = require(${JSON.stringify(path.join(__dirname, 'nodemundo.js'))}); const G = M.load({ qa: true, root: ${JSON.stringify(root)} });
    ${/^\d+$/.test(String(seed)) ? `M.novo({ seed: ${+seed}, type: 'continente', size: 96, tribes: 3 }); const S = G.S; const F = G.Fac.all().filter(f => f.alive).sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id));
    G.Politics.declareWar(F[0], F[1], 'ambicao'); if (G.War.launchNow) { G.War.launchNow(F[0], {}); G.War.launchNow(F[1], {}); }` : `M.pronto(${JSON.stringify(String(seed))}); const S = G.S;`}
    M.viver(${/^\d+$/.test(String(seed)) ? 200 : 300}); const deaths = {}; for (const r of S.dead.values()) deaths[r.cause] = (deaths[r.cause] || 0) + 1;
    const c = QA.canon(); c.more = c.more.filter(m => m[0] !== 'combate'); const h = require('crypto').createHash('sha1').update(JSON.stringify(c)).digest('hex').slice(0, 12);
    process.stdout.write(JSON.stringify({ rng: S.rng, day: S.day, deaths, war: S.stats.warDeaths || 0, kills: [...S.factions.values()].map(f => f.st && f.st.kills || 0), canon: h, err: M.limpo() ? 0 : 1 }));`;
  const run = root => JSON.parse(cp.execFileSync(process.execPath, ['-e', code(root)], { maxBuffer: 1 << 26 }).toString());
  const a = run(here), b = run(there);
  const same = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${same ? 'PASSOU' : 'FALHOU'} | combate c12 as-lutas-do-mundo-iguais | ${/^\d+$/.test(String(seed)) ? `semente ${seed}, uma guerra de 200 s` : `o mundo pronto «${seed}», 300 s`} sem corpo — aqui ${JSON.stringify(a)}; ${path.basename(there)} ${JSON.stringify(b)}`);
  process.exit(same ? 0 : 1);
}
