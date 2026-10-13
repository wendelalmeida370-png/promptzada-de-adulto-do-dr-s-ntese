# Projeto Encarnação — relatório de entrega (v32, e a v33: o visual)

> Escrito para ser lido por quem não programa. Onde diz **testado**, há uma prova que roda de verdade e o resultado
> está anotado; onde diz **não testado**, não houve como provar aqui — e está dito.

## 1. O jogo que encontrei (a auditoria)

O mundo inteiro mora num único estado (`G.S`): o mapa em casas (tipo de chão, alturas nas quinas, nível da água,
penhascos, estradas, muros, prédios), as pessoas, os bichos, as árvores, os navios, os povos. A simulação avança em
passos de até 0,05 s, cada módulo isolado (um que quebra não derruba os outros). As pessoas decidem sozinhas
(necessidades → emergências → decidir → fazer a tarefa); toda ordem chega por `setTask`. O desenho do Modo Deus é um
Canvas 2D isométrico que só lê o estado. O save guarda o estado e cada módulo guarda o seu. Detalhes em
`ENCARNACAO.md` §1. As limitações que importavam: nada impedia a IA (ou uma cena, ou a guerra) de mexer numa pessoa a
qualquer hora — foi preciso criar a autoridade da posse; e o mapa é pequeno para viagens épicas (128–256 casas = 0,5–1 km).

## 2. As decisões principais

- **Um mundo só**: o 3D não tem estado próprio do mundo; desenha o que `G.S` diz, a cada quadro.
- **Escala**: 1 casa = 4 m, 1 unidade de altura = 1,5 m (uma casa de uma casa é um chalé de 4×4 m; os morros de 10–20
  unidades viram 15–28 m; o mar fica a 3 m).
- **Tempo** (D-015): encarnado, o mundo corre a 0,35× do 1× do Modo Deus — o passo de uma pessoa.
- **Autoridade**: uma marca no corpo (`avatar`, prioridade 100) e uma porta (`G.Possess.ask`) por onde passam todas as
  ordens: pedido vira chamado, força do mundo toma o corpo de volta.
- **Onde se pisa** é a mesma regra das pessoas do mundo (`W.walkable`).
- **LOD só do desenho** (D-017): a simulação de todos continua como sempre.

## 3. O renderizador 3D

**Three.js r170**, embutido no jogo (`js/lib/three.min.js`, 685 KB, licença MIT, gerado por `tools/vendor-three.sh`).
Por quê: é maduro, roda em qualquer navegador com WebGL (WebGL2), tem instancing, sombras, neblina e materiais prontos,
e não exige build — o jogo continua abrindo com um clique no `index.html`, **sem internet**. O Modo Deus não foi
reescrito: continua no Canvas 2D; os dois desenhos leem o mesmo estado.

## 4. Como o estado do mundo é compartilhado

Não há cópia. Cada quadro, o 3D lê as alturas, as árvores, os prédios, as pessoas, os bichos, o fogo, o clima e os
navios de `G.S`. As imagens prontas de cada pedaço do mapa (chunks) guardam uma "assinatura" do que havia ali; quando o
mundo muda (uma árvore cai, uma casa sobe), o pedaço é refeito. O corpo controlado é a própria pessoa de `S.villagers`:
o controlador escreve a posição dela (em casas) a cada passo.

## 5. A correspondência espacial

`G.Space` converte casas ↔ metros (`toWorld`, `toTile`, `groundY`, `floorY`, `waterY`, `chunk`, `screen`) e responde o
que há num ponto (`surface`: chão, água rasa, água funda, penhasco, prédio, muro, borda) perguntando ao próprio mundo.
A tela nunca é fonte de verdade: a verdade é `v.x, v.y` em casas.

## 6. A posse

