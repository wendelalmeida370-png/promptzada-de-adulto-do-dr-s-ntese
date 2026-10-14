'use strict';
// ============================================================
//  Possess: one body of the world, lent to the player. The god
//  does not make a hero: the person stays who they are — the
//  same id, name, age, trade, family, home, people, health,
//  memories, stories. Only the will that moves the body changes
//  hands. The truth of it is one record, S.avatar (only this
//  file writes it), and one task, { type: 'avatar', pri: 100 }
//  (only this file gives it). While it lasts:
//    · the body's needs go on — hunger, tiredness, age, sickness,
//      wounds: a mortal stays mortal (villagers.js runs needs);
//    · the person's own deciding stops — no emergency, no
//      decide, no runTask (villagers.js asks Possess.live);
//    · orders from the world are of two kinds (setTask asks here):
//      a request (the call to arms, a fire to put out, a feast)
//      does not take the body — it becomes a call the player
//      sees and may answer or not; a force of the world (prison,
//      captivity, the sea, a ship) takes the body back: the
//      incarnation ends and the person's life goes on;
//    · death is death: it is recorded like any other, and the
//      player goes back to being a god (no one is restored).
//  Giving the body back leaves no hanging reference: the task
//  goes, the path goes, and the person decides from where they
//  stand on the next step (qa.js 'avatar' checks all of it).
//  What kind of body it is (a mortal human now; something
//  extraordinary, or the god's own avatar, later) is a kind with
//  capabilities — the controller asks what the body can do,
//  never "is it a human?".
// ============================================================
(function (G) {
  const W = G.W;
  const Po = G.Possess = { onEnd: [], onLog: [] };
  // the kinds of incarnation: what the body of each can do (the future ones are only named, not made)
  const KINDS = {
    humano: { label: 'Humano mortal', mortal: true, swim: false, climb: false, glide: false, dive: false },
    // extraordinario: { … }, avatarDivino: { … } — capacidades acima do humano (D-018: reservado, não implementado)
  };
  Po.KINDS = KINDS;
  let cur = null; // (the body's villager object, for the cause of a death the loop finds late; cleared with the world)
  G.worldHooks.push(() => { cur = null; });

  Po.id = () => (G.S && G.S.avatar ? G.S.avatar.id : 0);
  Po.on = () => !!(G.S && G.S.avatar);
  Po.body = () => { const id = Po.id(); return id ? G.S.villagers.get(id) || null : null; };
  Po.is = v => !!(v && G.S && G.S.avatar && G.S.avatar.id === v.id);

  // ------------------------------ who can be lived ------------------------------
  const oa = v => (v.g === 'f' ? 'a' : 'o');
  Po.can = function (v) {
    const S = G.S;
    if (!v || !S || !S.villagers.has(v.id)) return { ok: false, why: 'Esta pessoa não está mais entre os vivos.' };
    if (v.age < 6) return { ok: false, why: `${v.name} é pequen${oa(v)} demais para andar por aí sozinh${oa(v)}.` };
    if (v.held) return { ok: false, why: `${v.name} está nas suas mãos.` };
    if (v.air) return { ok: false, why: `${v.name} está voando pelos ares.` };
    if (v.aboard) return { ok: false, why: `${v.name} está a bordo de um navio — o mar em 3D ainda não existe.` };
    if (v.ug) return { ok: false, why: `${v.name} está dentro de uma caverna — as cavernas em 3D ainda não existem.` };
    if (v.jail) return { ok: false, why: `${v.name} está pres${oa(v)}.` };
    if (v.captive) return { ok: false, why: `${v.name} é cativ${oa(v)}: o corpo pertence a quem ${v.g === 'f' ? 'a' : 'o'} prendeu (a fuga será uma aventura futura).` };
    const t = v.task;
    if (t && (t.type === 'scene')) return { ok: false, why: `${v.name} está no meio de uma cena da história.` };
    if (t && (t.type === 'condemned' || t.type === 'escorted' || t.type === 'swim' || t.type === 'cela')) return { ok: false, why: `${v.name} não está em condições agora.` };
    if (!v.inside) { const s = G.Space.surface(v.x * G.Space.TILE, v.y * G.Space.TILE); if (!s.walk) return { ok: false, why: `${v.name} não está em chão firme.` }; }
    return { ok: true };
  };
  // what the body can do, from the person (age, a lost leg, sickness, tiredness) and the kind of incarnation
  Po.caps = function (v) {
    const a = G.S.avatar; const K = KINDS[(a && a.kind) || 'humano'] || KINDS.humano;
    const leg = !!(v.lost && v.lost.leg), kid = v.age < 12, old = v.age >= 62, very = v.age >= 75;
    // walking: the world's own pace for this person, in metres per second of the body's time (G.Space.TIME)
    const walk = (v.speed || 1.35) * G.Space.TILE * G.Space.TIME * (kid ? 0.85 : old ? 0.78 : 1) * (leg ? 0.6 : 1) * (v.sick > 0 ? 0.8 : 1);
    return {
      walk, run: !leg && !very ? (kid ? 1.75 : old ? 1.45 : 2.05) : 1, jump: !leg && !very ? (kid ? 0.55 : old ? 0.4 : 0.85) : 0,
      stamina: kid ? 70 : old ? 55 : 100, swim: K.swim, climb: K.climb, glide: K.glide, dive: K.dive, mortal: K.mortal,
    };
  };

  // ------------------------------ taking and giving back ------------------------------
  Po.take = function (v, kind) {
    const S = G.S; const c = Po.can(v); if (!c.ok) return c;
    if (S.avatar) Po.release('troca');
    // (the errand stops where it is; one inside is let out at the door)
    G.Vg.endTask(v);
    v.sleeping = false; v.path = null; v.act = ''; v.actT = 0; v.moving = false; v.z = 0;
    S.avatar = { id: v.id, kind: KINDS[kind] ? kind : 'humano', since: S.day, t0: S.clock, x0: +v.x.toFixed(2), y0: +v.y.toFixed(2), asks: [], deeds: {}, seen: [], met: [] };
    G.Vg.setTask(v, { type: 'avatar', pri: 100, st: 0 });
    cur = v;
    return { ok: true };
  };
  // the body goes back to its own life: every reason ends here ('deus' the player chose; 'forca' the world took it;
  // 'troca' another body; 'morte' is died())
  Po.release = function (why, detail, keepTask) {
    const S = G.S; const a = S.avatar; if (!a) return null;
    const v = S.villagers.get(a.id);
    S.avatar = null; cur = null;
    if (v) {
      if (!keepTask && v.task && v.task.type === 'avatar') { v.task = null; }
      if (!keepTask) { v.path = null; v.act = ''; v.sleeping = false; }
      v.think = 0; v.scan = 0; v.moving = false; v.carried = false;
      record(v, a, why);
    }
    for (const f of Po.onEnd) f(why, v, detail, a);
    return v;
  };
  function died(rec, cause, a) {
    const S = G.S; if (!a) return;
    S.avatar = null; cur = null;
    record(rec, a, 'morte', cause);
    for (const f of Po.onEnd) f('morte', rec, cause, a);
  }
  // what the time in the body leaves in the world: a line of the biography, a line of the chronicle
  function record(v, a, why, cause) {
    const S = G.S; const days = Math.max(0, S.day - a.since); const dd = summary(a.deeds);
    if (why !== 'morte') G.Life && G.Life.bio(v, 'god', days, dd);
    else if (v.bio) { v.bio.push([S.day, 'god', days, dd, 1]); }
    const set = S.settlements.get(v.set);
    if (why === 'morte') {
      // (the death is already in the chronicle when the world tells of it: that line says it happened in the god's body)
      const dt = G.Village.deathText({ ...v, cause }); const H = S.history; let told = false;
      for (let k = H.length - 1, m = 0; k >= 0 && m < 12; k--, m++) { const e = H[k]; if (e.d !== S.day) break; if (e.txt.includes(v.name) && e.txt.includes(dt)) { e.txt = e.txt.replace(/\.$/, '') + ' — com o deus vivendo em seu corpo.'; told = true; break; } }
      if (!told) G.Village.log(`${v.name}${set ? ' de ' + set.name : ''} ${dt} — com o deus vivendo em seu corpo.`, 'skull', v.x, v.y);
    }
    else if (days >= 1 || Object.keys(a.deeds).length >= 3) G.Village.log(`${v.name}${set ? ' de ' + set.name : ''} viveu ${days >= 1 ? days + (days > 1 ? ' dias' : ' dia') : 'um tempo'} guiad${oa(v)} pelo deus.`, 'eye', v.x, v.y);
    G.Stories && G.Stories.signal('avatarEnd', { id: v.id, set: v.set, why, days, deeds: Object.assign({}, a.deeds), x: v.x, y: v.y });
  }
  // the deeds counted (kind → how many), as the short words a biography keeps
  // (every kind of deed, in the order of DEED — the people met first; none dropped: the biography tells what was done)
  function summary(d) { return Object.keys(DEED).filter(k => d[k] > 0).map(k => k + ':' + Math.round(d[k])).join('|'); }
  Po.summary = summary;

  // ------------------------------ orders from the world ------------------------------
  // (setTask asks here before an order reaches the body: null lets it through, a task is what the body keeps doing)
  const FORCE = { jail: 'a justiça', cela: 'a justiça', condemned: 'a justiça', escorted: 'o cativeiro', aboard: 'o mar', embark: 'o mar', swim: 'a água' };
  Po.FORCE = FORCE;
  Po.ask = function (v, t) {
    if (!t || t.type === 'avatar') return null;
    if (FORCE[t.type]) { Po.release('forca', t.type); return null; }
    call(v, t);
    // (someone may have ended the body's task just before giving the order — a fire in the house: the body stays the player's)
    if (!v.task || v.task.type !== 'avatar') v.task = mark();
    return v.task;
  };
  const mark = () => ({ type: 'avatar', pri: 100, st: 0, age: 0 });
  // a call: what the world asked of the body, kept for the player (the base of duties and their breaking, later)
  const CALL = {
    muster: 'Seu povo te chama às armas.', band: 'Seu povo te chama às armas.', army: 'O exército te espera.', defend: 'A vila está sendo atacada — pegue em armas!',
    fire: 'Fogo! Todos correm para apagar.', flee: 'Gritam para você fugir!', panic: 'O pânico tomou as ruas.', riot: 'A multidão te chama para o motim.', riotguard: 'A guarda te chama.',
    fest: 'Há festa na praça.', assembly: 'Chamam todos para a assembleia.', migrate: 'Seu povo vai partir em migração.', refugio: 'Chamam todos para o refúgio.', pray: 'Hora de rezar no templo.',
    dragao: 'Chamam todos para enfrentar o dragão!', sair: 'O mar vai voltar! Saia do fundo do mar!', hide: 'Mandam você se esconder.', saga: 'Uma história te chama.',
  };
  function call(v, t) {
    const S = G.S; const a = S.avatar; if (!a) return;
    const txt = CALL[t.type] || (() => { const tt = G.Vg.taskText(Object.assign({}, v, { task: t, held: false, air: false })); return tt ? 'Esperam que você: ' + tt.charAt(0).toLowerCase() + tt.slice(1) + '.' : null; })();
    if (!txt) return;
    const q = a.asks.find(o => o.type === t.type);
    if (q) { q.t = S.clock; q.n++; return; }
    a.asks.push({ type: t.type, txt, t: S.clock, t0: S.clock, n: 1 });
    if (a.asks.length > 6) a.asks.shift();
  }
  Po.calls = () => (G.S.avatar ? G.S.avatar.asks.slice() : []);

  // ------------------------------ the body's own step ------------------------------
  // (villagers.js calls this instead of emergency/decide/runTask: the will is the player's)
  Po.live = function (v, dt) {
    // (a task ended by someone else without another given: the body is still the player's)
    if (!v.task) v.task = mark();
    if (v.sleeping && (v.energy >= 99.5 || (v.energy > 70 && G.S.time > 0.05 && G.S.time < 0.3))) Po.wake(v);
    void dt;
  };
  Po.sleep = function (v) { if (!Po.is(v) || v.sleeping) return false; v.sleeping = true; v.act = ''; v.moving = false; return true; };
  // waking: out of bed, and out of the house by its door if it slept at home
  Po.wake = function (v) { if (!v || !v.sleeping) return; v.sleeping = false; if (v.inside) { const b = G.S.buildings.get(v.inside); if (b) { const d = G.Vg.door(b); v.x = d[0]; v.y = d[1]; } v.inside = 0; } };
  // the world's step for the incarnation: is the body still the player's?
  Po.update = function (dt) {
    const S = G.S; const a = S.avatar; if (!a) return;
    const v = S.villagers.get(a.id);
    if (!v) { const rec = S.dead.get(a.id); died(rec || cur || { id: a.id, name: '?', x: a.x0, y: a.y0, g: 'm' }, rec ? rec.cause : 'unknown', a); return; }
    cur = v;
    // (something of the world took the body without asking: it goes with it)
    if (v.aboard) { Po.release('forca', 'aboard', true); return; }
    if (v.jail || v.captive) { Po.release('forca', v.jail ? 'jail' : 'escorted', true); return; }
    if (v.held || v.air || v.ug) { Po.release('forca', v.held ? 'held' : v.air ? 'air' : 'ug', true); return; }
    if (!v.task) v.task = mark();
    else if (v.task.type !== 'avatar') { Po.release('forca', v.task.type, true); return; }
    // (inside only to sleep in one's own bed; anything else that put the body indoors lets it out at the door)
    if (v.inside && !(v.sleeping && v.inside === v.home)) { const b = S.buildings.get(v.inside); if (b) { const d = G.Vg.door(b); v.x = d[0]; v.y = d[1]; } v.inside = 0; }
    for (let k = a.asks.length - 1; k >= 0; k--) if (S.clock - a.asks[k].t > 90) a.asks.splice(k, 1);
    void dt;
  };
  // the death of the body (Village.kill is the only door out of the world: the incarnation follows it at once)
  const kill0 = G.Village.kill;
  G.Village.kill = function (v, cause, byGod) {
    const a = G.S && G.S.avatar; const was = !!(a && v && a.id === v.id);
    const r = kill0.apply(this, arguments);
    if (was && G.S.avatar === a && !G.S.villagers.has(v.id)) died(G.S.dead.get(v.id) || v, cause, a);
    return r;
  };
  // what the body witnessed: the chronicle's lines told near it, while it was lived
  const log0 = G.Village.log;
  G.Village.log = function (text, icon, x, y) {
    const S = G.S; const n0 = S ? S.logN : 0;
    const r = log0.apply(this, arguments);
    const a = S && S.avatar; if (!a || S.logN === n0) return r;
    const e = S.history[S.history.length - 1];
    const v = S.villagers.get(a.id);
    if (e && v && Number.isFinite(e.x) && G.dist(e.x, e.y, v.x, v.y) < 30) { a.seen.push({ n: e.n, d: e.d, txt: e.txt }); if (a.seen.length > 20) a.seen.shift(); }
    if (e) for (const f of Po.onLog) f(e, v);
    return r;
  };
  // a deed done in the body (the interactions count them; the biography and the chronicle get them at the end)
  Po.deed = function (kind, n) { const a = G.S.avatar; if (!a) return; a.deeds[kind] = (a.deeds[kind] || 0) + (n === undefined ? 1 : n); };
  Po.meet = function (id) { const a = G.S.avatar; if (!a || !id || a.met.includes(id)) return false; a.met.push(id); if (a.met.length > 60) a.met.shift(); return true; };

  // ------------------------------ who I am, where I am, what is around me ------------------------------
  // (the doors a future adventure asks at: an identity, a place, the stories, the people known, what was seen, the duties)
  const KIN = (me, o) => {
    if (!me || !o) return null; const f = o.g === 'f';
    if (me.mother === o.id || me.father === o.id) return f ? 'mãe' : 'pai';
    if (o.mother === me.id || o.father === me.id) return f ? 'filha' : 'filho';
    if (me.partner === o.id) return f ? 'companheira' : 'companheiro';
    if ((me.mother && me.mother === o.mother) || (me.father && me.father === o.father)) return f ? 'irmã' : 'irmão';
    const gp = [me.mother, me.father].map(id => G.person(id)).filter(Boolean);
    if (gp.some(p => p.mother === o.id || p.father === o.id)) return f ? 'avó' : 'avô';
    if ((o.mother && gp.some(p => p.mother === o.mother && p.id !== o.id) ) || (o.father && gp.some(p => p.father === o.father && p.id !== o.id))) return f ? 'tia' : 'tio';
    return null;
  };
  Po.kin = KIN;
  Po.identity = function (v) {
    const S = G.S; if (!v) return null;
    const born = (v.bio || []).find(e => e[1] === 'born'); const awoke = (v.bio || []).find(e => e[1] === 'awoke');
    const set = S.settlements.get(v.set); const fac = G.Fac.ofV(v); const home = S.buildings.get(v.home);
    return {
      id: v.id, name: v.name, epithet: v.ep && G.Politics ? G.Politics.epithet(v) : '', g: v.g, age: Math.floor(v.age), role: G.roleName(v), traits: v.traits.slice(),
      from: born ? born[4] || null : awoke ? awoke[2] : null, first: !!awoke,
      mother: v.mother || 0, father: v.father || 0, partner: v.partner || 0, kids: (v.kids || []).slice(),
      set: set ? set.name : null, fac: fac ? fac.name : null, civ: fac ? fac.civ : null, home: home ? G.Village.buildName(home) : null,
      ruler: !!(fac && fac.leader === v.id), kills: v.kills || 0, hero: !!v.hero, lost: v.lost || null,
    };
  };
  Po.where = function (v) {
    const S = G.S; if (!v) return null;
    let set = null, sd = 1e9; for (const s of S.settlements.values()) { const d = G.dist(s.cx, s.cy, v.x, v.y); if (d < sd) { sd = d; set = s; } }
    const i = W.idx(v.x, v.y); const dist = G.Urban && G.Urban.districtAt ? G.Urban.districtAt(v.x, v.y) : null;
    const T = G.T; const t = S.type[i];
    const ground = S.road[i] ? (S.type[i] === T.RIVER ? 'ponte' : 'estrada') : t === T.RIVER ? 'rio' : t === T.SAND ? 'areia' : S.treeAt[i] ? 'bosque' : S.cliff[i] ? 'penhasco' : 'campo';
    const town = set && sd < 6 + Math.sqrt(G.Village.pop(set.id)) * 1.2 ? set : null;
    return { x: +v.x.toFixed(2), y: +v.y.toFixed(2), tile: i, town: town ? town.name : null, near: set ? set.name : null, nearD: Math.round(sd), district: dist ? dist.name : null, biome: G.Biome && G.Biome.nameAt ? G.Biome.nameAt(v.x, v.y) : null, ground, h: +W.groundH(v.x, v.y).toFixed(2) };
  };
  Po.context = function () {
    const S = G.S; const a = S.avatar; const v = Po.body(); if (!a || !v) return null;
    const around = []; for (const o of S.villagers.values()) if (o.id !== v.id && !o.inside && G.dist2(o.x, o.y, v.x, v.y) < 100) around.push(o.id);
    const stories = G.Stories ? G.Stories.of(v.id).map(s => ({ id: s.id, title: s.title, type: s.type, protag: s.protag === v.id })) : [];
    return {
      who: Po.identity(v), where: Po.where(v), kind: a.kind, caps: Po.caps(v),
      stories, knows: { family: [v.mother, v.father, v.partner, ...(v.kids || [])].filter(Boolean), met: a.met.slice() },
      witnessed: a.seen.slice(), goals: a.asks.map(q => ({ type: q.type, txt: q.txt })), around, deeds: Object.assign({}, a.deeds), since: a.since,
    };
  };

  // ------------------------------ words ------------------------------
  const tt0 = G.Vg.taskText;
  G.Vg.taskText = function (v) { return v.task && v.task.type === 'avatar' ? (v.sleeping ? 'Dormindo — guiad' + oa(v) + ' pelo deus' : 'Vivid' + oa(v) + ' pelo deus (Modo Encarnado)') : tt0(v); };
  const DEED = { escalada: ['escalou', 'pedra ou barranco', 'pedras e barrancos'], ouro: ['catou', 'moeda de ouro do chão', 'moedas de ouro do chão'], carinho: ['fez carinho em', 'bicho', 'bichos'], agua: ['bebeu água de', 'rio', 'rios'], aceno: ['acenou', 'vez', 'vezes'], conversa: ['conversou com', 'pessoa', 'pessoas'], lenha: ['cortou', 'árvore', 'árvores'], pedra: ['quebrou', 'pedra', 'pedras'], frutas: ['colheu', 'punhado de frutas', 'punhados de frutas'], entrega: ['levou ao armazém', 'carga', 'cargas'], refeicao: ['fez', 'refeição', 'refeições'], sono: ['dormiu', 'noite', 'noites'], exame: ['examinou', 'coisa', 'coisas'], porta: ['bateu em', 'porta', 'portas'], reza: ['rezou', 'vez no templo', 'vezes no templo'], obra: ['levou às obras', 'carga de material', 'cargas de material'] };
  Po.DEED = DEED;
  if (G.Life) {
    const bl0 = G.Life.bioLine;
    G.Life.bioLine = function (v, e) {
      if (e[1] !== 'god') return bl0(v, e);
      const days = e[2] || 0; const parts = String(e[3] || '').split('|').filter(Boolean).map(p => { const [k, n] = p.split(':'); const D = DEED[k]; return D ? `${D[0]} ${n} ${+n === 1 ? D[1] : D[2]}` : null; }).filter(Boolean);
      const head = e[4] ? `Morreu com o deus vivendo em seu corpo` : `Viveu ${days >= 1 ? days + (days > 1 ? ' dias' : ' dia') : 'um tempo'} guiad${oa(v)} pelo deus`;
      return head + (parts.length ? ': ' + parts.join(', ') : '') + '.';
    };
  }

  // ------------------------------ save ------------------------------
  const num = (x, d) => (Number.isFinite(x) ? x : d);
  G.saveHooks.push({
    save(out) {
      const a = G.S.avatar; if (!a) return;
      out.avatar = { id: a.id, kind: a.kind, since: a.since, t0: a.t0, x0: a.x0, y0: a.y0, asks: a.asks.slice(-6), deeds: Object.assign({}, a.deeds), seen: a.seen.slice(-20), met: a.met.slice(-60) };
    },
    load(o) {
      const S = G.S; S.avatar = null; cur = null;
      const a = o.avatar; if (!a || typeof a !== 'object') return;
      const v = S.villagers.get(a.id);
      // (a body that is gone, or in no state to be lived, is not taken back: the save simply opens in the god's eyes)
      if (!v || !Po.can(v).ok) return;
      const deeds = {}; if (a.deeds && typeof a.deeds === 'object') for (const k in a.deeds) if (DEED[k] && Number.isFinite(a.deeds[k])) deeds[k] = a.deeds[k];
      S.avatar = {
        id: v.id, kind: KINDS[a.kind] ? a.kind : 'humano', since: num(a.since, S.day), t0: num(a.t0, S.clock), x0: num(a.x0, v.x), y0: num(a.y0, v.y),
        asks: Array.isArray(a.asks) ? a.asks.filter(q => q && typeof q.txt === 'string').map(q => ({ type: String(q.type), txt: q.txt, t: num(q.t, S.clock), t0: num(q.t0, S.clock), n: num(q.n, 1) })) : [],
        deeds, seen: Array.isArray(a.seen) ? a.seen.filter(e => e && typeof e.txt === 'string') : [], met: Array.isArray(a.met) ? a.met.filter(Number.isFinite) : [],
      };
      v.task = mark(); v.sleeping = false; v.path = null; v.inside = 0;
      cur = v;
    },
  });
})(window.G);
