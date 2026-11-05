// paz: a paz provocada de propósito, e o que ela traz — o tratado, os soldados de volta, os presos trocados (T-125).
//   node qa/paz.js [semente]
// O caso 7 do guerra10 («medium») julga a paz da guerra que aquele mundo encontra sozinho; com o navegador da máquina de
// 28/10 (o Chrome 153 no lugar do Chromium 1194, T-123) a guerra daquele mundo acaba pela conquista — o povo que perde
// deixa de existir, e não há tratado a julgar. Aqui os dois reinos crescem em paz (como no derrota.js), a guerra começa,
// o exército de A marcha contra a capital de B e a guarda dela se levanta; depois da primeira batalha de campo (ou de um
// dia e meio), B, cansado, aceita a paz que A oferece, pela porta do jogo (G.Politics.answerPeace). p1 a guerra acaba com
// um tratado (nome e termos); p2 os dois povos deixam de estar em guerra (trégua ou vassalagem) e o registro da guerra
// fecha, com os mortos contados; p3 os soldados voltam: logo depois da paz nenhum bando da guerra marcha mais contra o
// outro, e em dois dias os exércitos terminam e os bandos se desfazem; p4 os presos de um e de outro foram trocados; o
// verificador limpo do começo ao fim, sem erro de módulo.
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
const Wz = G.Wars; const w = Wz.warOf(A.id, B.id); const tg = G.Fac.capitalOf(B.id);
const host = w && tg && Wz.mobilize(w, G.Fac.get(A.id), 'campanha', tg, {});
const guard = w && tg && Wz.mobilize(w, G.Fac.get(B.id), 'defesa', tg, {});
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
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
