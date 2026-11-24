# Os ofícios dentro dos prédios — o levantamento B (interiores 3)

*Pesquisa só de leitura, 24/11/2026. Nenhum arquivo do repositório foi mudado.*

**O pedido do dono** (resumido): refazer o interior de todos os prédios no nível da taverna, **já com a estrutura física para os
ofícios que vêm**. O palácio majestoso, com a mesa gigante do conselho e do banquete, e com burocratas morando lá. A prisão com a
condição de preso e o trabalho do guarda, do delegado e do policial. O porto e o cais com o itinerário dos navios, o marinheiro, o
estivador e o pirata que quer roubar. «Isso vale para todas as edificações.»

**O que li.**
- **Os planos:** o README, o roteiro, o `oficios.md` (os 85 ofícios e as 13 condições), os 19 `oficio-*.md`, a
  `condicao-escravo-gale`, o `grupos`, o `pericias`, o `economia-oficios`, o `saber`, o `cozinha`, o `npcs-brainstorm`, o
  `navios`, o `marcas`, o `leitura`, o `calendario` e o `mundo-grande`.
- **Os planos lidos onde citam prédios:** o `oficios-fundacao`, o `patch23-as-vidas`, o `subterraneo`, o `passado` e o `montanha`;
  e, para o contexto, o `interiores-2`, o contrato dele e a `taverna-onda4`. Por alto, o `JOGABILIDADE.md` e o `SOCIEDADE.md`.
- **O código, para dizer o que é «hoje»:**
  - o `G.BDEF` (os 56 tipos, registrados por 9 arquivos) e o `js/escala.js` (os degraus);
  - as receitas das plantas: `int-trabalho.js`, `int-civicos.js`, `int-palacio.js`, `int-familias.js`, `int-monumentos.js` e
    `int-moveis.js`;
  - quem usa cada prédio: `court.js`, `crime.js`, `harbor.js`, `fishers.js`, `economy.js`, `act-servicos.js`, `act-lazer.js`,
    `act-casa.js`, `war.js` e `justice.js`.
- **Uma conta em Node** (o `nodemundo`, só leitura) listou os tipos, os degraus, as formas, os postos e as plantas: **56 tipos, 31
  com planta, `In.VERSION` 6.**

**Como ler.**
- **Hoje** é o que o jogo já faz naquele prédio, com o arquivo que faz.
- **Px** é o patch em que o roteiro (§3) põe o ofício. Um traço (—) quer dizer que o roteiro não põe o ofício em patch nenhum.
- Cada pedido traz a sua fonte entre parênteses, abreviada: `(gov §7)` é o `oficio-governante.md`, seção 7. As abreviações estão no §17.
- **(inferência)** marca uma proposta minha, sem pedido escrito num plano. Fica para o supervisor decidir.
- **⚠ C-n** marca um conflito: com uma regra, uma fundação, o tamanho do lote ou outro plano. **◻ L-n** marca uma lacuna: um ofício sem
  prédio, um prédio pedido que não existe, uma atividade sem lugar. A lista inteira está no §15.
- Os números de capacidade são **propostas para começar**, como nos planos.

---

## 0. Em uma página

1. **25 dos 56 tipos não têm planta.** Entre eles estão vários que os ofícios futuros pedem por dentro:
   - a **doca**, que não tem planta nem forma;
   - a **administração**, a **coletoria** e o **mercado clandestino**;
   - a **salga**, a **casa da seda** e a **casa dos mergulhadores**;
   - o **estábulo**, o **curral**, a **mina** (por fora), a **torre** e o **cercado**.
2. **O palácio já tem a sala do conselho** nos degraus da forma (24 a 40 m), mas com uma «mesa de conferência» de 1,2 × 0,7 m — a mesma
   peça do armazém do porto. No palácio de 24 m essa sala tem 3,5 m de largura, e **não há sala de banquete**; no grande e no colossal o
   banquete tem de 23 a 29 m², com duas mesas. **A mesa gigante não existe**: nem a do conselho, nem a do banquete, nem o leito de
   banquete do romano (C-2, C-19).
3. **Quem mora no palácio é uma regra das fundações** (D-205 a D-207, `K.reign` / `K.ofCourt`, regra 72): só a casa de quem governa, e
   quem não é da família sai. **Os burocratas morando lá, como o dono quer, pedem uma porta nova**: camas do pessoal da sede, que não
   sejam `aposentos` nem `housing`. É o maior conflito deste levantamento (C-1).
4. **A cadeia tem 8 m e nenhum degrau** (o mundo prende até 4, `cells: 4`; a planta faz de 4 a 6 celas de 4 a 7 m²; um carcereiro). Não cabe nela o que o dono pede: o corpo da guarda, a cela comum,
   a cela de espera do julgamento, a visita, o pátio, a sala de ouvir o preso. **Ela precisa de uma escada de degraus**, como a taverna e
   o templo têm — e isso muda o planejador e os mundos prontos (C-5).
   - **E há três prisões, não uma** (C-14): a cadeia do preso da lei; a espera da sentença de quem governa, de pé ao relento diante
     do quartel ou do cercado (`justice.js`); e o cercado onde o cativo de guerra dorme.
5. **O guarda não tem patch no roteiro nem documento**, e o caçador de recompensas também não. A lista põe o guarda na «luta»
   (com o carcereiro, o guarda-costas e os vigias do fogo dentro dele); o «delegado» e o «policial» do dono são esse ofício.
   - **O vigia de hoje não tem prédio**: anda a ronda da noite com a tocha.
   - **Os soldados de guarda ficam à porta** de nove tipos de prédio, nunca dentro deles — só na torre eles sobem (L-1).
6. **O porto inteiro cabe hoje numa doca de 8 m**: o cais com as caixas, os 12 postos de pescador, o galpão das redes e a carreira do
   estaleiro do `fishers.js`. Ficam sem lugar:
   - o itinerário dos navios: a tábua, a passagem, o engajamento, o clandestino (`navios` N3);
   - a alfândega (`fisc` §6), o guindaste e a prancha (`estiv` §4), a chamada da manhã (`estiv` §3);
   - a vigia da noite, contra o pirata que rouba o navio (`pir` §18).
   Nem a alfândega nem o estaleiro existem como tipo (C-7, L-8).
7. **O tesouro do povo não tem lugar no mundo**: é o lugar `f:` do livro, sem prédio.
   - A sala do tesouro do palácio, que a forma já tem com dois cofres, mostraria moedas sem causa.
   - O ladrão não pode roubar o tesouro.
   - As «chaves do tesouro» do governante (`gov` §19) não abrem nada (C-3).
8. **A maravilha são cinco prédios num tipo só** (C-12):
   - o Coliseu romano: a arena do gladiador;
   - a Grande Pirâmide egípcia: o túmulo, do saqueador e do arqueólogo;
   - o Templo Mayor asteca: o sacrifício;
   - o Salão de Valhala nórdico: o banquete e o escaldo;
   - a Acrópole grega.
   O **teatro** também muda de função: é a Arena no romano e o Campo de Pelota no asteca. Cada um pede outro programa.
9. **A oficina genérica** (`workshop`, sem posto) responde sozinha pelo carpinteiro, pelo coureiro, pelo cordoeiro, pelo vidreiro, pelo
   alfaiate, pelo construtor e pelo engenheiro: **sete ofícios da lista sem prédio próprio** (C-13).
10. **Uns 30 prédios que os planos pedem não existem** (§14). Entre eles:
    - a alfândega, o estaleiro e o farol;
    - a escola de gladiadores, a escola e o observatório;
    - o templo da cura, a casa da moeda e o tribunal;
    - o posto da guarda, a casa do carrasco e o pelourinho;
    - o moinho, a padaria, a queijaria, o lagar e o curtume;
    - a estalagem e a estação do correio, o circo, o estádio e o abrigo do passo.
11. **Há uma estrutura comum a todos os prédios** (§2):
    - o posto (uma peça ou uma marca de trabalho) e o lugar dado pelo repartidor;
    - as zonas e as portas guardadas;
    - a decoração com causa;
    - os pontos de encaixe da animação (a 23c);
    - as superfícies onde as marcas ficam;
    - o porquê que se lê no próprio cômodo;
    - um lugar do livro para cada coisa que se guarda.

---

## 1. O mapa: quem trabalha, mora ou fica preso em qual prédio

### 1.1 Os 85 ofícios (`oficios.md` §6)

| Ofício (o que inclui) | Hoje | Px | Os prédios onde vive e trabalha (◻ = o tipo não existe) | Fonte |
|---|---|---|---|---|
| **pescador** (de rede, piscicultor) | `pescador`, 12 postos na doca | 25, 26, 36 | doca, salga, mercado/feira (a banca), taverna do porto (a tábua dos recordes) | pesca §2, §10, §11 |
| **mergulhador** (recife, pérolas, naufrágio) | `mergulhador`, 2 na casa dos mergulhadores | — | casa dos mergulhadores, ourivesaria (vende a pérola) | ofi §6; pesca §11 |
| **navegador** (piloto do porto, cartógrafo do mar) | — | 26, 36, 41 | doca (o canal do porto, a tábua), biblioteca (o périplo copiado), ◻ farol, o navio | nav §7.10, §15, §18 |
| **marinheiro** (barqueiro, canoeiro; capitão é título) | `marinheiro` (2 por rota, `harbor.js`) | 35 | doca (o cordame, o chamado), taverna do porto, o navio | navios §2; CL (`crewFor`) |
| **construtor naval** (o estaleiro, o casco) | a carreira na doca (`fishers.js`) | — | ◻ estaleiro (hoje dentro da doca) | ofi §6; sab era III e V |
| **estivador** (guindasteiro) | `estivador`, 3 no armazém do porto | 35 | armazém do porto, doca (a prancha, o guindaste, a chamada), taverna do porto | estiv §3, §4, §6 |
| **remador de galé** (voga é título) | — | 35, 36 | o navio; a doca (a galé no porto) | gale §3, §8 |
| **pirata** (corsário, naufragador) | — | 36 | o navio, a doca (a informação; roubar o navio à noite), taverna do porto, mercado clandestino (o receptador) | pir §8.1, §12, §18 |
| **agricultor** (campo, horta, pomar, arrozal) | `agricultor`, `lavrador`, `fruticultor` | 28 | fazenda, plantação, pomar, horta, celeiro, ◻ eira | ofi §6 (sem documento) |
| **vinhateiro e lagareiro** (o vinho e o azeite) | `vinhateiro` | 28 | vinhedo, pomar (o olival), ◻ lagar | ofi §6; sab era IV |
| **apicultor** | `apicultor` | 28 | apiário | ofi §6 |
| **pastor** (queijeiro, transumância) | `pastor`, 2 no curral | 28 | curral, ◻ queijaria | ofi §6; coz §4 |
| **criador de cavalos** (domador) | `cavalarico`, 2 no estábulo | 28 | estábulo | ofi §6 |
| **cozinheiro** (doceiro, de bordo, provador) | `cozinheiro` da taverna (`taverna-oficios.js`) | 27, 28 | taverna, palácio (o mestre-cuca, o provador), casa rica, navio, ◻ cozinha do quartel | coz §10, §12 |
| **padeiro** (moleiro) | — | 28 | ◻ padaria, ◻ moinho, o forno da casa | coz §4, §12 |
| **açougueiro** (salgador, defumador) | `acougueiro` 1; `salgador` 1 | 28 | açougue, salga, curral | coz §12; ofi §6 |
| **mateiro** (guia da mata, batedor) | — | 30 | (a mata) — contratado na taverna; a carta da mata vendida no mercado | mat §7; tav §16 |
| **caçador** (armadilheiro, de feras) | `cacador` | 30 | casa (a pele na parede), taverna (o chifre), açougue, ◻ curtume, arena (o bicho vivo) | caç §10, §11 |
| **falcoeiro** | — | — | ◻ (nenhum lugar para as aves) | ofi §6 |
| **ervanário** (remédio e veneno) | — | 30 | ◻ botica ou jardim das plantas, casa, banca | ofi §6; sab era V |
| **lenhador** (carvoeiro) | `lenhador` | 30 | (a mata), armazém (a lenha), ◻ carvoaria | ofi §6 |
| **guia de montanha** (resgatador) | — | 42 | ◻ abrigo do passo | mont §10 |
| **coletor das alturas** | — | 30, 42 | (os penhascos) | ofi §6 |
| **mineiro** (sapador, poceiro) | `mineiro`, 4 na mina | 31 | mina (a boca, o lavadouro), forja (o fogo de pátio) | min §3, §7.9 |
| **garimpeiro** | — | 31 | (o rio) | sub §4 |
| **explorador de cavernas** | — | 31 | (as cavernas) | sub §4 |
| **explorador** | (as expedições) | — | doca (a expedição parte), palácio (quem paga) | ofi §6 |
| **correio** (mensageiro) | — | 37 | ◻ estação do correio, estábulo (os cavalos frescos), palácio (o mestre do correio) | sab §14b |
| **arqueólogo** (decifrador, restaurador) | — | 38 | biblioteca (◻ sala das antiguidades), palácio (◻ coleção), templo, ◻ bancada de restaurar | arq §4, §14 |
| **caçador de tesouros** | — | 38 | taverna (a pista), templo e biblioteca (o registro dos mortos), mercado, casa rica (o patrocínio) | tes §1, §4 |
| **saqueador de túmulos** | — | 38 | cemitério, monumento e maravilha (o túmulo do rei), templo, ourivesaria (o derretimento), mercado clandestino | saq §4, §6, §11 |
| **ferreiro** (fundidor) | `ferreiro`, 2 na forja | 32 | forja | ofi §6 |
| **armeiro** | — | 32 | forja, quartel (o armeiro) | ofi §6 |
| **ourives** (lapidário) | `ourives`, 1 | 32 | ourivesaria | ofi §6 |
| **oleiro** | `oleiro`, 2 | 32 | olaria | ofi §6 |
| **tecelão** (tintureiro, seda) | `tecelao` 3; `sericultor` 2 | 32 | tecelagem, casa da seda, ◻ tinturaria | ofi §6 |
| **alfaiate** | — | 32 | ◻ (oficina) | ofi §6 |
| **coureiro** (sapato, sela, pergaminheiro) | — | 32 | ◻ curtume (oficina) | ofi §6; caç §10 |
| **carpinteiro** (marceneiro) | (a oficina, sem posto) | 32 | oficina, ◻ estaleiro | ofi §6 |
| **cordoeiro** (corda, rede, cesto) | — | 32 | ◻ cordoaria (oficina) | ofi §6 |
| **vidreiro** | — | 32 | ◻ vidraria | ofi §6; sab era III e V |
| **construtor** (pedreiro; arquiteto é título) | `construtor` | 32 | o canteiro da obra, oficina | ofi §6 |
| **soldado** (arqueiro, fundeiro, escalador, besteiro, artilheiro) | `guerreiro` (o treino à porta do quartel, os postos de guarda) | 33 | quartel, torre, muralha e portão, palácio (a guarda) | ofi §6 |
| **cavaleiro** | — | 33 | quartel, estábulo | ofi §6 |
| **mercenário** | — | 33 | quartel, taverna (onde se contrata) | ofi §6 |
| **comandante** (general é título) | (os títulos do `army.js`) | 33, 40 | quartel (◻ sala do comando), palácio (o conselho) | gov §7, §19 |
| **gladiador** (bestiário; lanista é título) | o «ator» que luta na areia do Coliseu (`act-lazer.js`) | 33 | ◻ escola de gladiadores, teatro romano (a Arena), maravilha romana (o Coliseu) | glad §5, §7, §9 |
| **guarda** (carcereiro, guarda-costas, vigias do fogo) | `carcereiro` 1; `vigia` (a ronda) | **—** | cadeia, ◻ posto da guarda, palácio, quartel, ◻ estação dos vigias do fogo | ofi §6; sab §14b |
| **caçador de recompensas** (rastreador de fugitivos) | — | **—** | cadeia (entrega), ◻ posto da guarda (a tábua das recompensas), taverna | ofi §6; eco §2 |
| **capataz** (o comitre e o feitor) | — | 36 | o navio (a galé), mina, cercado, o campo | cap §2, §4 |
| **ladrão** (batedor de carteira, arrombador) | o furto do `crime.js` | 34 | as casas (o alvo), mercado, armazém, cadeia | ofi §6 |
| **salteador** | — | **—** | (a estrada) | ofi §6 |
| **contrabandista** (receptador) | `contrabandista`, 2 no mercado clandestino | 34 | mercado clandestino, armazém do porto, doca | fisc §3, §6 |
| **falsificador** | — | **—** (o antagonista do fiscal no 34) | ◻ oficina escondida, mercado clandestino | fisc §5 |
| **espião** (informante, chantagista) | — | 34 | taverna, palácio (o espião-mor) | gov §7; tav §7 |
| **assassino** (envenenador) | — | 34 | palácio (a cozinha, o provador), taverna | coz §12; gov §11 |
| **taverneiro** (cervejeiro; estalajadeiro é título) | `taverneiro`, `cozinheiro`, `cervejeiro` | 27 | taverna (e a hospedaria) | tav §3, §8 |
| **mercador** (feirante, especieiro) | `mercador` 3; `feirante` 4 | 37 | mercado, feira, casa mercante (`h.elite`), armazém, doca | ofi §6 |
| **caravaneiro** | (as carroças) | 37 | estábulo, ◻ caravançará, armazém | ofi §6 |
| **banqueiro** (cambista) | — | **—** | ◻ banco (a mesa e o cofre), feira (a mesa do cambista) | sab era IV e V |
| **sacerdote** | `sacerdote` (o altar, as oferendas) | 38 | templo | ofi §6 (sem documento) |
| **oráculo** | (a caverna do oráculo, `caves.js`) | 38 | a caverna, templo | ofi §6; sub §1 |
| **monge** (eremita, peregrino) | — | — | ◻ mosteiro, templo, a caverna | ofi §6 |
| **escriba** (copista, cronista, mestre-escola, tradutor, taquígrafo, papeleiro) | `escriba` 2 na administração; `copista` 1 na biblioteca | 38 | administração, biblioteca, ◻ tribunal, ◻ escola, palácio (o escritório) | ofi §6; sab §14b |
| **curandeiro** (parteira, barbeiro) | — | 38 | casa (o parto, o doente), ◻ templo da cura | ofi §6; sab §8 |
| **filósofo** | — | 38 | ◻ escola de filosofia (o pórtico), praça (o debate), biblioteca | sab §6, §14 |
| **astrônomo** (astrólogo) | — | 38 | ◻ observatório (o terraço do templo, a torre), palácio (o astrólogo da corte) | sab §8, §14b |
| **engenheiro** (mecânico, geômetra, relojoeiro) | — | 38 (ou 32) | ◻ oficina do engenheiro, o canteiro, aqueduto | sab §8, §14 |
| **médico** | — | 38 | ◻ templo da cura e hospital, casa, palácio (o médico da corte), ◻ escola de gladiadores | sab §8; gov §7; glad §5 |
| **naturalista** (cartógrafo) | — | 38 | biblioteca (o livro dos bichos), ◻ jardim das plantas | sab §14 |
| **alquimista** (perfumista, saboeiro) | — | 38 | ◻ laboratório (o alambique) | sab era VI |
| **bardo** (poeta) | o músico do estrado (`act-taverna.js`) | 39 | taverna, praça, palácio (o bardo da corte), paço (o salão do chefe), teatro, templo, cemitério | bardo §7, §14 |
| **músico** | o músico da taverna | 39 | taverna, palácio (o banquete), teatro, templo | ofi §6 |
| **ator** (dançarino, acrobata) | `ator`, 2 no teatro | 39 | teatro | ofi §6 |
| **pintor** | — | 39 | ◻ ateliê; as paredes (as marcas) | marc §3, §4 |
| **escultor** | — | 39 | ◻ oficina do escultor; praça, palácio (a estátua com o rosto) | marc §9 |
| **auriga** | — | 39 | ◻ circo, estábulo | ofi §6 |
| **atleta** | — | 39 | ◻ estádio e ginásio; o Campo de Pelota (o teatro asteca) | ofi §6; glad §2 |
| **quem governa** (rei, cônsul, imperador, porta-voz; o nobre) | o governante (`G.Politics`), a audiência (`court.js`) | 40 | paço, palácio, grande palácio, palácio colossal, praça (o discurso) | gov §7–§9, §19 |
| **conselheiro** (cortesão) | — | 40 | palácio (o conselho, a corte) | gov §7, §21 |
| **juiz** (advogado) | (a pena sai pelo regime: `G.Crime.sentence`) | 34 | ◻ tribunal (a porta da cidade, o fórum, o palácio, o templo, a assembleia), cadeia | juiz §3, §9 |
| **carrasco** (açoite; o lado de curandeiro) | um papel de um dia (`justice.js`) | 34 | o cadafalso na praça, ◻ casa do carrasco fora dos muros, ◻ colina da forca, cadeia | carr §3, §4, §7 |
| **embaixador** | o emissário (`Co.audiencia` «embaixada») | 40 | palácio (◻ a ala dos hóspedes) | gov §5.6, §7 |
| **agitador** | — | 40 | praça, taverna | gov §21 |
| **fiscal** (do mercado, da alfândega, o cobrador) | `cobrador`, 3 na coletoria | 34, 35 | mercado (◻ a mesa das medidas), ◻ alfândega, coletoria, administração | fisc §5–§7, §13 |

