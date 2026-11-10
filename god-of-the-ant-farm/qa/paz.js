// paz: a paz provocada de propósito, e o que ela traz — o tratado, os soldados de volta, os presos trocados (T-125).
//   node qa/paz.js [semente]
// O caso 7 do guerra10 («medium») julga a paz da guerra que aquele mundo encontra sozinho; com o navegador da máquina de
// 28/10 (o Chrome 153 no lugar do Chromium 1194, T-123) a guerra daquele mundo acaba pela conquista — o povo que perde
// deixa de existir, e não há tratado a julgar. Aqui os dois reinos crescem em paz (como no derrota.js), a guerra começa,
// o exército de A marcha contra a capital de B e a guarda dela se levanta (os que a guerra já levantou; só o que falta, pela
// porta do jogo); depois da primeira batalha de campo (ou de um
// dia e meio), B, cansado, aceita a paz que A oferece, pela porta do jogo (G.Politics.answerPeace). p1 a guerra acaba com
// um tratado (nome e termos); p2 os dois povos deixam de estar em guerra (trégua ou vassalagem) e o registro da guerra
// fecha, com os mortos contados; p3 os soldados voltam: logo depois da paz nenhum bando da guerra marcha mais contra o
// outro, e em dois dias os exércitos terminam e os bandos se desfazem; p4 os presos de um e de outro foram trocados; p5 a
// paz que vem de fora do tratado com um convocado numa cena (L-641): ele larga o chamado quando a cena o devolve, e o
// exército encerrado na reunião fecha disperso; p6 o load encerra disperso o exército em reunião que não tem mais ninguém
// de pé (L-641); o verificador limpo do começo ao fim, sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const seed = +(process.argv[2] || 11);
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | paz ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = (sec, until) => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 50 === 0) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
let S = M.novo({ seed, type: 'continente', size: 170, tribes: 2, temper: 'pacifico', relevo: 'suave' });
// two kingdoms of some hundreds, kept at peace while they grow (as in qa/derrota.js), with food and an armoury
const dw = G.Politics.declareWar; G.Politics.declareWar = () => { };
while (S.day < 6) M.viver(10);
G.Politics.declareWar = dw;
const [A, B] = G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)).slice(0, 2);
const grow = (f, want) => { const sets = G.Fac.settlementsOf(f.id); let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const s = sets[k % sets.length]; const a = G.R() * 6.283, r = G.R() * (s.radius || 6); const p = G.W.nearestLand(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r, 5); if (!p) continue; G.Vg.create({ set: s.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); } f.stock.food = Math.max(f.stock.food, want * 7); f.stock.armas = (f.stock.armas || 0) + Math.round(want * 0.15); };
grow(A, 320); grow(B, 260); G.Fac.updateTerritory();
G.Politics.declareWar(A, B, 'ambicao'); live(5);
const Wz = G.Wars; const w = Wz.warOf(A.id, B.id); let tg = G.Fac.capitalOf(B.id);
// (the armies the war raised, and by the game's door only what is missing — as in qa/derrota.js: in the generation 19 the war
// had called both in its first five seconds, and the hand's second guard of Mênfis took four of the first, «#5458 em dois
// exércitos (3 e 5)»)
const raised = (f, role, t) => w && Wz.state().armies.find(a => !a.done && a.war === w.id && a.fac === f.id && a.role === role && (!t || a.target === t.id));
const host0 = raised(A, 'campanha'); if (host0) tg = G.S.settlements.get(host0.target);
const host = w && tg && (host0 || Wz.mobilize(w, G.Fac.get(A.id), 'campanha', tg, {}));
const guard = w && tg && (raised(B, 'defesa', tg) || Wz.mobilize(w, G.Fac.get(B.id), 'defesa', tg, {}));
console.log(`(${A.name} ${G.Fac.pop(A.id)} contra ${B.name} ${G.Fac.pop(B.id)}; exército ${host ? host.members.length : '-'} contra a guarda de ${tg ? tg.name : '-'} ${guard ? guard.members.length : '-'})`);
if (!w || !host || !guard) { ok('p1 o tratado', false, `precondição: ${!w ? 'sem guerra' : !host ? A.name + ' não convocou' : B.name + ' não convocou a guarda'}`); process.exit(1); }
// the war goes on until it has hurt someone (a field battle, as qa/derrota.js) or a day and a half has passed
const field = () => Wz.state().battles.filter(b => !b.naval && !b.town && !b.open && Object.keys(b.sides).length >= 2 && Object.keys(b.sides).map(Number).includes(A.id) && Object.keys(b.sides).map(Number).includes(B.id));
live(G.DAY_LEN * 1.5, () => field().length > 0 || !A.alive || !B.alive);
const bandsOf = () => [...G.War.bands.values()].filter(b => (b.fac === A.id && b.enemy === B.id) || (b.fac === B.id && b.enemy === A.id));
const capsOf = () => [...S.villagers.values()].filter(v => v.captive && ((v.captive.from === A.id && G.Fac.idOfV(v) === B.id) || (v.captive.from === B.id && G.Fac.idOfV(v) === A.id)));
const bands0 = bandsOf().length, caps0 = capsOf().length, battles = field().length;
// the peace: B worn out (a war of a day and a half and a battle lost or not) answers the peace A offers — the game's own
// answer, with its own terms (a refusal on the same day is the game's: try again the next day, three times at most)
const r = G.Fac.rel(A.id, B.id); let made = false, tries = 0;
while (A.alive && B.alive && !made && tries++ < 3) { B.weariness = 100; made = G.Politics.answerPeace(A, B, r); if (!made) live(G.DAY_LEN); }
ok('p1 o tratado', made && !!w.treaty && !!w.treaty.name, made && w.treaty ? `${w.treaty.name}: ${(w.treaty.terms || []).join('; ') || 'sem termos'} (${battles} batalha(s) antes; ${tries} tentativa(s))` : `${!A.alive || !B.alive ? 'um dos povos acabou antes da paz' : 'a paz não foi aceita em três dias'}`);
ok('p2 o fim da guerra', !G.Fac.atWar(A.id, B.id) && !!w.end && ['tregua', 'vassalo'].includes(r.st) && Number.isFinite(w.dead), `em guerra ${G.Fac.atWar(A.id, B.id)}; fim ${w.end || '-'}; ${r.st}; mortos ${w.dead}`);
// right after the peace no band of this war still marches on the other; in two days the armies end and the bands are gone
const marching = bandsOf().filter(b => b.st !== 'retorno');
live(G.DAY_LEN * 2, () => host.done && guard.done && !bandsOf().length);
ok('p3 os soldados voltam', !marching.length && host.done && guard.done && !bandsOf().length, `${bands0} bando(s) na guerra; logo depois da paz ${marching.length} ainda marchando; em dois dias: exército ${host.done ? 'encerrado' : host.phase}, guarda ${guard.done ? 'encerrada' : guard.phase}, ${bandsOf().length} bando(s) de pé`);
ok('p4 os presos trocados', !capsOf().length, `${caps0} preso(s) de um e de outro antes da paz; ${capsOf().length} depois`);
// p5 (L-641) a guerra que acaba fora do tratado, com um convocado numa cena: A declara de novo e convoca; um dos
// convocados, a caminho do ponto de reunião, é levado por uma cena que guarda o chamado e o devolve no fim (como a
// despedida à porta, a cv-chamado do story-war.js); o deus faz a Paz Divina (a porta do poder, G.Powers.peace), e o fim
// calado da guerra — o mesmo de um povo que deixa de existir — encerra o exército ainda na reunião. Quando a cena devolve
// o chamado, ele o larga, e o exército fecha disperso (antes fechava em «mobilizar», e quem a cena devolvia ia treinar no
// ponto de reunião para sempre, por um exército encerrado)
const Sn = G.Scene;
Sn.define('qa-despedida', { imp: 1, *gen(c) { if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada'; yield 12; return 'ok'; } });
const levy = () => { if (!G.Fac.atWar(A.id, B.id)) G.Politics.declareWar(A, B, 'ambicao'); const w1 = Wz.warOf(A.id, B.id); const t1 = G.Fac.capitalOf(B.id); return w1 && t1 ? Wz.mobilize(w1, G.Fac.get(A.id), 'campanha', t1, {}) : null; };
{
  const h5 = A.alive && B.alive ? levy() : null; const w5 = h5 && Wz.get(h5.war);
  const v5 = h5 && h5.members.map(id => S.villagers.get(id)).find(v => v && v.task && v.task.type === 'muster' && v.task.army === h5.id);
  const sc = v5 && Sn.play('qa-despedida', { cast: { p: v5.id } });
  const kept = () => { const pt = Sn.prevTask(v5); return !!pt && pt.type === 'muster' && pt.army === h5.id; };
  if (!sc || !kept()) ok('p5 a paz com um convocado numa cena', false, `precondição: ${!h5 ? A.name + ' não convocou' : !v5 ? 'nenhum convocado a caminho' : 'a cena não guardou o chamado'}`);
  else {
    G.Powers.peace(v5.x, v5.y);
    let k = 0; while (!h5.done && k++ < 30) M.viver(0.1);
    const inScene = kept() && sc.st === 'run'; const phase0 = h5.phase;
    k = 0; while (sc.st === 'run' && k++ < 400) M.viver(0.1);
    // (the scene gives the call back in its own turn, after the people's: the call is looked at in the next step)
    M.viver(0.1); M.viver(0.1);
    live(30);
    const t5 = v5.task; const still = S.villagers.has(v5.id) && !!t5 && t5.type === 'muster';
    ok('p5 a paz com um convocado numa cena', inScene && !!w5 && !!w5.end && h5.done && h5.phase === 'dispersado' && !still, `${v5.name} na cena quando ${h5.name} encerrou: ${inScene ? 'sim' : 'não'} (guerra ${w5 && w5.end ? 'acabada no ano ' + w5.end : 'de pé'}; exército ${h5.done ? 'encerrado' : 'aberto'} em «${phase0}»); a cena acabou (${sc.result}); 30 s depois ${v5.name} ${still ? `ainda no chamado (${v5.act || '-'})` : `largou o chamado (${t5 ? t5.type : 'sem tarefa'})`}; o exército em «${h5.phase}»`);
  }
}
// p6 (L-641) o exército que o load encontra sem ninguém: uma convocação nova, e o deus fulmina os convocados antes que a
// reunião desista deles; o mundo é salvo e carregado ali mesmo — o load (o resume do wars.js) encerra o exército sem
// ninguém de pé com a fase de quem acabou, «dispersado», não «mobilizar»
{
  const h6 = A.alive && B.alive ? levy() : null; let n6 = 0;
  if (!h6) ok('p6 o load de um exército sem ninguém', false, `precondição: ${A.name} não convocou`);
  else {
    for (const id of h6.members) { const v = S.villagers.get(id); if (v) { G.Village.kill(v, 'god', true); n6++; } }
    M.salvarCarregar(); S = G.S;
    const a6 = Wz.army(h6.id); live(5);
    ok('p6 o load de um exército sem ninguém', !!a6 && a6.done && a6.phase === 'dispersado', `${n6} convocado(s) fulminado(s) a caminho da reunião; depois do load: ${a6 ? `${a6.name} ${a6.done ? 'encerrado' : 'aberto'} em «${a6.phase}»` : 'o exército sumiu'}`);
  }
}
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