`ENCARNACAO.md` §4. Em resumo: `S.avatar` diz quem é o corpo; a pessoa continua com tudo que é dela; as necessidades
continuam (a fome, o sono, a idade, a doença, o fogo); a decisão própria para; os pedidos do mundo viram chamados no
HUD; prisão, captura, embarque e água tomam o corpo de volta; ao devolver, a IA decide de onde a pessoa está; a morte é
de verdade e fica registrada.

## 7. A transição

`ENCARNACAO.md` §3 (D-016): o olho 3D começa exatamente onde está o olho do deus (mesma direção, mesmo enquadramento,
lente quase ortográfica), as imagens se fundem, o mundo ganha profundidade e o olho desce em arco até as costas da
pessoa; a volta é o mesmo voo ao contrário, e a pessoa aparece selecionada e seguida no Modo Deus, exatamente onde ficou.

## 8. O que dá para jogar (e o que o teste provou)

Abra o jogo, selecione uma pessoa (a partir de 6 anos, livre, em terra) e clique em **Encarnar** no
painel dela (ou aperte **I**). Tudo abaixo foi **provado** pelo teste `qa/encarna.js`, que roda o jogo de verdade num
navegador automático (Playwright + Chromium), com o 3D desenhado de verdade (sem placa de vídeo — ver §13):

| Funcionalidade | Prova |
|---|---|
| Descer até uma pessoa real (a mesma, com id, família, casa e povo) e voltar ao Modo Deus com ela exatamente onde ficou, selecionada; a IA dela volta | e2, e4 |
| Andar, correr (com fôlego) e pular (com *coyote time* e *buffer*) na direção da câmera | e2, e6, e7 |
| Colisão com prédios, muros, água funda e penhascos — nunca dentro de nada, nunca preso encostado numa parede; ladeiras, estradas, bosque, costa, entre prédios | e6 |
| A câmera nunca dentro de chão, prédio, muro ou portão (passa pelo vão do portão) | e1, e6 (L-097) |
| A cidade 3D é a do mapa: cada prédio perto do corpo no seu lote e no seu chão; o chão 3D com a altura exata do mundo | e1 (metrópole) |
| Atravessar a metrópole a pé pelo caminho real: até o mercado, até o cais, até a porta mais longe | e1 |
| O mundo continua vivendo enquanto se está encarnado (nascimentos, mortes, crônica, gente andando longe dali); dormir acelera o tempo | e3 |
| Trocar de pessoa: A → Deus → B, e B → C de dentro (pela ficha); ninguém duplicado, nenhuma marca sobrando | e4 |
| A morte é de verdade (fogo, fome, uma queda de 40 m): o controle acaba, o deus volta, a biografia e a crônica contam | e5 |
| Salvar e carregar antes, durante (abre encarnado, no mesmo lugar), depois, após andar muito, após a morte; save danificado carrega limpo | e7 |
| 30 idas e voltas (com saves no meio) sem acumular memória, HUD ou ouvintes; caminhada longa com chunks indo e vindo; salto de 10 anos depois | e8 |
| O mundo toma o corpo quando é ele quem manda: capturado por inimigos, levado a um navio, a terra afunda (vira água); um prédio que nasce em cima empurra o corpo | e9 |
| Pedidos do mundo viram **chamados** no HUD (o povo chama às armas, fogo!) — o corpo não é tirado do jogador; uma cena não toma o corpo | e9 |
| As mãos mudando o mundo: cortar uma árvore (ela cai pelo contador do lenhador), pegar a lenha, guardar no armazém (entra no estoque do povo), comer no armazém (sai do estoque, passa a fome), colher frutas, quebrar pedra, levar a pedra a uma obra (entra no que falta da construção), rezar no templo, entrar em casa pela porta e dormir | e9 |
| Conversar: a pessoa responde (o balão aparece também no Modo Deus) e abre a ficha com os dados reais dela (pais, filhos, casa…) | e9, e10 |
| Os feitos entram na biografia da pessoa ("Viveu um tempo guiada pelo deus: conversou com 1 pessoa, cortou 1 árvore, quebrou 2 pedras, …") | e9 |
| O botão Encarnar (e o motivo quando não pode: "pequena demais…"), a tecla I, Esc abre o menu e pausa, trocar teclas, G volta ao Modo Deus, o toque (polegar à esquerda anda, botões na tela) | e10 |

