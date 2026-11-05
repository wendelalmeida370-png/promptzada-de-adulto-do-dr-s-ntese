# God of the Ant Farm: relatório da fase de estabilização

Nesta fase não entrou nenhuma feature nova. Cada bug foi encontrado, reproduzido, corrigido na causa e testado de novo. O registro completo, bug por bug, está em `qa/AUDIT.md`, e as ferramentas de teste estão em `qa/` (veja `qa/README.md`).

## 1. Sistemas auditados

- **Núcleo:** laço principal e passo de simulação (23 módulos no passo do mundo, 13 no passo dos reinos), troca de mundo (novo jogo, carregar, voltar ao menu), avanço no tempo e velocidades, modo desenvolvedor.
- **Geração de mundo:** 5 tipos de mapa × 6 tamanhos × climas × relevos × temperamentos × 1 a 6 povos.
- **Vida:** população, genealogia, casamentos, parentesco, moradia, empregos, aprendizes, IA de tarefas, caminhos (A*), vigia anti-travamento.
- **Economia e cidades:** estoques, lojas, comida, rebanhos, comércio, carroças, cidades e lealdade.
- **Política:** regimes, estamentos, decisões, diplomacia, emissários, presentes, paz, alianças, vassalagem, secessões, revoltas, justiça e cadafalso, sociedades secretas.
- **Guerra:** tensão e causas, exércitos de campanha, batalhas, cercos, guerrilha, incursões, cativos, fuga, libertação, troca na paz, guerra mundial.
- **Mar:** pesca e tripulações reais, expedições, frotas, guerra naval, naufrágios e náufragos, colônias, conhecimento por povo.
- **Natureza:** fauna, predadores, rebanhos, bichos de estimação, ninhos, migrações, cavernas, minas, abrigo na tempestade, desabamentos.
- **Narrativa:** motor de histórias e de cenas, crônica, biografias, lendas, Livro do Mundo.
- **Interface e apresentação:** todos os painéis, câmera, giro, cinema, foto, subterrâneo, minimapa, áudio, toque no celular.
- **Persistência:** save, load, autosave, saves antigos, saves danificados, armazenamento cheio.

## 2. Bugs encontrados

São 59 bugs registrados (L-001 a L-059). Além deles:

- 12 problemas nos próprios testes (T-001 a T-012), corrigidos ou explicados;
- 6 questões de design (D-001 a D-006), anotadas como POSSÍVEL MELHORIA e não mexidas.

Situação dos 59:

- **54 corrigidos.**
- **1 não era bug:** L-005, a Peregrinação, é rara por desenho (precisa de um lugar sagrado distante). Medido: 9 sementes, 2 histórias, 2 cumpridas em 30 anos.
- **3 S4 anotados** como POSSÍVEL MELHORIA: L-021, L-023, L-035.
- **1 suspeita não confirmada:** L-043, a guerrilha que lutaria até o último homem.

## 3. Quantidade por severidade

| Severidade | Encontrados | Corrigidos | Situação dos demais |
|---|---|---|---|
| S0 — o jogo para | 2 | 2 | — |
| S1 — dado corrompido / jogo travado | 4 | 4 | — |
| S2 — sistema quebrado | 12 | 12 | — |
| S3 — comportamento errado visível | 25 | 24 | L-005 não é bug (raro por desenho) |
| S4 — menor / cosmético | 16 | 12 | 3 anotados (L-021, L-023, L-035), 1 suspeito (L-043) |
| **Total** | **59** | **54** | |

## 4. Principais causas raiz

