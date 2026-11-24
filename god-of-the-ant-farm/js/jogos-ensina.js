'use strict';
// ============================================================
//  Os jogos se ensinam (G.JogosEnsina; a onda 4 da taverna, a
//  frente E — D-945 a D-949): a primeira partida de cada jogo da
//  mesa é guiada, passo a passo, por cima da partida de verdade,
//  apontando cada coisa na tela, em português simples; e o «?» da
//  mesa abre a qualquer hora as regras, curtas e com figuras, e
//  traz o guia de volta. Um motor só para os dois guias — as
//  Tabuletas e o copo dos dados —, com os passos de cada um como
//  dados (GUIAS): onde apontam, o que dizem, quando podem aparecer,
//  o que o jogador faz para seguir (erguer, jogar, dizer o palpite)
//  ou o que no jogo os leva adiante (as tabuletas virando, os copos
//  subindo).
//  O guia nunca segura o mundo (D-946): a partida é do mundo e anda
//  pelo passo dele; o guia só lê o que a tela mostra — o DOM, a vista
//  da partida (G.CartasUI._test.view, G.Cartas.doCorpo, G.JogoDados
//  .corpo) — e mostra: não pede nada às mãos, não escreve no mundo,
//  não para o relógio, não sorteia. Só se vê (na lista LOOK do
//  guard). A primeira partida de cada jogo é lembrada no navegador
//  (com try, como a dica da mesa, D-923; D-947).
// ============================================================
(function (G) {
  const Ens = G.JogosEnsina = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const touch = () => !!(G.Input3D && G.Input3D.touch);
  const tecla = a => (G.Input3D && G.Input3D.label ? G.Input3D.label(a) : a);
  const corpo = () => (G.Possess && G.Possess.body ? G.Possess.body() : null);
  Ens.desliga = false; // (as provas que medem outra coisa: o guia não aparece)

  // ------------------------------ a lembrança: a primeira partida de cada jogo (no navegador, com try: D-947) ------------------------------
  const CHAVE = id => 'gotaf-guia-' + id;
  const mem = {}; // (sem o navegador guardar nada: lembrado nesta sessão)
  Ens.visto = id => { if (mem[id]) return true; try { return localStorage.getItem(CHAVE(id)) === '1'; } catch (e) { return false; } };
  function marca(id) { mem[id] = true; try { localStorage.setItem(CHAVE(id), '1'); } catch (e) { } }
  Ens.esquece = id => { delete mem[id]; try { localStorage.removeItem(CHAVE(id)); } catch (e) { } }; // (as provas)

  // ------------------------------ o que se diz dos poderes: lido do cartas.js, nunca escrito aqui (D-949) ------------------------------
  // (os poderes das tabuletas dadas — o símbolo, a palavra-chave e a regra de cada um, como a própria tabuleta os diz —, sem repetir)
  function poderesDe(ids, quem) {
    const C = G.Cartas, A = G.CartasArte; if (!C || !A) return ''; const vistos = new Map();
    for (const id of ids) { const c = C.card(id); if (!c) continue; const k = c.p ? A.chave(c) : ''; const e = vistos.get(k); if (e) { if (quem && !e.nomes.includes(c.nome)) e.nomes.push(c.nome); continue; } vistos.set(k, { c, nomes: [c.nome] }); }
    let h = ''; for (const [k, e] of vistos) h += k ? `<li>${A.icone(e.c.p, 'ens-ico')}<span><b>${esc(k)}:</b> ${esc(e.c.txt)}${quem ? ` <em>${esc(e.nomes.join(', '))}</em>` : ''}</span></li>` : `<li><i class="ens-ico"></i><span><b>Sem poder:</b> só a força.${quem ? ` <em>${esc(e.nomes.join(', '))}</em>` : ''}</span></li>`;
    return `<ul class="ens-poderes">${h}</ul>`;
  }
  Ens.poderesDe = poderesDe;

  // ------------------------------ os guias: os passos de cada jogo, como dados (D-945) ------------------------------
  // Cada guia: o painel do jogo e a caixa dentro dele onde o balão fica (a mesa); se a tela dele está aberta; o contexto de agora (a vista da partida e o que a tela mostra — null sem uma
  // partida do corpo); se ela acabou; quando o guia se esconde (um painel por cima: o pedido de dobrar, o fim, a tabuleta grande, as
  // regras); e os passos. Cada passo: id; titulo; texto (c → HTML, com o que o mundo diz escapado); alvo (seletores ou funções: cada um,
  // uma luz na tela — null, o balão no meio); quando (c → pode aparecer agora); feito (c → o jogador já fez o que o passo pede: ele some,
  // visto ou não); segue (c → o jogo andou: o passo mostrado segue sozinho); botao (o «Próximo» — sem ele, o passo espera a ação ou o
  // jogo); acao (a instrução do que fazer, com o dedo no dedo); livre (o que o balão não cobre: a mão, os botões); urgente (a vez do
  // jogador: passa à frente dos que estão por ler — 1, ou c → quando passa); escuro (0: a tela sem o véu, para ver o que acontece); fim
  // (o último).
  const GUIAS = {};
  const vistaT = () => { const U = G.CartasUI; const v = U && U._test ? U._test.view : null; if (v) return v; const b = corpo(); return b && G.Cartas && G.Cartas.doCorpo ? G.Cartas.doCorpo(b) : null; };
  GUIAS.tabuletas = {
    nome: 'As Tabuletas',
    painel: () => document.getElementById('tab-panel'), caixa: '.tb-mesa',
    aberto: () => !!(G.CartasUI && G.CartasUI.isOpen && G.CartasUI.isOpen()),
    ctx(P) { const v = vistaT(); if (!v || !v.jogo) return null; return { P, v, q: s => P.querySelector(s), sel: P.querySelector('.tb-mao .ct-card.sel'), busy: P.classList.contains('busy'), faixa: P.querySelector('.tb-msg .tb-ev.big'), touch: touch() }; },
    jogo: c => c.v.jogo, acabou: c => !!c.v.fim,
    pausa: c => !!c.q('.tb-over:not(.hidden)') || !!c.q('.tb-zoom:not(.hidden)'),
    passos: [
      { id: 'ola', titulo: 'As Tabuletas', alvo: null, botao: 'Começar', quando: c => !c.busy,
        texto: () => 'Cada um joga com as tábuas pintadas do seu povo: os deuses, as criaturas e os heróis dos mitos. São <b>sete rodadas</b>, e quem juntar <b>mais glória</b> leva o pote. Vou mostrar como se joga, aqui mesmo, nesta partida.' },
      { id: 'trilha', titulo: 'As sete rodadas', alvo: ['.tb-trilha'], botao: 'Próximo', quando: c => !c.busy,
        texto: c => `Cada ficha é uma rodada, e o número nela é a <b>oferenda</b>: a glória que a rodada vale — ${c.v.of.join(', ')}. A que brilha é a de agora. As últimas valem mais: guarde tabuletas fortes para elas.` },
      { id: 'mao', titulo: 'A sua mão', alvo: ['.tb-mao .ct-card'], livre: ['.tb-btns'], quando: c => !c.busy && !c.v.posta, feito: c => !!c.sel || c.busy || !!c.v.posta,
        acao: c => (c.touch ? 'Toque numa tabuleta para erguê-la' : 'Clique numa tabuleta (ou use ← →)'), dedo: c => { const L = c.P.querySelectorAll('.tb-mao .ct-card'); return L[Math.floor(L.length / 2)] || null; },
        texto: () => 'Estas são as suas tabuletas. O número no canto de cima é a <b>força</b>; embaixo vem o <b>poder</b> de cada uma, com a palavra-chave em negrito.' },
      { id: 'joga', titulo: 'Ver grande e jogar', alvo: ['.tb-mao .ct-card.sel', '.tb-go'], livre: ['.tb-mao', '.tb-btns'], quando: c => !!c.sel && !c.busy, feito: c => c.busy || !!c.v.posta,
        acao: c => (c.touch ? 'Toque de novo nela, ou em «Jogar»' : `Clique de novo nela, ou em «Jogar» (${tecla('interagir')})`), dedo: '.tb-mao .ct-card.sel',
        texto: c => `${c.touch ? '<b>Segure o dedo</b> numa tabuleta' : `Aperte <b>${esc(tecla('pular'))}</b>`} para vê-la grande, com o mito dela. Escolhida, jogue a erguida: ela vai para a mesa, virada.` },
      { id: 'vira', titulo: 'As duas viram juntas', alvo: ['.tb-lado-o', '.tb-lado-m'], livre: ['.tb-msg', '.tb-top', '.tb-trilha'], escuro: 0, quando: c => c.busy, segue: c => !!c.faixa,
        texto: () => 'O outro também pôs a dele, virada. As duas viram juntas, e os poderes acontecem um a um: a faixa embaixo das mesas conta cada um.' },
      { id: 'leva', titulo: 'Quem leva a glória', alvo: ['.tb-gl-m', '.tb-gl-o'], botao: 'Próximo', quando: c => !!c.faixa || !c.busy,
        texto: () => 'A tabuleta de <b>maior força</b> leva a oferenda da rodada, e a glória soma no placar: a sua fica aqui embaixo; a dele, no alto. No <b>empate</b>, a oferenda fica no altar e soma na rodada seguinte.' },
      { id: 'poderes', titulo: 'Os poderes da sua mão', alvo: ['.tb-mao .ct-card'], botao: 'Próximo', quando: c => !c.busy && c.v.mao.length > 0,
        texto: c => `Cada tabuleta tem o poder do seu mito. Os da sua mão agora:${poderesDe(c.v.mao)}Todos os poderes estão no «?», no alto.` },
      { id: 'visao', titulo: 'Quem mostra primeiro', alvo: ['.tb-lado-o'], botao: 'Próximo', quando: c => !c.busy,
        texto: () => 'Em geral os dois escolhem às cegas. Mas quem joga uma tabuleta com <b>Visão</b> faz o outro mostrar primeiro na rodada seguinte: a dele fica aberta na mesa antes de você escolher.' },
      { id: 'dobrar', titulo: 'Dobrar a aposta', alvo: [c => c.q('.tb-dobra:not(.hidden)') || c.q('.tb-pote')], botao: 'Próximo', quando: c => !c.busy,
        texto: c => (c.q('.tb-dobra:not(.hidden)') ? 'Uma vez por partida, no começo de uma rodada, você pode <b>dobrar</b> a aposta: o outro aceita — e cada um põe mais no pote — ou desiste, e o pote é seu. Ele também pode pedir: aí quem aceita ou desiste é você.'
          : 'Numa partida com aposta aparece embaixo o botão <b>Dobrar</b>: uma vez por partida, no começo de uma rodada, o outro aceita a aposta dobrada — ou desiste, e o pote é de quem dobrou.') },
      { id: 'manga', titulo: 'A manga', alvo: ['.tb-manga'], botao: 'Próximo', quando: c => !c.busy,
        texto: () => 'A <b>manga</b> é a trapaça: ligada, a melhor tabuleta do seu monte toma o lugar da que você jogar. Mas se o outro vir, a partida acaba ali e <b>o pote é dele</b>.' },
      { id: 'fim', titulo: 'Quem ganha', alvo: ['.tb-ajuda'], botao: 'Entendi', fim: true, quando: c => !c.busy,
        texto: () => 'Depois da sétima rodada, quem tiver <b>mais glória</b> leva o pote. As regras ficam sempre aqui, no «?». Boa sorte!' },
    ],
  };
  // (o copo: a partida do corpo — a vista do mundo, G.JogoDados.corpo —; o corpo dentro dela; a vez dele; o palpite que ele já disse)
  const meu = s => (s && s.jogadores ? s.jogadores.find(p => p.eu) : null);
  GUIAS.copo = {
    nome: 'O copo',
    painel: () => document.getElementById('dados-panel'), caixa: '.jd-card',
    aberto: () => !!(G.JogoDadosUI && G.JogoDadosUI.isOpen && G.JogoDadosUI.isOpen()),
    ctx(P) { const b = corpo(); const s = b && G.JogoDados && G.JogoDados.corpo ? G.JogoDados.corpo(b) : null; if (!s || !s.eu) return null; const me = meu(s);
      return { P, s, me, q: x => P.querySelector(x), minha: s.fase === 'palpite' && s.vez === s.eu, disse: !!me && me.palpite !== null, touch: touch() }; },
    jogo: c => c.s.op, acabou: c => !c.s.jogo && c.s.fase !== 'fim',
    // (as regras do «?», e o cartão do fim da frente F — quem levou o pote, a festa, o «Jogar de novo» —: o guia nunca cobre o fim)
    pausa: c => !!c.q('.jd-regras:not(.hidden)') || !!c.q('.jd-banner .jd-fim'),
    passos: [
      { id: 'ola', titulo: 'O copo', alvo: null, botao: 'Começar', livre: ['.jd-ctl', '.jd-top'], quando: c => c.s.fase !== 'fim',
        texto: () => 'Cada um esconde os seus dados debaixo do copo e diz quanto acha que dão <b>todos os dados da mesa</b>, somados. Vou mostrar como se joga, aqui mesmo, nesta partida.' },
      { id: 'dados', titulo: 'Os seus dados', alvo: [c => (G.JogoDadosUI && G.JogoDadosUI.zona ? G.JogoDadosUI.zona('bandeja') : null) || c.q('.jd-seat.eu')], botao: 'Próximo', livre: ['.jd-ctl', '.jd-top'], quando: c => c.s.fase !== 'convite' && c.s.fase !== 'fim',
        texto: c => `Os copos sacodem e cada um esconde ${c.s.jogadores.length === 2 ? 'três dados (com dois à mesa)' : 'dois dados'}. <b>Você só vê os seus</b>: estão aqui, na sua frente. Os dos outros ficam debaixo dos copos até eles subirem.` },
      { id: 'palpite', titulo: 'O palpite', alvo: ['.jd-seat:not(.eu)'], botao: 'Próximo', livre: ['.jd-ctl', '.jd-top'], quando: c => c.s.fase === 'palpite' || c.s.fase === 'sacode', feito: c => c.minha,
        texto: () => 'Um de cada vez, cada um diz quanto acha que dá a <b>soma de todos os dados da mesa</b> — os seus e os dos outros. Não vale repetir um número que alguém já disse.' },
      { id: 'vez', titulo: 'A sua vez', alvo: ['.jd-ctl'], livre: ['.jd-top'], urgente: 1, quando: c => c.minha && !c.disse, feito: c => c.disse,
        acao: c => (c.touch ? 'Escolha o número e toque em «Dizer»' : 'Escolha com ← → (ou 1–5) e aperte Enter'), dedo: '.jd-ctl [data-a="dizer"]',
        texto: c => `Quanto dão <b>todos</b> os dados da mesa? Escolha com − e + (ou num atalho). ${c.me && c.me.faces ? `Os seus somam <b>${c.me.faces.reduce((a, x) => a + x, 0)}</b>; ` : ''}cada dado que você não vê dá, em média, 3,5.` },
      { id: 'sobem', titulo: 'Os copos sobem', alvo: ['.jd-mid'], escuro: 0, botao: 'Próximo', livre: ['.jd-ctl', '.jd-top'], quando: c => c.s.fase === 'revela', segue: c => c.s.fase === 'sacode' || c.s.fase === 'fim',
        texto: () => 'A soma é contada. Quem <b>cravou</b> a soma em cheio faz <b>cada um dos outros</b> perder um dado. Se ninguém cravou, quem ficou <b>mais longe</b> perde um.' },
      { id: 'fim', titulo: 'Quem leva o pote', alvo: ['*.jd-seat .jd-pips'], botao: 'Entendi', fim: true, livre: ['.jd-ctl', '.jd-top'], quando: c => c.s.fase !== 'fim' && c.s.rodada >= 2,
        texto: () => 'Os pontinhos debaixo de cada nome são os dados que restam. Quem fica sem dados está fora; o <b>último que ainda tem dados</b> leva o pote. As regras ficam no «?».' },
    ],
  };
  Ens.GUIAS = GUIAS;

  // ------------------------------ o estado: o guia de agora ------------------------------
  // (cur: { id, i — o passo mostrado, −1 nenhum —, feito: [] — os passos que já passaram —, jogo: a partida que ele guia (a primeira que
  // viu), desde: o relógio da tela em que o passo apareceu }; nada disto é do mundo: um mundo novo ou um save aberto o esquece)
  let cur = null, layer = null, layerOf = null, sig = '', regras = null;
  G.worldHooks.push(() => { para(false); if (regras) regras.classList.add('hidden'); });
  Ens.ativo = () => (cur ? { id: cur.id, passo: cur.i >= 0 ? GUIAS[cur.id].passos[cur.i].id : '', i: cur.i, n: GUIAS[cur.id].passos.length, feitos: cur.feito.filter(Boolean).length, visivel: !!(layer && !layer.classList.contains('hidden')) } : null);
  // começar um guia (o: { forcado — pelo «?»: mesmo já visto })
  Ens.comeca = function (id, o) {
    const g = GUIAS[id]; if (!g) return false; o = o || {};
    if (!o.forcado && Ens.visto(id)) return false;
    cur = { id, i: -1, feito: g.passos.map(() => false), jogo: 0, desde: 0, forcado: !!o.forcado }; sig = ''; return true;
  };
  // parar: o guia some; visto: a lembrança (o fim, o «Pular», a partida que acabou)
  function para(visto) { if (cur && visto) marca(cur.id); cur = null; sig = ''; if (layer) layer.classList.add('hidden'); }
  Ens.pula = () => para(true);

  // ------------------------------ a camada do guia (dentro do painel do jogo) ------------------------------
  function camada(P) {
    if (layer && layerOf === P && layer.isConnected) return layer;
    if (layer) layer.remove();
    layer = document.createElement('div'); layer.className = 'ens hidden'; layerOf = P;
    layer.innerHTML = `<svg class="ens-veu" aria-hidden="true"><path fill-rule="evenodd"/></svg><div class="ens-luzes"></div><div class="ens-dedo" aria-hidden="true">${DEDO}</div>
      <div class="ens-balao" role="dialog" aria-live="polite"><i class="ens-seta"></i><div class="ens-topo"><span class="ens-pts"></span><button class="ens-pular" data-ens="pula">Pular o guia</button></div><h4></h4><div class="ens-txt"></div><div class="ens-acao"></div><div class="ens-btns"><button class="ens-go" data-ens="segue"></button></div></div>`;
    P.appendChild(layer);
    // (os botões do guia são dele: o clique não desce para a mesa)
    layer.addEventListener('click', e => { const b = e.target.closest('[data-ens]'); if (!b) return; e.stopPropagation(); if (b.dataset.ens === 'pula') { if (G.Audio && G.Audio.ui) G.Audio.ui('click'); para(true); } else if (b.dataset.ens === 'segue') avanca(); });
    layer.addEventListener('pointerdown', e => { if (e.target.closest('.ens-balao')) e.stopPropagation(); });
    return layer;
  }
  // (o dedo que toca: o que fazer, no lugar)
  const DEDO = '<svg viewBox="0 0 48 56"><path d="M17 30V9.5a4 4 0 0 1 8 0V25l.4-3.6a3.6 3.6 0 0 1 7.2.4V27l.3-2.4a3.5 3.5 0 0 1 7 .5V30l.3-1.6a3.3 3.3 0 0 1 6.5 1V38c0 9-6 16-15 16h-3c-6 0-10-3-13-8l-7-11a3.6 3.6 0 0 1 5.6-4.4z" fill="#fff7e3" stroke="#3a2414" stroke-width="2.6" stroke-linejoin="round"/><path d="M25 25v8M32.6 27v6M40 30v4" stroke="#3a2414" stroke-width="2" stroke-linecap="round"/></svg>';
  // o passo segue (o «Próximo», o «Entendi»): feito; o último fecha o guia, lembrado
  function avanca() { if (!cur || cur.i < 0) return; const g = GUIAS[cur.id]; const p = g.passos[cur.i]; cur.feito[cur.i] = true; if (G.Audio && G.Audio.ui) G.Audio.ui('click'); if (p.fim) { para(true); return; } cur.i = -1; sig = ''; }

  // ------------------------------ a escolha do passo de agora ------------------------------
  // (o primeiro por fazer, na ordem, quando a hora dele chegou — senão espera; o urgente — a vez do jogador — passa à frente)
  const ok = (f, c) => (typeof f === 'function' ? !!f(c) : f === undefined ? true : !!f);
  function escolhe(g, c) {
    const L = g.passos;
    for (let i = 0; i < L.length; i++) if (!cur.feito[i] && L[i].urgente && ok(L[i].urgente, c) && ok(L[i].quando, c)) return i;
    for (let i = 0; i < L.length; i++) if (!cur.feito[i]) return ok(L[i].quando, c) ? i : -1;
    return -1;
  }

  // ------------------------------ o quadro (a tela do corpo, a cada quadro) ------------------------------
  Ens.frame = function () {
    if (Ens.desliga || typeof document === 'undefined' || typeof getComputedStyle !== 'function') return; // (só no navegador: em Node o DOM é de mentira)
    // (a primeira partida de um jogo: o guia começa sozinho)
    if (!cur) { for (const id of Object.keys(GUIAS)) { const g = GUIAS[id]; if (!g.aberto() || Ens.visto(id)) continue; const P = g.painel(); const c = P && g.ctx(P); if (c && !g.acabou(c)) { Ens.comeca(id); break; } } }
    if (!cur) { if (layer) layer.classList.add('hidden'); return; }
    const g = GUIAS[cur.id]; const P = g.painel(); if (!P || !g.aberto()) { if (layer) layer.classList.add('hidden'); return; }
    const c = g.ctx(P);
    // (a partida que o guia acompanha é a primeira que ele viu; acabou — ou não há mais a do corpo —: o guia some, e a primeira partida
    // está vista. Pedido pelo «?» antes de uma partida, espera por ela)
    if (c && !cur.jogo) cur.jogo = g.jogo(c);
    if (cur.jogo && (!c || g.jogo(c) !== cur.jogo || g.acabou(c))) { para(true); return; }
    if (!c) { if (layer) layer.classList.add('hidden'); return; }
    const L = camada(P);
    // (o que o jogador já fez passa, visto ou não; o passo mostrado segue quando o jogo anda)
    for (let i = 0; i < g.passos.length; i++) if (!cur.feito[i] && g.passos[i].feito && ok(g.passos[i].feito, c)) cur.feito[i] = true;
    if (cur.i >= 0 && (cur.feito[cur.i] || (g.passos[cur.i].segue && ok(g.passos[cur.i].segue, c)))) { cur.feito[cur.i] = true; if (g.passos[cur.i].fim) { para(true); return; } cur.i = -1; }
    if (cur.feito.every(Boolean)) { para(true); return; }
    // (um painel por cima — o pedido de dobrar, o fim, a tabuleta grande, as regras —: o guia se esconde e espera)
    if (g.pausa(c) || (regras && !regras.classList.contains('hidden'))) { L.classList.add('hidden'); return; }
    const i = escolhe(g, c); if (i !== cur.i) { cur.i = i; sig = ''; }
    if (i < 0) { L.classList.add('hidden'); return; }
    mostra(g, g.passos[i], c, L);
  };

  // ------------------------------ mostrar um passo: o véu, as luzes, o balão e o dedo ------------------------------
  const rectOf = (x, P) => { if (!x) return null; if (x.getBoundingClientRect) { if (x.offsetParent === null && getComputedStyle(x).position !== 'fixed') return null; const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? { l: r.left, t: r.top, r: r.right, b: r.bottom } : null; } return Number.isFinite(x.l) ? x : null; };
  const uniao = L => { L = L.filter(Boolean); return L.length ? { l: Math.min(...L.map(r => r.l)), t: Math.min(...L.map(r => r.t)), r: Math.max(...L.map(r => r.r)), b: Math.max(...L.map(r => r.b)) } : null; };
  // (cada alvo, uma luz: o seletor junta tudo o que acha — as tabuletas da mão são uma luz só —, e com «*» na frente cada coisa achada é
  // uma luz — os dados de cada um, cada um na sua cadeira; a função dá um elemento ou um retângulo) → [{ k: o alvo, r }]
  function alvosK(p, c) {
    if (!p.alvo) return []; const out = [];
    p.alvo.forEach((a, k) => { if (typeof a === 'function') { const r = rectOf(a(c), c.P); if (r) out.push({ k, r }); return; }
      const L = [...c.P.querySelectorAll(a.replace(/^\*/, ''))].map(e => rectOf(e, c.P)).filter(Boolean);
      if (a[0] === '*') for (const r of L) out.push({ k, r }); else { const r = uniao(L); if (r) out.push({ k, r }); } });
    return out;
  }
  const alvos = (p, c) => alvosK(p, c).map(x => x.r);
  const livres = (p, c) => (p.livre || []).map(s => uniao([...c.P.querySelectorAll(s)].map(e => rectOf(e, c.P)))).filter(Boolean);
  const PAD = 6, GAP = 14, MARG = 10;
  const inter = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
  function mostra(g, p, c, L) {
    const B = L.querySelector('.ens-balao');
    // (o conteúdo, uma vez por passo — e de novo quando o que ele diz muda: a mão, o número dos dados)
    const n = g.passos.length; const feitos = cur.feito.filter(Boolean).length;
    const txt = p.texto(c); const acao = p.acao ? p.acao(c) : '';
    const s = `${cur.id}:${p.id}:${txt}:${acao}`;
    if (s !== sig) {
      sig = s; cur.desde = performance.now();
      B.querySelector('.ens-pts').innerHTML = `${g.passos.map((q, k) => `<i class="${cur.feito[k] ? 'on' : k === cur.i ? 'agora' : ''}"></i>`).join('')}<span>${Math.min(n, feitos + 1)}/${n}</span>`;
      B.querySelector('h4').textContent = p.titulo; B.querySelector('.ens-txt').innerHTML = txt;
      const A = B.querySelector('.ens-acao'); A.innerHTML = acao ? `<span class="ens-mao" aria-hidden="true">${DEDO}</span>${esc(acao)}` : ''; A.classList.toggle('hidden', !acao);
      const go = B.querySelector('.ens-go'); go.textContent = p.botao || ''; go.classList.toggle('hidden', !p.botao);
      B.classList.remove('pop'); void B.offsetWidth; B.classList.add('pop');
      L.dataset.passo = p.id; L.dataset.guia = cur.id;
    }
    L.classList.remove('hidden'); L.classList.toggle('claro', p.escuro === 0);
    // (onde está cada coisa agora: o painel, os alvos, o que o balão não cobre)
    const PR = c.P.getBoundingClientRect(); const T = alvos(p, c); const F = livres(p, c);
    // (o balão fica dentro da mesa — a moldura das Tabuletas, o cartão do copo —, não na tela inteira do painel)
    const AE = g.caixa ? c.P.querySelector(g.caixa) : null; const AR = AE ? AE.getBoundingClientRect() : PR;
    const X0 = AR.left - PR.left + MARG, Y0 = AR.top - PR.top + MARG, X1 = AR.right - PR.left - MARG, Y1 = AR.bottom - PR.top - MARG;
    const ox = PR.left, oy = PR.top, W = PR.width, H = PR.height;
    // (o véu, com um buraco em cada alvo; as luzes nos alvos)
    const hole = r => { const x = r.l - PAD - ox, y = r.t - PAD - oy, w = r.r - r.l + PAD * 2, h = r.b - r.t + PAD * 2, k = Math.min(12, w / 2, h / 2); return `M${(x + k).toFixed(1)} ${y.toFixed(1)}H${(x + w - k).toFixed(1)}A${k} ${k} 0 0 1 ${(x + w).toFixed(1)} ${(y + k).toFixed(1)}V${(y + h - k).toFixed(1)}A${k} ${k} 0 0 1 ${(x + w - k).toFixed(1)} ${(y + h).toFixed(1)}H${(x + k).toFixed(1)}A${k} ${k} 0 0 1 ${x.toFixed(1)} ${(y + h - k).toFixed(1)}V${(y + k).toFixed(1)}A${k} ${k} 0 0 1 ${(x + k).toFixed(1)} ${y.toFixed(1)}Z`; };
    const veu = L.querySelector('.ens-veu'); veu.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`); veu.querySelector('path').setAttribute('d', `M0 0H${W.toFixed(1)}V${H.toFixed(1)}H0Z${T.map(hole).join('')}`);
    const LZ = L.querySelector('.ens-luzes'); if (LZ.children.length !== T.length) LZ.innerHTML = T.map(() => '<i class="ens-luz"></i>').join('');
    T.forEach((r, k) => { const e = LZ.children[k]; e.style.cssText = `left:${(r.l - PAD - ox).toFixed(1)}px;top:${(r.t - PAD - oy).toFixed(1)}px;width:${(r.r - r.l + PAD * 2).toFixed(1)}px;height:${(r.b - r.t + PAD * 2).toFixed(1)}px`; });
    // (o balão: largo o quanto a tela deixa; junto do primeiro alvo — embaixo, em cima, ao lado —, onde não cobre nenhum alvo nem o que
    // fica livre; sem alvo, no meio)
    const bw = Math.min(340, X1 - X0); B.style.width = bw + 'px'; const bh = B.offsetHeight;
    const evita = T.map(r => ({ l: r.l - PAD - ox, t: r.t - PAD - oy, r: r.r + PAD - ox, b: r.b + PAD - oy })).concat(F.map(r => ({ l: r.l - ox, t: r.t - oy, r: r.r - ox, b: r.b - oy })));
    const cx = a => Math.max(X0, Math.min(X1 - bw, a - bw / 2)), cy = y => Math.max(Y0, Math.min(Y1 - bh, y)), cl = x => Math.max(X0, Math.min(X1 - bw, x));
    // (junto do primeiro alvo, com a seta; senão, numa faixa livre da mesa, sem seta — a mais perto do alvo, ou do meio sem alvo; nunca sobre
    // um alvo nem sobre o que fica livre, se houver onde)
    const C = []; const a = T.length ? evita[0] : null; const ay = a ? (a.t + a.b) / 2 : Y0 + (Y1 - Y0) * 0.42;
    if (a) { const ax = (a.l + a.r) / 2;
      C.push({ x: cx(ax), y: cy(a.b + GAP), lado: 'baixo' }); C.push({ x: cx(ax), y: cy(a.t - GAP - bh), lado: 'cima' });
      C.push({ x: cl(a.r + GAP), y: cy(ay - bh / 2), lado: 'dir' }); C.push({ x: cl(a.l - GAP - bw), y: cy(ay - bh / 2), lado: 'esq' }); }
    for (let y = Y0; y <= Y1 - bh; y += 12) C.push({ x: cx((X0 + X1) / 2), y, lado: '' });
    if (!C.length) C.push({ x: cx((X0 + X1) / 2), y: cy(ay - bh / 2), lado: '' });
    let pos = null, bs = Infinity; C.forEach((q, k) => { const r = { l: q.x, t: q.y, r: q.x + bw, b: q.y + bh }; const s2 = evita.reduce((s3, e) => s3 + inter(r, e), 0) * 10 + (q.lado ? 0 : (a ? 400 : 0) + Math.abs(q.y + bh / 2 - ay) * 0.5) + k * 0.01; if (s2 < bs) { bs = s2; pos = q; } });
    B.style.left = pos.x.toFixed(1) + 'px'; B.style.top = pos.y.toFixed(1) + 'px';
    // (a seta: da borda do balão para o alvo)
    const seta = B.querySelector('.ens-seta'); seta.className = 'ens-seta' + (pos.lado ? ' ' + pos.lado : ' nao');
    if (pos.lado && T.length) { const a = evita[0]; if (pos.lado === 'baixo' || pos.lado === 'cima') seta.style.cssText = `left:${Math.max(18, Math.min(bw - 18, (a.l + a.r) / 2 - pos.x)).toFixed(1)}px`; else seta.style.cssText = `top:${Math.max(18, Math.min(bh - 18, (a.t + a.b) / 2 - pos.y)).toFixed(1)}px`; }
    // (o dedo: no que se toca)
    const D = L.querySelector('.ens-dedo'); let dr = null;
    if (p.dedo) dr = rectOf(typeof p.dedo === 'function' ? p.dedo(c) : c.P.querySelector(p.dedo), c.P);
    // (numa coisa alta — uma tabuleta —, o dedo pousa na figura, acima da regra que ela diz; num botão, no meio)
    D.classList.toggle('hidden', !dr); if (dr) { const h = dr.b - dr.t; D.style.cssText = `left:${((dr.l + dr.r) / 2 - ox).toFixed(1)}px;top:${((h > 90 ? dr.t + h * 0.34 : (dr.t + dr.b) / 2) - oy).toFixed(1)}px`; }
  }

  // ------------------------------ as regras, curtas e com figuras (o «?» da mesa das Tabuletas: D-949) ------------------------------
  // (o que se vê do jogo de agora: os dois povos da partida, ou todos — os poderes lidos das tabuletas deles)
  Ens.ajuda = function (id) {
    if (id !== 'tabuletas') return false; const g = GUIAS.tabuletas; const P = g.painel(); if (!P || !G.Cartas || !G.CartasArte) return false;
    const C = G.Cartas, A = G.CartasArte; const v = vistaT(); const civ = v && v.civ ? v.civ : C.POVOS; const ids = []; for (const p of civ) for (const c of (C.DECKS[p] || [])) ids.push(c.id);
    const exemplo = (C.DECKS[civ[0]] || C.DECKS.classico).slice().sort((a, b) => b.f - a.f || (a.id < b.id ? -1 : 1))[0];
    if (!regras || !regras.isConnected) {
      regras = document.createElement('div'); regras.className = 'ens-regras hidden'; P.appendChild(regras);
      regras.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-ens]'); if (!b) return; if (G.Audio && G.Audio.ui) G.Audio.ui('click'); regras.classList.add('hidden');
        if (b.dataset.ens === 'guia') Ens.comeca('tabuletas', { forcado: 1 }); });
      regras.addEventListener('pointerdown', e => e.stopPropagation());
    }
    const tk = C.OF.map((n, r) => `<i class="${r === 0 ? 'agora' : ''}">${n}</i>`).join('');
    regras.innerHTML = `<div class="ens-folha" role="dialog" aria-label="Como se joga as Tabuletas"><h3>Como se joga</h3>
      <div class="ens-sec"><div class="ens-fig ens-trilha">${tk}</div><p><b>Sete rodadas.</b> Cada ficha é uma rodada; o número é a <b>oferenda</b>, a glória que ela vale. A cada rodada, cada um compra uma tabuleta do monte.</p></div>
      <div class="ens-sec"><div class="ens-fig ens-duelo">${A.htmlVerso(civ[1] || civ[0], 'ens-c')}<b>×</b>${A.html(exemplo.id, { mini: true, cls: 'ens-c' })}</div><p>Os dois põem uma tabuleta <b>virada</b> e viram juntos. A de <b>maior força</b> (o número no canto) leva a oferenda; no empate, ela fica no altar e soma na rodada seguinte.</p></div>
      <div class="ens-sec"><p><b>A mão:</b> ${touch() ? 'toque para erguer, toque de novo para jogar, segure para ver grande' : `clique para erguer, clique de novo (ou ${esc(tecla('interagir'))}) para jogar, ${esc(tecla('pular'))} mostra grande`}.</p>
        <p><b>Dobrar:</b> uma vez por partida, no começo de uma rodada — o outro aceita, ou desiste e o pote é seu.</p><p><b>Manga:</b> a melhor do seu monte troca a que você jogar; se o outro vir, o pote é dele.</p>
        <p><b>No fim</b>, quem tiver mais glória leva o pote.</p></div>
      <div class="ens-sec"><h4>Os poderes${v && v.civ ? ' desta partida' : ''}</h4>${poderesDe(ids, true)}</div>
      <div class="ens-btns2"><button class="ens-no" data-ens="fecha">Voltar à mesa</button><button class="ens-go" data-ens="guia">Ver o guia passo a passo</button></div></div>`;
    regras.classList.remove('hidden'); regras.scrollTop = 0; if (G.Audio && G.Audio.ui) G.Audio.ui('click'); return true;
  };
  Ens.regrasAbertas = () => !!(regras && regras.isConnected && !regras.classList.contains('hidden'));
  // (o Esc e o fechar da tela fecham as regras primeiro)
  if (G.IncUI && G.IncUI.closers) G.IncUI.closers.push(() => { if (regras) regras.classList.add('hidden'); });
  // (o «?» do teclado na mesa das Tabuletas, como no copo)
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('keydown', e => { if (e.repeat || e.key !== '?') return; const g = GUIAS.tabuletas; if (!g.aberto()) return; if (Ens.regrasAbertas()) regras.classList.add('hidden'); else Ens.ajuda('tabuletas'); });

  // ------------------------------ o verificador do guia (as provas: D-945) ------------------------------
  // o passo mostrado agora: cada alvo visível e dentro da tela; o balão inteiro na tela, sem cobrir nenhum alvo nem o que fica livre; nenhum
  // texto dele cortado; o dedo sobre o que se toca → a lista do que está errado ([] quando está certo)
  Ens.check = function () {
    const out = []; if (!cur || cur.i < 0 || !layer || layer.classList.contains('hidden')) return out;
    const g = GUIAS[cur.id]; const p = g.passos[cur.i]; const P = g.painel(); const c = P && g.ctx(P); if (!c) return ['o guia sem a partida'];
    const TK = alvosK(p, c); const T = TK.map(x => x.r); const n0 = p.alvo ? p.alvo.length - new Set(TK.map(x => x.k)).size : 0; if (n0) out.push(`${p.id}: ${n0} alvo(s) sem nada visível`);
    const vw = innerWidth, vh = innerHeight; const dentro = r => r.l >= -0.5 && r.t >= -0.5 && r.r <= vw + 0.5 && r.b <= vh + 0.5;
    for (const r of T) if (!dentro(r)) out.push(`${p.id}: um alvo fora da tela`);
    const B = layer.querySelector('.ens-balao').getBoundingClientRect(); const br = { l: B.left, t: B.top, r: B.right, b: B.bottom };
    if (!dentro(br)) out.push(`${p.id}: o balão fora da tela`);
    for (const r of T) if (inter(br, r) > 4) out.push(`${p.id}: o balão cobre o alvo`);
    for (const r of livres(p, c)) if (inter(br, r) > 4) out.push(`${p.id}: o balão cobre o que fica livre`);
    for (const e of layer.querySelectorAll('.ens-balao h4, .ens-txt, .ens-acao, .ens-balao button')) if (e.offsetParent && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) out.push(`${p.id}: texto cortado em ${e.className || e.tagName}`);
    const D = layer.querySelector('.ens-dedo'); if (p.dedo && D.classList.contains('hidden')) out.push(`${p.id}: o dedo sem o que tocar`);
    return out;
  };

  // ------------------------------ a cada quadro da tela do corpo ------------------------------
  // (o quadro do guia roda depois das telas dos jogos, que se redesenham no mesmo quadro — a altura dos controles do copo muda e a mesa anda —:
  // o guia mede o que elas acabaram de pôr na tela. Por isso se pendura quando a página acabou de carregar os arquivos, por fora delas)
  let ligado = false;
  const liga = () => { const f0 = G.IncUI && G.IncUI.frame; if (!f0 || ligado) return; ligado = true; G.IncUI.frame = function (rdt) { const r = f0.apply(this, arguments); Ens.frame(rdt); return r; }; };
  if (typeof document !== 'undefined' && document.readyState === 'loading' && document.addEventListener) document.addEventListener('DOMContentLoaded', liga); else liga();
})(window.G);
