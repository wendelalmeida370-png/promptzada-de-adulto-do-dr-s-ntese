// cartas: as Tabuletas (a quarta onda da taverna, T5 — D-860 a D-869), a prova rápida, em Node.
//  c1 a regra pura: o mesmo embaralhar para a mesma partida, a mão e o monte, cada poder no seu caso (o golpe, o raio, a trapaça, a
//     égide, a pesagem, a justiça, a maré, o renascer, o furto, o devorar, a visão, o presságio, a maldição, o sacrifício, a fúria, a
//     legião, o bando, a grandeza, a oferenda, o firme), o empate que guarda a oferenda, o dobrar, o fim; e puro — sem o mundo, sem acaso
//  c2 o equilíbrio: mil partidas entre cada par de povos (e cada povo contra si), as inteligências de índoles variadas — nenhum povo
//     ganha muito mais que os outros, nenhum par sai do prumo, nenhuma tabuleta vence quase sempre, a partida tem as sete rodadas
//  c3 a arte: cada tabuleta das 120 com a sua figura, o seu verso, nenhum número que não é número
//  c4 os fregueses jogando numa noite (a metrópole pronta): as partidas começam pela índole, as rodadas pelo passo do mundo, quem
//     joga mostra o ato e tem o baralho da casa na mão, do material do povo; o livro equilibrado — o que entrou nos potes saiu deles —, e
//     nenhum pote sem dono depois
//  c5 um save no meio de uma partida: as partidas voltam como eram, e o mesmo save carregado duas vezes vive o mesmo futuro
//  c6 o mundo sem o corpo igual: a mesma noite vivida duas vezes do mesmo retrato dá as mesmas partidas, os mesmos lances, o mesmo livro
//  c7 o corpo à mesa (pelas mãos: G.Possess.apply): o desafio com aposta, os lances, o dobrar, a manga (e quem a vê), o fim; o livro
//  c8 o trapaceiro e o torneio: quem esconde uma na manga e quem o pega (o pote ao enganado, o laço), e a porta do torneio da festa
//  e nenhum erro de módulo nem aviso no console.
//   node qa/cartas.js [mundo]      (≈ 1 min)      ONLY=c1,c2 para só algumas partes
// (o corpo à mesa — c7 — pede o 3D do corpo: a planta, o assento pelo verbo «lugar», as mãos; os mesmos arquivos do qa/taverna-corpo.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js'] });
const fs = require('fs'), path = require('path'), vm = require('vm');
const C = G.Cartas, D = G.Depot, A = G.Act;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cartas ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const world = process.argv[2] || 'metropole';
const S = () => G.S;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };

