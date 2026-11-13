// terra-guardada: a terra guardada cedo (parte da D-160; D-230, D-231, D-232) — Bairros Vivos, o agente M, 3ª rodada, em Node, nos
// mundos prontos. Medido (qa/patch3/bloco-M2.md, seções 3 e 8): a terra em volta de uma capital acaba entre os 60 e os 100
// anos — de 46 pares capital × degrau maior, em três mundos do zero, dois tinham lote aos 100 anos —, e o que mais tapa então
// é prédio de outra cidade (53 a 91% dos lotes). Só a terra guardada cedo alcança.
//   f1  a capital de nível 3 que ainda não tem um dos três de 24 m (o teatro, o palácio, o templo) guarda um campo cívico de 6
//       casas: no mapa, seco, sem prédio que não seja campo dela, o anel livre, no pódio ou aplainável, até o raio e doze, fora
//       do campo da maravilha; a crônica; V.reservas o mostra; no dia seguinte, o mesmo
//   f2  nele não se ergue nada: as buscas do planejador o deixam de fora (menos os campos da cidade e um dos três de 24 m dela);
//       outra cidade não; o degrau clássico do mesmo tipo não; a maravilha não; um poço posto pela mão do deus o solta, e no dia
//       seguinte a cidade guarda outro
//   f3  um dos três de 24 m é fundado nele (a busca do planejador dá o canto do campo): o campo é solto («fundada») e a cidade
//       guarda outro para o próximo que lhe falta — nunca em cima da obra
//   f4  quem não guarda: a cidade que não é capital; a capital abaixo de cidade (solta depois de RES_YEARS); a que já tem os três
//   f5  o save no meio: o mesmo campo, o verificador limpo
//   f8  a ordem do campo guardado (T-773): o lote plano mais perto; um por aplainar só sem nenhum plano ao alcance — conferido
//       por uma varredura da própria prova (V.resFits), nas capitais dos mundos prontos, onde há dos dois
//   f9  a terra que não serve mais: o mar entra no campo guardado (o mapa muda) — a cidade o larga («terra») no olhar do dia e
//       guarda outro depois, fora dali
//   f6  as cidades novas longe (D-232): V.keptNear a menos de RES_CLEAR do meio de uma capital com campo guardado, por terra e
//       por mar — os três que escolhem o sítio de uma cidade perguntam
//   f7  procurar mais longe (D-231): os degraus de 8 e 10 casas olham a 6, a 12 e a 20 casas além do raio; os de 6, a 6 e 12;
//       nos mundos prontos, degraus de 8 e 10 que só acham lote no anel de 20
//   f10 a rua que atravessa o campo e não volta pelo anel (L-776): a ponta dela no anel entre duas casas onde não se anda — como o
//       campo de Mênfis, na metrópole da geração 21, colado à muralha diante de um portão —: a fundação não cabe ali, e a cidade o
//       larga no olhar do dia («terra»), como a regra da fundação julga as ruas
//   node qa/terra-guardada.js        (ONLY=f1,f3 só esses; VERB=1 conta mais)
'use strict';
process.chdir(__dirname);
const fs = require('fs');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js', 'qa/aterro-inv.js', 'qa/terra-guardada-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const VERB = !!process.env.VERB;
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | terra-guardada ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Es, D, W, N, T;
const pega = () => { S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; W = G.W; N = G.N; T = G.T; return S; };
const abre = w => { M.pronto(w); return pega(); };
const MUNDOS = ['mega', 'metropole', 'mundial', 'anos500', 'cidade'];
const capitais = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y} (${b.esc || '-'})` : 'nada');
const rico = (set, n) => { G.Fac.get(set.fac).pedra = [S.day, 0, n === undefined ? 100 : n]; };
const pedra = (set, n) => sim(() => D.make('f:' + set.fac, 'stone', n, { code: 'teste' }));
const marca = () => G.S.logN || 0;
const linhas = (n0, rx) => G.S.history.filter(e => e.n > n0 && rx.test(e.txt));
const FIELD = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 };
function checa() {
  const out = []; for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
// (a question to the town's searches that leaves the town as it was: the day's memory of the lots not found, the world's dice)
const quieto = (set, f) => { const k = set._noSite, r = S.rng; set._noSite = {}; G.inSim++; try { return f(); } finally { G.inSim--; set._noSite = k; S.rng = r; } };
const sobre = (r, x, y, w) => x < r.x + r.n && x + w > r.x && y < r.y + r.n && y + w > r.y;
const olha = set => sim(() => V.reservaDia(set)); // (the town's daily look, as its planner asks it)
const civ = set => (set.urb && set.urb.civ) || null;
// (the first ready world with a capital that keeps a civic field at its look — the field it kept already, in the ready worlds of
// the generation 20 and after, made with the rule; one it keeps at this look in a world made before it —: → { mundo, set, r },
// the world left open)
function caso(quer) {
  for (const w of MUNDOS) {
    abre(w);
    for (const set of capitais()) { if ((set.tier || 0) < V.RES_TIER || !V.civWork(set).length || (quer && !quer(set))) continue; olha(set); const r = civ(set); if (r) return { mundo: w, set, r }; }
  }
  return null;
}
// (what makes a lot of six serve, counted again by the proof: → the first thing wrong with it, or '')
function defeito(set, r) {
  if (!(r.x >= 2 && r.y >= 2 && r.x + r.n <= N - 2 && r.y + r.n <= N - 2)) return 'fora do mapa';
  for (let ty = r.y - 1; ty <= r.y + r.n; ty++) for (let tx = r.x - 1; tx <= r.x + r.n; tx++) {
    const i = ty * N + tx; const dentro = tx >= r.x && tx < r.x + r.n && ty >= r.y && ty < r.y + r.n; const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null;
    if (dentro) { if (S.type[i] < T.SAND) return `água em ${tx},${ty}`; if (S.wall[i] || S.road[i] >= 3) return `muro ou estrada em ${tx},${ty}`; if (o && !(o.set === set.id && FIELD[o.type])) return `${o.type}#${o.id} em cima`; }
    else { if (S.type[i] >= T.SAND && S.cliff[i]) return `penhasco no anel em ${tx},${ty}`; if (o && o.blocks) return `${o.type}#${o.id} no anel`; }
  }
  if (!V.podiumFits(r.x, r.y, r.n)) return 'relevo que nem o pódio cobre nem se aplaina';
  const R = Math.round(G.Urban.radius(set, { w: r.n }, V.pop(set.id))) + V.CIVIC_REACH; const d = G.dist(r.x + r.n / 2, r.y + r.n / 2, set.cx, set.cy);
  if (d > R + 1e-6) return `a ${d.toFixed(1)} casas do meio (o raio e doze: ${R})`;
  const w = set.urb.res; if (w && sobre(w, r.x, r.y, r.n)) return 'em cima do campo da maravilha';
  return '';
}

