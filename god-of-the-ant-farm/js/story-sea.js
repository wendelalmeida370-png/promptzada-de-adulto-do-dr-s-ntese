'use strict';
// ============================================================
//  ALÉM DO HORIZONTE — a voyage, seen from the quay.
//    Someone goes to sea with an expedition the world really sent (for iron,
//    for land, for a rumour, for a ruler's glory, to look for someone the sea
//    kept), and someone stays behind. The story is the two of them:
//      O CHAMADO    why they go, in the words of their own house.
//      O CAIS       the farewell on the quay: something given to carry, a
//                   promise to a child (a thing from the far side), the plank.
//      O MAR        the voyage as the one who sailed lived it — the storm, the
//                   first sight of land, the beast nobody knew, the strangers
//                   on the beach — told beside the expedition's own book.
//      A VIGÍLIA    the ship is late: the quay at dusk, a lamp; and, far away
//                   (only the god sees both), the one who is late.
//      A VOLTA      the plank again: the run, the embrace, what they saw, the
//                   gift for the child, the token given back.
//      A NOTÍCIA    or they died out there, and a shipmate walks up the quay.
//    When the ship never comes home but the sailor lives, on a beach nobody
//    knows, the story waits for them. O NÁUFRAGO is that beach: the marks on
//    a tree, the raft, the strangers, and — maybe — the road home.
//    Nothing is scripted but the staging: storms, reefs, fevers, natives and
//    the way home belong to the expedition, the sea and the world.
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn || !G.Expe || !G.Know) return;
  const X = G.Expe, K = G.Know;
  const L = St.lib; const { desc } = L;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  // "As Velas de Nikos" -> "das Velas de Nikos"; "nas Velas de Nikos"
  const de = t => (!t ? '' : /^(A|O|As|Os) /.test(t) ? t.replace(/^(A|O|As|Os) /, (m, x) => 'd' + x.toLowerCase() + ' ') : 'de ' + t);
  const em = t => (!t ? '' : /^(A|O|As|Os) /.test(t) ? t.replace(/^(A|O|As|Os) /, (m, x) => 'n' + x.toLowerCase() + ' ') : 'em ' + t);
  // "o navio Nike" -> "do navio Nike"
  const deL = t => (t ? t.replace(/^o /, 'do ').replace(/^a /, 'da ').replace(/^os /, 'dos ').replace(/^as /, 'das ') : t);
  const DAY = () => G.DAY_LEN;
  const SK = (k, d) => St.storylet(k, d);
  const ship = id => G.S.ships.find(s => s.id === id) || null;
  const REL_TXT = { companheiro: 'o companheiro', companheira: 'a companheira', filho: 'o filho', filha: 'a filha', mae: 'a mãe', pai: 'o pai', irmao: 'o irmão', irma: 'a irmã' };
  const saga = () => (G.S && G.S.saga) || { stories: [] };
  const carries = (type, id) => saga().stories.some(x => x.st === 'ativa' && x.type === type && x.protag === id);
  // why they go, said the way a house would say it
  const WHY_P = {
    ferro: c => `as forjas de ${c.HOME} estão frias por falta de ferro`,
    ouro: () => `dizem que há ouro numa terra além do mar`,
    terra: c => `não cabe mais gente em ${c.HOME}`,
    pesqueiro: () => `os pesqueiros de perto já não enchem os barcos`,
    povo: () => `contam de um povo do outro lado da água`,
    monstro: () => `os pescadores juram ter visto um monstro lá longe`,
    curiosidade: () => `ninguém sabe o que há depois do horizonte`,
    rival: () => `os vizinhos já mandam navios para longe`,
    gloria: () => `o governante quer o nome gravado no que for descoberto`,
    busca: c => (c.OF ? `${c.OF} não voltou do mar, e alguém tem que ir procurar` : `alguém que se ama não voltou do mar`),
  };
  // what is given on the quay, to carry over the water
  const TOKEN = {
    nordico: ['uma pedra-do-sol, para achar o sol entre as nuvens', 'um amuleto de Njord, de osso de baleia', 'uma trança de cabelo amarrada com fio vermelho'],
    grego: ['uma moeda para Poseidon, para jogar se o mar ficar bravo', 'um olho pintado num caco, como os que vão na proa', 'uma fita azul do festival'],
    romano: ['uma estatueta de Netuno do tamanho de um dedo', 'um anel de ferro do casamento', 'uma moeda velha com o rosto do avô'],
    egipcio: ['um amuleto de Hátor, senhora dos barcos', 'um escaravelho de faiança azul', 'um olho de Hórus num cordão'],
    asteca: ['uma pedrinha de jade, para a senhora das águas', 'uma pena de quetzal', 'um colar de contas de concha'],
    classico: ['uma concha furada num cordão', 'um lenço bordado', 'um amuleto de osso'],
  };
  const KID_TOKEN = ['uma pedrinha pintada com o sol', 'um barquinho de casca de árvore', 'uma concha', 'um boneco de palha', 'um desenho de peixe riscado num caco'];
  function tokenFor(p, k, rel) {
    if (rel === 'filho' || rel === 'filha') return pick(KID_TOKEN);
    if (rel === 'pai' || rel === 'mae') return pick(['o amuleto que era do avô', 'a faca do pai, a de cabo de chifre', 'um punhado de terra da casa, num saquinho']);
    return pick(TOKEN[p.civ] || TOKEN.classico);
  }
  // something brought back from the far side (the promise made to a child on the quay)
  function giftFor(e) {
    const out = [];
    for (const kind of (e.sp || []).slice(0, 6)) {
      const D = G.Animals && G.Animals.DEF[kind]; if (!D) continue; const nm = D.name.toLowerCase();
      if (D.cls === 'air') out.push(`uma pena de ${nm}, um pássaro que ninguém daqui conhece`);
      else if (D.diet === 'carn' && (D.size || 1) >= 1) out.push(`um dente de ${nm}, achado na areia`);
    }
    if (e.contact && e.contact.out !== 'violencia') out.push('um colar de contas do povo de lá');
    const land = (e.disc || []).filter(x => x.k === 'r').map(x => x.txt)[0];
    if (land) out.push(`uma pedra lisa e preta da praia ${K.de(land)}`);
    out.push('uma concha do tamanho de uma mão, que canta quando se encosta no ouvido');
    return pick(out);
  }
  // the one who stays: a partner, a small child, a mother (someone who can stand on a quay)
  function kinOf(v, e) {
    const crew = new Set(e ? e.crew : []);
    const ks = St.kin(v).filter(k => !k.captive && k.age >= 4 && !crew.has(k.id) && !k.aboard && !(k.task && (k.task.type === 'muster' || k.task.type === 'band')));
    const w = k => { const r = St.relOf(v, k); return (r === 'companheiro' || r === 'companheira' ? 3 : (r === 'filho' || r === 'filha') && k.age < 14 ? 3.4 : r === 'mae' || r === 'pai' ? 2.2 : 1.1) - G.dist(k.x, k.y, v.x, v.y) / 40; };
    return ks.sort((a, b) => w(b) - w(a))[0] || null;
  }
  const kidOf = (p, k) => { const r = k && St.relOf(p, k); return (r === 'filho' || r === 'filha') && k.age < 14; };

  // ------------------------------ the observer: the sea's moments become facts ------------------------------
  St.observe('expPlanned', d => St.offer(St.draft('expedicao', { exp: d.exp, fa: d.fac, x: d.x, y: d.y })));
  St.observe('expDeparted', d => St.offer(St.draft('zarpou', { exp: d.exp, x: d.x, y: d.y })));
  St.observe('expChapter', d => St.offer(St.draft('diario', { exp: d.exp, h: d.h, txt: d.txt, x: d.x, y: d.y })));
  St.observe('expHome', d => St.offer(St.draft('chegou', { exp: d.exp, ids: (d.ids || []).slice(0, 80), lost: d.lost || 0, found: d.found || 0, contact: d.contact ? 1 : 0, presumed: d.presumed ? 1 : 0, x: d.x, y: d.y })));
  St.observe('expLost', d => St.offer(St.draft('perdidos', { exp: d.exp, x: d.x, y: d.y })));
  St.observe('castaway', d => St.offer(St.draft('naufrago', { a: d.v, camp: d.camp || 0, exp: d.exp || 0, fa: d.fac, ship: d.ship || '', x: d.x, y: d.y })));
  St.observe('survivorHome', d => St.offer(St.draft('sobrevivente', { a: d.v, exp: d.exp || 0, fa: d.fac, days: d.days || 0, presumed: d.presumed ? 1 : 0, x: d.x, y: d.y })));
  St.observe('colonyFounded', d => St.offer(St.draft('colonia', { exp: d.exp, set: d.set, ids: (d.ids || []).slice(0, 80), x: d.x, y: d.y })));
  St.observe('shipSunk', d => { if (d.exp) St.offer(St.draft('afundou', { exp: d.exp, ids: (d.ids || []).slice(0, 60), x: d.x, y: d.y })); });
  St.observe('firstContact', d => St.offer(St.draft('contato', { exp: d.exp || 0, ids: (d.ids || []).slice(0, 40), b: d.b, out: d.out, set: d.set, x: d.x, y: d.y })));

  // ------------------------------ the chapters ------------------------------
  SK('hz-chamado', { h: 'O chamado', text: [
    c => (c.SO && c.ALONE ? `${c.P} vai sozinh${c.o} para o mar, numa canoa, rumo ao ${c.DIR}: ${c.WHYS}. ${c.KIN ? cap1(c.KIN) + ' acha que é loucura.' : ''}`.trim() : null),
    c => (c.SO && c.LEAD && c.KIN ? `Faz dias que ${c.P} olha para o ${c.DIR} do alto da praia. Agora vai${c.ALONE ? '' : `, com ${c.COMP}`}: ${c.WHYS}. ${cap1(c.KIN)} não conseguiu ${c.KID ? 'entender' : 'impedir'}.` : null),
    c => (c.SO && c.LEAD && !c.ALONE ? `${c.P} vai para o mar numa canoa, rumo ao ${c.DIR}, e ${c.COMP} vai junto: ${c.WHYS}. ${c.KIN ? cap1(c.KIN) + ' fica.' : ''}`.trim() : null),
    c => (c.SO && !c.LEAD ? `${c.P} não deixou ${c.LEADN} ir sozinh${c.oL} para o mar: vão os dois numa canoa, rumo ao ${c.DIR}. ${c.KIN ? cap1(c.KIN) + ' acha que é loucura.' : ''}`.trim() : null),
    c => (c.LEAD && !c.SO ? `${c.P} vai comandar ${c.EXP}, rumo ao ${c.DIR}, porque ${c.WHYS}. Em casa, ${c.KIN} ouviu a notícia com o pão na mão.` : null),
    c => (!c.LEAD && !c.SO && !c.COL ? `O nome de ${c.P} está entre os ${c.N} que vão ${em(c.EXP)}, rumo ao ${c.DIR}: ${c.WHYS}. ${cap1(c.KIN)} soube na praça.` : null),
    c => (c.COL ? `${c.P} vai com os colonos ${de(c.EXP)} fundar uma cidade do outro lado do mar. ${cap1(c.KIN)} fica em ${c.HOME}.` : null),
    c => (c.OF && c.OFREL ? `${c.P} vai procurar ${c.OFREL} ${c.OF}, que o mar não devolveu. ${cap1(c.KIN)} pediu que não fosse.` : null),
  ] });
  SK('hz-cais-so', { h: 'O cais', text: [
    c => `Ninguém foi ao cais de ${c.HOME} ver ${c.P} partir. ${cap1(c.KIN)} não quis — ou não pôde.`,
    c => `${c.P} esperou no cais até o último momento, olhando para a rua. ${cap1(c.KIN)} não veio.`,
  ] });
  SK('hz-zarpou', { h: 'A partida', text: [
    c => `${cap1(c.SHIP)} soltou as amarras e saiu do porto de ${c.HOME}, com ${c.P} a bordo${c.TOKEN ? ` e ${c.TOKEN} no bolso` : ''}.`,
    c => `${c.P} viu ${c.HOME} ficar pequena até virar uma linha na água${c.KIN ? `. ${cap1(c.KIN)} ainda acenava` : ''}.`,
  ] });
  SK('hz-morreu', { h: 'O mar ficou', text: [
    c => (c.DROWN ? `O mar levou ${c.P}, longe de ${c.HOME}. ${c.TOKEN ? cap1(c.TOKEN) + ' foi junto para o fundo.' : ''}`.trim() : null),
    c => (c.SICK ? `A febre do mar levou ${c.P}. Os companheiros ${c.o === 'a' ? 'a' : 'o'} entregaram às ondas, enrolad${c.o} na vela velha${c.TOKEN ? `, com ${c.TOKEN} nas mãos` : ''}.` : null),
    c => (c.BEAST ? `${c.P} morreu ${c.PLACE || 'numa terra estranha'}, nas garras de ${c.BEASTA} ${c.BEAST}, longe de ${c.HOME}.` : null),
    c => (c.VIOLENT && !c.BEAST && c.FT ? `${c.P} morreu ${c.PLACE || 'numa praia estranha'}, pelas mãos da gente de ${c.FT}.` : null),
    c => (c.VIOLENT && !c.BEAST && !c.FT ? `${c.P} morreu ${c.WATER ? 'no convés' : c.PLACE || 'numa praia estranha'}, longe de ${c.HOME}.` : null),
    c => (!c.DROWN && !c.SICK && !c.VIOLENT ? `${c.P} morreu ${c.PLACE || 'longe de ' + c.HOME}, do outro lado do horizonte.` : null),
  ] });
  SK('hz-kin-morreu', { h: 'Em casa', text: [
    c => `Em ${c.HOME}, ${c.KIN} morreu sem saber se ${c.P} voltaria. Lá longe, ${c.P} ainda conta os dias para voltar.`,
    c => `${cap1(c.KIN)} não vai estar no cais. Morreu em ${c.HOME}, e ${c.P}, no mar, não sabe.`,
  ] });
  SK('hz-presumido', { h: 'Dados como perdidos', text: [
    c => (c.ALIVE && c.WRECK ? `Em ${c.HOME}, já falam de ${c.P} como dos mortos. Mas ${c.P} está viv${c.o}, numa praia que nenhum deles conhece.` : null),
    c => (c.ALIVE && !c.WRECK ? `Em ${c.HOME}, já acenderam a lamparina dos que não voltam. ${c.P} ainda está no mar, viv${c.o}, atrasad${c.o}.` : null),
    c => (!c.ALIVE ? `Em ${c.HOME}, deram ${c.EXP} por perdida. ${cap1(c.KIN)} ainda desce ao cais todo fim de tarde.` : null),
  ] });
  SK('hz-naufrago', { h: 'A praia', text: [
    c => `${cap1(c.SHIP)} afundou. ${c.P} se agarrou num pedaço de casco e o mar ${c.o === 'a' ? 'a' : 'o'} cuspiu numa praia ${c.WHERE || 'que ninguém conhece'}.`,
    c => `${c.P} acordou com areia na boca, numa praia ${c.WHERE || 'sem nome'}. Do barco, só tábuas.`,
  ] });
  SK('hz-deixado', { h: 'Deixad', text: [
    c => `Os navios partiram sem ${c.P}. Ficou ${c.PLACE || 'do outro lado do mar'}, vendo as velas sumirem no horizonte.`,
    c => `${c.P} chegou à praia quando as velas já eram pontos no mar. Ficou ${c.PLACE || 'para trás'}, sozinh${c.o}.`,
  ] });
  SK('hz-faltou', { h: 'Um a menos', text: [
    c => `${cap1(c.EXP)} voltou para ${c.HOME}, e ${c.P} não estava entre os que desceram. ${c.WRECK ? 'Os outros contam que o barco afundou, e que ninguém mais viu ' + (c.o === 'a' ? 'ela' : 'ele') + '.' : 'Ninguém sabe dizer onde ficou.'}`,
  ] });
  SK('hz-colonia', { h: 'O outro lado', text: [
    c => `${c.P} ficou em ${c.COLONY}, do outro lado do mar. ${cap1(c.KIN)}, em ${c.HOME}, vai saber dela pelos barcos — quando houver barcos.`,
    c => `${c.COLONY} nasceu numa praia, e ${c.P} estava lá. Em ${c.HOME}, ${c.KIN} guarda o lugar de ${c.P} à mesa, mesmo sabendo.`,
  ] });
  SK('hz-cativo', { h: 'Nas mãos dos outros', text: [c => `${c.P} ficou nas mãos de ${c.FT}, do outro lado do mar. Em ${c.HOME}, ninguém sabe.`] });
  SK('hz-cancelada', { h: 'O cais vazio', text: [
    c => `${cap1(c.EXP)} não saiu. ${c.P} desfez a trouxa${c.KIN ? `, e ${c.KIN} fingiu não estar aliviad${c.oK}` : ''}.`,
    c => `A viagem morreu no cais. ${c.P} voltou para casa com o mar ainda nos olhos.`,
  ] });
  SK('hz-ficou', { h: 'Ficou no cais', text: [c => `${cap1(c.EXP)} partiu sem ${c.P}. Ficou no cais${c.KIN ? `, com ${c.KIN}` : ''}, vendo as velas irem embora.`] });
  // the endings
  SK('hz-fim-volta', { h: 'A volta', text: [
    c => (c.LAND ? `${c.P} voltou de além do horizonte com o nome de uma terra nova na boca: ${c.LAND}${c.KIN && c.KINOK ? `. ${cap1(c.KIN)} estava no cais` : ''}.` : null),
    c => (!c.LAND && !c.LOSTN && c.KIN && c.KINOK ? `${c.P} voltou do mar sem nada nas mãos. ${cap1(c.KIN)} estava no cais, e isso bastou.` : null),
    c => (c.LOSTN ? `${c.P} voltou para ${c.HOME}. ${c.LOSTN > 1 ? c.LOSTN + ' dos que partiram' : 'Um dos que partiram'} não. É por el${c.LOSTN > 1 ? 'es' : 'e'} que ${c.P} acorda à noite.` : null),
    c => (!c.LAND && !c.LOSTN ? `${c.P} voltou sem descobrir nada além de água. Mas agora sabe o que há depois do horizonte: mais horizonte.` : null),
    c => (c.GIFT ? `${c.P} voltou, e ${c.KN} tem ${c.GIFT} para mostrar a todas as crianças de ${c.HOME}.` : null),
  ] });
  SK('hz-fim-milagre', { h: 'Voltou dos mortos', text: [
    c => `${c.P} voltou para ${c.HOME} depois de dad${c.o} por mort${c.o}. ${c.KIN && c.KINOK ? cap1(c.KIN) + ' ainda tinha a lamparina acesa.' : 'Já não havia quem esperasse.'}`,
    c => `Em ${c.HOME}, contam até hoje: ${c.P} voltou do mar quando já ninguém esperava.`,
  ] });
  SK('hz-fim-naufragio', { h: 'A pé, pela praia', text: [
    c => `${c.P} voltou para ${c.HOME} a pé, pela praia, sem ${c.SHIP}. O mar ficou com o barco; com ${c.P}, não.`,
    c => `${cap1(c.SHIP)} está no fundo do mar. ${c.P} chegou em casa encharcad${c.o}, com sal até nos olhos, e viv${c.o}.`,
  ] });
  SK('hz-fim-sozinho', { h: 'A casa fechada', text: [c => `${c.P} voltou para ${c.HOME}. ${cap1(c.KIN)}, não: morreu enquanto ${c.P} estava no mar. ${c.TOKEN ? cap1(c.TOKEN) + ' voltou para a mesa da casa vazia.' : ''}`.trim()] });
  SK('hz-fim-noticia', { h: 'A notícia', text: [
    c => (c.MSG ? `${c.MSG} subiu o cais até ${c.KN} e não precisou dizer nada. ${c.P} ficou no mar.` : `${cap1(c.EXP)} voltou sem ${c.P}. ${cap1(c.KIN)} procurou em cada rosto da prancha.`),
  ] });
  SK('hz-fim-perdidos', { h: 'O mar não devolveu', text: [
    c => `${c.P} nunca voltou. Em ${c.HOME}, ${c.KIN || 'quem ficou'} jogou flores no mar, ${c.DIR ? 'para o ' + c.DIR : 'para longe'}.`,
    c => `O mar ficou com ${c.P}. Em ${c.HOME}, quando venta do ${c.DIR || 'mar'}, ${c.KIN || 'alguém'} ainda vai até o cais.`,
  ] });

  // the voyage as the one who sailed lived it (beside the chapters of the expedition's own book)
  const LIVED = {
    'A tempestade': [c => `${c.P} passou a noite agarrad${c.o} ao mastro, pensando em ${c.KN || c.HOME}.`, c => `${c.P} tirou água do casco com um balde até as mãos sangrarem, e rezou entre um balde e outro.`],
    'O monstro': [c => `${c.P} viu a coisa de perto. Nunca mais conseguiu descrevê-la direito.`, c => `${c.P} fechou os olhos e segurou ${c.TOKEN || 'a borda do barco'} até passar.`],
    'O motim': [c => (c.LEADME ? `Era contra ${c.P} que gritavam.` : `${c.P} ficou quiet${c.o}, no meio dos que gritavam e dos que mandavam.`)],
    'A febre': [c => (c.SICKNOW ? `${c.P} ardeu em febre três noites, e chamou por ${c.KN || 'casa'} no delírio.` : `${c.P} cuidou dos doentes, de pano molhado na mão.`)],
    'Fome': [c => `${c.P} dividiu o último pedaço de peixe seco${c.KN ? `, pensando na mesa de ${c.KN}` : ''}.`],
    'A água acabando': [c => `${c.P} lambeu o orvalho da vela de manhã, como os outros.`],
    'Calmaria': [c => `Sem vento, ${c.P} contou as tábuas ${c.SMALL ? 'da canoa' : 'do convés'}. Duas vezes.`],
    'Terra à vista': [c => (c.FIRST ? `Foi ${c.P}, do alto do mastro, quem gritou primeiro. Vai contar isso até ficar velh${c.o}.` : (c.SMALL ? `${c.P} ficou de pé na canoa, quase virando, para ver com os próprios olhos.` : `${c.P} subiu na amurada para ver com os próprios olhos.`))],
    'Um bicho nunca visto': [c => `${c.P} guardou cada detalhe na memória${c.KID ? `, para contar a ${c.KN}` : ', para contar em casa'}.`],
    'Bichos sem conta': [c => `${c.P} parou de tentar dar nome aos bichos de lá.`],
    'Primeiro contato': [c => (c.ASHORE ? `${c.P} estava na praia, entre os primeiros, com o coração na boca.` : `${c.P} olhava do barco, com a mão no remo, pronto para fugir.`)],
    'O mar de luz': [c => `${c.P} pôs a mão na água acesa e riu como criança.`],
    'As baleias': [c => `${c.P} nunca tinha visto um bicho maior que um boi. Viu vários, e chorou sem saber por quê.`],
    'O naufrágio': [c => (c.ALIVE ? `${c.P} nadou até não sentir os braços.` : null)],
    'Meia-volta': [c => `${c.P} olhou para trás uma última vez antes de virarem a proa.`],
    'Neblina': [c => `${c.P} passou a noite ouvindo o mar e tentando adivinhar onde estava a terra.`],
    'O nome': [c => (c.LEADME ? `Antes de dizer o nome em voz alta, ${c.P} pensou em ${c.KN || c.HOME}.` : null)],
  };

  // the words a chapter needs from this story
  function vars(s, extra) {
    const d = s.data; const k = PD(s.cast.kin); const p = PD(s.protag);
    return Object.assign({
      KIN: d.kinName ? `${REL_TXT[d.rel] || ''} ${d.kinName}`.trim() : '', KN: d.kinName || '', oK: oa(k),
      HOME: d.homeName || 'casa', EXP: d.expName || 'a expedição', DIR: d.dirw || '', WHYS: d.whyTxt || '', N: d.n || 0,
      SHIP: d.shipName || 'o barco', SMALL: d.small ? 1 : 0, TOKEN: d.token || '', KID: d.kid ? 1 : 0, LEAD: d.lead ? 1 : 0, LEADME: d.lead ? 1 : 0,
      SO: d.scale === 'so' ? 1 : 0, ALONE: d.n <= 1 ? 1 : 0, LEADN: d.leadName || '', oL: d.leadG === 'f' ? 'a' : 'o', COMP: d.comp || '', COL: d.colony ? 1 : 0, OF: d.ofName || '', OFREL: d.ofRel ? REL_TXT[d.ofRel] || '' : '',
      ALIVE: p && !p.dead ? 1 : 0, WRECK: p && p.wrecked ? 1 : 0, ASHORE: p && !p.dead && !p.aboard ? 1 : 0, SICKNOW: p && p.sick > 0 ? 1 : 0,
    }, extra || {});
  }
  function shipOfP(p, e) { const s = p && p.aboard ? ship(p.aboard) : null; return s || (e ? ship(e.flag) : null); }

  // ====================================================================================
  //  ALÉM DO HORIZONTE
  // ====================================================================================
  St.define('horizonte', {
    name: 'Além do Horizonte', icon: 'ship', tone: 'agridoce', tags: ['mar', 'família', 'viagem'], struct: 'partida-retorno', seedLife: 2, maxDays: 40, ripe: 0.04,
    stages: [['cais', 'O cais'], ['mar', 'O mar'], ['terra', 'A terra'], ['volta', 'A volta']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' || s.end.k === 'reencontro' ? 3 : -1; return { cais: 0, mar: 1, terra: 2, volta: 3, espera: 1, naufrago: 2 }[s.phase] || 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.homeName))} parte ${em(s.data.expName || 'uma expedição')}, rumo ao ${s.data.dirw || 'mar aberto'}${s.data.kinName ? `, e deixa ${REL_TXT[s.data.rel] || ''} ${s.data.kinName} no cais` : ''}.`,
    on: {
      expedicao(f) {
        const e = X.get(f.exp); if (!e || !X.live(e)) return null;
        const lostE = e.of ? X.get(e.of) : null; const lostLead = lostE ? PD(lostE.leader) : null;
        let best = null, bs = 0, bk = null;
        for (const id of e.crew) {
          const v = P(id); if (!v || v.captive || v.age < 15 || v.age > 62 || carries('horizonte', v.id) || carries('naufrago', v.id)) continue;
          const k = kinOf(v, e); if (!k) continue;
          const r = St.relOf(v, k);
          let sc = 0.46 + (r === 'companheiro' || r === 'companheira' ? 0.1 : 0) + (kidOf(v, k) ? 0.16 : 0) + (id === e.leader ? 0.1 : 0) + (e.scale === 'so' ? 0.1 : 0) - G.dist(k.x, k.y, v.x, v.y) / 300;
          // a voyage to look for one of their own
          if (lostLead && St.relOf(v, lostLead)) sc += 0.25;
          if ((v.voyages || 0) === 0) sc += 0.05;
          if (sc > bs) { bs = sc; best = v; bk = k; }
        }
        if (!best || bs < 0.45) return null;
        const home = G.S.settlements.get(e.from); const flag = ship(e.flag);
        const c0 = { HOME: e.fromName, OF: e.ofName || '' };
        const why = e.kind === 'colonia' ? 'terra' : e.kind === 'busca' ? 'busca' : (e.obj && e.obj.why) || 'curiosidade';
        return [{ protag: best.id, score: Math.min(0.92, bs + 0.12), keyExtra: 'hz' + e.id, cast: { kin: bk.id }, place: { kind: 'mar', name: e.dirw ? 'o ' + e.dirw : 'o mar', x: e.moor[0], y: e.moor[1] },
          data: { exp: e.id, expName: e.name, home: e.from, homeName: e.fromName || (home ? home.name : ''), rel: St.relOf(best, bk), kinName: bk.name, kid: kidOf(best, bk) ? 1 : 0, kidAge0: bk.age,
            scale: e.scale, colony: e.kind === 'colonia' ? 1 : 0, dirw: e.dirw, lead: best.id === e.leader ? 1 : 0, n: e.crew.length, whyTxt: (WHY_P[why] || WHY_P.curiosidade)(c0), why,
            leadName: (P(e.leader) || {}).name || '', leadG: (P(e.leader) || {}).g || 'm', comp: e.crew.filter(i => i !== best.id).map(P).filter(Boolean).slice(0, 2).map(v => v.name).join(' e '), ofName: lostLead ? lostLead.name : '', ofRel: lostLead ? St.relOf(best, lostLead) || '' : '', shipName: flag ? G.Naval.title(flag) : '' },
          motifs: ['gatilho:expedicao', 'amb:mar', 'rel:familia'] }];
      },
    },
    valid: sd => { const e = X.get(sd.data.exp); return !!e && X.live(e) && ['prep', 'reunir', 'embarque'].includes(e.st) && e.crew.includes(sd.protag); },
    begin(s) {
      s.phase = 'cais';
      const p = P(s.protag);
      St.beat(s, 'hz-chamado', vars(s), { x: p ? p.x : undefined, y: p ? p.y : undefined, toast: true });
      const e = X.get(s.data.exp); if (e) St.expect(s, 'A despedida no cais', G.S.clock + DAY() * 0.25, e.port[0], e.port[1]);
    },
    tick(s) {
      const d = s.data; const e = X.get(d.exp); const p = P(s.protag); const k = P(s.cast.kin);
      if (!e) { if (p) St.finish(s, 'interrompida', 'sereno', `${p.name} nunca soube o que houve com a viagem.`); return; }
      // the ship is in, and a shipmate walks up the quay (once ashore)
      if (d.news && !d.newsOn && !Sn.running(s.id)) {
        const m = P(d.news.m); const k2 = P(s.cast.kin);
        if (!m || !k2 || G.S.day - d.news.d > 0.5) { d.newsOn = 1; St.finish(s, 'tragica', 'tragico', St.say(s, 'hz-fim-noticia', vars(s, { MSG: m ? m.name : '' })), { big: 1 }); return; }
        if (!m.aboard) { d.newsOn = 1; St.scene(s, 'hz-noticia', { k: k2.id, m: m.id }, { at: [e.port[0], e.port[1]], data: { cause: d.died ? d.died.cause : '', storm: d.died ? d.died.storm : 0, place: d.died ? d.died.place : '', beast: d.died ? d.died.beast : '', bg: d.died ? d.died.bg : 'm', ft: d.died ? d.died.ft : '', token: d.token || '' }, onEnd: () => St.finish(s, 'tragica', 'tragico', St.say(s, 'hz-fim-noticia', vars(s, { MSG: m.name })), { big: 1 }) }); }
        return;
      }
      // dead, and nobody came home to say it: the sea forgets them
      // (only once home has given them up: the flowers on the water at dusk, then the end)
      if (!p) {
        if (d.died && !d.told && (e.presumed || G.S.day - d.died.d > 12)) {
          const k2 = P(s.cast.kin); const tm = G.S.time;
          if (k2 && !k2.captive && !k2.aboard && !d.vigil && tm > 0.6 && tm < 0.8 && !Sn.running(s.id)) {
            d.vigil = 1; d.told = 1;
            St.scene(s, 'hz-vigilia', { k: k2.id }, { at: [e.port[0], e.port[1]], data: { exp: e.id, mode: 'luto' }, onEnd: () => St.finish(s, 'tragica', 'tragico', St.say(s, 'hz-fim-perdidos', vars(s)), { big: 1 }) });
          } else if (!k2 || d.vigil || G.S.day - (e.presumed || d.died.d) > 1.5) { d.told = 1; St.finish(s, 'tragica', 'tragico', St.say(s, 'hz-fim-perdidos', vars(s)), { big: 1 }); }
        }
        return;
      }
      // ---- on the quay ----
      if (s.phase === 'cais') {
        if (e.status === 'cancelada') { St.finish(s, 'interrompida', 'sereno', St.say(s, 'hz-cancelada', vars(s))); return; }
        if (!e.crew.includes(p.id) && !['prep', 'reunir'].includes(e.st)) { St.finish(s, 'transformada', 'agridoce', St.say(s, 'hz-ficou', vars(s))); return; }
        if (!d.bye && ['reunir', 'embarque'].includes(e.st) && !p.aboard && G.dist(p.x, p.y, e.port[0], e.port[1]) < 8 && !Sn.running(s.id)) {
          d.bye = 1;
          if (k && !k.captive && !k.aboard && G.dist(k.x, k.y, p.x, p.y) < 70) {
            St.scene(s, 'hz-cais', { k: k.id }, { at: [p.x, p.y], data: { exp: e.id }, guard: () => { const e2 = X.get(d.exp); return !!e2 && ['reunir', 'embarque'].includes(e2.st); } });
          } else St.beat(s, 'hz-cais-so', vars(s), { x: p.x, y: p.y });
        }
        return;
      }
      // ---- the long wait: the ship is late ----
      if ((s.phase === 'mar' || s.phase === 'terra' || s.phase === 'espera' || s.phase === 'naufrago') && !d.vigil && e.due && G.S.day > e.due + 0.12 && k && !k.captive && !k.aboard && !Sn.running(s.id)) {
        const tm = G.S.time; if (tm > 0.6 && tm < 0.8) {
          d.vigil = 1;
          St.scene(s, 'hz-vigilia', { k: k.id }, { at: [e.port[0], e.port[1]], data: { exp: e.id, mode: e.presumed ? 'luto' : 'espera', late: G.S.day - e.due } });
        }
      }
      // ---- home: on the quay again (or up the street, for one the sea gave back) ----
      if (d.back && !d.met && !p.aboard && !p.captive && !Sn.running(s.id)) {
        const home = G.S.settlements.get(d.backSet) || G.S.settlements.get(p.set);
        const near = d.miracle || d.wreckHome ? home && G.dist(p.x, p.y, home.cx, home.cy) < (home.radius || 8) + 8 : G.dist(p.x, p.y, e.port[0], e.port[1]) < 14;
        if (near || G.S.day - d.homeD > 0.4) {
          d.met = 1; s.phase = 'volta';
          const kAlive = k && !k.captive ? k : null;
          St.scene(s, 'hz-volta', { k: kAlive ? kAlive.id : 0 }, { at: [p.x, p.y], data: voltaData(s, e, d.miracle ? 'milagre' : d.wreckHome ? 'naufragio' : 'volta'), onEnd: () => endHome(s) });
        }
      }
    },
    react(s, f) {
      const d = s.data; const p = P(s.protag);
      if (f.k === 'zarpou' && f.exp === d.exp && s.phase === 'cais') {
        const e = X.get(d.exp); if (!e || !p || !p.aboard) return false;
        s.phase = 'mar'; const sh = shipOfP(p, e); if (sh) { d.shipName = G.Naval.title(sh); d.small = G.Naval.small(sh) ? 1 : 0; } d.outC = G.S.clock;
        St.beat(s, 'hz-zarpou', vars(s), { x: f.x, y: f.y });
        if (e.due) St.expect(s, 'A volta, se o mar deixar', G.S.clock + DAY() * Math.max(0.2, e.due - G.S.day), e.port[0], e.port[1]);
        return true;
      }
      if (f.k === 'diario' && f.exp === d.exp && s.phase !== 'cais' && LIVED[f.h] && !d.died && p && (p.aboard || X.memberOf(p.id))) {
        // a few great moments of the voyage, as this one lived them (not every page of the book)
        if ((d.dn || 0) >= 6 || (d.hs || []).includes(f.h) || (d.dT && G.S.clock - d.dT < DAY() * 0.12 && f.h !== 'Terra à vista' && f.h !== 'Primeiro contato')) return false;
        const first = !!(p && f.txt && f.txt.indexOf(p.name + ' viu primeiro') === 0);
        if (first) d.sawFirst = 1;
        if (f.h === 'Terra à vista') s.phase = 'terra';
        const extra = vars(s, { FIRST: first ? 1 : 0 });
        let line = null; for (const fn of LIVED[f.h].slice().sort(() => G.R() - 0.5)) { try { line = fn(Object.assign({ P: p ? p.name : (PD(s.protag) || {}).name, o: oa(PD(s.protag)) }, extra)); } catch (er) { line = null; } if (line) break; }
        if (!line) return false;
        d.dn = (d.dn || 0) + 1; d.dT = G.S.clock; (d.hs = d.hs || []).push(f.h);
        St.chapter(s, `${f.txt} ${line}`, { k: 'hz-diario', x: f.x, y: f.y });
        return true;
      }
      if (f.k === 'contato' && (f.ids || []).includes(s.protag)) { d.contact = 1; return false; }
      if (f.k === 'afundou' && f.exp === d.exp && (f.ids || []).includes(s.protag)) { d.sank = 1; return false; }
      if (f.k === 'morte' && f.a === s.protag) {
        if (s.phase === 'cais') { St.finish(s, 'interrompida', 'agridoce', `${PD(s.protag).name} morreu antes de zarpar. O mar ficou esperando.`); return true; }
        const e = X.get(d.exp);
        const violent = { war: 1, arrow: 1, massacre: 1, beast: 1, wolf: 1, boar: 1 }[f.cause];
        const W = G.W; const water = W.inb(f.x, f.y) && W.isWater(W.idx(f.x, f.y));
        const r = K.at(f.x, f.y); const place = !water && r && K.named(r) ? K.na(K.name(r)) : '';
        const B = f.bk && G.Animals && G.Animals.DEF[f.bk]; const ftF = f.fb ? G.Fac.get(f.fb) : null;
        const ft = ftF && ftF.id !== s.fac ? ftF.name : '';
        d.died = { d: G.S.day, cause: f.cause, x: f.x, y: f.y, storm: G.S.weather && G.S.weather.storm > 0 ? 1 : 0, place, water: water ? 1 : 0, beast: B ? B.name.toLowerCase() : '', bg: B ? B.g || 'm' : 'm', ft }; d.waitHeir = 1;
        St.beat(s, 'hz-morreu', vars(s, { DROWN: f.cause === 'drown' ? 1 : 0, SICK: f.cause === 'sick' || f.cause === 'hunger' ? 1 : 0, VIOLENT: violent ? 1 : 0, BEAST: B ? d.died.beast : '', BEASTA: B && B.g === 'f' ? 'uma' : 'um', FT: ft, PLACE: place, WATER: water ? 1 : 0 }), { x: f.x, y: f.y });
        void e;
        return true;
      }
      if (f.k === 'morte' && f.a === s.cast.kin && !d.kinDied) { d.kinDied = 1; if (p && s.phase !== 'cais') St.beat(s, 'hz-kin-morreu', vars(s)); return true; }
      if (f.k === 'naufrago' && f.a === s.protag && !d.castaway) {
        d.castaway = { d: G.S.day, camp: f.camp }; s.phase = 'naufrago';
        const r = K.at(f.x, f.y); const where = r && K.named(r) ? K.de(K.name(r)) : '';
        const left = p && p.wrecked && p.wrecked.left; if (left) d.leftBehind = 1;
        if (left) St.beat(s, 'hz-deixado', vars(s, { PLACE: r && K.named(r) ? K.na(K.name(r)) : '' }), { x: f.x, y: f.y });
        else St.beat(s, 'hz-naufrago', vars(s, { WHERE: where }), { x: f.x, y: f.y });
        return true;
      }
      if (f.k === 'captura' && f.a === s.protag && s.phase !== 'cais') { d.captive = 1; St.beat(s, 'hz-cativo', vars(s, { FT: G.Fac.get(f.fb) ? G.Fac.get(f.fb).name : 'estranhos' }), { x: f.x, y: f.y }); return true; }
      if (f.k === 'perdidos' && f.exp === d.exp && !d.presumed) {
        d.presumed = 1; if (s.phase === 'mar' || s.phase === 'terra') s.phase = 'espera';
        St.beat(s, 'hz-presumido', vars(s));
        return true;
      }
      if (f.k === 'colonia' && f.exp === d.exp && (f.ids || []).includes(s.protag) && p) {
        const ns = G.S.settlements.get(f.set);
        St.finish(s, 'transformada', 'agridoce', St.say(s, 'hz-colonia', vars(s, { COLONY: ns ? ns.name : 'a colônia' })), { x: f.x, y: f.y, log: true });
        return true;
      }
      if (f.k === 'chegou' && f.exp === d.exp) {
        const e = X.get(d.exp);
        if ((f.ids || []).includes(s.protag) && p) { d.back = 1; d.backSet = e ? e.from : p.set; d.homeD = G.S.day; d.lostN = f.lost || 0; return true; }
        if (d.died && !d.told) {
          d.told = 1;
          const k = P(s.cast.kin);
          // the one who brings the news: the captain, or someone from the same street
          const ids = (f.ids || []).filter(id => id !== s.protag);
          const msg = (e && ids.includes(e.leader) ? P(e.leader) : null) || ids.map(P).find(v => v && v.set === (PD(s.protag) || {}).set) || P(ids[0]);
          if (k && msg) { d.news = { m: msg.id, d: G.S.day }; s.phase = 'volta'; }
          else St.finish(s, 'tragica', 'tragico', St.say(s, 'hz-fim-noticia', vars(s, { MSG: msg ? msg.name : '' })), { big: 1 });
          return true;
        }
        if (p && !(f.ids || []).includes(s.protag) && !d.missing) { d.missing = 1; s.phase = 'espera'; St.beat(s, 'hz-faltou', vars(s)); return true; }
        return false;
      }
      if (f.k === 'sobrevivente' && f.a === s.protag && p) {
        const e = X.get(d.exp);
        d.back = 1; d.backSet = p.set || (e || {}).from; d.homeD = G.S.day; d.met = 0; d.sank = 1;
        // given up for dead at home, or just wet and late (as it stood when they walked in)
        if (f.presumed || d.presumed || (f.days || 0) >= 2) d.miracle = 1; else d.wreckHome = 1;
        return true;
      }
      return false;
    },
    urge: () => 0,
    goal: (s, c) => (s.phase === 'cais' ? `Zarpar ${em(s.data.expName || 'a expedição')} — e voltar.` : `Voltar para ${s.data.homeName || 'casa'}${s.data.kinName ? ' e para ' + s.data.kinName : ''}.`),
    status(s, c) {
      const d = s.data; const p = P(s.protag); const e = X.get(d.exp);
      if (d.died) return `${c.P} não volta mais.`;
      if (!p) return '';
      if (d.castaway && p.wrecked) return `${c.P} está náufrag${c.o} numa praia distante.`;
      if (p.captive) return `${c.P} está cativ${c.o} de estranhos, além do mar.`;
      if (s.phase === 'cais') return `${c.P} espera no cais de ${d.homeName} a ordem de embarcar.`;
      if (e && X.live(e)) return `${c.P} está no mar com ${d.expName}${e.due && G.S.day > e.due ? ' — e já está atrasad' + c.o : ''}.`;
      return `${c.P} está em ${(G.S.settlements.get(p.set) || {}).name || 'casa'}.`;
    },
    obstacles: () => ['o mar', 'a fome do caminho', 'a distância', 'o esquecimento'],
    open: () => ['voltar para casa', 'morrer no mar', 'ficar do outro lado', 'virar náufrago'],
    titles: {
      horizonte: () => 'Além do Horizonte',
      cais: c => (c.s.data.kinName ? `${c.s.data.kinName} no Cais` : null),
      vela: c => `A Vela de ${c.P}`,
      busca: c => (c.s.data.ofName ? `Em Busca de ${c.s.data.ofName}` : null),
      rumo: c => (c.s.data.dirw ? `Rumo ao ${cap1(c.s.data.dirw)}` : null),
    },
    retitle(s, c) {
      if (s.end && s.end.k === 'tragica') return `${c.P} Ficou no Mar`;
      if (s.end && s.end.k === 'reencontro') return `${c.P} Voltou dos Mortos`;
      if (s.end && s.end.k === 'cumprida') return `A Volta de ${c.P}`;
      return null;
    },
    forgotten: (s, c) => `${c.P} voltou para a vida de antes. O mar virou uma história que se conta no inverno.`,
  });
  function voltaData(s, e, mode) {
    const d = s.data; const found = e ? (e.disc || []).filter(x => x.k === 'r').map(x => x.txt) : [];
    const sp = e ? (e.sp || []).map(k => G.Animals && G.Animals.DEF[k] ? G.Animals.DEF[k].name.toLowerCase() : null).filter(Boolean) : [];
    const lostIds = e ? e.lost.slice(0, 6) : [];
    const lostNames = lostIds.map(PD).filter(Boolean).map(v => v.name);
    const cf = e && e.contact ? G.Fac.get(e.contact.fac) : null;
    return { mode, exp: e ? e.id : 0, land: found[0] || '', lands: found.length, sp: sp.slice(0, 3), lostN: d.lostN || (e ? e.lost.length : 0), lostNames, contact: cf ? cf.name : '', cout: e && e.contact ? e.contact.out : '',
      token: d.token || '', kid: d.kid ? 1 : 0, gift: d.promiseGift && e ? giftFor(e) : '', first: d.sawFirst ? 1 : 0, presumed: (e && e.presumed) || d.presumed ? 1 : 0, left: d.castaway && P(s.protag) && d.leftBehind ? 1 : 0, short: d.outC && (G.S.clock - d.outC) / DAY() < 0.6 ? 1 : 0, home: d.homeName || '', kidAge0: d.kidAge0 || 0, kinDied: d.kinDied ? 1 : 0, wreck: d.castaway || d.sank ? 1 : 0, castaway: d.castaway ? 1 : 0, ship: d.shipName || '', days: d.castaway ? Math.max(1, Math.round(G.S.day - d.castaway.d)) : 0 };
  }
  function endHome(s) {
    const p = PD(s.protag); if (!p || s.st !== 'ativa') return;
    const d = s.data; const k = P(s.cast.kin); const e = X.get(d.exp);
    const vd = voltaData(s, e, d.miracle ? 'milagre' : 'volta'); if (s.data.gave) vd.gift = s.data.gave;
    const extra = { LAND: vd.land, LOSTN: vd.lostN, GIFT: vd.gift, KINOK: k && d.metK ? 1 : 0 };
    if (!k && d.kinDied) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'hz-fim-sozinho', vars(s, extra)), { x: p.x, y: p.y, log: true, toast: true, big: 1 }); return; }
    if (d.wreckHome) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'hz-fim-naufragio', vars(s, extra)), { x: p.x, y: p.y, log: true, toast: true, big: 1 }); return; }
    if (d.miracle || vd.presumed) { St.finish(s, 'reencontro', 'feliz', St.say(s, 'hz-fim-milagre', vars(s, extra)), { x: p.x, y: p.y, log: true, toast: true, big: 1, legend: 1 }); return; }
    St.finish(s, 'cumprida', vd.lostN ? 'agridoce' : 'feliz', St.say(s, 'hz-fim-volta', vars(s, extra)), { x: p.x, y: p.y, log: true, toast: true, big: 1 });
  }

  // ====================================================================================
  //  O NÁUFRAGO
  // ====================================================================================
  SK('nf-praia', { h: 'A praia', text: [
    c => `O mar cuspiu ${c.P} numa praia ${c.WHEREDE || 'que ninguém conhece'}. Do que foi ${c.SHIP}, só tábuas${c.N > 1 ? `, e mais ${c.N - 1} ${c.N > 2 ? 'vivos' : 'vivo'}` : ''}.`,
    c => `${c.P} acordou com areia na boca, numa praia ${c.WHEREDE || 'sem nome'}. ${c.N > 1 ? `Há outros vivos na praia. Não muitos.` : 'Sozinh' + c.o + '.'}`,
  ] });
  SK('nf-deixado', { h: 'Deixad', text: [
    c => `Os navios partiram sem ${c.P}. Ficou ${c.WHERE || 'do outro lado do mar'}, vendo as velas virarem pontos e depois nada${c.N > 1 ? `, com mais ${c.N - 1}` : ''}.`,
  ] });
  SK('nf-marcas', { h: 'As marcas', text: [
    c => `${c.P} risca uma marca no tronco de uma árvore a cada nascer do sol. ${c.N > 1 ? 'Os outros pararam de contar.' : 'Fala sozinh' + c.o + ' para não esquecer a própria voz.'}`,
  ] });
  SK('nf-jangada', { h: 'A jangada', text: [
    c => `${c.P} começou a amarrar troncos com cipó. ${c.HOMEDIR ? `${c.HOMEN} fica para o ${c.HOMEDIR} — ${c.o === 'a' ? 'ela' : 'ele'} acha.` : 'Não sabe para onde fica casa. Vai assim mesmo.'}`,
  ] });
  SK('nf-zarpou', { h: 'O mar outra vez', text: [
    c => `${c.P} empurrou a jangada para a água e não olhou para trás. O mar que ${c.o === 'a' ? 'a' : 'o'} trouxe vai ter que ${c.o === 'a' ? 'levá-la' : 'levá-lo'} de volta.`,
  ] });
  SK('nf-estranhos', { h: 'Os estranhos', text: [
    c => `${c.P} chegou a ${c.TOWN}, de ${c.FT}. Ninguém entende o que ${c.o === 'a' ? 'ela' : 'ele'} fala; ${c.KIND ? 'deram comida e um canto para dormir' : 'olham para ' + (c.o === 'a' ? 'ela' : 'ele') + ' como para um bicho'}.`,
  ] });
  SK('nf-fim-mar', { h: 'O mar ficou', text: [c => `A jangada de ${c.P} não aguentou o mar aberto. Ninguém em ${c.HOMEN || 'casa'} vai saber que ${c.o === 'a' ? 'ela' : 'ele'} tentou.`] });
  SK('nf-fim-praia', { h: 'A última marca', text: [
    c => `${c.P} morreu na praia${c.WHEREDE ? ' ' + c.WHEREDE : ''}. No tronco, ${c.MARKS} marcas.`,
    c => `${c.P} morreu longe de tudo, olhando para o lado onde achava que ficava casa.`,
  ] });
  SK('nf-fim-casa', { h: 'Voltou dos mortos', text: [
    c => `${c.P} voltou para ${c.HOMEN} depois de ${c.DAYS > 1 ? c.DAYS + ' anos' : 'um ano'} como náufrag${c.o}. ${c.KN ? cap1(c.KN) + ' não acreditou até tocar.' : 'Já não havia quem esperasse.'}`,
  ] });
  SK('nf-fim-ficou', { h: 'O outro lado', text: [
    c => `${c.P} nunca voltou para ${c.HOMEN}. Ficou ${c.TOWN ? 'em ' + c.TOWN : 'naquela praia'}, e um dia parou de olhar para o mar.`,
  ] });
  function nfVars(s, extra) {
    const d = s.data; const p = PD(s.protag); const camp = (G.S.castaways || []).find(c => c.id === d.camp);
    return Object.assign({ WHERE: d.where || '', WHEREDE: d.whereDe || '', SHIP: d.shipName || 'o barco', N: camp ? camp.ids.length : 1, HOMEN: d.homeName || 'casa', HOMEDIR: d.homeDir || '', TOWN: d.townName || '', FT: d.ftName || '', KN: d.kinName || '',
      MARKS: Math.max(3, Math.round((G.S.day - (d.d0 || G.S.day)) * 12)), DAYS: Math.max(1, Math.round(G.S.day - (d.d0 || G.S.day))), o: oa(p) }, extra || {});
  }
  St.define('naufrago', {
    name: 'O Náufrago', icon: 'ship', tone: 'agridoce', tags: ['mar', 'sobrevivência'], struct: 'provacao', seedLife: 2, maxDays: 40, ripe: 0.05,
    stages: [['praia', 'A praia'], ['jangada', 'A jangada'], ['mar', 'O mar'], ['casa', 'Casa']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'reencontro' ? 3 : -1; return { praia: 0, jangada: 1, mar: 2, estranhos: 1, casa: 3 }[s.phase] || 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.homeName))}, náufrag${c.o} numa praia ${s.data.whereDe || 'que ninguém conhece'}, tenta voltar para casa.`,
    on: {
      naufrago(f) {
        const v = P(f.a); if (!v || v.age < 12 || carries('horizonte', v.id) || carries('naufrago', v.id)) return null;
        const fac = G.Fac.get(G.Fac.idOfV(v)); const cap = fac ? G.Fac.capitalOf(fac.id) : null;
        const home = G.S.settlements.get(v.set) || cap || null;
        const r = K.at(f.x, f.y); const nm = r && K.named(r) ? K.name(r) : '';
        const camp = (G.S.castaways || []).find(c => c.id === f.camp);
        const alone = !camp || camp.ids.length <= 1;
        const k = kinOf(v, null);
        return [{ protag: v.id, score: 0.58 + (alone ? 0.12 : 0) + (k ? 0.1 : 0), keyExtra: 'nf' + (f.camp || f.exp || v.id), cast: { kin: k ? k.id : 0 }, place: { kind: 'praia', name: nm ? 'a praia ' + K.de(nm) : 'uma praia distante', x: f.x, y: f.y },
          data: { camp: f.camp, exp: f.exp, d0: G.S.day, left: v.wrecked && v.wrecked.left ? 1 : 0, where: nm ? K.na(nm) : '', whereDe: nm ? K.de(nm) : '', placeName: nm, shipName: f.ship ? f.ship.replace(/^(A|O|As|Os) /, m => m.toLowerCase()) : 'o barco', home: home ? home.id : 0, homeName: home ? home.name : '', kinName: k ? k.name : '', rel: k ? St.relOf(v, k) : '',
            homeDir: home ? K.dir(home.cx - f.x, home.cy - f.y) : '' },
          motifs: ['gatilho:naufragio', 'amb:mar', 'tema:sobrevivencia'] }];
      },
    },
    valid: sd => { const v = P(sd.protag); return !!v && !!v.wrecked && !v.aboard; },
    begin(s) { s.phase = 'praia'; const p = P(s.protag); St.beat(s, s.data.left ? 'nf-deixado' : 'nf-praia', nfVars(s), { x: p ? p.x : undefined, y: p ? p.y : undefined, toast: true }); },
    tick(s) {
      const d = s.data; const p = P(s.protag); if (!p) return;
      const camp = (G.S.castaways || []).find(c => c.id === d.camp);
      // a day on the beach: the marks on the tree (a scene, far from everything)
      if (!d.marks && s.phase === 'praia' && G.S.day - d.d0 > 0.25 && !G.isNight() && !p.sleeping && !p.aboard && p.wrecked && !Sn.running(s.id)) {
        d.marks = 1; St.beat(s, 'nf-marcas', nfVars(s));
        St.scene(s, 'nf-marcas', {}, { at: [p.x, p.y], data: { n: camp ? camp.ids.length : 1 } });
      }
      if (!d.raft && camp && camp.raft >= 0.35) { d.raft = 1; s.phase = 'jangada'; St.beat(s, 'nf-jangada', nfVars(s)); }
      if (!d.sailed && p.aboard && p.wrecked !== undefined) { d.sailed = 1; s.phase = 'mar'; St.beat(s, 'nf-zarpou', nfVars(s)); }
      if (!d.native && p.task && p.task.type === 'naufrago' && p.task.st === 'native') {
        const town = G.S.settlements.get(p.task.set); const ft = town ? G.Fac.get(town.fac) : null; const rel = ft ? G.Fac.rel(G.Fac.idOfV(p), ft.id) : null;
        d.native = 1; s.phase = 'estranhos'; d.townName = town ? town.name : ''; d.ftName = ft ? ft.name : 'outro povo';
        St.beat(s, 'nf-estranhos', nfVars(s, { KIND: !rel || rel.st !== 'guerra' ? 1 : 0 }), { x: p.x, y: p.y });
      }
      // years on the far side: they make a life of it
      if (!p.wrecked && !d.homeNow && !p.aboard && G.S.day - d.d0 > 6 && p.set !== d.home) {
        St.finish(s, 'transformada', 'sereno', St.say(s, 'nf-fim-ficou', nfVars(s)), { x: p.x, y: p.y });
        return;
      }
      if (d.homeNow && !d.met && !p.aboard && !Sn.running(s.id)) {
        d.met = 1; s.phase = 'casa';
        const k = P(s.cast.kin) || kinOf(p, null); if (k) { s.cast.kin = k.id; d.kinName = k.name; d.rel = St.relOf(p, k); }
        const mir = d.presumedNow || G.S.day - d.d0 >= 2;
        St.scene(s, 'hz-volta', { k: k ? k.id : 0 }, { at: [p.x, p.y], data: { mode: mir ? 'milagre' : 'naufragio', wreck: 1, castaway: 1, left: d.left ? 1 : 0, ship: d.shipName || '', days: Math.max(1, Math.round(G.S.day - d.d0)), home: d.homeName, lostN: 0, lostNames: [], sp: [], land: '', token: '', gift: '' },
          onEnd: () => { if (s.st === 'ativa') St.finish(s, 'reencontro', 'feliz', St.say(s, 'nf-fim-casa', nfVars(s, { KN: (P(s.cast.kin) || {}).name || '' })), { x: p.x, y: p.y, log: true, toast: true, big: 1, legend: 1 }); } });
      }
    },
    react(s, f) {
      const d = s.data;
      if (f.k === 'morte' && f.a === s.protag) {
        const atSea = f.cause === 'drown' || d.sailed && !d.homeNow;
        St.finish(s, 'tragica', 'tragico', St.say(s, atSea ? 'nf-fim-mar' : 'nf-fim-praia', nfVars(s)), { x: f.x, y: f.y });
        return true;
      }
      if (f.k === 'sobrevivente' && f.a === s.protag) { d.homeNow = 1; d.presumedNow = f.presumed ? 1 : 0; return true; }
      if (f.k === 'contato' && (f.ids || []).includes(s.protag)) return true;
      return false;
    },
    urge: () => 0,
    goal: s => `Voltar para ${s.data.homeName || 'casa'}.`,
    status(s, c) {
      const p = P(s.protag); const d = s.data; if (!p) return '';
      if (p.aboard) return `${c.P} está no mar, numa jangada.`;
      if (d.native) return `${c.P} vive entre estranhos, em ${d.townName || 'terra alheia'}.`;
      return `${c.P} está ${d.where || 'numa praia distante'}, olhando para o mar.`;
    },
    obstacles: () => ['o mar', 'a fome', 'a solidão', 'a distância'],
    open: () => ['voltar para casa', 'morrer na praia', 'ficar do outro lado'],
    titles: { naufrago: () => 'O Náufrago', marcas: c => `As Marcas de ${c.P}`, praia: c => (c.s.data.whereDe ? `A Praia ${c.s.data.whereDe}` : null) },
    retitle(s, c) { if (s.end && s.end.k === 'reencontro') return `${c.P} Voltou do Mar`; if (s.end && s.end.k === 'cumprida') return `A Volta de ${c.P}`; return null; },
    forgotten: (s, c) => `Ninguém mais sabe o que foi feito de ${c.P}.`,
  });

  // ====================================================================================
  //  THE SCENES
  // ====================================================================================
  const TEMPER_K = {
    medroso: [`Dizem que lá longe o mar engole os barcos inteiros.`, `E se não tiver nada lá? E se for só água até o fim?`],
    bravo: [`Volta com o nome numa ilha. Ou não volta.`, `Se for pra ir, vai na frente de todo mundo.`],
    devoto: [`Joguei sal na água e pedi aos deuses do mar. Eles prometeram.`, `Eu vou rezar toda noite olhando pra lá.`],
    frio: [`Quanto tempo?`, `Leva o casaco grosso. Lá no meio da água faz frio.`],
    firme: [`Eu sabia. Desde que você começou a olhar pro mar desse jeito, eu sabia.`, `Vai. A casa fica de pé até você voltar.`],
  };
  const TEMPER_P = {
    bravo: [`Vou ver o que ninguém viu.`, `Quando eu voltar, vão contar essa história.`],
    medroso: [`Eu nunca saí de vista da praia...`, `Se eu não for agora, nunca mais vou.`],
    frio: [`É só água. Água tem fim.`, `Alguém tem que ir.`],
    devoto: [`Se os deuses quiserem, eu volto.`, `Reza por mim. Eu rezo por você.`],
    firme: [`Eu volto.`, `Guarda o meu lado da cama. Eu volto.`],
  };
  const WHY_SAY = {
    ferro: [`Sem ferro as forjas param. E sem forja não tem enxada, não tem nada.`],
    ouro: [`Se o ouro existir mesmo, ninguém nesta casa vai passar fome nunca mais.`],
    terra: [`Lá vai ter terra pra todo mundo. Depois eu volto pra buscar vocês.`],
    pesqueiro: [`Os peixes foram embora. Alguém tem que ir atrás deles.`],
    povo: [`Dizem que tem gente lá. Gente como a gente. Eu quero ver com os meus olhos.`],
    monstro: [`Os pescadores viram alguma coisa. Alguém tem que saber o que é.`],
    curiosidade: [`Eu preciso saber o que tem lá. Desde criança eu preciso.`],
    rival: [`Se a gente não for, os outros vão primeiro.`],
    gloria: [`O governante mandou. E quem volta, volta com o nome feito.`],
  };
  // ---- O CAIS: the farewell ----
  Sn.define('hz-cais', { imp: 2, kick: 'Além do Horizonte', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Despedindo-se no cais' : 'Dizendo adeus no cais'), *gen(c) {
    const s = c.story(); const p = c.v('p'); const e = X.get(c.data.exp); if (!s || !p || !e) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const k = c.v('k'); const hasK = k && G.dist(k.x, k.y, p.x, p.y) < 70 && c.take('k', { keep: true, force: true });
    const d = s.data; const rel = hasK ? St.relOf(p, k) : null; const kid = hasK && k.age < 13;
    const fl = ship(e.flag); const water = fl ? [fl.x, fl.y] : e.moor;
    const at = Sn.spot(e.port[0], e.port[1], 3) || [p.x, p.y];
    yield c.walk('p', at, { max: 25 });
    if (hasK) yield c.approach('k', 'p', 1.1, { max: 40, run: G.dist(k.x, k.y, p.x, p.y) > 18 });
    c.ready();
    c.mood(d.why === 'busca' || d.why === 'terra' ? 'sad' : 'hope');
    c.tag('p', d.lead ? 'quem comanda' : 'quem vai'); if (hasK) c.tag('k', 'quem fica');
    c.title('Além do Horizonte', 'O Cais');
    c.caption(`No cais de ${d.homeName}, ${fl ? G.Naval.title(fl) : 'o barco'} espera${e.ships.length > 1 ? ` com mais ${e.ships.length - 1}` : ''}. ${p.name} parte rumo ao ${d.dirw || 'mar aberto'}: ${d.whyTxt}.`, { hold: 4 });
    c.cam(hasK ? ['p', 'k', water] : ['p', water], { zoom: 3.8 });
    yield 3;
    let token = null;
    if (hasK) {
      c.face('k', 'p'); c.face('p', 'k'); c.cam(['p', 'k'], { zoom: 4.6 });
      const tk = Sn.temper(k), tp = Sn.temper(p);
      if (kid) {
        yield c.say('k', pick([`${Sn.voc(k, p)}, você vai pro fim do mundo?`, `${Sn.voc(k, p)}... o mar não acaba nunca?`]));
        c.pose('p', 'kneel'); c.cam(['p', 'k'], { zoom: 5.2 });
        yield c.say('p', pick([`Vou ver o que tem depois do horizonte, e volto pra te contar.`, `Acaba sim. E eu vou lá ver onde.`]));
        yield c.say('k', pick([`Traz um bicho de lá!`, `Traz uma coisa que ninguém nunca viu!`]));
        c.slow(0.7, 1.4);
        yield c.say('p', `Eu trago. A coisa mais estranha que eu achar. Prometo.`);
        d.promiseGift = 1;
        yield c.say('k', pick([`E se você não voltar?`, `Promete que volta também.`]), { style: 'whisper' });
        yield c.say('p', pick([`Olha pro mar toda tarde. Um dia a vela aparece.`, `Eu volto. O mar me conhece.`]));
      } else if (d.why === 'busca' && d.ofName) {
        yield c.say('k', pick([`Você não vai achar ${d.ofName}. O mar não devolve ninguém.`, `Primeiro ${d.ofName}. Agora você.`]));
        yield c.say('p', pick([`Então eu trago pelo menos a verdade.`, `Se tiver um osso numa praia, eu trago pra enterrar direito.`]));
      } else if (rel === 'mae' || rel === 'pai') {
        yield c.say('k', pick([`Teu avô também olhava pro mar assim. Um dia foi e não voltou.`, `Eu te carreguei no colo nessa praia. Não foi pra isso.`]));
        yield c.say('p', pick(WHY_SAY[d.why] || TEMPER_P[tp]));
      } else {
        yield c.say('k', pick(TEMPER_K[tk]));
        if (tp === 'medroso') c.pose('p', 'cower');
        yield c.say('p', pick((WHY_SAY[d.why] || []).concat(TEMPER_P[tp])));
        c.pose('p', '');
      }
      token = tokenFor(p, k, rel);
      c.pose('k', 'gift'); c.cam(['p', 'k'], { zoom: 5.2 });
      yield c.say('k', kid ? pick([`Toma. Pra você não esquecer de mim lá no meio do mar.`, `Leva isso. Dá sorte no mar.`]) : pick([`Leva isto. E traz de volta.`, `Isto vai com você. Eu quero de volta, entendeu?`]), { style: 'whisper' });
      c.caption(`${k.name} deu a ${p.name} ${token}.`, { hold: 2.8 });
      yield 2.2;
      c.pose('k', 'embrace'); c.pose('p', 'embrace'); c.emote('p', 'heart', 2.6); c.emote('k', 'sad', 2.6);
      c.snap('O cais');
      yield 2.8;
    } else {
      c.pose('p', 'look'); c.face('p', water);
      yield c.say('p', pick([`Vou ver o que tem lá.`, `Agora não tem mais volta.`]), { style: 'think' });
      yield 1.6;
    }
    d.token = token || d.token || '';
    c.attach();
    // the plank: the one who goes walks down to the water; the one who stays, stays
    c.pose('p', ''); const plank = Sn.spot(e.port[0], e.port[1], 1.2) || e.port;
    c.walk('p', plank, { max: 12 });
    if (hasK) { c.pose('k', kid ? 'wave' : Sn.temper(k) === 'medroso' ? 'weepk' : 'wave'); c.cam(['k', water], { zoom: 4 }); }
    c.sfx('horn', water, 0.4);
    yield 3.4;
    if (hasK) c.cam(['k'], { zoom: 4.6 });
    yield 1.4;
    return 'ok';
  } });

  // ---- A VIGÍLIA: the ship is late ----
  Sn.define('hz-vigilia', { imp: 2, kick: 'Além do Horizonte', lazy: true, doing: () => 'Esperando no cais, olhando para o mar', *gen(c) {
    const s = c.story(); const k = c.v('k'); const e = X.get(c.data.exp); if (!s || !k || !e) return 'sem';
    if (!c.take('k', { vital: true, keep: true, force: true })) return 'ocupada';
    const d = s.data; const p = PD(s.protag); const luto = c.data.mode === 'luto';
    const edge = Sn.spot(e.port[0], e.port[1], 2.5) || [k.x, k.y];
    yield c.walk('k', edge, { max: 50 });
    // someone comes to fetch them home: a neighbour, an old one, a child of the house
    const near = [...G.S.villagers.values()].filter(o => o !== k && o.id !== s.protag && !o.wrecked && o.set === k.set && !o.captive && !o.sleeping && !o.inside && !o.aboard && o.age >= 6 && G.dist(o.x, o.y, edge[0], edge[1]) < 24 && !(o.task && o.task.pri >= 3) && !X.memberOf(o.id) && !(e.crew.includes(o.id) || e.lost.includes(o.id)));
    const other = near.sort((a, b) => (St.relOf(k, b) ? 1 : 0) - (St.relOf(k, a) ? 1 : 0) || G.dist(a.x, a.y, edge[0], edge[1]) - G.dist(b.x, b.y, edge[0], edge[1]))[0];
    const hasO = other && c.take(other, { keep: true });
    if (hasO) c.cast2('n', other);
    c.ready();
    c.mood(luto ? 'sad' : 'night');
    c.tag('k', 'quem espera'); if (hasO) c.tag('n', St.relOf(k, other) ? 'da família' : 'vizinh' + oa(other));
    c.title('Além do Horizonte', luto ? 'As Flores' : 'A Vigília');
    const sea = e.moor;
    c.face('k', sea); c.pose('k', G.isNight() ? 'lantern' : 'look');
    c.caption(luto ? `Em ${d.homeName}, já falam ${de(d.expName)} como dos mortos. ${k.name} desceu ao cais com flores.` : `${cap1(d.shipName || 'O barco')} devia ter voltado com a lua nova. A lua já mudou. Todo fim de tarde, ${k.name} desce ao cais de ${d.homeName}.`, { hold: 4 });
    c.cam(['k', sea], { zoom: 3.6 });
    c.sfx('waves', sea, 0.5);
    yield 3.4;
    if (hasO) {
      yield c.walk('n', Sn.spot(edge[0] + 1.2, edge[1] + 0.6, 1.2) || edge, { max: 20 });
      c.face('n', 'k'); c.cam(['k', 'n'], { zoom: 4.6 });
      yield c.say('n', luto ? pick([`Vem pra casa. Não adianta mais.`, `Os deuses do mar ficaram com eles. Vem.`]) : pick([`Vem pra casa. Está esfriando.`, `Meu avô dizia que o mar do ${d.dirw || 'lado de lá'} não devolve ninguém.`, `Amanhã você volta. Hoje vem jantar.`]));
      c.face('k', 'n');
      yield c.say('k', luto ? pick([`Eu sei. Eu só quero ficar mais um pouco.`, `Ninguém viu o barco afundar. Ninguém.`]) : pick([`Prometeu que voltava.`, `Mais um pouco. Só até escurecer.`, `Se eu não vier, quem vai acender a luz pra ${p && p.g === 'f' ? 'ela' : 'ele'} achar o porto?`]));
      c.face('k', sea);
    } else {
      yield c.say('k', luto ? pick([`Leva isso pra onde você estiver.`, `Se o mar ficou com você, que te trate bem.`]) : pick([`Volta. Só volta.`, `Onde você está?`]), { style: 'whisper' });
    }
    if (luto) { c.pose('k', 'reach'); c.caption(`${k.name} jogou as flores na água. A maré levou para o ${d.dirw || 'mar'}.`, { hold: 3 }); yield 2.6; c.pose('k', 'weepk'); }
    c.snap(luto ? 'As flores' : 'A vigília');
    yield 2;
    // far away — the god sees both
    const pp = P(s.protag);
    if (pp) {
      const sh = pp.aboard ? ship(pp.aboard) : null; const at = sh ? [sh.x, sh.y] : [pp.x, pp.y];
      c.cam([at], { zoom: 3.4, cut: true });
      c.caption(sh ? `Muito longe dali, ${pp.name} olha a mesma lua do convés ${deL(G.Naval.title(sh))}.` : pp.wrecked ? `Muito longe dali, numa praia sem nome, ${pp.name} acende uma fogueira e olha para o mesmo mar.` : `Muito longe dali, ${pp.name} olha a mesma lua.`, { hold: 3.6 });
      yield 3.6;
      c.cam(['k', sea], { zoom: 3.8, cut: true });
      yield 1.6;
    } else { c.caption(`O mar não diz nada.`, { hold: 2.6 }); yield 2.6; }
    c.attach();
    return 'ok';
  } });

  // ---- A VOLTA: the plank (or the street), and the one who waited ----
  Sn.define('hz-volta', { imp: 3, kick: 'Além do Horizonte', lazy: true, doing: () => 'Voltando do mar', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const k = c.v('k'); const hasK = k && G.dist(k.x, k.y, p.x, p.y) < 80 && c.take('k', { keep: true, force: true });
    const D = c.data; const milagre = D.mode === 'milagre';
    if (hasK && G.dist(k.x, k.y, p.x, p.y) > 6) { const near = Sn.spot(p.x + 3.5, p.y + 2.5, 2.5) || [p.x, p.y]; yield c.walk('k', near, { max: 40, run: true }); }
    c.ready();
    c.mood('hope');
    c.tag('p', milagre ? 'de volta dos mortos' : 'de volta do mar'); if (hasK) c.tag('k', 'quem esperou');
    c.title(s.type === 'naufrago' ? 'O Náufrago' : 'Além do Horizonte', milagre ? 'Voltou dos Mortos' : 'A Volta');
    const nauf = D.mode === 'naufragio'; const given = D.mode === 'volta' && D.presumed;
    c.caption(nauf ? `${p.name} chega a ${D.home || 'casa'} a pé, encharcad${oa(p)}, pela praia. ${cap1(D.ship || 'o barco')} ficou no fundo do mar.` : milagre ? `Ninguém em ${D.home || 'casa'} esperava mais ${p.name}. ${D.days > 1 ? `Depois de ${D.days} anos` : 'Depois de tanto tempo'}, ${p.g === 'f' ? 'ela' : 'ele'} sobe a rua, magr${oa(p)}, queimad${oa(p)} de sol, com roupas que não são daqui.` : `${p.name} desce pela prancha no cais de ${D.home || 'casa'}${D.lostN ? `. ${D.lostN > 1 ? D.lostN + ' dos que partiram não voltaram' : 'Um dos que partiram não voltou'}` : ''}.${given ? ' Em casa, já ninguém esperava.' : ''}`, { hold: 4 });
    c.cam(hasK ? ['p', 'k'] : ['p'], { zoom: 3.8 });
    yield 2.4;
    if (!hasK) {
      c.pose('p', 'look'); s.data.metK = 0;
      if (!D.kinDied && s.data.kinName && k) c.caption(`Ninguém no cais. ${s.data.kinName} ainda não sabe que ${p.name} voltou.`, { hold: 3 });
      if (D.kinDied) { c.caption(`A casa está fechada. ${s.data.kinName || 'Quem esperava'} morreu enquanto ${p.name} estava no mar.`, { hold: 3.4 }); c.pose('p', 'kneel'); yield c.say('p', pick([`Eu voltei... eu voltei.`, `Trouxe ${D.token || 'tudo'} de volta. Pra quem?`]), { style: 'whisper' }); }
      else yield c.say('p', pick([`Voltei.`, `Ninguém...`, `Casa.`]), { style: 'whisper' });
      c.snap('A volta'); c.attach(); yield 2.4; return 'ok';
    }
    const grew = k.age < 18 && D.kidAge0 && !D.short && k.age - D.kidAge0 >= 1.5;
    s.data.metK = 1;
    c.face('k', 'p');
    if (milagre) { c.pose('k', 'look'); c.emote('k', 'question', 2.4); yield c.say('k', pick([`...${p.name}?`, `Não. Não pode ser.`]), { style: 'whisper' }); c.slow(0.55, 2.4); yield 1.6; }
    c.emote('k', 'heart', 2.4); c.cam(['p', 'k'], { zoom: 4.4 });
    yield c.say('k', k.age < 13 ? `${Sn.voc(k, p).toUpperCase()}!` : pick([`${Sn.voc(k, p)}!`, `Você voltou... você voltou!`]), { style: 'shout' });
    yield c.approach('k', 'p', 0.9, { run: true, max: 20 });
    c.pose('k', 'embrace'); c.pose('p', 'embrace'); c.slow(0.6, 2.2);
    if (grew) c.caption(`${k.name} cresceu. ${p.name} quase não ${k.g === 'f' ? 'a' : 'o'} reconheceu.`, { hold: 2.6 });
    yield 2.8;
    // what they saw, said in a few words on the quay
    if (milagre || given) yield c.say('k', pick([`Disseram que você tinha morrido. Eu joguei flores no mar.`, `Eu acendia a luz toda noite. Todo mundo dizia que era loucura.`]), { style: 'whisper' });
    else if (nauf) yield c.say('k', pick([`O que aconteceu? Cadê ${D.ship ? D.ship.replace(/^(o|a) (\S+).*/, (m, a, n) => (a === 'a' ? 'a ' : 'o ') + n) : 'o barco'}?`, `Você está gelad${oa(p)}! O que foi que houve?`]), { style: 'whisper' });
    else if (D.short && !D.land) yield c.say('k', k.age < 13 ? pick([`Já voltou? Viu alguma coisa?`, `Já? Você nem demorou!`]) : pick([`Já? Eu nem tinha começado a sentir saudade.`, `Tão cedo? O mar não deixou?`]));
    else if (k.age < 13) yield c.say('k', pick([`Você viu o fim do mundo?`, `O que tem lá? O que tem lá?`]));
    else yield c.say('k', pick([`Eu descia aqui todo fim de tarde.`, `Olha pra você. Magr${oa(p)} que dá dó.`]), { style: 'whisper' });
    c.pose('p', ''); c.pose('k', '');
    if (D.castaway && D.left) yield c.say('p', pick([`Os navios foram embora sem mim. Eu fiquei na praia, contando os dias num tronco.`, `Me deixaram pra trás. Eu fiz uma jangada com as próprias mãos.`]));
    else if (D.castaway) yield c.say('p', pick([`O barco afundou. Eu fiquei numa praia, contando os dias num tronco.`, `O mar me jogou numa praia. Eu fiz uma jangada com as próprias mãos.`]));
    else if (D.wreck) yield c.say('p', pick([`O mar ficou com o barco. Comigo, não.`, `Afundou. Eu nadei até não sentir os braços, e depois nadei mais.`]));
    else if (D.land) yield c.say('p', D.first ? `Tem terra lá, depois do horizonte. Fui eu que vi primeiro! A gente chamou de ${D.land}.` : `Tem terra lá, depois do horizonte. ${D.land}. ${D.lands > 1 ? 'E mais.' : ''}`.trim());
    else if (D.short) yield c.say('p', pick([`O mar mandou voltar. Nada no horizonte, e a comida contada.`, `Só água. Mas da próxima vez eu vou mais longe.`]));
    else yield c.say('p', pick([`Não tem nada lá. Só mar. Mas eu precisava ver.`, `Água, água e mais água. E o céu mais bonito que eu já vi.`]));
    if (D.sp && D.sp.length) yield c.say('p', `E bichos que ninguém nunca viu. ${cap1(D.sp[0])}${D.sp[1] ? ', ' + D.sp[1] : ''}...`);
    if (D.contact) yield c.say('p', D.cout === 'violencia' ? `Tem gente lá. ${D.contact}. Não gostaram da gente.` : `Tem gente lá. Falam outra língua. ${D.contact}.`);
    if (D.lostNames && D.lostNames.length) { c.cam(['p', 'k'], { zoom: 5 }); yield c.say('p', D.lostNames.length > 1 ? `Nem todos voltaram. ${D.lostNames.slice(0, 2).join(' e ')}... ficaram lá.` : `${D.lostNames[0]} não voltou.`, { style: 'whisper' }); }
    if (D.gift) { c.pose('p', 'gift'); c.cam(['p', 'k'], { zoom: 5.4 }); yield c.say('p', `Eu prometi.`); c.caption(`${p.name} trouxe para ${k.name} ${D.gift}.`, { hold: 3 }); s.data.gave = D.gift; c.emote('k', 'heart', 2.4); yield 2.4; }
    if (D.token) { c.pose('p', 'gift'); c.cam(['p', 'k'], { zoom: 5.4 }); yield c.say('p', pick([`Trouxe de volta. Como prometi.`, `${cap1(D.token)}. Esteve comigo o tempo todo.`]), { style: 'whisper' }); c.emote('k', 'heart', 2.4); }
    c.snap(milagre ? 'Voltou dos mortos' : 'A volta');
    c.attach();
    yield 2.6;
    return 'ok';
  } });

  // ---- A NOTÍCIA: the ship comes home without them ----
  Sn.define('hz-noticia', { imp: 3, kick: 'Além do Horizonte', lazy: true, doing: (sc, v) => (v.id === sc.cast.m ? 'Levando uma notícia que ninguém quer ouvir' : 'Procurando um rosto na prancha'), *gen(c) {
    const s = c.story(); const k = c.v('k'); if (!s || !k) return 'sem';
    if (!c.take('k', { vital: true, keep: true, force: true })) return 'ocupada';
    const m = c.v('m'); const hasM = m && G.dist(m.x, m.y, k.x, k.y) < 80 && c.take('m', { keep: true, force: true });
    const d = s.data; const p = PD(s.protag); const e = X.get(d.exp);
    const quay = e ? e.port : [k.x, k.y];
    yield c.walk('k', Sn.spot(quay[0], quay[1], 2.5) || quay, { max: 40, run: G.dist(k.x, k.y, quay[0], quay[1]) > 16 });
    c.ready();
    c.mood('sad');
    c.tag('k', 'quem esperou'); if (hasM) c.tag('m', e && m.id === e.leader ? 'quem comandava' : 'companheir' + oa(m) + ' de bordo');
    c.title('Além do Horizonte', 'A Notícia');
    c.caption(`${cap1(d.expName)} voltou para ${d.homeName}. ${k.name} procurou ${p ? p.name : 'um rosto'} em cada rosto que desceu a prancha.`, { hold: 3.8 });
    c.cam(['k'], { zoom: 4.2 }); c.pose('k', 'look');
    yield 3;
    if (!hasM) { c.caption(`Não estava lá.`, { hold: 2.4 }); c.pose('k', 'weepk'); c.sfx('sob'); c.snap('A notícia'); c.attach(); yield 3.2; return 'ok'; }
    c.cam(['m', 'k'], { zoom: 3.8 });
    yield c.approach('m', 'k', 1.3, { slow: true, max: 25 });
    c.face('m', 'k'); c.face('k', 'm'); c.cam(['m', 'k'], { zoom: 4.8 });
    yield 1.8;
    c.emote('k', 'question', 2);
    yield c.say('k', pick([`Cadê ${p ? p.name : 'ele'}? Ficou no outro barco?`, `Não. Não diz nada.`]), { style: 'whisper' });
    c.slow(0.55, 2.6);
    const cause = c.data.cause;
    const how = cause === 'drown' ? (c.data.storm ? pick([`Foi a tempestade. Uma onda maior que as outras levou ${p && p.g === 'f' ? 'ela' : 'ele'} do convés. A gente procurou até o sol nascer.`, `Caiu na água na tempestade. Eu vi a mão ${p && p.g === 'f' ? 'dela' : 'dele'}, e depois não vi mais.`]) : pick([`Caiu na água. O mar estava calmo, e mesmo assim não voltou à tona. Ninguém entende.`, `Foi o mar. Num instante estava na amurada, no outro não estava mais.`])) : cause === 'sick' ? `A febre do mar. Nós ${p && p.g === 'f' ? 'a' : 'o'} entregamos às ondas, com as orações certas.` : cause === 'hunger' ? `A fome. ${p && p.g === 'f' ? 'Ela' : 'Ele'} dava a parte ${p && p.g === 'f' ? 'dela' : 'dele'} para os mais novos.` : c.data.beast ? `Foi ${c.data.bg === 'f' ? 'uma' : 'um'} ${c.data.beast}${c.data.place ? ', ' + c.data.place : ''}. Saiu do mato de repente. Não deu tempo de nada.` : c.data.ft ? `A gente de ${c.data.ft}${c.data.place ? ', ' + c.data.place : ''}. ${p && p.g === 'f' ? 'Ela' : 'Ele'} ficou pra trás pra gente chegar nos barcos.` : `Do outro lado do mar${c.data.place ? ', ' + c.data.place : ''}. Lutando.`;
    yield c.say('m', how, { style: 'whisper' });
    c.pose('k', 'weepk'); c.sfx('sob');
    if (c.data.token && cause !== 'drown') { c.pose('m', 'gift'); yield c.say('m', `Isto estava com ${p ? p.name : 'el' + (p && p.g === 'f' ? 'a' : 'e')}. Achei que devia voltar pra você.`, { style: 'whisper' }); c.caption(`${cap1(c.data.token)}.`, { hold: 2.4 }); yield 2; }
    else if (c.data.token) c.caption(`${cap1(c.data.token)} foi junto para o fundo.`, { hold: 2.6 });
    c.pose('m', 'kneel'); c.cam(['k', 'm'], { zoom: 5.2 });
    c.snap('A notícia'); c.attach();
    yield 3.4;
    return 'ok';
  } });

  // ---- AS MARCAS: a day on the beach nobody knows ----
  Sn.define('nf-marcas', { imp: 1, kick: 'O Náufrago', lazy: true, doing: () => 'Contando os dias num tronco', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const d = s.data;
    // the tree nearest the beach
    let tree = null, bd = 1e9; const S = G.S; const W = G.W;
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const x = Math.floor(p.x) + dx, y = Math.floor(p.y) + dy; if (!W.inb(x, y)) continue; const i = W.idx(x, y); if (S.treeAt[i] > 0 && G.dist(x, y, p.x, p.y) < bd) { bd = G.dist(x, y, p.x, p.y); tree = [x + 0.5, y + 0.5]; } }
    const at = tree ? Sn.spot(tree[0] + 0.6, tree[1] + 0.4, 1.5) || [p.x, p.y] : [p.x, p.y];
    yield c.walk('p', at, { max: 20 });
    c.ready();
    c.mood('sad');
    c.tag('p', 'náufrag' + oa(p));
    c.title('O Náufrago', 'As Marcas');
    c.caption(`${d.whereDe ? 'Na praia ' + d.whereDe : 'Numa praia que ninguém conhece'}. ${d.homeName ? `${d.homeName} fica para o ${d.homeDir || 'lado de lá'} — ou ${p.g === 'f' ? 'ela' : 'ele'} acha que fica.` : ''}`.trim(), { hold: 4 });
    c.cam(['p'], { zoom: 4.4 });
    if (tree) { c.face('p', tree); c.pose('p', 'cut'); }
    yield 3;
    c.pose('p', '');
    const n = Math.max(3, Math.round((G.S.day - (d.d0 || G.S.day)) * 12));
    yield c.say('p', pick([`${n} marcas. ${n} sóis.`, `Mais uma. Amanhã, outra.`]), { style: 'think' });
    const camp = (G.S.castaways || []).find(q => q.id === d.camp);
    const other = camp ? camp.ids.map(P).find(o => o && o.id !== p.id && G.dist(o.x, o.y, p.x, p.y) < 20) : null;
    if (other && c.take(other, { keep: true })) {
      c.cast2('o', other);
      yield c.approach('o', 'p', 1.2, { max: 15 });
      c.face('o', 'p'); c.face('p', 'o'); c.cam(['p', 'o'], { zoom: 4.6 });
      yield c.say('o', pick([`Pra que contar? Ninguém vem buscar a gente.`, `Achei mais coco do outro lado das pedras.`, `Você acha que eles ainda procuram?`]));
      yield c.say('p', pick([`Pra não esquecer que tem um lá fora.`, `Se ninguém vem, a gente vai.`, `Procuram. ${d.kinName || 'Alguém'} procura.`]));
    } else {
      c.pose('p', 'look'); c.face('p', d.homeDir ? [p.x + (d.homeDir.includes('leste') ? 8 : d.homeDir.includes('oeste') ? -8 : 0), p.y + (d.homeDir.includes('sul') ? 8 : d.homeDir.includes('norte') ? -8 : 0)] : [p.x + 6, p.y]);
      yield c.say('p', d.kinName ? pick([`${d.kinName}... ainda acende a luz?`, `Espera mais um pouco, ${d.kinName}.`]) : pick([`Alguém ainda lembra de mim?`, `Fala, ${p.name}. Fala alto, pra não esquecer a voz.`]), { style: 'whisper' });
    }
    c.cam(['p'], { zoom: 3.6 });
    c.snap('As marcas'); c.attach();
    yield 2.4;
    return 'ok';
  } });
})(window.G);
