// fera-rara: a pele da fera rara depois do abate (L-655) — provocada de propósito.   [ONLY=f1,f3] node qa/fera-rara.js [mundo,mundo...]
// A história «Fera Rara» guardava a fera no elenco depois de o protagonista abatê-la e esperava a pele até a virada do ano:
// quando outra mão esfolava o corpo (e levava a carne toda) ou o corpo sumia, a história seguia contando com um bicho que não
// existia mais — o verificador acusava S3 («elenco beast=… não existe em lugar nenhum», a vida curta 103 no ano 5) — e só se
// resolvia na virada. A prova arma o caso pela regra do jogo: a fera rara nasce perto de uma cidade como no painel do
// desenvolvedor («Um animal raro perto de gente»), a cidade a vê, a semente da história é promovida (St._promote, como o painel)
// e a fera cai pela lança do protagonista (G.Animals.kill, a porta de toda morte de bicho com quem matou).
// f1 outra pessoa esfola o corpo (a caçada que o jogo dá, G.Vg.setTask): o verificador limpo a cada segundo e no passo da esfola,
// e a história resolvida no passo em que a ouve («a pele ficou para trás»); f2 o mesmo com save e load entre o abate e a esfola;
// f3 o corpo some sem esfola (os carniceiros comeram a carne — a mão da prova põe a carne em zero — e o resto apodrece):
// resolvida no turno seguinte, não na virada do ano; f4 o próprio protagonista esfola: a pele é dele (o desfecho de antes);
// f5 o deus mata o protagonista entre o abate e a esfola: o verificador limpo e a história resolvida; e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLDS = (process.argv[2] || 'cidade').split(',');
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; // (ONLY=f3: only these cases)
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | fera-rara ${name} | ${info}`); if (!c) fails.push(name); };
const story = id => G.S.saga.stories.find(s => s.id === id);
// what the checker says of this story (any severity)
const said = id => QA.check().filter(q => q.sys === 'story' && q.msg.includes(`história #${id} `)).map(q => `[S${q.sev}] ${q.msg}`);
const lastTxt = s => (s.chapters.length ? s.chapters[s.chapters.length - 1].txt : '');
const noPelt = s => /pele ficou para trás/.test(lastTxt(s));
const skinFact = aid => G.S.saga.facts.find(f => f.k === 'pele-rara' && f.beast === aid);
const used = new Set();