// ---------------- c1 a regra pura ----------------
if (on('c1')) {
  const bad = [], said = [];
  // (pura: nenhuma chamada ao acaso do mundo nem ao do que se vê, nem ao mundo)
  const R0 = [G.R, G.rr, G.ri, G.pick, G.chance, G.shuffle, G.VR, Math.random]; const boom = () => { throw new Error('acaso!'); };
  G.R = G.rr = G.ri = G.pick = G.chance = G.shuffle = G.VR = Math.random = boom; const S0 = G.S; G.S = null;
  let a, b; try { a = C.simula({ id: 5, seed: 77, civ: ['nordico', 'grego'], dobrar: false, ind: [{ ousado: 0.2 }, { ousado: 0.9 }] }); b = C.simula({ id: 5, seed: 77, civ: ['nordico', 'grego'], dobrar: false, ind: [{ ousado: 0.2 }, { ousado: 0.9 }] }); } catch (e) { bad.push('a regra tirou do acaso ou do mundo: ' + e.message); }
  [G.R, G.rr, G.ri, G.pick, G.chance, G.shuffle, G.VR, Math.random] = R0; G.S = S0;
  if (a && b && JSON.stringify(a) !== JSON.stringify(b)) bad.push('a mesma partida jogada duas vezes deu outra');
  if (a) said.push(`uma partida nórdica × grega: ${a.hist.length} rodadas, ${a.p[0].gl} a ${a.p[1].gl} (${a.fim.por})`);
  // (o embaralhar: a mesma semente, o mesmo baralho; outra semente, outro; as 20 de cada um, cinco na mão)
  const n1 = C.nova({ id: 1, seed: 9, civ: ['asteca', 'egipcio'] }), n2 = C.nova({ id: 1, seed: 9, civ: ['asteca', 'egipcio'] }), n3 = C.nova({ id: 1, seed: 10, civ: ['asteca', 'egipcio'] });
  if (JSON.stringify(n1.p) !== JSON.stringify(n2.p)) bad.push('a mesma semente deu outro baralho'); if (JSON.stringify(n1.p) === JSON.stringify(n3.p)) bad.push('outra semente deu o mesmo baralho');
  for (const q of n1.p) if (q.mao.length !== 5 || q.mao.length + q.monte.length !== 20 || new Set(q.mao.concat(q.monte)).size !== 20) bad.push('a mão e o monte não são as 20 tabuletas, cinco na mão');
  for (const p of C.POVOS) { const L = C.DECKS[p]; const r = {}; for (const c of L) r[c.rar] = (r[c.rar] || 0) + 1; if (L.length < 18 || L.length > 24 || r.unica !== 1 || !r.lendaria || !r.rara || !r.incomum || !r.comum) bad.push(`${p}: ${L.length} tabuletas, raridades ${JSON.stringify(r)}`); for (const c of L) if (c.p && !C.PODER[c.p]) bad.push(`${c.id}: poder ${c.p} desconhecido`); }
  // (cada poder no seu caso: duas tabuletas e o contexto, a força final e quem vence)
  const card = id => C.card(id); const X = (o) => Object.assign({ perdeu: 0, venc: 0, heroi: false, fraca: -1, bonus: 0, mal: 0 }, o || {});
  const duel = (a1, b1, xa, xb, of) => C.duelo(card(a1), card(b1), X(xa), X(xb), of || 1);
  const want = (name, d, w, fa, fb) => { if (d.w !== w || (fa !== undefined && d.fa !== fa) || (fb !== undefined && d.fb !== fb)) bad.push(`${name}: venceu ${d.w} (${d.fa} × ${d.fb}), esperado ${w}${fa !== undefined ? ` (${fa} × ${fb})` : ''}`); };
  want('golpe (Thor 7, golpe 2, contra o Jötunn 6)', duel('nordico.thor', 'nordico.jotunn'), 0, 7, 4);
  want('raio (Zeus 9 contra Rá 8: não é mais forte, nada)', duel('grego.zeus', 'egipcio.ra'), 0, 9, 8);
  want('raio contra o mais forte (Júpiter 9 contra Rá 10 na rodada de 3)', duel('romano.jupiter', 'egipcio.ra', null, null, 3), 0, 9, 6);
  want('trapaça (Loki 1 contra Zeus 9: trocam)', duel('nordico.loki', 'grego.zeus'), 0, 9, 1);
  want('égide cala o raio (Atena 5 contra Zeus 9)', duel('grego.atena', 'grego.zeus'), 1, 5, 9);
  want('égide cala a trapaça (Heimdall 5 contra Loki 1)', duel('nordico.heimdall', 'nordico.loki'), 0, 5, 1);
  want('pesagem (Anúbis 5 contra Odin 9: empata)', duel('egipcio.anubis', 'nordico.odin'), -1);
  want('justiça vence o empate (Esfinge 5 contra Tyr 5)', duel('egipcio.esfinge', 'nordico.tyr'), 0);
  want('a égide cala a justiça (Esfinge 5 contra Heimdall 5: empate)', duel('egipcio.esfinge', 'nordico.heimdall'), -1);
  want('justiça vence a pesagem (Esfinge 5 contra Chalchiuhtlicue 4: a pesagem empata, a justiça leva)', duel('egipcio.esfinge', 'asteca.chalchiuhtlicue'), 0);
  { const d = duel('grego.poseidon', 'nordico.jotunn'); if (d.mult !== 2) bad.push('maré: a rodada não dobrou'); }
  want('fúria (Berserker 3 +3 depois de perder, contra Jötunn 6: empate)', duel('nordico.berserker', 'nordico.jotunn', { perdeu: 1 }), -1, 6, 6);
  want('legião (Marte 6 +3 com três vitórias, contra Odin 9)', duel('romano.marte', 'nordico.odin', { venc: 4 }), -1, 9, 9);
  want('bando (Héracles 5 +2 com outro herói, contra o Minotauro 5)', duel('grego.heracles', 'grego.minotauro', { heroi: true }), 0, 7, 5);
  want('grandeza (Jörmungandr 5 +3 na rodada de 3, contra o Jötunn 6)', duel('nordico.jormungandr', 'nordico.jotunn', null, null, 3), 0, 8, 6);
  want('grandeza sem a rodada grande, e o golpe de Thor (Jörmungandr 5 contra Thor 7)', duel('nordico.jormungandr', 'nordico.thor', null, null, 1), 1, 3, 7);
  want('sacrifício (Xipe Tótec 4 + a mais fraca, 3, contra Zeus 9)', duel('asteca.xipe', 'grego.zeus', { fraca: 3 }), 1);
  want('firme (Aquiles 4 contra Medusa 4 e o golpe 3)', duel('grego.aquiles', 'grego.medusa'), -1, 4, 4);
  want('presságio da rodada de antes (Jötunn 6 +3 contra Odin 9: empate)', duel('nordico.jotunn', 'nordico.odin', { bonus: 3 }), -1, 9, 9);
  want('maldição da rodada de antes (Odin 9 −2 contra o Minotauro 5... e o firme a ignora)', duel('nordico.odin', 'grego.aquiles', { mal: 2 }, { mal: 2 }), 0, 7, 4);
  // (a rodada inteira: o empate guarda a oferenda, o renascer volta à mão, o furto e o devorar tiram da mão, a visão manda mostrar)
  const forca = (s, i, ids) => { s.p[i].mao = ids.slice(); };
  { const s = C.nova({ id: 2, seed: 3, civ: ['egipcio', 'nordico'] }); forca(s, 0, ['egipcio.anubis', 'egipcio.carro']); forca(s, 1, ['nordico.odin', 'nordico.jotunn']); C.joga(s, 0, 'egipcio.anubis'); C.joga(s, 1, 'nordico.odin'); const r = C.resolve(s);
    if (r.w !== -1 || s.altar !== 1) bad.push(`o empate não guardou a oferenda no altar (altar ${s.altar})`); if (s.vis !== 0) bad.push('a visão de Odin não mandou o outro mostrar primeiro');
    C.abre(s); if (C.vez(s) !== 0) bad.push('quem é visto não escolhe primeiro'); C.joga(s, 0, 'egipcio.carro'); if (C.vista(s, 1) !== 'egipcio.carro') bad.push('a tabuleta mostrada não está à vista');
    C.joga(s, 1, 'nordico.jotunn'); const r2 = C.resolve(s); if (r2.w !== 1 || r2.ganho !== 2 || s.p[1].gl !== 2) bad.push(`a oferenda guardada não se somou (ganho ${r2.ganho})`); said.push('o empate guarda, a visão manda mostrar'); }
  { const s = C.nova({ id: 3, seed: 3, civ: ['asteca', 'grego'] }); forca(s, 0, ['asteca.quetzalcoatl', 'asteca.xolotl']); forca(s, 1, ['grego.loki' in {} ? '' : 'grego.hermes', 'grego.zeus', 'grego.ciclope']); C.joga(s, 0, 'asteca.quetzalcoatl'); C.joga(s, 1, 'grego.hermes'); const r = C.resolve(s);
    if (r.w !== 1 || !s.p[0].mao.includes('asteca.quetzalcoatl')) bad.push('Quetzalcóatl vencido não renasceu na mão'); }
  { const s = C.nova({ id: 4, seed: 3, civ: ['grego', 'nordico'] }); forca(s, 0, ['grego.hades', 'grego.hoplita']); forca(s, 1, ['nordico.draugr', 'nordico.odin', 'nordico.runas']); C.joga(s, 0, 'grego.hades'); C.joga(s, 1, 'nordico.draugr'); C.resolve(s);
    if (!s.p[0].mao.includes('nordico.odin') || s.p[1].mao.includes('nordico.odin')) bad.push('o furto de Hades não tomou a melhor da mão do outro'); }
  { const s = C.nova({ id: 6, seed: 3, civ: ['classico', 'nordico'] }); forca(s, 0, ['classico.cronos', 'classico.eos']); forca(s, 1, ['nordico.draugr', 'nordico.odin']); C.joga(s, 0, 'classico.cronos'); C.joga(s, 1, 'nordico.draugr'); C.resolve(s);
    if (s.p[1].mao.includes('nordico.odin') || !s.p[1].desc.includes('nordico.odin')) bad.push('Cronos não devorou a melhor da mão do outro'); }
  // (dobrar: aceito, a aposta dobra; recusado, quem dobrou vence)
  { const s = C.nova({ id: 7, seed: 1, civ: ['romano', 'grego'], aposta: 0.1 }); if (!C.dobra(s, 0) || !C.responde(s, 1, true) || s.x !== 2) bad.push('dobrar aceito não dobrou'); if (C.dobra(s, 0)) bad.push('dobrou duas vezes');
    const s2 = C.nova({ id: 8, seed: 1, civ: ['romano', 'grego'], aposta: 0.1 }); C.dobra(s2, 1); C.responde(s2, 0, false); if (!s2.fim || s2.fim.w !== 1) bad.push('dobrar recusado não deu a vitória a quem dobrou'); }
  // (a manga: a tabuleta jogada troca pela melhor do monte)
  { const s = C.nova({ id: 9, seed: 4, civ: ['nordico', 'grego'] }); const id = s.p[0].mao[0]; C.joga(s, 0, id); const t = C.manga(s, 0); if (!t || t.de !== id || s.lance[0] !== t.por || !s.p[0].monte.includes(id)) bad.push('a manga não trocou pela melhor do monte'); }
  ok('c1 a regra pura', !bad.length, `${said.join('; ')}; cada poder no seu caso, o dobrar, a manga${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}`);
}

