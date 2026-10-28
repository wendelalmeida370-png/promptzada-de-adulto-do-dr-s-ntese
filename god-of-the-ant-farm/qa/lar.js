// lar: a vida em casa, provocada de propósito (P1, o Patch 2 — a Parte 3 do pedido), no mundo pronto «cidade» (ou o do
// argumento: node qa/lar.js metropole). Os casos que precisam de outra hora partem do mundo pronto de novo.
//  l1  a noite de uma cidade, das 0,50 às 0,86: cada um deita na sua hora (o relógio de cada um, G.Lar.clock — as crianças
//      antes, os adultos espalhados; quem está cansado pode deitar antes); às 0,78 há gente dormindo e gente acordada em casa;
//      quem entra numa casa entra pela porta, andando; ninguém aparece dentro de uma casa; e o verificador limpo
//  l1b quem dorme dentro de uma casa está deitado (na cama, ou deitado no chão: o lugar da planta — L-228, o repartidor do P4)
//  l5  a morte no meio da noite: quem dormia na mesma casa continua dormindo; o morto sai do save
//  l4  o save no meio da noite: os mesmos dentro, dormindo ou acordados, na mesma tarefa (D-073, L-220); e de manhã cada um
//      levanta na sua hora
//  l6  o deus interfere: o fogo numa casa à noite (quem dormia acorda e sai pela porta) e a casa derrubada com gente dentro
//      (ninguém fica dentro do que caiu)
//  l2  a vigia: um adulto sai para vigiar a vila de noite e quem mora com ele o espera em casa ('esperar'); ele volta
//      andando, entra pela porta, e a espera acaba
//  l3  o doente (L-227): fica de cama em casa enquanto dura a febre, come da despensa pelo livro-razão, sara e sai
//  l7  o corpo encarnado em casa (o adendo 4.1): come à mesa o que a despensa tem e cozinha a ceia da casa, pelas mesmas
//      portas e no livro; dorme em casa; devolvido, segue a vida dele — em casa pelo motivo dele, ou pela porta
//  l12 o ferido fica de cama em casa e sara mais depressa; quem perde o companheiro passa as primeiras horas de luto em casa
//  l14 de dia, um dos velhos da casa cuida dos pequenos (3 a 6 anos) em casa, e os pequenos ficam com ele, sem entrar e sair sem parar
//  l15 o bebê muda de colo onde está (D-074): em casa à noite, a mãe em fúria o passa ao pai ou a alguém da casa, ali; um
//      save no meio; na rua, a quem está perto (sem pulo); sem ninguém perto, à mãe, ao pai ou a uma mulher da vila, onde
//      estiverem (como antes); nunca ao corpo do jogador; a guerreira entre lutas só o dá a alguém da casa; e o corpo, pelas
//      ofertas da casa, pega o bebê no colo, fica com ele e o devolve à mãe
//  l13 a continuidade da casa (o pedido 8.4): o corpo longe, perto, dentro (come e cozinha), fora, o tempo, de volta, o save —
//      a família igual ao ser olhada e ao ver o corpo entrar, a despensa só pelo livro, o corpo deitado em casa no save
//  l11 a reza dentro do templo (L-224): os fiéis entram pela porta até os lugares da planta, os outros nas fileiras de fora;
//      um save no meio; todos terminam e saem
//  l11b quem reza dentro do templo está num lugar de rezar da planta (as esteiras, os bancos, o altar do sacerdote — o
//      repartidor do P4 com a regra do templo)
//  l10 uma festa atravessa o save (L-222) e o banquete sai pelo livro-razão (L-223)
//  l8  dois anos de salto: o verificador limpo — e quanto custa o relógio de cada um no salto
//  l9  um dia inteiro: nenhuma despensa muda fora do livro-razão, a não ser pelos dois caminhos do T-130 ainda abertos (o
//      fim do dia do economy.js e o tributo do court.js, do P2), que aparecem nomeados
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/lar-inv.js'] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = (process.argv[3] || '').split(',').filter(Boolean); // (only these cases: node qa/lar.js cidade l7,l3)
const want = (...ks) => !ONLY.length || ks.some(k => ONLY.includes(k));
const fails = []; const mid = []; const lying = [];
// (the checker's systems the house touches, down to which severity a case fails: the house's own rules to S3. L-228's
// message — asleep and not lying down — is l1b's alone)
const SEV = { lar: 3, act: 2, nan: 2, pop: 2, fam: 2, fome: 2, avatar: 2, int: 2, maos: 2, ids: 2 };
const LYING = 'o lugar da planta não é de deitar', PRAYING = 'fora de um lugar de rezar da planta';
const praying = [];
const PANTRY = 'fora do livro-razão';
const bad = () => QA.check().filter(q => SEV[q.sys] !== undefined && q.sev <= SEV[q.sys] && !String(q.msg).includes(LYING) && !String(q.msg).includes(PRAYING));
let looks = 0;
function watch() {
  looks++;
  const all = QA.check();
  for (const q of all) {
    const m = String(q.msg);
    if (m.includes(LYING)) { if (!lying.includes(m)) lying.push(m); continue; }
    if (m.includes(PRAYING)) { if (!praying.includes(m)) praying.push(m); continue; }
    if (SEV[q.sys] === undefined || q.sev > SEV[q.sys]) continue;
    const k = `S${q.sev} ${q.sys}: ${m}`; if (!mid.includes(k)) mid.push(k);
  }
  return all;
}
const ok = (name, c, info) => { const m = mid.splice(0); const pass = !!c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | lar ${name} | ${info}${m.length ? ' — o verificador no meio: ' + m.slice(0, 3).join(' · ') + (m.length > 3 ? ` (+${m.length - 3})` : '') : ''}`); if (!pass) fails.push(name); };
const L = G.Lar, D = G.Depot, W = G.W, V = G.Village;
if (!L) { console.log('FALHOU | lar | G.Lar não existe'); process.exit(1); }
const r2 = x => Math.round(x * 100) / 100, r3 = x => Math.round(x * 1000) / 1000;
const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
const builtHome = v => { const h = v && v.home ? S.buildings.get(v.home) : null; return h && h.built && h.type !== 'ruin' && housing(h) ? h : null; };
const isBody = v => !!(S.avatar && S.avatar.id === v.id);
const nm = v => `${v.name} #${v.id}`;
const fmtT = t => { const h = t * 24; return `${Math.floor(h)}h${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`; };
let S;
let simIn = false;
// (the ready world, opened again: the case's own hour set by the test's hand, the weather calm)
function open() {
  M.pronto(WORLD); S = G.S; if (!simIn) { G.inSim++; simIn = true; } // (the test's hand counts as the world's: casa.js)
  S.weather.storm = 0; S.weather.rain = 0; for (let k = 0; k < 10; k++) G.debug.step(0.1);
}
// (the world's step, a tenth of a second at a time — G.debug.step itself: M.viver(0.1) can take two, the clock's float sum
// short of the tenth —; after each, the case's own look — true stops —; the checker once a second)
function live(sec, each) { const n = Math.round(sec * 10); for (let k = 0; k < n; k++) { S.weather.storm = 0; G.debug.step(0.1); if (each && each() === true) return true; if (k % 10 === 9) watch(); } return false; }
// (until the world's hour is t — past midnight if it must)
const until = t => ((t - S.time) % 1 + 1) % 1 * G.DAY_LEN;
function liveTo(t, each) { return live(until(t), each); }
// (the hour on an axis that starts at midday: the night is in one piece — 0.87 < 0.97 < 0.05)
const fromNoon = t => ((t - 0.5) % 1 + 1) % 1;
// the biggest town, and its people with a house
const town = () => [...S.settlements.values()].sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
const people = set => [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v.jail && !v.aboard && builtHome(v)).sort((a, b) => a.id - b.id);
// (who comes into a house comes from its door, walking — the step before and the step of it, within three tiles of the door
// or of the tile before it: the way's end of the world's paths —; and nobody turns up inside one: not born there grown, not
// moved from another building in one step)
function doorWatch() {
  const prev = new Map(); const wrong = []; let n = 0; const out = [];
  const keep = () => { for (const v of S.villagers.values()) prev.set(v.id, [v.inside || 0, v.x, v.y]); };
  keep();
  return {
    step() {
      for (const v of S.villagers.values()) {
        if (v.age < 2 || isBody(v)) continue;
        const p = prev.get(v.id);
        if (v.inside && (!p || p[0] !== v.inside)) {
          const b = S.buildings.get(v.inside); if (!housing(b)) continue;
          n++;
          const [fx, fy] = V.frontTile(b); const d = G.Vg.door(b);
          const near = Math.min(G.dist(v.x, v.y, fx, fy), G.dist(v.x, v.y, d[0], d[1]));
          if (!p) wrong.push(`${nm(v)} apareceu dentro de ${b.type}#${b.id} (${v.age.toFixed(1)} anos, não estava no mundo no passo anterior)`);
          else if (p[0]) wrong.push(`${nm(v)} passou de dentro de #${p[0]} para dentro de ${b.type}#${b.id} num passo`);
          else { const j = G.dist(v.x, v.y, p[1], p[2]); if (near > 3 || j > 1.2) wrong.push(`${nm(v)} entrou em ${b.type}#${b.id} (${b.w}x${b.h}) a ${r2(near)} da porta (andou ${r2(j)} num décimo de segundo; ${v.task ? v.task.type : 'sem tarefa'})`); }
        } else if (!v.inside && p && p[0]) {
          // (out of a building: at its door)
          const b = S.buildings.get(p[0]); if (b && housing(b)) { const d = G.Vg.door(b); const [fx, fy] = V.frontTile(b); out.push(v.id); const near = Math.min(G.dist(v.x, v.y, d[0], d[1]), G.dist(v.x, v.y, fx, fy)); if (near > 3) wrong.push(`${nm(v)} saiu de ${b.type}#${b.id} a ${r2(near)} da porta`); }
        }
      }
      keep();
    },
    n: () => n, wrong, out,
  };
}
const book = f => D.ledger().filter(f);

// ======================= l1 / l1b: a night in town =======================
open();
let set = town();
console.log(`(${WORLD}: ${set.name}, ${V.pop(set.id)} habitantes, ${people(set).length} com casa; dia ${S.day})`);
// (the night of l1 — the town at 0.86 —, for the cases that go on in it when l1 is not run)
let nightReady = false;
function night() { if (nightReady) return; open(); set = town(); S.time = 0.62; liveTo(0.86); nightReady = true; }
if (want('l1', 'l1b')) {
  S.time = 0.5; M.viver(0.1);
  const dw = doorWatch(); const first = new Map(); const was = new Map(); const energy = new Map();
  for (const v of S.villagers.values()) { was.set(v.id, !!v.sleeping); energy.set(v.id, v.energy); }
  let snap = null;
  const each = () => {
    dw.step();
    for (const v of S.villagers.values()) {
      if (v.set === set.id && v.age >= 2 && !v.captive && builtHome(v) && !isBody(v)) {
        if (v.sleeping && !was.get(v.id) && S.time > 0.6 && !first.has(v.id)) first.set(v.id, { t: S.time, e: energy.get(v.id), bed: L.clock(v).bed, age: v.age, home: v.inside === v.home, task: v.task ? v.task.type : '' });
      }
      was.set(v.id, !!v.sleeping); energy.set(v.id, v.energy);
    }
    if (!snap && S.time >= 0.78) {
      snap = { grownA: 0, grownW: 0, kidsA: 0, kidsN: 0, awakeLate: 0, wake: [], away: new Map() };
      for (const v of people(set)) {
        if (v.inside !== v.home) { if (v.age >= 16 && !v.sleeping) { const w = L.why(v); const k = `${w.code}${v.task ? ':' + v.task.type : ''}`; snap.away.set(k, (snap.away.get(k) || 0) + 1); } continue; }
        if (v.age >= 16) { if (v.sleeping) snap.grownA++; else { snap.grownW++; if (L.clock(v).bed > S.time - 0.01) snap.awakeLate++; if (snap.wake.length < 3) snap.wake.push(`${v.name} (${v.task ? v.task.type + (v.task.what ? ':' + v.task.what : '') : '—'}, deita ${fmtT(L.clock(v).bed)})`); } }
        else if (v.age >= 2 && v.age < 12) { snap.kidsN++; if (v.sleeping) snap.kidsA++; }
      }
    }
  };
  liveTo(0.86, each);
  const grown = [...first.values()].filter(f => f.age >= 16), kids = [...first.values()].filter(f => f.age < 12);
  const early = grown.filter(f => f.t < f.bed - 0.01 && f.e >= 30);
  const ts = grown.map(f => f.t); const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const span = ts.length ? Math.max(...ts) - Math.min(...ts) : 0;
  const mg = mean(ts), mk = mean(kids.map(f => f.t));
  const fine = dw.n() >= 5 && !dw.wrong.length && grown.length >= 5 && early.length <= Math.max(1, grown.length * 0.05) && span >= 0.03 && (!kids.length || mk < mg - 0.02)
    && !!snap && snap.grownA > 0 && snap.grownW > 0 && (!snap.kidsN || snap.kidsA >= snap.kidsN * 0.6);
  ok('l1 cada um na sua hora', fine, `${dw.n()} entradas em casa${dw.wrong.length ? ` — ERRADAS: ${dw.wrong.slice(0, 3).join(' · ')}` : ', todas pela porta'}; ${grown.length} adultos deitaram entre ${fmtT(Math.min(...ts))} e ${fmtT(Math.max(...ts))} (média ${fmtT(mg)}), ${kids.length} crianças em média às ${kids.length ? fmtT(mk) : '—'}; antes da própria hora sem cansaço: ${early.length}${early.length ? ' (' + early.slice(0, 2).map(f => `${fmtT(f.t)} < ${fmtT(f.bed)}, ${f.task}`).join(', ') + ')' : ''}; às ${snap ? '0,78' : '—'}: ${snap ? `${snap.grownA} adultos dormindo e ${snap.grownW} acordados em casa (${snap.awakeLate} pela hora deles: ${snap.wake.join(', ')}), ${snap.kidsA} de ${snap.kidsN} crianças dormindo; adultos acordados fora de casa: ${[...snap.away].map(([k, n]) => `${k} ${n}`).join(', ') || 'nenhum'}` : 'NÃO CHEGOU'}`);
  ok('l1b quem dorme está deitado', !lying.length, lying.length ? `${lying.length} de pé ou sentados dormindo (L-228, o repartidor do P4): ${lying.slice(0, 2).join(' · ')}` : `${looks} olhadas do verificador: ninguém dormindo de pé`);
  nightReady = true;
}

// ======================= l5: a death in the night =======================
if (want('l5')) {
  night();
  const homes = new Map(); for (const v of S.villagers.values()) if (v.inside && v.sleeping && v.inside === v.home && v.age >= 16 && !isBody(v)) { const L0 = homes.get(v.inside) || []; L0.push(v); homes.set(v.inside, L0); }
  const pick = [...homes.entries()].filter(e => e[1].length >= 2).sort((a, b) => b[1].length - a[1].length || a[0] - b[0])[0];
  if (!pick) ok('l5 a morte no meio da noite', false, 'nenhuma casa com dois adultos dormindo dentro às 0,86');
  else {
    const [hid, list] = pick; const dead = list.slice().sort((a, b) => b.age - a.age || a.id - b.id)[0]; const rest = list.filter(v => v !== dead);
    V.kill(dead, 'old');
    live(3);
    const still = rest.filter(v => S.villagers.has(v.id) && v.sleeping && v.inside === hid);
    const saved = JSON.parse(G.Save.serialize()); const inSave = (saved.lar || []).some(e => e[0] === dead.id);
    ok('l5 a morte no meio da noite', !S.villagers.has(dead.id) && still.length === rest.length && !inSave, `${nm(dead)} morreu dormindo na casa #${hid}; ${still.length} de ${rest.length} que dormiam com ele seguem dormindo${still.length < rest.length ? ' — ACORDARAM: ' + rest.filter(v => !still.includes(v)).map(v => `${nm(v)} (${v.task ? v.task.type : '—'})`).join(', ') : ''}; no save de quem está em casa: ${inSave ? 'O MORTO AINDA ESTÁ' : 'não está'}`);
  }
}

// ======================= l4: a save in the middle of the night, and the morning =======================
if (want('l4')) {
  night();
  const snapOf = () => { const m = new Map(); for (const v of S.villagers.values()) { if (v.age < 2 || isBody(v)) continue; const t = v.task; m.set(v.id, [v.inside || 0, v.sleeping ? 1 : 0, t ? t.type : '', t && t.what ? t.what : '']); } return m; };
  const a = snapOf();
  const atHome = [...S.villagers.values()].filter(v => v.inside && housing(S.buildings.get(v.inside)) && v.task && (v.task.type === 'sleep' || v.task.type === 'lar')).length;
  const rt = QA.roundTrip(); S = G.S;
  const b = snapOf(); const moved = [];
  for (const [id, x] of a) {
    if (!x[0] && !x[1]) continue; // (out and awake: the save lets them be as they were — their errands are the world's)
    const y = b.get(id); const v = S.villagers.get(id);
    const kept = y && x[0] === y[0] && x[1] === y[1] && x[2] === y[2] && x[3] === y[3];
    if (!kept && (x[2] === 'sleep' || x[2] === 'lar' || x[2] === 'shelter' || x[2] === 'pray')) moved.push(`${v ? nm(v) : '#' + id}: ${x.join('/')} → ${y ? y.join('/') : 'sumiu'}`);
  }
  const lar = rt.diff.filter(d => d.includes('"lar"') || d.includes('"festas"'));
  // the morning: each grown one asleep now gets up at their own hour (not before), and not all at once
  const asleep = [...S.villagers.values()].filter(v => v.sleeping && v.age >= 16 && !isBody(v) && v.set === set.id);
  const woke = new Map(); const wasA = new Map(asleep.map(v => [v.id, true]));
  liveTo(0.16, () => { for (const v of asleep) if (wasA.get(v.id) && !v.sleeping && !woke.has(v.id) && S.villagers.has(v.id)) woke.set(v.id, { t: S.time, wake: L.clock(v).wake, hunger: v.hunger, task: v.task ? v.task.type : '' }); });
  const ws = [...woke.values()];
  const soon = ws.filter(w => fromNoon(w.t) < fromNoon(w.wake) - 0.005 && w.hunger < 80 && w.task !== 'flee' && w.task !== 'fire');
  const span = ws.length ? Math.max(...ws.map(w => fromNoon(w.t))) - Math.min(...ws.map(w => fromNoon(w.t))) : 0;
  ok('l4 o save no meio da noite', !lar.length && !moved.length && ws.length >= 3 && soon.length <= Math.max(1, ws.length * 0.05) && span >= 0.02,
    `${atHome} em casa no save (${rt.bytes} caracteres)${lar.length ? ' — DIFERENÇA: ' + lar.slice(0, 2).join(' · ') : ', a mesma casa depois'}${moved.length ? ` — MUDARAM: ${moved.slice(0, 3).join(' · ')}` : ''}${rt.diff.length > lar.length ? ` (outras partes do save: ${rt.diff.length - lar.length})` : ''}; de manhã ${ws.length} de ${asleep.length} acordaram, entre ${ws.length ? fmtT(ws.slice().sort((x, y) => fromNoon(x.t) - fromNoon(y.t))[0].t) : '—'} e ${ws.length ? fmtT(ws.slice().sort((x, y) => fromNoon(y.t) - fromNoon(x.t))[0].t) : '—'}; antes da própria hora: ${soon.length}${soon.length ? ' (' + soon.slice(0, 2).map(w => `${fmtT(w.t)} < ${fmtT(w.wake)}`).join(', ') + ')' : ''}`);
  nightReady = false;
}

// ======================= l6: the god's fire on a house at night; a house pulled down with people in it =======================
if (want('l6')) {
  open(); set = town(); S.time = 0.83;
  const sleepersIn = () => { const m = new Map(); for (const v of S.villagers.values()) if (v.inside > 0 && v.sleeping && v.age >= 2 && housing(S.buildings.get(v.inside)) && !isBody(v)) m.set(v.inside, (m.get(v.inside) || 0) + 1); return m; };
  let m = null; live(60, () => { if (Math.round(S.clock * 10) % 10) return false; m = sleepersIn(); return [...m.values()].filter(n => n >= 2).length >= 2; });
  m = sleepersIn(); const hs = [...m.entries()].filter(e => e[1] >= 1).sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(e => S.buildings.get(e[0]));
  if (hs.length < 2) ok('l6 o fogo e a casa derrubada', false, `só ${hs.length} casa(s) com gente dormindo dentro às ${fmtT(S.time)}`);
  else {
    const [h1, h2] = hs; const in1 = [...S.villagers.values()].filter(v => v.inside === h1.id && v.age >= 2), in2 = [...S.villagers.values()].filter(v => v.inside === h2.id && v.age >= 2);
    const z1 = in1.filter(v => v.sleeping).length, z2 = in2.filter(v => v.sleeping).length;
    const dw = doorWatch(); const c0 = S.clock;
    const lit = G.Nature.ignite(W.idx(h1.x, h1.y), 0.9);
    let out1 = -1; live(4, () => { dw.step(); if (out1 < 0 && !in1.some(v => S.villagers.has(v.id) && v.inside === h1.id)) out1 = S.clock; });
    const stay1 = in1.filter(v => S.villagers.has(v.id) && v.inside === h1.id);
    V.destroyBuilding(h2, 'god');
    const stay2 = in2.filter(v => S.villagers.has(v.id) && v.inside);
    live(5, () => { dw.step(); });
    const inRuin = [...S.villagers.values()].filter(v => v.inside === h2.id);
    ok('l6 o fogo e a casa derrubada', lit && !stay1.length && !stay2.length && !inRuin.length && !dw.wrong.length,
      `o fogo na ${h1.type}#${h1.id} (${in1.length} dentro, ${z1} dormindo): ${stay1.length ? `${stay1.length} FICARAM DENTRO` : `todos fora em ${r2(out1 - c0)} s, pela porta`}${!lit ? ' (O FOGO NÃO PEGOU)' : ''}; a ${h2.origType || h2.type}#${h2.id} derrubada com ${in2.length} dentro (${z2} dormindo): ${stay2.length || inRuin.length ? 'ALGUÉM FICOU DENTRO' : 'ninguém ficou dentro'}${dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ''}`);
  }
}

// ======================= l2: the night watch, and the house that waits =======================
if (want('l2')) {
  open(); set = town(); S.time = 0.62;
  liveTo(0.734);
  // (a grown one awake at home in the evening at home, whose bed time is still a while away, and one of the house awake to
  // go out on the watch)
  let pair = null;
  for (const b of [...S.villagers.values()].filter(o => builtHome(o) && !o.captive).sort((x, y) => x.id - y.id)) {
    // (at the fire or talking — not over the pot or at the table: the cook's while is its own)
    if (b.age < 16 || b.sleeping || b.inside !== b.home || !b.task || b.task.type !== 'lar' || !(b.task.what === 'descansar' || b.task.what === 'conversar') || L.clock(b).bed < S.time + 0.04) continue;
    // (not of a secret society: its people go to its meetings by night — secrets.js, the conclave)
    const a = [...S.villagers.values()].filter(o => o.home === b.home && o.id !== b.id && o.age >= 16 && o.age < 60 && !o.sleeping && !o.captive && !o.jail && !o.aboard && !o.ug && !o.held && !o.air && !o.secret && !isBody(o) && (o.id === b.partner || o.mother === b.id || o.father === b.id)).sort((x, y) => x.id - y.id)[0];
    if (a) { pair = [a, b]; break; }
  }
  if (!pair) ok('l2 a vigia e a casa que espera', false, `ninguém acordado em casa às ${fmtT(S.time)} com alguém da casa para sair de vigia`);
  else {
    const [a, b] = pair; const h = S.buildings.get(b.home); const dw = doorWatch();
    G.Vg.setTask(a, { type: 'patrol', pri: 1.6, torch: true, n: 0 }); // (the test's hand: the four rounds of the watch)
    let waitS = 0, outS = 0, nadaS = 0, back = -1, waitEnd = -1, why = ''; const seq = [], seqB = []; const c2 = S.clock;
    live(180, () => {
      dw.step();
      const out = a.inside !== h.id;
      if (out && back < 0) { outS += 0.1; const w = L.why(a); if (w.code === 'nada') nadaS += 0.1; if (!why) why = w.txt; const k = a.task ? a.task.type + (a.task.what ? ':' + a.task.what : '') : '—'; if ((!seq.length || seq[seq.length - 1][1] !== k) && seq.length < 10) seq.push([r2(S.clock - c2), k]); const kb = (b.task ? b.task.type + (b.task.what ? ':' + b.task.what : '') : '—') + (b.sleeping ? '/dorme' : ''); if ((!seqB.length || seqB[seqB.length - 1][1] !== kb) && seqB.length < 10) seqB.push([r2(S.clock - c2), kb]); if (b.inside === h.id && b.task && b.task.type === 'lar' && b.task.what === 'esperar') waitS += 0.1; }
      if (!out && outS > 1 && back < 0) back = S.clock;
      if (back >= 0 && waitEnd < 0 && !(b.task && b.task.type === 'lar' && b.task.what === 'esperar')) waitEnd = S.clock;
      return back >= 0 && waitEnd >= 0 && S.clock - back > 2;
    });
    const fine = waitS >= 3 && back >= 0 && waitEnd >= 0 && waitEnd - back <= 5 && nadaS < 1 && !dw.wrong.length;
    ok('l2 a vigia e a casa que espera', fine, `${nm(a)} saiu de vigia por ${r2(outS)} s («${why}»${nadaS >= 1 ? `, ${r2(nadaS)} s SEM AFAZER` : ''}); ${nm(b)} esperou em casa ${r2(waitS)} s; ${back >= 0 ? `${a.name} voltou${dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ' pela porta'}, e a espera acabou ${waitEnd >= 0 ? r2(waitEnd - back) + ' s depois' : 'NUNCA'}` : `${a.name} NÃO VOLTOU em 180 s`}${back < 0 || nadaS >= 1 || waitS < 3 || process.env.TRACE ? ` [fora: ${seq.map(x => x.join(' ')).join(' → ')}; em casa: ${seqB.map(x => x.join(' ')).join(' → ')}]` : ''}`);
  }
}

// ======================= l3: the sick one in bed =======================
if (want('l3')) {
  open(); set = town(); S.time = 0.3;
  // (one of the town out of the house by day, at the day's work — not of a secret society: its people are called to its
  // errands at any hour, secrets.js)
  const v = people(set).find(o => o.age >= 18 && o.age < 55 && !o.sleeping && o.inside !== o.home && !(o.sick > 0) && o.hp > 70 && !isBody(o) && !o.secret && o.task && o.task.pri < 2 && o.task.type !== 'sleep');
  if (!v) ok('l3 o doente de cama', false, 'nenhum adulto fora de casa, de dia, para adoecer');
  else {
    const h = builtHome(v); const ref = 'h:' + h.id;
    D.make(ref, 'food', 3, { code: 'teste', part: true, floor: true }); const pan0 = r2(D.get(ref, 'food')); // (the test's hand: food in the house — on the floor if its jars are full, D-059)
    const L0 = S.ledgerN || 0; v.hunger = 60; v.sick = G.DAY_LEN * 0.6; const t3 = S.clock;
    // (in bed, the sick one's own food in the house — the test's hand: a family of five eats a pantry of four at once)
    const dw = doorWatch(); let inBed = -1, work = 0, abed = 0; const trace = []; let last = '';
    live(60, () => { dw.step(); const t = v.task; const k = t ? `${t.type}${t.what ? ':' + t.what : ''}/${t.st}${v.inside ? '/dentro' : ''}` : 'nada'; if (k !== last && trace.length < 14) { trace.push(`${r2(S.clock - t3)} ${k} (fome ${Math.round(v.hunger)})`); last = k; } const a = t && t.type === 'lar' && t.what === 'acamado' && t.st === 2 && v.inside === h.id; if (a) abed += 0.1; if (a && inBed < 0) { inBed = S.clock; if (D.get(ref, 'food') < 1) D.make(ref, 'food', 2, { code: 'teste', part: true, floor: true }); } if (inBed >= 0 && !a && L.fever(v)) work += 0.1; return inBed >= 0 && S.clock - inBed > 15; });
    const meals = book(e => e[0] > L0 && e[3] === ref && e[5] === 'food' && (e[8] === 'refeicao' || e[8] === 'ceia') && e[9] === v.id);
    v.sick = G.DAY_LEN * 0.2; // (the fever over: the later days of the illness, up and about)
    let up = -1; live(20, () => { dw.step(); if (up < 0 && !(v.task && v.task.type === 'lar' && v.task.what === 'acamado')) up = S.clock; return up >= 0 && S.clock - up > 2; });
    ok('l3 o doente de cama', inBed >= 0 && meals.length >= 1 && work < 1 && up >= 0 && !dw.wrong.length,
      `${nm(v)} (${v.role || 'sem ofício'}) adoeceu fora de casa: ${inBed >= 0 ? `de cama em casa (#${h.id}) ${r2(abed)} s${work >= 1 ? `, mas ${r2(work)} s FORA DA CAMA com febre` : ''}` : 'NÃO FOI PARA A CAMA'}; comeu da despensa (${pan0} de comida) ${meals.length} vez(es) pelo livro (${meals.map(e => e[8]).join(', ') || 'nada'}); sarou e ${up >= 0 ? `levantou (${v.task ? v.task.type : '—'})` : 'NÃO LEVANTOU'}${dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ''}${inBed < 0 || work >= 1 || !meals.length ? ` [as tarefas: ${trace.join(' → ')}]` : ''}`);
  }
}

// ======================= l7: the god's body at home =======================
if (want('l7')) {
  open(); set = town(); S.time = 0.62;
  const TL = G.Space.TILE;
  // (a point of the room near a piece's place where the body stands — the plan's own floor, within the walls)
  const standNear = (b, x, y, lv) => { for (let r = 0; r <= 1.2; r += 0.25) for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; const X = x * TL + Math.cos(a) * r, Z = y * TL + Math.sin(a) * r; const ins = G.Space.indoor(X, Z, lv, b.id); if (ins && ins.b === b && ins.shell && ins.walk) return [X / TL, Z / TL, ins.lv]; if (!r) break; } return null; };
  const slot = (b, uses) => { for (const u of uses) for (const q of G.Interiors.slots(b, u)) return { x: b.x + q.spot.x / TL, y: b.y + q.spot.z / TL, lv: q.item.lv }; return null; };
  let v = null, h = null, tab = null, fire = null;
  for (const o of people(set)) {
    if (o.age < 18 || o.age >= 60 || o.sleeping || isBody(o) || !G.Possess.can(o).ok) continue;
    const b = builtHome(o); if (!G.Space.planNow(b)) continue;
    const t1 = slot(b, ['comer', 'sentar', 'aquecer']), f1 = slot(b, ['cozinhar', 'assar', 'aquecer']); if (!t1 || !f1) continue;
    const ts = standNear(b, t1.x, t1.y, t1.lv), fs = standNear(b, f1.x, f1.y, f1.lv); if (!ts || !fs) continue;
    v = o; h = b; tab = ts; fire = fs; break;
  }
  if (!v) ok('l7 o corpo em casa', false, 'nenhum adulto com casa de planta pronta, com mesa (ou banco, ou fogo) e fogo');
  else {
    const ref = 'h:' + h.id; D.make(ref, 'food', 3, { code: 'teste', part: true, floor: true }); v.hunger = 50;
    const fam = [...S.villagers.values()].filter(o => o.home === h.id && o.id !== v.id);
    const famOf = () => fam.map(o => [o.id, o.inside || 0, o.sleeping ? 1 : 0, o.task ? o.task.type : ''].join('/')).join(' ');
    const f0 = famOf();
    const took = G.Possess.take(v);
    const f1 = famOf();
    // (the body walks in by the door — the 3D's controller in the game; the test's hand here: in the room, by the table)
    const goTo = p => { v.inside = h.id; v.x = p[0]; v.y = p[1]; v.path = null; v.moving = false; G.Possess.setLevel(p[2]); };
    const sts = []; const st = tag => sts.push(`${tag}: dentro ${v.inside} dorme ${v.sleeping ? 1 : 0} andar ${G.Possess.level()} cômodo ${G.Possess.indoorOK(v) ? 'ok' : 'NÃO'} energia ${Math.round(v.energy)}`);
    goTo(tab); live(0.5); st('à mesa');
    const offer = id => G.Act.offers(v, v.x, v.y).find(o => o.id === id);
    const doIt = o => { const it = G.Possess.apply(() => G.Act.perform(v, o)); live(0.3); return it.res || { ok: false, why: 'o mundo não fez' }; };
    const L0 = S.ledgerN || 0; const hu0 = v.hunger;
    const oe = offer('lar.comer:' + h.id); const re = oe ? doIt(oe) : { ok: false, why: 'sem a oferta de comer' };
    const ate = book(e => e[0] > L0 && e[3] === ref && e[5] === 'food' && (e[8] === 'refeicao' || e[8] === 'ceia') && e[9] === v.id);
    goTo(fire); live(0.3);
    const oc = offer('lar.cozinhar:' + h.id); const rc = oc ? doIt(oc) : { ok: false, why: 'sem a oferta de cozinhar' };
    const cooked = h.ceia === S.day; const deeds = S.avatar ? Object.assign({}, S.avatar.deeds) : {};
    st('no fogo'); v.energy = Math.min(v.energy, 60);
    if (process.env.TRACE) { let iv = v.inside, sv = v.sleeping; Object.defineProperty(v, 'inside', { configurable: true, enumerable: true, get() { return iv; }, set(x) { if (x !== iv) console.log(`  >> inside ${iv} -> ${x} @ ${new Error().stack.split('\n').slice(2, 7).map(l => l.trim().replace(/^at /, '').replace(/\(.*\/(js|qa)\//, '($1/')).join(' < ')}`); iv = x; } }); Object.defineProperty(v, 'sleeping', { configurable: true, enumerable: true, get() { return sv; }, set(x) { if (!!x !== !!sv) console.log(`  >> sleeping ${sv} -> ${x} @ ${new Error().stack.split('\n').slice(2, 7).map(l => l.trim().replace(/^at /, '').replace(/\(.*\/(js|qa)\//, '($1/')).join(' < ')}`); sv = x; } }); }
    G.Possess.sleep(v); st('deitou'); live(3); st('3 s depois'); // (tired: the body sleeps on — rested, it wakes)
    const slept = v.sleeping && v.inside === h.id;
    const dwr = doorWatch(); G.Possess.release('deus'); live(4, () => { dwr.step(); });
    const t = v.task; const homeNow = v.inside === h.id && t && (t.type === 'sleep' || t.type === 'lar' || t.type === 'shelter');
    const outNow = !v.inside && dwr.out.includes(v.id) && !dwr.wrong.length;
    ok('l7 o corpo em casa', took.ok && f0 === f1 && !!re.ok && ate.length === 1 && v.hunger < hu0 && !!rc.ok && cooked && deeds.refeicao >= 1 && deeds.cozinha >= 1 && slept && (homeNow || outNow) && !(t && t.type === 'avatar'),
      `${nm(v)} encarnado ${took.ok ? '' : `NÃO (${took.why}) `}— a família ${f0 === f1 ? 'igual' : 'MUDOU'}; comer à mesa: ${re.ok ? `sim (fome ${Math.round(hu0)} → ${Math.round(v.hunger)}, livro: ${ate.map(e => e[8]).join(', ') || 'NADA'})` : 'NÃO: ' + re.why}; cozinhar: ${rc.ok ? `sim (a ceia de hoje: ${cooked ? 'pronta' : 'NÃO'})` : 'NÃO: ' + rc.why}; feitos ${JSON.stringify(deeds)}; dormiu em casa: ${slept ? 'sim' : 'NÃO'}; devolvido: ${homeNow ? `em casa (${t.type}${t.what ? ':' + t.what : ''})` : outNow ? 'saiu pela porta' : `ONDE? (dentro de ${v.inside}, ${t ? t.type : 'sem tarefa'})`}${slept ? '' : ` [${sts.join(' · ')}]`}`);
  }
}

// ======================= l12: the wounded in bed, and the widowed at home in the first hours of grief =======================
if (want('l12')) {
  open(); set = town(); S.time = 0.28;
  const pick = (not) => people(set).find(o => o.age >= 18 && o.age < 55 && !o.sleeping && o.inside !== o.home && !(o.sick > 0) && o.hp > 70 && !isBody(o) && !o.secret && o.task && o.task.pri < 2 && o.task.type !== 'sleep' && !not.includes(o.id) && !o.widow);
  const w = pick([]);
  // (the widowed: one whose partner lives in the same house — the partner dies, the test's hand)
  const p0 = people(set).find(o => o.age >= 20 && o.age < 60 && o.partner && S.villagers.get(o.partner) && S.villagers.get(o.partner).home === o.home && !o.sleeping && !isBody(o) && !o.secret && o.id !== (w && w.id) && o.partner !== (w && w.id) && o.task && o.task.pri < 2);
  if (!w || !p0) ok('l12 o ferido e o enlutado', false, `${w ? '' : 'nenhum adulto para ferir; '}${p0 ? '' : 'nenhum casal na mesma casa'}`);
  else {
    const dw = doorWatch(); const hw = builtHome(w); const hp0 = 30; w.hp = hp0; // (the test's hand: a bad wound — a fall, a beast)
    const dead = S.villagers.get(p0.partner); V.kill(dead, 'teste');
    let inBed = -1, hpBed = 0, healed = -1, txt = '', grief = 0, griefTxt = '', code = '';
    live(90, () => {
      dw.step(); const t = w.task;
      const a = t && t.type === 'lar' && t.what === 'acamado' && t.st === 2 && w.inside === hw.id;
      if (a && inBed < 0) { inBed = S.clock; hpBed = w.hp; txt = L.taskText(w, t); }
      if (inBed >= 0 && healed < 0 && !a) healed = S.clock;
      const tg = p0.task; if (tg && tg.type === 'lar' && tg.what === 'luto' && tg.st === 2 && p0.inside === p0.home) { grief += 0.1; if (!griefTxt) { griefTxt = L.taskText(p0, tg); code = L.why(p0).code; } }
      return healed >= 0 && grief > 5;
    });
    const rate = inBed >= 0 ? r2(((healed >= 0 ? 60 : w.hp) - hpBed) / Math.max(0.1, (healed >= 0 ? healed : S.clock) - inBed)) : 0;
    ok('l12 o ferido e o enlutado', inBed >= 0 && healed >= 0 && rate > 0.5 && grief > 5 && code === 'luto' && !dw.wrong.length,
      `${nm(w)} com ${hp0} de vida: ${inBed >= 0 ? `de cama em casa («${txt}»), sarando ${rate} por segundo (de pé: 0,3), ${healed >= 0 ? `levantou com ${Math.round(w.hp)}` : 'AINDA DE CAMA'}` : 'NÃO FOI PARA A CAMA'}; ${dead.name} morreu: ${p0.name} ${grief > 5 ? `de luto em casa ${r2(grief)} s («${griefTxt}», no cartão: ${code})` : 'NÃO FICOU DE LUTO EM CASA'}${dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ''}`);
  }
}

// ======================= l13: the continuity of a house (the request's 8.4): far, near, in, out, time, back, save =======================
if (want('l13')) {
  open(); set = town(); S.time = 0.6; liveTo(0.7);
  const TL = G.Space.TILE;
  // (the body: a grown one of a house of four or more whose plan is made, out of it now — at the day's end, coming home)
  let v = null, h = null;
  for (const o of people(set)) {
    if (o.age < 18 || o.age >= 60 || o.sleeping || isBody(o) || o.secret || o.inside === o.home || !G.Possess.can(o).ok) continue;
    const b = builtHome(o); if ([...S.villagers.values()].filter(q => q.home === b.id).length < 4 || !G.Space.planNow(b) || !G.Interiors.slots(b, 'deitar').length) continue;
    v = o; h = b; break;
  }
  if (!v) ok('l13 a casa contínua', false, 'nenhum adulto fora de uma casa de quatro com planta e cama');
  else {
    const ref = 'h:' + h.id; const famIds = [...S.villagers.values()].filter(o => o.home === h.id && o.id !== v.id).map(o => o.id);
    const fam = () => famIds.map(id => S.villagers.get(id)).filter(Boolean);
    // (where each of the family is and whether asleep — what a look, a body coming in or a save must not change; the errands
    // change by themselves from one step to the next)
    const famOf = () => fam().map(o => `${o.id}/${o.inside || 0}/${o.sleeping ? 1 : 0}`).join(' ');
    // (the house's pantry by the ledger alone, the whole case: what it had + what the ledger moved in and out)
    let pan = D.get(ref, 'food'), led = 0; const onMv = e => { if (e[5] === 'food') { if (e[3] === ref) led -= e[6]; if (e[4] === ref) led += e[6]; } }; D.onMove.push(onMv);
    const panOK = () => Math.abs(D.get(ref, 'food') - (pan + led)) < 0.01;
    const dw = doorWatch(); const notes = []; let fine = true;
    const say = (tag, c, txt) => { notes.push(`${tag}: ${c ? '' : 'NÃO — '}${txt}`); if (!c) fine = false; };
    // (1) far: the body taken at its work, the house lives
    const took = G.Possess.take(v); const d0 = G.Vg.door(h);
    const away = () => { const a = G.R() * 6.28; for (let r = 18; r >= 6; r -= 2) { const x = d0[0] + Math.cos(a) * r, y = d0[1] + Math.sin(a) * r; if (W.inb(x, y) && W.walkableXY(x, y)) return [x, y]; } return [v.x, v.y]; };
    const put = p => { v.inside = 0; v.x = p[0]; v.y = p[1]; v.path = null; v.moving = false; G.Possess.setLevel(null); };
    put(away()); live(15, () => { dw.step(); });
    say('longe', took.ok && panOK(), `${nm(v)} encarnado longe de casa; a família: ${fam().map(o => L.why(o).code).join(', ')}`);
    // (2) near: at the door, looking — nothing of the house changes for being looked at
    const f1 = famOf(); put([d0[0], d0[1]]); const f2 = famOf(); live(0.1, () => { dw.step(); });
    say('perto', f1 === f2 && panOK(), f1 === f2 ? 'a família igual ao chegar à porta' : `a família mudou: ${f1} → ${f2}`);
    // (3) in: the body walks in (the 3D's controller; the test's hand here), eats at the table and cooks, by the ledger
    const stand = uses => { for (const u of uses) for (const q of G.Interiors.slots(h, u)) { const x = h.x * TL + q.spot.x, z = h.y * TL + q.spot.z; for (let r = 0; r <= 1.2; r += 0.25) for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; const ins = G.Space.indoor(x + Math.cos(a) * r, z + Math.sin(a) * r, q.item.lv, h.id); if (ins && ins.b === h && ins.shell && ins.walk) return [(x + Math.cos(a) * r) / TL, (z + Math.sin(a) * r) / TL, ins.lv]; if (!r) break; } } return null; };
    const table = stand(['comer', 'sentar', 'aquecer']), fire = stand(['cozinhar', 'assar', 'aquecer']);
    D.make(ref, 'food', 3, { code: 'teste', part: true, floor: true }); v.hunger = 50;
    const inside = p => { v.inside = h.id; v.x = p[0]; v.y = p[1]; G.Possess.setLevel(p[2]); };
    const f3 = famOf(); if (table) inside(table); G.debug.step(0.1); dw.step(); const f4 = famOf(); live(0.2, () => { dw.step(); });
    const doIt = id => { const o = G.Act.offers(v, v.x, v.y).find(q => q.id === id); if (!o) return { ok: false, why: 'sem a oferta' }; const it = G.Possess.apply(() => G.Act.perform(v, o)); live(0.3, () => { dw.step(); }); return it.res || { ok: false }; };
    const ra = doIt('lar.comer:' + h.id); if (fire) inside(fire); live(0.2); const rc = doIt('lar.cozinhar:' + h.id);
    // (what changed in the family in the step the body came in, and was not their own errand going on — one coming home to
    // bed or to the evening by the door, one falling asleep in bed)
    const own = (e, f) => { const [id, i0, s0] = e.split('/').map(Number), [, i1, s1] = f.split('/').map(Number); const o = S.villagers.get(id); const t = o && o.task; if (!t) return false; if (!i0 && i1 === h.id && (t.type === 'sleep' || t.type === 'lar' || t.type === 'shelter')) return s0 === s1 || t.type === 'sleep'; if (i0 === i1 && !s0 && s1 && t.type === 'sleep') return true; return false; };
    const diff = (x, y) => { const A = x.split(' '), B = y.split(' '); return A.map((e, k) => e !== B[k] && !own(e, B[k]) ? `${e}→${B[k]} (${(S.villagers.get(+e.split('/')[0]) || {}).task ? S.villagers.get(+e.split('/')[0]).task.type : '-'})` : null).filter(Boolean).join(', '); };
    const dIn = diff(f3, f4);
    say('dentro', !!table && !!fire && !dIn && !!ra.ok && !!rc.ok && panOK(), `${!dIn ? 'a família igual ao entrar (fora o que é da vida dela)' : 'a família MUDOU ao entrar: ' + dIn}; comeu ${ra.ok ? 'sim' : 'NÃO (' + ra.why + ')'}; cozinhou ${rc.ok ? 'sim' : 'NÃO (' + rc.why + ')'}; a despensa pelo livro ${panOK() ? 'sim' : 'NÃO'}`);
    // (4) out and away; (5) the time goes by — the night falls, the house goes to bed; (6) back, at the door
    put([d0[0], d0[1]]); live(0.1, () => { dw.step(); }); put(away());
    liveTo(0.84, () => { dw.step(); });
    put([d0[0], d0[1]]); live(0.2, () => { dw.step(); });
    const asleep = fam().filter(o => o.inside === h.id && o.sleeping).length, home = fam().filter(o => o.inside === h.id).length;
    say('de volta', home >= 1 && panOK(), `às ${fmtT(S.time)}: ${home} da família em casa, ${asleep} dormindo; os de fora: ${fam().filter(o => o.inside !== h.id).map(o => L.why(o).code).join(', ') || 'ninguém'}`);
    // (7) in to bed, and a save: the house as it was, the body in its bed
    if (table) inside(table); v.energy = Math.min(v.energy, 60); G.Possess.sleep(v); live(0.5, () => { dw.step(); });
    const f5 = famOf(); const bed0 = v.sleeping && v.inside === h.id;
    M.salvarCarregar(); S = G.S; v = S.villagers.get(v.id); h = S.buildings.get(h.id); G.debug.step(0.1); // (a step: the babies back in the arms that hold them, babyUpdate)
    const f6 = famOf(); const bed1 = v && v.sleeping && v.inside === h.id && isBody(v);
    say('save', bed0 && f5 === f6 && bed1, `${f5 === f6 ? 'a família igual depois do save' : `a família mudou no save: ${f5} → ${f6}`}; o corpo ${bed0 ? 'deitado em casa' : 'NÃO deitado'} antes, ${bed1 ? 'deitado em casa' : 'NÃO deitado em casa'} depois (possess.js)`);
    D.onMove.splice(D.onMove.indexOf(onMv), 1);
    if (S.avatar) G.Possess.release('deus');
    ok('l13 a casa contínua', fine && !dw.wrong.length, notes.join(' · ') + (dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ''));
  }
}

// ======================= l14: by day, the old mind the little ones at home =======================
if (want('l14')) {
  open(); S.time = 0.12; live(15); // (the morning, after its moves of house: 75 s of the day, before the evening at 0,6)
  // (a house of the world with someone of 62 or more — whose working day weighs less than the minding — and little ones of
  // three to six living in it; one of the old minds them. A small town may have none: then the metropolis)
  // (not a house too full for its beds or a couple without one of their own: someone of it moves out any day — the old one,
  // maybe, and the little ones are no longer hers: act-casa.js)
  const moving = v => !!(G.Casa && G.Casa.need && G.Casa.need(v));
  const findHouse = () => { const houses = new Map(); for (const v of S.villagers.values()) { const h = builtHome(v); if (!h || v.captive) continue; const e = houses.get(h.id) || { h, old: [], kids: [] }; if (v.age >= 62 && !(v.sick > 0) && v.hp >= 50 && !isBody(v) && !moving(v)) e.old.push(v); if (v.age >= 3 && v.age < 7) e.kids.push(v); houses.set(h.id, e); } return [...houses.values()].filter(x => x.old.length && x.kids.length).sort((a, b) => b.kids.length - a.kids.length || a.h.id - b.h.id)[0]; };
  let e = findHouse();
  if (!e && WORLD !== 'metropole') { M.pronto('metropole'); S = G.S; S.weather.storm = 0; S.weather.rain = 0; for (let k = 0; k < 10; k++) G.debug.step(0.1); S.time = 0.12; live(15); e = findHouse(); }
  if (!e) ok('l14 os velhos cuidam dos pequenos em casa', false, 'nenhuma casa com alguém de 62 anos ou mais e crianças de 3 a 6');
  else {
    let h = e.h; const dw = doorWatch(); let minded = 0, kidsHome = 0, n = 0, txt = '', two = 0, reload = '', reloadOk = true; const exits = new Map();
    let died = null, after = '', afterOk = true;
    // (what the old of the house did, second by second, and why one was not minding — for the note when the case fails)
    const seq = []; const whyNot = new Map();
    const notMinding = o => { if (o.home !== h.id) return 'mudou de casa'; if (o.age < 55) return 'idade'; if (o.sick > 0) return 'doente'; if (o.hp < 50) return `ferida (${Math.round(o.hp)})`; if (!builtHome(o)) return 'sem casa'; const t = o.task; return t ? `${t.type}${t.what ? ':' + t.what : ''}` : 'sem tarefa'; };
    live(75, () => {
      dw.step(); n++;
      if (n % 10 === 0 && n <= 550) { const o = S.villagers.get(e.old[0].id); const w = o ? (o.task && o.task.type === 'lar' && o.task.what === 'cuidar' ? 'cuidar' : notMinding(o)) : 'morta'; if (seq[seq.length - 1] !== w) seq.push(w); if (o && w !== 'cuidar') whyNot.set(w, (whyNot.get(w) || 0) + 1); }
      if (n === 550) {
        // (the one minding dies in the middle of the day: another old of the house takes over, or the little ones go about
        // their day — none kept at home by a minder who is gone)
        died = e.old.find(o => o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id) || null;
        if (died) V.kill(died, 'teste');
      }
      if (n === 750 && died) {
        const other = e.old.find(o => o.id !== died.id && S.villagers.has(o.id) && o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id);
        const held = e.kids.filter(o => S.villagers.has(o.id) && o.inside === h.id && o.task && o.task.type === 'lar' && o.task.what !== 'acamado' && o.actT > 16).length;
        afterOk = !!other || !held;
        after = `; ${died.name} morreu aos 55 s: ${other ? `${other.name} passou a cuidar` : held ? `${held} criança(s) AINDA PRESA(S) EM CASA 20 s depois` : 'as crianças voltaram ao dia delas'}`;
      }
      if (died) return;
      if (n === 400) {
        // (the save in the middle of the day: the one minding goes on minding, the little ones at home stay at home)
        const was = e.old.find(o => o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id);
        const kin = e.kids.filter(o => o.inside === h.id).map(o => o.id);
        M.salvarCarregar(); S = G.S; h = S.buildings.get(h.id);
        for (const a of [e.old, e.kids]) for (let k = 0; k < a.length; k++) a[k] = S.villagers.get(a[k].id) || a[k];
        const now = was && S.villagers.get(was.id);
        const kept = !!now && !!now.task && now.task.type === 'lar' && now.task.what === 'cuidar' && now.inside === h.id;
        const kk = kin.filter(id => { const o = S.villagers.get(id); return o && o.inside === h.id; }).length;
        reloadOk = !!was && kept && kk === kin.length;
        reload = was ? `; no save aos 40 s, ${kept ? `${now.name} continua cuidando` : 'O CUIDADO SE PERDEU'} e ${kk} de ${kin.length} criança(s) ainda em casa` : '; aos 40 s, NINGUÉM CUIDANDO para o save';
      }
      const ms = e.old.filter(o => o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id); const m = ms[0];
      if (ms.length > 1) two++;
      if (m) { minded++; if (!txt) txt = L.taskText(m, m.task); const k = e.kids.filter(o => o.inside === h.id && !o.sleeping).length; kidsHome += k; }
      for (const id of dw.out) if (e.kids.some(o => o.id === id)) exits.set(id, (exits.get(id) || 0) + 1);
      dw.out.length = 0;
    });
    const avgKids = minded ? r2(kidsHome / minded) : 0; const loops = [...exits.values()].filter(x => x > 2).length;
    ok('l14 os velhos cuidam dos pequenos em casa', minded >= 200 && avgKids >= 1 && !loops && two <= 20 && reloadOk && afterOk && !!died && !dw.wrong.length,
      `${h.type}#${h.id}: ${e.old.map(o => o.name).join(', ')} (${e.old.map(o => Math.floor(o.age)).join(', ')} anos) e ${e.kids.length} criança(s) de 3 a 6; de dia, cuidando em casa ${r2(minded / 10)} s de 55 («${txt}»), com ${avgKids} criança(s) em casa em média${reload}${after}${died ? '' : '; aos 55 s, NINGUÉM CUIDANDO para morrer'}${two ? `; dois cuidando juntos ${r2(two / 10)} s` : ''}${loops ? `; ${loops} criança(s) ENTRANDO E SAINDO sem parar` : ''}${dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ''}${minded < 200 ? ` — o que ${e.old[0].name} fez: ${seq.slice(0, 12).join(' → ')}; fora do cuidado: ${[...whyNot].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, c]) => `${k} ${c} s`).join(', ')}` : ''}`);
  }
}

