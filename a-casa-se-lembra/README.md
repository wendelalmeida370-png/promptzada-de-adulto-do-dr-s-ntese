# A CASA SE LEMBRA

Jogo de terror psicológico em primeira pessoa, para navegador, feito sob medida para a Rafaela
a partir de dois vídeos da casa da família.

São três da manhã. Todo mundo dorme. O celular vibra com uma mensagem do irmão, que está sem sinal
na casa de um amigo: "você viu o vídeo que eu te mandei da casa?". O vídeo é da sala. Da sala onde
você está agora. Só que tem umas coisas diferentes nele.

> Joga-se melhor **de noite, com fones de ouvido**. Muitos sons vêm de outros cômodos — e alguns vêm do cômodo errado.

---

## Como abrir

1. Abra o arquivo **`index.html`** com dois cliques, em um navegador atualizado (Chrome, Edge ou Firefox) no computador.
   Não precisa de servidor nem de instalar nada: o jogo já vai compilado em `dist/game.js`. Com internet,
   ele baixa as fontes das letras do Google Fonts; sem internet, funciona igual, com as fontes do sistema.
2. Clique em **Novo jogo** (ou em **Continuar**, se já tiver começado).
3. Clique na tela para "prender" o mouse. `ESC` pausa e solta o mouse.

Se preferir servir por HTTP (opcional): dentro desta pasta, `npm run serve` e abra `http://localhost:5173`.

**Se a setinha do mouse aparecer no meio do jogo**, o jogo pausa e mostra "clique para continuar": um clique
prende o mouse de novo, com a sensibilidade normal. Se o navegador se recusar a prender o mouse (alguns
visualizadores fazem isso), aparece o botão **Jogar sem travar o mouse**: nesse modo você olha em volta
levando o mouse até as bordas da tela. Dá para escolher o modo em **Opções → Mouse**.

## Controles

| Tecla | Ação |
|---|---|
| `W A S D` / setas | andar |
| Mouse | olhar |
| `Shift` | correr (faz barulho) |
| `C` (alterna) / `Ctrl` (segura) | agachar |
| `E` ou clique | interagir, examinar, esconder-se |
| `E` (olhando para um gato, de pertinho) | fazer carinho |
| `F` | lanterna do celular |
| Botão direito (segure) | levantar o celular: câmera |
| `Q` ou rodinha (com o celular levantado) | trocar entre CÂMERA e VÍDEO (casa.mp4) |
| Clique (com o celular levantado) | tirar foto |
| `Espaço` (escondida) | prender a respiração |
| `TAB` | celular (mensagens, vídeo, galeria) |
| `I` | mochila |
| `J` | diário: objetivo, notas, fotos, regras aprendidas e planta da casa |
| `R` | rádio (depois de achar o fone) |
| `H` | dica (cada vez mais clara) |
| `ESC` | pausar |

## O que tem no jogo (sem spoilers)

- **A casa é a mecânica.** O celular guarda `casa.mp4`, o vídeo da casa. Levantando o celular no modo VÍDEO,
  você vê a casa como ela foi gravada e compara com a de verdade. Às vezes deixar as duas iguais ajuda.
  Às vezes é exatamente o que não se deve fazer.
- **Três atos** — *A casa conhecida*, *A casa contradiz a memória*, *O que a casa guarda* — com quebra-cabeças
  que usam pistas de dentro do jogo, cômodos que mudam de lugar, portas que não existiam e um clímax jogável,
  com escolha e consequência.
- **O celular como ferramenta de terror:** lanterna com bateria, câmera que enxerga o que o olho não vê,
  fotos que vão para a galeria, o vídeo, mensagens contraditórias e um rádio que chia quando *ele* está perto.
- **Presenças, uma entidade com regras próprias e um palhaço** usado com parcimônia. Perseguições legíveis:
  dá para aprender as regras, fugir, se esconder e prender a respiração. Quem é pego volta ao último
  checkpoint, perto de onde estava.
- **O Morador de Antes.** No ato 3, atrás da porta de entrada, fica o apartamento de antes da família morar ali:
  móveis cobertos com lençóis, uma vitrola tocando valsa e alguém sentado na cabeceira da mesa, embaixo do lençol.
  Ele tem regras próprias, como uma brincadeira de criança (e o diário anota cada uma quando você aprende).
