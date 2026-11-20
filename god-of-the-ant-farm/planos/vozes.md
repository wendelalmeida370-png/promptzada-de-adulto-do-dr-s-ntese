# As vozes e o rosto que fala (aprovado em parte pelo dono, 20/11/2026)

O dono perguntou se dá para pôr vozes humanas no jogo, nem que sejam feitas por IA, e se dá para melhorar o movimento dos rostos com
captura facial — **sem trabalho nenhum para ele**. A resposta: dá, e tudo pode ser feito por mim; o dono só joga e diz se gostou (o
teste do dono, [`roteiro.md`](roteiro.md) §5).

## 1. O que está aprovado

1. **Vozes de verdade, feitas por IA, nas falas curtas e fixas** (§2).
2. **Os murmúrios por povo** em todas as outras falas — como no The Sims (§4).

**A captura do rosto** está no §7, para o dono decidir.

## 2. As falas curtas e fixas (as que ganham voz)

As falas que **não têm nome nem lugar no meio** e que se repetem muito — por isso valem a voz:

- **as reações:** o «pegou!», o «cuidado!», o grito de dor, o riso, o susto, o suspiro;
- **os cumprimentos e as despedidas**, no jeito de cada um;
- **os gritos da arena e da batalha**, o «avança!», o «recua!»;
- **os pregões do mercado e do porto**;
- **as ordens e as respostas curtas do grupo** ([`grupos.md`](grupos.md)): o «segura!», o «agora não», o «tô contigo», o «nem pensar»;
- **as respostas curtas da conversa:** sim, não, talvez, «sei lá».

As falas longas, com nome e lugar («O {nome} anda gastando muito…»), continuam escritas, com o murmúrio do povo por baixo. Uma leva de
algumas centenas de falas curtas por conjunto de vozes; cada ofício novo pode trazer as suas (o «pegou!» do pescador, o grito do
remador).

## 3. As vozes

- **Um conjunto de vozes:** homens, mulheres, velhos, moços — e as crianças onde o programa der vozes boas de criança.
- **Cada pessoa tem a sua voz**, escolhida pelo id dela (como o rosto: só se ouve, **nunca decide nada**), com o tom variado um pouco
  dentro do natural; a voz acompanha a idade (a criança, o adulto, o velho).
- **O jeito do momento:** a mesma fala calma, assustada ou brava, onde o programa permitir — a fala certa para o humor certo, pela
  máquina das falas (a 23b) e pelo humor da pessoa.
- **A voz tem dono e lugar:** quem fala é a pessoa, e quem ouve ouve pela distância e pelas paredes, como todo som do jogo
  (`G.Audio.scene`, D-166).

## 4. Os murmúrios por povo

**Cada povo com o seu som de falar** — as suas sílabas e a sua música (o romano, o grego, o nórdico, o egípcio…). O murmúrio segue
o tamanho e o humor da fala escrita (curto e baixo para o tímido, longo e alto para o fanfarrão, áspero na raiva). Feito pelo código,
como todo o som do jogo hoje (WebAudio), ou pela mesma voz de IA dizendo sílabas sem sentido — o que soar melhor.

## 5. A boca que acompanha

Os programas de voz dizem **quais sons da fala saem em cada instante**; o murmúrio, as suas sílabas. Com isso **os lábios acompanham a
fala** pelos canais da boca que o rosto já tem (`G.Rosto`: a boca aberta, os lábios para frente, apertados, esticados) — os «lábios com
a fala», que já estavam no plano do Patch 27.

## 6. Como eu faço, sem trabalho do dono

- **Os programas:** de voz por IA, abertos, que falam português do Brasil e **com licença que permite usar num jogo**; rodam na máquina
  da sessão, sem placa de vídeo — gerar as falas uma vez é demorado, mas basta.
- **O único pedido ao dono:** o site onde ficam os programas e as vozes está bloqueado hoje nesta sessão; na hora, eu peço para
  liberar, e o dono aprova com um clique.
- **A conferência sem ouvir** (eu não escuto): um programa transcreve cada fala de volta (as palavras certas, inteiras), outro mede se
  a voz soa natural, e a conta confere o volume igual, sem corte nem estalo. **Quem aprova o som é o dono, jogando.**
- **Os arquivos:** comprimidos, num tamanho que o jogo aguenta; carregados aos poucos.

## 7. A captura do rosto (possível — a decidir pelo dono)

**Sem o dono gravar nada:**
- **vídeos de bancos gratuitos com licença que permite o uso** (gente falando, rindo, se espantando): um programa gratuito que lê
  rostos (o MediaPipe, que já roda nesta máquina) mede o movimento de cada parte do rosto, quadro a quadro, e eu passo para os canais
  do rosto do jogo. **O rosto da pessoa do vídeo nunca aparece no jogo — só o movimento.** Os sites desses vídeos estão bloqueados
  hoje: o mesmo clique para liberar.
- **mesmo sem vídeo nenhum:** a boca pela voz (§5), e o piscar e o olhar pelo que os estudos dizem de como as pessoas piscam e mexem os
  olhos.

**Os limites:** os vídeos de banco têm mais sorriso e conversa que emoção forte (o choro, a fúria são raros); o que melhora é **o
movimento** do rosto, não a forma nem a pele dele (isso é o desenho do corpo, outro trabalho).

## 8. As regras

1. **A licença de cada programa e de cada voz** registrada no `arte/LICENCAS.md`. **Será a primeira vez que o jogo terá arquivos de
   som** (hoje todo som é feito pelo código): a regra «nenhum arquivo de som» do LICENCAS e a conferência dela mudam junto, com a origem
   de cada arquivo dita.
2. **Nenhuma voz imitada de uma pessoa real sem a permissão dela; nunca a de um famoso.**
3. **O som só toca:** qual fala sai é da máquina das falas (a 23b); o som não muda o mundo nem tira do acaso do mundo (a regra 53).
4. **As provas:** toda fala com voz tem o seu arquivo e a sua licença; a transcrição de volta bate com o texto; a boca acompanha o som;
   o mundo é o mesmo com o som ligado ou desligado.

## 9. Quando entra

**No Patch 27, o acabamento** — onde já estavam os murmúrios por povo e os lábios com a fala —, depois da máquina das falas (a 23b, no
Patch 23), que diz quais falas curtas existem. A captura do rosto, se o dono aprovar, cabe no mesmo patch ou junto da fábrica de
animações (a 23c).
