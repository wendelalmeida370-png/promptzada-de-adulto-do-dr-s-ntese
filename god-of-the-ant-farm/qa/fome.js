// fome: a fome com comida, provocada de propósito (C1; L-164, L-165 e L-169, os defeitos antigos que mataram Texcoco: 77
// ex-cativos com 770 de comida no estoque e nenhum armazém; L-171 e L-170, os que o verificador novo achou depois: quem
// dorme cansado ou está na festa com a fome no máximo, e o condenado) — no mundo pronto «cidade» (ou: node qa/fome.js metropole).
// h1 a obra de seis sextos: os golpes do salto numa fogueira de trabalho 3 somam 0,9999999999999999, e o construtor que sai
//    nesse golpe deixava a obra de ninguém para sempre — agora o próximo construtor a termina
// h2 a obra parada no último milésimo de um save velho (como a casa #2175 do «anos100»): salva, carregada, volta a andar
//    sozinha
// h3 a obra que espera um material que o povo não tem: continua esperando (ninguém fica nela sem fazer nada), e anda quando
//    o material chega
// h4 o povo livre fundado de propósito (G.War.foundFree), com fome: sem armazém ninguém escolhe «comer no armazém»; a
//    fogueira parada no último golpe (o construtor chamado embora), salva e carregada no meio, fica pronta; comem; o deus
//    derruba a fogueira e, de novo, ninguém fica preso a um comer impossível, e ela volta — os construtores com carga nas
//    mãos a pousam no chão (L-169); quem a levanta morre no meio e outro termina; um dia inteiro pelo salto sem ninguém
//    morrer de fome
// h5 a regra S1 do verificador: uma cidade cujo povo morre de fome com comida no estoque e nenhum armazém
// h6 a regra S2: alguém morrendo de fome com comida ao alcance, livre, numa cidade calma, preso a outra coisa ou sem afazer
//    depois de escolher — e não quem vai comer, foge, luta, está entre dois afazeres, condenado ou cativo, nem quem está
//    numa cidade atacada ou em fogo
// h7 o ferido (vida 40) com a fome no máximo, deitado de noite no sono do cansaço: acorda, come e volta a dormir (L-171)
// h8 quem está na festa com a fome no máximo sai para comer, e a festa segue sem ele (L-171)
// h9 quem dorme com fome e não tem o que comer ao alcance não fica acordando a cada passo
// h10 o condenado come enquanto espera a hora, como o preso na cela (L-170)
// h11 a caminho da cama, quem morre de fome com pão nas mãos come antes de deitar (L-171; achado pela regra S2 no negocio)
// h12 a criança que a fome acorda de noite come antes de voltar para a cama (L-171; achado pela regra S2 na medida)
// h13 a tripulação esperando no cais a partida da viagem come das provisões, como quem está em campo (L-201; achado pela
//    regra S2 no porto)
// h14 a cidade que a água cortou de todos os seus armazéns acende uma fogueira do lado das suas ruas, e quem tem fome lá
//    come (L-368; achado pela regra S2 no caos da semente 13: a criança de Tenochtitlan que morreu de fome em casa)
// e o verificador limpo no meio de cada caso (o que ele vê no meio reprova o caso), sem erro de módulo nem aviso no console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | fome ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan' || q.sys === 'fome'));
const watch = () => { const bb = bad(); if (bb.length) { for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
const D = G.Depot, V = G.Village, Vg = G.Vg, W = G.W;
const r2 = x => Math.round(x * 100) / 100;
let S;
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 50 === 49) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
const world = process.argv[2] || 'cidade';
M.pronto(world); S = G.S; M.viver(2); G.inSim++;
// the town: the most people of all, with builders and a store; a work of it, placed where the city says
const builders = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'construtor' && !v.captive).length;
let set0 = [...S.settlements.values()].filter(s => builders(s) >= 2 && V.dropoffs(s.id).length).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
if (!set0) { console.log('FALHOU | fome | nenhuma cidade com construtores e armazém'); process.exit(1); }
let f0 = G.Fac.get(set0.fac);
// (saved and loaded: the world's objects are new ones — the test holds ids)
const reload = () => { G.inSim--; M.salvarCarregar(); G.inSim++; S = G.S; set0 = S.settlements.get(set0.id); f0 = G.Fac.get(f0.id); };
console.log(`(${world}: ${set0.name}, de ${f0.name}: ${V.pop(set0.id)} habitantes, ${builders(set0)} construtores)`);
const project = type => { for (const t of [type, 'hut', 'well', 'house']) { const b = V.startProject(set0, t); if (b) return b; } return null; };
const builtNow = id => { const b = S.buildings.get(id); return !!(b && b.built); };
const onIt = id => [...S.villagers.values()].filter(v => v.task && v.task.type === 'build' && v.task.id === id);
const leaveIt = b => { for (const v of onIt(b.id)) Vg.endTask(v); }; // (the builder called away)
const allIn = b => { for (const k in b.need) b.need[k] = 0; b.incoming = {}; }; // (every material delivered)