// ------------------------------ f1: a capital guarda o campo cívico ------------------------------
// (um campo que o mundo já guardava — os mundos prontos da geração 20 nasceram com a regra (D-230): a capital o guardou num dia
// da vida dela, e a crônica o disse nesse dia — o olhar de agora o mantém onde estava e não diz nada; o campo guardado neste
// olhar, ou outro no lugar do que o olhar soltou, a crônica diz uma vez. A prova pedia a linha a todo campo, do tempo em que os
// mundos prontos eram de antes da regra e nenhuma capital tinha campo: «mega Hedeby: 0 linhas na crônica», em 11 das 13. T-1017)
run('f1', () => {
  let guardam = 0, semTerra = 0, naoPrecisam = 0, jaTinham = 0; const mal = [], diz = []; let primeiro = null;
  for (const w of MUNDOS) {
    abre(w);
    for (const set of capitais()) {
      if ((set.tier || 0) < V.RES_TIER) continue; const falta = V.civWork(set); if (!falta.length) { naoPrecisam++; continue; }
      const r0 = civ(set) ? Object.assign({}, civ(set)) : null; const hi = marca(); olha(set); const r = civ(set);
      if (!r) { semTerra++; continue; } guardam++;
      const novo = !r0 || r0.x !== r.x || r0.y !== r.y || r0.d !== r.d; if (!novo) jaTinham++;
      const q = defeito(set, r); if (q) mal.push(`${w} ${set.name}: ${q}`);
      if (r.type !== 'civico' || r.n !== 6 || r.chk !== S.day) mal.push(`${w} ${set.name}: o registro ${JSON.stringify(r)}`);
      const L = linhas(hi, /guardou um campo de 24 metros .* para as suas grandes obras/); if (L.length !== (novo ? 1 : 0)) mal.push(`${w} ${set.name}: ${L.length} linhas na crônica (${novo ? 'guardado neste olhar' : 'o campo que já guardava'})`);
      const todos = V.reservas(set); if (!todos.some(o => o.type === 'civico' && o.x === r.x && o.y === r.y && o.n === 6)) mal.push(`${w} ${set.name}: V.reservas não o mostra (${JSON.stringify(todos)})`);
      const x0 = r.x, y0 = r.y; olha(set); const r2 = civ(set); if (!r2 || r2.x !== x0 || r2.y !== y0) mal.push(`${w} ${set.name}: ao segundo olhar ${r2 ? r2.x + ',' + r2.y : 'SOLTO'} (era ${x0},${y0})`);
      diz.push(`${w} ${set.name} (falta ${falta.join(', ')}): em ${r.x},${r.y}${novo ? '' : ' (já o guardava)'}, a ${Math.round(G.dist(r.x + 3, r.y + 3, set.cx, set.cy))} casas do meio, ${(W.slope(r.x, r.y, 6, 6) * 1.5).toFixed(1)} m de relevo`); if (!primeiro && L[0]) primeiro = L[0].txt;
    }
  }
  ok('f1a a capital guarda um campo cívico', guardam >= 3 && !mal.length, `nos mundos prontos, capitais de nível 3 a que falta um dos três de 24 m: ${guardam} guardam um campo de 6 casas (${jaTinham} já o guardavam, ${guardam - jaTinham} neste olhar), ${semTerra} não acham terra; ${naoPrecisam} já têm os três${mal.length ? `; ${mal.length} FALHAS: ${mal.slice(0, 3).join(' | ')}` : ''}. ${diz.slice(0, 4).join('; ')}.${primeiro ? ` «${primeiro}»` : ''}`);
});

