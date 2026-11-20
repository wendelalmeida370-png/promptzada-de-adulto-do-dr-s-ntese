# Patch 23 — «As Vidas»: o plano

O pedido do dono (a conversa depois da v14): os NPCs mais vivos da história dos jogos — inteligentes o quanto der, sem IA
dentro do jogo; milhares de falas contextuais; centenas de animações que comunicam; pedidos que viram missão; e a aba de
Relacionamentos no estilo do The Sims. Este arquivo é o plano para pôr em prática quando o limite semanal voltar.
Os nomes das portas são propostas: a Fase 0 os fixa no `SOCIEDADE.md`.

**Vem depois do calendário** ([`calendario.md`](calendario.md), aprovado em 19/11/2026): todo número de tempo deste patch (o
esquecer das memórias, a duração dos pedidos, a vida que muda) é contado no ano de quatro estações — em dias ou em anos, dito.

## 1. O que já existe (a base que este patch usa)

- **Quem a pessoa é:** a índole (`v.indole`: seis eixos e três valores, metade dos pais), a fama (`v.fama`), a memória da
  cidade (`set.memoria`), o genoma e a feição (só se vê).
- **Os laços** (`v.lacos`, `js/soc-lacos.js`): por pessoa, quatro números — afeto, confiança, respeito, atração —, o dia e as
  marcas (`frente`, `recusa`, `mesa`); a família é lida do parentesco (`L.base`); esfriam no dia da cidade. **Uma camada só**:
  não há o «chateado agora» separado do «amo». As marcas de quem fez o quê (`v.marcas`) têm teto de 8.
- **Os boatos** (`G.Boatos`): o fato, quem sabe, a versão, quem leva entre cidades, a distorção, o desmentido, a lenda.
- **Os verbos do corpo** (`G.SocVerbos`): doze, do cumprimento ao pedido de casamento; a resposta pela índole e pelo laço.
- **As vontades** (`G.Vg.want`): só duas hoje — `ajudar` e `acerto` (`js/soc-vida.js`).
- **O motor de histórias** (`js/stories.js` e os `story-*.js`): o mundo dá os fatos (`St.signal`, com quem, onde, de onde
  veio e quem sabe), os arquétipos julgam se alguém real com laços pode carregar uma história, as sementes esperam, o
  diretor escolhe poucas e varia os motivos, e cada história é uma máquina de estados que escreve capítulos com
  «storylets», empurra de leve o tempo livre das pessoas e acaba como o mundo decidir. A regra de ouro: nunca diz que
  aconteceu o que não aconteceu. A cegonha no telhado (`story-fortunes.js`) é uma delas.
- **O corpo:** o Diário de Vida (objetivos), o que o personagem sabe (`G.Possess.knows`), a câmera de conversa, o retrato.
- **O que se vê:** o animador por camadas (`G.Anim3D.drive`), os clipes (`G.ANIM_CLIPS`), a passada, o porte, o ócio, o
  rosto (`G.Rosto`), os atos a dois (`Anim.DUO`), as cenas (`Vida3D.scene`), as coisas nas mãos (`G.Inv.held`).
- **As falas:** poucas — os arquivos de fala (`talk.js`, `act-falas.js`, as respostas do `soc-verbos.js`) somam algumas
  centenas de linhas de código. É onde o salto é maior.

## 2. As regras que valem para tudo

1. **O mundo é o mesmo com ou sem gente olhando** (o `det3`). Nenhum NPC «pensa mais fundo» porque o corpo está perto: a
   profundidade vem da importância (o par, o amigo e o inimigo do corpo, quem governa) e da agregação para os outros.
   O que muda o mundo (o pedido, a fala ouvida pelo guarda, a escolha) é decidido no passo do mundo, pelo `G.R`; o que só se
   vê ou se ouve (qual frase, qual gesto) pelo `G.hash` / `G.VR`.
