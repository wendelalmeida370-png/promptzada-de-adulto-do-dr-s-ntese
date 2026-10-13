'use strict';
// ============================================================
//  Cidade: the god's hand on the life of a town.
//  Chuva de Ouro — coins fall from the sky on a quarter: what
//  hits a roof goes into that house, what hits the street lies
//  there, and the people race for it (a street grown rich draws
//  the thieves of crime.js all by itself).
//  Vinho nos Poços — for half a day the wells of a town give
//  wine: the town drinks, dances, sways home — and pays for it
//  the next morning (the hangover is the tavern's).
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers, E = G.Eco;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const where = (x, y) => G.Village.nearSettlementName(x, y);

  G.POWER_TABS.splice(G.POWER_TABS.findIndex(t => t.id === 'palavra'), 0, { id: 'cidade', name: 'Cidade' });
  const CITY = [
    { id: 'goldrain', tab: 'cidade', name: 'Chuva de Ouro', cost: 40, r: 4, good: true, desc: 'Moedas de ouro caem do céu sobre um bairro: o que cai no telhado fica na casa, o que cai na rua é de quem pegar primeiro. Rua rica atrai ladrão.' },
    { id: 'winewell', tab: 'cidade', name: 'Vinho nos Poços', cost: 28, r: 0, good: true, target: 'set', desc: 'Toque uma cidade: por meio dia os poços dão vinho em vez de água. A cidade larga o trabalho, bebe, dança e cambaleia — e acorda de ressaca.' },
  ];
  for (const p of CITY) G.POWERS.push(p);
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });
  const IS = {}; for (const p of CITY) IS[p.id] = 1;

  // (made only by the world's step: a check or a drawing reads G.S.gifts and never creates it)
  function st() { const S = G.S; if (!S.gifts) S.gifts = { piles: [], rains: [], wine: [], tick: 0 }; return S.gifts; }
  const RAIN_T = 7; // seconds of coins falling
  const PILE_LIFE = () => DAY() * 3; // gold nobody comes for sinks into the dust
  const MAX_PILES = 120;
  const free = v => v.age >= 6 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.wrecked && !v.sleeping && !v.inside && !v.held && !v.air && !(v.task && v.task.pri >= 2);
  const groundOk = i => G.S.type[i] >= T.SAND && W.walkable(i);
  const wellsOf = sid => { const out = []; for (const b of G.S.buildings.values()) if (b.type === 'well' && b.built && b.set === sid) out.push(b); return out; };

  // ------------------------------ checks ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (!IS[p.id]) return prevCheck ? prevCheck(p, x, y) : true;
    const S = G.S; const b = S.gifts; const i = W.idx(x, y);
    if (p.id === 'goldrain') {
      if (S.type[i] < T.SAND) { P.why = 'O ouro precisa cair em terra firme.'; return false; }
      if (b && b.rains.filter(r => !r.from).length >= 2) { P.why = 'Ainda está chovendo ouro.'; return false; }
      if (b && b.piles.length >= MAX_PILES) { P.why = 'Ainda há ouro demais pelo chão.'; return false; }
    }
    if (p.id === 'winewell') {
      const s = P.setAt(x, y, 12); if (!s) { P.why = 'Toque uma cidade ou vila.'; return false; }
      if (!wellsOf(s.id).length) { P.why = `${s.name} não tem nenhum poço.`; return false; }
      if (b && b.wine.some(w => w.set === s.id)) { P.why = `Os poços de ${s.name} já dão vinho.`; return false; }
    }
    return true;
  };

  // ------------------------------ Chuva de Ouro ------------------------------
  P.goldrain = function (x, y) {
    const S = G.S; const B = st();
    const fid = G.Fac.ownerAt(x, y) || (P.setAt(x, y, 16) || {}).fac || 0;
    const s = P.setAt(x, y, 16);
    B.rains.push({ id: S.nextId++, x, y, r: 4, t: 0, acc: 0, drops: 34, fac: fid, set: s ? s.id : 0, houses: 0, street: 0, lost: 0, found: 0, sunk: 0, got: {}, n: 0 });
    G.Audio && G.Audio.play('milestone');
    P.witness(x, y, 16, 6, 0);
    const w = where(x, y);
    log(`Choveu ouro${w ? ' sobre ' + w : ''}! As moedas tilintam nos telhados e o povo larga tudo para catar o ouro das ruas.`, 'gold', x, y);
    G.Lore && G.Lore.note('goldrain', { where: w });
  };
  // one handful of coins: a roof keeps it, a street holds it, the water swallows it
  function drop(rn) {
    const S = G.S; const a = G.R() * 6.283, d = Math.sqrt(G.R()) * rn.r;
    const x = G.clamp(rn.x + Math.cos(a) * d, 0.5, N - 0.5), y = G.clamp(rn.y + Math.sin(a) * d, 0.5, N - 0.5);
    const i = W.idx(x, y); const n = G.R() < 0.12 ? 6 : G.ri(1, 3);
    const b = S.occ[i] && S.buildings.get(S.occ[i]);
    const bf = b && G.Fac.ofSet(b.set);
    if (b && b.built && G.BDEF[b.type].housing && bf && E.coinage(bf.id)) {
      b.coin = (b.coin || 0) + n; rn.houses += n;
      G.FX && G.FX.sparkle(x, y);
      return;
    }
    let tx = Math.floor(x), ty = Math.floor(y), ok = groundOk(i);
    // (a coin that hits a wall or a roof of no house rolls off to the street beside it)
    for (let k = 0; !ok && k < 8; k++) { const nx = tx + [1, -1, 0, 0, 1, -1, 1, -1][k], ny = ty + [0, 0, 1, -1, 1, 1, -1, -1][k]; if (W.inb(nx, ny) && groundOk(ny * N + nx)) { tx = nx; ty = ny; ok = true; } }
    if (!ok) { rn.lost += n; if (S.type[i] < T.SAND || S.type[i] === T.RIVER) G.FX && G.FX.splash(x, y, 0.2); return; }
    const px = tx + G.rr(0.25, 0.75), py = ty + G.rr(0.25, 0.75);
    // (coins that land on a pile already there make it bigger)
    const near = st().piles.find(q => q.rain === rn.id && G.dist2(q.x, q.y, px, py) < 0.5);
    if (near) near.n += n; else st().piles.push({ id: S.nextId++, x: px, y: py, n, t: S.clock, rain: rn.id, fac: rn.fac, c: 0 });
    rn.street += n;
    G.FX && G.FX.sparkle(px, py);
  }
  // gold that comes down another way — a dragon's hoard where it fell: piles on the ground, and the same race for them
  // (a record like a rain's, so that every coin stays counted: picked, lying, found under a wall, or sunk in the dust)
  P.spillGold = function (x, y, n, fid, from) {
    const S = G.S; const B = st(); const s = P.setAt(x, y, 16);
    const rn = { id: S.nextId++, x, y, r: 2.5, t: RAIN_T, acc: 0, drops: 0, fac: fid || 0, set: s ? s.id : 0, houses: 0, street: 0, lost: 0, found: 0, sunk: 0, got: {}, n: 0, from: from || 'um tesouro' };
    B.rains.push(rn);
    let left = Math.round(n * 100) / 100; const each = Math.max(1, Math.round(n / 16));
    for (let k = 0; left > 0.004 && k < 400; k++) {
      const a = k * 2.39996, d = 0.4 + Math.sqrt(k) * 0.35; const px = G.clamp(x + Math.cos(a) * d, 0.5, N - 0.5), py = G.clamp(y + Math.sin(a) * d, 0.5, N - 0.5);
      if (!groundOk(W.idx(px, py))) continue;
      const m = left - each < 1 ? left : each; left = Math.round((left - m) * 100) / 100;
      B.piles.push({ id: S.nextId++, x: px, y: py, n: m, t: S.clock, rain: rn.id, fac: rn.fac, c: 0 });
      rn.street = Math.round((rn.street + m) * 100) / 100;
    }
    rn.lost = left;
    G.FX && G.FX.sparkle(x, y);
    return rn;
  };
  // who runs for the gold: the closest pair of free hands, each to its own pile
  function rush(B) {
    const S = G.S; const busy = new Set(); const hands = [];
    let x0 = N, y0 = N, x1 = 0, y1 = 0; for (const q of B.piles) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
    for (const v of S.villagers.values()) {
      if (v.task && v.task.type === 'ouro') { busy.add(v.task.id); continue; }
      if (v.x > x0 - 13 && v.x < x1 + 13 && v.y > y0 - 13 && v.y < y1 + 13 && free(v)) hands.push(v);
    }
    if (!hands.length) return;
    for (const q of B.piles) {
      if (busy.has(q.id)) continue;
      let best = null, bd = 13 * 13;
      for (const v of hands) {
        if (v.task && v.task.type === 'ouro') continue;
        const d = G.dist2(v.x, v.y, q.x, q.y); if (d >= bd) continue;
        if (!W.reaches(v, q.x, q.y)) continue;
        bd = d; best = v;
      }
      if (best && G.Vg.give(best, { type: 'ouro', id: q.id, pri: 1.95, st: 0, kind: 'ouro' })) { busy.add(q.id); G.Vg.emote(best, 'happy', 1.4); }
    }
  }
  function runOuro(v, t, dt, H) {
    const S = G.S; const B = S.gifts; const q = B && B.piles.find(p => p.id === t.id);
    if (!q) { if (t.st >= 1) G.Vg.emote(v, 'angry', 1.2); return H.end(v); } // (somebody else got there first)
    if (t.st === 0) { if (!H.goto(v, q.x, q.y, false, 3000)) return H.end(v); t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt, 1.3)) { t.st = 2; v.actT = 0; } else if (t.walk > 40) H.end(v); return; }
    v.act = 'pick'; G.faceTo(v, q.x - v.x, q.y - v.y);
    if (v.actT < 1.4) return;
    B.piles.splice(B.piles.indexOf(q), 1);
    const rn = B.rains.find(r => r.id === q.rain); if (rn) { rn.got[v.id] = (rn.got[v.id] || 0) + q.n; rn.n += q.n; }
    const f = G.Fac.ofV(v);
    const shown = Math.max(1, Math.round(q.n));
    G.FX && G.FX.floater(v.x, v.y, `+${shown} ${shown > 1 ? 'moedas' : 'moeda'}`, '#ffd85a', 1.6);
    if (f && E.coinage(f.id)) {
      const h = E.homeOf(v); if (h) h.coin = (h.coin || 0) + q.n; else v.purse = (v.purse || 0) + q.n;
      G.Vg.emote(v, 'happy', 2); H.end(v);
    } else {
      // (a people without coins brings the gold to the store, for the smith to work)
      G.Vg.emote(v, 'happy', 2);
      v.carry = { k: 'ouro', n: Math.max(0.2, Math.round(q.n / 6 * 10) / 10) };
      H.setTask(v, { type: 'deliver', pri: 1 });
    }
  }
  function endRain(B, rn) {
    B.rains.splice(B.rains.indexOf(rn), 1);
    const S = G.S; const w = where(rn.x, rn.y);
    let lucky = null, ln = 0; for (const id in rn.got) if (rn.got[id] > ln) { ln = rn.got[id]; lucky = S.villagers.get(+id) || S.dead.get(+id); }
    const parts = [];
    if (rn.n) parts.push(`${Math.round(rn.n)} moedas catadas do chão`);
    if (rn.houses) parts.push(`${rn.houses} entraram pelos telhados`);
    log(`Acabou a corrida ${rn.from ? 'pelo tesouro de ' + rn.from : 'do ouro'}${w ? ' em ' + w : ''}${parts.length ? ': ' + parts.join(', ') : ''}.${lucky && ln >= 4 ? ` Quem mais catou foi ${lucky.name}: ${ln} moedas.` : ''}`, 'gold', rn.x, rn.y);
    if (lucky && ln >= 4 && S.villagers.has(lucky.id)) G.Life && G.Life.bio(lucky, 'note', rn.from ? `Catou ${Math.round(ln)} moedas do tesouro de ${rn.from}` : `Catou ${ln} moedas de ouro caídas do céu na Chuva de Ouro${w ? ' de ' + w : ''}`);
    if (w && !rn.from && rn.n + rn.houses >= 30 && G.Lore) G.Lore.legend('goldrain:' + rn.id, `A Chuva de Ouro de ${w}`, `No ano ${S.day}, choveu ouro sobre ${w}. ${rn.houses ? 'Casas acordaram ricas; ' : ''}gente corria pelas ruas com as mãos cheias${lucky && ln >= 4 ? `, e ${lucky.name} juntou ${ln} moedas antes de todos` : ''}.`, { kind: 'milagre' });
  }
  function updateGold(dt) {
    const S = G.S; const B = S.gifts;
    for (let k = B.rains.length - 1; k >= 0; k--) {
      const rn = B.rains[k]; rn.t += dt; rn.acc += dt;
      while (rn.acc >= RAIN_T / 34 && rn.drops > 0) { rn.acc -= RAIN_T / 34; rn.drops--; drop(rn); }
      // (the race is over when the street is bare — or a day later, for what is left lying where nobody goes)
      if (rn.drops <= 0 && rn.t > RAIN_T && (!B.piles.some(q => q.rain === rn.id) || rn.t > DAY())) endRain(B, rn);
    }
    // (every step: a pile is never left where nobody can stand)
    for (let k = B.piles.length - 1; k >= 0; k--) {
      const q = B.piles[k]; const i = W.idx(q.x, q.y); const rn = B.rains.find(r => r.id === q.rain);
      // (gold nobody came for sinks into the dust; gold the sea took over is the sea's)
      if (S.clock - q.t > PILE_LIFE() || S.type[i] < T.SAND) { B.piles.splice(k, 1); if (rn) rn.sunk += q.n; continue; }
      // (a house or a wall rose over the gold: the builders found it, and it goes to the town)
      if (!groundOk(i)) {
        const f = G.Fac.get(G.Fac.ownerAt(q.x, q.y) || q.fac);
        if (f && f.alive !== false) { if (E.coinage(f.id)) f.stock.moedas += q.n; else G.Village.addStock('ouro', q.n / 6, f.id); }
        B.piles.splice(k, 1); if (rn) rn.found += q.n;
      }
    }
    B.tick -= dt; if (B.tick > 0) return; B.tick = 0.5;
    if (B.piles.length) rush(B);
  }

  // ------------------------------ Vinho nos Poços ------------------------------
  P.winewell = function (x, y) {
    const S = G.S; const s = P.setAt(x, y, 12); if (!s) return;
    const B = st(); const wells = wellsOf(s.id);
    B.wine.push({ id: S.nextId++, set: s.id, until: S.clock + DAY() * 0.5, drank: 0, cups: {}, x: s.cx, y: s.cy, tick: 0 });
    for (const w of wells) { const [cx, cy] = G.Village.center(w); G.FX && G.FX.ring(cx, cy, 0.2, 2.2, 1.2, 'rgba(170,40,110,0.85)', 2.2, true); }
    G.Audio && G.Audio.play('fertility');
    P.witness(s.cx, s.cy, 18, 5, 0);
    log(`Os poços de ${s.name} começaram a jorrar vinho! A cidade larga o trabalho para encher as canecas.`, 'wine', s.cx, s.cy);
    G.Lore && G.Lore.note('winewell', { set: s.id, where: s.name });
  };
  function runVinho(v, t, dt, H) {
    const S = G.S; const B = S.gifts; const w = B && B.wine.find(q => q.set === v.set);
    if (t.st === 3) {
      // and then a dance in the square of the well (the wine may dry up, the dance ends when it ends)
      v.act = 'dance'; v.moving = false;
      if (G.R() < dt * 0.3) G.Vg.emote(v, G.R() < 0.7 ? 'happy' : 'chat', 1.2);
      if (v.actT > t.dur) H.end(v);
      return;
    }
    const b = S.buildings.get(t.id);
    if (!w || !b || !b.built || b.set !== v.set) return H.end(v);
    if (t.st === 0) { const d = G.Vg.door(b); if (!H.goto(v, d[0], d[1], false, 3000)) return H.end(v); t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt, 1.1)) { t.st = 2; v.actT = 0; } else if (t.walk > 45) H.end(v); return; }
    const [cx, cy] = G.Village.center(b);
    v.act = 'fill'; G.faceTo(v, cx - v.x, cy - v.y);
    if (v.actT < 2.2) return;
    // two cups at the well: drunk for a good while, and the morning will know it
    v.drinks = (v.drinks || 0) + 2; v.drinkDay = S.day;
    v.drunk = Math.max(v.drunk || 0, S.clock + 50 + v.drinks * 18);
    w.cups[v.id] = (w.cups[v.id] || 0) + 2; w.drank++;
    G.Vg.emote(v, 'happy', 2); t.st = 3; v.actT = 0; t.dur = G.rr(5, 11);
  }
  function endWine(B, w) {
    B.wine.splice(B.wine.indexOf(w), 1);
    const S = G.S; const s = S.settlements.get(w.set);
    // (whoever was still on the way finds water in the well: they go back to what they were doing)
    for (const v of S.villagers.values()) if (v.task && v.task.type === 'vinho' && v.task.st < 3 && v.set === w.set) G.Vg.endTask(v);
    let top = null, tn = 0; for (const id in w.cups) if (w.cups[id] > tn) { tn = w.cups[id]; top = S.villagers.get(+id); }
    const people = Object.keys(w.cups).length;
    if (s) log(`O vinho secou nos poços de ${s.name}${people ? `: ${people} ${people > 1 ? 'pessoas beberam' : 'pessoa bebeu'} até cambalear` : ''}. ${people ? 'Amanhã muita cabeça vai doer.' : 'Ninguém teve coragem de provar.'}`, 'wine', w.x, w.y);
    if (top && tn >= 6) G.Life && G.Life.bio(top, 'note', `Bebeu ${tn / 2} vezes nos poços de vinho de ${s ? s.name : 'sua cidade'} e foi carregad${top.g === 'f' ? 'a' : 'o'} para casa`);
  }
  function updateWine(dt) {
    const S = G.S; const B = S.gifts;
    for (let k = B.wine.length - 1; k >= 0; k--) {
      const w = B.wine[k]; const s = S.settlements.get(w.set);
      const wells = s ? wellsOf(s.id) : [];
      if (!s || !wells.length || S.clock >= w.until) { endWine(B, w); continue; }
      w.tick -= dt; if (w.tick > 0) continue; w.tick = 1;
      // a few at a time leave what they were doing (and nobody drinks a fifth time)
      for (const v of S.villagers.values()) {
        if (v.set !== s.id || v.age < 14 || !free(v) || (v.drinks || 0) >= 6) continue;
        if (v.task && (v.task.type === 'vinho' || v.task.type === 'ouro')) continue;
        if (G.R() > 0.07) continue;
        let well = null, bd = 1e9; for (const b of wells) { const d = G.dist2(v.x, v.y, b.x, b.y); if (d < bd) { bd = d; well = b; } }
        if (well && bd < 30 * 30 && W.reaches(v, well.x + 0.5, well.y + 0.5)) G.Vg.give(v, { type: 'vinho', id: well.id, pri: 1.5, st: 0, kind: 'vinho' });
      }
    }
  }

  // ------------------------------ tasks ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'ouro') return runOuro(v, t, dt, H), true;
    if (t.type === 'vinho') return runVinho(v, t, dt, H), true;
    return oldRun(v, t, dt, H);
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'ouro') return t.st < 2 ? 'Correndo para catar o ouro caído do céu!' : 'Catando moedas de ouro do chão';
    if (t.type === 'vinho') return t.st < 2 ? 'Indo beber vinho no poço!' : t.st === 2 ? 'Enchendo a caneca de vinho no poço' : 'Dançando bêbado na praça do poço';
    return oldText(v, t);
  };

  // ------------------------------ update ------------------------------
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) {
    if (prevUpd) prevUpd(dt);
    const B = G.S.gifts; if (!B) return;
    if (B.rains.length || B.piles.length) updateGold(dt);
    if (B.wine.length) updateWine(dt);
  };

  // ------------------------------ drawing ------------------------------
  const prevDG = P.drawGround;
  P.drawGround = function (ctx, proj, t) {
    if (prevDG) prevDG(ctx, proj, t);
    const B = G.S.gifts; if (!B || !B.piles.length) return;
    const V = G.Render.tileView;
    for (const q of B.piles) {
      if (V && (q.x < V[0] || q.y < V[1] || q.x > V[2] + 1 || q.y > V[3] + 1)) continue;
      const p = proj(q.x, q.y, W.groundH(q.x, q.y)); const s = Math.min(1.6, 0.7 + q.n * 0.12);
      ctx.fillStyle = 'rgba(60,40,10,0.25)'; ctx.beginPath(); ctx.ellipse(p[0], p[1] + 1, 6 * s, 3 * s, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#b8861e'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 5 * s, 2.6 * s, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(p[0], p[1] - 1.2 * s, 3.6 * s, 2 * s, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.ellipse(p[0] - 1 * s, p[1] - 2 * s, 1.4 * s, 0.8 * s, 0, 0, 6.283); ctx.fill();
      // a glint now and then
      const g = (t * 0.7 + G.hash(q.id)) % 1; if (g < 0.12) { const a = 1 - g / 0.12; ctx.fillStyle = `rgba(255,255,230,${a})`; ctx.fillRect(p[0] + 1.5 * s - 0.5, p[1] - 5 * s, 1, 5); ctx.fillRect(p[0] + 1.5 * s - 2.5, p[1] - 3 * s, 5, 1); }
    }
  };
  const prevDW = P.drawWorld;
  P.drawWorld = function (ctx, proj, t) {
    if (prevDW) prevDW(ctx, proj, t);
    const S = G.S; const B = S.gifts; if (!B) return;
    // the coins falling: each one on its own line from the sky, spinning as it falls
    for (const rn of B.rains) {
      if (rn.t > RAIN_T + 1.5) continue;
      const fade = G.clamp((RAIN_T + 1.5 - rn.t) / 1.5, 0, 1);
      for (let j = 0; j < 90; j++) {
        const h1 = G.hash(j * 7 + rn.id), h2 = G.hash(j * 13 + rn.id * 3), h3 = G.hash(j * 31 + 5);
        const ph = (rn.t * (0.55 + h3 * 0.3) + h1) % 1; const a = h2 * 6.283, d = Math.sqrt(h1) * rn.r;
        const x = rn.x + Math.cos(a) * d, y = rn.y + Math.sin(a) * d; if (!W.inb(x, y)) continue;
        const p = proj(x, y, W.groundH(x, y)); const z = (1 - ph) * 150;
        const spin = Math.abs(Math.cos(t * 9 + j)); ctx.globalAlpha = fade * G.clamp(ph * 6, 0, 1);
        ctx.fillStyle = spin > 0.5 ? '#ffd84a' : '#c8962a'; ctx.beginPath(); ctx.ellipse(p[0], p[1] - z, 2.2 * spin + 0.4, 2.2, 0, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // wine leaping from the wells: a purple fountain over each one
    for (const w of B.wine) {
      for (const b of S.buildings.values()) {
        if (b.type !== 'well' || !b.built || b.set !== w.set) continue;
        const [cx, cy] = G.Village.center(b); const p = proj(cx, cy, W.groundH(cx, cy));
        for (let j = 0; j < 14; j++) {
          const ph = (t * 0.9 + G.hash(j * 17 + b.id)) % 1; const a = G.hash(j * 5 + b.id) * 6.283;
          const dx = Math.cos(a) * 12 * ph, dy = Math.sin(a) * 6 * ph, z = 26 * Math.sin(ph * Math.PI) + 10 * (1 - ph);
          ctx.fillStyle = j % 3 ? 'rgba(150,20,80,0.9)' : 'rgba(210,70,130,0.9)';
          ctx.beginPath(); ctx.arc(p[0] + dx, p[1] - 12 + dy - z, 1.7, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = 'rgba(120,10,60,0.35)'; ctx.beginPath(); ctx.ellipse(p[0], p[1] + 2, 14, 7, 0, 0, 6.283); ctx.fill();
      }
    }
  };

  // ------------------------------ save ------------------------------
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.gifts) out.gifts = G.S.gifts; },
    load(o) {
      const b = o.gifts; const fin = Number.isFinite;
      if (!b || !Array.isArray(b.piles) || !Array.isArray(b.rains) || !Array.isArray(b.wine)) { G.S.gifts = null; return; }
      // (a damaged save loses the damaged gold, not the world)
      b.piles = b.piles.filter(q => q && fin(q.x) && fin(q.y) && q.n > 0 && fin(q.t) && W.inb(q.x, q.y));
      b.rains = b.rains.filter(r => r && fin(r.x) && fin(r.y) && fin(r.t) && r.got && typeof r.got === 'object');
      b.wine = b.wine.filter(w => w && fin(w.until) && G.S.settlements.has(w.set) && w.cups && typeof w.cups === 'object');
      if (!fin(b.tick)) b.tick = 0;
      G.S.gifts = b;
    },
  });
})(window.G);
