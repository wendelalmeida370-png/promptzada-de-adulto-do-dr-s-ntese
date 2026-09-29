// Joga a campanha inteira automaticamente, do "Novo jogo" até a tela de final.
// Uso: node tests/playthrough.mjs            (final "A CASA SE LEMBRA" + segredos)
//      ENDING=inquilino node tests/playthrough.mjs
import { open } from './harness.mjs';

const ENDING = process.env.ENDING || 'casa';
const SHOTS = process.env.NOSHOTS ? false : true;
const T = await open();
const { page } = T;
let stepN = 0;
const log = async (msg) => { const s = await T.state(); console.log(`[${String(++stepN).padStart(2, '0')}] ${msg} :: ${JSON.stringify(s)}`); return s; };
const shot = async (n) => { if (SHOTS) await T.shot('pt_' + n, 400); };
const fail = async (msg) => { console.log('FALHOU: ' + msg); console.log('flags:', JSON.stringify(await page.evaluate(() => ({ f: window.__casa.flags, zones: window.__casa.story.zones, t: window.__casa.story._tvT, tv: window.__casa.tv.mode, timers: window.__casa.story.timers.length, cut: window.__casa.cutscene }))));  console.log(T.errors.join('\n')); await T.shot('pt_FAIL', 200); await T.close(); process.exit(1); };
const until = async (desc, fn, maxSec = 60, arg) => {
  for (let t = 0; t < maxSec; t += 0.5) {
    const ok = await page.evaluate(fn, arg);
    if (ok) return true;
    await T.step(0.5);
    await page.waitForTimeout(40);
  }
  await fail('tempo esgotado esperando: ' + desc);
};
const G = (fn, arg) => page.evaluate(fn, arg);
const lookUse = async (x, z, tx, ty, tz, expect) => {
  await until('livre (sem cutscene/overlay)', () => !window.__casa.cutscene && !window.__casa.ui.overlay, 60);
  const id = await T.look(x, z, tx, ty, tz);
  if (expect && id !== expect) {
    console.log('   hits:', JSON.stringify(await G(() => { const g = window.__casa; g.raycaster.setFromCamera({ x: 0, y: 0 }, g.camera); const roots = [...g.world.sections.values()].map((s) => s.group); return g.raycaster.intersectObjects(roots, true).slice(0, 5).map((h) => ({ d: +h.distance.toFixed(2), vis: h.object.visible, mv: h.object.material.visible, id: (() => { let o = h.object; while (o) { const it = g.world.meshToInteract.get(o); if (it) return it.id; o = o.parent; } return null; })(), p: h.point.toArray().map((v) => +v.toFixed(2)), n: h.object.parent && h.object.parent.name })); })));
    await fail(`esperava mirar em ${expect}, mas mirou em ${id} (de ${x},${z})`);
  }
  const prompt = await G(() => document.getElementById('prompt').textContent);
  const used = await T.use();
  await T.step(0.2);
  return { id: used, prompt };
};
const choose = async (i) => { await until('escolha aberta', () => window.__casa.ui.overlay === 'choice', 30); await G((i) => window.__casa.ui.closeOverlay(i), i); await T.step(0.2); };
const closeNote = async () => { await until('nota aberta', () => window.__casa.ui.overlay === 'note', 20); await T.closeOverlay(); await T.step(0.1); };

// modo rápido e sem mortes aleatórias (as regras de captura são testadas em outro script)
await G(() => { const g = window.__casa; g.ui.fast = true; g.input.locked = true; });
await G(() => { const g = window.__casa; window.__snaps = []; const c = g.checkpoint.bind(g); g.checkpoint = (id, silent) => { c(id, silent); window.__snaps.push(JSON.parse(JSON.stringify(g.checkpointData))); }; });
await G(() => { const st = window.__casa.story; const o = st.objective; st.objective = function (id, silent) { console.log('[dbg] objetivo -> ' + id); return o.call(this, id, silent); }; });
await page.click('button[data-act="new"]');
await G(() => { window.__casa.input.locked = true; });
await until('fim do prólogo', () => window.__casa.story.phase === 'a1' && !window.__casa.cutscene, 60);
await log('prólogo concluído');
await shot('01_sofa');

