# O pedido do dono — Arquitetura Monumental (4/11/2026)

> Copiado como o dono escreveu. As imagens que vieram com ele: `antes.png` (o jogo hoje: a Hipátia, 10 anos, diante do
> anfiteatro de Roma, no Modo Encarnado) e `referencia.webp` (a referência de escala que ele fez: o Coliseu por fora e por
> dentro, o palácio imperial e o salão do trono, a pirâmide asteca e o templo de dentro dela, a pirâmide e o templo egípcio,
> o teatro por fora e por dentro, a taverna — o grande salão — e a taverna por fora). Junto, sobre as três decisões que o
> líder pediu no fim do Patch 2:

«em relação a essas decisões deixo pra você decidir o que for mais legal e bacana pro propósito do jogo, além disso claude,
eu fiquei um pouco decepcionado com o aspecto de "monumentalidade" do jogo, fiz um prompt de um patch que você também deverá
fazer, ai você decide qual patch você faz primeiro, o bairros vivos ou esse que vou colar aqui agora, eu acho que seria mais
inteligente você fazer esse que vou colar aqui agora e depois o bairros vivos, mas deixo pra você decidir o que for mais
lógico pra você( afinal é você que coda e programa) vou deixar um print de como o jogo está e como eu gostaria que ele
estivesse( criei uma imagem no chatgpt pra demonstrar) aqui vai o prompt:»

---

GOD OF THE ANT FARM — PATCH: MONUMENTAL ARCHITECTURE, ARCHITECTURAL SCALE & SPATIAL GRANDEUR

1. VISÃO GERAL — O PROBLEMA QUE PRECISAMOS RESOLVER

Precisamos realizar uma atualização arquitetônica profunda em God of the Ant Farm.

O principal problema atual das edificações não é simplesmente a qualidade das texturas, dos materiais ou dos modelos 3D. É a escala arquitetônica extremamente reduzida das construções, especialmente dos edifícios públicos, monumentais, religiosos, políticos, culturais e de grande porte.

Atualmente, construções que deveriam transmitir imponência, poder, monumentalidade e grandeza parecem pequenos ambientes compactos. O Coliseu, por exemplo, não transmite a sensação de estar diante de um gigantesco anfiteatro romano. Seus espaços são pequenos, a arena não tem a dimensão esperada e não existe uma sensação convincente de escala monumental.

O mesmo problema aparece em tavernas, teatros, pirâmides, templos e outras edificações.

O resultado é uma experiência arquitetônica claustrofóbica, que compromete a imersão e diminui drasticamente o impacto visual e emocional da exploração em terceira pessoa.

Queremos transformar a arquitetura do jogo. Não queremos apenas edifícios bonitos. Queremos edifícios com escala, presença, volume, profundidade, imponência e identidade arquitetônica.

A referência visual anexada representa a direção artística e espacial desejada. Observe especialmente:

- O Coliseu: exterior gigantesco, múltiplos pavimentos, arcadas, arena ampla, arquibancadas monumentais e cobertura.
- O palácio imperial: escadarias enormes, fachadas extensas, colunas, pátios e salões internos de grande volume.
- A pirâmide asteca: uma estrutura monumental que domina a paisagem.
- O templo egípcio: fachadas colossais, obeliscos, estátuas, colunas e ambientes internos amplos.
- O teatro: palco, plateia e arquitetura com profundidade e capacidade compatíveis com um grande equipamento cultural.
- A taverna: salão principal amplo, com espaço para mesas, circulação, trabalhadores, clientes e atividades sociais.

A imagem atual do jogo, também anexada, representa o problema que precisamos superar.

Não copie literalmente os edifícios da referência. Ela serve como referência de escala, composição espacial, proporções, monumentalidade e impacto visual.

---

2. PRINCÍPIO FUNDAMENTAL: ESCALA ARQUITETÔNICA PROPORCIONAL À FUNÇÃO

Não queremos que todas as construções sejam gigantes.

Queremos que cada edificação tenha dimensões coerentes com sua função, capacidade, importância social, recursos econômicos, tecnologia, cultura e contexto histórico.

A escala deve emergir de uma lógica arquitetônica consistente.