// ---------------- h1 six sixths ----------------
let six = 0; for (let k = 0; k < 6; k++) six = Math.min(1, six + 0.5 / 3); // (the strokes of the skip's half steps on a work of 3)
{
  const b = project('hut'); let n = 0, done = false;
  if (b) { allIn(b); b.progress = six; leaveIt(b); done = live(120, () => builtNow(b.id)); n = b.id; }
  ok('h1 a obra de seis sextos', !!b && six < 1 && done, `seis golpes de 1/6 somam ${six} (${six >= 1 ? 'chega' : 'não chega'} a 1); ${b ? `${b.type}#${n}, todo o material entregue, deixada ali pelo construtor: ${done ? 'outro construtor a terminou' : 'ninguém mais voltou a ela em 120 s'}` : 'nenhuma obra possível'}`);
}

// ---------------- h2 the last thousandth, in an old save ----------------
{
  const b = project('hut'); let done = false, id = 0;
  if (b) { allIn(b); b.progress = 0.9991666666666666; leaveIt(b); id = b.id; reload(); done = live(120, () => builtNow(id)); }
  const o = S.buildings.get(id);
  ok('h2 a obra parada no último milésimo de um save velho volta a andar sozinha', !!b && done, b ? `${o ? o.type : '-'}#${id} a 0,99917 com todo o material, salva e carregada: ${done ? 'pronta' : 'ainda a ' + (o ? o.progress : '-')}` : 'nenhuma obra possível');
}

// ---------------- h3 waiting for a material the people do not have ----------------
{
  const b = project('hut'); const RARE = ['marfim', 'perolas', 'coral', 'seda', 'joias', 'ouro']; const k = RARE.find(q => !((f0.stock[q] || 0) >= 1));
  let waited = false, onAll = 0, looks = 0, prog0 = 0, came = false, id = 0;
  if (b && k) {
    id = b.id; allIn(b); b.need[k] = 3; // (three of a thing the people lack: what it allows is the rest)
    const al = Vg.allowedProgress(b); b.progress = al; prog0 = b.progress; leaveIt(b);
    for (let t = 0; t < 30; t++) { live(1); looks++; if (onIt(id).length) onAll++; }
    waited = !builtNow(id) && Math.abs(S.buildings.get(id).progress - prog0) < 1e-9 && onAll === 0;
    D.make('f:' + f0.id, k, 3, { code: 'teste' }); // (the material comes to the store)
    came = live(150, () => builtNow(id));
  }
  ok('h3 a obra sem o material continua esperando, sem ninguém preso nela, e anda quando ele chega', !!b && !!k && waited && came, b && k ? `faltando 3 de ${k} (o povo tem ${Math.floor(f0.stock[k] || 0)} agora): ${waited ? 'esperou' : 'não esperou'} (construtores nela em ${onAll} de ${looks} olhadas, o progresso ${r2(prog0)} → ${r2((S.buildings.get(id) || {}).progress || 0)}); com o material: ${came ? 'pronta' : 'não ficou pronta'}` : 'sem obra ou sem um material que falte');
}

// ---------------- h4 a free people founded on purpose ----------------
let fset = null, ffac = null, band = [];
{
  const kids = [...S.villagers.values()].filter(v => v.set === set0.id && v.age >= 6 && v.age < 14 && !v.captive && !v.aboard && !v.ug).sort((a, b) => a.id - b.id).slice(0, 4);
  const grown = [...S.villagers.values()].filter(v => v.set === set0.id && v.age >= 18 && v.age < 55 && !v.captive && !v.aboard && !v.jail && !v.ug && v.id !== f0.leader && v.role !== 'guerreiro' && !(S.avatar && S.avatar.id === v.id)).sort((a, b) => a.id - b.id).slice(0, 10);
  band = grown.concat(kids);
  // (ex-captives: hungry; the children with a plain load of the captor's work still in the hands)
  band.forEach((v, i) => { Vg.endTask(v); if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true, part: true }); v.hunger = 40 + (i % 4) * 10; if (v.age < 14) D.make('v:' + v.id, i % 2 ? 'wood' : 'stone', 2, { code: 'teste' }); });
  const captor = G.Fac.all().filter(o => o.id !== f0.id && G.Fac.pop(o.id) > 0).sort((a, b) => a.id - b.id)[0] || null;
  ffac = G.War.foundFree(band, captor, 'revolta'); fset = ffac ? G.Fac.capitalOf(ffac.id) : null;
  if (!fset) { ok('h4 o povo livre fundado', false, 'nenhum lugar livre para a cidade neste mundo'); }
}
const fireOf = () => { const s = fset && S.settlements.get(fset.id); const b = s && S.buildings.get(s.campfire); return b && b.type === 'campfire' ? b : null; };
const people = () => [...S.villagers.values()].filter(v => fset && v.set === fset.id);
const starved = () => { let n = 0; for (const id of band.map(v => v.id)) if (!S.villagers.has(id)) n++; return n; };
let hungerDead = 0; { const kill0 = V.kill; V.kill = function (v, cause) { if (v && fset && v.set === fset.id && cause === 'hunger' && S.villagers.has(v.id)) hungerDead++; return kill0.apply(this, arguments); }; }
if (fset) {
  console.log(`(${band.length} de ${set0.name} fundam ${fset.name}, de ${ffac.name}: ${Math.floor(ffac.stock.food)} de comida no estoque, nenhum prédio)`);
  // before any store: the hungry do not choose a meal at a store that does not exist (the choice, L-165) — asked of the
  // hungriest, as its own decision would ask (its errand let go for it, and given back)
  let eatAsked = 0, eatGot = 0;
  const askEat = () => {
    const v = people().filter(o => o.age >= 6 && !V.nearestDropoff(o.x, o.y, o.set)).sort((a, b) => b.hunger - a.hunger || a.id - b.id)[0]; if (!v) return;
    v.hunger = Math.max(v.hunger, 90); const keep = v.task ? Object.assign({}, v.task) : null; Vg.endTask(v);
    const t = Vg.H.eatTask(v); eatAsked++; if (t && t.type === 'eat') eatGot++;
    Vg.endTask(v); if (keep && keep.type === 'migrate') Vg.setTask(v, { type: 'migrate', pri: 1.6, kind: 'migrate' });
  };
  askEat();
  live(60, () => !!fireOf());
  const cf = fireOf();
  // the fire left at its last stroke: six sixths, its builder called away — and the save loaded right then
  if (cf && !cf.built) { askEat(); cf.progress = six; leaveIt(cf); reload(); }
  const lit = live(120, () => { const b = fireOf(); return !!(b && b.built); });
  const food = () => { const f = G.Fac.get(ffac.id); return f ? f.stock.food : 0; };
  // (what they ate from the store: its change, less what came in and went out by the ledger — the meal is taken from the
  // stock by hand, and the gatherers deliver to the fire while the hungry eat: in the cidade of before the 28/10 worlds, a
  // minute of 11 meals in which 13 of food came in, and the stock went up, T-181)
  const fRef = 'f:' + ffac.id; let fin = 0, fout = 0; const book = e => { if (e[5] !== 'food') return; if (e[4] === fRef) fin += e[6]; if (e[3] === fRef) fout += e[6]; };
  D.onMove.push(book); const food0 = food(); live(60); const food1 = food(); D.onMove.splice(D.onMove.indexOf(book), 1); const ate = food0 + fin - fout - food1;
  ok('h4 o povo livre: ninguém escolhe comer num armazém que não existe; a fogueira parada no último golpe (e salva) fica pronta, e comem', !!cf && lit && eatGot === 0 && eatAsked > 0 && ate > 0.5 && !hungerDead,
    `${cf ? 'a fogueira #' + cf.id + ' deixada em ' + six + ', o save carregado: ' + (lit ? 'pronta' : 'não ficou pronta') : 'o planejador não pôs a fogueira'}; sem armazém, ${eatAsked} perguntas de comer a quem tinha fome, ${eatGot} «comer no armazém»; o estoque do povo ${Math.floor(food0)} → ${Math.floor(food1)} (pelo livro entrou ${r2(fin)} e saiu ${r2(fout)}: comeram ${r2(ate)}); mortes de fome ${hungerDead}`);

  // the god pulls the fire down: no store again — nobody stuck on a meal that cannot be; the fire comes back
  const cf1 = fireOf(); if (cf1) V.destroyBuilding(cf1, 'deus');
  eatAsked = 0; eatGot = 0;
  askEat(); const ask1 = eatAsked, got1 = eatGot;
  // (whoever raises it dies in the middle: another finishes it)
  let killed = 0; const back = live(150, () => { const b = fireOf(); if (b && !b.built && !killed) { const w = onIt(b.id).find(v => v.task.st === 4); if (w) { V.kill(w, 'god', true); killed = w.id; } } return !!(b && b.built); });
  const fsNow = S.settlements.get(fset.id); const bsNow = [...S.buildings.values()].filter(b => b.set === fset.id).map(b => `${b.type}${b.built ? '' : '(' + Math.round((b.progress || 0) * 100) + '%)'}`);
  if (!back) console.log('   (h4: ' + people().filter(o => o.age >= 16).map(o => `${o.role || '-'}:${o.task ? o.task.type + (o.task.id ? '#' + o.task.id : '') : '-'}${o.carry ? '/' + o.carry.k + ' ' + o.carry.n : ''} f${Math.round(o.hunger)}`).join(' ') + ')');
  ok('h4 o deus derruba a fogueira: sem armazém ninguém fica preso a um comer impossível; ela volta, mesmo com quem a levantava morto no meio', !!cf1 && got1 === 0 && ask1 > 0 && back && !hungerDead,
    `${cf1 ? 'derrubada' : 'sem fogueira'}; ${ask1} com fome perguntados, ${got1} «comer no armazém»; ${killed ? 'o construtor #' + killed + ' morreu no meio, ' : ''}${back ? 'outra fogueira pronta' : 'nenhuma fogueira de pé'} (prédios [${bsNow.join(' ')}], fogueira ${fsNow ? fsNow.campfire : '-'}, falhas ${fsNow ? fsNow.fails : '-'}); mortes de fome ${hungerDead}`);

  // a whole day of the world by the skip: nobody of them dies of hunger
  G.inSim--; const d0 = S.day; G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
  try { let n = 0; while (S.day - d0 < 1) { G.Main.skipStep(1); if (++n % 40 === 0) watch(); } } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; }
  G.inSim++;
  const left = people().length; const fire = fireOf();
  ok('h4 um dia inteiro pelo salto: ninguém do povo livre morre de fome', !hungerDead && !!fire && fire.built, `${left} pessoas em ${fset.name} (${starved()} do bando saíram do mundo, nenhuma de fome); a fogueira ${fire && fire.built ? 'de pé' : 'não está de pé'}; mortes de fome ${hungerDead}`);
}

