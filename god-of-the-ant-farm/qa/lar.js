// lar: a vida em casa, provocada de propósito (P1, o Patch 2 — a Parte 3 do pedido), no mundo pronto «cidade» (ou o do
// argumento: node qa/lar.js metropole). Os casos que precisam de outra hora partem do mundo pronto de novo.
//  l1  a noite de uma cidade, das 0,50 às 0,86: cada um deita na sua hora (o relógio de cada um, G.Lar.clock — as crianças
//      antes, os adultos espalhados; quem está cansado pode deitar antes); entre 0,76 e 0,82 há um momento com gente dormindo e gente acordada em
//      casa (às 0,78, as crianças dormindo);
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
//  l14 de dia, um dos velhos da casa cuida dos pequenos (3 a 6 anos) em casa, e os pequenos ficam com ele, sem entrar e sair sem
//      parar — e esperam por ele quando sai por pouco, para comer ou descansar (L-235); um save no meio do dia; quem cuida
//      morre no meio (outro velho assume, ou os pequenos voltam ao dia deles); o save e a morte no primeiro instante em que
//      ele está cuidando. Sem
//      velho morando com pequenos numa cidade em paz, a mão da prova põe em 63 anos um adulto da casa que não é pai nem mãe deles
//  l15 o bebê muda de colo onde está (D-074): em casa à noite, a mãe em fúria o passa ao pai ou a alguém da casa, ali; um
//      save no meio; na rua, a quem está perto (sem pulo); sem ninguém perto, à mãe, ao pai ou a uma mulher da vila, onde
//      estiverem (como antes); nunca ao corpo do jogador; a guerreira entre lutas só o dá a alguém da casa; e o corpo, pelas
//      ofertas da casa, pega o bebê no colo, fica com ele e o devolve à mãe
//  l16 da casa cheia saem os moços primeiro (D-098): a mão da prova enche uma casa de pequenos com uma velha que cuida
//      deles e moços solteiros — sai o mais moço, a velha e o dono ficam; um save no meio e mais um moço: sai de novo o
//      mais moço; a velha morre cuidando e os pequenos voltam ao dia deles; e o verificador vê o velho posto para fora
//      antes do moço. l16b: de dois casais de fora numa casa cheia, o dia da cidade pergunta ao mais moço; o dono fica
//  l13 a continuidade da casa (o pedido 8.4): o corpo longe, perto, dentro (come e cozinha), fora, o tempo, de volta, o save —
//      a família igual ao ser olhada e ao ver o corpo entrar, a despensa só pelo livro, o corpo deitado em casa no save
//  l17 a casa que a cidade amplia por cima da família continua sendo a casa dela (L-371): a noite em casa e dormindo dentro,
//      nunca ao relento; o save no meio da noite; a jarra enchida de novo; o verificador vê a casa em obra cheia (D-098); o
//      dono morre no meio da obra e o herdeiro fica com ela; a obra deixada devolve a casa antiga
//      inteira, com a família; ampliada de novo e pronta, a família segue nela; a planta durante a obra é a da casa antiga
//      (o registro dos interiores), refeita na hora em que a casa nova fica pronta
//  l11 a reza dentro do templo (L-224): os fiéis entram pela porta até os lugares da planta, os outros nas fileiras de fora;
//      um save no meio; todos terminam e saem
//  l11b quem reza dentro do templo está num lugar de rezar da planta (as esteiras, os bancos, o altar do sacerdote — o
//      repartidor do P4 com a regra do templo)
//  l10 uma festa atravessa o save (L-222) e o banquete sai pelo livro-razão (L-223)
//  l10b a festa que começa não leva para a plateia quem está a caminho de comer, no máximo da fome (L-234)
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
  // (the town looked at each hundredth of the day from 0.76 to 0.82 — the hours its grown ones go to bed —: at some look,
  // someone asleep at home and someone still awake there; one look at 0.78 hung on a single late one, T-138)
  const snaps = []; const TS = [0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82];
  const each = () => {
    dw.step();
    for (const v of S.villagers.values()) {
      if (v.set === set.id && v.age >= 2 && !v.captive && builtHome(v) && !isBody(v)) {
        if (v.sleeping && !was.get(v.id) && S.time > 0.6 && !first.has(v.id)) first.set(v.id, { t: S.time, e: energy.get(v.id), bed: L.clock(v).bed, age: v.age, home: v.inside === v.home, task: v.task ? v.task.type : '' });
      }
      was.set(v.id, !!v.sleeping); energy.set(v.id, v.energy);
    }
    if (snaps.length < TS.length && S.time >= TS[snaps.length]) {
      const snap = { t: TS[snaps.length], grownA: 0, grownW: 0, kidsA: 0, kidsN: 0, awakeLate: 0, wake: [], away: new Map() }; snaps.push(snap);
      for (const v of people(set)) {
        if (v.inside !== v.home) { if (v.age >= 16 && !v.sleeping) { const w = L.why(v); const k = `${w.code}${v.task ? ':' + v.task.type : ''}`; snap.away.set(k, (snap.away.get(k) || 0) + 1); } continue; }
        if (v.age >= 16) { if (v.sleeping) snap.grownA++; else { snap.grownW++; if (L.clock(v).bed > S.time - 0.01) snap.awakeLate++; if (snap.wake.length < 3) snap.wake.push(`${v.name} (${v.task ? v.task.type + (v.task.what ? ':' + v.task.what : '') : '—'}, deita ${fmtT(L.clock(v).bed)})`); } }
        else if (v.age >= 2 && v.age < 12) { snap.kidsN++; if (v.sleeping) snap.kidsA++; }
      }
    }
  };
  liveTo(0.86, each);
  const k78 = snaps.find(q => q.t === 0.78) || null; const snap = snaps.find(q => q.grownA > 0 && q.grownW > 0) || k78;
  const grown = [...first.values()].filter(f => f.age >= 16), kids = [...first.values()].filter(f => f.age < 12);
  const early = grown.filter(f => f.t < f.bed - 0.01 && f.e >= 30);
  const ts = grown.map(f => f.t); const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const span = ts.length ? Math.max(...ts) - Math.min(...ts) : 0;
  const mg = mean(ts), mk = mean(kids.map(f => f.t));
  const fine = dw.n() >= 5 && !dw.wrong.length && grown.length >= 5 && early.length <= Math.max(1, grown.length * 0.05) && span >= 0.03 && (!kids.length || mk < mg - 0.02)
    && !!snap && snap.grownA > 0 && snap.grownW > 0 && !!k78 && (!k78.kidsN || k78.kidsA >= k78.kidsN * 0.6);
  ok('l1 cada um na sua hora', fine, `${dw.n()} entradas em casa${dw.wrong.length ? ` — ERRADAS: ${dw.wrong.slice(0, 3).join(' · ')}` : ', todas pela porta'}; ${grown.length} adultos deitaram entre ${fmtT(Math.min(...ts))} e ${fmtT(Math.max(...ts))} (média ${fmtT(mg)}), ${kids.length} crianças em média às ${kids.length ? fmtT(mk) : '—'}; antes da própria hora sem cansaço: ${early.length}${early.length ? ' (' + early.slice(0, 2).map(f => `${fmtT(f.t)} < ${fmtT(f.bed)}, ${f.task}`).join(', ') + ')' : ''}; às ${snap ? String(snap.t).replace('.', ',') : '—'}: ${snap ? `${snap.grownA} adultos dormindo e ${snap.grownW} acordados em casa (${snap.awakeLate} pela hora deles: ${snap.wake.join(', ')}), às 0,78 ${k78 ? k78.kidsA : 0} de ${k78 ? k78.kidsN : 0} crianças dormindo; adultos acordados fora de casa: ${[...snap.away].map(([k, n]) => `${k} ${n}`).join(', ') || 'nenhum'}` : 'NÃO CHEGOU'}`);
  // (the rule asks the P4 allocator's places — In.placeRule —: without it there is nothing to ask, and the case says so)
  const rep1b = !!(G.Interiors && G.Interiors.placeRule);
  ok('l1b quem dorme está deitado', rep1b && !lying.length, !rep1b ? 'sem o repartidor dos lugares do P4 (In.placeRule): ainda não há lugar de deitar a dar' : lying.length ? `${lying.length} de pé ou sentados dormindo (L-228, o repartidor do P4): ${lying.slice(0, 2).join(' · ')}` : `${looks} olhadas do verificador: ninguém dormindo de pé`);
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
    // (in bed, the sick one's own food in the house — the test's hand: a family of five eats a pantry of four at once —, and
    // the sick one hungry there: the one picked may be at a meal, which takes the hunger the case needs in bed — after L-371
    // changed the world's path, Hakon was picked eating at the store, went to bed full and ate nothing at home)
    const dw = doorWatch(); let inBed = -1, work = 0, abed = 0; const trace = []; let last = '';
    live(60, () => { dw.step(); const t = v.task; const k = t ? `${t.type}${t.what ? ':' + t.what : ''}/${t.st}${v.inside ? '/dentro' : ''}` : 'nada'; if (k !== last && trace.length < 14) { trace.push(`${r2(S.clock - t3)} ${k} (fome ${Math.round(v.hunger)})`); last = k; } const a = t && t.type === 'lar' && t.what === 'acamado' && t.st === 2 && v.inside === h.id; if (a) abed += 0.1; if (a && inBed < 0) { inBed = S.clock; if (D.get(ref, 'food') < 1) D.make(ref, 'food', 2, { code: 'teste', part: true, floor: true }); if (v.hunger < 50) v.hunger = 60; } if (inBed >= 0 && !a && L.fever(v)) work += 0.1; return inBed >= 0 && S.clock - inBed > 15; });
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
  // (after the day of every town — act-casa.js looks at one town every 2 s of the world from the first step: the moves of house
  // of the day are done —, the clock back to the morning: 75 s of the day, before the evening at 0,6)
  const afterMoves = () => { live(2 * S.settlements.size + 4); S.time = 0.12; };
  open(); afterMoves();
  // (a house of the world with someone of 62 or more — whose working day weighs less than the minding — and little ones of
  // three to six living in it; one of the old minds them. Chosen after the day's moves of house — a house too full for its
  // beds splits once a day, act-casa.js: the old one may move out, and the little ones are no longer hers —, in a town at
  // peace: a town under threat calls its grown ones to the fight, and the case would watch a battle)
  const calm = h => !(G.War && G.War.threat && G.War.threat(h.set));
  const findHouse = () => { const houses = new Map(); for (const v of S.villagers.values()) { const h = builtHome(v); if (!h || v.captive || !calm(h)) continue; const e = houses.get(h.id) || { h, old: [], kids: [] }; if (v.age >= 62 && !(v.sick > 0) && v.hp >= 50 && !isBody(v)) e.old.push(v); if (v.age >= 3 && v.age < 7) e.kids.push(v); houses.set(h.id, e); } return [...houses.values()].filter(x => x.old.length && x.kids.length).sort((a, b) => b.kids.length - a.kids.length || a.h.id - b.h.id)[0]; };
  // (the ready worlds may have none after the day's moves — a full house splits, and the old one is often who leaves —: then
  // the test's hand makes one of the house old for the case, a grown one who is not the little ones' mother or father, nor a
  // warrior — the age back at the end —, and the mechanism is what is proven: the old one minds them, they come home and stay)
  let aged = null;
  const ageOne = () => {
    const houses = new Map(); for (const v of S.villagers.values()) { const h = builtHome(v); if (!h || v.captive || !calm(h)) continue; const x = houses.get(h.id) || { h, old: [], kids: [], grown: [], n: 0 }; x.n++; if (v.age >= 3 && v.age < 7) x.kids.push(v); else if (v.age >= 25 && v.age < 62 && !(v.sick > 0) && v.hp >= 50 && !isBody(v) && !v.secret && v.role !== 'guerreiro' && !v.jail && !v.aboard) x.grown.push(v); houses.set(h.id, x); }
    // (one who stays in the house through the case: a single grown one of a house too full is sent to one with room every
    // few seconds — village.js assignHousing —, and the case would watch someone else's house. A partner in the same house
    // keeps one there; so does a house with a bed to spare, even for a baby born in the case)
    const coupled = (g, h) => { const p = g.partner && S.villagers.get(g.partner); return !!p && p.home === h.id; };
    const stays = (g, x) => (coupled(g, x.h) ? 2 : 0) + (x.n < G.BDEF[x.h.type].housing ? 1 : 0);
    const cand = [...houses.values()].filter(x => x.kids.length).map(x => Object.assign(x, { o: x.grown.filter(g => !x.kids.some(k => k.mother === g.id || k.father === g.id)).sort((a, b) => stays(b, x) - stays(a, x) || b.age - a.age || a.id - b.id)[0] })).filter(x => x.o).sort((a, b) => stays(b.o, b) - stays(a.o, a) || b.kids.length - a.kids.length || a.h.id - b.h.id)[0];
    if (!cand) return null;
    const st = stays(cand.o, cand); aged = [cand.o, cand.o.age, st >= 2 ? 'com o companheiro em casa' : st ? `numa casa com cama sobrando, ${cand.n} de ${G.BDEF[cand.h.type].housing}` : `só numa casa cheia, ${cand.n} de ${G.BDEF[cand.h.type].housing} — nenhuma melhor`];
    cand.o.age = 63; cand.old = [cand.o]; return cand;
  };
  // (this world first — the small town is calm —, and only then the metropolis)
  let e = findHouse() || ageOne();
  if (!e && WORLD !== 'metropole') { M.pronto('metropole'); S = G.S; S.weather.storm = 0; S.weather.rain = 0; for (let k = 0; k < 10; k++) G.debug.step(0.1); afterMoves(); e = findHouse() || ageOne(); }
  if (!e) ok('l14 os velhos cuidam dos pequenos em casa', false, 'nenhuma casa com alguém de 62 anos ou mais e crianças de 3 a 6, nem com um adulto da casa que não seja o pai ou a mãe delas');
  else {
    let h = e.h; const dw = doorWatch(); let minded = 0, n = 0, txt = '', two = 0, reload = '', reloadOk = true; const exits = new Map();
    // (the little ones come home and stay: when each first came home while minded, and — from then on — how much of the
    // minding it spent at home, awake; a little one far away takes a while to walk home)
    const came = new Map(), stayIn = new Map(), stayAll = new Map();
    let died = null, diedAt = 0, after = '', afterOk = true, saved = false;
    // (the save and the death come at the first moment the old one is minding from 40 s and from 55 s — one of the world takes
    // a meal or a rest now and then, and the little ones wait for her: L-235 —; nobody minding in the next ten seconds, the
    // case says so)
    const mindingNow = () => e.old.find(o => o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id) || null;
    // (what the old of the house did, second by second, and why one was not minding — for the note when the case fails)
    const seq = []; const whyNot = new Map(); const kseq = new Map();
    const notMinding = o => { if (o.home !== h.id) return 'mudou de casa'; if (o.age < 55) return 'idade'; if (o.sick > 0) return 'doente'; if (o.hp < 50) return `ferida (${Math.round(o.hp)})`; if (!builtHome(o)) return 'sem casa'; const t = o.task; return t ? `${t.type}${t.what ? ':' + t.what : ''}` : 'sem tarefa'; };
    live(95, () => {
      dw.step(); n++;
      if (n % 10 === 0 && !died) {
        const o = S.villagers.get(e.old[0].id); const w = o ? (o.task && o.task.type === 'lar' && o.task.what === 'cuidar' ? (o.task.st === 2 ? 'cuidar' : 'indo cuidar') : notMinding(o)) : 'morta'; if (seq[seq.length - 1] !== w) seq.push(w); if (o && w !== 'cuidar') whyNot.set(w, (whyNot.get(w) || 0) + 1);
        for (const c of e.kids) { const k = S.villagers.get(c.id); const kw = !k ? 'morta' : k.inside === h.id ? 'em casa' + (k.task ? ':' + k.task.type + (k.task.what ? '/' + k.task.what : '') : '') : k.task ? k.task.type : 'sem tarefa'; const l = kseq.get(c.id) || []; if (l[l.length - 1] !== kw) l.push(kw); kseq.set(c.id, l); }
      }
      if (n >= 550 && n <= 650 && !died) {
        // (the one minding dies in the middle of the day: another old of the house takes over, or the little ones go about
        // their day — none kept at home by a minder who is gone, past the while they wait for her)
        died = mindingNow();
        if (died) { V.kill(died, 'teste'); diedAt = n; }
      }
      if (died && n === diedAt + 80 + Math.round((L.WAIT_CARE || 0) * 10)) {
        // (another of the house minding now — an old one of the case, or one of 55 or more of the house —: the little ones stay)
        const other = [...S.villagers.values()].find(o => o.id !== died.id && o.home === h.id && o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id);
        const heldL = e.kids.filter(o => S.villagers.has(o.id) && o.inside === h.id && o.task && o.task.type === 'lar' && o.task.what !== 'acamado' && o.actT > 16); const held = heldL.length;
        afterOk = !!other || !held;
        const why = heldL.map(o => `${o.name}: ${o.task.what}, ${Math.round(o.actT)} s, esperou ${r2(o.task.gone || 0)} s${o.task.minded ? '' : ' (sem a marca do cuidado)'}`).join('; ');
        after = `; ${died.name} morreu aos ${r2(diedAt / 10)} s: ${other ? `${other.name} (${Math.floor(other.age)}) passou a cuidar` : held ? `${held} criança(s) AINDA PRESA(S) EM CASA ${8 + (L.WAIT_CARE || 0)} s depois (${why})` : 'as crianças voltaram ao dia delas'}`;
      }
      if (died) return;
      if (n >= 400 && n <= 500 && !saved && (mindingNow() || n === 500)) {
        // (the save in the middle of the day: the one minding goes on minding, the little ones at home stay at home)
        saved = true; const was = mindingNow();
        const kin = e.kids.filter(o => o.inside === h.id).map(o => o.id);
        M.salvarCarregar(); S = G.S; h = S.buildings.get(h.id);
        for (const a of [e.old, e.kids]) for (let k = 0; k < a.length; k++) a[k] = S.villagers.get(a[k].id) || a[k];
        const now = was && S.villagers.get(was.id);
        const kept = !!now && !!now.task && now.task.type === 'lar' && now.task.what === 'cuidar' && now.inside === h.id;
        const kk = kin.filter(id => { const o = S.villagers.get(id); return o && o.inside === h.id; }).length;
        reloadOk = !!was && kept && kk === kin.length;
        reload = was ? `; no save aos ${r2(n / 10)} s, ${kept ? `${now.name} continua cuidando` : 'O CUIDADO SE PERDEU'} e ${kk} de ${kin.length} criança(s) ainda em casa` : '; dos 40 aos 50 s, NINGUÉM CUIDANDO para o save';
      }
      const ms = e.old.filter(o => o.task && o.task.type === 'lar' && o.task.what === 'cuidar' && o.inside === h.id); const m = ms[0];
      if (ms.length > 1) two++;
      if (m) {
        minded++; if (!txt) txt = L.taskText(m, m.task);
        for (const c of e.kids) { const k = S.villagers.get(c.id); if (!k) continue; const inn = k.inside === h.id && !k.sleeping; if (inn && !came.has(c.id)) came.set(c.id, n); if (came.has(c.id)) { stayAll.set(c.id, (stayAll.get(c.id) || 0) + 1); if (inn) stayIn.set(c.id, (stayIn.get(c.id) || 0) + 1); } }
      }
      for (const id of dw.out) if (e.kids.some(o => o.id === id)) exits.set(id, (exits.get(id) || 0) + 1);
      dw.out.length = 0;
    });
    const loops = [...exits.values()].filter(x => x > 2).length;
    const sum = mp => [...mp.values()].reduce((a, b) => a + b, 0);
    const stayed = sum(stayAll) ? sum(stayIn) / sum(stayAll) : 0; const first = came.size ? Math.min(...came.values()) : 0;
    const kidsOk = came.size >= Math.ceil(e.kids.length / 2) && stayed >= 0.8;
    if (aged) { const o = S.villagers.get(aged[0].id); if (o) o.age = aged[1]; }
    ok('l14 os velhos cuidam dos pequenos em casa', minded >= 200 && kidsOk && !loops && two <= 20 && reloadOk && afterOk && !!died && !dw.wrong.length,
      `${h.type}#${h.id}: ${e.old.map(o => o.name).join(', ')} (${aged ? `${Math.floor(aged[1])} anos, posta em 63 pela mão da prova, ${aged[2]} — os mundos prontos não têm, depois das mudanças do dia, velho morando com crianças pequenas` : e.old.map(o => Math.floor(o.age)).join(', ') + ' anos'}) e ${e.kids.length} criança(s) de 3 a 6; de dia, cuidando em casa ${r2(minded / 10)} s de 55 («${txt}»), ${came.size} de ${e.kids.length} criança(s) vieram para casa${came.size ? ` (a primeira aos ${r2(first / 10)} s) e ficaram em casa ${Math.round(stayed * 100)}% do cuidado dali em diante` : ''}${reload}${after}${died ? '' : '; dos 55 aos 65 s, NINGUÉM CUIDANDO para morrer'}${two ? `; dois cuidando juntos ${r2(two / 10)} s` : ''}${loops ? `; ${loops} criança(s) ENTRANDO E SAINDO sem parar` : ''}${dw.wrong.length ? ' — ' + dw.wrong.slice(0, 2).join(' · ') : ''}${minded < 200 || !kidsOk ? ` — o que ${e.old[0].name} fez: ${seq.slice(0, 12).join(' → ')}; fora do cuidado: ${[...whyNot].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, c]) => `${k} ${c} s`).join(', ')}; as crianças: ${e.kids.map(c => `${c.name}: ${(kseq.get(c.id) || []).slice(0, 8).join(' → ')}`).join(' | ')}` : ''}`);
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
      // (the body is taken at the door; the test's hand puts it back in the room, on a floor the body can stand on by the table
      // or the fire of the plan — as l13 does)
      const TL = G.Space.TILE; G.Space.planNow(h);
      const stand = uses => { for (const u of uses) for (const q of G.Interiors.slots(h, u)) { const x = h.x * TL + q.spot.x, z = h.y * TL + q.spot.z; for (let r = 0; r <= 1.2; r += 0.25) for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; const ins = G.Space.indoor(x + Math.cos(a) * r, z + Math.sin(a) * r, q.item.lv, h.id); if (ins && ins.b === h && ins.shell && ins.walk) return [(x + Math.cos(a) * r) / TL, (z + Math.sin(a) * r) / TL, ins.lv]; if (!r) break; } } return null; };
      const spot = stand(['sentar', 'comer', 'aquecer', 'cozinhar']);
      if (spot) { w.inside = h.id; w.x = spot[0]; w.y = spot[1]; w.path = null; w.moving = false; G.Possess.setLevel(spot[2]); G.debug.step(0.1); }
      const doIt = id => { const o = G.Act.offers(w, w.x, w.y).find(q => q.id === id); if (!o) return { ok: false, why: 'sem a oferta «' + id + '»' }; const it = G.Possess.apply(() => G.Act.perform(w, o)); live(0.3); return it.res || { ok: false, why: 'o mundo não fez' }; };
      const r1 = doIt('lar.pegarBebe:' + Fb.id); const b1 = S.villagers.get(Fb.id);
      if (!r1.ok || b1.carrier !== w.id) { const ww = S.villagers.get(w.id); fail(`(f) pegar o bebê: ${r1.why || 'o bebê não veio para o colo do corpo'} [bebê home ${b1.home}, mãe ${b1.mother}, pai ${b1.father}, colo ${b1.carrier}, dentro ${b1.inside}; corpo #${ww.id} home ${ww.home}, dentro ${ww.inside}; ao alcance ${G.Vg.babyReach(b1, ww)}, pode segurar ${G.Vg.canHold(ww)}; ofertas: ${G.Act.offers(ww, ww.x, ww.y).map(o => o.id).join(', ') || 'nenhuma'}]`); }
      live(1.5); const b2 = S.villagers.get(Fb.id); const kept = b2.carrier === w.id; // (now: the baby object is the same after the giving)
      if (r1.ok && !kept) fail(`(f) o mundo tirou o bebê do colo do corpo (está com ${who(b2.carrier)})`);
      const r2 = doIt('lar.darBebe:' + Fb.id + ':' + m.id); const b3 = S.villagers.get(Fb.id);
      if (r1.ok && (!r2.ok || b3.carrier !== m.id)) fail(`(f) dar o bebê à mãe: ${r2.why || 'o bebê ficou com ' + who(b3.carrier)}`);
      notes.push(`(f) ${w.name}, vivido pelo jogador, em casa: «${r1.msg || r1.why}» (1,5 s depois, ainda no colo dele: ${kept ? 'sim' : 'NÃO'}); «${r2.msg || r2.why}»`);
      G.Possess.release('deus');
    }
  }
  ok('l15 o bebê muda de colo onde está (D-074)', good, notes.join(' · '));
}

