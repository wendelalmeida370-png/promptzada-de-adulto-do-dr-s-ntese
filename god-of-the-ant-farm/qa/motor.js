// motor: node qa/motor.js — as contas do Math dão os mesmos bits no Node e no navegador das provas? (e as versões dos dois)
// O mundo da mesma semente é o mesmo só no mesmo motor de JavaScript: sin, cos, exp, log, pow… não são exatos pelo padrão,
// e cada V8 tem os seus (T-123: no contêiner de 28/10 o Chromium 1194 virou o Chrome 153, e os mundos e os números da
// regressão mudaram com o mesmo código). Quando a regressão muda sem o código mudar: rode isto e compare a versão do
// navegador com a da linha de base (a linha «navegador» do resumo). Só informa: não falha.
const FNS = ['sin', 'cos', 'tan', 'atan', 'atan2', 'asin', 'acos', 'exp', 'log', 'log2', 'log10', 'pow', 'sqrt', 'hypot', 'cbrt', 'tanh', 'sinh', 'cosh', 'expm1', 'log1p'];
// (200 mil entradas de cada função, as mesmas nos dois motores, e uma marca dos bits de cada resultado)
function marks(fns) {
  let a = 12345; const rnd = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646;
  const out = {}; const b = new Float64Array(1); const u = new Uint32Array(b.buffer);
  for (const f of fns) {
    let h = 0; const F = Math[f];
    for (let i = 0; i < 200000; i++) {
      const x = (rnd() - 0.3) * 40, y = (rnd() - 0.3) * 7;
      b[0] = f === 'atan2' || f === 'hypot' ? F(x, y) : f === 'pow' ? F(Math.abs(x) + 0.01, y) : f === 'asin' || f === 'acos' ? F(rnd() * 2 - 1) : ['log', 'log2', 'log10', 'sqrt', 'log1p'].includes(f) ? F(Math.abs(x) + 1e-9) : F(x);
      h = (Math.imul(h, 31) + u[0]) | 0; h = (Math.imul(h, 31) + u[1]) | 0;
    }
    out[f] = h;
  }
  return out;
}
(async () => {
  const node = marks(FNS);
  const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
  const browser = await chromium.launch(); const page = await browser.newPage();
  const web = await page.evaluate(`(${marks.toString()})(${JSON.stringify(FNS)})`); const ver = browser.version();
  await browser.close();
  const diff = FNS.filter(k => node[k] !== web[k]);
  console.log(`Node ${process.version} (V8 ${process.versions.v8}) × navegador ${ver}: ${FNS.length - diff.length} de ${FNS.length} funções do Math iguais; diferem: ${diff.join(', ') || 'nenhuma'}`);
})();
