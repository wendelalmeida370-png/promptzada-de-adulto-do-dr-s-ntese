// som: o que se ouve (Bairros Vivos, BV-5) — a decisão do som, em Node, onde nada toca.   [ONLY=s3,s7] node qa/som.js [mundo]
// Todo som de lugar vem de uma coisa que o mundo tem perto do ouvido (uma pessoa num gesto, um prédio em atividade, uma
// operação, um navio, um bicho), com a direção, a distância e as paredes no meio; o fundo do bairro é a vida que o bairro de
// fato teve (a média lenta do G.Urban) vezes as mãos que trabalham nele agora; a música tira a escala e o timbre do povo do
// chão e das artes que ele sabe. A prova lê a cena (G.Audio.scene, pura) no mundo pronto «metrópole», vivido pelo passo do
// próprio jogo; arma cada caso pela regra do jogo (a tarefa do ofício, a visita à taverna e às termas — as portas de quem
// vai por vontade própria) e a mão da prova só dá minério e lenha ao armazém (pelo livro) e conta atividade pela porta da
// vida do bairro (G.Urban.note, dentro do passo). Num segundo mundo («cidade»), a mesma vida com e sem o som.
//  s1 a tabela: todo gesto de G.Act.ANIM tem a sua linha (um som da biblioteca, ou um silêncio dito de propósito); nenhuma
//     linha de gesto que não existe; todo som que uma tabela nomeia está na biblioteca; o gesto de um ato sai da tarefa, da
//     carga e do apetrecho (sentado em casa, nas termas, no teatro: três gestos); e, num dia vivido, todo ato que o mundo
//     mostrou numa pessoa tem linha
//  s2 o ouvido: a mesma fonte à esquerda e à direita (o ouvido vira, o lado troca; de frente, no meio); a distância derruba
//     o ganho até o silêncio; uma parede abafa (a rua ouvida de dentro de casa, a casa ouvida da rua), duas abafam mais,
//     nenhuma entre os dois no mesmo prédio
//  s3 o cais: com a descarga viva, as fontes são os estivadores da operação, onde cada um está; de noite, sem mãos, o cais
//     não soa — nem as fontes, nem o fundo
//  s4 a forja: com a fornada na bigorna, o martelo é do ferreiro, da operação e do prédio dele — abafado da rua, limpo de
//     dentro; as forjas sem ninguém martelando não soam
//  s5 a taverna: com gente às mesas, o burburinho é do prédio e da operação do dia, mais forte com mais gente; vazia, calada;
//     e o alaúde só soa com alguém tocando — a fonte é quem toca, na escala do povo dele
//  s6 as termas: a água soa com alguém no banho — a fonte é quem se banha —, a fornalha só ronca acesa; sem banhista, nada
//  s7 o fundo do bairro: o hábito segue a vida contada (sobe e desce devagar, um quinto por dia), o peso é o hábito vezes as
//     mãos de agora (o bairro de hábito cheio, sem mãos, não soa), a chuva encobre, e a mistura de quem ouve anda devagar
//  s8 a música: cada povo a sua escala e o seu timbre, cada época a sua (pedra, bronze, ferro), sempre igual para o mesmo
//     povo e a mesma época; no chão de cada povo, a dele; a mesma em todos os bairros de uma cidade; no ermo, a escala comum
//  s9 o som não muda o mundo: a mesma vida com a cena calculada a cada passo, o tocador ligado (um contexto de áudio de
//     mentira) e um save no meio, e sem nada disso — a mesma impressão do mundo e o mesmo acaso; nenhum sorteio do acaso do
//     mundo vindo do som; e o código da cena não escreve, não sorteia e não abre a porta da vida do bairro
//  s10 a causa: toda fonte de toda cena aponta para uma pessoa acordada num ato, um prédio com a sua operação viva, um navio
//     que anda ou um bicho vivo; e tudo o que o tocador tocou de um lugar tem a sua fonte
//  s11 a mesma cena: o mesmo mundo e o mesmo ouvido dão a mesma cena, duas vezes
//  s12 o fogo só estala onde queima perto do ouvido (L-740): uma árvore em chamas longe não soa, a do lado soa; e os golpes
//     que o mundo toca na hora (G.Audio.at) são ouvidos pelo mesmo ouvido — o lado, a distância, as paredes
//  s13 o ouvido é o corpo: tomado um corpo, o ouvido está onde ele está e vai com ele, virado como o olho, sob o teto que o
//     mundo diz; devolvido o corpo, o ouvido volta a ser o do deus
//  s14 o verificador vê (qa/som-inv.js): as regras do som — toda fonte da cena de cada cidade com dono vivo e números de
//     verdade, o fundo sem peso onde não há mãos, a tabela cobrindo todo gesto — limpas no mundo e acusando cada defeito posto
//  e nenhum erro de módulo nem aviso, e o verificador sem nada novo (as regras do som entre elas).
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/som-inv.js'] });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
// (ONLY=s7 a whole case; ONLY=s7b one part of it — the case runs as far as that part needs)
const on = k => !ONLY || ONLY.includes(k) || ONLY.some(o => /^s\d+[a-z]$/.test(o) && o.slice(0, -1) === k);
const sub = k => !ONLY || ONLY.includes(k) || ONLY.includes(k.slice(0, -1));
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | som ${name} | ${info}`); if (!c) fails.push(name); };
const A = G.Audio, U = G.Urban, D = G.Depot;
const r3 = x => Math.round(x * 1000) / 1000;
const stepIn = fn => { G.inSim++; try { return fn(); } finally { G.inSim--; } };
// (the game's own skip, to an hour of the day)
const skipTo = h => { G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3; try { let n = 0; while (Math.abs(G.S.time - h) > 0.006 && n++ < 450) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; } };
const earAt = (x, y, o) => A.earOf(Object.assign({ x, y, yaw: 0 }, o || {}));
const mid = b => [b.x + (b.w || 1) / 2, b.y + (b.h || 1) / 2];
const free = v => v.age >= 18 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.sleeping && !v.held && !(G.S.avatar && G.S.avatar.id === v.id) && !(v.carry && v.carry.n > 0) && !G.Vg.handsBusy(v);
const townOf = b => G.S.settlements.get(b.set);

// ---- what every scene of the proof is held to (s10) and every act the world showed (s1): gathered as the proof goes
const orphans = []; let scenes = 0, sources = 0;
function causal(c, tag) {
  const S = G.S; scenes++;
  const bad = (f, why) => { if (orphans.length < 8) orphans.push(`${tag}: ${f.k} (${f.tipo} ${f.s}) ${why}`); };
  const one = f => {
    sources++; const de = f.de || {};
    if (de.v !== undefined) { const v = S.villagers.get(de.v); if (!v) return bad(f, 'de ninguém'); if (v.sleeping) return bad(f, 'de quem dorme'); if (f.tipo !== 'luta' && !v.act) return bad(f, 'de quem não faz nada'); if (f.tipo !== 'luta' && (Math.abs(f.x - v.x) > 0.002 || Math.abs(f.y - v.y) > 0.002)) return bad(f, 'fora do lugar de quem a faz'); }
    if (de.op) { const op = G.Act.get(de.op); if (!op || !G.Act.live(op)) return bad(f, 'de uma operação que não está viva'); }
    // (a gesture is the one its person is making: its act is the act the world shows; the water is of who bathes, the
    // watching of who is at the play, the lute of the one the tavern has playing, the anvil of a batch at its hammering)
    if (f.tipo === 'gesto') { const v = S.villagers.get(de.v); const t = v.task || {}; const g = G.Act.ANIM[f.g];
      if (!g || g.act !== v.act) return bad(f, `com o gesto «${f.g}», que não é do ato «${v.act}»`);
      if (f.g === 'banhar' && t.type !== 'termas') return bad(f, 'a água de quem não está no banho');
      if (f.g === 'assistir' && t.type !== 'teatro') return bad(f, 'a plateia de quem não está no espetáculo');
      if (f.g === 'tocar') { const b = S.buildings.get(v.inside); if (!b || b._music !== v.id) return bad(f, 'o alaúde de quem não está tocando'); }
      if (f.g === 'forjar') { const op = G.Act.get(t.op); const s = op && G.Oficio.stage(op); if (t.type !== 'oficio' || !s || s.anim !== 'forjar') return bad(f, 'o martelo de quem não está numa fornada na bigorna'); } }
    if (de.b) { if (!S.buildings.has(de.b)) return bad(f, 'de um prédio que não existe'); }
    if (de.navio !== undefined) { const s = S.ships.find(x => x.id === de.navio); if (!s || !s.moving) return bad(f, 'de um navio parado ou que não existe'); }
    if (de.bicho !== undefined) { const a = S.animals.get(de.bicho); if (!a || a.dead) return bad(f, 'de um bicho morto ou que não existe'); }
    if (de.v === undefined && !de.b && de.navio === undefined && de.bicho === undefined) return bad(f, 'sem dono');
    if (!A.sons().includes(f.s)) return bad(f, 'com um som fora da biblioteca');
    if (!(f.gain >= A.MIN) && !f.longe) return bad(f, 'inaudível na lista');
  };
  for (const f of c.fontes) one(f);
  if (c.fundo) for (const fam of A.FAMS) for (const f of c.fundo.de[fam]) one(Object.assign({ tipo: 'longe', longe: 1 }, f));
  return c;
}
const scene = (ear, tag) => causal(A.scene(ear), tag || '');
const unlined = {}; let actsSeen = 0;
function cover() { for (const v of G.S.villagers.values()) { if (!v.act) continue; actsSeen++; const r = A.linhaDe(v); if (!r || !r.linha || (!r.linha.s && !r.linha.por)) unlined[v.act + ' (tarefa ' + ((v.task || {}).type || '-') + ')'] = 1; } }
const live = (seg, each) => { for (let k = 0; k < Math.round(seg); k++) { M.viver(1); cover(); if (each && each(k)) return true; } return false; };

// =============================================================================================================
// s2 the ear (pure: no world needed beyond one being open)
// =============================================================================================================
function s2() {
  const S = G.S;
  // a source 6 tiles east of the ear; the ear looks north (yaw −90°: its right is east), south (its right is west), east (ahead)
  const src = [40, 40]; const E = yaw => A.earOf({ x: 34, y: 40, yaw });
  const right = A.hear(E(-Math.PI / 2), src[0], src[1], 0, 1), left = A.hear(E(Math.PI / 2), src[0], src[1], 0, 1), ahead = A.hear(E(0), src[0], src[1], 0, 1), behind = A.hear(E(Math.PI), src[0], src[1], 0, 1);
  // (and the god's ear: the screen's right given as a vector)
  const god = A.hear(A.earOf({ x: 34, y: 40, rx: 1, ry: -1, r: 30, k: 0.5, modo: 'deus' }), src[0], src[1], 0, 1), godL = A.hear(A.earOf({ x: 34, y: 40, rx: -1, ry: 1, r: 30, k: 0.5, modo: 'deus' }), src[0], src[1], 0, 1);
  const noDir = A.hear(A.earOf({ x: 34, y: 40 }), src[0], src[1], 0, 1);
  ok('s2a a-direcao', right.pan > 0.9 && left.pan < -0.9 && Math.abs(ahead.pan) < 0.001 && Math.abs(behind.pan) < 0.001 && right.gain === left.gain && god.pan > 0.6 && godL.pan < -0.6 && noDir.pan === 0,
    `a fonte a leste: olhando o norte pan ${right.pan} (direita), o sul ${left.pan} (esquerda), de frente ${ahead.pan}, de costas ${behind.pan}; o mesmo ganho dos dois lados (${right.gain}); o ouvido do deus com a direita da tela a sudeste ${god.pan}, a noroeste ${godL.pan}; sem direção ${noDir.pan}`);
  // the distance: strictly less and less, silence at the reach; a louder reach carries farther; the god from high above hears less
  const ear = A.earOf({ x: 10, y: 10, yaw: 0 }); const gs = [0, 1, 2, 4, 6, 8, 10, 11.9, 12, 15].map(d => A.hear(ear, 10 + d, 10, 0, 1).gain);
  const dec = gs.slice(0, 8).every((g, k) => k === 0 || g < gs[k - 1]);
  const farReach = A.hear(ear, 10 + 13, 10, 0, 1.5).gain, high = A.hear(A.earOf({ x: 10, y: 10, yaw: 0, k: 0.25 }), 12, 10, 0, 1).gain;
  ok('s2b a-distancia', dec && gs[0] === 1 && gs[8] === 0 && gs[9] === 0 && farReach > 0 && high < gs[2] && high > 0,
    `ganho a 0, 1, 2, 4, 6, 8, 10, 11,9, 12 e 15 casas: ${gs.join(', ')} (o alcance de um ouvido: ${A.EAR}); um som que alcança 1,5 ouvido, a 13 casas: ${farReach}; o deus do alto (k 0,25) a 2 casas: ${high} contra ${gs[2]}`);
  // the walls: a closed house and its street
  const house = [...S.buildings.values()].find(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && A.fechado(b.id) === b.id);
  const sq = [...S.buildings.values()].find(b => b.built && b.type === 'praca');
  const ruin = [...S.buildings.values()].find(b => b.type === 'ruin');
  if (!house) return ok('s2c as-paredes', false, 'nenhuma casa fechada no mundo');
  const [hx, hy] = mid(house); const out = A.earOf({ x: hx + 3, y: hy, yaw: 0 }), inn = A.earOf({ x: hx + 3, y: hy, yaw: 0, inside: house.id });
  const street = [hx + 5, hy];
  const a = A.hear(out, street[0], street[1], 0, 1), b = A.hear(inn, street[0], street[1], 0, 1); // the street, from the street and from indoors
  const c = A.hear(out, hx, hy, house.id, 1), d = A.hear(inn, hx, hy, house.id, 1);               // the house, from the street and from indoors
  const other = [...S.buildings.values()].find(x => x !== house && x.built && A.fechado(x.id) === x.id);
  const e = other ? A.hear(inn, hx, hy, other.id, 1) : null;                                         // another house, from indoors: two walls
  ok('s2c as-paredes', a.muf === 0 && b.muf === 1 && c.muf === 1 && d.muf === 0 && Math.abs(b.gain - r3(a.gain * A.WALL)) < 0.002 && Math.abs(c.gain - r3(d.gain * A.WALL)) < 0.002 && (!e || (e.muf === 1 && e.gain < c.gain)) && (!sq || A.fechado(sq.id) === 0) && (!ruin || A.fechado(ruin.id) === 0) && inn.dentro === house.id && out.dentro === 0,
    `${G.Village.buildName(house)} #${house.id}: a rua ouvida da rua ${a.gain} (limpa), de dentro ${b.gain} (abafada: uma parede, ×${A.WALL}); a casa ouvida da rua ${c.gain} (abafada), de dentro ${d.gain} (limpa)${e ? `; outra casa ouvida de dentro ${e.gain} (duas paredes)` : ''}; a praça ${sq ? (A.fechado(sq.id) ? 'FECHADA' : 'é céu aberto') : '(não há)'}; uma ruína ${ruin ? (A.fechado(ruin.id) ? 'FECHADA' : 'é céu aberto') : '(não há)'}`);
}

