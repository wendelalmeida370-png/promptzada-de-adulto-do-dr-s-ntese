# Bíblia de arte — o Modo Encarnado

Para quem faz qualquer coisa que se vê no 3D (casas, chão, árvores, pessoas, luz, interface). Curta de propósito: leia
inteira uma vez, depois use as tabelas. Os contratos técnicos estão em `arte/ESTUDIO.md`; aqui está o **como deve parecer**.
Quem cuida deste arquivo é o A1 (direção de arte); proponha mudanças no seu relatório.

## 1. A direção: *stylized high-fidelity fantasy*

Um mundo pintado que aguenta ser visto de perto. Das referências tiramos a filosofia, nunca a forma:
de *Breath of the Wild / Tears of the Kingdom*, a leitura à distância — massas simples, paleta pintada, névoa que separa os
planos; de *Palia*, a limpeza — formas suaves, nada de ruído gratuito; de *Fable*, os materiais ricos sobre formas
estilizadas; de *The Witcher 3*, a densidade de vida de uma cidade — desgaste, objetos de uso, cada casa de alguém.

1. **Silhueta primeiro.** Se a forma não se lê preenchida de preto a 50 m, nenhum detalhe salva.
2. **Formas orgânicas.** Nada de caixa crua: quinas chanfradas (2–5 cm), linhas de cumeeira e beiral que cedem um pouco,
   postes que não são todos iguais. A variação vem do `G.hash(b.id …)` — a mesma casa é sempre a mesma casa.
3. **Material com grão e uso.** Madeira tem veio e prego, pedra tem junta e líquen, telha tem uma trocada depois da
   tempestade. Desgaste onde a mão, o pé e a chuva passam — nunca sujeira espalhada por igual.
4. **Cor natural.** Verde de musgo e capim (não neon), madeira quente, pedra fria e quase sem cor, cal levemente amarelada.
   Saturação alta só em acento pequeno (acabamento pintado, tecido tingido, flor). Nada lavado, nada estourado.
5. **Luz dá volume, névoa dá profundidade.** O material não traz luz direcional pintada (a parede mostra a figura de
   cabeça para baixo, o chão gira com o sol): traz cavidade escura e borda clara (`curv`, `ao` no `texlib.py`).
6. **Detalhe onde o olho para, calma no resto** (§4).
7. **Cada povo, uma linguagem** (§2.3). Hedeby (nórdica, mundo pronto `cidade`) é o piloto.

## 2. Cor

### 2.1 Como a cor funciona aqui
**Cor final = cor que o mundo dá × variação do material × luz.** A cor do mundo é a paleta do povo (`js/arch.js`,
`js/civs.js`, as mesmas do Modo Deus — não se editam). A figura da pilha é a cor do material **dividida pela própria
média**: na média, vale 1. Consequências para quem faz material:
- o **matiz** do material deve ficar perto do neutro — quem decide se a madeira é ruiva ou cinza é o mundo; o material só
  esquenta/esfria ±5% (musgo, ferrugem, líquen podem puxar mais, em manchas pequenas);
- o **contraste** é o que o material entrega: juntas, frestas e sulcos nunca abaixo de ~0,35× a média (nada de preto
  puro), destaques nunca acima de ~1,6×; contraste alto demais lê como *mais escuro* (a casca antiga tinha 24% de pixels
  quase pretos);
- **altura no alfa**, de 0,12 a 1 (o `texturas.py` põe o piso): o navegador guarda a cor multiplicada pelo alfa, e onde o
  alfa é quase zero a cor volta preta ou em degraus — era isso que pintava de preto a argamassa e as juntas.

### 2.2 Faixas por material (a cor que o mundo dá; HSV: matiz °, saturação %, valor %)

