'use strict';
// A folha do P4 na matriz por prédio (qa/matriz-predios.js — os adendos 2 e 11 do pedido do Patch 2, D-089) e o formato de
// todas as folhas.
//
// O FORMATO. Cada dono escreve a sua folha, qa/categorias/pN.js, um módulo que exporta
//   { dono: 'P2', categorias: { <id da categoria>: <ficha>, … } }
// As categorias e os tipos do G.BDEF de cada uma são do gerador (CATS, no qa/matriz-predios.js; `node qa/matriz-predios.js
// --categorias` as lista). Cada tipo está numa categoria só. Várias folhas podem falar da mesma categoria: o gerador junta
// as atividades de todas (cada uma diz quem a faz). A ficha:
//   funcao:     o que a categoria é no mundo, numa frase (a primeira folha que disser vale; as outras podem omitir)
//   quem:       quem mora, trabalha, circula ou serve ali ('moradores', 'fiéis', as profissões do BDEF.role…)
//   sistemas:   os módulos que sustentam a categoria ('G.Lar', 'G.Oficio', 'G.Depot'…): o gerador confere que existem
//   atividades: [atividade]
//   estado:     (opcional) o que o dono afirma da categoria — 'auditada' | 'parcial' | 'funcional' | 'validada'. O gerador
//               calcula o estado pelo que acha no código e nas provas e FALHA quando a folha afirma mais (nunca sobe sozinho)
//   notas:      o que falta, as limitações (vai para o relatório)
// A atividade:
//   id:         curto e único na categoria ('dormir', 'cozer-tijolo')
//   o:          o que é, em português ('dormir na cama da casa')
//   essencial:  true para o mínimo da categoria (adendo 10, etapa 3): sem todas as essenciais feitas, não é funcional
//   tipos:      os tipos onde ela acontece (sem isso: todos os da categoria)
//   pecas:      as peças de planta que ela usa (G.Interiors.ITEMS) — o gerador confere que existem e que as plantas de
//               amostra dos tipos as têm
//   usos:       os usos dos pontos ('deitar', 'assistir'…) — o gerador confere que alguma planta de amostra dos tipos tem
//               um ponto desse uso (de peça, de fileira — P.tiers — ou de marca — P.marks)
//   tarefa:     o tipo da tarefa que o mundo dá às pessoas para ela ('sleep', 'water'…): o gerador confere que o código a dá
//   ato:        a definição e o ato do G.Act, quando há ('oficio/moldar'): o gerador confere G.Act.DEFS
//   corpo:      o verbo do corpo encarnado (o id de um G.Interact: 'porta', 'atividade', 'cama'…): o gerador confere
//   recursos:   o que passa pelo livro (as chaves do estoque: 'argila', 'tijolo', 'coin'…)
//   resultado:  o que muda no mundo, numa frase
//   condicao:   quando ela está disponível, numa frase
//   feito:      true | 'parcial' | false — o que o dono afirma
//   provas:     os arquivos de prova que a cobrem ('qa/lugares.js'…): o gerador confere que existem; para 'validada', que
//               passaram no resultado da regressão (node qa/matriz-predios.js --resultados <pasta da regressão>)
//   dono:       quem a faz (P1…P4), quando não é o dono da folha
// O ESTADO de uma categoria (calculado): não auditada (nenhuma folha fala dela) · auditada (as atividades listadas, as
// essenciais marcadas) · parcial (alguma essencial feita ou parcial) · funcional (todas as essenciais feitas e o gerador acha
// no código o que elas dizem) · validada (funcional, e cada essencial com uma prova ao menos, todas passando no resultado).
//
// A folha do P4: as obras abertas da cidade — a praça, o poço, a fogueira, o aqueduto, a ruína —, e o lado do espaço de
// todas (a porta, as escadas, o ponto de uso de cada peça), que o qa/geometria.js conta prédio a prédio.
module.exports = {
  dono: 'P4',
  categorias: {
    cidade: {
      funcao: 'os lugares abertos e as obras de todos: onde o povo se junta e conversa, tira água, acende o primeiro fogo; o que sobra de um prédio caído',
      quem: 'todos os moradores da cidade',
      sistemas: ['G.Life', 'G.Village', 'G.Possess', 'G.Space'],
      atividades: [
        { id: 'fogo', o: 'o balde do poço contra o fogo', essencial: true, tipos: ['well'], tarefa: 'fire', resultado: 'o fogo perto de um poço apaga mais depressa', condicao: 'fogo a menos de 14 casas', feito: true, provas: [] },
        { id: 'juntar', o: 'juntar-se na praça: conversar, ouvir quem fala, a festa', essencial: true, tipos: ['praca'], dono: 'P2', pecas: ['fonte', 'banco', 'tribuna'], usos: ['conversar', 'ouvir', 'falar'], resultado: 'a conversa, o discurso e a festa acontecem ali', condicao: 'o dia da cidade', feito: false, provas: ['qa/biblioteca-praca.js'] },
        { id: 'entregar', o: 'entregar a carga na fogueira da aldeia que ainda não tem armazém', essencial: true, tipos: ['campfire'], tarefa: 'deliver', recursos: ['wood', 'food', 'stone'], resultado: 'o estoque do povo cresce', condicao: 'a aldeia sem armazém', feito: true, provas: [] },
        { id: 'pisar', o: 'o corpo anda e pisa onde a obra deixa: a praça, a borda do poço, os escombros da ruína', tipos: ['praca', 'well', 'ruin', 'aqueduto'], corpo: 'porta', resultado: 'nenhum (é o chão)', condicao: 'sempre', feito: 'parcial', provas: ['qa/encarna.js'] },
        { id: 'beber-poco', o: 'o corpo bebe no poço (hoje só no rio)', tipos: ['well'], corpo: 'agua', feito: false, provas: [] },
      ],
      notas: 'buscar água no poço é do P1 (a folha p1.js, com a prova qa/agua-solta.js); a praça tem planta desde a fase E (P4, int-civicos.js: a fonte, os dois bancos, a pedra de falar e os lugares de ouvir e de conversar — P.marks —, com a casca; qa/biblioteca-praca.js); o «juntar» espera o lado do P2 (quem vem à praça toma esses lugares); a ruína não tem planta (o corpo pisa a casa como o mundo a tem); o aqueduto não tem atividade própria: só leva água',
    },
  },
};