1. **Um mundo novo herdava pedaços do anterior.** Cenas, sinais de histórias, timers da guerra, grades espaciais dos bichos, caixas do cais, brigas de taverna e cartões da interface sobreviviam a um novo jogo ou a um load (L-006, L-007, L-009, L-010, L-011, L-020). Um bicho podia fugir da gente de outro mundo, e a morte de alguém do mundo velho virava fato no novo.
2. **O save não guardava tudo, ou carregava diferente.** Os rebanhos viravam selvagens a cada load (L-003) e cada load queimava ids (L-004). O autosave falhava em silêncio com o armazenamento cheio (L-040). Um save danificado deixava o menu quebrado (L-053), um save sem o tamanho do mapa carregava num mapa de tamanho errado (L-054), e seções ou campos faltando viravam `undefined` em todo sistema (L-056, L-058).
3. **"Zero é falso".** Em `valor || 50`, um zero real virava 50: lealdade 0 nunca subia, navio com moral 0 não podia ser capturado, oráculo desacreditado aparecia com 50% (L-013 a L-016).
4. **Listas paralelas que divergiam.** "Quem está a bordo" estava gravado na pessoa e na tripulação do navio, e as duas versões se desencontravam: pescadores presos "a bordo" de barco parado, passageiros a bordo de navio que não existe mais, mortos na tripulação por décadas (L-018, L-019, L-026, L-029, L-041).
5. **"Mesma terra" no mapa não significa "chega a pé".** Prédios, penhascos e mar cortam o caminho. Uma cidade inteira passou fome a 3 passos da comida porque a frente da loja dava para o mar (L-034). Também caíam aqui fugitivos mandados a pé pelo mar, gente presa num bolsão entre prédios, mergulhadores que nunca alcançavam o recife, e um cais cujo lugar de embarque era uma casa isolada entre o cais, um penhasco e a água, onde os pescadores iam, desistiam e voltavam para sempre (L-033, L-036, L-042, L-047, L-048, L-057). Do mesmo tipo: quem a mão divina jogava a mais de 30 casas da costa não achava margem e boiava para sempre (L-055).
6. **Um erro em qualquer lugar parava o jogo inteiro.** O próximo quadro só era pedido no fim do quadro, então uma exceção congelava tudo para sempre (L-044, L-045, L-046).
7. **Efeitos únicos que se repetiam.** A tarefa reiniciava do passo 0 e o emissário entregava o presente duas vezes. Um teste falho repetia capítulos. Três sistemas mandavam emissários de paz ao mesmo tempo, e a crônica escrevia a mesma linha duas vezes no mesmo dia (L-049 a L-052, L-059).
8. **Referências a coisas que deixaram de existir.** A caverna desabada continuava abrigando bichos e a seita continuava se reunindo na taverna demolida (L-037, L-038).

## 5. Principais correções

- **Barreiras por módulo.** Cada módulo roda dentro de `G.tryRun`, e o laço principal e o avanço no tempo são protegidos. Um erro vira uma linha no console e o mundo continua. Nenhuma exceção para mais o jogo.
- **Um só lugar para trocar de mundo.** `G.newWorld` com ganchos (`G.worldHooks`): todos os módulos esquecem o mundo anterior juntos.
- **Save:**
  - rebanhos e ids preservados;
  - o autosave avisa quando falha, no máximo uma vez a cada 10 min;
  - um save danificado é recusado sem quebrar o menu;
  - prédio de tipo desconhecido é descartado no load;
  - o tamanho do mapa é lido do próprio terreno salvo;
  - seção ou campo perdido recebe o valor padrão de um mundo ou de uma pessoa nova, e o próximo id é recalculado;
  - save antigo (de antes da estabilização) carrega e continua sem erros.
- **Tripulações:** reconciliadas periodicamente; quem desembarca sai da lista; quem está em outro navio sai da lista do anterior.
- **Comida e caminhos:**
  - a loja escolhe uma frente com chão seco;
  - quem come tenta as outras lojas da cidade;
  - quem não alcança nenhuma chama o vigia, e quem está preso num bolsão é tirado de lá;
  - as buscas de caminho repetidas foram cortadas;
  - o cais só é construído onde a cidade chega a pé; quem não alcança o lugar de embarque espera o barco na porta do cais, e o peixe é descarregado de lá;
  - quem cai em mar aberto nada até a costa mais próxima, por mais longe que esteja, ou se afoga no caminho.
- **Gente fora do lugar:**
  - cativo libertado além-mar fica como hóspede num povo da sua terra, nunca é mandado a pé pelo mar;
  - quem fica sem casa na sua terra vira hóspede, escravo do inimigo ou náufrago, sempre num lugar aonde chega a pé.
- **Moradia estável:** a mãe que mora com os filhos pequenos não é despejada como "adulta solteira" (antes a família trocava de casa a cada 2,5 s).
- **Histórias:**
  - vingança sem lugar e seita sem sede não quebram mais;
  - uma história nunca repete um dos seus últimos 6 capítulos;
  - o emissário fala uma vez;
  - um só emissário com a mesma mensagem por vez, e uma só recusa de paz por dia;
  - a crônica não repete no mesmo dia uma linha que já escreveu.

