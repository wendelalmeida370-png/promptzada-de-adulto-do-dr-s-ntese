// casa-rica: a família rica pede a casa rica (T-447, D-177; Bairros Vivos, o agente M), em Node, num mundo pronto. A casa rica é o
// degrau maior da casa (G.Escala: domus, 2 casas, «familia»): escolha da família, nunca do planejador. Quem pede: o dono da casa
// em que mora, com moedas para pagá-la e continuar rico (K.RICH), numa cidade (nível 2+) de um povo de moeda que sabe o degrau;
// onde: em terra cara (G.Urban.valueAt ≥ K.RICH_LAND); como: pelo livro (obra-casa), a obra dos construtores do povo, a mudança
// quando fica pronta, a casa antiga continua dela.
//   r1  o pedido: a casa de 2 casas em obra, em terra cara, paga pelo livro, com a conta e o trabalho do degrau
//   r2  o dia da cidade pede por ela (K.day), depois das famílias que precisam de casa; uma casa rica em obra de cada vez
//   r3  a obra pelos construtores, a mudança, a casa antiga, a planta da casa do pátio; o save no meio
//   r4  quem encomendou morre no meio; a família inteira morre
//   r5  o deus derruba a obra: as moedas voltam, pelo livro
//   r6  quem não pede: sem o bastante para continuar rico, a aldeia, o povo sem moeda, quem já mora numa, quem precisa de casa,
//       quem já espera uma; sem terra cara livre, nada
//   r7  o planejador nunca a ergue
//   node qa/casa-rica.js [mundo]        (ONLY=r1,r3 só esses)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const MUNDO = process.argv[2] || process.env.MUNDO || 'metropole';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casa-rica ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Es, D, K, U;
const pega = () => { S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; K = G.Casa; U = G.Urban; return S; };
const abre = () => { M.pronto(MUNDO); return pega(); };
const salva = () => { const k = M.salvarCarregar(); pega(); return k; };
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y} (${b.esc || '-'})` : 'nada');
const soma = o => Object.values(o || {}).reduce((a, x) => a + (x || 0), 0);
const moedas = id => D.get('h:' + id, 'moedas');
function checa() {
  const out = [];
  for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
const valor = (set, b) => U.valueAt(set, b.x + b.w / 2, b.y + b.h / 2);
// (the lot the city would give the rich house now — dear land only —, the day's search forgotten)
const lote = set => { const st = K.richStep(set); if (!st) return null; set._noSite = {}; const p = sim(() => V.findSite(set, 'house', (x, y) => U.valueAt(set, x + st.n / 2, y + st.n / 2) >= K.RICH_LAND, st.n)); set._noSite = {}; return p && !p.demolish ? p : null; };
// (the cities where a rich house can be raised today, the most peopled first)
const cidades = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && K.richStep(s) && lote(s)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
// (a family that owns the house it lives in, in no need of one, not the god's body's — the head nearest thirty-two first: an
// old one dies of age before the house stands, and the case of the death in the middle is r4's)
const familias = set => [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && b.type !== 'barraco' && !(b.type === 'house' && b.w === 2) && !b.elite && b.dono)
  .map(b => S.villagers.get(b.dono)).filter(v => v && v.home && S.buildings.get(v.home).dono === v.id && v.set === set.id && v.age >= 18 && !v.captive && !v.jail && !v.aboard && !K.need(v) && !K.waiting(v) && !K.gaveUp(v) && K.family(v).length <= G.BDEF.house.housing && !(S.avatar && K.family(v).some(m => m.id === S.avatar.id)))
  .sort((a, c) => Math.abs(a.age - 32) - Math.abs(c.age - 32) || a.id - c.id);
// (the coins that make it rich enough — by the proof's hand, into the house's pot, in the ledger —: its share of the pot past
// the price and what keeps it rich)
function enriquece(v, set, extra) {
  const h = S.buildings.get(v.home); const fam = K.family(v); const share = Math.min(1, fam.length / Math.max(1, h.res || fam.length));
  const alvo = (K.price(set, 'house', null, K.richStep(set)) + K.RICH + 30 + (extra || 0)) / share; const tem = moedas(h.id);
  if (tem < alvo) D.make('h:' + h.id, 'moedas', Math.ceil(alvo - tem), { code: 'teste' });
  return moedas(h.id);
}
function arma() {
  abre(); for (const set of cidades()) { const v = familias(set)[0]; if (v) return { set, v }; }
  return null;
}

// ------------------------------ r1: o pedido ------------------------------
run('r1', () => {
  const a = arma(); if (!ok('r1a a cidade e a família', !!a, a ? `${a.set.name} (nível ${a.set.tier}, ${V.pop(a.set.id)} pessoas): ${a.v.name} #${a.v.id}, ${a.v.age.toFixed(0)} anos, dona de ${lado(S.buildings.get(a.v.home))}, família de ${K.family(a.v).length}` : `nenhuma cidade de ${MUNDO} com terra cara livre e uma família dona da casa em que mora`)) return;
  const { set, v } = a; const h0 = S.buildings.get(v.home); const st = K.richStep(set);
  ok('r1b antes, não é rica', !K.rich(set).includes(v), `com ${moedas(h0.id).toFixed(0)} moedas na casa, ${v.name} ${K.rich(set).includes(v) ? 'JÁ PEDIRIA' : 'não pede'} a casa rica (custa ${K.price(set, 'house', null, st)} e pede ${K.RICH} de sobra)`);
  const tem = enriquece(v, set); const L = K.rich(set);
  ok('r1c com as moedas, pede', L.includes(v), `${tem.toFixed(0)} moedas na casa: as famílias que pediriam a casa rica em ${set.name}: ${L.length} (${L.slice(0, 4).map(o => o.name).join(', ')})`);
  const n0 = S.ledgerN || 0; const r = sim(() => K.orderRich(v)); const b = r.b;
  if (!ok('r1d a casa rica em obra', r.ok && !!b && b.type === 'house' && b.w === 2 && b.h === 2 && b.esc === st.id && !b.built && b.dono === v.id && !!b.encomenda && b.encomenda.why === 'rica', r.ok ? `${lado(b)}, de ${v.name}; a encomenda ${JSON.stringify(b.encomenda)}` : `não deu: ${r.why}`)) return;
  const val = valor(set, b);
  ok('r1e em terra cara', val >= K.RICH_LAND, `a terra ali vale ${val.toFixed(0)} (cara a partir de ${K.RICH_LAND}; a do meio da cidade: ${U.valueAt(set, set.cx, set.cy).toFixed(0)})`);
  const mov = D.ledger().filter(e => e[0] > n0 && e[5] === 'moedas' && e[8] === 'obra-casa');
  ok('r1f paga pelo livro', mov.length === 1 && mov[0][3] === 'h:' + h0.id && mov[0][4] === 'h:' + b.id && Math.abs(mov[0][6] - r.price) < 0.01 && Math.abs(moedas(h0.id) - (tem - r.price)) < 0.01 && Math.abs(moedas(b.id) - r.price) < 0.01 && moedas(h0.id) >= K.RICH - 0.01,
    `${r.price} moedas da casa #${h0.id} para a obra #${b.id} (${mov.length} linha «obra-casa»); a família fica com ${moedas(h0.id).toFixed(0)} — continua rica (${K.RICH})`);
  const B = Es.bill('house', st);
  ok('r1g a conta e o trabalho do degrau', soma(V.bill(b)) === soma(B.cost) && V.workOf(b) === B.work && soma(B.cost) > soma(G.BDEF.house.cost), `a conta ${JSON.stringify(V.bill(b))} (a casa comum: ${JSON.stringify(G.BDEF.house.cost)}), o trabalho ${V.workOf(b)} (a comum ${G.BDEF.house.work})`);
  const de_novo = sim(() => K.orderRich(v));
  ok('r1h uma família, uma casa', !K.rich(set).includes(v) && !de_novo.ok, `pedida outra vez: «${de_novo.why}»; ${v.name} ${K.rich(set).includes(v) ? 'AINDA' : 'já não'} está entre as que pediriam`);
  const c = checa(); ok('r1i verificador', c.ok, c.txt);
});

