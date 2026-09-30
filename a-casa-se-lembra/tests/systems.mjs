// Testa sistemas isolados: movimento/colisão, foto, dicas, menus, opções, nomes, sons, captura e respawn.
import fs from 'fs';
import { open } from './harness.mjs';
const T = await open();
const { page } = T;
const G = (fn, a) => page.evaluate(fn, a);
const results = [];
const check = (name, ok, info = '') => { results.push([ok, name, info]); console.log(`${ok ? 'OK ' : 'ERR'} ${name}${info ? ' — ' + info : ''}`); };

// ---- nomes personalizados (antes de começar)
await page.click('button[data-act="names"]');
await page.waitForTimeout(200);
const inputs = await page.$$('#sub-content input[type=text]');
check('tela de nomes tem 11 campos', inputs.length === 11, String(inputs.length));
await inputs[7].fill('Frajola'); // gato 1
await inputs[8].fill('Mimi'); // gato 2
await page.click('#sub-back');
check('nomes salvos', await G(() => JSON.parse(localStorage.getItem('casa-se-lembra/names/v1')).bento === 'Frajola'));

// ---- opções
await page.click('button[data-act="options"]');
await page.waitForTimeout(200);
const sliders = await page.$$('#sub-content input[type=range]');
check('opções têm sliders', sliders.length >= 7, String(sliders.length));
await page.evaluate(() => { // jump scares suaves (acha o seletor pela opção, não pela posição)
  const sel = [...document.querySelectorAll('#sub-content select')].find((x) => [...x.options].some((o) => o.textContent === 'Suaves'));
  sel.value = '1'; sel.dispatchEvent(new Event('change'));
});
await page.click('#sub-back');
check('opção de sustos salva', await G(() => JSON.parse(localStorage.getItem('casa-se-lembra/settings/v1')).scare === 1));
await page.click('button[data-act="controls"]'); await page.waitForTimeout(100); await page.click('#sub-back');
await page.click('button[data-act="credits"]'); await page.waitForTimeout(100);
check('créditos citam os nomes', (await G(() => document.getElementById('sub-content').innerText)).includes('Frajola'));
await page.click('#sub-back');

// ---- começa
await G(() => { const g = window.__casa; g.ui.fast = true; g.input.locked = true; });
await page.click('button[data-act="new"]');
await G(() => { window.__casa.input.locked = true; });
for (let i = 0; i < 60; i++) { await T.step(0.5); await page.waitForTimeout(30); if (await G(() => window.__casa.story.phase === 'a1' && !window.__casa.cutscene)) break; }
check('prólogo termina', await G(() => window.__casa.story.phase === 'a1'));

// ---- movimento e colisão
await G(() => { const g = window.__casa; g.player.teleport(2.0, 3.0, Math.PI / 2, 0); }); // olhando para -x (rack da TV)
await G(() => window.__casa.input.down.add('KeyW'));
await T.step(3);
await G(() => window.__casa.input.down.delete('KeyW'));
const px = await G(() => window.__casa.player.pos.x);
check('anda e para no rack (não atravessa)', px > 0.6 && px < 1.0, 'x=' + px.toFixed(2));
await G(() => { const g = window.__casa; g.player.teleport(2.0, 4.0, 0, 0); g.input.down.add('KeyW'); g.input.down.add('ShiftLeft'); });
await T.step(1.2);
await G(() => { const g = window.__casa; g.input.down.delete('KeyW'); g.input.down.delete('ShiftLeft'); });
const st1 = await G(() => ({ z: window.__casa.player.pos.z, sta: window.__casa.player.stamina }));
check('corre (gasta fôlego)', st1.sta < 0.95 && st1.z < 1.6, JSON.stringify(st1));

// ---- foto
await G(() => { const g = window.__casa; g.player.teleport(2.5, 5.5, 0, 0); g.phone.battery = 80; g.input.rmb = true; });
await T.step(0.3);
await G(() => { window.__casa.input.lclick = true; });
await T.step(0.1);
await G(() => { window.__casa.input.lclick = false; window.__casa.input.rmb = false; });
// a foto é capturada logo depois do próximo quadro desenhado (pode demorar com a CPU ocupada)
for (let i = 0; i < 40 && !(await G(() => window.__casa.phone.gallery.length)); i++) await page.waitForTimeout(250);
await T.step(0.2); // abaixa o celular
const gal = await G(() => window.__casa.phone.gallery.map((p) => ({ cap: p.caption, img: p.img ? p.img.length : 0 })));
check('foto vai para a galeria com imagem', gal.length >= 1 && gal[0].img > 1000, JSON.stringify(gal[0]));

// ---- dicas
await G(() => window.__casa.story.hint());
const h1 = await G(() => document.getElementById('hint-box').innerText);
check('dica nível 1 aparece', h1.includes('DICA 1/3'), h1.slice(0, 60));
await G(() => { window.__casa.story.hintAt -= 40; window.__casa.story.hint(); });
check('dica nível 2 depois de esperar', (await G(() => document.getElementById('hint-box').innerText)).includes('DICA 2/3'));