**Escrito, mas sem prova** (o código existe, mas nenhum teste confere que funciona — não conte como validado): as teclas W/A/S/D, Shift e Espaço em si (as provas apertam as *ações* do controle; as teclas de verdade só foram
provadas para Esc, G, I e a troca de teclas); segurar **E** para repetir os golpes no machado e na pedra; andar agachado
(**C**); girar a câmera com o mouse preso na tela (*pointer lock*) e a roda do mouse; a ficha "quem sou eu" (**Tab**); o menu de gráficos (qualidade, sensibilidade,
inverter, campo de visão); o aviso de quadros lentos; bater à porta de outra casa; ler as lápides; observar bichos.
**Nunca testado**: numa placa de vídeo de verdade, num celular de verdade, com um controle (gamepad).

## 9. O que usa arte provisória

Toda a arte 3D é **procedural e simples** (feita de caixas, cilindros, cones e esferas, sem texturas nem modelos):
- **Pessoas**: bonecos articulados (quadril, tronco, cabeça, cabelo, braços e pernas) com a cor de pele, cabelo e roupa
  do mundo; **sem rosto**, sem dedos, sem roupa detalhada. As animações são uma máquina de estados com poses
  calculadas (andar, correr, pular, golpear, colher, rezar, sentar, dormir…), **não** animações capturadas — são
  simples e às vezes rígidas. Longe, as pessoas viram figuras de cilindro e esfera.
- **Prédios**: caixas com telhado, janelas escuras (acendem à noite) e porta; a paleta é a da civilização, mas não há
  ornamentos, nem **interiores** (entrar em casa é só dormir; não se anda dentro).
- **Natureza**: árvores de tronco e copa geométrica por espécie; capim em tufos; pedras e arbustos simples; as
  plantações são fileiras de caixas (de perto, parecem blocos).
- **Bichos**: corpo e cabeça redondos com pernas; **navios**: casco, convés, mastro e vela de caixas.
- **Água**: um plano liso com transparência (sem ondas de verdade, sem reflexo); **fogo**: cones brilhantes; **chuva e
  neve**: pontos caindo.
- **Som**: não há som próprio do 3D; tocam os sons que o jogo já tinha (o machado, o ambiente).

## 10. O que fica para depois (não foi feito — e não é mostrado como feito)

- **Nadar, mergulhar, escalar, planar, montar**: não existem. Entrar na água funda **devolve o corpo ao mundo** (a
  pessoa nada sozinha e o deus volta). Os lugares já estão prontos: `Possess.caps` (as capacidades), `Avatar.addLoco`
  (um estado de locomoção novo é uma linha na tabela).
- **Combate**: não há luta controlada pelo jogador. Uma guerra que chega vira um chamado; uma luta de verdade toma o
  corpo de volta para a IA.
- **Interiores navegáveis**, **inventário**, **equipamento**, **habilidades**, **diálogo com escolhas**.
- **Viver as missões do motor de histórias por dentro**: o motor já recebe os feitos (`avatarDeed`) e
  `Possess.context()` entrega o que uma aventura precisa saber (quem, onde, histórias, família, chamados), mas nenhuma
  história ainda é jogada "de dentro".
- **Encarnar crianças pequenas, bichos, seres extraordinários, o próprio deus**: só `humano` existe; os tipos
  `extraordinario` e `avatarDivino` são lugares reservados (D-018).
- **Controle (gamepad)**: não há.
- **Mapas maiores para viagens longas**: o mundo tem 128–256 casas de lado (0,5–1 km); a fundação não aumenta o mapa
  à força (Parte XIII, item 38), mas a escala (`G.Space`) e os chunks já aceitam mapas maiores.