- **Cinco finais:** um bom, um ruim e três secretos. O menu tem uma galeria de finais com pistas para os que faltam.
- **O Bento e a Lili são gatos de verdade (quase):** andam pela casa sozinhos, cheiram as coisas, sentam,
  deitam, se lambem, vão comer, se esfregam na sua perna, miam, ronronam quando você faz carinho (`E`),
  seguem você de vez em quando e têm olhos que brilham na lanterna. Carinho no gato acalma o medo.
- **Três easter eggs** escondidos pela casa, para quem explora.
- Sustos preparados (alguns barulhentos, outros completamente em silêncio), som posicional com paredes abafando,
  ruído elétrico, passos, estalos da casa, vozes sintetizadas opcionais. **Todo som, música e imagem é gerado por código**:
  não há nenhum arquivo de áudio, imagem ou vídeo externo.
- Salvamento automático por checkpoints, **Continuar**, **Voltar ao último checkpoint** no menu de pausa e dicas graduais (`H`).

## Opções

No menu **Opções** (salvas no navegador):

- volume geral, efeitos/ambiente, música e vozes; vozes sintetizadas ligadas ou só legendas;
- sensibilidade do mouse, **mouse travado ou sem travar**, inverter eixo Y, campo de visão, intensidade do tremor de câmera;
- **brilho** da imagem (para monitores escuros) e **tamanho das legendas** (normal ou grande);
- **jump scares: completos, suaves ou desligados**; flashes e luzes piscando normais ou reduzidos;
- **modo história** (as perseguições não te pegam);
- qualidade gráfica (automática, alta ou leve para PCs mais fracos).

Em **Personalizar nomes** dá para trocar o nome da protagonista, o apelido e os nomes da família e dos gatos,
sem mexer no código.

## Privacidade

Este repositório é **público**, então algumas coisas ficaram de fora de propósito:

- **não** há foto da Rafaela, nem fotogramas dos vídeos da casa, no repositório;
- o jogo usa **só os primeiros nomes** por padrão; **sobrenome, idade e nome do colégio não estão no código**;
- no menu **Personalizar nomes** existem campos opcionais de *Sobrenome* e *Colégio*: o que for digitado ali
  fica salvo **apenas no navegador** de quem joga (localStorage), nunca no repositório.

A protagonista é uma versão ficcional da Rafaela, e o conteúdo foi pensado para a idade dela: dá medo,
mas não tem sangue nem violência explícita.

## Duração

Estimativa honesta para o conteúdo que existe hoje (medida pelo tamanho do roteiro e dos quebra-cabeças,
não com jogadores reais):

- **primeira partida até um final: de 1h a 1h40**, explorando com calma e usando poucas dicas;
- uns **45 minutos** para quem corre e usa as dicas sempre;
- os finais secretos acrescentam de **15 a 40 minutos** (um deles pede uma segunda partida, que é mais curta).

## Suposições sobre a casa

A casa foi **interpretada** a partir dos dois vídeos, não digitalizada. Ela deve ser reconhecível para quem mora
nela, mas não é uma reconstrução exata:

- é um apartamento com sala (parede da TV cinza-escura, sofá cinza, bicicleta, quadro pop-art, porta-chaves),
  varanda com tela de proteção e varal, cozinha, área de serviço, corredor, banheiro, quarto roxo,
  quarto dos meninos e quarto dos pais com guarda-roupa espelhado;
- **a planta é aproximada**: a ordem e a ligação entre os cômodos foram deduzidas do caminho percorrido nos vídeos,
  e as proporções foram ajustadas para o jogo ficar gostoso de andar;
- onde o vídeo não mostrava bem um trecho (cantos, o que fica atrás de portas fechadas, o corredor do prédio,
  a vista exata da varanda), a casa foi completada com uma interpretação coerente;
- alguns lugares são **inventados de propósito** e fazem parte da história: a porta que não existe, a escada
  impossível, a memória da casa, a Hora Nenhuma e o apartamento de antes.

## Como foi feito

