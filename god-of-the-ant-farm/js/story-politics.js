'use strict';
// ============================================================
//  Stories of power: the scaffold, the street, the night.
//    O CADAFALSO       someone you love will hang at noon: gather who will come, and go get them
//    A INSURREIÇÃO     the ruler took someone from you: meet at night with the few who dare, then raise the town
//    O QUE VIU NA NOITE  you saw the hooded ones: and now they know your face
//    O INQUÉRITO       the ruler sent you to find an order that meets in secret (if it exists at all)
//    A CAUSA           the merchants' houses were seized: the merchants answer
//    A CONSPIRAÇÃO     a knife for the throne, and those who hold it
//  As everywhere, the words never say what the world did not do: a riot, a sentence, a coup, a
//  rescue are the world's; the stories only follow who carries them.
// ============================================================
(function (G) {
  const St = G.Stories; if (!St || !St.lib) return;
  const L = St.lib;
  const { P, pe, setName, desc, deathTxt, cap1, free, REL_W } = L;
  const K = (k, d) => St.storylet(k, d);
  const DAY = () => G.DAY_LEN;
  const alive = id => !!(id && G.S.villagers.has(id));
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const J = () => G.Justice;
  const Pol = G.Politics;
  const rulerOf = fid => { const f = G.Fac.get(fid); return f && f.leader ? P(f.leader) : null; };
  const styled = fid => { const f = G.Fac.get(fid); const r = rulerOf(fid); return f && r ? Pol.styled(f, r) : 'quem governa'; };
  const titleOf = fid => { const f = G.Fac.get(fid); const r = rulerOf(fid); return f && r ? Pol.title(f, r).toLowerCase() : 'governante'; };
  const names = ids => { const n = ids.map(id => (P(id) || {}).name).filter(Boolean); return n.length <= 1 ? n[0] || '' : n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1]; };
  const inIds = (f, id) => !!(f.ids && f.ids.includes(id));
  const party = s => (St.party ? St.party.of(s) : []);
  const partyNames = s => (St.party ? St.party.names(s) : '');
  const near = (v, x, y, r) => v && !v.dead && G.dist(v.x, v.y, x, y) < r;
  // 'Aurélia, Sérvio e Máximo' / 'Aurélia, Sérvio, Máximo' (for '…e a coragem que tinham')
  const listAll = s => { const n = [(P(s.protag) || {}).name].concat(party(s).map(v => v.name)).filter(Boolean); return n.length <= 1 ? n[0] || '' : n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1]; };
  const commaAll = s => [(P(s.protag) || {}).name].concat(party(s).map(v => v.name)).filter(Boolean).join(', ');
  // a reason written for many, said of one
  const one = r => (r || '').replace('pertencerem', 'pertencer').replace('tentarem', 'tentar').replace('conspirarem', 'conspirar');
  // a death on the scaffold is told by the scaffold, not by the death
  const byScaffold = f => f.cause === 'execution' || f.cause === 'sacrifice';

  // ====================================================================================
  //  the observer learns the moments of power
  // ====================================================================================
  const O = (k, fn) => St.observe(k, d => { const f = fn(d); if (f) St.offer(f); });
  O('sentence', d => St.draft('sentenca', { ids: d.ids, fac: d.fac, set: d.set, ex: d.ex, reason: d.reason, method: d.method, x: d.x, y: d.y }));
  O('executed', d => St.draft('executado', { ids: d.ids, fac: d.fac, set: d.set, method: d.method, reason: d.reason, cheer: d.cheer, boo: d.boo, x: d.x, y: d.y }));
  O('rescued', d => St.draft('resgatado', { ids: d.ids, fac: d.fac, set: d.set, how: d.how || '', x: d.x, y: d.y }));
  O('jailed', d => St.draft('preso', { ids: d.ids, fac: d.fac, set: d.set, reason: d.reason, x: d.x, y: d.y }));
  O('riot', d => St.draft('motim', { a: d.lead, fac: d.fac, set: d.set, why: d.why, count: d.n, riot: d.id, x: d.x, y: d.y }));
  O('riotEnd', d => St.draft('motim-fim', { a: d.lead, fac: d.fac, set: d.set, why: d.why, how: d.how, dead: d.dead, ids: d.ids, riot: d.id, x: d.x, y: d.y }));
  O('nationalize', d => St.draft('estatizacao', { fac: d.fac, a: d.who, took: d.took, houses: d.houses }));
  O('petitionAnswer', d => St.draft('peticao-resposta', { fac: d.fac, grp: d.grp, a: d.lead, ok: d.ok, arrest: d.arrest, dem: d.dem }));
  O('policy', d => St.draft('decisao', { fac: d.fac, pk: d.k, how: d.how }));
  O('regime', d => St.draft('regime', { fac: d.fac, gov: d.gov, old: d.old, how: d.how, a: d.who }));
  O('uprising', d => St.draft('levante', { fac: d.fac, a: d.lead, goal: d.goal, why: d.why, count: d.n }));
  O('plot', d => St.draft('trama', { fac: d.fac, a: d.lead, goal: d.goal, grp: d.grp || '', secret: d.secret || 0 }));
  O('witness', d => St.draft('testemunha', { a: d.who, soc: d.soc, lodge: d.lodge, fac: d.fac, blood: d.blood ? 1 : 0, x: d.x, y: d.y }));
  O('silenced', d => St.draft('silenciado', { a: d.who, b: d.by, soc: d.soc, inq: d.inq || 0, x: d.x, y: d.y }));
  O('secretJoin', d => St.draft('iniciacao', { a: d.who, soc: d.soc, rank: d.rank }));
  O('inquiry', d => St.draft('inquerito', { a: d.by, fac: d.fac, soc: d.soc, fake: d.fake || '', accuser: d.accuser || 0, inq: d.id, what: d.what || '' }));
  O('exposed', d => St.draft('exposto', { soc: d.soc, fac: d.fac, a: d.by, ids: d.ids, x: d.x, y: d.y }));
  O('witchHunt', d => St.draft('caca-bruxas', { fac: d.fac, ids: d.ids, fake: d.fake, a: d.by }));

  // the company these stories take
  if (St.party) Object.assign(St.party.KIND, {
    cadafalso: { max: 3, risky: 1, kin: 1, grief: 'captive', also: ['guerreiro', 'cacador'], what: 'o resgate', go: ['cadafalso'] },
    insurreicao: { max: 4, risky: 1, kin: 1, grief: 'victim', also: [], what: 'a insurreição', go: ['conspirar'] },
    causa: { max: 3, risky: 1, kin: 0, also: ['mercador', 'feirante', 'ourives', 'taverneiro'], what: 'a causa', go: ['trama'] },
  });
  const METHOD_DO = { forca: ['enforcado', 'enforcada'], machado: ['decapitado', 'decapitada'], espada: ['decapitado', 'decapitada'], fogueira: ['queimado vivo', 'queimada viva'], cruz: ['crucificado', 'crucificada'], pedras: ['apedrejado', 'apedrejada'], sacrificio: ['sacrificado', 'sacrificada'] };
  const doneTo = (m, v) => (METHOD_DO[m] || ['executado', 'executada'])[v && v.g === 'f' ? 1 : 0];

  // ====================================================================================
  //  O CADAFALSO — someone you love will die at noon
  // ====================================================================================
  K('cd-sentenca', { h: 'O pregão', text: [
    c => `O arauto passou gritando pelas ruas de ${c.TOWN}: ${c.REL ? c.REL + ', ' + c.C + ',' : c.C} ${c.WILL} ${c.DO} ${c.WHEN}, ${c.WHY}. ${c.P} largou o que tinha nas mãos.`,
    c => `${c.P} ouviu na praça: ${c.C} ${c.WILL} ${c.DO} ${c.WHEN}. Já estão erguendo o cadafalso. ${c.P} não dormiu.`,
    c => `${cap1(c.REL || 'Alguém que ' + c.P + ' ama')} — ${c.C} — ${c.WILL} ${c.DO} ${c.WHEN}, ${c.WHY}. ${c.P} jurou que não ia ficar olhando.`,
  ] });
  K('cd-chamado', { h: 'Os que vêm', text: [
    c => `${c.P} não vai sozinh${c.o}: ${c.PARTY} ${c.PN > 1 ? 'estarão' : 'estará'} na praça, perto do cadafalso, na hora marcada.`,
    c => `Na véspera, ${c.ALL} combinaram baixinho, atrás da casa: quando o tambor começar, cada um sabe o que fazer.`,
  ] });
  K('cd-sozinho', { h: 'Sozinh{o}', text: [
    c => `Ninguém quis ir junto. ${c.P} vai sozinh${c.o}, com uma faca escondida na roupa.`,
    c => `${c.P} pediu ajuda e ouviu desculpas. Vai sozinh${c.o}.`,
  ] });
  K('cd-grito', { h: 'O grito', text: [
    c => `Quando o carrasco subiu os degraus, ${c.P} gritou "${c.SHOUT}" — e a praça, que só olhava, começou a se mexer.`,
    c => `${c.P} subiu num barril no meio da multidão e gritou o nome de ${c.C}. Uma pedra voou. Depois outra.`,
  ] });
  K('cd-investida', { h: 'O cadafalso', text: [
    c => `${c.ALL} ${c.PN ? 'correram' : 'correu'} para o cadafalso, empurrando quem estava na frente.`,
    c => `Não houve multidão para ajudar: só ${c.COMMA} e a coragem que ${c.PN ? 'tinham' : 'tinha'}. ${c.PN ? 'Subiram' : 'Subiu'} os degraus correndo.`,
  ] });
  K('cd-preso', { h: 'Presos', text: [
    c => `Os guardas foram mais rápidos. ${c.P}${c.PARTY ? ' e ' + c.PARTY : ''} ${c.PN ? 'foram presos' : 'foi pres' + c.o} ali mesmo, ao pé do cadafalso, e ${c.PN ? 'levados amarrados' : 'levad' + c.o + ' amarrad' + c.o}.`,
    c => !c.ROPE ? null : (c.PN ? `${c.P} chegou a tocar a corda — e então os guardas pegaram todos. Agora são eles que vão esperar a vez.` : `${c.P} chegou a tocar a corda — e então os guardas ${c.o === 'a' ? 'a' : 'o'} agarraram. Agora é ${c.ele} quem vai esperar a vez.`),
  ] });
  K('cd-chamado-proprio', { h: 'O nome', text: [
    c => `Desta vez o arauto disse outro nome: ${c.P}${c.PARTY ? ' — e, com ' + c.ele + ', ' + c.PARTY : ''}. ${c.WHY}.`,
    c => `O pregão chegou à cela: ${c.P} também ${c.WILL2} ${c.DO2} ${c.WHEN}.`,
  ] });
  K('cd-livre', { h: 'Livre', text: [
    c => `As cordas foram cortadas. ${c.C} desceu do cadafalso nos braços de ${c.P}${c.PARTY ? ' e ' + c.PARTY : ''}, e os dois sumiram no meio do povo.`,
    c => `${c.C} está viv${c.oC}. ${c.P}${c.PN ? ' e os que foram junto' : ''} ${c.PN ? 'tiraram' : 'tirou'} ${c.C} da corda, e ${c.PN ? 'todos correram' : 'os dois correram'} pelas ruelas de ${c.TOWN} até a noite cair.`,
  ] });
  K('cd-livre-outro', { h: 'Livre', text: [
    c => `Não foi ${c.P} quem soltou ${c.C}: foi a praça inteira. Mas foi n${c.o === 'a' ? 'ela' : 'ele'} que ${c.C} procurou primeiro, ainda com a corda no pescoço.`,
  ] });
  K('cd-solto', { h: 'A porta da cela', text: [
    c => `Abriram a cela: ${c.P} saiu livre${c.PARTY ? ', com ' + c.PARTY : ''}. Do cadafalso, só ficou o medo.`,
  ] });
  K('cd-tarde', { h: 'Tarde demais', text: [
    c => `${c.P} viu ${c.C} ser ${c.DONE} na praça de ${c.TOWN}. Não deu tempo. Ficou ali até a multidão ir embora.`,
    c => `${c.C} foi ${c.DONE} ao meio-dia. ${c.P} estava lá, no meio de todos, e não pôde fazer nada.`,
  ] });
  K('cd-longe', { h: 'O meio-dia', text: [
    c => `${c.C} foi ${c.DONE} enquanto ${c.P} ainda estava longe da praça. Quando chegou, só havia o cadafalso.`,
  ] });
  K('cd-cela-viu', { h: 'Pela grade', text: [
    c => `Da cela, ${c.P} ouviu o tambor e o silêncio que veio depois. ${c.C} tinha sido ${c.DONE}.`,
  ] });
  K('cd-fim-proprio', { h: 'O cadafalso', text: [
    c => `${c.P} foi ${c.DONE2} na mesma praça onde quis salvar ${c.C}${c.PARTY_DEAD ? ', ao lado de ' + c.PARTY_DEAD : ''}. Contam que não baixou os olhos.`,
    c => `${c.PARTY_DEAD ? 'Subiram' : 'Subiu'} ao cadafalso ${c.P}${c.PARTY_DEAD ? ' e ' + c.PARTY_DEAD : ''}. A praça, que tantas vezes aplaude, ficou quieta.`,
  ] });
  K('cd-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} antes do meio-dia. ${c.C} ficou sem ninguém.`] });

  function cdCtx(s) {
    const c = P(s.cast.captive); const set = G.S.settlements.get(s.data.set); const p = P(s.protag);
    const e = J() && J().list().find(q => q.id === s.data.ex);
    const now = e ? (e.start - G.S.clock) / DAY() : 0;
    return {
      TOWN: set ? set.name : s.data.town || '', WHY: one(s.data.reason) || 'por seus crimes', ALL: listAll(s), COMMA: commaAll(s), DO: doneTo(s.data.method, c), DONE: doneTo(s.data.method, c), DO2: doneTo(s.data.method2 || s.data.method, p), DONE2: doneTo(s.data.method2 || s.data.method, p),
      WILL: 'será', WILL2: 'será', WHEN: now > 0.55 ? 'amanhã, ao meio-dia' : 'ao meio-dia', PARTY: partyNames(s), PN: party(s).length, PARTY_DEAD: s.data.deadParty || '',
      SHOUT: G.pick(['Soltem!', 'Assassinos!', 'É inocente!', 'Ninguém morre hoje!']), oC: oa(c),
    };
  }
  St.define('cadafalso', {
    name: 'O Cadafalso', icon: 'skullx', tone: 'sombrio', tags: ['justiça', 'família', 'resgate'], struct: 'separacao-reencontro', seedLife: 1, maxDays: 8, ripe: 0,
    stages: [['pregao', 'O pregão'], ['juntar', 'Os que vêm'], ['praca', 'A praça'], ['fim', 'O meio-dia']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return s.data.tried ? 2 : s.data.gathered ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p))} tem até o meio-dia para tirar ${c.REL ? c.REL + ', ' + c.C + ',' : c.C} do cadafalso${s.data.reason ? ' — condenad' + c.oC + ' ' + one(s.data.reason) : ''}.`,
    on: {
      sentenca(f) {
        const out = [];
        for (const id of f.ids || []) {
          const c = P(id); if (!c) continue;
          for (const k of St.kin(c)) {
            if (k.age < 16 || k.age > 62 || k.captive || inIds(f, k.id) || (k.task && (k.task.type === 'jail' || k.task.type === 'condemned'))) continue;
            const fk = G.Fac.get(f.fac); if (fk && fk.leader === k.id) continue;
            if (f.x !== undefined && G.dist(k.x, k.y, f.x, f.y) > 45) continue;
            const rel = St.relOf(k, c); const q = pe(k);
            const sc = (REL_W[rel] || 0.4) * 0.5 + k.courage * 0.35 + q.agg * 0.2 - (q.pie > 0.75 ? 0.1 : 0);
            if (sc < 0.62) continue;
            out.push({ protag: k.id, score: Math.min(1, sc), keyExtra: 'cd' + f.ex + '-' + id, cast: { captive: c.id }, data: { ex: f.ex, fac: f.fac, set: f.set, rel, reason: f.reason, method: f.method, town: setName(f.set) || '' }, motifs: ['gatilho:sentenca', 'rel:' + rel, 'clima:cadafalso'] });
          }
        }
        return out;
      },
    },
    valid: sd => alive(sd.protag) && alive(sd.cast.captive),
    begin(s) {
      s.phase = 'juntar'; St.beat(s, 'cd-sentenca', cdCtx(s));
      const p = P(s.protag);
      if (p && St.party) { St.party.gather(s, p); s.data.gathered = 1; St.beat(s, party(s).length ? 'cd-chamado' : 'cd-sozinho', cdCtx(s)); }
    },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      if (s.phase !== 'juntar' || s.data.tried) return;
      const e = J() && J().list().find(q => q.id === s.data.ex); if (!e) return;
      // the drums: go now, whatever they were doing
      if ((e.phase === 'gather' || e.phase === 'march' || e.phase === 'read') && !s.data.going && !(p.task && p.task.type === 'jail')) {
        s.data.going = 1;
        St.go(s, p, G.Vg.H, { x: e.x + 0.6, y: e.y + 1.9, sub: 'cadafalso', dur: 1.5, emo: 'angry', fx: e.x, fy: e.y, pri: 3.6, partyPri: 3.5, max: 120, hurry: 1.3 });
      }
    },
    arrive(s, v, t) {
      if (t.sub !== 'cadafalso' || s.data.tried) return;
      s.data.tried = 1;
      const e = J() && J().list().find(q => q.id === s.data.ex); const f = G.Fac.get(s.data.fac); const set = G.S.settlements.get(s.data.set);
      if (!e || !f || !set || e.phase === 'after' || e.phase === 'done') return;
      const crew = party(s).filter(c => near(c, v.x, v.y, 6));
      // first: raise the square
      const R = G.Riots && G.Riots.start(f, set, 'execucao', { free: e.id, lead: v.id, at: [e.x, e.y + 1.4], boost: 0.32 + crew.length * 0.07, whyTxt: 'para salvar ' + (P(s.cast.captive) || {}).name + ' do cadafalso' });
      if (R) { s.data.riot = R.id; for (const c of crew) if (!R.ids.includes(c.id)) { R.ids.push(c.id); G.Vg.setTask(c, { type: 'riot', r: R.id, pri: 3.4, st: 0, x: e.x + G.rr(-1, 1), y: e.y + 1.6, kind: 'riot', job: '', cause: 'war', torch: false, hp0: c.hp }); } St.beat(s, 'cd-grito', cdCtx(s), { x: e.x, y: e.y, log: true, hot: 30 }); return; }
      // no crowd: only them, against the guard
      St.beat(s, 'cd-investida', cdCtx(s), { x: e.x, y: e.y, hot: 20 });
      let guards = 0; for (const o of G.S.villagers.values()) if (o.task && o.task.j === e.id && (o.task.role === 'guard' || o.task.role === 'exe')) guards++;
      const odds = 0.2 + crew.length * 0.13 + v.courage * 0.2 + (pe(v).agg - 0.5) * 0.2 - guards * 0.12;
      if (G.R() < odds) { J().free(e, 'resgate'); return; }
      const caught = [v].concat(crew.filter(() => G.R() < 0.75));
      s.data.caught = caught.map(c => c.id);
      J().sentence(f, caught, `por tentarem libertar ${(P(s.cast.captive) || {}).name || 'um condenado'} do cadafalso`.replace('tentarem', caught.length > 1 ? 'tentarem' : 'tentar'), { set: set.id, quiet: true });
      s.phase = 'preso'; St.beat(s, 'cd-preso', Object.assign(cdCtx(s), { PARTY: names(caught.slice(1).map(c => c.id)), PN: caught.length - 1 }), { x: v.x, y: v.y, log: true, big: 1 });
    },
    react(s, f) {
      const me = s.protag, cap = s.cast.captive;
      if (f.k === 'resgatado' && inIds(f, cap) && s.phase !== 'preso') {
        St.finish(s, 'cumprida', 'feliz', St.say(s, s.data.tried ? 'cd-livre' : 'cd-livre-outro', cdCtx(s)), { x: f.x, y: f.y, log: true, toast: true, big: 1, legend: true, clima: 'cadafalso' });
        return true;
      }
      if (f.k === 'resgatado' && inIds(f, me)) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'cd-solto', cdCtx(s)), { x: f.x, y: f.y, log: true, big: 1 }); return true; }
      if (f.k === 'preso' && inIds(f, me) && s.phase !== 'preso') { s.phase = 'preso'; St.beat(s, 'cd-preso', cdCtx(s), { x: f.x, y: f.y, log: true }); return true; }
      if (f.k === 'sentenca' && inIds(f, me)) { s.data.method2 = f.method; s.data.ex2 = f.ex; St.beat(s, 'cd-chamado-proprio', Object.assign(cdCtx(s), { WHY: cap1(f.reason || 'Por seus crimes') }), { x: f.x, y: f.y, log: true, big: 1 }); return true; }
      if (f.k === 'executado' && inIds(f, me)) {
        s.data.method2 = f.method; s.data.deadParty = names((s.data.caught || []).filter(id => id !== me && inIds(f, id)));
        St.finish(s, 'tragica', 'tragico', St.say(s, 'cd-fim-proprio', cdCtx(s)), { x: f.x, y: f.y, log: true, toast: true, big: 1, legend: true, clima: 'cadafalso' });
        return true;
      }
      if (f.k === 'executado' && inIds(f, cap)) {
        const p = P(me);
        if (s.phase === 'preso') { St.beat(s, 'cd-cela-viu', cdCtx(s), { x: f.x, y: f.y }); return true; }
        St.finish(s, 'fracassada', 'tragico', St.say(s, p && near(p, f.x, f.y, 12) ? 'cd-tarde' : 'cd-longe', cdCtx(s)), { x: f.x, y: f.y, log: true, big: 1, clima: 'cadafalso' });
        return true;
      }
      if (f.k === 'morte' && f.a === me && !byScaffold(f)) { St.chapter(s, St.say(s, 'cd-morreu', Object.assign(cdCtx(s), { DEATH: deathTxt(me) })), { x: f.x, y: f.y }); St.finish(s, 'interrompida', 'tragico', null); return true; }
      return false;
    },
    goal: (s, c) => `Tirar ${c.C} do cadafalso antes que ${c.oC === 'a' ? 'a' : 'o'} ${s.data.method === 'fogueira' ? 'queimem' : 'matem'}.`,
    status(s, c) { const e = J() && J().list().find(q => q.id === s.data.ex); if (s.phase === 'preso') return `${c.P} está pres${c.o}, esperando a própria sentença.`; if (!e) return `${c.C} já não está no cadafalso.`; const h = Math.max(0, (e.start - G.S.clock) / DAY() * 24); return e.phase === 'wait' ? `Faltam umas ${Math.round(h)} horas para o meio-dia.${party(s).length ? ' Com ' + c.P + ': ' + partyNames(s) + '.' : ''}` : 'A praça está cheia. O carrasco já subiu.'; },
    obstacles: s => (s.phase === 'preso' ? ['a cela', 'o cadafalso'] : ['os guardas', 'a hora marcada']),
    open: () => ['soltar o condenado', 'levantar a praça', 'ser pego junto', 'chegar tarde demais'],
    titles: {
      cad: c => `O Cadafalso de ${c.C}`,
      meio: () => 'Antes do Meio-Dia',
      corda: c => `${c.P} e a Corda`,
      praca: c => `A Praça de ${c.TOWN || c.cityNow || 'Pedra'}`,
    },
    forgotten: () => 'O cadafalso foi desmontado, e o que se tentou fazer ali, esquecido.',
  });

  // ====================================================================================
  //  A INSURREIÇÃO — the few who meet at night, and the day they rise
  // ====================================================================================
  K('in-juramento', { h: 'O juramento', text: [
    c => `${c.V} foi ${c.HOW}. Naquela noite, ${c.P} jurou diante do fogo: ${c.RULER} ia pagar.`,
    c => `Depois que ${c.V} foi ${c.HOW}, ${c.P} parou de abaixar a cabeça quando os guardas passam.`,
    c => `"Hoje foi ${c.V}. Amanhã é qualquer um." ${c.P} disse isso alto, na porta de casa, e não se arrependeu.`,
  ] });
  K('in-reuniao', { h: 'A reunião', text: [
    c => `À noite, longe das casas, ${c.P} reuniu ${c.PARTY}. Falaram baixo, com uma vela só.`,
    c => `${c.MEET}ª reunião: ${c.P}${c.PARTY ? ', ' + c.PARTY : ''} e o silêncio da noite. Cada vez são mais.`,
    c => `${c.P} e ${c.PARTY} se encontraram de novo no escuro. Contaram quantas lanças há na cidade, e quantas portas.`,
  ] });
  K('in-novo', { h: 'Mais um', text: [c => `${c.NEW} apareceu na reunião — trazid${c.oN} por alguém de confiança. Agora são ${c.N}.`] });
  K('in-traicao', { h: 'A traição', text: [
    c => `Alguém falou. Antes do amanhecer, os guardas bateram na porta de ${c.P}. ${c.TRAITOR} sumiu de casa naquele mesmo dia.`,
    c => `${c.TRAITOR} teve medo e contou tudo a ${c.RULER}. Os guardas vieram buscar ${c.P}${c.PARTY ? ' e ' + c.PARTY : ''}.`,
  ] });
  K('in-levante', { h: 'O levante', text: [
    c => `No dia marcado, ${c.P} acendeu a primeira tocha na praça. ${c.N} pessoas vieram atrás.`,
    c => `"Agora!" — e a praça de ${c.TOWN} se encheu de tochas, com ${c.P} na frente.`,
  ] });
  K('in-vazio', { h: 'Ninguém veio', text: [
    c => `${c.P} acendeu a tocha na praça e esperou. Pouca gente veio; o medo ainda é maior. Vão tentar outro dia.`,
    c => `O dia chegou, mas a cidade não se mexeu. ${c.P} apagou a tocha antes que os guardas vissem.`,
  ] });
  K('in-revolucao', { h: 'A revolução', text: [c => `O motim não se apagou: virou revolução. ${c.P} está no meio dela.`, c => `${c.P} não queria só um motim. Agora é guerra contra o trono.`] });
  K('in-cedeu', { h: 'A vitória', text: [
    c => `${c.RULER} cedeu diante da multidão. ${c.P} voltou para casa com a tocha apagada e a cabeça erguida.`,
    c => `O trono recuou. Não trouxe ${c.V} de volta — mas ${c.P} sabe que a cidade inteira lembrou o nome del${c.oV === 'a' ? 'a' : 'e'}.`,
  ] });
  K('in-novo-regime', { h: 'O novo tempo', text: [
    c => `${c.FAC} não é mais governad${c.oF} como antes: ${c.GOV}. O que começou na noite em que ${c.V} morreu terminou assim.`,
    c => `Caiu o trono de quem mandou matar ${c.V}. ${c.FAC} agora é ${c.GOV}, e ${c.P} esteve lá desde o começo.`,
  ] });
  K('in-coroa', { h: 'O trono', text: [c => `${c.P}, que juntou os primeiros na escuridão, agora governa ${c.FAC}.`] });
  K('in-esmagado', { h: 'O sangue', text: [
    c => `A guarda esmagou o levante. ${c.P} escapou por pouco, com sangue dos outros na roupa.`,
    c => `O levante foi afogado em sangue. ${c.P} sobreviveu, mas a cidade agora tem mais medo do que raiva.`,
  ] });
  K('in-preso', { h: 'A cela', text: [c => `${c.P} está pres${c.o}${c.PARTY ? ', e com ' + c.o + ' ' + c.PARTY : ''}. O cadafalso espera.`] });
  K('in-executado', { h: 'O cadafalso', text: [
    c => `${c.P} foi ${c.DONE} na praça${c.PARTY_DEAD ? ', ao lado de ' + c.PARTY_DEAD : ''}. Quem estava lá diz que gritou o nome de ${c.V} até o fim.`,
    c => `Acabou no cadafalso, como ${c.V}: ${c.P}${c.PARTY_DEAD ? ' e ' + c.PARTY_DEAD : ''}. Mas a cidade não esqueceu nenhum dos dois.`,
  ] });
  K('in-desistiu', { h: 'O silêncio', text: [c => `Os outros foram deixando de vir. ${c.P} guardou a raiva no peito e voltou à vida de antes.`] });
  const GOVNAME = (fid, gov) => { const f = G.Fac.get(fid); return f && G.Polity ? G.Polity.govNameOf(f, gov).toLowerCase() : gov; };
  function inCtx(s, x) {
    const set = G.S.settlements.get(s.data.set); const f = G.Fac.get(s.data.fac);
    return Object.assign({ TOWN: set ? set.name : '', RULER: s.data.rulerName || styled(s.data.fac), HOW: s.data.how || 'executad' + oa(P(s.cast.victim)), PARTY: partyNames(s), N: party(s).length + 1, MEET: s.data.meet || 1,
      FAC: f ? f.name : '', oF: f ? G.Fac.oa(f) : 'o', DONE: doneTo(s.data.method2, P(s.protag)), PARTY_DEAD: s.data.deadParty || '' }, x || {});
  }
  function inSeed(v, fac, set, victim, how, score, extra, why) {
    return { protag: v.id, score: Math.min(1, score), keyExtra: extra, cast: { victim }, data: { fac, set: set || v.set, how, why, rulerName: styled(fac), town: setName(set || v.set) || '' }, motifs: ['gatilho:' + why, 'clima:levante', 'rel:' + (St.relOf(v, P(victim)) || 'nenhuma')] };
  }
  St.define('insurreicao', {
    name: 'A Insurreição', icon: 'flame', tone: 'sombrio', tags: ['política', 'vingança', 'grupo'], struct: 'perda-levante', seedLife: 4, maxDays: 40, ripe: 0.4,
    stages: [['jura', 'O juramento'], ['noite', 'As reuniões'], ['dia', 'O levante'], ['fim', 'O que restou']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' || s.end.k === 'transformada' ? 3 : -1; return s.data.rose ? 2 : (s.data.meet || 0) ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p))} perdeu ${c.REL || ''}${c.REL ? ', ' : ''}${c.V}, para ${s.data.rulerName || 'o trono'} — e começou a juntar, à noite, os que também perderam alguém.`,
    on: {
      executado(f) {
        const out = []; const set = G.S.settlements.get(f.set); if (!set) return out;
        for (const id of f.ids || []) {
          const d = P(id); if (!d) continue;
          for (const k of St.kin(d)) {
            if (k.age < 17 || k.age > 60 || k.captive || inIds(f, k.id) || G.Fac.idOfV(k) !== f.fac) continue;
            const fk = G.Fac.get(f.fac); if (fk && fk.leader === k.id) continue;
            const q = pe(k); const rel = St.relOf(k, d);
            const sc = (REL_W[rel] || 0.4) * 0.45 + q.agg * 0.3 + k.courage * 0.3 + (set.loyalty < 45 ? 0.15 : 0) - q.pie * 0.1;
            if (sc > 0.72) out.push(Object.assign(inSeed(k, f.fac, f.set, d.id, doneTo(f.method, d), sc, 'in' + f.id + '-' + id, 'execucao'), {}));
          }
        }
        return out;
      },
      'motim-fim'(f) {
        if (f.how !== 'esmagado' || !f.dead) return null; const out = [];
        for (const id of f.ids || []) { if (alive(id)) continue; const d = P(id); if (!d) continue; for (const k of St.kin(d)) { if (k.age < 17 || k.age > 60 || k.captive || G.Fac.idOfV(k) !== f.fac) continue; const q = pe(k); const sc = 0.4 + q.agg * 0.35 + k.courage * 0.3; if (sc > 0.78) out.push(inSeed(k, f.fac, f.set, d.id, (d.g === 'f' ? 'morta' : 'morto') + ' pela guarda no motim', sc, 'im' + f.riot + '-' + id, 'motim')); } }
        return out;
      },
      'peticao-resposta'(f) {
        if (f.ok || !f.arrest) return null; const d = P(f.a); if (!d) return null; const out = [];
        for (const k of St.kin(d)) { if (k.age < 17 || k.age > 60 || k.captive) continue; const q = pe(k); const sc = 0.4 + q.agg * 0.3 + k.courage * 0.3; if (sc > 0.76) out.push(inSeed(k, f.fac, k.set, d.id, 'pres' + oa(d) + ' por pedir', sc, 'ip' + f.id + '-' + d.id, 'prisao')); }
        return out;
      },
    },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'jurar'; St.beat(s, 'in-juramento', inCtx(s)); s.data.since = G.S.day; },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      // ready: the day they rise
      if (s.phase === 'conspirar' && (s.data.meet || 0) >= 2 && !s.data.rose && G.S.time > 0.35 && G.S.time < 0.6 && G.S.day > (s.data.lastMeetDay || 0) && G.S.day >= (s.data.retryDay || 0) && free(p)) {
        const f = G.Fac.get(s.data.fac); const set = G.S.settlements.get(p.set);
        if (!f || !set || G.Village.facOfSet(set.id) !== f.id) return;
        const crew = party(s);
        const R = G.Riots && G.Riots.start(f, set, 'tirania', { lead: p.id, boost: 0.22 + crew.length * 0.05, whyTxt: 'contra quem mandou matar ' + ((P(s.cast.victim) || {}).name || 'os seus') });
        if (R) { s.data.rose = 1; s.data.riot = R.id; s.phase = 'levante'; for (const c of crew) if (!R.ids.includes(c.id) && !c.captive && c.set === set.id) { R.ids.push(c.id); G.Vg.setTask(c, { type: 'riot', r: R.id, pri: 3.4, st: 0, x: R.x + G.rr(-1.5, 1.5), y: R.y + G.rr(-1, 1), kind: 'riot', job: '', cause: 'war', torch: true, hp0: c.hp }); } St.beat(s, 'in-levante', inCtx(s, { N: R.ids.length }), { x: R.x, y: R.y, log: true, toast: true, hot: 40 }); return; }
        s.data.tries = (s.data.tries || 0) + 1; s.data.retryDay = G.S.day + 2;
        if (s.data.tries >= 3) { St.finish(s, 'abandonada', 'agridoce', St.say(s, 'in-desistiu', inCtx(s))); return; }
        St.beat(s, 'in-vazio', inCtx(s));
      }
    },
    urge(s, v) {
      if (s.phase !== 'jurar' && s.phase !== 'conspirar') return 0;
      const dusk = G.S.time > 0.62 || G.S.time < 0.04;
      if (!dusk || G.S.day === (s.data.lastMeetDay || -1) || (s.data.meet || 0) >= 4) return 0;
      return v.age >= 17 && !v.captive ? 0.34 : 0;
    },
    task(s, v, H) {
      // a hidden place: the edge of the woods, behind the last houses
      const set = G.S.settlements.get(v.set); if (!set) return null;
      const a = G.hash(s.id * 7) * Math.PI * 2; const sp = G.W.nearestLand(set.cx + Math.cos(a) * 9, set.cy + Math.sin(a) * 7, 4); if (!sp) return null;
      s.phase = 'conspirar'; s.data.lastMeetDay = G.S.day;
      return St.go(s, v, H, { x: sp[0], y: sp[1], sub: 'conspirar', dur: 14, act: 'talk', max: 160 });
    },
    arrive(s, v, t) {
      if (t.sub !== 'conspirar') return;
      s.data.meet = (s.data.meet || 0) + 1;
      // someone new each time: one more who lost something, or who has had enough
      const f = G.Fac.get(s.data.fac); const g = f && f.grp;
      if (St.party && s.data.meet > 1 && party(s).length < 5) {
        const c = [...G.S.villagers.values()].find(o => o.set === v.set && o.id !== v.id && !St.party.has(s, o.id) && o.age >= 18 && o.age < 60 && !o.captive && g && g[o.grp || 'povo'] && g[o.grp || 'povo'].sat < 40 && pe(o).agg > 0.5 && G.R() < 0.3);
        if (c && St.party.decide(s, c, 'ask').ok) { St.party.join(s, c.id, 'reuniao'); St.beat(s, 'in-novo', inCtx(s, { NEW: c.name, oN: oa(c), N: party(s).length + 1 })); }
      }
      St.beat(s, 'in-reuniao', inCtx(s), { x: v.x, y: v.y });
      // someone talks: the fearful one, to a hard ruler
      const crew = party(s); const weak = crew.find(c => c.courage < 0.38);
      const r = rulerOf(s.data.fac); const cru = r ? pe(r).cru : 0.4;
      if (weak && f && r && G.R() < 0.1 + cru * 0.12 && J()) {
        const caught = [v].concat(crew.filter(c => c !== weak && c.set === v.set)).slice(0, 4);
        s.data.caught = caught.map(c => c.id);
        St.party.leave(s, weak.id);
        J().sentence(f, caught, `por conspirarem contra ${r.g === 'f' ? 'a' : 'o'} ${titleOf(s.data.fac)}`.replace('conspirarem', caught.length > 1 ? 'conspirarem' : 'conspirar'), { set: v.set });
        s.phase = 'preso'; St.beat(s, 'in-traicao', inCtx(s, { TRAITOR: weak.name, PARTY: names(caught.slice(1).map(c => c.id)) }), { x: v.x, y: v.y, log: true, big: 1 });
      }
    },
    react(s, f) {
      const me = s.protag;
      if (f.k === 'motim-fim' && f.riot === s.data.riot) {
        if (f.how === 'cedeu') { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'in-cedeu', inCtx(s)), { x: f.x, y: f.y, log: true, toast: true, big: 1, legend: true }); return true; }
        if (f.how === 'revolucao') { s.phase = 'revolucao'; St.beat(s, 'in-revolucao', inCtx(s), { x: f.x, y: f.y, log: true }); return true; }
        if (f.how === 'esmagado') { const p = P(me); if (p && !p.dead && !(p.task && (p.task.type === 'jail' || p.task.type === 'condemned'))) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'in-esmagado', inCtx(s)), { x: f.x, y: f.y, log: true }); } return true; }
        if (f.how === 'disperso') { s.data.rose = 0; s.phase = 'conspirar'; s.data.retryDay = G.S.day + 3; St.beat(s, 'in-vazio', inCtx(s)); return true; }
      }
      if (f.k === 'levante' && f.a === me && s.phase !== 'revolucao') { s.phase = 'revolucao'; St.beat(s, 'in-revolucao', inCtx(s)); return true; }
      if (f.k === 'coroa' && f.a === me && (s.phase === 'revolucao' || s.phase === 'levante' || /revolu|golpe|levante/.test(f.how || ''))) { St.finish(s, 'transformada', 'feliz', St.say(s, 'in-coroa', inCtx(s)), { log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'coroa' && f.a === me) { St.finish(s, 'transformada', 'agridoce', `O trono caiu nas mãos de ${(P(me) || {}).name} por herança. Agora é ${(P(me) || {}).g === 'f' ? 'ela' : 'ele'} quem manda — e quem decide o que fazer com a raiva.`, { log: true, big: 1 }); return true; }
      if (f.k === 'regime' && f.fac === s.data.fac && s.phase === 'revolucao') { St.finish(s, 'cumprida', 'feliz', St.say(s, 'in-novo-regime', inCtx(s, { GOV: GOVNAME(f.fac, f.gov) })), { log: true, toast: true, big: 1, legend: true }); return true; }
      if ((f.k === 'preso' || f.k === 'sentenca') && inIds(f, me) && s.phase !== 'preso') { s.phase = 'preso'; s.data.caught = s.data.caught || f.ids.slice(); St.beat(s, 'in-preso', inCtx(s, { PARTY: names(f.ids.filter(id => id !== me)) })); return true; }
      if (f.k === 'executado' && inIds(f, me)) { s.data.method2 = f.method; s.data.deadParty = names(f.ids.filter(id => id !== me)); St.finish(s, 'tragica', 'tragico', St.say(s, 'in-executado', inCtx(s)), { x: f.x, y: f.y, log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'resgatado' && inIds(f, me) && s.phase === 'preso') { s.phase = 'conspirar'; St.chapter(s, `${(P(me) || {}).name} saiu da cela. A raiva, não.`); return true; }
      if (f.k === 'morte' && f.a === me && !byScaffold(f)) { if (!St.bequeath(s, P(me), 'morte')) St.finish(s, 'interrompida', 'tragico', `${(P(me) || {}).name} ${deathTxt(me)} antes do levante.`); return true; }
      return false;
    },
    goal: (s, c) => `Fazer ${c.RULER || 'o trono'} pagar por ${c.V}.`,
    status(s, c) { const x = inCtx(s); if (s.phase === 'preso') return `${c.P} está pres${c.o}.`; if (s.phase === 'revolucao') return 'A revolução está nas ruas.'; return (s.data.meet ? `Já foram ${s.data.meet} reuniões na escuridão.` : 'Ainda não houve nenhuma reunião.') + (x.PARTY ? ` Com ${c.P}: ${x.PARTY}.` : ''); },
    obstacles: s => ['a guarda', 'o medo da cidade'].concat(party(s).some(c => c.courage < 0.38) ? ['alguém fraco no grupo'] : []),
    open: () => ['o levante', 'uma traição', 'o cadafalso', 'um novo regime'],
    heirs: { minAge: 16, chance: 0.4, fit: (s, c) => 0.3 + pe(c).agg * 0.5 + c.courage * 0.3, text: (s, c) => `${c.P} morreu, mas o juramento não. ${c.H}, ${c.DEADREL}, foi à reunião seguinte no lugar del${c.o === 'a' ? 'a' : 'e'}.` },
    titles: {
      tochas: c => `As Tochas de ${c.TOWN || c.cityNow || c.P}`,
      noite: () => 'Os da Noite',
      nome: c => `Pelo Nome de ${c.V}`,
      levante: c => `O Levante de ${c.P}`,
    },
    forgotten: () => 'As reuniões pararam. A raiva ficou guardada, esperando outra geração.',
  });

  // ====================================================================================
  //  O QUE VIU NA NOITE — the witness
  // ====================================================================================
  const socName = id => { const q = G.Secrets && G.Secrets.get(id); return q ? q.name : 'a seita'; };
  const socArt = (id, how) => (G.Secrets ? G.Secrets.art(socName(id), how) : socName(id));
  K('tt-viu', { h: 'A noite', text: [
    c => `${c.P} não conseguia dormir e saiu para andar. Viu, ${c.WHERE}, gente de manto e capuz em volta do fogo${c.BLOOD ? ' — e alguém deitado na pedra, que não se mexia mais' : ''}. Voltou correndo, sem saber se ${c.o === 'a' ? 'a' : 'o'} tinham visto.`,
    c => `${cap1(c.WHERE)}, à meia-noite, ${c.P} viu capuzes, cânticos numa língua estranha${c.BLOOD ? ', e sangue' : ''}. Um dos encapuzados virou o rosto na direção del${c.o === 'a' ? 'a' : 'e'}.`,
  ] });
  K('tt-seguid', { h: 'Os passos', text: [
    c => `Desde aquela noite, ${c.P} ouve passos atrás de si quando a rua esvazia.`,
    c => `${c.P} tem certeza: alguém ${c.o === 'a' ? 'a' : 'o'} segue. Um rosto que some quando ${c.ele} se vira.`,
  ] });
  K('tt-contou', { h: 'A língua', text: [c => `${c.P} não aguentou guardar: contou o que viu. Agora a cidade inteira cochicha sobre ${c.WHERE}.`, c => `${c.P} contou a uma vizinha, que contou a outra. Já não é segredo.`] });
  K('tt-denuncia', { h: 'O palácio', text: [c => `${c.P} foi até ${c.RULER} e contou tudo o que viu naquela noite. ${c.RULER} mandou investigar.`] });
  K('tt-comprad', { h: 'O saco de moedas', text: [c => `Alguém deixou um saco de moedas na porta de ${c.P}. ${c.P} entendeu, e não falou mais daquela noite.`] });
  K('tt-jurou', { h: 'O juramento', text: [c => `Bateram à porta de ${c.P} numa noite sem lua. ${c.P} não fugiu: ouviu o que tinham a dizer. Agora também tem um manto.`, c => `Em vez de calar ${c.P}, ${c.SOC} ${c.o === 'a' ? 'a' : 'o'} chamou para dentro. ${c.P} aceitou.`] });
  K('tt-morto', { h: 'O silêncio', text: [c => `${c.P} foi encontrad${c.o} mort${c.o}. Viu o que não devia, e quem ${c.o === 'a' ? 'a' : 'o'} matou foi ${c.KILLER}. Ninguém sabe disso — só você.`] });
  K('tt-caiu', { h: 'A luz', text: [c => `Por causa do que ${c.P} viu, ${c.SOC} foi descobert${c.SOCo}. ${c.P} dorme melhor agora.`] });
  K('tt-paz', { h: 'O esquecimento', text: [c => `Os dias passaram, e ninguém veio. ${c.P} nunca mais saiu de casa depois que escurece.`, c => `${c.P} decidiu que não viu nada. É mais fácil viver assim.`] });
  function ttCtx(s, x) {
    const sid = s.data.soc; const q = G.Secrets && G.Secrets.get(sid); const l = q && q.lodges.find(y => y.id === s.data.lodge);
    const where = l ? l.name.replace(/^(uma|um|o|a) /, (w, a) => ({ uma: 'numa ', um: 'num ', o: 'no ', a: 'na ' })[a]) : 'no escuro';
    return Object.assign({ WHERE: where, BLOOD: s.data.blood, SOC: socArt(sid), SOCo: /^(A|As) /.test(socName(sid)) ? 'a' : 'o', RULER: styled(s.data.fac) }, x || {});
  }
  St.define('testemunha', {
    name: 'O Que Viu na Noite', icon: 'eye', tone: 'sombrio', tags: ['segredo', 'medo'], struct: 'segredo-ameaca', seedLife: 2, maxDays: 16, ripe: 0.2,
    stages: [['noite', 'A noite'], ['medo', 'Os passos'], ['fim', 'O que ficou']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'tragica' ? -1 : 2; return s.data.followed ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p))} viu, numa noite sem lua, o que uma ordem secreta faz ${ttCtx(s).WHERE} — e agora alguém sabe que foi vist${c.o === 'a' ? 'a' : 'o'}.`,
    on: {
      testemunha(f) { const v = P(f.a); if (!v || v.dead || v.age < 10) return null; return [{ protag: v.id, score: 0.62 + (f.blood ? 0.3 : 0), keyExtra: 'tt' + f.soc + '-' + f.a, cast: {}, data: { soc: f.soc, lodge: f.lodge, fac: f.fac, blood: f.blood }, place: { kind: 'segredo', name: '', x: f.x, y: f.y }, motifs: ['gatilho:segredo', 'clima:noite'] }]; },
    },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'medo'; St.beat(s, 'tt-viu', ttCtx(s), { x: s.place ? s.place.x : undefined, y: s.place ? s.place.y : undefined }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead || !G.Secrets) return;
      const w = G.Secrets.witnessOf(s.data.soc, p.id);
      if (w && w.hunter && !s.data.followed) { s.data.followed = 1; St.beat(s, 'tt-seguid', ttCtx(s)); }
      if (w && w.done && w.fate === 'comprar' && !s.data.bought) { s.data.bought = 1; St.finish(s, 'abandonada', 'agridoce', St.say(s, 'tt-comprad', ttCtx(s))); return; }
      if (w && w.done && w.fate === 'fala' && !s.data.told) { s.data.told = 1; St.beat(s, 'tt-contou', ttCtx(s)); }
      if (G.S.day - s.born >= 12 && !(w && w.hunter && !w.done)) St.finish(s, 'cumprida', 'sereno', St.say(s, 'tt-paz', ttCtx(s)));
    },
    react(s, f) {
      const me = s.protag;
      if (f.k === 'silenciado' && f.a === me) { St.finish(s, 'tragica', 'tragico', St.say(s, 'tt-morto', ttCtx(s, { KILLER: (P(f.b) || {}).name || 'alguém de capuz' })), { x: f.x, y: f.y, log: false, big: 1, legend: true }); return true; }
      if (f.k === 'iniciacao' && f.a === me && f.soc === s.data.soc) { St.finish(s, 'transformada', 'agridoce', St.say(s, 'tt-jurou', ttCtx(s))); return true; }
      if (f.k === 'inquerito' && f.accuser === me) { St.beat(s, 'tt-denuncia', ttCtx(s)); s.data.inq = f.inq; return true; }
      if (f.k === 'exposto' && f.soc === s.data.soc) { St.finish(s, 'cumprida', 'feliz', St.say(s, 'tt-caiu', ttCtx(s)), { log: true, big: 1 }); return true; }
      if (f.k === 'morte' && f.a === me) { St.finish(s, 'interrompida', 'sereno', `${(P(me) || {}).name} ${deathTxt(me)}, levando o que viu.`); return true; }
      return false;
    },
    goal: () => 'Sobreviver ao que viu.',
    status(s, c) { return s.data.followed ? `Alguém segue ${c.P} quando a rua esvazia.` : s.data.told ? `${c.P} contou o que viu. A cidade cochicha.` : `${c.P} não contou a ninguém — ainda.`; },
    obstacles: s => [ttCtx(s).SOC],
    open: () => ['ser silenciado', 'ser comprado', 'jurar o manto', 'contar tudo'],
    titles: {
      viu: () => 'O Que Viu na Noite',
      capuz: () => 'Os Capuzes',
      olhos: c => `Os Olhos de ${c.P}`,
    },
    forgotten: () => 'Ninguém mais falou daquela noite.',
  });

  // ====================================================================================
  //  O INQUÉRITO — finding an order that meets in secret, if it exists at all
  // ====================================================================================
  K('iq-ordem', { h: 'A ordem', text: [
    c => `${c.RULER} chamou ${c.P} ao palácio: "Dizem que ${c.WHAT} se reúne em segredo. Descubra se é verdade."`,
    c => `${c.P} recebeu a ordem de ${c.RULER}: achar ${c.WHAT}, se existir. Começou pelas tavernas e pelas fofocas da fonte.`,
  ] });
  K('iq-pista', { h: 'A pista', text: [c => `Uma velha contou a ${c.P} que viu luzes de noite fora da cidade. É pouco, mas é alguma coisa.`, c => `${c.P} achou cera de vela onde não devia haver ninguém.`] });
  K('iq-nome', { h: 'Um nome', text: [c => `Alguém sussurrou um nome a ${c.P}. Um nome importante demais para ser dito em voz alta.`, c => `As perguntas de ${c.P} começaram a incomodar gente poderosa. É sinal de que está perto.`] });
  K('iq-vigia', { h: 'A vigília', text: [c => `${c.P} passou a vigiar de noite, escondid${c.o} entre as árvores.`] });
  K('iq-achou', { h: 'Os capuzes', text: [
    c => `${c.P} seguiu os mantos no escuro e chegou ao lugar. ${cap1(c.WHAT)} existe — e agora tem nomes.${c.CAUGHT ? ' ' + c.CAUGHT + ' foram presos.' : ''}`,
    c => `${c.P} encontrou ${c.WHAT}. Tudo o que diziam era verdade.${c.CAUGHT ? ' ' + c.CAUGHT + ' irão ao cadafalso.' : ''}`,
  ] });
  K('iq-morto', { h: 'Perguntas demais', text: [c => `${c.P} foi encontrad${c.o} mort${c.o}. Perguntou demais. Quem fez foi ${c.KILLER}, de ${c.WHAT} — só você sabe.`] });
  K('iq-nada', { h: 'Nada', text: [c => `${c.P} perguntou por toda parte, vigiou noites inteiras, e não achou nada. Talvez nunca tenha havido nada para achar.`, c => `O inquérito de ${c.P} terminou sem nenhum nome. ${c.WHAT} — se existe — continua no escuro.`] });
  K('iq-bruxas', { h: 'A fogueira', text: [c => `${c.P} não achou ${c.WHAT}. Mas ${c.RULER} precisava de culpados, e ${c.ACC} ${c.ACCn > 1 ? 'foram' : 'foi'} à fogueira mesmo assim. ${c.P} viu tudo da primeira fila.`] });
  function iqCtx(s, x) { return Object.assign({ RULER: styled(s.data.fac), WHAT: s.data.what || (s.data.soc ? socArt(s.data.soc) : s.data.fake ? (G.Secrets ? G.Secrets.art(s.data.fake) : s.data.fake) : 'uma seita') }, x || {}); }
  St.define('inquerito', {
    name: 'O Inquérito', icon: 'book', tone: 'misterio', tags: ['segredo', 'poder'], struct: 'investigacao', seedLife: 2, maxDays: 14, ripe: 0.1,
    stages: [['ordem', 'A ordem'], ['pistas', 'As pistas'], ['noite', 'A vigília'], ['fim', 'A verdade']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return s.data.c3 ? 2 : s.data.c1 ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p))} recebeu de ${iqCtx(s).RULER} a ordem de descobrir ${iqCtx(s).WHAT} — se ela existe.`,
    on: { inquerito(f) { const v = P(f.a); if (!v || v.dead) return null; return [{ protag: v.id, score: 0.78, keyExtra: 'iq' + f.inq, cast: {}, data: { fac: f.fac, soc: f.soc, fake: f.fake, inq: f.inq, what: f.what }, motifs: ['gatilho:inquerito', 'clima:segredo'] }]; } },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'perguntas'; St.beat(s, 'iq-ordem', iqCtx(s)); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead || !G.Secrets) return;
      const i = G.Secrets.inquiry(s.data.inq);
      if (!i) { if (G.S.day - s.born >= 1 && !s.data.out) St.finish(s, 'fracassada', 'sereno', St.say(s, 'iq-nada', iqCtx(s))); return; }
      if (i.clue >= 0.3 && !s.data.c1) { s.data.c1 = 1; St.beat(s, 'iq-pista', iqCtx(s)); }
      if (i.clue >= 0.6 && !s.data.c2) { s.data.c2 = 1; St.beat(s, 'iq-nome', iqCtx(s)); }
      if (i.clue >= 0.8 && !s.data.c3 && s.data.soc) { s.data.c3 = 1; s.phase = 'vigilia'; St.beat(s, 'iq-vigia', iqCtx(s)); }
    },
    react(s, f) {
      const me = s.protag;
      if (f.k === 'exposto' && f.a === me) { s.data.out = 1; St.finish(s, 'cumprida', 'feliz', St.say(s, 'iq-achou', iqCtx(s, { CAUGHT: names(f.ids || []) })), { x: f.x, y: f.y, log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'silenciado' && f.a === me) { s.data.out = 1; St.finish(s, 'tragica', 'tragico', St.say(s, 'iq-morto', iqCtx(s, { KILLER: (P(f.b) || {}).name || 'alguém de capuz' })), { x: f.x, y: f.y, big: 1, legend: true }); return true; }
      if (f.k === 'caca-bruxas' && f.a === me) { s.data.out = 1; St.finish(s, 'transformada', 'tragico', St.say(s, 'iq-bruxas', iqCtx(s, { ACC: names(f.ids || []), ACCn: (f.ids || []).length })), { log: true, big: 1 }); return true; }
      if (f.k === 'morte' && f.a === me) { s.data.out = 1; St.finish(s, 'interrompida', 'sereno', `${(P(me) || {}).name} ${deathTxt(me)} antes de terminar o inquérito.`); return true; }
      return false;
    },
    goal: (s, c) => `Descobrir ${iqCtx(s).WHAT}.`.replace(c.P, c.P),
    status(s) { const i = G.Secrets && G.Secrets.inquiry(s.data.inq); const k = i ? i.clue : 0; return k < 0.3 ? 'Ainda só há fofocas.' : k < 0.6 ? 'Há uma pista.' : k < 0.8 ? 'Há um nome.' : 'Agora é vigiar, de noite.'; },
    obstacles: () => ['o silêncio da cidade', 'gente poderosa'],
    open: () => ['achar a seita', 'não achar nada', 'perguntar demais', 'culpar inocentes'],
    titles: { inq: () => 'O Inquérito', quem: c => `As Perguntas de ${c.P}`, sombra: () => 'Atrás dos Capuzes' },
    forgotten: () => 'O inquérito foi arquivado e esquecido.',
  });

  // ====================================================================================
  //  A CAUSA — the merchants answer the seizure
  // ====================================================================================
  K('cm-confisco', { h: 'O confisco', text: [
    c => `Os guardas de ${c.RULER} entraram na casa de ${c.P} e levaram o que havia no cofre. ${c.P} viu a bandeira da família ser arrancada da porta.`,
    c => `"Agora tudo é d${c.RG}", disseram os guardas, levando as moedas de ${c.P}. ${c.P} não disse nada — ainda.`,
  ] });
  K('cm-recusa', { h: 'A porta fechada', text: [c => `${c.RULER} mandou os mercadores de volta para casa sem nada. ${c.P}, que falou por eles, guardou cada palavra.`] });
  K('cm-trama', { h: 'A mesa', text: [
    c => `À noite, nos fundos de uma loja, ${c.P} reuniu ${c.PARTY || 'os outros mercadores'}. Falaram de dinheiro — e de quem deveria mandar nele.`,
    c => `Os mercadores voltaram a se reunir: ${c.P}${c.PARTY ? ', ' + c.PARTY : ''}. Desta vez, falaram de armas.`,
  ] });
  K('cm-motim', { h: 'O ouro e as tochas', text: [c => `Com o dinheiro dos mercadores, as tochas apareceram. ${c.P} pagou a quem quisesse gritar na praça.`] });
  K('cm-levante', { h: 'A revolução', text: [c => `Os mercadores não pediram mais: ${c.P} pôs ${c.PARTY || 'os seus'} na rua, com o povo atrás.`] });
  K('cm-vitoria', { h: 'A vitória', text: [c => `${c.RULER} devolveu o comércio a quem trabalha. ${c.P} pendurou de novo a bandeira da família na porta.`, c => `As bandeiras dos mercadores voltaram às portas. ${c.P} ganhou.`] });
  K('cm-regime', { h: 'O conselho', text: [c => `${c.FAC} é agora ${c.GOV}. Quem tem ouro tem voz — e ${c.P} tem os dois.`] });
  K('cm-fim', { h: 'O fim', text: [c => `${c.P} ${c.DEATH}, e a causa dos mercadores perdeu sua voz mais alta.`] });
  K('cm-executado', { h: 'O cadafalso', text: [c => `${c.P} foi ${c.DONE} na praça. Os outros mercadores fecharam as lojas naquele dia.`] });
  function cmCtx(s, x) { const r = rulerOf(s.data.fac); const f = G.Fac.get(s.data.fac); return Object.assign({ RULER: styled(s.data.fac), RG: r && r.g === 'f' ? 'a rainha' : 'o rei', PARTY: partyNames(s), FAC: f ? f.name : '', DONE: doneTo(s.data.method2, P(s.protag)) }, x || {}); }
  St.define('causa', {
    name: 'A Causa dos Mercadores', icon: 'scale', tone: 'epico', tags: ['comércio', 'política', 'grupo'], struct: 'perda-retomada', seedLife: 4, maxDays: 50, ripe: 0.5,
    stages: [['perda', 'O confisco'], ['mesa', 'A mesa'], ['acao', 'A ação'], ['fim', 'A causa']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return s.data.acted ? 2 : (s.data.meet || 0) ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p))} viu ${s.data.why === 'recusa' ? 'o pedido dos mercadores ser negado' : 'o cofre da família ser levado pelos guardas'} — e decidiu que o trono vai devolver.`,
    on: {
      estatizacao(f) {
        const fac = G.Fac.get(f.fac); const g = fac && fac.grp && fac.grp.mercadores; const v = g && P(g.lead); if (!v || v.dead || v.captive) return null;
        return [{ protag: v.id, score: 0.62 + pe(v).amb * 0.3, keyExtra: 'cm' + f.fac + '-' + G.S.day, cast: {}, data: { fac: f.fac, why: 'confisco' }, motifs: ['gatilho:confisco', 'clima:politica'] }];
      },
      'peticao-resposta'(f) {
        if (f.ok || f.grp !== 'mercadores') return null; const v = P(f.a); if (!v || v.dead || v.captive || f.arrest) return null;
        return [{ protag: v.id, score: 0.55 + pe(v).amb * 0.3, keyExtra: 'cr' + f.fac + '-' + G.S.day, cast: {}, data: { fac: f.fac, why: 'recusa' }, motifs: ['gatilho:peticao', 'clima:politica'] }];
      },
    },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'mesa'; St.beat(s, s.data.why === 'recusa' ? 'cm-recusa' : 'cm-confisco', cmCtx(s)); },
    urge(s, v) { if (s.phase !== 'mesa' || !(G.S.time > 0.62 || G.S.time < 0.04) || G.S.day === (s.data.lastMeetDay || -1) || (s.data.meet || 0) >= 3) return 0; return 0.3; },
    task(s, v, H) {
      const h = G.Eco.homeOf(v); const fr = h ? G.Village.frontTile(h) : null; if (!fr) return null;
      s.data.lastMeetDay = G.S.day;
      return St.go(s, v, H, { x: fr[0] + 0.6, y: fr[1] + 0.8, sub: 'trama', dur: 12, act: 'talk', max: 120 });
    },
    arrive(s, v, t) { if (t.sub !== 'trama') return; s.data.meet = (s.data.meet || 0) + 1; St.beat(s, 'cm-trama', cmCtx(s), { x: v.x, y: v.y }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead || s.data.acted) return;
      if ((s.data.meet || 0) < 2 || G.S.time < 0.35 || G.S.time > 0.6 || G.S.day === s.data.lastMeetDay) return;
      const f = G.Fac.get(s.data.fac); const set = G.S.settlements.get(p.set); if (!f || !set || !f.alive) return;
      s.data.acted = 1; s.phase = 'acao';
      const q = pe(p);
      if (q.amb > 0.65 && set.loyalty < 35 && party(s).length >= 2 && G.Polity && G.Polity.uprising(f, p, ['mercadores', 'artesaos', 'povo'], G.Polity.available(f, 'oligarquia') ? 'oligarquia' : 'conselho', 'pelo direito de comerciar')) { St.beat(s, 'cm-levante', cmCtx(s), { log: true, big: 1 }); return; }
      const R = G.Riots && G.Riots.start(f, set, 'estatizar', { lead: p.id, boost: 0.3 });
      if (R) { s.data.riot = R.id; St.beat(s, 'cm-motim', cmCtx(s), { x: R.x, y: R.y, log: true }); return; }
      St.finish(s, 'abandonada', 'agridoce', `${p.name} esperou o povo — mas o povo não veio pelos mercadores. As lojas reabriram, mais pobres.`);
    },
    react(s, f) {
      const me = s.protag;
      if (f.k === 'decisao' && f.fac === s.data.fac && /^(privatizar|econ:livre|conselho)$/.test(f.pk || '')) { St.finish(s, 'cumprida', 'feliz', St.say(s, 'cm-vitoria', cmCtx(s)), { log: true, toast: true, big: 1 }); return true; }
      if (f.k === 'regime' && f.fac === s.data.fac && ['oligarquia', 'republica', 'parlamento'].includes(f.gov)) { St.finish(s, 'cumprida', 'feliz', St.say(s, 'cm-regime', cmCtx(s, { GOV: GOVNAME(f.fac, f.gov) })), { log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'motim-fim' && f.riot === s.data.riot && f.how === 'esmagado') { s.phase = 'mesa'; s.data.acted = 0; s.data.meet = 0; St.chapter(s, `A guarda esmagou o motim que os mercadores pagaram. ${(P(me) || {}).name} conta as moedas que sobraram.`); return true; }
      if (f.k === 'executado' && inIds(f, me)) { s.data.method2 = f.method; St.finish(s, 'tragica', 'tragico', St.say(s, 'cm-executado', cmCtx(s)), { log: true, big: 1 }); return true; }
      if (f.k === 'morte' && f.a === me && !byScaffold(f)) { St.finish(s, 'interrompida', 'sereno', St.say(s, 'cm-fim', cmCtx(s, { DEATH: deathTxt(me) }))); return true; }
      return false;
    },
    goal: () => 'Devolver o comércio a quem trabalha nele.',
    status(s, c) { return s.data.acted ? 'Os mercadores agiram.' : (s.data.meet ? `${s.data.meet} reuniões na mesa dos fundos.` : 'Por enquanto, só raiva.') + (partyNames(s) ? ` Com ${c.P}: ${partyNames(s)}.` : ''); },
    obstacles: () => ['a guarda', 'o povo, que não ama os ricos'],
    open: () => ['a volta do livre comércio', 'um conselho de mercadores', 'o cadafalso'],
    titles: { causa: () => 'A Causa dos Mercadores', bandeira: c => `A Bandeira de ${c.P}`, ouro: () => 'Ouro Contra o Trono' },
    forgotten: () => 'Os mercadores aprenderam a viver com menos.',
  });

  // ====================================================================================
  //  A CONSPIRAÇÃO — a knife for the throne
  // ====================================================================================
  K('cs-plano', { h: 'O plano', text: [
    c => `${c.P} juntou os que odeiam ${c.RULER} tanto quanto ${c.ele}. ${c.SECRET ? 'Por trás, em silêncio, ' + c.SECRET + ' — mas isso só você sabe.' : 'Não há volta.'}`,
    c => `A faca está afiada. ${c.P} e os seus vão atrás de ${c.RULER}${c.SECRET ? ', com o ouro ' + c.SECRETde + ' por trás' : ''}.`,
  ] });
  K('cs-trono', { h: 'O trono', text: [c => `${c.P} tomou o trono de ${c.FAC}. Lavaram o sangue do chão antes da coroação.`, c => `${c.P} agora governa ${c.FAC}. Quem tentou impedir, não está mais aqui para contar.`] });
  K('cs-preso', { h: 'A cela', text: [c => `O golpe falhou. ${c.P} foi pres${c.o}.`] });
  K('cs-executado', { h: 'O cadafalso', text: [c => `${c.P} foi ${c.DONE} por traição. ${c.RULER} assistiu de perto.`] });
  K('cs-morto', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} no golpe, sem chegar ao trono.`] });
  function csCtx(s, x) { const f = G.Fac.get(s.data.fac); const sid = s.data.secret; return Object.assign({ RULER: s.data.rulerName || styled(s.data.fac), FAC: f ? f.name : '', SECRET: sid ? socArt(sid) : '', SECRETde: sid ? socArt(sid, 'de') : '', DONE: doneTo(s.data.method2, P(s.protag)) }, x || {}); }
  St.define('conspiracao', {
    name: 'A Conspiração', icon: 'crown', tone: 'sombrio', tags: ['poder', 'traição'], struct: 'golpe', seedLife: 1, maxDays: 10, ripe: 0,
    stages: [['plano', 'O plano'], ['golpe', 'O golpe'], ['fim', 'O trono']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 2 : -1; return 1; },
    logline: (s, c) => `${cap1(desc(c.p))} quer o trono de ${csCtx(s).RULER}${s.data.secret ? ' — e não está sozinh' + c.o : ''}.`,
    on: { trama(f) { const v = P(f.a); if (!v || v.dead) return null; return [{ protag: v.id, score: 0.7, keyExtra: 'cs' + f.fac + '-' + G.S.day, cast: {}, data: { fac: f.fac, goal: f.goal, secret: f.secret, rulerName: styled(f.fac) }, motifs: ['gatilho:golpe', 'clima:politica'] }]; } },
    valid: sd => alive(sd.protag),
    begin(s) { s.phase = 'golpe'; St.beat(s, 'cs-plano', csCtx(s)); },
    react(s, f) {
      const me = s.protag;
      if (f.k === 'coroa' && f.a === me) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'cs-trono', csCtx(s)), { log: true, toast: true, big: 1, legend: true }); return true; }
      if (f.k === 'coroa' && f.fac === s.data.fac && f.a !== me) { St.finish(s, 'fracassada', 'sombrio', `Outro subiu ao trono de ${csCtx(s).FAC}. A conspiração de ${(P(me) || {}).name} ficou sem razão de ser.`); return true; }
      if ((f.k === 'sentenca' || f.k === 'preso') && inIds(f, me) && s.phase !== 'preso') { s.phase = 'preso'; St.beat(s, 'cs-preso', csCtx(s)); return true; }
      if (f.k === 'executado' && inIds(f, me)) { s.data.method2 = f.method; St.finish(s, 'tragica', 'tragico', St.say(s, 'cs-executado', csCtx(s)), { log: true, big: 1, legend: true }); return true; }
      if (f.k === 'morte' && f.a === me && !byScaffold(f)) { St.finish(s, 'tragica', 'tragico', St.say(s, 'cs-morto', csCtx(s, { DEATH: deathTxt(me) }))); return true; }
      return false;
    },
    tick(s) { const f = G.Fac.get(s.data.fac); if (s.phase === 'golpe' && f && !f.coup && G.S.day - s.born >= 2) St.finish(s, 'fracassada', 'sombrio', 'O golpe se desfez antes de começar de verdade.'); },
    goal: (s, c) => `Tomar o trono de ${csCtx(s).RULER}.`.replace(c.P, c.P),
    status: s => (s.phase === 'preso' ? 'O golpe falhou.' : 'O golpe está em curso.'),
    obstacles: () => ['a guarda do palácio'],
    open: () => ['o trono', 'o cadafalso'],
    titles: { faca: () => 'A Faca e a Coroa', golpe: c => `O Golpe de ${c.P}`, sombra: () => 'A Mão por Trás do Trono' },
    forgotten: () => 'Ninguém mais fala da conspiração.',
  });
})(window.G);
