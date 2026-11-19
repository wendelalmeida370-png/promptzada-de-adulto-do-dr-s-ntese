# O ano de quatro estações — a análise (a decidir pelo dono)

A ideia do dono (19/11/2026): hoje **um dia é um ano** — o dia é curto para tudo o que o jogo já tem, e sem estações. A
proposta: **um ano vira quatro dias, cada dia uma estação** (primavera, verão, outono, inverno). O dono pediu a análise antes de
decidir. Os números são do código de hoje.

## 1. Como é hoje

- **O dia dura 200 segundos** na velocidade normal do deus (`G.DAY_LEN`), 12,3 minutos no corpo; e **cada dia é um ano**: o
  contador `S.day` é ao mesmo tempo o dia do sol e o ano da vida (a idade, a colheita, a economia, o dia da cidade, as contas da
  sociedade).
- **Não há estações.** O inverno existe só como milagre do deus; a neve, pela altura e pelo bioma; a maré sobe e desce duas vezes
  por dia.
- **O contador do dia aparece 1.148 vezes, em 106 arquivos.**

## 2. O que muda

| | Hoje | Com o ano de quatro dias |
|---|---|---|
| Um dia | um ano | **uma estação** |
| Um ano, na velocidade normal do deus | 3,3 min | 13,3 min |
| Uma vida de 60 anos, olhando como deus | ~3,3 h | ~13 h (ou menos, acelerando) |
| Uma vida de 60 anos, vivida no corpo | ~12 h | **~49 h** |
| As estações | não há | **o plantio, a colheita, o inverno, as migrações, o cio dos bichos, a cheia do rio, o mar fechado no inverno, a neve que fecha o passo** |
| Um mundo pronto de 100 anos | o salto atual | **quatro vezes mais salto** para gerar |

## 3. O que se ganha

1. **As estações são o coração de quase todo ofício:** a terra (semear na primavera, colher no outono, guardar para o inverno), a
   criação (o cio, as crias, o pasto do verão), a pesca (os cardumes de cada estação), a caça (a migração), o mar (**a estação de
   navegar** — na Antiguidade não se navegava no inverno; as monções do navegador), a montanha (o passo fechado pela neve), as
   festas (a da colheita, a do solstício).
2. **A vida no corpo fica do tamanho do jogo:** com tantos ofícios, uma vida de 12 horas é curta; uma de 49 dá tempo de aprender um
   ofício, mudar de vida, ter filhos e vê-los crescer.
3. **O mundo fica bonito no tempo:** a primavera florida, o verão seco, o outono das folhas, o inverno de neve e rio congelado —
   nas duas vistas.
4. **O celeiro passa a valer:** colher uma vez e comer o ano inteiro faz o armazém, a fome do fim do inverno e o comércio de grão
   terem sentido de verdade.

## 4. O que custa (os riscos, sinceros)

1. **A maior mudança da base desde as três fundações.** Cada um dos 1.148 usos do contador tem de ser lido e classificado: **é do
   dia ou do ano?** Hoje os dois são o mesmo número, e o código não precisava distinguir.
2. **Cada constante decidida de novo:** «o ofício fica ao menos três dias» — eram três anos; serão três dias (menos de um ano) ou
   doze (três anos)? Dezenas de números assim.
3. **A economia rebalanceada:** a colheita uma vez por ano e o consumo todo dia mudam o estoque, a fome e o comércio; os medidores
   (a gente, a comida, as guerras, os nascimentos) e a linha de base da regressão mudam.
4. **A história anda mais devagar por hora:** o deus que quer ver séculos acelera mais (o salto existe; talvez uma velocidade nova).
5. **Os saves antigos convertidos** (cada data guardada multiplicada pela regra certa) e **os mundos prontos gerados de novo** — e
   os longos levam quatro vezes mais.

## 5. Como fazer sem quebrar (se o dono aprovar)

1. **Duas portas:** `S.day` continua o dia do sol; o ano e a estação saem de portas próprias (`G.year()`, `G.season()`), e uma regra
   do `guard.js` impede que alguém leia o dia como ano.
2. **Fase 1 — o ano de quatro dias, ainda sem estações:** cada uso classificado; cada taxa «por ano» dividida pelos quatro dias.
   **A prova:** as mesmas sementes têm de dar, por ano, o mesmo mundo de antes dentro das faixas dos medidores (a gente, a comida,
   os nascimentos, as guerras, os ofícios). Assim se sabe que nada se perdeu na troca.
3. **Fase 2 — as estações ligadas:** o plantio e a colheita, o frio do inverno, as migrações, o mar fechado; a economia medida de
   novo.
4. **Fase 3 — o que se vê:** as cores de cada estação, a neve, o rio congelado, as folhas.
5. **Os saves e os mundos prontos** convertidos e gerados de novo; a regressão inteira.

## 6. A opinião

**Eu faria, e com quatro dias** (uma estação por dia é o mais claro de ler e de jogar). As estações são exatamente o que os ofícios
precisam, e a vida no corpo fica do tamanho de tudo o que o jogo vai ter. **Mas é uma reforma da base, não um detalhe:** um patch
inteiro, com a prova de equivalência da fase 1.

**Se for feita, quanto antes, melhor:** cada patch que vier antes dela aumenta o que tem de ser revisto. O lugar certo é **antes do
Patch 23** — ou, no máximo, antes da fundação dos ofícios e da terra (25 e 28), que dependem das estações. Fazer depois dos ofícios
obrigaria a refazer o tempo de cada um.

## 7. O estado

**A decidir pelo dono.** Se aprovado, entra no [`roteiro.md`](roteiro.md) antes do Patch 23.
