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
//   so11 o boato nasce e corre (fase 3): uma agressão do mundo com testemunha vira boato no dia da cidade — a testemunha e a vítima
//       sabem por nome («viu»), a família «soube» —; a parte da cidade cresce dia a dia, quem sabe pela parte é a amostra do hash; a
//       cidade aonde ninguém o levou não sabe; a verdade fica no crime (o culpado do boato é o do crime)
//   so12 os portadores: quem sabe por nome, nas ruas de outra cidade, leva o boato (uma linha nova, menos fiel); o forasteiro ouve a
//       conversa de lá e a leva para casa; o portador que morre na estrada não leva nada
//   so13 a distorção e o desmentido: com a fidelidade baixa o culpado vira um dos suspeitos que a cidade já tinha (a fama de quem
//       furta), nunca um qualquer; a testemunha que mora ali desmente — o nome do inocente limpo, quem espalhou menos acreditado —; o
//       julgamento traz a versão de volta à verdade
//   so14 o save no meio de um boato: os boatos e o que cada um sabe iguais depois do load, o mesmo futuro em duas cargas; o save
//       danificado (boatos tortos, quem sabe um boato que não existe) carrega limpo
//   so15 a cidade muda de povo com boatos correndo: as linhas ficam com a cidade, nada se quebra
//   (a faixa do corpo — o que a pessoa vivida ouve — é provada com o corpo: qa/sociedade-corpo.js c1)
//   so20 a vida muda quem se é: quem perde um filho fica mais nervoso e mais calado; quem mata na guerra, menos bondoso; nada fora do passo
//   so17 a conversa do secrets.js é um boato: o calor é a parte da cidade, contada de novo esquenta, o governante a cala
//   so18 a lenda e a memória do povo: quem morre com um nome pesado vira lenda nas palavras da cidade; o que passou pela maior parte
//       das cidades de um povo fica na memória dele
//   so19 o ódio de quem governa: a estima que os boatos levaram e as marcas de quem perdeu alguém pela mão dele baixam o que os
//       estados esperam; o levante tem rostos (quem tem um morto a vingar)
// Erro de módulo ou aviso do jogo é falha.
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/sociedade-inv.js'] });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const on = k => !ONLY.length || ONLY.includes(k);
// (the parts of the phase 2 — the marks, the crime among people, the fame — only where the game has them: G.Convivio, soc-vida.js)
const P2 = !!G.Convivio; const on2 = k => on(k) && (P2 || (console.log(`pulado | sociedade ${k} | a fase 2 não está nesta versão`), false));
const P3 = !!G.Boatos; const on3 = k => on(k) && (P3 || (console.log(`pulado | sociedade ${k} | a fase 3 não está nesta versão`), false));
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

// ============================== the phase 3: the rumours ==============================
const Bo = () => G.Boatos;
// (a building of a town whose ground the town's quarters have: where to stand to be in its streets)
const streetOf = set => { for (const b of G.S.buildings.values()) { if (b.set !== set.id || !b.built) continue; const p = G.Vg.door ? G.Vg.door(b) : [b.x, b.y]; for (const q of [p, [b.x - 1, b.y - 1], [b.x + (b.w || 1), b.y + (b.h || 1)]]) { const u = G.Urban.at(q[0] + 0.5, q[1] + 0.5); if (u && u.set === set.id && G.W.walkableXY(Math.floor(q[0]), Math.floor(q[1]))) return q; } } return null; };
const put = (v, p) => { G.Vg.endTask(v); v.x = Math.floor(p[0]) + 0.5; v.y = Math.floor(p[1]) + 0.5; v.inside = 0; v.sleeping = false; };
const sweep = () => { G.mod('boato.t', 0); sim(() => Bo().update()); };
const townsOf = (n) => [...G.S.settlements.values()].filter(s => G.Village.pop(s.id) >= (n || 8)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id);
const fpB = () => { const s = JSON.stringify([fp(), G.S.boatos || 0, [...G.S.villagers.values()].map(v => v.sabe || 0)]); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };

if (on3('so11')) {
  M.pronto('metropole'); day(); const S = G.S; const B = Bo();
  const big = new Set(townsOf(30).map(t => t.id));
  const pr = pairOf((a, b) => !L().kin(a, b) && G.dist(a.x, a.y, b.x, b.y) < 5 && big.has(a.set)); const [k, vic] = pr; const set = S.settlements.get(vic.set);
  const c = sim(() => G.Crime.assault(k, vic, false));
  sim(() => B.dayOf(set)); const r = B.ofCrime(c.id); const w0 = r ? B.row(r, set.id).slice() : null;
  const fam = r ? G.Stories.kin(vic).filter(o => o.age >= 6).slice(0, 4) : [];
  ok('so11 nasce', !!r && r.k === 'agressao' && B.sabe(vic, r) === 'viu' && c.seen.every(id => !S.villagers.get(id) || S.villagers.get(id).age < 6 || B.sabe(S.villagers.get(id), r) === 'viu') && fam.every(o => B.sabe(o, r)),
    r ? `${k.name} bateu em ${vic.name} em ${set.name}: o boato «${B.texto(r, set.id)}», ${c.seen.length} testemunha(s) e a vítima sabem («viu»), a família (${fam.length}) «soube»; a parte ${w0[1]}‰` : 'NENHUM BOATO');
  const folk = () => [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 8 && !(v.sabe && v.sabe.some(e => e[0] === r.id)));
  const part = [], frac = [], ext = [];
  for (let d = 0; d < 6; d++) { sim(() => B.dayOf(set)); const w = B.row(r, set.id); part.push(w[1]); const f = folk(); frac.push(f.filter(v => B.sabe(v, r) === 'boato').length / Math.max(1, f.length)); if (d === 5) for (const v of f) ext.push(0.5 + 0.5 * I().ax(v, 'ext') / 99); }
  const exp = part[5] / 1000 * ext.reduce((x, y) => x + y, 0) / Math.max(1, ext.length);
  ok('so11 corre', part.every((p, i) => !i || p >= part[i - 1]) && part[5] > w0[1] * 3 && Math.abs(frac[5] - exp) < 0.1,
    `seis dias da cidade: a parte ${part.join(' → ')}‰; quem sabe pela conversa ${frac.map(x => Math.round(x * 100) + '%').join(' → ')} (esperado ≈ ${Math.round(exp * 100)}%: a parte vezes o quanto cada um fala)`);
  const far = [...S.settlements.values()].find(t => t.id !== set.id && !B.row(r, t.id)); const fo = far && [...S.villagers.values()].find(v => v.set === far.id && v.age >= 16);
  ok('so11 longe-nao-sabe', !!fo && !B.sabe(fo, r), far ? `${far.name}, aonde ninguém o levou: ${fo && B.sabe(fo, r) ? 'SABE' : 'não sabe'}` : 'nenhuma outra cidade');
  ok('so11 a-verdade-fica', r.q === c.thief && r.c === c.id && B.versao(r, set.id).culpado === k.id, `o boato aponta o crime #${c.id} (a verdade), e o culpado dito é ${B.versao(r, set.id).culpado === k.id ? 'o do crime' : 'OUTRO'}`);
  const bad = soc(); ok('so11 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so12')) {
  M.pronto('metropole'); day(); const S = G.S; const B = Bo();
  const ts = townsOf(20).filter(t => streetOf(t)); const A = ts[0], Bt = ts[1], C = ts[2];
  const folkA = [...S.villagers.values()].filter(v => v.set === A.id && v.age >= 18 && !v.captive && !v.aboard).sort((a, b) => a.id - b.id);
  const vic = folkA[0], wit = folkA[1], dies = folkA[2];
  const r = sim(() => B.nasce('homicidio', { set: A.id, a: vic.id, g: vic.g, q: folkA[3].id, n: { a: vic.name, s: A.name }, viu: [wit.id], p0: 200 }));
  const r2 = sim(() => B.nasce('agressao', { set: A.id, a: folkA[4].id, q: folkA[5].id, n: { a: folkA[4].name, s: A.name }, viu: [dies.id], p0: 200 }));
  // the witness walks into the streets of B: the sweep — the rumour reaches B, less true
  put(wit, streetOf(Bt)); sweep(); const wb = B.row(r, Bt.id);
  ok('so12 o-portador-leva', !!wb && wb[2] < 100 && wb[6] === wit.id && wb[1] === B.SEED, wb ? `${wit.name}, que viu, nas ruas de ${Bt.name}: o boato chegou (parte ${wb[1]}‰, fidelidade ${wb[2]}, quem trouxe #${wb[6]})` : `${wit.name} em ${Bt.name}: NADA CHEGOU`);
  // the one who carries the other dies on the road: nothing reaches C
  put(dies, [C.cx + 9, C.cy + 9]); sim(() => G.Village.kill(dies, 'old')); sweep();
  ok('so12 o-portador-morre', !B.row(r2, C.id) && !B.row(r2, Bt.id), `${dies.name}, o único que sabia de «${B.texto(r2, A.id)}» fora de ${A.name}, morreu no caminho: ${B.row(r2, C.id) ? 'CHEGOU A ' + C.name : 'não chegou a lugar nenhum'}`);
  // the stranger hears the talk of B and takes it home to C (one whose hash the talk of B reaches)
  sim(() => { const w = B.row(r, Bt.id); w[1] = 1000; w[2] = 60; });
  const st = [...S.villagers.values()].find(v => v.set === C.id && v.age >= 18 && !v.captive && !v.aboard && !v.sabe && G.hash(v.id * 2654 + r.id * 97 + Bt.id * 31 + 7) < 0.5 * (0.5 + 0.5 * I().ax(v, 'ext') / 99));
  put(st, streetOf(Bt)); sweep(); const e = st.sabe && st.sabe.find(q => q[0] === r.id);
  put(st, streetOf(C)); sweep(); const wc = B.row(r, C.id);
  ok('so12 o-forasteiro-ouve', !!e && e[1] === 'ouviu' && e[3] === Bt.id && !!wc && wc[2] === Math.max(0, Math.round(60 * 0.8) - 4) && wc[6] === st.id,
    `${st.name}, de ${C.name}, nas ruas de ${Bt.name}: ${e ? 'ouviu' : 'NÃO OUVIU'}; em casa, ${C.name} passou a dizer «${wc ? B.texto(r, C.id) : '—'}» (fidelidade ${wc ? wc[2] : '—'})`);
  const bad = soc(); ok('so12 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so13')) {
  M.pronto('metropole'); day(); const S = G.S; const B = Bo(); const F = G.Fama;
  const T = townsOf(40)[0]; const folk = [...S.villagers.values()].filter(v => v.set === T.id && v.age >= 18 && !v.captive).sort((a, b) => a.id - b.id);
  const sus = folk[0]; sim(() => { F.feito(sus, 'furtou', T.id); F.feito(sus, 'furtou', T.id); });
  // (only one the town takes for a thief: the others of ill name set apart for the proof)
  const others = B.suspeitos({ e: [], a: 0, q: 0 }, T).filter(o => o !== sus);
  const es0 = F.de(sus, T.id).estima;
  // a theft nobody saw: as the fidelity falls, the town names the one it already had for a thief (by the hash of each rumour: the
  // first of a few that does)
  let r = null; const tried = [];
  for (let n = 0; n < 14 && !r; n++) {
    const vic = folk[5 + n]; const x = sim(() => B.nasce('furto', { set: T.id, a: vic.id, n: { a: vic.name, s: T.name }, p0: 300 })); tried.push(x);
    sim(() => { B.row(x, T.id)[2] = 40; B.dayOf(T); });
    const q = B.row(x, T.id); if (q && q[3] & B.VER.TROCA && q[4] === sus.id) r = x;
  }
  const anyOther = tried.some(x => { const q = B.row(x, T.id); return q && q[3] & B.VER.TROCA && !B.suspeitos(x, T).some(o => o.id === q[4]); });
  ok('so13 o-suspeito', !!r && !anyOther, r ? `«${B.texto(r, T.id)}» — a cidade já tinha ${sus.name} por quem furta (o verdadeiro, ninguém viu; ${others.length} outros de má fama ali)` : `em ${tried.length} furtos, NENHUM CULPADO DITO`);
  if (r) {
    // most know: the fame of the one named; then a witness who lives here speaks — the name cleared, the talker less believed
    sim(() => { B.row(r, T.id)[1] = 600; B.dayOf(T); }); const es1 = F.de(sus, T.id).estima; const tel = S.villagers.get(B.row(r, T.id)[6]); const te0 = tel && F.de(tel, T.id) ? F.de(tel, T.id).estima : 0;
    const wit = folk.find(v => v !== sus && v !== tel && v.age >= 16 && folk.indexOf(v) > 30) || folk[folk.length - 1]; sim(() => { B.ensina(wit, r, 'viu', 0); B.dayOf(T); });
    const w2 = B.row(r, T.id); const es2 = F.de(sus, T.id).estima; const te1 = tel && F.de(tel, T.id) ? F.de(tel, T.id).estima : 0;
    ok('so13 o-desmentido', es1 < es0 && !(w2[3] & B.VER.TROCA) && !!(w2[3] & B.VER.DESM) && es2 > es1 && (!tel || te1 < te0) && B.frase(r, T.id, 'boato').startsWith('Já se sabe'),
      `quando a cidade toda dizia: a estima de ${sus.name} ${es0} → ${es1}; ${wit.name} viu e mora ali: «${B.frase(r, T.id, 'boato')}» — a estima volta a ${es2}${tel ? `, e ${tel.name}, que espalhou, ${te0} → ${te1}` : ''}`);
  }
  // the judgment: the crime answered brings every version back to the truth
  const c = sim(() => G.Crime.assault(folk[2], folk[3], false)); sim(() => B.dayOf(T)); const rj = B.ofCrime(c.id);
  sim(() => { const q = B.row(rj, T.id); q[1] = 800; q[3] |= B.VER.EXA; c.dayArrest = S.day; c.st = 'preso'; B.dayOf(T); });
  const wj = B.row(rj, T.id);
  ok('so13 o-julgamento', rj.j > 0 && !!(wj[3] & B.VER.DESM) && !(wj[3] & B.VER.EXA), `o crime de ${folk[2].name} julgado: em ${T.name} já se diz «${B.texto(rj, T.id)}» (a versão exagerada voltou à verdade)`);
  const bad = soc(); ok('so13 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so14')) {
  M.pronto('metropole'); M.viver(G.DAY_LEN * 2); const S = G.S;
  const n0 = (S.boatos || { list: [] }).list.length; let named = 0; for (const v of S.villagers.values()) if (v.sabe) named++;
  const b0 = JSON.stringify([S.boatos, [...S.villagers.values()].filter(v => v.sabe).map(v => [v.id, v.sabe])]);
  const save = G.Save.serialize();
  M.abrir(JSON.parse(save)); const b1 = JSON.stringify([G.S.boatos, [...G.S.villagers.values()].filter(v => v.sabe).map(v => [v.id, v.sabe])]);
  M.reseed(5); M.viver(60); const f1 = fpB();
  M.abrir(JSON.parse(save)); M.reseed(5); M.viver(60); const f2 = fpB();
  ok('so14 o-save-guarda', n0 > 0 && named > 0 && b0 === b1, `dois dias da metrópole: ${n0} boatos, ${named} pessoas sabem por nome — ${b0 === b1 ? 'iguais depois do load' : 'DIFERENTES depois do load'}`);
  ok('so14 o-mesmo-futuro', f1 === f2, `o mesmo save carregado duas vezes, 60 s cada: ${f1} / ${f2}`);
  const o = JSON.parse(save); o.boatos.list[0].at = 'x'; o.boatos.list.push({ k: 'nada', id: -3 }, null, { k: 'furto', id: 999999, at: [[-5, 9e9, 'a', 0, 0, 0, 0]] }); o.boatos.n = 'z';
  const vv = o.villagers.find(v => v.sabe) || o.villagers[0]; vv.sabe = [[999998, 'viu', 1, 0], 'lixo', [o.boatos.list[1].id, 'sonhou', 2, 0]];
  M.abrir(o); const bad0 = soc();
  ok('so14 o-save-danificado', M.limpo() && !bad0.length && (!G.S.boatos || G.S.boatos.list.every(r => Array.isArray(r.at) && r.at.length)), `um save com boatos tortos e quem sabe o que não existe: ${M.limpo() && !bad0.length ? 'carregou limpo' : 'ERRO: ' + (bad0[0] ? bad0[0].msg : JSON.stringify(M.erros()).slice(0, 200))}`);
  M.viver(5); const bad = soc(); ok('so14 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so15')) {
  M.pronto('metropole'); day(); const S = G.S; const B = Bo();
  let s = null; for (const x of S.settlements.values()) { const f = G.Fac.get(x.fac); if (f && G.Fac.capitalOf(f.id) !== x && G.Village.pop(x.id) >= 6) { s = x; break; } }
  const folk = [...S.villagers.values()].filter(v => v.set === s.id && v.age >= 16).sort((a, b) => a.id - b.id);
  const r = sim(() => B.nasce('agressao', { set: s.id, a: folk[0].id, q: folk[1].id, n: { a: folk[0].name, s: s.name }, viu: [folk[2].id], p0: 300 }));
  const f0 = s.fac; sim(() => G.Politics.secede(s, null)); M.viver(5); sim(() => B.dayOf(s));
  ok('so15 a-cidade-muda-de-povo', s.fac !== f0 && !!B.row(r, s.id) && B.sabe(folk[2], r) === 'viu', `${s.name} deixou o povo ${f0}: o boato «${B.texto(r, s.id)}» ${B.row(r, s.id) ? 'continua dito ali' : 'SUMIU'}`);
  const bad = soc(); ok('so15 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so17')) {
  M.pronto('metropole'); day(); const S = G.S; const B = Bo();
  const T = townsOf(20)[0]; const txt = 'Há gente importante que se cumprimenta com um sinal na palma da mão.';
  const sr = sim(() => G.Secrets.rumor(T.fac, T.id, txt, 0, false, 1, {}));
  const r = S.boatos.list.find(q => q.sec === sr.id); const h0 = B.heat(sr);
  sim(() => G.Secrets.rumor(T.fac, T.id, txt, 0, false, 1, {})); const h1 = B.heat(sr);
  sim(() => B.cala(sr)); const h2 = B.heat(sr);
  ok('so17 a-conversa-e-boato', !!r && r.k === 'fofoca' && Math.abs(h0 - 0.625) < 0.01 && h1 > h0 && h2 === 0, `a conversa de ${T.name} «${r ? B.texto(r, T.id) : '—'}»: calor ${h0.toFixed(2)} (a parte da cidade), contada de novo ${h1.toFixed(2)}, calada ${h2}`);
  const bad = soc(); ok('so17 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so18')) {
  M.pronto('metropole'); day(); const S = G.S; const B = Bo(); const F = G.Fama;
  const ts = townsOf(20); const A = ts[0];
  const folk = [...S.villagers.values()].filter(v => v.set === A.id && v.age >= 20 && !v.captive).sort((a, b) => a.id - b.id);
  const hero = folk[0]; sim(() => { for (let k = 0; k < 3; k++) F.feito(hero, 'heroi', A.id); });
  sim(() => G.Village.kill(hero, 'old'));
  const leg = () => (S.lore && S.lore.legends) || [];
  const lo = leg().find(l => l.key === 'boato:' + hero.id);
  // a killer that many towns spoke of, and who dies: the legend in the words told — the version of the town that told it most
  const kl = folk[1]; const r = sim(() => B.nasce('homicidio', { set: A.id, a: folk[2].id, q: kl.id, n: { a: folk[2].name, s: A.name }, p0: 500 }));
  sim(() => { for (const t of ts.slice(1, 4)) r.at.push([t.id, 700, 40, B.VER.EXA, 0, S.day, 0]); });
  sim(() => G.Village.kill(kl, 'old')); const lk = leg().find(l => l.key === 'boato:' + kl.id);
  ok('so18 a-lenda', !!lo && !!lk && /a sangue-frio/.test(lk.text[0]), `${hero.name}, herói: «${lo ? lo.text[0] : '—'}»; ${kl.name}: «${lk ? lk.text[0] : '—'}»`);
  // what went through most towns of a people stays with it (on its capital's day)
  const f = G.Fac.get(A.fac); const cap = G.Fac.capitalOf(f.id); const mine = [...S.settlements.values()].filter(s => s.fac === f.id);
  const r2 = sim(() => B.nasce('levante', { set: cap.id, a: folk[3].id, fa: f.id, n: { a: folk[3].name, s: cap.name, fa: f.name }, p0: 900 }));
  sim(() => { for (const t of mine) if (!B.row(r2, t.id)) r2.at.push([t.id, 800, 70, 0, 0, S.day, 0]); B.dayOf(cap); });
  const pm = (f.memoria || []).find(q => q[0] === 'levante');
  ok('so18 a-memoria-do-povo', !!pm && pm[5].includes(folk[3].name), `${f.name} (${mine.length} cidades) lembra: «${pm ? pm[5] : '—'}»`);
  const bad = soc(); ok('so18 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (on3('so19')) {
  M.pronto('metropole'); day(); const S = G.S; const F = G.Fama; const Po = G.Polity;
  const f = [...S.factions.values()].filter(x => x.alive !== false && G.Politics.ruler(x) && G.Fac.pop(x.id) >= 40 && !x.rev).sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id))[0];
  const ru = G.Politics.ruler(f); const sat = () => { Po.recount(f, 0); for (const k in f.grp) f.grp[k].sat = 50; Po.recount(f, 1000); return Object.fromEntries(Object.keys(f.grp).map(k => [k, Math.round(f.grp[k].sat)])); };
  const s0 = sat();
  sim(() => { for (const t of S.settlements.values()) if (t.fac === f.id) for (let k = 0; k < 4; k++) F.feito(ru, 'cruel', t.id); });
  const s1 = sat();
  const povo = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === f.id && v.grp === 'povo' && v.age >= 16 && v !== ru && !v.captive).sort((a, b) => a.id - b.id);
  sim(() => { for (const v of povo.slice(0, Math.ceil(povo.length / 3))) L().marca(v, 'matou', ru.id, 80, 0); });
  const s2 = sat();
  ok('so19 o-odio-de-quem-governa', s1.povo < s0.povo && s2.povo < s1.povo, `${f.name}: o que o povo espera ${s0.povo} → ${s1.povo} (as cidades dizem que ${ru.name} é cruel: estima ${Math.round(F.estimaPovo(ru, f.id))}) → ${s2.povo} (um terço com um morto pela mão del${ru.g === 'f' ? 'a' : 'e'})`);
  const lead = povo[povo.length - 1]; const said = []; const lg = G.Village.log; G.Village.log = function (t) { said.push(t); return lg.apply(this, arguments); };
  sim(() => Po.uprising(f, lead, ['povo'], 'republica', '')); G.Village.log = lg;
  const line = said.find(t => /^Revolução/.test(t)) || '';
  ok('so19 os-rostos-do-levante', /Ao lado de .*um morto a vingar/.test(line) && !!f.rev && f.rev.faces.length > 0, line.slice(0, 260) || 'NENHUM LEVANTE');
  const bad = soc(); ok('so19 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

// ------------------------------ so20 who one is changes with life ------------------------------
if (on('so20')) {
  M.pronto('metropole'); const S = G.S; const Ix = I();
  const kid = [...S.villagers.values()].filter(v => v.age >= 5 && v.age < 30 && S.villagers.has(v.mother)).sort((a, b) => a.id - b.id)[0]; const mom = S.villagers.get(kid.mother);
  const m0 = mom.indole.slice(); const f0 = Ix.fora; const out = Ix.vive(mom, 'filho');
  sim(() => G.Village.kill(kid, 'sick')); const m1 = mom.indole.slice();
  // (a war, if the world has none at this hour: two peoples by the world's door)
  if (![...S.factions.values()].some(f => f.alive !== false && G.Fac.enemiesOf(f.id).length)) { const fs = [...S.factions.values()].filter(f => f.alive !== false && G.Fac.pop(f.id) > 10); if (fs.length >= 2) sim(() => G.Politics.declareWar(fs[0], fs[1], 'fronteira')); }
  const en = [...S.factions.values()].find(f => G.Fac.enemiesOf(f.id).length); let war = 'nenhuma guerra';
  let ok2 = true;
  if (en) { const foe = G.Fac.enemiesOf(en.id)[0]; const sol = [...S.villagers.values()].find(v => G.Fac.idOfV(v) === foe.id && v.age >= 18 && !v.captive); const vic = [...S.villagers.values()].find(v => G.Fac.idOfV(v) === en.id && v.age >= 18 && !v.captive);
    const s0 = sol.indole.slice(); sim(() => { vic.lastBy = sol.id; G.Village.kill(vic, 'war'); }); const s1 = sol.indole;
    ok2 = s1[1] === Math.max(0, s0[1] - 2) && s1[3] === Math.min(99, s0[3] + 2); war = `${sol.name} matou ${vic.name} na guerra: bondade ${s0[1]} → ${s1[1]}, nervo ${s0[3]} → ${s1[3]}`; }
  const iN = Ix.IDX;
  ok('so20 a-vida-muda-quem-se-e', !!en && out === false && Ix.fora === f0 + 1 && m1[iN.neu] === Math.min(99, m0[iN.neu] + 4) && m1[iN.ext] === Math.max(0, m0[iN.ext] - 3) && ok2,
    `fora do passo: nada (contado); ${mom.name} perdeu ${kid.name}: nervo ${m0[iN.neu]} → ${m1[iN.neu]}, expansão ${m0[iN.ext]} → ${m1[iN.ext]}, fé ${m0[iN.fe]} → ${m1[iN.fe]}; ${war}`);
  const bad = soc(); ok('so20 verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 3).map(q => q.msg).join(' · ') : 'limpo');
}

if (!M.limpo()) console.log('ERROS: ' + JSON.stringify(M.erros()).slice(0, 800));
console.log(fails.length ? `FALHOU: ${fails.join(', ')} (${ms()} ms)` : `PASSOU (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