// ======================= l16: of a house too full, the young leave first (D-098) =======================
if (want('l16', 'l16b')) {
  const calm = id => !(G.War && G.War.threat && G.War.threat(id));
  const cap = b => G.BDEF[b.type].housing;
  const residents = b => [...S.villagers.values()].filter(v => v.home === b.id && !v.captive);
  const homesOf = set => [...S.buildings.values()].filter(b => b.set === set && b.built && housing(b) && b.type !== 'barraco' && b.type !== 'ruin').sort((a, c) => a.id - c.id);
  const roomIn = (set, not) => homesOf(set).filter(b => b.id !== not).reduce((n, b) => n + Math.max(0, cap(b) - residents(b).length), 0);
  const owns = v => [...S.buildings.values()].some(b => b.dono === v.id && housing(b));
  const kidsAt = v => (v.kids || []).some(id => { const k = S.villagers.get(id); return k && k.age < 16 && k.home === v.home; });
  const fit = v => !v.captive && !v.jail && !v.aboard && !v.ug && !isBody(v) && v.hp >= 50 && !(v.sick > 0) && v.role !== 'guerreiro' && !v.secret;
  const single = v => !v.partner && !kidsAt(v) && fit(v);
  // (the morning after the day of every town — the day's moves of house done —: this world's, or the metropolis' when this one
  // has nothing for the case)
  const morning = w => { if (w) { M.pronto(w); S = G.S; S.weather.storm = 0; S.weather.rain = 0; } else open(); live(2 * S.settlements.size + 4); S.time = 0.12; };
  // (who of a house too full would leave first by the rule: the youngest single of 18 or more who is not its owner, not the
  // parent its children follow, not the old one who minds its little ones — village.js assignHousing)
  const nextOut = b => {
    const L0 = residents(b); const follow = new Set();
    for (const k of L0) if (k.age < 16) { const m = S.villagers.get(k.mother), f = S.villagers.get(k.father); if (m && m.home === b.id) follow.add(m.id); else if (f && f.home === b.id) follow.add(f.id); }
    return L0.filter(v => v.age >= 18 && !v.partner && v.id !== b.dono && !follow.has(v.id) && !(L.minder && L.minder(v))).sort((a, c) => a.age - c.age || a.id - c.id)[0] || null;
  };
  if (want('l16')) {
    const notes = []; let fine = true; const say = (k, c, t) => { notes.push(`${c ? '' : 'FALHA '}(${k}) ${t}`); if (!c) fine = false; };
    // the house: in a town at peace with beds to spare elsewhere, with little ones of 3 to 6 and the parent they follow in it;
    // the old one who will mind them — a single of 62 or more of the town, or one the test's hand makes 63 —, and two or three
    // young singles of the town, moved in by the test's hand: one bed too few
    let pick = null; let aged = null;
    const find = () => { for (const st of [...S.settlements.values()].filter(s => calm(s.id)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)) {
      for (const h of homesOf(st.id)) {
        const L0 = residents(h); const need = cap(h) - L0.length; if (need < 1 || need > 3) continue;
        const little = L0.filter(o => o.age >= 3 && o.age < 7);
        if (!little.some(k => [k.mother, k.father].some(id => { const p = S.villagers.get(id); return p && p.home === h.id; }))) continue;
        if (roomIn(st.id, h.id) < 2) continue;
        const kin = new Set(little.flatMap(k => [k.mother, k.father]));
        const town0 = [...S.villagers.values()].filter(v => v.set === st.id && v.home && v.home !== h.id && single(v) && !kin.has(v.id) && v.id !== h.dono).sort((a, c) => a.id - c.id);
        const old = town0.find(v => v.age >= 62) || town0.filter(v => v.age >= 25 && v.age < 62).sort((a, c) => c.age - a.age || a.id - c.id)[0];
        const young = town0.filter(v => v !== old && v.age >= 18 && v.age < 36).sort((a, c) => a.id - c.id);
        if (!old || young.length < need + 1) continue;
        return { st, h, old, young: young.slice(0, need), extra: young[need] };
      }
    } return null; };
    morning(); pick = find(); if (!pick && WORLD !== 'metropole') { morning('metropole'); pick = find(); }
    if (!pick) ok('l16 da casa cheia saem os moços primeiro (D-098)', false, 'nenhuma cidade em paz com uma casa de pequenos de 1 a 3 camas livres, camas sobrando noutras casas, um solteiro velho e moços (cidade e metrópole)');
    else {
      let h = pick.h; const st = pick.st, hid = h.id, owner = h.dono, E0 = pick.old;
      const ownerHome = owner && S.villagers.get(owner) ? S.villagers.get(owner).home : 0;
      if (E0.age < 62) { aged = [E0.id, E0.age]; E0.age = 63; }
      E0.home = hid; for (const y of pick.young) y.home = hid;
      const E = () => S.villagers.get(E0.id);
      notes.push(`${h.type}#${hid} de ${st.name} (${cap(h)} camas): ${residents(h).length} moradores, com ${E0.name} (${Math.floor(aged ? aged[1] : E0.age)}${aged ? ', posta em 63 pela mão da prova' : ''}) e ${pick.young.map(y => `${y.name} (${Math.floor(y.age)})`).join(', ')}`);
      // (who left the house, in what order)
      const left = []; const prevHome = new Map(residents(h).map(v => [v.id, hid]));
      const look = () => { for (const [id] of [...prevHome]) { const v = S.villagers.get(id); if (!v) { prevHome.delete(id); continue; } if (v.home !== hid) { left.push([v.id, v.name, v.age]); prevHome.delete(id); } } };
      watch();
      // the first wave: one bed too few — the youngest of the singles leaves, the old one who minds stays
      const exp1 = nextOut(h);
      live(6, () => { look(); return left.length >= 1; });
      say('1ª', left.length === 1 && !!exp1 && left[0][0] === exp1.id && E().home === hid, left.length ? `saiu ${left.map(x => `${x[1]} (${Math.floor(x[2])})`).join(', ')}${exp1 && left[0][0] === exp1.id ? ', a mais moça dos solteiros' : ` — a regra mandava ${exp1 ? exp1.name : 'ninguém'}`}; ${E0.name} ${E().home === hid ? 'ficou' : 'SAIU'} (cuida dos pequenos: ${L.minder(E()) ? 'sim' : 'não'})` : 'NINGUÉM saiu em 6 s');
      // a save in the middle: the house as it was, and the next one to leave by the same rule
      const fam0 = residents(h).map(v => v.id).sort((a, c) => a - c).join(',');
      M.salvarCarregar(); S = G.S; h = S.buildings.get(hid);
      const fam1 = residents(h).map(v => v.id).sort((a, c) => a - c).join(',');
      say('save', fam0 === fam1, fam0 === fam1 ? 'a casa igual depois do save' : `a casa mudou no save: ${fam0} → ${fam1}`);
      // the second wave: one more young single by the test's hand — one bed too few again
      const Y3 = S.villagers.get(pick.extra.id); Y3.home = hid; prevHome.set(Y3.id, hid);
      const exp2 = nextOut(h);
      live(6, () => { look(); return left.length >= 2; });
      say('2ª', left.length === 2 && !!exp2 && left[1][0] === exp2.id && E().home === hid, left.length >= 2 ? `depois do save, com ${Y3.name} (${Math.floor(Y3.age)}) na casa, saiu ${left[1][1]} (${Math.floor(left[1][2])})${exp2 && left[1][0] === exp2.id ? ', o mais moço dos solteiros' : ` — a regra mandava ${exp2 ? exp2.name : 'ninguém'}`}; ${E0.name} ${E().home === hid ? 'ficou' : 'SAIU'}` : 'NINGUÉM saiu depois do save');
      const own = owner && S.villagers.get(owner);
      say('dono', !own || own.home === ownerHome, `o dono, ${own ? own.name : 'o povo'}, ${!own || own.home === ownerHome ? 'não saiu' : 'SAIU'}`);
      // the death of the one who minds: by day, minding the little ones — or as she is —, in the middle of the morning
      let minded = false; live(30, () => { const e = E(); minded = minded || !!(e && e.task && e.task.type === 'lar' && e.task.what === 'cuidar' && e.inside === hid); return minded; });
      if (E()) V.kill(E(), 'teste');
      const kids = residents(h).filter(o => o.age >= 3 && o.age < 7).map(o => o.id);
      live(25, () => { look(); });
      let heldAfter = 0; for (const id of kids) { const k = S.villagers.get(id); if (k && k.inside === hid && k.task && k.task.type === 'lar' && k.actT > 18) heldAfter++; }
      say('morte', !heldAfter, `${E0.name} ${minded ? 'cuidava dos pequenos em casa' : 'ainda não cuidava'} e morreu: ${heldAfter ? `${heldAfter} criança(s) PRESA(S) em casa` : 'os pequenos voltaram ao dia deles'}; ${left.length} saíram ao todo`);
      // the checker sees it: an old one put out of a house too full by the test's hand, with a young single still in it
      {
        const town1 = [...S.villagers.values()].filter(v => v.set === st.id && v.home && v.home !== hid && single(v)).sort((a, c) => a.id - c.id);
        const O = town1.find(v => v.age >= 25 && v.age < 62), Yn = town1.find(v => v !== O && v.age >= 18 && v.age < 36);
        const other = O && homesOf(st.id).find(b => b.id !== hid && b.id !== O.home && cap(b) > residents(b).length);
        if (O && Yn && other) {
          const back = [[O, O.home], [Yn, Yn.home]]; const a0 = O.age, hp0 = O.hp;
          O.age = 66; O.hp = 40; O.home = hid; Yn.home = hid;
          for (const f of town1) { if (residents(h).length > cap(h)) break; if (f !== O && f !== Yn && f.age >= 18 && f.age > Yn.age) { back.push([f, f.home]); f.home = hid; } }
          QA.check(); O.home = other.id; const seen = QA.check().filter(q => String(q.msg).includes('D-098'));
          say('verificador', residents(h).length >= cap(h) && seen.length > 0, seen.length ? `o verificador viu: «${seen[0].msg}»` : 'o verificador NÃO viu o velho posto para fora antes do moço');
          for (const [v, hm] of back) v.home = hm; O.age = a0; O.hp = hp0;
        } else say('verificador', false, 'sem gente para a prova do verificador');
      }
      if (aged) { const o = S.villagers.get(aged[0]); if (o) o.age = aged[1]; }
      ok('l16 da casa cheia saem os moços primeiro (D-098)', fine, notes.join(' · '));
    }
  }
  // l16b: the town's day (act-casa.js) — of a house full with two couples of others, one older and one younger, the family
  // asked is the youngest of the house; its owner, whose family fits, is not asked
  if (want('l16b')) {
    const K = G.Casa; let info = '', okb = false;
    const couplesOf = () => { const out = [];
      for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) {
        const p = v.partner && S.villagers.get(v.partner); if (!p || p.id < v.id || !p.home || p.home !== v.home || v.age < 18 || p.age < 18) continue;
        if (!calm(v.set) || !fit(v) || !fit(p)) continue;
        out.push([v, p]);
      } return out; };
    const eld = c => Math.max(c[0].age, c[1].age);
    const tryB = () => {
      const bySet = new Map(); for (const c of couplesOf()) { const l = bySet.get(c[0].set) || []; l.push(c); bySet.set(c[0].set, l); }
      for (const [sid, cs] of [...bySet].sort((a, c) => a[0] - c[0])) {
        if (cs.length < 2) continue;
        cs.sort((a, c) => eld(c) - eld(a) || a[0].id - c[0].id);
        const oldC = cs[0], youngC = cs[cs.length - 1]; if (eld(oldC) - eld(youngC) < 10) continue;
        const kidsOf = c => (c[0].kids || []).map(id => S.villagers.get(id)).filter(k => k && k.age < 16 && k.home === c[0].home);
        const comes = 4 + kidsOf(oldC).length + kidsOf(youngC).length;
        const h2 = homesOf(sid).find(b => { const o = b.dono && S.villagers.get(b.dono); return o && o.home === b.id && b.id !== oldC[0].home && b.id !== youngC[0].home && K.family(o).length <= cap(b) && residents(b).length + comes >= cap(b); });
        if (!h2) continue;
        for (const k of [...kidsOf(oldC), ...kidsOf(youngC)]) k.home = h2.id;
        for (const v of [...oldC, ...youngC]) v.home = h2.id;
        h2.res = residents(h2).length; // (the count the world keeps — assignHousing's —, made now by the test's hand)
        const q = K.queue(S.settlements.get(sid)).filter(e => e[0].home === h2.id);
        const own = S.villagers.get(h2.dono);
        const fam = e => Math.max(e[0].age, ...K.family(e[0]).filter(m => m.age >= 16).map(m => m.age));
        // (the youngest family of the house in need, by the rule — a young single of it would come before the young couple)
        const all = [...S.villagers.values()].filter(v => v.home === h2.id && v.age >= 18).map(v => [v, K.need(v)]).filter(e => e[1] === 'lotada' || e[1] === 'casal');
        const youngest = all.sort((a, c) => fam(a) - fam(c) || a[0].id - c[0].id)[0];
        okb = q.length === 1 && !oldC.includes(q[0][0]) && !!youngest && fam(q[0]) === fam(youngest) && K.need(own) === null;
        info = `${h2.type}#${h2.id} de ${S.settlements.get(sid).name} (${h2.res} para ${cap(h2)} camas, dono ${own.name}): o casal de ${Math.floor(eld(oldC))} anos (${oldC[0].name} e ${oldC[1].name}) e o de ${Math.floor(eld(youngC))} (${youngC[0].name} e ${youngC[1].name}); o dia da cidade pergunta a ${q.length ? `${q[0][0].name} (${q[0][1]}, a família de ${Math.floor(fam(q[0]))} anos)` : 'NINGUÉM'}${q.length > 1 ? ` e a mais ${q.length - 1} da mesma casa` : ''}; o dono ${K.need(own) === null ? 'fica (a família dele cabe)' : 'PRECISA SAIR'}`;
        return true;
      }
      return false;
    };
    morning(); if (!tryB() && WORLD !== 'metropole') { morning('metropole'); tryB(); }
    ok('l16b da casa cheia, a família mais moça é a perguntada (D-098)', okb, info || 'nenhuma cidade com dois casais de fora e uma casa com dono que os receba');
  }
}

