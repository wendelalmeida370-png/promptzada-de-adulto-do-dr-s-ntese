// Screenshots de cada cômodo para revisão visual.
import { open, OUT } from './harness.mjs';
const T = await open();
await T.page.click('button[data-act="new"]');
await T.step(30);
console.log(JSON.stringify(await T.state()));
await T.shot('10_start');
const views = [
  ['11_sala_tv', 3.4, 3.2, 0, 1.3, 2.8],
  ['12_sala_entrada', 2.5, 2.0, 2.0, 1.2, 8],
  ['13_sala_varanda', 2.2, 6.5, 2.0, 1.3, -1],
  ['14_cozinha', 0.6, 5.85, -3, 1.3, 5.85],
  ['15_servico', -1.2, 8.3, -2.2, 1.0, 10],
  ['16_corredor', 3.9, 7.2, 11, 1.3, 7.2],
  ['17_roxo', 5.5, 6.3, 6.5, 1.2, 3.8],
  ['18_meninos', 8.8, 6.3, 7.8, 1.1, 4.0],
  ['19_banheiro', 5.0, 7.9, 5.8, 1.1, 9.8],
];
await T.ev(() => { const g = window.__casa; g.phone.toggleFlashlight(true); g.world.fixtures.forEach((f) => { f.on = true; }); });
for (const [n, x, z, tx, ty, tz] of views) {
  await T.ev(([x, z]) => { const g = window.__casa; ['porta_roxo', 'porta_meninos', 'porta_banheiro'].forEach((id) => g.world.doors.get(id).set(1)); }, [x, z]);
  await T.look(x, z, tx, ty, tz);
  await T.step(0.5);
  await T.look(x, z, tx, ty, tz);
  await T.shot(n, 800);
}
console.log(T.errors.slice(0, 20).join('\n'));
await T.close();
