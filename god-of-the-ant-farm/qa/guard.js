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
  'space.js', 'tex3d.js', 'ground3d.js', 'realm3d.js', 'build3d.js', 'people3d.js', 'fx3d.js', 'dragon3d.js', 'things3d.js', 'grass3d.js', 'cam3d.js', 'input3d.js', 'incui.js', 'diario-ui.js', 'modes.js', 'mesh3d.js', 'mesh-dragao.js', 'mesh-dragao2.js', 'mesh-runa.js', 'mesh-portal.js', 'mesh-empena.js', 'mesh-casco.js', 'mesh-banca.js', 'props3d.js', 'body3d.js', 'bodymesh.js', 'fauna3d.js', 'fauna-anim.js', 'fauna-gesto3d.js', 'fauna-receitas.js', 'faunamesh.js', 'post3d.js', 'int-planta.js', 'atmos.js', 'itemarte.js', /* 20d: */ 'itemforma.js', 'itemicons.js', 'inv-ui.js', /* 20f: */ 'combate-clips.js', 'combate3d.js', 'combate-ui.js']; // (the 3D view of the Modo Encarnado: only seen; the gameplay base's drawing and screens, JOGABILIDADE.md)
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
// (9) nem o mercador de uma caravana, e a conversa não para quem está na perna de uma operação (L-508); (11) nem o grupo de uma
// história leva um companheiro na estrada do meio de uma operação — o foguista de posto (L-791)
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
// de fora: não tira ninguém da cama (L-661) nem do meio de uma operação (L-678), nem quem tem o dia em casa — o doente de cama,
// o velho que cuida dos pequenos, o viúvo de luto: G.Trade.homeBound, como a caravana (L-799) — na linha do setTask 'adeus' ou
// nas duas antes dela, a escolha pergunta ao Vg.busy, ao sono e ao dia em casa
{ const ex = src['expeditions.js'] || []; let n = 0;
  ex.forEach((l, k) => { if (!/G\.Vg\.setTask\(.*type:\s*'adeus'/.test(l)) return; n++; const near = ex.slice(Math.max(0, k - 2), k + 1).join('\n');
    if (!/Vg\.busy\(/.test(near) || !/sleeping/.test(near)) fails.push(`mãos ocupadas: expeditions.js:${k + 1} o adeus da viagem chama sem perguntar ao Vg.busy e ao sono (L-661, L-678): ${l.trim().slice(0, 100)}`);
    if (!/homeBound\(|!home\(/.test(near)) fails.push(`o dia em casa: expeditions.js:${k + 1} o adeus da viagem chama sem perguntar ao G.Trade.homeBound (L-799): ${l.trim().slice(0, 100)}`); });
  if (!n) fails.push('mãos ocupadas: expeditions.js sem o setTask do adeus — a regra 38 (10) não acha onde ele pergunta ao Vg.busy (L-678)'); }
// 38 (11). o grupo de uma história (story-party.js, o bring da estrada, 2,04) não tira o companheiro do meio de uma operação —
// o foguista de posto (L-791): a tarefa 'party' pergunta ao Vg.busy nas três linhas depois de feita, antes de ser dada
{ const sp = src['story-party.js'] || []; let n = 0;
  sp.forEach((l, k) => { if (/^\s*\/\//.test(l) || !/type:\s*'party'/.test(l)) return; n++; const after = sp.slice(k, k + 4).join('\n');
    if (!/Vg\.busy\(/.test(after) || after.indexOf('Vg.busy(') > after.indexOf('setTask(')) fails.push(`mãos ocupadas: story-party.js:${k + 1} o grupo da história leva o companheiro sem perguntar ao Vg.busy (D-094, L-791): ${l.trim().slice(0, 100)}`); });
  if (!n) fails.push("mãos ocupadas: story-party.js sem a tarefa 'party' — a regra 38 (11) não acha onde o grupo da história pergunta ao Vg.busy (L-791)"); }
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
  // (and the doors themselves ask the day at home — in bed with a fever or a bad wound, the old one minding the little ones, the
  // widowed in the first half day of grief: G.Trade.homeBound —: the G.Vg.canSend of villagers.js and the free of a voyage's
  // crew, expeditions.js, in their bodies. A great voyage of Argos took a widow of that morning to its crew, L-819)
  for (const [f, rx, what] of [['villagers.js', /^\s*Vg\.canSend = function \(v\) \{/, 'o G.Vg.canSend'], ['expeditions.js', /^\s*function free\(v, f, o\) \{/, 'o free da tripulação de uma viagem']]) {
    const L = src[f] || []; const i = L.findIndex(l => rx.test(l));
    if (i < 0) { fails.push(`quem vai embora: ${f} sem ${what} (${rx.source}) — a regra 40 não acha a porta (L-819)`); continue; }
    const end = L.findIndex((l, k) => k > i && /^\s{0,2}\};?\s*$/.test(l));
    if (!/G\.Trade\.homeBound\(/.test(L.slice(i, end > i ? end + 1 : i + 25).join('\n'))) fails.push(`quem vai embora: ${f}:${i + 1} ${what} não pergunta ao G.Trade.homeBound — o doente de cama, o velho que cuida dos pequenos, o viúvo de luto (L-819)`);
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
const LIFE_3D = ['realm3d.js', 'build3d.js', 'people3d.js', 'fx3d.js', 'cam3d.js', 'incui.js', 'input3d.js', 'modes.js', 'props3d.js', 'fauna3d.js', 'fauna-anim.js', 'fauna-gesto3d.js', 'fauna-receitas.js'];
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
// 69. "a vontade do banho e da leitura não sorteia" (D-200, D-201): no js/act-servicos.js, do bloco «the wish for a bath» até
// o Te.go, e no js/act-lazer.js, do «the wish to read» até o Bi.go, nenhuma chamada ao acaso do mundo nem ao do que só se vê:
// a sorte do dia de cada um é o G.hash da pessoa e do dia — a mesma dentro e fora do passo, com ou sem gente olhando
for (const [f, de, ate] of [['act-servicos.js', 'the wish for a bath (D-200)', 'Te.go = function'], ['act-lazer.js', 'the wish to read (D-201)', 'Bi.go = function']]) {
  const L = src[f] || []; const i0 = L.findIndex(l => l.includes(de)), i1 = L.findIndex(l => l.includes(ate));
  if (i0 < 0 || i1 < i0) { fails.push(`freguesia: ${f} — não achei o bloco da vontade («${de}» … «${ate}»): a regra 69 não tem o que conferir`); continue; }
  for (let k = i0; k < i1; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance|vshuffle)\(/.test(c)) fails.push(`freguesia: ${f}:${k + 1} sorteia dentro da vontade do banho ou da leitura (a sorte do dia é o G.hash da pessoa e do dia — D-200): ${L[k].trim().slice(0, 110)}`); }
}
// 70. "o dia do banho e da leitura é de quem os dá, e ninguém manda gente a um serviço" (D-200, D-201): v.bathDay só o
// js/act-servicos.js escreve e v.readDay só o js/act-lazer.js (e o save.js, que os devolve); quem vai aos banhos e à
// biblioteca vai pela escolha do dia de cada um (G.Termas.go / G.Biblioteca.go, só do start do js/villagers.js) ou pelo
// passeio — nenhum módulo enche um serviço por fora
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (f !== 'act-servicos.js' && f !== 'save.js' && /\.bathDay\s*=[^=]/.test(c)) fails.push(`freguesia: ${f}:${k + 1} escreve o dia do banho de alguém fora de act-servicos.js (D-200): ${l.trim().slice(0, 110)}`);
  if (f !== 'act-lazer.js' && f !== 'save.js' && /\.readDay\s*=[^=]/.test(c)) fails.push(`freguesia: ${f}:${k + 1} escreve o dia da leitura de alguém fora de act-lazer.js (D-201): ${l.trim().slice(0, 110)}`);
  if (f !== 'villagers.js' && /\b(Termas|Biblioteca)\.go\s*\(/.test(c)) fails.push(`freguesia: ${f}:${k + 1} manda alguém aos banhos ou à biblioteca fora da escolha de cada um (o start de villagers.js — D-200): ${l.trim().slice(0, 110)}`); });
// (as regras 73 e 74 estão guardadas para o ofício que fica)
// 75. "as portas do planejador" (T-767, D-217): G.Village.planNow — o olhar do planejador agora — só as provas e o modo
// desenvolvedor chamam, nada do mundo; e só o village.js aplaina um lote (V.levelLot, de dentro do V.startProject). (O
// G.Space.planNow, a planta feita na hora, é outra porta e fica fora do padrão.)
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if ((f !== 'dev.js' && /\b(Village|V)\.planNow\s*\(/.test(c)) || /\blevelLot\s*\(/.test(c)) fails.push(`planejador: ${f}:${k + 1} chama uma porta do planejador (V.planNow é das provas e do modo desenvolvedor, T-767; V.levelLot é do village.js, D-217): ${l.trim().slice(0, 110)}`); });
// 76. "a carroça da obra é do city.js" (D-215): só o city.js cria uma carroça de obra (Ci.workCart) e só ele escreve o
// relógio dela na cidade (set.cartT, set.cartNo)
for (const f of files) if (f !== 'city.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.cart(T|No)\s*(=(?!=)|-=|\+=)/.test(c) || /\bworkCart\s*\(/.test(c)) fails.push(`carroça da obra: ${f}:${k + 1} mexe na carroça da obra grande fora do city.js (D-215): ${l.trim().slice(0, 110)}`); });
// 71. "os aposentos da sede têm uma porta só" (D-205): as camas da sede de quem governa (BDEF.aposentos) só o js/court.js dá e
// só o js/village.js lê (V.bedsOf: as camas de um prédio onde uma casa mora); quem quer saber se um prédio vale para morar
// pergunta a V.livable, se guarda como casa, a V.bedsOf — e as portas das casas da cidade continuam lendo BDEF.housing
for (const f of files) if (f !== 'village.js' && f !== 'court.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.aposentos\b/.test(c)) fails.push(`sede: ${f}:${k + 1} lê os aposentos da sede fora de village.js (V.bedsOf) e court.js (D-205): ${l.trim().slice(0, 110)}`); });
// 72. "quem mora na sede é do act-casa.js" (D-206): só o js/act-casa.js põe e tira gente da sede de quem governa — a porta
// G.Casa.reign (a cada dois segundos do mundo) e G.Casa.vacate (a sede que cai, é desfeita ou entra em obra) não são chamadas
// de fora dele; quem quer saber pergunta a G.Casa.seatState / lordOf / isSeat / ofCourt (só leem)
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/Casa\.(reign|vacate)\s*\(/.test(c)) fails.push(`sede: ${f}:${k + 1} põe ou tira gente da sede fora de act-casa.js (D-206): ${l.trim().slice(0, 110)}`); });
// 77. "a obra das mãos de uma família é do act-casa.js" (D-222): a marca de que uma casa em obra é levantada pela própria família
// (b.encomenda.maos) só o js/act-casa.js escreve; o js/villagers.js a deixa de fora dos construtores do povo (o buildTask) e
// pergunta por ela no dia de trabalho de cada um (o workTask → G.Casa.handsTask) — sem a primeira linha os construtores a tomam,
// sem a segunda ninguém a levanta
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/encomenda\.maos\s*=(?!=)|encomenda\s*=\s*\{[^}]*\bmaos\s*:/.test(c)) fails.push(`obra das mãos: ${f}:${k + 1} escreve a marca da obra das mãos de uma família fora de act-casa.js (D-222): ${l.trim().slice(0, 110)}`); });
{ const L = (src['villagers.js'] || []).map(l => l.replace(/(^|\s)\/\/\s.*$/, ''));
  if (!L.some(l => /b\.encomenda\s*&&\s*b\.encomenda\.maos\)\s*continue;/.test(l))) fails.push('obra das mãos: villagers.js sem a linha do buildTask que deixa a obra das mãos de uma família de fora dos construtores do povo (D-222)');
  if (!L.some(l => /G\.Casa\.handsTask\s*\(/.test(l))) fails.push('obra das mãos: villagers.js sem a pergunta do dia de trabalho ao G.Casa.handsTask (D-222)'); }
// 78. "a estrada lida não escreve" (D-223): as portas de leitura da casa cheia — K.spare, noHands, K.road, K.roadSays, K.fullSays
// e K.can, no js/act-casa.js — são pedidas pelo diário, pela ficha da casa e pela oferta do corpo, de fora do passo do mundo: não
// buscam lote (a busca sorteia e guarda o dia sem lugar), não fundam, não movem nem pagam, não marcam casa nenhuma
{ const L = src['act-casa.js'] || []; const bad = /findSite\s*\(|startProject\s*\(|addBuilding\s*\(|removeBuilding\s*\(|\bD\.(move|make|use|store)\s*\(|\.(poupa|dono|encomenda|aluga|custo|home|res|maos|chao)\s*=(?!=)|\bG\.(R|rr|ri|pick|chance|shuffle)\s*\(|\b(cede|raiseByHand|lease|buy|raise|move|pay)\s*\(/;
  for (const st of [/^  K\.spare = function/, /^  function noHands\(/, /^  K\.road = function/, /^  K\.roadSays = function/, /^  K\.fullSays = function/, /^  K\.can = function/]) {
    const a = L.findIndex(l => st.test(l)); if (a < 0) { fails.push(`a estrada só lê: act-casa.js sem ${st} — a regra 78 não acha a porta`); continue; }
    let z = a + 1; while (z < L.length && !/^  \};?$/.test(L[z])) z++;
    for (let k = a; k < z; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (bad.test(c)) fails.push(`a estrada só lê: act-casa.js:${k + 1} escreve no mundo dentro de uma porta de leitura (D-223): ${L[k].trim().slice(0, 110)}`); } } }
// 73. "o dia do ofício, o ofício a que se volta e a memória da cidade são do repartidor" (D-210 a D-212): v.roleDay (o dia em que a
// pessoa tomou o ofício), v.roleBack (o ofício de que uma emergência a tirou) e set.ofm (a memória do que cada ofício vem
// pedindo) só o js/village.js escreve — o repartidor (assignJobs, took); o villagers.js só tem os nomes na lista SHAPE
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.(roleDay|roleBack)\s*=[^=]|\.ofm\s*=[^=]|\.ofm\s*\[[^\]]+\]\s*=[^=]/.test(c)) fails.push(`o ofício que fica: ${f}:${k + 1} escreve o dia do ofício, o ofício a que se volta ou a memória da cidade — só o repartidor (village.js) escreve (D-210 a D-212): ${l.trim().slice(0, 110)}`); });
// 74. "o repartidor não sorteia, e o ofício de um adulto só muda por ele ou por uma porta dita" (D-212): (a) no js/village.js, do
// `function took(` até a linha «housing», nenhum sorteio — quem troca é a mão mais nova do ofício (pickHand), e o nome
// pickRoleForList não existe mais; (b) fora do village.js, dar um ofício a uma pessoa (v.role = '…') só nas duas portas ditas:
// o mercado clandestino (economy.js: 'contrabandista') e a mão do deus (miracles.js: 'guerreiro'); 'cativo' é da guerra, e
// G.BDEF.<tipo>.role é o ofício de um prédio, não de uma pessoa
{ const L = src['village.js'] || []; const a = L.findIndex(l => /^\s*function took\(/.test(l)); const z = L.findIndex((l, k) => k > a && /^\s*\/\/ -{10,} housing/.test(l));
  if (a < 0 || z < 0) fails.push('o ofício que fica: village.js sem o `function took(` ou sem a linha «housing» — a regra 74 não acha o repartidor');
  else for (let k = a; k < z; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (/G\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance)\(/.test(c)) fails.push(`o ofício que fica: village.js:${k + 1} sorteia dentro do repartidor de ofícios (D-212): ${L[k].trim().slice(0, 110)}`); }
  for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/pickRoleForList/.test(c)) fails.push(`o ofício que fica: ${f}:${k + 1} chama pickRoleForList, que não existe mais (D-212): ${l.trim().slice(0, 110)}`);
    if (f === 'village.js') return; const m = c.match(/\.role\s*=\s*'([a-z_]+)'/); if (!m || m[1] === 'cativo' || /BDEF\.[A-Za-z_]+\.role\s*=/.test(c)) return;
    if (!((f === 'economy.js' && m[1] === 'contrabandista') || (f === 'miracles.js' && m[1] === 'guerreiro'))) fails.push(`o ofício que fica: ${f}:${k + 1} dá um ofício a uma pessoa — só o repartidor (village.js), o mercado clandestino e a mão do deus (D-212): ${l.trim().slice(0, 110)}`); }); }
// 79. "a conversa da praça é do act-lazer.js, e a vontade dela não sorteia" (D-225, D-226): a tarefa 'praca' só o
// js/act-lazer.js dá (a escolha de cada um — G.Praca.go, só do start do js/villagers.js — e o gancho do save dele); e no
// js/act-lazer.js, do bloco «the plaza at the end of the afternoon» até o Pr.taskText, nenhuma chamada ao acaso do mundo nem
// ao do que só se vê: a sorte do dia, a hora e o lugar de cada um são o G.hash da pessoa e do dia
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (f !== 'act-lazer.js' && /type:\s*'praca'/.test(c)) fails.push(`praca: ${f}:${k + 1} dá a conversa da praça fora de act-lazer.js (D-225): ${l.trim().slice(0, 110)}`);
  if (f !== 'villagers.js' && /\bPraca\.go\s*\(/.test(c)) fails.push(`praca: ${f}:${k + 1} manda alguém à praça fora da escolha de cada um (o start de villagers.js — D-225): ${l.trim().slice(0, 110)}`); });
{ const f = 'act-lazer.js'; const L = src[f] || []; const i0 = L.findIndex(l => l.includes('the plaza at the end of the afternoon (D-225)')), i1 = L.findIndex(l => l.includes('Pr.taskText = function'));
  if (i0 < 0 || i1 < i0) fails.push(`praca: ${f} — não achei o bloco da vontade da praça: a regra 79 não tem o que conferir`);
  else for (let k = i0; k < i1; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance|vshuffle)\(/.test(c)) fails.push(`praca: ${f}:${k + 1} sorteia dentro da vontade da praça (a sorte do dia é o G.hash da pessoa e do dia — D-225): ${L[k].trim().slice(0, 110)}`); } }
// 80. "o banho tem a sua chave, e o posto do foguista segura" (D-227, D-228): a chave «banho» da vida do bairro só o
// js/act-servicos.js nota (a entrada nos banhos, onde ela se fecha), e ele não nota «noite» — o banho de dia não é noite; a
// água da casa pergunta ao posto antes de levar alguém (js/life.js: G.Termas.onDuty), e o posto é a perna da operação do
// foguista (A.hooks.leg, no js/act-servicos.js)
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (f !== 'act-servicos.js' && /Urban\.note(B)?\s*\([^)]*'banho'/.test(c)) fails.push(`banho: ${f}:${k + 1} nota a chave «banho» fora de act-servicos.js (D-228): ${l.trim().slice(0, 110)}`);
  if (f === 'act-servicos.js' && /Urban\.note(B)?\s*\([^)]*'noite'/.test(c)) fails.push(`banho: ${f}:${k + 1} conta o banho como «noite» (a chave dele é «banho» — D-228): ${l.trim().slice(0, 110)}`); });
if (!(src['life.js'] || []).some(l => /Termas\.onDuty\(v\)\)\s*continue;/.test(l))) fails.push('posto: life.js — a escolha de quem busca a água da casa não pergunta ao posto do foguista (G.Termas.onDuty — D-227)');
if (!(src['act-servicos.js'] || []).some(l => /A\.hooks\.leg\.push\(/.test(l) && /Te\.onDuty\(v\)/.test(l))) fails.push('posto: act-servicos.js — o posto do foguista não é perna da operação dele (A.hooks.leg — D-227)');
// (e o passeio vai aos banhos pela porta dele — G.Termas.stroll: com tempo e com lugar, T-919 —, nunca pela das provas)
(src['city.js'] || []).forEach((l, k) => { if (/Termas\.visit\s*\(/.test(l.replace(/(^|\s)\/\/\s.*$/, ''))) fails.push(`passeio: city.js:${k + 1} manda aos banhos pela porta G.Termas.visit, e não pela do passeio (G.Termas.stroll — T-919): ${l.trim().slice(0, 110)}`); });
// 81. "quem escolhe o sítio de uma cidade nova pergunta ao V.keptNear" (D-232): nenhuma cidade nasce a menos de V.RES_CLEAR
// casas de uma capital que guarda campo para uma obra grande. Os arquivos que fundam uma cidade num sítio escolhido — o
// village.js (a expansão por terra), o naval.js (a colônia), o expeditions.js (a expedição), o war.js (o povo que se separa) —
// perguntam; o main.js (o primeiro povoado do mundo) e o events.js (o povoado dos náufragos, que não escolhe) não; um arquivo
// novo que chame addSettlement entra numa das duas listas
{ const ASK = { 'village.js': 1, 'naval.js': 1, 'expeditions.js': 1, 'war.js': 1 }, NOT = { 'main.js': 1, 'events.js': 1 };
  for (const f of files) { const L = src[f].map(l => l.replace(/(^|\s)\/\/\s.*$/, ''));
    if (NOT[f] || !L.some(l => /\baddSettlement\s*\(/.test(l) && !/addSettlement\s*=\s*function/.test(l))) continue;
    if (!ASK[f]) { fails.push(`a cidade nova: ${f} funda uma cidade (addSettlement) e não está entre os que perguntam ao V.keptNear nem entre os que não escolhem o sítio (D-232)`); continue; }
    if (!L.some(l => /keptNear\s*\((x, y|tx, ty)\)/.test(l))) fails.push(`a cidade nova: ${f} escolhe o sítio de uma cidade nova sem perguntar ao V.keptNear (D-232)`); } }
// 82. "as marcas da obra grande que só o village.js escreve, e as portas que os outros perguntam" (D-219, D-230, D-233): o campo
// cívico (set.urb.civ) e a marca do fogo (b.burnHp) só o village.js escreve; o nature.js pergunta o que um prédio dá ao fogo ao
// V.fireFuel; no villagers.js o construtor olha o armazém pelo freeFor (um só G.Fac.free(b.set, o da definição dele); e no
// city.js a carroça da obra pergunta a pedra ao V.stoneFor
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bu\.civ\s*=[^=]|urb\.civ\s*=[^=]|burnHp\s*[-+]?=[^=]/.test(c)) fails.push(`a obra grande: ${f}:${k + 1} escreve o campo cívico ou a marca do fogo fora do village.js (D-219, D-230): ${l.trim().slice(0, 110)}`); });
{ const strip = f => (src[f] || []).map(l => l.replace(/(^|\s)\/\/\s.*$/, ''));
  if (!strip('nature.js').some(l => /\bfireFuel\s*\(/.test(l))) fails.push('o fogo: nature.js não pergunta ao V.fireFuel o que um prédio dá ao fogo (D-219)');
  const Vl = strip('villagers.js'); if (!Vl.some(l => /const freeFor\s*=/.test(l))) fails.push('as últimas pedras: villagers.js sem o freeFor (D-233)');
  Vl.forEach((l, k) => { if (/G\.Fac\.free\s*\(\s*b\.set/.test(l) && !/const freeFor\s*=/.test(l)) fails.push(`as últimas pedras: villagers.js:${k + 1} olha o armazém para uma obra sem passar pelo freeFor (D-233): ${l.trim().slice(0, 110)}`); });
  if (!strip('city.js').some(l => /\bstoneFor\s*\(/.test(l))) fails.push('as últimas pedras: city.js — a carroça da obra não pergunta a pedra ao V.stoneFor (D-233)'); }
// 83. "a casa do povo guardada para uma família, o barraco e a marca dos moços" (D-235 a D-237): o js/village.js pergunta ao
// G.Casa.heldFor antes de mandar quem vai só para uma casa (as duas chamadas do findHome com `true`), o js/social.js não manda
// levantar barraco quem espera a sua casa (G.Casa.waiting), e a marca da cabana dos moços (b.encomenda.mocos) só o
// js/act-casa.js escreve
{ const L = (src['village.js'] || []).map(l => l.replace(/(^|\s)\/\/\s.*$/, ''));
  if (!L.some(l => /G\.Casa\.heldFor\s*\(\s*set\s*\)/.test(l))) fails.push('a casa guardada: village.js não pergunta ao G.Casa.heldFor no assignHousing (D-236)');
  if (L.filter(l => /findHome\(1,\s*true\)/.test(l)).length < 2) fails.push('a casa guardada: village.js manda alguém só para uma casa sem dizer que vai só — findHome(1, true), nas duas chamadas (D-236)');
  const So = (src['social.js'] || []).map(l => l.replace(/(^|\s)\/\/\s.*$/, ''));
  if (!So.some(l => /G\.Casa\.waiting\s*\(\s*v\s*\)/.test(l))) fails.push('o barraco: social.js manda levantar barraco quem espera a sua casa — falta a pergunta ao G.Casa.waiting (D-237)'); }
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/encomenda\.mocos\s*=(?!=)|encomenda\s*=\s*\{[^}]*\bmocos\s*:/.test(c)) fails.push(`a cabana dos moços: ${f}:${k + 1} escreve a marca fora de act-casa.js (D-235): ${l.trim().slice(0, 110)}`); });
// 84. "o bolso de quem tem teto vai ao pote pelo livro, e as portas novas só leem" (L-973, D-236): a linha «bolso» do livro só o
// js/act-casa.js escreve (pocket, gather); e K.mates, K.heldFor e K.queue — pedidas pelo repartidor de casas, pela ficha e pelo
// verificador — não buscam lote, não fundam, não movem nem pagam, não marcam casa nenhuma (a regra 78, com mais três portas)
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/code:\s*'bolso'/.test(c)) fails.push(`o bolso: ${f}:${k + 1} escreve a linha «bolso» do livro fora de act-casa.js (L-973): ${l.trim().slice(0, 110)}`); });
{ const L = src['act-casa.js'] || []; const bad = /findSite\s*\(|startProject\s*\(|addBuilding\s*\(|removeBuilding\s*\(|\bD\.(move|make|use|store)\s*\(|\.(poupa|dono|encomenda|aluga|custo|home|res|maos|mocos|chao|purse)\s*=(?!=)|\bG\.(R|rr|ri|pick|chance|shuffle)\s*\(|\b(cede|raiseByHand|lease|buy|raise|move|pay|pocket|gather)\s*\(/;
  for (const st of [/^  K\.mates = function/, /^  K\.heldFor = function/, /^  K\.queue = function/]) {
    const a = L.findIndex(l => st.test(l)); if (a < 0) { fails.push(`as portas que só leem: act-casa.js sem ${st} — a regra 84 não acha a porta`); continue; }
    let z = a + 1; while (z < L.length && !/^  \};?$/.test(L[z])) z++;
    for (let k = a; k < z; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (bad.test(c)) fails.push(`as portas que só leem: act-casa.js:${k + 1} escreve no mundo dentro de uma porta de leitura (D-236): ${L[k].trim().slice(0, 110)}`); } } }
// 62. "o passo do dia tem uma porta só" (L-915, D-241): enquanto uma cena corre o sol se demora, e o que guarda o ritmo do dia
// vai com ele. (a) só o G.dayPace (world.js) pergunta ao Scene.lingers; (b) o passo de cada passo do mundo (G.pace) só o tick
// do main.js escreve — e o world.js, que o declara e o repõe a 1 num mundo novo ou num save aberto —, e só o tick chama o
// G.dayPace: quem vive o passo lê o G.pace, uma conta por passo, não por pessoa; (c) o relógio do dia anda por ele (main.js) e
// a fome e a energia do dia também (villagers.js needs: «dn»); a idade, a doença e o que se conta em segundos, não
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.lingers\s*\(/.test(c) && !(f === 'world.js' && /G\.dayPace = \(\) =>/.test(c))) fails.push(`o passo do dia: ${f}:${k + 1} pergunta ao Scene.lingers fora do G.dayPace (L-915): ${l.trim().slice(0, 110)}`);
  if (/\bG\.pace\s*(=(?!=)|[-+*/]=|\+\+|--)/.test(c) && !(f === 'main.js' && c.trim() === 'G.pace = G.dayPace();') && !(f === 'world.js' && (c.trim() === 'G.pace = 1;' || c.trim() === 'G.worldHooks.push(() => { G.pace = 1; });'))) fails.push(`o passo do dia: ${f}:${k + 1} escreve o G.pace fora do tick (L-915): ${l.trim().slice(0, 110)}`);
  if (/\bG\.dayPace\s*\(/.test(c) && !(f === 'main.js' && c.trim() === 'G.pace = G.dayPace();')) fails.push(`o passo do dia: ${f}:${k + 1} chama o G.dayPace fora do tick — quem vive o passo lê o G.pace (L-915): ${l.trim().slice(0, 110)}`); });
{ const code = l => l.replace(/(^|\s)\/\/\s.*$/, ''); const Lm = (src['main.js'] || []).map(code), Lv = (src['villagers.js'] || []).map(code), Lw = (src['world.js'] || []).map(code);
  const tk = Lm.filter(l => /\bS\.time\s*\+=/.test(l));
  if (tk.length !== 1 || !/S\.time \+= dt \/ G\.DAY_LEN \* G\.pace;/.test(tk[0])) fails.push('o passo do dia: o relógio do dia (main.js tick, «S.time += …») não anda pelo G.pace, ou anda em mais de um lugar (L-915)');
  const hg = Lv.filter(l => /^\s*v\.hunger = Math\.min\(100, v\.hunger \+ /.test(l)), en = Lv.filter(l => /^\s*if \(v\.age >= 2\) v\.energy = G\.clamp\(v\.energy \+ /.test(l));
  if (hg.length !== 1 || !/v\.hunger \+ dn \* /.test(hg[0])) fails.push('o passo do dia: a fome do dia (villagers.js needs) não anda pelo passo do dia («dn») (L-915)');
  if (en.length !== 1 || !/\(awake \? -dn \* /.test(en[0]) || !/ : dn \* \(100 \/ 22\)\)/.test(en[0])) fails.push('o passo do dia: a energia do dia (villagers.js needs) não anda pelo passo do dia («dn») (L-915)');
  if (Lv.filter(l => /const dn = dd \* G\.pace;/.test(l)).length !== 1) fails.push('o passo do dia: villagers.js needs sem «const dn = dd * G.pace» (L-915)');
  if (!Lv.some(l => /^\s*v\.age \+= dt \/ day;/.test(l))) fails.push('o passo do dia: a idade (villagers.js needs) deixou de andar em segundos («v.age += dt / day») (D-241)');
  if (!Lw.some(l => /G\.worldHooks\.push\(\(\) => \{ G\.pace = 1; \}\);/.test(l))) fails.push('o passo do dia: world.js não repõe o G.pace num mundo novo ou num save aberto (L-915)'); }
// 63. "o descanso tem uma tabela só, e o cansaço do dia é do needs" (D-240, D-242): (a) a parte do descanso (Vg.REST) e a porta
// (Vg.resting) entram na conta da energia numa linha só — a do needs (villagers.js) —, e nenhum outro arquivo do jogo lê o
// Vg.REST; (b) a porta e a tabela só leem: nenhuma escrita na pessoa, na tarefa ou no mundo e nenhum sorteio, do «Vg.REST =»
// ao fim do «Vg.resting = function»; (c) nenhuma outra linha do jogo muda a energia de alguém por uma taxa do tempo (× dt,
// dd, dn): o cansaço do dia é do needs — o nado, que cansa em segundos, é a exceção dita
{ const code = l => l.replace(/(^|\s)\/\/\s.*$/, ''); const L = (src['villagers.js'] || []).map(code);
  const a = L.findIndex(l => /^\s*Vg\.REST = /.test(l)), r = L.findIndex(l => /^\s*Vg\.resting = function \(v\) \{/.test(l));
  if (a < 0 || r < a) fails.push('o descanso: villagers.js sem «Vg.REST =» seguido de «Vg.resting = function (v) {» — a regra 63 não acha a porta');
  else { let z = r + 1; while (z < L.length && !/^  \};?$/.test(L[z])) z++;
    for (let k = a + 1; k <= z; k++) { const c = L[k];
      if (/\b(v|t|a|o|S|G\.S)\.[\w.]+\s*(=(?!=)|[-+*/]=|\+\+|--)/.test(c) || /\b(Vg\.setTask|Vg\.give|Vg\.endTask|setTask|end)\s*\(/.test(c)) fails.push(`o descanso: villagers.js:${k + 1} escreve dentro da porta do descanso (D-240): ${c.trim().slice(0, 110)}`);
      if (/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance|vshuffle)\s*\(|Math\.random/.test(c)) fails.push(`o descanso: villagers.js:${k + 1} sorteia dentro da porta do descanso (D-240): ${c.trim().slice(0, 110)}`); } }
  const use = []; for (const f of files) src[f].forEach((l, k) => { const c = code(l); if (/\bVg\.REST\b/.test(c) && !/^\s*Vg\.REST = /.test(c)) use.push([f, k + 1, c]); });
  const en = use.filter(([f, , c]) => f === 'villagers.js' && /^\s*if \(v\.age >= 2\) v\.energy = G\.clamp\(v\.energy \+ /.test(c) && /\* \(Vg\.resting\(v\) \? Vg\.REST : 1\)/.test(c));
  if (en.length !== 1) fails.push('o descanso: a linha da energia do needs (villagers.js) não tem «* (Vg.resting(v) ? Vg.REST : 1)» (D-240)');
  for (const [f, k, c] of use) if (!en.some(e => e[0] === f && e[1] === k)) fails.push(`o descanso: ${f}:${k} lê o Vg.REST fora da linha da energia do needs (D-240): ${c.trim().slice(0, 110)}`);
  const RATE_OK = [['villagers.js', 'v.energy -= dt * 3;']]; // (swimming for one's life: in seconds, with or without a scene)
  for (const f of files) src[f].forEach((l, k) => { const c = code(l); const m = /\.energy\s*([-+*/]?=)(?!=)([^;]*)/.exec(c); if (!m || !/\b(dt|dd|dn|dt2|h)\b/.test(m[2])) return;
    if (f === 'villagers.js' && /^\s*if \(v\.age >= 2\) v\.energy = G\.clamp\(v\.energy \+ \(awake \? -dn \* /.test(c)) return; if (ok(RATE_OK, f, l)) return;
    fails.push(`o descanso: ${f}:${k + 1} muda a energia de alguém por uma taxa do tempo fora do needs (D-240): ${l.trim().slice(0, 110)}`); }); }
// 85. "há caminho? pergunta ao mapa de regiões" (L-731): a busca de caminho do instante (W.findPath) acha fechado o portão que o
// alarme fechou e que reabre; o mapa de regiões (W.canWalk, W.townReaches, W.townsLinked) conta-o aberto, «para nunca dizer que
// não há caminho onde há». Uma busca sem limite (N * N) que só responde sim ou não — num «!!», num «!», numa condição, num «&&» —
// é a pergunta do mapa feita pela busca: a guerra não convocava exército contra a capital murada em alarme, nem socorro para a
// cidade murada sitiada. Quem quer o caminho (a estrada, o desenho de uma rota) guarda-o («const p = W.findPath(…)»); quem quer
// o instante de propósito (o cerco: o bando entra agora pelos portões?) também
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (!/\bfindPath\(/.test(c) || !/\bN \* N\b/.test(c)) return;
  if (/(!!?|\bif \(|&&\s*|\|\|\s*|\?\s*)(G\.)?W\.findPath\(/.test(c)) fails.push(`há caminho?: ${f}:${k + 1} uma busca de caminho sem limite usada como sim ou não — pergunte ao mapa de regiões (W.canWalk, W.townReaches, W.townsLinked; L-731): ${l.trim().slice(0, 110)}`); });
// 86. "o povo que acaba leva na hora o que é dele" (L-733): a extinção de um povo (P.extinct, no politics.js) avisa na mesma
// hora os bandos (G.War), os exércitos (G.Wars), as frotas (G.Fleets), as expedições (G.Expe) e os navios nos cais (G.Naval,
// L-808) dele, e cada módulo termina os
// seus como a sua própria passada terminaria — sem meio segundo de um exército, uma frota ou uma expedição de um povo morto
// (o verificador acusa: «… povo extinto»). Cada módulo tem a sua porta (Wz.onExtinct, Fl.onExtinct, X.onExtinct); quem
// tirar uma delas da extinção deixa o povo morto de pé até a próxima passada (qa/vira.js caso 7)
{ const pol = src['politics.js'] || []; const i = pol.findIndex(l => /P\.extinct = function/.test(l));
  if (i < 0) fails.push('o povo que acaba: o P.extinct não está no politics.js (L-733)');
  else { const body = pol.slice(i, i + 16).join('\n');
    for (const d of ['G.War.onExtinct(f)', 'G.Wars.onExtinct(f)', 'G.Fleets.onExtinct(f)', 'G.Expe.onExtinct(f)', 'G.Naval.onExtinct(f)']) if (!body.includes(d)) fails.push(`o povo que acaba: o P.extinct (politics.js) não chama ${d} — o que é do povo morto fica de pé até a próxima passada (L-733)`); }
  for (const [f, d] of [['wars.js', 'Wz.onExtinct ='], ['fleets.js', 'Fl.onExtinct ='], ['expeditions.js', 'X.onExtinct ='], ['naval.js', 'Nv.onExtinct =']]) if (!(src[f] || []).some(l => l.includes(d))) fails.push(`o povo que acaba: ${f} sem a porta ${d.slice(0, -2)} (L-733)`); }
// 87. "a viagem é de quem zarpou" (L-824): a lista de quem zarpou com um navio mercante do cais de casa (s.hands) só o naval.js
// escreve — na partida, depois da reunião da tripulação, e no load de um save de antes —, e o crewHome (harbor.js) paga o soldo e
// conta a viagem só a quem está nela: o náufrago que outro navio do povo tira da água no caminho de casa pisa o cais com a
// tripulação, mas a viagem não é dele (qa/marinheiros.js m5b)
for (const f of files) { if (f === 'naval.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.hands\s*=(?!=)(?!\s*function\b)/.test(c)) fails.push(`a viagem é de quem zarpou: ${f}:${k + 1} escreve a lista de quem zarpou (s.hands), que só o naval.js escreve (L-824): ${l.trim().slice(0, 110)}`); }); }
{ const hb = src['harbor.js'] || []; const i = hb.findIndex(l => /G\.Naval\.crewHome = function/.test(l));
  if (i < 0 || !hb.slice(i, i + 16).some(l => /hands && !hands\.has\(v\.id\)/.test(l))) fails.push('a viagem é de quem zarpou: o crewHome (harbor.js) não pergunta à lista de quem zarpou (s.hands) — o náufrago recolhido recebe o soldo da viagem de quem o salvou (L-824)'); }
// 88. "o dia de um bairro é o das fronteiras em que aconteceu" (L-825): no fechamento do dia de uma cidade (urban.js), as
// contas do dia (S.urbAcc: a atividade e as mortes, por pedaço de chão) vão para os bairros como eram enquanto o dia aconteceu —
// as fronteiras são guardadas antes de o redesenho do mesmo fechamento (updateDistricts) mudar pedaços de mão, e o closeLife as
// recebe. Na ordem de antes, a peste de um bairro de Mênfis levou 19, o redesenho deu quatro dos sete pedaços dele a outros
// bairros, e 13 dos mortos foram com eles: a história contou «a guerra levou 4» (qa/vida-bairro.js v7)
{ const ub = src['urban.js'] || []; const iw = ub.findIndex(l => /const was = new Map\(\); for \(const d of \(set\.urb && set\.urb\.d\)/.test(l));
  const iu = ub.findIndex((l, k) => k > iw && /updateDistricts\(set, sn\);/.test(l)), ic = ub.findIndex((l, k) => k > iw && /closeLife\(set, sn, was\);/.test(l));
  if (iw < 0 || iu < 0 || ic < 0 || !(iw < iu && iu < ic)) fails.push('o dia de um bairro: o fechamento do dia (urban.js) não guarda as fronteiras do dia antes do redesenho (const was … updateDistricts … closeLife(set, sn, was)) — as contas vão para os bairros redesenhados (L-825)');
  if (!ub.some(l => /if \(was\) for \(const \[c, d\] of was\) if \(day\.has\(d\)\) own\.set\(c, d\);/.test(l))) fails.push('o dia de um bairro: o closeLife (urban.js) não reparte as contas pelas fronteiras do dia (was) — L-825'); }
// 89. "o plano de ruas é lido inteiro" (L-828): o plano de ruas de uma cidade (set._plan, um cache que não vai no save) só o
// city.js lê e escreve; quem pergunta se uma casa é de rua planejada pergunta ao G.City.onStreet / onAvenue, que fazem o plano
// que falta antes de responder (planOf). Sem isso, a primeira busca de lote depois de um load tomava as ruas de terra planejadas
// por chão livre até que, no meio dela, o retrato da cidade fizesse o plano: o lote do santuário de Argos achado numa busca e
// recusado na seguinte (qa/escala.js e2)
for (const f of files) { if (f === 'city.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\._plan\b/.test(c)) fails.push(`o plano de ruas: ${f}:${k + 1} lê o plano de ruas (set._plan), que só o city.js lê — pergunte ao G.City.onStreet / onAvenue (L-828): ${l.trim().slice(0, 120)}`); }); }
{ const cy = src['city.js'] || []; for (const d of ['Ci.onStreet = (set, i) => { const p = planOf(set);', 'Ci.onAvenue = (set, i) => { const p = planOf(set);']) if (!cy.some(l => l.includes(d))) fails.push(`o plano de ruas: o city.js sem «${d.slice(0, 44)}…» — a pergunta responde sem o plano que falta (L-828)`);
  if (!cy.some(l => /const planOf = set => \(!set \? null : set\._plan \|\| \(G\.inSim \? \(Ci\.streetPlan\(set\)/.test(l))) fails.push('o plano de ruas: o planOf (city.js) não faz o plano que falta no passo do mundo (L-828)'); }
// 90. "a mina sem veio não dá posto nem turno" (L-827): o dia da cidade (E.place, economy.js) não dá posto numa mina sem veio, e
// o dia de trabalho (E.jobTask) não manda o mineiro descer nela — com o posto e o turno, o turno acabava onde começava, a cada
// passo, e o mineiro ficava parado à porta, cansando como no trabalho (qa/mina.js m8)
{ const ec = src['economy.js'] || []; const ip = ec.findIndex(l => /E\.place = function/.test(l));
  if (ip < 0 || !ec.slice(ip, ip + 4).some(l => /spent\(b\)\) continue;/.test(l))) fails.push('a mina sem veio: o E.place (economy.js) dá posto numa mina sem veio (spent) — L-827');
  if (!ec.some(l => /case 'mineiro': return E\.spent\(b\) \? null :/.test(l))) fails.push('a mina sem veio: o E.jobTask (economy.js) manda o mineiro descer numa mina sem veio (E.spent) — L-827'); }
// 91. "o bicho de uma pele só desenha" (D-265): o 3D dos bichos — js/fauna3d.js (a pele, a pintura) e js/fauna-anim.js (o
// esqueleto, os passos, a pelagem de cada espécie) — só lê o mundo. Fora dos comentários: não tira de acaso nenhum (nem o do
// mundo nem o do que só se vê: o passo, o olhar, a orelha que espanta a mosca e a pelagem saem do relógio da vista, do id do
// bicho e do G.hash — o mesmo bicho é sempre o mesmo bicho); não escreve campo nenhum de bicho, pessoa, prédio ou do estado
// (a., v., b., S., G.S. seguidos de uma atribuição); e não abre porta nenhuma que muda o mundo. O people3d.js guarda o que a
// vista lembra de cada bicho (o passo, o ouvido, o sentar) na sua memória de desenho (bvis), nunca no bicho
// (e o gesto no corpo, D-280: js/fauna-gesto3d.js — as camadas, os resolvedores de cada família, o alcance ao outro, o corpo no chão —
// e js/fauna-receitas.js — cada gesto de cada família —: o mesmo; o que a vista lembra de um bicho fica no s do bvis)
for (const f of ['fauna3d.js', 'fauna-anim.js', 'fauna-gesto3d.js', 'fauna-receitas.js']) { if (!src[f]) { fails.push(`bicho de uma pele: js/${f} não existe — a regra 91 não acha o 3D dos bichos`); continue; }
  src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`bicho de uma pele: ${f}:${k + 1} tira de um acaso (o mesmo bicho tem de ser sempre o mesmo): ${l.trim().slice(0, 110)}`);
    if (/\b(a|v|b|S|G\.S)\.[A-Za-z_]+(\[[^\]]*\])?(\.[A-Za-z_]+)*\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`bicho de uma pele: ${f}:${k + 1} escreve no mundo (o 3D dos bichos só lê): ${l.trim().slice(0, 110)}`);
    if (WORLD_WRITE.test(c) || /\b(setTask|Vg\.give|Urban\.(note|noteB|mourn|remember)|Animals\.(remove|spawn)|touchWalk)\s*\(/.test(c)) fails.push(`bicho de uma pele: ${f}:${k + 1} abre uma porta que muda o mundo: ${l.trim().slice(0, 110)}`); }); }
{ const p3 = src['people3d.js'] || []; const i = p3.findIndex(l => /function beastSkin\(a, sp, s, m,/.test(l));
  if (i < 0) fails.push('bicho de uma pele: o people3d.js sem a função beastSkin — a regra 91 não acha quem põe os bichos na pele');
  else { const j = p3.findIndex((l, k) => k > i && /^  \}$/.test(l)); p3.slice(i, j).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\ba\.[A-Za-z_]+\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`bicho de uma pele: people3d.js:${i + k + 1} o beastSkin escreve no bicho (a memória do desenho é o bvis): ${l.trim().slice(0, 110)}`); }); } }
// 91, o dragão (D-270): o dragão de pele só desenha, como os bichos — o skinPlace do dragon3d.js (a pose, o pouso, a boca que
// arde) não tira de acaso nenhum (o bater das asas, o piscar e o fogo da boca saem do relógio da vista e do id do dragão: o
// mesmo dragão é sempre o mesmo dragão) nem escreve no dragão do mundo (d. seguido de uma atribuição; a memória do desenho é o
// vis); a linha dele no Fauna3D é a que o Fauna3D.extra dá depois dos bichos do People3D, e só o dragon3d.js põe o dragão nela
{ const d3 = src['dragon3d.js'] || []; const i = d3.findIndex(l => /function skinPlace\(d, C, t, dt, row, focus\)/.test(l));
  if (i < 0) fails.push('dragão de pele: o dragon3d.js sem a função skinPlace — a regra 91 não acha quem põe o dragão na pele');
  else { const j = d3.findIndex((l, k) => k > i && /^  \}$/.test(l)); d3.slice(i, j).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`dragão de pele: dragon3d.js:${i + k + 1} tira de um acaso (o mesmo dragão tem de ser sempre o mesmo): ${l.trim().slice(0, 110)}`);
    if (/\bd\.[A-Za-z_]+(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`dragão de pele: dragon3d.js:${i + k + 1} escreve no dragão do mundo (o desenho só lê): ${l.trim().slice(0, 110)}`); }); }
  if (!d3.some(l => /\.extra\(\)/.test(l.replace(/(^|\s)\/\/\s.*$/, '')))) fails.push('dragão de pele: o dragon3d.js não pede a sua linha ao Fauna3D.extra (a linha depois dos bichos do People3D)');
  for (const f of files) if (f !== 'dragon3d.js' && src[f]) src[f].forEach((l, k) => { if (/\.put\([^)]*'dragon'/.test(l.replace(/(^|\s)\/\/\s.*$/, ''))) fails.push(`dragão de pele: ${f}:${k + 1} põe o dragão no Fauna3D — só o dragon3d.js o desenha, na linha do Fauna3D.extra`); }); }
// (os bichos do mar, D-267: o seaSkin do things3d.js guarda o que a vista lembra de cada um — o nado, o salto, o fôlego, o
// mergulho — na memória de desenho dele (o memo s), nunca no bicho; o salto e o sopro são os do mundo, só lidos)
{ const t3 = src['things3d.js'] || []; const i = t3.findIndex(l => /function seaSkin\(a, s,/.test(l));
  if (i < 0) fails.push('bicho de uma pele: o things3d.js sem a função seaSkin — a regra 91 não acha quem põe os bichos do mar na pele (D-267)');
  else { const j = t3.findIndex((l, k) => k > i && /^  \}$/.test(l)); t3.slice(i, j).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\ba\.[A-Za-z_]+\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`bicho de uma pele: things3d.js:${i + k + 1} o seaSkin escreve no bicho (a memória do desenho é o memo s): ${l.trim().slice(0, 110)}`); }); } }
// 92. "o gesto de um bicho só pela porta" (D-276): o que o corpo de um bicho faz agora (a.gest, a.gestT, a.gestD, a.gestO,
// a.gestV) só o animals.js escreve — pelo A.gesture / A.gestEnd e pelo relógio do gesto no passo —; o cérebro (fauna-mente.js), a
// luta (fauna-luta.js), o meio (fauna-meio.js) e quem mais der um gesto a um bicho pedem à porta, que recusa e conta (A.gestErr)
// o gesto que ninguém conhece ou que a espécie não faz — as vistas não teriam pose para ele. O save devolve o gesto como estava
// (save.js); o vocabulário é um só (js/fauna-gestos.js), puro: sem o mundo, sem acaso
for (const f of files) { if (f === 'animals.js' || f === 'save.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.gest[TDOV]?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`o gesto pela porta: ${f}:${k + 1} escreve o gesto de um bicho (a.gest…), que só o A.gesture / A.gestEnd do animals.js escreve (D-276): ${l.trim().slice(0, 110)}`); }); }
{ const an = src['animals.js'] || []; const i = an.findIndex(l => /A\.gesture = function \(a, n, dur, other, v\)/.test(l));
  if (i < 0 || !an.slice(i, i + 4).some(l => /d\.kinds\.has\(a\.kind\)/.test(l) && /A\.gestErr\.push/.test(l))) fails.push('o gesto pela porta: o A.gesture (animals.js) não recusa e conta o gesto desconhecido ou que a espécie não faz (A.gestErr) — D-276'); }
{ const ge = src['fauna-gestos.js'] || []; if (!ge.length) fails.push('o gesto pela porta: js/fauna-gestos.js não existe — o vocabulário dos gestos (D-276)');
  ge.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random|\bG\.S\b/.test(c)) fails.push(`o gesto pela porta: fauna-gestos.js:${k + 1} lê o mundo ou tira de um acaso (o vocabulário é puro): ${l.trim().slice(0, 110)}`); }); }

// (o gesto no corpo, D-280: as funções do people3d.js que preparam o gesto de um bicho antes do desenho — o relógio do gesto, a
// morte, o outro e o ponto dele, o corpo de quem segura, o pequeno levado na boca, as marcas da pelagem, a mente lida — escrevem
// só na memória do desenho (s, o bvis) e no contexto da pose, nunca no bicho)
{ const p3 = src['people3d.js'] || [];
  for (const fn of ['impliedGest', 'gestureOf', 'holdBody', 'framePos', 'marksOf', 'moodOf', 'keyPoint', 'heldMap']) {
    const i = p3.findIndex(l => new RegExp('^  function ' + fn + '\\(').test(l)); if (i < 0) { fails.push(`gesto no corpo: o people3d.js sem a função ${fn} — a regra 91 não a acha (D-280)`); continue; }
    const j = p3.findIndex((l, k) => k > i && /^  \}$/.test(l)); p3.slice(i, j).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\b(a|o|h)\.[A-Za-z_]+(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`gesto no corpo: people3d.js:${i + k + 1} o ${fn} escreve num bicho (a memória do desenho é o bvis): ${l.trim().slice(0, 110)}`); }); } }
// 93. "todo gesto tem o seu corpo" (D-281): cada gesto do vocabulário (js/fauna-gestos.js) tem a sua receita em js/fauna-receitas.js
// para cada família de corpo das espécies que o fazem (os de quatro patas, as aves, as cobras, o crocodilo e o lagarto, a rã, as
// focas) — um gesto novo sem receita cairia em ficar de pé, calado. A prova bichos-gestos.js confere o mesmo pelo jogo carregado
{ const ge = (src['fauna-gestos.js'] || []).join('\n'), rc = (src['fauna-receitas.js'] || []).join('\n');
  const names = [...ge.matchAll(/^\s{4}(\w+): \{ nome: /gm)].map(m => m[1]);
  for (const n of names) if (!new RegExp(`def\\('${n}'`).test(rc)) fails.push(`todo gesto tem o seu corpo: o gesto ${n} (fauna-gestos.js) sem receita em fauna-receitas.js (D-281)`); }
// 100. "o meio de um bicho é do meio" (D-300): o que o mundo fez no corpo de um bicho — a sede, o pelo molhado, a lama, a poeira,
// o frio, o calor, a água e a toca que ele lembra, o alerta (a.meio) — e o estado do meio no mundo (S.meio: o medo das pessoas,
// os lugares de beber, as contas) só o fauna-meio.js escreve; o save leva o objeto inteiro (save.js, G.Save.packAnimal). Quem
// quer mudar o meio de um bicho pede ao G.Meio (o deus, a luta, o cérebro): uma escrita de fora deixava a sede de um bicho
// fora do lugar e o verificador sem saber de quem é
const MEIO_OK = [['save.js', 'if (a.meio) o.meio = a.meio']];
for (const f of files) { if (f === 'fauna-meio.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.meio\b(\.[A-Za-z_]+|\[[^\]]+\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c) && !ok(MEIO_OK, f, l)) fails.push(`o meio pela porta: ${f}:${k + 1} escreve o meio de um bicho ou do mundo (a.meio, S.meio), que só o fauna-meio.js escreve (D-300): ${l.trim().slice(0, 110)}`); }); }
// 101. "o meio muda o mundo pelas portas do mundo" (D-304): o elefante que derruba a árvore, a semente que vira muda, o bicho que
// sai do mundo — o fauna-meio.js não escreve o chão, as árvores, a lista dos bichos nem o fogo à mão: a árvore cai pelo
// G.Nature.fellTree e nasce pelo G.Nature.addTree, o bicho sai pelo G.Animals.remove / kill; nenhuma escrita em S.type, S.occ,
// S.treeAt, S.deep, S.veg, S.wear, S.fire, S.cliff, S.road ou S.wall, nem em S.trees / S.animals, nem no estágio de uma árvore
{ const mm = src['fauna-meio.js'] || []; if (!mm.length) fails.push('o meio: js/fauna-meio.js não existe (D-276, D-300)');
  mm.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bS\.(type|occ|treeAt|deep|veg|wear|fire|cliff|road|wall|objAt|typeVer)\b(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c) || /\bS\.(trees|animals|bushes)\.(set|delete|clear)\(/.test(c) || /\.stage\s*=(?!=)/.test(c) || /Math\.random/.test(c)) fails.push(`o meio pelas portas do mundo: fauna-meio.js:${k + 1} escreve o chão, as árvores ou os bichos à mão (G.Nature.fellTree / addTree, G.Animals.remove / kill são as portas; D-304): ${l.trim().slice(0, 110)}`); }); }
// 102. "o gesto do meio, só o que a espécie faz" (D-300): o fauna-meio.js dá um gesto a um bicho num lugar só — a função gest,
// que pergunta antes ao G.Gestos.can se a espécie o faz —: nenhum gesto do meio é recusado pela porta (A.gestErr) por ser de
// outra espécie, e o gesto do tempo (a sacudida, o tremor) não corta o de uma caçada (a prioridade do gesto que já está)
{ const mm = src['fauna-meio.js'] || []; const at = []; mm.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bA\.gesture\(/.test(c)) at.push(k); });
  const g0 = mm.findIndex(l => /^  function gest\(a, n, d, o, v, own\) \{/.test(l)); const g1 = g0 < 0 ? -1 : mm.findIndex((l, k) => k > g0 && /^  \}$/.test(l));
  if (g0 < 0) fails.push('o gesto do meio: o fauna-meio.js sem a função gest(a, n, d, o, v, own) — a porta dos gestos do meio (D-300)');
  else { if (!mm.slice(g0, g1).some(l => /Ge\.can\(a\.kind, n\)/.test(l))) fails.push('o gesto do meio: a função gest do fauna-meio.js não pergunta ao G.Gestos.can antes de dar o gesto (D-300)'); for (const k of at) if (k < g0 || k > g1) fails.push(`o gesto do meio: fauna-meio.js:${k + 1} dá um gesto fora da função gest (que pergunta ao G.Gestos.can): ${mm[k].trim().slice(0, 110)}`); } }
// 103. "os sentidos e o passo do meio são puros" (D-301): o quanto um bicho nota o outro (o vento, a cobertura, o escuro, o morro,
// o medo que as pessoas ensinaram) e o quanto o chão o atrasa (o morro, a neve, o calor, a sede) — sense, scent, coverAt,
// fireGuard, shadeAt e speed no fauna-meio.js — só leem: não tiram de acaso nenhum, não escrevem no bicho, no outro nem no
// mundo, não dão gesto nem contam. A busca de quem caça, o medo de quem é caçado e o passo de cada um perguntam a elas quantas
// vezes for preciso, e a mesma pergunta tem a mesma resposta
{ const mm = src['fauna-meio.js'] || [];
  for (const fn of ['sense(a, o)', 'scent(a, o)', 'coverAt(i)', 'fireGuard(v)', 'speed(a)', 'snowAt(x, y)']) {
    const i = mm.findIndex(l => l.includes(`function ${fn} {`)); if (i < 0) { fails.push(`os sentidos do meio: o fauna-meio.js sem a função ${fn} (D-301)`); continue; }
    const one = /\}\s*$/.test(mm[i]) && (mm[i].match(/\{/g) || []).length === (mm[i].match(/\}/g) || []).length; const j = one ? i : mm.findIndex((l, k) => k > i && /^  \}$/.test(l));
    mm.slice(i, j + 1).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\()|Math\.random|\b(a|o|v|S|m|tr|q|B)\.[A-Za-z_]+(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)|\b(gest|count|taught|quit|runStart|meioOf)\(/.test(c)) fails.push(`os sentidos do meio são puros: fauna-meio.js:${i + k + 1} (${fn.split('(')[0]}) tira de um acaso, escreve ou age (D-301): ${l.trim().slice(0, 110)}`); }); } }