// ======================= l17: the house the city raises further over its family (L-371) =======================
// (a family's house — three or more living in it, fitting its beds, its owner and an heir among them — of the biggest town
// at peace with a builder, raised further by the test's hand as the city does it, city.js upgradeHomes / village.js
// improve: the new type, not standing, the old one in
// upgradeFrom. Through the evening and the night they live in it: the evening at home, asleep inside, never outdoors by its
// door; a save in the middle of the night; at dawn its jar, emptied, is filled again; its owner dies in the middle of the
// works and the heir keeps it; the works given up give the old house back whole, the family in it; raised again and
// finished, the family goes on in the new one. Through the works the plan is the old house's — the interiors' record keeps
// the old type —, made over the moment the new one stands)
if (want('l17')) {
  const UP = { hut: 'house', house: 'sobrado', sobrado: 'insula' };
  const res = b => [...S.villagers.values()].filter(v => v.home === b.id && !v.captive && !v.jail && !v.aboard);
  const free = v => !v.captive && !v.jail && !v.aboard && !v.ug && !isBody(v);
  const builderOf = st => [...S.villagers.values()].filter(v => v.set === st.id && v.role === 'construtor' && free(v) && !(v.carry && (v.carry.op || v.carry.to))).sort((a, c) => a.id - c.id)[0] || null;
  // (the case's town: the biggest at peace with what the case asks — a family that fits its house, its owner with an heir in
  // it (the town's day of houses settles the owners first); a builder of the town, who will see the works given up; two
  // grown ones of the town unpartnered, and another house with room, for the checker's look at the house too full —, in
  // this world or, when it has none, in the metropolis: in the branch's own «cidade» the first house of three or more was a
  // hut of twelve, the next one's owner had only little ones, and Hedeby had no builder)
  const pick = () => {
    for (const st of [...S.settlements.values()].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)) {
      if ((G.War && G.War.threat && G.War.threat(st.id)) || !builderOf(st)) continue;
      if (G.Casa && G.Casa.day) G.Casa.day(st);
      const room = [...S.buildings.values()].some(o => o.set === st.id && o.built && housing(o) && G.BDEF[o.type].housing > res(o).length + 1);
      const homes = [...S.buildings.values()].filter(b => b.set === st.id && UP[b.type] && b.built && !b.upgradeFrom && !b.encomenda && res(b).length >= 3 && res(b).length <= G.BDEF[b.type].housing
        && res(b).some(v => v.id === b.dono && v.age >= 18) && res(b).some(v => v.id !== b.dono && v.age >= 16)).sort((a, c) => a.id - c.id);
      for (const b of homes) if (room && [...S.villagers.values()].filter(v => v.set === st.id && v.home && v.home !== b.id && v.age >= 18 && v.age < 62 && !v.partner && free(v)).length >= 2) return { st, h: b };
    }
    return null;
  };
  open(); let got = pick();
  if (!got && WORLD !== 'metropole') { M.pronto('metropole'); S = G.S; S.weather.storm = 0; S.weather.rain = 0; live(1); got = pick(); }
  // (the city's own hand: the type changed, the site begun over the family — and, the test's hand, three of a thing its people
  // lack among the materials, so that the works last through the case: in the metropolis its builders raised the sobrado
  // before dawn. The works wait for it, with nobody kept at them — fome.js h3)
  const RARE = ['marfim', 'perolas', 'coral', 'seda', 'joias', 'ouro'];
  const raise = b => { const from = b.type, to = UP[from], def = G.BDEF[to]; b.type = to; b.built = false; b.progress = 0; b.upgradeFrom = from; b.need = Object.assign({ wood: 0, stone: 0 }, def.cost); b.incoming = { wood: 0, stone: 0 }; b.hp = def.hp; b.maxHp = def.hp;
    const st = G.Fac.stockOfSet(b.set) || {}; const k = RARE.find(q => !((st[q] || 0) >= 1)); if (k) b.need[k] = 3; return from; };
  let info = 'nenhuma cidade em paz com uma casa de família que caiba nela, o dono com herdeiro, um construtor e dois solteiros (cidade e metrópole)', fine = false;
  if (got) {
    set = got.st; const h = got.h;
    S.time = 0.6; const from = raise(h); const fam0 = res(h).map(v => v.id); const n0 = fam0.length;
    const outs = new Set(); let lar = 0, family = 0, inside = 0;
    // (the evening and the night: who of the house is at home, asleep inside, or asleep outdoors)
    liveTo(0.95, () => {
      for (const id of fam0) { const v = S.villagers.get(id); if (!v || v.home !== h.id) continue; const t = v.task;
        if (t && t.type === 'lar' && t.home === h.id) lar++; if (t && t.type === 'family') family++;
        if (v.sleeping && v.inside === h.id) inside++; if (v.sleeping && !v.inside && t && t.type === 'sleep') outs.add(v.id); }
    });
    const asleepIn = fam0.filter(id => { const v = S.villagers.get(id); return v && v.sleeping && v.inside === h.id; });
    // (the plan they live in through the works is the old house's: the interiors' record keeps the old type until it stands)
    const regMid = h.ip ? h.ip.t : null;
    // (a save in the middle of the night: each one of the house at home as before it — inside, asleep or not, the same task, as
    // the save hook of the home gives them back (D-073). The whole world's round trip is the regression's: here only the house
    // of the case)
    const was = id => { const v = S.villagers.get(id); return v ? `${v.inside === h.id ? 'dentro' : 'fora'}/${v.sleeping ? 'dormindo' : 'acordado'}/${v.task ? v.task.type : 'nada'}` : 'morto'; };
    const before = new Map(fam0.filter(id => { const v = S.villagers.get(id); return v && v.inside === h.id; }).map(id => [id, was(id)]));
    M.salvarCarregar(); S = G.S; const hh = S.buildings.get(h.id);
    const afterIn = fam0.filter(id => { const v = S.villagers.get(id); return v && v.sleeping && v.inside === h.id; });
    const lost = [...before.keys()].filter(id => was(id) !== before.get(id)).map(id => `${(S.villagers.get(id) || {}).name || '#' + id}: ${before.get(id)} → ${was(id)}`);
    // (dawn: the jar emptied, filled again by one of the house)
    liveTo(0.08); hh.water = 0.1; hh.waterTry = undefined;
    let fetched = 0; liveTo(0.45, () => { if (!fetched && G.Life.homeWater(hh) > 0.9) fetched = S.time; });
    // (the checker sees the house under the works too — by the beds of the house it is becoming, as the town counts them —: an
    // old one put out of it by the test's hand while a young single of it stays, D-098)
    let seen17 = null;
    {
      const cap17 = G.BDEF[hh.type].housing;
      const pool = [...S.villagers.values()].filter(v => v.set === set.id && v.home && v.home !== hh.id && v.age >= 18 && free(v)).sort((a, c) => a.id - c.id);
      const singles = pool.filter(v => !v.partner && v.age < 62);
      const O = singles[0] || null, Yn = singles.find(v => v !== O) || null;
      const other = O && [...S.buildings.values()].find(b => b.set === set.id && b.id !== hh.id && b.id !== O.home && b.built && housing(b) && G.BDEF[b.type].housing > res(b).length);
      if (O && Yn && other) {
        const back = [[O, O.home], [Yn, Yn.home]]; const a0 = O.age;
        O.age = 66; O.home = hh.id; Yn.home = hh.id;
        for (const f of pool) { if (res(hh).length > cap17) break; if (f !== O && f !== Yn) { back.push([f, f.home]); f.home = hh.id; } }
        const n = res(hh).length;
        QA.check(); O.home = other.id; const seen = QA.check().filter(q => String(q.msg).includes('D-098') && String(q.msg).includes('#' + hh.id));
        seen17 = { n, cap: cap17, msg: seen.length ? seen[0].msg : '' };
        for (const [v, hm] of back) v.home = hm; O.age = a0;
      }
    }
    // (its owner dies in the middle of the works: the heir keeps it)
    const owner = S.villagers.get(hh.dono); const ownerId = owner ? owner.id : 0; if (owner) V.kill(owner, 'teste');
    const heir = S.villagers.get(hh.dono); live(2);
    // (the works given up — six tries that found no way, as gotoB counts them —, seen by the next builder of the town who
    // looks for work, as the world does it, villagers.js buildTask → abandonSite: the old house back whole, the family in it.
    // The test's hand sends the town's builder to look now, and waits for the world when the builder is gone)
    hh.unreach = 6; hh.unreachT = S.clock;
    const builder = builderOf(set); if (builder) G.Vg.H.workTask(builder);
    const gaveUp = (hh.built && !hh.upgradeFrom) || live(120, () => hh.built && !hh.upgradeFrom);
    const back = hh.built && hh.type === from && !hh.upgradeFrom && !!hh.ip && hh.ip.t === from;
    // (the family goes on in it — or, a grown single of it, in another house of the town: of a house too full the young single
    // ones leave first, D-098 —, nobody of it put out in the street)
    const kept = id => { const v = S.villagers.get(id); return !!v && (v.home === hh.id || (v.age >= 18 && !v.partner && !!v.home)); };
    const stayed = fam0.filter(id => id !== ownerId && kept(id)).length;
    const away = () => { const n = fam0.filter(id => id !== ownerId && kept(id) && S.villagers.get(id).home !== hh.id).length; return n ? ` (${n} solteiro(s) da casa cheia noutra casa da cidade, D-098)` : ''; };
    const backSaid = back ? `voltou a ${from}, de pé, com o registro dela, e ${stayed} seguem nela${away()}` : `NÃO voltou (${hh.type}${hh.built ? '' : ', em obra'}, registro ${hh.ip ? hh.ip.t : 'nenhum'}${builder ? '' : ', sem construtor na cidade'})`;
    // (raised again and finished — the materials in, the last stroke by the world's own door —: the family in the new house)
    let done = false, regEnd = null, inNew = 0;
    if (back) {
      raise(hh); for (const k in hh.need) hh.need[k] = 0; hh.progress = 1; V.completeBuilding(hh); live(2);
      // (and its record made over at once — Interiors.complete —: the new house's plan, not the old one's until the turn of the day)
      regEnd = hh.ip ? hh.ip.t : null;
      done = hh.built && !hh.upgradeFrom && hh.type === UP[from] && regEnd === hh.type;
      inNew = fam0.filter(id => id !== ownerId && kept(id)).length;
    }
    const crowd17 = !!seen17 && seen17.n > seen17.cap && !!seen17.msg;
    fine = n0 >= 3 && regMid === from && asleepIn.length >= Math.min(2, n0) && !outs.size && lar > 0 && afterIn.length === asleepIn.length && !lost.length && !!fetched && crowd17 && !!heir && heir.id !== ownerId && gaveUp && back && stayed >= n0 - 1 && done && inNew >= n0 - 1;
    info = `${set.name}: ${from}#${h.id} ampliada a ${UP[from]} por cima de ${n0} moradores (a planta durante a obra: ${regMid === from ? `a da casa antiga, ${from}` : `${regMid || 'NENHUMA'}, NÃO A DA CASA ANTIGA`}) → à noite ${asleepIn.length} dormindo dentro${outs.size ? `, ${outs.size} AO RELENTO` : ', ninguém ao relento'}; ${lar} olhadas no lar, ${family} na noite em família; o save no meio da noite: ${afterIn.length} dentro depois${lost.length ? ' — MUDOU: ' + lost.slice(0, 3).join(' · ') : ', cada um como estava'}; a jarra vazia de madrugada ${fetched ? `cheia de novo às ${fmtT(fetched)}` : 'NÃO foi enchida'}; a casa em obra cheia ${seen17 ? `(${seen17.n} para as ${seen17.cap} camas da casa que ela será): ${crowd17 ? `o verificador viu «${seen17.msg}»` : 'o verificador NÃO viu o velho posto para fora antes do moço'}` : 'SEM GENTE para a prova do verificador'}; ${owner ? `${owner.name} (o dono) morreu: ${heir ? `a casa ficou com ${heir.name}` : 'a casa ficou SEM DONO'}` : 'SEM DONO para morrer'}; a obra deixada: ${backSaid}; ampliada de novo e pronta: ${!back ? '—' : done ? `${hh.type}, com o registro refeito na hora, ${inNew} morando nela${away()}` : `NÃO ficou pronta (${hh.type}, registro ${regEnd || 'nenhum'})`}`;
  }
  ok('l17 a casa em ampliação continua sendo a casa da família (L-371)', fine, info);
  nightReady = false;
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
    const rep11b = !!(G.Interiors && G.Interiors.placeRule);
    ok('l11b quem reza dentro está num lugar de rezar', rep11b && !praying.length, !rep11b ? 'sem o repartidor dos lugares do P4 (In.placeRule): ainda não há lugar de rezar a dar' : praying.length ? `${praying.length} rezando fora das esteiras, dos bancos e do altar (o repartidor do P4 com a regra do templo): ${praying.slice(0, 2).join(' · ')}` : 'todos nas esteiras, nos bancos ou no altar da planta');
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