// ---------------- h5 the rule S1: a town dying of hunger with food in the stock and no store ----------------
{
  let got = [], none = [], lighting = [];
  if (fset) {
    const fire = fireOf(); const was = fire ? fire.id : 0;
    const ppl = people().filter(v => v.age >= 6).slice(0, 3); const keep = ppl.map(v => [v.hunger, v.hp]);
    for (const v of ppl) { v.hunger = 100; v.hp = 35; }
    none = QA.check().filter(q => q.sys === 'fome' && q.sev === 1 && q.msg.startsWith(fset.name + ':'));
    // (the town without a store, for the look — every store of it: its fire, and a storehouse its builders may have raised in
    // the day of the skip, as with the final worlds, T-203 —: put back at once)
    // (and the fire as one rising for three days — a town that did not light it again in all that time; one rising since
    // today, its stores taken by a disaster this very day, is a town lighting it, and the rule waits for it, T-225)
    const stores = V.dropoffs(fset.id); const born = stores.map(b => b.born); for (const b of stores) { b.built = false; b.born = S.day - 3; }
    got = QA.check().filter(q => q.sys === 'fome' && q.sev === 1 && q.msg.startsWith(fset.name + ':'));
    for (const b of stores) b.born = S.day;
    lighting = QA.check().filter(q => q.sys === 'fome' && q.sev === 1 && q.msg.startsWith(fset.name + ':'));
    stores.forEach((b, i) => { b.built = true; b.born = born[i]; });
    ppl.forEach((v, i) => { v.hunger = keep[i][0]; v.hp = keep[i][1]; });
    void was;
  }
  ok('h5 o verificador (S1): uma cidade morrendo de fome com comida no estoque e nenhum armazém', !!fset && got.length === 1 && !none.length && !lighting.length, got.length ? `«${got[0].msg}» (a fogueira em obra há três dias); com a fogueira em obra desde hoje: ${lighting.length ? 'também (errado)' : 'nada'}; com a fogueira de pé: ${none.length ? 'também (errado)' : 'nada'}` : 'o verificador não viu');
}

