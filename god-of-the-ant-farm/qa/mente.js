// mente: o cérebro dos bichos provocado de propósito (D-290 a D-296).   [ONLY=m1,m5] node qa/mente.js [semente]
// Num mundo novo, longe das cidades, a mão da prova limpa um terreiro (G.Animals.remove), põe os bichos de cada caso
// (G.Animals.spawn) e deixa o mundo viver pelo passo do jogo, com o verificador (sistemas «mente» e «luta», S0–S2) a cada dois
// segundos; e, no fim, vidas longas pelo salto em várias sementes e tipos de mundo, contando o que aconteceu sem ninguém mandar:
//   m1 o sono de cada espécie: as zebras (do dia) dormem de noite e uma fica de sentinela; as hienas (da noite), de dia;
//   m2 o posto no grupo: os gnus de uma manada ordenados pela força, a disputa (o exibir, o ameaçar, o choque, quem cede), e quem
//      guia é o do alto;
//   m3 o território: um tigre na sua terra e outro que entra nela — a marca, o encontro, a disputa, o intruso expulso;
//   m4 os nascimentos: só de fêmeas prenhes de um macho, o filhote ao lado da mãe, mamando, seguindo-a; o laço desfeito se a mãe
//      morre;
//   m5 o alarme: uma zebra vê o leão e a manada inteira foge; os gnus perto ouvem e fogem também;
//   m6 a mente e as feridas pelo save: iguais (arredondadas) depois do load, e um save sem mente nenhuma (de antes) abre;
//   m7 vidas longas (ANOS anos pelo salto, em SEMENTES): as contas — caças tentadas e conseguidas por espécie e por jeito, mortes
//      por causa, roubos de presa, presas que revidaram e feriram, mortes de predadores por ferida e por fome, nascimentos, trocas
//      de posto, brigas de território — e as linhas da crônica que os bichos escreveram.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/mente-inv.js'] });
const SEED = +(process.argv[2] || 103);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | mente ${name} | ${info}`); if (!c) fails.push(name); };
const A = G.Animals, W = G.W, T = G.T, L = G.Luta, Me = G.Mente;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const step0 = G.debug.step; G.debug.step = dt => { const w = G.S && G.S.weather; if (w) { w.storm = 0; w.rain = 0; } return step0(dt); };
let S = null;
const fresh = () => { M.novo({ seed: SEED, type: 'continente', size: 128, tribes: 2 }); M.viver(2); S = G.S; };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'luta' || q.sys === 'mente' || q.sys === 'fauna'));
const vsay = v => (v.length ? v.slice(0, 3).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const used = [];
function arena(kind, avoid) {
  const P = { kind };
  for (let k = 0; k < 4000; k++) {
    const px = 6 + ((k * 7919) % (G.N - 12)) + 0.5, py = 6 + ((k * 104729) % (G.N - 12)) + 0.5;
    if ((avoid || used).some(p => G.dist(p[0], p[1], px, py) < 30)) continue;
    let far = true; for (const s of S.settlements.values()) if (G.dist(px, py, s.cx, s.cy) < 22) { far = false; break; } if (!far) continue;
    let good = true; for (let dy = -2; dy <= 2 && good; dy++) for (let dx = -2; dx <= 2; dx++) if (!A.walkOK(P, px + dx, py + dy) || S.type[W.idx(px + dx, py + dy)] <= T.RIVER) { good = false; break; }
    if (!good || A.waterD(W.idx(px, py)) < 4) continue;
    used.push([px, py]); return [px, py];
  }
  return null;
}
function clear(x, y, r) { god(() => { for (const a of [...S.animals.values()]) if (G.dist(a.x, a.y, x, y) < r && !A.DEF[a.kind].dom && !A.DEF[a.kind].town) A.remove(a); }); }
function put(kind, x, y, o) { return god(() => { const a = A.spawn(kind, x, y, Object.assign({ grown: 1, morph: null }, o || {})); Me.m(a); a.hx = x; a.hy = y; return a; }); }
function live(sec, every, fn) { const seen = []; for (let t = 0; t < sec; t++) { M.viver(1); if (fn) fn(t); if (t % (every || 2) === 1) for (const q of bad()) if (seen.length < 6 && !seen.some(s => s.msg === q.msg)) seen.push(q); } return seen; }
const T0 = () => Object.assign({}, Me.tally, Object.fromEntries(Object.entries(L.tally).map(([k, v]) => ['L:' + k, v])));
const dM = (t0, k) => (Me.tally[k] || 0) - (t0[k] || 0), dL = (t0, k) => (L.tally[k] || 0) - (t0['L:' + k] || 0);
fresh();

// ---------------- m1 sleep ----------------
if (on('m1')) {
  const p = arena('zebra'), q = arena('hyena'); let msg = 'sem lugar', good = false;
  if (p && q) {
    clear(p[0], p[1], 24); clear(q[0], q[1], 24);
    const zs = []; for (let i = 0; i < 6; i++) zs.push(put('zebra', p[0] + (i % 3) * 0.8, p[1] + ((i / 3) | 0) * 0.8, { hunger: 0.05 })); for (const z of zs.slice(1)) z.leader = zs[0].id;
    const hs = []; for (let i = 0; i < 3; i++) hs.push(put('hyena', q[0] + i * 0.8, q[1], { hunger: 0.05 })); for (const h of hs.slice(1)) h.leader = hs[0].id;
    const c = { zn: 0, zd: 0, hn: 0, hd: 0, n: 0, d: 0, watch: 0 };
    const v = live(200, 4, () => {
      const night = G.isNight(); night ? c.n++ : c.d++;
      for (const z of zs) if (!z.dead && z.state === 'sleep') night ? c.zn++ : c.zd++;
      for (const h of hs) if (!h.dead && h.state === 'sleep') night ? c.hn++ : c.hd++;
      if (zs.some(z => z.state === 'watch')) c.watch++;
      for (const a of zs.concat(hs)) a.hunger = Math.min(a.hunger, 0.2); // (fed by the proof's hand: the case is the sleep, not the meal)
    });
    const zN = c.zn / Math.max(1, c.n * zs.length), zD = c.zd / Math.max(1, c.d * zs.length), hN = c.hn / Math.max(1, c.n * hs.length), hD = c.hd / Math.max(1, c.d * hs.length);
    good = zN > zD * 2 && hD > hN * 2 && c.watch > 0 && !v.length;
    msg = `zebras dormindo: ${(100 * zN).toFixed(0)}% da noite, ${(100 * zD).toFixed(0)}% do dia; hienas: ${(100 * hN).toFixed(0)}% da noite, ${(100 * hD).toFixed(0)}% do dia; uma zebra de sentinela em ${c.watch} s — ${vsay(v)}`;
  }
  ok('m1 o sono de cada espécie (as zebras de noite, com sentinela; as hienas de dia)', good, msg);
}
// ---------------- m2 rank ----------------
if (on('m2')) {
  const p = arena('gnu'); let msg = 'sem lugar', good = false;
  if (p) {
    clear(p[0], p[1], 24); const t0 = T0();
    const gs = []; for (let i = 0; i < 7; i++) gs.push(put('gnu', p[0] + (i % 4) * 0.9, p[1] + ((i / 4) | 0) * 0.9, { hunger: 0.05, age: 4 + i }));
    for (const g of gs.slice(1)) g.leader = gs[0].id; for (let i = 0; i < gs.length; i++) Me.m(gs[i]).sx = i < 4 ? 1 : 0; Me.m(gs[0]).sx = 0; // (a cow leads at first: the bulls will dispute it)
    const v = live(150, 2, () => { for (const g of gs) g.hunger = Math.min(g.hunger, 0.2); });
    const L0 = gs.find(g => !g.dead && !g.leader) || null; const live1 = gs.filter(g => !g.dead);
    const top = live1.slice().sort((a, b) => Me.power(b) - Me.power(a))[0];
    good = dM(t0, 'disputa:posto') > 0 && !!L0 && live1.every(g => g === L0 || g.leader === L0.id) && L0.mind.rk === 1 && !v.length;
    msg = `disputas ${dM(t0, 'disputa:posto')}, vitórias ${dM(t0, 'vence:posto')}, novos líderes ${dM(t0, 'posto:novo-lider')}; quem guia: #${L0 ? L0.id : '?'} (${L0 && Me.sex(L0) ? 'touro' : 'vaca'}, posto ${L0 ? L0.mind.rk : '?'}), o mais forte #${top ? top.id : '?'}; postos ${live1.map(g => g.mind.rk).join(' ')} — ${vsay(v)}`;
  }
  ok('m2 o posto no grupo: a disputa, e quem guia é o do alto', good, msg);
}
// ---------------- m3 territory ----------------
if (on('m3')) {
  const p = arena('tiger'); let msg = 'sem lugar', good = false;
  if (p) {
    clear(p[0], p[1], 30); const t0 = T0();
    const res = put('tiger', p[0], p[1], { hunger: 0.05, age: 6 }); Me.m(res).sx = 1; Me.m(res).mk = -999;
    const inn = put('tiger', p[0] + 5, p[1] + 3, { hunger: 0.05, age: 5 }); Me.m(inn).sx = 1; inn.hx = p[0] + 40; inn.hy = p[1]; // (its home is far: it is passing through)
    inn.hx = p[0] + 6; inn.hy = p[1] + 3; Me.m(inn).mk = -999;
    const hx0 = inn.hx;
    const v = live(150, 2, () => { res.hunger = Math.min(res.hunger, 0.2); inn.hunger = Math.min(inn.hunger, 0.2); });
    good = dM(t0, 'disputa:territorio') > 0 && dM(t0, 'vence:territorio') > 0 && !v.length;
    msg = `marcas ${dM(t0, 'marca')}, disputas do território ${dM(t0, 'disputa:territorio')}, vencidas ${dM(t0, 'vence:territorio')}, expulsos ${dM(t0, 'territorio:expulso')}; o intruso ${inn.hx !== hx0 ? 'foi morar longe' : 'ficou'} — ${vsay(v)}`;
  }
  ok('m3 o território: a marca, o encontro, o intruso expulso', good, msg);
}
// ---------------- m4 births ----------------
if (on('m4')) {
  const p = arena('deer'); let msg = 'sem lugar', good = false;
  if (p) {
    clear(p[0], p[1], 26); const t0 = T0();
    const ds = []; for (let i = 0; i < 6; i++) ds.push(put('deer', p[0] + (i % 3), p[1] + ((i / 3) | 0), { hunger: 0.05, age: 3 })); for (const d of ds.slice(1)) d.leader = ds[0].id;
    for (let i = 0; i < ds.length; i++) Me.m(ds[i]).sx = i < 2 ? 1 : 0;
    // (the heat brought by the proof's hand, by the brain's own door: the same call a heat of the breeding round makes)
    god(() => { for (const d of ds) if (Me.sex(d) === 0) Me.heat(d, A.counts()); });
    const kids = new Map(); const bad2 = []; let suckled = 0, followed = 0;
    const v = live(200, 2, () => {
      for (const d of ds) d.hunger = Math.min(d.hunger, 0.3);
      for (const a of S.animals.values()) if (a.kind === 'deer' && a.mind && a.mind.mom && ds.some(d => d.id === a.mind.mom) && !kids.has(a.id)) { const mo = S.animals.get(a.mind.mom); kids.set(a.id, a); if (!mo || Me.sex(mo) !== 0) bad2.push(`#${a.id}: a mãe #${a.mind.mom} ${mo ? 'é macho' : 'não existe'}`); else if (G.dist(a.x, a.y, mo.x, mo.y) > 2) bad2.push(`#${a.id} nasceu a ${G.dist(a.x, a.y, mo.x, mo.y).toFixed(1)} da mãe`); }
      for (const k of kids.values()) { if (k.state === 'suckle') suckled++; if (k.state === 'young') followed++; }
    });
    // the mother dies: the link goes
    let cleared = 'sem filhote';
    const k1 = [...kids.values()].find(k => !k.dead); if (k1) { const mo = S.animals.get(k1.mind.mom); if (mo) god(() => A.kill(mo, null, 'old')); live(32); cleared = k1.dead ? 'o filhote morreu' : k1.mind.mom ? 'NÃO desfeito' : 'desfeito'; }
    good = dM(t0, 'acasala:deer') > 0 && kids.size > 0 && !bad2.length && suckled > 0 && cleared !== 'NÃO desfeito' && !v.length;
    msg = `cios ${dM(t0, 'cio:deer')}, acasalamentos ${dM(t0, 'acasala:deer')}, nascidos ${kids.size} (${bad2.length ? bad2.slice(0, 2).join('; ') : 'todos de mãe, ao lado dela'}); mamando ${suckled} s, seguindo a mãe ${followed} s; a mãe morta: o laço ${cleared} — ${vsay(v)}`;
  }
  ok('m4 os nascimentos: de fêmeas prenhes, o filhote com a mãe', good, msg);
}
// ---------------- m5 alarm ----------------
if (on('m5')) {
  const p = arena('zebra'); let msg = 'sem lugar', good = false;
  if (p) {
    clear(p[0], p[1], 26);
    const zs = []; for (let i = 0; i < 7; i++) zs.push(put('zebra', p[0] + (i % 4) * 1.1, p[1] + ((i / 4) | 0) * 1.1)); for (const z of zs.slice(1)) z.leader = zs[0].id;
    const gs = []; for (let i = 0; i < 4; i++) gs.push(put('gnu', p[0] + 3 + i * 0.8, p[1] + 3.5)); for (const g of gs.slice(1)) g.leader = gs[0].id;
    const ln = put('lion', p[0] - 4, p[1], { hunger: 0.8 }); ln.state = 'chase'; ln.target = zs[0].id; ln.carc = false;
    // one zebra sees it (the fear scan's answer, by the fight's door)
    god(() => L.react(zs[0], ln, 1, false));
    const zf = zs.filter(z => z.state === 'flee').length, gf = gs.filter(g => g.state === 'flee').length;
    good = zf >= 4 && gf >= 1; msg = `uma zebra viu o leão: ${zf} de ${zs.length} zebras fogem, e ${gf} de ${gs.length} gnus que ouviram o alarme`;
  }
  ok('m5 o alarme corre a manada e passa a outra espécie', good, msg);
}
// ---------------- m6 save ----------------
if (on('m6')) {
  M.viver(5);
  const snap = () => { const o = {}; for (const a of S.animals.values()) if (a.mind) o[a.id] = JSON.stringify(Me.pack(a)) + '|' + JSON.stringify(L.pack(a) || null); return o; };
  const before = snap(); M.salvarCarregar(); S = G.S; const after = snap();
  const keys = Object.keys(before); const diff = keys.filter(k => before[k] !== after[k]);
  // a save from before the brain: no mind, no wounds — the load makes them fresh, nothing breaks
  const sv = JSON.parse(G.Save.serialize()); for (const a of sv.animals) { delete a.mind; delete a.wnd; delete a.gest; }
  G.Save.apply(sv); S = G.S; M.viver(3); const minds = [...S.animals.values()].filter(a => a.mind).length;
  const v = bad();
  ok('m6 a mente e as feridas pelo save', !diff.length && minds > 0 && !v.length && M.limpo(), `${keys.length} mentes iguais depois do load${diff.length ? ` — DIFERENTES ${diff.length}: ${diff[0]} ${before[diff[0]]} → ${after[diff[0]]}` : ''}; um save sem mentes abre e, 3 s depois, ${minds} bichos têm mente — ${vsay(v)}`);
}
// ---------------- m7 long lives ----------------
if (on('m7')) {
  const ANOS = +(process.env.ANOS || 20); const SEEDS = (process.env.SEMENTES || '103:continente,7:continente,11:ilha').split(',');
  const sum = {}; const lines = []; let viol = [];
  for (const sd of SEEDS) {
    const [seed, type] = sd.split(':'); M.novo({ seed: +seed, type: type || 'continente', size: 128, tribes: 3 }); S = G.S;
    M.saltar(ANOS);
    for (const q of QA.check().filter(q => q.sev <= 2 && (q.sys === 'luta' || q.sys === 'mente'))) viol.push(q);
    for (const [k, v] of Object.entries(L.tally)) sum['L:' + k] = (sum['L:' + k] || 0) + v;
    for (const [k, v] of Object.entries(Me.tally)) sum['M:' + k] = (sum['M:' + k] || 0) + v;
    const cz = (S.eco && S.eco.cause) || {}; for (const k in cz) for (const c in cz[k]) sum['morte:' + k + ':' + c] = (sum['morte:' + k + ':' + c] || 0) + cz[k][c];
    for (const h of S.history) if (/leoa|leão|leões|hiena|zebra|búfalo|crocodilo|sucuri|jiboia|víbora|lobo|alcateia|onça|tigre|leopardo|urso|matriarca|bando|elefante|alce|cervo|gnu|mandíbula|coice/i.test(h.txt) && !/chegou|chegaram|partiram|desapareceram|abateu|vila|cidade defendendo|devorador/.test(h.txt)) lines.push(`[${seed} ${type || 'continente'}, ano ${h.d}] ${h.txt}`);
  }
  const g = (p, re) => Object.entries(sum).filter(([k]) => k.startsWith(p) && (!re || re.test(k))).sort((a, b) => b[1] - a[1]);
  const show = (t, l, n) => console.log(`  ${t}: ${l.slice(0, n || 18).map(([k, v]) => `${k.replace(/^[LM]:/, '')} ${v}`).join(', ')}`);
  console.log(`  (${SEEDS.length} mundos, ${ANOS} anos cada)`);
  show('caçadas começadas', g('L:caca:'), 20); show('abates por espécie', g('L:abate:', /^L:abate:[a-z]+$/), 20); show('abates por jeito', g('L:abate:', /^L:abate:[a-z]+:/), 24);
  show('fugas das garras', g('L:escapa:'), 12); show('caçadas desistidas', g('L:falha:'), 14);
  show('roubos de presa', g('L:roubo:'), 10); show('coices', g('L:coice'), 10); show('investidas', g('L:investida:'), 12); show('caçadores afugentados', g('L:afugenta:'), 12); show('resgates', g('L:resgate'), 8);
  show('mortes por ferida', g('L:morte-ferida:'), 14); show('predadores mortos de fome', g('L:fome-predador:'), 12); show('mandíbulas quebradas', g('L:mandibula'), 3);
  show('nascimentos', g('M:nasce:'), 20); show('cios e acasalamentos', g('M:', /^M:(cio|acasala|cio-perdido|cio-sem-macho)$/), 6); show('o posto', g('M:', /^M:(disputa|vence|posto|sucessao|dispersao|coalizao|tomada|infanticidio)/), 14); show('o território', g('M:', /^M:(marca|disputa:territorio|vence:territorio|territorio:expulso)$/), 6);
  show('a vida de todo dia', g('M:', /^M:(sentinela|mama|brinca)$/), 6);
  console.log(`  a crônica dos bichos (${lines.length} linhas):`); for (const l of lines.slice(0, +(process.env.LINHAS || 30))) console.log('    ' + l);
  ok('m7 vidas longas: o que aconteceu sem ninguém mandar', (sum['L:abate'] || 0) > 0 && (sum['M:nasce'] || 0) > 0 && !viol.length && M.limpo(), `${sum['L:caca'] || 0} caçadas, ${sum['L:abate'] || 0} abates, ${sum['M:nasce'] || 0} nascimentos, ${sum['L:roubo'] || 0} roubos, ${sum['L:coice'] || 0} coices, ${sum['M:disputa'] || 0} disputas — ${vsay(viol)}`);
}
{ const ge = A.gestErr.slice(0, 4); ok('fim: nenhum gesto recusado, nenhum erro de módulo', !ge.length && M.limpo(), `gestos recusados ${ge.length ? ge.join('; ') : 'nenhum'}; erros ${JSON.stringify(M.erros().mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