| Material | Matiz | Saturação | Valor | Notas |
|---|---|---|---|---|
| Madeira nova / tábua | 22–36 | 40–60 | 30–55 | nórdico `#7e5e40` (S 49, V 49) |
| Madeira velha / alcatroada | 20–32 | 35–62 | 18–40 | porta nórdica `#3a2616` (V 23) — o mínimo útil |
| Pedra (base, muro) | 30–45 ou fria | 8–20 | 35–70 | quase sem cor; a variação vem pedra a pedra |
| Reboco / cal / adobe | 36–44 | 5–40 | 78–96 | ≥ 94 só em branco grego e clássico; adobe S 30–45 |
| Telha de barro | 10–18 | 60–72 | 45–80 | três tons por povo (`roof`) |
| Palha | 38–44 | 50–62 | 55–80 | |
| Turfa / capim | 80–95 | 50–62 | 35–58 | nunca acima de S 65 |
| Ferro | qualquer | 0–10 | 15–35 | a ferrugem é do material |
| Tecido (corantes naturais) | qualquer | 10–55 | 20–92 | garança, pastel-dos-tintureiros, gualda, nogueira; nada fluorescente |
| Acento (pintura, ouro) | qualquer | 55–77 | 55–95 | **só em área pequena**: acabamento, porta, escudo, bandeira |

Regras duras: superfície grande com S > 70 é neon; V > 96 estoura no sol; V < 8 vira buraco.

### 2.3 As linguagens dos povos (paletas do jogo — `arch.js PAL`, `civs.js`)

| Povo | Paredes | Base | Telhado | Acabamento / porta | Acentos | Linguagem |
|---|---|---|---|---|---|---|
| **Nórdico** | `#7e5e40` `#5f4630` (tábua em pé) | `#7c766a` `#5f5a50` | turfa `#71903f` `#5a7631` `#445a22`; madeira `#5a4430` | `#a23c2a` (vermelho) / `#3a2616` | `#d8b25a` | casa longa baixa, telhado de turfa alto quase até o chão, cabeças de dragão nas pontas da cumeeira, madeira escura, vermelho só nos acabamentos |
| **Clássico** | `#efe2c4` `#d2c19e` (enxaimel) | `#8a8478` | `#b85a3c` `#94452d` `#7a3826` | `#6b4a30` / `#5a3b25` | `#f2c14e` `#3f6fb0` | empena e telha, vigas escuras no reboco, chaminé |
| **Grego** | `#f4efe4` `#d8d0bd` | mármore `#d4ccb6` | `#c8683f` `#a8532f` (baixo) | `#3f6fb0` / `#3f6fb0` | `#b8452f` | branco e azul, telhado baixo, colunas |
| **Romano** | `#edd4a4` `#caa978` (ocre) | `#a59c8b` | `#b5523a` `#94412d` (quatro águas) | `#8e2f2f` / `#6a2a20` | `#d8a63a` | ocre e telha, quatro águas, ínsula de andares |
| **Egípcio** | `#e8d2a2` `#c5aa7a` (adobe) | `#cdb98f` | plano `#dcc697` | `#2f8f8a` `#b8452f` / `#3e2e1c` | `#e8b83a` | cubos de teto plano com parapeito, toldo de pano, torre de vento, paredes levemente inclinadas |
| **Asteca** | `#f1e9d6` `#d2c5a8` (reboco) | `#b9ad93` | plano / palha `#caa85c` | `#b33a2a` `#2fae8f` / `#3a2a1c` | `#2fae8f` | reboco pintado, faixa de cor sob o parapeito, terraços com vasos, plataformas em degraus |

Pessoas (`civs.js`): pele e cabelo por povo (nórdico: pele `#f6dcc6`–`#dcb391`, cabelo `#e8d49a`–`#6e4a2c`; egípcio e
asteca: pele `#c99569`–`#8f5f3a`, cabelo `#151515`–`#2b1d14`); roupa de base (nórdico `#7a6a5a` lã, egípcio `#f1ead6`
linho, grego `#efe9dc`) com o acabamento do povo na barra. Árvores (`realm3d.js KIND/TPAL`): casca `#6b4a2e` / `#5a3e28`
(bétula `#e8e4d8`), copas em três tons por espécie.

## 3. Escala (1 unidade = 1 m; uma casa do mapa = 4 m; uma unidade de altura = 1,5 m)

