'use strict';
// ============================================================
//  Companions: nobody has to go alone.
//  When a story sets out on a road that matters — a revenge, a rescue,
//  a hunt, a pilgrimage — the one who carries it may ask someone to
//  come along: a brother who lost the same father, a friend with a
//  spear, the partner who won't be left behind. The one asked decides
//  by who they are (brave or afraid, small children at home, too old,
//  owed nothing), and says yes or no, and why; sometimes someone offers
//  first, and the protagonist takes them or sends them home. On the road
//  the party walks together, camps together, stands together at the
//  end — and fights together. Whoever falls is remembered in the story.
//
//  The decisions go through St.party.decide / St.party.take, so a
//  person driven by a player (the incarnation mode to come) can be
//  asked instead: St.party.player names that person, and the question
//  waits in story.data.ask until St.party.answer() is called.
// ============================================================
(function (G) {
  const St = G.Stories; const Pt = St.party = {};
  const P = id => (id ? G.person(id) : null);
  const alive = id => !!(id && G.S && G.S.villagers.has(id));
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const ele = v => (v && v.g === 'f' ? 'ela' : 'ele');

  // which stories take company, and of what kind
  const KIND = {
    vinganca: { max: 3, risky: 1, kin: 1, also: ['guerreiro', 'cacador'], grief: 'victim', what: 'a vingança', go: ['frente'] },
    resgate: { max: 2, risky: 1, kin: 1, also: ['guerreiro'], grief: 'captive', what: 'o resgate' },
    reconquista: { max: 3, risky: 1, kin: 0, also: ['guerreiro'], what: 'a reconquista' },
    cacada: { max: 2, risky: 1, kin: 0, also: ['cacador', 'guerreiro'], what: 'a caçada', go: ['espera', 'rastro'] },
    peregrinacao: { max: 1, risky: 0, kin: 1, what: 'a peregrinação' },
    sonho: { max: 1, risky: 0, kin: 1, what: 'a viagem' },
    migracao: { max: 1, risky: 0, kin: 1, what: 'a viagem' },
    caravana: { max: 1, risky: 0, kin: 0, also: ['mercador', 'feirante'], what: 'a caravana' },
  };
  Pt.KIND = KIND;
  Pt.player = 0; // (the incarnated person, when there is one)

  Pt.of = s => (s.party || []).filter(alive).map(P);
  Pt.has = (s, id) => (s.party || []).includes(id);
  const nameList = vs => (vs.length <= 1 ? (vs[0] ? vs[0].name : '') : vs.slice(0, -1).map(v => v.name).join(', ') + ' e ' + vs[vs.length - 1].name);
  Pt.names = s => nameList(Pt.of(s));

  // ------------------------------ the one asked decides ------------------------------
  // returns { ok, why } — why: the words of the answer, for the chapter
  Pt.decide = function (s, c, how) {
    const p = P(s.protag); const K = KIND[s.type] || { risky: 0 };
    if (!p || !c) return { ok: false, why: '' };
    if (c.age < 15) return { ok: false, why: 'é criança demais para isso' };
    if (c.age > 63) return { ok: false, why: K.risky ? 'já não tem pernas para essa estrada' : 'não aguenta mais a estrada' };
    if (c.captive || c.held) return { ok: false, why: '' };
    const pe = G.Politics.persona(c); const rel = St.relOf(p, c);
    let sc = rel ? 0.55 + (rel === 'companheiro' || rel === 'companheira' ? 0.25 : 0) : 0.15;
    if (K.grief && s.cast[K.grief] && St.relOf(c, P(s.cast[K.grief]))) sc += 0.45;
    if (K.risky) sc += c.courage * 0.55 + pe.agg * 0.25 - (c.fear || 0) / 200; else sc += 0.25 + (1 - pe.amb) * 0.1;
    const baby = (c.kids || []).some(id => { const k = P(id); return k && !k.dead && k.age < 5; });
    if (baby && K.risky) sc -= 0.45;
    if (c.preg > 0) sc -= 0.8;
    if (St.of(c.id).some(x => x.protag === c.id)) sc -= 0.35;
    if (c.set !== p.set) sc -= 0.25;
    if (how === 'self') sc += 0.25;
    sc += (G.hash(c.id * 7 + s.id) - 0.5) * 0.3;
    const ok = sc > 0.78;
    let why = '';
    if (ok) why = K.grief && s.cast[K.grief] && St.relOf(c, P(s.cast[K.grief])) ? 'também tinha perdido alguém' : rel ? (rel === 'companheiro' || rel === 'companheira' ? 'aonde você for, eu vou' : 'é sangue do meu sangue') : K.risky ? (pe.agg > 0.6 ? 'faz tempo que quer uma briga dessas' : 'não ia deixar ninguém ir sozinho') : 'sempre quis ver o mundo';
    else why = c.preg > 0 ? 'espera um filho' : baby && K.risky ? 'tem filhos pequenos para criar' : K.risky && c.courage < 0.4 ? 'tem medo' : !rel ? 'não é assunto seu' : 'não pode largar tudo agora';
    return { ok, why };
  };
  // the protagonist takes a volunteer, or sends them home
  Pt.take = function (s, c) {
    const p = P(s.protag); if (!p) return { ok: false, why: '' };
    const pe = G.Politics.persona(p); const K = KIND[s.type] || {};
    if (c.age < 15) return { ok: false, why: `${c.name} é criança: ficou em casa` };
    if (c.age > 63 && K.risky) return { ok: false, why: `não deixou: “alguém tem que ficar”` };
    if (pe.amb > 0.7 && pe.agg > 0.6 && !St.relOf(p, c)) return { ok: false, why: `prefere ir sozinh${oa(p)}` };
    return { ok: true, why: '' };
  };

  // ------------------------------ asking, offering, joining ------------------------------
  function join(s, c, how) {
    const party = s.party || (s.party = []); if (party.includes(c.id)) return;
    party.push(c.id);
    G.Life && G.Life.bio(c, 'note', `Foi junto com ${(P(s.protag) || {}).name || 'alguém'}: ${s.title}`);
    G.Stories.signal && G.Stories.signal('partyJoin', { story: s.id, who: c.id, how: how || '' });
  }
  Pt.join = function (s, id, how) { const c = P(id); if (c && alive(id)) join(s, c, how || 'direto'); };
  Pt.leave = function (s, id, why) {
    s.party = (s.party || []).filter(x => x !== id);
    const c = P(id); if (c && why) St.chapter(s, why, { x: c.x, y: c.y });
    if (c && c.task && c.task.type === 'party' && c.task.story === s.id) G.Vg.endTask(c);
  };
  // ask someone to come; the answer is a small chapter
  Pt.invite = function (s, c) {
    const p = P(s.protag); if (!p || !c) return false;
    if (Pt.player && c.id === Pt.player) { s.data.ask = { to: c.id, from: p.id, kind: 'convite', day: G.S.day }; return false; }
    const r = Pt.decide(s, c, 'ask');
    const rel = St.relOf(p, c); const rl = rel ? relWord(rel, c) : '';
    if (r.ok) { join(s, c, 'convite'); St.chapter(s, `${p.name} pediu a ${rl}${c.name} que fosse junto. ${c.name} aceitou: ${r.why}.`, { x: p.x, y: p.y }); }
    else if (r.why) St.chapter(s, `${p.name} pediu a ${rl}${c.name} que fosse junto. ${c.name} disse que não: ${r.why}.`, { x: p.x, y: p.y });
    return r.ok;
  };
  // someone offers first
  Pt.volunteer = function (s, c) {
    const p = P(s.protag); if (!p || !c) return false;
    if (Pt.player && p.id === Pt.player) { s.data.ask = { to: p.id, from: c.id, kind: 'oferta', day: G.S.day }; return false; }
    const d = Pt.decide(s, c, 'self'); if (!d.ok) return false;
    const r = Pt.take(s, c); const rel = St.relOf(p, c); const rl = rel ? relWord(rel, c) : '';
    if (r.ok) { join(s, c, 'oferta'); St.chapter(s, `${cap(rl)}${c.name} não esperou ser chamad${oa(c)}: ${d.why}, e foi junto.`, { x: p.x, y: p.y }); }
    else St.chapter(s, `${cap(rl)}${c.name} quis ir junto, mas ${p.name} ${r.why}.`, { x: p.x, y: p.y });
    return r.ok;
  };
  // the answer of a player (the incarnation mode), when a question was waiting
  Pt.answer = function (sid, yes) {
    const s = St.get(sid); if (!s || !s.data.ask) return;
    const a = s.data.ask; s.data.ask = null; const c = P(a.kind === 'convite' ? a.to : a.from);
    if (yes && c) { join(s, c, a.kind); St.chapter(s, a.kind === 'convite' ? `${c.name} aceitou ir junto.` : `${(P(s.protag) || {}).name} aceitou a companhia de ${c.name}.`); }
  };
  const REL_A = { pai: 'seu pai, ', mae: 'sua mãe, ', filho: 'seu filho, ', filha: 'sua filha, ', companheiro: 'seu companheiro, ', companheira: 'sua companheira, ', irmao: 'seu irmão, ', irma: 'sua irmã, ' };
  const relWord = rel => REL_A[rel] || '';
  const cap = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

  // ------------------------------ forming the party (once, when the road begins) ------------------------------
  Pt.gather = function (s, p) {
    const K = KIND[s.type]; if (!K || s.data.partyDone) return; s.data.partyDone = 1;
    const S = G.S; const want = Math.min(K.max, 1 + Math.floor(G.hash(s.id * 11) * K.max));
    const seen = new Set([p.id]); const cands = [];
    const add = (v, w) => { if (!v || seen.has(v.id) || v.dead || v.captive || !alive(v.id)) return; seen.add(v.id); cands.push([v, w]); };
    // the family first; for a grief, also the victim's other kin
    if (K.kin || K.risky) for (const k of St.kin(p)) add(k, 2 + (St.relOf(p, k) === 'companheiro' || St.relOf(p, k) === 'companheira' ? 0.5 : 0));
    if (K.grief && s.cast[K.grief]) { const g = P(s.cast[K.grief]); if (g) for (const k of St.kin(g)) add(k, 2.2); }
    // then those of the trade, in the same town
    if (K.also) for (const v of S.villagers.values()) if (v.set === p.set && K.also.includes(v.role) && v.age >= 18 && v.age < 55) add(v, 0.8 + v.courage);
    cands.sort((a, b) => b[1] - a[1] + (G.hash(a[0].id + s.id) - G.hash(b[0].id + s.id)) * 0.4);
    let asked = 0;
    for (const [c] of cands) {
      if ((s.party || []).length >= want || asked >= want + 2) break;
      asked++;
      // the bold offer before they are asked
      if (G.R() < 0.3 + c.courage * 0.2) Pt.volunteer(s, c); else Pt.invite(s, c);
    }
  };
  // the road: every journey of a story with company takes its company along (and the errands that matter)
  function bring(story, v) {
    Pt.gather(story, v);
    for (const c of Pt.of(story)) {
      if (c.captive || c.held || c.aboard || (c.task && (c.task.pri >= 3 || c.task.type === 'party'))) continue;
      G.Vg.endTask(c); c.sleeping = false;
      G.Vg.setTask(c, { type: 'party', story: story.id, lead: v.id, pri: 2.04, st: 0, kind: 'party', k: (story.party || []).indexOf(c.id) });
    }
  }
  Pt.bring = bring;
  const oldJourney = St.journey;
  St.journey = function (story, v, H, o) {
    const t = oldJourney.apply(this, arguments);
    try { if (KIND[story.type] && v.id === story.protag) bring(story, v); } catch (e) { console.warn('party', e); }
    return t;
  };
  const oldGo = St.go;
  St.go = function (story, v, H, o) {
    const t = oldGo.apply(this, arguments);
    try { const K = KIND[story.type]; if (K && K.go && K.go.includes(o.sub) && v.id === story.protag) bring(story, v); } catch (e) { console.warn('party', e); }
    return t;
  };

  // ------------------------------ walking together ------------------------------
  Pt.run = function (v, t, dt, H) {
    if (t.type !== 'party') return false;
    const s = St.get(t.story); const L = P(t.lead);
    if (!s || s.st !== 'ativa' || !L || L.dead || !alive(L.id)) { H.end(v); return true; }
    // the leader fights: so do they (a beast at the den: they go at it too)
    if (L.task && L.task.type === 'combat') {
      const foe = P(L.task.id);
      if (foe && G.dist(v.x, v.y, foe.x, foe.y) < 7) { G.War.fightStep(v, t, foe, dt, H, null); return true; }
    }
    if (L.task && L.task.type === 'fight' && L.task.id) { const a = G.S.animals.get(L.task.id); if (a && !a.dead && G.dist(v.x, v.y, a.x, a.y) < 9) { G.Vg.setTask(v, { type: 'fight', id: a.id, pri: 4, rt: 0 }); return true; } }
    const lt = L.task;
    const onRoad = lt && lt.type === 'saga' && lt.story === s.id;
    if (!onRoad) { if ((t.lost = (t.lost || 0) + dt) > 6) H.end(v); return true; }
    t.lost = 0;
    if (v.hp < 30) { St.chapter(s, `${v.name} ficou para trás, ferid${oa(v)}.`, { x: v.x, y: v.y }); H.end(v); return true; }
    const k = t.k || 0; const side = (k % 2 ? 1 : -1) * (0.7 + Math.floor(k / 2) * 0.5);
    const ox = L.x + side * 0.6, oy = L.y + 0.45 + Math.floor(k / 2) * 0.3;
    const d = G.dist(v.x, v.y, ox, oy);
    // camping: the fire, sleep by the leader
    if (lt.st === 4) {
      if (d > 1.2) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 1; H.goto(v, ox, oy, true); } H.move(v, dt, 1); return true; }
      v.moving = false; v.path = null; v.sleeping = true; v.act = 'sleep'; return true;
    }
    v.sleeping = false;
    // at the end of the road: stand with them, do as they do
    if (lt.st === 2 || lt.st >= 6) {
      if (d > 1) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.8; H.goto(v, ox, oy, true); } H.move(v, dt, 1.1); return true; }
      v.moving = false; v.act = lt.act || ''; if (lt.fx !== undefined) G.faceTo(v, lt.fx - v.x, lt.fy - v.y); else G.faceAs && G.faceAs(v, L);
      if (lt.emo && G.R() < dt * 0.15) G.Vg.emote(v, lt.emo, 1.3);
      return true;
    }
    // on the road: keep close, a step behind
    if (d > 1.4) {
      t.rt = (t.rt || 0) - dt;
      if (t.rt <= 0 || H.arrived(v)) { t.rt = d > 8 ? 1.2 : 0.5; if (!H.goto(v, ox, oy, false, 30000) && !H.goto(v, ox, oy, true, 30000)) { t.fail = (t.fail || 0) + 1; if (t.fail > 5) H.end(v); } }
      H.move(v, dt, d > 5 ? 1.25 : 1.05);
    } else { v.moving = false; v.path = null; v.act = ''; G.faceAs && G.faceAs(v, L); }
    // they eat from the leader's bundle
    if (v.hunger > 70 && lt.food > 0) { lt.food--; v.hunger = Math.max(0, v.hunger - 55); }
    return true;
  };
  Pt.taskText = function (v, t) {
    if (t.type !== 'party') return null;
    const L = P(t.lead); const s = St.get(t.story);
    return L ? `Junto com ${L.name}${s ? ': ' + s.title : ''}` : 'Na estrada, com outros';
  };

  // ------------------------------ who fell along the way ------------------------------
  let acc = 0;
  Pt.tick = function (dt) {
    acc += dt; if (acc < 2) return; acc = 0;
    for (const s of St.state().stories) {
      if (s.st !== 'ativa' || !s.party || !s.party.length) continue;
      for (const id of s.party.slice()) {
        if (alive(id)) continue;
        const c = P(id); s.party = s.party.filter(x => x !== id);
        if (!c) continue;
        const p = P(s.protag);
        const how = G.Village.deathText ? G.Village.deathText(c).replace(/ aos \d+ anos$/, '') : 'morreu';
        St.chapter(s, `${c.name}, que tinha ido junto com ${p ? p.name : 'quem carregava a história'}, ${how}.${p && !p.dead ? ` ${cap(ele(p))} seguiu sem ${c.g === 'f' ? 'ela' : 'ele'}.` : ''}`, { x: c.x, y: c.y, big: 1 });
      }
    }
  };
  const oldUpdate = St.update;
  St.update = function (dt) { oldUpdate.call(this, dt); try { Pt.tick(dt); } catch (e) { console.warn('party tick', e); } };
  // when a story ends, the company goes home — and remembers
  const oldFinish = St.finish;
  St.finish = function (story, k, tone, txt, o) {
    const was = story.st;
    const r = oldFinish.apply(this, arguments);
    if (was === 'ativa' && story.party && story.party.length) {
      for (const c of Pt.of(story)) { if (c.task && c.task.type === 'party' && c.task.story === story.id) G.Vg.endTask(c); G.Life && G.Life.bio(c, 'note', `Esteve junto até o fim: ${story.title}`); }
    }
    return r;
  };
  // the panel and the future adventure mode see the company too
  const oldContext = St.context;
  St.context = function (id) {
    const c = oldContext.apply(this, arguments); if (!c) return c;
    const s = St.get(id);
    for (const pid of (s && s.party) || []) { const q = P(pid); if (!q) continue; c.participants.push({ id: q.id, name: q.name, alive: !q.dead, x: q.dead ? null : q.x, y: q.dead ? null : q.y, age: Math.floor(q.age), set: q.dead ? null : q.set, fac: G.Fac.idOfV(q), job: q.dead ? null : q.role, captive: !!q.captive, traits: q.traits || [], role: 'comp' }); }
    c.party = ((s && s.party) || []).slice(); c.ask = (s && s.data.ask) || null;
    return c;
  };
})(window.G);
