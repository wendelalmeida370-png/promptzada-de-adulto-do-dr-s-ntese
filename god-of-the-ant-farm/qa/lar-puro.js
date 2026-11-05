// lar-puro: as regras puras da vida em casa (P1), só com o código do jogo — sem mundo, sem a vaga da catraca, em um segundo:
// o relógio de cada um (G.Lar.clock, a hora de deitar por idade e ofício), o sono pelas horas, o repartidor das camas e dos
// lugares (G.Lar.beds/want), o gancho do save depois do dos interiores, o endTask com stay, e as portas do bebê (D-074:
// G.Vg.babyReach, canHold, handBaby — o alcance na rua, dentro do mesmo prédio, na mesma caverna). node qa/lar-puro.js
const M = require('./nodemundo.js');
const G = M.load({ qa: false });
const fails = []; const ok = (n, c, i) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | lar-puro ${n} | ${i || ''}`); if (!c) fails.push(n); };
ok('G.Lar carregado', !!G.Lar && typeof G.Lar.clock === 'function', Object.keys(G.Lar || {}).join(','));
// o relógio: por idade e ofício
const P = (id, age, o) => Object.assign({ id, age, traits: [], role: null, g: 'f' }, o || {});
const ages = [3, 8, 14, 30, 70];
for (const a of ages) {
  let bmin = 9, bmax = -9, wmin = 9, wmax = -9;
  for (let id = 1; id < 400; id++) { const c = G.Lar.clock(P(id, a)); const b = c.bed, w = c.wake > 0.5 ? c.wake - 1 : c.wake; bmin = Math.min(bmin, b); bmax = Math.max(bmax, b); wmin = Math.min(wmin, w); wmax = Math.max(wmax, w); }
  console.log(`  idade ${a}: deita ${bmin.toFixed(3)}–${bmax.toFixed(3)}, levanta ${wmin.toFixed(3)}–${wmax.toFixed(3)}`);
}
const tav = G.Lar.clock(P(77, 35, { role: 'taverneiro' }));
ok('taverneiro deita depois da taverna fechar (0,88)', tav.bed >= 0.89, JSON.stringify(tav));
// a mesma pessoa, a mesma hora
ok('relógio é puro', JSON.stringify(G.Lar.clock(P(5, 30))) === JSON.stringify(G.Lar.clock(P(5, 30))));
// sleepy pelas horas (um G.S de mentira só com o relógio)
G.S = { time: 0, clock: 0, villagers: new Map(), buildings: new Map() };
const v = P(9, 30); const c = G.Lar.clock(v);
G.S.time = c.bed - 0.01; const a1 = G.Lar.sleepy(v); G.S.time = c.bed + 0.001; const a2 = G.Lar.sleepy(v); G.S.time = 0.5; const a3 = G.Lar.sleepy(v);
ok('sleepy: antes da hora não, depois sim, ao meio-dia não', !a1 && a2 && !a3, `${a1} ${a2} ${a3}`);
// as regras do repartidor: puras
const b = { id: 500, type: 'house' };
const kid = P(11, 1, { carrier: 12, mother: 12, home: 500 }); const mom = P(12, 25, { partner: 13, inside: 500, home: 500 }); const dad = P(13, 27, { partner: 12, g: 'm', home: 500 });
const guest = P(14, 40, { home: 999, inside: 500, sleeping: true, partner: 15 }); const gmate = P(15, 41, { home: 999, inside: 500, sleeping: true, partner: 14 });
for (const o of [kid, mom, dad, guest, gmate]) G.S.villagers.set(o.id, o);
const r = G.Lar.beds(b, [kid, mom, dad]);
ok('beds: o casal junto, o bebê por último, no berço ou com a mãe', r.pair.get(12) === 13 && r.with.get(11) === 12 && r.crib.has(11) && r.order.join() === '13,12,11' && !r.floor.size, JSON.stringify({ order: r.order, pair: [...r.pair], with: [...r.with], crib: [...r.crib], floor: [...r.floor] }));
const r2 = G.Lar.beds(b, [kid, mom, dad, guest, gmate]);
ok('beds: o hóspede (e o casal hóspede) no chão, sem par nas camas da casa', r2.floor.has(14) && r2.floor.has(15) && !r2.pair.has(14) && r2.pair.get(12) === 13 && r2.order.indexOf(11) === r2.order.length - 1, JSON.stringify({ order: r2.order, pair: [...r2.pair], floor: [...r2.floor] }));
ok('want: o bebê acordado no colo de quem o leva', JSON.stringify(G.Lar.want(kid, b)) === JSON.stringify({ with: 12 }));
mom.sleeping = true; ok('want: quem dorme, deitado', G.Lar.want(mom, b).use[0] === 'deitar' && G.Lar.want(mom, b).st === 'sleep');
mom.sleeping = false; mom.task = { type: 'lar', what: 'cozinhar', home: 500, st: 2 }; const wc = G.Lar.want(mom, b); ok('want: quem cozinha, no fogo', wc.st === 'cook');
dad.task = { type: 'lar', what: 'ceia', home: 500, st: 2 }; const we = G.Lar.want(dad, b); ok('want: a cozinheira escolhe antes de quem ceia (pri)', wc.pri > we.pri && we.pri > 0, `cozinhar ${wc.pri}, ceia ${we.pri}`);
// o gancho do save registrado depois do dos interiores
const hk = G.saveHooks.map(h => h.save.toString().includes('out.lar') ? 'lar' : h.load.toString().includes('In.migrate') ? 'interiores' : '');
ok('gancho do save depois do dos interiores', hk.indexOf('lar') > hk.indexOf('interiores') && hk.indexOf('interiores') >= 0, `lar ${hk.indexOf('lar')}, interiores ${hk.indexOf('interiores')}`);
// endTask com stay: fica dentro
G.S.buildings.set(500, { id: 500, type: 'house', x: 10, y: 10, w: 1, h: 1, built: true });
const w = P(20, 30, { inside: 500, x: 10.5, y: 11.4, task: { type: 'lar', what: 'descansar', home: 500 }, path: null, act: '' });
G.Vg.endTask(w, { stay: 500 }); ok('endTask com stay: continua dentro', w.inside === 500 && w.x === 10.5, `inside ${w.inside}`);
// ---- the baby's doors (D-074)
{ // (a block of its own: the people made by hand here are not those above)
  const Vg = G.Vg;
  ok('portas do bebê', !!(Vg.babyReach && Vg.canHold && Vg.handBaby));
  G.S = { time: 0.5, clock: 0, villagers: new Map(), buildings: new Map(), avatar: null };
  const Q = (id, o) => Object.assign({ id, age: 30, set: 1, x: 10, y: 10, inside: 0, ug: 0, traits: [], role: null, g: 'f', task: null, fury: 0 }, o || {});
  const add = o => { G.S.villagers.set(o.id, o); return o; };
  const baby = add(Q(1, { age: 0.5, x: 10, y: 10, mother: 2, father: 3, home: 50, carrier: 2 }));
  const mom = add(Q(2, { home: 50 })), dad = add(Q(3, { home: 50, g: 'm', x: 20, y: 20 }));
  const near = add(Q(4, { x: 12, y: 10, home: 60 })), far = add(Q(5, { x: 14.5, y: 10, home: 60 })), inn = add(Q(6, { x: 10.5, y: 10, inside: 99, home: 60 }));
  ok('ao alcance na rua (2 casas)', Vg.babyReach(baby, near));
  ok('fora do alcance (4,5 casas)', !Vg.babyReach(baby, far));
  ok('quem está dentro de um prédio não alcança o bebê na rua', !Vg.babyReach(baby, inn));
  baby.inside = 99; ok('dentro do mesmo prédio alcança', Vg.babyReach(baby, inn)); ok('na rua não alcança o bebê dentro', !Vg.babyReach(baby, near)); baby.inside = 0;
  const cave = add(Q(7, { x: 11, y: 10, ug: 5, inside: -1 })); const cave2 = add(Q(8, { x: 11, y: 10, ug: 6, inside: -1 }));
  baby.ug = 5; baby.inside = -1;
  ok('na mesma caverna, perto, alcança', Vg.babyReach(baby, cave)); ok('noutra caverna não', !Vg.babyReach(baby, cave2)); ok('na rua não alcança o bebê na caverna', !Vg.babyReach(baby, near));
  baby.ug = 0; baby.inside = 0;
  ok('pode segurar: adulto comum', Vg.canHold(near));
  ok('não pode: em fúria', !Vg.canHold(Object.assign(Q(9), { fury: 3 })));
  ok('não pode: caçando', !Vg.canHold(Q(10, { task: { type: 'hunt' } })));
  ok('não pode: guerreiro', !Vg.canHold(Q(11, { role: 'guerreiro' })));
  ok('não pode: criança de 12', !Vg.canHold(Q(12, { age: 12 })));
  ok('passar a quem está perto', Vg.handBaby(baby, near) && baby.carrier === near.id);
  ok('não passar a quem está longe', !Vg.handBaby(baby, far) && baby.carrier === near.id);
  ok('não passar a quem não pode segurar', !Vg.handBaby(baby, Object.assign(add(Q(13, { x: 10.5, y: 10 })), { fury: 2 })) && baby.carrier === near.id);
  ok('não passar a gente de outra vila', !Vg.handBaby(baby, add(Q(14, { x: 10.5, y: 10, set: 2 }))) && baby.carrier === near.id);
}
// ---- the house too full (D-098): who needs to leave it (G.Casa.need), and whom the town's day asks first (G.Casa.queue)
{
  const K = G.Casa;
  ok('G.Casa.need e queue', !!(K && K.need && K.queue));
  G.S = { time: 0.5, clock: 0, day: 3, villagers: new Map(), buildings: new Map(), settlements: new Map(), avatar: null };
  const Q = (id, o) => Object.assign({ id, age: 30, set: 1, x: 10, y: 10, inside: 0, ug: 0, traits: [], role: null, g: 'f', task: null, kids: [], partner: 0, hp: 100, sick: 0 }, o || {});
  const add = o => { G.S.villagers.set(o.id, o); return o; };
  const house = (id, type, res, dono) => { const b = { id, type, set: 1, x: 10, y: 10, w: 1, h: 1, built: true, res, dono }; G.S.buildings.set(id, b); return b; };
  // (a house of 6 beds with 8 in it: the owner's family — the couple, a child of 4 and one of 9 — fits; a grandmother of 70
  // who minds the little one; a wounded old man of 66, alone; two young singles of 22 and 27)
  house(100, 'house', 8, 1);
  const own = add(Q(1, { age: 40, partner: 2, home: 100, kids: [3, 4], g: 'm' })), wife = add(Q(2, { age: 38, partner: 1, home: 100, kids: [3, 4] }));
  add(Q(3, { age: 4, mother: 2, father: 1, home: 100 })); add(Q(4, { age: 9, mother: 2, father: 1, home: 100 }));
  const gran = add(Q(5, { age: 70, home: 100 })), old = add(Q(6, { age: 66, home: 100, g: 'm', hp: 40 }));
  const y1 = add(Q(7, { age: 22, home: 100 })), y2 = add(Q(8, { age: 27, home: 100, g: 'm' }));
  const nd = [own, wife, gran, old, y1, y2].map(v => K.need(v));
  ok('casa cheia: o dono e a companheira ficam (a família deles cabe)', nd[0] === null && nd[1] === null, nd.join(','));
  ok('casa cheia: a avó que cuida do pequeno fica', nd[2] === null && !!G.Lar.minder(gran), String(nd[2]));
  ok('casa cheia: o velho sozinho e os moços precisam sair', nd[3] === 'lotada' && nd[4] === 'lotada' && nd[5] === 'lotada', nd.slice(3).join(','));
  const q1 = K.queue({ id: 1 });
  ok('o dia da cidade pergunta só à mais moça da casa (a de 22), não ao velho', q1.length === 1 && q1[0][0] === y1, q1.map(e => e[0].id + ':' + e[1]).join(' '));
  // (the owner's own family does not fit — a hut of 4 beds, the couple and three children —: it is the one that leaves)
  G.S.villagers.clear(); G.S.buildings.clear(); house(200, 'hut', 5, 11);
  const o2 = add(Q(11, { age: 35, partner: 12, home: 200, kids: [13, 14, 15], g: 'm' })); add(Q(12, { age: 33, partner: 11, home: 200, kids: [13, 14, 15] }));
  for (const id of [13, 14, 15]) add(Q(id, { age: 6 + id - 13, mother: 12, father: 11, home: 200 }));
  ok('a família do dono que não cabe na casa é a que sai', K.need(o2) === 'lotada' && K.queue({ id: 1 }).length === 1 && K.queue({ id: 1 })[0][0] === o2, String(K.need(o2)));
  // (two couples of others in a full house — one in their sixties, one in their twenties —: the young couple is asked)
  G.S.villagers.clear(); G.S.buildings.clear(); house(300, 'house', 6, 21);
  add(Q(21, { age: 45, home: 300, g: 'm' })); add(Q(22, { age: 19, home: 300, mother: 0 }));
  const oa = add(Q(23, { age: 64, partner: 24, home: 300, g: 'm' })); add(Q(24, { age: 61, partner: 23, home: 300 }));
  const ya = add(Q(25, { age: 24, partner: 26, home: 300, g: 'm' })); add(Q(26, { age: 23, partner: 25, home: 300 }));
  const q3 = K.queue({ id: 1 });
  ok('o casal velho e o casal moço numa casa de outros, cheia: pergunta-se ao moço', K.need(oa) === 'casal' && K.need(ya) === 'casal' && q3.length === 1 && q3[0][0] === ya, q3.map(e => e[0].id + ':' + e[1]).join(' '));
}
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
