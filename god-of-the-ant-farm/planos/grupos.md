# O grupo — a máquina dos companheiros (proposta, 20/11/2026)

A pergunta do dono: o jogo vai ter companheiros — a equipe da expedição, a tripulação do capitão, a turma do mineiro, a tropa do
general. Os patches dos NPCs já preveem isso? E cada ofício precisa de uma máquina nova de comportamentos de grupo, ou isso cabe nas
interações?

## 1. A resposta curta

- **Os patches 23 e 24, como estão planejados, não têm um sistema de companheiros.** O 23 dá a memória, os laços, a voz, as
  animações, os pedidos e a vida que muda; o 24 previa «os grupos» só como gente que se junta (as panelinhas, as confrarias, as
  gangues, as seitas) — não o grupo que anda, obedece e trabalha junto.
- **O mundo já tem grupos, mas cada um do seu jeito:** a tripulação das expedições (com o ânimo), os bandos e as hostes da guerra, a
  tripulação dos navios, a turma da obra grande, a turma armada que caça a fera perto da cidade. Cada sistema fez o seu.
- **A proposta:** **uma máquina só, o grupo** — a mesma para o companheiro do corpo, a equipe da expedição, a tripulação, a turma, a
  gangue, a seita e a tropa. **Nenhum ofício cria uma máquina nova:** cada ofício **registra** nela os seus papéis, as suas ordens e
  as suas situações, como já registra as suas falas, os seus clipes e os seus verbos.
- **Onde entra:** o Patch 24 vira **«Os grupos e o conflito»** — primeiro o grupo, depois o conflito, que usa o grupo (o motim, a
  gangue, o sócio que trai). Ele vem antes da escalada (o companheiro da corda) e da mata (a expedição), os primeiros que precisam.

## 2. Por que uma máquina própria (e não só as interações)

**A interação é um momento** (o E num cipó, o «Dar» a uma pessoa); **o grupo dura**: tem gente, um líder, papéis, ordens em vigor,
um ânimo que sobe e desce, comida em comum, uma parte combinada, uma história vivida junto. Isso precisa de um lugar no mundo (e no
save). **As interações são a porta** pela qual o corpo fala com o grupo; **o grupo é a casa** onde mora o que dura.

## 3. O que é um grupo

| Parte | O que é |
|---|---|
| **Os membros** | as pessoas (o corpo pode ser um deles, ou o líder) |
| **O líder** | quem manda — e, nos grandes, **o grupo de grupos** (o general manda nos oficiais; cada oficial, na sua unidade) |
| **O propósito** | a empreitada: a expedição, a viagem, o turno da mina, a caçada, a guerra, a gangue, a seita |
| **Os papéis** | quem faz o quê: o guia, o carregador, o caçador, o curandeiro, o vigia, o remador, o piloto — **pelas perícias** de cada um |
| **As ordens em vigor** | «sigam», «esperem», «silêncio», «acampem»… e as do ofício |
| **O ânimo** | a vontade de seguir: a comida, o cansaço, o medo, a vitória, a derrota, o que o líder faz |
| **A confiança no líder** | pelos laços, pela fama, pelo que ele já fez por eles (e contra eles) |
| **A coesão** | os laços entre os membros: o grupo que se gosta aguenta mais |
| **O que se leva junto** | **a carga do grupo** — um lugar novo do livro, `g:` (a comida, a água, as cordas, o saque), e quem carrega o quê |
| **O acordo** | a parte de cada um, o soldo, o que se combinou ([`economia-oficios.md`](economia-oficios.md)) |
| **A memória** | o que viveram juntos — **os que atravessaram a mata juntos, os que sobreviveram à mesma batalha** ganham um laço forte, para a vida |

## 4. As cinco camadas de um companheiro

1. **Seguir** — o movimento: em fila na mata, em roda no acampamento, em formação na guerra; manter a distância, esperar, alcançar.
   **As bases valem para todos:** a mata atrasa o grupo inteiro, o ar fino derruba o mais fraco, o mar não mostra o mapa a ninguém.
2. **Obedecer** — as ordens: as de sempre (seguir, esperar, silêncio, parar, acampar, vigiar, carregar, atacar, recuar) e as de cada
   ofício. **Obedecer não é automático:** pesa o ânimo, a confiança, o medo e a índole — o corajoso vai, o medroso hesita, o
   orgulhoso discute.
3. **Fazer o seu papel por conta própria** — o curandeiro cuida da ferida sem que se peça, o caçador sai para caçar no acampamento,
   o vigia vigia, o carregador reclama do peso: **pelo cérebro das pessoas que o jogo já tem** (as vontades, `G.Vg.want`), dentro
   do papel.
4. **Falar** — a voz do grupo (a máquina de falas da 23b): o que sentem («tô com fome», «a gente já passou por aqui»), o que pedem,
   o que contam à noite em volta do fogo, **a conversa das decisões** (voltar ou seguir, dividir ou não, trocar de líder).
