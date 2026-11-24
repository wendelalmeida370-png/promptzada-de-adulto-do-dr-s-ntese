// jogos-casa: os jogos da casa (a quarta onda da taverna, frente J — D-930 a D-939), em Node, pelo qa/nodemundo.js, na metrópole pronta:
//  g1 a casa com os seus jogos: cada taverna aberta tem os dados e os baralhos que o degrau dela guarda (ou os que o material deixou), cada um
//     feito pelo livro pelas mãos do taverneiro — o osso ou a madeira dos dados, o baralho no material que o povo dela pinta, gastando da
//     prateleira o que ele pede —, nenhum a mais
//  g2 o empréstimo e a volta pelo livro, numa noite inteira: cada jogo que vai à mesa («jogo-mesa») volta («jogo-volta» e os outros fins), os
//     da casa não somem, nenhum fica numa mesa sem partida, a mão de quem joga segura o jogo de verdade da mesa e a mesa do 3D mostra o
//     material dele; e os jogos próprios de quem é do mundo (o que ele comprou, em casa) também vão e voltam
//  g3 as duas mesas querendo o último jogo: com o jogo de dados da casa na mesa de outros, o corpo não começa outra partida com ele — o
//     porquê diz com quem ele está —, e começa quando ele volta
//  g4 o aluguel: quem chama com o jogo da casa e não é freguês da noite paga a mesa ao taverneiro pelo livro; o freguês da noite não paga
//  g5 o jogo próprio: o corpo com os seus dados joga sem esperar nem alugar, e eles voltam à mochila; os dados dados a alguém do mundo são
//     dele (a porta escolhe os dele)
//  g6 comprar um jogo: o taverneiro faz e vende, do material da casa — as moedas para as dele, a coisa para a mochila —, um por dia
//  g7 o save no meio da partida com o jogo emprestado: carregado duas vezes, o mesmo futuro; o jogo na mesa volta onde estava e é devolvido
//  g8 quem morre no meio: o dono dos dados morto no meio da partida — os dados vão para a casa dele («herdado»), a partida acaba e o pote
//     volta —; e quem joga com o da casa e morre: o da casa volta à prateleira
//  g9 a taverna que queima com os jogos dentro: os da prateleira e o da mesa se perdem com ela, pelo livro; a partida acaba, o pote volta
//  g10 o deus que tira um jogo: o da prateleira faz falta até a casa fazer outro; o da mesa acaba a partida
//  e o verificador limpo (a regra «jogos» e as S1–S2), nenhum erro de módulo nem aviso no console.
//   node qa/jogos-casa.js [mundo]         (≈ 4 min; ONLY=g1,g3 para algumas partes)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js'] });
const JC = G.JogosCasa, JD = G.JogoDados, C = G.Cartas, A = G.Act, D = G.Depot, T = G.Taverna, In = G.Interiors, It = G.Itens, Po = G.Possess;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | jogos-casa ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const on = k => !ONLY.length || ONLY.includes(k);
const world = process.argv[2] || 'metropole';
const S = () => G.S; const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
const EPS = 1e-6; const r2 = x => Math.round(x * 100) / 100;
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: 1 }; } };
// (the ledger's lines of the games: the sets and the coins of the rent and the sale)
const GAME = k => /^(dados|baralho)(\.|$)/.test(k || '');
// (and the stuff a set is made of, used by the keeper's hands: «dados», «baralho» — the world's own ledger keeps only its last lines)
const lines = []; D.onMove.push(e => { if (GAME(e[5]) || e[8] === 'dados' || e[8] === 'baralho' || e[8] === 'aluguel-jogo' || e[8] === 'venda-jogo' || /^dados-/.test(e[8] || '')) lines.push({ n: e[0], t: e[2], from: e[3], to: e[4], k: e[5], q: e[6], op: e[7], c: e[8], by: e[9] }); });
const since = n0 => lines.filter(l => l.n > n0); const lastN = () => (S().ledgerN || 0);
const watch = bad => { for (const q of QA.check().filter(q => q.sev <= 2 || q.sys === 'jogos' || q.sys === 'dados')) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
const tav = () => [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built).sort((a, c) => a.id - c.id);
const civOf = b => (G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ;
const at = s => { M.reseed(4242); G.Save.apply(JSON.parse(s)); G.Main.mode = 'game'; };
const ask = fn => { const a = Po.apply(fn); for (let k = 0; k < 8 && !a.res; k++) M.viver(0.05); return a.res || { ok: false, why: 'sem resposta' }; };
const could = (v, m) => v && m && m.g && !m.zz && !m.corpo && m.st >= 2 && m.st <= 5 && v.task && v.task.type === 'tavern' && v.energy > 36 && !(G.Ebrio && G.Ebrio.grau(v) >= 2) && !JD.gameOf(v) && !C.vivoDe(v) && v.age >= 16;
// (the god takes a customer seated at a table of the tavern — the one the filter likes — on its seat: the tavern sees the body there in its
// own second, D-767; as the qa/jogo-dados.js j7)
function seat(b, pred) {
  const op = T.dia(b); if (!op) return null;
  const L = Object.keys(op.data.mesa).map(id => [S().villagers.get(+id), op.data.mesa[id]]).filter(([v, m]) => could(v, m) && Po.can(v).ok && (!pred || pred(v, m))).sort((a, c) => a[0].id - c[0].id);
  for (const [v, m] of L) { const pl = In.placeOf(v); if (!pl) continue; god(() => Po.take(v)); if (Po.body() !== v) continue; god(() => Po.use(v, b, pl)); M.viver(3);
    const s = T.corpo(v); if (s && s.seat) return { v, g: String(m.g), b }; god(() => Po.release('deus')); }
  return null;
}
const free = () => { if (Po.body()) god(() => Po.release('deus')); };
// (how many others free to play sit at a table — the body's call needs one —, and the bones' game not on it)
const company = (b, v, m) => { const d = T.dia(b).data; if (d.jogo && d.jogo[m.g]) return 0; return Object.keys(d.mesa).filter(id => +id !== (v ? v.id : 0) && String(d.mesa[id].g) === String(m.g) && could(S().villagers.get(+id), d.mesa[id])).length; };
// (someone from out of the tavern — with a house and coins, of its people, not at its tables tonight — brought by the god to a free seat of a
// table with company: one who sits and has not had anything of the house, as the player does; the test's hand puts the body on the seat, as
// the qa/cartas.js c7)
function seatOut(b, avoid, min) {
  const p = G.Space.planNow(b); const d = T.dia(b).data; if (!p || !p.entrance) return null; const TL = G.Space.TILE; const fid = G.Village.facOfSet(b.set);
  const pls = In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 60, ['sentar', 'comer']).filter(q => q.it && /^(banco|banquinho|cadeira)/.test(q.it.kind) && String(In.groupOf(b, q.it.id)) !== String(avoid) && company(b, null, { g: In.groupOf(b, q.it.id) }) >= (min === undefined ? 1 : min))
    .sort((a, c) => company(b, null, { g: In.groupOf(b, c.it.id) }) - company(b, null, { g: In.groupOf(b, a.it.id) }) || a.d - c.d);
  const v = [...S().villagers.values()].filter(o => o.age >= 18 && o.age < 60 && !o.inside && !d.mesa[o.id] && !(d.ped && d.ped[o.id]) && G.Fac.idOfV(o) === fid && o.set === b.set && !!o.home && D.exists('h:' + o.home) && purse(o) >= 1 && Po.can(o).ok && o !== T.keeperOf(b) && !o.sleeping)
    .sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
  if (!pls.length || !v) return null; const pl = pls[0];
  god(() => Po.take(v)); if (Po.body() !== v) return null;
  v.inside = b.id; v.x = b.x + pl.x / TL; v.y = b.y + pl.z / TL; Po.setLevel(pl.lv); god(() => Po.use(v, b, pl)); M.viver(3);
  const s = T.corpo(v); if (s && s.seat) return { v, b, g: String(In.groupOf(b, pl.it.id)) }; free(); return null;
}
// (until a condition, in the world's steps, at most sec seconds of the world)
const until = (f, sec, dt) => { const t0 = S().clock; while (!f() && S().clock - t0 < sec) { calm(); M.viver(dt || 0.5); } return f(); };
const liveDice = b => JD.jogos().filter(op => op.at === b.id && op.data.set && op.data.set.n);
const purse = v => D.get(G.Eco.coinRef(v), 'moedas');

// ---------------- the night: the taverns opened (SNAP), and a moment with a game of the house's dice on a table (SNAPG) ----------------
let SNAP = null, SNAPG = null, NIGHT = null;
const need = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10'].some(on);
if (need) {
  M.pronto(world); calm();
  while (S().time < 0.6) { calm(); M.viver(1); }
  SNAP = G.Save.serialize();
}

// ---------------- g1 the house with its own ----------------
if (on('g1')) {
  const bad = []; const said = [];
  for (const b of tav()) { if (!T.dia(b)) continue; const fid = G.Village.facOfSet(b.set); const civ = civOf(b);
    for (const t of ['dados', 'baralho']) { const c = JC.casa(b, t); if (c.total > c.guarda) bad.push(`#${b.id}: ${c.total} ${t} para ${c.guarda} que o degrau guarda`);
      for (const k of Object.keys(c.por)) { const m = It.def(k).mat; if (!G.Origem.matOK(fid, m)) bad.push(`#${b.id}: ${k} de um povo que não tem ${m}`);
        if (t === 'baralho' && !(It.dePovo('baralho', civ) || []).includes(m)) bad.push(`#${b.id}: o baralho ${m} de um povo ${civ}`); } }
    const c = JC.casa(b, 'dados'), d = JC.casa(b, 'baralho'); said.push(`#${b.id} ${b.esc} ${civ}: ${Object.keys(c.por).map(k => c.por[k] + ' ' + k.split('.')[1]).join('+') || 'sem dados'} / ${Object.keys(d.por).map(k => d.por[k] + ' ' + k.split('.')[1]).join('+') || 'sem baralho'}`); }
  // (each set made by the keeper's hands, by the ledger: the deck after the shelf's stuff it is made of, used in the same moment)
  const L = lines; let made = 0;
  for (let i = 0; i < L.length; i++) { const e = L[i]; if (e.from !== '@mundo' || !GAME(e.k) || (e.c !== 'dados' && e.c !== 'baralho')) continue; made++;
    const b = S().buildings.get(+String(e.to).slice(2)); if (!/^b:/.test(e.to) || !b || b.type !== 'taverna') bad.push(`${e.k} feito fora da prateleira de uma taverna (${e.to})`);
    if (!S().villagers.get(e.by)) bad.push(`${e.k} feito por #${e.by}, que não existe`);
    for (const o of It.feitoDe(e.k) || []) { let got = false; for (let j = i - 1; j >= Math.max(0, i - 6) && !got; j--) { const p = L[j]; got = p.from === e.to && p.to === '@uso' && p.k === o.k && Math.abs(p.q - o.n) < 1e-6 && p.c === e.c; } if (!got) bad.push(`${e.k} em #${b && b.id} sem gastar ${o.n} de ${o.k}`); } }
  if (!made) bad.push('nenhum jogo da casa feito pelo livro');
  if (!tav().some(b => JC.casa(b, 'baralho').total >= 2)) bad.push('nenhuma taverna com os seus baralhos');
  ok('g1 a casa com os seus jogos: os dados e os baralhos do degrau, do material do povo, feitos pelo livro', !bad.length, `${bad.length ? 'FALHOU: ' + bad.slice(0, 5).join(' | ') + ' — ' : ''}${made} feitos pelo livro; ${said.join('; ')}`);
}

// ---------------- g2 the night: the lending and the return ----------------
if (need) {
  at(SNAP); const n0 = lastN(); const totals0 = new Map(tav().map(b => [b.id, [JC.casa(b, 'dados').total, JC.casa(b, 'baralho').total]]));
  NIGHT = { hand: 0, handBad: [], mesa: 0, mesaBad: [], bad: [], own: new Set(), n0 };
  let k = 0; while (S().time < 0.86 && k++ < 1200) { calm(); M.viver(0.5);
    for (const v of S().villagers.values()) if ((v.act === 'jogo-dados' || v.act === 'jogo-cartas') && !(v.carry && v.carry.n > EPS)) { const h = G.Inv.held(v).mao; const want = v.act === 'jogo-dados' ? JD.dadosDe(v) : C.baralhoNaMesa(v); if (want) { if (h === want) NIGHT.hand++; else if (NIGHT.handBad.length < 3) NIGHT.handBad.push(`#${v.id} ${v.act}: segura ${h || 'nada'}, a mesa tem ${want}`); } }
    for (const r of JC.todos()) { if (!r.jogo) continue; const b = S().buildings.get(r.b); const at3 = r.tipo === 'dados' ? JD.atMesa(b, r.g) : C.atMesa(b, r.g); if (!at3) continue; NIGHT.mesa++; const want = r.tipo === 'dados' ? r.k.split('.')[1] : (C.jogo(r.jogo) && C.jogo(r.jogo).bar[0] || '').split('.')[1]; if (at3.mat !== want && NIGHT.mesaBad.length < 3) NIGHT.mesaBad.push(`#${r.jogo}: a mesa mostra ${at3.mat}, o jogo é de ${want}`); }
    if (!SNAPG) { const op = JD.jogos().find(o => o.data.set && o.data.set.casa && o.data.fase === 'palpite' && o.data.r >= 1 && (o.data.pote || 0) > EPS); const cj = Object.values((S().cartas && S().cartas.j) || {}).find(j => j.fase === 'jogo' && j.ns); if (op) SNAPG = { save: G.Save.serialize(), op: op.id, cj: cj ? cj.id : 0 }; }
    if (k % 30 === 0) watch(NIGHT.bad); }
  NIGHT.totals = tav().map(b => [b.id, totals0.get(b.id), [JC.casa(b, 'dados').total, JC.casa(b, 'baralho').total]]);
  NIGHT.led = since(n0);
}
if (on('g2')) {
  const bad = NIGHT.bad.slice(); const L = NIGHT.led;
  const outs = L.filter(l => l.c === 'jogo-mesa'); const backs = L.filter(l => /^n:/.test(l.from));
  // (every set that went to a table came back from it — or is on a table with its game still alive)
  for (const o of outs) { const back = backs.find(x => x.from === o.to); const r = JC.mesa(+o.to.slice(2)); if (!back && !(r && JC.vivo(r))) bad.push(`${o.k} ${o.from} → ${o.to}: não voltou`); }
  for (const x of backs) if (!['jogo-volta', 'herdado', 'esquecido', 'jogo-mesa', 'ruina', 'perdido', 'deus'].includes(x.c)) bad.push(`a volta de ${x.from} com a causa «${x.c}»`);
  // (the house's sets did not vanish: what each had, it has — or more, the ones it made or was left; a set sold that was over what it keeps,
  // at most down to what it keeps)
  for (const [id, a, z] of NIGHT.totals) { const b = S().buildings.get(id); if (a && (z[0] < Math.min(a[0], JC.guarda(b, 'dados')) || z[1] < Math.min(a[1], JC.guarda(b, 'baralho')))) bad.push(`#${id}: os jogos da casa de ${a.join('/')} para ${z.join('/')}`); }
  const orf = JC.todos().filter(r => r.jogo && !JC.vivo(r)); if (orf.length) bad.push(`${orf.length} jogos numa mesa sem partida`);
  if (NIGHT.handBad.length) bad.push('a mão: ' + NIGHT.handBad.join('; ')); if (NIGHT.mesaBad.length) bad.push('a mesa do 3D: ' + NIGHT.mesaBad.join('; '));
  const own = outs.filter(o => /^(h|m):/.test(o.from)); const houses = outs.filter(o => /^b:/.test(o.from));
  for (const o of own) { const back = backs.find(x => x.from === o.to); if (back && back.to !== o.from && back.c === 'jogo-volta') bad.push(`o jogo de #${o.by} saiu de ${o.from} e voltou para ${back.to}`); }
  const codes = {}; for (const l of L) codes[l.c] = (codes[l.c] || 0) + 1;
  ok('g2 o empréstimo e a volta pelo livro, numa noite inteira', !bad.length && outs.length > 0, `${bad.length ? 'FALHOU: ' + bad.slice(0, 5).join(' | ') + ' — ' : ''}${outs.length} jogos à mesa (${houses.length} da casa, ${own.length} de quem joga, de casa ou da mochila), ${backs.length} voltas; a mão de quem joga ${NIGHT.hand} vezes com o jogo da mesa; a mesa do 3D ${NIGHT.mesa} vezes com o material dele; as linhas ${JSON.stringify(codes)}`);
}

// ---------------- g3, g6, g5: one tavern, the body ----------------
// (a tavern whose house has one set of dice, on a table of others; the body — with a house and the coins for the purchase — seated at
// another table, with company)
const S3 = {};
const consome = (b, v) => { const d = T.dia(b).data; return !!(d.ped && d.ped[v.id] && Object.values(d.ped[v.id]).some(n => n > 0)) || (d.fila || []).includes(v.id) || !!(v.carry && v.carry.n > EPS); };
if (['g3', 'g5', 'g6'].some(on)) {
  at(SNAP); let pick = null;
  for (let k = 0; k < 240 && !pick; k++) { calm(); M.viver(0.5);
    for (const b of tav()) { if (JC.guarda(b, 'dados') !== 1 || !T.aberta(b) || !T.atHand(b) || !JD.qual(b)) continue; const g = liveDice(b).find(op => op.data.set.casa && op.data.fase !== 'fim'); if (!g) continue;
      const s = seatOut(b, g.data.g, 1) || (k > 160 ? seatOut(b, g.data.g, 0) : null); if (s) { pick = Object.assign(s, { op: g.id }); break; } } }
  S3.pick = pick;
}
if (on('g3')) {
  const bad = []; let info = 'nenhuma taberna com o seu jogo de dados na mesa de outros e o corpo noutra mesa';
  const p = S3.pick;
  if (p) {
    const x = JD.verbo(p.v); const op = A.get(p.op); const names = op.data.quem.map(id => S().villagers.get(id)).filter(Boolean).map(o => Po.knows.call(p.v, o));
    if (x.k !== 'chamar' || x.ok || !x.espera) bad.push(`o verbo com o jogo da casa na outra mesa: ${JSON.stringify({ k: x.k, ok: x.ok, espera: x.espera })}`);
    if (!/está na mesa d/.test(x.why || '') || !names.some(n => (x.why || '').includes(n))) bad.push(`o porquê não diz com quem está: «${x.why}» (${names.join(', ')})`);
    const r = ask(w => JD.chamar(w, 0.1)); if (r.ok) bad.push('o corpo chamou a mesa com o jogo da casa na outra');
    // (it comes back with the end of that game, and then the body can call)
    // (it comes back with the end of that game: free for the body — or taken at once by another table, and the why says that one)
    const back = until(() => !A.live(A.get(p.op)), 90); const free3 = JD.setFor(p.b, p.v); const x2 = JD.verbo(p.v);
    if (!back) bad.push('a outra partida não acabou em 90 s');
    else if (!(free3 && free3.daCasa) && !(x2.espera && /está na mesa d/.test(x2.why || ''))) bad.push(`com a partida acabada, o jogo da casa: ${JSON.stringify(free3)}; o verbo ${JSON.stringify({ k: x2.k, ok: x2.ok, why: x2.why })}`);
    info = `#${p.b.id}: «${x.why}»; o corpo não chamou (${r.why || '-'}); a outra partida acabou, e o jogo da casa ${free3 && free3.daCasa ? `voltou à prateleira, livre para o corpo${x2.ok ? '' : ` (${x2.why})`}` : `foi a outra mesa: «${x2.why}»`}`;
    S3.back = back;
  }
  ok('g3 as duas mesas querendo o último jogo: a segunda espera, e o porquê diz com quem ele está', !!p && !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${info}`);
}
if (['g5', 'g6'].some(on) && S3.pick) {
  const p = S3.pick; const v = p.v; const b = p.b; const bad = [], said = [];
  // ---- g6: buy a set of the keeper ----
  const k0 = T.keeperOf(b); const kc0 = k0 ? purse(k0) : 0, vc0 = purse(v); const n0 = lastN();
  const pc = JC.podeComprar(v, 'dados', b); const r = ask(w => JC.comprar(w, 'dados'));
  const got = JC.proprio(v, 'dados', b); const L6 = since(n0);
  if (!pc.ok || !r.ok || !got || got.ref !== 'm:' + v.id) bad.push(`a compra: ${pc.why || ''} ${r.why || ''} ${got ? got.ref : 'nada na mochila'}`);
  else {
    const sale = L6.filter(l => l.c === 'venda-jogo' && l.by === v.id); const made = L6.filter(l => l.from === '@mundo' && l.c === 'dados' && l.to === 'b:' + b.id); // (the body's own deal: others buy too, at the same moment, elsewhere)
    if (sale.length !== 2 || !sale.some(l => l.k === r.k && l.to === 'm:' + v.id && l.from === 'b:' + b.id) || !sale.some(l => l.k === 'moedas' && l.from === G.Eco.coinRef(v) && l.to === G.Eco.coinRef(k0) && Math.abs(l.q - pc.preco) < EPS)) bad.push('a venda não foi as duas pernas pelo livro: ' + JSON.stringify(sale));
    if (pc.de === 'faz' && made.length !== 1) bad.push('o jogo vendido não foi feito pelas mãos do taverneiro');
    if (Math.abs(r2(vc0 - purse(v)) - pc.preco) > EPS && G.Eco.coinRef(v) !== G.Eco.coinRef(k0)) bad.push(`o corpo pagou ${r2(vc0 - purse(v))}`);
    const again = JC.podeComprar(v, 'dados', b); if (again.ok && again.de === 'faz') bad.push('o taverneiro faz um segundo para vender no mesmo dia');
    said.push(`g6: comprou ${r.k} (${pc.de === 'faz' ? 'feito agora' : 'o que sobrava'}) por ${pc.preco}: o taverneiro ${r2(kc0)} → ${r2(purse(k0))}; de novo hoje: «${again.why || 'sobra'}»`);
  }
  ok('g6 comprar um jogo: o taverneiro faz e vende, do material da casa, pelo livro, um por dia', on('g6') ? !bad.length : true, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${said.join('; ')}`);
  // ---- g5: the body's own set — no waiting, no rent, back to the bag ----
  const b5 = [], s5 = [];
  if (got) {
    // (the house's set taken by another table first, if it can be: the body plays with its own even so)
    const x = JD.verbo(v); if (x.k !== 'chamar' || !x.ok || x.fonte !== 'seu' || x.aluguel) b5.push(`o verbo com os seus dados: ${JSON.stringify({ k: x.k, ok: x.ok, fonte: x.fonte, aluguel: x.aluguel, why: x.why })}`);
    const n5 = lastN(); const c5 = purse(v); const rc = x.ok ? ask(w => JD.chamar(w, x.apostas[0])) : { ok: false, why: x.why };
    const s = JD.corpo(v); const op = s && A.get(s.op);
    if (!rc.ok || !op || op.data.set.dono !== v.id || op.data.set.casa) b5.push(`chamar com os seus: ${rc.why || ''} ${op ? JSON.stringify(op.data.set) : '-'}`);
    else {
      if (JC.proprio(v, 'dados', b)) b5.push('os dados continuaram na mochila com a partida chamada');
      const go = s.convite.some(q => q.sim) ? ask(w => JD.comecar(w, s.op)) : { ok: false, why: 'ninguém aceitou' };
      until(() => !A.live(op) || (op.data.fase !== 'convite' && op.data.fase !== 'sacode'), 8, 0.1);
      const left = ask(w => JD.sair(w, s.op)); until(() => !A.live(op), 12, 0.1);
      const L5 = since(n5); if (L5.some(l => l.c === 'aluguel-jogo')) b5.push('pagou aluguel com os seus dados');
      if (!L5.some(l => l.c === 'jogo-mesa' && l.from === 'm:' + v.id)) b5.push('os seus dados não foram à mesa pelo livro');
      const ret = L5.find(l => l.c === 'jogo-volta' && l.to === 'm:' + v.id); if (!ret) b5.push('os seus dados não voltaram à mochila');
      if (!JC.proprio(v, 'dados', b)) b5.push('os dados não estão na mochila no fim');
      s5.push(`chamou com os seus (${s.set.de}): ${go.ok ? 'jogou' : go.why}; largou — ${left.msg || left.why}; a partida ${op.st} (${op.end ? op.end.why : ''}); voltaram à mochila${ret ? '' : ' NÃO'}; moedas ${r2(c5)} → ${r2(purse(v))}`);
    }
    // (the set given to someone of the world at the table: his own now — the door chooses his)
    const top = T.dia(b); const o = top ? Object.keys(top.data.mesa).map(id => S().villagers.get(+id)).find(q => q && q !== v && String(top.data.mesa[q.id].g) === p.g && !JD.gameOf(q) && G.Inv.room(q, got.k) >= 1) : null;
    if (o) { const gv = ask(w => G.Inv.give(w, o, got.k, 1)); const f = JC.proprio(o, 'dados', b); const sf = JD.setFor(b, null, [o]);
      if (!gv.ok || !f || f.ref !== 'm:' + o.id || !sf || sf.dono !== o.id) b5.push(`os dados dados a ${o.name}: ${gv.why || ''} ${JSON.stringify(f)} ${JSON.stringify(sf)}`);
      else s5.push(`deu os dados a ${o.name}: são dele (a porta escolhe os dele: ${sf.ref})`); S3.o = o; }
    else s5.push('ninguém à mesa para receber os dados');
  } else b5.push('o corpo não tem dados seus (a compra falhou)');
  ok('g5 o jogo próprio: o corpo com os seus dados joga sem esperar nem alugar, e eles voltam; os dados de alguém do mundo são dele', on('g5') ? !b5.length : true, `${b5.length ? 'FALHOU: ' + b5.join(' | ') + ' — ' : ''}${s5.join('; ')}`);
  free();
} else if (['g5', 'g6'].some(on)) for (const g of ['g5', 'g6'].filter(on)) ok(g, false, 'nenhuma taberna com o corpo à mesa para a prova');

// ---------------- g4 the rent ----------------
// (one from out of the tavern brought to a free seat — who has had nothing of the house tonight, as the player who sits to play —: calls the
// table with the house's dice and pays the table to the keeper, by the ledger; the house's customer of the night pays nothing)
if (on('g4')) {
  const b4 = [], s4 = []; at(SNAP); let done = false;
  for (let tries = 0; tries < 6 && !done; tries++) {
    let p = null; for (let k = 0; k < 120 && !p; k++) { calm(); M.viver(0.5); for (const b of tav()) { if (!T.aberta(b) || !T.atHand(b) || !JC.daCasa(b, 'dados') || !G.Eco.coinage(G.Village.facOfSet(b.set))) continue; p = seatOut(b); if (p) break; } }
    if (!p) break; const { v, b } = p; const k0 = T.keeperOf(b);
    until(() => JD.verbo(v).ok, 20, 0.25); const x = JD.verbo(v); const al = JC.aluguel(b, v);
    if (x.k !== 'chamar' || !x.ok || x.fonte !== 'casa') { s4.push(`#${b.id}: o verbo ${x.k} ${x.why || ''}`); free(); continue; }
    if (Math.abs((x.aluguel || 0) - al.n) > EPS) b4.push(`o verbo diz aluguel ${x.aluguel}, a porta ${al.n}`);
    if (!(al.n > EPS)) b4.push(`quem chegou sem consumir não paga (${al.por})`);
    const n4 = lastN(); const kc = purse(k0), vc = purse(v); const rc = ask(w => JD.chamar(w, x.apostas[0])); const s = rc.ok ? JD.corpo(v) : null;
    const go = s && s.convite.some(q => q.sim) ? ask(w => JD.comecar(w, s.op)) : { ok: false, why: rc.ok ? 'ninguém aceitou' : rc.why };
    const rent = since(n4).filter(l => l.c === 'aluguel-jogo');
    if (!go.ok && rent.length) b4.push('pagou aluguel sem a partida começar');
    if (go.ok) { done = true;
      if (!(rent.length === 1 && rent[0].from === G.Eco.coinRef(v) && rent[0].to === G.Eco.coinRef(k0) && Math.abs(rent[0].q - al.n) < EPS)) b4.push('o aluguel não foi pelo livro às moedas do taverneiro: ' + JSON.stringify(rent));
      // (the screen says where the set comes from, and the rent once, beside it — the source does not repeat it: L-2190)
      const sv = JD.corpo(v); if (!sv || !sv.set || !sv.set.casa || Math.abs(sv.set.alug - al.n) > EPS || !/emprestado/.test(sv.set.de) || /aluguel/.test(sv.set.de)) b4.push(`a tela não diz de onde vem o jogo, ou diz o aluguel duas vezes: ${JSON.stringify(sv && sv.set)}`);
      s4.push(`${v.name}, sentado sem consumir em #${b.id}: chamou com «${x.de}» e começou — pagou ${rent.length ? rent[0].q : 0} ao taverneiro (${r2(kc)} → ${r2(purse(k0))}; as moedas dele ${r2(vc)} → ${r2(purse(v))}); a tela diz «${sv && sv.set ? sv.set.de : ''}»`); }
    else s4.push(`#${b.id}: ${go.why} (nada pago)`);
    if (s) { const op = A.get(s.op); ask(w => JD.sair(w, s.op)); until(() => !op || !A.live(op), 60, 0.25); }
    // (the house's customer of the night pays nothing: one served tonight at that tavern)
    const top = T.dia(b); const served = top ? Object.keys(top.data.ped || {}).map(id => S().villagers.get(+id)).find(q => q && q !== v && Object.values(top.data.ped[q.id]).some(n => n > 0) && G.Eco.coinRef(q) !== G.Eco.coinRef(k0)) : null;
    if (served) { const a = JC.aluguel(b, served); if (a.n > EPS) b4.push(`${served.name}, servido nesta noite, pagaria aluguel`); else s4.push(`${served.name}, servido nesta noite: ${a.por}`); }
    free();
  }
  if (!done) b4.push('nenhuma partida chamada por quem chegou sem consumir começou');
  ok('g4 o aluguel: quem chama com o jogo da casa e não consome paga a mesa ao taverneiro, pelo livro; o freguês da noite não', !b4.length, `${b4.length ? 'FALHOU: ' + b4.join(' | ') + ' — ' : ''}${s4.join('; ')}`);
}

// ---------------- g7 a save in the middle of a game with a lent set ----------------
// (the games, the sets on the tables and the ledger's lines of the games since a run began — the lines of this run only)
const canon = L0 => JSON.stringify([JC.todos().map(r => [r.id, r.jogo, r.k, r.n, r.ref, r.dono]), JD.jogos().map(op => [op.id, op.data.fase, op.data.r, op.data.set && op.data.set.n]), Object.values((S().cartas && S().cartas.j) || {}).map(j => [j.id, j.fase, j.s.r, (j.ns || []).join('.')]), lines.slice(L0).map(l => [l.from, l.to, l.k, l.q, l.c])]);
if (on('g7')) {
  const bad = []; let info = 'nenhum momento com um jogo de dados da casa numa mesa';
  if (SNAPG) {
    const run = () => { at(SNAPG.save); const L0 = lines.length; const r0 = JC.todos().length; const op = A.get(SNAPG.op); const was = op && op.data.set ? JC.mesa(op.data.set.n) : null; for (let k = 0; k < 120; k++) { calm(); M.viver(0.5); } return [canon(L0), r0, !!was, op, lines.slice(L0)]; };
    const [a, r0, was, op, tail] = run(); const [b, r1] = run();
    if (!was) bad.push('o jogo da mesa não voltou com o save'); if (a !== b) bad.push('o mesmo save, dois futuros');
    if (op && A.live(op)) bad.push('a partida não acabou em 60 s');
    const sid = op && op.data.set ? op.data.set.n : 0; if (sid && !tail.some(l => l.from === 'n:' + sid)) bad.push(`o jogo da mesa #${sid} não foi devolvido`);
    watch(bad);
    info = `${r0} jogos nas mesas ao abrir o save (${r1} na segunda); a partida #${SNAPG.op} acabou (${op ? op.end && op.end.why : '?'}) e o jogo #${sid} voltou; os dois futuros ${a === b ? 'iguais' : 'DIFERENTES'}`;
  }
  ok('g7 o save no meio da partida com o jogo emprestado: volta, é devolvido, o mesmo futuro', !!SNAPG && !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${info}`);
}

// ---------------- g8 who dies in the middle ----------------
if (on('g8')) {
  const bad = [], said = [];
  // (a) the owner of the dice on the table dies: the body, with its own set — bought of the keeper —, calls and dies in the middle
  at(SNAP); let p = null; for (let k = 0; k < 120 && !p; k++) { calm(); M.viver(0.5); for (const b of tav()) { if (!T.aberta(b) || !T.atHand(b) || !JD.qual(b)) continue; const s = seat(b, (v, m) => purse(v) >= 1.5 && !!v.home && D.exists('h:' + v.home) && T.keeperOf(b) !== v && company(b, v, m) >= 2); if (s) { p = s; break; } } }
  if (!p) bad.push('nenhuma taverna com o corpo à mesa');
  else {
    const v = p.v; const home = v.home; const r = ask(w => JC.comprar(w, 'dados'));
    until(() => { const y = JD.verbo(v); return y.k === 'chamar' && y.ok; }, 40, 0.25); // (the bones' game on the table, or a game called at it a moment: its end)
    const x = JD.verbo(v); const rc = r.ok && x.ok && x.fonte === 'seu' ? ask(w => JD.chamar(w, x.apostas[0])) : { ok: false, why: r.why || x.why };
    const s = rc.ok ? JD.corpo(v) : null; const op = s ? A.get(s.op) : null; const sid = op && op.data.set ? op.data.set.n : 0; const n8 = lastN();
    if (!op) bad.push('o corpo não chamou a mesa com os seus dados: ' + (rc.why || ''));
    else {
      god(() => G.Village.kill(v, 'teste')); until(() => !A.live(op), 5, 0.1);
      const L8 = since(n8); const ret = L8.find(l => l.from === 'n:' + sid);
      if (A.live(op)) bad.push('a partida seguiu sem os dados do morto');
      if (!ret || ret.c !== 'herdado' || ret.to !== 'h:' + home) bad.push(`os dados do morto: ${JSON.stringify(ret)} (a casa dele: h:${home})`);
      if (JC.mesa(sid)) bad.push('os dados do morto ficaram na mesa');
      if ((op.data.pote || 0) > EPS) bad.push('o pote ficou na mesa');
      said.push(`o corpo morreu no meio da partida com os seus dados: a partida ${op.end ? op.end.why : '?'}; os dados ${ret ? ret.c + ' → ' + ret.to : 'NÃO voltaram'}`);
    }
  }
  free();
  // (b) one playing with the house's set dies: the game goes on or ends by its rule, and the house's set goes back to the shelf
  if (SNAPG) { at(SNAPG.save); const op = A.get(SNAPG.op); const sid = op.data.set.n; const ref = JC.mesa(sid) && JC.mesa(sid).ref; const pl = op.data.quem.map(id => S().villagers.get(id)).find(q => q && !op.data.fora[q.id]); const n8 = lastN();
    if (pl) { god(() => G.Village.kill(pl, 'teste')); until(() => !A.live(op), 90); const ret = since(n8).find(l => l.from === 'n:' + sid);
      if (A.live(op)) bad.push('a partida do jogo da casa não acabou depois da morte'); if (!ret || ret.to !== ref || ret.c !== 'jogo-volta') bad.push(`o jogo da casa depois da morte de quem jogava: ${JSON.stringify(ret)}`);
      said.push(`${pl.name} morreu jogando com os dados da casa: a partida ${op.end ? op.end.why : '?'}, os dados de volta à prateleira${ret ? '' : ' NÃO'}`); } }
  watch(bad);
  ok('g8 quem morre no meio: os dados do morto vão para a casa dele, e os da casa voltam à prateleira', !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${said.join('; ')}`);
}

// ---------------- g9 the tavern that burns with the games inside ----------------
if (on('g9')) {
  const bad = []; let info = 'nenhum momento com um jogo da casa na mesa';
  if (SNAPG) {
    at(SNAPG.save); const op = A.get(SNAPG.op); const b = S().buildings.get(op.at); const sid = op.data.set.n; const n9 = lastN();
    const shelf = JC.casa(b, 'dados').prateleira + JC.casa(b, 'baralho').prateleira; const onT = JC.todos().filter(r => r.b === b.id).length; const pote = op.data.pote || 0;
    god(() => G.Village.destroyBuilding(b, 'fire')); M.viver(1.5);
    const L9 = since(n9); const lost = L9.filter(l => GAME(l.k) && l.to === '@uso' && l.c === 'ruina');
    if (lost.length !== shelf + onT) bad.push(`perdidos pelo livro ${lost.length}, e havia ${shelf} na prateleira e ${onT} nas mesas`);
    if (JC.todos().some(r => r.b === b.id)) bad.push('um jogo ficou na mesa da taverna queimada');
    if (A.live(op)) bad.push('a partida seguiu na ruína');
    const back = L9.filter(l => l.c === 'dados-volta' && l.op === op.id).reduce((s, l) => s + l.q, 0); if (Math.abs(back - pote) > EPS) bad.push(`o pote de ${pote} voltou ${back}`);
    watch(bad);
    info = `#${b.id} queimou com ${shelf} jogos na prateleira e ${onT} nas mesas: ${lost.length} perdidos pelo livro («ruina»), a partida ${op.end ? op.end.why : '?'}, o pote de ${pote} de volta a quem pôs`;
    void sid;
  }
  ok('g9 a taverna que queima com os jogos dentro: perdem-se com ela, pelo livro; a partida acaba, o pote volta', !!SNAPG && !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${info}`);
}

// ---------------- g10 the god who takes a set ----------------
if (on('g10')) {
  const bad = [], said = [];
  // (a) from the table, in the middle of a game: the game ends, the pot goes back
  if (SNAPG) { at(SNAPG.save); const op = A.get(SNAPG.op); const r = JC.mesa(op.data.set.n); const b = S().buildings.get(op.at); const tot0 = JC.casa(b, 'dados').total; const n10 = lastN();
    god(() => D.use('n:' + r.id, r.k, 1, { code: 'deus', mine: true })); M.viver(0.3);
    if (A.live(op)) bad.push('a partida seguiu sem o jogo que o deus tirou da mesa'); else said.push(`o deus tirou ${r.k} da mesa: a partida ${op.end.why}`);
    if (JC.mesa(r.id)) bad.push('o registro do jogo tirado ficou');
    if (JC.casa(b, 'dados').total !== tot0 - 1) bad.push(`a casa tinha ${tot0}, tem ${JC.casa(b, 'dados').total}`);
    // (… and it makes another when it can: a minute of the world later, from the bone the people had or the wood of the shelf)
    const ok2 = until(() => JC.casa(b, 'dados').total >= tot0 || !T.aberta(b), 75, 1); const made = since(n10).filter(l => l.from === '@mundo' && l.c === 'dados' && l.to === 'b:' + b.id);
    if (JC.casa(b, 'dados').total >= tot0 && !made.length) bad.push('a casa voltou a ter o jogo sem fazê-lo');
    said.push(ok2 && made.length ? `a casa fez outro (${made[0].k}) ${Math.round(made[0].t - since(n10)[0].t)} s depois` : `a casa ainda sem outro (${JC.qual ? '' : ''}${JD.qual(b) ? 'pode fazer: ' + JD.qual(b) : 'sem com que fazer'})`); }
  // (b) from the shelf: the house is short of one until it makes another
  at(SNAP); const b = tav().find(q => T.aberta(q) && JC.casa(q, 'baralho').prateleira >= 1 && T.keeperOf(q));
  if (b) { const c = JC.casa(b, 'baralho'); const k = Object.keys(c.por).find(q => D.get('b:' + b.id, q) >= 1); const n10 = lastN();
    god(() => D.use('b:' + b.id, k, 1, { code: 'deus', mine: true })); const short = JC.casa(b, 'baralho').total;
    if (short !== c.total - 1) bad.push(`o baralho tirado da prateleira: ${c.total} → ${short}`);
    const back = until(() => JC.casa(b, 'baralho').total >= c.total, 75, 1); const made = since(n10).filter(l => l.from === '@mundo' && l.c === 'baralho' && l.to === 'b:' + b.id);
    if (back && !made.length) bad.push('a casa voltou a ter o baralho sem fazê-lo');
    said.push(`o deus tirou um ${k} da prateleira de #${b.id}: ${c.total} → ${short}${back ? `, e a casa fez outro (${made.map(l => l.k).join(', ')})` : `; a casa ainda não fez outro (${C.qual(b) || 'sem material'})`}`); }
  else said.push('nenhuma taverna com um baralho na prateleira');
  watch(bad);
  ok('g10 o deus que tira um jogo: o da mesa acaba a partida; o da prateleira faz falta até a casa fazer outro', !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${said.join('; ')}`);
}

const E0 = M.erros(); const errs = Object.keys(E0.mod).length || E0.console.length;
ok('erros', !errs, errs ? JSON.stringify(E0).slice(0, 300) : 'nenhum erro de módulo nem aviso no console');
console.log(`(${Math.round(clock() - c0)} s)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
