// guarda3d: the rules of the 3D read straight from the code (a second, no browser), after qa/guard.js:
//   node qa/visual/guarda3d.js [PASTA_DO_JOGO]
//   FALHA (exit 1): a file of the 3D outside guard.js's "only seen" list (LOOK: its rule does not reach it); a file of
//   the 3D drawing from the world's chance (G.R, rr, ri, pick, chance); a file of the 3D writing a list of the god's view it
//   draws too (the words over the heads, G.Talk.list; the texts and particles of G.FX: only read, L-211); the internet at run time (fetch, XMLHttpRequest,
//   a URL to load — the game opens by file://, no CDN); a <script> of index.html that does not exist; the texture stack over
//   its budget (arte/ESTUDIO.md §2: 512×512 a material, 6 MB of base64 in all)
//   AVISO: a file of the 3D that seems to write the world (G.S.x = …), a new file of js/ no <script> loads, the weight of
//   the 3D's own data files (textures, meshes)
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const dir = path.join(ROOT, 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const src = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));
const fails = [], warns = [], info = [];
// (who answers for a file: arte/ESTUDIO.md §3)
const OWN = { 'build3d.js': 'A2', 'props3d.js': 'A2', 'ground3d.js': 'A3', 'grass3d.js': 'A3', 'people3d.js': 'A4', 'body3d.js': 'A4', 'bodymesh.js': 'A4', 'fx3d.js': 'A5', 'post3d.js': 'A5', 'cam3d.js': 'A5', 'incui.js': 'A1', 'diario-ui.js': 'A1', 'mesh3d.js': 'A1', 'tex3d.js': 'A1' };
const own = f => OWN[f] || 'líder';
// the files of the 3D: the ones the contract names, and any new one that looks like it (…3d.js, a mesh, a post-process)
const KNOWN = ['space.js', 'tex3d.js', 'ground3d.js', 'realm3d.js', 'build3d.js', 'people3d.js', 'fx3d.js', 'dragon3d.js', 'things3d.js', 'grass3d.js', 'cam3d.js', 'input3d.js', 'incui.js', 'diario-ui.js', 'modes.js', 'props3d.js', 'body3d.js', 'bodymesh.js', 'post3d.js', 'mesh3d.js'];
const is3D = f => KNOWN.includes(f) || /3d\.js$/i.test(f) || /^(mesh|post|body)[\w-]*\.js$/.test(f);
const D3 = files.filter(is3D);
// guard.js's own list of what is only seen
const gsrc = fs.existsSync(path.join(ROOT, 'qa', 'guard.js')) ? fs.readFileSync(path.join(ROOT, 'qa', 'guard.js'), 'utf8') : '';
const lm = gsrc.match(/const LOOK = \[([\s\S]*?)\];/); const LOOK = lm ? [...lm[1].matchAll(/'([\w.-]+\.js)'/g)].map(m => m[1]) : [];
if (!lm) warns.push('guard.js: a lista LOOK não foi encontrada (a regra 3 do guard mudou de forma?)');
// (the code of a file without its comments and strings' insides — enough for these rules)
const code = s => s.split('\n').map(l => (/^\s*\/\//.test(l) ? '' : l.replace(/\/\/[^'"`]*$/, '')));
for (const f of D3) {
  if (!LOOK.includes(f)) fails.push(`[líder] ${f} é do 3D mas não está na lista LOOK do qa/guard.js: a regra "o que só se vê não tira do acaso do mundo" não chega a ele`);
  const L = code(src[f]);
  L.forEach((l, k) => {
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\()/.test(l)) fails.push(`[${own(f)}] ${f}:${k + 1} desenho tirando do acaso do mundo (use G.VR, vrr, vri, vpick, vchance): ${l.trim().slice(0, 110)}`);
    if (/\bfetch\s*\(|XMLHttpRequest|\bimport\s*\(|new\s+Worker\s*\(\s*['"`]http/.test(l)) fails.push(`[${own(f)}] ${f}:${k + 1} carrega algo em tempo de execução (o jogo abre por file://: sem fetch, sem rede): ${l.trim().slice(0, 110)}`);
    if (/['"`]https?:\/\/[^'"`]+\.(js|png|jpe?g|webp|gltf|glb|bin|ktx2?|hdr|json|wasm)\b/i.test(l)) fails.push(`[${own(f)}] ${f}:${k + 1} depende de um arquivo na internet: ${l.trim().slice(0, 110)}`);
    // (the world written from the drawing: a suspicion to look at, not a proof — the guard's rule 9 and the runtime check of caca.js are the proofs)
    // (the god's view's own lists — the words over the heads, G.Talk.list; the little texts and the particles of G.FX — the 3D
    // draws too, only reading them: the god's view keeps them, L-211)
    if (/\bG\.(Talk\.list|FX\.(floaters|list|rings|glows|bolts))\s*(=(?!=)|\.(push|splice|shift|pop|unshift|sort|reverse|fill)\(|\.length\s*=(?!=))/.test(l)) fails.push(`[${own(f)}] ${f}:${k + 1} o 3D escreve numa lista da vista do deus (as falas, os efeitos), que ele só lê (L-211): ${l.trim().slice(0, 110)}`);
    if (/\bG\.S\.\w+(\[[^\]]*\])?(\.\w+)*\s*(=(?!=)|\+\+|--|\+=|-=)/.test(l) && f !== 'modes.js') warns.push(`[${own(f)}] ${f}:${k + 1} parece escrever no mundo (G.S…): ${l.trim().slice(0, 110)}`);
  });
}
// index.html: every script there, and every file of js/ in a script
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
for (const s of scripts) { if (/^https?:/.test(s)) fails.push(`[líder] index.html carrega ${s} da internet`); else if (!fs.existsSync(path.join(ROOT, s))) fails.push(`[líder] index.html carrega ${s}, que não existe`); }
for (const f of files) if (!scripts.includes('js/' + f)) warns.push(`[${own(f)}] js/${f} não é carregado por nenhum <script> do index.html (código morto, ou falta a linha)`);
const order = scripts.map(s => path.basename(s)); const i3 = order.indexOf('three.min.js');
for (const f of D3) { const k = order.indexOf(f); if (k >= 0 && i3 >= 0 && k < i3 && f !== 'space.js') warns.push(`[${own(f)}] ${f} é carregado antes do three.min.js`); }
// the texture stack: its budget, and each picture's size read from its own header (webp, png, jpeg)
const dims = b64 => {
  const b = Buffer.from(b64.slice(0, 120), 'base64');
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') { const t = b.slice(12, 16).toString();
    if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (t === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; } }
  if (b[0] === 0x89 && b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) { const B = Buffer.from(b64, 'base64'); for (let i = 2; i < B.length - 9;) { if (B[i] !== 0xff) { i++; continue; } const m = B[i + 1]; if (m >= 0xc0 && m <= 0xc3) return [B.readUInt16BE(i + 7), B.readUInt16BE(i + 5)]; i += 2 + B.readUInt16BE(i + 2); } }
  return null;
};
if (src['tex3d.js']) {
  const T = [...src['tex3d.js'].matchAll(/^\s*([\w]+): \{ m: ([\d.]+),[^\n]*?src: '(data:image\/(\w+);base64,([^']+))'/gm)];
  let total = 0; const big = [];
  for (const m of T) { total += m[5].length; const d = dims(m[5]); if (!d) warns.push(`[A1] tex3d.js: ${m[1]} — não deu para ler o tamanho da figura (${m[4]})`); else if (d[0] > 512 || d[1] > 512) big.push(`${m[1]} ${d[0]}×${d[1]}`); }
  info.push(`tex3d.js: ${T.length} materiais, ${(total / 1048576).toFixed(2)} MB de base64 (orçamento 6 MB), arquivo ${(src['tex3d.js'].length / 1048576).toFixed(2)} MB`);
  if (total > 6 * 1048576) fails.push(`[A1] tex3d.js: ${(total / 1048576).toFixed(2)} MB de base64 — acima do orçamento de 6 MB (arte/ESTUDIO.md §2)`);
  if (big.length) fails.push(`[A1] tex3d.js: figuras maiores que 512×512 (orçamento por material): ${big.join(', ')}`);
  if (!T.length) warns.push('[A1] tex3d.js: nenhum material reconhecido (o formato mudou?)');
}
// the 3D's own data: meshes made outside, other generated files
for (const f of D3) { const kb = src[f].length / 1024; if (kb > 300) info.push(`${f}: ${kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(0) + ' KB'}`); }
const meshes = files.filter(f => /G\.MESH3D\.\w+\s*=/.test(src[f])); if (meshes.length) info.push(`malhas (G.MESH3D): ${meshes.map(f => `${f} ${(src[f].length / 1024).toFixed(0)} KB`).join(', ')}`);
info.push(`arquivos do 3D: ${D3.join(', ')} (${(D3.reduce((s, f) => s + src[f].length, 0) / 1048576).toFixed(2)} MB)`);
for (const l of info) console.log('info: ' + l);
for (const l of warns) console.log('AVISO: ' + l);
for (const l of fails) console.log('FALHA: ' + l);
console.log(fails.length ? `FALHOU: ${fails.length} (avisos ${warns.length})` : `PASSOU (${D3.length} arquivos do 3D; avisos ${warns.length})`);
process.exit(fails.length ? 1 : 0);