### 1.2 As 13 condições (`oficios.md` §6)

| Condição | Onde vive, onde fica preso | Fonte |
|---|---|---|
| **galeote** | o banco da galé (o navio, N2); no porto, a galé atracada e «os guardas do cais»; o mercado de onde os cativos vão para o remo | gale §1, §8; pir §13 |
| **escravo da mina** | mina (a galeria, o lavadouro); à noite, o cercado | sub §4; cap §2, §4 |
| **gladiador escravo** | ◻ escola de gladiadores: as celas, as correntes, a liberdade vigiada para os voluntários | glad §5 |
| **cativo e preso** | **hoje há três prisões**: o preso da lei fica na **cadeia** (`v.jail`, `crime.js`); quem espera a sentença de quem governa (a conspiração, a revolta: «preso, esperando a sentença», o afazer `jail` do `justice.js`) fica de pé ao relento, **diante do quartel ou do cercado** (`holdSpot`); o cativo de guerra dorme no **cercado** (`runSleep`, `Wr.penOf`). O plano do preso é do Patch 34, sem documento | CL (`v.jail`); `justice.js`; `villagers.js`; `war.js` |
| **servo** | as casas ricas e o palácio (◻ a cama do criado) | ofi §6; gov §7 |
| **mendigo** | a fogueira («abrigo para quem não tem casa»), a praça e o templo (inferência), o barraco | BDESC; ofi §6 |
| **exilado** | (fora da cidade) | juiz §6 |
| **foragido** | o mercado clandestino, a caverna, o acampamento na mata | mat §13; sub §4 |
| **náufrago** | a praia, a doca (quem é recolhido) | gale §11; CL (L-824) |
| **perdido** (e o soterrado) | a mina, a mata, a montanha | min §9; sub §4 |
| **órfão, criança, ancião** | a casa (`G.Tutela`: a casa do tutor), ◻ a escola | CL; sab §8 |
| **viúvo** | a casa (o luto) | CL (`homeBound`) |
| **herdeiro** | a casa; no palácio, o herdeiro impaciente (o seu aposento) | gov §7 |

### 1.3 As funções do mundo e os cargos (`oficios.md` §6; `saber.md` §14b; `oficio-governante.md` §5.4)

| Quem | É | Onde trabalha (o prédio e a peça) | Fonte |
|---|---|---|---|
| aguadeiro | função | poço, aqueduto, banhos | ofi §6 |
| carregador e os homens da roda do guindaste | função | doca (◻ o guindaste de roda), o canteiro da obra | sab §14b; estiv §4 |
| mensageiro | função (a carreira é o correio) | ◻ estação do correio, palácio | ofi §6 |
| foguista | hoje é ofício (`foguista` dos banhos) | banhos (a fornalha) | CL (D-227) |
| servente | função | taverna, palácio | ofi §6; tav §12 |
| faroleiro | função | ◻ farol | nav §15 |
| salineiro | hoje é ofício | salina | ofi §6 |
| arauto | função (hoje chamado no dia da execução) | praça, palácio (a audiência), cadafalso | carr §3; gov §20 |
| recenseador | função | administração, a mesa do censo na praça, de porta em porta | sab §14b |
| medidor dos campos | função | administração (os mapas), os campos | sab §14b |
| vigia da quarentena | função | a casa marcada (a porta) | sab §14b |
| general, tesoureiro, governador, sumo-sacerdote, chefe da guarda | cargos | palácio (o conselho), quartel, templo, ◻ posto da guarda; o governador numa sede da sua cidade (L-3) | gov §5.4 |
| censor | cargo | administração (as listas), praça (a mesa do censo) | sab §14b |
| curador das águas | cargo | aqueduto, banhos | sab §14b |
| mestre do correio | cargo | ◻ estação do correio, palácio | sab §14b |
| bibliotecário-mor | cargo | biblioteca | sab §14b |
| astrólogo da corte | cargo | palácio, ◻ observatório | sab §14b |
| guardião do calendário | cargo | templo (o calendário pintado na parede) | sab §14b, era II |

**E os papéis de hoje que a lista absorveu:** o `coletor` (a coleta), o `cacador`, o `lenhador`, o `agricultor`, o `construtor`, o
`guerreiro`, o `cativo`, a `crianca` e o `anciao` continuam como papéis do repartidor. Os ofícios novos de hoje (o `foguista`, o
`copista`, o `ator`, o `cozinheiro`, o `cervejeiro`, o `fruticultor`, o `lavrador`, o `salgador`, o `salineiro`, o `sericultor`) viram
especialidades dos ofícios da lista, ou funções.

### 1.4 Quem fica sem prédio (a lista seca)

- **Ofícios sem prédio nenhum para trabalhar dentro:** o falcoeiro, o ervanário, o alfaiate, o coureiro, o cordoeiro, o vidreiro, o
  banqueiro, o filósofo, o astrônomo, o engenheiro, o médico, o alquimista, o pintor, o escultor, o auriga, o atleta e o juiz (que não
  tem tribunal). Também o guarda e o caçador de recompensas, que não têm posto próprio.
- **Ofícios que só têm o prédio de outro:** o construtor naval (a carreira dentro da doca), o gladiador (a areia, sem a escola), o
  padeiro (o forno da casa), o carrasco (o cadafalso de um dia).
- **Ofícios sem patch no roteiro:** o guarda, o caçador de recompensas, o salteador, o falsificador (só como antagonista), o
  banqueiro, o monge, o explorador, o construtor naval, o mergulhador e o falcoeiro (L-1). **O pedido do dono sobre a prisão
  cai justamente no guarda.**

---

## 2. O que vale para todo interior que recebe um ofício (as regras comuns, tiradas dos planos)

Estas são as exigências que se repetem em quase todo prédio. Postas uma vez na gramática, servem a todos.

1. **O posto é uma coisa do mundo.**
   - **O que diz:** cada ofício trabalha num posto: uma peça com `job` (a bancada, o altar, o balcão) ou uma marca sem peça (o
     «vigiar» dos guardas do palácio, o «lutar» da areia). O repartidor de lugares (`In.places`) dá o posto a quem tem o ofício, pela
     regra do tipo (`In.placeRule`).
   - **Fonte:** JOG §9.3 (os móveis, o `useRule`); CL (D-085).
2. **As três zonas e as portas guardadas.**
   - **O que diz:** quase todo prédio de ofício tem uma **zona pública** (quem vem: o freguês, o fiel, o povo da audiência, o
     estivador da chamada), uma **zona de serviço** (quem trabalha: a cozinha, o porão, a forja, o corpo da guarda) e uma **zona
     privada** (quem mora: os aposentos, o quarto do taverneiro, o dos sacerdotes). Entre elas há **portas guardadas**: com chave
     (a tranca da noite, `lockNight`; o quadro das chaves), com gente (o guarda de posto, o porteiro) ou as duas coisas.
   - **Fonte:** a pergunta do dono; gov §7, juiz §9, carr §7, fisc §6, tav §8, saq §6.
   - **O que já existe:** `In.doorRule`, o `lockNight`, o `In.guestIn` (ninguém fica trancado dentro), a grade da cela
     (`cellDoor: 'grade'`) e as marcas de guarda.
3. **Cada grupo precisa de um lugar onde se junta.**
   - **O que diz:** o conselho, a turma da chamada, a tripulação, a escola de gladiadores, o tribunal, a escola. Isso pede uma mesa ou
     uma roda do tamanho do grupo, e um lugar para quem espera.
   - **Fonte:** grp §3, §6, §7.
4. **A decoração tem causa** (a regra magna, D-651), e todo ofício tem o seu **quadro do ofício**:
   - a peça de mestre exposta na oficina (fund §2.6);
   - a tábua dos recordes (fund §2.6; pesca §10);
   - a tábua do fiado (tav §6);
   - a parede dos rabiscos (int2 §5.1; marc §10);
   - as peles e os chifres (caç §11);
   - o mapa na parede (sab era III);
   - o calendário pintado (sab era II).
   Nada disso aparece sem o fato que o causou.
5. **Os pontos de encaixe da animação.**
   - **O que diz:** o banco, a cama, o balcão, a porta, o poço, a mesa, a parede, o cão — cada coisa diz onde se senta, onde se apoia
     a mão e onde se segura.
   - **Fonte:** p23 23c (1). Toda peça nova destes ofícios precisa dizer os seus.
6. **As superfícies das marcas.**
   - **O que diz:** a marca fica onde a matéria deixa. Os exemplos dos planos:
     - a parede da taverna e o muro da rua (o rabisco);
     - o pedestal (o nome);
     - a soleira e os degraus gastos (o costume);
     - a madeira do banco da galé e a pilastra do cais (o nome riscado);
     - a parede com a linha da água da cheia.
   - **Fonte:** marc §3, §4b; gale (as marcas); estiv (as marcas).
   - **O que pede da planta:** uma parede ou um piso que o registro das marcas possa endereçar (inferência: um id de superfície na
     planta, puro).
7. **A leitura.**
   - **O que diz:** o porquê de um «não» chega pelo mundo: a tábua dos navios que diz «zarpou», o cartaz da recompensa, o selo de
     cera na porta do armazém, o banco vazio.
   - **Fonte:** leit §2; fisc §22.
8. **Toda coisa guardada é um lugar do livro.**
   - **O que diz:** o tesouro, as provas do crime, a apreensão da alfândega, o cofre dos hóspedes, o pote do jogo, a carga comum do
     grupo (`g:`, grp §3). Para cada uma, o prédio precisa ter a peça que guarda, e o livro precisa ter o lugar. Uma sala que «mostra
     ouro» sem um lugar do livro fere a regra magna.
   - **Fonte:** CL (`G.Depot`).
9. **Nada vem do nada nos móveis.**
   - **O que diz:** os grilhões de ferro só onde há ferro; o banco de pedra, o leito com bronze e a mesa de cedro pelo que o povo teve.
   - **Fonte:** CL (D-440); o `G.Movel3D` pelo `G.Origem.matOK`.
10. **O mundo sem o corpo é o mesmo, e a planta é pura.**
    - **O que diz:** os postos e os lugares novos mudam o mundo (quantos fregueses cabem, quantos presos, quantas camas). Cada
      programa novo sobe o `In.VERSION`, refaz o catálogo e pede os mundos prontos de novo.
    - **Fonte:** CL; int2 contrato §6.
11. **As estações mudam o uso dos prédios** (cal §3, «o que se ganha»):
    - o porto quieto no inverno («a estação de navegar»), e os navios recolhidos;
    - o celeiro cheio na colheita e vazio no fim do inverno;
    - a lareira acesa no inverno;
    - a festa da colheita e a do solstício.
    O interior mostra a estação pela causa.
12. **O mundo grande traz mais gente e cidades maiores** (mg §3). As capacidades devem crescer com o degrau, nunca com um número
    escrito.

---

## 3. O poder

### 3.1 Palácio (`palacio`) — o pedido do dono

**Hoje.**
- **O lote:** de 12 m o palácio «antigo» (só os que já estão de pé: legado) e de **24 m** o degrau novo (6 casas, pela
  `forma.palacio`, de cada povo).
- **As camas:** 10 aposentos (`Co.APOSENTOS`). O tipo não tem posto (`jobs` 0).
- **A planta da forma** (`int-palacio.js` `palaceFormFurnish`):
  - o salão do trono, com o trono, os bancos da corte ao longo das paredes, dois lampadários, os guardas de pé (marcas «vigiar») e o
    eixo de Estado livre (L-513);
  - a sala de audiência (nos degraus maiores) e a sala do conselho, que tem uma «mesa de conferência» de **1,2 × 0,7 m**, duas mesas
    de escriba e um cofre;
  - nas alas: o escritório e o estudo (mesas de escriba e uma arca), a cozinha (o fogo, uma mesa, os jarros), o banquete (duas
    mesas, bancos e jarros), o tesouro (dois cofres e uma arca) e a guarda (o armeiro, um banco e um catre);
  - os aposentos em cima (a cama de casal ou a cama, a arca), o pátio com a fonte e os bancos.
- **As salas medidas** (a forma romana; a egípcia é igual, a nórdica tem um andar só; a conta em Node, `B-trab/salas.js`):

  | Sala | Palácio (24 m) | Grande palácio (32 m) | Palácio colossal (40 m) |
  |---|---|---|---|
  | o salão do trono | 14,0 × 9,4 m | 14,0 × 9,4 m | 14,0 × 9,4 m |
  | a sala do conselho | **3,5 × 9,4 m** | 7,4 × 9,4 m | 11,2 × 9,4 m |
  | a sala de audiência | — (é um aposento) | 7,4 × 9,4 m | 11,2 × 9,4 m |
  | o banquete | **não há** | **5,0 × 5,8 m** | **6,0 × 3,9 m** |
  | a cozinha | 4,0 × 3,9 m | 5,0 × 5,8 m | 6,0 × 3,9 m |
  | o tesouro | não há | não há | 6,0 × 5,1 m |
  | a guarda | 2 salas de 4,0 × 5,9 m | 2 de 5,0 × 5,8 m | 2 de 9,0 × 5,1 m |
  | os escritórios e o estudo | 1 escritório | 2 escritórios | 2 escritórios e o estudo |
  | os aposentos | 1 embaixo e 4 em cima | 6 em cima | 7 em cima |
  | o pátio | 12,6 × 9,6 m | 18,4 × 17,4 m | 24,0 × 8,0 m, mais o pátio de honra |
- **A planta do palácio antigo de 12 m** (a forma de 12 m; a receita `palace()` dá o trono, a cozinha, a despensa, o banquete de duas
  mesas, a guarda e os aposentos): na forma romana, um aposento de 4,9 × 2,5 m, o salão do trono de 9,8 × 4,8 m e a cozinha de
  4,8 × 2,5 m (`B-trab/comodos.js`). **Não tem sala do conselho nem sala de audiência:** a audiência é só o lugar diante do trono (o
  trono tem um lugar «audiencia») e os bancos do salão.
- **Quem mora:** só a casa de quem governa (`G.Casa.reign`, `K.ofCourt`: o par, os pequenos, os crescidos solteiros havendo cama).
- **O que o mundo faz nele:**
  - **a audiência** (`Co.audiencia`): na coroação, na chegada de um emissário e na resposta a uma petição. Quem governa senta no
    trono; a cidade entra pela porta e fica nas marcas «audiencia» e nos bancos;
  - os guerreiros de guarda **à porta** (`E.guardTask`);
  - a vida da casa (`G.Lar`).
- **A auditoria:** nota 1,5. O palácio é «só um quarto»; 40% de quem dorme no paço dorme no chão (int2 §2.5).

