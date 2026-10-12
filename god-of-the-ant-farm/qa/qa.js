// QA harness injected into the page: deep invariants, canonical state, save audit
(function () {
  const QA = window.QA = {};
  const S = () => G.S;
  const P = id => S().villagers.get(id);
  const person = id => S().villagers.get(id) || S().dead.get(id);
  const fin = x => typeof x === 'number' && isFinite(x);

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
      const pass = i => { const t = s.type[i]; if (t < T.RIVER || s.cliff[i] || G.W.blocked(i)) return false; if (t === T.RIVER && s.deep[i] && !s.road[i]) return false; const w = s.wall[i]; return !w || w === 2 || w === 3 || w === 4; };
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
      if (!v.aboard && !v.ug && !v.held && s.type[i] === G.T.DEEP && !(t && (t.type === 'swim' || t.type === 'naufrago'))) add('pop', 2, `${nm}: em mar profundo sem nadar (${t ? t.type : '-'})`, v.id);
    }
    // dead ones are nowhere among the living
    for (const [id, bid] of bandOf) { const v = P(id); if (!v) add('war', 1, `bando ${bid}: membro morto/inexistente #${id}`, id); else if (!v.task || v.task.type !== 'band' || v.task.band !== bid) { const b = G.War.bands.get(bid); if (!(b && b.campaign)) add('war', 3, `bando ${bid}: membro #${id} sem tarefa de bando (${v.task ? v.task.type : '-'})`, id); } }
    for (const a of armies) {
      const live = (a.members || []).filter(id => P(id));
      if ((a.members || []).length && !live.length) add('war', 2, `exército ${a.name}: todos os membros mortos, mas ativo (${a.phase})`);
      const w = (wz.wars || []).find(x => x.id === a.war); if (!w) add('war', 1, `exército ${a.name}: guerra ${a.war} não existe`); else if (w.end) add('war', 1, `exército ${a.name}: ativo (${a.phase}) numa guerra que terminou no ano ${w.end}`);
      if (!G.Fac.get(a.fac) || !G.Fac.get(a.fac).alive) add('war', 1, `exército ${a.name}: povo ${a.fac} extinto`);
      if (S().day - (a.day || 0) > 40) add('war', 3, `exército ${a.name}: em campo há ${S().day - a.day} anos (${a.phase})`);
    }
    for (const w of (wz.wars || [])) {
      if (w.end) continue;
      const sidesA = w.a.filter(id => G.Fac.get(id) && G.Fac.get(id).alive), sidesB = w.b.filter(id => G.Fac.get(id) && G.Fac.get(id).alive);
      if (!sidesA.length || !sidesB.length) add('war', 2, `guerra ${w.name}: um dos lados não existe mais e ela segue`);
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
    { let ghost = 0, ex = 0; for (let i = 0; i < s.occ.length; i++) { const o = s.occ[i]; if (o && !s.buildings.has(o)) { ghost++; ex = o; } } if (ghost) add('city', 2, `${ghost} casa(s) do mapa ocupadas por prédio inexistente #${ex}`); }
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
    const seen = new Map(); for (const q of out) { const k = q.sys + q.msg; if (!seen.has(k)) seen.set(k, q); }
    return [...seen.values()].sort((a, b) => a.sev - b.sev);
  };

  // ---------------- canonical state (for save/load comparison) ----------------
  QA.canon = function () {
    const s = S(); const r = x => Math.round(x * 100) / 100;
    const vs = [...s.villagers.values()].sort((a, b) => a.id - b.id).map(v => [v.id, v.name, v.set, v.home, v.partner, v.mother, v.father, Math.round(v.age * 1000) / 1000, v.captive ? 'c' + v.captive.from : '', v.aboard || 0, v.role || '', v.job || 0, (v.kids || []).length, v.g, v.secret || 0, v.grp || '', v.reigned || 0]);
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
      walls: (s.walls || []).length, stats: [s.stats.births, s.stats.deaths, s.stats.wars || 0],
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
    G.Village.forceUpdate(); // (load re-runs housing and jobs: settle them first so only what the save loses shows)
    const a = QA.canon(); const str = G.Save.serialize();
    G.UI.select(null); G.Save.apply(JSON.parse(str));
    const b = QA.canon(); return { bytes: str.length, diff: QA.diff(a, b) };
  };
  QA.run = function (days, every, fn) { const s = S(); const c0 = s.clock; let n = 0; while (s.clock - c0 < G.DAY_LEN * days) { G.debug.step(0.1); if (fn && ++n % (every || 50) === 0 && fn()) return true; } return false; };
})();
