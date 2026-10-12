// guard: node guard.js [pasta do jogo] — regras de arquitetura lidas direto do código, sem abrir o jogo (leva um segundo)
// cada regra protege uma das fundações; uma exceção nova precisa entrar na lista abaixo, com o motivo
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || path.join(__dirname, '..'), 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const src = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8').split('\n')]));
const fails = [];
// an allowed spot: the file and a piece of the line (and why it may)
const ok = (list, f, line) => list.some(([af, piece]) => af === f && line.includes(piece));

// 1. "quem está a bordo": só Naval.board / Naval.unboard escrevem v.aboard
const ABOARD_OK = [
  ['naval.js', 'v.aboard = s.id; v.task = { type: \'aboard\''], // Nv.board
  ['naval.js', 'v.aboard = 0; if (!keepTask)'], // Nv.unboard
  ['naval.js', 'Nv.aboard = id =>'], // (the ship with that id: not a write to a person)
  ['villagers.js', 'else { v.aboard = 0; v.task = null; }'], // (only when there is no Naval module at all)
  ['save.js', 'v.aboard = 0'], // (a damaged save repaired before the world runs)
];
// 2. "aonde se chega a pé": quem muda muro, prédio no chão ou bloqueio avisa o mapa (touchWalk, typeVer ou invalidateLand) logo ali
const WALK_OK = [
  ['city.js', 'S.wall[i] = 3'], ['city.js', 'if (S.wall[i] === 3) S.wall[i] = 0'], // aqueduct: 0 and 3 are both walkable
  ['siege.js', 'if (S.wall[i] !== want) S.wall[i] = want'], ['siege.js', 'S.wall[gate] = 2'], // a gate opens or shuts: the map counts a gate as a way through either way
  ['save.js', 'S.occ['], // (loading: a new world, a new map)
  ['miracles.js', 'S.wall[i] = 0; S.wallFac[i] = 0; delete S.wallHp[i]; }'], // (inside reshape, which bumps S.typeVer at its end)
];
const WALK_HOOK = /touchWalk|typeVer|invalidateLand/;
for (const f of files) src[f].forEach((line, k) => {
  if (/^\s*\/\//.test(line)) return;
  if (/\b\w+\.aboard\s*=[^=]/.test(line) && !ok(ABOARD_OK, f, line)) fails.push(`a bordo: ${f}:${k + 1} escreve .aboard direto (use G.Naval.board / unboard): ${line.trim().slice(0, 110)}`);
  if (/(wall|occ)\[[^\]]+\]\s*=[^=]|\.blocks\s*=[^=]/.test(line) && !ok(WALK_OK, f, line)) {
    const near = src[f].slice(k, k + 7).join('\n');
    if (!WALK_HOOK.test(near)) fails.push(`caminho: ${f}:${k + 1} muda o chão sem avisar o mapa de alcance (W.touchWalk): ${line.trim().slice(0, 110)}`);
  }
});
if (fails.length) { console.log(fails.join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
console.log(`PASSOU (${files.length} arquivos)`);
