'use strict';
// ============================================================
//  Fauna & ecology. Grass grows on every tile and is grazed;
//  herbivores eat plants, predators eat herbivores, apex
//  predators eat predators, scavengers clean the carcasses and
//  the rot feeds the soil again. Every species has a habitat
//  (biome, sea temperature, the water's edge), hunger, a life
//  span and a carrying capacity. Birds fly, whales surface,
//  crocodiles wait at the river. People hunt — and are hunted.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const A = G.Animals = {};
  // biomes: 0 temperate, 1 snow, 2 taiga, 3 swamp, 4 jungle, 5 savanna, 6 desert
  // cls: land | water | air | amph (land near water, swims too)
  // diet: herb (grass), browse (leaves & fruit), insect, fish, filter, carn, omni, scav
  // dens: animals per 100 habitat tiles · herd: group size · life: years · breed: young per year when fed
  // fear: flees people inside this radius · bold: will attack people · hunt: people hunt it
  const SP = A.DEF = {
    // ---------------- grazers & browsers ----------------
    rabbit: { name: 'Coelho', g: 'm', cls: 'land', diet: 'herb', hab: [0, 2, 5], dens: 3.0, herd: [2, 3], hp: 10, sp: 1.1, run: 3.0, meat: 3, size: 0.8, fear: 3.5, life: 4, breed: 2.2, app: 0.3, hunt: true, art: 'rabbit', col: ['#b89a7a', '#9a7a5a'] },
    hare: { name: 'Lebre-ártica', g: 'f', cls: 'land', diet: 'herb', hab: [1, 2], dens: 2.4, herd: [1, 3], hp: 10, sp: 1.1, run: 3.2, meat: 3, size: 0.85, fear: 3.5, life: 4, breed: 2, app: 0.3, hunt: true, art: 'rabbit', col: ['#f4f4ee', '#d8d8d0'] },
    deer: { name: 'Cervo', g: 'm', cls: 'land', diet: 'herb', hab: [0, 2], dens: 1.3, herd: [2, 4], hp: 26, sp: 1.0, run: 3.1, meat: 7, size: 1, fear: 5.2, life: 10, breed: 0.8, app: 1, hunt: true, art: 'quad', q: { len: 4, h: 5, leg: 4, neck: 4, col: '#b07a48', belly: '#e8d8c0', antler: 1, tail: 'tuft' } },
    reindeer: { name: 'Rena', g: 'f', cls: 'land', diet: 'herb', hab: [1, 2], dens: 1.2, herd: [3, 6], hp: 30, sp: 0.95, run: 2.9, meat: 8, size: 1.05, fear: 5, life: 10, breed: 0.75, app: 1, hunt: true, art: 'quad', q: { len: 4.2, h: 5, leg: 4, neck: 3.5, col: '#8a7866', belly: '#e8e2d8', antler: 2, collar: '#f0ece4' } },
    muskox: { name: 'Boi-almiscarado', g: 'm', cls: 'land', diet: 'herb', hab: [1], dens: 0.5, herd: [3, 5], hp: 60, sp: 0.7, run: 2.1, meat: 14, size: 1.2, fear: 2.5, defend: true, life: 14, breed: 0.5, app: 1.6, hunt: true, art: 'quad', q: { len: 4.6, h: 3.4, leg: 2.6, neck: 1.2, col: '#4a3a2e', belly: '#6a5646', shag: 1, horn: 'curl' } },
    boar: { name: 'Javali', g: 'm', cls: 'land', diet: 'omni', hab: [0, 2, 4], dens: 0.7, herd: [1, 3], hp: 42, sp: 0.85, run: 2.6, meat: 9, size: 1, fear: 2.2, defend: true, life: 8, breed: 1.1, app: 0.8, hunt: true, art: 'boar' },
    capybara: { name: 'Capivara', g: 'f', cls: 'land', diet: 'herb', hab: [3, 4], near: 'water', swims: 1, dens: 1.7, herd: [3, 6], hp: 22, sp: 0.8, run: 2.4, meat: 8, size: 0.95, fear: 3.2, life: 8, breed: 1.2, app: 0.7, hunt: true, art: 'quad', q: { len: 3.6, h: 3, leg: 1.8, neck: 0.8, col: '#8a5a36', belly: '#a06a42', stout: 1, ear: 0.4, noTail: 1 } },
    tapir: { name: 'Anta', g: 'f', cls: 'land', diet: 'browse', hab: [4], dens: 0.6, herd: [1, 2], hp: 44, sp: 0.8, run: 2.3, meat: 12, size: 1.15, fear: 3, life: 14, breed: 0.45, app: 1.2, hunt: true, art: 'quad', q: { len: 4.4, h: 3.8, leg: 2.4, neck: 0.8, col: '#3e3a40', belly: '#5a5660', stout: 1, snout: 1, noTail: 1 } },
    monkey: { name: 'Macaco', g: 'm', cls: 'land', diet: 'browse', hab: [4], dens: 2.0, herd: [3, 6], hp: 14, sp: 1.1, run: 3.0, meat: 3, size: 0.8, fear: 4.5, life: 12, breed: 0.8, app: 0.4, hunt: true, art: 'monkey', col: ['#7a5230', '#e8c8a0'] },
    zebra: { name: 'Zebra', g: 'f', cls: 'land', diet: 'herb', hab: [5], dens: 1.6, herd: [4, 8], hp: 34, sp: 1.0, run: 3.2, meat: 10, size: 1.08, fear: 5, life: 12, breed: 0.7, app: 1.1, hunt: true, art: 'quad', q: { len: 4.2, h: 4.4, leg: 3.8, neck: 3, col: '#f2f0ea', belly: '#f2f0ea', stripes: '#222', mane: '#222', tail: 'tuft' } },
    gazelle: { name: 'Gazela', g: 'f', cls: 'land', diet: 'herb', hab: [5, 6], dens: 1.8, herd: [3, 7], hp: 18, sp: 1.1, run: 3.7, meat: 6, size: 0.85, fear: 5.5, life: 8, breed: 1, app: 0.6, hunt: true, art: 'quad', q: { len: 3.6, h: 4, leg: 3.8, neck: 3, col: '#c8904e', belly: '#f2e6d0', stripe: '#6a3a1e', horn: 'straight' } },
    giraffe: { name: 'Girafa', g: 'f', cls: 'land', diet: 'browse', hab: [5], dens: 0.5, herd: [2, 4], hp: 60, sp: 0.85, run: 2.6, meat: 16, size: 1.3, fear: 5, life: 20, breed: 0.3, app: 1.6, hunt: true, art: 'giraffe' },
    elephant: { name: 'Elefante', g: 'm', cls: 'land', diet: 'browse', hab: [5, 4], dens: 0.35, herd: [3, 5], hp: 170, sp: 0.7, run: 1.9, meat: 40, size: 1.9, fear: 3, defend: true, life: 40, breed: 0.2, app: 3.5, hunt: true, art: 'elephant' },
    camel: { name: 'Camelo', g: 'm', cls: 'land', diet: 'browse', hab: [6, 5], dens: 0.6, herd: [2, 4], hp: 50, sp: 0.85, run: 2.4, meat: 14, size: 1.25, fear: 3.5, life: 25, breed: 0.35, app: 1, hunt: true, art: 'quad', q: { len: 4.4, h: 5.4, leg: 4.6, neck: 4, col: '#c8a066', belly: '#dcc08c', hump: 1, tail: 'tuft' } },
    hippo: { name: 'Hipopótamo', g: 'm', cls: 'amph', diet: 'herb', hab: [5, 4, 3], near: 'water', dens: 0.9, herd: [2, 4], hp: 130, sp: 0.6, run: 2.2, meat: 30, size: 1.5, fear: 2, defend: true, bold: 0.25, life: 30, breed: 0.3, app: 2.4, hunt: false, art: 'quad', q: { len: 5, h: 3.4, leg: 1.8, neck: 1, col: '#7a6470', belly: '#b08a90', stout: 2, ear: 0.4, noTail: 1, snout: 2 } },
    frog: { name: 'Rã', g: 'f', cls: 'land', diet: 'insect', hab: [3, 4, 0], near: 'water', swims: 1, dens: 4.5, herd: [1, 2], hp: 4, sp: 0.8, run: 2.2, meat: 1, size: 0.6, fear: 2, life: 3, breed: 2.8, app: 0.1, hunt: false, art: 'frog' },
    lizard: { name: 'Lagarto', g: 'm', cls: 'land', diet: 'insect', hab: [6, 5], dens: 3.0, herd: [1, 1], hp: 6, sp: 0.9, run: 2.6, meat: 1, size: 0.65, fear: 2.5, life: 4, breed: 2.2, app: 0.1, hunt: false, art: 'lizard', col: ['#9a8a4a', '#c8b060'] },
    // ---------------- predators ----------------
    fox: { name: 'Raposa', g: 'f', cls: 'land', diet: 'carn', prey: ['rabbit', 'frog', 'lizard'], hab: [0, 2], dens: 0.35, herd: [1, 1], hp: 16, sp: 1.1, run: 3.4, meat: 3, size: 0.8, fear: 4, life: 6, breed: 0.9, app: 0.4, hunt: false, art: 'quad', q: { len: 3.2, h: 3, leg: 2.4, neck: 1.2, col: '#d06a2a', belly: '#f4e8dc', tail: 'bushy', ear: 1.2, pred: 1 } },
    arcticfox: { name: 'Raposa-do-ártico', g: 'f', cls: 'land', diet: 'carn', prey: ['hare', 'rabbit'], hab: [1, 2], dens: 0.3, herd: [1, 1], hp: 15, sp: 1.1, run: 3.4, meat: 3, size: 0.75, fear: 4, life: 6, breed: 0.9, app: 0.4, hunt: false, art: 'quad', q: { len: 3, h: 2.8, leg: 2.2, neck: 1.2, col: '#f4f6f8', belly: '#ffffff', tail: 'bushy', ear: 1, pred: 1 } },
    fennec: { name: 'Feneco', g: 'm', cls: 'land', diet: 'carn', prey: ['lizard'], hab: [6], dens: 0.3, herd: [1, 1], hp: 10, sp: 1.1, run: 3.2, meat: 2, size: 0.6, fear: 4, life: 6, breed: 0.9, app: 0.3, hunt: false, art: 'quad', q: { len: 2.8, h: 2.6, leg: 2, neck: 1.2, col: '#e6c890', belly: '#f8ecd4', tail: 'bushy', ear: 2.4, pred: 1 } },
    wolf: { name: 'Lobo', g: 'm', cls: 'land', diet: 'carn', prey: ['deer', 'reindeer', 'rabbit', 'hare', 'boar', 'muskox'], hab: [0, 1, 2], dens: 0.3, herd: [2, 5], hp: 36, sp: 1.25, run: 3.3, meat: 4, size: 1, fear: 0, bold: 0.35, life: 10, breed: 0.5, app: 0.8, hunt: false, art: 'wolf' },
    hyena: { name: 'Hiena', g: 'f', cls: 'land', diet: 'scav', prey: ['gazelle', 'zebra', 'lizard', 'rabbit'], hab: [5, 6], dens: 0.35, herd: [2, 4], hp: 34, sp: 1.1, run: 3.1, meat: 4, size: 0.95, fear: 3, bold: 0.2, life: 12, breed: 0.5, app: 0.8, hunt: false, art: 'quad', q: { len: 3.8, h: 4, leg: 3.2, neck: 1.6, col: '#b0935e', belly: '#c8b080', spots: '#4a3a2a', slope: 1, ear: 1, tail: 'tuft', pred: 1 } },
    python: { name: 'Jiboia', g: 'f', cls: 'land', diet: 'carn', prey: ['frog', 'monkey', 'capybara', 'lizard', 'rabbit'], ambush: true, hab: [4, 3], dens: 0.4, herd: [1, 1], hp: 24, sp: 0.5, run: 1.8, meat: 4, size: 1, fear: 1.5, life: 15, breed: 0.5, app: 0.5, hunt: false, art: 'snake', col: ['#4a6a2a', '#c8b04a'] },
    viper: { name: 'Víbora', g: 'f', cls: 'land', diet: 'carn', prey: ['lizard', 'rabbit', 'frog'], ambush: true, hab: [6, 5], dens: 0.35, herd: [1, 1], hp: 10, sp: 0.5, run: 1.8, meat: 1, size: 0.75, fear: 1.5, bold: 0.1, life: 10, breed: 0.6, app: 0.3, hunt: false, art: 'snake', col: ['#a8844a', '#6a4a2a'] },
    // ---------------- apex ----------------
    bear: { name: 'Urso', g: 'm', cls: 'land', diet: 'omni', prey: ['deer', 'boar', 'rabbit', 'reindeer'], hab: [0, 2], dens: 0.1, herd: [1, 1], hp: 110, sp: 0.9, run: 2.8, meat: 25, size: 1.45, fear: 2, defend: true, bold: 0.3, life: 25, breed: 0.3, app: 1.6, hunt: false, apex: true, art: 'quad', q: { len: 4.8, h: 4.4, leg: 2.6, neck: 1.2, col: '#5a3e2a', belly: '#6e4e36', stout: 1, ear: 0.7, noTail: 1, pred: 1 } },
    polarbear: { name: 'Urso-polar', g: 'm', cls: 'amph', diet: 'carn', prey: ['seal', 'reindeer', 'hare', 'penguin', 'muskox'], hab: [1], dens: 0.1, herd: [1, 1], hp: 130, sp: 0.9, run: 2.8, meat: 30, size: 1.55, fear: 1.5, defend: true, bold: 0.4, life: 25, breed: 0.3, app: 1.8, hunt: false, apex: true, art: 'quad', q: { len: 5, h: 4.4, leg: 2.6, neck: 1.8, col: '#f2f2ea', belly: '#e4e2d6', stout: 1, ear: 0.6, noTail: 1, pred: 1 } },
    lion: { name: 'Leão', g: 'm', cls: 'land', diet: 'carn', prey: ['zebra', 'gazelle', 'giraffe', 'camel', 'hyena', 'hippo'], hab: [5], dens: 0.18, herd: [2, 4], hp: 90, sp: 1.0, run: 3.3, meat: 18, size: 1.3, fear: 1.5, bold: 0.35, life: 16, breed: 0.45, app: 1.4, hunt: false, apex: true, art: 'quad', q: { len: 4.6, h: 4.2, leg: 3, neck: 1.6, col: '#d4a45a', belly: '#e8c48a', mane: '#8a5a2a', lion: 1, tail: 'tuft', pred: 1 } },
    jaguar: { name: 'Onça', g: 'f', cls: 'land', diet: 'carn', prey: ['capybara', 'tapir', 'monkey', 'boar', 'frog'], ambush: true, hab: [4, 3], dens: 0.15, herd: [1, 1], hp: 80, sp: 1.0, run: 3.4, meat: 14, size: 1.2, fear: 1.5, bold: 0.35, life: 14, breed: 0.45, app: 1.2, hunt: false, apex: true, art: 'quad', q: { len: 4.4, h: 3.6, leg: 2.6, neck: 1.4, col: '#d8a040', belly: '#f2dcae', rosettes: '#3a2a1a', ear: 0.7, tail: 'long', pred: 1 } },
    croc: { name: 'Crocodilo', g: 'm', cls: 'amph', diet: 'carn', prey: ['capybara', 'gazelle', 'zebra', 'deer', 'frog', 'monkey', 'boar', 'tapir', 'camel'], ambush: true, hab: [3, 4, 5], near: 'water', dens: 0.5, herd: [1, 2], hp: 100, sp: 0.6, run: 2.6, meat: 16, size: 1.3, fear: 1, bold: 0.5, life: 40, breed: 0.4, app: 1.2, hunt: false, apex: true, art: 'croc' },
    // ---------------- the sea ----------------
    dolphin: { name: 'Golfinho', g: 'm', cls: 'water', diet: 'fish', sea: 'mild', dens: 0.5, herd: [2, 5], hp: 40, sp: 1.8, run: 3.4, meat: 10, size: 1.1, fear: 0, life: 25, breed: 0.3, app: 1, hunt: false, art: 'dolphin' },
    seal: { name: 'Foca', g: 'f', cls: 'amph', diet: 'fish', sea: 'cold', near: 'sea', hab: [1, 2], dens: 1.1, herd: [2, 5], hp: 30, sp: 0.5, run: 1.4, meat: 10, size: 1, fear: 3, life: 20, breed: 0.45, app: 1, hunt: true, art: 'seal' },
    penguin: { name: 'Pinguim', g: 'm', cls: 'amph', diet: 'fish', sea: 'cold', near: 'sea', hab: [1], dens: 1.4, herd: [4, 8], hp: 12, sp: 0.45, run: 1.2, meat: 4, size: 0.75, fear: 2.5, life: 15, breed: 0.6, app: 0.5, hunt: true, art: 'penguin' },
    whale: { name: 'Baleia', g: 'f', cls: 'water', diet: 'filter', sea: 'any', deep: true, dens: 0.09, herd: [1, 2], hp: 400, sp: 0.9, run: 1.4, meat: 80, size: 3, fear: 0, life: 80, breed: 0.08, app: 5, hunt: false, art: 'whale' },
    shark: { name: 'Tubarão', g: 'm', cls: 'water', diet: 'carn', prey: ['seal', 'turtle', 'dolphin', 'penguin'], sea: 'mild', dens: 0.14, herd: [1, 1], hp: 90, sp: 1.3, run: 3, meat: 14, size: 1.3, fear: 0, bold: 0.6, life: 30, breed: 0.2, app: 1.2, hunt: false, apex: true, art: 'shark' },
    orca: { name: 'Orca', g: 'f', cls: 'water', diet: 'carn', prey: ['seal', 'penguin', 'dolphin', 'shark'], sea: 'cold', dens: 0.1, herd: [2, 4], hp: 160, sp: 1.6, run: 3.3, meat: 30, size: 1.9, fear: 0, life: 50, breed: 0.12, app: 1.8, hunt: false, apex: true, art: 'orca' },
    turtle: { name: 'Tartaruga-marinha', g: 'f', cls: 'water', diet: 'filter', sea: 'warm', dens: 0.35, herd: [1, 1], hp: 40, sp: 0.6, run: 1, meat: 12, size: 0.9, fear: 0, life: 60, breed: 0.25, app: 0.8, hunt: false, art: 'turtle' },
    // ---------------- the sky ----------------
    gull: { name: 'Gaivota', g: 'f', cls: 'air', diet: 'fish', coast: true, hab: [0, 1, 2, 3, 4, 5, 6], dens: 1.4, herd: [3, 6], hp: 6, sp: 2.4, run: 3.4, meat: 1, size: 0.7, fear: 3, life: 12, breed: 0.8, app: 0.2, hunt: false, art: 'bird', b: { col: '#f4f4f0', wing: '#b8c0c8', tip: '#3a3a3a', beak: '#e8b83a', span: 7 } },
    eagle: { name: 'Águia', g: 'f', cls: 'air', diet: 'carn', prey: ['rabbit', 'hare', 'lizard', 'frog', 'monkey', 'fennec'], hab: [0, 1, 2, 5, 6], dens: 0.12, herd: [1, 1], hp: 14, sp: 2.2, run: 4.2, meat: 2, size: 1, fear: 4, life: 20, breed: 0.3, app: 0.4, hunt: false, apex: true, art: 'bird', b: { col: '#5a3e26', wing: '#6e4c2e', tip: '#2a1e14', head: '#f2efe6', beak: '#f2c23a', span: 11 } },
    vulture: { name: 'Abutre', g: 'm', cls: 'air', diet: 'scav', hab: [5, 6, 4], dens: 0.25, herd: [2, 4], hp: 12, sp: 1.8, run: 3, meat: 2, size: 1, fear: 3, life: 20, breed: 0.4, app: 0.5, hunt: false, art: 'bird', b: { col: '#2e2622', wing: '#3a302a', tip: '#1a1412', head: '#d8a0a0', beak: '#c8c0b0', span: 12 } },
    raven: { name: 'Corvo', g: 'm', cls: 'air', diet: 'scav', hab: [0, 1, 2], dens: 0.4, herd: [2, 4], hp: 6, sp: 2.2, run: 3.4, meat: 1, size: 0.65, fear: 3, life: 12, breed: 0.7, app: 0.3, hunt: false, art: 'bird', b: { col: '#1e1e26', wing: '#26262e', tip: '#101014', beak: '#2a2a2a', span: 7 } },
    parrot: { name: 'Arara', g: 'f', cls: 'air', diet: 'browse', hab: [4], dens: 1.3, herd: [3, 6], hp: 6, sp: 2.2, run: 3.4, meat: 1, size: 0.7, fear: 3, life: 30, breed: 0.6, app: 0.2, hunt: false, art: 'bird', b: { col: '#d8302a', wing: '#2a6ad0', tip: '#f2c23a', beak: '#f0e8d8', span: 8 } },
    heron: { name: 'Garça', g: 'f', cls: 'air', diet: 'fish', prey: ['frog'], wader: true, hab: [3, 0, 4], near: 'water', dens: 0.6, herd: [1, 2], hp: 8, sp: 1.8, run: 3, meat: 2, size: 0.9, fear: 4, life: 15, breed: 0.5, app: 0.3, hunt: false, art: 'wader', b: { col: '#f6f6f2', wing: '#e8e8e4', tip: '#3a3a3a', beak: '#e8c83a', leg: '#3a3a3a', span: 10 } },
    flamingo: { name: 'Flamingo', g: 'm', cls: 'air', diet: 'filter', wader: true, hab: [3, 5, 6], near: 'water', dens: 1.1, herd: [4, 9], hp: 8, sp: 1.8, run: 3, meat: 2, size: 0.9, fear: 4.5, life: 30, breed: 0.4, app: 0.3, hunt: false, art: 'wader', b: { col: '#f49aa8', wing: '#f07a8e', tip: '#2a2a2a', beak: '#2a2a2a', leg: '#e87a8a', span: 10 } },
    // ---------------- livestock: kept, herded, shorn, milked and eaten by people ----------------
    vaca: { name: 'Vaca', g: 'f', cls: 'land', diet: 'herb', dom: true, hab: [], dens: 0, herd: [1, 1], hp: 70, sp: 0.55, run: 1.8, meat: 16, size: 1.2, fear: 0, life: 16, breed: 0.4, app: 1.4, hunt: false, art: 'quad', q: { len: 4.6, h: 4.4, leg: 2.8, neck: 1.3, col: '#e8e0d2', belly: '#f4efe6', spots: '#4a3a2e', horn: 'cow', tail: 'tuft', mane: '#4a3a2e' } },
    ovelha: { name: 'Ovelha', g: 'f', cls: 'land', diet: 'herb', dom: true, hab: [], dens: 0, herd: [1, 1], hp: 26, sp: 0.55, run: 1.9, meat: 7, size: 0.9, fear: 0, life: 12, breed: 0.8, app: 0.7, hunt: false, art: 'quad', q: { len: 3.4, h: 3.2, leg: 2, neck: 1, col: '#f0ece2', belly: '#e6e0d4', wool: 1, face: '#4a403a', ear: 0.5, noTail: 1 } },
    cabra: { name: 'Cabra', g: 'f', cls: 'land', diet: 'browse', dom: true, hab: [], dens: 0, herd: [1, 1], hp: 24, sp: 0.6, run: 2.2, meat: 6, size: 0.85, fear: 0, life: 12, breed: 0.8, app: 0.6, hunt: false, art: 'quad', q: { len: 3.2, h: 3.4, leg: 2.6, neck: 1.4, col: '#a08262', belly: '#d8c4a4', horn: 'curl', ear: 0.7, tail: 'tuft' } },
    porco: { name: 'Porco', g: 'm', cls: 'land', diet: 'omni', dom: true, hab: [], dens: 0, herd: [1, 1], hp: 34, sp: 0.5, run: 1.7, meat: 10, size: 0.95, fear: 0, life: 10, breed: 1.1, app: 0.9, hunt: false, art: 'quad', q: { len: 3.6, h: 2.8, leg: 1.4, neck: 0.5, col: '#eeaa9a', belly: '#f4bcae', stout: 1, snout: 2, ear: 0.8, tail: 'curly' } },
    peru: { name: 'Peru', g: 'm', cls: 'land', diet: 'insect', dom: true, hab: [], dens: 0, herd: [1, 1], hp: 8, sp: 0.6, run: 2, meat: 3, size: 0.75, fear: 0, life: 6, breed: 1.6, app: 0.3, hunt: false, art: 'turkey' },
    cavalo: { name: 'Cavalo', g: 'm', cls: 'land', diet: 'herb', dom: true, hab: [], dens: 0, herd: [1, 1], hp: 80, sp: 0.9, run: 3.4, meat: 18, size: 1.3, fear: 0, life: 22, breed: 0.3, app: 1.5, hunt: false, art: 'quad', q: { len: 4.6, h: 5, leg: 4.2, neck: 3.2, col: '#8a5a34', belly: '#9a6a44', mane: '#2a1a10', tail: 'tuft' } },
    // ---------------- town animals: they live with people, not in pens ----------------
    cao: { name: 'Cão', g: 'm', cls: 'land', diet: 'omni', town: true, hab: [], dens: 0, herd: [1, 1], hp: 30, sp: 1.2, run: 3, meat: 4, size: 0.95, fear: 0, life: 13, breed: 0, app: 0, hunt: false, art: 'dog' },
    gato: { name: 'Gato', g: 'm', cls: 'land', diet: 'carn', town: true, hab: [], dens: 0, herd: [1, 1], hp: 12, sp: 0.9, run: 3.2, meat: 1, size: 0.68, fear: 0, life: 15, breed: 0, app: 0, hunt: false, art: 'cat' },
    galinha: { name: 'Galinha', g: 'f', cls: 'land', diet: 'insect', town: true, hab: [], dens: 0, herd: [1, 1], hp: 6, sp: 0.6, run: 1.9, meat: 2, size: 0.68, fear: 0, life: 7, breed: 0, app: 0, hunt: false, art: 'hen' },
    pombo: { name: 'Pombo', g: 'm', cls: 'land', diet: 'insect', town: true, hab: [], dens: 0, herd: [1, 1], hp: 3, sp: 0.7, run: 3, meat: 1, size: 0.58, fear: 0, life: 6, breed: 0, app: 0, hunt: false, art: 'pigeon' },
  };
  // ---------------- more of the living world: the great cats, the giants, the river folk, the sky's travellers ----------------
  // stalk: creeps up low on its prey before the pounce · climb: 'tree' hauls its kill up a tree, true climbs rock
  // morphs: chance of a rare coat (albino, melanico) · trophy: what people take from it when they dare to hunt it
  // goods: what a hunted body gives besides meat · migr: follows the grass (herds) or the warmth (birds) · nests: where it nests
  Object.assign(SP, {
    tiger: { name: 'Tigre', g: 'm', cls: 'land', diet: 'carn', prey: ['deer', 'boar', 'capybara', 'tapir', 'monkey', 'reindeer', 'buffalo', 'gnu', 'moose'], stalk: true, hab: [4, 2], swims: 1, dens: 0.06, herd: [1, 1], hp: 115, sp: 1.0, run: 3.5, meat: 20, size: 1.4, fear: 1.2, bold: 0.4, life: 16, breed: 0.4, app: 1.5, hunt: false, apex: true, trophy: true, goods: { peles: 2 }, morphs: { albino: 0.035 }, art: 'quad', q: { len: 5, h: 4, leg: 2.8, neck: 1.4, col: '#e2822a', belly: '#f6ecda', stripes: '#1e1a18', ear: 0.6, tail: 'long', pred: 1, cat: 1 } },
    leopard: { name: 'Leopardo', g: 'm', cls: 'land', diet: 'carn', prey: ['gazelle', 'monkey', 'rabbit', 'boar', 'capybara', 'gnu', 'ibex'], stalk: true, climb: 'tree', hab: [5, 4], dens: 0.09, herd: [1, 1], hp: 64, sp: 1.05, run: 3.6, meat: 10, size: 1.05, fear: 2, bold: 0.25, life: 14, breed: 0.45, app: 1, hunt: false, apex: true, trophy: true, goods: { peles: 1 }, morphs: { melanico: 0.08, albino: 0.01 }, art: 'quad', q: { len: 4.2, h: 3.4, leg: 2.5, neck: 1.3, col: '#d8a848', belly: '#f2e2b8', rosettes: '#2e2216', ear: 0.6, tail: 'long', pred: 1, cat: 1 } },
    snowleopard: { name: 'Leopardo-das-neves', g: 'm', cls: 'land', diet: 'carn', prey: ['ibex', 'hare', 'reindeer', 'muskox', 'rabbit'], stalk: true, climb: true, hab: [1, 2], high: true, dens: 0.05, herd: [1, 1], hp: 58, sp: 1.0, run: 3.4, meat: 8, size: 1, fear: 2.2, bold: 0.15, life: 15, breed: 0.4, app: 0.9, hunt: false, apex: true, trophy: true, goods: { peles: 3 }, morphs: { albino: 0.01 }, art: 'quad', q: { len: 4.2, h: 3.2, leg: 2.3, neck: 1.2, col: '#dcdcd4', belly: '#f2f2ec', rosettes: '#5a5a62', ear: 0.5, tail: 'bushy', pred: 1, cat: 1 } },
    rhino: { name: 'Rinoceronte', g: 'm', cls: 'land', diet: 'herb', hab: [5], dens: 0.11, herd: [1, 2], hp: 200, sp: 0.7, run: 2.7, meat: 34, size: 1.7, fear: 2.2, defend: true, bold: 0.12, life: 35, breed: 0.2, app: 2.6, hunt: true, big: true, goods: { chifre: 1, couro: 3 }, morphs: { albino: 0.004 }, art: 'rhino' },
    buffalo: { name: 'Búfalo', g: 'm', cls: 'land', diet: 'herb', hab: [5, 3], near: 'water', swims: 1, dens: 0.42, herd: [5, 10], hp: 120, sp: 0.75, run: 2.6, meat: 26, size: 1.45, fear: 2.6, defend: true, bold: 0.08, life: 18, breed: 0.4, app: 2.2, hunt: true, goods: { couro: 3 }, morphs: { albino: 0.005 }, art: 'quad', q: { len: 4.8, h: 4, leg: 2.6, neck: 1.1, col: '#38322e', belly: '#48403a', stout: 1, horn: 'buffalo', ear: 0.8, tail: 'tuft' } },
    bison: { name: 'Bisão', g: 'm', cls: 'land', diet: 'herb', hab: [0], migr: 'herd', dens: 0.4, herd: [6, 12], hp: 120, sp: 0.75, run: 2.7, meat: 28, size: 1.5, fear: 3, defend: true, life: 18, breed: 0.45, app: 2.2, hunt: true, goods: { couro: 3, peles: 1 }, morphs: { albino: 0.006 }, art: 'quad', q: { len: 4.8, h: 4.2, leg: 2.6, neck: 1, col: '#5a3e28', belly: '#4a3220', hump: 1, shag: 1, stout: 1, horn: 'short', mane: '#3a2618', ear: 0.5, tail: 'tuft' } },
    gnu: { name: 'Gnu', g: 'm', cls: 'land', diet: 'herb', hab: [5], migr: 'herd', swims: 1, dens: 2.2, herd: [8, 16], hp: 32, sp: 1.0, run: 3.2, meat: 9, size: 1.05, fear: 5, life: 14, breed: 0.8, app: 1.1, hunt: true, goods: { couro: 1 }, art: 'quad', q: { len: 4, h: 4.2, leg: 3.4, neck: 2.2, col: '#5c5c64', belly: '#6c6c72', mane: '#222226', horn: 'cow', slope: 1, face: '#3a3a40', beard: 1, tail: 'tuft' } },
    moose: { name: 'Alce', g: 'm', cls: 'land', diet: 'browse', hab: [2, 0], near: 'water', swims: 1, dens: 0.28, herd: [1, 2], hp: 95, sp: 0.85, run: 2.8, meat: 24, size: 1.5, fear: 3, defend: true, life: 18, breed: 0.35, app: 2, hunt: true, goods: { couro: 2 }, morphs: { albino: 0.01 }, art: 'quad', q: { len: 4.4, h: 5.2, leg: 4.4, neck: 2, col: '#4a3424', belly: '#5a4430', antler: 3, snout: 2, ear: 0.8, tail: 'tuft', beard: 1 } },
    ibex: { name: 'Cabra-montesa', g: 'f', cls: 'land', diet: 'browse', hab: [1, 2, 0, 6], high: true, climb: true, dens: 0.6, herd: [3, 6], hp: 24, sp: 0.9, run: 3, meat: 6, size: 0.9, fear: 5, life: 14, breed: 0.7, app: 0.6, hunt: true, goods: { couro: 1 }, art: 'quad', q: { len: 3.4, h: 3.6, leg: 2.8, neck: 1.6, col: '#a88a62', belly: '#e0ccaa', horn: 'ibex', ear: 0.6, tail: 'tuft', beard: 1 } },
    beaver: { name: 'Castor', g: 'm', cls: 'amph', diet: 'browse', hab: [0, 2], near: 'water', river: true, swims: 1, dens: 0.7, herd: [2, 4], hp: 14, sp: 0.6, run: 1.8, meat: 3, size: 0.75, fear: 3, life: 12, breed: 0.8, app: 0.4, hunt: true, dam: true, goods: { peles: 1 }, art: 'beaver' },
    otter: { name: 'Lontra', g: 'f', cls: 'amph', diet: 'fish', hab: [0, 2, 3, 4], near: 'water', swims: 1, dens: 0.55, herd: [1, 3], hp: 12, sp: 0.8, run: 2.6, meat: 2, size: 0.7, fear: 3.5, life: 10, breed: 0.7, app: 0.3, hunt: true, goods: { peles: 1 }, art: 'otter' },
    sloth: { name: 'Bicho-preguiça', g: 'm', cls: 'land', diet: 'browse', hab: [4], arbor: true, dens: 0.45, herd: [1, 1], hp: 16, sp: 0.07, run: 0.2, meat: 4, size: 0.8, fear: 0, life: 20, breed: 0.3, app: 0.2, hunt: false, art: 'sloth' },
    ostrich: { name: 'Avestruz', g: 'f', cls: 'land', diet: 'herb', hab: [5, 6], dens: 0.5, herd: [3, 6], hp: 34, sp: 1.2, run: 4.3, meat: 10, size: 1.2, fear: 5, life: 30, breed: 0.5, app: 0.9, hunt: true, goods: { plumas: 2 }, art: 'ostrich' },
    walrus: { name: 'Morsa', g: 'm', cls: 'amph', diet: 'filter', sea: 'cold', near: 'sea', hab: [1, 2], dens: 0.4, herd: [3, 8], hp: 110, sp: 0.4, run: 1.1, meat: 30, size: 1.5, fear: 2, defend: true, life: 30, breed: 0.3, app: 1.5, hunt: true, goods: { marfim: 1, oleo: 2 }, art: 'walrus' },
    anaconda: { name: 'Sucuri', g: 'f', cls: 'amph', diet: 'carn', prey: ['capybara', 'tapir', 'boar', 'monkey', 'frog', 'deer', 'otter'], ambush: true, constrict: true, hab: [3, 4], near: 'water', swims: 1, dens: 0.1, herd: [1, 1], hp: 70, sp: 0.5, run: 2, meat: 10, size: 1.6, fear: 1, bold: 0.12, life: 25, breed: 0.3, app: 1, hunt: false, trophy: true, goods: { couro_exotico: 2 }, art: 'snake', col: ['#3e4c2a', '#c8a43a'] },
    stork: { name: 'Cegonha', g: 'f', cls: 'air', diet: 'fish', prey: ['frog', 'lizard'], wader: true, migr: 'bird', nests: 'roof', hab: [0, 3, 5], near: 'water', dens: 0.4, herd: [2, 4], hp: 8, sp: 1.8, run: 3, meat: 2, size: 1, fear: 3.5, life: 20, breed: 0.4, app: 0.3, hunt: false, art: 'wader', b: { col: '#f6f4ee', wing: '#f0eee8', tip: '#1e1e22', beak: '#e04a2a', leg: '#e05a3a', span: 12 } },
    goose: { name: 'Ganso-selvagem', g: 'm', cls: 'air', diet: 'herb', wader: true, hab: [0, 2, 3], near: 'water', migr: 'bird', dens: 0.6, herd: [5, 10], hp: 10, sp: 2.2, run: 3.4, meat: 3, size: 0.85, fear: 4, life: 15, breed: 0.6, app: 0.4, hunt: false, nests: 'ground', art: 'bird', b: { col: '#8a8270', wing: '#6a6458', tip: '#2a2622', head: '#2a2622', beak: '#2a2622', span: 10 } },
    toucan: { name: 'Tucano', g: 'm', cls: 'air', diet: 'browse', hab: [4], dens: 0.8, herd: [1, 3], hp: 6, sp: 2, run: 3, meat: 1, size: 0.72, fear: 3, life: 18, breed: 0.5, app: 0.2, hunt: false, nests: 'tree', art: 'bird', b: { col: '#18181c', wing: '#18181c', tip: '#18181c', head: '#f6e8a0', beak: '#f28a1a', span: 7, toucan: 1 } },
    owl: { name: 'Coruja', g: 'f', cls: 'air', diet: 'carn', prey: ['rabbit', 'frog', 'lizard', 'hare'], night: true, hab: [0, 2, 4, 6], dens: 0.18, herd: [1, 1], hp: 8, sp: 1.8, run: 3.4, meat: 1, size: 0.75, fear: 2.5, life: 20, breed: 0.4, app: 0.2, hunt: false, nests: 'tree', art: 'bird', b: { col: '#9a7a5a', wing: '#8a6a4a', tip: '#5a4a3a', head: '#a88a6a', beak: '#d8c890', span: 9, owl: 1 } },
  });
  // the old residents, in the new web: who else they eat, what their bodies are worth, where they nest
  const more = (k, o) => { if (!SP[k]) return; if (o.prey) SP[k].prey = (SP[k].prey || []).concat(o.prey.filter(p => !(SP[k].prey || []).includes(p))); delete o.prey; Object.assign(SP[k], o); };
  more('lion', { prey: ['gnu', 'buffalo', 'ostrich'], pride: true, stalk: true, trophy: true, goods: { peles: 2 }, morphs: { albino: 0.012 } });
  more('jaguar', { prey: ['sloth', 'otter', 'anaconda'], stalk: true, climb: 'tree', swims: 1, trophy: true, goods: { peles: 2 }, morphs: { melanico: 0.09, albino: 0.006 } });
  more('wolf', { prey: ['bison', 'moose', 'ibex', 'beaver'], pack: true, goods: { peles: 1 }, morphs: { albino: 0.02, melanico: 0.04 } });
  more('hyena', { prey: ['gnu', 'ostrich'], pack: true });
  more('croc', { prey: ['gnu', 'buffalo', 'otter'], lurk: true, goods: { couro_exotico: 2 }, trophy: true });
  more('python', { prey: ['otter'], constrict: true, goods: { couro_exotico: 1 } });
  more('viper', { goods: { couro_exotico: 0.5 } });
  more('bear', { prey: ['beaver', 'moose'], fishes: true, trophy: true, goods: { peles: 2 }, morphs: { albino: 0.008 } });
  more('polarbear', { prey: ['walrus'], trophy: true, goods: { peles: 3 } });
  more('orca', { prey: ['walrus'] });
  more('eagle', { prey: ['otter', 'ibex'], nests: 'cliff' });
  more('fox', { goods: { peles: 1 }, morphs: { melanico: 0.04 } });
  more('arcticfox', { goods: { peles: 1 } });
  more('seal', { goods: { peles: 1, oleo: 1 } });
  more('elephant', { goods: { marfim: 2 }, morphs: { albino: 0.012 }, herdMourn: true });
  more('deer', { goods: { couro: 1 }, morphs: { albino: 0.012 } });
  more('reindeer', { goods: { couro: 1, peles: 1 }, migr: 'herd' });
  more('zebra', { migr: 'herd', swims: 1, goods: { couro: 1 } });
  more('gazelle', { migr: 'herd', goods: { couro: 0.5 } });
  more('boar', { goods: { couro: 1 } });
  more('muskox', { goods: { peles: 2 } });
  more('giraffe', { goods: { couro: 2 } });
  more('camel', { goods: { couro: 2 } });
  more('hippo', { goods: { marfim: 0.5, couro: 2 } });
  more('capybara', { goods: { couro: 1 } });
  more('tapir', { goods: { couro: 1 } });
  more('rabbit', { goods: { peles: 0.3 } });
  more('hare', { goods: { peles: 0.4 } });
  more('parrot', { nests: 'tree', goods: { plumas: 0.5 } });
  more('raven', { nests: 'tree' });
  more('heron', { nests: 'tree' });
  more('gull', { nests: 'cliff' });
  more('monkey', { arbor: 'troop' });
  more('penguin', { nests: 'ground' });
  more('turtle', { goods: { couro_exotico: 0.5 } });
  // predators raid the herds too
  for (const [p, list] of [['wolf', ['ovelha', 'cabra', 'porco', 'peru', 'vaca', 'galinha']], ['fox', ['peru', 'galinha']], ['bear', ['ovelha', 'porco', 'vaca', 'cabra']], ['lion', ['vaca', 'cabra', 'cavalo', 'ovelha']], ['jaguar', ['porco', 'peru', 'cabra']], ['hyena', ['cabra', 'ovelha', 'peru']], ['croc', ['vaca', 'cabra', 'cavalo', 'porco']], ['python', ['peru']], ['viper', ['peru']], ['tiger', ['vaca', 'porco', 'cabra', 'cavalo']], ['leopard', ['cabra', 'ovelha', 'peru', 'porco']], ['snowleopard', ['cabra', 'ovelha']], ['anaconda', ['porco', 'cabra']]]) SP[p].prey = SP[p].prey.concat(list);
  for (const k in SP) { SP[k].id = k; SP[k].nameA = (SP[k].g === 'f' ? 'uma ' : 'um ') + SP[k].name.toLowerCase(); }
  A.ids = Object.keys(SP);
  const DAY = () => G.DAY_LEN;
  const DIET = { herb: 'Herbívoro', browse: 'Herbívoro (folhas e frutos)', insect: 'Insetívoro', fish: 'Come peixes', filter: 'Filtrador', carn: 'Carnívoro', omni: 'Onívoro', scav: 'Carniceiro' };
  A.dietName = k => DIET[SP[k].diet] || '';
  // who eats whom: filled from the prey lists
  A.eatenBy = {}; for (const k in SP) for (const p of SP[k].prey || []) (A.eatenBy[p] = A.eatenBy[p] || []).push(k);

  // ------------------------------ vegetation ------------------------------
  // grass biomass per tile: what the grazers eat; it regrows with fertility and rain
  const VEGCAP = [1, 0.18, 0.6, 0.95, 1.05, 1.1, 0.12];
  A.vegCap = function (i) {
    const S = G.S; const t = S.type[i];
    if (t < T.SAND || t === T.RIVER || S.occ[i] || S.road[i]) return 0;
    const b = S.biome ? S.biome[i] : 0;
    let c = VEGCAP[b] * (0.45 + S.fert[i] * 0.8);
    if (t === T.SAND) c *= b === 6 ? 1 : 0.25; else if (t === T.ROCKY) c *= 0.35; else if (t === T.MEADOW) c *= 1.2;
    if (S.burnt[i] > 0 || S.scar[i] > 0) c *= 0.15;
    if (S.treeAt[i]) c += 0.2; // leaves and fruit for browsers
    return c;
  };
  function ensureVeg() {
    const S = G.S;
    if (!S.veg || S.veg.length !== N * N) { S.veg = new Float32Array(N * N); for (let i = 0; i < N * N; i++) S.veg[i] = A.vegCap(i) * 0.85; }
    return S.veg;
  }
  let vegCursor = 0;
  function growVeg(dt) {
    // a slice of the map per tick keeps this cheap on huge worlds
    const S = G.S; const veg = ensureVeg(); const total = N * N;
    const slice = Math.ceil(total / 8); const drought = S.weather.drought > 0;
    const rate = (drought ? 0.25 : 1) * (1 + S.weather.rain) * 8 * dt / DAY();
    for (let k = 0; k < slice; k++) {
      const i = vegCursor; vegCursor = (vegCursor + 1) % total;
      const cap = A.vegCap(i); const v = veg[i];
      if (v < cap) veg[i] = Math.min(cap, v + (cap - v) * 0.9 * rate * G.Nature.zoneMul((i % N) + 0.5, ((i / N) | 0) + 0.5, 'fertility') + 0.01 * rate);
      else if (v > cap) veg[i] = cap;
    }
  }

  // ------------------------------ habitat ------------------------------
  let dWater = null, dSea = null, dLand = null, habKey = null, habVer = -1;
  function distances() {
    const S = G.S;
    if (dWater && habKey === S && habVer === (S.typeVer || 0) && dWater.length === N * N) return;
    habKey = S; habVer = S.typeVer || 0;
    const bfs = test => { const d = new Uint8Array(N * N).fill(99); const q = []; for (let i = 0; i < N * N; i++) if (test(i)) { d[i] = 0; q.push(i); } for (let h = 0; h < q.length; h++) { const a = q[h]; if (d[a] >= 6) continue; const x = a % N, y = (a / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (d[j] > d[a] + 1) { d[j] = d[a] + 1; q.push(j); } } } return d; };
    dWater = bfs(i => S.type[i] <= T.RIVER);
    dSea = bfs(i => S.type[i] <= T.SEA);
    dLand = bfs(i => S.type[i] >= T.SAND);
    habCount = null;
  }
  A.invalidate = () => { habVer = -1; };
  A.invalidateHab = () => { habCount = null; scaleKey = null; };
  const seaTemp = i => { const S = G.S; return S.temp ? S.temp[i] / 255 : 0.5; };
  const seaOK = (sp, i) => { const t = seaTemp(i); return sp.sea === 'cold' ? t < 0.36 : sp.sea === 'warm' ? t > 0.55 : sp.sea === 'mild' ? t > 0.22 : true; };
  // can this species live on this tile?
  A.habitat = function (sp, i) {
    const S = G.S; const t = S.type[i];
    if (sp.cls === 'water') { if (t > T.SEA) return false; if (sp.deep && t !== T.DEEP) return false; return seaOK(sp, i); }
    if (sp.cls === 'amph' && t <= T.SEA) return dLand[i] <= 3 && (sp.sea ? seaOK(sp, i) : sp.id !== 'polarbear' || seaTemp(i) < 0.36);
    if (sp.coast) return t >= T.SAND ? dSea[i] <= 3 && seaTemp(i) > 0.12 : t <= T.SEA && dLand[i] <= 4 && seaTemp(i) > 0.12;
    if (t < T.SAND && !(t === T.RIVER && (sp.near === 'water' || sp.cls === 'amph'))) return false;
    const b = S.biome ? S.biome[i] : 0;
    if (sp.hab && !sp.hab.includes(b)) return false;
    if (sp.near === 'water' && dWater[i] > 3) return false;
    // the high places: ibex and snow leopards live where the land is mountain
    if (sp.high && t !== T.ROCKY && !(G.Relief && G.Relief.meters && G.Relief.meters(W.tileH(i)) >= 520)) return false;
    // beavers want running water (a river), not the sea shore
    if (sp.river && !riverNear(i)) return false;
    if (sp.near === 'sea' && dSea[i] > 2) return false;
    return true;
  };
  function riverNear(i) { const S = G.S; const x = i % N, y = (i / N) | 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; if (S.type[yy * N + xx] === T.RIVER) return true; } return false; }
  let habCount = null;
  function habitatCounts() {
    distances();
    if (habCount) return habCount;
    const S = G.S; habCount = {}; for (const k in SP) habCount[k] = 0;
    // sample every other tile (x4 later) — plenty precise for capacities
    for (let y = 0; y < N; y += 2) for (let x = (y >> 1) & 1; x < N; x += 2) { const i = y * N + x; for (const k in SP) if (A.habitat(SP[k], i)) habCount[k] += 4; }
    return habCount;
  }
  // how many of each species the world can hold
  A.capacity = function (k) {
    const h = habitatCounts()[k] || 0; if (!h) return 0;
    const sp = SP[k]; const c = h / 100 * sp.dens * scale();
    return Math.max(sp.apex ? 3 : 4, Math.round(c));
  };
  let scaleV = 1, scaleKey = null;
  function scale() {
    // keep the whole zoo within what a browser can animate
    const S = G.S; if (scaleKey === S && habCount) return scaleV;
    scaleKey = S; let tot = 0; const h = habCount || habitatCounts();
    for (const k in SP) tot += h[k] / 100 * SP[k].dens;
    const max = G.clamp(G.Nature.landTiles() * 0.09, 160, 900);
    scaleV = tot > max ? max / tot : 1;
    return scaleV;
  }

  // ------------------------------ spatial grid ------------------------------
  const CELL = 8; let grid = new Map(), vgrid = new Map(), tgrid = new Map(), gridT = 0;
  const key = (x, y) => ((x / CELL) | 0) + ((y / CELL) | 0) * 4096;
  function rebuildGrid() {
    const S = G.S; grid.clear(); vgrid.clear(); tgrid.clear();
    for (const a of S.animals.values()) {
      const k = key(a.x, a.y); let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(a);
      // the few that could be coming for someone right now: people only look at these
      if (!a.dead && !a.tamed && (a.summoned || a.raid || a.legend || a.angry > 0 || a.state === 'chase' || a.state === 'lunge')) { let t = tgrid.get(k); if (!t) tgrid.set(k, t = []); t.push(a); }
    }
    for (const v of S.villagers.values()) { if (v.inside || v.held) continue; const k = key(v.x, v.y); let l = vgrid.get(k); if (!l) vgrid.set(k, l = []); l.push(v); }
  }
  function each(g, x, y, r, fn) {
    const x0 = ((x - r) / CELL) | 0, x1 = ((x + r) / CELL) | 0, y0 = ((y - r) / CELL) | 0, y1 = ((y + r) / CELL) | 0;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const l = g.get(cx + cy * 4096); if (l) for (const o of l) if (fn(o) === false) return; }
  }
  A.near = (x, y, r, fn) => each(grid, x, y, r, fn);
  A.nearThreat = (x, y, r, fn) => each(tgrid, x, y, r, fn);
  function nearestVillager(a, r, filter) {
    let best = null, bd = r * r;
    each(vgrid, a.x, a.y, r, v => { if (v.inside || v.held || v.air || v.aboard) return; if (filter && !filter(v)) return; const d = G.dist2(a.x, a.y, v.x, v.y); if (d < bd) { bd = d; best = v; } });
    return best;
  }
  function crowdAt(x, y, r) { let n = 0; each(vgrid, x, y, r, v => { if (!v.inside && G.dist2(x, y, v.x, v.y) < r * r) n++; }); return n; }

  // ------------------------------ life ------------------------------
  A.spawn = function (kind, x, y, extra) {
    const S = G.S; const d = SP[kind] || SP.rabbit;
    const a = Object.assign({
      id: S.nextId++, kind, x, y, hp: d.hp, maxHp: d.hp, state: 'idle', tx: x, ty: y, t: G.R() * 3,
      scan: G.R() * 0.5, face: G.R() < 0.5 ? 1 : -1, walkPh: G.R() * 10, dead: false, meat: d.meat, claim: 0, angry: 0,
      target: 0, air: false, held: false, z: d.cls === 'air' ? G.rr(18, 50) : 0, vx: 0, vy: 0, vz: 0, hurt: 0, rot: 0, leader: 0, sated: 0, moving: false,
      leaveT: 0, summoned: false, age: G.rr(0.25, 0.7) * d.life, grown: 1, hunger: G.rr(0.05, 0.4), rest: 0, carc: false,
      // every field up front: one object shape keeps the hot loops fast
      lt: G.R() * 0.5, lifeMul: G.rr(0.8, 1.2), eating: 0, bite: 0, howl: 0, ph: G.R() * 6, leap: 0, spout: 0, flap: 0, ang: 0, perchZ: 0,
      swim: false, onPerson: false, named: null, kills: 0, shoal: 0, seek: false, sink: false, cause: null, raid: false, cd: 0, lod: 0, hx: x, hy: y,
      tamed: 0, guardSet: 0, gt: false, gscan: 0, legend: false, big: 1, epithet: null, mig: false,
      dom: 0, pen: 0, herder: 0, ledBy: 0, wool: 0, milk: 0, eggs: 0, shorn: 0, hold: 0, tended: 0, flee: 0,
      morph: null, seen: 0, prey2: 0, gore: 0, blood: 0, perch: 0, nest: 0, swing: 0, sub: 0, roll: 0, grip: 0, drag: 0, mourn: 0, crouch: 0, flank: null, pounce: 0,
      down: 0, caught: 0, tree: 0, corpse: 0, dragT: 0, dragTo: null, mt: 0, ft: 0, rd: 0, dz: null, cached: false, slow: 0, sw0: null, sw1: null, px: 0, py: 0, fast: false,
    }, extra || {});
    if (a.morph === null && !(extra && 'morph' in extra)) a.morph = rollMorph(d);
    if (a.hx === undefined) { a.hx = a.x; a.hy = a.y; }
    S.animals.set(a.id, a);
    return a;
  };
  // a rare coat: the albino (white, pale-eyed) and the black one — a sight, a legend, a fortune in fur
  function rollMorph(d) {
    if (d.dom || d.town || d.cls === 'water' || d.cls === 'air') return null;
    const m = d.morphs || (d.cls === 'land' && d.size >= 0.8 ? { albino: 0.002 } : null); if (!m) return null;
    for (const k in m) if (G.R() < m[k]) return k;
    return null;
  }
  A.rollMorph = rollMorph;
  A.MORPH = { albino: ['branco', 'branca'], melanico: ['negro', 'negra'] };
  // 'o tigre branco', 'a onça negra' — the name people give a rare animal
  A.rareName = function (a) { const sp = SP[a.kind]; const m = A.MORPH[a.morph]; if (!m) return sp.name.toLowerCase(); if (a.morph === 'melanico' && (a.kind === 'leopard' || a.kind === 'jaguar')) return 'pantera-negra'; return sp.name.toLowerCase() + ' ' + m[sp.g === 'f' ? 1 : 0]; };
  A.remove = a => G.S.animals.delete(a.id);
  A.sp = a => SP[a.kind] || SP.rabbit;
  A.huntable = a => { const sp = SP[a.kind]; return !!(sp && sp.hunt && !a.held && !a.air && !(sp.cls === 'water') && !(a.swim) && !a.tamed && !a.legend && !a.dom); };
  // a wild predator going after somebody's herd
  A.raider = a => !a.dead && !a.dom && a.state === 'chase' && !a.carc && a.target && !!(G.S.animals.get(a.target) || {}).dom;
  // is this animal a danger to people right now?
  A.threat = function (a) {
    if (a.dead) return false; const sp = SP[a.kind]; if (!sp) return false;
    if (a.tamed) return false; // a city's guardian beast
    if (a.summoned || a.raid || a.legend) return true;
    if (a.angry > 0) return true;
    const tg = a.target && G.S.villagers.get(a.target);
    return !!(tg && (a.state === 'chase' || a.state === 'lunge'));
  };
  A.predator = k => { const d = SP[k]; return d && (d.diet === 'carn' || (d.diet === 'omni' && d.prey) || d.diet === 'scav'); };

  function walkOK(a, x, y) {
    if (!W.inb(x, y)) return false;
    const S = G.S; const i = W.idx(x, y); const t = S.type[i]; const sp = SP[a.kind];
    if (sp.cls === 'water') return t <= T.SEA && (!sp.deep || t === T.DEEP || S.type[i] === T.SEA);
    if (sp.cls === 'amph') {
      if (t <= T.SEA) return dLand[i] <= 3;
      if (W.blocked(i) || S.cliff[i]) return false;
      if (sp.near === 'water' && dWater[i] > 3) return false;
      if (sp.near === 'sea' && dSea[i] > 3) return false;
      return true;
    }
    if (t <= T.SEA) return false;
    if (S.cliff[i] && !sp.climb) return false;
    if (W.blocked(i) || S.wall[i] === 1 || S.wall[i] === 4) return false;
    if (t === T.RIVER && S.deep[i] && !sp.swims) return false;
    if (t === T.RIVER && sp.near !== 'water' && a.kind === 'rabbit') return false;
    return true;
  }
  // can it walk straight there? (no cliff, wall, house or deep water on the way)
  function lineOK(a, x1, y1, x0, y0) {
    if (x0 === undefined) { x0 = a.x; y0 = a.y; }
    const sp = SP[a.kind]; if (sp.cls === 'air') return true;
    const d = Math.hypot(x1 - x0, y1 - y0); const n = Math.ceil(d / 0.5);
    for (let k = 1; k <= n; k++) { const f = k / n; if (!walkOK(a, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f)) return false; }
    return true;
  }
  A.lineOK = lineOK;
  // a way around: the same paths people walk (cliffs, walls and houses in the way), a few searches a frame
  let pathBudget = 0;
  const canRoute = a => { const sp = SP[a.kind]; return sp.cls === 'land' || (sp.cls === 'amph' && G.S.type[W.idx(a.x, a.y)] > T.RIVER && G.S.type[W.idx(a.tx, a.ty)] > T.RIVER); };
  function route(a) {
    const S = G.S;
    if (!canRoute(a)) return false; // (water, and the edge of the water: no way round to look for)
    if (pathBudget <= 0 || S.clock - (a.pfT || -99) < 1.6) return null; // not this frame
    pathBudget--; a.pfT = S.clock;
    const p = W.findPath(a.x, a.y, a.tx, a.ty, true, 700);
    return p && p.length ? p : false;
  }
  // nowhere to go from here: stop pushing against the rock, and think of something else
  function giveUp(a) {
    const S = G.S; const sp = SP[a.kind];
    a.noGo = { x: a.tx, y: a.ty, until: S.clock + 20 };
    a.tx = a.x; a.ty = a.y; a.moving = false; a.path = null; a.blk = 0; a.stk = 0;
    if (a.dom || a.pen || a.tamed || !sp) return;
    if (a.target && (a.state === 'chase' || a.state === 'lunge' || a.state === 'stalk' || a.state === 'flank')) { a.noPrey = { id: a.target, until: S.clock + 30 }; a.target = 0; a.onPerson = false; a.rest = Math.max(a.rest || 0, 2); a.state = 'idle'; a.t = G.rr(0.5, 1.5); }
    else if (a.state === 'wander' || a.state === 'flee') { a.state = 'idle'; a.t = G.rr(0.3, 1.2); }
  }
  const noGo = (a, x, y) => a.noGo && G.S.clock < a.noGo.until && G.dist(x, y, a.noGo.x, a.noGo.y) < 2.5;
  // strays head back towards their home range
  function homeward(a, r) {
    const dx = a.hx - a.x, dy = a.hy - a.y; const d = Math.hypot(dx, dy); if (d < 1) return null;
    const step = Math.min(d, r);
    let any = null;
    for (let k = 0; k < 7; k++) { const ang = Math.atan2(dy, dx) + (G.R() - 0.5) * (k < 4 ? 1.2 : 2.4); const x = a.x + Math.cos(ang) * step, y = a.y + Math.sin(ang) * step; if (!walkOK(a, x, y) || noGo(a, x, y)) continue; if (lineOK(a, x, y)) return [x, y]; any = any || [x, y]; }
    return any;
  }
  function pickNear(a, r, needHab) {
    const sp = SP[a.kind];
    if (a.hx !== undefined && G.S.animals.has(a.id) && !A.habitat(sp, W.idx(a.x, a.y))) { const h = homeward(a, Math.max(r, 5)); if (h) return h; }
    for (let k = 0; k < 14; k++) {
      const ang = G.R() * 6.28, d = G.R() * r;
      const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d;
      if (!walkOK(a, x, y) || noGo(a, x, y)) continue;
      const i = W.idx(x, y);
      if (G.S.fire[i] > 0) continue;
      if ((needHab || k < 7) && !A.habitat(sp, i)) continue;
      // (a spot behind a cliff is not a place to wander to; the walk there must be open)
      if (k < 12 && a.id && !lineOK(a, x, y)) continue;
      return [x, y];
    }
    return null;
  }
  function fleeTarget(a, fx, fy, dist) {
    let dx = a.x - fx, dy = a.y - fy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    let any = null;
    for (const f of [1, 0.6, 0.35]) for (const ang of [0, 0.6, -0.6, 1.2, -1.2, 2, -2]) {
      const c = Math.cos(ang), s = Math.sin(ang);
      const x = a.x + (dx * c - dy * s) * dist * f, y = a.y + (dx * s + dy * c) * dist * f;
      if (!walkOK(a, x, y)) continue;
      if (lineOK(a, x, y)) return [x, y];
      any = any || [x, y];
    }
    return any;
  }
  function moveTo(a, dt, sp) {
    const S = G.S; const def = SP[a.kind];
    const fdx = a.tx - a.x, fdy = a.ty - a.y; const fd = Math.hypot(fdx, fdy);
    if (fd < 0.05) { a.moving = false; a.path = null; a.stk = 0; return true; }
    // a way around something: walk it waypoint by waypoint (dropped if the goal moved far from its end)
    let gx = a.tx, gy = a.ty;
    if (a.path) {
      const end = a.path[a.path.length - 1];
      if (G.dist(end[0], end[1], a.tx, a.ty) > 2.5) a.path = null;
      else {
        while (a.path && G.dist(a.x, a.y, a.path[a.pi][0], a.path[a.pi][1]) < 0.3) { a.pi++; if (a.pi >= a.path.length) a.path = null; }
        if (a.path) { gx = a.path[a.pi][0]; gy = a.path[a.pi][1]; }
      }
    }
    const dx = gx - a.x, dy = gy - a.y; const d = Math.hypot(dx, dy) || 1e-6;
    const i = W.idx(a.x, a.y);
    let mul = 1;
    if (def.cls === 'land' && S.type[i] === T.RIVER) mul = 0.55;
    if (def.swims) a.swim = S.type[i] === T.RIVER && S.deep[i] === 1;
    if (def.cls === 'amph') { a.swim = S.type[i] <= T.RIVER; if (a.swim && (a.kind === 'croc' || a.kind === 'hippo' || a.kind === 'seal' || a.kind === 'penguin' || a.kind === 'polarbear')) mul = a.kind === 'polarbear' ? 0.8 : 1.4; }
    if (S.biome && def.cls === 'land') mul *= 0.85 + 0.15 * G.BIOMES[S.biome[i]].speed;
    if (def.cls === 'land' && !def.climb && S.type[i] >= T.SAND) mul /= 1 + S.slope[i] * 0.14;
    const step = Math.min(d, sp * dt * mul * (0.6 + 0.4 * a.grown));
    const nx = a.x + dx / d * step, ny = a.y + dy / d * step;
    const x0 = a.x, y0 = a.y;
    let blocked = false;
    // a fence in the way: slide along it, or give up this way
    if (def.cls !== 'air' && W.fenceBlocks(a, a.x, a.y, nx, ny)) {
      blocked = true;
      if (!W.fenceBlocks(a, a.x, a.y, nx, a.y) && walkOK(a, nx, a.y)) a.x = nx; else if (!W.fenceBlocks(a, a.x, a.y, a.x, ny) && walkOK(a, a.x, ny)) a.y = ny;
    } else if (def.cls !== 'air' && !walkOK(a, nx, ny)) {
      blocked = true;
      if (walkOK(a, nx, a.y)) a.x = nx; else if (walkOK(a, a.x, ny)) a.y = ny;
    } else { a.x = G.clamp(nx, 0.3, N - 0.3); a.y = G.clamp(ny, 0.3, N - 0.3); }
    const moved = Math.hypot(a.x - x0, a.y - y0);
    // up against a cliff or a wall: look for the way round — and if there is none, stop trying
    if (blocked) {
      a.blk = (a.blk || 0) + dt;
      a.blkSeen = 1;
      if (a.blk > 0.2 && !a.path) {
        const p = route(a);
        if (p) { a.path = p; a.pi = 0; a.blk = 0; }
        else if (p === false || a.blk > 1.6) { giveUp(a); return true; }
      } else if (a.path && a.blk > 1.2) { giveUp(a); return true; }
      if (moved < 1e-4) { a.moving = false; return false; }
    } else a.blk = 0;
    // sliding along a wall that leads nowhere: no progress towards the goal for a while
    // (only counted when it has been rubbing against something: a fast hare in the open is not "stuck")
    a.stkT = (a.stkT || 0) + dt;
    if (a.stkT >= 0.8) {
      const left = G.dist(a.x, a.y, a.tx, a.ty);
      const sameGoal = a.stkGX !== undefined && G.dist(a.stkGX, a.stkGY, a.tx, a.ty) < 1.5;
      if (a.blkSeen && sameGoal && a.stkD !== undefined && a.stkD - left < 0.1 * sp && left > 0.4) {
        a.stk = (a.stk || 0) + 1;
        if (a.stk >= 2) { if (!a.path) { const p = route(a); if (p) { a.path = p; a.pi = 0; a.stk = 0; } else if (p === false || a.stk >= 4) { giveUp(a); return true; } } else if (a.stk >= 4) { giveUp(a); return true; } }
      } else a.stk = 0;
      a.stkD = left; a.stkT = 0; a.stkGX = a.tx; a.stkGY = a.ty; a.blkSeen = 0;
    }
    if (Math.abs(dx - dy) > 0.02 || Math.abs(dx + dy) > 0.02) G.faceTo(a, dx, dy);
    a.walkPh += moved * (a.kind === 'rabbit' || a.kind === 'hare' || a.kind === 'frog' ? 6 : 8);
    a.moving = moved > 1e-4;
    return false;
  }

  A.damage = function (a, dmg, by) {
    if (a.dead) return;
    a.hp -= dmg; a.hurt = 0.3;
    if (SP[a.kind].cls !== 'water' || G.R() < 0.5) G.FX && G.FX.blood(a.x, a.y);
    if (a.hp <= 0) return A.kill(a, by);
    const sp = SP[a.kind];
    if (by && (sp.defend || sp.bold > 0 || a.kind === 'boar') && a.hp > a.maxHp * 0.25) { a.angry = 14; a.target = by.id; a.state = 'chase'; }
    else if (a.kind === 'wolf' && (a.raid || a.summoned)) { if (by && by.id && G.S.villagers.has(by.id)) a.target = by.id; if (a.hp < a.maxHp * 0.35) a.state = 'leave'; }
    else if (by) { const p = fleeTarget(a, by.x, by.y, 6); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 3; } }
  };
  A.kill = function (a, by, cause) {
    if (a.dead) return;
    a.dead = true; a.hp = 0; a.rot = 0; a.moving = false; a.z = SP[a.kind].cls === 'air' ? 0 : a.z; a.cause = cause || (by ? 'hunt' : 'other');
    const S = G.S;
    const stats = S.eco || (S.eco = { deaths: {}, born: {} });
    stats.deaths[a.kind] = (stats.deaths[a.kind] || 0) + 1;
    const cz = stats.cause || (stats.cause = {}); const ck = cz[a.kind] || (cz[a.kind] = {}); const cn = by ? (by.kind ? by.kind : 'gente') : a.cause; ck[cn] = (ck[cn] || 0) + 1;
    if (a.kind === 'wolf' && (a.raid || a.summoned)) {
      S.wolvesKilled = (S.wolvesKilled || 0) + 1;
      if (by && by.name && S._wolfLogDay !== S.day) { S._wolfLogDay = S.day; G.Village.log(`${by.name} matou um lobo defendendo a vila.`, 'wolf', a.x, a.y); }
    } else if (by && by.name && SP[a.kind].apex && S._apexLog !== S.day) { S._apexLog = S.day; G.Village.log(`${by.name} abateu ${SP[a.kind].nameA}.`, 'wolf', a.x, a.y); }
    if (SP[a.kind].cls === 'water' && !by) { a.sink = true; }
    if (by && by.kind && G.Carnage && G.Carnage.decal && SP[a.kind].cls !== 'water' && SP[a.kind].cls !== 'air' && !(a.z > 3)) G.Carnage.decal(a.x, a.y, G.rr(0.14, 0.22) * Math.min(2, SP[a.kind].size), 'pool');
    a.caught = 0; a.down = 0;
    if (SP[a.kind].herdMourn) {
      let n = 0;
      each(grid, a.x, a.y, 14, o => { if (o !== a && !o.dead && o.kind === a.kind && o.state !== 'flee' && !o.angry) { o.state = 'mourn'; o.target = a.id; o.t = G.rr(20, 40); n++; } });
      if (n >= 2 && (S.mournLog || -99) < S.day - 4) { S.mournLog = S.day; const w = G.Stories && G.Stories.where ? G.Stories.where(a.x, a.y).at : ''; G.Village.log(`${n} elefantes voltaram para velar o corpo de um dos seus${w}. Ficaram ali muito tempo, tocando-o com as trombas.`, 'deer', a.x, a.y); }
    }
    G.Lore && a.named && G.Lore.note('beastDied', { name: a.named, kind: a.kind, by: by && by.name ? by.name : null });
  };

  // ------------------------------ behaviours ------------------------------
  const PREYSET = {}; for (const k in SP) PREYSET[k] = new Set(SP[k].prey || []);
  const EATERS = {}; for (const k in A.eatenBy) EATERS[k] = new Set(A.eatenBy[k]);
  function findPrey(a, r) {
    const sp = SP[a.kind]; const ps = PREYSET[a.kind]; let best = null, bs = -1e9;
    each(grid, a.x, a.y, r, p => {
      if (p === a || p.dead || p.held || p.air || p.caught || !ps.has(p.kind)) return;
      if (a.noPrey && a.noPrey.id === p.id && G.S.clock < a.noPrey.until) return;
      if (SP[p.kind].cls === 'air' && p.z > 6) return;
      if (p.z > 3 && SP[p.kind].cls !== 'air' && sp.cls !== 'air' && sp.climb !== 'tree') return;
      const d = G.dist2(a.x, a.y, p.x, p.y); if (d > r * r) return;
      if (sp.cls === 'water' && !(G.S.type[W.idx(p.x, p.y)] <= T.SEA)) return;
      if (sp.cls === 'land' && G.S.type[W.idx(p.x, p.y)] <= T.SEA) return;
      // weak, young and slow prey first
      const s = -Math.sqrt(d) - (p.hp / p.maxHp) * 3 - SP[p.kind].hp / 40 + (p.grown < 1 ? 3 : 0);
      if (s > bs) { bs = s; best = p; }
    });
    return best;
  }
  function findCarcass(a, r) {
    let best = null, bd = r * r;
    const air = SP[a.kind].cls === 'air';
    each(grid, a.x, a.y, r, p => { if (!p.dead || p.meat <= 0 || p.held || p.sink || (p.z > 3 && !air)) return; const d = G.dist2(a.x, a.y, p.x, p.y); if (d < bd) { bd = d; best = p; } });
    return best;
  }
  function bestGrass(a, r) {
    const S = G.S; const veg = S.veg; let best = null, bv = -1;
    for (let k = 0; k < 8; k++) {
      const ang = G.R() * 6.28, d = G.R() * r; const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d;
      if (!walkOK(a, x, y) || noGo(a, x, y)) continue; const i = W.idx(x, y); if (S.type[i] < T.SAND) continue; if (!A.habitat(SP[a.kind], i) && k < 6) continue; if (k < 7 && !lineOK(a, x, y)) continue;
      const v = veg[i] - d * 0.02; if (v > bv) { bv = v; best = [x, y]; }
    }
    return best;
  }
  const eatRate = 7; // hunger units per day while eating
  function graze(a, dt) {
    const S = G.S; const sp = SP[a.kind]; const i = W.idx(a.x, a.y); const veg = S.veg;
    let food = veg[i];
    if (sp.diet === 'browse') { if (S.treeAt[i]) food += 0.5; const oid = S.objAt[i]; const b = oid && S.bushes.get(oid); if (b && b.berries > 0) food += 0.5; }
    if (food < 0.08) return false;
    const want = eatRate * dt / DAY();
    const take = Math.min(veg[i], want * sp.app * 0.25 * a.grown);
    veg[i] -= take;
    a.hunger = Math.max(0, a.hunger - want * Math.min(1, food * 2));
    a.moving = false; a.eating = 0.4;
    return true;
  }
  function eatMeat(a, prey, dt) {
    const sp = SP[a.kind];
    const bite = Math.min(prey.meat, dt * 3 * sp.size);
    prey.meat -= bite; a.hunger = Math.max(0, a.hunger - bite / Math.max(1, sp.app * 5));
    a.moving = false; a.eating = 0.4;
    if (prey.meat <= 0.05) { prey.meat = 0; return true; }
    return a.hunger < 0.05;
  }

  // prey reaction: flee people, predators and fire
  function fearCheck(a) {
    const S = G.S; const sp = SP[a.kind];
    if (sp.fear > 0 && !(a.angry > 0)) {
      const v = nearestVillager(a, sp.fear * (sp.defend && a.grown >= 1 ? 0.55 : 1));
      if (v) return v;
    }
    const eaters = EATERS[a.kind]; if (!eaters) return null;
    const r = (sp.fear || 3) + 1.5; const r2 = r * r;
    let th = null, td = r2;
    const x0 = ((a.x - r) / CELL) | 0, x1 = ((a.x + r) / CELL) | 0, y0 = ((a.y - r) / CELL) | 0, y1 = ((a.y + r) / CELL) | 0;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      const l = grid.get(cx + cy * 4096); if (!l) continue;
      for (let k = 0; k < l.length; k++) {
        const p = l[k]; if (p.dead || !eaters.has(p.kind)) continue;
        if (p.z > 25 && p.state !== 'dive') continue;
        if (a.z > 3 && SP[p.kind].cls !== 'air' && SP[p.kind].climb !== 'tree') continue;
        const dx = a.x - p.x, dy = a.y - p.y; let d = dx * dx + dy * dy;
        if (p.state === 'stalk' || p.state === 'flank') d *= 7; else if (p.sub > 0) d *= 9;
        if (d < td) { td = d; th = p; }
      }
    }
    return th;
  }


  // ------------------------------ the hunt, the feast and the trees ------------------------------
  // states in which a hunter is busy with its prey (no new prey, no new fears)
  const UP = { climb: 1, tree: 1, swing: 1, cache: 1, eat: 1 };
  const BUSY = { flee: 1, eat: 1, chase: 1, stalk: 1, pounce: 1, flank: 1, feedman: 1, lurk: 1, strike: 1, drown: 1, roll: 1, mourn: 1, cache: 1, swing: 1, climb: 1 };
  const HUNTING = { chase: 1, eat: 1, stalk: 1, pounce: 1, flank: 1, feedman: 1, strike: 1, drown: 1, roll: 1, cache: 1, mourn: 1 };
  // a tree near here, big enough to climb (the leafy ones; palms and cactus do not hold a monkey troop)
  function treeNear(x, y, r, fn) {
    const S = G.S; let best = null, bd = r * r;
    const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(N - 1, Math.ceil(x + r)), y0 = Math.max(0, Math.floor(y - r)), y1 = Math.min(N - 1, Math.ceil(y + r));
    for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
      const id = S.treeAt[yy * N + xx]; if (!id) continue; const t = S.trees.get(id);
      if (!t || t.stage !== 'grow' || t.size < 0.6 || t.kind === 'cactus') continue;
      if (fn && !fn(t)) continue;
      const d = G.dist2(x, y, t.x, t.y); if (d < bd) { bd = d; best = t; }
    }
    return best;
  }
  A.treeNear = treeNear;
  // how high in the canopy an animal sits (screen px above the ground, like the trees' sprites)
  const canopyZ = t => (t.kind === 'jungle' ? 21 : t.kind === 'baobab' ? 20 : t.kind === 'palm' ? 19 : t.kind === 'pine' || t.kind === 'snowpine' ? 17 : 14) * t.size;
  A.canopyZ = canopyZ;
  function startClimb(a, t, fast) {
    a.state = 'climb'; a.tree = t.id; a.tx = t.x + G.rr(-0.15, 0.15); a.ty = t.y + G.rr(-0.15, 0.15); a.perchZ = canopyZ(t) * G.rr(0.75, 1); a.t = fast ? 4 : 10; a.fast = !!fast;
  }
  // where a pack member waits: beside and a little beyond the prey, so a run from the leader ends in its jaws
  function flankSpot(a, L, p) {
    const ang0 = Math.atan2(p.y - L.y, p.x - L.x);
    const side = (G.hash(a.id) < 0.5 ? -1 : 1) * (0.8 + G.hash(a.id * 3) * 0.8);
    const r = 2.6 + G.hash(a.id * 7) * 1.6;
    const x = p.x + Math.cos(ang0 + side) * r + Math.cos(ang0) * 1.4, y = p.y + Math.sin(ang0 + side) * r + Math.sin(ang0) * 1.4;
    return walkOK(a, x, y) ? [x, y] : null;
  }
  // blood and flesh flying from a kill being torn apart
  function feastFX(a, c, dt) {
    a.ft = (a.ft || 0) - dt; if (a.ft > 0 || !G.FX) return;
    a.ft = G.rr(0.9, 1.8);
    const fx = G.Render ? G.Render.sface(a) : 1;
    for (let k = 0; k < 5; k++) G.FX.spawn({ x: c.x + G.rr(-0.2, 0.2), y: c.y + G.rr(-0.2, 0.2), h: W.groundH(c.x, c.y), z: (c.z || 0) + G.rr(1, 3), vx: G.rr(-0.8, 0.8) + fx * 0.3, vy: G.rr(-0.8, 0.8), vz: G.rr(15, 40), g: 160, life: G.rr(0.3, 0.6), s0: 1, s1: 0.4, c: k < 4 ? '#9a1a22' : '#c86a6a', k: 0 });
    if (G.Carnage && G.Carnage.decal && !(c.z > 3) && G.R() < 0.5) G.Carnage.decal(c.x + G.rr(-0.3, 0.3), c.y + G.rr(-0.3, 0.3), G.rr(0.07, 0.13), 'splat');
    if (G.R() < 0.3) G.Audio && G.Audio.at(c.x, c.y, 'bite');
  }
  // the one being held: pinned under a cat, dragged by a crocodile, crushed in a snake's coils
  function heldDown(a, dt) {
    if (a.caught) {
      const h = G.S.animals.get(a.caught);
      if (!h || h.dead || !(h.state === 'drown' || h.state === 'roll' || h.grip > 0)) { a.caught = 0; a.down = 0.6; }
      else { const f = G.Render ? G.Render.sface(h) : 1; a.x = h.x + f * 0.5; a.y = h.y + f * 0.2; a.moving = false; a.hurt = 0.1; a.walkPh += dt * 14; return true; }
    }
    if (a.down > 0) { a.down -= dt; a.moving = false; a.walkPh += dt * 12; return true; }
    return false;
  }
  const BEHAVE = {
    // creeping in, belly low, freezing whenever the prey lifts its head
    stalk(a, dt, sp, S) {
      const tg = S.animals.get(a.target) || S.villagers.get(a.target);
      if (!tg || tg.dead || tg.inside || tg.held || tg.air || tg.aboard || (tg.z > 3 && sp.climb !== 'tree')) { a.state = 'idle'; a.target = 0; a.crouch = 0; a.onPerson = false; return true; }
      a.crouch = 1; a.t -= dt;
      const d = G.dist(a.x, a.y, tg.x, tg.y);
      if (tg.kind && tg.state === 'flee' && d < 6) { a.state = 'chase'; a.t = 6; a.crouch = 0; return true; } // seen: now it is a race
      // a pride waits for its flankers — a few seconds, no more
      let wait = false;
      if ((sp.pride || sp.pack) && a.t > 9) { for (const o of packOf(a)) if (o.state === 'flank' && o.moving) { wait = true; break; } }
      if (d < (sp.stalk ? 3.4 : 2.2) && !wait) {
        a.crouch = 0;
        if (sp.stalk) { a.state = 'pounce'; a.pounce = 0.001; a.px = a.x; a.py = a.y; }
        else a.state = 'chase';
        a.t = 6; for (const o of packOf(a)) if (o.state === 'flank') { o.state = 'chase'; o.t = 7; o.crouch = 0; }
        return true;
      }
      if (a.t <= 0 || d > 15) { a.state = 'chase'; a.t = 6; a.crouch = 0; for (const o of packOf(a)) if (o.state === 'flank') { o.state = 'chase'; o.t = 7; o.crouch = 0; } return true; }
      if (wait && d < 5) { a.moving = false; return true; }
      if (tg.kind && Math.sin(S.clock * 1.7 + (tg.id || 0)) > 0.78) { a.moving = false; return true; }
      a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, tg.kind ? sp.sp * 0.42 : Math.max(sp.sp * 0.9, tg.moving ? 1.45 : 0.6));
      return true;
    },
    // a pack member circling round to the far side, low in the grass
    flank(a, dt, sp, S) {
      const tg = S.animals.get(a.target);
      if (!tg || tg.dead) { a.state = 'idle'; a.target = 0; a.crouch = 0; return true; }
      a.crouch = 1; a.t -= dt;
      if (tg.state === 'flee' && G.dist(a.x, a.y, tg.x, tg.y) < 5) { a.state = 'chase'; a.t = 7; a.crouch = 0; return true; }
      if (a.t <= 0) { a.state = 'chase'; a.t = 6; a.crouch = 0; return true; }
      if (G.dist(a.x, a.y, a.tx, a.ty) > 0.3) moveTo(a, dt, sp.sp * 1.15); else { a.moving = false; G.faceTo(a, tg.x - a.x, tg.y - a.y); }
      return true;
    },
    // the leap: the body in the air, the claws out, the weight of the cat bringing the prey down
    pounce(a, dt, sp, S) {
      const tg = S.animals.get(a.target) || S.villagers.get(a.target);
      if (!tg || tg.dead || tg.inside || tg.held) { a.state = 'idle'; a.pounce = 0; a.target = 0; return true; }
      a.pounce += dt / 0.42; const f = Math.min(1, a.pounce);
      const nx = a.px + (tg.x - a.px) * f, ny = a.py + (tg.y - a.py) * f;
      if (walkOK(a, nx, ny)) { a.x = nx; a.y = ny; }
      G.faceTo(a, tg.x - a.px, tg.y - a.py); a.moving = true;
      if (f < 1) return true;
      a.pounce = 0; a.moving = false;
      if (G.dist(a.x, a.y, tg.x, tg.y) > 1.4) { a.state = 'chase'; a.t = 4; return true; } // a miss: one short sprint
      G.Audio && G.Audio.at(a.x, a.y, 'bite'); a.bite = 0.3; a.blood = Math.max(a.blood || 0, 0.5);
      if (tg.kind) {
        tg.down = 1.6; A.damage(tg, (14 + sp.hp * 0.22) * a.grown, a);
        if (G.FX) G.FX.blood(tg.x, tg.y);
        if (tg.dead) { a.state = 'eat'; a.target = tg.id; a.t = 22; a.carc = true; } else { a.state = 'chase'; a.t = 4; }
      } else {
        tg.lastBeast = a.kind; tg.lastBeastId = a.id;
        // thrown to the ground under the weight of the cat: a warrior may get up, a lone woodcutter rarely does
        const armed = tg.role === 'guerreiro' || tg.role === 'arqueiro' || tg.unit; const dmg = 34 + sp.hp * 0.16;
        tg.downT = S.clock + (armed ? 1 : 2.6); tg.stagT = tg.downT;
        G.Carnage && G.Carnage.onHit(a, tg, dmg, tg.hp - dmg <= 0);
        G.Vg.damage(tg, dmg, 'beast', false); G.FX && G.FX.blood(tg.x, tg.y);
        if (!S.villagers.has(tg.id)) afterManKill(a, tg, sp); else { G.Vg.emote(tg, 'fear', 3); a.state = 'chase'; a.t = 6; }
      }
      return true;
    },
    // at the body of a person: drag it to cover, then eat — an arm, a leg, the belly
    feedman(a, dt, sp, S) {
      const C = G.Carnage; const cp = C && C.get(a.corpse);
      a.t -= dt;
      if (!cp || cp.claim || C.stage(cp) === 'bones' || a.t <= 0 || (cp.eaten || 0) >= 1 || a.hunger < 0.02) { if (cp) cp.bdrag = 0; a.state = 'idle'; a.t = 3; a.rest = G.rr(20, 40); a.corpse = 0; a.dragTo = null; return true; }
      // the living come with spears and fire: it lets go (the bolder it is, the longer it stays)
      const v = nearestVillager(a, 3.4, q => q.age >= 14 && !q.captive);
      if (v && G.R() < dt * (1.2 - sp.bold)) { cp.bdrag = 0; const p = fleeTarget(a, v.x, v.y, 7); if (p) { a.tx = p[0]; a.ty = p[1]; } a.state = 'flee'; a.t = 3; a.corpse = 0; return true; }
      const d = G.dist(a.x, a.y, cp.x, cp.y);
      if (d > 0.75 && !cp.bdrag) { a.tx = cp.x; a.ty = cp.y; moveTo(a, dt, sp.sp * 1.1); return true; }
      if (a.dragT > 0) { // dragging it by the neck, away from the open
        if (!a.dragTo) { const tr = treeNear(cp.x, cp.y, 7); a.dragTo = tr ? [tr.x + 0.3, tr.y + 0.3] : [cp.x + G.rr(-3, 3), cp.y + G.rr(-3, 3)]; }
        a.tx = a.dragTo[0]; a.ty = a.dragTo[1];
        const done = moveTo(a, dt, sp.sp * 0.45);
        const fx = G.Render ? G.Render.sface(a) : 1; cp.bdrag = 1; cp.x = a.x + fx * 0.45; cp.y = a.y - fx * 0.45;
        a.dragT -= dt; if (done || a.dragT <= 0) { a.dragT = 0; cp.bdrag = 0; }
        return true;
      }
      a.moving = false; a.eating = 0.4; a.blood = 1; a.state = 'feedman'; G.faceTo(a, cp.x - a.x, cp.y - a.y);
      a.mt = (a.mt || 0) - dt;
      if (a.mt <= 0) { a.mt = G.rr(1.3, 2.3); C.maul(cp, a); a.hunger = Math.max(0, a.hunger - 0.12); feastFX(a, cp, 1); }
      return true;
    },
    // the leopard hauls its kill up into a tree
    cache(a, dt, sp, S) {
      const c = S.animals.get(a.target); const tr = S.trees.get(a.tree);
      a.t -= dt;
      if (!c || !c.dead || c.meat <= 0 || !tr || a.t <= 0) { a.state = 'eat'; a.cached = true; return true; }
      const fx = G.Render ? G.Render.sface(a) : 1;
      if (G.dist(a.x, a.y, tr.x, tr.y) > 0.3) { a.tx = tr.x; a.ty = tr.y; moveTo(a, dt, sp.sp * 0.5); c.x = a.x + fx * 0.4; c.y = a.y - fx * 0.3; return true; }
      a.z = Math.min(canopyZ(tr) * 0.7, (a.z || 0) + dt * 14); c.x = a.x + fx * 0.3; c.y = a.y; c.z = a.z;
      if (a.z >= canopyZ(tr) * 0.7 - 0.1) { a.state = 'eat'; a.cached = true; a.t = 30; a.perch = tr.id; }
      return true;
    },
    // a crocodile waiting under the surface at the edge of the river
    lurk(a, dt, sp, S) {
      a.sub = 1; a.moving = false; a.t -= dt;
      if (a.t <= 0 || S.type[W.idx(a.x, a.y)] > T.RIVER) { a.state = 'idle'; a.sub = 0; a.t = 2; return true; }
      a.scan -= dt; if (a.scan > 0) return true; a.scan = 0.4;
      const ok = p => p && !p.dead && dWater[W.idx(p.x, p.y)] <= 1 && G.dist(a.x, a.y, p.x, p.y) < 2.8;
      let p = a.target && S.animals.get(a.target); if (!ok(p)) p = findPrey(a, 3);
      if (ok(p)) { a.target = p.id; a.state = 'strike'; a.t = 2.2; a.sub = 0; G.FX && G.FX.splash(a.x, a.y, 0.8); return true; }
      // a person at the water's edge, alone
      if (a.hunger > 0.5 || a.legend) {
        const v = nearestVillager(a, 2.6, q => !q.aboard && dWater[W.idx(q.x, q.y)] <= 1 && crowdAt(q.x, q.y, 3) <= 1);
        if (v && G.R() < sp.bold * 0.5) { a.target = v.id; a.state = 'strike'; a.t = 2.2; a.sub = 0; a.onPerson = true; G.FX && G.FX.splash(a.x, a.y, 0.8); }
      }
      return true;
    },
    // out of the water like a thrown log
    strike(a, dt, sp, S) {
      const tg = S.animals.get(a.target) || S.villagers.get(a.target);
      a.t -= dt;
      if (!tg || tg.dead || tg.inside || tg.held || a.t <= 0) { a.state = 'idle'; a.target = 0; a.onPerson = false; return true; }
      const d = G.dist(a.x, a.y, tg.x, tg.y);
      if (d < 0.9) {
        a.bite = 0.3; G.Audio && G.Audio.at(a.x, a.y, 'bite'); G.FX && G.FX.splash(a.x, a.y, 1);
        if (tg.kind) { tg.caught = a.id; A.damage(tg, Math.min(6, tg.hp * 0.25), a); a.state = 'drown'; a.t = 3; a.dz = deepSpot(a); }
        else { tg.lastBeast = a.kind; tg.lastBeastId = a.id; tg.downT = S.clock + 2.2; G.Vg.damage(tg, 22, 'beast', false); G.FX && G.FX.blood(tg.x, tg.y); if (!S.villagers.has(tg.id)) afterManKill(a, tg, sp); else { G.Vg.emote(tg, 'fear', 3); a.state = 'roll'; a.roll = 1.6; a.t = 1.6; } }
        return true;
      }
      a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, sp.run * 1.9);
      return true;
    },
    // dragging the prey into deep water
    drown(a, dt, sp, S) {
      const tg = S.animals.get(a.target); a.t -= dt;
      if (!tg || tg.dead) { a.state = tg && tg.dead ? 'eat' : 'idle'; a.t = 20; return true; }
      if (a.dz) { a.tx = a.dz[0]; a.ty = a.dz[1]; }
      if (moveTo(a, dt, sp.sp * 0.8) || a.t <= 0) { a.state = 'roll'; a.roll = 2.6; a.t = 2.6; }
      return true;
    },
    // the death roll: over and over in the churning water
    roll(a, dt, sp, S) {
      a.roll -= dt; a.moving = false;
      const tg = S.animals.get(a.target) || S.villagers.get(a.target);
      if (G.FX && G.R() < dt * 10) G.FX.splash(a.x + G.rr(-0.4, 0.4), a.y + G.rr(-0.4, 0.4), 0.5);
      a.rd = (a.rd || 0) - dt;
      if (tg && !tg.dead && a.rd <= 0) {
        a.rd = 0.45;
        if (tg.kind) A.damage(tg, 12, a);
        else { G.Vg.damage(tg, 14, 'beast', false); if (!S.villagers.has(tg.id)) { a.roll = 0; afterManKill(a, tg, sp); return true; } }
      }
      if (G.Carnage && G.Carnage.decal && G.R() < dt * 2) G.Carnage.decal(a.x + G.rr(-0.4, 0.4), a.y + G.rr(-0.4, 0.4), 0.2, 'splat');
      if (a.roll <= 0) { a.roll = 0; if (tg && tg.dead && tg.kind) { a.state = 'eat'; a.t = 25; a.carc = true; } else { a.state = 'idle'; a.t = 2; if (tg && tg.kind) tg.caught = 0; } }
      return true;
    },
    // the elephants come back to the body of one of their own, and stand there, touching it with their trunks
    mourn(a, dt, sp, S) {
      const c = S.animals.get(a.target); a.t -= dt;
      if (!c || a.t <= 0) { a.state = 'idle'; a.t = 3; a.target = 0; return true; }
      const ang = G.hash(a.id) * 6.28; const tx = c.x + Math.cos(ang) * 1.6, ty = c.y + Math.sin(ang) * 1.6;
      if (G.dist(a.x, a.y, tx, ty) > 0.3) { a.tx = tx; a.ty = ty; moveTo(a, dt, sp.sp * 0.6); }
      else { a.moving = false; G.faceTo(a, c.x - a.x, c.y - a.y); }
      return true;
    },
    // up the trunk into the canopy
    climb(a, dt, sp, S) {
      const tr = S.trees.get(a.tree); a.t -= dt;
      if (!tr || tr.stage !== 'grow' || a.t <= 0) { a.state = 'idle'; a.z = 0; a.perch = 0; a.t = 1; return true; }
      if (G.dist(a.x, a.y, a.tx, a.ty) > 0.15 && !(a.z > 0.5)) { moveTo(a, dt, (a.fast ? sp.run : sp.sp) * (sp.arbor === true ? 3 : 1)); return true; }
      a.moving = true; a.walkPh += dt * 6;
      a.z = Math.min(a.perchZ, (a.z || 0) + dt * (a.fast ? 26 : 12) * (sp.arbor === true ? 0.3 : 1));
      if (a.z >= a.perchZ - 0.05) { a.state = 'tree'; a.perch = tr.id; a.moving = false; a.t = sp.arbor === true ? G.rr(60, 200) : G.rr(6, 22); }
      return true;
    },
    // in the canopy: eating, grooming, watching — then a swing on a vine to the next tree, or down
    tree(a, dt, sp, S) {
      const tr = S.trees.get(a.perch);
      if (!tr || tr.stage !== 'grow') { a.state = 'idle'; a.z = 0; a.perch = 0; a.t = 1; return true; }
      a.moving = false; a.t -= dt;
      if (sp.diet === 'browse' || sp.diet === 'omni') { if (a.hunger > 0.2 && G.R() < dt * 0.5) { a.hunger = Math.max(0, a.hunger - (tr.fruit > 0 ? 0.25 : 0.1)); a.eating = 0.8; if (tr.fruit > 0) tr.fruit = Math.max(0, tr.fruit - 0.25); } }
      if (sp.climb === 'tree' && a.target && S.animals.get(a.target) && S.animals.get(a.target).dead) return false; // (a leopard eating in its tree: the eat state carries on)
      if (a.t > 0) return true;
      if (sp.arbor === 'troop') {
        const L = a.leader && S.animals.get(a.leader);
        // follow the troop: the next tree is in the direction the leader went
        const next = treeNear(L && L !== a && !L.dead ? L.x : a.x + G.rr(-3, 3), L && L !== a && !L.dead ? L.y : a.y + G.rr(-3, 3), 4.5, t => t.id !== tr.id && G.dist(t.x, t.y, tr.x, tr.y) > 1.2 && G.dist(t.x, t.y, tr.x, tr.y) < 5);
        if (next && G.R() < 0.75) { a.state = 'swing'; a.swing = 0.001; a.sw0 = [a.x, a.y, a.z]; a.sw1 = [next.x + G.rr(-0.15, 0.15), next.y + G.rr(-0.15, 0.15), canopyZ(next) * G.rr(0.75, 1)]; a.tree = next.id; G.faceTo(a, next.x - a.x, next.y - a.y); return true; }
        if (G.R() < 0.35 || a.hunger > 0.6) { a.state = 'idle'; a.z = 0; a.perch = 0; a.t = G.rr(4, 10); return true; } // down to drink and forage
        a.t = G.rr(5, 14); return true;
      }
      if (sp.arbor === true) { // the sloth: once in a long while, to the tree next door
        const next = treeNear(a.x, a.y, 2.2, t => t.id !== tr.id);
        if (next && G.R() < 0.3) { a.state = 'swing'; a.swing = 0.001; a.slow = 1; a.sw0 = [a.x, a.y, a.z]; a.sw1 = [next.x, next.y, canopyZ(next) * 0.85]; a.tree = next.id; return true; }
        a.t = G.rr(60, 200); return true;
      }
      a.state = 'idle'; a.z = 0; a.perch = 0; a.t = G.rr(2, 6); return true; // the cats come down
    },
    // from tree to tree on a vine: the arc dips in the middle
    swing(a, dt, sp, S) {
      a.swing += dt / (a.slow ? 40 : 1.15); const f = Math.min(1, a.swing);
      const [x0, y0, z0] = a.sw0, [x1, y1, z1] = a.sw1;
      a.x = x0 + (x1 - x0) * f; a.y = y0 + (y1 - y0) * f; a.z = z0 + (z1 - z0) * f - Math.sin(f * Math.PI) * (a.slow ? 2 : 7);
      a.moving = true;
      if (f >= 1) { a.swing = 0; a.slow = 0; a.state = 'tree'; a.perch = a.tree; a.z = z1; a.moving = false; a.t = sp.arbor === true ? G.rr(80, 220) : G.rr(4, 12); if (G.R() < 0.2) G.Audio && G.Audio.at(a.x, a.y, 'monkey'); }
      return true;
    },
  };
  // the others of the same pack, pride or clan
  function packOf(a) {
    const out = []; const L = a.leader || a.id;
    each(grid, a.x, a.y, 14, o => { if (o !== a && !o.dead && o.kind === a.kind && (o.leader === L || o.id === L)) out.push(o); });
    return out;
  }
  // deep water a little way from the shore, for the drowning
  function deepSpot(a) {
    const S = G.S; let best = null, bd = -1;
    for (let k = 0; k < 12; k++) { const ang = k / 12 * 6.28; const x = a.x + Math.cos(ang) * 1.6, y = a.y + Math.sin(ang) * 1.6; if (!W.inb(x, y)) continue; const i = W.idx(x, y); if (S.type[i] > T.RIVER) continue; const d = dLand[i]; if (d > bd) { bd = d; best = [x, y]; } }
    return best;
  }
  // a person killed by a beast: it stays with the body
  function afterManKill(a, v, sp) {
    noteManEater(a); a.onPerson = false; a.target = 0;
    const cp = G.Carnage && G.Carnage.byVid ? G.Carnage.byVid(v.id) : null;
    if (cp && (sp.stalk || sp.pack || sp.pride || sp.apex || a.legend)) { a.state = 'feedman'; a.corpse = cp.id; a.t = 45; a.dragT = sp.stalk && !a.legend ? G.rr(3, 6) : 0; a.dragTo = null; a.mt = 1.2; }
    else { a.hunger = Math.max(0, a.hunger - 0.5); a.state = 'idle'; a.rest = 20; }
  }
  function landAI(a, dt) {
    const S = G.S; const sp = SP[a.kind];
    // angry defenders & territorial giants charge whoever hurt them
    if (a.angry > 0) {
      a.angry -= dt;
      const v = S.villagers.get(a.target) || S.animals.get(a.target);
      if (v && !v.dead && !v.inside && !v.held && G.dist(a.x, a.y, v.x, v.y) < 16) {
        a.tx = v.x; a.ty = v.y; a.state = 'chase';
        if (G.dist(a.x, a.y, v.x, v.y) < 0.6 + sp.size * 0.3) { bite(a, v, dt); return; }
        moveTo(a, dt, sp.run * 0.95); return;
      }
      a.angry = 0; a.state = 'idle';
    }
    if (a.tamed && guardAI(a, dt)) return;
    // pinned under a cat, in a crocodile's jaws, in a snake's coils: nothing left to decide
    if (heldDown(a, dt)) return;
    if (BEHAVE[a.state] && BEHAVE[a.state](a, dt, sp, S)) return;
    a.scan -= dt;
    const hungry = a.hunger > (sp.diet === 'carn' || sp.diet === 'scav' ? 0.42 : 0.3);
    if (a.scan <= 0) {
      a.scan = 0.45 + G.R() * 0.3;
      if (!HUNTING[a.state] && !a.tamed && !a.legend) {
        const th = fearCheck(a);
        if (th && a.state !== 'lunge') {
          // up the nearest tree, out of reach (monkeys, and the cubs of the cats)
          const up = sp.arbor && !(a.z > 3) && SP[th.kind || 'rabbit'] && SP[th.kind || 'rabbit'].climb !== 'tree' ? treeNear(a.x, a.y, 3.5) : null;
          if (up) startClimb(a, up, true);
          else {
            const p = fleeTarget(a, th.x, th.y, a.kind === 'rabbit' || a.kind === 'hare' || a.kind === 'frog' || a.kind === 'lizard' ? 4 : 6);
            if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 2.5; if (a.z > 3) { a.z = 0; a.perch = 0; } }
          }
        }
        const i = W.idx(a.x, a.y);
        if (S.fire[i] > 0 || S.fire[Math.min(N * N - 1, i + 1)] > 0 || S.fire[Math.max(0, i - 1)] > 0) { const p = fleeTarget(a, a.x + G.rr(-0.5, 0.5), a.y + G.rr(-0.5, 0.5), 6); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 2.5; } }
      }
      // hunters look for a meal
      if ((sp.diet === 'carn' || sp.diet === 'omni' || sp.diet === 'scav') && !BUSY[a.state] && a.rest <= 0) {
        if (sp.diet === 'scav' || (hungry && G.R() < 0.5)) { const c = findCarcass(a, sp.diet === 'scav' ? 14 : 8); if (c) { a.target = c.id; a.state = 'chase'; a.carc = true; } }
        if (a.state !== 'chase' && hungry && (sp.diet === 'carn' || a.hunger > 0.6)) {
          // packs share their leader's quarry
          const L = a.leader && S.animals.get(a.leader);
          let p = L && !L.dead && L.state === 'chase' && L.target ? S.animals.get(L.target) : null;
          // the pride closes in: while the leader creeps, the others take places on the far side of the prey
          if ((!p || p.dead) && L && !L.dead && L.state === 'stalk' && L.target && (sp.pack || sp.pride)) {
            const q = S.animals.get(L.target);
            if (q && !q.dead) { const f = flankSpot(a, L, q); if (f) { a.tx = f[0]; a.ty = f[1]; a.state = 'flank'; a.target = q.id; a.t = 9; a.carc = false; return; } }
          }
          if (!p || p.dead) p = findPrey(a, sp.ambush ? 6 : sp.stalk || sp.pack ? 12 : 10);
          if (p) {
            a.target = p.id; a.carc = false; const dd = G.dist(a.x, a.y, p.x, p.y);
            if (a.kind === 'croc' && S.type[W.idx(a.x, a.y)] <= T.RIVER) { a.state = 'lurk'; a.sub = 1; a.t = 30; }
            else if ((sp.stalk || (sp.pack && !a.leader)) && dd > 3.2) { a.state = 'stalk'; a.t = 16; }
            else { a.state = sp.ambush && dd > 1.5 ? 'lunge' : 'chase'; a.t = 9; }
          } else if (a.kind === 'croc' && S.type[W.idx(a.x, a.y)] <= T.RIVER && dLand[W.idx(a.x, a.y)] <= 1) { a.state = 'lurk'; a.sub = 1; a.t = 25; a.target = 0; }
          else if ((sp.bold > 0 && a.hunger > 0.7 && !a.tamed) || (a.legend && a.hunger > 0.35)) {
            // hungry and bold: a lone person looks like prey (a legend fears no crowd)
            const night = G.isNight();
            const v = nearestVillager(a, a.legend ? 10 : a.kind === 'croc' ? 2.6 : 6, v => v.age >= 0 && (a.legend || crowdAt(v.x, v.y, 3) <= 1) && (a.legend || a.kind !== 'croc' || S.type[W.idx(v.x, v.y)] <= T.RIVER || (dWater[W.idx(v.x, v.y)] <= 1)));
            if (v && G.R() < (a.legend ? 0.7 : sp.bold * (night ? 1.6 : 0.8))) { a.target = v.id; a.state = sp.stalk && !a.legend && G.dist(a.x, a.y, v.x, v.y) > 3.2 ? 'stalk' : 'chase'; a.t = a.legend ? 14 : a.state === 'stalk' ? 14 : 8; a.carc = false; a.onPerson = true; }
          }
        }
      }
    }
    if (a.rest > 0) a.rest -= dt;
    a.t -= dt;
    switch (a.state) {
      case 'flee': if (moveTo(a, dt, sp.run * (0.7 + 0.3 * a.hp / a.maxHp) * (a.grown < 1 ? 0.85 : 1)) || a.t <= 0) { a.state = 'idle'; a.t = G.rr(0.5, 2); } return;
      case 'lunge': case 'chase': {
        const tg = S.animals.get(a.target) || S.villagers.get(a.target);
        if (!tg || tg.held || tg.inside || (tg.air) || (!a.carc && tg.dead && tg.meat <= 0) || (a.carc && (!tg.dead || tg.meat <= 0))) { a.state = 'idle'; a.target = 0; a.onPerson = false; return; }
        const d = G.dist(a.x, a.y, tg.x, tg.y);
        if (a.state === 'lunge') { // ambushers creep in low and slow, then strike
          if (d < 1.9) { a.state = 'chase'; a.t = 3; return; }
          if (a.t <= 0 || d > 8) { a.state = 'idle'; a.target = 0; a.rest = 3; return; }
          a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, sp.sp * 0.55);
          return;
        }
        if (tg.dead) { if (d < 0.7) { a.state = 'eat'; a.t = 20; return; } a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, sp.sp * 1.3); return; }
        if (a.t <= 0 || d > 16) { a.state = 'idle'; a.target = 0; a.rest = G.rr(6, 12); a.onPerson = false; return; }
        if (d < 0.55 + sp.size * 0.25) { bite(a, tg, dt); return; }
        a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, sp.run * (sp.ambush ? 1.25 : a.t > 5.5 ? 1.3 : 1.02));
        return;
      }
      case 'eat': {
        const c = S.animals.get(a.target);
        if (!c || !c.dead || c.meat <= 0 || a.t <= 0) { a.state = 'idle'; a.target = 0; a.t = G.rr(2, 5); if (a.z > 3 && !sp.arbor) { a.z = 0; a.perch = 0; } return; }
        // a leopard does not eat in the open: up the tree with it, out of the hyenas' reach
        if (sp.climb === 'tree' && !c.z && c.meat > 2 && SP[c.kind].meat <= 14 && !a.cached) { const tr = treeNear(c.x, c.y, 6); if (tr) { a.state = 'cache'; a.tree = tr.id; a.t = 14; return; } }
        if (c.z > 3) a.z = c.z; G.faceTo(a, c.x - a.x, c.y - a.y);
        if (sp.diet === 'carn' || sp.apex || sp.diet === 'scav') { a.blood = Math.min(1, (a.blood || 0) + dt * 0.4); c.gore = 1; feastFX(a, c, dt); }
        if (eatMeat(a, c, dt)) { a.state = 'idle'; a.target = 0; a.t = G.rr(3, 8); a.rest = G.rr(10, 25); a.cached = false; }
        return;
      }
      case 'graze': {
        if (!graze(a, dt) || a.hunger < 0.05 || a.t <= 0) { a.state = 'idle'; a.t = G.rr(0.5, 2); }
        return;
      }
      case 'wander': if (moveTo(a, dt, sp.sp * (a.seek ? 1.2 : 1))) { a.state = hungry && sp.diet !== 'carn' ? 'graze' : 'idle'; a.seek = false; a.t = hungry ? G.rr(3, 8) : G.rr(1.5, 5); } return;
    }
    // idle: eat, follow the herd, or roam the habitat
    a.moving = false;
    if (a.t > 0) return;
    if (sp.arbor && !(a.z > 3)) { const tr = treeNear(a.x, a.y, sp.arbor === true ? 6 : 4); if (tr && G.R() < (sp.arbor === true ? 1 : 0.75)) { startClimb(a, tr, false); return; } }
    if (sp.climb === 'tree' && !hungry && !G.isNight() && G.R() < 0.25) { const tr = treeNear(a.x, a.y, 4); if (tr) { startClimb(a, tr, false); a.t = G.rr(20, 50); return; } }
    if (a.kind === 'croc' && S.type[W.idx(a.x, a.y)] <= T.RIVER && dLand[W.idx(a.x, a.y)] <= 1 && G.R() < 0.4) { a.state = 'lurk'; a.sub = 1; a.t = G.rr(15, 30); a.target = 0; return; }
    // migrants, guardians and legends keep to the place the god gave them
    if (a.mig || a.tamed || a.legend) {
      const dh = G.dist(a.x, a.y, a.hx, a.hy);
      if (a.mig && dh < 3) a.mig = false;
      else if (dh > (a.mig ? 2.5 : a.tamed ? 5 : 9)) { const h = homeward(a, a.mig ? 7 : 5); if (h) { a.tx = h[0]; a.ty = h[1]; a.state = 'wander'; a.seek = a.mig; return; } }
    }
    if (hungry && (sp.diet === 'herb' || sp.diet === 'browse' || (sp.diet === 'omni' && a.hunger < 0.6))) {
      if (graze(a, dt)) { a.state = 'graze'; a.t = G.rr(3, 7); return; }
      if (sp.diet === 'omni') { const b = nearBush(a); if (b) { b.berries = Math.max(0, b.berries - 1); a.hunger = Math.max(0, a.hunger - 0.3); a.t = 3; return; } }
      const p = bestGrass(a, 6); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'wander'; a.seek = true; return; }
    }
    if ((sp.diet === 'insect') && a.hunger > 0.2) a.hunger = Math.max(0, a.hunger - 0.25);
    let p = null;
    const L = a.leader && S.animals.get(a.leader);
    const astray = !A.habitat(sp, W.idx(a.x, a.y));
    if (L && !L.dead && L !== a && !astray && G.R() < 0.75) p = pickNear({ x: L.x, y: L.y, kind: a.kind }, 2.5);
    else p = pickNear(a, a.kind === 'rabbit' || a.kind === 'frog' || a.kind === 'lizard' ? 3 : sp.apex ? 8 : 5, true);
    if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'wander'; } else a.t = 1;
    if (a.kind === 'wolf' && G.isNight() && G.R() < 0.04) { G.Audio && G.Audio.at(a.x, a.y, 'howl', true); a.howl = 2; }
  }
  function nearBush(a) { const S = G.S; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = a.x + dx, y = a.y + dy; if (!W.inb(x, y)) continue; const o = S.objAt[W.idx(x, y)]; const b = o && S.bushes.get(o); if (b && b.berries > 0) return b; } return null; }

  // a tamed beast guards its city: it runs down hostile beasts and enemy soldiers near home
  function guardAI(a, dt) {
    const S = G.S; const sp = SP[a.kind];
    if (a.gt && a.state !== 'chase') a.gt = false;
    if (a.gt) {
      const tg = S.animals.get(a.target) || S.villagers.get(a.target);
      if (!tg || tg.dead || tg.inside || tg.held || tg.air || G.dist(a.hx, a.hy, tg.x, tg.y) > 15) { a.state = 'idle'; a.target = 0; a.gt = false; a.t = 1; return true; }
      if (G.dist(a.x, a.y, tg.x, tg.y) < 0.6 + sp.size * 0.3) { bite(a, tg, dt); return true; }
      a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, sp.run); return true;
    }
    a.gscan -= dt; if (a.gscan > 0) return false;
    a.gscan = 0.7;
    const f = G.Fac.get(a.tamed); if (!f || f.alive === false) { a.tamed = 0; return false; }
    let best = null, bd = 144;
    each(grid, a.hx, a.hy, 10, p => {
      if (p === a || p.dead || p.tamed || p.held || p.air) return; const q = SP[p.kind]; if (!q || q.cls === 'water' || q.cls === 'air') return;
      if (!A.threat(p) && !(p.onPerson && p.state === 'chase')) return;
      const d = G.dist2(a.x, a.y, p.x, p.y); if (d < bd) { bd = d; best = p; }
    });
    if (!best) {
      const foes = G.Fac.enemiesOf(a.tamed);
      if (foes.length) {
        const ids = new Set(foes.map(o => o.id));
        each(vgrid, a.hx, a.hy, 10, v => { if (v.inside || v.held || v.captive || v.age < 14 || v.aboard) return; if (!ids.has(G.Fac.idOfV(v))) return; const d = G.dist2(a.x, a.y, v.x, v.y); if (d < bd) { bd = d; best = v; } });
      }
    }
    if (best) { a.target = best.id; a.state = 'chase'; a.gt = true; a.carc = false; a.onPerson = false; a.t = 10; return true; }
    return false;
  }
  function bite(a, tg, dt) {
    const sp = SP[a.kind];
    a.moving = false; G.faceTo(a, tg.x - a.x, tg.y - a.y);
    a.cd = (a.cd || 0) - dt;
    if (a.cd > 0) return;
    a.cd = 1.1; a.bite = 0.25;
    G.Audio && G.Audio.at(a.x, a.y, 'bite');
    const dmg = (6 + sp.hp * 0.12 + (sp.apex ? 6 : 0)) * (a.legend ? 2.2 : a.tamed ? 1.4 : 1);
    if (tg.kind) { // another animal
      if (sp.constrict && !tg.dead && SP[tg.kind].size <= sp.size * 1.3) { a.grip = 4; tg.caught = a.id; } // the coils close
      A.damage(tg, dmg * (a.grown) * (sp.constrict ? 0.6 : 1), a);
      if (sp.apex || sp.pack || sp.stalk) a.blood = Math.max(a.blood || 0, 0.4);
      if (tg.dead) { a.state = 'eat'; a.target = tg.id; a.t = 20; a.carc = true; a.onPerson = false; a.grip = 0; }
    } else {
      const cause = a.kind === 'wolf' ? 'wolf' : a.kind === 'boar' ? 'boar' : 'beast';
      tg.lastBeast = a.kind; tg.lastBeastId = a.id;
      if (sp.apex || sp.stalk || sp.pack) { G.Carnage && G.Carnage.onHit(a, tg, dmg * 0.8, tg.hp - dmg * 0.8 <= 0); if (tg.downT > G.S.clock - 0.5) tg.downT = G.S.clock + 1.25; }
      G.Vg.damage(tg, dmg * 0.8, cause, a.summoned);
      G.FX && G.FX.blood(tg.x, tg.y);
      if (G.S.villagers.has(tg.id)) { G.Vg.emote(tg, 'fear', 2); tg.lastBeast = a.kind; }
      else afterManKill(a, tg, sp);
    }
  }
  // a beast that has killed people gets a name — and a legend
  function noteManEater(a) {
    a.kills = (a.kills || 0) + 1;
    if (a.kills >= 2 && !a.named && G.mythName) {
      a.named = G.mythName();
      const sp = SP[a.kind]; const where = G.Village.nearSettlementName(a.x, a.y);
      G.Village.log(`${sp.nameA.replace(/^u/, 'U')} devoradora de gente ronda${where ? ' ' + where : ''}. Chamam-na de ${a.named}.`.replace('devoradora', sp.g === 'f' ? 'devoradora' : 'devorador').replace('Chamam-na', sp.g === 'f' ? 'Chamam-na' : 'Chamam-no'), 'wolf', a.x, a.y);
      G.Lore && G.Lore.note('beast', { name: a.named, kind: a.kind, where });
    }
  }

  // ---------------- livestock ----------------
  function domAI(a, dt) {
    const S = G.S; const sp = SP[a.kind];
    if (a.hold > 0) { a.hold -= dt; a.moving = false; return; }
    a.scan -= dt;
    if (a.scan <= 0) {
      a.scan = 0.5 + G.R() * 0.3;
      if (a.state !== 'led') { const th = fearCheck(a); if (th) { const p = fleeTarget(a, th.x, th.y, 4); if (p) { a.tx = p[0]; a.ty = p[1]; a.flee = 2.5; } } }
    }
    if (a.flee > 0) { a.flee -= dt; if (moveTo(a, dt, sp.run)) a.flee = 0; return; }
    if (a.state === 'led') {
      const v = S.villagers.get(a.ledBy);
      if (!v || !v.task) { a.state = 'pen'; a.ledBy = 0; return; }
      const d = G.dist(a.x, a.y, v.x, v.y);
      if (d > 12) { a.x = v.x; a.y = v.y; }
      if (d > 0.75) { a.tx = v.x - v.face * 0.45; a.ty = v.y + 0.15; moveTo(a, dt, Math.max(sp.sp, 1.2) * (d > 2.5 ? 1.7 : 1.05)); } else a.moving = false;
      return;
    }
    if (a.state === 'herd') {
      const v = S.villagers.get(a.herder);
      if (!v || !v.task || v.task.type !== 'herd') { a.state = 'pen'; a.herder = 0; }
      else {
        const d = G.dist(a.x, a.y, v.x, v.y);
        if (d > 14) { a.x = v.x + G.rr(-1, 1); a.y = v.y + G.rr(-1, 1); }
        if (v.task.st === 3) { // spread out around the shepherd and graze
          a.t -= dt;
          if (a.t <= 0) { const ang = G.hash(a.id) * 6.28 + G.R() * 2; const r = G.rr(0.7, 2.8); const tx = v.x + Math.cos(ang) * r, ty = v.y + Math.sin(ang) * r; if (walkOK(a, tx, ty)) { a.tx = tx; a.ty = ty; } a.t = G.rr(2.5, 6); }
          if (a.hunger > 0.03 && graze(a, dt)) { a.moving = false; return; }
          if (G.dist(a.x, a.y, a.tx, a.ty) > 0.15) moveTo(a, dt, sp.sp * 0.6); else a.moving = false;
        } else if (d > 1.1) {
          const ang = G.hash(a.id) * 6.28; a.tx = v.x - v.face * 0.9 + Math.cos(ang) * 0.9; a.ty = v.y + Math.sin(ang) * 0.9;
          moveTo(a, dt, Math.max(sp.sp * 1.4, 1.05) * (d > 4 ? 1.5 : 1));
        } else a.moving = false;
        return;
      }
    }
    const pen = a.pen && S.buildings.get(a.pen);
    if (!pen) { a.t -= dt; if (a.t <= 0) { const p = pickNear({ x: a.hx, y: a.hy, kind: a.kind }, 2.5); if (p) { a.tx = p[0]; a.ty = p[1]; } a.t = G.rr(3, 7); } if (G.dist(a.x, a.y, a.tx, a.ty) > 0.1) moveTo(a, dt, sp.sp * 0.5); else a.moving = false; return; }
    const x0 = pen.x + 0.3, x1 = pen.x + pen.w - 0.3, y0 = pen.y + 0.3, y1 = pen.y + pen.h - 0.3;
    if (a.x < pen.x - 0.2 || a.x > pen.x + pen.w + 0.2 || a.y < pen.y - 0.2 || a.y > pen.y + pen.h + 0.2) { // strayed: back through the gate
      a.tx = pen.x + pen.w / 2 + G.rr(-0.5, 0.5); a.ty = pen.y + pen.h / 2 + G.rr(-0.5, 0.5); moveTo(a, dt, sp.sp * 1.2); return;
    }
    a.t -= dt;
    if (a.eating > 0) { graze(a, dt); a.moving = false; return; }
    if (a.t <= 0) {
      if (a.hunger > 0.2 && graze(a, dt)) { a.t = G.rr(2, 5); return; }
      a.tx = G.rr(x0, x1); a.ty = G.rr(y0, y1); a.t = G.rr(3, 9);
    }
    if (G.dist(a.x, a.y, a.tx, a.ty) > 0.1) { moveTo(a, dt, sp.sp * 0.45); a.x = G.clamp(a.x, x0 - 0.1, x1 + 0.1); a.y = G.clamp(a.y, y0 - 0.1, y1 + 0.1); } else a.moving = false;
  }

  // raiders and summoned packs: the old wolves that come, bite and go
  function raidWolfAI(a, dt) {
    const S = G.S; const d = SP.wolf;
    a.leaveT -= dt;
    if ((a.leaveT <= 0 || a.hp < a.maxHp * 0.3) && a.state !== 'leave') { a.state = 'leave'; a.tx = null; }
    if (a.state === 'leave') {
      if (a.tx === null || a.tx === undefined) {
        let best = null, bd = 1e9;
        for (let k = 0; k < 24; k++) {
          const ang = k / 24 * 6.28;
          for (let r = 2; r < 40; r += 2) {
            const x = a.x + Math.cos(ang) * r, y = a.y + Math.sin(ang) * r;
            if (!W.inb(x, y)) break;
            if (S.type[W.idx(x, y)] <= T.SEA) { if (r < bd) { bd = r; best = [x, y]; } break; }
          }
        }
        if (!best) { A.remove(a); return; }
        a.tx = best[0]; a.ty = best[1];
      }
      const dx = a.tx - a.x, dy = a.ty - a.y; const dd = Math.hypot(dx, dy);
      if (dd < 0.3) { G.FX && G.FX.splash(a.x, a.y, 0.6); A.remove(a); return; }
      const step = Math.min(dd, d.run * dt);
      a.x += dx / dd * step; a.y += dy / dd * step; G.faceTo(a, dx, dy); a.walkPh += step * 8; a.moving = true;
      return;
    }
    if (a.state === 'eat') { a.t -= dt; a.moving = false; if (a.t <= 0) { a.state = 'idle'; a.t = 2; } return; }
    a.scan -= dt;
    if (a.scan <= 0) {
      a.scan = 0.8 + G.R() * 0.4;
      const hostile = a.summoned || G.isNight() || a.raid;
      let tgt = null;
      const cur = a.target && (S.villagers.get(a.target) || S.animals.get(a.target));
      if (cur && !cur.dead && !cur.inside && !cur.held && G.dist(a.x, a.y, cur.x, cur.y) < 14) tgt = cur;
      if (!tgt && a.sated <= 0) {
        const p = findPrey(a, 12); let bd = p ? G.dist2(a.x, a.y, p.x, p.y) : 1e9; tgt = p;
        if (hostile) { const v = nearestVillager(a, 11); if (v) { const dv = G.dist2(a.x, a.y, v.x, v.y); if (!tgt || dv < bd * 1.3 || a.summoned) tgt = v; } }
      }
      if (tgt) { a.target = tgt.id; a.state = 'chase'; }
      else if (a.state === 'chase') { a.state = 'idle'; a.target = 0; }
    }
    if (a.sated > 0) a.sated -= dt;
    if (a.state === 'chase') {
      const tgt = S.villagers.get(a.target) || S.animals.get(a.target);
      if (!tgt || tgt.dead || tgt.inside || tgt.held) { a.state = 'idle'; a.target = 0; a.t = 1; return; }
      a.tx = tgt.x; a.ty = tgt.y;
      if (G.dist(a.x, a.y, tgt.x, tgt.y) < 0.65) {
        a.moving = false; G.faceTo(a, tgt.x - a.x, tgt.y - a.y);
        a.cd = (a.cd || 0) - dt;
        if (a.cd <= 0) {
          a.cd = 1.1; a.bite = 0.25; G.Audio && G.Audio.at(a.x, a.y, 'bite');
          if (tgt.kind) { A.damage(tgt, 14, a); if (tgt.dead) { a.state = 'eat'; a.t = 6; a.sated = 40; tgt.meat = Math.max(0, tgt.meat - 4); } }
          else { G.Vg.damage(tgt, 11, 'wolf', a.summoned); G.FX && G.FX.blood(tgt.x, tgt.y); if (G.S.villagers.has(tgt.id)) G.Vg.emote(tgt, 'fear', 2); }
        }
        return;
      }
      moveTo(a, dt, d.run * (a.summoned ? 1 : 0.95));
      return;
    }
    a.t -= dt;
    if (a.state === 'wander') { if (moveTo(a, dt, d.sp)) { a.state = 'idle'; a.t = G.rr(1, 4); } return; }
    if (a.t <= 0) {
      const L = a.leader && S.animals.get(a.leader);
      const p = (L && !L.dead && G.R() < 0.75) ? pickNear({ x: L.x, y: L.y, kind: 'wolf' }, 2.5) : pickNear(a, 6);
      if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'wander'; } else a.t = 1;
      if (G.isNight() && G.R() < 0.06) { G.Audio && G.Audio.at(a.x, a.y, 'howl', true); a.howl = 2; }
    }
  }

  // ---------------- the sea ----------------
  function nearestShoal(a, r) { let best = null, bd = r * r; for (const f of G.S.fish) { const d = G.dist2(a.x, a.y, f.x, f.y); if (d < bd && f.n > 0) { bd = d; best = f; } } return best; }
  function waterAI(a, dt) {
    const S = G.S; const sp = SP[a.kind];
    a.t -= dt; a.scan -= dt;
    // dolphins leap, whales blow, everyone bobs
    a.ph = (a.ph || G.R() * 6) + dt;
    if (a.kind === 'whale' && G.R() < dt * 0.06) { a.spout = 1.6; G.FX && G.FX.spawn({ x: a.x, y: a.y, h: G.SEA, z: 6, vz: 70, g: 60, life: 1.2, s0: 3, s1: 9, c: 'rgba(235,245,255,0.7)', k: 2 }); }
    if (a.spout > 0) a.spout -= dt;
    if (a.kind === 'dolphin' && a.moving && G.R() < dt * (a.state === 'ride' ? 0.7 : 0.25) && !(a.leap > 0)) a.leap = 1;
    // dolphins come to play in the bow wave of a passing boat
    if (a.kind === 'dolphin' && a.state !== 'chase') {
      if (a.state === 'ride') {
        const sh = S.ships.find(q => q.id === a.ride);
        if (!sh || !sh.moving || a.t <= 0 || G.dist2(sh.x, sh.y, a.x, a.y) > 36) { a.state = 'idle'; a.ride = 0; a.t = G.rr(4, 10); }
        else {
          const l = Math.hypot(sh.fx || 0, sh.fy || 0) || 1, fx = (sh.fx || 0) / l, fy = (sh.fy || 0) / l, side = (a.id & 1 ? 1 : -1) * (0.25 + Math.sin(a.ph * 0.7) * 0.1);
          a.tx = sh.x + fx * 0.9 - fy * side; a.ty = sh.y + fy * 0.9 + fx * side;
          if (S.type[W.idx(a.tx, a.ty)] > T.SEA) { a.state = 'idle'; a.ride = 0; a.t = 3; return; }
          moveTo(a, dt, sp.run * 1.05); return;
        }
      } else if (a.scan <= 0 && !(a.rideCD > S.clock)) {
        const sh = S.ships.find(q => q.moving && G.dist2(q.x, q.y, a.x, a.y) < 16);
        if (sh) {
          a.state = 'ride'; a.ride = sh.id; a.t = G.rr(14, 26); a.rideCD = S.clock + 60;
          const f = G.Fac.get(sh.fac);
          if (f && !f.dolph) { f.dolph = 1; G.Village.log(`Golfinhos vieram brincar na proa de um barco de ${f.name}, saltando na onda que ele levanta. Os marinheiros juraram que era sinal de boa viagem.`, 'sea', sh.x, sh.y); }
          for (const id of sh.crew || []) { const v = S.villagers.get(id); if (v && !v.dead) G.Life && G.Life.bio(v, 'note', 'Golfinhos acompanharam o barco, saltando na proa'); }
        }
      }
    }
    if (a.leap > 0) { a.leap -= dt * 1.4; a.z = Math.sin((1 - Math.max(0, a.leap)) * Math.PI) * 14; if (a.leap <= 0) { a.z = 0; G.FX && G.FX.splash(a.x, a.y, 0.5); } }
    if (a.scan <= 0) {
      a.scan = 0.6 + G.R() * 0.4;
      const hungry = a.hunger > 0.35;
      if (sp.diet === 'carn' && hungry && a.state !== 'chase') {
        const p = findPrey(a, 9); if (p) { a.target = p.id; a.state = 'chase'; a.t = 10; }
        else if (sp.bold > 0 && a.hunger > 0.6) { const v = nearestVillager(a, 4, v => S.type[W.idx(v.x, v.y)] <= T.SEA); if (v) { a.target = v.id; a.state = 'chase'; a.t = 8; } }
      }
      if (sp.diet === 'fish' && hungry && a.state !== 'chase') { const f = nearestShoal(a, 12); if (f) { a.tx = f.x + G.rr(-0.6, 0.6); a.ty = f.y + G.rr(-0.6, 0.6); a.state = 'fish'; a.shoal = f.id; } }
    }
    if (a.state === 'chase') {
      const tg = S.animals.get(a.target) || S.villagers.get(a.target);
      if (!tg || tg.dead || tg.held || a.t <= 0) { a.state = 'idle'; a.target = 0; a.t = 1; return; }
      if (!tg.kind && S.type[W.idx(tg.x, tg.y)] > T.SEA) { a.state = 'idle'; a.target = 0; return; }
      if (tg.kind && S.type[W.idx(tg.x, tg.y)] > T.SEA) { a.state = 'idle'; a.target = 0; return; }
      if (G.dist(a.x, a.y, tg.x, tg.y) < 0.8) { bite(a, tg, dt); if (tg.dead) { a.hunger = Math.max(0, a.hunger - 0.6); tg.meat = 0; tg.sink = true; a.state = 'idle'; a.target = 0; } return; }
      a.tx = tg.x; a.ty = tg.y; moveTo(a, dt, sp.run); return;
    }
    if (a.state === 'fish') {
      if (moveTo(a, dt, sp.sp * 1.3)) {
        const f = S.fish.find(q => q.id === a.shoal);
        if (f && f.n > 0) { const take = Math.min(f.n, 2 * sp.size); f.n -= take; a.hunger = Math.max(0, a.hunger - 0.35); G.FX && G.FX.splash(a.x, a.y, 0.4); }
        a.state = 'idle'; a.t = G.rr(2, 5);
      }
      return;
    }
    // filter feeders and fish-eaters far from shoals still find small fare in the sea
    if (sp.diet === 'filter' || (sp.diet === 'fish' && a.hunger > 0.5)) a.hunger = Math.max(0, a.hunger - dt / DAY() * 1.2);
    if (a.state === 'wander') { if (moveTo(a, dt, sp.sp) || a.t <= 0) { a.state = 'idle'; a.t = G.rr(0.5, 3); } return; }
    a.moving = false;
    if (a.t > 0) return;
    const L = a.leader && S.animals.get(a.leader);
    let p = null;
    if (L && !L.dead && L !== a && G.R() < 0.7) p = pickNear({ x: L.x, y: L.y, kind: a.kind }, 2.5);
    else p = pickNear(a, a.kind === 'whale' ? 10 : 7, true);
    if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'wander'; a.t = 12; } else a.t = 1;
  }
  // seals, penguins and polar bears: at home on the ice and in the water
  function amphAI(a, dt) {
    const S = G.S; const sp = SP[a.kind];
    if (sp.diet === 'fish') {
      a.scan -= dt;
      if (a.scan <= 0 && a.hunger > 0.4 && a.state !== 'fish' && a.state !== 'flee') {
        a.scan = 1;
        const f = nearestShoal(a, 9);
        if (f) { a.tx = f.x; a.ty = f.y; a.state = 'fish'; a.shoal = f.id; }
      }
      if (a.state === 'fish') {
        if (moveTo(a, dt, sp.run)) { const f = S.fish.find(q => q.id === a.shoal); if (f && f.n > 0) { f.n -= 1; } a.hunger = Math.max(0, a.hunger - 0.5); a.state = 'idle'; a.t = G.rr(2, 6); }
        return;
      }
      if (a.hunger > 0.4 && S.type[W.idx(a.x, a.y)] <= T.SEA) a.hunger = Math.max(0, a.hunger - dt / DAY() * 1.6);
      if (a.hunger > 0.5 && S.type[W.idx(a.x, a.y)] > T.SEA && a.state !== 'flee' && a.state !== 'swimout') { const p = seaNear(a.x, a.y); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'swimout'; } }
      if (a.state === 'swimout') { if (moveTo(a, dt, sp.run)) { a.state = 'idle'; a.t = G.rr(4, 10); } return; }
    }
    landAI(a, dt);
  }

  // ---------------- the sky ----------------
  function airAI(a, dt) {
    const S = G.S; const sp = SP[a.kind];
    a.t -= dt; a.scan -= dt; a.flap = (a.flap || 0) + dt * (a.z > 2 ? 9 : 0);
    const alt = sp.wader ? 0 : a.kind === 'eagle' || a.kind === 'vulture' ? 60 : 34;
    const hungry = a.hunger > 0.35;
    if (a.scan <= 0) {
      a.scan = 0.7 + G.R() * 0.5;
      if (a.state !== 'dive' && a.state !== 'eat' && a.state !== 'circle' && a.state !== 'fishdive') {
        const th = nearestVillager(a, a.z < 8 ? sp.fear : 0);
        if (th && a.z < 8) { a.state = 'fly'; const p = fleeTarget(a, th.x, th.y, 7) || [a.x + G.rr(-6, 6), a.y + G.rr(-6, 6)]; a.tx = G.clamp(p[0], 1, N - 1); a.ty = G.clamp(p[1], 1, N - 1); a.t = 6; }
        else if (hungry) {
          if (sp.diet === 'scav') { const c = findCarcass(a, 32); if (c) { a.target = c.id; a.state = 'circle'; a.t = G.rr(3, 6); } }
          else if (sp.diet === 'carn' || sp.prey) { const p = findPrey(a, a.kind === 'heron' ? 3 : 12); if (p) { a.target = p.id; a.state = 'dive'; } }
          if (a.state !== 'dive' && a.state !== 'circle' && sp.diet === 'fish' && !sp.wader) { const f = nearestShoal(a, 14); if (f) { a.tx = f.x; a.ty = f.y; a.state = 'fishdive'; a.shoal = f.id; } }
        }
      }
    }
    if (sp.diet === 'filter' || sp.diet === 'browse' || sp.diet === 'herb' || (sp.wader && sp.diet === 'fish')) if ((a.z < 4 || a.state === 'perch') && G.R() < dt * 0.5) a.hunger = Math.max(0, a.hunger - 0.1);
    if (sp.diet === 'browse' && a.state === 'fly' && a.hunger > 0.5 && a.t > 1) { const i = W.idx(a.x, a.y); if (S.treeAt[i]) { a.t = 0; } }
    switch (a.state) {
      case 'circle': { // vultures spiral down over the dead
        const c = S.animals.get(a.target);
        if (!c || !c.dead || c.meat <= 0) { a.state = 'fly'; a.t = 0; return; }
        a.ang = (a.ang || 0) + dt * 1.4; const r = 1.6 + a.t * 0.4;
        a.tx = c.x + Math.cos(a.ang) * r; a.ty = c.y + Math.sin(a.ang) * r; a.z = Math.max(0, a.z - dt * 8);
        moveDirect(a, dt, sp.sp);
        if (a.t <= 0) { a.state = 'eat'; a.x = c.x + G.rr(-0.4, 0.4); a.y = c.y + G.rr(-0.4, 0.4); a.z = 0; a.t = 25; }
        return;
      }
      case 'eat': {
        const c = S.animals.get(a.target);
        if (!c || !c.dead || c.meat <= 0 || a.t <= 0) { a.state = 'fly'; a.t = 0; a.target = 0; return; }
        a.z = 0; if (eatMeat(a, c, dt)) { a.state = 'fly'; a.t = 0; a.target = 0; }
        return;
      }
      case 'dive': {
        const p = S.animals.get(a.target);
        if (!p || p.dead || p.held || (p.z > 6 && SP[p.kind].cls === 'air')) { a.state = 'fly'; a.t = 0; return; }
        a.tx = p.x; a.ty = p.y; a.z = Math.max(0, a.z - dt * 45);
        moveDirect(a, dt, sp.run);
        if (G.dist(a.x, a.y, p.x, p.y) < 0.5 && a.z < 3) { A.damage(p, 30, a); if (p.dead) { a.state = 'eat'; a.target = p.id; a.t = 20; } else { a.state = 'fly'; a.t = 0; } }
        return;
      }
      case 'fishdive': {
        const tz = G.dist(a.x, a.y, a.tx, a.ty) < 1 ? 0 : 20;
        a.z += (tz - a.z) * Math.min(1, dt * 3);
        if (moveDirect(a, dt, sp.sp) && a.z < 2) {
          const f = S.fish.find(q => q.id === a.shoal); if (f && f.n > 0) f.n -= 0.5; a.hunger = Math.max(0, a.hunger - 0.4);
          G.FX && G.FX.splash(a.x, a.y, 0.3); a.state = 'fly'; a.t = 0;
        }
        return;
      }
    }
    // cruising: gulls follow the coast, parrots hop between trees, waders walk the shallows
    if (sp.wader) {
      if (a.state === 'fly') { a.z += ((a.t > 0 ? 12 : 0) - a.z) * Math.min(1, dt * 2); if (moveDirect(a, dt, sp.sp) && a.t <= 0) { a.state = 'idle'; a.z = 0; a.t = G.rr(3, 10); } return; }
      if (a.state === 'wade') { if (moveTo(a, dt, 0.35) ) { a.state = 'idle'; a.t = G.rr(2, 6); } return; }
      a.moving = false;
      if (a.t > 0) return;
      const L = a.leader && S.animals.get(a.leader);
      const p = L && !L.dead && L !== a && G.R() < 0.7 ? pickNear({ x: L.x, y: L.y, kind: a.kind }, 1.5, true) : pickNear(a, 4, true);
      if (p) { const far = G.dist(a.x, a.y, p[0], p[1]) > 2.5; a.tx = p[0]; a.ty = p[1]; a.state = far ? 'fly' : 'wade'; a.t = far ? 2 : 0; } else a.t = 2;
      return;
    }
    if (a.state === 'perch') { a.moving = false; a.z = Math.max(a.perchZ || 0, a.z - dt * 30); if (a.t <= 0) { a.state = 'fly'; a.t = 0; } return; }
    if (a.state !== 'fly') a.state = 'fly';
    a.z += (alt + Math.sin((a.ph = (a.ph || G.R() * 6) + dt)) * 6 - a.z) * Math.min(1, dt * 0.8);
    if (moveDirect(a, dt, sp.sp) || a.t <= 0) {
      // perch on a tree now and then (parrots, ravens) or pick a new patrol point
      if ((a.kind === 'parrot' || a.kind === 'raven' || a.kind === 'gull' || sp.nests === 'tree' || sp.diet === 'browse') && G.R() < (a.hunger > 0.4 ? 0.7 : 0.35)) {
        const i = W.idx(a.x, a.y); const tr = S.treeAt[i] && S.trees.get(S.treeAt[i]);
        if (tr || a.kind === 'gull') { a.state = 'perch'; a.perchZ = tr ? 22 * tr.size : 0; a.t = G.rr(4, 12); return; }
      }
      const L = a.leader && S.animals.get(a.leader);
      let p = null;
      if (L && !L.dead && L !== a && G.R() < 0.8) p = [L.tx + G.rr(-1.5, 1.5), L.ty + G.rr(-1.5, 1.5)];
      else for (let k = 0; k < 10 && !p; k++) { const q = [a.x + G.rr(-10, 10), a.y + G.rr(-10, 10)]; if (W.inb(q[0], q[1]) && A.habitat(sp, W.idx(q[0], q[1]))) p = q; }
      if (!p) p = [G.clamp(a.x + G.rr(-6, 6), 2, N - 2), G.clamp(a.y + G.rr(-6, 6), 2, N - 2)];
      a.tx = G.clamp(p[0], 1, N - 1); a.ty = G.clamp(p[1], 1, N - 1); a.t = G.rr(4, 10);
    }
  }
  function moveDirect(a, dt, sp) {
    const dx = a.tx - a.x, dy = a.ty - a.y; const d = Math.hypot(dx, dy);
    if (d < 0.1) { a.moving = false; return true; }
    const step = Math.min(d, sp * dt);
    a.x += dx / d * step; a.y += dy / d * step; a.moving = true;
    if (Math.abs(dx - dy) > 0.02) G.faceTo(a, dx, dy);
    return false;
  }

  function landAnimal(a, impact) {
    const S = G.S; const i = W.idx(a.x, a.y); const sp = SP[a.kind];
    if (sp.cls === 'air') { a.z = 20; a.state = 'fly'; a.t = 0; return; }
    if (S.type[i] <= T.SEA && sp.cls !== 'water' && sp.cls !== 'amph') { G.FX && G.FX.splash(a.x, a.y, 1); A.remove(a); return; }
    if (sp.cls === 'water' && S.type[i] > T.SEA) { G.FX && G.FX.dust(a.x, a.y, 5); A.kill(a, null, 'stranded'); return; }
    G.FX && G.FX.dust(a.x, a.y, 5);
    const dmg = Math.max(0, (impact - 220) * 0.3);
    if (dmg > 0) A.damage(a, dmg, null);
    if (sp.cls !== 'water' && !W.walkable(i) && S.type[i] > T.SEA) { const n = W.nearestLand(a.x, a.y, 6); if (n) { a.x = n[0]; a.y = n[1]; } }
    a.state = 'idle'; a.t = 1;
  }

  // ------------------------------ the whole zoo ------------------------------
  let tBreed = 0, tVeg = 0, tImm = 30, tDay = 0;
  A.updateAll = function (dt) {
    const S = G.S;
    distances(); ensureVeg();
    gridT -= dt; if (gridT <= 0) { gridT = 0.25; rebuildGrid(); }
    pathBudget = Math.max(3, Math.min(7, Math.round(S.animals.size / 70)));
    const dayF = dt / DAY();
    for (const a of S.animals.values()) {
      if (a.held) continue;
      if (a.air) { G.airUpdate(a, dt, imp => landAnimal(a, imp)); continue; }
      if (a.hurt > 0) a.hurt -= dt;
      if (a.bite > 0) a.bite -= dt;
      if (a.eating > 0) a.eating -= dt;
      const sp = SP[a.kind];
      if (!sp) { dead.push(a); continue; }
      // slow bookkeeping (hunger, age, fire, carrion) twice a second, staggered per animal
      a.lt += dt;
      if (a.lt >= 0.5) {
        const lt = a.lt; a.lt = 0; if (!life(a, sp, lt, S)) continue;
        // a wild beast that wandered into a pen (or stood where a pen was built) walks back out
        if (!a.pen && !sp.dom && !sp.town && sp.cls !== 'air' && a.state !== 'chase' && a.state !== 'eat') {
          const F = W.fenceMap(); const f = F && F[W.idx(a.x, a.y)];
          if (f) { const b = S.buildings.get(f); if (b) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; const a0 = Math.atan2(a.y - cy, a.x - cx); for (let k = 0; k < 8; k++) { const an = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.785; const tx = cx + Math.cos(an) * (b.w * 0.75 + 0.6), ty = cy + Math.sin(an) * (b.h * 0.75 + 0.6); if (walkOK(a, tx, ty) && walkOK(a, (a.x + tx) / 2, (a.y + ty) / 2)) { a.tx = tx; a.ty = ty; a.state = 'wander'; a.t = 3; break; } } } }
        }
      }
      if (a.dead) continue;
      // resting animals with nothing to decide just let the clock run
      if (a.state === 'idle' && a.t > dt && a.scan > dt && !(a.angry > 0) && sp.cls !== 'air' && !sp.dom) { a.t -= dt; a.scan -= dt; if (a.rest > 0) a.rest -= dt; a.moving = false; continue; }
      if (a.kind === 'wolf' && (a.raid || a.summoned)) raidWolfAI(a, dt);
      else if (sp.town) { if (G.Pets && !(G.Skip && G.Skip.on)) G.Pets.ai(a, dt, sp); }
      else if (sp.dom) domAI(a, dt);
      else if (sp.cls === 'water') waterAI(a, dt);
      else if (sp.cls === 'air') airAI(a, dt);
      else if (sp.cls === 'amph') amphAI(a, dt);
      else landAI(a, dt);
    }
    for (const a of dead) S.animals.delete(a.id);
    dead.length = 0;
    tVeg += dt; if (tVeg >= 0.5) { growVeg(tVeg); tVeg = 0; }
    tBreed += dt; if (tBreed > 6) { breed(tBreed); tBreed = 0; }
    tImm -= dt; if (tImm <= 0) { tImm = DAY() * 0.5; immigrate(); }
    tDay += dt; if (tDay > DAY()) { tDay = 0; census(); }
  };
  // hunger, growth, old age, fire and carrion — returns false when the animal is gone
  function life(a, sp, dt, S) {
    const dayF = dt / DAY();
    if (a.howl > 0) a.howl -= dt;
    if (a.dead) {
      a.rot += dt;
      // carrion feeds the soil when it is gone
      if (a.rot > DAY() * (a.sink ? 0.1 : 1.1) || (a.meat <= 0 && a.rot > DAY() * 0.25)) {
        const i = W.idx(a.x, a.y); if (S.type[i] >= T.SAND) { S.fert[i] = Math.min(1, S.fert[i] + 0.03 * sp.size); S.veg[i] = Math.min(A.vegCap(i) * 1.2, S.veg[i] + 0.3); }
        dead.push(a);
      }
      return false;
    }
    a.age += dayF; if (a.grown < 1) a.grown = Math.min(1, a.grown + dayF / Math.max(0.5, sp.life * 0.12));
    if (a.blood > 0) a.blood = Math.max(0, a.blood - dt / 70);
    if (a.grip > 0) a.grip -= dt;
    // off the branch: whoever is not climbing, perching or eating up there stands on the ground
    if (a.z > 0 && sp.cls !== 'air' && sp.cls !== 'water' && !UP[a.state]) { a.z = 0; a.perch = 0; }
    a.hunger += dayF * (sp.diet === 'carn' ? (sp.apex ? 0.42 : 0.55) : sp.diet === 'scav' ? 0.5 : sp.diet === 'filter' || sp.diet === 'insect' ? 0.35 : 0.8) * (a.summoned || a.raid ? 0 : a.legend ? 0.6 : a.dom ? 0.55 : 1);
    if (a.tamed) a.hunger = Math.max(0, a.hunger - dayF * 1.6); // its people feed it
    if (a.dom && a.grown >= 1) {
      const fed = a.hunger < 0.5 ? 1 : 0.3;
      if (a.kind === 'ovelha') { if (a.shorn > 0) a.shorn -= dt; else a.wool = Math.min(2, a.wool + dayF * 1.8 * fed); }
      else if (a.kind === 'vaca' || a.kind === 'cabra') a.milk = Math.min(1.5, a.milk + dayF * 2.2 * fed);
      else if (a.kind === 'peru') a.eggs = Math.min(1.5, a.eggs + dayF * 2.6 * fed);
      // a lost animal without a pen joins the nearest pen of its people
      if (!a.pen || !G.S.buildings.has(a.pen)) { const p = [...G.S.buildings.values()].find(b => (b.type === (a.kind === 'cavalo' ? 'estabulo' : 'curral')) && b.built && G.Village.facOfSet(b.set) === a.dom && (!b.kind || b.kind === a.kind)); a.pen = p ? p.id : 0; if (p) { a.state = 'pen'; a.hx = p.x + 1.5; a.hy = p.y + 1.5; } }
    }
    if (a.hunger >= 1) { a.hunger = 1; a.hp -= dt * sp.hp / (DAY() * 1.1); if (a.hp <= 0) { A.kill(a, null, 'hunger'); return false; } }
    else if (a.hp < a.maxHp && a.hunger < 0.5) a.hp = Math.min(a.maxHp, a.hp + dt * 0.5);
    const i = W.idx(a.x, a.y); const t = S.type[i];
    // the productive coasts feed fishers between shoals; scavengers pick at insects and seeds
    if (sp.diet === 'fish' || sp.diet === 'scav') { const w = t <= T.RIVER || (sp.cls === 'air' && dSea[i] <= 2); if (w || sp.diet === 'scav') a.hunger = Math.max(0, a.hunger - dayF * (sp.diet === 'scav' ? 0.35 : 0.7)); }
    else if (sp.diet === 'carn' && (sp.cls === 'water' || a.kind === 'croc' || a.kind === 'polarbear') && a.hunger > 0.5 && t <= T.RIVER) a.hunger = Math.max(0, a.hunger - dayF * 0.55);
    if (a.age > sp.life * a.lifeMul) { A.kill(a, null, 'old'); return false; }
    if (S.fire[i] > 0.1 && a.z < 6) { a.hp -= S.fire[i] * 40 * dt; if (a.hp <= 0) { A.kill(a, null, 'fire'); return false; } }
    if (sp.cls === 'land' && (t <= T.SEA || (S.deep[i] && !sp.swims)) && a.state !== 'leave') { const n = W.nearestLand(a.x, a.y, 8); if (n) { a.x = n[0]; a.y = n[1]; } else { dead.push(a); return false; } }
    if (sp.cls === 'water' && t > T.SEA) { const n = seaNear(a.x, a.y); if (n) { a.x = n[0]; a.y = n[1]; } else { A.kill(a, null, 'stranded'); return false; } }
    return true;
  }
  const dead = [];
  function seaNear(x, y) { for (let r = 1; r <= 5; r++) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (W.inb(px, py) && G.S.type[W.idx(px, py)] <= T.SEA) return [px, py]; } return null; }

  // births: well-fed adults, while there is room in the habitat
  function breed(dt) {
    const S = G.S; const count = A.counts();
    for (const a of [...S.animals.values()]) {
      if (a.dead || a.summoned || a.raid || a.grown < 1 || a.held || a.air || a.tamed || a.legend) continue;
      const sp = SP[a.kind]; if (!sp) continue;
      if (a.hunger > (A.predator(a.kind) ? 0.65 : 0.45)) continue;
      const cap = A.capacity(a.kind); const n = count[a.kind] || 0;
      if (n >= cap || n < 2) continue;
      const mul = G.Nature.zoneMul(a.x, a.y, 'fertility');
      const p = dt / DAY() * sp.breed * (1 - Math.pow(n / cap, 3)) * mul;
      if (G.R() >= p) continue;
      const q = pickNear(a, 1.2, true) || [a.x, a.y];
      const kid = A.spawn(a.kind, q[0], q[1], { leader: a.leader || a.id, age: 0, grown: 0.35, hunger: 0.2, z: sp.cls === 'air' ? a.z : 0, hx: a.hx, hy: a.hy, morph: a.morph && G.R() < 0.3 ? a.morph : rollMorph(sp) });
      kid.hp = kid.maxHp * 0.6; a.hunger += 0.2; count[a.kind] = n + 1;
      const eco = S.eco || (S.eco = { deaths: {}, born: {} }); eco.born[a.kind] = (eco.born[a.kind] || 0) + 1;
    }
  }
  A.counts = function () { const c = {}; for (const a of G.S.animals.values()) if (!a.dead && !a.summoned && !a.raid && !a.dom) c[a.kind] = (c[a.kind] || 0) + 1; return c; };
  // species that vanished from a habitat that still exists come back, slowly, from beyond the map
  function immigrate() {
    const S = G.S; const count = A.counts();
    const ks = A.ids.filter(k => A.capacity(k) >= 2 && (count[k] || 0) < Math.max(2, A.capacity(k) * 0.3));
    if (!ks.length) return;
    const k = G.pick(ks); const sp = SP[k];
    const spot = A.wildSpot(12, sp); if (!spot) return;
    const n = G.ri(sp.herd[0], sp.herd[1]);
    const L = A.spawn(k, spot[0], spot[1], { grown: 1 });
    for (let j = 1; j < n; j++) { const q = pickNear(L, 1.5, true); if (q) A.spawn(k, q[0], q[1], { leader: L.id, grown: 1 }); }
    if (sp.apex || sp.dens < 0.4) { const to = G.Biome && G.S.biome ? G.Biome.toAt(spot[0], spot[1]) : 'à ilha'; G.Village.log(`${n > 1 ? G.cap(plural(sp, n)) + ' chegaram' : G.cap(sp.nameA) + ' chegou'} ${to}, vind${n > 1 ? (sp.g === 'f' ? 'as' : 'os') : (sp.g === 'f' ? 'a' : 'o')} ${sp.cls === 'water' ? 'de mares distantes' : 'de terras distantes'}.`, 'deer', spot[0], spot[1]); }
  }
  const PL = { Leão: 'leões', Urso: 'ursos', 'Urso-polar': 'ursos-polares', Onça: 'onças', Tubarão: 'tubarões', Crocodilo: 'crocodilos', Águia: 'águias', Orca: 'orcas', Elefante: 'elefantes', Girafa: 'girafas', Lobo: 'lobos', Hiena: 'hienas', Hipopótamo: 'hipopótamos', 'Boi-almiscarado': 'bois-almiscarados', Anta: 'antas', Baleia: 'baleias', Abutre: 'abutres', Raposa: 'raposas', 'Raposa-do-ártico': 'raposas-do-ártico', Feneco: 'fenecos', Camelo: 'camelos', Jiboia: 'jiboias', Víbora: 'víboras', Garça: 'garças', Flamingo: 'flamingos', Pinguim: 'pinguins', 'Tartaruga-marinha': 'tartarugas-marinhas', Foca: 'focas', Golfinho: 'golfinhos', Tigre: 'tigres', Leopardo: 'leopardos', 'Leopardo-das-neves': 'leopardos-das-neves', Rinoceronte: 'rinocerontes', Búfalo: 'búfalos', Bisão: 'bisões', Gnu: 'gnus', Alce: 'alces', 'Cabra-montesa': 'cabras-montesas', Castor: 'castores', Lontra: 'lontras', 'Bicho-preguiça': 'bichos-preguiça', Avestruz: 'avestruzes', Morsa: 'morsas', Sucuri: 'sucuris', Cegonha: 'cegonhas', 'Ganso-selvagem': 'gansos-selvagens', Tucano: 'tucanos', Coruja: 'corujas' };
  function plural(sp, n) { return n + ' ' + (PL[sp.name] || (sp.name.toLowerCase() + 's')); }
  A.plural = plural;
  function census() {
    const S = G.S; const c = A.counts();
    const eco = S.eco || (S.eco = { deaths: {}, born: {} });
    eco.hist = eco.hist || [];
    eco.hist.push({ d: S.day, c });
    if (eco.hist.length > 60) eco.hist.shift();
    // a species wiped out entirely is worth a line in the chronicle
    eco.gone = eco.gone || {};
    for (const k of A.ids) {
      const had = eco.hist.length > 1 && (eco.hist[eco.hist.length - 2].c[k] || 0) > 0;
      if (had && !c[k] && !eco.gone[k]) { eco.gone[k] = S.day; G.Village.log(`Não resta ${SP[k].nameA.replace(/^um[a]? /, SP[k].g === 'f' ? 'uma só ' : 'um só ')} no mundo. ${G.cap(plural(SP[k], 2).replace(/^2 /, ''))} desapareceram.`, 'skull'); G.Lore && G.Lore.note('extinctSpecies', { kind: k }); }
      if (c[k]) eco.gone[k] = 0;
    }
  }

  // a spot of the right habitat far from people
  A.wildSpot = function (minD, sp) {
    const S = G.S; distances();
    for (let k = 0; k < 120; k++) {
      const x = G.rr(3, N - 3), y = G.rr(3, N - 3); const i = W.idx(x, y);
      if (sp) { if (!A.habitat(sp, i)) continue; if (sp.cls !== 'water' && sp.cls !== 'air' && S.type[i] <= T.SEA) continue; }
      else if (S.type[i] < T.SAND || S.type[i] === T.RIVER || W.blocked(i)) continue;
      if (W.blocked(i)) continue;
      let ok = true;
      for (const s of S.settlements.values()) if (G.dist(x, y, s.cx, s.cy) < minD) { ok = false; break; }
      if (ok) return [x, y];
    }
    return null;
  };
  A.spawnPack = function (x, y, n, summoned) {
    let leader = null;
    for (let k = 0; k < n; k++) {
      const a = G.rr(0, 6.28), r = G.rr(0, 1.2);
      let px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (!W.inb(px, py) || G.S.type[W.idx(px, py)] <= T.SEA) { px = x; py = y; }
      const w = A.spawn('wolf', px, py, { summoned: !!summoned, raid: !summoned, leader: leader ? leader.id : 0, leaveT: G.DAY_LEN * G.rr(1.2, 1.8), grown: 1, hunger: 0.5 });
      if (!leader) leader = w;
    }
    return leader;
  };
  A.spawnGroup = function (k, x, y, n) {
    const sp = SP[k]; if (!sp) return null;
    const L = A.spawn(k, x, y, { grown: 1 });
    for (let j = 1; j < (n || G.ri(sp.herd[0], sp.herd[1])); j++) { const q = pickNear(L, 1.5, false); if (q) A.spawn(k, q[0], q[1], { leader: L.id, grown: 1 }); }
    return L;
  };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({ save(out) { if (G.S.eco) out.eco = G.S.eco; }, load(o) { G.S.eco = o.eco || null; G.S.veg = null; habCount = null; scaleKey = null; habVer = -1; } });
  // the first animals of a new world, spread through their habitats
  A.populate = function () {
    const S = G.S; distances(); habCount = null; scaleKey = null; ensureVeg();
    for (const k of A.ids) {
      const sp = SP[k]; const cap = A.capacity(k); if (!cap) continue;
      let want = Math.round(cap * (sp.apex ? 0.7 : 0.75));
      let guard = 0;
      while (want > 0 && guard++ < 60) {
        const spot = A.wildSpot(sp.cls === 'water' || sp.cls === 'air' ? 4 : 9, sp); if (!spot) break;
        const n = Math.min(want, G.ri(sp.herd[0], sp.herd[1]));
        const L = A.spawn(k, spot[0], spot[1]);
        for (let j = 1; j < n; j++) { const q = pickNear(L, 1.5, true); if (q) A.spawn(k, q[0], q[1], { leader: L.id }); }
        want -= n;
      }
    }
  };
})(window.G);