// ---- celular, mochila, diário
await G(() => window.__casa.ui.openPhone('home'));
check('celular abre', await G(() => window.__casa.ui.overlay === 'phone'));
await G(() => { window.__casa.ui.renderPhone('gallery'); window.__casa.ui.renderPhone('video'); window.__casa.ui.renderPhone('radio'); window.__casa.ui.closeOverlay(); });
await G(() => { window.__casa.inventory.add('banquinho'); window.__casa.ui.openInventory(); });
check('mochila mostra item', await G(() => document.querySelectorAll('.inv-slot').length >= 1));
await G(() => window.__casa.ui.closeOverlay());
await G(() => window.__casa.ui.openJournal('map'));
check('diário com planta', await G(() => !!document.querySelector('#journal-body canvas')));
for (const t of ['obj', 'notes', 'photos', 'rules']) await G((t) => { document.querySelector(`#journal-tabs button[data-t="${t}"]`).click(); }, t);
await G(() => window.__casa.ui.closeOverlay());

// ---- pausa
await G(() => window.__casa.pause());
check('pausa abre', await G(() => !document.getElementById('pause').classList.contains('hidden')));
await page.click('#pause button[data-act="resume"]');
check('pausa fecha', await G(() => document.getElementById('pause').classList.contains('hidden')));

// ---- senha do notebook com nomes personalizados
console.log('   mira notebook:', await T.look(8.6, 4.3, 7.72, 0.9, 4.3));
await T.use();
await T.step(0.2);
check('teclado do notebook abre', await G(() => window.__casa.ui.overlay === 'keypad'));
await G(() => { const i = document.getElementById('keypad-input'); i.value = 'bentolili'; document.getElementById('keypad-ok').click(); });
check('senha antiga (bentolili) recusada com nomes trocados', await G(() => window.__casa.ui.overlay === 'keypad'));
await G(() => { const i = document.getElementById('keypad-input'); i.value = 'Frajola e Mimi'; document.getElementById('keypad-ok').click(); });
await T.step(0.2);
check('senha nova (frajolaemimi) aceita', await G(() => window.__casa.flags.laptopUnlocked === true));
await G(() => { if (window.__casa.ui.overlay) window.__casa.ui.closeOverlay(); });

// ---- sons: toca todos os efeitos e loops
const snd = await G(async () => {
  const eng = window.__casa.audioEngine;
  if (!eng || !eng.ready) return 'sem audio';
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(eng)).filter((n) => n.startsWith('_') && !n.startsWith('_loop_') && !['_noise', '_impulse', '_distCurve', '_dest', '_setPannerPos', '_env', '_src', '_filter', '_osc', '_noiseBurst', '_tone', '_bell'].includes(n));
  const loops = Object.getOwnPropertyNames(Object.getPrototypeOf(eng)).filter((n) => n.startsWith('_loop_')).map((n) => n.slice(6));
  const bad = [];
  for (const n of names) { try { eng.play(n.slice(1), { pos: [1, 1, 1], f: 440 }); } catch (e) { bad.push(n + ':' + e.message); } }
  for (const l of loops) { try { const h = eng.loop(l, { pos: [1, 1, 1] }); if (h) { h.set('level', 0.5); h.set('rate', 1.5); h.stop(0.1); } } catch (e) { bad.push('loop ' + l + ':' + e.message); } }
  try { eng.musicBox([1, 1, 1]); ['menu', 'memory', 'chase', 'dread', 'end', 'nowhere'].forEach((m) => eng.music(m)); eng.music(null); } catch (e) { bad.push('music:' + e.message); }
  return { n: names.length, loops: loops.length, bad };
});
check('todos os sons tocam sem erro', typeof snd === 'object' && snd.bad.length === 0, JSON.stringify(snd));

// ---- captura pelo Inquilino e respawn no checkpoint
await G(() => { const g = window.__casa; g.checkpoint('teste_morte', true); g.player.teleport(4.6, 7.2, Math.PI / 2); g.entity.startHunt({ from: 'c1', duration: 30, exit: 'c1' }); g.entity.state = 'chase'; });
for (let i = 0; i < 30; i++) { await T.step(0.25); await page.waitForTimeout(20); if (await G(() => window.__casa._dying)) break; }
check('ele alcança e captura', await G(() => !!window.__casa._dying || window.__casa.deaths > 0));
await page.waitForTimeout(2500);
for (let i = 0; i < 10; i++) { await T.step(0.3); await page.waitForTimeout(100); }
check('respawn no checkpoint (sem morte permanente)', await G(() => window.__casa.deaths === 1 && window.__casa.entity.state === 'off' && !window.__casa.cutscene), JSON.stringify(await T.state()));

// ---- esconderijo: ele não acha se não viu entrar e se você prende a respiração
await G(() => { const g = window.__casa; g.player.teleport(6.7, 4.6, Math.PI); const h = g.world.hides.find((x) => x.id === 'wardrobe_roxo'); g.player.hideIn(h); g.entity.startHunt({ x: 5.8, z: 5.2, duration: 12, exit: 'c1' }); g.entity.goToPoint(6.7, 4.6); g.entity.state = 'investigate'; g.input.down.add('Space'); });
let caught = false;
for (let i = 0; i < 30; i++) { await T.step(0.25); if (await G(() => !!window.__casa._dying)) { caught = true; break; } }
await G(() => window.__casa.input.down.delete('Space'));
check('escondida + respiração presa = não é pega', !caught);
await G(() => { const g = window.__casa; g.entity.hide(); if (g.player.hidden) g.player.exitHide(); });

check('sem erros de console', T.errors.length === 0, T.errors.join(' | '));
const bad = results.filter((r) => !r[0]).length;
console.log(bad ? `${bad} falha(s)` : 'todos os testes de sistema passaram');
fs.writeFileSync(new URL('./systems-result.txt', import.meta.url), results.map((r) => (r[0] ? 'OK ' : 'ERR') + ' ' + r[1]).join('\n'));
await T.close();
