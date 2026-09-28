'use strict';
// ============================================================
//  Village: buildings, settlements, stockpile, planner, jobs,
//  housing, chronicle, milestones, births & deaths
// ============================================================
(function (G) {
  const N = G.N, T = G.T, W = G.W;
  const V = G.Village = {};

  G.BDEF = {
    campfire: { name: 'Fogueira', w: 1, h: 1, cost: {}, work: 3, blocks: true, dropoff: true, hp: 60 },
    hut: { name: 'Cabana', w: 1, h: 1, cost: { wood: 10 }, work: 14, housing: 4, blocks: true, hp: 60 },
    house: { name: 'Casa', w: 1, h: 1, cost: { wood: 14, stone: 10 }, work: 24, housing: 6, blocks: true, hp: 110 },
    storehouse: { name: 'Armazém', w: 2, h: 2, cost: { wood: 26, stone: 6 }, work: 30, blocks: true, dropoff: true, storage: 150, hp: 140 },
    farm: { name: 'Fazenda', w: 3, h: 3, cost: { wood: 12 }, work: 10, blocks: false, hp: 60 },
    well: { name: 'Poço', w: 1, h: 1, cost: { wood: 6, stone: 12 }, work: 14, blocks: true, hp: 150 },
    workshop: { name: 'Oficina', w: 2, h: 2, cost: { wood: 30, stone: 22 }, work: 38, blocks: true, hp: 160 },
    temple: { name: 'Templo', w: 2, h: 2, cost: { wood: 28, stone: 55 }, work: 65, blocks: true, hp: 260 },
    monument: { name: 'Monumento', w: 2, h: 2, cost: { wood: 15, stone: 90 }, work: 90, blocks: true, hp: 400 },
    cemetery: { name: 'Cemitério', w: 2, h: 2, cost: {}, work: 0, blocks: false, hp: 999 },
    ruin: { name: 'Ruínas', w: 1, h: 1, cost: {}, work: 0, blocks: false, hp: 1 },
  };
  G.BDESC = {
    campfire: 'O coração do acampamento. Ponto de encontro, depósito e abrigo para quem não tem casa.',
    hut: 'Abrigo simples de palha e madeira. Abriga uma pequena família.',
    house: 'Casa de pedra e madeira. Mais espaço, mais resistente ao fogo.',
    storehouse: 'Guarda comida, madeira e pedra. Aumenta a capacidade de estoque.',
    farm: 'Campos de trigo. Plantar, esperar, colher. A chuva ajuda muito.',
    well: 'Água limpa: menos doenças e baldes para apagar incêndios.',
    workshop: 'Ferramentas melhores (+15% de trabalho) e casas de pedra.',
    temple: 'Onde rezam para você. Gera fé continuamente.',
    monument: 'Um monumento ao deus da ilha. Marca uma vila desenvolvida.',
    cemetery: 'Onde descansam os que partiram.',
    ruin: 'Restos do que existiu aqui.',
  };
  G.ROLE = {
    lenhador: ['Lenhador', 'Lenhadora'], coletor: ['Coletor', 'Coletora'], agricultor: ['Agricultor', 'Agricultora'],
    construtor: ['Construtor', 'Construtora'], mineiro: ['Mineiro', 'Mineira'], cacador: ['Caçador', 'Caçadora'],
    sacerdote: ['Sacerdote', 'Sacerdotisa'], anciao: ['Ancião', 'Anciã'], crianca: ['Criança', 'Criança'], bebe: ['Bebê', 'Bebê'],
  };
  G.roleName = v => { const r = G.ROLE[v.role] || G.ROLE.coletor; return r[v.g === 'f' ? 1 : 0]; };
  G.ERAS = ['Acampamento', 'Aldeia', 'Povoado', 'Comunidade Agrícola', 'Vila Artesã', 'Vila Sagrada', 'Vila Desenvolvida', 'Pequena Civilização'];

  // ------------------------------ time ------------------------------
  G.isNight = () => { const t = G.S.time; return t > 0.73 || t < 0.02; };
  G.isEvening = () => { const t = G.S.time; return t > 0.6 && t <= 0.73; };
  G.person = id => G.S.villagers.get(id) || G.S.dead.get(id);

  // ------------------------------ chronicle ------------------------------
  V.log = function (text, icon, x, y) {
    const e = { d: G.S.day, txt: text, ic: icon || 'info' };
    if (x !== undefined) { e.x = +x.toFixed(1); e.y = +y.toFixed(1); }
    G.S.history.push(e);
    if (G.S.history.length > 400) G.S.history.splice(0, G.S.history.length - 400);
    G.UI && G.UI.onLog(e);
  };
  V.notice = function (text, icon) { G.UI && G.UI.notice(text, icon); };
  V.milestone = function (key, title, sub, icon) {
    const S = G.S; if (S.milestones[key]) return;
    S.milestones[key] = S.day;
    G.UI && G.UI.toast(title, sub, icon || 'star');
    G.Audio && G.Audio.play('milestone');
  };

  // ------------------------------ buildings ------------------------------
  V.addBuilding = function (type, x, y, setId, built) {
    const S = G.S; const def = G.BDEF[type];
    const b = {
      id: S.nextId++, type, x, y, w: def.w, h: def.h, built: !!built, progress: built ? 1 : 0,
      need: Object.assign({ wood: 0, stone: 0 }, built ? {} : def.cost), incoming: { wood: 0, stone: 0 },
      hp: def.hp, maxHp: def.hp, set: setId, blocks: def.blocks, v: Math.floor(G.R() * 3), born: S.day, burnHp: 0,
    };
    if (type === 'farm') b.crops = Array.from({ length: 9 }, () => ({ s: 0, g: 0, c: 0 }));
    if (type === 'cemetery') b.graves = [];
    S.buildings.set(b.id, b);
    for (let ty = y; ty < y + b.h; ty++) for (let tx = x; tx < x + b.w; tx++) {
      const i = ty * N + tx;
      S.occ[i] = b.id;
      const tid = S.treeAt[i]; if (tid) { const t = S.trees.get(tid); if (t) { G.Nature.removeTree(t); if (t.stage === 'grow' && t.size > 0.5) V.addStock('wood', 1); G.FX && G.FX.poof(tx + 0.5, ty + 0.5, '#6d8f3c'); } }
      const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid); if (bu) G.Nature.removeBush(bu); }
    }
    return b;
  };
  V.center = b => [b.x + b.w / 2, b.y + b.h / 2];
  V.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; // front-left side
  V.frontTile = b => [b.x + b.w - 1 + 0.5, b.y + b.h - 1 + 0.5];
  V.removeBuilding = function (b) {
    const S = G.S; S.buildings.delete(b.id);
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) { const i = ty * N + tx; if (S.occ[i] === b.id) S.occ[i] = 0; }
  };
  V.totalCost = def => (def.cost.wood || 0) + (def.cost.stone || 0);
  V.buildName = b => (b.type === 'house' && b.upgradeFrom && !b.built ? 'Casa (reforma)' : G.BDEF[b.type].name);

  V.completeBuilding = function (b) {
    const S = G.S; b.built = true; b.progress = 1; b.need.wood = 0; b.need.stone = 0; b.upgradeFrom = null;
    S.stats.built++;
    const [cx, cy] = V.center(b);
    G.FX && G.FX.complete(cx, cy, b);
    G.Audio && G.Audio.at(cx, cy, 'built', true);
    const set = S.settlements.get(b.set);
    const nm = G.BDEF[b.type].name;
    const firsts = {
      hut: ['firstHut', 'A primeira cabana foi construída.', 'Primeiro abrigo', 'Eles não dormem mais ao relento.'],
      storehouse: ['firstStore', 'O primeiro armazém foi construído.', 'Armazém', 'Agora conseguem guardar muito mais.'],
      farm: ['firstFarm', 'A primeira fazenda foi construída.', 'Primeira fazenda', 'A agricultura chegou à ilha.'],
      well: ['firstWell', 'O primeiro poço foi cavado.', 'Poço', 'Água limpa para todos.'],
      workshop: ['firstWorkshop', 'A oficina abriu suas portas.', 'Oficina', 'Ferramentas melhores, casas de pedra.'],
      temple: ['firstTemple', 'Um templo foi erguido em sua honra.', 'Primeiro templo', 'Eles construíram um lugar para você.'],
      monument: ['firstMonument', 'O Monumento ao Deus foi concluído.', 'Monumento', 'Uma obra que vai durar gerações.'],
      house: ['firstHouse', 'A primeira casa de pedra foi construída.', 'Casa de pedra', 'A aldeia começa a mudar de cara.'],
    };
    const f = firsts[b.type];
    if (f && !S.milestones[f[0]]) {
      V.log(f[1], b.type, cx, cy);
      V.milestone(f[0], f[2], f[3], b.type);
    } else if (b.type !== 'campfire' && b.type !== 'cemetery' && (b.type !== 'hut' && b.type !== 'house' && b.type !== 'farm')) {
      V.log(`${set ? set.name + ': ' : ''}${nm} construído.`, b.type, cx, cy);
    }
    if (b.type === 'campfire' && set && S.settlements.size > 1 && !set.lit) {
      set.lit = true; V.log(`A fogueira de ${set.name} foi acesa.`, 'campfire', cx, cy);
    }
    V.updateEra();
  };

  V.damageBuilding = function (b, amount, cause) {
    if (!b || b.hp <= 0 || b.type === 'ruin' || b.type === 'cemetery') return;
    b.hp -= amount;
    if (b.hp <= 0) V.destroyBuilding(b, cause);
  };
  V.destroyBuilding = function (b, cause) {
    const S = G.S;
    const [cx, cy] = V.center(b);
    const nm = V.buildName(b);
    const set = S.settlements.get(b.set);
    // return delivered materials partially? no: destroyed
    for (const v of S.villagers.values()) {
      if (v.home === b.id) v.home = 0;
      if (v.inside === b.id) { v.inside = 0; v.sleeping = false; G.Vg.endTask(v); }
    }
    if (b.type === 'farm' || b.type === 'campfire') {
      V.removeBuilding(b);
      if (b.type === 'campfire' && set) set.campfire = 0;
    } else {
      // turn into ruins in place (non-blocking)
      b.origType = b.type; b.type = 'ruin'; b.blocks = false; b.built = true; b.ruinT = G.DAY_LEN * 3; b.hp = 1;
    }
    G.FX && G.FX.collapse(cx, cy, b);
    G.Audio && G.Audio.at(cx, cy, 'collapse', true);
    if (b.origType !== 'hut' || G.R() < 0.6)
      V.log(`${nm}${set ? ' de ' + set.name : ''} foi destruíd${nm === 'Armazém' || nm === 'Poço' || nm === 'Templo' || nm === 'Monumento' ? 'o' : 'a'}${cause === 'fire' ? ' pelo fogo' : cause === 'meteor' ? ' por um meteoro' : cause === 'lightning' ? ' por um raio' : ''}.`, 'fire', cx, cy);
  };

  // ------------------------------ stock ------------------------------
  V.cap = function () {
    let c = 80;
    for (const b of G.S.buildings.values()) if (b.type === 'storehouse' && b.built) c += G.BDEF.storehouse.storage;
    return c;
  };
  V.addStock = function (k, n) {
    const S = G.S; const cap = V.cap();
    const add = Math.max(0, Math.min(n, cap - S.stock[k]));
    S.stock[k] += add;
    if (k === 'food') S.stats.foodProduced += add;
    if (k === 'wood') S.stats.woodProduced += add;
    if (k === 'stone') S.stats.stoneProduced += add;
    return add;
  };
  V.dropoffs = function (setId) {
    const out = [];
    for (const b of G.S.buildings.values()) if (b.built && G.BDEF[b.type].dropoff && (setId === undefined || b.set === setId)) out.push(b);
    return out;
  };
  V.nearestDropoff = function (x, y, setId) {
    let list = V.dropoffs(setId); if (!list.length) list = V.dropoffs();
    let best = null, bd = 1e9;
    for (const b of list) { const [cx, cy] = V.center(b); const d = G.dist2(x, y, cx, cy); if (d < bd) { bd = d; best = b; } }
    return best;
  };

  // ------------------------------ settlements ------------------------------
  V.addSettlement = function (name, cx, cy) {
    const S = G.S;
    const s = { id: S.nextId++, name, cx, cy, founded: S.day, campfire: 0, fails: 0, cemetery: 0, lit: false };
    S.settlements.set(s.id, s);
    return s;
  };
  V.nearSettlementName = function (x, y) {
    let best = null, bd = 1e9;
    for (const s of G.S.settlements.values()) { const d = G.dist(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    return best && bd < 16 ? best.name : null;
  };
  V.nearestSettlement = function (x, y) {
    let best = null, bd = 1e9;
    for (const s of G.S.settlements.values()) { const d = G.dist(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    return best;
  };
  V.pop = setId => { let n = 0; for (const v of G.S.villagers.values()) if (setId === undefined || v.set === setId) n++; return n; };
  V.mainSettlement = () => G.S.settlements.values().next().value;

  // ------------------------------ farms ------------------------------
  V.farmTileIndex = (b, x, y) => { const lx = Math.floor(x) - b.x, ly = Math.floor(y) - b.y; return (lx >= 0 && ly >= 0 && lx < 3 && ly < 3) ? ly * 3 + lx : -1; };
  V.cropPos = (b, k) => [b.x + (k % 3) + 0.5, b.y + Math.floor(k / 3) + 0.5];
  function updateFarms(dt) {
    const S = G.S; const drought = S.weather.drought > 0;
    for (const b of S.buildings.values()) {
      if (b.type !== 'farm' || !b.built) continue;
      for (let k = 0; k < 9; k++) {
        const c = b.crops[k]; if (c.s === 0 || c.s === 3) continue;
        const [px, py] = V.cropPos(b, k); const i = W.idx(px, py);
        const rate = (1 / (G.DAY_LEN * 0.7)) * (0.55 + S.fert[i] * 0.7) * (1 + S.wet[i] * 0.9 + S.weather.rain * 0.5)
          * (drought ? 0.35 : 1) * G.Nature.zoneMul(px, py, 'fertility') * (1 + (G.Nature.zoneMul(px, py, 'growth') - 1) * 0.5);
        c.g = Math.min(1, c.g + rate * dt);
        c.s = c.g < 0.3 ? 1 : c.g < 1 ? 2 : 3;
      }
    }
  }

  // ------------------------------ era ------------------------------
  V.updateEra = function () {
    const S = G.S; let has = {};
    for (const b of S.buildings.values()) if (b.built) has[b.type] = true;
    const pop = S.villagers.size;
    let e = 0;
    if (has.hut || has.house) e = 1;
    if (e >= 1 && has.storehouse) e = 2;
    if (e >= 2 && has.farm) e = 3;
    if (e >= 3 && has.workshop) e = 4;
    if (e >= 4 && has.temple) e = 5;
    if (e >= 5 && has.monument && pop >= 40) e = 6;
    if (e >= 6 && S.settlements.size >= 2 && pop >= 80) e = 7;
    if (e > S.era) {
      S.era = e;
      // the whole village gathers around the fire to celebrate
      for (const s of S.settlements.values()) {
        for (const v of S.villagers.values()) if (v.set === s.id && v.age >= 3 && (!v.task || v.task.pri < 2) && G.dist(v.x, v.y, s.cx, s.cy) < 22) G.Vg.give(v, { type: 'celebrate', pri: 1.1, kind: 'celebrate' });
      }
      V.log(`A civilização alcançou uma nova era: ${G.ERAS[e]}.`, 'era');
      V.milestone('era' + e, G.ERAS[e], 'Uma nova era começou.', 'era');
    }
  };

  // ------------------------------ site placement ------------------------------
  V.findSite = function (set, type) {
    const S = G.S; const def = G.BDEF[type];
    const pop = V.pop(set.id);
    const R = Math.min(17, Math.round(6 + Math.sqrt(pop + 1) * 1.5));
    const counts = {}; for (const b of S.buildings.values()) if (b.set === set.id) counts[b.type] = (counts[b.type] || 0) + 1;
    const homes = (counts.hut || 0) + (counts.house || 0);
    let best = null, bestSc = -1e9;
    const cxi = Math.floor(set.cx), cyi = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cxi + dx - Math.floor((def.w - 1) / 2), y = cyi + dy - Math.floor((def.h - 1) / 2);
      if (x < 2 || y < 2 || x + def.w > N - 2 || y + def.h > N - 2) continue;
      const fx = x + def.w / 2, fy = y + def.h / 2;
      const d = G.dist(fx, fy, set.cx, set.cy);
      if (d > R) continue;
      let ok = true, trees = 0, fert = 0;
      for (let ty = y; ty < y + def.h && ok; ty++) for (let tx = x; tx < x + def.w; tx++) {
        const i = ty * N + tx; const t = S.type[i];
        if (t < T.SAND || S.occ[i] || S.objAt[i] || S.fire[i] > 0 || S.scar[i] > G.DAY_LEN * 2) { ok = false; break; }
        if (type === 'farm' && (t === T.SAND || t === T.ROCKY)) { ok = false; break; }
        if (S.treeAt[i]) trees++;
        fert += S.fert[i];
      }
      if (!ok) continue;
      // keep a walkable ring around blocking buildings
      for (let ty = y - 1; ty <= y + def.h && ok; ty++) for (let tx = x - 1; tx <= x + def.w; tx++) {
        if (ty >= y && ty < y + def.h && tx >= x && tx < x + def.w) continue;
        if (!W.inb(tx, ty)) { ok = false; break; }
        const i = ty * N + tx; const o = S.occ[i];
        if (o) { const ob = S.buildings.get(o); if (ob && (def.blocks || ob.blocks)) { ok = false; break; } if (ob && type === 'farm' && ob.type !== 'farm') { ok = false; break; } }
        if (def.blocks && S.type[i] < T.RIVER) { /* water side ok */ }
      }
      if (!ok) continue;
      const sl = W.slope(x, y, def.w, def.h);
      if (sl > (type === 'farm' ? 1.6 : 1.15)) continue;
      let ideal = 3;
      if (type === 'hut' || type === 'house') ideal = 2.6 + homes * 0.33;
      else if (type === 'storehouse') ideal = 3.5 + (counts.storehouse || 0) * 3;
      else if (type === 'farm') ideal = 7 + (counts.farm || 0) * 1.6;
      else if (type === 'well') ideal = 3;
      else if (type === 'workshop') ideal = 5.5;
      else if (type === 'temple') ideal = 5;
      else if (type === 'monument') ideal = 3.2;
      else if (type === 'cemetery') ideal = 8;
      let sc = -Math.abs(d - ideal) * 1.2 - trees * 0.7 - sl * 1.5 + G.R() * 0.8;
      if (type === 'farm') sc += (fert / 9) * 7;
      if (S.type[y * N + x] === T.SAND) sc -= 1.5;
      if (sc > bestSc) { bestSc = sc; best = [x, y]; }
    }
    return best;
  };

  V.startProject = function (set, type) {
    const pos = V.findSite(set, type);
    if (!pos) { set.fails++; return null; }
    const b = V.addBuilding(type, pos[0], pos[1], set.id, false);
    if (type === 'cemetery') V.completeBuilding(b);
    return b;
  };

  // ------------------------------ planner ------------------------------
  function counts(setId) {
    const c = { hut: 0, house: 0, storehouse: 0, farm: 0, well: 0, workshop: 0, temple: 0, monument: 0, campfire: 0, sites: 0, siteTypes: {} };
    for (const b of G.S.buildings.values()) {
      if (b.set !== setId || b.type === 'ruin') continue;
      if (!b.built) { c.sites++; c.siteTypes[b.type] = (c.siteTypes[b.type] || 0) + 1; }
      c[b.type] = (c[b.type] || 0) + 1;
    }
    return c;
  }
  V.counts = counts;
  function globalHas(type) { for (const b of G.S.buildings.values()) if (b.type === type && b.built) return true; return false; }
  function housingInfo(setId) {
    const S = G.S; let cap = 0, homeless = 0, pop = 0;
    for (const b of S.buildings.values()) if (b.set === setId && b.built && G.BDEF[b.type].housing) cap += G.BDEF[b.type].housing;
    for (const v of S.villagers.values()) if (v.set === setId) { pop++; if (!v.home && v.age >= 16) homeless++; }
    return { cap, homeless, pop };
  }
  V.housingInfo = housingInfo;

  function plan(set) {
    const S = G.S;
    const c = counts(set.id);
    const hi = housingInfo(set.id);
    const pop = hi.pop; if (pop === 0) return;
    const isMain = set === V.mainSettlement();
    if (!c.campfire) { const b = V.startProject(set, 'campfire'); if (b) { set.campfire = b.id; } return; }
    const maxSites = Math.min(4, 1 + Math.floor(pop / 11));
    if (c.sites >= maxSites) return;
    const st = S.stock; const cap = V.cap();
    const workshop = globalHas('workshop');
    const homeType = workshop && st.stone >= 6 ? 'house' : 'hut';
    const pendingHousing = (c.siteTypes.hut || 0) * 4 + (c.siteTypes.house || 0) * 6;
    const want = [];
    if ((hi.homeless > 0 || hi.cap - pop < 2) && hi.cap + pendingHousing < pop + 3) want.push(homeType);
    if (!c.storehouse && (pop >= 10 || S.day >= 3) && !c.siteTypes.storehouse) want.push('storehouse');
    if (c.farm === 0 && (S.day >= 4 || pop >= 13)) want.push('farm');
    else if (c.farm > 0 && c.farm * 11 < pop && !c.siteTypes.farm && S.stock.food < pop * 8) want.push('farm');
    if (!c.well && (c.hut + c.house) >= 3) want.push('well');
    if (isMain && !c.workshop && c.storehouse && pop >= 18) want.push('workshop');
    if (isMain && !c.temple && workshop && pop >= 26) want.push('temple');
    if (isMain && !c.monument && c.temple && globalHas('temple') && pop >= 42) want.push('monument');
    if (c.storehouse && !c.siteTypes.storehouse && (st.wood > cap * 0.9 || st.food > cap * 0.9 || st.stone > cap * 0.9) && c.storehouse < 1 + Math.floor(pop / 30)) want.push('storehouse');
    // upgrade an old hut into a stone house
    if (workshop && c.hut > 0 && !c.siteTypes.house && st.stone >= 10 && st.wood >= 14 && want.length === 0) {
      let old = null;
      for (const b of S.buildings.values()) if (b.set === set.id && b.type === 'hut' && b.built && (!old || b.born < old.born)) old = b;
      if (old) {
        old.type = 'house'; old.built = false; old.progress = 0; old.upgradeFrom = 'hut';
        old.need = Object.assign({ wood: 0, stone: 0 }, G.BDEF.house.cost); old.incoming = { wood: 0, stone: 0 };
        old.hp = G.BDEF.house.hp; old.maxHp = old.hp;
        return;
      }
    }
    // proactive housing for growing families
    if (!want.length && hi.cap + pendingHousing < pop + 5 && c.sites === 0) want.push(homeType);
    for (const type of want) {
      if (c.siteTypes[type] && type !== 'hut' && type !== 'house') continue;
      const def = G.BDEF[type];
      // don't open too many sites when materials are scarce
      if (c.sites > 0 && (st.wood < (def.cost.wood || 0) * 0.3 && (def.cost.wood || 0) > 0)) continue;
      const b = V.startProject(set, type);
      if (b) return;
    }
  }

  // ------------------------------ jobs ------------------------------
  const WORK_ROLES = ['lenhador', 'coletor', 'agricultor', 'construtor', 'mineiro', 'cacador', 'sacerdote'];
  function assignJobs(set) {
    const S = G.S;
    const adults = [];
    let pop = 0;
    for (const v of S.villagers.values()) {
      if (v.set !== set.id) continue; pop++;
      if (v.age < 2) v.role = 'bebe';
      else if (v.age < 16) v.role = 'crianca';
      else if (v.age >= 62) v.role = 'anciao';
      else { if (!WORK_ROLES.includes(v.role)) v.role = null; adults.push(v); }
    }
    const A = adults.length; if (!A) return;
    const c = counts(set.id);
    let sites = 0, matNeed = 0, woodNeed = 0, stoneNeed = 0;
    for (const b of S.buildings.values()) if (b.set === set.id && !b.built && b.type !== 'ruin') { sites++; woodNeed += b.need.wood; stoneNeed += b.need.stone; }
    matNeed = woodNeed + stoneNeed;
    const cap = V.cap(); const st = S.stock;
    let farmsBuilt = 0; for (const b of S.buildings.values()) if (b.set === set.id && b.type === 'farm' && b.built) farmsBuilt++;
    let templeBuilt = false; for (const b of S.buildings.values()) if (b.set === set.id && (b.type === 'temple') && b.built) templeBuilt = true;
    let threats = 0; for (const a of S.animals.values()) if (a.kind === 'wolf' && a.hp > 0 && G.dist(a.x, a.y, set.cx, set.cy) < 20) threats++;
    const want = { lenhador: 0, coletor: 0, agricultor: 0, construtor: 0, mineiro: 0, cacador: 0, sacerdote: 0 };
    want.sacerdote = templeBuilt ? (pop >= 45 ? 2 : 1) : 0;
    want.agricultor = Math.min(farmsBuilt * 2, Math.ceil(A * 0.45));
    want.construtor = sites ? Math.min(Math.max(1, Math.ceil(sites * 1.4) + (matNeed > 40 ? 1 : 0)), Math.max(1, Math.floor(A * 0.35))) : 0;
    want.cacador = (A >= 7 ? 1 : 0) + (A >= 22 ? 1 : 0) + Math.min(3, threats);
    let rest = A - want.sacerdote - want.agricultor - want.construtor - want.cacador;
    if (rest < 1) { want.cacador = Math.max(0, want.cacador - 1); rest = A - want.sacerdote - want.agricultor - want.construtor - want.cacador; }
    let rocks = 0; for (const r of S.rocks.values()) if (G.dist(r.x, r.y, set.cx, set.cy) < 26) { rocks++; if (rocks > 2) break; }
    if (!rocks && G.Vg.canQuarry(set)) rocks = 1;
    // how much of each resource the whole island wants to keep in stock
    const totalPop = S.villagers.size;
    let allWood = 0, allStone = 0;
    for (const b of S.buildings.values()) if (!b.built && b.type !== 'ruin') { allWood += b.need.wood; allStone += b.need.stone; }
    const tg = V.targets = {
      food: Math.min(cap * 0.95, Math.max(50, totalPop * 5)),
      wood: Math.min(cap * 0.95, 45 + totalPop * 1.1 + allWood * 1.5),
      stone: Math.min(cap * 0.95, (globalHas('storehouse') ? 25 + totalPop * 0.6 : 8) + allStone * 1.5),
    };
    const lack = k => G.clamp((tg[k] - st[k]) / tg[k], 0, 1);
    const wF = 0.25 + lack('food') * 3;
    const wW = lack('wood') * 2.2 + (woodNeed > st.wood ? 0.8 : 0);
    const wS = rocks ? lack('stone') * 2 + (stoneNeed > st.stone ? 0.6 : 0) : 0;
    const tot = wF + wW + wS;
    if (rest > 0) {
      want.coletor = Math.max(1, Math.round(rest * wF / tot));
      want.mineiro = Math.round(rest * wS / tot);
      want.lenhador = Math.max(0, rest - want.coletor - want.mineiro);
    }
    // current counts
    const have = {}; for (const r of WORK_ROLES) have[r] = [];
    const none = [];
    for (const v of adults) { if (v.role) have[v.role].push(v); else none.push(v); }
    // unassigned first
    const deficit = () => WORK_ROLES.filter(r => have[r].length < want[r]).sort((a, b) => (have[a].length - want[a]) - (have[b].length - want[b]));
    for (const v of none) {
      const d = deficit(); const r = d.length ? pickRoleFor(v, d) : 'coletor';
      v.role = r; have[r].push(v);
    }
    // move surplus to deficit (max 3 changes)
    let changes = 0;
    while (changes < 3) {
      const d = deficit(); if (!d.length) break;
      const sur = WORK_ROLES.filter(r => have[r].length > want[r]);
      if (!sur.length) break;
      // choose surplus role with biggest surplus
      sur.sort((a, b) => (have[b].length - want[b]) - (have[a].length - want[a]));
      const from = sur[0]; const to = pickRoleForList(have[from], d);
      const v = to.v; const r = to.r;
      have[from].splice(have[from].indexOf(v), 1); v.role = r; have[r].push(v); changes++;
    }
  }
  function pickRoleFor(v, roles) {
    if (roles.includes('cacador') && v.courage > 0.6) return 'cacador';
    if (roles.includes('sacerdote') && v.traits.includes('Devoto')) return 'sacerdote';
    return roles[0];
  }
  function pickRoleForList(list, roles) {
    // prefer a villager who isn't busy with a task
    let best = null, bs = -1e9;
    for (const v of list) {
      for (const r of roles) {
        let s = (v.task ? 0 : 2) + G.R();
        if (r === 'cacador') s += v.courage * 3;
        if (r === 'sacerdote' && v.traits.includes('Devoto')) s += 3;
        if (r === roles[0]) s += 1.5;
        if (s > bs) { bs = s; best = { v, r }; }
      }
    }
    return best;
  }

  // ------------------------------ housing ------------------------------
  function assignHousing(set) {
    const S = G.S;
    const homes = [];
    for (const b of S.buildings.values()) if (b.set === set.id && G.BDEF[b.type].housing && (b.built || b.upgradeFrom)) { b.res = 0; homes.push(b); }
    const byId = new Map(homes.map(b => [b.id, b]));
    const vs = [];
    for (const v of S.villagers.values()) if (v.set === set.id) vs.push(v);
    for (const v of vs) {
      if (v.home && !byId.has(v.home)) v.home = 0;
      if (v.home) byId.get(v.home).res++;
    }
    const space = b => G.BDEF[b.type].housing - b.res;
    const findHome = (need) => { let best = null; for (const b of homes) if (b.built && space(b) >= need && (!best || space(b) > space(best))) best = b; return best; };
    // children live with parents
    for (const v of vs) {
      if (v.age >= 16) continue;
      const m = S.villagers.get(v.mother), f = S.villagers.get(v.father);
      const h = (m && m.set === v.set && m.home) || (f && f.set === v.set && f.home) || 0;
      if (h && h !== v.home) { if (v.home && byId.get(v.home)) byId.get(v.home).res--; v.home = h; byId.get(h).res++; }
    }
    for (const v of vs) {
      if (v.age < 16) continue;
      const p = v.partner ? S.villagers.get(v.partner) : null;
      if (p && p.set === v.set) {
        if (p.home && v.home !== p.home) {
          const ph = byId.get(p.home);
          if (ph && space(ph) >= 1) { if (v.home && byId.get(v.home)) byId.get(v.home).res--; v.home = p.home; ph.res++; continue; }
        }
        if (!v.home && !p.home) { const b = findHome(2); if (b) { v.home = b.id; p.home = b.id; b.res += 2; } continue; }
      }
      if (!v.home) { const b = findHome(1); if (b) { v.home = b.id; b.res++; } }
    }
    // grown single adults move out of an overcrowded parental home when possible
    for (const b of homes) {
      if (!b.built || space(b) >= 0) continue;
      for (const v of vs) {
        if (v.home !== b.id || v.age < 18 || v.partner) continue;
        const nb = findHome(1); if (nb && nb !== b) { v.home = nb.id; nb.res++; b.res--; }
        if (space(b) >= 0) break;
      }
    }
  }

  // ------------------------------ expansion ------------------------------
  function checkExpansion() {
    const S = G.S;
    if (S.settlements.size >= 4) return;
    for (const set of [...S.settlements.values()]) {
      const pop = V.pop(set.id);
      if (!(pop >= 34 || (pop >= 24 && set.fails >= 6))) continue;
      if (S.day - set.founded < 8) continue;
      if (G.R() > 0.5) continue;
      // find location
      let best = null, bs = -1e9;
      for (let y = 6; y < N - 6; y += 1) for (let x = 6; x < N - 6; x += 1) {
        const i = y * N + x; const t = S.type[i];
        if (t !== T.GRASS && t !== T.MEADOW) continue;
        if (S.occ[i] || S.objAt[i]) continue;
        let md = 1e9; for (const o of S.settlements.values()) md = Math.min(md, G.dist(x, y, o.cx, o.cy));
        if (md < 15) continue;
        if (G.dOcean && G.dOcean[i] < 4) continue;
        const sl = W.slope(x - 2, y - 2, 5, 5); if (sl > 1.6) continue;
        let trees = 0, land = 0;
        for (let dy = -7; dy <= 7; dy += 2) for (let dx = -7; dx <= 7; dx += 2) {
          const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx;
          if (S.treeAt[j]) trees++; if (S.type[j] >= T.SAND) land++;
        }
        const sc = Math.min(trees, 20) * 0.3 + land * 0.12 + S.fert[i] * 3 - sl * 2 - Math.abs(md - 20) * 0.1 + G.R();
        if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
      }
      if (!best) { set.fails = 0; continue; }
      const used = new Set([...S.settlements.values()].map(s => s.name));
      const name = G.SETTLEMENT_NAMES.find(n => !used.has(n)) || ('Assentamento ' + (S.settlements.size + 1));
      const ns = V.addSettlement(name, best[0], best[1]);
      // pick migrants: young couples with kids first, then singles
      const members = [...S.villagers.values()].filter(v => v.set === set.id);
      const target = G.clamp(Math.round(pop * 0.33), 6, 14);
      const chosen = new Set();
      const couples = members.filter(v => v.g === 'f' && v.partner && v.age < 42 && S.villagers.get(v.partner));
      couples.sort(() => G.R() - 0.5);
      for (const m of couples) {
        if (chosen.size >= target) break;
        const f = S.villagers.get(m.partner); if (f.set !== set.id) continue;
        chosen.add(m); chosen.add(f);
        for (const k of members) if ((k.mother === m.id || k.father === f.id) && k.age < 16) chosen.add(k);
      }
      for (const v of members.filter(v => !v.partner && v.age >= 17 && v.age < 32).sort(() => G.R() - 0.5)) {
        if (chosen.size >= target) break; chosen.add(v);
      }
      if (chosen.size < 4) { S.settlements.delete(ns.id); continue; }
      for (const v of chosen) { G.Vg.endTask(v); v.set = ns.id; v.home = 0; v.sleeping = false; v.inside = 0; v.task = { type: 'migrate', pri: 1.5 }; }
      set.fails = 0;
      V.log(`${chosen.size} pessoas partiram de ${set.name} para fundar ${name}.`, 'settle', best[0], best[1]);
      V.milestone('settle' + S.settlements.size, 'Novo assentamento', `${name} foi fundado.`, 'settle');
      return;
    }
  }

  // ------------------------------ births & deaths ------------------------------
  V.birth = function (mother) {
    const S = G.S;
    const father = S.villagers.get(mother.partner) || S.dead.get(mother.partner);
    const twins = G.R() < 0.05 ? 2 : 1;
    const names = [];
    for (let k = 0; k < twins; k++) {
      const g = G.R() < 0.5 ? 'f' : 'm';
      const c = G.Vg.create({ g, age: 0, x: mother.x + G.rr(-0.2, 0.2), y: mother.y + G.rr(-0.2, 0.2), set: mother.set, mother: mother.id, father: father ? father.id : 0 });
      c.home = mother.home;
      mother.kids.push(c.id); if (father) father.kids.push(c.id);
      S.stats.births++;
      names.push([c.name, g]);
      G.FX && G.FX.hearts(mother.x, mother.y);
    }
    mother.lastBirth = S.day;
    const fn = father ? father.name : null;
    let txt;
    if (twins === 2) txt = `${mother.name}${fn ? ' e ' + fn : ''} tiveram gêmeos: ${names[0][0]} e ${names[1][0]}.`;
    else txt = `${mother.name}${fn ? ' e ' + fn : ''} tiveram ${names[0][1] === 'f' ? 'uma filha' : 'um filho'}, ${names[0][0]}.`;
    V.log(txt, 'baby', mother.x, mother.y);
    G.Audio && G.Audio.at(mother.x, mother.y, 'birth', true);
    if (!S.milestones.firstBirth) V.milestone('firstBirth', 'Primeiro nascimento', 'Uma nova geração começa na ilha.', 'baby');
  };

  const CAUSE = {
    old: (v) => `morreu de velhice aos ${Math.floor(v.age)} anos`,
    hunger: (v) => `morreu de fome aos ${Math.floor(v.age)} anos`,
    wolf: (v) => `foi mort${v.g === 'f' ? 'a' : 'o'} por lobos aos ${Math.floor(v.age)} anos`,
    boar: (v) => `foi mort${v.g === 'f' ? 'a' : 'o'} por um javali aos ${Math.floor(v.age)} anos`,
    fire: (v) => `morreu queimad${v.g === 'f' ? 'a' : 'o'} aos ${Math.floor(v.age)} anos`,
    lightning: (v) => `foi atingid${v.g === 'f' ? 'a' : 'o'} por um raio aos ${Math.floor(v.age)} anos`,
    meteor: (v) => `foi esmagad${v.g === 'f' ? 'a' : 'o'} por um meteoro aos ${Math.floor(v.age)} anos`,
    sick: (v) => `sucumbiu à doença aos ${Math.floor(v.age)} anos`,
    fall: (v) => `caiu das mãos de deus aos ${Math.floor(v.age)} anos`,
    drown: (v) => `se afogou aos ${Math.floor(v.age)} anos`,
    unknown: (v) => `morreu aos ${Math.floor(v.age)} anos`,
  };
  V.kill = function (v, cause, byGod) {
    const S = G.S;
    if (!S.villagers.has(v.id)) return;
    G.Vg.endTask(v);
    S.villagers.delete(v.id);
    S.stats.deaths++;
    if (byGod) S.stats.godKills++;
    const rec = {
      id: v.id, name: v.name, g: v.g, born: v.born, died: S.day, age: v.age, mother: v.mother, father: v.father,
      partner: v.partner, kids: v.kids.slice(), cause, role: v.role, dead: true, traits: v.traits,
    };
    S.dead.set(v.id, rec);
    const p = S.villagers.get(v.partner);
    if (p) { p.partner = 0; p.widow = v.id; p.mourn = G.DAY_LEN * 1.5; p.emo = { k: 'sad', t: 6 }; }
    // mourning & devotion effects on family
    for (const o of S.villagers.values()) {
      const rel = o.mother === v.id || o.father === v.id || v.mother === o.id || v.father === o.id || (o.mother && o.mother === v.mother);
      if (rel) { o.mourn = Math.max(o.mourn, G.DAY_LEN * 0.8); o.emo = { k: 'sad', t: 5 }; if (byGod) { o.devotion = Math.max(0, o.devotion - 25); o.fear = Math.min(100, o.fear + 20); } }
    }
    const txt = `${v.name} ${(CAUSE[cause] || CAUSE.unknown)(v)}.`;
    V.log(txt, cause === 'old' ? 'grave' : 'skull', v.x, v.y);
    V.notice(txt, 'grave');
    G.FX && G.FX.death(v.x, v.y);
    G.Audio && G.Audio.at(v.x, v.y, 'death', true);
    if (!S.milestones.firstDeath) S.milestones.firstDeath = S.day;
    // bury in the cemetery
    const set = S.settlements.get(v.set) || V.mainSettlement();
    if (set) {
      let cem = S.buildings.get(set.cemetery);
      if (!cem || cem.type !== 'cemetery' || cem.graves.length >= 12) {
        cem = V.startProject(set, 'cemetery');
        if (cem) set.cemetery = cem.id;
      }
      if (cem) {
        cem.graves.push(v.id); rec.grave = cem.id;
        // the family comes to say goodbye
        for (const o of S.villagers.values()) {
          const rel = o.id === v.partner || o.mother === v.id || o.father === v.id || v.mother === o.id || v.father === o.id || (v.mother && o.mother === v.mother);
          if (rel && o.set === v.set && G.dist(o.x, o.y, cem.x, cem.y) < 28) G.Vg.give(o, { type: 'funeral', id: cem.id, pri: 1.1, kind: 'funeral' });
        }
      }
    }
    if (G.UI && G.UI.selected === v) G.UI.select(null);
    if (S.villagers.size === 0) {
      V.log('Não resta ninguém na ilha. O silêncio toma conta.', 'skull');
      G.UI && G.UI.toast('A ilha está vazia', 'Todos se foram. Você pode trazer viajantes com o tempo…', 'skull');
    }
  };

  // ------------------------------ faith ------------------------------
  V.faithRate = 0;
  function updateFaith(dt) {
    const S = G.S; let r = S.villagers.size ? 0.12 : 0;
    for (const v of S.villagers.values()) r += 0.003 + v.devotion * 0.002 + v.fear * 0.0013;
    for (const b of S.buildings.values()) if (b.built) { if (b.type === 'temple') r += 0.2; if (b.type === 'monument') r += 0.4; }
    V.faithRate = r;
    S.faith = Math.min(999, S.faith + r * dt);
  }
  V.perception = function () {
    const S = G.S; let d = 0, f = 0, n = 0;
    for (const v of S.villagers.values()) { if (v.age < 6) continue; d += v.devotion; f += v.fear; n++; }
    if (!n) return ['Ninguém', 'none'];
    d /= n; f /= n;
    if (d < 12 && f < 12) return ['Um mistério', 'mist'];
    if (d > f * 1.5) return [d < 35 ? 'Um espírito gentil' : d < 65 ? 'Protetor' : 'Deus amado', 'love'];
    if (f > d * 1.5) return [f < 35 ? 'Uma força estranha' : f < 65 ? 'Deus temido' : 'Tirano divino', 'fear'];
    return ['Deus imprevisível', 'mixed'];
  };

  // ------------------------------ population milestones ------------------------------
  function checkMilestones() {
    const S = G.S; const pop = S.villagers.size;
    if (pop > S.stats.maxPop) S.stats.maxPop = pop;
    const pm = [[15, 'Crescendo'], [20, 'Vinte almas'], [30, 'Trinta almas'], [50, 'Cinquenta almas'], [75, 'Setenta e cinco almas'], [100, 'Cem almas'], [150, 'Cento e cinquenta almas'], [200, 'Duzentas almas']];
    for (const [n, t] of pm) {
      if (pop >= n && !S.milestones['pop' + n]) {
        V.log(`A população chegou a ${n} habitantes.`, 'pop');
        if (n >= 20) V.milestone('pop' + n, t, `A população chegou a ${n} habitantes.`, 'pop'); else S.milestones['pop' + n] = S.day;
      }
    }
    const age = S.day - 1;
    for (const y of [10, 25, 50, 100, 200]) {
      if (age >= y && !S.milestones['years' + y]) {
        V.log(`A civilização completou ${y} anos.`, 'era');
        V.milestone('years' + y, `${y} anos`, `A civilização completou ${y} anos de história.`, 'era');
      }
    }
    for (const v of S.villagers.values()) if (v.age > S.stats.oldest) { S.stats.oldest = v.age; S.stats.oldestName = v.name; }
  }

  // ------------------------------ ruins ------------------------------
  function updateRuins(dt) {
    for (const b of [...G.S.buildings.values()]) if (b.type === 'ruin') { b.ruinT -= dt; if (b.ruinT <= 0) V.removeBuilding(b); }
  }

  // ------------------------------ main update ------------------------------
  let tPlan = 0, tJobs = 0, tHouse = 0, tSlow = 0;
  V.update = function (dt) {
    const S = G.S;
    tPlan += dt; tJobs += dt; tHouse += dt; tSlow += dt;
    updateFaith(dt);
    if (tSlow >= 1) { updateFarms(tSlow); updateRuins(tSlow); checkMilestones(); tSlow = 0; }
    if (tHouse >= 2.5) { tHouse = 0; for (const s of S.settlements.values()) assignHousing(s); }
    if (tJobs >= 4) { tJobs = 0; for (const s of S.settlements.values()) assignJobs(s); }
    if (tPlan >= 3.5) {
      tPlan = 0;
      for (const s of [...S.settlements.values()]) {
        if (V.pop(s.id) === 0 && S.settlements.size > 1 && s !== V.mainSettlement()) continue;
        plan(s);
      }
    }
  };
  V.forceUpdate = function () {
    for (const s of G.S.settlements.values()) { assignHousing(s); assignJobs(s); }
    V.updateEra();
  };
  V.onNewDay = function () {
    checkExpansion();
    V.updateEra();
  };
})(window.G);