| Coisa | Medida |
|---|---|
| Pessoa adulta | 1,75 m (mulher 1,65; olhos a 1,62); ombros 0,45 m; mão 0,19 m |
| Porta | 2,0–2,2 × 0,9–1,1 m; porta nórdica pode ser 1,8–1,9 m com verga grossa; soleira 0,1–0,2 m |
| Janela | peitoril 0,9–1,0 m; vão 0,5–0,9 × 0,6–1,2 m; postigo de madeira no norte |
| Pé-direito | 2,4–3,0 m por andar |
| Beiral | 0,3–0,6 m para fora da parede (turfa: 0,4–0,8) |
| Degrau | espelho 0,15–0,18 m, piso 0,28–0,32 m |
| Parede | madeira 0,1–0,2 m; pau-a-pique 0,15–0,25; adobe e pedra 0,4–0,6 |
| Cerca / mureta | 1,0–1,2 m / 0,8 m |
| Assento / mesa | 0,45 m / 0,75 m |
| Barril / caixote / saco | 0,9 m × ⌀0,6 / 0,5 m / 0,6 × 0,4 m |
| Roda de carroça | ⌀1,0–1,2 m |
| Cabeça de dragão da cumeeira | ~1,1 m de altura, ~0,8 m para fora |
| Tábua / ripa | 15–30 cm de largura |
| Tijolo | 25 × 6 cm + 1 cm de junta (o romano é maior e mais fino) |
| Pedra de muro / paralelepípedo / laje | 20–50 cm / 15–25 cm / 40–80 cm |
| Telha exposta / telha de madeira | ~33 cm / ~20 cm |

O tamanho de cada figura da pilha está no `texturas.py` (os metros que ela cobre) e chega ao GLSL como `M3S_<NOME>`.
Material na escala errada é o defeito mais comum: confira sempre ao lado da pessoa e da porta (`arte/folha.py`).

## 4. Onde concentrar detalhe

Três níveis, mais ou menos 10 / 30 / 60 da atenção:
1. **Primário** (onde o olho para): rostos e mãos; a porta e a janela de frente; a cabeça de dragão; o que se pode usar
   (`E — …`). Modelado de verdade, material próprio, silhueta própria.
2. **Secundário**: beirais, empenas, cantos e bases das casas, cercas, o chão a 5–15 m do corpo, as pessoas de perto.
   Variação por id, desgaste, textura com relevo.
3. **Terciário**: paredes lisas, telhado de longe, chão distante. Material bom, sem enfeite; calma.

Toda construção tem **um** elemento-herói (a porta, o alpendre, a cabeça de dragão, o toldo). Decoração conta uma
história de uso (lenha encostada, barril junto da porta da taverna, redes ao sol na doca) — nunca espalhada por sorteio.

## 5. Silhueta

- Teste do borrão: a forma preenchida tem que dizer o que é e de que povo é, a 50 m.
- Nórdico: massa baixa e comprida, telhado que domina (≥ 2× a parede), pontas de cumeeira com cabeça. Clássico/romano:
  empena ou quatro águas com beiral marcado, chaminé. Grego: horizontal, colunas. Egípcio: cubos com recortes no topo.
  Asteca: degraus e terraços.
- Quebre a régua: cumeeira levemente cedida, beiral com ondulação mínima, postes com 1–2° de diferença, telhados com
  remendo. A variação nunca muda a caixa do prédio (posição, tamanho e colisão são do mundo).
- Tudo encosta no chão: base, pedras, terra revolvida, capim alto junto da parede. Nada flutua, nada afunda.
- Repetição: duas casas iguais lado a lado só se uma estiver espelhada, com outra porta ou outro desgaste.

## 6. Orçamento

A medida real hoje (metrópole, qualidade média): ~114–144 chamadas de desenho e ~310–330 mil triângulos perto do corpo.
A máquina de teste não tem placa de vídeo: os tempos absolutos não valem, os relativos (A6) sim.

