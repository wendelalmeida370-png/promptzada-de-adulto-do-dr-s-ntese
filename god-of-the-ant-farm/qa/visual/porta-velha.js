// porta-velha: um save de antes do L-209 aberto pelo código de agora. Lá, a porta da frente de um prédio de trabalho ia no
// meio da frente, diante de uma casa aberta ou não; aqui a planta a põe diante da casa aberta do registro, e a porta muda de
// lugar num save que já existe. O save (qa/save-l209.json) foi feito pelo qa/gera-save-l209.js na árvore do 41522ca: um
// mercado de 2×2 com a casa da frente do lado S fechada por um muro e a porta de então diante dele; dentro, o corpo encarnado
// um passo atrás da porta velha e uma pessoa que trabalha no mercado — um save guarda quem está dentro na porta de então,
// fora —; a porta aberta por alguém; uma banca aberta. As provas:
//   1. ao abrir, a porta de um registro de antes julgada como a virada a julga (In.migrate): a porta da frente diante de um
//      chão que se anda — a planta a pôs diante da casa aberta, ou a regra a levou a um lado onde a entrada cabe —; a das
//      pessoas (Vg.door) é a da planta
//   2. o estado das portas: a que alguém abriu, aberta ainda, pelo mesmo índice; nenhuma porta guardada que a planta não tem
//   3. quem estava dentro: o corpo — num lugar onde a planta nova o deixa ficar, ou posto para fora pela porta nova, nunca
//      numa parede —, e sai andando pela porta nova; a pessoa do mundo, que o save pôs na porta de então, num chão que se
//      anda, e a porta por onde ela entra e sai do mercado é a nova
//   4. a banca do mercado: o lugar do vendedor e o do freguês num chão que se anda, e a fila dela
//   5. o verificador limpo; salvar e carregar e a virada do dia não mudam a porta; nenhum erro de módulo
//   node qa/visual/porta-velha.js
const fs = require('fs'); const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | porta-velha ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const RDT = 1 / 30; const IN = G.Avatar.input;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
G.Main.openSave(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'save-l209.json'), 'utf8')), '');
const S = G.S, W = G.W, In = G.Interiors, Sp = G.Space, TL = Sp.TILE; In.uncache();
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => (q.sev <= 2 || q.sys === 'int') && !bad0.has(q.sys + '|' + q.msg));
const body = S.avatar && S.villagers.get(S.avatar.id); const B = body && S.buildings.get(body.inside);
if (!B) { ok('o save', false, `sem o corpo dentro do mercado (avatar ${JSON.stringify(S.avatar)})`); process.exit(1); }
// (the one who was inside: the save kept them by the market — at its door of then, a stride out of its lot —, as it keeps
// everyone who is inside a building)
const gap = v => Math.max(B.x - v.x, v.x - (B.x + B.w), B.y - v.y, v.y - (B.y + B.h), 0);
const guest = [...S.villagers.values()].filter(v => v !== body && !v.inside && gap(v) < 1 && !(S.biz || []).some(z => z.owner === v.id)).sort((a, c) => gap(a) - gap(c) || a.id - c.id)[0];
const near = (a, b) => !!a && !!b && Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

// ---- 1. the plan: the front door before ground one walks; the people's door the plan's ----
const p = Sp.planNow(B); const e = p.entrance; const out = [B.x + e.out[0] / TL, B.y + e.out[1] / TL];
const pd = In.planDoor(B), vd = G.Vg.door(B); const last = B.ip.h[B.ip.h.length - 1];
ok('1. a porta diante de um chão que se anda', B.ip.v === 2 && W.walkableXY(out[0], out[1]) && near(pd, out) && near(vd, out) && In.entrySaid(B) === true,
  `${B.type}#${B.id}: no save, S/1 com a porta diante do muro; ao abrir, ${B.ip.s}/${B.ip.o} r${B.ip.r} (o último fato ${JSON.stringify(last)}), a porta da frente ${W.walkableXY(out[0], out[1]) ? 'diante de um chão que se anda' : 'DIANTE DE UM CHÃO QUE NÃO SE ANDA'}; a porta das pessoas ${near(vd, out) ? 'é a da planta' : `é outra (${vd.map(n => n.toFixed(2))})`}; a palavra da virada ${In.entrySaid(B)}`);

// ---- 2. the doors' states: the one someone opened still open, by the same number; no door kept that the plan lacks ----
const st = In.state(B); const opened = Object.keys(B.ip.dr || {}).map(Number); const missing = opened.filter(id => !p.doors[id]);
ok('2. o estado das portas', In.doorState(B, e.door).state === 'aberta' && !missing.length && Object.values(st.doors).every(d => d && d.state),
  `a porta da frente (${e.door}) ${In.doorState(B, e.door).state} por ${In.doorState(B, e.door).by}; guardadas ${JSON.stringify(B.ip.dr)}, ${missing.length ? 'SEM PORTA NA PLANTA: ' + missing.join(',') : 'todas na planta'}; ${Object.keys(st.doors).length} portas com estado`);