// ---------------- c2 o equilíbrio ----------------
if (on('c2')) {
  const P = C.POVOS; const N = +(process.env.N || 1000); const win = {}, pares = []; const cw = {}, cn = {}; let draws = 0, games = 0, rounds = 0;
  for (let ia = 0; ia < P.length; ia++) for (let ib = ia; ib < P.length; ib++) { const a = P[ia], b = P[ib]; let wa = 0, wb = 0;
    for (let g = 0; g < N; g++) { const sw = g % 2; const civ = sw ? [b, a] : [a, b];
      const s = C.simula({ id: g + 1, seed: g * 7919 + ia * 101 + ib * 13 + 1, civ, dobrar: true, aposta: 1, ind: [{ ousado: (g * 37 % 100) / 100 }, { ousado: (g * 53 % 100) / 100 }] });
      games++; rounds += s.hist.filter(h => h.c).length; const w = s.fim.w; if (w < 0) draws++; else if (a === b) { if (w === 0) wa++; else wb++; } else if (civ[w] === a) wa++; else wb++;
      for (const h of s.hist) if (h.c) for (const i of [0, 1]) { cn[h.c[i]] = (cn[h.c[i]] || 0) + 1; if (h.w === i) cw[h.c[i]] = (cw[h.c[i]] || 0) + 1; } }
    if (a !== b) { const pa = wa / (wa + wb); win[a] = (win[a] || 0) + pa / 5; win[b] = (win[b] || 0) + (1 - pa) / 5; pares.push([a + '×' + b, pa]); } else pares.push([a + '×' + a, wa / (wa + wb)]); }
  const bad = [];
  for (const p of P) if (!(win[p] >= 0.46 && win[p] <= 0.54)) bad.push(`${p} ganha ${(win[p] * 100).toFixed(1)}%`);
  for (const [k, pa] of pares) if (!(pa >= 0.41 && pa <= 0.59)) bad.push(`${k}: ${(pa * 100).toFixed(1)}%`);
  const top = Object.keys(cn).map(id => [id, (cw[id] || 0) / cn[id], cn[id]]).sort((x, y) => y[1] - x[1]);
  for (const [id, r, n] of top) if (n > 200 && r > 0.82) bad.push(`${id} vence ${(r * 100).toFixed(0)}% das vezes`);
  if (draws / games > 0.15) bad.push(`empates demais: ${(draws / games * 100).toFixed(1)}%`); if (rounds / games < 6) bad.push(`partidas curtas: ${(rounds / games).toFixed(1)} rodadas`);
  ok('c2 o equilíbrio', !bad.length, `${games} partidas (${N} por par, com o dobrar): ${P.map(p => `${p} ${(win[p] * 100).toFixed(1)}%`).join(', ')}; o par mais torto ${pares.slice().sort((x, y) => Math.abs(y[1] - 0.5) - Math.abs(x[1] - 0.5))[0].map((x, i) => i ? (x * 100).toFixed(1) + '%' : x).join(' ')}; a tabuleta que mais vence ${top[0][0]} ${(top[0][1] * 100).toFixed(0)}%; ${(draws / games * 100).toFixed(1)}% de empates; ${(rounds / games).toFixed(2)} rodadas${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}`);
}

