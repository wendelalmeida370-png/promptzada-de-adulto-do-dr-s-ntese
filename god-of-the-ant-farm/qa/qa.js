// QA harness injected into the page: deep invariants, canonical state, save audit
(function () {
  const QA = window.QA = {};
  const S = () => G.S;
  const P = id => S().villagers.get(id);
  const person = id => S().villagers.get(id) || S().dead.get(id);
  const fin = x => typeof x === 'number' && isFinite(x);
  // the memory of the dead is judged the moment the world forgets, at the turn of the year: later in the year a widow
  // marries again or the last grandchild dies, and that name rightly waits for the next turn (L-072)
  const staleDead = () => {
    const s = S(); const kin = new Set();
    for (const v of s.villagers.values()) { if (v.widow) kin.add(v.widow); for (const id of [v.mother, v.father]) { if (!id) continue; kin.add(id); const p = person(id); if (p) { if (p.mother) kin.add(p.mother); if (p.father) kin.add(p.father); } } }
    let n = 0, ex = null; for (const [id, d] of s.dead) if (s.day - (d.died || 0) >= 80 && !kin.has(id) && !G.Village.remembered(d)) { n++; ex = d; }
    return { day: s.day, world: s, n, ex };
  };
  if (G.Village.forget && !G.Village.forget.qa) { const f = G.Village.forget; G.Village.forget = function () { const r = f.apply(this, arguments); QA.memAfter = staleDead(); return r; }; G.Village.forget.qa = true; }

  // ---------------- invariants ----------------
  QA.check = function (opts) {
    opts = opts || {};
    const s = S(); const out = []; const N = G.N;
    const add = (sys, sev, msg, id) => { out.push({ sys, sev, msg, id: id || 0, day: s.day }); };
    const ships = new Map(s.ships.map(x => [x.id, x]));
    // ids: living and dead never overlap; nextId above every id
    let maxId = 0;
    for (const v of s.villagers.values()) { if (s.dead.has(v.id)) add('pop', 1, `${v.name} #${v.id} está vivo e morto ao mesmo tempo`, v.id); maxId = Math.max(maxId, v.id); }
    for (const b of s.buildings.values()) maxId = Math.max(maxId, b.id);
    for (const a of s.animals.values()) maxId = Math.max(maxId, a.id);
    if (s.nextId <= maxId) add('ids', 0, `nextId ${s.nextId} <= maior id ${maxId}: colisão possível`);
    // the world's chance lives in the world (and goes into the save): without it a loaded world would not live the same future
    if (G.VR && !Number.isInteger(s.rng)) add('ids', 1, `o acaso do mundo se perdeu (S.rng = ${s.rng})`);
    // the map of where one can walk to must match the ground as it is now (a change nobody told it about leaves it stale)
    if (G.W.reachIds && !opts.noReach) {
      const L = G.W.reachIds(true); const n = N * N; const T = G.T;
      const pass = i => { const t = s.type[i]; if ((t < T.RIVER && !(s.dry && s.dry[i])) || s.cliff[i] || G.W.blocked(i)) return false; if (t === T.RIVER && s.deep[i] && !s.road[i] && !(s.ice && s.ice[i])) return false; const w = s.wall[i]; return !w || w === 2 || w === 3 || w === 4; };
      let bad = 0, ex = '';
      for (let i = 0; i < n && bad < 50; i++) {
        const p = pass(i);
        if (p !== (L[i] >= 0)) { if (!bad) ex = `casa ${i % N},${(i / N) | 0} ${p ? 'pisável sem região' : 'com região mas não pisável'}`; bad++; continue; }
        if (!p) continue;
        if (i % N < N - 1 && pass(i + 1) && L[i + 1] !== L[i]) { if (!bad) ex = `casas vizinhas ${i % N},${(i / N) | 0} em regiões diferentes`; bad++; }
        if (i + N < n && pass(i + N) && L[i + N] !== L[i]) { if (!bad) ex = `casas vizinhas ${i % N},${(i / N) | 0} em regiões diferentes`; bad++; }
      }
      if (bad) add('path', 1, `mapa de alcance desatualizado: ${bad}${bad >= 50 ? '+' : ''} casas (${ex})`);
    }
    // ---- people
    const bandOf = new Map(), armyOf = new Map();
    if (G.War && G.War.bands) for (const b of G.War.bands.values()) for (const id of b.members || []) { if (bandOf.has(id)) add('war', 1, `#${id} em dois bandos (${bandOf.get(id)} e ${b.id})`, id); bandOf.set(id, b.id); }
    const wz = s.wz || {}; const armies = (wz.armies || []).filter(a => !a.done);
    for (const a of armies) for (const id of a.members || []) { if (armyOf.has(id)) add('war', 1, `#${id} em dois exércitos (${armyOf.get(id)} e ${a.id})`, id); armyOf.set(id, a.id); }
    for (const v of s.villagers.values()) {
      const nm = `${v.name} #${v.id}`;
      if (!fin(v.x) || !fin(v.y)) { add('pop', 0, `${nm}: posição inválida ${v.x},${v.y}`, v.id); continue; }
      if (v.x < 0 || v.y < 0 || v.x >= N || v.y >= N) add('pop', 1, `${nm}: fora do mapa`, v.id);
      for (const k of ['age', 'hp', 'hunger', 'energy']) if (!fin(v[k])) add('pop', 1, `${nm}: ${k} = ${v[k]}`, v.id);
      if (v.hp <= 0) add('pop', 1, `${nm}: vivo com hp ${v.hp}`, v.id);
      // (a talk, a hug, a dance with someone: a moment, never forever — a wait that is not a number never runs out)
      if (v.task && v.task.type === 'talk' && (!fin(v.task.wait) || v.task.wait > (v.task.hug ? 3.01 : v.task.dance ? 10.01 : 4.01))) add('ai', 2, `${nm}: ${v.task.hug ? 'abraço' : v.task.dance ? 'dança' : 'conversa'} que não acaba (espera ${v.task.wait})`, v.id);
      // (a fish in the hands is a fish of the world's waters, carried as its food or as its good)
      if (v.carry && typeof v.carry.fish === 'string') { const F = G.Waters && G.Waters.FISH[v.carry.fish]; if (!F) add('eco', 3, `${nm}: carrega um peixe que não existe (${v.carry.fish})`, v.id); else if (v.carry.k !== 'food' && v.carry.k !== F.good) add('eco', 3, `${nm}: carrega ${F.name} como ${v.carry.k}`, v.id); if (!fin(v.carry.n) || v.carry.n <= 0) add('eco', 3, `${nm}: carga de peixe ${v.carry.n}`, v.id); }
      if (!s.settlements.has(v.set)) add('pop', 2, `${nm}: povoado ${v.set} não existe (captive=${!!v.captive})`, v.id);
      { const set = s.settlements.get(v.set); if (set && !v.captive && !v.aboard && !v.ug && !v.wrecked && v.age >= 3 && !(G.Expe && G.Expe.memberOf(v.id)) && !(v.task && (v.task.type === 'band' || v.task.type === 'swim' || v.task.type === 'naufrago' || v.task.type === 'muster')) && !(G.W.reachesTown ? G.W.reachesTown(v, set) : G.W.sameLand(v.x, v.y, set.cx, set.cy))) add('pop', v._stray && s.day - v._stray >= 2 ? 2 : 3, `${nm}: mora em ${set.name}, numa terra aonde não chega a pé${v._stray && s.day - v._stray >= 2 ? ' há ' + (s.day - v._stray) + ' dias' : ' (recente)'} (${v.task ? v.task.type : '-'})`, v.id); }
      const f = G.Fac.ofV(v); if (f && !f.alive) add('pop', 1, `${nm}: pertence a povo extinto ${f.name}`, v.id);
      if (v.home) { const h = s.buildings.get(v.home); if (!h) add('pop', 2, `${nm}: casa ${v.home} não existe`, v.id); else if (h.set !== v.set && !v.captive) add('pop', 3, `${nm}: mora em outro povoado (${h.set} ≠ ${v.set})`, v.id); }
      if (v.partner) {
        const p = P(v.partner);
        { const p = v.partner && P(v.partner); if (p && (p.id === v.mother || p.id === v.father || v.id === p.mother || v.id === p.father || (v.mother && v.mother === p.mother) || (v.father && v.father === p.father))) add('fam', 2, `${nm}: companheiro ${p.name} é parente próximo`, v.id); }
        if (v.partner === v.id) add('fam', 1, `${nm}: companheiro de si mesmo`, v.id);
        else if (p && p.partner !== v.id) add('fam', 2, `${nm}: companheiro ${p.name} não corresponde (aponta para ${p.partner})`, v.id);
        else if (!p && !s.dead.has(v.partner)) add('fam', 2, `${nm}: companheiro ${v.partner} sumiu`, v.id);
        else if (!p) add('fam', 2, `${nm}: companheiro ${v.partner} morto mas ainda registrado`, v.id);
      }
      for (const k of ['mother', 'father']) {
        const pid = v[k]; if (!pid) continue;
        if (pid === v.id) { add('fam', 0, `${nm}: ${k} de si mesmo`, v.id); continue; }
        const q = person(pid); if (!q) { add('fam', 3, `${nm}: ${k} ${pid} desconhecido`, v.id); continue; }
        const qb = q.born !== undefined ? q.born : s.day - q.age; const vb = v.born !== undefined ? v.born : s.day - v.age;
        if (fin(qb) && fin(vb) && vb - qb < 11) add('fam', 1, `${nm}: ${k} ${q.name} nasceu só ${(vb - qb).toFixed(1)} anos antes`, v.id);
        if (q.kids && !q.kids.includes(v.id)) add('fam', 3, `${nm}: ${k} ${q.name} não lista este filho`, v.id);
      }
      if (v.mother && v.mother === v.father) add('fam', 1, `${nm}: mãe e pai são a mesma pessoa`, v.id);
      // ancestors: no cycle (bounded walk)
      { let seen = new Set([v.id]), q = [v.mother, v.father], n = 0; while (q.length && n++ < 200) { const id = q.shift(); if (!id) continue; if (seen.has(id)) { if (id === v.id) add('fam', 0, `${nm}: é ancestral de si mesmo`, v.id); continue; } seen.add(id); const a = person(id); if (a) q.push(a.mother, a.father); } }
      if (v.aboard) { const sh = ships.get(v.aboard); if (!sh) add('sea', 1, `${nm}: a bordo do navio ${v.aboard} que não existe`, v.id); else { if (sh.sunk) add('sea', 1, `${nm}: a bordo de navio afundado`, v.id); if (!(sh.crew || []).includes(v.id)) add('sea', 2, `${nm}: a bordo de ${sh.kind}#${sh.id} mas fora da tripulação`, v.id); } }
      const t = v.task;
      if (t) {
        if (t.type === 'band') { const b = G.War.bands.get(t.band); if (!b) add('war', 2, `${nm}: tarefa de bando ${t.band} sem bando`, v.id); else if (!(b.members || []).includes(v.id)) add('war', 2, `${nm}: no bando ${b.id} mas fora da lista`, v.id); }
        if (t.type === 'muster' || t.army) { const a = (wz.armies || []).find(x => x.id === t.army); if (t.army && (!a || a.done) && t.type === 'muster') add('war', 2, `${nm}: reunindo-se a exército ${t.army} ${a ? 'encerrado' : 'inexistente'}`, v.id); }
        if (t.type === 'scene' && G.Scene && !G.Scene.list.some(x => x.id === t.sc && x.st === 'run')) add('scene', 1, `${nm}: preso numa cena que não está rodando`, v.id);
        if (t.type === 'escorted' && !P(t.by)) add('war', 2, `${nm}: escoltado por ${t.by} que não existe`, v.id);
        if (t.type === 'escorted' && !v.captive) add('war', 2, `${nm}: escoltado sem ser cativo`, v.id);
        if (t.type === 'aboard' && !v.aboard) add('sea', 2, `${nm}: tarefa 'aboard' em terra`, v.id);
        if ((t.type === 'combat' || t.type === 'fight') && t.id && t.age > 60) add('ai', 3, `${nm}: combate há ${Math.round(t.age)} s`, v.id);
        if (t.age > G.DAY_LEN * 3 && !{ aboard: 1, jail: 1, band: 1, swim: 0, scene: 0 }[t.type] && !t.saga) add('ai', 3, `${nm}: mesma tarefa '${t.type}' há ${(t.age / G.DAY_LEN).toFixed(1)} dias`, v.id);
      }
      if (v.captive) {
        const cf = G.Fac.get(v.captive.from);
        if (v.captive.from === G.Fac.idOfV(v)) add('war', 2, `${nm}: cativo do próprio povo`, v.id);
      }
      if ((v._pfN || 0) >= 6) add('path', 3, `${nm}: ${v._pfN} caminhos falhos seguidos (${t ? t.type : '-'})`, v.id);
      if (v.age < 2 && v.carried) continue;
      const i = G.W.idx(v.x, v.y);
      // (the bed of a sea the god parted is ground while it stays open)
      if (!v.aboard && !v.ug && !v.held && s.type[i] === G.T.DEEP && !(s.dry && s.dry[i]) && !(t && (t.type === 'swim' || t.type === 'naufrago'))) add('pop', 2, `${nm}: em mar profundo sem nadar (${t ? t.type : '-'})`, v.id);
    }
    // dead ones are nowhere among the living
    for (const [id, bid] of bandOf) { const v = P(id); if (!v) add('war', 1, `bando ${bid}: membro morto/inexistente #${id}`, id); else if (!v.task || v.task.type !== 'band' || v.task.band !== bid) { const b = G.War.bands.get(bid); if (!(b && b.campaign)) add('war', 3, `bando ${bid}: membro #${id} sem tarefa de bando (${v.task ? v.task.type : '-'})`, id); } }
    for (const a of armies) {
      const live = (a.members || []).filter(id => P(id));
      if ((a.members || []).length && !live.length) add('war', 2, `exército ${a.name}: todos os membros mortos, mas ativo (${a.phase})`);
      const w = (wz.wars || []).find(x => x.id === a.war); if (!w) add('war', 1, `exército ${a.name}: guerra ${a.war} não existe`); else if (w.end) {
        // (after the peace an army walks home and is closed when its band gets there, as on the screen: only one still
        // marching, camped, besieging or fighting is wrong — or one that never gets home — T-021)
        if (a.phase !== 'retorno' && a.phase !== 'retirada' && a.phase !== 'dispersado') add('war', 1, `exército ${a.name}: ativo (${a.phase}) numa guerra que terminou no ano ${w.end}`);
        else if (S().day - w.end > 2) add('war', 3, `exército ${a.name}: voltando para casa há ${S().day - w.end} anos, desde o fim da guerra`);
      }
      if (!G.Fac.get(a.fac) || !G.Fac.get(a.fac).alive) add('war', 1, `exército ${a.name}: povo ${a.fac} extinto`);
      if (S().day - (a.day || 0) > 40) add('war', 3, `exército ${a.name}: em campo há ${S().day - a.day} anos (${a.phase})`);
    }
    for (const w of (wz.wars || [])) {
      if (w.end) continue;
      const sidesA = w.a.filter(id => G.Fac.get(id) && G.Fac.get(id).alive), sidesB = w.b.filter(id => G.Fac.get(id) && G.Fac.get(id).alive);
      // (a people that has just fallen: its wars close at the next tick of the war, half a second on — T-026)
      const fresh = id => { const f = G.Fac.get(id); return f && !f.alive && fin(f.diedT) && s.clock - f.diedT < 1; };
      if (w.a.concat(w.b).some(fresh)) { /* closing */ }
      else if (!sidesA.length || !sidesB.length) add('war', 2, `guerra ${w.name}: um dos lados não existe mais e ela segue`);
      else if (!sidesA.some(a => sidesB.some(b => G.Fac.atWar(a, b)))) add('war', 2, `guerra ${w.name}: ativa sem nenhum par em guerra`);
      if (s.day - w.start > 60) add('war', 3, `guerra ${w.name}: dura ${s.day - w.start} anos`);
    }
    for (const b of (wz.battles || [])) if (b.open && b.t0 !== undefined && s.clock - b.t0 > G.DAY_LEN * 2) add('war', 2, `batalha ${b.name}: aberta há ${((s.clock - b.t0) / G.DAY_LEN).toFixed(1)} dias`);
    if (G.War && G.War.bands) for (const b of G.War.bands.values()) {
      if (!G.Fac.get(b.fac) || !G.Fac.get(b.fac).alive) add('war', 1, `bando ${b.id}: povo extinto`);
      if (b.enemy && !G.Fac.atWar(b.fac, b.enemy) && b.st !== 'retorno' && b.goal !== 'defesa') add('war', 2, `bando ${b.id} (${b.st}): marcha contra ${b.enemy} sem guerra`);
      if (b.life > G.DAY_LEN * 6) add('war', 3, `bando ${b.id}: existe há ${(b.life / G.DAY_LEN).toFixed(1)} dias (${b.st})`);
    }
    // ---- peoples
    for (const f of s.factions.values()) {
      if (!f.alive) continue;
      const sets = G.Fac.settlementsOf(f.id); const pop = G.Fac.pop(f.id);
      if (!sets.length) add('pol', 1, `${f.name}: vivo sem povoado`);
      if (!G.Fac.capitalOf(f.id)) add('pol', 1, `${f.name}: sem capital`);
      else if (G.Fac.capitalOf(f.id).fac !== f.id) add('pol', 1, `${f.name}: capital pertence a outro povo`);
      if (f.leader) { const l = P(f.leader); if (!l) add('pol', 1, `${f.name}: governante ${f.leader} não está vivo`); else if (G.Fac.idOfV(l) !== f.id && !l.captive) add('pol', 2, `${f.name}: governante ${l.name} é de outro povo`); }
      else if (pop >= 4) add('pol', 3, `${f.name}: ${pop} almas e nenhum governante`);
      if (!pop) add('pol', 2, `${f.name}: vivo sem ninguém`);
      for (const k in f.stock) { const x = f.stock[k]; if (typeof x === 'number' && (!isFinite(x) || x < -0.01)) add('eco', 1, `${f.name}: estoque ${k} = ${x}`); }
      for (const k in f.rel) { const g = s.factions.get(+k); if (!g) { add('pol', 3, `${f.name}: relação com povo inexistente ${k}`); continue; } if (g.rel[f.id] !== f.rel[k]) add('pol', 1, `${f.name}↔${g.name}: relação não é o mesmo objeto dos dois lados`); const r = f.rel[k]; if (r.st === 'guerra' && !g.alive) add('pol', 3, `${f.name}: em guerra com povo extinto ${g.name}`); }
      const other = [...s.factions.values()].filter(g => g !== f && g.alive && g.leader && g.leader === f.leader); if (other.length) add('pol', 1, `${f.name}: governante compartilhado com ${other[0].name}`);
    }
    for (const st of s.settlements.values()) { const f = G.Fac.get(st.fac); if (!f) add('pol', 1, `povoado ${st.name}: povo ${st.fac} não existe`); else if (!f.alive) add('pol', 1, `povoado ${st.name}: povo extinto ${f.name}`); }
    // ---- buildings
    for (const b of s.buildings.values()) {
      if (!fin(b.x) || !fin(b.y)) add('city', 1, `prédio ${b.type}#${b.id}: posição inválida`);
      if (b.set && !s.settlements.has(b.set) && b.type !== 'ruin') add('city', 2, `prédio ${b.type}#${b.id}: povoado ${b.set} não existe`);
      if (b.hp !== undefined && !fin(b.hp)) add('city', 1, `prédio ${b.type}#${b.id}: hp ${b.hp}`);
      if (b.progress !== undefined && (!fin(b.progress) || b.progress < -0.001 || b.progress > 1.001)) add('city', 2, `prédio ${b.type}#${b.id}: progresso ${b.progress}`);
      if (b.built && b.progress !== undefined && b.progress < 0.999 && !b.upgradeFrom) add('city', 3, `prédio ${b.type}#${b.id}: pronto com progresso ${b.progress}`);
      for (const k in b.need || {}) if (!fin(b.need[k]) || b.need[k] < -0.01) add('city', 2, `prédio ${b.type}#${b.id}: falta ${k} = ${b.need[k]}`);
      if (fin(b.x) && fin(b.y)) { let bad = 0, by = 0; for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) { const o = s.occ[ty * G.N + tx]; if (o !== b.id) { bad++; by = o; } } if (bad) add('city', 2, `prédio ${b.type}#${b.id}: ${bad} casa(s) do terreno marcadas como de ${by ? (s.buildings.get(by) ? s.buildings.get(by).type + '#' + by : 'fantasma #' + by) : 'ninguém'}`); }
    }
    // a block of a metropolis keeps a walkable ring: no building that blocks touches it, not even one it did not pull down (L-077)
    for (const b of s.buildings.values()) {
      if (b.type !== 'quarteirao' || !fin(b.x) || !fin(b.y)) continue;
      let by = null; for (let ty = b.y - 1; ty <= b.y + b.h && !by; ty++) for (let tx = b.x - 1; tx <= b.x + b.w; tx++) { if (ty >= b.y && ty < b.y + b.h && tx >= b.x && tx < b.x + b.w) continue; if (tx < 0 || ty < 0 || tx >= G.N || ty >= G.N) continue; const o = s.buildings.get(s.occ[ty * G.N + tx]); if (o && o.blocks && o !== b) { by = o; break; } }
      if (by) add('city', 3, `quarteirão#${b.id}: ${by.type}#${by.id} encostado nele (o anel de passagem fechou)`);
    }
    { let ghost = 0, ex = 0; for (let i = 0; i < s.occ.length; i++) { const o = s.occ[i]; if (o && !s.buildings.has(o)) { ghost++; ex = o; } } if (ghost) add('city', 2, `${ghost} casa(s) do mapa ocupadas por prédio inexistente #${ex}`); }
    // ---- the memory of the dead: cemeteries hold twelve, a grave and its record agree, nobody is kept past three
    // generations unless they mattered or the living are their children and grandchildren (L-072)
    for (const b of s.buildings.values()) {
      if (b.type !== 'cemetery') continue;
      const gr = b.graves || []; if (gr.length > 12) add('mem', 3, `cemitério #${b.id}: ${gr.length} túmulos (cabem 12)`);
      for (const id of gr) { const d = s.dead.get(id); if (d && d.grave !== b.id) add('mem', 3, `cemitério #${b.id}: o túmulo de ${d.name} #${id} aponta para ${d.grave}`); }
    }
    for (const [id, d] of s.dead) if (d.grave) { const b = s.buildings.get(d.grave); if (b && (b.type !== 'cemetery' || !(b.graves || []).includes(id))) add('mem', 3, `${d.name} #${id}: enterrado no cemitério ${d.grave}, que não guarda seu túmulo`); }
    { const m = QA.memAfter; if (m && m.world === s && m.day === s.day && m.n) add('mem', 3, `na virada do ano ficaram ${m.n} morto(s) de mais de 80 anos que ninguém lembra (ex.: ${m.ex.name}, ano ${m.ex.died})`); }
    // ---- quarters of the towns
    if (G.Urban) {
      const owner = new Map(); const NC = Math.ceil(G.N / G.Urban.C);
      for (const st of s.settlements.values()) {
        const u = st.urb; if (!u) continue;
        if (!Array.isArray(u.d)) { add('urb', 1, `${st.name}: bairros não são uma lista`); continue; }
        const names = new Set();
        for (const d of u.d) {
          const nm = `bairro ${d && d.name}#${d && d.id} de ${st.name}`;
          if (!d || !d.id || typeof d.name !== 'string' || !d.name) { add('urb', 1, `${st.name}: bairro sem id ou sem nome`); continue; }
          if (d.set !== st.id) add('urb', 2, `${nm}: diz ser do povoado ${d.set}`);
          if (!G.Urban.KINDS[d.k]) add('urb', 2, `${nm}: vocação desconhecida ${d.k}`);
          if (names.has(d.name.toLowerCase())) add('urb', 2, `${nm}: nome repetido na mesma cidade`); names.add(d.name.toLowerCase());
          if (!Array.isArray(d.cells) || (!d.cells.length && !(d.gone > 0))) add('urb', 2, `${nm}: sem chão`);
          else for (const c of d.cells) { if (!Number.isInteger(c) || c < 0 || c >= NC * NC) { add('urb', 1, `${nm}: célula inválida ${c}`); break; } const o = owner.get(c); if (o && o !== d) add('urb', o.set === d.set ? 2 : 4, `${nm}: divide o chão com ${o.name}${o.set === d.set ? '' : ' (de outra cidade: na virada do dia, um passo)'}`); owner.set(c, d); }
          if (!fin(d.x) || !fin(d.y)) add('urb', 2, `${nm}: centro inválido`);
          if (!(d.born <= s.day)) add('urb', 2, `${nm}: nasceu no futuro (${d.born})`);
          if (d.hist && !Array.isArray(d.hist)) add('urb', 2, `${nm}: história não é uma lista`);
        }
        // (judged by the town's look of the day: one that fell to a village since has not seen its quarters start to fade — T-023)
        const look = G.Urban.peek(st.id);
        if ((st.tier || 0) < 2 && look && look.rank !== undefined && look.rank < 2 && u.d.some(d => d.k !== 'agrario' && (d.gone || 0) === 0)) add('urb', 3, `${st.name}: ${G.City.tierName(st).toLowerCase()} com bairro que não é de campos`);
      }
    }
    // ---- the life of the towns (gardens, shacks, the quay, purses, thefts, the jail)
    {
      const jails = new Map();
      for (const b of s.buildings.values()) {
        if (b.type === 'horta') { const h = s.buildings.get(b.home); if (!h) add('urb', 3, `horta#${b.id}: sem a casa ${b.home}`); if (!fin(b.g || 0) || (b.g || 0) < 0 || (b.g || 0) > 1.0001) add('urb', 2, `horta#${b.id}: crescimento ${b.g}`); }
        if (b.type === 'cadeia') jails.set(b.id, 0);
        if (b.crates && b.crates.length > 10) add('urb', 3, `${b.type}#${b.id}: ${b.crates.length} caixas no cais (máximo 10)`);
        if (b.crates) for (const c of b.crates) if (!c || !fin(c.n) || c.n <= 0) { add('urb', 2, `${b.type}#${b.id}: caixa vazia ou inválida no cais`); break; }
        if (b.coin !== undefined && (!fin(b.coin) || b.coin < -0.01)) add('urb', 2, `${b.type}#${b.id}: ${b.coin} moedas na casa`);
      }
      for (const v of s.villagers.values()) {
        const nm = `${v.name} #${v.id}`;
        if (v.purse !== undefined && (!fin(v.purse) || v.purse < -0.01)) add('urb', 2, `${nm}: bolso com ${v.purse} moedas`);
        if (v._q && G.Life && G.Life.inQueue && !G.Life.inQueue(v)) add('urb', 2, `${nm}: acha que está na fila ${v._q}, que não o conhece (L-085)`);
        if (v.jail) {
          const b = s.buildings.get(v.jail);
          if (!b || b.type !== 'cadeia') add('urb', 2, `${nm}: preso numa cadeia que não existe (${v.jail})`);
          else jails.set(b.id, (jails.get(b.id) || 0) + 1);
          if (!(v.jailUntil >= 0) || v.jailUntil > s.day + 6) add('urb', 2, `${nm}: pena até o ano ${v.jailUntil}`);
          if (!(v.task && (v.task.type === 'cela' || v.task.type === 'levado'))) add('urb', 3, `${nm}: preso fora da cela (${v.task ? v.task.type : '-'})`);
        }
        if (v.rua && !(v.rua <= s.day)) add('urb', 3, `${nm}: sem casa desde o futuro (${v.rua})`);
      }
      for (const [id, n] of jails) if (n > ((G.BDEF.cadeia && G.BDEF.cadeia.cells) || 4)) add('urb', 2, `cadeia#${id}: ${n} presos para ${G.BDEF.cadeia.cells} celas`);
      for (const c of s.crimes || []) {
        if (!c || !c.id || !fin(c.n) || c.n < 0) { add('urb', 2, 'crime sem id ou com valor inválido'); continue; }
        if (!s.villagers.has(c.thief) && !s.dead.has(c.thief)) add('urb', 3, `crime#${c.id}: ladrão ${c.thief} não existe`);
        if (!(c.day <= s.day)) add('urb', 2, `crime#${c.id}: no futuro`);
      }
    }
    // ---- the god's gifts to the towns (citygifts.js): gold on the ground lies where one can walk, the wine flows in a town that exists
    if (s.gifts) {
      const g = s.gifts; const T = G.T;
      if (!Array.isArray(g.piles) || !Array.isArray(g.rains) || !Array.isArray(g.wine)) add('gift', 1, 'S.gifts sem as listas de ouro e vinho');
      else {
        if (g.rains.filter(r => !r.from).length > 2) add('gift', 3, `${g.rains.length} chuvas de ouro ao mesmo tempo (máximo 2)`);
        for (const rn of g.rains) {
          if (!fin(rn.t) || !(rn.drops >= 0) || !fin(rn.street) || !fin(rn.n)) { add('gift', 2, `chuva de ouro#${rn.id}: contas inválidas`); continue; }
          // every coin that fell in the street is in a pile, in somebody's hands, in the town's store, or sunk
          let left = 0; for (const q of g.piles) if (q.rain === rn.id) left += q.n;
          const sum = Object.values(rn.got || {}).reduce((a, b) => a + b, 0);
          if (Math.abs(rn.street - (rn.n + left + rn.found + rn.sunk)) > 0.01) add('gift', 2, `chuva de ouro#${rn.id}: caíram ${rn.street} moedas na rua, ${rn.n} catadas + ${left} no chão + ${rn.found} achadas + ${rn.sunk} perdidas`);
          if (Math.abs(sum - rn.n) > 0.01) add('gift', 2, `chuva de ouro#${rn.id}: ${rn.n} catadas, mas as mãos somam ${sum}`);
        }
        for (const q of g.piles) {
          if (!fin(q.x) || !fin(q.y) || !(q.n > 0) || !fin(q.t)) { add('gift', 1, `ouro#${q.id}: monte inválido`); continue; }
          if (q.x < 0 || q.y < 0 || q.x >= N || q.y >= N) { add('gift', 1, `ouro#${q.id}: fora do mapa`); continue; }
          const i = G.W.idx(q.x, q.y);
          if (s.type[i] < T.SAND || !G.W.walkable(i)) add('gift', 2, `ouro#${q.id}: ${q.n} moedas onde ninguém pisa (${q.x.toFixed(1)},${q.y.toFixed(1)})`);
          if (s.clock - q.t > G.DAY_LEN * 3 + 2) add('gift', 3, `ouro#${q.id}: no chão há mais de três dias`);
        }
        const towns = new Set();
        for (const w of g.wine) {
          if (!s.settlements.has(w.set)) add('gift', 2, `vinho#${w.id}: a cidade ${w.set} não existe`);
          if (towns.has(w.set)) add('gift', 2, `vinho#${w.id}: dois vinhos na mesma cidade`); towns.add(w.set);
          if (!fin(w.until) || w.until - s.clock > G.DAY_LEN * 0.5 + 0.01) add('gift', 2, `vinho#${w.id}: dura até ${w.until}`);
        }
      }
    }
    // ---- the dead who walk (beyond.js): a haunt has its cemetery, a ghost is someone dead (one brought back is no ghost)
    if (s.beyond) {
      const b = s.beyond;
      if (!Array.isArray(b.haunts)) add('alem', 1, 'S.beyond sem a lista de assombrações');
      else for (const h of b.haunts) {
        const cem = s.buildings.get(h.cem);
        if (!cem || cem.type !== 'cemetery') add('alem', 2, `assombração#${h.id}: o cemitério ${h.cem} não existe`);
        if (!fin(h.until) || h.until - s.day > 2) add('alem', 2, `assombração#${h.id}: dura até o ano ${h.until}`);
        if (!Array.isArray(h.ghosts) || h.ghosts.length > 6) add('alem', 3, `assombração#${h.id}: ${h.ghosts ? h.ghosts.length : '?'} fantasmas (máximo 6)`);
        for (const g of h.ghosts || []) {
          if (!fin(g.x) || !fin(g.y) || g.x < 0 || g.y < 0 || g.x >= N || g.y >= N) { add('alem', 1, `fantasma#${g.id}: posição inválida`); continue; }
          if (s.villagers.has(g.vid)) add('alem', 2, `fantasma de ${g.name} #${g.vid}, que está vivo`);
          else if (!s.dead.has(g.vid)) add('alem', 3, `fantasma de ${g.name} #${g.vid}, que nem o registro dos mortos lembra`);
        }
      }
    }
    // ---- hearts, blades and dreams (fates.js): an arrow of love is short and between two free people; one duel at a time,
    // between two of peoples at war; a dream is of a people that exists
    if (s.fates) {
      const F = s.fates;
      if (!Array.isArray(F.loves) || !Array.isArray(F.duels) || !Array.isArray(F.dreams)) add('fado', 1, 'S.fates sem as listas de amores, duelos e sonhos');
      else {
        const inLove = new Set();
        for (const l of F.loves) {
          if (!fin(l.t) || l.t > 151) add('fado', 2, `amor#${l.id}: dura ${l.t}s (máximo 150)`);
          for (const id of [l.a, l.b]) { if (inLove.has(id)) add('fado', 2, `amor#${l.id}: #${id} em dois amores ao mesmo tempo`); inLove.add(id); }
          const a = P(l.a), b = P(l.b);
          if (!l.done && a && b && ((a.partner && a.partner !== b.id) || (b.partner && b.partner !== a.id))) add('fado', 3, `amor#${l.id}: ${a.name} e ${b.name} correm um para o outro, mas um deles já tem par`);
        }
        if (F.duels.length > 1) add('fado', 2, `${F.duels.length} duelos de campeões ao mesmo tempo`);
        for (const d of F.duels) {
          if (!fin(d.t) || d.t > 91) add('fado', 2, `duelo#${d.id}: dura ${d.t}s (máximo 90)`);
          if (!fin(d.x) || !fin(d.y)) add('fado', 1, `duelo#${d.id}: lugar inválido`);
          if (d.a === d.b) add('fado', 1, `duelo#${d.id}: um campeão contra si mesmo`);
        }
        for (const d of F.dreams) if (!s.factions.has(d.fac) || !['obra', 'paz', 'fe', 'mar'].includes(d.k)) add('fado', 3, `sonho de ${d.fac}: povo ou sonho desconhecido (${d.k})`);
      }
    }
    // ---- the sudden winter (winter.js): the ice is on deep water only, and there is ice where — and only where — a winter froze it
    {
      const L = s.winters || []; const T = G.T; const mine = new Set();
      for (const w of L) {
        if (!fin(w.t) || w.t > G.DAY_LEN + 1) add('gelo', 2, `inverno#${w.id}: dura ${w.t}s (máximo ${G.DAY_LEN})`);
        for (const i of w.tiles || []) { mine.add(i); if (s.type[i] !== T.RIVER || !s.deep[i]) add('gelo', 2, `inverno#${w.id}: gelo na casa ${i % N},${(i / N) | 0}, que não é água funda`); if (!(s.ice && s.ice[i])) add('gelo', 2, `inverno#${w.id}: a casa ${i % N},${(i / N) | 0} deveria estar congelada`); }
      }
      if (s.ice) { let stray = 0, ex = -1; for (let i = 0; i < s.ice.length; i++) if (s.ice[i] && !mine.has(i)) { stray++; if (ex < 0) ex = i; } if (stray) add('gelo', 2, `${stray} casa(s) de gelo sem inverno (ex.: ${ex % N},${(ex / N) | 0})`); }
    }
    // ---- the parted sea (seapart.js): the bed is dry where — and only where — an open parting holds the water back
    {
      const L = s.parts || []; const T = G.T; const mine = new Set(); const D = s.dry; const ST = { abre: 1, aberto: 1, fecha: 1 };
      if (L.length > 2) add('marAberto', 3, `${L.length} mares abertos ao mesmo tempo (máximo 2)`);
      for (const p of L) {
        const nm = `mar aberto#${p.id}`;
        if (!ST[p.st]) add('marAberto', 1, `${nm}: estado desconhecido (${p.st})`);
        if (!fin(p.t) || p.t > G.DAY_LEN * 0.75 + 1) add('marAberto', 2, `${nm}: aberto há ${p.t}s (máximo ${G.DAY_LEN * 0.75})`);
        for (const i of p.tiles || []) {
          if (s.type[i] > T.SEA) add('marAberto', 2, `${nm}: a casa ${i % N},${(i / N) | 0} do fundo não é mar`);
          if (p.st === 'abre') { if (D && D[i]) add('marAberto', 2, `${nm}: ainda se abrindo, mas a casa ${i % N},${(i / N) | 0} já é chão`); }
          else { mine.add(i); if (!(D && D[i])) add('marAberto', 2, `${nm}: a casa ${i % N},${(i / N) | 0} deveria estar seca`); }
        }
      }
      if (D) { let stray = 0, ex = -1; for (let i = 0; i < D.length; i++) if (D[i] && !mine.has(i)) { stray++; if (ex < 0) ex = i; } if (stray) add('marAberto', 2, `${stray} casa(s) de fundo seco sem mar aberto (ex.: ${ex % N},${(ex / N) | 0})`); }
      if (D) {
        for (const sh of s.ships) if (G.W.inb(sh.x, sh.y) && D[G.W.idx(sh.x, sh.y)]) add('marAberto', 2, `${sh.kind}#${sh.id}: navio encalhado no fundo do mar aberto`);
        for (const a of s.animals.values()) { if (a.dead || !G.W.inb(a.x, a.y) || !D[G.W.idx(a.x, a.y)]) continue; const sp = G.Animals.DEF[a.kind]; if (sp && sp.cls === 'water') add('marAberto', 3, `${a.kind}#${a.id}: bicho do mar na areia do fundo`); }
        for (const v of s.villagers.values()) if (v.task && v.task.type === 'swim' && G.W.inb(v.x, v.y) && D[G.W.idx(v.x, v.y)]) add('marAberto', 3, `${v.name}#${v.id}: nadando em chão seco`);
      }
      for (const v of s.villagers.values()) if (v.task && (v.task.type === 'fundo' || v.task.type === 'sair') && !L.some(p => p.id === v.task.part)) add('marAberto', 3, `${v.name}#${v.id}: ${v.task.type} num mar aberto que já se fechou`);
    }
    // ---- the incarnation (possess.js): one body lent to the player, and only while it can be lived
    {
      const a = s.avatar; const KINDS = (G.Possess && G.Possess.KINDS) || {};
      let marked = 0;
      for (const v of s.villagers.values()) if (v.task && v.task.type === 'avatar') { marked++; if (!a || a.id !== v.id) add('avatar', 1, `${v.name}#${v.id}: tem a tarefa 'avatar' sem ser o corpo encarnado`, v.id); }
      if (a) {
        const v = s.villagers.get(a.id);
        if (!v) add('avatar', 1, `S.avatar aponta para #${a.id}, que não está entre os vivos${s.dead.has(a.id) ? ' (morreu)' : ''}`);
        else {
          const nm = `${v.name}#${v.id} (encarnado)`;
          if (!v.task || v.task.type !== 'avatar') add('avatar', 1, `${nm}: a tarefa é ${v.task ? v.task.type : 'nenhuma'}, não 'avatar'`, v.id);
          if (v.aboard || v.jail || v.captive || v.held || v.air || v.ug) add('avatar', 1, `${nm}: ${v.aboard ? 'a bordo' : v.jail ? 'preso' : v.captive ? 'cativo' : v.held ? 'na mão do deus' : v.air ? 'no ar' : 'na caverna'} e ainda encarnado`, v.id);
          if (v.inside && !(v.sleeping && v.inside === v.home)) add('avatar', 2, `${nm}: dentro de ${v.inside} sem estar dormindo em casa`, v.id);
          // (where the world does not walk, the body may only be in the water — swimming, or wading the sea's shallows — and
          // marked so, for the world to leave it there; out of the water the mark goes)
          const ti = G.W.idx(v.x, v.y), wet = s.type[ti] <= G.T.RIVER && !(s.dry && s.dry[ti]) && !(s.ice && s.ice[ti]) && !s.road[ti], afl = G.Possess.afloat(v);
          if (!v.inside && !G.W.walkableXY(v.x, v.y) && !(wet && afl)) add('avatar', 3, `${nm}: ${wet ? 'na água sem a marca de quem nada (o mundo o puxaria para fora)' : 'de pé num lugar onde ninguém pisa'} (${v.x.toFixed(1)},${v.y.toFixed(1)})`, v.id);
          if (afl && G.W.walkableXY(v.x, v.y)) add('avatar', 3, `${nm}: com a marca de quem nada, em chão onde o mundo anda`, v.id);
          if (v.age < 6) add('avatar', 2, `${nm}: criança pequena demais encarnada`, v.id);
        }
        if (!KINDS[a.kind]) add('avatar', 2, `S.avatar: tipo de encarnação desconhecido (${a.kind})`);
        if (!Array.isArray(a.asks) || a.asks.length > 6) add('avatar', 3, `S.avatar: chamados malformados (${a.asks && a.asks.length})`);
        if (!Array.isArray(a.seen) || a.seen.length > 20 || !Array.isArray(a.met) || a.met.length > 60) add('avatar', 3, 'S.avatar: memórias do corpo malformadas ou grandes demais');
        for (const k in a.deeds || {}) if (!fin(a.deeds[k]) || a.deeds[k] < 0) add('avatar', 3, `S.avatar: feito ${k} = ${a.deeds[k]}`);
        if (!fin(a.since) || a.since > s.day) add('avatar', 3, `S.avatar: desde o dia ${a.since} (hoje ${s.day})`);
      }
      if (marked > 1) add('avatar', 1, `${marked} pessoas com a tarefa 'avatar' ao mesmo tempo`);
      // (the view: the mode and the truth agree — never the god's eye on a body nobody lives, never a lived body unseen)
      if (G.Modes && G.Modes.state === 'INC' && !a) add('avatar', 2, 'o Modo Encarnado está ativo sem ninguém encarnado');
    }
    // ---- the 3D of the body (realm3d, ground3d, fx3d): only seen, but it must show the world as it is — the ground's
    // picture painted from the tiles the world has now, the particles in their bounds, the trees falling only while they fall
    if (G.Realm && G.Realm.on && G.Ground3D && G.Ground3D.check) {
      const b = (G.Possess && G.Possess.body()) || null;
      if (b) { const c = G.Ground3D.check(b.x, b.y, 30, 200); if (c.n > 50 && c.bad > c.n * 0.25) add('vista3d', 3, `o chão do 3D não bate com o mundo em ${c.bad} de ${c.n} casas perto do corpo`);
        // (the white of the cold under the grass's picture turns mint and purple — L-125; the snow on the water or in the
        // warm is left to e11, which owns a quiet world: the god's Change of Climate may lag the picture a moment)
        if (c.paleBad) add('vista3d', 3, `o branco do frio debaixo da figura do capim em ${c.paleBad} de ${c.n} casas perto do corpo (a neve ciano e roxa)`); }
      if (G.FX3D && G.FX3D.check) for (const m of G.FX3D.check()) add('vista3d', 2, m);
      if (G.People3D && G.People3D.check) for (const m of G.People3D.check()) add('vista3d', 2, m);
      if (G.Dragon3D && G.Dragon3D.check) for (const m of G.Dragon3D.check()) add('vista3d', 2, m);
      if (G.Things3D && G.Things3D.check) for (const m of G.Things3D.check()) add('vista3d', 2, m);
      // (the eye of the body never ends a frame inside the ground, a house or a wall — L-106; asleep in its own bed the body is indoors)
      // (the feet stand on the floor the body walks on — the earth or a boulder's faces — and never sink into it)
      const ab = b && !b.inside && G.Modes && G.Modes.state === 'INC' && G.Avatar && G.Avatar.state();
      if (ab && ab.loco !== 'climb' && ab.Y < G.Avatar.floorAt(ab.X, ab.Z) - 0.1) add('vista3d', 2, `os pés do corpo afundaram ${(G.Avatar.floorAt(ab.X, ab.Z) - ab.Y).toFixed(2)} m no chão ou numa pedra`);
      if (b && !b.inside && G.Modes && G.Modes.state === 'INC' && G.Cam3D && G.Cam3D.inside) add('vista3d', 2, `o olho do corpo terminou o quadro dentro do chão, de um prédio ou de um muro (${G.Cam3D.last ? G.Cam3D.last.pos.map(n => n.toFixed(1)).join(', ') : '?'})`);
    }
    // ---- the dragon (dragon.js): where it is, what it holds, and who is climbing to its lair
    {
      const L = s.dragons || []; const T = G.T; const ST = { chega: 1, caca: 1, passe: 1, curva: 1, rouba: 1, volta: 1, dorme: 1, luta: 1, parte: 1, morre: 1 };
      if (L.filter(d => d.st !== 'morre').length > 2) add('dragao', 3, `${L.length} dragões vivos ao mesmo tempo (máximo 2)`);
      const ids = new Set();
      for (const d of L) {
        const nm = `dragão#${d.id} (${d.name})`; ids.add(d.id);
        if (!fin(d.x) || !fin(d.y) || !fin(d.h) || !fin(d.hp) || !fin(d.lx) || !fin(d.ly)) { add('dragao', 0, `${nm}: posição ou vida inválida`); continue; }
        if (!ST[d.st]) add('dragao', 1, `${nm}: estado desconhecido (${d.st})`);
        if (d.hp > d.maxHp + 0.01) add('dragao', 2, `${nm}: vida ${d.hp} acima do máximo ${d.maxHp}`);
        if (!(d.hoard >= 0) || !fin(d.hoard)) add('dragao', 1, `${nm}: tesouro inválido (${d.hoard})`);
        // (it flies out over the sea and around the towns, but only the one that is leaving goes beyond the edge of the world)
        if (d.st !== 'parte' && (d.x < -18 || d.y < -18 || d.x > N + 18 || d.y > N + 18)) add('dragao', 2, `${nm}: longe do mundo (${d.x.toFixed(1)},${d.y.toFixed(1)}) sem estar partindo`);
        if (d.st === 'dorme' || d.st === 'luta') {
          const i = G.W.idx(d.lx, d.ly);
          if (!G.W.inb(d.lx, d.ly) || s.type[i] < T.SAND || s.type[i] === T.RIVER) add('dragao', 2, `${nm}: dorme num covil que não é terra firme (${d.lx},${d.ly})`);
          if (G.dist(d.x, d.y, d.lx, d.ly) > 0.5) add('dragao', 2, `${nm}: dorme fora do covil`);
          if (d.h - G.W.groundH(d.x, d.y) > 0.5) add('dragao', 2, `${nm}: pousado, mas flutuando ${(d.h - G.W.groundH(d.x, d.y)).toFixed(1)} acima do chão`);
        } else if (d.st !== 'morre' && d.st !== 'parte' && G.W.inb(d.x, d.y) && d.h < G.W.groundH(d.x, d.y) + 1) add('dragao', 2, `${nm}: voando enterrado no chão`);
      }
      for (const v of s.villagers.values()) if (v.task && v.task.type === 'dragao') {
        const d = L.find(q => q.id === v.task.id);
        if (!d) add('dragao', 2, `${v.name}#${v.id} sobe ao covil de um dragão que não existe (${v.task.id})`);
      }
      for (const b of s.dragonBones || []) if (!fin(b.x) || !fin(b.y) || !G.W.inb(b.x, b.y)) add('dragao', 1, `ossos do dragão ${b.name}: fora do mapa`);
      if ((s.dragonBones || []).length > 6) add('dragao', 3, `${s.dragonBones.length} esqueletos de dragão (máximo 6)`);
    }
    // ---- ships
    for (const sh of s.ships) {
      const nm = `${sh.kind}#${sh.id}`;
      if (!fin(sh.x) || !fin(sh.y)) { add('sea', 0, `${nm}: posição inválida`); continue; }
      if (sh.sunk) add('sea', 1, `${nm}: afundado mas ainda na lista`);
      if (!G.Fac.get(sh.fac) || !G.Fac.get(sh.fac).alive) add('sea', 3, `${nm}: povo ${sh.fac} extinto`);
      const crew = sh.crew || []; const dup = crew.length - new Set(crew).size; if (dup) add('sea', 2, `${nm}: ${dup} tripulante(s) repetido(s)`);
      for (const id of crew) { const v = P(id); if (!v && sh.kind !== 'pesca') add('sea', 3, `${nm}: tripulante ${id} morto ainda na lista`); else if (v && v.aboard && v.aboard !== sh.id) add('sea', 2, `${nm}: tripulante ${v.name} está a bordo de outro navio ${v.aboard}`); }
      const i = G.W.idx(sh.x, sh.y); const moving = !{ idle: 1, build: 1, board: 1, dock: 1, prep: 1, unload: 1, embark: 1, wait: 1, land: 1 }[sh.st];
      if (moving && s.type[i] > G.T.SEA && s.type[i] !== G.T.RIVER) add('sea', 2, `${nm}: navegando (${sh.st}) em terra (${s.type[i]})`);
      const aboard = [...s.villagers.values()].filter(v => v.aboard === sh.id).length;
      if (moving && !aboard && !sh.ghost && sh.st !== 'deriva' && sh.kind !== 'pesca' && sh.kind !== 'mercante') add('sea', 3, `${nm}: navegando (${sh.st}) sem ninguém a bordo`);
      if (sh.kind === 'pesca' && moving && !aboard && sh.st !== 'adrift') add('sea', 3, `${nm}: barco de pesca (${sh.st}) sem ninguém a bordo`);
    }
    // who is aboard comes from v.aboard alone; the index of who is on which ship must not miss anyone (someone put aboard without Naval.board)
    if (G.Naval && G.Naval.aboardIndex && !opts.noReach) { const ix = G.Naval.aboardIndex(true); let miss = 0, ex = ''; for (const v of s.villagers.values()) if (v.aboard && !(ix.get(v.aboard) || []).includes(v)) { if (!miss) ex = `${v.name} #${v.id}`; miss++; } if (miss) add('sea', 1, `índice de quem está a bordo desatualizado: ${miss} pessoa(s) (${ex}) embarcaram sem passar por Naval.board`); }
    if (G.Naval && G.Naval.repairs) add('sea', 3, `tripulações reconciliadas ${G.Naval.repairs}× (alguém a bordo fora da lista do navio)`);
    // ---- expeditions & fleets
    if (G.Expe) for (const e of G.Expe.list()) {
      if (!G.Expe.live(e)) continue;
      const crew = e.crew.filter(id => P(id)); const sh = (e.ships || []).filter(id => ships.has(id));
      if (!crew.length && !sh.length) add('sea', 2, `expedição ${e.name} (${e.st}): viva sem gente nem navio`);
      if (!G.Fac.get(e.fac) || !G.Fac.get(e.fac).alive) add('sea', 2, `expedição ${e.name}: povo extinto`);
      if (e.t0 !== undefined && s.day - e.t0 > 25) add('sea', 3, `expedição ${e.name}: há ${s.day - e.t0} anos (${e.st})`);
    }
    for (const fl of (s.fleets || [])) {
      if (fl.st === 'fim') continue;
      const sh = (fl.ships || []).filter(id => ships.has(id));
      if (!sh.length) add('sea', 2, `frota ${fl.name} (${fl.st}): viva sem navios`);
      if (!G.Fac.get(fl.fac) || !G.Fac.get(fl.fac).alive) add('sea', 2, `frota ${fl.name}: povo extinto`);
    }
    // ---- stories
    if (s.saga) {
      const keys = new Set();
      for (const st of s.saga.stories) {
        const nm = `história #${st.id} ${st.type} "${st.title}"`;
        if (st.st === 'ativa') {
          if (keys.has(st.key)) add('story', 1, `${nm}: chave duplicada entre ativas`); keys.add(st.key);
          if (!P(st.protag) && !st.data.waitHeir) add('story', 1, `${nm}: ativa com protagonista morto/inexistente`);
          for (const k in st.cast) { const id = st.cast[k]; if (typeof id === 'number' && id > 0 && !person(id) && !s.buildings.has(id) && !s.animals.has(id) && !s.settlements.has(id)) add('story', 3, `${nm}: elenco ${k}=${id} não existe em lugar nenhum`); }
          const def = G.Stories.DEF[st.type]; if (def && def.maxDays && s.day - st.born > def.maxDays * 1.2) add('story', 2, `${nm}: ativa há ${s.day - st.born} anos (máx. ${def.maxDays})`);
        } else if (st.st === 'fim' && !st.end) add('story', 1, `${nm}: terminada sem desfecho`);
        let last = -1; for (const c of st.chapters) { if (c.d < last - 0.01) add('story', 2, `${nm}: capítulo fora de ordem (${c.d} < ${last})`); last = c.d; }
        const ch = st.chapters.map(c => c.txt); const dups = ch.length - new Set(ch).size; if (dups) add('story', 3, `${nm}: ${dups} capítulo(s) com texto idêntico`);
        const ends = st.chapters.filter(c => c.end).length; if (ends > 1) add('story', 1, `${nm}: ${ends} capítulos de fim`);
      }
      for (const sd of s.saga.seeds) if (!P(sd.protag)) add('story', 3, `semente ${sd.type}: protagonista morto`);
    }
    // ---- duplicated events: the same chronicle line twice on the same day
    { const seen = new Map(); for (const h of s.history.slice(-300)) { const k = Math.floor(h.d) + '|' + (h.x === undefined ? '' : Math.round(h.x) + ',' + Math.round(h.y)) + '|' + h.txt; seen.set(k, (seen.get(k) || 0) + 1); } for (const [k, n] of seen) if (n > 1) add('chron', 3, `crônica: linha repetida ${n}× no mesmo dia e lugar: ${k.split('|')[2].slice(0, 90)}`); }
    // ---- history
    { let lastN = -1, lastD = -1; for (const h of s.history) { if (h.n !== undefined) { if (h.n <= lastN) add('chron', 2, `crônica: número fora de ordem (${h.n} ≤ ${lastN})`); lastN = h.n; } if (h.d < lastD) add('chron', 2, `crônica: data fora de ordem (${h.d} < ${lastD}): ${h.txt.slice(0, 60)}`); lastD = h.d; } }
    // ---- animals
    let an = 0; for (const a of s.animals.values()) { if (!fin(a.x) || !fin(a.y)) add('fauna', 1, `animal ${a.kind}#${a.id}: posição inválida`); if (!a.dead) an++; if (a.hp !== undefined && !fin(a.hp)) add('fauna', 1, `animal ${a.kind}#${a.id}: hp ${a.hp}`); }
    // ---- counts shown vs real
    { let real = 0; for (const v of s.villagers.values()) if (!v.captive) real++; let sum = 0; for (const f of G.Fac.all()) sum += G.Fac.pop(f.id); if (Math.abs(sum - real) > 0) add('pop', 2, `soma das populações dos povos (${sum}) ≠ pessoas livres (${real})`); }
    // ---- NaN / Infinity anywhere in the state of the world (aggregated by field path)
    {
      const bad = new Map(); const seen = new WeakSet();
      const walk = (o, path, depth) => {
        if (!o || typeof o !== 'object' || depth > 4 || seen.has(o)) return; seen.add(o);
        if (ArrayBuffer.isView(o)) return;
        if (o instanceof Map) { for (const v of o.values()) walk(v, path + '[]', depth + 1); return; }
        if (Array.isArray(o)) { for (let k = 0; k < Math.min(o.length, 400); k++) { const v = o[k]; if (typeof v === 'number') { if (!isFinite(v)) bad.set(path + '[]', (bad.get(path + '[]') || 0) + 1); } else walk(v, path + '[]', depth + 1); } return; }
        for (const k in o) { const v = o[k]; if (typeof v === 'number') { if (!isFinite(v)) { const kp = path + '.' + k; bad.set(kp, (bad.get(kp) || 0) + 1); } } else if (v && typeof v === 'object' && k !== 'path' && k !== 'bio') walk(v, path + '.' + k, depth + 1); }
      };
      walk(s.villagers, 'villager', 0); walk(s.factions, 'faction', 0); walk(s.settlements, 'settlement', 0); walk(s.buildings, 'building', 0);
      walk(s.animals, 'animal', 0); walk(s.ships, 'ship', 0); walk(s.wz, 'wz', 0); walk(s.exps, 'exp', 0); walk(s.fleets, 'fleet', 0); walk(s.saga, 'saga', 0); walk(s.weather, 'weather', 0);
      if (G.War && G.War.bands) walk(G.War.bands, 'band', 0);
      for (const [k, n] of bad) add('nan', 1, `valor não finito em ${k} (×${n})`);
    }
    // dedupe identical messages
    // (the checks of a new system in the making, from its own qa file loaded after this one — inlined here when it lands)
    for (const fn of QA.more) fn(add, s, opts);
    const seen = new Map(); for (const q of out) { const k = q.sys + q.msg; if (!seen.has(k)) seen.set(k, q); }
    return [...seen.values()].sort((a, b) => a.sev - b.sev);
  };
  QA.more = [];

  // ---------------- canonical state (for save/load comparison) ----------------
  // (the canonical state of a new system in the making: [name, fn] — inlined into canon when it lands)
  QA.canonMore = [];
  // ==== as invariantes dos sistemas novos (geradas por qa/junta-inv.js; não edite aqui: edite o arquivo e rode o junta) ====
  // ---- qa/atividades-inv.js ----
// atividades-inv: the checker's rules for the activities (C1) — the holders, the operations, the ledger, the businesses.
// Loaded after qa/qa.js (QA.more / QA.canonMore); the leader moves it into QA.check when the activities reach integracao.
// It reads the world's fields directly (the same ones G.Depot reads): a fault in the activities' own code is not hidden
// by the code it checks.
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  const EPS = 1e-4;
  QA.more.push(function (add, s) {
    if (!G.Act || !G.Depot) return;
    const ops = s.acts || [];
    const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 }; const ST = { plan: 1, rsv: 1, on: 1, wait: 1, ok: 1, int: 1, cancel: 1, fail: 1 };
    const byId = new Map(); for (const op of ops) byId.set(op.id, op);
    // ---- no holder with a negative or non-number amount
    const neg = (where, k, n) => { if (!fin(n)) add('act', 1, `${where}: ${k} = ${n}`); else if (n < -EPS) add('act', 1, `${where}: ${k} negativo (${n})`); };
    for (const f of s.factions.values()) for (const k in f.stock) neg(`estoque de ${f.name}`, k, f.stock[k]);
    for (const b of s.buildings.values()) {
      if (b.inv) for (const k in b.inv) neg(`${b.type}#${b.id}`, k, b.inv[k]);
      if (b.pantry !== undefined) neg(`${b.type}#${b.id}`, 'despensa', b.pantry);
      if (b.crates) { for (const c of b.crates) { if (!c || !Number.isInteger(c.id)) { add('act', 2, `${b.type}#${b.id}: caixa sem nome no cais`); break; } if (c.op && !(byId.has(c.op) && LIVE[byId.get(c.op).st])) add('act', 2, `${b.type}#${b.id}: caixa ${c.id} de uma operação que acabou (${c.op})`); } }
    }
    for (const v of s.villagers.values()) if (v.carry) { if (!fin(v.carry.n)) add('act', 1, `${v.name} #${v.id}: carga ${v.carry.n}`); else if (v.carry.n < -EPS) add('act', 1, `${v.name} #${v.id}: carga negativa`); }
    for (const x of s.loose || []) if (!fin(x.n) || x.n <= 0 || !fin(x.x) || !fin(x.y)) add('act', 1, `coisa no chão #${x.id} inválida`);
    // ---- the operations
    const ids = new Set();
    for (const op of ops) {
      const nm = `operação ${op.def}#${op.id}`;
      if (ids.has(op.id)) add('act', 1, `${nm}: id repetido`); ids.add(op.id);
      if (!ST[op.st]) add('act', 1, `${nm}: estado inválido ${op.st}`);
      if (!LIVE[op.st]) continue;
      if (!G.Act.DEFS[op.def]) add('act', 1, `${nm}: definição desconhecida`);
      for (const k of ['goods', 'done', 'lost', 'moved']) for (const g in op[k] || {}) if (!fin(op[k][g]) || op[k][g] < -EPS) add('act', 1, `${nm}: ${k}.${g} = ${op[k][g]}`);
      // a key applied twice (the same step twice)
      const seen = new Set(); for (const e of op.keys || []) { if (seen.has(e[0])) { add('act', 1, `${nm}: o passo ${e[0]} aplicado duas vezes`); break; } seen.add(e[0]); }
      // the people: alive, free, not at sea, not in a cell (unless the god's body: it keeps its role)
      for (const id in op.roles || {}) {
        const v = s.villagers.get(+id);
        if (!v) { add('act', 2, `${nm}: participante #${id} não existe (morto?) e continua com papel`); continue; }
        if (!op.roles[id].body && (v.captive || v.jail)) add('act', 2, `${nm}: ${v.name} #${v.id} ${v.captive ? 'cativo' : 'preso'} com papel`);
      }
      // its place
      if (op.at && !s.buildings.has(op.at)) add('act', 2, `${nm}: o lugar ${op.at} não existe e a operação segue`);
      // conservation, good by good: what left the source = what arrived + what was lost with a cause + what is in hands or on the ground, marked with it
      if (G.Act.DEFS[op.def] && G.Act.DEFS[op.def].conserve) {
        const inHands = {}; for (const v of s.villagers.values()) if (v.carry && v.carry.op === op.id && fin(v.carry.n)) inHands[v.carry.k] = (inHands[v.carry.k] || 0) + v.carry.n;
        for (const x of s.loose || []) if (x.op === op.id) inHands[x.k] = (inHands[x.k] || 0) + x.n;
        for (const b of s.buildings.values()) if (b.crates) for (const c of b.crates) if (c.op === op.id && fin(c.n)) inHands[c.k] = (inHands[c.k] || 0) + c.n;
        const taken = op.taken || {};
        for (const k of new Set(Object.keys(taken).concat(Object.keys(op.done || {}), Object.keys(inHands)))) {
          const a = taken[k] || 0, b = (op.done || {})[k] || 0, c = (op.lost || {})[k] || 0, d = inHands[k] || 0, back = (op.back || {})[k] || 0;
          if (Math.abs(a - (b + c + d + back)) > 0.01) add('act', 1, `${nm}: ${k} não fecha — saiu ${a}, chegou ${b}, perdido ${c}, sob a guarda dela (mãos, chão, cais) ${d}, devolvido ${back}`);
        }
      }
      // reservations within what the holder has
      for (const r of op.rsv || []) if (!Array.isArray(r) || typeof r[0] !== 'string' || !fin(r[2]) || r[2] < 0) add('act', 1, `${nm}: reserva inválida`);
    }
    // the reservations of all the operations together never more than what is there
    const R = new Map(); for (const op of ops) if (LIVE[op.st]) for (const r of op.rsv || []) { const key = r[0] + '|' + r[1]; R.set(key, (R.get(key) || 0) + r[2]); }
    for (const [key, n] of R) { const [ref, k] = key.split('|'); const has = G.Depot.get(ref, k); if (n > has + 0.01) add('act', 2, `reservas de ${k} em ${ref}: ${n} para ${has}`); }
    // a load marked with an operation that is gone (two seconds after its end: the hands let go at the next step)
    for (const v of s.villagers.values()) if (v.carry && v.carry.op) { const op = byId.get(v.carry.op); if (!op) add('act', 2, `${v.name} #${v.id}: carrega ${v.carry.k} de uma operação que não existe (${v.carry.op})`); }
    // ---- the ledger
    const L = s.ledger || []; for (let i = 1; i < L.length; i++) if (!(L[i][0] > L[i - 1][0])) { add('act', 2, `livro-razão fora de ordem em ${L[i][0]}`); break; }
    for (const e of L.slice(-200)) if (!fin(e[6]) || e[6] <= 0) { add('act', 2, `livro-razão: lançamento ${e[0]} com quantidade ${e[6]}`); break; }
    // ---- writes from outside the world's step (a frame, a panel): the activities never do that
    if (G.Act.outside) add('act', 1, `${G.Act.outside} operação(ões) criada(s) fora do passo do mundo`);
    // ---- the businesses
    if (G.Biz && G.Biz.audit) G.Biz.audit(add, s);
    // ---- the houses' coins, and their shopping: one of a house out for it at a time
    const out = new Map();
    for (const b of s.buildings.values()) if (b.coin !== undefined) neg(`${b.type}#${b.id}`, 'moedas', b.coin);
    for (const v of s.villagers.values()) if (v.task && v.task.casa) { out.set(v.task.casa, (out.get(v.task.casa) || 0) + 1); if (v.home !== v.task.casa) add('act', 4, `${v.name} #${v.id} faz compras para uma casa que não é mais a sua (${v.task.casa}): mudou no caminho`); }
    for (const [h, n] of out) if (n > 1) add('act', 3, `casa #${h}: ${n} pessoas fazendo as compras dela ao mesmo tempo`);
    // ---- a marked load (an operation's crate, a purchase on its way home, goods for a stall) never leaves the hands
    // without a line in the ledger: what was in them at the last look = what is in them now + what the ledger moved out
    // (the guard's rule 20, read in the world instead of in the code)
    const now = new Map();
    for (const v of s.villagers.values()) { const c = v.carry; if (c && fin(c.n) && c.n > EPS && (c.op || c.to || c.cid)) now.set(v.id, { k: c.k, n: c.n, name: v.name }); }
    if (marked && markedS === s) for (const [id, p] of marked) {
      const c = now.get(id); const left = c && c.k === p.k ? c.n : (() => { const v = s.villagers.get(id); return v && v.carry && v.carry.k === p.k && fin(v.carry.n) ? v.carry.n : 0; })();
      const went = (movedOut.get(id + '|' + p.k) || 0);
      if (p.n - left - went > 0.01) { const v = s.villagers.get(id); add('act', 1, `${p.name} #${id}: ${Math.round((p.n - left - went) * 100) / 100} de ${p.k} de uma carga marcada sumiram sem lançamento no livro (${v ? `agora ${v.task ? v.task.type : 'sem tarefa'}, nas mãos ${v.carry ? v.carry.n + ' de ' + v.carry.k : 'nada'}` : 'a pessoa saiu do mundo'})`); }
    }
    marked = now; markedS = s; movedOut.clear();
    // ---- the houses (act-casa.js): an owner is a living person (or the people: 0); a house ordered by a family names it,
    // and once built the family has moved in (the order is cleared); a let house has an owner, and what is owed is a number
    if (G.Casa) for (const b of s.buildings.values()) {
      if (b.dono && !s.villagers.has(b.dono)) add('act', 3, `${b.type}#${b.id}: o dono #${b.dono} não existe mais (a herança não passou)`);
      if (b.encomenda) {
        if (!Array.isArray(b.encomenda.fam) || !fin(b.encomenda.paid)) add('act', 2, `${b.type}#${b.id}: encomenda sem família ou sem preço`);
        else if (b.built) add('act', 3, `${b.type}#${b.id}: pronta e a família da encomenda não mudou`);
      }
      if (b.aluga) {
        if (!b.dono) add('act', 3, `${b.type}#${b.id}: alugada e sem dono`);
        if (!fin(b.aluga.deve) || b.aluga.deve < -EPS || !fin(b.aluga.pago)) add('act', 1, `${b.type}#${b.id}: aluguel ${JSON.stringify(b.aluga)}`);
      }
      if (b.poupa && (!fin(b.poupa.alvo) || !(b.poupa.alvo > 0))) add('act', 2, `${b.type}#${b.id}: poupança sem alvo (${JSON.stringify(b.poupa)})`);
    }
    // ---- the fishing grounds (act-pesca.js): what a ground holds is a number, never below nothing, never fished in the
    // future, and only where there is water
    if (G.Pesca && s.pesca) for (const id in s.pesca) {
      const g = s.pesca[id];
      if (!Array.isArray(g) || !fin(g[0]) || !fin(g[1]) || g[0] < -EPS) { add('act', 1, `pesqueiro ${id}: ${JSON.stringify(g)}`); continue; }
      if (g[1] > s.clock + 1) add('act', 2, `pesqueiro ${id}: pescado no futuro (${g[1]} > ${Math.round(s.clock)})`);
      if (!(G.Pesca.cap(+id) > 0)) add('act', 3, `pesqueiro ${id}: pescado numa quadra sem água`);
    }
    // ---- hunger with food (L-164, L-165): a town whose people die of hunger with food in their people's stock and no store
    // anywhere to eat it from; someone dying of hunger with food in reach — the people's store, the house's pantry, plain
    // food in the hands —, free (not a captive, in a cell, condemned, at sea, in a cave), not on the way to eat nor running
    // from a danger nor in a fight (a beast, a brawl, a battle), in a calm town (no fight at it nor an army coming —
    // G.War.threat —, no fire burning in it). Held by an errand of any weight, it is still a death with food in reach.
    // (Dying: hunger at the top and under 40 of life.)
    {
      const dying = v => v.hunger >= 99.9 && v.hp < 40 && v.age >= 2;
      const dyingIn = new Map();
      for (const v of s.villagers.values()) if (dying(v) && !v.captive && !v.aboard && !v.ug) dyingIn.set(v.set, (dyingIn.get(v.set) || 0) + 1);
      for (const [sid, n] of dyingIn) {
        const set = s.settlements.get(sid); const f = set && s.factions.get(set.fac);
        if (f && f.stock.food >= 1 && !G.Village.nearestDropoff(set.cx, set.cy, sid)) add('fome', 1, `${set.name}: ${n} morrendo de fome com ${Math.floor(f.stock.food)} de comida no estoque de ${f.name} e nenhum armazém onde comer`);
      }
      for (const v of s.villagers.values()) {
        if (!dying(v) || v.captive || v.jail || v.aboard || v.ug || v.held || v.air) continue;
        const t = v.task; if (t && (t.type === 'eat' || t.type === 'forage' || t.type === 'flee' || t.type === 'condemned' || t.type === 'escorted' || t.type === 'fire' || t.type === 'fight' || t.type === 'combat')) continue;
        const set = s.settlements.get(v.set); if (!set || G.War.threat(v.set) || (G.Vg.alarms && (G.Vg.alarms.get(v.set) || []).length)) continue;
        const where = [];
        const st = G.Fac.stockV(v); const d = st && st.food >= 1 ? G.Village.nearestDropoff(v.x, v.y, v.set) : null;
        if (d) { const ft = G.Village.frontTile(d); if (G.W.reaches(v, ft[0], ft[1])) where.push(`o armazém (${Math.floor(st.food)} no estoque)`); }
        const h = v.home && s.buildings.get(v.home);
        if (h && h.built && (h.pantry || 0) >= 1) { const ft = G.Village.frontTile(h); if (G.W.reaches(v, ft[0], ft[1])) where.push(`a despensa da casa (${Math.floor(h.pantry)})`); }
        const c = v.carry; if (c && c.k === 'food' && c.n >= 1 && !c.op && !c.to && !c.cid) where.push(`${Math.floor(c.n)} nas mãos`);
        if (where.length) add('fome', 2, `${v.name} #${v.id} (${set.name}) morre de fome com comida ao alcance: ${where.join(', ')}; ${t ? 'tarefa ' + t.type : 'sem tarefa'}, vida ${Math.round(v.hp)}`, v.id);
      }
    }
  });
  // (the ledger's lines out of hands since the last look, for the rule above; a new world, or a save loaded, starts over)
  let marked = null, markedS = null; const movedOut = new Map();
  if (G.Depot) G.Depot.onMove.push(e => { if (typeof e[3] === 'string' && e[3][0] === 'v' && e[3][1] === ':') { const key = e[3].slice(2) + '|' + e[5]; movedOut.set(key, (movedOut.get(key) || 0) + e[6]); } });
  if (G.worldHooks) G.worldHooks.push(() => { marked = null; markedS = null; movedOut.clear(); });
  QA.canonMore.push(['acts', () => (G.Act ? G.Act.canon() : null)]);
  QA.canonMore.push(['pesca', () => (G.S && G.S.pesca ? Object.keys(G.S.pesca).sort((a, b) => a - b).map(id => [+id, G.S.pesca[id][0], G.S.pesca[id][1]]) : null)]);
  QA.canonMore.push(['casas', () => (G.S ? [...G.S.buildings.values()].filter(b => b.dono || b.encomenda || b.aluga || b.poupa).sort((a, b) => a.id - b.id).map(b => [b.id, b.dono || 0, b.encomenda ? b.encomenda.fam.join('.') + ':' + (b.encomenda.paid || 0) : '', b.aluga ? b.aluga.pago + ':' + b.aluga.deve : '', b.poupa ? b.poupa.by + ':' + b.poupa.alvo : '']) : null)]);
})();
  // ---- qa/interiores-inv.js ----
