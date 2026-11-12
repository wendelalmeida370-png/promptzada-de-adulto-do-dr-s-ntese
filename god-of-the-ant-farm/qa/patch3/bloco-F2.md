# Bloco F2 — a segunda rodada da freguesia: a praça ao fim da tarde, o foguista no posto, o bairro dos banhos

Agente F, segunda rodada. Base: `f5d08ed` (a ponta do líder). Números reservados: L-911 a L-929, T-921 a T-929,
D-225 a D-229; regras do guard 79 e 80. O `bloco-F.md` (a primeira rodada) fica como está.

**Estado (em andamento — este arquivo é atualizado a cada passo):**

- [x] medida de antes (a base limpa, metrópole e mega, cinco dias na paz do deus) — §1
- [~] item 1, a praça e o mercado ao fim da tarde: o código está escrito (`js/act-lazer.js`, `js/villagers.js`), medido
      na metrópole (§2); falta a prova, as sabotagens, a mega, os dez anos
- [ ] item 2, o foguista no posto (T-918)
- [ ] item 3, o bairro dos banhos não é «boêmio» (D-202)
- [ ] item 4 (se couber)
- [ ] a prova, as sabotagens, as vizinhas

## 1. A medida de antes (a base `f5d08ed`, sem nenhuma mão: só a paz do deus)

O medidor: `scratchpad/ag/F/mede2.js` (de dentro de `qa/`: `MUNDO=metropole node …/mede2.js 5`). Conta, a cada segundo do
mundo, por cidade e por hora do dia (40 partes): quem está parado na praça (acordado, fora de casa, sem andar, dentro do
lote da praça mais meia casa), à porta do mercado, na taverna, em casa acordado, em família à porta, na fogueira; e, pelo
livro, as ceias, as refeições frias, os copos da taverna, as entradas do teatro e dos banhos; e de cada dia de banhos, as
entradas, a lenha e a parte das horas com a água quente.

**A metrópole pronta, dias 58 a 62** (704 → 842 pessoas). Parados na praça, por hora (0,600 a 0,725, de 0,025 em 0,025):

| cidade (pessoas) | 0,600 | 0,625 | 0,650 | 0,675 | 0,700 | 0,725 |
|---|---|---|---|---|---|---|
| Argos (108) | 0,2 | 0,1 | 0,2 | 0,2 | 0,2 | 0,1 |
| Mênfis (133, 2 praças) | 0,1 | 0,4 | 0,0 | 0,2 | 0,3 | 0,1 |
| Roma (47) | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| Tenochtitlan (146) | 0,6 | 1,3 | 1,6 | 2,0 | 1,5 | 1,2 |
| Tebas (65) | 0,1 | 0,0 | 0,0 | 0,3 | 0,3 | 0,0 |
| Kaupang (37) | 0,0 | 0,0 | 0,0 | 0,0 | 0,1 | 0,0 |

O mundo, por dia: 12,8 ceias (cozidas), 82,6 refeições frias, 21,6 copos na taverna, 23,2 entradas do teatro, 22,6
entradas pagas dos banhos. A fornalha acesa em **17 de 20** dias de banhos (96 banhos).

**A mega pronta, dias 50 a 54** (446 → 538 pessoas): Mênfis (172, 2 praças) 0,6 a 0,2; Roma (89) 0,4 a 0,8; Delfos (39)
0,0 a 0,2. O mundo, por dia: 26,2 ceias, 82,4 refeições frias, 24,8 copos, 6,4 entradas do teatro, 16,2 banhos pagos. A
fornalha acesa em **5 de 11** dias de banhos (os banhos de Hedeby, 35 pessoas, sem lenha em quatro de cinco dias).

Os arquivos: `scratchpad/ag/F/r2/antes/mede2-metropole.txt`, `mede2-mega.txt`.

### O que a medida de antes mostrou do dia deste mundo (T-921)

O fim da tarde deste mundo é curto, e não por falta de vontade: o povo acorda antes da luz e **está exausto antes de
escurecer**. A energia de um adulto acordado cai 1,25 por centésimo do dia (`villagers.js`, `needs`): de 100 ao acordar
(0,03) aos 22 que mandam para a cama são 62 centésimos — às 0,65. Medido na metrópole, no segundo dia: às 0,58, 357 de
387 adultos têm a energia entre 20 e 40; às 0,66, 146 abaixo de 20; às 0,70, 253 — e 176 de 388 já dormem ou vão dormir
(136 pela energia, 1 pelo relógio de cada um, que diz 0,74 a 0,81). Na hora da praça (0,53 a 0,60), de cada cem
adultos-dia: 13 já dormem, 9 estão no teatro, 4 nos banhos, 3 comem, uns 45 estão no meio de uma carga, de uma obra, de
uma operação ou de um posto — e só uns 14 estão livres ou num trabalho que se larga. Em Tenochtitlan, 29 de cada cem
estão no teatro e 24 dormem. **O fim da tarde já é do teatro e dos banhos; o que sobra para a praça é pouco.**
Fica dito como limite aberto: uma praça cheia até escurecer pede mexer na energia do dia (por exemplo: quem descansa
cansa menos que quem trabalha), e isso muda a taverna, a ceia e o sono de todos — decisão do líder, não desta rodada.

## 2. Item 1 — a praça e o mercado ao fim da tarde (D-225, D-226)

(em andamento: o desenho e a medida da metrópole; a prova e as sabotagens a seguir)
