'use strict';
// ============================================================
//  Secrets: the orders that meet at night.
//  A powerful few — a rich merchant, a lord, a priest, sometimes the
//  ruler's own partner — swear an oath nobody else hears. An order
//  wants something (to rule from behind the throne, to hold the trade
//  of every realm, to wake a forgotten god, to bring the tyrants down,
//  to keep a forbidden knowledge) and its brothers are wherever the
//  roads go: an ivory merchant in one kingdom, a gem merchant in
//  another. They meet on moonless nights in a cave, in a clearing in
//  the woods, in the cellar of an ordinary house; they put on robes and
//  hoods and chant around a brazier, and some orders spill blood.
//  Whoever sees it may be bought, sworn in — or silenced. And the town
//  talks: rumours of orders that exist and of orders that never did,
//  of people who belong and of people who don't. A ruler who hears
//  enough sends someone to find out; and a frightened one may burn
//  innocents for an order no one ever found. Only the god sees all.
// ============================================================
(function (G) {
  const Sc = G.Secrets = {};
  const W = G.W, P = G.Politics;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const say = (v, txt, s) => G.Justice && G.Justice.say(v, txt, s);
  const st = () => { const S = G.S; if (!S.secrets) S.secrets = { socs: [], rumors: [], meets: [], inq: [], fakes: [], nr: 1 }; return S.secrets; };
  const person = id => (id ? G.S.villagers.get(id) : null);
  const soc = id => st().socs.find(s => s.id === id) || null;
  Sc.get = soc;

  // ------------------------------ the creeds ------------------------------
  const CREED = {
    poder: { names: ['A Ordem do Olho Velado', 'O Conselho das Sombras', 'A Irmandade do Compasso', 'A Mão Invisível'], robe: '#1c1c28', mark: '#c8a24a', want: 'governar por trás do trono', chant: ['Nada se move sem nós.', 'O olho vê.', 'Paciência e silêncio.', 'Os tronos passam; nós ficamos.'], lodge: ['fachada', 'caverna', 'bosque'] },
    saber: { names: ['A Confraria da Lâmpada', 'Os Guardiões do Pergaminho', 'A Irmandade da Acácia'], robe: '#22324a', mark: '#e8e2c8', want: 'guardar um saber proibido', chant: ['O que está escrito não morre.', 'Luz na escuridão.', 'Lembrem-se.'], lodge: ['caverna', 'fachada'] },
    deus: { names: ['O Culto da Serpente Antiga', 'Os Filhos da Lua Negra', 'O Círculo de Obsidiana'], robe: '#3a0c12', mark: '#d8302a', want: 'despertar um deus esquecido', chant: ['Ela vai acordar.', 'Sangue para a Lua.', 'Ouçam o que dorme.', 'Bebe, bebe.'], lodge: ['caverna', 'bosque'] },
    ouro: { names: ['A Liga do Selo Dourado', 'A Mesa dos Doze', 'A Companhia do Anel'], robe: '#33240e', mark: '#e8b83a', want: 'controlar o comércio de todos os reinos', chant: ['O preço é nosso.', 'Ouro chama ouro.', 'Nenhuma caravana sem a nossa marca.'], lodge: ['fachada', 'fachada', 'caverna'] },
    liberdade: { names: ['Os Filhos da Aurora', 'A Rosa Vermelha', 'Os Sem-Coroa'], robe: '#2a1218', mark: '#e84a5a', want: 'derrubar os tiranos', chant: ['Nenhum rei para sempre.', 'Pela aurora.', 'Um dia, todos livres.'], lodge: ['bosque', 'caverna'] },
  };
  Sc.CREED = CREED;
  // orders that exist only in what people say
  const FAKE = ['A Irmandade do Corvo', 'Os Bebedores de Sangue', 'A Seita do Poço', 'A Ordem dos Nove', 'Os Filhos da Cinza', 'O Círculo do Bode', 'A Confraria da Agulha', 'Os Que Não Dormem'];
  const FAKE_DO = [['fala com os mortos', 'falam com os mortos'], ['rouba crianças nas noites de lua cheia', 'roubam crianças nas noites de lua cheia'], ['envenena os poços', 'envenenam os poços'], ['adora um bode de chifres de ouro', 'adoram um bode de chifres de ouro'], ['faz chover sangue', 'fazem chover sangue'], ['manda nos preços do sal', 'mandam nos preços do sal'], ['come carne de gente', 'comem carne de gente'], ['quer matar quem governa', 'querem matar quem governa']];
  // 'A Ordem do Olho' -> 'da Ordem do Olho', 'a Ordem do Olho', 'na Ordem…'
  function art(n, how) {
    const m = /^(A|O|Os|As) (.*)$/.exec(n); if (!m) return n;
    const a = m[1].toLowerCase(), rest = m[2];
    if (how === 'de') return ({ a: 'da', o: 'do', os: 'dos', as: 'das' })[a] + ' ' + rest;
    if (how === 'em') return ({ a: 'na', o: 'no', os: 'nos', as: 'nas' })[a] + ' ' + rest;
    if (how === 'a') return ({ a: 'à', o: 'ao', os: 'aos', as: 'às' })[a] + ' ' + rest;
    if (how === 'por') return ({ a: 'pela', o: 'pelo', os: 'pelos', as: 'pelas' })[a] + ' ' + rest;
    return a + ' ' + rest;
  }
  Sc.art = art;
  // 'uma clareira…' -> 'numa clareira…', 'o porão…' -> 'no porão…'
  const inPlace = l => l.name.replace(/^(uma|um|o|a|os|as) /, (w, a) => ({ uma: 'numa ', um: 'num ', o: 'no ', a: 'na ', os: 'nos ', as: 'nas ' })[a]);
  const plural = n => /^(Os|As) /.test(n);
  // 'a Furna…' -> 'à Furna…', 'o porão…' -> 'ao porão…', 'uma clareira…' -> 'a uma clareira…'
  const toPlace = l => l.name.replace(/^(uma|um|o|a|os|as) /, (w, a) => ({ uma: 'a uma ', um: 'a um ', o: 'ao ', a: 'à ', os: 'aos ', as: 'às ' })[a]);
  // the subject with its epithet: 'Faraó Mutemwia, a Justa,'
  const styV = (f, v) => { const t = P.styled(f, v); return t.includes(',') ? t + ',' : t; };
  const investigating = id => st().inq.some(i => i.by === id);

  // ------------------------------ who could belong ------------------------------
  function standing(v) {
    const S = G.S; const h = v.home && S.buildings.get(v.home);
    let s = (h ? Math.min(60, h.coin || 0) / 12 : 0) + (h && h.elite ? 2 : 0);
    if (v.grp === 'nobreza') s += 2.5; if (v.grp === 'mercadores') s += 1.5; if (v.grp === 'sacerdotes') s += 1.5;
    if (v.officer) s += 1.5; if (v.role === 'escriba') s += 1; if (v.reigned) s += 4; if (v.hero) s += 1;
    const f = G.Fac.ofV(v); if (f && f.leader === v.id) s += 5;
    return s;
  }
  function fit(v, creed) {
    const pe = P.persona(v);
    switch (creed) {
      case 'poder': return pe.amb * 1.4 + (1 - pe.pie) * 0.2;
      case 'saber': return (v.role === 'escriba' || v.role === 'sacerdote' ? 0.6 : 0) + (1 - pe.agg) * 0.5 + pe.pie * 0.3;
      case 'deus': return pe.pie * 0.9 + pe.cru * 0.8 - 0.2;
      case 'ouro': return pe.amb * 0.9 + (v.grp === 'mercadores' ? 0.6 : 0) + (1 - pe.pie) * 0.2;
      case 'liberdade': { const f = G.Fac.ofV(v); const g = f && f.grp && f.grp[v.grp]; return v.courage * 0.6 + pe.agg * 0.3 + (g ? (50 - g.sat) / 60 : 0) + (f && P.tyr(f) ? 0.5 : 0) - (v.grp === 'nobreza' ? 0.4 : 0); }
    }
    return 0;
  }
  const free = v => v && !v.captive && !v.secret && v.age >= 20 && v.age <= 66 && !v.held && !v.aboard && !v.rebel;

  // ------------------------------ where they meet ------------------------------
  function lodgeNear(set, kinds) {
    const S = G.S;
    for (const kind of kinds) {
      if (kind === 'caverna' && G.Caves) {
        let best = null, bd = 24; for (const cv of G.Caves.all()) for (const m of cv.mouths || []) { const d = G.dist(m.x, m.y, set.cx, set.cy); if (d < bd && d > 4) { bd = d; best = [cv, m]; } }
        if (best) { const [cv, m] = best; const sp = W.nearestLand(m.x + 0.5, m.y + 1.5, 3) || [m.x + 0.5, m.y + 0.5]; return { kind, set: set.id, x: sp[0], y: sp[1], cave: cv.id, name: G.Caves.a ? G.Caves.a(cv) : cv.name }; }
      }
      if (kind === 'bosque') {
        let best = null, bs = 0;
        for (let k = 0; k < 60; k++) {
          const a = G.hash(set.id * 31 + k) * TAU, r = 7 + G.hash(set.id * 17 + k * 3) * 13;
          const x = Math.floor(set.cx + Math.cos(a) * r) + 0.5, y = Math.floor(set.cy + Math.sin(a) * r) + 0.5;
          if (!W.inb(x, y) || !W.walkableXY(x, y) || W.isWater(W.idx(x, y)) || S.occ[W.idx(x, y)]) continue;
          let n = 0; for (const t of S.trees.values()) if (t.stage !== 'burnt' && Math.abs(t.x - x) < 3.2 && Math.abs(t.y - y) < 3.2) n++;
          let bld = false; for (const b of S.buildings.values()) if (G.dist(b.x, b.y, x, y) < 4) { bld = true; break; }
          if (!bld && n >= 5 && n > bs) { bs = n; best = [x, y]; }
        }
        if (best) return { kind, set: set.id, x: best[0], y: best[1], name: `uma clareira no bosque perto de ${set.name}` };
      }
      if (kind === 'fachada') {
        const OK = { taverna: 'o porão da taverna', storehouse: 'o porão do armazém', workshop: 'o fundo da oficina', sobrado: 'o porão de um sobrado', house: 'uma casa comum', insula: 'um apartamento de uma ínsula', biblioteca: 'uma sala fechada da biblioteca', celeiro: 'o fundo do celeiro' };
        const cand = [...S.buildings.values()].filter(b => b.set === set.id && b.built && OK[b.type]);
        if (cand.length) { const b = cand[Math.floor(G.hash(set.id * 7 + cand.length) * cand.length)]; const fr = G.Village.frontTile(b); return { kind, set: set.id, x: fr[0], y: fr[1] + 0.5, b: b.id, name: `${OK[b.type]} de ${set.name}` }; }
      }
    }
    return null;
  }

  // ------------------------------ an order is born ------------------------------
  function found() {
    const S = G.S; const s = st();
    const facs = G.Fac.all().filter(f => f.alive);
    const max = Math.max(1, Math.min(4, 1 + Math.floor(facs.length / 2)));
    if (s.socs.filter(q => !q.gone).length >= max || S.villagers.size < 50) return;
    // which kind of order the world is ripe for
    const tyrants = facs.some(f => P.tyr(f)); const coin = facs.some(f => G.Eco.coinage(f.id));
    const pool = [['poder', 1], ['saber', 0.6], ['deus', 0.8], ['ouro', coin ? 1.2 : 0.3], ['liberdade', tyrants ? 1.4 : 0.25]].filter(([c]) => !s.socs.some(q => !q.gone && q.creed === c));
    if (!pool.length) return;
    let tot = 0; for (const p of pool) tot += p[1]; let r = G.R() * tot, creed = pool[0][0]; for (const p of pool) { r -= p[1]; if (r <= 0) { creed = p[0]; break; } }
    let best = null, bs = 0;
    for (const v of S.villagers.values()) {
      if (!free(v) || v.age < 25) continue;
      const set = S.settlements.get(v.set); if (!set || (set.tier || 0) < 1) continue;
      const sc = standing(v) * 0.5 + fit(v, creed) * 2 + G.R() * 0.6;
      if (sc > bs) { bs = sc; best = v; }
    }
    if (!best || bs < 2.2) return;
    const set = S.settlements.get(best.set);
    const lodge = lodgeNear(set, CREED[creed].lodge); if (!lodge) return;
    const used = new Set(s.socs.map(q => q.name));
    const name = CREED[creed].names.find(n => !used.has(n)) || CREED[creed].names[0];
    lodge.id = S.nextId++; lodge.next = S.day + 1 + Math.floor(G.R() * 2);
    const q = { id: S.nextId++, name, creed, born: S.day, master: best.id, members: [], lodges: [lodge], exposed: {}, power: {}, deeds: 0, gone: 0 };
    s.socs.push(q);
    join(q, best, 'mestre', true);
    log(`Em segredo, numa noite sem lua, ${best.name}, de ${set.name}, fundou ${art(name)} em ${lodge.name}. Querem ${CREED[creed].want}. Ninguém mais sabe — só você.`, 'secret', lodge.x, lodge.y);
    G.Stories && G.Stories.signal('secretFound', { soc: q.id, who: best.id, creed, x: lodge.x, y: lodge.y });
  }
  function join(q, v, rank, quiet) {
    const S = G.S;
    v.secret = q.id;
    q.members.push({ id: v.id, rank: rank || 'iniciado', since: S.day });
    G.Life && G.Life.bio(v, 'note', rank === 'mestre' ? `Fundou em segredo ${art(q.name)}` : `Jurou lealdade, em segredo, ${art(q.name, 'a')}`);
    if (!quiet) {
      const f = G.Fac.ofV(v); const r = f && P.ruler(f);
      const big = (r && (r.id === v.id || r.partner === v.id)) || v.grp === 'nobreza' || standing(v) > 6;
      if (big) log(`Em segredo, ${f && f.leader === v.id ? P.styled(f, v) : v.name}${f && f.leader !== v.id ? ', de ' + f.name + ',' : ''} jurou lealdade ${art(q.name, 'a')}.`, 'secret', v.x, v.y);
    }
    G.Stories && G.Stories.signal('secretJoin', { soc: q.id, who: v.id, rank: rank || 'iniciado' });
  }
  function leave(q, id) { q.members = q.members.filter(m => m.id !== id); const v = person(id); if (v && v.secret === q.id) { v.secret = 0; v.robe = null; } }
  Sc.membersOf = q => q.members.map(m => person(m.id)).filter(Boolean);
  Sc.of = v => (v && v.secret ? soc(v.secret) : null);

  // ------------------------------ the order grows, across borders ------------------------------
  function recruit(q) {
    const S = G.S; if (q.gone) return;
    const live = Sc.membersOf(q); if (!live.length) { q.gone = S.day; return; }
    if (q.members.length >= Math.min(16, 5 + q.lodges.length * 3)) return;
    let best = null, bs = 0;
    for (const v of S.villagers.values()) {
      if (!free(v) || investigating(v.id)) continue;
      const near = q.lodges.some(l => G.dist(v.x, v.y, l.x, l.y) < 32);
      // the merchants who travel the roads carry the oath to other realms
      const far = !near && (v.grp === 'mercadores' || v.role === 'mercador') && (q.creed === 'ouro' || q.creed === 'poder');
      if (!near && !far) continue;
      const sc = fit(v, q.creed) * 1.6 + standing(v) * 0.35 + (far ? 0.4 : 0) + G.R() * 0.5;
      if (sc > bs) { bs = sc; best = v; }
    }
    if (!best || bs < 1.7 || G.R() > 0.7) return;
    // someone powerful from a town with no lodge: a new house of the order there
    const set = S.settlements.get(best.set);
    if (set && !q.lodges.some(l => G.dist(l.x, l.y, set.cx, set.cy) < 30) && q.lodges.length < 4) {
      const l = lodgeNear(set, CREED[q.creed].lodge); if (l) { l.id = S.nextId++; l.next = S.day + 1 + Math.floor(G.R() * 3); q.lodges.push(l); }
    }
    join(q, best, standing(best) > 5 ? 'irmao' : 'iniciado');
  }

  // ------------------------------ the meeting ------------------------------
  function meetOf(l) { return st().meets.find(m => m.lodge === l.id) || null; }
  function startMeet(q, l) {
    const S = G.S;
    const go = Sc.membersOf(q).filter(v => G.dist(v.x, v.y, l.x, l.y) < 34 && !v.captive && !v.aboard && !v.held && !v.ug && !(v.task && v.task.pri >= 3));
    if (go.length < 2) { l.next = S.day + 2; return; }
    const m = { id: S.nextId++, soc: q.id, lodge: l.id, x: l.x, y: l.y, kind: l.kind, b: l.b || 0, t: 0, ids: go.map(v => v.id), seen: [], blood: 0, phase: 'gather' };
    st().meets.push(m);
    go.forEach((v, i) => { G.Vg.endTask(v); v.sleeping = false; const a = i / go.length * TAU; G.Vg.setTask(v, { type: 'conclave', m: m.id, pri: 2.3, st: 0, x: l.x + Math.cos(a) * 1.25, y: l.y + Math.sin(a) * 0.9, kind: 'conclave', master: v.id === q.master ? 1 : 0 }); });
    // a dark order sometimes wants blood: a captive, or someone alone, lured out at night
    if (q.creed === 'deus' && G.R() < 0.3) {
      const vic = [...S.villagers.values()].find(v => (v.captive || (v.age >= 14 && v.age < 70 && !v.partner && standing(v) < 1.5)) && !v.secret && G.dist(v.x, v.y, l.x, l.y) < 28 && !(v.task && v.task.pri >= 3) && !v.held && !v.aboard && !v.ug && G.R() < 0.4);
      if (vic) { m.victim = vic.id; G.Vg.endTask(vic); vic.sleeping = false; G.Vg.setTask(vic, { type: 'lured', m: m.id, pri: 2.4, st: 0, x: l.x, y: l.y + 0.2, kind: 'lured' }); }
    }
    // someone who could not sleep walks out into the night — and sees
    if (G.R() < 0.22) {
      const set = S.settlements.get(l.set);
      const w = set && [...S.villagers.values()].find(v => v.set === set.id && !v.secret && v.age >= 9 && !v.captive && !v.held && !v.aboard && !(v.task && v.task.pri >= 2) && G.R() < 0.15);
      if (w) { G.Vg.endTask(w); w.sleeping = false; const a = G.R() * TAU; G.Vg.setTask(w, { type: 'insone', m: m.id, pri: 1.9, st: 0, x: l.x + Math.cos(a) * 4.5, y: l.y + Math.sin(a) * 3.5, kind: 'insone' }); }
    }
    l.next = S.day + 2 + Math.floor(G.R() * 3);
  }
  function tickMeet(m, dt) {
    const S = G.S; const q = soc(m.soc); const l = q && q.lodges.find(x => x.id === m.lodge);
    if (!q || !l) return endMeet(m);
    m.t += dt;
    const here = m.ids.map(person).filter(v => v && v.task && v.task.type === 'conclave' && v.task.m === m.id);
    const there = here.filter(v => v.task.st === 2);
    if (m.phase === 'gather' && (there.length >= Math.max(2, here.length * 0.7) || m.t > (m.keep > S.clock ? 70 : 40))) { m.phase = 'rite'; m.t = 0; }
    if (m.phase === 'rite') {
      if (G.R() < dt * 0.5 && there.length) { const who = G.pick(there); if (G.Talk) G.Talk.say(who, G.pick(CREED[q.creed].chant), { style: 'chant', col: CREED[q.creed].mark, dur: 2.8 }); else say(who, G.pick(CREED[q.creed].chant), 2.6); }
      // the blood
      const vic = person(m.victim);
      if (vic && !m.blood && m.t > 12 && vic.task && vic.task.type === 'lured' && vic.task.st === 2) {
        m.blood = 1; const mst = person(q.master) && here.includes(person(q.master)) ? person(q.master) : there[0];
        if (mst) { mst.act = 'stab'; mst.actT = 0; G.faceTo(mst, vic.x - mst.x, vic.y - mst.y); }
        G.FX && G.FX.blood(vic.x, vic.y); G.Audio && G.Audio.at(vic.x, vic.y, 'gore', true);
        vic.lastBy = mst ? mst.id : 0;
        const nm = vic.name; const vg = vic.g; const vx = vic.x, vy = vic.y;
        G.Vg.damage(vic, 999, 'sacrifice', false, mst ? mst.id : 0);
        q.deeds++;
        log(`${cap(inPlace(l))}, na escuridão, ${art(q.name)} derramou sangue: ${nm} foi ${vg === 'f' ? 'morta' : 'morto'} sobre a pedra, entre cânticos.`, 'sacrifice', vx, vy);
        rumor(G.Village.facOfSet(l.set), l.set, `Acharam ${nm} ${vg === 'f' ? 'morta' : 'morto'} ${inPlace(l)}, com marcas que ninguém sabe ler.`, q.id, true, 1.5);
      }
      // whoever is near and awake, sees
      m.wt = (m.wt || 0) + dt;
      if (m.wt > 0.5 && (l.kind !== 'fachada' || m.t < 6)) for (const v of S.villagers.values()) {
        if (v.secret === q.id || m.seen.includes(v.id) || v.age < 8 || v.sleeping || v.inside || v.captive || v.id === m.victim || m.seen.length >= 2 || investigating(v.id) || (q.wit || []).some(w => w.id === v.id)) continue;
        if (G.dist(v.x, v.y, l.x, l.y) < (l.kind === 'fachada' ? 3 : 6.5)) { m.seen.push(v.id); witness(q, l, m, v); }
      }
      if (m.wt > 0.5) m.wt = 0;
      if (m.t > 34 && !(m.keep > S.clock)) return endMeet(m);
    }
    if (m.t > 120 && !(m.keep > S.clock)) endMeet(m);
  }
  function endMeet(m) {
    const k = st().meets.indexOf(m); if (k >= 0) st().meets.splice(k, 1);
    for (const id of m.ids) { const v = person(id); if (v) { v.robe = null; v.unmask = false; if (v.task && v.task.type === 'conclave' && v.task.m === m.id) G.Vg.endTask(v); } }
    const vic = person(m.victim); if (vic && vic.task && vic.task.type === 'lured') G.Vg.endTask(vic);
    const q = soc(m.soc); if (q) G.Stories && G.Stories.signal('ritual', { soc: q.id, lodge: m.lodge, x: m.x, y: m.y, ids: m.ids.slice(), blood: m.blood, seen: m.seen.slice() });
  }

  // ------------------------------ a witness ------------------------------
  function witness(q, l, m, v) {
    const S = G.S; const f = G.Fac.ofV(v);
    G.Vg.emote(v, 'fear', 3);
    const mst = person(q.master); const pe = mst ? P.persona(mst) : { cru: 0.5, amb: 0.5 };
    const w = { id: v.id, soc: q.id, day: S.day, lodge: l.id, fate: '' };
    (q.wit || (q.wit = [])).push(w); if (q.wit.length > 12) q.wit.shift();
    log(`${v.name} saiu na noite e viu o que não devia: gente de manto e capuz ${inPlace(l)}, ${l.kind === 'fachada' ? 'entrando em silêncio, um a um' : 'cantando em volta do fogo'}.`, 'secret', v.x, v.y);
    G.Stories && G.Stories.signal('witness', { who: v.id, soc: q.id, lodge: l.id, x: l.x, y: l.y, fac: f ? f.id : 0, blood: m.blood });
    // the order decides: swear them in, buy their silence, or make sure
    const vf = fit(v, q.creed);
    if (vf > 1 && G.R() < 0.5) { w.fate = 'jurou'; w.at = S.day + 0.4; }
    else if (pe.cru > 0.55 || m.blood) { w.fate = 'calar'; w.at = S.day + 0.3 + G.R() * 0.8; }
    else if (G.R() < 0.5) { w.fate = 'comprar'; w.at = S.day + 0.5; }
    else { w.fate = 'fala'; w.at = S.day + 0.6; }
  }
  function witnessTick(q) {
    const S = G.S;
    for (const w of q.wit || []) {
      if (w.done || S.day < w.at) continue;
      const v = person(w.id); if (!v) { w.done = 1; continue; }
      const l = q.lodges.find(x => x.id === w.lodge) || q.lodges[0];
      if (w.fate === 'jurou' && investigating(v.id)) w.fate = 'fala';
      if (w.fate === 'jurou') { w.done = 1; join(q, v, 'iniciado'); log(`${v.name} recebeu uma visita à noite. No dia seguinte, não falou mais do que viu — e passou a sair nas noites sem lua.`, 'secret', v.x, v.y); continue; }
      if (w.fate === 'comprar') {
        w.done = 1; const h = S.buildings.get(v.home); if (h) h.coin = (h.coin || 0) + 12;
        if (G.R() < 0.7) { log(`Alguém deixou um saco de moedas na porta de ${v.name}. ${v.g === 'f' ? 'Ela' : 'Ele'} entendeu o recado e se calou.`, 'coin', v.x, v.y); continue; }
        w.fate = 'fala';
      }
      if (w.fate === 'calar') {
        if (w.hunter) continue;
        const hunter = Sc.membersOf(q).filter(o => o.id !== q.master && !o.captive && !o.held && !o.aboard && o.age < 60).sort((a, b) => (P.persona(b).cru + P.persona(b).agg) - (P.persona(a).cru + P.persona(a).agg))[0] || person(q.master);
        if (!hunter || hunter.captive) { w.fate = 'fala'; continue; }
        w.hunter = hunter.id; G.Vg.endTask(hunter); G.Vg.setTask(hunter, { type: 'stalk', target: v.id, soc: q.id, pri: 2.6, st: 0, kind: 'stalk', w: w.id });
        continue;
      }
      if (w.fate === 'fala') {
        w.done = 1; const f = G.Fac.ofV(v);
        rumor(f ? f.id : 0, v.set, `${v.name} jura que viu gente de manto e capuz ${inPlace(l)}, à meia-noite.`, q.id, true, 2.2, { witness: v.id });
        if (f && G.R() < 0.45) denounce(f, v, q);
      }
    }
  }

  // ------------------------------ what people say ------------------------------
  function rumor(fac, set, txt, sid, real, heat, o) {
    const S = G.S; const s = st();
    const dup = s.rumors.find(x => x.txt === txt && S.day - x.day < 12); if (dup) { dup.heat += (heat || 1) * 0.6; return dup; }
    const r = Object.assign({ id: s.nr++, fac: fac || 0, set: set || 0, txt, soc: sid || 0, t: !!real, day: S.day, heat: heat || 1 }, o || {});
    s.rumors.push(r); if (s.rumors.length > 40) s.rumors.shift();
    const sn = S.settlements.get(set);
    if (G.R() < 0.6) log(`Corre um boato${sn ? ' em ' + sn.name : ''}: “${txt}”`, 'rumor', sn ? sn.cx : undefined, sn ? sn.cy : undefined);
    G.Stories && G.Stories.signal('rumor', { id: r.id, fac, set, soc: sid || 0, real: !!real });
    return r;
  }
  Sc.rumor = rumor;
  // the town's own talk: some of it true, much of it not
  function gossip(f) {
    const S = G.S; const s = st();
    const sets = G.Fac.settlementsOf(f.id); if (!sets.length) return;
    const set = G.pick(sets);
    const folk = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && v.age >= 18);
    if (folk.length < 8) return;
    const real = s.socs.filter(q => !q.gone && Sc.membersOf(q).some(v => v.set === set.id));
    if (real.length && G.R() < 0.45) {
      const q = G.pick(real); const mem = Sc.membersOf(q).filter(v => v.set === set.id); const v = G.pick(mem);
      const lines = [
        `${v.name} sai de casa nas noites sem lua e só volta antes do galo`,
        `há gente importante em ${set.name} que se cumprimenta com um sinal na palma da mão`,
        q.creed === 'ouro' ? `os mercadores de ${set.name} e de outros reinos combinam os preços entre si` : q.creed === 'deus' ? `de noite, ${q.lodges[0] && q.lodges[0].kind === 'caverna' ? 'vindo d' + q.lodges[0].name.replace(/^(o|a) /, '$1 ') : 'vindo do bosque'}, se ouvem cânticos numa língua que ninguém fala` : q.creed === 'liberdade' ? `alguém anda pintando uma aurora nas paredes, de madrugada` : q.creed === 'saber' ? `existem livros que ninguém tem permissão de ler, guardados por gente de capuz` : `nada acontece em ${f.name} sem que um certo grupo queira`,
      ];
      rumor(f.id, set.id, cap(G.pick(lines)) + '.', q.id, true, 1);
      return;
    }
    // invention: an order that does not exist, a member who is not one
    let fk = s.fakes.find(x => x.fac === f.id && S.day - x.day < 30);
    if (!fk) { fk = { name: FAKE[Math.floor(G.R() * FAKE.length)], fac: f.id, day: S.day }; s.fakes.push(fk); if (s.fakes.length > 10) s.fakes.shift(); }
    fk.what = G.pick(FAKE_DO);
    const odd = folk.filter(v => !v.secret && (v.age > 58 || v.role === 'curandeiro' || (v.civ && v.civ !== f.civ) || (v.g === 'f' && !v.partner && v.age > 40)));
    const accused = odd.length && G.R() < 0.7 ? G.pick(odd) : null;
    const verb = fk.what[plural(fk.name) ? 1 : 0];
    const txt = accused ? `${accused.name} é ${art(fk.name, 'de')} — ${plural(fk.name) ? (/^As/.test(fk.name) ? 'as' : 'os') : (/^A /.test(fk.name) ? 'a' : 'o')} que ${verb}` : `${cap(art(fk.name))} ${verb}`;
    rumor(f.id, set.id, txt + '.', 0, false, 1, { fake: fk.name, accused: accused ? accused.id : 0 });
  }
  const cap = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

  // ------------------------------ the ruler wants to know ------------------------------
  function denounce(f, v, q) {
    const S = G.S; const r = P.ruler(f); if (!r) return;
    if (r.secret === q.id) {
      // the ruler is one of them: the rumour dies — and so may whoever spread it
      log(`${v.name} foi contar a ${P.styled(f, r)} o que viu. Foi ouvid${oa(v)} com atenção, e mandad${oa(v)} para casa.`, 'secret', v.x, v.y);
      const w = (q.wit || []).find(x => x.id === v.id); if (w && !w.hunter) { w.fate = 'calar'; w.done = 0; w.at = S.day + 0.2; }
      return;
    }
    startInquiry(f, q.id, 0, v.id);
  }
  function startInquiry(f, sid, fake, by) {
    const S = G.S; const s = st();
    if (s.inq.some(i => i.fac === f.id)) return;
    const r = P.ruler(f); if (!r) return;
    const pe = P.leaderPe(f);
    // who looks: a priest for a heresy, a soldier or a scribe otherwise
    let inv = null, bs = -1e9;
    for (const v of S.villagers.values()) {
      if (G.Fac.idOfV(v) !== f.id || v.captive || v.age < 22 || v.age > 62 || v.secret || v.id === r.id || (v.task && v.task.pri >= 3)) continue;
      const sc = (v.role === 'sacerdote' ? 2 : v.role === 'guerreiro' ? 1.6 : v.role === 'escriba' ? 1.8 : 0) + v.courage + P.persona(v).pie * 0.5 + (v.officer ? 1 : 0);
      if (sc > bs) { bs = sc; inv = v; }
    }
    if (!inv) return;
    const q = soc(sid);
    const i = { id: S.nextId++, fac: f.id, soc: sid || 0, fake: fake || '', by: inv.id, accuser: by || 0, day: S.day, clue: 0, t: 0, found: 0 };
    s.inq.push(i);
    const what = q ? art(q.name) : fake ? art(fake) : 'uma seita secreta';
    log(`${styV(f, r)} ouviu falar ${q ? art(q.name, 'de') : fake ? art(fake, 'de') : 'de uma seita'} e mandou ${inv.name} descobrir a verdade. ${inv.name} começou a fazer perguntas.`, 'secret', inv.x, inv.y);
    G.Stories && G.Stories.signal('inquiry', { id: i.id, fac: f.id, soc: sid || 0, fake: fake || '', by: inv.id, accuser: by || 0, what });
    G.Vg.endTask(inv); G.Vg.setTask(inv, { type: 'inquire', inq: i.id, pri: 2.15, st: 0, kind: 'inquire' });
    void pe;
  }
  Sc.startInquiry = startInquiry;
  Sc._found = () => found();
  // ---- for the stories that stage these nights ----
  Sc.meetOfLodge = lid => st().meets.find(m => m.lodge === lid) || null;
  Sc.meetById = id => st().meets.find(m => m.id === id) || null;
  Sc.creed = q => CREED[q.creed];
  Sc.lodgeName = l => inPlace(l);
  Sc.toLodge = l => toPlace(l);
  function endInquiry(i) { const s = st(); const k = s.inq.indexOf(i); if (k >= 0) s.inq.splice(k, 1); const inv = person(i.by); if (inv && inv.task && inv.task.type === 'inquire') G.Vg.endTask(inv); }
  // the meeting broken in on, by the one who was watching
  Sc.exposeMeet = function (iid, mid) {
    const i = Sc.inquiry(iid); const m = Sc.meetById(mid); if (!i || !m) return false;
    const q = soc(m.soc); const f = G.Fac.get(i.fac); const inv = person(i.by); if (!q || !f || !inv) return false;
    i.found = 1; expose(q, f, m, inv); endInquiry(i); return true;
  };
  // the arrests at dawn, on a word sworn before the ruler (no meeting needed)
  Sc.raid = function (iid, ids) {
    const i = Sc.inquiry(iid); if (!i) return [];
    const q = soc(i.soc); const f = G.Fac.get(i.fac); const inv = person(i.by); if (!q || !f) return [];
    const caught = ids.map(person).filter(v => v && v.secret === q.id && v.id !== f.leader && !v.captive).slice(0, 4);
    q.exposed[f.id] = G.S.day;
    for (const v of caught) { leave(q, v.id); v.robe = null; G.Vg.endTask(v); }
    if (caught.length && G.Justice) G.Justice.sentence(f, caught, `por pertencerem a uma seita secreta, ${art(q.name)}`.replace('pertencerem', caught.length > 1 ? 'pertencerem' : 'pertencer'), { set: caught[0].set });
    rumor(f.id, caught[0] ? caught[0].set : 0, `${art(q.name)} existe mesmo — e quem foi pego vai pagar.`.replace(/^./, c => c.toUpperCase()), q.id, true, 3);
    log(`Ao amanhecer, os guardas de ${f.name} bateram nas portas que ${inv ? inv.name : 'alguém'} apontou: ${caught.map(v => v.name).join(', ').replace(/, ([^,]*)$/, ' e $1') || 'ninguém foi achado'}${caught.length ? (caught.length > 1 ? ' foram levados' : ' foi levad' + oa(caught[0])) : ''}. ${cap(art(q.name))} existe.`, 'secret', inv ? inv.x : undefined, inv ? inv.y : undefined);
    G.Stories && G.Stories.signal('exposed', { soc: q.id, fac: f.id, by: i.by, ids: caught.map(v => v.id), x: inv ? inv.x : 0, y: inv ? inv.y : 0 });
    if (q.members.length === 0 || !person(q.master)) q.gone = G.S.day;
    endInquiry(i); return caught;
  };
  // the one who saw too much, made silent
  Sc.silence = function (killer, victim, sid, iid) {
    const q = soc(sid); if (!q || !killer || !victim) return;
    G.FX && G.FX.blood(victim.x, victim.y); victim.lastBy = killer.id;
    const nm = victim.name, og = victim.g, ox = victim.x, oy = victim.y;
    G.Vg.damage(victim, 999, 'coup', false, killer.id); q.deeds++;
    const w = (q.wit || []).find(x => x.id === victim.id); if (w) w.done = 1;
    log(`${nm}, que ${iid ? 'fazia perguntas demais' : 'tinha visto o que não devia'}, foi ${og === 'f' ? 'encontrada morta' : 'encontrado morto'}. Quem fez foi ${killer.name}, ${art(q.name, 'de')} — mas isso só você sabe.`, 'secret', ox, oy);
    rumor(G.Fac.idOfV(killer), killer.set, `${nm} morreu porque viu o que não devia.`, q.id, true, 1.6);
    G.Stories && G.Stories.signal('silenced', { who: victim.id, by: killer.id, soc: q.id, x: ox, y: oy, inq: iid || 0 });
    if (iid) { const i = Sc.inquiry(iid); if (i) endInquiry(i); }
  };
  Sc.endInquiry = id => { const i = Sc.inquiry(id); if (i) endInquiry(i); };
  Sc.inquiry = id => st().inq.find(i => i.id === id) || null;
  Sc.witnessOf = (sid, id) => { const q = soc(sid); return q ? (q.wit || []).find(w => w.id === id) || null : null; };
  function inquiryTick(i, dt) {
    const S = G.S; const s = st(); const f = G.Fac.get(i.fac); const inv = person(i.by); const q = soc(i.soc);
    const done = () => { const k = s.inq.indexOf(i); if (k >= 0) s.inq.splice(k, 1); if (inv && inv.task && inv.task.type === 'inquire') G.Vg.endTask(inv); };
    if (!f || !f.alive) return done();
    i.t += dt;
    if (!inv) { log(`O inquérito em ${f.name} acabou: quem fazia as perguntas não está mais vivo. Há quem diga que perguntou demais.`, 'secret'); return done(); }
    // the order notices the questions
    if (q && i.clue > 0.45 && !i.hunted && q.lodges.length) {
      const mst = person(q.master); if (mst && P.persona(mst).cru > 0.5 && G.R() < 0.5) {
        i.hunted = 1; const hunter = Sc.membersOf(q).filter(o => !o.captive && o.age < 60).sort((a, b) => P.persona(b).cru - P.persona(a).cru)[0];
        if (hunter) { G.Vg.endTask(hunter); G.Vg.setTask(hunter, { type: 'stalk', target: inv.id, soc: q.id, pri: 2.6, st: 0, kind: 'stalk', inq: i.id }); }
      } else i.hunted = 1;
    }
    // found: a meeting in the act, with the investigator watching
    if (q && !i.found && !(i.hold && G.S.clock < i.hold)) for (const m of s.meets) {
      if (m.soc !== q.id || m.phase !== 'rite') continue;
      if (G.dist(inv.x, inv.y, m.x, m.y) < 9 || (i.clue >= 1 && G.R() < 0.02)) { i.found = 1; expose(q, f, m, inv); return done(); }
    }
    if (i.t > DAY() * (i.long || 3.5) && !(i.hold && G.S.clock < i.hold)) {
      // nothing found: a calm ruler lets it be; a frightened, cruel one burns someone anyway
      const pe = P.leaderPe(f); const r = P.ruler(f);
      const rm = st().rumors.find(x => x.fac === f.id && x.accused && person(x.accused) && (!q ? x.fake === i.fake : true));
      if (pe.cru > 0.55 && pe.pie > 0.35 && rm && G.Justice) {
        const acc = person(rm.accused);
        const others = [...S.villagers.values()].filter(v => v.set === acc.set && v !== acc && !v.secret && !v.captive && v.age > 50 && G.R() < 0.2).slice(0, 1);
        G.Justice.sentence(f, [acc].concat(others), `por bruxaria, acusad${oa(acc)} de pertencer ${art(rm.fake || 'a uma seita', 'a')}`, { set: acc.set });
        log(`O inquérito de ${inv.name} não achou ${rm.fake ? art(rm.fake) : 'seita nenhuma'} — mas ${styV(f, r)} precisava de culpados. ${acc.name} vai à fogueira.`, 'tyrant', acc.x, acc.y);
        G.Stories && G.Stories.signal('witchHunt', { fac: f.id, ids: [acc.id].concat(others.map(v => v.id)), fake: rm.fake || '', by: inv.id });
      } else log(`${inv.name} perguntou por toda parte e não achou nada. ${q ? 'Quem sabe, cala.' : 'Talvez nunca tenha havido nada para achar.'}`, 'secret', inv.x, inv.y);
      return done();
    }
  }
  // the order unmasked: the members of this realm taken, the lodge burnt
  function expose(q, f, m, inv) {
    const S = G.S; const l = q.lodges.find(x => x.id === m.lodge);
    q.exposed[f.id] = S.day;
    const caught = Sc.membersOf(q).filter(v => G.Fac.idOfV(v) === f.id && v.id !== f.leader && v.id !== inv.id && G.dist(v.x, v.y, m.x, m.y) < 12).slice(0, 4);
    const r = P.ruler(f);
    log(`${inv.name} seguiu os mantos na noite e chegou ${l ? toPlace(l) : 'a um lugar escondido'}: ${art(q.name)} existe. ${caught.length ? caught.map(v => v.name).join(', ').replace(/, ([^,]*)$/, ' e $1') + (caught.length > 1 ? ' foram presos' : ' foi pres' + oa(caught[0])) + ' ali mesmo, ainda de capuz.' : 'Os encapuzados fugiram pela escuridão.'}`, 'secret', m.x, m.y);
    G.UI && G.UI.toast(cap(art(q.name)), `Descoberta em ${f.name}.`, 'secret');
    for (const v of caught) { leave(q, v.id); G.Vg.endTask(v); }
    if (caught.length && G.Justice && r) G.Justice.sentence(f, caught, `por pertencerem a uma seita secreta, ${art(q.name)}`.replace('pertencerem', caught.length > 1 ? 'pertencerem' : 'pertencer'), { set: caught[0].set });
    if (l && l.kind === 'fachada' && l.b) { const b = S.buildings.get(l.b); if (b) G.Nature.ignite(W.idx(b.x, b.y), 0.9); }
    if (l) q.lodges = q.lodges.filter(x => x !== l);
    endMeet(m);
    rumor(f.id, l ? l.set : 0, `${art(q.name)} existe mesmo — e quem foi pego vai pagar.`.replace(/^./, c => c.toUpperCase()), q.id, true, 3);
    G.Stories && G.Stories.signal('exposed', { soc: q.id, fac: f.id, by: inv.id, ids: caught.map(v => v.id), x: m.x, y: m.y });
    if (q.members.length === 0 || !person(q.master)) { q.gone = S.day; }
  }

  // ------------------------------ the order moves the realms ------------------------------
  function politics(q) {
    const S = G.S;
    for (const f of G.Fac.all()) {
      if (!f.alive) continue;
      const mem = Sc.membersOf(q).filter(v => G.Fac.idOfV(v) === f.id);
      q.power[f.id] = Math.round(mem.reduce((s, v) => s + standing(v), 0));
      const r = P.ruler(f); if (!r || !mem.length || f.rev || f.coup) continue;
      // the merchants' league fills its brothers' purses
      if (q.creed === 'ouro') for (const v of mem) { const h = S.buildings.get(v.home); if (h && G.Eco.coinage(f.id)) h.coin = (h.coin || 0) + 0.8; }
      if (r.secret === q.id) continue;
      const mst = person(q.master);
      // a hand behind the throne: when the order is strong in a realm and its master is hungry, it strikes
      if (q.creed === 'poder' && q.power[f.id] >= 16 && mst && P.persona(mst).amb > 0.7 && G.S.day - (q.lastCoup || -99) > 8 && G.R() < 0.035) {
        q.lastCoup = G.S.day;
        const blade = mem.sort((a, b) => standing(b) - standing(a))[0];
        P.startCoup(f, blade); if (f.coup) { f.coup.goal = 'oligarquia'; f.coup.secret = q.id; }
        log(`Por trás do golpe em ${f.name} há mais do que ambição: ${blade.name} é ${art(q.name, 'de')}. Só você sabe.`, 'secret', blade.x, blade.y);
        G.Stories && G.Stories.signal('plot', { fac: f.id, lead: blade.id, goal: 'oligarquia', secret: q.id });
      }
      // the sons of the dawn arm the people against a tyrant
      if (q.creed === 'liberdade' && P.tyr(f) && mem.length >= 2 && G.R() < 0.05 && G.Polity) {
        const lead = mem.sort((a, b) => b.courage - a.courage)[0];
        if (G.Polity.uprising(f, lead, ['povo', 'artesaos'], G.Polity.available(f, 'democracia') ? 'democracia' : 'conselho', 'contra a tirania')) log(`O levante em ${f.name} foi preparado em segredo, noite após noite, ${art(q.name, 'por')}. Só você sabe.`, 'secret', lead.x, lead.y);
      }
    }
  }
  // (called by polity.js) the ruler's choices leaning the order's way
  Sc.bend = function (f, opts) {
    const r = P.ruler(f); const q = r && Sc.of(r); if (!q) return;
    for (const o of opts) {
      if (q.creed === 'ouro') { if (o[0] === 'impostosMais') o[1] -= 0.25; if (o[0] === 'privatizar') o[1] += 0.3; if (o[0] === 'estatizar') o[1] -= 1; }
      if (q.creed === 'deus' && o[0] === 'dizimo') o[1] += 0.2;
      if (q.creed === 'liberdade' && o[0] === 'impostosMenos') o[1] += 0.2;
    }
  };
  // (called by polity.js) in an election, the brothers vote for their own
  Sc.voteBias = (voter, cand) => (voter.secret && voter.secret === cand.secret ? 6 : 0);

  // ------------------------------ the errands, walked ------------------------------
  Sc.run = function (v, t, dt, H) {
    const S = G.S;
    if (t.type === 'conclave') {
      const m = st().meets.find(x => x.id === t.m); if (!m) { v.robe = null; H.end(v); return true; }
      const q = soc(m.soc);
      if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { H.end(v); return true; } t.st = 1; return true; }
      if (t.st === 1) {
        // the robe goes on near the place, never in the street
        if (q && !v.robe && G.dist(v.x, v.y, m.x, m.y) < 5) { v.robe = CREED[q.creed].robe; v.robeMark = CREED[q.creed].mark; }
        if (H.move(v, dt, 0.95)) { t.st = 2; v.actT = 0; if (q) { v.robe = CREED[q.creed].robe; v.robeMark = CREED[q.creed].mark; } if (m.kind === 'fachada' && m.b && S.buildings.get(m.b)) v.inside = m.b; }
        if (t.age > 90) t.st = 2;
        return true;
      }
      v.moving = false; G.faceTo(v, m.x - v.x, m.y - v.y);
      v.act = m.phase === 'rite' ? (t.master ? (Math.sin(S.clock * 1.4) > 0 ? 'call' : 'pray') : (Math.sin(S.clock * 2 + v.id) > -0.2 ? 'pray' : '')) : '';
      return true;
    }
    if (t.type === 'lured') {
      const m = st().meets.find(x => x.id === t.m); if (!m) { H.end(v); return true; }
      if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { H.end(v); return true; } t.st = 1; return true; }
      if (t.st === 1) { if (H.move(v, dt, 0.8)) { t.st = 2; v.actT = 0; } if (t.age > 90) t.st = 2; return true; }
      v.moving = false; v.act = m.phase === 'rite' ? 'kneel' : ''; return true;
    }
    if (t.type === 'insone') {
      if (t.st === 0) { if (!H.goto(v, t.x, t.y, false)) { H.end(v); return true; } t.st = 1; return true; }
      if (t.st === 1) { v.act = ''; if (H.move(v, dt, 0.6)) { t.st = 2; v.actT = 0; } if (t.age > 70) H.end(v); return true; }
      v.moving = false; const m = st().meets.find(x => x.id === t.m); if (m) G.faceTo(v, m.x - v.x, m.y - v.y); v.act = 'sneak';
      if (t.age > 50 || !m) { H.end(v); }
      return true;
    }
    if (t.type === 'stalk') {
      const o = person(t.target); const q = soc(t.soc);
      if (!o || !q || t.age > DAY() * 1.6) { if (!o && q && t.w) { const w = (q.wit || []).find(x => x.id === t.target); if (w) w.done = 1; } H.end(v); return true; }
      // only when nobody else is near, and best at night
      const near = G.dist(v.x, v.y, o.x, o.y);
      let alone = !o.inside && !o.aboard; if (alone) for (const p of S.villagers.values()) { if (p === v || p === o || p.sleeping || p.inside) continue; if (G.dist2(p.x, p.y, o.x, o.y) < 25) { alone = false; break; } }
      if (near < 0.9 && alone) {
        v.act = 'stab'; v.actT = 0; G.faceTo(v, o.x - v.x, o.y - v.y);
        G.FX && G.FX.blood(o.x, o.y); o.lastBy = v.id;
        const nm = o.name, og = o.g, ox = o.x, oy = o.y;
        G.Vg.damage(o, 999, 'coup', false, v.id);
        q.deeds++;
        const w = (q.wit || []).find(x => x.id === t.target); if (w) w.done = 1;
        log(`${nm}, que ${t.inq ? 'fazia perguntas demais' : 'tinha visto o que não devia'}, foi ${og === 'f' ? 'encontrada morta' : 'encontrado morto'}. Quem fez foi ${v.name}, ${art(q.name, 'de')} — mas isso só você sabe.`, 'secret', ox, oy);
        rumor(G.Fac.idOfV(v), v.set, `${nm} morreu porque viu o que não devia.`, q.id, true, 1.6);
        G.Stories && G.Stories.signal('silenced', { who: t.target, by: v.id, soc: q.id, x: ox, y: oy, inq: t.inq || 0 });
        H.end(v); G.Vg.fleeFrom(v, ox, oy, 8, 'war');
        return true;
      }
      // follow at a distance, close in when alone
      const want = alone && (G.isNight() || G.R() < 0.002) ? 0.5 : 4;
      if (near > want + 0.4) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = near > 8 ? 1 : 0.4; if (!H.goto(v, o.x, o.y, true)) { H.end(v); return true; } } H.move(v, dt, near > 8 ? 1 : 0.85); v.act = near < 6 ? 'sneak' : ''; }
      else { v.moving = false; v.path = null; v.act = 'sneak'; }
      return true;
    }
    if (t.type === 'inquire') {
      const i = st().inq.find(x => x.id === t.inq); if (!i) { H.end(v); return true; }
      const q = soc(i.soc); const night = G.isNight();
      // by day: questions in the streets; by night: watching where the rumours point
      if (!t.dest || H.arrived(v) && (t.wait = (t.wait || 0) + dt) > 6) {
        t.wait = 0;
        let x, y;
        if (night && q && q.lodges.length && i.clue > 0.3) { const l = q.lodges.reduce((a, b) => (G.dist(v.x, v.y, a.x, a.y) < G.dist(v.x, v.y, b.x, b.y) ? a : b)); x = l.x + G.rr(-4, 4) * (1.2 - Math.min(1, i.clue)); y = l.y + G.rr(-3, 3) * (1.2 - Math.min(1, i.clue)); }
        else { const set = S.settlements.get(v.set) || G.Fac.capitalOf(i.fac); if (!set) { H.end(v); return true; } x = set.cx + G.rr(-6, 6); y = set.cy + G.rr(-6, 6); }
        t.dest = [x, y]; if (!H.goto(v, x, y, true)) t.dest = null;
        // a question asked: the truth leaves traces, a lie only echoes
        if (!night) { i.clue += q ? 0.09 + (q.wit || []).length * 0.02 : 0.03; v.act = 'talk'; }
      }
      if (t.dest && !H.arrived(v)) H.move(v, dt, 0.9); else { v.moving = false; v.act = night ? 'sneak' : 'talk'; }
      if (t.age > DAY() * 4) H.end(v);
      return true;
    }
    return false;
  };
  Sc.taskText = function (v, t) {
    if (t.type === 'conclave') { const m = st().meets.find(x => x.id === t.m); const q = m && soc(m.soc); return q ? `Em segredo: reunião ${art(q.name, 'de')}` : 'Saiu na noite, sem dizer aonde'; }
    if (t.type === 'lured') return 'Chamad' + oa(v) + ' para um encontro à meia-noite';
    if (t.type === 'insone') return 'Sem sono, andando na noite';
    if (t.type === 'stalk') { const o = person(t.target); return o ? `Seguindo ${o.name} de longe` : 'Seguindo alguém'; }
    if (t.type === 'inquire') return G.isNight() ? 'Vigiando na escuridão' : 'Fazendo perguntas pela cidade';
    return null;
  };
  // the god's eye in the inspector: what nobody else knows
  Sc.personLine = function (v) {
    const q = Sc.of(v); if (!q) return '';
    const m = q.members.find(x => x.id === v.id); const rk = m ? (m.rank === 'mestre' ? (v.g === 'f' ? 'grã-mestra' : 'grão-mestre') : m.rank === 'irmao' ? (v.g === 'f' ? 'irmã' : 'irmão') : 'iniciad' + oa(v)) : 'membro';
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    return `<div class="secret-line" title="Ninguém sabe disso — só você."><i style="background:${CREED[q.creed].mark}"></i>Em segredo: ${esc(rk)} ${esc(art(q.name, 'de'))}<small>${esc(CREED[q.creed].want)}</small></div>`;
  };

  // ------------------------------ the loop ------------------------------
  let tA = 0, tB = 0, lastDay = -1;
  Sc.update = function (dt) {
    const S = G.S; if (!S) return; const s = st();
    for (const m of s.meets.slice()) { try { tickMeet(m, dt); } catch (e) { console.warn('secrets meet', e); endMeet(m); } }
    for (const i of s.inq.slice()) { try { inquiryTick(i, dt); } catch (e) { console.warn('secrets inq', e); s.inq.splice(s.inq.indexOf(i), 1); } }
    tA += dt; tB += dt;
    if (tA >= 3) {
      tA = 0;
      // meetings on the nights they are due
      if (S.time > 0.8 && S.time < 0.9) for (const q of s.socs) if (!q.gone) for (const l of q.lodges) if (S.day >= l.next && !meetOf(l)) startMeet(q, l);
      for (const q of s.socs) if (!q.gone) witnessTick(q);
    }
    const newDay = S.day !== lastDay; if (newDay) lastDay = S.day;
    if (tB >= 20 || newDay) {
      tB = 0;
      if (S.day >= 6 && G.R() < 0.18) found();
      for (const q of s.socs) {
        if (q.gone) continue;
        for (const mm of q.members.slice()) if (!person(mm.id)) q.members = q.members.filter(x => x !== mm);
        if (!person(q.master)) { const heir = Sc.membersOf(q).sort((a, b) => standing(b) - standing(a))[0]; if (heir) { q.master = heir.id; const mm = q.members.find(x => x.id === heir.id); if (mm) mm.rank = 'mestre'; } else { q.gone = S.day; continue; } }
        if (G.R() < 0.25) recruit(q);
        if (newDay) politics(q);
      }
      if (newDay) for (const f of G.Fac.all()) {
        if (!f.alive || G.Fac.pop(f.id) < 20) continue;
        if (G.R() < 0.35) gossip(f);
        // enough talk reaches the ruler
        const hot = s.rumors.filter(r => r.fac === f.id && S.day - r.day < 6);
        const heat = hot.reduce((a, r) => a + r.heat, 0); const pe = P.leaderPe(f);
        if (heat >= 4 && (pe.pie > 0.5 || pe.cru > 0.5 || pe.amb > 0.65) && G.R() < 0.3) {
          const tr = hot.filter(r => r.soc).sort((a, b) => b.heat - a.heat)[0]; const fk = hot.find(r => r.fake);
          const r = P.ruler(f); const q = tr && soc(tr.soc);
          if (q && r && r.secret === q.id) { for (const x of hot) x.heat = 0; }
          else if (tr) startInquiry(f, tr.soc, '', tr.witness || 0);
          else if (fk) startInquiry(f, 0, fk.fake, 0);
        }
        for (const r of s.rumors) r.heat *= 0.85;
      }
    }
  };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.secrets = G.S.secrets || null; },
    load(o) {
      const S = G.S; S.secrets = o.secrets || null;
      for (const v of S.villagers.values()) { v.robe = null; }
      const s = S.secrets; if (!s) return;
      // the night's meeting is over; the hunts and the questions start again
      s.meets = [];
      for (const q of s.socs) for (const w of q.wit || []) if (!w.done && w.hunter) w.hunter = 0;
      for (const i of s.inq) { const v = S.villagers.get(i.by); if (v) G.Vg.setTask(v, { type: 'inquire', inq: i.id, pri: 2.15, st: 0, kind: 'inquire' }); }
    },
  });

  // ------------------------------ the realm panel: what the streets whisper ------------------------------
  if (G.Eco && G.Eco.realmHTML) {
    const old = G.Eco.realmHTML;
    G.Eco.realmHTML = function (f, esc) {
      const base = old(f, esc); const s = G.S.secrets; if (!s) return base;
      const rs = s.rumors.filter(r => r.fac === f.id).slice(-4).reverse();
      const known = s.socs.filter(q => !q.gone && q.power[f.id] > 0);
      if (!rs.length && !known.length) return base;
      return base + `<div class="rm-sec">
        ${rs.length ? `<div class="sx-h">Boatos</div>${rs.map(r => `<div class="sx-r ${r.t ? 'true' : 'false'}" title="${r.t ? 'É verdade — e só você sabe.' : 'É mentira.'}"><i>${r.t ? '◉' : '○'}</i>${esc(r.txt)}<small>dia ${r.day}</small></div>`).join('')}` : ''}
        ${known.length ? `<div class="sx-h">O que só você sabe</div>${known.map(q => `<div class="sx-s"><b style="color:${CREED[q.creed].mark}">${esc(q.name)}</b> — ${Sc.membersOf(q).filter(v => G.Fac.idOfV(v) === f.id).length} membros aqui; querem ${esc(CREED[q.creed].want)}.${q.exposed[f.id] ? ' <em>Descoberta.</em>' : ''}</div>`).join('')}` : ''}
      </div>`;
    };
  }

  // ------------------------------ drawing: the brazier and the candles of a meeting ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  function drawRite(c, o, sx, sy, t, nightF) {
    const m = o.m; if (m.kind === 'fachada') { if (nightF > 0.2) { c.save(); c.globalAlpha = 0.25 + Math.sin(t * 3) * 0.08; c.fillStyle = '#ffb060'; c.fillRect(sx - 2, sy - 6, 4, 2.4); c.restore(); } return; }
    const q = soc(m.soc); const col = q ? CREED[q.creed].mark : '#c8a24a';
    const O = (dx, dy, z) => G.Render.off(dx, dy, z);
    c.save(); c.translate(sx, sy);
    // a circle drawn on the ground
    c.strokeStyle = col; c.globalAlpha = 0.55; c.lineWidth = 0.5; c.beginPath();
    for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU; const p = O(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0); if (k) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); } c.stroke();
    c.globalAlpha = 1;
    // candles
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + 0.3; const p = O(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0); c.fillStyle = '#e8e0c8'; c.fillRect(p[0] - 0.35, p[1] - 1.6, 0.7, 1.6); c.fillStyle = '#ffd25a'; c.beginPath(); c.ellipse(p[0], p[1] - 2.1 - Math.sin(t * 11 + k) * 0.15, 0.35, 0.6, 0, 0, TAU); c.fill(); }
    // the brazier
    c.fillStyle = '#3a3430'; c.fillRect(-1.6, -3, 3.2, 2.2); c.fillStyle = '#2a2420'; c.fillRect(-0.4, -0.9, 0.8, 0.9);
    for (let k = 0; k < 4; k++) { const fl = Math.sin(t * 10 + k * 1.7) * 0.8; c.fillStyle = k % 2 ? 'rgba(255,170,40,0.9)' : 'rgba(255,90,20,0.85)'; c.beginPath(); c.moveTo(-1.4 + k * 0.9, -3); c.quadraticCurveTo(-1 + k * 0.9 + fl, -7 - (k % 2) * 1.5, -0.5 + k * 0.9, -3); c.fill(); }
    if (nightF > 0.15 && G.Art.glow) { const img = G.Art.glow('warm'); if (img) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(0.6, nightF * 0.7); c.drawImage(img, -24, -30, 48, 48); } }
    c.restore();
  }
  G.renderHooks.ents.push(function (add) {
    const s = G.S && G.S.secrets; if (!s || !s.meets.length) return;
    for (const m of s.meets) { if (m.phase !== 'rite' && m.kind !== 'fachada') continue; add(m.x + m.y - 0.05, { fn: drawRite, m }, m.x, m.y); }
  });
})(window.G);