// =============================================================================================================
// the day of the metropolis: s3 the quay, s4 the forge, s6 the baths, s5 the tavern, the night of each
// =============================================================================================================
function day() {
  const S = G.S; const kept = {};
  // ---------------- s3 the quay with its unloading alive ----------------
  if (on('s3')) {
    skipTo(0.27); let hit = null;
    live(150, () => { for (const op of G.Act.all()) { if (!G.Act.live(op) || op.def !== 'descarga') continue; for (const id in op.roles) { const v = S.villagers.get(+id); if (v && v.task && v.task.op === op.id && v.act === 'lift' && !v.inside) { hit = { op, v }; return true; } } } return false; });
    if (!hit) ok('s3a o-cais-vivo', false, 'nenhum estivador num gesto em 150 s do dia');
    else {
      // (the ear beside her and in her quarter: the bed of a quarter counts the hands in it, D-166 — two tiles east and one south
      // crossed the line of the cells into the next quarter, and its bed had «mãos no cais agora: 0» with her heaving two
      // tiles off, T-963)
      const { op, v } = hit; const dock = S.buildings.get(op.at); const qv = G.Urban.at(v.x, v.y);
      const spot = [[2, 1], [-2, 1], [2, -1], [-2, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0.3, 0.3]].find(([dx, dy]) => G.Urban.at(v.x + dx, v.y + dy) === qv) || [2, 1];
      const ear = earAt(v.x + spot[0], v.y + spot[1]);
      const c = scene(ear, 's3'); const mine = c.fontes.find(f => f.de.v === v.id);
      const quay = c.fontes.filter(f => f.fam === 'cais');
      const all = quay.every(f => { const p = S.villagers.get(f.de.v); const o = f.de.op ? G.Act.get(f.de.op) : null; return p && f.x === r3(p.x) && f.y === r3(p.y) && (f.de.op ? !!(o && o.def === 'descarga' && o.roles[p.id]) : ['cais', 'conferir', 'descarga'].includes((p.task || {}).type)); });
      kept.quay = { ear, dock, op: op.id };
      ok('s3a o-cais-vivo', !!mine && mine.de.op === op.id && mine.fam === 'cais' && ['levantar', 'pousar'].includes(mine.g) && ['heave', 'thud'].includes(mine.s) && mine.x === r3(v.x) && mine.y === r3(v.y) && mine.gain > 0.1 && mine.muf === 0 && all && c.fundo && c.fundo.agora.cais > 0,
        `${townOf(dock) ? townOf(dock).name : '?'}, cais #${dock.id}, hora ${S.time.toFixed(2)}: ${v.name} #${v.id} num «${mine ? mine.g : '?'}» da descarga #${op.id} → som «${mine ? mine.s : '?'}» em (${mine ? mine.x + ', ' + mine.y : '?'}), onde ela está (${r3(v.x)}, ${r3(v.y)}), ganho ${mine ? mine.gain : '?'}, pan ${mine ? mine.pan : '?'}; ${quay.length} fonte(s) do cais, ${all ? 'todas de gente da operação, cada uma no seu lugar' : 'ALGUMA SEM DONO'}; mãos no cais agora: ${c.fundo ? c.fundo.maos.cais || 0 : '?'}`);
    }
  }
  // ---------------- s4 the forge with its batch on the anvil ----------------
  if (on('s4')) {
    if (S.time < 0.28 || S.time > 0.4) skipTo(0.3);
    const forges = [...S.buildings.values()].filter(b => b.type === 'forja' && b.built).map(b => ({ b, f: G.Fac.get(G.Village.facOfSet(b.set)), smith: [...S.villagers.values()].find(v => v.job === b.id && v.role === 'ferreiro' && !v.captive && !v.jail) })).filter(x => x.f && x.smith);
    // (the hand of the proof: ore and wood into each people's store, by the ledger — a caravan's worth)
    stepIn(() => { for (const x of forges) { D.make('f:' + x.f.id, 'minerio', 12, { code: 'teste', part: true }); D.make('f:' + x.f.id, 'wood', 12, { code: 'teste', part: true }); } });
    let hit = null;
    live(260, () => {
      for (const x of forges) {
        const v = x.smith; if (!S.villagers.has(v.id)) continue;
        if (v.act === 'forge' && v.task && v.task.type === 'oficio' && v.inside === x.b.id) { hit = x; return true; }
        // (the smith to the forge, by the trade's own rule: the next thing its batch needs of a hand)
        if (!v.task || (v.task.type !== 'oficio' && (v.task.pri || 0) < 1.5)) stepIn(() => { if (v.sleeping) return; G.Vg.endTask(v); v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 90); G.Oficio.task(v, x.b, x.f, G.Vg.H); });
      }
      return false;
    });
    if (!hit) ok('s4a a-forja-viva', false, `nenhum ferreiro martelando em 260 s (${forges.length} forja(s) com ferreiro: ${forges.map(x => (G.Oficio.batches(x.b).map(op => (G.Oficio.stage(op) || {}).id).join('+') || 'sem fornada') + '/' + ((x.smith.task || {}).type || '-')).join(', ')})`);
    else {
      const b = hit.b, v = hit.smith; const [bx, by] = mid(b); const shutB = A.fechado(b.id) === b.id;
      const out = earAt(v.x + 3, v.y + 0.5), inn = earAt(v.x + 3, v.y + 0.5, { inside: b.id });
      const co = scene(out, 's4 rua'), ci = scene(inn, 's4 dentro');
      const fo = co.fontes.find(f => f.de.v === v.id), fi = ci.fontes.find(f => f.de.v === v.id);
      kept.forge = { out, b, v };
      // the forges where nobody hammers now
      const idle = forges.filter(x => x !== hit && !(x.smith.act === 'forge')).map(x => { const [x0, y0] = mid(x.b); const c = scene(earAt(x0 + 2, y0), 's4 parada'); return { id: x.b.id, anvil: c.fontes.filter(f => f.s === 'anvil' && f.de.b === x.b.id).length, stage: G.Oficio.batches(x.b).map(op => (G.Oficio.stage(op) || {}).id).join('+') || 'sem fornada' }; });
      ok('s4a a-forja-viva', !!fo && fo.g === 'forjar' && fo.s === 'anvil' && fo.de.op === v.task.op && fo.de.b === b.id && fo.fam === 'oficio' && fo.x === r3(v.x) && (!shutB || (fo.muf === 1 && fi && fi.muf === 0 && Math.abs(fo.gain - r3(fi.gain * A.WALL)) < 0.01)),
        `${townOf(b).name}, forja #${b.id} (${shutB ? 'fechada' : 'aberta'}), hora ${S.time.toFixed(2)}: ${v.name} #${v.id} num «${fo ? fo.g : '?'}» da fornada #${v.task.op} → som «${fo ? fo.s : '?'}», do prédio #${fo ? fo.de.b : '?'}; da rua ganho ${fo ? fo.gain : '?'} abafado ${fo ? fo.muf : '?'}, de dentro da forja ganho ${fi ? fi.gain : '?'} abafado ${fi ? fi.muf : '?'}`);
      ok('s4b a-forja-parada', idle.every(x => x.anvil === 0), idle.length ? idle.map(x => `forja #${x.id} (${x.stage}): ${x.anvil} martelo(s)`).join('; ') : 'não há outra forja com ferreiro — a noite (s3b) diz o resto');
    }
  }
  // ---------------- s6 the baths ----------------
  if (on('s6')) {
    if (S.time < 0.3 || S.time > 0.55) skipTo(0.42);
    const baths = [...S.buildings.values()].filter(b => b.type === 'banhos' && b.built && G.Termas.dia(b) && G.Termas.dia(b).st === 'on' && G.Termas.inHours(b));
    let hit = null;
    // (the bathers go by the door of the city's leisure, G.Termas.visit — their errand held above the day's calls, as
    // qa/termas.js holds it: given bare, the morning's work takes every bather on the way, T-281)
    for (const b of baths) {
      const went = []; stepIn(() => { for (const v of S.villagers.values()) { if (went.length >= 4) break; if (v.set !== b.set || !free(v)) continue; G.Vg.endTask(v); v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 90); const t = G.Termas.visit(v, b); if (t) { t.kind = 'work'; t.leisure = true; t.pri = 2.9; went.push(v); } } });
      if (!went.length) continue;
      const got = live(110, () => went.some(v => v.task && v.task.type === 'termas' && v.task.st === 2 && v.act === 'sit' && v.inside === b.id));
      if (got) { hit = { b, v: went.find(v => v.task && v.task.type === 'termas' && v.task.st === 2 && v.act === 'sit') }; break; }
    }
    if (!hit) ok('s6a as-termas', false, `ninguém no banho (${baths.length} termas abertas)`);
    else {
      const { b, v } = hit; const op = G.Termas.dia(b); const [bx, by] = mid(b);
      // (and in the whole town about, the water sounds of nobody who is not in a bath: who sits elsewhere sits in silence)
      const town = townOf(b); const wide = scene(earAt(town.cx, town.cy, { r: 45 }), 's6 cidade'); const dry = wide.fontes.filter(x => x.s === 'slosh' && (S.villagers.get(x.de.v).task || {}).type !== 'termas').length;
      const sitters = [...S.villagers.values()].filter(p => p.set === b.set && p.act === 'sit' && !p.sleeping && (p.task || {}).type !== 'termas' && A.gestoDe(p) === 'banhar').length;
      const c = scene(earAt(bx + 2, by + 0.5, { inside: b.id }), 's6'); const f = c.fontes.find(x => x.de.v === v.id); const fur = c.fontes.find(x => x.s === 'fornalha' && x.de.b === b.id);
      const empty = baths.filter(x => x !== b && !Object.keys(G.Termas.dia(x).data.banho).length).map(x => { const [x0, y0] = mid(x); const cc = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's6 vazia'); return { id: x.id, slosh: cc.fontes.filter(q => q.s === 'slosh' && q.de.b === x.id).length, fur: cc.fontes.filter(q => q.s === 'fornalha' && q.de.b === x.id).length, calor: G.Termas.dia(x).data.calor }; });
      ok('s6a as-termas', !!f && f.g === 'banhar' && f.s === 'slosh' && f.de.b === b.id && f.de.op === op.id && f.fam === 'banho' && f.muf === 0 && !!fur === (op.data.calor > 0) && (!fur || fur.de.op === op.id) && dry === 0 && sitters === 0,
        `${townOf(b).name}, termas #${b.id}, hora ${S.time.toFixed(2)}: ${v.name} #${v.id} no banho → «${f ? f.g : '?'}» som «${f ? f.s : '?'}», da operação #${f ? f.de.op : '?'}; a fornalha ${op.data.calor > 0 ? 'acesa' : 'apagada'} (calor ${r3(op.data.calor)}) ${fur ? 'ronca' : 'não ronca'}; na cidade em volta, ${dry} som(ns) de água de quem não está no banho, ${sitters} sentado(s) fora das termas tomado(s) por banhista`);
      ok('s6b as-termas-vazias', empty.every(x => x.slosh === 0 && (x.fur > 0) === (x.calor > 0)), empty.length ? empty.map(x => `termas #${x.id}: ${x.slosh} som de água, fornalha ${x.calor > 0 ? 'acesa' : 'apagada'} ${x.fur ? 'ronca' : 'calada'}`).join('; ') : 'não há outras termas abertas sem banhista — a noite (s3b) diz o resto');
    }
  }
  // ---------------- s5 the tavern ----------------
  if (on('s5')) {
    skipTo(0.625);
    const T = G.Taverna; const taverns = () => [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built && T.dia(b) && T.aberta(b));
    const guests = b => Object.keys(T.dia(b).data.mesa).length;
    // (the people of the town go for the evening, by the customer's own door: who would go, goes — the ones who would sing first)
    const sent = new Set();
    const send = () => stepIn(() => { for (const b of taverns()) { if (guests(b) >= 5) continue; let n = 0; const L = [...S.villagers.values()].filter(v => v.set === b.set && free(v) && !sent.has(v.id) && !(v.task && v.task.type === 'tavern')).sort((p, q) => (((q.traits || []).includes('Sociável') || q.id % 4 === 0) ? 1 : 0) - (((p.traits || []).includes('Sociável') || p.id % 4 === 0) ? 1 : 0) || p.id - q.id);
      for (const v of L) { if (n >= 6) break; G.Vg.endTask(v); v.hunger = Math.min(v.hunger, 30); v.energy = Math.max(v.energy, 80); // (the visit held above the day's calls, as the bathers' of s6 are — T-281: given bare at this hour, the plaza on the way
        // takes the walk, 0,45 over the tavern's 0,4, and no tavern had three at its tables — the case is the tavern's sound: T-855)
        if (T.pick(v) && T.visitTask(v, G.Vg.H)) { if (v.task && v.task.type === 'tavern') v.task.pri = 2.9; sent.add(v.id); n++; } } } });
    send();
    const full = () => taverns().find(b => guests(b) >= 3);
    live(70, k => { if (k % 15 === 14) send(); return !!full(); });
    const b = full();
    if (!b) ok('s5a a-taverna-cheia', false, `nenhuma taverna com três às mesas (abertas: ${taverns().map(x => '#' + x.id + ':' + guests(x)).join(', ') || 'nenhuma'})`);
    else {
      const op = T.dia(b); const [bx, by] = mid(b); const shutB = A.fechado(b.id) === b.id;
      const out = earAt(bx + 3, by + 0.5), inn = earAt(bx + 3, by + 0.5, { inside: b.id });
      const co = scene(out, 's5 rua'), ci = scene(inn, 's5 dentro'); const key = 'b' + b.id + ':taverna';
      const mo = co.fontes.find(f => f.k === key), mi = ci.fontes.find(f => f.k === key);
      const n = guests(b);
      // (the same room with fewer people: what the line would be — the rule alone, by the scene of another tavern)
      const others = taverns().filter(x => x !== b).map(x => { const [x0, y0] = mid(x); const c = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's5 outra'); const m = c.fontes.find(f => f.k === 'b' + x.id + ':taverna'); return { id: x.id, n: guests(x), murmur: m ? m.gain : 0 }; });
      const emptyOK = others.every(x => (x.n >= 2) === (x.murmur > 0));
      // (more people, more murmur: this room and the others, each heard from the same two tiles inside it)
      const here = scene(earAt(bx + 2, by + 0.5, { inside: b.id }), 's5 perto').fontes.find(f => f.k === key);
      const louder = !!here && others.filter(x => x.n >= 2 && x.n < n).every(x => x.murmur < here.gain) && others.filter(x => x.n > n).every(x => x.murmur > here.gain);
      kept.tavern = { out, b };
      ok('s5a a-taverna-cheia', !!mi && mi.tipo === 'predio' && mi.s === 'murmur' && mi.de.b === b.id && mi.de.op === op.id && mi.n === n && mi.muf === 0 && (!shutB || (!!mo && mo.muf === 1 && mo.gain < mi.gain)) && louder,
        `${townOf(b).name}, taverna #${b.id} (${shutB ? 'fechada' : 'aberta'}), hora ${S.time.toFixed(2)}, ${n} às mesas: o burburinho é do prédio e do dia #${op.id}; de dentro ganho ${mi ? mi.gain : '?'} limpo, da rua ${mo ? mo.gain : '?'} abafado`);
      ok('s5b a-taverna-vazia', emptyOK, others.length ? others.map(x => `taverna #${x.id}: ${x.n} às mesas → burburinho ${x.murmur || 'nenhum'}`).join('; ') : 'não há outra taverna aberta — a noite (s3b) diz o resto');
      // the song: only with someone playing
      const playing = () => { for (const x of taverns()) { const id = x._music; const v = id && S.villagers.get(id); if (v && v.act === 'play' && v.inside === x.id) return { b: x, v }; } return null; };
      const before = taverns().map(x => { const [x0, y0] = mid(x); const c = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's5 antes'); return { id: x.id, lute: c.fontes.filter(f => f.s === 'lute').length, music: !!(x._music && S.villagers.get(x._music) && S.villagers.get(x._music).act === 'play') }; });
      live(150, k => { if (k % 15 === 14) send(); return !!playing(); });
      const p = playing();
      if (!p) ok('s5c a-taverna-canta', false, `ninguém tocou em 150 s (às mesas: ${taverns().map(x => '#' + x.id + ':' + guests(x)).join(', ')})`);
      else {
        const [px, py] = mid(p.b); const c = scene(earAt(px + 2, py + 0.5, { inside: p.b.id }), 's5 canto'); const lu = c.fontes.find(f => f.s === 'lute');
        const fac = G.Fac.ofV(p.v); const want = A.musicOf(fac ? fac.civ : null, fac && fac.tech ? fac.tech.known : null);
        const silent = taverns().filter(x => x !== p.b && !(x._music && S.villagers.get(x._music) && S.villagers.get(x._music).act === 'play')).map(x => { const [x0, y0] = mid(x); const cc = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's5 calada'); return { id: x.id, lute: cc.fontes.filter(f => f.s === 'lute' && f.de.b === x.id).length }; });
        ok('s5c a-taverna-canta', !!lu && lu.de.v === p.v.id && lu.g === 'tocar' && lu.de.b === p.b.id && JSON.stringify(lu.notas) === JSON.stringify(want.notas) && before.every(x => x.music || x.lute === 0) && silent.every(x => x.lute === 0),
          `taverna #${p.b.id} de ${townOf(p.b).name}, hora ${S.time.toFixed(2)}: ${p.v.name} #${p.v.id} toca → fonte «${lu ? lu.g : '?'}» som «${lu ? lu.s : '?'}» de quem toca, na escala do povo dele (${want.civ}, ${want.epoca}: ${want.nome}); antes de alguém tocar: ${before.map(x => `#${x.id} ${x.music ? 'tocando' : x.lute + ' alaúde'}`).join(', ')}; as outras agora: ${silent.map(x => `#${x.id} ${x.lute} alaúde`).join(', ') || '(não há)'}`);
      }
    }
  }
  // ---------------- the night: the quay, the forge, the tavern at rest ----------------
  if (on('s3') || on('s4') || on('s5')) {
    skipTo(0.97); live(3);
    const out = [];
    let good = true;
    if (kept.quay) { const c = scene(kept.quay.ear, 'noite cais'); const n = c.fontes.filter(f => f.fam === 'cais').length; const w = c.fundo ? c.fundo.w.cais : 0, ag = c.fundo ? c.fundo.agora.cais : 0; good = good && n === 0 && w === 0 && ag === 0; out.push(`o cais #${kept.quay.dock.id}: ${n} fonte(s) do cais, mãos ${ag}, fundo ${w}`); }
    if (kept.forge) { const c = scene(kept.forge.out, 'noite forja'); const n = c.fontes.filter(f => f.s === 'anvil').length; good = good && n === 0; out.push(`a forja #${kept.forge.b.id}: ${n} martelo(s)`); }
    if (kept.tavern) { const c = scene(kept.tavern.out, 'noite taverna'); const n = c.fontes.filter(f => f.s === 'murmur' || f.s === 'lute').length; good = good && n === 0; out.push(`a taverna #${kept.tavern.b.id}: ${n} burburinho/alaúde`); }
    ok('s3b a-noite', good && out.length > 0, `hora ${S.time.toFixed(2)}, os mesmos ouvidos: ${out.join('; ') || 'nenhum caso do dia chegou aqui'}`);
  }
}