2. **A aparência e o povo nunca decidem** (regras 194, 210): ninguém é suspeito, inimigo ou escolhido pela cara ou pelo povo.
   O jeito de falar e o cumprimento do povo são do que se vê, não de uma decisão.
3. **Nada vem do nada** (D-440): o presente sai da casa de quem dá; a recompensa, das moedas e dos bens de quem pediu; o
   capanga é pago com moedas reais — sempre pelo `G.Depot`.
4. **O mundo nunca decide pelo corpo:** convite e pedido são chamados (`G.Possess.ask`); o jogador aceita ou recusa.
5. **O corpo só sabe o que viveu** (`G.Possess.knows`): a aba, as falas e as missões mostram só o que a pessoa vivida sabe.
6. **O protocolo do `CLAUDE.md`:** cada parte com a sua invariante, o seu cenário (com os casos ruins: save no meio, quem pede
   morre, o deus mexe, o mapa muda), a sua regra do guard, as suas entradas no `AUDIT.md`; o medidor da sociedade
   (`qa/sociedade-eco.js`: a gente, os nascimentos e os casais a ±10 %) quando uma escolha mudar.

## 3. A estrutura do patch

```
Fase 0  (o coordenador)        o contrato, os números, os mundos prontos refeitos
Onda 1  (três frentes juntas)  23a A memória e os laços (+ a aba)   23b A voz   23c O corpo que fala
            → junta, provas, publicação v15
Onda 2  (sobre a onda 1)       23d Os pedidos   23e A vida que muda   23b e 23c: a segunda leva
            → junta, provas, publicação v16
```

Por quê nesta ordem: a aba, as falas e as missões leem a mesma coisa — a memória e o «momento» do laço. Sem a 23a, as outras
não têm o que contar. A fábrica de animações e a máquina de falas não dependem de ninguém e começam juntas.

## 4. Fase 0 — o contrato (o coordenador)

- O capítulo «Patch 23» no `SOCIEDADE.md`: as portas novas, quem escreve cada campo, os números de cada frente, as regras do
  guard em branco para cada uma, os arquivos novos já criados vazios (como no D-276 e no D-335).
- Os mundos prontos refeitos antes de começar (pendentes da v14: o barro da 22c e o `f.eco.last.veste` do L-1714).
- O aviso do vento depois do load (o S4 do `oldsave`): o `G.Meio.wind` refeito na primeira pergunta depois de um load.
- **Os números** (nada se cruza):

| Frente | D- | L- | T- | regras do guard |
|---|---|---|---|---|
| coordenador | 650–659 | 1716–1769 | 1631–1639 | 249 |
| 23a | 660–679 | 1810–1839 | 1640–1649 | 250–259 |
| 23b | 680–699 | 1840–1869 | 1650–1659 | 260–269 |
| 23c | 700–719 | 1870–1899 | 1660–1669 | 270–279 |
| 23d | 720–739 | 1900–1929 | 1670–1679 | 280–289 |
| 23e | 740–759 | 1930–1959 | 1680–1689 | 290–299 |

## 5. Onda 1

### 23a — A memória e os laços (e a aba de Relacionamentos)

**O que entra:**
1. **O momento do laço** — uma segunda camada em cada laço, rápida, com a causa: «chateado», «feliz com ela», «com saudade»,
   «magoado», «grato». Vai de −100 a 100, passa em dias (o amor de fundo fica), e guarda a causa e o dia (um fato, uma
   marca). Só o `soc-lacos.js` escreve, pela mesma porta (`L.ato`). Leitura pura: `G.Lacos.momento(a, b)`.
2. **As memórias-chave** — o que marca uma vida, permanente: «me salvou do rio quando eu tinha 6 anos», «tentou me matar»,
   «o primeiro beijo», «me deu um presente», «tomamos uma cerveja no porto ontem». Cada uma: o tipo, com quem, onde, o dia,
   o peso, o fato de onde veio. Sem o teto de 8: as pequenas são esquecidas pelo peso e pelo tempo, as grandes ficam a vida
   inteira. Arquivo novo (`js/soc-memoria.js`), só ele escreve; nasce dos fatos do motor de histórias e dos atos dos laços.
