// Testa e fotografa os gatos: rotina (senta, deita, se lambe, passeia), vir se esfregar, carinho, brilho dos olhos.
import { open } from './harness.mjs';
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FALHA') + ' ' + msg); if (!ok) fails++; };
await G(() => { const g = window.__casa; g.ui.fast = true; g.input.locked = true; });
await page.click('button[data-act="new"]');
await G(() => { window.__casa.input.locked = true; });
for (let i = 0; i < 80; i++) { await T.step(0.5); if (await G(() => window.__casa.story.phase === 'a1' && !window.__casa.cutscene)) break; }
await G(() => { const g = window.__casa; g.ui.closeOverlay && g.ui.overlay && g.ui.closeOverlay(); g.story.timers = []; });
const cat = (fn, a) => G(fn, a);
const view = async (name, act, extra) => {
  await G(([act]) => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, Math.PI * 0.8); b.mode = 'idle'; b.act = act; b.actT = 30; g.player.teleport(2.75, 5.75, 0, 0); const e = g.player.eye; g.player.yaw = Math.atan2(-(2.7 - e.x), -(6.9 - e.z)); g.player.pitch = Math.atan2(0.25 - e.y, Math.hypot(2.7 - e.x, 6.9 - e.z)); g.player.apply(); }, [act]);
  if (extra) await G(extra);
  await T.step(1.6);
  await T.shot('cat_' + name, 250);
};
await view('sit', 'sit');
await view('loaf', 'loaf');
await view('groom', 'groom');
// passeando
await G(() => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, 0); b.mode = 'idle'; b.act = 'wander'; b.target = { x: 1.6, z: 6.4 }; b.actT = 20; g.player.teleport(2.9, 5.2, 0, 0); const e = g.player.eye; g.player.yaw = Math.atan2(-(2.2 - e.x), -(6.7 - e.z)); g.player.pitch = -0.55; g.player.apply(); });
await T.step(0.7);
await T.shot('cat_walk', 250);
check(await G(() => window.__casa.cats.bento.speedNow > 0.2 || window.__casa.cats.bento.pos.x < 2.6), 'o Bento anda sozinho');
// rotina livre: em 60 s ele muda de atividade e sai do lugar
await G(() => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, 0); b.mode = 'idle'; g.player.teleport(9.0, 4.0, 0, 0); window.__acts = new Set(); window.__maxd = 0; });
for (let i = 0; i < 120; i++) { await T.step(0.5); await G(() => { const b = window.__casa.cats.bento; window.__acts.add(b.act); window.__maxd = Math.max(window.__maxd, Math.hypot(b.pos.x - 2.7, b.pos.z - 6.9)); }); }
const acts = await G(() => [...window.__acts].join(','));
check((await G(() => window.__acts.size)) >= 3, 'rotina variada em 60 s: ' + acts);
check((await G(() => window.__maxd)) > 0.4, 'passeou pela casa: ' + (await G(() => window.__maxd.toFixed(2))) + ' m');
check(await G(() => { const b = window.__casa.cats.bento; const r = window.__casa.world.roomAt(b.pos.x, b.pos.z); return !!r; }), 'continua dentro de um cômodo');
// vem se esfregar na perna
await G(() => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, 0); b.mode = 'idle'; b.act = 'approach'; b.actT = 8; g.player.teleport(2.7, 4.9, 0, 0); g.player.pitch = -0.9; g.player.yaw = Math.PI; g.player.apply(); });
let rubbed = false;
for (let i = 0; i < 30 && !rubbed; i++) { await T.step(0.3); rubbed = await G(() => window.__casa.cats.bento.act === 'rub'); }
check(rubbed, 'veio se esfregar na perna');
await T.step(0.8);
await G(() => { const g = window.__casa, b = g.cats.bento, e = g.player.eye; g.player.yaw = Math.atan2(-(b.pos.x - e.x), -(b.pos.z - e.z)); g.player.pitch = -1.0; g.player.apply(); });
await T.shot('cat_rub', 250);
check(await G(() => !!window.__casa.cats.bento.purr), 'ronrona se esfregando');
// carinho
await G(() => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, Math.PI); b.mode = 'idle'; b.act = 'sit'; b.actT = 30; g.player.teleport(2.7, 6.0, 0, 0); });
await T.step(0.5);
await G(() => { const g = window.__casa, b = g.cats.bento, e = g.player.eye, h = b.headWorld(); g.player.yaw = Math.atan2(-(h.x - e.x), -(h.z - e.z)); g.player.pitch = Math.atan2(h.y - 0.06 - e.y, Math.hypot(h.x - e.x, h.z - e.z)); g.player.apply(); });
await T.step(0.3);
const pr = await G(() => document.getElementById('prompt').textContent);
check(/carinho no Bento/.test(pr), 'prompt de carinho: ' + pr);
await G(() => window.__casa.interact());
await T.step(1.2);
check(await G(() => window.__casa.cats.bento.act === 'petted' && !!window.__casa.cats.bento.purr && window.__casa.flags.petted_bento), 'carinho: ronrona e fecha os olhos');
await T.shot('cat_petted', 250);
// correria: foge
await G(() => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, 0); b.mode = 'idle'; b.act = 'sit'; b.actT = 30; g.player.teleport(2.7, 5.4, 0, 0); g.player.yaw = Math.PI; g.player.apply(); g.input.down.add('KeyW'); g.input.down.add('ShiftLeft'); });
await T.step(0.35);
await G(() => { const g = window.__casa; g.input.down.delete('KeyW'); g.input.down.delete('ShiftLeft'); });
check(await G(() => ['flee', 'wary'].includes(window.__casa.cats.bento.act)), 'foge de correria: ' + await G(() => window.__casa.cats.bento.act));
// olhos brilhando na lanterna, no escuro
await G(() => { const g = window.__casa, b = g.cats.bento; b.place(2.7, 6.9, Math.PI); b.mode = 'idle'; b.act = 'sit'; b.actT = 30; g.player.teleport(2.7, 4.6, 0, 0); g.phone.flashlight = true; g.lightMul = 0.05; const e = g.player.eye, h = b.headWorld(); g.player.yaw = Math.atan2(-(h.x - e.x), -(h.z - e.z)); g.player.pitch = Math.atan2(h.y - e.y, Math.hypot(h.x - e.x, h.z - e.z)); g.player.apply(); });
await T.step(1.2);
await G(() => { const g = window.__casa, b = g.cats.bento, e = g.player.eye, h = b.headWorld(); g.player.yaw = Math.atan2(-(h.x - e.x), -(h.z - e.z)); g.player.pitch = Math.atan2(h.y - e.y, Math.hypot(h.x - e.x, h.z - e.z)); g.player.apply(); });
await T.step(0.4);
check(await G(() => window.__casa.cats.bento.shine > 0.3), 'olhos brilham na lanterna: ' + (await G(() => window.__casa.cats.bento.shine.toFixed(2))));
await T.shot('cat_eyeshine', 250);
await G(() => { window.__casa.lightMul = 1; });
// a Lili escondida não aceita carinho; seguindo, senta do seu lado
check(await G(() => !window.__casa.cats.lili.canPet()), 'a Lili escondida (ato 1) não sai pra carinho');
await G(() => { const g = window.__casa, l = g.cats.lili; l.place(3.5, 3.0, 0); l.mode = 'follow'; g.player.teleport(3.0, 4.5, 0, 0); g.phone.flashlight = false; });
for (let i = 0; i < 10; i++) await T.step(0.5);
check(await G(() => { const g = window.__casa, l = g.cats.lili; return Math.hypot(l.pos.x - g.player.pos.x, l.pos.z - g.player.pos.z) < 1.6; }), 'a Lili segue você');
for (let i = 0; i < 14; i++) await T.step(0.5);
check(await G(() => ['rub', 'sit'].includes(window.__casa.cats.lili.act)), 'parada perto dela, a Lili senta ou se esfrega: ' + await G(() => window.__casa.cats.lili.act));
await G(() => { const g = window.__casa, l = g.cats.lili, e = g.player.eye; g.player.yaw = Math.atan2(-(l.pos.x - e.x), -(l.pos.z - e.z)); g.player.pitch = -0.95; g.player.apply(); });
await T.shot('cat_lili', 300);
console.log('ERROS DE CONSOLE:', T.errors.length ? '\n' + T.errors.join('\n') : 'nenhum');
console.log(fails ? `${fails} falha(s)` : 'gatos: tudo OK');
await T.close();
process.exit(fails ? 1 : 0);
