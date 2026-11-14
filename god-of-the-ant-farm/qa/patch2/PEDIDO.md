# O pedido do dono — Patch 2 (texto integral)

> claude, presta atenção, assim que você acabar as tarefas que você tá concluindo, você vai convocar alguns agentes no poder máximo de raciocínio do opus 5.5( no maior possível, o opus 5.5 max), ai você decide quantos agentes serão necessários, mas penso em talvez de 3 a 4 agentes, pra poder começar o "patch 2" dessa atualização que vai seguir as diretrizes do prompt seguinte:

# GOD OF THE ANT FARM — PATCH 2
# LIVING BUILDINGS: INTEGRAÇÃO SISTÊMICA, VIDA INTERIOR E FIDELIDADE ARQUITETÔNICA

## MISSÃO PRINCIPAL

Implemente o Patch 2 do sistema de construções e interiores do God of the Ant Farm.

A primeira implementação estabeleceu a representação procedural dos interiores. Agora, o objetivo é evoluir essa fundação para que os edifícios deixem de ser espaços predominantemente visuais e passem a funcionar como partes integrantes da simulação persistente do mundo.

O patch possui quatro objetivos inseparáveis:

1. **Integração sistêmica dos interiores:** as atividades econômicas, familiares, sociais, profissionais, religiosas, culturais e outras precisam acontecer dentro dos edifícios apropriados.
2. **Coerência da vida cotidiana:** NPCs devem ocupar, utilizar e abandonar os espaços de acordo com suas identidades, necessidades, horários, empregos, relações, decisões e circunstâncias.
3. **Correção da geometria e da navegação:** resolver escadas inacessíveis, portas mal posicionadas, porões inviáveis, desníveis e outros problemas de usabilidade espacial.
4. **Fidelidade arquitetônica entre as perspectivas:** a construção vista na visão de Deus deve corresponder à mesma construção vista na perspectiva encarnada, preservando sua identidade arquitetônica, suas proporções e suas características estruturais.

Não trate este patch como uma simples atualização estética. Ele deve conectar arquitetura, simulação, economia, agentes, navegação, animações, interações, persistência e apresentação visual.

---

# PARTE 1 — AUDITORIA OBRIGATÓRIA DO PROJETO EXISTENTE

Antes de modificar o código, inspecione a implementação atual e identifique:

- Como os edifícios são definidos, gerados, identificados e persistidos.
- Como a visão de Deus representa as construções.
- Como os modelos, geometrias e interiores são produzidos na perspectiva encarnada.
- Como os NPCs são simulados, localizados e movimentados.
- Como famílias, relações, empregos, necessidades e rotinas são representados.
- Como funcionam a economia, os inventários, a produção, o consumo e o transporte.
- Como os edifícios são associados a atividades profissionais e sociais.
- Como funcionam a navegação, a colisão, as escadas, as portas e a transição entre exterior e interior.
- Como o sistema determina a hora, o dia, as condições ambientais e os eventos do mundo.
- Quais sistemas de salvamento e carregamento precisam preservar as novas funcionalidades.

Identifique quais elementos já existem e podem ser integrados, quais estão parcialmente implementados e quais realmente precisam ser criados.

**Não crie um segundo sistema de simulação de NPCs, famílias, economia ou atividades apenas para fazer os interiores parecerem vivos.** Integre os edifícios aos sistemas autoritativos existentes.

Preserve as funcionalidades já implementadas. Não reescreva toda a arquitetura do jogo sem necessidade. Não substitua uma solução funcional por uma implementação paralela mais simples.

Depois da auditoria, estabeleça um plano de implementação e execute o patch de forma incremental, verificando cada etapa.

# PARTE 2 — PRINCÍPIO CENTRAL: EDIFÍCIOS SÃO LUGARES ONDE A VIDA ACONTECE

Todo edifício funcional deve participar da simulação do mundo, de acordo com sua finalidade, cultura, época, localização, proprietários, ocupantes, recursos disponíveis e estado histórico.

O interior não pode existir apenas como um cenário que o jogador visita.

Ele deve ser um espaço no qual agentes reais do mundo podem morar, trabalhar, descansar, produzir, consumir, negociar, cooperar, celebrar, praticar atividades culturais ou religiosas e realizar outras ações coerentes com o local.

A arquitetura precisa ter uma relação funcional com as atividades que acontecem nela.

Exemplos:

- Uma casa abriga seus moradores e oferece espaços para dormir, descansar, preparar alimentos, armazenar pertences e realizar atividades domésticas compatíveis com seu contexto.
- Uma olaria possui áreas e equipamentos adequados à preparação da argila, moldagem, secagem, queima, armazenamento e movimentação dos tijolos, conforme a tecnologia disponível.
- Uma taverna possui trabalhadores, clientes, atendimento, mesas, consumo, estoque, pagamentos e movimentação de mercadorias, conforme seu modelo econômico.
- Uma oficina abriga artesãos, ferramentas, materiais, operações de fabricação e produtos em diferentes estágios de produção.
- Um armazém recebe, guarda e libera mercadorias, respeitando sua capacidade e suas operações logísticas.
- Um templo possui espaços, objetos, agentes e atividades coerentes com sua tradição religiosa e seu contexto histórico-cultural.
- Um anfiteatro ou Coliseu possui áreas de circulação, arquibancadas, espaços de apresentação e bastidores funcionais compatíveis com sua arquitetura e com os eventos realizados.
- Um mercado abriga vendedores, compradores, mercadorias, negociação e circulação econômica.
- Um quartel possui ocupantes, áreas de descanso, equipamentos, treinamento e outras funções pertinentes.
- Um edifício abandonado apresenta um estado compatível com sua história, podendo estar vazio, deteriorado, parcialmente ocupado ou reutilizado.

Esses exemplos não devem ser implementados como exceções isoladas e rígidas. Utilize os sistemas reutilizáveis existentes ou crie abstrações compatíveis com a arquitetura do projeto para permitir que diferentes tipos de edifícios suportem atividades diversas.

## Regra de coerência

A finalidade declarada de um edifício precisa corresponder ao seu funcionamento real.

Se o mundo identifica uma construção como olaria, sua representação interna não pode ser apenas uma sala genérica com uma mesa. Deve haver infraestrutura, objetos, atividades e operações compatíveis com a produção de tijolos.