3. **O rótulo da relação** (puro): pelo parentesco, pelos sentimentos e pelas memórias — «minha esposa», «meu filho»,
   «vizinho», «desafeto», «inimigo mortal», «amigo de infância», «conhecido de ontem», «colega de ofício», «meu senhor».
4. **O humor do dia com causa** — o que pinta o rosto, o porte e a fala hoje: dormiu mal, comeu bem, brigou em casa, ganhou
   um presente, perdeu alguém. Poucas causas de cada vez, cada uma com o fato.
5. **Os presentes com gosto** — cada um gosta de umas coisas (pela índole, pelo ofício, pela idade); o «Dar» do corpo e
   das pessoas leva em conta o gosto; o presente sai pelo livro.
6. **Favores e dívidas** — «emprestei 20 moedas», «me deve a vida», «devo um favor»: um registro com o fato, que a dívida
   da 23d cobra e as falas lembram.
7. **O nome e o apelido** — quem conhece chama pelo nome; os íntimos, pelo apelido (o apelido já existe no registro).
8. **A reputação do corpo por cidade** — a fama local pesa no preço, no serviço recusado, no medo e no respeito.
9. **A aba de Relacionamentos** (o pedido do dono) — no painel do corpo, ao lado do Diário de Vida:
   - as pessoas que o personagem conhece, pela porta `G.Possess.knows`, em grupos: família, amor, amigos, conhecidos,
     desafetos; a ordem pela força do laço;
   - em cada linha o retrato (o `G.Retrato3D`), o rótulo, **duas barras** — o laço de fundo (crônico: muda devagar) e o
     momento (agudo: muda rápido) — e **o porquê**: a memória mais forte e a mais recente;
   - os exemplos do dono, que a prova cobra que a aba sabe dizer: «Minha esposa — amo; estamos numa boa fase; me deu um
     presente ontem». «Meu filho — amo, mas estou chateado: ele vai mal no treino de guerreiro». «Vizinho — leve
     inimizade: o bode dele comeu a minha horta». «Inimigo mortal — tentou me matar». «Amigo de infância — me salvou do rio
     quando eu tinha 6 anos». «Conhecido — tomamos uma cerveja no porto ontem; gente boa»;
   - nada que o personagem não saiba; o deus (sem corpo) vê tudo de quem a ficha mostra.

**Provas:** o momento sobe e passa em dias sem mexer no laço de fundo; a memória nasce de um fato verdadeiro e sobrevive a
save e load; o esquecimento leva as pequenas e guarda as grandes; o rótulo de cada exemplo do dono; a aba só diz o que o
corpo sabe (a `sabe.js` ganha as partes da aba); o mundo igual com a aba aberta (`det3`); o medidor da sociedade.

**Pronto quando:** os seis exemplos do dono aparecem na aba num mundo vivido, com o porquê certo, e o rosto e as falas
leem o mesmo momento.

### 23b — A voz (as falas contextuais)

**A máquina** (`js/falas.js` e os dados em `js/falas-*.js`):
1. **O assunto** é um fato real que aquele NPC sabe (pelos boatos, pelo `v.sabe`, pelo que viveu). Os assuntos da primeira
   leva (≈ 25): o bairro (o perfil do `G.Urban`: pesqueiro, perigoso, boêmio, rico), a cidade (crescendo, com fome, em
   festa), o tempo e a estação, o corpo (a fama dele, o que ele fez, o que fizeram juntos), outras pessoas (quem casou,
   morreu, nasceu, foi preso, viajou), quem governa (a morte do rei ontem, o jeito dele de governar), a guerra, os preços
   e a colheita, a festa, a expedição de que ouviu falar, a caverna sagrada, o bicho raro visto, o navio que chegou, o
   crime da semana, a própria vida (o ofício, a família, a saudade).