// 96. "a mente de um bicho é do fauna-mente.js" (D-291): o objeto da mente (a.mind — o fôlego, a energia, o medo, a raiva, o posto,
// o sexo, a mãe, o cio, a prenhez, a memória) só o js/fauna-mente.js escreve; a luta, o meio, as vistas e o resto leem, e pedem às
// portas dele (Mente.fright, anger, tire, place, meet, contest, born, heat…). O save guarda a mente pelo empacotador dela
// (G.Mente.pack, save.js) e o molde a desempacota (G.Mente.unpack, no A.spawn). (Um apelido — const m = a.mind; m.st = … — a regra
// não acha: a revisão acha)
{ const MIND_OK = [['save.js', 'o.mind = G.Mente.pack(a)']];
  for (const f of files) { if (f === 'fauna-mente.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.mind(\.[A-Za-z_]+|\[[^\]]+\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c) && !ok(MIND_OK, f, l)) fails.push(`a mente pela porta: ${f}:${k + 1} escreve na mente de um bicho (a.mind), que só o fauna-mente.js escreve (D-291): ${l.trim().slice(0, 110)}`); }); } }
// 97. "a ferida de um bicho é do fauna-luta.js" (D-298): o objeto das feridas (a.wnd — o sangue, a manqueira, as seis zonas, a
// mandíbula, o veneno, quem feriu, a pegada em que está) só o js/fauna-luta.js escreve (o save pelo G.Luta.pack, o molde pelo
// G.Luta.unpack); as vistas leem o sangue e a manqueira
{ const WND_OK = [['save.js', 'o.wnd = G.Luta.pack(a)']];
  for (const f of files) { if (f === 'fauna-luta.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.wnd(\.[A-Za-z_]+|\[[^\]]+\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c) && !ok(WND_OK, f, l)) fails.push(`a ferida pela porta: ${f}:${k + 1} escreve nas feridas de um bicho (a.wnd), que só o fauna-luta.js escreve (D-298): ${l.trim().slice(0, 110)}`); }); } }
// 98. "uma pegada, dois corpos, uma porta" (D-297, L-1002): quem está nas garras de quem (a.caught) só o js/fauna-luta.js escreve —
// a pegada começa (L.hold), acaba (L.release, a morte) e vem do save (o gancho do load) lá —; o preso pergunta, a cada passo, se
// quem o segura ainda o segura (o heldDown do animals.js é a porta G.Luta.held); e os dois corpos de uma pegada só a G.Luta.place
// põe no lugar (no fauna-luta.js nenhuma outra linha escreve a posição da presa ou de quem a segura)
// (the files of the beasts: a.caught of a person is another thing — the day a thief was caught, crime.js —, and the stories' own)
const BEASTS = ['animals.js', 'caves.js', 'nests.js', 'migrate.js', 'wild.js', 'pets.js', 'events.js', 'save.js', 'fauna-mente.js', 'fauna-meio.js', 'fauna-gestos.js', 'carnage.js', 'powers.js', 'miracles.js'];
for (const f of BEASTS) { if (!src[f]) continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\.caught\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`a pegada pela porta: ${f}:${k + 1} escreve quem está nas garras de quem (a.caught), que só o fauna-luta.js escreve (D-297): ${l.trim().slice(0, 110)}`); }); }
{ const an = src['animals.js'] || []; const i = an.findIndex(l => /function heldDown\(a, dt\)/.test(l));
  if (i < 0 || !/return G\.Luta\.held\(a, dt\)/.test(an[i])) fails.push('a pegada pela porta: o heldDown do animals.js não é a porta G.Luta.held (D-297)');
  const lu = src['fauna-luta.js'] || []; const p0 = lu.findIndex(l => /L\.place = function \(h, p\)/.test(l)); const p1 = p0 < 0 ? -1 : lu.findIndex((l, k) => k > p0 && /^  \};$/.test(l));
  if (p0 < 0 || p1 < 0) fails.push('a pegada pela porta: o fauna-luta.js sem a porta L.place (D-297)');
  else lu.forEach((l, k) => { if (k >= p0 && k <= p1) return; const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\b[ph]\.[xy]\s*=(?!=)/.test(c)) fails.push(`a pegada pela porta: fauna-luta.js:${k + 1} põe um corpo de uma pegada fora da L.place (D-297): ${l.trim().slice(0, 110)}`); }); }
// 99. "o cérebro e a luta pedem o gesto que a espécie faz, e a crônica dos bichos tem uma porta" (D-290, D-299): no fauna-mente.js e
// no fauna-luta.js o gesto de um bicho só pela Mente.gesto / gesto1 (que pergunta ao G.Gestos.can antes da porta do A.gesture — a
// porta recusaria e contaria o resto); e a linha da crônica só pela L.say, que não deixa duas perto demais nem a mesma de novo por
// dias (as marcas no mundo, no save)
for (const f of ['fauna-mente.js', 'fauna-luta.js']) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\b(A|G\.Animals)\.gesture\(/.test(c) && !/Me\.gesto = function/.test(c)) fails.push(`o gesto do cérebro: ${f}:${k + 1} dá um gesto sem a Mente.gesto (que pergunta se a espécie o faz): ${l.trim().slice(0, 110)}`);
  if (/G\.Village\.log\(/.test(c) && !/L\.count\('cronica'\)/.test(c)) fails.push(`a crônica dos bichos: ${f}:${k + 1} escreve na crônica sem a L.say (D-299): ${l.trim().slice(0, 110)}`); });
