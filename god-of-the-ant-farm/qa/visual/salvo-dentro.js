// salvo-dentro: o corpo salvo dentro de um prédio onde a planta de agora não deixa ficar (L-422) — em Node, sem navegador (a
// simulação do qa/nodemundo.js com os arquivos do corpo, como o qa/visual/corpo-casa.js):
//   node qa/visual/salvo-dentro.js [mundo] [tipos]       (padrão: o mundo pronto «metropole»; um prédio de cada um de 12 tipos)
// Um jogo salvo com o corpo encarnado dentro de um prédio guarda o ponto dele (Possess: avatar.in), e ao abrir o controle
// volta no corpo ali (Modes.wake: Avatar.attach). Se a planta mudou desde o save — uma reforma, uma versão que refaz plantas (o
// L-391 mexe nas paredes, nas peças e nos lances de um terço delas) — ou se o save foi feito no meio da subida de um lance (o
// piso do corpo só muda no topo), o ponto cai onde ninguém fica de pé. As provas:
//   1. o save de antes: em um prédio de cada tipo com um lance subindo do piso da entrada, o corpo posto numa parede de dentro,
//      numa peça e na pegada do lance (o lance é sólido para o corpo no piso de onde sobe: tomado inteiro, pelo pé), salvo e
//      aberto: de pé num chão da planta que a porta alcança, a borda no chão, fora dos lances do piso — ou posto fora pelo mundo
//   2. no meio da subida: o corpo toma o lance pelo pé, é salvo dentro dele e aberto — de pé ao lado dele; volta ao pé e sobe
//   3. o verificador limpo, sem erro de módulo
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | salvo-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const WORLD = process.argv[2] || 'metropole', NT = +(process.argv[3] || 12);
M.pronto(WORLD);
const W = G.W, In = G.Interiors, Sp = G.Space, TL = Sp.TILE, C = In.CELL; // (G.S is read anew: each case loads a save)
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const IN = G.Avatar.input; const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const st = () => G.Avatar.state();
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const R = 0.32, RIM = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
const ups = (p, lv) => p.stairs.filter(s => s.kind !== 'degraus' && s.lv0 === lv);
const inRect = (r, x, z, m) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m;
const reachedAt = (p, lv, x, z) => { const Rg = p.reach && p.reach[lv]; if (!Rg) return true; const n = p.grid.n, cs = p.grid.cs; return !!Rg[Math.floor(z / cs) * n + Math.floor(x / cs)]; };
// (where the body stands, the controller on it: null on the plan's floor the door reaches, the rim on floor, off the flights)
function standWhy(bid, lv) {
  const s = st(), B = G.S.buildings.get(bid); const ins = Sp.indoor(s.X, s.Z, lv, bid); if (!ins || ins.b !== B) return 'fora de toda planta';
  if (!ins.walk) return `na casa ${ins.code}`; if (ups(ins.p, ins.lv).some(f => inRect(f.r, ins.x, ins.z, 0))) return 'dentro de um lance no piso de onde ele sobe';
  if (ins.shell && !reachedAt(ins.p, ins.lv, ins.x, ins.z)) return 'num chão que a porta não alcança';
  for (const [dx, dz] of RIM) { const q = Sp.indoor(s.X + dx * R, s.Z + dz * R, ins.lv, bid); if (!q || !q.walk) return `com a borda fora do chão (${q ? q.code : 'fora'})`; }
  return null;
}
// (one point of each kind on the entrance's storey, the nearest the middle: an inner wall, a piece, the footprint of a flight)
function badPts(p, lv) {
  const g = p.grid.lv[lv]; const out = {}; if (!g) return out; const n = p.grid.n, cs = p.grid.cs;
  const keep = (kind, k) => { const d = Math.hypot(k % n - n / 2, Math.floor(k / n) - n / 2); if (!out[kind] || d < out[kind].d) out[kind] = { x: (k % n + 0.5) * cs, z: (Math.floor(k / n) + 0.5) * cs, d }; };
  for (let k = n + 1; k < n * n - n - 1; k++) { const c = g[k];
    if (c === C.WALL && ((g[k - 1] === C.FLOOR && g[k + 1] === C.FLOOR) || (g[k - n] === C.FLOOR && g[k + n] === C.FLOOR))) keep('parede', k);
    else if (c === C.SOLID && [g[k - 1], g[k + 1], g[k - n], g[k + n]].includes(C.FLOOR)) keep('peça', k); }
  const f = ups(p, lv)[0]; if (f) out.lance = { x: (f.r[0] + f.r[2]) / 2, z: (f.r[1] + f.r[3]) / 2 };
  return out;
}
// (saved, loaded, the controller on the body again — as the game does on opening a save that holds one: Modes.wake)
const saveLoad = () => { M.salvarCarregar(); const w = G.Possess.body(); if (w) { G.Avatar.attach(w, 0); for (let k = 0; k < 10; k++) frame(); } return w; };
// (the body of vid put in building bid at a point of storey lv, as a save keeps it)
const placed = (vid, bid, lv, x, z) => { if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
  const v = G.S.villagers.get(vid), B = G.S.buildings.get(bid); if (!v || !G.Possess.take(v).ok) return undefined;
  G.inSim++; v.inside = B.id; v.x = B.x + x / TL; v.y = B.y + z / TL; v.path = null; G.inSim--; G.S.avatar.lv = lv; G.S.avatar.via = B.id; return saveLoad(); };