Se o mundo identifica um edifício como taverna, não basta colocar mesas e cadeiras: é necessário integrar as pessoas, o atendimento e as operações econômicas relevantes.

A riqueza funcional deve ser proporcional ao tipo, à escala, à tecnologia e ao estado do edifício. Não exija que cada construção execute todas as atividades possíveis; exija que ela execute bem as atividades que justificam sua existência.

# PARTE 3 — CASAS E VIDA FAMILIAR PERSISTENTE

Esta é uma das prioridades mais importantes do patch.

## 3.1. Ocupação real das residências

Se uma residência pertence ou está associada a determinada família, seus membros devem ser capazes de ocupar e utilizar o interior de maneira coerente com o estado real do mundo.

Quando o jogador entrar em uma casa durante a noite e a família estiver em casa, deverá encontrar seus integrantes realizando atividades compatíveis com seus estados e suas circunstâncias.

Isso pode incluir:

- Adultos dormindo ou se preparando para dormir.
- Crianças dormindo, descansando ou realizando atividades adequadas à idade.
- Moradores ainda acordados, conversando, comendo, cuidando de tarefas domésticas ou utilizando espaços comuns.
- Um familiar descansando enquanto outro trabalha fora.
- Um familiar trabalhando em casa enquanto os demais estão ausentes.
- Moradores temporariamente ausentes por trabalho, viagens, obrigações, conflitos ou outros acontecimentos.
- Familiares doentes, feridos, enlutados ou em outras condições que afetem sua rotina.

Os exemplos não são regras fixas. A ocupação deve decorrer da simulação.

**Não teletransporte automaticamente toda a família para casa quando o jogador entrar. Não force todos os membros a dormir só porque é noite.** O horário influencia o comportamento, mas a rotina deve considerar empregos, necessidades, acontecimentos, preferências e circunstâncias individuais.

## 3.2. Rotinas familiares e distribuição de atividades

Integre as residências aos sistemas existentes de:

- Identidade individual e pertencimento familiar.
- Relações entre os moradores.
- Trabalho e compromissos profissionais.
- Sono, descanso, alimentação e outras necessidades já modeladas.
- Deslocamento entre residência e local de trabalho.
- Responsabilidades domésticas e cuidado de crianças, quando compatíveis com o sistema de simulação.
- Condições físicas, acontecimentos e alterações na rotina.
- Propriedade, ocupação e disponibilidade dos cômodos.

As rotinas devem ser dinâmicas. Um trabalhador pode sair de casa para trabalhar, permanecer no estabelecimento durante seu turno e retornar depois. Outra pessoa da mesma família pode permanecer em casa, sair para trabalhar em outro local ou realizar outras atividades.

Se uma pessoa não estiver em casa, deve haver uma explicação compatível com sua atividade ou situação, não uma ausência provocada pela falta de integração do interior.

## 3.3. Mobiliário com função real

Sempre que possível, camas, cadeiras, mesas, fogões, áreas de armazenamento e outros objetos devem possuir funções reconhecidas pelos sistemas de interação e comportamento.

Um NPC que precisa dormir deve conseguir localizar uma cama apropriada, navegar até ela, executar a interação necessária e atualizar seu estado de maneira coerente.

Uma animação de sono não deve ser reproduzida em uma posição incompatível com a cama. Uma cadeira não deve ser ocupada através de geometria ou colisão que torne a interação impossível.

Se o edifício não possuir espaço ou mobiliário suficiente, o comportamento deve lidar com essa limitação sem criar objetos silenciosamente ou violar a geometria existente.

## 3.4. Presença e ausência com causalidade

A ocupação de uma residência deve ser independente da presença do jogador.

Se a família estiver em casa quando o jogador está distante, essa ocupação precisa continuar existindo na simulação. A aproximação deve materializar a situação coerente com o estado autoritativo.

Da mesma forma, se um morador estiver trabalhando em outro lugar, entrar na casa não pode fazer o NPC reaparecer no interior.

A simulação distante pode resumir atividades domésticas, desde que preserve os estados, os acontecimentos e as informações necessárias para reconstruir uma representação próxima consistente.

# PARTE 4 — EDIFÍCIOS ECONÔMICOS E CADEIAS PRODUTIVAS

Priorize a integração efetiva de olarias, tavernas, oficinas, mercados, armazéns e outros estabelecimentos relevantes já presentes no projeto.

## 4.1. Olaria: exemplo de integração vertical

A olaria deve servir como um teste de ponta a ponta para demonstrar que os interiores estão realmente integrados à economia.

Dependendo dos sistemas e da tecnologia representados no jogo, o estabelecimento deve suportar etapas pertinentes como:

1. Disponibilidade e recebimento de argila e outros insumos necessários.
2. Preparação dos materiais.
3. Moldagem dos tijolos.
4. Secagem e preparação para a queima.
5. Utilização de forno ou infraestrutura equivalente.
6. Consumo de combustível e outros recursos necessários.
7. Produção de tijolos com quantidade e estado verificáveis.
8. Resfriamento, armazenamento e organização dos produtos.
9. Transporte ou venda da produção.
10. Pagamento, salários, custos e resultados econômicos quando aplicáveis.

Não implemente necessariamente todas as etapas como minijogos manuais. NPCs podem executar as operações automaticamente, enquanto o jogador pode observar, interagir, trabalhar, supervisionar ou administrar, conforme as capacidades existentes do jogo.

A profundidade da interação deve ser sustentada pelo sistema real. Se uma etapa não possui mecânica implementada, não a represente como se estivesse plenamente funcional.

## 4.2. Taverna: atividade social e econômica

Uma taverna deve ter um ciclo de funcionamento coerente com seus recursos e sua clientela.

Integre, conforme aplicável:

- Proprietário, gerente, atendentes, cozinheiros ou outros trabalhadores.
- Clientes que chegam, escolhem espaços, fazem pedidos, consomem e saem.
- Estoques de alimentos, bebidas e outros produtos compatíveis com a cultura e a época.
- Preparação, entrega e consumo dos produtos.
- Pagamentos, receitas, custos e remuneração.
- Horários de funcionamento, disponibilidade de trabalhadores e demanda.
- Conversas, relações sociais e acontecimentos emergentes.
- Falta de produtos, fechamento, interrupções e outras consequências econômicas.

Não gere clientes infinitos apenas para preencher mesas. A demanda deve ser compatível com população, localização, preços, disponibilidade, reputação e demais fatores existentes no jogo.