- JavaScript + [three.js](https://threejs.org/) (3D estilizado em primeira pessoa), empacotado com esbuild
  num único `dist/game.js` para abrir direto do disco (`file://`).
- Pós-processamento próprio: oclusão de ambiente (SAO), bloom nas lâmpadas e telas, tone mapping ACES,
  grão, vinheta que pulsa com o coração quando o medo sobe, VHS e glitch. A lanterna do celular tem
  "lente" (anel e manchas do refletor) e a poeira do ar só aparece dentro do facho.
- Espelhos que mostram a "memória da casa", câmera de segurança e webcam renderizadas em tempo real,
  e o menu principal é a própria sala, ao vivo, de madrugada.
- Sons 3D sintetizados com WebAudio: passos com calcanhar, ponta e rangido do piso, roupa ao agachar,
  respiração ofegante depois de correr, miados, trinados e ronronar dos gatos.
- Código em `src/`: `core/` (áudio, texturas, entrada, opções), `world/` (a casa, portas, espelhos, apartamento de antes),
  `game/` (jogo, roteiro dos atos, finais, personagens, IA).
- Para mexer no código: `npm install` e depois `npm run build` (ou `npm run watch`).

## Testes automáticos

Os testes abrem o jogo num Chromium sem janela ([Playwright](https://playwright.dev/)) e jogam sozinhos.
Eles precisam do Playwright instalado (`npm i -D playwright && npx playwright install chromium`, ou uma instalação global):

```bash
npm install && npm run build
node tests/playthrough.mjs   # a campanha inteira, do Novo jogo até o final bom (grava os checkpoints)
node tests/antes.mjs         # o apartamento de antes e as regras do Morador de Antes
node tests/endings.mjs       # os cinco finais e a galeria de finais
node tests/saves.mjs         # "Continuar" a partir de cada checkpoint
node tests/systems.mjs       # movimento, colisão, fotos, dicas, menus, opções, nomes, sons, captura
node tests/swap.mjs          # as portas trocadas do ato 3
node tests/cats.mjs          # a rotina dos gatos, carinho, ronronar, fuga e "seguir"
```

`ENDING=inquilino node tests/playthrough.mjs` joga até o final ruim. `tests/scenes.mjs`, `tests/pale_scenes.mjs`
e `node tests/look.mjs <prefixo>` tiram fotos de cenas para revisão visual (ficam em `tests/shots/`).
As fontes do Google usadas no HUD ficam em cache local em `tests/.cache/` durante os testes (fora do git).

## Créditos e homenagens

- Feito para a Rafaela, a pedido do irmão, Wendel. Criado com Claude (IA da Anthropic).
- **O Morador de Antes** é uma homenagem, criada do zero e com outra história, ao Homem Pálido de
  *O Labirinto do Fauno* (Guillermo del Toro). Nenhum modelo, imagem ou som do filme foi usado.
- Os easter eggs são homenagens originais: nenhum logotipo, personagem, música ou arquivo de outras obras foi copiado.

---

<details>
<summary><b>SPOILERS: os cinco finais (abra só depois de jogar)</b></summary>

| Final | Tipo | Como chegar |
|---|---|---|
| **A Casa Se Lembra** | bom | No clímax, recuse o que ele oferece, grave ele com o celular e apague `casa.mp4`. |
| **O Inquilino** | ruim | No clímax, dê um cômodo a ele. Ou grave, mas guarde o vídeo em vez de apagar. |
| **Achados e Perdidos** | secreto | No apartamento de antes, olhe a plaquinha raspada da porta **pela câmera** do celular. No clímax, grite o nome que a casa esqueceu. |
| **A Hora Nenhuma** | secreto | Pegue o relógio-ovo na memória da casa. No ato 3, volte lá e olhe dentro do balde. |
| **Sem Sinal** | secreto | Só aparece depois de ver qualquer final. Numa partida nova, logo no começo, responda o "irmão" pedindo o nome dos gatos. |

Detalhes que mudam com o que você fez: consertar (ou não) as diferenças do vídeo, abrir a porta para quem pediu,
salvar o palhaço com o relógio, perguntar o nome dos gatos, levar a Lili junto e achar os três segredos.

</details>
