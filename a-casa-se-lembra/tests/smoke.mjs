// Teste rápido: abre o jogo, captura erros e tira screenshots.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const { chromium } = pw;
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.SHOTS || path.join(__dirname, 'shots');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + '\n' + e.stack));
await page.goto(url);
await page.waitForTimeout(4000);
await page.screenshot({ path: OUT + '/01_menu.png' });
await page.click('button[data-act="new"]');
await page.waitForTimeout(16000);
await page.screenshot({ path: OUT + '/02_intro.png' });
const info = await page.evaluate(() => { const g = window.__casa; return { phase: g.story.phase, obj: g.story.objId, pos: [g.player.pos.x, g.player.pos.z], fps: null }; });
console.log(JSON.stringify(info));
console.log(errors.slice(0, 30).join('\n'));
await browser.close();
