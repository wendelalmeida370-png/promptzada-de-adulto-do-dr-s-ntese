// Testa os cinco finais (e a galeria de finais), a partir dos checkpoints gravados pelo playthrough.
//   BOM      A Casa Se Lembra      (a3_climax: não -> gravar -> apagar -> deixar o palhaço ir -> abrir)
//   RUIM     O Inquilino           (a3_climax: dar um cômodo -> parede)  e  (gravar -> guardar o vídeo)
//   SECRETO  Achados e Perdidos    (a3_climax com o nome lido pela câmera -> "SEU CUSTÓDIO!")
//   SECRETO  A Hora Nenhuma        (a3_up com o relógio-ovo -> balde -> notebook de ontem)
//   SECRETO  Sem Sinal             (novo jogo depois de um final -> "fala o nome dos gatos" -> vigília)
// Uso: node tests/endings.mjs   (rode o playthrough antes, para gerar tests/snapshots.json)
import fs from 'fs';
import { open } from './harness.mjs';

const snaps = JSON.parse(fs.readFileSync(new URL('./snapshots.json', import.meta.url)));
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FALHA') + ' ' + msg); if (!ok) fails++; return ok; };
class Stop extends Error {}
const until = async (desc, fn, maxSec = 60, arg) => {
  for (let t = 0; t < maxSec; t += 0.5) { if (await G(fn, arg)) return true; await T.step(0.5); await page.waitForTimeout(30); }
  const st = await T.state();
  throw new Stop('tempo esgotado esperando: ' + desc + ' :: ' + JSON.stringify(st));
};
const lookUse = async (x, z, tx, ty, tz, expect) => {
  await until('livre', () => !window.__casa.cutscene && !window.__casa.ui.overlay, 60);
  const id = await T.look(x, z, tx, ty, tz);
  if (expect && id !== expect) throw new Stop(`esperava mirar em ${expect}, mirou em ${id}`);
  await T.use();
  await T.step(0.2);
  return id;
};
const choiceText = () => G(() => document.getElementById('choice-title').innerText + '\n' + document.getElementById('choice-options').innerText);
const choose = async (i, desc = 'escolha') => {
  await until(desc, () => window.__casa.ui.overlay === 'choice', 90);
  const txt = await choiceText();
  await G((i) => window.__casa.ui.closeOverlay(i), i);
  await T.step(0.2);
  return txt;
};
const endingText = async () => {
  await until('tela de final', () => !document.getElementById('ending').classList.contains('hidden'), 120);
  await page.waitForTimeout(300);
  return G(() => document.getElementById('ending-inner').innerText);
};
const backToMenu = async () => {
  await page.click('#ending .end-buttons button:last-child');
  await page.waitForTimeout(400);
};
// carrega um checkpoint do playthrough (com flags ajustadas, se preciso) e aperta "Continuar"
const load = async (id, mutate) => {
  const s0 = snaps.find((s) => s.id === id);
  if (!s0) throw new Stop('sem snapshot ' + id + ' (rode o playthrough antes)');
  const s = JSON.parse(JSON.stringify(s0));
  if (mutate) mutate(s);
  await G((s) => { localStorage.setItem('casa-se-lembra/save/v1', JSON.stringify(s)); }, s);
  await page.reload({ timeout: 120000 });
  await page.waitForFunction(() => !!window.__casa, null, { timeout: 120000 });
  await G(() => { const g = window.__casa; g.testMode = true; g.ui.fast = true; g.input.locked = true; });
  await page.click('#btn-continue');
  await G(() => { const g = window.__casa; g.input.locked = true; g.flags.noDrain = true; g.settings.storyMode = true; });
  await T.step(1);
};
const toClimax = async () => {
  await G(() => { const g = window.__casa; g.player.teleport(2.6, 2.8, Math.PI / 2); });
  await T.step(0.5);
  await until('o Inquilino sai da TV', () => window.__casa.ui.overlay === 'choice', 90);
};
const record = async () => {
  await until('gravar', () => window.__casa.story.recordProgress !== undefined, 30);
  for (let i = 0; i < 400; i++) {
    const done = await G(() => { const g = window.__casa; if (g.story.recordProgress === undefined) return true; g.input.rmb = true; const e = g.entity.pos; const c = g.player.eye; g.player.yaw = Math.atan2(-(e.x - c.x), -(e.z - c.z)); g.player.pitch = Math.atan2(2.0 - c.y, Math.hypot(e.x - c.x, e.z - c.z)); g.player.apply(); return false; });
    if (done) break;
    await T.step(0.1);
  }
  await G(() => { window.__casa.input.rmb = false; });
};
// ONLY=semsinal node tests/endings.mjs  -> roda só um cenário (os outros finais entram como já vistos)
const ONLY = process.env.ONLY;
if (ONLY) {
  await G((only) => {
    const ids = ['casa', 'inquilino', 'achados', 'horanenhuma', 'semsinal'].filter((id) => !only.split(',').includes(id));
    const all = {}; ids.forEach((id) => { all[id] = { at: new Date().toISOString(), count: 1 }; });
    localStorage.setItem('casa-se-lembra/endings/v1', JSON.stringify(all));
  }, ONLY);
}
const seen = (t, n) => (ONLY ? /finais descobertos: [1-5]\/5/ : new RegExp('finais descobertos: ' + n + '/5')).test(t);
const KEYS = { 'final bom': 'casa', 'o quarto': 'inquilino', 'guardar o vídeo': 'inquilino', 'Achados': 'achados', 'Hora Nenhuma': 'horanenhuma', 'Sem Sinal': 'semsinal' };
const scenario = async (name, fn) => {
  if (ONLY) { const k = Object.keys(KEYS).find((x) => name.includes(x)); if (!k || !ONLY.split(',').includes(KEYS[k])) return; }
  console.log('\n=== ' + name);
  try { await fn(); } catch (e) {
    fails++;
    console.log('FALHA ' + name + ': ' + (e instanceof Stop ? e.message : e.stack));
    await T.shot('en_FAIL_' + name.replace(/\W+/g, '_'), 100);
    await G(() => { const g = window.__casa; if (g.ui.overlay) g.ui.closeOverlay(0); });
  }
};

