'use strict';
// ============================================================
//  A pescaria (a atividade 02 do pedido). O peixe é contado: cada
//  água tem os seus pesqueiros (quadras de 8×8 casas de água), e cada
//  pesqueiro comporta o peixe da sua água — o mar aberto muito, o
//  recife mais, um rio pouco. O que se pesca sai dali: onde se pesca
//  demais, o peixe acaba (a linha volta vazia, o barco volta leve) e,
//  deixado em paz, volta — depressa quando há pouco, devagar perto do
//  cheio (a conta da vida, resolvida na hora em que alguém olha: nada
//  roda a cada passo, e o salto no tempo não paga nada por isso).
//  O que morde é o daquela água (G.Waters); o jeito de pescar é o do
//  povo (as mãos, o arpão, a linha, a rede; o barco, em fishers.js);
//  a mão é a de quem pesca (fishXp) — e o aprendiz aprende ao lado do
//  mestre (life.js). O corpo do deus pesca pela mesma porta
//  (G.Pesca.cast): a mesma água, o mesmo peixe, o mesmo acaso do mundo.
// ============================================================
(function (G) {
  const W = G.W, T = G.T, A = G.Act, D = G.Depot; if (!A || !D || !G.Waters) return;
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const P = G.Pesca = {};
  const EPS = 1e-6;
  const GS = 8; P.GS = GS;
  // the fish a tile of each water holds when nobody fishes it (in loads of food: a sea tile is a couple of catches)
  const DENS = { deep: 2.2, sea: 2.0, reef: 3.0, rock: 2.4, mud: 2.4, river: 1.2, lake: 1.6 };
  const RATE = 1.2;   // how fast the fish come back (the logistic rate, per day of the world)
  const SEED = 0.03;  // a ground fished out is never dead: fish swim in from the waters around
  P.RATE = RATE; P.SEED = SEED;
  P.EMPTY = 0.05;     // below this, a water has no fish worth a cast
  P.WORTH = 0.2;      // below this, the people's fishers go to other waters (the walk is not worth it)
  const r4 = x => Math.round(x * 1e4) / 1e4;
  const isWater = i => { const S = G.S; return S.type[i] <= T.RIVER && !(S.dry && S.dry[i]); };
  const cols = () => Math.ceil(N / GS);
  P.idAt = (x, y) => Math.floor(G.clamp(Math.floor(y), 0, N - 1) / GS) * cols() + Math.floor(G.clamp(Math.floor(x), 0, N - 1) / GS);

  // ------------------------------ the grounds ------------------------------
  // what a ground holds when full: its water, tile by tile — read from the map, never saved (the map's version keeps it true)
  const capK = new Map(); let capV = -1, capS = null;
  G.worldHooks.push(() => { capK.clear(); capV = -1; capS = null; });
  function cap(id) {
    const S = G.S; const ver = S.typeVer || 0;
    if (capS !== S || capV !== ver) { capK.clear(); capS = S; capV = ver; }
    let k = capK.get(id); if (k !== undefined) return k;
    const c = cols(); const cx = id % c, cy = Math.floor(id / c); k = 0;
    for (let y = cy * GS; y < Math.min(N, cy * GS + GS); y++) for (let x = cx * GS; x < Math.min(N, cx * GS + GS); x++) {
      const i = y * N + x; if (!isWater(i)) continue;
      k += DENS[G.Waters.kind(x + 0.5, y + 0.5)] || 1.5;
    }
    k = r4(k); capK.set(id, k); return k;
  }
  P.cap = cap;
  const store = () => G.S.pesca || (G.S.pesca = {});
  // the fish in a ground now: what the last catch left, grown since — read only, nothing is written
  function now(id) {
    const K = cap(id); if (!(K > 0)) return { n: 0, K: 0 };
    const g = G.S.pesca && G.S.pesca[id]; if (!g) return { n: K, K }; // (a read never makes the grounds' book)
    const days = Math.max(0, (G.S.clock - g[1]) / G.DAY_LEN);
    const n0 = G.clamp(g[0], K * SEED, K);
    const n = K / (1 + ((K - n0) / n0) * Math.exp(-RATE * days));
    return { n: Math.min(K, n), K };
  }
  P.stock = (x, y) => { const id = P.idAt(x, y); const s = now(id); return { id, n: s.n, K: s.K, ab: s.K > 0 ? s.n / s.K : 0 }; };
  P.abundance = (x, y) => P.stock(x, y).ab;
  // a catch out of a ground (in the world's step only), in whole fish: the ground grows to now, then the catch leaves it
  // (never more than half of what is there in one go). The caller says how many came up — by what is left: fewer fish,
  // fewer bites and smaller hauls
  // (a catch let go: back into its ground, never above what the ground holds)
  function untake(x, y, n) {
    if (!(n > EPS) || !G.inSim) return;
    const id = P.idAt(x, y); const s = now(id); if (!(s.K > 0)) return;
    store()[id] = [r4(Math.min(s.K, s.n + n)), Math.round(G.S.clock * 100) / 100];
  }
  P.take = function (x, y, n) {
    if (!(n >= 0.5) || !G.inSim) return 0;
    const id = P.idAt(x, y); const s = now(id); if (!(s.K > 0)) return 0;
    const m = Math.min(Math.round(n), Math.floor(s.n * 0.5)); if (m < 1) return 0;
    store()[id] = [r4(s.n - m), Math.round(G.S.clock * 100) / 100];
    return m;
  };

  // ------------------------------ the ways of fishing ------------------------------
  // the way a people fishes from the shore: the spear where it knows neither boats nor metal; the hook and line with bronze;
  // the net with boats — and the peoples who live by the water (the Norse, the Nile, the lakes of the Aztecs) know the net
  // early. dur: a cast, in seconds of the world; p: the chance that something bites; n: how many; fit: the water it suits
  const GEAR = P.GEAR = {
    maos: { name: 'as mãos', label: 'Pescar com as mãos', anim: 'pescarMaos', p: 0.45, n: [1, 1], fit: { river: 1, lake: 0.8, mud: 0.9, rock: 0.7, reef: 0.6, sea: 0.5, deep: 0 } },
    arpao: { name: 'o arpão', label: 'Pescar com o arpão', anim: 'pescarArpao', p: 0.6, n: [1, 2], fit: { river: 1.1, lake: 0.9, mud: 0.8, rock: 1, reef: 1, sea: 0.6, deep: 0.2 } },
    linha: { name: 'a linha', label: 'Pescar com linha e anzol', anim: 'pescarLinha', p: 0.75, n: [1, 3], fit: { river: 1, lake: 1, mud: 0.9, rock: 1, reef: 1, sea: 1, deep: 1.1 } },
    rede: { name: 'a rede', label: 'Lançar a rede', anim: 'pescarRede', p: 0.8, n: [1, 4], fit: { river: 1.1, lake: 1.2, mud: 1.2, rock: 0.7, reef: 0.6, sea: 1.3, deep: 0.9 } },
  };
  A.ANIM.pescarMaos = { act: 'fish', dur: 2.2, contact: 1.2, hands: 2 };
  A.ANIM.pescarArpao = { act: 'fish', dur: 5, contact: 4.6, hands: 2 };
  A.ANIM.pescarLinha = { act: 'fish', dur: 6.5, contact: 6.0, hands: 2 };
  A.ANIM.pescarRede = { act: 'fish', dur: 7.5, contact: 6.8, hands: 2 };
  const NETS = { nordico: 1, egipcio: 1, asteca: 1 };
  P.how = function (fid) {
    const f = G.Fac.get(fid); if (!f) return 'maos';
    if (G.Civ.has(fid, 'navegacao') || NETS[f.civ]) return 'rede';
    if (G.Civ.has(fid, 'bronze') || G.Civ.has(fid, 'ferro')) return 'linha';
    return 'arpao';
  };
  // (the gear in the hands while fishing: what the 3D shows — the net it knows; a line or a spear it does not draw yet, and
  // an unknown gear would be drawn as a crate: none until it does)
  P.gearOf = how => (how === 'rede' ? 'rede' : null);
  // the hand of the one who fishes: a novice catches less, a master more (and a few catches a day make a hand)
  P.skill = v => 0.85 + Math.min(0.4, (v.fishXp || 0) / 120);
  // where one can fish from here: the water beside the feet (an edge of a river, a lake, the sea)
  P.edge = function (x, y, r) {
    const S = G.S; let best = null, bd = 1e9; const R = Math.max(1, Math.ceil(r || 1));
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const wx = Math.floor(x) + dx, wy = Math.floor(y) + dy; if (!W.inb(wx, wy)) continue;
      const i = wy * N + wx; if (!isWater(i) || (S.ice && S.ice[i])) continue;
      const d = G.dist2(wx + 0.5, wy + 0.5, x, y); if (d < bd) { bd = d; best = { x: wx + 0.5, y: wy + 0.5, i }; }
    }
    return best && bd <= (R + 0.75) * (R + 0.75) ? best : null;
  };
  // can one fish this water, now, this way? (the same answer for the people and for the god's body)
  P.can = function (v, x, y, how) {
    const S = G.S; if (!W.inb(x, y)) return { ok: false, why: 'Aqui não há água para pescar.' };
    const i = W.idx(x, y); if (!isWater(i)) return { ok: false, why: 'Aqui não há água para pescar.' };
    if (S.ice && S.ice[i]) return { ok: false, why: 'A água está congelada.' };
    if (S.weather && S.weather.storm > 0) return { ok: false, why: 'Com esta tempestade, ninguém fica na beira da água.' };
    const g = GEAR[how] || GEAR.maos; const fit = g.fit[G.Waters.kind(x, y)] || 0;
    if (!(fit > 0)) return { ok: false, why: `Com ${g.name} não se pesca nesta água: é funda demais.` };
    // (no fish worth a cast: below the empty mark, or fewer than two fish — a catch takes at most half of what is there, so
    // with one fish nothing ever comes up: a small water, twelve fish when full, stayed «with fish» at 8% and every cast
    // came up empty, L-199)
    const st = P.stock(x, y);
    if (st.ab < P.EMPTY || st.n < 2) return { ok: false, why: 'Esta água está sem peixe: pescaram demais aqui. Daqui a um tempo ele volta.', empty: 1 };
    const c = v.carry; if (c && c.n > EPS && !(c.fish && !c.op && !c.to && !c.cid)) return { ok: false, why: 'Suas mãos já estão ocupadas.' };
    return { ok: true, g, fit };
  };
  // one cast (in the world's step: the world's chance): what bites is that water's fish, by the people's way, the gear and
  // the hand; it leaves the ground and comes into the hands through the depot ('pesca', with its kind) — or nothing bites
  P.cast = function (v, x, y, o) {
    o = o || {};
    const how = o.how || P.how(G.Fac.idOfV(v)); const c = P.can(v, x, y, how); if (!c.ok) return c;
    if (!G.inSim) return { ok: false, why: '' }; // (a frame never fishes)
    // (fewer fish: fewer bites, and smaller hauls — what comes up follows what is left)
    const g = c.g; const ab = P.abundance(x, y); const civ = Math.min(1.3, G.Civ.tV(v, 'fish')); const sq = Math.sqrt(ab);
    if (G.R() >= Math.min(0.95, g.p * P.skill(v) * civ * sq)) return { ok: false, why: 'Nada mordeu.', miss: 1 };
    const n = P.take(x, y, Math.max(1, G.ri(g.n[0], g.n[1]) * c.fit * civ * sq));
    if (n < 1) return { ok: false, why: 'Nada mordeu.', miss: 1 };
    const fish = G.Waters.catchCarry(v, x, y, n); // (the kind, the chronicle's firsts, a piranha's bite)
    if (!G.S.villagers.has(v.id)) return { ok: false, why: '' };
    const F0 = G.Waters.FISH[fish.fish]; const nm0 = F0 ? F0.name : 'peixe';
    const room = D.room('v:' + v.id, fish.k, {}); const m = Math.min(fish.n, Math.floor(room + EPS));
    // (what does not fit in the hands goes back to the water — and to its ground: another kind in the hands, or hands full)
    if (m < fish.n) untake(x, y, fish.n - Math.max(0, m));
    const other = !!(v.carry && v.carry.n > EPS && v.carry.k !== fish.k);
    if (m < 1) return { ok: false, why: other ? 'Não há mão para outro peixe.' : 'Não cabe mais peixe nas mãos: leve ao armazém.', full: 1, other: other ? 1 : 0, name: nm0 };
    const r = D.make('v:' + v.id, fish.k, m, { code: 'pesca', by: v.id, rec: { fish: fish.fish } });
    if (!r.ok) { untake(x, y, m); return { ok: false, why: 'Não cabe mais peixe nas mãos.', full: 1, name: nm0 }; }
    v.fishXp = Math.min(240, (v.fishXp || 0) + 1);
    const F = G.Waters.FISH[fish.fish]; const nm = F ? F.name : 'peixe';
    return { ok: true, n: r.n, took: n, k: fish.k, fish: fish.fish, name: nm, how };
  };

  // ------------------------------ save ------------------------------
  // (only the grounds someone fished: what the last catch left and when; a save from before has none — every water full)
  const fin = x => typeof x === 'number' && isFinite(x);
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.pesca = G.S.pesca || {}; },
    load(o) {
      // (the book only when some ground was fished — as in the world that was saved: none fished, no book)
      const S = G.S; S.pesca = null; const src = o && o.pesca && typeof o.pesca === 'object' ? o.pesca : {};
      for (const id in src) { const g = src[id]; if (Array.isArray(g) && fin(g[0]) && fin(g[1]) && g[0] >= 0 && Number.isInteger(+id)) store()[id] = [g[0], g[1]]; }
    },
  });

  // ------------------------------ the god's body at the water ------------------------------
  // (the body fishes by the hands' own door — interact.js 'peixe', wading in the shallows —, which casts through
  // G.Pesca.cast with the hands' way: the same water, the same fish counted, the same chance of the world, the same line in
  // the ledger. No offer of its own here: an offer at every water's edge, among the activities' offers, came before the
  // bush, the crate on the quay and the fish in the hands — T-e)
  A.def('pesca', {
    name: 'Pescaria', conserve: false,
    purpose: 'Pescar o peixe daquela água, do jeito do seu povo, e levá-lo ao armazém (ou para casa).',
    needs: 'água com peixe ao alcance (um rio, um lago, o mar), sem gelo e sem tempestade',
    offers() { return []; },
  });
})(window.G);
