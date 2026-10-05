'use strict';
// ============================================================
//  Time skip: let the years go by. The world keeps living for
//  real (every birth, war and building happens), only nothing is
//  drawn: a time-lapse map, the counters and the great news of the
//  chronicle pass in front of the god until the goal is reached —
//  or until the god says "stop here". The years can run free, or
//  under a blessing: no wars and fertile seasons, so the peoples
//  grow into cities (and meet as empires when the blessing ends).
// ============================================================
(function (G) {
  const Sk = G.Skip = { on: false };
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // a step five times coarser than at 16x: the skip trades smoothness nobody sees for speed
  // (people still walk from waypoint to waypoint, animals never step further than their target)
  const DT = 0.5;

  Sk.GOALS = {
    anos10: { label: '10 anos', sub: 'uma geração cresce', years: 10 },
    anos25: { label: '25 anos', sub: 'netos e bisnetos', years: 25 },
    anos30: { label: '30 anos', sub: 'aldeias e vilas', years: 30, hidden: true },
    anos50: { label: '50 anos', sub: 'meio século', years: 50 },
    cidade: { label: 'Até a primeira cidade', sub: 'praça, casas de pedra, comércio', tier: 3, max: 160 },
    metropole: { label: 'Até a primeira metrópole', sub: 'palácios, teatros, aquedutos', tier: 4, max: 240 },
    mega: { label: 'Até a primeira megalópole', sub: 'um mar de telhados', tier: 5, max: 320 },
    guerra: { label: 'Até a próxima guerra', sub: 'quando os povos pegarem em armas', war: true, max: 150 },
  };
  Sk.COURSES = {
    fartura: { label: 'Anos de paz e fartura', sub: 'Sua bênção: nenhuma guerra começa, colheitas, pedreiras e berços se enchem, o saber corre. Os povos crescem até virar impérios — e quando a bênção acaba, impérios se encontram.' },
    livre: { label: 'Deixar o mundo seguir', sub: 'Nada muda: guerras, pestes e fomes vêm quando vierem. A história como ela seria sem você.' },
  };

  const maxTier = () => { let t = -1, best = null; for (const s of G.S.settlements.values()) { const st = s.tier || 0; if (st > t) { t = st; best = s; } } return { t: Math.max(0, t), s: best }; };
  const warCount = () => { let n = 0; const F = G.Fac.all(); for (const a of F) for (const b of F) if (a.id < b.id) { const r = G.Fac.rel(a.id, b.id); if (r && r.st === 'guerra') n++; } return n; };
  const biggestCity = () => { const S = G.S; let best = null, bp = -1; for (const s of S.settlements.values()) { const p = G.Village.pop(s.id) + (s.tier || 0) * 40; if (p > bp) { bp = p; best = s; } } return best; };
  Sk.reached = key => { const g = Sk.GOALS[key]; return !!(g && g.tier && maxTier().t >= g.tier); };

  // ------------------------------ the choice ------------------------------
  Sk.open = function () {
    if (!G.S || !G.Main || G.Main.mode !== 'game') return;
    const o = Sk.pick || (Sk.pick = { goal: 'anos25', course: 'fartura' });
    const goals = Object.entries(Sk.GOALS).filter(([, g]) => !g.hidden).map(([k, g]) => { const done = Sk.reached(k); const sub = done ? 'já existe' : g.tier === 5 && G.N < 128 ? 'pede um mapa grande' : g.sub; return `<button class="sk-goal ${o.goal === k ? 'on' : ''} ${done ? 'done' : ''}" data-m="skip-goal" data-k="${k}" ${done ? 'disabled' : ''}><b>${g.label}</b><span>${sub}</span></button>`; }).join('');
    // (waiting for a war under a blessing that forbids wars would never end)
    const warGoal = !!(Sk.GOALS[o.goal] && Sk.GOALS[o.goal].war);
    const courses = Object.entries(Sk.COURSES).map(([k, c]) => { const off = warGoal && k === 'fartura'; const on = warGoal ? k === 'livre' : o.course === k; return `<button class="sk-course ${on ? 'on' : ''} ${off ? 'done' : ''}" data-m="skip-course" data-k="${k}" ${off ? 'disabled' : ''}><b>${c.label}</b><span>${off ? 'Não combina com esperar uma guerra: sob a bênção, ninguém pega em armas.' : c.sub}</span></button>`; }).join('');
    G.UI.openModal(`<h2>Avançar no tempo</h2>
      <p class="sk-lead">O mundo vive sozinho e depressa, sem desenhar nada: você vê os anos passarem num mapa e as grandes notícias da crônica, e pode parar quando quiser.</p>
      <div class="st-label">Até quando</div><div class="sk-goals">${goals}</div>
      <div class="st-label">Como passam os anos</div><div class="sk-courses">${courses}</div>
      <div class="mbtns"><button data-m="close">Cancelar</button><button class="primary" data-m="skip-go">Avançar</button></div>`, 'wide skip-modal');
  };

  // ------------------------------ running ------------------------------
  const SLICE = 35; // ms of world per slice; the window and the god's clicks get the moments between
  let el = null, news = [], lastLog = 0, uiT = 0, mapT = 0, clock = 0, feed = [], startReal = 0, pump = null, gen = 0;
  Sk.start = function (goalKey, course, opts) {
    const S = G.S; if (!S || Sk.on) return;
    const goal = Sk.GOALS[goalKey] || Sk.GOALS.anos25;
    opts = opts || {};
    G.Cinema && G.Cinema.on && G.Cinema.stop(); G.Photo && G.Photo.on && G.Photo.stop();
    G.UI.closeModal(); G.UI.select(null); G.UI.setPower(null);
    Sk.on = true; Sk.goalKey = goalKey; Sk.goal = goal; Sk.course = course === 'livre' || goal.war ? 'livre' : 'fartura'; Sk.opening = !!opts.opening;
    const mt = maxTier();
    Sk.from = { day: S.day, pop: S.villagers.size, facs: G.Fac.all().length, sets: S.settlements.size, births: S.stats.births || 0, deaths: S.stats.deaths || 0, wars: warCount(), tier: mt.t, logN: S.logN || 0, warDecl: 0 };
    Sk.endDay = goal.years ? S.day + goal.years : S.day + (goal.max || 150);
    Sk.best = { t: mt.t, pop: S.villagers.size, day: S.day };
    Sk.prevSpeed = G.speed || 1;
    news = []; feed = []; lastLog = S.logN || 0; uiT = 0; mapT = 0; clock = 0; startReal = performance.now();
    G.FX.off = true; if (G.Audio) G.Audio.mute = true; G.W.pathGreed = 1.3;
    if (Sk.course === 'fartura') {
      S.blessed = true;
      if (warCount() > 0 || G.War.bands.size) G.Politics.divinePeace();
      G.Village.log(Sk.opening ? 'Os primeiros anos correram sob um olhar benevolente: nenhuma guerra, colheitas fartas, berços cheios.' : 'O deus abençoou os anos que viriam: nenhuma guerra, colheitas fartas, berços cheios.', 'peace');
      lastLog = S.logN || 0;
    }
    build();
    el.root.classList.add('on'); document.body.classList.add('skipping');
    paint(true);
    if (!pump) { pump = new MessageChannel(); pump.port1.onmessage = e => slice(e.data); }
    pump.port2.postMessage(++gen);
  };
  // the blessing, kept alive while the years pass
  function bless() {
    const S = G.S;
    S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN * 0.5);
    S.weather.fertility = Math.max(S.weather.fertility || 0, G.DAY_LEN * 0.5);
  }
  // the world lives in slices posted back to back, not inside the screen's frames: most of the
  // machine goes to the years, and they keep passing with the tab in the background
  function slice(g) {
    if (!Sk.on || g !== gen) return;
    const S = G.S; const t0 = performance.now();
    let blessT = 0, done = null;
    while (performance.now() - t0 < SLICE) {
      const d0 = S.day;
      G.debug.step(DT);
      if (Sk.course === 'fartura' && (blessT -= DT) <= 0) { blessT = 2; bless(); }
      if (S.day !== d0) { done = check(); if (done) break; }
    }
    G.FX.list.length = 0; G.FX.rings.length = 0; G.FX.glows.length = 0; G.FX.bolts.length = 0; G.FX.floaters.length = 0;
    collect();
    if (done) Sk.finish(done); else pump.port2.postMessage(g);
  }
  // each frame of the screen only repaints the window that shows them
  Sk.frame = function (rdt) {
    if (!Sk.on) return;
    clock += rdt; uiT -= rdt; mapT -= rdt;
    if (uiT <= 0) { uiT = 0.2; paint(false); }
    if (mapT <= 0) { mapT = 0.5; drawMap(); }
  };
  function check() {
    const S = G.S; const g = Sk.goal;
    if (!S.villagers.size) return 'vazio';
    if (g.years && S.day >= Sk.endDay) return 'meta';
    if (g.tier && maxTier().t >= g.tier) return 'meta';
    if (g.war && Sk.from.warDecl > 0) return 'meta';
    if (S.day >= Sk.endDay) return 'limite';
    // waiting for a city that will not come: the world has stopped growing (no new rank, hardly more people)
    const t = maxTier().t, pop = S.villagers.size, b = Sk.best;
    if (t > b.t || pop > b.pop * 1.05) Sk.best = { t: Math.max(t, b.t), pop: Math.max(pop, b.pop), day: S.day };
    else if (g.tier && S.day - b.day >= 40) return 'parou';
    return null;
  }
  // the great news of the chronicle, as they happen
  const BIG = { war: 1, massacre: 1, crown: 1, city: 1, settle: 1, wonder: 1, split: 1, siege: 1, plague: 1, ship: 1, naval: 1, coup: 1, tyrant: 1, revolt: 1, peace: 1, ally: 1, tech: 0, legend: 1, prophecy: 1, sacrifice: 1 };
  function collect() {
    const S = G.S; const H = S.history;
    for (let k = H.length - 1; k >= 0 && H[k].n > lastLog; k--) {
      const e = H[k];
      if (e.ic === 'war' && /declarou guerra/.test(e.txt)) Sk.from.warDecl++;
      if (BIG[e.ic] || (e.ic === 'tech' && feed.length < 3)) feed.push(e);
    }
    lastLog = S.logN || 0;
    feed.sort((a, b) => a.n - b.n); if (feed.length > 60) feed.splice(0, feed.length - 60);
  }
  Sk.news = function (title, sub) { if (news.length < 30) news.push([title, sub]); };

  Sk.stop = function () { if (Sk.on) Sk.finish('parado'); };
  Sk.finish = function (why) {
    if (!Sk.on) return;
    const S = G.S;
    Sk.on = false; G.FX.off = false; if (G.Audio) G.Audio.mute = false; G.W.pathGreed = G.W.PATH_EXACT;
    // the blessing fades
    if (Sk.course === 'fartura') { S.divinePeace = 0; S.weather.fertility = 0; S.blessed = false; G.Village.log('Os anos de bênção terminaram. Os povos, agora grandes, voltam a se olhar como rivais.', 'eye'); }
    el.root.classList.remove('on'); document.body.classList.remove('skipping');
    // the world as it is now: fresh terrain, roads and borders, the camera on the greatest city
    G.Render.buildTerrain(); G.Fac.updateTerritory && G.Fac.updateTerritory(); G.Minimap && G.Minimap.refresh && G.Minimap.refresh();
    const c = biggestCity(); if (c) G.Render.centerOn(c.cx, c.cy, 1.25);
    G.UI.setSpeed(Sk.opening ? 1 : Sk.prevSpeed || 1);
    G.UI.update(1, true);
    G.Save.save(true);
    summary(why);
  };
  function summary(why) {
    const S = G.S; const f = Sk.from; const years = S.day - f.day;
    const mt = maxTier(); const big = biggestCity();
    const TI = G.City.TIERS;
    const lines = [];
    lines.push(`<li><b>${S.villagers.size}</b> almas (eram ${f.pop}) · nasceram ${(S.stats.births || 0) - f.births}, morreram ${(S.stats.deaths || 0) - f.deaths}</li>`);
    lines.push(`<li><b>${G.Fac.all().length}</b> ${G.Fac.all().length === 1 ? 'povo' : 'povos'} · <b>${S.settlements.size}</b> povoados (eram ${f.sets})</li>`);
    if (big) lines.push(`<li>A maior: <b>${esc(big.name)}</b>, ${TI[big.tier || 0].toLowerCase()} de ${G.Village.pop(big.id)} habitantes${mt.t > f.tier ? ` — ${mt.t >= 3 ? 'o mundo ganhou cidades' : 'as aldeias cresceram'}` : ''}</li>`);
    lines.push(`<li>${Sk.from.warDecl ? `<b>${Sk.from.warDecl}</b> ${Sk.from.warDecl === 1 ? 'guerra declarada' : 'guerras declaradas'}` : 'nenhuma guerra declarada'}${warCount() ? ` · ${warCount()} em curso agora` : ''}</li>`);
    const ev = feed.slice(-9).reverse().map(e => `<li class="sk-ev"><em>ano ${e.d}</em> ${esc(e.txt)}</li>`).join('');
    const WHY = { meta: '', parado: 'Você parou o tempo aqui.', limite: 'O limite de anos chegou antes da meta.', vazio: 'Não restou ninguém no mundo.', parou: 'O mundo parou de crescer antes da meta: falta chão para mais gente. Num mapa maior, as cidades vão mais longe.' };
    const real = Math.max(1, Math.round((performance.now() - startReal) / 1000));
    G.UI.openModal(`<h2>${years === 1 ? 'Passou-se um ano' : `Passaram-se ${years} anos`}</h2>
      <p class="sk-lead">${WHY[why] ? WHY[why] + ' ' : ''}Ano ${S.day} de ${esc((S.lore && S.lore.world) || 'o mundo')} · ${real} s para você.</p>
      <ul class="sk-sum">${lines.join('')}</ul>
      ${ev ? `<div class="st-label">O que a crônica guardou</div><ul class="sk-sum">${ev}</ul>` : ''}
      <div class="mbtns"><button data-m="skip-more">Avançar mais</button><button class="primary" data-m="close">Ver o mundo</button></div>`, 'wide skip-modal');
  };

  // ------------------------------ the window over the years ------------------------------
  function build() {
    if (el) return;
    const d = document.createElement('div'); d.id = 'skip';
    d.innerHTML = `<div class="sk-box panel">
        <div class="sk-head"><div><div class="sk-kick">O tempo voa</div><div class="sk-year">Ano <b>1</b></div></div><div class="sk-goaltxt"></div></div>
        <div class="sk-bar"><span></span></div>
        <canvas class="sk-map"></canvas>
        <div class="sk-stats"></div>
        <ul class="sk-feed"></ul>
        <div class="sk-foot"><span class="sk-speed"></span><button class="primary sk-stop">Parar aqui <kbd>Esc</kbd></button></div>
      </div>`;
    document.body.appendChild(d);
    el = { root: d, year: d.querySelector('.sk-year b'), goal: d.querySelector('.sk-goaltxt'), bar: d.querySelector('.sk-bar span'), map: d.querySelector('.sk-map'), stats: d.querySelector('.sk-stats'), feed: d.querySelector('.sk-feed'), speed: d.querySelector('.sk-speed') };
    d.querySelector('.sk-stop').onclick = () => Sk.stop();
  }
  function paint(first) {
    const S = G.S; const g = Sk.goal; const f = Sk.from;
    el.year.textContent = S.day;
    const mt = maxTier();
    el.goal.innerHTML = `${esc(g.label)}<span>${Sk.course === 'fartura' ? 'anos de paz e fartura' : 'o mundo segue sozinho'}</span>`;
    let p;
    if (g.years) p = (S.day - f.day + S.time) / g.years;
    else if (g.tier) p = Math.max(0.04, Math.min(0.97, mt.t / g.tier * 0.85 + (S.day - f.day) / (g.max || 150) * 0.15));
    else p = Math.min(0.97, (S.day - f.day) / (g.max || 150));
    el.bar.style.width = (Math.min(1, p) * 100).toFixed(1) + '%';
    el.bar.parentNode.classList.toggle('open', !g.years);
    const big = biggestCity();
    const nw = warCount();
    el.stats.innerHTML = `<span><b>${S.villagers.size}</b> almas</span><span><b>${G.Fac.all().length}</b> ${G.Fac.all().length === 1 ? 'povo' : 'povos'}</span><span><b>${S.settlements.size}</b> povoados</span>${big ? `<span>maior: <b>${esc(big.name)}</b> · ${G.City.TIERS[big.tier || 0].toLowerCase()}</span>` : ''}<span class="${nw ? 'war' : ''}">${nw ? `<b>${nw}</b> ${nw === 1 ? 'guerra' : 'guerras'}` : 'em paz'}</span>`;
    const items = feed.slice(-6).reverse();
    const key = items.map(e => e.n).join(',');
    if (el.feed.dataset.k !== key) { el.feed.dataset.k = key; el.feed.innerHTML = items.map((e, k) => `<li style="opacity:${1 - k * 0.13}"><em>ano ${e.d}</em>${esc(e.txt)}</li>`).join('') || '<li class="muted">Os anos passam em silêncio…</li>'; }
    const yrs = S.day - f.day + S.time; const real = (performance.now() - startReal) / 1000;
    el.speed.textContent = real > 1.5 && yrs > 0.2 ? `${(real / yrs).toFixed(1)} s por ano · ${Math.round(yrs * G.DAY_LEN / Math.max(0.1, real))}× mais rápido que o normal` : '';
    if (first) drawMap();
  }
  // the time-lapse: the whole world, its kingdoms, roads and towns, seen from very high
  function drawMap() {
    const S = G.S; const cv = el.map; const N = G.N;
    const box = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(200, Math.round(box.width * dpr)), h = Math.max(120, Math.round(box.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
    const img = G.Minimap && G.Minimap.image ? G.Minimap.image() : null; if (!img) return;
    const s = Math.min((w - 20) / (2 * N), (h - 16) / N);
    const ox = w / 2, oy = h / 2 - N * s / 2;
    c.imageSmoothingEnabled = s < 1.5;
    c.setTransform(s, s / 2, -s, s / 2, ox, oy); c.drawImage(img, 0, 0);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const P = (x, y) => [ox + (x - y) * s, oy + (x + y) * s / 2];
    // battles: where warriors are fighting right now
    c.fillStyle = 'rgba(255,70,50,0.85)';
    let k = 0; for (const v of G.War.fighters) { if (k++ > 400) break; const [px, py] = P(v.x, v.y); c.fillRect(px - 1, py - 1, 2, 2); }
    // towns, sized by what they have become
    const sets = [...S.settlements.values()].sort((a, b) => (b.tier || 0) - (a.tier || 0) || G.Village.pop(b.id) - G.Village.pop(a.id));
    c.textAlign = 'center'; c.textBaseline = 'bottom';
    sets.forEach((st, n) => {
      const [px, py] = P(st.cx, st.cy); const t = st.tier || 0; const r = (2 + t * 1.3) * dpr;
      c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fillStyle = G.Fac.hex(st.fac); c.fill();
      c.lineWidth = dpr; c.strokeStyle = 'rgba(255,246,220,0.9)'; c.stroke();
      if (n < 7 && t >= 1) { c.font = `700 ${Math.round((9 + t) * dpr)}px Cinzel, Georgia, serif`; c.lineWidth = 3 * dpr; c.strokeStyle = 'rgba(15,12,10,0.75)'; c.strokeText(st.name, px, py - r - 2 * dpr); c.fillStyle = '#fff1d6'; c.fillText(st.name, px, py - r - 2 * dpr); }
    });
  }
})(window.G);
