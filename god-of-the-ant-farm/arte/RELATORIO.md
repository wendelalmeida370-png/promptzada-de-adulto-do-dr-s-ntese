# A grande reforma visual (v36): o relatório final do estúdio

## O pedido

O 3D do Modo Encarnado parecia "MMORPG de 2000". O pedido foi um salto real para *stylized high-fidelity fantasy*, sem
reconstruir o jogo:
- Hedeby, a cidade nórdica do mundo pronto `cidade`, como piloto;
- quatro qualidades (Leve, Média, Alta, Ultra);
- fotos de antes e depois;
- as licenças de tudo;
- um relatório honesto, com o desempenho medido e nunca inventado.

## A equipe

Seis especialistas, cada um dono de uma parte do código (`arte/ESTUDIO.md` §3) e trabalhando no seu branch. O líder
integra e testa. Foram duas ondas e uma rodada final, com lista fechada para cada um.

| Quem | O que fez |
|---|---|
| **A1 — direção de arte e pipeline** | A bíblia de arte (`arte/BIBLIA.md`). As 49 texturas geradas por código (`arte/*.py` → `js/tex3d.js`). Sete peças modeladas no Blender e exportadas como dados (as duas cabeças de dragão, a empena, o portal, a banca do mercado, as pedras rúnicas, o casco dos navios). A HUD do corpo, o menu Gráficos com a Ultra e as letras embutidas. A causa da neve ciano e roxa. As revisões de arte. O inventário de licenças. |
| **A2 — arquitetura** | Hedeby de tábua com veio, prego e nó, base de pedra, turfa e cabeças de dragão. Os materiais dos outros povos, com janelas recuadas, venezianas, grades, cornijas, cunhais, soco, alpendres e templos. Os pátios com mercadoria e as bancas. A fogueira de pedra e lenha e o arroz maduro. Tudo o que se deita no chão assentado no chão desenhado. |
| **A3 — terreno e natureza** | A neve como camada, com a borda que derrete. Copas de folhas, pinheiros de ramos, frutas pequenas, cactos com costelas, capim no pé das pedras. Os biomas dos outros povos. A selva e o prado na paleta. A densidade do capim por qualidade. Os ramos que somem perto do olho. |
| **A4 — personagens** | O corpo contínuo com pele: uma malha para todos, em três níveis de detalhe. O rosto com olhos de brilho, sobrancelhas, humor e piscar. Cabelos, barbas e chapéus. Roupa de pano de cada povo com os tecidos da pilha: saias em pregas, a capa com caimento. Ninguém nu, com verificador. A saia que não deixa o corpo passar. |
| **A5 — luz e renderização** | A noite de verdade e a luz pintada das chamas. Sombras suaves e uma curva que não esmaga o escuro. A água rasa e a praia, os navios de casco. O pós-processamento na Alta e na Ultra. A chama em línguas de fogo. O orçamento das qualidades. |
| **A6 — testes e desempenho** | As fotos fixas de antes e depois. A caça a problemas visuais, com defeitos plantados de propósito para provar que ela os acha. O recenseamento do custo por dono. A medida por qualidade e a porta das fotos que espera cada quadro. |

## O que se vê de diferente

As fotos de antes e depois, nas mesmas vistas e na qualidade Média:
- a praça, a casa e a fogueira, a rua vista do alto;
- a tarde, a noite, a mata e a praia de Hedeby;
- uma pessoa de frente e de lado;
- a rua e o alto da metrópole.

Elas saem com `qa/visual/fotos.js` e `qa/visual/compara.py` (veja `qa/README.md`). Na revisão final, a direção de arte
achou a versão visivelmente melhor que o jogo original nas 7 vistas principais; nenhuma ficou igual ou pior. A maior
diferença é a noite.

## Como foi testado

- **A porta de cada integração:**
  - `qa/guard.js`;
  - `qa/visual/guarda3d.js` (o 3D só desenha: não muda o mundo, não sorteia do acaso do mundo);
  - `qa/visual/corpo-rig.js`: ninguém nu, toda roupa com tecido, o corpo não sai pela saia, o quadro das pessoas roda;
  - a parte e11 do `qa/encarna.js` (o 3D desenha sem erro, e a neve fica só onde o frio a põe);
  - a vida curta com o verificador.
- **A caça a problemas visuais na versão final, nos três mundos** (Hedeby, a metrópole, um mundo novo): nenhum problema
  grave (S0 a S2). Os pequenos (S3) estão na lista abaixo.
- **O menu Gráficos com cliques de verdade:** as quatro qualidades, as sombras e a distância de visão.
- **A rede:** abrindo um mundo pronto e entrando no 3D, foram 128 pedidos, todos aos arquivos do próprio jogo. Nenhum foi
  para fora, e as duas letras embutidas carregaram.
- **A regressão completa** (`qa/regress.sh`), com a linha de base atualizada e explicada no commit desta versão.

## Os bugs achados no caminho

Cada um está em `qa/AUDIT.md`, com a causa e a correção:
- **L-108 a L-131:** entre eles a neve ciano e roxa (L-125), as pedras das cavernas no ar e enterradas (L-108), roupas da
  cor da pele (L-111, L-112), bichos nascendo debaixo do chão (L-114), a curva que esmagava os escuros (L-120), a água rasa
  de borda reta (L-122), a perna pela saia (L-127, L-128), o chão cortando as tábuas (L-130). Também dois defeitos antigos da
  simulação que a regressão achou: as pessoas presas num bolsão da própria terra (L-126) e os cativos que continuavam
  cativos depois que a cidade voltava para o seu povo (L-131).