Exemplos:

Construções residenciais

Uma residência humilde pode ser pequena, simples, apertada e construída com poucos recursos.

Uma casa de uma família rica pode ter vários cômodos, pátio, jardins, dependências, depósitos e pavimentos.

Uma residência aristocrática pode ser muito maior e mais sofisticada.

Não existe necessidade de transformar todas as casas em mansões.

Tavernas e estabelecimentos comerciais

Uma pequena taverna de bairro pode ser modesta, mas precisa ter espaço suficiente para funcionar como um estabelecimento real.

Uma grande taverna urbana, hospedaria ou estabelecimento comercial importante pode possuir:

- Salão principal espaçoso.
- Diversas mesas e áreas de convivência.
- Balcão de atendimento.
- Cozinha funcional.
- Estoques e depósitos.
- Áreas de serviço.
- Pavimentos superiores.
- Pátios externos.
- Espaços para música, apresentações e eventos, quando culturalmente apropriado.

O estabelecimento deve comportar uma quantidade plausível de clientes e funcionários.

Uma taverna não pode parecer um quarto com algumas mesas.

Edificações públicas e monumentais

Aqui precisamos de uma mudança muito mais expressiva.

Palácios, coliseus, teatros monumentais, grandes templos, pirâmides, bibliotecas importantes, museus, edifícios administrativos, monumentos e outras construções de grande relevância precisam transmitir monumentalidade.

Essas edificações devem possuir dimensões substancialmente superiores às construções residenciais comuns.

Um palácio imperial não pode ter a escala de uma casa grande.

Um Coliseu não pode parecer uma pequena arena.

Uma grande pirâmide não pode parecer um edifício compacto.

Um grande templo não pode parecer uma sala decorada.

---

3. AUDITORIA PROFUNDA DA ESCALA ATUAL

Antes de modificar qualquer coisa, investigue como o jogo determina o tamanho das construções.

Não assuma que o problema está somente nos modelos visuais.

Investigue:

1. Dimensões físicas dos edifícios no mundo.
2. Footprints e limites das construções.
3. Altura total das edificações.
4. Quantidade de pavimentos.
5. Dimensões das salas internas.
6. Altura dos tetos.
7. Largura dos corredores.
8. Dimensões de portas, escadas e passagens.
9. Proporção entre móveis, personagens e arquitetura.
10. Capacidade de ocupação.
11. Limitações dos templates procedurais.
12. Regras que determinam o tamanho máximo das construções.
13. Relação entre tamanho do edifício, riqueza, população e importância.
14. Possíveis limitações artificiais de geração.
15. Relação entre escala externa e escala interna.
16. Possíveis limitações impostas pela câmera em terceira pessoa.
17. Problemas de perspectiva, enquadramento e clipping.

Investigue especialmente se existe algum mecanismo que esteja comprimindo todas as construções em dimensões semelhantes.

Pode existir um problema estrutural: talvez o sistema esteja utilizando footprints muito pequenos, limites de dimensão excessivamente restritivos, templates compactos ou regras que impedem a geração de ambientes realmente grandes.

Precisamos descobrir a causa, e não apenas aumentar artificialmente os modelos.

Produza um diagnóstico técnico antes de implementar.

---

4. SISTEMA DE ESCALA ARQUITETÔNICA PROCEDURAL

Desenvolva ou amplie o sistema existente para permitir uma variedade muito maior de dimensões e volumes arquitetônicos.

A geração deve considerar:

- Categoria da construção.
- Função.
- Importância social.
- Riqueza do proprietário ou instituição.
- Capacidade desejada.
- População da cidade.
- Recursos disponíveis.
- Materiais de construção.
- Tecnologia.
- Cultura.
- Período histórico.
- Estilo arquitetônico.
- Geografia e disponibilidade de espaço.
- Capacidade econômica da sociedade.
- História da construção.
- Reformas e ampliações realizadas ao longo do tempo.

Uma mesma categoria pode possuir construções de escalas completamente diferentes.

Por exemplo:

- Pequeno templo rural.
- Templo urbano.
- Grande complexo religioso.
- Santuário monumental.
- Complexo religioso imperial.

