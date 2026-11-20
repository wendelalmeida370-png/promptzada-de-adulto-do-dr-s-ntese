# A leitura — a sexta máquina do mundo (aprovado pelo dono, 20/11/2026)

A ideia nasceu da análise de game design (20/11/2026): **uma simulação funda que não se lê parece sorte ou bug.** O companheiro
que recusa a ordem sem que se saiba por quê parece defeito, não personalidade; o peixe que não morde sem causa à vista parece
dado jogado. O jogo tem causas de verdade para tudo (nada vem do nada, D-440) — **a leitura é a máquina que faz essas causas
chegarem ao jogador, dentro do mundo.** É a sexta máquina do mundo, ao lado das falas, das animações, das interações, do grupo e
das marcas: serve a tudo (as pessoas, os ofícios, as condições, a natureza, a lei, o deus), e todo patch a alimenta.

## 1. O que ela faz

**Toda vez que o mundo diz «não», «deu errado» ou «deu certo» ao jogador, a causa de verdade chega até ele** — pelo mundo, não
por uma janela de regras:

- o companheiro que não obedece (o medo, o laço, o jeito como foi dito — [`grupos.md`](grupos.md) §5);
- o peixe que não morde (a hora, a isca para outra espécie, a água fria);
- a pessoa que não aceita o pedido, o casamento, o preço (a índole, o que ela sente pelo corpo, a fama dele);
- a comida que saiu ruim ou boa ([`cozinha.md`](cozinha.md) §7b: o retorno sem estrelas);
- o preço que subiu, a fome que veio, o bicho que fugiu, a sentença que a cidade não aceitou.

O dono já tinha pedido isso duas vezes — **o porquê de cada laço** na aba de Relacionamentos (a 23a) e **a cozinha sem estrelas** —;
a leitura torna o pedido uma regra para tudo.

## 2. Por onde a causa chega (do mais natural ao mais dito)

| O canal | Como é | Exemplo |
|------|----------|----------|
| **O corpo e o mundo** | o gesto de quem decide, o sinal da natureza, o som | o companheiro que hesita e olha para a mata; a chama da lamparina que encolhe na mina; os macacos que calam |
| **A fala** | quem está perto diz o porquê, no jeito dele (a máquina das falas, a 23b) | «Com essa água fria o robalo desce.» — «Eu não entro aí. A mata está calada demais.» |
| **O porquê guardado** | a aba de Relacionamentos (o laço e o momento, com o porquê), o diário (a linha do dia que conta o que aconteceu e por quê), a ficha | «Marta não aceitou: ainda lembra da briga na taverna.» |
| **O olho de quem sabe** | com a perícia alta, a pessoa lê mais — o pescador velho vê o que o aprendiz não vê | o aprendiz vê «a linha parada»; a mestra vê «a corrente virou, o cardume desceu» |

**O olho de quem sabe é uma recompensa do ofício:** subir uma perícia é também passar a entender o mundo dela. O principiante ouve
mais a voz dos outros; o mestre lê sozinho.

## 3. As regras

1. **Palavras do mundo, nunca números na tela do corpo.** Nada de «72 % de chance» nem de «laço −15»; o mesmo jeito da cozinha sem
   estrelas.
2. **A causa dita é a causa de verdade.** A leitura lê o mundo e nunca inventa — como toda fala aponta para um fato. Quem decide
   (o grupo, a pessoa, o peixe, a lei) guarda a causa junto da decisão, com nome; a leitura só a lê. Uma decisão sem causa com nome
   é um erro do sistema que decidiu.
3. **Só o que a pessoa poderia saber** (a porta `G.Possess.knows`). O que ela não pode saber, ela não lê — no máximo desconfia
   («ele estava estranho hoje»). Sem ninguém encarnado, o deus lê tudo.
4. **A tempo de aprender.** O porquê de um fracasso chega na hora (o gesto, a fala) ou no mesmo dia (o diário) — nunca só no fim
   da vida.
5. **Disponível, não empurrada.** A leitura não enche a tela: fica ao alcance (a fala que se ouve, a linha que se abre). A tecla H
   continua guardando a tela do corpo.
6. **Pura.** Ler não muda o mundo nem tira do acaso do mundo, como todas as leituras da sociedade.

## 4. A porta (proposta; o contrato do patch a fixa)

- **Quem decide guarda a causa:** cada sistema que responde ao corpo — o grupo, os verbos sociais, a venda, o pedido, o ofício, a
  lei — devolve, junto da resposta, a causa com nome (`{ causa: 'medo', de: id, peso }`), decidida no passo do mundo.
- **`G.Leitura`** (`js/leitura.js`): recebe o fato e a causa, pergunta à porta `knows` o que a pessoa pode saber dele, e escolhe o
  canal — o gesto (pela fábrica de animações, a 23c), a fala (pela 23b), a linha do diário. Puro.
- **O olho de quem sabe:** a perícia da pessoa vivida diz até onde ela lê (o que o aprendiz vê, o que o mestre vê) — uma tabela por
  perícia ([`pericias.md`](pericias.md)), não por ofício.

## 5. O que cada patch traz a ela

Cada sistema novo diz **as suas causas** (as recusas, os fracassos, os sucessos) e **como cada uma se lê** — o gesto, a fala, a linha;
cada documento de ofício tem a sua parte na seção «As falas, as animações, as interações, o grupo, as marcas e a leitura».

## 6. As provas

- **A invariante** (S2): toda recusa e todo fracasso do mundo diante do corpo têm a sua causa com nome, e a causa dita é a que
  decidiu.
- **O cenário:** provocar cada recusa e cada fracasso (o grupo, a venda, o pedido, a pesca, a sentença) e conferir que a causa dita é
  a de verdade, que só se diz o que a pessoa sabe, e que um save no meio não perde a causa.
- **A regra do guard:** quem diz «não» ao corpo passa a causa; a leitura não escreve no mundo.
- **A prova humana:** a terceira pergunta do teste do dono em todo patch — «entendeu por que deu certo ou errado?» ([`roteiro.md`](roteiro.md) §5).

## 7. Quando entra

**A base no Patch 23, «As Vidas»**, junto da voz (a 23b) e da aba de Relacionamentos (a 23a, que já tem o porquê de cada laço): é ali
que nascem os canais. **O grupo (Patch 24) é o primeiro grande freguês** — a obediência que não é automática só funciona se a recusa se
lê. Depois, **cada patch traz as suas causas**, e o olho de quem sabe cresce com cada perícia.
