# O dinheiro de cada povo — um valor só por baixo, o dinheiro de cada povo por cima (D-984)

*A pergunta e a ideia do dono (25/11/2026): «essas peças de prata, as partes de cacau lá nos astecas… respeitam a lógica, né? Nada vem do
nada»; e: «cada civilização tem uma moeda, todas têm a mesma moeda… moedas de prata ou de ouro, mas com a carinha do rei de cada uma, qual
você acha que é a melhor solução?». A recomendação do supervisor foi aprovada pelo dono no mesmo dia: «Show de bola, pode fazer desse jeito
aí. Tá deferido.»*

## O problema de hoje

As moedas andam pelo livro e nascem da cunhagem (`js/economy.js`, o `runMint`: uma onça do ouro do povo vira seis moedas do tesouro) — mas
**o material não é o do nome**: todo povo cunha do ouro, e o jogo chama o dinheiro do nórdico de «peças de prata», o do egípcio de «deben de
cobre» e o do asteca de «grãos de cacau» (`G.Falas.MONEY`). A prata nem existe no mundo, e o grão de cacau não vem do cacaual. E o tesouro
do povo ainda tem escritas à mão, fora do livro (o T-063).

## A decisão

**Um valor só por baixo:** a economia continua contando o valor numa unidade só (as `moedas` de hoje) — os preços, o comércio entre os
povos, os impostos e os salários não mudam e não ganham conversão nenhuma (é o que a mantém sem bugs).

**O dinheiro de cada povo por cima:** na mão das pessoas, cada povo tem o seu, feito do seu material, pelo seu processo, com o seu nome e a
sua cara:

| Povo | O dinheiro | De onde vem | Como se faz |
|---|---|---|---|
| romano | o denário de prata (e o áureo de ouro, o valor grande dos ricos) | a prata da mina | cunhado, **com o rosto de quem governa** |
| grego | a dracma de prata | a prata da mina | cunhada, **com o rosto de quem governa** (ou o símbolo da cidade) |
| nórdico | a prata em pedaços — braceletes cortados e moedas de outros povos | a prata da mina, a do comércio e a do saque | pesada na balança de dobrar; às vezes um pedaço traz metade do rosto de um rei estrangeiro |
| clássico (a aurora das cidades) | o siclo de prata | a prata da mina | pesado pelo escriba e anotado na tabuinha de barro |
| egípcio | o deben de cobre | o cobre da jazida (já existe) | pesado na balança; não se cunha |
| asteca | o grão de cacau (o troco) e a manta de algodão, o *quachtli* (o valor grande) | o cacaual (já existe) e o algodão (a frente V) | colhido e tecido; não se cunha |

O povo sem o seu material não tem dinheiro: troca em espécie, como o jogo já diz. O ouro fica para o ourives, para o tesouro e para quem é
rico.

**A cara do rei** (a ideia do dono): quem cunhava moeda — o romano e o grego — põe nela o rosto de quem governa, feito do mesmo rosto do
jogo (o genoma, a feição). Morreu o rei, as moedas novas saem com o rosto do sucessor. Os que pesavam metal ou usavam cacau não têm rosto,
porque não cunhavam moeda — fiel à história.

**Entre os povos:** o valor é o mesmo por baixo; o cambista da feira (a onda E dos interiores) troca o dinheiro de um povo pelo de outro,
com uma taxa pequena, como os cambistas gregos.

## A ordem

1. **A frente W dos interiores 3 (a Fase 1, junto das outras mudanças do mundo e da geração única dos mundos prontos):** o material de cada
   povo, a prata no mundo (a jazida, a mina, a fundição, a origem), a cunhagem, a pesagem e a colheita de cada povo, o T-063 fechado.
2. **A tela** (a frente B, a bolsa do corpo, e a W): o dinheiro com o nome e a figura do povo do corpo; a moeda do romano e do grego com o
   rosto de quem governa agora.
3. **Depois** (com o tesouro do palácio, onda A, e os patches dos ofícios): cada lote de moedas guarda o rei de quando foi cunhado — as
   moedas antigas circulam com o rosto antigo —; o colecionador atrás da moeda rara (38), o falsificador (34), o usurpador que cunha a sua
   cara (40), o cambista (37).
