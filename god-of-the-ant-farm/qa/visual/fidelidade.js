// fidelidade: o prédio da visão de Deus e o do Modo Encarnado são a mesma construção? (Parte 6 do Patch 2) — em Node,
// sem navegador e sem mundo gerado: um mundo de mentira, plano, montado à mão, e em cada lote um prédio pronto de cada tipo
// e de cada povo (o registro da planta feito como o mundo o faz na fundação, a porta ao sul — a face da porta do deus).
// (a) A massa: o desenho do deus é gravado enquanto ele pinta; o 3D (a figura de perto e a de longe) é projetado pela
// câmera da descida (D-016: 1 m de altura = 3,04 px do deus); as duas figuras são pintadas na mesma grade e medidas do
// mesmo jeito: a silhueta (o quanto as duas se cobrem), a altura do alto, a largura por faixa, a linha do chão, as
// aberturas (janelas, portas, arcos: as manchas escuras das faces) e a figura de longe. Cada tipo e povo sai com a mesma
// massa (=), a mesma massa com perdas (≈) ou outra massa (≠), com o motivo. A massa é o que se pode medir sem saber o que o
// prédio é: duas massas iguais podem ter arquiteturas diferentes (uma colunata e uma parede lisa) — por isso:
// (b) A forma, onde o G.Forma a define (js/forma.js): o deus contra a forma e o 3D contra a forma, pelo que ela diz (a
// planta vista de cima, as alturas, as colunas, os arcos, os andares). Um tipo com forma tem de passar nas duas — onde o 3D
// o desenha pela forma (Build3D.byForm): sem casca, casca aberta ou casca sobre o corpo da forma; um templo com a planta de
// uma família de antes da forma é a casca dela (L-c), e só a massa é medida (a catraca), até a família da forma (D-093).
//   node qa/visual/fidelidade.js [tipo,tipo...] [povo,povo...]
//   IDS=n prédios por tipo e povo (3; cada um com os seus dados e, nos de planta, a família que o registro escolhe)
//   CASCA=0  as casas como o deus as desenhava antes da casca (D-082, ligada na fase C), para comparar
//   PLANTA=0  os prédios sem registro nem planta: o 3D os desenha pelo KIT — os tipos com forma, por ela —, para conferir a
//            forma de um tipo com planta antes da família pela forma (D-093); a catraca não vale assim
//   PNG=pasta  as figuras: uma folha por tipo, os seis povos — o deus, o 3D de perto, o 3D de longe
//   JSON=arquivo  os números de cada caso      VERB=1  o motivo de cada um que não é igual
//   DENTRO=gravar  grava a linha de base da cor por dentro (qa/visual/base/fidelidade-dentro.json; DENTRO_BASE=arquivo, outra):
//            o quanto, onde as duas figuras cobrem, a cor difere — por tipo e povo; dez pontos acima da linha é falha (T-254)
// Falha: um tipo com forma que não tem a massa do deus ou não segue a forma; outra massa (≠) em mais tipos e povos do que o
// teto (a catraca: só desce — baixou, desça o teto); um erro do jogo.
'use strict';
const path = require('path'), fs = require('fs');
const F = require('./fidelidade-lib.js');
const clock = () => Number(process.hrtime.bigint() / 1000000n);
const t0 = clock();
const { G, M } = F.load();
if (process.env.CASCA === '0') G.Arch.homeOn = false; // (CASCA=0: the homes as the god drew them before their shells — D-082 —, to compare)
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const POVOS = process.argv[3] ? process.argv[3].split(',') : STY;
const NID = +(process.env.IDS || 3);
const SEMPLANTA = process.env.PLANTA === '0'; // (no record, no plan: the kit's drawing, the form's where it has one)
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | fidelidade ${name} | ${info}`); if (!c) fails.push(name); };

// ------------------------------ the limits ------------------------------
// (by principle: two pictures of one shell — the 3D's near and far figures, which D-038 makes the same building, one of them
// simplified — differ by this much at most: measured once on the 156 shells of the 26 types with a plan × 6 peoples, the
// overlap of the silhouettes p10 0.82 (median 0.89), the tops within ±1.2 m (p10, p90), the width band by band p90 0.13 of
// the lot, the foot line p90 2.6 px; two buildings of one family of plan, other dice: overlap p10 0.82, median 0.97. The
// god's picture and the 3D have the same mass (=) when they differ no more than that; the same mass with losses (≈) when the
// silhouettes still cover each other by two thirds, the tops within a quarter, the widths within a quarter. Never loosened
// to pass: a building that does not pass is fixed, or counted under the ceiling below until its phase fixes it)
const LIM = { iou: 0.80, top: 1.3, topK: 0.10, prof: 0.15, foot: 3.0 };
const FAR = { iou: 0.70, top: 1.5, topK: 0.15 }; // (the far figure is the near one simplified: one difference more)
const ROUGH = { iou: 0.65, topK: 0.25, prof: 0.25 };
// (the openings, only where the god shows rows of them — a facade of windows, an arcade —: the 3D shows between half and
// twice as many; where the god shows a door or two, the 3D shows one at least)
const openOk = c => (c.openA >= 6 ? c.openB >= c.openA * 0.5 && c.openB <= c.openA * 2 : c.openA ? c.openB >= 1 : true);
function verdict(cn, cf) {
  if (cn.empty) return { v: '≠', why: [cn.empty === 'deus' ? 'o deus não desenha nada' : 'o 3D não desenha nada'] };
  const why = []; const topLim = Math.max(LIM.top, LIM.topK * cn.topA);
  if (cn.iou < LIM.iou) why.push(`silhueta ${cn.iou.toFixed(2)}`);
  if (Math.abs(cn.dTop) > topLim) why.push(`alto ${cn.topA.toFixed(1)}→${cn.topB.toFixed(1)} m`);
  if (cn.dProf > LIM.prof) why.push(`largura ${cn.dProf.toFixed(2)}`);
  if (cn.dFoot > LIM.foot) why.push(`pé ${cn.dFoot.toFixed(1)} px`);
  if (!openOk(cn)) why.push(`aberturas ${cn.openA}→${cn.openB}`);
  if (cf && !cf.empty) { if (cf.iou < FAR.iou) why.push(`longe ${cf.iou.toFixed(2)}`); if (Math.abs(cf.dTop) > Math.max(FAR.top, FAR.topK * cf.topA)) why.push(`alto de longe ${cf.topA.toFixed(1)}→${cf.topB.toFixed(1)} m`); }
  if (!why.length) return { v: '=', why };
  const rough = cn.iou >= ROUGH.iou && Math.abs(cn.dTop) <= ROUGH.topK * cn.topA && cn.dProf <= ROUGH.prof;
  return { v: rough ? '≈' : '≠', why };
}
// (the ratchet: how many types and peoples have another mass today, with IDS=3 — it may only go down; a change that raises
// it made a building of the god's view and the body's two buildings: fix it, or the leader agrees and the commit says why.
// 190 on the v37, 87090a0: 4 with the same mass, 58 with losses, 190 another — the shells fill the lot where the god keeps
// a yard, the monuments are the KIT's own shapes, the jail has no picture of the god at all; 184 with the wonders from
// their form, counted apart since — B3; 174 with the monuments and the golden statue from theirs — D1; 168 with the jail
// drawn by the god from its shell — L-265; 166 with the theatres from their forms; 156 with the watchtower, the aqueduct,
// the library, the administration, the tax office and the smugglers' market from theirs — Phase E; 150 with the square — D-093;
// 138 with the mine and the well — D-092; 120 with the silk house, the salting yard and the divers' house from theirs; 118 with
// the pens and the salt pans measured, the same mass — their rows move the ids of the types after them: the Aztecs' tavern and
// two great palaces ≈ by theirs, the Roman paço ≠; 104 with the homes in the god's typology and the tavern's yard — P4's B2c
// and B2d: the Aztecs' and the Norse's house, the sobrado and the ínsula of four peoples ≈, the tavern ≈ in all six; 90 with
// the homes drawn by the god from their shells — Arch.homeOn, D-082, phase C: the hut and the house of the six peoples, the
// sobrado and the ínsula = or ≈; 84 with the pottery and the tavern drawn from theirs, their yards (P4's B2d) in both views,
// near and far: the pottery = in five peoples, the tavern in five, the rest ≈; 59 with the market, the granaries, the
// palaces, the baths and the paço from their forms — phases D and E —; 60 with the fields measured — T-150, L-393: 16 = and 8 ≈ of
// their own, none ≠ —, their buildings shifting the dice of the types after them: the Aztec great palace now drawn of the family
// pal-peristilo.andar, two storeys in the 3D against the god's one, another mass the old dice did not see)
const TETO = 60;

// ------------------------------ the round ------------------------------
// (the kinds the god paints in a layer of its own, not as a building's picture: what its hooks paint for a building is recorded
// with the picture now — F.layer, T-150 —, and the pens, the pans of salt, the orchard, the plantation, the vineyard and the
// apiary are compared as the rest, the fields sown as the world sows them (sow, below). Still apart: the fair — its stalls the
// god's, its plan P4's: D-093 —, the garden, and what render.js paints itself — the farm, the graveyard, the fenced field, the
// campfire, the ruin)
const OWN_LAYER = { campfire: 1, farm: 1, cemetery: 1, cercado: 1, ruin: 1, feira: 1, horta: 1 };
// (the fields of the proof, T-150: each with a crop of its people — the first the one its people loves, estates.js LOVE; the
// other two the rest of its field's kinds —, the first grown and bearing, its vat with must and two jars by it, the second
// grown and with little fruit, the third grown and picked; the vat at the ninth place where its crop is crushed. Not what
// is thinner than the lines the god's picture here keeps — strokeSegs drops a line under 0.55 px, the 3D draws its bar as
// thin —: the saplings of the first days (0.71 of the silhouette; 0.99 with the god's thin lines kept), the half-grown date
// palm and frankincense (0.61, 0.60), the açaí, whose fronds are a quarter of a pixel at an orchard's size (0.29))
const SOWN = {
  pomar: { classico: ['olive', 'apple', 'mulberry'], grego: ['olive', 'mulberry', 'date'], romano: ['olive', 'apple', 'banana'], egipcio: ['date', 'olive', 'banana'], asteca: ['banana', 'apple', 'mulberry'], nordico: ['apple', 'mulberry', 'olive'] },
  plantacao: { classico: ['coffee', 'cacao', 'pepper'], grego: ['coffee', 'incense', 'cacao'], romano: ['coffee', 'pepper', 'incense'], egipcio: ['incense', 'coffee', 'cacao'], asteca: ['cacao', 'pepper', 'coffee'], nordico: ['pepper', 'coffee', 'cacao'] },
  vinhedo: { classico: ['grape', 'grape', 'grape'], grego: ['grape', 'grape', 'grape'], romano: ['grape', 'grape', 'grape'], egipcio: ['grape', 'grape', 'grape'], asteca: ['grape', 'grape', 'grape'], nordico: ['grape', 'grape', 'grape'] },
};
function sow(b, style, q) {
  const crops = SOWN[b.type] && SOWN[b.type][style]; if (!crops) return;
  b.crop = crops[q % 3]; const press = G.Estates.CROPS[b.crop].press; const st = [{ g: 1, f: 1.5 }, { g: 1, f: 0.5 }, { g: 1, f: 0 }][q % 3];
  b.pl = Array.from({ length: 9 }, (_, k) => (press && k === 8 ? { g: -1, f: 0 } : { g: st.g, f: st.f }));
  if (press && q % 3 === 0) { b.must = 2; b.inv = b.crop === 'grape' ? { vinho: 2 } : { azeite: 2 }; }
}
const FORMA = G.Forma || null; // (js/forma.js: the form of a type and a people, or null — the shell is its form)
// (a hole: a picture of which more than half a percent only the backs of faces cover — the rest is a sliver between two
// pieces, a stone's edge; L-271 was 1–2% of every Egyptian building)
const HOLE = 0.005;
F.blank();
const rows = []; const per = new Map(); const sheets = new Map(); const other = new Set(); const formed = new Set(); const holes = []; const dentro = {}; // (formed: the types and peoples drawn by their form, 'tipo/povo')
// (the shapes every builder uses, each face wound out of it: L-270)
{ const sw = F.shapesWound(); const bad = Object.entries(sw).filter(([, s]) => s.inward); ok('as formas do 3D enroladas para fora', !bad.length, bad.length ? bad.map(([k, s]) => `${k}: ${s.inward} de ${s.faces} faces para dentro`).join(', ') : `${Object.keys(sw).length} formas, todas as faces para fora`); }
for (const type of Object.keys(G.BDEF)) {
  if (ONLY && !ONLY.includes(type)) continue;
  for (const style of POVOS) for (let q = 0; q < NID; q++) {
    const id = 1000 + rows.length * 7 + q * 7919;
    const b = F.put(type, style, id, SEMPLANTA ? { record: false } : undefined);
    try {
      sow(b, style, q);
      const god = F.god(b);
      if (OWN_LAYER[type]) { other.add(type); continue; }
      const near = F.near(b), far = F.far(b);
      const mk = F.gridFor(god, near, far); const lot = [b.w, b.h];
      const Rg = F.paintGod(god, mk()), Rn = F.paint3D(near, mk()), Rf = F.paint3D(far, mk());
      const mg = F.measure(Rg), mn = F.measure(Rn), mf = F.measure(Rf);
      const cn = F.compare(mg, mn, lot), cf = F.compare(mg, mf, lot); const vd = verdict(cn, cf);
      const row = { type, style, id, fam: b.ip ? b.ip.f : '', v: vd.v, why: vd.why, near: cn, far: { iou: cf.iou, topA: cf.topA, topB: cf.topB, dTop: cf.dTop } };
      // (the holes: what only the backs of the faces cover, near and far)
      row.dentro = F.inside(Rg, Rn); { const k = type + '/' + style; dentro[k] = Math.max(dentro[k] || 0, row.dentro); }
      row.costas = Math.max(F.backOnly(near), F.backOnly(far)); if (row.costas > HOLE) holes.push(`${type}/${style}#${id}${row.fam ? ' (' + row.fam + ')' : ''}: ${(row.costas * 100).toFixed(1)}%`);
      for (const k of ['profA', 'profB']) delete row.near[k];
      // (b) the form, where there is one
      const Fm = FORMA && FORMA.of(type, style, b) && (!G.Build3D.byForm || G.Build3D.byForm(b)) ? FORMA.of(type, style, b) : null;
      if (Fm) { formed.add(type + '/' + style); const fc = F.formCheck(b, Fm, god, near, LIM); row.forma = { ok: fc.ok, why: fc.why, plan: fc.plan.iou, top3D: fc.plan.top, topForma: fc.plan.formTop }; }
      rows.push(row);
      const key = type + '/' + style; const was = per.get(key); const rank = { '=': 0, '≈': 1, '≠': 2 };
      if (!was || rank[vd.v] > rank[was.v] || (row.forma && !row.forma.ok && !(was.forma && !was.forma.ok))) per.set(key, row);
      if (process.env.PNG && q === 0) { if (!sheets.has(type)) sheets.set(type, { rows: [], lots: [] }); const s = sheets.get(type); s.rows.push([Rg, Rn, Rf]); s.lots.push(lot); }
    } catch (e) { ok(`${type}/${style}`, false, `erro: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
    finally { F.drop(b); }
  }
  if (process.env.PNG && sheets.has(type)) { const s = sheets.get(type); F.png(path.join(process.env.PNG, `${type}.png`), s.rows, s.lots, 0.5); sheets.delete(type); }
}
if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(rows));
// (the colour inside each type's and people's outline against its own line — T-254: the god's market drawn bare rose from 4 to
// 50 % —: ten points more is a building the two views no longer draw alike inside it. The line: qa/visual/base/fidelidade-
// dentro.json, written by a whole round with DENTRO=gravar; with plans only, where the 3D draws the game's buildings)
const BASE_DENTRO = process.env.DENTRO_BASE || path.join(__dirname, 'base', 'fidelidade-dentro.json');
let baseDentro = null; if (fs.existsSync(BASE_DENTRO)) baseDentro = JSON.parse(fs.readFileSync(BASE_DENTRO, 'utf8'));
if (process.env.DENTRO === 'gravar' && !SEMPLANTA) { const o = {}; for (const k of Object.keys(dentro).sort()) o[k] = Math.round(dentro[k] * 1000) / 1000; fs.writeFileSync(BASE_DENTRO, JSON.stringify(o, null, 0) + '\n'); console.log(`a cor por dentro: a linha de base gravada (${Object.keys(o).length} tipos e povos) em ${BASE_DENTRO}`); }
else if (baseDentro && !SEMPLANTA) { const ks = Object.keys(dentro).filter(k => baseDentro[k] !== undefined); const up = ks.filter(k => dentro[k] > baseDentro[k] + 0.10);
  ok('a cor por dentro (T-254)', !up.length, up.length ? up.map(k => `${k} ${(baseDentro[k] * 100).toFixed(0)} → ${(dentro[k] * 100).toFixed(0)} %`).join(' · ') : `${ks.length} tipos e povos na linha de base, nenhum subiu dez pontos`); }
else console.log(`a cor por dentro: ${SEMPLANTA ? 'não vale sem planta' : 'sem linha de base (DENTRO=gravar a grava, na rodada inteira)'}`);

// ------------------------------ the table ------------------------------
const types = [...new Set([...per.keys()].map(k => k.split('/')[0]))];
console.log('\n' + 'tipo'.padEnd(18) + POVOS.map(s => s.slice(0, 7).padStart(9)).join('') + '   (a massa; F: com forma, conferida contra ela)');
const count = { '=': 0, '≈': 0, '≠': 0 };
for (const t of types) console.log((t + (POVOS.some(s => formed.has(t + '/' + s)) ? ' F' : '')).padEnd(18) + POVOS.map(s => { const r = per.get(t + '/' + s); if (!r) return '        -'; count[r.v]++; return (r.v + (r.forma && !r.forma.ok ? '!' : ' ')).padStart(9); }).join(''));
if (other.size) console.log(`desenhados pelo deus numa camada própria e ainda fora desta prova (T-150: a feira da planta do P4, a horta, e o que o render.js pinta sozinho — a fazenda, o cemitério, a cerca, a fogueira, a ruína): ${[...other].join(', ')}`);
console.log(`\n${count['=']} com a mesma massa, ${count['≈']} a mesma massa com perdas, ${count['≠']} outra massa (de ${per.size} tipos e povos; ${rows.length} prédios em ${((clock() - t0) / 1000).toFixed(1)} s)`);
if (process.env.VERB) for (const r of per.values()) if (r.v !== '=' || (r.forma && !r.forma.ok)) console.log(`   ${r.v} ${r.type}/${r.style}${r.fam ? ' (' + r.fam + ')' : ''}: ${r.why.join(', ')}${r.forma && !r.forma.ok ? ' · forma: ' + r.forma.why.join(', ') : ''}`);

// ------------------------------ the verdicts ------------------------------
// (a type with a form has the god's mass and follows its form, in every people it has one; the others — and a type's peoples
// with none: the granary where it is a hall —, under the ceiling)
const comForma = [...per.values()].filter(r => formed.has(r.type + '/' + r.style));
const ruins = comForma.filter(r => r.v !== '=' || (r.forma && !r.forma.ok));
if (formed.size) ok('os tipos com forma', !ruins.length, ruins.length ? ruins.map(r => `${r.type}/${r.style} (${r.why.concat(r.forma && !r.forma.ok ? r.forma.why : []).join(', ')})`).join(' · ') : `${[...new Set([...formed].map(k => k.split('/')[0]))].join(', ')}: a massa do deus e a forma, nos ${comForma.length} tipos e povos`);
const outra = [...per.values()].filter(r => r.v === '≠' && !formed.has(r.type + '/' + r.style));
if (!ONLY && !SEMPLANTA && POVOS.length === STY.length && NID === 3) ok('outra massa (a catraca)', outra.length <= TETO, `${outra.length} tipos e povos com outra massa (teto ${TETO}, a meta é zero)${outra.length < TETO ? ' — baixou: desça o teto' : ''}`);
else console.log(`outra massa: ${outra.length} tipos e povos (a catraca só vale na rodada inteira, IDS=3)`);
// (every building the world raises has the god's picture — the jail had none: L-265 —, but those of a layer of their own; and,
// without plans, the types the god draws from their shells alone — the jail, Arch.SHELLS: no plan, no shell, no picture)
const blind = [...per.values()].filter(r => r.near && r.near.empty === 'deus' && !(SEMPLANTA && G.Arch.SHELLS && G.Arch.SHELLS[r.type])).map(r => `${r.type}/${r.style}`);
ok('todo prédio com o desenho do deus', !blind.length, blind.length ? `sem desenho: ${blind.join(', ')}` : `${per.size} tipos e povos`);
ok('sem furos (faces de costas)', !holes.length, holes.length ? `${holes.length} figuras com mais de ${HOLE * 100}% coberto só por faces de costas: ${holes.slice(0, 12).join(' · ')}` : `${rows.length} prédios, de perto e de longe: nenhum`);
const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