// ======================= l15: the baby changes arms where it is (D-074) =======================
if (want('l15')) {
  open();
  const ROUGHT = { band: 1, fight: 1, patrol: 1, drill: 1, guard: 1, hunt: 1 };
  const fit = o => !!o && o.age >= 16 && o.age < 70 && !(o.fury > 0) && o.role !== 'guerreiro' && !o.captive && !o.aboard && !o.ug && !isBody(o) && !(o.task && ROUGHT[o.task.type]);
  const babies = () => [...S.villagers.values()].filter(b => b.age < 2 && !b.ug && !b.captive && b.carrier && b.carrier === b.mother).sort((a, c) => a.id - c.id);
  const near3 = (b, o) => !o.inside && G.dist(o.x, o.y, b.x, b.y) <= 3;
  const others = (b, m) => [...S.villagers.values()].filter(o => o.id !== m.id && o.id !== b.id && o.age >= 14 && near3(b, o));
  const who = id => { const o = S.villagers.get(id); return o ? o.name : id ? '#' + id : 'ninguém'; };
  const notes = []; let good = true; const fail = m => { good = false; notes.push(m.toUpperCase()); };
  // (step by step: the biggest jump of the baby in one step, and the arms it went through)
  const track = (id, sec) => { let b = S.villagers.get(id); let px = b.x, py = b.y, max = 0; const arms = [b.carrier || 0]; live(sec, () => { b = S.villagers.get(id); if (!b) return true; const d = Math.hypot(b.x - px, b.y - py); if (d > max) max = d; px = b.x; py = b.y; if (arms[arms.length - 1] !== (b.carrier || 0)) arms.push(b.carrier || 0); }); return { max, arms }; };
  // (a) at night in the house: the mother in a fury — the father or one of the house takes the baby, there; a save in the
  // middle keeps it in the same arms; the fury over, the mother or the father has it
  liveTo(0.86);
  const A = babies().find(b => { const m = S.villagers.get(b.mother); const h = m && builtHome(m); return !!h && m.inside === h.id && b.inside === h.id && [...S.villagers.values()].some(o => o.id !== m.id && o.home === h.id && o.inside === h.id && fit(o)); });
  if (!A) fail('(a) nenhuma casa à noite com a mãe, o bebê e outro da casa dentro');
  else {
    const m = S.villagers.get(A.mother), h = builtHome(m); m.fury = 6;
    const r1 = track(A.id, 4);
    const before = S.villagers.get(A.id).carrier; M.salvarCarregar(); S = G.S; const after = S.villagers.get(A.id).carrier;
    if (before !== after) fail(`(a) o save mudou o colo (${who(before)} → ${who(after)})`);
    const r2_ = track(A.id, 8);
    const b = S.villagers.get(A.id); const arms = r1.arms.concat(r2_.arms);
    const held = arms.find(id => id && id !== m.id) || 0; const o = S.villagers.get(held);
    if (!held) fail('(a) com a mãe em fúria, o bebê ficou nos braços dela');
    else if (!o || o.inside !== h.id) fail(`(a) o bebê foi para ${who(held)}, fora da casa`);
    if (arms.includes(0)) fail('(a) o bebê ficou sem colo no meio');
    if (b.inside !== h.id) fail(`(a) o bebê saiu de casa (dentro de ${b.inside})`);
    const jump = Math.max(r1.max, r2_.max); if (jump > h.w + h.h) fail(`(a) o bebê pulou ${r2(jump)} casas num passo`);
    if (b.carrier !== m.id && b.carrier !== b.father) fail(`(a) passada a fúria, o bebê está com ${who(b.carrier)}`);
    notes.push(`(a) ${h.type}#${h.id} à noite: a mãe ${m.name} em fúria → ${who(held)}, dentro de casa; o save o deixou com ${who(after)}; passada a fúria, com ${who(b.carrier)}${b.carrier === m.id ? ' (a mãe)' : b.carrier === b.father ? ' (o pai)' : ''}`);
  }
  // (b) by day in the street, someone near: the mother in a fury — the baby goes to arms within reach, no jump
  open(); liveTo(0.3);
  const B = babies().find(b => { const m = S.villagers.get(b.mother); return !!m && !m.inside && !b.inside && fit(m) && others(b, m).some(fit); });
  if (!B) fail('(b) nenhum bebê de dia no colo da mãe, na rua, com alguém por perto');
  else {
    const m = S.villagers.get(B.mother); m.fury = 4;
    const r = track(B.id, 2); const b = S.villagers.get(B.id);
    if (!b.carrier || b.carrier === m.id) fail(`(b) o bebê ficou ${b.carrier ? 'com a mãe em fúria' : 'sem colo'}`);
    if (r.max > 3.5) fail(`(b) o bebê pulou ${r2(r.max)} casas num passo (o colo de perto está a menos de 3)`);
    notes.push(`(b) na rua, de dia: a mãe ${m.name} em fúria → ${who(b.carrier)}, ${r2(r.max)} casas no maior passo`);
  }
  // (c) by day in the street, nobody near: the mother or the father, or a woman of the village, wherever they are (as before)
  const C = babies().find(b => { const m = S.villagers.get(b.mother); return !!m && !m.inside && !b.inside && fit(m) && !others(b, m).length; });
  if (!C) notes.push('(c) nenhum bebê na rua sem ninguém por perto: o caminho de antes não foi visto');
  else {
    const m = S.villagers.get(C.mother); m.fury = 4;
    track(C.id, 2); const b = S.villagers.get(C.id);
    if (!b.carrier || b.carrier === m.id) fail(`(c) sem ninguém por perto, o bebê ficou ${b.carrier ? 'com a mãe em fúria' : 'sozinho'}`);
    notes.push(`(c) na rua, ninguém perto: a mãe ${m.name} em fúria → ${who(b.carrier)}${b.carrier === b.father ? ' (o pai)' : ''}, onde estiver`);
  }
  // (d) the body the player lives, within reach: the world never puts the baby in its arms
  const E = babies().find(b => { const m = S.villagers.get(b.mother); return !!m && !m.inside && !b.inside && fit(m) && others(b, m).filter(fit).length >= 1; });
  if (!E) notes.push('(d) nenhum bebê com alguém perto para o corpo');
  else {
    const m = S.villagers.get(E.mother); const w = others(E, m).filter(fit).sort((a, c) => G.dist(a.x, a.y, E.x, E.y) - G.dist(c.x, c.y, E.x, E.y) || a.id - c.id)[0];
    const took = G.Possess.take(w);
    if (!took || !isBody(w)) notes.push(`(d) o corpo não pegou ${w.name}`);
    else {
      m.fury = 4; track(E.id, 2); const b = S.villagers.get(E.id);
      if (b.carrier === w.id) fail(`(d) o mundo pôs o bebê no colo do corpo do jogador (${w.name})`);
      notes.push(`(d) o corpo (${w.name}) ao lado: o bebê foi para ${who(b.carrier)}`);
      G.Possess.release('deus');
    }
  }
  // (e) a warrior between fights, only strangers near: keeps the baby (it goes only to one of the house within reach)
  const F = babies().find(b => { const m = S.villagers.get(b.mother); if (!m || m.inside || b.inside || !fit(m)) return false; const n = others(b, m); return n.length > 0 && n.every(o => o.home !== b.home && o.id !== b.father); });
  if (!F) notes.push('(e) nenhum bebê na rua só com estranhos por perto');
  else {
    const m = S.villagers.get(F.mother); const role = m.role; m.role = 'guerreiro';
    // (between fights — standing a moment where she is, so the warrior's role does not send her to a drill or a watch at once;
    // one given to her all the same is a letting go of its own, and the case does not count)
    G.Vg.setTask(m, { type: 'idle', pri: 3, wait: 2, kind: 'teste' });
    let called = ''; live(1.5, () => { if (!called && m.task && ROUGHT[m.task.type]) called = m.task.type; });
    const b = S.villagers.get(F.id); m.role = role; const o = S.villagers.get(b.carrier);
    if (called) notes.push(`(e) a guerreira ${m.name} foi chamada (${called}) no meio — o caso não vale`);
    else {
      if (b.carrier !== m.id && !(o && (o.home === b.home || o.id === b.father))) fail(`(e) a guerreira entre lutas deu o bebê a ${who(b.carrier)}, que não é da casa`);
      notes.push(`(e) a mãe ${m.name}, guerreira entre lutas, só estranhos por perto: o bebê com ${who(b.carrier)}`);
    }
  }
  // (f) the body's hands, by the offers of the house: in the evening at home, one of the house lived by the player takes the
  // baby from the mother's arms (G.Vg.handBaby), keeps it while the mother is near, and gives it back to her
  open(); liveTo(0.6);
  // (from the evening into the night, a look every 5 s: a house with the mother, the baby and another of the house awake inside)
  const findF = () => babies().find(b => { const m = S.villagers.get(b.mother); const h = m && builtHome(m); return !!h && m.inside === h.id && b.inside === h.id && !m.sleeping && [...S.villagers.values()].some(o => o.id !== m.id && o.home === h.id && o.inside === h.id && !o.sleeping && fit(o)); });
  let Fb = findF(); for (let k = 0; k < 16 && !Fb; k++) { live(5); Fb = findF(); }
  if (!Fb) notes.push('(f) nenhuma casa ao anoitecer com a mãe, o bebê e outro da casa acordados dentro');
  else {
    const m = S.villagers.get(Fb.mother), h = builtHome(m);
    const w = [...S.villagers.values()].filter(o => o.id !== m.id && o.home === h.id && o.inside === h.id && !o.sleeping && fit(o)).sort((a, c) => a.id - c.id)[0];
    if (!G.Possess.take(w) || !isBody(w)) notes.push(`(f) o corpo não pegou ${w.name}`);
    else {
      // (the body is taken at the door; the test's hand puts it back in the room by the mother, as l13 does)
      if (w.inside !== h.id) { w.inside = h.id; w.x = m.x; w.y = m.y; w.path = null; w.moving = false; }
      const doIt = id => { const o = G.Act.offers(w, w.x, w.y).find(q => q.id === id); if (!o) return { ok: false, why: 'sem a oferta «' + id + '»' }; const it = G.Possess.apply(() => G.Act.perform(w, o)); live(0.3); return it.res || { ok: false, why: 'o mundo não fez' }; };
      const r1 = doIt('lar.pegarBebe:' + Fb.id); const b1 = S.villagers.get(Fb.id);
      if (!r1.ok || b1.carrier !== w.id) { const ww = S.villagers.get(w.id); fail(`(f) pegar o bebê: ${r1.why || 'o bebê não veio para o colo do corpo'} [bebê home ${b1.home}, mãe ${b1.mother}, pai ${b1.father}, colo ${b1.carrier}, dentro ${b1.inside}; corpo #${ww.id} home ${ww.home}, dentro ${ww.inside}; ao alcance ${G.Vg.babyReach(b1, ww)}, pode segurar ${G.Vg.canHold(ww)}; ofertas: ${G.Act.offers(ww, ww.x, ww.y).map(o => o.id).join(', ') || 'nenhuma'}]`); }
      live(1.5); const b2 = S.villagers.get(Fb.id);
      if (r1.ok && b2.carrier !== w.id) fail(`(f) o mundo tirou o bebê do colo do corpo (está com ${who(b2.carrier)})`);
      const r2 = doIt('lar.darBebe:' + Fb.id + ':' + m.id); const b3 = S.villagers.get(Fb.id);
      if (r1.ok && (!r2.ok || b3.carrier !== m.id)) fail(`(f) dar o bebê à mãe: ${r2.why || 'o bebê ficou com ' + who(b3.carrier)}`);
      notes.push(`(f) ${w.name}, vivido pelo jogador, em casa: «${r1.msg || r1.why}» (1,5 s depois, ainda no colo dele: ${b2.carrier === w.id ? 'sim' : 'NÃO'}); «${r2.msg || r2.why}»`);
      G.Possess.release('deus');
    }
  }
  ok('l15 o bebê muda de colo onde está (D-074)', good, notes.join(' · '));
}