- **T-037 a T-049:** os limites das provas, que foram corrigidos.
- **D-028 a D-033:** as decisões de desenho.

## O que ainda fica abaixo da bíblia (para depois)

- **Os bichos:** ainda são corpos facetados de brinquedo; não entraram nesta reforma.
- **A pele das pessoas na sombra:** sai cinza, e os vincos ainda se leem. O conserto desta rodada foi pequeno.
- **Os braços:** ainda de manequim.
- **A saia sentada no chão:** ainda faz pontas na geometria. A pintura com o pano esconde a pele, mas a forma não é boa.
- **A borda da neve:** em alguns lugares ainda deixa manchas de terra escura.
- **O neon que restou:** nas hortas e roças entre os prédios dos povos do calor e numa parte da mata densa.
- **Outros detalhes:** a fumaça das chaminés em bolas; as placas e bandeiras lisas; o vermelho forte das molduras romanas;
  a caiação grega um pouco cinza.
- **As casas do norte:** passam do orçamento por casa da bíblia. Na Leve e na Média, as peças finas e a decoração são
  cortadas pela distância.
- **A caça às saias:** a caça ainda mede a saia sem o passo do pano (T-049) e por isso vê mais do que se desenha.
- **As passarelas de tábuas:** os pés do corpo ainda não pisam nelas (`Build3D.deckAt` está pronto para isso).

## Licenças

Tudo o que vai no jogo foi feito para ele, com estas exceções: o three.js r170 (MIT) e as letras Nunito e Cinzel (SIL
Open Font License 1.1, embutidas, com o aviso no `css/style.css` e o texto em `arte/licencas/`).

Isso inclui as texturas, as peças do Blender, o corpo, os mundos prontos e o som sintetizado. Nenhum asset de jogo
comercial. Nada é baixado em tempo de execução. O inventário completo está em `arte/LICENCAS.md`.

## O custo

- **O jogo ficou cerca de 8,5 MB maior** (a pasta `js/`: 5,5 → 14 MB):
  - as texturas: `tex3d.js`, 5,3 MB;
  - o corpo: `bodymesh.js`, 1,8 MB;
  - as sete peças: 200 KB.
- **O desempenho, medido** (a medida e a máquina estão na seção seguinte).

## O desempenho, medido

**Como se mediu:**
- A ferramenta: `qa/visual/desempenho.js`, nas vistas da praça e da noite de Hedeby.
- A máquina: 4 núcleos, sem placa de vídeo (o 3D desenhado por software, no navegador de testes). Durante a medida, só o
  navegador que media estava aberto; a carga perto de 4 é dele mesmo, e a calibração do JavaScript ficou estável
  (62 a 75 ms).
- A comparação: o jogo de antes da reforma (a v35) contra a versão nova, uma logo depois da outra, em duas voltas.
- Os números são o tempo do 3D por quadro. Por software eles são muito maiores que numa placa de vídeo; o que vale é a
  diferença entre as duas versões na mesma máquina.

**1. A medida oficial**, pelo quadro do meio de cinco, nas três qualidades:

| Qualidade | Chamadas de desenho | Triângulos da cena | Tempo do 3D, praça | Tempo do 3D, noite |
|---|---|---|---|---|
| Leve | −17% | −32% a −38% | +13%, +13% | −16%, −12% |
| Média | −41% | −38% a −41% | +14%, +19% | +18%, +6% |
| Alta | −13% | −11% a −14% | +79%, +96% | +102%, +89% |

**2. A Média, de novo, pela média de doze quadros.** Na versão nova a sombra é refeita um quadro sim, outro não, e o
quadro do meio de cinco caía num tipo ou no outro por acaso. O especialista da luz tinha pedido esta medida antes da
primeira (T-051).

| A Média | Praça (volta 1, volta 2) | Noite (volta 1, volta 2) | Ao todo |
|---|---|---|---|
| Como estava | +10%, +15% | +7%, +9% | **+10%** |
| Com o corte de reserva | +1%, +5% | 0%, 0% | **+1,5%** |

**A decisão:** a regra do estúdio para a Média era não custar mais de 10% a mais que antes (D-032). Ela ficou no limite,
então entrou o corte de reserva que já estava medido e fotografado: a imagem um pouco menor (0,75) e a sombra refeita a
cada três quadros. Na foto lado a lado a diferença quase não se vê; a imagem fica um pouco mais macia.

**O que isso quer dizer para quem joga:**
- **Leve:** custa o mesmo que antes (à noite, menos).
- **Média:** custa praticamente o mesmo que antes, com 40% menos chamadas de desenho e de triângulos.
- **Alta e Ultra:** o pós-processamento (sombras suaves, oclusão, brilho) quase dobra o custo por software. Elas são
  para máquina com placa de vídeo.

**A memória, na Média:** as geometrias passaram de 40 para 46 MB, as texturas de 0,6 para 67 MB (a pilha de texturas
nova) e o heap do JavaScript de 26 para 28 MB.
