// sociedade: node qa/sociedade.js [ONLY=so1,so2,…] — os cenários da sociedade (22b; o estudo §6.2), em Node, cada parte no seu mundo:
//   so1 a índole: nove inteiros 0–99 em todos; a mesma pessoa, a mesma índole em duas cargas do mesmo save de antes; a herança (o
//       filho mais perto da média dos pais que de um estranho); nenhuma índole do acaso do mundo (o mesmo mundo da mesma semente, a
//       mesma índole, e o acaso do mundo no mesmo ponto com e sem a índole calculada)
//   so2 a porta única: um ato fora do passo do mundo não faz nada (e conta); dentro, muda os dois lados pela tabela; o teto de 16 e
//       de 8; a família implícita (o filho sente pela mãe sem laço gravado); ninguém com laço consigo
//   so3 o save no meio de uma corte e de uma discussão: os dois que já se gostam, a corte andando, a discussão com os dois postos à
//       distância do ato → save → load duas vezes → o mesmo futuro, e os laços e as marcas iguais depois do load
//   so4 uma pessoa morre com laços: o amigo de luto (curto), o laço sai na passada do dia da cidade, a marca de quem matou fica nos
//       seus (a marca «matou»), o homicídio é crime do mundo (com testemunhas) e a cidade se lembra
//   so5 o Amor Divino une dois que se odiavam: o casal pela porta, e o que sentem continua dito pelos laços (o ódio não some)
//   so6 a cidade muda de povo (a secessão): os laços ficam, ninguém com laço a quem não existe, a fama da cidade fica com ela
//   so7 a guerra: quem morre na mão de um inimigo deixa a marca «matou» na família; o verificador limpo depois
//   so8 a aparência nunca decide: o mesmo mundo com a pele e o cabelo de todos trocados por uma cor só vive o mesmo futuro (byte a byte)
//   so9 o crime entre pessoas: o acerto de contas — a discussão, a briga, a agressão do mundo com a testemunha e a caça —; a testemunha
//       amiga cala, a inimiga corre ao guarda; o ladrão não rouba a casa do amigo
//   so10 o mundo de séculos (anos500): dez anos de salto — os tetos seguram (o verificador), o save por pessoa dentro do orçamento
// Erro de módulo ou aviso do jogo é falha.
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/sociedade-inv.js'] });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const on = k => !ONLY.length || ONLY.includes(k);
// (the parts of the phase 2 — the marks, the crime among people, the fame — only where the game has them: G.Convivio, soc-vida.js)
const P2 = !!G.Convivio; const on2 = k => on(k) && (P2 || (console.log(`pulado | sociedade ${k} | a fase 2 não está nesta versão`), false));
const fails = []; const t0 = Date.now ? process.hrtime.bigint() : 0n; const ms = () => Number((process.hrtime.bigint() - t0) / 1000000n);
const ok = (k, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | sociedade ${k} | ${info}`); if (!c) fails.push(k); };
const sim = fn => { G.inSim++; try { return fn(); } finally { G.inSim--; } };
const L = () => G.Lacos, I = () => G.Indole;
const fp = () => { const s = JSON.stringify([QA.canon(), [...G.S.villagers.values()].map(v => [v.id, v.lacos || 0, v.marcas || 0, v.fama || 0])]); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + '/' + G.S.rng; };
const soc = () => QA.check().filter(q => q.sys === 'sociedade' && q.sev <= 3);
const adults = () => [...G.S.villagers.values()].filter(v => v.age >= 18 && v.age < 55 && !v.captive && !v.jail && !v.aboard && !v.inside && !v.sleeping);
// (to the morning: the proofs that need people awake and out of doors)
const day = () => { let k = 0; while (k++ < 260 && (G.isNight() || G.isEvening() || G.S.time < 0.12)) M.viver(1); };
const pairOf = (pred) => { const A = adults(); for (const a of A) for (const b of A) if (a !== b && a.set === b.set && pred(a, b)) return [a, b]; return null; };

// ------------------------------ so1 the temperament ------------------------------
if (on('so1')) {
  M.pronto('cidade'); const S = G.S; const vs = [...S.villagers.values()];
  const all = vs.every(v => I().ok(v.indole));
  const a1 = vs.map(v => v.indole.join('.')).join('|');
  M.pronto('cidade'); const a2 = [...G.S.villagers.values()].map(v => v.indole.join('.')).join('|');
  ok('so1 a-indole-de-todos', all, `${vs.length} pessoas do mundo pronto «cidade» (um save de antes da índole): ${all ? 'todas com nove inteiros de 0 a 99' : 'ALGUMA SEM'}`);
  ok('so1 a-mesma-em-cada-carga', a1 === a2, `o mesmo save carregado duas vezes: ${a1 === a2 ? 'a mesma índole em todos' : 'ÍNDOLES DIFERENTES'}`);
  // the heritage: a child is nearer its parents' mean than a stranger's temperament is
  const m = { id: 900001, traits: [], indole: [90, 90, 90, 10, 90, 90, 90, 90, 90] }, p = { id: 900002, traits: [], indole: [80, 85, 90, 15, 85, 95, 85, 80, 90] };
  let near = 0, far = 0; for (let k = 0; k < 200; k++) { const c = I().make({ id: 800000 + k, traits: [] }, m, p), x = I().make({ id: 700000 + k, traits: [] }, null, null); near += c[0] + c[1]; far += x[0] + x[1]; }
  ok('so1 a-heranca', near / 200 > far / 200 + 30, `filhos de pais expansivos e bondosos: ext+ama médio ${(near / 200).toFixed(0)}, contra ${(far / 200).toFixed(0)} de quem nasce sem pais`);
  // no chance of the world: the same seed, the same temperaments, and the world's chance at the same point
  M.novo({ seed: 71, type: 'ilha', size: 64, tribes: 2 }); const r1 = G.S.rng, i1 = [...G.S.villagers.values()].map(v => v.indole.join('.')).join('|');
  M.novo({ seed: 71, type: 'ilha', size: 64, tribes: 2 }); const r2 = G.S.rng, i2 = [...G.S.villagers.values()].map(v => v.indole.join('.')).join('|');
  ok('so1 sem-acaso', r1 === r2 && i1 === i2, `a semente 71 duas vezes: acaso ${r1}/${r2}, índoles ${i1 === i2 ? 'iguais' : 'DIFERENTES'}`);
  const bad = soc(); ok('so1 verificador', !bad.length, bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so2 the one door ------------------------------
if (on('so2')) {
  M.pronto('cidade'); day();
  const pr = pairOf((a, b) => !L().kin(a, b) && !L().find(a, b.id)); const [a, b] = pr;
  const f0 = L().fora; const out = L().ato(a, b, 'conversa');
  ok('so2 fora-do-passo', out === false && L().fora === f0 + 1 && !L().find(a, b.id), `um ato fora do passo do mundo: ${out === false ? 'nada feito' : 'FEITO'}, contado (${L().fora - f0})`);
  sim(() => L().ato(a, b, 'conversa'));
  const sa = L().sente(a, b), sb = L().sente(b, a);
  ok('so2 os-dois-lados', sa && sb && sa.afeto > 0 && sb.afeto > 0, `uma conversa no passo: ${a.name} sente afeto ${sa && sa.afeto}, ${b.name} ${sb && sb.afeto}`);
  // the caps
  const others = [...G.S.villagers.values()].filter(o => o !== a && o.age >= 5).slice(0, 30);
  sim(() => { for (const o of others) L().ato(a, o, 'conversa'); });
  const kid = [...G.S.villagers.values()].find(v => v.age >= 6 && v.age < 14);
  if (kid) sim(() => { for (const o of others) if (o !== kid) L().ato(kid, o, 'brincar'); });
  ok('so2 os-tetos', (a.lacos || []).length <= 16 && (!kid || (kid.lacos || []).length <= 8), `um adulto com 30 conversas: ${(a.lacos || []).length} laços (teto 16)${kid ? `; uma criança: ${(kid.lacos || []).length} (teto 8)` : ''}`);
  // the family implicit
  const ch = [...G.S.villagers.values()].find(v => v.mother && G.S.villagers.has(v.mother) && !L().find(v, v.mother));
  const sm = ch && L().sente(ch, G.S.villagers.get(ch.mother));
  ok('so2 a-familia-implicita', !!(sm && sm.afeto >= 50 && sm.kin === 'pai'), ch ? `${ch.name} sente pela mãe afeto ${sm && sm.afeto}, sem laço gravado` : 'ninguém com mãe viva');
  const self = sim(() => L().ato(a, a, 'conversa'));
  ok('so2 consigo-nao', self === false && !L().find(a, a.id), 'um ato de alguém consigo: nada');
  const bad = soc(); ok('so2 verificador', !bad.length, bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so3 the save in the middle ------------------------------
if (on('so3')) {
  M.pronto('metropole'); M.viver(2); day();
  const pr = pairOf((a, b) => a.g !== b.g && !a.partner && !b.partner && !G.Vg.relatedClose(a, b) && Math.abs(a.age - b.age) < 10);
  const [a, b] = pr;
  sim(() => { for (let k = 0; k < 2; k++) { L().ato(a, b, 'conversa'); L().ato(a, b, 'corte', { b: { atr: 1.2 } }); } });
  a.courtCD = 0; G.Vg.setTask(a, { type: 'court', id: b.id, pri: 0.6, kind: 'court' });
  // and an argument: a grudge, the score to settle under way
  // (the test's hand: the two near each other and the one sought idle in the street, so the argument is under way at the save)
  // (to the argument under way — the two at the act's distance —, the courtship under way beside it; without the phase 2, the courtship's
  // talk. A pair whose errand the world takes for something weightier gives way to the next one)
  let c = null, d = null; const tried = new Set();
  for (let n = 0; n < 6; n++) {
    const pr2 = pairOf((x, y) => x !== a && x !== b && y !== a && y !== b && !tried.has(x.id) && !L().kin(x, y) && G.dist(x.x, x.y, y.x, y.y) < 5 && !G.Vg.handsBusy(y) && !G.Vg.handsBusy(x)); if (!pr2) break; [c, d] = pr2; tried.add(c.id);
    sim(() => { L().marca(c, 'bateu', d.id, 90); L().ato(d, c, 'agressao'); });
    if (G.Convivio) { G.Vg.setTask(d, { type: 'idle', pri: 0.1, wait: 40, kind: 'wander' }); G.Vg.setTask(c, { type: 'acerto', id: d.id, papel: 'a', mark: 'bateu', pri: 0.7, st: 0 }); }
    let k = 0; while (k++ < 120 && !(G.Convivio ? c.task && c.task.type === 'acerto' && c.task.st >= 2 : a.task && a.task.type === 'court' && a.task.st >= 2)) { M.viver(0.1); if (G.Convivio && !(c.task && c.task.type === 'acerto')) break; }
    if (G.Convivio ? c.task && c.task.type === 'acerto' && c.task.st >= 2 : true) break;
  }
  const mid = `${a.task ? a.task.type + ' ' + a.task.st : '—'} / ${c.task ? c.task.type + ' ' + c.task.st : '—'}`;
  if (G.Convivio) { const dd = G.Vg.relatedClose ? G.dist(c.x, c.y, d.x, d.y) : 0; ok('so3 a-discussao-em-curso', c.task && c.task.type === 'acerto' && c.task.st >= 2 && d.task && d.task.type === 'duo' && d.task.id === c.id && Math.abs(dd * 4 - G.SocAtos.of('argue').dist) < 0.05, `no save: ${c.name} discute com ${d.name} (${c.task ? c.task.type : '—'} / ${d.task ? d.task.type + ' ' + (d.task.act || '') : '—'}), a ${(dd * 4).toFixed(2)} m, virados um para o outro`); }
  const before = JSON.stringify([a.lacos, b.lacos, c.marcas, c.lacos]);
  const save = G.Save.serialize();
  M.abrir(JSON.parse(save)); const after = JSON.stringify([G.S.villagers.get(a.id).lacos, G.S.villagers.get(b.id).lacos, G.S.villagers.get(c.id).marcas, G.S.villagers.get(c.id).lacos]);
  M.reseed(5); M.viver(40); const f1 = fp();
  M.abrir(JSON.parse(save)); M.reseed(5); M.viver(40); const f2 = fp();
  ok('so3 o-save-guarda', before === after, `no meio (${mid}): os laços e as marcas ${before === after ? 'iguais depois do load' : 'DIFERENTES depois do load'}`);
  ok('so3 o-mesmo-futuro', f1 === f2, `o mesmo save carregado duas vezes, 40 s cada: ${f1} / ${f2}`);
  const bad = soc(); ok('so3 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so4 a person dies with ties ------------------------------
if (on('so4')) {
  M.pronto('cidade'); day(); const S = G.S;
  const pr = pairOf((a, b) => !L().kin(a, b)); const [x, fr] = pr;
  sim(() => { for (let k = 0; k < 8; k++) L().ato(fr, x, 'conversa'); });
  const sf = L().sente(fr, x); const m0 = fr.mourn;
  sim(() => G.Village.kill(x, 'old'));
  ok('so4 o-luto-do-amigo', sf.afeto >= 45 && fr.mourn > m0 && fr.mourn <= G.DAY_LEN * 0.5, `${fr.name} gostava de ${x.name} (afeto ${sf.afeto}): luto de ${(fr.mourn / G.DAY_LEN).toFixed(2)} dia`);
  sim(() => L().dayOf(S.settlements.get(fr.set)));
  ok('so4 o-laco-sai', !L().find(fr, x.id), `depois do dia da cidade: ${L().find(fr, x.id) ? 'O LAÇO COM O MORTO FICOU' : 'o laço com o morto saiu'}`);
  // a murder of the world: the killer known, the kin keep it
  if (P2) {
  const vic = [...S.villagers.values()].find(v => v.age >= 8 && v.mother && S.villagers.has(v.mother) && !v.captive && !v.aboard);
  const k = adults().find(o => o !== vic && o.set === vic.set && !L().kin(o, vic) && o.id !== vic.mother); const mom = S.villagers.get(vic.mother);
  const c0 = (S.crimes || []).length;
  sim(() => { vic.lastBy = k.id; vic.hp = 1; G.Vg.damage(vic, 50, 'homicidio', false, k.id); });
  const mk = (mom.marcas || []).find(q => q[0] === 'matou' && q[1] === k.id);
  const cr = (S.crimes || []).slice(c0).find(c => c.kind === 'homicidio' && c.thief === k.id);
  const mem = (S.settlements.get(vic.set).memoria || []).find(q => q[0] === 'assassinato');
  ok('so4 a-marca-matou', !!mk && mk[4] === vic.id, `${mom.name}, mãe de ${vic.name}, guarda que ${k.name} matou: ${mk ? 'sim (peso ' + mk[3] + ')' : 'NÃO'}`);
  ok('so4 o-homicidio-e-crime', !!cr && !!mem, `o crime do mundo: ${cr ? 'homicídio, ' + cr.seen.length + ' testemunha(s)' : 'NENHUM'}; a cidade se lembra: ${mem ? 'sim' : 'NÃO'}`);
  }
  const bad = soc(); ok('so4 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so5 the Divine Love joins two who hated each other ------------------------------
if (on('so5')) {
  M.pronto('metropole'); day(); const S = G.S;
  const pr = pairOf((a, b) => a.g !== b.g && !a.partner && !b.partner && !G.Vg.relatedClose(a, b) && a.age >= 18 && b.age >= 18); const [a, b] = pr;
  sim(() => { for (let k = 0; k < 3; k++) { L().ato(a, b, 'agressao'); L().ato(b, a, 'agressao'); } });
  const h0 = L().sente(a, b).afeto;
  const how = []; G.Vg.pairHooks.push((p, q, como, on) => { if (on) how.push(como); });
  S.faith = 999; G.Powers.love(a.x, a.y, b.id);
  let k = 0; while (k++ < 900 && a.partner !== b.id) M.viver(0.1);
  const s = L().sente(a, b);
  ok('so5 o-casal-pela-porta', a.partner === b.id && b.partner === a.id && how.includes('amor-divino'), `o Amor Divino: ${a.partner === b.id ? 'o casal formado' : 'SEM CASAL'} (pela porta: ${how.join(', ') || 'nada'})`);
  ok('so5 o-odio-fica-dito', !!s && s.afeto < 30 && h0 < 0, `o que ${a.name} sente por ${b.name}: afeto ${h0} antes, ${s && s.afeto} casados (a família dá 60, a vida tirou)`);
  const bad = soc(); ok('so5 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so6 the town changes people ------------------------------
if (on('so6')) {
  M.pronto('metropole'); const S = G.S;
  const sets = [...S.settlements.values()]; let s = null;
  for (const x of sets) { const f = G.Fac.get(x.fac); if (f && G.Fac.capitalOf(f.id) !== x && G.Village.pop(x.id) >= 6) { s = x; break; } }
  if (!s) ok('so6 a-secessao', false, 'nenhuma cidade fora da capital no mundo pronto');
  else {
    const folk = [...S.villagers.values()].filter(v => v.set === s.id && v.age >= 10).slice(0, 6);
    sim(() => { for (let i = 0; i < folk.length; i++) for (let j = i + 1; j < folk.length; j++) L().ato(folk[i], folk[j], 'conversa'); if (P2) for (const v of folk) G.Fama.feito(v, 'ajudou', s.id); });
    const t0 = new Map(folk.map(v => [v.id, (v.lacos || []).map(t => t[0])])); const f0 = s.fac;
    sim(() => G.Politics.secede(s, null));
    M.viver(5);
    // (the people are the same: every tie of before still there, to the same ones — the day may have added others)
    let lost = 0; for (const v of folk) { if (!S.villagers.has(v.id)) continue; const now = new Set((v.lacos || []).map(t => t[0])); for (const id of t0.get(v.id)) if (S.villagers.has(id) && !now.has(id)) lost++; }
    ok('so6 a-secessao', s.fac !== f0 && !lost, `${s.name} deixou o povo ${f0} pelo ${s.fac}: dos laços de ${folk.length} pessoas, ${lost ? lost + ' PERDIDOS' : 'nenhum perdido'}`);
    if (P2) ok('so6 a-fama-fica', folk.some(v => G.Fama.de(v, s.id)), 'a fama de quem ajudou na cidade fica com a cidade');
    const bad = soc(); ok('so6 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
  }
}

// ------------------------------ so7 the war ------------------------------
if (on2('so7')) {
  M.pronto('mundial'); const S = G.S;
  // one killed by a soldier of a people at war: the kin keep who did it
  let pair = null;
  // (a war, if the world has none at this hour: two peoples by the world's door)
  if (![...S.factions.values()].some(f => f.alive !== false && G.Fac.enemiesOf(f.id).length)) { const fs = [...S.factions.values()].filter(f => f.alive !== false && G.Fac.pop(f.id) > 10); if (fs.length >= 2) sim(() => G.Politics.declareWar(fs[0], fs[1], 'fronteira')); }
  for (const f of S.factions.values()) { const en = G.Fac.enemiesOf(f.id); if (!en.length) continue; const sol = [...S.villagers.values()].find(v => G.Fac.idOfV(v) === en[0].id && v.age >= 18 && !v.captive); const kinOf = v => [v.mother, v.father, v.partner, ...(v.kids || [])].map(id => S.villagers.get(id)).find(o => o && o.age >= 6);
    const vic = [...S.villagers.values()].find(v => G.Fac.idOfV(v) === f.id && !v.captive && kinOf(v)); if (sol && vic) { pair = [sol, vic, kinOf(vic)]; break; } }
  if (!pair) ok('so7 a-guerra', false, 'nenhum povo em guerra no mundo pronto');
  else {
    const [sol, vic, mom] = pair;
    sim(() => { vic.hp = 1; G.Vg.damage(vic, 40, 'war', false, sol.id); });
    const mk = (mom.marcas || []).find(q => q[0] === 'matou' && q[1] === sol.id);
    ok('so7 a-marca-da-guerra', !!mk, `${vic.name} morto na guerra por ${sol.name}, do povo inimigo: ${mom.name}, da família, ${mk ? 'guarda quem matou' : 'NÃO GUARDA'}`);
    M.saltar(1);
    const bad = soc(); ok('so7 verificador', !bad.length && M.limpo(), `um ano de salto da guerra mundial: ${bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo'}`);
  }
}