## 11. Arquivos criados e modificados

**Criados** (o Modo Encarnado inteiro):
| Arquivo | O que é |
|---|---|
| `js/lib/three.min.js` | Three.js r170 (MIT), embutido para funcionar sem internet; `tools/vendor-three.sh` diz como foi gerado |
| `js/space.js` | as escalas e a tradução casas ↔ metros; o que há num ponto |
| `js/realm3d.js` | o mundo 3D: renderizador, chunks perto/longe, terreno, água, vegetação, céu, luz, neblina, qualidade |
| `js/build3d.js` | os prédios reais em 3D (~50 tipos por civilização), muralhas, portões, aquedutos, plantações, lápides |
| `js/people3d.js` | as pessoas e os bichos reais em 3D, a máquina de estados das animações, o LOD do desenho |
| `js/fx3d.js` | o fogo, a chuva/neve e os navios reais |
| `js/possess.js` | a posse: quem é o corpo, a autoridade sobre a IA, chamados, devolver, a morte, os feitos, o save |
| `js/interact.js` | o registro de interações (conversar, portas, árvores, frutas, pedra, obras, bichos) e as fichas |
| `js/avatar.js` | o controlador do corpo (passo fixo, colisões, pulo, fôlego, estados de locomoção) |
| `js/cam3d.js` | a câmera em terceira pessoa com colisão |
| `js/input3d.js` | teclado, mouse e toque, com teclas trocáveis |
| `js/incui.js` | o HUD do corpo, fichas, menu, avisos, a tela da morte |
| `js/modes.js` | os modos (GOD, TO_INC, INC, TO_GOD, DYING), a descida e a subida, o tempo do corpo |
| `ENCARNACAO.md` | o documento da arquitetura |
| `qa/encarna.js` | o teste formal (e1–e10) |
| `qa/RELATORIO_ENCARNACAO.md` | este relatório |

**Modificados** (o mínimo, nas portas que já existiam):
`index.html` (os scripts novos), `js/main.js` (o quadro e as teclas passam pelos modos; o tempo do corpo),
`js/villagers.js` (`setTask`, `Vg.give` e o passo da pessoa perguntam à posse), `js/ui.js` (o botão Encarnar e a
ajuda), `js/scene.js` (uma cena não toma o corpo), `js/render.js` (as cores do chão emprestadas ao 3D),
`js/village.js` e `js/carnage.js` (a causa de morte "queda"), `css/style.css` (o HUD), `qa/qa.js` (o verificador do
corpo), `qa/guard.js` (regra 9: só o `possess.js` mexe em `S.avatar` e na marca `avatar`), `qa/regress.sh` (a fase
`encarnado`), `qa/AUDIT.md`, `qa/README.md`, `README.md`, `CLAUDE.md`.

## 12. Testes executados

- **`qa/encarna.js`** — o teste formal do Modo Encarnado: abre o jogo de verdade num navegador automático (Playwright,
  Chromium sem tela), carrega os mundos prontos `cidade` e `metropole` e joga: entra, anda, corre, pula, olha, conversa,
  corta, come, dorme, morre, salva, carrega, troca de pessoa, sobe e desce 30 vezes. **e1** cidade real · **e2** pessoa
  real · **e3** o mundo continua · **e4** troca · **e5** morte (fogo, fome, queda) · **e6** terreno · **e7** saves A–E ·
  **e8** estresse e desempenho · **e9** casos ruins e as mãos · **e10** interface — na regressão final, **71 de 71 provas passaram** (sem erro de página, sem erro de módulo, com o verificador do mundo limpo em cada parte). Também tira fotos
  (a cidade 3D, o mercado, o porto, a volta ao Modo Deus, depois da morte, o terreno), que eu olhei uma a uma.
