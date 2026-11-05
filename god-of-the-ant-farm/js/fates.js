'use strict';
// ============================================================
//  The god's hand on hearts, blades and dreams.
//  Amor Divino (Destino) — touch someone free and choose who
//  they will love: they run to each other and are a couple —
//  across a border, if the god wills it, and the two peoples
//  feel it.
//  Duelo de Campeões (Destino) — touch a battle: the best blade
//  of each side steps out and they fight alone, to the end. The
//  side whose champion falls breaks and runs.
//  Sonho Coletivo (Palavra) — a whole people dreams the same
//  dream, and wakes to it: a great work, peace, the gods, or a
//  land beyond the sea.
// ============================================================
(function (G) {
  let N = G.N; const W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers, V = G.Village;
  const log = (t, ic, x, y) => V.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const bio = (v, third, first) => G.Life && G.Life.bio(v, 'note', third, first);

  const FATES = [
    { id: 'love', tab: 'destino', name: 'Amor Divino', cost: 20, r: 1.2, good: true, choose: true, desc: 'Toque alguém sem par e escolha quem vai amar: os dois correm um para o outro e viram um casal — até de povos diferentes, e os dois povos sentem.' },
    { id: 'duel', tab: 'destino', name: 'Duelo de Campeões', cost: 55, r: 14, good: null, desc: 'Toque uma batalha: o melhor guerreiro de cada lado sai da fila e os dois lutam sozinhos, até o fim. O lado cujo campeão cai foge do campo.' },
    { id: 'dream', tab: 'palavra', name: 'Sonho Coletivo', cost: 45, r: 0, good: null, target: 'fac', choose: true, desc: 'Um povo inteiro sonha o mesmo sonho numa noite — e acorda para ele: uma grande obra, a paz, os deuses, ou uma terra além do mar.' },
  ];
  // (each one after the last power of its tab, so the keys of the old ones do not move)
  for (const p of FATES) { let k = -1; G.POWERS.forEach((q, i) => { if (q.tab === p.tab) k = i; }); G.POWERS.splice(k + 1, 0, p); }
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });
  const IS = {}; for (const p of FATES) IS[p.id] = 1;

  // (made only by the world's step: a check or a drawing reads G.S.fates and never creates it)
  function st() { const S = G.S; if (!S.fates) S.fates = { loves: [], duels: [], dreams: [] }; return S.fates; }
  const LOVE_T = 150, DUEL_T = 90;

  // ------------------------------ who can love whom ------------------------------
  const freeOf = v => v && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !(v.task && (v.task.type === 'scene' || v.task.pri >= 5));
  const single = v => v && !v.partner && v.age >= 16 && v.age < 60;
  const lover = (x, y) => { const v = P.targetAt(x, y, 1.3); return v && single(v) && freeOf(v) ? v : null; };
  function suitors(v) {
    const S = G.S; const mine = [], far = [];
    for (const o of S.villagers.values()) {
      if (o === v || o.g === v.g || !single(o) || !freeOf(o) || Math.abs(o.age - v.age) > 20 || G.Vg.relatedClose(v, o)) continue;
      if ((S.fates && S.fates.loves.some(l => l.a === o.id || l.b === o.id))) continue;
      const d = G.dist2(v.x, v.y, o.x, o.y); if (d > 60 * 60 || !W.reaches(v, o.x, o.y)) continue;
      (G.Fac.idOfV(o) === G.Fac.idOfV(v) ? mine : far).push([d, o]);
    }
    mine.sort((a, b) => a[0] - b[0] || a[1].id - b[1].id); far.sort((a, b) => a[0] - b[0] || a[1].id - b[1].id);
    return mine.slice(0, 4).concat(far.slice(0, 3)).map(q => q[1]);
  }

  // ------------------------------ who fights for each side ------------------------------
  const fighter = v => !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && v.age >= 16 && v.age < 62 && v.hp > 40 && (v.role === 'guerreiro' || (v.task && (v.task.type === 'band' || v.task.type === 'combat')));
  const prowess = v => (v.chosen ? 100 : 0) + (v.hero ? 60 : 0) + (v.elite ? 30 : 0) + (v.kills || 0) * 4 + v.hp * 0.2 + (v.courage || 0) * 20;
  function champions(x, y) {
    const S = G.S; const by = new Map();
    for (const v of S.villagers.values()) { if (G.dist2(v.x, v.y, x, y) > 14 * 14 || !fighter(v)) continue; const f = G.Fac.idOfV(v); if (!by.has(f)) by.set(f, []); by.get(f).push(v); }
    let best = null, bn = 0;
    const F = [...by.keys()].sort((a, b) => a - b);
    for (const a of F) for (const b of F) { if (a >= b || !G.Fac.atWar(a, b)) continue; const n = Math.min(by.get(a).length, by.get(b).length); if (n > bn) { bn = n; best = [a, b]; } }
    if (!best) return null;
    const top = f => by.get(f).slice().sort((p, q) => prowess(q) - prowess(p) || p.id - q.id)[0];
    const A = top(best[0]), B = top(best[1]);
    if (!W.reaches(A, B.x, B.y)) return null;
    return { a: A, b: B, fa: best[0], fb: best[1] };
  }

  // ------------------------------ what a people can dream ------------------------------
  const unknownLand = f => {
    const K = G.Know; if (!K || !K.regions) return null; const cap = G.Fac.capitalOf(f.id); if (!cap) return null;
    const home = K.at(cap.cx, cap.cy);
    let best = null, bd = 1e18; for (const r of K.regions()) { if (!K.big(r) || r === home || K.state(f.id, r) >= K.SIG) continue; const d = K.distTo(r, cap.cx, cap.cy); if (d < bd) { bd = d; best = r; } }
    return best;
  };
  function dreams(f) {
    const out = []; const cap = G.Fac.capitalOf(f.id); if (!cap) return out;
    if (V.findSite(cap, 'monument')) out.push({ k: 'obra', name: 'A Grande Obra', desc: `Sonham com um monumento erguido em ${cap.name} — e acordam com a pedra já separada e as mãos ansiosas.` });
    const foes = G.Fac.enemiesOf(f.id);
    if (foes.length) out.push({ k: 'paz', name: 'A Paz', desc: `Sonham com o fim da guerra contra ${foes.map(e => e.name).join(', ')}: cansados de sangue, oferecem a paz.` });
    out.push({ k: 'fe', name: 'Os Deuses', desc: 'Sonham com você. Acordam devotos, e correm aos templos.' });
    const r = unknownLand(f);
    if (r) out.push({ k: 'mar', name: 'A Terra Além do Mar', desc: `Sonham com uma terra ${G.Know.dir(r.cx - cap.cx, r.cy - cap.cy)}, além da água. Agora sabem que ela existe.` });
    return out;
  }

  // ------------------------------ checks & choices ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (!IS[p.id]) return prevCheck ? prevCheck(p, x, y) : true;
    const S = G.S; const F = S.fates;
    if (p.id === 'love') {
      const t = P.targetAt(x, y, 1.3);
      if (!t) { P.why = 'Toque bem em cima de alguém.'; return false; }
      if (t.partner) { P.why = `${t.name} já tem ${t.g === 'f' ? 'companheiro' : 'companheira'}: o amor divino toca corações livres.`; return false; }
      if (!lover(x, y)) { P.why = `${t.name} não pode amar agora (jovem demais, velh${oa(t)} demais, ou long${oa(t)} do mundo).`; return false; }
      if (F && F.loves.some(l => l.a === t.id || l.b === t.id)) { P.why = `${t.name} já está correndo para o seu amor.`; return false; }
      if (!suitors(t).length) { P.why = `Ninguém livre perto de ${t.name} para amar.`; return false; }
    }
    if (p.id === 'duel') {
      if (F && F.duels.length) { P.why = 'Um duelo de campeões já está acontecendo.'; return false; }
      if (!champions(x, y)) { P.why = 'Toque uma batalha: guerreiros de dois povos em guerra, frente a frente.'; return false; }
    }
    if (p.id === 'dream') {
      const f = P.facAt(x, y); if (!f) { P.why = 'Toque as terras de um povo.'; return false; }
      if (F && F.dreams.some(d => d.fac === f.id && S.day - d.day < 2)) { P.why = `${f.name} ainda vive o último sonho.`; return false; }
    }
    return true;
  };
  const prevOptions = P.options;
  P.options = function (id, x, y) {
    if (!IS[id]) return prevOptions ? prevOptions(id, x, y) : [];
    if (id === 'love') {
      const v = lover(x, y); if (!v) return [];
      const fv = G.Fac.idOfV(v);
      return suitors(v).map(o => {
        const fo = G.Fac.idOfV(o); const s = G.S.settlements.get(o.set); const f = G.Fac.get(fo);
        const other = fo !== fv ? ` De outro povo: ${f ? f.name : 'estrangeiro'}${G.Fac.atWar(fv, fo) ? ' — em guerra com o seu!' : ''}.` : '';
        return { k: String(o.id), name: `${o.name} (${Math.floor(o.age)} anos)${s ? ', de ' + s.name : ''}`, desc: `${(o.traits || []).join(', ') || 'Sem traços marcantes'}.${other}` };
      });
    }
    if (id === 'dream') { const f = P.facAt(x, y); return f ? dreams(f) : []; }
    return [];
  };
  const prevTitle = P.optionsTitle;
  P.optionsTitle = function (id, x, y) {
    if (!IS[id]) return prevTitle ? prevTitle(id, x, y) : '';
    if (id === 'love') { const v = lover(x, y); return v ? `Quem ${v.name} vai amar?` : 'Quem vai amar?'; }
    if (id === 'dream') { const f = P.facAt(x, y); return f ? `O que ${f.name} vai sonhar?` : 'Que sonho?'; }
    return '';
  };

  // ------------------------------ Amor Divino ------------------------------
  P.love = function (x, y, k) {
    const S = G.S; const v = lover(x, y); const o = S.villagers.get(+k);
    if (!v || !o || !single(o) || !freeOf(o)) { S.faith = Math.min(999, S.faith + P.byId('love').cost); return; }
    const rec = { id: S.nextId++, a: v.id, b: o.id, t: 0 };
    st().loves.push(rec);
    for (const [p, q] of [[v, o], [o, v]]) { G.Vg.H.setTask(p, { type: 'amor', id: q.id, love: rec.id, pri: 2.4, st: 0, kind: 'amor' }); G.Vg.emote(p, 'heart', 3); }
    G.FX && (G.FX.hearts(v.x, v.y), G.FX.hearts(o.x, o.y));
    G.Audio && G.Audio.play('fertility');
    P.witness(v.x, v.y, 8, 4, 0);
    const far = G.Fac.idOfV(v) !== G.Fac.idOfV(o);
    log(`Uma flecha dos céus: ${v.name} se apaixonou por ${o.name}${far ? `, de ${G.Fac.get(G.Fac.idOfV(o)).name}` : ''}. ${v.g === 'f' ? 'Ela' : 'Ele'} já corre ao seu encontro.`, 'heart', v.x, v.y);
  };
  function wed(rec, a, b) {
    const S = G.S; rec.done = 1;
    a.partner = b.id; b.partner = a.id; a.widow = 0; b.widow = 0;
    S.stats.couples++;
    if (G.Life) { G.Life.bio(a, 'couple', b.id); G.Life.bio(b, 'couple', a.id); }
    G.FX && G.FX.hearts((a.x + b.x) / 2, (a.y + b.y) / 2);
    const fa = G.Fac.idOfV(a), fb = G.Fac.idOfV(b);
    let txt = `${a.name} e ${b.name} se encontraram e formaram um casal, unidos pelos céus.`;
    if (fa !== fb) {
      // across a border: the one from the smaller town goes to live in the other's (and the two peoples are a little closer)
      const [go, stay] = V.pop(a.set) <= V.pop(b.set) ? [a, b] : [b, a];
      const r = G.Fac.rel(fa, fb); if (r) { r.op = Math.min(100, (r.op || 0) + 25); r.grudge = (r.grudge || 0) * 0.7; }
      go.set = stay.set; go.home = 0; go.guestOf = null;
      const s = S.settlements.get(stay.set);
      txt = `${a.name} e ${b.name}, de povos ${G.Fac.atWar(fa, fb) ? 'em guerra' : 'diferentes'}, se encontraram e formaram um casal, unidos pelos céus. ${go.name} foi viver em ${s ? s.name : 'outra terra'}.`;
      G.Lore && G.Lore.legend('love:' + rec.id, `${a.name} e ${b.name}`, `No ano ${S.day}, os céus uniram ${a.name}, de ${G.Fac.get(fa).name}, e ${b.name}, de ${G.Fac.get(fb).name}${G.Fac.atWar(fa, fb) ? ', no meio de uma guerra entre os seus povos' : ''}.`, { kind: 'amor' });
    }
    log(txt, 'heart', a.x, a.y);
    G.Lore && G.Lore.note('love', { a: a.id, b: b.id });
  }
  function runAmor(v, t, dt, H) {
    const S = G.S; const o = S.villagers.get(t.id); const rec = S.fates && S.fates.loves.find(l => l.id === t.love);
    if (!rec || rec.done) return H.end(v);
    if (!o) return H.end(v); // (the arrow's end is told by the update: the grief, the line in the life)
    if (v.partner || o.partner) { rec.done = 2; return H.end(v); }
    if (t.st === 0 || t.st === 1) {
      if (G.dist2(v.x, v.y, o.x, o.y) < 1.3 * 1.3) { t.st = 2; v.actT = 0; v.moving = false; return; }
      t.rt = (t.rt || 0) - dt;
      if (t.rt <= 0 || H.arrived(v)) { t.rt = 1.5; if (!H.goto(v, o.x, o.y, false, 4000)) { rec.done = 2; return H.end(v); } t.st = 1; }
      v.act = 'run'; H.move(v, dt, 1.25);
      if (t.age > 60 && !LONGWAY(v, o)) { rec.done = 2; return H.end(v); }
      return;
    }
    // in each other's arms
    v.act = 'embrace'; v.moving = false; G.faceTo(v, o.x - v.x, o.y - v.y);
    if (G.R() < dt * 0.8) G.Vg.emote(v, 'heart', 1.2);
    const coming = o.task && o.task.type === 'amor' && o.task.love === rec.id;
    if (G.dist2(v.x, v.y, o.x, o.y) > 2.2 * 2.2) { t.st = 1; t.rt = 0; return; } // (they drifted apart: after them again)
    if (v.actT > 3 && !rec.done && coming && o.task.st === 2) { wed(rec, v, o); H.end(v); G.Vg.endTask(o); }
    else if (v.actT > 8 && !coming) H.end(v); // (the other one is still on the way: wait for them)
  }
  // (a long road is no reason to give up — a road that goes nowhere is)
  const LONGWAY = (v, o) => G.dist2(v.x, v.y, o.x, o.y) > 400;
  function updateLoves(dt) {
    const S = G.S; const L = S.fates.loves;
    for (let k = L.length - 1; k >= 0; k--) {
      const l = L[k]; l.t += dt;
      const a = S.villagers.get(l.a), b = S.villagers.get(l.b);
      const running = v => v && v.task && v.task.type === 'amor' && v.task.love === l.id;
      // (one of them died on the way: the other grieves a love never held)
      if (!l.done && (!a || !b)) {
        const v = a || b; l.done = 2;
        if (v && !v.partner) { G.Vg.emote(v, 'sad', 4); v.mourn = Math.max(v.mourn, G.DAY_LEN * 0.6); bio(v, `Correu ao encontro de um amor que morreu antes de chegar`, `Corri para um amor que nunca cheguei a abraçar`); }
      }
      // (someone else married one of them on the way — a marriage of state, a courtship: the arrow missed)
      if (!l.done && a && b && ((a.partner && a.partner !== b.id) || (b.partner && b.partner !== a.id))) l.done = 2;
      // (a danger or a duty more urgent than love took them both from the way — a fight, a flight, a fire —: the arrow
      // waits, and each one runs again once free, until its time is spent; it was spent at once, with no word, and the
      // god's faith with it — L-302. The body the player lives is asked only once, by the arrow itself)
      if (!l.done && a && b && l.t <= LOVE_T && !running(a) && !running(b)) {
        for (const [p, q] of [[a, b], [b, a]]) if (freeOf(p) && !(p.task && p.task.pri >= 2.4) && !(S.avatar && S.avatar.id === p.id)) G.Vg.H.setTask(p, { type: 'amor', id: q.id, love: l.id, pri: 2.4, st: 0, kind: 'amor' });
        continue;
      }
      // (done, or timed out: the arrow is spent)
      if (l.done || l.t > LOVE_T) {
        if (!l.done && l.t > LOVE_T && a && b && !a.partner && !b.partner) log(`${a.name} e ${b.name} nunca chegaram a se encontrar.`, 'heart', a.x, a.y);
        for (const v of [a, b]) if (running(v)) G.Vg.endTask(v);
        L.splice(k, 1);
      }
    }
  }

  // ------------------------------ Duelo de Campeões ------------------------------
  P.duel = function (x, y) {
    const S = G.S; const c = champions(x, y);
    if (!c) { S.faith = Math.min(999, S.faith + P.byId('duel').cost); return; }
    const rec = { id: S.nextId++, a: c.a.id, b: c.b.id, fa: c.fa, fb: c.fb, x: (c.a.x + c.b.x) / 2, y: (c.a.y + c.b.y) / 2, t: 0, sc: 0, fight: 0, band: [c.a.task && c.a.task.type === 'band' ? c.a.task.band : 0, c.b.task && c.b.task.type === 'band' ? c.b.task.band : 0] };
    st().duels.push(rec);
    const sc = G.Scene && G.Scene.play('pw-duelo', { cast: { a: c.a.id, b: c.b.id }, at: [rec.x, rec.y], imp: 3, title: 'Duelo de Campeões', kick: 'Destino', data: { rec: rec.id } });
    if (sc && sc.st === 'run') rec.sc = sc.id; else blades(rec);
    G.Audio && G.Audio.play('horn');
    P.witness(rec.x, rec.y, 18, 4, 4);
    log(`Os céus pararam a batalha: ${c.a.name}, de ${G.Fac.get(c.fa).name}, e ${c.b.name}, de ${G.Fac.get(c.fb).name}, vão lutar sozinhos. Quem cair, perde o campo.`, 'battle', rec.x, rec.y);
  };
  // the blades: the two released into a fight with each other, nobody else in between
  function blades(rec) {
    const S = G.S; const a = S.villagers.get(rec.a), b = S.villagers.get(rec.b); if (!a || !b) return;
    rec.fight = 1;
    G.Vg.H.setTask(a, { type: 'combat', id: b.id, pri: 4.7, any: true, kind: 'combat', duel: 1, champ: rec.id });
    G.Vg.H.setTask(b, { type: 'combat', id: a.id, pri: 4.7, any: true, kind: 'combat', duel: 1, champ: rec.id, def: true });
  }
  if (G.Scene) G.Scene.define('pw-duelo', { imp: 3, kick: 'Destino', *gen(c) {
    const a = c.v('a'), b = c.v('b'); if (!a || !b) return 'sem';
    if (!c.take('a', { vital: true, force: true, calm: true })) return 'ocupada';
    if (!c.take('b', { vital: true, force: true, calm: true })) return 'ocupada';
    c.tag('a', 'campeão'); c.tag('b', 'campeão');
    c.mood('tense'); c.focus('a', 'b');
    c.title('Destino', 'Duelo de Campeões');
    c.caption(`A batalha para. ${a.name} e ${b.name} saem das fileiras.`, { hold: 3 });
    c.cam(['a', 'b'], { zoom: 4 }); c.slow(0.5, 2);
    c.face('a', 'b'); c.face('b', 'a');
    yield c.approach('a', 'b', 2.2, { max: 12 });
    c.face('a', 'b'); c.face('b', 'a');
    yield c.say('a', c.pick([`${b.name}! Só você e eu.`, `Venha, ${b.name}. Os deuses estão olhando.`, `Que caia um de nós, e que acabe aqui.`]), { style: 'shout' });
    yield c.say('b', c.pick([`Que os céus decidam.`, `Hoje você conhece o chão, ${a.name}.`, `Por meu povo.`]));
    c.pose('a', 'brandish'); c.pose('b', 'brandish'); c.sfx('swish', null, 0.7); c.sfx('heartbeat'); c.slow(0.4, 2);
    c.snap('Frente a frente');
    yield 1.4;
    c.pose('a', ''); c.pose('b', '');
    c.release('a'); c.release('b');
    const rec = G.S.fates && G.S.fates.duels.find(d => d.id === c.data.rec); if (rec) blades(rec);
    yield c.until(() => !c.alive('a') || !c.alive('b') || c.v('a').captive || c.v('b').captive, 60);
    c.slow(0.5, 2);
    if (!c.alive('b') || (c.v('b') && c.v('b').captive)) { c.snap(`${b.name} cai`); c.caption(`${b.name} cai. ${a.name} ergue a arma — e o campo inteiro grita.`, { hold: 3 }); yield 3; return 'a'; }
    if (!c.alive('a') || (c.v('a') && c.v('a').captive)) { c.snap(`${a.name} cai`); c.caption(`${a.name} cai. ${b.name} fica de pé, sozinh${c.o('b')} no meio do campo.`, { hold: 3 }); yield 3; return 'b'; }
    return 'luta';
  } });
  // the end of a duel: the side whose champion fell breaks and runs; the other roars
  function settle(rec, winner) {
    const S = G.S; const D = S.fates.duels; const k = D.indexOf(rec); if (k >= 0) D.splice(k, 1);
    for (const id of [rec.a, rec.b]) { const v = S.villagers.get(id); if (v && v.task && v.task.champ === rec.id) G.Vg.endTask(v); }
    if (!winner) { log('O duelo de campeões terminou sem vencedor: a batalha engoliu os dois.', 'battle', rec.x, rec.y); return; }
    const W0 = winner === 'a' ? S.villagers.get(rec.a) : S.villagers.get(rec.b);
    const L0 = G.person(winner === 'a' ? rec.b : rec.a);
    const fw = winner === 'a' ? rec.fa : rec.fb, fl = winner === 'a' ? rec.fb : rec.fa;
    let fled = 0;
    for (const b of G.War.bands.values()) {
      const lead = b.fac === fl && S.villagers.get(b.members[0]);
      if (!lead || G.dist2(lead.x, lead.y, rec.x, rec.y) > 40 * 40) continue;
      if (b.st !== 'retorno') { b.st = 'retorno'; b.retreat = true; b.t = 0; fled++; }
    }
    for (const a of (S.wz && S.wz.armies) || []) { if (a.done || !Number.isFinite(a.morale)) continue; if (a.fac === fl) a.morale = Math.max(0, a.morale - 35); else if (a.fac === fw) a.morale = Math.min(100, a.morale + 20); }
    for (const v of S.villagers.values()) {
      if (G.dist2(v.x, v.y, rec.x, rec.y) > 18 * 18 || v.captive) continue;
      const f = G.Fac.idOfV(v); if (f === fw) { G.Vg.emote(v, 'happy', 2.5); v.fear = Math.max(0, v.fear - 10); } else if (f === fl) { G.Vg.emote(v, 'fear', 2.5); v.fear = Math.min(100, v.fear + 20); }
    }
    if (W0) {
      G.Politics.earn(G.Fac.get(fw), W0, 'campeao', true);
      W0.kills = (W0.kills || 0) + 1;
      bio(W0, `Venceu ${L0 ? L0.name : 'o campeão inimigo'} num duelo de campeões, diante de dois exércitos`, `Venci o duelo de campeões, e o campo inteiro viu`);
      // (and back to the band, if it is still out)
      const b = G.War.bands.get(winner === 'a' ? rec.band[0] : rec.band[1]);
      if (b && b.fac === G.Fac.idOfV(W0) && b.st !== 'retorno') { if (!b.members.includes(W0.id)) b.members.push(W0.id); G.Vg.H.setTask(W0, { type: 'band', band: b.id, pri: 3.2, kind: 'band' }); }
    }
    const wn = W0 ? W0.name : 'O campeão';
    log(`${wn}${W0 ? ' ' + G.Politics.epithet(W0) : ''} venceu o duelo de campeões${L0 ? ` contra ${L0.name}` : ''}. ${fled ? `As tropas de ${G.Fac.get(fl).name} largaram o campo.` : `${G.Fac.get(fl).name} perdeu o seu melhor guerreiro.`}`, 'battle', rec.x, rec.y);
    G.Lore && G.Lore.legend('duel:' + rec.id, `O Duelo de ${W0 ? W0.name : '?'} e ${L0 ? L0.name : '?'}`, `No ano ${S.day}, no meio de uma batalha entre ${G.Fac.get(fw).name} e ${G.Fac.get(fl).name}, os céus fizeram os dois exércitos parar. ${wn} e ${L0 ? L0.name : 'o campeão inimigo'} lutaram sozinhos, e ${wn} venceu.`, { kind: 'guerra' });
  }
  function updateDuels(dt) {
    const S = G.S; const D = S.fates.duels;
    for (let k = D.length - 1; k >= 0; k--) {
      const rec = D[k]; rec.t += dt;
      const a = S.villagers.get(rec.a), b = S.villagers.get(rec.b);
      const down = v => !v || v.captive;
      if (down(a) || down(b)) { settle(rec, down(a) && down(b) ? null : down(b) ? 'a' : 'b'); continue; }
      const scene = rec.sc && G.Scene && G.Scene.get(rec.sc);
      // (the scene is gone — a save, an interruption — and the two are not at each other's throats: the battle took them)
      if (!(scene && scene.st === 'run') && !(rec.fight && a.task && a.task.champ === rec.id && b.task && b.task.champ === rec.id)) {
        // (the scene never got to the blades — the two were busy, or a save forgot it: they fight now, without the show)
        if (!rec.fight) { blades(rec); continue; }
        settle(rec, null); continue;
      }
      if (rec.t > DUEL_T) settle(rec, null);
    }
  }

  // ------------------------------ Sonho Coletivo ------------------------------
  P.dream = function (x, y, k) {
    const S = G.S; const f = P.facAt(x, y); if (!f) return;
    const cap = G.Fac.capitalOf(f.id); if (!cap) return;
    const people = [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) === f.id);
    for (const v of people) { if (v.sleeping) G.Vg.emote(v, 'zzz', 3); else G.Vg.emote(v, 'awe', 3); v.devotion = Math.min(100, v.devotion + 6); }
    let txt = '';
    if (k === 'obra') {
      const site = V.findSite(cap, 'monument');
      const b = site && V.startProject(cap, 'monument', site);
      if (b) { G.Village.addStock('stone', 90, f.id); G.Village.addStock('wood', 15, f.id); txt = `Todo o povo de ${f.name} sonhou a mesma noite com um monumento em ${cap.name}. Ao acordar, já separavam a pedra.`; }
      else txt = `O povo de ${f.name} sonhou com uma grande obra — mas acordou sem lugar onde erguê-la.`;
    } else if (k === 'paz') {
      let ok = 0, no = 0;
      f.weariness = 100;
      for (const fo of G.Fac.enemiesOf(f.id)) { const r = G.Fac.rel(f.id, fo.id); if (!r) continue; if (G.Politics.answerPeace(f, fo, r)) ok++; else no++; }
      txt = `Todo o povo de ${f.name} sonhou com a paz.${ok ? ` ${ok > 1 ? ok + ' guerras acabaram' : 'Uma guerra acabou'} ao amanhecer.` : ''}${no ? ` ${no > 1 ? 'Os inimigos recusaram' : 'O inimigo recusou'} — mas ${f.name} não quer mais lutar.` : ''}`;
    } else if (k === 'fe') {
      for (const v of people) { v.devotion = Math.min(100, v.devotion + 35); if (v.age >= 8 && !v.sleeping && !(v.task && v.task.pri >= 2) && G.R() < 0.5) G.Vg.give(v, { type: 'pray', pri: 1.2, kind: 'pray' }); }
      S.faith = Math.min(999, S.faith + Math.min(80, people.length * 0.5));
      txt = `Todo o povo de ${f.name} sonhou com você na mesma noite. Acordaram chorando, e os templos se encheram.`;
    } else if (k === 'mar') {
      const r = unknownLand(f); const K = G.Know;
      if (r && K.raise(f.id, r, K.SIG, { via: 'sonho' })) txt = `Todo o povo de ${f.name} sonhou com uma terra ${K.dir(r.cx - cap.cx, r.cy - cap.cy)}, além da água. Os velhos dizem que é um chamado.`;
      else txt = `O povo de ${f.name} sonhou com o mar — e com nada além dele.`;
    }
    const F = st(); F.dreams.push({ fac: f.id, k, day: S.day }); if (F.dreams.length > 30) F.dreams.shift();
    G.Audio && G.Audio.play('magic');
    G.FX && G.FX.ring(cap.cx, cap.cy, 0.5, 10, 2, 'rgba(200,190,255,0.8)', 2.4, true);
    if (txt) log(txt, k === 'paz' ? 'peace' : k === 'mar' ? 'sea' : k === 'obra' ? 'wonder' : 'prophecy', cap.cx, cap.cy);
    G.Lore && G.Lore.note('dream', { fac: f.id, k });
  };

  // ------------------------------ tasks, update, save ------------------------------
  const E = G.Eco;
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'amor') return runAmor(v, t, dt, H), true; return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'amor') { const o = G.S.villagers.get(t.id); return t.st < 2 ? `Correndo ao encontro de ${o ? o.name : 'seu amor'}!` : `Nos braços de ${o ? o.name : 'seu amor'}`; }
    return oldText(v, t);
  };
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) {
    if (prevUpd) prevUpd(dt);
    const F = G.S.fates; if (!F) return;
    if (F.loves.length) updateLoves(dt);
    if (F.duels.length) updateDuels(dt);
  };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.fates) out.fates = G.S.fates; },
    load(o) {
      const f = o.fates; const fin = Number.isFinite;
      if (!f || !Array.isArray(f.loves) || !Array.isArray(f.duels) || !Array.isArray(f.dreams)) { G.S.fates = null; return; }
      // (a damaged save loses the damaged arrows, not the world; a duel's scene does not survive a save: the update settles it)
      f.loves = f.loves.filter(l => l && fin(l.t) && l.a && l.b);
      f.duels = f.duels.filter(d => d && fin(d.t) && fin(d.x) && fin(d.y) && d.a && d.b && Array.isArray(d.band)).map(d => Object.assign(d, { sc: 0 }));
      f.dreams = f.dreams.filter(d => d && d.fac && d.k);
      G.S.fates = f;
    },
  });
})(window.G);