// the rare beast near a town, as the developer's panel makes it; the town sees it within ten seconds, and the seed of the story
// is promoted as the panel does
function arm() {
  const S = G.S, St = G.Stories;
  // (a town not used yet first: another protagonist; the same town again when the world has few)
  const towns = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Village.pop(s.id) >= 6).sort((a, b) => used.has(a.id) - used.has(b.id) || G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id);
  // (a beast that does not hunt people first: the town must see it before anyone fights it)
  const kinds = G.Animals.ids.filter(k => { const d = G.Animals.sp({ kind: k }); return d.cls === 'land' && d.size >= 0.8 && !d.dom && !d.town; }).sort((a, b) => !!G.Animals.sp({ kind: a }).apex - !!G.Animals.sp({ kind: b }).apex);
  for (const set of towns.slice(0, 8)) {
    used.add(set.id);
    let spot = null, kind = null;
    // (within the fifteen tiles from the centre where the town sees a rare coat — the panel's ring, beyond the radius, misses
    // the towns wider than that)
    for (let g = 0; g < 48 && !spot; g++) {
      const ang = g * 0.393 + set.id, r = 7 + (g % 4) * 2;
      const q = G.W.nearestLand(set.cx + Math.cos(ang) * r, set.cy + Math.sin(ang) * r, 2); if (!q || G.dist(q[0], q[1], set.cx, set.cy) > 14) continue;
      const k = kinds.find(x => G.Animals.habitat(G.Animals.sp({ kind: x }), G.W.idx(Math.floor(q[0]), Math.floor(q[1]))));
      if (k && G.Animals.walkOK({ kind: k }, q[0], q[1])) { spot = q; kind = k; }
    }
    if (!spot) continue;
    const sp = G.Animals.sp({ kind });
    const a = G.Animals.spawn(kind, spot[0], spot[1], { morph: sp.morphs && sp.morphs.melanico ? 'melanico' : 'albino' });
    let sd = null;
    for (let k = 0; k < 30 && !sd && S.animals.has(a.id) && !a.dead; k++) { M.viver(1); sd = S.saga.seeds.find(x => x.type === 'fera-rara' && x.cast && x.cast.beast === a.id); }
    if (!sd) continue;
    sd.ripe = 0; let st = null; G.inSim++; try { st = St._promote(sd); } finally { G.inSim--; }
    if (st && st.st === 'ativa' && S.animals.has(a.id) && !a.dead && S.villagers.has(st.protag)) return { sid: st.id, aid: a.id, set: set.id, kind, town: set.name };
  }
  return null;
}
// the protagonist's spear: the beast dies by his hand; the story hears it on the next step
function slay(c) {
  const p = G.S.villagers.get(story(c.sid).protag), a = G.S.animals.get(c.aid);
  G.Animals.kill(a, p); M.viver(0.1);
  const s = story(c.sid); c.day = G.S.day;
  return s && s.st === 'ativa' && s.data.killed && s.phase === 'pele';
}
// a free pair of hands of the town that reaches the body (a hunter first); not the protagonist unless asked
function skinner(c, own) {
  const s = story(c.sid), a = G.S.animals.get(c.aid); if (!a) return null;
  if (own) return G.S.villagers.get(s.protag) || null;
  const out = [...G.S.villagers.values()].filter(v => v.set === c.set && v.id !== s.protag && v.age >= 16 && !v.captive && !v.aboard && !v.jail && !v.carry && !(G.S.avatar && G.S.avatar.id === v.id) && !G.Vg.handsBusy(v) && !(v.task && (v.task.pri || 0) >= 3) && G.W.reaches(v, a.x, a.y));
  out.sort((x, y) => (y.role === 'cacador') - (x.role === 'cacador') || G.dist(x.x, x.y, a.x, a.y) - G.dist(y.x, y.y, a.x, a.y) || x.id - y.id);
  return out[0] || null;
}
// the hunt the game gives (to the carcass), lived until the body is skinned or gone; the checker each second and at that step
function skin(c, v) {
  const S = G.S; const bad = []; let k = 0, at = -1;
  // (hands full: what is in them goes to its place first, as the hunt itself would send it — the hunt is given to free hands)
  for (let j = 0; j < 90 && v.carry && v.carry.n > 1e-6 && S.villagers.has(v.id) && S.animals.has(c.aid); j++) { M.viver(1); const w = said(c.sid); if (w.length) bad.push(`a caminho: ${w[0]}`); }
  G.Vg.setTask(v, { type: 'hunt', id: c.aid, pri: 4 });
  for (; k < 1500; k++) {
    const a = S.animals.get(c.aid);
    if (!a || a.skinned) { at = k; break; }
    if (k % 10 === 0) { const w = said(c.sid); if (w.length) bad.push(`${(k / 10).toFixed(0)} s: ${w[0]}`); }
    if (k % 50 === 49 && S.villagers.has(v.id) && !(v.carry && v.carry.n > 1e-6) && (!v.task || v.task.id !== c.aid)) G.Vg.setTask(v, { type: 'hunt', id: c.aid, pri: 4 });
    M.viver(0.1);
  }
  const gone = !S.animals.has(c.aid); const w0 = at >= 0 ? said(c.sid) : []; if (w0.length) bad.push(`no passo da esfola: ${w0[0]}`);
  M.viver(0.1);
  const s = story(c.sid); const w1 = said(c.sid); if (w1.length) bad.push(`passo seguinte: ${w1[0]}`);
  const f = skinFact(c.aid);
  return { at, gone, bad, s, by: f ? f.a : 0, secs: (k / 10).toFixed(1) };
}

