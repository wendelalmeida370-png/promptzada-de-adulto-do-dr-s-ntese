// Utilitários de teste automatizado (Playwright + Chromium headless).
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const OUT = process.env.SHOTS || path.join(__dirname, 'shots');

// fontes do Google: baixadas uma vez com o curl (que confia no proxy) e servidas do cache local
const FONT_CACHE = path.join(__dirname, '.cache');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
async function fontRoute(route) {
  const url = route.request().url();
  const css = url.includes('fonts.googleapis.com');
  const f = path.join(FONT_CACHE, crypto.createHash('md5').update(url).digest('hex'));
  let body = '';
  try {
    if (!fs.existsSync(f)) { fs.mkdirSync(FONT_CACHE, { recursive: true }); execFileSync('curl', ['-sS', '-f', '-A', UA, url, '-o', f], { timeout: 30000 }); }
    body = fs.readFileSync(f);
  } catch (e) { body = ''; }
  await route.fulfill({ status: 200, contentType: css ? 'text/css; charset=utf-8' : 'font/woff2', body, headers: { 'access-control-allow-origin': '*' } });
}

export async function open(opts = {}) {
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: opts.w || 1280, height: opts.h || 720 } });
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, fontRoute);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); else if (m.text().startsWith('[dbg]')) console.log('   ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 6).join('\n')));
  const url = 'file://' + path.resolve(__dirname, '..', 'index.html') + (opts.query || '');
  await page.goto(url);
  await page.waitForFunction(() => !!window.__casa, null, { timeout: 30000 });
  if (!opts.live) await page.evaluate(() => { window.__casa.testMode = true; });
  const T = {
    page, browser, errors,
    ev: (fn, arg) => page.evaluate(fn, arg),
    // avança o tempo do jogo sem depender do FPS
    step: (sec) => page.evaluate(async (s) => { const g = window.__casa; const n = Math.round(s / 0.05); for (let i = 0; i < n; i++) { if (g.state === 'playing' && !g.ui.paused) g.update(0.05); for (let k = 0; k < 4; k++) await Promise.resolve(); } }, sec),
    shot: async (name, wait = 300) => { await page.waitForTimeout(wait); await page.screenshot({ path: OUT + '/' + name + '.png' }); },
    state: () => page.evaluate(() => { const g = window.__casa; return { phase: g.story.phase, obj: g.story.objId, act: g.flags.act, pos: [+g.player.pos.x.toFixed(2), +g.player.pos.z.toFixed(2)], hover: g.hover && g.hover.id, inv: g.inventory.list(), overlay: g.ui.overlay, cut: g.cutscene, sim: Math.round(g.story.sim()), ent: g.entity.state, battery: Math.round(g.phone.battery) }; }),
    // posiciona e olha para um ponto
    look: (x, z, tx, ty, tz) => page.evaluate(([x, z, tx, ty, tz]) => { const g = window.__casa; g.player.teleport(x, z); const e = g.player.eye; g.player.yaw = Math.atan2(-(tx - e.x), -(tz - e.z)); g.player.pitch = Math.atan2(ty - e.y, Math.hypot(tx - e.x, tz - e.z)); g.player.apply(); g.updateHover(); return g.hover ? g.hover.id : null; }, [x, z, tx, ty, tz]),
    // interage com o que estiver na mira
    use: () => page.evaluate(() => { const g = window.__casa; g.updateHover(); const id = g.hover ? g.hover.id : null; g.interact(); return id; }),
    closeOverlay: (v) => page.evaluate((v) => { const g = window.__casa; if (g.ui.overlay) g.ui.closeOverlay(v); }, v),
    close: () => browser.close(),
  };
  return T;
}