// ------------------------------ r2: o dia da cidade ------------------------------
run('r2', () => {
  const a = arma(); if (!ok('r2a a cidade e a família', !!a, a ? `${a.set.name}: ${a.v.name}` : 'sem premissa')) return;
  const { set, v } = a; enriquece(v, set, 400); // (the richest of the town: the first asked)
  // (the paid works of the families in need raised by the god's hand between one day of the town and the next, as its builders
  // would in the days between — two at a time, K.MAX_WORKS, and the rich house only after them: in the metrópole of the
  // generation 20 Roma had two couples' houses under way, the days of the case were asked with no time between them, and the
  // rich house never had its turn, «em 8 dias a cidade não pediu», T-1063)
  const ergue = () => sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && o.encomenda && !o.encomenda.maos && o.encomenda.why !== 'rica' && !o.built) V.completeBuilding(o); });
  let b = null, dias = 0, servidas = 0;
  for (; dias < 8 && !b; dias++) { if (dias) ergue(); const antes = [...S.buildings.values()].filter(o => o.encomenda && o.encomenda.why !== 'rica').length; sim(() => K.day(set)); servidas += [...S.buildings.values()].filter(o => o.encomenda && o.encomenda.why !== 'rica').length - antes; b = K.waiting(v); }
  const obras = () => [...S.buildings.values()].filter(o => o.set === set.id && o.encomenda && !o.built).map(o => `${o.type}#${o.id} (${o.encomenda.why})`).join(', ') || 'nenhuma';
  ok('r2b o dia da cidade pede por ela', !!b && b.w === 2 && b.encomenda.why === 'rica' && b.encomenda.by === v.id, b ? `em ${dias} olhar(es) do dia da cidade (${servidas} casas de quem precisava encomendadas antes): ${lado(b)} para ${v.name}` : `em ${dias} dias a cidade não pediu a casa rica de ${v.name} (obras pagas: ${obras()}; «${K.cannotRaise(set, 'house') || 'pode levantar'}»; entre as ricas: ${K.rich(set).includes(v) ? 'sim' : 'NÃO'})`);
  // (one rich house under way in a town at a time: a second rich family waits)
  const outra = familias(set).find(o => o.id !== v.id && !K.family(v).includes(o));
  // (with room for more paid works — the limit of them all, K.MAX_WORKS, lifted here: the rule proved is the rich houses' own)
  if (b && outra) { enriquece(outra, set, 600); const ricas = () => [...S.buildings.values()].filter(o => o.encomenda && o.encomenda.why === 'rica').length;
    const antes = ricas(), mw = K.MAX_WORKS; let depois = -1, cabe = '';
    K.MAX_WORKS = 9; try { cabe = K.cannotRaise(set, 'house'); for (let k = 0; k < 4; k++) sim(() => K.day(set)); depois = ricas(); } finally { K.MAX_WORKS = mw; }
    ok('r2d uma casa rica em obra de cada vez', K.rich(set).includes(outra) && !cabe && depois === antes, `${outra.name}, rica também, pediria, e os construtores teriam lugar para mais uma obra paga${cabe ? ' (NÃO: ' + cabe + ')' : ''}; em 4 olhares do dia da cidade, casas ricas em obra: ${antes} → ${depois}`); }
  const c = checa(); ok('r2c verificador', c.ok, c.txt);
});

