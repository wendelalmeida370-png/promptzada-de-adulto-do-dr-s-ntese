// marinheiros: os marinheiros de verdade (Bairros Vivos, D-155), a carga do navio que volta do meio do caminho (L-702), o posto
// de quem viaja (L-683) e a noite de quem espera no cais (L-682).   [ONLY=m2,m5] node qa/marinheiros.js [mundo]
// Um navio mercante saía do cais sozinho: ninguém a bordo, ninguém pago, ninguém com uma viagem para contar. Agora a cidade com
// uma rota de mar tem marinheiros (um ofício do porto: dois por rota, quatro no máximo); o navio só sai com gente dela a bordo,
// que desce ao cais, embarca, vai, volta, pisa o cais de casa e recebe o soldo — do tesouro para a casa, no livro —, e a viagem
// entra na história de cada um. Em terra, de dia, carregam as caixas do cais ou cuidam do cordame.
// A mão da prova só dá ao povo a madeira do casco, a comida do porão e as moedas do soldo (pelo depósito), põe a hora e arma o
// relógio da rota; quem escolhe a tripulação, embarca, navega e paga é o jogo.
// m1 a cidade com rota pede marinheiros e os tem; a sem rota, nenhum; de dia, em terra, o marinheiro trabalha no cais;
// m2 a viagem inteira: chamados ao cais, todos a bordo, o porto de lá, a volta, o cais de casa; um soldo por cabeça no livro, do
//    tesouro para a casa; a viagem na vida e na biografia; o navio some; a noite da volta é de folga (e o dia seguinte não);
// (as horas são as do jogo: o dia começa ao amanhecer — 0 —, a noite vai de 0,73 a 0,02, e cada um tem a sua hora de dormir)
// m3 de noite ninguém é tirado da cama: nenhum navio sai, nenhum casco é feito, a rota espera a vez seguinte;
// m4 save e load com a tripulação a caminho do cais (o chamado volta, todos embarcam) e no meio do mar (a viagem acaba, um
//    soldo só por cabeça);
// m5 o mar leva: o deus afunda o navio (ninguém pago, ninguém a bordo do casco que afundou, verificador limpo) e a tripulação morre a bordo
//    (o casco fica à deriva, a rota fica livre);
// m6 o corpo do deus nunca é chamado ao cais: era o primeiro da chamada, e com o deus nele a chamada é dos outros;
// m7 a rota que fecha com o navio no mar: ele volta e a carga que não entregou desce no cais de casa (L-702); ninguém é pago
//    por uma viagem que não houve;
// m8 o posto de quem viaja (L-683): a tripulação de uma viagem deixa o posto do prédio para outro, e na volta a cidade tem um
//    a mais no ofício, nunca dois no mesmo posto;
// m9 quem espera no cais durante a preparação dorme de noite (L-682): à meia-noite ninguém está de pé no cais, e a reunião da
//    partida só é chamada de dia;
// m9b quem dorme na cama além da hora do relógio, com a viagem em preparação, continua nela depois do load (L-798);
// m10 o chamado ao cais de uma razia atravessa o save (a regra do L-190, como a do navio mercante): quem descia ao cais desce
//    de novo, e a razia zarpa — um load cancelava a razia (ninguém a bordo aos 45 s) ou a mandava só com quem já embarcara;
// m11 o soldo é só dos seus (L-716): quem passou a outro povo com o navio no mar não é pago pelo povo que deixou;
// m12 a rota que fecha com o navio ainda no cais, chamando a tripulação (L-727): a viagem não há — o chamado acaba, a carga
//    volta ao cais pelo livro, a madeira do casco volta, e o casco não fica à deriva no próprio cais;
// m13 quem morre chamado ao navio sai da lista dele na hora (L-810): o que morre a caminho do cais e o que morre a bordo, com o
//    navio no cais à espera — a lista do navio guardava o morto até o olhar seguinte, e o save do ano o gravou;
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js'] });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | marinheiros ${name} | ${info}`); if (!c) fails.push(name); };
const Nv = G.Naval, Hb = G.Harbor, E = G.Eco, V = G.Village, D = G.Depot, X = G.Expe;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = null, base = new Set();
const P = id => S.villagers.get(id);
const led = []; D.onMove.push(e => { if (e[8] === 'soldo' || e[8] === 'desembarque') led.push(e.slice()); });
const novas = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const sailorsOf = sid => [...S.villagers.values()].filter(v => v.role === 'marinheiro' && v.set === sid && !v.captive);
const give = (f, k, n) => { const need = n - (f.stock[k] || 0); if (need > 0) D.make('f:' + f.id, k, need, { code: 'teste', part: true }); };
const towns = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && Hb.routesOf(s.id) > 0);
const tr = () => S.ships.filter(s => s.kind === 'mercante' && s.tr);
const live = (cond, max, step) => { for (let t = 0; t < max; t += step || 0.5) { if (cond()) return true; M.viver(step || 0.5); } return cond(); };
// (every crewed merchant, wherever it is: someone aboard while it sails, and all aboard of its own town)
const tripOk = () => { for (const s of tr()) { const ab = Nv.aboardOf(s); const d = S.buildings.get(s.dock); if (Nv.atSea(s) && !s.ghost && !ab.length) return `${s.id} no mar (${s.st}) sem ninguém`; if (d && ab.some(v => v.set !== d.set)) return `${s.id}: gente de outra cidade a bordo`; } return ''; };
// (who the game asks first for a ship on a route: the first people, in its own order, with a quay at an end of it)
const sender = r => { for (const f of G.Fac.all()) { if (!G.Civ.has(f.id, 'navegacao')) continue; const d = Nv.docksOf(f.id).find(q => q.id === r.a || q.id === r.b); if (d) return { f, dock: d, set: S.settlements.get(d.set) }; } return null; };

// a world of its own for each case: timber, food and coin for the peoples of the routes; the trades dealt as the world deals
// them, until the towns of the routes have their sailors; the routes' clocks held (the case arms the one it wants)
function mundo(hour, w) {
  S = M.pronto(w || WORLD); led.length = 0;
  for (const r of S.seaRoutes) r.t = 1e6;
  S.time = hour === undefined ? 0.3 : hour; S.weather.storm = 0;
  god(() => { for (const s of towns()) { const f = G.Fac.get(s.fac); give(f, 'wood', 90); give(f, 'food', 320); if (E.coinage(f.id)) give(f, 'moedas', 20); } });
  for (let k = 0; k < 8; k++) { god(() => V.forceUpdate()); M.viver(1); if (S.seaRoutes.some(r => r.ok && sender(r) && sailorsOf(sender(r).set.id).length >= 2)) break; }
  S.time = hour === undefined ? 0.3 : hour;
  base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  return S;
}
// arms a route and lives until a crewed merchant is at its quay, waiting for its crew
function zarpa(r, max) {
  const before = new Set(S.ships.map(s => s.id)); r.t = 0;
  live(() => S.ships.some(s => s.kind === 'mercante' && s.tr && !before.has(s.id)), max || 60, 0.5);
  for (const q of S.seaRoutes) q.t = 1e6;
  return S.ships.find(s => s.kind === 'mercante' && s.tr && !before.has(s.id)) || null;
}
// the route to try: open, between two peoples, whose first asked has sailors — ashore first: the ready world can open with a
// town's only sailor at sea, on the ship it had coming home (the metrópole of the generation 21: Ramsés, the only one of
// Mênfis, aboard #24788 the whole case — «nenhum navio saiu na rota 8512 em 90 s (Mênfis: 1 marinheiros)»; a sailor at sea
// is still the town's, his trade is the sea, L-683 —, and with one each the routes were tied and the first id won. T-1089)
const ashore = sid => sailorsOf(sid).filter(v => !v.aboard && !Nv.away(v)).length;
const rota = () => S.seaRoutes.filter(r => r.ok && sender(r) && sailorsOf(sender(r).set.id).length).sort((a, b) => ashore(sender(b).set.id) - ashore(sender(a).set.id) || sailorsOf(sender(b).set.id).length - sailorsOf(sender(a).set.id).length || a.id - b.id)[0] || null;

