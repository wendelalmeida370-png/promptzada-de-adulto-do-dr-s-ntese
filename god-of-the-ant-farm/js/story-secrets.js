'use strict';
// ============================================================
//  The night stories, staged: O INQUÉRITO and O QUE VIU NA NOITE.
//
//  O INQUÉRITO
//    A ORDEM       the ruler calls the one who will look (and, sometimes, the one
//                  who gives the order is one of them — only you know).
//    AS PISTAS     an old woman by the well who saw lights in the woods; candle wax
//                  and dried blood where nobody should go at night.
//    A VIGÍLIA     on the night of the meeting, hidden among the trees: the robes
//                  arriving one by one, the brazier, the chant, maybe someone on
//                  their knees in the circle; a twig that snaps, a hood that turns
//                  and comes this way with a torch; and the master throwing the
//                  hood back — a face everyone knows.
//    then: the torch held high ("in the ruler's name!") and the hoods running —
//    or back to town alive, the word before the throne, and the doors knocked
//    at dawn. Or the chase through the woods, and the knife.
//  O QUE VIU NA NOITE
//    THE MORNING   pale at the table, the question of someone who loves them.
//    THE STEPS     dusk, the way home, footsteps that stop when they stop.
//    THE PURSE / THE KNOCK   the silence bought, or the hood offered.
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn || !St.DEF.inquerito || !St.DEF.testemunha) return;
  const Sc = new Proxy({}, { get: (_, k) => G.Secrets && G.Secrets[k] }); // (secrets.js loads after the stories)
  const L = St.lib;
  const { pe, desc, cap1 } = L;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const names = vs => { const n = vs.map(v => v.name); return n.length <= 1 ? n[0] || '' : n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1]; };
  const free = v => v && !v.dead && !v.captive && !v.held && !v.aboard && !v.ug && !(v.task && (v.task.type === 'jail' || v.task.type === 'condemned' || v.task.type === 'combat' || v.task.type === 'band' || v.task.type === 'conclave'));
  const rulerOf = fid => { const f = G.Fac.get(fid); return f && f.leader ? P(f.leader) : null; };
  const titleOf = (fid, r) => { const f = G.Fac.get(fid); return f && r ? G.Politics.title(f, r) : 'senhor'; };
  const rulerWord = fid => { const r = rulerOf(fid); return r ? (r.g === 'f' ? 'da ' : 'do ') + titleOf(fid, r).toLowerCase() : 'de quem governa'; };
  const socOf = s => (s.data.soc ? Sc.get(s.data.soc) : null);
  const deW = w => { const m = /^(o|a|os|as) (.*)$/.exec(w || ''); return m ? ({ o: 'do', a: 'da', os: 'dos', as: 'das' })[m[1]] + ' ' + m[2] : 'de ' + w; };
  const what = s => s.data.what || (socOf(s) ? Sc.art(socOf(s).name) : s.data.fake ? Sc.art(s.data.fake) : 'uma seita');
  const nightNow = () => G.S.time > 0.74 || G.S.time < 0.12;
  // a hiding place near a lodge: among trees or rocks, on the side away from the town
  function hideNear(l) {
    const S = G.S; const set = S.settlements.get(l.set); const away = set ? Math.atan2(l.y - set.cy, l.x - set.cx) : G.hash(l.id) * TAU;
    let best = null, bs = -1;
    for (let k = 0; k < 14; k++) {
      const a = away + (k - 7) * 0.32; const q = Sn.spot(l.x + Math.cos(a) * 5.2, l.y + Math.sin(a) * 5.2, 1.6, { notNear: [l.x, l.y], notR: 4 }); if (!q) continue;
      let cover = 0; for (const t of S.trees.values()) if (Math.abs(t.x - q[0]) < 1.6 && Math.abs(t.y - q[1]) < 1.6) cover++;
      for (const r of S.rocks.values()) if (Math.abs(r.x - q[0]) < 1.4 && Math.abs(r.y - q[1]) < 1.4) cover += 0.7;
      const sc = cover - Math.abs(k - 7) * 0.08; if (sc > bs) { bs = sc; best = q; }
    }
    return best || Sn.spot(l.x + 5, l.y + 3, 3);
  }
  // somebody old, or anybody, who talks to strangers at the well
  function gossipNear(p) {
    let best = null, bs = -1;
    for (const o of G.S.villagers.values()) {
      if (o === p || o.set !== p.set || o.captive || o.sleeping || o.inside || o.age < 30 || o.secret || (o.task && o.task.pri >= 2)) continue;
      const d = G.dist(o.x, o.y, p.x, p.y); if (d > 22) continue;
      const sc = (o.age > 55 ? 2 : 0) + (o.g === 'f' ? 0.4 : 0) - d * 0.05; if (sc > bs) { bs = sc; best = o; }
    }
    return best;
  }

  // ====================================================================================
  //  A ORDEM — the ruler calls
  // ====================================================================================
  Sn.define('iq-ordem', { imp: 2, kick: 'O Inquérito', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Chamad' + oa(v) + ' ao palácio' : null), *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const W_ = what(s); const q = socOf(s);
    c.tag('p', 'quem vai procurar');
    let r = c.v('r');
    if (r && !c.take('r', { keep: true, force: true })) r = null;
    if (r) {
      c.tag('r', titleOf(s.data.fac, r).toLowerCase());
      const at = Sn.spot(r.x + 1, r.y + 0.8, 1.5) || [r.x + 1, r.y + 1];
      yield c.walk('p', at, { max: 70 });
      // (no way through, or too slow: the ruler comes down to meet them; and if not even so, a messenger)
      if (G.dist(p.x, p.y, r.x, r.y) > 3) yield c.approach('r', 'p', 1.3, { max: 30 });
      if (G.dist(p.x, p.y, r.x, r.y) > 3.5) { c.release('r'); r = null; }
    }
    c.ready();
    c.mood('dread');
    c.chapter(St.say(s, 'iq-ordem', { RULER: r ? G.Politics.styled(G.Fac.get(s.data.fac), r) : 'quem governa', WHAT: W_ }) || `${p.name} recebeu a ordem de descobrir ${W_}.`, { k: 'iq-ordem' });
    yield c.title('O Inquérito', 'A Ordem');
    if (!r) { c.caption(`Um mensageiro trouxe a ordem: descobrir ${W_}, se existir.`); c.cam(['p'], { zoom: 3.8 }); yield 3.5; c.pose('p', 'read'); yield 2.4; return 'ok'; }
    c.face('p', 'r'); c.face('r', 'p'); c.cam(['p', 'r'], { zoom: 4 });
    c.pose('p', 'kneel');
    yield c.say('r', pick([`Dizem que ${W_} se reúne à noite, fora dos muros.`, `Ouvi falar de capuzes, de cânticos no escuro. ${cap1(deW(W_))}.`, `Há gente na minha cidade que jura segredo a outro senhor. Dizem que se chamam ${q ? q.name : W_}.`]));
    yield c.say('r', pick([`Quero nomes.`, `Descubra se é verdade. E quem são.`, `Traga-me os rostos debaixo dos capuzes.`]));
    c.pose('p', '');
    yield c.say('p', pick([`Terá nomes, ${titleOf(s.data.fac, r).toLowerCase()}.`, `Se existirem, eu acho.`, `Eu começo hoje.`]));
    // the one who gives the order may be one of them
    if (q && r.secret === q.id) {
      c.cam(['r'], { zoom: 4.6 });
      yield c.say('r', pick([`Muito bem. E me conte tudo... primeiro.`, `Ótimo. Ninguém mais deve saber o que você achar.`]), { style: 'whisper' });
      c.caption(`Só você sabe: quem deu a ordem jurou segredo à mesma ordem.`, { hold: 3 });
      s.data.rulerIn = 1;
    }
    c.snap('A ordem');
    return 'ok';
  } });

  // ====================================================================================
  //  AS PISTAS — the old woman at the well; the wax and the blood
  // ====================================================================================
  Sn.define('iq-pista1', { imp: 1, kick: 'O Inquérito', lazy: true, doing: () => 'Fazendo perguntas pela cidade', *gen(c) {
    const s = c.story(); const p = c.v('p'); const w = c.v('w'); if (!s || !p || !w) return 'sem';
    if (!c.take('p', { vital: true, force: true }) || !c.take('w', { keep: true })) return 'ocupada';
    c.tag('p', 'investiga'); c.tag('w', w.age > 55 ? (w.g === 'f' ? 'uma velha' : 'um velho') : 'quem sabe de algo');
    yield c.approach('p', 'w', 1.1, { max: 50 });
    if (G.dist(p.x, p.y, w.x, w.y) > 2.5) yield c.approach('w', 'p', 1.1, { max: 20 });
    if (G.dist(p.x, p.y, w.x, w.y) > 3) { c.chapter(St.say(s, 'iq-pista', {}) || `Uma velha contou a ${p.name} que viu luzes de noite fora da cidade.`, { k: 'iq-pista' }); return 'longe'; }
    c.ready();
    c.face('p', 'w'); c.face('w', 'p'); c.cam(['p', 'w'], { zoom: 4.2 });
    yield c.title('O Inquérito', 'As Pistas');
    const q = socOf(s); const l = q && q.lodges[0];
    yield c.say('p', pick([`Dizem que a senhora vê tudo daqui.`, `Já viu gente andando de noite por aí?`, `Uma pergunta só, e eu vou embora.`]));
    c.pose('w', 'talk');
    if (q && l) {
      const where = l.kind === 'caverna' ? 'para os lados da caverna' : l.kind === 'bosque' ? 'no bosque, perto da clareira' : 'saindo de um porão, tarde da noite';
      yield c.say('w', pick([`Luzes... ${where}. Nas noites sem lua.`, `Eu vi capuzes, ${where}. E um canto baixo, que não é de gente daqui.`]), { style: 'whisper' });
      yield c.say('p', `Que mais?`);
      yield c.say('w', pick([`Mais nada. E eu não disse nada.`, `Gente importante. Tinham anéis nos dedos.`, `Não pergunte mais. Pelo seu bem.`]), { style: 'whisper' });
      c.chapter(St.say(s, 'iq-pista', {}) || `Uma velha contou a ${p.name} que viu luzes de noite fora da cidade.`, { k: 'iq-pista' });
    } else {
      yield c.say('w', pick([`Seita? Aqui? Isso é conversa de taverna.`, `Dizem muita coisa por aí. Eu nunca vi nada.`, `A senhora do poço jura que sim. Mas ela jura tudo.`]));
      yield c.say('p', `Hm.`, { style: 'think' });
      c.chapter(`${p.name} perguntou por toda a cidade. Ouviu muito, e nada que se pudesse provar.`);
    }
    c.snap('As perguntas');
    c.pose('w', '');
    return 'ok';
  } });
  Sn.define('iq-pista2', { imp: 1, kick: 'O Inquérito', lazy: true, doing: () => 'Seguindo uma pista fora da cidade', *gen(c) {
    const s = c.story(); const p = c.v('p'); const q = socOf(s); if (!s || !p || !q || !q.lodges.length) return 'sem';
    const l = q.lodges.reduce((a, b) => (G.dist(p.x, p.y, a.x, a.y) < G.dist(p.x, p.y, b.x, b.y) ? a : b));
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    c.tag('p', 'investiga');
    const at = Sn.spot(l.x + 0.6, l.y + 0.6, 1.5) || [l.x, l.y];
    yield c.walk('p', at, { max: 90 });
    c.ready();
    c.mood('dread');
    c.prop('candle', l.x + 0.4, l.y - 0.2, { secs: 30 });
    c.cam(['p'], { zoom: 4.4 });
    c.pose('p', 'kneel'); c.emote('p', 'question', 2.5);
    yield 1.8;
    c.sfx('reveal', null, 0.5);
    yield c.say('p', pick([`Cera de vela. Aqui, onde ninguém vem.`, `Um círculo riscado no chão...`, `Cinzas ainda mornas.`]), { style: 'think' });
    if (q.deeds > 0) { yield c.say('p', `E isto aqui... é sangue.`, { style: 'think' }); c.emote('p', 'fear', 2.5); }
    c.snap('A pista');
    c.chapter(St.say(s, 'iq-nome', {}) || `${p.name} achou rastros de quem se reúne ${Sc.lodgeName(l)}.`, { k: 'iq-nome' });
    s.data.lodgeSeen = l.id;
    c.pose('p', '');
    yield c.say('p', pick([`Agora é esperar a noite.`, `Vocês voltam. E eu vou estar aqui.`]), { style: 'think' });
    return 'ok';
  } });

  // ====================================================================================
  //  A VIGÍLIA — the night of the meeting
  // ====================================================================================
  Sn.define('iq-vigilia', { imp: 3, kick: 'O Inquérito', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Escondid' + oa(v) + ' no escuro, vigiando' : null), *gen(c) {
    const s = c.story(); const p = c.v('p'); const q = socOf(s); const l = q && q.lodges.find(x => x.id === c.data.lodge);
    if (!s || !p || !q || !l) return 'sem';
    if (!c.take('p', { vital: true, force: true, calm: true })) return 'ocupada';
    const i = Sc.inquiry(s.data.inq); if (i) { i.hold = G.S.clock + DAY() * 0.4; i.long = Math.max(i.long || 3.5, (i.t / DAY()) + 2); }
    c.tag('p', 'escondid' + oa(p));
    const hide = hideNear(l);
    yield c.walk('p', hide, { max: 140 });
    c.pose('p', 'hide'); c.face('p', [l.x, l.y]);
    p.lantern = false;
    // waiting (unseen): if they do not come tonight, another night
    yield c.until(() => Sc.meetOfLodge(l.id) || (G.S.time > 0.97 || (G.S.time > 0.2 && G.S.time < 0.6)), 300);
    let m = Sc.meetOfLodge(l.id);
    if (!m) { c.chapter(`${p.name} passou a noite em claro, escondid${oa(p)} perto ${deW(l.name)}. Ninguém veio.`); return 'vazio'; }
    const mid = m.id;
    const hold = () => { const mm = Sc.meetById(mid); if (mm) mm.keep = G.S.clock + 25; return mm; };
    hold();
    c.ready();
    c.mood('dread');
    c.chapter(`${p.name} se escondeu perto ${deW(l.name)}, na noite em que eles vinham.`, { k: 'iq-vigilia' });
    c.title('O Inquérito', 'A Vigília');
    c.caption(`Noite fechada, ${Sc.lodgeName(l)}. ${p.name} espera, sem respirar.`);
    c.cam(['p', [l.x, l.y]], { zoom: 4 });
    yield c.say('p', pick([`Se vierem, é hoje.`, `Silêncio... só o vento.`, `Vamos ver quem são vocês.`]), { style: 'think' });
    // they come, one by one, out of the dark, and put on the robes
    const shown = new Set(); let lastLine = c.sc.t;
    const ARR = [`Ali. Um vem pelo caminho.`, `Mais um...`, `Esse anda como gente rica.`, `Uma tocha. Vem pra cá.`, `Conheço esse manto? Não... não sei.`, `Quantos ainda vão chegar?`];
    for (let k = 0; k < 14; k++) {
      m = hold(); if (!m || m.phase === 'rite') break;
      const near = m.ids.map(P).filter(v => v && !shown.has(v.id) && v.task && v.task.type === 'conclave' && v.task.m === mid && G.dist(v.x, v.y, l.x, l.y) < 11).sort((a, b) => G.dist(a.x, a.y, l.x, l.y) - G.dist(b.x, b.y, l.x, l.y))[0];
      if (near) {
        shown.add(near.id); c.tag(near, near.id === q.master ? 'chega por último, sem pressa' : 'encapuzad' + oa(near));
        c.cam([near, [l.x, l.y]], { zoom: 4.3, soft: 1 });
        if (c.sc.t - lastLine > 6 && G.R() < 0.7) { lastLine = c.sc.t; c.say('p', ARR[(shown.size - 1) % ARR.length], { style: 'think', wait: 0 }); }
        yield 3.4;
      } else { c.cam(['p', [l.x, l.y]], { zoom: 4, soft: 1 }); yield 2; }
    }
    yield c.until(() => { const mm = hold(); return !mm || mm.phase === 'rite'; }, 30);
    m = hold(); if (!m) return 'vazio';
    const hoods = m.ids.map(P).filter(v => v && v.task && v.task.type === 'conclave');
    const ring = () => hoods.filter(v => P(v.id) && G.dist(v.x, v.y, l.x, l.y) < 5);
    hoods.forEach(v => c.tag(v, v.id === q.master ? 'o que conduz' : 'encapuzad' + oa(v)));
    c.sfx('choir');
    c.cam([[l.x, l.y]].concat(ring().slice(0, 5)), { zoom: 4 });
    c.caption(`${ring().length > 1 ? ring().length + ' figuras' : 'Uma figura'} de manto em volta do braseiro. Cantam numa língua que ninguém fala.`);
    yield 4.2;
    c.snap('A reunião');
    c.cam(['p'], { zoom: 4.5 });
    yield c.say('p', pick([`É verdade. Deuses, é tudo verdade.`, `Eu conheço esse andar...`, `Quantos são? Cinco? Seis?`]), { style: 'think' });
    hold();
    // someone on their knees in the circle
    const vic = P(m.victim);
    if (vic) {
      c.tag(vic, 'no meio do círculo'); c.cam([vic, [l.x, l.y]], { zoom: 3.6 });
      c.caption(`E no meio do círculo, de joelhos: ${vic.name}.`);
      yield 2.6;
      if (p.courage > 0.62) {
        // (the brave do not wait for the knife)
        s.data.stop = 1;
      } else {
        yield c.until(() => { const mm = Sc.meetById(mid); return !mm || mm.blood; }, 16);
        c.slow(0.4, 2); c.sfx('gasp');
        yield c.say('p', pick([`Não... não, não...`, `Eles mataram... ali, na pedra...`]), { style: 'think' });
        c.snap('O sangue');
      }
    }
    // the twig
    m = hold();
    let seen = false;
    const others = hoods.filter(v => v.id !== q.master && P(v.id));
    if (m && others.length && G.R() < 0.55) {
      const h = others[0];
      c.sfx('twig'); c.pose('p', 'cower'); c.cam(['p'], { zoom: 4.6 });
      yield 0.8;
      if (c.take(h, { keep: true, force: true })) {
        h.holdTorch = true; c.cam([h, 'p'], { zoom: 'fit' });
        c.walk(h, Sn.spot(hide[0] + (l.x - hide[0]) * 0.35, hide[1] + (l.y - hide[1]) * 0.35, 1.2) || hide, { slow: true, max: 9 });
        c.sfx('heartbeat'); c.mood('tense');
        yield c.say(h, pick([`Quem está aí?`, `Tem alguém no mato...`, `Eu ouvi alguma coisa.`]), { style: 'whisper' });
        yield 1.6;
        c.slow(0.45, 2.4); c.sfx('heartbeat');
        yield 1.4;
        seen = G.R() < 0.16 + (1 - p.courage) * 0.22 + (s.data.rulerIn ? 0.08 : 0);
        if (!seen) {
          c.sfx('owl'); yield 0.6;
          const mst = P(q.master);
          if (mst && hoods.includes(mst)) yield c.say(mst, pick([`Irmão. Volte ao círculo.`, `É só uma coruja. Volte.`]), { style: 'whisper' });
          h.holdTorch = false; c.release(h);
          c.mood('dread');
          yield 1.5;
        } else {
          h.holdTorch = false;
          c.face(h, 'p'); c.slow(0.5, 1.2);
          yield c.say(h, pick([`ESPIÃO!`, `UM ESPIÃO! PEGUEM!`]), { style: 'shout' });
        }
      }
    }
    if (seen) return yield* chase(c, s, p, q, l, hoods, mid);
    // the master throws back the hood
    m = hold();
    const mst = P(q.master) && hoods.includes(P(q.master)) ? P(q.master) : hoods.find(v => P(v.id));
    if (m && mst) {
      c.cam([mst], { zoom: 4.8 });
      yield 1.2;
      mst.unmask = true; mst.act = 'unmask'; mst.actT = 0;
      c.sfx('reveal'); c.slow(0.4, 1.8);
      const who = mst.reigned || (G.Fac.ofV(mst) && G.Fac.ofV(mst).leader === mst.id) ? G.Politics.styled(G.Fac.ofV(mst), mst) : `${mst.name}, ${desc(mst)}`;
      c.caption(`Sob o capuz: ${who}.`, { hold: 3.2 });
      c.snap('O rosto');
      c.cam(['p'], { zoom: 4.6 });
      yield c.say('p', pick([`${mst.name}...?!`, `Não pode ser... ${mst.name}?`, `Logo ${mst.name}...`]), { style: 'think' });
      s.data.master = mst.id;
    }
    s.data.names = hoods.filter(v => P(v.id) && G.Fac.idOfV(v) === s.data.fac).map(v => v.id);
    // and now: break in, or go back alive with the names
    const bold = p.courage > 0.6 || pe(p).agg > 0.66 || s.data.stop;
    if (bold && Sc.meetById(mid)) {
      p.holdTorch = true; c.pose('p', ''); c.mood('tense');
      const at = Sn.spot(p.x + (l.x - p.x) * 0.6, p.y + (l.y - p.y) * 0.6, 1.2) || [l.x + 2, l.y + 1];
      c.cam(['p', [l.x, l.y]], { zoom: 'fit' });
      yield c.walk('p', at, { run: true, max: 8 });
      c.pose('p', 'point');
      yield c.say('p', `Em nome ${rulerWord(s.data.fac)}! Ninguém se mexe!`, { style: 'shout' });
      c.slow(0.5, 1.6);
      c.murmur(hoods, ['Fujam!', 'Um espião!', 'Corram!', 'Os guardas!'], { p: 0.8, style: 'shout' });
      p.holdTorch = false;
      if (Sc.exposeMeet(s.data.inq, mid)) { c.snap('Descobertos'); s.data.broke = 1; }
      yield 2.5;
      return 'invadiu';
    }
    c.pose('p', 'hide');
    yield c.say('p', pick([`Agora eu tenho nomes.`, `Preciso sair daqui. Vivo.`, `Amanhã ${rulerOf(s.data.fac) ? 'o palácio' : 'a cidade'} vai saber.`]), { style: 'think' });
    const set = G.S.settlements.get(l.set);
    const back = set ? Sn.spot(p.x + (set.cx - p.x) * 0.3, p.y + (set.cy - p.y) * 0.3, 2) : c.beside('p', 5);
    c.cam(['p'], { zoom: 3.6 });
    if (back) yield c.walk('p', back, { sneak: true, max: 10 });
    return 'viu';
  } });
  // seen: the run through the dark
  function* chase(c, s, p, q, l, hoods, mid) {
    const set = G.S.settlements.get(l.set) || G.S.settlements.get(p.set);
    const safe = set ? Sn.spot(set.cx, set.cy, 3) : c.beside('p', 12);
    c.mood('tense');
    c.walk('p', safe, { run: true, max: 40 });
    const hunters = hoods.filter(v => P(v.id) && v.id !== q.master && v.age < 55).slice(0, 2).filter(v => c.take(v, { keep: true, force: true }));
    for (const h of hunters) c.approach(h, 'p', 0.8, { run: true, max: 30 });
    c.cam(['p'].concat(hunters), { zoom: 4 });
    c.snap('A fuga no escuro');
    c.sfx('heartbeat');
    const t0 = c.sc.t; let cry = t0;
    const CRY_H = ['Ali! Ali!', 'Não deixa fugir!', 'Pelo rio! Cerca pelo rio!', 'Eu vi o rosto!', 'Volta aqui!'];
    const CRY_P = ['Corre... corre...', 'Não olha pra trás.', 'As luzes da cidade... falta pouco...', 'Deuses, me ajudem.'];
    while (c.sc.t - t0 < 24) {
      yield 0.4;
      const pp = P(p.id); if (!pp) return 'pego';
      if (set && G.dist(pp.x, pp.y, set.cx, set.cy) < 6) break;
      // the camera runs with them: the one who flees, and the nearest torch behind
      const near = hunters.filter(h => P(h.id)).sort((a, b) => G.dist(a.x, a.y, pp.x, pp.y) - G.dist(b.x, b.y, pp.x, pp.y))[0];
      if (near && G.dist(near.x, near.y, pp.x, pp.y) < 9) c.cam(['p', near], { zoom: 4, soft: 1 }); else c.cam(['p'], { zoom: 4.3, soft: 1 });
      if (c.sc.t - cry > 3.6) {
        cry = c.sc.t;
        if (near && G.R() < 0.55) c.say(near, CRY_H[Math.floor(G.R() * CRY_H.length)], { style: 'shout', wait: 0 });
        else c.say('p', CRY_P[Math.floor(G.R() * CRY_P.length)], { style: 'think', wait: 0 });
        if (G.R() < 0.4) c.sfx('heartbeat');
      }
      for (const h of hunters) {
        if (!P(h.id) || G.dist(h.x, h.y, pp.x, pp.y) > 0.95) continue;
        if (G.R() < 0.45) {
          c.pose(h, 'stab'); c.sfx('gore'); c.slow(0.35, 2.2); c.cam([pp], { zoom: 4.6 });
          c.release('p');
          Sc.silence(h, pp, q.id, s.data.inq);
          c.snap('O fim no escuro');
          yield 2.5;
          return 'pego';
        }
        c.pose(h, 'lie'); c.sfx('thud'); c.say('p', pick(['Me larga!', 'Sai!']), { style: 'shout', wait: 0 });
      }
    }
    for (const h of hunters) c.release(h);
    s.data.names = hoods.filter(v => P(v.id) && G.Fac.idOfV(v) === s.data.fac).map(v => v.id);
    c.cam(['p'], { zoom: 4 }); c.pose('p', 'weepk');
    yield c.say('p', pick([`Viv${oa(p)}... ainda viv${oa(p)}.`, `Eles sabem meu rosto agora.`]), { style: 'think' });
    return 'viu';
  }

  // ====================================================================================
  //  A DENÚNCIA and A BATIDA — the word before the throne, and the doors at dawn
  // ====================================================================================
  Sn.define('iq-denuncia', { imp: 2, kick: 'O Inquérito', lazy: true, doing: () => 'Indo contar ao palácio o que viu', *gen(c) {
    const s = c.story(); const p = c.v('p'); const r = c.v('r'); if (!s || !p || !r) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    c.take('r', { keep: true, force: true });
    c.tag('p', 'quem viu'); c.tag('r', titleOf(s.data.fac, r).toLowerCase());
    yield c.walk('p', Sn.spot(r.x + 1, r.y + 0.8, 1.5) || [r.x + 1, r.y + 1], { max: 80 });
    c.ready();
    c.face('p', 'r'); c.face('r', 'p'); c.cam(['p', 'r'], { zoom: 4.2 });
    yield c.title('O Inquérito', 'Diante do Trono');
    const mst = PD(s.data.master); const ids = (s.data.names || []).map(PD).filter(Boolean);
    yield c.say('p', `Eu vi, ${titleOf(s.data.fac, r).toLowerCase()}. Com estes olhos.`);
    yield c.say('r', `Quem?`);
    yield c.say('p', mst ? `${mst.name}.${ids.length > 1 ? ' E ' + names(ids.filter(v => v.id !== mst.id).slice(0, 3)) + '.' : ''}` : `Não vi os rostos. Mas sei onde se reúnem.`);
    const q = socOf(s);
    if (q && r.secret === q.id) {
      c.cam(['r'], { zoom: 4.6 }); c.mood('dread');
      yield c.say('r', pick([`Você deve ter se enganado. Vá para casa.`, `Isso é muito grave. Não fale disso com mais ninguém.`]));
      c.caption(`${r.name} agradeceu. E, assim que ${p.name} saiu, mandou chamar alguém de confiança.`, { hold: 3.5 });
      s.data.betrayed = 1;
      const w = (q.wit || []).find(x => x.id === p.id); if (!w) (q.wit || (q.wit = [])).push({ id: p.id, soc: q.id, day: G.S.day, lodge: (q.lodges[0] || {}).id, fate: 'calar', at: G.S.day + 0.2 });
      return 'traido';
    }
    c.cam(['r'], { zoom: 4.4 });
    yield c.say('r', pick([`Prendam todos. Ao amanhecer.`, `Então amanhã cedo eles conhecem a minha justiça.`, `Você fez bem. Agora deixe com a guarda.`]));
    c.snap('Diante do trono');
    return 'ordem';
  } });
  Sn.define('iq-batida', { imp: 2, kick: 'O Inquérito', lazy: true, doing: () => 'Levando os guardas às portas certas', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    const ids = (s.data.names || []).filter(id => G.S.villagers.has(id)); const tgt = P(s.data.master) || P(ids[0]);
    if (!tgt) return 'vazio';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    // two guards
    const guards = [];
    for (const o of G.S.villagers.values()) { if (guards.length >= 2) break; if (o.role !== 'guerreiro' || o.captive || o.sleeping || G.Fac.idOfV(o) !== s.data.fac || G.dist(o.x, o.y, p.x, p.y) > 30 || (o.task && o.task.pri >= 3)) continue; if (c.take(o, { force: true })) { guards.push(o); c.tag(o, 'guarda'); } }
    const home = G.S.buildings.get(tgt.home); const door = home && home.built ? G.Village.frontTile(home) : [tgt.x, tgt.y];
    const at = Sn.spot(door[0] + 0.6, door[1] + 0.8, 1.5) || door;
    for (const g of guards) c.walk(g, Sn.spot(at[0] + G.rr(-0.8, 0.8), at[1] + 0.6, 1.2) || at, { max: 80 });
    yield c.walk('p', at, { max: 80 });
    c.ready();
    c.mood('tense'); c.tag('p', 'quem apontou'); c.tag(tgt, 'acusad' + oa(tgt));
    c.title('O Inquérito', 'A Batida');
    c.caption(`Amanhecer em ${(G.S.settlements.get(tgt.set) || {}).name || 'a cidade'}. Os guardas batem à porta.`);
    c.cam(['p'].concat(guards), { zoom: 3.8 });
    const g0 = guards[0] || p;
    c.pose(g0, 'knock'); c.sfx('knock'); yield 1.4;
    yield c.say(g0, pick([`Abram! Em nome ${rulerWord(s.data.fac)}!`, `${tgt.name}! Sabemos que está aí!`]), { style: 'shout' });
    if (c.take(tgt, { force: true })) {
      c.walk(tgt, Sn.spot(at[0], at[1] + 0.8, 1) || at, { max: 15 });
      yield 2;
      c.face(tgt, 'p'); c.face('p', tgt);
      c.cam([tgt, 'p'], { zoom: 4.4 });
      yield c.say(tgt, pick([`Você... foi você.`, `Vocês não sabem com quem estão mexendo.`, `Isso não acaba comigo.`]));
      c.pose(tgt, 'bound'); c.sfx('hit');
      c.snap('A batida');
      yield 1.8;
      c.release(tgt);
    }
    for (const g of guards) c.release(g);
    const caught = Sc.raid(s.data.inq, ids);
    s.data.raided = caught.map(v => v.id);
    yield 1.5;
    return caught.length ? 'presos' : 'vazio';
  } });

  // told to the wrong ear: a knife on the way home
  Sn.define('iq-silencio', { imp: 3, kick: 'O Inquérito', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Voltando para casa no escuro' : null), *gen(c) {
    const s = c.story(); const p = c.v('p'); const h = c.v('h'); const q = s && socOf(s); if (!s || !p || !h || !q) return 'sem';
    if (!c.take('p', { vital: true, force: true, calm: true }) || !c.take('h', { keep: true, force: true, calm: true })) return 'ocupada';
    const home = G.Eco.homeOf(p); const door = home ? G.Village.frontTile(home) : c.beside('p', 10);
    const r = rulerOf(s.data.fac); const RT = r ? titleOf(s.data.fac, r).toLowerCase() : 'governante';
    // the way home; the steps behind
    c.walk('p', door, { slow: true, max: 80 });
    yield c.approach('h', 'p', 5, { sneak: true, max: 80 });
    c.ready();
    h.robe = Sc.creed(q).robe; h.robeMark = Sc.creed(q).mark; h.holdTorch = false; p.lantern = true;
    c.tag('p', 'quem contou'); c.tag('h', 'alguém de capuz');
    c.mood('dread');
    c.title('O Inquérito', 'Passos no Escuro');
    c.caption(`Naquela noite, a caminho de casa. ${p.name} contou tudo ${r ? (r.g === 'f' ? 'à ' : 'ao ') + RT : 'a quem governa'}. Agora está mais tranquil${oa(p)}.`);
    c.cam(['p'], { zoom: 4.2 });
    yield c.say('p', pick([`Agora é com a guarda.`, `Amanhã eles batem nas portas certas.`, `Acabou. Eu fiz a minha parte.`]), { style: 'think' });
    c.sfx('twig'); c.sfx('heartbeat');
    c.cam(['p', 'h'], { zoom: 4.2 });
    yield c.approach('h', 'p', 2.2, { max: 10 });
    c.face('p', 'h'); c.pose('p', ''); c.emote('p', 'fear', 2.4);
    yield c.say('p', `Quem está aí?`, { style: 'whisper' });
    c.face('h', 'p'); c.slow(0.6, 2);
    yield c.say('h', pick([`${cap1(r && r.g === 'f' ? 'a ' + RT : 'o ' + RT)} mandou lembranças.`, `Você devia ter ficado nas tavernas.`, `Quem mandou você foi o primeiro a jurar.`]), { style: 'whisper' });
    c.cam(['p'], { zoom: 5 });
    yield c.say('p', pick([`Então... ${r && r.g === 'f' ? 'ela' : 'ele'} também.`, `Não... não ${r && r.g === 'f' ? 'ela' : 'ele'}...`]), { style: 'think' });
    c.snap('A verdade');
    if (p.courage > 0.62 || G.R() < 0.2) {
      c.pose('p', 'shove'); c.sfx('thud'); c.mood('tense');
      yield 0.6;
      c.pose('h', 'lie');
      c.walk('p', door || c.beside('p', 9), { run: true, max: 12 });
      yield c.say('h', `Corre! Não tem para onde correr!`, { style: 'shout' });
      c.cam(['p'], { zoom: 4 });
      yield 3;
      c.snap('A fuga');
      h.robe = null; return 'fugiu';
    }
    c.approach('h', 'p', 0.8, { max: 3 });
    yield 0.6;
    c.pose('h', 'stab'); c.sfx('gore'); c.slow(0.35, 2.4); c.shake(0.2);
    c.release('p');
    Sc.silence(h, p, q.id, s.data.inq);
    c.snap('O fim no escuro');
    c.mood('sad');
    yield 2.8;
    h.robe = null; return 'morto';
  } });

  // ====================================================================================
  //  O INQUÉRITO, with its scenes
  // ====================================================================================
  const OLDI = St.DEF.inquerito;
  St.define('inquerito', Object.assign({}, OLDI, {
    stages: [['ordem', 'A ordem'], ['pistas', 'As pistas'], ['vigilia', 'A vigília'], ['verdade', 'A verdade'], ['fim', 'O que veio depois']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 4 : -1; return s.data.vigDone ? 3 : s.data.vigTried ? 2 : s.data.c1 ? 1 : 0; },
    begin(s) { s.phase = 'perguntas'; },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      const i = Sc.inquiry(s.data.inq);
      if (G.Scene.running(s.id)) return;
      if (s.data.pend) { const f = s.data.pend; s.data.pend = null; s.data.vigDone = 1; OLDI.react.call(St.DEF.inquerito, s, f); return; }
      // (waiting on a scene that is not there: it never opened, or the world was saved in the middle of it)
      if (s.phase === 'aguarda') { if (s.data.aw === 'fim') { St.finish(s, 'fracassada', 'sombrio', `${p.name} contou tudo a quem governa — e quem governa era um deles. O inquérito foi encerrado no dia seguinte, sem explicação.`); return; } s.phase = s.data.aw || 'denuncia'; }
      // the order (the next tick: the story exists by then)
      if (!s.data.ordem) {
        s.data.ordem = 1; const r = rulerOf(s.data.fac);
        if (!free(p) || !St.scene(s, 'iq-ordem', { r: r && G.dist(r.x, r.y, p.x, p.y) < 45 && !r.sleeping ? r.id : 0 }, { at: [p.x, p.y] })) St.beat(s, 'iq-ordem', { RULER: r ? G.Politics.styled(G.Fac.get(s.data.fac), r) : 'quem governa', WHAT: what(s) });
        return;
      }
      if (s.phase === 'denuncia') {
        if (G.S.time > 0.28 && G.S.time < 0.62 && free(p)) {
          const r = rulerOf(s.data.fac);
          if (r && !r.sleeping && G.dist(r.x, r.y, p.x, p.y) < 50) { s.data.aw = 'denuncia'; s.phase = 'aguarda'; St.scene(s, 'iq-denuncia', { r: r.id }, { at: [r.x, r.y], onEnd: res => { if (res === 'ordem') { s.phase = 'batida'; St.expect(s, 'A batida, ao amanhecer', G.S.clock + DAY() * (((1.28 - G.S.time) % 1) || 0.5)); } else if (res === 'traido') { s.phase = 'traido'; St.unexpect(s); } else s.phase = 'denuncia'; } }); }
          else { s.phase = 'batida'; }
        }
        return;
      }
      if (s.phase === 'traido') {
        if (!s.data.trT) s.data.trT = G.S.clock;
        if (G.S.clock - s.data.trT > DAY() * 0.4 && G.isNight() && free(p)) {
          const q = socOf(s);
          const h = q && Sc.membersOf(q).filter(v => v.id !== p.id && v.age >= 18 && v.age < 56 && !v.captive && !v.ug && !v.aboard && G.dist(v.x, v.y, p.x, p.y) < 45).sort((a, b) => G.dist(a.x, a.y, p.x, p.y) - G.dist(b.x, b.y, p.x, p.y))[0];
          s.data.aw = 'fim'; s.phase = 'aguarda';
          const lost = `${p.name} contou tudo a quem governa — e quem governa era um deles. O inquérito foi encerrado no dia seguinte, sem explicação.`;
          if (!h || !St.scene(s, 'iq-silencio', { h: h.id }, { at: [p.x, p.y], onEnd: res => { if (res === 'fugiu') St.finish(s, 'fracassada', 'sombrio', `${p.name} contou tudo a quem governa — e quem governa era um deles. Escapou de uma faca no escuro, e nunca mais tocou no assunto.`, { log: true, big: 1 }); else if (res !== 'morto' && s.st === 'ativa') St.finish(s, 'fracassada', 'sombrio', lost); } })) St.finish(s, 'fracassada', 'sombrio', lost);
        }
        return;
      }
      if (s.phase === 'batida') {
        if (G.S.time > 0.24 && G.S.time < 0.4 && free(p) && i) { s.data.aw = 'batida'; s.phase = 'aguarda'; St.unexpect(s); St.scene(s, 'iq-batida', {}, { at: [p.x, p.y], onEnd: res => { if (res !== 'presos') { s.phase = 'fim-vazio'; St.finish(s, 'fracassada', 'sereno', `${p.name} levou os guardas às portas certas — mas as casas estavam vazias. Alguém avisou.`, { log: true }); } } }); }
        return;
      }
      if (!i) { if (G.S.day - s.born >= 1 && !s.data.out && !s.data.vigDone) St.finish(s, 'fracassada', 'sereno', St.say(s, 'iq-nada', { WHAT: what(s) })); return; }
      // the clues, played when there is a free moment in daylight
      const day = G.S.time > 0.28 && G.S.time < 0.62;
      if (i.clue >= 0.3 && !s.data.c1 && day && free(p)) { s.data.c1 = 1; const w = gossipNear(p); if (!w || !St.scene(s, 'iq-pista1', { w: w.id }, { at: [p.x, p.y] })) St.beat(s, 'iq-pista', {}); return; }
      if (i.clue >= 0.6 && !s.data.c2 && day && free(p)) { s.data.c2 = 1; if (!(socOf(s) && St.scene(s, 'iq-pista2', {}, { at: [p.x, p.y] }))) St.beat(s, 'iq-nome', {}); return; }
      // the vigil: on a night their meeting is due
      const q = socOf(s);
      if (q && s.data.c2 && !s.data.vigDone && free(p)) {
        i.long = Math.max(i.long || 3.5, i.t / DAY() + 1.5);
        const due = q.lodges.filter(l => G.S.day >= l.next && G.Village.facOfSet(l.set) === s.data.fac);
        const l = due.sort((a, b) => G.dist(p.x, p.y, a.x, a.y) - G.dist(p.x, p.y, b.x, b.y))[0];
        const soon = q.lodges.filter(x => G.Village.facOfSet(x.set) === s.data.fac).sort((a, b) => a.next - b.next)[0];
        if (soon && !l) St.expect(s, 'A próxima reunião deles', G.S.clock + DAY() * Math.max(0.05, (soon.next - G.S.day) + 0.8 - G.S.time), soon.x, soon.y);
        if (l && G.S.time > 0.66 && G.S.time < 0.82 && G.dist(p.x, p.y, l.x, l.y) < 60) {
          s.data.vigTried = 1; St.unexpect(s);
          St.scene(s, 'iq-vigilia', {}, { at: [l.x, l.y], data: { lodge: l.id }, onEnd: res => afterVigil(s, res) });
          return;
        }
        if (l && G.S.time <= 0.66) St.expect(s, 'A reunião, esta noite', G.S.clock + DAY() * (0.8 - G.S.time), l.x, l.y);
      }
    },
    react(s, f) {
      if (G.Scene && G.Scene.running(s.id) && (f.k === 'exposto' || f.k === 'silenciado') && (f.a === s.protag)) { s.data.pend = f; return true; }
      return OLDI.react.call(this, s, f);
    },
    status(s, c) {
      if (s.phase === 'denuncia') return `${c.P} viu tudo. Agora precisa chegar viv${c.o} ao palácio.`;
      if (s.phase === 'batida') return 'A guarda vai bater nas portas ao amanhecer.';
      if (s.phase === 'traido') return `${c.P} contou tudo a quem não devia.`;
      return OLDI.status.call(this, s, c);
    },
    open: () => ['achar a seita', 'ver o rosto do mestre', 'ser visto', 'não achar nada', 'culpar inocentes'],
  }));
  function afterVigil(s, res) {
    if (s.data.pend) { const f = s.data.pend; s.data.pend = null; s.data.vigDone = 1; OLDI.react.call(St.DEF.inquerito, s, f); return; }
    if (res === 'vazio' || /^(abortada|sem|ocupada|erro)/.test(res || '')) { s.data.vigTried = 0; return; }
    s.data.vigDone = 1;
    if (res === 'viu') { s.phase = 'denuncia'; St.expect(s, 'Contar ao palácio, pela manhã', G.S.clock + DAY() * (((1.3 - G.S.time) % 1) || 0.4)); }
  }

  // ====================================================================================
  //  O QUE VIU NA NOITE — the witness
  // ====================================================================================
  Sn.define('tt-manha', { imp: 2, kick: 'O Que Viu na Noite', lazy: true, doing: () => 'Em casa, sem conseguir comer', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const k = c.v('k'); const home = G.S.buildings.get(p.home);
    const at = home && home.built ? (Sn.spot(G.Village.frontTile(home)[0] + 0.5, G.Village.frontTile(home)[1] + 0.8, 1.5)) : [p.x, p.y];
    if (k) c.take('k', { keep: true });
    yield c.walk('p', at, { max: 60 });
    if (k) yield c.walk('k', Sn.spot(at[0] + 0.9, at[1] + 0.3, 1) || at, { max: 30 });
    c.ready();
    c.mood('dread'); c.tag('p', 'quem viu');
    c.title('O Que Viu na Noite', 'A Manhã Seguinte');
    const l = (Sc.get(s.data.soc) || { lodges: [] }).lodges.find(x => x.id === s.data.lodge);
    c.caption(`A manhã depois. ${p.name} ainda vê os capuzes quando fecha os olhos.`);
    c.pose('p', 'sit'); c.cam(['p'].concat(k ? ['k'] : []), { zoom: 4.3 });
    yield 1.6;
    if (k) {
      c.tag('k', St.relOf(p, k) ? ({ pai: 'pai', mae: 'mãe', filho: 'filho', filha: 'filha', companheiro: 'companheiro', companheira: 'companheira', irmao: 'irmão', irma: 'irmã' })[St.relOf(p, k)] : 'de casa');
      c.face('k', 'p'); c.face('p', 'k');
      yield c.say('k', pick([`Você está pálid${oa(p)}. O que foi?`, `Não comeu nada. Aconteceu alguma coisa?`, `Onde você foi ontem à noite?`]));
      const tell = G.R() < 0.4;
      if (tell) {
        yield c.say('p', `Eu vi... gente de capuz${l ? ', ' + Sc.lodgeName(l) : ''}. Cantando. ${s.data.blood ? 'E sangue.' : ''}`.trim(), { style: 'whisper' });
        yield c.say('k', pick([`Fala baixo. Pelo amor dos deuses, fala baixo.`, `Você não viu nada. Ouviu? Nada.`, `Isso é coisa de rico. Fique longe.`]), { style: 'whisper' });
      } else {
        yield c.say('p', pick([`Nada. Não foi nada.`, `Dormi mal, só isso.`]));
        yield c.say('p', pick([`Eles me viram. Eu sei que me viram.`, `Se eu contar, eles voltam.`]), { style: 'think' });
      }
    } else {
      yield c.say('p', pick([`Eles me viram. Eu sei que me viram.`, `Ninguém vai acreditar.`, `Se eu contar, eles voltam.`]), { style: 'think' });
    }
    c.snap('A manhã');
    return 'ok';
  } });
  Sn.define('tt-passos', { imp: 3, kick: 'O Que Viu na Noite', lazy: true, doing: () => 'Voltando para casa ao anoitecer', *gen(c) {
    const s = c.story(); const p = c.v('p'); const h = c.v('h'); if (!s || !p || !h) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const home = G.S.buildings.get(p.home); const door = home && home.built ? G.Village.frontTile(home) : null;
    const far = door ? Sn.spot(door[0] + (p.x - door[0]) * 0.5 + 4, door[1] + 3, 2) : c.beside('p', 6);
    if (door && G.dist(p.x, p.y, door[0], door[1]) < 5) { const a = G.R() * TAU; const q = Sn.spot(door[0] + Math.cos(a) * 9, door[1] + Math.sin(a) * 9, 2); if (q) yield c.walk('p', q, { max: 40 }); }
    c.ready();
    c.mood('tense'); c.tag('p', 'quem viu');
    c.title('O Que Viu na Noite', 'Os Passos');
    c.caption(`O dia acaba. A rua esvazia.`);
    c.cam(['p'], { zoom: 3.6 });
    if (door) c.walk('p', door, { slow: true, max: 30 });
    yield 3;
    c.sfx('twig'); c.pose('p', ''); c.face('p', h);
    c.cam(['p', h], { zoom: 'fit' }); c.sfx('heartbeat');
    // the one who follows stops too (and hides)
    if (c.take(h, { keep: true, force: true })) { c.pose(h, 'hide'); c.tag(h, '...'); }
    yield c.say('p', pick([`Tem alguém aí?`, `Quem está aí?`, `...Olá?`]), { style: 'whisper' });
    c.slow(0.5, 2); c.sfx('heartbeat');
    yield 2.4;
    c.snap('Os passos');
    c.cam(['p'], { zoom: 4.4 });
    yield c.say('p', pick([`Não tem ninguém. Não tem ninguém.`, `Eu não estou louc${oa(p)}. Tinha alguém.`]), { style: 'think' });
    c.release(h);
    if (door) { c.cam(['p'], { zoom: 3.6 }); yield c.walk('p', door, { run: true, max: 20 }); c.sfx('slam'); }
    c.caption(`Naquela noite, ${p.name} não dormiu.`, { hold: 3 });
    return 'ok';
  } });
  Sn.define('tt-convite', { imp: 2, kick: 'O Que Viu na Noite', lazy: true, doing: () => 'Em casa, de noite', *gen(c) {
    const s = c.story(); const p = c.v('p'); const q = Sc.get(s && s.data.soc); if (!s || !p || !q) return 'sem';
    const hs = Sc.membersOf(q).filter(v => v.id !== p.id && free(v) && G.dist(v.x, v.y, p.x, p.y) < 35).slice(0, 2);
    if (!hs.length || !c.take('p', { vital: true, force: true })) return 'sem';
    const home = G.S.buildings.get(p.home); const door = home && home.built ? G.Village.frontTile(home) : [p.x, p.y];
    const cr = Sc.creed(q);
    hs.forEach(h => c.take(h, { keep: true, force: true }));
    c.walk('p', door, { max: 50 });
    hs.forEach((h, k) => { h.robe = cr.robe; h.robeMark = cr.mark; c.walk(h, Sn.spot(door[0] + 1.2 + k * 0.6, door[1] + 1, 1.2) || door, { max: 60 }); });
    yield c.until(() => hs.every(h => !P(h.id) || G.dist(h.x, h.y, door[0], door[1]) < 2.4), 50);
    c.ready();
    c.mood('dread'); c.tag('p', 'quem viu'); hs.forEach(h => c.tag(h, 'de capuz'));
    c.title('O Que Viu na Noite', 'A Visita');
    c.cam(['p'].concat(hs), { zoom: 4.2 });
    c.sfx('knock'); yield 1.4;
    c.face('p', hs[0]); hs.forEach(h => c.face(h, 'p'));
    yield c.say(hs[0], pick([`Você viu o que não devia.`, `Sabemos o que você viu.`]), { style: 'whisper' });
    yield c.say(hs[0], pick([`Há dois caminhos. Um deles tem um manto.`, `Pode ver mais... ou não ver mais nada.`]), { style: 'whisper' });
    yield 1.2;
    yield c.say('p', pick([`...O que eu preciso fazer?`, `Eu aceito.`, `Entrem.`]));
    p.robe = cr.robe; p.robeMark = cr.mark; c.sfx('choir', null, 0.6);
    c.snap('O manto');
    yield 2;
    p.robe = null; hs.forEach(h => { h.robe = null; });
    return 'ok';
  } });
  Sn.define('tt-moedas', { imp: 1, kick: 'O Que Viu na Noite', lazy: true, doing: () => 'Saindo de casa pela manhã', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const home = G.S.buildings.get(p.home); const door = home && home.built ? G.Village.frontTile(home) : [p.x, p.y];
    yield c.walk('p', door, { max: 50 });
    c.ready();
    c.prop('coins', door[0] + 0.5, door[1] + 0.3, { secs: 20 });
    c.cam(['p'], { zoom: 4.6 }); c.tag('p', 'quem viu');
    c.title('O Que Viu na Noite', 'O Recado');
    yield 1.2;
    c.pose('p', 'kneel'); c.sfx('click'); yield 1.4;
    c.pose('p', 'gift'); p.giftCol = '#f2c14e';
    yield c.say('p', pick([`Um saco de moedas. Na minha porta.`, `Ninguém deixa ouro na porta de ninguém.`]), { style: 'think' });
    c.face('p', c.beside('p', 5)); yield 1;
    yield c.say('p', pick([`Entendi o recado.`, `Eu não vi nada. Nunca vi nada.`]), { style: 'think' });
    c.snap('O recado');
    return 'ok';
  } });

  const OLDT = St.DEF.testemunha;
  St.define('testemunha', Object.assign({}, OLDT, {
    begin(s) { s.phase = 'medo'; },
    tick(s) {
      if (G.Scene.running(s.id)) return;
      if (s.data.pend) { const f = s.data.pend; s.data.pend = null; OLDT.react.call(this, s, f); return; }
      const p = P(s.protag); if (!p || p.dead) return;
      // the night they saw it is told at once; the morning after, played
      if (!s.data.told0) { s.data.told0 = 1; St.beat(s, 'tt-viu', ttCtx(s), { x: s.place ? s.place.x : undefined, y: s.place ? s.place.y : undefined }); }
      if (!s.data.manha && G.S.time > 0.28 && G.S.time < 0.55 && free(p)) {
        s.data.manha = 1; const k = St.kin(p).find(o => !o.captive && !o.sleeping && G.dist(o.x, o.y, p.x, p.y) < 12 && o.age > 10);
        St.scene(s, 'tt-manha', { k: k ? k.id : 0 }, { at: [p.x, p.y] }); return;
      }
      const w = Sc.witnessOf(s.data.soc, p.id);
      if (w && w.hunter && !s.data.passos && G.S.time > 0.6 && G.S.time < 0.78 && free(p) && P(w.hunter)) {
        s.data.passos = 1; s.data.followed = 1; St.chapter(s, St.say(s, 'tt-seguid', ttCtx(s)));
        St.scene(s, 'tt-passos', { h: w.hunter }, { at: [p.x, p.y] }); return;
      }
      if (w && w.fate === 'jurou' && !w.done && !s.data.convite && (G.S.time > 0.76 || G.S.time < 0.1) && free(p) && G.S.day >= (w.at || 0) - 0.05) {
        s.data.convite = 1; const sc = St.scene(s, 'tt-convite', {}, { at: [p.x, p.y] });
        if (sc) return;
      }
      if (w && w.done && w.fate === 'comprar' && !s.data.bought) {
        s.data.bought = 1;
        if (free(p) && St.scene(s, 'tt-moedas', {}, { at: [p.x, p.y], onEnd: () => St.finish(s, 'abandonada', 'agridoce', St.say(s, 'tt-comprad', ttCtx(s))) })) return;
        St.finish(s, 'abandonada', 'agridoce', St.say(s, 'tt-comprad', ttCtx(s))); return;
      }
      return OLDT.tick.call(this, s);
    },
    react(s, f) {
      if (G.Scene && G.Scene.running(s.id) && f.k === 'silenciado' && f.a === s.protag) { s.data.pend = f; return true; }
      return OLDT.react.call(this, s, f);
    },
  }));
  function ttCtx(s) {
    const q = Sc.get(s.data.soc); const l = q && q.lodges.find(y => y.id === s.data.lodge);
    const where = l ? Sc.lodgeName(l) : 'no escuro';
    return { WHERE: where, BLOOD: s.data.blood, SOC: q ? Sc.art(q.name) : 'a seita', SOCo: q && /^(A|As) /.test(q.name) ? 'a' : 'o', RULER: '' };
  }
  void cap1; void TAU; void nightNow;
})(window.G);