2. **O jeito de dizer:** a índole (o tímido, o fanfarrão, o rabugento, o fofoqueiro, o devoto), a idade, o ofício, o humor
   do dia, o laço com quem ouve (o amigo fala aberto, o estranho pouco, o inimigo provoca), o jeito do povo.
3. **As variações:** cada frase-base com várias versões e lacunas (o nome, o lugar, há quantos dias); a escolha pelo
   `G.hash` (o id, o dia, o assunto); a memória do que já se disse a quem, para não repetir (só se vê).
4. **O risco de falar:** a crítica a quem governa pesa quem está perto (o guarda, o amigo do governante), a coragem e a
   prudência, o quanto o regime é duro — o corajoso fala alto na taverna, o prudente cochicha, o outro se cala quando o
   guarda chega. **Ouvida por um guarda, é do mundo:** decidida no passo, vira denúncia pelo crime que já existe (multa,
   cela, cadafalso), e boato.
5. **As reações curtas** (as «barks»): o aceno do amigo ao passar, o olhar torto do inimigo, o susto com a arma sacada, o
   comentário da chuva que começa, o grito de quem vê um crime, o choro no enterro.
6. **As conversas entre as pessoas com assunto** — o que o corpo ouve ao passar (a conversa do `talk.js` ganha o assunto);
   e falam do corpo pelas costas, pelo que sabem dele.

**O conteúdo:** a primeira leva com ≈ 800 frases-base (≈ 25 assuntos × os jeitos × as versões); a segunda leva (onda 2)
passa de 2.000, com os assuntos dos pedidos e das viradas. Escrito por nós no desenvolvimento, em português, por assunto.

**Provas:** toda fala aponta para um fato verdadeiro (a invariante «fala com fato»); ninguém fala do que não sabe; a mesma
fala não volta a quem ouviu em pouco tempo; «o rei morreu» só com o rei morto; a crítica ouvida vira denúncia, com os
casos ruins (o guarda morre no meio, save no meio, o rei morre no meio, o corpo é quem fala); o mundo igual com ou sem
quadros; uma **folha de falas** (duzentas tiradas de um mundo vivido) para o dono e o coordenador lerem.

**Pronto quando:** num mundo pronto, cada pessoa tem o que dizer sobre o bairro, a cidade, o tempo, o corpo, os outros e
quem governa, no jeito dela, e a crítica ouvida pelo guarda dá cadeia.

### 23c — O corpo que fala (a fábrica de animações)

**A fábrica:**
1. **Os pontos de encaixe no mundo** (leitura pura): o banco, a cama, o balcão, a porta, o poço, a mesa, a parede, o cão —
   cada coisa diz onde se senta, onde se apoia a mão, onde se segura (das plantas, das formas e do que há em volta). Um
   clipe «sentar» serve para todo banco.
2. **Os papéis** (o `Anim.DUO` levado a N): uma interação diz os papéis A, B, C…, as distâncias e os pontos de contato (mão
   na mão, mão no ombro, abraço); vale para criança com criança, pai com filho, a roda de cinco.
3. **As peças por camada que se somam:** «rindo» + «apontando» + «andando».
4. **A variação de cada um** (pura, pelo id): a amplitude, a velocidade e o jeito pela índole, pela idade e pelo humor — o
   expansivo gesticula largo, o tímido curto.
5. **Entrar e sair de cada ação** (sentar, levantar, largar o copo), sem estalo.
6. **A camada de reação:** o susto, o recuo, a cabeça que vira para o grito — por cima de qualquer atividade, do fato do mundo.
7. **As provas automáticas de cada clipe:** pés no chão, mãos no ponto, nada atravessando o corpo, nas cinco idades e nos três
   corpos, a roupa acompanhando; e a folha de fotos.