// ---------------- h6 the rule S2: someone dying of hunger with food in reach ----------------
{
  const calm = [...S.settlements.values()].filter(s => !G.War.threat(s.id) && V.dropoffs(s.id).length && G.Fac.get(s.fac) && G.Fac.get(s.fac).stock.food >= 5).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
  const v = calm && [...S.villagers.values()].filter(o => o.set === calm.id && o.age >= 18 && !o.captive && !o.jail && !o.aboard && !o.ug && !o.held && !o.air && W.reaches(o, ...V.frontTile(V.nearestDropoff(o.x, o.y, o.set)))).sort((a, b) => a.id - b.id)[0];
  const said = (who, t) => QA.check().filter(q => q.sys === 'fome' && q.sev === 2 && q.id === who.id);
  let held = [], eating = [], fleeing = [], captive = [], attacked = [], condemned = [], burning = [], fighting = [], between = [], nothing = [];
  if (v) {
    const keep = [v.hunger, v.hp, v.captive]; const set = S.settlements.get(v.set); const alarm = set.alarmT;
    Vg.endTask(v); v.hunger = 100; v.hp = 35;
    Vg.setTask(v, { type: 'idle', pri: 3, wait: 999 }); held = said(v);          // (stuck to an errand of its own)
    Vg.endTask(v); Vg.setTask(v, { type: 'eat', pri: 2.5 }); eating = said(v);   // (on the way to eat)
    Vg.endTask(v); Vg.setTask(v, { type: 'flee', pri: 5 }); fleeing = said(v);   // (running from a danger)
    Vg.endTask(v); Vg.setTask(v, { type: 'condemned', pri: 6 }); condemned = said(v); // (not free: bound for the scaffold)
    Vg.endTask(v); Vg.setTask(v, { type: 'fight', pri: 4, id: 0 }); fighting = said(v); // (in a fight: a beast, a brawl)
    const th0 = v.think; Vg.endTask(v); v.think = 0.2; between = said(v); // (an errand just ended: the next choice at the coming step)
    v.think = 1.8; nothing = said(v); v.think = th0;                      // (no errand after a choice: the choice found nothing — stuck)
    Vg.endTask(v); v.captive = { from: v.set, home: v.set }; captive = said(v); v.captive = keep[2];
    set.alarmT = 30; attacked = said(v); set.alarmT = alarm;
    const al = Vg.alarms.get(set.id); Vg.alarms.set(set.id, [W.idx(set.cx, set.cy)]); burning = said(v); if (al) Vg.alarms.set(set.id, al); else Vg.alarms.delete(set.id); // (a fire in the town)
    Vg.endTask(v); v.hunger = keep[0]; v.hp = keep[1];
  }
  ok('h6 o verificador (S2): quem morre de fome com comida ao alcance, preso a outra coisa ou sem afazer depois de escolher; não quem vai comer, foge, luta, está entre dois afazeres, condenado ou cativo, nem numa cidade atacada ou em fogo', !!v && held.length === 1 && nothing.length === 1 && !between.length && !eating.length && !fleeing.length && !fighting.length && !condemned.length && !captive.length && !attacked.length && !burning.length,
    v ? `${v.name} em ${calm.name}: ${held.length ? '«' + held[0].msg + '»' : 'o verificador não viu'}; sem afazer depois de escolher ${nothing.length}, entre dois afazeres ${between.length}, indo comer ${eating.length}, fugindo ${fleeing.length}, lutando ${fighting.length}, condenado ${condemned.length}, cativo ${captive.length}, cidade atacada ${attacked.length}, cidade em fogo ${burning.length}` : 'ninguém numa cidade calma');
}