Se não houver demanda, o estabelecimento pode estar vazio. Isso é diferente de não possuir qualquer sistema de funcionamento.

## 4.3. Outras atividades econômicas

Identifique os demais tipos de estabelecimentos presentes no mundo e priorize sua integração conforme a importância e a infraestrutura existente.

Considere, quando aplicável:

- Ferreiros e oficinas de fabricação.
- Carpintarias e marcenarias.
- Mercados e lojas.
- Armazéns e portos.
- Padarias e cozinhas.
- Fazendas e instalações de processamento agrícola.
- Minas e áreas de processamento mineral.
- Hospedarias.
- Oficinas têxteis.
- Estabelecimentos administrativos ou de serviços.

Não presuma que todos esses tipos já existem no código. Primeiro identifique os edifícios realmente suportados pelo projeto e trabalhe sobre eles.

As operações devem respeitar os mesmos estoques, propriedades, capacidades, contratos, trabalhadores e regras econômicas utilizados pelo restante do mundo.

## 4.4. Integração econômica autoritativa

Uma atividade econômica não pode existir apenas como animação.

Uma operação produtiva deve consumir os insumos pertinentes e produzir resultados reais. Uma venda deve alterar o estoque e registrar o pagamento. Uma entrega deve transferir mercadorias de maneira consistente. Um trabalhador remunerado deve obedecer às regras salariais existentes.

Evite contabilizar a mesma operação tanto no simulador distante quanto no sistema detalhado do estabelecimento.

As operações precisam ter identidade, estado e efeitos verificáveis, com proteção contra duplicação, perda ou reaplicação indevida durante transições de resolução, interrupções e carregamentos.

# PARTE 5 — TEMPLOS, ANFITEATROS E EDIFÍCIOS CULTURAIS

Edifícios monumentais e culturais precisam combinar fidelidade arquitetônica com atividades coerentes.

## 5.1. Templos e espaços religiosos

O interior deve refletir a tradição cultural, a tecnologia, a época, a finalidade e a arquitetura do edifício.

Conforme o contexto, isso pode incluir áreas de culto, altares, objetos cerimoniais, espaços de reunião, responsáveis pelo local, visitantes e atividades religiosas.

Não transforme todos os templos de todas as culturas em variações da mesma sala genérica.

As atividades devem ser culturalmente contextualizadas e sustentadas pelos sistemas existentes. Não presuma a presença de uma religião, cerimônia ou personagem específico sem fundamento no contexto representado pelo mundo.

## 5.2. Coliseu e anfiteatros

O Coliseu precisa preservar sua identidade monumental tanto na visão de Deus quanto na perspectiva encarnada.

Sua estrutura interna deve ser compatível com a arquitetura do edifício, incluindo, conforme a representação implementada:

- Arena.
- Arquibancadas.
- Entradas e circulações.
- Acessos às áreas de serviço.
- Espaços de bastidores e preparação.
- Áreas funcionais associadas a apresentações e combates.
- Capacidade e circulação de público.
- Acessos verticais e transições entre níveis.

Quando houver eventos, os agentes e as atividades devem ocupar os espaços adequados. Gladiadores, combatentes, trabalhadores, organizadores e espectadores só devem aparecer quando houver uma situação ou evento que justifique sua presença.

Não gere uma multidão permanente sem considerar capacidade, horários, demanda, eventos e estado do edifício.

## 5.3. Outros edifícios monumentais

Audite também as estruturas monumentais presentes no projeto, incluindo, se existentes:

- Pirâmides egípcias.
- Pirâmides e templos mesoamericanos, incluindo estruturas astecas.
- Partenon e outras construções gregas.
- Outros anfiteatros, monumentos, edifícios públicos ou estruturas históricas.

A geometria interna deve refletir a tipologia real representada pelo modelo externo. Nem todo monumento precisa ter o interior integralmente acessível ou explorável, mas qualquer acesso oferecido pelo jogo deve levar a uma estrutura espacial coerente com a construção.

Não crie salas ou passagens incompatíveis com a estrutura apenas para aumentar artificialmente a área explorável.

# PARTE 6 — FIDELIDADE ARQUITETÔNICA ENTRE A VISÃO DE DEUS E A VISÃO ENCARNADA

Esta é uma prioridade visual e estrutural crítica.

Atualmente, algumas construções aparentemente apresentam uma identidade arquitetônica na visão de Deus e outra na perspectiva encarnada. O patch precisa eliminar essa divergência.

## 6.1. Uma identidade arquitetônica autoritativa

Sempre que a arquitetura do projeto permitir, as duas perspectivas devem derivar da mesma definição arquitetônica autoritativa, ou de representações explicitamente vinculadas a ela.

Essa definição deve preservar, conforme aplicável:

- Tipo e identidade do edifício.
- Planta, footprint e orientação.
- Dimensões e proporções.
- Volumetria e silhueta.
- Número e disposição dos pavimentos.
- Paredes, colunas, pilares, arcos e estruturas principais.
- Entradas, portas, janelas e acessos.
- Telhado e elementos estruturais.
- Materiais e características arquitetônicas.
- Escadas, corredores, galerias e circulação interna.
- Relação espacial entre interior e exterior.

A visão de Deus pode utilizar uma representação simplificada e otimizada. Entretanto, a simplificação precisa preservar as características estruturais essenciais e não pode ocultar uma geometria incompatível com a construção que será apresentada ao jogador.

## 6.2. O problema do Coliseu

O Coliseu visto na visão de Deus pode possuir uma representação monumental e visualmente convincente, mas, se a perspectiva encarnada apresenta apenas um amontoado de blocos ou uma pirâmide genérica, há uma falha na identidade arquitetônica entre as duas perspectivas.

Corrija a causa estrutural desse problema.

Não tente resolvê-lo apenas com texturas, materiais, iluminação ou decoração. A forma arquitetônica, a volumetria, as proporções, os arcos, as fachadas e a organização dos espaços precisam ser coerentes.

A perspectiva encarnada não precisa reproduzir todos os detalhes distantes com fidelidade absoluta, mas deve representar a mesma construção reconhecível.

## 6.3. Auditoria de edifícios prioritários

Inspecione e corrija, no mínimo, os seguintes casos quando estiverem presentes na implementação:

