// Revisão visual: carrega checkpoints e fotografa sempre as mesmas cenas (para comparar ajustes de visual).
// Uso: node tests/look.mjs [prefixo]
import fs from 'fs';
import { open } from './harness.mjs';
const PFX = process.argv[2] || 'look';
const snaps = JSON.parse(fs.readFileSync(new URL('./snapshots.json', import.meta.url)));
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
const load = async (id, setup) => {
  const s = snaps.find((x) => x.id === id);
  await G((s) => { localStorage.setItem('casa-se-lembra/save/v1', JSON.stringify(s)); }, s);
  await page.reload({ timeout: 120000 });
  await page.waitForFunction(() => !!window.__casa, null, { timeout: 120000 });
  await G(() => { const g = window.__casa; g.testMode = true; g.ui.fast = true; g.input.locked = true; });
  await page.click('#btn-continue');
  await G(() => { const g = window.__casa; g.input.locked = true; g.flags.noDrain = true; g.settings.storyMode = true; g.story.timers = []; g.entity.hide(); if (g.ui.overlay) g.ui.closeOverlay(); document.getElementById('toast').style.display = 'none'; document.getElementById('notify').style.display = 'none'; });
  await T.step(1.5);
  if (setup) await G(setup);
};
const shot = async (name, x, z, tx, ty, tz, flash = false) => {
  await G(([x, z, tx, ty, tz, flash]) => { const g = window.__casa; g.phone.flashlight = flash; g.phone.battery = 90; }, [x, z, tx, ty, tz, flash]);
  await T.look(x, z, tx, ty, tz);
  await T.step(0.6);
  await T.look(x, z, tx, ty, tz);
  await T.shot(PFX + '_' + name, 350);
};
await load('a1_video');
await shot('a1_sala', 3.4, 5.6, 0.4, 1.0, 2.6);
await shot('a1_corredor', 4.8, 7.2, 11.0, 1.2, 7.2);
await shot('a1_sala_lanterna', 2.6, 4.8, 0.3, 0.9, 1.6, true);
await load('a2_start');
await shot('a2_escuro_lanterna', 1.6, 3.2, 0.3, 1.2, 2.8, true);
await shot('a2_cozinha_lanterna', 1.2, 6.0, -1.6, 1.1, 5.2, true);
await load('a3_up');
await shot('a3_corredor', 8.5, 7.2, 12.6, 1.2, 7.2, true);
await shot('a3_banheiro', 5.2, 8.2, 6.4, 1.2, 9.4, true);
await load('a3_basement');
await shot('porao', 112.3, 13.5, 112.3, -1.8, 18.0);
await load('a3_antes');
await shot('antes', 203.0, 0.6, 203.2, 1.1, 5.8, true);
console.log(T.errors.join('\n') || 'sem erros');
await T.close();