| Quem | O que faz (hoje → o patch dele) | Do que precisa (o espaço, a peça, o lugar) |
|---|---|---|
| **Quem governa** (P40) | hoje mora e recebe a audiência. P40: **a audiência da manhã** com a fila de quem pede (gov §9.1); **o conselho** (§9.2); **o livro do reino**: as cartas, os relatórios, os pedidos, o que os espiões contaram (§8, §19); as cerimônias: a coroação, o funeral, a festa, o triunfo, a sentença pública (§9.4); **selar o decreto**, **o discurso da varanda**, **apontar no mapa de guerra**, receber o emissário, **andar disfarçado com o capuz**, «o cansaço na madrugada sobre o livro» (§20); julgar as causas grandes (§5.5; juiz §9: «o rei julgava no palácio»); a fé (rezar; §5.7) | **o trono sobre o estrado** (int2 §6), com a sua escada e o corredor de Estado até ele; **a varanda ou a janela das aparições** sobre a multidão (gov §19: «a varanda sobre a multidão»), com um lugar «falar» e a multidão embaixo; **o gabinete**: a mesa de escrever com o selo, a lamparina, a arca das cartas e dos relatórios (o livro do reino como coisa do mundo); **a mesa do mapa** (sab era III: «o mapa na parede do palácio»); **uma porta de serviço** por onde se sai disfarçado (inferência); o oratório da casa (inferência, gov §5.7) |
| **O conselho**: o general, o tesoureiro, o sumo-sacerdote, o chefe da guarda, o espião-mor, o conselheiro velho (gov §7, §20); **os líderes dos estamentos** — a nobreza, os mercadores, os sacerdotes, os soldados, os artesãos, o povo, cada um «com um líder com nome» (gov §6); **os cargos do saber** — o censor, o curador das águas, o mestre do correio, o bibliotecário-mor, o astrólogo da corte, o guardião do calendário (sab §14b); os governadores das cidades (gov §5.4) | hoje: **ninguém** (não há conselho no mundo, e o grupo é do P24). P40: discutir a guerra, o tesouro, a lei; mentir pela índole; conspirar — «o general janta com os nobres toda semana» (gov §8, §20). **O dono:** «uma reunião com os aristocratas, os burocratas do reino, os conselheiros… aquela mesa gigante» | **a sala do conselho com a mesa gigante**: uma mesa comprida ou em ferradura, com **a cabeceira** (a cadeira alta de quem governa) e os lugares em ordem de posição. Proposta, pela sala de hoje: **10 a 12 lugares** no palácio de 24 m (a sala tem 3,5 m de largura; para 16 a 20 ela precisa juntar-se ao aposento do outro lado do trono), **16 a 20** no grande (7,4 × 9,4 m), **24 a 30** no colossal (11,2 × 9,4 m). As mesas do escrivão e do taquígrafo contra a parede (sab §14b); as lamparinas («a câmara do conselho à luz das lamparinas», gov §19); a porta guardada pelo chefe da guarda; **a antecâmara** onde esperam e cochicham; uma saleta para o conselho de poucos (inferência) |
| **A família**: o par, os filhos, **o herdeiro impaciente**, o irmão, «a mãe que governava antes» (gov §7) | hoje moram nos aposentos (10 camas). P23–P40: a família viva (p23 23e), a intriga, a sucessão | **a ala privada fechada**, com aposentos separados: o de quem governa, o do par, o dos filhos com o berço e o lugar da ama, o da mãe viúva, o do herdeiro com o seu escritório (inferência). **A mesa da família**, o núcleo de toda casa (CL D-196) |
| **Os burocratas que moram lá** (o dono): os escribas da corte, o secretário, o tesoureiro, o camareiro | hoje **não podem morar** (C-1). P40 | **o alojamento do pessoal**, à parte dos aposentos: quartos de uma ou duas camas para os oficiais, o dormitório dos criados (os catres) e o dos guardas. Proposta: **8 a 16 camas** no palácio de 24 m |
| **Os que cuidam**: os guardas, **o provador**, o médico (gov §7); **o mestre-cuca** e **o banqueteiro** (coz §12); os criados (o servente, a condição «servo»); **o bardo da corte** e os músicos (bardo §14); o astrólogo da corte | hoje há guardas à porta e as marcas «vigiar». P27–P40 | **o corpo da guarda** (o armeiro, os catres, o banco — já existe); os postos «vigiar» no trono, no portão e na porta privada; **a cozinha grande**: vários fogos, o forno, a mesa de trabalho, a despensa, a adega («a cozinha cheia… o palácio no banquete», coz §9.8); **a copa entre a cozinha e o banquete**, onde o provador prova; **o corredor de serviço**, separado do eixo de Estado (inferência: o criado não atravessa o salão do trono); **a galeria ou o estrado dos músicos** no banquete; o quarto do médico (inferência) |
| **Os de fora**: os bajuladores, **os embaixadores**, **os reféns**, os artistas (gov §7); o emissário (hoje: a audiência «embaixada») | hoje o emissário entra na audiência e sai. P40: o tratado, o refém que mora anos lá (gov §5.6) | **a ala dos hóspedes**: quartos com cama, arca e mesa, perto mas fora da ala privada; **a sala de espera** (o vestíbulo e os bancos, que já existem); onde se dão os presentes (inferência) |
| **O povo na audiência**: a viúva, o mercador, o camponês roubado, o estrangeiro (gov §9.1) | hoje: as marcas «audiencia» diante do trono. P23, P40: os pedidos que viram missão | **a fila**: do portão ao pátio, depois à sala de audiência, depois ao trono; o **arauto** («Silêncio! Fala o rei!», gov §20) com o seu lugar ao lado do estrado; os guardas que controlam a porta |
| **O banquete** (o dono; gov §9.5; coz §10: «quem governa mostra o poder pela mesa: os pratos raros, **a ordem dos lugares**, o provador — e o veneno») | hoje: **o palácio de 24 m não tem sala de banquete**; o grande tem uma de 5,0 × 5,8 m e o colossal uma de 6,0 × 3,9 m, com duas mesas e bancos (C-19). P27 (a mesa), P40 | **o salão do banquete com a mesa gigante**, pela maneira de cada povo (C-6):<br>• **o romano:** os leitos de banquete em três lados, o triclínio — «o banquete deitado» (coz §6.1);<br>• **o grego:** a sala do banquete com os leitos e as mesinhas (tav §9: «o banquete é em casa»);<br>• **o nórdico:** as mesas compridas com os bancos ao longo do fogo comprido do salão do jarl;<br>• **o egípcio:** as cadeiras dos nobres, as mesinhas, as esteiras e os músicos;<br>• **o asteca:** os petates, os assentos baixos e o cacau dos nobres (coz §6.1).<br>Com o lugar de honra, o caminho dos criados entre os convivas e o estrado dos músicos. Proposta: **24 a 40 convivas** no palácio de 24 m — no salão do trono, com as mesas de cavalete armadas para a festa, como no salão do norte (inferência) —, 40 a 60 no grande, 60 a 100 no colossal, numa sala de banquete de verdade (as alas de 5 a 6 m de largura pedem salas juntadas) |
| **O tesouro** (gov §5.2: «o tesouro é o livro»; §19, a mochila: «as chaves do tesouro»; o cargo do tesoureiro) | hoje **só o colossal** tem a sala do tesouro (6,0 × 5,1 m, dois cofres e uma arca), **e nada a liga ao tesouro do povo** (C-3) | a sala do tesouro trancada, **com a chave** (quem a tem é uma escolha do mundo) e com um guarda; os cofres com o que o tesouro tem de verdade — e para isso o tesouro precisa ser um lugar do livro |
| **A justiça no palácio** (gov §5.5: o nobre acusado, o crime contra o templo, a traição; juiz §9) | hoje: a sentença sai pelo regime e vai ao cadafalso. P34, P40 | o salão do trono serve de tribunal: o lugar do acusado, o da testemunha, a mesa do escrivão. **Uma cela de espera** para o preso trazido do cárcere (inferência) |
| **O que se mostra** | — | **a coleção do palácio** (arq §14), a máscara do rei antigo (arq §17), as peles e os chifres «do palácio» (caç, as marcas), **a estátua com o rosto** (marc §9; gov §15b), o mapa na parede (sab), as tapeçarias, os mosaicos e as colunas (int2 §6) — cada coisa com a sua causa |

**A estrutura.**
- **Os cômodos:**
  - **do Estado:** o pátio de honra, o vestíbulo, a sala de audiência, o salão do trono, a sala do conselho, a antecâmara e o
    gabinete;
  - **da corte:** o salão do banquete, a ala dos hóspedes e a varanda;
  - **do serviço:** a cozinha, a copa, a despensa, a adega, o tesouro, o corpo da guarda, o alojamento do pessoal e o corredor de
    serviço;
  - **privados:** os aposentos da família e o oratório.
- **A circulação:**
  - a zona pública vai do portão ao salão do trono, pelo eixo de Estado, que já fica livre;
  - a zona da corte tem uma porta só para a zona privada;
  - o serviço corre por fora do eixo;
  - a cozinha chega ao banquete pela copa, sem passar pelo salão do trono.
- **As portas guardadas:**
  - o portão, com dois guardas (já existe);
  - a porta do salão do trono e a do conselho, guardadas pelo chefe da guarda;
  - o tesouro, com a chave e um guarda;
  - a ala privada, guardada pelo camareiro;
  - a passagem do provador.
  - Tudo trancado de noite (`lockNight` já é 1).
- **A capacidade** (proposta, no palácio de 24 m): a família com 10 camas (hoje); o pessoal com 8 a 16 camas; o conselho com 10 a 12
  lugares (16 a 20 com a sala alargada); o banquete com 24 a 40 convivas no salão do trono; a audiência com 20 a 40 de pé.

**⚠ e ◻.**
- **C-1 (quem mora).** A sede é a casa de quem governa (D-205 a D-207): quem não é da família sai (`K.ofCourt`), só o `act-casa.js`
  decide (regra 72), e a sede não pode entrar nas portas da casa da cidade (`BDEF.housing`). Os burocratas morando lá pedem:
  - um campo novo de camas «do pessoal», que não seja `aposentos` nem `housing`;
  - uma regra nova no `K.reign` para «quem serve na sede mora nela»;
  - o cuidado do L-974 (o par e os pequenos de quem entra).
- **C-2 (a mesa).** A mesa do conselho de hoje é a peça do porto. Falta a peça grande, com os seus lugares (a cabeceira, os lados) e o
  modelo de cada povo (o `G.Movel3D`).
- **C-4 (o conselho vazio).** O conselho, a corte, o banquete do rei e o provador só ganham vida no P40, e o grupo no P24.
  - Até lá, a sala do conselho fica vazia, e pela regra magna a mesa não mostra papéis sem causa.
  - Proposta (inferência): a reunião que as decisões de hoje já têm (`Po.decide`: o imposto, a guerra, o pão) acontecer na sala, com
    quem governa e os escribas, antes do P40.
- **C-6 (o banquete deitado).** O romano e o grego comem reclinados: pedem um lugar novo de uso (reclinar), a pose dele e a peça
  (o leito de banquete).
- **C-19 (o banquete sem sala).** A forma de 24 m não tem sala de banquete, e as do grande e do colossal têm de 23 a 29 m² — duas
  mesas. O banquete grande que o dono quer não cabe em sala nenhuma de hoje: ou o salão do trono vira o salão da festa (o salão do
  norte sempre foi os dois), ou a forma ganha a sala.
- **C-3 (o tesouro sem lugar).** Ver o §15.
- **C-8 (o trono sobre o estrado).** O estrado pede degraus que o corpo sobe sem pulo (a regra do degrau, `Space.entryFits`/`BODY`).
- **L-2 (a varanda).** Nenhuma forma de palácio tem varanda virada para a praça. O discurso do povo já é na praça mais velha
  (`Po.forum`).
- **O palácio antigo de 12 m** (legado) não tem lugar para o conselho e o banquete grande. Ou ele fica como está, como «casa do chefe
  grande», ou a cidade o refaz no degrau novo.

### 3.2 Grande palácio (`grande_palacio`)

**Hoje.** 16 m o antigo e **32 m** o degrau novo; 14 aposentos. A forma: «as alas mais largas, de três salas de cada lado, as salas de
audiência e do conselho abertas para o pátio» (`forma-poder.js`). O BDESC diz: «alas, pátio com fonte e jardins». As salas medidas estão
na tabela do §3.1: o conselho de 7,4 × 9,4 m, o banquete de 5,0 × 5,8 m, nenhum tesouro.

**Tudo o que vale para o palácio (§3.1), com mais espaço.** O que muda:

| Quem | O que faz | Do que precisa a mais |
|---|---|---|
| quem governa um reino grande ou um império (P40) | o império do tributo, os governadores das cidades, os reféns de vários povos (gov §5.6, §18) | **a sala de audiência à parte** (já existe), com a fila longa; **dois banquetes** (o do Estado e o da família, inferência); a ala dos hóspedes para três ou quatro embaixadas |
| a corte grande | os cortesãos, os bajuladores (gov §7) | os quartos dos cortesãos; **a galeria** onde a corte anda e cochicha (inferência: o lugar da intriga) |
| os jardins (BDESC) | «a caçada» de quem governa, nos jardins e na terra do rei (gov §9.5; caç §10: «a caça do rei») | o jardim com caminho, bancos e fonte. A caça mesmo fica fora, na terra reservada |
| **Capacidade** (proposta) | — | a família 14; o pessoal 14 a 24; o conselho 16 a 20; o banquete 40 a 60 (numa sala que hoje não existe: C-19) |

### 3.3 Palácio colossal (`palacio_colossal`)

**Hoje.** 20 m o antigo e **40 m** o degrau novo; 18 aposentos. O BDESC: «o maior palácio do mundo»; o `court.js`: «fontes e avenida de
estátuas». A forma fecha o pátio com a ala da frente e põe diante dela o pórtico e **o pátio de honra** no pódio, com a balaustrada, as
estátuas e o portão (as duas cortes).

**Como o grande palácio, e mais:**
- a avenida das estátuas: **a estátua com o rosto** de quem governa e de quem governou (marc §9), com o nome raspado quando o sucessor
  apaga o antecessor (gov §15b, «a memória condenada»);
- **o salão do trono para cem pessoas na audiência** (proposta);
- **o banquete de 60 a 100 convivas** (proposta);
- **a vaidade à vista**, com causa: o ouro, a púrpura, as fontes (`Co.vanity`).

**⚠ C-9.** O colossal «tira metade dos construtores» e leva anos. O que ele tem por dentro tem de valer o custo, senão é um galpão de
40 m — a crítica de 3% do chão ocupado (int2 §2.1).

### 3.4 Casa do chefe / Paço (`paco`)

**Hoje.**
- **O lote:** 8 m (o paço) ou 12 m (o paço grande, que pede a vila de 60 pessoas); 6 aposentos.
- **A planta** (`hallFurnish` e `forma.paco`): o assento do chefe contra a parede do fundo, os bancos dos que ele recebe, o fogo, a
  mesa das festas, a arca e as camas da casa. Medido: no paço de 8 m (a forma romana) **tudo fica num salão de 5,2 × 4,2 m** — o
  assento, dois lampadários, o braseiro, quatro bancos, a mesa, a arca **e a cama de casal**; no paço grande de 12 m, num salão de
  11 × 11 m.
- **Os nomes de cada povo:** a Casa do Basileu, a Domus do Magistrado, a Casa do Nomarca, a Casa do Tlatoani, o Salão do Chefe.
- **A regra da sede:** só a sede da **capital** (`Co.seatOf`) é morada. **Um paço de outra cidade fica vazio**: a regra tira de lá
  quem estiver dentro (`K.reign`).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o chefe** (a tribo, a chefia; P40) | recebe sentado no assento, a audiência (já existe), a festa | o assento do chefe sobre um estrado baixo; **o fogo no meio**, onde o povo o tem (o lar do norte já existe) |
| **o escaldo, o bardo** | «o escaldo no salão do chefe — a sátira de um poeta podia desonrar um rei» (bardo §2); «Bardo: o salão do chefe, a festa» (bardo §14) | o lugar de quem canta junto ao fogo, de frente para o assento (inferência: o estrado do músico da taverna serve) |
| **o conselho do chefe** (gov §4: a chefia, com os nobres e os costumes) | a conversa no fogo (inferência) | **os bancos em roda do fogo, com lugar para 8 a 12** (proposta); a mesa das festas, que já existe |
| **a assembleia do norte** (gov §18: «o chefe e a assembleia dos homens livres»; juiz §2: «o que recitava a lei de cor») | o juramento, a lei recitada | a assembleia é ao ar livre: a praça nórdica é o «Thing» (`civs.js`). O paço só a recebe quando chove (inferência) |
| **o governador da cidade** (gov §5.4: «o governador de cada cidade»; §21: «o rei pequeno») | hoje **não existe** | **◻ L-3:** nenhuma regra diz quem senta no paço de uma cidade que não é a capital. O paço é o lugar natural do governador, mas a regra da sede (C-1) o deixa vazio |
| **a família do chefe** | mora (6 camas) | as camas num cômodo separado do salão, e não contra a parede do salão como hoje (int2 §2.1: «a cama de casal na sala do trono») |

**A estrutura.** O salão (público) e os quartos (privados), separados por uma porta. Proposta: um depósito para o tributo (num povo sem
moeda, os coletores levam ao chefe o que as casas têm: o `court.js`), uma cozinha à parte no paço grande e um banco de guarda à porta.

### 3.5 Administração (`administracao`)

**Hoje.**
- **O lote:** 8 m, e o **paço municipal** de 16 m (cidade de 150 pessoas).
- **Os postos:** 2 escribas (`escriba`), que «contam gente, grãos e impostos» — o afazer `desk`. O corpo, se é o escriba de lá, pode
  «escrever os registros» (`act-servicos.js`).
- **Sem planta:** só a forma de fora (int2 §2.1: «a mina, a administração e a coletoria são só a forma de fora»).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o escriba** (o copista, o cronista, o taquígrafo, o tradutor; P38) | hoje anota «os grãos, as gentes e os impostos». P38 | **a sala dos escribas**: as mesas com a luz da janela, a tinta e o cálamo, as estantes de tabuinhas e rolos; **o arquivo** (o livro do reino, as listas: gov §8, §19) |
| **o censor** (o cargo) e **os recenseadores** (a função; sab §14b) | P-Sa e P38: organizar o censo, guardar as listas, **conferir a conta de cada um no fim do dia** | **a sala do censor** com o arquivo das listas trancado; a mesa da conferência; o lugar onde os recenseadores entregam a conta (inferência: um balcão). A mesa do censo da praça (sab §14b) leva daqui as tabuinhas |
| **o fiscal** (fisc §13: «o livro dos casos entregue ao chefe»; §16: o chefe do mercado e da alfândega) | P34: entregar os casos, a conferência dos outros | a mesa do chefe, o arquivo dos casos e **o livro dos truques** (fisc §17) |
| **o tesoureiro** (o cargo; gov §5.4) | P40 | (pode ser no palácio; aqui, só se a cidade não for a capital, inferência) |
| **o medidor dos campos** (a função; sab §14b) | medir as divisas depois da cheia | a mesa grande dos mapas dos campos, a corda de doze nós pendurada (sab era IV), a groma |
| **o juiz e o escrivão** (juiz §9, §20) | P34 | **o paço municipal de 16 m pode ser o tribunal da cidade** (inferência), ver o §14 |
| **o governador** (gov §5.4) | P40 | o paço municipal como sede do governador, se a regra da sede não o pegar (L-3) |

**A estrutura** (proposta): o átrio público com o balcão, onde se declara, se paga e se pergunta; a sala dos escribas, de serviço; o
arquivo e a sala do chefe, privados e trancados. No paço municipal: a sala de audiência da cidade e o tribunal.

**◻ L-4.** Não tem planta. **⚠ C-10.** Com 8 m, o átrio, a sala dos escribas e o arquivo cabem com dificuldade. O tribunal e o censo
pedem o paço municipal (16 m).

### 3.6 Coletoria (`coletoria`)

**Hoje.**
- **O lote:** **4 m** (1 × 1), sem degrau.
- **Os postos:** 3 cobradores (`cobrador`). Batem de porta em porta e levam o imposto ao tesouro pelo livro («imposto»), e cunham a
  moeda ali: 1 onça de ouro dá 6 moedas (`cunhagem`). O corpo faz as duas coisas.
- **O nome:** num povo sem moeda, é a «Casa do Tributo». **Sem planta.**

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o cobrador** (o fiscal da cobrança; fisc §7) | hoje cobra a conta exata. P34: **a casa declara**; a cobrança da colheita, **medida na eira**; a escolta; a revolta | o balcão onde se paga, **a balança e os pesos** (sab era II), a arca da coleta trancada; o lugar onde a escolta espera |
| **quem cunha / o ensaiador** (fisc §24: «o ensaiador da moeda — na casa da moeda, a pedra de toque e a balança fina») | hoje cunha. P34 | **◻ L-5, a casa da moeda**: o forno de fundir, o cunho e a bigorna, a balança fina, a pedra de toque, o cofre do ouro e o cofre das moedas (marc §3: «a moeda com o rosto — a casa da moeda de quem governa»; gov §15b) |
| **o falsificador e o ladrão** (fisc §5; a lenda do tesouro roubado, fisc §18) | P34: o outro lado | o cofre, a porta forte e a guarda da noite. A coletoria **já é posto de guarda** (`E.guardTask`) |

**⚠ C-11.** Num lote de 4 m não cabem o balcão, a casa da moeda e o cofre. É preciso **um degrau maior**, ou separar a casa da moeda.

---

## 4. A lei, a guarda e a guerra

### 4.1 Cadeia (`cadeia`) — o pedido do dono

**Hoje.**
- **O lote:** **8 m**, sem degrau. O mundo prende até **4** (`BDEF.cells`); a planta faz **de 4 a 6 celas**, de 1,6 × 3,3 m a
  2,8 × 2,4 m (a conta em Node, `B-trab/celas.js`).
- **O posto:** 1 carcereiro. De noite, ele guarda a porta (o afazer `guard` do prédio). Sem ele, um preso corajoso pode fugir
  (`crime.js`).
- **Quem traz o preso:** o vigia (`vigia`), que anda a ronda da noite com a tocha. Os soldados e o carcereiro também respondem ao
  furto que veem.
- **A verdade do preso:** `v.jail`, que só o `crime.js` escreve. O afazer da cela é `cela` (prioridade 5,3). Só um tumulto o tira de
  lá, e isso é fuga (`G.Crime.keeps`).
- **A pena pelo regime** (`Cr.sentence`): os anciãos mandam devolver, o tirano dá três anos, a democracia um, a teocracia dois «e
  penitência no templo».
