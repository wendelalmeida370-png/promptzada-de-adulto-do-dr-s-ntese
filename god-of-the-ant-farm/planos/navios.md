# A vida a bordo e o porto (uma mecânica fundamental)

O pedido do dono (18/11/2026): os barcos e os navios por dentro — **entrar** em canoas, em barcos e em navios gigantes,
**andar** no convés e nos interiores enquanto o navio navega, **o itinerário do porto** (que navio sai, que navio chega, para
onde, a que hora). O dono vai pedir isso mais para frente; aqui fica o registro e o esboço, porque a Pesca
([`oficio-pesca.md`](oficio-pesca.md)), o remador de galé ([`condicao-escravo-gale.md`](condicao-escravo-gale.md)), o
marinheiro, o pirata e o pescador de alto-mar dependem dele.

## 1. O que já existe

- **Os navios do mundo** (`js/naval.js`): quem está a bordo (`G.Naval.board` / `unboard`, `v.aboard` é a única verdade), a
  tripulação, a reta de água, o navio que afunda e o que fica à deriva.
- **O porto** (`js/harbor.js`, `js/act-porto.js`): o mercante e a tripulação dele (os marinheiros da cidade, o soldo, a viagem
  na vida de cada um), a descarga, os estivadores.
- **As frotas de guerra** (`js/fleets.js`), as **expedições** (`js/expeditions.js`: a colônia, o explorador, a jangada) e os
  **pescadores com barco** (`js/fishers.js`).
- **O corpo nada** e pisa o cais; o navio é desenhado por fora no 3D.

## 2. O que falta (o que o dono pediu)

1. **Os barcos e os navios por dentro:** o convés, o porão, as cabines, o banco dos remos de uma galé, a cozinha, o depósito
   — cada tipo de barco com a sua planta (como as plantas dos prédios: `G.Interiors`).
2. **O chão que anda:** o corpo e as pessoas andando num convés que navega, balança com a onda e vira com o vento — a parte
   mais difícil (o chão do mundo hoje é parado).
3. **Embarcar:** pela prancha no cais, pelo cabo na água, pulando de um barco para outro na abordagem.
4. **Os tipos:** a canoa e a jangada, o barco a remo, o barco de papiro, o barco de pesca a vela, o mercante, a galé de guerra
   (com os bancos de remo), os navios gigantes.
5. **O itinerário do porto:** a tábua dos navios (no cais, como uma coisa do mundo): que navio sai, para onde, a que hora,
   quanto custa a passagem, que navio chegou e de onde; o corpo pode comprar a passagem, se engajar como marinheiro, ou entrar
   escondido.
6. **A viagem:** os dias no mar (vividos ou no salto), com o que acontece — a tempestade, a calmaria, a doença a bordo, os
   piratas, a terra avistada; as funções a bordo (o capitão, o piloto, o marinheiro, o remador, o cozinheiro, o carpinteiro, o
   passageiro).
7. **A batalha no mar com o corpo a bordo:** o abalroamento, a abordagem, o fogo, o naufrágio.

## 3. As partes (para quando for feito)

| Parte | O quê | Quem precisa |
|---|---|---|
| N1 — Os barcos pequenos | a canoa, a jangada, o barco a remo e o de pesca: entrar, remar, ficar de pé no barco que balança, pescar dele | a Pesca (a costa, P2) |
| N2 — O navio por dentro | as plantas dos navios, o chão que anda, as pessoas a bordo nos seus postos | o marinheiro, a galé, o pirata |
| N3 — O porto e o itinerário | a tábua dos navios, a passagem, o engajamento, o clandestino | as viagens do corpo |
| N4 — A viagem e o mar | os dias no mar, o que acontece neles, as funções a bordo | o alto-mar, o explorador |
| N5 — A batalha no mar | o abalroamento, a abordagem, o naufrágio com o corpo a bordo | a guerra, a galé, o pirata |

A N1 entra no Patch 26, com a segunda fase da Pesca; a N2 e a N3 no Patch 37; a N4 e a N5 no Patch 38 ([`roteiro.md`](roteiro.md)).

## 4. As regras que já valem

`v.aboard` só pelas portas do `naval.js`; a reta de água pelo `Nv.losWater`; a tripulação do mercante pelo `crewFor` /
`crewHome`; quem viaja deixa o posto; o cais não tira ninguém da cama; o mundo sem o corpo é o mesmo (as pessoas do mundo
embarcam, remam e viajam pelas mesmas regras).