// ---------------- h7 the wounded sleeper: wakes at night to eat, and sleeps again (L-171) ----------------
// (someone of a calm town with food in its store, at night, worn out — the sleep of exhaustion, that a meal did not
// break — with the hunger at the top and 40 of life)
const calmOne = (skip, also) => {
  const ok2 = s => !G.War.threat(s.id) && V.dropoffs(s.id).length && G.Fac.get(s.fac) && G.Fac.get(s.fac).stock.food >= 5;
  for (const s of [...S.settlements.values()].filter(ok2).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)) {
    const o = [...S.villagers.values()].filter(q => q.set === s.id && q.age >= 18 && q.age < 50 && !q.captive && !q.jail && !q.aboard && !q.ug && !q.held && !q.air && !(S.avatar && S.avatar.id === q.id) && !(skip || []).includes(q.id) && q.home && S.buildings.get(q.home) && S.buildings.get(q.home).built && W.reaches(q, ...V.frontTile(V.nearestDropoff(q.x, q.y, q.set)))).sort((a, b) => a.id - b.id)[0];
    if (o && (!also || also(o))) return o;
    if (also) { const o2 = [...S.villagers.values()].filter(q => q.set === s.id && q.age >= 18 && q.age < 50 && !q.captive && !q.jail && !q.aboard && !q.ug && !q.held && !q.air && !(S.avatar && S.avatar.id === q.id) && !(skip || []).includes(q.id) && q.home && S.buildings.get(q.home) && S.buildings.get(q.home).built && also(q) && W.reaches(q, ...V.frontTile(V.nearestDropoff(q.x, q.y, q.set)))).sort((a, b) => a.id - b.id)[0]; if (o2) return o2; }
  }
  return null;
};
{
  const v = calmOne(); const t0 = S.time; let woke = false, ate = false, slept = false, h0 = 0;
  if (v) {
    S.time = 0.86; Vg.endTask(v); v.hunger = 100; v.hp = 40; v.energy = 5; v._hungerT = 0;
    Vg.setTask(v, { type: 'sleep', pri: 2.5, kind: 'sleep' }); h0 = v.hunger;
    live(80, () => { if (!S.villagers.has(v.id)) return true; if (v.task && v.task.type !== 'sleep' && !woke) woke = true; if (woke && v.hunger < 60) ate = true; if (ate && v.task && v.task.type === 'sleep') slept = true; return slept; });
  }
  ok('h7 o ferido com a fome no máximo, deitado de noite: acorda, come e volta a dormir', !!v && woke && ate && slept && S.villagers.has(v.id),
    v ? `${v.name}: ${woke ? 'acordou' : 'não acordou'}${ate ? ', comeu (fome ' + Math.round(h0) + ' → ' + Math.round(v.hunger) + ')' : ''}${slept ? ', voltou a dormir' : ''}; vida ${Math.round(v.hp)}` : 'ninguém numa cidade calma');
  S.time = Math.max(S.time, t0);
}

// ---------------- h8 the hungry one at a festival leaves to eat; the festival goes on (L-171) ----------------
{
  let left = false, still = 0, who = null, fe = null, key = '', town = null; const tried = [];
  // (a festival of the town's own people, begun at its hour — the first town and feast of them that can hold one)
  for (const s of [...S.settlements.values()].filter(s => !G.War.threat(s.id) && V.dropoffs(s.id).length && G.Fac.get(s.fac) && G.Fac.get(s.fac).stock.food >= 5).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)) {
    const civ = (G.Fac.get(s.fac) || {}).civ;
    for (const k of Object.keys(G.Fest.DEF).filter(q => G.Fest.DEF[q].civ === civ && G.Fest.DEF[q].every && !G.Fest.DEF[q].trigger)) {
      S.time = G.Fest.DEF[k].at + 0.01; fe = G.Fest.start(s, k); tried.push(s.name + '/' + k); if (fe) { town = s; key = k; break; }
    }
    if (fe) break;
  }
  if (fe) {
    const crowd = () => [...S.villagers.values()].filter(q => q.task && q.task.type === 'fest' && q.task.fid === fe.id);
    who = crowd().filter(q => q.task.role !== 'victim' && q.task.role !== 'chained' && q.age >= 6 && !q.captive).sort((a, b) => b.age - a.age || a.id - b.id)[0];
    if (who) { who.hunger = 100; who.hp = 40; who._hungerT = 0; live(20, () => { left = !(who.task && who.task.type === 'fest'); return left; }); still = crowd().length; }
  }
  ok('h8 quem está na festa com a fome no máximo sai para comer, e a festa segue sem ele', !!who && left && still > 0 && !!(who.task && (who.task.type === 'eat' || who.task.type === 'forage' || who.task.type === 'idle')),
    who ? `${who.name} na festa (${key}) de ${town.name}: ${left ? 'saiu (' + (who.task ? who.task.type : 'sem tarefa') + ')' : 'continuou na festa'}; ${still} ainda na festa` : fe ? 'a festa começou sem ninguém na roda' : `nenhuma festa começou (${tried.slice(0, 6).join(', ')})`);
}