| Tipo | Perto | Longe (figura do horizonte) |
|---|---|---|
| Casa simples (hut, house) | ≤ 1,5 mil triângulos | ≤ 60 |
| Casa longa / sobrado / salão | ≤ 4 mil | ≤ 100 |
| Prédio público / maravilha | ≤ 8 mil / ≤ 20 mil | ≤ 300 |
| Coisa pequena (barril, caixote, banco, saco) | 100–400 | — (some a 60 m) |
| Coisa média (carroça, poço, barco a remo, barraca) | ≤ 1,5 mil | ≤ 50 |
| Cabeça de dragão (feita: 898) | ≤ 900 | ≤ 20 |
| Pedra rúnica (feita: 1.404) · portal entalhado (feito: 1.144) | ≤ 1,5 mil | ≤ 40 |
| Ponta de empena recortada (cavalo: 252 · voluta: 524) | ≤ 600 | ≤ 20 |
| Árvore | ≤ 1,2 mil | ≤ 40 |
| Pessoa | ≤ 3 mil (corpo 2 mil + roupa e cabelo) | média ≤ 800 |
| Bicho | ≤ 1,5 mil | ≤ 300 |

- Um pedaço do mundo perto (64 × 64 m) tem **uma geometria por material** (sólido, flora, folhas, plantas, água, vidro):
  coisa nova entra na geometria do pedaço (`Geo.put`), não ganha malha própria nem chamada de desenho própria.
- Cena inteira, qualidade média: alvo ≤ 500 mil triângulos e ≤ 200 chamadas de desenho; a `alta` pode dobrar triângulos.
- Pilha de texturas: 512 × 512 por material, **≤ 6 MB** de base64 no total (hoje: 47 materiais, 5,33 MB — sobra pouco: material novo de outra área, avise o A1). Cada material
  ≤ 200 KB; tecido e couro em 256 px (o fio nunca chega à tela).
- Arquivo de malha: ≤ 60 KB cada (a cabeça de dragão: 25,6 KB; a pedra rúnica: 36,7 KB; o portal: 34,3 KB); todas juntas ≤ 1 MB.
- Decoração só com `G.Realm.Q().detail`; densidade lida dos campos do preset, nunca fixa.

## 7. Materiais (a pilha: `arte/texturas.py` + `arte/mat_<área>.py` → `js/tex3d.js`)

| Material | m | Para quê | Quem faz |
|---|---|---|---|
| `planks` `planksH` | 2,0 | tábuas em pé / deitadas: paredes nórdicas, celeiro, cais | A1 |
| `beam` | 1,6 | viga lavrada a enxó, com rachas de secagem (veio na vertical: gire para a peça deitada) | A1 |
| `frame` | 1,0 | batente, moldura, verga: madeira aplainada de veio fechado | A1 |
| `door` | 2,0 | porta de pranchas: duas folhas de 1 m lado a lado (u 0–0,5 e 0,5–1), três cintas de ferro a 0,3/1,0/1,7 m com pontas em voluta, pregos, argola — simétrica em altura | A1 |
| `stone` | 2,4 | parede de pedra de campo em fiadas, argamassa de cal clara, calços, líquen | A1 |
| `brick` | 1,6 | tijolo em amarração | A1 |
| `plaster` | 3,0 | reboco de cal em demãos (também o adobe egípcio, `mud`) | A1 |
| `turf` `thatch` `tile` `shingle` | 2,0 | turfa; palha em fiadas; telha de canal (capa e bica); telha de madeira de ponta redonda | A1 |
| `slab` `cobble` | 3,0 / 2,6 | lajes de bordas gastas; paralelepípedo assentado | A1 |
| `bark` | 1,4 | casca em placas entrelaçadas, sulcos sem preto, musgo nos sulcos | A1 |
| `grass` `dirt` `sand` `rock` `gravel` `snow` `forest` `soil` | 3–5 | os chãos; a rocha em camadas partidas em blocos | A1 (A3 usa) |
| `iron` | 0,5 | ferro forjado: dobradiças, aros, pregos, ferramentas | A1 |
| `linen` `wool` `canvas` | 0,15 / 0,4 / 1,0 | linho (roupa de baixo, egípcia); lã em espinha de peixe (nórdica); lona com costuras (toldo, vela, tenda) | A1 |
| `rope` `leather` `fur` `wicker` | 0,2 / 0,4 / 0,4 / 0,6 | corda de três pernas; couro; pele com pelo (capa nórdica); vime (cesto; em escala 3×, cerca e parede trançada de Hedeby) | A1 |
| `ashlar` | 2,4 | cantaria de calcário em fiadas: base romana e clássica, templos, muros de prédio público | A1 (`mat_culturas.py`) |
| `marble` | 2,4 | mármore em blocos de veios suaves (juntas verticais quase invisíveis: serve para tambor de coluna): base e colunas gregas | A1 |
| `tegula` | 2,0 | telhado romano: telhas planas de aba e capas redondas a cada 50 cm (o topo é a cumeeira) | A1 |
| `whitewash` | 3,0 | caiação grega sobre pedra solta, calombos arredondados por demão sobre demão | A1 |
| `painted` | 1,2 | tábuas pintadas, gastas e lascadas até a demão de baixo: portas e postigos gregos, acabamentos pintados | A1 |
| `adobe` | 2,4 | tijolo de barro com palha e reboco de barro gasto em manchas: parede egípcia (o `mud` do `PAT`) | A1 |
| `sandstone` | 3,0 | arenito em blocos de ombro arredondado, camadas, colmeia: templos e bases egípcias | A1 |
| `stucco` | 3,0 | estuque brunido e pintado: paredes e plataformas astecas, o reboco pintado egípcio | A1 |
| `tezontle` | 2,4 | pedra vulcânica vermelha (e basalto) cheia de bolhas, argamassa larga: base e plataformas astecas | A1 |
| *(reservados)* `daub`, `wattle` | — | barro sobre trançado | A2, se precisar |
| `moss` `needles` `mud` `pebbles` `stony` `trail` `crag` | 1,2–5 | musgo, chão de pinheiral, lama, leito de seixos, chão pedregoso, trilha, rocha de penhasco | A3 (`mat_natureza.py`) |
| *(reservados)* `leaves`, `riverbed` | — | o que o chão e a mata pedirem | A3, se precisar |