// ======================= l11: the faithful inside the temple =======================
if (want('l11', 'l11b')) {
  // (the temple with the most faithful for whom it is the nearest — the prayer goes to the nearest temple or monument of
  // one's own town, villagers.js —, in this world or, with too few, in the metropolis)
  const nearest = v => { let best = null, bd = 1e9; for (const b of S.buildings.values()) if (b.built && (b.type === 'temple' || b.type === 'monument') && b.set === v.set) { const d = G.dist2(v.x, v.y, b.x, b.y); if (d < bd) { bd = d; best = b; } } return best; };
  const placesOf = b => { const p = G.Interiors.plan(b); return p && p.ok ? p.items.reduce((n, it) => n + it.spots.filter(sp => sp.use === 'rezar' || sp.use === 'sentar').length, 0) : 0; };
  const faithful = b => [...S.villagers.values()].filter(v => v.set === b.set && builtHome(v) && !v.captive && v.age >= 16 && v.age < 70 && !v.sleeping && !isBody(v) && v.role !== 'sacerdote' && !v.aboard && !v.jail && !v.ug && (!v.task || v.task.pri < 2) && nearest(v) === b);
  const pick = () => { let best = null, bn = -1; for (const b of [...S.buildings.values()].filter(q => q.built && q.type === 'temple').sort((x, y) => x.id - y.id)) { const n = placesOf(b) ? faithful(b).length : -1; if (n > bn) { bn = n; best = b; } } return best && bn >= 3 ? best : null; };
  open(); S.time = 0.3; let tp = pick();
  if (!tp && WORLD !== 'metropole') { M.pronto('metropole'); S = G.S; S.weather.storm = 0; S.weather.rain = 0; for (let k = 0; k < 10; k++) G.debug.step(0.1); S.time = 0.3; tp = pick(); }
  set = tp ? S.settlements.get(tp.set) : town();
  const places = tp ? placesOf(tp) : 0;
  if (!tp || !places) ok('l11 a reza dentro do templo', false, 'nenhum templo com lugar de rezar na planta e três fiéis para quem é o mais perto');
  else {
    const who = faithful(tp).sort((a, b) => G.dist2(a.x, a.y, tp.x, tp.y) - G.dist2(b.x, b.y, tp.x, tp.y)).slice(0, places + 3);
    for (const v of who) G.Vg.setTask(v, { type: 'pray', pri: 1.05 }); // (the test's hand: the faithful called to prayer — over the day's work, 1)
    const dw = doorWatch(); let most = 0, over = 0, inside = 0, saved = false, kept = null; const prayed = new Set();
    live(70, () => {
      dw.step();
      const n = who.filter(v => v.inside === tp.id && v.task && v.task.type === 'pray').length; most = Math.max(most, n); if (n > places) over++;
      for (const v of who) if (v.task && v.task.type === 'pray' && v.task.st === 2) prayed.add(v.id);
      // (a save while some pray inside: on with it there — the same people, inside, at prayer)
      if (!saved && n >= 2) { saved = true; inside = n; const ids = who.filter(v => v.inside === tp.id).map(v => v.id); M.salvarCarregar(); S = G.S; kept = ids.filter(id => { const o = S.villagers.get(id); return o && o.inside === tp.id && o.task && o.task.type === 'pray' && o.task.st === 2; }).length; for (let k = 0; k < who.length; k++) who[k] = S.villagers.get(who[k].id) || who[k]; }
      return saved && who.every(v => !(v.task && v.task.type === 'pray'));
    });
    const left = who.filter(v => S.villagers.has(v.id) && v.task && v.task.type === 'pray').length;
    const still = who.filter(v => S.villagers.has(v.id) && v.inside === tp.id).length;
    const wrongIn = dw.wrong.filter(w => w.includes('#' + tp.id));
    ok('l11 a reza dentro do templo', most >= 2 && !over && saved && kept === inside && !left && !still && !wrongIn.length,
      `${who.length} fiéis de ${set.name} (${V.pop(set.id)} habitantes, ${people(set).filter(v => v.age >= 16).length} adultos com casa) chamados ao templo #${tp.id} (${places} lugares de rezar na planta): até ${most} rezando dentro ao mesmo tempo${over ? `, ACIMA DOS LUGARES em ${over} passos` : ''}, ${prayed.size} rezaram; o save no meio com ${inside} dentro: ${kept === inside ? 'seguiram dentro, rezando' : `SÓ ${kept} SEGUIRAM`}; no fim ${left ? `${left} AINDA REZANDO` : 'todos terminaram'}${still ? `, ${still} AINDA DENTRO` : ''}${wrongIn.length ? ' — ' + wrongIn.slice(0, 2).join(' · ') : ''}`);
    ok('l11b quem reza dentro está num lugar de rezar', !praying.length, praying.length ? `${praying.length} rezando fora das esteiras, dos bancos e do altar (o repartidor do P4 com a regra do templo): ${praying.slice(0, 2).join(' · ')}` : 'todos nas esteiras, nos bancos ou no altar da planta');
  }
}