// ---------------- h9 with nothing to eat in reach, a sleeper is not woken at every step ----------------
{
  // (one who is neither hunter nor soldier: the hunter on the way to bed meets an animal, kills it and eats of the meat, and
  // rested at the night's end is the town's night watch — the world's own causes, not the hunger the case is about: in the
  // cidade grown by L-322 that was Isetnofret, T-135)
  const v = calmOne([], q => q.role !== 'cacador' && q.role !== 'guerreiro'); let wakes = 0, asleep = 0, looks = 0, walk = 0; let f = null, food0 = 0; const seen = [];
  if (v) {
    f = G.Fac.get(S.settlements.get(v.set).fac); food0 = f.stock.food;
    const h = S.buildings.get(v.home); const pan0 = h ? h.pantry || 0 : 0;
    // (nothing to eat in reach for the case: the store out of the way — the mark the world leaves when the way to it is not
    // found (_noStore), kept on for the case —, the berries around picked, no plain food in the hands; the people's farmers
    // keep filling the store meanwhile, so an emptied store would not stay empty)
    if (v.carry && v.carry.k === 'food') D.use('v:' + v.id, 'food', v.carry.n, { code: 'teste', mine: true, part: true });
    // (the berries around picked, and picked again as they grow back — with the growth a bush keeps stored, b.grow: a full bush
    // keeps growing, and the step after the picking its store came back as berries at once; in a newer world a bush 1,8 from
    // her bed woke her to forage. Out to 30: the hunger looks for a bush in a square of twenty tiles each way, 28,3 at its
    // corners, T-115)
    const bushes = new Map(); const pick = () => { for (const b of S.bushes.values()) if ((b.berries > 0 || b.grow > 0) && (G.dist(b.x, b.y, v.x, v.y) < 30 || (h && G.dist(b.x, b.y, h.x, h.y) < 30))) { if (!bushes.has(b)) bushes.set(b, [b.berries, b.grow]); b.berries = 0; b.grow = 0; } };
    S.time = 0.86; Vg.endTask(v); v.hunger = 100; v.hp = 55; v.energy = 5; v._hungerT = 0;
    Vg.setTask(v, { type: 'sleep', pri: 2.5, kind: 'sleep' });
    // (counted from when she lies down: the way to her bed is the world's own — 3.5 s of it once the plan's door was on —,
    // and the case is about not being woken at every step once asleep: T-076)
    while (walk < 60 && !(v.task && v.task.type === 'sleep' && v.sleeping)) { v._noStore = S.clock + 5; pick(); M.viver(0.5); walk++; }
    // (and nothing plain to eat in the hands once in bed either: what the way to it may have put there)
    if (v.carry && v.carry.k === 'food' && !v.carry.op && !v.carry.to && !v.carry.cid) D.use('v:' + v.id, 'food', v.carry.n, { code: 'teste', mine: true, part: true });
    for (let k = 0; k < 40; k++) { v._noStore = S.clock + 5; pick(); const was = v.task && v.task.type === 'sleep'; M.viver(0.5); looks++; if (v.task && v.task.type === 'sleep' && v.sleeping) asleep++; if (was && !(v.task && v.task.type === 'sleep')) { wakes++; seen.push(v.task ? v.task.type : '-'); } }
    v._noStore = 0; void pan0; void food0;
    for (const [b, [n, g]] of bushes) { b.berries = n; b.grow = g; }
  }
  ok('h9 sem comida ao alcance, quem dorme com fome não fica acordando a cada passo', !!v && wakes === 0 && asleep >= looks - 2, v ? `${v.name}: ${(walk * 0.5).toFixed(1)} s até deitar; depois, ${asleep} de ${looks} olhadas dormindo, ${wakes} vezes acordado sem ter o que comer${seen.length ? ' (' + seen.join(', ') + ')' : ''}` : 'ninguém');
}

// ---------------- h10 the condemned are fed while they wait for their hour, as the jail feeds its prisoners (L-170) ----------------
{
  const v = calmOne(); let fed = false, h0 = 0, how = '-';
  if (v) {
    const f = G.Fac.get(S.settlements.get(v.set).fac);
    S.time = 0.5; Vg.endTask(v); // (the hour is the next midday: most of a day to wait)
    G.Justice.sentence(f, [v], 'pelo teste');
    how = v.task ? v.task.type : '-';
    if (v.task && (v.task.type === 'condemned' || v.task.type === 'jail')) { v.hunger = 80; h0 = v.hunger; live(20, () => { fed = v.hunger < h0 - 20; return fed; }); }
    const e = (S.execs || []).find(q => q.ids.includes(v.id)); if (e) G.Justice.free(e, 'perdao'); else Vg.endTask(v);
  }
  ok('h10 o condenado come enquanto espera a hora, como o preso na cela', !!v && fed, v ? `${v.name}, ${how}: a fome ${Math.round(h0)} → ${Math.round(v.hunger)} (o estoque do povo dá o pão a quem está preso)` : 'ninguém');
}

