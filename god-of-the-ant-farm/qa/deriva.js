// deriva: node qa/deriva.js [mundo] — o casco vazio à deriva (L-807): um navio sem ninguém a bordo, no mar, anda com o vento e,
// dentro do tempo da deriva (um dia e meio no máximo), quebra na costa ou afunda. O navio de guerra vazio não andava nem afundava
// — a corrida do navio de guerra devolvia «nada» a quem não tinha frota, viagem nem gente a bordo —, e a viagem que achava o casco
// vazio de outro povo e não o tomava apagava a marca dele: dois navios de guerra de povos extintos ficaram parados à deriva do
// ano 71 do anos100 ao ano 1001 do anos1000.
//  d1 um navio de guerra que fica vazio no mar aberto (posto como a frota o deixa, fleets.js: a marca, «deriva», o tempo): anda com
//     o vento e, no tempo da deriva, sai do mundo
//  d2 uma viagem de outro povo acha o casco e não o toma («Ninguém quis subir a bordo», o evento do jogo): a marca fica, e o casco
//     segue à deriva até sair do mundo
//  d3 o save de antes: um casco «à deriva» sem a marca (a viagem de antes do L-807 a apagou): o verificador o vê; carregado, a
//     marca volta, e ele anda e sai do mundo
//  e o verificador (S0–S3 novos) limpo, sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | deriva ${name} | ${info}`); if (!c) fails.push(name); };
const KEY = process.argv[2] || 'metropole';
const fresh = q => QA.check().filter(e => e.sev <= 3 && !q.has(e.sys + '|' + e.msg)).map(e => `[S${e.sev}] ${e.sys}: ${e.msg}`);
// a warship of a living people, with no fleet or voyage, and open sea within 30 tiles of it: deep water, deep all round
function pick() {
  const S = G.S, N = G.N, T = G.T;
  const sea = i => i >= 0 && i < N * N && S.type[i] <= T.SEA;
  const open = i => { const x = i % N, y = (i / N) | 0; if (x < 6 || y < 6 || x > N - 7 || y > N - 7) return false; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (!sea(i + dy * N + dx)) return false; return true; };
  for (const s of S.ships.filter(q => q.kind === 'guerra' && !q.fleet && !q.exp && !q.ghost && G.Fac.get(q.fac) && G.Fac.get(q.fac).alive).sort((a, b) => a.id - b.id)) {
    for (let r = 4; r <= 30; r++) for (let k = 0; k < 32; k++) { const x = Math.floor(s.x + Math.cos(k / 32 * 6.283) * r), y = Math.floor(s.y + Math.sin(k / 32 * 6.283) * r); const i = y * N + x; if (open(i)) return { s, at: [x + 0.5, y + 0.5] }; }
  }
  return null;
}
// left empty at sea as a fleet leaves a hull with nobody aboard (fleets.js): the mark, adrift, its time of drift
function adrift(p, mark) {
  const s = p.s; for (const v of G.Naval.aboardOf(s)) G.Naval.unboard(v);
  s.x = p.at[0]; s.y = p.at[1]; s.fleet = 0; s.grapple = 0; s.target = 0; s.prize = 0; s.exp = 0; s.exp0 = 0; s.crew = []; s.path = null; s.route = 0;
  s.st = 'deriva'; s.ghost = mark ? 1 : 0; s.driftT = G.DAY_LEN * 0.5;
}
// lives until the hull leaves the world (a day and a half at most), and says how far the wind took it before
function follow(id, x0, y0) {
  const S = G.S; let t = 0, far = 0;
  while (t < G.DAY_LEN * 1.6) { const s = S.ships.find(q => q.id === id); if (!s) break; far = Math.max(far, G.dist(s.x, s.y, x0, y0)); M.viver(1); t++; }
  return { gone: !G.S.ships.some(q => q.id === id), t, far };
}
M.pronto(KEY); let p = pick();
if (!p) ok('d1 o navio de guerra vazio à deriva anda e sai do mundo', false, `nenhum navio de guerra parado com mar aberto perto, em ${KEY}`);
else {
  // d1 — the empty warship adrift
  { const q = new Set(QA.check().filter(e => e.sev <= 3).map(e => e.sys + '|' + e.msg)); adrift(p, true); const id = p.s.id, x0 = p.s.x, y0 = p.s.y;
    const r = follow(id, x0, y0); const nv = fresh(q);
    ok('d1 o navio de guerra vazio à deriva anda com o vento e sai do mundo', r.gone && r.far > 0.5 && !nv.length, `${KEY}: guerra#${id} vazio em (${x0.toFixed(1)},${y0.toFixed(1)}): andou ${r.far.toFixed(1)} casas e ${r.gone ? 'saiu do mundo em ' + r.t + ' s' : 'SEGUE À DERIVA depois de ' + r.t + ' s'}; ${nv.length ? nv.slice(0, 2).join(' | ') : 'verificador limpo'}`); }
  // d2 — a voyage of another people finds it and does not take it: the mark stays
  { M.pronto(KEY); p = pick(); const q = new Set(QA.check().filter(e => e.sev <= 3).map(e => e.sys + '|' + e.msg)); adrift(p, true); const s = p.s, id = s.id, x0 = s.x, y0 = s.y;
    const other = G.Fac.all().find(f => f.alive && f.id !== s.fac); const ev = (G.Expe.EVENTS || []).find(e => e.id === 'fantasma');
    const out = ev && other ? ev.run({ id: 0, fac: other.id, ships: [], name: 'A Viagem da Prova', dock: 0 }, { ghost: s }) : null;
    const left = !!out && /Ninguém quis subir/.test(out[1] || ''), kept = !!s.ghost && s.st === 'deriva';
    const r = follow(id, x0, y0); const nv = fresh(q);
    ok('d2 uma viagem de outro povo acha o casco e não o toma: a marca fica, e ele segue à deriva até sair do mundo', left && kept && r.gone && !nv.length, `${KEY}: ${out ? '«' + out[1].slice(0, 90) + '»' : 'NENHUM EVENTO'} (${other ? other.name : '—'}); a marca ${kept ? 'ficou' : 'SAIU'}; ${r.gone ? 'saiu do mundo em ' + r.t + ' s' : 'SEGUE À DERIVA depois de ' + r.t + ' s'}; ${nv.length ? nv.slice(0, 2).join(' | ') : 'verificador limpo'}`); }
  // d3 — the save of before: adrift without the mark; the checker sees it, and the load gives the mark back
  { M.pronto(KEY); p = pick(); const q = new Set(QA.check().filter(e => e.sev <= 3).map(e => e.sys + '|' + e.msg)); adrift(p, false); const id = p.s.id, x0 = p.s.x, y0 = p.s.y;
    const seen = QA.check().some(e => e.sys === 'sea' && e.msg.includes(`guerra#${id}`) && /sem a marca/.test(e.msg));
    M.salvarCarregar(); const s1 = G.S.ships.find(o => o.id === id); const back = !!s1 && !!s1.ghost && s1.st === 'deriva';
    const r = follow(id, x0, y0); const nv = fresh(q).filter(e => !e.includes(`guerra#${id}`) || !/sem a marca/.test(e));
    ok('d3 um casco à deriva sem a marca, num save de antes: o verificador o vê; carregado, a marca volta e ele sai do mundo', seen && back && r.gone && !nv.length, `${KEY}: guerra#${id}: antes do load o verificador ${seen ? 'acusa' : 'NÃO ACUSA'}; carregado, a marca ${back ? 'voltou' : 'NÃO VOLTOU'}; andou ${r.far.toFixed(1)} casas e ${r.gone ? 'saiu do mundo em ' + r.t + ' s' : 'SEGUE À DERIVA depois de ' + r.t + ' s'}; ${nv.length ? nv.slice(0, 2).join(' | ') : 'verificador limpo'}`); }
}
{ const e = M.erros(); ok('erros', !Object.keys(e.mod).length && !e.console.length, `módulos: ${Object.keys(e.mod).length ? JSON.stringify(e.mod) : 'nenhum'}; console: ${e.console.length ? e.console.slice(0, 2).join(' | ') : 'nada'}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