**Material novo** (num `arte/mat_<área>.py`, lista `MATS` de tuplas `(nome, função, metros, descrição[, opções])`):
1. a figura repete sem emenda (use só as ferramentas periódicas do `texlib.py`: `fbm`, `voronoi`, `strokes`, `stamp_*`,
   `weave`, `blur`…); 512 × 512; altura em 0..1;
2. **orientação**: coisa e telhado — o topo da figura é o "para cima" (no telhado, a cumeeira); parede — o jogo lê a figura
   com v crescendo para cima, ou seja, **de cabeça para baixo**: material de parede não tem direção (nada de escorrido nem
   de luz de um lado);
3. sem luz direcional pintada; use `curv` (borda clara, cavidade escura) e `ao`;
4. relevo de centímetros: a luz do jogo lê a inclinação da altura a ~3 px e com força 0,03 × dh/dm — degraus de
   juntas, frestas e bordas aparecem, uma inclinação suave de 1 m não: o volume grande vai **pintado na cor**;
5. juntas ≥ 0,35×, sem preto; destaque ≤ 1,6×; ≤ 2% da figura passando de 2× a média (o build avisa);
6. opções: `{'px': 256}` (gravada menor — o jogo lê tudo em 512), `{'hblur': 1.1}` (altura mais suave, menos peso e
   menos cintilação), `{'q': 80}` (qualidade WebP);
7. olhe na folha de contato antes de gerar: `python3 arte/folha.py SAIDA.png nome[,nome]` (o jogo simulado: cor do
   mundo × figura, relevo iluminado, 4 × 2,6 m ao lado da pessoa e da porta, 1 m de perto, 2 × 2 para emendas, altura);
8. gere a pilha: `python3 arte/texturas.py [pasta de prévias]` (~4 min; para se passar do orçamento) e confira no jogo.

## 8. Malhas feitas no Blender (`arte/blender/`)

- **Modele por código** num `arte/blender/<nome>.py` (ele roda numa cena vazia e cria os objetos — veja `dragao.py`:
  esqueleto + modificador *Skin* + subdivisão), ou num `.blend`. O Blender aqui é o módulo `bpy` do venv
  (`/tmp/.../scratchpad/venv/bin/python`, Blender 5.0).
