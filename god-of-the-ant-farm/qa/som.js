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
//  s4 a forja: com a fornada na bigorna, o martelo é do ferreiro, da operação e do prédio dele — abafado da rua, limpo e mais
//     alto de dentro (P9: de dentro, na escala da sala; de fora, só de perto); as forjas sem ninguém martelando não soam
//  s5 a taverna: com gente conversando às mesas, o burburinho é do prédio e da operação do dia, mais forte com mais conversa
//     (P9, D-780: quem fala agora, mais alto com a bebida); sem conversa, calada; e o alaúde só soa com alguém tocando — a fonte
//     é quem toca, na escala do povo dele
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
//  s15 a taverna por dentro (P9, D-780 a D-789; ≈ 35 s): numa noite da metrópole pronta, o ouvido no meio de cada taverna aberta,
//     a cada segundo do mundo das 0,70 até perto de fechar: a o burburinho só com dois ou mais conversando agora, a conta dele a da
//     sala, mais alto com mais vozes (e a bebida) na mesma sala; b o fogo crepita só aceso (G.Atmos.fire), da peça de fogo da planta;
//     c a porta soa só com alguém passando pela entrada (In.passage), e de quem passa, e os passos no chão da planta debaixo deles;
//     d o gole na caneca da mão (o barro ou a madeira do povo), a voz arrastada só de quem bebeu, a música de quem toca com o
//     instrumento da mão e o compasso do povo dele; e a chuva no telhado só com chuva (a mão da prova no tempo, desfeita na hora),
//     no telhado que o 3D põe (a turfa, o terraço, a telha), só de dentro; f o eco da planta (a sala dura soa mais que a mole);
//     g os atos da noite da P7 com o seu som e as palmas, a dança e o canto no compasso; h o deus a ouve só de perto (de longe nada
//     da sala; de perto o burburinho abafado); i depois de fechar, a taverna calada
//  s16 a quarta onda da taverna (T8, D-890 a D-897; ≈ 22 s): os estados e os atos das outras frentes postos pela mão da prova em gente
//     de verdade de uma sala à noite (T-2020): a a festa — os bardos uma banda, um pulso e cada um a sua parte, o salão mais alto, o
//     discurso, o viva do salão de quem grita; b a bebedeira — a voz arrastada e o soluço só de quem bebeu, a cantoria na escada do
//     povo dele, a bebida jogada e o molhado, o desmaio e o arrastar no chão da planta; c o contexto — a tranca, quem se esconde só de
//     perto, o luto que abafa, o arrombar com o estado da porta, a tempestade no telhado; d a cuba (a fervura só com a fornada no fogo),
//     o cozinhar, os dados e as cartas no material da mão, a queda de braço com o seu fim, a trapaça quase nada, a torcida; e o tocador:
//     o estrondo da porta uma vez, na hora em que ela vira arrombada, as notas dos dois da banda, o baque quando a queda de braço acaba;
//     f a porta de som da tela: cada nome da lista toca — os jogos e a festa das mesas (a frente F) —, o osso e a madeira, nada para um nome
//     que não há nem com os efeitos desligados
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
// (who plays in a tavern now: the musician of its day — op.data.mus, D-764 —, at the stage and playing; T-1863)
const musicoDe = b => { const op = b && G.Taverna && G.Taverna.dia ? G.Taverna.dia(b) : null; const v = op && op.data && op.data.mus ? G.S.villagers.get(op.data.mus) : null; return v && v.act === 'play' && v.inside === b.id ? v : null; };
function causal(c, tag) {
  const S = G.S; scenes++;
  const bad = (f, why) => { if (orphans.length < 8) orphans.push(`${tag}: ${f.k} (${f.tipo} ${f.s}) ${why}`); };
  const one = f => {
    sources++; const de = f.de || {};
    if (de.v !== undefined) { const v = S.villagers.get(de.v); if (!v) return bad(f, 'de ninguém'); if (v.sleeping) return bad(f, 'de quem dorme'); if (f.tipo === 'ocio') { const oc = G.Audio.ocioSom ? G.Audio.ocioSom(v) : null; if (v.act || v.moving || !oc || oc.s !== f.s) return bad(f, 'de uma coisinha do ócio que não está acontecendo'); return; } if (f.tipo === 'passos' || f.tipo === 'porta') { if (!G.Interiors.passage(v) && !(G.S.avatar && G.S.avatar.id === v.id)) return bad(f, 'de quem não está passando'); } else if (f.tipo === 'soluco') { if (!(A.ebrioDe(v) >= A.SOLUCO)) return bad(f, 'o soluço de quem não bebeu'); } else if (f.tipo === 'coro') { if ((f.quem || []).some(id => { const p = S.villagers.get(id); return !p || !A.CORO[p.act]; }) || !(f.n >= 2)) return bad(f, 'o coro de quem não grita'); } else if (f.tipo !== 'luta' && !v.act) return bad(f, 'de quem não faz nada'); const [wx, wy] = A.lugarDe(v, c.ear); if (f.tipo !== 'luta' && f.tipo !== 'porta' && f.tipo !== 'coro' && (Math.abs(f.x - r3(wx)) > 0.002 || Math.abs(f.y - r3(wy)) > 0.002)) return bad(f, 'fora do lugar de quem a faz'); }
    if (de.op) { const op = G.Act.get(de.op); if (!op || !G.Act.live(op)) return bad(f, 'de uma operação que não está viva'); }
    // (a gesture is the one its person is making: its act is the act the world shows; the water is of who bathes, the
    // watching of who is at the play, the lute of the one the tavern has playing, the anvil of a batch at its hammering)
    if (f.tipo === 'gesto') { const v = S.villagers.get(de.v); const t = v.task || {}; const g = G.Act.ANIM[f.g];
      if (!g || g.act !== v.act) return bad(f, `com o gesto «${f.g}», que não é do ato «${v.act}»`);
      if (f.g === 'banhar' && t.type !== 'termas') return bad(f, 'a água de quem não está no banho');
      if (f.g === 'assistir' && t.type !== 'teatro') return bad(f, 'a plateia de quem não está no espetáculo');
      if (f.g === 'tocar') { const b = S.buildings.get(v.inside); if (!b || v.act !== 'play' || (musicoDe(b) !== v && !(A.festaDe(b) || f.banda))) return bad(f, 'o alaúde de quem não está tocando'); } // (the musician of the day; or one of a band, the bards of a feast — who plays there now: T8)
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
      // (and her quarter is where she stands; beside the quay on a patch of ground no town has, the quay's — Lêda of the quay of
      // Corinto in the metropole of the generation 26, a hand off the town's last patch: L-817)
      const { op, v } = hit; const dock = S.buildings.get(op.at); const qOwn = G.Urban.at(v.x, v.y); const qv = qOwn || G.Urban.at(dock.x + (dock.w || 1) / 2, dock.y + (dock.h || 1) / 2);
      const spot = [[2, 1], [-2, 1], [2, -1], [-2, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0.3, 0.3]].find(([dx, dy]) => G.Urban.at(v.x + dx, v.y + dy) === qv) || [2, 1];
      const ear = earAt(v.x + spot[0], v.y + spot[1]);
      const c = scene(ear, 's3'); const mine = c.fontes.find(f => f.de.v === v.id);
      const quay = c.fontes.filter(f => f.fam === 'cais');
      const all = quay.every(f => { const p = S.villagers.get(f.de.v); const o = f.de.op ? G.Act.get(f.de.op) : null; return p && f.x === r3(A.ondeDe(p)[0]) && f.y === r3(A.ondeDe(p)[1]) && (f.de.op ? !!(o && o.def === 'descarga' && o.roles[p.id]) : ['cais', 'conferir', 'descarga'].includes((p.task || {}).type)); });
      kept.quay = { ear, dock, op: op.id };
      ok('s3a o-cais-vivo', !!mine && mine.de.op === op.id && mine.fam === 'cais' && ['levantar', 'pousar'].includes(mine.g) && ['heave', 'thud'].includes(mine.s) && mine.x === r3(v.x) && mine.y === r3(v.y) && mine.gain > 0.1 && mine.muf === 0 && all && c.fundo && c.fundo.agora.cais > 0,
        `${townOf(dock) ? townOf(dock).name : '?'}, cais #${dock.id}, hora ${S.time.toFixed(2)}: ${v.name} #${v.id} num «${mine ? mine.g : '?'}» da descarga #${op.id} → som «${mine ? mine.s : '?'}» em (${mine ? mine.x + ', ' + mine.y : '?'}), onde ela está (${r3(v.x)}, ${r3(v.y)}), ganho ${mine ? mine.gain : '?'}, pan ${mine ? mine.pan : '?'}; ${quay.length} fonte(s) do cais, ${all ? 'todas de gente da operação, cada uma no seu lugar' : 'ALGUMA SEM DONO'}; mãos no cais agora: ${c.fundo ? c.fundo.maos.cais || 0 : '?'}${qOwn ? '' : ' (ela de pé fora de toda cidade, ao lado do cais: as mãos dela contam no bairro do cais)'}`);
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
      ok('s4a a-forja-viva', !!fo && fo.g === 'forjar' && fo.s === 'anvil' && fo.de.op === v.task.op && fo.de.b === b.id && fo.fam === 'oficio' && fo.x === r3(A.ondeDe(v)[0]) && (!shutB || (fo.muf === 1 && fi && fi.muf === 0 && fo.gain < fi.gain)),
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
    // (who is in the water counts, sent or not: the baths of Tenochtitlan of the metrópole of the generation 22 have one place in
    // the water, and one of the town held it by their own wish from 0,46 to 0,56 — the four sent found the baths full at the
    // door and went their way, as D-200 has it, and the case heard nobody in the water, T-1123)
    const inWater = b => { for (const v of S.villagers.values()) if (v.task && v.task.type === 'termas' && v.task.id === b.id && v.task.st === 2 && v.act === 'sit' && v.inside === b.id) return v; return null; };
    for (const b of baths) {
      const went = []; stepIn(() => { for (const v of S.villagers.values()) { if (went.length >= 4) break; if (v.set !== b.set || !free(v)) continue; G.Vg.endTask(v); v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 90); const t = G.Termas.visit(v, b); if (t) { t.kind = 'work'; t.leisure = true; t.pri = 2.9; went.push(v); } } });
      if (!went.length && !inWater(b)) continue;
      const got = live(110, () => !!inWater(b));
      if (got) { hit = { b, v: inWater(b) }; break; }
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
    // (the talk of the room is who talks there now — D-780 —: a tavern with three at its tables and two of them talking)
    const inside = b => [...S.villagers.values()].filter(v => v.inside === b.id);
    const talk = b => A.vozesDe(b, inside(b));
    const full = () => taverns().find(b => guests(b) >= 3 && talk(b).fala >= 2);
    live(70, k => { if (k % 15 === 14) send(); return !!full(); });
    const b = full();
    if (!b) ok('s5a a-taverna-cheia', false, `nenhuma taverna com três às mesas e dois conversando (abertas: ${taverns().map(x => '#' + x.id + ':' + guests(x)).join(', ') || 'nenhuma'})`);
    else {
      const op = T.dia(b); const [bx, by] = mid(b); const shutB = A.fechado(b.id) === b.id;
      const out = earAt(bx + 3, by + 0.5), inn = earAt(bx + 3, by + 0.5, { inside: b.id });
      const co = scene(out, 's5 rua'), ci = scene(inn, 's5 dentro'); const key = 'b' + b.id + ':taverna';
      const mo = co.fontes.find(f => f.k === key), mi = ci.fontes.find(f => f.k === key);
      const n = guests(b);
      // (the same room with fewer people: what the line would be — the rule alone, by the scene of another tavern)
      const others = taverns().filter(x => x !== b).map(x => { const [x0, y0] = mid(x); const c = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's5 outra'); const m = c.fontes.find(f => f.k === 'b' + x.id + ':taverna'); return { id: x.id, n: guests(x), fala: talk(x).fala, forca: talk(x).forca, murmur: m ? m.gain : 0 }; });
      const emptyOK = others.every(x => (x.fala >= 2) === (x.murmur > 0));
      // (more talk, more murmur — the talkers, louder with the drink, A.vozesDe: this room and the others, each heard from the same two
      // tiles inside it)
      const here = scene(earAt(bx + 2, by + 0.5, { inside: b.id }), 's5 perto').fontes.find(f => f.k === key); const fz = here ? here.forca : 0;
      const louder = !!here && others.filter(x => x.fala >= 2 && x.forca < fz).every(x => x.murmur < here.gain) && others.filter(x => x.forca > fz).every(x => x.murmur > here.gain);
      kept.tavern = { out, b };
      ok('s5a a-taverna-cheia', !!mi && mi.tipo === 'predio' && mi.s === 'murmur' && mi.de.b === b.id && mi.de.op === op.id && mi.n === n && mi.fala === talk(b).fala && mi.muf === 0 && (!shutB || (!!mo && mo.muf === 1 && mo.gain < mi.gain)) && louder,
        `${townOf(b).name}, taverna #${b.id} (${shutB ? 'fechada' : 'aberta'}), hora ${S.time.toFixed(2)}, ${n} às mesas, ${mi ? mi.fala : '?'} conversando: o burburinho é do prédio e do dia #${op.id}; de dentro ganho ${mi ? mi.gain : '?'} limpo, da rua ${mo ? mo.gain : '?'} abafado`);
      ok('s5b a-taverna-vazia', emptyOK, others.length ? others.map(x => `taverna #${x.id}: ${x.n} às mesas, ${x.fala} conversando → burburinho ${x.murmur || 'nenhum'}`).join('; ') : 'não há outra taverna aberta — a noite (s3b) diz o resto');
      // the song: only with someone playing
      const playing = () => { for (const x of taverns()) { const v = musicoDe(x); if (v) return { b: x, v }; } return null; };
      const before = taverns().map(x => { const [x0, y0] = mid(x); const c = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's5 antes'); return { id: x.id, lute: c.fontes.filter(f => f.musica).length, music: !!musicoDe(x) }; });
      live(150, k => { if (k % 15 === 14) send(); return !!playing(); });
      const p = playing();
      if (!p) ok('s5c a-taverna-canta', false, `ninguém tocou em 150 s (às mesas: ${taverns().map(x => '#' + x.id + ':' + guests(x)).join(', ')})`);
      else {
        const [px, py] = mid(p.b); const c = scene(earAt(px + 2, py + 0.5, { inside: p.b.id }), 's5 canto'); const lu = c.fontes.find(f => f.musica && f.de.v === p.v.id);
        const fac = G.Fac.ofV(p.v); const want = A.musicOf(fac ? fac.civ : null, fac && fac.tech ? fac.tech.known : null);
        const silent = taverns().filter(x => x !== p.b && !musicoDe(x)).map(x => { const [x0, y0] = mid(x); const cc = scene(earAt(x0 + 2, y0 + 0.5, { inside: x.id }), 's5 calada'); return { id: x.id, lute: cc.fontes.filter(f => f.musica && f.de.b === x.id).length }; });
        ok('s5c a-taverna-canta', !!lu && lu.de.v === p.v.id && lu.g === 'tocar' && lu.s === (A.instrumentoDe(p.v) || 'canto') && lu.de.b === p.b.id && JSON.stringify(lu.notas) === JSON.stringify(want.notas) && before.every(x => x.music || x.lute === 0) && silent.every(x => x.lute === 0),
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
    if (kept.tavern) { const c = scene(kept.tavern.out, 'noite taverna'); const n = c.fontes.filter(f => f.s === 'murmur' || f.musica).length; good = good && n === 0; out.push(`a taverna #${kept.tavern.b.id}: ${n} burburinho/alaúde`); }
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
    // (the bed of a quarter rings where the quarter has its habit and hands at it now: the second ear stands at the middle of a
    // patch of the town's quarter whose bed weighs most — asked of the scene itself, every three seconds. At the town's middle,
    // in the cidade of the generation 24, the bed never rose over what rings it: no far voice in the whole life, T-1145)
    let bedEar = null;
    const bedAt = set2 => { const U = G.Urban; const C6 = U.cellXY(1)[0]; let best = null, bw = 0;
      for (const d of U.districtsOf(set2)) for (const cl of d.cells) { const [x, y] = U.cellXY(cl); const e = earAt(x + C6 / 2, y + C6 / 2, { r: 25 }); const c = A.scene(e); const w = c && c.fundo ? Math.max(0, ...A.FAMS.map(f => c.fundo.w[f] || 0)) : 0; if (w > bw) { bw = w; best = e; } }
      return best; };
    for (let k = 0; k < STEPS; k++) {
      if (k === STEPS / 2) { M.salvarCarregar(); bedEar = null; if (sound) { out.afterLoad = A.cena; A.mute = false; A.sfxOn = true; A.musicOn = true; } }
      M.viver(0.1);
      if (!sound) continue;
      inSound++;
      try {
        const S2 = G.S; const people = [...S2.villagers.values()]; const p = people[k % people.length]; const set2 = S2.settlements.get(set.id) || [...S2.settlements.values()][0];
        if (k % 30 === 0 || !bedEar) bedEar = bedAt(set2) || earAt(set2.cx, set2.cy, { r: 25 });
        const ears = [A.earOf({ x: p.x, y: p.y, yaw: k * 0.3, inside: p.inside }), bedEar, A.earOf({ x: set2.cx, y: set2.cy, rx: 1, ry: -1, r: 45, k: 0.8, modo: 'deus' })];
        for (const e of ears) { const c = scene(e, 's9'); out.scenes++; out.srcs += c.fontes.length; }
        // (the ear stays where it is through the next steps: the world's own blows — G.Audio.at — are heard by it. Each ear for a look
        // of the player — the scene is asked once a look, a quarter of a second: three steps —: changed every step, the look fell
        // on the same one of the three every time, T-1145)
        A.ouvido = ears[Math.floor(k / 3) % 3]; FakeAC.last.currentTime += 0.1; out.plays += FakeAC.last.made - (out.m0 || FakeAC.last.made);
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
  // (the world of the case: the ready city and its largest town — in another history of it when shift > 0, the world's own
  // chance drawn shift times —, two days first: the life of the quarter has what the town really did — a ready world of before
  // the life has none)
  let S = null, set = null;
  // a day of the town's quarters: what the proof's hand counts (fn), then the world lives, by the game's skip, until the
  // town has closed one day more — exactly one (the day of the world and the day of a town's quarters do not turn at the same
  // step: a count of whole days of the world gave days with no close and days with two). The day is counted by the town's
  // whole, which every close of the town folds: the quarter under the ear can be another one the next day (T-964)
  const diasOf = () => (set.urb && set.urb.w && set.urb.w.dias) || 0;
  const day = fn => { if (fn) stepIn(fn); const d0 = diasOf(); G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3; try { let n = 0; while (diasOf() === d0 && n++ < 600) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; } };
  const open = shift => {
    M.pronto('cidade'); S = G.S; M.viver(1); for (let i = 0; i < shift; i++) G.R();
    set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    for (let k = 0; k < 2; k++) day();
  };
  open(0);
  // ---------------- s7b the weight is the habit times the hands of now: a day's hour with hands at a work, and the night ----------------
  if (sub('s7b')) {
    let best = null;
    skipTo(0.3); M.viver(2);
    // (the ear on each quarter of the town with a habit, at the middle of a patch of it — the quarter under the ear is the one
    // heard —; the town's middle is its old town, drawn again most days (s7a), and Tenochtitlan of the cidade of the generation
    // 21 had there no habit of anything — «nenhuma vida do bairro com hábito e mãos ao mesmo tempo», T-1103 —, while its
    // fields, its market and its port had theirs)
    const U = G.Urban; const C6 = U.cellXY(1)[0];
    const ears = () => { const out = []; for (const d of U.districtsOf(set).slice().sort((a, b) => b.cells.length - a.cells.length || a.id - b.id)) {
      const h = A.habito(d); if (!A.FAMS.some(f => h[f] > 0)) continue;
      for (const cl of d.cells) { const [x, y] = U.cellXY(cl); const at = U.at(x + C6 / 2, y + C6 / 2); if (at && at.id === d.id) { out.push(earAt(x + C6 / 2, y + C6 / 2)); break; } } }
      return out; };
    for (let k = 0; k < 60 && !best; k++) { M.viver(1); for (const ear of ears()) { const c = scene(ear, 's7'); for (const f of A.FAMS) if (c.fundo && c.fundo.maos[f] > 0 && c.fundo.h[f] > 0) { best = { f, c, ear }; break; } if (best) break; } }
    if (!best) ok('s7b habito-vezes-maos', false, 'em 60 s do dia, nenhuma vida do bairro com hábito e mãos ao mesmo tempo');
    else {
      const { f, c } = best; const wantW = r3(c.fundo.h[f] * Math.min(1, c.fundo.maos[f] / A.HANDS) * (1 - 0.5 * c.chuva));
      // (the same instant in the rain: the far work is covered — the proof's hand on the weather, put back at once)
      const w0 = S.weather.rain; S.weather.rain = 1; const wet = A.scene(best.ear).fundo.w[f]; S.weather.rain = w0;
      const dayH = Object.assign({}, c.fundo.h);
      skipTo(0.97); M.viver(2); const n = scene(best.ear, 's7 noite');
      const silent = A.FAMS.filter(x => !(n.fundo.maos[x] > 0)).every(x => n.fundo.w[x] === 0);
      // (the night has its own hands — the priests are up before the light, the watch walks —: the family of the day may have
      // some at this hour («fe», 2 at 0,97), and then its weight is the same count, the habit times them; what the night
      // shows is a life with its habit and no hands, silent: T-855)
      const nightW = r3(n.fundo.h[f] * Math.min(1, (n.fundo.maos[f] || 0) / A.HANDS) * (1 - 0.5 * n.chuva));
      const mute = A.FAMS.filter(x => n.fundo.h[x] > 0 && !(n.fundo.maos[x] > 0));
      ok('s7b habito-vezes-maos', c.fundo.w[f] === wantW && wantW > 0 && Math.abs(wet - r3(wantW * 0.5 / (1 - 0.5 * c.chuva))) < 0.002 && silent && n.fundo.h[f] === dayH[f] && n.fundo.w[f] === nightW && mute.length > 0,
        `${set.name}, o bairro «${c.fundo.nome}», «${f}»: de dia, hábito ${c.fundo.h[f]} × ${c.fundo.maos[f]} par(es) de mãos → peso ${c.fundo.w[f]} (a conta: ${wantW}); com chuva forte ${wet}; de noite (hora ${S.time.toFixed(2)}), o mesmo hábito ${n.fundo.h[f]}, ${n.fundo.maos[f] || 0} mãos → peso ${n.fundo.w[f]} (a conta: ${nightW}); ${mute.length} vida(s) com hábito e sem mãos (${mute.join(', ') || 'NENHUMA'}) — ${silent ? 'sem mãos, nenhuma vida soa' : 'SOA SEM MÃOS'}`);
    }
  }
  // ---------------- s7a the habit follows the life counted, slowly ----------------
  if (sub('s7a')) {
    // (the town grows while the days pass, and its quarters are drawn again: the slow rise is judged between two days the
    // quarter kept its ground — most of them, T-855. The quarter is one of the town's quarters that is not its old town — the
    // old town's patches are the hearth's and the oldest around it, a share of the town's ground by age, and they are drawn
    // again most days (in a history of the code of the 3rd round of the F, the old town of Mênfis kept its ground in 4 of 9
    // days: nothing to judge) —, followed by who it is, not by the patch under the ear; and the reading is counted on each of
    // its patches, as a lettered quarter reads (on one patch, the reading went, the day the quarter was drawn again, to the
    // quarter that took that patch). A history with the quarter drawn again on the days the case reads, or on most of them, has
    // nothing to judge: the case starts again in another history of the same world, up to three, and says why; T-964)
    const caseA = () => {
      // (four days more: the quarter's life is past its first days, when one day is the whole mean)
      for (let k = 0; k < 4; k++) day();
      // (every quarter of the town that is not its old town and reads nothing yet, followed at once — each by who it is —, each
      // read on its own ground: in the cidade of the generation 22 the greatest of Roma, the Bairro do Porto of four patches, was
      // drawn again on a first day or most days in three histories, the rise and the fall what the rule says in each, T-1124;
      // every quarter that kept its ground is judged, and all of them must pass)
      // (and past its first days: a quarter born in the four days before has one day of life, when a day is half the mean — the
      // rule of the quarter just born, urban.js fold —, and the habit of Campos do Leste Novo, of Roma in the cidade of the
      // generation 24, went 0 → 0,75 on the first day of the reading, T-1144)
      const qs = U.districtsOf(set).filter(d => d.k !== 'centro' && d.cells.length && (d.dias || 0) >= 4 && A.habito(d).saber === 0).sort((a, b) => b.cells.length - a.cells.length || a.id - b.id);
      if (!qs.length) { const w = U.wholeOf(set); if (w && w.cells.length && A.habito(w).saber === 0) qs.push(w); }
      if (!qs.length) return { judged: true, pass: false, info: `${set.name} não tem bairro nem todo com chão e sem leitura` };
      const T = qs.map(q => ({ q, now: () => q.whole ? U.wholeOf(set) : U.allDistrictsOf(set).find(d => d.id === q.id) }));
      // (a day and a half of a lettered quarter's reading, every day, on each patch of the quarter's own ground that day — and the
      // world's own reading heard apart: a quarter where the world reads in the days of the case is not judged — the reading is
      // the proof's hand alone —, as the Mercado Velho of Roma, in the cidade of the generation 24, whose habit never came down, T-1144)
      const doMundo = new Map(); let mao = false; const note0 = U.note;
      U.note = function (x, y, k, n) { if (k === 'saber' && !mao) { const c = U.cellOf(x, y); doMundo.set(c, (doMundo.get(c) || 0) + (n === undefined ? 1 : n)); } return note0.apply(this, arguments); };
      const read = () => { mao = true; try { for (const t of T) { const qq = t.now(); if (!qq) continue; const m = U.mark(qq, 'letrado', false) * 1.5; for (const c of qq.cells) { const [x, y] = U.cellXY(c); U.note(x + 1, y + 1, 'saber', m); } } } finally { mao = false; } };
      const sigOf = t => { const qq = t.now(); return qq && qq.cells.length ? qq.cells.slice().sort((x, y) => x - y).join('.') : '-'; };
      const hab = t => { const qq = t.now(); return qq ? A.habito(qq).saber : NaN; };
      for (const t of T) { t.up = [hab(t)]; t.sg = [sigOf(t)]; t.chao = new Set(); }
      const anotaChao = () => { for (const t of T) { const qq = t.now(); if (qq) for (const c of qq.cells) t.chao.add(c); } };
      try {
      for (let k = 0; k < 9; k++) { day(read); anotaChao(); for (const t of T) { t.up.push(hab(t)); t.sg.push(sigOf(t)); } }
      for (const t of T) { t.down = [t.up[t.up.length - 1]]; t.sd = [sigOf(t)]; }
      for (let k = 0; k < 12; k++) { day(); anotaChao(); for (const t of T) { t.down.push(hab(t)); t.sd.push(sigOf(t)); } }
      } finally { U.note = note0; }
      const same = (g, k) => g[k] !== '-' && g[k] === g[k - 1];
      for (const t of T) {
        const { up, sg, down, sd } = t; const h0 = up[0], peak = up[up.length - 1];
        t.kept = sg.filter((x, k) => k > 0 && same(sg, k)).length; t.keptD = sd.filter((x, k) => k > 0 && same(sd, k)).length;
        // (the days the single numbers are read on — the first of the reading, the first two without it — are days the quarter kept)
        t.lido = [...t.chao].reduce((a, c) => a + (doMundo.get(c) || 0), 0);
        t.judged = t.kept >= 6 && t.keptD >= 8 && same(sg, 1) && same(sd, 1) && same(sd, 2) && !t.lido;
        t.rise = up.every((x, k) => k === 0 || !same(sg, k) || x >= up[k - 1]) && up.slice(1).every((x, k) => !same(sg, k + 1) || x - up[k] <= 0.36);
        t.fall = down.every((x, k) => k === 0 || !same(sd, k) || x <= down[k - 1]) && down.slice(1).every((x, k) => !same(sd, k + 1) || down[k] - x <= 0.21);
        t.pass = t.judged && h0 === 0 && t.rise && t.fall && peak >= 0.99 && up[1] > 0.2 && up[1] < 0.4 && down[2] >= 0.6 * peak && down[down.length - 1] < 0.15;
      }
      const J = T.filter(t => t.judged); const show = J.find(t => !t.pass) || J[0] || T[0]; const q2 = show.now() || show.q;
      const best = T.slice().sort((a, b) => (b.kept + b.keptD) - (a.kept + a.keptD))[0];
      return { judged: J.length > 0, pass: J.length > 0 && J.every(t => t.pass), kept: best.kept, keptD: best.keptD,
        info: `${set.name}: ${T.length} bairro(s) sem leitura seguidos, ${J.length} julgado(s) (guardaram o chão), ${J.filter(t => t.pass).length} como a regra diz; ${q2.whole ? 'o todo' : q2.name} (${q2.cells.length} chãos, ${q2.dias} dias de vida, dia ${S.day}): uma vez e meia a leitura que faz um bairro letrado, contada todo dia → o hábito ${show.up.join(' → ')}; sem leitura → ${show.down.join(' → ')} — ${show.rise ? 'sobe devagar' : 'SOBE AOS SALTOS'}, ${show.fall ? 'desce devagar' : 'DESCE AOS SALTOS'} (o bairro guardou os chãos em ${show.kept} de 9 dias da subida e ${show.keptD} de 12 da descida${show.judged ? '' : '; redesenhado no primeiro dia de um dos lados ou na maioria deles: nada a julgar nesta história'})` };
    };
    const before = []; let r = null;
    for (let t = 0; t < 3; t++) {
      if (t) open(7 * t);
      r = caseA(); if (r.judged) break;
      before.push(`história ${t + 1}: ${set.name} com os bairros redesenhados (o que mais guardou os chãos: ${r.kept} de 9 dias e ${r.keptD} de 12)`);
    }
    ok('s7a o-habito-segue-a-vida', r.pass, `${before.length ? `(${before.join(' · ')}) ` : ''}${r.info}`);
  }
}

// =============================================================================================================
// s12 a fire crackles where it burns near the ear (L-740); s13 the ear is the body's
// =============================================================================================================
function s12() {
  if (!FakeAC.last) { global.AudioContext = FakeAC; G.Audio.init(); }
  M.pronto('cidade'); const S = G.S; M.viver(1); A.mute = false; A.ambOn = true;
  const xy = i => [i % G.N + 0.5, Math.floor(i / G.N) + 0.5];
  // (a tree that can burn: a sapling or a stump is no fuel — G.Nature.fuel —, and the «cidade» of 48fec17 had one 68 tiles off: T-1624)
  const trees = []; for (let i = 0; i < G.N * G.N; i++) if (S.treeAt[i] && !G.Nature.fireSet.has(i) && G.Nature.fuel(i) === 'tree') trees.push(i);
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
// s15 the tavern from within (P9, D-780 to D-789): a night of the ready metropolis, the ear inside each open tavern
// =============================================================================================================
function s15() {
  const S = G.S, T = G.Taverna, In = G.Interiors, At = G.Atmos;
  const taverns = () => [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built && b.ip && In.ready(b) && In.tableReady(b)).sort((a, b) => a.id - b.id);
  const inside = b => [...S.villagers.values()].filter(v => v.inside === b.id && !v.sleeping);
  // (the ear in the middle of the room, turned to the east: inside the tavern, P9's body at a table)
  const earIn = b => earAt(b.x + (b.w || 1) / 2, b.y + (b.h || 1) / 2, { inside: b.id });
  const talkers = b => inside(b).filter(v => A.FALA.has(v.act) || (v.task && v.task.pose === 'sittalk')).length;
  const own = (c, b) => c.fontes.filter(f => (f.de && f.de.b === b.id) || f.sala === b.id);
  skipTo(0.7); M.viver(2);
  // (the night as the world has it — the will of each to go, D-760 —, and the proof's hand sending a few more by the customer's own
  // door when no room talks yet, as s5 does: the visit held above the day's calls, T-281)
  const send = () => stepIn(() => { for (const b of taverns()) { if (!T.aberta(b) || inside(b).length >= 6) continue; let n = 0;
    for (const v of [...S.villagers.values()].filter(p => p.set === b.set && free(p) && !(p.task && p.task.type === 'tavern')).sort((p, q) => p.id - q.id)) { if (n >= 4) break; G.Vg.endTask(v); v.hunger = Math.min(v.hunger, 30); v.energy = Math.max(v.energy, 80); if (T.pick(v) && T.visitTask(v, G.Vg.H)) { if (v.task && v.task.type === 'tavern') v.task.pri = 2.9; n++; } } } });
  const godOf = (b, dx) => A.earOf({ x: b.x + (b.w || 1) / 2 + dx, y: b.y + (b.h || 1) / 2, rx: 1, ry: 0, r: 40, k: 1, modo: 'deus' });
  const ofRoom = (c, b) => c.fontes.filter(f => (f.de && f.de.b === b.id) || (f.de && f.de.v !== undefined && (S.villagers.get(f.de.v) || {}).inside === b.id));
  const gods = [];
  const bad = []; const pairs = new Map(); let musicas = 0, musico = ''; let doorsSeen = 0, passSeen = 0, firesSeen = 0, stepsSeen = 0, looks = 0, best = null, gole = 0, drunkV = 0;
  const look = () => {
    for (const b of taverns()) {
      const c = scene(earIn(b), 's15'); looks++; const mine = own(c, b); const quem = inside(b);
      // (the talk: the murmur is there with two or more talking, its count the room's own — and nothing with fewer)
      const fala = talkers(b); const mu = mine.find(f => f.s === 'murmur');
      if ((fala >= 2) !== !!mu || (mu && mu.fala !== fala)) bad.push(`#${b.id}: ${fala} conversando e o burburinho ${mu ? 'de ' + mu.fala : 'nenhum'}`);
      if (mu) { const P = pairs.get(b.id) || []; P.push([mu.forca, mu.gain]); pairs.set(b.id, P); if (!best || mu.fala > best.fala) best = { b, fala: mu.fala, beb: mu.bebado, gain: mu.gain, n: quem.length, povo: mu.povo }; }
      // (the god's ear, the first time a room talks: from fourteen tiles off nothing of it, from two its talk through the wall)
      if (mu && !gods.some(x => x.b === b)) gods.push({ b, far: ofRoom(scene(godOf(b, 14), 's15 deus longe'), b).length, near: scene(godOf(b, 2), 's15 deus perto').fontes.find(f => f.s === 'murmur' && f.de.b === b.id) });
      // (the fire: only lit — G.Atmos.fire —, from the plan's hearth)
      const fo = mine.filter(f => f.tipo === 'fogo'); const lit = !!At.fire(b);
      if (lit !== fo.length > 0) bad.push(`#${b.id}: o fogo ${lit ? 'aceso' : 'apagado'} e ${fo.length} som(ns) de fogo`); if (fo.length) firesSeen++;
      // (the rain on the roof: only with rain over it — the world of the proof is dry here)
      if (mine.some(f => f.tipo === 'chuva') && !(c.sala && c.sala.chuva > 0.02)) bad.push(`#${b.id}: chuva no telhado sem chuva`);
      // (the door: only with someone passing the way in; each door source of one who passes there, and no passer unheard)
      const ps = quem.filter(v => In.passage(v)); const dr = mine.filter(f => f.tipo === 'porta'); passSeen += ps.length ? 1 : 0; doorsSeen += dr.length ? 1 : 0;
      if (dr.length && !ps.length) bad.push(`#${b.id}: a porta soa sem ninguém passando`);
      for (const f of dr) { const v = S.villagers.get(f.de.v); if (!v || v.inside !== b.id || !In.passage(v)) bad.push(`#${b.id}: a porta de quem não passa (#${f.de.v})`); }
      if (ps.length && !dr.length) bad.push(`#${b.id}: ${ps.length} passando e a porta calada`);
      // (the feet: of who passes, on the plan's floor under them)
      for (const f of mine.filter(x => x.tipo === 'passos')) { stepsSeen++; const v = S.villagers.get(f.de.v); const want = v ? A.PASSO[A.chaoDe(b, A.ondeDe(v)[2])] : null; if (!v || !In.passage(v) || f.piso !== want) bad.push(`#${b.id}: passos de #${f.de.v} no chão «${f.piso}» (o da planta: ${want})`); }
      // (the cup in the hand of who drinks, in its own material; the drunk's slurred talk only of who drank)
      for (const f of mine) { const v = f.de && f.de.v !== undefined ? S.villagers.get(f.de.v) : null; if (!v) continue;
        if (f.s === 'gole') { gole++; const k = G.Inv.held(v).mao; const m = k ? G.Itens.def(k).mat : null; if (f.mat !== (m === 'barro' || m === 'madeira' ? m : m ? 'metal' : 'madeira')) bad.push(`#${b.id}: o gole de #${v.id} na caneca de «${f.mat}» (a da mão: ${k})`); }
        if (f.s === 'voz' || f.s === 'vozBebado') { if ((f.s === 'vozBebado') !== (At.drunk(v) >= 0.5)) bad.push(`#${b.id}: a voz de #${v.id} ${f.s} com a bebida ${At.drunk(v)}`); if (f.s === 'vozBebado') drunkV++; }
        // (the music: of who plays, with the instrument in the hand — or the voice —, on the pulse of the player's people)
        if (f.musica) { musicas++; const want = A.instrumentoDe(v) || 'canto'; const fac = G.Fac.ofV(v); const R0 = A.RITMO[fac ? fac.civ : ''] || A.RITMO.classico; if (f.g !== 'tocar' || f.s !== want || f.musica.bpm !== R0.bpm || f.musica.de !== v.id) bad.push(`#${b.id}: a música de #${v.id} «${f.s}» (a mão: ${want}), ${f.musica.bpm} batidas`); else musico = `${v.name} #${v.id} toca ${f.s} (${f.musica.civ}, ${f.musica.bpm} batidas, ciclo de ${f.musica.ciclo.length})`; } }
    }
  };
  let sent = 0;
  // (a day is 200 s of the world: from 0,70 to a little before the closing, 0,88 in a great town — the same night as the empty tavern below)
  live(40, k => { look(); if (k % 12 === 5 && (!best || best.fala < 3) && sent < 3) { send(); sent++; } return S.time >= 0.86; });
  // (more talk, more murmur: in the same room and the same ear, the weight of the voices — the talkers, louder with the drink — orders the
  // loudness)
  let mono = true, pts = 0; for (const [id, P] of pairs) for (const [a, g] of P) for (const [a2, g2] of P) { pts++; if (a < a2 - 1e-9 && !(g < g2 + 1e-9)) mono = false; }
  ok('s15a o-burburinho-de-quem-conversa', !bad.filter(x => /conversando|burburinho/.test(x)).length && !!best && best.fala >= 2 && mono,
    `${looks} olhadas em ${taverns().length} tavernas de 0,70 a ${S.time.toFixed(2)}: ${best ? `a mais cheia, #${best.b.id} (${G.Village.buildName(best.b)}, ${best.povo}), ${best.n} dentro, ${best.fala} conversando, bebida ${best.beb} → burburinho ${best.gain}` : 'NINGUÉM CONVERSOU'}; o volume pelo peso das vozes em ${pts} pares da mesma sala: ${mono ? 'sempre mais com mais' : 'FORA DE ORDEM'}; ${drunkV} voz(es) de quem bebeu; ${bad.filter(x => /conversando|burburinho/.test(x)).slice(0, 3).join(' · ')}`);
  ok('s15b o-fogo-so-aceso', !bad.filter(x => /fogo/.test(x)).length && firesSeen > 0, `${firesSeen} olhadas com o fogo da planta crepitando, cada uma com o fogo aceso (G.Atmos.fire); ${bad.filter(x => /fogo/.test(x)).slice(0, 3).join(' · ')}`);
  ok('s15c a-porta-so-com-quem-passa', !bad.filter(x => /porta|passos|passando/.test(x)).length && passSeen > 0 && doorsSeen > 0,
    `${passSeen} olhadas com alguém passando pela entrada, ${doorsSeen} com a porta soando — cada uma de quem passa —, ${stepsSeen} passos no chão da planta; ${bad.filter(x => /porta|passos|passando/.test(x)).slice(0, 3).join(' · ')}`);
  ok('s15d as-coisas-da-mesa', !bad.filter(x => /gole|voz de|música/.test(x)).length, `${gole} gole(s), cada um na caneca da mão (o barro ou a madeira do povo); ${bad.filter(x => /gole|voz de|música/.test(x)).slice(0, 3).join(' · ') || 'a voz de quem bebeu só de quem bebeu'}; ${musicas ? musicas + ' olhada(s) com música: ' + musico : 'ninguém tocou nesta noite'}`);
  // ---- the god's ear (D-780): the open tavern heard only near — from fourteen tiles off nothing of its room, from two tiles its talk
  // through the wall
  ok('s15h o-deus-so-de-perto', gods.length > 0 && gods.every(x => x.far === 0 && !!x.near && x.near.muf === 1),
    gods.length ? gods.map(x => `#${x.b.id}: a 14 casas ${x.far} som(ns) da sala, a 2 casas o burburinho ${x.near ? x.near.gain + (x.near.muf ? ' abafado' : ' LIMPO') : 'CALADO'}`).join('; ') : 'nenhuma taverna conversando na hora do caso');
  // ---- the rain on the roof: the proof's hand on the weather, put back at once — the roof the 3D lays, from within only
  const tv = taverns(); const roofs = []; let rainOK = tv.length > 0;
  const w0 = S.weather.rain; S.weather.rain = 1;
  try { for (const b of tv) { const ci = scene(earIn(b), 's15 chuva'); const co = scene(earAt(b.x + (b.w || 1) / 2 + 4, b.y + (b.h || 1) / 2), 's15 chuva rua'); const f = ci.fontes.find(x => x.tipo === 'chuva' && x.de.b === b.id);
    const sh = In.shellOf(b); const kind = sh.shell.roof && sh.shell.roof.kind; const want = kind === 'turfa' ? 'turfa' : kind === 'plano' ? 'terraco' : /palha/.test(kind || '') ? 'palha' : A.TELHA[b.style] || 'telha';
    if (!f || f.telhado !== want || !(f.gain > 0.2) || co.fontes.some(x => x.tipo === 'chuva')) rainOK = false; roofs.push(`${b.style} ${kind} → ${f ? f.telhado : 'NADA'}${f && f.goteira ? ' (goteira)' : ''}`); } }
  finally { S.weather.rain = w0; }
  const dry = tv.every(b => !scene(earIn(b), 's15 seca').fontes.some(x => x.tipo === 'chuva'));
  ok('s15e a-chuva-no-telhado', rainOK && dry, `com chuva (a mão da prova no tempo, desfeita na hora): ${[...new Set(roofs)].join('; ')}; de fora, nenhum telhado soa por cima de quem ouve; sem chuva, ${dry ? 'nenhum' : 'ALGUM'}`);
  // ---- the echo: the plan's — a hard room rings longer than a soft one of the same size, a full room less than an empty one
  const ecos = tv.map(b => ({ b, E: A.ecoDe(b) })).filter(x => x.E);
  const range = ecos.every(x => x.E.rt >= 0.3 && x.E.rt <= 1.6 && x.E.mix >= 0.15 && x.E.mix <= 0.45 && x.E.pre > 0 && x.E.gente === At.inside(x.b));
  const hard = ecos.filter(x => x.E.parede === 'pedra' && x.E.piso !== 'terra'), soft = ecos.filter(x => x.E.parede === 'madeira' && x.E.piso === 'terra');
  const order = !hard.length || !soft.length || hard.every(h => soft.every(s => Math.abs(s.E.vol - h.E.vol) > 60 || h.E.rt > s.E.rt));
  ok('s15f o-eco-da-sala', ecos.length > 0 && range && order, ecos.slice(0, 6).map(x => `#${x.b.id} ${x.b.style}: ${x.E.m2} m² × ${x.E.h} m, ${x.E.piso}/${x.E.parede}/${x.E.telhado}, ${x.E.gente} dentro → ${x.E.rt} s`).join('; ') + (order ? '' : ' — A SALA DURA SOA MENOS QUE A MOLE'));
  // ---- the music's pulse and the acts of the night (pure: the lines of the table for the acts of P7, on the pulse of the music)
  const R = A.compasso(null); const L = n => A.linhaDe({ act: n, task: {}, carry: null });
  const acts = Object.keys(A.TAVERNA_ATO).map(k => [k, L(k)]); const lib = new Set(A.sons());
  const linesOK = acts.every(([k, r]) => r && r.linha && (r.linha.por || lib.has(r.linha.s))) && ['palmas', 'danca', 'cantar-junto'].every(k => L(k).linha.compasso || L(k).linha.por);
  ok('s15g os-atos-da-noite', linesOK && R.periodo > 0 && R.ciclo.length >= 3, `${acts.map(([k, r]) => `${k} → ${r.linha.s || 'silêncio'}`).join(', ')}; o compasso do povo comum: ${R.bpm} batidas, ciclo de ${R.ciclo.length}, ${R.periodo} s do mundo cada`);
  // ---- the empty tavern: after the closing, the same ears — no talk, no fire, nothing of the room; and the god from afar hears none of it
  skipTo(0.97); M.viver(3);
  const after = taverns().map(b => { const c = scene(earIn(b), 's15 vazia'); const m = own(c, b).filter(f => f.tipo !== 'passos' && f.tipo !== 'porta'); return { b, n: m.length, what: m.map(f => f.s).join(',') }; });
  const quiet = after.every(x => x.n === 0 || !T.aberta(x.b) && x.what.split(',').every(s => s === 'lareira' || s === 'panela') && At.fire(x.b));
  ok('s15i a-taverna-vazia-cala', quiet, `hora ${S.time.toFixed(2)}: ${after.map(x => `#${x.b.id} ${x.n ? x.what : 'silêncio'}`).join('; ')}`);
}

// =============================================================================================================
// s16 the tavern's fourth wave (T8, D-890 to D-899): the feast, the drink, the context, the trades, the games — and the screen's door
// =============================================================================================================
// (the states and the acts of the fourth wave are the other fronts', in work beside this one — b.festa of the T1, v.ebrio of the T2, the
// acts of the contract —: the proof's hand puts them on real people of a real room at night, reads the scene, and takes them off at once;
// the world's own causes make the same states when they land, T-2020)
function s16() {
  const S = G.S, T = G.Taverna, In = G.Interiors;
  const taverns = () => [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built && b.ip && In.ready(b) && In.tableReady(b) && T.aberta(b)).sort((a, b) => a.id - b.id);
  const inside = b => [...S.villagers.values()].filter(v => v.inside === b.id && !v.sleeping).sort((a, c) => a.id - c.id);
  const earIn = b => earAt(b.x + (b.w || 1) / 2, b.y + (b.h || 1) / 2, { inside: b.id });
  if (S.time < 0.66 || S.time > 0.8) skipTo(0.7); M.viver(2);
  let b = null; for (let k = 0; k < 40 && !b; k++) { b = taverns().find(x => inside(x).filter(v => v.task && v.task.type === 'tavern').length >= 4) || null; if (!b) M.viver(1); }
  if (!b) return ok('s16 a-quarta-onda', false, `nenhuma taverna aberta com quatro fregueses (${taverns().map(x => '#' + x.id + ':' + inside(x).length).join(', ')})`);
  const P = inside(b).filter(v => v.task && v.task.type === 'tavern'); const [p1, p2, p3, p4] = P; const keep = new Map();
  const put = (v, act, more) => { if (!keep.has(v)) keep.set(v, { act: v.act, actT: v.actT, ebrio: v.ebrio, x: v.x, y: v.y }); v.act = act; v.actT = 0.6; if (more) Object.assign(v, more); };
  const undo = () => { for (const [v, k] of keep) { v.act = k.act; v.actT = k.actT; v.ebrio = k.ebrio; v.x = k.x; v.y = k.y; } keep.clear(); };
  const of = (c, v) => c.fontes.filter(f => f.de && f.de.v === v.id);
  const who = v => `${v.name} #${v.id}`;
  try {
    // ---- a the feast: the bards one band — one pulse and one tune, each its part —, the hall fuller and louder, the speech, the viva
    const c0 = scene(earIn(b), 's16 antes'); const mu0 = c0.fontes.find(f => f.s === 'murmur' && f.de.b === b.id);
    const f0 = b.festa; b.festa = { motivo: 'prova', causa: 'a mão da prova', dia: S.day, ate: S.day, bardos: [p2.id, p1.id] };
    put(p1, 'play'); put(p2, 'play'); put(p3, 'sittalk'); put(p4, 'sittalk');
    const cf = scene(earIn(b), 's16 festa'); const m1 = of(cf, p1).find(f => f.musica), m2 = of(cf, p2).find(f => f.musica); const muf = cf.fontes.find(f => f.s === 'murmur' && f.de.b === b.id);
    delete b.festa; if (f0) b.festa = f0; const cn = scene(earIn(b), 's16 sem festa'); const mun = cn.fontes.find(f => f.s === 'murmur' && f.de.b === b.id); b.festa = { motivo: 'prova', dia: S.day, ate: S.day, bardos: [p2.id, p1.id] };
    const bandOK = !!m1 && !!m2 && m1.musica.de === p2.id && m2.musica.de === p2.id && m2.banda.papel === 0 && m1.banda.papel === 1 && m1.banda.n === 2 && m1.musica.bpm === m2.musica.bpm && [m1, m2].every(f => f.s === (A.instrumentoDe(S.villagers.get(f.de.v)) || 'canto'));
    const loudOK = !!muf && muf.festa === 1 && (!mun || (mun.festa === 0 && muf.forca > mun.forca && muf.gain >= mun.gain));
    put(p3, 'discurso'); put(p1, 'cheer'); put(p2, 'cheer'); put(p4, 'cheer');
    const cv = scene(earIn(b), 's16 viva'); const ds = of(cv, p3).find(f => f.s === 'discurso'); const vv = cv.fontes.find(f => f.tipo === 'coro' && f.de.b === b.id);
    const lone = cv.fontes.filter(f => f.s === 'cheer' && [p1, p2, p4].some(p => f.de.v === p.id)).length;
    const vivaOK = !!ds && !!vv && vv.s === 'viva' && vv.n === 3 && JSON.stringify(vv.quem) === JSON.stringify([p1.id, p2.id, p4.id].sort((x, y) => x - y)) && lone === 0;
    ok('s16a a-festa', bandOK && loudOK && vivaOK,
      `#${b.id} de ${townOf(b).name}: ${who(p2)} e ${who(p1)} na festa — ${m2 ? m2.s : '?'} e ${m1 ? m1.s : '?'}, uma banda (o pulso de #${m1 ? m1.musica.de : '?'}, ${m1 ? m1.musica.bpm : '?'} batidas; as partes ${m2 ? m2.banda.papel : '?'} e ${m1 ? m1.banda.papel : '?'}) ${bandOK ? '' : '— FORA DA BANDA'}; o salão com festa ${muf ? muf.forca + ' de peso, ganho ' + muf.gain : 'CALADO'}, sem ${mun ? mun.forca + ', ' + mun.gain : 'nada'}${loudOK ? '' : ' — NÃO MAIS ALTO'}; o discurso ${ds ? 'de ' + who(p3) : 'CALADO'}, o viva do salão ${vv ? `de ${vv.n} (#${vv.de.v} à frente)` : 'NENHUM'}, ${lone} grito(s) solto(s) deles`);
    delete b.festa; if (f0) b.festa = f0; undo();
    // ---- b the drink: the slurred voice and the hiccup only of who drank (v.ebrio), the song out of tune, the drink thrown and who gets it,
    // the faint and the dragging on the plan's floor
    put(p1, 'sittalk', { ebrio: 1.2 }); put(p2, 'sittalk', { ebrio: 0 });
    const cb = scene(earIn(b), 's16 bebida'); const v1 = of(cb, p1), v2 = of(cb, p2);
    // (the other's own drink of the night — G.Atmos.drunk — is still his: slurred only from 0,5, the hiccup from 0,8)
    const e2 = A.ebrioDe(p2); const slurOK = v1.some(f => f.s === 'vozBebado') && v1.some(f => f.tipo === 'soluco' && f.s === 'hiccup') && v2.some(f => f.s === 'vozBebado') === (e2 >= 0.5 && v2.some(f => f.s === 'vozBebado' || f.s === 'voz')) && v2.some(f => f.tipo === 'soluco') === (e2 >= A.SOLUCO);
    put(p1, 'cantoria'); put(p3, 'jogar-bebida'); put(p4, 'molhado'); put(p2, 'desmaio');
    const cd = scene(earIn(b), 's16 bebedeira'); const can = of(cd, p1).find(f => f.s === 'cantoria'), jb = of(cd, p3).find(f => f.s === 'jogarBebida'), mo = of(cd, p4).find(f => f.s === 'molhado'), dm = of(cd, p2).find(f => f.s === 'desmaio');
    const fl = A.PASSO[A.chaoDe(b, A.ondeDe(p2)[2])];
    const fac = G.Fac.ofV(p1); const want = A.musicOf(fac ? fac.civ : null, fac && fac.tech ? fac.tech.known : null).notas;
    const drunkOK = !!can && JSON.stringify(can.notas) === JSON.stringify(want) && can.ebrio >= 1.2 && !!jb && ['barro', 'madeira', 'metal'].includes(jb.mat) && !!mo && !!dm && dm.piso === fl;
    undo(); put(p3, 'arrastar'); put(p2, 'arrastado');
    const ca = scene(earIn(b), 's16 arrastar'); const ar = of(ca, p3).find(f => f.s === 'arrastar'); const quiet = of(ca, p2).length === 0;
    ok('s16b a-bebedeira', slurOK && drunkOK && !!ar && ar.piso === A.PASSO[A.chaoDe(b, A.ondeDe(p3)[2])] && quiet,
      `${who(p1)} com 1,2 de bebida: ${v1.map(f => f.s).join(', ')}; ${who(p2)} sem bebida: ${v2.map(f => f.s).join(', ') || 'calado'}; a cantoria ${can ? 'na escada do povo dele (' + (fac ? fac.civ : '?') + ')' : 'CALADA'}, a bebida jogada ${jb ? 'na caneca de ' + jb.mat : 'CALADA'}, o molhado ${mo ? 'grita' : 'CALADO'}, o desmaio ${dm ? 'no chão de ' + dm.piso + ' (o da planta: ' + fl + ')' : 'CALADO'}, o arrastar ${ar ? 'no chão de ' + ar.piso : 'CALADO'}, o arrastado ${quiet ? 'calado' : 'SOA'}`);
    undo();
    // ---- c the context: the bar on the door, the door forced (and its state with it), who hides (heard only near), the mourners hushing
    // the talk, the storm on the roof
    put(p1, 'trancar'); put(p2, 'esconder'); put(p3, 'mourn'); put(p4, 'mourn');
    // (who hides is heard only beside: the ear at the next place)
    const beside = v => { const [x, y] = A.ondeDe(v); return earAt(x + 0.1, y, { inside: b.id }); };
    const ct = scene(earIn(b), 's16 contexto'); const tr = of(ct, p1).find(f => f.s === 'tranca'); const esc = of(scene(beside(p2), 's16 escondido'), p2).find(f => f.s === 'respiro');
    const far = of(scene(earAt(b.x + (b.w || 1) / 2 + 3, b.y + (b.h || 1) / 2), 's16 de fora'), p2).length;
    const mt = ct.fontes.find(f => f.s === 'murmur' && f.de.b === b.id);
    const lutoOK = !mt || mt.luto > 0; // (two mourners of the room: if any talk is left, it is hushed)
    undo();
    const out = [...S.villagers.values()].filter(v => !v.inside && !v.sleeping && free(v)).sort((a, c) => a.id - c.id)[0];
    const pl = In.plan(b); const e = pl.entrance; const st0 = In.doorState(b, e.door);
    let forc = null; if (out) { put(out, 'arrombar', { x: b.x + e.out[0] / 4, y: b.y + e.out[1] / 4 }); forc = of(scene(earAt(b.x + e.out[0] / 4 + 1, b.y + e.out[1] / 4), 's16 arrombar'), out).find(f => f.s === 'arrombar'); }
    const w0 = { rain: S.weather.rain, storm: S.weather.storm }; S.weather.rain = 1; S.weather.storm = 1; let rs = null;
    try { rs = scene(earIn(b), 's16 tempestade').fontes.find(f => f.tipo === 'chuva' && f.de.b === b.id); } finally { S.weather.rain = w0.rain; S.weather.storm = w0.storm; }
    ok('s16c o-contexto', !!tr && !!esc && far === 0 && lutoOK && !!forc && forc.alvo === b.id && forc.porta === (st0 ? st0.state : 'fechada') && !!rs && rs.tempestade === 1,
      `a tranca ${tr ? 'de ' + who(p1) : 'CALADA'}; quem se esconde ${esc ? 'respira, de perto' : 'CALADO'} e de três casas fora ${far ? 'SE OUVE' : 'não se ouve'}; dois de luto: ${mt ? 'a conversa abafada (luto ' + mt.luto + ')' : 'a sala calada'}; o arrombar ${forc ? `de ${who(out)} na porta de #${forc.alvo}, a porta ${forc.porta}` : 'CALADO'}; a tempestade no telhado ${rs ? (rs.tempestade ? 'com o vento' : 'SEM O VENTO') : 'CALADA'}`);
    undo();
    // ---- d the trades and the games: the paddle in the vat (boiling where a batch is at the fire), the cooking, the dice and the cards in
    // the material in the hand, the arm wrestle with its slam at the end, the cheat next to nothing, the match and its crowd
    put(p1, 'mexer-cuba'); put(p2, 'cozinhar'); put(p3, 'jogo-dados'); put(p4, 'jogo-cartas');
    const cj = scene(earIn(b), 's16 jogos'); const cu = of(cj, p1).find(f => f.s === 'cuba'), co = of(cj, p2).find(f => f.s === 'cook'), da = of(cj, p3).find(f => f.s === 'dados'), cr = of(cj, p4).find(f => f.s === 'cartas');
    const boil = G.Oficio.batches(b).some(op => { const s0 = G.Oficio.stage(op); return s0 && s0.kind === 'fogo' && op.data && op.data.calor > 0; }) ? 1 : 0;
    put(p1, 'queda-de-braco'); put(p2, 'trapaca'); put(p3, 'torcer'); put(p4, 'torcer');
    const cq = scene(earIn(b), 's16 braco'); const qb = of(cq, p1).find(f => f.s === 'bracoForca'); const tp = of(scene(beside(p2), 's16 trapaca'), p2).find(f => f.s === 'trapaca'); const tc = cq.fontes.find(f => f.tipo === 'coro' && f.s === 'torcida' && f.de.b === b.id);
    const tpFar = of(scene(earAt(b.x + (b.w || 1) / 2 + 3, b.y + (b.h || 1) / 2), 's16 trapaca de fora'), p2).length;
    ok('s16d a-cadeia-e-os-jogos', !!cu && cu.ferve === boil && !!co && !!da && !!cr && ['osso', 'madeira'].includes(da.mat) && !!cr.mat && !!qb && qb.fim === 'bracoBate' && !!tp && tpFar === 0 && !!tc && tc.n === 2,
      `a cuba ${cu ? (cu.ferve ? 'fervendo (a fornada no fogo)' : 'sem fervura (nenhuma fornada no fogo)') : 'CALADA'}, o cozinhar ${co ? 'soa' : 'CALADO'}; os dados ${da ? 'de ' + da.mat : 'CALADOS'}, as cartas ${cr ? 'de ' + cr.mat : 'CALADAS'}; a queda de braço ${qb ? 'com o baque no fim (' + qb.fim + ')' : 'CALADA'}; a trapaça ${tp ? 'quase nada' : 'CALADA'}, de fora ${tpFar ? 'SE OUVE' : 'nada'}; a torcida ${tc ? 'de ' + tc.n : 'NENHUMA'}`);
    undo();
    // ---- e the player (an audio context that plays nothing, FakeAC): the door's crash the moment its state turns to broken — once, of
    // who forces it —, the band's notes of each of its two, and the slam when the arm wrestle ends
    if (!FakeAC.last) { global.AudioContext = FakeAC; G.Audio.init(); }
    const sp0 = G.speed; const keepAmb = [A.mute, A.ambOn, A.sfxOn]; A.mute = false; A.ambOn = true; A.sfxOn = true; A.gravar = true; A.tocou.length = 0;
    const scene0 = A.scene; let look = 0, crash = 0, band = new Set(), slam = 0;
    try {
      G.speed = 1; const ear = earAt(b.x + e.out[0] / 4 + 1, b.y + e.out[1] / 4); A.ouvido = ear;
      if (out) put(out, 'arrombar', { x: b.x + e.out[0] / 4, y: b.y + e.out[1] / 4 });
      A.scene = function (er) { const c = scene0.call(A, er); look++; if (c && out) for (const f of c.fontes) if (f.de && f.de.v === out.id && f.s === 'arrombar') f.porta = look >= 4 ? 'arrombada' : 'fechada'; return c; };
      for (let k = 0; k < 10; k++) { FakeAC.last.currentTime += 0.3; A.update(0.3); }
      crash = A.tocou.filter(x => x.s === 'portaCede' && x.de && x.de.v === (out && out.id)).length;
      A.scene = scene0; undo(); A.tocou.length = 0;
      // (the band: the two of the feast, heard from within the room)
      A.ouvido = earIn(b); const f1 = b.festa; b.festa = { motivo: 'prova', dia: S.day, ate: S.day, bardos: [p2.id, p1.id] }; put(p1, 'play'); put(p2, 'play');
      for (let k = 0; k < 14; k++) { FakeAC.last.currentTime += 0.3; A.update(0.3); }
      for (const x of A.tocou) if (['lira', 'tambor', 'canto'].includes(x.s) && x.de) band.add(x.de.v);
      delete b.festa; if (f1) b.festa = f1; undo(); A.tocou.length = 0;
      // (the arm wrestle for a few looks, then over: the slam)
      put(p3, 'queda-de-braco'); for (let k = 0; k < 4; k++) { FakeAC.last.currentTime += 0.3; A.update(0.3); } undo();
      for (let k = 0; k < 3; k++) { FakeAC.last.currentTime += 0.3; A.update(0.3); }
      slam = A.tocou.filter(x => x.s === 'bracoBate' && x.de && x.de.v === p3.id).length;
    } finally { A.scene = scene0; undo(); G.speed = sp0; A.ouvido = null; A.gravar = false; [A.mute, A.ambOn, A.sfxOn] = keepAmb; }
    ok('s16e o-tocador', (!out || crash === 1) && band.has(p1.id) && band.has(p2.id) && slam === 1,
      `a porta que cede: ${out ? crash + ' estrondo(s), na hora em que a porta virou arrombada, de ' + who(out) : '(ninguém na rua para forçá-la)'}; a banda: notas de ${[...band].map(id => '#' + id).join(' e ') || 'NINGUÉM'}; o baque da queda de braço quando ela acaba: ${slam}`);
    // ---- f the screen's door: every name of the list rings (nodes made), each a sound of no place; an unknown name rings nothing; the
    // switch of the effects is obeyed; the dice of bone and of wood both
    const mk = () => FakeAC.last.made; const keep2 = [A.mute, A.sfxOn]; A.mute = false; A.sfxOn = true; const rows = []; let good = true;
    try {
      // (and the feast of the tables, the front F — D-950 to D-959: each moment of a game, each a sound with nodes, with and without what it is given)
      const LISTA = ['dados-copo', 'dados-rolar', 'dados-parar', 'cartas-embaralhar', 'cartas-dar', 'cartas-jogar', 'cartas-virar', 'aposta', 'vitoria', 'derrota',
        'pouso', 'suspense', 'rodada-ganha', 'rodada-perdida', 'rodada-empate', 'gloria-tique', 'moeda-bolsa', 'vitoria-fanfarra', 'aplauso', 'derrota-suave', 'cravou', 'dado-voa', 'tensao', 'dado-conta'];
      for (const n of LISTA) { FakeAC.last.currentTime += 0.5; const m0 = mk(); const r = A.ui(n); const d = mk() - m0; if (!r || d <= 0) good = false; rows.push(`${n} ${d}`); }
      for (const [n, o] of [['rodada-ganha', { n: 3 }], ['moeda-bolsa', { i: 4, ultima: 1 }], ['aplauso', { n: 9, povo: 'asteca' }], ['cravou', { n: 3, mat: 'osso', povo: 'grego' }], ['tensao', { n: 2 }], ['dado-conta', { i: 12, mat: 'madeira' }], ['gloria-tique', { i: 30 }]]) { FakeAC.last.currentTime += 0.5; const m0 = mk(); const r = A.ui(n, o); if (!r || mk() - m0 <= 0) { good = false; rows.push(`${n} com ${JSON.stringify(o)} CALADO`); } }
      FakeAC.last.currentTime += 0.5; const bone = mk(); const rb = A.ui('dados-rolar', 'osso'); const nb = mk() - bone; FakeAC.last.currentTime += 0.5; const wood = mk(); const rw = A.ui('dados-rolar', { mat: 'madeira', n: 3 }); const nw = mk() - wood;
      const none = A.ui('nada-disso'); A.sfxOn = false; FakeAC.last.currentTime += 0.5; const off = A.ui('aposta');
      const fora = A.UI.filter(n => !LISTA.includes(n)); good = good && rb && rw && nb > 0 && nw > nb && none === false && off === false && A.UI.length === LISTA.length && !fora.length;
      ok('s16f a-porta-da-tela', good, `${rows.join(', ')} (nós de som); os dados de osso ${nb}, de madeira com três ${nw}; um nome que não há: ${none ? 'TOCA' : 'nada'}; com os efeitos desligados: ${off ? 'TOCA' : 'nada'}; ${A.UI.length} sons na tabela${fora.length ? ', FORA DA LISTA DA PROVA: ' + fora.join(', ') : ''}`);
    } finally { [A.mute, A.sfxOn] = keep2; }
  } finally { undo(); }
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
if (on('s15')) s15();
if (on('s16')) s16();
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