- **O verificador do mundo** (`qa/qa.js`, seção `avatar`): ninguém além do corpo com a marca `avatar`; o corpo vivo,
  em terra, fora de navio, cadeia e cativeiro; `S.avatar` sempre apontando para uma pessoa viva. Roda em todas as
  provas acima e em todas as vidas longas da regressão.
- **O vigia do código** (`qa/guard.js`, regra 9): só o `possess.js` escreve `S.avatar` e dá a tarefa `avatar`.
- **Save antigo** (`qa/oldsave.js`): um mundo vivido 20 anos na v31, salvo, carregado nesta versão e vivido mais 20
  anos — nenhuma violação do verificador, nenhum erro. **A mesma vida de 5 anos** (`qa/soak.js 103`) na v31 e aqui:
  idêntica número por número.
- **A regressão completa** (`qa/regress.sh`): todas as provas do jogo (mar, guerra, vidas longas, saves, determinismo,
  painéis, desenho, cidade, poderes, desempenho) mais a fase nova `encarnado` — **198 provas, nenhuma falhando**. As diferenças para a v31: as 71 provas novas do Encarnado, e a prova 8 do mar, que agora passa (ela depende de uma expedição achar terra nova e oscila desde sempre — T-005 no `AUDIT.md`).

## 13. Desempenho medido (de verdade, e o que esses números não dizem)

Medido em e8, na metrópole pronta, perto do corpo (o quadro inteiro: a simulação do mundo **e** o desenho 3D),
**sem placa de vídeo** — o navegador de testes desenha o 3D por software (SwiftShader), que é muitas vezes mais lento que
qualquer GPU. Estes números são o **piso**, não o jogo:

| | Mediana | p95 |
|---|---|---|
| Qualidade **leve** (sem sombras, sem capim, 75% da resolução) | 16,0 ms (≈ 60 quadros/s) | 24,8 ms |
| Qualidade **média** (sombras 1024, capim) | 702 ms (≈ 1,4 quadro/s) | 862 ms |

Na cena medida: 19 pessoas e 64 bichos desenhados perto do corpo, 144 chamadas de desenho, 308 mil triângulos. Em quatro
rodadas a leve deu 12–16 ms e a média 650–720 ms. A diferença enorme entre as duas é das **sombras** desenhadas por
software; numa GPU as duas devem ser rápidas, mas isso **não foi medido**. Se o 3D ficar lento, o jogo avisa e o menu
(Esc → Gráficos → Leve) resolve.
- **Memória**: 30 idas e voltas (6 com save e load no meio) — as geometrias do Modo Deus ficaram em 300 → 299; nenhum
  ouvinte de evento novo depois da primeira descida (que monta 23 uma vez só); o HUD existe uma vez.
- **Streaming**: numa corrida de 200 m pela metrópole, 24 pedaços novos foram feitos à frente e jogados fora atrás; no
  máximo 28 pedaços perto ao mesmo tempo (o limite é 37); ao voltar ao Modo Deus a memória volta ao mesmo número.
- **O salto de 10 anos** na metrópole, depois de tudo isso: 122–136 s.
- **O Modo Deus não mudou**: a mesma vida de 5 anos (semente 103, continente) rodada na v31 e na v32 sai **idêntica número
  por número** (população, mortes, prédios, bichos, navios, crônica, tamanho do save) — enquanto ninguém está encarnado, o
  código novo não toca na simulação. E o custo: a prova de desempenho do porto (sozinha na máquina) deu passo 4,18 → 3,28 ms
  (pior 20 ms) e 10 quadros/s, contra 5,26 → 3,90 ms (pior 23 ms) e 8 quadros/s na v31 — a mesma faixa (essa prova roda pelo
  relógio, então varia de uma rodada para outra).
- **Não medido**: numa GPU de verdade, num celular, numa megalópole encarnado.

## 14. Bugs encontrados e corrigidos