// =============================================================================================================
// s8 the music of a people and of its age
// =============================================================================================================
function s8() {
  const S = G.S; const civs = Object.keys(G.CIVS); const ages = [{}, { bronze: 1 }, { bronze: 1, ferro: 1 }];
  const sig = m => JSON.stringify([m.tonica, m.graus, m.timbre, m.tambor]);
  const tab = {}; for (const c of civs) tab[c] = ages.map(k => A.musicOf(c, k));
  const same = civs.every(c => ages.every((k, i) => JSON.stringify(A.musicOf(c, k)) === JSON.stringify(tab[c][i])));
  const byAge = civs.every(c => new Set(tab[c].map(sig)).size === 3);
  const byCiv = ages.every((k, i) => new Set(civs.map(c => sig(tab[c][i]))).size === civs.length);
  const scales = ages.every((k, i) => new Set(civs.map(c => JSON.stringify([tab[c][i].tonica, tab[c][i].graus]))).size === civs.length);
  const grow = civs.every(c => tab[c][0].graus.length === 3 && tab[c][1].graus.length === 5 && tab[c][2].graus.length >= 5 && tab[c].every(m => m.notas.length >= 10 && m.notas.every((f, k) => k === 0 || f > m.notas[k - 1])));
  ok('s8a povo-e-epoca', same && byAge && byCiv && scales && grow && A.musicOf('ninguém', null).civ === 'classico',
    `${civs.length} povos × 3 épocas: ${civs.map(c => `${c} [${tab[c].map(m => m.graus.join(' ')).join(' | ')}] ${tab[c][2].timbre.onda}`).join('; ')} — ${same ? 'sempre igual' : 'MUDA'} para o mesmo povo e época, ${byAge ? 'cada época a sua' : 'ÉPOCAS IGUAIS'}, ${byCiv ? 'cada povo o seu' : 'POVOS IGUAIS'}${scales ? ' (as escalas todas diferentes)' : ' (ESCALAS REPETIDAS)'}`);
  // on the ground of each people, its own; the same in every quarter of a town; in the wild, the plain one
  const rows = []; let good = true, towns = 0;
  for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    const f = G.Fac.get(G.Village.facOfSet(set.id)); if (!f || !U.wholeOf(set)) continue;
    const want = A.musicOf(f.civ, f.tech && f.tech.known); const qs = U.districtsOf(set); const pts = [[set.cx, set.cy]].concat(qs.map(d => [d.x, d.y])).filter(p => { const q = U.at(p[0], p[1]); return q && q.set === set.id; });
    if (!pts.length) continue; // (a town whose middle is another's ground: nothing of its own to stand on)
    const got = pts.map(p => JSON.stringify(A.scene(earAt(p[0], p[1])).musica));
    const one = got.every(g => g === JSON.stringify(want)); good = good && one; towns++;
    if (rows.length < 6 || !one) rows.push(`${set.name} (${f.civ}, ${want.epoca}): ${pts.length} lugar(es), ${one ? 'a mesma música' : 'MÚSICAS DIFERENTES'}`);
  }
  const civsHere = new Set([...S.factions.values()].map(f => f.civ)); let sea = null; for (let k = 0; k < G.N * G.N && !sea; k += 37) { const x = k % G.N, y = Math.floor(k / G.N); if (!U.at(x, y)) sea = [x, y]; }
  const wild = sea ? A.scene(earAt(sea[0], sea[1])).musica : null;
  // (the age follows the arts: the same people before bronze, with it, with iron)
  const f0 = [...S.factions.values()].find(f => f.tech && f.tech.known);
  const eras = f0 ? [A.musicOf(f0.civ, {}).era, A.musicOf(f0.civ, { bronze: 1 }).era, A.musicOf(f0.civ, { ferro: 1 }).era, A.musicOf(f0.civ, f0.tech.known).era] : [];
  ok('s8b no-chao-de-cada-povo', good && rows.length > 0 && wild && wild.civ === 'classico' && eras[0] === 0 && eras[1] === 1 && eras[2] === 2 && eras[3] === A.eraDe(f0.tech.known),
    `${towns} cidades: ${rows.join('; ')}; ${civsHere.size} povos no mundo; no ermo (${sea ? sea.join(', ') : '?'}): ${wild ? wild.civ + ' — ' + wild.nome : '?'}; a época pelas artes: ${eras.join(', ')}`);
}

