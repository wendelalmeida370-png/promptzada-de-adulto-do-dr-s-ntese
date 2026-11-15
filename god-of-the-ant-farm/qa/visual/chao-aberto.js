// chao-aberto: o corpo entra andando no chão aberto — a praça e a feira, os lotes de planta que o mundo atravessa (L-410) —,
// em Node, sem navegador (a simulação do qa/nodemundo.js com os arquivos do corpo, como o qa/visual/obra-corpo.js):
//   node qa/visual/chao-aberto.js [mundo]       (padrão: o mundo pronto «metropole»)
// A casca 'aberta' da praça e da feira não tem parede nem porta e fica um pouco para dentro do lote (0,1 m na praça, 0,1 a
// 0,2 m na feira); o mundo anda o lote todo. As provas:
//   1. a borda: em cada praça e feira do mundo, a cada 5 cm dos quatro lados, onde a rua de fora se anda e o chão de dentro
//      está livre, a travessia da borda a cada 1 cm pela regra dos pés (G.Space.indoor; a rua onde ele não diz nada) — cruza-se
//      em todos os pontos (antes: em nenhum, uma faixa de 9 a 25 cm sem chão em volta do lote); e quantos têm na borda um
//      degrau mais alto que um passo (o plinto da feira num lote em declive: sobe-se com as mãos, não andando)
//   2. o corpo de verdade (o controle, quadro a quadro): na rua diante de cada lado de algumas praças e feiras, anda para dentro
//      até o chão da planta e volta para a rua; os pés sempre no chão que a planta ou a rua dão ali, nunca onde nenhuma deixa
//   3. os rostros da praça romana: o pé do lance fica a 0,5 m da borda do lote — o corpo vem da rua, fica diante do pé, na borda,
//      e sobe ao topo (antes: não havia onde ficar diante do pé); onde a borda ali é mais alta que um passo (a praça no chão
//      mais alto do lote, num declive), o corpo sobe com as mãos — e nunca pousa dentro do lance (L-411: subindo a borda, os pés
//      caíam no lance dos rostros, que só se toma pelo pé, e o corpo ficava preso nele)
//   3b. o pulo que não alcança o topo: onde a borda do lote fica mais alta que um passo sobre a rua (o plinto num declive), o
//      corpo anda até ela e pula um pouco antes, a seis distâncias; os pulos curtos caem ao pé dela — e nunca com um ponto da
//      borda do corpo dentro do degrau (fora da escalada), nunca com os pés sob o chão (nem escalando), e todos acabam em cima
//      (antes: a borda do corpo, levada por cima da quina no ar, ficava dentro da pedra quando os pés caíam abaixo do topo, e a
//      escalada dali passava os pés pela quina — o e6 «plano» da geração 17, L-653)
//   4. o verificador limpo (S0 a S2 novos), sem erro de módulo
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | chao-aberto ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'metropole');
const S = G.S, W = G.W, Sp = G.Space, In = G.Interiors, TL = Sp.TILE;
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const IN = G.Avatar.input; const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const st = () => G.Avatar.state();
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg));