Cada um está em `qa/AUDIT.md` com a causa e a correção; todos foram reproduzidos por uma prova antes de corrigir, e a
mesma prova passa depois.

| ID | O que era | Como ficou |
|---|---|---|
| L-091 | Ao voltar ao Modo Deus, a IA recebia a pessoa no começo da subida e ela andava até 13 m durante o voo | a pessoa só é devolvida no fim da subida: está a 0,00 m de onde foi deixada |
| L-092 | Os pedidos do mundo (incêndio, ofícios, histórias) eram recusados em silêncio pelo corpo | viram **chamados** no HUD |
| L-093 | A morte do corpo aparecia duas vezes na crônica | uma linha só, com "— com o deus vivendo em seu corpo" |
| L-094 | Os braços dos bonecos 3D apontavam para o céu (e outras juntas tortas) | uma matriz por junta, sinais revistos |
| L-095 | O chão 3D sairia achatado (uma linha de código dentro de um comentário) | corrigido; o chão confere vértice a vértice com o mundo |
| L-096 | Os bichos 3D quebravam o quadro (222 erros de módulo num teste) | corrigido; erro de módulo é falha nos testes |
| L-097 | A câmera entrava na pedra ao passar por um portão da muralha | a câmera usa a mesma forma de pedra que o desenho: o vão é livre |
| L-098 | A biografia perdia feitos depois do sexto tipo | todos os feitos, numa ordem fixa |
| L-099 | O 3D refazia todos os pedaços perto do corpo quando qualquer casa era erguida em qualquer lugar do mapa | cada pedaço só olha o que está dentro dele, e só a parte que mudou (chão, plantas ou prédios) é refeita |
| L-100 | A queda que mata quebrava o passo do corpo (um erro de módulo) | o dano da queda é dado no fim do passo |
| L-101 | Guardar e comer só funcionavam em 3 tipos de armazém; o mundo usa todo ponto de entrega (doca, fogueira…) | a mesma regra do mundo |
| L-102 | O painel da pessoa criava um contexto 3D já no Modo Deus, só para decidir o botão (5 provas antigas falharam por isso) | o 3D só é criado na primeira descida |
| T-027–T-029 | Provas fracas no próprio teste (o porto que não existia, um salto que nunca andava, contagens erradas) | corrigidas — uma prova que passa sem provar é pior que nenhuma |


## 15. Riscos que continuam na arquitetura

- **Nunca testado numa placa de vídeo de verdade.** Toda prova rodou com WebGL por software. O desenho pode ter
  diferenças (sombras, transparência) e o desempenho real é desconhecido — provavelmente muito melhor, mas não
  medido. É o primeiro teste a fazer.
- **O desenho 3D refaz pedaços do mapa quando o mundo muda** (assinaturas por chunk). Numa cidade enorme pegando fogo
  ou numa guerra com muitas obras, muitos pedaços mudam ao mesmo tempo; há orçamento por quadro, mas o pior caso não
  foi medido.
- **A física é só do corpo do jogador.** As pessoas e os bichos do mundo atravessam o corpo (o mundo nunca teve
  colisão entre corpos) — de perto isso se vê.
- **O mapa é pequeno para viagens**: uma cidade grande cabe em poucos minutos de caminhada. Crescer o mapa mexe na
  simulação inteira (memória, caminhos, desempenho do Modo Deus).
- **Arte procedural** tem um teto: rostos, roupas, animações naturais pedirão modelos ou um sistema de partes mais
  rico; a arquitetura (`People3D`, `Build3D`) aceita trocar o desenho sem tocar no mundo.
- **Todo pedido do mundo passa por uma porta só** (`Possess.ask`): é o que mantém a autoridade, e um sistema novo que
  escreva na pessoa sem passar por `setTask`/`Vg.give` furaria a posse. O verificador `avatar` e a regra 9 do
  `guard.js` vigiam isso, mas só o que eles conhecem.

