'use strict';
// ============================================================
//  Natureza: the god's hand on the living world.
//  Call animals, a holy spring, great migrations, taming a
//  beast as a city's guardian, changing a land's climate,
//  locust swarms and legendary monsters.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers, A = G.Animals;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const SP = () => A.DEF;
  const oa = sp => (sp.g === 'f' ? 'a' : 'o');

  G.POWER_TABS.splice(4, 0, { id: 'natureza', name: 'Natureza' });
  const WILD = [
    { id: 'summon', tab: 'natureza', name: 'Chamar Animais', cost: 16, r: 1.5, good: true, choose: true, desc: 'Escolha uma espécie que viva naquele lugar e um bando dela aparece: presas para os caçadores, caça para os predadores.' },
    { id: 'spring', tab: 'natureza', name: 'Primavera Sagrada', cost: 24, r: 6, good: true, desc: 'O capim cresce alto, os arbustos se enchem de frutos e os animais da área dão cria na hora.' },
    { id: 'migrate', tab: 'natureza', name: 'Grande Migração', cost: 30, r: 3, good: null, choose: true, desc: 'Chame os rebanhos de uma espécie para cá. Eles atravessam o mapa — e os predadores vão atrás.' },
    { id: 'tame', tab: 'natureza', name: 'Domar Fera', cost: 35, r: 1.5, good: true, desc: 'Toque um predador: ele passa a guardar a cidade mais próxima, atacando feras e inimigos e protegendo o povo.' },
    { id: 'climate', tab: 'natureza', name: 'Mudar o Clima', cost: 50, r: 6, good: null, choose: true, desc: 'Transforme o clima de uma região: neve eterna, selva, pântano, deserto... As árvores e os animais mudam junto.' },
    { id: 'locusts', tab: 'natureza', name: 'Gafanhotos', cost: 38, r: 3, good: false, desc: 'Uma nuvem de gafanhotos voa até as plantações mais próximas e devora colheitas, capim e frutos.' },
    { id: 'beast', tab: 'natureza', name: 'Fera Lendária', cost: 85, r: 1.5, good: false, desc: 'Desperta um predador gigante, típico daquela terra. Caça gente, derruba guerreiros — e vira lenda.' },
  ];
  for (const p of WILD) G.POWERS.push(p);
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });
  const IS = {}; for (const p of WILD) IS[p.id] = 1;

  function st() { const S = G.S; if (!S.wild) S.wild = { swarms: [], climate: [] }; return S.wild; }

  // ------------------------------ helpers ------------------------------
  const tileOf = (x, y) => W.idx(G.clamp(x, 0, N - 0.01), G.clamp(y, 0, N - 0.01));
  function animalAt(x, y, r, test) {
    let best = null, bd = r * r;
    for (const a of G.S.animals.values()) { if (a.dead || a.held) continue; if (test && !test(a)) continue; const d = G.dist2(a.x, a.y, x, y); if (d < bd) { bd = d; best = a; } }
    return best;
  }
  function nearestSet(x, y, R) {
    let best = null, bd = R * R;
    for (const s of G.S.settlements.values()) { const f = G.Fac.get(s.fac); if (!f || f.alive === false) continue; const d = G.dist2(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    return best;
  }
  const where = (x, y) => G.Village.nearSettlementName(x, y);
  // trophic level: 1 eats plants, 2 eats animals, 3 nobody hunts it
  A.level = k => { const d = SP()[k]; if (!d) return 1; if (d.apex) return 3; if (d.diet === 'carn' || d.diet === 'scav' || d.diet === 'fish' || (d.diet === 'omni' && d.prey)) return 2; return 1; };
  const tameable = a => { const d = SP()[a.kind]; return d && (d.cls === 'land' || d.cls === 'amph') && A.predator(a.kind) && d.size >= 0.9 && !a.raid; };
  const BEAST = [['bear', 'o Urso Negro'], ['polarbear', 'o Urso Branco'], ['bear', 'o Urso da Taiga'], ['croc', 'o Rei do Lodo'], ['jaguar', 'a Onça Sombria'], ['lion', 'o Leão de Juba Rubra'], ['lion', 'o Leão do Deserto']];
  const BEAST_OF = [0, 1, 2, 3, 4, 5, 6];
  // climate targets: [temperature, moisture]
  const CLIM = [[0.42, 0.5], [0.07, 0.42], [0.25, 0.52], [0.46, 0.88], [0.76, 0.72], [0.72, 0.46], [0.84, 0.14]];
  const CLIM_NAME = ['Floresta Temperada', 'Inverno Eterno', 'Taiga', 'Pântano', 'Floresta Tropical', 'Savana', 'Deserto'];
  const CLIM_DESC = [
    'Bosques de carvalhos e bétulas, campos verdes, cervos e raposas.',
    'Neve para sempre: pinheiros brancos, renas, ursos-polares — e quase nada para plantar.',
    'Pinheiros escuros e frio seco. Lobos, renas e lebres.',
    'Água parada, salgueiros e névoa. Rãs, capivaras e crocodilos.',
    'Calor e chuva: árvores gigantes, macacos, araras e onças.',
    'Capim dourado e acácias. Zebras, girafas, elefantes — e leões.',
    'Areia, cactos e sol sem piedade. Camelos, lagartos e fenecos.',
  ];

  // ------------------------------ checks & choices ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (!IS[p.id]) return prevCheck ? prevCheck(p, x, y) : true;
    const S = G.S; const i = tileOf(x, y); const land = S.type[i] >= T.SAND;
    switch (p.id) {
      case 'summon': if (!P.options('summon', x, y).length) { P.why = 'Nenhuma espécie vive neste lugar.'; return false; } break;
      case 'spring': if (!land) { P.why = 'A primavera precisa de terra firme.'; return false; } break;
      case 'migrate': if (!land) { P.why = 'Escolha um destino em terra firme.'; return false; } if (!P.options('migrate', x, y).length) { P.why = 'Nenhum rebanho poderia viver aqui.'; return false; } break;
      case 'tame': {
        const a = animalAt(x, y, 1.6, tameable);
        if (!a) { P.why = 'Toque um predador em terra: lobo, urso, leão, onça, hiena, crocodilo...'; return false; }
        if (a.tamed) { P.why = `${a.named || G.cap(SP()[a.kind].nameA)} já guarda uma cidade.`; return false; }
        if (!nearestSet(a.x, a.y, 30)) { P.why = 'Não há nenhuma cidade por perto para ela guardar.'; return false; }
        break;
      }
      case 'climate': if (!land) { P.why = 'O clima muda sobre a terra.'; return false; } break;
      case 'locusts': if (!land) { P.why = 'Os gafanhotos nascem em terra.'; return false; } if (st().swarms.length >= 3) { P.why = 'O céu já está cheio de gafanhotos.'; return false; } break;
      case 'beast': if (!land || S.type[i] === T.RIVER || W.blocked(i)) { P.why = 'A fera precisa de chão firme e livre.'; return false; } if (G.S.animals.size && [...G.S.animals.values()].filter(a => a.legend && !a.dead).length >= 3) { P.why = 'Já há feras lendárias demais no mundo.'; return false; } break;
    }
    return true;
  };
  const prevOptions = P.options;
  P.options = function (id, x, y) {
    if (!IS[id]) return prevOptions ? prevOptions(id, x, y) : [];
    const S = G.S; const i = tileOf(x, y); const cnt = A.counts();
    if (id === 'summon') {
      const water = S.type[i] <= T.SEA;
      return A.ids.filter(k => { const d = SP()[k]; if (water && d.cls === 'land') return false; if (!water && d.cls === 'water') return false; return A.habitat(d, i); })
        .sort((a, b) => A.level(a) - A.level(b) || SP()[a].name.localeCompare(SP()[b].name))
        .map(k => { const d = SP()[k]; const eats = d.prey ? d.prey.slice(0, 3).map(q => SP()[q].name.toLowerCase()).join(', ') : ''; const by = (A.eatenBy[k] || []).slice(0, 3).map(q => SP()[q].name.toLowerCase()).join(', ');
          return { k, name: `${d.name} (${cnt[k] || 0})`, desc: `${A.dietName(k)}${eats ? ': ' + eats : ''}.${by ? ' Caçad' + oa(d) + ' por ' + by + '.' : d.apex ? ' Predador de topo.' : ''}` }; });
    }
    if (id === 'migrate') {
      return A.ids.filter(k => { const d = SP()[k]; return (d.cls === 'land' || d.cls === 'amph') && A.level(k) === 1 && (cnt[k] || 0) >= 3 && A.habitat(d, i); })
        .map(k => { const d = SP()[k]; const preds = (A.eatenBy[k] || []).filter(q => cnt[q]).map(q => SP()[q].name.toLowerCase()); return { k, name: `${d.name} (${cnt[k]})`, desc: `Os rebanhos atravessam o mapa até aqui.${preds.length ? ' ' + G.cap(preds.slice(0, 3).join(', ')) + ' irão atrás.' : ''}` }; });
    }
    if (id === 'climate') {
      const cur = S.biome ? S.biome[i] : 0;
      return CLIM.map((_, b) => b).filter(b => b !== cur).map(b => ({ k: String(b), name: CLIM_NAME[b], desc: CLIM_DESC[b] }));
    }
    return [];
  };
  const prevTitle = P.optionsTitle;
  P.optionsTitle = function (id, x, y) {
    if (!IS[id]) return prevTitle ? prevTitle(id, x, y) : '';
    const bn = G.Biome && G.S.biome ? G.Biome.nameAt(Math.floor(x), Math.floor(y)).toLowerCase() : 'esta terra';
    if (id === 'summon') return `Que animal chamar ${G.S.type[tileOf(x, y)] <= T.SEA ? 'ao mar' : G.Biome.toAt(Math.floor(x), Math.floor(y))}?`;
    if (id === 'migrate') return 'Que rebanho deve migrar para cá?';
    if (id === 'climate') return `Em que transformar ${bn === 'esta terra' ? bn : 'a ' + bn}?`;
    return '';
  };

  // ------------------------------ Chamar Animais ------------------------------
  P.summon = function (x, y, k) {
    const d = SP()[k]; if (!d) return;
    const n = d.apex ? G.ri(1, 2) : G.ri(d.herd[0], Math.max(d.herd[0], d.herd[1]));
    const L = A.spawnGroup(k, x, y, n);
    for (const a of G.S.animals.values()) if (a.leader === L.id || a === L) { a.hx = x; a.hy = y; a.age = G.rr(0.25, 0.5) * d.life; }
    G.FX && G.FX.summon(x, y);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 10, d.apex || d.bold ? 0 : 4, d.apex || d.bold ? 6 : 0);
    log(`${n > 1 ? G.cap(A.plural(d, n)) + ' surgiram' : G.cap(d.nameA) + ' surgiu'} ${G.Biome.toAt(Math.floor(x), Math.floor(y))}, chamad${n > 1 ? (d.g === 'f' ? 'as' : 'os') : oa(d)} pelos céus.`, 'deer', x, y);
  };

  // ------------------------------ Primavera Sagrada ------------------------------
  P.spring = function (x, y) {
    const S = G.S; const r = 6; const veg = S.veg;
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue; const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r) continue;
      const i = ty * N + tx; if (S.type[i] < T.SAND || S.type[i] === T.RIVER) continue;
      if (veg) veg[i] = Math.max(veg[i], A.vegCap(i) * 1.3);
      if (S.type[i] >= T.GRASS) { S.bloom[i] = Math.max(S.bloom[i], DAY() * 1.5); G.Nature.markDirty(i); }
      const t = S.treeAt[i] && S.trees.get(S.treeAt[i]); if (t && t.stage === 'grow') t.size = Math.min(t.maxSize, t.size + 0.25);
      const b = S.objAt[i] && S.bushes.get(S.objAt[i]); if (b) { b.berries = b.max || 5; b.grow = 0; }
    }
    // the young of every herd in the meadow
    const by = {}; for (const a of S.animals.values()) if (!a.dead && !a.tamed && !a.legend && a.grown >= 1 && G.dist(a.x, a.y, x, y) < r) (by[a.kind] = by[a.kind] || []).push(a);
    let born = 0;
    for (const k in by) {
      const d = SP()[k]; const L = by[k]; const kids = Math.min(A.level(k) === 1 ? 8 : 2, Math.floor(L.length / 2 + (L.length % 2 && G.R() < 0.5 ? 1 : 0)));
      for (let j = 0; j < kids; j++) {
        const m = L[j % L.length];
        A.spawn(k, m.x + G.rr(-0.6, 0.6), m.y + G.rr(-0.6, 0.6), { leader: m.leader || m.id, age: 0, grown: 0.35, hunger: 0.1, z: d.cls === 'air' ? m.z : 0, hx: m.hx, hy: m.hy });
        born++; const eco = S.eco || (S.eco = { deaths: {}, born: {} }); eco.born[k] = (eco.born[k] || 0) + 1;
      }
      for (const a of L) a.hunger = 0;
    }
    S.zones.push({ kind: 'fertility', x, y, r, t: DAY() * 0.8, power: 1.3 });
    G.FX && G.FX.fertility && G.FX.fertility(x, y, r);
    G.Audio && G.Audio.play('fertility');
    P.witness(x, y, 13, 7, 0);
    log(`Uma primavera sagrada cobriu a terra de flores${born ? ': nasceram ' + born + (born > 1 ? ' filhotes' : ' filhote') + ' num só dia' : ''}.`, 'flower', x, y);
  };

  // ------------------------------ Grande Migração ------------------------------
  P.migrate = function (x, y, k) {
    const S = G.S; const d = SP()[k]; if (!d) return;
    const herd = [...S.animals.values()].filter(a => a.kind === k && !a.dead && !a.tamed && !a.held && G.dist(a.x, a.y, x, y) > 6).sort(() => G.R() - 0.5);
    const take = herd.slice(0, Math.max(3, Math.ceil(herd.length * 0.7)));
    for (const a of take) { a.hx = x + G.rr(-3, 3); a.hy = y + G.rr(-3, 3); a.mig = true; a.state = 'idle'; a.t = G.rr(0, 2); }
    // the hunters follow the herds
    let pr = 0; const preds = new Set(A.eatenBy[k] || []);
    for (const a of S.animals.values()) if (preds.has(a.kind) && !a.dead && !a.tamed && !a.legend && G.R() < 0.5) { const sp = SP()[a.kind]; if (sp.cls === 'water' || sp.cls === 'air') continue; if (!A.habitat(sp, tileOf(x, y))) continue; a.hx = x + G.rr(-5, 5); a.hy = y + G.rr(-5, 5); a.mig = true; pr++; }
    P.witness(x, y, 12, 3, 0);
    const w = where(x, y);
    log(`A Grande Migração: ${A.plural(d, take.length)} cruzam a terra rumo ${w ? 'aos arredores de ' + w : G.Biome.toAt(Math.floor(x), Math.floor(y))}${pr ? ', com predadores no rastro' : ''}.`, 'deer', x, y);
    G.Lore && G.Lore.note('migration', { kind: k, n: take.length, where: w });
  };

  // ------------------------------ Domar Fera ------------------------------
  P.tame = function (x, y) {
    const a = animalAt(x, y, 1.6, tameable); if (!a) return;
    const s = nearestSet(a.x, a.y, 30); if (!s) return;
    const d = SP()[a.kind];
    a.tamed = s.fac; a.hx = s.cx + G.rr(-2, 2); a.hy = s.cy + G.rr(-2, 2); a.mig = true; a.guardSet = s.id;
    a.angry = 0; a.target = 0; a.state = 'idle'; a.onPerson = false; a.summoned = false; a.leader = 0; a.hunger = 0;
    a.maxHp = Math.round(a.maxHp * 1.5); a.hp = a.maxHp;
    if (!a.named) a.named = G.mythName();
    G.FX && G.FX.anoint(a.x, a.y);
    G.Audio && G.Audio.play('magic');
    P.witness(a.x, a.y, 12, 9, 2);
    log(`${a.named}, ${d.nameA}, curvou a cabeça diante dos céus. Agora guarda ${s.name}.`, 'wolf', a.x, a.y);
    G.Lore && G.Lore.note('tamed', { name: a.named, kind: a.kind, set: s.id, setName: s.name, fac: s.fac });
  };

  // ------------------------------ Mudar o Clima ------------------------------
  // push a region's temperature & moisture towards a biome; soft edges blend into the land around
  function shiftClimate(x, y, r, b, visible) {
    const S = G.S; if (!S.temp || !S.biome) return { trees: 0, gone: 0 };
    const [tt, tm] = CLIM[b]; let conv = 0, gone = 0;
    for (let ty = Math.floor(y - r - 2); ty <= y + r + 2; ty++) for (let tx = Math.floor(x - r - 2); tx <= x + r + 2; tx++) {
      if (!W.inb(tx, ty)) continue;
      const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r + 2) continue;
      const i = ty * N + tx; const f = 1 - G.smooth(r - 1.5, r + 2, d);
      S.temp[i] = Math.round(G.lerp(S.temp[i], tt * 255, f)); S.moist[i] = Math.round(G.lerp(S.moist[i], tm * 255, f));
      if (!visible) { if (d <= r) S.biome[i] = b; continue; }
      const before = S.type[i];
      G.Biome.refresh(i, d <= r ? b : undefined);
      if (S.type[i] !== before) S.typeVer = (S.typeVer || 0) + 1;
      G.Nature.markDirty(i);
      if (S.veg) S.veg[i] = Math.min(S.veg[i], A.vegCap(i));
      // the trees change with the land
      const t = S.treeAt[i] && S.trees.get(S.treeAt[i]);
      if (t && t.stage === 'grow' && !G.Biome.canGrow(t.kind, i)) {
        const BD = G.BIOMES[S.biome[i]];
        if (G.R() < Math.min(1, BD.dens * 1.4 + 0.08)) { t.kind = G.Biome.pickTree(S.biome[i]); t.maxSize = Math.max(t.size, t.kind === 'palm' || t.kind === 'cactus' ? 1 : 1.05); conv++; }
        else { G.Nature.removeTree(t); gone++; }
      }
    }
    return { trees: conv, gone };
  }
  P.climate = function (x, y, k) {
    const S = G.S; const b = +k; const r = 6;
    const res = shiftClimate(x, y, r, b, true);
    // a few young trees of the new land
    const BD = G.BIOMES[b];
    for (let n = 0; n < Math.round(20 * BD.dens); n++) { const a = G.R() * 6.28, d = Math.sqrt(G.R()) * r; const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (!W.inb(px, py)) continue; const i = W.idx(px, py); if (G.Biome.canGrow(G.Biome.pickTree(b), i) && S.type[i] >= T.SAND) G.Nature.addTree(Math.floor(px) + 0.5, Math.floor(py) + 0.5, G.Biome.pickTree(b), G.rr(0.3, 0.7)); }
    const w = st(); w.climate.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, r, b }); if (w.climate.length > 60) w.climate.shift();
    A.invalidateHab && A.invalidateHab();
    // animals that cannot live here anymore look for a new home
    let moved = 0;
    for (const a of S.animals.values()) {
      if (a.dead || a.tamed || a.legend) continue; const sp = SP()[a.kind]; if (sp.cls === 'water') continue;
      if (G.dist(a.hx, a.hy, x, y) > r + 1 && G.dist(a.x, a.y, x, y) > r + 1) continue;
      if (A.habitat(sp, tileOf(a.hx, a.hy))) continue;
      const home = findHabitat(sp, a.x, a.y, r + 16); if (home) { a.hx = home[0]; a.hy = home[1]; a.mig = true; moved++; }
    }
    G.Render.invalidateTerrain(x, y, r + 3);
    G.FX && G.FX.ring(x, y, 0.5, r + 1.5, 1.6, b === 1 ? '#e8f4ff' : b === 6 ? '#f0c878' : b === 3 ? '#8ab070' : '#9fe39a', 3, true);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 16, 4, 6);
    const wn = where(x, y);
    const T0 = ['A terra voltou a ser bosque', 'A neve caiu e não derreteu mais', 'Os pinheiros escuros tomaram a terra', 'As águas subiram do chão e a terra virou pântano', 'Uma selva brotou numa noite', 'O capim ficou dourado e as acácias se abriram', 'O sol secou tudo: a terra virou deserto'];
    log(`${T0[b]}${wn ? ' perto de ' + wn : ''}.${res.gone ? ' ' + res.gone + (res.gone > 1 ? ' árvores morreram' : ' árvore morreu') + '.' : ''}${moved ? ' Os animais partiram em busca de outra casa.' : ''}`, b === 1 ? 'storm' : 'flower', x, y);
    G.Lore && G.Lore.note('climate', { b, where: wn });
  };
  function findHabitat(sp, x, y, R) {
    for (let k = 0; k < 60; k++) { const a = G.R() * 6.28, d = 4 + G.R() * R; const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (!W.inb(px, py)) continue; const i = W.idx(px, py); if (G.S.type[i] > T.SEA && A.habitat(sp, i)) return [px, py]; }
    return null;
  }

  // ------------------------------ Gafanhotos ------------------------------
  P.locusts = function (x, y) {
    const w = st();
    w.swarms.push({ x, y, tx: x, ty: y, life: DAY() * 0.8, t: 0, ate: 0, tick: 0, id: G.S.nextId++, fac: 0 });
    G.Audio && G.Audio.play('plague');
    P.witness(x, y, 14, 0, 8);
    log(`Uma nuvem negra de gafanhotos levantou voo${where(x, y) ? ' perto de ' + where(x, y) : ''}. O céu zumbe.`, 'sick', x, y);
  };
  function nearestFarm(x, y, R) {
    let best = null, bd = R * R;
    for (const b of G.S.buildings.values()) { if (b.type !== 'farm' || !b.built || !b.crops) continue; if (!b.crops.some(c => c.s > 0)) continue; const cx = b.x + b.w / 2, cy = b.y + b.h / 2; const d = G.dist2(x, y, cx, cy); if (d < bd) { bd = d; best = [cx, cy]; } }
    return best;
  }
  function updateSwarms(dt) {
    const S = G.S; const w = st();
    for (let k = w.swarms.length - 1; k >= 0; k--) {
      const s = w.swarms[k]; s.life -= dt; s.t += dt; s.tick -= dt;
      if (s.tick <= 0) {
        s.tick = 0.5;
        const f = nearestFarm(s.x, s.y, 22);
        if (f) { s.tx = f[0]; s.ty = f[1]; } else if (G.dist(s.x, s.y, s.tx, s.ty) < 1) { s.tx = G.clamp(s.x + G.rr(-8, 8), 2, N - 2); s.ty = G.clamp(s.y + G.rr(-8, 8), 2, N - 2); }
        const r = 2.3;
        for (let ty = Math.floor(s.y - r); ty <= s.y + r; ty++) for (let tx = Math.floor(s.x - r); tx <= s.x + r; tx++) {
          if (!W.inb(tx, ty) || G.dist(tx + 0.5, ty + 0.5, s.x, s.y) > r) continue;
          const i = ty * N + tx; if (S.veg) S.veg[i] *= 0.5;
          const oid = S.objAt[i]; const bu = oid && S.bushes.get(oid); if (bu && bu.berries > 0) bu.berries = 0;
          const b = S.occ[i] && S.buildings.get(S.occ[i]);
          if (b && b.type === 'farm' && b.crops) { const kk = G.Village.farmTileIndex(b, tx, ty); const c = kk >= 0 && b.crops[kk]; if (c && c.s > 0 && G.R() < 0.3) { c.s = 0; c.g = 0; c.c = 0; s.ate++; } }
        }
        // a feast for the insect eaters; a fright for everyone else
        A.near(s.x, s.y, 3.5, a => { const d = SP()[a.kind]; if (d && d.diet === 'insect' && !a.dead) a.hunger = 0; });
        for (const v of S.villagers.values()) if (!v.inside && G.dist2(v.x, v.y, s.x, s.y) < 9 && G.R() < 0.2) G.Vg.emote(v, 'fear', 1.5);
        if (S.weather.rain > 0.5) s.life -= 2; // heavy rain grounds them
      }
      const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
      if (d > 0.05) { const sp = Math.min(d, dt * 1.6); s.x += dx / d * sp + Math.sin(s.t * 1.7) * dt * 0.4; s.y += dy / d * sp + Math.cos(s.t * 1.3) * dt * 0.4; }
      if (s.life <= 0) {
        w.swarms.splice(k, 1);
        if (s.ate) log(`A nuvem de gafanhotos se desfez depois de devorar ${s.ate} ${s.ate > 1 ? 'canteiros' : 'canteiro'} de plantação.`, 'sick', s.x, s.y);
        G.Lore && G.Lore.note('locusts', { ate: s.ate, where: where(s.x, s.y) });
      }
    }
  }

  // ------------------------------ Fera Lendária ------------------------------
  P.beast = function (x, y) {
    const S = G.S; const i = tileOf(x, y); const b = S.biome ? S.biome[i] : 0;
    let [k, title] = BEAST[BEAST_OF[b] || 0];
    if (k === 'croc' && !A.habitat(SP().croc, i)) [k, title] = ['jaguar', 'a Onça do Pântano'];
    const d = SP()[k];
    const name = G.mythName();
    const a = A.spawn(k, x, y, { grown: 1, legend: true, big: 1.7, named: name, epithet: title, hunger: 0.5, age: d.life * 0.2, lifeMul: 2.5, hx: x, hy: y });
    a.maxHp = Math.round(d.hp * 4 + 120); a.hp = a.maxHp; a.meat = d.meat * 3;
    S.eco = S.eco || { deaths: {}, born: {} };
    G.Render.shake && G.Render.shake(0.5);
    G.Audio && G.Audio.play('howl');
    P.witness(x, y, 18, 0, 22);
    const w = where(x, y);
    log(`${name}, ${title}, despertou${w ? ' perto de ' + w : ''}. Os caçadores escondem as crianças.`, 'wolf', x, y);
    G.Lore && G.Lore.note('legendBeast', { name, title, kind: k, where: w });
  };

  // ------------------------------ update & drawing ------------------------------
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) { if (prevUpd) prevUpd(dt); if (G.S.wild && G.S.wild.swarms.length) updateSwarms(dt); };
  const prevDW = P.drawWorld;
  P.drawWorld = function (ctx, proj, t) {
    if (prevDW) prevDW(ctx, proj, t);
    const w = G.S.wild; if (!w || !w.swarms.length) return;
    for (const s of w.swarms) {
      const fade = G.clamp(s.life / 6, 0, 1) * G.clamp(s.t / 2, 0, 1);
      const n = 190; ctx.fillStyle = `rgba(40,34,20,${0.75 * fade})`;
      const p0 = proj(s.x, s.y, W.groundH(s.x, s.y));
      for (let j = 0; j < n; j++) {
        const h1 = G.hash(j * 7 + s.id), h2 = G.hash(j * 13 + s.id * 3), h3 = G.hash(j * 5 + 11);
        const ang = t * (0.8 + h3 * 1.6) * (h1 < 0.5 ? 1 : -1) + h2 * 6.28;
        const rr = 6 + h1 * 38 + Math.sin(t * 2 + j) * 4;
        const px = p0[0] + Math.cos(ang) * rr, py = p0[1] - 16 - h2 * 22 + Math.sin(ang) * rr * 0.45 + Math.sin(t * 9 + j) * 1.5;
        ctx.fillRect(px, py, 2, 1.3);
      }
      // the shadow of the cloud on the fields
      ctx.fillStyle = `rgba(30,26,14,${0.12 * fade})`; ctx.beginPath(); ctx.ellipse(p0[0], p0[1], 44, 20, 0, 0, 6.283); ctx.fill();
    }
  };

  // ------------------------------ save ------------------------------
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.wild) out.wild = G.S.wild; },
    load(o) {
      const S = G.S; S.wild = o.wild || null;
      // biomes are saved, but the temperature and moisture that colour the ground are recomputed: replay the god's changes
      if (S.wild && S.temp) for (const c of S.wild.climate) shiftClimate(c.x, c.y, c.r, c.b, false);
    },
  });
})(window.G);