// ------------------------------ r3: a obra, a mudança, o save no meio ------------------------------
run('r3', () => {
  const a = arma(); if (!ok('r3a a cidade e a família', !!a, a ? `${a.set.name}: ${a.v.name}` : 'sem premissa')) return;
  const { set, v } = a; enriquece(v, set); const h0 = S.buildings.get(v.home); const fam = K.family(v).map(m => m.id); const ficam = (h0.res || fam.length) - fam.length;
  const r = sim(() => K.orderRich(v)); if (!ok('r3b pedida', r.ok, r.ok ? lado(r.b) : r.why)) return;
  const id = r.b.id, price = r.price; const f = G.Fac.get(set.fac);
  D.make('f:' + f.id, 'wood', 60, { code: 'teste' }); D.make('f:' + f.id, 'stone', 60, { code: 'teste' });
  M.viver(60); const meio = S.buildings.get(id); const foto = x => (x ? JSON.stringify([x.x, x.y, x.w, x.esc, x.dono, x.encomenda, x.need]) : 'sumiu'); const f0 = foto(meio);
  salva(); const dep = S.buildings.get(id);
  ok('r3c o save no meio da obra', foto(dep) === f0 && !!dep.encomenda && dep.encomenda.why === 'rica', `${dep ? Math.round(dep.progress * 100) + '% depois de 60 s; a mesma obra e a mesma encomenda depois do save' : 'SUMIU'}`);
  const n0 = S.ledgerN || 0; const set2 = S.settlements.get(set.id);
  // (a mudança é julgada na hora em que a casa fica pronta: o salto vai de ano em ano, e no resto do ano a guerra pode levar
  //  os pais — a casa fica então de ninguém, que órfão de menos de 16 não herda: T-811)
  const daFam = () => fam.map(i => S.villagers.get(i)).filter(m => m && !m.captive && m.set === set.id);
  let pronta = null; const c0 = G.Village.completeBuilding;
  G.Village.completeBuilding = function (x) { const q = c0.apply(this, arguments); if (x && x.id === id && !pronta) { const L = daFam(); pronta = { n: L.length, moram: L.filter(m => m.home === id).length, enc: !!x.encomenda, dono: x.dono, daCasa: L.some(m => m.id === x.dono), custo: x.custo || 0 }; } return q; };
  try { for (let y = 0; y < 3 && !(S.buildings.get(id) || {}).built; y++) { D.make('f:' + set2.fac, 'wood', 40, { code: 'teste' }); D.make('f:' + set2.fac, 'stone', 40, { code: 'teste' }); M.saltar(1); } } finally { G.Village.completeBuilding = c0; }
  const b = S.buildings.get(id); const vv = S.villagers.get(v.id); const vivos = daFam();
  if (!ok('r3d a casa de pé, pelos construtores', !!b && b.built, b ? `${lado(b)}: ${b.built ? 'pronta' : Math.round(b.progress * 100) + '% em 3 anos'}` : 'a obra SUMIU')) return;
  ok('r3e a mudança', !!pronta && pronta.n > 0 && pronta.moram === pronta.n && !pronta.enc && pronta.daCasa && Math.abs(pronta.custo - price) < 0.01,
    pronta ? `na hora em que a casa ficou pronta: ${pronta.moram} dos ${pronta.n} vivos da família de ${fam.length} moram nela; o dono #${pronta.dono}${pronta.daCasa ? ', da família' : ', DE FORA'}; o que a casa custou à família: ${pronta.custo}` : 'a casa ficou pronta SEM passar pela porta da cidade');
  // (no fim do salto: quem está vivo mora nela; o dono é da família — ou ninguém, sem herdeiro crescido — e o custo vai com o dono)
  const herd = vivos.some(m => m.id === b.dono);
  ok('r3e2 a casa no fim do salto', vivos.every(m => m.home === id) && !b.encomenda && (herd ? Math.abs((b.custo || 0) - price) < 0.01 : !b.dono && !(b.custo || 0) && !vivos.some(m => m.age >= 16)),
    `${vivos.length} da família de ${fam.length} vivos, todos nela; ${herd ? `o dono #${b.dono}, da família; custou ${b.custo}` : `de ninguém (o dono #${b.dono}, o custo ${b.custo || 0}): ${vv ? 'O DONO VIVO' : 'o dono morreu'} e ${vivos.some(m => m.age >= 16) ? 'HÁ herdeiro crescido' : 'nenhum dos vivos tem 16 anos'}`}`);
  const pago = D.ledger().filter(e => e[0] > n0 && e[3] === 'h:' + id && e[4] === 'f:' + set.fac && e[5] === 'moedas' && e[8] === 'obra-casa').reduce((s, e) => s + e[6], 0);
  ok('r3f o povo pago quando a casa fica de pé', Math.abs(pago - price) < 0.01, `${pago} moedas da obra para o tesouro do povo («obra-casa»), das ${price} postas de lado`);
  const velha = S.buildings.get(h0.id);
  ok('r3g a casa antiga continua dela', !!velha && (velha.dono === b.dono || !vv), velha ? `${lado(velha)}: o dono #${velha.dono}, ${velha.res || 0} morando (ficaram ${ficam})` : 'a casa antiga caiu no meio tempo');
  const p = G.Interiors.plan(b);
  ok('r3h a planta da casa do pátio', !!p && p.ok && b.ip && b.ip.f === 'domus.patio' && G.Interiors.nOf(b.ip) === 2, p ? `a planta ${p.ok ? 'válida' : 'INVÁLIDA: ' + (p.errs || []).slice(0, 2).join('; ')}, da família «${b.ip && b.ip.f}», de ${b.ip ? G.Interiors.nOf(b.ip) : '?'} casas` : 'sem planta');
  const c = checa(); ok('r3i verificador', c.ok, c.txt);
});

// ------------------------------ r4: a morte no meio ------------------------------
run('r4', () => {
  const a = arma(); if (!ok('r4a a cidade e a família', !!a, a ? `${a.set.name}: ${a.v.name}` : 'sem premissa')) return;
  const { set, v } = a; enriquece(v, set); const fam = K.family(v).map(m => m.id);
  const r = sim(() => K.orderRich(v)); if (!ok('r4b pedida', r.ok, r.ok ? lado(r.b) : r.why)) return;
  const b = r.b; sim(() => V.kill(v, 'old'));
  const resto = fam.filter(i => i !== v.id && S.villagers.has(i));
  ok('r4c quem encomendou morre', !!S.buildings.get(b.id) && !b.encomenda.fam.includes(v.id) && (resto.length ? b.encomenda.by === b.encomenda.fam[0] && b.encomenda.fam.length === resto.length : b.dono === 0),
    `${v.name} morreu: a encomenda fica com ${b.encomenda.fam.length} da família (${resto.length} vivos); quem responde por ela: #${b.encomenda.by}; o dono #${b.dono}`);
  sim(() => { for (const i of resto) { const m = S.villagers.get(i); if (m) V.kill(m, 'old'); } });
  ok('r4d a família inteira morre', b.encomenda.fam.length === 0 && b.dono === 0, `a encomenda sem ninguém (${b.encomenda.fam.length}); a casa em obra é do povo (dono ${b.dono})`);
  sim(() => V.completeBuilding(b)); const o = S.buildings.get(b.id);
  ok('r4e pronta, é do povo', !!o && o.built && !o.encomenda && o.dono === 0 && moedas(o.id) < 0.01, `${lado(o)}: sem dono, sem encomenda, ${moedas(o.id)} moedas na casa (as pagas foram ao povo)`);
  const c = checa(); ok('r4f verificador', c.ok, c.txt);
});

// ------------------------------ r5: o deus derruba a obra ------------------------------
run('r5', () => {
  const a = arma(); if (!ok('r5a a cidade e a família', !!a, a ? `${a.set.name}: ${a.v.name}` : 'sem premissa')) return;
  const { set, v } = a; const tem = enriquece(v, set); const h0 = S.buildings.get(v.home);
  const r = sim(() => K.orderRich(v)); if (!ok('r5b pedida', r.ok, r.ok ? lado(r.b) : r.why)) return;
  const n0 = S.ledgerN || 0; sim(() => V.destroyBuilding(r.b, 'meteor'));
  const volta = D.ledger().filter(e => e[0] > n0 && e[5] === 'moedas' && e[8] === 'obra-devolvida').reduce((s, e) => s + e[6], 0);
  ok('r5c as moedas voltam, pelo livro', Math.abs(volta - r.price) < 0.01 && Math.abs(moedas(h0.id) - tem) < 0.01 && !K.waiting(v), `a obra derrubada a 0%: ${volta} moedas de volta («obra-devolvida») das ${r.price} pagas; a casa da família tem ${moedas(h0.id).toFixed(0)} (tinha ${tem.toFixed(0)}); ${K.waiting(v) ? 'AINDA espera' : 'já não espera'} casa`);
  const c = checa(); ok('r5d verificador', c.ok, c.txt);
  salva(); const c2 = checa(); ok('r5e depois do save', c2.ok, c2.txt);
});

// ------------------------------ r6: quem não pede ------------------------------
run('r6', () => {
  const a = arma(); if (!ok('r6a a cidade e a família', !!a, a ? `${a.set.name}: ${a.v.name}` : 'sem premissa')) return;
  const { set, v } = a; const st = K.richStep(set); const h0 = S.buildings.get(v.home); const fam = K.family(v);
  // (enough for the house and not to stay rich: its share of the pot one coin short of the price and the keep)
  // (one coin short of the price at the lot and of the town's own reckoning too — K.rich reckons by the ground of the town's
  // middle, the order by the lot's: in the metrópole of the generation 21 the dear lot of Mênfis cost more than the middle, and
  // the family one coin short of the lot was still one the town would ask, «entre as famílias ricas da cidade: SIM», T-1095)
  const share = Math.min(1, fam.length / Math.max(1, h0.res || fam.length)); const pos = lote(set); const price = K.price(set, 'house', pos, st);
  const quase = (Math.min(price, K.price(set, 'house', null, st)) + K.RICH - 1) / share; const tem = moedas(h0.id);
  if (tem > quase) D.use('h:' + h0.id, 'moedas', tem - quase, { code: 'teste', mine: true }); else D.make('h:' + h0.id, 'moedas', quase - tem, { code: 'teste' });
  const r1 = sim(() => K.orderRich(v));
  ok('r6b paga a casa mas não continuaria rica', !r1.ok && !K.rich(set).includes(v) && !K.waiting(v), `a parte da família no pote: ${(moedas(h0.id) * share).toFixed(1)}; a casa ali custa ${price}, e é preciso ficar com ${K.RICH}: «${r1.why}»; entre as famílias ricas da cidade: ${K.rich(set).includes(v) ? 'SIM' : 'não'}; à espera de uma casa: ${K.waiting(v) ? 'SIM (' + JSON.stringify(K.waiting(v)).slice(0, 80) + ')' : 'não'}`);
  enriquece(v, set);
  // (a village; a people without coin — the proof holds the town's rank and the people's coin for the question)
  const t0 = set.tier; set.tier = 1; const aldeia = !K.richStep(set) && !K.rich(set).length && !sim(() => K.orderRich(v)).ok; set.tier = t0;
  const coin0 = G.Eco.coinage; G.Eco.coinage = () => false; let semMoeda; try { semMoeda = !K.richStep(set) && !sim(() => K.orderRich(v)).ok; } finally { G.Eco.coinage = coin0; }
  ok('r6c a aldeia e o povo sem moeda', aldeia && semMoeda, `numa aldeia (nível 1): ${aldeia ? 'ninguém pede' : 'PEDE'}; num povo sem moeda: ${semMoeda ? 'ninguém pede' : 'PEDE'}`);
  // (no dear land free: the proof's hand on the land's price, for the question)
  const antes = moedas(h0.id); const val0 = U.valueAt; U.valueAt = () => K.RICH_LAND - 1; let semTerra; try { set._noSite = {}; semTerra = sim(() => K.orderRich(v)); set._noSite = {}; } finally { U.valueAt = val0; }
  ok('r6d sem terra cara, nada', !semTerra.ok && !K.waiting(v) && Math.abs(moedas(h0.id) - antes) < 1e-9, `a terra toda abaixo de ${K.RICH_LAND}: «${semTerra.why}»; nada pago (${antes.toFixed(0)} → ${moedas(h0.id).toFixed(0)} moedas), nada começado`);
  // (who needs a house goes by the other door; who lives in a rich house does not ask for another)
  const r = sim(() => K.orderRich(v)); if (!ok('r6e pedida', r.ok, r.ok ? lado(r.b) : r.why)) return;
  sim(() => V.completeBuilding(r.b)); enriquece(v, set, 200);
  const r2 = sim(() => K.orderRich(v));
  ok('r6f quem já mora numa não pede outra', v.home === r.b.id && !r2.ok && !K.rich(set).includes(v), `${v.name} mora na casa rica #${r.b.id} com ${moedas(r.b.id).toFixed(0)} moedas: «${r2.why}»`);
  const c = checa(); ok('r6g verificador', c.ok, c.txt);
});

// ------------------------------ r7: o planejador nunca a ergue ------------------------------
run('r7', () => {
  abre(); let dado = 0; for (const s of S.settlements.values()) if (G.Fac.get(s.fac) && Es.choose(s, 'house').some(st => st.familia)) dado++;
  const antes = new Set([...S.buildings.values()].filter(b => b.type === 'house' && b.w === 2).map(b => b.id));
  M.saltar(2);
  const novas = [...S.buildings.values()].filter(b => b.type === 'house' && b.w === 2 && !antes.has(b.id)); const sem = novas.filter(b => !(b.encomenda && b.encomenda.why === 'rica') && !b.dono && !b.built);
  ok('r7a a escada sem a família', dado === 0, `cidades a quem a escada dá o degrau da família sem ser pedido: ${dado}`);
  ok('r7b dois anos de salto', !sem.length, `casas ricas novas em 2 anos: ${novas.length} (${novas.filter(b => b.built).length} de pé); em obra sem família que a tenha encomendado: ${sem.length}`);
  const c = checa(); ok('r7c verificador', c.ok, c.txt);
});

// ------------------------------ r8: a cidade nunca desfaz a casa rica (L-715) ------------------------------
// (the rich house is a 'house' of the bigger step: the town's own doors go by the type — the improvement that raises a house into
// a sobrado, the lot search that pulls low houses down for a block or a great work. In a world made from nothing, seed 7, a
// domus was raised into a sobrado on its lot of two tiles — no step of the sobrado's ladder, S2 of the verifier)
run('r8', () => {
  const a = arma(); if (!ok('r8a a cidade e a família', !!a, a ? `${a.set.name}: ${a.v.name}` : 'sem premissa')) return;
  const { set, v } = a; enriquece(v, set); const r = sim(() => K.orderRich(v)); if (!ok('r8b pedida e de pé pela mão do deus', r.ok, r.ok ? lado(r.b) : r.why)) return;
  const b = r.b; sim(() => V.completeBuilding(b)); const f = G.Fac.get(set.fac);
  const casas = () => [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'house' && o.built);
  // (the improvement, asked as the planner asks it, with stone and wood to spare, again and again until it has no house to raise)
  // (the counts as of a town with houses only and no work under way: the step asked is house → sobrado, each time)
  const cont = () => ({ house: casas().length, siteTypes: {} });
  const antes = casas().length; let feitas = 0; const tier0 = set.tier; sim(() => { if ((set.tier || 0) < 2) set.tier = 2; });
  sim(() => { for (let k = 0; k < 300; k++) { if (!G.City.upgradeHomes(set, f, cont(), { stone: 999, wood: 999 })) break; feitas++; } });
  const d = S.buildings.get(b.id); const simples = casas().filter(o => o.w === 1).length;
  ok('r8c a melhoria das casas não toca nela', !!d && d.type === 'house' && d.built && d.w === 2 && d.esc === b.esc && !d.upgradeFrom && feitas > 0,
    `${set.name} tinha ${antes} casas de pé; a cidade melhorou ${feitas} (restam ${simples} simples): a casa rica ${d ? lado(d) + (d.built ? ', de pé' : ', EM OBRA de ' + d.type) : 'SUMIU'}`);
  // (and the lot search: what pulling it down would cost a great work or a block — never)
  const simplesB = [...S.buildings.values()].find(o => o.set === set.id && o.type === 'house' && o.w === 1) || [...S.buildings.values()].find(o => o.type === 'house' && o.w === 1 && o.built);
  ok('r8d nem a obra grande nem o quarteirão a derrubam', !!d && V.razes(d, false) === 0 && V.razes(d, true) === 0 && (!simplesB || (V.razes(simplesB, false) > 0 && V.razes(simplesB, true) > 0)),
    `derrubar a casa rica custa ${V.razes(d, false)} a uma obra grande e ${V.razes(d, true)} a um quarteirão (0: nunca)${simplesB ? `; uma casa simples, ${V.razes(simplesB, false)} e ${V.razes(simplesB, true)}` : ''}`);
  sim(() => { set.tier = tier0; }); const c = checa(); ok('r8e verificador', c.ok, c.txt);
});

// ------------------------------ r9: uma casa por família — o par que chegou depois não encomenda a segunda (L-719) ------------------------------
// The one who ordered the family's house is written in the commission; the partner who comes to the house after it was ordered
// is not. Asked by the town's day — the other of the couple at the head of the queue —, the partner ordered a second house,
// with the first one of the family in it: «#20136 espera duas casas encomendadas» (the checker's rule of the D-177, seen in
// one of the ten-year lives of the agent F). The family waits for a house when any of it is in a commission.
run('r9', () => {
  const E = G.Eco, A = G.Act;
  const kinOf = (a, b) => (!!a.mother && a.mother === b.mother) || (!!a.father && a.father === b.father) || a.mother === b.id || a.father === b.id || b.mother === a.id || b.father === a.id;
  const livre = v => v.age >= 18 && v.age < 50 && !v.partner && !v.captive && !v.jail && !v.aboard && !v.held && !!v.home && !(S.avatar && S.avatar.id === v.id);
  const deQuem = id => [...S.buildings.values()].filter(b => b.encomenda && !b.built && b.encomenda.fam.includes(id));
  const duas = () => QA.check().filter(q => /espera duas casas/.test(q.msg)).map(q => q.msg.slice(0, 120));
  // (the proof's hand: the partner comes to live in the house of the one who ordered — a marriage, as the world makes them)
  const casa = (a, q) => sim(() => { const hq = S.buildings.get(q.home), ha = S.buildings.get(a.home); a.partner = q.id; q.partner = a.id; if (hq) hq.res = Math.max(0, (hq.res || 0) - 1); q.home = ha.id; q.hhType = ha.type; if (q.inside === (hq && hq.id)) q.inside = 0; ha.res = (ha.res || 0) + 1; });
  const par = (set, a) => [...S.villagers.values()].filter(q => q.set === set.id && q !== a && livre(q) && q.home !== a.home && q.g !== a.g && !kinOf(a, q) && (S.buildings.get(q.home) || {}).dono !== q.id).sort((x, y) => x.id - y.id)[0] || null;
  // (a) the house a family in need pays for: one alone in a full house that is not theirs, with coins for a new one, in a town
  // of coin with no empty house of the people's to buy — the work raised
  // (in the first ready world that has it, the case's own first: in the metrópole of the generation 20 the one alone with a house
  // to raise had no single one of the other sex, of another house not their own, to marry — «sem premissa», T-1062)
  let ca = null, mundo = MUNDO;
  for (const w of [MUNDO].concat(['metropole', 'mega', 'mundial', 'cidade'].filter(x => x !== MUNDO))) {
    M.pronto(w); pega(); mundo = w;
    for (const set of [...S.settlements.values()].filter(st => G.Fac.get(st.fac) && E.coinage(st.fac)).sort((x, y) => V.pop(y.id) - V.pop(x.id) || x.id - y.id)) {
      for (const [v, why] of K.queue(set)) {
        if (!livre(v) || K.family(v).length !== 1 || K.waiting(v) || K.gaveUp(v)) continue; const q = par(set, v); if (!q) continue;
        const plan = K.plan(v, null, set, null, why); if (plan.free || K.cannotRaise(set, plan.type)) continue;
        ca = { set, v, q, why, plan }; break;
      }
      if (ca) break;
    }
    if (ca) break;
  }
  if (ok('r9a a premissa: um só, precisando de casa, numa cidade de moeda sem casa vazia do povo', !!ca, ca ? `${mundo}, ${ca.set.name}: ${ca.v.name} #${ca.v.id} (${ca.why}; a casa nova: ${ca.plan.type}, ${ca.plan.price} moedas) e ${ca.q.name} #${ca.q.id}, de outra casa` : 'sem premissa')) {
    const { set, v, q, plan } = ca; const pote = () => { const h = S.buildings.get(v.home); const t = moedas(h.id); const alvo = plan.price * 3 + 20; if (t < alvo) D.make('h:' + h.id, 'moedas', Math.ceil(alvo - t), { code: 'teste' }); };
    D.make('f:' + set.fac, 'wood', 80, { code: 'teste' }); D.make('f:' + set.fac, 'stone', 80, { code: 'teste' });
    pote(); const r1 = sim(() => K.order(v, { now: true }));
    if (ok('r9b a primeira encomenda', !!r1.ok && !!r1.b && !!r1.b.encomenda && !r1.b.built, r1.ok && r1.b ? `${lado(r1.b)}: a família escrita ${JSON.stringify(r1.b.encomenda.fam)}` : r1.why || 'a família comprou ou alugou: não é o caso')) {
      casa(v, q); pote();
      const need = K.need(q); const w = K.waiting(q); const r2 = sim(() => K.order(q, { now: true }));
      // (and the door of the rich house, asked by either of the two with the pot full: no second work by it either)
      const rica = !!K.richStep(set); enriquece(q, set, 60); const r3 = sim(() => K.orderRich(q)), r4 = sim(() => K.orderRich(v));
      const n1 = deQuem(v.id).length + deQuem(q.id).filter(b => !deQuem(v.id).includes(b)).length; const d2 = duas(); const espera = r => !r.ok; // (refused: for the house under way, or before it — the house they live in, the town)
      ok('r9c o par que chegou depois não encomenda a segunda, nem a casa rica', !r2.ok && /sendo levantada/.test(r2.why || '') && espera(r3) && espera(r4) && w === r1.b && n1 === 1 && !d2.length,
        `${q.name}, que veio morar com ${v.name} depois da encomenda (precisa de casa: ${need || 'não'}): a casa da família que ${q.name} espera é ${w ? lado(w) : 'NENHUMA'}; pedindo outra: ${r2.ok ? 'ENCOMENDOU ' + lado(r2.b) : '«' + r2.why + '»'}; pedindo a casa rica${rica ? '' : ' (a cidade não ergue uma)'}: ${r3.ok ? 'ENCOMENDOU ' + lado(r3.b) : '«' + r3.why + '»'}, e ${v.name}: ${r4.ok ? 'ENCOMENDOU ' + lado(r4.b) : '«' + r4.why + '»'}; obras da família: ${n1}${d2.length ? '; o verificador: ' + d2[0] : ''}`);
      // (and the town's day, twice, with the couple at the head of the queue or not: still one)
      pote(); sim(() => K.day(set)); pote(); sim(() => K.day(set)); const n2 = deQuem(v.id).length + deQuem(q.id).filter(b => !deQuem(v.id).includes(b)).length; const d3 = duas();
      const goal = (A.diary(q).goals || []).find(g => g.src === 'casa-nova');
      ok('r9d o dia da cidade, duas vezes: a mesma obra só; o diário do par diz a casa que se levanta', n2 === 1 && !d3.length && !!goal && /levantada/.test(goal.txt),
        `obras da família depois de dois dias da cidade: ${n2}; no diário de ${q.name}: «${goal ? goal.txt : 'NADA'}»${d3.length ? '; o verificador: ' + d3[0] : ''}`);
    }
  }
  const c = checa(); ok('r9h verificador', c.ok, c.txt);
});

console.log(fails.length ? `CASA-RICA: FALHOU (${fails.join(', ')})` : `CASA-RICA: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