// ------------------------------ so8 the look never decides ------------------------------
if (on('so8')) {
  M.pronto('cidade'); const save = G.Save.serialize();
  M.abrir(JSON.parse(save)); M.reseed(9); M.viver(60); const a = fp();
  const o = JSON.parse(save); for (const v of o.villagers) { v.skin = '#808080'; v.hair = '#808080'; v.kidCloth = '#808080'; }
  M.abrir(o); M.reseed(9); M.viver(60); const b = fp();
  ok('so8 a-aparencia-nao-decide', a === b, `o mesmo save com a pele, o cabelo e a roupa de criança de todos numa cor só, 60 s: ${a} / ${b}`);
}

// ------------------------------ so9 the crime among people ------------------------------
if (on2('so9')) {
  M.pronto('metropole'); day(); const S = G.S; G.S.divinePeace = 9e9;
  // the score settled: a grudge deep enough, one quick to anger
  const pr = pairOf((a, b) => !L().kin(a, b) && a.age >= 20 && b.age >= 20 && a.hp > 80 && b.hp > 80 && !G.Vg.handsBusy(b) && G.dist(a.x, a.y, b.x, b.y) < 6);
  const [a, b] = pr; a.indole = a.indole.slice(); a.indole[1] = 5; a.indole[3] = 95; a.indole[2] = 5; // (the test's hand on a temperament: quick to anger)
  sim(() => { L().marca(a, 'bateu', b.id, 95); for (let k = 0; k < 3; k++) L().ato(b, a, 'agressao'); });
  const c0 = (S.crimes || []).length; let res = null; const tries = [];
  for (let k = 0; k < 6 && !res; k++) {
    // (the test's hand: the other one idle in the street, where the one with the grudge finds him)
    G.Vg.setTask(b, { type: 'idle', pri: 0.1, wait: 40, kind: 'wander' });
    G.Vg.setTask(a, { type: 'acerto', id: b.id, mark: 'bateu', pri: 0.7, st: 0 });
    let n = 0; while (n++ < 400 && a.task && a.task.type === 'acerto') M.viver(0.1);
    tries.push(a.task ? a.task.type : '—');
    res = (S.crimes || []).slice(c0).find(c => c.thief === a.id && (c.kind === 'agressao' || c.kind === 'homicidio'));
    if (!res) { const t = L().find(a, b.id); if (t) t[5] = S.day - 1; } // (faced today: another day)
  }
  ok('so9 o-acerto-de-contas', !!res, `${a.name}, de pavio curto, foi tirar satisfação com ${b.name} (${tries.join(', ')}): ${res ? res.kind + ' — ' + res.seen.length + ' testemunha(s)' : 'só palavras'}`);
  // the witness who weighs the ties
  // (a thief the town does not know as one: the friend of a known thief or aggressor keeps quiet half as often — G.Fama, D-578)
  const th = [...S.villagers.values()].find(v => v !== a && v !== b && v.age >= 18 && v.set === a.set && !G.Fama.de(v)); const fr = [...S.villagers.values()].find(v => v !== th && !L().kin(v, th) && v.age >= 16 && v.set === th.set);
  const en = [...S.villagers.values()].find(v => v !== th && v !== fr && !L().kin(v, th) && v.age >= 16 && v.set === th.set);
  sim(() => { for (let k = 0; k < 10; k++) L().ato(fr, th, 'conversa'); L().ato(th, en, 'agressao'); L().ato(th, en, 'agressao'); });
  fr.indole = fr.indole.slice(); fr.indole[5] = 0;
  // (over twenty crimes: the friend of no honesty keeps quiet in most — 85 % —, the enemy always runs to the guard)
  let cala = 0, corre = 0; for (let c = 1; c <= 20; c++) { if (G.Convivio.denuncia(fr, th, { id: c }) === 'cala') cala++; if (G.Convivio.denuncia(en, th, { id: c }) === 'corre') corre++; }
  ok('so9 a-testemunha', cala >= 12 && corre === 20, `em vinte crimes: ${fr.name}, ${fr.g === 'f' ? 'amiga desonesta' : 'amigo desonesto'} do ladrão, cala em ${cala}; ${en.name}, inimig${en.g === 'f' ? 'a' : 'o'} dele, corre ao guarda em ${corre}`);
  // the thief never robs a friend's house
  const ties = G.Convivio.casas(th); const frHome = fr.home;
  ok('so9 a-casa-do-amigo', !frHome || ties.no.has(frHome), frHome ? `a casa de ${fr.name}, ${fr.g === 'f' ? 'amiga' : 'amigo'} do ladrão: ${ties.no.has(frHome) ? 'fora da lista' : 'NA LISTA'}` : 'a amiga sem casa');
  const bad = soc(); ok('so9 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so10 the world of centuries ------------------------------
if (on('so10')) {
  M.pronto('anos500'); const S = G.S;
  const b0 = JSON.stringify(JSON.parse(G.Save.serialize()).villagers).length / S.villagers.size;
  M.saltar(+(process.env.ANOS || 10));
  const o = JSON.parse(G.Save.serialize()); const b1 = JSON.stringify(o.villagers).length / o.villagers.length;
  const lens = o.villagers.map(v => (v.lacos || []).length); const mx = Math.max(...lens), avg = lens.reduce((x, y) => x + y, 0) / lens.length;
  ok('so10 os-tetos', mx <= 16, `${process.env.ANOS || 10} anos de salto nos 500 anos: ${o.villagers.length} pessoas, laços ${avg.toFixed(1)} em média, ${mx} no máximo`);
  ok('so10 o-orcamento', b1 - b0 <= 600, `o save por pessoa: ${Math.round(b0)} B antes, ${Math.round(b1)} B depois (+${Math.round(b1 - b0)}, orçamento +600)`);
  const bad = soc(); ok('so10 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (!M.limpo()) console.log('ERROS: ' + JSON.stringify(M.erros()).slice(0, 800));
console.log(fails.length ? `FALHOU: ${fails.join(', ')} (${ms()} ms)` : `PASSOU (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