// the lots of a plan the world walks across, and the body's rule at a point of the world (metres): where a plan is, its word;
// elsewhere the street's ground, as the world walks it — and the height the feet stand at there
const open = [...S.buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].blocks === false && In.has(b) && Sp.planNow(b)).sort((a, c) => a.id - c.id);
const world = (X, Z) => W.walkableXY(X / TL, Z / TL);
const feet = (X, Z) => { const q = Sp.indoor(X, Z, 0, 0); if (q) return q.walk ? q.y : null; return world(X, Z) ? Sp.footAt(X / TL, Z / TL) : null; };
const STEP = 0.6; // (the body's step up: Avatar.TUNE.stepUp — higher, a ledge the hands take)
// (a crossing from a point out of the lot to one in it, every centimetre: whether the feet find ground all along, and the
// highest step on it)
function cross(ax, az, bx, bz) {
  const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 0.01)); let prev = null, rise = 0;
  for (let k = 0; k <= n; k++) { const y = feet(ax + (bx - ax) * k / n, az + (bz - az) * k / n); if (y === null) return { ok: false, rise }; if (prev !== null) rise = Math.max(rise, Math.abs(y - prev)); prev = y; }
  return { ok: true, rise };
}
// (the four sides of a lot: a point along it at a (metres from its start), out of the lot by t (t < 0: in))
const sidesOf = b => { const x0 = b.x * TL, z0 = b.y * TL, x1 = (b.x + b.w) * TL, z1 = (b.y + b.h) * TL;
  return [['oeste', x0, -1, 'x', z0, z1], ['leste', x1, 1, 'x', z0, z1], ['norte', z0, -1, 'z', x0, x1], ['sul', z1, 1, 'z', x0, x1]].map(([name, e, out, ax, a0, a1]) => ({ name, a0, a1, P: (a, t) => (ax === 'x' ? [e + out * t, a] : [a, e + out * t]) })); };
const inPlan = (b, X, Z) => { const q = Sp.indoor(X, Z, 0, 0); return !!(q && q.b === b && q.walk && q.shell); };
// (nothing of the plan stands on the way in, from the edge of its shell to a point in: what is asked is the edge itself — a
// stall, a bench, a solid of the form just inside the edge are the plan's, and the body goes round them)
const freeIn = (b, sd, a, t1) => { const p = Sp.planNow(b); for (let t = 0; t >= t1; t -= 0.01) { const [x, z] = sd.P(a, t); const lx = x - b.x * TL, lz = z - b.y * TL; const c = Sp.cellIn(p, 0, lx, lz);
  if (Sp.inBody(p.shell, 0, lx, lz) && c !== In.CELL.FLOOR && c !== In.CELL.OUT) return false; } return true; };

// ------------------------------ 1. the edge ------------------------------
{ const by = {}; let pts = 0, okN = 0, high = 0; const ex = [];
  for (const b of open) { const T = by[b.type] || (by[b.type] = { lots: 0, pts: 0, ok: 0, high: 0 }); T.lots++;
    for (const sd of sidesOf(b)) for (let a = sd.a0 + 0.05; a < sd.a1 - 0.04; a += 0.05) {
      const [ox, oz] = sd.P(a, 0.6), [ix, iz] = sd.P(a, -0.6); if (!world(ox, oz) || feet(ox, oz) === null || !inPlan(b, ix, iz) || !freeIn(b, sd, a, -0.6)) continue; // (nobody crosses there, or a piece stands inside)
      T.pts++; pts++; const c = cross(ox, oz, ix, iz); if (c.ok) { T.ok++; okN++; if (c.rise > STEP) { T.high++; high++; } } else if (ex.length < 3) ex.push(`${b.type}#${b.id} ${sd.name} em ${(sd.P(a, 0)[0] / TL).toFixed(3)};${(sd.P(a, 0)[1] / TL).toFixed(3)}`);
    } }
  const info = Object.entries(by).map(([t, T]) => `${t}: ${T.lots} lotes, ${T.ok} de ${T.pts} pontos (${(100 * T.ok / Math.max(1, T.pts)).toFixed(1)}%), ${T.high} com degrau acima de um passo`).join('; ');
  ok('1. a borda da praça e da feira se cruza andando, de fora para dentro, em todo ponto onde a rua e o chão de dentro estão livres', open.length > 0 && pts > 0 && okN === pts, `${info}${ex.length ? ' — sem chão em ' + ex.join(' · ') : ''}`); }

