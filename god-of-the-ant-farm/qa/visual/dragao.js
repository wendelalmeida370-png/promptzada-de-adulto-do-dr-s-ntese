// dragao: the dragon of the god's power seen from the body (D-270, js/dragon3d.js drawing it as one skin through G.Fauna3D,
// posed by G.FaunaAnim.dragon), provoked on purpose in the browser with real frames: woken over the body by the power, it
// comes down out of the sky, hunts, runs over the town breathing fire, dives on the treasury, flies home, lands and sleeps on
// its hoard — a save and a load while it breathes and another while it sleeps —; woken again, it takes off and is killed in
// the air: it falls, and its bones stay. Then every pose held still (the world paused), in each of the five hues.
//   node qa/visual/dragao.js [PASTA_DO_JOGO] [FOTOS]     (≈ 6 min)   env: WORLD (cidade), Q (media: the poses), QL (baixa: the
//   day lived), VW/VH (the photographs, 720×460), SO_POSES=1 (only the poses held still: an old worktree's photographs)
// FOTOS: a folder for the photographs of each pose and hue (also on an old worktree: the «antes»).
// Fails when: the dragon is not drawn where the world has it, or not as a skin (G.Fauna3D) where the skin can be drawn; a
// state of the world's dragon has no pose of its own; the breath (fire, frost) does not leave the jaws or the jaws stay
// shut; it does not sleep on its gold, fall when it dies or leave its bones; a number is not a number, a beast's hips are far
// from where the world has it, a row is drawn twice (People3D.check, Fauna3D.check, Dragon3D.check); a page error, a console
// warning, a module error.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const FOTOS = process.argv[3] || '';
if (FOTOS) fs.mkdirSync(FOTOS, { recursive: true });
(async () => {
  const VW = +process.env.VW || 720, VH = +process.env.VH || 460;
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const WORLD = process.env.WORLD || 'cidade';
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  // ------------------------------ the dragon's day, lived ------------------------------
  const r = await page.evaluate(env => {
    const out = { fails: [], notes: [], seen: {}, poses: {}, skins: 0, drawn: 0 }; const fail = m => { if (out.fails.length < 40) out.fails.push(m); };
    G.Realm.setQuality(env.SO ? env.Q : env.QL); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    let S = G.S; const P = G.Powers, D3 = G.Dragon3D, F3 = G.Fauna3D, P3 = G.People3D, TL = G.Space.TILE, HM = G.Space.HM;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(4);
    if (env.SO) return out; // (only the poses: the photographs of an old worktree, the «antes»)
    const skinOK = !!(F3 && F3.ready && F3.has && F3.has('dragon')); out.skinOK = skinOK; out.newDrawing = !!(D3.drawnList && D3.POSES);
    if (out.newDrawing && !skinOK) fail('o dragão não tem a sua pele no Fauna3D: ' + (F3 ? F3.failed || 'sem a malha dragon' : 'sem o módulo'));
    if (F3 && F3.dataErr) for (const e of F3.dataErr) fail('dados: ' + e);
    const b = G.Possess.body();
    P.dragon(b.x, b.y); let d = S.dragons[S.dragons.length - 1]; if (!d) { fail('o poder não acordou um dragão'); return out; }
    const id = d.id; out.hue = d.hue; out.name = d.name;
    // (the world at seventeen times a person's pace in the body: the dragon's day in a few hundred frames)
    const T0 = G.Space.TIME; G.Space.TIME = 6;
    let frames = 0; const look = () => {
      d = (S.dragons || []).find(q => q.id === id) || null;
      for (const e of P3.check()) fail('verificador: ' + e);
      for (const e of D3.check()) fail('dragão: ' + e);
      if (!d) return;
      const L = D3.drawnList(); const q = L[0];
      if (!q) { if (d.st !== 'parte') fail(`quadro ${frames}: o dragão (${d.st}) não foi desenhado`); return; }
      out.drawn++; if (q.skin) out.skins++;
      out.seen[d.st] = (out.seen[d.st] || 0) + 1; if (q.pose) out.poses[q.pose] = (out.poses[q.pose] || 0) + 1;
      // (where the world has it: its feet or its body at the world's height — the landing eases the last metres down)
      const off = Math.hypot(q.X - d.x * TL, q.Z - d.y * TL); if (off > 0.6) fail(`quadro ${frames}: o dragão (${d.st}) desenhado a ${off.toFixed(2)} m de onde o mundo o tem`);
      const dy = q.Y - d.h * HM, lift = q.lift || 0; if (!(q.pose === 'pouso' ? dy > -0.6 && dy < 40 : Math.abs(dy - lift) < 0.6 && lift >= 0 && lift < 4)) fail(`quadro ${frames}: o dragão (${d.st}, ${q.pose}) desenhado ${dy.toFixed(2)} m acima de onde o mundo o tem`);
      if (out.newDrawing && skinOK && !q.skin) fail(`quadro ${frames}: o dragão (${d.st}) desenhado sem a pele`);
      if (out.newDrawing && d.st === 'passe' && d.breath && !(q.breathing && q.jaw > 0.25)) fail(`quadro ${frames}: o dragão sopra de boca fechada (${JSON.stringify(q)})`);
    };
    const run = (n, stop) => { for (let k = 0; k < n; k++) { G.Main.frameFor(33); frames++; if (k % 3 === 0) look(); if (stop && stop()) return true; } return false; };
    const reload = why => {
      const data = G.Save.serialize(); G.UI.select(null); G.Save.apply(JSON.parse(data)); S = G.S;
      if (G.Modes.state !== 'INC') { G.Modes.enter(S.villagers.get(v.id)); until(() => G.Modes.state === 'INC', 300); }
      d = (S.dragons || []).find(q => q.id === id); if (!d) fail(`o dragão sumiu no load (${why})`); out.notes.push(`save e load ${why}: ${d ? d.st : '—'}`);
      f(3); look();
    };
    // down out of the sky, the hunt, the runs over the town (a save and a load in the middle of one, breathing)
    run(450, () => d && d.st === 'passe' && d.breath);
    if (d && d.st === 'passe') { reload('no meio de um rasante, soprando'); }
    // the rest of the runs, the dive on the treasury, the flight home and the landing: asleep on the hoard
    run(1200, () => d && d.st === 'dorme' && d.t > 3);
    if (!d || d.st !== 'dorme') { fail('o dragão não voltou a dormir no covil: ' + (d ? d.st : 'sumiu')); }
    else {
      // (its gold heaped round it, drawn while it sleeps: the town it robbed may have had none — then the test lends it some —, and
      // the body goes near the lair if it is beyond where the gold is drawn)
      out.hoard = d.hoard; if (!(d.hoard > 0)) { d.hoard = 40; out.notes.push('(o tesouro estava vazio: a prova lhe deu 40)'); }
      if (Math.hypot(d.x - G.Possess.body().x, d.y - G.Possess.body().y) * TL > 120) for (const [ox, oy] of [[6, 0], [0, 6], [-6, 0], [0, -6], [4, 4]]) if (G.Avatar.place(d.x + ox, d.y + oy)) break;
      run(10); out.sleep = { coins: D3.coins, pose: (D3.drawnList()[0] || {}).pose };
      if (!(D3.coins > 5)) fail('o dragão dorme sem o ouro em volta: ' + D3.coins);
      reload('dormindo no covil');
      // woken: it takes off, and is killed in the air
      d.wake = S.clock; run(300, () => d && d.st !== 'dorme' && d.alt > 7);
      if (!d || d.alt <= 7) fail('o dragão acordado não levantou voo: ' + (d ? d.st + ' a ' + (d.alt || 0).toFixed(1) : 'sumiu'));
      else {
        const nb = (S.dragonBones || []).length; d.hp = 0; out.killedAt = d.alt;
        run(250, () => !(S.dragons || []).some(q => q.id === id)); f(4);
        if ((S.dragons || []).some(q => q.id === id)) fail('o dragão morto não caiu');
        if (!((S.dragonBones || []).length > nb) && G.W.inb(d.x, d.y)) out.notes.push('(caiu na água: sem ossos)');
        else if (!(D3.bones >= 1)) fail('os ossos do dragão não estão no chão');
      }
    }
    G.Space.TIME = T0; G.Realm.setQuality(env.Q);
    if (G.modErr && Object.keys(G.modErr).length) fail('erro de módulo: ' + JSON.stringify(G.modErr));
    out.frames = frames; out.calls = F3 ? F3.calls : 0; out.tris = F3 ? F3.tris : 0;
    return out;
  }, { Q: process.env.Q || 'media', QL: process.env.QL || 'baixa', WORLD, SO: !!process.env.SO_POSES });
  // ------------------------------ every pose held still, and the five hues ------------------------------
  const shots = []; const SHOW = [
    ['voo', { st: 'caca', h: 9, yaw: 1.9, dist: 2.3, up: -0.25 }], ['planeio', { st: 'caca', h: 9, yaw: 0.9, dist: 2.2, up: 0.35, glide: 1 }],
    ['curva', { st: 'curva', h: 10, yaw: 2.6, dist: 2.2, up: -0.15, turn: 0.9 }], ['rasante', { st: 'passe', breath: 1, h: 4, yaw: 1.2, dist: 2.3, up: 0.1 }],
    ['mergulho', { st: 'rouba', h: 11, dive: 1, yaw: 1.6, dist: 2.3, up: 0.2 }], ['pouso', { st: 'dorme', h: 0, land: 12, yaw: 2.2, dist: 2.1, up: 0.1, wait: 22 }],
    ['dorme', { st: 'dorme', h: 0, hoard: 70, yaw: 0.8, dist: 1.6, up: 0.5 }], ['luta', { st: 'luta', h: 0, fire: 1, hoard: 30, yaw: 1.3, dist: 1.9, up: 0.15 }],
    ['queda', { st: 'morre', h: 14, yaw: 1.7, dist: 2.4, up: 0.1, wait: 18 }], ['morto', { st: 'morre', h: 0, fallen: 1, yaw: 0.9, dist: 1.8, up: 0.5 }],
    ['frente', { st: 'caca', h: 6, yaw: 0, dist: 2.1, up: 0.05 }], ['cabeca', { st: 'luta', h: 0, yaw: 0.35, dist: 0.6, up: 0.0, head: 1 }],
  ];
  for (let hue = 0; hue < 5; hue++) SHOW.push(['cor' + hue, { st: hue === 3 ? 'passe' : 'caca', breath: hue === 3 ? 1 : 0, h: 7, yaw: 1.5, dist: 2.2, up: 0.0, hue }]);
  const pose = await page.evaluate(() => {
    const S = G.S; const b = G.Possess.body(); const P = G.Powers;
    // (a dragon of its own for the photographs, its world paused: only the drawing moves)
    S.dragons = []; S.dragonBones = []; P.dragon(b.x, b.y); const d = S.dragons[0]; window.__d = d; G.Modes.menu(true);
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast, #inc-menu, .inc-menu').forEach(e => e.style.visibility = 'hidden');
    // (open ground for it, and open sky: the flattest spot near the town with the fewest trees and houses round it — the camera
    // stands 30 to 45 m off —; the body beside it, for the scale and so the 3D draws that ground near; a morning's light)
    // (round the biggest town, not the body — the body may have gone to the lair —: the same spot in the old and the new)
    const W = G.W, N = G.N; let best = null, bs = 1e9; const tw = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0] || { cx: b.x, cy: b.y };
    for (let y = Math.max(12, Math.floor(tw.cy) - 45); y <= Math.min(N - 13, Math.floor(tw.cy) + 45); y += 2) for (let x = Math.max(12, Math.floor(tw.cx) - 45); x <= Math.min(N - 13, Math.floor(tw.cx) + 45); x += 2) {
      let lo = 1e9, hi = -1e9, ok = true, trees = 0;
      for (let dy = -4; dy <= 4 && ok; dy++) for (let dx = -4; dx <= 4; dx++) { const i = W.idx(x + dx, y + dy); if (S.type[i] <= G.T.RIVER || S.occ[i] || (S.treeAt && S.treeAt[i])) { ok = false; break; } const h = W.groundH(x + dx + 0.5, y + dy + 0.5); lo = Math.min(lo, h); hi = Math.max(hi, h); }
      if (!ok) continue;
      for (let dy = -11; dy <= 11; dy++) for (let dx = -11; dx <= 11; dx++) { if (dx * dx + dy * dy > 121) continue; const i = W.idx(x + dx, y + dy); if (S.treeAt && S.treeAt[i]) trees++; if (S.occ[i]) trees += 0.5; }
      const sc = (hi - lo) * 60 + trees + Math.hypot(x - tw.cx, y - tw.cy) * 0.05; if (sc < bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
    }
    if (best) { for (const [ox, oy] of [[0, 3], [3, 0], [0, -3], [-3, 0], [2, 2]]) if (G.Avatar.place(best[0] + ox, best[1] + oy)) break; }
    S.time = 0.42; for (let k = 0; k < 40; k++) G.Main.frameFor(33);
    window.__spot = best || [b.x + 6, b.y]; return { spot: window.__spot, F3: !!(G.Fauna3D && G.Fauna3D.ready) };
  });
  for (const [name, o] of SHOW) {
    const info = await page.evaluate(o => {
      const S = G.S, W = G.W, TL = G.Space.TILE, HM = G.Space.HM; const d = window.__d; const [x, y] = window.__spot;
      S.dragons = [d]; d.hue = o.hue === undefined ? 0 : o.hue; d.st = o.st; d.t = 0.5; d.breath = o.breath || 0; d.fallen = o.fallen || 0; d.done = 0; d.hoard = o.hoard || 0; d.ft = o.fire ? S.clock : -9; d.hp = o.st === 'morre' ? 0 : d.maxHp;
      d.x = d.lx = x; d.y = d.ly = y; d.hd = 0.25; const g = W.groundH(x, y); d.h = g + (o.h || 0); d.alt = o.h || 0;
      const step = n => { for (let k = 0; k < n; k++) {
        if (o.dive) { d.h = Math.max(g + 2.5, d.h - 0.28); d.alt = d.h - g; }
        if (o.turn) d.hd += 0.05 * o.turn;
        G.Main.frameFor(33); } };
      // (a jump: the drawing takes it where it is at once; a landing: from the air down, at the same spot)
      // (a jump first — away and back — so the drawing takes the pose as it is, nothing carried from the last one)
      d.x += 4; step(1); d.x -= 4; step(1);
      if (o.land) { const st = d.st; d.st = 'volta'; d.h = g + o.land; step(10); d.st = st; d.h = g; d.alt = 0; step(o.wait || 10); }
      else { step(14); if (o.wait) step(o.wait); }
      const L = G.Dragon3D.drawnList(); const q = L[0] || null; if (!q) return { err: 'não desenhado' };
      const X = q.X, Z = q.Z; const size = 18; const D = size * o.dist * 0.72;
      // (the camera on the side with the clearest view: the fewest trees and houses between it and the dragon)
      const blocked = a => { let n = 0; for (let k = 2; k <= 14; k++) { const u = k / 16; const px = (X + Math.cos(a) * D * u) / TL, pz = (Z + Math.sin(a) * D * u) / TL; if (!W.inb(px, pz)) continue; const i = W.idx(px, pz); if ((S.treeAt && S.treeAt[i]) || S.occ[i]) n++; } return n; };
      let ang = d.hd + o.yaw, bn = blocked(ang); for (let k = 1; k < 12 && bn > 0; k++) { const a = d.hd + o.yaw + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.5; const n = blocked(a); if (n < bn) { bn = n; ang = a; } }
      const cy = o.st === 'dorme' || o.st === 'luta' || (o.st === 'morre' && o.fallen) ? q.Y + 3 : q.Y;
      const cam = G.Realm.camera(); let tx = X, ty = cy, tz = Z;
      if (o.head && q.mouth) { tx = q.mouth[0]; ty = q.mouth[1]; tz = q.mouth[2]; }
      const cx = tx + Math.cos(ang) * D, cz = tz + Math.sin(ang) * D; const cg = (W.inb(cx / TL, cz / TL) ? W.groundH(cx / TL, cz / TL) : G.SEA) * HM;
      cam.position.set(cx, Math.max(ty + D * o.up + 1.5, cg + 2), cz); cam.lookAt(tx, ty, tz); cam.fov = 45; cam.near = 0.5; cam.updateProjectionMatrix();
      G.Realm.renderer().render(G.Realm.scene(), cam);
      const i = G.Realm.renderer().info.render; return { pose: q.pose || q.mode, skin: !!q.skin, breathing: q.breathing, calls: i.calls, tris: i.triangles };
    }, o);
    if (FOTOS) { const file = path.join(FOTOS, name + '.png'); await page.screenshot({ path: file, timeout: 240000 }); shots.push([name + ' · ' + (info.pose || info.err), file]); }
    r.notes.push(`${name}: ${JSON.stringify(info)}`);
    if (r.newDrawing) { if (info.err) r.fails.push(`pose ${name}: ${info.err}`); else if (r.skinOK && !info.skin) r.fails.push(`pose ${name}: sem a pele`); }
  }
  const chk = await page.evaluate(() => ({ p3: G.People3D.check(), d3: G.Dragon3D.check(), err: JSON.stringify(G.modErr) }));
  for (const e of chk.p3.concat(chk.d3)) r.fails.push('verificador (poses): ' + e);
  if (chk.err !== '{}') r.fails.push('erro de módulo (poses): ' + chk.err);
  await browser.close();
  if (FOTOS && shots.length) {
    const sheet = path.join(FOTOS, 'folha.png'); fs.writeFileSync(sheet + '.json', JSON.stringify(shots));
    try { require('child_process').execFileSync(process.env.PY || 'python3', [path.join(__dirname, 'bichos-folha.py'), sheet, '4'], { stdio: 'inherit' }); } catch (e) { console.log('(sem a folha: ' + e.message.slice(0, 80) + ')'); }
  }
  console.log(`dragão ${r.name || ''} (cor ${r.hue}), ${r.frames} quadros: desenhado em ${r.drawn}, como pele em ${r.skins}; estados ${JSON.stringify(r.seen)}; poses ${JSON.stringify(r.poses)}; ${r.calls} chamadas e ${r.tris} triângulos de bichos no último`);
  for (const n of r.notes) console.log(n);
  if (r.newDrawing) {
    // (the turn between two runs, 'curva', is the cruise banked: a save and a load in the middle of a run can skip it)
    for (const st of ['chega', 'caca', 'passe', 'rouba', 'volta', 'dorme', 'morre']) if (!r.seen[st]) r.fails.push(`o estado ${st} do dragão nunca foi visto no 3D`);
    for (const p of ['voo', 'rasante', 'mergulho', 'pouso', 'dorme', 'queda']) if (!r.poses[p]) r.fails.push(`a pose ${p} nunca foi desenhada na vida do dragão`);
  }
  const fails = r.fails.concat(errs.map(e => 'página: ' + e));
  if (fails.length) { console.log([...new Set(fails)].slice(0, 30).join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
  console.log('PASSOU');
})();
