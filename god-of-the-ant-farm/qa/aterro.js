// aterro: o chão aplainado para a obra grande (a D-120 (3), D-217) e a renda de pedra ao longo dos anos (D-216) — Bairros Vivos,
// o agente M, 2ª rodada (T-761), em Node, nos mundos prontos. Medido (qa/patch3/bloco-M2.md): o relevo é o que mais barra os lotes
// de um degrau grande — junto do lote seco e vazio mais perto de cada capital há 7 a 30 m dele —, e a renda de pedra de um só
// ano (um ano bom) fazia a capital pedir degraus que levava 14 a 18 anos para erguer, ou nunca erguia.
//   t1  o plano do aplainar, em todo lote que se aplaina perto das capitais (a porta pura V.earthPlan): nenhum canto mexe mais
//       de V.LEVEL; só a até duas casas do lote; nenhum canto de fora que toque água, caverna, muro, estrada ou prédio que não
//       é campo; o lote fica dentro do pódio; o anel sem penhasco e nenhuma casa da margem vira um
//   t2  o planejador funda num lote aplainado onde o pódio não cobre nenhum: o chão escrito como o plano dizia, a terra na obra
//       (b.terra) e no trabalho dela (V.workOf), a crônica, o mapa avisado
//   t3  a obra pronta e o save: o chão e a marca atravessam o save; o verificador limpo
//   t4  o pódio primeiro: onde há um lote que o pódio cobre, o planejador fica com ele — o mesmo que acharia sem o aplainar;
//       e em toda capital, tipo e degrau dos mundos prontos (t4d); sem lote livre plano, o lote livre que se aplaina vem antes
//       de abrir lugar sobre as casas da cidade (t4e, D-264)
//   t5  o deus interfere: um poço posto junto de um canto que mexeria — o lote deixa de se aplainar; a obra derrubada — o chão
//       fica; a ampliação no lugar nunca num lote que se aplaina
//   t6  o campo guardado (D-121): o lote que o pódio cobre mais perto; só sem nenhum, o que se aplaina
//   t7  o lote aberto (V.openSite): um lote que se aplaina nunca à frente de um plano
//   t8  a porta que aplaina (V.levelLot) avisa o mapa: a versão do terreno e a do mapa de andar sobem
//   m1  a média da renda de pedra: um quinto de cada ano que passa, os anos sem pedra contados; a conta sem média começa no último
//       ano inteiro
//   m2  o povo pede pelo estoque e quinze anos da menor entre a renda do último ano e a média: um ano bom sozinho não paga, a
//       média sem o último ano não paga, quinze anos (não vinte)
//   m3  pelo livro: a pedra entregue hoje entra na média quando o dia vira
//   node qa/aterro.js        (ONLY=t1,m2 só esses; VERB=1 conta mais)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js', 'qa/aterro-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const VERB = !!process.env.VERB;
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | aterro ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Es, D, W, N, T;
const pega = () => { S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; W = G.W; N = G.N; T = G.T; return S; };
const abre = w => { M.pronto(w); return pega(); };
const MUNDOS = ['mega', 'metropole', 'mundial', 'cidade'];
const capitais = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y} (${b.esc || '-'})` : 'nada');
const rico = (set, n) => { G.Fac.get(set.fac).pedra = [S.day, 0, n === undefined ? 100 : n]; };
const pedra = (set, n) => D.make('f:' + set.fac, 'stone', n, { code: 'teste' });
const marca = () => G.S.logN || 0;
const linhas = (n0, rx) => G.S.history.filter(e => e.n > n0 && rx.test(e.txt));
const pub = t => !!G.BDEF[t] && (!!G.BDEF[t].civic || t === 'temple' || t === 'monument');
function checa() {
  const out = []; for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
// (a question to the town's searches that leaves the town as it was: the day's memory of the lots not found, the world's dice)
const quieto = (set, f) => { const k = set._noSite, r = S.rng; set._noSite = {}; G.inSim++; try { return f(); } finally { G.inSim--; set._noSite = k; S.rng = r; } };
const acha = (set, t, st) => quieto(set, () => V.findSite(set, t, undefined, st.n) || (V.opens(t, st) ? V.openSite(set, t, st) : null));
const semAplainar = f => { const l0 = V.LEVEL; V.LEVEL = 0; try { return f(); } finally { V.LEVEL = l0; } };
const VV = () => N + 1;
const faixa = (x, y, n, vx, vy) => Math.max(x - vx, vx - (x + n), y - vy, vy - (y + n), 0); // (how far out of the lot a corner is)
const TIPOS = ['teatro', 'palacio', 'grande_palacio', 'temple', 'banhos', 'biblioteca', 'monument', 'palacio_colossal', 'maravilha'];
// (the first ready world with a capital and a public work of a bigger step for which the planner finds no lot its podium covers
// and finds one to level — the biggest step it would raise there, as its own door tries them; or, plano: true, one whose lot
// the podium covers. The people's stone by the proof's hand: only the land is at stake. → { mundo, set, type, st, p })
function caso(plano) {
  for (const w of MUNDOS) {
    abre(w);
    for (const set of capitais()) {
      if ((set.tier || 0) < 2) continue; rico(set, 400); sim(() => pedra(set, 600));
      for (const type of TIPOS) {
        if (V.counts(set.id).siteTypes[type]) continue;
        const L = Es.choose(set, type).filter(st => st.n > Es.n0(type) && !st.familia && V.affords(set, type, st)); if (!L.length) continue;
        let st = null, p = null; for (const q of L) { p = acha(set, type, q); if (p) { st = q; break; } }
        if (!st || p.demolish) continue; const sl = W.slope(p[0], p[1], st.n, st.n);
        if (plano ? sl <= V.PODIUM : sl > V.PODIUM && !semAplainar(() => L.some(q => acha(set, type, q)))) return { mundo: w, set, type, st, p, sl };
      }
    }
  }
  return null;
}

// ------------------------------ t1: o plano do aplainar ------------------------------
run('t1', () => {
  let lotes = 0, planos = 0, margem = 0; const mal = []; const nao = {}; let exemplo = '';
  for (const w of ['mega', 'metropole']) {
    abre(w); const H = S.H; const CL = G.Relief.CLIFF;
    const barra = i => (S.type[i] < T.SAND || (G.Caves && G.Caves.isMouth && G.Caves.isMouth(i)) ? 'água ou caverna' : S.wall[i] || S.road[i] >= 3 ? 'muro ou estrada' : (S.occ[i] && !({ farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 })[(S.buildings.get(S.occ[i]) || {}).type]) ? 'prédio' : '');
    for (const set of capitais()) for (const n of [4, 6, 8, 10]) {
      const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
      for (let y = Math.max(5, cy - 36); y <= Math.min(N - 5 - n, cy + 36); y++) for (let x = Math.max(5, cx - 36); x <= Math.min(N - 5 - n, cx + 36); x++) {
        const sl = W.slope(x, y, n, n); if (sl <= V.PODIUM) { if (V.earthOf(x, y, n) !== 0) mal.push(`${w} ${x},${y} n${n}: o pódio cobre e V.earthOf deu ${V.earthOf(x, y, n)}`); continue; }
        let seco = true; for (let ty = y; ty < y + n && seco; ty++) for (let tx = x; tx < x + n; tx++) if (S.type[ty * N + tx] < T.SAND) { seco = false; break; }
        if (!seco) continue; lotes++; const e = V.earthOf(x, y, n);
        if (sl > V.PODIUM + 2 * V.LEVEL + 1e-9 && e !== -1) mal.push(`${w} ${x},${y} n${n}: ${sl.toFixed(1)} níveis de relevo e V.earthOf deu ${e}`);
        const to = V.earthPlan(x, y, n); if (!(e > 0)) { nao[e] = (nao[e] || 0) + 1; if (to) mal.push(`${w} ${x},${y} n${n}: sem aplainar (${e}) e com plano`); continue; }
        if (!to) { mal.push(`${w} ${x},${y} n${n}: aplaina (${e}) e sem plano`); continue; } planos++;
        const at = k => (to.has(k) ? to.get(k) : H[k]); let vol = 0;
        for (const [k, h] of to) {
          const vx = k % VV(), vy = (k / VV()) | 0; const d = faixa(x, y, n, vx, vy); vol += Math.abs(h - H[k]);
          if (Math.abs(h - H[k]) > V.LEVEL + 0.011) mal.push(`${w} ${x},${y} n${n}: o canto ${vx},${vy} mexe ${Math.abs(h - H[k]).toFixed(2)} níveis`);
          if (d > 2) mal.push(`${w} ${x},${y} n${n}: o canto ${vx},${vy} mexe a ${d} casas do lote`);
          for (let ty = vy - 1; ty <= vy; ty++) for (let tx = vx - 1; tx <= vx; tx++) { if (tx >= x && tx < x + n && ty >= y && ty < y + n) continue; const q = barra(ty * N + tx); if (q) mal.push(`${w} ${x},${y} n${n}: o canto ${vx},${vy} mexe e toca ${q} em ${tx},${ty}`); }
        }
        if (Math.abs(vol - e) > 1e-6) mal.push(`${w} ${x},${y} n${n}: a terra do plano ${vol.toFixed(3)} e V.earthOf ${e.toFixed(3)}`);
        // (the rule itself, counted again by the proof: the lot's corners into a band of the podium's height, midway between
        // its lowest and its highest; the corners one and two tiles out by two thirds and one third; a corner beside what bars
        // stays — and is not in the plan, as checked above)
        { const r2 = h => Math.round(h * 100) / 100; let mn0 = 1e9, mx0 = -1e9; for (let vy = y; vy <= y + n; vy++) for (let vx = x; vx <= x + n; vx++) { const h = H[vy * VV() + vx]; if (h < mn0) mn0 = h; if (h > mx0) mx0 = h; }
          const band = V.PODIUM - 0.01, lo = r2((mn0 + mx0 - band) / 2), hi = r2(lo + band);
          for (let vy = y - 2; vy <= y + n + 2; vy++) for (let vx = x - 2; vx <= x + n + 2; vx++) {
            const d = faixa(x, y, n, vx, vy), k = vy * VV() + vx, h = H[k], nh = r2(h + (Math.max(lo, Math.min(hi, h)) - h) * (1 - d / 3));
            if (Math.abs(nh - h) < 0.005) { if (to.has(k)) mal.push(`${w} ${x},${y} n${n}: o canto ${vx},${vy} mexe sem a regra pedir`); continue; }
            let toca = false; for (let ty = vy - 1; ty <= vy; ty++) for (let tx = vx - 1; tx <= vx; tx++) { if (tx >= x && tx < x + n && ty >= y && ty < y + n) continue; if (barra(ty * N + tx)) toca = true; }
            if (toca) continue;
            if (!to.has(k) || Math.abs(to.get(k) - nh) > 1e-6) mal.push(`${w} ${x},${y} n${n}: o canto ${vx},${vy}, a ${d} casas do lote, devia ir de ${h.toFixed(2)} a ${nh.toFixed(2)} e ${to.has(k) ? 'vai a ' + to.get(k).toFixed(2) : 'não mexe'}`);
            else if (d > 0) margem++;
          } }
        let mn = 1e9, mx = -1e9; for (let vy = y; vy <= y + n; vy++) for (let vx = x; vx <= x + n; vx++) { const h = at(vy * VV() + vx); if (h < mn) mn = h; if (h > mx) mx = h; }
        if (mx - mn > V.PODIUM + 1e-6 || Math.abs(Math.round(mx * 100) - mx * 100) > 1e-3) mal.push(`${w} ${x},${y} n${n}: aplainado, o lote fica com ${(mx - mn).toFixed(2)} níveis (o pódio: ${V.PODIUM})`);
        for (let ty = y - 3; ty < y + n + 3; ty++) for (let tx = x - 3; tx < x + n + 3; tx++) {
          if ((tx >= x && tx < x + n && ty >= y && ty < y + n) || S.type[ty * N + tx] < T.SAND) continue;
          const a = at(ty * VV() + tx), b = at(ty * VV() + tx + 1), c = at((ty + 1) * VV() + tx), dd = at((ty + 1) * VV() + tx + 1); const cliff = Math.max(a, b, c, dd) - Math.min(a, b, c, dd) > CL; if (!cliff) continue;
          const anel = tx >= x - 1 && tx <= x + n && ty >= y - 1 && ty <= y + n;
          if (anel) mal.push(`${w} ${x},${y} n${n}: aplainado, penhasco no anel em ${tx},${ty}`); else if (!S.cliff[ty * N + tx]) mal.push(`${w} ${x},${y} n${n}: aplainado, ${tx},${ty} vira penhasco`);
        }
        if (!exemplo) exemplo = `${w}, ${set.name}: o lote de ${n} em ${x},${y}, ${(sl * 1.5).toFixed(1)} m de relevo, ${to.size} cantos, ${e.toFixed(1)} níveis de terra`;
      }
    }
  }
  const nomes = { '-1': 'relevo demais', '-2': 'água ou caverna', '-3': 'muro, estrada ou prédio', '-4': 'um canto mexe demais', '-5': 'penhasco' };
  ok('t1a as regras do plano', planos >= 50 && margem > planos && !mal.length, `megalópole e metrópole, os lotes secos de 4, 6, 8 e 10 casas até 36 do meio de cada capital com mais relevo que o pódio: ${lotes}; ${planos} se aplainam (um: ${exemplo}); os outros: ${Object.keys(nao).map(k => nao[k] + ' ' + (nomes[k] || k)).join(', ')}${mal.length ? `; ${mal.length} FALHAS: ${mal.slice(0, 3).join(' | ')}` : '; em todo plano: nenhum canto mexe mais de ' + V.LEVEL + ' níveis nem a mais de 2 casas do lote, nenhum de fora toca água, caverna, muro, estrada ou prédio, o lote fica no pódio, o anel sem penhasco, e cada canto vai aonde a regra manda (' + margem + ' cantos da margem acompanham, por dois terços e um terço)'}`);
  ok('t1b os que não se aplainam têm cada causa', (nao['-1'] || 0) > 0 && (nao['-2'] || 0) + (nao['-3'] || 0) > 0, `relevo demais ${nao['-1'] || 0}, água ou caverna ${nao['-2'] || 0}, muro, estrada ou prédio ${nao['-3'] || 0}, um canto mexe demais ${nao['-4'] || 0}, penhasco ${nao['-5'] || 0}`);
});

// ------------------------------ t2, t3: o planejador funda num lote aplainado ------------------------------
run('t2', () => {
  const c = caso(false); if (!ok('t2a um lote só com o aplainar', !!c, c ? `${c.mundo}, ${c.set.name}: ${c.type}/${c.st.n} — sem aplainar o planejador não acha lote para degrau nenhum do tipo; com ele, ${c.p[0]},${c.p[1]}, ${(c.sl * 1.5).toFixed(1)} m de relevo (o pódio cobre ${V.PODIUM * 1.5} m)` : 'nenhum mundo pronto tem uma capital com lote só para aplainar')) return;
  const { set, type, st } = c; const n = st.n; const H0 = Float64Array.from(S.H); const tv0 = S.typeVer || 0, walk0 = S.walkVer; const hi = marca();
  const plano = V.earthPlan(c.p[0], c.p[1], n), diz = V.earthOf(c.p[0], c.p[1], n);
  set._noSite = {}; const b = sim(() => V.startProject(set, type));
  if (!ok('t2b a obra fundada, o lote no pódio', !!b && !b.built && b.w === n && b.x === c.p[0] && b.y === c.p[1] && b.terra > 0 && W.slope(b.x, b.y, n, n) <= V.PODIUM + 1e-6, b ? `${lado(b)}: a terra movida ${b.terra} níveis; o relevo do lote agora ${(W.slope(b.x, b.y, b.w, b.h) * 1.5).toFixed(2)} m` : 'V.startProject não fundou')) return;
  let mudou = 0, vol = 0, fora = 0, demais = 0, difPlano = 0;
  for (let k = 0; k < H0.length; k++) { const d = S.H[k] - H0[k]; if (Math.abs(d) < 1e-9) continue; mudou++; vol += Math.abs(d); if (Math.abs(d) > V.LEVEL + 0.011) demais++; if (faixa(b.x, b.y, n, k % VV(), (k / VV()) | 0) > 2) fora++; if (!plano || !plano.has(k) || Math.abs(plano.get(k) - S.H[k]) > 1e-4) difPlano++; }
  ok('t2c o chão escrito como o plano dizia', mudou > 0 && !!plano && mudou === plano.size && !difPlano && !fora && !demais && Math.abs(vol - diz) < 1e-3 && Math.abs(vol - b.terra) < 0.011, `${mudou} cantos mexeram (o plano: ${plano ? plano.size : '-'}), ${vol.toFixed(2)} níveis ao todo (V.earthOf dizia ${diz.toFixed(2)}); fora de duas casas do lote: ${fora}; mais de ${V.LEVEL} níveis: ${demais}; diferentes do plano: ${difPlano}`);
  let penhasco = 0; for (let ty = b.y - 1; ty <= b.y + n; ty++) for (let tx = b.x - 1; tx <= b.x + n; tx++) { if (tx >= b.x && tx < b.x + n && ty >= b.y && ty < b.y + n) continue; const i = ty * N + tx; if (S.type[i] >= T.SAND && S.cliff[i]) penhasco++; }
  const B = Es.billOf(b); const L = linhas(hi, /aplainou o chão/);
  ok('t2d o anel, o trabalho, a crônica, o mapa', penhasco === 0 && V.workOf(b) === B.work + b.terra * V.EARTH && V.workOf(b) > B.work && L.length === 1 && (S.typeVer || 0) > tv0 && (S.walkVer || 0) > (walk0 || 0), `penhascos no anel: ${penhasco}; o trabalho ${V.workOf(b)} = o do degrau (${B.work}) + a terra (${b.terra} × ${V.EARTH}); «${L.length ? L[0].txt : 'NENHUMA LINHA'}»; o terreno avisado (${tv0} → ${S.typeVer}), o mapa de andar (${walk0 || 0} → ${S.walkVer})`);
  const q = checa(); ok('t2e verificador', q.ok, q.txt);
  // ---- t3: a obra pronta e o save
  if (ONLY && !ONLY.includes('t3')) return;
  const h = () => { let x = 2166136261; for (let k = 0; k < S.H.length; k++) { x ^= Math.round(S.H[k] * 1000); x = Math.imul(x, 16777619); } return x >>> 0; };
  const h0 = h(), terra0 = b.terra; M.salvarCarregar(); pega(); const b2 = S.buildings.get(b.id);
  ok('t3a o save no meio', h() === h0 && !!b2 && b2.terra === terra0 && W.slope(b2.x, b2.y, n, n) <= V.PODIUM + 1e-6 && V.workOf(b2) === B.work + terra0 * V.EARTH, `depois do save: o chão ${h() === h0 ? 'o mesmo' : 'MUDOU'}, a terra da obra ${b2 ? b2.terra : '-'}, o trabalho ${b2 ? V.workOf(b2) : '-'}`);
  sim(() => V.completeBuilding(b2)); const q2 = checa();
  ok('t3b a obra pronta no chão aplainado', b2.built && q2.ok, `${lado(b2)} de pé; ${q2.txt}`);
  sim(() => V.removeBuilding(b2)); const q3 = checa();
  ok('t3c o deus a derruba: o chão fica', h() === h0 && !S.buildings.get(b.id) && q3.ok, `a obra tirada pela mão do deus: o chão ${h() === h0 ? 'como ficou' : 'MUDOU'}; ${q3.txt}`);
});

// ------------------------------ t4: o pódio primeiro ------------------------------
run('t4', () => {
  const c = caso(true); if (!ok('t4a um lote que o pódio cobre', !!c, c ? `${c.mundo}, ${c.set.name}: ${c.type}/${c.st.n} em ${c.p[0]},${c.p[1]}, ${(c.sl * 1.5).toFixed(1)} m de relevo` : 'nenhum')) return;
  const { set, type, st } = c; const sem = semAplainar(() => acha(set, type, st)); const H0 = Float64Array.from(S.H);
  set._noSite = {}; const b = sim(() => V.startProject(set, type)); let mudou = 0; for (let k = 0; k < H0.length; k++) if (Math.abs(S.H[k] - H0[k]) > 1e-9) mudou++;
  ok('t4b o planejador fica com ele', !!b && !!sem && b.x === sem[0] && b.y === sem[1] && !b.terra && !mudou && V.workOf(b) === Es.billOf(b).work, b ? `${lado(b)}: o mesmo lote que acharia sem o aplainar (${sem ? sem[0] + ',' + sem[1] : 'NENHUM'}); a terra ${b.terra || 0}; cantos mexidos ${mudou}` : 'não fundou');
  const q = checa(); ok('t4c verificador', q.ok, q.txt);
  // (and everywhere: every capital, type and step of the ready worlds whose search finds a lot its podium covers finds the
  // same lot with the levelling — the flat lots of every ring are asked first, the ones to level last. The search against the
  // search: a step with no free lot opens its room over the town's own low houses and fields — V.openSite, the t7, where a lot
  // to level comes after every flat one —, and a free lot to level comes before that opening, the work's earth before a
  // family's house (D-264). Asked as one, the search and the opening: Tebas of the mundial of the generation 20, its temple of
  // 4 — no free flat lot; the opening took a hut down at 35,93; the levelling found the free lot at 34,92, 1,9 levels to move
  // —, «1 DIFERENTES», T-1058)
  // (a type whose field the town keeps goes to that field first, flat or to be levelled — D-121, resSite; the field's own choice
  // is the t6's: Tenochtitlan of the cidade of the generation 21 keeps the field of its colossal wonder, 13, at 56,41, to be
  // levelled, and its wonder of 10 went into it with the levelling, «1 DIFERENTES: sem aplainar 45,33; com ele 57,42», T-1086)
  let iguais = 0, antes = 0, guardados = 0; const mal = [], mal2 = [];
  const livre = (s, t, q) => quieto(s, () => V.findSite(s, t, undefined, q.n));
  const abreLugar = (s, t, q) => (V.opens(t, q) ? quieto(s, () => V.openSite(s, t, q)) : null);
  const relevo = (p, q) => (W.slope(p[0], p[1], q.n, q.n) * 1.5).toFixed(1) + ' m de relevo';
  for (const w of ['metropole', 'mega', 'mundial', 'cidade']) {
    abre(w);
    for (const s of capitais()) for (const t of TIPOS) for (const q of Es.choose(s, t).filter(x => x.n > Es.n0(t) && !x.familia)) {
      if (s.urb && s.urb.res && s.urb.res.type === t) { guardados++; continue; }
      const A = semAplainar(() => livre(s, t, q));
      if (!A) {
        // (no free flat lot: the free lot the levelling finds, if any, is one to level and takes nothing down — before the
        // opening over the town's houses that the step would make without the levelling)
        const B = livre(s, t, q); const Ab = B ? semAplainar(() => abreLugar(s, t, q)) : null;
        if (B && Ab) { antes++; if (!(W.slope(B[0], B[1], q.n, q.n) > V.PODIUM) || (B.demolish && B.demolish.length)) mal2.push(`${w} ${s.name} ${t}/${q.n}: sem aplainar abriria ${Ab[0]},${Ab[1]}; com ele ${B[0]},${B[1]} (${relevo(B, q)}${B.demolish ? ', derrubando ' + B.demolish.length : ''})`); }
        continue;
      }
      const B = livre(s, t, q);
      if (B && B[0] === A[0] && B[1] === A[1]) iguais++; else mal.push(`${w} ${s.name} ${t}/${q.n}: sem aplainar ${A[0]},${A[1]}; com ele ${B ? B[0] + ',' + B[1] + ' (' + relevo(B, q) + ')' : 'NADA'}`);
    }
  }
  ok('t4d o plano primeiro, em toda capital', iguais >= 10 && !mal.length, `nos mundos prontos, ${iguais} buscas (capital × tipo × degrau) com lote livre que o pódio cobre: o mesmo lote com o aplainar e sem ele (${guardados} do tipo que a cidade guarda campo: no campo dele, t6)${mal.length ? `; ${mal.length} DIFERENTES: ${mal.slice(0, 3).join(' | ')}` : ''}`);
  ok('t4e o lote livre que se aplaina antes de abrir lugar sobre as casas (D-264)', !mal2.length, `${antes} degrau(s) sem lote livre plano que, sem o aplainar, abririam o seu lugar sobre as casas da cidade: com ele, um lote livre a aplainar, sem nada derrubado${mal2.length ? `; FALHAS: ${mal2.slice(0, 3).join(' | ')}` : ''}`);
});

// ------------------------------ t5: o deus interfere ------------------------------
run('t5', () => {
  const c = caso(false); if (!ok('t5a um lote só com o aplainar', !!c, c ? `${c.mundo}, ${c.set.name}: ${c.type}/${c.st.n} em ${c.p[0]},${c.p[1]}` : 'nenhum')) return;
  const { set, type, st, p } = c; const n = st.n; const plano = V.earthPlan(p[0], p[1], n);
  // (the enlargement of a work where it stands is never on a lot to be levelled: the same lot, asked as its own)
  const livre = V.lotFor(set, type, n, p[0], p[1]), dono = { id: -1, set: set.id, type, x: p[0] + 1, y: p[1] + 1, w: Es.n0(type), h: Es.n0(type) };
  const proprio = V.lotFor(set, type, n, p[0], p[1], dono);
  ok('t5b a ampliação no lugar só com o pódio', !!livre && !proprio, `o lote de ${n} em ${p[0]},${p[1]}: para uma obra nova ${livre ? 'serve' : 'NÃO SERVE'}; para ampliar um prédio que estivesse nele ${proprio ? 'SERVE' : 'não serve'}`);
  // (a well by the god's hand on a free tile out of the lot that a moving corner of the lot's own edge touches)
  let posto = null;
  busca: for (const [k] of plano) { const vx = k % VV(), vy = (k / VV()) | 0; if (faixa(p[0], p[1], n, vx, vy) !== 0) continue;
    for (let ty = vy - 1; ty <= vy; ty++) for (let tx = vx - 1; tx <= vx; tx++) { if (tx >= p[0] && tx < p[0] + n && ty >= p[1] && ty < p[1] + n) continue; const i = ty * N + tx; if (S.occ[i] || S.type[i] < T.SAND || S.road[i] || S.treeAt[i] || S.objAt[i]) continue; const w = sim(() => V.addBuilding('well', tx, ty, set.id, true)); if (w) { posto = [tx, ty, vx, vy]; break busca; } } }
  const e = posto ? V.earthOf(p[0], p[1], n) : 0; set._noSite = {}; const outro = posto ? acha(set, type, st) : null;
  ok('t5c um prédio junto de um canto que mexeria', !!posto && e === -3 && !(outro && outro[0] === p[0] && outro[1] === p[1]), posto ? `um poço posto pela mão do deus em ${posto[0]},${posto[1]}, junto do canto ${posto[2]},${posto[3]} da beira do lote: V.earthOf ${e} (-3: prédio na margem); a busca do planejador agora ${outro ? 'dá ' + outro[0] + ',' + outro[1] : 'não acha lote'}` : 'nenhuma casa livre junto de um canto da beira do lote que mexe');
  const q = checa(); ok('t5d verificador', q.ok, q.txt);
});

// ------------------------------ t8: a porta que aplaina avisa o mapa ------------------------------
// (V.levelLot asked by the proof on a free lot to be levelled where no cliff changes — nothing founded on it: the ground's
// version and the walking map's go up by the door's own word; who stood there is on the new ground)
// (in the first ready world that has one: the megalópole of the generation 20 has none near any of its capitals, «nenhum», T-1059)
run('t8', () => {
  let lote = null; const CL = G.Relief.CLIFF;
  busca: for (const w of ['mega', 'metropole', 'mundial', 'cidade']) for (const set of (abre(w), capitais())) { const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let y = Math.max(6, cy - 30); y <= Math.min(N - 12, cy + 30); y++) for (let x = Math.max(6, cx - 30); x <= Math.min(N - 12, cx + 30); x++) {
      if (!(V.earthOf(x, y, 6) > 0)) continue; let livre = true;
      for (let ty = y - 3; ty < y + 9 && livre; ty++) for (let tx = x - 3; tx < x + 9; tx++) { const i = ty * N + tx; if (S.occ[i] || S.cliff[i] || S.type[i] < T.SAND) { livre = false; break; } }
      if (!livre) continue; const to = V.earthPlan(x, y, 6); const at = k => (to.has(k) ? to.get(k) : S.H[k]); let muda = false;
      for (let ty = y - 4; ty < y + 10 && !muda; ty++) for (let tx = x - 4; tx < x + 10; tx++) { const a = at(ty * VV() + tx), b = at(ty * VV() + tx + 1), c = at((ty + 1) * VV() + tx), d = at((ty + 1) * VV() + tx + 1); if (Math.max(a, b, c, d) - Math.min(a, b, c, d) > CL) { muda = true; break; } }
      if (!muda) { lote = [x, y, set]; break busca; }
    } }
  if (!ok('t8a um lote livre que se aplaina sem mexer em penhasco', !!lote, lote ? `${lote[2].name}: o lote de 6 em ${lote[0]},${lote[1]}, ${(W.slope(lote[0], lote[1], 6, 6) * 1.5).toFixed(1)} m de relevo` : 'nenhum')) return;
  const [x, y] = lote; const tv0 = S.typeVer || 0, wv0 = S.walkVer || 0; const vol = sim(() => V.levelLot(x, y, 6));
  ok('t8b a porta avisa o mapa', vol > 0 && W.slope(x, y, 6, 6) <= V.PODIUM + 1e-9 && (S.typeVer || 0) > tv0 && (S.walkVer || 0) > wv0 && V.levelLot(x, y, 6) === 0, `V.levelLot moveu ${vol.toFixed(2)} níveis; o lote agora com ${(W.slope(x, y, 6, 6) * 1.5).toFixed(2)} m; a versão do terreno ${tv0} → ${S.typeVer || 0}, a do mapa de andar ${wv0} → ${S.walkVer || 0}; pedida de novo, nada a mover`);
  const q = checa(); ok('t8c verificador', q.ok, q.txt);
});

// ------------------------------ t6: o campo guardado ------------------------------
// (the lot a capital keeps for its wonder — D-121 —: the nearest its podium covers; only with none, the nearest that can be
// levelled. Asked of the town's own daily look, with the levelling and without it, the lot it had put back after)
run('t6', () => {
  let planos = 0, aplainados = 0, maiores = 0, mantidos = 0; const mal = [], diz = [];
  for (const w of ['metropole', 'mega', 'anos500', 'anos1000', 'mundial']) {
    abre(w);
    for (const set of capitais()) {
      if ((set.tier || 0) < V.RES_TIER) continue; const wk = V.resWork(set); if (!wk) continue; const f = G.Fac.get(set.fac);
      if ([...S.buildings.values()].some(b => b.type === wk.type && V.facOfSet(b.set) === f.id)) continue;
      const u = set.urb || (set.urb = { d: [], names: [] }); const r0 = u.res, g0 = u.resGone;
      const pede = () => { u.res = null; u.resGone = null; const r = sim(() => V.reservaDia(set)); return r ? { x: r.x, y: r.y, n: r.n, sl: W.slope(r.x, r.y, r.n, r.n) } : null; };
      const A = semAplainar(pede), B = pede();
      // (kept a second day: the lot to be levelled is still the town's at its next look)
      const fica = B ? sim(() => V.reservaDia(set)) : null; if (B && fica && fica.x === B.x && fica.y === B.y) mantidos++;
      u.res = r0; u.resGone = g0;
      // (the ladder from the biggest step, as the planner's: without the levelling the town keeps the biggest step with a lot
      // its podium covers; with it, that same lot — or a bigger step, which then has no flat lot, on one to be levelled)
      if (A) { const maior = !!B && B.n > A.n && B.sl > V.PODIUM, mesmo = !!B && B.n === A.n && B.x === A.x && B.y === A.y && B.sl <= V.PODIUM;
        if (mesmo) planos++; else if (maior) { maiores++; diz.push(`${w} ${set.name}: ${wk.type}, o de ${B.n} em ${B.x},${B.y} com ${(B.sl * 1.5).toFixed(1)} m de relevo, em vez do de ${A.n} plano`); }
        else mal.push(`${w} ${set.name}: sem aplainar guarda ${A.n} em ${A.x},${A.y}; com ele ${B ? `${B.n} em ${B.x},${B.y} (${(B.sl * 1.5).toFixed(1)} m de relevo)` : 'NADA'}`); }
      else if (B) { aplainados++; if (!(B.sl > V.PODIUM) || !(V.earthOf(B.x, B.y, B.n) > 0)) mal.push(`${w} ${set.name}: guarda ${B.n} em ${B.x},${B.y} que nem o pódio cobre nem se aplaina`); diz.push(`${w} ${set.name}: ${wk.type}, ${B.n} em ${B.x},${B.y}, ${(B.sl * 1.5).toFixed(1)} m de relevo`); }
    }
  }
  // (every capital that keeps a field compared — the flat lot it would keep, the same with the levelling —; a world of dense
  // towns may have none with a flat lot for its wonder at all: no capital of the five ready worlds of the generation 21 has one,
  // Roma of the mundial keeps hers on a lot to be levelled, and the case said «0 num lote que o pódio cobre». The flat-first is
  // the comparison of each that has one (mal); one capital at least that keeps a field, T-1086)
  ok('t6a o campo guardado: o plano primeiro', planos + aplainados + maiores > 0 && mantidos === planos + aplainados + maiores && !mal.length, `capitais que guardariam um campo para a sua maravilha nos mundos prontos: ${planos} num lote que o pódio cobre (o mesmo com o aplainar e sem ele), ${maiores} num degrau maior que só tem lote aplainado, ${aplainados} só num lote que se aplaina${diz.length ? ' (' + diz.join('; ') + ')' : ''}; guardado ainda no dia seguinte: ${mantidos}${mal.length ? '; FALHAS: ' + mal.slice(0, 3).join(' | ') : ''}`);
});

// ------------------------------ t7: o lote aberto ------------------------------
// (a step that opens its room over the town's own low houses and fields — V.openSite, D-115 —: a lot to be levelled never
// before one its podium covers. Every capital, every type and step it justifies, with the levelling and without it)
run('t7', () => {
  let casos = 0, novos = 0; const mal = [];
  for (const w of ['metropole', 'mega', 'mundial', 'cidade']) {
    abre(w);
    for (const set of capitais()) for (const type of TIPOS) for (const st of Es.choose(set, type).filter(q => q.n > Es.n0(type) && !q.familia && V.opens(type, q))) {
      const pede = () => quieto(set, () => { const p = V.openSite(set, type, st); return p ? { x: p[0], y: p[1], sl: W.slope(p[0], p[1], st.n, st.n) } : null; });
      const A = semAplainar(pede), B = pede();
      if (A) { casos++; if (!B || B.sl > V.PODIUM) mal.push(`${w} ${set.name} ${type}/${st.n}: sem aplainar abre ${A.x},${A.y}; com ele ${B ? `${B.x},${B.y} com ${(B.sl * 1.5).toFixed(1)} m de relevo` : 'NADA'}`); }
      else if (B) { novos++; if (!(B.sl > V.PODIUM)) mal.push(`${w} ${set.name} ${type}/${st.n}: abre ${B.x},${B.y} plano que sem o aplainar não abria`); }
    }
  }
  ok('t7a o lote aberto: o plano primeiro', casos > 0 && !mal.length, `nos mundos prontos, ${casos} degraus abrem o seu lugar num lote que o pódio cobre — e com o aplainar continuam num lote plano; ${novos} só abrem num lote que se aplaina${mal.length ? '; FALHAS: ' + mal.slice(0, 3).join(' | ') : ''}`);
});

// ------------------------------ m1 a m3: a renda de pedra ao longo dos anos ------------------------------
run('m1', () => {
  abre('metropole'); const set = capitais()[0]; const f = G.Fac.get(set.fac); const d = S.day; const ant = f.pedra;
  const com = p => { f.pedra = p; return V.stoneMean(f.id); };
  const a = com([d - 3, 50, 0, d - 3, 100]), esperado = ((100 * 0.8 + 0.2 * 50) * 0.8) * 0.8;
  const b1 = com([d, 5, 70]), b2 = com([d - 1, 40, 0]), b3 = com([d - 5, 40, 0]), b4 = com([d, 0, 0, d, 33]); f.pedra = ant;
  ok('m1a um quinto de cada ano, os anos sem pedra contados', Math.abs(a - esperado) < 1e-9 && V.MEAN === 0.2, `a média 100 até três anos atrás, 50 naquele ano e nada nos dois seguintes: ${a.toFixed(2)} (o esperado: ${esperado.toFixed(2)})`);
  ok('m1b a conta sem média começa no último ano inteiro', b1 === 70 && b2 === 40 && b3 === 0 && b4 === 33, `hoje 5 e ontem 70: ${b1}; ontem 40: ${b2}; a última pedra há cinco anos: ${b3}; a média em dia fica como está: ${b4}`);
});
run('m2', () => {
  abre('metropole'); let set = null, P6 = null;
  for (const s of capitais()) { const st = Es.steps('palacio').find(q => q.n === 6); if (st && Es.can('palacio', G.Civ.idOfFac(s.fac) || 'classico', 6)) { set = s; P6 = st; break; } }
  if (!ok('m2a a capital e o degrau', !!set, set ? `${set.name}: o palácio de 6` : 'nenhuma')) return;
  const f = G.Fac.get(set.fac); const d = S.day; sim(() => { if ((f.stock.stone || 0) > 0) D.use('f:' + f.id, 'stone', f.stock.stone, { code: 'teste', mine: true }); });
  // (the stone the step asks of the store, as V.affords counts it: the least income that pays it in V.YEARS years, by trial)
  const paga = (ult, med) => { f.pedra = [d, 0, ult, d, med]; return V.affords(set, 'palacio', P6); };
  let i = 1; while (i < 400 && !paga(i, i)) i++; const B = Es.bill('palacio', P6).cost.stone;
  const bom = paga(i * 10, i - 1), velho = paga(i - 1, i * 10), dois = paga(i, i), vinte = Math.ceil(i * 15 / 20), quinze = paga(vinte, vinte);
  ok('m2b a menor entre o último ano e a média', i > 1 && i < 400 && !bom && !velho && dois, `o palácio de 6 (${B} de pedra na conta), o estoque vazio: paga com ${i} por ano no último ano e na média; com ${i * 10} no último ano e ${i - 1} na média ${bom ? 'PAGA' : 'não paga'}; com ${i - 1} no último ano e ${i * 10} na média ${velho ? 'PAGA' : 'não paga'}`);
  ok('m2c quinze anos, não vinte', V.YEARS === 15 && vinte < i && !quinze, `V.YEARS ${V.YEARS}: com ${vinte} por ano (o que vinte anos pagariam) ${quinze ? 'PAGA' : 'não paga'}`);
});
run('m3', () => {
  abre('cidade'); const set = capitais()[0]; const f = G.Fac.get(set.fac); f.pedra = [S.day, 0, 0, S.day, 0]; const d0 = S.day;
  sim(() => D.make('f:' + f.id, 'stone', 50, { code: 'entrega' })); const hoje = V.stoneMean(f.id);
  for (let k = 0; k < 60 && S.day === d0; k++) M.viver(5);
  // (the first stone of the new day: the year that ended goes into the mean before the count turns to the new one)
  sim(() => D.make('f:' + f.id, 'stone', 5, { code: 'entrega' }));
  const p = f.pedra; const ontem = p[0] === S.day ? p[2] : p[0] === S.day - 1 ? p[1] : 0; const m = sim(() => V.stoneMean(f.id));
  ok('m3 pelo livro, quando o dia vira', hoje === 0 && S.day === d0 + 1 && ontem >= 50 && Math.abs(m - 0.2 * ontem) < 1e-9 && p[3] === S.day && Math.abs(p[4] - m) < 1e-9, `${set.name}: 50 de pedra entregues hoje (a média ainda ${hoje}); virado o dia e entregue a primeira pedra do novo, o ano de ontem ${ontem} e a média ${m.toFixed(2)} (um quinto), guardada ao lado da conta (${JSON.stringify(p.slice(3))})`);
});

console.log(fails.length ? `ATERRO: FALHOU (${fails.join(', ')})` : `ATERRO: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
