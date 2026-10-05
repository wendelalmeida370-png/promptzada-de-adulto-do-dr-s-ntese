'use strict';
// ============================================================
//  Armies: real hosts instead of a handful of warriors. Levies
//  raised by the state and armed from the forge, companies of
//  spearmen, swordsmen, archers, cavalry and militia, each with
//  a captain, wings under colonels, a general who reads the
//  ground and the enemy and picks a plan: siege and starvation,
//  attacks on several gates, pincers, guerrilla, the wedge, the
//  tortoise — or, at home, the walls, the forest ambush, the hill,
//  the river ford. Formations hold, flanks break, morale routs.
// ============================================================
(function (G) {
  const AR = G.Army = {};
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const W = G.W, T = G.T;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const fid = v => G.Fac.idOfV(v);
  const TAU = Math.PI * 2;

  // ------------------------------ ranks and words ------------------------------
  AR.TITLES = {
    grego: { gen: ['Estratego', 'Estratega'], col: ['Taxiarca', 'Taxiarca'], cap: ['Lochagos', 'Lochagos'], co: 'Lochos' },
    romano: { gen: ['Legado', 'Legada'], col: ['Tribuno', 'Tribuna'], cap: ['Centurião', 'Centuriã'], co: 'Centúria' },
    egipcio: { gen: ['Grande Comandante', 'Grande Comandante'], col: ['Comandante de Ala', 'Comandante de Ala'], cap: ['Porta-Estandarte', 'Porta-Estandarte'], co: 'Companhia' },
    asteca: { gen: ['Tlacochcalcatl', 'Tlacochcalcatl'], col: ['Tlacateccatl', 'Tlacateccatl'], cap: ['Tequihua', 'Tequihua'], co: 'Esquadrão' },
    nordico: { gen: ['Jarl', 'Jarl'], col: ['Hersir', 'Hersir'], cap: ['Skipari', 'Skipari'], co: 'Tropa' },
    classico: { gen: ['General', 'General'], col: ['Coronel', 'Coronel'], cap: ['Capitão', 'Capitã'], co: 'Companhia' },
  };
  const TT = f => AR.TITLES[(f && f.civ) || 'classico'] || AR.TITLES.classico;
  AR.UNIT = {
    lanceiro: { name: 'Lanceiros', one: ['Lanceiro', 'Lanceira'], form: 'linha' },
    espadachim: { name: 'Espadachins', one: ['Espadachim', 'Espadachim'], form: 'linha' },
    arqueiro: { name: 'Arqueiros', one: ['Arqueiro', 'Arqueira'], form: 'dispersa' },
    cavalaria: { name: 'Cavalaria', one: ['Cavaleiro', 'Amazona'], form: 'cunha' },
    elite: { name: 'Elite', one: null, form: 'linha' },
    milicia: { name: 'Milícia', one: ['Miliciano', 'Miliciana'], form: 'linha' },
  };
  AR.FORM = { linha: 'linha', falange: 'falange', parede: 'parede de escudos', cunha: 'cunha', testudo: 'tartaruga', dispersa: 'ordem dispersa', coluna: 'coluna' };
  AR.STRAT = {
    assalto: 'assalto frontal em linha',
    cerco: 'cerco: bloquear a cidade, cortar a comida e esperar a fome — ou uma brecha',
    multiplos: 'ataque por vários portões ao mesmo tempo, dividindo os defensores',
    pinca: 'pinça: o centro segura, a cavalaria cerca pelos flancos',
    guerrilha: 'guerrilha: queimar campos, roubar rebanhos, matar quem sai — e sumir',
    cunha: 'a cunha (svinfylking): os berserkers na ponta rompem a linha',
    testudo: 'a tartaruga: escudos fechados contra as flechas até o corpo a corpo',
    muralha: 'defender as muralhas: arqueiros no alto, óleo fervente nos portões',
    emboscada: 'emboscada na floresta: esperar escondidos e cair sobre o flanco',
    colina: 'segurar o alto da colina e deixar o inimigo subir cansado',
    rio: 'segurar o vau do rio: o inimigo atravessa devagar, com água pela cintura',
    campo: 'batalha campal diante da cidade',
  };

  // ------------------------------ helpers ------------------------------
  const dist = G.dist;
  const walk = (x, y) => W.inb(x, y) && W.walkableXY(x, y);
  function nearWalk(x, y, r) { if (walk(x, y)) return [x, y]; for (let k = 1; k <= 3; k++) for (let a = 0; a < 8; a++) { const q = [x + Math.cos(a / 8 * TAU) * k * (r || 0.5), y + Math.sin(a / 8 * TAU) * k * (r || 0.5)]; if (walk(q[0], q[1])) return q; } return null; }
  const H0 = () => G.Vg.H;
  // how much of a people goes to war: the state, the goal and the granary decide
  const LEVY = { tribo: 0.3, chefia: 0.36, reino: 0.42, imperio: 0.5, teocracia: 0.4, tirania: 0.55, conselho: 0.38, livre: 0.3 };
  AR.size = function (f, cands, set, opts, pe, defenders) {
    const warriors = cands.filter(c => c[1].role === 'guerreiro').length;
    const pop = G.Fac.pop(f.id);
    let share = (LEVY[f.gov] || 0.36) + pe.agg * 0.12 + (opts.goal === 'conquista' ? 0.08 : 0);
    let n = Math.max(warriors, Math.round(cands.length * share));
    // weapons from the forge arm the levy; without them it is a mob with clubs and sickles
    const armed = warriors + Math.floor((f.stock.armas || 0));
    if (n > armed) n = armed + Math.floor((n - armed) * (pe.agg > 0.6 || f.gov === 'tirania' ? 0.7 : 0.4));
    // an army eats: two meals a head for the campaign
    const food = f.stock.food; if (n * 2.5 > food) n = Math.max(Math.min(n, 6), Math.floor(food / 2.5));
    // keep a garrison at home
    n = Math.min(n, Math.max(4, Math.floor(pop * 0.45)));
    if (opts.size) n = opts.size;
    return Math.max(Math.min(4, cands.length), Math.min(n, 150, cands.length));
  };

  // ------------------------------ organizing a host ------------------------------
  let nextCo = 1;
  function unitFor(v, f, horses, fid0) {
    if (v.elite === 'carro') return 'cavalaria';
    if (v.elite) return 'elite';
    if (v.arm === 'arco') return 'arqueiro';
    if (v.role !== 'guerreiro') {
      if (!(v._armed)) return 'milicia';
      if (G.Civ.has(fid0, 'arco') && G.R() < ({ egipcio: 0.35, asteca: 0.3, nordico: 0.15 }[f.civ] || 0.2)) return 'arqueiro';
    }
    if (horses.n > 0 && f.civ !== 'asteca' && (v.courage > 0.55 || v.role === 'cavalarico') && G.R() < 0.5) { horses.n--; return 'cavalaria'; }
    const sword = G.Civ.has(fid0, 'ferro') || G.Civ.has(fid0, 'bronze');
    if (sword && G.R() < ({ romano: 0.7, nordico: 0.5, grego: 0.2 }[f.civ] || 0.3)) return 'espadachim';
    return 'lanceiro';
  }
  function formFor(kind, f) {
    if (kind === 'arqueiro') return 'dispersa';
    if (kind === 'cavalaria') return 'cunha';
    if (kind === 'milicia') return 'linha';
    if (f.civ === 'grego' && (kind === 'lanceiro' || kind === 'elite')) return 'falange';
    if (f.civ === 'nordico') return kind === 'elite' ? 'cunha' : 'parede';
    if (f.civ === 'romano') return 'linha';
    return 'linha';
  }
  AR.organize = function (b, members, f, enemy, set, from, opts) {
    const S = G.S; opts = opts || {};
    const horses = { n: G.Eco ? G.Eco.horses(f.id) : 0 };
    // weapons: each levy takes one from the armory
    for (const v of members) { v._armed = v.role === 'guerreiro'; if (!v._armed && (f.stock.armas || 0) >= 1) { f.stock.armas -= 1; v._armed = true; v._levy = true; } }
    const byKind = {};
    for (const v of members) { const k = unitFor(v, f, horses, f.id); v.unit = k; (byKind[k] || (byKind[k] = [])).push(v); }
    // the general: the ruler if at the head of the host, else the most feared warrior
    const ruler = S.villagers.get(f.leader);
    const gen = members.includes(ruler) ? ruler : members.slice().sort((a, c) => ((c.kills || 0) * 0.4 + c.courage + (c.role === 'guerreiro' ? 1 : 0) + c.age / 60) - ((a.kills || 0) * 0.4 + a.courage + (a.role === 'guerreiro' ? 1 : 0) + a.age / 60))[0];
    const A = b.army = { gen: gen.id, cos: [], phase: 'reunir', strat: null, t: 0, reports: [], killed: {}, lostGen: false, start: members.length, supply: 0 };
    let idx = 0;
    const order = ['elite', 'lanceiro', 'espadachim', 'milicia', 'arqueiro', 'cavalaria'];
    for (const kind of order) {
      const list = byKind[kind]; if (!list) continue;
      const per = kind === 'cavalaria' ? 10 : kind === 'arqueiro' ? 14 : 16;
      const nco = Math.ceil(list.length / per);
      for (let c = 0; c < nco; c++) {
        const ms = list.slice(c * per, (c + 1) * per); if (!ms.length) continue;
        const cap = ms.slice().sort((a, d) => (d.kills || 0) + d.courage * 2 - ((a.kills || 0) + a.courage * 2))[0];
        const co = { id: nextCo++, n: ++idx, kind, form: formFor(kind, f), members: ms.map(v => v.id), cap: cap.id, ax: b.rx, ay: b.ry, dir: 0, morale: kind === 'elite' ? 90 : kind === 'milicia' ? 55 : 72, order: 'seguir', path: null, pi: 0, start: ms.length, rout: false, wing: 'c', tx: null, ty: null, hidden: false };
        A.cos.push(co);
        for (const v of ms) { v.task.co = co.id; v.task.flag = v.id === cap.id; }
      }
    }
    // wings and their colonels in a big host
    const inf = A.cos.filter(c => c.kind !== 'arqueiro' && c.kind !== 'cavalaria');
    inf.forEach((c, k) => { c.wing = inf.length < 3 ? 'c' : k % 3 === 0 ? 'c' : k % 3 === 1 ? 'e' : 'd'; });
    A.cos.filter(c => c.kind === 'cavalaria').forEach((c, k) => { c.wing = k % 2 ? 'd' : 'e'; });
    A.cols = {};
    if (members.length >= 40) for (const w of ['e', 'd']) { const cs = A.cos.filter(c => c.wing === w); if (cs.length) A.cols[w] = cs[0].cap; }
    for (const v of members) { const t = v.task; t.army = true; }
    gen.task.flag = false; gen.task.general = true;
    // levied archers take up the bow
    for (const v of members) if (v.unit === 'arqueiro' && v.role !== 'guerreiro') { v.arm = 'arco'; v._bow = true; }
    // draw up on open ground outside the town, facing the enemy
    if (b.goal !== 'defesa' && from) { const dir = Math.atan2(set.cy - from.cy, set.cx - from.cx); const og = openGround(from.cx, from.cy, dir, (from.radius || 8) * 0.6 + 2, (from.radius || 8) + 7); if (og) { b.rx = og[0]; b.ry = og[1]; } }
    // the plan
    A.strat = opts.strat || chooseStrategy(b, f, enemy, set, from, members);
    applyStrategy(b, A, f);
    const T0 = TT(f);
    const kinds = Object.keys(byKind).map(k => `${byKind[k].length} ${AR.UNIT[k].name.toLowerCase()}`).join(', ');
    A.intro = `${f.name} reuniu um exército de ${members.length} (${kinds}) sob ${T0.gen[gen.g === 'f' ? 1 : 0].toLowerCase()} ${gen.name}. Plano: ${AR.STRAT[A.strat]}.`;
    return A;
  };

  // open ground to draw up a host: few trees, no buildings, room for the ranks
  function openGround(x, y, dir, r0, r1) {
    const S = G.S; let best = null, bs = -1;
    for (let k = 0; k < 36; k++) {
      const a = dir + G.rr(-1.2, 1.2), r = G.rr(r0, r1); const cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r;
      if (!walk(cx, cy)) continue;
      let sc = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const px = cx + dx, py = cy + dy; if (!W.inb(px, py)) continue; const i = W.idx(px, py); if (W.walkable(i) && !S.treeAt[i] && !S.occ[i]) sc++; }
      sc -= r * 0.15;
      if (sc > bs) { bs = sc; best = [cx, cy]; }
    }
    return best;
  }
  AR.openGround = openGround;
  // ------------------------------ reading the enemy and the ground ------------------------------
  function scout(set, f) {
    const S = G.S; let warriors = 0, adults = 0, archers = 0;
    for (const v of S.villagers.values()) { if (v.set !== set.id || v.captive || v.age < 16 || v.age >= 62) continue; adults++; if (v.role === 'guerreiro') { warriors++; if (v.arm === 'arco') archers++; } }
    const w = G.Siege && G.Siege.wallOf(set.id); const walls = !!(w && w.fac === set.fac && (w.done || w.built > w.tiles.length * 0.6));
    let towers = 0; for (const b of S.buildings.values()) if (b.set === set.id && b.built && b.type === 'torre') towers++;
    const en = G.Fac.get(set.fac);
    return { warriors, adults, archers, walls, towers, food: en ? en.stock.food : 0, pop: G.Village.pop(set.id), strength: warriors * 1.6 + (adults - warriors) * 0.7 };
  }
  // forest, hills and rivers between two points
  function terrain(ax, ay, bx, by) {
    const S = G.S; let forest = 0, river = 0, hill = null, hillH = 0; const n = Math.max(4, Math.ceil(dist(ax, ay, bx, by)));
    const h0 = W.tileH(W.idx(bx, by));
    for (let k = 0; k <= n; k++) {
      const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n; if (!W.inb(x, y)) continue; const i = W.idx(x, y);
      if (S.type[i] === T.RIVER) river++;
      let tr = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { if (W.inb(x + dx, y + dy) && S.treeAt[W.idx(x + dx, y + dy)]) tr++; }
      if (tr >= 7) forest++;
      const h = W.tileH(i) - h0; if (h > hillH && k > n * 0.3 && k < n * 0.9) { hillH = h; hill = [x, y]; }
    }
    return { forest: forest / (n + 1), river, hill: hillH > 1.4 ? hill : null, hillH };
  }
  function chooseStrategy(b, f, enemy, set, from, members) {
    const sc = scout(set, f); const pe = G.Politics.leaderPe(f);
    const cav = members.filter(v => v.unit === 'cavalaria').length / members.length;
    const arch = members.filter(v => v.unit === 'arqueiro').length / members.length;
    const ratio = members.length * 1.2 / Math.max(1, sc.strength);
    b.scout = sc;
    if (b.goal === 'massacre') return f.civ === 'nordico' ? 'cunha' : 'assalto';
    if (sc.walls && (ratio < 2.4 || b.goal === 'conquista') && f.stock.food > members.length * 3 && G.Civ.has(f.id, 'engenharia')) return 'cerco';
    if (sc.walls && ratio >= 1.4 && (set.radius || 8) >= 8) return 'multiplos';
    if (ratio < 0.8 && pe.agg < 0.8) return 'guerrilha';
    if (f.civ === 'nordico' && members.some(v => v.elite === 'berserker')) return 'cunha';
    if (f.civ === 'romano' && (sc.archers >= 3 || sc.towers >= 2)) return 'testudo';
    if (cav >= 0.14 || (f.civ === 'egipcio' && cav > 0.05)) return 'pinca';
    if (ratio > 1.6 && (set.radius || 8) >= 9) return 'multiplos';
    void arch;
    return 'assalto';
  }
  function applyStrategy(b, A, f) {
    if (A.strat === 'testudo') for (const c of A.cos) if (c.kind === 'lanceiro' || c.kind === 'espadachim' || c.kind === 'elite') c.form = 'testudo';
    if (A.strat === 'cunha') for (const c of A.cos) if (c.kind !== 'arqueiro') c.form = 'cunha';
    void f;
  }

  // ------------------------------ formations ------------------------------
  // local slot k of n: x across the front, y back from it
  function slotOf(form, k, n) {
    switch (form) {
      case 'coluna': { const w = 2; return [((k % w) - 0.5) * 0.55, Math.floor(k / w) * 0.55]; }
      case 'falange': case 'parede': case 'testudo': { const w = Math.max(3, Math.ceil(n / (form === 'testudo' ? Math.ceil(Math.sqrt(n)) : 3))); const sp = form === 'testudo' ? 0.42 : 0.46; return [((k % w) - (w - 1) / 2) * sp, Math.floor(k / w) * sp]; }
      case 'cunha': { let r = 0, c = k; while (c > r) { c -= r + 1; r++; } return [(c - r / 2) * 0.55, r * 0.5]; }
      case 'dispersa': { const w = Math.max(3, Math.ceil(n / 2)); return [((k % w) - (w - 1) / 2) * 0.95 + (Math.floor(k / w) % 2) * 0.45, Math.floor(k / w) * 0.9]; }
      default: { const w = Math.max(3, Math.ceil(n / 2)); return [((k % w) - (w - 1) / 2) * 0.55, Math.floor(k / w) * 0.6]; }
    }
  }
  function worldSlot(co, k, n, form) {
    const [lx, ly] = slotOf(form || co.form, k, n);
    const fx = Math.cos(co.dir), fy = Math.sin(co.dir);
    return [co.ax - fy * lx - fx * ly, co.ay + fx * lx - fy * ly];
  }

  // ------------------------------ moving companies ------------------------------
  function coGoto(co, x, y) {
    const p = W.findPath(co.ax, co.ay, x, y, false, 6000) || W.findPath(co.ax, co.ay, x, y, true, 6000);
    co.path = p; co.pi = 0; co.tx = x; co.ty = y;
    return !!p;
  }
  function coMove(co, dt, sp) {
    if (!co.path || co.pi >= co.path.length) return true;
    const p = co.path[co.pi]; const dx = p[0] - co.ax, dy = p[1] - co.ay; const d = Math.hypot(dx, dy);
    const st = sp * dt;
    if (d <= st) { co.ax = p[0]; co.ay = p[1]; co.pi++; }
    else { co.ax += dx / d * st; co.ay += dy / d * st; }
    if (d > 0.05) { const a = Math.atan2(dy, dx); co.dir = turn(co.dir, a, dt * 2.5); }
    return co.pi >= co.path.length;
  }
  function turn(a, b, k) { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return a + Math.max(-k, Math.min(k, d)); }
  function members(co) { const S = G.S; const out = []; for (const id of co.members) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'band' && v.task.co === co.id) out.push(v); } return out; }
  function centroid(list) { let x = 0, y = 0; for (const v of list) { x += v.x; y += v.y; } return list.length ? [x / list.length, y / list.length] : null; }

  // ------------------------------ the host, every half second ------------------------------
  AR.bandTick = function (b, dt, set, f, en) {
    const A = b.army; if (!A) return false;
    const S = G.S;
    A.t += dt;
    // companies lose the dead and the fled
    for (const co of A.cos) co.alive = members(co);
    A.cos = A.cos.filter(co => co.alive.length > 0);
    const gen = S.villagers.get(A.gen);
    if (!gen || !gen.task || gen.task.type !== 'band') {
      if (!A.lostGen) { A.lostGen = true; for (const co of A.cos) co.morale -= 18; const who = S.dead.get(A.gen); if (who) { A.reports.push(`${TT(f).gen[who.g === 'f' ? 1 : 0]} ${who.name} tombou`); log(`${TT(f).gen[who.g === 'f' ? 1 : 0]} ${who.name}, que comandava o exército de ${f.name}, tombou em combate. O exército vacila.`, 'war', who.x, who.y); } }
      // the bravest captain takes command
      const cap = A.cos.map(c => S.villagers.get(c.cap)).filter(v => v && v.task && v.task.type === 'band')[0]; if (cap) { A.gen = cap.id; cap.task.general = true; cap.task.flag = false; A.lostGen = false; }
    }
    // the rout: frightened companies run for home
    for (const co of A.cos) {
      if (b.st === 'retorno') break;
      if (!co.rout && co.morale < 16 && co.kind !== 'elite' && !(f.civ === 'nordico' && co.alive.some(v => v.elite === 'berserker'))) {
        co.rout = true; A.routed = (A.routed || 0) + 1;
        const c0 = centroid(co.alive);
        if (c0) log(`${nameCo(co, f)} de ${f.name} quebrou e fugiu!`, 'war', c0[0], c0[1]);
      }
      if (!co.rout) co.morale = Math.min(co.kind === 'elite' ? 100 : 90, co.morale + dt * (gen && co.alive.length && dist(gen.x, gen.y, co.ax, co.ay) < 8 ? 0.8 : 0.3));
    }
    const standing = A.cos.filter(c => !c.rout);
    if (b.st !== 'retorno' && (standing.length === 0 || (A.cos.length >= 2 && standing.length / A.cos.length < 0.4))) {
      b.st = 'retorno'; b.t = 0; b.retreat = true;
      const where = set ? set.name : 'o campo';
      log(`O exército de ${f.name} foi desbaratado diante de ${where}${A.routed ? ` — ${A.routed} ${A.routed > 1 ? 'companhias fugiram' : 'companhia fugiu'}` : ''}.`, 'war', set ? set.cx : undefined, set ? set.cy : undefined);
      if (en) en.st.battles++;
      return true;
    }
    if (b.goal === 'defesa') return defenseTick(b, A, dt, set, f);
    return attackTick(b, A, dt, set, f, en);
  };
  function nameCo(co, f) { return `${co.n}ª ${TT(f).co} (${AR.UNIT[co.kind].name.toLowerCase()})`; }

  // enemies close to a point
  function enemiesNear(fac, x, y, r) {
    const out = []; const r2 = r * r;
    for (const o of G.War.fighters) { if (o.captive || !G.Fac.atWar(fac, fid(o))) continue; if (G.dist2(o.x, o.y, x, y) < r2) out.push(o); }
    return out;
  }
  // an enemy host in the field?
  function enemyHost(b) {
    for (const o of G.War.bands.values()) {
      if (o === b || !o.army || !G.Fac.atWar(b.fac, o.fac)) continue;
      if (o.army.strat === 'muralha' && o.army.phase !== 'batalha') continue; // behind the walls: no field battle to be had
      const g = G.S.villagers.get(o.army.gen); const me = G.S.villagers.get(b.army.gen);
      if (g && me && dist(g.x, g.y, me.x, me.y) < 16) return o;
    }
    return null;
  }

  // ------------------------------ the attacker's plan ------------------------------
  function attackTick(b, A, dt, set, f, en) {
    const S = G.S; const gen = S.villagers.get(A.gen);
    if (!set || b.st === 'retorno') return false; // the old ways: plunder, captives, the road home
    // meeting an enemy host in the open: form the battle line
    const foeHost = (b.st === 'marcha' || b.st === 'reunir') ? enemyHost(b) : null;
    if (foeHost && A.phase !== 'batalha') { A.phase = 'batalha'; A.bt = 0; A.foeHost = foeHost.id; deploy(b, A, f, foeHost); const g2 = S.villagers.get(foeHost.army.gen); log(`${f.name} e ${G.Fac.get(foeHost.fac).name} formam linhas de batalha perto de ${G.Village.nearSettlementName(gen.x, gen.y) || 'os ermos'}.`, 'battle', gen.x, gen.y); void g2; }
    if (A.phase === 'batalha') { battleTick(b, A, dt, f); return true; }
    switch (b.st) {
      case 'reunir': {
        if (A.phase !== 'reunir') break;
        if (!A.drawn) { A.drawn = true; drawUp(b, A, b.rx, b.ry, Math.atan2(set.cy - b.ry, set.cx - b.rx)); }
        let near = 0, tot = 0; for (const co of A.cos) for (const v of co.alive) { tot++; if (dist(v.x, v.y, b.rx, b.ry) < 6) near++; }
        if ((near >= tot * 0.8 && A.t > 8) || A.t > 40) {
          b.st = 'marcha'; b.t = 0; A.phase = 'marcha';
          log(A.intro, 'army', b.rx, b.ry);
          G.UI && G.UI.notice(`${f.name} marcha contra ${set.name} com ${tot} soldados!`, 'war');
          G.Audio && G.Audio.at(b.rx, b.ry, 'horn', true);
          startMarch(b, A, set);
        }
        return true;
      }
      case 'marcha': {
        marchTick(b, A, dt);
        const lead = gen || A.cos[0].alive[0];
        const R = (set.radius || 8) + (A.strat === 'cerco' ? 6 : A.strat === 'multiplos' ? 5 : 3);
        if (dist(lead.x, lead.y, set.cx, set.cy) < R || b.t > 170) {
          b.st = 'ataque'; b.t = 0; b.reached = true;
          set.alarmT = 30; set.attacked = (set.attacked || 0) + 1;
          if (G.UI && (G.UI.viewFac === b.enemy || G.UI.viewFac === b.fac)) G.UI.notice(`${set.name} está sendo atacada por ${f.name}!`, 'war');
          G.Audio && G.Audio.at(set.cx, set.cy, 'horn', true);
          A.phase = A.strat === 'cerco' ? 'cerco' : A.strat === 'multiplos' ? 'cercar' : A.strat === 'guerrilha' ? 'guerrilha' : 'assalto';
          if (A.phase === 'cerco' || A.phase === 'cercar') ringUp(b, A, set, A.phase === 'cerco' ? (set.radius || 8) + 7 : (set.radius || 8) + 2.5); // the camps stay out of bowshot
          if (A.phase === 'cerco') { startSiege(b, A, set, f); }
          if (A.phase === 'guerrilha') A.gT = 0;
          if (A.phase === 'assalto') { A.aT = 0; deployAt(b, A, set); }
        }
        return true;
      }
      case 'ataque': {
        set.alarmT = Math.max(set.alarmT || 0, 5);
        if (A.phase === 'cerco') return siegeTick(b, A, dt, set, f, en);
        if (A.phase === 'cercar') {
          // companies take their gates; then everyone goes in at once
          let ready = 0; for (const co of A.cos) { coMove(co, dt, 0.9); if (!co.path || co.pi >= co.path.length) ready++; }
          A.cT = (A.cT || 0) + dt;
          if (ready >= A.cos.length || A.cT > 22) { A.phase = 'invadir'; log(`${f.name} ataca ${set.name} por ${A.cos.length > 3 ? 'todos os lados' : 'vários lados'} ao mesmo tempo!`, 'battle', set.cx, set.cy); }
          return false; // soldiers still fight whoever comes, via the old machine
        }
        if (A.phase === 'guerrilha') return guerrillaTick(b, A, dt, set, f, en);
        if (A.phase === 'assalto') { A.aT = (A.aT || 0) + dt; for (const co of A.cos) coMove(co, dt, 0.8); if (A.aT > 10) A.phase = 'invadir'; return false; }
        return false; // 'invadir': the band's own machinery (gates, plunder, captives, fire, conquest)
      }
    }
    return false;
  }
  // the host drawn up in ranks at a point, facing a direction
  function drawUp(b, A, x, y, dir) {
    const inf = A.cos.filter(c => c.kind !== 'arqueiro' && c.kind !== 'cavalaria');
    const arc = A.cos.filter(c => c.kind === 'arqueiro'), cav = A.cos.filter(c => c.kind === 'cavalaria');
    const fx = Math.cos(dir), fy = Math.sin(dir); const lx = -fy, ly = fx;
    const place = (co, across, back) => { const p = nearWalk(x + lx * across - fx * back, y + ly * across - fy * back, 0.6) || [x, y]; co.ax = p[0]; co.ay = p[1]; co.dir = dir; co.path = null; };
    inf.forEach((co, k) => place(co, (k - (inf.length - 1) / 2) * 3.2, 0));
    arc.forEach((co, k) => place(co, (k - (arc.length - 1) / 2) * 4, 2.6));
    cav.forEach((co, k) => place(co, (k % 2 ? 1 : -1) * ((inf.length / 2) * 3.2 + 2.5), 0.5));
  }
  function startMarch(b, A, set) {
    const S = G.S; const gen = S.villagers.get(A.gen);
    A.trail = [];
    const dest = [b.tx, b.ty];
    A.march = dest;
    if (gen) { gen.path = null; }
    for (const co of A.cos) { co.form = 'coluna'; co.path = null; }
    void set;
  }
  // on the road: the general walks, the companies follow his footsteps in column
  function marchTick(b, A, dt) {
    const S = G.S; const gen = S.villagers.get(A.gen); if (!gen) return;
    const last = A.trail[A.trail.length - 1];
    if (!last || dist(last[0], last[1], gen.x, gen.y) > 0.4) { A.trail.push([gen.x, gen.y]); if (A.trail.length > 400) A.trail.splice(0, 100); }
    let back = 3;
    for (const co of A.cos) {
      const idx = Math.max(0, A.trail.length - 1 - Math.round(back)); back += Math.ceil(co.alive.length / 2) * 0.55 / 0.4 + 3;
      const p = A.trail[idx] || [gen.x, gen.y]; const q = A.trail[Math.max(0, idx - 2)] || p;
      co.ax = p[0]; co.ay = p[1]; if (dist(p[0], p[1], q[0], q[1]) > 0.1) co.dir = Math.atan2(p[1] - q[1], p[0] - q[0]);
    }
  }
  // battle line against a host in the field
  function deploy(b, A, f, foe) {
    const S = G.S; const g = S.villagers.get(A.gen); const eg = S.villagers.get(foe.army.gen);
    if (!g || !eg) return;
    const dir = Math.atan2(eg.y - g.y, eg.x - g.x);
    const mid = [g.x + Math.cos(dir) * 2, g.y + Math.sin(dir) * 2];
    drawUp(b, A, mid[0], mid[1], dir);
    for (const co of A.cos) { co.form = formFor(co.kind, f); if (A.strat === 'testudo' && co.kind !== 'arqueiro' && co.kind !== 'cavalaria') co.form = 'testudo'; if (A.strat === 'cunha' && co.kind !== 'arqueiro') co.form = 'cunha'; co.order = co.kind === 'arqueiro' ? 'segurar' : 'avancar'; }
    // the pincer: cavalry rides wide around the flanks
    if (A.strat === 'pinca') for (const co of A.cos) if (co.kind === 'cavalaria') { co.order = 'flanquear'; const side = co.wing === 'e' ? 1 : -1; const fx = Math.cos(dir), fy = Math.sin(dir); const tx = eg.x - fy * side * 6 + fx * 2, ty = eg.y + fx * side * 6 + fy * 2; const p = nearWalk(tx, ty, 0.8); if (p) coGoto(co, p[0], p[1]); }
  }
  // before the gates: a line in front of the town
  function deployAt(b, A, set) {
    const S = G.S; const g = S.villagers.get(A.gen); if (!g) return;
    const dir = Math.atan2(set.cy - g.y, set.cx - g.x);
    const R = (set.radius || 8) * 0.9;
    const x = set.cx - Math.cos(dir) * R, y = set.cy - Math.sin(dir) * R;
    drawUp(b, A, x, y, dir);
    for (const co of A.cos) { co.form = formFor(co.kind, G.Fac.get(b.fac)); co.order = 'avancar'; }
  }
  // around the town: camps (siege) or assault points (several gates)
  function ringUp(b, A, set, R) {
    const n = A.cos.length; const a0 = G.R() * TAU;
    A.cos.forEach((co, k) => {
      const a = a0 + k / n * TAU; let p = null;
      for (let r = R; r >= R - 3 && !p; r -= 0.5) p = nearWalk(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 0.7);
      if (p) { coGoto(co, p[0], p[1]); co.camp = p; co.dir = Math.atan2(set.cy - p[1], set.cx - p[0]); }
      co.form = co.kind === 'arqueiro' ? 'dispersa' : 'linha';
    });
  }

  // ------------------------------ the field battle ------------------------------
  function battleTick(b, A, dt, f) {
    const S = G.S; A.bt += dt;
    const foe = G.War.bands.get(A.foeHost);
    const eg = foe && foe.army ? S.villagers.get(foe.army.gen) : null;
    const g = S.villagers.get(A.gen);
    const ref = g || (A.cos[0] && A.cos[0].alive[0]);
    const close = ref ? enemiesNear(b.fac, ref.x, ref.y, 16) : [];
    // the battle is over when the field is empty of enemies
    if (!close.length) { A.quietB = (A.quietB || 0) + dt; } else A.quietB = 0;
    if (A.quietB > 5 || A.bt > 140) {
      A.phase = b.goal === 'defesa' ? 'posicao' : 'marcha';
      if (foe && (foe.st === 'retorno' || !G.War.bands.has(foe.id))) { const where = ref ? G.Village.nearSettlementName(ref.x, ref.y) : null; A.reports.push(`venceu a batalha${where ? ' de ' + where : ''}`); log(`${f.name} venceu a batalha${where ? ' de ' + where : ''}: o inimigo abandonou o campo.`, 'battle', ref ? ref.x : undefined, ref ? ref.y : undefined); }
      for (const co of A.cos) { co.form = b.goal === 'defesa' ? formFor(co.kind, f) : 'coluna'; co.order = 'seguir'; }
      if (b.goal !== 'defesa') { A.trail = ref ? [[ref.x, ref.y]] : []; }
      return;
    }
    for (const co of A.cos) {
      if (co.rout) continue;
      const c0 = centroid(co.alive) || [co.ax, co.ay];
      const en = enemiesNear(b.fac, c0[0], c0[1], 14);
      if (co.order === 'flanquear') { if (coMove(co, dt, 1.4) || !co.path) co.order = 'carregar'; continue; }
      if (!en.length) { if (eg && co.kind !== 'arqueiro') { const d = dist(co.ax, co.ay, eg.x, eg.y); if (d > 1.5) { const k = Math.min(1, dt * 0.8 / d); const nx = co.ax + (eg.x - co.ax) * k, ny = co.ay + (eg.y - co.ay) * k; if (walk(nx, ny)) { co.ax = nx; co.ay = ny; } co.dir = turn(co.dir, Math.atan2(eg.y - co.ay, eg.x - co.ax), dt); } } continue; }
      const ec = centroid(en);
      co.dir = turn(co.dir, Math.atan2(ec[1] - co.ay, ec[0] - co.ax), dt * 1.5);
      if (co.kind === 'arqueiro' && co.order === 'segurar') continue;
      // advance in formation until the lines meet, then it is every soldier for the fight
      const d = dist(co.ax, co.ay, ec[0], ec[1]);
      if (d > 1.2) { const sp = (co.order === 'carregar' || co.kind === 'cavalaria' ? 1.6 : co.form === 'testudo' ? 0.55 : 0.85) * dt; const nx = co.ax + (ec[0] - co.ax) / d * sp, ny = co.ay + (ec[1] - co.ay) / d * sp; if (walk(nx, ny)) { co.ax = nx; co.ay = ny; } }
    }
  }

  // ------------------------------ siege and starvation ------------------------------
  function startSiege(b, A, set, f) {
    const S = G.S;
    A.siege = { t: 0, set: set.id, assault: 0, corpses: 0, oil: 0, surrender: false };
    // the town lives on what it has inside the walls
    const en = G.Fac.get(set.fac);
    const share = en ? Math.min(0.9, G.Village.pop(set.id) / Math.max(1, G.Fac.pop(en.id))) : 0.5;
    const food = en ? Math.floor(en.stock.food * share) : 0;
    if (en) en.stock.food -= food;
    set.larder = { food, by: b.id, fac: b.fac, since: S.day, start: food };
    log(`${f.name} cercou ${set.name} e cavou trincheiras em volta. Ninguém entra, ninguém sai: ${Math.round(food)} de comida dentro dos muros.`, 'siege', set.cx, set.cy);
    G.UI && G.UI.notice(`Cerco a ${set.name}!`, 'siege');
    A.trench = { x: set.cx, y: set.cy, r: (set.radius || 8) + 6, set: set.id };
  }
  function endSiege(set, how) {
    const L = set.larder; if (!L) return;
    const en = G.Fac.get(set.fac); if (en && L.food > 0) en.stock.food += L.food;
    set.larder = null;
    void how;
  }
  AR.endSiege = endSiege;
  function siegeTick(b, A, dt, set, f, en) {
    const S = G.S; const sg = A.siege; if (!sg) return false;
    sg.t += dt;
    const L = set.larder;
    for (const co of A.cos) coMove(co, dt, 0.9);
    // the besieged starve: people inside eat from the larder only
    if (L && L.food <= 0) { sg.hungry = (sg.hungry || 0) + dt; }
    // disease: catapulting the dead over the walls
    const cruel = G.Politics.leaderPe(f).cru;
    if (b.engines && b.engines.some(e => e.kind === 'catapulta') && sg.t > 40 && !sg.plagued && cruel > 0.45 && (G.War.battles.length || b.lost > 0 || G.R() < 0.3)) {
      sg.plagued = true; sg.corpses++;
      const cat = b.engines.find(e => e.kind === 'catapulta');
      S.missiles.push({ x0: cat.x, y0: cat.y, x1: set.cx + G.rr(-1.5, 1.5), y1: set.cy + G.rr(-1.5, 1.5), t: 0, dur: 1.6, wall: -1, b: 0, fac: b.fac, corpse: true });
      A.reports.push('catapultou cadáveres para dentro dos muros');
      log(`Os sitiantes de ${f.name} catapultaram cadáveres por cima dos muros de ${set.name}. A peste vai se espalhar.`, 'plague', set.cx, set.cy);
    }
    // a breach, or a starving town: the assault
    const w = G.Siege && G.Siege.wallOf(set.id);
    const breach = w && w.tiles.some(i => !S.wall[i]) && w.built >= w.tiles.length;
    const starving = L && L.food <= 0 && sg.hungry > 30;
    // surrender: hunger and hopelessness open the gates
    if (starving && !sg.surrender && G.R() < dt * 0.05) {
      sg.surrender = true; endSiege(set, 'rendicao');
      log(`${set.name}, faminta, abriu os portões e se rendeu a ${f.name}.`, 'siege', set.cx, set.cy);
      if (b.goal === 'conquista' || b.goal === 'captura') { G.War.conquer(set, b); return true; }
      // tribute instead
      if (en) { const k = Math.min(en.stock.moedas || 0, 40); en.stock.moedas -= k; f.stock.moedas = (f.stock.moedas || 0) + k; b.loot.food += 0; }
      b.st = 'retorno'; b.t = 0; return true;
    }
    if ((breach || starving || sg.t > 150) && !sg.assault) {
      sg.assault = 1; A.phase = 'invadir'; endSiege(set, 'assalto');
      log(`${breach ? 'Pela brecha nos muros' : starving ? 'Com a cidade morrendo de fome' : 'Cansados de esperar'}, os sitiantes de ${f.name} lançam o assalto a ${set.name}!`, 'battle', set.cx, set.cy);
      return false;
    }
    return false; // soldiers keep to their camps, but fight anyone who comes out (old machine)
  }
  // ------------------------------ guerrilla: cut the enemy off from the land ------------------------------
  function guerrillaTick(b, A, dt, set, f, en) {
    const S = G.S; A.gT += dt;
    if (A.gT > 70) { b.st = 'retorno'; b.t = 0; log(`Os guerrilheiros de ${f.name} somem nas matas depois de devastar os arredores de ${set.name}${b.burned ? ` (${b.burned} campos queimados)` : ''}.`, 'war', set.cx, set.cy); return true; }
    // burn the fields, drive off the herds
    for (const co of A.cos) {
      if (!co.gTarget || !S.buildings.has(co.gTarget)) {
        const tg = [...S.buildings.values()].filter(o => o.set === set.id && o.built && (o.type === 'farm' || o.type === 'curral') && !(S.fire[W.idx(o.x, o.y)] > 0)).sort((p, q) => dist(p.x, p.y, co.ax, co.ay) - dist(q.x, q.y, co.ax, co.ay))[0];
        if (!tg) continue; co.gTarget = tg.id; coGoto(co, tg.x + tg.w / 2, tg.y + tg.h / 2); co.gT = 0;
      }
      const tg = S.buildings.get(co.gTarget);
      if (coMove(co, dt, 1.1)) {
        co.gT = (co.gT || 0) + dt;
        if (co.gT > 4 && tg) {
          if (tg.type === 'farm') { G.Nature.ignite(W.idx(tg.x + 1, tg.y + 1), 0.8); b.burned++; }
          else if (G.Eco) { const herd = G.Eco.penAnimals(tg).filter(a => a.state === 'pen'); const lead = co.alive[0]; for (const a of herd.slice(0, 4)) { a.state = 'led'; a.ledBy = lead ? lead.id : 0; a.stolen = b.fac; } b.stolen = (b.stolen || 0) + Math.min(4, herd.length); }
          co.gTarget = 0;
        }
      }
    }
    void en;
    return false;
  }

  // ------------------------------ defending the homeland ------------------------------
  // a host marching on a town raises its defenders under their own general
  const RECALL = { hide: 1, flee: 1, combat: 1, shelter: 1, fest: 1 };
  AR.defend = function (att) {
    const S = G.S; const set = S.settlements.get(att.set); if (!set) return null;
    const f = G.Fac.get(set.fac); if (!f || !f.alive) return null;
    for (const o of G.War.bands.values()) if (o.fac === f.id && o.goal === 'defesa' && o.set === set.id) return o;
    const cands = [];
    // the kingdom's own host marches to the rescue: the whole region is levied
    const near = new Set(); for (const o of S.settlements.values()) if (o.fac === f.id && dist(o.cx, o.cy, set.cx, set.cy) < 55) near.add(o.id);
    for (const v of S.villagers.values()) {
      if (!near.has(v.set) || v.captive || v.age < 16 || v.age >= 58 || v.hp < 50 || v.preg > 0 || v.held || v.air || v.aboard) continue;
      // those hiding or running are called back to the ranks
      if (v.task && (v.task.type === 'band' || (v.task.pri >= 4 && !RECALL[v.task.type]))) continue;
      const w = v.role === 'guerreiro' ? 3 : (v.role === 'cacador' ? 1.5 : 0) + v.courage;
      cands.push([w, v]);
    }
    cands.sort((a, c) => c[0] - a[0]);
    const warriors = cands.filter(c => c[1].role === 'guerreiro').length;
    // those of the threatened town first, then the nearest from the region
    cands.sort((a, c) => (a[1].set === set.id ? -2 : 0) + dist(a[1].x, a[1].y, set.cx, set.cy) / 30 - a[0] * 0.3 - ((c[1].set === set.id ? -2 : 0) + dist(c[1].x, c[1].y, set.cx, set.cy) / 30 - c[0] * 0.3));
    const attN = att.members.length;
    let n = Math.max(warriors, Math.round(cands.length * 0.4), Math.min(cands.length, Math.round(attN * 1.1)));
    n = Math.min(n, 140, cands.length);
    if (n < 4) return null;
    const ms = cands.slice(0, n).map(c => c[1]);
    const en = G.Fac.get(att.fac);
    const b = G.War.makeBand(f, en, set, ms, 'defesa', { from: set.id });
    b.st = 'reunir'; b.rx = set.cx; b.ry = set.cy; b.defOf = att.id;
    const A = AR.organize(b, ms, f, en, set, set, {});
    // the defenders' plan: the walls, the forest, the hill, the river — or the open field
    const gA = S.villagers.get(att.army.gen) || S.villagers.get(att.members[0]);
    const from = gA ? [gA.x, gA.y] : [set.cx + 10, set.cy];
    const w = G.Siege && G.Siege.wallOf(set.id); const walls = !!(w && w.fac === set.fac && (w.done || w.built > w.tiles.length * 0.6));
    const tr = terrain(set.cx, set.cy, from[0], from[1]);
    const dir = Math.atan2(from[1] - set.cy, from[0] - set.cx);
    let strat = 'campo', pos = null;
    if (walls) { strat = 'muralha'; pos = [set.cx, set.cy]; }
    else if (tr.forest > 0.25 && ms.length < att.members.length * 1.2) { strat = 'emboscada'; pos = forestSpot(set, dir); if (!pos) strat = 'campo'; }
    if (strat === 'campo' && tr.hill) { strat = 'colina'; pos = nearWalk(tr.hill[0], tr.hill[1], 0.8); }
    if (strat === 'campo' && tr.river > 0) { strat = 'rio'; pos = riverSpot(set, dir); if (!pos) strat = 'campo'; }
    if (!pos) { const R = (set.radius || 8) + 2; pos = nearWalk(set.cx + Math.cos(dir) * R, set.cy + Math.sin(dir) * R, 0.8) || [set.cx, set.cy]; }
    A.strat = strat; A.pos = pos; A.dir = dir; A.phase = 'reunir';
    const T0 = TT(f); const g = S.villagers.get(A.gen);
    log(`${set.name} se prepara: ${ms.length} defensores sob ${T0.gen[g && g.g === 'f' ? 1 : 0].toLowerCase()} ${g ? g.name : '?'}. Plano: ${AR.STRAT[strat]}.`, 'army', set.cx, set.cy);
    return b;
  };
  function forestSpot(set, dir) {
    const S = G.S; let best = null, bs = 0;
    for (let k = 0; k < 30; k++) {
      const a = dir + G.rr(-0.9, 0.9), r = G.rr(5, 12); const x = set.cx + Math.cos(a) * r, y = set.cy + Math.sin(a) * r;
      if (!walk(x, y)) continue;
      let tr = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (W.inb(x + dx, y + dy) && S.treeAt[W.idx(x + dx, y + dy)]) tr++;
      if (tr > bs) { bs = tr; best = [x, y]; }
    }
    return bs >= 6 ? best : null;
  }
  function riverSpot(set, dir) {
    const S = G.S;
    for (let r = 2; r < 14; r += 0.5) { const x = set.cx + Math.cos(dir) * r, y = set.cy + Math.sin(dir) * r; if (!W.inb(x, y)) break; if (S.type[W.idx(x, y)] === T.RIVER) { const bx = set.cx + Math.cos(dir) * (r - 1.2), by = set.cy + Math.sin(dir) * (r - 1.2); return nearWalk(bx, by, 0.6); } }
    return null;
  }
  function defenseTick(b, A, dt, set, f) {
    const S = G.S;
    const att = G.War.bands.get(b.defOf);
    // the threat is gone: back to work
    if (!att || att.st === 'retorno' || !set || set.fac !== b.fac) {
      A.idle = (A.idle || 0) + dt;
      if (A.idle > 6 && A.phase !== 'batalha') { if (att && att.st === 'retorno' && !A.won) { A.won = true; if (set) set.victory = S.day; log(`${set ? set.name : 'A cidade'} resistiu: o inimigo recuou diante dos defensores de ${f.name}.`, 'battle', set ? set.cx : undefined, set ? set.cy : undefined); } G.War.disband(b, true); return true; }
    } else A.idle = 0;
    const foeHost = enemyHost(b);
    if (foeHost && A.phase !== 'batalha' && A.strat !== 'muralha') { A.phase = 'batalha'; A.bt = 0; A.foeHost = foeHost.id; deploy(b, A, f, foeHost); for (const co of A.cos) { co.hidden = false; if (A.strat === 'emboscada') co.morale += 10; } if (A.strat === 'emboscada') { const eg = S.villagers.get(foeHost.army.gen); if (eg) log(`Emboscada! Os defensores de ${set.name} saem da floresta sobre o flanco de ${G.Fac.get(foeHost.fac).name}.`, 'battle', eg.x, eg.y); for (const c of foeHost.army.cos) c.morale -= 14; } }
    if (A.phase === 'batalha') { battleTick(b, A, dt, f); return true; }
    if (A.phase === 'reunir') {
      if (!A.drawn) { A.drawn = true; drawUp(b, A, set.cx, set.cy, A.dir); }
      A.rt = (A.rt || 0) + dt;
      if (A.rt > 6) {
        A.phase = 'posicao';
        if (A.strat === 'muralha') { // companies behind the gates
          const w = G.Siege && G.Siege.wallOf(set.id);
          const gates = w ? w.gates.slice() : [];
          A.cos.forEach((co, k) => { const i = gates[k % Math.max(1, gates.length)]; if (i === undefined) return; const gx = (i % N) + 0.5, gy = ((i / N) | 0) + 0.5; const a = Math.atan2(gy - set.cy, gx - set.cx); const p = nearWalk(gx - Math.cos(a) * 1.8, gy - Math.sin(a) * 1.8, 0.5); if (p) { coGoto(co, p[0], p[1]); co.dir = a; } });
        } else {
          const [px, py] = A.pos; const dir = A.dir;
          const fx = Math.cos(dir), fy = Math.sin(dir);
          A.cos.forEach((co, k) => { const across = (k - (A.cos.length - 1) / 2) * 3; const back = co.kind === 'arqueiro' ? 2.4 : 0; const p = nearWalk(px - fy * across - fx * back, py + fx * across - fy * back, 0.6) || [px, py]; coGoto(co, p[0], p[1]); co.dir = dir; co.hidden = A.strat === 'emboscada'; if (A.strat === 'rio' && co.kind === 'arqueiro') co.order = 'segurar'; });
        }
      }
      return true;
    }
    // holding the position; fighting whoever comes close (old machine does the blows)
    for (const co of A.cos) coMove(co, dt, 1);
    return true;
  }

  // ------------------------------ each soldier ------------------------------
  AR.runSoldier = function (v, t, b, dt, H) {
    const A = b.army; if (!A) return false;
    const co = A.cos.find(c => c.id === t.co);
    if (!co) return false;
    const S = G.S;
    // a routed company runs for home
    if (co.rout) {
      const home = S.settlements.get(b.from) || G.Fac.capitalOf(b.fac);
      if (!home) return false;
      v.act = 'run';
      if (!v.path || t.routTo !== home.id) { t.routTo = home.id; H.goto(v, home.cx + G.rr(-2, 2), home.cy + G.rr(-2, 2), false); }
      if (H.move(v, dt, 1.35) || dist(v.x, v.y, home.cx, home.cy) < 4) { if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, b.fac); v.carry = null; } H.end(v); }
      return true;
    }
    if (b.st === 'retorno') return false;
    const phase = A.phase;
    const k = co.members.indexOf(v.id); const n = co.members.length;
    // the general leads the march along a real road
    if (t.general && phase === 'marcha' && !t.foe) {
      if (!t.gpFor || t.gpFor !== b.tx + b.ty) { t.gpFor = b.tx + b.ty; if (!H.goto(v, b.tx, b.ty, false, N * N)) H.goto(v, b.tx, b.ty, true, N * N); }
      if (H.move(v, dt, 0.9)) v.moving = false;
      v.act = '';
      return true;
    }
    // in formation: fighting only whoever comes within reach of the ranks
    const formed = phase === 'reunir' || phase === 'marcha' || phase === 'posicao' || phase === 'cerco' || phase === 'cercar' || phase === 'assalto' || (phase === 'batalha' && co.order === 'flanquear') || co.hidden;
    const reach = co.kind === 'arqueiro' ? 6 : phase === 'batalha' ? 2.6 : co.hidden ? 1.2 : 1.8;
    t.scan = (t.scan || 0) - dt;
    if (t.scan <= 0) {
      t.scan = 0.4 + G.R() * 0.2;
      let best = 0, bd = reach * reach;
      for (const o of G.War.fighters) { if (o.captive || o.inside || o.air || o.held || !G.Fac.atWar(b.fac, fid(o))) continue; const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; best = o.id; } }
      if (!best && phase === 'cerco' && co.kind !== 'arqueiro' && k % 3 === 0) {
        // anyone of the enemy who ventures outside the walls near the camp
        for (const o of S.villagers.values()) { if (o.captive || o.inside || o.age < 14 || !G.Fac.atWar(b.fac, fid(o))) continue; const d = G.dist2(v.x, v.y, o.x, o.y); if (d < 36 && d < bd * 9) { bd = d; best = o.id; } }
      }
      t.foe = best;
    }
    const foe = t.foe ? S.villagers.get(t.foe) : null;
    if (foe && !foe.captive && G.Fac.atWar(b.fac, fid(foe)) && (!formed || dist(v.x, v.y, foe.x, foe.y) < reach + 0.6 || co.kind === 'arqueiro')) {
      if (t.general && (co.alive || co.members).length > 3 && dist(v.x, v.y, foe.x, foe.y) > 0.9 && phase !== 'invadir') { /* the general stays with the standard, behind the front rank */ }
      else { G.War.fightStep(v, t, foe, dt, H, b); return true; }
    }
    if (!formed && phase === 'batalha') {
      // the lines have met: close in on the nearest foe of the company's front
      const slot = worldSlot(co, k, n);
      steerTo(v, t, slot[0], slot[1], dt, H, co.kind === 'cavalaria' ? 1.6 : 1.1);
      v.act = '';
      return true;
    }
    if (phase === 'invadir') return false;
    if (b.st === 'retorno') return false;
    // take your place in the ranks
    const slot = worldSlot(co, k, n, phase === 'marcha' && !co.hidden ? 'coluna' : null);
    const arrived = steerTo(v, t, slot[0], slot[1], dt, H, phase === 'marcha' ? 1.05 : 1.2);
    if (arrived) {
      v.moving = false; G.faceTo(v, Math.cos(co.dir), Math.sin(co.dir));
      v.act = co.hidden ? 'sneak' : phase === 'cerco' ? (k % 5 === 0 ? 'dig' : k % 3 === 0 ? 'sit' : 'guard') : t.general && phase === 'reunir' ? 'talk' : 'guard';
      if (phase === 'cerco' && k % 5 === 0 && G.R() < dt * 0.4) G.FX && G.FX.chips(v.x, v.y, '#7a5a3a');
    }
    return true;
  };
  // straight to the slot when the way is open; A* only when stuck
  function steerTo(v, t, x, y, dt, H, mul) {
    const d = dist(v.x, v.y, x, y);
    if (d < 0.18) { v.moving = false; v.path = null; return true; }
    if (t.pathTo && (t.pathT || 0) > 0) { t.pathT -= dt; if (H.move(v, dt, mul)) t.pathTo = null; return false; }
    const sp = v.speed * mul * dt; const k = Math.min(1, sp / d);
    const nx = v.x + (x - v.x) * k, ny = v.y + (y - v.y) * k;
    if (walk(nx, ny) && (d < 6 || (W.losClear && W.losClear(v.x, v.y, x, y)))) {
      v.x = nx; v.y = ny; v.path = null; if (Math.abs(x - v.x) + Math.abs(y - v.y) > 0.02) G.faceTo(v, x - v.x, y - v.y); v.walkPh += sp * 8.5; v.moving = true; t.stuck = 0; return d <= sp;
    }
    t.stuck = (t.stuck || 0) + dt;
    if (t.stuck > 0.4) { t.stuck = 0; const p = nearWalk(x, y, 0.5) || [x, y]; if (H.goto(v, p[0], p[1], false, 3000)) { t.pathTo = true; t.pathT = 2.5; } }
    return false;
  }

  // ------------------------------ the blows: flanks, formations, weapons ------------------------------
  function coOf(v) { const t = v.task; if (!t || t.type !== 'band' || !t.co) return null; const b = G.War.bands.get(t.band); if (!b || !b.army) return null; return b.army.cos.find(c => c.id === t.co) || null; }
  // a company holds its ranks only while it is formed: in the streets of a sacked town there are no flanks
  const FORMED = { batalha: 1, posicao: 1, assalto: 1, cerco: 1, cercar: 1, marcha: 1, reunir: 1 };
  function inRanks(v, co) { const b = G.War.bands.get(v.task.band); return !!b && b.st !== 'retorno' && FORMED[b.army.phase] && G.dist(v.x, v.y, co.ax, co.ay) < 5; }
  AR.coOf = coOf;
  AR.dmgMul = function (v, o, ranged) {
    let m = 1;
    const cv = coOf(v), co = coOf(o);
    const uv = v.unit, uo = o.unit;
    if (!ranged) {
      if (uv === 'lanceiro' && uo === 'cavalaria') m *= 1.6;
      if (uv === 'cavalaria' && (uo === 'lanceiro' && co && (co.form === 'falange' || co.form === 'parede'))) m *= 0.65;
      else if (uv === 'cavalaria') m *= v.task && v.task.charged ? 1.3 : 1.9;
      if (uv === 'cavalaria' && v.task) v.task.charged = true;
      if (uv === 'espadachim' && uo === 'lanceiro') m *= 1.15;
      if (uv === 'arqueiro') m *= 0.6;
      if (uv === 'milicia') m *= 0.72;
      if (cv && cv.form === 'cunha' && cv.order !== 'segurar') m *= 1.2;
    } else {
      if (co && co.form === 'testudo') m *= 0.3;
      else if (co && co.form === 'dispersa') m *= 0.7;
      if (G.S.treeAt[W.idx(o.x, o.y)]) m *= 0.65;
    }
    if (uo === 'milicia') m *= 1.15;
    // the flank and the back: facing is the company's front
    if (co && !co.rout && inRanks(o, co)) {
      const dx = v.x - o.x, dy = v.y - o.y; const a = Math.atan2(dy, dx);
      let d = Math.abs(a - co.dir); while (d > Math.PI) d = Math.abs(d - TAU);
      if (d > 2.1) { m *= 1.6; co.morale -= 1.2; } else if (d > 1.1) { m *= 1.3; co.morale -= 0.6; }
      else if (co.form === 'falange' || co.form === 'parede' || co.form === 'testudo') m *= 0.72;
    }
    // high ground
    const hv = W.tileH(W.idx(v.x, v.y)), ho = W.tileH(W.idx(o.x, o.y));
    if (hv - ho > 0.8) m *= ranged ? 1.25 : 1.15; else if (ho - hv > 0.8) m *= 0.85;
    // wading through a river
    if (G.S.type[W.idx(o.x, o.y)] === T.RIVER) m *= 1.25;
    if (cv) m *= 0.6 + cv.morale / 200;
    return m;
  };
  // a death in the ranks shakes the company; a kill steadies it
  AR.onDeath = function (v, killer) {
    const co = coOf(v); if (co) co.morale -= co.kind === 'elite' ? 2 : 3.5;
    const kc = killer && coOf(killer); if (kc) kc.morale = Math.min(100, kc.morale + 1.2);
  };

  // ------------------------------ the war councils, twice a second ------------------------------
  let tick = 0;
  AR.update = function (dt) {
    tick += dt; if (tick < 0.5) return; tick = 0;
    // hosts marching on a town wake its defenders
    for (const b of [...G.War.bands.values()]) {
      if (!b.army || b.goal === 'defesa' || b.defRaised) continue;
      // scouts see the host set out: the town has the length of the march to get ready
      if (b.st !== 'marcha' && b.st !== 'ataque') continue;
      const set = G.S.settlements.get(b.set); if (!set) continue;
      b.defRaised = true; AR.defend(b);
    }
    // towns under siege: a larder that empties
    for (const s of G.S.settlements.values()) {
      const L = s.larder; if (!L) continue;
      const b = G.War.bands.get(L.by);
      if (!b || b.st === 'retorno' || s.fac === L.fac) { endSiege(s, 'fim'); if (b && b.st === 'retorno') log(`O cerco a ${s.name} foi levantado.`, 'siege', s.cx, s.cy); }
    }
  };
  // eating inside a besieged town comes from its larder
  AR.larder = function (v) { const s = G.S.settlements.get(v.set); return s && s.larder && !v.captive ? s.larder : null; };
  AR.onDisband = function (b) {
    const A = b.army; if (!A) return;
    for (const co of A.cos) for (const id of co.members) { const v = G.S.villagers.get(id); if (v) { v.unit = null; if (v._bow) { v.arm = null; v._bow = false; } if (v._levy && v.role !== 'guerreiro') { const f = G.Fac.ofV(v); if (f) f.stock.armas = (f.stock.armas || 0) + 1; } v._levy = false; } }
    const set = G.S.settlements.get(b.set); if (set && set.larder && set.larder.by === b.id) endSiege(set, 'fim');
    if (b.stolen) { const f = G.Fac.get(b.fac); if (f) log(`${f.name} voltou da guerrilha com ${b.stolen} animais roubados.`, 'war'); for (const a of G.S.animals.values()) if (a.stolen === b.fac && a.state === 'led') { a.state = 'pen'; a.pen = 0; a.dom = b.fac; a.ledBy = 0; a.stolen = 0; } }
    if (A.reports.length && b.goal !== 'defesa') { const f = G.Fac.get(b.fac); if (f) f.warLog = (f.warLog || []).concat([{ d: G.S.day, strat: A.strat, rep: A.reports.slice(0, 4) }]).slice(-6); }
  };

  // the general's standard, in the manner of the culture
  AR.drawStandard = function (c, v, t) {
    const civ = v._civ || 'classico'; const fc = v._fc || '#8a3a2a';
    const L = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    c.strokeStyle = '#5a3c22'; c.lineWidth = 0.8; L(-2.2, -1, -2.2, -24);
    const w = Math.sin(t * 5 + v.id) * 0.8;
    switch (civ) {
      case 'romano':
        c.fillStyle = '#a8322a'; c.fillRect(-5.6, -21, 6.8, 5); c.fillStyle = '#e0b84a'; c.fillRect(-5.6, -21, 6.8, 0.6); c.fillRect(-4.6, -19, 4.8, 0.5); c.fillRect(-4.6, -17.6, 4.8, 0.5);
        c.fillStyle = '#e8c24a'; c.beginPath(); c.moveTo(-2.2, -24.6); c.lineTo(-5.2, -26.4); c.lineTo(-3.6, -24); c.lineTo(-2.2, -23); c.lineTo(-0.8, -24); c.lineTo(0.8, -26.4); c.closePath(); c.fill(); c.beginPath(); c.arc(-2.2, -25.4, 0.9, 0, TAU); c.fill();
        break;
      case 'grego':
        c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(-2.2, -24.5, 2.6, 0, TAU); c.fill(); c.fillStyle = fc; c.beginPath(); c.arc(-2.2, -24.5, 1.5, 0, TAU); c.fill();
        c.fillStyle = '#f4efe3'; c.beginPath(); c.moveTo(-2.2, -21); c.quadraticCurveTo(-5, -20 + w, -7.6, -20.4 + w); c.lineTo(-7.2, -17.6 + w); c.quadraticCurveTo(-5, -17.4, -2.2, -18); c.fill();
        break;
      case 'egipcio':
        c.fillStyle = '#e8b83a'; c.beginPath(); c.moveTo(-2.2, -23); c.arc(-2.2, -23, 4, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill();
        c.strokeStyle = '#2f8f8a'; c.lineWidth = 0.4; for (let k = 0; k < 5; k++) { const a = Math.PI * (1.12 + k * 0.18); L(-2.2, -23, -2.2 + Math.cos(a) * 3.8, -23 + Math.sin(a) * 3.8); }
        c.fillStyle = '#2f5fae'; c.beginPath(); c.arc(-2.2, -24.6, 0.9, 0, TAU); c.fill();
        break;
      case 'asteca':
        for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.28; c.fillStyle = k % 2 ? '#2fae8f' : '#3ac85a'; c.beginPath(); c.ellipse(-2.2 + Math.cos(a) * 3, -24 + Math.sin(a) * 3.4 + w * 0.3, 0.9, 3.4, a + Math.PI / 2, 0, TAU); c.fill(); }
        c.fillStyle = '#e8b83a'; c.beginPath(); c.arc(-2.2, -23.6, 1.3, 0, TAU); c.fill(); c.fillStyle = '#b33a2a'; c.beginPath(); c.arc(-2.2, -23.6, 0.6, 0, TAU); c.fill();
        break;
      case 'nordico':
        c.fillStyle = '#f0ece0'; c.beginPath(); c.moveTo(-2.2, -24); c.quadraticCurveTo(-6, -22.4 + w, -9.4, -21.4 + w * 1.4); c.lineTo(-2.2, -17.4); c.closePath(); c.fill();
        c.strokeStyle = '#a23c2a'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-9.4, -21.4 + w * 1.4); c.lineTo(-2.2, -17.4); c.stroke();
        c.fillStyle = '#1e1a1e'; c.beginPath(); c.ellipse(-4.8, -21.2 + w * 0.6, 1.5, 0.8, -0.3, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-5.6, -21.4 + w * 0.6); c.lineTo(-7.2, -22.6 + w); c.lineTo(-5.2, -20.6 + w * 0.6); c.fill();
        break;
      default:
        c.fillStyle = fc; c.fillRect(-7.6, -23.6, 5.4, 4); c.fillStyle = '#f4efe3'; c.beginPath(); c.arc(-4.9, -21.6, 0.9, 0, TAU); c.fill();
    }
  };

  // soldiers run as 'band' tasks; nothing else to dispatch here
  AR.run = () => false;

  // ------------------------------ words ------------------------------
  AR.title = function (v) {
    const t = v.task; if (!t || t.type !== 'band') return null;
    const b = G.War.bands.get(t.band); if (!b || !b.army) return null;
    const f = G.Fac.get(b.fac); const T0 = TT(f); const k = v.g === 'f' ? 1 : 0;
    if (b.army.gen === v.id) return T0.gen[k];
    for (const w in (b.army.cols || {})) if (b.army.cols[w] === v.id) return T0.col[k];
    const co = coOf(v); if (co && co.cap === v.id) return `${T0.cap[k]} da ${co.n}ª ${T0.co}`;
    if (v.unit && AR.UNIT[v.unit] && AR.UNIT[v.unit].one && v.role !== 'guerreiro') return AR.UNIT[v.unit].one[k];
    return null;
  };
  AR.taskText = function (v, t) {
    if (t.type !== 'band') return null;
    const b = G.War.bands.get(t.band); if (!b || !b.army) return null;
    const A = b.army; const co = coOf(v); const f = G.Fac.get(b.fac); const set = G.S.settlements.get(b.set);
    if (co && co.rout) return 'Fugindo em debandada!';
    const unit = co ? `${co.n}ª ${TT(f).co}` : 'o exército';
    const form = co ? AR.FORM[co.form] : '';
    const verb = b.goal === 'defesa' ? { reunir: 'Formando para defender', posicao: A.strat === 'emboscada' ? 'Escondido na floresta, esperando' : A.strat === 'colina' ? 'Segurando o alto da colina' : A.strat === 'rio' ? 'Guardando o vau do rio' : A.strat === 'muralha' ? 'Atrás do portão, guardando a muralha' : 'Em linha diante da cidade', batalha: 'Em batalha' }[A.phase] : { reunir: 'Reunindo o exército', marcha: `Marchando contra ${set ? set.name : 'o inimigo'}`, batalha: 'Em batalha campal', cerco: `No cerco de ${set ? set.name : ''}`, cercar: 'Tomando posição num dos portões', guerrilha: 'Em guerrilha nos arredores', assalto: 'Avançando em linha', invadir: 'No assalto à cidade' }[A.phase];
    if (!verb) return null;
    return `${verb} · ${unit}${form ? ', em ' + form : ''}`;
  };

  // ------------------------------ the siege camp's trench, tents and standards ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ground.push(function (c, proj, view) {
    for (const b of G.War.bands.values()) {
      const A = b.army; if (!A || !A.trench || A.phase !== 'cerco') continue;
      const tr = A.trench; const n = 72;
      c.strokeStyle = 'rgba(70,52,34,0.55)'; c.lineWidth = 2.2; c.beginPath();
      for (let k = 0; k <= n; k++) { const a = k / n * TAU; const x = tr.x + Math.cos(a) * tr.r, y = tr.y + Math.sin(a) * tr.r; if (!W.inb(x, y)) continue; const p = proj(x, y, W.hAt(x, y)); if (k === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
      c.stroke();
      c.strokeStyle = 'rgba(140,110,70,0.5)'; c.lineWidth = 0.8; c.beginPath();
      for (let k = 0; k <= n; k++) { const a = k / n * TAU; const x = tr.x + Math.cos(a) * (tr.r + 0.35), y = tr.y + Math.sin(a) * (tr.r + 0.35); if (!W.inb(x, y)) continue; const p = proj(x, y, W.hAt(x, y)); if (k === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
      c.stroke();
      void view;
    }
  });
  const tentE = new WeakMap();
  G.renderHooks.ents.push(function (add) {
    for (const b of G.War.bands.values()) {
      const A = b.army; if (!A || A.phase !== 'cerco') continue;
      for (const co of A.cos) {
        if (!co.camp) continue;
        let e = tentE.get(co); if (!e) tentE.set(co, e = { co, fn: drawTents, fac: b.fac });
        add(co.camp[0] + co.camp[1] - 0.8, e, co.camp[0] - 1, co.camp[1] - 0.6);
      }
    }
  });
  function drawTents(c, e, sx, sy) {
    const col = G.Fac.hex(e.fac);
    for (const [dx, dy] of [[0, 0], [-14, 6], [12, 5]]) {
      const x = sx + dx, y = sy + dy;
      c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x, y - 9); c.lineTo(x + 7, y); c.closePath(); c.fill();
      c.fillStyle = '#c8bca0'; c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x + 7, y); c.lineTo(x + 3, y + 1.5); c.closePath(); c.fill();
      c.fillStyle = '#5a4a3a'; c.beginPath(); c.moveTo(x - 1.6, y); c.lineTo(x, y - 4.5); c.lineTo(x + 1.6, y); c.fill();
      c.fillStyle = col; c.fillRect(x - 0.4, y - 12, 0.8, 3); c.fillRect(x + 0.4, y - 12, 2.6, 1.6);
    }
  }
})(window.G);
