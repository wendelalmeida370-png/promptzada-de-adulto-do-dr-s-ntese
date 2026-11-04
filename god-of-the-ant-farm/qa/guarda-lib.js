// guarda-lib: um campo guardado de verdade para as provas (D-121) — a do C (escala.js e21) e as do V (visual/forma-deus.js k,
// visual/forma-deus-fotos.js 8). Pura: nada de node dentro dela — a fonte de guarda() vai também ao navegador:
//   Node:       const { guarda } = require('./guarda-lib.js'); const g = guarda(G);              // { set, r, provocado } ou null
//   navegador:  page.evaluate(src => (0, eval)('(' + src + ')')(G), require('./guarda-lib.js').guarda.toString())
// A guarda é sempre a do jogo (V.reservaDia, que escolhe o lote e o põe no set.urb.res); a prova só arruma o mundo para ela:
// a capital no nível da guarda, e — onde a terra não serve («provoca», ou nenhuma capital guardou) — um chão aplainado como o
// deus aplaina (o S.H, G.Relief.fixArea, o mapa avisado), seco, sem prédio, sem muro nem estrada, perto do meio da capital.
'use strict';
// guarda(G, { lotes, provoca, fora }) → { set: id, r: G.Village.reserva(set), provocado: 0|1, tier: o nível de antes } ou null.
// lotes: quantos lotes do degrau, lado a lado, o chão aplainado tem (o maior degrau da obra que acha chão, senão o seguinte);
// provoca: aplainar antes de pedir a guarda, mesmo que a terra sirva (a prova que não pode depender de onde a terra sobra);
// fora: os ids das cidades que não servem (a outra capital do e21)
function guarda(G, o) {
  o = o || {}; const S = G.S, V = G.Village, N = G.N, T = G.T, VV = N + 1; if (!S || !V || !V.reservaDia || !V.resWork) return null;
  const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
  const pop = new Map(); for (const v of S.villagers.values()) pop.set(v.set, (pop.get(v.set) || 0) + 1);
  const caps = [...new Set([...S.factions.values()].map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].filter(s => V.resWork(s) && !(o.fora || []).includes(s.id))
    .sort((a, b) => (pop.get(b.id) || 0) - (pop.get(a.id) || 0) || a.id - b.id);
  const ask = set => { const t0 = set.tier || 0; if (t0 < V.RES_TIER) set.tier = V.RES_TIER; if (set.urb) set.urb.resGone = null; const r = sim(() => V.reservaDia(set)); if (!r) set.tier = t0; return r ? { set: set.id, r: V.reserva(set), tier: t0 } : null; };
  // (the ground k lots of n need side by side, two tiles between, with their ring and two tiles of ramp round: the lots dry, no
  // building on them but the town's own fields, no wall, no highway, no fire; the ring and the ramp with no building at all —
  // the water beside may be, as by any lot —; no other town's kept lot; within the town's radius and RES_REACH, the gentlest
  // first — the least to lay flat —, then the nearest the town's middle)
  const FIELDS = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 };
  const room = (set, n, k) => {
    const w = k * n + (k - 1) * 2 + 6, h = n + 6; const R = Math.round(G.Urban ? G.Urban.radius(set, { w: n }, V.pop(set.id)) : 20) + V.RES_REACH;
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy); let best = null, bs = 1e9, bd = 1e9;
    const ok = (x0, y0) => {
      if (x0 < 2 || y0 < 2 || x0 + w > N - 2 || y0 + h > N - 2) return false;
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        const i = y * N + x; const lot = x >= x0 + 3 && x < x0 + w - 3 && y >= y0 + 3 && y < y0 + h - 3; const b = S.occ[i] && S.buildings.get(S.occ[i]);
        if (S.wall[i] || S.road[i] >= 3 || S.fire[i] > 0) return false;
        if (lot ? S.type[i] < T.SAND || (b && !(FIELDS[b.type] && b.set === set.id)) : !!b) return false;
      }
      return !V.resOver(set, 'muro', x0, y0, w, h, true);
    };
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x0 = cx + dx - (w >> 1), y0 = cy + dy - (h >> 1); const d = Math.hypot(dx, dy); if (d > R || !ok(x0, y0)) continue;
      const sl = G.W.slope(x0 + 3, y0 + 3, w - 6, h - 6); if (sl < bs || (sl === bs && d < bd)) { best = [x0, y0, w, h]; bs = sl; bd = d; }
    }
    return best;
  };
  // (the god lays the lots flat at their mean height, their ring with them, and the two tiles round as a ramp to the ground as it
  // was — two thirds, one third —, leaving the water's banks as they are: the relief within the podium, no cliff in the ring, the
  // town's streets reaching it; the map told, as civicos.js lays a lot raised from the sea)
  const flat = ([x0, y0, w, h]) => {
    const wet = (vx, vy) => { for (let ty = vy - 1; ty <= vy; ty++) for (let tx = vx - 1; tx <= vx; tx++) if (tx >= 0 && ty >= 0 && tx < N && ty < N && S.type[ty * N + tx] < T.SAND) return true; return false; };
    let sum = 0, k = 0; for (let vy = y0 + 3; vy <= y0 + h - 3; vy++) for (let vx = x0 + 3; vx <= x0 + w - 3; vx++) { sum += S.H[vy * VV + vx]; k++; }
    const m = sum / k; const L0x = x0 + 3, L1x = x0 + w - 3, L0y = y0 + 3, L1y = y0 + h - 3;
    for (let vy = y0; vy <= y0 + h; vy++) for (let vx = x0; vx <= x0 + w; vx++) {
      const d = Math.max(L0x - vx, vx - L1x, L0y - vy, vy - L1y, 0); const q = vy * VV + vx;
      if (d > 0 && wet(vx, vy)) continue; // (the lots' own corners always; round them, never a bank)
      S.H[q] = d <= 1 ? m : d === 2 ? S.H[q] + (m - S.H[q]) * 2 / 3 : S.H[q] + (m - S.H[q]) / 3;
    }
    G.Relief.fixArea(x0 - 2, y0 - 2, x0 + w + 2, y0 + h + 2); S.typeVer = (S.typeVer || 0) + 1; G.W.invalidateLand(); G.W.touchWalk();
  };
  if (!o.provoca) for (const set of caps) { if (V.reserva(set)) return { set: set.id, r: V.reserva(set), tier: set.tier || 0, provocado: 0 }; const g = ask(set); if (g) return Object.assign(g, { provocado: 0 }); }
  // (the biggest step first, as the guard asks; where its ground is not to be had, the next)
  for (const set of caps) for (const st of V.resWork(set).steps.slice().reverse()) {
    const at = room(set, st.n, o.lotes || 1); if (!at) continue;
    flat(at); const g = ask(set); if (g) return Object.assign(g, { provocado: 1 }); break;
  }
  return null;
}
module.exports = { guarda };
