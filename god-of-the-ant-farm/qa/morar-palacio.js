// morar-palacio: quem governa mora na sede (T-765, a lacuna «palácio/morar» da matriz; Bairros Vivos, o agente R: D-205 a
// D-208), em Node, nos mundos prontos e pela mão do deus. A sede — a casa do chefe, o palácio, o grande palácio, o colossal —
// é a casa de quem governa: vale para morar (V.livable), guarda a despensa, as moedas e os bens como uma casa ('h:'), e só a
// porta do act-casa.js (G.Casa.reign) põe e tira gente dela.
//   m0   os mundos prontos: em cada um, as sedes de pé na capital e quem mora nelas depois de uns segundos de mundo
//   m1   a sede pela mão do deus: em obra ninguém entra; pronta, a casa de quem governa entra na hora, com o que é seu pelo livro
//   m2   a vida na sede por um dia e um quarto de mundo: dormem nas camas dela, comem da despensa dela, acordam nela; quem
//        governa recebe onde recebia (Po.seat) e senta no trono na audiência
//   m3   a troca de governante: a eleição (a família de antes sai para a casa que tinha, a nova entra), a morte (quem herda
//        ou é escolhido), a conquista da capital (a família do vencido sai)
//   m4   a sede que queima, que o deus desfaz e que entra em obra de ampliação: a família sai antes, com o que é seu, e volta
//        quando a sede fica de pé de novo
//   m5   o save: no meio (as casas e os guardados iguais), o mesmo futuro duas vezes, o save entre a coroação e a mudança, quem
//        dorme na sede continua dormindo nela, e um save de antes (o tributo na prateleira do prédio) vira a despensa da casa
//   m6   o corpo do deus: a família do corpo não é mudada pelo mundo, nem para dentro nem para fora
//   m7   o preso, o cativo e quem está na mão do deus: a casa muda, a pessoa fica onde está; o cativo não entra na conta
//   m8   quem governa mora noutra cidade do povo: a família vem para a capital (D-207); sem poder partir, espera com a causa dita
//   m9   um estranho posto na sede sai; a sede vazia nunca é oferecida a quem precisa de casa
//   m10  as plantas: cada sede de cada povo tem cama, fogo, onde comer e onde guardar as coisas da casa
//   m11  a tela: o que o painel da sede diz, e o que a ficha do prédio diz a quem é do povo e a quem não é (D-208)
//   m12  quem é da sede casa e o par vem morar nela; a casa que a família tinha pago fica pronta e ninguém sai da sede por ela;
//        da sede cheia demais sai a casa do filho casado, para a casa da família
//   m13  a sede guarda como uma casa: as moedas, a casa do mercado e as compras de quem mora nela; a despensa — da corte
//        quando ninguém mora, da família quando mora
//   m14  a bandeira dos mercadores vai com a família para a sede e volta com ela (D-158)
//   m15  o verificador vê: com a porta fechada pela mão da prova, acusa o estranho na sede, quem governa e não mora nela, a
//        sede com dono, a casa que não é casa e a sede cheia demais
//   m16  as camas da sede: na entrada o crescido solteiro só entra havendo cama (fica na casa da família); da sede cheia
//        demais ele sai; quem tem de morar com quem governa fica; quem governa sem par nunca sai
//   node qa/morar-palacio.js        (ONLY=m1,m3 só esses; MUNDO=metropole o mundo dos casos pela mão do deus)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'js/interact.js', 'qa/morar-palacio-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const MUNDO = process.env.MUNDO || 'metropole';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | morar-palacio ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, D, K, Co, Pl, In;
const pega = () => { S = G.S; V = G.Village; D = G.Depot; K = G.Casa; Co = G.Court; Pl = G.Politics; In = G.Interiors; return S; };
const abre = m => { M.pronto(m || MUNDO); return pega(); };
const P = id => (id ? S.villagers.get(id) : null);
const B = id => (id ? S.buildings.get(id) : null);
const moram = b => [...S.villagers.values()].filter(v => v.home === b.id).sort((a, c) => a.id - c.id);
const nomes = L => L.map(v => `${v.name}(${Math.floor(v.age)})`).join(', ') || 'ninguém';
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h}${b.built ? '' : ' em obra'}` : 'nada');
const livro = (L0, f) => D.ledger().filter(e => e[0] > L0 && f(e));
const r2 = x => Math.round(x * 100) / 100;
function checa(sev) {
  const out = []; for (const q of QA.check()) if (q.sev <= (sev || 2)) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 170)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
// (the peoples whose ruler lives in the capital, the biggest household first; cross: the ones whose ruler lives elsewhere)
const povos = cross => G.Fac.all().map(f => ({ f, r: Pl.ruler(f), cap: G.Fac.capitalOf(f.id) })).filter(o => o.r && o.cap && !o.r.captive && (o.r.set === o.cap.id) === !cross && !Co.seatOf(o.f))
  .sort((a, c) => K.court(c.r).length - K.court(a.r).length || a.f.id - c.f.id);
const funda = (set, type, step, built, o) => sim(() => V.handFound(set, type, step, Object.assign({ built: !!built, R: 70 }, o || {})));
// (a people with its ruler at home in the capital, and a palace of 6 raised there by the god's hand — standing, or as a work)
function arma(built, pick, mundo) {
  abre(mundo); M.viver(1); const L = povos(false); const o = pick ? L.find(pick) : L[0]; if (!o) return null;
  const fam = K.court(o.r); const casa0 = B(o.r.home); const L0 = S.ledgerN || 0;
  const b = funda(o.cap, 'palacio', 'palacio', built); if (!b) return null;
  return Object.assign(o, { b, fam, casa0, L0 });
}
const todosEm = (fam, b) => fam.every(v => v.home === b.id);
const assina = () => { let t = ''; for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) t += v.id + ':' + (v.home || 0) + ':' + v.set + ';'; for (const b of S.buildings.values()) if (K.isSeat(b)) t += `|${b.id}:${b.coin || 0}:${b.pantry || 0}:${JSON.stringify(b.inv || {})}`; return t + '|' + (S.ledgerN || 0) + '|' + S.villagers.size; };
const hash = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0).toString(16); };

// ------------------------------ m0: the ready worlds ------------------------------
run('m0', () => {
  const lived = [];
  for (const m of ['cidade', 'metropole', 'mega', 'mundial']) {
    abre(m); M.viver(12); const out = []; let bad = 0;
    for (const f of G.Fac.all()) {
      const st = K.seatState(f); if (!st) continue; const L = moram(st.seat);
      const fine = st.home ? L.length > 0 && L.every(v => K.ofCourt(v, st.ruler)) : !!st.why && !L.length; if (!fine) bad++;
      if (st.home) lived.push(m);
      out.push(`${f.name}: ${lado(st.seat)} — ${st.home ? 'mora ' + nomes(L) : `ninguém («${st.why}»)`}`);
    }
    const c = checa();
    ok(`m0 ${m}`, !bad && c.ok, `${out.join('; ') || 'nenhuma sede de pé numa capital'}; ${c.txt}`);
  }
  ok('m0z nos mundos prontos há governante morando na sede', lived.includes('mega') && lived.includes('mundial'), `mundos com alguém morando numa sede ao abrir e viver 12 s: ${[...new Set(lived)].join(', ') || 'nenhum'}`);
});

// ------------------------------ m1: the seat by the god's hand ------------------------------
run('m1', () => {
  const o = arma(false); if (!ok('m1a a obra', !!o && !o.b.built, o ? `${o.cap.name} de ${o.f.name}: ${lado(o.b)}; governa ${o.r.name} #${o.r.id}, a casa dele: ${nomes(o.fam)} em ${lado(o.casa0)}` : 'sem povo ou sem lote')) return;
  M.viver(6);
  ok('m1b em obra ninguém entra', !moram(o.b).length && o.fam.every(v => v.home === (o.casa0 ? o.casa0.id : 0)) && !K.seatOf(o.f), `moram na obra: ${nomes(moram(o.b))}; a sede do povo: ${lado(K.seatOf(o.f))}`);
  const coin0 = o.casa0 ? D.get('h:' + o.casa0.id, 'moedas') : 0, food0 = o.casa0 ? D.get('h:' + o.casa0.id, 'food') : 0; const n0 = o.casa0 ? moram(o.casa0).length : 0;
  const fam = K.court(o.r); const dono0 = o.casa0 ? o.casa0.dono : 0; const L0 = S.ledgerN || 0;
  sim(() => V.completeBuilding(o.b));
  ok('m1c pronta, a casa de quem governa entra na hora', todosEm(fam, o.b) && K.seatOf(o.f) === o.b && K.seatState(o.f).home, `${nomes(moram(o.b))} em ${lado(o.b)} (a casa: ${fam.length})`);
  const mud = livro(L0, e => e[8] === 'mudança' && e[4] === 'h:' + o.b.id); const share = n0 ? fam.length / n0 : 1;
  const moved = k => r2(mud.filter(e => e[5] === k).reduce((a, e) => a + e[6], 0));
  ok('m1d com o que é seu, pelo livro', (!o.casa0 || (Math.abs(moved('moedas') - r2(coin0 * share)) < 0.02 && Math.abs(moved('food') - r2(food0 * share)) < 0.02)) && Math.abs(D.get('h:' + o.b.id, 'moedas') - moved('moedas')) < 0.02,
    `da casa de antes (${n0} moravam, ${coin0} moedas, ${food0} de comida): ${mud.length} linha(s) «mudança», ${moved('moedas')} moedas e ${moved('food')} de comida para a sede (a parte de ${fam.length} em ${n0 || fam.length}); a sede tem ${D.get('h:' + o.b.id, 'moedas')} moedas`);
  ok('m1e a casa de antes continua da família; a sede não é de ninguém', (!o.casa0 || o.casa0.dono === dono0) && !o.b.dono && !o.b.aluga && fam.every(v => !K.need(v)) && D.exists('h:' + o.b.id) && !D.exists('b:' + o.b.id),
    `a casa de antes: dono #${o.casa0 ? o.casa0.dono : 0} (era #${dono0}), ${o.casa0 ? moram(o.casa0).length : 0} ficaram; a sede: dono ${o.b.dono || 0}; «h:» ${D.exists('h:' + o.b.id)}, «b:» ${D.exists('b:' + o.b.id)}`);
  M.viver(5); const c = checa(); ok('m1f verificador', c.ok && todosEm(fam, o.b), c.txt);
  const cron = (S.history || S.log || []).slice(-40).map(e => e.t || e.txt || e.text || '').filter(t => /foi morar n/.test(t));
  ok('m1g a crônica diz', cron.length >= 1, cron[cron.length - 1] || 'nenhuma linha «foi morar»');
});