// 107. "o corpo das feras é puro onde responde" (D-330, D-331): o js/fauna-corpo.js (G.Corpo) diz a pegada de um bicho, quem fica
// no caminho e quem alcança o corpo encarnado — sem acaso nenhum (nem o do mundo, nem o do que só se vê) e sem escrever no bicho,
// no corpo ou no mundo; a única escrita é a do passo do mundo, Co.step (o golpe que chega, o bicho posto de volta na pele do corpo)
{ const fc = src['fauna-corpo.js'] || []; if (!fc.length) fails.push('o corpo das feras: js/fauna-corpo.js não existe (D-330)');
  const s0 = fc.findIndex(l => /^  Co\.step = function \(v\) \{/.test(l)); const s1 = s0 < 0 ? -1 : fc.findIndex((l, k) => k > s0 && /^  \};$/.test(l));
  if (s0 < 0 || s1 < 0) fails.push('o corpo das feras: o fauna-corpo.js sem a porta Co.step (D-332)');
  fc.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`o corpo das feras: fauna-corpo.js:${k + 1} tira de um acaso (a pegada e o alcance são contas do mundo, sem sorte): ${l.trim().slice(0, 110)}`);
    if (/\b(a|v|o|b)\.(x|y|hp|downT|state|target|angry|fx|fy)\s*(=(?!=)|\+=|-=)/.test(c) && !(k > s0 && k < s1)) fails.push(`o corpo das feras: fauna-corpo.js:${k + 1} escreve num bicho ou numa pessoa fora do passo do mundo (Co.step): ${l.trim().slice(0, 110)}`); }); }