// ---------------- ATO 1
await G(() => { const g = window.__casa; g.ui.openPhone('home'); g.ui.renderPhone('msgs'); g.ui.renderPhone('chat', 'wendel'); });
await shot('02_phone');
await T.closeOverlay();
await until('objetivo carregador', () => window.__casa.story.objId === 'charger', 10);
await log('mensagens lidas');
let r = await lookUse(6.35, 5.3, 7.0, 0.8, 5.25, 'charger');
await until('pegou carregador', () => window.__casa.inventory.has('carregador'), 5);
r = await T.look(6.7, 4.45, 7.23, 1.25, 4.13);
if (r !== 'socket_roxo') await fail('não mirou na tomada: ' + r);
await G(() => window.__casa.input.down.add('KeyE'));
await until('bateria >= 35', () => window.__casa.phone.battery >= 35 && window.__casa.flags.videoUnlocked, 20);
await G(() => window.__casa.input.down.delete('KeyE'));
await log('celular carregado, vídeo liberado');
await G(() => { const g = window.__casa; g.input.rmb = true; g.phone.mode = 'video'; g.story.onModeChange('video'); });
await T.look(2.6, 5.5, 3.2, 1.2, 7.8);
await T.step(1.0);
await shot('03_video_mode');
const tag = await G(() => document.getElementById('vf-tag').textContent);
console.log('   etiqueta do vídeo:', tag);
await G(() => { const g = window.__casa; g.input.rmb = false; });
await T.step(0.3);
await until('objetivo compare', () => window.__casa.story.objId === 'compare', 5);
await shot('04_painting_before');
r = await lookUse(3.2, 6.6, 3.2, 1.55, 7.93, 'painting');
console.log('   prompt quadro:', r.prompt);
await until('checklist', () => window.__casa.story.objId === 'a1list', 12);
await log('quadro consertado');
// diferenças opcionais: fotos e lençol (a bicicleta fica: testar consequência)
r = await lookUse(1.4, 2.0, 0.3, 0.7, 2.0, 'rack_photos');
r = await lookUse(2.0, 0.6, 2.0, 1.0, -0.45, 'sheet_figure');
await T.step(1.5);
await log('fotos e lençol consertados');
// ração: banquinho -> prateleira -> potes
r = await lookUse(3.45, 4.6, 3.45, 0.3, 5.2, 'stool');
await until('banquinho', () => window.__casa.inventory.has('banquinho'), 3);
r = await lookUse(-1.8, 8.9, -1.0, 1.65, 9.1, 'racao');
await until('ração', () => window.__casa.inventory.has('racao'), 3);
r = await lookUse(-1.0, 6.9, -1.25, 0.05, 7.65, 'bowl_bento');
await until('gatos alimentados', () => window.__casa.flags.fedCats, 3);
await log('gatos alimentados');
r = await lookUse(10.3, 7.2, 11.0, 1.1, 7.2, 'porta_pais');
await until('mãe checada', () => window.__casa.flags.checkedMom, 3);
await log('bateu na porta dos pais');
await until('interfone tocando', () => window.__casa.story.objId === 'intercom', 15);
r = await lookUse(0.7, 7.3, 0.07, 1.45, 7.65, 'intercom');
await choose(2); // pergunta o nome dos gatos
await until('corredor mais longo', () => window.__casa.flags.corridorLong && window.__casa.story.objId === 'bed', 40);
await log('interfone atendido (perguntou o nome dos gatos); a casa mudou');
r = await lookUse(1.75, 7.2, 1.75, 1.45, 7.93, 'keyholder');
await until('chave velha', () => window.__casa.inventory.has('chave_velha'), 3);
await T.look(9.0, 7.2, 12.21, 1.1, 7.7);
await T.step(0.5);
await until('viu a porta extra', () => window.__casa.flags.sawExtraDoor, 10);
await shot('05_extra_door');
await log('porta que não existe');
r = await lookUse(11.7, 7.2, 12.21, 1.1, 7.7, 'porta_extra');
await T.look(5.8, 5.0, 7.0, 1.0, 4.9);
await until('TV ligou', () => window.__casa.story.objId === 'tv', 60);
await log('TV ligou sozinha');
await T.look(2.2, 3.0, 0.1, 1.4, 2.8);
await until('transmissão', () => window.__casa.tv.mode === 'canvas', 20);
await T.step(8);
await shot('06_broadcast');
await until('CCTV', () => window.__casa.tv.mode === 'cctv', 40);
await T.step(1.2);
await shot('07_cctv');
await until('ato 2', () => window.__casa.flags.act === 2 && window.__casa.story.objId === 'breaker' && !window.__casa.cutscene, 60);
await log('ATO 2 começou (apagão)');
await shot('08_blackout');

