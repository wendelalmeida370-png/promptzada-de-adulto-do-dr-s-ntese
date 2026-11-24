// soc-atos: the vocabulary of the social acts (SOCIEDADE.md §3.4, D-544) — every act the world may give a person between people
// (v.act), with its family, whether it is between two, the distance the world keeps the two at and the act of the other, and a
// reference length. One list for the three pillars: the society gives only acts from here (rule 195), the life that is seen gives
// every act here a pose (at least its family's), and the sound has a line for every act the world gives (rule 54). Pure: no world,
// no chance. The acts the world already gives keep their names.
(function (G) {
  'use strict';
  const FAM = Object.freeze(['encontro', 'conversa', 'afeto', 'conflito', 'familia', 'festa', 'pedido', 'respeito', 'sozinho', 'crime']);
  // name: [family, between two (1) or alone (0), metres between the two, the act of the other (the second of the pair), seconds]
  const DEF = {
    // (the world's already)
    talk: ['conversa', 1, 1.2, 'listen', 4], chat: ['conversa', 1, 1.2, 'chat', 4], hug: ['afeto', 1, 0.45, 'hug', 3],
    weep: ['sozinho', 0, 0, '', 4], mourn: ['sozinho', 0, 0, '', 6], cheer: ['festa', 0, 0, '', 3], boo: ['festa', 0, 0, '', 3],
    shove: ['conflito', 1, 0.7, 'stagger', 1], shout: ['conflito', 0, 0, '', 2], swear: ['conflito', 0, 0, '', 2],
    cower: ['sozinho', 0, 0, '', 2], kneel: ['respeito', 0, 0, '', 3], fight: ['conflito', 1, 1, 'fight', 3], stagger: ['conflito', 0, 0, '', 1],
    // (new: the society gives them, the life that is seen poses them)
    greet: ['encontro', 1, 1.6, 'greet', 1.5], farewell: ['encontro', 1, 1.6, 'farewell', 1.5], bow: ['respeito', 1, 1.8, 'nod', 2],
    nod: ['respeito', 0, 0, '', 1], salute: ['respeito', 1, 2, 'nod', 1.5],
    listen: ['conversa', 1, 1.2, 'talk', 4], laugh: ['conversa', 0, 0, '', 2], agree: ['conversa', 1, 1.2, 'talk', 1.5],
    disagree: ['conversa', 1, 1.2, 'talk', 1.5], gossip: ['conversa', 1, 0.8, 'listen', 4], tell: ['conversa', 1, 1.4, 'listen', 6],
    kiss: ['afeto', 1, 0.35, 'kiss', 2.5], console: ['afeto', 1, 0.6, 'weep', 4], handhold: ['afeto', 1, 0.5, 'handhold', 6],
    carry: ['afeto', 1, 0.4, 'carried', 6], carried: ['afeto', 0, 0, '', 6], caress: ['afeto', 1, 0.6, '', 3],
    argue: ['conflito', 1, 1.3, 'argue', 5], insult: ['conflito', 1, 1.4, 'cower', 2], threaten: ['conflito', 1, 1.1, 'cower', 2],
    spit: ['conflito', 1, 1.6, '', 1], separate: ['conflito', 1, 0.8, '', 2],
    scold: ['familia', 1, 1, 'heed', 4], heed: ['familia', 0, 0, '', 4], call: ['familia', 0, 0, '', 2],
    toast: ['festa', 1, 0.9, 'toast', 2], drink: ['festa', 0, 0, '', 3], sing: ['festa', 0, 0, '', 6], dancepair: ['festa', 1, 0.6, 'dancepair', 6],
    ask: ['pedido', 1, 1.1, 'listen', 2], offer: ['pedido', 1, 0.9, 'listen', 2], propose: ['pedido', 1, 0.9, 'listen', 4],
    accept: ['pedido', 0, 0, '', 1.5], refuse: ['pedido', 0, 0, '', 1.5], plead: ['pedido', 1, 1, 'listen', 3], help: ['pedido', 1, 0.7, 'helped', 4], helped: ['pedido', 0, 0, '', 4],
    pet: ['afeto', 1, 0.6, '', 3],
    celebrate: ['sozinho', 0, 0, '', 3], startle: ['sozinho', 0, 0, '', 1], contemplate: ['sozinho', 0, 0, '', 8], sigh: ['sozinho', 0, 0, '', 2],
    flee: ['crime', 0, 0, '', 2], surrender: ['crime', 0, 0, '', 2], shackle: ['crime', 1, 0.6, 'bound', 3], bound: ['crime', 0, 0, '', 3],
    // (the drink, T2's acts — their gestures and the two parts of each act of two, T6: the cup thrown in a face from a step and the one who
    // gets it, the song and the dance of the drunk alone, the faint, the one on the floor dragged out by the keeper or carried home by a friend)
    'jogar-bebida': ['conflito', 1, 1, 'molhado', 1.4], molhado: ['conflito', 0, 0, '', 1.8], cantoria: ['festa', 0, 0, '', 6], danca: ['festa', 0, 0, '', 10],
    desmaio: ['sozinho', 0, 0, '', 60], arrastar: ['afeto', 1, 0.9, 'arrastado', 8], arrastado: ['afeto', 0, 0, '', 8],
  };
  const A = G.SocAtos = {};
  A.FAM = FAM;
  A.LIST = Object.freeze(Object.keys(DEF));
  const OF = new Map(A.LIST.map(k => { const d = DEF[k]; return [k, Object.freeze({ k, fam: d[0], duo: !!d[1], dist: d[2], rev: d[3] || '', dur: d[4] })]; }));
  A.has = k => OF.has(k);
  A.of = k => OF.get(k) || null;
  A.ofFam = f => A.LIST.filter(k => OF.get(k).fam === f);
})(window.G);