## 6. Problemas de desempenho encontrados

- **L-032:** uma criança "seguindo" a mãe que estava no barco fazia uma busca de caminho completa por segundo (mais de 100 falhas seguidas). Corrigido.
- **L-033:** os mergulhadores de pérola fizeram 9 690 buscas falhas em 20 anos e nenhum mergulho. Corrigido.
- **L-042:** quem não alcançava nenhuma loja fazia 4 buscas de caminho a cada pensamento (séries de 400 a 950 falhas). Corrigido.

Medições finais:

- Passo de simulação com 40 barcos no mar: 5,2 ms (pior 56 ms).
- Mapa 192×192 com 6 povos, 30 anos: heap de 46 a 55 MB, save de 1,67 MB, nenhum erro.
- Memória ao trocar de mundo 15 vezes: plana, de 22 a 27,5 MB.
- Vida de 60 anos num arquipélago 112×112 com 4 povos: a população foi de 93 a 316, o heap de 32 a 53 MB (acompanhando a população) e o save de 0,46 a 1,33 MB. Cada ano simulado levou de 10 a 16 s em navegador sem tela.

## 7. Bugs que não puderam ser resolvidos com segurança

- **L-043, guerrilha até o último homem.** Uma única rodada não determinística mostrou um lado perdendo 117 de 118 durante uma guerrilha. Não reproduziu em 4 rodadas determinísticas nem em 4 guerrilhas forçadas, e nas regressões finais houve 0 batalhas "até o último homem". A correção está pronta (`fix6_guerrilla.py`) mas não foi aplicada: mexeria no equilíbrio da guerra sem prova de que o bug existe.
- **L-021 e L-035, mundo não 100% reproduzível pela semente.** Timers de módulos mantêm a fase entre mundos, e o áudio usa o mesmo gerador de acaso da simulação. É invisível para o jogador, mas atrapalha reproduzir bugs. A correção é de arquitetura (um gerador de acaso por sistema), não um remendo.
- **L-023:** um bicho fugindo pode cortar um trecho de água rasa. É raro e só visual.

## 8. Riscos restantes

- **Salvar no meio de um momento.** Cenas, bandos de incursão, revoltas e festivais em andamento não são salvos: ao carregar, o exército volta a "mobilizar" e a revolta some (D-001, D-002 e R1 a R4 no registro). É por desenho, mas pode parecer estranho.
- **Armazenamento do navegador.** O save chega a 1 a 1,7 MB depois de 60 anos num mapa 128 a 192. Agora o jogo avisa se o autosave falhar, mas não há como salvar além do limite do navegador.
- **Desempenho em máquina fraca.** Mapas 192 com muita gente e muitos bichos pesam mais. Os números acima são de navegador sem tela, sem desenhar.
- **Testes 8 e 9 do mar.** Dependem de a expedição sorteada achar terra nova; quando não acha, ficam inconclusivos, e isso acontece com frequência. É limitação do teste.
- **Cobertura.** O modo dev e alguns poderes muito raros foram testados por fumaça e caos aleatório, não por cenários dedicados.

## 9. Testes realizados

- **Verificador profundo de invariantes (`qa/qa.js`)** rodado em todo teste: ids, pessoas, famílias, moradia, cidades, economia, reinos, guerras, exércitos, cativos, navios, tripulações, expedições, caminhos, bichos, histórias, cenas, crônica, NaN e Infinity.
- **Regressões por tema:** os 17 cenários do mar, os 4 conjuntos de guerra (10 casos), histórias (k25), avanço no tempo (s1), mais testes dirigidos para cada bug (antes falha, depois passa).
- **Geração:** 40 mundos por rodada na matriz de tipos, tamanhos, climas e relevos.
- **Interface:** todos os painéis num mundo vivido, à procura de texto quebrado; todos os modos de câmera com quadros reais.
- **Caos:** um deus com fé infinita lançando poderes, guerras, mortes de governantes e save/load, com o verificador a cada ato.
- **Macaco:** teclas, cliques, arrastos e toques aleatórios, no PC e no celular. Também uma partida com áudio.
- **Save:** ciclos save→load→save (ponto fixo); save antigo carregado na versão nova; mais de 100 saves danificados; armazenamento cheio.
- **Demografia antes e depois** (fome, mortes, crescimento) em pares de mundos.
- **Mão divina adversarial:** pegar e soltar pessoas em estados delicados nos piores lugares.