// ---------------- ATO 2
await G(() => { const g = window.__casa; g.phone.toggleFlashlight(true); });
r = await lookUse(0.7, 7.0, 0.06, 1.75, 7.0, 'breaker');
await until('energia', () => window.__casa.flags.power && window.__casa.story.objId === 'lookvideo', 30);
await log('energia religada');
await G(() => { const g = window.__casa; g.input.rmb = true; g.phone.mode = 'video'; });
await T.look(0.5, 6.0, -2.25, 1.1, 6.1);
await T.step(0.5);
await shot('09_family_video');
await until('família no vídeo', () => window.__casa.story.objId === 'family', 20);
await G(() => { window.__casa.input.rmb = false; });
await log('viu a família no vídeo');
// entra no corredor -> caçada 1
await G(() => { const g = window.__casa; g.player.teleport(4.4, 7.2); });
await T.step(0.3);
await until('caçada 1', () => window.__casa.entity.state !== 'off', 20);
await log('caçada 1 começou');
// esconde no guarda-roupa do quarto roxo
r = await lookUse(6.7, 4.8, 6.72, 1.0, 4.03, 'wardrobe_roxo');
await until('escondida', () => !!window.__casa.player.hidden, 5);
await shot('10_hidden');
await G(() => window.__casa.input.down.add('Space'));
await until('fim da caçada 1', () => window.__casa.flags.hunt1Done, 90);
await G(() => window.__casa.input.down.delete('Space'));
await log('caçada 1 terminou (escondida)');
await T.step(1);
await G(() => { window.__casa.interact(); }); // sai do esconderijo -> susto do palhaço
await T.step(0.5);
await shot('11_clown_scare');
await T.step(3);
// JÚLIA: espelho redondo + cômoda
r = await lookUse(6.3, 4.95, 7.24, 1.35, 4.95, 'round_mirror');
await T.step(1);
await shot('12_round_mirror');
for (const i of [1, 4]) { r = await lookUse(6.2, 6.05, 6.9, 0.86 - 0.04 - 0.205 * (i - 0.5), 6.05, 'dresser_' + i); }
await T.step(1.5);
await until('guarda-roupa destravou', () => window.__casa.flags.wardrobeRoxoUnlocked, 5);
r = await lookUse(6.7, 4.8, 6.72, 1.0, 4.03, 'wardrobe_roxo');
await until('nota caixinha', () => window.__casa.ui.overlay === 'note', 10);
await T.closeOverlay();
await until('júlia encontrada', () => window.__casa.flags.juliaFound, 20);
await log('Júlia encontrada; rádio e caixinha na mochila');
// MÃE: rotina (armário -> fogão -> congelador)
r = await lookUse(-1.6, 5.85, -2.7, 1.95, 5.85, 'cab_4');
r = await lookUse(-1.6, 5.2, -2.7, 0.9, 5.2, 'stove');
r = await lookUse(-0.55, 5.9, -0.55, 1.45, 4.77, 'freezer_door');
await until('gelo apareceu', () => window.__casa.flags.iceVisible, 5);
await T.step(1.5);
r = await lookUse(-0.55, 5.45, -0.55, 1.42, 4.5, 'ice_block');
await until('pegou gelo', () => window.__casa.inventory.has('gelo'), 5);
r = await lookUse(-0.55, 5.9, -0.2, 1.45, 5.0, null);
await log('pegou o gelo');
await until('palhaço atrás', () => window.__casa.clown.model.visible, 15);
await shot('13_fridge_clown');
await G(() => { const g = window.__casa; const c = g.clown.model.position; const e = g.player.eye; g.player.yaw = Math.atan2(-(c.x - e.x), -(c.z - e.z)); g.player.apply(); });
await until('caçada 2', () => window.__casa.entity.state !== 'off', 20);
await log('caçada 2 começou');
r = await lookUse(-2.0, 8.5, -2.47, 1.0, 8.45, 'hide_servico');
await G(() => window.__casa.input.down.add('Space'));
await until('fim da caçada 2', () => window.__casa.flags.hunt2Done, 100);
await G(() => window.__casa.input.down.delete('Space'));
await G(() => window.__casa.interact());
await log('caçada 2 terminou');
r = await lookUse(-1.3, 5.2, -1.3, 1.05, 4.32, 'microwave');
await until('mãe encontrada', () => window.__casa.flags.momFound, 30);
await log('Mãe encontrada; chaveiro');
// gaveta do rack (foto da festa)
r = await lookUse(1.2, 3.1, 0.44, 0.33, 3.1, 'rack_drawer');
await closeNote();
// LILI no rack
r = await lookUse(1.3, 3.68, 0.46, 0.3, 3.68, 'rack_door');
r = await lookUse(1.3, 3.68, 0.46, 0.3, 3.68, 'rack_door');
await until('lili segue', () => window.__casa.flags.liliFollow, 5);
await log('Lili resgatada');
// PAI: o Esquecido + caixinha de música
await G(() => { const g = window.__casa; g.player.teleport(g.layout.P + 0.6, 7.2, -Math.PI / 2); });
await T.step(0.5);
await until('esquecido', () => window.__casa.esquecido.active, 5);
await G(() => { const g = window.__casa; const es = g.esquecido.pos; g.player.teleport(es.x - 1.6, es.z - 1.0); const e = g.player.eye; g.player.yaw = Math.atan2(-(es.x - e.x), -(es.z - e.z)); g.player.pitch = -0.05; g.player.apply(); });
await T.step(0.2);
await shot('14_esquecido');
await G(() => { const g = window.__casa; g.story.update(0); g.interact(); });
await until('pai encontrado', () => window.__casa.flags.dadFound, 60);
await log('Pai encontrado (caixinha de música)');
await T.step(4);
// PEDRO: quarto dos meninos + notebook
if (await G(() => window.__casa.world.doors.get('porta_meninos').target < 0.5)) r = await lookUse(8.71, 7.3, 8.71, 1.0, 6.7, 'porta_meninos');
await T.step(1);
// segredo do Vasco
r = await lookUse(8.3, 4.4, 7.37, 1.75, 4.4, 'flag');
await closeNote();
r = await lookUse(8.4, 5.42, 7.82, 0.42, 5.42, 'vasco_drawer');
await until('cadeado', () => window.__casa.ui.overlay === 'keypad', 5);
await G(() => { const w = document.querySelectorAll('.wheel'); const set = (i, n) => { for (let k = 0; k < n; k++) w[i].querySelector('button').click(); }; set(0, 1); set(1, 8); set(2, 9); set(3, 8); document.getElementById('keypad-ok').click(); });
await closeNote();
await until('segredo vasco', () => window.__casa.flags.secretVasco, 5);
await log('segredo Vasco (1898)');
r = await lookUse(8.3, 4.3, 7.72, 0.9, 4.3, 'laptop');
await until('senha', () => window.__casa.ui.overlay === 'keypad', 5);
await G(() => { const i = document.getElementById('keypad-input'); i.value = 'bento e lili'; document.getElementById('keypad-ok').click(); });
await closeNote();
await log('notebook desbloqueado');
await until('webcam', () => window.__casa.cctvOn, 20);
await T.step(3);
await shot('15_webcam');
await G(() => { const g = window.__casa; g.player.yaw += Math.PI; g.player.apply(); });
await T.step(2);
await G(() => { const g = window.__casa; g.player.teleport(8.85, 4.3); const e = g.player.eye; g.player.yaw = Math.atan2(-(7.72 - e.x), -(4.3 - e.z)); g.player.pitch = -0.35; g.player.apply(); });
await until('caçada 3', () => window.__casa.story.huntId === 3 && window.__casa.entity.state !== 'off', 30);
await log('caçada 3 (fuga)');
await G(() => { const g = window.__casa; g.player.teleport(12.2, 8.2); });
await until('bloqueado / fim caçada 3', () => window.__casa.flags.hunt3Done, 60);
await until('pedro encontrado', () => window.__casa.flags.pedroFound, 30);
await log('Pedro encontrado; ele não entra nas portas da casa');
await G(() => { window.__casa.player.teleport(12.2, 6.95); });
await until('fase da porta', () => window.__casa.story.phase === 'a2_door', 30);
await log('4/4 — a porta que não existe se abriu');

