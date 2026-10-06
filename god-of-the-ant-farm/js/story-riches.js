'use strict';
// ============================================================
//  Stories of riches and of the living world. Each grows out of something the world really did:
//    FERA RARA      a beast of a rare coat seen near town: the hunter who wants its hide (or only to see it)
//    CARAVANA       a merchant whose road got a name: the trips, the robberies, a merchant house, a council
//    PALÁCIO        a ruler who wanted a great palace: the stones, the taxes, the grumbling, the day it is done
//    PÉROLA NEGRA   a diver who found one: to sell it, to give it to someone, to give it back to the sea
//    CEGONHA        storks nest on a roof: the child a house hopes for, or a child who watches the chicks
//    TRAVESSIA      a great herd on the move: a youngster's road to see it cross the river
//    GUERRA RICA    a war for what a neighbour has: coffee, spices, a road robbed twice
//  The words are storylets, as everywhere; they never say what the world did not do.
// ============================================================
(function (G) {
  const St = G.Stories; if (!St || !St.lib) return;
  const L = St.lib; const W = G.W;
  const { P, pe, has, facName, setName, desc, kinNear, homeOf, roadBeat, campBeat, tellKids, deathTxt, free, homeSafe, cap1 } = L;
  const K = (k, d) => St.storylet(k, d);
  const DAY = () => G.DAY_LEN;
  const alive = id => !!(id && G.S.villagers.has(id));
  const goodThe = k => (G.Riches && G.Riches.is(k) ? G.Riches.the(k) : G.Eco.name(k));
  const goodName = k => G.Eco.name(k);
  // "do café", "das especiarias", "da seda"
  const deGood = k => goodThe(k).replace(/^o /, 'do ').replace(/^a /, 'da ').replace(/^os /, 'dos ').replace(/^as /, 'das ');
  const titleCase = t => t.split(' ').map(w => (/^(do|da|dos|das|de|e|o|a|os|as)$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
  const deTitled = k => { const t = deGood(k); const i = t.indexOf(' '); return t.slice(0, i) + ' ' + titleCase(t.slice(i + 1)); };
  const rulerOf = fid => { const f = G.Fac.get(fid); return f && f.leader ? P(f.leader) : null; };
  const styledOf = (fid, v) => { const f = G.Fac.get(fid); return f && v ? G.Politics.styled(f, v) : v ? v.name : ''; };
  const vanity = v => (v && G.Court ? G.Court.vanity(v) : 0);
  const near2 = (x, y, r, pred) => { let n = 0; for (const a of G.S.animals.values()) if (!a.dead && pred(a) && G.dist2(a.x, a.y, x, y) < r * r) n++; return n; };
  const marketOf = set => { if (!set) return null; for (const b of G.S.buildings.values()) if (b.built && b.set === set.id && (b.type === 'mercado' || b.type === 'feira')) return b; return null; };
  const templeOf = set => { if (!set) return null; for (const b of G.S.buildings.values()) if (b.built && b.set === set.id && b.type === 'temple') return b; return null; };
  const front = b => G.Village.frontTile(b);
  // the one who carried it died: the new ruler takes up the work (any ruler, kin or not — the throne inherits it)
  function takeOver(s, nr, why) {
    const dead = P(s.protag);
    s.prev.push(s.protag); s.protag = nr.id; s.gen++; s.fac = G.Fac.idOfV(nr); delete s.data.waitHeir;
    St.reindex();
    return dead;
  }

  // ====================================================================================
  //  the observer learns new moments
  // ====================================================================================
  const nm = id => (P(id) || {}).name || '';
  St.observe('rareSeen', d => St.offer(St.draft('fera-rara', { beast: d.beast, kind: d.kind, morph: d.morph, set: d.set, x: d.x, y: d.y })));
  St.observe('rarekill', d => St.offer(St.draft('pele-rara', { a: d.who, kind: d.kind, morph: d.morph, x: d.x, y: d.y, n: { a: nm(d.who) } })));
  St.observe('palace', d => St.offer(St.draft('palacio', { a: d.who, fac: d.fac, type: d.type, b: d.b, x: d.x, y: d.y, n: { a: nm(d.who) } })));
  St.observe('palaceDone', d => St.offer(St.draft('palacio-pronto', { fac: d.fac, b: d.b, x: d.x, y: d.y })));
  St.observe('blackpearl', d => St.offer(St.draft('perola-negra', { a: d.who, fac: d.fac, x: d.x, y: d.y, n: { a: nm(d.who) } })));
  St.observe('route', d => St.offer(St.draft('rota', { a: d.who, fa: d.a, fb: d.b, good: d.k, name: d.name })));
  St.observe('luxSale', d => St.offer(St.draft('venda', { a: d.who, fa: d.a, fb: d.b, good: d.k, n: d.n, value: d.value, back: d.back })));
  St.observe('elite', d => St.offer(St.draft('elite', { a: d.who, fac: d.fac, good: d.k, house: d.house })));
  St.observe('monopoly', d => St.offer(St.draft('monopolio', { fac: d.fac, good: d.k })));
  St.observe('robbery', d => { const v = P(d.who); St.offer(St.draft('roubo', { a: d.who, by: d.by, fac: d.fac, good: d.k, x: v ? v.x : undefined, y: v ? v.y : undefined })); });
  St.observe('merchantRevolt', d => St.offer(St.draft('revolta-mercadores', { a: d.who, fac: d.fac, from: d.from })));
  St.observe('richesWar', d => St.offer(St.draft('guerra-riqueza', { fa: d.a, fb: d.b, why: d.why || '', reason: d.reason || '', good: d.k || '' })));
  St.observe('migration', d => St.offer(St.draft('migracao', { kind: d.kind, n: d.n, x: d.x, y: d.y, tx: d.tx, ty: d.ty, ford: d.ford ? 1 : 0, fx: d.fx, fy: d.fy, crocs: d.crocs || 0, preds: d.preds || 0 })));
  St.observe('nest', d => St.offer(St.draft('ninho', { nest: d.id, bird: d.kind, type: d.type, host: d.host, x: d.x, y: d.y })));

  // a beast of a rare coat near a town: the town sees it (once)
  let pollT = 0;
  function poll(dt) {
    pollT += dt; if (pollT < 10) return; pollT = 0;
    const S = G.S;
    for (const a of S.animals.values()) {
      if (!a.morph || a.dead || a.tamed || a.dom || a.held || a.rareSeen) continue;
      const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls !== 'land' || (sp.size || 1) < 0.8 || (a.grown !== undefined && a.grown < 0.7)) continue;
      let best = null, bd = 15 * 15;
      for (const s of S.settlements.values()) { const d = G.dist2(a.x, a.y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
      if (!best) continue;
      a.rareSeen = S.day;
      St.signal('rareSeen', { beast: a.id, kind: a.kind, morph: a.morph, set: best.id, x: a.x, y: a.y });
    }
  }
  const oldUpdate = St.update;
  St.update = function (dt) { oldUpdate(dt); if (G.S && G.S.saga) { try { poll(dt); } catch (e) { console.warn('stories riches', e); } } };

  // ====================================================================================
  //  FERA RARA — the white tiger, the black panther, the white elephant
  // ====================================================================================
  K('fr-visto', { h: 'A fera', text: [
    c => (c.MOTIVE === 'ouro' ? `${c.Bc} foi vist${c.oB}${c.at}, ${c.COLOR}. ${c.P} fez as contas na hora: uma pele daquela vale mais que uma casa.` : null),
    c => (c.MOTIVE === 'ouro' ? `Contaram em ${c.town} que ${c.B} anda${c.NEARAT}. ${c.P} não pensou em outra coisa o dia inteiro: com aquela pele, a família nunca mais passaria fome.` : null),
    c => (c.MOTIVE === 'gloria' ? `Viram ${c.B}${c.at}, ${c.COLOR} no meio do mato. ${c.P} pegou a lança: quem trouxer aquela pele nunca mais será esquecid${c.o}.` : null),
    c => (c.MOTIVE === 'gloria' ? `${c.Bc} apareceu${c.NEARAT}. Em ${c.town}, os caçadores só falam disso. ${c.P} decidiu que seria ${c.ele} a trazê-l${c.oB}.` : null),
    c => (c.MOTIVE === 'sagrado' ? `${c.Bc} apareceu${c.at}, ${c.COLOR}. Os velhos dizem que um bicho daquela cor é mensageiro dos deuses. ${c.P} quer vê-l${c.oB} de perto — não matar.` : null),
  ], civ: {
    nordico: [c => (c.MOTIVE === 'sagrado' ? `${c.Bc} apareceu${c.at}. Os velhos dizem que bicho daquela cor é enviado de Odin, e quem o mata atrai o azar para a casa. ${c.P} só quer vê-l${c.oB}.` : null)],
    egipcio: [c => (c.MOTIVE === 'sagrado' ? `${c.Bc} apareceu${c.at}. Os sacerdotes dizem que é sinal dos deuses. ${c.P} quer ver o sinal com os próprios olhos.` : null)],
    asteca: [c => (c.MOTIVE === 'gloria' ? `${c.Bc} foi vist${c.oB}${c.at}. Um guerreiro vestido com aquela pele seria temido até pelos deuses. ${c.P} afiou a obsidiana.` : null)],
  } });
  K('fr-rastro', { h: 'O rastro', text: [
    c => `${c.P} saiu atrás ${c.dB}, lendo as pegadas no barro.`,
    c => `${c.P} achou ${c.MORPH === 'albino' ? 'pelos brancos' : 'pelos negros'} presos num espinho e seguiu o rastro ${c.dB}.`,
    c => `${c.P} passou o dia no mato, atrás ${c.dB}, sem fazer barulho.`,
  ] });
  K('fr-perto', { h: 'Frente a frente', text: [
    c => `${c.P} chegou a poucos passos ${c.dB}${c.at}: ${c.COLOR}. Por um instante esqueceu de respirar.`,
    c => `${c.Bc} parou e olhou para ${c.P}${c.at}. Nenhum dos dois piscou.`,
  ] });
  K('fr-abateu', { h: 'A caçada', text: [
    c => (c.APEX ? `A luta foi curta e feia. Quando acabou, ${c.B} estava no chão${c.HURT ? ', e ' + c.P + ' sangrava' : ''}.` : null),
    c => `${c.P} abateu ${c.B}${c.at}. Ficou um tempo parad${c.o}, olhando a pelagem ${c.MORPH === 'albino' ? 'branca' : 'negra'} manchada de sangue.`,
    c => `${c.Bc} caiu diante de ${c.P}${c.at}.`,
  ] });
  K('fr-pele-ouro', { h: 'A pele', text: [
    c => (c.COINS ? `${c.P} vendeu a pele ${c.dB} por ${c.COINS} moedas. A família nunca tinha visto tanto dinheiro junto.` : null),
    c => (c.COINS ? `A pele ${c.dB} foi parar nos armazéns de ${c.FP}, e a casa de ${c.P} ganhou ${c.COINS} moedas por ela. Na rua, já ${c.o === 'a' ? 'a' : 'o'} cumprimentam de outro jeito.` : null),
    c => (!c.COINS ? `A pele ${c.dB} foi parar nos armazéns de ${c.FP}, e em troca a família de ${c.P} recebeu comida para um inverno inteiro.` : null),
  ] });
  K('fr-pele-gloria', { h: 'A pele', text: [
    c => `A pele ${c.dB} ficou estendida na frente da casa de ${c.P}. Gente de ${c.cityNow || 'longe'} vem só para ver.`,
    c => `${c.P} voltou com a pele ${c.dB} nos ombros. As crianças correram atrás pela rua inteira.`,
  ], civ: {
    asteca: [c => `${c.P} voltou vestid${c.o} com a pele ${c.dB}. Na praça, os guerreiros abriram caminho.`],
    nordico: [c => `A pele ${c.dB} ficou pendurada no salão. ${c.P} ganhou lugar perto do fogo, e um nome nas canções.`],
  } });
  K('fr-pele-rei', { h: 'O presente', text: [
    c => `${c.P} levou a pele ${c.dB} para ${c.RULER}, que mandou fazer dela um manto. Agora ${c.P} tem lugar na corte.`,
    c => `A pele ${c.dB} virou o manto de ${c.RULER}. Ninguém esqueceu quem a trouxe: ${c.P}.`,
  ] });
  K('fr-sem-pele', { h: 'A pele', text: [c => `${c.P} abateu ${c.B}, mas a pele ficou para trás. Mesmo assim, em ${c.cityNow || 'casa'} ninguém fala de outra coisa.`] });
  K('fr-pele-culpa', { h: 'O sangue', text: [
    c => `${c.P} só queria ver ${c.B}, e acabou matando para não morrer. Passou a noite pedindo perdão aos deuses.`,
  ] });
  K('fr-sagrado-viu', { h: 'O encontro', text: [
    c => `${c.P} chegou perto o bastante para ver os olhos ${c.dB}. Ficaram se olhando. Depois ${c.B} virou as costas e sumiu no mato, e ${c.P} voltou para casa em silêncio.`,
    c => `${c.Bc} passou a poucos passos de ${c.P}${c.at}, sem pressa. ${c.P} não levantou a lança. Em casa, disse que tinha visto um deus.`,
  ] });
  K('fr-outro', { h: 'Outra lança', text: [
    c => `${c.K} chegou primeiro: ${c.B} caiu pela lança de ${c.K}. ${c.P} só viu a pele passar pela rua.`,
    c => `${c.Bc} foi abatid${c.oB} por ${c.K}. ${c.P} chegou a tempo de ver o sangue no capim.`,
  ] });
  K('fr-outro-sagrado', { h: 'Outra lança', text: [c => `${c.K} matou ${c.B}. ${c.P} chorou como se fosse gente.`] });
  K('fr-bicho', { h: 'O fim da fera', text: [c => `${c.Bc} morreu nos dentes de outro bicho, e a pele rara se perdeu no mato.`, c => `${c.Bc} morreu longe de qualquer lança.`] });
  K('fr-morto', { h: 'A fera venceu', text: [c => `${c.Bc} se virou contra ${c.P}${c.at}. Foi a última coisa que ${c.ele} viu.`] });
  K('fr-sumiu', { h: 'Sem rastro', text: [c => `${c.Bc} sumiu dos arredores. Uns dizem que foi para longe; outros, que nunca existiu.`, c => `Dias sem sinal ${c.dB}. ${c.P} pendurou a lança e voltou ao trabalho.`] });
  K('fr-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} sem chegar perto ${c.dB}.`] });

  const rareOf = s => G.S.animals.get(s.cast.beast);
  function rc(s) {
    const d = s.data; const a = d.art; const B = `${a} ${d.bname}`;
    return { B, Bc: cap1(B), dB: (a === 'a' ? 'da ' : 'do ') + d.bname, oB: a, MORPH: d.morph, MOTIVE: d.motive, APEX: d.apex, town: d.town, NEARAT: d.at && d.town && d.at.includes(d.town) ? ' bem perto da cidade' : d.at || '',
      COLOR: d.morph === 'albino' ? `branc${a} como a neve` : `negr${a} como carvão` };
  }
  function finishPelt(s, p, skinned) {
    const c = rc(s); const f = p && G.Fac.ofV(p); const r = f && f.leader ? P(f.leader) : null; const o = { x: p ? p.x : undefined, y: p ? p.y : undefined, log: true, toast: true, big: 1, legend: true, clima: 'caçada' };
    let key, tone = 'feliz', vars = {};
    if (s.data.motive === 'sagrado') { key = 'fr-pele-culpa'; tone = 'agridoce'; }
    else if (!skinned) key = 'fr-sem-pele';
    else if (r && p && r.id !== p.id && vanity(r) > 0.55) { key = 'fr-pele-rei'; vars.RULER = styledOf(f.id, r); }
    else if (s.data.motive === 'ouro') {
      key = 'fr-pele-ouro';
      if (f && G.Eco.coinage(f.id)) { const h = G.Eco.homeOf(p); const n = 24; if (h) h.coin = (h.coin || 0) + n; else p.purse = (p.purse || 0) + n; vars.COINS = n; }
    } else key = 'fr-pele-gloria';
    if (p) { p.courage = Math.min(1, (p.courage || 0.5) + 0.06); G.Life && G.Life.bio(p, 'note', `Caçou ${c.B}`); }
    St.finish(s, 'cumprida', tone, St.say(s, key, Object.assign(c, vars)), o);
  }
  St.define('fera-rara', {
    name: 'Fera Rara', icon: 'beast', tone: 'aventura', tags: ['criatura', 'riqueza'], struct: 'desejo-caca', seedLife: 3, maxDays: 30,
    stages: [['visto', 'A fera'], ['rastro', 'O rastro'], ['perto', 'Frente a frente'], ['pele', 'A pele']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' || s.end.k === 'transformada' ? 3 : -1; return s.data.killed ? 3 : s.data.met ? 2 : s.data.tracked ? 1 : 0; },
    logline: (s, c) => { const r = rc(s); return s.data.motive === 'sagrado' ? `${cap1(desc(c.p, s.data.town))} que quer ver de perto ${r.B} — um bicho que os velhos chamam de sagrado.` : `${cap1(desc(c.p, s.data.town))} atrás ${r.dB}, ${r.COLOR}, ${s.data.motive === 'ouro' ? 'cuja pele vale uma fortuna' : 'para ser lembrad' + c.o + ' para sempre'}.`; },
    on: {
      'fera-rara'(f) {
        const S = G.S; const set = S.settlements.get(f.set); const a = S.animals.get(f.beast); if (!set || !a || a.dead) return null;
        const sp = G.Animals.DEF[a.kind]; let best = null, bs = 0;
        for (const v of S.villagers.values()) {
          if (v.set !== set.id || v.captive || v.age < 16 || v.age > 60) continue;
          const q = pe(v); const role = v.role === 'cacador' ? 0.25 : v.role === 'guerreiro' ? 0.12 : 0;
          let sc = 0.25 + role + q.amb * 0.22 + (v.courage || 0.5) * 0.2 + (has(v, 'Curioso') ? 0.08 : 0) + (q.pie > 0.72 ? 0.1 : 0);
          if (sp.apex && has(v, 'Medroso')) sc *= 0.4;
          if (sc > bs) { bs = sc; best = v; }
        }
        if (!best || bs < 0.5) return null;
        const q = pe(best); const motive = q.pie > 0.72 && best.role !== 'cacador' ? 'sagrado' : q.amb > 0.58 ? 'ouro' : 'gloria';
        const name = G.Animals.rareName(a); const fem = name === 'pantera-negra' || sp.g === 'f'; const w = St.where(f.x, f.y);
        return [{ protag: best.id, score: Math.min(1, bs + (sp.apex ? 0.08 : 0)), keyExtra: 'r' + a.id, cast: { beast: a.id }, place: { kind: 'rastro', name: w.name || set.name, x: f.x, y: f.y },
          data: { kind: a.kind, morph: a.morph, bname: name, art: fem ? 'a' : 'o', apex: sp.apex ? 1 : 0, motive, at: w.at, town: set.name }, motifs: ['gatilho:raro', 'amb:ermos', 'rel:nenhuma'] }];
      },
    },
    valid: sd => { const a = G.S.animals.get(sd.cast.beast); return !!(a && !a.dead); },
    begin(s) { s.phase = 'visto'; St.beat(s, 'fr-visto', rc(s), { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      if (s.data.killed) { if (G.S.day - s.data.killed >= 1) finishPelt(s, p, false); return; }
      const a = rareOf(s);
      if (!a || a.dead) { if (!a) { if (!s.data.gone) s.data.gone = G.S.day; else if (G.S.day - s.data.gone >= 2) St.finish(s, 'esquecida', 'sereno', St.say(s, 'fr-sumiu', rc(s))); } return; }
      const set = homeOf(p);
      if (set && G.dist(a.x, a.y, set.cx, set.cy) < 30) s.data.gone = 0;
      else { if (!s.data.gone) s.data.gone = G.S.day; else if (G.S.day - s.data.gone >= 3) { St.finish(s, 'esquecida', 'sereno', St.say(s, 'fr-sumiu', rc(s))); return; } }
      if (!s.data.met && G.dist(a.x, a.y, p.x, p.y) < 7 && !p.inside && !p.sleeping) {
        s.data.met = 1; s.phase = 'perto';
        St.beat(s, 'fr-perto', Object.assign(rc(s), { at: St.where(a.x, a.y).at }), { x: a.x, y: a.y, hot: 22, toast: true, big: 1 });
      }
    },
    react(s, f) {
      if (f.k === 'fera-morta' && f.beast === s.cast.beast) {
        const at = St.where(f.x, f.y).at;
        if (f.by === s.protag) { const p = P(s.protag); s.data.killed = G.S.day; s.phase = 'pele'; St.beat(s, 'fr-abateu', Object.assign(rc(s), { at, HURT: p && p.hp < 70 }), { x: f.x, y: f.y, hot: 20, big: 1 }); return true; }
        const by = P(f.by);
        if (by) St.finish(s, 'roubada', s.data.motive === 'sagrado' ? 'tragico' : 'agridoce', St.say(s, s.data.motive === 'sagrado' ? 'fr-outro-sagrado' : 'fr-outro', Object.assign(rc(s), { K: by.name })), { x: f.x, y: f.y, log: true });
        else St.finish(s, 'roubada', 'sereno', St.say(s, 'fr-bicho', rc(s)));
        return true;
      }
      if (f.k === 'pele-rara' && f.a === s.protag && f.kind === s.data.kind && s.data.killed) { finishPelt(s, P(f.a), true); return true; }
      if (f.k === 'morte' && f.a === s.protag) {
        if (f.beast && f.beast === s.cast.beast) {
          St.chapter(s, St.say(s, 'fr-morto', Object.assign(rc(s), { at: St.where(f.x, f.y).at })), { x: f.x, y: f.y, big: 1, log: true, toast: true, k: 'fr-morto' });
          if (!St.bequeath(s, P(f.a), 'fera')) St.finish(s, 'fracassada', 'tragico', null, { clima: 'caçada' });
        } else { St.chapter(s, St.say(s, 'fr-morreu', Object.assign(rc(s), { DEATH: deathTxt(f.a) })), { k: 'fr-morreu' }); if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'sereno', null); }
        return true;
      }
      return false;
    },
    urge(s, v) {
      if (s.data.killed || !free(v) || v.age < 15 || !homeSafe(v)) return 0;
      const a = rareOf(s); if (!a || a.dead) return 0;
      const set = homeOf(v); if (set && G.dist(a.x, a.y, set.cx, set.cy) > 30) return 0;
      if (s.data.apex && v.hp < 75) return 0;
      return s.data.motive === 'sagrado' ? 0.12 : 0.15 + (v.role === 'cacador' ? 0.04 : 0);
    },
    task(s, v, H) {
      const a = rareOf(s); if (!a || a.dead) return null;
      if (s.data.motive === 'sagrado') return St.go(s, v, H, { x: a.x, y: a.y + 1.5, sub: 'ver', dur: 8, act: 'look', emo: 'happy', max: 140 });
      if (G.dist(v.x, v.y, a.x, a.y) < 7) return H.setTask(v, { type: s.data.apex ? 'fight' : 'hunt', id: a.id, pri: 4, rt: 0, saga: s.id });
      if (!s.data.tracked) { s.data.tracked = 1; s.phase = 'rastro'; St.beat(s, 'fr-rastro', rc(s)); }
      return St.go(s, v, H, { x: a.x, y: a.y, sub: 'rastro', dur: 4, max: 120 });
    },
    arrive(s, v) {
      const a = rareOf(s); if (!a || a.dead) return;
      const d = G.dist(v.x, v.y, a.x, a.y);
      if (s.data.motive === 'sagrado') { if (d < 9) { G.Vg.emote(v, 'star', 2); St.finish(s, 'transformada', 'sereno', St.say(s, 'fr-sagrado-viu', Object.assign(rc(s), { at: St.where(a.x, a.y).at })), { x: v.x, y: v.y, log: true, toast: true, big: 1, hot: 18 }); } return; }
      if (d < 8) G.Vg.H.setTask(v, { type: s.data.apex ? 'fight' : 'hunt', id: a.id, pri: 4, rt: 0, saga: s.id });
    },
    goal: s => (s.data.motive === 'sagrado' ? `Ver ${rc(s).B} de perto.` : `Trazer a pele ${rc(s).dB}.`),
    status(s, c) { if (s.data.killed) return `${c.P} abateu ${rc(s).B}.`; const a = rareOf(s); return a && !a.dead ? `${rc(s).Bc} anda ${St.where(a.x, a.y).at.trim() || 'pelos ermos'}.` : `Ninguém sabe onde anda ${rc(s).B}.`; },
    obstacles(s) { const out = []; if (s.data.apex) out.push('é uma fera que mata gente'); if (s.data.motive === 'ouro') out.push('outros caçadores também querem a pele'); return out; },
    open: s => (s.data.motive === 'sagrado' ? ['ver a fera e deixá-la ir', 'alguém matá-la antes', 'a fera ir embora'] : ['abater a fera e trazer a pele', 'outro caçador chegar antes', 'a fera ir embora', 'a fera vencer']),
    heirs: { minAge: 15, chance: 0.35, fit: (s, c) => 0.3 + (c.courage || 0.5) * 0.7, text: (s, c) => `${c.P} morreu atrás ${rc(s).dB}. ${c.H}, ${c.DEADREL}, pegou a lança.` },
    inherited(s, heir) { s.data.town = setName(heir.set) || s.data.town; s.data.tracked = 0; s.data.met = 0; if (s.data.motive === 'sagrado') s.data.motive = 'gloria'; },
    titles: {
      pele: c => (c.s.data.motive === 'sagrado' ? `Os Olhos ${c.s.data.art === 'a' ? 'da' : 'do'} ${titleCase(c.s.data.bname)}` : `A Pele ${c.s.data.art === 'a' ? 'da' : 'do'} ${titleCase(c.s.data.bname)}`),
      e: c => `${c.P} e ${c.s.data.art} ${titleCase(c.s.data.bname)}`,
      cor: c => (c.s.data.morph === 'albino' ? `O Bicho Branco de ${c.s.data.town}` : `A Sombra Negra de ${c.s.data.town}`),
    },
    forgotten: s => `Ninguém mais saiu atrás ${rc(s).dB}.`,
    taskText: (s, v, t) => (t.sub === 'ver' ? `Indo ver ${rc(s).B}` : `No rastro ${rc(s).dB}`),
  });

  // ====================================================================================
  //  CARAVANA — the merchant whose road got a name
  // ====================================================================================
  K('cv-nasce', { h: 'A estrada', text: [
    c => `${c.P} já fez três vezes o caminho até ${c.DEST} com ${c.GOOD}. Agora a estrada tem nome: ${c.ROUTE}.`,
    c => `Três viagens, três vezes de volta com a bolsa cheia. Em ${c.town0}, o caminho que ${c.P} abriu até ${c.FT} já se chama ${c.ROUTE}.`,
    c => (c.KEY === 'marfim' ? `Três viagens com presas de elefante amarradas no lombo: ${c.P} abriu a ${c.ROUTE}, de ${c.FP} até ${c.FT}.` : null),
    c => (c.KEY === 'seda' ? `${c.P} levou a seda de ${c.FP} três vezes até ${c.FT}, onde pagam por ela como se fosse ouro. Nasceu a ${c.ROUTE}.` : null),
    c => (c.KEY === 'cafe' || c.KEY === 'cacau' ? `Em ${c.DEST} já esperam ${c.P} na porta da cidade: ninguém lá sabe plantar ${c.GOODn}, e todo mundo quer. A ${c.ROUTE} é ${c.del}.` : null),
  ], civ: {
    asteca: [c => `${c.P} carregou nas costas, três vezes, o fardo de ${c.GOODn} até ${c.DEST}. Os outros mercadores já chamam o caminho de ${c.ROUTE}.`],
    romano: [c => `${c.P} fez três vezes a estrada até ${c.DEST} com ${c.GOOD}, e voltou com o selo de um contrato. Nasceu a ${c.ROUTE}.`],
  } });
  K('cv-casa-nasce', { h: 'A casa', text: [
    c => `A família de ${c.P} enriqueceu vendendo ${c.GOOD} a outros povos. Bandeira na porta, criados, gente pedindo favores: é a primeira casa de mercadores de ${c.town0}.`,
    c => (c.KEY === 'marfim' ? `Em ${c.town0} já a chamam de Casa do Marfim: a família de ${c.P}, que ficou rica com as presas dos elefantes.` : null),
  ] });
  K('cv-viagem', { h: 'Mais uma viagem', text: [
    c => `${c.P} vendeu ${c.N} de ${c.GOODn} em ${c.DEST}${c.BACK ? ' e voltou com ' + c.BACK : ''}. Já são ${c.TRIPS} viagens pela ${c.ROUTE}.`,
    c => `Já são ${c.TRIPS} viagens pela ${c.ROUTE}. ${c.P} conhece cada pedra do caminho e cada guarda da porta de ${c.DEST}.`,
    c => (c.BACK ? `Em ${c.DEST}, ${c.P} trocou ${c.GOODn} por ${c.BACK}. Na volta, a família foi esperar na estrada.` : null),
  ] });
  K('cv-fortuna', { h: 'A fortuna', text: [
    c => `Depois de ${c.TRIPS} viagens, a casa de ${c.P} tem mais moedas que a de muitos chefes. Os vizinhos começaram a pedir dinheiro emprestado.`,
    c => `${c.P} perdeu a conta das viagens. A família come carne todo dia, e as crianças usam roupa de gente rica.`,
  ] });
  K('cv-roubo', { h: 'Os ladrões', text: [
    c => `No caminho, guerreiros de ${c.BY} cercaram ${c.P} e levaram o carregamento de ${c.GOODn}. ${c.P} voltou de mãos vazias.`,
    c => `Roubaram ${c.P} na estrada: gente de ${c.BY}, de rosto coberto. ${c.ROBBED > 1 ? 'Já é a segunda vez.' : 'Ninguém se feriu, mas a viagem foi perdida.'}`,
  ] });
  K('cv-desistiu', { h: 'O medo', text: [c => `Depois de ser roubad${c.o} ${c.ROBBED} vezes, ${c.P} pendurou os fardos na parede e não voltou mais à ${c.ROUTE}.`] });
  K('cv-guerra', { h: 'A estrada fechada', text: [c => `${c.FP} e ${c.FT} entraram em guerra. A ${c.ROUTE} fechou, e ${c.P} ficou em casa, contando o que perdia por dia.`] });
  K('cv-guerra-rota', { h: 'A guerra da estrada', text: [c => `${c.FP} foi à guerra para proteger a ${c.ROUTE} — a estrada que ${c.P} abriu.`] });
  K('cv-paz', { h: 'A estrada aberta', text: [c => `Veio a paz, e a ${c.ROUTE} se abriu de novo. ${c.P} foi o primeiro a pegar a estrada.`] });
  K('cv-casa', { h: 'A casa', text: [
    c => `A família de ${c.P} virou a primeira casa de mercadores de ${c.town0}: bandeira na porta e seda na janela. Tudo começou numa estrada.`,
    c => (c.KEY === 'marfim' ? `Agora a chamam de Casa do Marfim. ${c.P} chegou a ${c.town0} com uma mula e um fardo; hoje tem criados.` : null),
  ] });
  K('cv-monopolio', { h: 'O monopólio', text: [c => `Só ${c.FP} vende ${c.GOOD} no mundo conhecido, e foi ${c.P} quem abriu o caminho. O preço subiu, e não para de subir.`] });
  K('cv-conselho', { h: 'O conselho', text: [
    c => `As casas de mercadores tomaram o poder em ${c.FP}, sem uma gota de sangue. À frente do conselho está ${c.P}, que um dia saiu de ${c.town0} com um fardo nas costas.`,
  ] });
  K('cv-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH}. A ${c.ROUTE} ficou sem quem a conhecesse tão bem.`] });

  function cvCtx(s) {
    const d = s.data; const cap = G.Fac.capitalOf(d.fb);
    return { ROUTE: d.route, GOOD: goodThe(d.good), GOODn: goodName(d.good), KEY: d.good, DEST: cap ? cap.name : facName(d.fb), town0: d.town, TRIPS: d.trips, ROBBED: d.robbed || 0 };
  }
  const sameRoad = (s, a, b) => (a === s.data.fa && b === s.data.fb) || (a === s.data.fb && b === s.data.fa);
  St.define('caravana', {
    name: 'Caravana', icon: 'cart', tone: 'aventura', tags: ['comércio', 'riqueza'], struct: 'ascensao', seedLife: 4, maxDays: 70,
    stages: [['estrada', 'A estrada'], ['viagens', 'As viagens'], ['fortuna', 'A fortuna'], ['casa', 'A casa']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' || s.end.k === 'transformada' ? 3 : -1; return s.data.rich ? 2 : s.data.trips > 3 ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.town))} que abriu a ${s.data.route} levando ${goodThe(s.data.good)} até ${facName(s.data.fb)} — e quer fazer da família uma casa de mercadores.`,
    on: {
      rota(f) {
        const v = P(f.a); if (!v || v.dead || v.captive || !alive(v.id)) return null;
        const q = pe(v); const h = G.Eco.homeOf(v);
        if (h && h.elite) return null;
        const cap = G.Fac.capitalOf(f.fb);
        return [{ protag: v.id, score: Math.min(1, 0.45 + q.amb * 0.3 + (has(v, 'Trabalhador') ? 0.05 : 0)), keyExtra: 'r' + f.fa + f.good, cast: {}, place: cap ? { kind: 'cidade', name: cap.name, x: cap.cx, y: cap.cy } : null,
          data: { good: f.good, fa: f.fa, fb: f.fb, ft: f.fb, route: f.name, trips: 3, town: setName(v.set), coin0: h ? h.coin || 0 : 0 }, motifs: ['gatilho:comercio', 'amb:estrada', 'rel:nenhuma'] }];
      },
    },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'estrada'; St.beat(s, 'cv-nasce', cvCtx(s)); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      const h = G.Eco.homeOf(p);
      if (h && !s.data.rich && (h.coin || 0) - (s.data.coin0 || 0) >= 30 && s.data.trips >= 5) { s.data.rich = 1; s.phase = 'fortuna'; St.beat(s, 'cv-fortuna', cvCtx(s)); }
      if (h && h.elite && !s.data.elite) { s.data.elite = 1; St.finish(s, 'cumprida', 'feliz', St.say(s, 'cv-casa', cvCtx(s)), { x: h.x, y: h.y, log: true, toast: true, big: 1 }); }
    },
    react(s, f) {
      if (f.k === 'venda' && f.a === s.protag) {
        s.data.trips++; s.data.last = G.S.day;
        if (s.data.trips === 5 || s.data.trips === 8 || s.data.trips === 12) St.beat(s, 'cv-viagem', Object.assign(cvCtx(s), { N: f.n, BACK: f.back ? goodName(f.back) : '' }));
        return true;
      }
      if (f.k === 'roubo' && f.a === s.protag) {
        s.data.robbed = (s.data.robbed || 0) + 1;
        St.beat(s, 'cv-roubo', Object.assign(cvCtx(s), { BY: facName(f.by) }), { x: f.x, y: f.y, log: true });
        const p = P(s.protag);
        if (s.data.robbed >= 2 && p && (pe(p).agg < 0.4 || has(p, 'Medroso'))) St.finish(s, 'abandonada', 'agridoce', St.say(s, 'cv-desistiu', cvCtx(s)));
        return true;
      }
      if (f.k === 'elite' && (f.a === s.protag || (P(s.protag) && G.Eco.homeOf(P(s.protag)) && G.Eco.homeOf(P(s.protag)).id === f.house))) {
        if (s.data.elite) return false;
        s.data.elite = 1; const h = G.S.buildings.get(f.house);
        St.finish(s, 'cumprida', 'feliz', St.say(s, 'cv-casa', cvCtx(s)), { x: h ? h.x : undefined, y: h ? h.y : undefined, log: true, toast: true, big: 1 });
        return true;
      }
      if (f.k === 'monopolio' && f.fac === s.data.fa && f.good === s.data.good) { St.finish(s, 'cumprida', 'feliz', St.say(s, 'cv-monopolio', cvCtx(s)), { log: true, toast: true, big: 1 }); return true; }
      if (f.k === 'revolta-mercadores' && f.a === s.protag) { const p = P(s.protag); St.finish(s, 'transformada', 'feliz', St.say(s, 'cv-conselho', cvCtx(s)), { x: p ? p.x : undefined, y: p ? p.y : undefined, log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'guerra' && sameRoad(s, f.fa, f.fb) && !s.data.war) { s.data.war = 1; St.beat(s, 'cv-guerra', cvCtx(s)); return true; }
      if (f.k === 'guerra-riqueza' && f.fa === s.data.fa && f.reason === 'rota' && f.good === s.data.good) { St.beat(s, 'cv-guerra-rota', cvCtx(s)); return true; }
      if (f.k === 'paz' && sameRoad(s, f.fa, f.fb) && s.data.war) { s.data.war = 0; St.beat(s, 'cv-paz', cvCtx(s)); return true; }
      if (f.k === 'morte' && f.a === s.protag) {
        St.chapter(s, St.say(s, 'cv-morreu', Object.assign(cvCtx(s), { DEATH: deathTxt(f.a) })), { k: 'cv-morreu', x: f.x, y: f.y });
        if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'sereno', null);
        return true;
      }
      return false;
    },
    goal: s => `Fazer fortuna com ${goodThe(s.data.good)} na ${s.data.route}.`,
    status(s, c) { return `${c.P} já fez ${s.data.trips} viagens pela ${s.data.route}${s.data.robbed ? `, e foi roubad${c.o} ${s.data.robbed > 1 ? s.data.robbed + ' vezes' : 'uma vez'}` : ''}.${s.data.war ? ' A estrada está fechada pela guerra.' : ''}`; },
    obstacles(s) { const out = []; if (s.data.war) out.push('a guerra fechou a estrada'); if (s.data.robbed) out.push('ladrões na estrada'); return out; },
    open: () => ['virar uma casa de mercadores', 'o monopólio', 'ser roubado até desistir', 'a guerra fechar a estrada'],
    heirs: { minAge: 15, chance: 0.55, fit: (s, c) => 0.45 + pe(c).amb * 0.6, text: (s, c) => `${c.P} morreu, mas os fardos e o caminho ficaram. ${c.H}, ${c.DEADREL}, pegou a estrada.` },
    inherited(s, heir) { s.data.town = setName(heir.set) || s.data.town; const h = G.Eco.homeOf(heir); s.data.coin0 = h ? h.coin || 0 : 0; },
    titles: {
      rota: c => `A ${c.s.data.route}`,
      mercador: c => `${c.o === 'a' ? 'A Mercadora' : 'O Mercador'} da ${c.s.data.route}`,
      fardos: c => `Os Fardos de ${c.P}`,
      e: c => `${c.P} e a ${c.s.data.route}`,
    },
    forgotten: s => `A ${s.data.route} foi ficando vazia, e a história de quem a abriu, esquecida.`,
  });

  // ====================================================================================
  //  PALÁCIO — the ruler who wanted a palace
  // ====================================================================================
  K('pc-ordem', { h: 'A ordem', text: [
    c => (c.BIG ? `${c.WHOv} olhou para o palácio que tinha e achou pequeno. Mandou erguer, fora de ${c.town}, ${c.BNa}: maior que qualquer coisa que o mundo já viu.` : null),
    c => (c.BIG ? `"Quero que vejam do outro lado do mar", disse ${c.WHO}. Começaram as obras ${c.dBN}, e metade dos construtores de ${c.town} foi carregar pedra.` : null),
    c => (!c.BIG ? `${c.WHOv} quer um palácio à altura do próprio nome. Começaram as obras ${c.dBN}, com alas e jardins.` : null),
    c => (!c.BIG ? `${c.WHOv} mandou chamar os mestres de obras: queria um palácio de verdade, com pátio e fonte. Em ${c.town}, o povo fez as contas do imposto.` : null),
  ], civ: {
    egipcio: [c => (c.BIG ? `${c.WHOv} mandou chamar os escribas e os mestres de obras: queria um palácio que os deuses vissem do céu. Assim começou ${c.BNa}.` : null)],
    asteca: [c => (c.BIG ? `${c.WHOv} quis um palácio sobre uma pirâmide de degraus, mais alto que o templo do Sol. Começaram a cortar a pedra para ${c.BNa}.` : null)],
    nordico: [c => (c.BIG ? `${c.WHOv} quis um salão de banquetes tão comprido que um homem gritando numa ponta não fosse ouvido na outra. Começou ${c.BNa}.` : null)],
    romano: [c => (c.BIG ? `${c.WHOv} quis colunas de mármore, estátuas e jardins em terraços. Os arquitetos desenharam ${c.BNa}, e o tesouro tremeu.` : null)],
    grego: [c => (c.BIG ? `${c.WHOv} quis um palácio com colunas como as dos templos. Os mestres de obras desenharam ${c.BNa} na areia.` : null)],
  } });
  K('pc-pedra', { h: 'As pedras', text: [
    c => `As carroças de pedra não param de chegar ao canteiro ${c.dBN}. ${c.BIG ? 'Metade dos construtores de ' + c.town + ' trabalha lá.' : 'As paredes já passam da altura de um homem.'}`,
    c => `${c.BNc} já tem alicerces e o começo das paredes. Os pedreiros trabalham do nascer ao pôr do sol.`,
  ] });
  K('pc-imposto', { h: 'O imposto', text: [
    c => `Os cobradores passaram de porta em porta: o imposto subiu para pagar ${c.BNa}. Em ${c.town}, há quem resmungue baixinho.`,
    c => `Para pagar ${c.BNa}, o imposto subiu de novo. Nas ruas de ${c.town}, as panelas andam mais vazias.`,
  ] });
  K('pc-murmurio', { h: 'O murmúrio', text: [
    c => `Nas ruas de ${c.town} já se fala mal de ${c.P}: "palácio de ouro, panela vazia".`,
    c => `Há quem diga, em ${c.town}, que ${c.P} só pensa nas próprias paredes.`,
  ] });
  K('pc-meio', { h: 'As paredes', text: [
    c => `${c.BNc} ganhou forma: ${c.CIVBIT}. Quem passa pela estrada para só para olhar.`,
    c => `Já se vê de longe ${c.BNa}: ${c.CIVBIT}.`,
  ] });
  K('pc-visita', { h: 'A visita', text: [
    c => `${c.P} foi ver as obras ${c.dBN}. Andou entre os andaimes e mandou refazer uma parede que achou torta.`,
    c => `${c.P} foi ver as obras e ficou um tempo calad${c.o}, com as mãos nas costas, olhando as paredes subirem.`,
    c => (c.PROG < 0.3 ? `${c.P} perguntou aos pedreiros quando ${c.BNa} ficaria ${c.PRONTO}. Ninguém teve coragem de dizer "nunca".` : null),
    c => (c.PROG >= 0.6 ? `${c.P} subiu num andaime para ver ${c.town} lá de cima, de dentro do próprio palácio. Desceu sorrindo.` : null),
  ] });
  K('pc-pronto', { h: 'O palácio', text: [
    c => (c.BIG ? `Depois de ${c.YRS}, ${c.BNa} ficou ${c.PRONTO}. ${c.P} subiu as escadarias na frente de todos, devagar, e só então sorriu.` : null),
    c => (!c.BIG ? `${c.BNc} ficou ${c.PRONTO}. ${c.P} recebeu ali, pela primeira vez, os enviados de outros povos.` : null),
    c => `${c.BNc} ficou ${c.PRONTO}, enfim. Na festa de inauguração, ${c.P} mandou servir vinho até para os pedreiros.`,
  ] });
  K('pc-pronto-amargo', { h: 'O palácio', text: [
    c => `${c.BNc} ficou ${c.PRONTO}. ${c.P} mudou-se para lá; o povo de ${c.town} foi olhar de longe, com a barriga vazia.`,
    c => `${c.BNc} ficou ${c.PRONTO} depois de ${c.YRS} de imposto alto. ${c.P} deu uma festa; poucos de ${c.town} foram.`,
  ] });
  K('pc-pronto-herdeiro', { h: 'O palácio', text: [c => `${c.BNc} ficou ${c.PRONTO}. Quem mandou erguer, ${c.FIRST}, não viveu para ver; quem mora lá é ${c.P}.`] });
  K('pc-deposto', { h: 'O trono', text: [
    c => (c.HOW === 'revolucao' ? `Os mercadores tomaram o poder, e ${c.P} saiu do trono antes de morar ${c.emBN}. O conselho mandou parar as obras para fazer as contas.` : null),
    c => `${c.P} perdeu o trono antes de morar ${c.emBN}. ${c.NEW} herdou um palácio que não pediu.`,
  ] });
  K('pc-continua', { h: 'A herança', text: [c => `${c.NEW} subiu ao trono e herdou as obras ${c.dBN}. Mandou continuar.`] });
  K('pc-ruina', { h: 'A ruína', text: [c => `${c.BNc} virou ruína antes de ficar ${c.PRONTO}.`, c => `Só ficaram pedras espalhadas onde seria ${c.BNa}.`] });
  K('pc-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} sem ver ${c.BNa} ${c.PRONTO}.`] });

  const CIVBIT = { egipcio: 'colunas com flores de papiro, um portão com obeliscos', asteca: 'degraus de pedra subindo para o céu, serpentes esculpidas', nordico: 'um telhado comprido como o casco de um navio, dragões nas pontas', romano: 'colunas de mármore, uma cúpula, estátuas ao longo da avenida', grego: 'colunas brancas, um frontão de pedra, jardins em terraços', '': 'alas, torres e jardins' };
  const palOf = s => G.S.buildings.get(s.data.b);
  function pcCtx(s) {
    const b = palOf(s); const raw = s.data.bname; const p = P(s.protag);
    const BNa = (G.gen(raw) === 'a' ? 'a ' : 'o ') + raw; const f = G.Fac.get(s.data.fac);
    const yrs = Math.max(1, G.S.day - (s.data.since || s.born));
    const who = p && f && f.leader === p.id ? G.Politics.styled(f, p) : s.data.firstName || (p ? p.name : '');
    return { BN: raw, BNa, BNc: cap1(BNa), dBN: BNa.replace(/^o /, 'do ').replace(/^a /, 'da '), emBN: (G.gen(raw) === 'a' ? 'na ' : 'no ') + raw, BIG: s.data.type === 'palacio_colossal', town: s.data.town,
      PROG: b ? b.progress || 0 : 0, PRONTO: G.gen(raw) === 'a' ? 'pronta' : 'pronto', YRS: yrs + (yrs > 1 ? ' anos' : ' ano'), CIVBIT: CIVBIT[(p && p.civ) || (f && f.civ) || ''] || CIVBIT[''],
      WHO: who, WHOv: who + (who.includes(',') ? ',' : '') };
  }
  // the ruler of the people is someone else now: the throne inherits the work, or the one who wanted it lost it
  function rulerChanged(s, nr, how) {
    const p = P(s.protag);
    if (!p || p.dead) { const old = takeOver(s, nr, how); St.beat(s, 'pc-continua', Object.assign(pcCtx(s), { NEW: nr.name, OLD: old ? old.name : '' })); return; }
    St.finish(s, 'roubada', 'agridoce', St.say(s, 'pc-deposto', Object.assign(pcCtx(s), { NEW: nr.name, HOW: how || '' })), { log: true });
  }
  St.define('palacio', {
    name: 'Palácio', icon: 'crown', tone: 'ambicao', tags: ['poder', 'vaidade'], struct: 'obra', seedLife: 3, maxDays: 110,
    stages: [['ordem', 'A ordem'], ['pedras', 'As pedras'], ['paredes', 'As paredes'], ['pronto', 'O palácio']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; const b = palOf(s); const pr = b ? b.progress || 0 : 0; return pr >= 0.55 ? 2 : pr >= 0.2 ? 1 : 0; },
    logline: (s, c) => `${cap1(c.TITLE ? c.TITLE + ' ' + c.P : c.P)}, de ${facName(s.data.fac)}, que mandou erguer ${pcCtx(s).BNa}${s.data.type === 'palacio_colossal' ? ' — o maior palácio que o mundo já viu' : ''}.`,
    on: {
      palacio(f) {
        const v = P(f.a); const b = G.S.buildings.get(f.b); if (!v || v.dead || !b || b.built) return null;
        const big = f.type === 'palacio_colossal';
        const raw = G.Village.nameOf(b.type, b);
        return [{ protag: v.id, score: big ? 0.85 : 0.5, keyExtra: 'b' + f.b, cast: {}, place: { kind: 'palacio', name: raw, x: f.x, y: f.y },
          data: { b: f.b, type: f.type, fac: f.fac, bname: raw, town: setName(b.set) || '', since: G.S.day, firstName: v.name }, motifs: ['gatilho:vaidade', 'amb:cidade', 'rel:nenhuma'] }];
      },
    },
    valid: sd => { const b = G.S.buildings.get(sd.data.b); return !!(b && !b.built && b.type !== 'ruin'); },
    begin(s) { s.phase = 'ordem'; St.beat(s, 'pc-ordem', pcCtx(s), { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const b = palOf(s);
      if (!b || b.type === 'ruin') { St.finish(s, 'fracassada', 'tragico', St.say(s, 'pc-ruina', pcCtx(s)), { log: true }); return; }
      if (b.built) { this.complete(s); return; }
      const p = P(s.protag);
      if (!p || p.dead) { if (s.data.waitHeir && G.S.day - s.data.waitHeir > 1) St.finish(s, 'interrompida', 'sereno', null); return; }
      const pr = b.progress || 0; const c = pcCtx(s); const at = { x: s.place.x, y: s.place.y };
      if (pr >= 0.2 && !s.data.m1) { s.data.m1 = 1; s.phase = 'pedras'; St.beat(s, 'pc-pedra', c, at); }
      else if (pr >= 0.35 && !s.data.m2 && G.Fac.get(s.data.fac) && G.Eco.taxRate(G.Fac.get(s.data.fac)) > 0.08) { s.data.m2 = 1; St.beat(s, 'pc-imposto', c, at); }
      else if (pr >= 0.6 && !s.data.m3) { s.data.m3 = 1; s.phase = 'paredes'; St.beat(s, 'pc-meio', c, at); }
      const f = G.Fac.get(s.data.fac);
      if (f && !s.data.grumble && (f.legit || 50) < 42 && pr > 0.25) { s.data.grumble = 1; St.beat(s, 'pc-murmurio', c); }
      // someone else on the throne, and nothing said of it: read the world
      if (f && f.leader && f.leader !== s.protag) { const nr = P(f.leader); if (nr) rulerChanged(s, nr, ''); }
    },
    // (not 'done': that name is the engine's, for the end of an errand)
    complete(s) {
      const c = pcCtx(s); const first = s.prev.length ? s.data.firstName : '';
      const key = first ? 'pc-pronto-herdeiro' : s.data.grumble ? 'pc-pronto-amargo' : 'pc-pronto';
      St.finish(s, 'cumprida', s.data.grumble || first ? 'agridoce' : 'feliz', St.say(s, key, Object.assign(c, { FIRST: first })), { x: s.place.x, y: s.place.y, log: true, toast: true, big: 1, hot: 25, legend: c.BIG });
    },
    react(s, f) {
      if (f.k === 'palacio-pronto' && f.b === s.data.b) { this.complete(s); return true; }
      if (f.k === 'coroa' && f.fac === s.data.fac && f.a !== s.protag) { const nr = P(f.a); if (nr) rulerChanged(s, nr, f.how); return true; }
      if (f.k === 'morte' && f.a === s.protag) {
        St.chapter(s, St.say(s, 'pc-morreu', Object.assign(pcCtx(s), { DEATH: deathTxt(f.a) })), { k: 'pc-morreu' });
        const fac = G.Fac.get(s.data.fac); const nr = fac && fac.leader && fac.leader !== f.a ? P(fac.leader) : null;
        if (nr && !nr.dead) rulerChanged(s, nr, ''); else s.data.waitHeir = G.S.day;
        return true;
      }
      return false;
    },
    urge(s, v) {
      if (!free(v) || !homeSafe(v)) return 0;
      if (s.data.visit && G.S.day - s.data.visit < 3) return 0;
      const b = palOf(s); if (!b || b.built) return 0;
      return G.dist(v.x, v.y, s.place.x, s.place.y) < 30 ? 0.1 : 0;
    },
    task(s, v, H) { s.data.visit = G.S.day; const b = palOf(s); if (!b) return null; const fr = front(b); return St.go(s, v, H, { x: fr[0], y: fr[1] + 1, sub: 'obras', dur: 8, act: 'look', fx: s.place.x, fy: s.place.y, max: 150 }); },
    arrive(s, v) { const n = (s.data.visits || 0) + 1; s.data.visits = n; if (n <= 2) St.beat(s, 'pc-visita', pcCtx(s), { x: v.x, y: v.y }); },
    goal: s => `Ver ${pcCtx(s).BNa} ${pcCtx(s).PRONTO}.`,
    status(s, c) { const b = palOf(s); const pr = b ? Math.round((b.progress || 0) * 100) : 0; return `${pcCtx(s).BNc} está ${pr < 10 ? 'só começando' : 'com ' + pr + '% da obra feita'}.${s.data.grumble ? ' O povo reclama dos impostos.' : ''}`; },
    obstacles(s) { const out = ['pedra e braços: a obra come os construtores da cidade']; if (s.data.grumble) out.push('o povo descontente com os impostos'); return out; },
    open: () => ['o palácio ficar pronto', 'o governante perder o trono antes', 'morrer antes de ver', 'a obra virar ruína'],
    titles: {
      palacio: c => pcCtx(c.s).BNc,
      sonho: c => `O Sonho de Pedra de ${c.s.data.firstName || c.P}`,
      obra: c => `A Obra de ${c.s.data.firstName || c.P}`,
    },
    forgotten: s => `As obras ${pcCtx(s).dBN} foram ficando mais lentas, e ninguém mais falou delas.`,
    taskText: (s, v, t) => (t.st === 2 ? `Olhando as obras ${pcCtx(s).dBN}` : `Indo ver as obras ${pcCtx(s).dBN}`),
  });

  // ====================================================================================
  //  PÉROLA NEGRA — what a diver does with a fortune that fits in a hand
  // ====================================================================================
  K('pn-achou', { h: 'A pérola', text: [
    c => `${c.P} subiu do recife com a mão fechada. Quando abriu, nem ${c.ele} acreditou: uma pérola negra, grande como um olho de peixe.`,
    c => `No fundo do recife, numa ostra velha, ${c.P} achou uma pérola negra. Subiu tão depressa que quase se afogou.`,
  ] });
  K('pn-plano-amor', { h: 'O segredo', text: [
    c => `${c.P} não contou para ninguém. Guardou a pérola num pano, pensando em ${c.T}.`,
    c => `${c.P} podia ficar ric${c.o} com ela. Mas só pensava no rosto de ${c.T} quando a visse.`,
  ] });
  K('pn-plano-vender', { h: 'O plano', text: [
    c => `${c.P} já sabe o que fazer: levar a pérola ${c.TOWHERE}, onde os ricos pagam qualquer preço por uma coisa daquelas.`,
    c => `${c.P} passou a noite acordad${c.o}, fazendo contas: um barco novo, uma casa de pedra... A pérola vai ser vendida ${c.INWHERE}.`,
  ] });
  K('pn-plano-mar', { h: 'A dívida', text: [
    c => `${c.P} achou que uma coisa tão bonita não podia ser só ${c.del === 'dela' ? 'dela' : 'dele'}. Decidiu devolvê-la a quem a deu: ${c.GIVER}.`,
    c => `Os velhos de ${c.cityNow || 'casa'} dizem que o mar cobra o que dá. ${c.P} decidiu pagar antes que ele cobrasse.`,
  ] });
  K('pn-boato', { h: 'O boato', text: [c => `A notícia correu ${c.cityNow || 'a cidade'}: ${c.P} tem uma pérola negra. Chegou aos ouvidos de ${c.RULER}.`] });
  K('pn-confisco', { h: 'Os guardas', text: [
    c => `Os guardas de ${c.RULER} bateram à porta de ${c.P} e levaram a pérola "para o tesouro". ${c.P} passou a tarde inteira olhando o mar.`,
    c => `${c.RULER} mandou buscar a pérola. ${c.P} entregou sem dizer nada; o que ia dizer?`,
  ] });
  K('pn-escondeu', { h: 'O esconderijo', text: [c => `Quando os guardas de ${c.RULER} vieram, ${c.P} jurou que não sabia de pérola nenhuma. Ela estava enterrada debaixo da casa.`] });
  K('pn-deu', { h: 'O presente', text: [
    c => `${c.P} pôs a pérola na mão de ${c.T}. ${c.T} ficou muito tempo sem dizer nada. Depois riu e chorou ao mesmo tempo.`,
    c => `${c.P} deu a pérola negra a ${c.T}. Agora ela brilha num cordão, e ${c.T} não tira nem para dormir.`,
  ] });
  K('pn-vendeu', { h: 'A venda', text: [
    c => (c.COINS ? `${c.P} vendeu a pérola ${c.INWHERE} por ${c.COINS} moedas. Contou três vezes antes de acreditar.` : null),
    c => (c.COINS ? `Os ricos ${c.INWHERE} brigaram pela pérola. Quem levou pagou ${c.COINS} moedas, e ${c.P} saiu de lá com as mãos tremendo.` : null),
    c => (!c.COINS ? `${c.P} trocou a pérola ${c.INWHERE} por um barco novo, redes e comida para um ano.` : null),
  ] });
  K('pn-devolveu', { h: 'A volta ao mar', text: [
    c => (c.TEMPLE ? `${c.P} deixou a pérola negra no altar do templo, com uma prece. Os outros mergulhadores acharam loucura. ${c.P} dormiu em paz.` : `${c.P} foi até a beira do mar, rezou baixinho e jogou a pérola de volta nas ondas. Os outros mergulhadores acharam loucura. ${c.P} dormiu em paz.`),
  ] });
  K('pn-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH}, e a pérola negra ficou guardada num pano.`] });
  K('pn-herdou', { h: 'A herança', text: [c => `${c.H}, ${c.DEADREL}, ficou com a pérola negra.`] });

  function pnCtx(s) {
    const p = P(s.protag); const f = p && G.Fac.ofV(p); const r = f && f.leader ? P(f.leader) : null;
    const d = s.data; const civ = p && p.civ;
    return { TOWHERE: d.toName ? 'para ' + d.toName : 'para o mercado', INWHERE: d.toName ? 'em ' + d.toName : 'no mercado', RULER: r ? styledOf(f.id, r) : 'o chefe', TEMPLE: d.temple ? 1 : 0,
      GIVER: civ === 'grego' || civ === 'romano' ? 'o deus do mar' : civ === 'nordico' ? 'Njord, o senhor do mar' : civ === 'egipcio' ? 'os deuses da água' : civ === 'asteca' ? 'Chalchiuhtlicue, a senhora das águas' : 'o mar' };
  }
  function pnPlan(s, p) {
    const q = pe(p); const partner = p.partner && P(p.partner) && !P(p.partner).dead ? P(p.partner) : null;
    const set = homeOf(p); const f = G.Fac.ofV(p); const cap = f ? G.Fac.capitalOf(f.id) : null;
    if (partner && (has(p, 'Romântico') || q.cru < 0.3 || G.hash(p.id * 3 + 1) < 0.35)) { s.cast.target = partner.id; St.reindex(); return 'amor'; }
    if (q.pie > 0.74 || has(p, 'Devoto')) { s.data.temple = templeOf(set) ? 1 : 0; return 'mar'; }
    const mk = marketOf(set);
    if (cap && set && cap.id !== set.id && G.dist(cap.cx, cap.cy, set.cx, set.cy) > 10 && W.sameLand(cap.cx, cap.cy, set.cx, set.cy)) { s.data.to = cap.id; s.data.toName = cap.name; s.data.far = 1; }
    else if (mk) { s.data.mk = mk.id; s.data.toName = set.name; }
    else if (set) { s.data.toName = set.name; }
    return 'vender';
  }
  function sell(s, v) {
    const f = G.Fac.ofV(v); const vars = {};
    if (f && G.Eco.coinage(f.id)) { const n = 40; const h = G.Eco.homeOf(v); if (h) h.coin = (h.coin || 0) + n; else v.purse = (v.purse || 0) + n; vars.COINS = n; }
    G.Vg.emote(v, 'star', 2.5); G.Life && G.Life.bio(v, 'note', 'Vendeu uma pérola negra');
    return vars;
  }
  St.define('perola', {
    name: 'Pérola Negra', icon: 'shoal', tone: 'esperanca', tags: ['mar', 'riqueza'], struct: 'achado-escolha', seedLife: 3, maxDays: 24,
    stages: [['achado', 'A pérola'], ['plano', 'A escolha'], ['caminho', 'O caminho'], ['fim', 'O destino']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'roubada' ? -1 : 3; return s.data.onWay ? 2 : s.data.plan ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.town))} que achou no recife uma pérola negra — e precisa decidir o que fazer com uma fortuna que cabe na mão.`,
    on: {
      'perola-negra'(f) {
        const v = P(f.a); if (!v || v.dead || v.captive) return null;
        return [{ protag: v.id, score: 0.72, keyExtra: 'p' + f.d, cast: {}, place: { kind: 'recife', name: St.where(f.x, f.y).name || 'o recife', x: f.x, y: f.y },
          data: { town: setName(v.set), rx: f.x, ry: f.y }, motifs: ['gatilho:achado', 'amb:mar', 'rel:nenhuma'] }];
      },
    },
    valid: sd => alive(sd.protag),
    begin(s) {
      const p = P(s.protag); s.phase = 'achado';
      St.beat(s, 'pn-achou', {}, { x: s.place.x, y: s.place.y });
      s.data.plan = pnPlan(s, p); s.phase = 'plano';
      St.beat(s, 'pn-plano-' + s.data.plan, pnCtx(s));
      // a greedy ruler hears of it
      const f = G.Fac.ofV(p); const r = f && f.leader ? P(f.leader) : null;
      if (r && r.id !== p.id && s.data.plan !== 'mar') { const q = pe(r); if ((q.cru > 0.6 && q.amb > 0.5) || vanity(r) > 0.72) s.data.greedy = G.S.day; }
    },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      if (s.data.greedy && !s.data.heard && G.S.day - s.data.greedy >= 1) { s.data.heard = 1; St.beat(s, 'pn-boato', pnCtx(s)); }
      if (s.data.heard === 1 && G.S.day - s.data.greedy >= 2) {
        s.data.heard = 2; const q = pe(p);
        if ((p.courage || 0.5) > 0.7 && q.agg > 0.5) St.beat(s, 'pn-escondeu', pnCtx(s));
        else { const f = G.Fac.ofV(p); if (f) G.Village.addStock('perolas', 4, f.id); St.finish(s, 'roubada', 'agridoce', St.say(s, 'pn-confisco', pnCtx(s)), { log: true, toast: true }); }
      }
    },
    react(s, f) {
      if (f.k === 'morte' && f.a === s.protag) {
        St.chapter(s, St.say(s, 'pn-morreu', { DEATH: deathTxt(f.a) }), { k: 'pn-morreu' });
        if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'sereno', null);
        return true;
      }
      if (f.k === 'morte' && f.a === s.cast.target && s.data.plan === 'amor') { s.data.plan = 'vender'; delete s.cast.target; St.reindex(); return true; }
      return false;
    },
    urge(s, v) {
      if (!free(v) || !homeSafe(v) || (s.data.heard === 1)) return 0; if (G.S.day - s.born < 0.4) return 0;
      if (s.data.plan === 'amor') { const t = P(s.cast.target); const set = homeOf(v); if (!t || t.dead || !set || G.dist(t.x, t.y, set.cx, set.cy) > (set.radius || 8) + 4 || t.inside) return 0; return 0.2; }
      return 0.15;
    },
    task(s, v, H) {
      const plan = s.data.plan; s.data.onWay = 1; s.phase = 'caminho';
      if (plan === 'amor') { const t = P(s.cast.target); if (!t || t.dead) { s.data.plan = 'vender'; return null; } return St.go(s, v, H, { x: t.x, y: t.y, follow: t.id, sub: 'presente', dur: 4, emo: 'heart', max: 120 }); }
      if (plan === 'mar') {
        const set = homeOf(v); const tb = s.data.temple ? templeOf(set) : null;
        if (tb) { const fr = front(tb); return St.go(s, v, H, { x: fr[0], y: fr[1] + 0.5, sub: 'oferenda', dur: 10, act: 'pray', max: 140 }); }
        const sp = W.nearestLand(s.data.rx, s.data.ry, 6) || [v.x, v.y];
        return St.go(s, v, H, { x: sp[0], y: sp[1], sub: 'oferenda', dur: 10, act: 'pray', fx: s.data.rx, fy: s.data.ry, max: 160 });
      }
      if (s.data.far) { const c = G.S.settlements.get(s.data.to); if (!c) { s.data.far = 0; return null; } return St.journey(s, v, H, { x: c.cx, y: c.cy, sub: 'vender', dur: 8 }); }
      const mk = s.data.mk && G.S.buildings.get(s.data.mk); const set = homeOf(v);
      const at = mk ? front(mk) : set ? [set.cx, set.cy] : [v.x, v.y];
      return St.go(s, v, H, { x: at[0], y: at[1] + 0.6, sub: 'vender', dur: 6, max: 140 });
    },
    arrive(s, v) {
      const plan = s.data.plan; const o = { x: v.x, y: v.y, log: true, toast: true, big: 1, hot: 16 };
      if (plan === 'amor') { const t = P(s.cast.target); if (t) { G.Vg.emote(v, 'heart', 3); G.Vg.emote(t, 'heart', 3); G.Life && G.Life.bio(t, 'note', `Ganhou de ${v.name} uma pérola negra`); } St.finish(s, 'cumprida', 'feliz', St.say(s, 'pn-deu', pnCtx(s)), o); return; }
      if (plan === 'mar') { v.devotion = Math.min(100, (v.devotion || 0) + 25); G.FX && G.FX.prayer && G.FX.prayer(v.x, v.y); St.finish(s, 'transformada', 'sereno', St.say(s, 'pn-devolveu', pnCtx(s)), o); return; }
      const vars = sell(s, v);
      if (s.data.far) { s.data.sold = 1; St.beat(s, 'pn-vendeu', Object.assign(pnCtx(s), vars), { x: v.x, y: v.y, big: 1, hot: 14 }); return; }
      St.finish(s, 'cumprida', 'feliz', St.say(s, 'pn-vendeu', Object.assign(pnCtx(s), vars)), o);
    },
    home(s, v) { if (s.data.sold) St.finish(s, 'cumprida', 'feliz', `${v.name} voltou para casa ${v.g === 'f' ? 'rica' : 'rico'} como nunca tinha sido.`, { x: v.x, y: v.y, log: true }); },
    road: (s, v, t, r) => roadBeat(s, v, r, t),
    camp: (s, v, t) => campBeat(s, v, t),
    blocked(s) { s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) { s.data.far = 0; s.data.to = 0; s.data.toName = setName((P(s.protag) || {}).set) || ''; } },
    goal: (s, c) => (s.data.plan === 'amor' ? `Dar a pérola a ${c.T}.` : s.data.plan === 'mar' ? 'Devolver a pérola ao mar.' : `Vender a pérola ${pnCtx(s).INWHERE}.`),
    status: (s, c) => (s.data.heard === 1 ? `${pnCtx(s).RULER} soube da pérola.` : `${c.P} guarda a pérola negra num pano.`),
    obstacles(s) { return s.data.greedy ? ['um governante que cobiça a pérola'] : []; },
    open: () => ['vender e ficar rico', 'dar a quem ama', 'devolver ao mar', 'perder para o governante'],
    heirs: { minAge: 12, chance: 0.5, fit: () => 0.8, text: (s, c) => St.say(s, 'pn-herdou', c) || `${c.H}, ${c.DEADREL}, ficou com a pérola negra.` },
    inherited(s, heir) { s.data.town = setName(heir.set) || s.data.town; s.data.onWay = 0; s.data.sold = 0; s.data.plan = pnPlan(s, heir); },
    titles: { perola: () => 'A Pérola Negra', de: c => `A Pérola de ${c.P}`, olho: () => 'O Olho do Recife' },
    forgotten: () => 'A pérola ficou guardada no pano, e o pano, numa caixa.',
    taskText: (s, v, t) => (t.st === 4 ? 'Dormindo na estrada, com a pérola escondida' : t.sub === 'presente' ? 'Levando um presente escondido' : t.sub === 'oferenda' ? 'Levando uma oferenda' : t.leg ? 'Voltando para casa com o dinheiro da pérola' : 'Levando a pérola para vender'),
  });

  // ====================================================================================
  //  CEGONHA — storks nest on a roof
  // ====================================================================================
  K('nh-cegonha', { h: 'A cegonha', text: [
    c => `Um casal de cegonhas fez ninho no telhado da casa de ${c.P}. A vizinhança veio dar os parabéns antes da hora: cegonha no telhado é filho a caminho.`,
    c => `${c.P} acordou com o barulho dos bicos batendo lá em cima: cegonhas no telhado. ${c.P} e ${c.T} se olharam e não disseram nada.`,
    c => (c.KIDS0 ? null : `Fazia tempo que ${c.P} e ${c.T} queriam um filho. Agora há cegonhas no telhado, e ${c.P} olha para elas toda manhã.`),
  ] });
  K('nh-olhar', { h: 'O ninho', text: [
    c => `${c.P} descobriu um ninho de ${c.BIRDS} no telhado de casa e não quer saber de mais nada.`,
    c => `Tem um ninho de ${c.BIRDS} em cima da casa de ${c.P}. ${c.P} passa horas olhando para cima, de boca aberta.`,
  ] });
  K('nh-ovos', { h: 'Os ovos', text: [c => `${c.P} subiu escondid${c.o} no telhado e contou: ${c.EGGS} ovos.`, c => `Já tem ovos no ninho. ${c.P} jura que viu ${c.EGGS}.`] });
  K('nh-filhotes', { h: 'Os filhotes', text: [c => `Nasceram os filhotes. ${c.P} passa o dia imitando o barulho que eles fazem.`, c => `Os filhotes abrem o bico o dia inteiro. ${c.P} tenta jogar minhoca lá para cima.`] });
  K('nh-voaram', { h: 'O voo', text: [
    c => `Os filhotes bateram as asas na beira do telhado, um de cada vez, e voaram. ${c.P} correu pela rua atrás deles até perder de vista.`,
    c => `Um dia o ninho amanheceu vazio: os filhotes tinham aprendido a voar. ${c.P} ficou feliz e triste ao mesmo tempo, sem saber explicar.`,
  ] });
  K('nh-perdido', { h: 'O ninho vazio', text: [c => `O ninho ficou vazio antes da hora. ${c.P} não quis falar disso com ninguém.`] });
  K('nh-gravida', { h: 'A notícia', text: [
    c => `${c.P} está esperando um filho. Na rua, todo mundo olha para o telhado e sorri.`,
    c => `${c.P} contou a ${c.T} que está grávida. ${c.T} saiu na porta e ficou olhando para as cegonhas.`,
  ] });
  K('nh-nasceu', { h: 'O filho', text: [
    c => `Nasceu ${c.BABY}, ${c.BABYG} de ${c.P} e ${c.T}. ${c.STORK ? 'As cegonhas ainda estavam no telhado.' : 'As cegonhas já tinham partido, mas ninguém duvida de quem trouxe o bebê.'}`,
    c => `${c.BABY} nasceu numa casa com cegonhas no telhado. A avó diz que vai ser uma criança de sorte.`,
  ] });
  K('nh-partiram', { h: 'A espera', text: [c => `As cegonhas foram embora, e o berço continuou vazio. ${c.P} olha para o céu quando as aves passam.`] });

  const nestOf = s => (G.Nests && G.Nests.get ? G.Nests.get(s.data.nest) : null);
  const kidsN = v => (v.kids || []).length;
  function birdsName(kind) { const sp = G.Animals.DEF[kind]; return sp ? G.Animals.plural(sp, 2).replace(/^\d+ /, '') : 'passarinhos'; }
  St.define('ninho', {
    name: 'Cegonha', icon: 'baby', tone: 'esperanca', tags: ['família', 'natureza'], struct: 'espera', seedLife: 2, maxDays: 14,
    stages: [['ninho', 'O ninho'], ['espera', 'A espera'], ['fim', 'A chegada']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 2 : -1; return s.data.preg || s.data.chicks ? 1 : 0; },
    logline: (s, c) => (s.data.mode === 'filho' ? `${cap1(desc(c.p, s.data.town))} que quer um filho — e agora tem um casal de cegonhas no telhado.` : `${cap1(desc(c.p, s.data.town))} que achou um ninho no telhado de casa e conta os dias até os filhotes voarem.`),
    on: {
      ninho(f) {
        if (f.type !== 'roof') return null;
        const S = G.S; const b = S.buildings.get(f.host); if (!b) return null;
        let best = null, bs = 0, mode = '';
        for (const v of S.villagers.values()) {
          if (v.home !== b.id || v.captive) continue;
          if (f.bird === 'stork' && v.g === 'f' && v.age >= 18 && v.age <= 40 && v.partner && alive(v.partner) && !(v.preg > 0)) {
            const k = (v.kids || []).filter(id => alive(id)).length; const sc = (k === 0 ? 0.62 : k === 1 ? 0.42 : 0.22) + (has(v, 'Romântico') ? 0.06 : 0);
            if (sc > bs) { bs = sc; best = v; mode = 'filho'; }
          } else if (v.age >= 5 && v.age < 12) { const sc = 0.44 + (has(v, 'Curioso') ? 0.1 : 0); if (sc > bs) { bs = sc; best = v; mode = 'olhar'; } }
        }
        if (!best || bs < 0.4) return null;
        return [{ protag: best.id, score: bs, keyExtra: 'n' + f.nest, cast: mode === 'filho' ? { target: best.partner } : {}, place: { kind: 'ninho', name: 'o telhado', x: f.x, y: f.y },
          data: { nest: f.nest, host: f.host, mode, bird: f.bird, kids0: kidsN(best), town: setName(best.set) || '' }, motifs: ['gatilho:ninho', 'amb:casa', 'rel:' + (mode === 'filho' ? 'casal' : 'nenhuma')] }];
      },
    },
    valid: sd => !!(G.Nests && G.Nests.get && G.Nests.get(sd.data.nest)),
    begin(s) { s.phase = 'ninho'; St.beat(s, s.data.mode === 'filho' ? 'nh-cegonha' : 'nh-olhar', { KIDS0: s.data.kids0, BIRDS: birdsName(s.data.bird) }, { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      const n = nestOf(s); const live = n && n.st !== 'empty';
      if (s.data.mode === 'filho') {
        if (p.preg > 0 && !s.data.preg) { s.data.preg = 1; s.phase = 'espera'; St.beat(s, 'nh-gravida', {}, { x: p.x, y: p.y, toast: true }); }
        if (kidsN(p) > s.data.kids0) {
          const baby = P((p.kids || [])[p.kids.length - 1]);
          St.finish(s, 'cumprida', 'feliz', St.say(s, 'nh-nasceu', { BABY: baby ? baby.name : 'o bebê', BABYG: baby && baby.g === 'f' ? 'filha' : 'filho', STORK: G.Nests.storkOn(s.data.host) }), { x: p.x, y: p.y, log: true, toast: true, big: 1 });
          return;
        }
        if (!live && !s.data.preg) { if (!s.data.gone) s.data.gone = G.S.day; else if (G.S.day - s.data.gone >= 4) St.finish(s, 'esquecida', 'agridoce', St.say(s, 'nh-partiram')); }
        return;
      }
      if (n && n.st === 'eggs' && !s.data.eggs) { s.data.eggs = 1; St.beat(s, 'nh-ovos', { EGGS: n.eggs }); }
      if (n && n.st === 'chicks' && !s.data.chicks) { s.data.chicks = 1; s.phase = 'espera'; St.beat(s, 'nh-filhotes', {}); }
      if (!live) {
        if (s.data.chicks) St.finish(s, 'cumprida', 'feliz', St.say(s, 'nh-voaram'), { x: s.place.x, y: s.place.y, log: true, toast: true });
        else St.finish(s, 'fracassada', 'agridoce', St.say(s, 'nh-perdido'));
      }
    },
    react(s, f) { if (f.k === 'morte' && f.a === s.protag) { St.finish(s, 'interrompida', 'sereno', null); return true; } return false; },
    urge(s, v) {
      if (v.hunger > 70 || v.energy < 25 || v.captive || v.sleeping) return 0;
      if (s.data.look && G.S.clock - s.data.look < DAY() * 0.35) return 0;
      const n = nestOf(s); if (!n || n.st === 'empty' || G.dist(v.x, v.y, n.x, n.y) > 20) return 0;
      return s.data.mode === 'olhar' ? 0.14 : 0.05;
    },
    task(s, v, H) { const n = nestOf(s); if (!n) return null; s.data.look = G.S.clock; return St.go(s, v, H, { x: n.x + 0.6, y: n.y + 1.6, sub: 'ninho', dur: s.data.mode === 'olhar' ? 8 : 4, act: 'look', emo: 'happy', fx: n.x, fy: n.y, max: 90 }); },
    goal: s => (s.data.mode === 'filho' ? 'Ter um filho.' : 'Ver os filhotes voarem.'),
    status: (s, c) => { const n = nestOf(s); if (s.data.mode === 'filho') return s.data.preg ? `${c.P} está grávida.` : `As cegonhas estão no telhado de ${c.P}.`; return n ? ({ build: 'As aves ainda estão fazendo o ninho.', eggs: `Há ${n.eggs} ovos no ninho.`, chicks: `Há ${n.chicks} filhotes no ninho.` }[n.st] || 'O ninho está vazio.') : 'O ninho caiu.'; },
    open: s => (s.data.mode === 'filho' ? ['um filho', 'as cegonhas irem embora'] : ['os filhotes voarem', 'o ninho cair']),
    titles: {
      cegonha: c => (c.s.data.mode === 'filho' ? `Uma Cegonha para ${c.P}` : `O Ninho de ${c.P}`),
      telhado: () => 'A Cegonha no Telhado',
      espera: c => (c.s.data.mode === 'filho' ? `A Espera de ${c.P}` : `Os Filhotes do Telhado`),
    },
    forgotten: () => 'O ninho ficou lá em cima, vazio, e ninguém mais olhou para ele.',
    taskText: () => 'Olhando o ninho no telhado',
  });

  // ====================================================================================
  //  TRAVESSIA — a great herd on the move, and a youngster who goes to see it
  // ====================================================================================
  K('mg-noticia', { h: 'A notícia', text: [
    c => `Chegou a notícia em ${c.town}: ${c.HERD} estão passando${c.PLACEAT}${c.FORD ? ', e vão cruzar o rio' : ''}. ${c.P} não dormiu aquela noite.`,
    c => `Um caçador voltou correndo: ${c.HERD}, tant${c.HO}s que não dava para contar${c.PLACEAT}. ${c.P} decidiu que ia ver com os próprios olhos.`,
    c => (c.KIND === 'reindeer' ? `As renas estão descendo da montanha, como todo ano, e passam${c.PLACEAT}. ${c.P} nunca viu, e quer ver.` : null),
  ] });
  K('mg-partiu', { h: 'A partida', text: [
    c => `${c.P} saiu antes do sol nascer${c.KIN ? ', e ' + c.KIN + ' ficou na porta, gritando para tomar cuidado' : ''}.`,
    c => `${c.P} pegou um pedaço de pão e um odre de água e foi atrás ${c.dHERD}.`,
  ] });
  K('mg-viu', { h: 'A manada', text: [
    c => `${c.P} chegou${c.PLACEAT} e viu: ${c.SEEN} passando, levantando uma poeira que tapava o sol. O chão tremia debaixo dos pés.`,
    c => `${c.P} subiu numa pedra e ficou olhando ${c.SEEN} passarem. Não acabava nunca.`,
    c => (c.FORD ? `${c.P} chegou na hora: ${c.SEEN} se jogavam no rio, um atrás do outro, empurrados pelos de trás.` : null),
  ] });
  K('mg-crocs', { h: 'O rio', text: [
    c => `No meio da travessia, a água ferveu: os crocodilos estavam esperando. ${c.P} viu tudo de cima da margem, sem conseguir piscar.`,
    c => `Os crocodilos esperavam no vau. ${c.P} viu um deles puxar um bicho para o fundo, e o rio ficou vermelho por um instante.`,
  ] });
  K('mg-predador', { h: 'Os caçadores', text: [c => `Atrás da manada vinham os caçadores dela: ${c.PRED}. ${c.P} ficou bem quiet${c.o}, atrás das pedras.`] });
  K('mg-tarde', { h: 'Tarde demais', text: [
    c => `${c.P} chegou tarde: só encontrou o capim pisado e a poeira baixando no horizonte.`,
    c => `Quando ${c.P} chegou, ${c.HERD} já tinham passado. Ficaram as pegadas, milhares delas, e o cheiro.`,
  ] });
  K('mg-voltou', { h: 'A volta', text: [
    c => (c.SEENOK ? `${c.P} voltou para ${c.town} e passou dias contando a mesma história${c.KIDS ? '; as crianças pediam de novo' : ''}.` : null),
    c => (c.SEENOK ? `${c.P} voltou com poeira até nos dentes e os olhos brilhando. Ninguém em ${c.town} aguenta mais ouvir falar ${c.dHERD} — e todo mundo pede para ouvir de novo.` : null),
    c => (!c.SEENOK ? `${c.P} voltou para casa sem ter visto a manada. No ano que vem, sai mais cedo.` : null),
  ] });
  K('mg-morto-fera', { h: 'A travessia', text: [c => `A travessia cobrou o seu preço: ${c.P} não voltou.`] });
  K('mg-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH}.`] });

  const PRED_NAME = k => { const sp = G.Animals.DEF[k]; return sp ? sp.name.toLowerCase() : k; };
  function mgCtx(s) {
    const d = s.data; const sp = G.Animals.DEF[d.kind]; const herd = sp ? G.Animals.plural(sp, 9).replace(/^\d+ /, '') : 'bichos';
    return { HO: sp && sp.g === 'f' ? 'a' : 'o', HERD: (sp && sp.g === 'f' ? 'as ' : 'os ') + herd, dHERD: (sp && sp.g === 'f' ? 'das ' : 'dos ') + herd, KIND: d.kind, FORD: d.ford, town: d.town, PLACEAT: d.at || '' };
  }
  St.define('migracao', {
    name: 'Travessia', icon: 'migrate', tone: 'aventura', tags: ['natureza', 'viagem'], struct: 'desejo-jornada', seedLife: 1.5, maxDays: 16,
    stages: [['noticia', 'A notícia'], ['estrada', 'A estrada'], ['manada', 'A manada'], ['volta', 'A volta']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return s.data.arrived ? 2 : s.data.left ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.town))} que quer ver com os próprios olhos ${mgCtx(s).HERD} ${s.data.ford ? 'cruzando o rio' : 'em marcha'}.`,
    on: {
      migracao(f) {
        const S = G.S; const sp = G.Animals.DEF[f.kind]; if (!sp || f.n < 5) return null;
        const x = f.ford ? f.fx : f.tx, y = f.ford ? f.fy : f.ty;
        const spot = W.nearestLand(x, y, 6); if (!spot) return null;
        let set = null, bd = 34;
        for (const st of S.settlements.values()) { const d = G.dist(st.cx, st.cy, spot[0], spot[1]); if (d < bd && W.sameLand(st.cx, st.cy, spot[0], spot[1])) { bd = d; set = st; } }
        if (!set || bd < 6) return null;
        let best = null, bs = 0;
        for (const v of S.villagers.values()) {
          if (v.set !== set.id || v.captive || v.age < 11 || v.age > 24) continue;
          const sc = 0.3 + (has(v, 'Curioso') ? 0.2 : 0) + (v.courage || 0.5) * 0.2 + (v.role === 'cacador' ? 0.08 : 0) - (has(v, 'Medroso') ? 0.15 : 0) + G.hash(v.id + f.d) * 0.06;
          if (sc > bs) { bs = sc; best = v; }
        }
        if (!best || bs < 0.42) return null;
        const w = St.where(spot[0], spot[1]);
        return [{ protag: best.id, score: Math.min(1, bs + (f.ford ? 0.08 : 0)), keyExtra: 'm' + f.d + f.kind, cast: {}, place: { kind: 'travessia', name: f.ford ? 'o vau' : (w.name || 'a planície'), x: spot[0], y: spot[1] },
          data: { kind: f.kind, n: f.n, ford: f.ford, at: w.at && !w.town ? w.at : f.ford ? '' : ' na planície', town: set.name }, motifs: ['gatilho:manada', 'amb:viagem', 'rel:nenhuma'] }];
      },
    },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'noticia'; St.beat(s, 'mg-noticia', mgCtx(s), { x: s.place.x, y: s.place.y }); },
    tick() {},
    react(s, f) {
      if (f.k === 'morte' && f.a === s.protag) {
        if (s.data.left && f.beast) St.finish(s, 'fracassada', 'tragico', St.say(s, 'mg-morto-fera', mgCtx(s)), { x: f.x, y: f.y, log: true });
        else St.finish(s, 'interrompida', 'sereno', St.say(s, 'mg-morreu', { DEATH: deathTxt(f.a) }));
        return true;
      }
      return false;
    },
    urge(s, v) { if (s.data.arrived) return v.hunger < 75 ? 0.3 : 0; if (!free(v) || !homeSafe(v)) return 0; return G.S.day - s.born < 2 ? 0.32 : 0.2; },
    task(s, v, H) {
      if (s.data.arrived) { const set = homeOf(v); return set ? St.journey(s, v, H, { x: set.cx, y: set.cy, leg: 1 }) : null; }
      if (!s.data.left) { s.data.left = 1; s.phase = 'estrada'; const k = kinNear(v, 10); St.beat(s, 'mg-partiu', Object.assign(mgCtx(s), { KIN: k ? (k.rel ? L.REL_BARE[k.rel] + ', ' + k.name + ',' : k.name) : '' }), { x: v.x, y: v.y }); }
      return St.journey(s, v, H, { x: s.place.x, y: s.place.y, sub: 'manada', dur: 14, act: 'look', emo: 'happy' });
    },
    arrive(s, v) {
      s.data.arrived = 1; s.phase = 'manada';
      const kind = s.data.kind; const preds = new Set((G.Animals.eatenBy || {})[kind] || []);
      const seen = near2(v.x, v.y, 18, a => a.kind === kind); const crocs = s.data.ford ? near2(v.x, v.y, 12, a => a.kind === 'croc') : 0;
      let pk = ''; for (const a of G.S.animals.values()) { if (!a.dead && preds.has(a.kind) && G.dist2(a.x, a.y, v.x, v.y) < 18 * 18) { pk = a.kind; break; } }
      const sp = G.Animals.DEF[kind]; s.data.seen = seen;
      if (seen >= 3) {
        St.beat(s, 'mg-viu', Object.assign(mgCtx(s), { SEEN: G.Animals.plural(sp, seen) }), { x: v.x, y: v.y, big: 1, hot: 20, toast: true });
        if (crocs) St.beat(s, 'mg-crocs', mgCtx(s), { x: v.x, y: v.y });
        else if (pk) { const ps = G.Animals.DEF[pk]; St.beat(s, 'mg-predador', Object.assign(mgCtx(s), { PRED: ps ? ps.nameA : PRED_NAME(pk) }), { x: v.x, y: v.y }); }
      } else St.beat(s, 'mg-tarde', mgCtx(s), { x: v.x, y: v.y });
    },
    home(s, v) {
      const ok = s.data.seen >= 3; const c = mgCtx(s);
      const kids = ok ? tellKids(s, v, `${v.name} contou de quando viu ${c.HERD} ${s.data.ford ? 'cruzando o rio' : 'passando'}, tantos que o chão tremia.`, s.place, 'migrate') : 0;
      St.finish(s, 'cumprida', ok ? 'feliz' : 'agridoce', St.say(s, 'mg-voltou', Object.assign(c, { SEENOK: ok, KIDS: kids })), { x: v.x, y: v.y, log: ok });
    },
    road: (s, v, t, r) => roadBeat(s, v, r, t),
    camp: (s, v, t) => campBeat(s, v, t),
    blocked(s) { s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 2) St.finish(s, 'interrompida', 'sereno', `${(P(s.protag) || {}).name || 'Quem ia'} não achou caminho até a manada.`); },
    goal: s => `Ver ${mgCtx(s).HERD} ${s.data.ford ? 'cruzarem o rio' : 'passarem'}.`,
    status: (s, c) => (s.data.arrived ? `${c.P} está voltando para ${s.data.town}.` : s.data.left ? `${c.P} está na estrada, atrás ${mgCtx(s).dHERD}.` : `${c.P} quer ir ver ${mgCtx(s).HERD}.`),
    obstacles(s) { return s.data.ford ? ['crocodilos no vau', 'os predadores que seguem a manada'] : ['os predadores que seguem a manada']; },
    open: () => ['ver a manada e voltar para contar', 'chegar tarde', 'a viagem dar errado'],
    titles: {
      travessia: c => (c.s.data.ford ? `A Travessia ${titleCase(mgCtx(c.s).dHERD)}` : `A Passagem ${titleCase(mgCtx(c.s).dHERD)}`),
      viu: c => `O Dia em que ${c.P} Viu a Manada`,
      poeira: () => 'A Poeira da Manada',
    },
    forgotten: () => 'A manada passou, e com ela a vontade de ir ver.',
    taskText: (s, v, t) => (t.st === 4 ? 'Dormindo ao relento, na estrada da manada' : t.leg ? 'Voltando para contar o que viu' : t.st === 2 ? `Olhando ${mgCtx(s).HERD} passarem` : `Indo ver ${mgCtx(s).HERD}`),
  });

  // ====================================================================================
  //  GUERRA PELA RIQUEZA — coffee, spices, the silk road
  // ====================================================================================
  K('gr-cobica', { h: 'A cobiça', text: [
    c => (c.REASON === 'riqueza' ? `${c.WHOv} via ${c.GOODt} de ${c.FT} chegar caro, mês após mês. Um dia decidiu que era mais barato tomar: declarou guerra ${c.WHY}.` : null),
    c => (c.REASON === 'riqueza' ? `"Por que pagar pelo que se pode tomar?", disse ${c.WHOv} aos seus. E ${c.FP} marchou ${c.WHY}.` : null),
    c => (c.REASON === 'rota' ? `As caravanas de ${c.FP} foram roubadas duas vezes na estrada por gente de ${c.FT}. ${c.WHOv} não esperou a terceira: guerra ${c.WHY}.` : null),
  ], civ: {
    asteca: [c => (c.REASON === 'riqueza' ? `${c.WHOv} mandou dizer a ${c.FT} que pagasse tributo em ${c.GOODn}, ou pagaria em sangue. Não pagaram. Guerra ${c.WHY}.` : null)],
    romano: [c => (c.REASON === 'riqueza' ? `O senado de ${c.FP} ouviu os mercadores reclamarem do preço ${c.deGOOD}. ${c.WHOv} encontrou uma ofensa antiga e declarou guerra ${c.WHY}.` : null)],
  } });
  K('gr-tomou', { h: 'A conquista', text: [
    c => `${c.FP} tomou ${c.SET} de ${c.FT}.${c.ESTATE ? ' Com a cidade vieram ' + c.ESTATE + '.' : ''}`,
    c => `${c.SET} caiu. ${c.WHOv} entrou na cidade e foi direto ${c.ESTATE ? 'ver ' + c.ESTATE : 'aos armazéns'}.`,
  ] });
  K('gr-perdeu', { h: 'A derrota', text: [c => `${c.FT} tomou ${c.SET} de ${c.FP}. A guerra ${c.WHY} saiu cara.`] });
  K('gr-vitoria', { h: 'A vitória', text: [
    c => `${c.FT} não existe mais. ${c.GOODc} agora sai das terras de ${c.FP}, e ninguém mais cobra o preço que quer.`,
  ] });
  K('gr-paz-ganhou', { h: 'A paz', text: [c => `Fizeram as pazes. ${c.FP} ficou com ${c.WON}. ${c.GOODc} agora sai das próprias terras.`, c => `A guerra acabou, e ${c.FP} ficou com ${c.WON}. Os mercadores de ${c.FP} fizeram festa.`] });
  K('gr-paz-nada', { h: 'A paz', text: [c => `A guerra acabou sem que ${c.FP} tomasse nada. ${c.GOODc} continua chegando de ${c.FT} — agora mais caro.`, c => `Fizeram as pazes. ${c.FP} contou os mortos e voltou a comprar ${c.GOODn} de ${c.FT}, como antes.`] });
  K('gr-caiu', { h: 'A queda', text: [c => `${c.FP} caiu na guerra que começou ${c.WHY}.`] });
  K('gr-deposto', { h: 'O trono', text: [c => `${c.P} perdeu o trono no meio da guerra ${c.WHY}. ${c.NEW} herdou a guerra.`] });
  K('gr-herdou', { h: 'A herança', text: [c => `${c.NEW} subiu ao trono e herdou a guerra ${c.WHY}.`] });

  const ESTATES = { pomar: 'os pomares', plantacao: 'as plantações', vinhedo: 'os vinhedos', apiario: 'os apiários', salina: 'as salinas', sericultura: 'a casa da seda', perolaria: 'os mergulhadores de pérolas', salga: 'a salga do peixe', farm: '' };
  function grCtx(s) {
    const d = s.data; const p = P(s.protag); const f = G.Fac.get(d.fa);
    const good = d.good || ''; const gt = good ? goodThe(good) : 'as riquezas';
    const who = p && f && f.leader === p.id ? G.Politics.styled(f, p) : p ? p.name : '';
    return { WHO: who, WHOv: who + (who.includes(',') ? ',' : ''), REASON: d.reason, WHY: d.why || 'pelas riquezas do vizinho', GOODt: gt, GOODc: cap1(gt), GOODn: good ? goodName(good) : 'riquezas', deGOOD: good ? deGood(good) : 'das riquezas', FT: facName(d.fb), WON: (d.won || []).join(' e ') || 'nada' };
  }
  function estatesOf(setId) { const out = new Set(); for (const b of G.S.buildings.values()) if (b.set === setId && b.built && ESTATES[b.type]) out.add(ESTATES[b.type]); return [...out].slice(0, 2).join(' e '); }
  function grRuler(s, nr, how) {
    const p = P(s.protag);
    if (!p || p.dead) { takeOver(s, nr, how); St.beat(s, 'gr-herdou', Object.assign(grCtx(s), { NEW: nr.name })); return; }
    St.finish(s, 'roubada', 'agridoce', St.say(s, 'gr-deposto', Object.assign(grCtx(s), { NEW: nr.name })), { log: true });
  }
  function grEnd(s) {
    const won = (s.data.won || []).length;
    if (won) St.finish(s, 'cumprida', 'agridoce', St.say(s, 'gr-paz-ganhou', grCtx(s)), { log: true, toast: true, big: 1 });
    else St.finish(s, 'fracassada', 'agridoce', St.say(s, 'gr-paz-nada', grCtx(s)), { log: true });
  }
  St.define('guerra-rica', {
    name: 'Guerra pela Riqueza', icon: 'scale', tone: 'sombrio', tags: ['guerra', 'riqueza'], struct: 'cobica-guerra', seedLife: 2, maxDays: 60,
    stages: [['cobica', 'A cobiça'], ['guerra', 'A guerra'], ['saque', 'A conquista'], ['paz', 'A paz']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return (s.data.won || []).length ? 2 : 1; },
    logline: (s, c) => `${cap1(grCtx(s).WHO || c.P)}, que levou ${facName(s.data.fa)} à guerra contra ${facName(s.data.fb)} ${s.data.why || 'pelas riquezas do vizinho'}.`,
    on: {
      'guerra-riqueza'(f) {
        const r = rulerOf(f.fa); if (!r || r.dead) return null;
        return [{ protag: r.id, score: 0.62, keyExtra: 'w' + f.fb, cast: {}, place: (() => { const c = G.Fac.capitalOf(f.fb); return c ? { kind: 'cidade', name: c.name, x: c.cx, y: c.cy } : null; })(),
          data: { fa: f.fa, fb: f.fb, ft: f.fb, why: f.why, reason: f.reason, good: f.good, won: [] }, motifs: ['gatilho:cobica', 'amb:guerra', 'rel:nenhuma'] }];
      },
    },
    valid: sd => !!(G.Fac.atWar(sd.data.fa, sd.data.fb) && alive(sd.protag)),
    begin(s) { s.phase = 'guerra'; St.beat(s, 'gr-cobica', grCtx(s), s.place ? { x: s.place.x, y: s.place.y } : {}); },
    tick(s) {
      const fa = G.Fac.get(s.data.fa), fb = G.Fac.get(s.data.fb);
      if (!fa || !fa.alive) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'gr-caiu', grCtx(s)), { log: true }); return; }
      if (!fb || !fb.alive) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'gr-vitoria', grCtx(s)), { log: true, toast: true, big: 1, legend: true }); return; }
      if (G.S.day - s.born >= 1 && !G.Fac.atWar(s.data.fa, s.data.fb)) { grEnd(s); return; }
      const p = P(s.protag);
      if ((!p || p.dead) && s.data.waitHeir && G.S.day - s.data.waitHeir > 1) { St.finish(s, 'interrompida', 'sereno', null); return; }
      if (fa.leader && fa.leader !== s.protag) { const nr = P(fa.leader); if (nr) grRuler(s, nr, ''); }
    },
    react(s, f) {
      if (f.k === 'conquista' && f.fb === s.data.fa && f.fa === s.data.fb) {
        const est = estatesOf(f.set); const nmS = f.n && f.n.set; if (nmS) s.data.won = (s.data.won || []).concat([nmS]).slice(-3);
        St.beat(s, 'gr-tomou', Object.assign(grCtx(s), { SET: nmS || 'uma cidade', ESTATE: est }), { x: f.x, y: f.y, log: true, big: 1 }); s.phase = 'saque';
        return true;
      }
      if (f.k === 'conquista' && f.fb === s.data.fb && f.fa === s.data.fa) { St.beat(s, 'gr-perdeu', Object.assign(grCtx(s), { SET: (f.n && f.n.set) || 'uma cidade' }), { x: f.x, y: f.y }); return true; }
      if (f.k === 'paz' && ((f.fa === s.data.fa && f.fb === s.data.fb) || (f.fa === s.data.fb && f.fb === s.data.fa))) { grEnd(s); return true; }
      if (f.k === 'queda' && f.fac === s.data.fb) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'gr-vitoria', grCtx(s)), { log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'queda' && f.fac === s.data.fa) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'gr-caiu', grCtx(s)), { log: true }); return true; }
      if (f.k === 'coroa' && f.fac === s.data.fa && f.a !== s.protag) { const nr = P(f.a); if (nr) grRuler(s, nr, f.how); return true; }
      if (f.k === 'morte' && f.a === s.protag) {
        const fa = G.Fac.get(s.data.fa); const nr = fa && fa.leader && fa.leader !== f.a ? P(fa.leader) : null;
        if (nr && !nr.dead) grRuler(s, nr, ''); else s.data.waitHeir = G.S.day;
        return true;
      }
      return false;
    },
    goal: s => `Tomar ${s.data.good ? goodThe(s.data.good) : 'as riquezas'} de ${facName(s.data.fb)}.`,
    status: s => `${facName(s.data.fa)} está em guerra com ${facName(s.data.fb)}${(s.data.won || []).length ? '; já tomou ' + s.data.won.join(' e ') : ''}.`,
    obstacles: s => [`os exércitos de ${facName(s.data.fb)}`],
    open: () => ['tomar as terras e as riquezas', 'uma paz sem nada', 'perder a guerra'],
    titles: {
      guerra: c => (c.s.data.good ? `A Guerra ${deTitled(c.s.data.good)}` : 'A Guerra das Riquezas'),
      cobica: c => `A Cobiça de ${c.P}`,
      rota: c => (c.s.data.reason === 'rota' && c.s.data.good ? `A Guerra da Rota ${deTitled(c.s.data.good)}` : null),
    },
    forgotten: () => 'A guerra se arrastou até ninguém lembrar por que tinha começado.',
  });

})(window.G);