// ------------------------------------------------------------------ 1. BOM
await scenario('final bom (A Casa Se Lembra)', async () => {
  await load('a3_climax');
  const txt = await (async () => { await toClimax(); return choiceText(); })();
  check(!/CUSTÓDIO/.test(txt), 'sem o nome, só duas opções no clímax');
  await choose(1, 'clímax');
  await record();
  await choose(0, 'apagar');
  await until('cartão do palhaço', () => window.__casa.clown.model.visible && window.__casa.clown.model.userData.card.visible, 30);
  await T.step(0.3);
  await T.shot('en_01_card', 200);
  check(await G(() => { const g = window.__casa, c = g.clown.model, p = g.player.pos; const fz = Math.cos(c.rotation.y), fx = Math.sin(c.rotation.y); return (p.x - c.position.x) * fx + (p.z - c.position.z) * fz > 0; }), 'o palhaço mostra o cartão de frente pra você');
  const egg = await choose(1, 'relógio-ovo');
  check(/relógio-ovo/.test(egg), 'oferece o relógio-ovo para o palhaço');
  await choose(0, 'interfone');
  const t = await endingText();
  await T.shot('en_01_casa', 200);
  check(t.includes('FINAL BOM') && t.includes('A CASA SE LEMBRA'), 'tela: FINAL BOM / A CASA SE LEMBRA');
  check(t.includes('novo final desbloqueado') && seen(t, 1), 'novo final, 1/5');
  check(t.includes('olhos fechados'), 'deixou o palhaço ir: ele dorme na foto');
  await backToMenu();
});

// ------------------------------------------------------------------ 2. RUIM (quarto)
await scenario('final ruim (O Inquilino: o quarto)', async () => {
  await load('a3_climax');
  await toClimax();
  await choose(0, 'clímax');
  await until('manhã', () => window.__casa.story.objId === 'bad_room' && !window.__casa.cutscene, 90);
  check(await G(() => !window.__casa.world.doors.get('porta_roxo') && window.__casa.flags.roomGiven), 'o quarto roxo sumiu (sem porta)');
  await T.look(5.41, 7.4, 5.41, 1.3, 6.72);
  await T.shot('en_02_sealed_wall', 300);
  await lookUse(5.41, 7.4, 5.41, 1.2, 6.72, 'sealed_wall');
  const t = await endingText();
  await T.shot('en_02_inquilino', 200);
  check(t.includes('FINAL RUIM') && t.includes('O INQUILINO') && seen(t, 2), 'tela: FINAL RUIM / O INQUILINO, 2/5');
  check(t.includes('porta roxa'), 'variante do quarto');
  await backToMenu();
});

