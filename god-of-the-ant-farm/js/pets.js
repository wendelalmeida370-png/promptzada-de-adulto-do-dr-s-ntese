'use strict';
// ============================================================
//  Pets: the animals that live among people. Dogs that follow
//  their master to the fields and bark the foxes away, cats on
//  the doorsteps, hens scratching behind the houses (their eggs
//  go to the family pantry), pigeons on the square that burst
//  into the air when someone walks through. All counted, all real.
// ============================================================
(function (G) {
  const P = G.Pets = {};
  const W = G.W;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const HOMES = { hut: 1, house: 1, sobrado: 1, insula: 1, quarteirao: 1 };
  const YARD = { hut: 1, house: 1 };
  // how much each people likes each animal
  const LIKE = {
    grego: { cao: 1, gato: 0.6, galinha: 1, pombo: 1 }, romano: { cao: 1.1, gato: 0.8, galinha: 1.1, pombo: 1.2 }, nordico: { cao: 1.3, gato: 0.8, galinha: 0.9, pombo: 0.5 },
    egipcio: { cao: 0.8, gato: 2.6, galinha: 0.4, pombo: 1.3 }, asteca: { cao: 0.9, gato: 0, galinha: 0, pombo: 0.6 }, classico: { cao: 1, gato: 0.8, galinha: 1, pombo: 0.8 },
  };
  const DOGNAME = {
    grego: ['Argos', 'Kyon', 'Lelaps', 'Tigris', 'Lykos', 'Melampo', 'Aura', 'Hilax'], romano: ['Ferox', 'Celer', 'Lupus', 'Fidelis', 'Rex', 'Catulus', 'Ursa', 'Lupa'],
    nordico: ['Garm', 'Vigi', 'Sámr', 'Hrafn', 'Ulfr', 'Bjorn', 'Freki', 'Skadi'], egipcio: ['Abuwtiyuw', 'Bebi', 'Pehtes', 'Tjer', 'Kami', 'Heqa', 'Nebu'],
    asteca: ['Xolo', 'Tlalli', 'Itzcuin', 'Chichi', 'Coyotl', 'Tepe'], classico: ['Rufo', 'Pintado', 'Brasa', 'Lobo', 'Estrela', 'Fumaça', 'Pipoca'],
  };
  const civOf = set => { const f = G.Fac.get(set.fac); return (f && f.civ) || 'classico'; };

  // ------------------------------ moving about ------------------------------
  function step(a, tx, ty, sp, dt) {
    const dx = tx - a.x, dy = ty - a.y; const d = Math.hypot(dx, dy);
    if (d < 0.06) { a.moving = false; return true; }
    const s = Math.min(d, sp * dt); const nx = a.x + dx / d * s, ny = a.y + dy / d * s;
    if (!W.inb(nx, ny) || !W.walkableXY(nx, ny) || W.fenceBlocks(a, a.x, a.y, nx, ny)) { a.moving = false; a.t = 0; return true; }
    a.x = nx; a.y = ny; a.moving = true; a.walkPh += s * 9;
    if (Math.abs(dx) + Math.abs(dy) > 0.02) G.faceTo(a, dx, dy);
    return false;
  }
  function roam(a, cx, cy, r, sp, dt, pose, rest) {
    a.t -= dt;
    if (a.t <= 0) {
      if (a.moving || G.R() < 0.55) { a.t = G.rr(rest * 0.5, rest); a.tx = a.x; a.ty = a.y; a.pose = pose; }
      else { const ang = G.R() * TAU, d = G.R() * r; a.tx = cx + Math.cos(ang) * d; a.ty = cy + Math.sin(ang) * d; a.t = G.rr(3, 7); a.pose = ''; }
    }
    if (G.dist(a.x, a.y, a.tx, a.ty) > 0.08) { a.pose = ''; step(a, a.tx, a.ty, sp, dt); } else a.moving = false;
  }
  const doorOf = b => { const d = G.Vg.door(b); return d; };

  // ------------------------------ minds ------------------------------
  P.ai = function (a, dt, sp) {
    const S = G.S;
    if (a.bark > 0) a.bark -= dt; if (a.happy > 0) a.happy -= dt;
    a.hunger = Math.max(0, a.hunger - dt / DAY() * 1.2); // scraps, grain, crumbs from the people
    // resting with nothing new to notice: let the clock run (a dog catches up with its master a moment later)
    if (!a.moving && !a.fly && !a.foe && a.t > dt && a.scan > dt && a.pose) { a.t -= dt; a.scan -= dt; return; }
    if (a.kind === 'cao') dog(a, dt, sp, S);
    else if (a.kind === 'gato') cat(a, dt, sp, S);
    else if (a.kind === 'galinha') hen(a, dt, sp, S);
    else pigeon(a, dt, sp, S);
  };
  const SMALL = { fox: 1, arcticfox: 1, fennec: 1, wolf: 1, hyena: 1, jackal: 1, coyote: 1 };
  function dog(a, dt, sp, S) {
    a.scan -= dt;
    if (a.scan <= 0) {
      a.scan = 0.6; a.foe = 0;
      G.Animals.near(a.x, a.y, 7, o => { if (!a.foe && o !== a && !o.dead && !o.dom && SMALL[o.kind] && !o.legend && !o.summoned) a.foe = o.id; });
    }
    const foe = a.foe && S.animals.get(a.foe);
    if (foe && !foe.dead) { // bark, charge, drive it off
      a.pose = '';
      if (a.bark <= 0) { a.bark = 0.9; G.Audio && G.Audio.at(a.x, a.y, 'bark'); }
      if (G.dist(a.x, a.y, foe.x, foe.y) > 0.8) step(a, foe.x, foe.y, 3, dt);
      else { a.moving = false; const dx = foe.x - a.x, dy = foe.y - a.y, d = Math.hypot(dx, dy) || 1; foe.state = 'flee'; foe.target = 0; foe.tx = foe.x + dx / d * 6; foe.ty = foe.y + dy / d * 6; foe.t = 5; foe.flee = 4; }
      return;
    }
    const home = S.buildings.get(a.home);
    const door = home ? doorOf(home) : [a.hx, a.hy];
    if (G.isNight()) { // curled up at the door
      if (G.dist(a.x, a.y, door[0], door[1]) > 0.5) { a.pose = ''; step(a, door[0], door[1], 1.4, dt); } else { a.moving = false; a.pose = 'sleep'; }
      return;
    }
    const o = S.villagers.get(a.owner);
    if (o && !o.inside && !o.aboard && !o.held && !o.air && G.dist2(o.x, o.y, a.x, a.y) < 34 * 34) {
      const d = G.dist(a.x, a.y, o.x, o.y);
      if (o.task && o.task.type === 'herd' && o.task.st === 3) { // a sheepdog: round and round the flock
        const ang = (S.clock * 0.9 + a.id) % TAU; a.pose = ''; step(a, o.x + Math.cos(ang) * 2.4, o.y + Math.sin(ang) * 2.4, 2.4, dt); return;
      }
      if (o.moving || d > 2.4) { a.pose = ''; a.happy = 0.6; if (d > 34) { a.x = o.x; a.y = o.y; } step(a, o.x - o.face * 0.8, o.y + 0.25, d > 4 ? 3 : 1.5, dt); return; }
      roam(a, o.x, o.y, 1.4, 1.1, dt, 'lie', 6); return;
    }
    // at home: a child to play with?
    if (!a.kid || G.R() < dt * 0.1) { a.kid = 0; for (const v of S.villagers.values()) { if (v.age >= 3 && v.age < 13 && v.home === a.home && v.task && (v.task.type === 'play' || (v.task.type === 'family' && v.task.play)) && G.dist2(v.x, v.y, a.x, a.y) < 64) { a.kid = v.id; break; } } }
    const k = a.kid && S.villagers.get(a.kid);
    if (k && k.moving) { a.pose = ''; a.happy = 0.5; step(a, k.x + Math.cos(S.clock * 3 + a.id) * 0.6, k.y + Math.sin(S.clock * 3 + a.id) * 0.6, 2.8, dt); return; }
    roam(a, door[0], door[1], 1.8, 1.1, dt, G.R() < 0.5 ? 'lie' : '', 8);
  }
  function cat(a, dt, sp, S) {
    // a dog close by: run
    a.scan -= dt; if (a.scan <= 0) { a.scan = 0.4; a.foe = 0; G.Animals.near(a.x, a.y, 2, o => { if (!a.foe && o.kind === 'cao' && !o.dead) a.foe = o.id; }); }
    const dogN = a.foe && S.animals.get(a.foe);
    if (dogN && G.dist(a.x, a.y, dogN.x, dogN.y) < 1.5) { const dx = a.x - dogN.x, dy = a.y - dogN.y, d = Math.hypot(dx, dy) || 1; a.pose = ''; a.tx = a.x + dx / d * 3; a.ty = a.y + dy / d * 3; a.t = 3; step(a, a.tx, a.ty, 3.2, dt); return; }
    const home = S.buildings.get(a.home);
    const [cx, cy] = home ? doorOf(home) : [a.hx, a.hy];
    roam(a, cx, cy, 3.5, 0.8, dt, G.isNight() || G.R() < 0.4 ? 'sleep' : 'sit', 14);
  }
  function hen(a, dt, sp, S) {
    a.scan -= dt; if (a.scan <= 0) { a.scan = 0.35; a.foe = 0; G.Animals.near(a.x, a.y, 1.4, o => { if (!a.foe && o.kind === 'cao' && o.moving) a.foe = o.id; }); }
    const dogN = a.foe && S.animals.get(a.foe);
    if (dogN) { const dx = a.x - dogN.x, dy = a.y - dogN.y, d = Math.hypot(dx, dy) || 1; a.pose = ''; step(a, a.x + dx / d, a.y + dy / d, 2, dt); if (G.R() < dt * 2) G.Audio && G.Audio.at(a.x, a.y, 'cluck'); return; }
    const home = S.buildings.get(a.home);
    const [cx, cy] = home ? doorOf(home) : [a.hx, a.hy];
    if (G.isNight()) { if (G.dist(a.x, a.y, cx, cy) > 0.4) { a.pose = ''; step(a, cx, cy, 0.8, dt); } else { a.moving = false; a.pose = 'sleep'; } return; }
    // the rooster wakes the town
    if (a.rooster && S.time > 0.02 && S.time < 0.06 && a.crowDay !== S.day) { a.crowDay = S.day; G.Audio && G.Audio.at(a.x, a.y, 'rooster', true); }
    roam(a, cx, cy, 2.2, 0.6, dt, 'peck', 4);
  }
  function pigeon(a, dt, sp, S) {
    const home = S.buildings.get(a.home);
    const c = home ? G.Village.center(home) : [a.hx, a.hy];
    if (a.fly) { // in the air: up, across, down
      const d = G.dist(a.x, a.y, a.tx, a.ty);
      a.z = Math.min(9, a.z + dt * 14) * (d < 1.2 ? d / 1.2 : 1) + (d < 1.2 ? 0 : 0);
      const dx = a.tx - a.x, dy = a.ty - a.y; const s = Math.min(d, 3.2 * dt);
      if (d > 0.05) { a.x += dx / d * s; a.y += dy / d * s; if (Math.abs(dx - dy) > 0.02) G.faceTo(a, dx, dy); }
      if (d < 0.1) { a.fly = false; a.z = 0; a.t = G.rr(1, 3); }
      a.moving = false; return;
    }
    a.scan -= dt;
    if (a.scan <= 0) {
      a.scan = 0.3; let spook = false;
      G.Animals.near(a.x, a.y, 1.1, o => { if (o.kind === 'cao' || o.kind === 'gato') spook = true; });
      if (!spook) { const cx = a.x >> 1, cy = a.y >> 1; for (let dy = -1; dy <= 1 && !spook; dy++) for (let dx = -1; dx <= 1 && !spook; dx++) { const l = vgrid.get(((cx + dx) << 12) | (cy + dy)); if (l) for (const v of l) { if (Math.abs(v.x - a.x) < 0.9 && Math.abs(v.y - a.y) < 0.9 && (v.moving || v.age < 12)) { spook = true; break; } } } }
      if (spook) { // the whole flock goes up together
        for (const o of S.animals.values()) if (o.kind === 'pombo' && o.home === a.home && !o.fly && G.dist2(o.x, o.y, a.x, a.y) < 9) { const ang = G.R() * TAU, r = G.rr(1.5, 3.5); let tx = c[0] + Math.cos(ang) * r, ty = c[1] + Math.sin(ang) * r; if (!W.walkableXY(tx, ty)) { tx = c[0]; ty = c[1]; } o.fly = true; o.tx = tx; o.ty = ty; o.z = Math.max(o.z, 0.6); }
        if (G.R() < 0.5) G.Audio && G.Audio.at(a.x, a.y, 'flap');
        return;
      }
    }
    roam(a, c[0], c[1], 2.6, 0.7, dt, 'peck', 3);
  }

  // ------------------------------ how many, and where ------------------------------
  let tMgr = 2, tGrid = 0;
  // people on 2-tile cells, for the pigeons to notice
  const vgrid = new Map();
  function buildGrid() {
    vgrid.clear();
    for (const v of G.S.villagers.values()) { if (v.inside || v.aboard) continue; const k = ((v.x >> 1) << 12) | (v.y >> 1); let l = vgrid.get(k); if (!l) vgrid.set(k, l = []); l.push(v); }
  }
  function manage() {
    const S = G.S;
    const bySet = new Map();
    for (const a of S.animals.values()) { const sp = G.Animals.DEF[a.kind]; if (!sp || !sp.town || a.dead) continue; let m = bySet.get(a.set); if (!m) bySet.set(a.set, m = { cao: [], gato: [], galinha: [], pombo: [] }); m[a.kind].push(a); }
    const residents = new Map(); const pop = new Map();
    for (const v of S.villagers.values()) { pop.set(v.set, (pop.get(v.set) || 0) + 1); if (v.home && !v.captive) { let l = residents.get(v.home); if (!l) residents.set(v.home, l = []); l.push(v); } }
    for (const set of S.settlements.values()) {
      const n = pop.get(set.id) || 0; const civ = civOf(set); const like = LIKE[civ] || LIKE.classico;
      const have = bySet.get(set.id) || { cao: [], gato: [], galinha: [], pombo: [] };
      // gone homes, conquered towns
      for (const k in have) for (const a of have[k]) { if (!S.buildings.has(a.home) || (!residents.has(a.home) && k !== 'pombo' && k !== 'gato')) { G.Animals.remove(a); } else a.dom = set.fac; }
      if (n < 6) continue;
      const homes = []; const yards = [];
      for (const [hid, l] of residents) { const h = S.buildings.get(hid); if (!h || h.set !== set.id || !HOMES[h.type]) continue; homes.push([h, l]); if (YARD[h.type]) yards.push(h); }
      const want = {
        cao: Math.min(Math.round(homes.length * 0.34 * like.cao), Math.ceil(n / 6)),
        gato: Math.round(n / 16 * like.gato),
        galinha: Math.min(Math.round(yards.length * 1.3 * like.galinha), 40),
        pombo: (set.tier || 0) >= 2 ? Math.round((6 + (set.tier || 0) * 2.5) * like.pombo) : 0,
      };
      const count = k => have[k].filter(a => S.animals.has(a.id)).length;
      // one new animal of each kind at a time: a stray adopted, a kitten, a hen bought at the fair
      if (count('cao') < want.cao) {
        const dogged = new Set(have.cao.map(a => a.home));
        const cand = homes.filter(([h, l]) => !dogged.has(h.id) && l.some(v => v.age >= 16));
        if (cand.length) {
          const [h, l] = G.pick(cand);
          const adults = l.filter(v => v.age >= 16);
          const owner = adults.find(v => v.role === 'cacador' || v.role === 'pastor') || G.pick(adults);
          const d = doorOf(h); const names = DOGNAME[civ] || DOGNAME.classico;
          G.Animals.spawn('cao', d[0], d[1], { dom: set.fac, set: set.id, home: h.id, owner: owner.id, coat: (Math.random() * 5) | 0, named: G.pick(names), age: G.rr(0.5, 6), hx: d[0], hy: d[1] });
        }
      }
      if (count('gato') < want.gato) {
        const stores = [...S.buildings.values()].filter(b => b.set === set.id && b.built && (b.type === 'storehouse' || b.type === 'temple' || HOMES[b.type]));
        if (stores.length) { const b = G.pick(stores); const d = doorOf(b); G.Animals.spawn('gato', d[0], d[1], { dom: set.fac, set: set.id, home: b.id, coat: (Math.random() * 5) | 0, age: G.rr(0.5, 8), hx: d[0], hy: d[1] }); }
      }
      if (count('galinha') < want.galinha && yards.length) {
        const h = G.pick(yards); const d = doorOf(h);
        const rooster = !have.galinha.some(a => a.rooster);
        G.Animals.spawn('galinha', d[0] + G.rr(-0.5, 0.5), d[1] + G.rr(-0.5, 0.5), { dom: set.fac, set: set.id, home: h.id, coat: (Math.random() * 3) | 0, rooster, age: G.rr(0.3, 3), hx: d[0], hy: d[1] });
      }
      if (count('pombo') < want.pombo) {
        const sq = [...S.buildings.values()].filter(b => b.set === set.id && b.built && (b.type === 'praca' || b.type === 'mercado' || b.type === 'temple' || b.type === 'feira'));
        if (sq.length) { const b = G.pick(sq); const [cx, cy] = G.Village.center(b); for (let k = 0; k < 3 && count('pombo') + k < want.pombo; k++) { const x = cx + G.rr(-1.5, 1.5), y = cy + G.rr(-1.5, 1.5); if (W.walkableXY(x, y)) G.Animals.spawn('pombo', x, y, { dom: set.fac, set: set.id, home: b.id, coat: (Math.random() * 4) | 0, age: G.rr(0.3, 3), hx: cx, hy: cy }); } }
      }
      // eggs for the pantry
      for (const a of have.galinha) { const h = S.buildings.get(a.home); if (h && a.grown >= 1 && !G.isNight()) h.pantry = (h.pantry || 0) + 0.02; }
      // a dog whose master died takes the next one of the house
      for (const a of have.cao) { if (S.villagers.has(a.owner)) continue; const l = residents.get(a.home); const nxt = l && l.find(v => v.age >= 12); if (nxt) a.owner = nxt.id; }
    }
  }
  let anyPigeon = false;
  P.update = function (dt) {
    tMgr -= dt; if (tMgr <= 0) { tMgr = 5; manage(); anyPigeon = false; for (const a of G.S.animals.values()) if (a.kind === 'pombo') { anyPigeon = true; break; } }
    tGrid -= dt; if (tGrid <= 0 && anyPigeon) { tGrid = 0.3; buildGrid(); }
  };
  P.count = function (setId) {
    const c = { cao: 0, gato: 0, galinha: 0, pombo: 0 };
    for (const a of G.S.animals.values()) if (!a.dead && c[a.kind] !== undefined && (setId === undefined || a.set === setId)) c[a.kind]++;
    return c;
  };
  P.countFac = function (fid) {
    const c = { cao: 0, gato: 0, galinha: 0, pombo: 0 };
    for (const a of G.S.animals.values()) if (!a.dead && c[a.kind] !== undefined && a.dom === fid) c[a.kind]++;
    return c;
  };
  P.dogOf = function (v) { for (const a of G.S.animals.values()) if (a.kind === 'cao' && a.owner === v.id && !a.dead) return a; return null; };
  P.words = function (c) {
    const out = [];
    if (c.cao) out.push(`${c.cao} ${c.cao === 1 ? 'cão' : 'cães'}`); if (c.gato) out.push(`${c.gato} ${c.gato === 1 ? 'gato' : 'gatos'}`);
    if (c.galinha) out.push(`${c.galinha} ${c.galinha === 1 ? 'galinha' : 'galinhas'}`); if (c.pombo) out.push(`${c.pombo} ${c.pombo === 1 ? 'pombo' : 'pombos'}`);
    return out.join(', ');
  };
  // the inspector: what this animal is doing, in words
  P.stateText = function (a) {
    const S = G.S;
    if (a.kind === 'cao') {
      const o = S.villagers.get(a.owner);
      if (a.foe && S.animals.get(a.foe)) return `Latindo e expulsando ${G.Animals.DEF[S.animals.get(a.foe).kind].nameA}!`;
      if (a.pose === 'sleep') return 'Dormindo enrolado na porta de casa';
      if (o && G.dist(a.x, a.y, o.x, o.y) < 4) return o.task && o.task.type === 'herd' ? `Tocando o rebanho com ${o.name}` : `Seguindo ${o.name}, seu dono`;
      if (a.kid && S.villagers.get(a.kid)) return `Brincando com ${S.villagers.get(a.kid).name}`;
      return a.pose === 'lie' ? 'Deitado na porta de casa' : 'Farejando pela vizinhança';
    }
    if (a.kind === 'gato') return a.pose === 'sleep' ? 'Cochilando' : a.pose === 'sit' ? 'Sentado, vigiando a rua' : 'Passeando pelos telhados e portas';
    if (a.kind === 'galinha') return a.pose === 'sleep' ? 'Dormindo no poleiro' : a.rooster ? 'Cuidando das galinhas' : 'Ciscando atrás de casa';
    return a.fly ? 'Voando assustado' : 'Catando migalhas na praça';
  };

  // ------------------------------ saving ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { const l = []; for (const a of G.S.animals.values()) { const sp = G.Animals.DEF[a.kind]; if (sp && sp.town && !a.dead) l.push([a.id, a.dom, a.set, a.home, a.owner || 0, a.coat || 0, a.rooster ? 1 : 0]); } out.pets = l; },
    load(o) { for (const [id, dom, set, home, owner, coat, rooster] of o.pets || []) { const a = G.S.animals.get(id); if (!a) continue; Object.assign(a, { dom, set, home, owner, coat, rooster: !!rooster }); } for (const a of G.S.animals.values()) { const sp = G.Animals.DEF[a.kind]; if (sp && sp.town && !a.set) G.Animals.remove(a); } },
  });
})(window.G);
