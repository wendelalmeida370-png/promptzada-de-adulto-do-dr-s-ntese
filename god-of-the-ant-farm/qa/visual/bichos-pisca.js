// bichos-pisca: os bichos do 3D não piscam (L-988) e a memória do desenho não se apaga de uma vez (L-989), no navegador.
//   node qa/visual/bichos-pisca.js [PASTA_DO_JOGO]      (≈ 4 min)   env: WORLD (cidade), Q (alta), FR (120)
// p1 numa vista com mais bichos do que as linhas da pele (a qualidade alta, a câmera girando em volta do corpo), nenhum bicho ao
//    alcance da vista e no campo do olho é desenhado, deixa de ser e volta a ser em poucos quadros (o «aceso, apagado, aceso»
//    que o dono viu: os mais longe tomavam a linha uns dos outros a cada quadro). Os que passam das linhas vão como as peças;
// p2 com mais de 400 bichos na memória do desenho, a memória dos que saíram do alcance é solta — e um bicho parado perto do corpo
//    continua virado para onde estava (antes a memória toda se apagava e os bichos parados viravam todos para o leste);
// e nenhum erro de página, aviso no console nem erro de módulo.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if (/^@@/.test(t)) { console.log(t); return; } if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 400)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const WORLD = process.env.WORLD || 'cidade';
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const r = await page.evaluate(env => {
    const out = { fails: [], notes: [] }; const fail = m => out.fails.push(m);
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, A = G.Animals, P3 = G.People3D, TL = G.Space.TILE;
    // (the person with the most beasts round her: a crowded sight)
    let best = null, bn = -1;
    for (const v of S.villagers.values()) { if (!(v.age >= 18 && v.age < 55 && !v.inside && G.Possess.can(v).ok)) continue; let n = 0; for (const a of S.animals.values()) if (!a.dead && G.dist2(a.x, a.y, v.x, v.y) < 900) n++; if (n > bn) { bn = n; best = v; } }
    G.Modes.enter(best); for (let k = 0; k < 300 && G.Modes.state !== 'INC'; k++) G.Main.frameFor(33); for (let k = 0; k < 10; k++) G.Main.frameFor(33);
    if (G.Modes.state !== 'INC') { fail('não entrou no corpo'); return out; }
    const cam = G.Realm.camera(); const fr = new THREE.Frustum(), M = new THREE.Matrix4(), sph = new THREE.Sphere();
    const reach = Math.sqrt(0.7) * G.Realm.Q().view * 0.22; // (how far the beasts are drawn: People3D's R × √0.7)
    // (a build from before the list of the drawn, P3.bdrawn: the skins put this frame, by where they stand — to see the old blink)
    let put = null; if (!P3.bdrawn) { const F3 = G.Fauna3D, put0 = F3.put; put = new Set(); let fm = -1; const byX = new Map();
      F3.put = function (row, R, kind, coat, lod, X, Y, Z) { if (fm !== F3.frame) { fm = F3.frame; put.clear(); byX.clear(); for (const a of S.animals.values()) byX.set(a.x * TL + ',' + a.y * TL, a.id); } const id = byX.get(X + ',' + Z); if (id) put.add(id); return put0.apply(this, arguments); }; }
    const drawnNow = () => new Set(put || P3.bdrawn);
    console.log('@@ no corpo; alcance', Math.round(reach), 'm');
    // ---- p1: no blink
    const hist = new Map(); let rowsMax = 0, many = 0;
    for (let f = 0; f < env.FR; f++) {
      G.Cam3D.yaw = (G.Cam3D.yaw || 0) + 0.02; G.Main.frameFor(33);
      cam.updateMatrixWorld(); M.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); fr.setFromProjectionMatrix(M);
      rowsMax = Math.max(rowsMax, G.Fauna3D.rows || 0); if (P3.beastSkins >= 64) many++;
      const foc = G.Avatar.state(); const drawn = drawnNow();
      for (const a of S.animals.values()) {
        if (a.dead || a.held) continue; const sp = A.DEF[a.kind]; if (!sp || sp.cls === 'water') continue;
        const X = a.x * TL, Z = a.y * TL; if (Math.hypot(X - foc.X, Z - foc.Z) > reach * 0.95) continue;
        sph.center.set(X, G.W.groundH(a.x, a.y) * G.Space.HM + 0.5, Z); sph.radius = 0.4;
        let h = hist.get(a.id); if (!h) { h = { kind: a.kind, s: '' }; hist.set(a.id, h); }
        h.s += !fr.intersectsSphere(sph) ? '-' : drawn.has(a.id) ? '1' : '0';
      }
    }
    let blinks = 0; const ex = [];
    for (const [id, h] of hist) { const m = h.s.match(/1(0{1,6})1/g); if (m) { blinks += m.length; if (ex.length < 4) ex.push(`${h.kind}#${id} ${h.s.slice(0, 60)}`); } }
    out.notes.push(`p1: ${hist.size} bichos ao alcance da vista (${Math.round(reach)} m), ${many} de ${env.FR} quadros com as 64 linhas da pele cheias, ${blinks} piscadas`);
    if (!many) out.notes.push('p1: (a vista não encheu as linhas da pele: a prova vale menos — tente WORLD=cidade Q=alta)');
    if (blinks) fail(`p1: ${blinks} piscada(s) — bicho no campo do olho desenhado, apagado, desenhado: ${ex.join(' | ')}`);
    console.log('@@ p1 feita');
    // ---- p2: the view's memory let go a little at a time
    const foc = G.Avatar.state(); const bx = foc.X / TL, by = foc.Z / TL;
    const still = [...S.animals.values()].filter(a => !a.dead && !a.held && A.DEF[a.kind].cls === 'land' && P3.beastVis(a.id) && Math.hypot(a.x - bx, a.y - by) * TL < 25).slice(0, 3);
    // (held: the world's facing too — a beast standing turns as the world has it face, D-330 —, pinned where the step left it)
    let face = null; const hold = () => { still.forEach((a, k) => { a.state = 'idle'; a.t = 1e6; a.tx = a.x; a.ty = a.y; a.target = 0; a.angry = 0; a.flee = 0; a.hunger = 0; if (face) { a.fx = face[k][0]; a.fy = face[k][1]; } }); };
    // (they turned somewhere first: a step to the north-east, then held)
    for (const a of still) { a.tx = a.x + 0.6; a.ty = a.y + 0.6; }
    for (let k = 0; k < 40; k++) G.Main.frameFor(33);
    face = still.map(a => [a.fx, a.fy]);
    hold(); for (let k = 0; k < 10; k++) { hold(); G.Main.frameFor(33); }
    // (the world paused, the view's turn let finish before the yaw is read: it turns the standing beast smoothly toward the facing,
    // and a yaw read mid-turn went on turning while the memory was being let go — T-1342)
    G.UI.setSpeed(0); for (let k = 0, last = null; k < 200; k++) { hold(); G.Main.frameFor(33); const y = still.map(a => P3.beastVis(a.id) ? P3.beastVis(a.id).yaw : 0); if (last && y.every((v, i) => Math.abs(v - last[i]) < 0.002)) break; last = y; }
    const yaw0 = still.map(a => P3.beastVis(a.id) ? P3.beastVis(a.id).yaw : null), mem0 = still.map(a => P3.beastVis(a.id));
    // a crowd passing through the memory: 450 rabbits behind the camera, in sight's reach but out of the eye's field (cheap: none
    // drawn), the world paused so they stay where they are; then gone, and the frames go on until the memory lets them go
    G.UI.setSpeed(0); const cp = cam.position, fw = new THREE.Vector3(); cam.getWorldDirection(fw); fw.y = 0; fw.normalize();
    const crowd = []; for (let k = 0; k < 450; k++) { const d = 10 + (k % 15) * 2.4, sd = ((k * 7) % 31) / 31 - 0.5; const X = cp.x - fw.x * d - fw.z * sd * d * 0.8, Z = cp.z - fw.z * d + fw.x * sd * d * 0.8; const p = G.W.nearestLand(X / TL, Z / TL, 4); if (p) crowd.push(A.spawn('rabbit', p[0], p[1], { state: 'idle', t: 1e6 })); }
    console.log('@@ p2: coelhos', crowd.length);
    for (let k = 0; k < 6; k++) { hold(); G.Main.frameFor(33); }
    const mem = P3.memSize ? P3.memSize() : null;
    for (const a of crowd) if (S.animals.has(a.id)) A.remove(a);
    for (let k = 0; k < 110; k++) { hold(); G.Main.frameFor(33); }
    G.UI.setSpeed(1);
    const yaw1 = still.map(a => P3.beastVis(a.id) ? P3.beastVis(a.id).yaw : null);
    out.notes.push(`p2: ${crowd.length} coelhos passaram pela memória (${mem === null ? '?' : mem} bichos nela); ${still.length} bicho(s) parado(s): virados ${yaw0.map(y => y === null ? '—' : y.toFixed(2)).join(', ')} → ${yaw1.map(y => y === null ? '—' : y.toFixed(2)).join(', ')}`);
    if (!still.length) fail('p2: nenhum bicho parado perto do corpo para olhar');
    still.forEach((a, k) => { if (P3.beastVis(a.id) !== mem0[k]) fail(`p2: ${a.kind}#${a.id} parado perdeu a memória do desenho (outra no lugar)`); });
    still.forEach((a, k) => { if (yaw0[k] === null || yaw1[k] === null) fail(`p2: ${a.kind}#${a.id} sem memória do desenho`); else if (Math.abs(yaw1[k] - yaw0[k]) > 0.05) fail(`p2: ${a.kind}#${a.id} parado virou de ${yaw0[k].toFixed(2)} para ${yaw1[k].toFixed(2)} — a memória do desenho se apagou`); });
    for (const e of P3.check ? P3.check() : []) fail('verificador: ' + e);
    if (G.modErr && Object.keys(G.modErr).length) fail('erro de módulo: ' + JSON.stringify(G.modErr));
    return out;
  }, { Q: process.env.Q || 'alta', WORLD, FR: +process.env.FR || 120 });
  await browser.close();
  for (const n of r.notes) console.log(n);
  const fails = r.fails.concat(errs.map(e => 'página: ' + e));
  if (fails.length) { console.log([...new Set(fails)].slice(0, 20).join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
  console.log('PASSOU');
})();