for (const world of WORLDS) {
  M.pronto(world); M.viver(2);
  // ---------------- f1 another hand skins the body ----------------
  if (on('f1')) {
    const c = arm();
    if (!c) ok(`f1 ${world}`, false, 'nenhuma história de fera rara armada (nenhuma cidade viu a fera e deu semente)');
    else if (!slay(c)) ok(`f1 ${world}`, false, `a história #${c.sid} não ouviu o abate`);
    else {
      const v = skinner(c, false); const s0 = story(c.sid); const w = said(c.sid);
      if (!v) ok(`f1 ${world}`, false, `ninguém de ${c.town} alcança o corpo`);
      else {
        const r = skin(c, v); const prot = r.by === s0.protag;
        const good = r.at >= 0 && !r.bad.length && !w.length && r.s.st === 'fim' && (prot ? !noPelt(r.s) : noPelt(r.s) || r.s.data.motive === 'sagrado');
        ok(`f1 ${world}`, good, r.at < 0 ? `o corpo não foi esfolado em ${r.secs} s` : `${c.kind} raro de ${c.town} (história #${c.sid}) abatido pelo protagonista e esfolado por #${r.by}${prot ? ' (o próprio protagonista)' : ''} em ${r.secs} s, corpo ${r.gone ? 'levado inteiro' : 'ficou com carne'}; história ${r.s.st}${r.s.end ? ' (' + r.s.end.k + ')' : ''} no passo seguinte — «${lastTxt(r.s).slice(0, 90)}»; verificador ${r.bad.concat(w).length ? r.bad.concat(w).join(' · ') : 'limpo'}`);
      }
    }
  }
  // ---------------- f2 the same with a save and a load between the kill and the skinning ----------------
  if (on('f2')) {
    const c = arm();
    if (!c) ok(`f2 ${world}`, false, 'nenhuma história de fera rara armada');
    else if (!slay(c)) ok(`f2 ${world}`, false, `a história #${c.sid} não ouviu o abate`);
    else {
      M.salvarCarregar(); M.viver(0.1);
      const s1 = story(c.sid); const w = said(c.sid); const body = G.S.animals.get(c.aid);
      const kept = !!(s1 && s1.st === 'ativa' && s1.data.killed && body && body.dead);
      const v = kept ? skinner(c, false) : null;
      if (!kept || !v) ok(`f2 ${world}`, false, !kept ? `depois do load a história #${c.sid} ${s1 ? s1.st : 'sumiu'} e o corpo ${body ? 'existe' : 'sumiu'}` : `ninguém de ${c.town} alcança o corpo`);
      else {
        const r = skin(c, v); const prot = r.by === s1.protag;
        const good = r.at >= 0 && !r.bad.length && !w.length && r.s.st === 'fim' && (prot ? !noPelt(r.s) : noPelt(r.s) || r.s.data.motive === 'sagrado');
        ok(`f2 ${world}`, good, r.at < 0 ? `o corpo não foi esfolado em ${r.secs} s` : `save e load no meio; esfolado por #${r.by}${prot ? ' (o próprio protagonista)' : ''} em ${r.secs} s; história ${r.s.st}${r.s.end ? ' (' + r.s.end.k + ')' : ''} no passo seguinte; verificador ${r.bad.concat(w).length ? r.bad.concat(w).join(' · ') : 'limpo'}`);
      }
    }
  }
  // ---------------- f3 the body goes with no skinning: the scavengers ate the meat, the rest rots ----------------
  if (on('f3')) {
    // (early in the day: the body must go before the turn of the year, or the case would be the year's)
    for (let k = 0; k < 170 && G.S.time > 0.3; k++) M.viver(1);
    const c = arm();
    if (!c) ok(`f3 ${world}`, false, 'nenhuma história de fera rara armada');
    else {
      if (!story(c.sid) || story(c.sid).st !== 'ativa' || !G.S.animals.has(c.aid) || !slay(c)) ok(`f3 ${world}`, false, `a história #${c.sid} não chegou ao abate`);
      else {
        G.S.animals.get(c.aid).meat = 0;
        const bad = []; let k = 0, gone = -1, end = -1;
        for (; k < 900; k++) {
          if (!G.S.animals.has(c.aid) && gone < 0) { gone = k; const w = said(c.sid); if (w.length) bad.push(`no passo em que sumiu: ${w[0]}`); }
          const s = story(c.sid); if (s.st !== 'ativa') { end = k; break; }
          if (k % 10 === 0) { const w = said(c.sid); if (w.length) bad.push(`${(k / 10).toFixed(0)} s: ${w[0]}`); }
          M.viver(0.1);
        }
        const s = story(c.sid); const sameDay = G.S.day === c.day;
        const good = gone >= 0 && end >= gone && (end - gone) <= 17 && sameDay && !bad.length && (noPelt(s) || s.data.motive === 'sagrado');
        ok(`f3 ${world}`, good, gone < 0 ? `o corpo não sumiu em ${(k / 10).toFixed(0)} s` : `o corpo sumiu ${(gone / 10).toFixed(1)} s depois do abate; história ${s.st}${s.end ? ' (' + s.end.k + ')' : ''} ${end >= 0 ? ((end - gone) / 10).toFixed(1) + ' s depois' : 'ainda ativa'}${sameDay ? ', no mesmo ano' : ', já na virada do ano'} — «${lastTxt(s).slice(0, 90)}»; verificador ${bad.length ? bad.join(' · ') : 'limpo'}`);
      }
    }
  }
  // ---------------- f4 the protagonist skins it himself: the pelt is his ----------------
  if (on('f4')) {
    const c = arm();
    if (!c) ok(`f4 ${world}`, false, 'nenhuma história de fera rara armada');
    else if (!slay(c)) ok(`f4 ${world}`, false, `a história #${c.sid} não ouviu o abate`);
    else {
      const v = skinner(c, true); const s0 = story(c.sid);
      const r = skin(c, v);
      const good = r.at >= 0 && r.by === s0.protag && !r.bad.length && r.s.st === 'fim' && (!noPelt(r.s) || r.s.data.motive === 'sagrado');
      ok(`f4 ${world}`, good, r.at < 0 ? `o corpo não foi esfolado em ${r.secs} s` : `esfolado por #${r.by}${r.by === s0.protag ? ' (o protagonista)' : ' (outra mão chegou antes)'} em ${r.secs} s; história ${r.s.st}${r.s.end ? ' (' + r.s.end.k + ')' : ''} — «${lastTxt(r.s).slice(0, 90)}»; verificador ${r.bad.length ? r.bad.join(' · ') : 'limpo'}`);
    }
  }
  // ---------------- f5 the god kills the protagonist between the kill and the skinning ----------------
  if (on('f5')) {
    const c = arm();
    if (!c) ok(`f5 ${world}`, false, 'nenhuma história de fera rara armada');
    else if (!slay(c)) ok(`f5 ${world}`, false, `a história #${c.sid} não ouviu o abate`);
    else {
      const p = G.S.villagers.get(story(c.sid).protag); G.Village.kill(p, 'old', true); M.viver(0.1);
      const w = said(c.sid); const s1 = story(c.sid);
      const v = s1.st === 'ativa' ? skinner(c, false) : null;
      const r = v ? skin(c, v) : null; const s = story(c.sid);
      const good = !w.length && (!r || !r.bad.length) && (s.st === 'fim' || (r && r.at < 0 && G.S.villagers.has(s.protag)));
      ok(`f5 ${world}`, good, `o protagonista morto depois do abate: história ${s1.st}${s1.data.waitHeir ? ' (à espera de herdeiro)' : ''}${r ? (r.at >= 0 ? `; esfolado por #${r.by} em ${r.secs} s` : '; ninguém esfolou') : ''}; no fim ${s.st}${s.end ? ' (' + s.end.k + ')' : ''}; verificador ${w.concat(r ? r.bad : []).length ? w.concat(r ? r.bad : []).join(' · ') : 'limpo'}`);
    }
  }
}
const e = M.erros(); const errs = e.console.filter(l => /error|warn/.test(l));
ok('erros', !Object.keys(e.mod).length && !errs.length, `erros de módulo ${JSON.stringify(e.mod)}; console ${errs.length ? errs.slice(0, 3).join(' | ') : 'limpo'}`);
console.log(fails.length ? `FERA-RARA: ${fails.length} FALHOU (${fails.join(', ')})` : 'FERA-RARA: ok');
process.exit(fails.length ? 1 : 0);