// =============================================================================================================
// s11 the same world, the same ear: the same scene
// =============================================================================================================
function s11() {
  const S = G.S; const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  const ears = [earAt(set.cx, set.cy, { r: 30 }), A.earOf({ x: set.cx + 4, y: set.cy - 3, rx: 1, ry: -1, r: 40, k: 0.7, modo: 'deus' })];
  const a = ears.map(e => JSON.stringify(scene(e, 's11'))), b = ears.map(e => JSON.stringify(scene(e, 's11')));
  const n = JSON.parse(a[0]).fontes.length + JSON.parse(a[1]).fontes.length;
  ok('s11 a-mesma-cena', a[0] === b[0] && a[1] === b[1] && n > 0, `${set.name}, hora ${S.time.toFixed(2)}: ${n} fontes nos dois ouvidos (o do corpo e o do deus), ${a[0] === b[0] && a[1] === b[1] ? 'iguais nas duas vezes' : 'DIFERENTES'}`);
}

// =============================================================================================================
// the second world: s7 the quarter's bed, s9 the sound changes nothing
// =============================================================================================================
// (an audio context that plays nothing: every node accepts everything; it counts the sources made)
function FakeAC() {
  const node = () => new Proxy(function () { }, { get(t, k) { if (k === 'value') return 0; if (k === Symbol.toPrimitive) return () => 0; return node(); }, set() { return true; }, apply() { return node(); } });
  const self = this; this.currentTime = 0; this.state = 'running'; this.sampleRate = 2000; this.destination = node(); this.made = 0;
  for (const m of ['createGain', 'createDynamicsCompressor', 'createConvolver', 'createBiquadFilter', 'createStereoPanner', 'createWaveShaper']) this[m] = () => node();
  this.createOscillator = () => { self.made++; return node(); }; this.createBufferSource = () => { self.made++; return node(); };
  this.createBuffer = (ch, len) => ({ getChannelData: () => new Float32Array(Math.ceil(len)) });
  this.resume = () => { }; FakeAC.last = this;
}
function s9() {
  const SMALL = 'cidade'; const STEPS = 420;
  // one life: the world to a morning hour by the game's skip, then STEPS steps with a save in the middle. With sound: the
  // scene for three ears at every step, the player on (the world's own blows ring through it too), a beat of the music
  let worldDraws = 0, lookDraws = 0, inSound = 0;
  const life = sound => {
    // (two days first, by the game's skip: the quarters have the life the town really lived — a ready world of before has none —,
    // and the bed has what to say)
    M.pronto(SMALL); M.saltar(2); const S = G.S; skipTo(0.3);
    const out = { plays: 0, scenes: 0, srcs: 0, lost: [], afterLoad: null };
    if (sound) { A.mute = false; A.sfxOn = true; A.ambOn = true; A.musicOn = true; A.gravar = true; A.tocou.length = 0; out.made0 = FakeAC.last.made; }
    const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    for (let k = 0; k < STEPS; k++) {
      if (k === STEPS / 2) { M.salvarCarregar(); if (sound) { out.afterLoad = A.cena; A.mute = false; A.sfxOn = true; A.musicOn = true; } }
      M.viver(0.1);
      if (!sound) continue;
      inSound++;
      try {
        const S2 = G.S; const people = [...S2.villagers.values()]; const p = people[k % people.length]; const set2 = S2.settlements.get(set.id) || [...S2.settlements.values()][0];
        const ears = [A.earOf({ x: p.x, y: p.y, yaw: k * 0.3, inside: p.inside }), earAt(set2.cx, set2.cy, { r: 25 }), A.earOf({ x: set2.cx, y: set2.cy, rx: 1, ry: -1, r: 45, k: 0.8, modo: 'deus' })];
        for (const e of ears) { const c = scene(e, 's9'); out.scenes++; out.srcs += c.fontes.length; }
        // (the ear stays where it is through the next step: the world's own blows — G.Audio.at — are heard by it)
        A.ouvido = ears[k % 3]; FakeAC.last.currentTime += 0.1; out.plays += FakeAC.last.made - (out.m0 || FakeAC.last.made);
        // (the world of the proof stands at speed 0 and is stepped by hand: for the player it moves — a paused world's gestures do not ring)
        const sp0 = G.speed; G.speed = 1; A.update(0.1); G.speed = sp0; if (k % 8 === 0) A.batida();
        out.m0 = FakeAC.last.made;
        // (a world standing still makes no gesture: ten seconds of the player with the world paused ring nothing of the place)
        if (k === 150) { const n0 = A.tocou.length; for (let j = 0; j < 40; j++) { FakeAC.last.currentTime += 0.3; A.update(0.3); } out.paused = A.tocou.length - n0; }
        // (what the place rang just now is of something alive)
        for (const e of A.tocou.splice(0)) { const de = e.de || {}; const live2 = (de.v !== undefined && S2.villagers.has(de.v)) || (de.b && S2.buildings.has(de.b)) || (de.navio !== undefined && S2.ships.some(s => s.id === de.navio)) || (de.bicho !== undefined && S2.animals.has(de.bicho)); out.rung = (out.rung || 0) + 1; if (!live2 && out.lost.length < 5) out.lost.push(`${e.s} de ${JSON.stringify(de)}`);
          if (e.longe) { out.far = (out.far || 0) + 1; if (!(e.peso > 0.03)) out.farBad = (out.farBad || 0) + 1; } }
      } finally { inSound--; }
    }
    A.ouvido = null; out.plays = FakeAC.last && sound ? FakeAC.last.made - (out.made0 || 0) : 0;
    out.canon = QA.canon(); out.rng = G.S.rng; out.day = G.S.day; out.time = G.S.time; out.pop = G.S.villagers.size;
    out.bad = QA.check().filter(q => q.sev <= 2 || q.sys === 'som').map(q => `S${q.sev} ${q.sys}: ${q.msg}`);
    return out;
  };
  global.AudioContext = FakeAC; G.Audio.init();
  G.rngWatch = k => { if (!inSound) return; if (k === 0) worldDraws++; else lookDraws++; };
  const a = life(true);
  G.rngWatch = null; A.gravar = false; A.mute = true; A.sfxOn = false; A.musicOn = false;
  const b = life(false);
  const d = QA.diff(a.canon, b.canon);
  ok('s9a a-mesma-vida', !d.length && a.rng === b.rng && a.day === b.day && a.time === b.time && a.scenes > 1000 && a.plays > 50 && !a.bad.length && !b.bad.length,
    `«${SMALL}», ${STEPS} passos com um save no meio (${a.pop} pessoas, hora ${a.time.toFixed(3)}): com o som — ${a.scenes} cenas, ${a.srcs} fontes, ${a.plays} nós de som feitos pelo tocador — e sem ele: ${d.length ? 'DIFERENTE: ' + d.slice(0, 4).join(' · ') : 'a mesma impressão do mundo'}, o acaso ${a.rng === b.rng ? 'igual' : 'DIFERENTE'}; verificador ${a.bad.length || b.bad.length ? a.bad.concat(b.bad).slice(0, 3).join(' · ') : 'limpo'}`);
  ok('s9b nenhum-sorteio-do-mundo', worldDraws === 0 && lookDraws > 0, `durante a cena e o tocador: ${worldDraws} sorteio(s) do acaso do mundo, ${lookDraws} do acaso do que só se vê ou se ouve`);
  ok('s9d o-tocador-toca-o-que-existe', (a.rung || 0) > 20 && !a.lost.length && a.afterLoad === null && a.paused === 0 && (a.far || 0) > 0 && !a.farBad,
    `${a.rung || 0} sons de lugar tocados, cada um com a sua fonte viva${a.lost.length ? ' — SEM DONO: ' + a.lost.join('; ') : ''}; ${a.far || 0} deles do fundo do bairro (a voz longe de um trabalhador de verdade, onde o bairro tem hábito e mãos${a.farBad ? ' — ' + a.farBad + ' SEM PESO' : ''}); com o mundo parado, em 12 s do tocador: ${a.paused} som(ns) de lugar; depois do load a cena guardada ${a.afterLoad === null ? 'foi largada (o mundo é outro)' : 'FICOU'}`);
  // the code of the scene: it writes nothing, draws nothing, opens no door of the world (the rule the guard should hold)
  const src = fs.readFileSync(path.join(M.root, 'js/audio-src.js'), 'utf8').split('\n'); const hits = [];
  const code = l => l.replace(/(^|\s)\/\/\s.*$/, '');
  src.forEach((l, k) => { const c = code(l);
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()/.test(c) || /Math\.random/.test(c)) hits.push(`${k + 1} sorteia: ${c.trim().slice(0, 70)}`);
    if (/Urban\.(note|noteB|mourn|remember)\s*\(/.test(c) || /\b(Depot|D)\.(move|make|use|swap|store)\s*\(/.test(c) || /\bAct\.(start|end|join|leave|begin|commit|abort|pause|resume)\s*\(/.test(c) || /\b(setTask|endTask|Vg\.give)\s*\(/.test(c)) hits.push(`${k + 1} abre uma porta do mundo: ${c.trim().slice(0, 70)}`);
    if (/\b(v|b|op|q|s|a|set|f|S|G\.S|t)\.[A-Za-z_$][\w$]*(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\*=|\+\+|--)/.test(c)) hits.push(`${k + 1} escreve no mundo: ${c.trim().slice(0, 70)}`);
  });
  ok('s9c a-cena-so-le', !hits.length, hits.length ? hits.slice(0, 5).join(' · ') : `js/audio-src.js (${src.length} linhas): nenhum sorteio, nenhuma porta do mundo, nenhuma escrita em pessoa, prédio, operação, bairro, navio ou bicho`);
}
function s7() {
  // ---------------- s7c the mix of the one who listens moves slowly, and gets there (pure) ----------------
  if (sub('s7c')) {
    const alvo = {}; for (const x of A.FAMS) alvo[x] = 0; alvo.cais = 1; alvo.noite = 0.5;
    let m = null; const path2 = []; for (let k = 0; k < 120; k++) { m = A.blend(m, alvo, 0.25); if (k === 3 || k === 15 || k === 119) path2.push(r3(m.cais)); }
    let back = m; for (let k = 0; k < 16; k++) back = A.blend(back, null, 0.25);
    const mono = (() => { let x = null, p = -1; for (let k = 0; k < 60; k++) { x = A.blend(x, alvo, 0.25); if (x.cais < p || x.cais > 1) return false; p = x.cais; } return true; })();
    ok('s7c a-mistura-anda-devagar', path2[0] > 0.15 && path2[0] < 0.25 && path2[1] > 0.6 && path2[1] < 0.66 && path2[2] > 0.99 && mono && back.cais < 0.4 && back.cais > 0.3 && Math.abs(m.noite - 0.5) < 0.01 && m.campo === 0,
      `de nada para um cais inteiro: em 1 s ${path2[0]}, em 4 s ${path2[1]}, em 30 s ${path2[2]} (a constante: ${A.TAU} s), sem passar do alvo; saindo do bairro, em 4 s cai para ${r3(back.cais)}`);
  }
  if (!sub('s7a') && !sub('s7b')) return;
  M.pronto('cidade'); const S = G.S; M.viver(1);
  const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  // a day of the town's quarters: what the proof's hand counts (fn), then the world lives, by the game's skip, until the
  // quarter under the ear has closed one day more — exactly one (the day of the world and the day of a town's quarters do not
  // turn at the same step: a count of whole days of the world gave days with no close and days with two)
  const diasOf = () => { const qq = U.at(set.cx, set.cy); return qq ? qq.dias || 0 : -1; };
  const day = fn => { if (fn) stepIn(fn); const d0 = diasOf(); G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3; try { let n = 0; while (diasOf() === d0 && n++ < 600) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; } };
  // (two days first: the life of the quarter has what the town really did — a ready world of before the life has none)
  for (let k = 0; k < 2; k++) day();
  // ---------------- s7b the weight is the habit times the hands of now: a day's hour with hands at a work, and the night ----------------
  if (sub('s7b')) {
    let best = null;
    skipTo(0.3); M.viver(2);
    for (let k = 0; k < 60 && !best; k++) { M.viver(1); const c = scene(earAt(set.cx, set.cy), 's7'); for (const f of A.FAMS) if (c.fundo && c.fundo.maos[f] > 0 && c.fundo.h[f] > 0) { best = { f, c }; break; } }
    if (!best) ok('s7b habito-vezes-maos', false, 'em 60 s do dia, nenhuma vida do bairro com hábito e mãos ao mesmo tempo');
    else {
      const { f, c } = best; const wantW = r3(c.fundo.h[f] * Math.min(1, c.fundo.maos[f] / A.HANDS) * (1 - 0.5 * c.chuva));
      // (the same instant in the rain: the far work is covered — the proof's hand on the weather, put back at once)
      const w0 = S.weather.rain; S.weather.rain = 1; const wet = A.scene(earAt(set.cx, set.cy)).fundo.w[f]; S.weather.rain = w0;
      const dayH = Object.assign({}, c.fundo.h);
      skipTo(0.97); M.viver(2); const n = scene(earAt(set.cx, set.cy), 's7 noite');
      const silent = A.FAMS.filter(x => !(n.fundo.maos[x] > 0)).every(x => n.fundo.w[x] === 0);
      // (the night has its own hands — the priests are up before the light, the watch walks —: the family of the day may have
      // some at this hour («fe», 2 at 0,97), and then its weight is the same count, the habit times them; what the night
      // shows is a life with its habit and no hands, silent: T-855)
      const nightW = r3(n.fundo.h[f] * Math.min(1, (n.fundo.maos[f] || 0) / A.HANDS) * (1 - 0.5 * n.chuva));
      const mute = A.FAMS.filter(x => n.fundo.h[x] > 0 && !(n.fundo.maos[x] > 0));
      ok('s7b habito-vezes-maos', c.fundo.w[f] === wantW && wantW > 0 && Math.abs(wet - r3(wantW * 0.5 / (1 - 0.5 * c.chuva))) < 0.002 && silent && n.fundo.h[f] === dayH[f] && n.fundo.w[f] === nightW && mute.length > 0,
        `${set.name}, «${f}»: de dia, hábito ${c.fundo.h[f]} × ${c.fundo.maos[f]} par(es) de mãos → peso ${c.fundo.w[f]} (a conta: ${wantW}); com chuva forte ${wet}; de noite (hora ${S.time.toFixed(2)}), o mesmo hábito ${n.fundo.h[f]}, ${n.fundo.maos[f] || 0} mãos → peso ${n.fundo.w[f]} (a conta: ${nightW}); ${mute.length} vida(s) com hábito e sem mãos (${mute.join(', ') || 'NENHUMA'}) — ${silent ? 'sem mãos, nenhuma vida soa' : 'SOA SEM MÃOS'}`);
    }
  }
  // ---------------- s7a the habit follows the life counted, slowly ----------------
  if (sub('s7a')) {
    // (four days more: the quarter's life is past its first days, when one day is the whole mean)
    for (let k = 0; k < 4; k++) day();
    const q = U.at(set.cx, set.cy); if (!q) return ok('s7a o-habito-segue-a-vida', false, 'o centro da cidade não é chão de bairro nenhum');
    // (a day and a half of a lettered quarter's reading, every day, on the quarter's own ground — whatever its patches are that day)
    const read = () => { const qq = U.at(set.cx, set.cy); const [x, y] = U.cellXY(qq.cells[0]); U.note(x + 1, y + 1, 'saber', U.mark(qq, 'letrado', false) * qq.cells.length * 1.5); };
    // (the town grows while the days pass, and its quarters are drawn again: the one under the ear lost a patch of ground to a
    // new one on the third day — 7 to 6, the Cidade do Templo born —, the mean of its life was another, and the habit went
    // 0,54 → 0,433 with the reading counted every day. The slow rise is judged between two days the quarter kept its ground —
    // most of them, or the case says nothing: T-855)
    const sigOf = () => { const qq = U.at(set.cx, set.cy); return qq ? (qq.whole ? 'w' : 'd' + qq.id) + ':' + qq.cells.slice().sort((x, y) => x - y).join('.') : '-'; };
    const h0 = A.habito(q).saber; const up = [h0]; const sg = [sigOf()];
    for (let k = 0; k < 9; k++) { day(read); up.push(A.habito(U.at(set.cx, set.cy)).saber); sg.push(sigOf()); }
    const q2 = U.at(set.cx, set.cy); const peak = up[up.length - 1]; const down = [peak]; const sd = [sigOf()];
    for (let k = 0; k < 12; k++) { day(); down.push(A.habito(U.at(set.cx, set.cy)).saber); sd.push(sigOf()); }
    const same = (g, k) => g[k] === g[k - 1]; const kept = sg.filter((x, k) => k > 0 && same(sg, k)).length, keptD = sd.filter((x, k) => k > 0 && same(sd, k)).length;
    const rise = kept >= 6 && up.every((x, k) => k === 0 || !same(sg, k) || x >= up[k - 1]) && up.slice(1).every((x, k) => x - up[k] <= 0.36), fall = keptD >= 8 && down.every((x, k) => k === 0 || !same(sd, k) || x <= down[k - 1]) && down.slice(1).every((x, k) => down[k] - x <= 0.21);
    ok('s7a o-habito-segue-a-vida', h0 === 0 && rise && fall && peak >= 0.99 && up[1] > 0.2 && up[1] < 0.4 && down[2] >= 0.6 * peak && down[down.length - 1] < 0.15,
      `${set.name} (${q2.whole ? 'o todo' : q2.name}, ${q2.cells.length} chãos, ${q2.dias} dias de vida): uma vez e meia a leitura que faz um bairro letrado, contada todo dia → o hábito ${up.join(' → ')}; sem leitura → ${down.join(' → ')} — ${rise ? 'sobe devagar' : 'SOBE AOS SALTOS'}, ${fall ? 'desce devagar' : 'DESCE AOS SALTOS'} (o bairro guardou os chãos em ${kept} de 9 dias da subida e ${keptD} de 12 da descida)`);
  }
}

// =============================================================================================================
// s12 a fire crackles where it burns near the ear (L-740); s13 the ear is the body's
// =============================================================================================================
function s12() {
  if (!FakeAC.last) { global.AudioContext = FakeAC; G.Audio.init(); }
  M.pronto('cidade'); const S = G.S; M.viver(1); A.mute = false; A.ambOn = true;
  const xy = i => [i % G.N + 0.5, Math.floor(i / G.N) + 0.5];
  const trees = []; for (let i = 0; i < G.N * G.N; i++) if (S.treeAt[i] && !G.Nature.fireSet.has(i)) trees.push(i);
  const near = trees[0]; const [x1, y1] = xy(near); const far = trees.find(i => { const [x, y] = xy(i); return Math.hypot(x - x1, y - y1) > 60; });
  if (near === undefined || far === undefined) return ok('s12 o-fogo-so-estala-perto', false, 'o mundo não tem duas árvores a 60 casas uma da outra');
  // (the ear stands two tiles from the first tree; the player looks: what burns within its reach)
  const look = () => { FakeAC.last.currentTime += 0.5; A.update(0.5); return A.scape.fires; };
  A.ouvido = earAt(x1 + 2, y1);
  const f0 = look();
  stepIn(() => G.Nature.ignite(far, 0.9)); const farOn = G.Nature.fireSet.has(far); const f1 = look();
  stepIn(() => G.Nature.ignite(near, 0.9)); const nearOn = G.Nature.fireSet.has(near); const f2 = look();
  // ---- the world's own blows (G.Audio.at, rung in its step) are heard by the same ear: the side, the distance, the walls
  const played = []; const play0 = A.play; A.play = (name, vol, sp) => { played.push({ name, vol, sp: sp || {} }); };
  let blows = null;
  try {
    const house = [...S.buildings.values()].find(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && A.fechado(b.id) === b.id);
    const [hx, hy] = house ? mid(house) : [x1, y1]; const ex = x1 + 2, ey = y1; // (the ear by the first tree, out in the woods: no roof about)
    const free = (x, y) => G.W.inb(Math.floor(x), Math.floor(y)) && !S.occ[G.W.idx(Math.floor(x), Math.floor(y))];
    const at = (ear, x, y, imp) => { played.length = 0; A.ouvido = ear; A.at(x, y, 'thud', imp); return played[0] || null; };
    const north = A.earOf({ x: ex, y: ey, yaw: -Math.PI / 2 });
    blows = { east: at(north, ex + 5, ey), west: at(north, ex - 5, ey), far: at(north, ex + 40, ey), farBig: at(north, ex + 40, ey, true), near: at(north, ex + 1, ey), mid: at(north, ex + 6, ey),
      open: [[ex + 5, ey], [ex - 5, ey], [ex + 1, ey], [ex + 6, ey]].every(p => free(p[0], p[1])),
      inHouse: house ? at(A.earOf({ x: hx + 4, y: hy, yaw: 0 }), hx, hy) : null, sameHouse: house ? at(A.earOf({ x: hx + 0.2, y: hy, yaw: 0, inside: house.id }), hx, hy) : null, house: !!house };
  } finally { A.play = play0; A.ouvido = null; A.mute = true; }
  const B = blows;
  ok('s12b o-golpe-do-mundo-pelo-ouvido', B.open && !!B.east && B.east.sp.pan > 0.5 && !!B.west && B.west.sp.pan < -0.5 && B.far === null && !!B.farBig && B.farBig.vol >= 0.35 && !!B.near && !!B.mid && B.near.vol > B.mid.vol && B.house && !!B.inHouse && B.inHouse.sp.muf === 1 && !!B.sameHouse && B.sameHouse.sp.muf === 0,
    `um golpe a 5 casas a leste: volume ${B.east ? r3(B.east.vol) : 'nenhum'}, pan ${B.east ? B.east.sp.pan : '?'}; a oeste: pan ${B.west ? B.west.sp.pan : '?'}; a 1 casa ${B.near ? r3(B.near.vol) : '?'}, a 6 casas ${B.mid ? r3(B.mid.vol) : '?'}; a 40 casas ${B.far ? 'TOCA' : 'não toca'}, e o importante (um raio, uma trompa) toca a ${B.farBig ? r3(B.farBig.vol) : '?'}; dentro de uma casa fechada, ouvido da rua: abafado ${B.inHouse ? B.inHouse.sp.muf : '?'}; ouvido da mesma casa: abafado ${B.sameHouse ? B.sameHouse.sp.muf : '?'}`);
  const [fx, fy] = xy(far);
  ok('s12 o-fogo-so-estala-perto', f0 === 0 && farOn && f1 === 0 && nearOn && f2 >= 1,
    `o ouvido em (${x1 + 2}, ${y1}), alcance ${A.EAR}: sem fogo ${f0} estalo(s); uma árvore em chamas a ${Math.round(Math.hypot(fx - x1, fy - y1))} casas ${farOn ? '' : '(NÃO PEGOU) '}→ ${f1}; a árvore ao lado em chamas ${nearOn ? '' : '(NÃO PEGOU) '}→ ${f2}`);
}
function s13() {
  M.pronto('cidade'); const S = G.S; skipTo(0.32); M.viver(2);
  // (the 3D's own parts are not in Node: the mode and the eye's heading stand in for them, as the page has them)
  let yaw = -Math.PI / 2; G.Modes = { god: () => !G.S.avatar }; G.Cam3D = { get yaw() { return yaw; } };
  try {
    const none = A.ear();
    const v = [...S.villagers.values()].sort((a, b) => a.id - b.id).find(p => free(p) && !p.inside && G.Possess.can(p).ok);
    if (!v) return ok('s13 o-ouvido-e-o-corpo', false, 'ninguém livre na rua na hora da prova');
    const took = G.Possess.take(v); const ear = A.ear();
    if (!took.ok || !ear) return ok('s13 o-ouvido-e-o-corpo', false, `não deu para tomar o corpo: ${took.why || 'sem ouvido'}`);
    const east = A.hear(ear, v.x + 5, v.y, 0, 1); yaw = Math.PI / 2; const west = A.hear(A.ear(), v.x + 5, v.y, 0, 1); yaw = 0; const ahead = A.hear(A.ear(), v.x + 5, v.y, 0, 1);
    const c = scene(A.ear(), 's13'); const own = c.fontes.find(f => f.de.v === v.id);
    // (the body walks on — by the world's own hand on its place, as the player's feet would —: the ear goes with it)
    const x0 = v.x; M.viver(1); const moved = A.ear();
    G.Possess.release('deus'); const after = A.ear();
    ok('s13 o-ouvido-e-o-corpo', none === null && ear.modo === 'corpo' && ear.x === x0 && ear.dentro === A.fechado(v.inside) && ear.r === A.EAR && ear.k === 1 && east.pan > 0.9 && west.pan < -0.9 && Math.abs(ahead.pan) < 0.001 && moved.x === v.x && moved.y === v.y && after === null && (!own || own.d === 0),
      `${v.name} #${v.id}, hora ${S.time.toFixed(2)}: sem corpo e sem tela, nenhum ouvido; com o corpo, o ouvido está onde ele está (${r3(ear.x)}, ${r3(ear.y)}), ouve a ${ear.r} casas, sob ${ear.dentro ? 'o teto #' + ear.dentro : 'o céu'}; um som a leste: com o olho virado ao norte pan ${east.pan}, ao sul ${west.pan}, a leste ${ahead.pan}; ${c.fontes.length} fonte(s) na cena dele; devolvido o corpo, ${after === null ? 'o ouvido volta a ser o do deus' : 'O OUVIDO FICOU'}`);
  } finally { delete G.Modes; delete G.Cam3D; }
}

// =============================================================================================================
// s14 the checker's own rules for the sound (qa/som-inv.js): clean on the world, and each one says what it sees
// =============================================================================================================
function s14() {
  const som = () => QA.check().filter(x => x.sys === 'som').map(x => x.msg);
  const clean = som();
  // (a gesture with no line: the table, without one of its lines for a moment)
  const keep = A.GESTO.forjar; delete A.GESTO.forjar; const noLine = som(); A.GESTO.forjar = keep;
  // (a source of nobody, a number that is no number, a bed that sounds with no hands: the scene, wrapped for a moment)
  const scene0 = A.scene; const twist = fn => { A.scene = function (ear) { const c = scene0.call(A, ear); if (c) fn(c); return c; }; const r = som(); A.scene = scene0; return r; };
  const nobody = twist(c => c.fontes.push({ k: 'x', tipo: 'gesto', s: 'anvil', de: { v: -5 }, x: 1, y: 1, gain: 0.5, pan: 0, muf: 0 }));
  const nan = twist(c => c.fontes.push({ k: 'y', tipo: 'bicho', s: 'bark', de: { bicho: [...G.S.animals.keys()][0] }, x: 1, y: 1, gain: NaN, pan: 0, muf: 0 }));
  const handless = twist(c => { if (c.fundo) { c.fundo.w.saber = 0.5; c.fundo.maos.saber = 0; } });
  const after = som();
  ok('s14 o-verificador-ve', !clean.length && noLine.some(m => /gesto sem linha.*forjar/.test(m)) && nobody.some(m => /de ninguém/.test(m)) && nan.some(m => /número ou som inválido/.test(m)) && handless.some(m => /sem mãos/.test(m)) && !after.length,
    `as regras do som no verificador (qa/som-inv.js): no mundo como está ${clean.length ? 'ACUSAM: ' + clean.slice(0, 2).join(' · ') : 'nada'}; a tabela sem a linha do «forjar» → «${(noLine[0] || 'NADA').slice(0, 70)}»; uma fonte de ninguém → «${(nobody[0] || 'NADA').slice(0, 70)}»; um ganho que não é número → ${nan.length ? 'acusado' : 'NADA'}; o fundo com peso e sem mãos → «${(handless[0] || 'NADA').slice(0, 80)}»; desfeito tudo, ${after.length ? 'AINDA ACUSA' : 'nada'}`);
}

// =============================================================================================================
// s1 the table
// =============================================================================================================
function s1() {
  const AN = G.Act.ANIM; const lib = new Set(A.sons());
  const none = A.semLinha(), extra = A.linhaSemGesto();
  const badLine = [], noLib = new Set(); const lineOK = (k, L) => { if (!L) return badLine.push(k + ' (sem linha)'); if (L.s) { if (!lib.has(L.s)) noLib.add(L.s); if (!(L.v > 0) || !(L.alc > 0) || !['contato', 'curso'].includes(L.q) || (L.q === 'curso' && !(L.cada > 0))) badLine.push(k + ' (linha incompleta)'); } else if (!L.por || L.por.length < 8) badLine.push(k + ' (silêncio sem motivo)'); };
  for (const k in A.GESTO) { lineOK(k, A.GESTO[k]); const g = AN[k]; if (g && A.GESTO[k].s && A.GESTO[k].q === 'contato' && !(g.contact > 0)) badLine.push(k + ' (som no contato de um gesto sem contato)'); }
  for (const k in A.ATO) { const L = A.ATO[k]; if (typeof L === 'function') for (const t of ['drill', 'fire', 'fest', 'water', 'x']) lineOK(k + '/' + t, L({}, { type: t })); else lineOK(k, L); }
  for (const k in A.BICHO) { const L = A.BICHO[k]; if (!lib.has(L.s)) noLib.add(L.s); if (!(L.cada > 0) || !(L.v > 0)) badLine.push('bicho ' + k); if (!G.Animals.DEF[k]) badLine.push('bicho que não existe: ' + k); }
  for (const s of ['murmur', 'fornalha', 'sail', 'clang']) if (!lib.has(s)) noLib.add(s);
  const sounding = Object.keys(A.GESTO).filter(k => A.GESTO[k].s).length;
  ok('s1a todo-gesto-tem-linha', !none.length && !extra.length && !badLine.length && !noLib.size && Object.keys(AN).length >= 50,
    `${Object.keys(AN).length} gestos em G.Act.ANIM: ${none.length ? 'SEM LINHA: ' + none.join(', ') : 'todos com linha'} (${sounding} com som, ${Object.keys(A.GESTO).length - sounding} com silêncio dito)${extra.length ? '; LINHA DE GESTO QUE NÃO EXISTE: ' + extra.join(', ') : ''}${badLine.length ? '; ' + badLine.slice(0, 5).join(', ') : ''}${noLib.size ? '; SOM FORA DA BIBLIOTECA: ' + [...noLib].join(', ') : ''}; ${Object.keys(A.ATO).length} atos fora dos gestos, ${Object.keys(A.BICHO).length} bichos com voz, ${lib.size} sons na biblioteca`);
  // a gesture registered now has no line until one is written: the list says so (and a line of the table resolves back)
  const g0 = G.Act.addAnim('gestoDaProva', { act: 'provaAto', dur: 1, contact: 0.5, hands: 1 }); const caught = A.semLinha().includes('gestoDaProva'); delete AN.gestoDaProva;
  const round = Object.keys(AN).filter(k => AN[k].act).every(k => { const v = { act: AN[k].act, task: null, carry: null }; const g = A.gestoDe(v); return g === null || (AN[g] && AN[g].act === AN[k].act); });
  ok('s1b gesto-novo-sem-linha', !!g0 && caught && !A.semLinha().length && round, `um gesto registrado agora (addAnim) ${caught ? 'aparece como sem linha' : 'PASSA SEM LINHA'}; o gesto de cada ato é sempre um gesto desse ato: ${round ? 'sim' : 'NÃO'}`);
}
// (which gesture an act is, where several gestures share it — or none: by the errand, the load, the gear. The rule alone,
// asked for a person as the world would have them: nobody need be sitting in the town for the proof to know who bathes)
function s1d() {
  const C = { k: 'food', n: 2 };
  const want = [['sit', { type: 'lar' }, null, 'sentar'], ['sit', { type: 'tavern' }, null, 'sentar'], ['sit', { type: 'termas' }, null, 'banhar'], ['sit', { type: 'teatro' }, null, 'assistir'],
    ['talk', { type: 'atuar' }, null, 'atuar'], ['talk', { type: 'social' }, null, 'falar'], ['write', { type: 'copiar' }, null, 'copiar'], ['write', { type: 'desk' }, null, 'escrever'],
    ['lift', { type: 'descarga' }, null, 'levantar'], ['lift', { type: 'carga' }, C, 'pousar'], ['arrange', { type: 'banca' }, C, 'porNaBanca'], ['arrange', { type: 'banca' }, null, 'tirarDaBanca'],
    ['fight', { type: 'combat' }, null, null], ['fight', { type: 'drill' }, null, null], ['fight', { type: 'atuar' }, null, 'lutarJogo'], ['feed', { type: 'fodder' }, null, null], ['feed', { type: 'fornalha' }, null, 'alimentarFogo'],
    ['craft', { type: 'mint' }, null, 'cunhar'], ['craft', { type: 'caverna' }, null, null], ['fill', { type: 'water' }, null, null], ['fish', { type: 'fish', how: 'rede' }, null, 'pescarRede'], ['fish', { type: 'fish' }, null, 'pescarMaos'],
    ['pay', { type: 'banca' }, null, 'receberMoedas'], ['pay', { type: 'compra' }, null, 'pagar'], ['play', { type: 'tavern' }, null, 'tocar'], ['forge', { type: 'oficio' }, null, 'forjar'], ['drink', { type: 'fest' }, null, 'beber'],
    ['chop', { type: 'chop' }, null, null], ['dance', { type: 'fest' }, null, null], ['harvest', { type: 'farm' }, null, null], ['', { type: 'idle' }, null, null]];
  const wrong = want.filter(([act, task, carry, g]) => A.gestoDe({ act, task, carry }) !== g).map(([act, task, carry, g]) => `«${act}» na tarefa ${task.type}${carry ? ' com carga' : ''}: ${A.gestoDe({ act, task, carry })} (devia ser ${g})`);
  // (and what the acts of no gesture sound like: the sparring of a drill is wood on wood, the blow of a war is the world's to ring)
  const spar = A.linhaDe({ act: 'fight', task: { type: 'drill' } }), war = A.linhaDe({ act: 'fight', task: { type: 'combat' } }), fire = A.linhaDe({ act: 'beat', task: { type: 'fire' } });
  ok('s1d o-gesto-pelo-ato-e-pela-tarefa', !wrong.length && spar.linha.s === 'clack' && war.linha.s === null && war.linha.mundo === 1 && fire.linha.s === 'thud',
    `${want.length} perguntas à regra (A.gestoDe): ${wrong.length ? 'ERRADAS: ' + wrong.slice(0, 5).join('; ') : 'todas certas — sentado em casa «sentar», nas termas «banhar», no teatro «assistir»; a luta do treino soa a madeira, a da guerra é o mundo que toca'}`);
}
function s1c() {
  const list = Object.keys(unlined);
  ok('s1c todo-ato-visto-tem-linha', !list.length && (!!ONLY || actsSeen > 5000), `${actsSeen} atos olhados em pessoas ao longo da prova: ${list.length ? 'SEM LINHA: ' + list.slice(0, 8).join(', ') : 'todos com linha (um som, ou um silêncio dito)'}`);
}

// =============================================================================================================
const hr = () => Number(process.hrtime.bigint() / 1000000n); const t0 = hr();
M.pronto(WORLD); M.viver(1); cover();
if (on('s1')) { s1(); s1d(); }
if (on('s2')) s2();
if (on('s8')) s8();
if (on('s3') || on('s4') || on('s5') || on('s6')) day();
if (on('s11')) { if (G.S.time > 0.6 || G.S.time < 0.2) skipTo(0.33); M.viver(2); s11(); }
if (on('s14')) { if (G.S.time > 0.6 || G.S.time < 0.2) skipTo(0.33); M.viver(2); s14(); }
if (on('s1') && (on('s3') || on('s4') || on('s5') || on('s6'))) s1c();
if (on('s10')) ok('s10 toda-fonte-tem-dono', !orphans.length && (!!ONLY || (scenes > 10 && sources > 30)), `${scenes} cenas e ${sources} fontes olhadas ao longo da prova (as do s9 e do s7 entram no fim): ${orphans.length ? 'SEM DONO: ' + orphans.join(' · ') : 'cada uma de uma pessoa acordada num ato, um prédio com a operação viva, um navio que anda ou um bicho vivo'}`);
{ const bad = QA.check().filter(q => q.sev <= 2 || q.sys === 'som').map(q => `S${q.sev} ${q.sys}: ${q.msg}`); ok('verificador', !bad.length, bad.length ? bad.slice(0, 4).join(' · ') : `«${WORLD}» limpo depois do dia da prova`); }
if (on('s7')) s7();
if (on('s9')) s9();
if (on('s12')) s12();
if (on('s13')) s13();
if (on('s10') && (on('s7') || on('s9'))) ok('s10b toda-fonte-tem-dono (segundo mundo)', !orphans.length, `${scenes} cenas e ${sources} fontes ao todo: ${orphans.length ? 'SEM DONO: ' + orphans.join(' · ') : 'todas com dono'}`);
const e = M.erros(); ok('sem-erros', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : `SOM: ok (${Math.round((hr() - t0) / 1000)} s)`);
process.exit(fails.length ? 1 : 0);