**A primeira leva (≈ 50 clipes), pelo que as falas e a aba pedem:** gesticular falando (por índole), as emoções (chorar,
gargalhar, bater o pé de raiva, encolher de medo, esconder o rosto de vergonha), o abraço de reencontro, cochichar no ouvido,
consolar, empurrar, apertar a mão, brindar, carregar a criança no ombro, as brincadeiras das crianças (pega-pega, roda),
sentar e deitar, apoiar no balcão, encostar na parede, tirar água do poço, carinho no cão.

**Provas:** os da fábrica para todo clipe; `gestos-vida`, `vida3d`, `corpo-rig`, `maos`, `andar`, `vida-guarda`, o custo
(`vida-custo`, ≤ 4 ms na Alta, com a máquina livre); o mundo igual (o que se vê não muda o mundo).

**Pronto quando:** clipe novo entra com uma linha de dados e passa nas provas sem ajuste à mão; os 50 estão no jogo.

**Fecho da onda 1:** a junta, as provas de todas as frentes, os mundos prontos, a publicação da v15.

## 6. Onda 2

### 23d — Os pedidos (a iniciativa e as missões, sobre o motor de histórias)

**A ideia do dono: as histórias viram missões.** O motor de histórias já faz quase tudo o que uma missão precisa: os fatos
com a causa e quem sabe, o julgamento de quem tem laço para carregar a história, o diretor que escolhe poucas e varia, a
máquina de estados que acaba como o mundo decide. O que falta é **um papel para o corpo**:
1. **O pedido:** quando uma história chega ao ponto em que alguém que tem laço com o corpo (parente, amigo, devedor) — ou
   que ouviu a fama dele — precisaria de ajuda e não consegue sozinho, ela pode pedir. A personalidade pesa (o orgulhoso não
   pede); o pedido é um chamado ao corpo (`G.Possess.ask`), num momento escolhido (no túmulo, na taverna de noite), com a
   câmera de conversa e as falas da 23b. Recusar é uma marca do laço.
2. **O corpo na história:** o que o corpo faz vira fato da história; a história continua com ele como participante; o
   Diário de Vida mostra a missão escrita como relato, na voz de quem pediu, atualizado com o que ele descobre.
3. **As pistas verdadeiras:** as pegadas, as testemunhas (que podem mentir, pela índole), as versões do boato, a coisa no
   chão, o livro-razão (a carne do bode roubado está na despensa de alguém).
4. **Várias saídas,** pelos sistemas que existem: a luta, a conversa, as moedas, a esperteza.
5. **O fim pelo mundo:** a missão acaba quando o mundo confirma (o bode no curral, a cabana de pé), nunca por um botão; e
   pode falhar pelo tempo (o lobo come o bode, o assassino foge).
6. **O eco:** dias depois, o presente na festa, a família do morto atrás do corpo, o boato do que ele fez, a memória-chave.
7. **O diretor dá o ritmo:** poucas missões ativas (1 a 3), uma nova de tempos em tempos, tipos variados, apostas que sobem.
8. **Os convites** (a iniciativa mais simples): o amigo chama para beber, para a praça, para pescar, para a festa, para
   ajudar na obra — uma vontade nova (`G.Vg.want`) que tem o corpo como alvo.

**Os cinco esqueletos da primeira leva** (escritos à mão, preenchidos pelo mundo, cada um com a sua reviravolta tirada dos
fatos):
- **O bode sumido** — o bicho, as pegadas, o lobo; a reviravolta: o filho faminto do vizinho o levou.
- **A ajuda na obra** — a cabana das próprias mãos (`G.Casa.handsTask`) que a família levanta pede braços.
- **A dívida** — as moedas pelo livro; cobrar, perdoar, pagar pelo amigo.
- **A vingança** — o irmão morto de verdade, as testemunhas; matar, entregar à justiça, perdoar; a reviravolta: era
  legítima defesa, ou o boato estava errado.
- **A criança sumida** — perdida no mato, na caverna, fugida de casa, levada.

**Provas:** cada esqueleto com os casos ruins (save no meio, quem pediu morre, o corpo morre, o deus mexe, o bode morre, o
alvo foge, falha pelo tempo); toda missão aponta para um fato verdadeiro; ninguém pede sem laço ou fama; a recompensa existe
no livro de quem pediu; o mundo igual com ou sem quadros; sem corpo, a história segue como antes.