Todos são templos, mas não devem compartilhar necessariamente as mesmas dimensões.

O sistema precisa permitir edifícios realmente grandes, com variação de footprint, altura, quantidade de pavimentos e complexidade interna.

Não estabeleça um limite arbitrariamente pequeno que impeça a geração de construções monumentais.

Também não gere edifícios enormes sem justificativa econômica, histórica ou funcional.

---

5. MONUMENTALIDADE EXTERNA — O EDIFÍCIO PRECISA DOMINAR A PAISAGEM

A escala externa precisa ser transformada.

Edificações importantes devem possuir presença visual proporcional à sua importância.

Considere:

- Fachadas extensas.
- Grandes volumes arquitetônicos.
- Múltiplos pavimentos.
- Torres e estruturas elevadas.
- Colunas monumentais.
- Arcadas.
- Pórticos.
- Escadarias extensas.
- Pátios.
- Praças cerimoniais.
- Jardins.
- Muros e perímetros.
- Portões monumentais.
- Estátuas e elementos escultóricos.
- Cúpulas.
- Telhados de grande dimensão.
- Terraços.
- Galerias.
- Passagens e corredores.
- Elementos de ornamentação arquitetônica.

A composição deve respeitar o estilo histórico e cultural.

Um Coliseu romano precisa parecer um anfiteatro romano.

Um templo egípcio precisa ter sua própria linguagem arquitetônica.

Uma pirâmide mesoamericana precisa possuir sua volumetria, plataformas, escadarias e organização espacial características.

Um palácio medieval não deve parecer um palácio romano.

Não utilize uma arquitetura genérica e apenas altere texturas.

A identidade arquitetônica precisa estar na geometria, nas proporções, na volumetria e na organização espacial.

---

6. INTERIORES MONUMENTAIS — O TAMANHO EXTERNO PRECISA CONTINUAR POR DENTRO

Este é um dos requisitos mais importantes de todo o patch.

Não adianta criar um edifício gigantesco por fora e manter um interior minúsculo.

O interior precisa possuir uma escala compatível com o exterior e com a função arquitetônica.

Queremos entrar em uma construção e perceber sua verdadeira dimensão.

Isso significa:

- Salões amplos.
- Tetos altos.
- Colunas de sustentação proporcionais.
- Grandes distâncias entre elementos estruturais.
- Corredores largos.
- Escadarias monumentais.
- Átrios.
- Pátios internos.
- Galerias.
- Salas de grande capacidade.
- Múltiplos pavimentos.
- Mezaninos.
- Sacadas.
- Varandas.
- Câmaras internas.
- Áreas de circulação e serviço.
- Espaços cerimoniais.
- Áreas funcionais de trabalho.

Não transforme todos os interiores em uma sequência de pequenas salas.

Grandes edifícios precisam ter espaços abertos e volumosos, com uma organização arquitetônica que transmita sua função.

6.1. Volume vertical

Aumente significativamente a variedade de alturas internas.

Um salão do trono pode ter um pé-direito gigantesco.

Um templo pode possuir uma nave monumental.

Uma arena pode ter arquibancadas com vários níveis.

Um teatro pode ter uma plateia elevada, galerias e grandes espaços de circulação.

Uma biblioteca importante pode possuir salões altos e estantes de grande porte.

A altura deve ser uma dimensão real da construção, e não apenas um efeito visual.

6.2. Continuidade espacial

Quando o jogador entra em uma construção, precisa perceber que está dentro daquele mesmo edifício.

Não pode existir uma discrepância absurda entre a dimensão externa e o interior.

Não crie a sensação de que uma construção gigantesca possui um interior minúsculo.

Também não utilize dimensões internas mágicas ou inexplicavelmente maiores do que o espaço externo, salvo quando a própria ontologia do mundo justificar isso explicitamente.

A volumetria deve ser coerente.

---

7. EDIFICAÇÕES PRIORITÁRIAS PARA AVALIAÇÃO E IMPLEMENTAÇÃO

Faça uma auditoria abrangente de todas as categorias existentes, mas utilize as seguintes como casos de referência.

7.1. Coliseu e anfiteatros