- **Convenções**: metros; a origem é o ponto de apoio (o pé, a base, onde encosta na cumeeira); a frente olha para o
  **−Y do Blender** (a vista *Front*), que vira **+Z no jogo**; Y do jogo = Z do Blender. Cada material do Blender vira uma
  **parte** com o nome dele (em português: `madeira`, `olho`, `ferro`…). Normais suaves, quebradas onde as faces se
  encontram mais fechadas que `--angulo` (40° padrão; 60° para coisa orgânica). UV (se houver) na convenção da pilha:
  v cresce para baixo da figura.
- **Foto antes de exportar**: `VENV/bin/python arte/blender/foto.py arte/blender/<nome>.py SAIDA.png` (frente, lado,
  três-quartos e de cima, com uma vara de 1,75 m ao lado; Cycles no processador, ~10 s).
- **Exportar**: `VENV/bin/python arte/blender/exporta.py arte/blender/<nome>.py <nome> --tris 900 [--angulo 60]
  [--obj a,b]` → `js/mesh-<nome>.js` (`G.MESH3D.<nome>`: posições Float32, normais Int8, índice Uint16/32, partes; uv, cor
  e pele se houver). Acrescente o `<script src="js/mesh-<nome>.js">` no bloco do Modo Encarnado do `index.html`.
- **Usar** (só desenha; nada aqui mexe no mundo): `G.Mesh3D.part(nome, parte)` dá a geometria de uma parte — é o que o
  construtor de pedaço aceita, uma cor e um padrão por parte:

```js
// no roofOf do build3d.js (telhado de turfa), no lugar da caixa + esfera de hoje: em cada ponta da cumeeira,
// p = at(e * (eu + 0.05), y + h + 0.1, 0) e dir = alongZ ? [0, e] : [e, 0], a cabeça olhando para fora
const ry = Math.atan2(dir[0], dir[1]), s = 1;                   // (a frente +Z do modelo virada para dir; s: escala)
K.as('beam', () => K.g.put(G.Mesh3D.part('dragao', 'madeira'), R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], ry, s, s, s), K.c('#3a2616')));
K.g.put(G.Mesh3D.part('dragao', 'olho'), R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], ry, s, s, s), K.c(K.P.acc || '#d8b25a'));
```
  A geometria é **compartilhada** (não a descarte); para mudar, `clone()`. `G.Mesh3D.info(nome)` dá pontos, triângulos,
  caixa e partes; `G.Mesh3D.check()` é a prova do módulo (contagens, índices, NaN, normais, caixa, partes) — vazia é bom.
- Coisa pequena e repetida (prego, pedrinha) não vira malha: é caixa/cilindro do kit, ou detalhe da textura.
- **As peças que existem** (quem decide onde vai cada uma é o A2):

| Malha | O que é | Partes | Onde (sugestão) |
|---|---|---|---|
| `dragao` (898 tri) | cabeça de dragão da ponta da cumeeira, pescoço em S, boca aberta, chifres e crista | `madeira`, `olho` | as duas pontas da cumeeira de turfa, olhando para fora (o trecho acima) |
| `runa` (1.404 tri) | pedra rúnica de granito, 2,05 m (25 cm enterrada), faixa-serpente em relevo com 43 runas, calços no pé | `pedra`, `faixa`, `runas`, `olho` | dentro da caixa de um prédio público nórdico (praça, salão, templo, cemitério), nunca num caminho; a face entalhada para quem chega; a faixa no vermelho do povo |
| `portal` (1.144 tri) | batentes e verga entalhados com entrelaçado e volutas em volta de um vão de 1,0 × 1,9 m; soleira | `madeira`, `entalhe` | a porta de frente da casa longa e do salão, só perto e com `detail`; escale pelo vão |
| `empena` (cavalo 252 · voluta 524 tri) | as pontas recortadas na prancha da empena: uma cabeça de cavalo com crina e olho furado, e uma voluta que enrola para dentro (as outras duas formas do `bargeEnd`, ao lado do dragão) | `cavalo` + `olho`, ou `voluta` (uma por ponta) | as pontas das tábuas de empena além da cumeeira: o plano da prancha é o da empena, a frente vai para o `out`; para o lado oposto, espelhe em x |