## 16. Recomendações para a próxima grande atualização

1. **Testar numa máquina com GPU** (PC e celular) e ajustar a qualidade padrão pelo FPS real.
2. **Nadar** (o corpo na água, fôlego, correnteza) e **escalar** encostas — as duas maiores ausências para explorar.
3. **Viver uma missão do motor de histórias por dentro** — começar pela Jornada (já tem estrada, chegada e volta) e
   pela Vingança (já tem o duelo): a ponte `Possess.context()` está pronta.
4. **Combate corpo a corpo simples** ligado ao sistema de lutas do mundo (a guerra deixa de só chamar).
5. **Colisão entre corpos** perto do jogador (as pessoas desviam do corpo), e reação das pessoas ao jogador.
6. **Interiores** das casas e das tavernas (o mundo já sabe quem está dentro).
7. Arte: rostos, roupas por ofício e época, plantações mais naturais, água com ondas.

## 17. v33 — o 3D com a cara do Modo Deus

O pedido: deixar o Modo Encarnado "mais ou menos no mesmo nível gráfico" do Modo Deus e a transição o mais suave
possível. O que foi feito, o que foi provado, o que não foi.

### 17.1 O que mudou no desenho (comparado com a seção 9)
- **Chão**: deixou de ser triângulos coloridos com manchas duras. É pintado casa por casa com a **mesma cor** que o
  Modo Deus usa para cada casa (`Render.tileColor`), misturada suavemente com as vizinhas, com o grão de cada tipo de chão
  desenhado no próprio chão (capim, areia, seixos, neve, lajotas, sulcos de roça, camadas de rocha). Ruas e roças têm
  borda firme. **Testado** (e11): cada rua, roça e mar do mapa e 400 casas em volta do corpo têm exatamente a cor e o
  tipo do mundo; uma casa queimada vira cinza na figura em 13 quadros.
- **Água**: ondas que andam, reflexo do céu de lado, brilho do sol, raso claro, fundo escuro, espuma na beira. **Fotos**.
- **Céu e luz**: nuvens que andam com o vento do mundo (e as nuvens de chuva do mundo, onde o deus as vê, com a chuva
  caindo embaixo delas), sombras de nuvem passando no chão, sol mais baixo (as casas com um lado claro e outro escuro,
  como no desenho do deus), cores sem lavar. **Fotos** (dia, noite, chuva).
- **Prédios**: o material de cada povo (enxaimel, reboco, adobe, tábua; telha, palha, grama), telhados altos como os do
  deus, casas longas nórdicas com telhado de grama e cabeça de dragão, janelas com moldura e postigos, portas com batente,
  chaminés com fumaça, aquedutos com arcos, toldos e torres de vento no Egito, vasos de flores nos terraços astecas.
  **Testado** (e11): as casas perto do corpo têm a parede e o telhado do seu povo; nenhuma malha sem a lista de padrões.
- **Plantas e árvores**: capim em tufos que balança e abre caminho para o corpo; roças em fileiras com a safra real;
  árvores de tufos facetados nos três tons do deus, neve em cima no frio; a árvore derrubada cai e deita. **Testado**
  (e11: a queda; as plantas com o balanço).
- **Pessoas e bichos**: corpos arredondados, rosto com olhos que piscam, cabelo, grisalho nos velhos; o peso do corpo
  mudando de perna quando paradas; quem está parado perto vira a cabeça para você; bichos com focinho, orelhas, chifres,
  crina, cauda, trote, pastando; aves de duas patas. **Testado** (e11: a regra do olhar; o verificador confere que
  nenhuma matriz de desenho é inválida). A animação continua calculada (não capturada).
- **Partículas e reações**: fumaça das chaminés e das fogueiras, faíscas, poeira ao correr, pegadas na neve, na areia e na
  terra, respingos e anéis na água, lascas do machado, folhas caindo, vaga-lumes, gotas de chuva no chão. **Testado**
  (e11: o fogo solta fumaça e faíscas; o verificador: as partículas nos limites e todas números).