O Coliseu precisa ser uma das demonstrações mais impressionantes da monumentalidade arquitetônica do jogo.

Precisamos de:

- Fachada externa gigantesca.
- Múltiplos níveis de arcadas.
- Arena ampla.
- Arquibancadas extensas.
- Grande capacidade de espectadores.
- Corredores de circulação.
- Entradas e saídas.
- Acessos aos diferentes níveis.
- Áreas subterrâneas e bastidores, quando apropriado.
- Áreas de preparação de participantes.
- Espaços para animais.
- Áreas de serviço.
- Estruturas de cobertura compatíveis com a cultura e tecnologia.

A arena precisa ser suficientemente grande para comportar combates, animais, apresentações e eventos reais.

O jogador deve conseguir olhar para as arquibancadas e perceber a escala do equipamento.

7.2. Palácios e edifícios governamentais

Um palácio imperial deve possuir:

- Fachada monumental.
- Escadarias extensas.
- Pórticos.
- Pátios cerimoniais.
- Salões de recepção.
- Salão do trono.
- Salas administrativas.
- Dependências privadas.
- Corredores.
- Jardins.
- Áreas de serviço.
- Espaços para guardas e funcionários.

O salão do trono deve possuir proporções realmente monumentais.

A experiência de entrar em um palácio precisa ser diferente de entrar em uma residência comum.

7.3. Pirâmides e complexos religiosos

Pirâmides precisam ser estruturas monumentais, não pequenos edifícios com formato piramidal.

Considere:

- Grandes plataformas.
- Múltiplos níveis.
- Escadarias extensas.
- Terraços.
- Fachadas ornamentadas.
- Pátios cerimoniais.
- Santuários.
- Câmaras internas.
- Corredores.
- Áreas de oferenda.
- Espaços para sacerdotes.
- Áreas de peregrinação.

Pirâmides egípcias e mesoamericanas precisam possuir geometrias e funções arquitetônicas distintas.

Não confunda suas tradições arquitetônicas.

7.4. Templos

Templos importantes precisam possuir:

- Fachadas imponentes.
- Pórticos.
- Grandes portas.
- Colunas.
- Naves.
- Altares.
- Salões cerimoniais.
- Câmaras internas.
- Pátios.
- Áreas de circulação.
- Dependências sacerdotais.
- Espaços de armazenamento.
- Áreas de preparação ritual.

Um templo monumental deve produzir uma experiência espacial diferente de um pequeno santuário.

7.5. Teatros

Os teatros precisam possuir escala compatível com sua capacidade.

Considere:

- Palco amplo.
- Plateia com múltiplos níveis.
- Arquibancadas.
- Galerias.
- Camarins.
- Bastidores.
- Áreas de preparação.
- Acessos.
- Corredores.
- Espaços para músicos e artistas.

O teatro precisa comportar espetáculos reais, atores, músicos e espectadores.

7.6. Tavernas e grandes estabelecimentos

A taverna não precisa ser monumental como um palácio, mas precisa deixar de parecer um cômodo apertado.

Considere diferentes escalas:

- Pequena taverna de bairro.
- Taverna urbana.
- Grande hospedaria.
- Estabelecimento comercial de grande porte.

Um grande salão precisa comportar mesas, bancos, clientes, funcionários, músicos, circulação e atividades sociais simultâneas.

A cozinha, os depósitos, o balcão e as áreas de serviço devem possuir espaço suficiente para funcionar.

7.7. Outras categorias

Não limite a atualização aos exemplos anteriores.

Avalie também:

- Museus.
- Bibliotecas.
- Banhos públicos.
- Quartéis.
- Fortificações.
- Castelos.
- Mercados cobertos.
- Armazéns.
- Portos.
- Estações e estruturas de transporte.
- Edifícios administrativos.
- Universidades.
- Grandes oficinas.
- Complexos industriais.
- Monumentos.
- Grandes residências.
- Edificações funerárias.
- Observatórios.
- Centros culturais e religiosos.

Cada categoria deve possuir uma escala e uma organização espacial adequadas.

---

8. ESCALA HUMANA E EXPERIÊNCIA EM TERCEIRA PESSOA

