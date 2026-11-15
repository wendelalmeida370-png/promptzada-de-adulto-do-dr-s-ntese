// jarra: a busca d'água que se perde no caminho (L-708).   [ONLY=j1,j3] node qa/jarra.js [mundo]
// De manhã, a casa com a jarra no fim manda um dos seus ao poço (life.js) e marca a tentativa: só tenta de novo um terço de
// dia depois — a guarda contra mandar gente todo segundo a um poço que não dá água. Mas a ida ao poço vale 1,05: a fome na
// fila (1,2), uma festa (1,1), um chamado qualquer a tiram de quem ia — e a casa ficava com a tentativa gasta e a jarra seca
// a manhã toda. Em Tenochtitlan (o `lar` l17), um saiu da fila do poço para comer, o seguinte foi chamado por uma festa
// quando era o quinto da fila, e a casa só mandou o terceiro um minuto depois. Agora a busca perdida antes de encher a jarra não é
// tentativa: a casa manda o próximo logo; a busca que falha (sem água, sem caminho, a fila longa demais, as mãos cheias)
// segue valendo a espera; e depois de um load, que não guarda o recado de ninguém, a casa manda de novo.
// A mão da prova põe a manhã, esvazia a jarra e dá o chamado (a fome) ou enche as mãos de quem ia.
// j1 quem ia ao poço é tirado do caminho pela fome: a tentativa da casa fica livre, outro da casa vai em poucos segundos e a
//    jarra é enchida;
// j2 a busca que falha (as mãos cheias diante do poço) segue valendo a espera: ninguém mais vai nos vinte segundos seguintes;
// j3 save e load com alguém a caminho do poço: depois do load a casa manda de novo, e a jarra é enchida;
// e o verificador sem nada novo, e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | jarra ${name} | ${info}`); if (!c) fails.push(name); };
const Vg = G.Vg, W = G.W, V = G.Village, L = G.Life, D = G.Depot;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = M.pronto(WORLD);
const base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const novas = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const used = new Set();
const res = h => [...S.villagers.values()].filter(v => v.home === h.id && !v.captive);
// (who the house may send, by the game's own rule: from ten to seventy)
const able = v => v.age >= 10 && v.age < 70 && v.hp > 60 && !v.aboard && !v.jail && !v.ug && !(S.avatar && S.avatar.id === v.id);
const fetcher = h => res(h).find(v => v.task && v.task.type === 'water' && v.task.home === h.id) || null;
// the houses of a town with a well near, two or more of the house able to go
function houses() {
  const out = [];
  for (const h of S.buildings.values()) {
    if (used.has(h.id) || !h.built || !G.BDEF[h.type] || !G.BDEF[h.type].housing || !V.livable(h)) continue;
    const set = S.settlements.get(h.set); if (!set || !G.Fac.get(set.fac) || (G.War.threat && G.War.threat(set.id))) continue;
    const well = [...S.buildings.values()].filter(b => b.type === 'well' && b.built && b.set === h.set).sort((a, b) => G.dist2(a.x, a.y, h.x, h.y) - G.dist2(b.x, b.y, h.x, h.y))[0];
    if (!well || G.dist(well.x, well.y, h.x, h.y) > 14 || G.dist(well.x, well.y, h.x, h.y) < 4) continue;
    if (res(h).filter(able).length < 2) continue;
    out.push({ h, well, d: G.dist(well.x, well.y, h.x, h.y) });
  }
  return out.sort((a, b) => a.h.id - b.h.id);
}
// the morning, the jar at its end, the house's try free, its people up and fed; lives until one of the house sets out
function setOut(h) {
  god(() => { S.time = 0.1; S.weather.storm = 0; S.weather.rain = 0; h.water = 0.1; h.waterTry = 0; for (const v of res(h)) { v.hunger = Math.min(v.hunger, 15); if (v.sleeping) { Vg.endTask(v); v.sleeping = false; v.inside = 0; } } });
  for (let t = 0; t < 30; t += 0.5) { M.viver(0.5); const a = fetcher(h); if (a) return a; if (S.time > 0.5) S.time = 0.1; }
  return null;
}
const hold = h => { if (S.time > 0.5 || S.time < 0.07) S.time = 0.1; if (h.water < 0.05) h.water = 0.05; };
// lives until another fetch of the house sets out (`max` seconds), then until the jar is full
function again(h, max) {
  let t = 0; for (; t < max; t += 0.5) { M.viver(0.5); hold(h); if (fetcher(h) || L.homeWater(h) > 0.9) break; }
  const who = fetcher(h); const went = t < max; let full = L.homeWater(h) > 0.9, t2 = 0;
  for (; went && !full && t2 < 150; t2 += 0.5) { M.viver(0.5); if (S.time > 0.5) S.time = 0.1; full = L.homeWater(h) > 0.9; }
  return { went, t, who: who ? who.name : null, full, t2 };
}
function stage(want) {
  for (const c of houses()) { used.add(c.h.id); const a = setOut(c.h); if (a && (!want || want(a, c))) return Object.assign(c, { a }); }
  return null;
}
const none = name => ok(name, false, 'nenhuma casa com dois moradores capazes e um poço perto de onde alguém saísse para buscar água');