// interiores-inv: as regras do verificador para os interiores (C2) — o registro de cada prédio (b.ip) e a planta que sai
// dele. Carregado depois do qa/qa.js (QA.more / QA.canonMore); o líder o leva para o QA.check quando os interiores chegam
// ao integracao. Lê os campos do mundo direto; a planta, pelas portas do G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const SIDES = { N: 1, E: 1, S: 1, W: 1 };
  let turn = 0; // (which few plans this round builds: a different few each time, so a long life sees them all)
  QA.more.push(function (add, s) {
    const In = G.Interiors; if (!In) return;
    const withIp = [];
    for (const b of s.buildings.values()) {
      const T = In.TYPES[b.type]; const nm = `${b.type}#${b.id}`;
      // ---- every building of a type with a plan has its record (a ruin keeps the one it had)
      if (T && !b.ip) { add('int', 2, `${nm}: prédio com planta sem registro (b.ip)`); continue; }
      if (!b.ip) continue;
      const r = b.ip; withIp.push(b);
      // ---- the record is whole: its family is one its type has, its side a side, its counters numbers
      if (r.v !== 1 || !In.TYPES[r.t] || !In.FAMS[r.f] || !SIDES[r.s] || !Number.isInteger(r.r) || r.r < 0 || !Array.isArray(r.h) || !Array.isArray(r.fx) || !r.dr || typeof r.dr !== 'object') { add('int', 1, `${nm}: registro danificado (${JSON.stringify(r).slice(0, 120)})`); continue; }
      if (!In.TYPES[r.t].fams.includes(r.f)) add('int', 1, `${nm}: a família ${r.f} não é de ${r.t}`);
      // ---- a building standing and finished is of the type its record says (a rebuilding is a renovation of the record)
      if (b.built && b.type !== 'ruin' && T && r.t !== b.type) add('int', 2, `${nm}: o registro diz ${r.t}`);
      // ---- a house given up was empty for In.LEFT days at least, and nobody lived in it at the last turn of the day
      if (r.ab && (!(r.vz > 0) || r.ab - r.vz < In.LEFT || r.nm)) add('int', 3, `${nm}: abandonada no dia ${r.ab} sem ter ficado vazia ${In.LEFT} dias (vazia desde ${r.vz}, ${r.nm} moradores)`);
    }
    // ---- a prisoner in his jail is on the straw of one of its cells, behind the grating (where the drawing puts him: the
    // jail's plan has its cells, each with its bed — an invalid plan is said below)
    for (const v of s.villagers.values()) {
      if (!v.jail || v.inside !== v.jail) continue; const b = s.buildings.get(v.jail); const T = b && In.TYPES[b.type];
      if (!b || !b.ip || !T || !T.cells) continue; const cs = In.cells(b); if (!cs.length) continue;
      const at = In.placeOf(v); if (!at || !cs.some(c => c.bed === at.item)) add('int', 3, `pessoa #${v.id}: presa na cadeia #${b.id} fora das celas`);
    }
    // ---- a few plans each round: valid, and the shell seen from afar the whole plan's (the 3D draws the one far, the
    // other near: the same building, always)
    if (!withIp.length) return;
    for (let k = 0; k < 3; k++) {
      const b = withIp[(turn++ * 7919) % withIp.length]; const p = In.plan(b); if (!p) { add('int', 1, `${b.type}#${b.id}: sem planta`); continue; }
      if (!p.ok) add('int', 2, `${b.type}#${b.id}: planta inválida (${(p.errs || []).slice(0, 2).join('; ')})`);
      // (the plan of a house given up: what the household takes with it is gone)
      if (p.left && p.items.some(it => In.ITEMS[it.kind] && In.ITEMS[it.kind].leva)) add('int', 3, `${b.type}#${b.id}: a casa abandonada ainda tem as coisas que a família leva`);
      const s1 = In.shellOf(b), s2 = In.shellOfPlan(p); const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
      if (!s1 || strip(s1) !== strip(s2)) add('int', 1, `${b.type}#${b.id}: a casca de longe não é a da planta`);
      // (the door the world's people use, with the port on: the plan's own wherever the step took it — and the step never
      // took a door onto ground smaller than the old corner's: a pocket shut in all round shuts in whoever comes out)
      if (G.Vg && G.Vg.planDoor === In.planDoor && b.built && b.blocks) {
        const pd = In.planDoor(b);
        if (pd) { const d = G.Vg.door(b); if (Math.abs(d[0] - pd[0]) > 1e-6 || Math.abs(d[1] - pd[1]) > 1e-6) add('int', 2, `${b.type}#${b.id}: quem sai não sai pela porta da planta`); }
        const said = In.doorSaid(b); const corner = [[b.x + b.w - 0.5, b.y + b.h + 0.4], [b.x + b.w + 0.4, b.y + b.h - 0.5], [b.x - 0.4, b.y + 0.5], [b.x + 0.5, b.y - 0.4]].find(c => G.W.walkableXY(c[0], c[1]));
        if (said && corner) {
          const L = G.W.reachIds(true); const rd = L[G.W.idx(said[0], said[1])], ro = L[G.W.idx(corner[0], corner[1])];
          if (rd !== ro) { let nd = 0, no = 0; for (let i = 0; i < L.length; i++) { if (L[i] === rd) nd++; else if (L[i] === ro) no++; } if (nd < no) add('int', 2, `${b.type}#${b.id}: a porta de quem sai dá para um chão fechado de ${nd} casas (o canto de antes, para ${no})`); }
        }
      }
    }
  });
  // (the records go into the save with their buildings: the canonical state carries them, so a round trip that loses one is seen)
  QA.canonMore.push(['interiores', () => {
    const In = G.Interiors; if (!In) return null; let h = 2166136261; let n = 0;
    for (const b of [...G.S.buildings.values()].sort((a, c) => a.id - c.id)) {
      if (!b.ip) continue; n++; const r = b.ip; const str = [b.id, r.t, r.f, r.r, r.s, r.o, r.c, r.h.length, (r.fx || []).length].join('|');
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    }
    return [n, (h >>> 0).toString(16)];
  }]);
})();
  // ---- qa/visual/corpo-qa.js ----