## 10. Long-run tests

- **Lote 6, 60 anos** (arquipélago 112×112, 4 povos), com verificador e save→load a cada 10 anos: nenhum erro. Só violações S3, de 1 a 4 por checagem; antes do lote 4, a mesma vida tinha de 9 a 15. Uma única diferença de save→load: uma pessoa trocou de ofício ao recarregar, porque o load redistribui empregos.
- **Lote 6, mundos de 20 anos**, checados a cada 5 anos:
  - semente 103, istmo alpino frio;
  - semente 104, arquipélago pacífico com 5 povos;
  - semente 105, continente árido belicoso com 6 povos;
  - semente 107, ilha 64×64 com 1 povo;
  - semente 108, continente alpino com 4 povos.

  Nenhum erro e nenhuma violação S0, S1 ou S2. A ilha terminou sem nenhuma violação. O mundo da semente 105 foi rodado de novo depois do ajuste da recusa de paz e terminou os 20 anos sem nenhuma violação.
- **Código final**: 10 anos num istmo com 3 povos belicosos, com verificador e save→load: nenhum erro, só S3 (buscas de caminho falhas de crianças brincando). Todos os painéis abertos num mundo vivido: nenhum texto quebrado e nenhum painel vazio.
- **Rodadas anteriores desta fase:** 60 a 100 anos em 5 tipos de mundo (continente, arquipélago, ilha, istmo), usadas para achar os bugs dos lotes 1 a 5.
- **Save antigo:** um mundo vivido 20 anos na versão de antes da estabilização, carregado na nova e vivido mais 10 anos: nenhum erro e nenhuma violação.
- **Memória:** 15 trocas de mundo seguidas (novo jogo, load) mantêm o heap entre 22 e 27,5 MB, sem vazamento.

## 11. Stress tests

- **Mapa 192×192 com 6 povos belicosos por 30 anos:** heap de 46 a 55 MB, entre 1 000 e 1 100 bichos, save de 1,67 MB, nenhum erro.
- **40 barcos no mar ao mesmo tempo** (105 pessoas a bordo): passo de 5,2 ms, com pior caso de 56 ms, numa máquina livre. Com a máquina sobrecarregada (carga 24 em 4 núcleos), o mesmo teste subiu para 8 a 24 ms por passo. O teste de desempenho só vale em máquina livre.
- **Caos:** centenas de poderes aleatórios com fé infinita, guerras forçadas, mortes de governantes e save/load no meio, com o verificador a cada ato.
- **Macaco:** mais de 3 000 ações aleatórias (teclas, cliques, arrastos, roda e toques) em quatro rodadas, no PC (1200×800) e no celular (390×844, toque): nenhuma violação grave e nenhum erro.
- **Saves danificados:** 105 casos (cortado ao meio, sem os últimos caracteres, vazio, `null`, lixo, sem pessoas, referências penduradas, prédio de tipo desconhecido, números nulos, campos apagados, dia no futuro, e cada uma das 92 seções removida, uma de cada vez). Versão final: 17 recusados de forma limpa, 88 carregados e rodando um ano, 0 falhas.
- **Mão divina:** 40 arremessos de cativos, soldados em marcha, atores de cena, marujos, náufragos, hóspedes, governantes, emissários, fugitivos e crianças, para o mar fundo, outra ilha, o penhasco mais alto, dentro de prédios, a praça inimiga e a boca de cavernas. Uma violação, o L-055, já corrigido. Três anos depois, nenhuma violação S0 a S2, e save→load idêntico.
- **Fim do mundo:** todos morrem. O mundo vazio roda, desenha, abre painéis, avança no tempo, salva, carrega e continua pelo menu, sem erros.

## 12. Estado geral de estabilidade

**Estável.** Não sobrou nenhum bug S0, S1 ou S2 aberto.

Na bateria final (código do lote 6, com os três últimos ajustes — recusa de paz, crônica e cais — testados de forma dirigida), nenhum teste teve uma única exceção: soaks de 20 e 60 anos, 105 saves danificados, save antigo, mão divina, fim do mundo, macaco no PC e no celular, mapa 192, guerras e mar. O verificador profundo só aponta S3 leves e raros:

