'use strict';
// ============================================================
//  Gestos: what a beast's body is doing now — the one vocabulary
//  the world speaks and the views pose (D-276). The brain and the
//  world around the beasts choose a gesture through the one door,
//  G.Animals.gesture(a, nome, dur, outro, var) — a.gest, a.gestT
//  (seconds into it, the world's), a.gestD (how long; 0 = held
//  until another), a.gestO (the other: prey, rival, mate, young,
//  carcass, tree — an id, or 0), a.gestV (a variant the world
//  chose: the side, the place of the bite) —; the 3D (FaunaAnim)
//  and the god's view (fauna-art) pose it. Pure data: no world,
//  no chance. A gesture nobody here knows is an error the world
//  counts (G.Animals.gestErr) and the verifier reports.
//  Each: nome (what the inspector says: «bebendo»), d (seconds;
//  0 held), loop (repeats while held), p (1 the hunt and the
//  fight — the showpiece —, 2 the daily life, 3 the flavour),
//  who (the kinds that can do it: groups and kinds).
// ============================================================
(function (G) {
  const Ge = G.Gestos = {};
  // the groups of kinds, by body and by ways
  const GR = Ge.GROUPS = {
    cat: ['lion', 'tiger', 'leopard', 'jaguar', 'snowleopard', 'gato'],
    canid: ['wolf', 'fox', 'arcticfox', 'fennec', 'hyena', 'cao'],
    bear: ['bear', 'polarbear'],
    ruminant: ['deer', 'reindeer', 'muskox', 'gazelle', 'giraffe', 'camel', 'buffalo', 'bison', 'gnu', 'moose', 'ibex', 'vaca', 'ovelha', 'cabra'],
    antler: ['deer', 'reindeer', 'moose'],
    horned: ['muskox', 'buffalo', 'bison', 'gnu', 'ibex', 'cabra', 'vaca', 'gazelle', 'rhino', 'ovelha'],
    equid: ['zebra', 'cavalo'],
    kicker: ['zebra', 'cavalo', 'gnu', 'giraffe', 'camel', 'ostrich', 'moose', 'deer', 'reindeer', 'gazelle'],
    pachy: ['elephant', 'rhino', 'hippo'],
    swine: ['boar', 'porco', 'tapir'],
    small: ['rabbit', 'hare', 'capybara', 'beaver', 'otter', 'monkey', 'sloth'],
    snake: ['python', 'viper', 'anaconda'],
    sprawl: ['croc', 'lizard'],
    frog: ['frog'],
    pinniped: ['seal', 'walrus'],
    groundbird: ['ostrich', 'penguin', 'peru', 'galinha', 'pombo'],
    airbird: ['gull', 'eagle', 'vulture', 'raven', 'parrot', 'heron', 'flamingo', 'stork', 'goose', 'toucan', 'owl'],
    wader: ['heron', 'flamingo', 'stork', 'goose'],
    raptor: ['eagle', 'owl'],
    sea: ['dolphin', 'whale', 'shark', 'orca', 'turtle'],
  };
  GR.hoofed = [...new Set([...GR.ruminant, ...GR.equid, ...GR.swine, 'rhino', 'hippo'])];
  GR.mammal = [...new Set([...GR.cat, ...GR.canid, ...GR.bear, ...GR.hoofed, ...GR.pachy, ...GR.small, ...GR.pinniped, 'elephant'])];
  GR.quad = [...new Set([...GR.cat, ...GR.canid, ...GR.bear, ...GR.hoofed, ...GR.pachy, 'rabbit', 'hare', 'capybara', 'beaver', 'otter', 'monkey'])];
  GR.bird = [...GR.groundbird, ...GR.airbird];
  GR.predator = [...GR.cat, ...GR.canid, ...GR.bear, 'croc', 'python', 'anaconda', 'viper', 'eagle', 'owl'];
  GR.land = [...new Set([...GR.quad, ...GR.snake, ...GR.sprawl, ...GR.frog, ...GR.pinniped, ...GR.bird, 'sloth'])];
  GR.prey = GR.land.filter(k => !GR.predator.includes(k) || ['fox', 'arcticfox', 'fennec', 'gato', 'lizard', 'viper'].includes(k));
  const DEF = Ge.DEF = {
    // ---------------- the rest and the care of the body ----------------
    sleep: { nome: 'dormindo', d: 0, loop: true, p: 2, who: ['land'] },
    lie: { nome: 'deitado', d: 0, loop: true, p: 2, who: ['quad', 'pinniped', 'sprawl'] },
    ruminate: { nome: 'ruminando', d: 0, loop: true, p: 2, who: ['ruminant'] },
    yawn: { nome: 'bocejando', d: 2.2, p: 3, who: ['cat', 'canid', 'bear', 'hippo', 'monkey', 'croc'] },
    stretch: { nome: 'espreguiçando', d: 2.8, p: 3, who: ['cat', 'canid', 'bear'] },
    shake: { nome: 'sacudindo o corpo', d: 1.4, p: 2, who: ['quad', 'bird'] },
    groom: { nome: 'se lambendo', d: 6, loop: true, p: 3, who: ['cat', 'canid', 'bear', 'rabbit', 'hare', 'monkey', 'beaver', 'otter', 'capybara'] },
    scratch: { nome: 'se coçando', d: 2.4, p: 3, who: ['canid', 'cat', 'rabbit', 'hare', 'hoofed', 'bear', 'monkey'] },
    roll: { nome: 'rolando no chão', d: 3.5, p: 3, who: ['canid', 'cat', 'bear', 'equid', 'gnu', 'bison', 'camel'] },
    wallow: { nome: 'chafurdando na lama', d: 0, loop: true, p: 2, who: ['boar', 'porco', 'hippo', 'rhino', 'buffalo', 'elephant', 'bison', 'tapir', 'capybara'] },
    dustbath: { nome: 'tomando banho de terra', d: 5, p: 3, who: ['elephant', 'galinha', 'peru', 'pombo', 'bison', 'zebra', 'ostrich'] },
    bask: { nome: 'tomando sol', d: 0, loop: true, p: 2, who: ['croc', 'lizard', 'snake', 'frog', 'pinniped', 'monkey', 'cat'] },
    gape: { nome: 'de boca aberta ao sol', d: 0, loop: true, p: 3, who: ['croc', 'lizard'] },
    preen: { nome: 'alisando as penas', d: 5, loop: true, p: 3, who: ['bird'] },
    pant: { nome: 'ofegando', d: 0, loop: true, p: 2, who: ['canid', 'cat', 'bear', 'hoofed', 'bird'] },
    // ---------------- the senses ----------------
    sniff: { nome: 'farejando o chão', d: 2.5, p: 2, who: ['quad'] },
    scent: { nome: 'cheirando o vento', d: 2.2, p: 2, who: ['cat', 'canid', 'bear', 'hoofed', 'elephant', 'rhino'] },
    alert: { nome: 'em alerta', d: 3, p: 1, who: ['land'] },
    listen: { nome: 'escutando', d: 2, p: 2, who: ['hoofed', 'rabbit', 'hare', 'cat', 'canid', 'elephant'] },
    stare: { nome: 'encarando', d: 0, p: 1, who: ['land'] },
    startle: { nome: 'assustado', d: 0.7, p: 1, who: ['prey'] },
    stot: { nome: 'saltando de pernas duras', d: 2.4, p: 2, who: ['gazelle', 'ibex', 'deer', 'reindeer', 'gnu'] },
    snort: { nome: 'bufando', d: 1.2, p: 2, who: ['hoofed', 'elephant', 'rhino', 'hippo'] },
    howl: { nome: 'uivando', d: 4, p: 2, who: ['wolf', 'cao', 'arcticfox', 'fox', 'hyena'] },
    roar: { nome: 'rugindo', d: 3, p: 1, who: ['lion', 'tiger', 'jaguar', 'leopard', 'bear', 'polarbear', 'hippo', 'croc'] },
    trumpet: { nome: 'barrindo', d: 2.5, p: 2, who: ['elephant'] },
    bellow: { nome: 'bramindo', d: 3, p: 2, who: ['deer', 'reindeer', 'moose', 'bison', 'buffalo', 'gnu', 'vaca', 'camel', 'muskox'] },
    call: { nome: 'chamando', d: 1.8, p: 2, who: ['land'] },
    // ---------------- eating and drinking ----------------
    browse: { nome: 'comendo folhas no alto', d: 0, loop: true, p: 2, who: ['giraffe', 'elephant', 'camel', 'moose', 'cabra', 'ibex', 'deer', 'tapir', 'monkey', 'rhino'] },
    rear: { nome: 'em pé nas patas de trás', d: 2.5, p: 2, who: ['bear', 'cabra', 'ibex', 'equid', 'elephant', 'monkey', 'giraffe'] },
    dig: { nome: 'cavando', d: 4, loop: true, p: 2, who: ['boar', 'porco', 'bear', 'canid', 'rabbit', 'hare', 'elephant', 'beaver', 'ostrich', 'galinha'] },
    root: { nome: 'fuçando a terra', d: 0, loop: true, p: 3, who: ['swine'] },
    drink: { nome: 'bebendo', d: 0, loop: true, p: 1, who: ['land'] },
    chew: { nome: 'mastigando', d: 2, p: 2, who: ['land'] },
    tear: { nome: 'rasgando a carne', d: 0, loop: true, p: 1, who: ['cat', 'canid', 'bear', 'croc', 'eagle', 'vulture', 'raven', 'owl'] },
    gnaw: { nome: 'roendo', d: 0, loop: true, p: 3, who: ['canid', 'bear', 'beaver', 'rabbit', 'hare'] },
    fish: { nome: 'pescando', d: 0, loop: true, p: 2, who: ['bear', 'polarbear', 'heron', 'stork', 'otter', 'gull'] },
    peck: { nome: 'bicando', d: 0, loop: true, p: 2, who: ['bird'] },
    fell: { nome: 'derrubando uma árvore', d: 6, p: 2, who: ['elephant'] },
    carry: { nome: 'carregando na boca', d: 0, p: 2, who: ['cat', 'canid', 'bear', 'otter', 'beaver', 'monkey', 'raven'] },
    drag: { nome: 'arrastando a presa', d: 0, loop: true, p: 1, who: ['cat', 'canid', 'bear', 'croc'] },
    cache: { nome: 'enterrando a comida', d: 4, p: 3, who: ['fox', 'arcticfox', 'fennec', 'cao', 'wolf', 'bear'] },
    swallow: { nome: 'engolindo a presa inteira', d: 0, loop: true, p: 1, who: ['snake', 'heron', 'stork', 'croc', 'frog'] },
    // ---------------- among their own ----------------
    nuzzle: { nome: 'encostando no outro', d: 2.5, p: 2, who: ['mammal'] },
    allogroom: { nome: 'lambendo o outro', d: 6, loop: true, p: 2, who: ['cat', 'canid', 'monkey', 'equid', 'elephant', 'hoofed'] },
    play: { nome: 'brincando', d: 4, loop: true, p: 2, who: ['cat', 'canid', 'bear', 'otter', 'monkey', 'elephant', 'hoofed', 'rabbit', 'hare'] },
    suckle: { nome: 'mamando', d: 0, loop: true, p: 2, who: ['mammal'] },
    nurse: { nome: 'amamentando', d: 0, loop: true, p: 2, who: ['mammal'] },
    mate: { nome: 'acasalando', d: 5, p: 2, who: ['land'] },
    court: { nome: 'cortejando', d: 6, loop: true, p: 2, who: ['bird', 'antler', 'lion', 'equid', 'bison', 'vaca', 'peru'] },
    display: { nome: 'ameaçando com o corpo', d: 3, p: 1, who: ['elephant', 'bear', 'buffalo', 'bison', 'gnu', 'rhino', 'hippo', 'cat', 'canid', 'snake', 'croc', 'ostrich', 'raptor', 'peru', 'muskox', 'moose'] },
    submit: { nome: 'se rendendo', d: 3, p: 2, who: ['canid', 'cat', 'hoofed', 'monkey', 'bear'] },
    dominate: { nome: 'impondo-se', d: 3, p: 2, who: ['canid', 'cat', 'bear', 'hoofed', 'monkey', 'elephant'] },
    mark: { nome: 'marcando o território', d: 3, p: 2, who: ['cat', 'canid', 'bear', 'antler', 'rhino', 'hippo', 'bison'] },
    paw: { nome: 'raspando o chão', d: 2.5, p: 2, who: ['canid', 'vaca', 'bison', 'buffalo', 'rhino', 'cavalo', 'gnu', 'cat'] },
    mourn: { nome: 'velando um morto', d: 0, loop: true, p: 2, who: ['elephant', 'monkey', 'wolf', 'gnu', 'buffalo'] },
    carryyoung: { nome: 'levando o filhote', d: 0, p: 2, who: ['cat', 'canid'] },
    huddle: { nome: 'encolhidos juntos', d: 0, loop: true, p: 2, who: ['penguin', 'muskox', 'ovelha', 'canid', 'groundbird', 'cat'] },
    // ---------------- the fight and the hunt ----------------
    threat: { nome: 'rosnando', d: 2.5, p: 1, who: ['canid', 'cat', 'bear', 'boar', 'hippo', 'croc', 'monkey', 'snake', 'swine', 'rhino'] },
    charge: { nome: 'investindo', d: 0, p: 1, who: ['horned', 'antler', 'elephant', 'rhino', 'hippo', 'buffalo', 'bison', 'bear', 'boar', 'ostrich'] },
    clash: { nome: 'batendo cabeça', d: 2.2, p: 1, who: ['antler', 'ibex', 'cabra', 'muskox', 'bison', 'buffalo', 'gnu', 'vaca', 'ovelha', 'rhino', 'elephant'] },
    neck: { nome: 'lutando de pescoço', d: 3, p: 2, who: ['giraffe'] },
    spar: { nome: 'lutando em pé', d: 3, p: 1, who: ['equid', 'bear', 'cat', 'canid', 'monkey', 'elephant'] },
    bite: { nome: 'mordendo', d: 0.5, p: 1, who: ['cat', 'canid', 'bear', 'swine', 'hippo', 'croc', 'snake', 'monkey', 'equid', 'otter', 'beaver', 'pinniped', 'lizard'] },
    grip: { nome: 'agarrado com os dentes', d: 0, loop: true, p: 1, who: ['cat', 'canid', 'bear', 'croc'] },
    throat: { nome: 'apertando a garganta', d: 0, loop: true, p: 1, who: ['lion', 'leopard', 'tiger', 'snowleopard', 'jaguar', 'gato', 'wolf', 'hyena'] },
    nape: { nome: 'mordendo a nuca', d: 0, loop: true, p: 1, who: ['tiger', 'jaguar', 'leopard', 'snowleopard', 'gato', 'lion'] },
    shakekill: { nome: 'sacudindo a presa', d: 1.6, p: 1, who: ['canid', 'cat', 'bear', 'croc'] },
    swipe: { nome: 'dando uma patada', d: 0.6, p: 1, who: ['cat', 'bear'] },
    maul: { nome: 'estraçalhando', d: 0, loop: true, p: 1, who: ['bear', 'cat'] },
    kick: { nome: 'dando coice', d: 0.7, p: 1, who: ['kicker'] },
    stomp: { nome: 'pisoteando', d: 1, p: 1, who: ['elephant', 'moose', 'giraffe', 'rhino', 'bison', 'buffalo', 'cavalo', 'zebra', 'deer', 'ostrich', 'camel'] },
    gore: { nome: 'chifrando', d: 0.9, p: 1, who: ['horned', 'antler', 'boar', 'elephant', 'rhino'] },
    toss: { nome: 'arremessando', d: 1.2, p: 1, who: ['elephant', 'rhino', 'buffalo', 'bison'] },
    coil: { nome: 'enrolando a presa', d: 0, loop: true, p: 1, who: ['python', 'anaconda'] },
    strike: { nome: 'dando o bote', d: 0.5, p: 1, who: ['snake', 'croc', 'lizard', 'heron', 'stork'] },
    deathroll: { nome: 'rolando com a presa', d: 0, loop: true, p: 1, who: ['croc'] },
    stoop: { nome: 'mergulhando do alto', d: 0, p: 1, who: ['eagle', 'owl', 'gull'] },
    talons: { nome: 'prendendo nas garras', d: 0, loop: true, p: 1, who: ['eagle', 'owl'] },
    mantle: { nome: 'cobrindo a presa com as asas', d: 0, loop: true, p: 2, who: ['eagle', 'owl'] },
    mob: { nome: 'acossando', d: 0, p: 2, who: ['raven', 'gull', 'hyena', 'elephant', 'buffalo', 'monkey', 'goose'] },
    buck: { nome: 'corcoveando', d: 1.2, p: 1, who: ['equid', 'gnu', 'buffalo', 'bison', 'giraffe', 'cabra', 'ibex'] },
    pin: { nome: 'prendendo no chão', d: 0, loop: true, p: 1, who: ['cat', 'canid', 'bear'] },
    struggle: { nome: 'se debatendo', d: 0, loop: true, p: 1, who: ['land'] },
    stagger: { nome: 'cambaleando', d: 0.8, p: 1, who: ['land'] },
    fall: { nome: 'caindo', d: 0.9, p: 1, who: ['land'] },
    rise: { nome: 'levantando', d: 1.2, p: 1, who: ['land'] },
    throes: { nome: 'agonizando', d: 3, p: 1, who: ['land'] },
    // ---------------- the escape ----------------
    jink: { nome: 'desviando de lado', d: 0.5, p: 1, who: ['gazelle', 'rabbit', 'hare', 'deer', 'zebra', 'gnu', 'ostrich', 'reindeer', 'ibex', 'cabra', 'capybara', 'monkey'] },
    hide: { nome: 'escondido', d: 0, loop: true, p: 2, who: ['rabbit', 'hare', 'deer', 'gazelle', 'frog', 'lizard', 'cat', 'snake', 'reindeer', 'ibex', 'zebra', 'gnu', 'tapir', 'giraffe'] }, // (the young of the herds lie hidden too: widened by the meio, D-300)
    burrow: { nome: 'entrando na toca', d: 1.2, p: 2, who: ['rabbit', 'hare', 'fox', 'arcticfox', 'fennec', 'beaver', 'otter', 'lizard', 'snake', 'frog', 'bear'] },
    dive: { nome: 'mergulhando na água', d: 1, p: 2, who: ['frog', 'otter', 'beaver', 'capybara', 'hippo', 'croc', 'pinniped', 'penguin', 'tapir', 'moose', 'anaconda'] },
    // ---------------- the weather and the water ----------------
    swim: { nome: 'nadando', d: 0, loop: true, p: 2, who: ['quad', 'snake', 'sprawl', 'frog', 'pinniped', 'penguin', 'goose'] },
    wade: { nome: 'na água rasa', d: 0, loop: true, p: 2, who: ['hoofed', 'elephant', 'wader', 'bear', 'cat'] },
    shelter: { nome: 'se abrigando', d: 0, loop: true, p: 2, who: ['land'] },
    shiver: { nome: 'tremendo de frio', d: 0, loop: true, p: 3, who: ['mammal', 'bird'] },
    curl: { nome: 'enrolado contra o frio', d: 0, loop: true, p: 2, who: ['canid', 'cat', 'rabbit', 'hare', 'bear', 'snake'] },
    spray: { nome: 'borrifando água', d: 3, p: 2, who: ['elephant'] },
    splash: { nome: 'banhando-se', d: 4, loop: true, p: 2, who: ['elephant', 'hippo', 'buffalo', 'tiger', 'bear', 'bird', 'jaguar', 'cao'] },
    spread: { nome: 'de asas abertas', d: 4, p: 3, who: ['bird'] },
    brood: { nome: 'chocando', d: 0, loop: true, p: 2, who: ['bird'] },
    // ---------------- before people ----------------
    curious: { nome: 'curioso', d: 0, p: 2, who: ['land'] },
    // ---- o meio (D-300) ----
    // (the head down in a field of the people; resting in the water against the heat; down the burrow or the den — the body
    // out of sight, the head at the mouth now and then)
    forage: { nome: 'comendo a plantação', d: 0, loop: true, p: 2, who: ['hoofed', 'elephant', 'monkey', 'rabbit', 'hare', 'bear', 'capybara'] },
    soak: { nome: 'de molho na água', d: 0, loop: true, p: 2, who: ['hippo', 'buffalo', 'elephant', 'capybara', 'tapir', 'moose', 'tiger', 'jaguar', 'bear', 'croc', 'rhino'] },
    toca: { nome: 'na toca', d: 0, loop: true, p: 2, who: ['rabbit', 'hare', 'fox', 'arcticfox', 'fennec', 'beaver', 'otter', 'lizard', 'snake', 'wolf'] },
  };
  // (each gesture's kinds, as a set: the groups opened, the kinds as they are)
  const open = w => { const out = new Set(); for (const k of w) { if (GR[k]) for (const x of GR[k]) out.add(x); else out.add(k); } return out; };
  for (const n in DEF) { DEF[n].id = n; DEF[n].kinds = open(DEF[n].who); }
  Ge.ids = Object.keys(DEF);
  // can a kind do it? (an unknown gesture: no)
  Ge.can = (kind, n) => !!DEF[n] && DEF[n].kinds.has(kind);
  // what the inspector says (the world's word for the gesture)
  Ge.nome = n => (DEF[n] ? DEF[n].nome : '');
  // the gestures of a kind (for the proofs and the studio)
  Ge.of = kind => Ge.ids.filter(n => DEF[n].kinds.has(kind));
})(window.G);