// ---------------- c3 a arte ----------------
if (on('c3')) {
  const bad = []; M.run('js/cartas-arte.js'); const Ar = G.CartasArte; let tot = 0;
  for (const e of Ar.check()) bad.push(e);
  for (const c of C.all()) { const s = Ar.face(c.id); tot += s.length; if (!/^<svg[^>]*class="ct-art"/.test(s) || !s.endsWith('</svg>')) bad.push(c.id + ': o SVG não fecha'); if (/NaN|undefined|Infinity/.test(s)) bad.push(c.id + ': número que não é número'); if ((s.match(/<g[\s>]/g) || []).length !== (s.match(/<\/g>/g) || []).length) bad.push(c.id + ': <g> sem fechar');
    const h = Ar.html(c.id); if (!h.includes(c.nome.replace(/&/g, '&amp;')) || !h.includes(`ct-r-${c.rar}`)) bad.push(c.id + ': o HTML sem o nome ou a raridade'); }
  for (const p of C.POVOS) { const v = Ar.verso(p); if (!v.includes('TABULETAS') || /NaN|undefined/.test(v)) bad.push(p + ': o verso'); }
  for (const k of Object.keys(C.PODER).concat(Object.keys(C.TIPO_NOME))) if (!Ar.ICONE[k]) bad.push(`o símbolo de «${k}»`);
  ok('c3 a arte', !bad.length, `${C.all().length} tabuletas, cada uma com a sua figura (${Math.round(tot / C.all().length / 1024)} kB em média), seis versos, os símbolos de cada poder e tipo${bad.length ? ' — FALHOU: ' + bad.slice(0, 8).join(' | ') : ''}`);
}

