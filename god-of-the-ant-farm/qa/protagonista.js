// protagonista: a história cujo protagonista morre (L-215) — provocada de propósito.   node qa/protagonista.js [mundo,mundo...]
// As histórias ouvem o mundo no passo seguinte (o St.signal); a que perdia quem a carregava só se resolvia na batida dela, a
// cada 1,5 s, e o verificador, que olha a qualquer hora, acusava S1 («ativa com protagonista morto») nesse meio-tempo — o
// porto o via de passagem (a história #22 da metrópole). p1 o deus mata o protagonista de cada história ativa: o verificador
// limpo logo depois (a morte ainda não ouvida) e a história resolvida no passo seguinte (acabada, à espera de herdeiro ou com
// outro protagonista); p2 o mesmo com save e load no meio-tempo; p3 a morte num salto do tempo; p4 o protagonista de uma
// semente (uma história que pode começar) morto: a semente some no passo seguinte (L-351); e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLDS = (process.argv[2] || 'metropole,mundial').split(',');
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | protagonista ${name} | ${info}`); if (!c) fails.push(name); };
const s1 = () => QA.check().filter(q => q.sys === 'story' && q.sev <= 2).map(q => `[S${q.sev}] ${q.msg}`);
const story = id => G.S.saga.stories.find(s => s.id === id);
// settled: ended, waiting for an heir, or carried by someone alive
const settled = s => s.st !== 'ativa' || !!s.data.waitHeir || G.S.villagers.has(s.protag);
const how = s => s.st !== 'ativa' ? `acabou (${s.end ? s.end.k : '?'})` : s.data.waitHeir ? 'à espera de herdeiro' : `segue com #${s.protag}`;
const live = () => G.S.saga.stories.filter(s => s.st === 'ativa' && G.S.villagers.has(s.protag));
// (the world opened and lived until a story is under way, up to two minutes: the world-war world of the v37's last worlds opens
// with none — a pilgrimage begins about a minute in —, and the cases had nothing to kill, T-258)
const open = world => { M.pronto(world); M.viver(3); for (let k = 0; k < 120 && !live().length; k++) M.viver(1); };
for (const world of WORLDS) {
  open(world);
  // ---------------- p1 each active story, its protagonist killed by the god ----------------
  {
    const list = live(); const bad = [], loose = [], kinds = []; let n = 0;
    for (const st0 of list) {
      const v = G.S.villagers.get(st0.protag); if (!v || st0.st !== 'ativa') continue;
      G.Village.kill(v, 'old', true); n++;
      const a = s1(); M.viver(0.1); const st = story(st0.id); const b = s1();
      if (a.length || b.length) bad.push(`#${st0.id} ${st0.type}: ${(a[0] || b[0])}`);
      if (!settled(st)) loose.push(`#${st0.id} ${st0.type}`); else kinds.push(`${st0.type} ${how(st)}`);
      M.viver(0.3);
    }
    ok(`p1 ${world} a morte de cada protagonista`, n > 0 && !bad.length && !loose.length, `${n} histórias: ${kinds.slice(0, 6).join(' · ') || '-'}${bad.length ? ' — o verificador: ' + bad.slice(0, 2).join(' · ') : ''}${loose.length ? ' — ainda sem desfecho um passo depois: ' + loose.join(', ') : ''}`);
  }
  // ---------------- p2 the save in between: the death unheard goes into the save ----------------
  {
    open(world);
    const st0 = live()[0];
    if (!st0) ok(`p2 ${world} o save no meio-tempo`, false, 'precondição: nenhuma história ativa');
    else {
      G.Village.kill(G.S.villagers.get(st0.protag), 'old', true);
      const o = JSON.parse(G.Save.serialize()); G.Save.apply(o);
      const a = s1(); M.viver(0.1); const st = story(st0.id); const b = s1();
      ok(`p2 ${world} o save no meio-tempo`, !a.length && !b.length && !!st && settled(st), `#${st0.id} ${st0.type}: depois do load ${a.length ? a[0] : 'limpo'}; um passo depois ${st ? how(st) : 'sumiu'}${b.length ? ', ' + b[0] : ''}`);
    }
  }
  // ---------------- p3 the death in a skip of time ----------------
  {
    open(world);
    const st0 = live()[0];
    if (!st0) ok(`p3 ${world} a morte no salto`, false, 'precondição: nenhuma história ativa');
    else {
      // (the skip as the game runs it — M.saltar —: the death between two of its steps, the checker after each)
      const W = G.W; const seen = []; let st = null;
      G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
      try {
        G.Main.skipStep(1); G.Village.kill(G.S.villagers.get(st0.protag), 'old', true);
        for (const m of s1()) seen.push(m);
        G.Main.skipStep(1); st = story(st0.id); for (const m of s1()) if (!seen.includes(m)) seen.push(m);
      } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; }
      ok(`p3 ${world} a morte no salto`, !seen.length && !!st && settled(st), `#${st0.id} ${st0.type}: um passo do salto depois, ${st ? how(st) : 'sumiu'}${seen.length ? ' — o verificador: ' + seen[0] : ''}`);
    }
  }
  // ---------------- p4 the seed of one who dies: gone as soon as the stories hear (L-351) ----------------
  // (a seed — a story that may begin — kept its dead protagonist until the director's next beat, up to 1,5 s: the checker saw
  // «semente …: protagonista morto» in the poderes o3 of the v37, the runner for the gold killed by the case)
  {
    M.pronto(world); M.viver(3);
    const seeds = () => G.S.saga.seeds;
    const s3 = () => QA.check().filter(q => q.sys === 'story' && /semente/.test(q.msg)).map(q => q.msg);
    const ids = [...new Set(seeds().map(sd => sd.protag))].filter(id => G.S.villagers.has(id) && !G.S.saga.stories.some(x => x.st === 'ativa' && x.protag === id)).slice(0, 8);
    const bad = [], kept = []; let n = 0;
    for (const id of ids) {
      const v = G.S.villagers.get(id); if (!v) continue;
      const kinds = seeds().filter(sd => sd.protag === id).map(sd => sd.type);
      G.Village.kill(v, 'old', true); n++;
      const a = s3(); M.viver(0.1); const b = s3(); const still = seeds().filter(sd => sd.protag === id).map(sd => sd.type);
      if (a.length || b.length) bad.push(`${v.name} (${kinds.join(', ')}): ${(a[0] || b[0])}`);
      if (still.length) kept.push(`${v.name}: ${still.join(', ')}`);
      M.viver(0.3);
    }
    ok(`p4 ${world} a semente de quem morre`, n > 0 && !bad.length && !kept.length, `${n} protagonistas de sementes mortos pelo deus${bad.length ? ' — o verificador: ' + bad.slice(0, 2).join(' · ') : ''}${kept.length ? ' — sementes ainda com o morto um passo depois: ' + kept.slice(0, 3).join(' · ') : ''}`);
  }
}
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