**Pronto quando:** num mundo vivido, um parente ou um amigo pede ajuda por um fato que aconteceu, a missão vai ao diário, se
resolve por mais de um caminho, e o mundo lembra depois.

### 23e — A vida que muda

1. **As metas de vida** — riqueza, família, poder, saber, fé, vingança, aventura, pela índole e pela vida; pesam nas
   escolhas (`G.Vg.weigh`, `G.Vg.want`) e mudam com as viradas.
2. **As viradas (os 180 graus)** — o viúvo que vira bebedor ou devoto, quem enriquece e muda de bairro, o trauma da guerra,
   a fuga de casa, a ascensão; cada uma com o fato que a causou e a rotina nova.
3. **Os hábitos** — a mesa de sempre, o amigo da pescaria, o caminho de casa: nascem da repetição e se quebram.
4. **A família viva** — a briga de casal com causa, criar os filhos (o filho que vai mal no treino deixa o pai chateado — o
   momento da 23a), a herança, os irmãos rivais.
5. **O romance completo** — o flerte, o namoro, o ciúme, a separação, a volta (pela porta do casal).
6. **As desavenças de vizinho** — com causa real (o bode dele comeu a horta, a obra dele tomou o caminho, o barulho da
   taverna) e a reconciliação.
7. **Os fatos novos que as memórias pedem** — o resgate na água (quem se afoga e quem salva), o perigo dividido.

**Provas:** cada virada a partir do seu fato, com save no meio; as metas mudam o que a pessoa escolhe sem tirar ninguém
das portas do mundo; o medidor da sociedade (a gente, os nascimentos e os casais a ±10 %, nenhum povo fora da faixa).

**A segunda leva da 23b e da 23c:** as falas dos pedidos, das viradas, da família e do romance (mais de 2.000 no total);
+80 clipes (o pedido de ajuda, a briga de casal, o namoro, o luto, a festa, a cobrança).

**Fecho da onda 2:** a junta, as provas, os mundos prontos, a publicação da v16.

## 7. Fica para depois

- **Patch 24 — Os grupos e o conflito** (o grupo por inteiro em [`grupos.md`](grupos.md)): **a onda 1 é o grupo** — a máquina dos
  companheiros, das equipes, das tripulações e das tropas, onde também vivem as panelinhas, as confrarias, as gangues e as seitas;
  **a onda 2, o conflito:** o inimigo que age em escalada (provoca, boato, furto, sabotagem, briga, emboscada,
  assassinato, o capanga pago); os planos de vários passos (a arma, a ocasião, o lugar sem testemunhas, o álibi); a
  mentira, o segredo e a chantagem (quem sabe o quê sobre quem); os grupos (panelinhas, confrarias, gangues, seitas); mais
  esqueletos de missão (15 a 20: a herança, o amor proibido, a falsa acusação, o monstro que não é, a peregrinação à
  caverna, a caça ao bicho raro, o sobrevivente da expedição…); falas passando de 5.000; clipes passando de 300.
- **O acabamento (agora o Patch 27, depois da Pesca; veja o [`roteiro.md`](roteiro.md)):** os murmúrios de voz por povo, os lábios com a fala, os sonhos e os pesadelos contados; a
  captura de movimento gratuita, se a licença permitir.

## 8. Como rodar com o limite semanal

- Cada frente é um agente (Opus 5.5 no Extra, como nas ondas 22), com um `STATUS.md` no rascunho e commit a cada passo (a
  máquina reinicia sem aviso).
- Onda 1 com três agentes juntos; se o limite apertar, dois de cada vez (23a primeiro, porque as outras leem dela).
- Publicação a cada onda (v15, v16), depois das provas curtas (D-540) e das do navegador (o 3D, o `det3`, os mundos
  prontos, o save antigo).