// ---------------- o mundo ----------------
const NEEDW = ['c4', 'c5', 'c6', 'c7', 'c8'].some(on);
const lines = []; D.onMove.push(e => { if (e[5] === 'moedas' && (String(e[3]).startsWith('u:') || String(e[4]).startsWith('u:'))) lines.push({ from: e[3], to: e[4], n: e[6], c: e[8] }); });
const fp = () => JSON.stringify(S().cartas || null);
// (o livro dos potes conta de cada abertura de um retrato: o que estava nos potes ao abrir é a base)
let BASE = 0; const heldNow = () => { const c = S() && S().cartas; let h = 0; if (c) { for (const k of Object.keys(c.j)) h += c.j[k].cofre || 0; for (const k of Object.keys(c.tor)) h += c.tor[k].cofre || 0; } return h; };
{ const abrir0 = M.abrir; M.abrir = o => { const r = abrir0(o); lines.length = 0; BASE = heldNow(); return r; }; }
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: true }; } };
// (até a noite: as tavernas abertas e cheias)
const toNight = () => { let k = 0; while (!(S().time > 0.6 && S().time < 0.7) && k++ < 4000) { calm(); M.viver(1); } };
const potesVazios = () => { const s = S().cartas; if (!s) return 0; let n = 0; for (const k of Object.keys(s.j)) if (s.j[k].fase === 'fim' && s.j[k].cofre > 1e-6 && S().clock - s.j[k].fimT > C.FIM_T + 2) n++; return n; };
const livro = () => { const bal = {}; for (const l of lines) { if (l.to.startsWith('u:')) bal[l.to] = (bal[l.to] || 0) + l.n; if (l.from.startsWith('u:')) bal[l.from] = (bal[l.from] || 0) - l.n; } let held = 0; const s = S().cartas; if (s) for (const k of Object.keys(s.j)) held += s.j[k].cofre || 0; if (s) for (const k of Object.keys(s.tor)) held += s.tor[k].cofre || 0; const sum = Object.keys(bal).reduce((a, k) => a + bal[k], 0); return { sum: Math.round(sum * 1e4) / 1e4, held: Math.round((held - BASE) * 1e4) / 1e4 }; };
let SNAP = null;
if (NEEDW) { M.pronto(world); M.viver(10); toNight(); }
const SNAP0 = NEEDW ? G.Save.serialize() : null; // (o retrato da noite: o começo de cada parte que vive o mundo)

// ---------------- c4 os fregueses jogando numa noite ----------------
if (on('c4')) {
  const bad = []; const actSeen = new Set(); const held = {}; const decks = {}; let t = 0;
  const n0 = Object.assign({}, (S().cartas && S().cartas.n) || {});
  for (; t < 200; t++) { calm(); M.viver(1);
    for (const v of S().villagers.values()) { if (v.act === 'jogo-cartas' || v.act === 'jogo-cartas-ganha' || ((v.act === 'trapaca' || v.act === 'trapaca-pega') && C.de(v))) { /* (a trapaça dos dados da T4 é a dela) */ actSeen.add(v.id); const h = G.Inv.held(v).mao; const k = h ? h.split('.')[0] : 'nada'; held[k] = (held[k] || 0) + 1; if (h) decks[(G.Fac.get(G.Fac.idOfV(v)) || {}).civ + ':' + h.split('.')[1]] = 1; } }
    if (!SNAP && S().cartas && Object.keys(S().cartas.j).some(k => S().cartas.j[k].fase === 'jogo' && S().cartas.j[k].s.r >= 2)) SNAP = G.Save.serialize(); }
  const n = (S().cartas && S().cartas.n) || {}; const jogos = (n.jogos || 0) - (n0.jogos || 0), rodadas = (n.rodadas || 0) - (n0.rodadas || 0);
  if (jogos < 2) bad.push(`só ${jogos} partidas numa noite`); if (rodadas < 6) bad.push(`só ${rodadas} rodadas`); if (!actSeen.size) bad.push('ninguém mostrou o ato jogo-cartas');
  if (held.nada || !held.baralho) bad.push(`quem joga sem o baralho na mão: ${JSON.stringify(held)}`);
  // (o baralho de cada povo: o material que ele pinta, o primeiro que tem)
  for (const k of Object.keys(decks)) { const [civ, mat] = k.split(':'); const L = G.Itens.dePovo('baralho', civ); if (!L || !L.includes(mat)) bad.push(`o baralho ${mat} de um povo ${civ}`); }
  const L = livro(); if (Math.abs(L.sum - L.held) > 1e-3) bad.push(`o livro dos potes: entraram − saíram ${L.sum}, e há ${L.held} nos potes`);
  if (potesVazios()) bad.push(`${potesVazios()} potes de partidas acabadas ainda com moedas`);
  const ap = lines.filter(l => l.c === 'aposta').length, po = lines.filter(l => l.c === 'pote' || l.c === 'pote-volta').length;
  ok('c4 os fregueses jogando numa noite', !bad.length && M.limpo(), `${jogos} partidas, ${rodadas} rodadas em ${t} s da noite, ${actSeen.size} pessoas no ato, o baralho na mão (${Object.keys(decks).join(', ') || '—'}); ${ap} apostas e ${po} potes pagos pelo livro, ${JSON.stringify(n)}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${M.limpo() ? '' : JSON.stringify(M.erros())}`);
}

