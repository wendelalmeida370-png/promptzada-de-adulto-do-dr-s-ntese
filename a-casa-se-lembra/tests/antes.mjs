// Testa o apartamento de antes e as regras do Morador de Antes, a partir do checkpoint "a3_up".
import fs from 'fs';
import { open } from './harness.mjs';
const snaps = JSON.parse(fs.readFileSync(new URL('./snapshots.json', import.meta.url)));
const snap = snaps.find((s) => s.id === 'a3_up');
if (!snap) { console.log('sem snapshot a3_up (rode o playthrough antes)'); process.exit(1); }
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FALHA') + ' ' + msg); if (!ok) fails++; };
const until = async (desc, fn, maxSec = 30, arg) => {
  for (let t = 0; t < maxSec; t += 0.25) { if (await G(fn, arg)) return true; await T.step(0.25); await page.waitForTimeout(15); }
  console.log('   (tempo esgotado: ' + desc + ')');
  return false;
};
await G((s) => { localStorage.setItem('casa-se-lembra/save/v1', JSON.stringify(s)); }, snap);
await page.reload();
await page.waitForFunction(() => !!window.__casa, null, { timeout: 30000 });
await G(() => { const g = window.__casa; g.testMode = true; g.ui.fast = true; g.input.locked = true; });
await page.click('#btn-continue');
await G(() => { const g = window.__casa; g.input.locked = true; g.flags.noDrain = true; });
await T.step(1);
// o Inquilino fica quieto durante este teste
await G(() => { const g = window.__casa; g.story.startEndlessHunt = () => {}; g.entity.hide(); });
// 1. o registro sumiu do chuveiro: marcas de mão
await T.look(5.9, 9.3, 6.55, 1.2, 9.3);
await T.use();
await until('fala das marcas', () => window.__casa.flags.sawHandprint, 5);
check(await G(() => window.__casa.world.get('handprints_house').visible), 'marcas de mão visíveis no ato 3');
// 2. porta de entrada (depois da fala das marcas terminar)
await until('livre', () => !window.__casa.cutscene && !window.__casa.ui.overlay && !document.getElementById('subtitle').classList.contains('show'), 20);
await T.step(1);
let id = await T.look(0.97, 7.2, 0.97, 1.1, 8.0);
check(id === 'porta_entrada', 'mira na porta de entrada: ' + id);
const prompt = await G(() => document.getElementById('prompt').textContent);
check(/música/.test(prompt), 'prompt da porta fala da música: ' + prompt);
await T.use();
await T.step(1.5);
check(await G(() => window.__casa.flags.antesOpen && window.__casa.world.sections.has('antes')), 'apartamento de antes construído');
// atravessa
await G(() => { const g = window.__casa; g.player.teleport(0.97, 7.9, Math.PI, 0); });
for (let i = 0; i < 12; i++) { await G(() => { const g = window.__casa; g.player.pos.z += 0.03; }); await T.step(0.05); }
check(await G(() => window.__casa.player.pos.x > 150), 'atravessou para o apartamento de antes');
await until('objetivo antes', () => window.__casa.story.objId === 'antes', 10);
check(await G(() => window.__casa.story.objId === 'antes'), 'objetivo: pegar o registro (' + await G(() => window.__casa.story.objId) + ')');
check(await G(() => window.__casa.pale.state === 'sleep' && !window.__casa.pale.model.visible), 'ele dorme embaixo do lençol');
await T.shot('an_01_enter', 400);
// 3. pegar o registro -> acorda
await G(() => { const g = window.__casa; g.player.teleport(203.6, 5.1); });
await T.step(0.5);
id = await T.look(203.75, 5.15, 203.3, 0.83, 5.55);
check(id === 'registro_antes', 'mira no registro: ' + id);
await T.use();
await until('acordou', () => window.__casa.story.objId === 'antes_vitrola' && !window.__casa.cutscene, 60);
check(await G(() => window.__casa.pale.state === 'grope' && window.__casa.pale.model.visible), 'ele acordou e tateia: ' + await G(() => window.__casa.pale.state));
check(await G(() => window.__casa.inventory.has('registro')), 'registro na mochila');
check(await G(() => window.__casa.world.doors.get('porta_antes').locked), 'porta de antes trancada enquanto ele está acordado');
check(await G(() => window.__casa.checkpointData && window.__casa.checkpointData.id === 'a3_antes_awake' && window.__casa.checkpointData.player.z < 1.5), 'checkpoint a3_antes_awake (renasce na porta)');
await T.shot('an_02_awake', 400);
// 4. regra: parada dentro do olhar = não vê
await G(() => { const g = window.__casa, p = g.pale; p.place(203.0, 7.2, 0); p.path = []; g.player.teleport(203.0, 2.2, Math.PI, 0); p.startLook(false); });
for (let i = 0; i < 40; i++) { await T.step(0.05); }
check(await G(() => window.__casa.pale.state !== 'lunge'), 'parada no olhar dele: não foi vista (' + await G(() => window.__casa.pale.state) + ')');
// 5. regra: se mexer dentro do olhar = investida
await G(() => { const g = window.__casa, p = g.pale; p.look = null; p.state = 'grope'; p.place(203.0, 7.2, 0); p.startLook(false); });
await T.step(0.7);
for (let i = 0; i < 20; i++) { await G(() => { window.__casa.player.pos.x += 0.02; }); await T.step(0.05); }
check(await G(() => window.__casa.pale.state === 'lunge'), 'se mexeu no olhar dele: investida (' + await G(() => window.__casa.pale.state) + ')');
// 6. regra: correr perto faz o chão tremer
await G(() => { const g = window.__casa, p = g.pale; p.look = null; p.state = 'grope'; p.path = []; p.nextLook = 99; p.place(203.0, 7.2, 0); g.player.teleport(201.4, 4.0, 0, 0); });
await G(() => { const g = window.__casa; g.input.down.add('KeyW'); g.input.down.add('ShiftLeft'); });
await T.step(0.4);
await G(() => { const g = window.__casa; g.input.down.delete('KeyW'); g.input.down.delete('ShiftLeft'); });
check(await G(() => !!window.__casa.pale.look), 'correu: ele sentiu o chão e levantou as mãos');
// 7. lençol + respiração presa
await G(() => { const g = window.__casa, p = g.pale; p.look = null; p.eyesTarget = 0; p.state = 'grope'; p.path = []; p.nextLook = 99; const h = g.world.hides.find((x) => x.id === 'hide_antes_mesa'); g.player.hideIn(h); p.place(h.feel.x - 0.6, h.feel.z, Math.PI / 2); p.ignoreHide.clear(); });
await G(() => window.__casa.input.down.add('Space'));
await until('apalpando', () => window.__casa.pale.state === 'feel', 5);
check(await G(() => window.__casa.pale.state === 'feel'), 'ele apalpa o lençol');
await T.shot('an_03_feel', 300);
for (let i = 0; i < 70; i++) await T.step(0.05);
check(await G(() => window.__casa.pale.state === 'grope' && !!window.__casa.player.hidden), 'prendeu a respiração: ele desistiu');
await G(() => window.__casa.input.down.delete('Space'));
// 8. sem prender a respiração = pega
await G(() => { const g = window.__casa, p = g.pale; const h = g.player.hidden; p.ignoreHide.clear(); p.state = 'grope'; p.path = []; p.place(h.feel.x - 0.6, h.feel.z, Math.PI / 2); });
await until('apalpando 2', () => window.__casa.pale.state === 'feel', 5);
const caught = await until('pega', () => window.__casa._dying, 6);
check(caught, 'sem prender a respiração: pega');
await page.waitForTimeout(600);
await until('volta do checkpoint', () => !window.__casa._dying && window.__casa.story.objId === 'antes_vitrola' && !window.__casa.cutscene, 20);
check(await G(() => window.__casa.player.pos.x > 150 && window.__casa.player.pos.z < 1.6 && window.__casa.pale.state === 'grope'), 'voltou para a porta, com ele acordado');
check(await G(() => window.__casa.deaths >= 1), 'contou a morte');
// 9. a vitrola
await G(() => { const g = window.__casa, p = g.pale; p.place(201.5, 2.0, 0); p.nextLook = 99; p.path = []; });
id = await T.look(204.9, 7.9, 205.67, 0.84, 7.9);
check(id === 'vitrola', 'mira na vitrola: ' + id);
await T.use();
await until('ele voltou a dormir', () => window.__casa.flags.antesDone, 60);
check(await G(() => window.__casa.flags.antesDone && window.__casa.pale.state === 'sleep' && !window.__casa.world.doors.get('porta_antes').locked), 'valsa de volta: ele dormiu e a porta destrancou');
check(await G(() => window.__casa.story.objId === 'ruptures'), 'objetivo volta para as três coisas');
// 10. a câmera lê a plaquinha
await G(() => { const g = window.__casa; g.input.rmb = true; g.phone.mode = 'camera'; });
await T.look(203.85, 1.2, 203.85, 1.45, 0.07);
await T.step(0.3);
await G(() => { const g = window.__casa; g.story.viewfinderData(); });
check(await G(() => window.__casa.flags.paleName), 'câmera leu o nome (Custódio)');
await G(() => { window.__casa.input.rmb = false; });
await T.step(0.5);
// 11. espelho e bilhetes
id = await T.look(204.95, 3.55, 205.8, 1.1, 3.55);
check(id === 'antes_mirror', 'mira no espelho coberto: ' + id);
await T.use();
await T.step(1);
check(await G(() => window.__casa.flags.antesMirrorOpen && !!window.__casa.echoes.get('antes_velho')), 'espelho descoberto mostra o antigo morador');
await T.look(204.2, 3.2, 205.7, 1.25, 3.7);
await T.shot('an_05_mirror', 500);
await T.look(201.0, 0.9, 201.0, 0.77, 0.3); await T.use();
await until('nota', () => window.__casa.ui.overlay === 'note', 5);
await T.closeOverlay();
check(await G(() => window.__casa.flags.paleDiary), 'leu a folha de caderno');
// 12. sair pela porta de antes
await G(() => { const g = window.__casa; const d = g.world.doors.get('porta_antes'); d.set(1); g.player.teleport(203.0, 0.3, 0, 0); });
for (let i = 0; i < 16; i++) { await G(() => { window.__casa.player.pos.z -= 0.04; }); await T.step(0.05); }
check(await G(() => window.__casa.player.pos.x < 20 && window.__casa.player.pos.z < 8), 'voltou para a sala pela porta');
check(await G(() => !window.__casa.pale.model.visible), 'o Morador fica lá');
await T.shot('an_04_back', 400);
console.log('ERROS DE CONSOLE:', T.errors.length ? '\n' + T.errors.join('\n') : 'nenhum');
console.log(fails ? `${fails} falha(s)` : 'apartamento de antes: tudo OK');
await T.close();
process.exit(fails ? 1 : 0);