// ------------------------------ the body ------------------------------
const who = [...S.villagers.values()].filter(v => v.age >= 18 && v.age < 55 && !v.sleeping && !v.inside && G.Possess.can(v).ok).sort((a, c) => a.id - c.id)[0];
if (!who || !G.Possess.take(who).ok) { ok('há quem viver', false, 'ninguém que se possa encarnar'); process.exit(1); }
G.Avatar.attach(who, 0); for (let k = 0; k < 4; k++) frame();
// (every frame: the feet only where the plan or the street lets one stand, at the height they give there)
let bad = [];
function check() {
  const v = G.Possess.body(), s = st(); if (!v || !s || s.loco === 'sleep' || s.loco === 'stair' || s.loco === 'seat' || s.loco === 'climb' || s.loco === 'air') return;
  const ins = Sp.indoor(s.X, s.Z, s.lv, s.inB ? s.inB.id : 0);
  if (ins) { if (!ins.walk) bad.push(`num lugar que a planta não deixa (${ins.code}) em ${ins.x.toFixed(2)},${ins.z.toFixed(2)} de ${ins.b.type}#${ins.b.id}`); else if (s.ground && Math.abs(s.Y - ins.y) > 0.03) bad.push(`pés a ${(s.Y - ins.y).toFixed(2)} m do chão da planta em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`);
    // (never in a flight's footprint on the storey it goes up from, but climbing it: the flight is taken whole, from its foot)
    const q = ins.p.stairs.find(f => f.kind !== 'degraus' && f.lv0 === ins.lv && ins.x > f.r[0] && ins.x < f.r[2] && ins.z > f.r[1] && ins.z < f.r[3]); if (q) bad.push(`dentro do lance ${q.id} de ${ins.b.type}#${ins.b.id}, no piso de baixo, em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`); }
  else if (!W.walkableXY(v.x, v.y) && !G.Possess.afloat(v)) bad.push(`fora, num lugar onde o mundo não anda (${v.x.toFixed(2)},${v.y.toFixed(2)})`);
}
function walkTo(X, Z, max, near) {
  let k = 0, still = 0, last = [st().X, st().Z];
  for (; k < (max || 300); k++) {
    const dx = X - st().X, dz = Z - st().Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); check();
    if (Math.hypot(st().X - last[0], st().Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st().X, st().Z];
  }
  stop(); for (let q = 0; q < 6; q++) { frame(); check(); }
  return Math.hypot(X - st().X, Z - st().Z);
}
const placeAt = (X, Z) => { const ok0 = G.Avatar.place(X / TL, Z / TL); for (let k = 0; k < 6; k++) frame(); return ok0; };

// ------------------------------ 2. the body walks in and out ------------------------------
{ const pick = t => open.filter(b => b.type === t).slice(0, 3); const lots = pick('praca').concat(pick('feira')); let tried = 0, inN = 0, outN = 0; const why = [], done = [];
  for (const b of lots) for (const sd of sidesOf(b)) {
    // (the crossing nearest the side's middle where the street outside is free and the floor inside free — nothing of the plan
    // standing on the way in from its shell's edge, the edge a step: what is asked of the edge itself is the proof's)
    const mid = (sd.a0 + sd.a1) / 2; let at = null; const y0 = Sp.plinth(b).y0 + Sp.FLOOR_UP;
    for (let d = 0; d < (sd.a1 - sd.a0) / 2 - 0.8 && !at; d += 0.25) for (const a of [mid - d, mid + d]) {
      const [ox, oz] = sd.P(a, 0.9), [ix, iz] = sd.P(a, -1.4); if (!world(ox, oz) || feet(ox, oz) === null || !inPlan(b, ix, iz) || Math.abs(y0 - Sp.footAt(ox / TL, oz / TL)) > STEP - 0.05) continue;
      let clear = true;
      for (const l of [-0.35, 0, 0.35]) { if (!freeIn(b, sd, a + l, -1.4)) clear = false; for (let t = 0.9; t > 0 && clear; t -= 0.01) { const [x, z] = sd.P(a + l, t); if (!world(x, z)) clear = false; } }
      if (clear) { at = { a, o: [ox, oz], i: [ix, iz] }; break; }
    }
    if (!at) continue; tried++;
    if (!placeAt(at.o[0], at.o[1])) { why.push(`${b.type}#${b.id} ${sd.name}: não deu para pôr o corpo na rua`); continue; }
    const din = walkTo(at.i[0], at.i[1], 240); const s = st(); const ins = Sp.indoor(s.X, s.Z, s.lv, s.inB ? s.inB.id : 0);
    const inside = din < 0.25 && !!ins && ins.b === b && ins.shell && ins.walk; if (inside) inN++; else why.push(`${b.type}#${b.id} ${sd.name}: parou a ${din.toFixed(2)} m do chão de dentro${s.block ? ' (' + s.block + ')' : ''}`);
    const dout = walkTo(at.o[0], at.o[1], 240); if (dout < 0.25) outN++; else why.push(`${b.type}#${b.id} ${sd.name}: não voltou à rua (${dout.toFixed(2)} m)`);
    done.push(`${b.type}#${b.id} ${sd.name}`);
  }
  ok('2. o corpo entra andando da rua no chão da praça e da feira, por cada lado, e volta para a rua', tried > 0 && inN === tried && outN === tried && lots.some(b => b.type === 'praca') && lots.some(b => b.type === 'feira'),
    `${tried} travessias (${lots.length} lotes): entrou em ${inN}, voltou em ${outN}${why.length ? ' — ' + why.slice(0, 3).join(' · ') : ''}`); }