// (and after each case, let go and out at the door: no one left in a house not theirs for the verifier)
const outAgain = (vid, bid) => { if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach(); const v = G.S.villagers.get(vid), d = In.planDoor(G.S.buildings.get(bid));
  if (v && d) { G.inSim++; G.Vg.endTask(v); v.inside = 0; v.x = d[0]; v.y = d[1]; v.path = null; G.inSim--; } };
const who = () => [...G.S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && !o.aboard && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0];
function walkTo(X, Z, max, near) {
  let k = 0, still = 0, last = [st().X, st().Z];
  for (; k < (max || 300); k++) { const dx = X - st().X, dz = Z - st().Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame();
    if (Math.hypot(st().X - last[0], st().Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st().X, st().Z]; }
  stop(); for (let q = 0; q < 6; q++) frame(); return Math.hypot(X - st().X, Z - st().Z);
}
// (along the cells the plan's walk from the door reaches — passages of 0.75 m, off the flights —, from the body to a point)
function walkReached(b, p, lv, to) {
  const n = p.grid.n, cs = p.grid.cs, Rg = p.reach[lv]; const c = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)];
  const [sx, sz] = c(st().X - b.x * TL, st().Z - b.y * TL), [tx, tz] = c(to[0], to[1]); const prev = new Map([[sz * n + sx, -1]]); const q = [sz * n + sx];
  for (let i = 0; i < q.length && !prev.has(tz * n + tx); i++) { const k = q[i], x = k % n, z = Math.floor(k / n);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Z = z + dz, j = Z * n + X; if (X < 0 || Z < 0 || X >= n || Z >= n || prev.has(j) || !(Rg[j] || j === tz * n + tx)) continue; prev.set(j, k); q.push(j); } }
  if (!prev.has(tz * n + tx)) return false; const pts = []; for (let k = tz * n + tx; k >= 0; k = prev.get(k)) pts.unshift(k);
  for (const k of pts.slice(1, -1)) if (walkTo(b.x * TL + (k % n + 0.5) * cs, b.y * TL + (Math.floor(k / n) + 0.5) * cs, 120, 0.12) > 0.35) return false;
  return walkTo(b.x * TL + to[0], b.y * TL + to[1], 200, 0.08) < 0.12;
}