5. **Sentir** — o ânimo, o medo, a confiança e a lealdade viram atos: **obedecer, hesitar, desertar, amotinar-se, ou o heroísmo**
   (o carregador que volta para buscar o ferido). O motim e a traição são do conflito (a segunda metade do Patch 24).

## 5. A escala (de um a mil)

| Tamanho | Exemplos | Como anda |
|---|---|---|
| **Um** | o companheiro, o aprendiz que segue o mestre, quem segura a corda | cada um no seu passo |
| **A turma** (3 a 12) | a expedição, a turma da mina, a escavação, a turma do saque | cada um no seu passo e no seu papel |
| **A tripulação** (10 a 60) | o navio, a galé, a escola de gladiadores | os postos do navio; o banco |
| **A tropa** (centenas) | o exército | **o grupo de grupos**: o general manda nos oficiais, cada oficial na sua unidade; as unidades andam em formação e lutam pela luta do mundo (as hostes e os bandos que já existem passam a ser grupos de grupos) |

Os grandes andam como formação e são simulados por unidade (o desempenho); **as regras são as mesmas** em todos os tamanhos.

## 6. As portas (como cada ofício entra sem máquina nova)

| Porta | O que um ofício registra | Exemplo |
|---|---|---|
| `G.Grupo.papel(nome, { pericia, tarefa })` | os papéis do ofício | o mateiro: o guia, o carregador, o caçador, quem conhece as ervas, o canoeiro |
| `G.Grupo.ordem(nome, { quem, faz, gesto })` | as ordens do ofício | o pirata: «remos!», «ganchos!», «abordar!»; o general: «formação», «carga», «recuar» |
| `G.Grupo.situacao(nome, { quando, efeito })` | as situações que mexem no grupo | perdidos na mata, a calmaria, a nevasca, o desabamento, a partilha |
| as falas, os clipes, os verbos | (já existem: a 23b, a 23c, o `G.Interact.verb`) | «os macacos calaram»; a mão erguida pedindo silêncio |

**Cada patch de ofício acrescenta linhas nessas quatro portas** — nunca uma máquina própria. É o mesmo molde das perícias.

## 7. O grupo do mundo

As pessoas do mundo usam a mesma máquina: as expedições, as tripulações, as turmas, as gangues, as seitas, a caçada, o exército —
**com líderes do mundo, pela índole deles**. O corpo pode **liderar** um grupo ou **entrar no grupo de outro** e obedecer (ou não: a
desobediência tem consequência — a fama, o laço, o castigo). **O mundo sem o corpo é o mesmo:** as expedições do mundo partem, se
perdem e voltam pelas mesmas regras.

## 8. A tela

- **O painel do grupo** (como a aba de Relacionamentos): os membros, o papel de cada um, o ânimo e a confiança **lidos nos rostos e
  ditos em palavras**, a carga comum, o acordo.
- **A roda das ordens:** um botão segurado abre as ordens (as de sempre e as do ofício), também no controle de jogo e no toque.
- **Os gestos:** a mão erguida (silêncio), o braço que aponta (por ali), o punho (atacar) — o corpo faz o gesto, o grupo vê.
- **Nada de barras sobre as cabeças:** o grupo se lê pelos rostos, pelas vozes e pelo passo.

## 9. As regras

1. **Um grupo de ação por pessoa por vez** (a expedição, a tripulação, a tropa); os grupos sociais (a confraria, a gangue, a seita)
   podem somar-se a ele.
2. **Quem pode liderar:** a perícia Comandar, a fama, os laços — e o posto (o capitão do navio, o oficial do exército).
3. **O acordo e a carga comum pelo livro** (`G.Depot`, o lugar `g:`).
4. **O save:** o grupo vai no save (os membros, os papéis, as ordens, o ânimo, a carga); as tarefas de cada um se refazem no load a
   partir do grupo (a regra das tarefas que não vão no save).
5. **A morte e a sucessão:** o líder que morre passa o comando (o imediato, o mais velho, a escolha do grupo); o membro que morre
   pesa no ânimo e na memória de todos.
6. **O mesmo efeito nos três níveis** (o salto, o passo, o corpo).

## 10. As provas (quando for feito)

Os membros seguem pelas bases como todos (a mata atrasa todos); a ordem obedecida ou não pela índole, o ânimo e a confiança, nunca
por sorteio solto; a carga comum pelo livro; o grupo no save e as tarefas refeitas no load; a sucessão quando o líder morre; o mundo
sem o corpo é o mesmo; o grupo de grupos do exército dentro do custo; os casos ruins (o save no meio da marcha, o grupo separado pela
tempestade, o membro que deserta com a comida, o motim, o deus que manda a enchente).

## 11. Quando entra

**No Patch 24, «Os grupos e o conflito»:** a onda 1 é o grupo (a máquina, os companheiros do corpo, os grupos do mundo nela, a tela);
a onda 2, o conflito (o inimigo que age, os planos, a mentira, a chantagem, **o motim e a traição** — que usam o grupo). Os ofícios
registram os seus papéis, ordens e situações a partir dali ([`roteiro.md`](roteiro.md)).
