// vida-guarda: the guard's rules of the life that is seen (22c, rules 213 to 225) shown to bite — a copy of the game's js/ with one
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
  // (22c onda 2: the two of an act)
  ['220', 'um ato de dois sem as suas partes', 'js/anim-duo.js', s => s.replace("kiss: { a: P('duo-beijo',", "beijo: { a: P('duo-beijo',")],
  ['220', 'o cumprimento sem o povo', 'js/anim-duo.js', s => s.replace("if (act === 'greet' || act === 'farewell') return GREET[Anim.greetOf(ctx || {})];", "if (act === 'greet' || act === 'farewell') return GREET.aperto;")],
  ['221', 'as mãos no outro dadas fora do quadro', 'js/vida3d.js', s => s.replace("V3.lefty = v =>", "V3.maos = Lv => { Lv.duo = null; }; V3.lefty = v =>")],
  ['221', 'o gesto de dois num relógio do desenho', 'js/vida3d.js', s => s.replace("const held = papel === 'b' ? v : w; const T = held.actT || 0;", "const held = papel === 'b' ? v : w; const T = s.t || 0;")],
  ['221', 'o leitor movendo um dos dois', 'js/vida3d.js', s => s.replace("if (d > want + 0.45 || d < 0.15) return null;", "if (d > want + 0.45) { w.x = v.x; } if (d < 0.15) return null;")],
  // (22c onda 2, fase 5: the scenes)
  ['222', 'o foco da cena escrito no mundo', 'js/vida3d.js', s => s.replace("funeral: (v, t) => { const b = G.S.buildings.get(t.id);", "funeral: (v, t) => { t.seen = 1; const b = G.S.buildings.get(t.id);")],
  ['222', 'a postura da multidão inventada', 'js/people3d.js', s => s.replace("function crowdPose(v, L) { if (v.moving) return 0; const st = Anim.stateOf(v, 0, L); return POSE_OF[st] || 0; }", "function crowdPose(v, L) { return v.act === 'cheer' ? 3 : 0; }")],
  ['223', 'o leitor mexendo no cão', 'js/vida3d.js', s => s.replace("a.home === v.home && (a.x - v.x) ** 2", "a.home === v.home && (a.pose = 'sit') && (a.x - v.x) ** 2")],
  // (22c onda 2, fase 6: the sounds of the little things, the body the player lives)
  ['224', 'o som da coisinha sorteado', 'js/audio-src.js', s => s.replace("const o = A3.ocioAt(v.id, G.S.clock, ctx, 0); const R = OC_R;", "const o = A3.ocioAt(v.id, G.S.clock + G.vrr(0, 2), ctx, 0); const R = OC_R;")],
  ['225', 'o corpo do jogador sem o porte', 'js/people3d.js', s => s.replace("I.porte = G.Vida3D.read(avFeet, avv, vt, DRAWN);", "I.porte = null;")],
];
// (the opening words of each rule's own message: the rule bit, not another one)
const RULE = { 213: 'o leitor da vida só lê', 214: 'toda tarefa tem pose', 215: 'o porte vem do leitor', 216: 'só o anim-rosto escreve o rosto', 217: 'a coisa do gesto é do inventário', 218: 'a micro-ação é uma conta', 219: 'todo ato do vocabulário tem pose' , 220: 'todo ato de dois tem as duas partes', 221: 'a dois', 222: 'a cena é do mundo', 223: 'o cão da criança é o do mundo', 224: 'a coisinha que soa é a que se vê', 225: 'o corpo do jogador'};
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
for (const e of fs.readdirSync(GAME)) if (e !== 'js') fs.symlinkSync(path.join(GAME, e), path.join(TMP, e));
let bad = 0, n = 0;
// (the game as it is: clean, or the sabotages say nothing)
const guard = () => { try { return cp.execFileSync('node', [path.join(GAME, 'qa', 'guard.js'), TMP], { encoding: 'utf8' }); } catch (e) { return String(e.stdout || ''); } };
cp.execFileSync('cp', ['-r', path.join(GAME, 'js'), path.join(TMP, 'js')]);
{ const out = guard(); const own = out.split('\n').filter(l => Object.values(RULE).some(r => l.startsWith(r))); console.log(`${own.length ? 'FALHOU' : 'PASSOU'} | vida-guarda o jogo como está | ${own.length ? own.slice(0, 3).join(' ‖ ') : 'as regras 213 a 225 limpas'}`); if (own.length) bad++; }
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
