'use strict';
// ============================================================
//  Scenes: the moments a story stages.
//
//  A scene is a small handcrafted piece of direction played by the
//  real people of the world, where they really are: the daughter who
//  hears the herald and drops her basket; the whisper through the bars
//  of a cell; the circle of hoods round a brazier while someone holds
//  their breath behind a tree. It is written as a generator — a script
//  that walks people to their marks, has them speak, turn, kneel, run,
//  and waits on time or on the world — so a scene can branch on what
//  the world does (the guard looks this way or doesn't; the rope is
//  cut in time or isn't) and never pretends: what happens in a scene
//  happens in the world.
//
//    CAST       ids by role. An actor is TAKEN (the scene drives them, their
//               errand put aside — and given back after, if asked) or only
//               WATCHED (someone else's errand drives them: the condemned,
//               the executioner, the hooded at their rite; the scene may make
//               them speak and the camera frames them).
//    WAITERS    a script yields a number (seconds of world time), or what the
//               verbs return: walk() is done on arrival, say() when the line
//               has been read, until(fn) when the world agrees.
//    SHOW       if the player follows the story (or asks to watch), the scene
//               takes the screen: black bars, the camera's own shots, slow
//               motion at the instant that matters, subtitles with faces,
//               a title card. Otherwise it plays on in the world, and the
//               screen only says that it is happening — now, there.
//    MEMORY     the scene leaves its words and a few pictures of itself in the
//               story's chapters, so a moment missed can still be seen.
//  Scenes are short and live only in memory: a save made during one keeps
//  the world, not the scene (the story notices and goes on).
// ============================================================
(function (G) {
  const Sn = G.Scene = { list: [], defs: {}, records: [], watching: null };
  const W = G.W;
  const TAU = Math.PI * 2;
  const P = id => (id && G.S ? G.S.villagers.get(id) || null : null);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = s => document.querySelector(s);
  const DAY = () => G.DAY_LEN;
  // errands a scene never takes by itself (it may borrow them on purpose, with force)
  const GUARDED = { condemned: 1, jail: 1, justice: 1, conclave: 1, lured: 1, riot: 1, riotguard: 1, band: 1, combat: 1, aboard: 1, escape: 1, flee: 1, swim: 1, army: 1, siege: 1, escorted: 1, envoy: 1, sail: 1 };

  Sn.define = function (key, d) { d.key = key; Sn.defs[key] = d; };

  // ============================== play ==============================
  // play('cd-pregao', { story, cast: { p: id, cap: id }, at: [x, y], imp: 1..3, title, kick, data, onEnd(result, sc) })
  Sn.play = function (key, o) {
    const d = Sn.defs[key]; const S = G.S; if (!d || !S) return null;
    o = o || {};
    const cast = Object.assign({}, o.cast || {});
    // one scene per story at a time; nobody plays in two scenes at once
    if (o.story && Sn.list.some(s => s.story === o.story && s.st === 'run')) return null;
    for (const k in cast) { const v = P(cast[k]); if (v && v.task && v.task.type === 'scene' && Sn.list.some(s => s.id === v.task.sc && s.st === 'run')) { if (o.must && o.must.includes(k)) return null; } }
    const sc = {
      id: S.nextId++, key, story: o.story || 0, cast, at: o.at || null, data: Object.assign({}, o.data || {}), t: 0, rt: 0, st: 'run',
      taken: new Map(), lines: [], snaps: [], imp: o.imp || d.imp || 1, title: o.title || d.title || '', kick: o.kick || d.kick || '',
      born: S.clock, onEnd: o.onEnd || null, shot: null, focus: [], tags: {}, ch: null, wait: null, result: null, lost: [],
      guard: o.guard || null, mood: null, cap: '', lastLine: null, present: d.present !== undefined ? d.present : true,
      // (a lazy scene walks its people to their places first, unseen; it is shown from the moment it says it is ready)
      ready: !d.lazy,
    };
    sc.c = api(sc);
    try { sc.gen = d.gen(sc.c, sc); } catch (e) { console.warn('scene start', key, e); return null; }
    Sn.list.push(sc);
    try { if (Sn.onStart) Sn.onStart(sc); } catch (e) { console.warn('scene onStart', e); }
    advance(sc, undefined);
    return sc;
  };
  Sn.get = id => Sn.list.find(s => s.id === id) || null;
  Sn.of = storyId => Sn.list.find(s => s.story === storyId && s.st === 'run') || null;
  Sn.running = (storyId, key) => Sn.list.some(s => s.story === storyId && s.st === 'run' && (!key || s.key === key));
  Sn.actorScene = v => (v && v.task && v.task.type === 'scene' ? Sn.get(v.task.sc) : null);

  // ============================== the engine ==============================
  function toWaiter(sc, y) {
    if (y === undefined || y === null) return null;
    if (typeof y === 'number') return { t: y, done(_, dt) { this.t -= dt; return this.t <= 0; } };
    if (Array.isArray(y)) return all(y.map(w => toWaiter(sc, w)));
    if (typeof y.done === 'function') return y;
    return null;
  }
  function all(ws) { return { ws, done(sc, dt) { let ok = true; for (const w of this.ws) if (w && !w._ok) { if (w.done(sc, dt)) w._ok = true; else ok = false; } return ok; } }; }
  function any(ws) { return { ws, done(sc, dt) { for (const w of this.ws) if (w && w.done(sc, dt)) { this.val = w.val === undefined ? true : w.val; this.which = w; return true; } return false; } }; }
  function advance(sc, val) {
    let guard = 0;
    while (sc.st === 'run' && guard++ < 80) {
      let r;
      try { r = sc.gen.next(val); } catch (e) { console.warn('scene', sc.key, e); return finish(sc, 'erro'); }
      if (r.done) return finish(sc, r.value !== undefined ? r.value : sc.result || 'ok');
      const w = toWaiter(sc, r.value);
      if (!w) { val = undefined; continue; }
      if (w.done(sc, 0)) { val = w.val; continue; }
      sc.wait = w; return;
    }
  }
  function tick(sc, dt) {
    sc.t += dt;
    // the scene's own condition (the one it is about is dead, the moment has passed)
    if (sc.guard) { let ok = true; try { ok = sc.guard(sc.c); } catch (e) { ok = false; } if (!ok) return abort(sc, 'guard'); }
    // an actor lost to the world (an emergency, death): a vital one ends the scene
    for (const [id, rec] of sc.taken) {
      const v = P(id);
      if (v && v.task && v.task.type === 'scene' && v.task.sc === sc.id) continue;
      sc.taken.delete(id); sc.lost.push(id);
      if (rec.vital) return abort(sc, 'perdido');
    }
    if (!sc.wait) return advance(sc, undefined);
    let ok = false; try { ok = sc.wait.done(sc, dt); } catch (e) { console.warn('scene wait', sc.key, e); return finish(sc, 'erro'); }
    if (!ok) return;
    const v = sc.wait.val; sc.wait = null; advance(sc, v);
  }
  function abort(sc, why) {
    if (sc.st !== 'run') return;
    sc.aborted = why;
    // the script may clean up after itself (finally blocks)
    try { sc.gen.return(why); } catch (e) { /* nothing */ }
    finish(sc, 'abortada:' + why);
  }
  Sn.abort = abort;
  function finish(sc, result) {
    if (sc.st !== 'run') return;
    sc.st = 'done'; sc.result = result;
    for (const id of [...sc.taken.keys()]) releaseId(sc, id);
    // the words and the pictures go into the story
    keep(sc);
    try { if (sc.onEnd) sc.onEnd(result, sc); } catch (e) { console.warn('scene onEnd', sc.key, e); }
    try { if (Sn.onEnd) Sn.onEnd(sc); } catch (e) { console.warn('scene onEnd hook', e); }
    if (Sn.watching === sc) leaveSoon(sc);
    const k = Sn.list.indexOf(sc); if (k >= 0) Sn.list.splice(k, 1);
  }
  Sn.update = function (dt) {
    if (!G.S || !Sn.list.length) return;
    for (const sc of Sn.list.slice()) { if (sc.st !== 'run') continue; try { tick(sc, dt); } catch (e) { console.warn('scene tick', sc.key, e); abort(sc, 'erro'); } }
  };

  // ============================== taking and giving back ==============================
  function taken(sc, v) { return !!(v && v.task && v.task.type === 'scene' && v.task.sc === sc.id); }
  function take(sc, v, o) {
    o = o || {};
    if (!v || !G.S.villagers.has(v.id) || v.held || v.air || v.aboard || v.ug) return false;
    if (taken(sc, v)) { if (o.vital) sc.taken.get(v.id).vital = true; return true; }
    const t = v.task;
    if (t && t.type === 'scene' && Sn.list.some(s => s.id === t.sc && s.st === 'run')) return false;
    if (t && GUARDED[t.type] && (!o.force || t.type === 'condemned' || t.type === 'jail' || t.type === 'aboard')) return false;
    if (v.age < 2) return false;
    const prev = o.keep && t ? t : null;
    // (the errand put aside: its own cleanup runs, and it is given back with its steps from the start)
    if (prev) { v.task = null; } else if (t) G.Vg.endTask(v);
    if (v.inside) { const b = G.S.buildings.get(v.inside); if (b) { const d = G.Vg.door(b); v.x = d[0]; v.y = d[1]; } v.inside = 0; }
    v.sleeping = false; v.path = null;
    v.task = { type: 'scene', sc: sc.id, pri: 5.5, st: 0, age: 0, mv: null, act: '', kind: 'scene', calm: o.calm ? 1 : 0 };
    v.act = ''; v.actT = 0;
    sc.taken.set(v.id, { prev, vital: !!o.vital, z: v.z || 0 });
    return true;
  }
  function releaseId(sc, id) {
    const rec = sc.taken.get(id); sc.taken.delete(id);
    const v = P(id); if (!v || !taken(sc, v)) return;
    v.act = ''; v.path = null; v.moving = false; v.task = null;
    if (v.sceneHold) { v.sceneHold = null; }
    if (rec && rec.prev && G.S.villagers.has(v.id)) { const p = rec.prev; p.st = 0; if (p.age !== undefined) p.age = Math.min(p.age, 1); v.task = p; }
    else v.think = Math.min(v.think || 0, 0.3);
  }

  // ============================== the verbs ==============================
  function api(sc) {
    const S = () => G.S;
    const who = r => (r == null ? null : typeof r === 'number' ? P(r) : typeof r === 'string' ? P(sc.cast[r]) : r.id !== undefined && r.x !== undefined ? (G.S.villagers.has(r.id) ? r : null) : null);
    const posOf = r => { if (Array.isArray(r)) return r; const v = who(r); return v ? [v.x, v.y] : r && r.x !== undefined ? [r.x, r.y] : null; };
    const done = val => ({ val, done() { return true; } });
    const c = {
      sc, data: sc.data, cast: sc.cast,
      v: who, pos: posOf,
      has: r => !!who(r),
      alive: r => !!who(r),
      id: r => { const v = who(r); return v ? v.id : 0; },
      name: r => { const v = who(r); return v ? v.name : (typeof r === 'string' && sc.cast[r] ? ((G.person(sc.cast[r]) || {}).name || '') : ''); },
      o: r => { const v = who(r) || (typeof r === 'string' ? G.person(sc.cast[r]) : null); return v && v.g === 'f' ? 'a' : 'o'; },
      ele: r => (c.o(r) === 'a' ? 'ela' : 'ele'),
      cast2: (role, v) => { if (v) sc.cast[role] = v.id; return v; },
      // ---- time and the world ----
      wait: s => s,
      until: (fn, max) => ({ max: max === undefined ? 1e9 : max, done(_, dt) { let r = false; try { r = fn(c); } catch (e) { r = false; } if (r) { this.val = true; return true; } this.max -= dt; if (this.max <= 0) { this.val = false; return true; } return false; } }),
      all: (...ws) => all(ws.map(w => toWaiter(sc, w))),
      any: (...ws) => any(ws.map(w => toWaiter(sc, w))),
      chance: p => G.R() < p,
      pick: arr => (arr && arr.length ? arr[Math.floor(G.R() * arr.length)] : null),
      night: () => G.isNight(),
      // ---- the actors ----
      take: (r, o) => take(sc, who(r), o),
      taken: r => taken(sc, who(r)),
      release: r => { const v = who(r); if (v) releaseId(sc, v.id); },
      // walk to a place (or to someone, stopping near): done on arrival (val false if there was no way, or too long)
      walk(r, x, y, o) {
        o = o || {};
        const v = who(r); if (!v) return done(false);
        if (!taken(sc, v) && !take(sc, v, o)) return done(false);
        if (Array.isArray(x)) { o = y || o; y = x[1]; x = x[0]; }
        const m = { x, y, sp: o.run ? 1.6 : o.sneak ? 0.62 : o.slow ? 0.75 : (o.sp || 1), act: o.run ? 'run' : o.sneak ? 'sneak' : (o.act || ''), near: o.near || 0, follow: o.follow || 0 };
        v.task.mv = m; v.task.act = o.then || ''; v.task.face = null;
        return { m, max: o.max || 50, done(_, dt) { if (m.ok) { this.val = true; return true; } if (m.fail) { this.val = false; return true; } this.max -= dt; if (this.max <= 0) { this.val = false; if (v.task && v.task.mv === m) v.task.mv = null; return true; } return false; } };
      },
      // go up to someone who may be moving, and stop at a distance
      approach(r, to, dist, o) { const t = who(to); if (!t) return done(false); o = Object.assign({}, o || {}, { follow: t.id, near: dist || 1.1 }); return c.walk(r, t.x, t.y, o); },
      // stand and do something (an animation from the art book); until the next pose
      pose(r, act, o) {
        o = o || {}; const v = who(r); if (!v) return null;
        if (taken(sc, v)) { v.task.act = act || ''; v.task.mv = null; v.moving = false; v.path = null; v.act = act || ''; v.actT = 0; if (o.face) c.face(v, o.face); }
        else if (o.force) { v.act = act || ''; v.actT = 0; }
        return o.dur ? o.dur : null;
      },
      face(r, target) { const v = who(r); const p = posOf(target); if (!v || !p) return null; G.faceTo(v, p[0] - v.x, p[1] - v.y); if (taken(sc, v)) v.task.face = typeof target === 'object' && !Array.isArray(target) && target && target.id ? target.id : p.slice(); return null; },
      emote(r, k, d) { const v = who(r); if (v) G.Vg.emote(v, k, d || 2.4); return null; },
      // a line: the bubble over the head, and (on screen) the subtitle with the face. Done when it has been read.
      say(r, txt, o) {
        o = o || {}; const v = who(r); if (!v || !txt) return null;
        const b = G.Talk ? G.Talk.say(v, txt, { style: o.style, dur: o.dur, name: Sn.watching === sc && !o.noName ? v.name : '', col: o.col, scene: sc.id }) : null;
        const line = { id: v.id, name: v.name, txt, style: o.style || (b ? b.style : 'say'), t: sc.t };
        sc.lines.push(line); if (sc.lines.length > 40) sc.lines.shift();
        sc.lastLine = line;
        if (Sn.watching === sc) subtitle(sc, v, line, b);
        const d = o.wait !== undefined ? o.wait : (b ? b.dur * 0.82 : 2);
        return d;
      },
      // everyone in the crowd at once (no waiting, no subtitle)
      murmur(list, lines, o) { for (const v of list || []) if (v && G.R() < ((o && o.p) || 0.5)) { if (G.Talk) G.Talk.say(v, c.pick(lines), { dur: 1.6 + G.R() * 1.4, style: o && o.style }); } return null; },
      sfx(name, at, vol) { const p = at ? posOf(at) : sc.at; if (G.Audio) { if (Sn.watching === sc || !p) G.Audio.play(name, vol); else G.Audio.at(p[0], p[1], name, true, vol); } return null; },
      fx(fn) { try { fn(G.FX, G.S); } catch (e) { /* a spark is never worth an error */ } return null; },
      // ---- the screen (only when the scene is being shown) ----
      cam(targets, o) { o = o || {}; sc.shot = { tg: Array.isArray(targets) && typeof targets[0] === 'number' ? [targets] : [].concat(targets), zoom: o.zoom || 'fit', t: 0, cut: !!o.cut, soft: o.soft || 0, lift: o.lift || 0, dur: o.dur || 0 }; if (o.cut && Sn.watching === sc) cutFade(); return o.hold || null; },
      focus(...rs) { sc.focus = rs; return null; },
      tag(r, label) { const v = who(r); if (v) sc.tags[v.id] = label; return null; },
      title(kick, title, o) { if (Sn.watching === sc) titleCard(kick, title, o); sc.titleSeen = sc.titleSeen || title; return (o && o.hold) || null; },
      caption(txt, o) { sc.cap = txt; if (Sn.watching === sc) captionShow(txt, o); sc.lines.push({ id: 0, name: '', txt, style: 'cap', t: sc.t }); return (o && o.hold) || null; },
      slow(k, dur) { if (Sn.watching === sc) slowmo(k, dur || 1.5); return null; },
      shake(a) { if (Sn.watching === sc && G.Render) G.Render.shake(a || 0.4); return null; },
      flash(col, a) { if (Sn.watching === sc && G.FX) { G.FX.flash = a || 0.6; G.FX.flashColor = col || '255,255,255'; } return null; },
      mood(m) { sc.mood = m; if (Sn.watching === sc && G.Audio && G.Audio.mood) G.Audio.mood(m); return null; },
      snap(caption) { snapReq(sc, caption); return null; },
      // ---- the story ----
      chapter(txt, o) { const st = sc.story && G.Stories && G.Stories.get(sc.story); if (!st || !txt) return null; const ch = G.Stories.chapter(st, txt, Object.assign({ x: sc.at ? sc.at[0] : undefined, y: sc.at ? sc.at[1] : undefined }, o || {})); if (!sc.ch) sc.ch = ch; return null; },
      story: () => (sc.story && G.Stories ? G.Stories.get(sc.story) : null),
      // ---- places ----
      spot: (x, y, r, o) => Sn.spot(x, y, r, o),
      // a point at a distance and an angle from someone (or a place), walkable
      beside(r, d, ang) { const p = posOf(r); if (!p) return null; const a = ang === undefined ? G.R() * TAU : ang; return Sn.spot(p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d, 2.5) || [p[0], p[1]]; },
      // how one calls the other ('Pai', 'Filha', 'Irmão', or the name)
      voc: (a, b) => Sn.voc(who(a), who(b) || G.person(typeof b === 'string' ? sc.cast[b] : b)),
      rel: (a, b) => { const x = who(a), y = who(b) || G.person(typeof b === 'string' ? sc.cast[b] : b); return x && y && G.Stories ? G.Stories.relOf(x, y) : null; },
      oath: r => Sn.oath(who(r)),
      // up on something (the scaffold, a barrel, a cart): the height stays while the scene holds them
      lift(r, z) { const v = who(r); if (!v) return null; v.z = z || 0; if (taken(sc, v)) v.task.perch = z > 0 ? 1 : 0; return null; },
      // something flies from one to the other (an arrow, a stone): done when it lands
      shoot(from, to, o) {
        o = o || {}; const a = posOf(from), b = posOf(to); if (!a || !b) return done(false);
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const f = { x0: a[0], y0: a[1], z0: o.z0 !== undefined ? o.z0 : 9, x1: b[0] + (o.dx || 0), y1: b[1] + (o.dy || 0), z1: o.z1 !== undefined ? o.z1 : 8, arc: o.arc !== undefined ? o.arc : Math.min(14, d * 1.4), t0: G.S.clock, dur: o.dur || Math.max(0.35, d * 0.07), k: o.k || 'arrow', sc: sc.id };
        flights.push(f);
        return { done() { return G.S.clock >= f.t0 + f.dur; } };
      },
      // things the scene sets down in the world for a while: a small fire, a dropped basket, a candle, a fresh grave
      prop(k, x, y, o) { const p = Object.assign({ k, x, y, sc: sc.id, until: G.S.clock + ((o && o.secs) || 60) }, o || {}); props.push(p); return p; },
      ignite(x, y, f) { if (!W.inb(x, y)) return null; G.Nature.ignite(W.idx(x, y), f || 0.9); return null; },
      end: res => { sc.result = res; return null; },
      ready() { if (sc.ready) return null; sc.ready = true; sc.t0show = sc.t; try { if (Sn.onReady) Sn.onReady(sc); } catch (e) { console.warn('scene ready', e); } return null; },
    };
    return c;
  }
  Sn.api = api;
  // a free piece of ground near a point: walkable, dry, not inside a building
  Sn.spot = function (x, y, r, o) {
    const S = G.S; r = r || 3; o = o || {};
    for (let d = 0; d <= r; d += 0.5) for (let k = 0; k < Math.max(1, Math.round(d * 6)); k++) {
      const a = k / Math.max(1, Math.round(d * 6)) * TAU + (o.a0 || 0.3);
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      if (!W.inb(px, py) || !W.walkableXY(px, py)) continue;
      const i = W.idx(px, py); if (S.occ[i] || W.isWater(i)) continue;
      if (o.notNear && G.dist(px, py, o.notNear[0], o.notNear[1]) < (o.notR || 2)) continue;
      return [px, py];
    }
    return null;
  };
  const VOC = { pai: 'Pai', mae: 'Mãe', filho: 'Filho', filha: 'Filha', companheiro: 'Meu amor', companheira: 'Meu amor', irmao: 'Irmão', irma: 'Irmã' };
  // the same, inside a sentence ('aguenta, pai' — but names stay as they are)
  Sn.vocL = (a, b) => { const w = Sn.voc(a, b); return b && w !== b.name ? w.charAt(0).toLowerCase() + w.slice(1) : w; };
  Sn.voc = (a, b) => { if (!a || !b) return b ? b.name : ''; const r = G.Stories ? G.Stories.relOf(a, b) : null; return (r && VOC[r]) || b.name; };
  const OATH = { nordico: ['Pelos deuses!', 'Por Odin!', 'Por Thor!'], romano: ['Pelos deuses!', 'Por Júpiter!'], egipcio: ['Por Rá!', 'Pelos deuses!'], asteca: ['Pelo Sol!', 'Pelos deuses!'], grego: ['Por Zeus!', 'Pelos deuses!'] };
  Sn.oath = v => { const l = (v && OATH[v._civ || v.civ]) || ['Pelos deuses!', 'Céus!']; return l[Math.floor(G.R() * l.length)]; };

  // ============================== the scene errand ==============================
  Sn.run = function (v, t, dt, H) {
    if (t.type !== 'scene') return false;
    const sc = Sn.get(t.sc);
    if (!sc || sc.st !== 'run') { H.end(v); return true; }
    const m = t.mv;
    if (m) {
      if (m.follow) {
        const o = P(m.follow);
        if (!o) { m.fail = 1; t.mv = null; return true; }
        m.x = o.x; m.y = o.y;
        if (G.dist(v.x, v.y, o.x, o.y) <= m.near) { m.ok = 1; t.mv = null; v.moving = false; v.path = null; G.faceTo(v, o.x - v.x, o.y - v.y); return true; }
        if (H.arrived(v) && m.pathed && G.dist(v.x, v.y, o.x, o.y) <= m.near + 0.75) { m.ok = 1; t.mv = null; v.moving = false; v.path = null; G.faceTo(v, o.x - v.x, o.y - v.y); return true; }
        m.rt = (m.rt || 0) - dt;
        if (m.rt <= 0 || H.arrived(v)) { m.rt = 0.7; m.pathed = 1; if (!H.goto(v, o.x, o.y, true, 8000)) { m.fail = 1; t.mv = null; return true; } }
      } else if (!m.pathed) {
        if (G.dist(v.x, v.y, m.x, m.y) < 0.12) { m.ok = 1; t.mv = null; v.moving = false; return true; }
        if (!H.goto(v, m.x, m.y, false, 9000) && !H.goto(v, m.x, m.y, true, 9000)) { m.fail = 1; t.mv = null; (sc.dbg || (sc.dbg = [])).push(`sem caminho: ${v.name} ${v.x.toFixed(1)},${v.y.toFixed(1)} -> ${(+m.x).toFixed(1)},${(+m.y).toFixed(1)}`); return true; }
        m.pathed = 1;
      }
      v.act = m.act || '';
      if (H.move(v, dt, m.sp)) { if (!m.follow) { m.ok = 1; t.mv = null; v.moving = false; v.act = t.act || ''; } }
      else if (m.near && !m.follow && G.dist(v.x, v.y, m.x, m.y) <= m.near) { m.ok = 1; t.mv = null; v.moving = false; v.path = null; v.act = t.act || ''; }
      return true;
    }
    v.moving = false;
    v.act = t.act || '';
    if (t.face) { const p = typeof t.face === 'number' ? P(t.face) : null; const f = p ? [p.x, p.y] : Array.isArray(t.face) ? t.face : null; if (f) G.faceTo(v, f[0] - v.x, f[1] - v.y); }
    return true;
  };
  Sn.taskText = function (v, t) {
    if (t.type !== 'scene') return null;
    const sc = Sn.get(t.sc); if (!sc) return 'Num momento importante';
    const st = sc.story && G.Stories ? G.Stories.get(sc.story) : null;
    const d = Sn.defs[sc.key];
    return (d && d.doing && d.doing(sc, v)) || (st ? st.title : sc.title || 'Num momento importante');
  };

  // ============================== memory: words and pictures ==============================
  function keep(sc) {
    const lines = sc.lines.filter(l => l.style !== 'murmur').slice(-14).map(l => [l.name, l.txt, l.style]);
    if (!lines.length && !sc.snaps.length) return;
    const rec = { id: sc.id, story: sc.story, key: sc.key, title: sc.titleSeen || sc.title || '', kick: sc.kick || '', d: G.S.day, lines, snaps: sc.snaps.slice(0, 6), result: sc.result };
    Sn.records.push(rec); if (Sn.records.length > 40) Sn.records.shift();
    // the chapter the scene wrote first keeps its words (they are saved with the story; the pictures only live until the page is closed)
    if (sc.ch) { sc.ch.scn = sc.id; sc.ch.lines = lines.slice(0, 10); if (sc.titleSeen || sc.title) sc.ch.sct = sc.titleSeen || sc.title; }
  }
  Sn.record = id => Sn.records.find(r => r.id === id) || null;
  // a picture of the scene: from the screen when it is being shown; otherwise from a camera of its own, once, before the frame
  const snapQ = [];
  function snapReq(sc, caption) { if (sc.snaps.length >= 6) return; snapQ.push({ sc, caption: caption || '', t: sc.t }); }
  function framing(sc) {
    const pts = [];
    for (const id of sc.taken.keys()) { const v = P(id); if (v) pts.push([v.x, v.y]); }
    for (const r of sc.focus) { const p = sc.c.pos(r); if (p) pts.push(p); }
    if (sc.shot) for (const r of sc.shot.tg) { const p = sc.c.pos(r); if (p) pts.push(p); }
    if (!pts.length && sc.at) pts.push(sc.at);
    return pts;
  }
  const THUMB_W = 320;
  function grab(canvas, caption, sc) {
    try {
      const h = Math.round(THUMB_W * canvas.height / canvas.width);
      const c = document.createElement('canvas'); c.width = THUMB_W; c.height = h;
      const x = c.getContext('2d'); x.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, THUMB_W, h);
      sc.snaps.push({ img: c.toDataURL('image/jpeg', 0.74), cap: caption, d: G.S.day });
    } catch (e) { /* a picture is never worth an error */ }
  }
  // called by the main loop just before the frame is drawn
  Sn.beforeFrame = function () {
    if (!snapQ.length || !G.Render || G.Render.under || (G.Main && G.Main.mode !== 'game')) return;
    const q = snapQ.shift(); const sc = q.sc;
    if (Sn.watching === sc) { snapQ.unshift(q); return; }
    const pts = framing(sc); if (!pts.length) return;
    const R = G.Render, cam = R.cam; const keepC = { x: cam.x, y: cam.y, zoom: cam.zoom, tz: cam.tz, follow: cam.follow, target: cam.target, shake: cam.shake };
    let x = 0, y = 0; for (const p of pts) { x += p[0]; y += p[1]; } x /= pts.length; y /= pts.length;
    const [sx, sy] = R.proj(x, y, W.groundH(G.clamp(x, 0, G.N - 0.01), G.clamp(y, 0, G.N - 0.01)));
    cam.x = sx; cam.y = sy - 10; cam.zoom = cam.tz = 2.3; cam.follow = 0; cam.target = null; cam.shake = 0;
    try { R.frame(0); grab(R.canvas || document.querySelector('#game'), q.caption, sc); } catch (e) { /* nothing */ }
    Object.assign(cam, keepC);
  };
  Sn.afterFrame = function () {
    if (!snapQ.length || !Sn.watching) return;
    const i = snapQ.findIndex(q => q.sc === Sn.watching); if (i < 0) return;
    const q = snapQ.splice(i, 1)[0];
    grab(document.querySelector('#game'), q.caption, q.sc);
  };

  // ============================== the screen ==============================
  let el = null, saved = null, slow = null, fade = 0, cardT = 0, capT = 0, subT = 0, leaveT = 0, vx = 0, vy = 0, lz = 0, lastFrame = 0;
  Sn.init = function () {
    const d = document.createElement('div'); d.id = 'scene';
    d.innerHTML = `<div class="sc-vig"></div><div class="sc-bar top"></div><div class="sc-bar bot"></div>
      <div class="sc-story"><i></i><span></span></div>
      <div class="sc-cap"></div>
      <div class="sc-card"><div class="sc-kick"></div><div class="sc-title"></div><div class="sc-rule"></div></div>
      <div class="sc-sub"><span class="sc-face"></span><div class="sc-st"><b class="sc-who"></b><p class="sc-line"></p></div></div>
      <button class="sc-skip" title="Sair da cena — ela continua acontecendo no mundo">Sair da cena <kbd>Esc</kbd></button>
      <div class="sc-slow">câmera lenta</div>
      <div class="sc-fade"></div>`;
    document.body.appendChild(d);
    el = { root: d, story: d.querySelector('.sc-story span'), storyIc: d.querySelector('.sc-story i'), cap: d.querySelector('.sc-cap'), card: d.querySelector('.sc-card'), kick: d.querySelector('.sc-kick'), title: d.querySelector('.sc-title'), sub: d.querySelector('.sc-sub'), face: d.querySelector('.sc-face'), who: d.querySelector('.sc-who'), line: d.querySelector('.sc-line'), skip: d.querySelector('.sc-skip'), fade: d.querySelector('.sc-fade'), slow: d.querySelector('.sc-slow') };
    el.skip.addEventListener('click', e => { e.stopPropagation(); G.Audio && G.Audio.play('click'); Sn.leave(); });
    el.skip.addEventListener('pointerdown', e => e.stopPropagation());
  };
  // take the screen for this scene
  Sn.show = function (sc) {
    if (!el || !sc || sc.st !== 'run' || !sc.ready || !G.Main || G.Main.mode !== 'game' || (G.Photo && G.Photo.on)) return false;
    if (Sn.watching === sc) return true;
    if (Sn.watching) Sn.leave(true);
    Sn.watching = sc; leaveT = 0;
    const R = G.Render, cam = R.cam;
    saved = { speed: G.speed, hud: !(G.Cinema && G.Cinema.on), follow: cam.follow };
    if (G.speed !== 1 && G.speed !== 0) G.UI.setSpeed(1);
    G.UI.select && G.UI.select(null); G.UI.setPower && G.UI.setPower(null); G.UI.showHUD(false);
    const tip = $('#tooltip'); if (tip) tip.classList.add('hidden');
    cam.follow = 0; cam.target = null; cam.anchor = null;
    vx = vy = 0; lz = Math.log(cam.zoom);
    if (R.under) R.setUnder(0, true);
    el.root.classList.add('on'); el.root.classList.remove('leaving');
    const st = sc.story && G.Stories ? G.Stories.get(sc.story) : null;
    el.story.textContent = st ? st.title : sc.title || '';
    el.storyIc.innerHTML = st && G.ICON ? (G.ICON[(G.Stories.DEF[st.type] || {}).icon] || G.ICON.saga || '') : '';
    el.root.style.setProperty('--hue', st && G.Stories.hue ? G.Stories.hue(st.type) : '#f5c86b');
    el.sub.classList.remove('show'); el.cap.classList.remove('show'); el.card.classList.remove('show');
    // the cut: through black if it is far
    const pts = framing(sc); const p = pts[0];
    if (p) { const [sx, sy] = R.proj(p[0], p[1], W.groundH(G.clamp(p[0], 0, G.N - 0.01), G.clamp(p[1], 0, G.N - 0.01))); const far = Math.hypot(sx - cam.x, sy - cam.y) * cam.zoom > Math.hypot(R.VW, R.VH) * 0.8; if (far) { cutFade(); fade = 0.45; sc.jump = 1; } }
    if (sc.mood && G.Audio && G.Audio.mood) G.Audio.mood(sc.mood);
    if (sc.titleSeen) titleCard(sc.kick, sc.titleSeen);
    if (sc.lastLine && sc.t - sc.lastLine.t < 4) { const v = P(sc.lastLine.id); if (v) subtitle(sc, v, sc.lastLine, G.Talk && G.Talk.of(v.id)); }
    G.Audio && G.Audio.play('whoosh', 0.6);
    try { if (Sn.onShow) Sn.onShow(sc); } catch (e) { /* nothing */ }
    return true;
  };
  // give the screen back (the scene goes on in the world)
  Sn.leave = function (quick) {
    const sc = Sn.watching; if (!sc) return;
    Sn.watching = null; slow = null;
    if (el) { el.root.classList.remove('on'); el.root.classList.add('leaving'); el.sub.classList.remove('show'); el.cap.classList.remove('show'); el.card.classList.remove('show'); el.slow.classList.remove('show'); setTimeout(() => el && el.root.classList.remove('leaving'), 900); }
    if (G.Audio && G.Audio.mood) G.Audio.mood(null);
    if (saved) {
      if (saved.hud && G.Main.mode === 'game' && !(G.Cinema && G.Cinema.on)) G.UI.showHUD(true);
      if (G.speed === 1 && saved.speed > 1 && !quick && !sc.keepSlow) G.UI.setSpeed(saved.speed);
      // the camera stays with whoever the scene was about
      const st = sc.story && G.Stories ? G.Stories.get(sc.story) : null; const p = st && P(st.protag);
      if (p && G.Stories.followed && G.Stories.followed() === st.id) G.Render.cam.follow = p.id;
    }
    saved = null;
    try { if (Sn.onLeave) Sn.onLeave(sc); } catch (e) { /* nothing */ }
  };
  function leaveSoon(sc) { leaveT = 2.2; sc.leaving = 1; if (el) el.sub.classList.remove('show'); }
  function cutFade() { if (!el) return; el.fade.classList.add('on'); fade = 0.42; }
  function titleCard(kick, title, o) {
    if (!el || !title) return;
    el.kick.textContent = kick || ''; el.title.textContent = title;
    el.card.classList.remove('show'); void el.card.offsetWidth; el.card.classList.add('show');
    cardT = (o && o.secs) || 4.2;
    G.Audio && G.Audio.play('sting', 0.7);
  }
  function captionShow(txt, o) { if (!el) return; el.cap.textContent = txt; el.cap.classList.remove('show'); void el.cap.offsetWidth; el.cap.classList.add('show'); capT = (o && o.secs) || Math.max(4, txt.length / 12); }
  function subtitle(sc, v, line, b) {
    if (!el) return;
    el.face.innerHTML = ''; if (G.Stories && G.Stories.portrait) el.face.appendChild(G.Stories.portrait(v, 46));
    const rel = sc.tags[v.id] ? ` · ${sc.tags[v.id]}` : '';
    el.who.textContent = v.name + rel;
    el.line.className = 'sc-line ' + (line.style || 'say');
    el.sub.dataset.full = line.txt; el.sub._b = b || null; el.sub._t0 = performance.now();
    el.line.textContent = '';
    el.sub.classList.add('show');
    subT = Math.max(2.4, (b ? b.dur : 2.5) + 0.6);
  }
  function slowmo(k, dur) { slow = { k: G.clamp(k, 0.12, 1), until: performance.now() / 1000 + dur, t0: performance.now() / 1000 }; if (el) el.slow.classList.add('show'); G.Audio && G.Audio.play('whoosh', 0.5); }
  // world time runs slower while the instant that matters plays
  Sn.timeScale = function () {
    if (!slow || !Sn.watching) return 1;
    const now = performance.now() / 1000;
    if (now > slow.until) { slow = null; if (el) el.slow.classList.remove('show'); return 1; }
    const inK = Math.min(1, (now - slow.t0) / 0.25), outK = Math.min(1, (slow.until - now) / 0.5);
    const f = Math.min(inK, outK);
    return 1 + (slow.k - 1) * f;
  };

  // per frame (real time): the camera, the captions, the typed subtitle
  Sn.frame = function (rdt) {
    if (!el) return;
    lastFrame = rdt;
    if (fade > 0) { fade -= rdt; if (fade <= 0) el.fade.classList.remove('on'); }
    if (cardT > 0) { cardT -= rdt; if (cardT <= 0) el.card.classList.remove('show'); }
    if (capT > 0) { capT -= rdt; if (capT <= 0) el.cap.classList.remove('show'); }
    if (leaveT > 0) { leaveT -= rdt; if (leaveT <= 0 && Sn.watching && Sn.watching.st !== 'run') Sn.leave(); }
    const sc = Sn.watching; if (!sc) return;
    if (G.Main.mode !== 'game') { Sn.leave(true); return; }
    // the subtitle types itself out with the bubble
    if (el.sub.classList.contains('show')) {
      const full = el.sub.dataset.full || ''; const b = el.sub._b;
      const n = b && G.Talk ? G.Talk.typed(b) : Math.floor((performance.now() - el.sub._t0) / 1000 * 34) + 1;
      const s = full.slice(0, n); if (el.line.textContent !== s) el.line.textContent = s;
      subT -= rdt * (G.speed === 0 ? 0 : 1); if (subT <= 0) el.sub.classList.remove('show');
    }
    // the camera
    if (fade > 0.25 && !sc.jump) return;
    const R = G.Render, cam = R.cam;
    cam.follow = 0; cam.target = null; cam.anchor = null;
    let pts, zoom = 'fit', soft = 0, lift = 0;
    if (sc.shot) { sc.shot.t += rdt; pts = sc.shot.tg.map(r => sc.c.pos(r)).filter(Boolean); zoom = sc.shot.zoom; soft = sc.shot.soft; lift = sc.shot.lift; }
    if (!pts || !pts.length) pts = framing(sc);
    if (!pts.length) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, mx = 0, my = 0;
    for (const p of pts) {
      const [sx, sy] = R.proj(p[0], p[1], W.groundH(G.clamp(p[0], 0, G.N - 0.01), G.clamp(p[1], 0, G.N - 0.01)));
      mx += sx; my += sy - 9; if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
    }
    mx /= pts.length; my /= pts.length;
    const tx = (x0 + x1) / 2 * 0.5 + mx * 0.5, ty = ((y0 + y1) / 2 - 9) * 0.5 + my * 0.5 - lift;
    let zt = typeof zoom === 'number' ? zoom : G.clamp(Math.min(R.VW * 0.5 / Math.max(40, x1 - x0 + 60), R.VH * 0.42 / Math.max(30, y1 - y0 + 50)), 1.15, 2.9);
    zt = G.clamp(zt, R.minZoom(), 5);
    if (sc.jump) { sc.jump = 0; cam.x = tx; cam.y = ty; lz = Math.log(zt); cam.zoom = cam.tz = zt; vx = vy = 0; return; }
    const K = soft ? 1.4 : 3.2, D = 2 * Math.sqrt(K);
    const h = Math.min(rdt, 0.05);
    for (let s = rdt; s > 1e-4; s -= h) { const dt = Math.min(h, s); vx += ((tx - cam.x) * K - vx * D) * dt; vy += ((ty - cam.y) * K - vy * D) * dt; cam.x += vx * dt; cam.y += vy * dt; }
    lz += (Math.log(zt) - lz) * Math.min(1, rdt * (soft ? 0.7 : 1.4));
    cam.zoom = cam.tz = Math.exp(lz);
  };

  // ---- what flies and what is set down ----
  const flights = [], props = [];
  Sn.props = props;
  G.renderHooks.air = G.renderHooks.air || [];
  G.renderHooks.air.push(function (ctx, proj) {
    if (!flights.length || G.Render.under) return;
    const S = G.S;
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]; const k = (S.clock - f.t0) / f.dur;
      if (k >= 1.15) { flights.splice(i, 1); continue; }
      const kk = Math.min(1, k);
      const x = f.x0 + (f.x1 - f.x0) * kk, y = f.y0 + (f.y1 - f.y0) * kk, z = f.z0 + (f.z1 - f.z0) * kk + Math.sin(kk * Math.PI) * f.arc;
      const p = proj(x, y, W.groundH(G.clamp(x, 0, G.N - 0.01), G.clamp(y, 0, G.N - 0.01)));
      const k2 = Math.max(0, kk - 0.06); const x2 = f.x0 + (f.x1 - f.x0) * k2, y2 = f.y0 + (f.y1 - f.y0) * k2, z2 = f.z0 + (f.z1 - f.z0) * k2 + Math.sin(k2 * Math.PI) * f.arc;
      const q = proj(x2, y2, W.groundH(G.clamp(x2, 0, G.N - 0.01), G.clamp(y2, 0, G.N - 0.01)));
      ctx.save();
      if (f.k === 'arrow') {
        const a = Math.atan2((p[1] - z) - (q[1] - z2), p[0] - q[0]);
        ctx.translate(p[0], p[1] - z); ctx.rotate(a);
        ctx.strokeStyle = 'rgba(255,250,230,0.35)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-4, 0); ctx.stroke();
        ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(2.5, 0); ctx.stroke();
        ctx.fillStyle = '#c8ccd4'; ctx.beginPath(); ctx.moveTo(4.2, 0); ctx.lineTo(2.2, -0.9); ctx.lineTo(2.2, 0.9); ctx.fill();
        ctx.fillStyle = '#e8e2d0'; ctx.fillRect(-5.5, -0.9, 1.6, 0.6); ctx.fillRect(-5.5, 0.3, 1.6, 0.6);
      } else { ctx.fillStyle = '#8a857c'; ctx.beginPath(); ctx.arc(p[0], p[1] - z, 1.1, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
  });
  function drawProp(c, o, sx, sy, t, nightF) {
    const p = o.p;
    c.save(); c.translate(sx, sy);
    if (p.k === 'fire') {
      c.fillStyle = '#3a2a1a'; c.beginPath(); c.ellipse(0, 0, 3.2, 1.4, 0, 0, TAU); c.fill();
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-2.6, 0.4); c.lineTo(2.2, -0.8); c.moveTo(-2, -0.8); c.lineTo(2.6, 0.5); c.stroke();
      for (let k = 0; k < 4; k++) { const fl = Math.sin(t * 11 + k * 1.9) * 0.6; c.fillStyle = k % 2 ? 'rgba(255,170,40,0.92)' : 'rgba(255,96,24,0.88)'; c.beginPath(); c.moveTo(-1.8 + k * 1.2, -0.4); c.quadraticCurveTo(-1.4 + k * 1.2 + fl, -4.6 - (k % 2) * 1.6, -0.6 + k * 1.2, -0.4); c.fill(); }
      if (G.Art.glow) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.25 + nightF * 0.45; c.drawImage(G.Art.glow('warm'), -22, -26, 44, 44); }
      if (G.R() < 0.04 && G.FX) G.FX.spawn({ x: p.x, y: p.y, z: 6, vz: 10, vx: G.rr(-0.1, 0.1), vy: 0, g: -2, life: 1.6, s0: 1, s1: 3, c: 'rgba(80,72,64,0.35)', k: 4 });
    } else if (p.k === 'basket') {
      c.fillStyle = '#a07040'; c.beginPath(); c.ellipse(0, -0.6, 2.2, 1.1, 0.4, 0, TAU); c.fill();
      c.fillStyle = p.col || '#d8302a'; for (const [dx, dy] of [[2.6, 0.8], [3.8, 0.2], [-2.6, 1], [1, 1.6]]) { c.beginPath(); c.arc(dx, dy, 0.6, 0, TAU); c.fill(); }
    } else if (p.k === 'candle') {
      c.fillStyle = '#e8e0c8'; c.fillRect(-0.4, -2, 0.8, 2); c.fillStyle = '#ffd25a'; c.beginPath(); c.ellipse(0, -2.6 - Math.sin(t * 9) * 0.15, 0.4, 0.7, 0, 0, TAU); c.fill();
      if (G.Art.glow) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.2 + nightF * 0.4; c.drawImage(G.Art.glow('warm'), -12, -15, 24, 24); }
    } else if (p.k === 'grave') {
      c.fillStyle = '#6a5a44'; c.beginPath(); c.ellipse(0, 0.4, 4, 1.8, 0, 0, TAU); c.fill();
      c.fillStyle = '#9a958c'; c.fillRect(-1, -5, 2, 5); c.fillRect(-2.2, -3.8, 4.4, 1.2);
      if (p.flower) { c.fillStyle = '#e8456b'; c.beginPath(); c.arc(1.6, 0.2, 0.6, 0, TAU); c.fill(); }
    } else if (p.k === 'coins') {
      c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(0, -1, 1.8, 1.6, 0, 0, TAU); c.fill(); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(0.8, -1.4, 0.5, 0, TAU); c.fill();
    }
    c.restore();
  }
  G.renderHooks.ents.push(function (add) {
    if (!props.length) return; const S = G.S;
    for (let i = props.length - 1; i >= 0; i--) if (S.clock > props[i].until) props.splice(i, 1);
    for (const p of props) add(p.x + p.y - 0.02, p._e || (p._e = { p, fn: drawProp }), p.x, p.y);
  });
  // names under the feet of who is in the scene (on screen, at the start and while they speak)
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.air = G.renderHooks.air || [];
  G.renderHooks.air.push(function (ctx, proj) {
    const sc = Sn.watching; if (!sc || G.Render.under) return;
    const k = 1 / G.Render.cam.zoom;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const idS in sc.tags) {
      const v = P(+idS); if (!v || v.inside) continue;
      const talking = G.Talk && G.Talk.busy(v.id);
      const a = sc.t < 7 ? Math.min(1, (7 - sc.t) / 1.5) : talking ? 0.85 : 0;
      if (a <= 0.02) continue;
      const p = proj(v.x, v.y, G.W.groundH(v.x, v.y));
      ctx.save(); ctx.translate(p[0], p[1] - (v.z || 0) + 3.5); ctx.scale(k, k); ctx.globalAlpha = a;
      const label = `${v.name} · ${sc.tags[idS]}`;
      ctx.font = '800 10.5px Nunito, sans-serif'; const w = ctx.measureText(label).width + 14;
      ctx.fillStyle = 'rgba(14,10,8,0.66)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2, 4, w, 17, 8.5) : ctx.rect(-w / 2, 4, w, 17); ctx.fill();
      ctx.fillStyle = '#f6e6c2'; ctx.fillText(label, 0, 13);
      ctx.restore();
    }
    ctx.restore();
  });

  // ============================== save ==============================
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() { if (Sn.watching) Sn.leave(true); Sn.list.length = 0; snapQ.length = 0; slow = null; flights.length = 0; props.length = 0; },
  });
  Sn.reset = function () { if (Sn.watching) Sn.leave(true); Sn.list.length = 0; snapQ.length = 0; slow = null; flights.length = 0; props.length = 0; };
  // the temper a line is written for
  Sn.temper = v => { if (!v) return 'firme'; const q = G.Politics.persona(v); if (v.courage > 0.7 || q.agg > 0.72) return 'bravo'; if (v.courage < 0.36) return 'medroso'; if (q.cru > 0.62) return 'frio'; if (q.pie > 0.66) return 'devoto'; return 'firme'; };
})(window.G);