1. Coliseu e outros anfiteatros.
2. Pirâmides egípcias.
3. Pirâmides e templos mesoamericanos, incluindo estruturas astecas.
4. Partenon e outros edifícios gregos.
5. Olaria.
6. Residências.
7. Tavernas.
8. Templos.
9. Outros edifícios que apresentem discrepâncias relevantes.

A lista é uma exigência de auditoria, não uma afirmação de que todos os modelos já existem ou possuem o mesmo defeito.

Para cada edifício, compare a representação externa e a interna, identifique a origem da discrepância e corrija a geometria ou o mapeamento responsável.

Não transforme a auditoria em uma sequência de correções visuais isoladas sem resolver as causas compartilhadas.

## 6.4. Variações arquitetônicas legítimas

Não force todos os edifícios de uma categoria a utilizarem o mesmo modelo genérico.

Preserve variações coerentes com cultura, período histórico, tecnologia, materiais, escala, riqueza, função e história.

Duas olarias podem possuir arquiteturas diferentes, desde que ambas mantenham as características estruturais necessárias às suas funções. Uma casa modesta e uma residência de elite não precisam compartilhar a mesma planta ou volumetria.

A diversidade deve emergir de parâmetros e regras arquitetônicas legítimos, não de divergências acidentais entre as perspectivas.

# PARTE 7 — CORREÇÃO DE ESCADAS, PORTAS, PORÕES E NAVEGAÇÃO

Execute uma auditoria sistemática da geometria e da acessibilidade dos interiores.

Não se limite a corrigir apenas os exemplos observados durante os testes. Procure a causa geradora dos defeitos e adicione validações para impedir que voltem a aparecer.

## 7.1. Portas e entradas

Corrija situações em que:

- A porta fica acima do nível do terreno e exige um salto indevido.
- A entrada termina em uma parede ou em um espaço sem acesso.
- A porta se abre para o vazio ou para uma superfície bloqueada.
- O personagem não consegue atravessar a abertura.
- A geometria da porta entra em conflito com a colisão.
- O ponto de entrada não corresponde à posição real da construção.
- A entrada interior e a saída exterior não correspondem espacialmente.

A soleira deve se relacionar corretamente com o terreno, o piso interno, os degraus e o sistema de navegação.

Se um desnível exigir uma escada ou rampa, ela deve ser gerada de maneira coerente e transitável, respeitando as restrições arquitetônicas e o terreno.

## 7.2. Escadas

Corrija escadas que:

- Surgem em posições inacessíveis.
- Começam ou terminam dentro de paredes, móveis ou outros obstáculos.
- Não conectam efetivamente os pavimentos.
- Possuem inclinação, altura ou geometria incompatível com a navegação.
- Não possuem espaço suficiente para entrada, saída ou giro do personagem.
- Não correspondem aos pontos de navegação.
- Não conectam a posição inferior à superior de forma contínua.

Verifique a acessibilidade real por meio de navegação e movimentação do personagem, não apenas pela inspeção visual.

## 7.3. Porões e níveis subterrâneos

Porões só devem existir quando forem coerentes com a tipologia, a estrutura e o contexto do edifício.

Quando gerados, devem possuir:

- Acesso físico válido.
- Escadas ou outras formas de entrada e saída coerentes.
- Espaço navegável suficiente.
- Colisão e limites espaciais corretos.
- Conexão válida com o restante do edifício.
- Compatibilidade com o terreno e com os sistemas de navegação.

Não gere um porão inacessível apenas porque a configuração procedural o selecionou. Quando as condições espaciais não permitirem um porão válido, utilize uma alternativa arquitetônica coerente.

## 7.4. Validação geométrica automatizada

Implemente verificações apropriadas à tecnologia existente para identificar:

- Portas sem conexão válida entre exterior e interior.
- Escadas sem conexão navegável entre os níveis.
- Pavimentos desconectados.
- Pontos de entrada acima ou abaixo dos limites toleráveis do piso.
- Colisões bloqueando passagens obrigatórias.
- Caminhos de navegação inexistentes entre acessos e áreas funcionais.
- Móveis que bloqueiam os pontos de interação essenciais.
- Elementos que ultrapassam indevidamente os limites do edifício.
- Interiores que não correspondem ao footprint ou à topologia arquitetônica definida.

A validação precisa distinguir falhas reais de escolhas arquitetônicas legítimas. Uma área restrita ou um cômodo deliberadamente inacessível não é necessariamente um bug.

Sempre que possível, utilize testes automatizados, visualizações de depuração e relatórios por edifício para localizar as falhas.

# PARTE 8 — INTEGRAÇÃO COM OS TRÊS NÍVEIS DE RESOLUÇÃO

Este patch precisa respeitar o princípio de que o mundo possui uma única realidade autoritativa, com diferentes níveis de resolução.

## 8.1. Simulação distante

Famílias, trabalhadores, clientes, atividades produtivas, eventos e estados dos edifícios continuam evoluindo de acordo com os sistemas de simulação distante existentes.

Não é necessário executar todas as animações ou interações físicas individualmente enquanto o edifício está distante. É necessário preservar os estados e as consequências causais relevantes.

## 8.2. Simulação próxima

Quando o jogador se aproxima, os NPCs, as atividades e os ambientes devem ser materializados de acordo com o estado já estabelecido.

A aproximação não pode criar trabalhadores, clientes, mercadorias, famílias ou eventos arbitrários apenas para preencher o interior.

A simulação próxima pode refinar os detalhes que não foram individualizados anteriormente, desde que respeite os fatos e os resultados já estabelecidos.

## 8.3. Simulação incorporada

Quando o jogador entra e interage com o edifício, as ações físicas e sociais devem utilizar o mesmo estado autoritativo.

O jogador pode participar de atividades, negociar, trabalhar, observar, conversar e modificar o mundo, mas os resultados precisam ser integrados à economia, às entidades e aos registros da simulação.

## 8.4. Teste de continuidade

Para cada tipo de edifício implementado, teste pelo menos uma sequência na qual:

1. O edifício e seus ocupantes evoluem enquanto o jogador está distante.
2. O jogador se aproxima e observa a situação.
3. O jogador entra e interage com o espaço.
4. O jogador sai e se afasta novamente.
5. O tempo continua transcorrendo.
6. O jogador retorna.
7. O mundo é salvo e carregado, quando aplicável.

Verifique que moradores, trabalhadores, estoques, operações, móveis, acessos, danos e atividades continuam coerentes em todas as etapas.

