// gera-save-l209: o save velho do qa/visual/porta-velha.js (L-209), feito pelo código de antes do L-209 — o 41522ca, quando
// a porta da frente das famílias de trabalho ia no meio da frente, diante de uma casa aberta ou não. Num mundo pequeno, um
// mercado de 2×2 fundado num lote que a mão do deus aplainou, com a casa da frente do lado S fechada por um muro (o
// registro: S, só a casa 0 aberta) e a porta da planta de então diante do muro — sem degraus, a regra de então a deixava
// ali —; dentro, o corpo encarnado um passo atrás da porta velha e uma pessoa que trabalha no mercado (o save a guarda na
// porta de então, como a todos que estão dentro); a porta aberta por alguém; uma banca aberta no mercado. Salvo logo depois.
// (o mundo do qa/visual/tres-node.js: o do nodemundo com os arquivos do 3D, o G.Possess e o corpo entre eles)
//   node qa/gera-save-l209.js SAIDA.json      (na árvore do 41522ca; o save gerado foi para qa/save-l209.json)
const fs = require('fs'); const path = require('path');
const { G, M } = require(path.join(__dirname, 'visual', 'tres-node.js')).load({ qa: false }); const In = G.Interiors, W = G.W, TL = G.Space.TILE;
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
M.novo({ seed: 9, type: 'ilha', size: 64, tribes: 1 }); M.viver(20);
const S = G.S, N = G.N; const set = [...S.settlements.values()].sort((a, c) => a.id - c.id)[0]; if (!set) throw new Error('sem povoado');
const D = G.BDEF.mercado; const free = (x, y) => W.inb(x, y) && !S.occ[W.idx(x, y)] && !S.treeAt[W.idx(x, y)] && !S.objAt[W.idx(x, y)] && W.walkable(W.idx(x, y));
const lot = (x, y) => { for (let yy = y - 1; yy <= y + D.h; yy++) for (let xx = x - 1; xx <= x + D.w; xx++) { const inner = xx >= x && xx < x + D.w && yy >= y && yy < y + D.h; if (inner ? !free(xx, yy) : !W.walkableXY(xx, yy)) return false; } return true; };
// (the god's hand on the ground: the lot and a tile round it level, at its middle's height — no steps before any door)
const flat = (x, y) => sim(() => { const h = S.H[(y + 1) * (N + 1) + x + 1]; for (let vy = y - 1; vy <= y + D.h + 1; vy++) for (let vx = x - 1; vx <= x + D.w + 1; vx++) S.H[vy * (N + 1) + vx] = h;
  G.Relief.fixArea(x - 3, y - 3, x + D.w + 2, y + D.h + 2); S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); });
// (the tile of the street the plan's entrance opens onto, along the side S: 0 or 1)
const frontK = b => { const sh = In.shellOf(b); const e = sh && sh.entrance; if (!e || !e.out) return -1; const X = Math.floor(b.x + e.out[0] / TL), Z = Math.floor(b.y + e.out[1] / TL); return Z === b.y + b.h ? X - b.x : -1; };
let B = null, wall = -1;
look: for (let r = 2; r < 20; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; if (!lot(x, y)) continue;
  flat(x, y); if (!lot(x, y)) continue;
  const i = W.idx(x + 1, y + D.h); sim(() => { S.wall[i] = 1; W.touchWalk(); }); // (a wall before the second tile of the front, S)
  const b = sim(() => G.Village.addBuilding('mercado', x, y, set.id, true));
  if (b.ip && b.ip.s === 'S' && b.ip.o === 1 && frontK(b) === 1) { B = b; wall = i; break look; }
  sim(() => { G.Village.removeBuilding(b); S.wall[i] = 0; W.touchWalk(); });
}
if (!B) throw new Error('nenhum lote serviu');
const p = In.plan(B); const e = p.entrance; const h = p.holes.find(q => q.door === e.door && q.kind !== 'janela'); const w = p.walls[h.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
const Dm = [w.a[0] + (w.b[0] - w.a[0]) * h.at / L, w.a[1] + (w.b[1] - w.a[1]) * h.at / L]; // (the door's middle, metres of the lot)
const adults = [...S.villagers.values()].filter(v => v.age >= 18 && v.age < 55 && !v.inside && G.Possess.can(v).ok).sort((a, c) => a.id - c.id);
const [body, guest, seller] = adults; if (!seller) throw new Error('gente de menos');
// (the body taken, and put inside, a stride behind the old door — where the plan of then has floor —, on the ground storey)
G.Possess.take(body); sim(() => { body.inside = B.id; body.x = B.x + Dm[0] / TL; body.y = B.y + (Dm[1] - 0.9) / TL; S.avatar.lv = 0; S.avatar.via = B.id; });
sim(() => { G.Vg.endTask(guest); guest.job = B.id; guest.inside = B.id; const d = G.Vg.door(B); guest.x = d[0]; guest.y = d[1]; }); // (one who works there, inside — a save keeps whoever is inside at the door of then)
sim(() => In.useDoor(B, e.door, 'abrir', guest));
const z = sim(() => G.Biz.open(seller, B));
const ins = G.Space.indoor(body.x * TL, body.y * TL, 0, B.id);
const str = G.Save.serialize(); fs.writeFileSync(process.argv[2] || path.join(__dirname, 'save-l209.json'), str);
console.log(`mercado#${B.id} em ${B.x},${B.y}: registro ${B.ip.s}/${B.ip.o} r${B.ip.r} ${B.ip.f}; a porta de então (${e.door}) no meio ${Dm.map(n => n.toFixed(2))} diante da casa 1, o muro na casa ${wall}; dentro o corpo ${body.name}#${body.id} (no chão da planta de então: ${ins ? `anda ${ins.walk}, casca ${ins.shell}` : 'fora'}) e ${guest.name}#${guest.id}; a porta ${In.doorState(B, e.door).state}; a banca ${z ? '#' + z.id : 'NENHUMA'} de ${seller.name}#${seller.id}; save ${(str.length / 1e3).toFixed(0)} kB; erros ${JSON.stringify(M.erros())}`);