- **A descida**: no meio dela, as duas imagens são quase a mesma cidade (fotos `descida-*`); a fusão das duas ficou um
  pouco mais longa (0,8 s).
- **O desenho não mexe no mundo** — **testado** (e11): com o mundo parado, um segundo de quadros não muda nem o acaso nem
  o relógio do mundo; e a vida curta de 5 anos (soak 103) sai idêntica número por número à da v32.

### 17.2 O que continua simples (e não é mostrado como pronto)
- Tudo continua **procedural**: não há modelos nem texturas desenhadas por artista; os padrões são desenhados pelo
  shader. As pessoas não têm dedos, nem roupas com dobras; as animações são poses calculadas.
- Não há reflexo de verdade na água (é o céu misturado), nem iluminação global, nem brilho (bloom).
- Interiores, sons próprios do 3D, navios detalhados (melhoraram — casco com proa e vela inflada — mas seguem simples).
- Alguns prédios menos comuns (teatro, banhos, mina, apiário, mercado) ganharam só o material, não formas novas.

### 17.3 Desempenho
(números da regressão — preencher)

## Anexo — os critérios de aceitação (Parte XVI), um por um

| | Critério | Onde está demonstrado |
|---|---|---|
| A | O Modo Deus continua funcionando | a regressão inteira (198 provas, nenhuma falhando) e a mesma vida de 5 anos idêntica à v31 (§13) |
| B | Um NPC real pode ser selecionado e encarnado | e2 (a mesma pessoa, o mesmo objeto), e10 (o botão no painel, a tecla I) |
| C | A perspectiva encarnada usa uma câmera 3D real | Three.js, WebGL; as fotos de cada parte; e1/e6 (a câmera nunca dentro de nada) |
| D | Movimento, corrida e pulo com colisões básicas | e2, e6 (seis terrenos, pulos, paredes), e7 D (corrida longa) |
| E | A região 3D é a mesma do Modo Deus | e1 (o chão 3D vértice a vértice igual às alturas do mundo; a pessoa a 0,00 m de onde o Modo Deus a mostra — e2) |
| F | As construções têm forma coerente | e1 (cada prédio a menos de 48 m do corpo no seu lote e no seu chão: 46 prédios, nenhum problema) |
| G | Os NPCs perto são as pessoas reais | e9 (a pessoa com quem se conversa é a do mundo: nome, fala tirada da vida dela, o balão também no Modo Deus); o 3D só desenha `S.villagers` |
| H | O mundo continua enquanto se está encarnado | e3 (48 linhas novas na crônica, nascimentos, gente envelhecendo a 160 m) |
| I | As interações mudam o estado real | e9 (o estoque do povo, a comida, o que falta da obra, a devoção, a árvore caída, a pedra que sobra) |
| J | Voltar mantém a pessoa, o lugar e a cronologia | e2 (0,00 m, selecionada, a IA volta), e3 (a crônica intacta) |
| K | Alternar muitas vezes sem corromper | e4 (A → B → C), e8 (30 idas e voltas com 6 saves, memória e ouvintes estáveis, verificador limpo) |
| L | Salvar e carregar nos dois modos | e7 (A–E e saves danificados) |
| M | Não há dois mundos | um estado só (`G.S`): o 3D lê, o corpo escreve a posição da própria pessoa; e7 D (depois de correr, o save tem a pessoa onde o corpo está) |
| N | Arquitetura pronta para combate, travessia, RPG e histórias | `Possess.KINDS`/`caps`, `Avatar.LOCO`/`addLoco`, `Interact.add`, `Possess.context`, o sinal `avatarDeed` (escritos e documentados — **não** são features prontas) |
| O | Testado de verdade, com os limites escritos | este relatório: §8 (o provado e o não provado), §10, §13, §15 |
