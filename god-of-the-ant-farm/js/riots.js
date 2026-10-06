'use strict';
// ============================================================
//  Riots: the street rises.
//  When the taxes bleed the houses dry, when the granaries stay shut
//  on a hungry town, when the ruler seizes what the merchants built,
//  when the square is about to watch someone it loves hang — the
//  people take torches and stones and come out. They gather in the
//  square and shout; they march on what they hate (the tax house, the
//  palace, the granary, the scaffold); they set it on fire and carry
//  off what they can. The ruler answers: a mild one comes out to the
//  balcony and gives way; a hard one sends the guard, and the guard
//  kills. It ends crushed (the ringleaders to the scaffold), with a
//  concession, burnt out by nightfall — or, when the guard is too few
//  and the town too angry, as a revolution.
// ============================================================
(function (G) {
  const Ri = G.Riots = {};
  const W = G.W, P = G.Politics;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const riots = () => G.S.riots || (G.S.riots = []);
  const say = (v, txt, s) => G.Justice && G.Justice.say(v, txt, s);
  const byId = id => riots().find(r => r.id === id);

  // ------------------------------ why they rise, what they go for ------------------------------
  const WHY = {
    impostos: { txt: 'contra os impostos', shout: ['Abaixo os impostos!', 'Não pagamos mais!', 'Ladrões!', 'Fora os cobradores!', 'Chega!'], hit: ['coletoria', 'palace', 'storehouse'], concede: 'impostosMenos', grp: ['povo', 'artesaos', 'mercadores'] },
    fome: { txt: 'por pão', shout: ['Pão!', 'Nossos filhos têm fome!', 'Abram os celeiros!', 'Comida!'], hit: ['celeiro', 'storehouse', 'palace'], concede: 'pao', grp: ['povo', 'artesaos', 'militares'] },
    estatizar: { txt: 'contra o confisco', shout: ['Devolvam o que é nosso!', 'Ladrão!', 'Abaixo o tirano!', 'Nossas casas!'], hit: ['palace', 'coletoria'], concede: 'privatizar', grp: ['mercadores', 'artesaos', 'povo'] },
    execucao: { txt: 'para salvar os condenados', shout: ['Soltem!', 'Assassinos!', 'Ninguém vai morrer hoje!', 'Abaixo o carrasco!'], hit: ['scaffold'], grp: ['povo', 'artesaos', 'mercadores'] },
    recusa: { txt: 'contra a prisão de quem foi pedir', shout: ['Justiça!', 'Soltem!', 'Abaixo o tirano!'], hit: ['palace', 'coletoria'], concede: 'soltar', grp: ['povo', 'artesaos', 'mercadores'] },
    tirania: { txt: 'contra a tirania', shout: ['Abaixo o tirano!', 'Liberdade!', 'Basta!', 'Assassino!'], hit: ['palace', 'quartel'], grp: ['povo', 'artesaos', 'mercadores'] },
  };
  Ri.WHY = WHY;
  const HIT_NAME = { coletoria: 'a casa dos impostos', palace: 'o palácio', storehouse: 'o armazém', celeiro: 'o celeiro', quartel: 'o quartel', scaffold: 'o cadafalso', casa: 'a casa de quem governa', praca: 'a praça' };

  function squareOf(set) {
    const S = G.S;
    for (const b of S.buildings.values()) if (b.set === set.id && b.built && b.type === 'praca') { const c = G.Village.center(b); return [c[0], c[1]]; }
    const cf = S.buildings.get(set.campfire); return cf ? [cf.x + 1.5, cf.y + 1] : [set.cx, set.cy];
  }
  function pickTarget(f, set, D, o) {
    const S = G.S;
    if (o.free && G.Justice) { const e = G.Justice.list().find(q => q.id === o.free); if (e) return { kind: 'scaffold', b: 0, x: e.x, y: e.y + 1.1 }; }
    for (const want of D.hit) {
      if (want === 'scaffold') continue;
      let best = null;
      for (const b of S.buildings.values()) {
        if (!b.built || b.hp <= 0 || b.set !== set.id) continue;
        const ok = want === 'palace' ? !!(G.Court && G.Court.isPalace(b.type)) || b.type === 'palacio' : b.type === want;
        if (ok && (!best || (G.Court && G.Court.RANK ? (G.Court.RANK[b.type] || 0) > (G.Court.RANK[best.type] || 0) : false))) best = b;
      }
      if (best) { const fr = G.Village.frontTile(best); return { kind: want, b: best.id, x: fr[0], y: fr[1] + 0.8 }; }
    }
    const r = P.ruler(f); const h = r && S.buildings.get(r.home);
    if (h && h.built && h.set === set.id) { const fr = G.Village.frontTile(h); return { kind: 'casa', b: h.id, x: fr[0], y: fr[1] + 0.8 }; }
    const q = squareOf(set); return { kind: 'praca', b: 0, x: q[0], y: q[1] };
  }
  const courtOf = (v, r) => !!r && (v === r || v.id === r.partner || (r.kids || []).includes(v.id) || r.mother === v.id || r.father === v.id);

  // ------------------------------ it starts ------------------------------
  // why: a key of WHY; o: { lead, at:[x,y], free: execution id, boost, whyTxt }
  Ri.start = function (f, set, why, o) {
    const S = G.S; o = o || {};
    if (!f || !set || !f.alive || G.Village.facOfSet(set.id) !== f.id) return null;
    if (riots().some(q => q.set === set.id) || f.rev || f.coup) return null;
    if (G.War && G.War.threat && G.War.threat(set.id)) return null;
    const key = WHY[why] ? why : /cadafalso|salvar/.test(why || '') ? 'execucao' : 'tirania';
    const D = WHY[key]; const r = P.ruler(f); if (!r) return null;
    const g = f.grp || {};
    const ids = [];
    for (const v of S.villagers.values()) {
      if (ids.length >= 40) break;
      if (v.set !== set.id || v.captive || v.age < 15 || v.age > 64 || v.role === 'guerreiro' || v.role === 'sacerdote' || courtOf(v, r) || v.held || v.air || v.aboard || v.ug || v.hp < 40 || v.rebel) continue;
      if (v.task && (v.task.pri >= 3 || v.task.j)) continue;
      const k = v.grp || 'povo'; if (!D.grp.includes(k)) continue;
      const sat = g[k] ? g[k].sat : 40; const pe = P.persona(v);
      const p = 0.16 + v.courage * 0.32 + pe.agg * 0.24 + Math.max(0, 45 - sat) / 70 - (v.age > 50 ? 0.15 : 0) - (f.terror || 0) / 300 + (o.boost || 0);
      if (G.R() < p) ids.push(v.id);
    }
    if (ids.length < 5) return null;
    let lead = o.lead && S.villagers.get(o.lead);
    if (!lead || lead.set !== set.id || lead.captive || !ids.includes(lead.id)) {
      if (lead && lead.set === set.id && !lead.captive && !lead.held && !(lead.task && lead.task.pri >= 3)) ids.unshift(lead.id);
      else { lead = null; let bs = -1e9; for (const id of ids) { const v = S.villagers.get(id); const sc = v.courage + P.persona(v).agg + (v.hero ? 1 : 0); if (sc > bs) { bs = sc; lead = v; } } }
    }
    const at = o.at || squareOf(set);
    const tg = pickTarget(f, set, D, o);
    const R = { id: S.nextId++, fac: f.id, set: set.id, why: key, wtxt: o.whyTxt || D.txt, x: at[0], y: at[1], tg, lead: lead.id, ids: ids.slice(), n0: ids.length, phase: 'rally', t: 0, rt: 0, burned: [], looted: 0, coin: 0, guards: [], resp: '', free: o.free || 0, freed: 0, day: S.day, fled: 0, gk: 0 };
    riots().push(R); f.riotDay = S.day; set.riotDay = S.day;
    ids.forEach((id, i) => {
      const v = S.villagers.get(id); const a = G.hash(id * 13 + R.id) * Math.PI * 2, rr = 0.8 + G.hash(id * 7) * 2.2;
      G.Vg.setTask(v, { type: 'riot', r: R.id, pri: 3.4, st: 0, x: at[0] + Math.cos(a) * rr, y: at[1] + Math.sin(a) * rr * 0.8, kind: 'riot', lead: v === lead ? 1 : 0, job: '', cause: 'war', torch: i % 3 !== 2 || v === lead, hp0: v.hp });
    });
    set.loyalty = G.clamp(set.loyalty - 4, 0, 100);
    log(`Motim em ${set.name}! ${ids.length} pessoas tomam a praça com tochas e pedras${R.wtxt ? ', ' + R.wtxt : ''}, com ${lead.name} à frente.`, 'tyrant', at[0], at[1]);
    G.UI && G.UI.toast('Motim!', `${set.name}: o povo nas ruas${R.wtxt ? ' ' + R.wtxt : ''}.`, 'tyrant');
    G.UI && G.UI.notice && G.UI.notice(`Motim em ${set.name}`, 'tyrant');
    G.Audio && G.Audio.at(at[0], at[1], 'horn', true);
    G.Stories && G.Stories.signal('riot', { fac: f.id, set: set.id, lead: lead.id, why: key, n: ids.length, x: at[0], y: at[1], id: R.id });
    return R;
  };

  // ------------------------------ the ruler answers ------------------------------
  function respond(R, f, set) {
    const S = G.S; const r = P.ruler(f); const pe = P.leaderPe(f);
    const hard = pe.cru > 0.55 || (P.tyr(f) && pe.cru > 0.35) || f.gov === 'ditadura' || f.gov === 'tirania';
    const soft = !hard && pe.cru < 0.32 && (P.free(f) || G.R() < 0.45) && R.why !== 'execucao';
    R.resp = hard ? 'esmagar' : soft ? 'ouvir' : 'guarda';
    if (R.resp !== 'ouvir') {
      const max = R.resp === 'esmagar' ? 30 : 10;
      for (const v of S.villagers.values()) {
        if (R.guards.length >= max) break;
        if (v.role !== 'guerreiro' || v.captive || v.rebel || G.Fac.idOfV(v) !== f.id || v.aboard || v.ug || v.held || v.hp < 35 || G.dist(v.x, v.y, R.x, R.y) > 45) continue;
        if (v.task && v.task.pri >= 4.5) continue;
        R.guards.push(v.id);
        G.Vg.setTask(v, { type: 'riotguard', r: R.id, pri: 4.3, st: 0, kind: 'riotguard', cause: 'riot' });
      }
    }
    const who = r ? (t => (t.includes(',') ? t + ',' : t))(P.styled(f, r)) : 'Quem governa';
    if (R.resp === 'esmagar' && R.guards.length) log(`${who} não quis ouvir: mandou ${R.guards.length ? R.guards.length + ' soldados' : 'a guarda'} para a praça de ${set.name}, com ordem de acabar com o motim a qualquer preço.`, 'tyrant', R.x, R.y);
    else if (!R.guards.length) log(`${who} não tinha soldados para mandar: a multidão é dona das ruas de ${set.name}.`, 'tyrant', R.x, R.y);
    else if (R.resp === 'guarda') log(`${who} mandou a guarda conter o motim de ${set.name}.`, 'sword', R.x, R.y);
    else log(`${who} mandou dizer à multidão de ${set.name} que vai ouvi-la.`, 'crown', R.x, R.y);
  }

  // ------------------------------ the loop ------------------------------
  function alive(R) {
    const S = G.S; const out = [];
    for (const id of R.ids) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'riot' && v.task.r === R.id) out.push(v); }
    return out;
  }
  function guardsOf(R) {
    const S = G.S; const out = [];
    for (const id of R.guards) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'riotguard' && v.task.r === R.id) out.push(v); }
    return out;
  }
  function tick(R, dt) {
    const S = G.S; const f = G.Fac.get(R.fac); const set = S.settlements.get(R.set);
    if (!f || !f.alive || !set || G.Village.facOfSet(set.id) !== f.id) return end(R, 'gone');
    R.t += dt;
    const act = alive(R);
    // shouts
    R.rt -= dt; if (R.rt <= 0 && act.length) { R.rt = 0.5; const v = G.pick(act); if (G.R() < 0.6) say(v, G.pick(WHY[R.why].shout), 2.2); }
    if (R.phase === 'rally') {
      const there = act.filter(v => v.task.st === 2).length;
      if (R.t > 9 && R.t < 9 + dt * 1.5) { const l = S.villagers.get(R.lead); if (l) say(l, R.why === 'fome' ? 'Vamos buscar o que é nosso!' : R.why === 'execucao' ? 'Ao cadafalso!' : 'Hoje eles vão nos ouvir!', 3.5); }
      if ((there >= act.length * 0.7 && R.t > 10) || R.t > 22) {
        R.phase = 'march'; R.t = 0;
        respond(R, f, set);
        act.forEach((v, i) => { const a = (i / Math.max(1, act.length)) * Math.PI + G.rr(-0.2, 0.2), rr = 1.2 + (i % 4) * 0.55; const t = v.task; t.x = R.tg.x + Math.cos(a) * rr; t.y = R.tg.y + Math.sin(a) * rr * 0.7 + 0.4; t.st = 0; });
      }
      return outcome(R, f, set, act);
    }
    if (R.phase === 'march') {
      const there = act.filter(v => v.task.st === 2).length;
      if (there >= act.length * 0.6 || R.t > 30) {
        R.phase = 'rage'; R.t = 0;
        const loot = R.tg.kind === 'celeiro' || R.tg.kind === 'storehouse' || R.tg.kind === 'palace' || R.tg.kind === 'coletoria' || R.tg.kind === 'casa';
        act.forEach((v, i) => { v.task.job = R.tg.kind === 'scaffold' ? 'free' : v.task.torch && i % 2 === 0 && R.tg.b ? 'fire' : loot && i % 3 === 1 ? 'loot' : 'stone'; v.task.jt = G.rr(1, 5); });
        log(`A multidão de ${set.name} chegou ${R.tg.kind === 'scaffold' ? 'ao cadafalso' : 'diante d' + (HIT_NAME[R.tg.kind] || 'o palácio').replace(/^(a|o) /, (m, a) => a + ' ')}${R.tg.b ? ' e começou a atirar pedras e tochas' : ''}.`, 'fire', R.tg.x, R.tg.y);
      }
      return outcome(R, f, set, act);
    }
    if (R.phase === 'rage') {
      // the scaffold: they climb it and cut the ropes
      if (R.free && !R.freed && G.Justice) {
        const near = act.filter(v => G.dist(v.x, v.y, R.tg.x, R.tg.y - 1.1) < 2.6).length;
        if (near >= 3) freeCondemned(R, f, set);
      }
      return outcome(R, f, set, act);
    }
  }
  // the condemned set loose
  function freeCondemned(R, f, set) {
    const S = G.S; R.freed = 1;
    const e = G.Justice.list().find(q => q.id === R.free); if (!e) return;
    const names = [];
    for (const v of S.villagers.values()) if (v.task && v.task.type === 'condemned' && v.task.j === e.id) { names.push(v.name); v.hood = false; v.z = 0; v.dz = 0; G.Vg.endTask(v); G.Vg.fleeFrom(v, e.x, e.y, 9, 'war'); G.Vg.emote(v, 'happy', 3); }
    const exe = S.villagers.get(e.exe); if (exe) { exe.hood = false; exe.z = 0; G.Vg.endTask(exe); G.Vg.fleeFrom(exe, e.x, e.y, 10, 'war'); }
    G.Justice.cancel(e, '');
    if (names.length) {
      log(`A multidão invadiu o cadafalso de ${set.name}, derrubou o carrasco e soltou ${names.length > 1 ? names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1] : names[0]}!`, 'free', e.x, e.y);
      G.UI && G.UI.toast('O cadafalso tomado', `${set.name}: o povo soltou os condenados.`, 'free');
      G.Stories && G.Stories.signal('rescued', { fac: f.id, ids: e.ids.slice(), set: set.id, riot: R.id, x: e.x, y: e.y });
    }
  }
  function outcome(R, f, set, act) {
    const S = G.S; if (S.clock - (R.ck || 0) < 1) return; R.ck = S.clock;
    const gs = guardsOf(R); const pe = P.leaderPe(f);
    const dead = R.ids.filter(id => !S.villagers.has(id)).length;
    R.dead = dead;
    // crushed: the guard has cleared the square
    if (gs.length && act.length <= Math.max(2, R.n0 * 0.25) && R.phase !== 'rally') return end(R, 'esmagado');
    if (!act.length) return end(R, gs.length ? 'esmagado' : 'disperso');
    if (R.phase !== 'rage') return;
    // a ruler who listens comes out and gives way
    const D = WHY[R.why];
    if (R.resp === 'ouvir' && R.t > 14) return end(R, 'cedeu');
    // the guard is too few: a hard ruler holds, a softer one gives way
    if (R.t > 38 && gs.length * 2 < act.length && D.concede && pe.cru < 0.7 && !R.offered) { R.offered = 1; if (G.R() < 0.6) return end(R, 'cedeu'); }
    // and if the town is angry enough, the riot becomes a revolution
    if (R.t > 24 && !R.revTried && act.length >= 8 && set.loyalty < 32 && gs.length * 2 < act.length && (R.burned.length || R.t > 34)) {
      R.revTried = 1;
      if (G.R() < 0.55 && G.Fac.capitalOf(f.id) === set) return end(R, 'revolucao');
    }
    if (R.t > 75) return end(R, 'disperso');
  }

  // ------------------------------ how it ends ------------------------------
  function end(R, how) {
    const S = G.S; const k = riots().indexOf(R); if (k >= 0) riots().splice(k, 1);
    const f = G.Fac.get(R.fac); const set = S.settlements.get(R.set);
    const act = alive(R); const gs = guardsOf(R);
    const dead = R.ids.filter(id => !S.villagers.has(id)).length;
    const lead = S.villagers.get(R.lead);
    const goHome = () => { for (const v of act) { G.Vg.endTask(v); v.rioted = S.day; } for (const v of gs) G.Vg.endTask(v); };
    if (how === 'gone' || !f || !set) { goHome(); return; }
    const r = P.ruler(f); const styled = r ? P.styled(f, r) : 'quem governa'; const who = styled.includes(',') ? styled + ',' : styled;
    const burnt = R.burned.length;
    const tail = `${dead ? ` ${dead} ${dead > 1 ? 'pessoas morreram' : 'pessoa morreu'} na praça` : ''}${dead && burnt ? ';' : dead ? '.' : ''}${burnt ? ` ${burnt > 1 ? burnt + ' prédios arderam' : HIT_NAME[R.tg.kind] ? cap(HIT_NAME[R.tg.kind]) + ' ardeu' : 'Um prédio ardeu'}.` : ''}`;
    const memo = (key, d) => { (f.pol || (f.pol = {}))[key] = { day: S.day, d }; };
    if (how === 'revolucao' && lead && G.Polity && G.Polity.uprising) {
      goHome();
      const groups = [...new Set(R.ids.map(id => S.villagers.get(id)).filter(Boolean).map(v => v.grp || 'povo'))].filter(x => x !== 'militares' && x !== 'sacerdotes');
      const want = groups.includes('mercadores') && !groups.includes('povo') ? 'republica' : 'democracia';
      const goal = G.Polity.available(f, want) ? want : G.Polity.available(f, 'comuna') && P.persona(lead).agg > 0.6 ? 'comuna' : 'conselho';
      log(`O motim de ${set.name} não se apagou: virou revolução.${tail}`, 'tyrant', R.x, R.y);
      G.Polity.uprising(f, lead, groups.length ? groups : ['povo'], goal, R.wtxt);
      signalEnd(R, f, set, how, dead);
      return;
    }
    if (how === 'cedeu') {
      goHome();
      const D = WHY[R.why];
      log(`${who} saiu diante da multidão de ${set.name} e cedeu.${tail}`, 'crown', R.x, R.y);
      if (D.concede === 'soltar') releaseArrested(f, set);
      else if (D.concede && G.Polity) G.Polity.apply(f, D.concede, r, 'motim', 'povo');
      memo('motim_cedeu', { povo: 12, artesaos: 8, militares: -4 });
      for (const v of act) G.Vg.emote(v, 'happy', 3);
      f.terror = Math.max(0, (f.terror || 0) - 6);
      signalEnd(R, f, set, how, dead);
      return;
    }
    if (how === 'esmagado') {
      // the ones still standing are dragged off; the ringleaders will hang
      const caught = [];
      if (lead && !lead.captive && S.villagers.has(lead.id) && lead.set === set.id) caught.push(lead);
      for (const v of act) { if (caught.length >= 3) break; if (!caught.includes(v) && G.R() < 0.6) caught.push(v); }
      goHome();
      for (const v of act) if (!caught.includes(v)) G.Vg.fleeFrom(v, R.tg.x, R.tg.y, 8, 'war');
      f.terror = Math.min(100, (f.terror || 0) + 10 + dead);
      set.loyalty = G.clamp(set.loyalty - 6, 0, 100);
      memo('motim_esmagado', { povo: -10, artesaos: -8, mercadores: -4, militares: 4 });
      (f.grpHurt || (f.grpHurt = {})).povo = S.day;
      const sentenced = caught.length && G.Justice && !f.exec && r ? G.Justice.sentence(f, caught, `por levantar o povo contra ${r.g === 'f' ? 'a' : 'o'} ${P.title(f, r).toLowerCase()}`, { set: set.id, quiet: true }) : false;
      log(`A guarda de ${styled} esmagou o motim de ${set.name}.${tail}${sentenced ? ` ${caught.map(v => v.name).join(caught.length > 2 ? ', ' : ' e ').replace(/, ([^,]*)$/, ' e $1')} ${caught.length > 1 ? 'foram presos e vão' : 'foi pres' + oa(caught[0]) + ' e vai'} ao cadafalso.` : ''}`, 'tyrant', R.x, R.y);
      if (r && dead >= 4) P.earn(f, r, 'sanguinario');
      signalEnd(R, f, set, how, dead);
      return;
    }
    // dispersed: by nightfall the square is empty, the embers still glowing
    goHome();
    log(`O motim de ${set.name} se dispersou${act.length ? '; cada um voltou para casa' : ''}.${tail}`, 'fire', R.x, R.y);
    memo('motim', { povo: -3 });
    signalEnd(R, f, set, how, dead);
  }
  const cap = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  function signalEnd(R, f, set, how, dead) {
    G.Stories && G.Stories.signal('riotEnd', { fac: f.id, set: set.id, lead: R.lead, why: R.why, how, dead, burned: R.burned.length, looted: R.looted, id: R.id, x: R.x, y: R.y, ids: R.ids.slice() });
    G.Lore && G.Lore.note && G.Lore.note('riot', { fac: f.id, set: set.id, how, dead });
  }
  // a petition's leader who was arrested: the ruler lets them go
  function releaseArrested(f, set) {
    if (!G.Justice || !f.exec) return;
    const e = G.Justice.list().find(q => q.id === f.exec.j); if (!e || e.set !== set.id) return;
    const names = e.names.slice();
    G.Justice.cancel(e, `${names.join(' e ')} ${names.length > 1 ? 'foram soltos' : 'foi solt' + (e.gs[0] === 'f' ? 'a' : 'o')}: a execução foi suspensa.`);
  }
  Ri.end = end;

  // ------------------------------ a rioter, walked ------------------------------
  Ri.run = function (v, t, dt, H) {
    if (t.type === 'riotguard') return runGuard(v, t, dt, H);
    if (t.type !== 'riot') return false;
    const S = G.S; const R = byId(t.r);
    if (!R) { H.end(v); return true; }
    // hurt: run home
    if ((v.hp < Math.min(52, (t.hp0 || 100) - 16) && !t.brave) || v.hp < 24) { R.fled++; v.rioted = S.day; G.Vg.fleeFrom(v, R.tg.x, R.tg.y, 9, 'war'); G.Vg.emote(v, 'fear', 2.5); return true; }
    // a soldier on them: the bold fight back with sticks and stones, the rest scatter
    if (t.foe) {
      const o = S.villagers.get(t.foe);
      if (!o || G.dist(v.x, v.y, o.x, o.y) > 4) t.foe = 0;
      else { G.War.fightStep(v, t, o, dt, H, null); return true; }
    }
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { t.x = v.x; t.y = v.y; t.st = 2; return true; } t.st = 1; return true; }
    if (t.st === 1) { v.act = t.torch ? 'riot' : 'boo'; if (H.move(v, dt, 1.05)) { t.st = 2; v.actT = 0; } if (t.age > 80) t.st = 2; return true; }
    v.moving = false;
    const tx = R.phase === 'rally' ? R.x : R.tg.x, ty = R.phase === 'rally' ? R.y : R.tg.y - 0.6;
    G.faceTo(v, tx - v.x, ty - v.y);
    if (R.phase !== 'rage' || !t.job) { v.act = t.torch ? 'riot' : t.lead ? 'call' : 'boo'; return true; }
    t.jt -= dt; if (t.jt > 0) { v.act = t.torch ? 'riot' : 'boo'; return true; }
    const b = R.tg.b && S.buildings.get(R.tg.b);
    if (t.job === 'fire' && b && b.hp > 0) {
      v.act = 'throw'; v.actT = 0; t.jt = G.rr(5, 9);
      const i = W.idx(b.x + Math.floor(G.R() * b.w), b.y + Math.floor(G.R() * b.h));
      if (S.fire[i] <= 0 && G.Nature.ignite(i, 0.9)) {
        if (!R.burned.includes(b.id)) { R.burned.push(b.id); G.Audio && G.Audio.at(b.x, b.y, 'fire', true); }
        if (G.FX) G.FX.spawn({ x: v.x, y: v.y, z: 12, vx: (b.x + b.w / 2 - v.x) * 1.4, vy: (b.y + b.h / 2 - v.y) * 1.4, vz: 30, g: 60, life: 0.7, s0: 1.6, s1: 1.2, c: '#ffb040', k: 1 });
      }
      return true;
    }
    if (t.job === 'loot' && !t.got) {
      const f = G.Fac.get(R.fac); v.act = 'gather'; t.jt = G.rr(1.5, 3);
      if (f) {
        const food = R.tg.kind === 'celeiro' || R.tg.kind === 'storehouse' || R.why === 'fome' || !G.Eco.coinage(f.id);
        if (food && f.stock.food >= 2) { const n = Math.min(10, Math.floor(f.stock.food * 0.04) + 2); f.stock.food -= n; R.looted += n; t.got = 1; }
        else if (f.stock.moedas >= 2 && G.Eco.coinage(f.id)) { const n = Math.min(8, Math.floor(f.stock.moedas * 0.05) + 1); f.stock.moedas -= n; R.coin += n; const h = S.buildings.get(v.home); if (h) h.coin = (h.coin || 0) + n; t.got = 1; }
        if (t.got) { G.Vg.emote(v, 'happy', 2); t.job = 'stone'; }
      }
      return true;
    }
    // stones: at the soldiers if they came, at the windows if not
    let gd = null, bd = 36; for (const id of R.guards) { const o = S.villagers.get(id); if (!o) continue; const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; gd = o; } }
    v.act = 'throw'; v.actT = 0; t.jt = G.rr(2.2, 4.5);
    const tgx = gd ? gd.x : (b ? b.x + b.w / 2 : tx), tgy = gd ? gd.y : (b ? b.y + b.h / 2 : ty);
    if (G.FX) G.FX.spawn({ x: v.x, y: v.y, z: 9, vx: (tgx - v.x) * 1.6, vy: (tgy - v.y) * 1.6, vz: 26, g: 60, life: 0.62, s0: 1.1, s1: 1, c: '#8a857c', k: 0 });
    if (gd) { G.faceTo(v, gd.x - v.x, gd.y - v.y); if (G.R() < 0.18) G.Vg.damage(gd, 4, 'war', false, v.id); }
    else if (b && b.hp > 0 && G.R() < 0.3) G.Village.damageBuilding(b, 2, 'riot');
    return true;
  };
  // a soldier sent to clear the square
  function runGuard(v, t, dt, H) {
    const S = G.S; const R = byId(t.r);
    if (!R) { H.end(v); return true; }
    if (R.phase === 'rally' && t.st === 0) { if (!H.goto(v, R.x, R.y + 1.5, true)) { H.end(v); return true; } t.st = 1; }
    // the nearest rioter (in a massacre, the ones running away too)
    t.scan = (t.scan || 0) - dt;
    let o = t.foe && S.villagers.get(t.foe);
    if (!o || !o.task || (o.task.type !== 'riot' && !(R.resp === 'esmagar' && o.rioted === S.day && o.task.type === 'flee')) || t.scan <= 0) {
      t.scan = 1.2; o = null; let bd = 1e9;
      for (const id of R.ids) {
        const q = S.villagers.get(id); if (!q || q.inside || q.held) continue;
        const ok = q.task && ((q.task.type === 'riot' && q.task.r === R.id) || (R.resp === 'esmagar' && q.task.type === 'flee' && q.rioted === S.day));
        if (!ok) continue;
        const d = G.dist2(v.x, v.y, q.x, q.y); if (d < bd) { bd = d; o = q; }
      }
      t.foe = o ? o.id : 0;
    }
    if (!o) {
      // nobody left to beat: stand in front of what they came for
      if (G.dist(v.x, v.y, R.tg.x, R.tg.y + 1) > 1.5) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 1; H.goto(v, R.tg.x, R.tg.y + 1, true); } H.move(v, dt, 1.1); }
      else { v.moving = false; v.act = 'guard'; }
      return true;
    }
    G.War.fightStep(v, t, o, dt, H, null);
    return true;
  }
  // struck in the square: answer the blow, or run (called by war.js)
  Ri.hit = function (o, by) {
    const t = o.task; if (!t) return;
    if (t.type === 'riotguard') { t.foe = by.id; t.scan = 1.2; return; }
    if (t.type !== 'riot') return;
    const pe = P.persona(o); const bold = pe.agg > 0.45 || o.courage > 0.6;
    // the bold hit back with sticks and stones; the others take a blow or two before they break and run
    if (o.hp > 45 && bold) { t.foe = by.id; t.brave = 1; G.Vg.emote(o, 'angry', 2); }
    else if (o.hp > 68 && !t.hits) { t.hits = 1; G.Vg.emote(o, 'angry', 1.6); }
    else { const R = byId(t.r); if (R) R.fled++; o.rioted = G.S.day; G.Vg.fleeFrom(o, by.x, by.y, 9, 'war'); G.Vg.emote(o, 'fear', 2.5); }
  };
  Ri.taskText = function (v, t) {
    if (t.type === 'riotguard') { const R = byId(t.r); return R && R.resp === 'esmagar' ? 'Esmagando o motim' : 'Contendo o motim'; }
    if (t.type !== 'riot') return null;
    const R = byId(t.r); if (!R) return 'No motim';
    if (t.foe) return 'Brigando com a guarda';
    if (R.phase === 'rally') return t.lead ? 'Inflamando a multidão na praça' : `No motim${R.wtxt ? ' ' + R.wtxt : ''}`;
    if (R.phase === 'march') return `Marchando contra ${HIT_NAME[R.tg.kind] || 'o palácio'}`;
    return t.job === 'fire' ? `Pondo fogo n${(HIT_NAME[R.tg.kind] || 'o palácio').replace(/^(a|o) /, '$1 ')}` : t.job === 'loot' ? (t.got ? 'Levando o que pegou' : 'Saqueando') : t.job === 'free' ? 'Subindo no cadafalso' : 'Atirando pedras';
  };
  Ri.active = set => riots().find(r => r.set === (set && set.id !== undefined ? set.id : set)) || null;
  Ri.list = riots;

  // ------------------------------ when the street boils over ------------------------------
  const GK = ['nobreza', 'mercadores', 'sacerdotes', 'militares', 'artesaos', 'povo'];
  Ri.consider = function (f) {
    const S = G.S; const g = f.grp; if (!g || !f.alive || f.rev || f.coup) return;
    if (S.day - (f.riotDay === undefined ? -99 : f.riotDay) < 5) return;
    if (f.gov === 'anarquia') return;
    const pop = G.Fac.pop(f.id); if (pop < 14) return;
    const pol = f.pol || {}; const recent = (k, d) => pol[k] && S.day - pol[k].day < d;
    const povo = g.povo && g.povo.n ? g.povo.sat : 50, art = g.artesaos && g.artesaos.n ? g.artesaos.sat : 50, mer = g.mercadores && g.mercadores.n ? g.mercadores.sat : 50;
    let why = '', heat = 0;
    if (f.stock.food < pop * 0.35 && povo < 40) { why = 'fome'; heat = (40 - povo) / 40 + 0.3; }
    else if (recent('estatizou', 5) && (mer < 30 || povo < 38)) { why = 'estatizar'; heat = (35 - Math.min(mer, povo + 5)) / 35 + 0.2; }
    else if ((recent('impostos', 6) && (f.taxMod || 0) > 0.04 || (f.taxMod || 0) >= 0.1) && Math.min(povo, art) < 34) { why = 'impostos'; heat = (34 - Math.min(povo, art)) / 34 + 0.1; }
    else if (GK.some(k => g[k] && g[k].refused && S.day - g[k].refused < 3) && f.exec && povo < 36) { why = 'recusa'; heat = (36 - povo) / 36; }
    else if (P.tyr(f) && povo < 26) { why = 'tirania'; heat = (26 - povo) / 26; }
    if (!why) return;
    const p = Math.max(0, heat) * 0.35 - (f.terror || 0) / 300;
    if (G.R() > p) return;
    // the biggest town of the realm with enough people
    let set = null; for (const s of G.Fac.settlementsOf(f.id)) { const n = [...S.villagers.values()].filter(v => v.set === s.id).length; if (n >= 14 && (!set || n > set._n)) { set = s; set._n = n; } }
    if (!set) return;
    const lead = (why === 'estatizar' ? g.mercadores : g.povo) || {};
    Ri.start(f, set, why, { lead: lead.lead });
  };

  // ------------------------------ the loop ------------------------------
  Ri.update = function (dt) {
    const S = G.S; if (!S) return;
    for (const R of riots().slice()) { try { tick(R, dt); } catch (err) { console.warn('riot', err); end(R, 'gone'); } }
  };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.riots = G.S.riots || []; },
    load(o) { G.S.riots = o.riots || []; },
  });

  // ------------------------------ drawing: the torches light the square at night ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const glowE = { fn: drawGlow };
  function drawGlow(c, o, sx, sy, t, nightF) {
    if (nightF < 0.15) return;
    const img = G.Art.glow && G.Art.glow('warm'); if (!img) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(0.55, nightF * 0.6) * (0.85 + Math.sin(t * 9 + o.k) * 0.15);
    c.drawImage(img, sx - 18, sy - 34, 36, 36); c.restore();
  }
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S || !S.riots || !S.riots.length || zoom < 0.5) return;
    for (const R of S.riots) for (const id of R.ids) {
      const v = S.villagers.get(id); if (!v || !v.task || v.task.type !== 'riot' || !v.task.torch) continue;
      add(v.x + v.y + 0.06, { fn: drawGlow, k: id }, v.x, v.y);
    }
    void glowE;
  });
})(window.G);