// ---------------- ATO 3
r = await lookUse(12.21, 6.95, 12.21, 1.1, 7.7, 'porta_extra');
await until('escada aberta', () => window.__casa.flags.stairsOpen, 5);
await T.step(2);
await shot('16_stairs');
await G(() => { const g = window.__casa; g.player.teleport(12.2, 9.8); });
await T.step(0.3);
await until('desceu', () => window.__casa.player.pos.x > 100, 5);
await G(() => { const g = window.__casa; g.player.teleport(112.3, 13.5, Math.PI); });
await T.step(1);
await until('porão', () => window.__casa.story.objId === 'clown', 20);
await shot('17_basement');
await log('memória da casa');
// cartões
for (let i = 0; i < 45; i++) {
  const done = await G(() => window.__casa.flags.threeThings);
  if (done) break;
  await G(() => { const g = window.__casa; const c = g.clown.model.position; g.player.teleport(c.x, c.z - 1.6); const e = g.player.eye; g.player.yaw = Math.atan2(-(c.x - e.x), -(c.z - e.z)); g.player.pitch = 0.05; g.player.apply(); g.story.update(0); if (g.ui.overlay) g.ui.closeOverlay(); g.interact(); });
  await T.step(1.5);
  if (i === 3) await shot('18_clown_card');
}
await until('três coisas', () => window.__casa.flags.threeThings, 30);
await log('revelação e as três coisas');
await G(() => { if (window.__casa.ui.overlay) window.__casa.ui.closeOverlay(); });
// Hora Nenhuma (segredo Chrono)
r = await lookUse(110.9, 16.2, 110.2, 1.0 - 2.9, 16.2, 'porta_relogio');
await T.step(1);
await G(() => { const g = window.__casa; g.player.teleport(103.0, 17.2); });
await T.step(0.5);
r = await lookUse(102.9, 17.9, 102.4, -2.3, 17.2, 'egg_watch');
await until('relógio-ovo', () => window.__casa.inventory.has('relogio_ovo'), 5);
await shot('19_hora_nenhuma');
await log('segredo: Hora Nenhuma');
// sobe
await G(() => { const g = window.__casa; g.player.teleport(112.2, 9.3); });
await T.step(0.4);
await until('ato 3', () => window.__casa.flags.act === 3, 10);
await log('ATO 3: de volta lá em cima');
await G(() => { const g = window.__casa; g.player.teleport(12.2, 8.0); });
await T.step(1);
await shot('20_act3_corridor');
// ruptura 1: quadro
r = await lookUse(3.2, 6.6, 3.2, 0.42, 7.82, 'painting');
await until('quadro invertido', () => window.__casa.flags.paintingMode === 'upside', 5);
// ruptura 3: chaves (chapéu do pai)
await G(() => { const g = window.__casa; g.player.teleport(g.layout.P + 1.5, 7.0); });
r = await lookUse(15.0, 7.0, 14.9, 0.05, 6.2, 'hat_floor');
await until('chave do pai', () => window.__casa.inventory.has('chave_pai'), 5);
r = await lookUse(1.75, 7.2, 1.75, 1.45, 7.93, 'keyholder');
await until('chaves penduradas', () => window.__casa.flags.keysHung, 5);
// ruptura 2: registro -> chuveiro -> espelho
r = await lookUse(-1.75, 9.2, -1.75, 0.92, 9.85, 'registro');
await until('registro', () => window.__casa.inventory.has('registro'), 5);
r = await lookUse(5.9, 9.3, 6.55, 1.2, 9.3, 'shower_valve');
r = await lookUse(5.9, 9.3, 6.55, 1.2, 9.3, 'shower_valve');
await until('chuveiro', () => window.__casa.flags.showerOn, 5);
await until('espelho embaçado', () => window.__casa.world.get('bath_mirror').fog >= 0.7, 20);
r = await lookUse(5.0, 8.45, 4.27, 1.6, 8.45, 'bath_mirror');
await until('teclado espelho', () => window.__casa.ui.overlay === 'keypad', 5);
await G(() => { const i = document.getElementById('keypad-input'); i.value = 'Rafaela'; document.getElementById('keypad-ok').click(); });
await until('nome escrito', () => !!window.__casa.flags.nameWritten, 10);
await T.step(1);
await shot('21_mirror_name');
await log('três rupturas feitas');
await until('clímax', () => window.__casa.story.phase === 'a3_climax', 20);
await G(() => { const g = window.__casa; g.player.teleport(2.6, 2.8, Math.PI / 2); });
await T.step(0.5);
await until('entidade saiu da TV', () => window.__casa.ui.overlay === 'choice', 90);
await shot('22_climax');
if (ENDING === 'inquilino') {
  await choose(0);
  await until('tela de final', () => !document.getElementById('ending').classList.contains('hidden'), 60);
} else {
  await choose(1);
  await until('gravar', () => window.__casa.story.recordProgress !== undefined, 30);
  // mira a câmera no Inquilino até completar
  for (let i = 0; i < 400; i++) {
    const done = await G(() => { const g = window.__casa; if (g.story.recordProgress === undefined) return true; g.input.rmb = true; const e = g.entity.pos; const c = g.player.eye; g.player.yaw = Math.atan2(-(e.x - c.x), -(e.z - c.z)); g.player.pitch = Math.atan2(2.0 - c.y, Math.hypot(e.x - c.x, e.z - c.z)); g.player.apply(); return false; });
    if (done) break;
    await T.step(0.1);
    if (i === 40) await shot('23_recording');
  }
  await G(() => { window.__casa.input.rmb = false; });
  await choose(0); // apagar
  await choose(0); // usar o relógio-ovo
  await until('epílogo', () => window.__casa.ui.overlay === 'choice', 90);
  await shot('24_morning');
  await choose(1); // pergunta o nome dos gatos
  await until('tela de final', () => !document.getElementById('ending').classList.contains('hidden'), 60);
}
await T.shot('pt_25_ending', 600);
const endText = await G(() => document.getElementById('ending-inner').innerText);
const snaps = await G(() => window.__snaps);
(await import('fs')).writeFileSync(new URL('./snapshots.json', import.meta.url), JSON.stringify(snaps));
console.log('checkpoints gravados:', snaps.map((x) => x.id).join(', '));
console.log('----- FINAL -----\n' + endText);
console.log('ERROS DE CONSOLE:', T.errors.length ? '\n' + T.errors.join('\n') : 'nenhum');
await T.close();
