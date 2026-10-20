'use strict';
// ============================================================
//  Além: the god's hand on the dead.
//  Ressurreição — touch a body still on the ground or a grave
//  of the last few years, and choose who stands up: the same
//  person (the same name, the same family, the life already
//  written), back among their own — a widow takes back her
//  husband; one who married again has some explaining to do.
//  Fantasmas — touch a cemetery: for two nights its dead walk
//  among the houses. The living are afraid, the families weep,
//  the devout pray — and the dead know what the living hide: a
//  ghost stops at the door of a thief nobody caught, or comes
//  looking for the one who killed it.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers, V = G.Village;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => V.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const bio = (v, third, first) => G.Life && G.Life.bio(v, 'note', third, first);

  G.POWER_TABS.push({ id: 'alem', name: 'Além' });
  const BEYOND = [
    { id: 'resurrect', tab: 'alem', name: 'Ressurreição', cost: 90, r: 1.5, good: true, choose: true, desc: 'Toque um corpo ainda no chão ou um cemitério e escolha quem volta: alguém que morreu há poucos anos se levanta — o mesmo nome, a mesma família. A viúva recebe o marido de volta; quem já casou de novo vai ter de se explicar.' },
    { id: 'ghosts', tab: 'alem', name: 'Fantasmas', cost: 35, r: 1.5, good: null, desc: 'Toque um cemitério: por duas noites os mortos dali andam entre as casas. O povo treme, as famílias choram — e os mortos sabem o que os vivos escondem: um ladrão nunca pego, quem os matou.' },
  ];
  for (const p of BEYOND) G.POWERS.push(p);
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });
  const IS = {}; for (const p of BEYOND) IS[p.id] = 1;

  // (made only by the world's step: a check or a drawing reads G.S.beyond and never creates it)
  function st() { const S = G.S; if (!S.beyond) S.beyond = { haunts: [], raised: 0 }; return S.beyond; }
  const RECENT = 6; // years a grave keeps someone who can still come back
  const MAX_GHOSTS = 6;

  // ------------------------------ who can come back ------------------------------
  const cemAt = (x, y) => { let best = null, bd = 3 * 3; for (const b of G.S.buildings.values()) { if (b.type !== 'cemetery') continue; const [cx, cy] = V.center(b); const d = G.dist2(x, y, cx, cy); if (d < bd) { bd = d; best = b; } } return best; };
  function candidates(x, y) {
    const S = G.S; const out = [];
    if (G.Carnage) for (const c of G.Carnage.list()) {
      if (G.dist2(c.x, c.y, x, y) > 2.5 * 2.5 || G.Carnage.stage(c) === 'bones') continue;
      const rec = S.dead.get(c.vid); if (rec && !out.some(o => o.rec === rec)) out.push({ rec, body: c });
    }
    const cem = cemAt(x, y);
    if (cem) for (const id of cem.graves || []) { const rec = S.dead.get(id); if (rec && S.day - (rec.died || 0) <= RECENT && !out.some(o => o.rec === rec)) out.push({ rec, cem }); }
    return out.sort((a, b) => (b.rec.died || 0) - (a.rec.died || 0) || a.rec.id - b.rec.id).slice(0, 9);
  }
  // their home: a town of their own people they can walk to, or the nearest town that will have them
  function homeFor(rec, x, y) {
    const S = G.S; let best = null, bd = 1e18, other = null, od = 1e18;
    for (const s of S.settlements.values()) {
      const f = G.Fac.get(s.fac); if (!f || f.alive === false) continue;
      if (!W.reachesTownXY(x, y, s)) continue;
      const d = G.dist2(x, y, s.cx, s.cy);
      if (s.fac === rec.fac) { if (d < bd) { bd = d; best = s; } } else if (d < od && d < 40 * 40) { od = d; other = s; }
    }
    return best || other;
  }
  // where they stand up: on their body, or at the cemetery
  function standAt(c, x, y) {
    if (c.body) return [c.body.x, c.body.y];
    if (c.cem) { const p = V.frontTile(c.cem); if (p) return p; }
    return [x, y];
  }
  const ago = n => (n < 1 ? 'há poucos dias' : n < 2 ? 'há um ano' : `há ${Math.floor(n)} anos`);

  // ------------------------------ checks & choices ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (!IS[p.id]) return prevCheck ? prevCheck(p, x, y) : true;
    const S = G.S; const b = S.beyond;
    if (p.id === 'resurrect') {
      const c = candidates(x, y);
      if (!c.length) { P.why = `Toque um corpo ainda no chão ou um cemitério de quem morreu há até ${RECENT} anos.`; return false; }
      if (!c.some(o => { const [px, py] = standAt(o, x, y); return homeFor(o.rec, px, py); })) { P.why = 'Não há cidade aonde quem voltasse pudesse chegar a pé.'; return false; }
    }
    if (p.id === 'ghosts') {
      const cem = cemAt(x, y);
      if (!cem) { P.why = 'Toque um cemitério.'; return false; }
      if (!(cem.graves || []).some(id => S.dead.has(id))) { P.why = 'Ninguém repousa neste cemitério.'; return false; }
      if (b && b.haunts.some(h => h.cem === cem.id)) { P.why = 'Os mortos daqui já andam.'; return false; }
    }
    return true;
  };
  const prevOptions = P.options;
  P.options = function (id, x, y) {
    if (!IS[id]) return prevOptions ? prevOptions(id, x, y) : [];
    if (id !== 'resurrect') return [];
    const S = G.S;
    return candidates(x, y).filter(o => { const [px, py] = standAt(o, x, y); return homeFor(o.rec, px, py); }).map(o => {
      const r = o.rec; const p = S.villagers.get(r.partner);
      const fam = p ? (p.partner ? ` ${p.name}, que ficou viúv${oa(p)}, já se casou de novo.` : ` ${p.name} ainda chora por ${r.g === 'f' ? 'ela' : 'ele'}.`) : '';
      return { k: String(r.id), name: `${r.name} (${Math.floor(r.age)} anos)`, desc: `${G.cap(V.deathText(r))}, ${ago(S.day - (r.died || 0))}${o.body ? ' — o corpo ainda está aqui' : ''}.${fam}` };
    });
  };
  const prevTitle = P.optionsTitle;
  P.optionsTitle = function (id, x, y) {
    if (!IS[id]) return prevTitle ? prevTitle(id, x, y) : '';
    return 'Quem volta dos mortos?';
  };

  // ------------------------------ Ressurreição ------------------------------
  P.resurrect = function (x, y, k) {
    const S = G.S; const p = P.byId('resurrect');
    const c = candidates(x, y).find(o => o.rec.id === +k);
    const [px, py] = c ? standAt(c, x, y) : [x, y];
    const set = c && homeFor(c.rec, px, py);
    if (!c || !set) { S.faith = Math.min(999, S.faith + p.cost); G.UI && G.UI.notice('Ninguém se levantou. A fé foi devolvida.', 'grave'); return; }
    const r = c.rec; const f = G.Fac.get(set.fac);
    // out of the registry of the dead and out of the grave (or off the ground), and back with the same name and face
    S.dead.delete(r.id);
    if (r.grave) V.unbury(r);
    if (c.body) G.Carnage.raise(c.body);
    const look = c.body ? c.body.look : {};
    const v = G.Vg.create({ id: r.id, back: true, name: r.name, g: r.g, age: Math.max(1, r.age), set: set.id, x: px, y: py, mother: r.mother, father: r.father, traits: (r.traits || []).slice(), civ: f && f.civ, skin: r.skin || look.skin, hair: r.hair || look.hair });
    v.born = r.born; v.kids = (r.kids || []).filter(id => G.person(id));
    for (const key of ['ord', 'ep', 'reigned', 'kills', 'hero', 'lost']) if (r[key] !== undefined) v[key] = r[key];
    if (r.bio) v.bio = r.bio.slice();
    v.hunger = 20; v.energy = 80; v.devotion = 100; v.fear = 30;
    // the one left behind: a widow takes her husband back; one who married again does not
    const mate = S.villagers.get(r.partner); let news = '';
    if (mate && !mate.partner) { mate.partner = v.id; v.partner = mate.id; mate.widow = 0; mate.mourn = 0; G.Vg.emote(mate, 'heart', 4); news = ` ${mate.name} correu para os seus braços.`; bio(mate, `Viu ${v.name} voltar dos mortos e recebeu-${v.g === 'f' ? 'a' : 'o'} de volta`, `Meu amor voltou dos mortos`); }
    else if (mate) { G.Vg.emote(mate, 'fear', 3); const nw = S.villagers.get(mate.partner); news = ` Mas ${mate.name} já vive com ${nw ? nw.name : 'outra pessoa'}.`; bio(v, `Voltou dos mortos e encontrou ${mate.name} casad${oa(mate)} com outr${nw && nw.g === 'f' ? 'a' : 'o'}`, null); }
    // the family stops mourning; whoever saw it will never forget
    for (const o of S.villagers.values()) {
      const kin = o.mother === v.id || o.father === v.id || v.mother === o.id || v.father === o.id || (v.mother && o.mother === v.mother && o !== v);
      if (!kin) continue;
      o.mourn = 0; o.devotion = Math.min(100, o.devotion + 30); G.Vg.emote(o, 'awe', 3);
    }
    bio(v, `Voltou dos mortos no ano ${S.day}, ${ago(S.day - (r.died || 0))} depois de morrer`, `Morri e voltei: os céus me devolveram`);
    st().raised++;
    if (G.FX) { G.FX.heal(px, py, 1.6); G.FX.sparkle(px, py); G.FX.floater(px, py, `${v.name} voltou!`, '#fff1c4', 2.8); }
    G.Audio && G.Audio.play('milestone');
    P.witness(px, py, 22, 18, 10);
    log(`${v.name} voltou dos mortos ${c.body ? 'e se levantou do chão onde caiu' : 'e saiu da cova no cemitério'}${set.name ? ' de ' + set.name : ''}!${news}`, 'rise', px, py);
    G.Lore && G.Lore.legend('raised:' + v.id + ':' + S.day, `${v.name}, ${v.g === 'f' ? 'a que voltou' : 'o que voltou'}`, `No ano ${S.day}, ${v.name} ${V.deathText(r).replace(/ aos \d+ anos$/, '')} — e os céus ${v.g === 'f' ? 'a' : 'o'} devolveram aos vivos em ${set.name}.`, { kind: 'milagre' });
    G.Lore && G.Lore.note('resurrect', { id: v.id, name: v.name, set: set.id });
    // (and a ghost of someone alive again is no ghost)
    const B = S.beyond; if (B) for (const h of B.haunts) h.ghosts = h.ghosts.filter(g => g.vid !== v.id);
  };

  // ------------------------------ Fantasmas ------------------------------
  P.ghosts = function (x, y) {
    const S = G.S; const cem = cemAt(x, y); if (!cem) return;
    const [cx, cy] = V.center(cem);
    const ids = (cem.graves || []).filter(id => S.dead.has(id)).slice(-MAX_GHOSTS);
    const h = { id: S.nextId++, cem: cem.id, set: cem.set, x: cx, y: cy, until: S.day + 2, tick: 0, told: [], who: [], seen: 0, fled: 0, ghosts: [] };
    for (const id of ids) { const r = S.dead.get(id); h.ghosts.push({ id: S.nextId++, vid: id, name: r.name, x: cx + G.rr(-0.8, 0.8), y: cy + G.rr(-0.8, 0.8), tx: cx, ty: cy, goal: 0 }); }
    st().haunts.push(h);
    G.FX && G.FX.ring(cx, cy, 0.3, 3, 1.6, 'rgba(190,220,255,0.8)', 2, true);
    G.Audio && G.Audio.play('howl');
    P.witness(cx, cy, 16, 3, 10);
    const s = S.settlements.get(cem.set);
    log(`Os mortos do cemitério${s ? ' de ' + s.name : ''} se levantaram: ${G.isNight() ? 'nesta noite' : 'quando a noite cair'}, vultos pálidos vão andar entre as casas.`, 'ghost', cx, cy);
    G.Lore && G.Lore.note('ghosts', { set: cem.set });
  };
  // what a ghost knows: a theft nobody paid for in its town, or the living hand that killed it
  function secretFor(h, g) {
    const S = G.S; const r = S.dead.get(g.vid);
    const killer = r && r.by && S.villagers.get(r.by);
    if (killer && !h.told.includes('k' + killer.id) && G.dist(killer.x, killer.y, h.x, h.y) < 40) return { k: 'killer', id: killer.id };
    const c = (S.crimes || []).find(q => q.st === 'aberto' && q.set === h.set && !h.told.includes('c' + q.id) && S.villagers.has(q.thief));
    if (c) return { k: 'theft', id: c.id };
    return null;
  }
  function goalOf(h, g) {
    const S = G.S;
    if (g.secret) {
      if (g.secret.k === 'killer') { const v = S.villagers.get(g.secret.id); if (v) return [v.x, v.y]; }
      if (g.secret.k === 'theft') { const c = (S.crimes || []).find(q => q.id === g.secret.id); const th = c && S.villagers.get(c.thief); const hb = th && th.home && S.buildings.get(th.home); if (hb) return G.Vg.door(hb); if (th) return [th.x, th.y]; }
      g.secret = null;
    }
    const homes = []; for (const b of S.buildings.values()) if (b.set === h.set && b.built && G.BDEF[b.type].housing && G.dist2(b.x, b.y, h.x, h.y) < 14 * 14) homes.push(b);
    if (homes.length && G.R() < 0.6) { const b = homes[Math.floor(G.R() * homes.length)]; return G.Vg.door(b); }
    return W.randomNear(h.x, h.y, 8) || [h.x, h.y];
  }
  function tell(h, g) {
    const S = G.S; const s = S.settlements.get(h.set); const q = g.secret; g.secret = null;
    if (q.k === 'killer') {
      const v = S.villagers.get(q.id); if (!v) return;
      h.told.push('k' + v.id);
      v.fear = Math.min(100, v.fear + 45); G.Vg.emote(v, 'fear', 4);
      bio(v, `Foi assombrad${oa(v)} pelo fantasma de ${g.name}, que veio buscá-l${oa(v)} na noite`, `O fantasma de ${g.name} veio me buscar`);
      for (const o of S.villagers.values()) if (o !== v && !o.sleeping && !o.inside && G.dist2(o.x, o.y, v.x, v.y) < 49) { G.Vg.emote(o, 'angry', 2); o.fear = Math.min(100, o.fear + 6); }
      log(`O fantasma de ${g.name} atravessou ${s ? s.name : 'a noite'} até ${v.name} — quem ${g.g === 'f' ? 'a' : 'o'} matou. Todos viram.`, 'ghost', v.x, v.y);
      return;
    }
    const c = (S.crimes || []).find(x => x.id === q.id); if (!c) return;
    h.told.push('c' + c.id);
    const th = S.villagers.get(c.thief);
    const guard = G.Crime && G.Crime.reveal(c);
    if (th) { th.fear = Math.min(100, th.fear + 35); G.Vg.emote(th, 'fear', 4); bio(th, `O fantasma de ${g.name} parou à sua porta e apontou para as moedas roubadas`, `Um fantasma parou à minha porta e apontou para as moedas`); }
    log(`O fantasma de ${g.name} parou à porta de ${th ? th.name : 'uma casa'} e apontou: ali estavam as moedas roubadas${guard ? `. ${guard.name} foi atrás do ladrão` : c.st === 'devolvido' ? '. Apavorad' + oa(th) + ', devolveu tudo antes do amanhecer' : ''}.`, 'ghost', g.x, g.y);
  }
  function updateHaunts(dt) {
    const S = G.S; const B = S.beyond; const night = G.isNight() || G.isEvening();
    for (let k = B.haunts.length - 1; k >= 0; k--) {
      const h = B.haunts[k]; const cem = S.buildings.get(h.cem);
      // (a ghost is someone dead: one brought back, or one the registry forgot at the turn of the year, walks no more)
      if (h.ghosts.some(g => !S.dead.has(g.vid))) h.ghosts = h.ghosts.filter(g => S.dead.has(g.vid));
      // the dead go back to sleep at the dawn after the second night (or when their resting place is gone)
      if (!cem || cem.type !== 'cemetery' || !h.ghosts.length || (S.day >= h.until && !night)) {
        B.haunts.splice(k, 1);
        const s = S.settlements.get(h.set);
        log(`Os mortos${s ? ' de ' + s.name : ''} voltaram a dormir${h.seen ? `: ${h.seen} ${h.seen > 1 ? 'pessoas' : 'pessoa'} viram fantasmas` : ''}.`, 'ghost', h.x, h.y);
        continue;
      }
      // the ghosts drift: at night through the town, by day back to their graves
      for (const g of h.ghosts) {
        const r = S.dead.get(g.vid); if (r) g.g = r.g;
        if (night) { if (G.dist2(g.x, g.y, g.tx, g.ty) < 0.36) { if (g.secret && G.dist2(g.x, g.y, g.tx, g.ty) < 0.36) tell(h, g); if (!g.secret && G.R() < 0.25) g.secret = secretFor(h, g); [g.tx, g.ty] = goalOf(h, g); } else if (g.secret) [g.tx, g.ty] = goalOf(h, g); }
        else { g.tx = h.x; g.ty = h.y; }
        const dx = g.tx - g.x, dy = g.ty - g.y, d = Math.hypot(dx, dy);
        if (d > 0.01) { const sp = Math.min(d, dt * (g.secret ? 0.8 : 0.5)); g.x += dx / d * sp; g.y += dy / d * sp; }
      }
      if (!night) continue;
      h.tick -= dt; if (h.tick > 0) continue; h.tick = 1;
      // who sees them: the living outside, awake, close by
      for (const v of S.villagers.values()) {
        if (v.sleeping || v.inside || v.aboard || v.ug || v.captive || v.jail || v.held || v.air || v.age < 4) continue;
        if (G.dist2(v.x, v.y, h.x, h.y) > 24 * 24) continue;
        let g = null; for (const q of h.ghosts) if (G.dist2(v.x, v.y, q.x, q.y) < 3.5 * 3.5) { g = q; break; }
        if (!g) continue;
        if (!h.who.includes(v.id)) { h.who.push(v.id); h.seen++; }
        const kin = v.partner === g.vid || v.widow === g.vid || v.mother === g.vid || v.father === g.vid || (S.dead.get(g.vid) || {}).mother === v.id || (S.dead.get(g.vid) || {}).father === v.id;
        if (kin) { G.Vg.emote(v, 'sad', 2); v.mourn = Math.max(v.mourn, DAY() * 0.3); if (!h.told.includes('v' + v.id)) { h.told.push('v' + v.id); bio(v, `Viu o fantasma de ${g.name} no meio da noite`, `Vi ${g.name} de novo, pálid${g.g === 'f' ? 'a' : 'o'}, na noite`); } continue; }
        if ((v.traits || []).includes('Devoto')) { v.devotion = Math.min(100, v.devotion + 2); G.Vg.emote(v, 'awe', 1.5); continue; }
        v.fear = Math.min(100, v.fear + 5); G.Vg.emote(v, 'fear', 1.5);
        if (G.R() < 0.3 && !(v.task && (v.task.pri >= 5 || v.task.type === 'scene'))) { G.Vg.H.flee(v, g.x, g.y, 6, 'ghost'); h.fled++; }
      }
    }
  }

  // ------------------------------ update & drawing ------------------------------
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) { if (prevUpd) prevUpd(dt); const B = G.S.beyond; if (B && B.haunts.length) updateHaunts(dt); };
  // (drawn with the glows, after the dark of the night: a ghost is a light of its own)
  const prevGlow = P.drawGlow;
  P.drawGlow = function (ctx, proj, t, nightF) {
    if (prevGlow) prevGlow(ctx, proj, t, nightF);
    const S = G.S; const B = S.beyond; if (!B || !B.haunts.length) return;
    // (they are seen only in the dark: they fade in at dusk and out at dawn)
    const tm = S.time; const a = tm > 0.62 ? G.clamp((tm - 0.62) / 0.1, 0, 1) : tm < 0.06 ? G.clamp((0.06 - tm) / 0.04, 0, 1) : 0;
    if (a <= 0) return;
    for (const h of B.haunts) for (const g of h.ghosts) {
      if (!W.inb(g.x, g.y)) continue;
      const p = proj(g.x, g.y, W.groundH(g.x, g.y));
      const bob = Math.sin(t * 2 + g.id) * 2; const x = p[0], y = p[1] - 14 + bob;
      ctx.globalAlpha = a * 0.55; ctx.drawImage(G.Art.glow('cool'), x - 18, y - 18, 36, 36);
      ctx.globalAlpha = a * (0.6 + 0.15 * Math.sin(t * 3 + g.id));
      ctx.fillStyle = '#e4efff';
      ctx.beginPath(); ctx.moveTo(x - 5, y + 9);
      for (let k = 1; k <= 4; k++) ctx.lineTo(x - 5 + k * 2.5, y + 9 + (k % 2 ? 3 : 0) + Math.sin(t * 6 + k + g.id) * 1.2);
      ctx.quadraticCurveTo(x + 6, y - 1, x + 3.6, y - 6); ctx.arc(x, y - 6, 3.6, 0, Math.PI, true); ctx.quadraticCurveTo(x - 6, y - 1, x - 5, y + 9); ctx.fill();
      ctx.fillStyle = 'rgba(30,40,80,0.85)'; ctx.fillRect(x - 2.1, y - 7, 1.3, 1.8); ctx.fillRect(x + 0.8, y - 7, 1.3, 1.8);
      if (g.secret) { ctx.strokeStyle = 'rgba(228,239,255,0.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 4, y - 1); ctx.lineTo(x + 9, y - 4); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  };

  // ------------------------------ save ------------------------------
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.beyond) out.beyond = G.S.beyond; },
    load(o) {
      const b = o.beyond; const fin = Number.isFinite;
      if (!b || !Array.isArray(b.haunts)) { G.S.beyond = null; return; }
      // (a damaged save loses the damaged ghosts, not the world)
      b.haunts = b.haunts.filter(h => h && fin(h.x) && fin(h.y) && fin(h.until) && Array.isArray(h.ghosts) && Array.isArray(h.told) && Array.isArray(h.who));
      for (const h of b.haunts) { h.ghosts = h.ghosts.filter(g => g && fin(g.x) && fin(g.y) && fin(g.tx) && fin(g.ty) && G.S.dead.has(g.vid)); if (!fin(h.tick)) h.tick = 0; }
      if (!fin(b.raised)) b.raised = 0;
      G.S.beyond = b;
    },
  });
})(window.G);