// ------------------------------ 3. the rostra ------------------------------
{ const rost = open.filter(b => b.type === 'praca').map(b => ({ b, p: Sp.planNow(b) })).filter(o => o.p && o.p.stairs.some(s => s.kind !== 'degraus' && s.lv0 === 0 && s.lv1 === 1));
  if (!rost.length) ok('3. os rostros da praça romana: o corpo fica diante do pé, na borda do lote, e sobe ao topo', true, 'nenhuma praça com rostros neste mundo (nada a provar)');
  else { let up = 0, low = 0; const why = [], high = []; const tried = rost; // (every square of the world with rostra: the low edges are the few — one of four in the metrópole of the generation 11, T-350)
    for (const { b, p } of tried) {
      const s = p.stairs.find(q => q.kind !== 'degraus' && q.lv0 === 0 && q.lv1 === 1); const [dx, dz] = s.dir; const r = s.r;
      const mid = dx ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2, e0 = dx ? (dx > 0 ? r[0] : r[2]) : (dz > 0 ? r[1] : r[3]);
      const X0 = b.x * TL, Z0 = b.y * TL; const at = t => (dx ? [X0 + e0 - dx * t, Z0 + mid] : [X0 + mid, Z0 + e0 - dz * t]); // (t metres before the foot, on the flight's middle)
      // (from the street before the foot — beyond the lot's edge —, to the place before the foot, then up along the climb)
      const lotEdge = dx ? (dx > 0 ? 0 : b.w * TL) : (dz > 0 ? 0 : b.h * TL); const before = Math.abs((dx ? e0 : e0) - lotEdge);
      const o = at(before + 0.9); if (!world(o[0], o[1])) { why.push(`praca#${b.id}: a rua diante do pé não se anda`); continue; }
      // (how high the square's floor stands over the ground the feet cross at the edge before the foot: a step, walked; higher,
      // the hands take it. The lowest ground from a hand outside the lot to where the square's floor begins, every centimetre
      // by the feet's rule — the strip of the lot's own ground round the shell too, not only the street: before the rostra of
      // the praca#13670 of the metrópole of the generation 11 the street is a bridge, 0,17 m over the lot's own ground at its
      // edge, and from that ground to the square's floor it is 0,72 m, a ledge, T-350)
      let lowY = Infinity; for (let t = before + 0.05; t > 0; t -= 0.01) { const q = at(t); const ins = Sp.indoor(q[0], q[1], 0, 0); if (ins && ins.b === b) break; const y = feet(q[0], q[1]); lowY = Math.min(lowY, y === null ? -Infinity : y); }
      const rise = Sp.plinth(b).y0 + Sp.FLOOR_UP - lowY; const isLow = rise <= STEP - 0.05;
      placeAt(o[0], o[1]); const d = walkTo(...at(0.4), 240, 0.08);
      const top = [X0 + s.b[0], Z0 + s.b[1]]; let k = 0; for (; k < 300 && (st().lv !== 1 || st().loco === 'stair'); k++) { IN.camYaw = Math.atan2(top[1] - st().Z, top[0] - st().X); IN.mz = 1; frame(); check(); }
      stop(); for (let q = 0; q < 10; q++) { frame(); check(); }
      if (!isLow) { high.push(`praca#${b.id} (${Number.isFinite(rise) ? rise.toFixed(2) + " m" : "sem chão na borda"}${st().lv === 1 ? ', subiu' : ''})`); continue; }
      low++; if (st().lv === 1) up++; else why.push(`praca#${b.id}: diante do pé a ${d.toFixed(2)} m do lugar, parado em ${(st().X - X0).toFixed(2)};${(st().Z - Z0).toFixed(2)} do lote (o lance ${r.join(',')}, para ${dx},${dz}), no piso ${st().lv}, em ${st().inB ? st().inB.type + '#' + st().inB.id : 'nenhum prédio'}${st().block ? ' (' + st().block + ')' : ''}`);
    }
    ok('3. os rostros da praça romana: o corpo fica diante do pé, na borda do lote, e sobe ao topo', low > 0 && up === low, `${up} de ${low} praças com a borda de um passo diante do pé${why.length ? ' — ' + why.join(' · ') : ''}; com a borda mais alta que um passo (sobe-se com as mãos, e nunca para dentro do lance): ${high.join(', ') || 'nenhuma'}`); } }

