// guard: node guard.js [pasta do jogo] — regras de arquitetura lidas direto do código, sem abrir o jogo (leva um segundo)
// cada regra protege uma das fundações; uma exceção nova precisa entrar na lista abaixo, com o motivo
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || path.join(__dirname, '..'), 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const src = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8').split('\n')]));
const fails = [];
// an allowed spot: the file and a piece of the line (and why it may)
const ok = (list, f, line) => list.some(([af, piece]) => af === f && line.includes(piece));

// 1. "quem está a bordo": só Naval.board / Naval.unboard escrevem v.aboard
const ABOARD_OK = [
  ['naval.js', 'v.aboard = s.id; v.task = { type: \'aboard\''], // Nv.board
  ['naval.js', 'v.aboard = 0; if (!keepTask)'], // Nv.unboard
  ['naval.js', 'Nv.aboard = id =>'], // (the ship with that id: not a write to a person)
  ['villagers.js', 'else { v.aboard = 0; v.task = null; }'], // (only when there is no Naval module at all)
  ['save.js', 'v.aboard = 0'], // (a damaged save repaired before the world runs)
];
// 2. "aonde se chega a pé": quem muda muro, prédio no chão ou bloqueio avisa o mapa (touchWalk, typeVer ou invalidateLand) logo ali
const WALK_OK = [
  ['city.js', 'S.wall[i] = 3'], ['city.js', 'if (S.wall[i] === 3) S.wall[i] = 0'], // aqueduct: 0 and 3 are both walkable
  ['siege.js', 'if (S.wall[i] !== want) S.wall[i] = want'], ['siege.js', 'S.wall[gate] = 2'], // a gate opens or shuts: the map counts a gate as a way through either way
  ['save.js', 'S.occ['], // (loading: a new world, a new map)
  ['miracles.js', 'S.wall[i] = 0; S.wallFac[i] = 0; delete S.wallHp[i]; }'], // (inside reshape, which bumps S.typeVer at its end)
];
const WALK_HOOK = /touchWalk|typeVer|invalidateLand/;
// 3. "um acaso por sistema": o que só se vê ou se ouve não tira do acaso do mundo (G.R, rr, ri, pick, chance), e ninguém usa Math.random
const LOOK = ['render.js', 'fx.js', 'audio.js', 'audio-src.js', 'cinema.js', 'sky.js', 'photo.js', 'minimap.js', 'ui.js', 'story-ui.js', 'sea-ui.js', 'wars-ui.js', 'story-track.js', 'art.js', 'arch.js', 'cityart.js', 'cave-art.js', 'fauna-art.js', 'talk.js',
  'space.js', 'tex3d.js', 'ground3d.js', 'realm3d.js', 'build3d.js', 'people3d.js', 'fx3d.js', 'dragon3d.js', 'things3d.js', 'grass3d.js', 'cam3d.js', 'input3d.js', 'incui.js', 'diario-ui.js', 'modes.js', 'mesh3d.js', 'mesh-dragao.js', 'mesh-dragao2.js', 'mesh-runa.js', 'mesh-portal.js', 'mesh-empena.js', 'mesh-casco.js', 'mesh-banca.js', 'props3d.js', 'body3d.js', 'bodymesh.js', 'post3d.js', 'int-planta.js', 'atmos.js']; // (the 3D view of the Modo Encarnado: only seen)