// ======================= l10: a festival across a save, and its feast in the ledger =======================
if (want('l10')) {
  // (after dark, as the feasts of the long nights begin — Jól, Saturnália, Toxcatl: the small ones already asleep)
  open(); set = town(); const f = G.Fac.get(set.fac); S.time = 0.62; liveTo(0.8);
  const keys = G.Fest.of(f.civ).filter(k => !G.Fest.DEF[k].trigger);
  D.make('f:' + f.id, 'food', 40, { code: 'teste', part: true });
  let fe = null; const L0 = S.ledgerN || 0;
  const kidsAsleep = new Set([...S.villagers.values()].filter(v => v.set === set.id && v.age >= 2 && v.age < 12 && v.sleeping).map(v => v.id));
  for (const k of keys) { fe = G.Fest.start(set, k, {}); if (fe) break; }
  const woken = fe ? fe.parts.filter(id => kidsAsleep.has(id) && !Object.values(fe.roles).some(l => l.includes(id))) : [];
  if (!fe) ok('l10 a festa atravessa o save', false, `${set.name} (${f.civ}) não começou nenhuma festa: ${keys.join(', ')}`);
  else {
    const id = fe.id, key = fe.key; live(10);
    const st = x => x ? [x.key, x.stage, x.parts.length, x.parts.filter(pid => { const v = S.villagers.get(pid); return v && v.task && v.task.type === 'fest' && v.task.fid === x.id; }).length].join('/') : 'sumiu';
    const before = st(G.Fest.list().find(x => x.id === id));
    M.salvarCarregar(); S = G.S;
    const after = st(G.Fest.list().find(x => x.id === id));
    const fe2 = G.Fest.list().find(x => x.id === id);
    let ended = -1; live(fe2 ? Math.max(5, fe2.len - fe2.t + 8) : 5, () => { if (ended < 0 && !G.Fest.list().some(x => x.id === id)) ended = S.clock; return ended >= 0 && S.clock - ended > 2; });
    const stuck = [...S.villagers.values()].filter(v => v.task && v.task.type === 'fest' && v.task.fid === id).length;
    const feast = book(e => e[0] > L0 && e[3] === 'f:' + f.id && e[5] === 'food' && (e[8] === 'banquete' || e[8] === 'festa'));
    const eaten = r2(feast.reduce((s, e) => s + e[6], 0));
    const plan = (fe2 || fe).plan || []; const hasFeast = plan.some(s => s[0] === 'feast');
    ok('l10 a festa atravessa o save', before === after && ended >= 0 && !stuck && (!hasFeast || feast.length >= 1) && !woken.length,
      `${key} em ${set.name} às ${fmtT(0.8)}: ${kidsAsleep.size} crianças dormindo, ${woken.length ? `${woken.length} ARRANCADAS DA CAMA para a plateia` : 'nenhuma arrancada da cama para a plateia'}; antes do save ${before}, depois ${after} (festa/etapa/participantes/na festa); ${ended >= 0 ? 'terminou' : 'NÃO TERMINOU'}${stuck ? `, ${stuck} AINDA NA FESTA` : ''}; o banquete no livro: ${feast.length} linha(s), ${eaten} de comida${hasFeast ? '' : ' (esta festa não tem banquete)'}`);
  }
}