- **A planta** (`jailFurnish`):
  - em cada cela, a palha e um balde, atrás da grade (`cellDoor: 'grade'`);
  - a mesa do carcereiro, o quadro das chaves na parede e um banco;
  - **as três famílias:** o corredor (6 celas, e a mesa do carcereiro no próprio corredor, sem sala), o corpo da guarda com as celas
    (4 celas, a sala da guarda e a passagem) e o pátio (4 celas em volta dele, o salão do fundo).
  - Nenhuma tem a cela comum, a de espera, a visita ou a cama do carcereiro.
- **A auditoria:** nota 2,5.
- **⚠ Há mais duas prisões fora da cadeia:** quem espera a sentença de quem governa (o afazer `jail` do `justice.js`) fica de pé ao relento
  diante do quartel ou do cercado (`holdSpot`); o cativo de guerra dorme no cercado. Ver o §4.4.

| Quem | O que faz (hoje → o patch dele) | Do que precisa |
|---|---|---|
| **o preso** (a condição «cativo e preso», P34; ofi §6) | hoje fica parado na cela, até a pena acabar, ou foge. P34 — **o plano do preso não tem documento**. Os planos dizem: a cela pelos anos da lei (juiz §6); **a cela de espera** antes da sentença (juiz §5: «levem-no»); o trabalho forçado — a mina, a galé (juiz §6); **o que se dá ao preso** («a da cela», coz §10); **a fuga** com as peças — o prego, a chave, a lima — e o guarda comprado (o molde da galé, gale §8; inferência para a cela); a fiança (eco §6); «o preso que sai e vira contrabandista» (ofi §6, as passagens) | **as celas de vários tamanhos:**<br>• **a cela comum**, com o banco de pedra e as argolas na parede (proposta: 6 a 10);<br>• **as celas pequenas**, para 1 ou 2;<br>• **a solitária** (inferência);<br>• **a cela de espera** do julgamento, perto da saída para o tribunal.<br>Em cada uma: a palha ou o catre, o balde, a janelinha alta (a luz com causa) e o lugar de comer. **A grade de visita**, por onde a família dá a comida e fala (inferência; coz §10). **O pátio murado** do sol e da reunião dos que vão ao trabalho forçado (inferência). **Os esconderijos** da fuga: a fenda, a pedra solta (o molde do banco da galé, gale §8) |
| **o carcereiro** (o guarda inclui o carcereiro; ofi §6) | hoje: a mesa, a porta à noite, as chaves. P? (o guarda não tem patch) | **o corpo da guarda** à entrada (já existe): a mesa, **o livro dos presos** (quem, por quê, até quando), **o quadro das chaves** (já existe), **a cama da noite** (quem guarda de noite também dorme no turno: proposta, 1 ou 2 catres); **a despensa da ração**; o armeiro com o porrete, a lança, **os grilhões e as cordas** (o kit já tem «os grilhões de quem é levado amarrado», do ferro e da corda que o povo teve: CL D-612) |
| **o guarda — o «delegado» e o «policial» do dono** (o guarda: o carcereiro, o guarda-costas, os vigias do fogo; ofi §6) | hoje: o `vigia` anda a ronda (`Cr.roundOf`), ouve as testemunhas, procura o ladrão e leva-o às celas — **sem prédio**. Depois: a investigação é «a mesma perícia do guarda e do caçador de recompensas» (juiz §22); «achamos a bolsa debaixo da cama dele» (juiz §19); «o guarda traz a faca, achada no beco» (juiz §1); revistar a casa; a ronda; a batida na taverna (tav §7) | **◻ L-1, o posto da guarda** (dentro da cadeia num degrau maior, ou num prédio próprio, ver o §14):<br>• **a sala do chefe da guarda** (o cargo, gov §5.4), com a mesa, o livro das ocorrências (o registro do crime, `S.crimes`, como coisa do mundo) e **o quadro da ronda** (quem anda esta noite e por onde);<br>• **a arca das provas**, trancada: a faca, a bolsa — um lugar do livro;<br>• **a tábua das recompensas** (os procurados);<br>• **o relógio de água** das horas da noite (sab era IV: «a ronda da vigia»);<br>• as tochas da ronda;<br>• **a sala de ouvir o preso e a testemunha** (juiz §5) |
| **o caçador de recompensas** (o rastreador de fugitivos; ofi §6) | P? (sem patch) | **a tábua das recompensas** à vista, na porta do posto (inferência; eco §2: «a recompensa: a cabeça da fera que come gente, o fugitivo, o pirata»; pir §17); o balcão onde se entrega o preso e se recebe pelo livro |
| **o juiz** (P34) | ouvir, confrontar, mostrar a prova, «tragam a testemunha», «levem-no» (juiz §5, §19) | não julga na cadeia (juiz §9: a porta da cidade, o fórum, o palácio, o templo, a assembleia). Mas precisa **da cela de espera** e **do caminho guardado** da cadeia ao tribunal |
| **o carrasco** (P34) | «tragam o condenado» (carr §18); o açoite medido, a exposição na praça (carr §4) | a cela dos condenados à morte, perto da saída (inferência); o lugar do açoite: um poste no pátio, ou o pelourinho da praça (◻ L-9) |
| **a família do preso** | «a bolsa da família», a visita, o resgate (carr §6) | a grade de visita, e um banco do lado de fora (inferência) |
| **o vigia da quarentena e os vigias do fogo** (sab §14b) | — | (são da estação dos vigias, ver o §14) |

**A estrutura** (proposta).
- **A zona pública** fica fora, à porta: a família e quem entrega um preso.
- **A zona de serviço** é o corpo da guarda, com a mesa, as chaves, o armeiro e os catres da noite. A sala de ouvir fica junto dela.
- **A zona dos presos** tem o corredor das celas atrás de uma **segunda porta trancada**, a cela comum, as celas pequenas, a de espera e
  o pátio.
- **As portas guardadas:** a de fora, trancada de noite (já existe); a de dentro, sempre trancada, com a chave no quadro; cada grade.
- **A capacidade** (proposta), por degrau: 8 m com 4 a 6 celas e 4 presos (hoje); 12 m com 8 a 12 presos e o posto; 16 m com 16 a 24
  presos, o posto, o pátio e a sala de ouvir.

**⚠ e ◻.**
- **C-5 (o lote).** A cadeia não tem escada de degraus (`G.Escala`). O que o dono pede cabe a partir de 12 m. Um degrau novo muda:
  - o planejador (`Escala.choose`, o `E.plan` do `crime.js`);
  - o `BDEF.cells`, que hoje é um número só;
  - os mundos prontos, e as provas da cadeia (`ladrao-bairro`, `sociedade`).
- **C-14 (três prisões).** O preso da lei (`v.jail`, na cadeia), quem espera a sentença de quem governa (o afazer `jail` do
  `justice.js`, ao relento diante do quartel ou do cercado) e o cativo de guerra (que dorme no cercado) são três sistemas. A cadeia nova
  pode guardar os três, cada um com a sua regra. É uma decisão.
- **C-15 (a pena e o calendário).** A pena é contada em dias de ano («dois anos de cela»). Com o ano de quatro dias (cal §5), o
  tempo do preso dentro da cela muda de tamanho. A planta precisa aguentar estadas longas: comer, dormir, a visita.
- **L-1 (o guarda sem patch e sem documento).** O pedido do dono depende de um ofício que o roteiro não põe em patch nenhum.
- **(Inferência, cuidado com o tema.)** Onde a lei arrancava a confissão pela dor, o plano do carrasco manda mostrar «que isso existiu e
  o que causa — o inocente que confessa qualquer coisa —, sem fazer disso um jogo» (carr §17). A sala de ouvir é um cômodo de
  perguntas, não de suplício.

### 4.2 Quartel (`quartel`)

**Hoje.**
- **O lote:** 8 m, sem degrau.
- **O que dá ao povo:** «armas e treino: guerreiros mais fortes» (`war.js`: +4% de soldados; `politics.js`: o poder ×1,15).
- **O que o mundo faz nele:**
  - **o treino é à porta**, em fileiras (`runDrill`, `G.Life.rowSpot`), e o corpo pode «treinar com os soldados diante do quartel»;
  - o quartel é posto de guarda (`E.guardTask`);
  - quem espera a sentença de quem governa fica preso, de pé, diante dele (`holdSpot`, `justice.js`).
- **A planta** (`barracksFurnish`): de 4 a 6 catres, de 1 a 2 armeiros, de 1 a 2 postes de treino, a mesa e o banco, a mesa do
  escriba, a arca. Medido: na família do salão, **tudo num salão de 7 × 7 m** — os seis catres, os dois armeiros, os dois postes, a
  mesa e a arca.
- **Os nomes de cada povo:** o Ginásio Militar, o Salão dos Guerreiros, o Quartel do Faraó, a Casa dos Guerreiros, o Castro.
- **A auditoria:** nota 2,5.
- **Nenhum plano de ofício cita o quartel por nome** (a busca em `planos/`).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o soldado** (o arqueiro, o fundeiro, o escalador de muralhas, o besteiro, o artilheiro; P33) | hoje: o treino à porta, a guarda dos postos, o bando, a hoste. P33: o combate profundo, as armas de cada jeito (ofi §6); **o soldo no fim do dia** (eco §2); **o soldado sem soldo**, que é o começo do golpe (gov §5.2) | **o pátio de treino**: os postes, **a estante das armas de madeira**, os alvos do arqueiro e do fundeiro (inferência), **o muro de treino de escalar** (escalada: «o muro do cerco»); **o dormitório** (os catres já existem: proposta, 8 a 16); o refeitório (a ração do exército, coz §10: «a do exército»); **o armeiro** com as armas de verdade do povo (`O.forged`: o bronze só de cobre e estanho); **a mesa do soldo** (inferência) |
| **o comandante** (o general é título; P33, P40) | «a tenda de guerra com o mapa», «apontar no mapa de guerra» (gov §19, §20); o grupo de grupos (grp §6) | **a sala do comando**, com a mesa do mapa e a arca das ordens (inferência). Os oficiais com os seus quartos |
| **o guarda** (o guarda-costas, os vigias do fogo) | ver o §4.1 | o turno: quem sai e quem entra — o relógio de água, o quadro do turno (inferência) |
| **o mercenário, o cavaleiro** (P33) | o contrato; o cavalo | o estábulo ao lado (o `economy.js` já pede o estábulo onde há quartel e roda); a sala de contratar (inferência) |
| **o gladiador** | **◻ a escola de gladiadores não existe**: o B da auditoria propôs o quartel, com os postes e o armeiro, como base dela (int2 §2.1; B §2) | ver o §14 |
| **quem espera a sentença** (o afazer `jail` do `justice.js`) | hoje, de pé ao relento diante da porta | a cela de espera, aqui ou na cadeia (C-14) |

**A estrutura.** Zona pública: o pátio de treino, que dá para a rua e onde a cidade vê. Zona de serviço: o armeiro (trancado), o
refeitório e a cozinha. Zona privada: o dormitório e os quartos dos oficiais. Portas guardadas: o armeiro e a sala do comando.

**⚠ C-16.** Com 8 m, sem degrau, não cabem o pátio, o dormitório e o refeitório de um exército de verdade. Os ofícios da luta (P33)
pedem a escada, ou o pátio a céu aberto como um anexo.

### 4.3 Torre de vigia (`torre`)

**Hoje.** 4 m, forma em seis povos, **sem planta**. Os arqueiros vigiam e atiram nos invasores. O posto de guarda é «de vigia no alto da
torre» (`E.guardTask`, `tower: 1`, `b.manned`).

| Quem | O que faz | Do que precisa |
|---|---|---|
| o arqueiro, o vigia (P33) | atirar; vigiar | **a escada até o alto** (o corpo sobe: a escalada não é preciso, a escada sim), a plataforma com a mureta, a arca das flechas |
| **o vigia do pirata e do fogo de alarme** | «o fogo de alarme corre de torre em torre» (pir §11); os sinais de espelho e de fumaça (pir §8.3) | **o braseiro do alarme** no alto, com a lenha (o fogo tem causa); o espelho |
| **o faroleiro** (nav §15; sab era V: «a torre com o fogo no alto») | — | ◻ L-6: o farol é outro prédio, ver o §14 |
| **o astrônomo** (sab §8: «o observatório… a torre — o céu precisa de altura e de horizonte») | P38 | o alto da torre como observatório (inferência) |

**◻ L-7.** A torre não tem planta, e o corpo não sobe nela.

### 4.4 Cercado (`cercado`)

**Hoje.** 8 m, aberto, **sem planta**. «Paliçada onde os cativos são mantidos à noite. Fugir fica mais difícil.» O cativo dorme nele
(`runSleep`, `Wr.penOf`), e o cercado baixa a chance de fuga. Quem espera a sentença de quem governa fica preso diante
dele, ou do quartel (`holdSpot`, `justice.js`).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o cativo de guerra, o escravo da mina** (as condições; P36) | hoje dorme no chão, ao relento | o telheiro, a palha, a água (inferência) — quem dorme ali dorme na chuva |
| **o feitor** (o capataz da mina e do campo; cap §2, C5) | P36: a ordem, a revista, «contar os homens tocando a cabeça de cada um» (cap, as animações) | **o portão trancado e o posto do feitor** com o banco e a tocha; os postes das correntes (inferência; cap §4: «a corrente curta») |
| **o condenado à espera** (`justice.js`) | — | ver C-14 |

**⚠ C-14.** O «preso» vive em três lugares: a cadeia da lei, a espera da sentença diante do quartel ou do cercado, e o cercado da guerra. **◻ L-7b.** O cercado não tem planta: a noite
dos cativos não tem chão, telhado nem guarda.

---

## 5. O porto e o mar

### 5.1 Doca (`doca`) — o pedido do dono

**Hoje.**
- **O lote:** 8 m, sem degrau. **Sem planta e sem forma** (a `arch.js` e o 3D a desenham à parte: as estacas do cais entram no mar).
- **Os postos:** 12 pescadores (`fishers.js`). O dia do pescador do mundo passa por ela: «passa pelo galpão para pegar a rede, desce ao
  cais, embarca… atraca, pisa o cais, o peixe é posto nas caixas, carrega uma caixa até o armazém».
- **O estaleiro:** também é dela — «o casco sobe na carreira, costela por costela, tábua por tábua, com os carpinteiros batendo».
- **O cais:** guarda as caixas (`d.crates`). A descarga do mercante é uma operação (`act-porto.js`).
- **Os marinheiros** «cuidam do cordame à beira d'água» (`harbor.js`). O chamado ao cais não tira ninguém da cama, e o soldo é pago no
  cais (CL, `crewFor` / `crewHome`).
- **A auditoria:** «a doca não tem planta» (int2 §2.1).

| Quem | O que faz (hoje → o patch dele) | Do que precisa |
|---|---|---|
| **o marinheiro** (o barqueiro, o canoeiro; o capitão é título; P35, sem documento) | hoje: 2 por rota, chamados ao cais quando o navio está carregado, pagos no cais. P35 (N2, N3): o navio por dentro; **engajar-se** (navios §2.5: «o corpo pode… se engajar como marinheiro»); as funções a bordo — o capitão, o piloto, o marinheiro, o remador, o cozinheiro, o carpinteiro, o passageiro (navios §2.6) | **o cais** com os cabeços de amarra e as escadas da água; **o lugar do cordame**: as cordas em rolo, a vela dobrada, o remo de sobra (inferência; a «Redes e cestos» já existe); **o lugar onde a tripulação se reúne antes de embarcar** e recebe o soldo; **a mesa do mestre** que engaja (inferência) |
| **o itinerário dos navios** (navios §2.5, N3) | P35: «a tábua dos navios (no cais, como uma coisa do mundo): que navio sai, para onde, a que hora, quanto custa a passagem, que navio chegou e de onde»; comprar a passagem, engajar-se, **entrar escondido** | **◻ L-8, a capitania do porto**: **a tábua dos navios** (a peça pintada que se lê, e muda com o mundo), **o balcão das passagens** e o livro dos navios. **A sala de espera dos passageiros** (inferência), com os bancos e as bagagens |
| **o estivador** (o guindasteiro; P35; estiv) | hoje: carrega as caixas do cais para o armazém. P35: **a chamada da manhã** («antes do sol, quem quer trabalho espera no cais; o capataz da estiva escolhe», estiv §3); **a prancha que balança** (§4.2); **o guindaste de roda**, com homens andando dentro dela (§4.4; sab era IV e VI); a contagem com o escriba (§4.5); o porão; a greve (§9) | **a praça da chamada no cais**: o lugar onde a turma espera e o lugar do capataz da estiva; **a prancha** (a peça que liga o cais e o navio); **o guindaste de roda** (só onde o povo tem a polia composta: sab era IV); o estrado de carga e a mesa de conferência, que já existem no armazém; **a tábua dos turnos** (inferência) |
| **o pescador** (P25, P26, P36; pesca) | hoje: 12 postos, a rede, o barco. P26: os barcos pequenos (N1); **«consertar a rede sentado»** (pesca, as animações); a confraria do porto, que dá a rede de arrasto (pesca §9); **a tábua dos recordes do cais** (pesca, as interações; fund §2.6) | **o galpão das redes** (as «Redes e cestos» com o posto «remendar» já existem), **os varais de secar as redes** (`fishers.js`: «nets drying on poles»); **a rampa dos barcos** pequenos (a canoa, o barco); **a tábua dos recordes do cais**; o lugar da venda do peixe na volta (pesca §11: «Sardinha de três dias?») |
| **o construtor naval** (o estaleiro, o casco; sem patch; ofi §6) | hoje: a carreira do `fishers.js`. Depois: a quilha (sab era III: «o casco grande com a quilha no estaleiro»), o casco de esqueleto (era V: «as costelas do navio de pé no estaleiro»); **virar o casco na praia** (pir §7) | **◻ L-8b, o estaleiro**: a carreira, inclinada para a água; o telheiro das madeiras; a bancada do carpinteiro naval; as pilhas de tábuas e de costelas. Só nas cidades de navio |
| **o navegador e o piloto do porto** (nav §7.10, §18) | «entrar no porto: o canal entre os baixios, as marcas da terra, a maré — o trabalho do piloto do porto» | o lugar do piloto na capitania (a tábua das marés, inferência); **◻ L-6, o farol** (nav §15: «a marca da costa que guia de noite»; o faroleiro) |
| **o fiscal da alfândega** (P35; fisc §6) | P35: «a casa da alfândega no cais»; o manifesto; olhar o casco — **a linha d'água**; descer ao porão com a lamparina e a vara; **a ronda da praia** à noite; a apreensão vai ao armazém do povo pelo livro | **◻ L-10, a alfândega**: a casa no cais com **o balcão do manifesto**, **a balança**, a vara de sondar, a lamparina, **o depósito da apreensão** (um lugar do livro), **o livro da alfândega** (fisc §23: uma marca que o arqueólogo acha séculos depois) e **a fila** dos capitães (fisc §22: «a fila da alfândega») |
| **o remador de galé, o galeote, o capataz da galé** (P35, P36) | «a noite no porto: a terra perto; os guardas do cais»; «a festa no porto: os guardas bebem» (gale §8); a lima que se compra a um pescador do porto (gale §8) | **a galé atracada**, com os galeotes acorrentados a bordo (o navio, N2); **o posto dos guardas do cais** (◻ L-1) |
| **o pirata** (P36; pir) | «roubar um navio de noite no porto» (pir §18); a informação: **a tábua dos navios do porto**, «o funcionário do porto comprado» (pir §8.1); o porto que não pergunta (§12) | a tábua (L-8); **a vigia da noite no cais e a bordo** — o navio atracado com o vigia, ou sem ele (inferência: o que o pirata lê); a escuridão do cais (a luz com causa, com tochas só onde há gente de guarda) |
| **o contrabandista** (P34; fisc §6) | «a carga desembarcada antes, numa praia à noite»; o bote sem luz; «a caixa que não se conta» (estiv §9) | a praia escura e a ronda da praia (fisc §6). No cais, os cantos fora da luz (inferência) |
| **o clandestino** (navios §2.5; estiv §9: «o clandestino achado numa caixa») | entrar escondido | as caixas no cais (já existem) e o porão do navio |
| **o mercado de gente** (pir §13: «o cativo sem resgate vai para o mercado de gente»; gale §1) | P36 | ◻ L-11: nenhum lugar. Os planos pedem que se mostre «esse peso», sem enfeite (pir §31). É uma decisão do dono se ele vira lugar |
| **a quarentena e a procissão** (estiv §9: «o navio da peste (a quarentena)», «a estátua do deus para o templo — a procissão do cais»; sab §14b: o vigia da quarentena) | — | o cais isolado, com o vigia na prancha (inferência) |
| **as estações** (cal §3: «na Antiguidade não se navegava no inverno»; pir §7) | o inverno: o porto quieto, a fome do estivador (estiv §7) | **o galpão dos barcos** para o inverno, ou o navio puxado para a terra (inferência); o cais vazio |

