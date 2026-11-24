'use strict';
// ============================================================
//  A mesa das Tabuletas (G.CartasUI; a quarta onda da taverna, T5
//  — D-862, D-869): a tela do jogo de cartas do corpo. Sentado a
//  uma mesa da taverna, o corpo chama alguém para as tabuletas (o
//  verbo «Jogar tabuletas», ou «Chamar para as tabuletas» numa
//  pessoa): escolhe com quem e a aposta, e a mesa abre — a mão em
//  leque embaixo, a do outro em cima, virada; a trilha das sete
//  oferendas, o altar, o pote de moedas, a glória de cada um, o
//  rosto e o nome de quem joga (o que o corpo sabe dele: G.Possess
//  .knows). Tocar uma tabuleta a ergue; segurá-la (ou o espaço) a
//  mostra grande; tocar de novo, ou «Jogar», a põe na mesa. Cada
//  pedido vai pelas mãos (G.Possess.apply → G.Cartas) e é feito
//  pelo mundo; a tela só mostra o que o mundo decidiu (D-669): a
//  tabuleta voando à mesa, as duas virando, os poderes acontecendo
//  — o golpe sacode, o raio clareia, a trapaça troca, a égide
//  brilha, a maré dobra —, e a oferenda indo para quem venceu. Pelo
//  toque, pelo teclado (← →, 1–5, E joga, F dobra, espaço mostra,
//  Esc sai) e pelo controle. O som pela porta de tela (G.Audio.ui).
//  Só se vê: lê o mundo e não escreve nada (regra 391).
// ============================================================
(function (G) {
  const UI = G.CartasUI = {};
  const I = G.Interact, C = G.Cartas, Ar = G.CartasArte; if (!I || !G.Possess || !C || !Ar) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = () => G.Possess; const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const toast = (t, d) => { if (t && G.IncUI && G.IncUI.toast) G.IncUI.toast(t, d || 2.6); };
  const deny = r => { if (r && r.why) toast(r.why); if (G.Audio && G.Audio.play) G.Audio.play('deny'); };
  const som = (k, o) => { if (G.Audio && G.Audio.ui) G.Audio.ui(k, Object.assign({ mat: matDe() }, o || {})); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // (a festa das mesas, G.JogoFX — D-940 —; uma prova sem ela carregada: nada festeja, nada quebra)
  const NOFX = { em() { }, burst() { }, anel() { }, chuva() { }, moedas: () => Promise.resolve(), conta: (el, de, para, ms, fmt) => { if (el) el.textContent = (fmt || (x => String(Math.round(x))))(para); return Promise.resolve(); }, flutua() { }, pulso() { }, tremor() { }, clarao() { }, raios() { }, cores: () => ['#ffd76a'], limpa() { }, menos: () => false };
  const JFX = () => G.JogoFX || NOFX;
  let panel = null, open = false, gid = 0, shown = 0, busy = false, sel = -1, manga = false, zoom = null, upT = 0, closer = false, view = null, fimVisto = 0, faceOf = 0, tok = 0, pend = false, last = null;
  G.worldHooks.push(() => { if (open) hide(true); gid = 0; shown = 0; busy = false; sel = -1; manga = false; view = null; fimVisto = 0; faceOf = 0; pend = false; });
  UI.isOpen = () => open;
  UI.force = null; // (a mão das fotos: um estado mostrado para a foto, nunca o do mundo)
  const vista = () => (UI.force ? UI.force() : C.doCorpo(P().body()));
  const matDe = () => { const v = view || last; const k = v && v.baralho; return k ? String(k).split('.')[1] || 'madeira' : 'madeira'; };

  // ------------------------------ os verbos do corpo à mesa (G.Interact.verb, regra 141) ------------------------------
  const pode = v => C.podeCorpo(v);
  // (a etiqueta diz de onde vêm os baralhos da partida — o seu, os da casa emprestados e o aluguel, a espera por um livre: a frente J,
  // D-933 a D-935; o porquê é do mundo: G.Cartas.podeCorpo)
  const preco = (v, n) => { const b = v && v.inside ? G.S.buildings.get(v.inside) : null; return b ? C.preco(b, n) : String(n); };
  const fonte = (v, c) => (c.de ? ` — ${c.de}${c.aluguel ? ` (aluguel ${preco(v, c.aluguel)})` : ''}` : '');
  I.verb('taverna', { id: 'tv-cartas', k: 'outra', ord: 5,
    label: (ctx, t) => { if (t.bal) return ''; const c = pode(ctx.v); return c.ok ? (c.jogo ? 'Voltar à partida de tabuletas' : `Jogar tabuletas${fonte(ctx.v, c)}`) : c.espera ? 'Jogar tabuletas — esperando um baralho livre' : c.why && c.why !== 'Sente-se a uma mesa da taverna.' ? 'Jogar tabuletas' : ''; },
    can: ctx => pode(ctx.v),
    run: ctx => { const c = pode(ctx.v); if (c.jogo) { UI.abrir(c.jogo); return { ok: true }; } UI.convite(null); return { ok: true }; } });
  I.verb('pessoa', { id: 'pe-cartas', k: 'outra', ord: 7,
    label: (ctx, t) => { const c = C.podeCorpo(ctx.v, t.o && t.o.id); return c.ok && !c.jogo ? `Chamar ${P().knows.call(ctx.v, t.o)} para as tabuletas${fonte(ctx.v, c)}` : ''; },
    can: (ctx, t) => C.podeCorpo(ctx.v, t.o && t.o.id),
    run: (ctx, t) => { UI.convite(t.o.id); return { ok: true }; } });
  // (sem baralho seu, na taverna: comprar um do taverneiro — o que sobra, ou um que ele faz hoje do material da casa —, pelas mãos
  // (G.Possess.apply → G.JogosCasa.comprar; D-936); só aparece enquanto ele poderia vender, ou quando o que falta é o dinheiro)
  const JCa = () => G.JogosCasa;
  I.verb('taverna', { id: 'jc-baralho-compra', k: 'outra', ord: 5.5,
    label: (ctx, t) => { if (t.bal || !JCa() || JCa().proprio(ctx.v, 'baralho')) return ''; const c = JCa().podeComprar(ctx.v, 'baralho'); if (!c || !c.k) return '';
      return `Comprar um baralho do taverneiro${c.preco ? ` (${preco(ctx.v, c.preco)})` : ''}`; },
    can: ctx => { const c = JCa() ? JCa().podeComprar(ctx.v, 'baralho') : null; return c ? { ok: c.ok, why: c.why } : { ok: false }; },
    run: () => { G.IncUI.when(P().apply(w => G.JogosCasa.comprar(w, 'baralho')), r => { som('cartas-embaralhar'); toast(r.msg, 2.6); }, deny); return { ok: true }; } });

  // ------------------------------ o painel ------------------------------
  function build() {
    const root = G.IncUI && G.IncUI.root && G.IncUI.root(); if (!root) return false; if (panel) return true;
    Ar.pronto(document);
    panel = document.createElement('div'); panel.id = 'tab-panel'; panel.className = 'tb hidden';
    panel.innerHTML = `<div class="tb-mesa">
      <header class="tb-top"><div class="tb-who"><span class="tb-face"><canvas width="128" height="128"></canvas></span><span class="tb-nm"><b></b><small></small></span></div>
        <div class="tb-gl tb-gl-o" title="A glória do outro"><b>0</b><small>glória</small></div><button class="tb-ajuda" data-a="ajuda" aria-label="Como se joga" title="Como se joga">?</button><button class="tb-x" data-a="sair" aria-label="Sair" title="Sair (Esc)">×</button></header>
      <div class="tb-mo"></div>
      <div class="tb-centro"><div class="tb-trilha"></div>
        <div class="tb-campo"><div class="tb-lado tb-lado-o"><div class="tb-slot tb-so"></div><span class="tb-slot-n tb-so-n"></span></div><div class="tb-altar"><div class="tb-of"></div><div class="tb-pote"></div></div><div class="tb-lado tb-lado-m"><div class="tb-slot tb-sm"></div><span class="tb-slot-n tb-sm-n">Você</span></div></div>
        <div class="tb-msg" aria-live="polite"></div></div>
      <div class="tb-eu"><div class="tb-gl tb-gl-m" title="A sua glória"><b>0</b><small>glória</small></div><div class="tb-info"></div><div class="tb-monte" title="O seu monte"></div></div>
      <div class="tb-mao"></div>
      <div class="tb-btns"><button class="tb-b tb-manga" data-a="manga" title="Esconder uma tabuleta na manga (o risco é seu)">Manga</button><button class="tb-b tb-dobra" data-a="dobrar">Dobrar</button><button class="tb-b tb-go" data-a="jogar" disabled>Jogar</button></div>
      <div class="tb-hint"></div></div>
      <div class="tb-zoom hidden" data-a="zoom"></div><div class="tb-over hidden"></div>`;
    root.appendChild(panel);
    panel.addEventListener('click', onClick);
    panel.addEventListener('contextmenu', e => e.preventDefault());
    // (segurar uma tabuleta: grande; soltar: de volta)
    let hold = 0, holdEl = null;
    panel.addEventListener('pointerdown', e => { const c = e.target.closest('.tb-mao .ct-card, .tb-slot .ct-card'); if (!c) return; holdEl = c; clearTimeout(hold); hold = setTimeout(() => { if (holdEl === c) { mostra(c.dataset.id); holdEl = null; } }, 420); });
    const up = () => { clearTimeout(hold); holdEl = null; }; panel.addEventListener('pointerup', up); panel.addEventListener('pointercancel', up); panel.addEventListener('pointerleave', up);
    // (no PC, a tabuleta sob o ponteiro: o brilho de folha segue a mão)
    panel.addEventListener('pointermove', e => { const c = e.target.closest('.ct-r-lendaria, .ct-r-unica'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--fx', `${((e.clientX - r.left) / r.width * 100).toFixed(0)}%`); c.style.setProperty('--fy', `${((e.clientY - r.top) / r.height * 100).toFixed(0)}%`); });
    if (!closer) { closer = true; G.IncUI.closers.push(() => { if (open) pedeSair(); }); }
    return true;
  }
  function show(force) {
    if (!G.Modes.inc() || !build()) return false;
    if (!force && G.Modes.panel() && !G.Modes.panelIs('cartas')) return false;
    G.IncUI.closeAll(); G.Modes.setPanel('cartas'); G.Input3D.free(); G.IncUI.root().classList.add('tb-on');
    open = true; panel.classList.remove('hidden'); return true;
  }
  function hide(quiet) {
    open = false; tok++; busy = false; zoom = null; if (panel) { panel.classList.add('hidden'); panel.querySelector('.tb-over').classList.add('hidden'); panel.querySelector('.tb-zoom').classList.add('hidden'); }
    JFX().limpa(); // (a tela fechada: nenhuma partícula, moeda ou glória contando fica rodando — D-955)
    const r = G.IncUI && G.IncUI.root && G.IncUI.root(); if (r) r.classList.remove('tb-on');
    if (G.Modes && G.Modes.panelIs && G.Modes.panelIs('cartas')) G.Modes.setPanel(null); void quiet;
  }
  UI.close = () => { if (open) hide(); };

  // ------------------------------ o convite: com quem e por quanto ------------------------------
  UI.convite = function (oId) {
    const v = P().body(); const c = C.podeCorpo(v, oId); if (!c.ok) { deny(c); return false; } if (c.jogo) return UI.abrir(c.jogo);
    if (!show(true)) return false; gid = 0; view = null; render0(); const S = G.S; const b = S.buildings.get(c.b);
    const ppl = c.todos.map(id => S.villagers.get(id)).filter(Boolean); let who = c.o, ap = c.apostas[Math.min(1, c.apostas.length - 1)];
    const draw = () => {
      const o = S.villagers.get(who);
      // (os baralhos da partida com quem foi escolhido — o seu ou um da casa, e o dele —, e o aluguel dos da casa, que é de quem chama: D-933)
      const cc = C.podeCorpo(v, who); const aps = cc.ok && cc.apostas ? cc.apostas : c.apostas; if (!aps.some(n => Math.abs(n - ap) < 1e-6)) ap = aps[Math.min(1, aps.length - 1)];
      const bars = cc.ok && cc.de ? `<p class="tb-com">Os baralhos: ${esc(cc.de)}${cc.aluguel ? ` — o aluguel dos da casa, ${esc(C.preco(b, cc.aluguel))}, ao taverneiro` : ''}.</p>` : cc.why ? `<p class="tb-com">${esc(cc.why)}</p>` : '';
      panel.querySelector('.tb-over').innerHTML = `<div class="tb-sheet"><h3>${esc(C.NOME)}</h3><p class="tb-sub">O jogo das tábuas pintadas: os deuses e as criaturas de cada povo, em sete rodadas.</p>
        ${ppl.length > 1 ? `<div class="tb-sec">Com quem</div><div class="tb-ppl">${ppl.map(p => `<button class="tb-p${p.id === who ? ' sel' : ''}" data-o="${p.id}"><b>${esc(cap(P().knows.call(v, p)))}</b><small>${esc((G.CIVS[G.Fac.civOfV(p)] || {}).name || '')}</small></button>`).join('')}</div>` : `<p class="tb-com">Com <b>${esc(P().knows.call(v, o))}</b>${G.CIVS[G.Fac.civOfV(o)] ? `, que joga as tabuletas ${esc(G.CIVS[G.Fac.civOfV(o)].adj)}s` : ''}.</p>`}
        ${bars}
        ${c.moeda ? `<div class="tb-sec">A aposta de cada um</div><div class="tb-aps">${aps.map(n => `<button class="tb-ap${Math.abs(n - ap) < 1e-6 ? ' sel' : ''}" data-ap="${n}">${n > 0 ? esc(C.preco(b, n)) : 'A seco'}</button>`).join('')}</div>` : '<p class="tb-com">O povo não usa moeda: joga-se pela glória.</p>'}
        <div class="tb-sbtns"><button class="tb-b tb-no" data-a="fecha">Agora não</button><button class="tb-b tb-go" data-a="desafia">Desafiar</button></div>
        <details class="tb-reg"><summary>As regras</summary>${regras()}</details></div>`;
      panel.querySelector('.tb-over').classList.remove('hidden');
    };
    UI._conv = { set o(x) { who = x; draw(); }, set ap(x) { ap = x; draw(); }, get o() { return who; }, get ap() { return ap; } };
    draw(); som('cartas-embaralhar'); return true;
  };
  function desafia() {
    const cv = UI._conv; if (!cv || pend) return; pend = true; const o = cv.o, ap = cv.ap;
    G.IncUI.when(P().apply(w => C.desafia(w, o, ap)), r => { pend = false; if (ap > 0) som('aposta', { n: ap }); toast(r.msg, 2.6); UI.abrir(r.jogo); }, r => { pend = false; deny(r); });
  }
  const regras = () => `<ol class="tb-rl"><li>Cada um tem as 20 tabuletas do seu povo e cinco na mão; a cada rodada, compra uma.</li><li>Sete rodadas; cada uma vale uma oferenda que cresce: <b>1, 1, 2, 2, 3, 3, 4</b>.</li><li>Os dois põem uma tabuleta virada e viram juntos: a de <b>maior força</b> leva a oferenda. No empate, ela fica no altar e se soma à próxima.</li><li>Cada tabuleta tem o <b>poder</b> do seu mito: o golpe, o raio, a trapaça, a égide, a visão, a maré…</li><li>Uma vez por partida, no começo de uma rodada, você pode <b>dobrar</b> a aposta: o outro aceita, ou desiste e perde o pote.</li><li>Ganha quem tiver mais glória no fim.</li></ol>`;

  // ------------------------------ a partida ------------------------------
  UI.abrir = function (id) { if (!show(true)) return false; gid = id; shown = 0; sel = -1; manga = false; busy = false; fimVisto = 0; faceOf = 0; panel.querySelector('.tb-over').classList.add('hidden'); view = vista(); if (!view) { hide(); return false; } shown = view.n; render(true); deal(); return true; };
  // (o começo: as tabuletas vêm do monte para a mão, uma a uma)
  async function deal() {
    const t = tok; som('cartas-embaralhar'); const L = [...panel.querySelectorAll('.tb-mao .ct-card')]; L.forEach(c => c.classList.add('tb-in'));
    for (let i = 0; i < L.length; i++) { await wait(110); if (t !== tok) return; L[i].classList.remove('tb-in'); if (i % 2 === 0) som('cartas-dar'); }
  }
  // (o que se mostra: tudo do que o mundo diz agora — ou do retrato da animação, enquanto ela corre)
  function render0() { const top = panel.querySelector('.tb-top'); top.querySelector('b').textContent = ''; top.querySelector('small').textContent = ''; ['.tb-mo', '.tb-trilha', '.tb-so', '.tb-sm', '.tb-so-n', '.tb-of', '.tb-pote', '.tb-msg', '.tb-mao', '.tb-info', '.tb-monte', '.tb-hint'].forEach(q => { panel.querySelector(q).innerHTML = ''; }); }
  function quem(v) { const o = v && G.S.villagers.get(v.o); return o; }
  function render(full) {
    const v = view; if (!v || !panel) return; const me = P().body(); const o = quem(v); const civT = (G.S.buildings.get((C.jogo(v.jogo) || {}).b) || {}).set; void civT;
    panel.className = `tb t-${v.civ[0]}${busy ? ' busy' : ''}`;
    // (quem joga: o rosto e o nome, como o corpo o sabe)
    if (o && faceOf !== o.id) { faceOf = o.id; const top = panel.querySelector('.tb-top'); const nm = cap(me ? P().knows.call(me, o) : o.name); top.querySelector('b').textContent = nm; top.querySelector('small').textContent = `as tabuletas ${(G.CIVS[v.civ[1]] || { adj: 'clássica' }).adj}s`; face(top.querySelector('canvas'), o);
      panel.querySelector('.tb-so-n').textContent = nm; fitW = 0; } // (whose table is whose, under each one: D-943)
    fitTop();
    panel.querySelector('.tb-gl-o b').textContent = v.gl[1]; panel.querySelector('.tb-gl-m b').textContent = v.gl[0];
    // (a mão do outro: os versos em leque, quantas ele tem)
    panel.querySelector('.tb-mo').innerHTML = Array.from({ length: v.maoOutro }, (_, i) => Ar.htmlVerso(v.civ[1], 'tb-vo').replace('class="ct-card', `style="--i:${i};--n:${v.maoOutro}" class="ct-card`)).join('');
    // (a trilha das oferendas: as que passaram, de quem foram; a de agora; o que ficou no altar)
    const H = v.hist.filter(h => h.c); const per = {}; for (const h of H) per[h.r] = h;
    panel.querySelector('.tb-trilha').innerHTML = v.of.map((n, r) => { const h = per[r]; const w = h ? (h.w === v.me ? 'eu' : h.w === v.ai ? 'ele' : 'emp') : r === v.r && !v.fim ? 'agora' : ''; return `<span class="tb-tk ${w}" title="Rodada ${r + 1}: vale ${n}">${n}</span>`; }).join('');
    panel.querySelector('.tb-of').innerHTML = v.fim ? '' : `<b>${v.of[Math.min(v.r, v.of.length - 1)] + v.potePedras}</b><small>${v.potePedras ? 'com o que ficou no altar' : 'a oferenda'}</small>`;
    panel.querySelector('.tb-pote').innerHTML = v.moeda && v.pote > 0 ? `${moedas(v.pote / Math.max(1e-6, v.aposta || v.pote))}<span>${esc(v.preco(v.pote))}${v.x > 1 ? ` <em>×${v.x}</em>` : ''}</span>` : '<span class="seco">a seco</span>';
    // (as mesas: a tabuleta do outro, se ele mostrou primeiro; a minha, se já posta)
    if (full || !busy) { panel.querySelector('.tb-so').innerHTML = v.aberta ? flip(v.aberta, v.civ[1], true) : ''; panel.querySelector('.tb-sm').innerHTML = ''; }
    panel.querySelector('.tb-info').innerHTML = `${v.fontes && v.fontes[0] ? `<span class="tb-tag" title="De onde vem o baralho com que você joga">${esc(cap(v.fontes[0]))}${v.alug ? ` · aluguel ${v.casas > 1 ? 'dos dois baralhos, ' : ''}${esc(v.preco(v.alug))}` : ''}</span>` : ''}${v.bonus ? `<span class="tb-tag up">${Ar.icone('presagio')}+${v.bonus} na próxima</span>` : ''}${v.mal ? `<span class="tb-tag down">${Ar.icone('maldicao')}−${v.mal} na próxima</span>` : ''}${v.vis === 'eu' ? `<span class="tb-tag">${Ar.icone('visao')}Você mostra primeiro</span>` : v.vis === 'outro' ? `<span class="tb-tag up">${Ar.icone('visao')}Você vê a dele</span>` : ''}`;
    panel.querySelector('.tb-monte').innerHTML = `${Ar.htmlVerso(v.civ[0], 'tb-mini')}<b>${v.monte[0]}</b>`;
    // (a minha mão em leque)
    const n = v.mao.length; if (sel >= n) sel = -1;
    panel.querySelector('.tb-mao').innerHTML = v.mao.map((id, i) => Ar.html(id, { mini: true, cls: `tb-c${i === sel ? ' sel' : ''}` }).replace('class="ct-card', `style="--i:${i};--n:${n}" data-i="${i}" class="ct-card`)).join('');
    botoes();
  }
  // (o nome do outro e o subtítulo inteiros numa linha: a letra desce aos poucos até caber, uma vez por nome e por largura da mesa — L-2201)
  let fitW = 0;
  function fitTop() {
    const nm = panel.querySelector('.tb-nm'); const w = +nm.clientWidth || 0; if (!w || w === fitW || typeof getComputedStyle !== 'function') return; fitW = w; // (no navegador: a prova em Node tem um DOM de mentira)
    for (const [el, min] of [[nm.querySelector('b'), 11], [nm.querySelector('small'), 10]]) { el.style.fontSize = ''; let fs = parseFloat(getComputedStyle(el).fontSize) || 14;
      for (let k = 0; k < 16 && el.scrollWidth > el.clientWidth + 0.5 && fs > min; k++) { fs = Math.max(min, fs - 0.5); el.style.fontSize = fs + 'px'; } }
  }
  function botoes() {
    const v = view; if (!v) return; const pronto = !busy && !v.fim && !v.dobra && !v.posta;
    // (o nome da erguida embaixo do «Jogar», como o preço embaixo do «Dobrar»: o botão cabe na tela estreita — L-2201)
    const go = panel.querySelector('.tb-go'); go.disabled = !(pronto && sel >= 0); go.innerHTML = sel >= 0 && v.mao[sel] ? `Jogar<small>${esc(C.card(v.mao[sel]).nome)}</small>` : 'Escolha uma';
    const db = panel.querySelector('.tb-dobra'); db.disabled = !(pronto && v.podeDobrar); db.innerHTML = v.moeda && v.aposta > 0 ? `Dobrar<small>+${esc(String(v.preco(v.aposta * v.x)).split(' ')[0])}</small>` : 'Dobrar';
    db.classList.toggle('hidden', !(v.moeda && v.aposta > 0));
    const mg = panel.querySelector('.tb-manga'); mg.classList.toggle('on', manga); mg.disabled = !pronto || !v.monte[0] || !!v.trap;
    const touch = !!(G.Input3D && G.Input3D.touch);
    panel.querySelector('.tb-hint').innerHTML = touch ? 'Toque para erguer, toque de novo para jogar · segure para ver grande' : `<kbd>←</kbd><kbd>→</kbd> ou <kbd>1</kbd>–<kbd>5</kbd> escolhe · <kbd>${esc(G.Input3D.label('interagir'))}</kbd> joga · <kbd>${esc(G.Input3D.label('outra'))}</kbd> dobra · <kbd>${esc(G.Input3D.label('pular'))}</kbd> mostra · <kbd>?</kbd> regras · <kbd>Esc</kbd> sai`;
    if (!busy && v.dobra === 'outro') pedido();
    if (!busy && v.fim && fimVisto !== v.jogo) fimTela();
  }
  // (a tabuleta na mesa: o verso e a face, para virar)
  // (a pequena, como na mão: só o que cabe inteiro — a grande é a que se segura: D-941)
  const flip = (id, povo, aberta, f) => `<div class="tb-flip${aberta ? ' open' : ''}" data-id="${esc(id)}"><div class="tb-fr">${Ar.html(id, Number.isFinite(f) ? { f, mini: true } : { mini: true })}</div><div class="tb-bk">${Ar.htmlVerso(povo)}</div></div>`;
  function moedas(k) { const n = Math.max(1, Math.min(8, Math.round(k * 2))); let s = ''; for (let i = 0; i < n; i++) s += `<i style="--k:${i}"></i>`; return `<span class="tb-coins">${s}</span>`; }
  // (o rosto: o retrato do 3D onde se pode, senão o desenho do deus — G.Retrato3D, D-645)
  function face(canvas, o) {
    const x = canvas.getContext('2d'); if (!x) return; x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, 64, 64);
    const g = x.createRadialGradient(32, 26, 4, 32, 32, 36); g.addColorStop(0, '#f6e4bd'); g.addColorStop(1, '#8a6a3f'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    if (!o) return; if (G.Retrato3D && G.Retrato3D.into(canvas, o)) return;
    if (G.Art && G.Art.villager && o.age >= 2) { x.save(); x.translate(32, 54); x.scale(3.6, 3.6); G.Art.villager(x, Object.assign({}, o, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null }), 0, 0, 0, false); x.restore(); }
  }

  // ------------------------------ as mãos: escolher, mostrar, jogar ------------------------------
  function escolhe(i) { const v = view; if (!v || busy || v.fim || v.posta) return; if (i < 0 || i >= v.mao.length) return; if (sel === i) { joga(); return; } sel = i; render(); som('cartas-dar', { v: 0.4 }); }
  function passo(d) { const v = view; if (!v || !v.mao.length) return; escolhe(sel < 0 ? (d > 0 ? 0 : v.mao.length - 1) : (sel + d + v.mao.length) % v.mao.length); }
  function mostra(id) { if (!id) return; zoom = id; const z = panel.querySelector('.tb-zoom'); z.innerHTML = Ar.html(id, { cls: 'ct-big' }); z.classList.remove('hidden'); som('cartas-virar', { v: 0.5 }); }
  function esconde() { zoom = null; panel.querySelector('.tb-zoom').classList.add('hidden'); }
  function joga() {
    const v = view; if (!v || busy || pend || sel < 0 || v.fim || v.dobra || v.posta) return; const id = v.mao[sel]; const mg = manga; const g = gid;
    pend = true; busy = true; render();
    // (a tabuleta voa da mão para a mesa enquanto o mundo a recebe)
    voa(panel.querySelector(`.tb-mao .ct-card[data-i="${sel}"]`), panel.querySelector('.tb-sm')); som('cartas-jogar');
    G.IncUI.when(P().apply(w => C.lance(w, g, id, mg)), r => { pend = false; manga = false; sel = -1; if (r.pego) { busy = false; toast(r.msg, 3.6); if (G.Audio && G.Audio.play) G.Audio.play('deny'); } else busy = false; }, r => { pend = false; busy = false; deny(r); render(true); });
  }
  function dobrar() { const v = view; if (!v || busy || pend || !v.podeDobrar) return; pend = true; som('aposta', { n: v.aposta * v.x });
    G.IncUI.when(P().apply(w => C.dobrar(w, gid)), r => { pend = false; toast(r.msg, 3); }, r => { pend = false; deny(r); }); }
  function responde(sim) { pend = true; G.IncUI.when(P().apply(w => C.respondeCorpo(w, gid, sim)), r => { pend = false; panel.querySelector('.tb-over').classList.add('hidden'); if (sim) som('aposta', { n: view ? view.aposta * view.x : 0 }); toast(r.msg, 2.6); }, r => { pend = false; deny(r); }); }
  function pedeSair() {
    const v = view; if (!gid || !v || v.fim) { hide(); return; }
    const ov = panel.querySelector('.tb-over'); ov.innerHTML = `<div class="tb-sheet small"><h3>Sair da partida?</h3><p class="tb-com">Quem se levanta no meio desiste${v.pote > 0 ? `: o pote de ${esc(v.preco(v.pote))} vai para o outro` : ''}.</p><div class="tb-sbtns"><button class="tb-b tb-no" data-a="fica">Continuar</button><button class="tb-b tb-go danger" data-a="desiste">Desistir</button></div></div>`; ov.classList.remove('hidden');
  }
  function pedido() {
    const v = view; const o = quem(v); const ov = panel.querySelector('.tb-over'); if (ov.dataset.k === 'dobra' + v.n && !ov.classList.contains('hidden')) return; ov.dataset.k = 'dobra' + v.n;
    ov.innerHTML = `<div class="tb-sheet small"><h3>${esc(cap(P().knows.call(P().body(), o)))} dobra a aposta</h3><p class="tb-com">Aceitando, cada um põe mais ${esc(v.preco(v.aposta * v.x))} no pote. Desistindo, o pote de ${esc(v.preco(v.pote))} é dele.</p><div class="tb-sbtns"><button class="tb-b tb-no" data-a="recusa">Desistir</button><button class="tb-b tb-go" data-a="aceita">Aceitar</button></div></div>`;
    ov.classList.remove('hidden'); som('aposta', { v: 0.6 });
  }
  // ------------------------------ o fim: o título diz o que aconteceu, e ganhar é uma festa (D-951 a D-954) ------------------------------
  // (cada fim do mundo — o «por» do G.Cartas — com o título de quem venceu, de quem perdeu e, sem vencedor, o da partida que parou: só a
  // glória igual no fim das rodadas é «Empate»; o outro que largou a mesa dá «Vitória» quando o pote é de quem ficou (a frente N) e
  // «Partida interrompida» quando cada um leva o que pôs (L-2210). e: o nome do outro como o corpo o sabe (G.Possess.knows). A regra 472
  // cobra uma linha para todo fim que o mundo dá, e o «Empate» só na glória)
  const FIM = {
    gloria: { win: () => ['Vitória!', ''], lose: (e, d) => ['Derrota', d <= 2 ? 'Por um triz — a próxima é sua.' : 'A próxima é sua.'], tie: () => ['Empate', 'A mesma glória no fim das rodadas: cada um leva o que pôs.'] },
    recusa: { win: e => [`Vitória — ${e} desistiu do dobro`, 'Não quis dobrar a aposta: quem desiste perde.'], lose: () => ['Derrota — você desistiu do dobro', 'Quem desiste do dobro perde a partida.'], int: () => ['Partida interrompida', 'O dobro ficou sem resposta: cada um leva o que pôs.'] },
    desiste: { win: e => [`Vitória — ${e} se levantou`, 'Quem se levanta no meio perde.'], lose: () => ['Derrota — você se levantou', 'Quem se levanta no meio da partida perde.'], int: e => ['Partida interrompida', `${e} se levantou: cada um leva o que pôs.`] },
    trapaca: { win: e => [`Vitória — ${e} foi pego na trapaça`, 'Uma tabuleta saindo da manga: quem é pego perde.'], lose: () => ['Pego na trapaça!', 'Viram a tabuleta saindo da sua manga: quem é pego perde.'], int: () => ['Partida interrompida', 'A trapaça acabou com a partida: cada um leva o que pôs.'] },
    abandono: { win: e => [`Vitória — ${e} largou a mesa`, 'Quem larga a mesa no meio perde.'], lose: () => ['Derrota — você largou a mesa', 'Quem larga a mesa no meio perde.'], int: e => ['Partida interrompida', `${e} largou a mesa: cada um leva o que pôs.`] },
    fechou: { int: () => ['Partida interrompida', 'A taverna fechou: cada um leva o que pôs.'] },
    sumiu: { int: () => ['Partida interrompida', 'Um baralho sumiu da mesa: cada um leva o que pôs.'] },
    'sem-moeda': { int: () => ['Partida desfeita', 'Faltou dinheiro para a aposta: cada um leva o que pôs.'] },
    'sem-baralho': { int: () => ['Partida desfeita', 'Não havia baralho para os dois.'] },
    'sem-aluguel': { int: () => ['Partida desfeita', 'Faltou o aluguel dos baralhos da casa.'] },
  };
  // (um fim que o mundo venha a dar sem linha aqui: o título pelo lado de quem venceu, nunca «Empate»)
  const FIM0 = { win: () => ['Vitória!', ''], lose: () => ['Derrota', ''], int: () => ['Partida interrompida', 'A partida parou antes do fim: cada um leva o que pôs.'] };
  // fim do mundo (com o meu: 1 venci, −1 perdi, 0 ninguém) → { tipo: win | lose | tie | int, tit, sub }
  function fimDe(fim, e, gl) {
    const m = fim && fim.meu; const por = (fim && fim.por) || ''; const tipo = m > 0 ? 'win' : m < 0 ? 'lose' : por === 'gloria' ? 'tie' : 'int';
    const L = FIM[por] || {}; const f = L[tipo] || FIM0[tipo] || FIM0.int; const [tit, sub] = f(e || 'O outro', gl ? Math.abs(gl[0] - gl[1]) : 9);
    return { tipo, tit, sub };
  }
  UI.fimDe = fimDe; // (as provas: o título de cada fim)
  // (as moedas que o corpo tem, como o corpo as sabe — a bolsa, ou a da casa pelo knows.house —; null onde não sabe)
  function bolsaDe(me) {
    if (!me || !G.Eco || !G.Eco.coinRef || !G.Depot) return null; const ref = G.Eco.coinRef(me); const home = ref && ref[0] === 'h' ? G.S.buildings.get(+ref.slice(2)) : null;
    if (home && !P().knows.house(me, home)) return null; return { n: G.Depot.get(ref, 'moedas'), casa: !!home };
  }
  // (quem está na sala para aplaudir: os acordados lá dentro — a leitura pura do G.Atmos.awake —, menos os dois da mesa; D-954)
  function plateia(me, o) {
    const b = me && me.inside ? G.S.buildings.get(me.inside) : null; if (!b || !G.Atmos || !G.Atmos.awake) return 0;
    let n = G.Atmos.awake(b); for (const x of [me, o]) if (x && x.inside === b.id && !x.sleeping) n--; return Math.max(0, n);
  }
  function fimTela() {
    const v = view; fimVisto = v.jogo; const me = P().body(); const o = quem(v); const e = o ? cap(me ? P().knows.call(me, o) : o.name) : 'O outro';
    const F = fimDe(v.fim, e, v.gl); const [t1, t2] = F.tit.split(' — '); const aposta = !!(v.moeda && v.aposta > 0);
    const pote = v.pote > 0 ? v.pote : aposta ? 2 * v.aposta * (v.x || 1) : 0; // (o pote é as duas apostas e os dobros: 2 × a aposta × o dobro)
    const bolsa = F.tipo === 'win' && pote > 0 ? bolsaDe(me) : null; const fx = JFX(); const festa = F.tipo === 'win';
    const nota = !aposta ? '' : F.tipo === 'win' ? '' : F.tipo === 'lose' ? `O pote de ${esc(v.preco(pote))} vai para ${esc(e)}.` : '';
    const btn = F.tipo === 'lose' ? `<button class="tb-b tb-go jfx-brilha" data-a="denovo">Revanche!</button><button class="tb-b tb-no" data-a="fecha">Sair da mesa</button>`
      : `<button class="tb-b tb-no" data-a="fecha">Sair da mesa</button><button class="tb-b tb-go jfx-brilha" data-a="denovo">Jogar de novo</button>`;
    const ov = panel.querySelector('.tb-over'); ov.dataset.k = 'fim';
    ov.innerHTML = `<div class="tb-sol" aria-hidden="true"></div><div class="tb-sheet tb-end ${F.tipo}"><h3 class="tb-tit"><span class="tb-t1">${esc(t1)}</span>${t2 ? `<span class="tb-t2"><span class="jfx-leitor"> — </span>${esc(t2)}</span>` : ''}</h3>
      ${F.sub ? `<p class="tb-com tb-por">${esc(F.sub)}</p>` : ''}
      <p class="tb-score">${F.tipo === 'int' ? '<small>quando parou</small> ' : ''}<b class="tb-sc-m">${festa && !fx.menos() ? 0 : v.gl[0]}</b> × <b>${v.gl[1]}</b></p>
      ${bolsa ? `<div class="tb-bolsa"><span class="tb-pote-i" title="O pote">${moedas(2)}<em>${esc(v.preco(pote))}</em></span><span class="tb-seta">→</span><span class="tb-bolsa-v">${bolsa.casa ? 'Na bolsa da casa' : 'Na bolsa'}: <b>${esc(v.preco(Math.max(0, bolsa.n - pote)))}</b></span></div>` : festa && pote > 0 ? `<p class="tb-com">O pote é seu: <b>${esc(v.preco(pote))}</b>.</p>` : ''}
      ${nota ? `<p class="tb-com">${nota}</p>` : ''}<p class="tb-aplausos" aria-live="polite"></p>
      <div class="tb-sbtns">${btn}</div></div>`;
    ov.classList.remove('hidden');
    if (festa) festaVitoria(ov, v, pote, bolsa, me, o);
    else if (F.tipo === 'lose') { som('derrota-suave'); fx.pulso(ov.querySelector('.tb-sheet'), 'tb-baque', 520); }
    else if (F.tipo === 'tie') som('rodada-empate'); else som('cartas-embaralhar', { vol: 0.6 });
  }
  // (a vitória é uma festa: o sol atrás, o clarão, os confetes nas cores do povo e o ouro, a fanfarra; a glória contando; as moedas do pote
  // voando para a bolsa, cada uma com o seu tilintar, e a bolsa contando; a taverna que aplaude, se há gente na sala — D-952 a D-954)
  async function festaVitoria(ov, v, pote, bolsa, me, o) {
    const t = tok; const fx = JFX(); const cores = fx.cores(v.civ[0]); const tit = ov.querySelector('.tb-t1');
    fx.raios(ov.querySelector('.tb-sol'), true); fx.clarao('radial-gradient(circle at 50% 42%, rgba(255,228,150,.62), rgba(255,200,90,0) 64%)', 760);
    fx.chuva({ cores, n: 150, dur: 1.8 }); fx.em(tit, { tipo: 'faisca', n: 36, cores, sobe: true, forca: 1.1 }); fx.em(tit, { tipo: 'brilho', n: 10, cores });
    som('vitoria-fanfarra');
    await wait(420); if (t !== tok) return;
    const sc = ov.querySelector('.tb-sc-m'); if (sc) await fx.conta(sc, 0, v.gl[0], Math.min(1100, 280 + v.gl[0] * 60), null, { passo: n => som('gloria-tique', { i: n }) });
    if (t !== tok) return;
    if (bolsa) { const de = ov.querySelector('.tb-pote-i'), para = ov.querySelector('.tb-bolsa-v b'); const n = Math.max(3, Math.min(12, Math.round(pote / Math.max(0.05, v.aposta) * 2)));
      fx.conta(para, Math.max(0, bolsa.n - pote), bolsa.n, n * 90 + 620, x => v.preco(Math.round(x * 10) / 10));
      await fx.moedas(de, para, n, { passo: 90, cada: i => som('moeda-bolsa', { i, ultima: i === n - 1 }) }); if (t !== tok) return; }
    const pl = plateia(me, o); if (pl > 0) { som('aplauso', { n: pl, povo: v.civ[0] }); const a = ov.querySelector('.tb-aplausos'); if (a) { a.textContent = pl > 1 ? 'A taverna aplaude!' : 'Alguém na sala aplaude!'; a.classList.add('on'); } }
  }
  function onClick(e) {
    const a = e.target.closest('[data-a]'); const act = a && a.dataset.a;
    if (act === 'zoom') { esconde(); return; }
    if (zoom) { esconde(); return; }
    // (o «?»: as regras, curtas e com figuras, e o guia de novo — do jogos-ensina.js: D-945)
    if (act === 'ajuda') { if (G.JogosEnsina) G.JogosEnsina.ajuda('tabuletas'); return; }
    if (act === 'sair') { pedeSair(); return; } if (act === 'fica') { panel.querySelector('.tb-over').classList.add('hidden'); return; }
    if (act === 'desiste') { panel.querySelector('.tb-over').classList.add('hidden'); G.IncUI.when(P().apply(w => C.desisteCorpo(w, gid)), r => toast(r.msg, 2.6), deny); return; }
    if (act === 'fecha') { hide(); return; } if (act === 'desafia') { desafia(); return; }
    if (act === 'denovo') { const o = view && view.o; hide(); UI.convite(o); return; }
    if (act === 'jogar') { joga(); return; } if (act === 'dobrar') { dobrar(); return; } if (act === 'manga') { manga = !manga; botoes(); if (manga) toast('Uma tabuleta na manga: a melhor do seu monte troca a que você jogar. Se virem…', 3.2); return; }
    if (act === 'aceita') { responde(true); return; } if (act === 'recusa') { responde(false); return; }
    const o = e.target.closest('[data-o]'); if (o && UI._conv) { UI._conv.o = +o.dataset.o; return; }
    const ap = e.target.closest('[data-ap]'); if (ap && UI._conv) { UI._conv.ap = +ap.dataset.ap; som('aposta', { v: 0.4 }); return; }
    const c = e.target.closest('.tb-mao .ct-card'); if (c) { escolhe(+c.dataset.i); return; }
    const s = e.target.closest('.tb-slot .ct-card'); if (s) mostra(s.dataset.id);
  }
  // (o voo: um retrato da tabuleta sai do lugar dela e pousa no outro, e some ali. À mesa ela bate com o peso dela — o pouso, o pó, a mesa
  // que treme —; a minha, da mão à mesa, vira no ar e pousa de costas, como se joga, e fica ali até as duas virarem: D-950)
  function voa(from, to, verso, povo) {
    if (!from || !to || !from.getBoundingClientRect) return null; const a = from.getBoundingClientRect(), b = to.getBoundingClientRect(); if (!a.width || !b.width) return null;
    const mesa = !!(to.classList && to.classList.contains('tb-slot')); const vv = view || last; const id = from.dataset && from.dataset.id;
    const minha = mesa && !verso && !!id && !!vv && !!(from.closest && from.closest('.tb-mao'));
    const ghost = document.createElement('div'); ghost.className = 'tb-ghost'; ghost.innerHTML = verso ? Ar.htmlVerso(povo) : minha ? flip(id, vv.civ[0], true) : from.outerHTML; ghost.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
    for (const card of ghost.querySelectorAll('.ct-card')) { card.style.setProperty('--cw', a.width + 'px'); card.classList.remove('sel'); }
    panel.appendChild(ghost); from.style.visibility = 'hidden';
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), k = mesa ? b.width / a.width : Math.min(1.5, b.width / a.width); // (a ficha da oferenda chega à glória sem inchar)
    const fr = mesa ? [{ transform: 'translate(0,0) rotate(0) scale(1)' }, { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 34}px) rotate(${verso ? -8 : 6}deg) scale(${(1 + k) / 2 * 1.12})`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) rotate(0) scale(${k * 1.06})`, offset: 0.86 }, { transform: `translate(${dx}px, ${dy}px) rotate(0) scale(${k})` }]
      : [{ transform: 'translate(0,0) rotate(0) scale(1)' }, { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 30}px) rotate(${verso ? -8 : 6}deg) scale(${(1 + k) / 2 * 1.08})`, offset: 0.55 }, { transform: `translate(${dx}px, ${dy}px) rotate(0) scale(${k})` }];
    const an = ghost.animate ? ghost.animate(fr, { duration: mesa ? 460 : 420, easing: mesa ? 'cubic-bezier(.35,.6,.4,1)' : 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }) : null;
    if (minha) { const f = ghost.querySelector('.tb-flip'); setTimeout(() => { if (f) f.classList.remove('open'); }, 70); }
    const done = () => { if (minha && open && !to.querySelector('.tb-flip')) to.innerHTML = flip(id, vv.civ[0], false); ghost.remove(); if (mesa && open) pousa(to, verso ? 0.75 : 1); };
    if (an && an.finished) an.finished.then(done, done); else setTimeout(done, 470);
    return an;
  }
  // (o pouso na mesa: a tabuleta assenta, o pó levanta rente, a mesa dá um tranco pequeno e soa o baque, no material do baralho)
  function pousa(slot, forca) {
    const fx = JFX(); fx.pulso(slot, 'tb-pousa', 360); const r = slot.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.bottom - 4, { tipo: 'poeira', n: 8, larg: r.width * 0.4, cores: ['#e6cda0', '#c8af82'] });
    fx.tremor(panel.querySelector('.tb-campo'), 0.3 * forca); som('pouso', { vol: forca });
  }

  // ------------------------------ a rodada acontece (o que o mundo decidiu, mostrado) ------------------------------
  const nomeDe = id => (C.card(id) || { nome: '?' }).nome;
  function frase(e, h, v) {
    const eu = e.lado === v.me; const c = h.c ? nomeDe(h.c[e.lado]) : ''; const o = quem(v); const ele = o ? cap(P().knows.call(P().body(), o)) : 'O outro';
    switch (e.k) {
      case 'golpe': return `${c} golpeia: a outra perde ${e.n}.`;
      case 'raio': return `O raio de ${c}: a outra perde ${e.n}!`;
      case 'troca': return `${c} troca as forças!`;
      case 'egide': return `A égide de ${c}: o poder da outra não vale.`;
      case 'visao': return eu ? `${c} vê: na próxima, ${o ? P().knows.call(P().body(), o) : 'o outro'} mostra primeiro.` : `${c} vê: na próxima, você mostra primeiro.`;
      case 'mare': return 'A maré sobe: esta rodada vale o dobro!';
      case 'pesagem': return `${c} pesa: a rodada empata.`;
      case 'juiz': return `A justiça de ${c} decide o empate.`;
      case 'renasce': return `${nomeDe(e.c)} renasce e volta à mão${eu ? '' : ' dele'}.`;
      case 'furia': return `A fúria de ${c}: +${e.n}.`; case 'legiao': return `A legião de ${c}: +${e.n}.`; case 'bando': return `${c} luta em bando: +${e.n}.`; case 'alto': return `Na rodada grande, ${c}: +${e.n}.`;
      case 'sacrificio': return `Sacrifício: ${nomeDe(e.c)} vai ao fogo, +${e.n}.`;
      case 'compra': case 'colhe': return eu ? `Você compra ${e.n === 1 ? 'uma tabuleta' : e.n + ' tabuletas'}.` : `${ele} compra ${e.n === 1 ? 'uma' : e.n}.`;
      case 'furto': return eu ? `${c} furta ${nomeDe(e.c)} da mão dele!` : `${c} furta ${nomeDe(e.c)} da sua mão!`;
      case 'devora': return eu ? `${c} devora ${nomeDe(e.c)} da mão dele.` : `${c} devora ${nomeDe(e.c)} da sua mão.`;
      case 'presagio': return `O presságio: +${e.n}.`; case 'maldicao': return `A maldição: −${e.n}.`;
      case 'presagio-vem': return eu ? `Presságio: a sua próxima tem +${e.n}.` : `Presságio dele: a próxima dele tem +${e.n}.`;
      case 'maldicao-vem': return eu ? `Maldição: a próxima dele perde ${e.n}.` : `Maldição: a sua próxima perde ${e.n}.`;
      case 'firme': return `${c} fica firme.`; case 'oferenda': return `Oferenda: +${e.n} de glória.`;
    }
    return '';
  }
  const FX = { golpe: 'fx-golpe', raio: 'fx-raio', troca: 'fx-troca', egide: 'fx-egide', visao: 'fx-visao', mare: 'fx-mare', pesagem: 'fx-pesa', juiz: 'fx-pesa', renasce: 'fx-renasce', furia: 'fx-buff', legiao: 'fx-buff', bando: 'fx-buff', alto: 'fx-buff', sacrificio: 'fx-buff', presagio: 'fx-buff', maldicao: 'fx-debuff', firme: 'fx-egide', oferenda: 'fx-buff', furto: 'fx-golpe', devora: 'fx-golpe' };
  // (quem o efeito toca: o golpe e o raio, a outra; a égide, a dona; a troca e a maré, as duas)
  const ALVO = { golpe: 'outra', raio: 'outra', maldicao: 'propria', egide: 'propria', troca: 'ambas', mare: 'ambas' };
  const SEGUIDAS = ['', '', 'Duas seguidas!', 'Três seguidas!', 'Quatro seguidas!', 'Cinco seguidas!', 'Seis seguidas!', 'Sete seguidas!'];
  // (quantas rodadas seguidas o corpo vence, contando esta: a festa cresce com elas — o empate quebra a sequência)
  function seguidas(h, v) { const L = (v.hist || []).filter(x => x && x.c && x.r < h.r).sort((a, b) => a.r - b.r); let n = 1; for (let i = L.length - 1; i >= 0 && L[i].w === v.me; i--) n++; return n; }
  async function anima(h, v, t) {
    const so = panel.querySelector('.tb-so'), sm = panel.querySelector('.tb-sm'); const msg = panel.querySelector('.tb-msg'); const fx = JFX(); const mesa = panel.querySelector('.tb-mesa');
    const minha = h.c[v.me], dele = h.c[v.ai];
    // (a dele vem da mão dele, virada, e bate na mesa — ou já estava aberta, pela visão; a minha já voou e está lá, de costas)
    if (!so.querySelector('.tb-flip')) { const mo = panel.querySelector('.tb-mo .ct-card:last-child'); const an = voa(mo, so, true, v.civ[1]); som('cartas-jogar', { v: 0.7 }); await (an && an.finished ? an.finished.catch(() => { }) : wait(420)); if (t !== tok) return; so.innerHTML = flip(dele, v.civ[1], false); }
    else so.innerHTML = flip(dele, v.civ[1], true);
    { const f = sm.querySelector('.tb-flip'); if (!f || f.dataset.id !== minha) sm.innerHTML = flip(minha, v.civ[0], false); }
    await wait(140); if (t !== tok) return;
    // (o suspense: as duas sobem um pouco e tremem, a sala escurece, os dedos tamborilam na mesa — e viram juntas, num clarão)
    const duas = [so, sm]; for (const el of duas) el.classList.add('tb-tenso'); if (mesa) mesa.classList.add('tb-suspense'); som('suspense');
    await wait(fx.menos() ? 260 : 640); for (const el of duas) el.classList.remove('tb-tenso'); if (mesa) mesa.classList.remove('tb-suspense'); if (t !== tok) return;
    for (const f of panel.querySelectorAll('.tb-slot .tb-flip')) f.classList.add('open'); som('cartas-virar');
    fx.clarao('radial-gradient(circle at 50% 48%, rgba(255,240,205,.34), rgba(255,220,150,0) 58%)', 360); for (const el of duas) fx.em(el, { tipo: 'brilho', n: 5, cores: ['#fff6d8', '#ffe08a'] });
    await wait(620); if (t !== tok) return;
    // (os poderes, um a um, na ordem do mundo)
    const cardEl = lado => (lado === v.me ? sm : so).querySelector('.ct-card:not(.ct-verso)');
    for (const e of h.ev) { const fxc = FX[e.k]; const txt = frase(e, h, v); if (!txt) continue; msg.innerHTML = `<span class="tb-ev">${Ar.icone(e.k === 'presagio-vem' ? 'presagio' : e.k === 'maldicao-vem' ? 'maldicao' : e.k)} ${esc(txt)}</span>`;
      if (fxc) { const alvo = ALVO[e.k] || 'propria'; const L = alvo === 'ambas' ? [cardEl(0), cardEl(1)] : [cardEl(alvo === 'outra' ? 1 - e.lado : e.lado)]; for (const el of L) if (el) { el.classList.remove(fxc); void el.offsetWidth; el.classList.add(fxc); }
        if (e.n && (e.k === 'golpe' || e.k === 'raio' || e.k === 'maldicao')) flutua(cardEl(e.k === 'maldicao' ? e.lado : 1 - e.lado), `−${e.n}`, 'down'); else if (e.n && FX[e.k] === 'fx-buff') flutua(cardEl(e.lado), `+${e.n}`, 'up'); }
      if (e.k === 'raio') { if (G.Audio && G.Audio.play) G.Audio.play('thunder', 0.25); fx.clarao('rgba(225,236,255,.5)', 300); }
      if (e.k === 'golpe' || e.k === 'devora' || e.k === 'furto') fx.tremor((e.lado === v.me ? so : sm), 0.45);
      await wait(e.k === 'troca' || e.k === 'raio' ? 900 : 760); if (t !== tok) return; }
    // (as forças finais, e quem vence)
    const fs = [h.f[v.me], h.f[v.ai]]; [[sm, fs[0], minha], [so, fs[1], dele]].forEach(([el, f, id]) => { const c = el.querySelector('.ct-card:not(.ct-verso) .ct-f'); if (c) { c.textContent = f; const b0 = C.card(id).f; c.classList.toggle('up', f > b0); c.classList.toggle('down', f < b0); } });
    const ganhei = h.w === v.me, perdi = h.w === v.ai; const o = quem(v); const ele = o ? cap(P().knows.call(P().body(), o)) : 'O outro';
    const seg = ganhei ? seguidas(h, v) : 0; const k = Math.min(3, seg);
    // (a rodada ganha: a minha brilha e pula, as faíscas nas cores do meu povo, o acorde que sobe — mais alto e mais farto a cada uma seguida;
    // a perdida: um baque abafado, a minha escurece um instante e dá um tranco pequeno — nunca um castigo; o empate: as duas em prata, a
    // oferenda fica no altar. D-950)
    if (ganhei) { sm.classList.add('vence', 'tb-ganha'); so.classList.add('tb-murcha'); const cores = fx.cores(v.civ[0]); fx.em(sm, { tipo: 'faisca', n: 22 + 12 * k, cores, sobe: true, forca: 0.9 + 0.15 * k }); fx.em(sm, { tipo: 'brilho', n: 6 + 3 * k, cores }); som('rodada-ganha', { n: seg });
      if (k >= 2) fx.anel(sm, { cor: cores[0] }); if (k >= 3) { fx.clarao('radial-gradient(circle at 50% 62%, rgba(255,214,110,.45), rgba(255,200,90,0) 60%)', 620); fx.em(sm, { tipo: 'confete', n: 46, cores }); } }
    else if (perdi) { so.classList.add('vence'); sm.classList.add('tb-perde'); fx.tremor(sm, 0.35); som('rodada-perdida'); }
    else { so.classList.add('tb-empata'); sm.classList.add('tb-empata'); som('rodada-empate'); }
    msg.innerHTML = `<span class="tb-ev big ${ganhei ? 'up' : perdi ? 'down' : 'emp'}">${ganhei ? `Você leva ${h.ganho} de glória` : perdi ? `${esc(ele)} leva ${h.ganho} de glória` : `Empate: ${h.vale} fica${h.vale > 1 ? 'm' : ''} no altar`}</span>${seg >= 2 ? `<span class="tb-seguidas s${k}">${SEGUIDAS[Math.min(7, seg)]}</span>` : ''}`;
    // (a oferenda voa para quem venceu, e a glória dele sobe contando, com um tique a cada ponto meu; no empate, ela fica no altar)
    const tk = panel.querySelector(`.tb-trilha .tb-tk:nth-child(${h.r + 1})`);
    if (h.w >= 0) {
      const box = panel.querySelector(ganhei ? '.tb-gl-m' : '.tb-gl-o'); const b = box && box.querySelector('b'); const depois = h.gl ? h.gl[h.w] : null; const antes = depois === null ? null : depois - h.ganho;
      const an = tk && box ? voa(tk, box) : null; await (an && an.finished ? an.finished.catch(() => { }) : wait(420)); if (t !== tok) return;
      if (box) { fx.pulso(box, 'jfx-pop', 560); fx.flutua(box, `+${h.ganho}`, { cls: ganhei ? 'jfx-ouro' : 'jfx-prata', desce: !ganhei }); } // (a dele, no alto da tela, desce)
      if (b && antes !== null) { await fx.conta(b, antes, depois, Math.min(900, 260 + h.ganho * 90), null, ganhei ? { passo: n => som('gloria-tique', { i: n - antes }) } : null); if (t !== tok) return; }
    } else { const of = panel.querySelector('.tb-of'); const an = tk && of ? voa(tk, of) : null; await (an && an.finished ? an.finished.catch(() => { }) : wait(420)); if (t !== tok) return; if (of) { fx.pulso(of, 'jfx-pop', 560); fx.flutua(of, `+${h.vale}`, { cls: 'jfx-prata' }); } }
    await wait(700); if (t !== tok) return; sm.classList.remove('vence', 'tb-ganha', 'tb-perde', 'tb-empata'); so.classList.remove('vence', 'tb-murcha', 'tb-empata');
  }
  // (o número de um poder sobre a tabuleta: sobe, cresce e some)
  function flutua(el, txt, cls) { if (!el) return; const f = document.createElement('div'); f.className = `tb-float ${cls}`; f.textContent = txt; el.appendChild(f); setTimeout(() => f.remove(), 1300); }
  async function animaTudo() {
    const t = tok; busy = true; render();
    while (open && t === tok) {
      const v = vista(); if (!v) break; const novos = v.hist.slice(-(v.n - shown)).filter(Boolean); if (!novos.length || v.n <= shown) { view = v; break; }
      const h = v.hist[v.hist.length - (v.n - shown)]; shown++;
      if (h && h.c) { await anima(h, Object.assign({}, view || v), t); if (t !== tok) return; }
      else if (h && h.dobra !== undefined) { panel.querySelector('.tb-msg').innerHTML = `<span class="tb-ev">${Ar.icone('oferenda')} ${h.aceita ? 'A aposta dobrou.' : 'Desistiu do dobro.'}</span>`; som('aposta'); await wait(700); }
      else if (h && h.trapaca !== undefined) { const o = quem(v); const pego = G.S.villagers.get(h.pega); panel.querySelector('.tb-msg').innerHTML = `<span class="tb-ev big down">${esc(h.trapaca === v.me ? `${cap(P().knows.call(P().body(), pego))} viu a tabuleta na sua manga!` : `${cap(P().knows.call(P().body(), o))} foi pego com uma tabuleta na manga!`)}</span>`; await wait(1500); }
      view = vista() || v;
    }
    if (t !== tok) return; busy = false; view = vista() || view; render(true);
    if (view && view.aberta) { panel.querySelector('.tb-msg').innerHTML = `<span class="tb-ev">${Ar.icone('visao')} Ele teve de mostrar primeiro: ${esc(nomeDe(view.aberta))}.</span>`; som('cartas-virar', { v: 0.6 }); }
    else if (view && view.vis === 'eu' && !view.fim) panel.querySelector('.tb-msg').innerHTML = `<span class="tb-ev">${Ar.icone('visao')} Ele tem a visão: você mostra primeiro.</span>`;
  }

  // ------------------------------ o teclado e o controle (pelas ações: regra 121) ------------------------------
  { const ck0 = G.IncUI && G.IncUI.cardKey; if (G.IncUI) G.IncUI.cardKey = function (i) { if (open && view && !panel.querySelector('.tb-over:not(.hidden)')) { if (G.Input3D && G.Input3D.device === 'pad') { if (i === 0) passo(-1); else if (i === 2) passo(1); } else escolhe(i); return true; } return ck0 ? ck0.apply(this, arguments) : false; }; }
  if (G.Input3D && G.Input3D.on) {
    const livre = () => open && !panel.querySelector('.tb-over:not(.hidden)');
    G.Input3D.on('esquerda', () => { if (!livre()) return false; passo(-1); return true; });
    G.Input3D.on('direita', () => { if (!livre()) return false; passo(1); return true; });
    G.Input3D.on('interagir', () => { if (!open) return false; if (zoom) { esconde(); return true; } const ov = panel.querySelector('.tb-over:not(.hidden) .tb-go'); if (ov) { ov.click(); return true; } joga(); return true; });
    G.Input3D.on('outra', () => { if (!livre()) return false; dobrar(); return true; });
    G.Input3D.on('pular', () => { if (!open) return false; if (zoom) esconde(); else if (view && sel >= 0) mostra(view.mao[sel]); return true; });
  }

  // ------------------------------ o quadro (da tela do corpo, umas vezes por segundo) ------------------------------
  UI.frame = function (rdt) {
    if (!open) return; if (!G.Modes || !G.Modes.inc()) { hide(true); return; }
    if (!G.Modes.panelIs('cartas')) { open = false; tok++; panel.classList.add('hidden'); G.IncUI.root().classList.remove('tb-on'); JFX().limpa(); return; }
    upT -= rdt || 0; if (upT > 0) return; upT = 0.12; if (!gid || busy) return;
    // (a partida desfeita pelo mundo — o fim já mostrado fica até as mãos dizerem: de novo, ou sair; D-953)
    const v = vista(); if (!v) { const ov = panel.querySelector('.tb-over'); if (view && view.fim && fimVisto === view.jogo && ov.dataset.k === 'fim' && !ov.classList.contains('hidden')) return; if (view && !view.fim) { toast('A partida acabou.'); } hide(); return; }
    last = v; if (v.n > shown) { animaTudo(); return; }
    const sig = JSON.stringify([v.mao, v.gl, v.r, v.dobra, v.aberta, v.pote, v.x, v.podeDobrar, v.fim && v.fim.por, v.posta]); if (sig !== UI._sig) { UI._sig = sig; view = v; render(); }
  };
  const frame0 = G.IncUI && G.IncUI.frame;
  if (frame0) G.IncUI.frame = function (rdt) { const r = frame0.apply(this, arguments); UI.frame(rdt); return r; };
  // (para as provas e as fotos)
  UI._test = { render: () => render(true), escolhe, anima: h => anima(h, view, tok), voa: i => voa(panel.querySelector(`.tb-mao .ct-card[data-i="${i}"]`), panel.querySelector('.tb-sm')), set view(v) { view = v; }, get view() { return view; } };
})(window.G);
