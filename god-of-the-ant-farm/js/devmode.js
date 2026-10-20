'use strict';
// ============================================================
//  GOD OF THE ANT FARM — the dev mode: the author's workbench
//  F2 (or ?dev in the address, or the pause menu) opens a panel beside the world, which keeps living.
//  Time (speeds, years, hunts until a thing happens, saved moments), peoples (war, peace, coups,
//  riots, festivals, arts), the world war, the sea, the stories (recipes that make the real event
//  happen, seeds, the director), rare things, knobs that multiply the odds of the systems, and a lens
//  on the machine (counters, profiler, swallowed errors, the signals, a bug hunt, raw state).
//  Everything it does goes through the game's own functions: what you see is what the game would do.
// ============================================================
(function (G) {
  const D = G.Dev = {};
  const LS = 'goaf.dev';
  const store = {
    get(k, d) { try { const s = localStorage.getItem(LS + k); return s === null ? d : JSON.parse(s); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { } },
  };
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const live = id => (G.S ? G.S.villagers.get(id) : null);
  const R2 = x => Math.round(x * 100) / 100;
  const fname = f => (f ? f.name : '—');
  const St = () => G.Stories;
  const saga = () => (G.S && G.Stories ? G.Stories.state() : { seeds: [], stories: [] });
  const DAYY = () => G.S.day + G.S.time;

  D.on = false; D.open = false; D.tab = store.get('.tab', 'tempo'); D.side = store.get('.side', 'left');
  D.fa = 0; D.fb = 0; D.course = 'livre'; D.labels = ''; D.prof = false; D.watch = false;
  const errs = []; const sigs = []; const sigN = {}; const snaps = {};

  // ------------------------------ what went wrong, even when it was swallowed ------------------------------
  // (the game catches and warns about its own failures so that the world goes on: here they are kept)
  function short(x) { try { const s = JSON.stringify(x, (k, v) => (v && typeof v === 'object' && v.id !== undefined && k ? '#' + v.id : v)); return s && s.length > 200 ? s.slice(0, 200) + '…' : s; } catch (e) { return String(x); } }
  const fmt = a => [...a].map(x => (x instanceof Error ? x.message + (x.stack ? ' @ ' + (x.stack.split('\n')[1] || '').trim() : '') : typeof x === 'object' ? short(x) : String(x))).join(' ');
  function note(kind, msg) {
    const S = G.S; const m = String(msg).slice(0, 500);
    const last = errs[errs.length - 1];
    if (last && last.m === m) { last.n++; last.d = S ? S.day : 0; return; }
    errs.push({ k: kind, m, d: S ? S.day : 0, h: S ? Math.floor(S.time * 24) : 0, n: 1 });
    if (errs.length > 150) errs.shift();
    D.errNew = (D.errNew || 0) + 1;
  }
  D.note = note;
  const cw = console.warn, ce = console.error;
  console.warn = function () { try { note('aviso', fmt(arguments)); } catch (e) { } return cw.apply(console, arguments); };
  console.error = function () { try { note('erro', fmt(arguments)); } catch (e) { } return ce.apply(console, arguments); };
  window.addEventListener('error', e => note('exceção', (e.message || '') + (e.filename ? ' — ' + e.filename.split('/').pop() + ':' + e.lineno : '')));
  window.addEventListener('unhandledrejection', e => note('promessa', (e.reason && e.reason.message) || e.reason));

  // ------------------------------ the signals: what the story engine hears ------------------------------
  function sigTxt(d) {
    if (!d || typeof d !== 'object') return '';
    const out = [];
    for (const k in d) {
      if (out.length >= 4) break;
      const v = d[k];
      if (v && typeof v === 'object') { if (v.name) out.push(k + ':' + v.name); else if (v.id !== undefined) out.push(k + ':#' + v.id); }
      else if (typeof v === 'number' || typeof v === 'string') out.push(k + ':' + String(v).slice(0, 24));
    }
    return out.join(' ');
  }
  if (G.Stories) {
    const sig = G.Stories.signal;
    G.Stories.signal = function (kind, d) {
      try { if (G.S && G.Main && G.Main.mode === 'game') { sigN[kind] = (sigN[kind] || 0) + 1; sigs.push([G.S.day, Math.floor(G.S.time * 24), kind, sigTxt(d)]); if (sigs.length > 300) sigs.shift(); } } catch (e) { }
      return sig.apply(this, arguments);
    };
  }

  // ------------------------------ the knobs ------------------------------
  const PARAMS = [
    ['ww', 'Guerra Mundial — chance diária', 'só nasce depois do ano 30, com 4+ povos grandes que se conhecem'],
    ['war', 'Vontade de declarar guerra', '0 = ninguém declara guerra'],
    ['events', 'Eventos aleatórios (tempestade, seca, lobos…)', 'frequência'],
    ['births', 'Nascimentos', 'chance de concepção'],
    ['research', 'Pesquisa', 'velocidade das descobertas'],
    ['riots', 'Revoltas populares', 'chance quando o povo está insatisfeito'],
    ['sea', 'Vontade de ir ao mar', 'expedições: menos espera, mais coragem'],
    ['rare', 'Pelagens raras (albino, negro)', 'chance ao nascer um animal'],
    ['story.cap', 'Histórias ao mesmo tempo', 'capacidade do diretor'],
    ['story.pace', 'Ritmo do diretor de histórias', 'intervalo entre uma história e outra'],
    ['story.fatigue', 'Fadiga narrativa', '0 = o diretor não evita repetir temas'],
  ];
  const PRESETS = {
    normal: { label: 'Tudo normal', p: {} },
    caos: { label: 'Caos (guerras e revoltas)', p: { war: 3, ww: 40, riots: 6, events: 2.5 } },
    paz: { label: 'Paz total', p: { war: 0, ww: 0, riots: 0 } },
    historias: { label: 'Histórias ao máximo', p: { 'story.cap': 3, 'story.pace': 10, 'story.fatigue': 0 } },
    raro: { label: 'Raridades', p: { rare: 80, events: 4, sea: 4 } },
    turbo: { label: 'Crescimento turbo', p: { births: 2.5, research: 6 } },
  };
  function applyParams() { for (const k in G.DV) delete G.DV[k]; if (!D.on) return; const p = store.get('.params', {}); for (const k in p) if (typeof p[k] === 'number' && isFinite(p[k]) && p[k] !== 1) G.DV[k] = p[k]; }
  function setParam(k, v) { const p = store.get('.params', {}); if (v === 1 || v === null || isNaN(v)) delete p[k]; else p[k] = Math.max(0, v); store.set('.params', p); applyParams(); }
  const tuned = () => Object.keys(G.DV).length;

  // ------------------------------ peoples ------------------------------
  const facs = () => (G.S ? G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)) : []);
  function FA() {
    let f = G.Fac.get(D.fa);
    if (!f || !f.alive) { const s = G.UI.selected; const sf = s && s.set !== undefined && !s.kind ? G.Fac.ofSet(s.set) : null; f = sf || G.Fac.get(G.UI.viewFac) || facs()[0]; D.fa = f ? f.id : 0; }
    return f && f.alive ? f : null;
  }
  function FB() {
    let f = G.Fac.get(D.fb);
    if (!f || !f.alive || f.id === D.fa) { f = facs().find(o => o.id !== D.fa) || null; D.fb = f ? f.id : 0; }
    return f;
  }
  const adults = (fid, fn) => [...G.S.villagers.values()].filter(v => !v.dead && !v.captive && !v.aboard && !v.held && !v.ug && v.age >= 16 && G.Fac.idOfV(v) === fid && (!fn || fn(v)));
  const pe = v => G.Politics.persona(v);
  function bigTown(f) { let best = null, bn = -1; for (const s of G.Fac.settlementsOf(f.id)) { const n = G.Village.pop(s.id); if (n > bn) { bn = n; best = s; } } return best; }
  function place(v, x, y) {
    if (!v) return false;
    const p = G.W.nearestLand(x, y, 8); if (!p) return false;
    G.Vg.endTask(v); v.x = p[0]; v.y = p[1]; v.path = null; v.inside = 0; v.sleeping = false; v.moving = false; v._wd = null; v.think = 0;
    return true;
  }
  function families(f, n) {
    const set = bigTown(f) || G.Fac.capitalOf(f.id); if (!set) return 0; let made = 0;
    for (let k = 0; k < n; k++) {
      const p0 = G.W.nearestLand(set.cx + G.rr(-6, 6), set.cy + G.rr(-6, 6), 6); if (!p0) continue;
      const a = G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: G.rr(19, 36), g: 'm' });
      const b = G.Vg.create({ set: set.id, x: p0[0] + 0.4, y: p0[1], age: G.rr(18, 34), g: 'f' });
      if (a && b) { a.partner = b.id; b.partner = a.id; made += 2; }
      for (let c = 0, nc = Math.floor(G.rr(0, 3)); c < nc && a && b; c++) { const kid = G.Vg.create({ set: set.id, x: p0[0], y: p0[1] + 0.4, age: G.rr(1, 14), mother: b.id, father: a.id }); if (kid) { (a.kids = a.kids || []).push(kid.id); (b.kids = b.kids || []).push(kid.id); made++; } }
    }
    return made;
  }
  function meet(a, b) { const r = G.Fac.rel(a.id, b.id); if (!r || !r.met) G.Politics.meet(a, b, { quiet: true }); }
  function war(a, b, why) { meet(a, b); if (!G.Fac.atWar(a.id, b.id)) { const S = G.S; const dp = S.divinePeace; S.divinePeace = 0; G.Politics.declareWar(a, b, why || 'ambicao'); S.divinePeace = dp; } return G.Fac.atWar(a.id, b.id); }
  function peace(a, b) {
    const S = G.S; const r = G.Fac.rel(a.id, b.id); if (!r || r.st !== 'guerra') return false;
    const dp = S.divinePeace, w = b.weariness; S.divinePeace = 1; b.weariness = 100;
    let ok = false; try { ok = G.Politics.answerPeace(a, b, r); } finally { S.divinePeace = dp; if (!ok) b.weariness = w; }
    return ok;
  }

  // ------------------------------ the camera ------------------------------
  function go(x, y, follow) { if (x === undefined) return; const cam = G.Render.cam; cam.follow = follow || 0; G.Render.panTo(x, y); }
  function goV(v, sel) { if (!v) return; if (sel) G.UI.select(v); go(v.x, v.y, v.dead ? 0 : v.id); }
  D.go = go;

  // ------------------------------ the hunt: the years pass until the thing happens ------------------------------
  function hunt(label, until, then, years) {
    if (!G.S || G.Skip.on) return;
    let hit = false;
    G.Skip.GOALS.devhunt = {
      label: 'Procurando: ' + label, sub: 'modo desenvolvedor', hidden: true, max: years || 60, dev: true,
      until: () => (hit = !!until()),
      then: why => {
        D.lastHunt = { label, why, day: G.S.day };
        if (why === 'alvo' || hit) { say(`Aconteceu: ${label} (ano ${G.S.day}).`); try { then && then(); } catch (e) { note('erro', 'dev: ' + e.message); } }
        else say(why === 'parado' ? 'Você parou a procura.' : `${years || 60} anos se passaram e não aconteceu: ${label}. Tente ajustar os parâmetros.`, true);
        show(true);
      },
    };
    G.Skip.start('devhunt', 'livre');
  }
  D.hunt = hunt;
  function years(n, course) {
    if (!G.S || G.Skip.on) return;
    G.Skip.GOALS.devyears = { label: `+${n} ${n === 1 ? 'ano' : 'anos'}`, sub: 'modo desenvolvedor', years: n, hidden: true };
    G.Skip.start('devyears', course || D.course);
  }
  // chronicle icons worth waiting for, and the signals of the story engine
  const logN = () => G.S.logN || 0;
  function chronHunt(ics, label) {
    const n0 = logN();
    return () => {
      const H = G.S.history;
      for (let k = H.length - 1; k >= 0 && H[k].n > n0; k--) if (ics.includes(H[k].ic)) { D._hit = H[k]; return true; }
      return false;
    };
  }
  function sigHunt(kind) { const n0 = sigN[kind] || 0; return () => (sigN[kind] || 0) > n0; }
  const lastSig = kind => { for (let k = sigs.length - 1; k >= 0; k--) if (sigs[k][2] === kind) return sigs[k]; return null; };
  const goHit = () => { const h = D._hit; if (h && h.x !== undefined) go(h.x, h.y); };
  const HUNTS = [
    ['Guerra Mundial', () => () => !!(G.WorldWar && G.WorldWar.active()), () => focusWW(), 120],
    ['uma guerra começar', () => sigHunt('war'), () => focusWar()],
    ['uma batalha em campo aberto', () => { const n0 = battles().length; return () => battles().length > n0 && battles().some(b => b.open && !b.naval); }, () => focusBattle(false)],
    ['uma batalha naval', () => { const n0 = battles().filter(b => b.naval).length; return () => battles().filter(b => b.naval).length > n0; }, () => focusBattle(true)],
    ['um cerco', () => chronHunt(['siege']), goHit],
    ['um golpe de Estado', () => chronHunt(['coup']), goHit],
    ['uma revolução ou levante', () => chronHunt(['revolt']), goHit],
    ['um tirano', () => chronHunt(['tyrant']), goHit],
    ['uma revolta popular (tochas)', () => () => !!(G.Riots && G.Riots.list().some(r => !r.end)), () => { const r = G.Riots.list().find(q => !q.end); const s = r && G.S.settlements.get(r.set); if (s) go(s.cx, s.cy); }],
    ['uma execução pública', () => () => (G.S.execs || []).length > 0, () => { const e = (G.S.execs || [])[0]; const v = e && live(e.ids ? e.ids[0] : e.v); if (v) goV(v, true); }],
    ['um festival', () => () => !!(G.Fest && G.Fest.list && G.Fest.list().length), () => { const fe = G.Fest.list()[0]; const s = fe && G.S.settlements.get(fe.set); if (s) go(s.cx, s.cy); }],
    ['uma sociedade secreta nascer', () => { const n0 = secrets().length; return () => secrets().length > n0; }, () => { }],
    ['uma coroação', () => sigHunt('crown'), () => { }],
    ['uma cidade conquistada', () => sigHunt('conquer'), () => { }],
    ['um povo extinto', () => sigHunt('extinct'), () => { }],
    ['uma secessão (novo reino)', () => chronHunt(['split']), goHit],
    ['uma peste', () => chronHunt(['plague']), goHit],
    ['uma maravilha', () => chronHunt(['wonder']), goHit],
    ['uma nova cidade', () => chronHunt(['city']), goHit],
    ['uma profecia', () => chronHunt(['prophecy']), goHit],
    ['um sacrifício', () => chronHunt(['sacrifice']), goHit],
    ['uma expedição partir', () => sigHunt('expDeparted'), () => focusExp()],
    ['um naufrágio', () => sigHunt('shipSunk'), () => { }],
    ['um náufrago', () => sigHunt('castaway'), () => { }],
    ['uma colônia além-mar', () => sigHunt('colonyFounded'), () => { }],
    ['um primeiro contato pelo mar', () => sigHunt('firstContact'), () => { }],
    ['um animal de pelagem rara', () => { const n0 = rares().length; return () => rares().length > n0; }, () => { const a = rares().pop(); if (a) { G.UI.select(a); go(a.x, a.y, a.id); } }],
    ['uma fera devoradora de gente', () => { const n0 = maneaters().length; return () => maneaters().length > n0; }, () => { const a = maneaters().pop(); if (a) { G.UI.select(a); go(a.x, a.y, a.id); } }],
  ];
  const battles = () => (G.Wars ? G.Wars.state().battles || [] : []);
  const secrets = () => ((G.S && G.S.secrets && G.S.secrets.socs) || []).filter(q => !q.gone);
  const rares = () => [...G.S.animals.values()].filter(a => !a.dead && a.morph);
  const maneaters = () => [...G.S.animals.values()].filter(a => !a.dead && a.named && (a.kills || 0) >= 2);
  function focusWW() { const w = G.WorldWar && G.WorldWar.active(); if (!w) return; const b = battles().filter(x => x.open).pop(); if (b) go(b.x, b.y); D.tab = 'guerra'; }
  function focusWar() { const w = G.Wars && G.Wars.active().slice(-1)[0]; if (!w) return; const f = G.Fac.get(w.def); const c = f && G.Fac.capitalOf(f.id); if (c) go(c.cx, c.cy); D.tab = 'guerra'; }
  function focusBattle(naval) { const b = battles().filter(x => x.open && !!x.naval === naval).pop() || battles().filter(x => !!x.naval === naval).pop(); if (b) go(b.x, b.y); }
  function focusExp() { const e = G.Expe && G.Expe.list().filter(x => G.Expe.live(x)).pop(); if (!e) return; const s = G.S.ships.find(o => e.ships && e.ships.includes(o.id)); if (s) go(s.x, s.y, s.id); D.tab = 'mar'; }

  // ------------------------------ the stories: real events, not painted ones ------------------------------
  // a story is born from what happens; a recipe makes it happen (a death before a witness, a capture...)
  // and the engine does the rest — so the recipe also tests the whole road from the world to the tale
  function seedOf(type, pid) { return saga().seeds.find(sd => sd.type === type && (!pid || sd.protag === pid)) || null; }
  function promote(sd) { if (!sd) return null; sd.ripe = 0; const s = St()._promote(sd); if (s) { St().follow(s.id); const p = live(s.protag); if (p) goV(p); } return s; }
  function settle(secs) { for (let k = 0; k < (secs || 1) / 0.05; k++) G.debug.step(0.05); }
  function afterRecipe(type, pid, what) {
    settle(1.2);
    const sd = seedOf(type, pid);
    if (sd) { const s = promote(sd); say(s ? `${what} — a história começou e está sendo seguida.` : `${what} — a semente nasceu (${R2(sd.score)}), mas não pôde virar história.`, !s); return s; }
    const s = saga().stories.find(x => x.type === type && x.protag === pid && x.st === 'ativa');
    if (s) { St().follow(s.id); say(`${what} — a história já começou.`); return s; }
    say(`${what} — mas nenhuma semente de “${(St().DEF[type] || {}).name || type}” nasceu (o protagonista não quis, ou faltou testemunha). Tente de novo: cada pessoa reage do seu jeito.`, true);
    return null;
  }
  function pickProtag(A, needKin) {
    const sel = G.UI.selected; const kf = typeof needKin === 'function' ? needKin : () => true;
    const ok = v => v.age >= 17 && v.age <= 52 && !G.Politics.isRuler(v) && (!needKin || kinOf(v).some(kf));
    if (sel && sel.name && !sel.kind && !sel.dead && G.Fac.idOfV(sel) === A.id && ok(sel)) return sel;
    const c = adults(A.id, ok); c.sort((a, b) => (pe(b).agg + (b.courage || 0)) - (pe(a).agg + (a.courage || 0)));
    return c[0] || null;
  }
  const kinOf = v => St().kin(v).filter(k => !k.dead && !k.captive && !k.aboard && k.age >= 12 && St().relOf(v, k) && /^(pai|mae|filho|filha|companheir[oa]|irm[aã]o?)$/.test(St().relOf(v, k)) && !G.Politics.isRuler(k));
  function foeOf(B) { const c = adults(B.id, v => v.age <= 50 && !G.Politics.isRuler(v)); c.sort((a, b) => (b.role === 'guerreiro') - (a.role === 'guerreiro') || (b.kills || 0) - (a.kills || 0)); return c[0] || null; }
  const RECIPES = {
    vinganca: { label: 'Assassinato diante de um parente', run() {
      const A = FA(), B = FB(); if (!A || !B) return say('Precisa de dois povos.', true);
      if (!war(A, B, 'vinganca')) return say('Não consegui pôr os dois povos em guerra.', true);
      const p = pickProtag(A, true); if (!p) return say(`Ninguém em ${A.name} com família por perto.`, true);
      const victim = kinOf(p).sort((a, b) => b.age - a.age)[0]; const k = foeOf(B); if (!victim || !k) return say('Faltou a vítima ou o matador.', true);
      place(p, p.x, p.y); place(victim, p.x + 1.4, p.y + 0.6); place(k, p.x + 2.2, p.y + 1.1);
      G.faceTo && G.faceTo(k, victim.x - k.x, victim.y - k.y);
      victim.lastBy = k.id; G.Village.kill(victim, 'war');
      const home = bigTown(B); if (home) place(k, home.cx, home.cy);
      return afterRecipe('vinganca', p.id, `${k.name}, de ${B.name}, matou ${victim.name} diante de ${p.name}`);
    } },
    resgate: { label: 'Captura de um parente', run() {
      const A = FA(), B = FB(); if (!A || !B) return say('Precisa de dois povos.', true);
      if (!war(A, B, 'ambicao')) return say('Não consegui pôr os dois povos em guerra.', true);
      const p = pickProtag(A, k => k.age >= 14); if (!p) return say(`Ninguém em ${A.name} com família por perto.`, true);
      const o = kinOf(p).filter(k => k.age >= 14)[0]; const k = foeOf(B); if (!o || !k) return say('Faltou o cativo ou o captor.', true);
      place(o, p.x + 1.2, p.y + 0.5); place(k, p.x + 1.8, p.y + 1);
      G.War.capture(o, k, null);
      const home = bigTown(B); if (home) { place(k, home.cx, home.cy); o.x = k.x + 0.5; o.y = k.y; }
      return afterRecipe('resgate', p.id, `${k.name} levou ${o.name} acorrentad${o.g === 'f' ? 'a' : 'o'} para ${B.name}`);
    } },
    cacada: { label: 'Uma fera com nome mata alguém', run() {
      const A = FA(); if (!A) return;
      const p = pickProtag(A, true); if (!p) return say(`Ninguém em ${A.name} com família por perto.`, true);
      const victim = kinOf(p)[0]; if (!victim) return say('Faltou a vítima.', true);
      const kind = ['bear', 'wolf', 'tiger', 'lion', 'jaguar'].find(k => G.Animals.ids.includes(k) && G.Animals.habitat(G.Animals.sp({ kind: k }), G.W.idx(Math.floor(p.x), Math.floor(p.y)))) || 'wolf';
      const spot = G.W.nearestLand(p.x + 5, p.y + 3, 6) || [p.x, p.y];
      const a = G.Animals.spawn(kind, spot[0], spot[1], { named: G.mythName(), kills: 2, big: 1.25 });
      a.maxHp = a.hp = Math.round(a.hp * 1.6);
      place(victim, spot[0] - 0.6, spot[1]);
      victim.lastBeastId = a.id; victim.lastBy = 0; G.Village.kill(victim, 'beast');
      return afterRecipe('cacada', p.id, `${a.named}, ${G.Animals.sp(a).name.toLowerCase()}, matou ${victim.name}`);
    } },
    cadafalso: { label: 'Uma condenação à morte', run() {
      const A = FA(); if (!A) return;
      const c = adults(A.id, v => !G.Politics.isRuler(v) && kinOf(v).length && !(v.task && v.task.j)); const v = c[Math.floor(G.R() * c.length)];
      if (!v) return say('Ninguém para condenar.', true);
      const id0 = saga().ns || 1;
      if (!G.Justice.sentence(A, [v], 'traição')) return say('A justiça não aceitou a sentença agora (já há uma execução?).', true);
      settle(1.5);
      const sd = saga().seeds.find(x => x.type === 'cadafalso'); if (sd) { promote(sd); return say(`${v.name} foi condenad${v.g === 'f' ? 'a' : 'o'} — a história começou.`); }
      const s = saga().stories.filter(x => x.id >= id0).find(x => x.type === 'cadafalso'); if (s) { St().follow(s.id); return say(`${v.name} foi condenad${v.g === 'f' ? 'a' : 'o'}.`); }
      // (the one who will try to save them decides in the hours after the sentence: the world is given that time)
      storyHunt('cadafalso', `alguém decidir salvar ${v.name}`, 1);
    } },
    insurreicao: { label: 'Um levante contra o governante', run() { act.uprise(); settle(1); const sd = seedOf('insurreicao'); if (sd) promote(sd); } },
    horizonte: { label: 'Uma grande expedição', run() { act.exp('grande'); settle(1); const sd = seedOf('horizonte'); if (sd) promote(sd); } },
    naufrago: { label: 'Um navio de expedição afunda', run() { if (act.wreck() === false) return; storyHunt('naufrago', 'um sobrevivente chegar a uma praia', 4); } },
    convocacao: { label: 'Guerra e convocação', run() { const A = FA(), B = FB(); if (!A || !B) return; war(B, A, 'ambicao'); act.campaign(); settle(1); const sd = seedOf('convocacao'); if (sd) promote(sd); else say('A guerra começou; a convocação vem quando o exército for reunido (procure a semente).'); } },
    'fera-rara': { label: 'Um animal raro perto de gente', run() {
      const A = FA(); const set = A && bigTown(A); if (!set) return;
      const kinds = G.Animals.ids.filter(k => { const d = G.Animals.sp({ kind: k }); return d.cls === 'land' && d.size >= 0.8 && !d.dom && !d.town; });
      let p = null, kind = null;
      for (let g = 0; g < 40 && !p; g++) { const a = G.R() * 6.283, r = (set.radius || 6) + G.rr(4, 9); const q = G.W.nearestLand(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 4); if (!q) continue; const k = kinds.find(x => G.Animals.habitat(G.Animals.sp({ kind: x }), G.W.idx(Math.floor(q[0]), Math.floor(q[1])))); if (k) { p = q; kind = k; } }
      if (!p) return say('Nenhum bicho grande vive perto dessa cidade.', true);
      const a = G.Animals.spawn(kind, p[0], p[1], { morph: G.Animals.sp({ kind }).morphs && G.Animals.sp({ kind }).morphs.melanico ? 'melanico' : 'albino' });
      go(a.x, a.y, a.id); storyHunt('fera-rara', `alguém ver ${G.Animals.rareName ? G.Animals.rareName(a) : 'o bicho raro'}`, 3);
    } },
  };
  // wait for the world to grow the seed of a story, then start it and follow it
  function storyHunt(type, label, yrs) {
    const id0 = saga().ns || 1;
    hunt(label, () => seedOf(type) || saga().stories.filter(x => x.id >= id0).some(s => s.type === type), () => {
      const sd = seedOf(type); if (sd) { promote(sd); return; }
      const s = saga().stories.filter(x => x.id >= id0).find(x => x.type === type); if (s) { St().follow(s.id); const p = live(s.protag); if (p) goV(p); }
      D.tab = 'historias';
    }, yrs);
  }
  // the duel of a vengeance: both sides brought to the same small fight — the scene does the rest
  function forceDuel(s) {
    const p = live(s.protag), t = live(s.cast.target); if (!p || !t) return say('Um dos dois já não está vivo.', true);
    const fp = G.Fac.get(G.Fac.idOfV(p)), ft = G.Fac.get(G.Fac.idOfV(t));
    if (!fp || !ft || fp === ft) return say('Os dois são do mesmo povo agora.', true);
    if (p.captive || t.captive) return say('Um dos dois está cativo: o acerto é diante das correntes, não num campo.', true);
    if (!war(fp, ft, 'vinganca')) return say('Não consegui pôr os povos em guerra.', true);
    if (p.age < 16) p.age = 16;
    s.data.met = -99; if (s.phase === 'crescer' || s.phase === 'remoer') s.phase = 'preparar';
    // a skirmish beside the protagonist's town: a handful on each side, the two of them a few steps apart
    const set = G.S.settlements.get(p.set); const cx = set ? set.cx + 7 : p.x, cy = set ? set.cy + 4 : p.y;
    const ours = adults(fp.id, v => v !== p && v.age < 50 && !G.Politics.isRuler(v)).slice(0, 4), theirs = adults(ft.id, v => v !== t && v.age < 50 && !G.Politics.isRuler(v)).slice(0, 4);
    place(p, cx - 2.5, cy); place(t, cx + 2.5, cy);
    ours.forEach((v, i) => place(v, cx - 3 - (i % 2), cy - 2 + i)); theirs.forEach((v, i) => place(v, cx + 3 + (i % 2), cy - 2 + i));
    const H = G.Vg.H;
    ours.forEach((v, i) => { const o = theirs[i % Math.max(1, theirs.length)]; if (o) H.setTask(v, { type: 'combat', id: o.id, pri: 4.4, any: true, kind: 'combat' }); });
    theirs.forEach((v, i) => { const o = ours[i % Math.max(1, ours.length)]; if (o) H.setTask(v, { type: 'combat', id: o.id, pri: 4.4, any: true, kind: 'combat' }); });
    const f1 = theirs[0] || t, f2 = ours[0] || p;
    H.setTask(p, { type: 'combat', id: f1.id, pri: 4.4, any: true, kind: 'combat' }); H.setTask(t, { type: 'combat', id: f2.id, pri: 4.4, any: true, kind: 'combat' });
    St().follow(s.id); go(cx, cy);
    D.duel = { id: s.id, t0: G.S.clock };
    say(`${p.name} e ${t.name} estão no mesmo campo, a poucos passos — o encontro deve acontecer agora.`);
  }
  // why a vengeance has not met yet: the conditions of the encounter, one by one
  function duelWhy(s) {
    const p = live(s.protag), t = live(s.cast.target); if (!p || !t) return 'um dos dois morreu';
    const L = St().lib || {}; const inB = L.inBattle || (() => false);
    const fp = G.Fac.idOfV(p), ft = G.Fac.idOfV(t);
    const parts = [
      ['em batalha: ' + p.name, inB(p)], ['em batalha: ' + t.name, inB(t)], ['povos em guerra', G.Fac.atWar(fp, ft)],
      [`perto (${G.dist(p.x, p.y, t.x, t.y).toFixed(1)} < 9)`, G.dist(p.x, p.y, t.x, t.y) < 9], ['sem encontro há 4 dias', !(G.S.day - (s.data.met || -99) < 4)],
      ['ninguém cativo', !p.captive && !t.captive], ['nenhuma cena em curso', !(G.Scene && G.Scene.running(s.id))],
    ];
    return parts.map(([k, v]) => `<span class="${v ? 'dv-ok' : 'dv-no'}">${v ? '✓' : '✗'} ${esc(k)}</span>`).join(' ');
  }

  // ------------------------------ the bug hunt ------------------------------
  function scan() {
    const S = G.S; const out = []; const N = G.N; const T = G.T;
    const add = (sev, what, x, y, id) => { if (out.length < 200) out.push({ sev, what, x, y, id }); };
    const ships = new Map(S.ships.map(s => [s.id, s]));
    for (const v of S.villagers.values()) {
      if (v.age < 2 && v.carried) continue; // (a baby in arms is wherever the one who carries it is)
      if (!isFinite(v.x) || !isFinite(v.y)) { add(3, `${v.name}: posição inválida (${v.x}, ${v.y})`, 0, 0, v.id); continue; }
      if (v.x < 0 || v.y < 0 || v.x >= N || v.y >= N) add(3, `${v.name}: fora do mapa`, v.x, v.y, v.id);
      if (v.aboard && !ships.has(v.aboard)) add(2, `${v.name}: a bordo de um navio que não existe`, v.x, v.y, v.id);
      const i = G.W.idx(Math.floor(v.x), Math.floor(v.y));
      const tt = v.task && v.task.type;
      if (!v.aboard && !v.ug && S.type[i] <= T.SEA && tt !== 'swim' && tt !== 'mariscar' && tt !== 'pocas' && tt !== 'naufrago' && !v.held && !(G.Possess && G.Possess.afloat(v))) add(2, `${v.name}: dentro d'água sem nadar nem barco (${tt || 'sem tarefa'})`, v.x, v.y, v.id);
      if ((v._pfN || 0) >= 4) add(1, `${v.name}: o caminho falha há ${v._pfN} tentativas (${tt || 'sem tarefa'})`, v.x, v.y, v.id);
      if (v.set !== undefined && v.set && !S.settlements.has(v.set) && !v.captive) add(2, `${v.name}: povoado ${v.set} não existe`, v.x, v.y, v.id);
      if (v.home && !S.buildings.has(v.home)) add(1, `${v.name}: casa ${v.home} não existe`, v.x, v.y, v.id);
      if (v.partner && !S.villagers.has(v.partner) && !(S.dead && S.dead.has(v.partner))) add(1, `${v.name}: companheir${v.g === 'f' ? 'o' : 'a'} ${v.partner} sumiu sem morrer`, v.x, v.y, v.id);
      if (v.task && v.task.type === 'scene' && G.Scene && !G.Scene.actorScene(v)) add(2, `${v.name}: preso numa cena que já acabou`, v.x, v.y, v.id);
    }
    for (const s of S.ships) if (!isFinite(s.x) || !isFinite(s.y)) add(3, `navio ${s.id}: posição inválida`, 0, 0);
    for (const f of G.Fac.all()) {
      const pop = G.Fac.pop(f.id); const cap = G.Fac.capitalOf(f.id);
      if (!cap) add(2, `${f.name}: vivo, mas sem capital`, undefined, undefined);
      if (!pop) add(2, `${f.name}: vivo, mas sem ninguém`, cap && cap.cx, cap && cap.cy);
      if (f.leader && !S.villagers.has(f.leader)) add(2, `${f.name}: o governante ${f.leader} não está vivo`, cap && cap.cx, cap && cap.cy);
    }
    if (G.Stories) {
      const DEF = St().DEF;
      for (const s of saga().stories) {
        if (s.st !== 'ativa') continue; const d = DEF[s.type] || {}; const p = live(s.protag);
        if (!p && !s.data.waitHeir) add(2, `história “${s.title || s.type}”: ativa com protagonista morto`, undefined, undefined);
        if (d.maxDays && S.day - s.born > d.maxDays * 1.25) add(1, `história “${s.title || s.type}”: passou do prazo (${S.day - s.born} > ${d.maxDays} anos)`, p && p.x, p && p.y, p && p.id);
        const lastCh = s.chapters.length ? s.chapters[s.chapters.length - 1].d : s.born;
        if (S.day - lastCh > 25) add(1, `história “${s.title || s.type}”: parada há ${S.day - lastCh} anos na fase “${s.phase}”`, p && p.x, p && p.y, p && p.id);
        if (s.data.next && s.data.next.at !== undefined && DAYY() - s.data.next.at > 2) add(1, `história “${s.title || s.type}”: o próximo momento (“${s.data.next.label}”) atrasou ${(DAYY() - s.data.next.at).toFixed(1)} dia(s)`, s.data.next.x, s.data.next.y, p && p.id);
      }
    }
    if (G.Expe) for (const e of G.Expe.list()) {
      if (!G.Expe.live(e)) continue;
      const sh = (e.ships || []).filter(id => ships.has(id)); const crew = G.Expe.alive ? G.Expe.alive(e) : null;
      if (!sh.length && !(crew && crew.length)) add(2, `expedição ${e.name}: viva (${e.st}) sem navios nem tripulação`, undefined, undefined);
      if (e.t0 !== undefined && S.day - e.t0 > 30) add(1, `expedição ${e.name}: há ${S.day - e.t0} anos no estado ${e.st}`, undefined, undefined);
    }
    for (const b of battles()) if (b.open && b.t0 !== undefined && S.clock - b.t0 > G.DAY_LEN * 3) add(1, `batalha ${b.name || b.id}: aberta há ${((S.clock - b.t0) / G.DAY_LEN).toFixed(1)} dias`, b.x, b.y);
    if (G.War && G.War.bands) for (const b of G.War.bands.values()) if (!b.members || !b.members.length) add(1, `bando ${b.id}: sem membros (${b.st})`, b.x, b.y);
    let an = 0; for (const a of S.animals.values()) { if (!isFinite(a.x) || !isFinite(a.y)) add(3, `animal ${a.kind} #${a.id}: posição inválida`, 0, 0); if (!a.dead) an++; }
    if (an > 2600) add(1, `${an} animais vivos: população alta`, undefined, undefined);
    out.sort((a, b) => b.sev - a.sev);
    D.lastScan = { day: S.day, list: out };
    return out;
  }
  D.scan = scan;

  // ------------------------------ the profiler: where the frame goes ------------------------------
  const PROF = {}; let profWrapped = false, profT0 = 0;
  const MODS = [['Nature', 'update'], ['Village', 'update'], ['Vg', 'updateAll'], ['Life', 'update'], ['Carnage', 'update'], ['Animals', 'updateAll'], ['Flora', 'update'], ['Riches', 'update'], ['Estates', 'update'], ['Court', 'update'], ['Trade', 'update'], ['Migrate', 'update'], ['Nests', 'update'], ['Caves', 'update'], ['Pets', 'update'], ['Powers', 'update'], ['Lore', 'update'], ['Events', 'update'],
    ['Fac', 'update'], ['Politics', 'update'], ['Stories', 'update'], ['Scene', 'update'], ['Wars', 'update'], ['War', 'update'], ['WorldWar', 'update'], ['Expe', 'update'], ['Fleets', 'update'], ['Naval', 'update'], ['Fishers', 'update'], ['Polity', 'update'], ['Riots', 'update'], ['Secrets', 'update'], ['Justice', 'update'], ['Festivals', 'update'], ['Civ', 'update'], ['Render', 'frame']];
  function wrapProf() {
    if (profWrapped) return; profWrapped = true;
    for (const [m, fn] of MODS) {
      const o = G[m]; if (!o || typeof o[fn] !== 'function') continue;
      const orig = o[fn]; const key = m + (fn === 'update' ? '' : '.' + fn);
      o[fn] = function () { if (!D.prof) return orig.apply(this, arguments); const t = performance.now(); try { return orig.apply(this, arguments); } finally { const e = PROF[key] || (PROF[key] = { ms: 0, n: 0, max: 0 }); const d = performance.now() - t; e.ms += d; e.n++; if (d > e.max) e.max = d; } };
    }
  }
  function profReset() { for (const k in PROF) delete PROF[k]; profT0 = performance.now(); }

  // ------------------------------ the overlay: what everyone is doing ------------------------------
  let ov = null, ovx = null;
  function overlay() {
    if (!D.labels || !G.S || G.Skip.on) { if (ov && ov.style.display !== 'none') { ovx.clearRect(0, 0, ov.width, ov.height); ov.style.display = 'none'; } return; }
    if (!ov) { ov = document.createElement('canvas'); ov.id = 'dev-overlay'; document.body.appendChild(ov); ovx = ov.getContext('2d'); }
    ov.style.display = 'block';
    const dpr = Math.min(2, window.devicePixelRatio || 1); const w = innerWidth, h = innerHeight;
    if (ov.width !== Math.round(w * dpr) || ov.height !== Math.round(h * dpr)) { ov.width = Math.round(w * dpr); ov.height = Math.round(h * dpr); }
    const c = ovx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    const R = G.Render; if (R.under) return;
    c.font = '700 10px Nunito, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom';
    const items = [];
    for (const v of G.S.villagers.values()) {
      if (v.inside || v.aboard || v.ug) continue;
      const [wx, wy] = R.proj(v.x, v.y, G.W.groundH(v.x, v.y)); const [sx, sy] = R.worldPxToScreen(wx, wy - (v.z || 0));
      if (sx < -40 || sy < -20 || sx > w + 40 || sy > h + 20) continue;
      items.push([v, sx, sy]);
    }
    if (items.length > 220) items.length = 220;
    const lift = 16 * R.cam.zoom;
    for (const [v, sx, sy] of items) {
      let txt = '', col = '#fff';
      if (D.labels === 'tarefa') { const t = v.task; txt = t ? t.type + (t.sub ? ':' + t.sub : t.st !== undefined ? ':' + t.st : '') : '—'; if (t && t.saga) col = '#ffd27a'; if (t && (t.type === 'combat' || t.type === 'band')) col = '#ff9a8a'; }
      else if (D.labels === 'historia') { const ss = G.Stories ? G.Stories.of(v.id) : []; if (!ss.length) continue; txt = ss.map(s => (s.protag === v.id ? '★' : '·') + (St().DEF[s.type] || {}).name).join(' '); col = '#ffd27a'; }
      else if (D.labels === 'id') txt = '#' + v.id + ' ' + v.name.split(' ')[0];
      else if (D.labels === 'vida') { txt = `${Math.round(v.hp || 0)}♥ ${Math.round(v.hunger || 0)}🍞 ${Math.round(v.energy || 0)}⚡`; col = (v.hp || 0) < 40 ? '#ff9a8a' : '#fff'; }
      const y = sy - lift; const tw = c.measureText(txt).width + 6;
      c.fillStyle = 'rgba(10,8,14,0.72)'; c.fillRect(sx - tw / 2, y - 12, tw, 13);
      c.fillStyle = col; c.fillText(txt, sx, y);
    }
  }

  // ------------------------------ the panel ------------------------------
  let el = null, badgeEl = null, statusTxt = '', statusBad = false, statusT = 0;
  function say(t, bad) { statusTxt = t; statusBad = !!bad; statusT = performance.now(); const s = el && el.querySelector('.dv-status'); if (s) { s.textContent = t; s.classList.toggle('bad', !!bad); } if (!D.open) G.UI.notice(t, bad ? 'skull' : 'eye'); }
  D.say = say;
  const btn = (a, v, label, on, cls) => `<button class="dv-b ${on ? 'on' : ''} ${cls || ''}" data-d="${a}" data-a="${esc(v)}">${label}</button>`;
  const sec = (title, body, note2) => `<section class="dv-sec"><h4>${title}</h4>${body}${note2 ? `<p class="dv-note">${note2}</p>` : ''}</section>`;
  const row = (...b) => `<div class="dv-row">${b.join('')}</div>`;
  const selv = k => { const s = el && el.querySelector(`[data-k="${k}"]`); return s ? s.value : null; };
  function pickers(onlyA) {
    const opts = sel => facs().map(f => `<option value="${f.id}" ${f.id === sel ? 'selected' : ''}>${esc(f.name)} · ${G.Fac.pop(f.id)}</option>`).join('');
    FA(); FB();
    return `<div class="dv-pick"><label>Povo A <select data-k="fa">${opts(D.fa)}</select></label>${onlyA ? '' : `<label>Povo B <select data-k="fb">${opts(D.fb)}</select></label>`}</div>`;
  }
  const REL_ST = { paz: 'em paz', guerra: 'em guerra', tregua: 'em trégua', alianca: 'aliados', vassalo: 'vassalagem' };
  const NEWW = [
    { label: 'Ilha · 1 povo', o: { type: 'ilha', size: 80, tribes: 1, temper: 'normal' } },
    { label: 'Continente · 4 povos', o: { type: 'continente', size: 128, tribes: 4, temper: 'normal' } },
    { label: 'Mar aberto · 3 povos', o: { type: 'mar', size: 128, tribes: 3, temper: 'normal' } },
    { label: 'Arquipélago belicoso · 5', o: { type: 'arquipelago', size: 150, tribes: 5, temper: 'belicoso' } },
    { label: 'Istmo · 2 povos', o: { type: 'istmo', size: 96, tribes: 2, temper: 'normal' } },
    { label: 'Colossal · 6 povos', o: { type: 'continente', size: 160, tribes: 6, temper: 'normal' } },
  ];
  const snapKey = k => '.snap.' + k;
  function snapInfo(k) { const m = snaps[k] || store.get(snapKey(k) + '.i', null); return m ? `ano ${m.day} · ${m.pop} almas · ${esc(m.map)}` : '<span class="muted">vazio</span>'; }

  const TAB = {};
  TAB.tempo = () => {
    const sp = G.speed;
    return sec('Velocidade', row(...[0, 1, 2, 4, 8, 16, 32, 64].map(n => btn('speed', n, n ? n + '×' : '❚❚', sp === n))), 'Acima de 16× o mundo corre o quanto a máquina aguenta — agora: <b data-live="real"></b>.')
      + sec('Hora do dia', row(...[['madrugada', 0.1], ['amanhecer', 0.24], ['manhã', 0.34], ['meio-dia', 0.5], ['entardecer', 0.66], ['noite', 0.8]].map(([n, t]) => btn('hour', t, n))))
      + sec('Avançar no tempo — o mundo vive cada dia, só não é desenhado', row(...[1, 5, 10, 25, 50, 100].map(n => btn('years', n, '+' + n + (n === 1 ? ' ano' : ' anos'))))
        + row(btn('course', 'livre', 'Mundo livre', D.course === 'livre'), btn('course', 'fartura', 'Paz e fartura', D.course === 'fartura'))
        + row(btn('goal', 'cidade', 'até a 1ª cidade'), btn('goal', 'metropole', 'até a 1ª metrópole'), btn('goal', 'mega', 'até a megalópole'), btn('goal', 'guerra', 'até a próxima guerra')),
        '<b>Início</b>: anos 0–10, tribos e aldeias. <b>Meio</b>: vilas viram cidades, os povos se encontram. <b>Fim</b>: metrópoles, impérios, Guerra Mundial. O caminho mais curto para o fim: “até a 1ª metrópole” com “Paz e fartura”, depois Parâmetros → Caos.')
      + sec('Momentos guardados — para repetir um teste ou reproduzir um bug', ['A', 'B', 'C'].map(k => `<div class="dv-row"><b class="dv-slot">${k}</b><span class="dv-grow">${snapInfo(k)}</span>${btn('snap', k, 'Guardar')}${snaps[k] || store.get(snapKey(k) + '.i', null) ? btn('restore', k, 'Voltar') : ''}</div>`).join(''))
      + sec('Mundo novo de teste', row(...NEWW.map((w, i) => btn('neww', i, w.label)))
        + `<div class="dv-row"><span class="dv-grow">Semente deste mundo: <b>${G.S ? G.S.seed >>> 0 : '—'}</b></span>${btn('again', 0, 'Recriar este mundo')}</div>`
        + `<div class="dv-row"><input class="dv-in" data-k="seed" inputmode="numeric" placeholder="semente do próximo mundo (vazio = ao acaso)" value="${esc(D.seed || '')}"></div>`,
        'A mesma semente, o mesmo mapa e os mesmos povos fazem o mesmo mundo — e, sem a mão do deus, ele vive a mesma história.');
  };
  TAB.povos = () => {
    const A = FA(), B = FB(); if (!A) return '<p class="dv-note">Nenhum povo vivo.</p>';
    const ruler = G.Politics.ruler(A); const st = A.stock; const r = B ? G.Fac.rel(A.id, B.id) : null;
    const nt = Object.keys(G.TECH).filter(t => A.tech && A.tech.known[t]).length;
    const civ = G.CIVS[A.civ];
    const festOpts = Object.entries(G.Fest ? G.Fest.DEF : {}).filter(([, d]) => !d.civ || d.civ === A.civ || d.civ === 'classico').map(([k, d]) => `<option value="${k}">${esc(d.name)}${d.civ && d.civ !== A.civ ? ' (clássico)' : ''}</option>`).join('');
    return pickers()
      + sec(esc(A.name), `<div class="dv-kv">
        <span>civilização</span><b>${esc(civ ? civ.name : 'clássica')}</b>
        <span>regime</span><b>${esc(G.Politics.govName(A))}</b>
        <span>governante</span><b>${ruler ? `<a data-d="person" data-a="${ruler.id}">${esc(G.Politics.styled(A, ruler))}</a>` : 'ninguém'}</b>
        <span>gente</span><b>${G.Fac.pop(A.id)} almas · ${G.Fac.settlementsOf(A.id).length} povoados · ${G.Fac.captives(A.id)} cativos</b>
        <span>estoque</span><b>comida ${Math.round(st.food || 0)} · madeira ${Math.round(st.wood || 0)} · pedra ${Math.round(st.stone || 0)} · moedas ${Math.round(st.moedas || 0)} · armas ${Math.round(st.armas || 0)}</b>
        <span>saber</span><b>${nt}/${Object.keys(G.TECH).length} artes${A.tech && A.tech.cur ? ' · pesquisa ' + esc(G.TECH[A.tech.cur].name) : ''}</b>
        ${B ? `<span>com ${esc(B.name)}</span><b>${r && r.met ? `${REL_ST[r.st] || r.st} · opinião ${Math.round(r.op || 0)} · rancor ${Math.round(r.grudge || 0)}` : 'nunca se viram'}</b>` : ''}
      </div>`)
      + sec('Dar ao povo A', row(btn('fam', 5, '+5 famílias'), btn('fam', 20, '+20 famílias'), btn('rich', 1, 'Fartura de tudo'), btn('tech1', 1, 'Próxima arte'), btn('techs', 1, 'Todas as artes')))
      + sec('Política de A', row(btn('coup', 1, 'Golpe'), btn('revol', 1, 'Revolução'), btn('uprise', 1, 'Levante'), btn('killruler', 1, 'Matar o governante'), btn('exec', 1, 'Execução pública'), btn('sacri', 1, 'Sacrifício'))
        + `<div class="dv-row"><select data-k="riotwhy">${Object.keys(G.Riots ? G.Riots.WHY : {}).map(k => `<option value="${k}">${esc(G.Riots.WHY[k].txt)}</option>`).join('')}</select>${btn('riot', 1, 'Revolta popular')}</div>
           <div class="dv-row"><select data-k="gov">${Object.keys(G.Politics.GOV).map(k => `<option value="${k}" ${A.gov === k ? 'selected' : ''}>${esc(G.Politics.GOV[k].name)}</option>`).join('')}</select>${btn('regime', 1, 'Mudar o regime')}</div>`)
      + sec('Vida de A', `<div class="dv-row"><select data-k="fest">${festOpts}</select>${btn('fest', 0, 'Festival')}${btn('fest', 1, 'Grandioso')}</div>` + row(btn('secret', 1, 'Fundar sociedade secreta'), btn('ev', 'immigrants', 'Imigrantes'), btn('ev', 'sickness', 'Doença'), btn('ev', 'fertility', 'Fertilidade')))
      + (B ? sec(`${esc(A.name)} e ${esc(B.name)}`, row(btn('meet', 1, 'Conhecerem-se'), btn('meetall', 1, 'Todos se conhecem'), btn('war', 1, 'A declara guerra a B'), btn('peace', 1, 'Paz'), btn('ally', 1, 'Aliança'), btn('hate', 1, 'Ódio mortal'), btn('campaign', 1, 'A marcha contra B agora'))) : '');
  };
  TAB.guerra = () => {
    const WW = G.WorldWar; const w = WW && WW.active(); const big = G.Fac.all().filter(f => G.Fac.pop(f.id) >= 12);
    const RS = WW ? WW.REASONS : {};
    let h = sec('Guerra Mundial', w
      ? `<p><b>${esc(w.name)}</b> — há ${G.S.day - w.start} anos · ${esc((RS[w.reason] || {}).why || '')}</p><p>${w.blocs.map(b => b.map(id => esc(fname(G.Fac.get(id)))).join(', ')).join(' <b>×</b> ')}</p>` + row(btn('wwgo', 1, 'Ir à batalha mais recente'), btn('divpeace', 1, 'Paz divina (encerra tudo)'))
      : `<p class="dv-note">${big.length} povo(s) grande(s) (12+ almas). Para forçá-la: 3. Para nascer sozinha: 4, que se conheçam, depois do ano 30 — por isso quase nunca se vê. ${G.S.worldWar ? `A última terminou no ano ${G.S.worldWar.end}.` : ''}</p>`
        + `<div class="dv-row"><select data-k="wwwhy"><option value="">motivo do mundo (automático)</option>${Object.entries(RS).map(([k, r]) => `<option value="${k}">${esc(r.name)}</option>`).join('')}</select>${btn('ww', 1, 'Começar agora', false, 'hot')}</div>`
        + row(btn('wwprep', 1, 'Preparar o mundo para ela'), btn('wwlate', 1, 'Avançar 60 anos de fartura e começar', false, 'hot'), btn('hunt', 0, 'Esperar até nascer sozinha')),
      'Preparar: todos se conhecem e os povos pequenos ganham famílias até contar como grandes. No começo do jogo ela é feita de incursões de poucos guerreiros; com impérios (fim de jogo), de exércitos inteiros, cercos e frotas.');
    const wars = G.Wars ? G.Wars.active() : [];
    h += sec(`Guerras em curso (${wars.length})`, wars.length ? wars.map(x => `<div class="dv-row"><span class="dv-grow"><b>${esc(x.name || 'guerra')}</b> · ${x.a.map(id => esc(fname(G.Fac.get(id)))).join(', ')} × ${x.b.map(id => esc(fname(G.Fac.get(id)))).join(', ')} · ${G.S.day - x.start} anos</span>${btn('wargo', x.id, 'ver')}${btn('warend', x.id, 'paz')}</div>`).join('') : '<p class="dv-note">Nenhuma.</p>');
    const bs = battles().filter(b => b.open);
    h += sec(`Batalhas abertas (${bs.length})`, bs.length ? bs.map(b => `<div class="dv-row"><span class="dv-grow">${esc(b.name || 'batalha')}${b.naval ? ' (naval)' : ''}</span>${btn('goxy', b.x + ',' + b.y, 'ir')}</div>`).join('') : '<p class="dv-note">Nenhuma agora.</p>');
    const ar = G.Wars ? (G.Wars.state().armies || []).filter(a => !a.done) : [];
    h += sec(`Exércitos em campanha (${ar.length})`, ar.length ? ar.slice(0, 14).map(a => `<div class="dv-row"><span class="dv-grow">${esc(a.name)} · ${esc(fname(G.Fac.get(a.fac)))} · ${esc(a.phase)} · ${a.members.length} homens</span>${btn('army', a.id, 'seguir')}</div>`).join('') : '<p class="dv-note">Nenhum.</p>');
    return h;
  };
  TAB.mar = () => {
    const A = FA(); if (!A) return '';
    const X = G.Expe; let why = null; try { why = X && X.why(A); } catch (e) { why = null; }
    const kv = why ? Object.entries(why).filter(([, v]) => v !== undefined && typeof v !== 'object').map(([k, v]) => `<span>${esc(k)}</span><b>${esc(typeof v === 'number' ? R2(v) : v)}</b>`).join('') : '';
    const ex = X ? X.list().filter(e => X.live(e)) : [];
    return pickers()
      + sec(`${esc(A.name)} e o mar`, `<div class="dv-kv">${kv || '<span>—</span><b>sem dados</b>'}</div>`, 'gate: o que impede uma viagem agora · aff: amor ao mar · will: vontade da melhor razão · p: chance desta vez')
      + sec('Forçar', row(btn('seaprep', 1, 'Preparar (navegação, doca, barcos)'), btn('exp', 'so', 'Expedição solitária'), btn('exp', 'media', 'Expedição média'), btn('exp', 'grande', 'Grande expedição'), btn('colony', 1, 'Colônia'), btn('warfleet', 1, 'Frota de guerra'), btn('invasion', 1, 'Invasão por mar contra B'), btn('wreck', 1, 'Afundar um navio de expedição'), btn('storm', 1, 'Tempestade')))
      + sec(`Expedições no mar (${ex.length})`, ex.length ? ex.map(e => `<div class="dv-row"><span class="dv-grow"><b>${esc(e.name)}</b> · ${esc(fname(G.Fac.get(e.fac)))} · ${esc(e.st)}${e.status ? ' · ' + esc(e.status) : ''}</span>${btn('expgo', e.id, 'seguir')}</div>`).join('') : '<p class="dv-note">Nenhuma.</p>');
  };
  TAB.historias = () => {
    if (!G.Stories) return '';
    const s0 = saga(); const DEF = St().DEF; const act = s0.stories.filter(s => s.st === 'ativa');
    const cap = St().capacity();
    let h = sec('Diretor', `<p class="dv-note">${act.length} ativa(s) de ${cap} possíveis · ${s0.seeds.length} semente(s) esperando.</p>` + row(btn('preset', 'historias', 'Diretor solto'), btn('preset', 'normal', 'Diretor normal')), 'Toda história nasce de um fato real (uma morte, uma captura, uma viagem…) que vira semente; o diretor escolhe as melhores sementes, uma de cada vez.');
    const vg = act.filter(s => s.type === 'vinganca');
    if (vg.length) h += sec('Vinganças — o encontro', vg.map(s => `<div class="dv-card"><b>${esc(s.title)}</b> · fase ${esc(s.phase)}${s.data.meets ? ` · ${s.data.meets} encontro(s)` : ''}<div class="dv-why">${duelWhy(s)}</div>${row(btn('duel', s.id, 'Forçar o encontro (duelo)', false, 'hot'), btn('follow', s.id, 'Seguir'))}</div>`).join(''));
    h += sec('Tipos de história', `<table class="dv-t"><tr><th>tipo</th><th>ativas</th><th>sementes</th><th></th></tr>${Object.keys(DEF).map(k => {
      const d = DEF[k]; const na = act.filter(s => s.type === k).length, ns = s0.seeds.filter(x => x.type === k).length;
      return `<tr><td title="${esc(Object.keys(d.on || {}).join(', '))}">${esc(d.name || k)}</td><td>${na || ''}</td><td>${ns || ''}</td><td class="dv-tb">${ns ? btn('promotetype', k, 'promover') : ''}${RECIPES[k] ? btn('recipe', k, 'criar', false, 'hot') : ''}${btn('huntstory', k, 'esperar')}</td></tr>`;
    }).join('')}</table>`, '<b>criar</b>: faz acontecer o fato real que dá origem a ela (com os povos A e B da aba Povos, ou com a pessoa selecionada). <b>esperar</b>: avança o tempo até nascer uma semente desse tipo. <b>promover</b>: a melhor semente vira história agora.');
    h += sec(`Ativas (${act.length})`, act.length ? act.map(s => {
      const p = live(s.protag); const n = s.data.next;
      return `<div class="dv-card"><b>${esc(s.title)}</b> <span class="muted">· ${esc((DEF[s.type] || {}).name)} · fase ${esc(s.phase || '—')} · ${s.chapters.length} cap. · ${G.S.day - s.born} anos</span>
        <div>${p ? esc(p.name) + (p.task ? ` — <i>${esc(G.Vg.taskText ? G.Vg.taskText(p) : p.task.type)}</i>` : '') : '<i>protagonista morto</i>'}</div>
        ${n ? `<div class="dv-note">próximo: ${esc(n.label)} ${n.at !== undefined ? `em ${Math.max(0, (n.at - DAYY()) * 24).toFixed(1)} h` : ''}</div>` : ''}
        ${row(btn('follow', s.id, 'Seguir'), p ? btn('person', p.id, 'Ir') : '', btn('nextmoment', s.id, 'Até o próximo capítulo'), btn('endstory', s.id, 'Encerrar'))}</div>`;
    }).join('') : '<p class="dv-note">Nenhuma.</p>');
    const seeds = s0.seeds.slice().sort((a, b) => (b.w || b.score) - (a.w || a.score));
    h += sec(`Sementes (${seeds.length})`, seeds.length ? `<table class="dv-t"><tr><th>tipo</th><th>quem</th><th>força</th><th>madura</th><th></th></tr>${seeds.map((sd, i) => { const p = live(sd.protag); const rip = sd.ripe && G.S.clock < sd.ripe ? `em ${((sd.ripe - G.S.clock) / G.DAY_LEN * 24).toFixed(1)} h` : 'sim'; return `<tr><td>${esc((DEF[sd.type] || {}).name || sd.type)}</td><td>${p ? esc(p.name) : '—'}</td><td>${R2(sd.score)}${sd.w !== undefined ? ' / ' + sd.w : ''}</td><td>${rip}</td><td class="dv-tb">${btn('promote', sd.key, 'promover')}</td></tr>`; }).join('')}</table>` : '<p class="dv-note">Nenhuma.</p>', 'força: valor da semente / peso que o diretor lhe dá agora (fadiga, tom, repetição).');
    return h;
  };
  TAB.raros = () => {
    const morphKinds = G.Animals.ids.filter(k => { const d = G.Animals.sp({ kind: k }); return d.morphs || (d.cls === 'land' && d.size >= 0.8 && !d.dom && !d.town); });
    return sec('Natureza', row(...[['storm', 'Tempestade'], ['drought', 'Seca'], ['wolves', 'Lobos'], ['sickness', 'Doença'], ['fertility', 'Fertilidade'], ['discovery', 'Descoberta'], ['herd', 'Manada'], ['immigrants', 'Imigrantes']].map(([k, l]) => btn('ev', k, l))))
      + sec('Bichos raros perto da câmera', `<div class="dv-row"><select data-k="rarek">${morphKinds.map(k => `<option value="${k}">${esc(G.Animals.sp({ kind: k }).name)}</option>`).join('')}</select><select data-k="morph"><option value="albino">albino</option><option value="melanico">negro</option></select>${btn('rare', 1, 'Fazer nascer')}${btn('maneater', 1, 'Fera devoradora')}</div>`)
      + sec('Esperar até acontecer — o tempo corre até lá e a câmera vai ao lugar', `<div class="dv-grid">${HUNTS.map((x, i) => btn('hunt', i, x[0])).join('')}</div>`, 'Cada procura corre no máximo 60 anos (a Guerra Mundial, 120). Combine com Parâmetros (ex.: Guerra Mundial ×40) para encurtar a espera.');
  };
  TAB.params = () => {
    const p = store.get('.params', {});
    return sec('Atalhos', row(...Object.entries(PRESETS).map(([k, x]) => btn('preset', k, x.label))))
      + sec('Multiplicadores — 1 = como o jogo é; 0 = desliga; 10 = dez vezes mais', PARAMS.map(([k, l, sub]) => `<div class="dv-row dv-param ${p[k] !== undefined ? 'on' : ''}"><span class="dv-grow"><b>${esc(l)}</b><small>${esc(sub)}</small></span><input type="number" min="0" step="0.1" value="${p[k] !== undefined ? p[k] : 1}" data-p="${k}">${btn('px', k, '×0')}${btn('pp', k, '÷2')}${btn('pm', k, '×2')}${btn('pr', k, '1')}</div>`).join(''), 'Valem só com o modo desenvolvedor ligado e ficam guardados neste navegador. Desligar o modo devolve tudo ao normal.');
  };
  TAB.inspecao = () => {
    const sel = G.UI.selected;
    return sec('Agora', '<div class="dv-kv" data-live="stats"></div>')
      + sec('Rótulos sobre as pessoas', row(btn('labels', '', 'nenhum', !D.labels), btn('labels', 'tarefa', 'tarefa', D.labels === 'tarefa'), btn('labels', 'historia', 'história', D.labels === 'historia'), btn('labels', 'vida', 'vida/fome/energia', D.labels === 'vida'), btn('labels', 'id', 'id', D.labels === 'id')))
      + sec('Caçar bugs', row(btn('scan', 1, 'Procurar problemas agora', false, 'hot'), btn('watch', 1, D.watch ? 'Vigiando (a cada 10 s)' : 'Vigiar sozinho', D.watch)) + '<div data-live="scan"></div>')
      + sec(`Erros e avisos engolidos (${errs.length})`, '<div data-live="errs"></div>' + row(btn('clearerrs', 1, 'Limpar'), btn('copy', 1, 'Copiar relatório completo')), 'O jogo captura as próprias falhas para o mundo não parar — aqui elas aparecem. O relatório vai para a área de transferência: cole na conversa para eu investigar.')
      + sec('Onde o tempo da máquina vai', row(btn('prof', 1, D.prof ? 'Medindo — parar' : 'Medir', D.prof), btn('profreset', 1, 'Zerar')) + '<div data-live="prof"></div>')
      + sec('Sinais que o motor de histórias ouviu', `<input class="dv-in" data-k="sigf" placeholder="filtrar (ex.: death, exp, war)" value="${esc(D.sigf || '')}"><div data-live="sigs"></div>`)
      + sec('Selecionado', sel ? `${sel.name && !sel.kind && sel.age !== undefined ? row(btn('vkill', 1, 'Matar'), btn('vheal', 1, 'Curar'), btn('vage', 10, '+10 anos'), btn('vcrown', 1, 'Coroar'), btn('vfollow', 1, 'Câmera')) : ''}<pre class="dv-pre" data-live="sel"></pre>` + row(btn('copysel', 1, 'Copiar')) : '<p class="dv-note">Clique em alguém, num bicho, num prédio ou num navio.</p>');
  };
  const TABS = [['tempo', 'Tempo'], ['povos', 'Povos'], ['guerra', 'Guerra'], ['mar', 'Mar'], ['historias', 'Histórias'], ['raros', 'Raros'], ['params', 'Parâmetros'], ['inspecao', 'Inspeção']];

  function build() {
    el = document.createElement('div'); el.id = 'dev'; el.className = 'dev-panel panel';
    el.innerHTML = `<header><b>Modo desenvolvedor</b><span class="dv-hd" data-live="hd"></span><button class="dv-x" data-d="side" title="trocar de lado">⇆</button><button class="dv-x" data-d="off" title="desligar o modo desenvolvedor">⏻</button><button class="dv-x" data-d="close" title="fechar (F2)">×</button></header>
      <nav>${TABS.map(([k, l]) => `<button data-tab="${k}">${l}</button>`).join('')}</nav><div class="dv-body"></div><footer class="dv-status"></footer>`;
    document.body.appendChild(el);
    // the panel types and clicks for itself: nothing reaches the game's shortcuts
    el.addEventListener('keydown', e => { if (e.key === 'F2') return; e.stopPropagation(); if (e.key === 'Enter' && e.target.dataset.p) { setParam(e.target.dataset.p, parseFloat(e.target.value)); show(true); } });
    el.addEventListener('keyup', e => e.stopPropagation());
    el.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
    el.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.k === 'fa') { D.fa = +t.value; show(true); }
      else if (t.dataset.k === 'fb') { D.fb = +t.value; show(true); }
      else if (t.dataset.p) { setParam(t.dataset.p, parseFloat(t.value)); show(true); }
    });
    el.addEventListener('input', e => { if (e.target.dataset.k === 'sigf') { D.sigf = e.target.value; tickLive(true); } else if (e.target.dataset.k === 'seed') D.seed = e.target.value.replace(/\D/g, '').slice(0, 10); });
    el.addEventListener('click', e => {
      const tb = e.target.closest('[data-tab]'); if (tb) { D.tab = tb.dataset.tab; store.set('.tab', D.tab); show(true); return; }
      const b = e.target.closest('[data-d]'); if (!b) return;
      const a = b.dataset.d, v = b.dataset.a;
      if (!act[a]) return;
      try { act[a](v, b); } catch (err) { note('erro', 'dev ' + a + ': ' + err.message + ' @ ' + ((err.stack || '').split('\n')[1] || '').trim()); say('Falhou: ' + err.message, true); }
      if (!G.Skip.on && !b.dataset.keep) show(true);
    });
    badgeEl = document.createElement('button'); badgeEl.id = 'dev-badge';
    badgeEl.addEventListener('click', () => D.toggle());
    document.body.appendChild(badgeEl);
  }
  function show(rebuild) {
    if (!el) build();
    el.classList.toggle('right', D.side === 'right');
    const vis = D.on && D.open && !!G.S && !G.Skip.on && G.Main.mode === 'game';
    el.classList.toggle('hidden', !vis);
    if (!vis) return;
    el.querySelectorAll('nav [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === D.tab));
    if (rebuild) {
      const body = el.querySelector('.dv-body'); const top = body.scrollTop;
      let html = ''; try { html = (TAB[D.tab] || TAB.tempo)(); } catch (e) { html = `<p class="dv-no">Esta aba falhou: ${esc(e.message)}</p>`; note('erro', 'dev aba ' + D.tab + ': ' + e.message); }
      body.innerHTML = html; body.scrollTop = top;
      const s = el.querySelector('.dv-status'); s.textContent = statusTxt; s.classList.toggle('bad', statusBad);
    }
    tickLive(true);
  }
  D.show = show;

  // ------------------------------ the live parts ------------------------------
  let fps = 60, lastF = performance.now(), frames = 0, fpsT = 0;
  const LIVE = {
    hd: () => { const S = G.S; return `ano ${S.day} · ${String(Math.floor(S.time * 24)).padStart(2, '0')}h · ${S.villagers.size} almas · ${Math.round(fps)} fps`; },
    real: () => `${Math.round((G.Main.realSpeed || G.speed) * 10) / 10}×`,
    stats: () => {
      const S = G.S; const sg = saga(); let an = 0, rare = 0; for (const a of S.animals.values()) if (!a.dead) { an++; if (a.morph) rare++; }
      const kv = [
        ['dia', `ano ${S.day}, ${String(Math.floor(S.time * 24)).padStart(2, '0')}h · ${S.mapType} ${G.N}×${G.N} · ${S.temper}`],
        ['gente', `${S.villagers.size} vivos · ${(S.stats.births || 0)} nascidos · ${(S.stats.deaths || 0)} mortos`],
        ['povos', `${G.Fac.all().length} · ${S.settlements.size} povoados · ${S.buildings.size} prédios`],
        ['bichos', `${an} (${rare} raros)`], ['navios', `${S.ships.length} · ${G.Expe ? G.Expe.list().filter(e => G.Expe.live(e)).length : 0} expedições · ${(S.fleets || []).filter(f => f.st !== 'fim').length} frotas`],
        ['guerras', `${G.Wars ? G.Wars.active().length : 0} · ${battles().filter(b => b.open).length} batalhas abertas · ${G.War && G.War.bands ? G.War.bands.size : 0} bandos${G.WorldWar && G.WorldWar.active() ? ' · GUERRA MUNDIAL' : ''}`],
        ['histórias', `${sg.stories.filter(s => s.st === 'ativa').length} ativas · ${sg.seeds.length} sementes · ${sg.stories.filter(s => s.st === 'fim').length} terminadas`],
        ['cenas', G.Scene ? `${G.Scene.list.filter(s => s.st === 'run').length} em curso${G.Scene.watching ? ' · assistindo' : ''}` : '—'],
        ['máquina', `${Math.round(fps)} fps · velocidade real ${R2(G.Main.realSpeed || G.speed)}×${tuned() ? ` · <b class="dv-no">${tuned()} parâmetro(s) alterado(s)</b>` : ''}`],
      ];
      return kv.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('');
    },
    scan: () => { const s = D.lastScan; if (!s) return '<p class="dv-note">Ainda não procurei.</p>'; if (!s.list.length) return `<p class="dv-ok">Nada de estranho no ano ${s.day}.</p>`; return `<p class="dv-note">${s.list.length} problema(s) no ano ${s.day}:</p>` + s.list.slice(0, 40).map((q, i) => `<div class="dv-row dv-iss s${q.sev}"><span class="dv-grow">${esc(q.what)}</span>${q.x !== undefined && isFinite(q.x) ? btn('issue', i, 'ir') : ''}</div>`).join(''); },
    errs: () => (errs.length ? errs.slice(-30).reverse().map(e => `<div class="dv-err ${e.k === 'aviso' ? '' : 'bad'}"><i>ano ${e.d} ${e.h}h${e.n > 1 ? ' ×' + e.n : ''}</i> ${esc(e.m)}</div>`).join('') : '<p class="dv-ok">Nenhum.</p>'),
    prof: () => {
      const ks = Object.keys(PROF); if (!ks.length) return '<p class="dv-note">' + (D.prof ? 'Medindo…' : 'Desligado.') + '</p>';
      const secs = Math.max(0.5, (performance.now() - profT0) / 1000);
      ks.sort((a, b) => PROF[b].ms - PROF[a].ms);
      return `<table class="dv-t"><tr><th>sistema</th><th>ms/s</th><th>pico</th></tr>${ks.slice(0, 18).map(k => `<tr><td>${k}</td><td>${(PROF[k].ms / secs).toFixed(1)}</td><td>${PROF[k].max.toFixed(1)}</td></tr>`).join('')}</table><p class="dv-note">Village, Fac e Vg incluem os sistemas que chamam por dentro. Render.frame é o desenho.</p>`;
    },
    sigs: () => { const f = (D.sigf || '').toLowerCase(); const L = sigs.filter(s => !f || (s[2] + ' ' + s[3]).toLowerCase().includes(f)).slice(-40).reverse(); return L.length ? L.map(s => `<div class="dv-sig"><i>${s[0]} ${s[1]}h</i> <b>${esc(s[2])}</b> ${esc(s[3])}</div>`).join('') : '<p class="dv-note">Nada ainda.</p>'; },
    sel: () => { const s = G.UI.selected; return s ? esc(dump(s)) : ''; },
  };
  function dump(o) {
    const seen = new WeakSet();
    return JSON.stringify(o, function (k, v) {
      if (v && typeof v === 'object') { if (seen.has(v)) return '[…]'; seen.add(v); if (v instanceof Map || v instanceof Set) return `[${v.constructor.name} ${v.size}]`; if (Array.isArray(v) && v.length > 24) return `[${v.length} itens: ${v.slice(0, 8).map(x => typeof x === 'object' ? '{…}' : x).join(', ')}…]`; if (ArrayBuffer.isView(v)) return `[${v.length} números]`; }
      if (typeof v === 'number' && !Number.isInteger(v)) return Math.round(v * 1000) / 1000;
      return v;
    }, 1);
  }
  let liveT = 0;
  function tickLive(force) {
    if (!el || !D.open || !G.S) return;
    const busy = el.matches(':hover');
    el.querySelectorAll('[data-live]').forEach(n => {
      const k = n.dataset.live; if (!LIVE[k]) return;
      // (lists with buttons wait for the pointer to leave: they do not jump under a click)
      if (!force && busy && (k === 'scan' || k === 'sigs' || k === 'errs')) return;
      try { const h = LIVE[k](); if (n.innerHTML !== h) n.innerHTML = h; } catch (e) { n.textContent = 'falhou: ' + e.message; }
    });
  }
  function badge() {
    if (!badgeEl) build();
    const on = D.on && G.S && G.Main.mode === 'game' && !G.Skip.on;
    badgeEl.classList.toggle('hidden', !on);
    if (!on) return;
    const S = G.S; const n = errs.length;
    const h = `<b>DEV</b> ano ${S.day} · ${S.villagers.size} · ${Math.round(fps)} fps${tuned() ? ` · <span class="tun">${tuned()} parâm.</span>` : ''}${n ? ` · <span class="err">⚠ ${n}</span>` : ''}`;
    if (badgeEl.innerHTML !== h) badgeEl.innerHTML = h;
    badgeEl.classList.toggle('open', D.open);
  }
  function frame(now) {
    frames++; if (now - fpsT > 500) { fps = frames * 1000 / (now - fpsT); frames = 0; fpsT = now; }
    if (D.on) {
      overlay();
      if (now - liveT > 500) {
        liveT = now; badge(); tickLive(false);
        // (the panel goes away during a skip, the menu and the intro, and comes back after)
        if (el) { const want = D.open && !!G.S && !G.Skip.on && G.Main.mode === 'game'; if (want === el.classList.contains('hidden')) show(true); }
        // the vengeance being forced: did they meet?
        if (D.duel && G.S) { const s = St().get(D.duel.id); if (s && (s.data.meets || 0) > 0 && G.Scene && G.Scene.running(s.id)) { say('O duelo começou.'); D.duel = null; } else if (G.S.clock - D.duel.t0 > 40) { say('Os dois não se encontraram em 40 s — veja as condições na aba Histórias.', true); D.duel = null; } }
        if (D.watch && G.S && G.Main.mode === 'game' && !G.Skip.on && now - (D.watchT || 0) > 10000) { D.watchT = now; const n0 = D.lastScan ? D.lastScan.list.length : 0; const l = scan(); if (l.length > n0) note('bug', `vigia: ${l.length} problema(s) — o primeiro: ${l[0].what}`); }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ------------------------------ the report ------------------------------
  function report() {
    const S = G.S; const L = [];
    L.push(`GOD OF THE ANT FARM — relatório do modo desenvolvedor`);
    L.push(`mundo: ${S.mapType} ${G.N}×${G.N}, temperamento ${S.temper}; ano ${S.day}, ${Math.floor(S.time * 24)}h; ${S.villagers.size} almas; velocidade ${G.speed}× (real ${R2(G.Main.realSpeed || G.speed)}×); ${Math.round(fps)} fps; ${navigator.userAgent}`);
    if (tuned()) L.push(`parâmetros alterados: ${JSON.stringify(G.DV)}`);
    L.push('', 'POVOS'); for (const f of facs()) { const r = G.Politics.ruler(f); L.push(`- ${f.name} (${f.civ || 'clássico'}, ${G.Politics.govName(f)}): ${G.Fac.pop(f.id)} almas, ${G.Fac.settlementsOf(f.id).length} povoados, governante ${r ? r.name : '—'}; guerra com: ${G.Fac.enemiesOf(f.id).map(o => o.name).join(', ') || 'ninguém'}`); }
    const w = G.WorldWar && G.WorldWar.active(); if (w) L.push(`GUERRA MUNDIAL: ${w.name}, desde o ano ${w.start}`);
    if (G.Stories) { L.push('', 'HISTÓRIAS ATIVAS'); for (const s of saga().stories.filter(x => x.st === 'ativa')) { const p = live(s.protag); L.push(`- [${s.type}] ${s.title} — fase ${s.phase}, ${s.chapters.length} capítulos, protagonista ${p ? p.name + ' (' + (p.task ? p.task.type : '—') + ')' : 'morto'}${s.data.next ? ', próximo: ' + s.data.next.label : ''}`); for (const c of s.chapters.slice(-3)) L.push(`    ano ${c.d}: ${(c.h ? c.h + ': ' : '') + (c.txt || '').slice(0, 160)}`); } }
    if (D.lastScan && D.lastScan.list.length) { L.push('', `PROBLEMAS (ano ${D.lastScan.day})`); for (const q of D.lastScan.list.slice(0, 30)) L.push(`- ${q.what}`); }
    if (errs.length) { L.push('', 'ERROS E AVISOS'); for (const e of errs.slice(-40)) L.push(`- ano ${e.d} ${e.h}h [${e.k}]${e.n > 1 ? ' ×' + e.n : ''} ${e.m}`); }
    L.push('', 'ÚLTIMOS SINAIS'); for (const s of sigs.slice(-25)) L.push(`- ${s[0]} ${s[1]}h ${s[2]} ${s[3]}`);
    L.push('', 'CRÔNICA RECENTE'); for (const h of S.history.slice(-15)) L.push(`- ano ${h.d}: ${h.txt}`);
    return L.join('\n');
  }
  D.report = report;
  function copy(txt) {
    const done = () => say('Copiado para a área de transferência.');
    const fallback = () => { const t = document.createElement('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { say('Não consegui copiar.', true); } t.remove(); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback(); } catch (e) { fallback(); }
  }

  // ------------------------------ the actions ------------------------------
  const act = {
    close() { D.toggle(false); }, off() { D.enable(false); G.UI.notice('Modo desenvolvedor desligado: os parâmetros voltaram ao normal.', 'eye'); }, side() { D.side = D.side === 'right' ? 'left' : 'right'; store.set('.side', D.side); },
    speed(v) { G.UI.setSpeed(+v); },
    hour(v) { G.S.time = +v; say('Hora mudada.'); },
    years(v) { years(+v); }, course(v) { D.course = v; },
    goal(k) { if (G.Skip.reached(k)) return say('Isso já existe neste mundo.', true); G.Skip.start(k, D.course); },
    snap(k) {
      const S = G.S; const s = G.Save.serialize(); const info = { day: S.day, pop: S.villagers.size, map: `${S.mapType} ${G.N}` };
      snaps[k] = info; snaps[k].data = s;
      let disk = true; try { localStorage.setItem(LS + snapKey(k), s); localStorage.setItem(LS + snapKey(k) + '.i', JSON.stringify(info)); } catch (e) { disk = false; }
      say(`Momento ${k} guardado (ano ${S.day})${disk ? '' : ' — só nesta sessão: o navegador não tinha espaço'}.`);
    },
    restore(k) {
      let s = snaps[k] && snaps[k].data; if (!s) { try { s = localStorage.getItem(LS + snapKey(k)); } catch (e) { s = null; } }
      if (!s) return say('Momento vazio.', true);
      G.UI.select(null); G.UI.setPower(null); G.FX.list.length = 0; G.FX.floaters.length = 0;
      G.Save.apply(JSON.parse(s)); G.Minimap && G.Minimap.reset && G.Minimap.reset(); G.UI.update(1, true);
      say(`De volta ao momento ${k}: ano ${G.S.day}.`);
    },
    neww(i) { const w = NEWW[+i]; if (w) G.UI.confirm(`Criar um mundo novo (${w.label})? O atual será substituído.`, () => G.Main.newGame(Object.assign({}, G.Main.lastOpts || {}, w.o, { civs: [] }, D.seed ? { seed: +D.seed } : {}))); },
    again() { const S = G.S; if (!S) return; const o = Object.assign({}, S.genOpts || G.Main.lastOpts || {}, { seed: S.seed >>> 0 }); G.UI.confirm(`Recriar este mundo desde o primeiro dia (semente ${S.seed >>> 0})? O atual será substituído.`, () => G.Main.newGame(o)); },
    fam(n) { const A = FA(); const k = families(A, +n); say(`${k} pessoas chegaram a ${A.name}.`); },
    rich() { const A = FA(); const st = A.stock; for (const k of ['food', 'wood', 'stone']) st[k] = (st[k] || 0) + 1500; for (const k of ['moedas', 'armas', 'ferramentas', 'minerio', 'ferro', 'bronze', 'tecido', 'ceramica']) st[k] = (st[k] || 0) + 200; say(`${A.name} está rico.`); },
    tech1() { const A = FA(); const t = A.tech.cur || (G.Civ.next ? G.Civ.next(A) : null) || Object.keys(G.TECH).find(x => !A.tech.known[x]); if (!t) return say('Já sabe tudo.', true); G.Civ.learn(A, t, 'divina'); say(`${A.name} aprendeu ${G.TECH[t].name}.`); },
    techs() { const A = FA(); let n = 0; for (const t of Object.keys(G.TECH)) if (!A.tech.known[t]) { A.tech.known[t] = G.S.day; n++; } A.tech.cur = null; A.tech.pts = 0; G.Village.log(`${A.name} recebeu de uma vez todo o saber do mundo (modo desenvolvedor).`, 'tech'); say(`${n} artes de uma vez.`); },
    coup() { const A = FA(); const ruler = G.Politics.ruler(A); if (!ruler) return say('Sem governante.', true); const c = adults(A.id, v => v !== ruler && v.age < 60); c.sort((a, b) => (pe(b).amb + (b.courage || 0)) - (pe(a).amb + (a.courage || 0))); if (!c[0]) return say('Ninguém para tramar.', true); G.Politics.startCoup(A, c[0]); goV(c[0]); say(`${c[0].name} parte contra ${ruler.name}.`); },
    revol() { const A = FA(); G.Politics.startRevolution(A); const c = G.Fac.capitalOf(A.id); if (c) go(c.cx, c.cy); say(`Revolução em ${A.name}.`); },
    uprise() { const A = FA(); const ruler = G.Politics.ruler(A); if (!ruler || !G.Polity) return say('Sem governante.', true); const c = adults(A.id, v => v !== ruler); c.sort((a, b) => (b.courage || 0) - (a.courage || 0)); const goal = G.Polity.available(A, 'democracia') ? 'democracia' : 'conselho'; const ok = c[0] && G.Polity.uprising(A, c[0], ['povo', 'artesaos', 'mercadores'], goal, 'contra o governo'); if (ok && c[0]) goV(c[0]); say(ok ? `Levante em ${A.name}, por ${goal}.` : 'O levante não começou (já há um em curso?).', !ok); },
    killruler() { const A = FA(); const r = G.Politics.ruler(A); if (!r) return say('Sem governante.', true); G.Village.kill(r, 'old'); say(`${r.name} morreu. Quem herda?`); },
    exec() { const A = FA(); const c = adults(A.id, v => !G.Politics.isRuler(v) && !(v.task && v.task.j)); const v = c[Math.floor(G.R() * c.length)]; if (!v || !G.Justice.sentence(A, [v], 'traição')) return say('A sentença não foi aceita agora.', true); goV(v, true); say(`${v.name} vai ao cadafalso.`); },
    sacri() { const A = FA(); const c = adults(A.id, v => !G.Politics.isRuler(v) && !(v.task && v.task.j)).concat([...G.S.villagers.values()].filter(v => v.captive && G.Fac.idOfV(v) === A.id)); const v = c[Math.floor(G.R() * c.length)]; if (!v || !G.Justice.sacrifice(A, v)) return say('O sacrifício não foi aceito agora.', true); goV(v, true); say(`${v.name} será sacrificad${v.g === 'f' ? 'a' : 'o'}.`); },
    riot() { const A = FA(); const set = bigTown(A); const why = selv('riotwhy') || 'impostos'; if (!set || !G.Riots) return; const r = G.Riots.start(A, set, why, {}); if (r) go(set.cx, set.cy); say(r ? `Revolta ${G.Riots.WHY[why].txt} em ${set.name}.` : 'A revolta não começou (gente de menos? já há uma?).', !r); },
    regime() { const A = FA(); const g = selv('gov') || G.Politics.GOV && G.R && Object.keys(G.Politics.GOV).filter(k => k !== A.gov)[Math.floor(G.R() * (Object.keys(G.Politics.GOV).length - 1))]; if (!g) return; G.Polity.setRegime(A, g, 'reforma'); say(`${A.name} agora: ${G.Politics.govName(A)}.`); },
    fest(grand) { const A = FA(); const set = bigTown(A); const k = selv('fest') || Object.keys(G.Fest.DEF).find(x => G.Fest.DEF[x].civ === A.civ) || Object.keys(G.Fest.DEF).find(x => G.Fest.DEF[x].civ === 'classico'); if (!set || !k) return say('Nenhum festival para este povo.', true); const fe = G.Fest.start(set, k, { grand: grand === '1' }); if (fe) go(set.cx, set.cy); say(fe ? `${G.Fest.DEF[k].name} em ${set.name}.` : 'O festival não começou (pouca gente, ou uma batalha na cidade).', !fe); },
    secret() { const n0 = secrets().length; G.Secrets._found(); const ok = secrets().length > n0; say(ok ? `Nasceu: ${secrets().slice(-1)[0].name}.` : 'Nenhuma sociedade nasceu (o mundo precisa de 50+ almas, e há um limite por número de povos).', !ok); },
    ev(k) { if (!G.Events[k]) return; G.Events[k](); say('Evento: ' + k + '.'); },
    meet() { meet(FA(), FB()); say('Agora se conhecem.'); },
    meetall() { const F = G.Fac.all(); for (const a of F) for (const b of F) if (a.id < b.id) meet(a, b); say('Todos os povos se conhecem.'); },
    war() { const A = FA(), B = FB(); say(war(A, B) ? `${A.name} declarou guerra a ${B.name}.` : 'A guerra não pôde ser declarada.', !G.Fac.atWar(A.id, B.id)); },
    peace() { const A = FA(), B = FB(); const ok = peace(A, B); say(ok ? 'Paz assinada.' : (G.WorldWar && G.WorldWar.locks(A.id, B.id) ? 'A Guerra Mundial ainda não deixa: os blocos estão travados.' : 'Não estão em guerra, ou a paz foi recusada.'), !ok); },
    ally() { const A = FA(), B = FB(); meet(A, B); const r = G.Fac.rel(A.id, B.id); if (r.st === 'guerra') peace(A, B); r.st = 'alianca'; r.op = Math.max(r.op || 0, 75); r.since = G.S.day; G.Village.log(`${A.name} e ${B.name} firmaram uma aliança.`, 'ally'); say('Aliados.'); },
    hate() { const A = FA(), B = FB(); meet(A, B); const r = G.Fac.rel(A.id, B.id); r.op = -100; r.grudge = 100; say('Ódio mortal entre os dois.'); },
    campaign() {
      const A = FA(), B = FB(); if (!war(A, B)) return say('Sem guerra, sem campanha.', true);
      const w = G.Wars.warOf(A.id, B.id); const own = G.Fac.capitalOf(A.id);
      const tg = G.Fac.settlementsOf(B.id).sort((p, q) => G.dist(p.cx, p.cy, own.cx, own.cy) - G.dist(q.cx, q.cy, own.cx, own.cy))[0];
      // (over the water the army goes by sea, as the war planner itself would send it)
      const a = w && tg && (G.Wars.mobilize(w, A, 'campanha', tg, {}) || (G.Fleets && G.Fleets.amphibious(w, A, tg, {})));
      if (a) { go(own.cx, own.cy); say(`${a.name || 'O exército'} se reúne para ir contra ${tg.name}${a.sea ? ', pelo mar' : ''}.`); } else say('O exército não se formou (gente de menos, sem navios para atravessar, ou já há uma campanha).', true);
    },
    ww() {
      const why = selv('wwwhy') || undefined; const big = G.Fac.all().filter(f => G.Fac.pop(f.id) >= 12);
      if (big.length < 3) return say(`Só ${big.length} povo(s) grande(s): use “Preparar o mundo” ou crie um mundo com 4+ povos.`, true);
      const S = G.S; const dp = S.divinePeace; S.divinePeace = 0;
      const w = G.WorldWar.start(why || true); S.divinePeace = dp;
      if (w) focusWW();
      say(w ? `Começou ${w.name}.` : 'A Guerra Mundial não começou.', !w);
    },
    wwprep() {
      const F = G.Fac.all(); if (F.length < 3) return say(`Este mundo tem ${F.length} povo(s): crie um com 4+ (Tempo → Mundo novo).`, true);
      for (const a of F) for (const b of F) if (a.id < b.id) meet(a, b);
      let n = 0; for (const f of F) { let g = 0; while (G.Fac.pop(f.id) < 16 && g++ < 12) n += families(f, 2); }
      say(`Pronto: todos se conhecem${n ? `, ${n} pessoas a mais` : ''}.`);
    },
    wwlate() {
      if (!G.S || G.Skip.on) return;
      G.Skip.GOALS.devlate = { label: 'Fim de jogo, e então a Guerra Mundial', sub: 'modo desenvolvedor', years: 60, hidden: true, dev: true, then: () => { act.wwprep(); act.ww(); D.tab = 'guerra'; show(true); } };
      G.Skip.start('devlate', 'fartura');
    },
    wwgo() { focusWW(); }, divpeace() { G.Politics.divinePeace(); say('Paz divina.'); },
    wargo(id) { const w = G.Wars.get(+id); if (!w) return; const b = (w.battles || []).map(x => G.Wars.battle(x)).filter(Boolean).pop(); if (b) return go(b.x, b.y); const f = G.Fac.get(w.def); const c = f && G.Fac.capitalOf(f.id); if (c) go(c.cx, c.cy); },
    warend(id) { const w = G.Wars.get(+id); if (!w) return; const A = G.Fac.get(w.att), B = G.Fac.get(w.def); const ok = A && B && peace(A, B); say(ok ? 'Paz.' : 'A paz não veio (Guerra Mundial travando?).', !ok); },
    goxy(v) { const [x, y] = v.split(',').map(Number); go(x, y); },
    army(id) { const a = G.Wars.army(+id); if (!a) return; const v = a.members.map(live).find(Boolean); if (v) goV(v); },
    seaprep() {
      const A = FA(); const set = G.Fac.capitalOf(A.id); A.tech.known.navegacao = A.tech.known.navegacao || G.S.day;
      A.stock.wood += 400; A.stock.food += 400;
      let d = G.Naval.docksOf ? G.Naval.docksOf(A.id)[0] : null;
      if (!d) { let site = null; const r0 = set.radius; for (const R of [8, 14, 20, 28, 36]) { set.radius = R; site = G.City.dockSite(set); if (site) break; } set.radius = r0; if (site) d = G.Village.addBuilding('doca', site[0], site[1], set.id, true); }
      if (!d) return say('Não há costa perto da capital.', true);
      for (let k = 0; k < 3; k++) G.Naval.spawn('pesca', A, d);
      go(d.x, d.y); say(`${A.name}: navegação, uma doca e barcos.`);
    },
    exp(scale) {
      const A = FA(); let e = null;
      for (let g = 0; g < 40 && !e; g++) { e = G.Expe.consider(A, { scale, many: true }); if (!e) settle(0.5); }
      if (!e) return say(`Nenhuma expedição saiu. Motivo: ${JSON.stringify(G.Expe.why(A).gate || G.Expe.why(A))} — tente “Preparar”.`, true);
      D.tab = 'mar'; say(`Nasceu: ${e.name} (${e.scale}).`);
    },
    colony() { const A = FA(); let e = null; for (let g = 0; g < 60 && !e; g++) { e = G.Expe.colonyPlan(A, true); if (!e) settle(0.5); } say(e ? `Colonos partem: ${e.name}.` : 'Nenhum lugar bom para uma colônia (ou falta navio).', !e); },
    warfleet() { const A = FA(); const d = G.Naval.docksOf(A.id)[0]; if (!d) return say('Sem doca: “Preparar” primeiro.', true); for (const t of ['bronze', 'navegacao']) A.tech.known[t] = A.tech.known[t] || G.S.day; for (let k = 0; k < 4; k++) G.Naval.spawn('guerra', A, d); A.stock.armas = (A.stock.armas || 0) + 40; say('Quatro navios de guerra.'); },
    invasion() {
      const A = FA(), B = FB(); if (!A || !B) return;
      act.seaprep(); act.warfleet(); const d = G.Naval.docksOf(A.id)[0]; if (d) for (let k = 0; k < 2; k++) G.Naval.spawn('transporte', A, d);
      A.stock.food += 1200; A.stock.armas = (A.stock.armas || 0) + 80; for (const t of ['bronze', 'arco', 'ferro']) A.tech.known[t] = A.tech.known[t] || G.S.day;
      war(A, B, 'ambicao'); act.campaign(); say(`${A.name} prepara a travessia contra ${B.name}: a frota, os transportes e o exército.`);
    },
    wreck() {
      const e = G.Expe.list().filter(x => G.Expe.live(x) && (x.ships || []).some(id => G.Naval.atSea && G.Naval.atSea(G.S.ships.find(o => o.id === id)))).pop() || G.Expe.list().filter(x => G.Expe.live(x)).pop();
      if (!e) { say('Nenhuma expedição viva — crie uma primeiro (aba Mar).', true); return false; }
      const s = G.S.ships.find(o => (e.ships || []).includes(o.id)); if (!s) { say('A expedição está sem navio agora.', true); return false; }
      go(s.x, s.y); G.Naval.sink(s, null, 'storm'); say(`${e.name}: o navio afundou na tempestade. Quem sabe nadar…`); return true;
    },
    storm() { G.Events.storm(); say('Tempestade.'); },
    expgo(id) { const e = G.Expe.get(+id); const s = e && G.S.ships.find(o => (e.ships || []).includes(o.id)); if (s) go(s.x, s.y, s.id); else { const v = e && G.Expe.alive(e)[0]; if (v) goV(v); } },
    preset(k) { const x = PRESETS[k]; if (!x) return; const p = store.get('.params', {}); if (k === 'normal') { store.set('.params', {}); } else { Object.assign(p, x.p); store.set('.params', p); } applyParams(); say(`Parâmetros: ${x.label}.`); },
    px(k) { setParam(k, 0); }, pr(k) { setParam(k, 1); },
    pm(k) { setParam(k, R2(G.dv(k) * 2 || 1)); }, pp(k) { setParam(k, R2(G.dv(k) / 2)); },
    recipe(k) { const r = RECIPES[k]; if (r) r.run(); },
    promotetype(k) { const sd = saga().seeds.filter(x => x.type === k).sort((a, b) => b.score - a.score)[0]; const s = promote(sd); say(s ? `Começou: ${s.title}.` : 'Não deu.', !s); },
    promote(key) { const sd = saga().seeds.find(x => x.key === key); const s = promote(sd); say(s ? `Começou: ${s.title}.` : 'Não deu.', !s); },
    huntstory(k) { storyHunt(k, `uma história: ${(St().DEF[k] || {}).name || k}`); },
    follow(id) { St().follow(+id); const s = St().get(+id); const p = s && live(s.protag); if (p) goV(p); say('Seguindo.'); },
    nextmoment(id) { const s = St().get(+id); if (!s) return; const n0 = s.chapters.length; hunt(`o próximo capítulo de “${s.title}”`, () => s.chapters.length > n0 || s.st !== 'ativa' || !!(G.Scene && G.Scene.running(s.id)), () => { St().follow(s.id); const p = live(s.protag); if (p) goV(p); }, 30); },
    endstory(id) { const s = St().get(+id); if (s && s.st === 'ativa') { St().finish(s, 'interrompida', 'sereno', 'A história foi encerrada pelo modo desenvolvedor.', { bio: false }); say('Encerrada.'); } },
    duel(id) { const s = St().get(+id); if (s) forceDuel(s); },
    person(id) { const v = G.person ? G.person(+id) : live(+id); if (v) goV(v, true); },
    rare() {
      const k = selv('rarek') || 'tiger', m = selv('morph') || 'albino';
      const [tx, ty] = G.Render.screenToTile(innerWidth / 2, innerHeight / 2);
      const p = G.W.nearestLand(tx + G.rr(-3, 3), ty + G.rr(-3, 3), 10); if (!p) return say('Sem terra perto da câmera.', true);
      const a = G.Animals.spawn(k, p[0], p[1], { morph: m }); G.UI.select(a); go(a.x, a.y, a.id);
      say(`${G.Animals.rareName ? G.Animals.rareName(a) : k} nasceu aqui.`);
    },
    maneater() {
      const [tx, ty] = G.Render.screenToTile(innerWidth / 2, innerHeight / 2);
      const k = ['bear', 'tiger', 'lion', 'wolf'].find(x => G.Animals.ids.includes(x) && G.Animals.habitat(G.Animals.sp({ kind: x }), G.W.idx(Math.floor(tx), Math.floor(ty)))) || 'wolf';
      const p = G.W.nearestLand(tx, ty, 10); if (!p) return;
      const a = G.Animals.spawn(k, p[0], p[1], { named: G.mythName(), kills: 2, big: 1.3 }); a.maxHp = a.hp = Math.round(a.hp * 1.6);
      G.Village.log(`${G.Animals.sp(a).name} devorador${G.Animals.sp(a).g === 'f' ? 'a' : ''} de gente ronda por aqui. Chamam-n${G.Animals.sp(a).g === 'f' ? 'a' : 'o'} de ${a.named}.`, 'wolf', a.x, a.y);
      G.UI.select(a); go(a.x, a.y, a.id); say(`${a.named} ronda por aqui.`);
    },
    hunt(i) { const h = HUNTS[+i]; if (!h) return; hunt(h[0], h[1](), h[2], h[3]); },
    labels(v) { D.labels = v; },
    scan() { const l = scan(); say(l.length ? `${l.length} problema(s).` : 'Nada de estranho.', !!l.length); },
    watch() { D.watch = !D.watch; },
    issue(i) { const q = D.lastScan && D.lastScan.list[+i]; if (!q) return; const v = q.id && live(q.id); if (v) goV(v, true); else go(q.x, q.y); },
    clearerrs() { errs.length = 0; },
    copy() { copy(report()); },
    prof() { wrapProf(); D.prof = !D.prof; if (D.prof) profReset(); },
    profreset() { profReset(); },
    copysel() { const s = G.UI.selected; if (s) copy(dump(s)); },
    vkill() { const v = G.UI.selected; if (v && v.name && !v.kind && !v.dead) G.Village.kill(v, 'god', true); },
    vheal() { const v = G.UI.selected; if (v && v.name && !v.kind) { v.hp = v.maxHp || 100; v.sick = 0; v.hunger = 0; v.energy = 100; } },
    vage(n) { const v = G.UI.selected; if (v && v.age !== undefined) v.age += +n; },
    vcrown() { const v = G.UI.selected; const f = v && G.Fac.ofV(v); if (f && !v.kind) { G.Politics.crown(f, v, 'divina'); say(`${v.name} reina sobre ${f.name}.`); } },
    vfollow() { const v = G.UI.selected; if (v) go(v.x, v.y, v.id); },
  };
  D.act = act; D.RECIPES = RECIPES; D.HUNTS = HUNTS;

  // ------------------------------ on and off ------------------------------
  D.enable = function (on) {
    D.on = !!on; store.set('.on', D.on); applyParams();
    if (!D.on) { D.open = false; D.labels = ''; D.prof = false; overlay(); }
    badge(); show(true);
  };
  D.toggle = function (open) {
    if (!D.on) { D.enable(true); D.open = true; say('Modo desenvolvedor ligado. F2 abre e fecha o painel.'); }
    else D.open = open === undefined ? !D.open : !!open;
    show(true); badge();
  };
  D.off = () => D.enable(false);
  // ?dev in the address turns it on; it stays on in this browser until turned off
  const asked = /[?&#]dev\b/.test(location.search + location.hash);
  if (asked || store.get('.on', false)) { D.on = true; applyParams(); if (asked) D.open = true; }
})(window.G);
