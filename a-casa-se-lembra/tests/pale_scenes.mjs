// Fotografa o Morador de Antes e o apartamento de antes (revisão visual).
import { open } from './harness.mjs';
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
await G(() => { window.AX = 200; });
await G(() => {
  const g = window.__casa;
  g.ui.fast = true; g.input.locked = true; g.state = 'playing'; g.ui.hideMenu(); g.ui.showHud(true); g.ui.fade(0, 0);
  Object.assign(g.flags, { act: 3, power: true, corridorLong: true, basementBuilt: true, stairsOpen: true, antesOpen: true, antesBuilt: true, extraUnlocked: true });
  g.story.phase = 'a3';
  g.rebuildWorld(); g.story.setupLights(); g.story.setupActors();
  g.phone.battery = 90; g.flags.noDrain = true;
});
await T.step(0.3);
const AX = 200;
const scene = async (name, setup, wait = 600, steps = 0.3) => { await G(setup); await T.step(steps); await G(setup); await T.shot('ps_' + name, wait); };
const look = (x, z, tx, ty, tz, eye) => G(([x, z, tx, ty, tz, eye]) => { const g = window.__casa; g.player.teleport(x, z); if (eye) g.player.eyeH = eye; const e = g.player.eye; g.player.yaw = Math.atan2(-(tx - e.x), -(tz - e.z)); g.player.pitch = Math.atan2(ty - e.y, Math.hypot(tx - e.x, tz - e.z)); g.player.apply(); }, [x, z, tx, ty, tz, eye]);
// 1. da porta: a mesa comprida e o lençol na cabeceira
await G(() => { const g = window.__casa; g.story.antesSetupPale(); });
await look(AX + 3.0, 0.4, AX + 3.0, 1.1, 6.5);
await T.step(0.5);
await T.shot('ps_01_door_view', 700);
// 2. a mesa de perto
await look(AX + 2.2, 5.9, AX + 3.0, 0.8, 5.0);
await T.step(0.3);
await T.shot('ps_02_table', 600);
// 3. o copo com os olhos
await look(AX + 3.0, 4.9, AX + 3.0, 0.85, 5.52);
await T.step(0.2);
await T.shot('ps_03_glass', 600);
// 4. sentado, sem o lençol
await G(() => { const g = window.__casa; g.flags.antesSheetOff = true; g.flags.antesEyesOut = true; g.applyWorld(); const p = g.pale; p.show(AX + 3.0, 6.6, 0, 'sit'); p.setEyes(false, 0); p.state = 'script'; });
await look(AX + 3.0, 4.6, AX + 3.0, 1.3, 6.5);
await T.step(0.6);
await T.shot('ps_04_seated', 600);
// 5. sentado, mãos levantadas, olhos abertos
await G(() => { const p = window.__casa.pale; p.setEyes(true, 1); p.eyes = 1; p.setPose('seatlook', true); });
await T.step(0.4);
await T.shot('ps_05_seatlook', 600);
// 6. em pé, tateando (corpo inteiro)
await G(() => { const p = window.__casa.pale; p.place(AX + 3.0, 7.4, 0); p.setPose('grope', true); p.eyesTarget = 0; p.eyes = 0; p.state = 'script'; });
await look(AX + 4.3, 3.2, AX + 3.0, 1.2, 7.4);
await T.step(0.4);
await T.shot('ps_06_grope', 600);
// 7. em pé, olhando pelas mãos
await G(() => { const p = window.__casa.pale; p.setPose('look', true); p.eyes = 1; p.eyesTarget = 1; });
await T.step(0.4);
await T.shot('ps_07_look', 600);
// 8. close das mãos
await look(AX + 3.0, 6.3, AX + 3.0, 2.0, 7.2, 1.42);
await T.step(0.2);
await T.shot('ps_08_hands_close', 600);
// 9. investida
await G(() => { const p = window.__casa.pale; p.setPose('lunge', true); p.place(AX + 3.0, 6.9, 0); });
await look(AX + 3.1, 5.3, AX + 3.0, 1.6, 6.9);
await T.step(0.2);
await T.shot('ps_09_lunge', 600);
// 10. de perfil, com a lanterna
await G(() => { const g = window.__casa; g.phone.toggleFlashlight(true); const p = g.pale; p.setPose('grope', true); p.place(AX + 4.6, 5.8, Math.PI / 2); });
await look(AX + 4.6, 3.9, AX + 4.6, 1.3, 5.8);
await T.step(0.3);
await T.shot('ps_10_profile_flash', 600);
// 11. o susto de captura (a mão com o olho)
await G(() => { const g = window.__casa; g.ui.fast = false; g.phone.toggleFlashlight(false); g.player.teleport(AX + 3.0, 3.0, Math.PI, 0); g.caughtByPale(false); });
await page.waitForTimeout(700);
await T.shot('ps_11_catch', 0);
await page.waitForTimeout(3500);
await G(() => { const g = window.__casa; g.ui.fast = true; g._dying = false; g.cutscene = false; g.ui.fade(0, 0); g.state = 'playing'; });
// 12. debaixo do lençol, com a mão apertando
await G(() => { const g = window.__casa; g.story.antesSetupPale(); const h = g.world.hides.find((x) => x.id === 'hide_antes_mesa'); g.player.hideIn(h); g.ui.sheetPress(0.9); });
await T.step(0.2);
await T.shot('ps_12_sheet_hide', 700);
await G(() => { const g = window.__casa; g.ui.sheetPress(0); g.player.exitHide(); });
// 13. o espelho descoberto
await G(() => { const g = window.__casa; g.flags.antesMirrorOpen = true; g.applyWorld(); g.pale.hide(); });
await G(() => { const g = window.__casa; if (g.player.hidden) g.player.exitHide(); g.story.antesMirrorEcho(); });
await look(AX + 5.05, 3.5, AX + 5.73, 1.15, 3.58);
await T.step(0.4);
await T.shot('ps_13_mirror', 700);
// 14. a plaquinha pela câmera
await G(() => { const g = window.__casa; g.input.rmb = true; g.phone.mode = 'camera'; });
await look(AX + 3.85, 1.2, AX + 3.85, 1.45, 0.07);
await T.step(0.5);
await T.shot('ps_14_nameplate_cam', 700);
await G(() => { window.__casa.input.rmb = false; });
// 15. o Inquilino de perto (orientação corrigida)
await G(() => { const g = window.__casa; g.player.teleport(8.0, 7.2, Math.PI / 2, 0); const cam = g.camera; const e = g.entity; e.show(cam.position.x - 0.55, cam.position.z, -Math.PI / 2, 'ecv'); e.model.position.y = cam.position.y - 2.3; e.state = 'static'; });
await T.step(0.2);
await G(() => { const g = window.__casa; const cam = g.camera; const e = g.entity; e.place(cam.position.x - 0.55, cam.position.z, -Math.PI / 2); e.model.position.y = cam.position.y - 2.3; });
await T.shot('ps_15_entity_face', 600);
// 16. marcas de mão no corredor (ato 3)
await G(() => { window.__casa.entity.hide(); });
await look(4.6, 7.2, 8.0, 1.2, 7.7);
await T.step(0.3);
await T.shot('ps_16_handprints', 600);
// 17. a figura no campo (varanda)
await look(2.4, -0.9, 18, -21, -38);
await G(() => { const g = window.__casa; g.player.pitch = 0.1; g.player.yaw = 0.35; g.player.apply(); });
await T.step(0.3);
await T.shot('ps_17_field', 600);
console.log('erros:', T.errors.length ? T.errors.join('\n') : 'nenhum');
await T.close();