// ---------------------------------------------------------------- m1
if (on('m1')) {
  mundo();
  const ts = towns(); const lines = []; let bad = 0, some = 0;
  for (const s of S.settlements.values()) {
    const f = G.Fac.get(s.fac); if (!f) continue; const n = Hb.routesOf(s.id); const want = god(() => E.demand(s, f, 20)).marinheiro || 0; const have = sailorsOf(s.id).length;
    if (want !== (n ? Math.min(4, Hb.CREW * n) : 0)) bad++; if (!n && have) bad++; if (n && have) some++;
    lines.push(`${s.name}: ${n} rota(s), pede ${want}, tem ${have}`);
  }
  ok('m1 a cidade com rota pede marinheiros e os tem; a sem rota, nenhum', ts.length > 0 && !bad && some > 0, lines.join('; '));
  // by day, ashore: the crates of the quay or the rigging
  const seen = new Set(); let txt = '';
  for (let t = 0; t < 60; t += 1) { M.viver(1); for (const s of ts) for (const v of sailorsOf(s.id)) { if (!v.task) continue; seen.add(v.task.type + (v.task.rig ? '(cordame)' : '')); if (v.task.type === 'redes' && v.task.rig && v.task.st) txt = E.taskText(v, v.task); } }
  const nv = novas();
  ok('m1 de dia, em terra, o marinheiro trabalha no cais', (seen.has('redes(cordame)') || seen.has('estiva') || seen.has('porto')) && !nv.length, `tarefas vistas em 60 s: ${[...seen].join(', ') || 'nenhuma'}${txt ? `; «${txt}»` : ''}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
}

// ---------------------------------------------------------------- m2
if (on('m2')) {
  mundo();
  const r = rota(); const s = r && zarpa(r, 90);
  if (!s) ok('m2 a viagem inteira', false, r ? `nenhum navio saiu na rota ${r.id} em 90 s (${sender(r).set.name}: ${sailorsOf(sender(r).set.id).length} marinheiros)` : 'nenhuma rota com marinheiros neste mundo');
  else {
    // (o livro desta viagem, desde o chamado, e as linhas de quem é da tripulação dela: o mundo pronto pode abrir com um navio
    // a voltar de uma viagem — na metrópole da geração 20, o de Roma, com a única marinheira da cidade a bordo —, que chega em
    // casa na espera do zarpa e paga o soldo daquela; a mesma marinheira é chamada a este, e a prova contava dois soldos para
    // uma cabeça («2 linha(s) «soldo» para 1 tripulante(s)»); e outro navio do mundo que volte no meio paga os seus. T-1014)
    led.length = 0;
    const f = G.Fac.get(s.fac), dock = S.buildings.get(s.dock), set = S.settlements.get(dock.set), di = Nv.dockInfo(dock);
    const crew0 = s.crew.slice(); const viag0 = new Map(crew0.map(id => [id, (P(id).st && P(id).st.viagens) || 0]));
    const called = crew0.length > 0 && crew0.map(P).every(v => v && v.role === 'marinheiro' && v.set === dock.set && v.task && v.task.type === 'embark' && v.task.ship === s.id);
    const cargo = s.goods ? `${s.goods.n} de ${s.goods.k}` : 'nada';
    ok('m2 o navio espera no cais a tripulação da cidade', s.st === 'embark' && called, `${Nv.title ? Nv.title(s) : 'o navio'} de ${set.name} (${f.name}), porão: ${cargo}; chamados ao cais: ${crew0.map(id => P(id) ? P(id).name : id).join(', ')} (${crew0.length}); estado ${s.st}`);
    const notes = []; const chk = () => { const t = tripOk(); if (t && !notes.includes(t)) notes.push(t); };
    const sailed = live(() => { chk(); return s.st === 'go'; }, 90); const ab = Nv.aboardOf(s).map(v => v.id);
    ok('m2 todos a bordo, o navio parte', sailed && ab.length === crew0.length && crew0.every(id => ab.includes(id)), `partiu: ${sailed}; a bordo ${ab.length} de ${crew0.length}`);
    let nvSea = [];
    const there = live(() => { chk(); return s.st === 'back' || !S.ships.includes(s); }, 900, 1); const port = s.port || '';
    nvSea = novas();
    const home = live(() => { chk(); return !S.ships.includes(s); }, 900, 0.5);
    const crew = crew0.map(P).filter(Boolean); const near = crew.map(v => G.dist(v.x, v.y, di.quay[0], di.quay[1]));
    ok('m2 foi ao porto de lá e voltou ao cais de casa', there && !!port && home && crew.length === crew0.length && crew.every(v => !v.aboard) && near.every(d => d < 4) && !notes.length,
      `chegou a ${port || 'NENHUM porto'}; de volta: ${home}; a tripulação no cais de ${set.name} (a ${near.map(d => d.toFixed(1)).join(' e ')} casas), ninguém a bordo: ${crew.every(v => !v.aboard)}${notes.length ? '; ' + notes.join('; ') : ''}`);
    const pays = led.filter(e => e[8] === 'soldo' && crew0.includes(e[9])); const each = crew.map(v => pays.filter(e => e[9] === v.id));
    const right = each.every((l, k) => l.length === 1 && l[0][5] === 'moedas' && Math.abs(l[0][6] - Hb.SOLDO) < 1e-6 && l[0][3] === 'f:' + f.id && l[0][4] === E.coinRef(crew[k]));
    ok('m2 um soldo por cabeça, do tesouro para a casa, no livro', E.coinage(f.id) && pays.length === crew.length && right,
      `${pays.length} linha(s) «soldo» para ${crew.length} tripulante(s): ${pays.map(e => `${e[3]}→${e[4]} ${e[6]} ${e[5]}`).join('; ') || 'nenhuma'}`);
    const tale = crew.every(v => v.st.viagens === viag0.get(v.id) + 1 && v.st.volta === S.day && (viag0.get(v.id) > 0 || (v.bio || []).some(b => b[1] === 'note' && /primeira viagem de mar/.test(String(b[2])))));
    ok('m2 a viagem na vida e na biografia de cada um', tale, crew.map(v => `${v.name}: ${v.st.viagens} viagem(ns), «${((v.bio || []).filter(b => b[1] === 'note' && /viage/.test(String(b[2]))).pop() || [0, 0, 'NADA'])[2]}»`).join('; '));
    // (the leave is of who came home, not of the trade: the town may deal the trades again while the ship is out)
    const leave = crew.every(v => Hb.shoreLeave(v)) && crew.every(v => { const r0 = v.role; v.role = r0 === 'marinheiro' ? 'agricultor' : 'marinheiro'; const l = Hb.shoreLeave(v); v.role = r0; return l; }); const d0 = S.day; live(() => S.day > d0, 260, 1); const nx = crew.map(P).filter(Boolean).every(v => !Hb.shoreLeave(v));
    const nv = novas();
    ok('m2 a noite da volta é de folga, o dia seguinte não; verificador limpo', leave && nx && !nv.length && !nvSea.length, `folga no dia da volta, com qualquer ofício: ${leave}; no dia seguinte: ${!nx}; verificador no mar: ${nvSea.length ? nvSea.slice(0, 2).join(' | ') : 'limpo'}; depois: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m3
if (on('m3')) {
  mundo(0.86);
  const wood0 = new Map(G.Fac.all().map(f => [f.id, f.stock.wood])); const before = S.ships.length;
  // (os navios da noite, os que saem com as rotas armadas — não os que o mundo tinha no mar ao abrir, a voltar para casa: a
  // metrópole da geração 20 abre com dois, e a prova contava um deles como «1 navio(s) com tripulação» saído de noite. T-1014)
  const ids0 = new Set(S.ships.map(q => q.id)); const out0 = tr().length;
  for (const r of S.seaRoutes) if (r.ok) r.t = 0;
  let abed = 0, all = 0; for (const s of towns()) for (const v of sailorsOf(s.id)) { all++; if (v.sleeping || G.Lar.sleepy(v)) abed++; }
  M.viver(20);
  const hulls = tr().filter(q => !ids0.has(q.id)).length; const waits = S.seaRoutes.filter(r => r.ok).every(r => r.t > 0);
  const spent = G.Fac.all().filter(f => wood0.get(f.id) - f.stock.wood >= Nv.SHIP.mercante.cost - 0.01).length;
  const woke = towns().some(s => sailorsOf(s.id).some(v => v.task && v.task.type === 'embark'));
  const nv = novas();
  ok('m3 de noite ninguém é tirado da cama: nenhum navio sai, a rota espera', G.isNight() && all > 0 && !hulls && !woke && waits && !spent && !nv.length,
    `na hora 0,86 do dia, ${abed} de ${all} marinheiros na hora de dormir; em 20 s com as rotas armadas: ${hulls} navio(s) com tripulação${out0 ? ` (fora os ${out0} que o mundo tinha no mar ao abrir)` : ''}, ${woke ? 'ALGUÉM chamado ao cais' : 'ninguém chamado'}, cascos feitos: ${spent}, as rotas esperam a vez seguinte: ${waits}; navios ${before}→${S.ships.length}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
}

// ---------------------------------------------------------------- m4
if (on('m4')) {
  mundo();
  const r = rota(); let s = r && zarpa(r, 90);
  if (!s) ok('m4 save e load no meio', false, 'nenhum navio saiu');
  else {
    const sid = s.id, crew0 = s.crew.slice(); const walking0 = crew0.filter(id => !P(id).aboard).length;
    M.salvarCarregar(); S = G.S; s = S.ships.find(q => q.id === sid);
    const back = s && s.st === 'embark' && crew0.every(id => { const v = P(id); return v && (v.aboard === sid || (v.task && v.task.type === 'embark' && v.task.ship === sid)); });
    const sailed = s && live(() => s.st === 'go', 90); const n = s ? Nv.aboardOf(s).length : 0;
    ok('m4 save e load com a tripulação a caminho do cais: o chamado volta, todos embarcam', !!s && walking0 > 0 && back && sailed && n === crew0.length, `${walking0} de ${crew0.length} a caminho no save; depois do load: o navio ${s ? s.st === 'go' ? 'partiu' : `ficou em «${s.st}»` : 'SUMIU'}, ${n} a bordo`);
    if (s && sailed) {
      M.viver(6); M.salvarCarregar(); S = G.S; s = S.ships.find(q => q.id === sid); led.length = 0;
      const ab = s ? Nv.aboardOf(s).length : 0; const notes = [];
      const home = s && live(() => { const t = tripOk(); if (t && !notes.includes(t)) notes.push(t); return !S.ships.includes(s); }, 1800, 1);
      // (the wages of this ship's crew: another ship of the world that comes home on the way pays its own — the m2's rule, T-1014;
      // the metropole of the generation 22 had two more back while this one sailed, «soldos: 3 para 1», T-1115)
      const crew = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo' && crew0.includes(e[9])); const nv = novas();
      ok('m4 save e load no meio do mar: a viagem acaba, um soldo só por cabeça', !!s && ab === crew0.length && home && crew.every(v => !v.aboard && pays.filter(e => e[9] === v.id).length === 1) && pays.length === crew.length && !notes.length && !nv.length,
        `depois do load ${ab} a bordo; em casa: ${home}; soldos: ${pays.length} para ${crew.length}; ${notes.join('; ') || 'ninguém faltou a bordo'}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
    }
  }
}

// ---------------------------------------------------------------- m5
if (on('m5')) {
  mundo();
  let r = rota(); let s = r && zarpa(r, 90);
  if (!s || !live(() => s.st === 'go', 90)) ok('m5 o deus afunda o navio', false, 'nenhum navio saiu');
  else {
    M.viver(8); const crew0 = Nv.aboardOf(s).map(v => v.id); led.length = 0;
    god(() => Nv.sink(s, null, 'storm')); M.viver(30);
    const alive = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo' && crew0.includes(e[9])).length; const nv = novas(); // (this crew's: T-1115)
    // (who swam may be taken aboard a boat that passes — the game's own rescue —: never left aboard the hull that went down)
    ok('m5 o deus afunda o navio: ninguém pago, ninguém a bordo do casco que afundou', !S.ships.includes(s) && alive.every(v => v.aboard !== s.id && (!v.aboard || S.ships.some(q => q.id === v.aboard))) && !pays && !nv.length, `${crew0.length} a bordo; ${crew0.length - alive.length} afogado(s), ${alive.length} a nado ou em terra${alive.some(v => v.aboard) ? ' — ' + alive.filter(v => v.aboard).map(v => `${v.name} recolhid${v.g === 'f' ? 'a' : 'o'} por outro barco`).join(', ') + ' —' : ''}; o navio ${S.ships.includes(s) ? 'AINDA na lista' : 'saiu da lista'}; soldos: ${pays}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
  mundo();
  r = rota(); s = r && zarpa(r, 90);
  if (!s || !live(() => s.st === 'go', 90)) ok('m5 a tripulação morre a bordo', false, 'nenhum navio saiu');
  else {
    M.viver(8); const crew0 = Nv.aboardOf(s); const rid = s.route; led.length = 0;
    god(() => { for (const v of crew0) V.kill(v, 'god', true); }); M.viver(1);
    const adrift = !!s.ghost && s.st === 'deriva' && !s.route; const nv1 = novas();
    // (the hull drifts until it breaks or is found; and the route is free for another ship of the towns)
    live(() => !S.ships.includes(s), 300, 2); const free = !S.ships.some(q => q.route === rid); const nv2 = novas();
    ok('m5 a tripulação morre a bordo: o casco fica à deriva, a rota fica livre', adrift && free && !led.filter(e => e[8] === 'soldo' && crew0.some(v => v.id === e[9])).length && !nv1.length && !nv2.length, `${crew0.length} mortos a bordo; o casco: ${adrift ? 'à deriva' : `«${s.st}»`}${S.ships.includes(s) ? ', ainda no mar' : ', levado pelo mar'}; a rota livre: ${free}; verificador: ${nv1.concat(nv2).length ? nv1.concat(nv2).slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m6
if (on('m6')) {
  mundo();
  const r = rota(); const snd = r && sender(r);
  // (the body: the first sailor the game would call to this quay now — asked to the game's own door, which only reads)
  // (esperado tanto quanto o zarpa espera o navio: a marinheira única de Roma, na metrópole da geração 20, está no mar ao abrir,
  // no navio que o mundo tinha a voltar, chega exausta e dorme a viagem — livre só aos 40 e tantos segundos: «nenhum marinheiro
  // livre em Roma em 40 s». T-1014)
  let would = []; if (snd) live(() => { would = god(() => Nv.crewFor(snd.f, snd.dock)) || []; return would.length > 0; }, 90, 1);
  if (!would.length) ok('m6 o corpo do deus nunca é chamado ao cais', false, snd ? `nenhum marinheiro livre em ${snd.set.name} em 90 s` : 'nenhuma rota com marinheiros');
  else {
    const me = would[0]; const took = G.Possess.take(me); const mine = !!(S.avatar && S.avatar.id === me.id);
    const after = god(() => Nv.crewFor(snd.f, snd.dock)) || [];
    const s = zarpa(r, 90); let called = false; const sailed = s && live(() => { if (me.task && me.task.type === 'embark') called = true; return s.st === 'go'; }, 90); const ab = s ? Nv.aboardOf(s) : [];
    ok('m6 o corpo do deus nunca é chamado ao cais', !!(took && took.ok !== false) && mine && !after.some(v => v.id === me.id) && !(s && s.crew.includes(me.id)) && !called && !me.aboard && !!me.task && me.task.type === 'avatar' && (!s || !sailed || ab.length > 0),
      `${me.name}, marinheir${me.g === 'f' ? 'a' : 'o'} de ${snd.set.name}, era ${me.g === 'f' ? 'a primeira' : 'o primeiro'} da chamada; com o deus no corpo: a chamada é ${after.map(v => v.name).join(', ') || 'de ninguém'}; o navio ${s ? (sailed ? `saiu com ${ab.map(v => v.name).join(', ') || 'NINGUÉM'}` : 'esperou no cais') : 'não saiu (ninguém mais livre)'}; o corpo ${called || (s && s.crew.includes(me.id)) ? 'FOI chamado' : 'não foi chamado'}, tarefa «${me.task ? me.task.type : ''}»`);
    G.Possess.release && G.Possess.release();
  }
}

// ---------------------------------------------------------------- m7
if (on('m7')) {
  mundo();
  const r = rota(); const s = r && zarpa(r, 90);
  if (!s || !live(() => s.st === 'go', 90)) ok('m7 a rota fecha com o navio no mar', false, 'nenhum navio saiu');
  else {
    M.viver(6); const g = Object.assign({}, s.goods); const crew0 = Nv.aboardOf(s).map(v => v.id); const viag0 = crew0.map(id => (P(id).st && P(id).st.viagens) || 0); led.length = 0;
    // (the route ends — a war, a quay gone —: the hand of the proof takes it from the list, as the game does with a dead one)
    S.seaRoutes = S.seaRoutes.filter(q => q !== r);
    const home = live(() => !S.ships.includes(s), 900, 0.5);
    const landed = led.filter(e => e[8] === 'desembarque' && e[3] === 's:' + s.id && e[5] === g.k).reduce((a, e) => a + e[6], 0);
    const crew = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo' && crew0.includes(e[9])).length; const nv = novas(); // (this crew's: T-1115)
    ok('m7 a rota fecha com o navio no mar: a carga que não entregou desce no cais de casa (L-702)', home && Math.abs(landed - g.n) < 0.01 && crew.every(v => !v.aboard) && !pays && crew.every((v, k) => ((v.st && v.st.viagens) || 0) === viag0[k]) && !nv.length,
      `o porão levava ${g.n} de ${g.k}; de volta: ${home}; desceu no cais de casa: ${landed} (pelo livro); a tripulação em terra: ${crew.every(v => !v.aboard)}; soldos por uma viagem que não houve: ${pays}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m8
if (on('m8')) {
  // a worker of a workplace with one post, in a town with a quay, fit for a voyage; made the most adventurous of the people
  // (as the cais-longe does), the voyage «alone» is theirs
  // (the post the traveller leaves is dealt again when its trade is asked for, from the trade the instant has a hand to spare,
  // if the memory does not ask more of it than it has — the dealer's rule for a post left empty, village.js —: the apiary of
  // Mênfis of the metropole of the generation 22, the first such post, its honey not asked for, stayed empty by the rule. So
  // each candidate in a world of its own: the first whose post is covered is the case; one left empty while its trade was asked
  // and the dealer had a hand to spare, by its own numbers — what the instant asked at its last dealing, the town's memory —,
  // is what L-683 was, and the case; any other, the next candidate, T-1117)
  const fit = (v, f) => v && !v.captive && !v.aboard && !v.held && !v.air && !v.ug && v.hp >= 55 && !(v.preg > 0) && !v.rebel && v.age >= 20 && v.age <= 50 && G.Fac.idOfV(v) === f.id && v.id !== f.leader && !X.memberOf(v.id);
  const cands = () => { const out = [];
    for (const d of [...S.buildings.values()].filter(q => q.type === 'doca' && q.built).sort((p, q) => p.id - q.id)) {
      const di = Nv.dockInfo(d); if (!di.moor) continue; const set = S.settlements.get(d.set); const f = set && G.Fac.get(set.fac); if (!f) continue;
      for (const v of [...S.villagers.values()].sort((p, q) => p.id - q.id)) {
        if (v.set !== set.id || !fit(v, f) || v.role === 'marinheiro' || !E.isJobRole(v.role) || !v.job) continue;
        const b = S.buildings.get(v.job); const j = b && E.jobsOf(b); if (!j || j.n !== 1 || j.role !== v.role) continue;
        if (G.dist(v.x, v.y, di.moor[0], di.moor[1]) > 50) continue;
        out.push({ did: d.id, vid: v.id, bid: b.id }); if (out.length >= 8) return out;
      } }
    return out; };
  // (the dealer's own numbers for an empty post: the trade left asked — the instant a whole hand past the hands it has, the memory
  // all but one (a post the town does not ask for is not dealt again: the apiary of Mênfis, its honey not asked for, the instant
  // 0, the memory 0,26) —, and a trade with a hand to spare — have one, the instant a whole hand past what it asks, the memory no
  // more than it has —; the hands counted as the dealer counts them, not a traveller in a trade of posts)
  const dealt = (set, role) => { const want = V.tradeAsked(set.id) || {}, mem = set.ofm || {}, have = {};
    for (const o of S.villagers.values()) if (o.set === set.id && !o.captive && want[o.role] !== undefined && !(o.role !== 'marinheiro' && E.isJobRole(o.role) && Nv.away(o))) have[o.role] = (have[o.role] || 0) + 1;
    const ask = q => (mem[q] !== undefined ? mem[q] : want[q]), h = q => have[q] || 0;
    const asked = want[role] - h(role) >= 1 && ask(role) - h(role) >= 0.95;
    // (and a hand of it the dealer can move — at home, not in the cell, not the god's body, and three days at least in the trade
    // (V.TRADE_MIN) unless it goes back to the trade: pickHand —: the trades with hands to spare of Argos of the mega were all of
    // travellers but one hand of two days)
    const can = (q, o) => o.set === set.id && o.role === q && !o.captive && !o.jail && !Nv.away(o) && !(S.avatar && S.avatar.id === o.id) && (V.tenure(o) >= V.TRADE_MIN || o.roleBack === role);
    const spare = Object.keys(want).filter(q => h(q) >= 1 && want[q] - h(q) <= -1 && ask(q) - h(q) <= 0 && [...S.villagers.values()].some(o => can(q, o)));
    return { asked, spare, txt: `o instante pede ${want[role] || 0}, a memória ${(+ask(role) || 0).toFixed(2)}; com mão sobrando: ${spare.join(', ') || 'nenhum'}` }; };
  // (the world asked first; then the other ready worlds, as the proofs of the premises do: in the metropole of the generation 22
  // no candidate's trade was asked for)
  const MUNDOS = [WORLD, 'mega', 'mundial', 'cidade'].filter((m, k, L) => L.indexOf(m) === k);
  const list = []; for (const w of MUNDOS) { mundo(undefined, w); for (const c of cands()) list.push(Object.assign({ w }, c)); }
  const tried = []; let done = false;
  for (const c of list) {
    mundo(undefined, c.w); const d = S.buildings.get(c.did), v = P(c.vid), b = S.buildings.get(c.bid); if (!d || !v || !b) continue;
    const di = Nv.dockInfo(d), set = S.settlements.get(d.set), f = G.Fac.get(set.fac); const role = v.role; const postOf = () => [...S.villagers.values()].filter(o => o.job === b.id && o.role === role && !o.captive);
    v.traits = ['Curioso', 'Corajoso']; v.courage = 1; v.voyages = 6; S.time = 0.3;
    const e = god(() => X.launch(f, { k: 'terra', w: 1, why: 'terra', txt: '', x: di.moor[0] + 12, y: di.moor[1] }, 'so', {}));
    if (!e || !e.crew.includes(v.id)) { tried.push(`${c.w}, ${v.name} (${set.name}): ${e ? 'a viagem saiu sem ele' : 'nenhuma viagem saiu'}`); continue; }
    for (let k = 0; k < 6; k++) { god(() => V.forceUpdate()); M.viver(2); }
    const now = postOf(); const cover = now.filter(o => o.id !== v.id);
    if (cover.length !== 1) { const dl = dealt(set, role); if (!dl.asked || !dl.spare.length) { tried.push(`${c.w}, ${v.name}, ${role} em ${set.name}: ${dl.txt}`); continue; } }
    done = true; if (tried.length) console.log(`  (m8: antes, ${tried.join('; ')})`);
      ok('m8 quem viaja deixa o posto, e outro o cobre (L-683)', X.live(e) && Nv.away(v) && v.role === role && !v.job && cover.length === 1, `${v.name}, ${role} de ${G.BDEF[b.type].name || b.type} em ${set.name}, na viagem «só»: ofício ${v.role}, posto ${v.job || 'nenhum'}; no posto: ${cover.map(o => o.name).join(', ') || 'NINGUÉM'}`);
    // (the voyage is called off — as the game ends one —, and the town counts its traveller again)
    e.st = 'fim'; e.status = 'cancelada'; M.viver(3);
    for (let k = 0; k < 6; k++) { god(() => V.forceUpdate()); M.viver(2); }
    const after = postOf(); const both = [v].concat(cover).map(o => P(o.id)).filter(Boolean); const nv = novas();
      ok('m8 na volta, nunca dois no mesmo posto, e ninguém sem ofício', !Nv.away(v) && after.length === 1 && both.every(o => !!o.role) && !nv.length, `de volta: no posto ${after.map(o => o.name).join(', ') || 'NINGUÉM'}; ${both.map(o => `${o.name}: ${o.role}`).join('; ')}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
    break;
  }
  if (!done) ok('m8 o posto de quem viaja (L-683)', false, list.length ? `nenhum caso com o posto pedido e uma mão sobrando: ${tried.join('; ')}` : 'nenhum prédio de um posto só com quem possa viajar, numa cidade com cais');
}

// ---------------------------------------------------------------- m9
if (on('m9')) {
  mundo(0.74);
  let p = null;
  for (const d of [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) { const di = Nv.dockInfo(d); const set = S.settlements.get(d.set); const f = set && G.Fac.get(set.fac); if (di.moor && f && V.pop(set.id) >= 14) { p = { d, di, set, f }; break; } }
  // (the war that breaks out while the crates are loaded is the ruler's to decide once — the world's chance —: decided, by the proof's
  // hand, for the voyage — in the metrópole of the generation 24 the people of Runa's voyage was at war, and it ended at once, «A
  // guerra chegou primeiro», with no night of it to look at, T-1153)
  const e = p && god(() => { give(p.f, 'wood', Nv.SHIP.explorador.cost + 30); const x = X.launch(p.f, { k: 'terra', w: 1, why: 'terra', txt: '', x: p.di.moor[0] + 12, y: p.di.moor[1] }, 'media', {}); if (x) x.warOk = 1; return x; });
  if (!e) ok('m9 quem espera no cais dorme de noite (L-682)', false, 'nenhuma viagem saiu');
  else {
    const crew = () => e.crew.map(P).filter(v => v && !v.aboard);
    const onQuay0 = live(() => crew().some(v => v.task && v.task.type === 'cais'), 60, 1);
    // the night: sampled every five seconds from the evening to the morning, while the voyage is being made ready
    // (a energia de quem está de pé: quem dorme está a recuperá-la, seja qual for a que trouxe — na metrópole da geração 20 o jol
    // de Hedeby, em curso na noite em que o mundo foi guardado, deu à viagem de Torvald quatro dos oito com energia 0 antes de
    // qualquer cais, e no fundo da noite eles dormiam: «a menor energia 0» media a festa, não o cais. T-1015)
    let worst = 0, minE = 1e9, minSono = 1e9, calls = 0, samples = 0, stN = ''; const d0 = S.day; let prev = e.st; const who = [];
    while ((S.day === d0 || S.time < 0.12) && X.live(e)) {
      M.viver(5);
      if (e.st !== prev) { if (G.isNight() && e.st === 'reunir') stN = `«${e.st}» na hora ${S.time.toFixed(2)}`; prev = e.st; }
      if (e.st !== 'prep') continue;
      const deep = S.time > 0.86 && S.time < 0.995; if (!deep) continue;
      // (each one by the clock of the house: the tavern's keeper goes to bed late; and the crate in the arms is set down first)
      samples++; const up = crew().filter(v => v.task && v.task.type === 'cais' && G.Lar.sleepy(v) && !(v.task.job === 'load' && v.task.st === 2)); worst = Math.max(worst, up.length); calls += up.length;
      for (const v of up) { const c = G.Lar.clock(v); const w = `${v.name} (${Math.floor(v.age)} anos, dorme das ${c.bed.toFixed(2)} às ${c.wake.toFixed(2)}) de pé na hora ${S.time.toFixed(2)}, «${v.task.job || ''}/${v.task.st}»`; if (who.length < 3) who.push(w); }
      // (the energy of who is up on the quay — the call's: one of the crew walking home to his bed late, by the rule of the sleep
      // (energy under 15, villagers.js), is not the quay's — Sven, hunter of Hedeby, at 12 at the hour 0,99 in the metropole of the
      // generation 22, with nobody up on the quay, T-1116)
      for (const v of crew()) { if (v.sleeping) minSono = Math.min(minSono, v.energy); else if (v.task && v.task.type === 'cais') minE = Math.min(minE, v.energy); }
    }
    // (and in the morning the voyage goes on: the gathering is called with everyone up)
    const goes = live(() => e.st !== 'prep', 120, 1); const nv = novas();
    ok('m9 quem espera no cais durante a preparação dorme de noite (L-682)', onQuay0 && samples > 0 && worst === 0 && minE > 15 && !stN && goes && !nv.length,
      `a viagem de ${e.leaderName} (${e.crew.length} na tripulação) preparada desde o fim da tarde, com gente no cais antes de dormir: ${onQuay0}; no fundo da noite (${samples} olhadas, da hora 0,86 ao amanhecer): no máximo ${worst} de pé no cais na sua hora de dormir${who.length ? ' — ' + who.join('; ') + ' —' : ''}, a menor energia de quem estava de pé no cais ${minE === 1e9 ? '— (todos dormiam)' : minE.toFixed(0)}${minSono < 1e9 ? ` (de quem dormia, ${minSono.toFixed(0)})` : ''}; reunião chamada de noite: ${stN || 'não'}; de manhã a viagem segue: ${goes} («${e.st}»); verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m9b
// (the save keeps who sleeps in bed: one of the crew of a voyage being made ready, asleep in his house past the hour his clock
// wakes him — the bed keeps one till the strength is back —, is in bed again after the load, never called to the quay by it,
// as the step lets him sleep (L-682). The save wakes everyone at the door, and the expedition's load came before the home's:
// Orm, of an exploring party of Hedeby in the mega of the generation 23, asleep at 0,003, on his way to the quay after the
// load — the generation's round trip saw it, L-798)
if (on('m9b')) {
  mundo(0.74);
  let p = null;
  for (const d of [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) { const di = Nv.dockInfo(d); const set = S.settlements.get(d.set); const f = set && G.Fac.get(set.fac); if (di.moor && f && V.pop(set.id) >= 14) { p = { d, di, set, f }; break; } }
  const e = p && god(() => { give(p.f, 'wood', Nv.SHIP.explorador.cost + 30); return X.launch(p.f, { k: 'terra', w: 1, why: 'terra', txt: '', x: p.di.moor[0] + 12, y: p.di.moor[1] }, 'media', {}); });
  const v = e && e.crew.map(P).find(o => o && !o.aboard && o.home && S.buildings.get(o.home) && S.buildings.get(o.home).built);
  if (!e || !v) ok('m9b quem dorme na cama além da hora continua nela depois do load (L-798)', false, e ? 'ninguém da tripulação com casa' : 'nenhuma viagem saiu');
  else {
    // (the hour past his waking, the voyage still being made ready; and he asleep in his house, as the world leaves one whose
    // strength is not back yet)
    const c = G.Lar.clock(v); S.time = (c.wake + 0.02) % 1; const h = S.buildings.get(v.home);
    god(() => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'sleep', pri: 1.5, st: 2, home: h.id, kind: 'sleep' }); const dr = G.Vg.door(h); v.x = dr[0]; v.y = dr[1]; v.inside = h.id; v.sleeping = true; v.act = 'sleep'; v.energy = 60; });
    const st0 = e.st, sleepy0 = G.Lar.sleepy(v), id = v.id;
    M.salvarCarregar(); S = G.S; const w = P(id); const nv = novas();
    ok('m9b quem dorme na cama além da hora continua nela depois do load (L-798)', st0 === 'prep' && !sleepy0 && !!w && !!w.task && w.task.type === 'sleep' && w.sleeping && w.inside === h.id && !nv.length,
      `${v.name}, da viagem de ${e.leaderName} («${st0}»), dormindo em casa às ${S.time.toFixed(3)} (a hora de acordar pelo relógio: ${c.wake.toFixed(2)}, ${sleepy0 ? 'AINDA NÃO' : 'já passou'}): depois do load, ${w ? (w.task ? '«' + w.task.type + '»' : 'sem tarefa') + (w.sleeping ? ', dormindo' : ', ACORDADO') + (w.inside === h.id ? ', em casa' : ', FORA DE CASA') : 'SUMIU'}${nv.length ? '; o verificador: ' + nv[0] : ''}`);
  }
}

// ---------------------------------------------------------------- m10
if (on('m10')) {
  mundo();
  // (a raid by sea, by the game's own door — as the maos' m12 —: the biggest people with a quay, against the first other
  // people it can land at; the test's hand declares the war and gives the timber of the hull)
  const dks = q => Nv.docksOf(q.id).filter(d => Nv.dockInfo(d).moor).sort((a, b) => a.id - b.id);
  const lands = (f, e) => dks(f).some(d => { const di = Nv.dockInfo(d); const c = Nv.compAt(di.moor[0], di.moor[1]); return G.Fac.settlementsOf(e.id).some(s => Nv.landing(s, c)); });
  let f = null, e = null;
  for (const q of G.Fac.all().filter(x => x.alive && dks(x).length).sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id) || a.id - b.id)) { const o = G.Fac.all().filter(x => x.alive && x !== q && lands(q, x)).sort((a, b) => a.id - b.id)[0]; if (o) { f = q; e = o; break; } }
  const sh = f && god(() => {
    const rel = G.Fac.rel(f.id, e.id); if (rel && !rel.met) G.Politics.meet(f, e, { quiet: true });
    const dp = S.divinePeace; S.divinePeace = 0; G.Politics.declareWar(f, e, 'ambicao'); S.divinePeace = dp;
    D.make('f:' + f.id, 'wood', 60, { code: 'teste', part: true }); for (const o of Nv.shipsOf(f.id, 'transporte')) Nv._remove(o);
    return Nv.launchRaid(f, e, { fury: true });
  });
  if (!sh) ok('m10 o chamado ao cais de uma razia atravessa o save', false, f ? `a razia de ${f.name} contra ${e.name} não saiu` : 'nenhum povo com cais que alcance a costa de outro');
  else {
    const sid = sh.id, crew0 = sh.crew.slice(); const walking0 = crew0.filter(id => P(id) && !P(id).aboard).length;
    M.salvarCarregar(); S = G.S; const s = S.ships.find(q => q.id === sid);
    const back = s ? crew0.filter(id => { const v = P(id); return v && !v.aboard && v.task && v.task.type === 'embark' && v.task.ship === sid; }).length : 0;
    live(() => !S.ships.includes(s) || s.st !== 'embark', 70, 0.5); const n = s && S.ships.includes(s) ? Nv.aboardOf(s).length : 0; const nv = novas();
    ok('m10 o chamado ao cais de uma razia atravessa o save', !!s && walking0 > 0 && back > 0 && S.ships.includes(s) && s.st === 'sail' && n >= 3 && !nv.length,
      `a razia de ${f.name} contra ${e.name}: ${crew0.length} chamados, ${walking0} a caminho do cais no save; depois do load ${back} com o chamado de volta; ${s && S.ships.includes(s) ? `o navio ${s.st === 'sail' ? 'zarpou' : `ficou em «${s.st}»`} com ${n} a bordo` : 'a razia foi CANCELADA (o navio saiu da lista)'}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m11
// (L-716: the pay is the ship's people's to its own. A sailor who is of another people when the ship comes home — his town went
// over while he was at sea — gets no soldo from the people he left: its coins went to a purse of a people that knows no coin)
if (on('m11')) {
  mundo();
  const r = rota(); const s = r && zarpa(r, 90);
  if (!s) ok('m11 o soldo é só dos seus', false, r ? `nenhum navio saiu na rota ${r.id} em 90 s` : 'nenhuma rota com marinheiros neste mundo');
  else {
    // (o livro desta viagem, desde o chamado — como no m2: o soldo da viagem que o mundo tinha no mar ao abrir, pago à mesma
    // marinheira na espera do zarpa, contava como «soldos dele: 1». T-1014)
    led.length = 0;
    const f = G.Fac.get(s.fac); const crew0 = s.crew.slice();
    const sailed = live(() => s.st === 'go', 90); const ab = Nv.aboardOf(s);
    // (the other people: one that knows no coin if the world has one, else the first other; one of its towns)
    const outros = G.Fac.all().filter(q => q.id !== f.id && [...S.settlements.values()].some(t => t.fac === q.id)).sort((a, b) => (E.coinage(a.id) ? 1 : 0) - (E.coinage(b.id) ? 1 : 0) || a.id - b.id);
    const o = outros[0]; const town = o && [...S.settlements.values()].filter(t => t.fac === o.id).sort((a, b) => a.id - b.id)[0];
    if (!sailed || ab.length < 1 || !town) ok('m11 o soldo é só dos seus', false, `partiu: ${sailed}; a bordo ${ab.length}; outro povo: ${o ? o.name : 'nenhum'}`);
    else {
      const v1 = ab[0]; const home0 = v1.set;
      god(() => { v1.set = town.id; v1.home = 0; v1.job = 0; });
      const home = live(() => !S.ships.includes(s), 1800, 1);
      const pays = led.filter(e => e[8] === 'soldo'); const dele = pays.filter(e => e[9] === v1.id); const outrosPagos = crew0.filter(id => id !== v1.id && P(id)).every(id => pays.filter(e => e[9] === id).length === 1);
      const nv = novas().filter(q => /moeda/.test(q));
      ok('m11 o soldo é só dos seus', home && !dele.length && outrosPagos && !nv.length,
        `${v1.name}, da tripulação de ${f.name}, passou a ${town.name} (${o.name}${E.coinage(o.id) ? '' : ', que não conhece a moeda'}) com o navio fora; de volta: ${home}; soldos dele: ${dele.length}${dele.length ? ' (' + dele.map(e => `${e[3]}→${e[4]} ${e[6]}`).join('; ') + ')' : ''}; os outros ${crew0.length - 1} pagos uma vez: ${outrosPagos}; o verificador ${nv.length ? 'acusa: ' + nv[0].slice(0, 140) : 'calado sobre moedas'}`);
    }
  }
}

// ---------------------------------------------------------------- m12
// (L-727: the route that ends with the ship still at its quay, calling its crew. The voyage is off, as when nobody comes: the
// call is over, the cargo back on the quay by the book, the hull's wood back, the hull gone. It was sent «back» with nobody
// aboard — an instant «at sea» with no one, the verifier's S2 — and the next instant it was a hull adrift at its own quay, the
// cargo lost with it. The hand of the proof puts the town's sailors at their doors before the call — the case is the call cut
// on the way — and takes the route from the list, as m7 does)
if (on('m12')) {
  mundo();
  const r = rota(); const snd = r && sender(r);
  if (!r) ok('m12 a rota fecha com o navio ainda no cais', false, 'nenhuma rota com marinheiros neste mundo');
  else {
    god(() => { for (const v of sailorsOf(snd.set.id)) { const h = S.buildings.get(v.home); const q = h && G.W.nearestLand(h.x + h.w / 2, h.y + h.h + 0.6, 3); if (q && G.W.reaches(v, q[0] + 0.5, q[1] + 0.5)) { G.Vg.endTask(v); v.sleeping = false; v.x = q[0] + 0.5; v.y = q[1] + 0.5; v.path = null; } } });
    const before = new Set(S.ships.map(q => q.id)); r.t = 0; let s = null;
    for (let k = 0; k < 900 && !s; k++) { M.viver(0.1); s = S.ships.find(q => q.kind === 'mercante' && q.tr && !before.has(q.id)) || null; }
    for (const q of S.seaRoutes) q.t = 1e6;
    if (!s || s.st !== 'embark' || Nv.aboardOf(s).length) ok('m12 a rota fecha com o navio ainda no cais', false, s ? `a premissa: o navio em «${s.st}» com ${Nv.aboardOf(s).length} já a bordo quando apareceu` : `nenhum navio saiu na rota ${r.id} em 90 s`);
    else {
      const g = Object.assign({}, s.goods); const crew0 = s.crew.slice(); const f = G.Fac.get(s.fac); const viag0 = crew0.map(id => (P(id).st && P(id).st.viagens) || 0); led.length = 0;
      const walking0 = crew0.filter(id => { const v = P(id); return v && v.task && v.task.type === 'embark' && v.task.ship === s.id; }).length;
      S.seaRoutes = S.seaRoutes.filter(q => q !== r);
      // a minute, step by step: while the hull exists it is never at sea with nobody, never adrift; the wood of the step it goes
      let bad = '', gone = -1, wood = 0;
      // (e as rotas que o jogo abre no minuto ficam seguras como as outras — o caso arma só a sua: tirada a rota da lista, o povo
      // abre outra (updateSeaRoutes, com o relógio de 5 a 20 s), e a marinheira única de Roma, na metrópole da geração 20, embarcou
      // 20 s depois num mercante novo dela — «a bordo: 1» —, uma viagem de verdade que não é o caso. T-1016)
      for (let k = 1; k <= 600; k++) {
        for (const q of S.seaRoutes) if (q.t < 1e6) q.t = 1e6;
        const w0 = f.stock.wood; M.viver(0.1);
        if (S.ships.includes(s)) { if (s.ghost || s.st === 'deriva') bad = bad || `casco à deriva aos ${(k / 10).toFixed(1)} s`; else if (Nv.atSea(s) && !Nv.aboardOf(s).length) bad = bad || `no mar («${s.st}») sem ninguém a bordo aos ${(k / 10).toFixed(1)} s`; }
        else if (gone < 0) { gone = k / 10; wood = f.stock.wood - w0; }
        if (k % 20 === 0) for (const q of novas()) if (/mercante|navegando|a bordo/.test(q)) bad = bad || q.slice(0, 120);
      }
      const landed = led.filter(e => e[8] === 'desembarque' && e[3] === 's:' + s.id && e[5] === g.k).reduce((a, e) => a + e[6], 0);
      const crew = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo' && crew0.includes(e[9])).length; const nv = novas(); // (this crew's: T-1115)
      const called = crew.filter(v => v.task && v.task.type === 'embark' && v.task.ship === s.id).length;
      ok('m12 a rota fecha com o navio ainda no cais: a viagem não há, a carga volta ao cais e o casco não fica à deriva (L-727)',
        walking0 > 0 && gone >= 0 && gone <= 1 && !bad && Math.abs(landed - g.n) < 0.01 && wood >= Nv.SHIP.mercante.cost - 1 && crew.every(v => !v.aboard) && !called && !pays && crew.every((v, k) => ((v.st && v.st.viagens) || 0) === viag0[k]) && !nv.length,
        `${crew0.length} chamado(s) ao cais de ${snd.set.name}, ${walking0} a caminho e ninguém a bordo; o porão com ${g.n} de ${g.k}; a rota fecha: ${gone >= 0 ? `o casco saiu do mundo em ${gone} s` : 'o casco NÃO saiu em 60 s (' + s.st + (s.ghost ? ', à deriva' : '') + ')'}${bad ? '; ' + bad : ''}; desceu no cais de casa: ${landed} (pelo livro); a madeira do casco de volta: ${wood.toFixed(1)} (${Nv.SHIP.mercante.cost}); ainda chamados: ${called}; a bordo: ${crew.filter(v => v.aboard).length}; soldos: ${pays}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
    }
  }
}

if (on('m13')) {
  // the call to the quay of a new merchant, with the sailors of its town at their doors (as in the m12)
  const call = () => { mundo(); const r = rota(); const snd = r && sender(r); if (!r) return { why: 'nenhuma rota com marinheiros neste mundo' };
    god(() => { for (const v of sailorsOf(snd.set.id)) { const h = S.buildings.get(v.home); const q = h && G.W.nearestLand(h.x + h.w / 2, h.y + h.h + 0.6, 3); if (q && G.W.reaches(v, q[0] + 0.5, q[1] + 0.5)) { G.Vg.endTask(v); v.sleeping = false; v.x = q[0] + 0.5; v.y = q[1] + 0.5; v.path = null; } } });
    const before = new Set(S.ships.map(q => q.id)); r.t = 0; let s = null;
    for (let k = 0; k < 900 && !s; k++) { M.viver(0.1); s = S.ships.find(q => q.kind === 'mercante' && q.tr && !before.has(q.id)) || null; }
    for (const q of S.seaRoutes) q.t = 1e6;
    return s ? { s, snd } : { why: `nenhum navio saiu na rota ${r.id} em 90 s` }; };
  const dead = id => QA.check().some(q => q.msg.includes(`tripulante ${id} morto`));
  // the one on the way to the quay
  let c = call(); const walk = c.s && c.s.st === 'embark' ? c.s.crew.map(P).find(v => v && !v.aboard && v.task && v.task.type === 'embark' && v.task.ship === c.s.id) : null;
  let said1 = c.why || (walk ? '' : `o navio em «${c.s.st}», ninguém a caminho do cais`), ok1 = false;
  if (walk) { const n0 = c.s.crew.length; god(() => V.kill(walk, 'god', true)); const kept = c.s.crew.includes(walk.id), seen = dead(walk.id); ok1 = !kept && !seen;
    said1 = `o mercante #${c.s.id} de ${c.snd.set.name} chamando ${n0} ao cais; ${walk.name}, a caminho, morre: ${kept ? 'FICA NA LISTA' : 'sai da lista'}${seen ? ' (o verificador VÊ o morto na lista)' : ''}`; }
  // the one aboard: the case lives until a hand of the roster is aboard
  c = call(); let ab = null;
  if (c.s) for (let k = 0; k < 900 && !ab && S.ships.includes(c.s); k++) { for (const q of S.seaRoutes) if (q.t < 1e6) q.t = 1e6; M.viver(0.1); ab = Nv.aboardOf(c.s)[0] || null; }
  let said2 = c.why || (ab ? '' : 'ninguém chegou a bordo em 90 s'), ok2 = false;
  if (ab) { const at = Nv.atSea(c.s) ? 'no mar' : 'no cais'; god(() => V.kill(ab, 'god', true)); const kept = c.s.crew.includes(ab.id), seen = dead(ab.id); ok2 = !kept && !seen;
    said2 = `${ab.name}, a bordo do mercante #${c.s.id} ${at}, morre: ${kept ? 'FICA NA LISTA' : 'sai da lista'}${seen ? ' (o verificador VÊ o morto na lista)' : ''}`; }
  ok('m13 quem morre chamado ao navio sai da lista dele na hora: a caminho do cais e a bordo (L-810)', ok1 && ok2, `${said1}; ${said2}`);
}
const er = M.erros();
ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(er).slice(0, 300));
console.log(fails.length ? `MARINHEIROS: FALHOU (${fails.length})` : 'MARINHEIROS: PASSOU');
process.exit(fails.length ? 1 : 0);