# PARTE 9 — ANIMAÇÕES, INTERAÇÕES E COMPORTAMENTO FUNCIONAL

Os interiores precisam ter vida observável, mas não artificial.

Os NPCs devem utilizar os objetos e os espaços de maneira compatível com suas atividades.

Exemplos:

- Um oleiro realiza ações coerentes com a etapa de produção em que está trabalhando.
- Um cliente utiliza um espaço de atendimento e consome produtos quando a transação correspondente é realizada.
- Um trabalhador transporta materiais entre áreas funcionalmente conectadas.
- Um morador utiliza uma cama para dormir quando sua rotina e seu estado justificam essa ação.
- Um funcionário de um estabelecimento atende clientes quando possui a função e as condições necessárias.
- Participantes de um evento ocupam áreas compatíveis com seus papéis.
- Visitantes de um templo utilizam os espaços apropriados às atividades representadas.

Não é necessário desenvolver animações exclusivas para todas as ações desde o primeiro momento. Reutilize o sistema de animação e as interações existentes, mas não represente uma ação incompatível apenas para preencher o ambiente.

Quando não houver animação específica, prefira uma representação simples e coerente ou uma atividade não visual adequadamente simulada, em vez de uma animação enganosa.

As interações precisam respeitar alcance, navegação, disponibilidade do objeto, estado do NPC, condições da atividade e consequências reais.

# PARTE 10 — DETERMINISMO, PERSISTÊNCIA E COMPATIBILIDADE

As correções devem respeitar os princípios de persistência do mundo.

- Não regenere aleatoriamente um interior a cada entrada.
- Não altere a identidade arquitetônica do edifício ao alternar perspectivas.
- Não redefina a ocupação ou o inventário ao materializar um espaço.
- Preserve reformas, danos, objetos persistentes e alterações relevantes.
- Não duplique atividades econômicas durante transições.
- Preserve compatibilidade com edifícios e saves já existentes sempre que possível.

Quando a nova versão exigir dados adicionais, implemente migrações compatíveis e seguras. Utilize valores padrão determinísticos e coerentes para edifícios antigos.

Se algum save apresentar uma configuração inválida, prefira uma correção conservadora e verificável a uma reconstrução destrutiva.

Não apague o histórico de um edifício para resolver um defeito de geração. Não regenere toda a cidade quando o problema puder ser corrigido localmente.

# PARTE 11 — PLANO DE IMPLEMENTAÇÃO DO PATCH

Execute o patch por etapas, priorizando integração sistêmica e correção estrutural.

### Etapa A — Auditoria e diagnóstico

- Identifique os sistemas existentes.
- Reproduza os defeitos conhecidos.
- Catalogue as discrepâncias arquitetônicas.
- Identifique as causas compartilhadas dos problemas de navegação.
- Determine quais sistemas de NPCs, economia e atividades podem ser reutilizados.

### Etapa B — Fundação da integração

- Conecte edifícios aos sistemas autoritativos de atividades, agentes, inventários e persistência.
- Estabeleça os pontos de entrada, os vínculos espaciais e as capacidades funcionais necessárias.
- Evite criar sistemas paralelos de comportamento ou economia.

### Etapa C — Vertical slice de vida cotidiana

Implemente e valide completamente, no escopo já suportado pelo projeto:

1. Uma residência com moradores reais e rotinas coerentes.
2. Uma olaria com atividade produtiva funcional.
3. Uma taverna com trabalhadores, clientes e operações econômicas.

Esses três exemplos validam necessidades diferentes: vida familiar, produção material e atividade social-comercial.

Não considere a etapa concluída apenas porque os NPCs aparecem dentro dos edifícios. As atividades precisam funcionar e produzir consequências reais.

### Etapa D — Correções arquitetônicas prioritárias

- Corrija o Coliseu e os demais monumentos problemáticos existentes.
- Corrija pirâmides, Partenon e outras estruturas identificadas na auditoria.
- Elimine divergências entre a representação externa e a encarnada.
- Corrija portas, escadas, porões e problemas de acessibilidade.
- Adicione verificações para evitar regressões.

### Etapa E — Expansão funcional

Expanda a integração para outros tipos de edifícios efetivamente existentes, priorizando aqueles que possuem maior relevância para a economia, a vida familiar, a cultura e as atividades do mundo.

### Etapa F — Validação de regressões

Execute os testes de geometria, navegação, persistência, economia, ocupação, transição entre níveis e consistência arquitetônica.

Não declare uma etapa concluída sem verificar o comportamento implementado.

Se o escopo completo não puder ser finalizado em uma única execução, entregue primeiro uma fundação funcional e fatias verticais realmente completas. Registre explicitamente o que foi concluído, o que permanece parcial e quais dependências impedem a conclusão do restante.

# PARTE 12 — CRITÉRIOS DE ACEITAÇÃO

O Patch 2 será considerado bem-sucedido quando os seguintes critérios forem demonstrados:

**Vida familiar**
- Uma residência ocupada pode conter seus moradores em atividades coerentes com seus estados e rotinas.
- A ausência de um familiar possui uma explicação compatível com a simulação.
- O jogador não provoca a criação, o teletransporte ou a reinicialização arbitrária dos moradores ao entrar.

**Atividade econômica**
- A olaria realiza operações produtivas reais, com insumos, trabalho e resultados verificáveis.
- A taverna pode ter trabalhadores e clientes, com consumo e transações coerentes.
- Estoques, pagamentos e operações não são duplicados ao mudar de resolução.

**Fidelidade arquitetônica**
- Coliseu, pirâmides, Partenon e outros edifícios existentes mantêm identidade reconhecível nas duas perspectivas.
- A representação encarnada não substitui estruturas monumentais por volumes genéricos incompatíveis.
- As correções preservam as características estruturais necessárias ao interior funcional.

**Geometria e navegação**
- Portas e entradas são transitáveis e se relacionam corretamente com o terreno.
- Escadas conectam os níveis pretendidos.
- Porões gerados são acessíveis e navegáveis.
- Os pontos de interação essenciais podem ser alcançados.
- As validações detectam os principais defeitos sem rejeitar indevidamente soluções arquitetônicas válidas.

**Continuidade e persistência**
- As atividades e os estados dos edifícios persistem quando o jogador se afasta e retorna.
- Salvar e carregar não reinicia indevidamente interiores, moradores ou operações.
- A materialização visual corresponde ao estado autoritativo do mundo.

