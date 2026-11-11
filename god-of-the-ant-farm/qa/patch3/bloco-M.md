# Bloco M — os ajustes da Arquitetura Monumental que são regra do mundo (Bairros Vivos)

Ramo: `worktree-agent-a8f5af9594fd9a4f1` (base `61dc62b`). Números usados: L-780…, T-760…, D-174 a D-177, regras 57 e 58.
Arquivos do jogo mexidos: `js/village.js`, `js/villagers.js`, `js/city.js`, `js/act-casa.js`, `js/polity.js`.
Arquivos novos: `qa/degraus.js`, `qa/degraus-inv.js`, `qa/casa-rica.js`, `qa/juntar.js`, este bloco.
**O mundo muda** (o passo do mundo: quem quebra pedra, onde a pedra vai, o que a cidade pede): os mundos prontos precisam ser
gerados de novo, e a linha de base refeita.

## 0. O que se mediu antes de mexer (os mundos prontos da geração 19 e mundos do zero)

Os roteiros de medida ficaram em `scratchpad/ag/M/` (`mede.js` o que a regra responde a cada capital; `traca.js` o salto ano a
ano com o que cada capital pede e recebe; `pedra.js` o livro-razão da pedra de um povo; `constr.js` o que os construtores fazem;
`pop.js` um mundo do zero década a década).

**O que a regra da escala responde a cada capital** (justifica? paga? acha terra?):

| mundo (ano) | capital | nível, gente (povo) | pedra, renda/ano | onde a escada parava |
|---|---|---|---|---|
| metrópole (58) | Tenochtitlan | 3, 118 (159) | 93, +156 | o palácio de 6 em obra **sem nenhuma das 210 de pedra**; o campo de 40 m guardado para a maravilha, nunca usado |
| metrópole (58) | Mênfis | 4, 104 (162) | 29, +80 | justifica o templo de 6: nenhum lote («68% com água, 45% com prédio de outra cidade»), e em volta do templo de 4 não há como crescer |
| metrópole (58) | Roma | 3, 41 (137) | 13, +106 | a maravilha de 10: nenhum dos 4264 lotes serve (78% água, 60% relevo além do pódio) |
| metrópole (58) | Argos, Hedeby | 3, 89 e 33 | 7 e 25 | o teatro de 6 em obra a 0% de pedra |
| megalópole (50) | Roma | 3, 91 (127) | 10, +60 | o campo guardado para o Coliseu; não o pede: a maravilha é o último desejo, atrás do teatro |
| megalópole (50) | Mênfis | 5, 140 | 182, +248 | tem a Grande Pirâmide de 10; o templo é o **santuário de 8 m**: justifica o de 24 m e não há como crescer no lugar |
| megalópole (50) | Argos | 3, 43 (71) | 39, +24 | o palácio de 6 a 0% de pedra |
| anos 500 / 1000 | Mênfis | 4, 189 e 215 (746 e 784) | **979 e 772 em estoque** | a pedra de uma maravilha no armazém e **nenhum lote** de 6, 8 ou 10 casas: «nenhum seco e sem prédio» (água 62–75%, muro ou estrada 52–66%, prédio de outra cidade 49–64%) |

**O que acontecia em 25 anos de salto, sem mexer em nada** (`traca.js`):
- metrópole, anos 58 → 83: o palácio de 6 de Tenochtitlan ficou **21 anos com 0 das 210 de pedra**, até a cidade ser tomada; o
  teatro de 6 de Hedeby só ficou pronto por volta do ano 80; Mênfis pediu a maravilha todo ano e nunca achou terra. **Nenhum
  degrau acima de 6 casas começou.**
- megalópole, anos 50 → 75: o teatro de 6 de Roma ficou **21 anos** em obra (51 → 72) e só então o Coliseu foi fundado, no ano
  74 (a 0% no 75); o palácio de 6 de Argos, **25 anos a 0%**; Mênfis quis ampliar o templo, o teatro e o monumento todo ano:
  «sem lote para ampliar», 25 vezes.
- um mundo do zero (semente 103, continente de 128, 4 povos, 80 anos): Mênfis guardou o campo da pirâmide no ano 40 e **até o
  ano 80 nunca a pediu**; os banhos e a administração ficaram 20 anos em obra sem pedra.

**Para onde ia a pedra** (`pedra.js`, Tenochtitlan, 118 a 124 pessoas, 4 anos): entravam **17 a 38 de pedra por ano** (1 a 6
mineiros de ~84 adultos; 9 a 12 construtores), e saíam 20 a 37 para as outras obras (casas melhoradas, armazém), 11 a 14 para o
calçamento e **45 num ano nas carroças do comércio**. O palácio: nada. Um mineiro traz perto de 10 de pedra por ano; a
maravilha de 10 casas custa 768.

**As causas, em ordem de peso:**
1. **A pedra não cresce com a cidade.** O repartidor de ofícios dá à pedra uma parte do «resto» dos braços (os que sobram
   depois dos ofícios, dos lavradores, dos construtores e dos soldados), e o resto é de 1 a 4 braços em qualquer cidade: uma
   capital de 160 pessoas tem os mesmos 2 ou 3 mineiros de uma aldeia de 20. O construtor sem nada para assentar ia calçar rua
   (as ruas nunca acabam) e depois cortar lenha (a lenha quase sempre está abaixo do desejo do armazém) — quebrar pedra era o
   último recurso, e quase nunca chegava a vez.
2. **A pedra que entra vai para o que não acaba**: melhorar cada casa de pé (cabana → casa → sobrado → ínsula), calçar, e sair
   nas carroças.
3. **Uma obra cívica de cada vez**: a obra parada sem pedra segura a fila, e a maravilha é o último desejo da fila.
4. **A ampliação no lugar nunca acha espaço** (em volta de todo templo, teatro e monumento há estrada, estátua, sobrado,
   oficina, muro ou água), e só o maior degrau era tentado.
5. **A terra**: nas capitais maduras (anos 500 e 1000) não há lote nenhum; aí a pedra sobra e a terra falta. Não mexi nisto
   (ver «o que ficou aberto»).
6. **O critério de «justifica»** (a gente e o nível de cada degrau) não é o que segura: as capitais chegam a 100–220 pessoas e
   justificam o templo de 24 e 32 m e o teatro de 32 m; o que falta é pedra (mundos novos) ou terra (mundos velhos). Ficou
   como estava.
