// saber: as provas dos degraus maiores do saber e do governo da cidade (D-192, os Bairros Vivos; o agente B) — a grande
// biblioteca (4 casas, 16 m) dos seis povos: a forma de js/forma-saber.js (o risco de cada povo) e a planta pela forma
// (js/int-saber.js, na família forma.salao), no formato do qa/monumental-poder.js. Em Node, sobre o código do jogo.
//   b1 a forma de cada povo: o lote de 16 m, o pé dentro dele, o risco; o degrau oferecido só no tamanho da forma
//      (G.Escala.can); as formas dos povos diferentes entre si; nenhum acaso (a mesma forma duas vezes)
//   b2 a planta em todo povo e lado, em vários prédios (os dados dos móveis) e com paredes-meias: válida pela família da forma
//      — a que o mundo dá ao registro do degrau e o catálogo oferece —, a mesma duas vezes, a casca de longe a da planta, o
//      relatório geométrico sem falha, o tempo; a biblioteca clássica (8 m) com a planta de antes (o resumo gravado)
//   b3 o que a grande biblioteca é: a sala de leitura, o acervo, o escritório, o pórtico e o pátio aberto; ≥ 16 lugares de
//      ler (o dobro da maior clássica), ≥ 3 mesas de escriba, ≥ 8 estantes; cada lugar de uso alcançado da porta da rua
//   b4 as regras do corpo: a escadaria (espelho ≤ 0,30, piso ≥ 0,28, ≥ 1,2 m), a entrada no alto dela, o parapeito onde o
//      pódio cai mais de 1 m, a porta da rua e o portal ≥ 2,2 m; nenhuma mesa nem estante diante de uma porta
//   b5 os pés da rua até dentro da sala de leitura, a cada 2 cm, num mundo em branco: subindo os degraus da forma
//   b6 o dia numa vila de mentira (a planta de verdade, o caminhar de fora): os leitores enchem os lugares de ler da planta,
//      cada um no seu, e quem chega com a casa cheia volta; o dia conta o dobro (16 leituras, 12 cópias) e nada além dele;
//      três copistas, cada um na sua mesa; a biblioteca clássica ao lado como antes (8, 6, um copista); o pedido de ofícios
//      (E.jobsOf, E.demand); quem morre lendo sai do livro; o save no meio; a biblioteca derrubada no meio; o verificador
//      (oficio, saber) limpo em todo segundo — e ele acusa o livro que mente
//   b7 de pé num mundo pronto (a metrópole): a grande biblioteca pela mão do deus em cada povo com cidade — a planta, a
//      entrada, o relatório, o verificador —; os leitores pela porta do jogo (G.Biblioteca.visit), andando de verdade: mais
//      de oito sentados ao mesmo tempo, cada um num lugar de ler; salvar e carregar com eles sentados; a obra salva no meio
//      e acabada; a grande biblioteca derrubada pelo deus (a ruína e a planta dela)
//   b8 a cidade que justifica e pode pagar: no mundo de 500 anos (Mênfis, 189 pessoas) escolhe o degrau grande primeiro, e a
//      menor só o clássico — e lá não há mais lote de 4 casas (T-870, dito com a medida); no mundo da metrópole, a cidade passa
//      a justificá-lo com as famílias que chegam (a porta do modo desenvolvedor), sem pedra não o pode pagar, e com pedra
//      ergue-o sozinha (V.startProject: o lote de 4, a conta e o trabalho do degrau, o registro da planta de 4 casas) e amplia
//      no lugar a biblioteca que já tinha (V.grow: o mesmo prédio, salvo no meio e acabado); pronta, a planta da forma
//   b9 um save de antes: as bibliotecas clássicas de um mundo pronto como eram (2 casas, a planta, um copista, o dia de 8), e
//      nenhuma cidade abaixo do degrau o escolhe
//   node qa/saber.js [b1,b2,…]      VERB=1: cada caso que falha · SALT=n: as plantas noutros dados (T-436)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, dev: true, extra: ['qa/escala-inv.js', 'qa/poder-inv.js', 'qa/saber-inv.js'] }); // (dev: the door of the families, b8)
const In = G.Interiors, Fo = G.Forma, Sp = G.Space, Es = G.Escala, Bi = G.Biblioteca, E = G.Eco, A = G.Act;
const ONLY = process.argv[2] ? process.argv[2].split(',') : null; const want = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | saber ${name} | ${info}`); if (!c) fails.push(name); return c; };
const some = L => (process.env.VERB ? L : L.slice(0, 3));
const clock = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; };
const POVOS = ['grego', 'romano', 'egipcio', 'nordico', 'asteca', 'classico'], LADOS = ['S', 'E', 'N', 'W'];
const T = 'biblioteca', N = 4, FAM = 'forma.salao', LIB = In.GRANDE_BIBLIOTECA;
const r2 = x => Math.round(x * 100) / 100;
const rec = (c, s, n, o) => Object.assign({ v: In.REC_V, f: FAM, r: 0, t: T, u: In.TYPES[T].use, s, o: (1 << n) - 1, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0, n }, o || {});
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const digest = p => JSON.stringify([p.rooms, p.items.map(i => [i.kind, i.x, i.z, i.ry]), p.doors, p.holes]);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
// (a world of nothing: the plans made on it, read by the tests)
const nothing = () => { G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N), occ: new Int32Array(G.N * G.N) }; };
let made = null;
const plans = () => { if (made) return made; nothing(); made = []; let nid = 97001;
  for (const c of POVOS) for (const s of LADOS) { const b = { id: (nid += 41), type: T, style: c, x: 8, y: 8, w: N, h: N, built: true }; b.ip = rec(c, s, N);
    const t0 = clock(); const p = In.makeFam(b, b.ip, FAM); const ms = clock() - t0; G.S.buildings.set(b.id, b); made.push({ c, s, b, p, ms, so: In.shellOf(b) }); }
  return made; };
const tag = m => `${m.c}/${m.s}`;
// (the metres of the plan's walk from its way in to a point of a storey — In.walkField —; Infinity where the door does not reach)
const fields = new WeakMap();
const walkTo = (p, lv, x, z) => { let W = fields.get(p); if (!W) fields.set(p, W = In.walkField(p)); const D = W.D[lv]; if (!D) return Infinity; const n = W.n, k = 2; const cx = Math.floor(x / In.CS), cz = Math.floor(z / In.CS); let best = Infinity;
  for (let dz = -k; dz <= k; dz++) for (let dx = -k; dx <= k; dx++) { const X = cx + dx, Z = cz + dz; if (X < 0 || Z < 0 || X >= n || Z >= n) continue; const m = D[Z * n + X]; if (m < best) best = m; } return best; };
const placesOf = (p, use) => { const out = []; for (const it of p.items) for (const sp of it.spots) if (sp.use === use && sp.ok) out.push({ lv: it.lv, x: sp.x, z: sp.z, on: sp.on, it }); return out; };
const reached = (p, q) => (q.on ? Math.min(Infinity, ...q.it.spots.filter(sp => !sp.on && sp.ok).map(sp => walkTo(p, q.lv, sp.x, sp.z))) : walkTo(p, q.lv, q.x, q.z));

// ---------------------------------------------------------------- b1: the forms
function b1() {
  const out = [], sum = []; const sig = new Map();
  for (const c of POVOS) {
    const F = Fo.of(T, c, N); if (!F) { out.push(`${c}: sem forma de ${N}`); continue; } const why = [];
    if (F.style !== c) why.push(`a forma é a do ${F.style}`); if (F.L !== 16) why.push(`o lote de ${F.L} m`);
    const R = In.riskOf(F); if (!R) { out.push(`${c}: sem risco`); continue; }
    if (R.fam !== FAM) why.push(`o risco da família ${R.fam}`);
    // (its foot inside the lot, the roofs' eaves aside: every mass on the ground)
    for (const q of Fo.foot(F)) { const r = q.k === 'rect' ? q.r : [q.c[0] - q.r, q.c[1] - q.r, q.c[0] + q.r, q.c[1] + q.r]; if (r[0] < -0.01 || r[1] < -0.01 || r[2] > 16.01 || r[3] > 16.01) { why.push(`um pé fora do lote (${r.map(r2).join(', ')})`); break; } }
    if (!(F.top > 5 && F.top < 14)) why.push(`o alto a ${F.top.toFixed(1)} m`);
    if (Fo.of(T, c, N) !== F) why.push('outra forma na segunda vez');
    // (offered at its size alone)
    for (const n of [3, 5, 6]) if (Es.can(T, c, n)) why.push(`o degrau de ${n} oferecido`);
    if (!Es.can(T, c, N) || !Es.can(T, c, 2)) why.push('o degrau de 4 ou o clássico não oferecido');
    const s = JSON.stringify(Fo.mass(F).map(m => [m.k, m.r || m.c || m.a, r2(m.y0 || 0), r2(m.y1 || 0)])); if (sig.has(s)) why.push(`a mesma massa do ${sig.get(s)}`); sig.set(s, c);
    if (why.length) out.push(`${c}: ${why.join(', ')}`);
    sum.push(`${c} ${F.els.length} peças, ${F.top.toFixed(1)} m de alto, o pódio a ${R.Hp} m`);
  }
  ok('b1a a forma da grande biblioteca de cada povo: o lote, o pé dentro dele, o risco, o degrau só no tamanho dela, as seis diferentes', !out.length, some(out).join(' / ') || sum.join('; '));
  // (the step is offered by the ladder: Es.steps has it; a people without the form would not be offered it)
  const st = Es.steps(T).find(s => s.n === N);
  ok('b1b o degrau na escada do tipo', !!st && st.id === 'grande' && POVOS.every(c => Fo.sizes(T, c).join() === '2,4'), st ? `${st.nome} (${st.id}): ${N} casas, ${JSON.stringify(st.req)}, a conta ×${st.k}; os tamanhos de cada povo: ${Fo.sizes(T, 'romano').join(', ')}` : 'sem o degrau');
}

// ---------------------------------------------------------------- b2: the plans
// (the classic library's plan of each people and side, as it was before this branch: the digest of 24 plans made at 16310aa)
const CLASSICA = process.env.CLASSICA !== undefined ? process.env.CLASSICA : '466df9fd'; // (CLASSICA= empty: only shows the digest of now — after the plans' engine changed)
function b2() {
  const P = plans(); const bad = P.filter(m => !m.p.ok); const offer = [];
  for (const c of POVOS) { nothing(); const b = { id: 5, type: T, style: c, x: 8, y: 8, w: N, h: N, built: true }; const r = In.newRecord(b, { t: T, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: 15, n: N });
    if (r.f !== FAM) offer.push(`${c}: o registro com ${r.f}`); if (!In.familiesFor(r).ok.includes(FAM)) offer.push(`${c}: o catálogo sem a da forma (${JSON.stringify(In.familiesFor(r).why)})`); }
  ok('b2a a planta da grande biblioteca em todo povo e lado, pela família da forma — a do registro novo e do catálogo', !bad.length && !offer.length && P.length === 24, `${P.length - bad.length} de ${P.length} plantas${bad.length ? '; ' + some(bad).map(m => `${tag(m)}: ${m.p.errs.slice(0, 2).join('; ')}`).join(' / ') : ''}${offer.length ? '; ' + offer.join(' · ') : ''}`);
  const diff = P.filter(m => m.p.ok && digest(In.makeFam(m.b, m.b.ip, FAM)) !== digest(m.p));
  ok('b2b a mesma planta duas vezes da mesma entrada', !diff.length, `${diff.length} diferentes${diff.length ? ': ' + some(diff).map(tag).join(', ') : ''}`);
  const sh = P.filter(m => m.p.ok && (!m.so || strip(m.so) !== strip(In.shellOfPlan(m.p))));
  ok('b2c a casca de longe igual à da planta', !sh.length, `${sh.length} cascas diferentes${sh.length ? ': ' + some(sh).map(tag).join(', ') : ''}`);
  const rep = []; for (const m of P.filter(q => q.p.ok)) { const r = In.report(m.b, m.p, {}).filter(q => q.k === 'FALHA'); if (r.length) rep.push(`${tag(m)}: ${r[0].what}`); }
  ok('b2d o relatório geométrico sem falha', !rep.length, rep.length ? some(rep).join(' / ') : `${P.filter(q => q.p.ok).length} plantas`);
  // (other buildings — the furniture's dice —, party walls on one side and on two, the hot land and the richer quarter)
  nothing(); let n = 0; const badIds = []; const cnt = { ler: [Infinity, 0], esc: [Infinity, 0], est: [Infinity, 0] };
  for (const c of POVOS) for (const [q, s] of LADOS.entries()) for (let k = 0; k < 8; k++) {
    const b = { id: 30011 + 7919 * (k + 8 * q) + 31 * c.length, type: T, style: c, x: 8, y: 8, w: N, h: N, built: true }; b.ip = rec(c, s, N, { pw: k % 4 === 1 ? 2 : k % 4 === 2 ? 10 : 0, cl: k % 2 ? 'q' : 't', w: k % 3 });
    const p = In.makeFam(b, b.ip, FAM); n++;
    if (!p.ok) { badIds.push(`${c}/${s} #${b.id}: ${p.errs.slice(0, 2).join('; ')}`); continue; }
    const a = placesOf(p, 'ler').length, e = placesOf(p, 'escrever').length, t = p.items.filter(i => i.kind === 'estante').length;
    for (const [key, v] of [['ler', a], ['esc', e], ['est', t]]) { cnt[key][0] = Math.min(cnt[key][0], v); cnt[key][1] = Math.max(cnt[key][1], v); }
    if (a < LIB.ler || e < LIB.escribas || t < LIB.estantes) badIds.push(`${c}/${s} #${b.id}: ${a} lugares de ler, ${e} mesas de escriba, ${t} estantes`);
  }
  ok('b2e noutros prédios (os dados dos móveis), com paredes-meias, na terra quente e no bairro rico: toda planta válida, com o que o degrau promete', !badIds.length, `${n} plantas: ${n - badIds.length} válidas; lugares de ler ${cnt.ler.join(' a ')}, mesas de escriba ${cnt.esc.join(' a ')}, estantes ${cnt.est.join(' a ')}${badIds.length ? ' — ' + some(badIds).join(' / ') : ''}`);
  const ts = P.slice().sort((a, b) => b.ms - a.ms);
  const again = ts.slice(0, 3).map(m => { let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(m.b, m.b.ip, FAM); best = Math.min(best, clock() - a); } return [tag(m), best]; }).sort((a, b) => b[1] - a[1]);
  const tb = P.filter(m => m.s === 'S' && m.p.ok).map(m => { const a = clock(); const t = In.table(m.b); return [m.c, clock() - a, t ? t.spots.length : 0]; }).sort((a, b) => b[1] - a[1]);
  ok('b2f o tempo de fazer a planta (alvo: 400 ms em Node) e a tabela dos lugares (alvo: 1 s)', again[0][1] < 400 && tb.length === POVOS.length && tb[0][1] < 1000, `a planta mais cara ${again[0][1].toFixed(0)} ms de CPU (${again[0][0]}, sem cache); a tabela: ${tb.map(([c, ms, k]) => `${c} ${ms.toFixed(0)} ms (${k} lugares)`).join(', ')}`);
  // (the classic library — the lot of the type's table — keeps the plan it had: the form's hall, none of the bigger step's rooms)
  nothing(); const cl = []; const dg = [];
  for (const c of POVOS) for (const s of LADOS) { const b = { id: 4000 + 13 * POVOS.indexOf(c) + LADOS.indexOf(s), type: T, style: c, x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = In.newRecord(b, { t: T, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s, o: 3 });
    const p = In.make(b, b.ip); if (b.ip.f !== FAM || !p.ok || p.rooms.some(m => m.fn === 'acervo' || m.fn === 'escritorio') || !p.rooms.some(m => m.fn === 'salao')) cl.push(`${c}/${s}: ${b.ip.f}, ${p.ok ? p.rooms.map(m => m.fn).join(',') : p.errs[0]}`); dg.push(digest(p)); }
  const h = hash(dg.join('|'));
  ok('b2g a biblioteca clássica (8 m) com a planta de antes: o salão da forma, o resumo das 24 plantas o gravado antes deste ramo', !cl.length && (!CLASSICA || h === CLASSICA), `${24 - cl.length} de 24 pelo salão da forma; o resumo ${h}${CLASSICA ? (h === CLASSICA ? ' = o de antes' : ` ≠ o de antes (${CLASSICA})`) : ' (sem o de antes para comparar: CLASSICA=…)'}${cl.length ? ' — ' + some(cl).join(' / ') : ''}`);
}

