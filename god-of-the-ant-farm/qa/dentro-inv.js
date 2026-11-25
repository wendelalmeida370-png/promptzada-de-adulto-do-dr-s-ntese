// dentro-inv: as regras do verificador para a decoração com causa (os interiores 2.0, a frente P5 — D-740 a D-749, js/dentro3d.js e
// G.Atmos.within): o que um prédio mostra por dentro é o que o mundo tem, e está onde pode estar.
//   · nada sem causa (S3): cada coisa tem o seu porquê, e o porquê é verdade agora — a jarra só com bebida no livro, o pão só com o
//     grão de um pão na comida, o presunto só com carne, a réstia só com a horta, o saco só com grão, a caneca na mesa só de quem bebeu,
//     a panela só com o fogo cozinhando, a lamparina só com o que queimar, acesa só com alguém acordado no escuro, o pano só onde o
//     povo tece e só de uma casa que o pagou (L-2251), a teia só na casa velha e sem cuidado, os riscos de carvão só dos anos de doses
//     servidas;
//   · nada vem do nada (S2): nenhum barro onde o povo nunca teve a cerâmica, nenhum metal que ele não tem;
//   · nada flutuando (S3): o que pousa, pousa num tampo ou numa prateleira da peça (as âncoras do modelo), no chão do andar; o que
//     pende, pende de uma parede ou do soalho de cima; o que fica na parede, encostado nela;
//   · nada no caminho nem dentro de um móvel (S3): o que fica no chão fora do corredor, das portas, das escadas e de onde se usa uma
//     peça (o keepClear da planta) e fora de toda peça; o que pende do teto acima das cabeças e das peças;
//   · nada fora do lote (S2);
//   · o que se serve é o que o mundo conta (S3; D-748): o prato da mesa é o que a pessoa come, comido no tanto que o mundo diz (o
//     estágio), com vapor só enquanto quente — servido há menos de At.COOL do fogo que cozinha, e um prato que vem quente —; a caneca
//     vazia só da rodada acabada; o chifre só onde o povo teve o couro do abate (S2);
//   · as marcas da noite (S3; D-749): os ossinhos só com um jogo à mesa, os anéis de cerveja só dos anos de doses, os cacos só de uma
//     caneca de barro quebrada (S2 onde o povo não tem barro), a poça só do que se derramou, a vela no tanto que a noite deixou, a pilha
//     de lenha no tanto que há junto do fogo; a lousa da porta com o porte da casa, colada na parede da frente, por fora.
// O que o prédio tem é perguntado ao mundo (G.Atmos.within, e de novo aqui o livro, a comida, a gente); onde cada coisa está, ao
// G.Dentro3D.plan; onde ela pode estar, à planta (as paredes, os andares, a grade, o keepClear) — nunca às contas do dentro3d.js. As
// regras são QA.dentro(lista); o verificador olha os interiores abertos pelo 3D e, sem 3D, as tavernas e meia dúzia de casas com a
// planta já feita. Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  const FLOOR_UP = 0.012;
  const CLAY = { jarra: 1, 'jarra-alta': 1, anforeta: 1, pote: 1, caneca: 1, taca: 1, copo: 1, lamparinaBarro: 1 };
  const has = (W, list, k) => W[list].some(q => q.k === k);
  const cereal = W => W.comida.some(q => ['trigo', 'cevada', 'sorgo', 'arroz', 'milho'].includes(q.k));
  // (a thing's model: the dishes and the drinks by their own names, the rest 'deco-<coisa>' — as js/dentro3d.js)
  const NM = k => (/^(comida|bebida)-/.test(k) ? k : 'deco-' + k);
  // (what is on the tables of a tavern, the world's: who eats which dish — the plate of the day where the world no longer says —,
  // whose round of which drink is done; and what the guests left once up)
  const dishK = part => 'comida-' + (part && part !== '?' ? part : 'provisao');
  const eats = (W, k) => W.mesa.concat(W.sujo || []).some(q => q.prato && dishK(q.prato) === k);
  const drank = (W, d) => W.mesa.concat(W.sujo || []).some(q => q.cup === d);
  const DISHES = ['peixe', 'marisco', 'carne', 'arroz', 'trigo', 'cevada', 'milho', 'sorgo', 'horta', 'ovos', 'leite', 'fruta', 'mel', 'azeite', 'provisao'];
  const DRINKS = { 'bebida-cerveja': 'cerveja', 'bebida-cerveja-copo': 'cerveja', 'bebida-vinho': 'vinho', 'bebida-vinho-copo': 'vinho', 'bebida-pulque': 'pulque', 'bebida-mel': 'mel', 'bebida-mel-caneca': 'mel' };
  const HOTD = { 'comida-leite': 0, 'comida-fruta': 0, 'comida-mel': 0, 'comida-azeite': 0 };
  // (the feast of the day, the world's: a decoration of a kind, of a model; its platter)
  // (whose purse paid for what a building shows of its wealth: a household — the house, the seat —, or a building whose use says it — the
  // tavern's keeper: G.Atmos.rulesOf, the use's own rules)
  const dono = b => !!b && (G.Village.bedsOf(b) > 0 || (G.Atmos.rulesOf ? G.Atmos.rulesOf(b).some(r => r.dono) : b.type === 'taverna'));
  const festa = (W, k) => !!W.festa && W.festa.enfeites.some(e => e.k === k);
  // (a lamp of the oil there is, and the one its people makes: the lucerna of Rome and Greece, the saucer of the Nile, the soapstone of the
  // north, the lamp on its foot of the dawn of the cities — never the lake's, which lit no lamp of oil: G.Atmos.LUZ, D-1012)
  const lamp = (W, k) => (!!W.luz && !!W.luz.oleo && W.luz.k === k) || `${k} sem óleo, ou que não é a lamparina do povo (${W.luz && W.luz.k ? W.luz.k : 'nenhuma: o povo não acende lamparina de óleo'})`;
  const festaM = (W, m) => !!W.festa && W.festa.enfeites.some(e => e.modelo === m);
  const pratoF = (W, m) => !!W.festa && !!W.festa.prato && 'comida-festa-' + W.festa.prato.civ === m;
  // the cause of each thing, read again from what the building has now (G.Atmos.within): true, or what is missing
  const CAUSA = {
    jarra: W => W.bebida.length || W.bens.some(q => q.como === 'potes') || 'jarra sem bebida no livro',
    'jarra-alta': W => W.bebida.some(q => q.k === 'cerveja') || 'jarra alta sem cerveja',
    anforeta: W => W.bebida.some(q => q.k === 'vinho') || W.bens.some(q => q.como === 'anforeta') || 'ânfora sem vinho nem azeite',
    pote: W => W.bebida.some(q => q.k === 'mel') || W.bens.some(q => q.como === 'pote' || q.como === 'potes') || 'pote sem hidromel, mel nem a louça da casa',
    cabaca: W => W.bebida.some(q => q.k === 'pulque') || 'cabaça sem pulque',
    'jarro-madeira': W => W.bebida.length || W.bens.some(q => ['anforeta', 'pote', 'potes'].includes(q.como)) || 'jarro sem bebida nem guardados',
    caneca: W => !!W.louca || 'caneca sem louça (nem fregueses nem moradores)', taca: W => !!W.louca || 'taça sem louça', copo: W => !!W.louca || 'copo sem louça', 'caneca-madeira': W => !!W.louca || 'caneca sem louça',
    tigela: W => W.mesa.some(q => q.prato) || W.comida.length > 0 || 'tigela sem comida', prato: W => W.mesa.some(q => q.prato) || W.comida.length > 0 || 'prato sem comida',
    'prato-peixe': W => W.mesa.some(q => q.prato === 'peixe') || has(W, 'comida', 'peixe') || 'prato de peixe sem peixe',
    pao: W => W.comida.some(q => q.pao) || 'pão sem o grão de um pão na comida', tortilhas: W => has(W, 'comida', 'milho') || W.mesa.some(q => q.prato === 'milho') || 'tortilhas sem milho',
    queijo: W => W.bens.some(q => q.k === 'queijo') || 'queijo sem queijo na casa',
    presunto: W => has(W, 'comida', 'carne') || W.bens.some(q => q.k === 'carne_seca') || 'presunto sem carne',
    'peixe-seco': W => has(W, 'comida', 'peixe') || W.bens.some(q => q.k === 'bacalhau' || q.k === 'atum') || 'peixe seco sem peixe',
    alho: W => has(W, 'comida', 'horta') || 'réstia de alho sem a horta', ervas: W => has(W, 'comida', 'horta') || 'ervas sem a horta', milho: W => has(W, 'comida', 'milho') || 'milho pendurado sem milho',
    saco: W => cereal(W) || 'saco sem grão', cesto: W => W.comida.some(q => ['fruta', 'ovos', 'marisco'].includes(q.k)) || 'cesto sem fruta, ovos nem mariscos',
    lenha: W => !!W.lenha || 'lenha sem madeira no armazém do povo',
    panela: W => !!W.cozinha || 'panela sem fogo cozinhando', caldeirao: W => (!!W.cozinha && !!W.metal) || 'caldeirão sem fogo cozinhando ou sem metal',
    // (the lamp of the people's own — its model the one its people makes, At.LUZ — with the oil there is; the candle where it lights candles;
    // the ocote of the lake, the brazier, the lantern of horn by their causes: D-1012)
    lamparina: W => lamp(W, 'lamparina'), 'lamparina-pires': W => lamp(W, 'lamparina-pires'), 'lamparina-pedra': W => lamp(W, 'lamparina-pedra'), 'lamparina-pe': W => lamp(W, 'lamparina-pe'),
    vela: W => (!!W.luz && W.luz.cera) || festa(W, 'vela') || 'vela sem cera, ou de um povo que não acende velas (nem a cera da festa)',
    ocote: W => (!!W.luz && !!W.luz.tocha) || 'tocha de ocote sem madeira ou de um povo que não a acende', braseira: W => (!!W.luz && !!W.luz.braseira) || 'braseiro sem frio nem casa rica, sem lenha ou de um povo que não o usa',
    lanterna: W => (!!W.luz && !!W.luz.lanterna) || 'lanterna de chifre sem chifre, sem casa rica ou sem o que queimar',
    'pano-dobrado': W => W.weave || W.bens.some(q => q.k === 'tecido') || 'pano onde o povo não tece',
    // (the rug and the hanging of whoever paid for them: a household, a building whose use says whose wealth it shows — L-2251)
    tapete: (W, t, b) => (!!W.pano && (W.pano.tapete || W.weave) && dono(b)) || 'tapete sem tecelagem, sem riqueza ou sem casa que o pagou', tapecaria: (W, t, b) => (!!W.pano && W.pano.tapecaria && dono(b)) || 'tapeçaria sem tecelagem, sem riqueza ou sem casa que a pagou',
    cavilha: () => true, // (the peg of what hangs: its own cause, checked with it)
    suporte: W => (!!W.luz && (!!W.luz.k || W.luz.cera)) || 'suporte de lamparina sem lamparina nem vela',
    'rabisco-a': W => W.rabiscos > 0 || 'riscos de carvão sem doses servidas', 'rabisco-b': W => W.rabiscos > 0 || 'riscos sem doses', 'rabisco-c': W => W.rabiscos > 0 || 'riscos sem doses', 'rabisco-d': W => W.rabiscos > 0 || 'riscos sem doses',
    teia: W => !!W.teia || 'teia numa casa nova ou cuidada',
    // ---- what is served (D-748): the dish of who eats it; the cup of whose round is done
    'comida-peixe': W => eats(W, 'comida-peixe') || 'prato de peixe sem ninguém comendo peixe', 'comida-marisco': W => eats(W, 'comida-marisco') || 'mariscos sem ninguém comendo',
    'comida-carne': W => eats(W, 'comida-carne') || 'carne sem ninguém comendo carne', 'comida-arroz': W => eats(W, 'comida-arroz') || 'arroz sem ninguém comendo arroz',
    'comida-trigo': W => eats(W, 'comida-trigo') || 'pão e caldo sem ninguém comendo', 'comida-cevada': W => eats(W, 'comida-cevada') || 'caldo de cevada sem ninguém comendo',
    'comida-milho': W => eats(W, 'comida-milho') || 'tortilhas sem ninguém comendo', 'comida-sorgo': W => eats(W, 'comida-sorgo') || 'mingau sem ninguém comendo',
    'comida-horta': W => eats(W, 'comida-horta') || 'sopa sem ninguém comendo', 'comida-ovos': W => eats(W, 'comida-ovos') || 'ovos sem ninguém comendo',
    'comida-leite': W => eats(W, 'comida-leite') || 'coalhada sem ninguém comendo', 'comida-fruta': W => eats(W, 'comida-fruta') || 'frutas sem ninguém comendo',
    'comida-mel': W => eats(W, 'comida-mel') || 'pão com mel sem ninguém comendo', 'comida-azeite': W => eats(W, 'comida-azeite') || 'pão com azeite sem ninguém comendo',
    'comida-provisao': W => eats(W, 'comida-provisao') || 'o prato do dia sem ninguém comendo',
    'bebida-cerveja': W => drank(W, 'cerveja') || 'caneca de cerveja sem rodada', 'bebida-cerveja-copo': W => drank(W, 'cerveja') || 'copo de cerveja sem rodada',
    'bebida-vinho': W => drank(W, 'vinho') || 'taça de vinho sem rodada', 'bebida-vinho-copo': W => drank(W, 'vinho') || 'copo de vinho sem rodada',
    'bebida-pulque': W => drank(W, 'pulque') || 'cuia de pulque sem rodada', 'bebida-mel': W => (drank(W, 'mel') && W.couro) || 'chifre de hidromel sem rodada ou sem o couro do abate',
    'bebida-mel-caneca': W => drank(W, 'mel') || 'caneca de hidromel sem rodada',
    // ---- the marks of the night (D-749)
    'mancha-a': W => W.manchas > 0 || 'anel de cerveja sem doses servidas', 'mancha-b': W => W.manchas > 0 || 'anel sem doses', 'mancha-c': W => W.manchas > 0 || 'mancha sem doses', 'mancha-d': W => W.manchas > 0 || 'mancha sem doses',
    ossos: W => W.mesa.some(q => q.jogo) || 'ossinhos sem jogo à mesa',
    cacos: W => (W.chao.some(q => q.k === 'cacos') && W.barro) || 'cacos sem caneca de barro quebrada', 'caneca-caida': W => W.chao.some(q => q.k === 'caneca-caida') || W.caidos.length > 0 || 'caneca caída sem briga nem desmaio',
    poca: W => W.chao.some(q => q.k === 'poca') || W.caidos.length > 0 || 'poça sem nada derramado',
    lousa: W => (!!W.lousa && W.lousa.k === 'lousa') || 'lousa sem o porte da lousa', quadro: W => (!!W.lousa && W.lousa.k === 'quadro') || 'quadro sem o porte do quadro', placa: W => (!!W.lousa && W.lousa.k === 'placa') || 'placa pintada sem casa rica ou grande',
    'pano-ombro': W => !!W.ombro || 'pano no ombro sem taverneiro de povo que tece',
    // ---- the fourth wave (T7, D-880 to D-885): the feast's decorations by what they are made of, its platter; the door barred and
    // broken in; the games at the tables; the cup of who fainted
    'guirlanda-flores': W => festaM(W, 'guirlanda-flores') || 'guirlanda de flores sem festa', 'guirlanda-horta': W => festaM(W, 'guirlanda-horta') || 'guirlanda da horta sem festa',
    bandeirolas: W => (festaM(W, 'bandeirolas') && W.weave) || 'bandeirolas sem festa ou onde o povo não tece', 'pano-festa': W => (festaM(W, 'pano-festa') && W.weave) || 'pano da festa sem festa ou onde o povo não tece',
    'estandarte-classico': W => festaM(W, 'estandarte-classico') || 'estandarte sem festa', 'estandarte-romano': W => festaM(W, 'estandarte-romano') || 'estandarte sem festa',
    'estandarte-grego': W => festaM(W, 'estandarte-grego') || 'estandarte sem festa', 'estandarte-egipcio': W => festaM(W, 'estandarte-egipcio') || 'estandarte sem festa',
    'estandarte-nordico': W => festaM(W, 'estandarte-nordico') || 'estandarte sem festa', 'estandarte-asteca': W => festaM(W, 'estandarte-asteca') || 'estandarte sem festa',
    petalas: W => festa(W, 'petalas') || 'pétalas sem festa',
    'comida-festa-classico': W => pratoF(W, 'comida-festa-classico') || 'prato da festa sem festa', 'comida-festa-romano': W => pratoF(W, 'comida-festa-romano') || 'prato da festa sem festa',
    'comida-festa-grego': W => pratoF(W, 'comida-festa-grego') || 'prato da festa sem festa', 'comida-festa-egipcio': W => pratoF(W, 'comida-festa-egipcio') || 'prato da festa sem festa',
    'comida-festa-nordico': W => pratoF(W, 'comida-festa-nordico') || 'prato da festa sem festa', 'comida-festa-asteca': W => pratoF(W, 'comida-festa-asteca') || 'prato da festa sem festa',
    tranca: W => (!!W.porta && W.porta.estado === 'trancada') || 'tranca numa porta que não está trancada',
    'porta-caida': W => (!!W.porta && W.porta.estado === 'arrombada') || 'porta caída numa porta que não foi arrombada', lascas: W => (!!W.porta && W.porta.estado === 'arrombada') || 'lascas sem arrombamento',
    dado: W => W.jogos.some(q => q.dados) || 'dados sem jogo de dados', 'copo-dados': W => W.jogos.some(q => q.dados && q.dados.copo) || 'copo de dados sem jogo',
    cartas: W => W.jogos.some(q => q.cartas) || 'cartas sem jogo de cartas', monte: W => W.jogos.some(q => q.cartas && q.cartas.monte) || 'monte sem jogo de cartas',
  };
  QA.dentroCausa = CAUSA; // (for the guard: every thing of the file has its cause here — rule 296)
  // (the walls' faces of a storey, as the plan has them: the distance of a point to the nearest face)
  // (the distance to the nearest face of a wall of the storey — and to the ring of a round hut, the shell's inner face on its ground storey:
  // the plan keeps the ring as the shell, not as a wall, L-2254)
  const faceDist = (p, lv, x, z) => { let d = 1e9; for (const w of p.walls) { if (w.lv !== lv) continue; const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L2 = ax * ax + az * az || 1; const t = G.clamp(((x - w.a[0]) * ax + (z - w.a[1]) * az) / L2, 0, 1); d = Math.min(d, Math.hypot(x - w.a[0] - ax * t, z - w.a[1] - az * t) - w.t / 2); }
    const sh = p.shell; if (sh && sh.kind === 'round' && lv === Math.min(...p.levels.map(q => q.lv))) d = Math.min(d, sh.r - sh.t - Math.hypot(x - sh.cx, z - sh.cz)); return d; };
  const ovR = (a, c, m) => a[0] < c[2] + m && c[0] < a[2] + m && a[1] < c[3] + m && c[1] < a[3] + m;
  // (what a storey keeps clear, the plan's own: the doors' ways, the stairs, the corridor — turned to the lot — and where one stands)
  const keep = (p, lv) => { const In = G.Interiors, P0 = p._P, s = p.side, L = p.lot.w; const out = [];
    if (P0 && P0.keepClear) for (const r of P0.keepClear(lv)) { const a = In.toLoc(s, L, r[0], r[1]), c = In.toLoc(s, L, r[2], r[3]); out.push([Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1])]); }
    for (const it of p.items) if (it.lv === lv) for (const sp of it.spots || []) if (!sp.on) out.push([sp.x - 0.25, sp.z - 0.25, sp.x + 0.25, sp.z + 0.25]);
    return out; };
  QA.dentro = function (list) {
    const out = []; const D = G.Dentro3D, At = G.Atmos, In = G.Interiors; if (!D || !D.plan || !At || !At.within || !G.MESH3D) return out;
    for (const b of list) {
      if (!b || !b.built || b.type === 'ruin') continue; const p = G.Space.planMade ? G.Space.planMade(b) : null; if (!p || !p.grid) continue;
      const W = At.within(b); const pl = D.plan(b, p, true); const tag = `${b.type}#${b.id}`; const L = p.lot.w; const S = D.surfacesOf ? D.surfacesOf(b, p) : [];
      const fac = G.Fac.ofSet(b.set); const fid = fac ? fac.id : 0; const known = fac && fac.tech ? fac.tech.known : null;
      const counts = {}; for (const t of pl.list) counts[t.k] = (counts[t.k] || 0) + 1;
      // what the counts may be at most, by the world: a vessel a unit of drink (and the open one), the marks, the cups of the seats
      const units = W.bebida.reduce((n, q) => n + q.n + (q.aberta ? 1 : 0), 0) + 1 + W.bens.reduce((n, q) => n + (['anforeta', 'pote', 'potes'].includes(q.como) ? q.n : 0), 0);
      const vessels = ['jarra', 'jarra-alta', 'anforeta', 'pote', 'cabaca', 'jarro-madeira'].reduce((n, k) => n + (counts[k] || 0), 0);
      if (vessels > units + 1) out.push([3, `${tag}: ${vessels} jarras e ânforas desenhadas para ${units - 1} unidade(s) de bebida e guardados`, b.id]);
      const marks = ['rabisco-a', 'rabisco-b', 'rabisco-c', 'rabisco-d'].reduce((n, k) => n + (counts[k] || 0), 0); if (marks > W.rabiscos) out.push([3, `${tag}: ${marks} riscos de carvão para ${W.rabiscos} (doses servidas: ${b.served || 0})`, b.id]);
      const rings = ['mancha-a', 'mancha-b', 'mancha-c', 'mancha-d'].reduce((n, k) => n + (counts[k] || 0), 0); if (rings > W.manchas) out.push([3, `${tag}: ${rings} anéis de cerveja para ${W.manchas} (doses servidas: ${b.served || 0})`, b.id]);
      // (what is served is as much as the world says is eaten, hot only while it is — D-748)
      const byId = new Map(W.mesa.map(q => [q.id, q]));
      for (const t of pl.list) {
        const g = /\/mesa\/(\d+)\/(prato|caneca)$/.exec(t.key); const q = g ? byId.get(+g[1]) : null; if (!g || !q) continue;
        const st = g[2] === 'prato' ? q.ps : q.cs; if ((t.st | 0) !== st) out.push([3, `${tag}: ${t.k} na mesa de #${q.id} no estágio ${t.st | 0}, o mundo diz ${st} (${q.why})`, b.id]);
        if (t.quente && (HOTD[t.k] === 0 || G.S.clock - (t.t0 || 0) >= At.COOL)) out.push([3, `${tag}: ${t.k} com vapor ${HOTD[t.k] === 0 ? 'num prato que não vem quente' : `servido há ${(G.S.clock - t.t0).toFixed(1)} s (esfria em ${At.COOL})`}`, b.id]);
      }
      for (const t of pl.list) {
        if (t.k === 'vela' && W.luz && (t.vs | 0) !== Math.min(3, Math.floor((1 - W.luz.vela) * 4 + 1e-6))) out.push([3, `${tag}: a vela no tanto ${t.vs | 0}, a noite deixou ${W.luz.vela.toFixed(2)}`, b.id]);
        if (t.k === 'lenha' && W.lenha && (t.st | 0) !== 4 - W.lenha.q) out.push([3, `${tag}: a pilha de lenha no tanto ${4 - (t.st | 0)}/4, há ${W.lenha.q}/4 (${W.lenha.why})`, b.id]);
      }
      for (const t of pl.list) {
        const m = G.MESH3D[NM(t.k)]; const what = `${tag}: ${t.k} (${t.on}, ${t.key})`;
        if (!m) { out.push([3, `${what} sem modelo`, b.id]); continue; }
        // the cause
        if (!t.why) out.push([3, `${what} sem o porquê`, b.id]);
        const c = CAUSA[t.k]; const r = c ? c(W, t, b) : 'coisa sem regra de causa no verificador'; if (r !== true && !(r && typeof r !== 'string')) out.push([3, `${what}: ${r}`, b.id]);
        if (CLAY[t.k] && !W.barro) out.push([2, `${what} de barro onde o povo nunca teve a cerâmica (nada vem do nada)`, b.id]);
        if (t.k === 'caldeirao' && !W.metal) out.push([2, `${what} de metal onde o povo não tem metal`, b.id]);
        // (the stuff of a light: the clay where the people has had the ware, the bronze and the iron where it has had them — D-1012)
        if (t.lmat === 'barro' && !W.barro) out.push([2, `${what} de barro onde o povo nunca teve a cerâmica (nada vem do nada)`, b.id]);
        if ((t.lmat === 'bronze' || t.lmat === 'ferro') && !G.Origem.matOK(fid, t.lmat, known)) out.push([2, `${what} de ${t.lmat} onde o povo não tem a arte e o metal (nada vem do nada)`, b.id]);
        if (t.lit && !(W.luz && W.luz.acesa) && !(t.festa && W.festa && W.festa.acesa)) out.push([3, `${what} acesa sem ninguém acordado no escuro (${W.luz ? W.luz.why : 'nada para queimar'})`, b.id]);
        // (a part of the feast's platter only of what the recipe spent; a die on a face of its own)
        if (/^comida-festa-/.test(t.k) && W.festa && W.festa.prato && JSON.stringify(t.de || []) !== JSON.stringify(W.festa.prato.de)) out.push([3, `${what}: as partes do prato da festa não são as que a receita gastou`, b.id]);
        if (t.k === 'dado' && !(t.face >= 0 && t.face <= 6)) out.push([3, `${what}: um dado sem a face que o mundo jogou`, b.id]);
        // in the lot
        const pad = t.on === 'fora' ? 0.1 : 0; if (!(t.x > -pad && t.x < L + pad && t.z > -pad && t.z < L + pad)) out.push([2, `${what} fora do lote (${t.x}, ${t.z})`, b.id]);
        const l = p.levels.find(q => q.lv === t.lv); if (!l) { out.push([3, `${what} num andar que a planta não tem`, b.id]); continue; }
        const sx = t.s[0], sz = t.s[2], c0 = Math.abs(Math.cos(t.ry)), s0 = Math.abs(Math.sin(t.ry));
        const hw = (m.w / 2 * sx) * c0 + (m.d / 2 * sz) * s0, hd = (m.w / 2 * sx) * s0 + (m.d / 2 * sz) * c0; const R = [t.x - hw, t.z - hd, t.x + hw, t.z + hd];
        // nothing floating, nothing in the way, nothing in a piece
        if (t.on === 'tampo' || t.on === 'prateleira') {
          const it = p.items.find(q => q.id === t.it); if (!it) { out.push([3, `${what} sobre uma peça que a planta não tem`, b.id]); continue; }
          if (!(t.x > it.r[0] - 0.06 && t.x < it.r[2] + 0.06 && t.z > it.r[1] - 0.06 && t.z < it.r[3] + 0.06)) out.push([3, `${what} fora do tampo da sua peça (${it.kind})`, b.id]);
          if (!S.some(s => s.it === it && Math.abs(s.y - t.y) < 0.02)) out.push([3, `${what} flutuando: a ${t.y} m, sem tampo nem prateleira de ${it.kind} a essa altura`, b.id]);
        } else if (t.on === 'chao') {
          if (Math.abs(t.y - (l.y + FLOOR_UP)) > 0.02) out.push([3, `${what} flutuando: a ${(t.y - l.y).toFixed(3)} m do chão`, b.id]);
          const C = In.CELL; const cell = In.cell(b, t.lv, t.x, t.z); if (cell !== C.FLOOR && cell !== C.DOOR) out.push([3, `${what} sobre o que não é chão (${cell})`, b.id]);
          if (t.solto) { if (cell !== C.FLOOR) out.push([3, `${what} caído onde não é chão aberto`, b.id]); } // (what fell lies where it fell: in the way too, until it is cleaned)
          else if (t.k !== 'tapete') {
            for (const it of p.items) if (it.lv === t.lv && (it.parts || [it.r]).some(q => ovR(R, q, -0.015))) { out.push([3, `${what} dentro de ${it.kind}`, b.id]); break; }
            if (keep(p, t.lv).some(q => ovR(R, q, -0.03))) out.push([3, `${what} no caminho (o corredor, uma porta, uma escada, onde se usa uma peça)`, b.id]);
          } else if (p.stairs.some(st => (st.lv0 === t.lv || st.lv1 === t.lv) && ovR(R, st.r, -0.02))) out.push([3, `${what} sobre uma escada`, b.id]);
        } else if (t.on === 'parede') {
          const d = faceDist(p, t.lv, t.x, t.z); if (d > m.d / 2 * sz + 0.1) out.push([3, `${what} longe da parede (${d.toFixed(2)} m)`, b.id]);
          if (d < -0.01) out.push([3, `${what} dentro da parede`, b.id]);
          // (and clear of the stairs along the wall and of a piece that stands as high as it, before it)
          if (p.stairs.some(st => (st.lv0 === t.lv || st.lv1 === t.lv) && ovR(R, st.r, -0.02))) out.push([3, `${what} sobre uma escada`, b.id]);
          for (const it of p.items) if (it.lv === t.lv && !it.fire && ovR(R, it.r, -0.02) && t.y < l.y + (it.y || 0) + it.h - 0.02) { out.push([3, `${what} dentro de ${it.kind}`, b.id]); break; }
        } else if (t.on === 'fora') {
          // (the board at the door: against the front wall, by its outer face; outside the walls; at the eyes of one in the street)
          const d = faceDist(p, t.lv, t.x, t.z); if (d > m.d / 2 * sz + 0.1 || d < -0.01) out.push([3, `${what} solto da parede da frente (${d.toFixed(2)} m)`, b.id]);
          const C = In.CELL; const cell = In.cell(b, t.lv, t.x, t.z); if (cell === C.FLOOR || cell === C.SOLID || cell === C.LOW) out.push([3, `${what} dentro da casa, não na porta`, b.id]);
          if (t.y - l.y < 0.6 || t.y + m.h - l.y > 2.4) out.push([3, `${what} fora da altura dos olhos (${(t.y - l.y).toFixed(2)} m)`, b.id]);
        } else if (t.on === 'teto' || t.on === 'canto') {
          let ceil = p.shell && Number.isFinite(p.shell.eave) ? p.shell.eave : Infinity; for (const q of p.levels) if (q.y > l.y + 0.5 && (q.areas || [q.area]).some(r => r && t.x > r[0] && t.x < r[2] && t.z > r[1] && t.z < r[3])) ceil = Math.min(ceil, q.y);
          const top = t.y + m.h * t.s[1]; if (Math.abs(top - ceil) > 0.12) out.push([3, `${what} pendurado a ${top.toFixed(2)} m sem teto ali (${ceil === Infinity ? 'nenhum' : ceil.toFixed(2)})`, b.id]);
          if (t.on === 'teto' && t.y - l.y < 1.9) out.push([3, `${what} pendurado na altura das cabeças (${(t.y - l.y).toFixed(2)} m)`, b.id]);
          if (t.on === 'teto') for (const it of p.items) if (it.lv === t.lv && ovR(R, it.r, -0.02) && t.y < l.y + (it.y || 0) + it.h + 0.05 && !it.fire) { out.push([3, `${what} dentro de ${it.kind}`, b.id]); break; }
        }
      }
      // nothing over another: on the walls (a peg and what hangs from it, a lamp's shelf and its lamp, go together) and on the floor
      const pair = t => t.key.replace(/(^|\/)(cavilha|pende)\//, '$1p/').replace(/^(parede-luz\/\d+).*$/, '$1'); // (a peg and what hangs from it, with the tag of the call that hung them: F7)
      const wall = pl.list.filter(t => t.on === 'parede'), floor = pl.list.filter(t => t.on === 'chao' && t.k !== 'tapete' && !t.solto);
      for (let i = 0; i < wall.length; i++) for (let j = i + 1; j < wall.length; j++) { const a = wall[i], c = wall[j]; if (pair(a) === pair(c)) continue; const ma = G.MESH3D[NM(a.k)], mc = G.MESH3D[NM(c.k)]; if (!ma || !mc) continue;
        const dx = Math.hypot(a.x - c.x, a.z - c.z), ya = [a.y, a.y + ma.h * a.s[1]], yc = [c.y, c.y + mc.h * c.s[1]];
        if (dx < (ma.w * a.s[0] + mc.w * c.s[0]) / 2 - 0.02 && Math.min(ya[1], yc[1]) - Math.max(ya[0], yc[0]) > 0.02) out.push([4, `${tag}: ${a.k} e ${c.k} um sobre o outro na parede (${a.key}, ${c.key})`, b.id]); }
      for (let i = 0; i < floor.length; i++) for (let j = i + 1; j < floor.length; j++) { const a = floor[i], c = floor[j]; if (a.r && c.r && ovR(a.r, c.r, -0.02)) out.push([3, `${tag}: ${a.k} e ${c.k} um dentro do outro no chão`, b.id]); }
      // the lights given to the light of the inside (G.Luz3D) are the lamps lit among the things
      const lit = pl.list.filter(t => t.lit).length; if (pl.fontes.length !== lit) out.push([3, `${tag}: ${pl.fontes.length} luzes da decoração para ${lit} lamparina(s) acesa(s)`, b.id]);
    }
    return out;
  };
  QA.more.push(function (add) {
    const S = G.S; if (!S || !G.Dentro3D) return; const list = [];
    // (the insides the 3D has open; without it, the taverns and a few houses whose plans are made — the checker makes no plan)
    if (G.Build3D && G.Build3D.opened && G.Realm && G.Realm.on) for (const o of G.Build3D.opened()) { const b = S.buildings.get(o.id); if (b) list.push(b); }
    if (!list.length && G.Space && G.Space.planMade) { let h = 0; for (const b of S.buildings.values()) { if (list.length >= 14) break; if (!b.built || !G.Space.planMade(b)) continue; if (b.type === 'taverna') list.push(b); else if (h < 6 && G.BDEF[b.type] && G.BDEF[b.type].housing) { list.push(b); h++; } } }
    for (const [sev, msg, id] of QA.dentro(list)) add('dentro', sev, msg, id);
    // (a rule of a use that says a field no rule declared — refused by the within, counted: G.Atmos.withinErr, F7 D-1010)
    const E = G.Atmos && G.Atmos.withinErr; if (E) for (const k of Object.keys(E).sort()) add('dentro', 3, `a regra do uso ${k.split('.')[0]} diz o campo «${k.split('.').slice(1).join('.')}», que nenhuma regra declarou (${E[k]} vez(es); campos: …, G.Atmos.withinRule)`, 0);
  });
})();
