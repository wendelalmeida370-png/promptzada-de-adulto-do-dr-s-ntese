'use strict';
// ============================================================
//  Stories — the narrative engine.
//
//  The world makes facts; the director finds stories in them; a handcrafted layer gives them shape.
//
//    OBSERVER   the world calls St.signal(kind, data) at the moments that matter (a death, a capture,
//               a city taken, a tale told by the fire...). Each becomes a FACT: who, whom, where, how,
//               which facts led to it (provenance), and who witnessed or learned of it (knowledge).
//    SALIENCE   each archetype looks at a fact and says whether someone real, with real ties to it,
//               could carry a story out of it — and how strongly, given kinship, witness, age,
//               personality and whether a future is still possible. Most facts give nothing.
//    SEEDS      a strong reaction is a seed, not yet a story: it waits a while, and fades if not taken.
//    DIRECTOR   picks few seeds to follow (about 3–9 at once, with the size of the world), for variety:
//               it remembers the motifs it has shown (type, kinship, structure, tone, climax, ending)
//               and lets them fade with time, so the same pattern does not come back again and again.
//    STORIES    open state machines: each archetype polls the world and reacts to new facts, writes
//               chapters from small reusable STORYLETS, nudges what its people choose to do with a
//               little of their free time — never teleports, protects or forces anyone — and ends the
//               way the world decides: fulfilled, tragic, stolen by chance, abandoned, forgotten,
//               transformed, or handed down to a child.
//
//  Golden rule: a story never says something happened that did not happen in the simulation; what
//  people want, promise and believe is the story's to invent — what happened is the world's.
//  Truth and knowledge are apart: a fact is what happened; St.knows(person, fact) is how that person
//  came to know it (saw it, was told, heard a tale, a rumour). A revenge needs someone who knows.
//  Everything is kept by ids (people, peoples, places) and survives save/load, timeskip and death.
// ============================================================
(function (G) {
  const St = G.Stories = {};
  const W = G.W;
  const DAY = () => G.DAY_LEN;
  const P = id => (id ? G.person(id) : null);
  const alive = id => !!(id && G.S && G.S.villagers.has(id));
  const oa = p => (p && p.g === 'f' ? 'a' : 'o');
  const ele = p => (p && p.g === 'f' ? 'ela' : 'ele');
  // (a well-spread integer mix: small story ids must not all land on the same words)
  const mix = St.mix = k => { let h = Math.imul((k | 0) ^ 0x9e3779b9, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const hashPick = (arr, k) => arr[Math.floor(mix(k) * arr.length)];
  const recent = {}; // the variants of each storylet said lately, so two stories in a row don't use the same words
  const facName = id => { const f = G.Fac.get(id); return f ? f.name : 'um povo esquecido'; };
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : null; };
  const VIOLENT = { war: 1, arrow: 1, massacre: 1, execution: 1, coup: 1, sacrifice: 1 };

  // ============================== state ==============================
  function fresh() { return { v: 1, facts: [], nf: 1, seeds: [], stories: [], ns: 1, mem: [], know: {}, wars: {}, lastPromo: -1e9 }; }
  function st() { const S = G.S; if (!S.saga) S.saga = fresh(); return S.saga; }
  St.state = st;
  // people -> the stories they are in (rebuilt when the world changes)
  let idx = new Map(), idxFor = null;
  function reindex() {
    idx = new Map(); idxFor = G.S;
    for (const s of st().stories) if (s.st === 'ativa') for (const id of people(s)) addIdx(id, s.id);
  }
  function addIdx(id, sid) { if (!id) return; let a = idx.get(id); if (!a) idx.set(id, a = []); if (!a.includes(sid)) a.push(sid); }
  function people(s) { const out = [s.protag]; for (const k in s.cast) if (typeof s.cast[k] === 'number' && KIND_PERSON[k]) out.push(s.cast[k]); return out; }
  const KIND_PERSON = { victim: 1, target: 1, captive: 1, teller: 1, lost: 1, ruler: 1 };
  function storiesOf(id) { if (idxFor !== G.S) reindex(); const a = idx.get(id); return a ? a.map(getStory).filter(s => s && s.st === 'ativa') : []; }
  St.of = storiesOf;
  St.reindex = () => reindex();
  function getStory(id) { return st().stories.find(s => s.id === id) || null; }
  St.get = getStory;

  // ============================== facts ==============================
  // what happened: the objective truth, with names kept as they were, and the facts that led to it
  let factIdx = new Map(), factFor = null;
  function factById(id) {
    if (factFor !== G.S || factIdx.size !== st().facts.length) { factIdx = new Map(); for (const f of st().facts) factIdx.set(f.id, f); factFor = G.S; }
    return factIdx.get(id) || null;
  }
  St.fact = factById;
  function draft(k, o) {
    const S = G.S; const f = Object.assign({ k, d: S.day }, o);
    if (f.x !== undefined) { f.x = +(+f.x).toFixed(1); f.y = +(+f.y).toFixed(1); }
    return f;
  }
  function commit(f) { if (f.id) return f; const s = st(); f.id = s.nf++; s.facts.push(f); factIdx.set(f.id, f); return f; }
  // where something happened, in words
  function where(x, y) {
    if (x === undefined) return { name: '', at: '' };
    const S = G.S; let best = null, bd = 1e9;
    for (const s of S.settlements.values()) { const d = G.dist(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    if (best && bd < 6) return { name: best.name, at: ' em ' + best.name, town: 1 };
    let pl = null, pd = 9; if (G.Relief && G.Relief.places) for (const p of G.Relief.places()) { const d = G.dist(x, y, p.x, p.y); if (d < pd) { pd = d; pl = p; } }
    if (pl) return { name: pl.name, at: ' perto ' + (/^(Lagoa|Cachoeira|Agulha|Garganta|Trilha|Escadaria|Subida|Portela|Queda|Gruta|Lapa|Furna|Toca|Caverna|Serra|Cordilheira|Pedra|Boca|Cova|Fenda|Ponta|Montanha|Colina|Cratera|Ilha|Praia|Baía|Enseada|Garganta)/.test(pl.name) ? 'da ' : 'do ') + pl.name };
    if (best && bd < 18) return { name: best.name, at: ' perto de ' + best.name, town: 1 };
    return { name: '', at: ' nos ermos' };
  }
  St.where = where;

  // ============================== knowledge ==============================
  // how a person came to know a fact: 'viu' (saw it), 'soube' (was told), 'ouviu' (heard it in a tale),
  // 'boato' (public rumour). (Later: 'acredita', 'suspeita', 'mente', 'engano' — and secrets.)
  function learn(pid, fid, how) {
    if (!pid || !fid) return; const s = st(); const k = s.know[pid] || (s.know[pid] = []);
    const e = k.find(q => q[0] === fid); if (e) { if (how === 'viu') e[1] = 'viu'; return; }
    k.push([fid, how, G.S.day]); if (k.length > 12) k.shift();
  }
  St.knows = (pid, fid) => { const k = st().know[pid]; const e = k && k.find(q => q[0] === fid); return e ? e[1] : null; };
  const HOW = St.HOW = { viu: 'viu com os próprios olhos', soube: 'soube pela família', ouviu: 'ouviu contar', boato: 'ouviu dizer' };

  // ============================== kinship ==============================
  function relOf(p, q) { // what q is to p
    if (!p || !q || p.id === q.id) return null;
    if (p.father === q.id) return 'pai'; if (p.mother === q.id) return 'mae';
    if ((p.kids || []).includes(q.id)) return q.g === 'f' ? 'filha' : 'filho';
    if (p.partner === q.id || q.partner === p.id || p.widow === q.id || q.widow === p.id) return q.g === 'f' ? 'companheira' : 'companheiro';
    if ((p.mother && p.mother === q.mother) || (p.father && p.father === q.father)) return q.g === 'f' ? 'irma' : 'irmao';
    return null;
  }
  St.relOf = relOf;
  const REL_W = { pai: 1, mae: 1, filho: 1, filha: 1, companheiro: 0.9, companheira: 0.9, irmao: 0.72, irma: 0.72 };
  const REL_POSS = { pai: 'seu pai', mae: 'sua mãe', filho: 'seu filho', filha: 'sua filha', companheiro: 'seu companheiro', companheira: 'sua companheira', irmao: 'seu irmão', irma: 'sua irmã' };
  const REL_DE = { pai: 'o pai', mae: 'a mãe', filho: 'o filho', filha: 'a filha', companheiro: 'o companheiro', companheira: 'a companheira', irmao: 'o irmão', irma: 'a irmã' };
  // the living close family of someone
  function kin(v) {
    const S = G.S; const out = new Set(); const add = id => { if (id && id !== v.id && S.villagers.has(id)) out.add(id); };
    add(v.mother); add(v.father); add(v.partner); add(v.widow);
    for (const id of v.kids || []) add(id);
    for (const pid of [v.mother, v.father]) { const p = P(pid); if (p) for (const id of p.kids || []) add(id); }
    for (const o of S.villagers.values()) if (o.widow === v.id || o.partner === v.id) add(o.id);
    return [...out].map(id => S.villagers.get(id)).filter(Boolean);
  }
  St.kin = kin;
  const facOf = v => (v && !v.dead ? G.Fac.idOfV(v) : v ? v.fac : 0);
  function awake(v) { return v && !v.inside && !v.sleeping && !v.aboard && !v.ug; }

  // ============================== the observer ==============================
  // the world calls this; the work is done on the next step, when the moment has settled
  const pending = [];
  St.signal = function (kind, d) { if (!G.S || (G.Main && G.Main.mode === 'menu')) return; pending.push([kind, d]); if (pending.length > 400) pending.shift(); };
  const OBS = {};
  function flush() {
    while (pending.length) {
      const [k, d] = pending.shift();
      try { if (OBS[k]) OBS[k](d); } catch (e) { console.warn('stories:', k, e); }
    }
  }
  // a fact is offered to every archetype (new seeds) and every running story (what it changes)
  function offer(f) {
    const s = st(); let used = false;
    for (const story of s.stories) {
      if (story.st !== 'ativa') continue;
      const def = DEF[story.type]; if (!def || !def.react) continue;
      try { if (def.react(story, f)) { used = true; if (!story.facts.includes(f.id || 0)) story._touch = 1; } } catch (e) { console.warn('stories react', story.type, e); }
    }
    for (const story of s.stories) {
      if (story.st !== 'fim') continue; const def = DEF[story.type]; if (!def || !def.after) continue;
      try { if (def.after(story, f)) used = true; } catch (e) { console.warn('stories after', story.type, e); }
    }
    for (const t in DEF) {
      const def = DEF[t]; const h = def.on && def.on[f.k]; if (!h) continue;
      let seeds = null; try { seeds = h(f); } catch (e) { console.warn('stories seed', t, e); }
      if (seeds && seeds.length) { used = true; commit(f); for (const sd of seeds) plant(t, sd, f); }
    }
    if (used) commit(f);
    // stories that touched the fact keep it in their record (provenance of their chapters)
    for (const story of s.stories) if (story._touch) { delete story._touch; if (f.id && !story.facts.includes(f.id)) story.facts.push(f.id); }
    return f;
  }
  St.plantFrom = function (type, sd, fid) { const f = factById(fid) || { id: fid }; plant(type, Object.assign({ keyExtra: 'p' + fid }, sd), f); };
  function plant(type, sd, f) {
    const s = st(); const def = DEF[type];
    const key = type + ':' + sd.protag + ':' + (sd.keyExtra || f.id);
    if (s.seeds.some(q => q.key === key) || s.stories.some(q => q.key === key)) return;
    // one person does not carry the same kind of story twice at once — nor two seeds of it: the stronger stays
    if (s.stories.some(q => q.st === 'ativa' && q.type === type && q.protag === sd.protag)) return;
    const twin = s.seeds.findIndex(q => q.type === type && q.protag === sd.protag);
    if (twin >= 0) { if (s.seeds[twin].score >= sd.score) return; s.seeds.splice(twin, 1); }
    // a seed ripens a little before it can become a story: what happens right after (the same battle) settles first
    const seed = Object.assign({ key, type, born: G.S.day, ripe: G.S.clock + DAY() * (def.ripe !== undefined ? def.ripe : 0.3), life: def.seedLife || 4, origin: [f.id], src: f.src || 0, tone: def.tone, tags: def.tags.slice(), motifs: [] }, sd);
    seed.motifs = ['tipo:' + type, 'estrutura:' + def.struct, 'tom:' + seed.tone].concat(sd.motifs || []);
    s.seeds.push(seed);
    if (s.seeds.length > 40) { s.seeds.sort((a, b) => b.score - a.score); s.seeds.length = 40; }
  }

  // ---- a death ----
  OBS.death = function (d) {
    const v = d.v; if (!v) return;
    const violent = !!VIOLENT[d.cause], beastDeath = d.cause === 'beast' || d.cause === 'wolf' || d.cause === 'boar';
    const killer = d.killer ? P(d.killer) : null;
    const fam = kin(v);
    const f = draft('morte', { a: v.id, cause: d.cause, x: v.x, y: v.y, god: d.byGod ? 1 : 0, fa: v.fac !== undefined ? v.fac : facOf(v), cap: d.cap ? 1 : 0, n: { a: v.name } });
    if (killer && killer.id !== v.id) { f.b = killer.id; f.fb = facOf(killer); f.n.b = killer.name; }
    if (beastDeath && d.beast) { const a = G.S.animals.get(d.beast); f.beast = d.beast; f.bk = a ? a.kind : null; f.n.beast = a && a.named ? a.named : null; f.legend = a && a.legend ? 1 : 0; }
    f.n.place = where(v.x, v.y).at;
    // why: a war between the two peoples (provenance)
    if (violent && f.fb && f.fa && f.fa !== f.fb) { const wk = warKey(f.fa, f.fb); if (st().wars[wk]) f.src = st().wars[wk]; }
    // who saw it, who will hear of it — and who knows who did it
    f.w = []; f.kn = [];
    for (const o of fam) {
      const saw = awake(o) && o.age >= 5 && G.dist(o.x, o.y, v.x, v.y) < 9;
      if (saw) f.w.push(o.id);
      const famous = killer && (killer.hero || killer.reigned || d.cause === 'execution' || d.cause === 'coup' || (killer.kills || 0) >= 4);
      if (killer && (saw || famous)) f.kn.push(o.id);
    }
    offer(f);
    if (f.id) for (const o of fam) learn(o.id, f.id, f.w.includes(o.id) ? 'viu' : (f.kn.includes(o.id) ? 'boato' : 'soube'));
  };
  // ---- a capture, a release, an escape ----
  OBS.capture = function (d) {
    const o = d.o; if (!o || !o.captive) return;
    const f = draft('captura', { a: o.id, b: d.captor ? d.captor.id : 0, fa: o.captive.from, fb: facOf(o), set: o.set, home: o.captive.home, x: o.x, y: o.y, n: { a: o.name, b: d.captor ? d.captor.name : '', place: where(o.x, o.y).at, fb: facName(facOf(o)), set: setName(o.set) || '' } });
    const wk = warKey(f.fa, f.fb); if (st().wars[wk]) f.src = st().wars[wk];
    offer(f);
    if (f.id) for (const k of kin(o)) learn(k.id, f.id, G.dist(k.x, k.y, o.x, o.y) < 9 && awake(k) ? 'viu' : 'soube');
  };
  OBS.freed = function (d) { const v = d.v; if (!v) return; offer(draft('liberdade', { a: v.id, how: d.how || '', dest: d.dest || 0, x: v.x, y: v.y, n: { a: v.name } })); };
  OBS.escape = function (d) { const v = d.v; if (!v || !v.captive) return; offer(draft('fuga', { a: v.id, dest: d.dest || 0, from: facOf(v), set: v.set, since: v.captive.day, x: v.x, y: v.y, n: { a: v.name, dest: setName(d.dest) || '', set: setName(v.set) || '' } })); };
  OBS.freePeople = function (d) {
    const f = draft('povo-livre', { fac: d.fac, set: d.set, homes: d.homes, x: d.x, y: d.y, n: { fac: facName(d.fac), set: setName(d.set) || '' } });
    offer(f);
  };
  // ---- cities, peoples, wars ----
  OBS.conquer = function (d) {
    const S = G.S; const set = S.settlements.get(d.set); if (!set) return;
    const f = draft('conquista', { set: set.id, fa: d.from, fb: d.to, cap: d.cap ? 1 : 0, ruler: d.ruler || 0, x: set.cx, y: set.cy, n: { set: set.name, fa: facName(d.from), fb: facName(d.to) } });
    const wk = warKey(d.from, d.to); if (st().wars[wk]) f.src = st().wars[wk];
    offer(f);
  };
  OBS.extinct = function (d) { offer(draft('queda', { fac: d.fac, by: d.by || 0, n: { fac: d.name } })); };
  OBS.war = function (d) {
    const f = commit(draft('guerra', { fa: d.a, fb: d.b, why: d.why || '', story: d.story || 0, n: { fa: facName(d.a), fb: facName(d.b) } }));
    st().wars[warKey(d.a, d.b)] = f.id;
    offer(f);
  };
  OBS.peace = function (d) { offer(draft('paz', { fa: d.a, fb: d.b })); };
  OBS.crown = function (d) { offer(draft('coroa', { a: d.v, fac: d.fac, how: d.how || '' })); };
  // ---- beasts ----
  OBS.beastDied = function (d) { offer(draft('fera-morta', { beast: d.id, kind: d.kind, by: d.by || 0, byBeast: d.byBeast || 0, x: d.x, y: d.y, n: { beast: d.name || '', b: d.by ? (P(d.by) || {}).name : '' } })); };
  // ---- a tale by the fire: what children hear can become a lifelong wish ----
  OBS.tale = function (d) {
    if (!d.tale || d.tale.x === undefined || !d.kids || !d.kids.length) return;
    const t = d.tale; const pl = placeOfTale(t); if (!pl) return;
    const f = draft('conto', { a: d.teller, kids: d.kids.slice(0, 9), x: pl.x, y: pl.y, place: pl, n: { a: (P(d.teller) || {}).name || '', place: pl.name } });
    offer(f);
    if (f.id) for (const id of f.kids) learn(id, f.id, 'ouviu');
  };
  const warKey = (a, b) => (a < b ? a + ':' + b : b + ':' + a);

  // a tale's place: what was there, by the map (a peak, a lake, the sea, a cave, a wonder, a far city)
  function placeOfTale(t) {
    const S = G.S; const x = t.x, y = t.y;
    const ic = t.ic || '';
    if (G.Caves && (ic === 'cave' || ic === 'paint')) { let best = null, bd = 10; for (const cv of G.Caves.all()) { const d = G.dist(cv.cx, cv.cy, x, y); if (d < bd && cv.mouths.length) { bd = d; best = cv; } } if (best) { const m = best.mouths[0]; return { kind: 'caverna', name: G.Caves.a ? G.Caves.a(best) : best.name, x: m.x + 0.5, y: m.y + 0.5, ref: best.id }; } }
    if (ic === 'wonder') { for (const b of S.buildings.values()) if (b.type === 'maravilha' && G.dist(b.x, b.y, x, y) < 8) { const c = G.Village.center(b); const sp = W.nearestLand(c[0], c[1] + 2.5, 3) || [c[0], c[1] + 2]; return { kind: 'maravilha', name: 'a maravilha de ' + (setName(b.set) || 'longe'), x: sp[0], y: sp[1], ref: b.id, set: b.set }; } }
    if (ic === 'wave' || ic === 'sea' || ic === 'naval' || ic === 'ship' || ic === 'boat') { const sp = G.Sea && G.Sea.shellSpot ? G.Sea.shellSpot(x, y, 14) : null; if (sp) return { kind: 'mar', name: 'o mar', x: sp.x, y: sp.y }; }
    if (G.Relief && G.Relief.places) {
      let pl = null, pd = 8; for (const p of G.Relief.places()) { if (p.kind === 'passo') continue; const d = G.dist(x, y, p.x, p.y); if (d < pd) { pd = d; pl = p; } }
      if (pl) { const spot = W.nearestLand ? W.nearestLand(pl.x, pl.y, 6) : [pl.x, pl.y]; if (spot) return { kind: pl.kind, name: pl.name, x: spot[0], y: spot[1] }; }
    }
    if (ic === 'meteor' || ic === 'mountain') { const spot = W.nearestLand(x, y, 5); if (spot) return { kind: ic === 'meteor' ? 'cratera' : 'monte', name: ic === 'meteor' ? 'a cratera da estrela caída' : 'a montanha de fogo', x: spot[0], y: spot[1] }; }
    return null;
  }

  // ============================== the director ==============================
  // the motifs it has shown fade with time (half-life ~18 days); each family of motif weighs differently
  const MOTIF_W = { tipo: 0.22, estrutura: 0.18, tom: 0.08, rel: 0.06, gatilho: 0.08, clima: 0.12, fim: 0.1, amb: 0.04, lugar: 0.06, destino: 0.25, idade: 0.03, titulo: 0.35 };
  function remember(motifs, w) { const s = st(); s.mem.push({ d: G.S.day, m: motifs.slice(0, 12), w: w || 1 }); if (s.mem.length > 80) s.mem.splice(0, s.mem.length - 80); }
  function load(m) { const S = G.S; let l = 0; for (const e of st().mem) if (e.m.includes(m)) l += e.w * Math.pow(0.5, (S.day - e.d) / 14); return l; }
  function fatigue(motifs) {
    let f = 1;
    for (const m of motifs) f *= 1 - Math.min(0.6, load(m) * (MOTIF_W[m.split(':')[0]] || 0.12));
    return Math.max(0.25, f);
  }
  St.fatigue = fatigue;
  function capacity() { return Math.max(3, Math.min(9, Math.round(2.6 + G.S.villagers.size / 70))); }
  function worth(sd, active) {
    const S = G.S; const def = DEF[sd.type];
    let v = sd.score * Math.exp(-(S.day - sd.born) / Math.max(1, sd.life));
    v *= fatigue(sd.motifs);
    // pacing: not everything dark at once
    const dark = active.filter(x => x.tone === 'sombrio').length;
    if (sd.tone === 'sombrio' && dark >= 2) v *= Math.max(0.3, 0.8 - (dark - 2) * 0.18);
    else if (sd.tone !== 'sombrio' && dark >= 2) v *= 1.15;
    // recent tragedies make the director look for something else
    const tragic = load('fim:tragico'); if (sd.tone === 'sombrio') v *= Math.max(0.55, 1 - tragic * 0.12);
    // one person already carrying a story: a second one is rare
    if (active.some(x => x.protag === sd.protag)) v *= 0.3;
    // threads that cross (someone already in a story): a little more interesting
    if (sd.cast) for (const k in sd.cast) if (KIND_PERSON[k] && storiesOf(sd.cast[k]).length) { v *= 1.15; break; }
    // two of the same kind at once: less
    v *= Math.pow(0.55, active.filter(x => x.type === sd.type).length);
    // one battle, one story at a time: others born of the same war in the last days wait their turn
    if (sd.src) { const same = active.filter(x => x.src === sd.src && S.day - x.born < 2).length; if (same) v *= Math.pow(0.5, same); }
    if (def && def.valid && !def.valid(sd)) return 0;
    return v;
  }
  function direct() {
    const s = st(); const S = G.S;
    s.seeds = s.seeds.filter(sd => S.day - sd.born <= sd.life * 1.6 && DEF[sd.type] && alive(sd.protag) && (!DEF[sd.type].valid || DEF[sd.type].valid(sd)));
    const active = s.stories.filter(x => x.st === 'ativa');
    if (!s.seeds.length || active.length >= capacity()) return;
    if (S.clock - s.lastPromo < DAY() * (active.length < 2 ? 0.12 : 0.2)) return;
    let best = null, bv = 0;
    for (const sd of s.seeds) {
      if (sd.ripe && S.clock < sd.ripe) continue;
      // the dust settles first: nobody's story begins in the middle of their own fight
      const pv = P(sd.protag); if (pv && pv.task && (pv.task.type === 'combat' || pv.task.type === 'fight')) continue;
      const v = worth(sd, active); sd.w = Math.round(v * 100) / 100; if (v > bv) { bv = v; best = sd; }
    }
    const th = active.length < 2 ? 0.3 : active.length < capacity() - 2 ? 0.4 : 0.52;
    if (best && bv >= th) promote(best);
  }
  St.capacity = capacity;

  // ============================== stories ==============================
  function promote(sd) {
    const s = st(); const def = DEF[sd.type]; const S = G.S;
    s.seeds = s.seeds.filter(x => x !== sd && !(x.type === sd.type && x.origin[0] === sd.origin[0]));
    const p = P(sd.protag); if (!p) return null;
    const story = {
      id: s.ns++, key: sd.key, type: sd.type, st: 'ativa', protag: sd.protag, cast: Object.assign({}, sd.cast || {}), place: sd.place || null,
      origin: sd.origin.slice(), facts: sd.origin.slice(), born: S.day, phase: '', chapters: [], data: Object.assign({}, sd.data || {}),
      tone: sd.tone || def.tone, tags: (sd.tags || def.tags).slice(), motifs: sd.motifs.slice(), heat: Math.round(sd.score * 100) / 100,
      gen: 1, prev: [], fac: facOf(p), title: '', tk: '', alt: sd.alt || null, src: sd.src || 0,
    };
    def.begin(story, sd);
    // the opening chapter tells what happened — on the day it happened
    const of = factById(sd.origin[0]); if (of && story.chapters[0] && of.d < story.chapters[0].d) story.chapters[0].d = of.d;
    if (!story.title) titleOf(story);
    logline(story);
    s.stories.push(story);
    for (const id of people(story)) addIdx(id, story.id);
    s.lastPromo = S.clock;
    remember(story.motifs.concat(story.tk ? ['titulo:' + story.tk] : []), 1);
    announce(story, 'start');
    if (St._ui && St._ui.open) St.refresh();
    return story;
  }
  St._promote = promote;
  // the story in one sentence, as a book's back cover would say it
  function logline(story) { const d = DEF[story.type]; let t = null; try { t = d.logline ? d.logline(story, distinctNames(story, ctxOf(story))) : null; } catch (e) { t = null; } story.log = t || ''; }
  St.logline = logline;
  // the screen hears of it: a story begins, a climax, an end (the panel module draws the card)
  function announce(story, kind, txt) {
    if (St._announce) { try { St._announce(story, kind, txt); return; } catch (e) { console.warn('stories announce', e); } }
    if (kind === 'start') G.UI && G.UI.notice(`Uma história começou: ${story.title}`, 'saga');
    else if (txt) G.UI && G.UI.toast(story.title, txt, 'saga');
  }
  St.announce = announce;
  // a chapter: only what changes the story
  function chapter(story, txt, o) {
    o = o || {};
    const c = { d: G.S.day, txt };
    if (o.x !== undefined) { c.x = +(+o.x).toFixed(1); c.y = +(+o.y).toFixed(1); }
    if (o.big) c.big = 1; if (o.k) c.k = o.k; if (o.fact) c.f = o.fact;
    story.chapters.push(c);
    if (story.chapters.length > 24) story.chapters.splice(2, 1);
    if (o.log) G.Village.log(`${story.title}: ${txt}`, 'saga', c.x, c.y);
    if (o.toast) announce(story, 'beat', txt);
    if (o.hot && c.x !== undefined) hot(story, c.x, c.y, txt, o.hot);
    if (St._ui && St._ui.open) St.refresh();
    return c;
  }
  St.chapter = chapter;
  // a storylet: a small reusable beat with text variants (by culture, then by general), filled in with the story's people
  const BEATS = St.BEATS = {};
  St.storylet = (key, d) => { BEATS[key] = d; };
  // the words of a storylet for this story (variants of the protagonist's culture weigh double)
  function say(story, key, vars) {
    const b = BEATS[key]; if (!b) return null;
    const ctx = Object.assign(distinctNames(story, ctxOf(story)), vars || {});
    const civ = (P(story.protag) || {}).civ;
    const pool = b.civ && civ && b.civ[civ] ? b.civ[civ].concat(b.civ[civ], b.text) : b.text;
    const ok = []; pool.forEach((fn, i) => { let t = null; try { t = fn(ctx); } catch { t = null; } if (t) ok.push([i, t]); });
    if (!ok.length) return null;
    const r = recent[key] || (recent[key] = []); const fresh = ok.filter(o => !r.includes(o[0]));
    const o = hashPick(fresh.length ? fresh : ok, story.id * 31 + story.chapters.length * 7 + key.length);
    r.push(o[0]); if (r.length > Math.max(1, Math.floor(b.text.length / 2))) r.shift();
    return o[1];
  }
  St.say = say;
  function beat(story, key, vars, o) {
    const txt = say(story, key, vars); if (!txt) return null;
    return chapter(story, txt, Object.assign({ k: key }, (BEATS[key] && BEATS[key].o) || {}, o || {}));
  }
  St.beat = beat;
  // the words a story's texts are made of
  function ctxOf(story) {
    const p = P(story.protag); const c = story.cast;
    const N_ = id => { const q = P(id); return q ? q.name : (story.data.names && story.data.names[id]) || 'alguém'; };
    return {
      s: story, p, P: p ? p.name : '?', o: oa(p), ele: ele(p), del: p && p.g === 'f' ? 'dela' : 'dele', age: p ? Math.floor(p.age) : 0,
      alive: alive(story.protag), cityNow: p && !p.dead ? setName(p.set) || '' : '', an: n => (n === 1 ? 'um ano' : n + ' anos'),
      TITLE: p && !p.dead && p.reigned && G.Fac.get(p.reigned) ? G.Politics.title(G.Fac.get(p.reigned), p) : '',
      V: c.victim ? N_(c.victim) : '', oV: oa(P(c.victim)), T: c.target ? N_(c.target) : '', oT: oa(P(c.target)),
      C: c.captive ? N_(c.captive) : '', oC: oa(P(c.captive)), L: c.lost ? N_(c.lost) : '', oL: oa(P(c.lost)),
      REL: story.data.rel ? REL_POSS[story.data.rel] : '', RELde: story.data.rel ? REL_DE[story.data.rel] : '',
      X: story.place ? story.place.name : '', at: story.data.at || '', N: n => n, home: story.data.home ? (setName(story.data.home) || story.data.homeName || 'casa') : '',
      // (the people the story began in; beats about the protagonist's people today pass their own FP)
      FP: facName(story.fac), FT: story.data.ft ? facName(story.data.ft) : '', city: story.data.city ? (setName(story.data.city) || story.data.cityName || '') : '',
      B: story.data.beastName || '', yrs: Math.max(1, G.S.day - story.born),
    };
  }
  // two people of one story with the same name (Eir executed by order of Eir): the one who rules
  // is named by title, otherwise the other by their town — so a reader never mixes them up
  function distinctNames(story, x) {
    const c = story.cast; const roles = [['P', story.protag], ['V', c.victim], ['T', c.target], ['C', c.captive], ['L', c.lost]];
    const label = id => {
      const q = P(id); if (!q) return null;
      const f = q.reigned && G.Fac.get(q.reigned);
      if (f && !q.dead && G.Fac.get(q.reigned).leader === q.id) return G.Politics.styled(f, q);
      const t = setName(q.set); return t ? `${q.name} de ${t}` : null;
    };
    for (let i = 0; i < roles.length; i++) for (let j = i + 1; j < roles.length; j++) {
      const [a, ia] = roles[i], [b, ib] = roles[j];
      if (!ia || !ib || ia === ib || !x[a] || x[a] !== x[b]) continue;
      // the protagonist keeps the plain name; of the others, the one who rules is named by title first
      const qa = a !== 'P' ? label(ia) : null, qb = label(ib);
      const ra = !!(P(ia) && P(ia).reigned), rb = !!(P(ib) && P(ib).reigned);
      if (qb && (rb || !ra || !qa)) x[b] = qb; else if (qa) x[a] = qa;
    }
    return x;
  }
  St.ctx = ctxOf;
  function titleOf(story) {
    const def = DEF[story.type]; const ctx = ctxOf(story);
    const opts = [];
    for (const [k, fn] of Object.entries(def.titles || {})) { let t = null; try { t = fn(ctx); } catch (e) { t = null; } if (t) opts.push([k, t]); }
    if (!opts.length) { story.title = def.name; return; }
    // the title least seen lately, then by the story's own seed
    opts.sort((a, b) => load('titulo:' + story.type + ':' + a[0]) - load('titulo:' + story.type + ':' + b[0]) || G.hash(story.id * 13 + a[0].length) - G.hash(story.id * 13 + b[0].length));
    story.tk = story.type + ':' + opts[0][0]; story.title = opts[0][1];
  }
  // the end — and what the world will remember of it
  const END = {
    cumprida: 'Cumprida', tragica: 'Trágica', roubada: 'Roubada pelo destino', abandonada: 'Abandonada', esquecida: 'Esquecida',
    interrompida: 'Interrompida', transformada: 'Transformada', reencontro: 'Reencontro', fracassada: 'Fracassada', perdoada: 'Perdão',
  };
  const TONE = { feliz: 'feliz', tragico: 'trágico', agridoce: 'agridoce', sereno: 'sereno' };
  St.END = END; St.TONE = TONE;
  function finish(story, k, tone, txt, o) {
    if (story.st !== 'ativa') return;
    o = o || {};
    if (txt) chapter(story, txt, Object.assign({ k: 'fim' }, o, { toast: false }));
    story.st = 'fim'; story.end = { k, tone: tone || 'sereno', d: G.S.day };
    if (o.toast || o.big) announce(story, 'end', txt);
    remember(['tipo:' + story.type, 'fim:' + (tone || 'sereno'), 'fim:' + k].concat(o.clima ? ['clima:' + o.clima] : []), 0.7);
    if (DEF[story.type].retitle) { const t = DEF[story.type].retitle(story, ctxOf(story)); if (t) story.title = t; }
    reindex();
    // the protagonist's own life remembers it
    const p = P(story.protag); if (p && G.Life && o.bio !== false) G.Life.bio(p, 'note', `${story.title}: ${txt || END[k]}`);
    // an exceptional story becomes a legend
    const span = G.S.day - story.born;
    if (G.Lore && (story.gen >= 2 || (span >= 25 && story.chapters.length >= 5) || (o.legend && span >= 8))) {
      G.Lore.legend('saga:' + story.id, story.title, `${story.chapters[0] ? story.chapters[0].txt : ''} ${txt || ''}`.trim(), { kind: 'saga', ref: story.protag });
    }
    const s = st(); const ended = s.stories.filter(x => x.st === 'fim');
    if (ended.length > 48) { const drop = ended.slice(0, ended.length - 48); s.stories = s.stories.filter(x => !drop.includes(x)); }
    if (St._ui && St._ui.open) St.refresh();
  }
  St.finish = finish;
  // when the one who carried it dies: sometimes someone close takes it up
  function bequeath(story, dead, why) {
    const def = DEF[story.type]; if (!def.heirs || story.gen >= 3) return false;
    let best = null, bs = 0;
    for (const c of kin(dead)) {
      if (c.age < (def.heirs.minAge || 12) || c.captive) continue;
      const r = relOf(dead, c); if (!r) continue;
      let sc = (REL_W[r] || 0.4) * (c.set === dead.set ? 1 : 0.45) * def.heirs.fit(story, c) * (0.65 + Math.min(0.5, story.heat * 0.4));
      if (storiesOf(c.id).some(x => x.protag === c.id)) sc *= 0.4;
      if (sc > bs) { bs = sc; best = c; }
    }
    if (!best || bs < 0.55 || G.R() > (def.heirs.chance || 0.4)) return false;
    const r = relOf(best, dead);
    const ctx = ctxOf(story); ctx.H = best.name; ctx.oH = oa(best); ctx.DEADREL = r ? REL_POSS[r] : 'quem partiu'; ctx.why = why;
    const txt = def.heirs.text(story, ctx, why);
    story.prev.push(story.protag); story.protag = best.id; story.gen++; story.fac = facOf(best);
    if (def.inherited) def.inherited(story, best, dead, why);
    const rv = P(story.cast.victim || story.cast.captive || story.cast.lost); if (rv) story.data.rel = relOf(best, rv) || story.data.rel;
    chapter(story, txt, { k: 'heranca', log: true, big: 1, x: best.x, y: best.y });
    logline(story);
    if (G.Life) G.Life.bio(best, 'note', `${story.title}: ${txt}`);
    remember(['heranca', 'tipo:' + story.type], 0.5);
    addIdx(best.id, story.id);
    return true;
  }
  St.bequeath = bequeath;
  // the camera's moments: a climax that deserves to be seen
  St.hotList = [];
  function hot(story, x, y, txt, secs) { St.hotList = St.hotList.filter(h => G.S.clock < h.until && h.story !== story.id); St.hotList.push({ story: story.id, x, y, txt, until: G.S.clock + (secs === true ? 30 : secs), born: G.S.clock }); }

  // ============================== archetypes ==============================
  // St.define(type, def): the registry. A def has
  //   name, icon, tone, tags, struct (its semantic shape, for the director's variety), seedLife
  //   on: { factKind: fact => [seeds] }    salience: who could carry a story out of this fact, how strongly
  //   valid(seed), begin(story, seed)       a seed still possible? the first chapter, the title
  //   tick(story), react(story, fact)       polling the world, reacting to new facts (true if it mattered)
  //   urge(story, v), task(story, v, H)     a little of the protagonist's free time
  //   status(story), goal(story), open(story), obstacles(story)   for the panel and the future adventure mode
  //   heirs: { minAge, chance, fit(story, cand), text(story, ctx, why) }    who may take it up
  //   titles: { key: ctx => title|null }, retitle(story, ctx)
  const DEF = St.DEF = {};
  St.define = function (type, d) { d.type = type; DEF[type] = d; };

  // ============================== behaviour ==============================
  // the wish to give some free time to the story (0 none .. ~0.35)
  St.urge = function (v) {
    // needs and emergencies come first: a hungry or exhausted person does not chase a story
    if (v.hunger > 70 || v.energy < 25 || v.hp < 45 || v.captive || v.held) return 0;
    let u = 0; for (const s of storiesOf(v.id)) { if (s.protag !== v.id || (s.data.retry && G.S.clock < s.data.retry)) continue; const d = DEF[s.type]; if (d.urge) { const w = d.urge(s, v) || 0; if (w > u) u = w; } }
    return u;
  };
  St.task = function (v, H) {
    let best = null, bu = 0;
    for (const s of storiesOf(v.id)) { if (s.protag !== v.id || (s.data.retry && G.S.clock < s.data.retry)) continue; const d = DEF[s.type]; const w = d.urge ? d.urge(s, v) || 0 : 0; if (w > bu) { bu = w; best = s; } }
    if (!best) return null;
    return DEF[best.type].task ? DEF[best.type].task(best, v, H) : null;
  };
  // the story's own errands: to go somewhere and stay a while (a journey, a vigil, a prayer)
  // (once on the road it holds against the day's work, but not against hunger, night, a storm or danger)
  St.go = function (story, v, H, o) {
    const t = H.setTask(v, Object.assign({ type: 'saga', story: story.id, pri: 1.02, st: 0, x: o.x, y: o.y, dur: o.dur || 8, act: o.act || '', sub: o.sub || 'ir', max: o.max || 160 }, o));
    return t;
  };
  // a real road: provisions from home, the way there (camping when the night catches them, eating
  // what they carried), the moment at the end of it, and — for most — the way back home
  St.journey = function (story, v, H, o) {
    const S = G.S; const set = S.settlements.get(v.set); const hb = S.buildings.get(v.home);
    const hp = hb && hb.built ? G.Village.frontTile(hb) : set ? [set.cx, set.cy] : [v.x, v.y];
    // (a traveller is not called back to fetch water or join a feast; hunger, danger and war still win)
    const t = H.setTask(v, Object.assign({ type: 'saga', j: 1, story: story.id, pri: 2.05, st: 0, leg: 0, legs: 2, hx: hp[0], hy: hp[1], dur: 12, act: '', emo: '', sub: 'jornada', max: 1600, food: 0, camps: 0, homeBiome: St.biomeAt ? St.biomeAt(v.x, v.y) : '' }, o));
    if (o.back === false) t.legs = 1;
    if (!t.leg) { const stk = G.Fac.stockV(v); const n = stk && stk.food >= 8 ? 2 : stk && stk.food >= 3 ? 1 : 0; if (n) { stk.food -= n; t.food = n; } }
    story.data.hx = +hp[0].toFixed(1); story.data.hy = +hp[1].toFixed(1);
    return t;
  };
  function trail(story, v) {
    const tr = story.data.trail || (story.data.trail = []); const last = tr[tr.length - 1];
    if (!last || G.dist(last[0], last[1], v.x, v.y) > 3) { tr.push([+v.x.toFixed(1), +v.y.toFixed(1)]); if (tr.length > 60) tr.splice(1, 1); }
  }
  St.trail = trail;
  function runJourney(v, t, dt, H, story) {
    const d = DEF[story.type]; const S = G.S;
    if (t.age > t.max) return H.end(v);
    const back = t.leg === 1; const tx = back ? t.hx : t.x, ty = back ? t.hy : t.y;
    // the bundle: they eat what they carried when the hunger comes
    if (v.hunger > 62 && t.food > 0) { t.food--; v.hunger = Math.max(0, v.hunger - 55); G.Vg.emote(v, 'food', 1.4); }
    if (t.st === 0) {
      if (!H.goto(v, tx, ty, false, 30000) && !H.goto(v, tx, ty, true, 30000)) { if (!back) { story.data.retry = S.clock + DAY() * 0.7; if (d.blocked) d.blocked(story, v, t); } return H.end(v); }
      t.st = 1; return;
    }
    if (t.st === 1) {
      // night falls on the road: a small fire, sleep, and on again at first light
      // (only on dry ground: someone wading a ford walks on to the far bank first)
      if (G.isNight() && !t.noCamp && W.dryXY(v.x, v.y) && G.dist(v.x, v.y, tx, ty) > 6 && G.dist(v.x, v.y, t.hx, t.hy) > 9) {
        t.st = 4; v.path = null; v.moving = false; t.cx = +(v.x + 0.55).toFixed(2); t.cy = +(v.y + 0.25).toFixed(2); t.camps++; if (d.camp) d.camp(story, v, t); return;
      }
      if ((t.rw = (t.rw || 0) + dt) > 2.5) { t.rw = 0; trail(story, v); if (d.road && St.roadWatch) { const r = St.roadWatch(story, v, t); if (r) d.road(story, v, t, r); } }
      if (H.move(v, dt, t.hurry || 1)) {
        trail(story, v);
        if (back) { if (d.home) d.home(story, v, t); return H.end(v); }
        t.st = 2; v.actT = 0; t.left = t.dur; if (d.arrive) d.arrive(story, v, t);
      }
      return;
    }
    if (t.st === 2) {
      v.moving = false; v.act = t.act || ''; if (t.fx !== undefined) G.faceTo(v, t.fx - v.x, t.fy - v.y);
      if (t.emo && G.R() < dt * 0.2) G.Vg.emote(v, t.emo, 1.4);
      t.left -= dt;
      if (t.left <= 0) {
        // (an archetype may keep the moment going — waiting for the dark — or hand over to its own steps)
        if (d.done && d.done(story, v, t) === 'stay') return;
        if (v.task !== t) return;
        if (story.st !== 'ativa') return H.end(v);
        if (t.legs > 1) { t.leg = 1; t.st = 0; t.road = []; } else H.end(v);
      }
      return;
    }
    if (t.st >= 6) { if (d.step) d.step(story, v, t, dt, H); else H.end(v); return; }
    if (t.st === 4) {
      v.moving = false; v.sleeping = true; v.act = 'sleep';
      if (G.R() < dt * 0.25) G.Vg.emote(v, 'zzz', 1.5);
      if (!G.isNight()) { v.sleeping = false; t.st = 0; }
    }
  }
  St.run = function (v, t, dt, H) {
    const story = getStory(t.story); if (!story || story.st !== 'ativa') return H.end(v);
    if (t.j) return runJourney(v, t, dt, H, story);
    if (t.age > t.max) return H.end(v);
    if (t.st === 0) {
      // no way there today: try again another day (the archetype decides when to give up)
      if (!H.goto(v, t.x, t.y, false, 24000) && !H.goto(v, t.x, t.y, true, 24000)) { story.data.retry = G.S.clock + DAY() * 0.7; const d = DEF[story.type]; if (d.blocked) d.blocked(story, v, t); return H.end(v); }
      t.st = 1;
    } else if (t.st === 1) {
      // going to a person who moves (a captive at work): follow them until close
      if (t.follow) {
        const o = P(t.follow); if (!o || o.dead) return H.end(v);
        t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 2; if (!H.goto(v, o.x, o.y, true, 12000)) return H.end(v); }
        H.move(v, dt, t.hurry || 1);
        if (G.dist(v.x, v.y, o.x, o.y) < 1.7) { t.st = 2; v.actT = 0; t.left = t.dur; t.fx = o.x; t.fy = o.y; v.path = null; const d = DEF[story.type]; if (d.arrive) d.arrive(story, v, t); }
        return;
      }
      if (H.move(v, dt, t.hurry || 1)) { t.st = 2; v.actT = 0; t.left = t.dur; const d = DEF[story.type]; if (d.arrive) d.arrive(story, v, t); }
    } else {
      v.moving = false; v.act = t.act || ''; if (t.fx !== undefined) G.faceTo(v, t.fx - v.x, t.fy - v.y);
      if (t.emo && G.R() < dt * 0.2) G.Vg.emote(v, t.emo, 1.4);
      t.left -= dt; if (t.left <= 0) { const d = DEF[story.type]; if (d.done) d.done(story, v, t); if (v.task === t) H.end(v); }
    }
  };
  St.taskText = function (v, t) {
    const story = getStory(t.story); if (!story) return 'Pensando na vida';
    const d = DEF[story.type]; return (d.taskText && d.taskText(story, v, t)) || story.title;
  };
  // war: who volunteers, whom to look for in the fight, what a ruler leans to
  St.warPull = function (v, enemyFid) { let w = 0; for (const s of storiesOf(v.id)) { if (s.protag !== v.id) continue; const d = DEF[s.type]; if (d.warPull) w = Math.max(w, d.warPull(s, v, enemyFid) || 0); } return w; };
  St.foeOf = function (v) { for (const s of storiesOf(v.id)) { if (s.protag !== v.id) continue; const d = DEF[s.type]; if (d.foe) { const id = d.foe(s, v); if (id) return id; } } return 0; };
  St.warLean = function (a, b) {
    const r = P(a.leader) ? P(a.leader) : null; if (!r) return null;
    for (const s of storiesOf(r.id)) { if (s.protag !== r.id) continue; const d = DEF[s.type]; if (d.lean) { const l = d.lean(s, a, b); if (l) return l; } }
    return null;
  };
  St.warTarget = function (f, enemy) {
    for (const s of st().stories) { if (s.st !== 'ativa') continue; const d = DEF[s.type]; if (d.target) { const t = d.target(s, f, enemy); if (t) return t; } }
    return 0;
  };

  // ============================== the loop ==============================
  let tAcc = 0;
  St.update = function (dt) {
    const S = G.S; if (!S) return;
    if (idxFor !== S) reindex();
    flush();
    tAcc += dt; if (tAcc < 1.5) return; tAcc = 0;
    const s = st();
    if (St.lookAround) St.lookAround(Math.max(4, Math.ceil(S.villagers.size / 10)));
    for (const story of s.stories) {
      if (story.st !== 'ativa') continue;
      const d = DEF[story.type]; if (!d) { story.st = 'fim'; story.end = { k: 'interrompida', tone: 'sereno', d: S.day }; continue; }
      try { if (d.tick) d.tick(story); } catch (e) { console.warn('stories tick', story.type, e); }
      // the furthest step it reached (for the panel's track, even when it ends badly)
      if (d.stage && story.st === 'ativa') { const k = d.stage(story); if (k > (story.data.stg || 0)) story.data.stg = k; }
      // nobody left to carry it, and nothing said: it ends quietly
      if (story.st === 'ativa' && !alive(story.protag) && !story.data.waitHeir) finish(story, 'interrompida', 'sereno', `${(P(story.protag) || {}).name || 'Quem a carregava'} se foi, e a história parou ali.`);
      if (story.st === 'ativa' && S.day - story.born > (d.maxDays || 70)) finish(story, 'esquecida', 'sereno', d.forgotten ? d.forgotten(story, ctxOf(story)) : 'O tempo passou, e ninguém mais falou disso.');
    }
    direct();
    // keep only the facts something still points to
    if (S.clock % 60 < 1.6) prune();
  };
  function prune() {
    const s = st(); const S = G.S; const keep = new Set();
    for (const x of s.stories) { for (const id of x.facts) keep.add(id); for (const id of x.origin) keep.add(id); }
    for (const sd of s.seeds) for (const id of sd.origin) keep.add(id);
    for (const k in s.wars) keep.add(s.wars[k]);
    s.facts = s.facts.filter(f => keep.has(f.id) || S.day - f.d < 30);
    if (s.facts.length > 500) s.facts = s.facts.filter(f => keep.has(f.id)).concat(s.facts.filter(f => !keep.has(f.id)).slice(-200));
    const live = new Set(s.facts.map(f => f.id));
    for (const pid in s.know) { s.know[pid] = s.know[pid].filter(e => live.has(e[0])); if (!s.know[pid].length || !P(+pid)) delete s.know[pid]; }
    for (const k in s.wars) if (!live.has(s.wars[k])) delete s.wars[k];
    factFor = null;
  }

  // ============================== the future adventure mode ==============================
  // everything a story is, in one place: who, where, what they want, what stands in the way, what
  // started it and what is still open. The panel uses it; an incarnated player will.
  St.context = function (id) {
    const story = getStory(id); if (!story) return null;
    const def = DEF[story.type]; const p = P(story.protag);
    const who = pid => { const q = P(pid); if (!q) return null; return { id: q.id, name: q.name, alive: !q.dead, x: q.dead ? null : q.x, y: q.dead ? null : q.y, age: Math.floor(q.age), set: q.dead ? null : q.set, fac: facOf(q), job: q.dead ? null : q.role, captive: !!q.captive, traits: q.traits || [] }; };
    const parts = [];
    for (const k in story.cast) if (KIND_PERSON[k] && story.cast[k]) { const w = who(story.cast[k]); if (w) parts.push(Object.assign(w, { role: k })); }
    for (const id of story.prev) { const w = who(id); if (w) parts.push(Object.assign(w, { role: 'antes' })); }
    return {
      id: story.id, type: story.type, kind: def.name, title: story.title, state: story.st, phase: story.phase, tone: story.tone, tags: story.tags,
      protagonist: who(story.protag), participants: parts, place: story.place,
      goal: def.goal ? def.goal(story, ctxOf(story)) : '', situation: def.status ? def.status(story, ctxOf(story)) : '',
      obstacles: def.obstacles ? def.obstacles(story, ctxOf(story)) : [], open: def.open ? def.open(story, ctxOf(story)) : [],
      origin: story.origin.map(factById).filter(Boolean).map(f => ({ id: f.id, kind: f.k, day: f.d, x: f.x, y: f.y, cause: f.src || null })),
      known: p ? (st().know[p.id] || []).map(e => ({ fact: e[0], how: e[1], day: e[2] })) : [],
      chapters: story.chapters.slice(), end: story.end || null, generation: story.gen, previous: story.prev.slice(),
    };
  };
  // why did this start? the chain of facts behind a story's first fact
  St.why = function (id) {
    const story = getStory(id); if (!story) return [];
    const out = []; let f = factById(story.origin[0]); let guard = 0;
    while (f && guard++ < 6) { out.push(f); f = f.src ? factById(f.src) : f.story ? null : null; }
    return out;
  };

  // ============================== save ==============================
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.saga) { const s = G.S.saga; out.saga = { v: s.v, facts: s.facts, nf: s.nf, seeds: s.seeds, stories: s.stories, ns: s.ns, mem: s.mem, know: s.know, wars: s.wars, lastPromo: Math.round(s.lastPromo) }; } },
    load(o) { G.S.saga = o.saga ? Object.assign(fresh(), o.saga) : null; idxFor = null; factFor = null; pending.length = 0; St.hotList = []; },
  });

  // ============================== the world, observed ==============================
  // (wrapping the world's own functions keeps the story logic here, in one place)
  function wrap(obj, name, after, before) {
    const orig = obj && obj[name]; if (typeof orig !== 'function') return;
    obj[name] = function () {
      const pre = before ? before.apply(this, arguments) : null;
      const r = orig.apply(this, arguments);
      try { after.call(this, r, arguments, pre); } catch (e) { console.warn('stories hook', name, e); }
      return r;
    };
  }
  St.init = function () {
    // a death: the victim, the killer, the beast — read before the world forgets
    wrap(G.Village, 'kill', (r, a, pre) => { if (pre) St.signal('death', pre); }, (v, cause, byGod) => {
      if (!v || !G.S.villagers.has(v.id)) return null;
      return { v, cause, byGod: !!byGod, killer: v.lastBy || 0, beast: v.lastBeastId || 0, cap: !!v.captive };
    });
    wrap(G.War, 'capture', (r, a) => St.signal('capture', { o: a[0], captor: a[1], b: a[2] }));
    wrap(G.War, 'freeCaptive', (r, a, pre) => { if (pre) St.signal('freed', { v: a[0], dest: a[1] ? a[1].id : 0, how: a[2] }); }, v => !!(v && v.captive));
    wrap(G.War, 'startEscape', (r, a) => { if (r) { const t = a[0].task; St.signal('escape', { v: a[0], dest: t && t.to }); } });
    wrap(G.War, 'foundFree', (nf, a, pre) => { if (nf && pre) { const set = G.Fac.capitalOf(nf.id); St.signal('freePeople', { fac: nf.id, set: set ? set.id : 0, homes: pre, x: set ? set.cx : 0, y: set ? set.cy : 0 }); } }, vs => (vs || []).map(v => [v.id, v.captive ? v.captive.home : 0, v.captive ? v.captive.from : 0]));
    wrap(G.War, 'conquer', (r, a, pre) => { if (pre && a[0].fac !== pre.from) St.signal('conquer', { set: a[0].id, from: pre.from, to: a[0].fac, cap: pre.cap, ruler: pre.ruler }); }, set => {
      const f = G.Fac.get(set.fac); return { from: set.fac, cap: G.Fac.capitalOf(set.fac) === set, ruler: f ? f.leader : 0 };
    });
    wrap(G.War, 'onPeace', (r, a) => { if (a[0] && a[1]) St.signal('peace', { a: a[0].id, b: a[1].id }); });
    wrap(G.Politics, 'extinct', (r, a, pre) => { if (pre) St.signal('extinct', { fac: a[0].id, name: a[0].name, by: a[1] ? a[1].id : 0 }); }, f => !!(f && f.alive));
    wrap(G.Politics, 'declareWar', (r, a, pre) => { if (pre && G.Fac.atWar(a[0].id, a[1].id)) St.signal('war', { a: a[0].id, b: a[1].id, why: a[2], story: St._leanStory || 0 }); St._leanStory = 0; }, (x, y) => !G.Fac.atWar(x.id, y.id));
    wrap(G.Politics, 'crown', (r, a) => { if (a[1]) St.signal('crown', { fac: a[0].id, v: a[1].id, how: a[2] }); });
    wrap(G.Animals, 'kill', (r, a, pre) => { if (pre && a[0].dead) { const by = a[1]; St.signal('beastDied', { id: a[0].id, kind: a[0].kind, name: a[0].named, x: a[0].x, y: a[0].y, by: by && !by.kind ? by.id : 0, byBeast: by && by.kind ? by.id : 0 }); } }, an => !!(an && !an.dead));
  };
})(window.G);