// ------------------------------ 1. a save from before the plan was made over ------------------------------
const blds = [...G.S.buildings.values()].filter(b => b.built && b.type !== 'ruin' && In.has(b)).sort((a, c) => a.id - c.id).map(b => b.id);
{ const kinds = {}; const ex = []; let nOut = 0; const types = new Set();
  const note = (kind, tag, why) => { const r = kinds[kind] || (kinds[kind] = { n: 0, ok: 0 }); r.n++; if (!why) r.ok++; else ex.push(`${tag}: ${why}`); };
  for (const id of blds) {
    if (types.size >= NT) break; const b = G.S.buildings.get(id); if (!b || types.has(b.type)) continue; const p = Sp.planNow(b);
    if (!p || !p.ok || !ups(p, p.entryLv || 0).length || p.shell.kind === 'aberta' || !In.planDoor(b)) continue; types.add(b.type);
    const lv = p.entryLv || 0; const pts = badPts(p, lv);
    for (const kind of ['parede', 'peça', 'lance']) { const pt = pts[kind]; if (!pt) continue; const v = who(); if (!v) continue;
      const w = placed(v.id, id, lv, pt.x, pt.z); if (w === undefined) continue; const tag = `${kind} de ${b.type}#${id} (${b.ip.f}) em ${pt.x.toFixed(2)},${pt.z.toFixed(2)}`;
      if (!w) note(kind, tag, null); // (the save opened in the god's eyes: the person inside as anyone, at a place the plan gives)
      else if (!w.inside) { nOut++; note(kind, tag, W.walkableXY(w.x, w.y) || G.Possess.onPlan(w) ? null : 'posto fora onde o mundo não anda'); }
      else note(kind, tag, standWhy(id, G.Possess.level()));
      outAgain(v.id, id); }
  }
  const all = Object.entries(kinds);
  ok('1. salvo numa parede, numa peça e na pegada de um lance da planta de agora: aberto, de pé num chão da planta que a porta alcança, fora dos lances', all.length === 3 && all.every(([, r]) => r.ok === r.n),
    `${types.size} tipos em ${WORLD}: ${all.map(([k, r]) => `${k} ${r.ok} de ${r.n}`).join(', ')}${nOut ? ` (${nOut} postos fora pelo mundo)` : ''}${ex.length ? ' — ' + ex.slice(0, 4).join(' · ') : ''}`);
}

// ------------------------------ 2. saved on the way up a flight ------------------------------
{ let res = null, why = 'nenhum prédio com o pé de um lance onde o corpo fica e alguém para viver';
  for (const id of blds) {
    const b = G.S.buildings.get(id); const p = b && Sp.planNow(b); if (!p || !p.ok || p.shell.kind === 'aberta' || !In.planDoor(b)) continue;
    const s = ups(p, p.entryLv || 0).find(q => q.kind !== 'escada-de-mao'); if (!s) continue; const v = who(); if (!v) break;
    const w0 = placed(v.id, id, s.lv0, s.a[0], s.a[1]); if (!w0 || w0.inside !== id || standWhy(id, G.Possess.level())) { outAgain(v.id, id); continue; }
    // (up from its foot, along it; saved once the body is inside its footprint, on its way up)
    IN.camYaw = Math.atan2(s.dir[1], s.dir[0]); IN.mz = 1; for (let k = 0; k < 60 && st().loco !== 'stair'; k++) frame(); stop();
    const inFl = () => inRect(s.r, st().X - b.x * TL, st().Z - b.y * TL, -0.1); for (let k = 0; k < 600 && st().loco === 'stair' && !inFl(); k++) frame();
    if (!(st().loco === 'stair' && inFl())) { outAgain(v.id, id); continue; }
    const tag = `${b.type}#${id} (${b.ip.f}), lance ${s.id} ${s.lv0}→${s.lv1}`; const w = saveLoad();
    why = !w ? `${tag}: o save abriu sem o corpo` : w.inside !== id ? `${tag}: posto fora` : standWhy(id, G.Possess.level()); if (why && w) why = `${tag}: ${why}`;
    if (!why) { const b2 = G.S.buildings.get(id), p2 = Sp.planNow(b2), s2 = p2.stairs.find(q => q.id === s.id);
      const back = walkReached(b2, p2, s2.lv0, s2.a); if (back) { walkTo(b2.x * TL + s2.b[0], b2.y * TL + s2.b[1], 600, 0.2); for (let k = 0; k < 600 && st().loco === 'stair'; k++) frame(); }
      res = { tag, up: G.Possess.level() === s2.lv1, back }; if (!res.up) why = `${tag}: de volta ${back ? 'ao pé, não subiu' : 'ao pé não chegou'} (piso ${G.Possess.level()})`; }
    outAgain(G.Possess.body() ? G.Possess.body().id : v.id, id); break;
  }
  ok('2. salvo no meio da subida de um lance: aberto, de pé ao lado dele, fora dele; volta ao pé e sobe', !why && !!res && res.up, res && !why ? `${res.tag}: de pé ao lado, voltou ao pé e subiu` : why);
}

// ------------------------------ 3. the verifier ------------------------------
{ const vb = QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg)), er = M.erros(); ok('3. o verificador limpo, sem erro de módulo', !vb.length && !Object.keys(er.mod).length, `${vb.length ? vb.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; módulos ${JSON.stringify(er.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
