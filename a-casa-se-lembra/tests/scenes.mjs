// Monta cenas específicas e fotografa (revisão visual dos sustos e personagens).
import { open } from './harness.mjs';
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
await G(() => { const g = window.__casa; g.ui.fast = true; g.input.locked = true; g.state = 'playing'; g.ui.hideMenu(); g.ui.showHud(true); g.ui.fade(0, 0); g.story.phase = 'a2'; g.flags.act = 2; g.flags.power = true; g.flags.corridorLong = true; g.rebuildWorld(); g.story.setupLights(); g.story.setupActors(); g.phone.battery = 90; g.phone.toggleFlashlight(true); });
await T.step(0.5);
const scene = async (name, setup, wait = 700) => { await G(setup); await T.step(0.3); await G(setup); await T.shot('sc_' + name, wait); };
// 1. o Inquilino de perto
await scene('entity_face', () => { const g = window.__casa; g.player.teleport(8.0, 7.2, Math.PI / 2, 0); const cam = g.camera; const e = g.entity; e.show(cam.position.x - 0.55, cam.position.z, -Math.PI / 2, 'ecv'); e.model.position.y = cam.position.y - 2.3; e.state = 'static'; e.model.userData.faceTex.draw(0.1, 1.5); });
// 2. o Inquilino no corredor, corpo inteiro
await scene('entity_corridor', () => { const g = window.__casa; g.player.teleport(4.6, 7.2, -Math.PI / 2, 0.05); g.entity.show(9.0, 7.2, Math.PI / 2, 'ecv'); g.entity.state = 'static'; });
// 3. palhaço no fim do corredor
await scene('clown_far', () => { const g = window.__casa; g.entity.hide(); g.player.teleport(4.8, 7.2, -Math.PI / 2, 0.02); g.clown.show(12.8, 7.2, -Math.PI / 2, 'ec'); });
// 4. palhaço de perto
await scene('clown_close', () => { const g = window.__casa; g.player.teleport(6.6, 5.4, 0, 0.05); g.clown.show(6.6, 4.45, 0, 'ec'); g.clown.model.userData.head.rotation.set(0, 0, 0.15); });
// 5. o pai Esquecido
await scene('esquecido', () => { const g = window.__casa; g.clown.hide(); const P = g.layout.P; g.player.teleport(P + 0.8, 7.0, -Math.PI / 2 - 0.4, 0.05); g.esquecido.spawn(P + 2.0, 8.2); g.esquecido.model.rotation.y = -Math.PI * 0.7; });
// 6. espelho redondo com a Júlia (ato 2)
await scene('mirror_julia', () => { const g = window.__casa; g.esquecido.hide(); g.player.teleport(6.2, 5.2, -Math.PI / 2 + 0.2, 0.05); });
// 7. escrita no espelho do guarda-roupa
await scene('wardrobe_msg', () => { const g = window.__casa; g.flags.dadFound = true; g.applyWorld(); const P = g.layout.P; g.player.teleport(P + 1.8, 7.3, 0, 0.1); });
// 8. modo vídeo com a família
await scene('video_family', () => { const g = window.__casa; g.flags.dadFound = false; g.applyWorld(); g.player.teleport(3.0, 5.2, -Math.PI / 2 - 0.3, -0.1); g.input.rmb = true; g.phone.apps.video = true; g.phone.mode = 'video'; });
// 9. varanda ato 1 (campo) e ato 3 (lua vermelha)
await scene('balcony_a3', () => { const g = window.__casa; g.input.rmb = false; g.flags.act = 3; g.applyWorld(); g.story.setupLights(); g.player.teleport(2.4, -0.9, 0.35, 0.28); });
// 10. câmera escondida embaixo da cama
await scene('under_bed', () => { const g = window.__casa; g.flags.act = 2; g.applyWorld(); g.player.teleport(5.6, 4.6); const h = g.world.hides.find((x) => x.id === 'bed_roxo'); g.player.hideIn(h); });
await G(() => { const g = window.__casa; g.player.exitHide(); });
console.log('erros:', T.errors.length ? T.errors.join('\n') : 'nenhum');
await T.close();
