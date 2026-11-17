'use strict';
// ============================================================
//  Vida3D: the reader of the life that is seen (22c, SOCIEDADE.md
//  §4, D-590 to D-604). The world says, the 3D poses: what a person
//  is doing and how they are — their act, their errand, their age,
//  their tiredness, the cold and the heat of the place, the grief,
//  the drink — read here and handed to the animator (js/anim-*.js,
//  pure: rule 113) as the numbers of a frame. Only seen: nothing
//  here writes the world or draws from its chance (rule 213); the
//  variety comes from each one's id (G.hash), so the same person
//  always moves the same way, from any eye.
// ============================================================
(function (G) {
  const V3 = G.Vida3D = {};
  const Anim = G.Anim3D = G.Anim3D || {};
  const TAU = Math.PI * 2;
  const has = st => !!(st && ((Anim.ST && Anim.ST[st]) || (Anim.CLIPS && Anim.CLIPS[st])));

  // ------------------------------ the errand as a pose (TASK_OF) ------------------------------
  // What a person's task (v.task.type) shows when their act says nothing and they stand: a state of the drawing, or a function of
  // the task that gives one; MOVE — said on purpose, as the sound's still('…') — the pose is the movement's: the walk, the stance,
  // the act the errand gives at each step. Every task the world gives is here (rule 214)
  const MOVE = V3.MOVE = '';
  const TASK_OF = V3.TASK_OF = {
    // (the body's mark: drawn by its own controller)
    avatar: MOVE,
    // (in the water, asleep, on the move: the state already says it)
    swim: 'swim', dive: MOVE, sleep: MOVE, insone: MOVE, drift: MOVE, naufrago: MOVE,
    // (a fight with a beast, no blow this moment: on guard — the fists, or the thing in the hand)
    fight: (v, t, L) => { const h = L && L.inv ? L.inv : G.Inv && G.Inv.held ? G.Inv.held(v) : null; return h && h.mao ? 'cb-guarda-arma' : 'cb-guarda-punho'; },
    // (by the grave, between the steps of the rite: the head bowed, the hands to the face)
    funeral: 'mourn',
    // (the rest, given their own act by the world — sit, sittalk, cook, eat, pray, guard, wait, read, write, story… —; between two,
    // the stance or the walk)
    abastecer: MOVE, adeus: MOVE, ajudar: MOVE, amor: MOVE, apanhar: MOVE, appr: MOVE, arrumar: MOVE, assembly: MOVE, atacado: MOVE, atender: MOVE,
    atuar: MOVE, baleia: MOVE, banca: MOVE, band: MOVE, barco: MOVE, barraco: MOVE, boardBack: MOVE, build: MOVE, cais: MOVE, callwork: MOVE,
    carga: MOVE, cela: MOVE, celebrate: MOVE, chop: MOVE, citylife: MOVE, combat: MOVE, compra: MOVE, conclave: MOVE, condemned: MOVE, conferir: MOVE,
    contato: MOVE, copiar: MOVE, corpse: MOVE, court: MOVE, deliver: MOVE, descarga: MOVE, desk: MOVE, devolver: MOVE, dragao: MOVE, drill: MOVE,
    eat: MOVE, embark: MOVE, envoy: MOVE, escape: MOVE, escort: MOVE, escorted: MOVE, estaleiro: MOVE, estate: MOVE, expl: MOVE, explore: MOVE,
    family: MOVE, farm: MOVE, fest: MOVE, fetch: MOVE, fire: MOVE, fish: MOVE, flee: MOVE, fodder: MOVE, follow: MOVE, forage: MOVE,
    fornalha: MOVE, fugir: MOVE, fundo: MOVE, furto: MOVE, gather: MOVE, goHome: MOVE, guard: MOVE, haul: MOVE, herd: MOVE, hide: MOVE,
    honey: MOVE, horta: MOVE, hunt: MOVE, idle: MOVE, inquire: MOVE, jail: MOVE, justice: MOVE, lar: MOVE, lenhaTermas: MOVE, ler: MOVE,
    levado: MOVE, levar: MOVE, listen: MOVE, lured: MOVE, mariscar: MOVE, migrate: MOVE, mine: MOVE, minejob: MOVE, mint: MOVE, muster: MOVE,
    nestwatch: MOVE, oficio: MOVE, olhar: MOVE, ouro: MOVE, patrol: MOVE, pave: MOVE, penwork: MOVE, petition: MOVE, pick: MOVE, play: MOVE,
    pocas: MOVE, praca: MOVE, praia: MOVE, pray: MOVE, prender: MOVE, quarry: MOVE, redes: MOVE, reembarque: MOVE, refugio: MOVE, rest: MOVE,
    restock: MOVE, riot: MOVE, riotguard: MOVE, ronda: MOVE, sair: MOVE, sell: MOVE, shelter: MOVE, shop: MOVE, slaughter: MOVE, social: MOVE,
    steal: MOVE, talk: MOVE, tavern: MOVE, taxes: MOVE, teatro: MOVE, tell: MOVE, tend: MOVE, termas: MOVE, trade: MOVE, tribute: MOVE,
    vinho: MOVE, visit: MOVE, wander: MOVE, water: MOVE,
  };
  // the errand's own pace on the move: the children's chase is a run, never a walk (the world's «run» is the act's: the flight)
  const RUN_OF = { play: t => t.st === 2 && !!t.chase };
  V3.taskState = function (v, L) {
    const t = v.task; if (!t) return null; const k = TASK_OF[t.type]; if (!k) return null;
    const st = typeof k === 'function' ? k(v, t, L) : k; return has(st) ? st : null;
  };
  V3.runs = v => { const t = v.task, f = t && RUN_OF[t.type]; return !!(f && f(t)); };

  // ------------------------------ the state of a person ------------------------------
  // the state someone of the world is in, as an animation: from the world, every frame — swimming, asleep, on the move (walking,
  // running, carrying, creeping), thrown down, the act's own gesture (a clip: anim-clips.js), the act as a posture (Anim.ACT), the
  // errand as a pose (TASK_OF), the load in the hands, else standing. L (the look, when the frame has it): what the hands hold
  Anim.stateOf = function (v, sp, L) {
    if (v.task && v.task.type === 'swim') return 'swim';
    if (v.sleeping) return 'sleep';
    if (sp > 0.25) { if (v.act === 'sneak') return 'sneak'; if ((v.carry && v.carry.n > 0) || Anim.CARRY_ACTS.has(v.act)) return 'carryWalk'; return sp > 3.1 || v.act === 'run' || V3.runs(v) ? 'run' : 'walk'; }
    if (v.downT && v.downT > G.S.clock) return 'sleep';
    // (the act's own gesture, where there is a clip of it — the axe, the pick, the rod, the word, the prayer: anim-clips.js)
    const c = Anim.CLIP_OF && Anim.CLIP_OF[v.act]; if (c && Anim.CLIPS && Anim.CLIPS[c]) return c;
    const a = Anim.ACT[v.act]; if (a && a !== 'run') return a;
    if (!v.act) { const ts = V3.taskState(v, L); if (ts) return ts; }
    if (v.carry && v.carry.n > 0) return 'carry';
    return 'idle';
  };

  // ------------------------------ the act over the stride ------------------------------
  // what the top of someone walking shows of their act (I.over: a clip of the arms or the top, over the stride — the layer the
  // greeting's wave uses): the prisoner led with the hands bound, the word said walking (OVER_OF: the act → its walking clip)
  const OVER_OF = V3.OVER_OF = { bound: 'bound-andar', talk: 'talk', chat: 'talk', shout: 'talk', call: 'talk' };
  V3.overOf = function (v, st) {
    if (!Anim.LOCO || !Anim.LOCO[st] || !v.act) return null;
    const o = OVER_OF[v.act]; return o && Anim.CLIPS && Anim.CLIPS[o] ? o : null;
  };

  // ------------------------------ the body's state: tired ------------------------------
  // how tired a person shows (0..1): the energy the world's day takes (villagers.js needs: sleep comes under 22) — from 35 down
  V3.tired = v => (v.sleeping || !(v.energy < 35) ? 0 : G.clamp((35 - v.energy) / 25, 0, 1));

  // ------------------------------ the porte: how a body carries itself (22c fase 1, D-594) ------------------------------
  // Each cause read from the world, 0 (none) to 1 — the temperament −1..1, the limp's side −1 (left) or 1 (right) times how much:
  //   velho      the years past 55 (to 80)              crianca  the years under 12
  //   cansado    the day's energy from 35 down          frio     the cold of the place out of doors (G.Atmos.cold: 1, 2)
  //   calor      the heat of the place (G.Atmos.heat)   chuva    the rain out of doors, unsheltered
  //   doente     a sickness the world has (v.sick)      ferido   a wound of the last days, the blood lost (v.wound, v.hp)
  //   manca      a leg lost (v.lost.leg)                gravida  the months of the child (v.preg)
  //   luto       the grief (v.mourn)                    medo     the fear (v.fear), the fright of the moment (v.emo)
  //   furia      the god's fury, the anger of the moment confia   the bold and the shy: the temperament (G.Indole) or the traits
  //   expans     the open, the social                   nobre    the standing (v.grp): the nobles, the priests
  // Never the look nor the people (rule 194: the porte reads the life, not the face). `any`: some cause shows
  const PORTE = V3.PORTE = ['velho', 'crianca', 'cansado', 'frio', 'calor', 'chuva', 'doente', 'ferido', 'manca', 'gravida', 'luto', 'medo', 'furia', 'confia', 'expans', 'nobre'];
  const DAY = () => G.DAY_LEN || 200;
  const facet = (v, n, f) => { const I = G.Indole; if (I && I.de && I.de(v)) return G.clamp(I.faceta(v, n), 0, 1); return f; };
  const trait = (v, t) => !!(v.traits && v.traits.includes(t));
  const PO = {}; // (the answer of porteOf, reused: the frame copies it into each one's memory)
  V3.porteOf = function (v, out) {
    const r = out || PO; const S = G.S; const outdoors = !v.inside && !v.aboard && Number.isFinite(v.x);
    r.velho = G.clamp((v.age - 55) / 25, 0, 1); r.crianca = v.age < 12 ? G.clamp((12 - v.age) / 8, 0, 1) : 0;
    r.cansado = V3.tired(v);
    r.frio = outdoors && G.Atmos && G.Atmos.cold ? G.Atmos.cold(v.x, v.y) / 2 : 0;
    r.calor = outdoors && !r.frio && G.Atmos && G.Atmos.heat ? G.Atmos.heat(v.x, v.y) : 0;
    const w = S && S.weather; const sheltered = v.task && v.task.type === 'shelter';
    r.chuva = outdoors && !sheltered && w && w.rain > 0.3 ? G.clamp((w.rain - 0.3) / 0.5, 0, 1) : 0;
    r.doente = v.sick > 0 ? G.clamp(0.55 + v.sick / (DAY() * 0.8) * 0.45, 0, 1) : 0;
    const wd = v.wound && S && S.day - v.wound.d < 3 ? (v.wound.sev === 'grave' ? 1 : 0.5) : 0; r.ferido = Math.max(wd, v.hp < 50 ? G.clamp((50 - v.hp) / 40, 0, 1) : 0);
    r.manca = v.lost && v.lost.leg ? (G.hash(v.id * 7 + 3) < 0.5 ? -1 : 1) : 0;
    r.gravida = v.preg > 0 ? G.clamp(Math.sqrt(1 - v.preg / (DAY() * 0.55)), 0.25, 1) : 0;
    r.luto = v.mourn > 0 ? G.clamp(v.mourn / (DAY() * 0.3), 0.35, 1) : 0;
    const e = v.emo && v.emo.k; r.medo = Math.max(v.fear > 40 ? G.clamp((v.fear - 40) / 50, 0, 1) : 0, e === 'fear' || e === 'fire' ? 0.6 : 0);
    r.furia = Math.max(v.fury > 0 ? G.clamp(v.fury / 20, 0.5, 1) : 0, e === 'angry' ? 0.45 : 0);
    // (who one is: the temperament of the society's port, or — until it is filled — the traits of today)
    r.confia = (facet(v, 'confiante', trait(v, 'Corajoso') ? 0.8 : trait(v, 'Medroso') ? 0.2 : 0.5) - 0.5) * 2;
    r.expans = facet(v, 'extrovertido', trait(v, 'Sociável') ? 0.8 : 0.45);
    r.nobre = v.grp === 'nobreza' ? 1 : v.grp === 'sacerdotes' ? 0.6 : 0;
    r.any = r.velho > 0.15 || r.crianca > 0.15 || r.cansado > 0.15 || r.frio > 0 || r.calor > 0.15 || r.chuva > 0 || r.doente > 0 || r.ferido > 0.15 || r.manca !== 0 || r.gravida > 0 || r.luto > 0 || r.medo > 0.15 || r.furia > 0 || r.nobre > 0 || Math.abs(r.confia) > 0.4;
    return r;
  };
  // the porte kept in the view's memory of someone (s.porte), made again about twice a second — each one on their own beat by
  // their id — or at once when it was never made: what the animator reads (I.porte) between two readings is the last one
  V3.read = function (s, v, now) {
    if (!s.porte || !(now - s.pt < 0.45 + (v.id % 9) * 0.015)) { s.porte = V3.porteOf(v, s.porte || {}); s.pt = now; }
    return s.porte;
  };
  // (the hand a person leads with: one in ten left-handed, by the id — the gestures of their hands on the other side)
  V3.lefty = v => G.hash(v.id * 31 + 7) < 0.1;

  // ------------------------------ the look ------------------------------
  // the turn of the head someone wants toward the body: facing yaw at (X, Z), the body av, their state — only when they stand,
  // talk, carry or walk, the body within 6 m and somewhere in front of them (not behind their back)
  V3.lookFor = function (yaw, X, Z, av, st) {
    if (!av || !(st === 'idle' || st === 'talk' || st === 'carry' || st === 'interact' || st === 'walk')) return 0;
    const ax = av.X - X, az = av.Z - Z, ad = Math.hypot(ax, az); if (ad >= 6 || ad <= 0.3) return 0;
    let da = Math.atan2(az, ax) - yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    return Math.abs(da) < 1.9 ? -G.clamp(da, -1.05, 1.05) : 0;
  };
  // the one a person is with, by the errand the world gave them (the talk, the visit, the courting: t.id is the other)
  const WITH = new Set(['talk', 'social', 'court', 'visit', 'amor', 'adeus', 'contato']);
  V3.partnerOf = v => { const t = v.task; return t && WITH.has(t.type) && t.id ? G.S.villagers.get(t.id) || null : null; };
  // the look of a person this frame (the head's turn, radians): the body first, where it stands before them; else the one they
  // are with, where the view draws them (at: id → { X, Z }); else ahead
  V3.look = function (s, v, av, st, at) {
    const b = V3.lookFor(s.yaw, s.X, s.Z, av, st); if (b) return b;
    const o = V3.partnerOf(v); const p = o && at ? at(o.id) : null;
    return p ? V3.lookFor(s.yaw, s.X, s.Z, p, st) : 0;
  };
})(window.G);