// ------------------------------ 3b. the jump that falls short of the plinth's top ------------------------------
// (where the edge of a square or a market stands higher than a step over the street — a plinth on a slope —: the body walks at
// it and jumps a little before it, at each of six distances; the jumps that fall short land at its foot. In every frame but the
// climb's, no point of the body's rim over a floor higher than its feet by more than a step — the rim carried over the edge in
// the air was left inside the stone when the feet fell below its top, and climbed from there the feet went through the edge,
// the e6 «plano» of the generation 17, L-653 —; in every frame, the climb's too, the feet never under the floor at the centre;
// and every jump ends on top, by the feet or by the hands)
{ const TU = G.Avatar.TUNE, R = TU.radius, RIM = [[1, 0], [0.707, 0.707], [0, 1], [-0.707, 0.707], [-1, 0], [-0.707, -0.707], [0, -1], [0.707, -0.707]];
  const high = [];
  for (const b of open) for (const sd of sidesOf(b)) for (let a = sd.a0 + 1; a < sd.a1 - 1 && high.length < 8; a += 0.5) {
    // (the street free from the edge to 2.4 m out and the floor inside to 1.2 m in, on three lanes the body's width apart)
    let clear = true; for (const l of [-0.35, 0, 0.35]) { if (!freeIn(b, sd, a + l, -1.2) || !inPlan(b, ...sd.P(a + l, -1.2))) clear = false; for (let t = 2.4; t > 0.05 && clear; t -= 0.05) { const [x, z] = sd.P(a + l, t); if (!world(x, z) || feet(x, z) === null) clear = false; } }
    if (!clear) continue; const yo = feet(...sd.P(a, 0.4)), yi = feet(...sd.P(a, -0.6)); if (yo === null || yi === null) continue;
    if (yi - yo < TU.stepUp + 0.1 || yi - yo > TU.climbMax - 0.2) continue;
    high.push({ b, sd, a, rise: yi - yo }); a += 2;
  }
  if (!high.length) ok('3b. o pulo que não alcança o topo do plinto: o corpo escorrega para fora da face, nunca fica com a borda dentro do degrau, e sobe com as mãos sem os pés passarem pela quina', true, 'nenhuma borda de praça ou feira mais alta que um passo neste mundo (nada a provar)');
  else { let runs = 0, wedged = 0, under = 0, top = 0, climbed = 0; const exW = [], exU = [], exT = [];
    for (const c of high) for (const j of [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) {
      const { b, sd, a } = c; const o = sd.P(a, 2.3), i = sd.P(a, -1.0); placeAt(o[0], o[1]); stop(); runs++;
      const yaw = Math.atan2(i[1] - o[1], i[0] - o[0]), edge = sd.P(a, 0); let jumped = false, w = 0, u = 0, cl = false;
      for (let k = 0; k < 150; k++) {
        const s0 = st(); if (!jumped && Math.hypot(edge[0] - s0.X, edge[1] - s0.Z) <= j) { IN.jump = true; jumped = true; }
        IN.camYaw = yaw; IN.mz = 1; IN.mx = 0; frame(); check();
        const s = st(), fl = G.Avatar.floorAt(s.X, s.Z); if (s.loco === 'climb') cl = true;
        if (s.Y < fl - 0.05) { if (!u++ && exU.length < 2) exU.push(`${b.type}#${b.id} ${sd.name}, pulo a ${j} m: os pés ${(fl - s.Y).toFixed(2)} m sob o chão (${s.loco})`); }
        if (s.loco !== 'climb') { const inn = RIM.filter(([dx, dz]) => G.Avatar.floorAt(s.X + dx * R * 0.9, s.Z + dz * R * 0.9) > s.Y + TU.stepUp + 0.01);
          if (inn.length) { if (!w++ && exW.length < 2) exW.push(`${b.type}#${b.id} ${sd.name}, pulo a ${j} m: ${inn.length} ponto(s) da borda do corpo dentro do degrau (${s.loco}, a ${(Math.hypot(edge[0] - s.X, edge[1] - s.Z)).toFixed(2)} m da borda do lote)`); } }
      }
      stop(); for (let q = 0; q < 6; q++) { frame(); check(); }
      const s = st(), ins = Sp.indoor(s.X, s.Z, 0, 0); if (ins && ins.b === b && ins.walk) top++; else if (exT.length < 2) exT.push(`${b.type}#${b.id} ${sd.name}, pulo a ${j} m: não subiu (${s.loco}${s.block ? ', ' + s.block : ''})`);
      if (w) wedged++; if (u) under++; if (cl) climbed++;
    }
    ok('3b. o pulo que não alcança o topo do plinto: o corpo escorrega para fora da face, nunca fica com a borda dentro do degrau, e sobe com as mãos sem os pés passarem pela quina', !wedged && !under && top === runs,
      `${runs} pulos em ${high.length} bordas mais altas que um passo (${[...new Set(high.map(c => c.b.type + '#' + c.b.id))].join(', ')}; degraus de ${Math.min(...high.map(c => c.rise)).toFixed(2)} a ${Math.max(...high.map(c => c.rise)).toFixed(2)} m): com a borda do corpo dentro do degrau ${wedged}, com os pés sob o chão ${under}; em cima ${top} (${climbed} com as mãos)${exW.length + exU.length + exT.length ? ' — ' + exW.concat(exU, exT).join(' · ') : ''}`); } }

// ------------------------------ 4. the verifier ------------------------------
ok('os pés do corpo sempre no chão que a planta ou a rua dão', !bad.length, bad.length ? `${bad.length}: ${bad.slice(0, 3).join(' · ')}` : 'em todos os quadros');
{ const vb = vbad(), er = M.erros(); ok('4. o verificador limpo, sem erro de módulo', !vb.length && !Object.keys(er.mod).length, `${vb.length ? vb.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; módulos ${JSON.stringify(er.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
