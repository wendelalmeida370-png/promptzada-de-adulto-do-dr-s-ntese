// Testa "Continuar" a partir de cada checkpoint gravado pelo playthrough.
import fs from 'fs';
import { open } from './harness.mjs';
const snaps = JSON.parse(fs.readFileSync(new URL('./snapshots.json', import.meta.url)));
const T = await open();
const { page } = T;
let bad = 0;
for (const snap of snaps) {
  T.errors.length = 0;
  await page.evaluate((s) => { localStorage.setItem('casa-se-lembra/save/v1', JSON.stringify(s)); }, snap);
  await page.reload();
  await page.waitForFunction(() => !!window.__casa, null, { timeout: 30000 });
  await page.evaluate(() => { const g = window.__casa; g.testMode = true; g.ui.fast = true; g.input.locked = true; });
  const enabled = await page.evaluate(() => !document.getElementById('btn-continue').disabled);
  await page.click('#btn-continue');
  await page.evaluate(() => { window.__casa.input.locked = true; });
  for (let i = 0; i < 8; i++) { await T.step(0.5); await page.waitForTimeout(30); }
  const st = await T.state();
  const extra = await page.evaluate(() => { const g = window.__casa; return { lili: g.cats.lili.enabled ? g.cats.lili.mode : 'off', clown: g.clown.model.visible, fix: g.world.fixtures.filter((f) => f.on).length, tv: g.tv.mode, sections: [...g.world.sections.keys()].length }; });
  const ok = enabled && st.phase === snap.story.phase && T.errors.length === 0;
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'ERR'} ${snap.id.padEnd(15)} fase=${st.phase} obj=${st.obj} ato=${st.act} ent=${st.ent} pos=${st.pos} ${JSON.stringify(extra)}` + (T.errors.length ? '\n   ' + T.errors.join('\n   ') : ''));
  if (['a2_start', 'a3_up', 'a3_climax', 'a3_basement'].includes(snap.id)) await T.shot('save_' + snap.id, 500);
}
console.log(bad ? `${bad} checkpoint(s) com problema` : 'todos os checkpoints retomam sem erro');
await T.close();