// ------------------------------ f2: nele não se ergue nada ------------------------------
run('f2', () => {
  const c = caso(); if (!ok('f2a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}: em ${c.r.x},${c.r.y}` : 'nenhuma capital guarda')) return;
  const { set, r } = c; const mal = []; let buscas = 0;
  // (the planner's own searches, type by type, the classic size and the bigger steps: none on the field but the town's fields
  // and one of the three of 24 m)
  for (const t of Object.keys(G.BDEF)) {
    if (t === 'ruin' || t === 'doca' || t === 'campfire') continue;
    const ns = [undefined].concat(Es.steps(t).filter(st => st.n !== Es.n0(t) && !st.familia).map(st => st.n));
    for (const n of ns) {
      let p = null; try { p = quieto(set, () => V.findSite(set, t, undefined, n)); } catch (e) { continue; } if (!p) continue; buscas++;
      const w = n || G.BDEF[t].w; const pode = FIELD[t] || (V.CIVIC.includes(t) && w === 6);
      if (sobre(r, p[0], p[1], w) && !pode) mal.push(`${t}/${w} em ${p[0]},${p[1]}`);
    }
  }
  const outra = [...S.settlements.values()].find(o => o !== set);
  const portas = [V.resOver(set, 'house', r.x, r.y, 1, 1, true) === set, V.resOver(set, 'farm', r.x + 1, r.y + 1, 2, 2, false) === null, V.resOver(set, 'teatro', r.x, r.y, 6, 6, true) === null, V.resOver(set, 'palacio', r.x, r.y, 6, 6, true) === null, V.resOver(set, 'temple', r.x, r.y, 6, 6, true) === null,
    V.resOver(set, 'teatro', r.x, r.y, 3, 3, true) === set, V.resOver(set, 'temple', r.x + 1, r.y + 1, 4, 4, true) === set, V.resOver(set, 'maravilha', r.x - 2, r.y - 2, 10, 10, true) === set, V.resOver(set, 'banhos', r.x, r.y, 6, 6, true) === set, !!outra && V.resOver(outra, 'teatro', r.x, r.y, 6, 6, true) === set, V.resOver(null, 'estrada', r.x + 2, r.y + 2, 1, 1, false) === set];
  ok('f2b as buscas e as portas', buscas >= 20 && !mal.length && portas.every(Boolean), `${buscas} buscas do planejador de ${set.name} (todo tipo, o degrau clássico e os maiores): em cima do campo, ${mal.length ? mal.slice(0, 4).join(', ') : 'nenhuma que não possa'}; V.resOver: uma casa ${portas[0] ? 'não' : 'PODE'}, um campo da cidade ${portas[1] ? 'pode' : 'NÃO'}, o teatro, o palácio e o templo de 24 m dela ${portas[2] && portas[3] && portas[4] ? 'podem' : 'NÃO'}, o teatro clássico ${portas[5] ? 'não' : 'PODE'}, o templo de 16 m ${portas[6] ? 'não' : 'PODE'}, a maravilha ${portas[7] ? 'não' : 'PODE'}, as termas de 6 ${portas[8] ? 'não' : 'PODEM'}, o teatro de outra cidade ${portas[9] ? 'não' : 'PODE'}, uma estrada ${portas[10] ? 'não' : 'PODE'}`);
  // (the god's hand puts a well on it: let go at once; the same day none is kept; the next day another, clear of the well)
  let livre = null; for (let y = r.y; y < r.y + 6 && !livre; y++) for (let x = r.x; x < r.x + 6; x++) { const i = y * N + x; if (!S.occ[i] && !S.road[i] && !S.treeAt[i] && !S.objAt[i]) { livre = [x, y]; break; } }
  const x0 = r.x, y0 = r.y; const poco = livre ? sim(() => V.addBuilding('well', livre[0], livre[1], set.id, true)) : null;
  const solto = !civ(set) && !!set.urb.civGone && set.urb.civGone.why === 'ocupada'; olha(set); const hoje = civ(set);
  const d0 = S.day; M.saltar(1); pega(); const set2 = S.settlements.get(set.id); const r2 = set2 ? civ(set2) : null;
  ok('f2c o poço do deus solta o campo', !!poco && solto && !hoje && S.day > d0 && (!r2 || !sobre(r2, poco.x, poco.y, 1)), `um poço posto pela mão do deus em ${livre ? livre.join(',') : '—'}, dentro do campo de ${x0},${y0}: o campo ${solto ? 'solto («ocupada»)' : 'NÃO foi solto'}; no mesmo dia a cidade ${hoje ? 'GUARDOU outro' : 'não guarda outro'}; um ano depois ${r2 ? `guarda um em ${r2.x},${r2.y}` : 'não achou outra terra'}`);
  const q = checa(); ok('f2d verificador', q.ok, q.txt);
});

// ------------------------------ f3: um dos três de 24 m é fundado nele ------------------------------
run('f3', () => {
  const c = caso(s => V.civWork(s).length >= 2) || caso(); if (!ok('f3a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}: em ${c.r.x},${c.r.y}; faltam ${V.civWork(c.set).join(', ')}` : 'nenhuma capital guarda')) return;
  const { set, r } = c; const falta0 = V.civWork(set); const t = falta0[0]; const st = Es.steps(t).find(q => q.n === 6); const x0 = r.x, y0 = r.y;
  rico(set, 400); pedra(set, 600);
  const p = quieto(set, () => V.findSite(set, t, undefined, 6));
  const b = p ? sim(() => V.startProject(set, t, p, st)) : null;
  ok('f3b fundado no campo', !!p && p[0] === x0 && p[1] === y0 && !!b && b.x === x0 && b.y === y0 && b.w === 6 && !civ(set) && !!set.urb.civGone && set.urb.civGone.why === 'fundada',
    `a busca do planejador para ${t}/6 dá ${p ? p[0] + ',' + p[1] : 'NADA'} (o campo: ${x0},${y0})${p && p.demolish ? `, com ${p.demolish.length} campo(s) da cidade a sair` : ''}; fundado: ${lado(b)}; o campo ${civ(set) ? 'CONTINUA guardado' : 'solto («' + (set.urb.civGone ? set.urb.civGone.why : '?') + '»)'}`);
  if (!b) return;
  const falta1 = V.civWork(set); const d0 = S.day; M.saltar(1); pega(); const set2 = S.settlements.get(set.id), b2 = S.buildings.get(b.id); const r2 = set2 ? civ(set2) : null;
  const falta2 = set2 ? V.civWork(set2) : [];
  ok('f3c a cidade guarda outro para o próximo', falta1.length === falta0.length - 1 && !falta1.includes(t) && S.day > d0 && (falta2.length ? (!r2 || (!!b2 && !sobre(r2, b2.x, b2.y, b2.w))) : !r2),
    `com ${t}/6 em obra faltam ${falta1.join(', ') || 'nenhum'}; um ano depois ${r2 ? `a cidade guarda um campo em ${r2.x},${r2.y}` : falta2.length ? 'não achou outra terra' : 'não guarda (já tem os três)'}${b2 ? '' : ' (a obra saiu do mapa neste ano)'}`);
  const q = checa(); ok('f3d verificador', q.ok, q.txt);
});

// ------------------------------ f4: quem não guarda ------------------------------
run('f4', () => {
  const c = caso(); if (!ok('f4a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}` : 'nenhuma capital guarda')) return;
  const { set, r } = c; const f = G.Fac.get(set.fac);
  // (a town of the people that is not its capital: none)
  const outras = [...S.settlements.values()].filter(o => o !== set && (o.tier || 0) >= V.RES_TIER && G.Fac.capitalOf(o.fac) !== o); for (const o of outras) olha(o);
  const nenhuma = outras.every(o => !civ(o));
  // (the capital below a city: kept RES_YEARS years, then let go — the years by the proof's hand on the field's own count)
  const t0 = set.tier; set.tier = 2; olha(set); const ainda = !!civ(set) && civ(set).lost === S.day; civ(set).lost = S.day - V.RES_YEARS; olha(set);
  const soltoNivel = !civ(set) && set.urb.civGone.why === 'nivel'; set.urb.civGone = null; olha(set); const abaixo = !civ(set); set.tier = t0; olha(set); const volta = !!civ(set);
  ok('f4b só a capital que é cidade', nenhuma && ainda && soltoNivel && abaixo && volta, `${outras.length} cidades de nível 3 que não são capital: ${nenhuma ? 'nenhuma guarda' : 'UMA GUARDA'}; ${set.name} abaixo de cidade: ${ainda ? 'o campo fica, a contar os anos' : 'NÃO FICA'}, depois de ${V.RES_YEARS} anos ${soltoNivel ? 'é solto («nivel»)' : 'NÃO é solto'}, e ${abaixo ? 'não guarda outro' : 'GUARDA outro'}; cidade de novo, ${volta ? 'guarda' : 'NÃO guarda'}`);
  // (with the three standing — by the god's hand, where the land lets it —: nothing to keep)
  let postos = 0; for (const t of V.civWork(set)) { const st = Es.steps(t).find(q => q.n === 6); const b = sim(() => V.handFound(set, t, st.id, { built: true, R: 60 })); if (b) postos++; }
  const falta = V.civWork(set); olha(set); if (!falta.length) set.urb.civGone = null; olha(set);
  if (!falta.length) ok('f4c com os três de pé, nada a guardar', !civ(set), `os ${postos} que faltavam postos de pé pela mão do deus: a cidade ${civ(set) ? 'AINDA guarda um campo' : 'não guarda campo cívico'}`);
  else console.log(`  (f4c: a mão do deus não achou lote para ${falta.join(', ')} em ${set.name}; sem caso)`);
  const q = checa(); ok('f4d verificador', q.ok, q.txt);
});

// ------------------------------ f5: o save no meio ------------------------------
run('f5', () => {
  const c = caso(); if (!ok('f5a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}: em ${c.r.x},${c.r.y}` : 'nenhuma capital guarda')) return;
  const { set, r } = c; const antes = JSON.stringify([r.type, r.n, r.x, r.y]); M.salvarCarregar(); pega(); const s2 = S.settlements.get(set.id); const r2 = civ(s2);
  olha(s2); const r3 = civ(s2);
  ok('f5b depois do save, o mesmo campo', !!r2 && JSON.stringify([r2.type, r2.n, r2.x, r2.y]) === antes && !!r3 && r3.x === r2.x && r3.y === r2.y, `antes ${antes}; depois do save ${r2 ? JSON.stringify([r2.type, r2.n, r2.x, r2.y]) : 'SUMIU'}; ao olhar seguinte ${r3 ? 'o mesmo' : 'SOLTO'}`);
  const q = checa(); ok('f5c verificador', q.ok, q.txt);
});

// ------------------------------ f6: as cidades novas longe de uma capital com campo guardado ------------------------------
run('f6', () => {
  const c = caso(); if (!ok('f6a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}` : 'nenhuma capital guarda')) return;
  const { set } = c; const D0 = V.RES_CLEAR; const pt = d => [set.cx + d, set.cy];
  const perto = [15.5, 17, D0 - 0.5].map(d => V.keptNear(...pt(d)) === set), longe = [D0 + 0.5, D0 + 6].map(d => V.keptNear(...pt(d)) !== set);
  const u = set.urb; const c0 = u.civ, w0 = u.res; u.civ = null; u.res = null; const sem = V.keptNear(...pt(16)) !== set; u.civ = null; u.res = w0 || { type: 'maravilha', esc: 'maravilha', n: 10, x: 2, y: 2 }; const soMaravilha = V.keptNear(...pt(16)) === set; u.civ = c0; u.res = w0;
  ok('f6b a porta', perto.every(Boolean) && longe.every(Boolean) && sem && soMaravilha && D0 >= 16, `V.RES_CLEAR ${D0}: a 15,5, a 17 e a ${D0 - 0.5} casas do meio de ${set.name} ${perto.every(Boolean) ? 'perto demais' : 'NÃO acusa'}; a ${D0 + 0.5} e a ${D0 + 6} ${longe.every(Boolean) ? 'livre' : 'ACUSA'}; a mesma capital sem campo guardado ${sem ? 'não afasta ninguém' : 'AFASTA'}; só com o campo da maravilha ${soMaravilha ? 'afasta' : 'NÃO afasta'}`);
  // (who chooses the site of a new town asks the door: by land — village.js —, by sea — naval.js —, the expedition's colony,
  // the village of the freed — war.js; the guard's rule 81 is this same reading)
  const src = f => fs.readFileSync('../js/' + f, 'utf8'); const pede = ['village.js', 'naval.js', 'expeditions.js', 'war.js'].map(f => [f, (src(f).match(/keptNear\((x, y|tx, ty)\)/g) || []).length]);
  ok('f6c os quatro que escolhem o sítio perguntam', pede.every(q => q[1] >= 1), pede.map(q => `${q[0]}: ${q[1]} pergunta(s) ao V.keptNear`).join('; '));
});

// ------------------------------ f7: procurar mais longe para os degraus de 8 e 10 ------------------------------
run('f7', () => {
  abre('metropole'); const s0 = capitais()[0]; const fora = capitais().find(s => V.fora(s, 'maravilha')), dentro = capitais().find(s => !V.fora(s, 'maravilha'));
  const regras = V.reachOf(s0, 'palacio', 6).join() === '6,12' && V.reachOf(s0, 'grande_palacio', 8).join() === '6,12,20' && V.reachOf(s0, 'palacio_colossal', 10).join() === '6,12,20' && V.reachOf(s0, 'temple', 8).join() === '6,12,20' && V.reachOf(s0, 'palacio').join() === '6,12' && (!fora || V.reachOf(fora, 'maravilha', 10).join() === '20') && (!dentro || V.reachOf(dentro, 'maravilha', 10).join() === '6,12,20');
  ok('f7a os anéis de cada degrau', regras, `o palácio de 6: ${V.reachOf(s0, 'palacio', 6).join()}; o grande palácio de 8: ${V.reachOf(s0, 'grande_palacio', 8).join()}; o colossal de 10: ${V.reachOf(s0, 'palacio_colossal', 10).join()}; a maravilha de quem a ergue fora da cidade: ${fora ? V.reachOf(fora, 'maravilha', 10).join() : '—'}; de quem a ergue dentro: ${dentro ? V.reachOf(dentro, 'maravilha', 10).join() : '—'}`);
  // (in the ready worlds: every capital, type and step of 8 or more — found with the ring of twenty, and not without it)
  const TIPOS = Object.keys(G.BDEF).filter(t => G.BDEF[t] && (G.BDEF[t].civic || t === 'temple')); let so20 = 0, com12 = 0; const diz = [], mal = [];
  for (const w of ['metropole', 'mega', 'mundial']) {
    abre(w);
    for (const s of capitais()) for (const t of TIPOS) for (const st of Es.choose(s, t).filter(q => q.n >= 8 && !q.familia)) {
      if (V.fora(s, t)) continue; const acha = () => quieto(s, () => V.findSite(s, t, undefined, st.n));
      const B = acha(); const r0 = V.reachOf; V.reachOf = (a, b, n) => r0(a, b, n).filter(e => e <= 12); let A = null; try { A = acha(); } finally { V.reachOf = r0; }
      if (A) { com12++; if (!B) mal.push(`${w} ${s.name} ${t}/${st.n}: com o anel de 12 acha, com o de 20 não`); }
      else if (B) { so20++; const R = Math.round(G.Urban.radius(s, { w: st.n }, V.pop(s.id))); const d = G.dist(B[0] + st.n / 2, B[1] + st.n / 2, s.cx, s.cy); diz.push(`${w} ${s.name} ${t}/${st.n} a ${d.toFixed(0)} casas do meio (o raio ${R})`); }
    }
  }
  ok('f7b degraus de 8 e 10 que só acham lote mais longe', so20 >= 1 && !mal.length, `nos mundos prontos: ${com12} buscas de degraus de 8 casas ou mais já achavam lote até o raio e doze; ${so20} só acham com o anel de vinte (${diz.slice(0, 5).join('; ')})${mal.length ? '; FALHAS: ' + mal.join(' | ') : ''}`);
});

// ------------------------------ f8: a ordem do campo guardado (T-773) ------------------------------
run('f8', () => {
  let planos = 0, aplainados = 0, ambos = 0, nenhum = 0; const mal = [], diz = [];
  for (const w of MUNDOS) {
    M.pronto(w); pega();
    for (const set of capitais()) {
      if ((set.tier || 0) < V.RES_TIER || !V.civWork(set).length) continue; const u = set.urb || (set.urb = { d: [], names: [] }); const c0 = u.civ, g0 = u.civGone;
      u.civ = null; u.civGone = null; sim(() => V.reservaDia(set)); const r = u.civ; const n = V.CIVIC_N;
      // (the proof's own sweep, by the door of the fit: the nearest flat lot and the nearest to be levelled, as far as the town looks)
      const R = Math.round(G.Urban ? G.Urban.radius(set, { w: n }, V.pop(set.id)) : 20) + V.CIVIC_REACH; const cxi = Math.floor(set.cx), cyi = Math.floor(set.cy); let dF = 1e9, dL = 1e9;
      u.civ = null;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const x = cxi + dx - Math.floor((n - 1) / 2), y = cyi + dy - Math.floor((n - 1) / 2); const d = G.dist(x + n / 2, y + n / 2, set.cx, set.cy); if (d > R) continue;
        const flat = W.slope(x, y, n, n) <= V.PODIUM; if (d >= (flat ? dF : dL)) continue; if (!V.resFits(set, 'civico', x, y, n)) continue; if (flat) dF = d; else dL = d;
      }
      u.civ = c0; u.civGone = g0; const tag = `${w} ${set.name}`;
      if (dF < 1e9 && dL < dF) { ambos++; diz.push(`${tag}: um por aplainar a ${dL.toFixed(1)} casas e o plano mais perto a ${dF.toFixed(1)}`); }
      if (!r) { nenhum++; if (dF < 1e9 || dL < 1e9) mal.push(`${tag}: não guardou campo e há lote (plano a ${dF.toFixed(1)}, por aplainar a ${dL.toFixed(1)})`); continue; }
      const dr = G.dist(r.x + n / 2, r.y + n / 2, set.cx, set.cy); const plano = W.slope(r.x, r.y, n, n) <= V.PODIUM;
      if (plano) { planos++; if (Math.abs(dr - dF) > 1e-6) mal.push(`${tag}: guardou um plano a ${dr.toFixed(1)} casas e o mais perto está a ${dF.toFixed(1)}`); }
      else { aplainados++; if (dF < 1e9) mal.push(`${tag}: guardou um lote por aplainar a ${dr.toFixed(1)} casas havendo um plano a ${dF.toFixed(1)}`); else if (Math.abs(dr - dL) > 1e-6) mal.push(`${tag}: guardou um por aplainar a ${dr.toFixed(1)} e o mais perto está a ${dL.toFixed(1)}`); }
    }
  }
  ok('f8 o plano mais perto; por aplainar só sem nenhum plano', !mal.length && planos >= 1 && ambos >= 1, `nos mundos prontos: ${planos} capitais guardam o lote plano mais perto, ${aplainados} um por aplainar (nenhum plano ao alcance), ${nenhum} nenhum; em ${ambos} delas há um lote por aplainar mais perto que o plano mais perto, e o campo é o plano (${diz.slice(0, 3).join('; ')})${mal.length ? ' — MAL: ' + mal.slice(0, 3).join(' | ') : ''}`);
});

// ------------------------------ f9: a terra que não serve mais ------------------------------
run('f9', () => {
  const c = caso(); if (!ok('f9a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}: em ${c.r.x},${c.r.y}` : 'nenhuma capital guarda')) return;
  const { set, r } = c; const mx = r.x + 3, my = r.y + 3; const i = my * N + mx;
  // (the sea comes into the middle of it, by the proof's hand — as who changes the ground must: S.typeVer, W.invalidateLand)
  S.type[i] = T.SEA; S.typeVer = (S.typeVer || 0) + 1; if (W.invalidateLand) W.invalidateLand();
  olha(set); const solto = !civ(set) && !!set.urb.civGone && set.urb.civGone.why === 'terra'; olha(set); const hoje = civ(set);
  M.saltar(1); pega(); const set2 = S.settlements.get(set.id); const r2 = set2 ? civ(set2) : null;
  ok('f9b o mar entra no campo: a cidade o larga', solto && !hoje && (!r2 || !sobre(r2, mx, my, 1)), `uma casa de mar em ${mx},${my}, no meio do campo de ${r.x},${r.y}: no olhar do dia o campo ${solto ? 'foi largado («terra»)' : 'NÃO foi largado'}; no mesmo dia a cidade ${hoje ? 'GUARDOU outro' : 'não guarda outro'}; um ano depois ${r2 ? `guarda um em ${r2.x},${r2.y}` : 'não achou outra terra'}`);
  const q = checa(); ok('f9c verificador', q.ok, q.txt);
});

// ------------------------------ f10: a rua que atravessa o campo e não volta pelo anel (L-776) ------------------------------
run('f10', () => {
  const c = caso(); if (!ok('f10a um campo guardado', !!c, c ? `${c.mundo}, ${c.set.name}: em ${c.r.x},${c.r.y}` : 'nenhuma capital guarda')) return;
  const { set, r } = c; const t = V.civWork(set)[0]; const n = r.n;
  // (a street across the field from one side of its ring to the other, its end on one side between two tiles one does not walk — the
  // water, by the proof's hand, as the ground is changed: S.typeVer, W.invalidateLand —, as Mênfis's field met its wall at both sides
  // of a gate. On the side and column where the tiles are free land, the town's own fields left as they are)
  const free = (x, y) => { const i = y * N + x; return W.inb(x, y) && S.type[i] >= T.SAND && !S.occ[i] && !S.wall[i] && !S.objAt[i] && !S.fire[i]; };
  let at = null;
  for (const side of [-1, 1]) for (let gx = r.x + 1; gx < r.x + n - 1 && !at; gx++) {
    const ey = side < 0 ? r.y - 1 : r.y + n, oy = side < 0 ? r.y + n : r.y - 1; let ok1 = free(gx - 1, ey) && free(gx, ey) && free(gx + 1, ey) && free(gx, oy);
    for (let y = r.y; y < r.y + n && ok1; y++) if (!free(gx, y)) ok1 = false;
    if (ok1) at = { gx, ey, oy };
  }
  if (!ok('f10b a rua pela mão da prova', !!at, at ? `a coluna ${at.gx}, da ponta ${at.gx},${at.ey} (água dos dois lados) à ${at.gx},${at.oy}` : 'nenhuma coluna livre de ponta a ponta no campo')) return;
  for (const dx of [-1, 1]) S.type[at.ey * N + at.gx + dx] = T.SEA; S.typeVer = (S.typeVer || 0) + 1; if (W.invalidateLand) W.invalidateLand();
  for (const y of [at.ey, at.oy]) S.road[y * N + at.gx] = 1; for (let y = r.y; y < r.y + n; y++) S.road[y * N + at.gx] = 1;
  const p = quieto(set, () => V.resSite(set, t, 6));
  olha(set); const solto = !civ(set) && !!set.urb.civGone && set.urb.civGone.why === 'terra';
  ok('f10c a fundação não cabe ali, e a cidade larga o campo no olhar do dia', !p && solto,
    `o lote de ${t}/6 no campo de ${r.x},${r.y}: ${p ? 'a busca o DÁ (a rua se religa?)' : 'a busca não o dá — a rua cortada não volta pelo anel'}; no olhar do dia o campo ${solto ? 'foi largado («terra»)' : 'CONTINUA guardado'}`);
  const q = checa(); ok('f10d verificador', q.ok, q.txt);
});

console.log(fails.length ? `TERRA-GUARDADA: FALHOU (${fails.join(', ')})` : `TERRA-GUARDADA: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
