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
const LOOK = ['render.js', 'fx.js', 'audio.js', 'cinema.js', 'sky.js', 'photo.js', 'minimap.js', 'ui.js', 'story-ui.js', 'sea-ui.js', 'wars-ui.js', 'story-track.js', 'art.js', 'arch.js', 'cityart.js', 'cave-art.js', 'fauna-art.js', 'talk.js',
  'space.js', 'tex3d.js', 'ground3d.js', 'realm3d.js', 'build3d.js', 'people3d.js', 'fx3d.js', 'dragon3d.js', 'things3d.js', 'grass3d.js', 'cam3d.js', 'input3d.js', 'incui.js', 'diario-ui.js', 'modes.js', 'mesh3d.js', 'mesh-dragao.js', 'mesh-dragao2.js', 'mesh-runa.js', 'mesh-portal.js', 'mesh-empena.js', 'mesh-casco.js', 'mesh-banca.js', 'props3d.js', 'body3d.js', 'bodymesh.js', 'post3d.js', 'int-planta.js']; // (the 3D view of the Modo Encarnado: only seen)
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
// degraus diante da porta, feita de novo — e pelo treesAround, as árvores de que ela depende, lidas do mundo (L-206); outra
// pergunta faria o passo do mundo depender do que o 3D guarda (os memos do space.js), e o mundo seria outro com ou sem alguém
// olhando
const SPACE_BODY = ['possess.js', 'avatar.js', 'interact.js'];
// 24. "o diário só pede" (D-061): deixar um objetivo de lado é do corpo — G.Casa.giveUp só dentro de um G.Possess.apply (o
// pedido das mãos, que o mundo faz no seu passo), na mesma linha; a tela do diário, e todo o resto, nunca o chama direto
const GIVEUP = /\bCasa\.giveUp\s*\(/;
const SPACE_ASK = ['entryFits', 'treesAround'];
// 31. "a despensa só pelo livro": a despensa de uma casa (h.pantry) muda só pelo G.Depot — os adaptadores do depósito
// (activity.js) são a escrita; fora dele, nenhuma escrita à mão. As duas que restam são do trabalho (T-130: o fim do dia em
// casa e o tributo), nomeadas até passarem pelo livro — então a lista fica vazia
const PANTRY_WRITE = /\.pantry\s*(=(?!=)|\+=|-=|\+\+|--)/;
const PANTRY_OK = [['economy.js', 'h.pantry -= 1; v.hunger'], ['court.js', 'h.pantry -= n; t.bag += n']]; // (T-130)
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
const FORMA_ASK = ['of', 'has', 'body', 'uses', 'solids', 'flight', 'toLot', 'dirLot'];
// 37. "o grão é do mundo" (L-394): só o passo do mundo pede o grão de uma fazenda ao Estates.grainOf, que o guarda na fazenda
// (b.grain) na primeira vez; o que só se vê ou se ouve (a lista LOOK da regra 3) e o cartão do corpo (interact.js) leem pelo
// Estates.grainFor, que não guarda nada — o nome da fazenda também (Village.nameOf)
const GRAIN_LOOK = LOOK.concat(['interact.js']);
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
  if (PANTRY_WRITE.test(line) && f !== 'activity.js' && !ok(PANTRY_OK, f, line)) fails.push(`despensa: ${f}:${k + 1} escreve a despensa de uma casa à mão (use G.Depot.move/make/use, que anota a causa): ${line.trim().slice(0, 110)}`);
  if (LAR_TASK.test(line) && f !== 'act-lar.js') fails.push(`lar: ${f}:${k + 1} dá a tarefa 'lar' fora de act-lar.js (a noite em casa é do G.Lar): ${line.trim().slice(0, 110)}`);
  if (FEST_TASK.test(line) && f !== 'festivals.js') fails.push(`festa: ${f}:${k + 1} dá a tarefa 'fest' fora de festivals.js (quem entra na festa passa pelo free() dela): ${line.trim().slice(0, 110)}`);
  if (CARRIER_WRITE.test(line) && f !== 'villagers.js') fails.push(`colo: ${f}:${k + 1} escreve quem segura um bebê (.carrier) fora de villagers.js (use G.Vg.handBaby): ${line.trim().slice(0, 110)}`);
  if (CUSTO_WRITE.test(line) && !CUSTO_FILES.includes(f)) fails.push(`custo: ${f}:${k + 1} escreve o que a casa custou (.custo) fora de act-casa.js e social.js: ${line.trim().slice(0, 110)}`);
  if (f === 'forma.js') { const c = line.replace(/(^|\s)\/\/\s.*$/, ''); if (ANY_CHANCE.test(c) || /Math\.random\s*\(/.test(c) || FORMA_WORLD.test(c) || FORMA_VIEW.test(c)) fails.push(`forma: ${f}:${k + 1} a forma tira do acaso, lê o mundo ou lê o 3D/a tela (ela é pura: os números do deus, por tipo e povo): ${line.trim().slice(0, 110)}`); }
  if (!LOOK.includes(f) && f !== 'forma.js') for (const m of line.replace(/(^|\s)\/\/\s.*$/, '').matchAll(/\bForma\.(\w+)/g)) if (!FORMA_ASK.includes(m[1])) fails.push(`forma: ${f}:${k + 1} o mundo pergunta à forma por ${m[1]} (só as perguntas da planta: ${FORMA_ASK.join(', ')}): ${line.trim().slice(0, 110)}`);
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
  const types = new Set([...(src['forma.js'] || []).join('\n').matchAll(/\bdef\('([a-z_]+)'/g)].map(m => m[1])); const L = src['build3d.js'] || [];
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
if (fails.length) { console.log(fails.join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
console.log(`PASSOU (${files.length} arquivos)`);