## 9. A interface do corpo (HUD — `js/incui.js`, `css/style.css`)

- Discreta: vidro escuro (painéis 0,76, avisos 0,84 de opacidade — lê sobre neve e céu branco), sombra no texto, nada de
  desfoque de fundo (o 3D por software redesenha a cada quadro).
- Hierarquia: nome (Cinzel 16) > hora e lugar (14 / 11,5) > barras (rótulo 9,5 em versalete) > dicas (11,5). Escala de
  texto: 9,5 · 11,5 · 12,5 · 13,5 · 16 · 19 px. Dourado só no que importa: nome, lugar, o chamado do mundo, a tecla do `E`.
- Lugares fixos: quem sou (alto à esquerda); hora e lugar (alto à direita); **bússola no alto ao centro** (traços de 15°,
  o norte dourado) e as notícias logo abaixo; chamados do mundo embaixo à esquerda; o `E — …` embaixo ao centro e os
  avisos logo acima dele; teclas no rodapé (somem sozinhas); Modo Deus embaixo à direita.
- Nada desliza ao aparecer (animação pela propriedade `translate`, que não briga com a centralização); o que vai embora
  esmaece (notícias, avisos, teclas).
- As letras vêm com o jogo (Nunito e Cinzel embutidas no CSS): aberto do disco, sem internet, a interface é a mesma.

## 10. Hedeby, o piloto: o que a cidade pede

| Elemento | Forma | Material da pilha | Quem |
|---|---|---|---|
| Casa longa | parede baixa de tábua em pé ou trançado com barro, telhado de turfa alto, pontas de cumeeira com dragão, porta no lado comprido, fumeiro | `planks` / `wicker` (+`daub` se A2 fizer), `turf`, `beam`, malha `dragao` | A2 |
| Porta e batente | pranchas com cintas de ferro, verga grossa, soleira de pedra ou tronco | `door`, `frame`, `iron`, `slab` | A2 |
| Rua | passarela de tábuas sobre o barro (as ruas de Hedeby eram de madeira), terra batida nas bordas | `planksH`, `dirt` | A2/A3 |
| Cerca e quintal | trançado de vime em estacas, ~1 m | `wicker` (em escala 3×) | A2 |
| Cais e estaleiro | estacas, tábuas, cordas, redes secando | `planks`, `beam`, `rope` | A2 |
| Feira | bancas com toldo de lona listrada, barris, caixotes, sacos, cestos | `canvas`, `planks`, `iron` (aros), `linen`, `wicker` | A2 |
| Gente | túnica de lã, camisa de linho, capa de pele, cinto e sapato de couro, broche dourado | `wool`, `linen`, `fur`, `leather` (+ acento do povo) | A4 |
| Chão e mata | capim, terra, cascalho, chão de folhas, rochas da costa, casca das árvores | `grass`, `dirt`, `gravel`, `forest`, `rock`, `bark`, `sand` | A3 |

## 11. Lista de aceite de um asset

Antes de dizer "pronto", olhe de verdade (fotos de `qa/visual/fotos.js` ou `arte/blender/foto.py`, antes | depois):
- [ ] **frente, fundos, de cima, de perto (1 m) e de longe (50 m)** — e a silhueta preenchida;
- [ ] **manhã, meio-dia, tarde e noite** (`hedeby-manha`, `-praca`, `-tarde`, `-noite`) — nada some no escuro nem estoura no sol;
- [ ] escala ao lado da pessoa e da porta; material na escala certa (§3);
- [ ] cor nas faixas (§2.2): sem neon, sem lavado, sem preto puro; o povo reconhecível (§2.3);
- [ ] encosta no chão, não flutua, não afunda, não atravessa; nenhuma face piscando (z-fighting), nenhuma textura esticada;
- [ ] a mesma coisa vista de novo é a mesma (variação pelo id, nunca sorteio);
- [ ] orçamento (§6) e `check()` do módulo limpos; `node qa/guard.js`; as partes do `qa/encarna.js` da sua área;
- [ ] **visivelmente melhor** que antes — se não ficou, não está pronto.
