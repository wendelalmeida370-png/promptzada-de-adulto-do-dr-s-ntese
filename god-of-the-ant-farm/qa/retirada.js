// retirada: a hoste que recua em contato com o inimigo sai do campo — foge ou se rende, não morre onde a ordem a achou.
//   node qa/retirada.js [semente]
// O caso 6 do guerra10 «medium» (reg17) achou a Batalha de Argos com 143 mortos dos 150 do lado que atacou: a Legião do
// Leste, em guerrilha diante de Argos, perdeu seis em dez e o bando recuou («República de Lavínio recuou de Argos»); os 56
// das companhias que não tinham quebrado ficaram onde a retirada os achou, lutando com quem estivesse a quatro casas — o
// povo de Argos em armas, vinte colados em cada um —, e morreram todos em 22 s, a 54 casas de casa. Aqui os dois reinos do
// derrota.js: A manda uma hoste contra a capital do B, e quando ela está em contato (quatro ou mais dela, das companhias de
// pé, a um passo do inimigo) a retirada é ordenada pela porta do jogo, a mesma das cinco regras que mandam recuar (as perdas
// do bando, a debandada da hoste, o campeão que cai, o cerco levantado, a fome: G.War.retreat), como o paz.js faz o B
// aceitar a paz. r1 a hoste em contato quando recua (a premissa); r2 quem recua não procura briga nem responde a ela: no
// meio minuto depois da ordem, ninguém do bando luta; r3 a retirada sai do campo: quem fica de pé e livre se afasta de onde
// a ordem o achou (ou já chegou em casa), e a hoste não morre até o último homem; r4 e r5 o mesmo com o mundo salvo e
// carregado logo depois da ordem (a volta que o load refaz, wars.js) — a partir do mundo de antes da hoste do r1, guardado
// num save e aberto de novo (T-867); o verificador limpo do começo ao fim, sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const seed = +(process.argv[2] || 11);
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | retirada ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = (sec, until) => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 50 === 0) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
let S = M.novo({ seed, type: 'continente', size: 170, tribes: 2, temper: 'pacifico', relevo: 'suave' });
// two kingdoms of some hundreds, kept at peace while they grow (as qa/derrota.js), with food and an armoury
const dw = G.Politics.declareWar; G.Politics.declareWar = () => { };
while (S.day < 6) M.viver(10);
G.Politics.declareWar = dw;
let [A, B] = G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)).slice(0, 2);
const grow = (f, want) => { const sets = G.Fac.settlementsOf(f.id); let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const s = sets[k % sets.length]; const a = G.R() * 6.283, r = G.R() * (s.radius || 6); const p = G.W.nearestLand(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r, 5); if (!p) continue; G.Vg.create({ set: s.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); } f.stock.food = Math.max(f.stock.food, want * 7); f.stock.armas = (f.stock.armas || 0) + Math.round(want * 0.15); };
grow(A, 320); grow(B, 260); G.Fac.updateTerritory();
G.Politics.declareWar(A, B, 'ambicao'); live(5);
const Wz = G.Wars; let tg = G.Fac.capitalOf(B.id);
console.log(`(${A.name} ${G.Fac.pop(A.id)} contra ${B.name} ${G.Fac.pop(B.id)}; a capital do B: ${tg ? tg.name : '-'})`);
// enemies who fight, within r of someone; a soldier of a company that broke runs already, whatever the band does
const foesNear = (v, fac, r) => { let n = 0; for (const o of G.War.fightersNear(v.x, v.y, r)) { if (o.captive || !G.Fac.atWar(fac, G.Fac.idOfV(o))) continue; if (G.dist2(o.x, o.y, v.x, v.y) < r * r) n++; } return n; };
const routed = (v, b) => { const co = b.army && v.task && v.task.co ? b.army.cos.find(c => c.id === v.task.co) : null; return !!(co && co.rout) || !!(v.task && v.task.fled); };
// a host against the capital; in contact, the retreat (a host that ends or goes home before it touches the enemy is the
// world's: a new one is sent, three at most, and the proof says why); then half a minute of the road
function stage(save) {
  const why = []; let order = null;
  for (let n = 0; n < 3 && !order; n++) {
    // (a war the last host's end wore out to a peace is declared again, as qa/volta.js does)
    if (A.alive && B.alive && !Wz.warOf(A.id, B.id)) G.Politics.declareWar(A, B, 'ambicao');
    const w = Wz.warOf(A.id, B.id);
    const host = w && tg && Wz.mobilize(w, G.Fac.get(A.id), 'campanha', tg, {});
    if (!host) { why.push(`${A.name} não convocou`); live(G.DAY_LEN * 0.3); continue; }
    const id = host.id; let b = null, inContact = [];
    live(G.DAY_LEN * 2.5, () => {
      const a = Wz.army(id); if (!a || a.done) return true;
      b = a.band ? G.War.bands.get(a.band) : null; if (!b || b.st === 'retorno') return false;
      inContact = b.members.map(k => S.villagers.get(k)).filter(v => v && v.task && v.task.type === 'band' && !routed(v, b) && foesNear(v, b.fac, 2) > 0);
      return inContact.length >= 4;
    });
    if (b && G.War.bands.has(b.id) && b.st !== 'retorno' && inContact.length >= 4) {
      const ms = b.members.map(k => S.villagers.get(k)).filter(Boolean);
      order = { army: id, band: b.id, ids: ms.map(v => v.id), near: inContact.length, at: new Map(ms.map(v => [v.id, [v.x, v.y]])), ph: b.army ? b.army.phase : b.st, rout: b.army ? b.army.cos.filter(c => c.rout).length + '/' + b.army.cos.length : '-' };
      G.War.retreat(b);
      break;
    }
    const a = Wz.army(id);
    why.push(`a ${n + 1}ª ${a && a.done ? 'acabou' : 'voltou para casa'} sem tocar o inimigo (${a ? a.phase : '-'})`);
    live(G.DAY_LEN * 0.5, () => { const x = Wz.army(id); return !x || x.done; });
  }
  if (!order) return { pre: why.join('; ') };
  if (why.length) console.log(`(${save ? 'r4' : 'r1'}: ${why.join('; ')})`);
  // (right after the order, before the army's own tick: the save keeps the army, not the band — what the load makes of it)
  let post = null;
  if (save) {
    M.salvarCarregar(); S = G.S;
    const a = Wz.army(order.army); const b = a && a.band ? G.War.bands.get(a.band) : null;
    post = { phase: a ? a.phase : '-', retreat: !!(b && b.st === 'retorno' && b.retreat), muster: order.ids.filter(x => { const v = S.villagers.get(x); return v && v.task && v.task.type === 'muster'; }).length };
  }
  // who of the retreat fights, every half second (after the first second: a blow already begun lands)
  let fights = 0, maxF = 0, samples = 0;
  for (let k = 1; k <= 300; k++) {
    M.viver(0.1);
    if (k % 50 === 0) watch();
    if (k < 10 || k % 5) continue;
    const b = G.War.bands.get(order.band); samples++;
    const f = b ? b.members.map(x => S.villagers.get(x)).filter(v => v && v.task && v.task.type === 'band' && v.act === 'fight').length : 0;
    fights += f; maxF = Math.max(maxF, f);
  }
  watch();
  const alive = order.ids.map(x => S.villagers.get(x)).filter(Boolean);
  const caught = alive.filter(v => v.captive), free = alive.filter(v => !v.captive);
  const away = free.filter(v => { const p = order.at.get(v.id); return G.dist(v.x, v.y, p[0], p[1]) >= 6; });
  return { order, post, fights, maxF, samples, dead: order.ids.length - alive.length, caught: caught.length, free: free.length, away: away.length };
}
const txt = r => `${r.order.ids.length} na hoste, ${r.order.near} das companhias de pé a um passo do inimigo (${r.order.ph}; companhias quebradas ${r.order.rout})`;
const snap = G.Save.serialize();
const r1 = stage(false);
ok('r1 a hoste em contato quando recua', !r1.pre, r1.pre ? `precondição: ${r1.pre}` : txt(r1));
if (!r1.pre) {
  ok('r2 quem recua não luta', r1.fights === 0, `em ${r1.samples} olhadas de meio segundo, ${r1.fights} vezes alguém do bando lutando (no pior instante, ${r1.maxF})`);
  ok('r3 a retirada sai do campo', r1.dead < r1.order.ids.length * 0.9 && r1.away >= r1.free * 0.6, `30 s depois: ${r1.dead} mortos, ${r1.caught} rendidos, ${r1.free} de pé e livres, ${r1.away} deles a seis casas ou mais de onde a ordem os achou`);
}
// the same with the world saved and loaded right after the order: the load makes the road home again (wars.js, walkHome)
// (from the world of before r1's host, saved at that hour and opened again: r4 is r1 with the save after the order, not a
// second campaign of the same war. The realm the first campaign wore out — the war's own count of the dead and the days, a
// quarter of the food — raises forty; forty burn the fields of the first village on the road, far from the walls, and whether
// they meet the enemy there is the history's luck: three hosts in a row went home without it, T-867)
S = M.abrir(JSON.parse(snap)); A = G.Fac.get(A.id); B = G.Fac.get(B.id); tg = G.Fac.capitalOf(B.id);
const r4 = stage(true);
ok('r4 a hoste em contato quando recua, e o save logo depois', !r4.pre, r4.pre ? `precondição: ${r4.pre}` : txt(r4));
// (the load keeps the retreat: the army comes back «retirada», its band on the road home, no one called to arms again)
if (!r4.pre) ok('r5 depois do load, a retirada segue: ninguém luta e sai do campo', r4.post.phase === 'retirada' && r4.post.retreat && !r4.post.muster && r4.fights === 0 && r4.dead < r4.order.ids.length * 0.9 && r4.away >= r4.free * 0.6, `depois do load: exército «${r4.post.phase}», ${r4.post.retreat ? 'o bando de volta, em retirada' : 'sem bando em retirada'}, ${r4.post.muster} chamados de novo às armas; ${r4.fights} vezes alguém lutando (pior ${r4.maxF}); 30 s depois: ${r4.dead} mortos, ${r4.caught} rendidos, ${r4.free} de pé e livres, ${r4.away} a seis casas ou mais de onde a ordem os achou`);
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
