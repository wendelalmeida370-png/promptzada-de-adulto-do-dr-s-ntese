// vida-inv: what must always be true of the life that is seen while the game runs (22c, QA.more — loaded after qa/qa.js by the
// tests of the 3D; inlined into qa.js by qa/junta-inv.js):
//   · every act a person has now is shown: a gesture, a posture, or its family's pose in the society's vocabulary — none falls
//     to the plain stance but those the world means to stand (S3: a gap of the drawing, not of the world; D-602, D-603)
//   · the porte the reader gives is made of numbers in their range, and never of the look nor the people (S2; D-594)
//   · the face a person is posed with has the channels of G.Rosto, each in its range (S2; D-543, D-601)
//   · the view keeps nobody who is gone: a person of the view's memory is a person of the world (S3; D-591)
//   · inside a building drawn open, nobody drawn in a wall or a piece (S2), nor with the street's hat on under a roof or anything on
//     the head in bed (S3; P6, D-750, D-754)
//   · nobody drawn in the gesture of a thing not in the hands — the toast's cup, the bones, the cloth, the cups gathered, the plate (S2;
//     P6, D-796: never mimed)
//   · a baby in someone's arms — out of doors, or awake inside a building with who carries it — is drawn in no place of its own (S2;
//     the baby of the god's body stood alone on the way in, L-1908)
(function (G) {
  // (the acts that are a stance on purpose: the stance is their pose)
  const STAND = new Set(['', 'stand', 'idle', 'sleep', 'zzz', 'run', 'carry', 'haul', 'lift', 'drag', 'hold', 'carry2', 'arrange', 'give']);
  const inv = function (add, s) {
    const A = G.Anim3D, V3 = G.Vida3D; if (!A || !A.stateOf || !V3 || !s || !s.villagers) return;
    let n = 0;
    for (const v of s.villagers.values()) {
      if (v.act && !STAND.has(v.act) && !v.sleeping && !(v.task && v.task.type === 'swim')) { const st = A.stateOf(v, 0); if (st === 'idle' && ++n <= 3) add('vida', 3, `#${v.id}: o ato «${v.act}» sem pose no desenho (cai em «parado»)`); }
      const p = V3.porteOf(v, {}); for (const k of V3.PORTE) { const x = p[k], lo = k === 'confia' || k === 'manca' ? -1 : 0; if (!(x >= lo && x <= 1)) { add('vida', 2, `#${v.id}: o porte «${k}» fora da faixa (${x})`); break; } }
    }
    const P3 = G.People3D, R = G.Rosto; if (!P3 || !P3.visOf || !R) return;
    for (const w of P3.walkers || []) { const id = w[7]; const vs = P3.visOf(id); if (!vs) continue;
      if (!s.villagers.has(id)) add('vida', 3, `a vista desenha #${id}, que não está no mundo`);
      const F = vs.pose && vs.pose.face; if (!F) continue; if (F.length !== R.CH.length) { add('vida', 2, `#${id}: o rosto com ${F.length} canais (o G.Rosto tem ${R.CH.length})`); continue; }
      for (let i = 0; i < F.length; i++) if (!(F[i] >= R.LOW[i] && F[i] <= R.HIGH[i])) { add('vida', 2, `#${id}: o canal «${R.CH[i]}» do rosto fora da faixa (${F[i]})`); break; } }
    // (P6, D-750, D-754) inside a building drawn open nobody is drawn in a wall or a piece — standing or walking, but the step onto a
    // seat or off it and the flight of a stair (S2) —; nobody drawn with the street's hat on under a roof, nor anything on the head in
    // bed — the helmet of one at their post, the hood of an order, the signs of an office stay (S3)
    const In = G.Interiors, B3 = G.Build3D, Lk = G.Look3D, At = G.Atmos; if (!In || !B3 || !B3.isOpen) return;
    const BLOCK = [In.CELL.WALL, In.CELL.SOLID, In.CELL.LOW, In.CELL.VOID], TL = G.Space.TILE; let nw = 0, nh = 0, nb = 0, nm = 0;
    for (const w of P3.walkers || []) {
      const v = s.villagers.get(w[7]), vs = P3.visOf(w[7]); if (!v || !vs) continue;
      const o = vs.L && vs.L.out; const D = At && At.dress ? At.dress(v) : null;
      if (o && o.hatM && D && (v.inside > 0 || v.sleeping) && (D.bed || (['chapeu', 'gorro'].includes(o.hatM)) || ((o.hatM === 'elmo' || o.hatM === 'galea') && !D.duty)) && nh++ < 3) add('vida', 3, `#${v.id}: desenhado de «${o.hatM}» ${v.sleeping ? 'dormindo' : 'debaixo de um teto'}`);
      // (D-796: the gesture of a thing — a clip that holds one — drawn only with the thing in that hand, G.Inv.held: never mimed)
      for (const k of [vs.st, vs.ov]) { const C = k && G.Anim3D.CLIPS ? G.Anim3D.CLIPS[k] : null; if (!C || !C.item) continue; const h = C.item.hand === 'outra' ? 'outra' : 'mao';
        if (!(vs.L && vs.L.inv && vs.L.inv[h]) && nm++ < 3) add('vida', 2, `#${v.id}: desenhado no gesto «${k}» sem a coisa na mão`); }
      const ca = v.age < 2 && v.carrier ? s.villagers.get(v.carrier) : null; // (L-1908: the baby in arms, where its arms are)
      if (v.age < 2 && (v.carried || (ca && v.inside > 0 && ca.inside === v.inside && !ca.sleeping && !v.sleeping)) && nb++ < 3) add('vida', 2, `#${v.id}: bebê no colo de #${v.carrier} desenhado sozinho ${v.inside > 0 ? 'dentro de #' + v.inside : 'na rua'}`);
      if (!(v.inside > 0) || !B3.isOpen(v.inside) || vs.waySeat) continue;
      const b = s.buildings.get(v.inside), p = b && G.Space.planMade ? G.Space.planMade(b) : null; if (!p || !p.grid) continue;
      const pl = In.placeOf(v); if (pl && pl.it && (pl.it.spots[pl.q] || {}).on && !vs.way) continue; // (seated or lying on the piece: its place)
      const y = (vs.Y || 0) - G.Space.plinth(b).y0; let lv = -1, bd = 0.3; for (const l of p.levels) { const d = Math.abs(y - l.y); if (d < bd) { bd = d; lv = l.lv; } } if (lv < 0) continue; // (on a flight)
      const lx = vs.X - b.x * TL, lz = vs.Z - b.y * TL, n = p.grid.n, cx = Math.floor(lx / In.CS), cz = Math.floor(lz / In.CS), g = p.grid.lv[lv];
      if (g && cx >= 0 && cz >= 0 && cx < n && cz < n && BLOCK.includes(g[cz * n + cx]) && nw++ < 3) add('vida', 2, `#${v.id}: desenhado dentro de ${g[cz * n + cx] === In.CELL.WALL ? 'uma parede' : 'um móvel'} de ${b.type}#${b.id} (${lx.toFixed(2)}, ${lz.toFixed(2)}; ${vs.way ? 'no caminho ' + vs.way.kind : 'parado'})`);
    }
  };
  G.VidaInv = inv;
  if (typeof QA !== 'undefined' && QA.more) QA.more.push(inv);
})(window.G);