- sequências de buscas de caminho falhas, quase sempre crianças brincando em terreno difícil;
- uma pessoa que troca de ofício ao recarregar, porque o load redistribui empregos.

O save→load é um ponto fixo, e o jogo carrega saves de antes da estabilização.

Comparação na mesma vida de 60 anos: antes do lote 4, de 9 a 15 violações por checagem; agora, de 1 a 4, todas S3.

## 13. Recomendações antes de voltar a adicionar features

1. **Rodar `qa/` antes de cada versão**, pelo menos: um soak de 20 anos com o verificador, os 17 do mar, os 4 de guerra e o teste de saves danificados. Qualquer S0, S1 ou S2 bloqueia a versão.
2. **Um gerador de acaso por sistema** (simulação, áudio, interface), para que todo mundo seja reproduzível pela semente e todo bug possa ser repetido.
3. **Um campo de semente no modo dev** (D-004), para recriar um mundo relatado por um jogador.
4. **Uma única fonte da verdade para "quem está a bordo".** Hoje há reconciliação periódica; o ideal é a pessoa não guardar uma cópia.
5. **"Chega a pé" como pergunta de primeira classe.** Um mapa de regiões alcançáveis que considere prédios e penhascos, usado por moradia, fuga, migração e libertação, em vez de cada sistema descobrir sozinho.
6. **Salvar o estado dos momentos em andamento** (bandos, cercos, revoltas), ou pelo menos encerrá-los de forma visível ao salvar.
7. **Toda feature nova chega com o seu invariante** no verificador e com um cenário de teste.
8. **Decidir sobre L-043** com um cenário de guerrilha dedicado, e só então aplicar ou descartar a correção pronta.

## Rodada final: "agora vou tentar provar que esta build ainda está quebrada"

Nesta última rodada eu ataquei a build de propósito, procurando o que ainda quebrava. Achei e corrigi:

- **L-050 a L-052:** capítulos repetidos na vigília do inquérito; emissário que entregava o presente duas vezes; recusas de paz em dobro.
- **L-053:** save danificado que deixava o menu quebrado.
- **L-054:** save sem o tamanho do mapa, que carregava quebrado.
- **L-055:** gente boiando para sempre em mar aberto.
- **L-056 e L-058:** seções e campos perdidos que viravam `undefined`.
- **L-057:** pescadores em loop eterno num cais inalcançável. Esse bug já existia antes da estabilização; falhava em 4 versões.
- **L-059:** linhas repetidas na crônica.

Uma correção minha estava errada e foi pega pelos testes antes do commit: a primeira versão do L-054 recusava saves válidos, porque o terreno tem uma altura por vértice, (N+1)², e não por casa, N². Corrigida e confirmada com save→load idêntico.

O que tentei e não quebrou:

- save antigo;
- 105 saves danificados;
- 40 arremessos da mão divina em estados delicados;
- extinção total;
- trocas de mundo seguidas;
- mapa 192 por 30 anos;
- 60 anos seguidos;
- macaco no PC e no celular.

Falhas de teste que não são do jogo, e por que:

- **Mar #8 e #9:** precisam que a expedição sorteada ache terra nova.
- **Mar #14:** deixa o jogo rodar 0,4 s ao vivo depois de carregar. Em modo determinístico passa.
- **Mar #17:** mede tempo real e falha com a máquina sobrecarregada.
- **Guerra #7:** o resultado varia entre rodadas da mesma versão, e uma guerra pode acabar sem tratado de forma legítima (um povo cai, paz divina). Na versão final falhou uma vez no modo normal e passou no determinístico.

**Rodada final dos 17 cenários do mar**, sobre o código final antes do último ajuste do cais:

- 12 passaram, entre eles o 17 (desempenho, 5,7 ms por passo).
- As falhas foram explicadas como limitações dos testes, não do jogo (T-008, T-009, T-011, T-012).

Essa rodada também mostrou dois efeitos colaterais da minha correção do cais: uma cidade podia ficar sem cais, e o embarque podia ser interrompido pela checagem de "gente na água". Os dois foram corrigidos. Depois disso, o pescador passa nas sementes determinísticas 3 e 7, e as culturas marítimas passam no modo normal.