**A estrutura.**
- **A zona pública** é o cais: a chamada, a tábua dos navios, a fila da alfândega, a venda do peixe, os passageiros.
- **A zona de serviço:** o galpão das redes, o estaleiro, o guindaste, o lugar do cordame.
- **A zona guardada:** a alfândega (o depósito da apreensão, trancado), a capitania (o livro e o dinheiro das passagens) e o posto dos
  guardas do cais.
- **A noite:** o cais com a vigia, ou sem ela (a escolha do mundo, que o pirata e o contrabandista leem).
- **A capacidade** (proposta): a chamada com 20 a 40 de pé; os 12 postos de pescador de hoje; uma ou duas carreiras de estaleiro.

**⚠ C-7.** O porto inteiro numa doca de 8 m: o cais, os 12 pescadores, o galpão, o estaleiro — e agora a capitania, a alfândega, o
guindaste e a chamada. Não cabe. As saídas:
- **(a)** uma escada de degraus para a doca: o cais de 8 m, o porto de 12 a 16 m com a capitania;
- **(b)** tipos novos que o planejador põe junto da doca, como já faz com o armazém do porto (`Hb.plan`): a alfândega, o estaleiro e o
  farol.
- Nos dois casos, o planejador muda, e os mundos prontos também.

**◻ L-8.** O itinerário (N3) é da vida a bordo, mas **a tábua e a passagem vivem no cais**, e não têm lugar. **◻ L-1.** O posto dos
guardas do cais.

### 5.2 Armazém do Porto (`armazem`)

**Hoje.**
- **O lote e os postos:** 8 m; 3 estivadores; guarda 70 (`storage`).
- **A planta:** 23 famílias. As baias, as pipas, as prateleiras, **os estrados de carga** («onde o estivador pousa a caixa para ser
  contada») e **a mesa de conferência**. Trancado de noite.
- **O mundo:** os estivadores carregam as caixas do cais para dentro. Sem caixas, arrumam e contam (`arrumar`).
- **A guarda:** o armazém do porto **não é posto de guarda** (`E.guardTask` não o tem).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o estivador** (P35) | hoje carrega e arruma. P35: o porão, o navio que aderna; a turma | as baias e os estrados, que já existem; **a área de pousar e contar**, à porta |
| **o escriba que conta** (estiv §4.5: «o escriba conta o que entra e o que sai pelo livro») | — | a mesa de conferência, que já existe, e **o livro da carga** sobre ela; a lamparina |
| **o capataz da estiva, o dono da estiva** (estiv §8: os títulos) | escolher a turma, contratar; o contrato com um mercador | **a sala do capataz**, com a mesa e a arca do pagamento (inferência; estiv §5: «as moedas contadas na mão») |
| **o fiscal** (fisc §6, §14: «o selo na porta — lacrar o armazém até a conferência») | P34, P35: a apreensão vai ao armazém do povo | **a porta que se lacra**, com o selo de cera, que se vê (fisc §22) |
| **o contrabandista, o ladrão do cais** (estiv §6, §9; fisc §3) | «a caixa que não se conta», «a ânfora que some», «o guarda que se compra» | a guarda da noite, que hoje não existe (L-1); os cantos escuros entre as baias |

### 5.3 Casa dos Mergulhadores (`perolaria`)

**Hoje.** **4 m**; 2 mergulhadores; forma em seis povos; **sem planta**.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o mergulhador** (o recife, as pérolas, o naufrágio; sem patch; ofi §6) | hoje: o posto. Depois: o mergulho, as pérolas para o ourives (pesca §11), **o mergulhador de naufrágios** (tes, os derivados) | o lugar do equipamento (as pedras de lastro, os cestos, as facas, as cordas); **a mesa de abrir as ostras**, com a caixa das pérolas (um lugar do livro); o lugar de descansar e secar (inferência) |
| **o ourives que compra** | — | o balcão de venda (inferência) |

**◻ L-12.** Não tem planta. **⚠** Com 4 m de lote, ela é uma cabana de trabalho.

### 5.4 Salga (`salga`)

**Hoje.** 8 m; 1 salgador; forma em seis povos; **sem planta**. «O sal e a carne, ou o peixe, viram reservas que duram meses.» O corpo vê
«peixe secando ao sol» (`possess.js`).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o salgador e o defumador** (especialidades do açougueiro; P28; coz §12) | hoje: o posto. P26, P28: **a salga, a defumação, o garum** (pesca §7, §15, P4); conservar (coz §4) | **os tanques de salmoura**, **as cubas do garum** (o molho fermentado), **os varais e as esteiras de secar ao sol**, **o defumadouro** (o fogo com causa, `G.Atmos.fire`), **a mesa de limpar e escamar**, os barris e as ânforas, a arca do sal — que vem da salina ou da mina (coz §4) |
| **o pescador e o caçador que trazem** | — | a porta de entrega |

**◻ L-12b.** Não tem planta.

---

## 6. O comércio e a casa de beber

### 6.1 Taverna (`taverna`) — o piloto, já feito

**Hoje** (as ondas 1 a 4 dos interiores 2.0).
- **Os degraus:** a taberna de 8 m, a taverna de 12, a hospedaria de 16.
- **O salão:** até o telhado, com o corredor de 1 m; o balcão encostado e a prateleira do bar; o fogo de cada povo; **o estrado do
  músico**; as mesas com banquinhos.
- **Os outros cômodos:** a cozinha, a adega com a cuba, a despensa (`k:`) e a tulha (`e:`); em cima, **o aposento do taverneiro e os
  quartos**.
- **Os ofícios da casa:** o cozinheiro e o cervejeiro (`taverna-oficios.js`). O taverneiro leva a caneca à mesa.
- **A vida:** os jogos de dados e as Tabuletas, com o empréstimo da casa; a festa com causa; a tranca e o abrigo da guerra; a
  bebedeira e o desmaio; a porta com quem está dentro.
- **O que falta é o que o ofício do taverneiro traz** (P27).

| Quem | O que faz (o patch) | Do que precisa (o que ainda não tem) |
|---|---|---|
| **o taverneiro** (P27; tav) | **a tábua do fiado**, «escrita a giz» (tav §6); a caixa e as moedas contadas na madrugada (§4.5, §10: «a caixa de noite»); a criadagem — o servente, a cozinheira, **o leão de chácara**, o músico da casa (§18, o grupo); **a proteção**, a gangue que quer a sua parte (§6); **a batida do guarda** (§7); ouvir sem parecer e vender o que se ouve (§7, §16) | **a tábua do fiado** na parede, atrás do balcão (uma superfície legível); **o cofre ou a caixa** debaixo do balcão (um lugar do livro); **o posto do leão de chácara** perto da porta; **a sala dos fundos** — «as conspirações (a sala dos fundos)» (tav §16) — com uma mesa, longe do salão; o quarto ou o catre do servente (inferência) |
| **o estalajadeiro** (o título: a hospedaria; tav §8) | os quartos e as camas (já existem); **o livro dos hóspedes**; **o cofre dos valores**; **o estábulo**; «a morte no quarto três» | **o balcão dos hóspedes** com o livro (inferência: a peça e o livro); **o cofre dos valores**; **os quartos com número** (a «morte no quarto três» pede quartos com nome); **◻ L-13, o estábulo** ao lado, que a hospedaria do jogo não tem; a cozinha que serve o viajante. **E o hóspede**: hoje «a estalagem nunca recebe hóspede» (int2 §2.5) |
| **os fregueses** | já existem (10 a 25 à noite) | — |
| **o bardo e o músico** (P39; bardo §7) | a sala que se cala; o refrão cantado por todos | o estrado, que já existe; **a acústica pela planta**, que já existe (D-787) |
| **o estivador, o marinheiro** (estiv §6; pesca §10) | «a taverna do porto»: as histórias, os dados, a briga; **a tábua dos recordes** («a tábua dos recordes na taverna do porto») | **a tábua dos recordes** na parede (fund §2.6: «a tábua dos recordes na taverna do porto»); **o esqueleto do peixe lendário pendurado** (pesca §4); **o chifre** do caçador (caç §11) |
| **o carrasco** (carr §7) | «a caneca à parte na taverna (ou a porta fechada — pela índole do taverneiro)» | **a mesa à parte**: uma mesa que o taverneiro reserva, pela índole dele (um lugar da regra do repartidor, `In.placeRule`) |
| **o espião, o informante, o pirata** (pir §8.1: «o taverneiro que ouve os marinheiros»; tav §7) | os cochichos | a mesa do canto escuro, que já pode existir pela luz com causa |
| **o caçador de tesouros** (tes §1: «o velho bêbado da taverna do porto»; «comprar a pista: a banca, a taverna») | — | — (as mesas) |
| **o recrutador** (tav §16: «o recrutamento — o capitão pirata, o mateiro contratado, o soldado alistado»; estiv §6: «o recrutador do navio») | — | uma mesa de quem recruta (inferência) |
| **as marcas** (marc §10: «a parede dos rabiscos — os nomes, as contas, os amores dos fregueses»; tav §14: «a mesa do rei», «o barril do século») | — | **a parede dos rabiscos** (int2 §5.1 já pede): uma superfície que o registro das marcas endereça; o barril guardado na adega |

**⚠ C-17.** A hospedaria de 16 m é o único degrau com quartos para hóspedes, e o mundo não manda hóspede nenhum. O estábulo da hospedaria
(tav §8) não existe. **◻ L-13.**

### 6.2 Mercado (`mercado`)

**Hoje.**
- **Os degraus:** 8 m e o **mercado coberto** de 16 m (cidade de 150 pessoas).
- **Os postos:** 3 mercadores (`mercador`); guarda 50 (`storage`).
- **A planta:** 20 famílias e a forma (`marketFurnish`: as bancas, o estoque de cada negócio, `G.Biz`).
- **A guarda:** é posto de guarda (`E.guardTask`).
- **Os nomes de cada povo:** o Empório, a Feira, o Mercado do Rio, o Mercado, o Macelo. A auditoria deu nota 4.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o mercador** (o feirante, o especieiro; P37, sem documento) | hoje vende na banca. P37: o mercado do corpo, com o preço que reage (fund §2.8); **a banca própria** do corpo | as bancas, que já existem; **o depósito dos mercadores** no coberto (inferência); a banca que o corpo aluga |
| **o fiscal do mercado** (P34; fisc §5) | «de banca em banca, pesar a mercadoria nos pesos da cidade, medir o grão e o vinho na medida padrão, provar, olhar a moeda»; **«o peso falso quebrado à vista da praça»** | **◻ L-14, a mesa de pedra com as medidas da cidade**, com as cavidades do tamanho certo, «à vista de todos» (fisc §2, §5); **os pesos oficiais de bronze**, guardados pelo fiscal (uma arca trancada); **a balança de dois pratos** (sab era II); o lugar do fiscal (fisc §22) |
| **o cambista** (sab era IV: «a mesa do cambista na feira, com moedas de vários povos») | — | a mesa do cambista, com a balança fina |
| **o banqueiro** (sab era V: «o banco — a mesa do banqueiro, o cofre») | — | ◻ L-15, o banco: a mesa e o cofre (ver o §14) |
| **o vendedor de comida** (coz §10: «a da rua: o vendedor de comida — o balcão de pedra que dá para a rua»; coz §12) | P28 | o balcão de comida com o fogareiro (o balcão de alvenaria da taberna romana serve de modelo) |
| **o pescador, o caçador, o arqueólogo, o negociante de mapas** (pesca §11; caç §11; arq §4.6; tes, a pista: «a banca») | vender | bancas de cada coisa — o peixe, as peles, as antiguidades (inferência) |
| **o ladrão, o batedor de carteira** (ofi §6) | P34 | a multidão entre as bancas (o mercado cheio é o lugar dele) |
| **o relógio de sol e a tábua de contas** (sab era III: «as horas do dia (o mercado, o tribunal)»; «a tábua de pedrinhas na banca do mercador») | — | o relógio de sol, se o mercado tiver pátio; a tábua de contas na banca |

### 6.3 Feira (`feira`)

**Hoje.** **12 m**, aberta, sem paredes; 4 feirantes (`feirante`); 6 famílias de bancas em fileiras. «Toda manhã, barracas se armam:
feirantes vendem comida e mercadorias, e mercadores de outros povos aparecem.»

Os mesmos pedidos do mercado, ao ar livre:
- **o cambista** (sab era IV: «na feira») e **o fiscal do mercado** (fisc §5: «a praça do mercado e a feira»);
- **o caravaneiro** (P37): o lugar das carroças e dos animais na beira da feira (inferência);
- **o especieiro**: a banca das especiarias de longe (coz §4).
- **(Inferência)** Num povo sem moeda, a troca é feita na própria banca. A feira é o lugar natural do «mercado de gente» (L-11), se o
  dono decidir que ele existe.

### 6.4 Mercado Clandestino (`mercado_negro`)

**Hoje.** **4 m**; 2 contrabandistas; forma; **sem planta**. «Num beco escuro, contrabandistas vendem o que foi desviado dos armazéns —
sem imposto nenhum.» O contrabandista furta de noite do armazém do povo (fisc §3). O mercado clandestino **é posto de guarda**
(`E.guardTask`), e o guarda pega o contrabandista com a coisa roubada (`E.spotSmuggler`).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o contrabandista e o receptador** (P34) | vender sem imposto, comprar sem perguntar (saq §11; pir §12: «o porto que não pergunta») | **a frente que disfarça**: uma loja qualquer ou um barraco; **o depósito escondido** (um fundo falso, um alçapão); **a porta dos fundos** para a fuga; o lugar do vigia que avisa; a balança |
| **o falsificador** (P34; fisc §5: «a moeda de chumbo dourado», «o peso leve») | ◻ — | **a oficina escondida**, com o fogareiro, os moldes e a lima (inferência) |
| **o saqueador** (saq §11: «o ourives que derrete à noite») | — | (o derretimento é na ourivesaria, §7.3) |
| **o guarda e o fiscal** (a batida) | — | a porta que se arromba; o que se acha atrás do fundo falso (fisc §4: as pistas na coisa e no lugar) |

**⚠ C-18.** Num lote de 4 m não cabem a frente, o depósito escondido e a porta dos fundos — e o tipo é posto de guarda dos soldados do
próprio povo, o que é estranho para um lugar escondido (o `E.guardTask` o lista entre os postos).

### 6.5 Armazém (`storehouse`)

**Hoje.** 8 m; guarda 150; é o lugar de entregar; trancado de noite. 23 famílias: as baias, as prateleiras, as pipas. **Sem posto.**

| Quem | O que faz | Do que precisa |
|---|---|---|
| **quem entrega** (todos os ofícios que produzem) | hoje: a entrega e a paga por peça (`G.Eco.pay`) | **a porta das carroças**, que já existe, e **o lugar de pesar e anotar** (inferência) |
| **o fiscal, o cobrador** (fisc §7) | «o grão escondido no celeiro do vizinho»; **o selo na porta** (fisc §14) | a porta que se lacra; a balança |
| **o ladrão, o contrabandista** (fisc §3: «furta de noite do armazém do povo») | hoje já furta | **◻ L-16, ninguém guarda o armazém**: nem posto, nem guarda à porta. O guarda futuro e a tranca precisam de lugar |
| **o guardião do armazém** (inferência: nenhum plano tem o almoxarife) | — | — |

### 6.6 Celeiro (`celeiro`)

**Hoje.** 8 m; guarda 110 («longe dos ratos»); 17 famílias, e a forma no egípcio e no asteca; as tulhas; famílias sobre esteios.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o agricultor, o moleiro** (P28) | a colheita guardada uma vez por ano (cal §3: «o celeiro passa a valer») | as tulhas, que já existem; **o celeiro cheio e o vazio, pela estação** (o desenho pelo livro, com causa) |
| **quem governa** (gov §13: «o celeiro do rei — guardar para o inverno ruim e para a fome») | P40 | (o celeiro do rei pode ser o do povo) |
| **o fiscal** (fisc §7: «medir o grão do monte e estimar a colheita») | P34 | a balança, as medidas padrão (o vaso de medir) |
| **o ladrão, os ratos** (inferência) | — | — |

---

## 7. As oficinas (o Patch 32, «A oficina» — nenhum ofício da oficina tem documento a fundo; o rot §4 cita o ferreiro e o oleiro)

**O que vale para todas** (fund §2.4 a §2.8):
- **Aprender e ensinar:** o mestre mostra e o aprendiz repete. A oficina precisa de **dois postos, o do mestre e o do aprendiz**
  (inferência: hoje cada oficina tem os postos do repartidor, sem ordem entre eles).
- **A peça de mestre exposta na oficina** (fund §2.6): um lugar de mostrar — a prateleira e a parede da frente.
- **A banca própria e a encomenda** (fund §2.8): a frente que vende à rua e a mesa da encomenda com o prazo.
- **A confraria do ofício na cidade**, que julga a peça de mestre (fund §2.4): ◻ L-17 (ver o §14).
- **(Inferência)** O aprendiz morava com o mestre: a oficina-casa (a família «produtiva» das casas já existe).

### 7.1 Oficina (`workshop`)

**Hoje.** 8 m; **sem posto** (`jobs` só na planta, 2); 15 famílias: duas bancadas, a prateleira, o secador, o cepo. «Ferramentas
melhores (+15% de trabalho) e casas de pedra.»

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o carpinteiro, o marceneiro** (P32; ofi §6) | — | o banco de carpinteiro, o cavalete de serrar, as pilhas de tábuas, **o torno** (sab era III: «o torneiro girando a madeira») |
| **o coureiro** (o sapato, a sela, o pergaminheiro; ofi §6; caç §10: «a pele para o curtidor») | — | **◻ L-18, o curtume** (as tinas de curtir, o fedor longe das casas) e a bancada do coureiro |
| **o cordoeiro** (a corda, a rede, o cesto; ofi §6; pesca §5: «a linha do cordoeiro») | — | a rua da corda (o comprimento: inferência), a roda de torcer |
| **o vidreiro** (sab era III e V: «o vidro moldado», «o soprador com o cano») | — | ◻ o forno do vidro (a areia e a cinza: só onde há) |
| **o alfaiate** (ofi §6) | — | a mesa de cortar, os panos |
| **o tanoeiro** (fisc §14: «a vara no barril — o tanoeiro»; os barris da taverna) | — | o lugar dos barris e dos aros (inferência) |
| **o construtor** (o pedreiro; o arquiteto é título; P32: «a construção pelo corpo») | — | o canteiro fica na obra; a oficina guarda as ferramentas (inferência) |
| **o engenheiro** (sab §8: «a oficina do engenheiro»; «o modelo pequeno antes da máquina grande», sab §6) | P38 | **◻ L-19, a oficina do engenheiro**: a mesa dos modelos, os desenhos, a polia de ensaio |

