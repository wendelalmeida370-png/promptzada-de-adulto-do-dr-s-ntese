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
        <div class="tb-gl tb-gl-o" title="A glória do outro"><b>0</b><small>glória</small></div><button class="tb-x" data-a="sair" aria-label="Sair" title="Sair (Esc)">×</button></header>
      <div class="tb-mo"></div>
      <div class="tb-centro"><div class="tb-trilha"></div>
        <div class="tb-campo"><div class="tb-slot tb-so"></div><div class="tb-altar"><div class="tb-of"></div><div class="tb-pote"></div></div><div class="tb-slot tb-sm"></div></div>
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
  function render0() { const top = panel.querySelector('.tb-top'); top.querySelector('b').textContent = ''; top.querySelector('small').textContent = ''; ['.tb-mo', '.tb-trilha', '.tb-so', '.tb-sm', '.tb-of', '.tb-pote', '.tb-msg', '.tb-mao', '.tb-info', '.tb-monte', '.tb-hint'].forEach(q => { panel.querySelector(q).innerHTML = ''; }); }
  function quem(v) { const o = v && G.S.villagers.get(v.o); return o; }
  function render(full) {
    const v = view; if (!v || !panel) return; const me = P().body(); const o = quem(v); const civT = (G.S.buildings.get((C.jogo(v.jogo) || {}).b) || {}).set; void civT;
    panel.className = `tb t-${v.civ[0]}${busy ? ' busy' : ''}`;
    // (quem joga: o rosto e o nome, como o corpo o sabe)
    if (o && faceOf !== o.id) { faceOf = o.id; const top = panel.querySelector('.tb-top'); top.querySelector('b').textContent = cap(me ? P().knows.call(me, o) : o.name); top.querySelector('small').textContent = `as tabuletas ${(G.CIVS[v.civ[1]] || { adj: 'clássica' }).adj}s`; face(top.querySelector('canvas'), o); }
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
    panel.querySelector('.tb-info').innerHTML = `${v.fontes && v.fontes[0] ? `<span class="tb-tag" title="De onde vem o baralho com que você joga">${esc(cap(v.fontes[0]))}${v.alug ? ` · aluguel ${esc(v.preco(v.alug))}` : ''}</span>` : ''}${v.bonus ? `<span class="tb-tag up">${Ar.icone('presagio')}+${v.bonus} na próxima</span>` : ''}${v.mal ? `<span class="tb-tag down">${Ar.icone('maldicao')}−${v.mal} na próxima</span>` : ''}${v.vis === 'eu' ? `<span class="tb-tag">${Ar.icone('visao')}Você mostra primeiro</span>` : v.vis === 'outro' ? `<span class="tb-tag up">${Ar.icone('visao')}Você vê a dele</span>` : ''}`;
    panel.querySelector('.tb-monte').innerHTML = `${Ar.htmlVerso(v.civ[0], 'tb-mini')}<b>${v.monte[0]}</b>`;
    // (a minha mão em leque)
    const n = v.mao.length; if (sel >= n) sel = -1;
    panel.querySelector('.tb-mao').innerHTML = v.mao.map((id, i) => Ar.html(id, { cls: `tb-c${i === sel ? ' sel' : ''}` }).replace('class="ct-card', `style="--i:${i};--n:${n}" data-i="${i}" class="ct-card`)).join('');
    botoes();
  }
  function botoes() {
    const v = view; if (!v) return; const pronto = !busy && !v.fim && !v.dobra && !v.posta;
    const go = panel.querySelector('.tb-go'); go.disabled = !(pronto && sel >= 0); go.textContent = sel >= 0 && v.mao[sel] ? `Jogar ${C.card(v.mao[sel]).nome}` : 'Escolha uma';
    const db = panel.querySelector('.tb-dobra'); db.disabled = !(pronto && v.podeDobrar); db.innerHTML = v.moeda && v.aposta > 0 ? `Dobrar<small>+${esc(String(v.preco(v.aposta * v.x)).split(' ')[0])}</small>` : 'Dobrar';
    db.classList.toggle('hidden', !(v.moeda && v.aposta > 0));
    const mg = panel.querySelector('.tb-manga'); mg.classList.toggle('on', manga); mg.disabled = !pronto || !v.monte[0] || !!v.trap;
    const touch = !!(G.Input3D && G.Input3D.touch);
    panel.querySelector('.tb-hint').innerHTML = touch ? 'Toque para erguer, toque de novo para jogar · segure para ver grande' : `<kbd>←</kbd><kbd>→</kbd> ou <kbd>1</kbd>–<kbd>5</kbd> escolhe · <kbd>${esc(G.Input3D.label('interagir'))}</kbd> joga · <kbd>${esc(G.Input3D.label('outra'))}</kbd> dobra · <kbd>${esc(G.Input3D.label('pular'))}</kbd> mostra · <kbd>Esc</kbd> sai`;
    if (!busy && v.dobra === 'outro') pedido();
    if (!busy && v.fim && fimVisto !== v.jogo) fimTela();
  }
  // (a tabuleta na mesa: o verso e a face, para virar)
  const flip = (id, povo, aberta, f) => `<div class="tb-flip${aberta ? ' open' : ''}" data-id="${esc(id)}"><div class="tb-fr">${Ar.html(id, Number.isFinite(f) ? { f } : null)}</div><div class="tb-bk">${Ar.htmlVerso(povo)}</div></div>`;
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
  function fimTela() {
    const v = view; fimVisto = v.jogo; const m = v.fim.meu; const por = { gloria: '', recusa: m > 0 ? 'O outro desistiu do dobro.' : 'Você desistiu do dobro.', desiste: m > 0 ? 'O outro se levantou.' : 'Você se levantou da partida.', trapaca: m > 0 ? 'Pego na trapaça: o pote é seu.' : 'Pegaram a tabuleta na sua manga!', abandono: 'O outro foi embora: cada um leva o que pôs.', fechou: 'A taverna fechou: cada um leva o que pôs.', 'sem-moeda': 'Faltou dinheiro.', sumiu: 'Um baralho sumiu da mesa: cada um leva o que pôs.', 'sem-baralho': 'Não havia baralho para os dois.', 'sem-aluguel': 'Faltou o aluguel dos baralhos da casa.' }[v.fim.por] || '';
    const tit = m > 0 ? 'Vitória!' : m < 0 ? 'Derrota' : 'Empate';
    const ov = panel.querySelector('.tb-over'); ov.dataset.k = 'fim'; ov.innerHTML = `<div class="tb-sheet tb-end ${m > 0 ? 'win' : m < 0 ? 'lose' : 'tie'}"><h3>${tit}</h3><p class="tb-score"><b>${v.gl[0]}</b> × <b>${v.gl[1]}</b></p>${por ? `<p class="tb-com">${esc(por)}</p>` : ''}${v.moeda && v.pote === 0 && v.aposta > 0 && m !== 0 ? `<p class="tb-com">${m > 0 ? 'Você leva o pote.' : 'O pote vai para o outro.'}</p>` : ''}<div class="tb-sbtns"><button class="tb-b tb-no" data-a="fecha">Sair da mesa</button><button class="tb-b tb-go" data-a="denovo">Jogar de novo</button></div></div>`;
    ov.classList.remove('hidden'); som(m > 0 ? 'vitoria' : m < 0 ? 'derrota' : 'cartas-virar');
  }
  function onClick(e) {
    const a = e.target.closest('[data-a]'); const act = a && a.dataset.a;
    if (act === 'zoom') { esconde(); return; }
    if (zoom) { esconde(); return; }
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
  // (o voo: um retrato da tabuleta sai do lugar dela e pousa no outro, e some ali)
  function voa(from, to, verso, povo) {
    if (!from || !to || !from.getBoundingClientRect) return null; const a = from.getBoundingClientRect(), b = to.getBoundingClientRect(); if (!a.width || !b.width) return null;
    const ghost = document.createElement('div'); ghost.className = 'tb-ghost'; ghost.innerHTML = verso ? Ar.htmlVerso(povo) : from.outerHTML; ghost.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
    const card = ghost.firstChild; if (card && card.style) { card.style.setProperty('--cw', a.width + 'px'); card.classList.remove('sel'); }
    panel.appendChild(ghost); from.style.visibility = 'hidden';
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), k = b.width / a.width;
    const an = ghost.animate ? ghost.animate([{ transform: 'translate(0,0) rotate(0) scale(1)' }, { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 30}px) rotate(${verso ? -8 : 6}deg) scale(${(1 + k) / 2 * 1.08})`, offset: 0.55 }, { transform: `translate(${dx}px, ${dy}px) rotate(0) scale(${k})` }], { duration: 420, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }) : null;
    const done = () => ghost.remove(); if (an && an.finished) an.finished.then(done, done); else setTimeout(done, 450);
    return an;
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
      case 'visao': return eu ? `${c} vê: na próxima, ${ele.toLowerCase()} mostra primeiro.` : `${c} vê: na próxima, você mostra primeiro.`;
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
  async function anima(h, v, t) {
    const so = panel.querySelector('.tb-so'), sm = panel.querySelector('.tb-sm'); const msg = panel.querySelector('.tb-msg');
    const minha = h.c[v.me], dele = h.c[v.ai];
    // (a minha já voou; a dele vem da mão dele, virada — ou já estava aberta, pela visão)
    if (!so.querySelector('.tb-flip')) { const mo = panel.querySelector('.tb-mo .ct-card:last-child'); voa(mo, so, true, v.civ[1]); som('cartas-jogar', { v: 0.7 }); await wait(380); if (t !== tok) return; so.innerHTML = flip(dele, v.civ[1], false); }
    else so.innerHTML = flip(dele, v.civ[1], true);
    sm.innerHTML = flip(minha, v.civ[0], false); await wait(260); if (t !== tok) return;
    // (viram juntas)
    for (const f of panel.querySelectorAll('.tb-slot .tb-flip')) f.classList.add('open'); som('cartas-virar'); await wait(620); if (t !== tok) return;
    // (os poderes, um a um, na ordem do mundo)
    const cardEl = lado => (lado === v.me ? sm : so).querySelector('.ct-card:not(.ct-verso)');
    for (const e of h.ev) { const fx = FX[e.k]; const txt = frase(e, h, v); if (!txt) continue; msg.innerHTML = `<span class="tb-ev">${Ar.icone(e.k === 'presagio-vem' ? 'presagio' : e.k === 'maldicao-vem' ? 'maldicao' : e.k)} ${esc(txt)}</span>`;
      if (fx) { const alvo = ALVO[e.k] || 'propria'; const L = alvo === 'ambas' ? [cardEl(0), cardEl(1)] : [cardEl(alvo === 'outra' ? 1 - e.lado : e.lado)]; for (const el of L) if (el) { el.classList.remove(fx); void el.offsetWidth; el.classList.add(fx); }
        if (e.n && (e.k === 'golpe' || e.k === 'raio' || e.k === 'maldicao')) flutua(cardEl(e.k === 'maldicao' ? e.lado : 1 - e.lado), `−${e.n}`, 'down'); else if (e.n && FX[e.k] === 'fx-buff') flutua(cardEl(e.lado), `+${e.n}`, 'up'); }
      if (e.k === 'raio' && G.Audio && G.Audio.play) G.Audio.play('thunder', 0.25);
      await wait(e.k === 'troca' || e.k === 'raio' ? 900 : 760); if (t !== tok) return; }
    // (as forças finais, e quem vence)
    const fs = [h.f[v.me], h.f[v.ai]]; [[sm, fs[0], minha], [so, fs[1], dele]].forEach(([el, f, id]) => { const c = el.querySelector('.ct-card:not(.ct-verso) .ct-f'); if (c) { c.textContent = f; const b0 = C.card(id).f; c.classList.toggle('up', f > b0); c.classList.toggle('down', f < b0); } });
    const ganhei = h.w === v.me, perdi = h.w === v.ai;
    if (ganhei) sm.classList.add('vence'); else if (perdi) so.classList.add('vence');
    msg.innerHTML = `<span class="tb-ev big ${ganhei ? 'up' : perdi ? 'down' : ''}">${ganhei ? `Você leva ${h.ganho} de glória` : perdi ? `Ele leva ${h.ganho} de glória` : `Empate: ${h.vale} fica${h.vale > 1 ? 'm' : ''} no altar`}</span>`;
    // (a oferenda voa para quem venceu)
    const tk = panel.querySelector(`.tb-trilha .tb-tk:nth-child(${h.r + 1})`); const gl = panel.querySelector(ganhei ? '.tb-gl-m' : '.tb-gl-o');
    if (tk && gl && h.w >= 0) voa(tk, gl); som(ganhei ? 'cartas-dar' : 'cartas-jogar', { v: 0.5 });
    await wait(1100); if (t !== tok) return; sm.classList.remove('vence'); so.classList.remove('vence');
  }
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
    if (!G.Modes.panelIs('cartas')) { open = false; tok++; panel.classList.add('hidden'); G.IncUI.root().classList.remove('tb-on'); return; }
    upT -= rdt || 0; if (upT > 0) return; upT = 0.12; if (!gid || busy) return;
    const v = vista(); if (!v) { if (view && !view.fim) { toast('A partida acabou.'); } hide(); return; }
    last = v; if (v.n > shown) { animaTudo(); return; }
    const sig = JSON.stringify([v.mao, v.gl, v.r, v.dobra, v.aberta, v.pote, v.x, v.podeDobrar, v.fim && v.fim.por, v.posta]); if (sig !== UI._sig) { UI._sig = sig; view = v; render(); }
  };
  const frame0 = G.IncUI && G.IncUI.frame;
  if (frame0) G.IncUI.frame = function (rdt) { const r = frame0.apply(this, arguments); UI.frame(rdt); return r; };
  // (para as provas e as fotos)
  UI._test = { render: () => render(true), escolhe, anima: h => anima(h, view, tok), set view(v) { view = v; }, get view() { return view; } };
})(window.G);
