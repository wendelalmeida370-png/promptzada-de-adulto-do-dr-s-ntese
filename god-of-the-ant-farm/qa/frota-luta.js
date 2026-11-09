// frota-luta: node qa/frota-luta.js [mundo] — a luta de uma frota sem batalha de registro (uma patrulha sobre um barco
// sozinho, dois navios numa escaramuça) atravessa o save como estava (L-443). O load punha a frota de volta no rumo de antes
// e a luta se perdia; a ida e volta do qa/prontos.js pegou isso no «guerra mundial» da geração 9 (a patrulha 36747, aos
// 38 s de uma luta com a frota 35272).
//  l1 no mundo pronto (o «guerra mundial», por padrão): cada frota que o save guarda lutando sem batalha de registro continua
//     lutando depois de carregar, e uma cuja batalha já fechou volta ao rumo (só informação, se o save não tiver nenhuma);
//  l2 a ida e volta do mundo inteiro (QA.roundTrip) sem diferença nas frotas;
//  l3 uma frota viva posta a lutar como o engage a põe (o estado de antes guardado, sem batalha, o primeiro golpe agora)
//     passa pelo save ainda lutando;
//  l4 depois, no mundo, a luta acaba como no mundo vivo (sem inimigos por perto, ou 45 s depois do primeiro golpe), e o
//     verificador fica limpo (S0–S2), sem erro de página nem aviso no console.
//  l5 um navio de guerra livre com alguém a bordo (como a frota que acaba no seu passo deixa a tripulação) levado pelo
//     conselho a uma frota nova: todo mundo a bordo no rol, e quem estava a bordo no rol ou em terra (L-639: o rol novo era
//     escrito por cima de quem estava a bordo — «a bordo mas fora da tripulação»).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WORLD = process.argv[2] || 'mundial';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | frota-luta ${name} | ${info}`); if (!c) fails.push(name); };
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] }); const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' }); await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const r = await page.evaluate(W => {
    const raw = G.Ready.data[W]; const o = JSON.parse(raw);
    // (what the save says, read before the load: the load works on these same objects)
    const open = id => ((o.wz || {}).battles || []).some(b => b.id === id && b.open);
    const saved = (o.fleets || []).filter(f => f.st === 'combate').map(f => ({ id: f.id, battle: f.battle || 0, open: !!f.battle && open(f.battle), prev: f.prevSt }));
    G.Save.apply(JSON.parse(raw)); G.Main.mode = 'game'; G.UI.setSpeed(0);
    if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; }
    const get = id => G.S.fleets.find(f => f.id === id);
    const l1 = saved.map(x => Object.assign(x, { now: get(x.id) ? get(x.id).st : '-' }));
    const trip = QA.roundTrip(); const fdiff = trip.diff.filter(d => /^fleets/.test(d));
    // l3: a fleet alive and not fighting, put to a fight as engage puts one (fleets.js)
    const S = G.S; let live = S.fleets.filter(f => G.Fleets.live(f) && f.st !== 'combate' && f.ships.length).sort((a, b) => a.id - b.id);
    // (sem nenhuma viva fora de luta — nos mundos prontos da geração 15 toda frota já tinha acabado: as 23 do mundial, do ano 78,
    // T-498 —: uma patrulha formada como o conselho da frota a forma (G.Fleets.form, fleets.js): o primeiro povo em guerra com um
    // cais de atracar e navio de guerra livre, metade dos livres)
    let formed = 0;
    if (!live.length) {
      const Nv = G.Naval; G.inSim++;
      try {
        for (const f of G.Fac.all().filter(o => o.alive).sort((a, b) => a.id - b.id)) {
          const ens = G.Fac.enemiesOf(f.id); if (!ens.length) continue;
          const docks = Nv.docksOf(f.id).filter(d => Nv.dockInfo(d).moor); if (!docks.length) continue;
          const idle = Nv.shipsOf(f.id, 'guerra').filter(s => !s.fleet && !s.exp && s.st !== 'build' && s.hp > s.maxHp * 0.5 && !Nv.atSea(s)); if (!idle.length) continue;
          const nf = G.Fleets.form(f, G.Wars.warOf(f.id, ens[0].id), 'patrulha', idle.slice(0, Math.max(1, Math.ceil(idle.length * 0.5))), { dock: docks[0].id });
          if (nf) { formed = nf.id; live = [nf]; break; }
        }
      } finally { G.inSim--; }
    }
    const fl = live[0]; if (!fl) return { l1, fdiff, err: 'nenhuma frota viva fora de luta, e nenhum povo em guerra com cais e navio de guerra livre para formar uma' };
    const foe = S.fleets.find(f => G.Fleets.live(f) && f.fac !== fl.fac && G.Fac.atWar(f.fac, fl.fac));
    fl.prevSt = fl.st; fl.st = 'combate'; fl.t = 0; fl.foe = foe ? foe.id : 0; fl.hitT = S.clock; fl.battle = 0;
    const l3 = { id: fl.id, prev: fl.prevSt, formed };
    G.Save.apply(JSON.parse(G.Save.serialize())); l3.after = get(fl.id) ? get(fl.id).st : '-';
    // l4: a minute of the world
    let left = false, at = 0; const c0 = G.S.clock;
    for (let k = 0; k < 600; k++) { G.debug.step(0.1); const f = get(fl.id); if (!left && (!f || f.st !== 'combate')) { left = true; at = G.S.clock - c0; } }
    const f4 = get(fl.id);
    return { l1, fdiff, l3, l4: { left, at: +at.toFixed(1), st: f4 ? f4.st : '-' }, bad: QA.check().filter(e => e.sev <= 2).map(e => e.msg).slice(0, 4) };
  }, WORLD);
  if (r.err) { ok('l0 o caso', false, r.err); await browser.close(); process.exit(1); }
  const loose = r.l1.filter(x => !x.battle), closed = r.l1.filter(x => x.battle && !x.open), kept = r.l1.filter(x => x.battle && x.open);
  if (!r.l1.length) console.log(`INFO | frota-luta l1 | o save do «${WORLD}» não guarda nenhuma frota lutando`);
  else ok('l1 a frota que o save guarda lutando sem batalha de registro continua lutando depois de carregar', loose.every(x => x.now === 'combate') && closed.every(x => x.now !== 'combate') && kept.every(x => x.now === 'combate'),
    r.l1.map(x => `frota ${x.id}: ${x.battle ? `batalha ${x.battle} ${x.open ? 'aberta' : 'fechada'}` : 'sem batalha'}, depois de carregar «${x.now}»`).join('; '));
  ok('l2 a ida e volta do mundo sem diferença nas frotas', !r.fdiff.length, r.fdiff.join(' · ') || 'nenhuma');
  ok('l3 uma frota posta a lutar (sem batalha) passa pelo save ainda lutando', r.l3.after === 'combate', `frota ${r.l3.id}${r.l3.formed ? ' (formada pela prova, como o conselho da frota)' : ''} (antes «${r.l3.prev}»): depois do save «${r.l3.after}»`);
  ok('l4 a luta acaba como no mundo vivo; verificador limpo', r.l4.left && r.l4.at <= 50 && !r.bad.length && !errs.length,
    `${r.l4.left ? `deixou a luta aos ${r.l4.at} s` : 'ainda lutando depois de 60 s'} (agora «${r.l4.st}»); ${r.bad.join(' | ') || 'verificador limpo'}; ${errs.slice(0, 3).join(' · ') || 'sem erro de página'}`);
  // l5 a warship with someone aboard taken by the next fleet (L-639): the roster of a ship of a new fleet was written over the
  // people aboard it (fleets.js manShips) — aboard and off the roster, «a bordo mas fora da tripulação»: Nefertari, the lone sailor
  // of a patrol that ended in its tick, aboard her idle warship when the council took it for the next fleet (the poderes p1 of the
  // round 16, in this world). A free warship of a people at war with a dock; one of its people put aboard by the game's door
  // (G.Naval.board), as a fleet that ends in its tick leaves its crews (shipRun); the council's door forms a patrol with it
  // (G.Fleets.form): everyone aboard on the roster, the one put aboard on it or ashore, on ground one walks; ten seconds of the
  // world after, the checker clean
  {
    const r5 = await page.evaluate(W => {
      G.Save.apply(JSON.parse(G.Ready.data[W])); G.Main.mode = 'game'; G.UI.setSpeed(0);
      const S = G.S, Nv = G.Naval; let out = null; G.inSim++;
      try {
        for (const f of G.Fac.all().filter(o => o.alive).sort((a, b) => a.id - b.id)) {
          const ens = G.Fac.enemiesOf(f.id); if (!ens.length) continue;
          const docks = Nv.docksOf(f.id).filter(d => Nv.dockInfo(d).moor); if (!docks.length) continue;
          const s = Nv.shipsOf(f.id, 'guerra').filter(q => !q.fleet && !q.exp && q.st !== 'build' && q.hp > q.maxHp * 0.5 && !Nv.atSea(q) && !Nv.aboardOf(q).length).sort((a, b) => a.id - b.id)[0]; if (!s) continue;
          const v = [...S.villagers.values()].filter(o => G.Fac.idOfV(o) === f.id && !o.captive && !o.aboard && !o.jail && !o.ug && o.age >= 24 && o.age < 56 && o.id !== f.leader).sort((a, b) => a.id - b.id)[0]; if (!v) continue;
          Nv.board(v, s); const on0 = (s.crew || []).includes(v.id);
          const fl = G.Fleets.form(f, G.Wars.warOf(f.id, ens[0].id), 'patrulha', [s], { dock: docks[0].id });
          const ab = Nv.aboardOf(s); const off = ab.filter(o => !(s.crew || []).includes(o.id)).map(o => o.name);
          const vv = S.villagers.get(v.id); const still = !!vv && vv.aboard === s.id; const ashore = !!vv && !vv.aboard && G.W.walkableXY(vv.x, vv.y);
          const qa0 = QA.check().filter(e => /fora da tripulação/.test(e.msg)).map(e => e.msg);
          out = { f: f.name, s: s.id, v: v.name, on0, fl: fl ? fl.id : 0, ab: ab.length, off, still, ashore, qa0 }; break;
        }
      } finally { G.inSim--; }
      if (out) { for (let k = 0; k < 100; k++) G.debug.step(0.1); out.qa1 = QA.check().filter(e => e.sev <= 2).map(e => e.msg).slice(0, 3); }
      return out;
    }, WORLD);
    if (!r5) ok('l5 o navio de guerra com alguém a bordo levado pela frota nova', false, 'nenhum povo em guerra com cais e navio de guerra livre');
    else ok('l5 o navio de guerra com alguém a bordo levado pela frota nova: todo mundo a bordo no rol', !!r5.fl && r5.on0 && !r5.off.length && (r5.still || r5.ashore) && !r5.qa0.length && !r5.qa1.length && !errs.length,
      `${r5.f}: ${r5.v} posto a bordo do guerra#${r5.s} (no rol: ${r5.on0}); a patrulha ${r5.fl || 'NÃO formada'}: ${r5.ab} a bordo, ${r5.off.length ? 'FORA DO ROL ' + r5.off.join(', ') : 'todos no rol'}; ${r5.v} ${r5.still ? 'a bordo' : r5.ashore ? 'em terra, no cais' : 'NEM A BORDO NEM EM TERRA'}; o verificador logo depois: ${r5.qa0.join(' | ') || 'calado'}; 10 s depois: ${r5.qa1.join(' | ') || 'limpo'}`);
  }
  // (no summary line: the sea's files are counted line by line, as the mar17.js cases — the exit code tells it all)
  console.log('erros', errs.length ? errs.slice(0, 6).join(' || ') : 'nenhum');
  await browser.close(); process.exit(fails.length ? 1 : 0);
})();