// ---- 3. who was inside: the body and one of the world's people ----
{ // (the world's step: the body where the new plan lets it be, or out by the new door — never in a wall)
  // (the one of the world who was inside: the save keeps them at the door of then — outside, on ground one walks —, and
  // the door they go in and out of the market by is the new one)
  const g0 = guest ? [guest.x, guest.y, guest.inside] : null;
  for (let n = 0; n < 6; n++) god(() => G.debug.step(0.1));
  const lv = S.avatar ? S.avatar.lv : undefined; const ins = body.inside ? Sp.indoor(body.x * TL, body.y * TL, lv, B.id) : null;
  const where = body.inside ? (ins && ins.b === B && ins.walk ? 'dentro, onde a planta nova anda' : 'DENTRO NUMA PAREDE') : (near([body.x, body.y], vd) ? 'fora, pela porta nova' : W.walkableXY(body.x, body.y) ? 'fora, num chão que se anda' : 'FORA NUM CHÃO QUE NÃO SE ANDA');
  const okIn = body.inside ? !!(ins && ins.b === B && ins.walk) : W.walkableXY(body.x, body.y);
  // (and out on its feet, as a player goes: to the door's middle and a stride out — the new door)
  let outOk = !body.inside, passed = null;
  if (body.inside) {
    G.Avatar.attach(body, 0); const h = p.holes.find(q => q.door === e.door && q.kind !== 'janela'); const w = p.walls[h.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
    const D = [B.x * TL + w.a[0] + (w.b[0] - w.a[0]) * h.at / L, B.y * TL + w.a[1] + (w.b[1] - w.a[1]) * h.at / L]; const O = [out[0] * TL, out[1] * TL];
    const ul = Math.hypot(O[0] - D[0], O[1] - D[1]) || 1, u = [(O[0] - D[0]) / ul, (O[1] - D[1]) / ul]; // (out of the door)
    const pts = [[D[0] - u[0] * 1.2, D[1] - u[1] * 1.2], D, [D[0] + (O[0] - D[0]) * 0.6, D[1] + (O[1] - D[1]) * 0.6]];
    for (const q of pts) for (let n = 0; n < 300; n++) { const s = G.Avatar.state(); const dx = q[0] - s.X, dz = q[1] - s.Z; if (Math.hypot(dx, dz) < 0.15) break; IN.camYaw = Math.atan2(dz, dx); IN.mx = 0; IN.mz = 1; s.yaw = IN.camYaw; frame(); if (!body.inside && passed === null) passed = [body.x, body.y]; }
    IN.mz = 0; for (let n = 0; n < 6; n++) frame(); outOk = !body.inside && !!passed && Math.hypot(passed[0] * TL - D[0], passed[1] * TL - D[1]) < h.w / 2 + 1.2;
  }
  ok('3. o corpo que estava dentro', okIn && outOk, `${body.name}#${body.id}: ${where}; ${outOk ? 'saiu andando pela porta nova' : `NÃO SAIU pela porta nova (dentro ${body.inside}, em ${body.x.toFixed(2)},${body.y.toFixed(2)})`}`);
  if (S.avatar) G.Possess.release('deus');
  ok('3. a pessoa que estava dentro', !!guest && !g0[2] && W.walkableXY(g0[0], g0[1]) && near(G.Vg.door(B), out),
    guest ? `${guest.name}#${guest.id}: ao abrir, ${g0[2] ? 'DENTRO' : 'fora'}, em ${g0[0].toFixed(2)},${g0[1].toFixed(2)} — a porta de então —, ${W.walkableXY(g0[0], g0[1]) ? 'num chão que se anda' : 'NUM CHÃO QUE NÃO SE ANDA'}; a porta por onde ela entra e sai ${near(G.Vg.door(B), out) ? 'é a nova' : 'NÃO é a nova'}` : 'ninguém junto do mercado no save');
}

// ---- 4. the market's stall: where the seller and the buyer stand, on ground one walks; its line ----
{ const z = (S.biz || []).find(q => q.b === B.id); const sp = z && G.Biz.spots(z); const ln = z && G.Biz.lineOf(z);
  ok('4. a banca do mercado', !!z && !!sp && W.walkableXY(sp.seller[0], sp.seller[1]) && W.walkableXY(sp.buyer[0], sp.buyer[1]) && !!ln,
    z ? `a banca #${z.id} (lugar ${z.slot}): o vendedor em ${sp.seller.map(n => n.toFixed(2))}, o freguês em ${sp.buyer.map(n => n.toFixed(2))}, ${W.walkableXY(sp.seller[0], sp.seller[1]) && W.walkableXY(sp.buyer[0], sp.buyer[1]) ? 'num chão que se anda' : 'NUM CHÃO QUE NÃO SE ANDA'}; a fila de ${ln ? ln.n : '?'}` : 'NENHUMA banca no mercado'); }

// ---- 5. the checker; save and load, and the turn of the day: the door where it is ----
{ const b1 = vbad(); const r0 = JSON.stringify([B.ip.s, B.ip.o, B.ip.r]); M.salvarCarregar(); In.uncache(); const B2 = S0().buildings.get(B.id);
  god(() => In.onNewDay()); In.uncache(); const p2 = Sp.planNow(B2); const o2 = [B2.x + p2.entrance.out[0] / TL, B2.y + p2.entrance.out[1] / TL]; const b2 = vbad();
  ok('5. o verificador; salvar e carregar e a virada', !b1.length && !b2.length && JSON.stringify([B2.ip.s, B2.ip.o, B2.ip.r]) === r0 && near(o2, out),
    `${b1.length || b2.length ? [...b1, ...b2].slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; depois de salvar e carregar e da virada, ${B2.ip.s}/${B2.ip.o} r${B2.ip.r}, a porta ${near(o2, out) ? 'onde estava' : 'MUDOU'}`); }
function S0() { return G.S; }
const er = M.erros(); ok('sem erros', M.limpo(), `módulos ${JSON.stringify(er.mod)}; console ${er.console.slice(0, 2).join(' | ') || 'limpo'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