// 108. "quem alcança o corpo pergunta pela pele" (D-331): um bicho alcança o corpo encarnado pela pele dele e do corpo, não pelos
// quatro metros da casa do deus — no animals.js, toda chamada da mordida (bite(a, …)) está numa linha que pergunta ao touches (a
// porta G.Corpo.reach, que para todos os outros é a distância de sempre); no fauna-luta.js, a picada da víbora (snakeBite) também
{ const an = src['animals.js'] || [], lu = src['fauna-luta.js'] || [];
  if (!an.some(l => /const touches = \(a, o, d0\) => \(G\.Corpo \? G\.Corpo\.reach\(a, o, d0\)/.test(l))) fails.push('alcance pela pele: o animals.js sem a porta touches (G.Corpo.reach, D-331)');
  an.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bbite\(a, \w+, dt\)/.test(c) && !/\bfunction bite\(/.test(c) && !/\btouches\(/.test(c)) fails.push(`alcance pela pele: animals.js:${k + 1} morde sem perguntar ao touches (D-331): ${l.trim().slice(0, 110)}`); });
  lu.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bsnakeBite\(a, v\)/.test(c) && !/function snakeBite/.test(c) && !/G\.Corpo\.reach\(/.test(c)) fails.push(`alcance pela pele: fauna-luta.js:${k + 1} pica sem perguntar ao G.Corpo.reach (D-331): ${l.trim().slice(0, 110)}`); }); }