A monumentalidade só funciona se a escala humana estiver correta.

Investigue a proporção entre:

- Personagens.
- Portas.
- Janelas.
- Móveis.
- Escadas.
- Colunas.
- Corredores.
- Tetos.
- Fachadas.
- Objetos arquitetônicos.

Não basta aumentar o edifício se os personagens continuarem parecendo desproporcionais.

O jogador deve perceber visualmente a diferença entre uma pessoa e uma construção monumental.

Também audite:

- Campo de visão.
- Distância da câmera.
- Enquadramento.
- Culling.
- Clipping.
- Ocultação de geometria.
- Transições entre ambientes.
- Visibilidade dos espaços internos.
- Comportamento da câmera em grandes salões.

A câmera não pode destruir a percepção de escala.

Quando o jogador estiver diante de uma construção monumental, deve conseguir observar sua altura, extensão e composição arquitetônica.

Quando entrar, deve conseguir apreciar a dimensão do ambiente sem que a câmera fique constantemente colidindo com paredes ou tetos.

---

9. CAPACIDADE FUNCIONAL E OCUPAÇÃO DOS ESPAÇOS

A escala precisa ter consequências reais para a simulação.

Um edifício maior deve poder comportar mais pessoas, mais atividades e mais funções, quando sua finalidade justificar isso.

Integre as dimensões com os sistemas existentes de:

- Capacidade de ocupação.
- Navegação.
- Pathfinding.
- Rotinas dos NPCs.
- Atividades.
- Trabalho.
- Interações.
- Eventos.
- Estoques.
- Economia.
- Serviços.
- Segurança.
- Animações.
- Persistência.

Exemplos:

Um Coliseu gigantesco precisa comportar uma multidão de espectadores.

Um grande palácio precisa permitir circulação de funcionários, guardas, visitantes, aristocratas e autoridades.

Um grande templo precisa comportar sacerdotes, fiéis e cerimônias.

Uma taverna ampla precisa permitir que diferentes grupos de NPCs ocupem mesas, conversem, comam, bebam e circulem.

Não adianta criar um salão gigantesco que continua comportando apenas três NPCs por limitações artificiais de capacidade.

A arquitetura precisa ter consequências funcionais.

---

10. CONSISTÊNCIA ENTRE VISÃO DE DEUS E TERCEIRA PESSOA

A construção precisa representar o mesmo edifício nas duas perspectivas.

No modo Deus, o jogador deve visualizar a construção monumental em sua totalidade.

Na terceira pessoa, deve poder explorar seus ambientes internos e compreender sua organização.

Não crie uma fachada gigantesca com interior genérico.

Não crie um interior monumental desconectado do volume externo.

Não altere arbitrariamente a posição, a geometria ou a dimensão dos edifícios quando o jogador se aproxima.

Preserve a continuidade da realidade.

A definição espacial autoritativa do edifício deve sustentar:

- Footprint.
- Geometria externa.
- Pavimentos.
- Alturas.
- Paredes.
- Portas.
- Escadas.
- Corredores.
- Salas.
- Mobiliário.
- Navegação.
- Colisões.
- Pontos de interação.
- Capacidade.
- Propriedade.
- Estado histórico.

As duas perspectivas devem derivar da mesma estrutura arquitetônica.

---

11. PERFORMANCE E ESCALABILIDADE

A atualização não pode destruir a performance do jogo.

Edificações monumentais exigem cuidado com:

- Quantidade de polígonos.
- Instancing.
- LOD.
- Occlusion culling.
- Frustum culling.
- Carregamento de ambientes.
- Gestão de interiores.
- Quantidade de objetos.
- Iluminação.
- Sombras.
- Navegação.
- Quantidade de NPCs.

Utilize soluções adequadas para grandes construções sem sacrificar sua qualidade visual.

É importante diferenciar simplificação de geometria distante de redução artificial do tamanho real da construção.

O edifício continua monumental mesmo quando sua representação distante utiliza LOD.

A transição de qualidade não pode alterar sua escala percebida.

---

12. ARQUITETURA PROCEDURAL E VARIEDADE

A atualização deve fortalecer a arquitetura procedural existente.

