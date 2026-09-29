// Objetivos e dicas graduais (3 níveis: vaga → direção → resposta).
export const OBJ = {
  msgs: {
    text: 'Ler as mensagens no celular (TAB).',
    hints: ['O celular vibrou. Chegou mensagem nova.', 'Aperte TAB para abrir o celular e toque em Mensagens.', 'TAB → Mensagens → abra a conversa do {wendel}.'],
  },
  charger: {
    text: 'O celular está com 12%. Achar o carregador do {wendel}.',
    hints: ['Leia as mensagens antigas do {wendel} (de ontem): ele contou onde esqueceu o carregador.', 'Ele esqueceu no SEU quarto — o quarto roxo, no corredor. Leve a lanterna (F).', 'O carregador está na penteadeira, do lado do espelho redondo.'],
  },
  charge: {
    text: 'Carregar o celular numa tomada (olhe para a tomada e segure E).',
    hints: ['Tomadas ficam perto do chão ou embaixo do ar-condicionado.', 'No quarto roxo tem três tomadas embaixo do ar-condicionado. Na sala tem uma ao lado do sofá.', 'Olhe para uma tomada e SEGURE E até passar de 35%.'],
  },
  video: {
    text: 'Assistir casa.mp4: segure o botão direito (levanta o celular) e aperte Q.',
    hints: ['O botão direito do mouse levanta o celular.', 'Com o celular levantado, aperte Q (ou gire a rodinha) para trocar para ▶ casa.mp4.', 'Segure o botão direito e aperte Q. A imagem vai ficar azulada: é o vídeo.'],
  },
  compare: {
    text: 'Comparar a sala com o vídeo e arrumar o que estiver diferente.',
    hints: ['No modo ▶ casa.mp4 a imagem mostra a casa como o {wendel} gravou. Quando algo não bate, aparece uma etiqueta vermelha.', 'Olhe pelo vídeo para a parede da porta de entrada. Depois olhe sem o vídeo.', 'O quadro colorido: no vídeo ele está encostado no chão; na sua frente está pendurado. Interaja com ele (E).'],
  },
  a1list: {
    text: 'Antes de voltar a dormir:\n• dar ração pro {bento} e pra {lili}\n• ver se a mãe está dormindo',
    status: (s) => [
      (s.F.fedCats ? '☑' : '☐') + ' Ração dos gatos',
      (s.F.checkedMom ? '☑' : '☐') + ' Ver se a mãe está dormindo (quarto dos pais)',
      '… diferenças ainda visíveis no vídeo: ' + s.diffs().filter((d) => d.id !== 'extra').length + ' (opcional)',
    ],
    hints: (s) => (!s.F.fedCats
      ? ['A ração fica na área de serviço, depois da cozinha.', 'A ração está na prateleira mais alta. Alto demais pra você. O que tem na sala que ajuda a subir?', 'Pegue o banquinho de madeira (perto da bicicleta), use-o na prateleira da área de serviço, pegue a ração e sirva nos potes da cozinha.']
      : ['O quarto dos pais é a porta no fim do corredor.', 'A porta está trancada. Bata nela (E).', 'Vá até o fim do corredor e interaja com a porta.']),
  },
  intercom: {
    text: 'O interfone está tocando.',
    hints: ['O interfone fica na parede, ao lado da porta de entrada.', 'Vá até a porta de entrada e atenda (E).', 'O interfone é o aparelho branco na parede esquerda, perto da porta.'],
  },
  bed: {
    text: 'Voltar para o quarto.',
    hints: ['Seu quarto é o roxo, no corredor.', 'Tem alguma coisa diferente no corredor. Olhe com atenção.', 'Ande pelo corredor até o fim.'],
  },
  extradoor: {
    text: 'Tem uma porta nova no corredor. O "{wendel}" disse para não abrir.',
    hints: ['Talvez seja melhor voltar para o quarto.', 'A chave velha do porta-chaves pode ter a ver com isso.', 'Por enquanto essa porta não abre. Siga em frente.'],
  },
  tv: {
    text: 'A TV ligou sozinha na sala.',
    hints: ['O barulho vem da sala.', 'Vá até a sala e olhe para a TV.', 'Entre na sala.'],
  },
  breaker: {
    text: 'Religar a energia no quadro de luz (ao lado da porta de entrada).',
    hints: ['Está escuro, mas você conhece a sua casa. A porta de entrada fica no lado oposto à varanda.', 'Siga pela parede da TV até o fim da sala. O quadro de luz é a caixa branca na parede, perto do interfone.', 'O quadro fica na parede à esquerda da porta de entrada, um pouco acima do interfone. Interaja com ele.'],
  },
  lookvideo: {
    text: 'Olhar pelo vídeo (casa.mp4) onde está a família.',
    hints: ['Levante o celular (botão direito) e troque para ▶ casa.mp4 (Q).', 'No vídeo, procure nos cômodos: cozinha, quartos.', 'Olhe pela cozinha no modo vídeo: a mãe aparece lá.'],
  },
  family: {
    text: (s) => `Encontrar a família (${s.familyCount()}/4).`,
    status: (s) => [
      (s.F.juliaFound ? '☑' : '☐') + ' {julia} — quarto roxo',
      (s.F.momFound ? '☑' : '☐') + ' Mãe — cozinha',
      (s.F.dadFound ? '☑' : '☐') + ' Pai — quarto dos pais',
      (s.F.pedroFound ? '☑' : '☐') + ' {pedro} — quarto dos meninos' + (s.F.hasMomKeys ? '' : ' (trancado)'),
      s.F.liliFollow ? '☑ {lili} está com você' : (s.F.liliHint ? '☐ (opcional) a {lili} sumiu' : ''),
    ].filter(Boolean),
    hints: (s) => s.familyHints(),
  },
  door: {
    text: 'Os quatro sumiram do vídeo. A porta que não existe se abriu um pouco.',
    hints: ['A porta nova do corredor.', 'Use a chave velha do porta-chaves (se ainda não pegou, ela está lá).', 'Abra a porta que não existe e desça a escada.'],
  },
  descend: {
    text: 'Descer a escada que não pode existir.',
    hints: ['Um apartamento não tem escada. Mesmo assim...', 'Desça.', 'Siga a escada até o fim.'],
  },
  clown: {
    text: 'Chegar perto do palhaço.',
    hints: ['Ele está perto do bolo.', 'Aproxime-se e interaja (E).', 'Interaja com ele várias vezes para ver todos os cartões.'],
  },
  ruptures: {
    text: (s) => `Deixar a casa DIFERENTE do vídeo (${s.ruptureCount()}/3).`,
    status: (s) => [
      (s.F.paintingMode === 'upside' ? '☑' : '☐') + ' O quadro de cabeça pra baixo (sala)',
      (s.F.nameWritten ? '☑' : '☐') + ' O seu nome no espelho (banheiro)',
      (s.F.keysHung ? '☑' : '☐') + ' A família no porta-chaves (entrada)',
      'Ele está na casa. Use o rádio (R), ouça a buzina, esconda-se.',
    ],
    hints: (s) => s.ruptureHints(),
  },
  climax: {
    text: 'Enfrentar o Inquilino na sala.',
    hints: ['Ele está na TV.', 'Vá para a sala.', 'Entre na sala.'],
  },
  record: {
    text: 'GRAVE ELE: segure o botão direito e mantenha ele no centro da tela.',
    hints: ['Botão direito levanta o celular.', 'Deixe o quadradinho do centro em cima dele.', 'Siga o movimento dele com o mouse.'],
  },
};
