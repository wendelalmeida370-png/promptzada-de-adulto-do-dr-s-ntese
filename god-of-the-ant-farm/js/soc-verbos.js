// soc-verbos: the body's social hands (SOCIEDADE.md; the study §4.9; 22b D-628 to D-631). Beside the word (the E: talk, Interact) the
// player can greet, praise, kiss; argue, insult, threaten; invite to a drink; ask for help, ask what is said, propose, make peace
// (and hug one who is fond of the body — Interact.canHug —, and take an orphan in: soc-tutela.js). Each is a verb of a person
// (Interact.verb('pessoa', …): the card's buttons, its number keys and the touch), asked by the hands and done by the world in its
// step (Possess.apply), where the other answers by who they are and what they feel — the temperament (G.Indole), the ties and the
// marks (G.Lacos), the name the body has in their town (G.Fama.recebe), who is watching —, never by the look nor the people (rule
// 194), and never by a draw: the words by the hash of the two and the day. A friend of the body near an argument takes its side.
// What the body did is counted (Possess.deed) and lives in the ties of both, as anyone's would.
(function (G) {
  'use strict';
  const SV = G.SocVerbos = {};
  const L = () => G.Lacos, I = () => G.Indole, F = () => G.Fama;
  const S_ = () => G.S;
  // (in the world's tiles — four metres each: the reach of a word is one, a friend's ear two and a half)
  // (where one is: in a room, at one's place — the world keeps the door's point in v.x, v.y: G.Interiors.posOf, the wave 4 I, D-917)
  const at = v => (G.Interiors && G.Interiors.posOf ? G.Interiors.posOf(v) : [v.x, v.y, 0]);
  const near = (a, b, t) => { const p = at(a), q = at(b); return G.dist(p[0], p[1], q[0], q[1]) <= t; };
  // (one in the body's own room — the tavern it sits in, its house —, there to be spoken to where they are: L-2170)
  const room = (o, me) => !!o.inside && o.inside === me.inside;
  // (the two at the tables of an open tavern: the body's there, by the tavern's own reading — G.Taverna.corpo)
  const atTav = (o, me) => room(o, me) && !!(G.Taverna && G.Taverna.corpo && G.Taverna.convida && G.Taverna.corpo(me));
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const who = (me, o) => G.Possess.knows.call(me, o), Who = (me, o) => G.cap(who(me, o)), ao = (me, o) => G.Possess.knows.ao(me, o); // (ao: after «a», «ao mineiro»)
  const pick = (o, me, arr, n) => arr[Math.floor(G.hash(o.id * 131 + me.id * 7 + S_().day * 3 + (n || 0)) * arr.length)];
  // (whether the other knows the body by name: a tie, or the family)
  const knowsMe = (o, me) => !!(L().find(o, me.id) || L().kin(o, me));
  const nameFor = (o, me) => (knowsMe(o, me) ? me.name : '');
  // (the body's time, for how long the other answers: the hands give it with the asking — SV.faz —, the world keeps none)
  let K = 0.27;

  // ------------------------------ the readings (pure) ------------------------------
  // who is looking: the awake people of twelve or more within six metres of the two (the shame and the pride of being seen)
  SV.olhos = function (o, me) {
    let n = 0; const r2 = 1.5 * 1.5; const q = at(o);
    // (in a room, the ones in it: the tavern's tables look on as the street does — L-2172)
    for (const p of S_().villagers.values()) { if (p === o || p === me || p.sleeping || p.age < 12 || (p.inside && p.inside !== o.inside) || (!p.inside && o.inside)) continue; const w = p.inside ? at(p) : [p.x, p.y]; if (G.dist2(w[0], w[1], q[0], q[1]) < r2) n++; }
    return n;
  };
  // how the other reads the body now: what they feel (the kin's base and what life did), the name the body has in their town, the
  // offence they keep, and who they are
  SV.leitura = function (o, me) {
    const s = L().sente(o, me) || { afeto: 0, confianca: 0, respeito: 0, atracao: 0, kin: null, rotulos: [] };
    const fr = F() ? F().recebe(o, me) : { sabe: false, estima: 0 };
    const Ix = I(); const fa = k => Ix.faceta(o, k), ax = k => Ix.ax(o, k) / 99;
    return { s, af: s.afeto + (fr.sabe ? fr.estima * 0.3 : 0), fr, ferida: L().ferida(o, me), olhos: SV.olhos(o, me),
      ag: fa('agressivo'), emp: fa('empatico'), des: fa('desconfiado'), imp: fa('impulsivo'), gen: fa('generoso'), conf: fa('confiante'), ran: fa('rancoroso'),
      ext: ax('ext'), neu: ax('neu'), ama: ax('ama'), hum: Ix.humor(o) };
  };
  const adult = v => v.age >= 16;
  const canLove = (a, b) => adult(a) && adult(b) && a.g !== b.g && !G.Vg.relatedClose(a, b);
  // (the body, and the other there to be spoken to)
  function base(me, o) {
    if (!me || !o || !S_().villagers.has(o.id) || o.id === me.id) return { ok: false, why: 'Não está mais aqui.' };
    if (o.sleeping) return { ok: false, why: `${Who(me, o)} está dormindo.` };
    if (o.age < 4) return { ok: false, why: `${Who(me, o)} é pequen${oa(o)} demais.` };
    if ((o.inside && !room(o, me)) || o.aboard || o.held || o.air || o.jail || o.ug || o.captive) return { ok: false, why: `Agora não dá com ${who(me, o)}.` };
    if (o.task && o.task.pri > 1.2 && !(o.task.type === 'resposta' && o.task.id === me.id)) return { ok: false, why: `${Who(me, o)} está ocupad${oa(o)} com algo que não pode esperar.` };
    if (!near(me, o, 1)) return { ok: false, why: 'Longe demais.' };
    return { ok: true };
  }
  const OK = { ok: true };

  // ------------------------------ what the world does (only in its step) ------------------------------
  // the other turns to the body and answers: an act of the vocabulary, a word over the head
  function responde(o, me, act, fala, dur) {
    const a = G.SocAtos.has(act) ? act : 'talk';
    // (one in a room answers from their place, with the word only: the answer's errand walks one indoors out by the door first, and
    // the one greeted at the tavern's table went home — L-2171)
    if (!o.inside) { G.faceTo(o, me.x - o.x, me.y - o.y);
      if (!o.task || o.task.pri <= 1.2 || o.task.type === 'resposta') G.Vg.setTask(o, { type: 'resposta', id: me.id, act: a, pri: 1.15, wait: (dur || 3) * K, kind: 'talk' }); }
    if (fala && G.Talk) G.Talk.say(o, fala, { dur: 3.5 });
  }
  const deed = k => G.Possess.deed(k);
  // a friend of the body near an argument takes its side: the friend most fond of the body, awake, free, within ten metres
  SV.defende = function (me, o) {
    if (!G.inSim) return null; let best = null, bs = 0;
    for (const id of L().de(me, 'amizade')) {
      const f = S_().villagers.get(id); if (!f || f === o || f.sleeping || f.inside || f.age < 14 || f.captive || !near(f, me, 2.5) || (f.task && f.task.pri > 1) || G.Vg.handsBusy(f)) continue;
      const s = (L().sente(f, me) || { afeto: 0 }).afeto; if (s > bs || (s === bs && best && f.id < best.id)) { bs = s; best = f; }
    }
    if (!best) return null;
    L().ato(best, o, 'discussao'); L().marca(me, 'defendeu', best.id, 40);
    G.faceTo(best, o.x - best.x, o.y - best.y);
    G.Vg.setTask(best, { type: 'resposta', id: o.id, act: 'argue', pri: 1.1, wait: 3 * K, kind: 'talk' });
    if (G.Talk) G.Talk.say(best, `Deixa ${nameFor(best, me) || 'essa pessoa'} em paz!`, { dur: 3 });
    return best;
  };
  // a kiss with another than one's partner, seen (by the partner near, or by anyone looking): a betrayal — the partner keeps it (the
  // mark «traiu», the tie torn), the town will say it (a rumour: the fame follows what is said), and the partner who keeps grudges, or
  // a second time, undoes the couple at its door (D-634)
  SV.traicao = function (quem, com, viu) {
    if (!G.inSim) return false;
    const p = S_().villagers.get(quem.partner); if (!p || p === com) return false;
    const perto = !p.sleeping && !p.inside && near(p, quem, 3);
    if (!perto && !viu) return false;
    L().marca(p, 'traiu', quem.id, 70); L().ato(p, quem, 'separacao');
    if (G.Boatos) G.Boatos.nasce('traicao', { set: quem.set, a: quem.id, b: p.id, q: quem.id, g: quem.g, n: { a: quem.name, b: p.name, c: com.name }, viu: perto ? [p.id] : [], p0: 80 });
    const peso = L().lembra(p, quem.id).filter(m => m[0] === 'traiu').reduce((a, m) => a + m[3], 0);
    if (peso >= 80 || I().faceta(p, 'rancoroso') > 0.6) { G.Vg.unpair(quem, 'traicao'); G.Vg.unpair(p, 'traicao'); if (G.Talk) G.Talk.say(p, 'Acabou entre nós!', { dur: 3 }); }
    else if (G.Talk) G.Talk.say(p, 'Como você pôde?!', { dur: 3 });
    return true;
  };
  // (the one hit back: the other's blow at the body, by the society's door — a brawl, a crime of the world)
  // (in a room, the tavern's own brawl at the tables — the shove and the fists, the keeper who puts the starter out: act-taverna.js —, and
  // no street fight: that one's errand put the one at the table out at the door, to fight the body inside — L-2173; in another room,
  // none: the word stays a word)
  const hits = (o, me) => (o.inside ? !!(room(o, me) && adult(o) && G.Taverna && G.Taverna.briga && G.Taverna.briga(o, me)) : !!(G.Convivio && G.Convivio.agride && adult(o) && G.Convivio.agride(o, me, false)));

  // ------------------------------ the verbs ------------------------------
  const GREET = ['Olá!', 'Bom te ver por aqui.', 'Que bom dia!'];
  const VERBS = [
    { id: 'cumprimentar', anim: 'wave', dur: 1.2, label: (me, o) => `Cumprimentar ${who(me, o)}`, can: base,
      faz(me, o, R) {
        const frio = R.af <= -40 || R.ferida; const quente = R.af >= 20 || (R.ext >= 0.6 && R.af > -20);
        L().ato(me, o, frio ? 'atrito' : 'cumprimento');
        const nm = nameFor(o, me);
        responde(o, me, frio ? 'nod' : 'greet', frio ? '' : quente ? pick(o, me, nm ? [`Olá, ${nm}!`, `Bom te ver, ${nm}.`] : GREET) : 'Bom dia.', 2);
        deed('cumprimento');
        return { ok: true, say: frio ? `${Who(me, o)} mal responde ao seu cumprimento.` : `${Who(me, o)} responde ao seu cumprimento.` };
      } },
    { id: 'elogiar', anim: 'talk', label: (me, o) => `Elogiar ${who(me, o)}`, can: base,
      faz(me, o, R) {
        const cre = R.af + 30 * R.ama - 40 * R.des + (R.fr.sabe ? R.fr.estima * 0.2 : 0) > -10 && !R.ferida;
        if (cre) { L().ato(me, o, 'elogio'); responde(o, me, 'laugh', pick(o, me, [`Obrigad${oa(o)}!`, 'Que gentileza.', 'Você acha mesmo?']), 2.5); }
        else { L().ato(me, o, 'lisonja'); responde(o, me, 'disagree', pick(o, me, ['O que você quer de mim?', 'Sei…', 'Elogio de graça, desconfio.']), 2.5); }
        deed('elogio');
        return { ok: true, say: cre ? `${Who(me, o)} gosta do elogio.` : `${Who(me, o)} desconfia do elogio.` };
      } },
    { id: 'beijar', anim: 'hug', dur: 1.6, label: (me, o) => (adult(me) && adult(o) && !G.Vg.relatedClose(me, o) ? `Beijar ${who(me, o)}` : ''), can: base,
      faz(me, o, R) {
        const par = o.partner === me.id; const quer = par || (R.s.atracao >= 40 && R.af >= 25 && !R.ferida);
        const timido = !par && R.olhos >= 3 && R.ext < 0.35;
        if (quer && !timido) {
          L().ato(me, o, 'beijo'); responde(o, me, 'kiss', '', 2.5); G.Vg.emote(o, 'heart', 2); G.Vg.emote(me, 'heart', 2); deed('beijo');
          // (one of the two with a partner: a betrayal, if the partner or anyone saw it)
          const trai = (o.partner && o.partner !== me.id && SV.traicao(o, me, R.olhos > 0)) | (me.partner && me.partner !== o.id && SV.traicao(me, o, R.olhos > 0));
          if (trai) return { ok: true, say: `Você e ${who(me, o)} se beijam — e alguém viu.` };
          return { ok: true, say: `Você e ${who(me, o)} se beijam.` };
        }
        L().ato(me, o, 'recusa');
        if (timido) { responde(o, me, 'refuse', 'Aqui não… tem gente olhando.', 2.5); return { ok: true, say: `${Who(me, o)} se afasta, envergonhad${oa(o)}.` }; }
        if (R.af < 0 || R.ag > 0.6) { L().ato(me, o, 'insulto'); responde(o, me, 'shove', 'Como se atreve?!', 2); return { ok: true, say: `${Who(me, o)} empurra você, ofendid${oa(o)}.` }; }
        responde(o, me, 'refuse', 'Não.', 2); return { ok: true, say: `${Who(me, o)} recusa o beijo.` };
      } },
    { id: 'discutir', anim: 'talk', dur: 1.8, label: (me, o) => `Discutir com ${who(me, o)}`, can: base,
      faz(me, o, R) {
        L().ato(me, o, 'discussao'); deed('discussao');
        const sobe = R.ag * 0.6 + R.imp * 0.3 + (R.ferida ? 0.3 : 0) + (R.af < -40 ? 0.2 : 0) - R.emp * 0.3;
        const amigo = SV.defende(me, o);
        if (sobe > 0.75 && !amigo && hits(o, me)) return { ok: true, say: `A discussão esquenta: ${who(me, o)} parte para cima de você!` };
        responde(o, me, 'argue', pick(o, me, ['Você não sabe do que está falando!', 'Isso não é verdade!', 'Quem você pensa que é?']), 5);
        return { ok: true, say: `Você discute com ${who(me, o)}${amigo ? `; ${who(me, amigo)} fica do seu lado` : ''}.` };
      } },
    { id: 'insultar', anim: 'talk', dur: 1.2, label: (me, o) => `Insultar ${who(me, o)}`, can: base,
      faz(me, o, R) {
        L().ato(me, o, 'insulto'); L().marca(o, 'insultou', me.id, 40); deed('insulto');
        // (who saw it thinks less of the body: up to four of the ones looking)
        let k = 0; const r2 = 1.5 * 1.5;
        { const q = at(o); for (const p of S_().villagers.values()) { if (k >= 4) break; if (p === o || p === me || p.sleeping || p.age < 12 || (p.inside && p.inside !== o.inside) || (!p.inside && o.inside)) continue; const w = p.inside ? at(p) : [p.x, p.y]; if (G.dist2(w[0], w[1], q[0], q[1]) >= r2) continue; L().ato(p, me, 'atrito'); k++; } } // (in a room, the ones in it: L-2172)
        const orgulho = R.ag * 0.7 + R.imp * 0.3 + Math.min(4, R.olhos) * 0.05 - R.neu * 0.3;
        const amigo = SV.defende(me, o);
        if (orgulho > 0.7 && !amigo && hits(o, me)) return { ok: true, say: `${Who(me, o)} não engole o insulto e parte para cima de você!` };
        if (orgulho > 0.4) { L().ato(o, me, 'insulto'); responde(o, me, 'insult', pick(o, me, ['Repete isso!', 'Olha quem fala!', 'Vai embora daqui!']), 2.5); return { ok: true, say: `${Who(me, o)} devolve o insulto.` }; }
        responde(o, me, 'cower', '', 2.5); G.Vg.emote(o, 'sad', 2);
        return { ok: true, say: `${Who(me, o)} baixa a cabeça, magoad${oa(o)}.` };
      } },
    { id: 'ameacar', anim: 'talk', dur: 1.2, label: (me, o) => `Ameaçar ${who(me, o)}`, can: base,
      faz(me, o, R) {
        L().ato(me, o, 'ameaca'); L().marca(o, 'ameacou', me.id, 50); deed('ameaca');
        const medo = R.neu * 0.5 + (1 - R.conf) * 0.3 + (o.age < 16 ? 0.4 : 0), brio = R.ag * 0.5 + R.conf * 0.4 + (o.role === 'guerreiro' ? 0.3 : 0);
        if (brio > medo + 0.2) {
          if (brio > medo + 0.5 && hits(o, me)) return { ok: true, say: `${Who(me, o)} não tem medo de você — e ataca!` };
          responde(o, me, 'threaten', pick(o, me, ['Tente, se tiver coragem.', 'Não tenho medo de você.']), 2.5); return { ok: true, say: `${Who(me, o)} encara você, sem medo.` };
        }
        o.fear = Math.min(100, (o.fear || 0) + 25); responde(o, me, 'cower', '', 3); G.Vg.emote(o, 'fear', 2);
        return { ok: true, say: `${Who(me, o)} se encolhe de medo.` };
      } },
    // (at the tavern both are in, the invitation is a cup paid for them there — G.Taverna.convida, the house's: the keeper serves it,
    // the body pays it as it is handed over —; sent off to «the tavern» from inside it, they walked out by the door to come back in, L-2174)
    { id: 'beber', anim: 'talk', label: (me, o) => { if (!adult(o) || !G.Taverna) return ''; if (atTav(o, me)) { const c = G.Taverna.convidaCan(me, o); return c.ok || c.why ? `Pagar uma bebida ${ao(me, o)}${c.ok && c.price ? ` (${c.price})` : ''}` : ''; } return `Convidar ${who(me, o)} para beber`; },
      can(me, o) {
        const c = base(me, o); if (!c.ok) return c;
        if (atTav(o, me)) return G.Taverna.convidaCan(me, o);
        const b = G.Taverna.pick(me); if (!b) return { ok: false, why: 'Não há taverna aberta por perto.' };
        if (G.Taverna.withCoin(b) && G.Eco.purse(me) + 1e-6 < G.Taverna.PRICE.drink) return { ok: false, why: 'Você não tem com que pagar a rodada.' };
        return OK;
      },
      faz(me, o, R) {
        if (atTav(o, me)) { const r = G.Taverna.convida(me, o.id); if (!r.ok) return r; L().ato(me, o, 'convite'); L().marca(o, 'pagou', me.id, 30); deed('rodada');
          responde(o, me, 'toast', pick(o, me, ['Saúde!', 'À sua!', `Obrigad${oa(o)}!`]), 2); return { ok: true, say: r.msg }; }
        const b = G.Taverna.pick(me); const op = b && G.Taverna.dia(b); if (!b || !op) return { ok: false, why: 'Não há taverna aberta por perto.' };
        const aceita = R.af >= 0 && (R.ext >= 0.3 || R.af >= 20) && !R.ferida && (o.hunger || 0) < 80 && !(o.task && o.task.pri > 0.7 && o.task.type !== 'resposta');
        if (!aceita) { responde(o, me, 'refuse', pick(o, me, ['Hoje não, obrigad' + oa(o) + '.', 'Fica para outro dia.']), 2); return { ok: true, say: `${Who(me, o)} agradece, mas não vai.` }; }
        // (the round is the body's: its price from the body's coins to the guest's, in the book — the guest pays at the table with it)
        if (G.Taverna.withCoin(b) && !G.Eco.spend(me, G.Taverna.PRICE.drink, G.Eco.coinRef(o), 'rodada')) return { ok: false, why: 'Você não tem com que pagar a rodada.' };
        L().ato(me, o, 'convite'); L().marca(o, 'pagou', me.id, 30); deed('rodada');
        if (G.Talk) G.Talk.say(o, pick(o, me, ['Vamos!', 'Boa ideia. Te espero lá.']), { dur: 3 });
        G.Vg.setTask(o, { type: 'tavern', id: b.id, op: op.id, pri: 0.62, st: 0 });
        return { ok: true, say: `${Who(me, o)} aceita e vai para a taverna. A rodada é sua.` };
      } },
    { id: 'ajuda', anim: 'talk', label: (me, o) => (adult(o) ? `Pedir ajuda ${ao(me, o)}` : ''), can: base,
      faz(me, o, R) {
        L().ato(me, o, 'pedido'); deed('pedido');
        if (L().lembra(me, o.id).some(m => m[0] === 'deve')) { responde(o, me, 'refuse', 'Você ainda me deve.', 2); return { ok: true, say: `${Who(me, o)} lembra que você ainda lhe deve.` }; }
        const quer = R.af + R.gen * 40 + R.emp * 20 > 30 && !R.ferida;
        const n = Math.min(2, Math.floor(G.Eco.purse(o) * 0.2 * 100) / 100);
        if (quer && n >= 0.5 && G.Eco.spend(o, n, G.Eco.coinRef(me), 'ajuda')) {
          L().ato(o, me, 'ajuda'); L().marca(me, 'ajudou', o.id, 40); L().marca(me, 'deve', o.id, 50, Math.round(n * 100));
          responde(o, me, 'help', 'Toma, é o que posso.', 2.5);
          return { ok: true, say: `${Who(me, o)} lhe dá ${n} ${n === 1 ? 'moeda' : 'moedas'}.` };
        }
        if (quer) { L().ato(o, me, 'conversa'); responde(o, me, 'console', 'Não tenho o que dar, mas pode contar comigo.', 3); return { ok: true, say: `${Who(me, o)} não tem o que dar, mas escuta você.` }; }
        responde(o, me, 'refuse', pick(o, me, ['Não posso agora.', 'Cada um com os seus problemas.']), 2);
        return { ok: true, say: `${Who(me, o)} não quer ajudar.` };
      } },
    { id: 'novidades', anim: 'talk', label: (me, o) => `Perguntar o que se diz ${ao(me, o)}`, can: base,
      faz(me, o, R) {
        const B = G.Boatos; L().ato(o, me, 'conversa'); deed('novidade');
        if (R.af <= -40) { responde(o, me, 'refuse', 'Não tenho nada para te contar.', 2); return { ok: true, say: `${Who(me, o)} não quer conversa.` }; }
        // (the freshest of what the other knows that the body does not know by name: it does now, in the other's version)
        let best = null, bd = -1;
        if (B) for (const r of B.list()) { if (!B.sabe(o, r) || (me.sabe && me.sabe.some(e => e[0] === r.id))) continue; const w = B.row(r, B.deQuem(o, r)); const d = (w ? w[5] : r.d) * 100 + B.KINDS[r.k].sal; if (d > bd) { bd = d; best = r; } }
        if (best) { const sid = B.deQuem(o, best); B.ensina(me, best, 'ouviu', sid); const t = B.frase(best, sid, 'boato'); responde(o, me, 'tell', t, 5); return { ok: true, say: `${Who(me, o)} conta: «${t}»` }; }
        const f = G.Fac.ofV(o); const pm = F() && f ? F().memoriaPovo(f).filter(m => m[5]).sort((a, b) => b[3] - a[3] || b[2] - a[2])[0] : null;
        if (pm) { const t = `Os velhos ainda contam que ${pm[5]}.`; responde(o, me, 'tell', t, 4); return { ok: true, say: `${Who(me, o)} conta: «${t}»` }; }
        responde(o, me, 'talk', 'Nada de novo por aqui.', 2); return { ok: true, say: `${Who(me, o)} não sabe de nada novo.` };
      } },
    { id: 'casar', anim: 'talk', dur: 1.8, label: (me, o) => (canLove(me, o) && !me.partner && !o.partner ? `Pedir ${who(me, o)} em casamento` : ''),
      can(me, o) { const c = base(me, o); if (!c.ok) return c; if (me.partner || o.partner) return { ok: false, why: 'Um dos dois já tem companhia.' }; if (o.mourn > 0) return { ok: false, why: `${Who(me, o)} está de luto.` }; return OK; },
      faz(me, o, R) {
        deed('pedido-casamento');
        if (me.partner || o.partner) return { ok: false, why: 'Um dos dois já tem companhia.' };
        const sim = R.s.atracao >= 20 && R.af >= 30 && !R.ferida;
        L().ato(me, o, 'corte');
        if (sim) {
          G.Vg.pair(me, o, 'pedido'); S_().stats.couples++;
          if (G.Life) { G.Life.bio(me, 'couple', o.id); G.Life.bio(o, 'couple', me.id); }
          responde(o, me, 'accept', pick(o, me, ['Sim! Mil vezes sim.', 'Achei que você nunca ia pedir.']), 3); G.Vg.emote(o, 'heart', 3); G.Vg.emote(me, 'heart', 3);
          const [a, b] = me.g === 'f' ? [me, o] : [o, me]; if (S_().villagers.size < 35) G.Village.log(`${a.name} e ${b.name} formaram um casal.`, 'heart', me.x, me.y);
          return { ok: true, say: `${Who(me, o)} aceita! Vocês agora são um casal.` };
        }
        L().ato(me, o, 'recusa');
        responde(o, me, 'refuse', R.af >= 10 ? 'Ainda é cedo para isso…' : 'Não. Nem pensar.', 2.5);
        return { ok: true, say: R.af >= 10 ? `${Who(me, o)} acha cedo demais.` : `${Who(me, o)} recusa.` };
      } },
    { id: 'pazes', anim: 'talk', dur: 1.6, label: (me, o) => { const s = L().sente(o, me); return (s && s.afeto < 0) || L().holds(o, me.id) ? `Fazer as pazes com ${who(me, o)}` : ''; }, can: base,
      faz(me, o, R) {
        deed('pazes');
        let peso = 0; for (const m of L().lembra(o, me.id)) if (L().MARCA[m[0]] < 0) peso += m[3];
        const perdoa = R.ama * 0.6 + R.emp * 0.4 - R.ran * 0.5 + (R.af + 100) / 400 - peso / 200 > 0.45;
        if (!perdoa) { responde(o, me, 'refuse', 'Não esqueço o que você fez.', 2.5); return { ok: true, say: `${Who(me, o)} não aceita as pazes.` }; }
        L().ato(me, o, 'reconcilia'); for (const m of L().lembra(o, me.id).slice()) if (L().MARCA[m[0]] < 0 && m[3] < 60) L().desmarca(o, m[0], me.id);
        responde(o, me, 'agree', 'Está bem. Vamos esquecer isso.', 2.5);
        return { ok: true, say: `${Who(me, o)} aceita fazer as pazes.` };
      } },
    { id: 'adotar', anim: 'hug', dur: 1.6, label: (me, o) => (G.Tutela && G.Tutela.orfao(o) && !G.Tutela.de(o) && me.age >= 18 && o.set === me.set ? `Adotar ${who(me, o)}` : ''),
      can(me, o) { const c = base(me, o); if (!c.ok) return c; if (!G.Tutela.pode(me, o)) return { ok: false, why: me.home ? 'Você já tem pequenos demais em casa.' : 'Você não tem uma casa para levá-l' + oa(o) + '.' }; return OK; },
      faz(me, o, R) {
        // (a child old enough to say asks whether it wants to: one it fears, or hates, no)
        if (o.age >= 6 && (R.af <= -20 || L().lembra(o, me.id).some(m => L().MARCA[m[0]] < 0 && m[3] >= 30))) { responde(o, me, 'refuse', 'Não quero ir com você.', 2.5); return { ok: true, say: `${Who(me, o)} não quer ir com você.` }; }
        if (!G.Tutela.adota(me, o, 'corpo')) return { ok: false, why: 'Agora não dá.' };
        deed('adocao'); responde(o, me, 'hug', o.age >= 6 ? 'Eu posso morar com você?' : '', 3); G.Vg.emote(o, 'heart', 3);
        return { ok: true, say: `Você passa a criar ${who(me, o)}. ${o.g === 'f' ? 'Ela' : 'Ele'} vai morar na sua casa.` };
      } },
  ];
  SV.VERBS = VERBS.map(d => d.id);
  SV.def = id => VERBS.find(d => d.id === id) || null;
  // (the words of the deeds, for the card of oneself and the life's record — Possess.DEED)
  const DEEDS = {
    cumprimento: ['cumprimentou', 'pessoa', 'pessoas'], elogio: ['elogiou', 'pessoa', 'pessoas'], beijo: ['beijou', 'vez', 'vezes'],
    discussao: ['discutiu', 'vez', 'vezes'], insulto: ['insultou', 'pessoa', 'pessoas'], ameaca: ['ameaçou', 'pessoa', 'pessoas'],
    rodada: ['pagou', 'rodada', 'rodadas'], pedido: ['pediu ajuda', 'vez', 'vezes'], novidade: ['perguntou o que se diz', 'vez', 'vezes'],
    'pedido-casamento': ['pediu alguém em casamento', 'vez', 'vezes'], pazes: ['tentou fazer as pazes', 'vez', 'vezes'], adocao: ['adotou', 'criança', 'crianças'],
  };
  SV.DEEDS = DEEDS;
  // the world's doing of a verb the hands asked (only in the world's step — Possess.apply, interact.js): the other answers by the
  // reading of now; k the body's time, for how long the answer lasts
  SV.faz = function (id, me, o, k) {
    if (!G.inSim) return { ok: false, why: '' };
    const d = SV.def(id); if (!d || !me || !o || !S_().villagers.has(o.id)) return { ok: false, why: '' };
    const c = d.can(me, o); if (!c.ok) return { ok: false, why: c.why };
    K = k > 0 ? k : 0.27;
    try { return d.faz(me, o, SV.leitura(o, me)); } finally { K = 0.27; }
  };

  // ------------------------------ the answer's task ------------------------------
  // (the other facing the body a moment, in the act of the answer; gone, or too far, or the moment over: back to their day)
  function runResp(v, t, dt, H) {
    const o = S_().villagers.get(t.id); if (!o || G.dist(o.x, o.y, v.x, v.y) > 4) return H.end(v);
    v.act = G.SocAtos.has(t.act) ? t.act : 'talk'; v.path = null; v.moving = false; G.faceTo(v, o.x - v.x, o.y - v.y);
    t.wait -= dt; if (t.wait <= 0) H.end(v);
  }
  const E = G.Eco; const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'resposta') return runResp(v, t, dt, H), true; return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) { if (t && t.type === 'resposta') { const o = G.S.villagers.get(t.id); return o ? `Respondendo a ${o.name}` : 'Respondendo a alguém'; } return oldText(v, t); };
})(window.G);