Não queremos que todos os edifícios de uma mesma categoria tenham dimensões idênticas.

Precisamos de variação real.

Uma cidade pode possuir:

- Pequenos templos.
- Templos urbanos.
- Grandes complexos religiosos.
- Palácios modestos.
- Palácios imperiais.
- Pequenas tavernas.
- Grandes estabelecimentos.
- Teatros locais.
- Grandes teatros públicos.

A escala deve ser determinada de maneira procedural e coerente.

A geração deve preservar identidade cultural e histórica.

Não implemente uma solução que funcione apenas para Roma, Egito ou uma cidade específica.

A arquitetura precisa funcionar em diferentes épocas, civilizações, biomas, tecnologias e níveis de desenvolvimento.

---

13. COMPATIBILIDADE COM O MUNDO EXISTENTE

Este patch precisa respeitar a arquitetura central de God of the Ant Farm.

Não crie um sistema paralelo de construções.

Não duplique a geração de interiores.

Não substitua sistemas funcionais existentes sem necessidade.

Não destrua construções, saves, propriedades, atividades, relações ou dados históricos.

Não faça o mundo inteiro reconstruir suas edificações arbitrariamente a cada carregamento.

Quando houver necessidade de atualizar edifícios já existentes, desenvolva uma estratégia de migração ou regeneração determinística e segura.

Preserve:

- Identidade das construções.
- Proprietários.
- Ocupantes.
- Atividades.
- Estoques.
- Histórico.
- Estado de conservação.
- Relações econômicas.
- Eventos associados.
- Persistência.

Uma atualização arquitetônica não pode apagar a história de uma construção.

---

14. PLANEJAMENTO DE EXECUÇÃO E USO DE AGENTES

Você tem autonomia para decidir quantos agentes especializados devem participar desta atualização.

Não utilize agentes em excesso por padrão.

Primeiro, analise a complexidade do trabalho e identifique os domínios realmente independentes.

Você pode utilizar, por exemplo, agentes especializados em:

- Auditoria da geração procedural e escala.
- Arquitetura externa e volumetria.
- Interiores e continuidade espacial.
- Navegação, colisões e experiência em terceira pessoa.
- Performance e otimização.
- Testes e validação.

Esses são exemplos de possíveis especializações, não uma quantidade obrigatória.

Antes de implementar:

1. Examine o repositório e a arquitetura existente.
2. Identifique os sistemas responsáveis pela geração de edifícios.
3. Localize os limites e parâmetros que restringem a escala.
4. Identifique dependências entre geometria externa, interiores, navegação e simulação.
5. Determine quais partes podem ser auditadas ou implementadas em paralelo.
6. Defina as responsabilidades dos agentes.
7. Estabeleça uma estratégia de integração.
8. Defina os testes necessários.
9. Apresente um planejamento de execução.

Otimização de tokens

Planeje o uso de contexto e tokens com eficiência.

- Evite que vários agentes leiam repetidamente o repositório inteiro.
- Compartilhe apenas os arquivos e informações necessários.
- Evite investigações redundantes.
- Centralize decisões arquiteturais.
- Não delegue tarefas sem escopo claro.
- Utilize paralelismo quando houver independência real.
- Reserve a integração e revisão final para uma etapa coordenada.
- Não sacrifique a qualidade técnica apenas para reduzir tokens.

Você tem liberdade para escolher a quantidade de agentes que considera ideal, inclusive trabalhar sem agentes adicionais quando isso for mais eficiente.

A prioridade é obter o melhor resultado possível com o menor desperdício de contexto, tempo e tokens.

Não comece uma implementação extensa sem antes compreender as dependências arquiteturais.

---

15. IMPLEMENTAÇÃO EM ETAPAS

Organize a atualização em etapas que permitam validar a qualidade antes de expandir a solução.

Etapa 1 — Diagnóstico

Audite os sistemas atuais, identifique a origem do problema e apresente as limitações encontradas.

Etapa 2 — Fundação de escala

Implemente os mecanismos necessários para permitir construções com dimensões, alturas, volumes e capacidades muito maiores.

Etapa 3 — Arquitetura externa