// ---------------- c5 um save no meio ----------------
if (on('c5')) {
  const bad = []; if (!SNAP) { M.pronto(world); M.viver(10); toNight(); for (let k = 0; k < 120 && !SNAP; k++) { calm(); M.viver(1); if (S().cartas && Object.keys(S().cartas.j).some(q => S().cartas.j[q].fase === 'jogo' && S().cartas.j[q].s.r >= 2)) SNAP = G.Save.serialize(); } }
  if (!SNAP) bad.push('nenhuma partida viva para salvar no meio');
  else {
    const o = JSON.parse(SNAP); const before = JSON.stringify(o.cartas || null);
    const run = () => { M.abrir(JSON.parse(SNAP)); const at = fp(); for (let k = 0; k < 40; k++) M.viver(1); return [at, fp()]; };
    const [a0, a1] = run(), [b0, b1] = run();
    if (JSON.stringify(JSON.parse(a0)) !== JSON.stringify(JSON.parse(before))) bad.push('as partidas não voltaram como foram salvas');
    if (a1 !== b1) bad.push('o mesmo save carregado duas vezes viveu outro futuro das partidas');
    const vivas = Object.keys(JSON.parse(a0).j).length; if (!vivas) bad.push('o save não trouxe as partidas');
  }
  ok('c5 um save no meio', !bad.length && M.limpo(), `${SNAP ? Object.keys(JSON.parse(SNAP).cartas.j).length + ' partidas no meio, de volta como eram; o mesmo futuro duas vezes' : ''}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}`);
}

// ---------------- c6 o mundo sem o corpo igual ----------------
if (on('c6')) {
  const bad = []; const base = SNAP || SNAP0;
  const run = () => { M.abrir(JSON.parse(base)); M.reseed(99); const L0 = lines.length; for (let k = 0; k < 60; k++) M.viver(1); return [fp(), lines.slice(L0).map(l => l.from + '>' + l.to + ':' + l.n + ':' + l.c).join('|')]; };
  const [a, la] = run(), [b, lb] = run();
  if (a !== b) bad.push('as partidas da mesma noite saíram outras'); if (la !== lb) bad.push('o livro dos potes saiu outro');
  ok('c6 o mundo sem o corpo igual', !bad.length && M.limpo(), `a mesma noite duas vezes do mesmo retrato: as mesmas partidas e o mesmo livro (${la.split('|').filter(Boolean).length} linhas)${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''}`);
}