// ======================= l10b: a feast does not take who is on the way to a meal (L-234) =======================
if (want('l10b')) {
  // (the feast's hour, as l10; two grown ones of the town awake, at the top of hunger with the life going, on their way to
  // the store — the test's hand —, when the feast begins: they eat first, and are not in its crowd)
  open(); set = town(); const f = G.Fac.get(set.fac); S.time = 0.62; liveTo(0.8);
  const keys = G.Fest.of(f.civ).filter(k => !G.Fest.DEF[k].trigger);
  D.make('f:' + f.id, 'food', 40, { code: 'teste', part: true });
  const hungry = people(set).filter(v => v.age >= 18 && v.age < 60 && !v.sleeping && !v.inside && !isBody(v) && !(v.task && v.task.pri >= 3)).slice(0, 2);
  for (const v of hungry) { v.hunger = 100; v.hp = 30; v._noStore = 0; v._hungerT = 0; G.Vg.endTask(v); G.Vg.setTask(v, { type: 'eat', pri: 2.5 }); }
  let fe = null; for (const k of keys) { fe = G.Fest.start(set, k, {}); if (fe) break; }
  const taken = fe ? hungry.filter(v => fe.parts.includes(v.id)) : [];
  let ate = 0; if (fe) live(40, () => { ate = hungry.filter(v => S.villagers.has(v.id) && v.hunger < 60).length; return ate === hungry.length; });
  ok('l10b a festa não leva quem vai comer (L-234)', !!fe && hungry.length >= 1 && !taken.length && ate === hungry.length,
    fe ? `${fe.key} em ${set.name}: ${hungry.map(v => `${v.name} (fome 100, vida 30, indo comer)`).join(', ')} — ${taken.length ? `${taken.map(v => v.name).join(', ')} LEVADO(S) PARA A PLATEIA` : 'nenhum levado para a plateia'}; ${ate} de ${hungry.length} comeram` : `${set.name} não começou nenhuma festa: ${keys.join(', ')}`);
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
