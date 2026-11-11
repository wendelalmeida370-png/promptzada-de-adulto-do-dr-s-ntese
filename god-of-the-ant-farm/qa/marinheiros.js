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
// m10 o chamado ao cais de uma razia atravessa o save (a regra do L-190, como a do navio mercante): quem descia ao cais desce
//    de novo, e a razia zarpa — um load cancelava a razia (ninguém a bordo aos 45 s) ou a mandava só com quem já embarcara;
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
function mundo(hour) {
  S = M.pronto(WORLD); led.length = 0;
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
// the route to try: open, between two peoples, whose first asked has sailors
const rota = () => S.seaRoutes.filter(r => r.ok && sender(r) && sailorsOf(sender(r).set.id).length).sort((a, b) => sailorsOf(sender(b).set.id).length - sailorsOf(sender(a).set.id).length || a.id - b.id)[0] || null;

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
    const pays = led.filter(e => e[8] === 'soldo'); const each = crew.map(v => pays.filter(e => e[9] === v.id));
    const right = each.every((l, k) => l.length === 1 && l[0][5] === 'moedas' && Math.abs(l[0][6] - Hb.SOLDO) < 1e-6 && l[0][3] === 'f:' + f.id && l[0][4] === E.coinRef(crew[k]));
    ok('m2 um soldo por cabeça, do tesouro para a casa, no livro', E.coinage(f.id) && pays.length === crew.length && right,
      `${pays.length} linha(s) «soldo» para ${crew.length} tripulante(s): ${pays.map(e => `${e[3]}→${e[4]} ${e[6]} ${e[5]}`).join('; ') || 'nenhuma'}`);
    const tale = crew.every(v => v.st.viagens === viag0.get(v.id) + 1 && v.st.volta === S.day && (viag0.get(v.id) > 0 || (v.bio || []).some(b => b[1] === 'note' && /primeira viagem de mar/.test(String(b[2])))));
    ok('m2 a viagem na vida e na biografia de cada um', tale, crew.map(v => `${v.name}: ${v.st.viagens} viagem(ns), «${((v.bio || []).filter(b => b[1] === 'note' && /viage/.test(String(b[2]))).pop() || [0, 0, 'NADA'])[2]}»`).join('; '));
    const leave = crew.every(v => Hb.shoreLeave(v)); const d0 = S.day; live(() => S.day > d0, 260, 1); const nx = crew.map(P).filter(Boolean).every(v => !Hb.shoreLeave(v));
    const nv = novas();
    ok('m2 a noite da volta é de folga, o dia seguinte não; verificador limpo', leave && nx && !nv.length && !nvSea.length, `folga no dia da volta: ${leave}; no dia seguinte: ${!nx}; verificador no mar: ${nvSea.length ? nvSea.slice(0, 2).join(' | ') : 'limpo'}; depois: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m3
if (on('m3')) {
  mundo(0.86);
  const wood0 = new Map(G.Fac.all().map(f => [f.id, f.stock.wood])); const before = S.ships.length;
  for (const r of S.seaRoutes) if (r.ok) r.t = 0;
  let abed = 0, all = 0; for (const s of towns()) for (const v of sailorsOf(s.id)) { all++; if (v.sleeping || G.Lar.sleepy(v)) abed++; }
  M.viver(20);
  const hulls = tr().length; const waits = S.seaRoutes.filter(r => r.ok).every(r => r.t > 0);
  const spent = G.Fac.all().filter(f => wood0.get(f.id) - f.stock.wood >= Nv.SHIP.mercante.cost - 0.01).length;
  const woke = towns().some(s => sailorsOf(s.id).some(v => v.task && v.task.type === 'embark'));
  const nv = novas();
  ok('m3 de noite ninguém é tirado da cama: nenhum navio sai, a rota espera', G.isNight() && all > 0 && !hulls && !woke && waits && !spent && !nv.length,
    `na hora 0,86 do dia, ${abed} de ${all} marinheiros na hora de dormir; em 20 s com as rotas armadas: ${hulls} navio(s) com tripulação, ${woke ? 'ALGUÉM chamado ao cais' : 'ninguém chamado'}, cascos feitos: ${spent}, as rotas esperam a vez seguinte: ${waits}; navios ${before}→${S.ships.length}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
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
      const crew = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo'); const nv = novas();
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
    const alive = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo').length; const nv = novas();
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
    ok('m5 a tripulação morre a bordo: o casco fica à deriva, a rota fica livre', adrift && free && !led.filter(e => e[8] === 'soldo').length && !nv1.length && !nv2.length, `${crew0.length} mortos a bordo; o casco: ${adrift ? 'à deriva' : `«${s.st}»`}${S.ships.includes(s) ? ', ainda no mar' : ', levado pelo mar'}; a rota livre: ${free}; verificador: ${nv1.concat(nv2).length ? nv1.concat(nv2).slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m6
if (on('m6')) {
  mundo();
  const r = rota(); const snd = r && sender(r);
  // (the body: the first sailor the game would call to this quay now — asked to the game's own door, which only reads)
  let would = []; if (snd) live(() => { would = god(() => Nv.crewFor(snd.f, snd.dock)) || []; return would.length > 0; }, 40, 1);
  if (!would.length) ok('m6 o corpo do deus nunca é chamado ao cais', false, snd ? `nenhum marinheiro livre em ${snd.set.name} em 40 s` : 'nenhuma rota com marinheiros');
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
    const crew = crew0.map(P).filter(Boolean); const pays = led.filter(e => e[8] === 'soldo').length; const nv = novas();
    ok('m7 a rota fecha com o navio no mar: a carga que não entregou desce no cais de casa (L-702)', home && Math.abs(landed - g.n) < 0.01 && crew.every(v => !v.aboard) && !pays && crew.every((v, k) => ((v.st && v.st.viagens) || 0) === viag0[k]) && !nv.length,
      `o porão levava ${g.n} de ${g.k}; de volta: ${home}; desceu no cais de casa: ${landed} (pelo livro); a tripulação em terra: ${crew.every(v => !v.aboard)}; soldos por uma viagem que não houve: ${pays}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ---------------------------------------------------------------- m8
if (on('m8')) {
  mundo();
  // a worker of a workplace with one post, in a town with a quay, fit for a voyage; made the most adventurous of the people
  // (as the cais-longe does), the voyage «alone» is theirs
  const fit = (v, f) => v && !v.captive && !v.aboard && !v.held && !v.air && !v.ug && v.hp >= 55 && !(v.preg > 0) && !v.rebel && v.age >= 20 && v.age <= 50 && G.Fac.idOfV(v) === f.id && v.id !== f.leader && !X.memberOf(v.id);
  let pick = null;
  for (const d of [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) {
    const di = Nv.dockInfo(d); if (!di.moor) continue; const set = S.settlements.get(d.set); const f = set && G.Fac.get(set.fac); if (!f) continue;
    for (const v of [...S.villagers.values()].sort((a, b) => a.id - b.id)) {
      if (v.set !== set.id || !fit(v, f) || v.role === 'marinheiro' || !E.isJobRole(v.role) || !v.job) continue;
      const b = S.buildings.get(v.job); const j = b && E.jobsOf(b); if (!j || j.n !== 1 || j.role !== v.role) continue;
      if (G.dist(v.x, v.y, di.moor[0], di.moor[1]) > 50) continue;
      pick = { d, di, set, f, v, b }; break;
    }
    if (pick) break;
  }
  if (!pick) ok('m8 o posto de quem viaja (L-683)', false, 'nenhum prédio de um posto só com quem possa viajar, numa cidade com cais');
  else {
    const { di, set, f, v, b } = pick; const role = v.role; const postOf = () => [...S.villagers.values()].filter(o => o.job === b.id && o.role === role && !o.captive);
    v.traits = ['Curioso', 'Corajoso']; v.courage = 1; v.voyages = 6; S.time = 0.3;
    const e = god(() => X.launch(f, { k: 'terra', w: 1, why: 'terra', txt: '', x: di.moor[0] + 12, y: di.moor[1] }, 'so', {}));
    if (!e || !e.crew.includes(v.id)) ok('m8 o posto de quem viaja (L-683)', false, e ? `a viagem saiu sem ${v.name}` : 'nenhuma viagem saiu');
    else {
      for (let k = 0; k < 6; k++) { god(() => V.forceUpdate()); M.viver(2); }
      const now = postOf(); const cover = now.filter(o => o.id !== v.id);
      ok('m8 quem viaja deixa o posto, e outro o cobre (L-683)', X.live(e) && Nv.away(v) && v.role === role && !v.job && cover.length === 1, `${v.name}, ${role} de ${G.BDEF[b.type].name || b.type} em ${set.name}, na viagem «só»: ofício ${v.role}, posto ${v.job || 'nenhum'}; no posto: ${cover.map(o => o.name).join(', ') || 'NINGUÉM'}`);
      // (the voyage is called off — as the game ends one —, and the town counts its traveller again)
      e.st = 'fim'; e.status = 'cancelada'; M.viver(3);
      for (let k = 0; k < 6; k++) { god(() => V.forceUpdate()); M.viver(2); }
      const after = postOf(); const both = [v].concat(cover).map(o => P(o.id)).filter(Boolean); const nv = novas();
      ok('m8 na volta, nunca dois no mesmo posto, e ninguém sem ofício', !Nv.away(v) && after.length === 1 && both.every(o => !!o.role) && !nv.length, `de volta: no posto ${after.map(o => o.name).join(', ') || 'NINGUÉM'}; ${both.map(o => `${o.name}: ${o.role}`).join('; ')}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
    }
  }
}

// ---------------------------------------------------------------- m9
if (on('m9')) {
  mundo(0.74);
  let p = null;
  for (const d of [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) { const di = Nv.dockInfo(d); const set = S.settlements.get(d.set); const f = set && G.Fac.get(set.fac); if (di.moor && f && V.pop(set.id) >= 14) { p = { d, di, set, f }; break; } }
  const e = p && god(() => { give(p.f, 'wood', Nv.SHIP.explorador.cost + 30); return X.launch(p.f, { k: 'terra', w: 1, why: 'terra', txt: '', x: p.di.moor[0] + 12, y: p.di.moor[1] }, 'media', {}); });
  if (!e) ok('m9 quem espera no cais dorme de noite (L-682)', false, 'nenhuma viagem saiu');
  else {
    const crew = () => e.crew.map(P).filter(v => v && !v.aboard);
    const onQuay0 = live(() => crew().some(v => v.task && v.task.type === 'cais'), 60, 1);
    // the night: sampled every five seconds from the evening to the morning, while the voyage is being made ready
    let worst = 0, minE = 1e9, calls = 0, samples = 0, stN = ''; const d0 = S.day; let prev = e.st; const who = [];
    while ((S.day === d0 || S.time < 0.12) && X.live(e)) {
      M.viver(5);
      if (e.st !== prev) { if (G.isNight() && e.st === 'reunir') stN = `«${e.st}» na hora ${S.time.toFixed(2)}`; prev = e.st; }
      if (e.st !== 'prep') continue;
      const deep = S.time > 0.86 && S.time < 0.995; if (!deep) continue;
      // (each one by the clock of the house: the tavern's keeper goes to bed late; and the crate in the arms is set down first)
      samples++; const up = crew().filter(v => v.task && v.task.type === 'cais' && G.Lar.sleepy(v) && !(v.task.job === 'load' && v.task.st === 2)); worst = Math.max(worst, up.length); calls += up.length;
      for (const v of up) { const c = G.Lar.clock(v); const w = `${v.name} (${Math.floor(v.age)} anos, dorme das ${c.bed.toFixed(2)} às ${c.wake.toFixed(2)}) de pé na hora ${S.time.toFixed(2)}, «${v.task.job || ''}/${v.task.st}»`; if (who.length < 3) who.push(w); }
      for (const v of crew()) minE = Math.min(minE, v.energy);
    }
    // (and in the morning the voyage goes on: the gathering is called with everyone up)
    const goes = live(() => e.st !== 'prep', 120, 1); const nv = novas();
    ok('m9 quem espera no cais durante a preparação dorme de noite (L-682)', onQuay0 && samples > 0 && worst === 0 && minE > 15 && !stN && goes && !nv.length,
      `a viagem de ${e.leaderName} (${e.crew.length} na tripulação) preparada desde o fim da tarde, com gente no cais antes de dormir: ${onQuay0}; no fundo da noite (${samples} olhadas, da hora 0,86 ao amanhecer): no máximo ${worst} de pé no cais na sua hora de dormir${who.length ? ' — ' + who.join('; ') + ' —' : ''}, a menor energia ${minE === 1e9 ? '—' : minE.toFixed(0)}; reunião chamada de noite: ${stN || 'não'}; de manhã a viagem segue: ${goes} («${e.st}»); verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
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

const er = M.erros();
ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(er).slice(0, 300));
console.log(fails.length ? `MARINHEIROS: FALHOU (${fails.length})` : 'MARINHEIROS: PASSOU');
process.exit(fails.length ? 1 : 0);
