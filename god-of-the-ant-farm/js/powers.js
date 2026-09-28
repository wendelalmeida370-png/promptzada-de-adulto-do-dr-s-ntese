'use strict';
// ============================================================
//  Divine powers & how the people perceive them
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers = {};
  G.POWER_TABS = [{ id: 'dadivas', name: 'Dádivas' }, { id: 'ira', name: 'Ira' }, { id: 'terra', name: 'Terra' }, { id: 'mar', name: 'Mar' }, { id: 'palavra', name: 'Palavra' }, { id: 'destino', name: 'Destino' }];
  G.POWERS = [
    { id: 'rain', tab: 'dadivas', name: 'Chuva', cost: 10, r: 4.5, good: true, desc: 'Uma nuvem carregada sobre a área. Rega plantações, apaga incêndios e alivia secas.' },
    { id: 'growth', tab: 'dadivas', name: 'Crescimento', cost: 14, r: 3.5, good: true, desc: 'A vegetação brota e cresce em segundos: árvores, arbustos e plantações.' },
    { id: 'heal', tab: 'dadivas', name: 'Cura', cost: 12, r: 3, good: true, desc: 'Cura ferimentos e doenças de todos na área. Quem é curado nunca esquece.' },
    { id: 'fertility', tab: 'dadivas', name: 'Fertilidade', cost: 30, r: 6, good: true, desc: 'Por dois dias a terra floresce: colheitas rápidas, frutos abundantes, mais nascimentos.' },
    { id: 'golden', tab: 'dadivas', name: 'Era de Ouro', cost: 110, r: 0, good: true, target: 'fac', desc: 'Toque as terras de um povo: por três dias tudo prospera — colheitas, obras, comércio, pesquisa e lealdade. Os cronistas nunca esquecem uma era de ouro.' },
    { id: 'hand', tab: 'dadivas', name: 'Mão Divina', cost: 0, r: 0.8, good: null, desc: 'Agarre um habitante ou animal e solte — ou arremesse — onde quiser. Grátis, mas assusta.' },
    { id: 'lightning', tab: 'ira', name: 'Raio', cost: 18, r: 1.2, good: false, desc: 'Um raio atinge o ponto escolhido. Mata, fere e pode iniciar incêndios. Tiranos também sangram.' },
    { id: 'meteor', tab: 'ira', name: 'Meteoro', cost: 70, r: 3.4, good: false, desc: 'Após alguns segundos, uma rocha em chamas cai do céu. Devastação total — e pedra de presente.' },
    { id: 'wolves', tab: 'ira', name: 'Matilha', cost: 22, r: 1.5, good: false, desc: 'Invoca uma matilha de lobos famintos no local.' },
    { id: 'quake', tab: 'ira', name: 'Terremoto', cost: 55, r: 5.5, good: false, desc: 'A terra treme: construções racham e desabam, árvores tombam, pedras brotam do chão.' },
    { id: 'plague', tab: 'ira', name: 'Praga', cost: 32, r: 4, good: false, desc: 'Uma doença cruel nasce no ponto escolhido e se espalha muito mais rápido que qualquer febre.' },
    { id: 'curse', tab: 'ira', name: 'Maldição', cost: 45, r: 0, good: false, target: 'fac', desc: 'Toque as terras de um povo: por dois dias as colheitas murcham, os filhos não vêm, a pesca some e a lealdade apodrece.' },
    { id: 'raise', tab: 'terra', name: 'Erguer Terra', cost: 40, r: 2.6, good: null, desc: 'A terra sobe do fundo do mar: crie ilhas, pontes de terra entre povos isolados — ou colinas onde já há chão.' },
    { id: 'sink', tab: 'terra', name: 'Afundar Terra', cost: 60, r: 2.6, good: false, desc: 'O chão afunda e o mar invade. Separe continentes, abra canais — ou engula uma cidade inteira.' },
    { id: 'forest', tab: 'terra', name: 'Floresta Sagrada', cost: 24, r: 4, good: true, desc: 'Uma floresta densa brota do nada, cheia de frutos e caça. Madeira para gerações.' },
    { id: 'vein', tab: 'terra', name: 'Veio de Pedra', cost: 28, r: 2.2, good: true, desc: 'A terra se abre e revela pedra boa para construir. O chão fica rochoso.' },
    { id: 'volcano', tab: 'terra', name: 'Vulcão', cost: 120, r: 3, good: false, desc: 'Uma montanha nasce e explode em fogo: bombas de lava, rios incandescentes e cinzas. Depois, a terra mais fértil do mundo.' },
    { id: 'shoal', tab: 'mar', name: 'Cardume', cost: 8, r: 2, good: true, water: true, desc: 'Um cardume enorme surge no mar. Pescadores e barcos correm para lá.' },
    { id: 'wind', tab: 'mar', name: 'Ventos Favoráveis', cost: 20, r: 9, good: true, desc: 'Os navios na área ganham ventos a favor por dois dias: viagens, comércio e ataques muito mais rápidos.' },
    { id: 'seastorm', tab: 'mar', name: 'Tempestade', cost: 45, r: 6, good: false, water: true, desc: 'Uma tempestade furiosa sobre o mar: ondas, raios e navios quebrados.' },
    { id: 'tsunami', tab: 'mar', name: 'Maremoto', cost: 90, r: 7, good: false, water: true, desc: 'Toque o mar: uma onda gigante corre até a costa mais próxima e varre tudo o que encontra.' },
    { id: 'kraken', tab: 'mar', name: 'Kraken', cost: 70, r: 1.5, good: false, water: true, desc: 'Desperta o monstro das profundezas. Ele caça navios por um tempo — e vira lenda.' },
    { id: 'prophecy', tab: 'palavra', name: 'Profecia', cost: 35, r: 0, good: null, target: 'set', choose: true, desc: 'Fale a um povo sobre o futuro de uma de suas cidades. Se a profecia se cumprir — por obra do mundo ou sua —, a fé deles explode.' },
    { id: 'commandment', tab: 'palavra', name: 'Mandamento', cost: 50, r: 0, good: null, target: 'fac', choose: true, desc: 'Dê uma lei divina a um povo. Ela molda o modo como vivem, trabalham e guerreiam — até que você dite outra.' },
    { id: 'inspire', tab: 'palavra', name: 'Inspiração', cost: 60, r: 0, good: true, target: 'fac', choose: true, desc: 'Envie um sonho a um povo e revele o segredo que você escolher: a roda, o bronze, a escrita, a navegação…' },
    { id: 'sign', tab: 'palavra', name: 'Sinal nos Céus', cost: 30, r: 0, good: null, choose: true, desc: 'Um cometa, um eclipse ou uma aurora. Todos os povos veem — e cada um interpreta à sua maneira.' },
    { id: 'vision', tab: 'palavra', name: 'Visão', cost: 25, r: 1.2, good: true, desc: 'Toque um adulto: ele tem uma visão e se torna profeta. Onde prega, a fé cresce — e às vezes revela povos distantes.' },
    { id: 'anoint', tab: 'destino', name: 'Ungir', cost: 45, r: 1.2, good: null, desc: 'Toque um habitante: ele passa a governar seu povo. Um governante ungido ganha legitimidade total. Um cativo ungido lidera a fuga dos outros.' },
    { id: 'hero', tab: 'destino', name: 'Herói', cost: 55, r: 1.2, good: null, desc: 'Toque um adulto: ele se torna o campeão escolhido pelos deuses. Luta como dez, nunca foge — e seu nome vira lenda.' },
    { id: 'liberate', tab: 'destino', name: 'Libertação', cost: 30, r: 5, good: true, desc: 'As correntes se partem: cativos na área ficam livres e condenados escapam da execução.' },
    { id: 'fury', tab: 'destino', name: 'Fúria', cost: 35, r: 5, good: false, desc: 'Enche os corações de ira: quem estiver na área luta com força redobrada — e seu povo parte para a guerra.' },
    { id: 'discord', tab: 'destino', name: 'Discórdia', cost: 40, r: 6, good: false, desc: 'Semeia desconfiança numa vila: a lealdade despenca e vizinhos passam a se odiar. Rachas e golpes ficam prováveis.' },
    { id: 'divwall', tab: 'destino', name: 'Muralha Divina', cost: 65, r: 0, good: true, target: 'set', desc: 'Toque uma cidade: muralhas de pedra erguem-se do chão ao redor dela numa só noite.' },
    { id: 'peace', tab: 'destino', name: 'Paz Divina', cost: 80, r: 0, good: true, desc: 'Todas as guerras param. Exércitos voltam para casa e ninguém declara guerra por dois dias e meio.' },
  ];
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });
  P.byId = id => G.POWERS.find(p => p.id === id);

  // ---------------- perception ----------------
  P.witness = function (x, y, radius, dev, fear, why) {
    const S = G.S; let n = 0;
    for (const v of S.villagers.values()) {
      if (v.age < 4) continue;
      const d = G.dist(v.x, v.y, x, y); if (d > radius) continue;
      const f = 1 - (d / radius) * 0.5;
      const mul = v.traits.includes('Devoto') ? 1.5 : v.traits.includes('Cético') ? 0.5 : 1;
      if (dev) v.devotion = G.clamp(v.devotion + dev * f * (dev > 0 ? mul : 1), 0, 100);
      if (fear) v.fear = G.clamp(v.fear + fear * f, 0, 100);
      if (!v.inside && !v.sleeping) {
        if (dev > 0 && !fear) G.Vg.emote(v, 'awe', 2.6);
        else if (fear > 0) G.Vg.emote(v, 'fear', 2.6);
      }
      n++;
    }
    if (n > 0 && !S.awareness) {
      S.awareness = 1;
      G.Village.log('Pela primeira vez, os habitantes sentiram a presença de algo maior.', 'eye');
      G.Village.milestone('aware', 'Eles perceberam você', 'Agora sabem que não estão sozinhos.', 'eye');
    }
    return n;
  };

  // ---------------- casting ----------------
  P.why = '';
  function targetAt(x, y, r) { let best = null, bd = r * r; for (const v of G.S.villagers.values()) { if (v.inside || v.held || v.age < 14) continue; const d = G.dist2(v.x, v.y, x, y); if (d < bd) { bd = d; best = v; } } return best; }
  P.targetAt = targetAt;
  P.canCast = (id, x, y) => {
    const S = G.S; const p = P.byId(id); P.why = ''; if (!p) return false;
    if (S.faith < p.cost) return false;
    if (!W.inb(x, y)) return false;
    if (id === 'wolves') { const i = W.idx(x, y); return S.type[i] >= T.SAND && S.type[i] !== T.RIVER && !W.blocked(i); }
    if (id === 'anoint') { if (!targetAt(x, y, 1.3)) { P.why = 'Clique bem em cima de um adulto para ungi-lo.'; return false; } }
    if (id === 'liberate') { let n = 0; for (const v of S.villagers.values()) if ((v.captive || (v.task && v.task.type === 'condemned')) && G.dist(v.x, v.y, x, y) < p.r) n++; if (!n) { P.why = 'Não há cativos nem condenados aqui.'; return false; } }
    if (id === 'discord') { let ok = false; for (const s of S.settlements.values()) if (G.dist(x, y, s.cx, s.cy) < 14) ok = true; if (!ok) { P.why = 'A discórdia precisa de uma vila por perto.'; return false; } }
    if (id === 'peace') { let war = false; for (const f of G.Fac.all()) if (G.Fac.enemiesOf(f.id).length) war = true; if (!war) { P.why = 'Não há nenhuma guerra para encerrar.'; return false; } }
    if (id === 'fury') { let n = 0; for (const v of S.villagers.values()) if (!v.captive && v.age >= 16 && G.dist(v.x, v.y, x, y) < p.r) n++; if (!n) { P.why = 'Não há ninguém aqui para enfurecer.'; return false; } }
    // the newer miracles (terra, mar, palavra...) check their own targets
    if (P.check && !P.check(p, x, y)) return false;
    return true;
  };
  function pay(p) { const S = G.S; S.faith -= p.cost; S.stats.faithSpent += p.cost; S.stats.powers[p.id] = (S.stats.powers[p.id] || 0) + 1; }
  P.cast = function (id, x, y) {
    const p = P.byId(id);
    if (!P.canCast(id, x, y)) { G.Audio && G.Audio.play('deny'); return false; }
    // some words need choosing: the god picks the law, the secret, the sign...
    if (p.choose && G.UI && G.UI.choosePower) {
      const opts = P.options(id, x, y);
      if (!opts || !opts.length) { P.why = P.why || 'Não há nada a escolher aqui.'; G.Audio && G.Audio.play('deny'); return false; }
      G.UI.choosePower(p, x, y, opts);
      return true;
    }
    pay(p);
    P[id](x, y);
    G.Events && G.Events.onPower(id, x, y);
    return true;
  };
  P.castChoice = function (id, x, y, key) {
    const p = P.byId(id);
    if (!P.canCast(id, x, y)) { G.Audio && G.Audio.play('deny'); return false; }
    pay(p);
    P[id](x, y, key);
    G.Events && G.Events.onPower(id, x, y);
    return true;
  };

  P.rain = function (x, y) {
    const S = G.S;
    G.Nature.addCloud(x, y, 4.5, 20, 'divine');
    G.Audio && G.Audio.play('rainStart');
    let bonus = 0;
    if (S.weather.drought > 0) {
      S.weather.drought = Math.max(0, S.weather.drought - G.DAY_LEN * 0.9); bonus = 10;
      if (S.weather.drought <= 0) G.Village.log('A chuva divina pôs fim à seca. Eles choram de alegria.', 'rain', x, y);
    }
    let fires = 0; for (const i of G.Nature.fireSet) { const fx = (i % N) + 0.5, fy = ((i / N) | 0) + 0.5; if (G.dist2(fx, fy, x, y) < 40) fires++; }
    if (fires > 2) bonus += 8;
    P.witness(x, y, 13, 5 + bonus, 0);
  };

  P.growth = function (x, y) {
    const S = G.S; const r = 3.5;
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue;
      const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r) continue;
      const i = ty * N + tx; const t = S.type[i];
      if (t < T.SAND || t === T.RIVER) continue;
      S.bloom[i] = Math.max(S.bloom[i], G.DAY_LEN * 1.2); G.Nature.markDirty(i);
      if (S.burnt[i] > 0) { S.burnt[i] = 0; }
      const tid = S.treeAt[i];
      if (tid) { const tr = S.trees.get(tid); if (tr) { if (tr.stage === 'grow') tr.size = tr.maxSize; else if (tr.stage === 'stump' || tr.stage === 'burnt') { tr.stage = 'grow'; tr.size = 0.6; tr.chop = 0; } } }
      else if (!S.occ[i] && !S.objAt[i] && S.wear[i] < 20 && (t === T.GRASS || t === T.MEADOW || t === T.ROCKY) && G.R() < 0.32) {
        const tr = G.Nature.addTree(tx + 0.5 + G.rr(-0.2, 0.2), ty + 0.5 + G.rr(-0.2, 0.2), G.R() < 0.65 ? 'oak' : 'pine', 0.15); if (tr) tr.grow = 1;
        if (tr) tr.size = 0.55 + G.R() * 0.3;
      } else if (!S.occ[i] && !S.objAt[i] && !S.treeAt[i] && t === T.SAND && G.dOcean && G.dOcean[i] <= 2 && G.R() < 0.2) {
        const tr = G.Nature.addTree(tx + 0.5, ty + 0.5, 'palm', 0.8);
      } else if (!S.occ[i] && !S.objAt[i] && !S.treeAt[i] && t >= T.GRASS && G.R() < 0.06) G.Nature.addBush(tx + 0.5, ty + 0.5);
      const oid = S.objAt[i]; if (oid) { const b = S.bushes.get(oid); if (b) { b.berries = b.max; b.burnt = 0; } }
      const bid = S.occ[i]; if (bid) { const b = S.buildings.get(bid); if (b && b.crops) { const k = G.Village.farmTileIndex(b, tx, ty); if (k >= 0 && b.crops[k].s > 0) { b.crops[k].g = Math.min(1, b.crops[k].g + 0.6); b.crops[k].s = b.crops[k].g < 0.3 ? 1 : b.crops[k].g < 1 ? 2 : 3; } } }
    }
    S.zones.push({ kind: 'growth', x, y, r, t: G.DAY_LEN * 0.5, power: 1.5 });
    G.FX && G.FX.growth(x, y, r);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 12, 7, 0);
  };

  P.heal = function (x, y) {
    const S = G.S; const r = 3; let healed = 0;
    for (const v of S.villagers.values()) {
      if (G.dist(v.x, v.y, x, y) > r) continue;
      const needed = v.hp < 95 || v.sick > 0 || v.hunger > 70;
      v.hp = 100; if (v.sick > 0) v.immune = G.DAY_LEN * 3; v.sick = 0; v.hunger = Math.min(v.hunger, 30); v.energy = Math.max(v.energy, 70);
      if (needed) { v.devotion = Math.min(100, v.devotion + 14); healed++; }
      G.FX && G.FX.healOne(v.x, v.y);
    }
    for (const a of S.animals.values()) if (!a.dead && G.dist(a.x, a.y, x, y) < r) a.hp = a.maxHp;
    G.FX && G.FX.heal(x, y, r);
    G.Audio && G.Audio.play('heal');
    P.witness(x, y, 10, 5 + (healed ? 6 : 0), 0);
    if (healed >= 3) G.Village.log(`${healed} pessoas foram curadas por um milagre.`, 'heal', x, y);
  };

  P.fertility = function (x, y) {
    const S = G.S; const r = 6;
    S.zones.push({ kind: 'fertility', x, y, r, t: G.DAY_LEN * 2, power: 1.6 });
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue; if (G.dist(tx + 0.5, ty + 0.5, x, y) > r) continue;
      const i = ty * N + tx; if (S.type[i] >= T.GRASS) { S.bloom[i] = Math.max(S.bloom[i], G.DAY_LEN * 2); G.Nature.markDirty(i); }
    }
    G.FX && G.FX.fertility(x, y, r);
    G.Audio && G.Audio.play('fertility');
    P.witness(x, y, 14, 9, 0);
    G.Village.log('Um milagre de fertilidade abençoou a terra.', 'flower', x, y);
  };

  // ---------------- destructive ----------------
  P.strike = function (x, y, divine) {
    const S = G.S;
    G.FX && G.FX.lightning(x, y);
    G.Audio && G.Audio.at(x, y, 'lightning', true, divine ? 1 : 0.8);
    G.Render && G.Render.shake(divine ? 0.45 : 0.25);
    const i = W.idx(x, y);
    let killed = 0;
    for (const v of [...S.villagers.values()]) {
      if (v.inside) continue;
      const d = G.dist(v.x, v.y, x, y);
      if (d < 0.9) { G.Vg.damage(v, 250, 'lightning', divine); killed++; }
      else if (d < 2.2) { G.Vg.damage(v, 28 * (1 - d / 2.2) + 8, 'lightning', divine); if (S.villagers.has(v.id)) { v.fear = Math.min(100, v.fear + 15); } }
    }
    for (const a of [...S.animals.values()]) { if (!a.dead && G.dist(a.x, a.y, x, y) < 1) G.Animals.damage(a, 100, null); }
    if (W.inb(x, y) && W.isLand(i)) {
      if (S.type[i] !== T.RIVER) { S.burnt[i] = Math.max(S.burnt[i], G.DAY_LEN * 1.2); G.Nature.markDirty(i); }
      const tid = S.treeAt[i];
      if (tid) G.Nature.ignite(i, 0.95);
      else if (G.R() < (S.weather.drought > 0 ? 0.9 : 0.55)) G.Nature.ignite(i, 0.6);
      const bid = S.occ[i]; if (bid) { const b = S.buildings.get(bid); if (b) { G.Village.damageBuilding(b, 40, 'lightning'); if (b.hp > 0 && G.R() < 0.7) G.Nature.ignite(i, 0.8); } }
      if (divine) S.fireGod = true;
    } else G.FX && G.FX.splash(x, y, 1.4);
    (S.panic = S.panic || []).push({ x, y, r: 4.5, t: 2.5, why: 'panic' });
    return killed;
  };
  P.lightning = function (x, y) {
    const killed = P.strike(x, y, true);
    P.witness(x, y, 14, killed ? -6 : -1, killed ? 22 : 12);
    if (killed) G.Village.log(`Um raio divino caiu do céu claro${killed > 1 ? ' e matou ' + killed + ' pessoas' : ''}.`, 'bolt', x, y);
  };
  P.naturalLightning = function (x, y) {
    // nature is cruel, but rarely aims at people
    let near = true;
    for (let k = 0; k < 8 && near; k++) {
      near = false;
      for (const v of G.S.villagers.values()) if (!v.inside && G.dist2(v.x, v.y, x, y) < 7) { near = true; break; }
      if (near) { x += G.rr(-5, 5); y += G.rr(-5, 5); }
    }
    if (near) { G.Audio && G.Audio.play('thunderFar'); return; }
    x = G.clamp(x, 1, N - 1); y = G.clamp(y, 1, N - 1);
    P.strike(x, y, false);
    const S = G.S; const i = W.idx(x, y);
    if (S.fire[i] > 0 && S._stormFireLogged !== S.day) { S._stormFireLogged = S.day; G.Village.log('Um raio da tempestade iniciou um incêndio.', 'fire', x, y); }
  };

  P.meteor = function (x, y) {
    const S = G.S;
    S.meteors.push({ x, y, r: 3.4, t: 0, delay: 4.2 });
    G.Audio && G.Audio.meteorFall(4.2);
  };
  P.meteorImpact = function (m) {
    const S = G.S; const { x, y, r } = m;
    const ci = W.idx(x, y);
    const water = W.inb(x, y) && S.type[ci] <= T.RIVER;
    G.Render && G.Render.shake(1.4);
    G.FX && G.FX.meteorImpact(x, y, r, water);
    G.Audio && G.Audio.play('boom');
    let killed = 0, destroyed = 0;
    // people & animals
    for (const v of [...S.villagers.values()]) {
      const d = G.dist(v.x, v.y, x, y);
      if (d < r * 0.85) { if (v.inside) G.Vg.endTask(v); G.Vg.damage(v, 500, 'meteor', true); killed++; }
      else if (d < r + 2.8 && !v.inside) {
        G.Vg.damage(v, 45 * (1 - (d - r * 0.85) / 3.8), 'meteor', true);
        if (S.villagers.has(v.id) && !v.held) {
          G.Vg.endTask(v);
          const dx = (v.x - x) / (d || 1), dy = (v.y - y) / (d || 1);
          v.air = true; v.z = 1; v.vz = 190 + G.R() * 60; v.vx = dx * 2.6; v.vy = dy * 2.6;
          v.fear = Math.min(100, v.fear + 30);
        }
      }
    }
    for (const a of [...S.animals.values()]) {
      const d = G.dist(a.x, a.y, x, y);
      if (d < r) G.Animals.kill(a, null);
      else if (d < r + 2.5 && !a.dead) { const dx = (a.x - x) / d, dy = (a.y - y) / d; a.air = true; a.z = 1; a.vz = 170; a.vx = dx * 2.4; a.vy = dy * 2.4; }
    }
    // terrain, vegetation, buildings
    const R = Math.ceil(r + 3);
    const V = N + 1;
    if (!water) {
      for (let vy = Math.floor(y - R); vy <= y + R; vy++) for (let vx = Math.floor(x - R); vx <= x + R; vx++) {
        if (vx < 1 || vy < 1 || vx >= N || vy >= N) continue;
        const d = G.dist(vx, vy, x, y);
        const k = vy * V + vx; let h = S.H[k];
        if (h <= G.SEA + 0.01) continue; // shoreline vertices stay put
        if (d < r) h -= 1.5 * Math.pow(1 - d / r, 1.3);
        else if (d < r + 1.3) h += 0.45 * Math.sin((d - r) / 1.3 * Math.PI);
        S.H[k] = Math.max(G.SEA + 0.08, h);
      }
    }
    for (let ty = Math.floor(y - R); ty <= y + R; ty++) for (let tx = Math.floor(x - R); tx <= x + R; tx++) {
      if (!W.inb(tx, ty)) continue;
      const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r + 2.5) continue;
      const i = ty * N + tx;
      G.Nature.markDirty(i);
      if (W.isLand(i) && S.type[i] !== T.RIVER) {
        if (d < r) S.scar[i] = G.DAY_LEN * 7;
        else S.burnt[i] = Math.max(S.burnt[i], G.DAY_LEN * 2.5);
      }
      const tid = S.treeAt[i];
      if (tid) { const t = S.trees.get(tid); if (t) { if (d < r) G.Nature.removeTree(t); else if (t.stage === 'grow' && t.size > 0.3) { if (G.R() < 0.6) { G.Nature.fellTree(t, (tx + ty) - (x + y) > 0 ? 1 : -1); } else G.Nature.ignite(i, 0.9); } } }
      const oid = S.objAt[i];
      if (oid && d < r) { const b = S.bushes.get(oid); if (b) G.Nature.removeBush(b); const rk = S.rocks.get(oid); if (rk) G.Nature.removeRock(rk); }
      const bid = S.occ[i];
      if (bid) { const b = S.buildings.get(bid); if (b && b.hp > 0) { if (d < r) { G.Village.damageBuilding(b, 9999, 'meteor'); destroyed++; } else { G.Village.damageBuilding(b, 70, 'meteor'); if (b.hp > 0 && G.R() < 0.6) G.Nature.ignite(i, 0.8); } } }
      if (d >= r * 0.7 && d < r + 2 && G.R() < 0.5) G.Nature.ignite(i, 0.7);
    }
    if (!water) {
      // meteorite fragments: a gift of stone
      for (let k = 0; k < 3; k++) {
        const a = G.R() * 6.28, dd = G.R() * r * 0.6;
        const rx = Math.floor(x + Math.cos(a) * dd) + 0.5, ry = Math.floor(y + Math.sin(a) * dd) + 0.5;
        const rk = G.Nature.addRock(rx, ry, 40); if (rk) rk.meteor = true;
      }
    }
    S.fireGod = true;
    (S.panic = S.panic || []).push({ x, y, r: 13, t: 5, why: 'meteor' });
    P.witness(x, y, 18, killed ? -12 : -4, 38);
    G.Render && G.Render.invalidateTerrain(x, y, R + 1);
    const where = G.Village.nearSettlementName(x, y);
    const parts = [];
    if (killed) parts.push('matando ' + killed + (killed > 1 ? ' pessoas' : ' pessoa'));
    if (destroyed) parts.push('destruindo ' + destroyed + (destroyed > 1 ? ' construções' : ' construção'));
    G.Village.log(`Um meteoro caiu${where ? ' perto de ' + where : ''}${parts.length ? ', ' + parts.join(' e ') : ''}.`, 'meteor', x, y);
  };

  P.wolves = function (x, y) {
    G.Animals.spawnPack(x, y, 3, true);
    G.FX && G.FX.summon(x, y);
    G.Audio && G.Audio.at(x, y, 'howl', true, 1.2);
    P.witness(x, y, 12, -3, 18);
    G.Village.log('Uma matilha surgiu do nada, uivando para o céu.', 'wolf', x, y);
  };

  // ---------------- earth & sickness ----------------
  P.quake = function (x, y) {
    const S = G.S; const r = 5.5;
    G.Render && G.Render.shake(1.6);
    G.Audio && G.Audio.play('quake');
    let hurt = 0, dead = 0, fell = 0;
    for (const v of [...S.villagers.values()]) {
      const d = G.dist(v.x, v.y, x, y); if (d > r + 2) continue;
      v.fear = Math.min(100, v.fear + 30 * (1 - d / (r + 2)) + 10);
      if (v.inside) { const b = S.buildings.get(v.inside); if (b && G.R() < 0.5) { G.Vg.endTask(v); G.Vg.damage(v, G.rr(10, 40), 'quake', true); } }
      else if (d < r && G.R() < 0.45) { G.Vg.damage(v, G.rr(4, 22), 'quake', true); hurt++; }
      if (!S.villagers.has(v.id)) { dead++; continue; }
      if (!v.held && !v.air && G.R() < 0.6) G.Vg.fleeFrom(v, x, y, 7, 'panic');
    }
    const hit = new Set();
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue;
      const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r) continue;
      const i = ty * N + tx;
      const bid = S.occ[i];
      if (bid && !hit.has(bid)) { hit.add(bid); const b = S.buildings.get(bid); if (b && b.hp > 0 && b.type !== 'cemetery') { G.Village.damageBuilding(b, (1 - d / r) * 130 + 35, 'quake'); if (!S.buildings.has(bid) || b.type === 'ruin') fell++; } }
      const tid = S.treeAt[i];
      if (tid) { const t = S.trees.get(tid); if (t && t.stage === 'grow' && t.size > 0.5 && G.R() < 0.3 * (1 - d / r) + 0.08) G.Nature.fellTree(t, G.R() < 0.5 ? 1 : -1); }
      if (W.isLand(i) && S.type[i] !== T.RIVER && G.R() < 0.18 * (1 - d / r)) { S.scar[i] = Math.max(S.scar[i], G.DAY_LEN * 3); G.Nature.markDirty(i); }
      if (G.R() < 0.07) G.FX && G.FX.dust(tx + 0.5, ty + 0.5, 3);
    }
    for (let k = 0; k < 3; k++) { const a = G.R() * 6.28, dd = G.rr(1, r); const rx = Math.floor(x + Math.cos(a) * dd) + 0.5, ry = Math.floor(y + Math.sin(a) * dd) + 0.5; const i = W.idx(rx, ry); if (W.inb(rx, ry) && W.isLand(i) && !S.occ[i] && !S.objAt[i] && !S.treeAt[i] && S.type[i] !== T.RIVER) G.Nature.addRock(rx, ry, 18); }
    G.FX && G.FX.ring(x, y, 0.5, r + 1, 1.2, 'rgba(160,120,80,0.7)', 3);
    G.FX && G.FX.ring(x, y, 0.3, r * 0.6, 0.9, 'rgba(120,90,60,0.6)', 2);
    (S.panic = S.panic || []).push({ x, y, r: r + 3, t: 4, why: 'panic' });
    P.witness(x, y, 16, -4, 26);
    const where = G.Village.nearSettlementName(x, y);
    const parts = []; if (fell) parts.push(`${fell} ${fell > 1 ? 'construções ruíram' : 'construção ruiu'}`); if (dead) parts.push(`${dead} ${dead > 1 ? 'morreram' : 'morreu'}`);
    G.Village.log(`A terra tremeu${where ? ' em ' + where : ''}${parts.length ? ': ' + parts.join(', ') : ''}.`, 'stone', x, y);
  };
  P.plague = function (x, y) {
    const S = G.S; const r = 4; let n = 0;
    for (const v of S.villagers.values()) {
      if (G.dist(v.x, v.y, x, y) > r) continue;
      v.sick = G.DAY_LEN * G.rr(0.5, 0.95); v.immune = 0; n++;
      v.fear = Math.min(100, v.fear + 14);
    }
    S.plague = { x, y, t: G.DAY_LEN * 1.2 };
    G.FX && G.FX.plague(x, y, r);
    G.Audio && G.Audio.play('plague');
    P.witness(x, y, 12, -3, 16);
    G.Village.log(`Uma praga se abateu${G.Village.nearSettlementName(x, y) ? ' sobre ' + G.Village.nearSettlementName(x, y) : ''}${n ? ': ' + n + ' adoeceram de uma vez' : ''}.`, 'sick', x, y);
  };

  // ---------------- destiny ----------------
  P.anoint = function (x, y) {
    const v = targetAt(x, y, 1.3); if (!v) return;
    G.FX && G.FX.anoint(v.x, v.y);
    G.Audio && G.Audio.play('milestone');
    G.Politics.anoint(v);
    P.witness(v.x, v.y, 12, 9, 5);
  };
  P.liberate = function (x, y) {
    const n = G.War.liberateAround(x, y, 5, 'divina');
    G.FX && G.FX.ring(x, y, 0.3, 5.5, 1.1, 'rgba(255,230,160,0.9)', 2.5, true);
    G.FX && G.FX.blessing(x, y);
    G.Audio && G.Audio.play('heal');
    P.witness(x, y, 12, 12, 2);
    if (n) G.Village.log(`As correntes se partiram por vontade divina: ${n} ${n > 1 ? 'pessoas foram libertadas' : 'pessoa foi libertada'}.`, 'free', x, y);
  };
  P.fury = function (x, y) {
    const S = G.S; const r = 5; const facs = new Map();
    for (const v of S.villagers.values()) {
      if (v.captive || v.age < 16 || G.dist(v.x, v.y, x, y) > r) continue;
      v.fury = 45; v.courage = Math.max(v.courage, 0.9); v.fear = 0; G.Vg.emote(v, 'angry', 3);
      const f = G.Fac.idOfV(v); facs.set(f, (facs.get(f) || 0) + 1);
    }
    for (const v of S.villagers.values()) if (v.captive && G.dist(v.x, v.y, x, y) < r) { v.fury = 45; G.Vg.emote(v, 'angry', 3); }
    G.FX && G.FX.fury(x, y, r);
    G.Audio && G.Audio.play('horn');
    for (const [fid, n] of facs) {
      if (n < 2) continue;
      const f = G.Fac.get(fid); if (!f || !f.alive) continue;
      if (!G.Fac.enemiesOf(fid).length) {
        let target = null, lo = 1e9;
        for (const o of G.Fac.all()) { if (o.id === fid) continue; const rr = G.Fac.rel(fid, o.id); if (!rr || !rr.met) continue; if (rr.op < lo) { lo = rr.op; target = o; } }
        if (target && lo < 40) G.Politics.declareWar(f, target, 'divina');
      }
      G.War.launchNow(f, { fury: true });
    }
    P.witness(x, y, 12, -2, 12);
    G.Village.log('Uma fúria divina incendiou os corações.', 'war', x, y);
  };
  P.discord = function (x, y) {
    G.FX && G.FX.discord(x, y);
    G.Audio && G.Audio.play('plague');
    G.Politics.discord(x, y);
    P.witness(x, y, 12, -2, 10);
  };
  P.peace = function (x, y) {
    const S = G.S;
    G.Politics.divinePeace();
    for (const s of S.settlements.values()) G.FX && G.FX.doves(s.cx, s.cy);
    G.FX && (G.FX.flash = 0.6); G.FX && (G.FX.flashColor = '255,250,225');
    G.Audio && G.Audio.play('heal');
    for (const v of S.villagers.values()) { v.fear = Math.max(0, v.fear - 20); v.devotion = Math.min(100, v.devotion + 6); }
  };

  P.update = function (dt) {
    const S = G.S;
    if (S.plague) { S.plague.t -= dt; if (S.plague.t <= 0) S.plague = null; }
    for (let k = S.meteors.length - 1; k >= 0; k--) {
      const m = S.meteors[k]; m.t += dt;
      if (m.t >= m.delay) { S.meteors.splice(k, 1); P.meteorImpact(m); }
    }
    if (S.panic) for (let k = S.panic.length - 1; k >= 0; k--) { S.panic[k].t -= dt; if (S.panic[k].t <= 0) S.panic.splice(k, 1); }
    if (S.fireGod && G.Nature.fireSet.size === 0) S.fireGod = false;
    P.updateMiracles && P.updateMiracles(dt);
  };
})(window.G);