// ------------------------------------------------------------------ 3. RUIM (vídeo)
await scenario('final ruim (O Inquilino: guardar o vídeo)', async () => {
  await load('a3_climax');
  await toClimax();
  await choose(1, 'clímax');
  await record();
  await choose(1, 'guardar');
  await T.step(8);
  await T.shot('en_03_video_tv', 100);
  const t = await endingText();
  check(t.includes('O INQUILINO') && !t.includes('novo final desbloqueado') && seen(t, 2), 'mesmo final ruim (não conta de novo)');
  check(t.includes('101% igual'), 'variante do vídeo');
  await backToMenu();
});

// ------------------------------------------------------------------ 4. SECRETO: Achados e Perdidos
await scenario('final secreto (Achados e Perdidos)', async () => {
  await load('a3_climax', (s) => { s.flags.paleName = true; });
  await toClimax();
  const txt = await choiceText();
  check(/CUSTÓDIO/.test(txt), 'com o nome lido, aparece a terceira opção');
  await choose(2, 'clímax');
  await until('ele entra pela porta', () => window.__casa.pale.model.visible, 30);
  await T.step(3.5);
  await T.shot('en_04_pale_enters', 100);
  await until('ele agarra o Inquilino', () => window.__casa.pale.poseName === 'grab', 40);
  await T.step(0.8);
  await T.shot('en_04_grab', 100);
  await until('cartão do palhaço', () => window.__casa.clown.model.visible && window.__casa.clown.model.userData.card.visible, 40);
  await T.step(0.3);
  await T.shot('en_04_card', 200);
  check(await G(() => { const g = window.__casa, c = g.clown.model, p = g.player.pos; const fz = Math.cos(c.rotation.y), fx = Math.sin(c.rotation.y); return (p.x - c.position.x) * fx + (p.z - c.position.z) * fz > 0; }), 'o palhaço mostra o cartão de frente pra você');
  const t = await endingText();
  await T.shot('en_04_achados', 200);
  check(t.includes('FINAL SECRETO') && t.includes('ACHADOS E PERDIDOS') && seen(t, 3), 'tela: ACHADOS E PERDIDOS, 3/5');
  await backToMenu();
});

// ------------------------------------------------------------------ 5. SECRETO: A Hora Nenhuma
await scenario('final secreto (A Hora Nenhuma)', async () => {
  await load('a3_up');
  await G(() => { const g = window.__casa; g.story.startEndlessHunt = () => {}; g.entity.hide(); });
  check(await G(() => window.__casa.inventory.has('relogio_ovo')), 'tem o relógio-ovo');
  // desce pela escada impossível até a Hora Nenhuma
  await G(() => { window.__casa.player.teleport(105.0, 18.6, 0); });
  await T.step(0.5);
  const id = await T.look(105.0, 18.6, 105.0, -2.75, 17.4);
  check(id === 'bucket', 'mira no balde: ' + id);
  const pr = await G(() => document.getElementById('prompt').textContent);
  check(/relógio-ovo/.test(pr), 'o prompt do balde fala do relógio: ' + pr);
  await T.use();
  await choose(0, 'pular no balde');
  await until('ontem, 16:44', () => window.__casa.story.objId === 'hn_undo' && !window.__casa.cutscene, 60);
  check(await G(() => window.__casa.flags.yesterday && window.__casa.flags.paintingMode === 'floor'), 'a casa de ontem (como no vídeo)');
  await G(() => { window.__casa.player.teleport(8.3, 4.3); });
  await T.step(0.6);
  check(await G(() => window.__casa.story.hnWebcam), 'susto da webcam');
  await T.look(8.3, 4.3, 7.72, 0.9, 4.3);
  await T.step(0.3);
  await T.shot('en_05_webcam', 300);
  await lookUse(8.3, 4.3, 7.72, 0.9, 4.3, 'laptop');
  await until('a noite que não aconteceu', () => window.__casa.flags.hnNight, 60);
  check(await G(() => window.__casa.flags.paintingMode === 'floor' && window.__casa.flags.d_bike), 'na noite desfeita a casa está igual ao vídeo');
  const t = await endingText();
  await T.shot('en_05_horanenhuma', 200);
  check(t.includes('A HORA NENHUMA') && seen(t, 4), 'tela: A HORA NENHUMA, 4/5');
  check(!await G(() => window.__casa.inventory.has('relogio_ovo')), 'o relógio-ovo foi usado');
  await backToMenu();
});

