// vida-guarda: the guard's rules of the life that is seen (22c, rules 213 to 219) shown to bite — a copy of the game's js/ with one
// line broken on purpose (the rest of the game linked, not copied), qa/guard.js run on it, and the rule's own words looked for in
// what it says. A rule that lets its sabotage through is a rule that guards nothing.
//   node qa/vida-guarda.js            ONLY=213,215 for some rules
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const GAME = path.resolve(__dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'vida-guarda-'));
// (each sabotage: the rule, the file, the change)
const CASES = [
  ['213', 'o leitor escreve numa pessoa', 'js/vida3d.js', s => s.replace("V3.tired = v => (", "V3.tired = v => (v.act = 'x', ")],
  ['213', 'o leitor tira de um acaso', 'js/vida3d.js', s => s.replace("V3.tired = v => (", "V3.tired = v => (G.VR(), ")],
  ['214', 'uma tarefa sem pose', 'js/vida3d.js', s => s.replace("water: MOVE,", "")],
  ['214', 'um estado que não existe', 'js/vida3d.js', s => s.replace("funeral: 'mourn',", "funeral: 'chorarMuito',")],
  ['215', 'o porte escrito fora do leitor', 'js/anim-body.js', s => s.replace("Anim.drive = function (a, I, out, L, dt) {", "Anim.drive = function (a, I, out, L, dt) { const pz = I.porte || (L.porte = {}); ")],
  ['215', 'o porte somado nas pernas', 'js/anim-porte.js', s => s.replace("both('elL', 'elR', 0.25 * p.velho);", "both('elL', 'elR', 0.25 * p.velho); add('knL', 0.1 * p.velho);")],
  ['215', 'o porte lido da pessoa', 'js/anim-porte.js', s => s.replace("const p = a.pz; if (!p) return out;", "const p = a.pz || (v => v.porte)({}); if (!p) return out;")],
  ['216', 'o rosto escrito fora do anim-rosto', 'js/people3d.js', s => s.replace("  P3.clipClock = clipClock;", "  P3.clipClock = clipClock; const zz = p => { p.face[0] = 1; };")],
  ['216', 'um canal do rosto que não existe', 'js/anim-rosto.js', s => s.replace("T[X.cry] += 0.6 * p.luto;", "T[X.cry] += 0.6 * p.luto; T[X.olheira] = 1;")],
  ['217', 'uma coisa na mão de um gesto da vida', 'js/vida-clips.js', s => s.replace("K('bound-andar', { dur: 2,", "K('bound-andar', { dur: 2, item: { hand: 'mao', key: 'caneca' },")],
  ['217', 'o leitor pondo uma coisa na mão', 'js/vida3d.js', s => s.replace("V3.lefty = v =>", "V3.dar = L => { L.held = { form: 'caneca' }; }; V3.lefty = v =>")],
  ['218', 'a micro-ação sorteada', 'js/anim-ocio.js', s => s.replace("const Anim = G.Anim3D = G.Anim3D || {};", "const Anim = G.Anim3D = G.Anim3D || {}; const sorte = () => G.vrr(0, 1);")],
  ['218', 'a micro-ação no relógio da máquina', 'js/anim-ocio.js', s => s.replace("const Anim = G.Anim3D = G.Anim3D || {};", "const Anim = G.Anim3D = G.Anim3D || {}; const agora = () => performance.now();")],
  ['219', 'um ato do vocabulário sem pose', 'js/soc-atos.js', s => s.replace("pet: ['afeto', 1, 0.6, '', 3],", "pet: ['afeto', 1, 0.6, '', 3], zzzNovo: ['zzzFam', 0, 0, '', 3],")],
];
// (the opening words of each rule's own message: the rule bit, not another one)
const RULE = { 213: 'o leitor da vida só lê', 214: 'toda tarefa tem pose', 215: 'o porte vem do leitor', 216: 'só o anim-rosto escreve o rosto', 217: 'a coisa do gesto é do inventário', 218: 'a micro-ação é uma conta', 219: 'todo ato do vocabulário tem pose' };
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
for (const e of fs.readdirSync(GAME)) if (e !== 'js') fs.symlinkSync(path.join(GAME, e), path.join(TMP, e));
let bad = 0, n = 0;
// (the game as it is: clean, or the sabotages say nothing)
const guard = () => { try { return cp.execFileSync('node', [path.join(GAME, 'qa', 'guard.js'), TMP], { encoding: 'utf8' }); } catch (e) { return String(e.stdout || ''); } };
cp.execFileSync('cp', ['-r', path.join(GAME, 'js'), path.join(TMP, 'js')]);
{ const out = guard(); const own = out.split('\n').filter(l => Object.values(RULE).some(r => l.startsWith(r))); console.log(`${own.length ? 'FALHOU' : 'PASSOU'} | vida-guarda o jogo como está | ${own.length ? own.slice(0, 3).join(' ‖ ') : 'as regras 213 a 219 limpas'}`); if (own.length) bad++; }
for (const [rule, name, file, f] of CASES) {
  if (ONLY && !ONLY.has(rule)) continue; n++;
  const p = path.join(TMP, file), orig = path.join(GAME, file);
  if (!fs.existsSync(orig)) { console.log(`FALHOU | vida-guarda ${rule} ${name} | ${file} não existe`); bad++; continue; }
  const s0 = fs.readFileSync(orig, 'utf8'), s1 = f(s0);
  if (s1 === s0) { console.log(`FALHOU | vida-guarda ${rule} ${name} | o trecho a sabotar não foi achado em ${file}`); bad++; continue; }
  fs.writeFileSync(p, s1); const out = guard(); fs.writeFileSync(p, s0);
  const hit = out.split('\n').filter(l => l.startsWith(RULE[rule]));
  console.log(`${hit.length ? 'PASSOU' : 'FALHOU'} | vida-guarda ${rule} ${name} | ${hit.length ? 'acusada: ' + hit[0].slice(0, 200) : 'NÃO ACUSADA'}`); if (!hit.length) bad++;
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(bad ? `VIDA-GUARDA: ${bad} falha(s)` : `VIDA-GUARDA: ok (${n} sabotagens acusadas)`);
process.exit(bad ? 1 : 0);