**Qualidade de implementação**
- Os sistemas existentes são reutilizados sempre que apropriado.
- Não são introduzidos sistemas paralelos desnecessários.
- Os testes relevantes são executados e seus resultados são documentados.
- As funcionalidades parciais são identificadas como parciais, sem serem apresentadas como concluídas.

# RELATÓRIO FINAL OBRIGATÓRIO

Ao concluir o trabalho, apresente:

1. Diagnóstico dos problemas encontrados.
2. Causas técnicas identificadas.
3. Arquivos e sistemas modificados.
4. Funcionalidades efetivamente implementadas.
5. Correções arquitetônicas e de navegação realizadas.
6. Testes executados e seus resultados.
7. Problemas conhecidos e funcionalidades ainda parciais.
8. Próximos passos recomendados.

A prioridade não é fazer todos os edifícios parecerem ocupados artificialmente. É fazer com que cada edifício tenha uma função real, coerente e persistente no mundo.

**O objetivo final é que o jogador entre em uma construção e encontre não apenas um interior bonito, mas uma parte viva da mesma sociedade que continua existindo quando ele vai embora.**




# GOD OF THE ANT FARM — PATCH 2
# ADENDO: EXPERIÊNCIAS JOGÁVEIS, INTERATIVIDADE UNIVERSAL E INTEGRAÇÃO SISTÊMICA DOS EDIFÍCIOS

## 1. Objetivo fundamental

Evolua o sistema de construções e interiores do God of the Ant Farm para que os edifícios do mundo deixem de ser apenas estruturas visualmente convincentes e passem a oferecer experiências funcionais, interativas e coerentes com suas respectivas finalidades.

O jogador deve poder participar da vida que acontece dentro das construções. Isso inclui atividades domésticas, econômicas, profissionais, sociais, culturais, religiosas, administrativas, militares, recreativas e quaisquer outras pertinentes aos tipos de edifícios efetivamente existentes no projeto.

**A exigência é universal: todos os edifícios relevantes devem ser avaliados e integrados de acordo com sua função. Nenhuma categoria pode ser esquecida simplesmente porque outras receberam exemplos mais detalhados.**

O objetivo não é criar algumas experiências excepcionais em poucos edifícios. É estabelecer uma fundação sistêmica capaz de transformar o conjunto das construções do mundo em lugares onde o jogador pode fazer coisas significativas.

Uma residência deve permitir atividades domésticas. Uma oficina deve permitir interações com sua produção. Um estabelecimento comercial deve oferecer serviços e operações econômicas. Um templo deve comportar atividades compatíveis com sua função cultural e religiosa. Um espaço de espetáculo deve permitir participação nos eventos que nele acontecem. Uma instalação militar deve oferecer as atividades que justificam sua existência no mundo.

Esses são exemplos do princípio geral, não uma lista fechada de edifícios nem uma ordem para implementar apenas os casos citados.

## 2. Auditoria universal de edifícios e atividades

Antes de implementar novas interações, inspecione o projeto e catalogue todas as categorias de edifícios efetivamente suportadas, incluindo suas variantes arquitetônicas, funções, equipamentos, instalações e sistemas associados.

Para cada categoria identificada, determine:

- Qual é sua função no mundo simulado?
- Quais atividades acontecem normalmente nesse local?
- Quais NPCs trabalham, moram, circulam ou prestam serviços ali?
- Quais objetos e instalações possuem função prática?
- Quais ações o jogador deveria poder executar?
- Quais recursos, mercadorias, ferramentas ou serviços estão envolvidos?
- Quais animações, deslocamentos e interações físicas são necessários?
- Quais atividades dependem da participação de outros personagens?
- Quais resultados econômicos, sociais, físicos ou históricos devem ocorrer?
- Quais condições determinam a disponibilidade de cada atividade?
- Quais sistemas existentes já suportam essas ações?
- Quais funcionalidades estão completas, parciais ou são apenas visuais?

Produza uma matriz de cobertura que relacione cada categoria de edifício às suas atividades, aos sistemas necessários e ao estado de implementação.

Essa matriz deve incluir todas as categorias relevantes encontradas no projeto. Não se limite aos exemplos deste prompt e não exclua edifícios porque parecem mais difíceis de integrar.

Quando uma categoria possuir múltiplas funções legítimas, avalie todas elas. Quando uma mesma atividade puder ocorrer em diferentes tipos de edifício, procure reutilizar sua implementação sem eliminar as particularidades de cada contexto.

Não invente categorias que não existem no projeto como se já estivessem implementadas. Novas categorias podem ser propostas separadamente, mas a prioridade é completar a integração do conteúdo já existente.

## 3. Objetos e espaços devem oferecer interações coerentes

Durante a auditoria, identifique os objetos, móveis, equipamentos, instalações e espaços que deveriam oferecer possibilidades reais de ação ao jogador.

Um objeto importante para a função do edifício não deve ser considerado funcional apenas porque possui um modelo visual.

Por exemplo, quando presentes no projeto:

- Camas devem permitir dormir ou descansar quando as condições forem adequadas.
- Bancadas e ferramentas de oficinas devem permitir atividades relacionadas ao trabalho executado ali.
- Equipamentos produtivos devem participar das operações correspondentes.
- Balcões comerciais devem permitir interações com os serviços e produtos oferecidos.
- Assentos devem permitir sentar-se e levantar-se adequadamente.
- Instalações de banho devem permitir sua utilização quando estiverem funcionais e disponíveis.
- Portas, escadas e mecanismos devem cumprir suas funções espaciais e interativas.
- Equipamentos de treinamento devem permitir atividades compatíveis com sua finalidade.
- Instrumentos musicais devem participar de apresentações quando houver suporte para essa atividade.
- Altares, espaços cerimoniais e outros elementos culturais devem integrar as atividades pertinentes ao contexto representado.
- Estruturas de transporte e movimentação de cargas devem permitir as operações logísticas que lhes correspondem.

A lista é ilustrativa. Descubra as necessidades equivalentes de todos os demais objetos relevantes presentes no jogo.

Para cada interação, defina os pré-requisitos, o alcance, a navegação, os estados de execução, as animações, os recursos necessários e os resultados observáveis.

Não torne todos os elementos decorativos obrigatoriamente interativos. A prioridade são os objetos e espaços que representam funções centrais, atividades esperadas ou oportunidades relevantes de participação.