**⚠ C-13.** Um tipo genérico, sem posto, para sete ofícios. Ou a oficina passa a ser do ofício do dono (a família da planta pelo ofício de
quem trabalha nela), ou entram tipos novos. A primeira saída muda pouco a cidade (inferência).

### 7.2 Forja (`forja`)

**Hoje.** 8 m; 2 ferreiros; 11 famílias: o fogo da forja, a bancada, a prateleira, a bigorna, a tina de têmpera. O bronze sai de cobre e
estanho, o ferro do minério, com a lenha (regra 161).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o ferreiro, o fundidor** (P32) | — | **o fole** (sab: «o fole duplo», os achados do ofício) — o posto do aprendiz que sopra (inferência); **o forno de fundir e os moldes** (sab era II: «o forno de fundir, o cobre escorrendo no molde»); **as caixas do metal e do carvão**, pelo livro; a parede das ferramentas feitas |
| **o armeiro** (P32) | as armas e as armaduras | a estante das armas acabadas; o lugar de provar a armadura (inferência) |
| **quem encomenda**: o carrasco (o machado, carr), o pirata (a espada), o navegador (o prumo de chumbo, nav §6), o escalador (a estaca de bronze), o arqueólogo (a vara de ferro, arq §6) | — | a mesa da encomenda, à frente |
| **o mineiro** (min §10: «o fogo de pátio — queimar o minério para o forno, o começo da fundição») | — | o pátio do fogo, se a forja tiver pátio |

### 7.3 Ourivesaria (`ourives`)

**Hoje.** **4 m**; 1 ourives; 9 famílias: a bancada do ourives, o cofre, a fornalha.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o ourives, o lapidário** (P32; min §4: as pedras) | — | a bancada fina **junto da janela** (a luz com causa); a balança fina; **a roda de lapidar** (inferência); **a pedra de toque** (min §5); o cofre, que já existe |
| **o ensaiador** (min §10; fisc §24) | a pureza do ouro | a pedra de toque e a balança |
| **o saqueador e o ourives desonesto** (saq §1: «o ourives do porto paga a peso o ouro que derreteu»; saq §11: «o ourives que derrete à noite») | P38 | **a sala dos fundos** com a fornalha, fechada de noite — o crime à vista de quem entra lá (inferência) |
| **quem traz**: o pescador (a pérola), o caçador (o marfim, a pluma), o mergulhador | — | o balcão de comprar |

**⚠** Com 4 m de lote, a sala dos fundos cabe com dificuldade.

### 7.4 Olaria (`olaria`)

**Hoje.** 8 m; 2 oleiros; 12 famílias e o terreiro: a roda, o forno, a estante de secar, o tanque de barro, a eira de moldar, a pilha de
tijolos.

**Quem mais:** os clientes do oleiro nos planos.
- **O navegador:** «a lanterna», «a ampulheta de água» (nav §6).
- **O mineiro:** «a lamparina de barro» (min §6).
- **A cozinha:** «a panela do oleiro» (coz §5).
- **O arqueólogo:** «cola e gesso, cera» (arq §6).
- **O saber:** a cal, o tijolo e a telha (sab eras II e III).

**O que pede a mais:** a frente de venda dos potes (inferência) e **o forno de cal** (sab era II), onde o povo descobriu a cal.

### 7.5 Tecelagem (`tecelagem`)

**Hoje.** 8 m; 3 tecelões; 11 famílias: três teares, a estante de secar, a prateleira.

| Quem | Do que precisa |
|---|---|
| **o tecelão, o tintureiro** (P32) | **as tinas de tingir** e o varal (◻ a tinturaria); **a roca e a roda de fiar** (sab era VI: «a roda de fiar com o pedal»); a púrpura só do caramujo do mar (sab, «sem caramujo do mar, sem púrpura») |
| **quem compra**: a vela do navio, a rede do pescador (pesca §5), **o tapete fino da casa rica** (int2 §3, a regra 2) | a prateleira dos panos feitos |

### 7.6 Casa da Seda (`sericultura`)

**Hoje.** 8 m; 2 sericultores; forma; **sem planta**. «Lagartas criadas em bandejas e alimentadas com folha de amoreira.»

**O que pede:** as estantes das bandejas, a caldeira dos casulos, o fio e o lugar de fiar. O tecelão da seda vem com o P32 (ofi §6). ◻
L-12c: sem planta.

### 7.7 Açougue (`acougue`)

**Hoje.** **4 m**; 1 açougueiro; 9 famílias: o cepo, os ganchos da carne, o balcão. O açougueiro «busca um animal no curral, abate e leva
a carne ao armazém; o couro fica para os artesãos».

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o açougueiro** (o salgador, o defumador; P28; coz §12: «a carne de cada bicho») | o abate e o corte | **o lugar do abate**, com a argola de amarrar e o escoadouro (inferência); os ganchos e o balcão, que já existem; **o defumadouro** (ou a salga) |
| **quem compra**: o navegador («o sebo do açougueiro», nav §6), o pescador (as entranhas, a isca), a taverna, o coureiro (o couro) | — | o balcão |
| **o fiscal** (o peso) | — | a balança |

---

## 8. Debaixo da terra

### 8.1 Mina (`mina`)

**Hoje.**
- **O lote:** **4 m**; 4 mineiros; forma em seis povos; **sem planta**.
- **O que o mundo faz:** «galerias escavadas num veio… mineiros entram, somem na montanha e voltam carregados». O minério nasce só da
  mina (regra 160); a mina sem veio não dá posto (`E.spent`, regra 90).
- **O plano:** o corpo debaixo da terra é outro plano (`subterraneo` S1, S2, do P31).

| Quem | O que faz (P31; min, sub) | Do que precisa **na boca da mina** (o prédio de cima) |
|---|---|---|
| **o mineiro** (o sapador, o poceiro) | descer, a picareta, o cesto; «separar na boca da mina: moer, lavar, escolher — o minério bom vai para a forja, o entulho para o monte» (min §7.9) | **a boca do poço** com a escada de tronco e **o sarilho** («girar o sarilho em turma», min, as animações); **o lavadouro**, **o pilão** e **a mó** (min §6); **o monte de entulho**; **a pilha das escoras**, madeira do livro que apodrece (min §6, §7.5); **o depósito das lamparinas e do óleo** (min §6: «gasta o óleo pelo livro»); o lugar das ferramentas |
| **o chefe de galeria, o mestre, o dono de mina** (min §12) | a licença, **o quinto** de quem governa (min §3, §14) | **o lugar de pesar e de cobrar o quinto** (inferência; quem cobra é o fiscal da cobrança?); a mesa do dono |
| **o feitor e o escravo da mina** (cap C5; sub §4) | o rendimento pelo medo ou pela confiança; a revista | o posto do feitor na boca da mina; à noite, o cercado (§4.4) |
| **o soterrado e o resgate** (min §9; sub §4) | «a cidade toda no resgate»; «a família na boca da mina» | **o espaço diante da boca** onde a cidade se junta (inferência) |
| **o vigia do ouro** (min §9: «o ouro que some… o vigia») | — | a arca do ouro trancada (inferência) |
| **o garimpeiro, o lapidário, o ensaiador, o fundidor** (min §18) | — | a bateia (no rio); a pedra de toque e a balança (na ourivesaria) |

**◻ L-20.** A boca da mina, de 4 m, não tem planta. As galerias são do subterrâneo — uma planta de baixo da terra (S1, S2) que a gramática
dos interiores não faz hoje.

---

## 9. A fé, o saber, a cura e a memória

### 9.1 Templo (`temple`)

**Hoje.**
- **Os degraus:** o santuário de 8 m, o templo de 16, o grande templo de 24, o santuário monumental de 32. Planta e forma.
- **O posto:** 1 no altar («oficiar»). O sacerdote é um papel de hoje.
- **A planta:** a imagem do deus contra a parede do fundo da cela; o altar a um passo; os dois lampadários; os bancos dos fiéis (ou as
  esteiras de oração do egípcio e do asteca); o cofre das oferendas; os jarros no porão.
- **O mundo:** **as oferendas** ficam no prédio (`b:`); os sacerdotes comem delas, e o que passa do tesouro vai ao armazém do povo
  (`act-servicos.js`, todo dia). A festa e a reza.
- **Os nomes de cada povo:** o Templo, o Templo de Madeira, o Templo de Pilonos, a Pirâmide.
- **A auditoria:** nota 2; «o templo fica em breu» (int2 §2.3).
- **O sacerdote e o curandeiro não têm documento a fundo** (rot §4).

| Quem | O que faz (o patch; a fonte) | Do que precisa |
|---|---|---|
| **o sacerdote** (P38) | hoje: o altar, as oferendas. P38. Pelos outros planos: a festa dos deuses e o dízimo (gov §5.7); **o rito dos condenados** (carr §10: «um sacerdote»); **o juramento com a mão no altar** (juiz §19); **a penitência no templo** (teocracia, `Cr.sentence`) | **o altar**, que já existe; **a sacristia**: a arca das vestes e dos utensílios (inferência); **os quartos dos sacerdotes** — hoje a planta fala «dos quartos dos sacerdotes em cima», mas não põe cama nenhuma (◻ L-21); **o tesouro do templo** trancado (o cofre já existe; as oferendas são um lugar do livro de verdade) |
| **o sumo-sacerdote** (o cargo; gov §5.4) | o conselho | a sala dele (inferência) |
| **o guardião do calendário** (o cargo; sab §14b; era II: «o calendário pintado na parede do templo») | anunciar os dias, as festas, o ano novo | **a parede do calendário** (uma superfície pintada, que muda pelo saber); **o poste das marcas da lua** (sab era I) |
| **o astrônomo** (P38; sab §8: «o observatório (o terraço do templo…)») | a noite inteira no telhado (sab §6: «observar») | **o terraço do templo**, com o gnômon e o lugar de anotar; **o mapa do céu no teto** (sab era III: «o mapa do céu no teto do templo») |
| **o curandeiro, o médico** (P38; sab §8: «o templo da cura (onde os doentes dormem)»; era V: «os canteiros de ervas junto ao templo da cura») | dormir no templo para sarar | **◻ L-22, o templo da cura**: o dormitório dos doentes, o jardim das plantas, a mesa de quem cura (ver o §14) |
| **o escriba do templo, o caçador de tesouros** (tes §1: «no arquivo do templo, um nome na lista dos mortos»; tes §4: «o registro dos mortos — o templo, a biblioteca») | — | **o arquivo do templo**: as estantes com a lista dos mortos (uma marca, marc §3) |
| **o saqueador** (saq §6: «o sacerdote que dorme no templo junto ao túmulo»; «a família que vem acender a lamparina no dia dos mortos») | P38 | a cama do sacerdote perto do túmulo; a lamparina acesa pela causa |
| **o arqueólogo** (arq §4.6, §10: «a reação do povo quando a peça vai para o templo»; as relíquias, arq §18) | doar o achado | **o lugar das relíquias e das oferendas** à vista (uma vitrine ou um nicho, inferência) |
| **quem oferece**: o pescador (pesca §11: «o peixe do sacrifício»), o navegador («a oferenda antes da travessia»), o montanhês («a oferenda no cume»), o mineiro, o pirata (o altar do navio) | a oferenda (eco §2: «o presente e a oferenda») | **a mesa das oferendas**, diante do altar (inferência); o cofre |
| **os peregrinos** (o monge inclui o peregrino; ofi §6; marc §4b: «os degraus do templo afundados por séculos de peregrinos») | — | **os degraus que se gastam** (uma superfície das marcas) |
| **o sacrifício do asteca** (carr §15: «o sacrifício é dos sacerdotes»; `justice.js`: «a faca de obsidiana no alto do templo») | — | o alto da pirâmide, que já existe pela forma; a pedra do sacrifício |
| **os autômatos** (sab era V: «a porta do templo que se abre sozinha — o “milagre” dos sacerdotes») | — | a porta que se abre pela máquina, onde o povo a descobriu |

**A estrutura.**
- **A zona pública:** o pátio, a nave e os degraus.
- **A zona sagrada:** a cela com a imagem, onde só o sacerdote entra além do altar (inferência). A porta é guardada pelo costume, não
  pela tranca.
- **A zona de serviço:** a sacristia, o tesouro (trancado) e o arquivo.
- **A zona privada:** os quartos dos sacerdotes e o terraço.

**◻ L-21.** Os sacerdotes não moram no templo. **◻ L-22.** O templo da cura e o observatório não existem.

### 9.2 Biblioteca (`biblioteca`)

**Hoje.**
- **Os degraus:** 8 m e a grande biblioteca de 16 m (cidade de 120 pessoas).
- **Os postos:** 1 copista (`copista`; 3 na grande).
- **A planta:** as estantes de rolos, as mesas de leitura, a mesa do escriba, um banco. O dia dela: ler e copiar (`G.Biblioteca`); a
  freguesia vai ler pela vontade.
- **Os nomes de cada povo:** a Academia, a Casa dos Escaldos, a Casa da Vida, o Calmécac, a Biblioteca.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o copista, o escriba, o cronista, o tradutor** (P38; ofi §6) | hoje copia. P38: a crônica do reinado — «contada do seu jeito, se você pagar» (gov §15b) | **o scriptorium**: as mesas de copiar com a luz da janela, a tinta e o material de escrever (o papiro, o pergaminho, as tabuinhas, pela origem); **o depósito do material** |
| **o bibliotecário-mor** (o cargo; sab §14b) | — | a mesa dele e **o catálogo na entrada** (sab era V: «as etiquetas nos rolos, o catálogo na entrada da biblioteca») |
| **o decifrador** (arq §20: «vive na biblioteca») | o caderno da escrita (arq §8) | a mesa de quem decifra, com as tábuas antigas à mão |
| **o arqueólogo** (arq §14: «a sala das antiguidades da biblioteca»; §9: «a biblioteca da cidade passa a contar essa história») | — | **◻ L-23, a sala das antiguidades**: as vitrines, a mesa de restaurar (os cacos, «o quebra-cabeça de verdade», arq §7.8) |
| **o navegador, o bardo, o naturalista** (nav, as marcas: «o périplo copiado na biblioteca»; bardo §9: a canção escrita; sab §14: «o livro dos bichos») | — | as estantes por assunto (inferência) |
| **o filósofo, o mestre-escola** (sab §8: «a academia (o nome grego dela)»; per «Ensinar: a escola»; ofi §6: «o mestre-escola») | ensinar, debater | **a sala da escola**: a cadeira do mestre, os bancos dos discípulos (inferência; e o Calmécac asteca, que era a escola dos nobres); **◻ L-24, a escola** (ver o §14) |
| **os sábios de toda espécie** (sab §6: «ler, copiar, comparar — o saber de antes, sem refazer») | — | as mesas de leitura, que já existem; **os óculos** (sab era VI) |
| **o fogo** (sab §5.7: «a biblioteca queimada… o saber de poucos pode se perder») | — | (a resistência ao fogo é do mundo: `V.fireFuel`) |

**A estrutura.** A sala pública de leitura; o scriptorium de serviço; o depósito dos raros, trancado (inferência); a sala da escola.

### 9.3 Banhos (`banhos`)

**Hoje.**
- **Os degraus:** 8 m, as termas de 20 m e as grandes termas de 28 m (só no romano, no grego e no clássico).
- **Os postos:** 1 foguista (`foguista`, com o posto e o turno: D-227).
- **A planta:** o vestiário, a sala fria e a quente, as piscinas, a fornalha, os bancos, os cabides; as termas pela forma
  (`int-termas.js`).
- **Os nomes de cada povo:** a Sauna do norte, o Lago Sagrado do egípcio, o Temazcal do asteca.

**Quem mais (poucos pedidos nos planos):**
- **o curador das águas** (o cargo; sab §14b): a manutenção — «sem ele, o aqueduto racha»;
- **quem governa** (gov §5.3: «as termas» entre as obras), com a dedicatória (marc §3: «a obra com nome»);
- **o hipocausto** (sab era V: «os pilaretes debaixo do chão das termas, o vapor»), visto onde o povo o descobriu;
- **(inferência)** o ladrão do vestiário, um furto clássico.

**O que pede:** a guarda das roupas no vestiário — um cabide que guarda, com um lugar do livro, se a roupa for coisa (inferência).

### 9.4 Monumento (`monument`)

**Hoje.** O monumento de 8 m e o grande monumento de 16 m; a forma (a pedra do deus, o obelisco, a pedra rúnica, a pedra do sol, a coluna
triunfal); a planta: os degraus e o alto (D-097).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o túmulo de quem governou** (pas §3: «o monumento: a pirâmide e o mausoléu do mundo guardam quem o povo enterrou neles») | P31 (o enxoval), P38 | **a câmara do túmulo**, onde o povo enterra o rei (na pirâmide da maravilha egípcia já existe, com o sarcófago) |
| **o saqueador** (saq §6: «o vigia do cemitério ou do monumento, com a ronda dele») | P38 | **o posto do vigia** e o caminho da ronda (inferência) |
| **quem governa e o escriba** (marc §3: «a inscrição»; gov §15b: «a lei gravada em pedra») | — | **a face que se grava** (uma superfície das marcas); o nome raspado (gov §15b) |

### 9.5 Estátua de Ouro (`estatua`)

**Hoje.** 4 m; forma. «Uma estátua do deus, coberta de ouro.»

**Quem:** o escultor, pela semelhança, que é a perícia dele (marc §9); **o ouro que se derrete** na guerra (marc §6: «o bronze derretido
para armas e moedas»). **Sem interior.** **(Inferência)** O ladrão do ouro e o guarda à noite.

### 9.6 Cemitério (`cemetery`)

**Hoje.** 8 m, aberto, sem planta. Doze covas por cemitério, e o ossuário quando enche (`Village.bury`, CL).

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o saqueador** (saq §6) | a noite sem lua, o túnel de lado, fechar o túmulo | **o vigia com a ronda** (o caminho, a lanterna, a hora); **o cão** que late; **as lápides** (marc §3) |
| **a família** (saq §6: «a família que vem acender a lamparina no dia dos mortos»; bardo, o lamento no enterro) | — | as lamparinas dos túmulos, acesas pela causa; o lugar do enterro com o povo em volta |
| **o carrasco** (carr §4: «enterrar no campo dos condenados — com rito ou sem») | — | **◻ L-25, o campo dos condenados**, à parte |
| **o arqueólogo, o caçador de tesouros** (arq §3: «os cemitérios e o ossuário») | — | as camadas e o ossuário |

**◻ L-25b.** Ninguém tem o ofício do coveiro nem do vigia do cemitério (inferência: é o guarda, ou uma função).

---

## 10. O espetáculo

### 10.1 Teatro (`teatro`)

**Hoje.**
- **Os degraus:** o antigo de 12 m, e o teatro de 24, o grande de 32 e o monumental de 40 m. A forma; a planta pela forma, com a cávea,
  as fileiras, o palco, os bastidores e a orquestra.
- **Os postos:** 2 atores (`ator`). A peça é ao entardecer, com a entrada paga (`G.Teatro`).
- **Os nomes de cada povo:** o Teatro (grego), **a Arena** (romano), o Salão do Hidromel (nórdico), o Jardim Sagrado (egípcio), **o Campo
  de Pelota** (asteca). **O mesmo tipo é cinco usos.**