// 109. "o golpe no corpo chega na hora do gesto, e só o mundo o dá" (D-332, D-333): a mordida de uma pessoa (o ramo das pessoas do
// bite, a picada da víbora, a mordida do lobo da razia) passa pelo G.Corpo.blow quando é o corpo encarnado — o gesto agora, o golpe
// no contato dele —; os golpes que o corpo levou (S.avatar.hits) só o possess.js anota; e quem responde a eles — o controle do
// corpo, o olho, a tela, os modos, o 3D — não escreve a vida nem o chão de ninguém (v.hp, v.downT): só o mundo fere e derruba
{ const an = src['animals.js'] || [], lu = src['fauna-luta.js'] || [];
  const b0 = an.findIndex(l => /^  function bite\(a, tg, dt\) \{/.test(l)), b1 = b0 < 0 ? -1 : an.findIndex((l, k) => k > b0 && /^  \}$/.test(l));
  if (b0 < 0 || !an.slice(b0, b1).some(l => /G\.Corpo\.blow\(a, tg,/.test(l))) fails.push('o golpe no contato: o bite do animals.js não passa pelo G.Corpo.blow para o corpo encarnado (D-332)');
  if (!an.some(l => /G\.Corpo\.blow\(a, tgt, land\)/.test(l))) fails.push('o golpe no contato: a mordida do lobo da razia não passa pelo G.Corpo.blow para o corpo encarnado (D-332)');
  const k0 = lu.findIndex(l => /^  function snakeBite\(a, v\) \{/.test(l)), k1 = k0 < 0 ? -1 : lu.findIndex((l, k) => k > k0 && /^  \}$/.test(l));
  if (k0 < 0 || !lu.slice(k0, k1).some(l => /G\.Corpo\.blow\(a, v, land/.test(l))) fails.push('o golpe no contato: a picada da víbora (fauna-luta.js) não passa pelo G.Corpo.blow para o corpo encarnado (D-332)');
  for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (f !== 'possess.js' && /\.hits\.(push|shift|splice|unshift)\(|\.hitN\s*=(?!=)|\.hits\s*=(?!=)/.test(c) && /avatar|\ba\.hits|\bA\.hits/.test(c)) fails.push(`os golpes do corpo: ${f}:${k + 1} anota um golpe do corpo fora do possess.js (S.avatar.hits, D-333): ${l.trim().slice(0, 110)}`);
    if (['avatar.js', 'incui.js', 'cam3d.js', 'modes.js', 'people3d.js'].includes(f) && /\b(v|w|o|rec|body)\.(hp|downT)\s*(=(?!=)|\+=|-=)/.test(c)) fails.push(`os golpes do corpo: ${f}:${k + 1} escreve a vida ou o chão de alguém (só o mundo fere e derruba, D-333): ${l.trim().slice(0, 110)}`); }); }
// 104. "o olho na pele" (D-320, L-1040): o olho de um bicho não é posto à mão dentro da cabeça — 18 espécies tinham o olho
// inteiro dentro dela, e nada dele se via. Em arte/fauna_forma.py, toda família de rosto dito (FACE_FAMS) diz para onde os olhos
// olham (eyes(…, look=…)), e o fauna_especies.build acha a pele por último (FF.seat_face(b), depois dos ornamentos e antes do
// return): o olho vai por onde olha até sair do barro da cabeça inteira. A prova bichos-olhos.js mede o que se vê dele
{ const rd = f => { try { return fs.readFileSync(path.join(dir, '..', 'arte', f), 'utf8').split('\n'); } catch (e) { return null; } };
  const fo = rd('fauna_forma.py'), fe = rd('fauna_especies.py');
  if (!fo || !fe) fails.push('o olho na pele: arte/fauna_forma.py ou arte/fauna_especies.py não existe (D-320)');
  else {
    const fams = ((fo.find(l => /^FACE_FAMS = /.test(l)) || '').match(/'(\w+)'/g) || []).map(s => s.slice(1, -1)); if (!fams.length) fails.push('o olho na pele: o fauna_forma.py sem FACE_FAMS (D-320)');
    let fam = null; fo.forEach((l, k) => { const d = l.match(/^def (\w+)\(b\b/); if (d) fam = d[1] === 'head_rest' || d[1] === 'head' || d[1] === 'head_hunter' ? 'quad' : d[1];
      if (/^\s+eyes\(b,/.test(l) && fams.includes(fam) && !/\blook=/.test(l)) fails.push(`o olho na pele: arte/fauna_forma.py:${k + 1} põe os olhos da família ${fam} sem dizer para onde olham (look=; D-320): ${l.trim().slice(0, 100)}`); });
    const b0 = fe.findIndex(l => /^def build\(kind, fly=False\):/.test(l)), b1 = b0 < 0 ? -1 : fe.findIndex((l, k) => k > b0 && /^\s+return b\s*$/.test(l));
    const sf = b0 < 0 ? -1 : fe.findIndex((l, k) => k > b0 && /^\s+FF\.seat_face\(b\)/.test(l)), orn = b0 < 0 ? -1 : fe.findIndex((l, k) => k > b0 && /if k in extras: f\(b, extras\[k\]\)/.test(l));
    if (b0 < 0 || b1 < 0 || sf < 0 || sf > b1 || sf < orn) fails.push('o olho na pele: o build do fauna_especies.py não acha a pele por último (FF.seat_face(b) depois dos ornamentos, antes do return — D-320)'); } }
// 110. "nenhum gesto no jogo amplia a página" (L-1065): o dono, testando pelo celular dentro do app, ficou com a tela ampliada —
// um toque duplo num botão ou uma pinça no HUD ampliam a página (ou o visor do app em volta), e a pinça para desfazer caía no mapa,
// que a toma para si. O html e o body dizem touch-action: pan-x pan-y (um painel ainda rola com um dedo), e o main.js segura a
// pinça de dois dedos fora do mapa e os gestos do Safari
{ const css = (() => { try { return fs.readFileSync(path.join(dir, '..', 'css', 'style.css'), 'utf8'); } catch (e) { return ''; } })();
  if (!/^html, body \{[^}]*touch-action: pan-x pan-y;[^}]*\}/m.test(css)) fails.push('a página não amplia: o html, body do css/style.css sem touch-action: pan-x pan-y (L-1065)');
  const mn = (src['main.js'] || []).join('\n');
  if (!/document\.addEventListener\('touchmove', e => \{ if \(e\.touches\.length > 1\) e\.preventDefault\(\); \}, \{ passive: false \}\)/.test(mn)) fails.push('a página não amplia: o main.js sem a pinça de dois dedos segura fora do mapa (L-1065)');
  if (!/document\.addEventListener\('gesturestart', e => e\.preventDefault\(\)\)/.test(mn)) fails.push('a página não amplia: o main.js sem os gestos do Safari segurados (L-1065)'); }
// ============================== a base do corpo (JOGABILIDADE.md) ==============================
// 111. "a mochila e o equipamento são do inventario.js" (D-336): o que uma pessoa leva (v.mochila, o lugar 'm:' do G.Depot) e
// onde as coisas dela ficam no corpo (v.equip) só o js/inventario.js escreve — o 3D, a tela, o combate e os ofícios perguntam
// ao G.Inv (held, kit) e pedem as mudanças pelas portas dele, no passo do mundo
{ for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (f !== 'inventario.js' && /\.(mochila|equip)\b\s*(\[[^\]]*\]\s*|\.\w+\s*)?(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`a mochila do inventário: ${f}:${k + 1} escreve a mochila ou o equipamento de alguém fora do inventario.js (D-336; pergunte e peça ao G.Inv): ${l.trim().slice(0, 110)}`);
    if (f !== 'inventario.js' && /\.(mochila|equip)\b\s*\.\s*(push|splice|pop|shift|unshift)\(|delete\s+\w+\.(mochila|equip)\b/.test(c)) fails.push(`a mochila do inventário: ${f}:${k + 1} mexe na mochila ou no equipamento fora do inventario.js (D-336): ${l.trim().slice(0, 110)}`); });
  if (!(src['inventario.js'] || []).length) fails.push('a mochila do inventário: js/inventario.js não existe (D-336)'); }
// 112. "o catálogo dos itens é puro" (D-337): o js/itens.js é uma tabela e as funções que a leem — o mesmo para todo mundo:
// não lê o mundo (G.S), não tira de acaso nenhum, não desenha
{ const it = src['itens.js'] || []; if (!it.length) fails.push('o catálogo puro: js/itens.js não existe (D-337)');
  it.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.S\b|\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random|\bDate\b|\bTHREE\b|\bG\.Render\b|\bdocument\b/.test(c)) fails.push(`o catálogo puro: itens.js:${k + 1} lê o mundo, tira de um acaso ou desenha (D-337): ${l.trim().slice(0, 110)}`); }); }
// (as regras de cada parte da base do corpo, nas faixas de cada uma — JOGABILIDADE.md, «Os números»:
//  113–119 a animação (20a) · 120–126 o movimento (20b) · 127–134 o inventário (20c) · 135–137 a arte dos itens (20d) ·
//  138–144 a interação (20e) · 145–151 o combate (20f) · 152–158 os ofícios (20g); cada parte escreve as suas logo abaixo da
//  sua marca, para que as junções não se cruzem)
// === 20a: a animação ===
// 113. "a animação só desenha, e é uma conta" (D-340): os js/anim-*.js (o andar, os clipes, o animador) fazem a pose do que o
// quadro lhes dá — o movimento desenhado (I), a figura (L), o tempo do quadro — e nada mais: não leem nem escrevem o mundo (G.S,
// as pessoas, as operações, o livro, a vida do bairro), não tiram de acaso nenhum (nem o do mundo, nem o do que só se vê: a
// mesma pessoa no mesmo passo anda igual, de qualquer olho), não leem o relógio da máquina
{ const AN = files.filter(f => /^anim-.*\.js$/.test(f));
  for (const need of ['anim-gait.js', 'anim-clips.js', 'anim-body.js']) if (!AN.includes(need)) fails.push(`a animação só desenha: js/${need} não existe (D-340)`);
  for (const f of AN) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.S\b|\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random|\bDate\b|performance\.now|\bG\.(Act|Depot|Urban|Village|Vg|Possess|Inv)\b|\bsetTask\(/.test(c)) fails.push(`a animação só desenha: ${f}:${k + 1} lê o mundo, tira de um acaso ou pergunta ao relógio (D-340; a pose é uma conta do quadro): ${l.trim().slice(0, 110)}`);
    if (/\b(v|w|vill|person)\.(x|y|z|task|path|pi|act|actT|moving|fx|fy|hp|role|carry)\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`a animação só desenha: ${f}:${k + 1} escreve numa pessoa do mundo (D-340): ${l.trim().slice(0, 110)}`); }); }