// ------------------------------------------------------------------ 6. SECRETO: Sem Sinal
await scenario('final secreto (Sem Sinal)', async () => {
  await G(() => { try { localStorage.removeItem('casa-se-lembra/save/v1'); } catch (e) { /* */ } });
  await page.reload({ timeout: 120000 });
  await page.waitForFunction(() => !!window.__casa, null, { timeout: 120000 });
  await G(() => { const g = window.__casa; g.testMode = true; g.ui.fast = true; g.input.locked = true; });
  await page.click('button[data-act="new"]');
  await G(() => { window.__casa.input.locked = true; });
  await until('fim do prólogo', () => window.__casa.story.phase === 'a1' && !window.__casa.cutscene, 60);
  const reps = await G(() => (window.__casa.story.replyOptions('wendel') || []).map((o) => o.id));
  check(reps.includes('gatos'), 'depois de um final, dá pra perguntar o nome dos gatos: ' + reps.join(','));
  // a resposta aparece como botão no chat
  await G(() => { const g = window.__casa; g.ui.openPhone('home'); g.ui.renderPhone('msgs'); g.ui.renderPhone('chat', 'wendel'); });
  check(await G(() => document.querySelectorAll('.reply-chip').length >= 2), 'botões de resposta no chat');
  await T.shot('en_06_reply', 200);
  await G(() => { const b = [...document.querySelectorAll('.reply-chip')].find((x) => /gatos/.test(x.textContent)); b.click(); });
  await T.step(1);
  await T.closeOverlay();
  await choose(0, 'acordar a Júlia');
  await until('objetivo: acordar a Júlia', () => window.__casa.story.objId === 'ss_wake' && !window.__casa.cutscene, 30);
  check(await G(() => window.__casa.checkpointData && window.__casa.checkpointData.id === 'ss_start'), 'checkpoint ss_start');
  await G(() => { const d = window.__casa.world.doors.get('porta_roxo'); if (d) d.set(1); });
  await lookUse(5.6, 4.6, 4.74, 0.55, 4.45, 'bed_roxo');
  await until('vigília', () => window.__casa.story.objId === 'ss_vigil', 60);
  await T.step(2);
  await T.shot('en_06_vigil', 200);
  // primeiro, errar: atender o interfone mesmo com a Júlia pedindo
  await choose(0, 'interfone');
  await choose(0, 'atender mesmo assim');
  await until('a casa esqueceu você', () => window.__casa._dying, 30);
  await until('volta da vigília', () => !window.__casa._dying && window.__casa.story.phase === 'ss_vigil' && window.__casa.ui.overlay !== 'choice', 60);
  check(await G(() => window.__casa.deaths >= 1), 'errar leva de volta ao começo da vigília');
  // agora certo: deixar tocar, perguntar o nome dos gatos, olhar pela câmera no escuro
  await choose(1, 'interfone (de novo)');
  const door = await choose(1, 'porta');
  check(/nome dos gatos/.test(door), 'a porta oferece perguntar o nome dos gatos');
  await until('escuro', () => window.__casa.lightMul === 0 && window.__casa.entity.model.visible, 60);
  await G(() => { const g = window.__casa; g.phone.mode = 'camera'; g.input.rmb = true; });
  await T.look(3.55, 3.25, 1.15, 1.8, 7.3);
  await T.step(1.2);
  await T.shot('en_06_dark_camera', 200);
  await G(() => { window.__casa.input.rmb = false; });
  await choose(1, 'amanhecer: nome dos gatos');
  const t = await endingText();
  await T.shot('en_06_semsinal', 200);
  check(t.includes('SEM SINAL') && t.includes('finais descobertos: 5/5'), 'tela: SEM SINAL, 5/5');
  check(t.includes('todos os finais'), 'mensagem de todos os finais');
  // galeria
  await page.click('#ending .end-buttons button:first-child');
  await page.waitForTimeout(600);
  const cards = await G(() => document.querySelectorAll('.end-card.got').length);
  check(cards === 5, 'galeria com os 5 finais: ' + cards);
  await T.shot('en_07_gallery', 200);
  await G(() => window.__casa.ui.closeSub());
  await page.waitForTimeout(300);
  const btn = await G(() => document.getElementById('btn-endings').textContent);
  check(btn.includes('5/5'), 'botão do menu: ' + btn);
});

console.log('\nERROS DE CONSOLE:', T.errors.length ? '\n' + T.errors.join('\n') : 'nenhum');
console.log(fails ? `${fails} falha(s)` : 'os 5 finais: tudo OK');
await T.close();
process.exit(fails ? 1 : 0);