// ---------------------------------------------------------------- b3: what the grand library is
function b3() {
  const out = [], sum = [];
  for (const m of plans().filter(q => q.p.ok)) {
    const p = m.p; const why = []; const fn = k => p.rooms.filter(q => q.fn === k);
    for (const k of ['leitura', 'acervo', 'escritorio']) if (fn(k).length !== 1) why.push(`${fn(k).length} cômodos «${k}»`);
    if (!p.rooms.some(q => (q.fn === 'portico' || q.fn === 'galeria') && !q.open)) why.push('sem pórtico'); if (!p.rooms.some(q => q.open)) why.push('sem pátio aberto');
    const hall = fn('leitura')[0]; if (hall) { const a = hall.r[2] - hall.r[0], b = hall.r[3] - hall.r[1]; if (a * b < 40) why.push(`a sala de leitura de ${a.toFixed(1)} × ${b.toFixed(1)} m`); const h = p.levels.find(l => l.lv === hall.lv).h; if (h < 4) why.push(`${h} m de pé-direito`); }
    const uses = {}; for (const u of ['ler', 'escrever', 'guardar', 'sentar']) { const L = placesOf(p, u); const got = L.filter(q => reached(p, q) < Infinity).length; uses[u] = got; if (got < L.length) why.push(`${L.length - got} lugares de ${u} que a porta não alcança`); }
    const lost = p.items.reduce((s, it) => s + it.spots.filter(sp => (sp.use === 'ler' || sp.use === 'escrever') && !sp.ok).length, 0); if (lost) why.push(`${lost} lugares de ler ou escrever perdidos`);
    const tables = p.items.filter(i => i.kind === 'mesa-leitura'), shelves = p.items.filter(i => i.kind === 'estante'), desks = p.items.filter(i => i.kind === 'mesa-escriba');
    if (uses.ler < LIB.ler) why.push(`${uses.ler} lugares de ler`); if (tables.length < LIB.mesas) why.push(`${tables.length} mesas`); if (uses.escrever < LIB.escribas) why.push(`${uses.escrever} mesas de escriba`); if (shelves.length < LIB.estantes) why.push(`${shelves.length} estantes`);
    // (the desks in the office, the shelves of the rolls' room; what the shelves keep: the building's own, D-053)
    const esc = fn('escritorio')[0], ace = fn('acervo')[0];
    if (esc && desks.some(i => i.room !== esc.id)) why.push('uma mesa de escriba fora do escritório'); if (ace && shelves.filter(i => i.room === ace.id).length < 3) why.push(`${shelves.filter(i => i.room === ace.id).length} estantes no acervo`);
    if (shelves.some(i => !i.store || i.store.dep !== 'predio')) why.push('uma estante que não guarda o que é do prédio');
    if (p.cap.jobs < LIB.escribas) why.push(`${p.cap.jobs} postos`);
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    if (m.s === 'S') sum.push(`${m.c}: sala ${(hall.r[2] - hall.r[0]).toFixed(1)}×${(hall.r[3] - hall.r[1]).toFixed(1)} m, ${tables.length} mesas (${uses.ler} leitores), ${desks.length} mesas de escriba, ${shelves.length} estantes (${shelves.reduce((s, i) => s + i.store.cap, 0)} de guarda), ${uses.sentar} bancos`);
  }
  ok('b3a o que a grande biblioteca é: a sala de leitura, o acervo, o escritório, o pórtico, o pátio; os lugares de ler, as mesas de escriba e as estantes do degrau, cada lugar alcançado da porta', !out.length && plans().length === 24, some(out).join(' / ') || sum.join('; '));
  // (against the biggest classic library of the same people: the readers, the floor)
  nothing(); const cmp = []; const low = [];
  for (const c of POVOS) { let best = 0, fl = 0; for (let k = 0; k < 6; k++) { const b = { id: 5100 + 97 * k + POVOS.indexOf(c), type: T, style: c, x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = In.newRecord(b, { t: T, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: 3 }); const p = In.make(b, b.ip); if (!p.ok) continue; best = Math.max(best, placesOf(p, 'ler').length); fl = Math.max(fl, p.rooms.filter(q => !q.open).reduce((s, q) => s + (q.r[2] - q.r[0]) * (q.r[3] - q.r[1]), 0)); }
    const m = plans().find(q => q.c === c && q.s === 'S'); const g = placesOf(m.p, 'ler').length, gf = m.p.rooms.filter(q => !q.open && q.fn !== 'portico' && q.fn !== 'galeria').reduce((s, q) => s + (q.r[2] - q.r[0]) * (q.r[3] - q.r[1]), 0);
    cmp.push(`${c} ${best} → ${g} leitores, ${fl.toFixed(0)} → ${gf.toFixed(0)} m²`); if (g < 2 * best || gf < 3 * fl) low.push(c); }
  ok('b3b contra a biblioteca clássica do mesmo povo (a maior de seis): o dobro dos leitores ao menos, três vezes o chão fechado', !low.length, cmp.join('; ') + (low.length ? ' — abaixo: ' + low.join(', ') : ''));
}

// ---------------------------------------------------------------- b4: the body's rules
function b4() {
  const out = [], sum = [];
  for (const m of plans().filter(q => q.p.ok)) {
    const p = m.p; const R = In.riskOf(Fo.of(T, m.c, N)); const why = [];
    const st = p.stairs.find(s => s.kind === 'degraus' && s.lv0 === -1); if (!st) { out.push(`${tag(m)}: sem a escadaria`); continue; }
    const tr = (st.treads || []).slice().sort((a, b) => a.y - b.y); const ys = [0].concat(tr.map(q => q.y), [R.Hp]);
    let rise = 0; for (let k = 1; k < ys.length; k++) rise = Math.max(rise, ys[k] - ys[k - 1]);
    const deep = tr.length ? Math.min(...tr.map(q => Math.min(q.r[2] - q.r[0], q.r[3] - q.r[1]))) : Infinity;
    if (rise > In.BODY.step + 1e-6) why.push(`um espelho de ${rise.toFixed(2)} m`); if (deep < 0.28 - 1e-6) why.push(`um piso de ${deep.toFixed(2)} m`); if (st.w < 1.2 - 1e-6) why.push(`${st.w.toFixed(2)} m de largura`);
    const e = p.entrance; const sr = st.r; if (!(e.x > sr[0] - 0.05 && e.x < sr[2] + 0.05 && e.z > sr[1] - 0.6 && e.z < sr[3] + 0.6)) why.push('a entrada fora do alto da escadaria');
    const rails = p.walls.filter(w => w.kind === 'cerca'); if (R.Hp > 1 - 1e-6 && (rails.length < 3 || rails.some(w => w.h < 0.9 - 1e-6))) why.push(`as bordas do pódio sem parapeito (${rails.map(w => w.h).join(', ')})`);
    const rua = p.doors.find(d => d.rooms.includes('rua')); const hole = d => p.holes.find(h => h.door === d.id);
    if (!rua || hole(rua).h < 2.2 - 1e-6) why.push(`a porta da rua de ${rua ? hole(rua).h.toFixed(2) : '-'} m`);
    if (!R.doorD || R.doorD.y1 - R.doorD.y0 < 2.2 - 1e-6) why.push('o portal baixo');
    for (const d of p.doors) if (hole(d) && hole(d).h < 2.2 - 1e-6 && d.kind !== 'vao') why.push(`uma porta de ${hole(d).h.toFixed(2)} m`);
    // (no table nor shelf before a door: the floor a pace before each leaf free of solid pieces)
    for (const d of p.doors) { if (d.kind === 'vao') continue; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L; const cx = w.a[0] + tx * d.at, cz = w.a[1] + tz * d.at;
      for (const sg of [-1, 1]) { const x = cx - tz * sg * (w.t / 2 + 0.45), z = cz + tx * sg * (w.t / 2 + 0.45); if (p.items.some(it => it.solid && it.lv === w.lv && x > it.r[0] - 0.05 && x < it.r[2] + 0.05 && z > it.r[1] - 0.05 && z < it.r[3] + 0.05)) why.push('uma peça diante de uma porta'); } }
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    if (m.s === 'S') sum.push(`${m.c} ${tr.length + 1}×${rise.toFixed(2)} m em ${st.w.toFixed(1)} m, a porta da rua ${hole(rua).h.toFixed(1)} m, o portal ${(R.doorD.y1 - R.doorD.y0).toFixed(1)} m`);
  }
  ok('b4a as regras do corpo: a escadaria (espelho ≤ 0,30, piso ≥ 0,28, ≥ 1,2 m), a entrada no alto, o parapeito onde o pódio cai 1 m ou mais, as portas ≥ 2,2 m, nenhuma peça diante de uma porta', !out.length, some(out).join(' / ') || sum.join('; '));
}

// ---------------------------------------------------------------- b5: the feet in, on a blank world
const blankWorld = () => { const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld(); return S; };
const putStep = (S, c, n, x, y, id, s) => { const def = G.BDEF[T]; const b = { id, type: T, style: c, x, y, w: n, h: n, esc: n === N ? 'grande' : T, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
  S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + n; yy++) for (let xx = b.x; xx < b.x + n; xx++) S.occ[yy * G.N + xx] = b.id;
  b.ip = In.newRecord(b, { t: T, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: s || 'S', o: (1 << n) - 1, n }); return b; };
function feetIn(b, p, R, end) {
  const TL = Sp.TILE, L = b.w * TL, u = p.entrance.x; const pl = Sp.plinth(b);
  const inR = (r, a, z) => a >= r[0] && a <= r[2] && z >= r[1] && z <= r[3];
  const top = z => { for (const q of R.treads) if (inR(q.r, u, z)) return q.y; return inR(R.podium, u, z) ? R.Hp : 0; };
  const edges = R.treads.flatMap(q => [q.r[1], q.r[3]]).concat([R.podium[3]]);
  let worst = 0, at = 0, step = 0, fell = 0, prev = null, nn = 0, stop = null;
  for (let z = L + 1.0; z >= end; z -= 0.02) {
    const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z));
    if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
    if (ins && !ins.walk && ins.door < 0 && stop === null) stop = z;
    if (edges.some(e => Math.abs(z - e) < 0.03)) continue;
    if ((!ins && Sp.stepTop(X, Z) > -Infinity) || z > R.stair[3] + 0.01) continue; nn++;
    const wantY = pl.hi + top(z) + (ins && z < R.podium[3] ? Sp.FLOOR_UP : 0); const d = foot - wantY; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = z; }
    if (d < -0.05) fell++;
  }
  const bad = Math.abs(worst) > 0.03 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9 || stop !== null;
  return { bad, worst, why: `os pés a ${worst.toFixed(2)} m da forma em v ${at.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão${stop !== null ? `, parados em v ${stop.toFixed(2)}` : ''} (${nn} pontos)` };
}
function b5() {
  const out = [], sum = []; const S = blankWorld();
  for (const [q, c] of POVOS.entries()) {
    const b = putStep(S, c, N, 3 + (N + 4) * (q % 3), 3 + (N + 6) * Math.floor(q / 3), 99001 + q * 7);
    if (b.ip.f !== FAM) { out.push(`${c}: o registro novo com ${b.ip.f}`); continue; }
    const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${c}: sem planta`); continue; }
    const R = In.riskOf(Fo.of(T, c, N));
    // (from the street by the flight, the court and the porch: to a pace before the block's front where the door is not on the
    // way in's line — the classical people's —, else a pace inside it)
    const onAxis = Math.abs(R.doorD.u - R.gate.u) < 0.3; const end = onAxis ? R.B[3] - R.t - 1.0 : R.B[3] + 1.0;
    const f = feetIn(b, p, R, end); sum.push(`${c} ${f.worst >= 0 ? '+' : ''}${f.worst.toFixed(3)}${onAxis ? '' : ' (até o pórtico)'}`); if (f.bad) out.push(`${c}: ${f.why}`);
  }
  ok('b5a os pés da rua até dentro da sala de leitura, subindo os degraus da forma, sempre num chão onde ficam', !out.length, some(out).join(' / ') || `nos seis, a cada 2 cm (a maior diferença: ${sum.join(', ')})`);
}

// ---------------------------------------------------------------- b6: the day, in a village made by hand
// (only the game's code: the task machines, the library's book, the interiors' allotter on the real plan, the trades' and this
// file's rules of the checker; the walk left out — each one already before where they go)
function b6() {
  const keep = { reaches: G.W.reaches, walkable: G.W.walkable, walkableXY: G.W.walkableXY, planDoor: G.Vg.planDoor, door: G.Vg.door, frontTile: G.Village.frontTile, gotoB: G.Vg.gotoB, FX: G.FX, Talk: G.Talk, H: G.Vg.H, give: G.Vg.give, S: G.S };
  G.W.reaches = () => true; G.W.walkable = () => true; G.W.walkableXY = () => true; G.Vg.planDoor = null;
  G.Vg.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; G.Village.frontTile = b => [b.x + b.w - 0.5, b.y + b.h - 0.5];
  G.Vg.gotoB = (v, b) => { v._go = G.Village.frontTile(b); return true; };
  G.FX = new Proxy({}, { get: () => () => undefined }); G.Talk = new Proxy({}, { get: () => () => undefined });
  const H = { setTask: (v, t) => { t.age = 0; if (t.st === undefined) t.st = 0; v.task = t; v.actT = 0; return t; }, end: v => G.Vg.endTask(v), move: v => { if (v._go) { v.x = v._go[0]; v.y = v._go[1]; v._go = null; } return true; }, goto: (v, x, y) => { v._go = [x, y]; return true; } };
  G.Vg.H = H; G.Vg.give = (v, t) => { if (v.task && (v.task.pri || 0) >= 2) return false; H.setTask(v, t); return true; };
  G.inSim++;
  try {
    const world = civ => {
      const f = { id: 1, name: 'Povo de teste', alive: true, civ, stock: { food: 200, wood: 30, moedas: 40 }, tech: { known: { moeda: 1, escrita: 1 }, cur: 'filosofia', pts: 0 }, rel: {}, eco: null };
      const set = { id: 2, name: 'Vila', fac: 1, cx: 10, cy: 10, tier: 3, loyalty: 60 };
      const B = (id, n, x, y) => { const b = { id, type: T, x, y, w: n, h: n, esc: n === N ? 'grande' : T, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 240, maxHp: 240, ip: null, style: civ };
        b.ip = In.newRecord(b, { t: T, c: civ, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n }); return b; };
      const S = G.S = { day: 3, clock: 600, time: 0.4, nextId: 100, rng: 4242, avatar: null, buildings: new Map(), villagers: new Map(), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map(), milestones: {} };
      for (const h of G.worldHooks) h();
      const big = B(4, N, 12, 8), small = B(7, 2, 20, 8); S.buildings.set(4, big); S.buildings.set(7, small);
      let id = 10;
      const person = (name, o) => { const h = { id: id++, type: 'house', x: 14, y: 12, w: 1, h: 1, built: true, progress: 1, set: 2, inv: {}, coin: 1, pantry: 10, res: 1, need: { wood: 0, stone: 0 }, incoming: {}, hp: 110, maxHp: 110, ip: null }; S.buildings.set(h.id, h);
        const v = Object.assign({ id: id++, name, set: 2, age: 30, hp: 100, carry: null, purse: 0, home: h.id, job: 0, role: 'coletor', traits: [], x: 9.5, y: 10.3, st: {}, diary: [], hunger: 20, energy: 60, mourn: 0, sick: 0, devotion: 20, task: null, actT: 0, inside: 0 }, o || {}); S.villagers.set(v.id, v); return v; };
      E.ensure(f); return { S, f, set, big, small, person };
    };
    const bad = [];
    const sec = (n, people) => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; for (const v of people) { if (!v.task) continue; v.task.age += 1; v.actT += 1; E.run(v, v.task, 1, H); } A.update(1);
      for (const rule of [QA.oficio, QA.saber]) rule((sys, sev, msg) => { if (sys === 'oficio' || sys === 'saber') bad.push(`S${sev} ${msg}`); }, G.S); } };
    const seats = (b, use) => { const t = In.table(b); return ((t && t.byUse.get(use)) || []).filter(e => e.ok).length; };
    for (const civ of ['romano', 'grego']) {
      const { S, f, set, big, small, person } = world(civ); const cap = seats(big, 'ler'), capS = seats(small, 'ler'), desks = seats(big, 'escrever');
      // ---- the readers fill the plan's places, each at one of its own; one more is sent back
      G.S.time = 0.4; const rs = []; for (let i = 0; i < cap; i++) { const p = person('L' + i); if (Bi.visit(p, big, H)) rs.push(p); }
      sec(1, rs); const inBook = Object.keys(Bi.book(big).quem).length;
      const pl = rs.map(v => In.placeOf(v)); const keys = new Set(pl.map(q => (q ? q.item + ':' + q.q : '-')));
      const late = person('Atrasado'); const tl = Bi.visit(late, big, H);
      ok(`b6a ${civ}: os leitores enchem os lugares de ler da planta, cada um no seu, sentado; mais um volta`, cap >= LIB.ler && rs.length === cap && inBook === cap && pl.every(q => q && q.use === 'ler' && q.st === 'sit') && keys.size === cap && !tl,
        `a planta: ${cap} lugares de ler (a clássica ao lado: ${capS}); ${rs.length} vieram, ${inBook} no livro, ${keys.size} lugares diferentes (${[...new Set(pl.map(q => q && q.st))].join('/')}); o ${cap + 1}º: ${tl ? 'ENTROU' : 'não veio (a casa cheia)'}`);
      // ---- the day counts twice the classic one's readings, and no more
      const p0 = f.tech.pts; sec(40, rs); const read1 = Bi.book(big).lidos; G.S.time = 0.4;
      const more = []; for (let i = 0; i < 4; i++) { const p = person('M' + i); if (Bi.visit(p, big, H)) more.push(p); } sec(40, more); G.S.time = 0.4;
      ok(`b6b ${civ}: o dia da grande biblioteca conta o dobro das leituras (${Bi.maxOf(big)}), e nada além dele`, Bi.maxOf(big) === 2 * Bi.MAX && read1 === Math.min(cap, Bi.maxOf(big)) && Bi.book(big).lidos === Bi.maxOf(big) && r2(f.tech.pts - p0) === r2(Bi.maxOf(big) * Bi.READ) && rs.concat(more).every(v => !v.task && !v.inside),
        `${cap} leram: ${read1} contadas; mais ${more.length}: ${Bi.book(big).lidos} contadas (o teto ${Bi.maxOf(big)}), a pesquisa do povo +${r2(f.tech.pts - p0)} (${Bi.maxOf(big)} × ${Bi.READ}); todos saíram`);
      // ---- three copyists, each at a desk of its own; the day's copies twice the classic's
      const cps = [0, 1, 2].map(i => person('Copista' + i, { job: big.id, role: 'copista' })); const c0 = f.tech.pts;
      for (const c of cps) E.jobTask(c, H); const types = cps.map(c => c.task && c.task.type); sec(1, cps);
      const cpl = cps.map(v => In.placeOf(v)); const ckeys = new Set(cpl.map(q => (q ? q.item + ':' + q.q : '-')));
      sec(40, cps); const copied = Bi.book(big).copias; let rounds = 1;
      while (rounds < 8) { let any = false; for (const c of cps) if (E.jobTask(c, H)) any = true; if (!any) break; sec(40, cps); rounds++; G.S.time = 0.4; }
      ok(`b6c ${civ}: três copistas, cada um na sua mesa de escriba; o dia conta o dobro das cópias (${Bi.maxCopias(big)})`, E.jobsOf(big).n === 3 && desks >= 3 && types.every(t => t === 'copiar') && cpl.every(q => q && q.use === 'escrever') && ckeys.size === 3 && copied === 3 && Bi.book(big).copias === Bi.maxCopias(big) && Bi.maxCopias(big) === 2 * (Bi.MAX - 2) && cps.every(c => !E.jobTask(c, H)),
        `o prédio emprega ${E.jobsOf(big).n} (a planta: ${desks} mesas); ${types.join(', ')}; ${ckeys.size} mesas diferentes (${cpl.map(q => q && q.use).join('/')}); a primeira rodada ${copied} cópias, em ${rounds} rodadas ${Bi.book(big).copias} (o teto ${Bi.maxCopias(big)}), a pesquisa +${r2(f.tech.pts - c0)}; depois do teto, nenhuma tarefa de copiar`);
      // ---- the classic library beside it, as before: its plan's seats, the day of 8 and 6, one copyist
      { G.S.time = 0.4; const cs = []; for (let i = 0; i < capS + 2; i++) { const p = person('C' + i); if (Bi.visit(p, small, H)) cs.push(p); } sec(1, cs); const inS = Object.keys(Bi.book(small).quem).length; sec(40, cs); G.S.time = 0.4;
        for (let k = 0; k < 4; k++) { const again = []; for (let i = 0; i < capS; i++) { const p = person('D' + k + '.' + i); if (Bi.visit(p, small, H)) again.push(p); } sec(40, again); G.S.time = 0.4; }
        const one = person('CopistaC', { job: small.id, role: 'copista' }); let n = 0; while (n < 10 && E.jobTask(one, H)) { sec(40, [one]); n++; G.S.time = 0.4; }
        const dem = E.demand(set, f, 30);
        ok(`b6d ${civ}: a biblioteca clássica ao lado como antes — os lugares da planta dela, o dia de ${Bi.MAX} leituras e ${Bi.MAX - 2} cópias, um copista; o pedido de ofícios da cidade`, cs.length === capS + 2 && inS >= 2 && inS <= capS && Bi.book(small).lidos === Bi.MAX && Bi.book(small).copias === Bi.MAX - 2 && Bi.maxOf(small) === Bi.MAX && E.jobsOf(small).n === 1 && dem.copista === 4,
          `${capS} lugares: de ${cs.length} que vieram juntos, ${inS} sentaram (os outros voltaram da porta); o dia: ${Bi.book(small).lidos} leituras, ${Bi.book(small).copias} cópias; emprega ${E.jobsOf(small).n}; a cidade pede ${dem.copista} copistas (3 + 1)`); }
      // ---- the bad cases: one dies reading; a save in the middle; the god pulls the library down
      { S.day++; G.S.time = 0.4; const rs2 = []; for (let i = 0; i < 10; i++) { const p = person('R' + i); if (Bi.visit(p, big, H)) rs2.push(p); } sec(2, rs2);
        const dead = rs2[0]; for (const h of A.hooks.gone) h(dead); S.villagers.delete(dead.id); dead.task = null; const live = rs2.slice(1);
        const gone = !Bi.book(big).quem[dead.id]; sec(1, live);
        const hook = G.saveHooks.find(h => /biblioteca/.test(String(h.load)) && /quem/.test(String(h.load))); const sv = {}; hook.save(sv);
        for (const p of live) { p.task = null; p.inside = 0; } hook.load(sv);
        const back = live.filter(p => p.task && p.task.type === 'ler' && p.task.st === 1 && p.inside === big.id).length; sec(1, live);
        const still = Object.keys(Bi.book(big).quem).length;
        big.type = 'ruin'; sec(1, live); const out = live.filter(p => !p.task).length;
        ok(`b6e ${civ}: quem morre lendo sai do livro; o save no meio devolve cada um à sua mesa; a biblioteca derrubada no meio, todos para fora`, rs2.length === 10 && gone && back === live.length && still === live.length && out === live.length,
          `${rs2.length} lendo: um morre (${gone ? 'fora do livro' : 'AINDA NO LIVRO'}); o gancho do save devolve ${back} de ${live.length}, ${still} no livro; derrubada: ${out} sem tarefa`);
        big.type = T; }
      // ---- the checker sees a book that lies and a plan short of desks
      { S.day++; G.S.time = 0.4; const seen = []; const look = () => { seen.length = 0; QA.saber((sys, sev, msg) => seen.push(msg), G.S); return seen.slice(); };
        const k = Bi.book(big); for (let i = 0; i < cap + 1; i++) k.quem[9000 + i] = { t: G.S.clock, dur: 20 }; const a = look(); k.quem = {};
        const j0 = E.jobsOf; E.jobsOf = b => (b === big ? { n: desks + 1, role: 'copista' } : j0(b)); const b2_ = look(); E.jobsOf = j0; const c = look();
        ok(`b6f ${civ}: o verificador acusa o livro com mais leitores que lugares e o prédio com mais copistas que mesas — e nada com o jogo como é`, a.some(m => /lendo e a planta só tem/.test(m)) && b2_.some(m => /copistas e a planta só tem/.test(m)) && !c.length, `${a[0] || 'NADA'} · ${b2_[0] || 'NADA'} · sem a mão da prova: ${c.length ? c[0] : 'limpo'}`); }
    }
    ok('b6g o verificador (ofícios, saber) limpo em todo segundo', !bad.length, bad.slice(0, 4).join(' | ') || 'limpo');
  } finally {
    G.inSim--; G.W.reaches = keep.reaches; G.W.walkable = keep.walkable; G.W.walkableXY = keep.walkableXY; G.Vg.planDoor = keep.planDoor; G.Vg.door = keep.door; G.Village.frontTile = keep.frontTile; G.Vg.gotoB = keep.gotoB; G.FX = keep.FX; G.Talk = keep.Talk; G.Vg.H = keep.H; G.Vg.give = keep.give; G.S = keep.S;
  }
}

// ---------------------------------------------------------------- b7: standing in a ready world
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const qaS = () => QA.check().filter(q => q.sev <= 2);
const capitais = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => G.Village.pop(c.id) - G.Village.pop(a.id) || a.id - c.id);
const said = L => (L.length ? ' (' + L.slice(0, 2).map(q => `S${q.sev} ${q.sys}: ${q.msg.slice(0, 110)}`).join('; ') + ')' : '');
function b7() {
  const WORLD = process.env.MUNDO || 'metropole'; M.pronto(WORLD); const V = G.Village; let S = G.S; const q0 = qaS(); const res = [];
  for (const set of capitais()) { const civ = G.Civ.idOfFac(set.fac); const b = sim(() => V.handFound(set, T, 'grande', { built: true, R: 60 })); if (!b) continue;
    const p = Sp.planNow(b); const rep = p && p.ok ? In.report(b, p, {}).filter(q => q.k === 'FALHA') : [{ what: 'sem planta' }];
    res.push({ set, civ, b, ok: !!p && p.ok && b.w === N && b.esc === 'grande' && b.ip.f === FAM && b.ip.n === N && !rep.length && In.entrySaid(b) !== false, why: `${civ} #${b.id} em ${b.x},${b.y} lado ${b.ip.s}: ${p && p.ok ? 'planta ok' : 'planta NÃO: ' + (p ? p.errs[0] : '-')}${rep.length ? ', ' + rep[0].what : ''}, a entrada ${In.entrySaid(b)}` }); }
  const q1 = qaS();
  ok(`b7a de pé num mundo pronto (${WORLD}): a grande biblioteca pela mão do deus em cada capital — a planta, a família da forma, o relatório, a entrada, o verificador`, res.length >= 3 && res.every(r => r.ok) && !q0.length && !q1.length, `${res.length} de pé: ${res.map(r => r.why).join('; ')}; o verificador S0–S2: ${q0.length} antes, ${q1.length} com elas${said(q1)}`);
  // ---- the readers by the game's own door, walking for real: more than eight seated at once, each at a place of reading
  const r0 = res.slice().sort((a, c) => V.pop(c.set.id) - V.pop(a.set.id))[0]; const lib = r0.b; S.time = 0.33;
  const dr = G.Vg.door(lib); const far = v => G.dist2(v.x, v.y, dr[0], dr[1]); const rs = [];
  for (const v of [...S.villagers.values()].filter(v => v.set === lib.set).sort((a, c) => far(a) - far(c) || a.id - c.id)) { if (rs.length >= 14) break; if (v.age < 16 || v.captive || v.jail || v.aboard || v.sleeping || v.inside || v.merchant || (v.carry && v.carry.n > 1e-6) || (v.task && (v.task.pri || 0) >= 1)) continue;
    const t = Bi.visit(v, lib); if (t) { v.energy = Math.max(v.energy, 70); v.hunger = Math.min(v.hunger, 30); t.kind = 'work'; t.leisure = true; t.pri = 2.9; rs.push(v); } }
  let most = 0, mostKeys = 0, wrong = 0; const bad = [];
  const look = () => { const ids = Object.keys(Bi.book(lib).quem).map(Number); const pl = ids.map(id => In.placeOf(S.villagers.get(id))); const keys = new Set(pl.map(q => (q ? q.item + ':' + q.q : '-'))); if (pl.some(q => !q || q.use !== 'ler')) wrong++; if (ids.length > most) { most = ids.length; mostKeys = keys.size; } return ids; };
  let saved = null;
  for (let k = 0; k < 1500; k++) { G.debug.step(0.1); if (S.time > 0.6) S.time = 0.4; // (the library's hours held by the test's hand: the walk across a capital takes its time)
    if (k % 5 === 0) { const ids = look(); if (!saved && ids.length >= 9) { saved = ids.slice(); break; } }
    if (k % 50 === 0) for (const q of qaS()) bad.push(q); if (rs.every(v => !(v.task && v.task.type === 'ler'))) break; }
  ok('b7b os leitores pela porta do jogo, andando de verdade: mais de oito sentados ao mesmo tempo (a clássica senta oito no máximo), cada um num lugar de ler', rs.length >= 10 && most >= 9 && mostKeys === most && !wrong && !bad.length, `${rs.length} mandados ler em ${r0.set.name} (${r0.civ}): ${most} sentados ao mesmo tempo em ${mostKeys} lugares diferentes; olhares com alguém fora de um lugar de ler: ${wrong}; o verificador${bad.length ? said(bad) : ' limpo'}`);
  // ---- a save with them seated: the same readers back at the tables, and the reading goes on
  if (saved) { const id = lib.id; M.salvarCarregar(); S = G.S; const lib2 = S.buildings.get(id); const back = saved.filter(v => { const p = S.villagers.get(v); return p && p.task && p.task.type === 'ler' && p.inside === id; }).length;
    // (the load gives the reading back as the lightest errand of the world, 0.35: held above the day's calls by the test's hand, as before the save)
    for (const v of saved) { const p = S.villagers.get(v); if (p && p.task && p.task.type === 'ler') { p.task.kind = 'work'; p.task.leisure = true; p.task.pri = 2.9; p.energy = Math.max(p.energy, 70); p.hunger = Math.min(p.hunger, 30); } }
    const l0 = Bi.book(lib2).lidos; for (let k = 0; k < 600; k++) { G.debug.step(0.1); if (S.time > 0.6) S.time = 0.4; if (!Object.keys(Bi.book(lib2).quem).length) break; } const q2 = qaS();
    ok('b7c salvar e carregar com eles sentados: os mesmos de volta à mesa, e a leitura segue até o fim', back === saved.length && Bi.book(lib2).lidos - l0 >= saved.length - 1 && !q2.length && In.plan(lib2).ok, `${back} de ${saved.length} de volta; depois, ${Bi.book(lib2).lidos - l0} leituras contadas (o livro do dia: ${Bi.book(lib2).lidos}); o verificador ${q2.length ? said(q2) : 'limpo'}`);
  } else ok('b7c salvar e carregar com eles sentados', false, 'nunca houve nove sentados');
  // ---- the work saved in the middle and finished; the grand library pulled down by the god
  { const out = []; const sets = capitais(); const set = sets[sets.length - 1]; const b = sim(() => G.Village.handFound(set, T, 'grande', { built: false, R: 60, x: set.cx + 6, y: set.cy + 6 }));
    if (!b) out.push('a obra sem lote'); else { const id = b.id; M.salvarCarregar(); S = G.S; const b1 = S.buildings.get(id);
      if (!b1 || b1.built || b1.w !== N || b1.esc !== 'grande') out.push(`a obra depois do save: ${b1 ? `${b1.w} casas, ${b1.esc}, ${b1.built ? 'pronta' : 'em obra'}` : 'sumiu'}`);
      else { const bill = Es.bill(T, Es.steps(T).find(s => s.n === N)); if (G.Village.workOf(b1) !== bill.work) out.push(`o trabalho ${G.Village.workOf(b1)} (o degrau: ${bill.work})`);
        sim(() => G.Village.completeBuilding(b1)); const p = In.plan(b1); if (!p || !p.ok || b1.ip.f !== FAM) out.push(`a obra acabada: ${b1.ip ? b1.ip.f : 'sem registro'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`); } }
    const victim = [...S.buildings.values()].find(q => q.type === T && q.w === N && q.built && q.id !== lib.id);
    if (!victim) out.push('nenhuma para derrubar'); else { const id = victim.id; sim(() => G.Village.destroyBuilding(victim, 'deus')); const r = S.buildings.get(id); const p = r && In.plan(r);
      if (!r || r.type !== 'ruin' || !p || !p.ok) out.push(`a ruína: ${r ? r.type : 'sumiu'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`);
      M.salvarCarregar(); S = G.S; const r1 = S.buildings.get(id); const p1 = r1 && In.plan(r1); if (r && (!r1 || r1.type !== 'ruin' || r1.w !== N || !p1 || !p1.ok)) out.push(`a ruína depois do save: ${r1 ? `${r1.type}, ${r1.w} casas` : 'sumiu'}`); }
    const q3 = qaS(); if (q3.length) out.push('o verificador' + said(q3));
    ok('b7d os casos ruins: a obra salva no meio (as 4 casas, o degrau, o trabalho dele) e acabada; a grande biblioteca derrubada pelo deus (a ruína e a planta dela), salva e carregada; o verificador limpo', !out.length && M.limpo(), out.length ? out.join(' / ') : `sem falha${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
}

// ---------------------------------------------------------------- b8: the town that justifies it raises it by itself
// (the towns of 150 people of the ready worlds — the 500-year one — choose the step and have no lot of 4 tiles left, T-870: the
// raising is proven in the metropolis world, where a town comes to justify it by the families the developer's door brings)
function b8() {
  const st = Es.steps(T).find(s => s.n === N); const bill = Es.bill(T, st); let V, S;
  const chooses = s => Es.choose(s, T).map(q => q.id + '/' + q.n).join(' > ');
  const townsOf = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  // ---- a: who chooses it
  const WORLD = process.env.MUNDO8 || 'anos500'; M.pronto(WORLD); V = G.Village; S = G.S;
  { const towns = townsOf(); const bigT = towns.filter(s => V.pop(s.id) >= st.req.pop), smallT = towns.filter(s => V.pop(s.id) < st.req.pop && V.pop(s.id) >= 3);
    const land = bigT.map(s => { s._noSite = {}; const lot = sim(() => V.findSite(s, T, undefined, N)) || sim(() => V.openSite(s, T, st)); const old = [...S.buildings.values()].find(b => b.set === s.id && b.type === T && b.built && b.w === 2); const gl = old ? sim(() => V.growLot(s, old, st)) : null; return `${s.name}: ${lot ? 'um lote de ' + N : 'nenhum lote de ' + N + ' casas'}${old ? (gl ? ', a que tem cresce no lugar' : ', a que tem não cresce no lugar') : ''}`; });
    if (!ok(`b8a no mundo ${WORLD}: a cidade de ${st.req.pop} pessoas ou mais escolhe a grande biblioteca primeiro; a menor, só a clássica`, bigT.length >= 1 && bigT.every(s => Es.choose(s, T)[0].id === 'grande' && Es.choose(s, T).length === 2) && smallT.length >= 1 && smallT.every(s => Es.choose(s, T).length === 1 && Es.choose(s, T)[0].n === 2),
      `${bigT.map(s => `${s.name} (${V.pop(s.id)}) ${chooses(s)}`).join('; ') || 'nenhuma cidade grande'}; as ${smallT.length} menores: ${smallT.slice(0, 2).map(s => `${s.name} (${V.pop(s.id)}) ${chooses(s)}`).join('; ')}; a terra delas (T-870): ${land.join('; ')}`)) return; }
  // ---- b: a town that comes to justify it, with land and stone
  M.pronto('metropole'); V = G.Village; S = G.S;
  const sum = o => Object.values(o || {}).reduce((a, x) => a + (x || 0), 0); const occ = b => { for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (S.occ[y * G.N + x] !== b.id) return false; return true; };
  const libOf = s => [...S.buildings.values()].find(b => b.set === s.id && b.type === T);
  const heads = townsOf().filter(s => { let best = null, bn = -1; for (const o of G.Fac.settlementsOf(s.fac)) { const n = V.pop(o.id); if (n > bn) { bn = n; best = o; } } return best === s; }); // (the developer's door brings the families to the biggest town of a people)
  const arrive = set => { G.Dev.fa = set.fac; let g = 0; while (V.pop(set.id) < st.req.pop && g++ < 60) G.Dev.act.fam(2); return V.pop(set.id); };
  const bare = heads.find(s => !libOf(s) && (s.tier || 0) >= 2), withOld = heads.find(s => { const b = libOf(s); return b && b.built && b.w === 2 && (s.tier || 0) >= 2; });
  if (!bare || !withOld) { ok('b8b as cidades da prova', false, `sem biblioteca: ${bare ? bare.name : 'nenhuma'}; com a clássica: ${withOld ? withOld.name : 'nenhuma'}`); return; }
  const p0 = V.pop(bare.id), c0 = chooses(bare); const p1 = arrive(bare); const f = G.Fac.get(bare.fac);
  const before = c0 === `${T}/2`, after = Es.choose(bare, T)[0].id === 'grande' && Es.choose(bare, T).length === 2;
  // (the town that cannot pay: no stone in store and no income of stone — V.affords says no, and the step is not the one it raises)
  const pedra0 = f.pedra, stone0 = f.stock.stone || 0; if (stone0 > 0) G.Depot.use('f:' + f.id, 'stone', stone0, { code: 'teste' }); f.pedra = [S.day, 0, 0];
  const poor = V.affords(bare, T, st); if (stone0 > 0) G.Depot.make('f:' + f.id, 'stone', stone0, { code: 'teste' }); f.pedra = pedra0;
  ok(`b8b a cidade passa a justificar o degrau: com ${p0} pessoas só a clássica; chegam famílias (a porta do modo desenvolvedor) e, com ${st.req.pop} ou mais, escolhe a grande primeiro — e sem pedra nem renda de pedra não a pode pagar (V.affords)`, before && p0 < st.req.pop && p1 >= st.req.pop && after && poor === false,
    `${bare.name}: ${p0} pessoas ${c0}; ${p1} pessoas ${chooses(bare)}; sem pedra: pode pagar ${poor}; com a pedra dela (${Math.round(f.stock.stone || 0)} e a renda ${V.stoneIncome(f.id)}): ${V.affords(bare, T, st)}`);
  // ---- by V.startProject, the town's own door: the lot of 4, the step's bill and work, the plan's record of 4 tiles
  bare._noSite = {}; f.pedra = [S.day, 0, 100]; const made = sim(() => V.startProject(bare, T));
  ok('b8c a cidade ergue o degrau grande sozinha (V.startProject): o lote de 4 casas, a conta e o trabalho do degrau, o registro da planta de 4', !!made && made.w === N && made.h === N && made.esc === 'grande' && !made.built && !!made.ip && made.ip.n === N && made.ip.f === FAM && V.workOf(made) === bill.work && Math.abs(sum(V.bill(made)) - sum(bill.cost)) < 1e-6 && occ(made),
    made ? `${bare.name}: ${T}#${made.id} ${made.w}×${made.h} (${made.esc}) em ${made.x},${made.y}; a conta ${JSON.stringify(V.bill(made))} (o degrau: ${JSON.stringify(bill.cost)}; o tipo: ${JSON.stringify(G.BDEF[T].cost)}); o trabalho ${V.workOf(made)} (o degrau ${bill.work}, o tipo ${G.BDEF[T].work}); a família ${made.ip.f}` : 'nenhum lote');
  if (made && made.w === N) { sim(() => V.completeBuilding(made)); const p = Sp.planNow(made); const t = In.table(made); const n = u => ((t && t.byUse.get(u)) || []).filter(e => e.ok).length;
    ok('b8d pronta: a planta da forma no chão que a cidade achou, a entrada na rua, os lugares do degrau; emprega três copistas', !!p && p.ok && made.ip.ok !== false && n('ler') >= LIB.ler && n('escrever') >= LIB.escribas && E.jobsOf(made).n === 3, `${p && p.ok ? 'planta ok' : 'planta NÃO: ' + (p ? p.errs[0] : '-')}, lado ${made.ip.s}; ${n('ler')} lugares de ler, ${n('escrever')} mesas de escriba; emprega ${E.jobsOf(made).n}`); }
  // ---- the planner enlarges in place the classic library the town had (V.grow: the other types held at their classic step by
  // the proof, so the library's turn is the one judged)
  const q0 = V.pop(withOld.id); const g0 = sim(() => V.grow(withOld, G.Fac.get(withOld.fac), V.counts(withOld.id))); const q1 = arrive(withOld); const b = libOf(withOld);
  const ch0 = Es.choose; Es.choose = (s, t, c) => (t === T ? ch0(s, t, c) : [Es.classic(t)]); let r = null; const old = { id: b.id, x: b.x, y: b.y, name: V.buildName(b) }, facts0 = b.ip.h.length;
  try { withOld._noSite = {}; G.Fac.get(withOld.fac).pedra = [S.day, 0, 100]; sim(() => { for (const o of [...S.buildings.values()]) if (o.set === withOld.id && !o.built && o.type !== 'ruin' && G.BDEF[o.type].civic) V.completeBuilding(o); });
    G.Depot.make('f:' + withOld.fac, 'stone', 200, { code: 'teste' }); r = sim(() => V.grow(withOld, G.Fac.get(withOld.fac), V.counts(withOld.id))); } finally { Es.choose = ch0; }
  if (!ok('b8e o planejador amplia no lugar a biblioteca que a cidade já tinha (V.grow): o mesmo prédio, maior, em obra — e antes de justificar o degrau não a ampliava', (!g0 || g0.id !== old.id) && q0 < st.req.pop && q1 >= st.req.pop && !!r && r.id === old.id && r.w === N && r.esc === 'grande' && !r.built && !!r.amp && r.amp.de === 2 && r.ip.n === N && V.buildName(r) === old.name && r.x <= old.x && r.y <= old.y && r.x + N >= old.x + 2 && r.y + N >= old.y + 2 && occ(r),
    r ? `${withOld.name} (${q0} → ${q1} pessoas): #${r.id} «${V.buildName(r)}» de ${r.amp ? r.amp.de : '?'} para ${r.w} casas (${r.esc}), o lote de antes dentro do novo; o registro da planta de ${r.ip.n} casas, a família ${r.ip.f}` : `não ampliou (${withOld.name}, ${q0} → ${q1} pessoas)`)) return;
  const id = r.id; M.salvarCarregar(); S = G.S; V = G.Village; const r1 = S.buildings.get(id); sim(() => V.completeBuilding(r1)); const p = Sp.planNow(r1); const q = qaS();
  ok('b8f a ampliação salva no meio e acabada: a grande biblioteca pronta, a planta da forma, o verificador limpo', !!r1 && r1.built && r1.w === N && r1.ip.f === FAM && !!p && p.ok && r1.ip.h.length > facts0 && !q.length && M.limpo(), `${r1 ? `${r1.w} casas, ${r1.built ? 'pronta' : 'em obra'}, ${r1.ip.f}` : 'sumiu'}; ${p && p.ok ? 'planta ok' : 'planta NÃO'}; a história do prédio com ${r1 ? r1.ip.h.length : 0} fatos (antes ${facts0}); o verificador ${q.length ? said(q) : 'limpo'}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ---------------------------------------------------------------- b9: a save of before
function b9() {
  const out = [], sum = [];
  for (const w of ['metropole', 'mega']) { M.pronto(w); const S = G.S; const libs = [...S.buildings.values()].filter(b => b.type === T);
    let n = 0; for (const b of libs) { n++; const p = b.built ? In.plan(b) : null;
      if (b.w !== 2 || (b.esc && b.esc !== T)) out.push(`${w} #${b.id}: ${b.w} casas (${b.esc})`);
      if (b.built && (!p || !p.ok || b.ip.f !== FAM || p.rooms.some(m => m.fn === 'acervo'))) out.push(`${w} #${b.id}: ${b.ip ? b.ip.f : 'sem registro'}, ${p && p.ok ? p.rooms.map(m => m.fn).join(',') : 'planta NÃO'}`);
      if (b.built && (E.jobsOf(b).n !== 1 || Bi.maxOf(b) !== Bi.MAX || Bi.maxCopias(b) !== Bi.MAX - 2)) out.push(`${w} #${b.id}: emprega ${E.jobsOf(b).n}, o dia ${Bi.maxOf(b)}`); }
    const up = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && Es.choose(s, T).some(q => q.n !== 2)); if (up.length) out.push(`${w}: ${up.map(s => `${s.name} (${G.Village.pop(s.id)})`).join(', ')} escolhe o degrau grande`);
    const q = qaS(); if (q.length) out.push(`${w}: o verificador${said(q)}`);
    sum.push(`${w}: ${n} bibliotecas clássicas, a maior cidade com ${Math.max(...[...S.settlements.values()].map(s => G.Village.pop(s.id)))} pessoas`); }
  ok('b9a um save de antes (os mundos prontos): as bibliotecas clássicas como eram — 2 casas, a planta do salão da forma, um copista, o dia de 8 e 6 —, nenhuma cidade abaixo de 150 pessoas escolhe o degrau grande, o verificador limpo', !out.length && M.limpo(), out.length ? some(out).join(' / ') : sum.join('; '));
}

const TESTS = { b1, b2, b3, b4, b5, b6, b7, b8, b9 };
for (const k of Object.keys(TESTS)) if (want(k)) { try { TESTS[k](); } catch (e) { ok(k, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
{ const e = M.erros(); ok('sem erro do jogo', !Object.keys(e.mod).length && !e.console.length, JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | ')); }
console.log(fails.length ? `SABER: FALHOU (${fails.join(', ')})` : 'SABER: ok');
process.exit(fails.length ? 1 : 0);