// corpo-qa: what must always be true of the body's hands on the world (QA.more, loaded after qa/qa.js by the tests of the
// body — inlined into qa.js when the Modo Encarnado's foundation lands):
//   · what the hands asked of the world and the world has not yet done belongs to the body lived now: a body given back, or
//     dead, leaves nothing waiting (it never happened — Possess.release and the death drop it)
//   · the lead to the work near (Interact.lead: the HUD's line and mark) points only at what the world has — an unloading under
//     way of the body's own people, by day, with crates of it on its quay or on the ground; with a crate of it in the hands, the
//     door of a store that is a store (never a ruin, never a place the crate does not go)
(function (G) {
  QA.more.push(function (add, s) {
    if (!G.Possess || !G.Possess.queued) return;
    const q = G.Possess.queued(); const a = s.avatar;
    if (!a && q.length) add('maos', 1, `${q.length} pedido(s) das mãos esperando o passo do mundo sem ninguém encarnado: o corpo devolvido deixou o que pediu`);
    if (a) { const o = q.filter(id => id !== a.id); if (o.length) add('maos', 1, `${o.length} pedido(s) das mãos de outro corpo (#${o[0]}) esperando o passo do mundo, com #${a.id} encarnado`); }
  });
  QA.more.push(function (add, s) {
    const a = s.avatar; if (!a || !G.Interact || !G.Interact.lead || !G.Act) return;
    const v = s.villagers.get(a.id); const L = v ? G.Interact.lead(v) : null; if (!L) return;
    const op = G.Act.get(L.op);
    if (!op || !G.Act.live(op)) { add('pista', 2, `a pista do corpo aponta uma descarga que não existe mais (#${L.op})`); return; }
    if (op.fac !== G.Fac.idOfV(v)) add('pista', 2, `a pista do corpo aponta a descarga #${op.id}, de outro povo`);
    if (L.step === 'pegar') {
      const d = s.buildings.get(op.at);
      if (!((d && d.crates) || []).some(c => c.op === op.id) && !(s.loose || []).some(o => o.op === op.id)) add('pista', 2, `a pista do corpo chama para a descarga #${op.id}, que não tem caixa no cais nem no chão`);
      if (op.st !== 'on' || G.isNight()) add('pista', 2, `a pista do corpo chama para a descarga #${op.id} ${G.isNight() ? 'de noite' : 'parada'}`);
    } else {
      const b = s.buildings.get(L.b);
      if (!(v.carry && v.carry.op === op.id)) add('pista', 2, `a pista do corpo manda levar ao armazém uma caixa da descarga #${op.id} que não está nas mãos`);
      if (!b || !G.BDEF[b.type] || !G.BDEF[b.type].dropoff) add('pista', 2, `a pista do corpo leva a caixa da descarga #${op.id} a um lugar que não é armazém (#${L.b}${b ? ' ' + b.type : ''})`);
    }
  });
})(window.G);
  // ==== fim das invariantes dos sistemas novos ====
  QA.canon = function () {
    const s = S(); const r = x => Math.round(x * 100) / 100;
    const vs = [...s.villagers.values()].sort((a, b) => a.id - b.id).map(v => [v.id, v.name, v.set, v.home, v.partner, v.mother, v.father, (G.Save.ageR ? G.Save.ageR(v.age) : Math.round(v.age * 1000) / 1000), v.captive ? 'c' + v.captive.from : '', v.aboard || 0, v.role || '', v.job || 0, (v.kids || []).length, v.g, v.secret || 0, v.grp || '', v.reigned || 0]);
    const fs = [...s.factions.values()].sort((a, b) => a.id - b.id).map(f => [f.id, f.name, f.alive, f.leader, f.gov, f.capital, Object.keys(f.stock).sort().map(k => k + '=' + Math.round(f.stock[k] || 0)).join(','), Object.keys(f.rel).sort().map(k => k + ':' + f.rel[k].st + ':' + Math.round(f.rel[k].op || 0)).join(','), Object.keys((f.tech && f.tech.known) || {}).length]);
    const ss = [...s.settlements.values()].sort((a, b) => a.id - b.id).map(x => [x.id, x.name, x.fac, x.tier || 0, Math.round(x.loyalty || 0)]);
    const bs = [...s.buildings.values()].sort((a, b) => a.id - b.id).map(b => [b.id, b.type, b.set, b.built ? 1 : 0, Math.round(b.hp || 0)]);
    const sh = s.ships.slice().sort((a, b) => a.id - b.id).map(x => [x.id, x.kind, x.fac, (x.crew || []).slice().sort().join('.'), x.exp || 0, x.fleet || 0, Math.round(x.hp || 0)]);
    const wz = s.wz || {};
    const wars = (wz.wars || []).map(w => [w.id, w.name, w.end || 0, w.a.join('.'), w.b.join('.'), (w.battles || []).length]);
    const arm = (wz.armies || []).map(a => [a.id, a.done ? 1 : 0, a.fac, a.war, (a.members || []).length]);
    const st = s.saga ? s.saga.stories.map(x => [x.id, x.type, x.st, x.protag, x.chapters.length, x.end ? x.end.k : '']) : [];
    const sd = s.saga ? s.saga.seeds.length : 0;
    const ex = (s.exps || []).map(e => [e.id, e.st, e.fac, e.crew.length, (e.ships || []).join('.')]);
    const fl = (s.fleets || []).map(f => [f.id, f.st, f.fac, (f.ships || []).length]);
    const an = {}; for (const a of s.animals.values()) if (!a.dead) an[a.kind] = (an[a.kind] || 0) + 1;
    return {
      day: s.day, nextId: s.nextId, villagers: vs, dead: s.dead.size, factions: fs, settlements: ss, buildings: bs, ships: sh, wars, armies: arm, stories: st, seeds: sd, exps: ex, fleets: fl,
      history: s.history.length, logN: s.logN || 0, animals: an, trees: s.trees.size, rocks: s.rocks.size, bushes: s.bushes.size,
      riots: (s.riots || []).length, execs: (s.execs || []).length, secrets: s.secrets ? s.secrets.socs.length : 0, ww: s.worldWar ? [s.worldWar.name, s.worldWar.end] : null,
      walls: (s.walls || []).length, stats: [s.stats.births, s.stats.deaths, s.stats.wars || 0], more: QA.canonMore.map(([k, f]) => [k, f()]),
    };
  };
  // the differences between two canonical states, by section
  QA.diff = function (a, b) {
    const out = [];
    for (const k in a) {
      const x = a[k], y = b[k];
      if (Array.isArray(x) && Array.isArray(y) && x.length && Array.isArray(x[0])) {
        const mx = new Map(x.map(e => [e[0], JSON.stringify(e)])), my = new Map(y.map(e => [e[0], JSON.stringify(e)]));
        let n = 0; const ex = [];
        for (const [id, e] of mx) { const f = my.get(id); if (f === undefined) { n++; if (ex.length < 4) ex.push('-' + e); } else if (f !== e) { n++; if (ex.length < 4) ex.push(e + ' → ' + f); } }
        for (const [id, f] of my) if (!mx.has(id)) { n++; if (ex.length < 4) ex.push('+' + f); }
        if (n) out.push(`${k}: ${n} diferença(s): ${ex.join(' | ')}`);
      } else if (JSON.stringify(x) !== JSON.stringify(y)) out.push(`${k}: ${JSON.stringify(x).slice(0, 160)} → ${JSON.stringify(y).slice(0, 160)}`);
    }
    return out;
  };

  // ---------------- what goes into the save: values JSON would corrupt ----------------
  QA.saveAudit = function () {
    let out = null; const js = JSON.stringify;
    JSON.stringify = function (o) { if (!out && o && o.villagers && o.day !== undefined) out = o; return js.apply(JSON, arguments); };
    let str; try { str = G.Save.serialize(); } finally { JSON.stringify = js; }
    const bad = []; const seen = new WeakSet();
    (function walk(o, path, depth) {
      if (bad.length > 60 || depth > 14) return;
      if (typeof o === 'number') { if (!isFinite(o)) bad.push(`${path} = ${o}`); return; }
      if (typeof o === 'function') { bad.push(`${path}: função`); return; }
      if (!o || typeof o !== 'object') return;
      if (seen.has(o)) return; seen.add(o);
      if (o instanceof Map || o instanceof Set) { bad.push(`${path}: ${o.constructor.name} (${o.size}) vira {} no JSON`); return; }
      if (ArrayBuffer.isView(o)) { bad.push(`${path}: ${o.constructor.name} vira objeto no JSON`); return; }
      for (const k in o) walk(o[k], path + '.' + k, depth + 1);
    })(out, 'save', 0);
    const sizes = {}; for (const k in out) { try { sizes[k] = js(out[k]).length; } catch (e) { sizes[k] = -1; } }
    return { bytes: str.length, bad, top: Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 12) };
  };

  // ---------------- a round trip: canon → save → load → canon ----------------
  QA.roundTrip = function () {
    // (load re-runs housing and jobs: settle them first so only what the save loses shows — the jobs move at most three
    // people a town at a time, so a growing city needs a few rounds before it stands still; T-022)
    const roles = () => { let t = ''; for (const v of S().villagers.values()) t += v.id + ':' + (v.role || '') + ':' + (v.home || 0) + ';'; return t; };
    for (let k = 0, prev = null; k < 30; k++) { G.Village.forceUpdate(); const r = roles(); if (r === prev) break; prev = r; }
    const a = QA.canon(); const str = G.Save.serialize();
    G.UI.select(null); G.Save.apply(JSON.parse(str));
    const b = QA.canon(); return { bytes: str.length, diff: QA.diff(a, b) };
  };
  QA.run = function (days, every, fn) { const s = S(); const c0 = s.clock; let n = 0; while (s.clock - c0 < G.DAY_LEN * days) { G.debug.step(0.1); if (fn && ++n % (every || 50) === 0 && fn()) return true; } return false; };
})();