// ---------------- c7 o corpo à mesa ----------------
// (sentar o corpo numa mesa com companhia, pelo verbo «lugar» — como o qa/taverna-corpo.js —, e jogar pelas mãos)
const TL = () => G.Space.TILE; const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const fast = () => { G.debug.step(0.1); G.Avatar.frame(RDT); };
const until = (f, sec) => { const t0 = S().clock; while (!f() && S().clock - t0 < sec) fast(); return f(); };
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
function seatIn(b, v, pick) {
  const In = G.Interiors, Po = G.Possess, I = G.Interact;
  const p = G.Space.planNow(b); if (!p || !p.entrance) return { why: 'sem planta' };
  const lv = p.entryLv || 0; const ex = p.entrance.x, ez = p.entrance.z;
  const pls = In.freeNear(b, lv, ex, ez, 40, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity && (!pick || pick(q)));
  if (!pls.length) return { why: 'nenhum assento livre à mesa de alguém' };
  const pl = pls[0]; pl.at = In.standFor(b, pl, pl.x, pl.z);
  if (!Po.is(v)) { G.Vg.endTask(v); v.path = null; if (!Po.take(v).ok) return { why: 'não encarnou' }; } else G.Avatar.detach();
  v.inside = b.id; v.x = b.x + pl.at[0] / TL(); v.y = b.y + pl.at[1] / TL(); Po.setLevel(pl.lv); G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  const st = G.Avatar.state(); let best = null;
  for (let k = 0; k < 60 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL() + pl.z - st.Z, b.x * TL() + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = I.best(); frame(); }
  if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? '«' + best.label + '»' : 'nada'}` };
  I.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
  const u = Po.useOf(); return { ok: !!u && u.b === b.id };
}
if (on('c7')) {
  const bad = [], said = []; M.abrir(JSON.parse(SNAP || SNAP0)); G.Main.mode = 'game'; calm(); const Po = G.Possess, T = G.Taverna;
  // (uma taverna aberta com uma mesa de gente, e alguém do povo dela, com moedas, para o deus viver)
  let pick = null;
  for (const op of A.all().filter(o => o.def === 'taverna' && A.live(o)).sort((a, b) => a.id - b.id)) { const b = S().buildings.get(op.at); if (!b || !T.aberta(b) || !G.Interiors.has(b)) continue; const fid = G.Village.facOfSet(b.set); const kp = T.keeperOf(b);
    const gs = new Set(Object.keys(op.data.mesa).map(id => op.data.mesa[id]).filter(m => m.st >= 2 && m.g && !m.corpo).map(m => String(m.g))); if (!gs.size) continue;
    const v = [...S().villagers.values()].filter(o => o !== kp && o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && G.Fac.idOfV(o) === fid && Po.can(o).ok && D.get(G.Eco.coinRef(o), 'moedas') >= 1).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
    if (v) { pick = { b, v, gs }; break; } }
  if (!pick) bad.push('nenhuma taverna com uma mesa de gente e um corpo com moedas');
  else {
    const r = seatIn(pick.b, pick.v, q => pick.gs.has(String(G.Interiors.groupOf(pick.b, q.it.id)))); const body = pick.v;
    if (!r.ok) bad.push('o corpo não sentou: ' + (r.why || ''));
    else {
      const ask = fn => { const it = Po.apply(fn); until(() => !!it.res, 2); return it.res || { ok: false, why: 'sem resposta' }; };
      until(() => C.podeCorpo(body).ok, 30);
      const pc = C.podeCorpo(body); said.push(`sentado: ${pc.ok ? `pode, com ${pc.todos.length} à mesa, o baralho ${pc.baralho}` : pc.why}`);
      if (!pc.ok) { const op = T.dia(S().buildings.get(body.inside)); const d = op && op.data; const me = d && d.mesa[body.id]; said.push(`a mesa do corpo: ${JSON.stringify(me && { g: me.g, seat: me.seat, corpo: me.corpo })}; os outros: ${d ? Object.keys(d.mesa).filter(id => +id !== body.id).map(id => `${id}:${d.mesa[id].g}/${d.mesa[id].st}${C.vivoDe(S().villagers.get(+id)) ? '*' : ''}`).join(' ') : ''}`); }
      if (!pc.ok) bad.push('o corpo sentado com companhia não pode jogar: ' + pc.why);
      else {
        const coin0 = D.get(G.Eco.coinRef(body), 'moedas');
        if (C.desafia(body, pc.o, 0).ok) bad.push('o desafio aceito fora do passo do mundo');
        const ap = pc.apostas.length > 1 ? pc.apostas[1] : 0;
        const d = ask(w => C.desafia(w, pc.o, ap)); if (!d.ok) bad.push('o desafio: ' + d.why); else said.push(d.msg);
        let j = C.vivoDe(body); let lances = 0;
        for (let k = 0; k < 14 && j && j.fase === 'jogo'; k++) { const vv = C.doCorpo(body); if (!vv) break;
          if (vv.dobra === 'outro') { const rr = ask(w => C.respondeCorpo(w, j.id, true)); said.push('o outro dobrou: ' + (rr.msg || rr.why)); j = C.jogo(j.id); continue; }
          if (k === 1 && vv.podeDobrar) { const dd = ask(w => C.dobrar(w, j.id)); said.push('dobrar: ' + (dd.msg || dd.why)); j = C.jogo(j.id); if (!j || j.fase !== 'jogo') break; }
          const id = C.ia(j.s, j.corpo, { ousado: 0.5 }); const rr = ask(w => C.lance(w, j.id, id, k === 2)); if (!rr.ok) { bad.push('o lance: ' + rr.why); break; } lances++;
          if (k === 2) said.push(rr.pego ? 'a manga: ' + rr.msg : rr.manga ? 'a manga passou sem ninguém ver' : 'a manga: o monte vazio'); j = C.jogo(j.id); }
        const fim = j && j.s.fim; said.push(`${lances} lances, ${fim ? fim.por + (fim.w === 0 ? ', o corpo vence' : fim.w === 1 ? ', o corpo perde' : ', empate') : 'sem fim'}`);
        if (!fim) bad.push('a partida do corpo não acabou');
        for (let k = 0; k < 40; k++) fast(); const L = livro(); if (Math.abs(L.sum - L.held) > 1e-3) bad.push(`o livro dos potes: ${L.sum} × ${L.held}`);
        said.push(`as moedas da casa do corpo ${coin0.toFixed(2)} → ${D.get(G.Eco.coinRef(body), 'moedas').toFixed(2)}`);
        // (a tela só lê: perguntar não mudou nada)
        const f0 = fp(); C.doCorpo(body); C.podeCorpo(body); C.atMesa(S().buildings.get(body.inside), 'x'); if (fp() !== f0) bad.push('as leituras mudaram o registro');
        // (de novo, e desistir no meio: o pote para o outro)
        const d2 = ask(w => C.desafia(w, pc.o, ap)); if (d2.ok) { const j2 = C.vivoDe(body); const q = ask(w => C.desisteCorpo(w, j2.id)); const j3 = C.jogo(j2.id); if (!q.ok || !j3 || j3.s.fim.w !== 1 - j3.corpo) bad.push('desistir não deu o pote ao outro'); else said.push('desistiu da segunda: o pote ao outro'); }
      }
    }
    if (Po.body()) Po.release('deus'); M.viver(0.5);
  }
  ok('c7 o corpo à mesa', !bad.length && M.limpo(), `${said.join('; ')}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${M.limpo() ? '' : JSON.stringify(M.erros())}`);
}

// ---------------- c8 o trapaceiro e o torneio ----------------
if (on('c8')) {
  const bad = [], said = []; M.abrir(JSON.parse(SNAP || SNAP0)); calm();
  // (o torneio: a porta na taverna mais cheia, o prêmio da bolsa do taverneiro; a noite vivida até o fechamento)
  const tav = A.all().filter(op => op.def === 'taverna' && A.live(op)).sort((a, b) => Object.keys(b.data.mesa).length - Object.keys(a.data.mesa).length || a.id - b.id)[0];
  const b = tav && S().buildings.get(tav.at); const kp = b && G.Taverna.keeperOf(b);
  if (!b) bad.push('nenhuma taverna aberta'); else {
    const t = god(() => C.torneio(b, { premio: 0.5, de: kp })); if (!t) bad.push('a porta do torneio não abriu'); else said.push(`o torneio em ${G.Village.buildName(b)} (prêmio ${t.cofre})`);
    if (god(() => C.torneio(b, {})) !== t) bad.push('a porta do torneio abriu outro na mesma noite');
    // (os trapaceiros: os de pouca honestidade jogam e alguns são pegos)
    const n0 = Object.assign({}, S().cartas.n); for (let k = 0; k < 900 && C.torneioDe(b); k++) { calm(); M.viver(1); }
    const n = S().cartas.n; const tr = (n.trapacas || 0) - (n0.trapacas || 0), pg = (n.pegos || 0) - (n0.pegos || 0), cp = (n.campeoes || 0) - (n0.campeoes || 0);
    said.push(`${tr} trapaças na noite, ${pg} pegas; ${cp} campeão(ões)`);
    if (C.torneioDe(b)) bad.push('o torneio não fechou com a taverna');
    const L = livro(); if (Math.abs(L.sum - L.held) > 1e-3) bad.push(`o livro dos potes: ${L.sum} × ${L.held}`);
    const tl = lines.filter(l => l.c === 'torneio'); said.push(`${tl.length} linhas do torneio no livro`);
    // (a trapaça pela mão da prova: na primeira partida de fregueses de uma noite, quem joga do lado 0 sem nenhuma honestidade e o outro
    // atento — a índole, pela mão da prova —: ele esconde uma na manga, o outro vê, e vem a confusão: o pote ao enganado, o laço, o ato)
    M.abrir(JSON.parse(SNAP || SNAP0)); calm(); let caso = null, j0 = null; const EIX = G.Indole.EIXOS;
    for (let k = 0; k < 300 && !caso; k++) { calm(); M.viver(0.5); const s = S().cartas; if (!s) continue;
      if (!j0) { j0 = Object.keys(s.j).map(q => s.j[q]).find(j => j.fase === 'jogo' && j.corpo < 0 && j.s.r === 0) || null; if (j0) god(() => { const a = S().villagers.get(j0.quem[0]), o = S().villagers.get(j0.quem[1]); const t0 = G.Lacos && G.Lacos.sente ? G.Lacos.sente(o, a) : null; j0.cf0 = t0 ? t0.confianca : 0; a.indole[EIX.indexOf('hon')] = 0; o.indole[EIX.indexOf('con')] = 99; o.indole[EIX.indexOf('abe')] = 99; }); }
      if (j0 && s.j[j0.id] && s.j[j0.id].conf) caso = s.j[j0.id]; else if (j0 && (!s.j[j0.id] || s.j[j0.id].fase === 'fim')) break; }
    if (caso) { const v = S().villagers.get(caso.conf.de), vit = S().villagers.get(caso.conf.vit), por = S().villagers.get(caso.conf.por);
      said.push(`${v.name} escondeu ${C.card(caso.trap.por).nome} na manga e ${por.name} viu: o pote a ${vit.name}`);
      if (caso.s.fim.w !== caso.quem.indexOf(vit.id)) bad.push('o pote da trapaça pega não foi ao enganado');
      if (C.ato(v) !== 'trapaca-pega') bad.push(`o trapaceiro pego mostra «${C.ato(v)}», não a confusão`);
      { const t = G.Lacos && G.Lacos.sente ? G.Lacos.sente(vit, v) : null; if (!t || !(t.confianca <= j0.cf0 - 15)) bad.push(`a confiança do enganado no trapaceiro não caiu (${j0.cf0} → ${t ? t.confianca : '—'})`); else said.push(`a confiança de ${vit.name} nele: ${j0.cf0} → ${t.confianca}`); }
      const h = G.Inv.held(Object.assign({}, v, { act: 'trapaca-pega', carry: null })).mao; if (!h || h.split('.')[0] !== 'baralho') bad.push(`o trapaceiro sem o baralho na mão (${h})`); }
    else bad.push(j0 ? `a partida ${j0.id} acabou sem a trapaça pega (${JSON.stringify(S().cartas.j[j0.id] ? S().cartas.j[j0.id].s.fim : 'apagada')})` : 'nenhuma partida de fregueses começou');
  }
  ok('c8 o trapaceiro e o torneio', !bad.length && M.limpo(), `${said.join('; ')}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${M.limpo() ? '' : JSON.stringify(M.erros())}`);
}

console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU (cartas)');
process.exit(fails.length ? 1 : 0);