## 4. Atividades jogáveis específicas de cada edifício

Cada categoria de edifício deve oferecer um conjunto coerente de atividades que reflita sua função real no mundo.

A quantidade e a profundidade das interações podem variar conforme a importância, a complexidade e os sistemas suportados por cada categoria. Entretanto, nenhuma categoria relevante deve permanecer predominantemente decorativa quando deveria oferecer atividades funcionais.

### 4.1. Residências e edifícios domésticos

Permita que o jogador utilize os espaços e objetos domésticos apropriados, interaja com os moradores e participe de atividades compatíveis com o ambiente.

Integre essas possibilidades às rotinas familiares, às necessidades, aos relacionamentos, à ocupação dos cômodos e ao estado persistente da residência.

### 4.2. Edifícios econômicos e profissionais

Permita que o jogador participe das atividades produtivas, comerciais e logísticas pertinentes a cada estabelecimento.

Isso pode envolver fabricação, preparação de materiais, transporte, armazenamento, compra, venda, negociação, atendimento, gestão ou execução de serviços, conforme a função do edifício e os sistemas disponíveis.

### 4.3. Edifícios sociais, recreativos e de serviços

Permita que o jogador usufrua dos serviços e participe das atividades oferecidas nesses locais.

Exemplos incluem alimentação, hospedagem, descanso, entretenimento, apresentações, jogos ou outros serviços que realmente existam no contexto do estabelecimento.

### 4.4. Edifícios religiosos, culturais e cerimoniais

Implemente interações compatíveis com a finalidade, a tradição cultural, a arquitetura e as atividades representadas.

Evite transformar todos esses edifícios em interiores genéricos. A experiência precisa refletir as diferenças reais entre as categorias e os contextos culturais existentes no mundo.

### 4.5. Edifícios militares, administrativos e públicos

Quando essas categorias existirem no projeto, permita a participação nas atividades pertinentes, como treinamento, acesso a serviços, interação com funcionários, gestão de operações ou participação em acontecimentos públicos.

### 4.6. Monumentos, arenas e espaços de espetáculo

Permita que o jogador explore os espaços acessíveis e participe das atividades que realmente acontecem neles, incluindo a possibilidade de assistir a eventos quando houver eventos disponíveis.

A experiência deve respeitar a arquitetura, a capacidade, os acessos, os agentes e o estado real do local.

**Essas categorias são pontos de partida para a auditoria, não limites para o sistema.** O Claude Code deve identificar e contemplar todas as demais categorias relevantes presentes no projeto.

## 5. Exemplos concretos para validar a qualidade

Os casos abaixo ilustram o nível de funcionalidade esperado. Devem ser implementados e corrigidos, mas não devem receber tratamento exclusivo nem substituir a auditoria universal.

### Exemplo A — Termas romanas

Se o projeto contém termas com banheiras ou piscinas de banho, o jogador deve conseguir utilizar as instalações funcionais.

A experiência pode incluir aproximar-se, entrar na água, posicionar-se corretamente, realizar a atividade de banho ou relaxamento e sair sem problemas de colisão ou navegação.

A atividade deve respeitar a geometria, a profundidade representada, as animações, a disponibilidade do estabelecimento e as regras econômicas ou sociais aplicáveis.

### Exemplo B — Taverna

Se o projeto contém uma taverna funcional, o jogador deve poder interagir com seus serviços, adquirir produtos disponíveis, realizar pagamentos corretos, consumir itens e utilizar o mobiliário apropriado.

Quando houver músicos ou apresentações, deve ser possível acompanhá-los de maneira coerente. A presença de clientes, trabalhadores, produtos e eventos deve decorrer da simulação real.

### Exemplo C — Coliseu ou outro espaço de espetáculo

Quando houver um evento válido, o jogador deve poder acessar uma área de espectadores e acompanhar o acontecimento.

Os participantes, as animações e os resultados precisam estar ligados ao sistema real de eventos e, quando aplicável, ao sistema de combate. Não basta reproduzir uma cena visual desconectada da simulação.

### Exemplo D — Olaria ou instalação produtiva

O jogador deve poder interagir com as atividades produtivas que o estabelecimento realmente suporta, utilizando ferramentas, equipamentos e recursos adequados.

Quando participar da produção, os insumos consumidos e os produtos obtidos devem corresponder ao trabalho efetivamente realizado.

### Exemplo E — Demais edifícios existentes

Aplique o mesmo padrão de análise a todas as outras categorias identificadas na auditoria.

Para cada edifício, determine uma experiência jogável apropriada à sua finalidade, evitando copiar indiscriminadamente as interações de outras categorias.

Não considere esta seção uma lista exaustiva de implementações. Ela demonstra como o princípio universal deve ser aplicado.

## 6. Integração real com a economia e os sistemas do mundo

As atividades do jogador não podem existir como minijogos isolados, desconectados da simulação.

Sempre que aplicável, elas devem utilizar os sistemas autoritativos de:

- Inventário e propriedade.
- Recursos, matérias-primas e produtos.
- Estoques e capacidades de armazenamento.
- Dinheiro, preços, pagamentos e transações.
- Produção, consumo e transformação de materiais.
- Empregos, remuneração e operações profissionais.
- Contratos, ordens de trabalho e transporte.
- Ocupação dos espaços e disponibilidade dos objetos.
- Necessidades, condições físicas e relações sociais.
- Eventos e consequências persistentes.

Uma compra deve alterar corretamente os recursos envolvidos. Uma atividade produtiva deve consumir os insumos pertinentes e gerar resultados verificáveis. Um serviço deve respeitar sua disponibilidade. Uma operação de transporte deve transferir os recursos reais envolvidos.

Se o jogador participar de uma atividade que já estava sendo executada por um NPC, determine se sua ação substitui, complementa ou altera a operação existente. Não contabilize duas vezes o mesmo trabalho ou resultado.

Quando uma mecânica ainda não existir, implemente a fundação necessária se ela fizer parte do escopo do patch. Caso contrário, documente a limitação sem apresentar a atividade como plenamente funcional.

## 7. Um sistema reutilizável de atividades, não uma coleção de exceções

Construa sobre os sistemas de interação existentes e amplie-os de maneira reutilizável.

As atividades podem precisar de definições para:

