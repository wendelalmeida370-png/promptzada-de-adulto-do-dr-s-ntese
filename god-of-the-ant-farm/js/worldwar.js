'use strict';
// ============================================================
//  The world war. Rare: only a full world — four great peoples
//  or more who know each other — with grudges piled up can fall
//  into it, and never twice in a short while. A gold rush, a
//  crown with two claimants, a war of the gods, a murdered envoy,
//  years of hunger, an empire grown too big (and everyone else
//  against it), or plain old hatred (everyone against everyone).
//  The blocs close ranks — old enemies become allies — and war
//  is declared across them all at once; no one makes a separate
//  peace for a while. It ends when a bloc falls, or when the world
//  can bear no more.
// ============================================================
(function (G) {
  const WW = G.WorldWar = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const REASONS = {
    ouro: { name: 'a Guerra do Ouro', why: 'o ouro achado nas montanhas: todos querem os veios' },
    coroa: { name: 'a Guerra da Coroa', why: 'uma coroa com dois herdeiros: cada aliança jura pelo seu' },
    fe: { name: 'a Guerra dos Deuses', why: 'uma profecia lida de dois jeitos: cada povo diz que o deus está do seu lado' },
    sangue: { name: 'a Guerra do Sangue', why: 'um emissário assassinado num banquete: a vingança arrastou os aliados de todos' },
    fome: { name: 'a Guerra da Fome', why: 'anos de colheitas ruins: os celeiros dos outros viraram o único caminho' },
    imperio: { name: 'a Grande Coalizão', why: 'um império grande demais: os outros povos se uniram contra ele' },
    caos: { name: 'a Guerra de Todos', why: 'rancores velhos demais: cada povo contra todos os outros' },
  };
  WW.REASONS = REASONS;
  WW.active = () => (G.S && G.S.worldWar && !G.S.worldWar.end ? G.S.worldWar : null);
  WW.sideOf = fid => { const w = WW.active(); return w ? w.blocs.findIndex(b => b.includes(fid)) : -1; };
  // no separate peace across the blocs while the world war is young
  WW.locks = (a, b) => { const w = WW.active(); if (!w) return false; const sa = WW.sideOf(a), sb = WW.sideOf(b); return sa >= 0 && sb >= 0 && sa !== sb && G.S.day - w.start < w.minDays; };
  WW.sameBloc = (a, b) => { const w = WW.active(); if (!w || w.reason === 'caos') return false; const sa = WW.sideOf(a); return sa >= 0 && sa === WW.sideOf(b); };

  const big = () => G.Fac.all().filter(f => G.Fac.pop(f.id) >= 12);
  function tension(fs) {
    let pairs = 0, wars = 0, grudge = 0, met = 0;
    for (const a of fs) for (const b of fs) {
      if (a.id >= b.id) continue; pairs++;
      const r = G.Fac.rel(a.id, b.id); if (!r || !r.met) continue; met++;
      if (r.st === 'guerra') wars++; grudge += (r.grudge || 0) + Math.max(0, -(r.op || 0)) * 0.5;
    }
    return { pairs, met, wars, grudge: grudge / Math.max(1, met) };
  }
  // the daily roll: tiny, and only when the world is ready for it
  WW.daily = function () {
    const S = G.S; if (!S || WW.active() || S.divinePeace > 0 || S.day < 30) return;
    if (S.worldWar && S.day - S.worldWar.end < 80) return;
    const fs = big(); if (fs.length < 4) return;
    const t = tension(fs); if (t.met < t.pairs * 0.8) return; // they must know each other: a world, not islands
    let p = 0.0008 + (t.wars / t.pairs) * 0.008 + Math.min(0.003, t.grudge / 10000);
    if (S.temper === 'belicoso') p *= 1.8; else if (S.temper === 'pacifico') p *= 0.4;
    if (G.R() < p) WW.start();
  };

  WW.start = function (forced) {
    const S = G.S; if (big().length < (forced ? 3 : 4)) return null;
    // every people takes a side, the small ones too
    const fs = G.Fac.all().filter(f => G.Fac.pop(f.id) >= 4);
    const str = new Map(fs.map(f => [f.id, G.Politics.strength(f.id)])); const total = [...str.values()].reduce((a, b) => a + b, 0);
    const top = fs.slice().sort((a, b) => str.get(b.id) - str.get(a.id))[0];
    let reason, blocs;
    if (forced && REASONS[forced]) reason = forced;
    else if (str.get(top.id) > total * 0.38) reason = 'imperio';
    else { const r = G.R(); reason = r < 0.12 ? 'caos' : r < 0.32 ? 'ouro' : r < 0.5 ? 'coroa' : r < 0.66 ? 'fe' : r < 0.84 ? 'sangue' : 'fome'; }
    if (reason === 'caos') blocs = fs.map(f => [f.id]);
    else if (reason === 'imperio') {
      // the hegemon and whoever is bound to it, against the rest
      const side = [top.id]; for (const f of fs) { if (f === top) continue; const r = G.Fac.rel(f.id, top.id); if (r && (r.st === 'vassalo' && r.over === top.id || r.st === 'alianca' && r.op > 30)) side.push(f.id); }
      blocs = [side, fs.filter(f => !side.includes(f.id)).map(f => f.id)];
      if (!blocs[1].length) return null;
    } else {
      // two leaders: the strong pair that hates each other most; everyone else takes the side it likes better
      let la = null, lb = null, worst = 1e9;
      for (const a of fs) for (const b of fs) { if (a.id >= b.id) continue; const r = G.Fac.rel(a.id, b.id); if (!r) continue; const sc = (r.op || 0) - (r.grudge || 0) - (r.st === 'guerra' ? 40 : 0) - (str.get(a.id) + str.get(b.id)) / Math.max(1, total) * 60; if (sc < worst) { worst = sc; la = a; lb = b; } }
      if (!la) return null;
      blocs = [[la.id], [lb.id]]; const pw = [str.get(la.id) || 0, str.get(lb.id) || 0];
      // the strongest choose first; a people sides with the one it likes, but the weaker side finds friends more easily
      for (const f of fs.filter(f => f !== la && f !== lb).sort((a, b) => (str.get(b.id) || 0) - (str.get(a.id) || 0))) {
        const ra = G.Fac.rel(f.id, la.id), rb = G.Fac.rel(f.id, lb.id);
        const sa = (ra ? ra.op + (ra.st === 'alianca' ? 60 : 0) - (ra.st === 'guerra' ? 60 : 0) : 0) - pw[0] / Math.max(1, total) * 90;
        const sb = (rb ? rb.op + (rb.st === 'alianca' ? 60 : 0) - (rb.st === 'guerra' ? 60 : 0) : 0) - pw[1] / Math.max(1, total) * 90;
        const k = sa >= sb ? 0 : 1; blocs[k].push(f.id); pw[k] += str.get(f.id) || 0;
      }
    }
    const R = REASONS[reason];
    const w = S.worldWar = { start: S.day, reason, name: R.name, blocs, dead0: S.stats.warDeaths || 0, conq0: S.stats.conquests || 0, minDays: 18 + Math.floor(G.R() * 10), end: 0, n: (S.worldWar && S.worldWar.n || 0) + 1 };
    // old enemies close ranks
    if (reason !== 'caos') for (const b of blocs) for (const x of b) for (const y of b) {
      if (x >= y) continue; const r = G.Fac.rel(x, y); if (!r) continue;
      if (r.st === 'guerra') G.War && G.War.onPeace(G.Fac.get(x), G.Fac.get(y));
      r.st = 'alianca'; r.since = S.day; r.op = Math.max(r.op, 40); r.envoy = 0; r.met = r.met || S.day;
    }
    // and war across them all, at once
    for (let i = 0; i < blocs.length; i++) for (let j = i + 1; j < blocs.length; j++) for (const x of blocs[i]) for (const y of blocs[j]) {
      const r = G.Fac.rel(x, y); if (!r) continue; const a = G.Fac.get(x), b = G.Fac.get(y);
      if (r.st !== 'guerra') { r.st = 'guerra'; r.since = S.day; r.by = x; r.truce = 0; r.envoy = 0; r.op = Math.min(r.op, -30); r.met = r.met || S.day; S.stats.wars = (S.stats.wars || 0) + 1; G.War && G.War.onWar(a, b); }
    }
    for (const f of fs) { f.attackCD = Math.min(f.attackCD || 0, G.rr(10, 45)); f.weariness = Math.max(0, (f.weariness || 0) - 20); }
    const names = b => b.map(id => G.Fac.get(id).name).join(', ');
    const sides = reason === 'caos' ? 'cada povo contra todos os outros' : `${names(blocs[0])} contra ${names(blocs[1])}`;
    log(`Começou ${R.name}: a guerra que engole o mundo. Por quê? ${G.cap(R.why)}. De um lado e do outro: ${sides}.`, 'war');
    G.UI && G.UI.toast(G.cap(R.name), `A guerra mundial começou: ${sides}.`, 'war');
    G.Village.milestone('worldWar', 'Guerra Mundial', `${G.cap(R.name)}: ${sides}.`, 'war');
    G.Audio && G.Audio.play('horn');
    G.Lore && G.Lore.legend && G.Lore.legend('ww' + w.n + ':' + S.day, G.cap(R.name), `No ano ${S.day} o mundo inteiro pegou em armas — ${R.why}. ${G.cap(sides)}.`, { kind: 'war' });
    return w;
  };

  // the end: a bloc falls, or the world is too tired to go on
  function check() {
    const w = WW.active(); if (!w) return;
    const S = G.S; const days = S.day - w.start;
    const alive = w.blocs.map(b => b.filter(id => { const f = G.Fac.get(id); return f && f.alive; }));
    const standing = alive.filter(b => b.length);
    let winner = null, why = '';
    if (standing.length <= 1) { winner = standing[0] || null; why = 'fall'; }
    else {
      const fs = alive.flat().map(id => G.Fac.get(id));
      const tired = fs.reduce((a, f) => a + (f.weariness || 0), 0) / Math.max(1, fs.length);
      if ((days >= w.minDays + 6 && tired > 62) || days > 80) why = 'tired';
    }
    if (!why) return;
    w.end = S.day; w.dead = (S.stats.warDeaths || 0) - w.dead0; w.conq = (S.stats.conquests || 0) - w.conq0;
    // the general peace: every war across the blocs becomes a long truce
    for (let i = 0; i < w.blocs.length; i++) for (let j = i + 1; j < w.blocs.length; j++) for (const x of w.blocs[i]) for (const y of w.blocs[j]) {
      const r = G.Fac.rel(x, y); const a = G.Fac.get(x), b = G.Fac.get(y); if (!r || !a || !b || !a.alive || !b.alive || r.st !== 'guerra') continue;
      r.st = 'tregua'; r.truce = G.DAY_LEN * 6; r.since = S.day; r.envoy = 0; r.grudge = (r.grudge || 0) * 0.6;
      a.weariness *= 0.5; b.weariness *= 0.5; G.War && G.War.onPeace(a, b);
    }
    const names = b => b.map(id => (G.Fac.get(id) || {}).name).filter(Boolean).join(', ');
    const tail = `${w.dead} mortos em combate${w.conq ? `, ${w.conq} ${w.conq === 1 ? 'cidade conquistada' : 'cidades conquistadas'}` : ''}`;
    const txt = why === 'fall' ? (winner ? `Terminou ${w.name} depois de ${days} dias: ${names(winner)} ${winner.length > 1 ? 'venceram' : 'venceu'}. ${G.cap(tail)}.` : `Terminou ${w.name} depois de ${days} dias, sem ninguém de pé para vencer. ${G.cap(tail)}.`)
      : `Terminou ${w.name} depois de ${days} dias: ninguém aguentava mais. A paz geral foi jurada sobre os mortos — ${tail}.`;
    log(txt, 'peace'); G.UI && G.UI.toast('Paz no mundo', txt, 'peace');
    G.Lore && G.Lore.legend && G.Lore.legend('wwEnd' + w.n + ':' + S.day, `O fim d${w.name.startsWith('a ') ? 'a' : 'o'} ${w.name.replace(/^(a|o) /, '')}`, txt, { kind: 'war' });
  }
  let lastDay = -1, tChk = 0;
  WW.update = function (dt) {
    const S = G.S; if (!S) return;
    if (S.day !== lastDay) { lastDay = S.day; WW.daily(); }
    tChk += dt; if (tChk >= 3) { tChk = 0; check(); }
  };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({ save(out) { if (G.S.worldWar) out.worldWar = G.S.worldWar; }, load(o) { G.S.worldWar = o.worldWar || null; } });
  // a line for the realms panel
  WW.summary = function () {
    const w = WW.active(); if (!w) return '';
    const S = G.S; const names = b => b.map(id => { const f = G.Fac.get(id); return f && f.alive ? f.name : null; }).filter(Boolean).join(', ');
    const sides = w.reason === 'caos' ? 'cada povo contra todos' : `${names(w.blocs[0])} <b>×</b> ${names(w.blocs[1])}`;
    return `<div class="ww-box"><b>${G.cap(w.name)}</b> · dia ${S.day - w.start + 1} · ${(S.stats.warDeaths || 0) - w.dead0} mortos<br><small>${REASONS[w.reason].why}</small><br>${sides}</div>`;
  };
})(window.G);
