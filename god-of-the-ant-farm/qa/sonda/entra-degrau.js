// P4: a entrada pelo degrau — para cada prédio, a escada da porta de fora (Space.doorFlight) e se o corpo entra andando: de frente
// (da rua, reto até a porta) e pelo pé da escada (da rua até o degrau mais baixo, pelos degraus até o patamar, e pela porta).
// node entra-degrau.js [mundo] [tipos] [n por tipo]          ID=5763 só um
const path = require('path');
const ROOT = process.env.ROOT || require('path').join(__dirname, '..', '..');
const M = require(path.join(ROOT, 'qa/nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/cam3d.js', 'js/input3d.js', 'qa/visual/corpo-qa.js'] });
M.pronto(process.argv[2] || 'metropole');
const S = G.S, TL = G.Space.TILE, Av = G.Avatar, C3 = G.Cam3D, IN = Av.input, Sp = G.Space, In = G.Interiors;
const CAM = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000, aspect: 16 / 9 };
const RDT = 1 / 60; const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
function frame() { IN.camYaw = C3.yaw; G.debug.step(RDT * Sp.TIME); Av.frame(RDT); const p = Av.pos(); if (p) C3.update(RDT, Object.assign({ h: 1.75 }, p), CAM); }
const stop = () => { IN.mx = 0; IN.mz = 0; IN.jump = false; };
function walkTo(X, Z, max) { const st = Av.state(); let still = 0, last = [st.X, st.Z], blk = null;
  for (let k = 0; k < (max || 600); k++) { const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < 0.15) { stop(); return { ok: true }; } C3.yaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); if (st.block) blk = st.block;
    if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.003) { if (++still > 45) { stop(); return { ok: false, blk, at: [st.X, st.Z], Y: st.Y }; } } else still = 0; last = [st.X, st.Z]; }
  stop(); return { ok: false, blk: 'tempo' }; }
const ids = process.env.ID ? process.env.ID.split(',').map(Number) : null;
const types = (process.argv[3] || 'taverna,house,forja,acougue,cadeia,temple,feira,teatro,anfiteatro,paco,armazem').split(','); const per = +(process.argv[4] || 4);
const res = [];
for (const type of types) {
  const bs = [...S.buildings.values()].filter(b => (ids ? ids.includes(b.id) : b.type === type) && b.built && !b.ruin && In.has(b)).sort((a, c) => a.id - c.id).slice(0, ids ? 99 : per);
  for (const b of bs) {
    const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance) continue; const e = p.entrance; const d = p.doors[e.door]; if (!d) { console.log("(sem porta de entrada:", b.type + "#" + b.id, p.shell.kind + ")"); continue; } const w = p.walls[d.wall]; const h = p.holes.find(q => q.door === e.door);
    const lot = { w: b.w * TL, d: b.h * TL }; const l = p.levels.find(q => q.lv === w.lv); const fl = h ? Sp.doorFlight(b, p.shell, lot, w, h, l ? l.y : 0, false) : null;
    const y0 = Sp.plinth(b).y0; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L; if ((lot.w / 2 - e.x) * nx + (lot.w / 2 - e.z) * nz > 0) { nx = -nx; nz = -nz; }
    const D = k => [b.x * TL + e.x + nx * k, b.y * TL + e.z + nz * k];
    const front = D(1.2); const gFront = Sp.footAt(front[0] / TL, front[1] / TL);
    const kinds = fl ? [...new Set(fl.treads.map(t => t.kind))].join('+') : 'nenhuma';
    // (the lowest tread — the foot — in the world's metres, and a point in the street beyond it along the flight)
    let foot = null, beyond = null; if (fl && fl.treads.length) { const lo = fl.treads.reduce((q, t) => (t.y < q.y ? t : q)); const pp = fl.P(lo.a, lo.n); foot = [b.x * TL + pp[0], b.y * TL + pp[1]];
      const pq = fl.P(lo.a + (lo.kind === "side" ? Math.sign(lo.a) * 0.3 : 0), lo.n + 1.3); beyond = [b.x * TL + pq[0], b.y * TL + pq[1]]; }
    const v = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && !o.aboard && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0];
    const live = at => { if (G.Possess.body()) G.Possess.release('deus'); Av.detach(); G.Vg.endTask(v); v.inside = 0; v.x = at[0] / TL; v.y = at[1] / TL; v.path = null; v.hp = 100; v.sleeping = false; G.Possess.take(v); v.job = b.id; Av.attach(v, 0); C3.attach(Av.pos(), 0); for (const dd of p.doors) G.Possess.apply(wq => { In.useDoor(b, dd.id, 'destrancar', wq); return In.useDoor(b, dd.id, 'abrir', wq); }); for (let k = 0; k < 10; k++) frame(); };
    const inside = () => !!Av.indoors() || G.Possess.body().inside === b.id;
    // (1) de frente
    live(D(2.6)); const r1 = walkTo(...D(0.4)); const w1 = r1.ok && (walkTo(...D(-1.0)).ok || inside()) && inside();
    // (2) pelo pé da escada
    let w2 = null, r2 = null; if (beyond) { live(beyond); r2 = walkTo(...foot); let okk = r2.ok; if (okk) { const top = fl.treads.filter(t => t.kind !== 'landing').sort((a, c) => c.y - a.y); for (const t of top.reverse()) { const q = fl.P(t.a, t.n); const rr = walkTo(b.x * TL + q[0], b.y * TL + q[1]); if (!rr.ok) { r2 = rr; okk = false; break; } } } if (okk) { const rr = walkTo(...D(0.3)); okk = rr.ok; if (!okk) r2 = rr; else { walkTo(...D(-1.0)); } } w2 = okk && inside(); }
    res.push({ b: `${b.type}#${b.id}`, povo: b.style, lote: b.w, degraus: kinds + ' ' + (fl ? fl.treads.length : 0), queda: +(y0 - gFront).toFixed(2), frente: w1 ? 'entra' : `não (${r1.blk || ''}${r1.at ? ' em ' + r1.at.map(q => (q).toFixed(1)).join(',') : ''})`, pe: w2 === null ? "-" : w2 ? "entra" : `não (${r2 && r2.blk} ${JSON.stringify(r2)} pé ${foot.map(q=>q.toFixed(1))} de ${beyond.map(q=>q.toFixed(1))})` });
  }
}
console.log('prédio · povo · lote · a escada (o jeito, os degraus) · o plinto sobre a rua diante da porta · de frente · pelo pé da escada');
for (const r of res) console.log(`${r.b.padEnd(16)} ${String(r.povo).padEnd(8)} ${r.lote}  ${r.degraus.padEnd(18)} ${String(r.queda).padStart(5)} m   frente: ${r.frente.padEnd(26)} pé: ${r.pe}`);
const mod = Object.keys(G.modErr || {}); if (mod.length) console.log('modErr', mod);
