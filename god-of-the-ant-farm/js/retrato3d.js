'use strict';
// ============================================================
//  The portrait in the god's panel (22a wave 2, D-645): the face
//  of a person as the 3D draws them — the genome's, the years,
//  the wound, the grief —, drawn once by the 3D's own body and
//  kept in the view's memory (never the world, never the save),
//  drawn again only when the face changes for real. Only seen:
//  it reads the person and the 3D's portrait of them, writes
//  nothing of the world and draws from no chance.
// ============================================================
(function (G) {
  const RT = G.Retrato3D = { made: 0, hits: 0, ms: 0, first: 0, failed: null };
  const SIZE = RT.SIZE = 128, CAP = RT.CAP = 48, LAYER = 30; // (the picture's pixels; the faces kept; the 3D's layer of the studio)
  const STUDIO = [-3000, 0, -3000]; // (where the studio stands: far from every chunk of the world, which its layer leaves out anyway)
  const memo = new Map(); // (key → the picture: a canvas — the oldest first, the one seen again moved last)
  const last = new Map(); // (id → the last picture made of them: shown while the new one is made)
  let asks = new Map(), timer = 0, cam = null, lights = null, vp = null, sc4 = null, cc = null;
  const waiting = []; // (the panels' canvases that showed the god's drawing while the 3D's was made: painted over when it is)
  G.worldHooks.push(() => { memo.clear(); last.clear(); asks = new Map(); waiting.length = 0; });
  // (what the portrait shows of the life: what lasts — the grief, a wound, a sickness —, never the moment's fright or the cold)
  const LASTS = ['luto', 'ferido', 'doente'];
  const PO = {}, PZ = {};
  function porte(v) {
    const V3 = G.Vida3D; const p = V3 && V3.porteOf ? V3.porteOf(v, PO) : null;
    for (const k of (V3 && V3.PORTE) || []) PZ[k] = 0;
    for (const k of LASTS) PZ[k] = p && Number.isFinite(p[k]) ? Math.round(p[k] * 4) / 4 : 0; // (in quarters: a grief that eases a little is the same face)
    return PZ;
  }
  // (the face changes for real: the shape of the years and the body — the feição's own key —, the life that lasts on the face, the
  // colours and what is worn on the head and the shoulders)
  function keyOf(v, L) {
    const Fe = L.fe, u = L.out || {}, p = porte(v);
    return [v.id, Fe ? Fe.sig : (v.age | 0), p.luto, p.ferido, p.doente, L.skin, L.hair, L.cloth, u.hatM, u.hairM, u.beard, u.cloakM, u.topM, u.iris, v.dead ? 1 : 0].join('|');
  }
  // (where the 3D can draw: not in the light quality; on a phone only once the 3D is made — by a descent into a body —, never made
  // for a portrait alone: the first making of the 3D costs a few seconds)
  const coarse = () => { try { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches); } catch (e) { return false; } };
  const able = () => !RT.failed && window.THREE && G.Realm && G.Realm.renderer && G.People3D && G.People3D.look && G.Body3D && G.Anim3D && G.Anim3D.POSE0 && G.Realm.q !== 'baixa' && (!!G.Realm.renderer() || !coarse());
  // a person's portrait into a panel's canvas (its whole picture): true when the 3D's is there, painted now; false when the god's
  // drawing stays — the 3D's is asked for, and painted over the canvas when it is made, while the canvas is still on the screen
  RT.into = function (canvas, v) {
    if (!canvas || !v || !(v.age >= 2) || v.headless || !able()) return false;
    let L; try { L = G.People3D.look(v); } catch (e) { return false; } // (a look the 3D cannot make: the god's drawing)
    const k = keyOf(v, L), hit = memo.get(k);
    if (hit) { memo.delete(k); memo.set(k, hit); RT.hits++; paint(canvas, hit, v.dead); return true; }
    asks.set(k, v); if (waiting.length > CAP) waiting.splice(0, waiting.length - CAP); waiting.push([canvas, k, !!v.dead]);
    if (!timer) timer = setTimeout(make, G.Realm.renderer() ? 60 : 350); // (after the panel is on the screen: the god's drawing first — and, the first time, the 3D made a moment after the click)
    const old = last.get(v.id); if (old) { paint(canvas, old, v.dead); return true; } // (the face of before while the new one is made)
    return false;
  };
  RT.size = () => memo.size;
  RT.has = v => { if (!able()) return false; try { return memo.has(keyOf(v, G.People3D.look(v))); } catch (e) { return false; } };
  function paint(canvas, pic, dead) {
    const x = canvas.getContext('2d'); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); if (dead) x.filter = 'grayscale(1) sepia(0.15)'; // (the dead in the grey of a memory, as the god's drawing of them)
    x.drawImage(pic, 0, 0, canvas.width, canvas.height); x.filter = 'none';
    // (the panel's frame: the edges a little darker, as the god's drawing has its round light)
    const w = canvas.width, g = x.createRadialGradient(w / 2, w * 0.42, w * 0.3, w / 2, w / 2, w * 0.72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,24,10,0.45)');
    x.fillStyle = g; x.fillRect(0, 0, w, w); x.restore();
  }
  // one portrait made each time (the latest asked first), the next a moment later; none while the 3D is drawing the body's world —
  // its people use the rows of the body then: asked again, it is made back in the god's view
  function make() {
    timer = 0; const R3 = G.Realm; if (!asks.size) return;
    if (R3.on) { asks.clear(); return; }
    const ks = [...asks.keys()], k = ks[ks.length - 1], v = asks.get(k); asks.delete(k);
    if (!memo.has(k)) {
      let ok = false; const t0 = performance.now(); try { ok = R3.ready(); } catch (e) { ok = false; }
      if (!ok || !G.Body3D.ready || !(G.People3D.skin && G.People3D.skin())) { RT.failed = R3.failed || G.Body3D.failed || 'o corpo do 3D não está pronto'; asks.clear(); return; }
      let pic = null; try { pic = shoot(v); } catch (e) { RT.failed = String((e && e.message) || e); }
      const ms = performance.now() - t0; if (!RT.made) RT.first = ms; RT.ms = ms;
      if (pic) { RT.made++; memo.set(k, pic); last.set(v.id, pic); while (memo.size > CAP) memo.delete(memo.keys().next().value); while (last.size > CAP) last.delete(last.keys().next().value); }
      else { asks.clear(); return; }
    }
    const pic = memo.get(k);
    for (let i = waiting.length - 1; i >= 0; i--) { const [c, kk, dead] = waiting[i]; if (kk !== k && c.isConnected) continue; waiting.splice(i, 1); if (kk === k && c.isConnected) paint(c, pic, dead); }
    if (asks.size) timer = setTimeout(make, 30);
  }
  // the studio: the body put alone in the first row of the 3D's skin, far from the world, seen by a camera of its own that sees only
  // the studio's layer — the body and two lights of its own —, drawn on the 3D's own canvas (its light and colours: the curve of the
  // 3D's picture) and copied off at once; everything of the 3D given back as it was
  function shoot(v) {
    const R3 = G.Realm, THREE = R3.three(), rd = R3.renderer(), sc = R3.scene(), B3 = G.Body3D, P3 = G.People3D, An = G.Anim3D;
    if (!cam) {
      cam = new THREE.PerspectiveCamera(24, 1, 0.05, 30); cam.layers.set(LAYER);
      const sky = new THREE.HemisphereLight(0xf6efe4, 0x4a3c30, 1), lamp = new THREE.DirectionalLight(0xfff1de, 1), rimL = new THREE.DirectionalLight(0xc8d8ff, 1);
      lights = [sky, lamp, rimL]; for (const l of lights) { l.layers.set(LAYER); sc.add(l); }
      for (const l of [lamp, rimL]) { l.target.position.set(STUDIO[0], STUDIO[1] + 1.4, STUDIO[2]); l.target.layers.set(LAYER); sc.add(l.target); }
      vp = new THREE.Vector4(); sc4 = new THREE.Vector4(); cc = new THREE.Color();
    }
    B3.layer(LAYER);
    // (the person as the 3D portrays them, standing still, the face at rest with what lasts on it — the grief's brows and tears, the
    // wound's grimace, the sickness' pallor —; the level of the nearest)
    const L = P3.look(v); L.lod = 0;
    const pose = An.POSE0(); // (the face's channels written by the face's own writer, the anim-rosto: rule 216)
    if (G.Rosto && An.faceMix) An.faceMix({}, { id: v.id, clock: 0, humor: 0 }, pose, An.MOOD && An.MOOD.calm, { pz: porte(v) }, 1);
    L.face = An.faceOf ? An.faceOf(pose, L) : null;
    const [X, Y, Z] = STUDIO, yaw = 0; const R = P3.rig(X, Y, Z, yaw, pose, L);
    B3.begin(); B3.put(0, R, pose, L, X, Y, Z); B3.end();
    // (the eye: before the face, a little to one side, the head and the shoulders in the picture — a child's smaller head too)
    const h = new THREE.Vector3().setFromMatrixPosition(R[B3.HEAD]); const s = L.s || 1;
    const ty = h.y + 0.08 * s, d = 1.2 * s, a = 0.38;
    cam.position.set(X + Math.cos(a) * d, ty + 0.03 * s, Z + Math.sin(a) * d); cam.lookAt(X, ty, Z); cam.updateProjectionMatrix();
    lights[1].position.set(X + 2.2, Y + 3.2, Z + 2.6); lights[2].position.set(X - 2.4, Y + 2.2, Z - 1.8);
    // (the studio's light under the 3D's exposure of the hour — the sky's, never written here: the lamps are dimmed by it, so the
    // picture comes out as at an exposure of one, by day or by night)
    const ex = rd.toneMappingExposure > 0 ? rd.toneMappingExposure : 1; [1.15, 1.7, 0.55].forEach((q, i) => { lights[i].intensity = q / ex; });
    // (what the 3D has as it is, kept and given back)
    const pr = rd.getPixelRatio(), keepRT = rd.getRenderTarget(); rd.getViewport(vp); rd.getScissor(sc4); const sct = rd.getScissorTest();
    rd.getClearColor(cc); const ca = rd.getClearAlpha(), ac = rd.autoClear, rim = B3.rim.value, smu = rd.shadowMap.autoUpdate;
    const cvs = rd.domElement, px = Math.min(SIZE, cvs.width, cvs.height); if (px < 32) { B3.clear(); return null; }
    let out = null;
    try {
      rd.setRenderTarget(null); rd.setViewport(0, 0, px / pr, px / pr); rd.setScissor(0, 0, px / pr, px / pr); rd.setScissorTest(true);
      rd.setClearColor(0x3a2c20, 1); rd.autoClear = true; B3.rim.value = 0.22 / ex; rd.shadowMap.autoUpdate = false;
      rd.render(sc, cam);
      out = document.createElement('canvas'); out.width = out.height = SIZE;
      out.getContext('2d').drawImage(cvs, 0, cvs.height - px, px, px, 0, 0, SIZE, SIZE); // (at once: the 3D's picture is kept only until the page is drawn)
      if (B3.broken(rd)) out = null;
    } finally {
      rd.setRenderTarget(keepRT); rd.setViewport(vp); rd.setScissor(sc4); rd.setScissorTest(sct); rd.setClearColor(cc, ca); rd.autoClear = ac;
      B3.rim.value = rim; rd.shadowMap.autoUpdate = smu; B3.clear();
    }
    return out;
  }
})(window.G);
