// porta-deus: a porta do deus no lado em que a planta a abre (L-264) — em Node, sem navegador e sem mundo gerado:
//   (a) a regra das faces: para cada lado da porta (S, L, N, O) e cada quarto da vista, a face da tela em que o desenho de
//       antes mostra a porta (Render.doorView: como é, espelhado, ou sem porta) é a mesma em que a casa desenhada pela casca
//       a mostra (Arch.homeGeo, D-082) — as duas portas do deus andam juntas, e a da casca anda com o 3D (fidelidade.js);
//   (b) o desenho sem porta: todo tipo com planta desenhado pelo desenho de antes muda quando perde a porta (o tipo que não
//       muda tem de estar na lista SEM_PORTA, com o motivo), e o desenho sem porta nunca ganha nada.
//   node qa/visual/porta-deus.js
'use strict';
const path = require('path');
const F = require('./fidelidade-lib.js');
const { G, M } = F.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | porta-deus ${name} | ${info}`); if (!c) fails.push(name); };
const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const R = G.Render, A = G.Arch, In = G.Interiors;
F.blank();

// ------------------------------ (a) the faces ------------------------------
// (the face of the screen a home drawn from its shell shows its door on: the sprite's L face is the screen's front-left one
// on the even quarters and the front-right one on the odd, mirrored; R the other way round; none on the sides behind)
const screenOf = (face, q) => (!face ? '-' : (face === 'L') === (q % 2 === 0) ? 'FL' : 'FR');
const bad = []; let n = 0;
{
  const b = F.put('house', 'romano', 5101);
  for (const s of ['S', 'E', 'N', 'W']) {
    b.ip.s = s; b.ip.r = (b.ip.r || 0) + 1; // (a record of another door side: a shell of its own)
    const sh = In.shellOf(b); if (!sh || !sh.entrance || sh.entrance.side !== s) { bad.push(`a casca não abriu a porta em ${s}`); continue; }
    for (let q = 0; q < 4; q++) {
      const H = A.homeGeo(b, sh, q); const home = screenOf(H && H.door && H.door.face, q);
      const dv = R.doorView({ type: 'storehouse', ip: { s } }, q); const pic = dv.back ? '-' : dv.m > 0 ? 'FL' : 'FR';
      n++; if (home !== pic) bad.push(`porta ${s}, quarto ${q}: a casca na ${home}, o desenho de antes na ${pic}`);
    }
  }
  F.drop(b);
}
ok('as faces da porta', !bad.length, bad.length ? bad.join(' · ') : `${n} casos (4 lados × 4 quartos): a porta do desenho de antes na face em que a casa pela casca a mostra`);

// ------------------------------ (b) the picture without its door ------------------------------
// (the pictures of a type with a plan that have no door of their own to hide — type, or type/people —, with why; the block
// of houses keeps its houses' doors: Render.doorView leaves it as it is)
const SEM_PORTA = {
  mercado: 'as bancas abertas', feira: 'o chão da feira, numa camada própria', quarteirao: 'as casas do bloco, cada uma com a sua porta',
  praca: 'o chão aberto da praça (a planta do P4 pela forma): entra-se de todo lado, não há porta',
  'storehouse/egipcio': 'os silos de cúpula', 'celeiro/egipcio': 'os silos de cúpula', 'celeiro/asteca': 'os silos de barro',
  'banhos/egipcio': 'o lago sagrado', 'banhos/classico': 'as termas: as janelas em arco e a cúpula', 'banhos/grego': 'as termas', 'banhos/romano': 'as termas',
  'palacio/classico': 'a frente de colunas', 'palacio/grego': 'a frente de colunas', 'palacio/romano': 'a frente de colunas', 'palacio/asteca': 'o pórtico de colunas',
  'paco/asteca': 'o pórtico', 'insula/romano': 'as lojas do térreo (sem a porta da casa)',
};
const semPorta = (type, st) => SEM_PORTA[type] || SEM_PORTA[type + '/' + st];
const same = [], grew = []; let m = 0;
for (const type of Object.keys(In.TYPES)) {
  if (A.fromShell(type) || A.HOMES[type]) continue; // (drawn from the shell: the door is the shell's — the homes once D-082 is on)
  for (const st of STY) {
    const b = F.put(type, st, 7000 + m * 7);
    const g0 = F.god(b, { shell: undefined }), g1 = F.god(b, { shell: undefined, noDoor: true });
    F.drop(b); m++;
    if (g0.none) continue;
    const fill = g => g.ops.filter(o => o.f).length;
    if (fill(g1) > fill(g0)) grew.push(`${type}/${st}`);
    else if (fill(g1) === fill(g0) && !semPorta(type, st)) same.push(`${type}/${st}`);
  }
}
ok('o desenho sem porta', !same.length && !grew.length, same.length || grew.length ? `${same.length ? 'não muda sem a porta: ' + same.join(', ') : ''}${grew.length ? ' ganha sem a porta: ' + grew.join(', ') : ''}` : `${m} tipos e povos com planta: todo desenho de antes perde a porta (menos os sem porta própria: ${Object.keys(SEM_PORTA).join(', ')})`);
// (and the homes' pictures of before, until D-082 is on)
{ const same2 = []; for (const type of Object.keys(A.HOMES)) for (const st of STY) { const b = F.put(type, st, 7900 + st.length); const g0 = F.god(b, { shell: undefined }), g1 = F.god(b, { shell: undefined, noDoor: true }); F.drop(b); if (!g0.none && !semPorta(type, st) && g1.ops.filter(o => o.f).length >= g0.ops.filter(o => o.f).length) same2.push(`${type}/${st}`); }
  ok('as casas de antes sem porta', !same2.length, same2.length ? `não muda: ${same2.join(', ')}` : `${Object.keys(A.HOMES).length * STY.length} casas: todas perdem a porta`); }
const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