- **A auditoria:** o corpo não entrava no teatro nem no Coliseu, nem pulando (int2 §2.4). Falta conferir se a frente P4 já resolveu.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **o ator** (o dançarino, o acrobata; P39) | hoje a peça | o palco e os bastidores, que já existem; **o vestiário dos atores**, com as máscaras e os figurinos (inferência) |
| **o músico, o bardo** (bardo §17: «os romanos… o teatro») | — | o lugar dos músicos |
| **o gladiador na Arena romana** (glad §3: «o anfiteatro (o Coliseu e os degraus menores)») | P33 | **o túnel e a grade** («o túnel cheira a areia molhada… a grade sobe», glad §1); **as jaulas das feras** (glad §9; caç: «o bicho vivo para a arena»); **o camarote de quem paga os jogos** (glad §7.6: «o vencedor olha para o camarote»); a areia que guarda a luta (glad §7.4); **o lugar dos mortos** (inferência; o spoliarium: «o morto é uma pessoa do mundo», glad §7.8) |
| **o atleta no Campo de Pelota** (ofi §6, a arte: o atleta) | P39 | as paredes e os aros do jogo de pelota (inferência) |
| **quem paga os jogos e quem aposta** (glad §10: «com moedas de verdade… a multidão aposta») | — | o camarote; **o lugar das apostas** (inferência) |
| **o condenado das execuções do meio-dia** (glad §9) | — | a cela de espera sob a arena (inferência) |

### 10.2 Maravilha (`maravilha`) — cada povo é um prédio diferente

**Hoje.** A antiga de 12 m; a maravilha de 40 m; a colossal de 52 m. Uma família, pela forma. Os nomes:

| Povo | O nome | O que é | Os ofícios que pedem |
|---|---|---|---|
| romano | **o Coliseu** | a arena: o subsolo, a areia, as fileiras, **o camarote** com o trono e o banco da corte (já existem) | **o gladiador** (glad §5–§10): o túnel, as jaulas, o lugar dos médicos, o elevador das feras (inferência), o lugar das apostas; quem paga os jogos; o bestiário (caç) |
| egípcio | **a Grande Pirâmide** | o túmulo: a câmara e o sarcófago (já existem) | **o saqueador** (saq §1, §4), **o arqueólogo**, **o caçador de tesouros**; o enxoval (pas §3); o vigia do monumento |
| asteca | **o Templo Mayor** | o templo do sacrifício | **o sacerdote** (o sacrifício: carr §15); o carrasco não; os cativos de guerra para os templos (gov §18) |
| nórdico | **o Salão de Valhala** | o salão do banquete | **o escaldo** (bardo §2), o banquete do chefe, o hidromel (coz §6.1) |
| grego | **a Acrópole** | o santuário da cidade | o sacerdote; o tesouro da cidade (inferência) |
| clássico | a Maravilha | — | — |

**⚠ C-12.** Um tipo, cinco programas. Hoje só o Coliseu (a arena) e a pirâmide (a câmara) têm uso por dentro. A interiores 3 precisa dar um
programa a cada uma, e o planejador continua a erguer «a maravilha» como um tipo só (`Ci.IDEAL`).

---

## 11. A terra e os bichos (o Patch 28, «A terra» — sem documento a fundo; ofi §6, coz §4, §12)

Os campos são abertos e não têm interior. O que os ofícios da terra pedem são **os prédios de apoio**, que hoje não existem.

| Tipo de hoje (o lote; os postos) | Quem | O que pede (fonte) |
|---|---|---|
| **Fazenda** (`farm`, 12 m, aberta) | o agricultor (P28) | **◻ a eira**, onde se bate e se mede o grão — o fiscal mede «o grão do monte» e lê «a palha nova da eira» (fisc §1, §7); **o telheiro das ferramentas e do arado** (sab era VI: «o arado pesado»; inferência); o celeiro (§6.6) |
| **Plantação** (`plantacao`, 12 m; 3 lavradores) | o lavrador | o lugar de secar o cacau, o café e a pimenta (inferência) |
| **Pomar** (`pomar`, 12 m; 2 fruticultores) | o fruticultor; **o lagareiro** do azeite (ofi §6: «o vinho e o azeite») | **◻ o lagar**, com **a prensa de parafuso** (sab era IV: «a prensa de parafuso no lagar»); a tina das azeitonas |
| **Vinhedo** (`vinhedo`, 12 m; 2 vinhateiros) | o vinhateiro e o lagareiro (P28) | **◻ o lagar**: a tina onde se pisam as uvas (BDESC) e a prensa; **a adega do vinho** (o vinho bom que melhora com os anos, tav §6; «o barril do século», tav §14) |
| **Horta** (`horta`, 4 m, aberta) | quem cuida da horta da casa (ofi §4) | — |
| **Apiário** (`apiario`, 8 m; 1 apicultor) | o apicultor | as colmeias de barro e de palha; tirar o mel com fumaça (sab era IV); **o lugar de espremer o mel e fazer a cera** (inferência) |
| **Salina** (`salina`, 12 m; 2 salineiros) | o salineiro | o monte de sal raspado e o depósito dos sacos (BDESC: «raspado e ensacado») |
| **Curral** (`curral`, 12 m; 2 pastores; forma) | o pastor, **o queijeiro** (ofi §6: «o pastor inclui o queijeiro»; coz §4: «a queijaria»); o açougueiro, que busca o animal; **o caçador**, que espera a fera perto do curral (caç §1, §8: «a isca: a cabra amarrada, o curral») | **o abrigo das crias**; **◻ a queijaria**: o coalho, o pano, as formas (coz §5); o lugar da ordenha e da tosquia (BDESC: «tosquiam, ordenham»); **o lugar do cão** que guarda (sab era I); o cocho de água |
| **Estábulo** (`estabulo`, 12 m; 2 cavalariços; forma; aberto) | **o criador de cavalos e o domador** (P28); **o cavaleiro** (P33); **o auriga** (P39); **o correio**, com os cavalos frescos nas estações (sab §14b); a hospedaria (tav §8); o bardo, que «dorme no estábulo» (bardo §10) | **as baias e as manjedouras**, **o palheiro**, **a selaria** (a sela do coureiro: ofi §6), **o quarto do cavalariço**, **o picadeiro** do domador, o ferrador (sab: «o cavalo ferrado», era VI; inferência) |

**◻ L-26.** O curral e o estábulo não têm planta, e são os prédios de apoio da criação, do correio e da cavalaria. **◻ L-27.** Não existem a
eira, o lagar, a queijaria nem o moinho (§14).

---

## 12. As casas

**O que vale para todas.**
- **As camas e o núcleo:** cada casa tem o número de camas do tipo (`BDEF.housing`) e o seu núcleo — o fogo e onde a família come
  junta (D-196).
- **O tamanho fica** (int2 §4, a decisão 14): «as casas pequenas do povo ficam pequenas (4 × 4 m), mas andáveis e arrumadas».
- **A família viva** (p23 23e): a briga de casal com causa, criar os filhos, a herança; **o romance**; as desavenças de vizinho; **os
  convites** (npc §2, a ideia 5).
- **A mesa do hóspede** («receber é honra (no norte, o hóspede é sagrado)», coz §10) e **quem cozinha em cada casa**, que é um papel da
  família (coz §10).
- **A escola em casa:** «a escola (qualquer casa com mestre e discípulos)» (sab §8).
- **O doente de cama, o parto e a parteira** (o curandeiro inclui a parteira: ofi §6); o velório e o luto (CL: `homeBound`).
- **O censo** lê a casa: «três camas para uma família que diz ter um filho», «o brinquedo da segunda criança no quintal», «o mugido
  atrás do muro», «o esterco fresco» (sab §14b). **A casa precisa ser legível**: as camas contadas, o brinquedo, o bicho no quintal.
- **O cobrador:** «as moedas, os bens, os bichos»; «as moedas enterradas» (fisc §7). O furto já existe: «a casa que acha a bolsa mais
  leve» (juiz §3). **Onde ficam as moedas** — a arca, o nicho, o cofre — é o alvo do ladrão e da revista.
- **O vigia da quarentena:** «a casa marcada, o guarda na porta» (sab §14b).
- **O que se mostra:** a pele na parede (caç §11); a casa mercante com a bandeira na porta (CL: `h.elite`); o tapete fino da casa rica
  (int2 §3, a regra 2).

### 12.1 Barraco (`barraco`, 4 m; 3 camas; 2 famílias)
**Quem:** a família sem teto (o `social.js` o levanta) e, pela inferência, o mendigo. **O que pede:** a esteira que se pisa, que hoje
barra o andar (int2 §2.1). Nada mais.

### 12.2 Cabana (`hut`, 4 m; 4 camas; 27 famílias, a redonda também)
**Quem:** a família pobre, o lavrador, o pescador, o caçador. **O que pede:** o fogo de chão, as esteiras e os cestos, que já existem;
**o lugar do ofício da família** — a rede do pescador, a pele do caçador (inferência); a cabana não tem frente de trabalho
(`int-familias.js`).

### 12.3 Casa (`house`, 4 m; 6 camas; 55 famílias) e a casa rica (domus, 8 m)
**A casa.** Já tem a frente de trabalho, a família «produtiva»: o artesão em casa, com a bancada e o tear (`int-familias.js`). Pede, com
os ofícios:
- **o posto do aprendiz** (inferência: o aprendiz que mora e trabalha na casa do mestre, fund §2.5);
- a pele, a peça de mestre e a lembrança na parede, cada uma com a sua causa.

**A casa rica (domus).** Hoje é uma família só para todos os povos (`domus.patio`): o salão do fogo e da mesa entre dois quartos, o
vestíbulo, os quartos da frente, o pátio com a fonte.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **a família rica** | hoje mora; P23 (a família viva), P37 (a casa mercante) | **a sala do banquete de casa**, pela maneira de cada povo: o grego «o banquete é em casa» (tav §9), o romano «o banquete deitado» (coz §6.1); **o altar da casa** (inferência, o lar romano); a cozinha à parte, com **o cozinheiro da casa rica** (coz §12: «a cozinha da casa rica») |
| **o mercador da casa mercante** (CL: `G.Trade.keepHouses`, `h.elite`) | a conta do comércio, o bem da casa | **o escritório do mercador**, com o cofre e o livro da conta (inferência) |
| **os criados, a condição «servo»** (ofi §6) | — | **◻ L-28, a cama do criado**: o `housing` 6 é da família, e um criado não é uma «família» que o repartidor aloja |
| **o patrocinador e o colecionador** (tes §derivados: «o patrocinador (a casa rica)»; arq §14: «a casa… compra o que você acha»; arq §18: «as estátuas dos gregos nas casas ricas») | — | o lugar da coleção (inferência) |

### 12.4 Sobrado (`sobrado`, 4 m; 9 camas; 56 famílias), 12.5 Ínsula (`insula`, 4 m; 14 camas; 60 famílias), 12.6 Quarteirão (`quarteirao`, 8 m; 40 camas; 16 famílias)

**Quem:** várias famílias, de aluguel (`G.Casa.lease`: o dono que mora noutra casa).

**O que pedem, com os ofícios:**
- **a loja que dá para a rua no térreo** (inferência, a ínsula romana; coz §10: «o vendedor de comida — o balcão de pedra que dá para a
  rua»);
- **a latrina e a água** (sab era IV: «a higiene, a latrina»);
- **o risco do fogo e os vigias do fogo** (sab §14b: «a turma da bomba e a ronda da noite»);
- **o censo** de muitas famílias de uma vez;
- **a escada comum**, que é um lugar de encontro — a desavença de vizinho (p23 23e).

---

## 13. A cidade aberta

### 13.1 Praça (`praca`, 8 m; aberta; 1 família; a pedra de falar, `tribuna`)

**Hoje.**
- ao fim da tarde, quem para na praça das suas ruas (`G.Praca`, D-225);
- **o voto e o pão** na praça mais velha (`Po.forum`);
- **o cadafalso** que sobe para o dia da execução (`justice.js`);
- a festa.
- **Os nomes de cada povo:** a Ágora, o **Thing**, o Pátio do Templo, o Tianguis, o Fórum.

| Quem | O que faz | Do que precisa |
|---|---|---|
| **quem governa, o agitador, o filósofo** (gov §5.8: «o discurso na praça»; sab era IV: «o debate em passos»; gov §21) | — | a pedra de falar, que já existe; a multidão em volta |
| **o arauto** (gov §20: «Silêncio! Fala o rei!»; carr §18) | — | o lugar ao lado da pedra |
| **o juiz e o júri** (juiz §2: «os atenienses tiravam centenas de cidadãos à sorte… e votavam com pedrinhas em duas urnas»; §9: o fórum; §13: o jurado por um dia) | P34 | **◻ L-29, o lugar do júri e das urnas**; a sentença dita em público (juiz §5.8) |
| **o carrasco** (carr §4: «os castigos públicos — o açoite medido, a exposição na praça») | P34 | o cadafalso, que já existe; **◻ L-9, o pelourinho** (o poste da exposição) |
| **o fiscal** (fisc §5: «o peso falso quebrado à vista da praça») | P34 | **a mesa de pedra das medidas da cidade** (a praça do mercado) |
| **os recenseadores** (sab §14b: «se oferecer na mesa do censo, na praça») | P-Sa, P38 | **a mesa do censo**, por uns dias |
| **a lei gravada e a estátua** (gov §15b: «a lei gravada em pedra — o decreto na praça»; marc §3) | — | **a pedra da lei** e o pedestal (superfícies das marcas) |
| **o relógio de sol** (sab era III: «o relógio de sol na praça») | — | o gnômon, onde o povo o descobriu |
| **o bardo** (bardo §7: «a praça na festa») | — | — |
| **o mendigo** (inferência) | — | os degraus, a fonte |

### 13.2 Fogueira (`campfire`, 4 m)
**Hoje:** «o coração do acampamento… abrigo para quem não tem casa». O lugar de entregar, e o cativo dorme aqui quando não há cercado.
**Quem:** o bardo («a história contada perto do fogo», bardo §6), o mendigo, os sem casa. Sem interior.

### 13.3 Poço (`well`, 4 m; forma)
**Quem:** o aguadeiro (a função), o poceiro (min §18; sub §4). **Pede:** o ponto de encaixe da animação — «o poço» (p23 23c) — e o lugar
da conversa à beira dele (inferência). Sem interior.

### 13.4 Aqueduto (`aqueduto`, 4 m; forma)
**Quem:** **o curador das águas** (o cargo; sab §14b: «sem ele, o aqueduto racha e a cidade fica sem água»), o engenheiro, o cavador de
túneis (sub §4). **Pede:** a caixa d'água com a porta de inspeção (inferência). Sem interior para o corpo.

### 13.5 Ruínas (`ruin`)
**Quem:** **o arqueólogo** (arq §3: «as ruínas, o tipo `ruin`»), o caçador de tesouros, e pela inferência o foragido e o mendigo. **Pede:**
as camadas, o entulho (a peça `entulho` já existe) e as marcas que ficaram. É do passado (P31, P38).

---

## 14. Os prédios que os planos pedem e que não existem

Para cada um, a saída mais barata pode ser **um tipo novo**, **um degrau novo** de um tipo que existe, ou **um cômodo** dentro de um prédio
que existe. A coluna «Saída provável» é uma proposta (inferência).