// (drawing functions outside the drawing files may ask the camera: they are listed here)
const VIEW_OK = [['naval.js', 'const face = G.Render.sface(s);'], ['carnage.js', 'const rv = G.Render.rot();'], ['siege.js', 'ctx.scale(G.Render.sface(e), 1)'], ['save.js', 'view: G.Render.rot()'], ['main.js', 'G.Render.rot']];
const RANDOM_OK = [
  ['util.js', 'let loose = (Math.random()'], ['util.js', 'let look = (Math.random()'], // (the first state of the two generators)
  ['main.js', 'setupWorld((Math.random() * 1e9) | 0, { type: \'ilha\''], ['main.js', '(Date.now() ^ (Math.random() * 1e9)) >>> 0'], // (the seed of a new world)
];
// 4. "quem está preso": só o módulo do crime põe e tira alguém da cadeia (v.jail), e só o dono do barraco o cria
const JAIL_FILES = ['crime.js'];
// 6. "o molde de uma pessoa": toda pessoa tem as mesmas chaves (G.Vg.shape) — perguntar se uma chave existe numa pessoa não diz nada
const SHAPE_ASK = /'\w+'\s+in\s+(v|vill|person|p)\b/;
// 7. "o gelo": o gelo que vira chão (S.ice, o Inverno Súbito) só o winter.js escreve — e lá cada mudança avisa os mapas
const ICE_FILES = ['winter.js'];
// 8. "o mar aberto": o fundo do mar que vira chão (S.dry, Abrir o Mar) só o seapart.js escreve — e lá cada mudança avisa os mapas (a pé e de navio)
const DRY_FILES = ['seapart.js'];
// 9. "o corpo encarnado": quem está encarnado (S.avatar) e a marca do corpo (a tarefa 'avatar') só o possess.js escreve e dá —
// a posse começa, acaba e passa pela mesma porta (o resto do jogo pergunta a G.Possess, nunca muda o corpo de dono); a marca
// de quem nada por vontade do jogador (.afloat, o mundo o deixa na água) também só o possess.js escreve
const AVATAR_FILES = ['possess.js'];
// 5. "a memória dos mortos": só a vila abre covas (Village.bury / cemeteryFor) — doze por cemitério, e o registro aponta para a cova
const GRAVE_FILES = ['village.js'];
// 11. "o cativo em casa": quem muda o povo de uma cidade solta logo ali os cativos desse povo que moram nela
// (G.War.homecoming) — um cativo na cidade do povo de onde foi levado está em casa, e livre (L-131)
const HOME_OK = [
  ['war.js', 'set.fac = f.id; set.origFac = old.id'], // Wr.conquer: solta os cativos do vencedor no próprio laço, antes de escravizar os vencidos
  ['politics.js', 's.fac = nf.id; nf.capital = s.id'], ['politics.js', 'o.fac = nf.id; o.loyalty = 60'], // um racha: o povo que acaba de nascer não tem cativos levados dele
  ['save.js', 's.fac = f.id; if (!f.capital)'], // um save de antes dos reinos: não havia cativos
  ['naval.js', 's.fac = owner.id; s.civ = owner.civ'], ['naval.js', 'o.fac = s.fac; o.civ = s.civ'], ['fleets.js', 'o.fac = s.fac; o.civ = s.civ'], ['expeditions.js', 'o.exp = e.id; o.fac = e.fac'], // navios, não cidades
  ['expeditions.js', 'v.wrecked.fac = fid'], ['stories.js', 'story.fac = facOf(best)'], ['story-riches.js', 's.fac = G.Fac.idOfV(nr)'], ['sea-ui.js', 'view.fac = '], // o povo de um náufrago, de uma história, da janela
];
// 12. "o livro-razão": os arquivos das atividades (act-*.js) não escrevem estoque, despensa, moedas, carga nem caixas à mão
// — só pelo G.Depot (move/make/use/swap), que confere antes, aplica inteiro e anota a causa; o próprio depósito
// (activity.js) é a exceção: os seus adaptadores são a escrita
const LEDGER_FIELDS = /(\.stock\[[^\]]+\]|\.inv\[[^\]]+\]|\.pantry|\.coin|\.purse|\.carry|\.crates|\.goods)\s*(=(?!=)|\+=|-=|\+\+|--)|\.crates\.(push|unshift|splice|shift|pop)\(/;
const LEDGER_OK = []; // ([arquivo, pedaço da linha] com o motivo, se um dia precisar)
// 13. "a operação é do mundo": o que só se vê ou se ouve (a lista LOOK da regra 3) não cria, muda nem encerra operações nem
// move bens — lê (Act.offers, Depot.get/list/items, Biz.display) e pede ao corpo (a fila de intenções do possess.js)
const WORLD_WRITE = /\bG\.(Depot\.(move|make|use|swap|reserve|unreserve)|Act\.(start|end|join|leave|begin|commit|abort|perform|pause|resume|give)|Biz\.(open|close|setPrice|sell|restock))\s*\(/;
// 14. "a carga tem dono": uma caixa nasce no cais com nome (id) — quem a põe na lista do cais dá o id na mesma linha
// (uma caixa é um objeto com bem, quantidade e a marca do cais: col, fish, imp, boat ou ship; num arquivo que mexe no cais)
const CRATE_NEW = /\.(push|unshift)\(\s*\{[^}]*\bk:[^}]*\bn:[^}]*\b(col|fish|imp|boat|ship):/;
// 15. "a planta é do registro": o registro de um prédio (b.ip) só o interiors.js escreve — os outros leem a planta pelas
// portas do G.Interiors (plan, shellOf, want/pump); a planta é uma função do registro, e o registro vai no save
const IP_WRITE = /\.ip\s*=(?!=)|\.ip\.\w+\s*(=(?!=)|\+=|-=|\+\+|--)|\.ip\.\w+\.(push|splice|unshift|pop|shift)\(/;
const IP_FILES = ['interiors.js'];
// 16. "a planta tem o seu acaso": as receitas da planta (interiors.js, int-*.js) não tiram do acaso do mundo nem do que só
// se vê — cada planta tem os seus dados, da semente do prédio e da família (P.rr, P.chance, P.pick, P.shuffle)
const PLAN_FILE = f => f === 'interiors.js' || /^int-.*\.js$/.test(f);
const ANY_CHANCE = /\bG\.(R|rr|ri|pick|chance|VR|vrr|vri|vpick|vchance)\(/;
// 17. "o desenho não reforma": o que só se vê ou se ouve (a lista LOOK) não muda o registro de um prédio — fundar, acabar,
// reformar, arruinar, abandonar, usar uma porta, a virada do dia são do mundo
const IP_ACTS = /\bInteriors\.(found|complete|retype|ruin|abandon|damage|renovate|reuse|useDoor|onNewDay|migrate)\s*\(/;
// 18 e 19. "um dono por lista": os negócios (S.biz) só o act-negocio.js escreve — abre, fecha, apaga, carrega; o que está no
// chão por causa de uma operação (S.loose) só o activity.js (o depósito: G.Depot.drop / o chão 'g:'); os outros leem
const BIZ_WRITE = /\bS\.biz\s*=(?!=)|\bS\.biz\.(push|unshift|splice|shift|pop)\(/, LOOSE_WRITE = /\bS\.loose\s*=(?!=)|\bS\.loose\.(push|unshift|splice|shift|pop)\(/;
// 22. "as portas dos interiores": o lugar dos guardados (G.Depot.stores, os móveis da planta) e a porta das pessoas
// (G.Vg.planDoor, a da planta) só o interiors.js liga — os donos das portas (activity.js, villagers.js) só as declaram,
// nulas; trocá-las noutro lugar muda o mundo em silêncio
const PORT_SET = /\b(Depot|D)\.stores\s*=(?!=)|\bVg\.planDoor\s*=(?!=)/;
const PORT_OK = { 'interiors.js': () => true, 'activity.js': line => /\bD\.stores\s*=\s*null\s*;/.test(line), 'villagers.js': line => /\bVg\.planDoor\s*=\s*null\s*;/.test(line) };
// 23. "o mundo pergunta ao espaço só se a entrada cabe" (L-195): fora do que só se vê (a lista LOOK da regra 3) e das portas
// do corpo (os pés e as mãos do corpo leem o espaço dele), o mundo só pergunta ao G.Space pelo entryFits — a conta pura dos
// degraus diante da porta, feita de novo — e pelo treesAround, as árvores, as pedras grandes e os registros dos prédios mais
// velhos de que ela depende, lidos do mundo (L-206, L-618, L-619); outra
// pergunta faria o passo do mundo depender do que o 3D guarda (os memos do space.js), e o mundo seria outro com ou sem alguém
// olhando
const SPACE_BODY = ['possess.js', 'avatar.js', 'interact.js'];
// 24. "o diário só pede" (D-061): deixar um objetivo de lado é do corpo — G.Casa.giveUp só dentro de um G.Possess.apply (o
// pedido das mãos, que o mundo faz no seu passo), na mesma linha; a tela do diário, e todo o resto, nunca o chama direto
const GIVEUP = /\bCasa\.giveUp\s*\(/;
const SPACE_ASK = ['entryFits', 'treesAround'];
// 29. "um lugar, uma pessoa" (D-085): o lugar de alguém num prédio de planta é o que o repartidor dá — In.places, In.placeOf,
// In.freePlace, In.freeFor, In.placeFor —; fora do interiors.js e das receitas (int-*.js), nenhum módulo do mundo lê à mão os
// pontos de uso de uma peça de planta (it.spots, pl.it.spots, bedOf(…).spot), nem escreve campo de lugar numa pessoa (v.place,
// v.seat, v.bed): dois módulos que põem gente cada um à sua conta põem duas pessoas no mesmo lugar. Para contar os lugares de
// um uso ou mostrar onde fica uma peça (o «at» de uma oferta), a porta de leitura do repartidor, In.slots(b, uso) — que não
// dá lugar a ninguém. Ler os pontos para mostrar ou oferecer é também do desenho e da interface (a lista LOOK da regra 3) e do
// corpo (os pés e as mãos dele, SPACE_BODY da regra 23: o ponto de onde se sobe num lugar, depois do In.freeFor). Os pontos das
// bancas (B.spots, act-negocio.js) e dos pesqueiros dos cais (b.spots) são outra coisa: não são peças de planta
const PLACE_READ = /\b(?:it|item|piece)\.spots\b|\.it\.spots\b|\bbedOf\s*\([^)]*\)\.spot\b/;
const PLACE_WRITE = /\b(?:v|o|h|w|q|who|kid|baby|vill|person)\.(?:place|seat|bed)\s*=(?!=)/;
const PLACE_FILES = f => f === 'interiors.js' || /^int-[\w-]+\.js$/.test(f);
// 31. "a despensa só pelo livro": a despensa de uma casa (h.pantry) muda só pelo G.Depot — os adaptadores do depósito
// (activity.js) são a escrita; fora dele, nenhuma escrita à mão (o fim do dia em casa e o tributo, as duas últimas, passaram
// pelo livro no Patch 2: T-130)
const PANTRY_WRITE = /\.pantry\s*(=(?!=)|\+=|-=|\+\+|--)/;
const PANTRY_OK = []; // ([arquivo, pedaço da linha] com o motivo, se um dia precisar)
// 32. "a noite em casa é do act-lar.js": a tarefa 'lar' (a ceia, cozinhar, conversar, descansar, ninar, esperar, de cama, de
// luto, cuidar dos pequenos) só o act-lar.js dá — pela setTask, no passo do mundo, e no gancho do save (D-070)
const LAR_TASK = /type:\s*'lar'/;
// 33. "a festa é do festivals.js": a tarefa 'fest' só o festivals.js dá — quem entra na festa passa pelo free() dele (quem vai
// comer, ou está no máximo da fome, fica de fora: L-234), e a festa viva vai no gancho do save dele (L-222)
const FEST_TASK = /type:\s*'fest'/;
// 34. "o colo do bebê" (D-074): quem segura um bebê (b.carrier) só o villagers.js escreve — o babyUpdate e a porta única
// G.Vg.handBaby (o corpo pega e dá pelas ofertas da casa por ela); um colo escrito noutro lugar faria o bebê pular pela cidade
const CARRIER_WRITE = /\.carrier\s*=(?!=)/;
// 35. "o que a casa custou" (L-236): o custo de uma casa para a família que a tem (b.custo) só o act-casa.js (comprar, a obra
// paga, a casa que volta ao povo, a herança) e o social.js (a troca da terra cara, a cabana feita do barraco) escrevem
const CUSTO_WRITE = /\.custo\s*(=(?!=)|\+=|-=)/;
const CUSTO_FILES = ['act-casa.js', 'social.js'];
// 28. "a forma é uma só" (L-260, D-080): no js/build3d.js, a entrada do KIT de todo tipo que o js/forma.js define (def('tipo',
// …)) desenha só pelo formInto( — mais o scaffold( da obra —; um tipo com forma só em alguns povos (o celeiro; o templo de
// antes) pergunta G.Forma.has e só fora da forma desenha outra coisa. Um desenho próprio no KIT faria o deus e o corpo verem
// dois prédios (L-260)
const KIT_DRAW = /\b(K\.(box|cyl|cone|sph|gable|hip|quad|tri|para|bar|log|sheet)|g\.put|house|longhouse|smithy|roundHut|stalls|fields|runeStone|colonnade|fence)\s*\(/;
// 36. "a forma é do mundo e pura" (D-080, D-093): o js/forma.js é lido pelo passo do mundo (a planta de um tipo com forma) e
// pelo desenho, e por isso, fora dos comentários: não tira de acaso nenhum (G.R, rr, ri, pick, chance, VR, vrr, vri, vpick,
// vchance, Math.random); não lê o mundo (G.S, S.buildings, S.villagers, o registro .ip); não lê o 3D nem a tela (THREE,
// G.Build3D, G.Realm, G.Render, G.Arch, G.Art, G.Space, G.Interiors); e vem antes do three.js e do interiors.js no index.html
// (o Node o carrega; a planta pergunta a ele). Fora do que só se vê (a lista LOOK), um módulo só faz à forma as perguntas da
// planta (FORMA_ASK); o resto (mass, foot, faces, hip, figure, deck, dome, lived, ZPX) é do desenho
const FORMA_WORLD = /\bG\.S\b|\bS\.(buildings|villagers)\b|\.ip\b/, FORMA_VIEW = /\bTHREE\b|\bG\.(Build3D|Realm|Render|Arch|Art|Space|Interiors)\b/;
const FORMA_ASK = ['of', 'has', 'body', 'uses', 'solids', 'flight', 'toLot', 'dirLot', 'COLUMN_BASE', 'ringEdge', 'ringVerts']; // (COLUMN_BASE: the base of a column, the size the plan keeps solid — L-494 (3); ringEdge: the drawn edge of a ring of seats, the plan's rows by it — L-494 (2); ringVerts: the corners of that edge between two angles, the plan's walls along it — T-457)
// (the forms of the other steps of a ladder, D-106: js/forma-*.js, each pure as js/forma.js, putting its generators in by Fo.def)
const FORMA_FILE = f => /^forma(-[a-z0-9-]+)?\.js$/.test(f);
// 37. "o grão é do mundo" (L-394): só o passo do mundo pede o grão de uma fazenda ao Estates.grainOf, que o guarda na fazenda
// (b.grain) na primeira vez; o que só se vê ou se ouve (a lista LOOK da regra 3) e o cartão do corpo (interact.js) leem pelo
// Estates.grainFor, que não guarda nada — o nome da fazenda também (Village.nameOf)
const GRAIN_LOOK = LOOK.concat(['interact.js']);
// 39. "o embaralhamento é G.shuffle" (L-437): um .sort cujo comparador tira do acaso (G.R, rr, ri, pick, chance, R(); VR e
// os seus; Math.random) não embaralha: quantas vezes o motor o chama e que ordem sai são do motor — o V8 ordena de um jeito no
// interpretador e de outro no código otimizado, e a mesma semente fazia dois mundos, conforme a máquina tinha otimizado a
// linha. Embaralhar é G.shuffle (o acaso do mundo) ou G.vshuffle (o do que só se vê): sempre os mesmos sorteios
const SORT_CHANCE = /\.sort\(\s*(?:\([^)]*\)|\w+)\s*=>[^;]*?(?:\bG\.(?:R|rr|ri|pick|chance|VR|vrr|vri|vpick|vchance)\(|\bV?R\(\)|Math\.random\()/;
for (const f of files) src[f].forEach((line, k) => {
  if (/^\s*\/\//.test(line)) return;
  if (IP_WRITE.test(line) && !IP_FILES.includes(f)) fails.push(`planta: ${f}:${k + 1} escreve o registro de um prédio (b.ip) fora de interiors.js (a planta é do registro; peça pelas portas do G.Interiors): ${line.trim().slice(0, 110)}`);
  if (PLAN_FILE(f) && ANY_CHANCE.test(line)) fails.push(`planta: ${f}:${k + 1} a planta tira do acaso do mundo ou da tela (cada planta tem os seus dados: P.rr, P.chance, P.pick, P.shuffle): ${line.trim().slice(0, 110)}`);
  if (LOOK.includes(f) && IP_ACTS.test(line)) fails.push(`planta: ${f}:${k + 1} o desenho/a interface muda o registro de um prédio (só lê: plan, shellOf, want/pump): ${line.trim().slice(0, 110)}`);
  if (/^act-.*\.js$/.test(f) && LEDGER_FIELDS.test(line) && !ok(LEDGER_OK, f, line)) fails.push(`livro-razão: ${f}:${k + 1} escreve estoque/carga à mão (use G.Depot.move/make/use, que confere e anota a causa): ${line.trim().slice(0, 110)}`);
  if (LOOK.includes(f) && WORLD_WRITE.test(line)) fails.push(`operação: ${f}:${k + 1} o desenho/a interface muda uma operação ou move bens (só lê; o corpo pede pela fila do possess.js): ${line.trim().slice(0, 110)}`);
  if (CRATE_NEW.test(line) && src[f].some(l => l.includes('.crates')) && !/\bid:/.test(line)) fails.push(`carga: ${f}:${k + 1} põe uma caixa no cais sem nome (id: G.S.nextId++ na mesma linha): ${line.trim().slice(0, 110)}`);
  if (BIZ_WRITE.test(line) && f !== 'act-negocio.js') fails.push(`negócio: ${f}:${k + 1} escreve a lista dos negócios (S.biz) fora de act-negocio.js (abrir, fechar e mudar passam pelo G.Biz): ${line.trim().slice(0, 110)}`);
  if (PORT_SET.test(line) && !(PORT_OK[f] && PORT_OK[f](line))) fails.push(`portas: ${f}:${k + 1} liga ou troca uma porta dos interiores (G.Depot.stores, G.Vg.planDoor) fora de interiors.js: ${line.trim().slice(0, 110)}`);
  if (!LOOK.includes(f) && !SPACE_BODY.includes(f)) for (const m of line.replace(/(^|\s)\/\/\s.*$/, '').matchAll(/\bSpace\.(\w+)/g)) if (!SPACE_ASK.includes(m[1])) fails.push(`espaço: ${f}:${k + 1} o mundo pergunta ao G.Space por ${m[1]} (só pelo entryFits e o treesAround, as contas puras da entrada: o que o 3D guarda não decide o mundo): ${line.trim().slice(0, 110)}`);
  if (GIVEUP.test(line) && !/\bPossess\.apply\s*\(/.test(line)) fails.push(`diário: ${f}:${k + 1} deixa um objetivo de lado fora do pedido do corpo (só dentro de G.Possess.apply: o mundo decide no seu passo, D-061): ${line.trim().slice(0, 110)}`);
  if (LOOSE_WRITE.test(line) && f !== 'activity.js') fails.push(`chão: ${f}:${k + 1} escreve o que está no chão (S.loose) fora de activity.js (pôr e tirar do chão passa pelo G.Depot): ${line.trim().slice(0, 110)}`);
  if (!PLACE_FILES(f) && !LOOK.includes(f) && !SPACE_BODY.includes(f) && [PLACE_READ, PLACE_WRITE].some(r => r.test(line.replace(/(^|\s)\/\/\s.*$/, '')))) fails.push(`lugar: ${f}:${k + 1} põe ou lê à mão o lugar de alguém num prédio de planta (o lugar de alguém é o que o repartidor dá: In.places, In.freePlace, In.freeFor, In.placeFor — D-085): ${line.trim().slice(0, 110)}`);
  if (PANTRY_WRITE.test(line) && f !== 'activity.js' && !ok(PANTRY_OK, f, line)) fails.push(`despensa: ${f}:${k + 1} escreve a despensa de uma casa à mão (use G.Depot.move/make/use, que anota a causa): ${line.trim().slice(0, 110)}`);
  if (SORT_CHANCE.test(line.replace(/(^|\s)\/\/\s.*$/, ''))) fails.push(`embaralhar: ${f}:${k + 1} ordena com um comparador que tira do acaso (a ordem e os sorteios são do motor, que muda ao otimizar: G.shuffle / G.vshuffle): ${line.trim().slice(0, 110)}`);
  if (LAR_TASK.test(line) && f !== 'act-lar.js') fails.push(`lar: ${f}:${k + 1} dá a tarefa 'lar' fora de act-lar.js (a noite em casa é do G.Lar): ${line.trim().slice(0, 110)}`);
  if (FEST_TASK.test(line) && f !== 'festivals.js') fails.push(`festa: ${f}:${k + 1} dá a tarefa 'fest' fora de festivals.js (quem entra na festa passa pelo free() dela): ${line.trim().slice(0, 110)}`);
  if (CARRIER_WRITE.test(line) && f !== 'villagers.js') fails.push(`colo: ${f}:${k + 1} escreve quem segura um bebê (.carrier) fora de villagers.js (use G.Vg.handBaby): ${line.trim().slice(0, 110)}`);
  if (CUSTO_WRITE.test(line) && !CUSTO_FILES.includes(f)) fails.push(`custo: ${f}:${k + 1} escreve o que a casa custou (.custo) fora de act-casa.js e social.js: ${line.trim().slice(0, 110)}`);
  if (FORMA_FILE(f)) { const c = line.replace(/(^|\s)\/\/\s.*$/, ''); if (ANY_CHANCE.test(c) || /Math\.random\s*\(/.test(c) || FORMA_WORLD.test(c) || FORMA_VIEW.test(c)) fails.push(`forma: ${f}:${k + 1} a forma tira do acaso, lê o mundo ou lê o 3D/a tela (ela é pura: os números do deus, por tipo e povo): ${line.trim().slice(0, 110)}`); }
  if (!LOOK.includes(f) && !FORMA_FILE(f)) for (const m of line.replace(/(^|\s)\/\/\s.*$/, '').matchAll(/\bForma\.(\w+)/g)) if (!FORMA_ASK.includes(m[1])) fails.push(`forma: ${f}:${k + 1} o mundo pergunta à forma por ${m[1]} (só as perguntas da planta: ${FORMA_ASK.join(', ')}): ${line.trim().slice(0, 110)}`);
  if (GRAIN_LOOK.includes(f) && /\bEstates\.grainOf\b/.test(line.replace(/(^|\s)\/\/\s.*$/, ''))) fails.push(`grão: ${f}:${k + 1} o desenho/a interface pede o grão ao Estates.grainOf, que o guarda na fazenda (L-394: leia pelo Estates.grainFor): ${line.trim().slice(0, 110)}`);
  if (/\b\w+\.fac\s*=(?!=)/.test(line) && !ok(HOME_OK, f, line) && !/homecoming/.test(src[f].slice(k, k + 3).join('\n'))) fails.push(`cativo em casa: ${f}:${k + 1} muda o povo de uma cidade sem soltar os cativos desse povo que moram nela (G.War.homecoming): ${line.trim().slice(0, 110)}`);
  if (SHAPE_ASK.test(line)) fails.push(`molde: ${f}:${k + 1} pergunta se uma chave existe numa pessoa (todas têm todas as chaves — compare o valor): ${line.trim().slice(0, 110)}`);
  if (/\.graves\s*(=(?!=)|\)?\.push\()|\bgraves\s*=\s*\w+\.graves\s*\|\|/.test(line) && !GRAVE_FILES.includes(f)) fails.push(`covas: ${f}:${k + 1} mexe nos túmulos fora de village.js (use G.Village.bury / cemeteryFor): ${line.trim().slice(0, 110)}`);
  if (/\b\w+\.jail\s*=(?!=)(?!\s*function\b)/.test(line) && !JAIL_FILES.includes(f)) fails.push(`preso: ${f}:${k + 1} escreve .jail fora de crime.js (prisão e soltura passam pelo módulo do crime): ${line.trim().slice(0, 110)}`);
  if (/\bS\.ice\b\s*(\[[^\]]*\])?\s*=[^=]/.test(line) && !ICE_FILES.includes(f)) fails.push(`gelo: ${f}:${k + 1} escreve S.ice fora de winter.js (o gelo que vira chão é do Inverno Súbito, que avisa os mapas): ${line.trim().slice(0, 110)}`);
  if (/\bS\.dry\b\s*(\[[^\]]*\])?\s*=[^=]/.test(line) && !DRY_FILES.includes(f)) fails.push(`mar aberto: ${f}:${k + 1} escreve S.dry fora de seapart.js (o fundo do mar que vira chão é do Abrir o Mar, que avisa os mapas): ${line.trim().slice(0, 110)}`);
  if (/\bS\.avatar\s*=[^=]/.test(line) && !AVATAR_FILES.includes(f)) fails.push(`encarnado: ${f}:${k + 1} escreve S.avatar fora de possess.js (a posse passa por G.Possess.take / release): ${line.trim().slice(0, 110)}`);
  if (/\.afloat\s*=[^=]/.test(line) && !AVATAR_FILES.includes(f)) fails.push(`encarnado: ${f}:${k + 1} escreve a marca de quem nada (.afloat) fora de possess.js (o corpo avisa por G.Possess.setAfloat): ${line.trim().slice(0, 110)}`);
  if (/type:\s*'avatar'/.test(line) && !AVATAR_FILES.includes(f)) fails.push(`encarnado: ${f}:${k + 1} dá a tarefa 'avatar' fora de possess.js (só a posse marca o corpo): ${line.trim().slice(0, 110)}`);
  if (/addBuilding\('barraco'/.test(line) && f !== 'social.js') fails.push(`barraco: ${f}:${k + 1} cria barraco fora de social.js (só quem ficou sem casa levanta um): ${line.trim().slice(0, 110)}`);
  if (/\b\w+\.aboard\s*=[^=]/.test(line) && !ok(ABOARD_OK, f, line)) fails.push(`a bordo: ${f}:${k + 1} escreve .aboard direto (use G.Naval.board / unboard): ${line.trim().slice(0, 110)}`);
  if (/Math\.random\s*\(/.test(line) && !ok(RANDOM_OK, f, line)) fails.push(`acaso: ${f}:${k + 1} usa Math.random (o mundo usa G.R; o que só se vê, G.VR): ${line.trim().slice(0, 110)}`);
  if (!LOOK.includes(f) && /(UI\.selected|UI\.viewFac|Cinema\.on|Scene\.watching|Track\.)/.test(line) && /(\blog\(|Village\.log\(|\.bio\(|history\.push|Lore\.note)/.test(line) && !/UI\.notice/.test(line)) fails.push(`interface: ${f}:${k + 1} o que entra na crônica/biografia depende do que o jogador olha (use G.UI.notice para o olhar): ${line.trim().slice(0, 110)}`);
  if (!LOOK.includes(f) && /Render\.(sface|sdir|rot)\(/.test(line) && !/^\s*(ctx|c)\./.test(line) && !ok(VIEW_OK, f, line)) fails.push(`câmera: ${f}:${k + 1} a simulação lê o lado da tela (sface/sdir/rot); para o mundo use G.wface: ${line.trim().slice(0, 110)}`);
  if (LOOK.includes(f) && /\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\()/.test(line)) fails.push(`acaso: ${f}:${k + 1} desenho/som/interface tirando do acaso do mundo (use G.VR, vrr, vri, vpick, vchance): ${line.trim().slice(0, 110)}`);
  if (/(wall|occ)\[[^\]]+\]\s*=[^=]|\.blocks\s*=[^=]/.test(line) && !ok(WALK_OK, f, line)) {
    const near = src[f].slice(k, k + 7).join('\n');
    if (!WALK_HOOK.test(near)) fails.push(`caminho: ${f}:${k + 1} muda o chão sem avisar o mapa de alcance (W.touchWalk): ${line.trim().slice(0, 110)}`);
  }
});
// (a forma: o lugar do js/forma.js no index.html, e as entradas do KIT dos tipos com forma — regras 36 e 28)
{ const html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8'); const at = s => html.indexOf(`src="js/${s}"`);
  if (at('forma.js') < 0 || at('forma.js') > at('interiors.js') || at('forma.js') > at('lib/three.min.js')) fails.push('forma: no index.html, o js/forma.js vem antes do js/interiors.js e do js/lib/three.min.js (o Node o carrega; a planta pergunta a ele)');
  for (const f of files.filter(f => FORMA_FILE(f) && f !== 'forma.js')) if (at(f) < 0 || at(f) < at('forma.js') || at(f) > at('interiors.js')) fails.push(`forma: no index.html, o js/${f} vem depois do js/forma.js e antes do js/interiors.js (as formas dos degraus, D-106)`);
  const types = new Set([...(src['forma.js'] || []).join('\n').matchAll(/\bdef\('([a-z_]+)'/g)].map(m => m[1]));
  for (const f of files.filter(f => FORMA_FILE(f) && f !== 'forma.js')) for (const m of src[f].join('\n').matchAll(/\b(?:G\.Forma|Fo)\.def\(\s*'([a-z_]+)'/g)) types.add(m[1]);
  const L = src['build3d.js'] || [];
  const k0 = L.findIndex(l => /^  const KIT = \{/.test(l)); let cur = null, body = [];
  const judge = () => { if (!cur || !types.has(cur.t)) return; const code = body.map(l => l.replace(/(^|\s)\/\/\s.*$/, '')).join('\n');
    if (KIT_DRAW.test(code) && !/\bG\.Forma\.has\(/.test(code)) fails.push(`forma: build3d.js:${cur.k + 1} a entrada do KIT de ${cur.t} desenha outra coisa além da forma (só formInto e scaffold; um tipo com forma só em alguns povos pergunta G.Forma.has) — L-260`); };
  for (let k = k0 + 1; k0 >= 0 && k < L.length && !/^  \};/.test(L[k]); k++) { const m = /^    ([a-z_]+)\s*\(/.exec(L[k]); if (m) { judge(); cur = { t: m[1], k }; body = []; } if (cur) body.push(L[k]); }
  judge(); }
// 10. "o módulo que não existe": todo G.Algo que o código usa é criado em algum lugar (G.Algo = …) — um nome errado não quebra
// nada à vista: \`G.Algo && G.Algo.f()\` só deixa de fazer, em silêncio (L-103: G.Biomes no lugar de G.Biome)
{ const def = new Set(); for (const f of files) for (const m of src[f].join('\n').matchAll(/\bG\.([A-Z][A-Za-z0-9_]*)\s*=(?!=)/g)) def.add(m[1]);
  // (a name in a comment is not a use: the line's own comment after the code is left out too)
  for (const f of files) src[f].forEach((line, k) => { if (/^\s*\/\//.test(line)) return; for (const m of line.replace(/(^|\s)\/\/\s.*$/, '').matchAll(/\bG\.([A-Z][A-Za-z0-9_]*)\b/g)) if (!def.has(m[1])) fails.push(`módulo: ${f}:${k + 1} usa G.${m[1]}, que nenhum arquivo cria (nome errado?): ${line.trim().slice(0, 110)}`); }); }
// 21. "o verificador confere os sistemas novos": as invariantes de cada sistema em construção vivem no arquivo do seu dono e
// vão copiadas para dentro do qa.js (qa/junta-inv.js) — a cópia igual aos arquivos, ou a soak e a regressão não as conferem
{ const J = require('./junta-inv.js'); if (J.current() !== J.block()) fails.push(`invariantes: o bloco dos sistemas novos no qa/qa.js não é o dos arquivos (${J.FILES.join(', ')}) — rode node qa/junta-inv.js`); }
// 30. "um nome, uma função" (L-320): duas declarações function com o mesmo nome no mesmo arquivo e na mesma margem — no
// JavaScript a última vence, em silêncio, e quem chamava a primeira passa a chamar a outra (a vez da história no lugar da batida)
for (const f of files) { const seen = new Map(); src[f].forEach((line, k) => { const m = line.match(/^(\s*)(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/); if (!m) return; const key = m[1].length + ':' + m[2]; if (seen.has(key)) fails.push(`um nome, uma função: ${f}:${k + 1} declara de novo a função ${m[2]} (a outra está na linha ${seen.get(key) + 1}; a última toma o lugar da primeira)`); else seen.set(key, k); }); }
// 25. "a operação nasce no seu arquivo" (D-076, D-077): uma operação do G.Act começa (A.start / G.Act.start com o nome escrito)
// só no arquivo que a define (A.def com o mesmo nome) — a fornada no act-oficio.js, a taverna no act-taverna.js, os banhos e a
// lenha deles no act-servicos.js, o espetáculo no act-lazer.js, a descarga no act-porto.js —; e o livro de cada uma só o seu
// arquivo escreve: os montes da fornada (massa, cru, forno, feitos, quebrados) só no act-oficio.js, e o livro do dia da
// taverna (servidos, faltas, recusas) só no act-taverna.js
{ const DEFS = {}; for (const f of files) src[f].forEach(l => { const m = l.match(/\bA\.def\('([a-zA-Z]+)'/); if (m) DEFS[m[1]] = f; });
  const START = /(?:G\.Act|\bA)\.start\('([a-zA-Z]+)'/g;
  const BATCH = /\.(massa|cru|forno|feitos|quebrados)\s*(=(?!=)|\+=|-=|\+\+|--)/;
  const TAVBOOK = /\.(servidos|faltas|recusas)\s*(=(?!=)|\+=|-=|\+\+|--)/;
  for (const f of files) src[f].forEach((line, k) => {
    if (/^\s*\/\//.test(line)) return;
    for (const m of line.matchAll(START)) { const home = DEFS[m[1]]; if (home && home !== f) fails.push(`operação: ${f}:${k + 1} começa a operação '${m[1]}', que é do ${home} (uma operação nasce no arquivo que a define): ${line.trim().slice(0, 100)}`); }
    if (BATCH.test(line) && f !== 'act-oficio.js') fails.push(`fornada: ${f}:${k + 1} escreve um monte da fornada fora do act-oficio.js: ${line.trim().slice(0, 100)}`);
    if (TAVBOOK.test(line) && f !== 'act-taverna.js') fails.push(`taverna: ${f}:${k + 1} escreve o livro do dia da taverna fora do act-taverna.js: ${line.trim().slice(0, 100)}`);
  }); }
// 26. "a conta da obra é do village.js" (D-075, L-416): o que uma obra pede (b.need), o registro do tijolo que tomou o lugar
// da pedra (b.brick) e o da troca de um material por outro no caminho (b.troca) só o village.js escreve — a fundação troca, a
// reforma refaz, a conta paga, a entrega desconta, a virada do dia destroca, a doca terminada em pedra troca (V.swapBill, que
// o naval.js chama: com o b.need escrito à mão a madeira entrava na doca sem linha no livro e a pedra sumia nela, L-416).
// Exceções nomeadas: o que um navio pede para ficar pronto (s.need, naval.js: não é uma obra) e a reforma largada (a casa
// volta a ser o que era, de pé, depois que o que veio para a nova voltou ao armazém pelo livro: villagers.js, abandonSite)
const WORK_OK26 = [
  ['naval.js', 's.need = def.build'],                                                // (um navio, não uma obra)
  ['villagers.js', 'b.type = b.upgradeFrom; b.upgradeFrom = null; b.built = true'], // (a reforma largada, depois do siteBack)
];
{ const WORK26 = [/\.(brick|troca)\s*=(?!=)/, /\.(brick|troca)(\.\w+|\[[^\]]+\])\s*(=(?!=)|\+=|-=|\+\+|--)/, /\.need\s*=(?!=)(?!\s*function)/, /\.need(\.\w+|\[[^\]]+\])\s*(=(?!=)|\+=|-=|\+\+|--)/];
  for (const f of files) src[f].forEach((line, k) => { if (/^\s*\/\//.test(line) || !WORK26.some(r => r.test(line))) return; if (f !== 'village.js' && !ok(WORK_OK26, f, line)) fails.push(`obra: ${f}:${k + 1} escreve a conta da obra (o que ela pede, o tijolo, a troca) fora do village.js: ${line.trim().slice(0, 100)}`); }); }
// 27. "o livro-razão também no economy.js, no tavern.js e no court.js": a regra 12 (estoque, prateleira, despensa, moedas,
// bolsa, carga e caixas só pelo G.Depot) vale também para os três arquivos da economia que vieram de antes das atividades —
// passados para o livro no Patch 2 (as mãos do economy.js, L-244; o goHome, o consumo da casa, o pão do preso, o tributo e a
// despensa da corte, T-130, L-243; a taverna, D-077). Exceções nomeadas: o molde do estoque (uma chave que falta nasce em 0),
// o nome da função da bolsa e o conserto do save de antes (um número que não é número volta a 0). Vê também a forma com
// ponto (f.stock.food -= 1), que a regra 12 de hoje não vê
const LEDGER_OK27 = [
  ['economy.js', "if (typeof f.stock[k] !== 'number') f.stock[k] = 0"], // (o molde do estoque: E.ensure)
  ['economy.js', 'E.purse = purse;'],                                 // (o nome da função, não a bolsa)
  ['economy.js', '!isFinite(f.stock[k])) f.stock[k] = 0'],             // (o save de antes com um NaN no estoque)
];
{ const LEDGER27 = /(\.stock(\[[^\]]+\]|\.\w+)|\.inv(\[[^\]]+\]|\.\w+)|\.pantry|\.coin|\.purse|\.carry|\.crates|\.goods)\s*(=(?!=)|\+=|-=|\+\+|--)|\.crates\.(push|unshift|splice|shift|pop)\(/;
  for (const f of ['economy.js', 'tavern.js', 'court.js']) (src[f] || []).forEach((line, k) => { if (/^\s*\/\//.test(line) || !LEDGER27.test(line)) return; if (!ok(LEDGER_OK27, f, line)) fails.push(`livro-razão: ${f}:${k + 1} escreve estoque/despensa/moedas/carga à mão (use o G.Depot): ${line.trim().slice(0, 100)}`); }); }
// 38. "as mãos ocupadas" (D-094): (1) um chamado da praça abaixo de 3 dado por setTask direto de outro módulo — a execução, a
// assembleia, o funeral, a celebração, a petição — pergunta antes ao Vg.busy (ou ao Vg.handsBusy), nas oito linhas antes dele,
// como o Vg.give pergunta; (2) a festa da cidade (3,2) só toma quem o free() dela acha livre, e o free() pergunta ao
// Vg.handsBusy; (3) o enlist da festa pergunta ao free(); (4) o carrasco e o arauto da execução (5 e 4,5) são escolhidos com
// as mãos livres (o pickExecutioner e o pickHerald perguntam ao handsBusy); (5) o homem da ordem secreta pergunta ao Vg.busy
// antes de seguir alguém (L-456); (6) a tripulação de uma viagem não leva mãos ocupadas (L-458); (7) nem tira ninguém do
// refúgio da caverna (L-459); (8) nem as escolhas da guerra — a leva, o bando, as tripulações do ataque e da frota (L-461);
// (9) nem o mercador de uma caravana, e a conversa não para quem está na perna de uma operação (L-508)
{ const RX = /G\.Vg\.setTask\(.*?type:\s*'(justice|assembly|funeral|celebrate|petition)'.*?pri:\s*([0-9.]+)/;
  for (const f of files) { if (f === 'villagers.js') continue; src[f].forEach((line, k) => { const m = line.match(RX); if (!m || +m[2] >= 3) return; const near = src[f].slice(Math.max(0, k - 8), k + 1).join('\n'); if (!/Vg\.(busy|handsBusy)\(/.test(near)) fails.push(`mãos ocupadas: ${f}:${k + 1} chama alguém para ${m[1]} (${m[2]}) por setTask sem perguntar ao Vg.busy (D-094): ${line.trim().slice(0, 100)}`); }); }
  const fe = src['festivals.js'] || []; const fr = fe.findIndex(l => /^\s*function free\(v\)/.test(l));
  if (fr < 0) fails.push('mãos ocupadas: festivals.js sem o function free(v) — quem a festa toma pergunta ao Vg.handsBusy (D-094)');
  else if (!/Vg\.handsBusy\(/.test(fe[fr])) fails.push(`mãos ocupadas: festivals.js:${fr + 1} o free() da festa não pergunta ao Vg.handsBusy (D-094): ${fe[fr].trim().slice(0, 100)}`);
  const en = fe.findIndex(l => /^\s*function enlist\(/.test(l));
  if (en >= 0 && !/!free\(v\)/.test(fe.slice(en, en + 3).join('\n'))) fails.push(`mãos ocupadas: festivals.js:${en + 1} o enlist não pergunta ao free() (D-094)`);
  const ju = src['justice.js'] || [];
  for (const fn of ['pickExecutioner', 'pickHerald']) { const k = ju.findIndex(l => l.includes('function ' + fn + '(')); if (k >= 0 && !/handsBusy\(/.test(ju.slice(k, k + 8).join('\n'))) fails.push(`mãos ocupadas: justice.js:${k + 1} o ${fn} escolhe sem perguntar ao Vg.handsBusy (D-094)`); }
  // (5) o homem da ordem secreta (secrets.js: a testemunha a calar, o inquérito) só vai seguir alguém quando o Vg.busy deixa,
  // nas três linhas depois do afazer — a ordem tirava um amotinado da praça, e a convocação o levava (L-456)
  const se = src['secrets.js'] || [];
  se.forEach((l, k) => { if (/type:\s*'stalk'/.test(l) && !/Vg\.busy\(/.test(se.slice(k, k + 4).join('\n'))) fails.push(`mãos ocupadas: secrets.js:${k + 1} o homem da ordem vai seguir alguém sem perguntar ao Vg.busy (D-094, L-456): ${l.trim().slice(0, 100)}`); });
  // (6) a tripulação de uma viagem (expeditions.js, o free() de quem pode ir) não leva mãos ocupadas — o Vg.handsBusy, no corpo
  // do free(): a carga com destino ia a bordo (L-458)
  const ex = src['expeditions.js'] || []; const xf = ex.findIndex(l => /^\s*function free\(v, f, o\)/.test(l));
  if (xf < 0) fails.push('mãos ocupadas: expeditions.js sem o function free(v, f, o) — quem a viagem leva pergunta ao Vg.handsBusy (L-458)');
  else if (!/Vg\.handsBusy\(/.test(ex.slice(xf, xf + 14).join('\n'))) fails.push(`mãos ocupadas: expeditions.js:${xf + 1} o free() da tripulação não pergunta ao Vg.handsBusy (D-094, L-458)`);
  // (7) a viagem não tira ninguém do refúgio da caverna (L-459): o free() da tripulação, a volta ao cais «quando o susto
  // passa» (L-367, o setTask 'cais' com job 'wait' do laço da tripulação) e as crianças da colônia (a segunda regra do
  // X.colony, que não passa pelo free()) perguntam ao hiding(v) — e as duas linhas têm de estar lá para a regra as ler
  if (xf >= 0 && !/hiding\(v\)/.test(ex.slice(xf, xf + 4).join('\n'))) fails.push(`o susto: expeditions.js:${xf + 1} o free() da tripulação não pergunta ao hiding(v) — quem se esconde na caverna é escolhido para a viagem (L-459)`);
  let back7 = 0, kids7 = 0;
  ex.forEach((l, k) => {
    if (/for \(const v of crew\) if \(/.test(l) && /type: 'cais'.*job: (?:'wait'|quayJob\()/.test(l)) { back7++; if (!/hiding\(v\)/.test(l)) fails.push(`o susto: expeditions.js:${k + 1} a volta da tripulação ao cais não espera o refúgio da caverna (hiding(v), L-459): ${l.trim().slice(0, 100)}`); }
    if (/const members = .*free\(v, f, \{ minAge: 2/.test(l)) { kids7++; if (!/v\.age < 16[^|]*hiding\(v\)/.test(l)) fails.push(`o susto: expeditions.js:${k + 1} a colônia escolhe criança escondida no refúgio da caverna (a segunda regra sem o hiding(v), L-459): ${l.trim().slice(0, 100)}`); }
  });
  if (!back7) fails.push('o susto: expeditions.js sem o laço da volta da tripulação ao cais (L-367) — a regra 38 (7) não acha onde ele pergunta ao hiding(v)');
  if (!kids7) fails.push('o susto: expeditions.js sem a escolha dos colonos do X.colony (const members = … free(v, f, { minAge: 2 …) — a regra 38 (7) não acha onde as crianças perguntam ao hiding(v)'); }
// 38 (10). o adeus de uma viagem (expeditions.js, os parentes da tripulação e o governante descendo ao cais, 2,4) é um chamado
// de fora: não tira ninguém da cama (L-661) nem do meio de uma operação (L-678) — na linha do setTask 'adeus' ou nas duas antes
// dela, a escolha pergunta ao Vg.busy e ao sono
{ const ex = src['expeditions.js'] || []; let n = 0;
  ex.forEach((l, k) => { if (!/G\.Vg\.setTask\(.*type:\s*'adeus'/.test(l)) return; n++; const near = ex.slice(Math.max(0, k - 2), k + 1).join('\n');
    if (!/Vg\.busy\(/.test(near) || !/sleeping/.test(near)) fails.push(`mãos ocupadas: expeditions.js:${k + 1} o adeus da viagem chama sem perguntar ao Vg.busy e ao sono (L-661, L-678): ${l.trim().slice(0, 100)}`); });
  if (!n) fails.push('mãos ocupadas: expeditions.js sem o setTask do adeus — a regra 38 (10) não acha onde ele pergunta ao Vg.busy (L-678)'); }
// 38 (8). as escolhas da guerra não levam mãos ocupadas (L-461): a leva (wars.js, o laço dos candidatos do mobilize), o bando
// por terra (war.js, Wr.launch), a tripulação do ataque pelo mar (naval.js, pickCrew), a da frota e o almirante (fleets.js,
// o pool do manShips e os candidatos do form) perguntam ao Vg.handsBusy — o chamado não espera, mas a escolha é feita antes
{ const at = (f, rx, n, what) => { const L = src[f] || []; const k = L.findIndex(l => rx.test(l)); if (k < 0) { fails.push(`mãos ocupadas: ${f} sem ${what} — a regra 38 (8) não acha a escolha (L-461)`); return; } if (!/Vg\.handsBusy\(/.test(L.slice(k, k + n).join('\n'))) fails.push(`mãos ocupadas: ${f}:${k + 1} ${what} escolhe sem perguntar ao Vg.handsBusy (D-094, L-461): ${L[k].trim().slice(0, 100)}`); };
  at('wars.js', /keep\.has\(v\.id\) \|\| !canServe\(v\)/, 1, 'a leva (os candidatos do mobilize)');
  at('war.js', /Wr\.launch = function/, 20, 'o bando por terra (Wr.launch)');
  at('naval.js', /^\s*function pickCrew\(/, 8, 'a tripulação do ataque pelo mar (pickCrew)');
  at('fleets.js', /^\s*const pool = \[\.\.\.S\.villagers\.values\(\)\]\.filter\(/, 1, 'a tripulação da frota (o pool do manShips)');
  at('fleets.js', /^\s*const cands = \[\.\.\.S\.villagers\.values\(\)\]\.filter\(.*v\.age >= 24/, 1, 'o almirante da frota (os candidatos do form)');
  // 38 (9). o mercador de uma caravana (trade.js, o launch; politics.js, o considerTrade) é escolhido com as mãos livres, e a
  // conversa só para quem ouve (o namoro, a visita: villagers.js) fora da perna de uma operação — a caravana levou o ator do
  // palco, e um namoro o construtor do caminho do armazém (L-508)
  at('trade.js', /^\s*let m = null;/, 4, 'o mercador da caravana (o launch)');
  at('politics.js', /^\s*let tr = null;/, 2, 'o mercador da troca entre povos (o considerTrade)');
  at('villagers.js', /setTask\(o, \{ type: 'talk', id: v\.id/, 1, 'a conversa que para quem ouve (o namoro, a visita)'); }
// 40. "quem a cidade manda embora" (L-440): a escolha dos fundadores de uma vila nova (village.js V.pickFounders), a dos
// colonos de um navio (expeditions.js X.colony) e a de quem vai morar com o outro povo num casamento real (politics.js
// royalMarriage) perguntam ao G.Vg.canSend — nunca o corpo do deus, o preso, o soldado, o emissário, quem está no meio de algo
{ const need = [['village.js', /^\s*V\.pickFounders = function \(/, 'dos fundadores'], ['expeditions.js', /^\s*X\.colony = function \(/, 'dos colonos'], ['politics.js', /^\s*function royalMarriage\(/, 'do casamento real']];
  for (const [f, rx, what] of need) {
    const L = src[f] || []; const i = L.findIndex(l => rx.test(l));
    if (i < 0) { fails.push(`quem vai embora: ${f} sem a escolha ${what} (${rx.source}) — L-440`); continue; }
    if (!/G\.Vg\.canSend\(/.test(L.slice(i, i + 30).join('\n'))) fails.push(`quem vai embora: ${f}:${i + 1} a escolha ${what} não pergunta ao G.Vg.canSend (L-440)`);
  }
}
// 41. "a reta de água é uma só" (L-075, L-477): se um navio vai reto a um ponto, quem diz que a reta é toda água é a caminhada
// pela grade do naval.js (G.Naval.losWater: cada casa que a reta cruza) — pontos a cada tanto de casa pulam a quina da terra que
// a reta só raspa: a frota posta no bloqueio mandava um navio à vaga dele por cima de uma ponta de terra. Nenhum módulo testa a
// água de uma reta por pontos, e uma reta de água de outro arquivo (losW…) só pergunta ao Nv.losWater
for (const f of Object.keys(src)) {
  (src[f] || []).forEach((l, k) => {
    if (/Math\.hypot\([^)]*\)\s*\/\s*0\.\d+\)/.test(l) && /T\.SEA/.test(l) && /for \(let k = [01]; k <= n; k\+\+\)/.test(l)) fails.push(`a reta de água: ${f}:${k + 1} testa a água de uma reta por pontos — pergunte ao G.Naval.losWater (L-477)`);
    if (f !== 'naval.js' && /function losW\w*\s*\(|const losW\w*\s*=/.test(l) && !/losWater\(/.test(l)) fails.push(`a reta de água: ${f}:${k + 1} uma reta de água que não pergunta ao Nv.losWater (L-477)`);
  });
}
// 42. "o degrau é do village.js" (D-106): o degrau da escada de um prédio (b.esc) — e com ele o lote, b.w = b.h = n — só o
// js/village.js escreve, na fundação (V.addBuilding) e na ampliação; quem quer saber o degrau pergunta ao G.Escala.of
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.esc\s*=(?!=)/.test(c)) fails.push(`degrau: ${f}:${k + 1} escreve o degrau de um prédio (b.esc) fora de village.js (D-106): ${l.trim().slice(0, 110)}`); });
// 43. "a escala é pura" (D-106): o js/escala.js lê o mundo para escolher o degrau e não escreve nada nele — nem prédio, nem
// cidade, nem povo, nem o estado — e não tira de acaso nenhum: a mesma cidade escolhe o mesmo degrau
(src['escala.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (ANY_CHANCE.test(c) || /Math\.random\s*\(/.test(c) || /\b(G\.S|S|b|set|f|v)\.\w+(\.\w+)*\s*(=(?!=)|\+=|-=|\+\+|--)|\b(G\.S|S)\.\w+\.(push|splice|set|delete)\(/.test(c)) fails.push(`escala: escala.js:${k + 1} a escala tira do acaso ou escreve no mundo (D-106): ${l.trim().slice(0, 110)}`); });
// 44. "o deus desenha o prédio do tamanho dele" (D-106, D-113): fora do art.js e do arch.js, toda chamada de Art.building /
// Arch.building passa o lote (o sexto argumento, b.w) — sem ele, um degrau grande sairia com o desenho do tamanho clássico
// (L-525); a casa velha de uma ampliação (o tipo de antes, `o.type`) fica de fora
for (const f of files) if (f !== 'art.js' && f !== 'arch.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  for (const m of c.matchAll(/\b(?:Art|Arch)\.building\(([^)]*)\)/g)) if (m[1].split(',').length < 6 && !/\bo\.type\b/.test(m[1])) fails.push(`deus: ${f}:${k + 1} o desenho de um prédio sem o lote dele (b.w — D-106): ${l.trim().slice(0, 110)}`); });
// 45. "todo arquivo se lê": cada arquivo do jogo é JavaScript que o navegador aceita — um erro de sintaxe (um comentário que
// engoliu o fim de uma linha, uma chave a mais) derruba o arquivo inteiro na hora de carregar, e só a vida curta o veria
for (const f of files) { try { new (require('vm').Script)(src[f].join('\n'), { filename: f }); } catch (e) { fails.push(`sintaxe: ${f}: ${String(e.message).slice(0, 110)}`); } }
// 46. "as marcas do quadro numa pessoa são do desenho" (L-589): o povo com que o deus a veste (v._civ), a cor do povo (v._fc),
// a coroa (v._ruler) e o bebê no colo desenhado (v.babyOn) o quadro escreve a cada vez, e o save os tira; fora do que só se vê
// (a lista LOOK da regra 3) e dos desenhos que moram num módulo do mundo (MARK_OK), ninguém os lê — o mundo pergunta ao mundo
// (G.Fac.civOfV, G.Fac.idOfV): a jura lia o v._civ, e quem vivia entre outro povo jurava por outros deuses com e sem quadros
const MARK_OK = [['army.js', "const civ = v._civ || 'classico'; const fc = v._fc || '#8a3a2a';"]];
for (const f of files) if (!LOOK.includes(f)) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.(_civ|_fc|_ruler|babyOn)\b(?!\s*=(?!=))/.test(c) && f !== 'save.js' && !ok(MARK_OK, f, l)) fails.push(`marca do quadro: ${f}:${k + 1} um módulo do mundo lê uma marca que só o quadro escreve (v._civ, _fc, _ruler, babyOn — L-589): ${l.trim().slice(0, 110)}`); });
// 47. "a retirada tem uma porta só" (L-647, L-648): a marca de um bando que recua (b.retreat) só a porta G.War.retreat escreve
// (war.js) — ela põe o bando de volta para casa e avisa o exército na hora, para o save guardar a retirada —; o load, que refaz o
// bando de um exército em campo a partir da fase dele (wars.js, resume), é a única outra escrita. As cinco regras que mandam
// recuar (as perdas do bando, a debandada da hoste, o campeão que cai, o cerco levantado, a fome) chamam a porta
const RETREAT_OK = [['wars.js', "b.retreat = a.phase === 'retirada';"]];
for (const f of files) if (f !== 'war.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.retreat\s*=(?!=)/.test(c) && !ok(RETREAT_OK, f, l)) fails.push(`retirada: ${f}:${k + 1} escreve a marca de retirada de um bando fora da porta G.War.retreat (L-647): ${l.trim().slice(0, 110)}`); });
// 48. "o efeito não tira do acaso do mundo" (L-652): num módulo do mundo, o que vai dentro de uma chamada de efeito (G.FX.*,
// G.Audio.at, G.Audio.play) e o sorteio que só decide se o efeito sai («if (sorteio) <só efeitos>») vêm do acaso do que só se
// vê (G.VR, vrr, vri, vpick, vchance). O sorteio que decide o mundo e também respinga (o bote da cobra, o peixe fisgado) fica:
// ali o «if» faz mais do que o efeito. Sem isto, um caminho sem o G.FX faria outro mundo com a mesma semente
const WRND = /\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\()/;
const closeP = (s, i) => { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')' && --d === 0) return j; } return -1; };
const EFF = /\s*(?:G\.(?:FX|Audio) && )?(?:G\.FX\.[A-Za-z]+ && )?G\.(?:FX\.[A-Za-z]+|Audio\.(?:at|play))\(/y;
const effEnd = (s, i) => { EFF.lastIndex = i; if (!EFF.exec(s)) return -1; let e = closeP(s, EFF.lastIndex - 1); if (e < 0) return -1; e++; if (s[e] === ';') e++; return e; };
for (const f of files) if (!LOOK.includes(f)) src[f].forEach((l, k) => { if (!l.includes('G.FX') && !l.includes('G.Audio')) return; const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  for (const m of c.matchAll(/G\.(?:FX\.[A-Za-z]+|Audio\.(?:at|play))\(/g)) { const a = m.index + m[0].length - 1, b = closeP(c, a);
    if (b > a && WRND.test(c.slice(a, b + 1))) fails.push(`acaso do efeito: ${f}:${k + 1} o que vai dentro de uma chamada de efeito tira do acaso do mundo (use G.VR, vrr, vri, vpick — L-652): ${c.slice(m.index, m.index + 110)}`); }
  for (const m of c.matchAll(/\bif \(/g)) { const a = m.index + m[0].length - 1, b = closeP(c, a); if (b < 0 || !WRND.test(c.slice(a, b + 1))) continue;
    let j = b + 1, only = false; const blk = /\s*\{/y; blk.lastIndex = j;
    if (blk.exec(c)) { j = blk.lastIndex; let n = 0; for (let e; (e = effEnd(c, j)) >= 0;) { j = e; n++; } const end = /\s*\}/y; end.lastIndex = j; if (n && end.exec(c)) { only = true; j = end.lastIndex; } }
    else { const e = effEnd(c, j); if (e >= 0) { only = true; j = e; } }
    if (only && !/^\s*else\b/.test(c.slice(j))) fails.push(`acaso do efeito: ${f}:${k + 1} um sorteio do mundo só decide se um efeito sai (use G.VR / G.vchance — L-652): ${c.slice(m.index, m.index + 110)}`); } });
// 49. "um bicho sai do mundo por uma porta só" (L-656): quem tira um bicho de S.animals é o animals.js (a porta A.remove, que
// avisa as histórias na hora quando o bicho estava vivo, e a limpeza dos corpos), o caves.js (quem dorme na toca ou se abriga
// da chuva fica na lista da caverna — G.Caves.guest o acha) e o save.js (o load refaz a lista). Os outros chamam G.Animals.remove
for (const f of files) if (!['animals.js', 'caves.js', 'save.js'].includes(f)) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\banimals\.delete\(/.test(c)) fails.push(`bicho fora da porta: ${f}:${k + 1} tira um bicho de S.animals sem passar por G.Animals.remove (L-656): ${l.trim().slice(0, 110)}`); });
// 50. "a vida do bairro entra por uma porta só, e só o mundo a abre" (Bairros Vivos): a atividade real do dia entra no bairro
// por G.Urban.note / noteB (e a morte, por G.Urban.mourn; a cidade que acaba, por G.Urban.remember) — chamadas só de dentro
// do passo do mundo: o que só se vê ou se ouve (a lista LOOK da regra 3) e o 3D nunca as chamam, e ninguém fora do urban.js
// escreve as contagens do dia (S.urbAcc), a vida (d.vida), os perfis (d.tags, d.tp) nem a memória (S.urbPast). Quem só lê
// pergunta por G.Urban.at, G.Urban.profile, G.Urban.is, G.Urban.wholeOf, G.Urban.pastAt
const LIFE_3D = ['realm3d.js', 'build3d.js', 'people3d.js', 'fx3d.js', 'cam3d.js', 'incui.js', 'input3d.js', 'modes.js', 'props3d.js'];
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if ((LOOK.includes(f) || LIFE_3D.includes(f)) && /Urban\.(note|noteB|mourn|remember)\s*\(/.test(c)) fails.push(`vida do bairro: ${f}:${k + 1} o que só se vê ou se ouve abre a porta da vida do bairro (G.Urban.note): ${l.trim().slice(0, 110)}`);
  if (f !== 'urban.js' && (/\.urbAcc\b(?!\s*(\|\||&&|\)|;|,|$))/.test(c) && /\.urbAcc\s*(\[[^\]]*\])?(\.[a-zA-Z_]+)?\s*(=(?!=)|\+=|-=)/.test(c))) fails.push(`vida do bairro: ${f}:${k + 1} escreve as contagens do dia fora do urban.js: ${l.trim().slice(0, 110)}`);
  if (f !== 'urban.js' && /\.(vida|tags|tp)\s*(\[[^\]]*\])?\s*(=(?!=)|\+=|-=)/.test(c) && /\b(d|q|w|bairro|urb)\.(vida|tags|tp)\b/.test(c)) fails.push(`vida do bairro: ${f}:${k + 1} escreve a vida ou os perfis de um bairro fora do urban.js: ${l.trim().slice(0, 110)}`);
  if (f !== 'urban.js' && /\.urbPast\s*(=(?!=)|\.push|\.splice|\.shift)/.test(c)) fails.push(`vida do bairro: ${f}:${k + 1} escreve a memória dos bairros fora do urban.js: ${l.trim().slice(0, 110)}`); });
// 51. "o G.Atmos só lê, sem acaso nenhum" (Bairros Vivos, BV-4 — D-162 a D-165): o js/atmos.js é a fonte única do que a vista
// do deus e o 3D mostram do que acontece (o fogo sob a fumaça, a luz atrás da janela, o que há em volta de um prédio, o
// desgaste, o que a roupa lê do mundo). Por isso, fora dos comentários: não tira de acaso nenhum (G.R, rr, ri, pick, chance;
// G.VR e os seus; Math.random) — a mesma pergunta ao mesmo mundo tem a mesma resposta —; não escreve campo nenhum de pessoa,
// prédio, povo, cidade, operação ou do estado (v., b., f., s., h., q., op., set., S. seguidos de uma atribuição); e não abre
// porta nenhuma que muda o mundo (G.Depot.move/make/use…, G.Act.start/end…, setTask, Vg.give, Urban.note)
{ const f = 'atmos.js'; if (!src[f]) fails.push('atmos: js/atmos.js não existe — a regra 51 não acha a fonte do que se vê');
  else src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`atmos: ${f}:${k + 1} o G.Atmos tira de um acaso (a resposta tem de ser a mesma para o mesmo mundo): ${l.trim().slice(0, 110)}`);
    if (/\b(v|b|f|s|h|q|op|set|S|G\.S)\.[A-Za-z_]+(\[[^\]]*\])?(\.[A-Za-z_]+)*\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`atmos: ${f}:${k + 1} o G.Atmos escreve no mundo (ele só lê): ${l.trim().slice(0, 110)}`);
    if (WORLD_WRITE.test(c) || /\b(setTask|Vg\.give|Urban\.(note|noteB|mourn|remember)|Naval\.(board|unboard)|touchWalk)\s*\(/.test(c)) fails.push(`atmos: ${f}:${k + 1} o G.Atmos abre uma porta que muda o mundo: ${l.trim().slice(0, 110)}`); }); }
// 52. "o que se vê tem causa" (D-162, D-163, D-164): (1) a fumaça de um telhado e a luz de uma janela só saem perguntando ao
// G.Atmos — no 3D pelo F3.smokeRate (G.Atmos.fire) e pelo F3.doorLit (G.Atmos.lit), os vidros pelo paneSet do build3d.js
// (At.lit), na vista do deus pelo R.smokeOf (G.Atmos.fire) e pelo R.windowLit (G.Atmos.lit) —, e os laços que soltam a fumaça
// e acendem a janela passam por essas portas: uma tabela por tipo de prédio fazia a forja parada fumar e a casa dormindo
// brilhar; (2) o que há em volta de um prédio vem do G.Atmos.about (props3d.js: aboutOf) — a lenha só com `A.wood`; (3) a
// roupa é escolhida pelo id da pessoa: do começo do outfitOf ao fim dele, o people3d.js não tira de acaso nenhum, e o que
// ela lê do mundo vem do G.Atmos.dress (P3.dressOf), que entra na assinatura do cache (D.code)
{ const need = (f, rx, what) => { if (!(src[f] || []).some(l => rx.test(l.replace(/(^|\s)\/\/\s.*$/, '')))) fails.push(`o que se vê: ${f} sem ${what} — a regra 52 não acha a pergunta ao G.Atmos`); };
  const body = (f, start, end) => { const L = src[f] || []; const a = L.findIndex(l => start.test(l)); if (a < 0) return null; let b = L.findIndex((l, k) => k > a && end.test(l)); if (b < 0) b = L.length; return L.slice(a, b + 1).map(l => l.replace(/(^|\s)\/\/\s.*$/, '')); };
  const within = (f, start, end, rx, what) => { const B = body(f, start, end); if (!B) fails.push(`o que se vê: ${f} sem ${what} — a regra 52 não acha a porta`); else if (!B.some(l => rx.test(l))) fails.push(`o que se vê: ${f}: ${what} não pergunta ao G.Atmos (${rx.source.slice(0, 40)})`); };
  within('fx3d.js', /F3\.smokeRate = function/, /^  \};/, /G\.Atmos\.fire\(b\)/, 'F3.smokeRate');
  need('fx3d.js', /F3\.doorLit = b => .*G\.Atmos\.lit\(b\)/, 'F3.doorLit com G.Atmos.lit');
  need('fx3d.js', /const rate = F3\.smokeRate\(b, /, 'o laço da fumaça pelo F3.smokeRate');
  need('fx3d.js', /if \(nightK > 0\.05 && b\.built && F3\.doorLit\(b\)\)/, 'a luz da porta pelo F3.doorLit');
  need('render.js', /R\.smokeOf = b => .*G\.Atmos\.fire\(b\)/, 'R.smokeOf com G.Atmos.fire');
  need('render.js', /R\.windowLit = b => .*G\.Atmos\.lit\(b\)/, 'R.windowLit com G.Atmos.lit');
  need('render.js', /const fr = R\.smokeOf\(b\); if \(!fr\) continue;/, 'o laço das chaminés pelo R.smokeOf');
  need('render.js', /if \(nightF > 0\.15 && R\.windowLit\(b\) && spr\.win\.length\)/, 'as janelas da noite pelo R.windowLit');
  within('build3d.js', /function paneSet\(rec\)/, /^  \}/, /At\.lit\(b\)/, 'paneSet (os vidros)');
  need('build3d.js', /G\.Atmos\.sig\(b, /, 'a assinatura do quadro com G.Atmos.sig');
  need('props3d.js', /const aboutOf = K => \(G\.Atmos && G\.Atmos\.about \? G\.Atmos\.about\(K\.b\)/, 'aboutOf com G.Atmos.about');
  need('props3d.js', /if \(A\.wood\) \{/, 'a lenha só com A.wood');
  (src['props3d.js'] || []).forEach((l, k) => { if (/Build3D\.roles\(/.test(l.replace(/(^|\s)\/\/\s.*$/, ''))) fails.push(`o que se vê: props3d.js:${k + 1} lê os ofícios da casa fora do G.Atmos.about: ${l.trim().slice(0, 110)}`); });
  const O = body('people3d.js', /^  function outfitOf\(v, L, fac\) \{/, /^  \}/);
  if (!O) fails.push('o que se vê: people3d.js sem a função outfitOf — a regra 52 não acha a roupa');
  else { O.forEach(l => { if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\()|Math\.random/.test(l)) fails.push(`o que se vê: people3d.js: a roupa (outfitOf) tira de um acaso — a escolha é pelo id da pessoa (G.hash): ${l.trim().slice(0, 110)}`); });
    if (!O.some(l => /const D = P3\.dressOf\(v\)/.test(l))) fails.push('o que se vê: people3d.js: a roupa (outfitOf) não pergunta ao G.Atmos.dress (P3.dressOf)');
    if (!O.some(l => /const sig = `.*\$\{D\.code\}`/.test(l))) fails.push('o que se vê: people3d.js: a assinatura da roupa (sig) sem o código do que ela lê do mundo (D.code)'); }
  need('art.js', /const D = At\.dress\(v\)/, 'Art.rank com G.Atmos.dress'); }
// 53. "a cena de som só lê" (D-166): o js/audio-src.js decide o que soa e mais nada — não sorteia (nem do acaso do mundo, nem
// do G.VR: a mesma cena para o mesmo mundo e o mesmo ouvido; quem sorteia é o tocador, audio.js), não escreve em pessoa,
// prédio, operação, bairro, navio ou bicho, e não abre porta nenhuma do mundo
src['audio-src.js'].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()/.test(c) || /Math\.random/.test(c)) fails.push(`som: audio-src.js:${k + 1} a cena de som sorteia (a cena é função do mundo e do ouvido; quem sorteia é o tocador, audio.js, do G.VR): ${l.trim().slice(0, 110)}`);
  if (/Urban\.(note|noteB|mourn|remember)\s*\(/.test(c) || /\b(Depot|D)\.(move|make|use|swap|store)\s*\(/.test(c) || /\bAct\.(start|end|join|leave|begin|commit|abort|pause|resume)\s*\(/.test(c) || /\b(setTask|endTask|Vg\.give)\s*\(/.test(c)) fails.push(`som: audio-src.js:${k + 1} a cena de som abre uma porta do mundo: ${l.trim().slice(0, 110)}`);
  if (/\b(v|b|op|q|s|a|set|f|S|G\.S|t)\.[A-Za-z_$][\w$]*(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\*=|\+\+|--)/.test(c)) fails.push(`som: audio-src.js:${k + 1} a cena de som escreve no mundo (v, b, op, q, s, a, set, f, S, t são as coisas do mundo neste arquivo; os objetos da cena chamam-se o, h, L): ${l.trim().slice(0, 110)}`);
});
// 54. "todo gesto tem a sua linha de som" (D-166): todo gesto registrado no código — uma chave do A.ANIM do activity.js, um
// A.addAnim('nome', …), um A.ANIM.nome = { — tem uma linha com o mesmo nome na tabela A.GESTO do audio-src.js: um som da
// biblioteca, ou still('…'), o silêncio dito de propósito
{ const gestos = new Set(); const all = files.map(f => src[f].join('\n')).join('\n');
  for (const m of all.matchAll(/\baddAnim\('([A-Za-z]\w*)'/g)) gestos.add(m[1]);
  for (const m of all.matchAll(/\bA\.ANIM\.([A-Za-z]\w*)\s*=\s*\{/g)) gestos.add(m[1]);
  const tab = /A\.ANIM = \{([\s\S]*?)\n  \};/.exec(src['activity.js'].join('\n')); if (tab) for (const m of tab[1].matchAll(/^\s{4}([A-Za-z]\w*):\s*\{/gm)) gestos.add(m[1]);
  const som = /A\.GESTO = \{([\s\S]*?)\n  \};/.exec(src['audio-src.js'].join('\n')); const linhas = new Set(); if (som) for (const m of som[1].matchAll(/^\s{4}([A-Za-z]\w*):/gm)) linhas.add(m[1]);
  for (const g of gestos) if (!linhas.has(g)) fails.push(`som: o gesto «${g}» não tem linha na tabela gesto→som (A.GESTO, audio-src.js): um som da biblioteca, ou still('…') — o silêncio dito de propósito`);
}
// 55. "o que o personagem sabe": o registro do que a pessoa viveu nas mãos do deus (v.ken) só o possess.js escreve — pelo
// Po.meet / Po.dealt e pelo passo do corpo —; os outros perguntam ao G.Possess.knows (D-170)
const KEN_WRITE = /\.ken\s*=(?!=)|\.ken\.(p|q)\s*=(?!=)|\.ken\.(p|q)\.(push|unshift|splice|shift|pop|sort|reverse)\(/;
for (const f of files) if (f !== 'possess.js') src[f].forEach((line, k) => {
  if (KEN_WRITE.test(line)) fails.push(`sabe: ${f}:${k + 1} escreve o registro do que a pessoa sabe (.ken) fora de possess.js: ${line.trim().slice(0, 110)}`); });
// 56. "a tela do corpo pergunta à porta" (D-171, D-172): nas telas do corpo, as moedas de uma casa e o nome de um bairro só
// saem numa linha que pergunta ao G.Possess.knows; e um encontro só se pede ao mundo (Possess.apply) ou no feito (activity.js)
const BODY_SCREEN = ['incui.js', 'interact.js', 'diario-ui.js'];
const ASKS = /\bknows\.|\bK\.(house|stock|person|name|call|town|district|where|how)\(/;
// (a linha, ou uma das 8 antes dela, abre um G.Possess.apply( — o encontro do interact.js fica 6 linhas depois dele)
const inApply = (f, k) => { for (let j = k; j >= Math.max(0, k - 8); j--) if (/\bPossess\.apply\(/.test(src[f][j])) return true; return false; };
for (const f of files) src[f].forEach((line, k) => {
  if (BODY_SCREEN.includes(f) && /\.coin\b|\.district\b|districtAt\(|Urban\.at\(/.test(line) && !ASKS.test(line) && !/^\s*\/\//.test(line)) fails.push(`sabe: ${f}:${k + 1} a tela do corpo lê moedas ou um bairro sem perguntar ao G.Possess.knows: ${line.trim().slice(0, 110)}`);
  if (/\bPossess\.meet\(/.test(line) && !['possess.js', 'activity.js'].includes(f) && !inApply(f, k)) fails.push(`sabe: ${f}:${k + 1} pede um encontro fora do passo do mundo (G.Possess.apply): ${line.trim().slice(0, 110)}`); });
// 57. "a obra grande da vez é do planejador" (D-174): a marca da obra grande que guarda a pedra do povo (set.gw) só o
// js/village.js escreve (o planejador, cada vez que planeja a cidade); quem gasta a pedra do povo no que nunca acaba (calçar, a
// carroça do comércio, melhorar uma casa) pergunta a V.stoneSpare; quem quer saber da obra, a V.keeps / V.stoneKept /
// V.quarries. (o «X.gw» do build3d.js é o chão da forma no 3D, outra coisa)
const GW_OK = [['build3d.js', 'X.gw = gw;']];
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.gw\s*=(?!=)/.test(c) && !ok(GW_OK, f, l)) fails.push(`obra grande: ${f}:${k + 1} escreve a obra grande da vez (set.gw) fora de village.js (D-174): ${l.trim().slice(0, 110)}`); });
// 58. "a casa rica é da família" (D-177, T-447): o degrau da família (G.Escala: «familia») só o js/act-casa.js pede — o
// planejador, o social.js e o trade.js nunca erguem uma casa rica; a família a encomenda e a paga pelo livro (K.orderRich)
for (const f of files) if (f !== 'act-casa.js' && f !== 'escala.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/familia\s*:\s*true/.test(c)) fails.push(`casa rica: ${f}:${k + 1} pede o degrau da família fora de act-casa.js (D-177): ${l.trim().slice(0, 110)}`); });
// 59. "o quintal é o mesmo a cada desenho" (Bairros Vivos — D-186): o js/props3d.js não tira de acaso nenhum — nem do mundo
// (G.R, rr, ri, pick, chance, shuffle), nem do que só se vê (G.VR e os seus), nem Math.random. O que há em volta de um prédio
// sai do mundo (G.Atmos.about) e onde cada coisa fica e de que tamanho é, do id do prédio (K.hv, G.hash): a mesma casa
// mantém a cara, o quadro refeito é o mesmo de antes, e o save no meio não muda nada (qa/quintal.js q6)
(src['props3d.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`quintal: props3d.js:${k + 1} tira de um acaso (o que há em volta de um prédio é do mundo e do id dele — K.hv, G.hash): ${l.trim().slice(0, 110)}`); });
// 60. "as coisas em volta ficam no próprio lote, fora do caminho" (D-186): no js/props3d.js, (1) as faixas de um prédio
// desenhado pela planta saem da casca — o `slots` passa pelo `shellSlots`, que lê o `shellOf` do Build3D e conta, lado a lado,
// a face de fora mais perto da beira do lote (a casca, os anexos, a cerca do terreiro, as escadas de fora); (2) as portas e os
// portões cortam a faixa (`cut.push([uc - h.w / 2 - 0.65, …`) e os degraus postos pelo Build3D também (`K.steps`); (3) o que
// é fino fica livre das janelas (`fit`, com `s.wins`) e de pé na soleira da fundação (`if (s.thin) y = LEDGE`), nunca mais
// fundo que a faixa (`run.d - 0.02`); (4) a assinatura do quadro só conta o que há em volta onde o desenho tem lugar
// (`P3.yardOf`: pelas faixas do último desenho, `yard.get(b.id) > 0`, e antes dele pela casca, `roomBy`); (5) e nada de
// `K.b.… =`: o desenho não escreve no prédio
{ const need = (rx, what) => { if (!(src['props3d.js'] || []).some(l => rx.test(l.replace(/(^|\s)\/\/\s.*$/, '')))) fails.push(`quintal: props3d.js sem ${what} — a regra 60 não acha o lugar das coisas`); };
  need(/if \(B\.shell && !B\.open\) \{ const sl = shellSlots\(K\); if \(sl\) return sl; \}/, 'as faixas da casca (slots → shellSlots)');
  need(/const S = B3 && B3\.shellOf \? B3\.shellOf\(K\.b\) : null;/, 'a casca lida do Build3D (shellOf)');
  need(/for \(const a of sh\.annex \|\| \[\]\) solids\.push\(/, 'os anexos entre as faces de fora');
  need(/if \(sh\.yard\) solids\.push\(\{ r: sh\.yard\.r, k: 'fence' \}\)/, 'a cerca do terreiro entre as faces de fora');
  need(/cut\.push\(\[uc - h\.w \/ 2 - 0\.65, uc \+ h\.w \/ 2 \+ 0\.65\]\)/, 'o corte das portas e dos portões');
  need(/const treads = \(K\.steps \|\| \[\]\)\.map\(/, 'os degraus postos pelo Build3D (K.steps)');
  need(/if \(n\[1\] > n0 && n\[0\] < n1 && a\[1\] > run\.u0 && a\[0\] < run\.u1\) cut\.push\(/, 'o corte dos degraus');
  need(/const bad = a => s\.wins\.some\(w => w\[2\] < hgt && a < w\[1\] && a \+ l > w\[0\]\);/, 'o que é fino livre das janelas (fit)');
  need(/depth = Math\.min\(THIN_MAX, run\.d - 0\.02\); thin = true;/, 'o que é fino nunca mais fundo que a faixa');
  need(/if \(s\.thin\) y = LEDGE;/, 'o que é fino de pé na soleira da fundação');
  need(/P3\.yardOf = b => !!KIND\[b\.type\] && \(!\(G\.Build3D && G\.Build3D\.shellOf && G\.Build3D\.shellOf\(b\)\) \|\| \(yard\.has\(b\.id\) \? yard\.get\(b\.id\) > 0 : roomBy\(b\)\)\);/, 'a assinatura só onde o desenho tem lugar (P3.yardOf)');
  (src['props3d.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bK\.b\.[A-Za-z_]+(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`quintal: props3d.js:${k + 1} escreve no prédio que desenha (o desenho só lê): ${l.trim().slice(0, 110)}`); }); }
// 61. "o aluguel de uma casa só a casa faz" (D-159): a marca de que a família de uma casa paga aluguel ao dono (b.aluga) só o
// act-casa.js escreve — o dia da cidade a faz e a desfaz, e quem muda os moradores de uma casa de dono que mora noutra (a
// família que vende a casa cara a quem morava de aluguel, social.js) pede-a na hora pela porta G.Casa.lease, com a mesma regra:
// o parente do dono não paga. (As regras 51 a 60 são das frentes dos Bairros Vivos que correm em paralelo)
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.aluga\s*=(?!=)/.test(c)) fails.push(`aluguel: ${f}:${k + 1} escreve o aluguel de uma casa fora do act-casa.js (use G.Casa.lease — D-159): ${l.trim().slice(0, 110)}`); });
// 64. "o tabuleiro da ponte é o dos pés" (D-190, D-191, L-860, L-861): o desenho de uma ponte não tem altura sua — o bloco das
// pontes do realm3d.js pega a altura do tabuleiro do G.Space (dk = Sp.deckAt) e não soma ao nível da água outra constante
// que a da face dela (+0,05; a de antes, +0,32, deixava os pés do corpo 15 cm dentro da laje), e os outros pisam onde o corpo
// pisa: numa casa de rio, a groundY do people3d.js responde por G.Space.footAt. (As regras 62 e 63 estão livres)
{ const L = src['realm3d.js'] || []; const a = L.findIndex(l => /^\s*\/\/ -+ the bridges/.test(l)), z = L.findIndex(l => /^\s*\/\/ -+ trees, rocks, bushes/.test(l));
  if (a < 0 || z < a) fails.push('ponte: realm3d.js sem o bloco das pontes (de «the bridges» a «trees, rocks, bushes») — a regra 64 não acha o que guardar');
  else { const blk = L.slice(a, z);
    if (!blk.some(l => /\bdk = Sp\.deckAt\(/.test(l))) fails.push('ponte: realm3d.js — o tabuleiro desenhado não pergunta a altura ao G.Space (dk = Sp.deckAt): L-860');
    blk.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/S\.wl\[[^\]]*\]\s*\*\s*HM\s*\+\s*0\.(?!05\b)\d+/.test(c)) fails.push(`ponte: realm3d.js:${a + k + 1} soma ao nível da água uma altura própria do desenho (a do tabuleiro é a dos pés, G.Space.deckAt — L-860): ${l.trim().slice(0, 110)}`); }); }
  if (!(src['people3d.js'] || []).some(l => /function groundY\(x, y\) \{[^\n]*T\.RIVER\) return G\.Space\.footAt\(x, y\);/.test(l))) fails.push('ponte: people3d.js — a groundY não responde por G.Space.footAt numa casa de rio (os outros pisam onde o corpo pisa: L-861)'); }
// 65. "o dia de uma biblioteca é o do degrau dela" (D-192): o teto do dia da biblioteca clássica (Biblioteca.MAX) só se lê no
// act-lazer.js, e ali só onde se define e onde o degrau o multiplica — quem quer o teto do dia, as cópias ou os copistas de
// um prédio pergunta G.Biblioteca.maxOf(b), maxCopias(b), copistas(b): a grande biblioteca conta o dobro e emprega três. (A
// regra 66 está livre)
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (f !== 'act-lazer.js' && /\bBiblioteca\.MAX\b/.test(c)) fails.push(`biblioteca: ${f}:${k + 1} lê o teto do dia da biblioteca clássica (pergunte G.Biblioteca.maxOf(b) — D-192): ${l.trim().slice(0, 110)}`);
  if (f === 'act-lazer.js' && /\bBi\.MAX\b/.test(c) && !/\bBi\.(MAX|maxOf|maxCopias) =/.test(c)) fails.push(`biblioteca: ${f}:${k + 1} lê Bi.MAX fora de onde ele se define e de onde o degrau o multiplica (use Bi.maxOf(b), Bi.maxCopias(b) — D-192): ${l.trim().slice(0, 110)}`); });
// 67. "a gramática das plantas no save é do interiors.js" (D-198): o save diz a gramática que fez as suas plantas (intG), e só
// o interiors.js o escreve e o lê — num save de antes, todo registro é julgado ao abrir; e a chave da planta leva a gramática
// (':g' + In.VERSION), ou um lugar da planta de antes ficaria nas mãos do corpo depois de uma mudança de gramática. (A regra
// 68 está livre)
for (const f of files) if (f !== 'interiors.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bintG\b/.test(c)) fails.push(`plantas: ${f}:${k + 1} mexe na gramática das plantas do save (intG é do interiors.js — D-198): ${l.trim().slice(0, 110)}`); });
if (!(src['interiors.js'] || []).some(l => /const planKey = /.test(l) && l.includes("':g' + In.VERSION"))) fails.push("plantas: interiors.js — a chave da planta (planKey) não leva a gramática (':g' + In.VERSION): D-198");
if (fails.length) { console.log(fails.join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
console.log(`PASSOU (${files.length} arquivos)`);