- Condições de disponibilidade.
- Objetos e pontos de interação.
- Requisitos espaciais e de navegação.
- Participantes e papéis dos NPCs.
- Recursos, itens, pagamentos e custos.
- Animações, movimentação e áudio.
- Estados de execução, conclusão e interrupção.
- Resultados e consequências persistentes.
- Compatibilidade com os diferentes níveis de resolução da simulação.

Utilize abstrações compatíveis com a arquitetura do projeto. Não é obrigatório adotar classes ou nomes específicos se os sistemas existentes já oferecem uma solução adequada.

O objetivo é permitir que novas atividades sejam implementadas sem reconstruir toda a infraestrutura de interação para cada edifício.

Entretanto, reutilização não significa uniformidade artificial. As atividades precisam preservar as diferenças de função, cultura, época, tecnologia, arquitetura e contexto.

## 8. Qualidade das interações físicas e animações

Uma atividade só deve ser considerada funcional quando o jogador consegue executá-la de maneira consistente.

Verifique:

- Acesso ao ponto de interação.
- Distância e orientação do personagem.
- Compatibilidade com colisões e navegação.
- Animações adequadas à ação.
- Ocupação e disponibilidade do objeto.
- Transição entre movimentação normal e interação.
- Possibilidade de cancelar ou interromper a ação.
- Retorno seguro ao controle normal do personagem.
- Atualização correta do estado do mundo.
- Ausência de sobreposições, teletransportes ou bloqueios indevidos.

Não utilize animações genéricas que contradigam a ação representada.

Uma atividade não precisa de uma animação exclusiva para cada variante desde o primeiro momento, mas deve utilizar uma representação coerente e compatível com a mecânica.

## 9. Integração com os NPCs e a continuidade do mundo

O jogador deve poder participar das atividades sem interromper artificialmente a vida dos demais agentes.

Os NPCs precisam respeitar a ocupação dos espaços, a disponibilidade dos objetos, os compromissos existentes e as regras da atividade.

A presença do jogador não pode gerar clientes, trabalhadores, recursos, eventos ou oportunidades de maneira arbitrária.

Da mesma forma, a entrada no edifício não deve reinicializar seus ocupantes ou suas operações. Os resultados devem permanecer coerentes quando o jogador sair, se afastar, trocar de personagem ou retornar posteriormente.

As atividades devem respeitar os três níveis de resolução da simulação: distante, próximo e incorporado. A interação direta do jogador precisa ser integrada à mesma realidade autoritativa utilizada pelos NPCs e pela economia.

## 10. Priorização sem negligenciar categorias

O trabalho deve seguir uma estratégia que equilibre profundidade e cobertura.

### Etapa 1 — Auditoria abrangente

Catalogue todas as categorias relevantes e suas atividades esperadas. Identifique as lacunas funcionais, os objetos sem interação, as falhas de navegação e as dependências sistêmicas.

### Etapa 2 — Fundação compartilhada

Implemente ou corrija os componentes reutilizáveis necessários para suportar atividades completas, incluindo interação física, estados de execução, recursos, consequências e persistência.

### Etapa 3 — Cobertura funcional de todas as categorias

Defina um conjunto mínimo de atividades essenciais para cada categoria relevante. Nenhuma categoria deve ser esquecida enquanto apenas algumas recebem implementações aprofundadas.

### Etapa 4 — Fatias verticais completas

Escolha representantes de diferentes famílias de edifícios e conclua suas experiências de ponta a ponta. Inclua atividades domésticas, econômicas, sociais, culturais e outras identificadas na auditoria.

As termas, a taverna, o Coliseu e a olaria devem integrar essa cobertura quando presentes no projeto, mas não devem monopolizar o trabalho nem receber prioridade automática sobre todas as demais categorias.

### Etapa 5 — Expansão da profundidade

Depois de estabelecer a cobertura funcional, aprofunde as atividades, animações, interações e possibilidades de participação em todas as categorias, conforme sua importância e complexidade.

### Etapa 6 — Testes e regressões

Valide as atividades, a persistência, a economia, a navegação, a coerência arquitetônica e as transições entre níveis de resolução.

Se não for possível concluir todo o escopo de uma vez, registre explicitamente a cobertura já alcançada e o trabalho restante. Não declare o sistema universalmente completo quando apenas uma parcela dos edifícios estiver funcional.

## 11. Testes e critérios de aceitação

Para cada categoria de edifício, valide que:

1. As atividades essenciais da categoria foram identificadas.
2. Os objetos e espaços relevantes oferecem as interações previstas.
3. O jogador consegue alcançar e executar as ações implementadas.
4. As animações e os comportamentos correspondem às ações realizadas.
5. Os pré-requisitos e as condições de disponibilidade são respeitados.
6. Os recursos, pagamentos e resultados são atualizados corretamente quando aplicáveis.
7. As atividades produzem consequências reais, em vez de apenas mensagens ou animações.
8. Os NPCs continuam coerentes durante e após a participação do jogador.
9. Interrupções e cancelamentos não provocam duplicação ou perda indevida de recursos.
10. O estado das atividades permanece coerente após afastamento, retorno e carregamento.
11. As funcionalidades respeitam a arquitetura e as particularidades do edifício.
12. As atividades não contradizem os demais níveis de resolução da simulação.

Mantenha uma matriz de cobertura com o estado de cada categoria, por exemplo: não auditada, auditada, parcialmente funcional, funcional e validada.

Uma categoria só deve ser marcada como funcional quando suas atividades essenciais tiverem sido implementadas. Só deve ser marcada como validada quando os testes correspondentes tiverem sido executados.

## 12. Relatório final obrigatório

Ao concluir o trabalho, informe:

- Todas as categorias de edifícios identificadas.
- As atividades previstas para cada categoria.
- A cobertura funcional alcançada.
- As experiências completas implementadas.
- Os sistemas de interação, economia, NPCs e persistência integrados.
- Os testes executados e seus resultados.
- As categorias e atividades que permanecem parciais.
- As limitações técnicas e os próximos passos.

**Critério final de qualidade:** o mundo deve oferecer um conjunto amplo, coerente e progressivamente aprofundado de experiências jogáveis. O jogador precisa poder participar da vida dos edifícios de acordo com suas funções, e não apenas observar cenários visualmente interessantes.

A meta não é fazer alguns lugares parecerem extraordinários enquanto o restante permanece decorativo. A meta é construir uma fundação sistêmica na qual cada categoria de edifício possa oferecer experiências próprias, funcionais e integradas à mesma realidade persistente do God of the Ant Farm.
