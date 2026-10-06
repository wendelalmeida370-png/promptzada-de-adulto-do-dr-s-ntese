'use strict';
// ============================================================
//  Justice: the ruler's sentence, carried out in front of everyone.
//  An execution is set for a day and an hour and cried in the
//  streets; the scaffold goes up in the square; the condemned are
//  brought bound; the sentence is read over the drums; and then it is
//  done, the way each people does it — the gallows and the trapdoor,
//  the axe on the block, the sword, the stake and the fire, the cross,
//  the stones of the crowd, the obsidian knife on top of the temple.
//  The town stops to watch: some cheer, some shout "murderers", the
//  family weeps, the children hide their faces. The hanged stay on the
//  gallows and the crucified on the cross for the crows, as a warning,
//  until someone is allowed to take them down. A crowd that hates the
//  sentence enough may rush the scaffold.
// ============================================================
(function (G) {
  const J = G.Justice = {};
  const W = G.W;
  const P = G.Politics;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const execs = () => G.S.execs || (G.S.execs = []);
  const scaffolds = () => G.S.scaffolds || (G.S.scaffolds = []);

  // ------------------------------ the way each people kills ------------------------------
  const METHOD = {
    forca: { kind: 'gallows', verb: ['enforcado', 'enforcada'], pl: 'enforcados', plf: 'enforcadas', z: 5, show: 1 },
    machado: { kind: 'block', verb: ['decapitado a machado', 'decapitada a machado'], pl: 'decapitados', plf: 'decapitadas', z: 5 },
    espada: { kind: 'block', verb: ['decapitado à espada', 'decapitada à espada'], pl: 'decapitados', plf: 'decapitadas', z: 5 },
    fogueira: { kind: 'pyre', verb: ['queimado vivo', 'queimada viva'], pl: 'queimados vivos', plf: 'queimadas vivas', z: 4, show: 1 },
    cruz: { kind: 'cross', verb: ['crucificado', 'crucificada'], pl: 'crucificados', plf: 'crucificadas', z: 7, show: 2 },
    pedras: { kind: 'post', verb: ['apedrejado', 'apedrejada'], pl: 'apedrejados', plf: 'apedrejadas', z: 0 },
    sacrificio: { kind: 'altar', verb: ['sacrificado aos deuses', 'sacrificada aos deuses'], pl: 'sacrificados aos deuses', plf: 'sacrificadas aos deuses', z: 22 },
  };
  J.METHOD = METHOD;
  function methodFor(f, vs, reason) {
    const civ = f.civ; const heresy = /culto|seita|sociedade|ritual|heresia|bruxa|deuses errad|feitiç/.test(reason || '');
    const rebels = /levant|revolt|rebel|revolu/.test(reason || '');
    if (civ === 'asteca') return 'sacrificio';
    if (heresy) return civ === 'romano' ? 'cruz' : 'fogueira';
    if (civ === 'romano') return vs.some(v => v.captive) || rebels ? 'cruz' : 'espada';
    if (civ === 'grego') return /trai/.test(reason || '') || rebels ? 'pedras' : 'espada';
    if (civ === 'nordico') return G.hash((f.id || 1) * 13 + vs.length) < 0.5 ? 'forca' : 'machado';
    if (civ === 'egipcio') return 'espada';
    return rebels ? 'forca' : G.hash(f.id * 7 + G.S.day) < 0.65 ? 'forca' : 'machado';
  }
  J.methodFor = methodFor;

  // ------------------------------ where: the square, or the temple top ------------------------------
  function siteFor(f, set, method) {
    const S = G.S;
    if (method === 'sacrificio') {
      let tb = null; for (const b of S.buildings.values()) if ((b.type === 'maravilha' || b.type === 'temple') && b.built && G.Village.facOfSet(b.set) === f.id && (!tb || b.type === 'maravilha' || b.set === set.id)) tb = b;
      if (tb) {
        const c = G.Village.center(tb); const fr = G.Village.frontTile(tb);
        // the stepped pyramid: on the platform, before the shrine, the stairs below
        if (f.civ === 'asteca') { const big = tb.type === 'maravilha'; return { x: c[0], y: c[1] + (big ? 0.52 : 0.36), fx: fr[0], fy: fr[1] + 0.6, temple: tb.id, top: big ? 37.5 : 26, dz: (tb.w + tb.h) / 2 + 0.6, pyr: 1 }; }
        // any other temple: a sacrificial stone before its door
        return { x: fr[0], y: fr[1] + 0.7, fx: fr[0], fy: fr[1] + 1.8, temple: tb.id, top: 3 };
      }
    }
    const sq = squareSpot(f, set);
    // no temple yet: a sacrificial stone set up on the square
    if (method === 'sacrificio') return { x: sq.x, y: sq.y, fx: sq.x, fy: sq.y + 1.1, temple: 0, top: 3 };
    return sq;
  }
  function squareSpot(f, set) {
    const S = G.S;
    let cx = set.cx, cy = set.cy;
    for (const b of S.buildings.values()) if (b.set === set.id && b.built && b.type === 'praca') { const c = G.Village.center(b); cx = c[0]; cy = c[1]; break; }
    // an open spot on the square, or near it: not on a house, not in the water
    for (let r = 0; r <= 6; r++) for (let k = 0; k < Math.max(1, r * 8); k++) {
      const a = k / Math.max(1, r * 8) * TAU + 0.4; const x = Math.floor(cx + Math.cos(a) * r) + 0.5, y = Math.floor(cy + Math.sin(a) * r) + 0.5;
      if (!W.inb(x, y)) continue;
      let ok = true;
      for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) { const i = W.idx(x + dx, y + dy); if (!W.walkableXY(x + dx, y + dy) || S.occ[i] || W.isWater(i)) { ok = false; break; } }
      if (ok && !scaffolds().some(s => G.dist(s.x, s.y, x, y) < 3)) return { x, y };
    }
    return { x: cx, y: cy + 2 };
  }

  // ------------------------------ the sentence ------------------------------
  // victims: villagers; reason: 'por traição'...; returns true if an execution was set
  J.sentence = function (f, victims, reason, o) {
    const S = G.S; o = o || {};
    if (!f || f.exec && f.exec.j) return false;
    const vs = victims.filter(v => v && S.villagers.has(v.id) && !(v.task && v.task.j)).slice(0, 4);
    if (!vs.length) return false;
    const set = (o.set && S.settlements.get(o.set)) || G.Fac.capitalOf(f.id); if (!set) return false;
    const method = o.method || methodFor(f, vs, reason);
    const st = siteFor(f, set, method);
    // the hour: the next midday, at least a little while away
    const now = S.time; let wait = (0.42 - now + 1) % 1; if (wait < 0.18) wait += 1; if (o.soon) wait = 0.12;
    const e = { id: S.nextId++, fac: f.id, set: set.id, ids: vs.map(v => v.id), names: vs.map(v => v.name), gs: vs.map(v => v.g), reason: reason || '', method, x: st.x, y: st.y, fx: st.fx, fy: st.fy, temple: st.temple || 0, top: st.top || 0, dz: st.dz || 0, pyr: st.pyr || 0, start: S.clock + wait * DAY(), phase: 'wait', t: 0, k: 0, sub: 0, n0: vs.length, seen: 0, cheer: 0, boo: 0, weep: 0, sac: !!o.sacrifice };
    execs().push(e);
    f.exec = { j: e.id };
    // the condemned are held, bound, until the hour
    const hold = holdSpot(f, set, e);
    vs.forEach((v, i) => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'condemned', j: e.id, i, pri: 6, x: hold[0] + (i - (vs.length - 1) / 2) * 0.6, y: hold[1], st: 0, kind: 'condemned' }); });
    const r = P.ruler(f); const M = METHOD[method];
    const who = vs.length === 1 ? vs[0].name : vs.slice(0, -1).map(v => v.name).join(', ') + ' e ' + vs[vs.length - 1].name;
    const allF = vs.every(v => v.g === 'f');
    const verb = vs.length === 1 ? M.verb[vs[0].g === 'f' ? 1 : 0] : allF ? M.plf : M.pl;
    const when = wait > 0.55 ? 'amanhã, ao meio-dia' : 'ao meio-dia';
    if (!o.quiet) {
      log(e.sac ? `${who} ${vs.length > 1 ? 'serão oferecidos' : 'será oferecid' + oa(vs[0])} aos deuses ${e.pyr ? 'no alto do templo' : e.temple ? 'diante do templo' : 'na pedra dos sacrifícios'} de ${set.name}, ${when}.` : `Por ordem de ${r ? P.styled(f, r) : 'quem governa'}, ${who} ${vs.length > 1 ? 'serão' : 'será'} ${verb} na praça de ${set.name}, ${when}, ${reason || 'por seus crimes'}.`, e.sac ? 'sacrifice' : 'massacre', e.x, e.y);
      G.UI && G.UI.notice(e.sac ? `Sacrifício marcado em ${set.name}` : `Execução marcada em ${set.name}: ${who}`, 'massacre');
    }
    G.Stories && G.Stories.signal('sentence', { fac: f.id, ids: e.ids.slice(), reason: e.reason, method, x: e.x, y: e.y, start: e.start, ex: e.id, set: set.id });
    return true;
  };
  function holdSpot(f, set, e) {
    const S = G.S;
    for (const b of S.buildings.values()) if (b.set === set.id && b.built && (b.type === 'quartel' || b.type === 'cercado')) { const fr = G.Village.frontTile(b); return [fr[0], fr[1] + 0.8]; }
    return [e.x + 2.6, e.y + 1.6];
  }
  // the old single execution goes through the scaffold too
  P.execute = function (f, victim, reason) { return J.sentence(f, [victim], reason); };
  J.sacrifice = function (f, victim) { return J.sentence(f, [victim], 'pelos deuses', { method: 'sacrificio', sacrifice: true }); };

  // ------------------------------ the people in it ------------------------------
  const busy = v => !v || v.captive && !(v.task && v.task.j) || v.held || v.aboard || v.inside;
  function pickExecutioner(f, set, e) {
    const S = G.S; let best = null, bs = -1e9;
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || v.captive || v.age < 20 || v.age > 60 || e.ids.includes(v.id) || v.id === f.leader || (v.task && v.task.pri >= 3)) continue;
      const priest = e.method === 'sacrificio';
      const s = (priest ? (v.role === 'sacerdote' ? 10 : 0) : (v.role === 'guerreiro' ? 6 : 0)) + (P.persona(v).cru * 6) + v.courage * 2 - G.dist(v.x, v.y, e.x, e.y) * 0.05;
      if (s > bs) { bs = s; best = v; }
    }
    return best;
  }
  function pickHerald(f, set, e) {
    const r = P.ruler(f); if (r && r.set === set.id && !busy(r) && !r.sleeping && G.dist(r.x, r.y, e.x, e.y) < 30 && !(r.task && r.task.pri >= 3)) return r;
    let best = null, bs = -1e9;
    for (const v of G.S.villagers.values()) { if (v.set !== set.id || v.captive || v.age < 18 || e.ids.includes(v.id) || v.id === e.exe || (v.task && v.task.pri >= 3)) continue; const s = (v.role === 'escriba' ? 6 : v.role === 'sacerdote' ? 3 : 0) + (v.age > 40 ? 1 : 0) - G.dist(v.x, v.y, e.x, e.y) * 0.05; if (s > bs) { bs = s; best = v; } }
    return best;
  }
  // the town comes to see: called by the herald, and more trickle in until the first death
  // (workers leave their benches for it; only the sleeping, the sick abed and the children in arms stay away)
  function gather(f, set, e) {
    const S = G.S; let n = 0, have = 0;
    for (const o of S.villagers.values()) if (o.task && o.task.j === e.id && o.task.role === 'watch') have++;
    const cap = 60;
    for (const o of S.villagers.values()) {
      if (have + n >= cap) break;
      if (o.set !== set.id || o.age < 6 || o.captive || o.sleeping || o.air || o.held || o.aboard || o.ug || e.ids.includes(o.id) || o.id === e.exe || o.id === e.her || G.dist(o.x, o.y, e.x, e.y) > 40) continue;
      if (o.task && (o.task.j === e.id || o.task.pri >= 1.95)) continue;
      const at = standSpot(e, o.id, have + n); if (!at) continue;
      G.Vg.setTask(o, { type: 'justice', role: 'watch', j: e.id, x: at[0], y: at[1], pri: 1.95, st: 0, kind: 'justice' }); n++;
    }
    e.called = (e.called || 0) + n;
    if (e.guards) return;
    // guards at the corners
    let gN = 0;
    for (const o of S.villagers.values()) { if (gN >= 2) break; if (o.set !== set.id || o.role !== 'guerreiro' || o.captive || o.sleeping || o.id === e.exe || (o.task && o.task.pri >= 3)) continue; G.Vg.setTask(o, { type: 'justice', role: 'guard', j: e.id, x: e.x + (gN ? 1.6 : -1.6), y: e.y + 0.9, pri: 2.4, st: 0, kind: 'justice' }); gN++; }
    e.guards = 1;
  }
  // where a spectator stands: in a ring round the scaffold (at the foot of the stairs, for the
  // temple), on dry walkable ground, never on a house or in the water
  function standSpot(e, id, k) {
    const S = G.S; const pyr = e.pyr; const cx = pyr ? e.fx : e.x, cy = pyr ? e.fy + 1 : e.y;
    for (let q = 0; q < 8; q++) {
      const h = G.hash(id * 17 + e.id + q * 31);
      const a = pyr ? (0.15 + h * 0.7) * Math.PI : h * TAU; const rr = (pyr ? 1.4 : 3.2) + G.hash(id * 29 + q) * (2.2 + Math.min(3, k / 12)) + q * 0.3;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * (pyr ? 1 : 0.8) + (pyr ? 0 : 0.6);
      if (!W.inb(x, y) || !W.walkableXY(x, y)) continue;
      const i = W.idx(x, y); if (S.occ[i] || W.isWater(i)) continue;
      return [x, y];
    }
    return null;
  }
  // where each condemned stands for their death
  function spot(e, i) {
    const n = e.n0; const off = (i - (n - 1) / 2);
    switch (METHOD[e.method].kind) {
      case 'gallows': return [e.x + off * 0.62, e.y - 0.05];
      case 'block': return [e.x + 0.22, e.y + 0.12];
      case 'pyre': return [e.x + off * 0.85, e.y];
      case 'cross': return [e.x + off * 0.95, e.y];
      case 'post': return [e.x, e.y];
      case 'altar': return [e.x, e.y];
    }
    return [e.x, e.y];
  }

  // ------------------------------ what a spectator feels ------------------------------
  function stance(o, e, f) {
    if (o.age < 12) return 'fear';
    for (const id of e.ids) { const v = G.person(id); if (v && G.Stories && G.Stories.relOf(o, v)) return 'weep'; if (v && (o.partner === id)) return 'weep'; }
    const g = f && f.grp && f.grp[o.grp]; const sat = g ? g.sat : 50;
    const vg = (G.person(e.ids[0]) || {}).grp;
    const pe = P.persona(o); const set = G.S.settlements.get(o.set); const loy = set ? set.loyalty : 50;
    let s = (loy - 50) / 25 + (sat - 50) / 25 + pe.cru * 1.6 - pe.pie * 0.3 + (G.hash(o.id * 3 + e.id) - 0.5) * 1.2;
    if (vg && vg === o.grp && sat < 50) s -= 1.6;
    if (e.sac) s += pe.pie * 1.6;
    if (/insolência|pedir|petição|sonhar|murmurar|rezar/.test(e.reason)) s -= 0.8;
    if (/traição|levant|rebel/.test(e.reason) && loy > 55) s += 0.6;
    return s > 0.9 ? 'cheer' : s < -0.8 ? 'boo' : 'watch';
  }
  const SHOUT = {
    cheer: ['Morte ao traidor!', 'Justiça!', 'Que sirva de exemplo!', 'Já vai tarde!', 'Viva!'],
    boo: ['Assassinos!', 'É inocente!', 'Covardes!', 'Soltem!', 'Vergonha!'],
    weep: ['Não!', 'Meu filho!', 'Por favor!', 'Não façam isso!'],
    sac: ['Para o Sol!', 'Que os deuses bebam!', 'Huitzilopochtli!'],
  };

  // ------------------------------ speech, above heads ------------------------------
  const bubbles = [];
  J.say = function (v, txt, secs) { if (!v || !txt) return; for (let k = bubbles.length - 1; k >= 0; k--) if (bubbles[k].id === v.id) bubbles.splice(k, 1); bubbles.push({ id: v.id, txt, until: G.S.clock + (secs || 3.2) }); if (bubbles.length > 14) bubbles.shift(); };

  // ------------------------------ the ceremony ------------------------------
  function cancel(e, why) {
    const S = G.S; const f = G.Fac.get(e.fac);
    for (const v of S.villagers.values()) if (v.task && v.task.j === e.id) { v.hood = false; v.dz = 0; G.Vg.endTask(v); }
    if (f && f.exec && f.exec.j === e.id) f.exec = null;
    const k = execs().indexOf(e); if (k >= 0) execs().splice(k, 1);
    if (why) log(why, 'crown', e.x, e.y);
  }
  J.cancel = cancel;
  function aliveIds(e) { return e.ids.filter(id => { const v = G.S.villagers.get(id); return v && v.task && v.task.type === 'condemned' && v.task.j === e.id; }); }
  function tick(e, dt) {
    const S = G.S; const f = G.Fac.get(e.fac); const set = S.settlements.get(e.set);
    if (!f || !set || !f.alive) return cancel(e);
    // some of the condemned are gone (freed, escaped): the rest still go
    const ids = aliveIds(e);
    if (e.phase !== 'after' && e.phase !== 'done') {
      if (!ids.length && !(e.done || []).length) { const freed = e.ids.filter(id => S.villagers.has(id)).map(id => S.villagers.get(id).name); return cancel(e, freed.length ? `${e.sac ? 'O sacrifício' : 'A execução'} em ${set.name} não aconteceu: ${freed.join(', ')} ${freed.length > 1 ? 'escaparam' : 'escapou'} ${e.sac ? 'do altar' : 'do cadafalso'}.` : ''); }
    }
    if (e.phase === 'wait') {
      if (S.clock >= e.start - 22) {
        e.phase = 'gather'; e.t = 0;
        const sc = { id: S.nextId++, ex: e.id, kind: METHOD[e.method].kind, x: e.x, y: e.y, set: e.set, built: e.method === 'sacrificio' || e.method === 'pedras' ? 1 : 0, since: S.day, n: e.n0, fac: e.fac };
        if (e.method !== 'sacrificio' || !e.pyr) scaffolds().push(sc); e.sc = sc.id;
        const exe = pickExecutioner(f, set, e); if (exe) { e.exe = exe.id; G.Vg.endTask(exe); G.Vg.setTask(exe, { type: 'justice', role: 'exe', j: e.id, x: e.x - 0.6, y: e.y + 0.4, pri: 5, st: 0, kind: 'justice', perch: false }); }
        const her = pickHerald(f, set, e); if (her) { e.her = her.id; G.Vg.setTask(her, { type: 'justice', role: 'her', j: e.id, x: e.x - 1.2, y: e.y + 1.6, pri: 4.5, st: 0, kind: 'justice' }); }
        gather(f, set, e);
        G.Audio && G.Audio.at(e.x, e.y, 'horn', true);
      }
      return;
    }
    e.t += dt;
    if ((e.phase === 'gather' || e.phase === 'march' || e.phase === 'read') && S.clock - (e.gT || 0) > 3) { e.gT = S.clock; gather(f, set, e); }
    if (e.phase === 'gather') {
      // a builder hammers the last boards in; the condemned are walked to the square
      const sc = scaffolds().find(s => s.id === e.sc); if (sc && sc.built < 1) sc.built = Math.min(1, sc.built + dt / 14);
      if (e.t > 16) {
        e.phase = 'march'; e.t = 0;
        ids.forEach((id, i) => { const v = S.villagers.get(id); const [x, y] = e.method === 'sacrificio' ? [e.fx + (i - (ids.length - 1) / 2) * 0.6, e.fy] : [e.x + (i - (ids.length - 1) / 2) * 0.7, e.y + 1.4]; v.task.x = x; v.task.y = y; v.task.st = 0; v.task.march = 1; });
        const her = S.villagers.get(e.her); if (her) J.say(her, e.sac ? 'Os deuses têm sede!' : 'Ouçam! Ouçam! Hoje se faz justiça!', 4);
      }
      return;
    }
    if (e.phase === 'march') {
      const there = ids.every(id => { const v = S.villagers.get(id); return v && v.task.st === 2; });
      if (there || e.t > 26) {
        e.phase = 'read'; e.t = 0;
        const her = S.villagers.get(e.her); const r = P.ruler(f);
        const txt = e.sac ? 'Seu sangue alimenta o Sol!' : `${e.names.length > 1 ? 'Estes' : e.gs[0] === 'f' ? 'Esta' : 'Este'} ${e.reason ? 'pagam ' + e.reason.replace(/^por /, 'por ') : 'pagam com a vida'}!`.replace('Esta pagam', 'Esta paga').replace('Este pagam', 'Este paga');
        if (her) J.say(her, txt, 5);
        if (r && her !== r && r.set === e.set && G.dist(r.x, r.y, e.x, e.y) < 14) J.say(r, 'Que sirva de exemplo.', 4);
        G.Audio && G.Audio.at(e.x, e.y, 'drum', true);
      }
      return;
    }
    if (e.phase === 'read') {
      if (e.t > 6) { e.phase = 'kill'; e.t = 0; e.k = 0; e.sub = 0; e.done = e.done || []; }
      return;
    }
    if (e.phase === 'kill') return killStep(e, f, set, dt);
    if (e.phase === 'after') {
      if (e.t > 16) { e.phase = 'done'; for (const v of S.villagers.values()) if (v.task && v.task.j === e.id) { v.hood = false; v.dz = 0; G.Vg.endTask(v); } if (f.exec && f.exec.j === e.id) f.exec = null; }
      return;
    }
    if (e.phase === 'done') { const k = execs().indexOf(e); if (k >= 0) execs().splice(k, 1); }
  }
  // one by one: each method its own steps
  function killStep(e, f, set, dt) {
    const S = G.S;
    const id = e.ids.find(q => { if ((e.done || []).includes(q)) return false; const w = S.villagers.get(q); return w && w.task && w.task.type === 'condemned' && w.task.j === e.id; });
    if (!id) { finish(e, f, set); return; }
    const v = S.villagers.get(id); const exe = S.villagers.get(e.exe);
    const i = e.ids.indexOf(id); const [sx, sy] = spot(e, i); const M = METHOD[e.method];
    const t = v.task; t.perch = true; t.march = 0;
    if (e.sub === 0) {
      // up on the scaffold, into place
      v.x = sx; v.y = sy + (M.kind === 'block' ? 0.18 : 0); v.path = null; v.moving = false;
      v.z = e.method === 'sacrificio' ? e.top : M.kind === 'pedras' ? 0 : M.z; v.dz = e.dz || 0;
      t.pose = M.kind === 'block' ? 'kneel' : M.kind === 'cross' ? 'cross' : M.kind === 'altar' ? 'hold' : 'bound';
      if (exe) { exe.task.perch = true; exe.dz = e.dz || 0; exe.x = M.kind === 'altar' ? e.x + (e.pyr ? 0.28 : 0.5) : M.kind === 'pyre' ? sx - 0.5 : sx - 0.55; exe.y = sy + (M.kind === 'pyre' ? 0.8 : 0.05); exe.z = M.kind === 'altar' ? e.top : M.kind === 'pyre' || M.kind === 'post' ? 0 : M.z; exe.path = null; exe.hood = M.kind !== 'altar' && M.kind !== 'post'; G.faceTo(exe, v.x - exe.x, v.y - exe.y); exe.task.act = ''; }
      e.sub = 1; e.st = S.clock;
      G.Audio && G.Audio.at(e.x, e.y, 'drum', true);
      return;
    }
    const el = S.clock - e.st;
    react(e, f, el);
    switch (e.method) {
      case 'forca': {
        if (el > 2.4 && e.sub === 1) { e.sub = 2; if (exe) { exe.task.act = 'pull'; exe.actT = 0; } }
        if (el > 3.1 && e.sub === 2) { e.sub = 3; t.pose = 'hangd'; t.drop = S.clock; G.Audio && G.Audio.at(v.x, v.y, 'hit', true); }
        if (e.sub === 3) { const d = S.clock - t.drop; v.z = M.z - Math.min(1, d / 0.2) * 4 + Math.sin(d * 9) * Math.max(0, 0.6 - d * 0.25); t.kick = d < 2.2 ? 1 : 0; }
        if (el > 6.2 && e.sub === 3) die(e, v, 'hang');
        break;
      }
      case 'machado': case 'espada': {
        if (el > 2 && e.sub === 1) { e.sub = 2; if (exe) { exe.task.act = e.method === 'machado' ? 'axe' : 'sword2'; exe.actT = 0; } }
        if (el > 3.6 && e.sub === 2) { const ux = v.face > 0 ? 1 : -1; v._decap = { ux: ux * 0.7, uy: -0.4 }; G.Audio && G.Audio.at(v.x, v.y, 'gore', true); die(e, v, null); }
        break;
      }
      case 'fogueira': {
        if (el > 2.2 && e.sub === 1) { e.sub = 2; if (exe) { exe.task.act = 'torchfwd'; exe.actT = 0; } }
        if (el > 3.4 && e.sub === 2) { e.sub = 3; e.fire = S.clock; const sc = scaffolds().find(s => s.id === e.sc); if (sc) { sc.burn = sc.burn || {}; sc.burn[i] = S.clock; } G.Audio && G.Audio.at(v.x, v.y, 'fire', true); }
        if (e.sub === 3) { t.pose = 'writhe'; if (G.R() < dt * 2) G.Audio && G.Audio.at(v.x, v.y, 'scream', true); flames(sx, sy, M.z, 1); }
        if (el > 10.5 && e.sub === 3) die(e, v, 'burnt');
        break;
      }
      case 'cruz': {
        if (el > 1 && e.sub === 1) { e.sub = 2; G.Audio && G.Audio.at(v.x, v.y, 'hit', true); }
        if (e.sub === 2 && G.R() < dt * 0.6) G.Vg.emote(v, 'sad', 1.6);
        if (el > 13 && e.sub === 2) die(e, v, 'cross');
        break;
      }
      case 'pedras': {
        if (e.sub === 1) { t.pose = 'bound'; stones(e, v, dt); if (el > 9) die(e, v, null); }
        break;
      }
      case 'sacrificio': {
        if (el > 1.6 && e.sub === 1) { e.sub = 2; if (exe) { exe.task.act = 'stab'; exe.actT = 0; } }
        if (el > 3.4 && e.sub === 2) { e.sub = 3; G.Audio && G.Audio.at(v.x, v.y, 'gore', true); if (G.FX) for (let k = 0; k < 14; k++) G.FX.spawn({ x: v.x, y: v.y, z: e.top + 6, vz: G.rr(20, 50), vx: G.rr(-0.5, 0.5), vy: G.rr(-0.5, 0.5), g: 120, life: G.rr(0.5, 1.1), s0: 1.3, s1: 0.3, c: k % 2 ? '#b8121e' : '#7a0a12', k: 0 }); if (exe) { exe.task.act = 'heart'; exe.actT = 0; } }
        if (el > 6.5 && e.sub === 3) { e.sub = 4; t.pose = 'limp'; t.roll = S.clock; t.rx0 = v.x; t.ry0 = v.y; }
        if (e.sub === 4) { const k = Math.min(1, (S.clock - t.roll) / 2.4); v.x = t.rx0 + (e.fx - t.rx0) * k; v.y = t.ry0 + (e.fy + 0.6 - t.ry0) * k; v.z = e.top * (1 - k); v.dz = (e.dz || 0) * (1 - k); if (k >= 1) die(e, v, null); }
        break;
      }
    }
  }
  function die(e, v, pose) {
    const S = G.S; const f = G.Fac.get(e.fac); const r = f && P.ruler(f);
    const x = v.x, y = v.y, z = v.z || 0;
    e.done = e.done || []; e.done.push(v.id); e.sub = 0;
    if (r) v.lastBy = r.id;
    v.z = 0; v.dz = 0;
    G.Village.kill(v, e.sac ? 'sacrifice' : 'execution', false);
    const c = G.Carnage && G.Carnage.byVid(v.id);
    if (c && pose) { c.pose = pose; c.px = x; c.py = y; c.pz = z; c.sc = e.sc; c.x = x; c.y = y; if (pose === 'burnt') { c.look._cloth = '#1e1a18'; c.look.skin = '#3a2a24'; c.look.skin0 = '#3a2a24'; } }
    for (const o of S.villagers.values()) if (o.task && o.task.j === e.id && o.task.role === 'watch') { const sst = o.task.stance; if (sst === 'weep') G.Vg.emote(o, 'sad', 3); else if (sst === 'cheer') G.Vg.emote(o, 'happy', 2); else if (sst === 'boo') G.Vg.emote(o, 'angry', 2.5); else G.Vg.emote(o, 'fear', 2); o.fear = Math.min(100, o.fear + (sst === 'cheer' ? 2 : 8)); }
    if (f) { f.terror = Math.min(100, (f.terror || 0) + (e.sac ? 4 : 12)); f.st.executions = (f.st.executions || 0) + (e.sac ? 0 : 1); }
    S.stats.executions = (S.stats.executions || 0) + (e.sac ? 0 : 1);
    if (e.sac && f) { S.faith = Math.min(999, S.faith + 8); f.st.sacrifices = (f.st.sacrifices || 0) + 1; }
    G.FX && G.FX.ring(x, y, 0.2, 1.8, 1, 'rgba(160,20,30,0.7)', 2);
    void z;
  }
  function finish(e, f, set) {
    e.phase = 'after'; e.t = 0;
    const r = P.ruler(f); const M = METHOD[e.method];
    const names = e.names.filter((n, i) => (e.done || []).includes(e.ids[i]));
    if (!names.length) return;
    const who = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1];
    const allF = e.gs.every(g => g === 'f');
    const verb = names.length === 1 ? M.verb[e.gs[0] === 'f' ? 1 : 0] : allF ? M.plf : M.pl;
    const mood = e.boo > e.cheer * 1.4 && e.boo > 2 ? ' A praça vaiou; houve quem gritasse "assassinos".' : e.cheer > e.boo * 2 && e.cheer > 2 ? ' A praça aplaudiu.' : e.cheer && e.boo ? ' Uns aplaudiram; outros viraram o rosto.' : '';
    const weep = e.weep ? ` ${e.weep > 1 ? 'A família chorou' : 'Alguém da família chorou'} ao pé do cadafalso.` : '';
    const shown = M.show ? ` ${names.length > 1 ? 'Os corpos ficaram' : 'O corpo ficou'} ${e.method === 'cruz' ? 'na cruz' : e.method === 'fogueira' ? 'no poste, carbonizad' + (allF ? 'a' : 'o') + (names.length > 1 ? 's' : '') : 'pendurad' + (allF ? 'a' : 'o') + (names.length > 1 ? 's' : '') + ' na forca'}, para todos verem.` : '';
    const seen = e.seen >= 25 ? `diante de uma multidão de ${e.seen} pessoas` : e.seen > 1 ? `diante de ${e.seen} pessoas` : e.seen === 1 ? 'diante de uma única testemunha' : 'quase sem testemunhas';
    if (e.sac) log(`${e.pyr ? 'No alto do templo' : e.temple ? 'Na pedra diante do templo' : 'Na pedra dos sacrifícios'} de ${set.name}, ${seen}, ${who} ${names.length > 1 ? 'foram oferecidos' : 'foi oferecid' + (e.gs[0] === 'f' ? 'a' : 'o')} aos deuses: o coração arrancado e erguido para o Sol, ${e.pyr ? 'o corpo rolando pela escadaria' : 'o corpo atirado ao chão'}.`, 'sacrifice', e.x, e.y);
    else log(`Em ${set.name}, ${seen}, ${who} ${names.length > 1 ? 'foram' : 'foi'} ${verb} ${e.reason ? e.reason + (e.reason.includes(',') ? ',' : '') : ''} por ordem de ${r ? P.styled(f, r) : 'quem governa'}.${mood}${weep}${shown}`.replace('  ', ' ').replace(' .', '.'), 'massacre', e.x, e.y);
    if (set) set.loyalty = G.clamp(set.loyalty + (e.cheer - e.boo * 1.5) * 0.3 - names.length * 2, 0, 100);
    G.Lore && G.Lore.note && G.Lore.note('execution', { fac: f.id, set: set.id, n: names.length, method: e.method });
    G.Stories && G.Stories.signal('executed', { fac: f.id, ids: (e.done || []).slice(), names, method: e.method, reason: e.reason, cheer: e.cheer, boo: e.boo, x: e.x, y: e.y, set: e.set });
    if (r && !e.sac && names.length >= 3) P.earn(f, r, 'sanguinario');
  }
  // the crowd, live: stances, shouts, and when it hates the sentence enough, it storms the scaffold
  function react(e, f, el) {
    const S = G.S; if (S.clock - (e.rT || 0) < 1) return; e.rT = S.clock;
    let cheer = 0, boo = 0, weep = 0, watch = 0;
    for (const o of S.villagers.values()) {
      const t = o.task; if (!t || t.j !== e.id || t.role !== 'watch' || t.st !== 2) continue;
      if (!t.stance) t.stance = stance(o, e, f);
      if (t.stance === 'cheer') cheer++; else if (t.stance === 'boo') boo++; else if (t.stance === 'weep') weep++; else watch++;
      if (G.R() < 0.06) J.say(o, G.pick(e.sac && t.stance === 'cheer' ? SHOUT.sac : SHOUT[t.stance] || ['...']), 2.4);
    }
    e.cheer = Math.max(e.cheer, cheer); e.boo = Math.max(e.boo, boo); e.weep = Math.max(e.weep, weep); e.seen = Math.max(e.seen, cheer + boo + weep + watch);
    // the crowd rushes the scaffold (only before the first death, and only if it truly hates it)
    if (!e.storm && !e.sac && (e.done || []).length === 0 && el < 2 && boo >= 6 && boo > cheer * 2 && G.Polity && G.Polity.riot) {
      const set = S.settlements.get(e.set); if (set && set.loyalty < 40) { e.storm = 1; G.Polity.riot(f, set, 'para salvar ' + e.names.join(' e ') + ' do cadafalso', { at: [e.x, e.y], free: e.id }); }
    }
  }
  function flames(x, y, z, k) {
    if (!G.FX || G.R() > 0.6 * k) return;
    G.FX.spawn({ x: x + G.rr(-0.25, 0.25), y: y + G.rr(-0.15, 0.15), z: z + G.rr(0, 6), vz: G.rr(14, 30), vx: G.rr(-0.1, 0.1), vy: 0, g: -6, life: G.rr(0.4, 0.9), s0: G.rr(1.4, 2.4), s1: 0.2, c: G.R() < 0.5 ? '#ff8a2a' : '#ffd25a', k: 4 });
    if (G.R() < 0.3) G.FX.spawn({ x, y, z: z + 10, vz: G.rr(8, 14), vx: G.rr(-0.2, 0.2), vy: 0, g: -2, life: G.rr(1.4, 2.4), s0: 1.6, s1: 4, c: 'rgba(60,56,52,0.45)', k: 4 });
  }
  function stones(e, v, dt) {
    const S = G.S;
    for (const o of S.villagers.values()) {
      const t = o.task; if (!t || t.j !== e.id || t.role !== 'watch' || t.st !== 2 || t.stance !== 'cheer' || G.R() > dt * 0.9) continue;
      o.act = 'throw'; o.actT = 0; t.thrown = S.clock;
      if (G.FX) G.FX.spawn({ x: o.x, y: o.y, z: 9, vx: (v.x - o.x) * 1.6, vy: (v.y - o.y) * 1.6, vz: 26, g: 60, life: 0.62, s0: 1.2, s1: 1.1, c: '#8a857c', k: 0 });
      if (G.R() < 0.4) { G.Audio && G.Audio.at(v.x, v.y, 'hit', false); G.FX && G.FX.blood && G.FX.blood(v.x, v.y); }
    }
  }

  // ------------------------------ the tasks, walked ------------------------------
  // (the condemned: bound, waiting; then on the square; then in place)
  J.runDoomed = function (v, t, dt, H) {
    if (t.pose) { v.moving = false; v.act = t.pose === 'hangd' && t.kick ? (Math.sin(G.S.clock * 14) > 0 ? 'hangd' : 'writhe') : t.pose; if (t.pose === 'limp') v.act = 'hangd'; return; }
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { v.x = t.x; v.y = t.y; t.st = 2; return; } t.st = 1; return; }
    if (t.st === 1) { v.act = 'bound'; if (H.move(v, dt, 0.7)) { t.st = 2; v.actT = 0; } if (t.age > 60) { v.x = t.x; v.y = t.y; t.st = 2; } return; }
    v.moving = false; v.act = 'mourn'; if (!v.emo || v.emo.t < 0.2) G.Vg.emote(v, G.R() < 0.5 ? 'sad' : 'fear', 2);
  };
  J.run = function (v, t, dt, H) {
    if (t.type !== 'justice') return false;
    const e = execs().find(q => q.id === t.j);
    if (!e || e.phase === 'done') { v.hood = false; v.dz = 0; H.end(v); return true; }
    if (t.role === 'exe' && e.phase === 'kill' && t.perch) { v.moving = false; v.act = t.act || ''; return true; }
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { if (t.role === 'watch') { H.end(v); return true; } v.x = t.x; v.y = t.y; t.st = 2; return true; } t.st = 1; return true; }
    if (t.st === 1) { if (H.move(v, dt, t.role === 'watch' ? 1.1 : 1)) { t.st = 2; v.actT = 0; } if (t.age > 70) t.st = 2; return true; }
    v.moving = false;
    G.faceTo(v, e.x - v.x, e.y - v.y);
    if (t.role === 'her') v.act = e.phase === 'read' || e.phase === 'gather' ? (e.phase === 'read' ? 'read' : 'call') : '';
    else if (t.role === 'guard') v.act = 'guard';
    else if (t.role === 'exe') { v.hood = e.method !== 'sacrificio' && e.method !== 'pedras'; v.act = e.method === 'fogueira' ? 'torchfwd' : ''; }
    else if (t.role === 'watch') {
      if (e.phase === 'kill' || e.phase === 'read') { const s = t.stance || 'watch'; v.act = t.thrown && G.S.clock - t.thrown < 0.6 ? 'throw' : s === 'cheer' ? (Math.sin(G.S.clock * 3 + v.id) > 0 ? 'joy' : '') : s === 'boo' ? 'boo' : s === 'weep' ? 'mourn' : s === 'fear' ? 'mourn' : ''; }
      else v.act = '';
      if (e.phase === 'after' && t.age > 30) H.end(v);
    }
    return true;
  };
  J.taskText = function (v, t) {
    if (t.type === 'condemned' && t.j) { const e = execs().find(q => q.id === t.j); return e && e.sac ? 'Esperando o sacrifício' : 'Condenad' + oa(v) + ', esperando a execução'; }
    if (t.type !== 'justice') return null;
    const e = execs().find(q => q.id === t.j); const m = e ? e.method : '';
    return t.role === 'exe' ? (m === 'sacrificio' ? 'Conduzindo o sacrifício' : 'Carrasco: cumprindo a sentença') : t.role === 'her' ? 'Lendo a sentença na praça' : t.role === 'guard' ? 'Guardando o cadafalso' : m === 'sacrificio' ? 'Assistindo ao sacrifício' : 'Assistindo a uma execução';
  };

  // ------------------------------ the loop ------------------------------
  let tS = 0;
  J.update = function (dt) {
    const S = G.S; if (!S) return;
    for (const e of execs().slice()) { try { tick(e, dt); } catch (err) { console.warn('justice', err); cancel(e); } }
    // scaffolds stay a while — the hanged and the crucified with them — then come down
    tS += dt; if (tS < 3) return; tS = 0;
    const sc = scaffolds();
    for (let k = sc.length - 1; k >= 0; k--) {
      const s = sc[k]; const e = execs().find(q => q.id === s.ex);
      const keep = s.kind === 'cross' ? 2.2 : s.kind === 'gallows' ? 1.2 : s.kind === 'pyre' ? 0.8 : 0.4;
      if (e || S.day - s.since < keep) continue;
      if (G.Carnage) for (const c of G.Carnage.list()) if (c.sc === s.id) { c.pose = null; c.sc = 0; c.t = Math.max(c.t, DAY() * 0.5); }
      sc.splice(k, 1);
    }
    for (let k = bubbles.length - 1; k >= 0; k--) if (S.clock > bubbles[k].until || !S.villagers.has(bubbles[k].id)) bubbles.splice(k, 1);
  };
  J.reset = function () { bubbles.length = 0; };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.execs = G.S.execs || []; out.scaffolds = G.S.scaffolds || []; },
    load(o) { G.S.execs = o.execs || []; G.S.scaffolds = o.scaffolds || []; bubbles.length = 0; },
  });

  // ------------------------------ drawing ------------------------------
  const wood = '#7a5232', woodD = '#4e3220', rope = '#c8b07a';
  const H = 5, BEAM = 20; // platform top and gallows beam, in screen px above the ground
  const O = (dx, dy, z) => G.Render.off(dx, dy, z);
  function quad(c, a, b, d, e, fill) { c.fillStyle = fill; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); }
  // a raised wooden platform, drawn on the ground grid (it turns with the camera)
  function platform(c, x0, x1, y0, y1, h, cols) {
    const T = [O(x0, y0, h), O(x1, y0, h), O(x1, y1, h), O(x0, y1, h)], B = [O(x0, y0, 0), O(x1, y0, 0), O(x1, y1, 0), O(x0, y1, 0)];
    const cy = (T[0][1] + T[1][1] + T[2][1] + T[3][1]) / 4;
    for (let k = 0; k < 4; k++) { const a = k, b = (k + 1) % 4; if ((T[a][1] + T[b][1]) / 2 > cy) quad(c, T[a], T[b], B[b], B[a], cols ? cols[k % 2] : k % 2 ? '#5a3a24' : '#4a2e1c'); }
    quad(c, T[0], T[1], T[2], T[3], cols ? cols[2] : wood);
    if (cols) return T;
    c.strokeStyle = 'rgba(40,24,14,0.45)'; c.lineWidth = 0.3;
    for (let k = 1; k < 5; k++) { const x = x0 + (x1 - x0) * k / 5; const a = O(x, y0, h), b = O(x, y1, h); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    return T;
  }
  const post = (c, dx, dy, z0, z1, w, col) => { const a = O(dx, dy, z0), b = O(dx, dy, z1); c.strokeStyle = col || woodD; c.lineWidth = w || 1.2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); return b; };
  function drawScaffold(c, o, sx, sy, t) {
    const s = o.s; const b = G.clamp(s.built, 0, 1); const S = G.S;
    const e = execs().find(q => q.id === s.ex);
    c.save(); c.translate(sx, sy);
    const n = Math.max(1, s.n || 1); const half = (n - 1) / 2;
    const sp = k => (s.kind === 'gallows' ? (k - half) * 0.62 : s.kind === 'pyre' ? (k - half) * 0.85 : s.kind === 'cross' ? (k - half) * 0.95 : 0);
    if (s.kind === 'gallows' || s.kind === 'block') {
      const w = s.kind === 'gallows' ? 0.42 + half * 0.62 + 0.25 : 0.75;
      platform(c, -w, w, -0.42, 0.42, H);
      // the steps up
      for (let k = 0; k < 3; k++) { const z = H - (k + 1) * 1.6; const a = O(w + 0.1 + k * 0.16, -0.18, z), bb = O(w + 0.1 + k * 0.16, 0.18, z); c.strokeStyle = woodD; c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); c.stroke(); }
      if (b < 1) c.globalAlpha = 0.25 + b * 0.75;
      if (s.kind === 'gallows') {
        const L = post(c, -w + 0.12, 0, H, H + BEAM - 2, 1.3), R = post(c, w - 0.12, 0, H, H + BEAM - 2, 1.3);
        c.strokeStyle = wood; c.lineWidth = 1.4; const l2 = O(-w - 0.05, 0, H + BEAM - 1.5), r2 = O(w + 0.05, 0, H + BEAM - 1.5); c.beginPath(); c.moveTo(l2[0], l2[1]); c.lineTo(r2[0], r2[1]); c.stroke();
        c.strokeStyle = woodD; c.lineWidth = 0.7; const br = O(-w + 0.12, 0, H + BEAM - 6), bt = O(-w + 0.5, 0, H + BEAM - 1.6); c.beginPath(); c.moveTo(br[0], br[1]); c.lineTo(bt[0], bt[1]); c.stroke();
        void L; void R;
        // ropes: to the neck of whoever hangs, or a noose waiting
        for (let k = 0; k < n; k++) {
          const top = O(sp(k), 0, H + BEAM - 2.2);
          const occ = G.Carnage && G.Carnage.list().some(q => q.sc === s.id && q.pose === 'hang' && Math.abs((q.px - s.x) - sp(k)) < 0.2);
          let v = null; if (e) for (const id of e.ids) { const q = S.villagers.get(id); if (q && q.task && q.task.pose === 'hangd' && Math.abs((q.x - s.x) - sp(k)) < 0.2) v = q; }
          // the trapdoor that opened under whoever hangs there
          if (v || occ) { const a = O(sp(k) - 0.16, -0.16, H), b2 = O(sp(k) + 0.16, -0.16, H), d = O(sp(k) + 0.16, 0.16, H), f2 = O(sp(k) - 0.16, 0.16, H); quad(c, a, b2, d, f2, '#1a100a'); }
          c.strokeStyle = rope; c.lineWidth = 0.55;
          if (v) { const nk = O(v.x - s.x, v.y - s.y, (v.z || 0) + 9.6); c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(nk[0], nk[1]); c.stroke(); }
          else if (!occ) { const sw = Math.sin(t * 1.4 + k) * 0.5; const lo = O(sp(k), 0, H + 11); c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(lo[0] + sw, lo[1]); c.stroke(); c.beginPath(); c.ellipse(lo[0] + sw, lo[1] + 1.1, 0.9, 1.2, 0, 0, TAU); c.stroke(); }
        }
        const lv = O(w - 0.3, 0.25, H); c.strokeStyle = woodD; c.lineWidth = 0.7; c.beginPath(); c.moveTo(lv[0], lv[1]); c.lineTo(lv[0] + 1.6, lv[1] - 4); c.stroke();
      } else {
        // the block, the basket, the straw soaked dark
        const bk = O(0.55, 0.12, H);
        c.fillStyle = '#6a4a2e'; c.fillRect(bk[0] - 2.4, bk[1] - 3, 4.8, 3); c.fillStyle = '#8a6440'; c.beginPath(); c.ellipse(bk[0], bk[1] - 3, 2.4, 0.9, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(110,14,20,0.6)'; c.beginPath(); c.ellipse(bk[0], bk[1] - 3, 1.5, 0.5, 0, 0, TAU); c.fill();
        const bs = O(0.55, -0.3, H); c.fillStyle = '#8a6a34'; c.fillRect(bs[0] - 2, bs[1] - 2.2, 4, 2.2); c.fillStyle = '#b89858'; c.beginPath(); c.ellipse(bs[0], bs[1] - 2.2, 2, 0.8, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(230,200,120,0.6)'; for (let k = 0; k < 6; k++) { const q = O(-0.4 + k * 0.15, 0.2 - (k % 2) * 0.2, H); c.fillRect(q[0], q[1] - 0.3, 1.2, 0.35); }
      }
    } else if (s.kind === 'pyre') {
      for (let k = 0; k < n; k++) {
        const o0 = O(sp(k), 0, 0); const x = o0[0], y = o0[1];
        const burnT = s.burn && s.burn[k] ? S.clock - s.burn[k] : -1; const ash = burnT > 12;
        c.fillStyle = ash ? '#3a3430' : '#6a4a2a'; c.beginPath(); c.ellipse(x, y - 1.2, 7, 3.2, 0, 0, TAU); c.fill();
        if (!ash) { c.strokeStyle = '#8a6438'; c.lineWidth = 0.8; for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI; c.beginPath(); c.moveTo(x + Math.cos(a) * 6.4, y - 1.2 + Math.sin(a) * 1.4); c.lineTo(x + Math.cos(a) * 1.4, y - 4); c.stroke(); } }
        else { c.fillStyle = 'rgba(255,120,40,' + (0.25 + Math.sin(t * 3 + k) * 0.15) + ')'; for (let q = 0; q < 4; q++) c.fillRect(x - 3 + q * 1.7, y - 1.8 - (q % 2) * 0.4, 0.9, 0.5); }
        c.fillStyle = ash ? '#1e1a18' : woodD; c.fillRect(x - 0.65, y - 19, 1.3, 17.6);
        if (burnT >= 0 && burnT < 14) {
          const k2 = Math.min(1, burnT / 2) * Math.max(0, 1 - Math.max(0, burnT - 10) / 4);
          for (let q = 0; q < 8; q++) { const fl = Math.sin(t * 12 + q * 1.7) * 1.6; const fx = x + (q - 3.5) * 1.5; c.fillStyle = q % 2 ? 'rgba(255,170,40,0.9)' : 'rgba(255,90,20,0.85)'; c.beginPath(); c.moveTo(fx - 1.5, y - 2); c.quadraticCurveTo(fx + fl, y - 2 - (9 + q % 3 * 3) * k2, fx + 1.5, y - 2); c.fill(); }
          c.fillStyle = 'rgba(255,200,90,' + 0.22 * k2 + ')'; c.beginPath(); c.arc(x, y - 9, 10 * k2, 0, TAU); c.fill();
        }
      }
    } else if (s.kind === 'cross') {
      for (let k = 0; k < n; k++) {
        const o0 = O(sp(k), 0, 0); const x = o0[0], y = o0[1];
        c.fillStyle = 'rgba(90,70,50,0.5)'; c.beginPath(); c.ellipse(x, y, 3.4, 1.4, 0, 0, TAU); c.fill();
        c.fillStyle = woodD; c.fillRect(x - 0.85, y - 26, 1.7, 26); c.fillRect(x - 6.6, y - 17.6, 13.2, 1.6);
        c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x - 0.85, y - 26, 0.5, 26);
      }
    } else if (s.kind === 'altar') {
      // the sacrificial stone: a dark slab on the square, the top black with old blood
      platform(c, -0.36, 0.36, -0.2, 0.2, 3, ['#5a5650', '#4a4640', '#7a746a']);
      const m = O(0, 0, 3); c.fillStyle = 'rgba(90,10,16,0.7)'; c.beginPath(); c.ellipse(m[0], m[1], 4.4, 1.6, 0, 0, TAU); c.fill();
      const d = O(0.1, 0.24, 0); c.fillStyle = 'rgba(110,12,20,0.55)'; c.beginPath(); c.ellipse(d[0], d[1], 3.2, 1.2, 0, 0, TAU); c.fill();
    } else if (s.kind === 'post') {
      c.fillStyle = woodD; c.fillRect(-0.6, -15, 1.2, 15);
      c.fillStyle = '#8a857c'; const pile = e ? Math.min(14, Math.floor((e.t || 0) * 1.4)) : 14; for (let k = 0; k < pile; k++) { c.beginPath(); c.ellipse(Math.sin(k * 2.3) * 3.6, -0.4 - (k % 3) * 0.7, 1.1, 0.75, 0, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  // the dead on display: on the rope, on the cross, on the stake
  J.drawPosed = function (ctx, c, sx, sy, t) {
    const L = c.look; const S = G.S;
    const st = G.Carnage.stage(c);
    ctx.save(); ctx.translate(sx, sy);
    L.headless = false; L._ruler = false;
    if (c.pose === 'hang') {
      const sw = Math.sin(t * 0.9 + c.id) * 0.05;
      ctx.translate(0, -1); ctx.rotate(sw);
      ctx.strokeStyle = rope; ctx.lineWidth = 0.55; ctx.beginPath(); ctx.moveTo(0, -9.6); ctx.lineTo(0, -(H + BEAM - 2.2) + 1); ctx.stroke();
      const a = L.act; L.act = 'hangd'; L.actT = 0; L.moving = false;
      G.Art.villager(ctx, L, 0, 0, t, false); L.act = a;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-0.7, -9.6, 1.4, 0.9);
    } else if (c.pose === 'cross') {
      ctx.translate(0, -7);
      const a = L.act; L.act = 'cross'; L.actT = 0; L.moving = false;
      G.Art.villager(ctx, L, 0, 0, t, false); L.act = a;
      ctx.fillStyle = 'rgba(120,10,16,0.75)'; ctx.fillRect(3.6, -9.6, 0.6, 1.4); ctx.fillRect(-4.2, -9.6, 0.6, 1.4); ctx.fillRect(-0.3, -1.2, 0.8, 1.4);
    } else if (c.pose === 'burnt') {
      ctx.translate(0, -4);
      L.skin = '#2e221e'; L._cloth = '#1a1614'; L.hair = '#1a1614';
      const a = L.act; L.act = 'bound'; L.actT = 0; L.moving = false;
      G.Art.villager(ctx, L, 0, 0, t, false); L.act = a;
      if (G.R() < 0.05) G.FX && G.FX.spawn({ x: c.x, y: c.y, z: 14, vz: 8, vx: G.rr(-0.1, 0.1), vy: 0, g: -2, life: 2, s0: 1.4, s1: 3.6, c: 'rgba(70,64,60,0.35)', k: 4 });
    }
    // crows on the hanged and the crucified
    if (st !== 'fresh' && c.pose !== 'burnt') { ctx.fillStyle = '#16161c'; for (let k = 0; k < 2; k++) { const hop = Math.abs(Math.sin(t * 2 + k * 2 + c.id)) * 0.8; ctx.beginPath(); ctx.ellipse(k ? 2.4 : -2.2, -(c.pose === 'cross' ? 27 : 23) - hop, 1.4, 0.9, 0, 0, TAU); ctx.fill(); } }
    ctx.restore();
    void S;
  };
  function drawBubble(c, o, sx, sy) {
    const b = o.b; const v = G.S.villagers.get(b.id); if (!v) return;
    c.save(); c.font = 'bold 5px sans-serif'; const w = c.measureText(b.txt).width + 4;
    const y = sy - (v.z || 0) - 19;
    c.fillStyle = 'rgba(250,244,230,0.92)'; c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = 0.4;
    c.beginPath(); c.roundRect ? c.roundRect(sx - w / 2, y - 5.5, w, 7, 2) : c.rect(sx - w / 2, y - 5.5, w, 7); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(sx - 1, y + 1.5); c.lineTo(sx + 1.2, y + 1.5); c.lineTo(sx + 0.2, y + 3.4); c.closePath(); c.fill();
    c.fillStyle = '#2a1c14'; c.textAlign = 'center'; c.fillText(b.txt, sx, y);
    c.restore();
  }
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const ent = new WeakMap();
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S) return;
    for (const s of S.scaffolds || []) { let e = ent.get(s); if (!e) ent.set(s, e = { s, fn: drawScaffold }); add(s.x + s.y - 1.6, e, s.x, s.y); }
    if (zoom < 0.7) return;
    for (const b of bubbles) { const v = S.villagers.get(b.id); if (!v) continue; let e = ent.get(b); if (!e) ent.set(b, e = { b, fn: drawBubble }); add(v.x + v.y + 3, e, v.x, v.y); }
  });
  J.list = execs;
  if (G.Polity) G.Polity.sentence = J.sentence;
})(window.G);