// ---------------------------------------------------------------- j1
if (on('j1')) {
  const st = stage();
  if (!st) none('j1 a busca perdida para a fome: outro da casa vai logo');
  else {
    const { h, a, d } = st; const try0 = h.waterTry;
    // (the hunger the world calls with: a meal is 1,2 over the 1,05 of the well)
    god(() => { a.hunger = 95; });
    let lost = false, tl = 0; for (; tl < 12 && !lost; tl += 0.25) { M.viver(0.25); hold(h); lost = !(a.task && a.task.type === 'water'); }
    // (the try is free — or already taken again by the next of the house, sent within the same step: the house looks every
    // second, and the step of the test is a quarter of one. In the «cidade» of the generation 20 the try was freed and Tenoch
    // marked a new one 0.1 s before the look — he was in the line already —: the try of the lost fetch is the one that must
    // not stay, T-1034)
    const nxt = fetcher(h), retaken = !!nxt && nxt !== a && h.waterTry > try0;
    const freed = h.waterTry && !retaken, dry = L.homeWater(h) < 0.35, now = a.task ? a.task.type : 'livre';
    const r = again(h, 20); const nv = novas();
    ok('j1 a busca perdida para a fome: outro da casa vai logo', try0 > 0 && lost && dry && !freed && r.went && r.full && !nv.length,
      `${h.type}#${h.id} de ${S.settlements.get(h.set).name}, o poço a ${d.toFixed(0)} casas: ${a.name} ia buscar água (a tentativa marcada: ${try0 > 0}), a fome a tirou do caminho em ${tl.toFixed(1)} s (${now}); a jarra seca ${dry}, a tentativa da casa ${freed ? 'SEGUE MARCADA' : retaken ? `livre, e já tomada de novo por ${nxt.name}, mandado no mesmo passo` : 'livre'}; ${r.went ? `${r.who || 'alguém'} saiu ${r.t.toFixed(1)} s depois` : 'NINGUÉM saiu em 20 s'}; a jarra ${r.full ? `cheia ${r.t2.toFixed(0)} s depois` : 'NÃO foi enchida'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- j2
if (on('j2')) {
  const st = stage();
  if (!st) none('j2 a busca que falha segue valendo a espera');
  else {
    const { h, a, d } = st;
    // (the hands full on the way: at the well there is no hand for the jar — the errand's own failure)
    D.make('v:' + a.id, 'wood', 2, { code: 'teste' });
    let failed = false, tf = 0; for (; tf < 90 && !failed; tf += 0.25) { M.viver(0.25); hold(h); if (a.task && a.task.type === 'water' && a.hunger > 50) a.hunger = 15; failed = !(a.task && a.task.type === 'water'); }
    const mark = h.waterTry, dry = L.homeWater(h) < 0.35, hands = a.carry && a.carry.k === 'wood';
    let other = null; for (let t = 0; t < 20 && !other; t += 0.5) { M.viver(0.5); hold(h); other = fetcher(h); }
    const nv = novas();
    ok('j2 a busca que falha segue valendo a espera', failed && hands && dry && mark > 0 && S.clock - mark < G.DAY_LEN * 0.3 && !other && !nv.length,
      `${h.type}#${h.id} de ${S.settlements.get(h.set).name}: ${a.name}, com lenha nas mãos, ${failed ? `desistiu ${tf.toFixed(1)} s depois` : 'NÃO desistiu em 90 s'} (a lenha nas mãos: ${!!hands}); a jarra seca ${dry}; a tentativa da casa ${mark > 0 ? 'marcada' : 'LIVRE'}; nos 20 s seguintes ${other ? other.name + ' SAIU para o poço' : 'ninguém mais saiu'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- j3
if (on('j3')) {
  const st = stage();
  if (!st) none('j3 save e load com alguém a caminho do poço');
  else {
    const { a, d } = st; const hid = st.h.id, aid = a.id; const try0 = st.h.waterTry;
    M.salvarCarregar(); S = G.S; const h = S.buildings.get(hid), a2 = S.villagers.get(aid);
    const gone = !(a2.task && a2.task.type === 'water'), jar = !!(a2.carry && a2.carry.jar), freed = h.waterTry, dry = L.homeWater(h) < 0.35;
    god(() => { for (const v of res(h)) v.hunger = Math.min(v.hunger, 15); });
    const r = again(h, 20); const nv = novas();
    ok('j3 save e load com alguém a caminho do poço', try0 > 0 && (jar || gone) && dry && !freed && r.went && r.full && !nv.length,
      `${h.type}#${hid} de ${S.settlements.get(h.set).name}: ${a2.name} a caminho do poço no save (a tentativa marcada: ${try0 > 0}); depois do load ${jar ? 'segue com a jarra' : gone ? 'sem o recado' : 'COM o recado'}, a jarra seca ${dry}, a tentativa da casa ${freed ? 'SEGUE MARCADA' : 'livre'}; ${r.went ? `${r.who || 'alguém'} saiu ${r.t.toFixed(1)} s depois` : 'NINGUÉM saiu em 20 s'}; a jarra ${r.full ? `cheia ${r.t2.toFixed(0)} s depois` : 'NÃO foi enchida'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `\njarra: ${fails.length} falha(s): ${fails.join(', ')}` : '\njarra: tudo passou');
process.exit(fails.length ? 1 : 0);