// ======================= l8 / l9: two years of the skip; then a whole day, the pantries by the ledger =======================
if (want('l8', 'l9')) {
  open(); set = town();
  const c0 = L.clock; let calls = 0; L.clock = function (v) { calls++; return c0(v); };
  const t0 = process.hrtime.bigint(); M.saltar(2); const ms = Number((process.hrtime.bigint() - t0) / 1000000n);
  L.clock = c0;
  // (what one call costs, alone: the same people, a million times)
  const sample = [...S.villagers.values()].slice(0, 200); let sink = 0; const t1 = process.hrtime.bigint();
  for (let k = 0; k < 1e6; k++) sink += c0(sample[k % sample.length]).bed; const per = Number(process.hrtime.bigint() - t1) / 1e6; void sink;
  const cost = calls * per / 1e6;
  watch(); // (the checker after the skip: what it finds is l8's)
  ok('l8 dois anos de salto', calls > 0, `dia ${S.day}, ${S.villagers.size} pessoas (${ms} ms); o relógio de cada um chamado ${calls} vezes, ~${r2(per)} ns cada: ~${Math.round(cost)} ms do salto (${r2(cost / Math.max(1, ms) * 100)}%)`);
  // l9: a whole day in the world's own step; each pantry that moved outside the ledger, with the step's T-130 hands named
  const t130 = new Set(); const named = []; const other = [];
  for (let k = 0; k < G.DAY_LEN * 10; k++) {
    S.weather.storm = 0; M.viver(0.1);
    for (const v of S.villagers.values()) { const t = v.task; if (!t) continue; if (t.type === 'goHome' && t.st === 1) t130.add(t.id); else if (t.type === 'tribute' && t.st === 1 && t.route && t.k < t.route.length) t130.add(t.route[t.k]); }
    if (k % 10 === 9) {
      const all = watch();
      for (const q of all) { const m = String(q.msg); if (!m.includes(PANTRY)) continue; const id = +((m.match(/#(\d+):/) || [])[1] || 0); (t130.has(id) ? named : other).push(m); }
      t130.clear();
    }
  }
  ok('l9 a despensa pelo livro-razão', !other.length, `um dia inteiro: ${named.length} mudança(s) fora do livro nas casas do fim do dia (economy.js) e do tributo (court.js) — o T-130, do P2${other.length ? `; ${other.length} SEM ESSA CAUSA: ${other.slice(0, 3).join(' · ')}` : '; nenhuma outra'}`);
}

const e = M.erros(); if (!M.limpo()) { console.log('  erros:', JSON.stringify(e.mod), e.console.slice(0, 5).join(' | ')); fails.push('erros'); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