Atualize a geração de fachadas, volumes, pavimentos, elementos estruturais e composição monumental.

Etapa 4 — Arquitetura interna

Garanta que os interiores correspondam à dimensão e à função das construções externas.

Etapa 5 — Navegação e funcionalidade

Valide a circulação dos NPCs e do jogador nos novos espaços.

Etapa 6 — Integração com a simulação

Conecte dimensões, capacidade, atividades, eventos e ocupação aos sistemas existentes.

Etapa 7 — Otimização

Revise performance, LOD, carregamento, iluminação e renderização.

Etapa 8 — Validação abrangente

Teste diferentes categorias, escalas, culturas e contextos históricos.

---

16. TESTES DE ACEITAÇÃO — NÃO CONSIDERE O PATCH CONCLUÍDO SEM ELES

Precisamos de testes concretos.

Teste A — Coliseu

Gerar um anfiteatro monumental e verificar:

- Dimensão externa.
- Altura.
- Quantidade de níveis.
- Dimensão da arena.
- Capacidade das arquibancadas.
- Circulação.
- Acessibilidade.
- Consistência entre interior e exterior.
- Experiência visual em terceira pessoa.

Teste B — Palácio

Verificar se existe diferença inequívoca entre uma residência comum e um palácio imperial.

O palácio precisa possuir volumes, salões, pátios, escadarias e dimensões significativamente superiores.

Teste C — Pirâmides

Comparar pirâmides egípcias e mesoamericanas.

Verificar se ambas possuem escala monumental e identidades arquitetônicas distintas.

Teste D — Templo

Comparar um pequeno santuário com um grande complexo religioso.

A diferença de escala precisa ser perceptível.

Teste E — Teatro

Verificar palco, plateia, galerias, bastidores, circulação e capacidade de espectadores.

Teste F — Taverna

Verificar se um estabelecimento de grande porte possui salão realmente amplo, espaço de serviço, mesas, clientes e circulação.

Teste G — Habitações

Verificar se pequenas casas continuam pequenas e se construções residenciais de famílias ricas podem apresentar dimensões maiores.

Teste H — Diversidade cultural

Verificar se a solução funciona em pelo menos três contextos culturais e históricos distintos.

Teste I — Experiência real

Entrar fisicamente nas construções em terceira pessoa.

Não considere suficiente validar somente os dados geométricos ou as dimensões no código.

É necessário verificar a experiência espacial.

---

17. CRITÉRIO VISUAL FINAL

O teste mais importante é simples:

Quando o jogador olha para uma construção monumental, ela precisa parecer monumental. Quando entra nela, precisa sentir sua dimensão.

O Coliseu precisa impressionar.

O palácio precisa transmitir poder.

O templo precisa transmitir grandiosidade religiosa.

A pirâmide precisa dominar a paisagem.

O teatro precisa parecer um grande equipamento cultural.

A taverna precisa parecer um estabelecimento vivo e funcional, com dimensões compatíveis com sua categoria.

E uma pequena casa precisa continuar parecendo uma pequena casa.

Não queremos gigantismo indiscriminado. Queremos escala arquitetônica coerente, diversidade, identidade e monumentalidade.

---

18. RELATÓRIO FINAL

Ao concluir, apresente:

1. Diagnóstico original do problema.
2. Causas técnicas identificadas.
3. Sistemas e arquivos modificados.
4. Arquitetura da solução implementada.
5. Agentes utilizados e justificativa da quantidade.
6. Estratégia de otimização de contexto e tokens.
7. Categorias arquitetônicas atualizadas.
8. Melhorias de escala externa.
9. Melhorias de escala interna.
10. Melhorias de navegação e funcionalidade.
11. Resultados dos testes.
12. Limitações que ainda persistem.
13. Evidências visuais do resultado, sempre que possível.

Não declare uma categoria como concluída se apenas sua fachada foi ampliada.

Não declare os interiores concluídos sem verificar sua volumetria e acessibilidade.

Não declare o patch completo apenas porque o código compila.

O objetivo é transformar God of the Ant Farm em um mundo no qual a arquitetura tenha verdadeira presença física, escala civilizacional e impacto visual.
