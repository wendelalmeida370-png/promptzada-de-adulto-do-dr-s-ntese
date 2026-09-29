// Ato 3: entrar pela porta do banheiro leva ao quarto roxo (e vice-versa).
import fs from 'fs';
import { open } from './harness.mjs';
const snaps = JSON.parse(fs.readFileSync(new URL('./snapshots.json', import.meta.url)));
const snap = snaps.find((s) => s.id === 'a3_up');
const T = await open();
const { page } = T;
await page.evaluate((s) => localStorage.setItem('casa-se-lembra/save/v1', JSON.stringify(s)), snap);
await page.reload();
await page.waitForFunction(() => !!window.__casa);
await page.evaluate(() => { const g = window.__casa; g.testMode = true; g.ui.fast = true; g.input.locked = true; });
await page.click('#btn-continue');
await page.evaluate(() => { const g = window.__casa; g.input.locked = true; g.settings; });
await T.step(1);
// anda do corredor para dentro do banheiro
await page.evaluate(() => { const g = window.__casa; g.world.doors.get('porta_banheiro').set(1); g.player.teleport(5.0, 7.2, Math.PI, 0); g.input.down.add('KeyW'); });
let r = null;
for (let i = 0; i < 20; i++) { await T.step(0.1); r = await page.evaluate(() => { const g = window.__casa; return { x: g.player.pos.x, z: g.player.pos.z, room: g.world.roomAt(g.player.pos.x, g.player.pos.z) }; }); if (r.room === 'roxo') break; }
await page.evaluate(() => window.__casa.input.down.delete('KeyW'));
console.log((r.room === 'roxo' ? 'OK ' : 'ERR') + ' banheiro -> quarto roxo', JSON.stringify(r));
await T.shot('swap_1', 400);
// e do quarto roxo para o banheiro
await page.evaluate(() => { const g = window.__casa; g.world.doors.get('porta_roxo').set(1); g.player.teleport(5.41, 7.2, 0, 0); g.input.down.add('KeyW'); });
for (let i = 0; i < 20; i++) { await T.step(0.1); r = await page.evaluate(() => { const g = window.__casa; return { x: g.player.pos.x, z: g.player.pos.z, room: g.world.roomAt(g.player.pos.x, g.player.pos.z) }; }); if (r.room === 'banheiro') break; }
await page.evaluate(() => window.__casa.input.down.delete('KeyW'));
console.log((r.room === 'banheiro' ? 'OK ' : 'ERR') + ' quarto roxo -> banheiro', JSON.stringify(r));
// saindo do banheiro para o corredor NÃO troca
await page.evaluate(() => { const g = window.__casa; g.player.teleport(5.01, 8.6, 0, 0); g.input.down.add('KeyW'); });
for (let i = 0; i < 25; i++) { await T.step(0.1); r = await page.evaluate(() => { const g = window.__casa; return { x: g.player.pos.x, z: g.player.pos.z, room: g.world.roomAt(g.player.pos.x, g.player.pos.z) }; }); if (r.z < 7.3) break; }
await page.evaluate(() => window.__casa.input.down.delete('KeyW'));
console.log((r.room === 'corredor' ? 'OK ' : 'ERR') + ' banheiro -> corredor (sem troca)', JSON.stringify(r));
console.log('erros:', T.errors.length ? T.errors.join('\n') : 'nenhum');
await T.close();