// ------------------------------ m2: the life in the seat ------------------------------
run('m2', () => {
  const o = arma(true); if (!ok('m2a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))} em ${lado(o.b)}` : 'sem povo ou sem lote')) return;
  const b = o.b; const fam = moram(b); const L0 = S.ledgerN || 0; const ref = 'h:' + b.id;
  if (D.get(ref, 'food') < 8) D.make(ref, 'food', 8, { code: 'teste' });
  // (the world opens before dawn, the household asleep in the house it had: it ends that night where it lay — the home moved,
  // the people stay where they are —, and the proof counts from when the last of them is up)
  let wait = 0; while (wait < 120 && fam.some(v => v.sleeping && v.inside && v.inside !== b.id)) { M.viver(2); wait += 2; }
  const st = new Map(fam.map(v => [v.id, { dorme: 0, cama: new Set(), fora: 0, acordou: 0, was: false }]));
  const meals = () => livro(L0, e => e[3] === ref && e[5] === 'food' && (e[8] === 'refeicao' || e[8] === 'ceia'));
  const n = Math.round(1.25 * G.DAY_LEN / 5); let bad = ''; let days = 1.25;
  // (a day and a quarter; and on, up to three days, until someone of the house has eaten at home)
  for (let k = 0; k < n || (k < Math.round(3 * G.DAY_LEN / 5) && !meals().length && (days = (k + 1) * 5 / G.DAY_LEN)); k++) {
    M.viver(5);
    for (const v of fam) {
      if (!S.villagers.has(v.id)) continue; const e = st.get(v.id); const inn = v.inside === b.id;
      if (inn && v.sleeping) { e.dorme++; const pl = In.placeOf(v); e.cama.add(pl && pl.it ? pl.it.kind : pl ? pl.use : '?'); }
      else if (v.sleeping && v.inside && v.inside !== b.id && G.BDEF[(B(v.inside) || {}).type] && G.BDEF[B(v.inside).type].housing) e.fora++;
      if (e.was && !v.sleeping) e.acordou++; // (asleep in it five seconds ago, up now: woke in it)
      e.was = inn && v.sleeping;
    }
    if (k % 6 === 0) { const c = checa(); if (!c.ok && !bad) bad = c.txt; }
  }
  const grown = fam.filter(v => S.villagers.has(v.id) && v.age >= 3); const slept = grown.filter(v => st.get(v.id).dorme >= 4);
  const beds = new Set(); for (const e of st.values()) for (const kd of e.cama) beds.add(kd);
  ok('m2b dormem na sede, nas camas dela', slept.length >= Math.ceil(grown.length * 0.6) && [...st.values()].every(e => !e.fora) && [...beds].some(kd => /cama/.test(kd)),
    `${slept.length} de ${grown.length} dormiram nela 20 s ou mais (${grown.map(v => `${v.name} ${st.get(v.id).dorme * 5} s`).join(', ')}); onde: ${[...beds].join(', ')}; noutra casa: ${[...st.values()].reduce((a, e) => a + e.fora, 0)}`);
  const ml = meals(); const r0 = Pl.ruler(o.f); const h0 = r0.hunger; r0.hunger = 60; const L1 = S.ledgerN || 0; const ate = sim(() => G.Lar.eat(r0, b, false)); const line = livro(L1, e => e[3] === ref && e[8] === 'refeicao').length; r0.hunger = h0;
  ok('m2c comem da despensa dela', ml.length >= 1 && ate && line === 1, `${ml.length} refeição(ões) da casa pelo livro em ${days.toFixed(2)} dias (${ml.filter(e => e[8] === 'ceia').length} da ceia cozida); a porta da refeição em casa (G.Lar.eat) vale na sede: ${ate}, ${line} linha no livro; a despensa: ${D.get(ref, 'food')}`);
  ok('m2d acordam nela', grown.filter(v => st.get(v.id).acordou > 0).length >= Math.ceil(grown.length * 0.6), `${grown.filter(v => st.get(v.id).acordou > 0).length} de ${grown.length} acordaram dentro dela`);
  ok('m2e verificador pelo caminho', !bad, bad || 'limpo a cada 30 s');
  // (who rules still receives where the game had it: before the seat's door; and sits on the throne at the audience)
  const fr = V.frontTile(b); const at = G.Polity.seat(o.f);
  ok('m2f recebe onde recebia', !!at && at[0] === fr[0] && at[1] === fr[1] + 1, `Po.seat: ${at ? at.join(', ') : '-'}; a frente da sede: ${fr[0]}, ${fr[1] + 1}`);
  // (the audience lasts thirty seconds from its call: the ruler set before the seat's door by the proof's hand, awake, free)
  const r = Pl.ruler(o.f); let thr = false, went = false; let tries = 0;
  while (r.sleeping && tries++ < 150) M.viver(2);
  sim(() => { G.Vg.endTask(r); r.inside = 0; r.x = fr[0]; r.y = fr[1] + 0.5; went = !!Co.audiencia(o.f, 'teste'); });
  for (let k = 0; k < 28 && !thr; k++) { M.viver(1); const pl = r.inside === b.id ? In.placeOf(r) : null; if (pl && pl.it && pl.it.kind === 'trono') thr = true; }
  M.viver(Co.AUD_DUR + 6);
  ok('m2g senta no trono na audiência, e ela acaba', went && thr && !o.f.aud, `a audiência começou: ${went}; ${r.name} no trono: ${thr}; acabou: ${!o.f.aud}`);
});

// ------------------------------ m3: a change of ruler ------------------------------
run('m3', () => {
  const o = arma(true); if (!ok('m3a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  const b = o.b; const f = o.f; const antes = moram(b); const casa0 = o.casa0;
  // (an election: another of the town, of no kin of the ruler, with a household of its own)
  const outro = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 25 && v.age < 60 && !v.captive && !v.jail && !v.aboard && v.home && !K.ofCourt(v, o.r) && !(S.avatar && S.avatar.id === v.id)).sort((a, c) => K.court(c).length - K.court(a).length || a.id - c.id)[0];
  if (!ok('m3b o outro', !!outro, outro ? `${outro.name} #${outro.id}, a casa dele: ${nomes(K.court(outro))}` : 'ninguém')) return;
  const nova = K.court(outro); const L0 = S.ledgerN || 0; const coin = D.get('h:' + b.id, 'moedas');
  sim(() => { Pl.endReign(f, 'mandato'); Pl.crown(f, outro, 'eleicao', true); });
  M.viver(3);
  const foram = antes.map(v => B(v.home)); const volta = casa0 && antes.every(v => v.home === casa0.id);
  // (back to the house it had, while that one has room for it: nobody else moved into it meanwhile)
  const tomada = !!casa0 && moram(casa0).some(v => !antes.includes(v));
  ok('m3c a eleição: a família de antes sai para a casa que tinha, a nova entra', antes.every(v => v.home !== b.id) && todosEm(nova, b) && foram.every(h => h && G.BDEF[h.type].housing && h.built) && (volta || tomada || !casa0),
    `os de antes: ${antes.map(v => `${v.name} em ${lado(B(v.home))}`).join(', ')}${volta ? ' (a casa que tinham)' : ''}; agora na sede: ${nomes(moram(b))}`);
  const saiu = livro(L0, e => e[8] === 'mudança' && e[3] === 'h:' + b.id && e[5] === 'moedas').reduce((a, e) => a + e[6], 0);
  ok('m3d as moedas de cada família com ela, pelo livro', Math.abs(saiu - coin) < 0.02, `a sede tinha ${coin} moedas da família de antes: ${r2(saiu)} saíram com ela («mudança»); a sede tem agora ${D.get('h:' + b.id, 'moedas')} (as da nova)`);
  let c = checa(); ok('m3e verificador', c.ok, c.txt);
  // (the ruler dies: who the people has next — an heir, or the chosen one — lives in the seat, whoever it is)
  sim(() => G.Vg.damage(outro, 9999, 'age'));
  M.viver(14); const r2n = Pl.ruler(f); const st = K.seatState(f);
  ok('m3f a morte: quem governa agora mora na sede', !!r2n && r2n.id !== outro.id && !!st && (st.home || !!st.why) && moram(b).every(v => K.ofCourt(v, r2n)),
    `${r2n ? r2n.name + ' #' + r2n.id : 'ninguém'} governa${st && st.home ? ' e mora na sede' : st ? ` («${st.why}»)` : ''}: ${nomes(moram(b))}`);
  c = checa(); ok('m3g verificador', c.ok, c.txt);
  // (the capital taken in war: the seat is no seat of the winner's — the family of the vanquished leaves it)
  const inimigo = G.Fac.all().find(x => x.id !== f.id && G.Fac.capitalOf(x.id)); const dentro = moram(b);
  sim(() => G.War.conquer(o.cap, { fac: inimigo.id, loot: { food: 0, wood: 0, stone: 0 }, members: [], captives: [], campaign: null }));
  M.viver(4);
  ok('m3h a conquista: a família do vencido sai', !moram(b).length && K.seatOf(inimigo) !== b && dentro.filter(v => S.villagers.has(v.id)).every(v => v.captive || !v.home || G.BDEF[B(v.home).type].housing),
    `${o.cap.name} agora de ${inimigo.name}; na sede: ${nomes(moram(b))}; os de antes: ${dentro.map(v => (S.villagers.has(v.id) ? `${v.name} ${v.captive ? 'cativo' : v.home ? 'em ' + lado(B(v.home)) : 'sem teto'}` : 'morto')).join(', ')}`);
  c = checa(); ok('m3i verificador', c.ok, c.txt);
});

// ------------------------------ m4: the seat that burns, is taken down, is enlarged ------------------------------
run('m4', () => {
  let o = arma(true); if (!ok('m4a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  let fam = moram(o.b); let L0 = S.ledgerN || 0; let coin = D.get('h:' + o.b.id, 'moedas'); const id = o.b.id;
  sim(() => V.destroyBuilding(o.b, 'fire'));
  const mud = livro(L0, e => e[8] === 'mudança' && e[3] === 'h:' + id && e[5] === 'moedas').reduce((a, e) => a + e[6], 0); const perd = livro(L0, e => e[8] === 'ruina' && e[3] === 'h:' + id && e[5] === 'moedas').reduce((a, e) => a + e[6], 0);
  ok('m4b o fogo: a família sai antes, com as moedas', fam.every(v => v.home && v.home !== id && G.BDEF[B(v.home).type].housing && v.inside !== id) && Math.abs(mud - coin) < 0.02 && perd < 0.02,
    `${fam.map(v => `${v.name} em ${lado(B(v.home))}`).join(', ')}; das ${coin} moedas da sede, ${r2(mud)} saíram com a família e ${r2(perd)} se perderam na ruína`);
  M.viver(4); let c = checa(); ok('m4c verificador', c.ok, c.txt);
  // (a new seat: the household comes back to it)
  const b2 = funda(o.cap, 'palacio', 'palacio', true); M.viver(1);
  ok('m4d a sede de novo de pé: a família volta', !!b2 && todosEm(K.court(o.r), b2), `${lado(b2)}: ${b2 ? nomes(moram(b2)) : '-'}`);
  // (the god takes it down)
  fam = b2 ? moram(b2) : []; L0 = S.ledgerN || 0; coin = b2 ? D.get('h:' + b2.id, 'moedas') : 0; const id2 = b2 ? b2.id : 0; sim(() => V.removeBuilding(b2));
  const mud2 = livro(L0, e => e[8] === 'mudança' && e[3] === 'h:' + id2 && e[5] === 'moedas').reduce((a, e) => a + e[6], 0); M.viver(3);
  ok('m4e o deus desfaz a sede: a família numa casa, com as moedas', fam.every(v => v.home && G.BDEF[B(v.home).type].housing) && Math.abs(mud2 - coin) < 0.02, `${fam.map(v => `${v.name} em ${lado(B(v.home))}`).join(', ')}; ${r2(mud2)} de ${coin} moedas saíram com ela`);
  c = checa(); ok('m4f verificador', c.ok, c.txt);
  // (the enlargement: the old palace of 3, lived in, becomes a work of 6 — the household out while it lasts, back when it stands)
  const pod = V.PODIUM; V.PODIUM = 4;
  try {
    abre(); let got = null;
    for (const q of povos(false)) { q.cap._noSite = {}; const pos = sim(() => V.findSite(q.cap, 'palacio', undefined, 6)); if (!pos) continue; const b = funda(q.cap, 'palacio', 'antigo', true, { x: pos[0] + 3, y: pos[1] + 3, R: 0 }); if (b) { got = Object.assign(q, { b }); break; } }
    if (!ok('m4g o palácio de antes, com a família', !!got && todosEm(K.court(got.r), got.b), got ? `${got.cap.name}: ${lado(got.b)}, ${nomes(moram(got.b))}` : 'nenhuma capital com lugar')) return;
    fam = moram(got.b); coin = D.get('h:' + got.b.id, 'moedas'); L0 = S.ledgerN || 0;
    const P6 = G.Escala.steps('palacio').find(s => s.n === 6); const pos = V.growLot(got.cap, got.b, P6); const r = pos && sim(() => V.enlarge(got.b, P6, pos));
    const out = livro(L0, e => e[8] === 'mudança' && e[3] === 'h:' + got.b.id && e[5] === 'moedas').reduce((a, e) => a + e[6], 0);
    ok('m4h a ampliação: a família sai antes da obra, com as moedas', !!r && !r.built && fam.every(v => v.home !== r.id && (!v.home || G.BDEF[B(v.home).type].housing)) && Math.abs(out - coin) < 0.02,
      `${r ? lado(r) : 'não ampliou' + (pos ? '' : ' (sem lote)')}; ${fam.map(v => `${v.name} em ${lado(B(v.home))}`).join(', ')}; ${r2(out)} de ${coin} moedas saíram com ela`);
    M.viver(6); c = checa(); ok('m4i verificador durante a obra', c.ok && !moram(got.b).length, c.txt);
    sim(() => V.completeBuilding(got.b));
    ok('m4j a obra pronta: a família volta na hora', todosEm(K.court(got.r), got.b), `${lado(got.b)}: ${nomes(moram(got.b))}`);
    M.viver(4); c = checa(); ok('m4k verificador', c.ok, c.txt);
  } finally { V.PODIUM = pod; }
});

// ------------------------------ m5: the save ------------------------------
run('m5', () => {
  let o = arma(true); if (!ok('m5a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  M.viver(4); const bid = o.b.id, fid = o.f.id; const a0 = assina();
  M.salvarCarregar(); pega(); const a1 = assina();
  ok('m5b o save no meio: as casas e os guardados iguais', a0 === a1 && moram(B(bid)).length > 0, `${hash(a0)} = ${hash(a1)}; na sede: ${nomes(moram(B(bid)))}`);
  const save = G.Save.serialize(); const fut = () => { G.Save.apply(JSON.parse(save)); pega(); M.viver(90); return assina(); };
  const f1 = fut(), f2 = fut();
  ok('m5c o mesmo futuro duas vezes', f1 === f2, `90 s depois do load: ${hash(f1)} e ${hash(f2)}`);
  // (the save between the crowning and the move: the load decides nothing, the step moves the households)
  G.Save.apply(JSON.parse(save)); pega(); const f = G.Fac.get(fid); const r0 = Pl.ruler(f); const b = B(bid); const cap = G.Fac.capitalOf(fid);
  const outro = [...S.villagers.values()].filter(v => v.set === cap.id && v.age >= 25 && v.age < 60 && !v.captive && !v.jail && !v.aboard && v.home && !K.ofCourt(v, r0)).sort((a, c) => a.id - c.id)[0];
  sim(() => { Pl.endReign(f, 'mandato'); Pl.crown(f, outro, 'eleicao', true); });
  const mid = G.Save.serialize(); const depois = () => { G.Save.apply(JSON.parse(mid)); pega(); const h0 = P(outro.id).home; M.viver(4); return [h0 !== bid, P(outro.id).home === bid && P(r0.id).home !== bid, assina()]; };
  const d1 = depois(), d2 = depois();
  ok('m5d o save entre a coroação e a mudança', d1[0] && d1[1] && d1[2] === d2[2], `ao abrir, o novo governante ainda na casa dele: ${d1[0]}; 4 s depois, ele na sede e o de antes fora: ${d1[1]}; duas vezes o mesmo: ${hash(d1[2])} e ${hash(d2[2])}`);
  let c = checa(); ok('m5e verificador', c.ok, c.txt);
  // (asleep in the seat across a save)
  G.Save.apply(JSON.parse(save)); pega(); let n0 = 0;
  for (let k = 0; k < 400 && n0 < 1; k++) { M.viver(2); n0 = moram(B(bid)).filter(v => v.inside === bid && v.sleeping).length; }
  const quem = moram(B(bid)).filter(v => v.inside === bid && v.sleeping).map(v => v.id); M.salvarCarregar(); pega();
  const n1 = quem.filter(id => P(id).inside === bid && P(id).sleeping).length;
  ok('m5f quem dorme na sede continua dormindo nela', n0 >= 1 && n1 === quem.length, `${quem.length} dormiam na sede antes do save; ${n1} depois do load`);
  // (a save of before: the tribute on the building's shelf becomes the seat's pantry and coins)
  const old = JSON.parse(G.Save.serialize()); const ob = old.buildings.find(x => x.id === bid); const p0 = ob.pantry || 0, c0 = ob.coin || 0; ob.inv = Object.assign({}, ob.inv, { food: 5, moedas: 3 });
  G.Save.apply(old); pega(); const nb = B(bid);
  ok('m5g um save de antes: a prateleira vira a despensa', Math.abs((nb.pantry || 0) - p0 - 5) < 1e-6 && Math.abs((nb.coin || 0) - c0 - 3) < 1e-6 && !(nb.inv && ('food' in nb.inv || 'moedas' in nb.inv)) && Math.abs(D.get('h:' + bid, 'food') - p0 - 5) < 1e-6,
    `a despensa ${p0} → ${nb.pantry}, as moedas ${c0} → ${nb.coin}; na prateleira: ${JSON.stringify(nb.inv || {})}`);
});

// ------------------------------ m6: the god's body ------------------------------
run('m6', () => {
  const o = arma(false); if (!ok('m6a a obra', !!o, o ? `${o.cap.name}: governa ${o.r.name}, ${lado(o.b)}` : 'sem povo ou sem lote')) return;
  const took = G.Possess.take(o.r); const fam = K.court(o.r);
  if (!ok('m6b o deus vive quem governa', !!took && S.avatar && S.avatar.id === o.r.id, `${o.r.name}: ${took ? 'encarnado' : 'não deu'}`)) return;
  sim(() => V.completeBuilding(o.b)); M.viver(6); const st = K.seatState(o.f);
  ok('m6c a família do corpo não é mudada', fam.every(v => v.home === (o.casa0 ? o.casa0.id : 0)) && !moram(o.b).length && st.why === 'corpo', `na sede: ${nomes(moram(o.b))}; a causa dita: «${st.why}»`);
  let c = checa(); ok('m6d verificador', c.ok, c.txt);
  G.Possess.release('deus'); M.viver(4);
  ok('m6e o deus sai: a família entra', todosEm(K.court(o.r), o.b), nomes(moram(o.b)));
  // (the body in the seat when the reign ends: its household stays where the player has it)
  const kid = moram(o.b).find(v => v.id !== o.r.id && v.age >= 12 && G.Possess.can(v).ok) || o.r; G.Possess.take(kid);
  const outro = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 25 && v.age < 60 && !v.captive && v.home && !K.ofCourt(v, o.r)).sort((a, x) => a.id - x.id)[0];
  const dentro = moram(o.b); sim(() => { Pl.endReign(o.f, 'mandato'); Pl.crown(o.f, outro, 'eleicao', true); }); M.viver(6);
  ok('m6f o corpo na sede, o reinado acaba: a família do corpo fica', !!S.avatar && S.avatar.id === kid.id && dentro.every(v => v.home === o.b.id), `o corpo: ${kid.name}${S.avatar && S.avatar.id === kid.id ? '' : ' (NÃO ENCARNOU: ' + G.Possess.can(kid).why + ')'}; na sede: ${nomes(moram(o.b))}; governa ${outro.name}`);
  c = checa(); ok('m6g verificador', c.ok, c.txt);
  G.Possess.release('deus'); M.viver(4);
  ok('m6h o deus sai: a família de antes sai, a nova entra', dentro.every(v => v.home !== o.b.id) && Pl.ruler(o.f).home === o.b.id, `na sede: ${nomes(moram(o.b))}`);
  c = checa(); ok('m6i verificador', c.ok, c.txt);
});

// ------------------------------ m7: in the cell, a captive, in the god's hand ------------------------------
run('m7', () => {
  const o = arma(false, q => K.court(q.r).length >= 3); if (!ok('m7a a obra', !!o, o ? `${o.cap.name}: a casa de ${o.r.name}: ${nomes(K.court(o.r))}` : 'sem povo com família de três')) return;
  const fam = K.court(o.r); const cela = [...S.buildings.values()].find(x => x.type === 'cadeia' && x.built);
  const kids = fam.filter(v => v.id !== o.r.id && v.id !== o.r.partner); const cat = kids[0], mao = kids[1] || P(o.r.partner);
  // (by the proof's hand: the ruler in a cell, a child a captive of another people, one more in the god's hand)
  if (cela) { o.r.jail = cela.id; o.r.jailUntil = S.day + 9; o.r.inside = cela.id; }
  const fora = G.Fac.all().find(x => x.id !== o.f.id); cat.captive = { from: o.f.id, by: fora.id }; cat.home = 0;
  if (mao) mao.held = 1; const pos = fam.map(v => [v.x, v.y, v.inside]);
  sim(() => V.completeBuilding(o.b));
  const moved = fam.filter(v => v !== cat);
  ok('m7b a casa muda, a pessoa fica onde está', todosEm(moved, o.b) && cat.home === 0 && (!cela || (o.r.jail === cela.id && o.r.inside === cela.id)) && fam.every((v, k) => v.x === pos[k][0] && v.y === pos[k][1] && v.inside === pos[k][2]),
    `${cela ? o.r.name + ' na cela #' + cela.id : 'sem cadeia no mundo'}; ${mao ? mao.name + ' na mão do deus; ' : ''}na sede: ${nomes(moram(o.b))}; ${cat.name}, cativo, de fora da conta (casa ${cat.home})`);
  cat.captive = null; if (mao) mao.held = 0; if (cela) { o.r.jail = 0; o.r.jailUntil = 0; o.r.inside = 0; }
  M.viver(5); const c = checa(); ok('m7c verificador', c.ok, c.txt);
});

// ------------------------------ m8: the ruler of another town ------------------------------
run('m8', () => {
  // (the megalópole: Rome's great palace stands, and who rules lives in another town of the people)
  abre('mega'); let got = null;
  for (const f of G.Fac.all()) { const r = Pl.ruler(f); const b = Co.seatOf(f); if (r && b && r.set !== b.set) { got = { f, r, b, cap: S.settlements.get(b.set), old: S.settlements.get(r.set) }; break; } }
  if (!ok('m8a quem governa mora noutra cidade', !!got, got ? `${got.f.name}: ${got.r.name} mora em ${got.old.name}; a sede: ${lado(got.b)} em ${got.cap.name}` : 'nenhum povo assim na megalópole')) return;
  const fam = K.court(got.r); const casa0 = B(got.r.home); const dono0 = casa0 ? casa0.dono : 0;
  // (first held: one of the household in the god's hand cannot be sent — the cause is said, nobody moves)
  fam[fam.length - 1].held = 1; M.viver(6); let st = sim(() => K.seatState(got.f));
  ok('m8b sem poder partir, espera com a causa dita', !st.home && st.why === 'ocupado' && fam.every(v => v.set === got.old.id && v.home === (casa0 ? casa0.id : 0)), `«${st.why}»: ${nomes(fam)} seguem em ${got.old.name}`);
  let c = checa(); ok('m8c verificador', c.ok, c.txt);
  fam[fam.length - 1].held = 0; M.viver(5); st = K.seatState(got.f);
  ok('m8d a família vem para a capital', st.home && fam.every(v => v.set === got.cap.id && v.home === got.b.id) && (!casa0 || casa0.dono === dono0),
    `${nomes(moram(got.b))} agora de ${got.cap.name}, a casa deles a sede; a caminho: ${fam.filter(v => v.task && v.task.type === 'migrate').length} de ${fam.length}; a casa de antes em ${got.old.name} continua de #${casa0 ? casa0.dono : 0}`);
  M.viver(240); const perto = fam.filter(v => S.villagers.has(v.id) && G.dist(v.x, v.y, got.cap.cx, got.cap.cy) < 30).length;
  ok('m8e chegam', perto >= Math.ceil(fam.length * 0.6) && K.seatState(got.f).home, `${perto} de ${fam.length} a menos de 30 casas do meio de ${got.cap.name} depois de 240 s`);
  c = checa(); ok('m8f verificador', c.ok, c.txt);
});

// ------------------------------ m9: a stranger in the seat; the empty seat is never offered ------------------------------
run('m9', () => {
  const o = arma(true); if (!ok('m9a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  const b = o.b; const x = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 20 && !v.partner && v.home && !v.captive && !K.ofCourt(v, o.r)).sort((a, c) => a.id - c.id)[0];
  const h0 = B(x.home); h0.res--; x.home = b.id; b.res++;
  M.viver(3);
  ok('m9b um estranho posto na sede sai', x.home !== b.id && (!x.home || G.BDEF[B(x.home).type].housing) && todosEm(K.court(o.r), b), `${x.name} agora em ${lado(B(x.home))}; na sede: ${nomes(moram(b))}`);
  let c = checa(); ok('m9c verificador', c.ok, c.txt);
  // (a seat that is nobody's — a palace in a town that is not a capital —: never a house for who needs one)
  const vila = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Fac.capitalOf(s.fac) !== s && V.pop(s.id) >= 8).sort((a, q) => V.pop(q.id) - V.pop(a.id))[0];
  const p2 = vila && funda(vila, 'paco', 'paco', true);
  if (!ok('m9d uma sede de ninguém', !!p2 && !K.lordOf(p2), p2 ? `${lado(p2)} em ${vila.name}, que não é capital` : 'sem vila ou sem lote')) return;
  const sem = [...S.villagers.values()].filter(v => v.set === vila.id && v.age >= 18 && v.home && !v.captive).sort((a, q) => a.id - q.id).slice(0, 4);
  for (const v of sem) { B(v.home).res--; v.home = 0; }
  // (the seat with more beds than any house of the town, by the proof's hand: the town's housing gives the roomiest house — and
  // never this one, not for a step)
  const ap = G.BDEF.paco.aposentos; G.BDEF.paco.aposentos = 60; let dentro = 0;
  try { sim(() => V.forceUpdate()); for (let k = 0; k < 80; k++) { M.viver(0.1); if (moram(p2).length) dentro++; } } finally { G.BDEF.paco.aposentos = ap; }
  const plano = sem.map(v => (K.need(v) ? K.plan(v, null, vila) : null)).filter(Boolean);
  ok('m9e nunca oferecida a quem precisa de casa', !dentro && !moram(p2).length && plano.every(q => q.free !== p2 && q.lease !== p2) && !K.queue(vila).some(([v]) => v.home === p2.id),
    `${sem.length} sem casa em ${vila.name}, a sede de ninguém com 60 camas (pela mão da prova): alguém morando nela em ${dentro} passos de 80; ${sem.map(v => `${v.name} ${v.home ? 'em ' + lado(B(v.home)) : 'sem teto'}`).join(', ')}`);
  c = checa(); ok('m9f verificador', c.ok, c.txt);
});

// ------------------------------ m10: the plans ------------------------------
run('m10', () => {
  abre(); const out = [], sum = [];
  for (const f of G.Fac.all()) {
    const set = G.Fac.capitalOf(f.id); if (!set) continue;
    for (const [t, step, need] of [['paco', 'paco', 1], ['palacio', 'palacio', 3], ['grande_palacio', 'grande_palacio', 3], ['palacio_colossal', 'palacio_colossal', 3]]) {
      const b = funda(set, t, step, true); if (!b) { sum.push(`${f.civ} ${t}: sem lote`); continue; }
      const p = In.plan(b); const key = `${f.civ} ${t} ${b.w}×${b.w}`;
      if (!p || !p.ok) out.push(`${key}: planta ${p ? p.errs.slice(0, 2).join('; ') : 'nula'}`);
      else {
        const tab = In.table(b); const n = u => (tab.byUse.get(u) || []).length; const beds = In.beds(b).places.filter(q => /cama/.test(q.it.kind)).length;
        const fire = n('cozinhar') + n('assar') + n('aquecer'), eat = n('comer') + n('sentar'); const keep = (D.stores(b) || []).filter(m => m.dep === 'casa').length;
        sum.push(`${key}: ${beds} lugares de cama, ${fire} de fogo, ${eat} de comer ou sentar, ${keep} guardados da casa`);
        if (beds < need || !fire || !eat || !keep) out.push(`${key}: ${beds} lugares de cama (pede ${need}), fogo ${fire}, comer ${eat}, guardados ${keep}`);
      }
      sim(() => V.removeBuilding(b));
    }
  }
  ok('m10 cada sede de cada povo com cama, fogo, onde comer e onde guardar', !out.length && sum.length >= 12, out.length ? out.join(' / ') : sum.join('; '));
});

// ------------------------------ m11: the screens ------------------------------
run('m11', () => {
  const o = arma(true); if (!ok('m11a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  const b = o.b; const html = K.seatSays(b, id => `<${P(id).name}>`, t => t);
  ok('m11b o painel da sede diz quem mora', /Mora aqui a casa de quem governa \(\d+\/\d+\)/.test(html) && html.includes(`<${o.r.name}>`), html.replace(/<div[^>]*>|<\/div>|<span[^>]*>|<\/span>/g, ' ').replace(/\s+/g, ' ').slice(0, 220));
  const I = G.Interact; const row = (c, k) => (c.rows.find(q => q[0] === k) || [])[1];
  const povo = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 18 && v.home !== b.id && !K.ofCourt(v, o.r)).sort((a, c) => a.id - c.id)[0];
  const fora = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) !== o.f.id && v.age >= 18 && !v.captive && !(v.ken && v.ken.p.includes(o.r.id))).sort((a, c) => a.id - c.id)[0];
  const cp = I.buildingCard(b, povo), cf = I.buildingCard(b, fora), cm = I.buildingCard(b, o.r), cg = I.buildingCard(b, null);
  ok('m11c quem é do povo sabe quem mora na sede, pela fama', row(cp, 'Casa de quem governa') === o.r.name && row(cp, 'Moedas da família') === undefined, `${povo.name}: «Casa de quem governa: ${row(cp, 'Casa de quem governa')}»; moram aqui: ${row(cp, 'Moram aqui')}`);
  ok('m11d o estrangeiro vê só o que é', !!fora && row(cf, 'Casa de quem governa') !== o.r.name && /quem governa/.test(row(cf, 'Casa de quem governa') || '') && row(cf, 'Moedas da família') === undefined, fora ? `${fora.name}: «Casa de quem governa: ${row(cf, 'Casa de quem governa')}»; moram aqui: ${row(cf, 'Moram aqui')}` : 'sem estrangeiro');
  ok('m11e quem mora nela vê a casa por dentro; o deus, tudo', /você/.test(row(cm, 'Casa de quem governa') || '') && row(cm, 'Moedas da família') !== undefined && row(cg, 'Casa de quem governa') === o.r.name && row(cg, 'Moedas da família') !== undefined, `${o.r.name}: «${row(cm, 'Casa de quem governa')}», moedas ${row(cm, 'Moedas da família')}; o deus: «${row(cg, 'Casa de quem governa')}», moedas ${row(cg, 'Moedas da família')}`);
  // (a seat that is not the people's says so)
  const p2 = funda(o.cap, 'paco', 'paco', true); const vazio = K.seatSays(p2, id => `<${P(id).name}>`, t => t);
  ok('m11f a sede que não é a do governo diz que ninguém mora', /Ninguém mora aqui/.test(vazio), vazio.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  // (the screens only read: the panel, the card and the state asked again and again from outside the step leave the world as it was)
  const foto = () => assina() + '|' + JSON.stringify(S.rng) + '|' + JSON.stringify(S.mod || {}) + '|' + [...S.factions.values()].map(f => f.capital).join(',');
  const f0 = foto(); for (let k = 0; k < 3; k++) for (const q of [b, p2]) { K.seatSays(q, id => String(id), t => t); I.buildingCard(q, povo); I.buildingCard(q, null); K.lordOf(q); } for (const f of G.Fac.all()) K.seatState(f);
  ok('m11g a tela só lê', foto() === f0, `as casas, os guardados das sedes, o acaso do mundo, os relógios do mundo e as capitais iguais depois de 3 voltas do painel, da ficha e do estado: ${hash(f0)} = ${hash(foto())}`);
});

// ------------------------------ m12: the household whole; the partner comes; the house it had paid for ------------------------------
run('m12', () => {
  const o = arma(true, q => K.court(q.r).some(v => v.age >= 18 && !v.partner && v.id !== q.r.id)); if (!ok('m12a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo com um filho crescido solteiro em casa')) return;
  const b = o.b; const fam = moram(b); const ap = G.BDEF[b.type].aposentos;
  // (one of the seat marries: the partner comes to live in it — the one of the seat never leaves it for the partner's house)
  const c = fam.find(v => v.age >= 18 && !v.partner && v.id !== o.r.id);
  const x = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 18 && v.age < 45 && !v.partner && v.g !== c.g && v.home && !v.captive && !v.jail && !v.aboard && !K.ofCourt(v, o.r) && G.BDEF[B(v.home).type].housing - (B(v.home).res || 0) >= 1).sort((a, q) => (q.id > c.id) - (a.id > c.id) || a.id - q.id)[0]; // (one the town's housing looks at after the one of the seat, if there is one: the one looked at first is the one who would move)
  if (ok('m12c o par', !!x, x ? `${c.name} (${Math.floor(c.age)}), da sede, e ${x.name} (${Math.floor(x.age)}), de ${lado(B(x.home))} com lugar` : 'ninguém')) {
    c.partner = x.id; x.partner = c.id; let left = 0; for (let k = 0; k < 80; k++) { M.viver(0.1); if (c.home !== b.id) left++; }
    ok('m12d quem é da sede casa e o par vem morar nela', !left && x.home === b.id, `${c.name} fora da sede em ${left} passos de 80; ${x.name} mora em ${lado(B(x.home))}`);
  }
  // (a house the family had paid for is finished while it lives in the seat: its own, and nobody leaves the seat for it)
  o.cap._noSite = {}; const pos = sim(() => V.findSite(o.cap, 'house')); const h = pos && !pos.demolish ? sim(() => V.startProject(o.cap, 'house', pos)) : null;
  if (ok('m12e a casa encomendada', !!h, h ? lado(h) : 'sem lote')) {
    const now = moram(b); h.dono = o.r.id; h.encomenda = { fam: K.court(o.r).map(v => v.id), d: S.day, paid: 0, by: o.r.id, why: 'lotada', fac: o.f.id };
    sim(() => V.completeBuilding(h));
    ok('m12f fica pronta: é da família, e ninguém sai da sede', now.every(v => v.home === b.id) && h.dono === o.r.id && !h.encomenda && !moram(h).length, `na sede: ${nomes(moram(b))}; ${lado(h)}: dono #${h.dono}, moram ${moram(h).length}`);
  }
  M.viver(4); let q = checa(); ok('m12g verificador', q.ok, q.txt);
  // (the seat with five beds, by the proof's hand, and seven in it: the married child's household leaves for the family's house;
  // who must live with who rules stays)
  if (x && x.home === b.id) {
    G.BDEF[b.type].aposentos = 5;
    try {
      M.viver(4); const ficam = fam.filter(v => v !== c);
      ok('m12b da sede cheia demais sai a casa do filho casado, para a casa da família', c.home === o.casa0.id && x.home === o.casa0.id && ficam.every(v => v.home === b.id) && !o.casa0.aluga,
        `5 camas (pela mão da prova) para 7: ${c.name} e ${x.name} em ${lado(B(c.home))} (a casa da família: ${lado(o.casa0)}, sem aluguel: ${!o.casa0.aluga}); na sede: ${nomes(moram(b))}`);
      M.viver(8); q = checa(); ok('m12h verificador', q.ok && ficam.every(v => v.home === b.id), q.txt);
    } finally { G.BDEF[b.type].aposentos = ap; }
  }
});

// ------------------------------ m16: the seat's beds ------------------------------
run('m16', () => {
  // (a palace with five beds, by the proof's hand, for a household of six with a grown single son)
  const ap = G.BDEF.palacio.aposentos; G.BDEF.palacio.aposentos = 5;
  try {
    const o = arma(false, q => { const L = K.court(q.r); return L.length === 6 && L.filter(v => v.age >= 18 && !v.partner && v.id !== q.r.id).length === 1; });
    if (!ok('m16a a obra', !!o, o ? `${o.cap.name}: a casa de ${o.r.name}: ${nomes(K.court(o.r))}; ${lado(o.b)}, 5 camas pela mão da prova` : 'sem povo com a casa de seis e um filho crescido solteiro')) return;
    const fam = K.court(o.r); const c = fam.find(v => v.age >= 18 && !v.partner && v.id !== o.r.id); const vem = fam.filter(v => v !== c);
    const L0 = S.ledgerN || 0; sim(() => V.completeBuilding(o.b)); let dentro = c.home === o.b.id ? 1 : 0;
    // (never in and out again: nothing of the seat's leaves it by a move at the entry)
    const volta = livro(L0, e => e[8] === 'mudança' && e[3] === 'h:' + o.b.id).length;
    const naHora = todosEm(vem, o.b) && c.home === o.casa0.id && !volta;
    for (let k = 0; k < 80; k++) { M.viver(0.1); if (c.home === o.b.id) dentro++; }
    ok('m16b na entrada, o crescido solteiro só entra havendo cama: fica na casa da família', naHora && !dentro && todosEm(vem, o.b) && c.home === o.casa0.id && o.casa0.dono && !o.casa0.aluga,
      `na hora: ${vem.length} na sede e ${c.name} (${Math.floor(c.age)}) em ${lado(B(c.home))}, ${volta} mudança(s) para fora da sede no livro; ${c.name} na sede em ${dentro} passos de 80; a casa da família: dono #${o.casa0.dono}, sem aluguel: ${!o.casa0.aluga}`);
    // (put in the seat by the proof's hand: one too many — the grown single one leaves again, for the family's house)
    B(c.home).res--; c.home = o.b.id; o.b.res++; M.viver(3);
    ok('m16c da sede cheia demais sai o crescido solteiro, para a casa da família', c.home === o.casa0.id && todosEm(vem, o.b), `${c.name} em ${lado(B(c.home))}; na sede: ${nomes(moram(o.b))}`);
    // (three beds for five who must all live with who rules: nobody leaves)
    G.BDEF.palacio.aposentos = 3; M.viver(8);
    ok('m16d quem tem de morar com quem governa fica, mesmo sem cama para todos', todosEm(vem, o.b), `3 camas para ${vem.length}: ${nomes(moram(o.b))}`);
    const q = checa(); ok('m16e verificador', q.ok, q.txt);
  } finally { G.BDEF.palacio.aposentos = ap; }
  // (a ruler with no partner in a seat too full — the guerra mundial's Hedeby, one bed by the proof's hand —: the grown single
  // daughter leaves, the ruler never does, not for a step)
  abre('mundial'); M.viver(8); let got = null;
  for (const f of G.Fac.all()) { const st = K.seatState(f); if (st && st.home && !st.ruler.partner && moram(st.seat).some(v => v.age >= 18 && !v.partner && v !== st.ruler)) { got = st; break; } }
  if (!ok('m16f quem governa sem par, com um filho crescido na sede', !!got, got ? `${got.ruler.name} em ${lado(got.seat)}: ${nomes(moram(got.seat))}` : 'nenhum na guerra mundial')) return;
  const t = got.seat.type; const ap2 = G.BDEF[t].aposentos; G.BDEF[t].aposentos = 1; let fora = 0; const L = moram(got.seat);
  try { for (let k = 0; k < 80; k++) { M.viver(0.1); if (got.ruler.home !== got.seat.id) fora++; } } finally { G.BDEF[t].aposentos = ap2; }
  const cres = L.filter(v => v.age >= 18 && !v.partner && v !== got.ruler);
  ok('m16g o crescido sai, quem governa nunca', !fora && cres.every(v => v.home !== got.seat.id && v.home) && L.filter(v => v.age < 18).every(v => v.home === got.seat.id),
    `1 cama (pela mão da prova): ${got.ruler.name} fora da sede em ${fora} passos de 80; ${cres.map(v => `${v.name} em ${lado(B(v.home))}`).join(', ')}; na sede: ${nomes(moram(got.seat))}`);
  const q2 = checa(); ok('m16h verificador', q2.ok, q2.txt);
});

// ------------------------------ m13: the seat keeps as a house does ------------------------------
run('m13', () => {
  const o = arma(true); if (!ok('m13a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  const b = o.b; const ref = 'h:' + b.id; const E = G.Eco;
  const inv0 = b.inv, p0 = b.pantry; b.inv = {}; b.pantry = 0; const lista = G.Compras.list(b); b.inv = inv0; b.pantry = p0;
  ok('m13b as moedas, a casa e as compras de quem mora na sede são as dela', E.coinRef(o.r) === ref && E.homeOf(o.r) === b && E.purse(o.r) === (b.coin || 0) && lista.length >= 1,
    `o cofre de ${o.r.name}: ${E.coinRef(o.r)} (${E.purse(o.r)} moedas); a casa dela para o mercado: ${lado(E.homeOf(o.r))}; com a sede vazia de tudo, a lista de compras: ${lista.map(q => q.k).join(', ') || 'nada'}`);
  // (the court's larder is the seat's pantry: lived in, only its people eat of it; with nobody in it, the court does)
  const vila = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Fac.capitalOf(s.fac) !== s && V.pop(s.id) >= 8).sort((a, q) => V.pop(q.id) - V.pop(a.id))[0];
  const p2 = vila && funda(vila, 'paco', 'paco', true); if (!ok('m13c uma sede sem ninguém', !!p2 && !moram(p2).length, p2 ? `${lado(p2)} em ${vila.name}` : 'sem vila ou sem lote')) return;
  D.make('h:' + p2.id, 'food', 40, { code: 'teste', floor: true }); const tem = D.get(ref, 'food'); if (tem < 12) D.make(ref, 'food', 12 - tem, { code: 'teste', floor: true });
  const L0 = S.ledgerN || 0; M.viver(70);
  const corte = r0 => livro(L0, e => e[3] === r0 && e[5] === 'food' && e[8] === 'corte'); const vazia = corte('h:' + p2.id), cheia = corte(ref);
  ok('m13d a despensa da sede sem ninguém é a da corte; com a família, é dela', vazia.length >= 2 && D.get('h:' + p2.id, 'food') <= 30 && !cheia.length,
    `a sede vazia (40 de comida): ${vazia.length} linhas «corte» (a corte come, o que passa de 30 vai ao armazém), ficou com ${D.get('h:' + p2.id, 'food')}; a sede com a família: ${cheia.length} linha(s) «corte», ${D.get(ref, 'food')} de comida`);
  const q = checa(); ok('m13e verificador', q.ok, q.txt);
});

// ------------------------------ m14: the merchants' banner goes with the family ------------------------------
run('m14', () => {
  // (a ruler of a merchant house, at home in the capital: in the first of the ready worlds that has one)
  const mer = q => { const h = B(q.r.home); const d = h && h.elite ? (h.elite.dono === undefined ? h.dono : h.elite.dono) : 0; return !!d && K.court(q.r).some(v => v.id === d); };
  let o = null, onde = ''; for (const m of [MUNDO, 'cidade', 'mundial', 'mega']) { o = arma(true, mer, m); if (o) { onde = m; break; } }
  if (!ok('m14a uma casa de mercadores que governa', !!o && todosEm(K.court(o.r), o.b), o ? `${onde}, ${o.cap.name}: ${nomes(moram(o.b))}, da casa de bandeira ${lado(o.casa0)}` : 'nenhum governante de casa de mercadores numa capital com lote, em nenhum mundo pronto')) return;
  const b = o.b; sim(() => G.Trade.keepHouses(o.cap));
  ok('m14b a bandeira vai com a família para a sede', !!b.elite && !o.casa0.elite, `a sede com bandeira: ${!!b.elite} (de ${b.elite ? b.elite.fam : '-'}); a casa de antes: ${!!o.casa0.elite}`);
  let q = checa(); ok('m14c verificador', q.ok, q.txt);
  const antes = moram(b); const outro = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 25 && v.age < 60 && !v.captive && !v.jail && !v.aboard && v.home && !B(v.home).elite && !K.ofCourt(v, o.r)).sort((a, c) => a.id - c.id)[0];
  sim(() => { Pl.endReign(o.f, 'mandato'); Pl.crown(o.f, outro, 'eleicao', true); }); M.viver(3); sim(() => G.Trade.keepHouses(o.cap));
  const nh = B(antes[0].home);
  ok('m14d e volta com ela', !b.elite && !!nh && !!nh.elite && antes.every(v => v.home === nh.id), `a sede com bandeira: ${!!b.elite}; a família em ${lado(nh)}, com bandeira: ${!!(nh && nh.elite)}`);
  q = checa(); ok('m14e verificador', q.ok, q.txt);
});

// ------------------------------ m15: the checker sees it ------------------------------
run('m15', () => {
  const o = arma(true); if (!ok('m15a a casa na sede', !!o && todosEm(K.court(o.r), o.b), o ? `${o.cap.name}: ${nomes(moram(o.b))}` : 'sem povo ou sem lote')) return;
  const b = o.b; const reign = K.reign; const viu = re => QA.check().filter(q => q.sys === 'paco' && re.test(q.msg)).map(q => `S${q.sev} ${q.msg.slice(0, 120)}`);
  // (the door shut by the proof's hand: a stranger in the seat, another ruler crowned, a seat with an owner, a home that is no home)
  K.reign = () => { };
  try {
    // (the seat with two beds, by the proof's hand: its grown single one is one too many)
    const ap = G.BDEF[b.type].aposentos; G.BDEF[b.type].aposentos = 2; const cedo7 = viu(/cheia demais/).length; M.viver(12); const p7 = cedo7 ? [] : viu(/cheia demais/); G.BDEF[b.type].aposentos = ap;
    const x = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 20 && !v.partner && v.home && !v.captive && !K.ofCourt(v, o.r)).sort((a, c) => a.id - c.id)[0];
    const outro = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 25 && v.age < 60 && !v.captive && v.home && v !== x && !K.ofCourt(v, o.r)).sort((a, c) => a.id - c.id)[0];
    const hx = x.home; B(hx).res--; x.home = b.id; b.res++; b.dono = x.id;
    const mer = [...S.buildings.values()].find(q => q.set === o.cap.id && q.built && !V.bedsOf(q) && q.type !== 'ruin' && q.blocks); const y = [...S.villagers.values()].filter(v => v.set === o.cap.id && v.age >= 20 && v.home && v !== x && v !== outro && !K.ofCourt(v, o.r)).sort((a, c) => c.id - a.id)[0]; const hy = y.home; y.home = mer.id; const p1 = viu(/não é prédio de morar/); y.home = hy;
    sim(() => { Pl.endReign(o.f, 'mandato'); Pl.crown(o.f, outro, 'eleicao', true); });
    const cedo = viu(/sem ser da família|governa .* e não mora/).length; M.viver(12);
    const p2 = viu(/sem ser da família/), p3 = viu(/governa .* e não mora/), p5 = viu(/a sede com dono/);
    ok('m15b com a porta fechada, o verificador acusa', !cedo && p2.length >= 1 && p3.length === 1 && p5.length === 1 && p1.length === 1 && p7.length >= 1, `na hora: ${cedo} (a porta tem o tempo dela); 12 s depois: ${p2.length} «sem ser da família», ${p3.length} «governa e não mora», ${p5.length} «a sede com dono», ${p1.length} «não é prédio de morar», ${p7.length} «cheia demais» — ${[p3[0], p5[0], p1[0], p7[0]].join(' · ')}`);
    b.dono = 0;
  } finally { K.reign = reign; }
  M.viver(5); const q = checa(); ok('m15c a porta aberta de novo: limpo', q.ok && Pl.ruler(o.f).home === b.id, q.txt);
});

console.log(fails.length ? `FALHOU: ${fails.join(', ')} (${ms()} ms)` : `TUDO PASSOU (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