// ---------------- h11 on the way to bed: the dying one with bread in his hands eats it before lying down (L-171) ----------------
// (found by the rule S2 in the business scenario: Thyra of Birka, walking home to sleep with ten of food in her hands, the
// hunger at the top, 37 of life — the wake was only for one already lying down)
{
  const v = calmOne(); let st = -1, ate = false, h0 = 0, far = 0;
  if (v) {
    // (the test's hand: a walk of a dozen steps from home, on the ground that reaches it — a long road to bed)
    const home = S.buildings.get(v.home); const hf = V.frontTile(home); let at = null;
    for (const r of [12, 9, 6]) { for (let k = 0; k < 24 && !at; k++) { const x = hf[0] + Math.cos(k / 24 * 6.283) * r, y = hf[1] + Math.sin(k / 24 * 6.283) * r; if (W.walkableXY(x, y) && W.canWalk(x, y, hf[0], hf[1])) at = [x, y]; } if (at) break; }
    Vg.endTask(v); if (at) { v.x = at[0]; v.y = at[1]; v.path = null; } far = r2(G.dist(v.x, v.y, hf[0], hf[1]));
    if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true, part: true });
    D.make('v:' + v.id, 'food', 3, { code: 'teste' });
    S.time = 0.86; v.hunger = 100; v.hp = 40; v.energy = 5; v._hungerT = 0; h0 = v.hunger;
    const t = Vg.setTask(v, { type: 'sleep', pri: 2.5, kind: 'sleep' });
    // (the step of the sleep when it ends, read at the end itself: a tenth of a second of the world can hold two steps)
    const end0 = Vg.endTask; Vg.endTask = function (o) { if (o === v && o.task === t) st = t.st; return end0.apply(this, arguments); };
    live(10, () => { if (v.task !== t && v.hunger < h0 - 30) ate = true; return ate || !S.villagers.has(v.id); });
    Vg.endTask = end0;
  }
  ok('h11 a caminho da cama, quem morre de fome com pão nas mãos come antes de deitar', !!v && ate && st === 1,
    v ? `${v.name}, a ${far} de casa, com 3 de comida nas mãos, a fome no máximo e 40 de vida: ${ate && st === 1 ? `comeu a caminho (o sono acabou no passo 1, o de ir para a cama; fome ${Math.round(h0)} → ${Math.round(v.hunger)})` : ate ? `SÓ comeu deitada (o sono acabou no passo ${st}; fome ${Math.round(h0)} → ${Math.round(v.hunger)})` : `NÃO comeu (o sono ${st >= 0 ? 'acabou no passo ' + st : 'não acabou'}; ${v.task ? v.task.type : 'sem tarefa'})`}` : 'ninguém numa cidade calma');
}
// ---------------- h12 the child the hunger wakes at night eats before going back to bed (L-171) ----------------
// (found by the rule S2 in the measurement of 12 years: Tlalli of Tenochtitlan, woken by the hunger at night, sent back to
// bed on the way to the store by the children's own rule of the night, again and again until the morning)
{
  const kid = (() => {
    const ok2 = s => !G.War.threat(s.id) && V.dropoffs(s.id).length && G.Fac.get(s.fac) && G.Fac.get(s.fac).stock.food >= 5;
    for (const s of [...S.settlements.values()].filter(ok2).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)) {
      const o = [...S.villagers.values()].filter(q => q.set === s.id && q.age >= 6 && q.age < 15 && !q.captive && !q.jail && !q.aboard && !q.ug && !q.held && !q.air && q.home && S.buildings.get(q.home) && S.buildings.get(q.home).built && W.reaches(q, ...V.frontTile(V.nearestDropoff(q.x, q.y, q.set)))).sort((a, b) => a.id - b.id)[0];
      if (o) return o;
    }
    return null;
  })();
  let ate = false, back = 0, h0 = 0; const t0 = S.time;
  if (kid) {
    if (kid.carry) D.use('v:' + kid.id, kid.carry.k, kid.carry.n, { code: 'teste', mine: true, part: true });
    S.time = 0.86; Vg.endTask(kid); kid.hunger = 100; kid.hp = 40; kid.energy = 5; kid._hungerT = 0; h0 = kid.hunger;
    Vg.setTask(kid, { type: 'sleep', pri: 1.5, kind: 'sleep' });
    // (the night held for the case: the test's hand on the clock)
    live(40, () => { if (S.time > 0.95) S.time = 0.86; if (!S.villagers.has(kid.id)) return true; if (kid.hunger < h0 - 30) ate = true; if (!ate && kid.task && kid.task.type === 'sleep' && kid._hungerT > S.clock) back++; return ate; });
  }
  ok('h12 a criança que a fome acorda de noite come antes de voltar para a cama', !!kid && ate,
    kid ? `${kid.name}, ${Math.floor(kid.age)} anos, com a fome no máximo e 40 de vida, de noite: ${ate ? `comeu (fome ${Math.round(h0)} → ${Math.round(kid.hunger)})` : `NÃO comeu: posta de volta na cama ${back} vezes antes de comer`}` : 'nenhuma criança numa cidade calma');
  S.time = Math.max(S.time, t0);
}
// ---------------- h13 the crew waiting on the quay for its voyage eats, as the people of the field do (L-201) ----------------
// (found by the rule S2 in the port scenario: Solveig of Birka, of the crew of a voyage still being made ready, waited on the
// quay with the hunger at the top — the quay's errand, 3,25, keeps the hunger from choosing, and it was not one of the
// errands of the field, whose people eat their provisions where they are — down to 32 of life, the store seven steps away)
{
  const onQuay = q => q && q.task && q.task.type === 'cais' && !q.aboard && !q.captive && !(S.avatar && S.avatar.id === q.id);
  let v = [...S.villagers.values()].filter(onQuay).sort((a, b) => a.id - b.id)[0] || null; const tried = [];
  // (no crew on a quay in this world: the people's own reasons for a voyage first, or the god's word — toward the middle of
  // the sea)
  if (!v) {
    S.time = 0.25; const X = G.Expe; let e = null;
    for (const f of [...S.factions.values()].filter(q => q.alive && G.Civ.has(q.id, 'navegacao')).sort((a, b) => a.id - b.id)) {
      if (!X || e) break;
      e = X.consider(f, { many: true }) || X.launch(f, { k: 'terra', w: 1, why: 'terra', txt: '', x: G.N / 2, y: G.N / 2 }, 'media', {});
      tried.push(f.name + (e ? '' : ' (não)'));
    }
    if (e) v = e.crew.map(id => S.villagers.get(id)).filter(onQuay).sort((a, b) => a.id - b.id)[0] || null;
  }
  let ate = false, h0 = 0, where = '-', food = 0, t0 = S.clock, left = '';
  if (v) {
    const st = G.Fac.stockV(v); food = st ? Math.floor(st.food) : 0;
    v.hunger = 95; v.hp = 60; h0 = v.hunger; t0 = S.clock;
    // (on the quay, ten seconds of the world: the meal comes there, or not at all — a voyage the world calls off in the middle
    // sends the crew home, and a meal after that is not this one)
    live(10, () => { if (v.hunger < h0 - 30) { ate = true; where = v.task ? v.task.type : '-'; } if (!onQuay(v) && !left) left = `${v.task ? v.task.type : 'sem tarefa'} em ${Math.round(S.clock - t0)} s`; return ate || !S.villagers.has(v.id) || !!left; });
  }
  ok('h13 a tripulação esperando no cais da viagem come, como quem está em campo', !!v && ate && where === 'cais',
    v ? `${v.name} (${S.settlements.get(v.set) ? S.settlements.get(v.set).name : '?'}), no cais esperando a viagem, com a fome ${Math.round(h0)} e ${food} de comida no estoque do povo: ${ate && where === 'cais' ? `comeu das provisões sem sair do cais, em ${Math.round(S.clock - t0)} s (fome ${Math.round(h0)} → ${Math.round(v.hunger)})` : `NÃO comeu no cais (fome ${Math.round(v.hunger)}, vida ${Math.round(v.hp)}${left ? '; saiu dele: ' + left : `; ${Math.round(S.clock - t0)} s ainda no cais`}${ate ? ', e comeu fora' : ''})`}` : `ninguém no cais de uma viagem (${tried.join(', ') || 'nenhum povo com navegação'})`);
}
// ---------------- h14 a town the water cut off from all its stores lights a fire on its streets' side (L-368) ----------------
// (found by the rule S2 in the chaos of seed 13: Tenochtitlan, cut in two, kept its fire and its quay on the far side of its
// houses; the town counted a fire and never lit another, and a child starved at home for three days. Here the god's water —
// the test's hand: deep sea two steps round every store of the town — cuts them off, and the town must light a fire its
// streets reach, and its hungry eat there)
{
  // (in the morning: the case is the new fire, not the night its builders sleep through)
  S.time = 0.3;
  const set = set0; const stores = V.dropoffs(set.id).slice(); const fire0 = new Set(stores.map(b => b.id));
  const reached = () => [...S.buildings.values()].filter(b => b.set === set.id && G.BDEF[b.type] && (b.built ? G.BDEF[b.type].dropoff : b.type === 'campfire') && W.townReaches(set, ...V.frontTile(b)));
  const was = new Map();
  for (const b of stores) for (let y = b.y - 2; y < b.y + b.h + 2; y++) for (let x = b.x - 2; x < b.x + b.w + 2; x++) {
    if (!W.inb(x, y)) continue; const i = W.idx(x, y); if (S.occ[i] || was.has(i) || S.type[i] <= G.T.SEA) continue; was.set(i, S.type[i]); S.type[i] = G.T.DEEP;
  }
  S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk();
  const cut = !reached().length;
  let lit = null, ate = false, v = null, h0 = 0, t0 = S.clock;
  if (cut) {
    // (a hungry one of the town on its streets: the meal comes at the new fire, or not at all)
    v = [...S.villagers.values()].filter(q => q.set === set.id && q.age >= 16 && !q.captive && !q.aboard && !q.inside && !q.jail && W.reachesTown(q, set) && !(S.avatar && S.avatar.id === q.id)).sort((a, b) => a.id - b.id)[0] || null;
    if (v) { v.hunger = 85; h0 = v.hunger; }
    live(240, () => { const n = reached().find(b => !fire0.has(b.id)); if (n && !lit) lit = n; if (v && v.hunger < h0 - 30) ate = true; return !!(lit && lit.built && (ate || !v)); });
  }
  for (const [i, t] of was) S.type[i] = t; S.typeVer++; W.invalidateLand(); W.touchWalk(); // (the water gone again, for the cases after)
  ok('h14 a cidade cortada de todos os seus armazéns acende uma fogueira do lado das ruas, e quem tem fome come', cut && !!lit && lit.built && (!v || ate),
    !cut ? `a água em volta dos ${stores.length} armazéns de ${set.name} não os cortou das ruas (um ainda alcançado)` : `${set.name}, ${stores.length} armazém(ns) cortado(s) pela água: ${lit ? `${lit.type}#${lit.id} nova, ${lit.built ? 'acesa' : 'AINDA em obra'} em ${Math.round(S.clock - t0)} s` : 'NENHUMA fogueira nova do lado das ruas em 240 s'}; ${v ? `${v.name}, com a fome ${Math.round(h0)}: ${ate ? 'comeu' : 'NÃO comeu'}` : 'ninguém com fome nas ruas'}`);
}
// ---------------- clean ----------------
{ const e = M.erros(); ok('limpo', M.limpo(), Object.keys(e.mod).length ? JSON.stringify(e.mod) : e.console.length ? e.console.slice(0, 2).join(' · ') : 'sem erro de módulo nem aviso no console'); }
console.log(`FOME: ${fails.length ? 'FALHOU (' + fails.join(', ') + ')' : 'ok'}`);
process.exit(fails.length ? 1 : 0);
