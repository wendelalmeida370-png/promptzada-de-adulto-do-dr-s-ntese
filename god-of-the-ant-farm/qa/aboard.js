// RF2: "who is aboard" from v.aboard alone — the index against a plain count, boarding, changing ships, stepping off, a sinking, and a boarding nobody announced
const S = G.S, Nv = G.Naval; const out = []; const fails = [];
const scan = s => [...S.villagers.values()].filter(v => v.aboard === s.id).map(v => v.id).sort((a, b) => a - b);
const idx = s => Nv.aboardOf(s).map(v => v.id).sort((a, b) => a - b);
const agree = () => { let bad = 0; for (const s of S.ships) if (scan(s).join() !== idx(s).join()) bad++; return bad; };
const seaFinds = () => QA.check().filter(f => f.sys === 'sea' && f.sev <= 2);
// 1. a lived world: every ship's people, by the index and by a plain count
let ab = 0; for (const s of S.ships) ab += scan(s).length;
out.push(`navios ${S.ships.length}, gente a bordo ${ab}; navios em que índice e contagem discordam: ${agree()}`);
if (agree()) fails.push('índice e contagem discordam num mundo vivido');
// 2. boarding, changing ships, stepping off
const ships = S.ships.filter(s => !s.sunk && s.st !== 'build');
const land = [...S.villagers.values()].filter(v => !v.aboard && !v.captive && !v.ug && v.age >= 14 && !(v.task && v.task.type === 'scene'));
if (ships.length >= 2 && land.length) {
  const [a, b] = ships; const v = land[0];
  Nv.board(v, a);
  const s1 = [idx(a).includes(v.id), (a.crew || []).includes(v.id), v.task && v.task.type === 'aboard'];
  Nv.board(v, b);
  const s2 = [idx(a).includes(v.id), (a.crew || []).includes(v.id), idx(b).includes(v.id), (b.crew || []).includes(v.id)];
  const p = G.W.nearestLand(b.x, b.y, 30) || [v.x, v.y];
  Nv.unboard(v, p);
  const s3 = [idx(b).includes(v.id), v.aboard, v.x === p[0] && v.y === p[1]];
  out.push(`embarca em ${a.kind}#${a.id}: no índice/lista/tarefa ${s1} · troca para ${b.kind}#${b.id}: velho índice/lista ${s2.slice(0, 2)} novo ${s2.slice(2)} · desce: ${s3}`);
  if (!s1.every(Boolean)) fails.push('embarque: não ficou a bordo');
  if (s2[0] || s2[1] || !s2[2] || !s2[3]) fails.push('troca de navio: ficou nos dois ou em nenhum');
  if (s3[0] || s3[1] || !s3[2]) fails.push('desembarque: ainda a bordo ou fora do lugar');
  const f = seaFinds(); if (f.length) fails.push('verificador depois das trocas: ' + f.map(x => x.msg).slice(0, 2).join(' | '));
  // 3. someone put aboard by hand, without Naval.board: the checker must notice; once announced, quiet
  const w = land[1] || land[0]; Nv.aboardIndex();
  w.aboard = a.id;
  const stale = QA.check().filter(x => /índice de quem está a bordo/.test(x.msg));
  Nv.abVer++;
  const fresh = QA.check().filter(x => /índice de quem está a bordo/.test(x.msg));
  out.push(`embarque sem aviso: verificador acusou ${stale.length} · depois do aviso ${fresh.length}`);
  if (!stale.length) fails.push('verificador não percebeu o embarque sem aviso');
  if (fresh.length) fails.push('verificador ainda acusa depois do aviso');
  Nv.unboard(w);
  // 4. a ship goes down with people aboard: nobody stays aboard a ship that is gone
  const c = ships.find(s => s !== a && s !== b) || a;
  for (const u of land.slice(2, 6)) Nv.board(u, c);
  const ids = idx(c); Nv.sink(c, null, 'storm'); QA.run(0.05);
  const left = ids.map(id => S.villagers.get(id)).filter(Boolean);
  const still = left.filter(u => u.aboard === c.id).length;
  out.push(`naufrágio de ${c.kind}#${c.id} com ${ids.length}: vivos ${left.length}, ainda "a bordo" ${still}, nadando ${left.filter(u => u.task && u.task.type === 'swim').length}`);
  if (still) fails.push('naufrágio: gente a bordo de navio que não existe');
} else out.push('sem navios ou gente para testar embarque');
// 5. cost: the people aboard every ship, many times
const t0 = performance.now(); for (let k = 0; k < 200; k++) for (const s of S.ships) Nv.aboardOf(s); const dt = performance.now() - t0;
out.push(`${S.ships.length} navios × 200 consultas: ${dt.toFixed(1)} ms · índices refeitos ${Nv.abBuilds}`);
if (agree()) fails.push('índice e contagem discordam no fim');
return { fails, out };