// 114. "o que se segura é o que o inventário diz" (D-336, D-346): o 3D das pessoas não tem tabela própria do que cada ofício ou ato
// segura (as velhas TOOL_OF e toolK): o que está nas mãos, nas costas e no cinto vem do G.Inv.held(v), e a forma de cada coisa do
// G.ItemArt (com as formas de antes como reserva)
{ for (const f of ['people3d.js', 'avatar.js', ...files.filter(f => /^anim-.*\.js$/.test(f))]) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bTOOL_OF\b|\btoolK\b/.test(c)) fails.push(`o que se segura: ${f}:${k + 1} decide o que alguém segura por uma tabela própria, não pelo G.Inv.held (D-346, L-1106): ${l.trim().slice(0, 110)}`); });
  // (the drawer asks the inventory, with the memo the inventory keeps — G.Inv.heldFor, L-1114 — or plainly, G.Inv.held)
  if (!(src['people3d.js'] || []).some(l => /G\.Inv\.heldFor\(v, L\._inv|G\.Inv\.held\(v\)/.test(l))) fails.push('o que se segura: o people3d.js não pergunta ao G.Inv (heldFor / held) o que cada um leva (D-346, L-1114)');
  if (!(src['people3d.js'] || []).some(l => /G\.ItemArt\.geo\(/.test(l))) fails.push('o que se segura: o people3d.js não pede a forma das coisas ao G.ItemArt.geo (D-346)'); }
// 115. "o andar é feito da fase, não de poses misturadas" (D-341, L-1107): a passada de quem anda e de quem corre sai do G.Gait.pose
// pela fase de cada quadro — só o animador (anim-body.js) e a ponte das poses nomeadas (o gaitPose do people3d.js) a pedem; quem
// desenha uma pessoa ou o corpo não mistura uma pose de andar com outra (Anim3D.blend de 'walk'/'run'), e o corpo do deus é posto
// pelo mesmo animador de todos (o avatar.js dá o movimento do quadro, o People3D faz a pose: nem pose nem mistura no avatar.js)
{ for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (!['anim-body.js', 'anim-gait.js', 'people3d.js'].includes(f) && /\bGait\.pose\(/.test(c)) fails.push(`o andar da fase: ${f}:${k + 1} pede a passada fora do animador (D-341): ${l.trim().slice(0, 110)}`);
    if (/\.blend\([^)]*\.pose\(\s*'(walk|run|carry|sneak)'/.test(c)) fails.push(`o andar da fase: ${f}:${k + 1} mistura uma pose de andar com outra (a passada é da fase, L-1107): ${l.trim().slice(0, 110)}`);
    if (f === 'avatar.js' && /\b(A3|Anim3D|G\.Anim3D)\.(blend|pose|hold)\(/.test(c)) fails.push(`o andar da fase: avatar.js:${k + 1} põe ou mistura a pose do corpo (o People3D a faz no quadro, pelo Anim.drive — D-341): ${l.trim().slice(0, 110)}`); });
  if (!(src['people3d.js'] || []).some(l => /Anim\.drive\(avFeet\.an, I, av\.pose, av\.look, dt\)/.test(l))) fails.push('o andar da fase: o People3D não põe o corpo do deus pelo Anim.drive (D-341)');
  // (and the gait of the world's people is the world's intent, not the speed: the walk the world gives draws a walk — L-1119)
  if (!(src['people3d.js'] || []).some(l => /I\.walk = st === 'walk' \|\| st === 'carryWalk'/.test(l))) fails.push('o andar da fase: o People3D não desenha andando quem o mundo tem andando (o trote de quem não tem pressa, L-1119)'); }
// 116. "um clipe nasce pelo registro" (D-342): os clipes das ações nascem só pelo Anim.clip(id, def) (ou na fila G.ANIM_CLIPS, que
// o registro lê) — ninguém escreve o Anim3D.CLIPS à mão, onde o registro não confere as chaves, as máscaras e os eventos —; e todo
// ato que o CLIP_OF liga a um clipe liga a um clipe que existe
{ for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bCLIPS\s*(\[[^\]]+\]|\.\w+)\s*=(?!=)/.test(c) && !(f === 'anim-clips.js' && /CLIPS\[id\] = c\b/.test(c))) fails.push(`um clipe pelo registro: ${f}:${k + 1} escreve um clipe sem o Anim.clip (D-342): ${l.trim().slice(0, 110)}`); });
  const ac = src['anim-clips.js'] || [], ids = new Set(); ac.forEach(l => { const m = l.match(/^\s+K\('(\w+)'/); if (m) ids.add(m[1]); });
  const co = (ac.find(l => /const CLIP_OF = Anim\.CLIP_OF = \{/.test(l)) || '');
  if (!co) fails.push('um clipe pelo registro: o anim-clips.js sem o CLIP_OF (D-342)');
  for (const m of co.matchAll(/\b\w+: '(\w+)'/g)) if (!ids.has(m[1])) fails.push(`um clipe pelo registro: o CLIP_OF liga um ato ao clipe «${m[1]}», que o anim-clips.js não registra (D-342)`); }
// 117. "o contato do clipe é a hora do mundo" (D-343): o clipe de uma pessoa do mundo anda no relógio do golpe dela (v.actT, pelo
// Anim.loopTime) e o do corpo no tempo do ato, torcido para que o contato do clipe caia no contato do ato (Anim.warpTime) — nunca
// num relógio próprio do desenho, que deixaria o machado bater fora da hora em que o mundo diz que bateu
{ const p3 = src['people3d.js'] || [], av = src['avatar.js'] || [];
  if (!p3.some(l => /function clipClock\(v, st\) \{[^\n]*Anim\.loopTime\(C, v\.actT/.test(l))) fails.push('o contato do clipe: o people3d.js não anda o clipe de uma pessoa no relógio do golpe dela (Anim.loopTime com v.actT, D-343)');
  if (!av.some(l => /A3\.warpTime\(C, k, /.test(l))) fails.push('o contato do clipe: o avatar.js não casa o contato do clipe do corpo com o do ato (Anim.warpTime, D-343)'); }
// 118. "o que se veste é o que o inventário diz, no osso dele, com a luz das coisas" (D-349): o elmo e a couraça do G.Inv.held(v)
// (cabeca, corpo) são desenhados no quadro do osso da cabeça e do peito — o quadro do osso traz a altura do corpo e a cabeça maior
// da criança —, nunca por um chapéu da roupa por cima; e as coisas são pintadas pelo material da arte dos itens (G.ItemArt.material:
// o brilho do metal), não por um material próprio do 3D
{ const p3 = src['people3d.js'] || [];
  if (!p3.some(l => /if \(inv\.cabeca\) \{ RX\.kH = inv\.cabeca; RX\.cabeca\.copy\(R\[B\.head\]\); \}/.test(l))) fails.push('o que se veste: o people3d.js não desenha o elmo do inventário no osso da cabeça (D-349)');
  if (!p3.some(l => /if \(inv\.corpo\) \{ RX\.kT = inv\.corpo; RX\.corpo\.copy\(R\[B\.chest\]\);/.test(l))) fails.push('o que se veste: o people3d.js não desenha a couraça do inventário no osso do peito (D-349)');
  if (!p3.some(l => /if \(inv\.cabeca\) \{ o\.hatM = null; o\.hairM = null; \}/.test(l))) fails.push('o que se veste: com o elmo do inventário, a roupa ainda põe o chapéu ou o cabelo por baixo (D-350)');
  if (!p3.some(l => /toolMat = G\.ItemArt\.material\(THREE, /.test(l))) fails.push('o que se veste: as coisas não usam o material da arte dos itens (G.ItemArt.material: o brilho do metal, L-1115)'); }
// 119. "o corpo debaixo da couraça vai com o peito — no shader e na cópia da CPU, iguais" (D-351): o tronco da couraça para cima vai
// com o osso do peito (a faixa de baixo da borda, os números da elipse do pé da couraça), e a coxa que sobe fica debaixo da borda;
// o qa/visual/corpo-rig.js copia o shader do js/body3d.js linha por linha — os dois têm os mesmos números, ou a prova mede outro corpo
{ const b3 = (src['body3d.js'] || []).join('\n'); let cr = ''; try { cr = fs.readFileSync(path.join(dir, '..', 'qa', 'visual', 'corpo-rig.js'), 'utf8'); } catch (e) { }
  const nums = (t, re) => { const m = t.match(re); return m ? m.slice(1).join(',') : null; };
  const band = [nums(b3, /smoothstep\(cuE - ([\d.]+), cuE - ([\d.]+), p\.y\)/), nums(cr, /ss\(cuE - ([\d.]+), cuE - ([\d.]+), py\)/)];
  const ell = [nums(b3, /float ez = cq\.z > 0\.0 \? ([\d.]+) : ([\d.]+); float e = length\(vec2\(cq\.x \/ ([\d.]+)/), nums(cr, /const ez = cq\[2\] > 0 \? ([\d.]+) : ([\d.]+); const e = Math\.hypot\(cq\[0\] \/ ([\d.]+)/)];
  if (!band[0] || !ell[0]) fails.push('o corpo debaixo da couraça: o shader do body3d.js sem o tronco com o peito ou sem a coxa debaixo da borda (D-351)');
  else if (band[0] !== band[1] || ell[0] !== ell[1]) fails.push(`o corpo debaixo da couraça: o corpo-rig.js não copia os números do shader (faixa ${band[0]} × ${band[1]}, elipse ${ell[0]} × ${ell[1]}; D-351)`); }
// === 20b: o movimento ===
// 120. "o rumo do corpo gira, não estala" (D-358): no avatar.js o rumo do corpo (b.yaw) só muda pelo giro (steer, a velocidade de giro
// do corpo), pela virada do ato e do nado (suaves), pelo assento que se alisa — e salta só onde o corpo inteiro salta (deitado na cama
// pelo mundo, um save aberto sentado). Ao subir uma borda, tomar um lance, ser derrubado: turnTo, nunca b.yaw = …
{ const YAW_OK = ['b.yaw += b.yawV * h', 'b.yaw += da * (1 - Math.exp(-8 * h))', 'b.yaw += da * (1 - Math.exp(-TUNE.turn * 0.45 * h))', 'b.yaw = s.yaw0 + da * e', 'b.yaw = Math.PI / 2 - sp.ry', 'b.yaw = yaw1'];
  (src['avatar.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bb\.yaw\s*(=(?!=)|\+=|-=)/.test(c) && !YAW_OK.some(p => c.includes(p))) fails.push(`o rumo gira (D-358): avatar.js:${k + 1} muda o rumo do corpo de uma vez — use turnTo/steer: ${l.trim().slice(0, 110)}`); }); }
// 121. "as teclas são ações" (D-339, D-355): os arquivos do corpo não leem uma tecla pela letra — perguntam ao Input3D pela ação
// (actionOf, on, down); só as teclas F da bancada (F2, F5, F12) são lidas direto
for (const f of ['avatar.js', 'modes.js', 'incui.js', 'cam3d.js']) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\b(e|ev|event)\.(key|code)\s*[!=]==?\s*['"](?!F\d)/.test(c)) fails.push(`as teclas são ações (D-339): ${f}:${k + 1} lê uma tecla pela letra — pergunte ao Input3D.actionOf: ${l.trim().slice(0, 110)}`); });
// 122. "o painel não solta as mãos de vez" (L-1142): só o modes.js solta o mouse (Input3D.unlock) e esquece as teclas seguradas
// (Input3D.clear / release) — ao sair do corpo, na morte, num mundo novo; um painel pede Input3D.free() e o mouse volta quando ele
// fecha (Modes.setPanel), com as teclas ainda seguradas
for (const f of files) { if (f === 'modes.js' || f === 'input3d.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/Input3D\.(unlock|clear|release)\(/.test(c)) fails.push(`o painel não solta as mãos (L-1142): ${f}:${k + 1} solta o mouse ou esquece as teclas — um painel usa G.Input3D.free(): ${l.trim().slice(0, 110)}`); }); }
// 123. "os botões do toque pelo registro" (D-355): a tela do corpo não escreve um botão de ação à mão no toque (data-k): cada ação
// traz o seu pelo G.Input3D.button, e a tela os monta e os mostra conforme o momento
(src['incui.js'] || []).forEach((l, k) => { if (/<button[^>]*data-k=/.test(l)) fails.push(`os botões do toque (D-355): incui.js:${k + 1} escreve um botão de ação à mão — registre-o com G.Input3D.button: ${l.trim().slice(0, 110)}`); });
// 124. "a câmera não briga" (D-368): a inclinação é do jogador — o cam3d.js só a muda pelo mouse e pelo bastão, ao entrar no corpo e
// na mira travada —, e a câmera só vai para as costas de quem anda para a frente (inFwd): nada de andar em círculo segurando A ou D
{ const cam = src['cam3d.js'] || []; const PITCH_OK = ['C3.pitch = 0.26', 'G.clamp(C3.pitch + dy', 'G.clamp(C3.pitch + y', '(pw - C3.pitch)'];
  cam.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/C3\.pitch\s*(=(?!=)|\+=|-=)/.test(c) && !PITCH_OK.some(p => c.includes(p))) fails.push(`a câmera não briga (D-368): cam3d.js:${k + 1} muda a inclinação do jogador: ${l.trim().slice(0, 110)}`); });
  const fol = cam.filter(l => /OPT\.follow\s*&&/.test(l)); if (!fol.length || fol.some(l => !/inFwd/.test(l))) fails.push('a câmera não briga (D-368): o seguir as costas do cam3d.js não pergunta se o corpo anda para a frente (inFwd)'); }
// 125. "a borda só quando se pede" (D-360): o corpo sobe uma borda com as mãos só depois do pulo do jogador — junto dela (tryClimb do
// salto) ou no ar, logo depois de pular (b.jumpT) —, e para sair da água (a braçada ou o empurrão na margem); nunca por encostar
(src['avatar.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\btryClimb\(/.test(c) && !/function tryClimb\(/.test(c) && !/tryClimb\(fx, fz, 0\.95\)|b\.jumpT < 0\.8|b\.stroke > 0/.test(c)) fails.push(`a borda só quando se pede (D-360): avatar.js:${k + 1} sobe uma borda sem o pulo: ${l.trim().slice(0, 110)}`); });
// 126. "as vontades das mãos têm uma porta" (D-355): só o input3d.js e o modes.js escrevem o que o jogador quer do corpo
// (G.Avatar.input: o empurrão, a corrida, o pulo, a esquiva, o agachar, a mira) — um módulo que queira pedir algo ao corpo pede por
// uma ação (Input3D.press / fire) ou pela porta do controle (Avatar.crouch, Avatar.act)
for (const f of files) { if (f === 'modes.js' || f === 'input3d.js' || f === 'avatar.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/Avatar\.input\.\w+\s*=(?!=)/.test(c)) fails.push(`as vontades das mãos (D-355): ${f}:${k + 1} escreve G.Avatar.input — peça por uma ação do Input3D: ${l.trim().slice(0, 110)}`); }); }
// === 20c: o inventário ===
// 127. "a mochila é um lugar do depósito, de um dono só" (D-336): o lugar 'm:' do G.Depot só o js/inventario.js registra
// (D.addKind('m', …)) — o adaptador dele é a única escrita da mochila que o depósito faz
{ for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (f !== 'inventario.js' && /\baddKind\(\s*'m'/.test(c)) fails.push(`a mochila do depósito: ${f}:${k + 1} registra o lugar 'm:' fora do inventario.js (D-336): ${l.trim().slice(0, 110)}`); });
  if (!(src['inventario.js'] || []).some(l => /\bD\.addKind\(\s*'m'/.test(l))) fails.push('a mochila do depósito: o inventario.js não registra o lugar \'m:\' (D-336)'); }
// 128. "quem pergunta pelas coisas de alguém pergunta ao G.Inv" (D-336): só o js/inventario.js lê o v.mochila e o v.equip de uma
// pessoa — o 3D, a tela, o combate e os ofícios perguntam ao G.Inv (held, kit, bag, count, list, equipOf), que dizem o
// equipamento já feito verdade (a carga nas mãos, as duas mãos, o kit do ofício)
{ for (const f of files) if (f !== 'inventario.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/(?<!\bInv)\.(mochila|equip)\b(?!\s*[:(])/.test(c) && !/['"`](mochila|equip)['"`]/.test(c)) fails.push(`as coisas de alguém: ${f}:${k + 1} lê a mochila ou o equipamento de uma pessoa fora do inventario.js (D-336; pergunte ao G.Inv): ${l.trim().slice(0, 110)}`); }); }
// 129. "a tela da mochila pede pelas mãos do corpo" (D-336, L-139): no js/inv-ui.js, toda porta do G.Inv que muda o mundo (equipar,
// guardar, sacar, um atalho, dar, pegar, guardar, largar, trocar no armazém) é pedida dentro de um G.Possess.apply( — na mesma
// linha ou numa das duas antes —: o passo do mundo a faz, e a tela só conta a resposta
{ const ui = src['inv-ui.js'] || []; const DOOR = /\bInv\.(equip|unequip|stow|draw|toggle|quick|shortcut|give|take|put|drop|pick|make|unmake|realize|settle|repair)\(/;
  ui.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (!DOOR.test(c)) return;
    let inApply = false; for (let j = k; j >= Math.max(0, k - 2); j--) if (/\bPossess\.apply\(/.test(ui[j])) inApply = true;
    if (!inApply) fails.push(`a tela da mochila: inv-ui.js:${k + 1} pede uma porta do inventário fora das mãos do corpo (G.Possess.apply; D-336): ${l.trim().slice(0, 110)}`); }); }
// 130. "o catálogo é lido, nunca escrito" (D-337, D-370): ninguém escreve na tabela dos itens (G.Itens.KINDS, MATS, SLOTS) — ela
// nasce congelada no js/itens.js, e uma escrita num arquivo do jogo quebra na hora
{ for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bItens\.(KINDS|MATS|SLOTS|SLOT_NOME|TAG_NOME|TIPO_NOME)\b[^=;]*?(\.\w+|\[[^\]]*\])\s*(=(?!=)|\+=|-=|\+\+|--)|\bItens\.(KINDS|MATS|SLOTS)\s*=(?!=)/.test(c)) fails.push(`o catálogo: ${f}:${k + 1} escreve na tabela dos itens (D-337): ${l.trim().slice(0, 110)}`); });
  const it = (src['itens.js'] || []).join('\n'); if (!/Object\.freeze\(K\)/.test(it) || !/Object\.freeze\(M\)/.test(it)) fails.push('o catálogo: o js/itens.js não congela a tabela (Object.freeze(K), Object.freeze(M); D-370)'); }
// 131. "o inventário não sorteia" (D-372): o que alguém leva e segura é do ofício, do ato, do povo e das portas — nem o acaso do mundo
// nem o do que só se vê: o js/inventario.js e o js/inv-ui.js não tiram de acaso nenhum (a escolha por pessoa, quando houver, é
// pelo G.hash do id)
{ const CH = /\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/;
  for (const f of ['inventario.js', 'inv-ui.js']) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (CH.test(c)) fails.push(`o inventário sem acaso: ${f}:${k + 1} tira de um acaso (D-372): ${l.trim().slice(0, 110)}`); }); }
// 132. "toda mudança das coisas vai ao livro com a causa" (D-336, regra 12): no js/inventario.js, cada movimento do depósito
// (D.move, D.make, D.use, D.drop) diz o código da causa na mesma linha — o livro-razão diz por que cada coisa mudou de lugar
{ (src['inventario.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bD\.(move|make|use|drop)\(/.test(c) && !/\bcode\b/.test(c)) fails.push(`o livro do inventário: inventario.js:${k + 1} move uma coisa sem dizer a causa (code; D-336): ${l.trim().slice(0, 110)}`); }); }
// 133. "as coisas do ofício viram coisas uma vez só" (D-374): o código 'kit' do livro — as coisas do ofício que nascem na mochila
// de quem o deus vive — só o G.Inv.realize escreve, num lugar só do js/inventario.js, e a porta pergunta antes pela marca da
// pessoa (equip.kit): nunca duas vezes na mesma vida
{ let n = 0; for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/code:\s*'kit'/.test(c)) { if (f !== 'inventario.js') fails.push(`o kit do ofício: ${f}:${k + 1} faz coisas com o código 'kit' fora do inventario.js (D-374): ${l.trim().slice(0, 110)}`); else n++; } });
  const inv = (src['inventario.js'] || []).join('\n'); const rz = inv.slice(inv.indexOf('Inv.realize = function'), inv.indexOf('Inv.realize = function') + 400);
  if (n !== 1 || !/equip\.kit\)\s*return/.test(rz)) fails.push(`o kit do ofício: o código 'kit' ${n} vez(es) no inventario.js, ou o Inv.realize sem a pergunta pela marca equip.kit (D-374)`); }
// 134. "a tela da mochila entra pelas portas da tela do corpo" (D-339): o js/inv-ui.js põe o seu fecho em G.IncUI.closers, marca o seu
// painel por G.Modes.setPanel('mochila'), desenha a barra de atalhos só no lugar dela ('.ih-hotbar') e escuta as teclas pelas ações
// (G.Input3D.on('inventario' / 'rapidoN')) — e nenhum outro arquivo escuta essas ações
{ const ui = (src['inv-ui.js'] || []).join('\n');
  for (const [re, what] of [[/IncUI\.closers\.push\(/, 'o fecho em G.IncUI.closers'], [/Modes\.setPanel\('mochila'\)/, "o painel G.Modes.setPanel('mochila')"], [/'\.ih-hotbar'/, "a barra no lugar '.ih-hotbar'"], [/Input3D\.on\('inventario'/, "a tecla G.Input3D.on('inventario')"], [/Input3D\.on\('rapido'/, "os atalhos G.Input3D.on('rapido' + n)"]])
    if (!re.test(ui)) fails.push(`a tela da mochila: o inv-ui.js sem ${what} (D-339)`);
  for (const f of files) if (f !== 'inv-ui.js') src[f].forEach((l, k) => { if (/Input3D\.on\(\s*'(inventario|rapido)/.test(l)) fails.push(`a tela da mochila: ${f}:${k + 1} escuta a mochila ou um atalho fora do inv-ui.js (D-339): ${l.trim().slice(0, 110)}`); }); }
// === 20d: a arte dos itens ===
// 135. "a forma de uma coisa é pura" (D-385): a forma e a figura de cada coisa (js/itemforma.js, as receitas; js/itemarte.js, a
// porta) não leem o mundo (G.S), não tiram de acaso nenhum — o do mundo nem o do que só se vê —, não leem o relógio: a mesma
// chave é a mesma forma em toda máquina e em todo mundo (as figuras são feitas dela e dizem a assinatura dela)
{ for (const f of ['itemforma.js', 'itemarte.js']) { if (!(src[f] || []).length) { fails.push(`a forma pura: js/${f} não existe (D-385)`); continue; }
    src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
      if (/\bG\.S\b|\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random|\bDate\.|performance\.now/.test(c)) fails.push(`a forma pura: ${f}:${k + 1} lê o mundo, tira de um acaso ou lê o relógio (D-385): ${l.trim().slice(0, 110)}`); }); } }
// 136. "a figura é embutida e tem uma porta só" (D-390): as figuras (js/itemicons.js, gerado pelo qa/visual/itens-figuras.js) são só
// imagens embutidas (data:image/…;base64) — nada buscado em tempo de jogo —, e só o itemarte.js lê o arquivo delas (G.ITEMICONS) e
// as receitas (G.ItemForma): quem desenha ou mostra uma coisa pergunta ao G.ItemArt (geo, icon, grip, stow, marks)
{ const ic = (src['itemicons.js'] || []).join('\n'); const m = ic.match(/G\.ITEMICONS = (\{[\s\S]*\});\s*$/);
  if (!m) fails.push('a figura embutida: js/itemicons.js não tem o G.ITEMICONS (gere: qa/visual/itens-figuras.js; D-390)');
  else { let d = null; try { d = JSON.parse(m[1]); } catch (e) { fails.push('a figura embutida: o G.ITEMICONS do js/itemicons.js não é um objeto de dados (D-390)'); }
    if (d) for (const k in d.img || {}) if (!/^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/.test(d.img[k])) fails.push(`a figura embutida: a figura de ${k} não é uma imagem embutida (D-390)`); }
  for (const f of files) if (f !== 'itemarte.js' && f !== 'itemicons.js' && f !== 'itemforma.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(ITEMICONS|ItemForma)\b/.test(c)) fails.push(`a figura embutida: ${f}:${k + 1} lê as figuras ou as receitas das coisas fora do itemarte.js (pergunte ao G.ItemArt; D-390): ${l.trim().slice(0, 110)}`); }); }
// 137. "toda coisa do catálogo tem a sua receita" (D-388): cada tipo do G.Itens.KINDS tem a sua receita no js/itemforma.js (R.<tipo>)
// e cada material do G.Itens.MATS o seu lugar na tabela dos materiais (F.MATS) — um tipo ou um material novo no catálogo chega com a
// sua forma (e a sua figura: o qa/visual/itens-arte.js cobra)
{ const it = src['itens.js'] || [], fo = (src['itemforma.js'] || []).join('\n');
  const kinds = []; const mats = []; let where = null;
  for (const l of it) { if (/It\.KINDS = \{/.test(l)) where = 'k'; else if (/It\.MATS = \{/.test(l)) where = 'm'; else if (/^\s*\};/.test(l)) where = null;
    const e = l.match(/^\s+(\w+): \{ nome:/); if (e && where === 'k') kinds.push(e[1]); if (e && where === 'm') mats.push(e[1]); }
  if (!kinds.length || !mats.length) fails.push('a receita de cada coisa: não achei os tipos ou os materiais no js/itens.js (a tabela mudou de forma? D-388)');
  for (const k of kinds) if (!new RegExp(`\\bR\\.${k} = \\(`).test(fo)) fails.push(`a receita de cada coisa: o tipo ${k} do catálogo não tem receita no js/itemforma.js (R.${k}; D-388)`);
  const fm = (fo.match(/F\.MATS = \{([^}]*)\}/) || [])[1] || ''; for (const m of mats) if (!new RegExp(`\\b${m}:`).test(fm)) fails.push(`a receita de cada coisa: o material ${m} do catálogo não está no F.MATS do js/itemforma.js (D-388)`); }
// === 20e: a interação ===
// === 20f: o combate ===
// 145. "o golpe fere só pelas portas do mundo" (D-410, D-414): o combate tira vida de alguém só pelo G.Vg.damage (as pessoas) e pelo
// G.Animals.damage (os bichos) — nunca a vida escrita à mão —; e o que só se vê e as mãos (combate-ui.js, combate3d.js,
// combate-clips.js) não escrevem nada numa pessoa nem num bicho do mundo (a vida, o chão, o tranco, o lugar, a tarefa)
{ const CB = ['combate.js', 'combate-ui.js', 'combate3d.js', 'combate-clips.js'];
  for (const f of CB) if (!(src[f] || []).length) fails.push(`o golpe pelas portas: js/${f} não existe (D-410)`);
  for (const f of CB) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\b(v|o|a|w|t|tg|vb|body)\.hp\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`o golpe pelas portas: ${f}:${k + 1} escreve a vida de alguém à mão (G.Vg.damage, G.Animals.damage — D-414): ${l.trim().slice(0, 110)}`);
    if (f !== 'combate.js' && /\b(v|o|a|w|t|vb|body|e)\.(downT|stagT|x|y|task|act|actT|fx|fy|hurt)\s*(=(?!=)|\+=|-=)/.test(c)) fails.push(`o golpe pelas portas: ${f}:${k + 1} escreve numa pessoa ou num bicho do mundo fora do passo (só o combate.js, no passo — D-410): ${l.trim().slice(0, 110)}`); }); }
// 146. "o golpe muda o mundo só no passo" (D-410, L-139): no combate-ui.js, toda porta do G.Combate que muda o mundo (o golpe, a guarda,
// o tiro, o desafio, o fim do duelo) é pedida pelas mãos do corpo — dentro de um G.Possess.apply( na mesma linha, ou no op de um
// Avatar.act (que o pede no contato) —; e no combate.js cada uma dessas portas começa perguntando se está no passo (inStep)
{ const ui = src['combate-ui.js'] || [], cb = (src['combate.js'] || []).join('\n');
  ui.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bCb\.(strike|guard|shoot|challenge|wound|endDuel)\(/.test(c) && !/Possess\.apply\(/.test(c) && !/\bop: wv => Cb\./.test(c)) fails.push(`o golpe no passo: combate-ui.js:${k + 1} pede uma porta do combate fora das mãos do corpo (G.Possess.apply, o op do Avatar.act — D-410): ${l.trim().slice(0, 110)}`); });
  for (const d of ['strike', 'guard', 'shoot', 'challenge']) { const i = cb.indexOf(`Cb.${d} = function`); if (i < 0 || !/if \(!inStep\(\)\) return NO;/.test(cb.slice(i, i + 240))) fails.push(`o golpe no passo: o combate.js sem a porta Cb.${d} que pergunta pelo passo (inStep — D-410)`); } }
// 147. "o que só se vê do combate não sorteia nem decide" (D-421): o combate3d.js e o combate-clips.js não tiram do acaso do mundo (o
// que piscar tira do G.VR), não pedem nada ao mundo (Possess.apply, setTask, o livro, as portas que mudam o G.Inv) e não leem as
// teclas; o combate.js não desenha (THREE, a cena, as figuras)
{ for (const f of ['combate3d.js', 'combate-clips.js']) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\()|Math\.random|Possess\.apply\(|setTask\(|\bDepot\.|\bInv\.(equip|unequip|stow|draw|toggle|give|take|put|drop|pick|make|unmake)\(|Input3D\.(on|onUp|fire|press)\(/.test(c)) fails.push(`o que só se vê do combate: ${f}:${k + 1} sorteia do mundo, pede ao mundo ou lê as teclas (D-421): ${l.trim().slice(0, 110)}`); });
  (src['combate.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bTHREE\b|\bG\.Realm\b|\bdocument\b|\bG\.People3D\b|\bG\.Render\b/.test(c)) fails.push(`o que só se vê do combate: combate.js:${k + 1} desenha (o mundo do combate não desenha — D-421): ${l.trim().slice(0, 110)}`); }); }
// 148. "os gestos do combate pelo registro" (D-342, D-416): os clipes do combate nascem só pela fila G.ANIM_CLIPS (o combate-clips.js
// não chama o Anim.clip nem escreve o CLIPS ou o CLIP_OF à mão); e todo gesto que um golpe do G.Combate.MOVES nomeia (clip: 'cb-…')
// é um id que o combate-clips.js monta (cb-<jeito>-<n|p>, de um jeito que ele desenha)
{ const cc = src['combate-clips.js'] || [], cb = (src['combate.js'] || []).join('\n');
  cc.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bAnim3D\.clip\(|\bA\.clip\(|\bCLIPS\s*(\[|\.\w+\s*=)|\bCLIP_OF\s*(\[|\.\w+\s*=)/.test(c)) fails.push(`os gestos do combate: combate-clips.js:${k + 1} registra um clipe fora da fila G.ANIM_CLIPS (D-342): ${l.trim().slice(0, 110)}`); });
  if (!cc.some(l => /G\.ANIM_CLIPS/.test(l))) fails.push('os gestos do combate: o combate-clips.js não registra pela fila G.ANIM_CLIPS (D-342)');
  const drawn = new Set(); for (const l of cc) { const m = l.match(/for \(const cls of \[([^\]]+)\]\)/); if (m) for (const q of m[1].matchAll(/'(\w+)'/g)) drawn.add(q[1]); }
  for (const m of cb.matchAll(/clip: 'cb-(\w+)-(\d|p)'/g)) if (!drawn.has(m[1])) fails.push(`os gestos do combate: o golpe cb-${m[1]}-${m[2]} do combate.js não é de um jeito que o combate-clips.js desenha (${[...drawn].join(', ')})`); }
// 149. "o fôlego e o peso do golpe pelas portas do corpo" (D-417): o fôlego do corpo (b.stamina) só o avatar.js escreve — o combate
// o gasta pelo G.Avatar.spend —, e o instante de peso de um golpe que acerta é o G.Avatar.hitstop; ninguém além do avatar.js escreve
// o estado do controle (G.Avatar.state()) nem o seu fôlego
{ for (const f of files) { if (f === 'avatar.js') continue; src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\b(Avatar\.state\(\)|\bb)\.(stamina|stopT|regenT)\s*(=(?!=)|\+=|-=)/.test(c) && ['combate.js', 'combate-ui.js', 'combate3d.js', 'combate-clips.js', 'modes.js', 'incui.js'].includes(f)) fails.push(`o fôlego pelas portas: ${f}:${k + 1} escreve o fôlego ou o tempo do corpo fora do avatar.js (G.Avatar.spend, hitstop — D-417): ${l.trim().slice(0, 110)}`); }); }
  const av = (src['avatar.js'] || []).join('\n'); if (!/Av\.spend = function/.test(av) || !/Av\.hitstop = /.test(av)) fails.push('o fôlego pelas portas: o avatar.js sem as portas Av.spend e Av.hitstop (D-417)');
  if (!(src['combate-ui.js'] || []).some(l => /\bAv\.spend\(/.test(l))) fails.push('o fôlego pelas portas: o golpe do combate-ui.js não gasta o fôlego pelo Avatar.spend (D-417)'); }
// 150. "a flecha no ar é do livro, e quem luta com o corpo luta pelo corpo" (D-419, D-420): o lugar 'a:' do G.Depot (as flechas no
// ar) só o combate.js registra, e cada movimento do livro ali diz a sua causa (code); e o war.js pergunta ao G.Combate.reach a que
// distância se golpeia (o corpo pela pele e pela arma; os outros à distância de sempre — o mesmo mundo sem corpo)
{ for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (f !== 'combate.js' && /\baddKind\(\s*'a'/.test(c)) fails.push(`a flecha do livro: ${f}:${k + 1} registra o lugar 'a:' fora do combate.js (D-419): ${l.trim().slice(0, 110)}`); });
  const cb = src['combate.js'] || []; if (!cb.some(l => /G\.Depot\.addKind\('a'/.test(l))) fails.push("a flecha do livro: o combate.js não registra o lugar 'a:' (D-419)");
  cb.forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bDepot\.(move|make|use|drop)\(/.test(c) && !/\bcode\b/.test(c)) fails.push(`a flecha do livro: combate.js:${k + 1} move uma flecha sem dizer a causa (code — D-419): ${l.trim().slice(0, 110)}`); });
  if (!(src['war.js'] || []).some(l => /const R = G\.Combate \? G\.Combate\.reach\(v, o, 0\.85\) : 0\.85;/.test(l))) fails.push('quem luta com o corpo: o fightStep do war.js não pergunta ao G.Combate.reach a que distância golpeia (D-420)');
  // (and the guard of the body is asked before a blow reaches it — the possess.js's door of a hurt to the body: the dodge's window,
  // the parry, the shield — D-415)
  if (!(src['possess.js'] || []).some(l => /amt = G\.Combate\.shield\(v, amt, cause, by\); if \(!\(amt > 0\)\) return;/.test(l))) fails.push('a guarda do corpo: o Vg.damage do possess.js não pergunta ao G.Combate.shield antes de o golpe chegar ao corpo (D-415)'); }
// 151. "todo ato do combate tem a sua linha de som" (D-166, D-422): o que o mundo vê o corpo fazendo num golpe, numa guarda, no arco
// (o vact dos atos do combate-ui.js) e os atos que os clipes do combate mostram (acts) têm a sua linha na tabela A.ATO do
// audio-src.js — um som, ou o silêncio dito
{ const as = (src['audio-src.js'] || []).join('\n'); const t0 = as.indexOf('A.ATO = {'); const ato = t0 < 0 ? '' : as.slice(t0, as.indexOf('\n  };', t0));
  const acts = new Set(); for (const f of ['combate-ui.js', 'combate-clips.js']) for (const l of src[f] || []) { for (const m of l.matchAll(/\bvact: '(\w+)'/g)) acts.add(m[1]); for (const m of l.matchAll(/\bacts: \[([^\]]*)\]/g)) for (const q of m[1].matchAll(/'(\w+)'/g)) acts.add(q[1]); }
  if (!acts.size) fails.push('o som do combate: não achei os atos do combate (vact, acts) no combate-ui.js e no combate-clips.js (D-422)');
  for (const a of acts) if (!new RegExp(`[\\s,{]${a}:`).test(ato)) fails.push(`o som do combate: o ato «${a}» do combate não tem linha na tabela A.ATO do audio-src.js (D-422)`); }
// === 20g: os ofícios ===
// === 20h: a origem das coisas ===
// 159. "a divisão é do origem.js" (D-441): as partes de cada bem (S.orig: a comida por origem, o metal das ferramentas e das armas) e o
// que cada povo já teve de cada material (S.orig.had) só o js/origem.js escreve — os outros perguntam (G.Origem.parts, amount, free,
// had, matOK, forged) e passam as partes do que movem à mão pelas portas dele (carried, came, levy, unlevy)
{ for (const f of files) if (f !== 'origem.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\.orig\b\s*(=(?!=)|\.\w+\s*(=(?!=)|\[)|\[)/.test(c) || /\borig\.(p|had|q|qw|t)\b/.test(c)) fails.push(`a divisão: ${f}:${k + 1} escreve ou mexe nas partes (S.orig) fora do origem.js (D-441): ${l.trim().slice(0, 110)}`); });
  if (!(src['origem.js'] || []).length) fails.push('a divisão: js/origem.js não existe (D-441)'); }
// 160. "o minério nasce da mina" (D-441): o minério de ferro, o cobre e o estanho nascem só do veio — a mina (economy.js) e a galeria
// da caverna (caves.js), no livro com o código 'mina' —; ninguém mais os faz (G.Depot.make) nem os põe à mão num armazém (addStock)
{ const ORE = /(make|addStock)\(\s*[^)]*'(minerio|cobre|estanho)'/;
  for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (ORE.test(c) && f !== 'economy.js' && f !== 'caves.js') fails.push(`o minério da mina: ${f}:${k + 1} faz minério fora da mina (D-441): ${l.trim().slice(0, 110)}`); });
  for (const f of ['economy.js', 'caves.js']) { const t = (src[f] || []).join('\n'); if (!/make\([^;]*code: 'mina'/.test(t)) fails.push(`o minério da mina: o ${f} sem a linha do livro «mina» (D-441)`); } }
// 161. "só a forja faz bem de metal" (D-441): as ferramentas e as armas de um armazém nascem da fornada da forja (act-oficio.js, o
// bem da receita, com o metal dela: of: R.mat) ou voltam de uma coisa feita delas (inventario.js); ninguém as faz com o bem escrito
// (G.Depot.make(…'armas'…), addStock('armas'…)), e a escrita à mão do estoque só na volta da leva, com a parte dela (G.Origem.unlevy)
{ const MK = /(make|addStock)\(\s*[^)]*'(armas|ferramentas)'/; const ADD = /stock\.(armas|ferramentas)\s*(\+=|=\s*\([^)]*\)\s*\+)/;
  for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (MK.test(c) && f !== 'devmode.js') fails.push(`o metal da forja: ${f}:${k + 1} faz ferramentas ou armas sem forja (D-441): ${l.trim().slice(0, 110)}`);
    if (ADD.test(c) && f !== 'devmode.js' && !/Origem\.unlevy/.test(c)) fails.push(`o metal da forja: ${f}:${k + 1} soma ferramentas ou armas à mão sem a parte delas (G.Origem.unlevy; D-441): ${l.trim().slice(0, 110)}`); });
  const of = (src['act-oficio.js'] || []).join('\n');
  if (!/D\.make\('b:' \+ b\.id, R\.k, good, \{[^}]*of: R\.mat/.test(of)) fails.push('o metal da forja: a fornada do act-oficio.js não diz o metal do que faz (of: R.mat; D-441)'); }
// 162. "toda fornada gasta a sua receita" (D-440): a receita da forja trabalha o minério do seu metal (o ferro, do minério de ferro; o
// bronze, do cobre, com a etapa da liga que gasta o estanho pelo livro), e a mão que faz uma unidade gasta o que a receita tira
// (G.Depot.use do insumo, com as partes que ela pede: of: R.of) — no act-oficio.js; e a salga gasta a carne ou o peixe que salga
{ const of = (src['act-oficio.js'] || []).join('\n'), es = (src['estates.js'] || []).join('\n');
  if (!/const forged = [^\n]*in: mat === 'ferro' \? 'minerio' : 'cobre'/.test(of)) fails.push('a receita gasta: a forja não trabalha o minério do seu metal (D-440)');
  if (!/kind: 'liga', k: 'estanho'/.test(of) || !/code: 'liga'/.test(of)) fails.push('a receita gasta: o bronze sem a etapa da liga que gasta o estanho pelo livro (D-440)');
  if (!/D\.use\('b:' \+ b\.id, R\.in, taken, \{[^}]*of: R\.of/.test(of)) fails.push('a receita gasta: a unidade de uma fornada não gasta as partes que a receita pede (of: R.of; D-440)');
  if (!/D\.use\(ref, 'food', 4, \{[^}]*\bof: [^u}]/.test(es)) fails.push('a receita gasta: a salga não diz a carne ou o peixe que salga (D-445)'); }
// 163. "ninguém escolhe o material de uma coisa só pela arte" (D-442, D-443): o material de uma coisa é o que o povo tem (G.Origem) —
// o «melhor material que o povo sabe» (G.Itens.best, bestMat) é só do catálogo; e a luta, o anzol e a roupa perguntam pelo metal
// tido (G.Origem.forged / had), nunca só pela arte (Civ.has(…, 'bronze' | 'ferro'))
{ for (const f of files) if (f !== 'itens.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\b(It|Itens|T)\(?\)?\.(best|bestMat)\(/.test(c)) fails.push(`o material pela arte: ${f}:${k + 1} escolhe o material de uma coisa pelas artes (pergunte ao G.Origem / G.Inv.made; D-442): ${l.trim().slice(0, 110)}`); });
  for (const f of ['war.js', 'army.js', 'siege.js', 'naval.js', 'act-pesca.js', 'atmos.js', 'inventario.js']) (src[f] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/Civ\.has\([^)]*'(bronze|ferro)'\)/.test(c)) fails.push(`o metal pela arte: ${f}:${k + 1} pergunta só pela arte do metal (G.Origem.forged; D-443): ${l.trim().slice(0, 110)}`); }); }
// 164. "o kit e o armazém dão o material que o povo tem" (D-442): no js/inventario.js, o material do kit é o que o povo teve
// (G.Origem.matOK) e o que o armazém dá é o que a divisão dele tem (Inv.offer, pelo que a coisa é feita: G.Itens.feitoDe)
{ const iv = (src['inventario.js'] || []).join('\n');
  if (!/\bOr\(\)\.matOK\(|Origem\.matOK\(/.test(iv)) fails.push('o kit pelo que o povo tem: o inventario.js não pergunta ao G.Origem.matOK (D-442)');
  if (!/Inv\.offer = function/.test(iv) || !/It\.feitoDe\(/.test(iv)) fails.push('o armazém pelo que tem: o inventario.js sem o Inv.offer pelo que a coisa é feita (D-442)'); }
// 165. "a comida diz de onde veio" (D-441): quem faz comida (G.Depot.make(…'food'…)) diz a causa que diz a origem (pesca, ordenha, ovos,
// abate, caca, sacrificio, horta, fruta) ou a parte (of:, ou as marcas tag/rec), e quem a põe à mão num armazém (addStock('food'…))
// diz a parte ou as partes que trouxe (o quarto argumento): nada de comida sem origem
{ const FOOD_MK = /make\(\s*[^,]+,\s*'food'/; const CODE = /code: '(pesca|ordenha|ovos|abate|caca|sacrificio|horta|fruta)'|\bof:|tag: \{ meat|rec: \{ fish/;
  for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (FOOD_MK.test(c) && !CODE.test(c) && f !== 'devmode.js') fails.push(`a comida com origem: ${f}:${k + 1} faz comida sem dizer de onde (D-441): ${l.trim().slice(0, 110)}`);
    for (const m of c.matchAll(/addStock\(\s*'food'\s*,([^;]*)/g)) { const args = m[1]; let depth = 1, n = 1; for (const ch of args) { if (ch === '(') depth++; else if (ch === ')') { depth--; if (!depth) break; } else if (ch === ',' && depth === 1) n++; } if (n < 3) fails.push(`a comida com origem: ${f}:${k + 1} põe comida num armazém sem a parte dela (o 4.º argumento do addStock; D-441): ${l.trim().slice(0, 110)}`); } }); }
// 166. "o cobre e o estanho têm jazida, e toda jazida o seu bem" (D-441): o economy.js tem os bens do cobre e do estanho, faz as
// jazidas deles pela semente (E.genBronze, chamado do genDeposits e do load de um save de antes) e diz o bem de cada tipo de jazida
// (E.ORE_GOOD); o caves.js tira do veio de cobre o cobre e do de estanho o estanho
{ const ec = (src['economy.js'] || []).join('\n'), cv = (src['caves.js'] || []).join('\n');
  if (!/\bcobre: \{ name: 'cobre'/.test(ec) || !/\bestanho: \{ name: 'estanho'/.test(ec)) fails.push('a jazida do bronze: o economy.js sem os bens do cobre e do estanho (D-441)');
  if (!/E\.ORE_GOOD = \{ ferro: 'minerio', ouro: 'ouro', cobre: 'cobre', estanho: 'estanho' \}/.test(ec)) fails.push('a jazida do bronze: o E.ORE_GOOD não diz o bem de cada jazida (D-441)');
  if (!/E\.genBronze = function/.test(ec) || !/\n\s*E\.genBronze\(S\);\n/.test(ec) || !/E\.genBronze\(S\); else S\.oresV/.test(ec)) fails.push('a jazida do bronze: o E.genBronze não é chamado do genDeposits e do load (D-441)');
  if (!/id: 'cobre', name: 'cobre', col: '[^']+', good: 'cobre'/.test(cv) || !/id: 'estanho', name: 'estanho', col: '[^']+', good: 'estanho'/.test(cv)) fails.push('a jazida do bronze: o veio de cobre ou de estanho da caverna não dá o seu metal (D-441)'); }
if (fails.length) { console.log(fails.join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
console.log(`PASSOU (${files.length} arquivos)`);