| Prédio | Quem pede (a fonte) | O que tem dentro | Saída provável |
|---|---|---|---|
| **Alfândega** | fisc §6, §22; ofi §6; int2 §2.1 («nem existe como tipo»); rot P35 | o balcão do manifesto, a balança, a vara de sondar, o depósito da apreensão, o livro da alfândega, a fila | tipo novo junto da doca (como o armazém do porto, `Hb.plan`), ou um degrau da doca |
| **Estaleiro** | ofi §6 (o construtor naval); sab eras III e V; pir §4; int2 §2.1 | a carreira, o telheiro das madeiras, a bancada do carpinteiro naval | tipo novo, ou um degrau da doca (a carreira já mora nela, no `fishers.js`) |
| **Capitania e tábua dos navios** | navios §2.5, N3; pir §8.1 | a tábua dos navios, o balcão das passagens, o livro dos navios, a sala de espera | um cômodo da alfândega, ou da doca grande |
| **Farol** | nav §15 («uma obra nova… e o seu ofício, o faroleiro»); sab era V; ofi (o faroleiro) | a escada, o fogo no alto, a lenha, o quarto do faroleiro | tipo novo, com o saber do farol (era V) |
| **Escola de gladiadores** (o ludus) | glad §5; int2 §2.1, §6 | o pátio de treino com os postes, a estante das armas de madeira, **as celas** (com correntes para os cativos e os condenados; a liberdade vigiada dos voluntários), o médico da escola, o refeitório («os comedores de cevada»), a sala do lanista | tipo novo (a base é a planta do quartel: B §2) |
| **Escola, academia, escola de filosofia** | sab §8 («a escola: qualquer casa com mestre e discípulos»; «a academia»); sab era V («o pórtico com o mestre e os discípulos»); eco §6 («a escola do filho»); ofi (o mestre-escola) | a cadeira do mestre, os bancos, a tábua de escrever, **o globo** (sab era IV) | um cômodo da biblioteca, a sala da casa do mestre, ou o pórtico da praça |
| **Observatório** | sab §8 («o terraço do templo, a torre») | o gnômon, o caderno do céu, a vigília | o terraço do templo, ou o alto da torre |
| **Templo da cura e hospital** | sab §8 («o templo da cura (onde os doentes dormem)»); era V («o hospital — o pátio de camas com os feridos»; «os canteiros de ervas junto ao templo da cura») | o dormitório dos doentes, a mesa de quem cura, a prateleira dos remédios, o jardim das plantas | um degrau ou uma família do templo; o hospital, um tipo da era V |
| **Casa da moeda** | marc §3; gov §15b; fisc §24 (o ensaiador); min §2 | o forno de fundir, o cunho e a bigorna, a balança fina, a pedra de toque, os cofres | um degrau da coletoria (hoje ela cunha em 4 m) |
| **Tribunal** (a sala do tribunal) | juiz §9, §18 («a sala do tribunal»); juiz §2 (o júri, as urnas) | **a cadeira do juízo**, o lugar do acusado, o lugar da testemunha, a mesa do escrivão, **o relógio de água da fala medida** (sab era IV), os bancos do júri e as urnas, a plateia, a cela de espera | um cômodo do paço municipal (a administração de 16 m) e do palácio; ao ar livre na praça (o norte, a democracia) |
| **Posto da guarda** (o corpo da guarda; a estação dos vigias do fogo) | ofi §6 (o guarda; o caçador de recompensas); sab §14b («os vigias do fogo: a turma da bomba e a ronda da noite»); sab era IV (o relógio de água da vigia); juiz §22 | a mesa do chefe da guarda, o livro das ocorrências, o quadro da ronda, a arca das provas, **a tábua das recompensas**, as tochas, **a bomba de pistão e os baldes**, os catres do turno | um degrau da cadeia (12 m ou mais), ou um tipo novo |
| **Casa do carrasco e colina da forca** | carr §4 («a casa fora dos muros»), §7, §13 | a casa fora dos muros; o machado e a pedra de afiar; **a porta em que batem de noite** (carr §7); o campo dos condenados | uma casa (o tipo `house`) com a regra de fora dos muros; a colina é uma marca (marc §4b) |
| **Pelourinho** | juiz §6 («o açoite em público»); carr §4 («a exposição na praça») | o poste da praça | uma peça da praça |
| **Moinho** | coz §4; sab eras V e VI («a roda d'água girando no rio, a casa do moinho»; «as pás girando no alto do morro»); ofi (o moleiro) | a mó, a roda e a engrenagem | tipo novo, com o saber |
| **Padaria** (o forno da cidade) | coz §12 («o forno, o pão da cidade»); coz §1 | o forno grande, a gamela, a mesa de amassar, a banca do pão | tipo novo (P28) |
| **Queijaria** | coz §4; ofi (o queijeiro) | o coalho, o pano, as formas, a prateleira de curar | um cômodo do curral |
| **Lagar** | sab era IV («a prensa de parafuso no lagar»); ofi (o lagareiro); fisc §14 | a prensa, a tina, as ânforas | um prédio de apoio do vinhedo e do pomar |
| **Curtume** | caç §10 («a pele para o curtidor»); ofi (o coureiro) | as tinas de curtir | tipo novo, longe das casas |
| **Carpintaria, tanoaria, cordoaria, vidraria, alfaiataria** | ofi §6 (a oficina); fisc §14 (o tanoeiro); sab eras III e V (o vidro) | ver o §7.1 | a oficina pelo ofício do dono (C-13), ou tipos novos |
| **Estalagem da estrada, estação do correio, caravançará** | tav §8 («na estrada, a hospedaria dava cama, comida e estábulo ao viajante»); sab §14b (o correio: «as estações, os cavalos frescos»); mg §2c («a montaria e a carroça»); ofi (o caravaneiro) | os quartos, o estábulo, o pátio das carroças, a troca dos cavalos | a hospedaria fora da cidade, com o estábulo |
| **Casa de prazer** | estiv §6 («um lugar do porto, com as suas pessoas e as suas consequências… sem cenas explícitas») | — | decisão do dono |
| **Banco** | sab eras IV e V («a mesa do banqueiro, o cofre»; «o cambista na feira») | a mesa, o cofre, a balança | a mesa do cambista na feira (§6.3); o banco, um tipo da era V |
| **Sala da confraria** | fund §2.4 («a confraria do ofício na cidade»); pesca §9 («a confraria do porto») | a sala de reunião dos mestres, o lugar de julgar a peça de mestre | um cômodo da oficina do mestre mais velho (inferência) |
| **Circo** (o auriga) e **estádio, ginásio** (o atleta) | ofi §6 (a arte); glad §2 (os gregos: «o pancrácio e os jogos atléticos») | a pista, as baias de largada; a palestra | tipos novos (P39). O Campo de Pelota asteca é o teatro dele |
| **Abrigo do passo** | mont §10 («guardião do passo e do abrigo — o pedágio, o abrigo dos viajantes») | o fogo, as camas, o pedágio | tipo novo (P42) |
| **Ateliê do pintor, oficina do escultor** | marc §4, §9 | o andaime, os pigmentos, o bloco | um cômodo da oficina |
| **Mosteiro, eremitério** | ofi §6 (o monge) | — | a caverna (o eremita); o mosteiro, decisão (P38) |
| **Laboratório do alquimista** | sab era VI («o alambique de vidro e de cobre») | o alambique, os frascos | um cômodo da casa ou da oficina (P38) |
| **O mercado de gente** | pir §13; gale §1 | — | decisão do dono (o cuidado com o tema: pir §31) |
| **O refúgio pirata** | pir §16 («as cabanas, a taverna, o receptador, o carpinteiro naval») | — | é uma cidade, não um prédio: as plantas de sempre bastam |
| **A tenda de guerra** | gov §19, §20 | a mesa do mapa | é do acampamento do exército, não de uma cidade |

---

## 15. Os conflitos e as lacunas, todos juntos

### 15.1 Os conflitos (⚠)

| Código | O conflito | Com o quê | A decisão que pede |
|---|---|---|---|
| **C-1** | os burocratas morando no palácio | D-205 a D-207: só a casa de quem governa mora na sede; `K.ofCourt` tira os outros; a regra 72; a sede fora das portas da casa da cidade (`BDEF.housing`); o L-974 (o par e os pequenos) | um campo novo de camas do pessoal da sede, e quem pode morar nelas (os cargos, a guarda, os criados), pelo `act-casa.js` |
| **C-2** | a mesa do conselho de hoje é a do porto (1,2 × 0,7 m) | o pedido do dono («a mesa gigante») | uma peça nova, com os lugares e a cabeceira; e o modelo de cada povo |
| **C-3** | o tesouro do povo é `f:`, sem lugar no mundo | a sala do tesouro do palácio, as chaves (gov §19), o ladrão, a lenda do tesouro roubado (fisc §18), a regra magna | ou o tesouro passa a ter lugar num prédio (um lugar do livro), ou a sala do tesouro mostra só o que a casa de quem governa tem (`h:`) |
| **C-4** | as salas da corte existem antes da vida delas | o grupo é do P24; o governante, do P40; a regra magna proíbe enfeite sem causa | dar já uma vida pequena à sala do conselho: a reunião das decisões que o mundo já toma (`Po.decide`) |
| **C-5** | a cadeia de 8 m, sem degrau, com 4 celas | o pedido do dono; o `Escala` (o planejador); o `BDEF.cells`; os mundos prontos | uma escada de degraus para a cadeia (8, 12, 16 m) |
| **C-6** | o banquete deitado do romano e do grego | o vocabulário de usos (sentar, comer, deitar) e as poses | um lugar de uso novo (reclinar), a peça (o leito de banquete) e o clipe |
| **C-7** | o porto inteiro numa doca de 8 m | o itinerário, a alfândega, o estaleiro, o guindaste, a chamada | a escada da doca, ou os tipos novos junto dela |
| **C-8** | o trono sobre o estrado | a regra do degrau do corpo (`Space.entryFits`, o `In.BODY`) | o estrado com os degraus que o corpo sobe sem pulo |
| **C-9** | o colossal custa anos de obra | o galpão vazio (int2 §2.1: 3% do chão ocupado) | encher pelo uso: o banquete de cem, a audiência de cem, a corte |
| **C-10** | a administração de 8 m e o tribunal | o tamanho | o tribunal e o censo no paço municipal (16 m) |
| **C-11** | a coletoria de 4 m que cunha moedas | o tamanho | um degrau maior, ou a casa da moeda à parte |
| **C-12** | a maravilha (e o teatro): um tipo, cinco programas | o planejador, que ergue «a maravilha» como um tipo só | um programa por povo dentro do mesmo tipo (a forma já é por povo) |
| **C-13** | a oficina genérica para sete ofícios | o repartidor (o `workshop` não tem posto no `BDEF`) | a oficina passa a ser do ofício de quem trabalha nela, ou tipos novos |
| **C-14** | três prisões: a cadeia da lei (`v.jail`); a espera da sentença de quem governa, ao relento diante do quartel ou do cercado (o afazer `jail` do `justice.js`); o cativo de guerra, que dorme no cercado | o `crime.js`, o `justice.js`, o `villagers.js` e o `war.js` | juntar ou não. Se juntar, a cadeia nova guarda os três, cada um com a sua regra |
| **C-15** | a pena em anos, e o ano de quatro dias | o calendário (cal §5, a fase 1) | a cela que aguenta estadas longas: comer, dormir, a visita |
| **C-16** | o quartel de 8 m, sem degrau | os ofícios da luta (P33) | uma escada de degraus, ou o pátio a céu aberto como anexo |
| **C-17** | a hospedaria sem hóspede e sem estábulo | o ofício do estalajadeiro (tav §8) | o hóspede vir pelo mundo (o viajante, o mercador, o mensageiro); o estábulo ao lado |
| **C-18** | o mercado clandestino é posto de guarda | um lugar que se esconde | tirar o tipo da lista dos postos do `E.guardTask` (a lista também tem o mercado, a coletoria, os palácios e o quartel) |
| **C-19** | o banquete sem sala: nenhuma no palácio de 24 m; de 23 a 29 m² no grande e no colossal | o pedido do dono (o banquete com a mesa gigante); a forma (`forma-poder.js`) | o salão do trono como salão da festa, ou a sala nova na forma |

**E um conflito geral, com a decisão 12 e a 14 dos interiores 2.0** (o lote não cresce na taverna e nas casas). Cada degrau novo (C-5,
C-7, C-10, C-11, C-16) muda o planejador, a cidade e os mundos prontos. **O dono decide prédio por prédio.**

### 15.2 As lacunas (◻)

| Código | A lacuna | Fonte |
|---|---|---|
| **L-1** | o guarda e o caçador de recompensas sem patch no roteiro nem documento; o vigia sem prédio; os guardas só à porta | ofi §6; rot §3 |
| **L-2** | o palácio sem varanda para a multidão | gov §19 |
| **L-3** | ninguém senta no paço de uma cidade que não é a capital (o governador) | gov §5.4, §21 |
| **L-4** | a administração sem planta | int2 §2.1 |
| **L-5** | a casa da moeda | marc §3; fisc §24 |
| **L-6** | o farol | nav §15 |
| **L-7** | a torre e o cercado sem planta; o corpo não sobe na torre | — |
| **L-8** | a capitania, a tábua dos navios e o estaleiro | navios N3; ofi §6 |
| **L-9** | o pelourinho | juiz §6; carr §4 |
| **L-10** | a alfândega | fisc §6 |
| **L-11** | o mercado de gente (decisão do dono) | pir §13 |
| **L-12** | sem planta: a casa dos mergulhadores, a salga e a casa da seda | — |
| **L-13** | o estábulo da hospedaria | tav §8 |
| **L-14** | a mesa de pedra das medidas e os pesos da cidade | fisc §5 |
| **L-15** | o banco e a mesa do cambista | sab eras IV e V |
| **L-16** | ninguém guarda o armazém do povo, e ele já é roubado de noite | fisc §3 |
| **L-17** | a confraria do ofício sem lugar | fund §2.4 |
| **L-18** | o curtume | caç §10 |
| **L-19** | a oficina do engenheiro | sab §8 |
| **L-20** | a boca da mina sem planta; as galerias são do subterrâneo | min §7; sub §2 |
| **L-21** | os sacerdotes não moram no templo | — |
| **L-22** | o templo da cura e o observatório | sab §8 |
| **L-23** | a sala das antiguidades e a bancada de restaurar | arq §7, §14 |
| **L-24** | a escola | sab §8 |
| **L-25** | o campo dos condenados; o vigia do cemitério sem ofício | carr §4; saq §6 |
| **L-26** | o curral e o estábulo sem planta | — |
| **L-27** | a eira, o lagar, a queijaria e o moinho | fisc §7; sab; coz §4 |
| **L-28** | a cama do criado (a condição «servo») na casa rica e no palácio | ofi §6; gov §7 |
| **L-29** | o lugar do júri e das urnas | juiz §2 |
| **L-30** | os ofícios sem prédio (o falcoeiro, o ervanário, o alfaiate, o vidreiro, o banqueiro, o filósofo, o astrônomo, o médico, o alquimista, o pintor, o escultor, o auriga, o atleta) | §1.4 |

---

## 16. As peças, as marcas e os lugares do livro que os ofícios pedem (a lista de compras)

As peças são para o catálogo (`int-moveis.js`) e para o modelo de cada povo (`G.Movel3D`). As marcas, para a planta. Os lugares do livro,
para o `G.Depot`. A fonte de cada uma está na seção do prédio. Todas seguem a regra do material (D-440) e dizem os seus pontos de encaixe
(p23 23c).

- **O poder:**
  - **o estrado do trono**, com degraus;
  - **a mesa do conselho**, de 16 a 30 lugares, com a cabeceira;
  - **a cadeira de espaldar alto** (a cabeceira; a `cadeira` de hoje é a do dono rico da taverna);
  - **a mesa de banquete comprida** e **o leito de banquete** (o triclínio) — com um uso novo, reclinar;
  - **a galeria ou o estrado dos músicos**;
  - **a mesa do mapa**;
  - **a escrivaninha com o selo** e **a arca das cartas** (o livro do reino);
  - **a cama do criado** e o beliche do pessoal;
  - **a varanda** (uma marca «falar» sobre a multidão).
- **A lei:**
  - **a cela comum**, com o banco de pedra e **as argolas dos grilhões** — o ferro só onde há ferro;
  - **a grade de visita**;
  - **o tronco** (o cepo dos pés, inferência);
  - **a arca das provas**;
  - **o livro dos presos** e **o livro das ocorrências** (sobre a mesa);
  - **o quadro da ronda** e **a tábua das recompensas** (superfícies legíveis);
  - **o suporte das tochas**;
  - **o relógio de água**;
  - **a bomba de pistão e os baldes** (os vigias do fogo; o `balde` de hoje é o da cela);
  - **o pelourinho**;
  - **o lugar do júri e as urnas**.
- **O porto:**
  - **a tábua dos navios**;
  - **o balcão das passagens**;
  - **os cabeços de amarra**;
  - **a prancha** (uma peça entre o cais e o navio, que balança com ele);
  - **o guindaste de roda** (com os lugares dos homens dentro);
  - **os rolos de corda e a vela dobrada**;
  - **os varais de secar as redes**;
  - **a carreira do estaleiro**;
  - **a mesa da alfândega**, com a balança e a vara de sondar;
  - **a lamparina do porão**;
  - **a tábua dos recordes do cais**.
- **O comércio:**
  - **a balança de dois pratos** e **os pesos da cidade** (numa arca trancada);
  - **a mesa de pedra das medidas**, com as cavidades;
  - **a mesa do cambista**;
  - **o cofre do banqueiro**;
  - **a tábua do fiado** (uma superfície);
  - **o balcão dos hóspedes** e **o livro dos hóspedes**;
  - **o cofre dos valores**.
- **O saber e a cura:**
  - **a mesa do copista**, com o tinteiro;
  - **o catálogo da entrada**;
  - **a cadeira do mestre** e **os bancos da escola**;
  - **o globo**;
  - **o gnômon** e o relógio de sol;
  - **a vitrine das antiguidades** e **a bancada de restaurar**;
  - **a cama do doente**, **a mesa de quem cura** e **a prateleira dos remédios**;
  - **a parede do calendário** e **o teto do mapa do céu** (superfícies).
- **As oficinas:**
  - **o fole**, **o forno de fundir com os moldes**, **o cadinho**;
  - **a roda de fiar** e **a roca**, **as tinas de tingir**;
  - **o torno**, **o banco de carpinteiro**, **o cavalete**;
  - **a roda do cordoeiro**;
  - **a roda de lapidar** e **a pedra de toque**;
  - **o forno do vidro**;
  - **a prateleira da peça de mestre**.
- **A arena:**
  - **a jaula**;
  - **a grade do túnel**;
  - **a estante das armas de madeira** (os postes de treino já existem: `manequim`);
  - **o banco do vestiário**;
  - **o camarote**, que já existe no Coliseu, e o seu par na Arena do teatro romano.
- **O templo:**
  - **a arca da sacristia**;
  - **as estantes do arquivo** (a lista dos mortos);
  - **a mesa das oferendas**;
  - **a cama do sacerdote**;
  - **a porta dos autômatos**.
- **As casas:**
  - **o altar da casa** (inferência);
  - **o leito de banquete** (na casa rica);
  - **o escritório do mercador**, com o cofre;
  - **a cama do criado**.
- **A terra:**
  - **a eira**, **a prensa do lagar**, **a mó**;
  - **as formas do queijo**;
  - **as manjedouras e as baias**, **o palheiro**, **a selaria**.
- **A mina:** **o sarilho**, **o lavadouro**, **o pilão**, **a pilha das escoras**, **o monte de entulho**.
- **Os lugares do livro novos:**
  - **o tesouro do povo num prédio** (C-3);
  - **as provas do crime**;
  - **a apreensão da alfândega**;
  - **o cofre dos hóspedes**;
  - **a caixa do capataz da estiva**;
  - **as oferendas do templo** (já são `b:`);
  - **a carga comum do grupo** (`g:`, grp §3).
- **As superfícies das marcas** (marc §3, §4b), endereçáveis pela planta:
  - a parede dos rabiscos;
  - o pedestal;
  - a pedra da lei;
  - os degraus e as soleiras que se gastam;
  - a madeira do banco da galé e a pilastra do cais;
  - a parede com a linha da água.

---

## 17. As fontes e as abreviações

**Os planos** (em `god-of-the-ant-farm/planos/`):

| Abreviação | Plano | Abreviação | Plano |
|---|---|---|---|
| `gov` | `oficio-governante.md` | `juiz` | `oficio-juiz.md` |
| `carr` | `oficio-carrasco.md` | `gale` | `condicao-escravo-gale.md` |
| `estiv` | `oficio-estivador.md` | `pir` | `oficio-pirata.md` |
| `nav` | `oficio-navegador.md` | `pesca` | `oficio-pesca.md` |
| `tav` | `oficio-taverneiro.md` | `glad` | `oficio-gladiador.md` |
| `cap` | `oficio-capataz.md` | `min` | `oficio-mineiro.md` |
| `fisc` | `oficio-fiscal.md` | `bardo` | `oficio-bardo.md` |
| `caç` | `oficio-cacador.md` | `mat` | `oficio-mateiro.md` |
| `arq` | `oficio-arqueologo.md` | `tes` | `oficio-cacador-tesouros.md` |
| `saq` | `oficio-saqueador.md` | `ofi` | `oficios.md` |
| `fund` | `oficios-fundacao.md` | `per` | `pericias.md` |
| `eco` | `economia-oficios.md` | `sab` | `saber.md` (as «eras» são as tabelas do §4b) |
| `coz` | `cozinha.md` | `grp` | `grupos.md` |
| `npc` | `npcs-brainstorm.md` | `p23` | `patch23-as-vidas.md` |
| `navios` | `navios.md` | `marc` | `marcas.md` |
| `leit` | `leitura.md` | `cal` | `calendario.md` |
| `mg` | `mundo-grande.md` | `sub` | `subterraneo.md` |
| `pas` | `passado.md` | `mont` | `montanha.md` |
| `int2` | `interiores-2.md` | `rot` | `roteiro.md` |

**Os outros:**
- `CL`: o `CLAUDE.md` da raiz (as fundações).
- `JOG`: o `JOGABILIDADE.md`.
- `SOC`: o `SOCIEDADE.md`.
- `BDESC`: as descrições dos tipos no jogo (o `G.BDESC`).
- `B §2`: o relatório da planta da auditoria dos interiores 2.0 (`scratchpad/interiores/B/RELATORIO.md`).

**O código lido** (o «hoje»):
- `js/village.js` (o `G.BDEF`, o `V.bedsOf`), `js/escala.js`;
- `js/city.js`, `js/economy.js`, `js/estates.js`, `js/court.js`, `js/crime.js`, `js/harbor.js`, `js/fishers.js`, `js/waters.js`,
  `js/social.js`, `js/urban.js` (os tipos e os postos);
- `js/int-trabalho.js`, `js/int-civicos.js`, `js/int-palacio.js`, `js/int-familias.js`, `js/int-monumentos.js`, `js/int-moveis.js`,
  `js/int-quadras.js`, `js/forma-poder.js` (as plantas);
- `js/act-servicos.js`, `js/act-lazer.js`, `js/act-casa.js` (`K.reign`), `js/war.js` (`runDrill`, `Wr.penOf`), `js/justice.js`,
  `js/villagers.js` (`runSleep`), `js/civs.js` (os nomes de cada povo).

**As contas** foram feitas em Node, só de leitura, na pasta
`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/B-trab/`:
- `bdef.js`: os 56 tipos, os degraus, as formas, os postos e as plantas;
- `salas.js`: as salas da forma dos três palácios, medidas;
- `comodos.js`: os cômodos e as peças de uma planta (a cadeia, o quartel, o paço, o palácio antigo);
- `celas.js`: as celas de cada família da cadeia.
