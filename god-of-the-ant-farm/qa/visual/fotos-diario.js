// fotos-diario: real pictures of the game for the owner's diary of the patch (qa/patch3/diario) (the 3D of the Modo Encarnado, software WebGL), after
// qa/visual/fotos.js:   bash qa/navegador.sh node qa/visual/fotos-diario.js PASTA_DO_JOGO PASTA_DAS_FOTOS [nome,nome...]   (Q=alta|media, VW/VH, DSF)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3]; const ONLY = (process.argv[4] || '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
// name, world, town (null: the biggest), place ('praca' | 'house' | 'b:<type>[:minW]' | 'id:<n>'), back (tiles from the door),
// side (camera yaw off the line to the building), pitch, dist, hour, hud
const VIEWS = [
  ['mercado-dia', 'metropole', null, 'praca', 0, 0.55, 0.2, 5.6, 0.42, false],
  ['rua-dia', 'metropole', null, 'house', 0, 0.45, 0.22, 5.5, 0.42, false],
  ['cidade-alto', 'metropole', null, 'house', 0, 2.2, 0.5, 11, 0.42, false],
  ['praca-tarde', 'metropole', null, 'praca', 0, 3.9, 0.26, 6.5, 0.66, false],
  ['praca-noite', 'metropole', null, 'praca', 0, 0.55, 0.2, 5.6, 0.86, false],
  ['rua-hud', 'metropole', null, 'praca', 0, 0.55, 0.2, 5.6, 0.42, true],
  ['taverna-noite', 'metropole', 'Mênfis', 'b:taverna', 3.2, 0.35, 0.14, 5.6, 0.8, false],
  ['porto', 'metropole', 'Mênfis', 'b:doca', 3.5, 0.5, 0.26, 7.5, 0.4, false],
  ['templo', 'metropole', 'Mênfis', 'b:temple', 6, 0.25, 0.16, 7, 0.44, false],
  ['teatro', 'metropole', 'Roma', 'b:teatro', 7, 0.25, 0.2, 8, 0.44, false],
  ['piramide', 'mega', 'Mênfis', 'b:maravilha', 12, 0.2, 0.12, 9, 0.44, false],
  ['piramide-perto', 'mega', 'Mênfis', 'b:maravilha', 4.5, 0, 0.1, 5.5, 0.44, false],
  ['palacio', 'mega', 'Roma', 'b:grande_palacio', 9, 0.3, 0.16, 8.5, 0.44, false],
];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1200, height: +process.env.VH || 675 }, deviceScaleFactor: +process.env.DSF || 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const worlds = [...new Set(VIEWS.filter(v => !ONLY.length || ONLY.includes(v[0])).map(v => v[1]))];
  for (const w of worlds) await page.addScriptTag({ path: path.join(ROOT, 'worlds', w + '.js') });
  let world = null; let pageShots = true;
  for (const [name, w, town, place, back, side, pitch, dist, hour, hud] of VIEWS) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const t0 = Date.now();
    const r = await page.evaluate(([w, town, place, back, side, pitch, dist, hour, hud, fresh, Q]) => {
      let r0 = null, rq = null, quiet = true;
      const hush = on => { quiet = on; const r = G.Realm.renderer(); if (!r || r0) return; rq = r; r0 = r.render; r.render = function () { return quiet ? undefined : r0.apply(this, arguments); }; };
      const sync = () => { const r = G.Realm.renderer(); if (!r) return; const gl = r.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); };
      const step = () => { hush(true); G.Main.frameFor(33); }, drawn = ms => { hush(false); G.Main.frameFor(ms); sync(); };
      const f = n => { for (let k = 0; k < n; k++) step(); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; step(); } return -1; };
      try {
        if (fresh) {
          if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
          G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        }
        const S = G.S; const sets = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
        const s = (town && sets.find(q => q.name === town)) || sets[0];
        // (the body: someone of that town, out of doors, the lowest id)
        const cur = G.Possess.body && G.Possess.body();
        if (!cur || cur.set !== s.id) {
          if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
          const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && !o.aboard && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
          if (!v) return { err: 'ninguém para viver em ' + s.name };
          G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6);
        }
        const near = (x, y) => { for (let r = 0; r < 7; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (G.W.inb(X, Y) && G.W.walkableXY(X, Y) && !S.treeAt[G.W.idx(X, Y)] && !S.occ[G.W.idx(X, Y)]) return [X, Y]; } return [x, y]; };
        const bl = t => [...S.buildings.values()].filter(b => b.type === t && b.built && b.set === s.id).sort((a, b) => (b.w || 1) - (a.w || 1) || a.id - b.id)[0];
        let at = null, look = null, info = '';
        if (place === 'praca') { const b = bl('praca') || bl('campfire'); at = near(b.x - 1.2, b.y + b.h / 2); }
        else if (place === 'house') { const b = bl('house') || bl('hut'); at = near(b.x + b.w + 1.4, b.y + b.h + 1.4); }
        else {
          const b = place.startsWith('id:') ? S.buildings.get(+place.slice(3)) : bl(place.slice(2)); if (!b) return { err: 'sem ' + place + ' em ' + s.name };
          const cx = b.x + (b.w || 1) / 2, cy = b.y + (b.h || 1) / 2; const d = G.Vg.door(b); let ux = d[0] - cx, uy = d[1] - cy; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
          at = near(Math.round(d[0] + ux * back) + 0.5 - 0.5, Math.round(d[1] + uy * back)); look = [cx, cy]; info = `${b.type}#${b.id} ${b.w}x${b.h} esc ${b.esc}`;
        }
        if (!G.Avatar.place(at[0], at[1])) return { err: 'o corpo não coube em ' + at };
        S.time = hour; S.weather.storm = 0; S.weather.rain = 0; f(30);
        const vis = hud ? 'visible' : 'hidden'; document.querySelectorAll('#inc-root, #inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = vis); document.querySelectorAll('#inc-banner').forEach(e => e.style.visibility = 'hidden');
        const st = G.Avatar.state(); const by = look ? Math.atan2(look[1] - at[1], look[0] - at[0]) : 0.3; st.yaw = by;
        const cy2 = look ? by + side : side;
        G.Cam3D.OPT.follow = false; G.Cam3D.yaw = cy2; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; f(38); drawn(33); drawn(33); st.yaw = by; G.Cam3D.yaw = cy2; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; drawn(1);
        const c = G.Realm.renderer().domElement;
        return { at: at.map(q => +q.toFixed(2)), town: s.name, info, err: JSON.stringify(G.modErr), px: [c.width, c.height], png: pageOnly ? null : c.toDataURL('image/png') };
      } finally { if (rq) rq.render = r0; }
      function pageOnly() { return false; }
    }, [w, town, place, back, side, pitch, dist, hour, hud, world !== w, process.env.Q || 'alta']);
    world = w; const t1 = Date.now(); const file = path.join(OUT, name + '.png');
    if (!r || !r.at) { console.log(`${name}: NÃO SAIU — ${r ? r.err : 'nada'}`); continue; }
    const { png, ...info } = r;
    const shot = !pageShots ? 'a página já não fotografava' : await page.screenshot({ path: file, timeout: 240000 }).then(() => null, e => e.message.split('\n')[0]);
    if (shot && png) { fs.writeFileSync(file, Buffer.from(png.split(',')[1], 'base64')); if (pageShots) console.log(`AVISO ${name}: a foto da página não veio (${shot}): esta e as seguintes são do canvas`); pageShots = false; }
    console.log(`${name}: ${JSON.stringify(info)} (${((t1 - t0) / 1000).toFixed(0)} s + a foto ${((Date.now() - t1) / 1000).toFixed(0)} s${shot ? ', do canvas' : ''})`);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
