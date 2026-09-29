// Interface (HUD, menus, celular, inventário, diário, notas, escolhas, teclado).
import { el, h, escapeHtml, clamp } from '../core/util.js';
import { settings, names, saveSettings, saveNames, T, DEFAULT_NAMES } from '../core/settings.js';
import { audio } from '../core/audio.js';
import { ITEMS } from './items.js';
import { drawIcon } from '../core/textures.js';

export class UI {
  constructor(game) {
    this.game = game;
    this.subQueue = [];
    this.subTimer = null;
    this.overlay = null; // nome do overlay aberto
    this.resolver = null;
    this.menuOpen = true;
    this.cb = {};
    this._wire();
    this._menuBg();
  }

  // ------------------------------------------------------------ HUD
  setObjective(text) {
    const o = el('objective');
    if (!text) { o.classList.remove('show'); return; }
    el('objective-text').textContent = T(text);
    o.classList.remove('show');
    void o.offsetWidth;
    o.classList.add('show');
    clearTimeout(this._objT);
    this._objT = setTimeout(() => o.classList.remove('show'), 9000);
  }
  flashObjective() { const o = el('objective'); o.classList.add('show'); clearTimeout(this._objT); this._objT = setTimeout(() => o.classList.remove('show'), 6000); }
  prompt(text) {
    const p = el('prompt');
    if (!text) { p.classList.remove('show'); el('crosshair').classList.remove('active'); return; }
    p.innerHTML = '<b>E</b>' + escapeHtml(T(text));
    p.classList.add('show');
    el('crosshair').classList.add('active');
  }
  // legenda. who: nome; kind: '', 'enemy', 'house'
  say(who, text, dur, kind = '') {
    return new Promise((res) => {
      const d0 = dur || Math.max(2.2, T(text).length * 0.065);
      this.subQueue.push({ who, text: T(text), dur: this.fast ? Math.min(0.03, d0) : d0, kind, res });
      if (!this.subTimer) this._nextSub();
    });
  }
  _nextSub() {
    const s = this.subQueue.shift();
    const box = el('subtitle');
    if (!s) { box.classList.remove('show'); this.subTimer = null; return; }
    box.innerHTML = (s.who ? `<span class="who ${s.kind}">${escapeHtml(T(s.who))}:</span>` : '') + escapeHtml(s.text).replace(/\*(.+?)\*/g, '<i>$1</i>');
    box.classList.add('show');
    this.subTimer = setTimeout(() => { s.res(); this._nextSub(); }, s.dur * 1000);
  }
  clearSubs() { this.subQueue.forEach((s) => s.res()); this.subQueue = []; clearTimeout(this.subTimer); this.subTimer = null; el('subtitle').classList.remove('show'); }

  notify(from, text, opts = {}) {
    const n = h('div', { class: 'notif' + (opts.glitch ? ' glitch' : '') },
      h('div', { class: 'n-app' }, h('span', {}, opts.app || 'Mensagens'), h('span', {}, opts.time || 'agora')),
      h('div', { class: 'n-from' }, T(from)),
      h('div', {}, T(text)));
    el('notify').appendChild(n);
    setTimeout(() => { n.style.transition = 'opacity .6s'; n.style.opacity = '0'; setTimeout(() => n.remove(), 700); }, opts.dur || 6500);
  }
  toast(text, dur = 2.6) {
    const t = el('toast');
    t.innerHTML = escapeHtml(T(text)).replace(/\n/g, '<br>');
    t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), dur * 1000);
  }
  battery(p) {
    el('bat-fill').style.width = Math.round(clamp(p, 0, 100)) + '%';
    el('bat-text').textContent = Math.round(p) + '%';
    el('battery').classList.toggle('low', p < 15);
    el('vf-bat').textContent = Math.round(p) + '%';
    el('ph-bat').textContent = Math.round(p) + '%';
  }
  radio(level) {
    if (level === null) { el('radio').classList.add('hidden'); return; }
    el('radio').classList.remove('hidden');
    el('radio-fill').style.width = Math.round(clamp(level, 0, 1) * 100) + '%';
  }
  breath(v, show) {
    el('breath').classList.toggle('hidden', !show);
    el('breath-fill').style.width = Math.round(v * 100) + '%';
  }
  stamina(v) {
    el('stamina').classList.toggle('show', v < 0.98);
    el('stamina-fill').style.width = Math.round(v * 100) + '%';
  }
  hideOverlay(kind) {
    const o = el('hide-overlay');
    o.className = kind ? kind : '';
    if (!kind) o.classList.add('hidden');
  }
  hint(level, text) {
    const b = el('hint-box');
    b.innerHTML = `<div class="h-lvl">DICA ${level}/3</div>${escapeHtml(T(text))}`;
    b.classList.remove('hidden');
    clearTimeout(this._hintT);
    this._hintT = setTimeout(() => b.classList.add('hidden'), 12000);
  }
  viewfinder(mode, data = {}) {
    const v = el('viewfinder');
    if (!mode) { v.classList.add('hidden'); return; }
    v.classList.remove('hidden');
    v.classList.toggle('video', mode === 'video');
    el('vf-mode').textContent = mode === 'video' ? '▶ casa.mp4' : 'CÂMERA';
    el('vf-time').textContent = data.time || '';
    el('vf-sim').textContent = data.sim || '';
    const tag = el('vf-tag');
    if (data.tag) { tag.textContent = data.tag; tag.classList.add('show'); tag.classList.toggle('echo', !!data.tagEcho); }
    else tag.classList.remove('show');
    el('vf-help').innerHTML = data.help || 'Q: trocar modo &nbsp;·&nbsp; clique: foto';
    const pr = el('vf-progress');
    if (data.progress !== undefined && data.progress !== null) { pr.classList.remove('hidden'); el('vf-progress-fill').style.width = Math.round(data.progress * 100) + '%'; }
    else pr.classList.add('hidden');
  }
  showHud(v) { el('hud').classList.toggle('hidden', !v); }
  fade(to, dur = 1) {
    const f = el('fade');
    if (this.fast) dur = Math.min(dur, 0.02);
    f.style.transition = `opacity ${dur}s`;
    f.style.opacity = String(to);
    return new Promise((r) => setTimeout(r, dur * 1000));
  }
  flash(strength = 1, dur = 0.4, color = '#fff') {
    if (!settings.flashes) strength *= 0.25;
    const f = el('flash');
    f.style.background = color;
    f.style.transition = 'none';
    f.style.opacity = String(strength);
    void f.offsetWidth;
    f.style.transition = `opacity ${dur}s`;
    f.style.opacity = '0';
  }
  clickToPlay(v) { el('clickplay').classList.toggle('hidden', !v); }

  // ------------------------------------------------------------ overlays que pausam
  get paused() { return !!this.overlay || !el('pause').classList.contains('hidden') || !el('sub-panel').classList.contains('hidden') || this.menuOpen; }

  openOverlay(name) {
    if (this.overlay) this.closeOverlay();
    this.overlay = name;
    el(name).classList.remove('hidden');
    this.game.input.unlock();
    audio.play('ui');
  }
  closeOverlay(result) {
    if (!this.overlay) return;
    el(this.overlay).classList.add('hidden');
    const r = this.resolver;
    this.resolver = null;
    this.overlay = null;
    audio.play('ui_back');
    if (r) r(result);
    this.game.resumePointer();
  }

  // nota/documento
  note(title, body, opts = {}) {
    return new Promise((res) => {
      el('note-title').textContent = T(title || '');
      el('note-body').innerHTML = escapeHtml(T(body)).replace(/\n/g, '<br>').replace(/\[\[(.+?)\]\]/g, '<span class="hand">$1</span>');
      const paper = el('note').querySelector('.paper');
      paper.className = 'paper' + (opts.style ? ' ' + opts.style : '');
      this.openOverlay('note');
      audio.play('page');
      this.resolver = res;
    });
  }

  choice(title, options) {
    return new Promise((res) => {
      el('choice-title').textContent = T(title);
      const box = el('choice-options');
      box.innerHTML = '';
      options.forEach((o, i) => {
        const b = h('button', { onclick: () => this.closeOverlay(i) }, h('span', { class: 'k' }, String(i + 1)), T(o));
        box.appendChild(b);
      });
      this.openOverlay('choice');
      this._choiceN = options.length;
      this.resolver = res;
      setTimeout(() => box.firstChild && box.firstChild.focus(), 50);
    });
  }

  // teclado de senha: mode 'text' ou 'wheels' (símbolos)
  keypad({ title, hint, mode = 'text', wheels = [], check }) {
    return new Promise((res) => {
      el('keypad-title').textContent = T(title);
      el('keypad-hint').textContent = T(hint || '');
      el('keypad-msg').textContent = '';
      const input = el('keypad-input');
      const wbox = el('keypad-wheels');
      wbox.innerHTML = '';
      let vals = [];
      if (mode === 'text') { input.classList.remove('hidden'); input.value = ''; setTimeout(() => input.focus(), 60); }
      else {
        input.classList.add('hidden');
        vals = wheels.map(() => 0);
        wheels.forEach((w, i) => {
          const val = h('div', { class: 'val' }, String(w.values[0]));
          const up = h('button', { onclick: () => { vals[i] = (vals[i] + 1) % w.values.length; val.textContent = w.values[vals[i]]; audio.play('switch'); } }, '▲');
          const dn = h('button', { onclick: () => { vals[i] = (vals[i] - 1 + w.values.length) % w.values.length; val.textContent = w.values[vals[i]]; audio.play('switch'); } }, '▼');
          wbox.appendChild(h('div', { class: 'wheel' }, h('div', { class: 'lbl' }, w.label || ''), up, val, dn));
        });
      }
      const submit = () => {
        const v = mode === 'text' ? input.value : vals.map((k, i) => wheels[i].values[k]).join('');
        const r = check(v);
        if (r === true) { this._kpOk = null; this.closeOverlay(v); }
        else { el('keypad-msg').textContent = T(r || 'Não abriu.'); audio.play('locked'); }
      };
      this._kpOk = submit;
      el('keypad-ok').onclick = submit;
      el('keypad-cancel').onclick = () => this.closeOverlay(null);
      input.onkeydown = (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') this.closeOverlay(null); };
      this.openOverlay('keypad');
      this.resolver = res;
    });
  }

  // ------------------------------------------------------------ inventário
  openInventory() {
    const g = this.game;
    this.openOverlay('inventory');
    const grid = el('inv-grid');
    grid.innerHTML = '';
    const list = g.inventory.list();
    const select = (id) => {
      [...grid.children].forEach((c) => c.classList.toggle('sel', c.dataset.id === id));
      const it = ITEMS[id];
      el('inv-name').textContent = T(it.name);
      el('inv-desc').textContent = T(it.desc);
      const ic = el('inv-icon'); ic.innerHTML = '';
      const cv = h('canvas', { width: 110, height: 110 }); drawIcon(cv.getContext('2d'), id, 110); ic.appendChild(cv);
      if (id === 'powerbank') {
        const b = h('button', { style: 'margin-top:10px;padding:6px 12px;background:#1b1b1b;border:1px solid #444;cursor:pointer', onclick: () => { g.usePowerbank(); this.closeOverlay(); } }, 'Usar agora');
        el('inv-desc').appendChild(h('br')); el('inv-desc').appendChild(b);
      }
    };
    if (!list.length) grid.appendChild(h('div', { style: 'grid-column:1/-1;color:#777;padding:20px' }, 'Nada por enquanto. Só o celular no bolso.'));
    for (const id of list) {
      const it = ITEMS[id];
      const cv = h('canvas', { width: 64, height: 64 }); drawIcon(cv.getContext('2d'), id, 64);
      const slot = h('div', { class: 'inv-slot', 'data-id': id, onclick: () => select(id) }, cv, h('div', {}, T(it.name)));
      grid.appendChild(slot);
    }
    el('inv-name').textContent = ''; el('inv-desc').textContent = ''; el('inv-icon').innerHTML = '';
    if (list.length) select(list[0]);
  }

  // ------------------------------------------------------------ diário
  openJournal(tab = 'obj') {
    const g = this.game;
    this.openOverlay('journal');
    const tabs = [['obj', 'OBJETIVO'], ['notes', 'NOTAS'], ['photos', 'FOTOS'], ['rules', 'REGRAS'], ['map', 'PLANTA']];
    if (g.flags.evidence) tabs.push(['ev', 'EVIDÊNCIAS']);
    const bar = el('journal-tabs'); bar.innerHTML = '';
    const body = el('journal-body');
    const show = (t) => {
      [...bar.children].forEach((b) => b.classList.toggle('on', b.dataset.t === t));
      body.innerHTML = '';
      if (t === 'obj') {
        body.appendChild(h('h3', { style: 'font-family:Georgia;font-weight:400' }, T(g.story.objectiveText() || '—')));
        body.appendChild(h('p', { style: 'color:#9b958a' }, 'Travou? Aperte H para uma dica (elas ficam mais claras aos poucos).'));
        const st = g.story.statusLines();
        st.forEach((l) => body.appendChild(h('div', { class: 'j-item' }, T(l))));
      } else if (t === 'notes') {
        if (!g.notes.length) body.appendChild(h('p', { style: 'color:#777' }, 'Nenhuma nota ainda.'));
        g.notes.forEach((n) => body.appendChild(h('div', { class: 'j-item', onclick: () => { this.closeOverlay(); this.note(n.title, n.body, { style: n.style }); } }, h('b', {}, T(n.title)), h('br'), h('small', {}, T(n.where || '')))));
      } else if (t === 'photos') {
        const photos = g.phone.gallery;
        if (!photos.length) body.appendChild(h('p', { style: 'color:#777' }, 'Nenhuma foto. Levante o celular (botão direito) e clique para fotografar.'));
        const grid = h('div', { class: 'gal-grid', style: 'grid-template-columns:repeat(3,1fr)' });
        photos.forEach((p) => grid.appendChild(h('div', {}, p.img ? h('img', { src: p.img }) : h('div', { class: 'gal-empty' }), h('div', { class: 'gal-cap' }, T(p.caption)))));
        body.appendChild(grid);
      } else if (t === 'rules') {
        if (!g.rules.length) body.appendChild(h('p', { style: 'color:#777' }, 'Você ainda não sabe nada sobre as regras desta noite.'));
        g.rules.forEach((r) => body.appendChild(h('div', { class: 'j-rule' }, T(r))));
      } else if (t === 'map') {
        body.appendChild(this._mapCanvas());
        body.appendChild(h('p', { style: 'color:#9b958a;font-size:12px' }, 'Planta desenhada de memória. A casa pode discordar.'));
      } else if (t === 'ev') {
        body.appendChild(h('p', {}, 'Coisas que não batiam. Agora batem.'));
        g.story.evidence().forEach((e) => body.appendChild(h('div', { class: 'j-ev' }, T(e))));
      }
    };
    tabs.forEach(([t, label]) => bar.appendChild(h('button', { 'data-t': t, onclick: () => show(t) }, label)));
    show(tab);
  }

  _mapCanvas() {
    const g = this.game;
    const c = h('canvas', { width: 900, height: 520, class: 'j-map' });
    const x = c.getContext('2d');
    const long = !!g.flags.corridorLong;
    const S = 42, ox = 150, oz = 90;
    const R = (x0, x1, z0, z1, label, col = '#fffaf0') => {
      x.fillStyle = col; x.fillRect(ox + x0 * S, oz + z0 * S, (x1 - x0) * S, (z1 - z0) * S);
      x.strokeStyle = '#3a3026'; x.lineWidth = 3; x.strokeRect(ox + x0 * S, oz + z0 * S, (x1 - x0) * S, (z1 - z0) * S);
      x.fillStyle = '#3a3026'; x.font = '15px "Comic Sans MS", cursive'; x.textAlign = 'center';
      x.fillText(label, ox + ((x0 + x1) / 2) * S, oz + ((z0 + z1) / 2) * S + 5);
    };
    x.fillStyle = '#e7e0cf'; x.fillRect(0, 0, 900, 520);
    const E = long ? 13.4 : 11;
    R(0, 4.2, -1.5, 0, 'varanda', '#e8efe9');
    R(0, 4.2, 0, 8, 'sala');
    R(-3, 0, 4, 8, 'cozinha', '#f4efe4');
    R(-3, -0.8, 8, 10.2, 'serviço', '#f4efe4');
    R(4.2, E, 6.7, 7.7, 'corredor');
    R(4.2, 7.3, 3.4, 6.7, 'quarto roxo', '#e6def2');
    R(7.3, 10.4, 3.4, 6.7, 'quarto dos meninos');
    R(4.2, 6.6, 7.7, 9.9, 'banheiro', '#e3eaee');
    R(E, E + 3.6, 4.9, 9.4, 'quarto dos pais');
    if (long && g.flags.sawExtraDoor) { x.setLineDash([6, 6]); R(11.1, 13.3, 7.7, 10.4, '???', 'rgba(120,40,40,0.15)'); x.setLineDash([]); }
    x.fillStyle = '#b22'; x.font = 'bold 13px sans-serif'; x.textAlign = 'center';
    x.fillText('porta de entrada', ox + 1.0 * S, oz + 8.6 * S);
    const p = g.player.pos;
    x.fillStyle = '#c3121c'; x.beginPath(); x.arc(ox + p.x * S, oz + p.z * S, 7, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#3a3026'; x.font = '13px sans-serif'; x.fillText('você', ox + p.x * S, oz + p.z * S - 12);
    return c;
  }

  // ------------------------------------------------------------ celular
  openPhone(view = 'home') {
    this.openOverlay('phone');
    this.renderPhone(view);
  }
  renderPhone(view, arg) {
    const g = this.game, ph = g.phone;
    this.phoneView = view;
    const scr = el('phone-screen');
    scr.innerHTML = '';
    el('ph-time').textContent = g.clockText();
    const signal = g.flags.signal ? '4G ▂▄▆' : 'Sem serviço';
    el('ph-signal').textContent = signal;
    el('ph-signal').style.color = g.flags.signal ? '#8f8' : '#ff8a8a';
    el('ph-back').onclick = () => { if (view === 'home') this.closeOverlay(); else if (view === 'chat') this.renderPhone('msgs'); else this.renderPhone('home'); };
    el('ph-home').onclick = () => this.renderPhone('home');
    el('ph-close').onclick = () => this.closeOverlay();
    if (view === 'home') {
      scr.appendChild(h('div', { class: 'wallpaper-clock' }, g.clockText()));
      scr.appendChild(h('div', { class: 'wallpaper-date' }, 'madrugada · ' + T('{rafaela}')));
      const unread = ph.unread();
      const apps = [
        ['msgs', '💬', 'Mensagens', '#2a7a4a', true, unread],
        ['video', '▶', 'casa.mp4', '#1f4f8f', ph.apps.video, 0],
        ['cam', '📷', 'Câmera', '#444', true, 0],
        ['radio', '📻', 'Rádio FM', '#7a4a1f', ph.apps.radio, 0],
        ['gallery', '🖼', 'Galeria', '#6a2a6a', true, 0],
        ['light', '🔦', ph.flashlight ? 'Lanterna: ON' : 'Lanterna', '#8a7a1a', true, 0],
      ];
      const grid = h('div', { class: 'app-grid' });
      for (const [id, icon, label, col, enabled, badge] of apps) {
        const b = h('button', { class: 'app' + (enabled ? '' : ' locked'), onclick: () => enabled && this._phoneApp(id) },
          h('div', { class: 'ic', style: `background:${col}` }, icon, badge ? h('span', { class: 'badge' }, String(badge)) : null), h('span', {}, label));
        grid.appendChild(b);
      }
      scr.appendChild(grid);
      scr.appendChild(h('p', { class: 'phone-p', style: 'margin-top:26px;text-align:center;color:#888;font-size:11px' }, 'F: lanterna · botão direito: câmera · Q: modo'));
    } else if (view === 'msgs') {
      scr.appendChild(h('div', { class: 'chat-head' }, 'Conversas'));
      ph.threads.forEach((t) => {
        const last = t.msgs[t.msgs.length - 1];
        scr.appendChild(h('div', { class: 'chat-list-item', onclick: () => this.renderPhone('chat', t.id) },
          h('b', {}, T(t.name) + (t.unread ? ` (${t.unread})` : '')), h('span', {}, last ? T(last.text).slice(0, 42) : '')));
      });
    } else if (view === 'chat') {
      const t = ph.thread(arg);
      t.unread = 0;
      g.story.onReadThread && g.story.onReadThread(t.id);
      scr.appendChild(h('div', { class: 'chat-head' }, h('span', {}, T(t.name)), h('small', {}, t.status || '')));
      let lastDay = '';
      t.msgs.forEach((m) => {
        if (m.day && m.day !== lastDay) { scr.appendChild(h('div', { class: 'msg-time' }, m.day)); lastDay = m.day; }
        scr.appendChild(h('div', { class: 'msg ' + (m.out ? 'out' : 'in') + (m.glitch ? ' glitchy' : '') }, T(m.text), h('div', { style: 'font-size:9px;color:#888;text-align:right;margin-top:2px' }, m.time || '')));
      });
      setTimeout(() => { scr.scrollTop = scr.scrollHeight; }, 10);
      el('ph-back').onclick = () => this.renderPhone('msgs');
    } else if (view === 'video') {
      scr.appendChild(h('div', { class: 'vid-card' },
        h('div', { class: 'vid-thumb' }, '▶'),
        h('b', {}, 'casa.mp4'), h('div', { style: 'color:#888;font-size:12px' }, 'recebido de ' + T('{wendel}') + ' · 04:05'),
        g.flags.showSim ? h('div', {}, h('div', { style: 'margin-top:10px;font-size:12px' }, `Compatível com a casa: ${Math.round(g.story.sim())}%`), h('div', { class: 'sim-bar' }, h('div', { class: 'sim-fill', style: `width:${g.story.sim()}%` }))) : null,
        h('p', { class: 'phone-p' }, 'Para comparar: segure o botão direito do mouse para levantar o celular e aperte Q até aparecer ▶ casa.mp4. A imagem mostra a casa como foi gravada.')));
    } else if (view === 'radio') {
      scr.appendChild(h('div', { class: 'vid-card' }, h('b', {}, 'Rádio FM 87.9'), h('p', { class: 'phone-p' }, ph.radioOn ? 'Ligado. Só chiado... e às vezes, vozes.' : 'Desligado.'),
        h('button', { style: 'padding:8px 14px;background:#222;border:1px solid #555;cursor:pointer', onclick: () => { g.phone.toggleRadio(); this.renderPhone('radio'); } }, ph.radioOn ? 'Desligar (R)' : 'Ligar (R)')));
    } else if (view === 'gallery') {
      if (!ph.gallery.length) scr.appendChild(h('p', { class: 'phone-p' }, 'Nenhuma foto.'));
      const grid = h('div', { class: 'gal-grid' });
      ph.gallery.forEach((p) => grid.appendChild(h('div', { onclick: () => this.renderPhone('photo', p) }, p.img ? h('img', { src: p.img }) : h('div', { class: 'gal-empty' }), h('div', { class: 'gal-cap' }, T(p.caption)))));
      scr.appendChild(grid);
    } else if (view === 'photo') {
      scr.appendChild(h('div', { class: 'gal-full' }, arg.img ? h('img', { src: arg.img }) : null, h('p', { class: 'phone-p' }, T(arg.caption)), arg.detail ? h('p', { class: 'phone-p', style: 'color:#aaa' }, T(arg.detail)) : null));
      el('ph-back').onclick = () => this.renderPhone('gallery');
    } else if (view === 'cam') {
      scr.appendChild(h('p', { class: 'phone-p' }, 'Segure o botão direito do mouse (fora deste menu) para levantar o celular e usar a câmera. Clique para tirar foto. A câmera vê coisas que o olho não vê.'));
    }
  }
  _phoneApp(id) {
    if (id === 'light') { this.game.phone.toggleFlashlight(); this.renderPhone('home'); return; }
    this.renderPhone(id);
  }

  // ------------------------------------------------------------ menus
  _wire() {
    el('main-buttons').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      audio.init(); audio.play('ui');
      const a = b.dataset.act;
      if (a === 'new') this.cb.onNew && this.cb.onNew();
      if (a === 'continue') this.cb.onContinue && this.cb.onContinue();
      if (a === 'options') this.openOptions();
      if (a === 'controls') this.openControls();
      if (a === 'credits') this.openCredits();
      if (a === 'names') this.openNames();
    });
    el('pause').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      audio.play('ui');
      const a = b.dataset.act;
      if (a === 'resume') this.cb.onResume && this.cb.onResume();
      if (a === 'hint') { this.cb.onResume && this.cb.onResume(); this.cb.onHint && this.cb.onHint(); }
      if (a === 'options') this.openOptions();
      if (a === 'controls') this.openControls();
      if (a === 'lastcp') this.cb.onLastCheckpoint && this.cb.onLastCheckpoint();
      if (a === 'quit') this.cb.onQuit && this.cb.onQuit();
    });
    el('sub-back').addEventListener('click', () => { audio.play('ui_back'); this.closeSub(); });
    el('note').addEventListener('click', () => { if (this.overlay === 'note') this.closeOverlay(); });
    el('clickplay').addEventListener('click', () => this.game.resumePointer(true));
    this.game.input.onKey((e) => this._key(e));
  }
  _key(e) {
    const code = e.code;
    if (!el('sub-panel').classList.contains('hidden')) { if (code === 'Escape') this.closeSub(); return; }
    if (this.overlay) {
      if (this.overlay === 'note' && (code === 'Escape' || code === 'KeyE' || code === 'Enter' || code === 'Space')) this.closeOverlay();
      else if (this.overlay === 'choice') { const n = parseInt(e.key, 10); if (n >= 1 && n <= this._choiceN) this.closeOverlay(n - 1); }
      else if (this.overlay === 'keypad') { if (code === 'Escape') this.closeOverlay(null); if (code === 'Enter' && this._kpOk) this._kpOk(); }
      else if (this.overlay === 'phone' && (code === 'Tab' || code === 'Escape')) this.closeOverlay();
      else if (this.overlay === 'inventory' && (code === 'KeyI' || code === 'Escape')) this.closeOverlay();
      else if (this.overlay === 'journal' && (code === 'KeyJ' || code === 'Escape')) this.closeOverlay();
      return;
    }
    this.game.onKey(code);
  }

  showMenu() {
    this.menuOpen = true;
    el('menu').classList.remove('hidden');
    el('pause').classList.add('hidden');
    el('btn-continue').disabled = !this.game.hasSave();
    el('menu-player-name').textContent = names.rafaela;
    this.showHud(false);
  }
  hideMenu() { this.menuOpen = false; el('menu').classList.add('hidden'); }
  showPause(v) { el('pause').classList.toggle('hidden', !v); }

  openSub(html, build) {
    el('sub-panel').classList.remove('hidden');
    const c = el('sub-content');
    c.innerHTML = html || '';
    if (build) build(c);
  }
  closeSub() {
    el('sub-panel').classList.add('hidden');
    if (this._onSubClose) { const f = this._onSubClose; this._onSubClose = null; f(); }
  }

  openOptions() {
    this.openSub('<h2>OPÇÕES</h2>', (c) => {
      const row = (label, input, val) => h('div', { class: 'opt-row' }, h('span', {}, label), h('span', { style: 'display:flex;gap:8px;align-items:center' }, input, val || ''));
      const slider = (key, min, max, step, fmt = (v) => Math.round(v * 100) + '%') => {
        const v = h('span', { class: 'val' }, fmt(settings[key]));
        const i = h('input', { type: 'range', min, max, step, value: settings[key] });
        i.addEventListener('input', () => { settings[key] = parseFloat(i.value); v.textContent = fmt(settings[key]); saveSettings(); audio.applyVolumes(); this.game.applySettings(); });
        return [i, v];
      };
      const select = (key, opts) => {
        const s = h('select', {});
        opts.forEach(([val, label]) => { const o = h('option', { value: String(val) }, label); if (String(settings[key]) === String(val)) o.selected = true; s.appendChild(o); });
        s.addEventListener('change', () => {
          const raw = s.value;
          settings[key] = raw === 'true' ? true : raw === 'false' ? false : isNaN(+raw) ? raw : +raw;
          saveSettings(); this.game.applySettings();
        });
        return s;
      };
      c.appendChild(h('div', { class: 'opt-note' }, 'ÁUDIO'));
      c.appendChild(row('Volume geral', ...slider('master', 0, 1, 0.05)));
      c.appendChild(row('Efeitos e ambiente', ...slider('sfx', 0, 1, 0.05)));
      c.appendChild(row('Música', ...slider('music', 0, 1, 0.05)));
      c.appendChild(row('Vozes', ...slider('voices', 0, 1, 0.05)));
      c.appendChild(row('Vozes sintetizadas (navegador)', select('tts', [[true, 'Ligadas'], [false, 'Só legendas']])));
      c.appendChild(h('div', { class: 'opt-note' }, 'CONTROLE E CÂMERA'));
      c.appendChild(row('Sensibilidade do mouse', ...slider('sensitivity', 0.2, 3, 0.05, (v) => v.toFixed(2))));
      c.appendChild(row('Inverter eixo Y', select('invertY', [[false, 'Não'], [true, 'Sim']])));
      c.appendChild(row('Campo de visão', ...slider('fov', 60, 95, 1, (v) => Math.round(v) + '°')));
      c.appendChild(row('Tremor de câmera', ...slider('shake', 0, 1, 0.05)));
      c.appendChild(h('div', { class: 'opt-note' }, 'SUSTOS E ACESSIBILIDADE'));
      c.appendChild(row('Jump scares', select('scare', [[2, 'Completos'], [1, 'Suaves'], [0, 'Desligados']])));
      c.appendChild(row('Flashes e luzes piscando', select('flashes', [[true, 'Normais'], [false, 'Reduzidos']])));
      c.appendChild(row('Modo história (perseguições não te pegam)', select('storyMode', [[false, 'Não'], [true, 'Sim']])));
      c.appendChild(row('Qualidade gráfica', select('quality', [['auto', 'Automática'], ['high', 'Alta'], ['low', 'Leve (PCs fracos)']])));
      c.appendChild(h('div', { class: 'opt-note' }, 'As opções são salvas automaticamente neste navegador.'));
    });
  }

  openControls() {
    const rows = [
      ['W A S D / setas', 'andar'], ['Mouse', 'olhar'], ['Shift', 'correr (faz barulho)'], ['C (alterna) / Ctrl (segura)', 'agachar'],
      ['E ou clique', 'interagir / examinar / esconder-se'], ['F', 'lanterna do celular'], ['Botão direito (segure)', 'levantar o celular: câmera'],
      ['Q ou rodinha (com o celular levantado)', 'trocar modo: CÂMERA ↔ VÍDEO (casa.mp4)'], ['Clique (com o celular levantado)', 'tirar foto'],
      ['R', 'rádio (depois de achar o fone)'], ['TAB', 'celular (mensagens, vídeo, galeria)'], ['I', 'mochila (itens)'], ['J', 'diário (objetivo, notas, fotos, regras, planta)'],
      ['H', 'dica (fica mais clara aos poucos)'], ['Espaço (escondida)', 'prender a respiração'], ['ESC', 'pausar'],
    ];
    this.openSub('<h2>CONTROLES</h2>', (c) => {
      const t = h('table', { class: 'ctrl-table' });
      rows.forEach(([k, v]) => t.appendChild(h('tr', {}, h('td', {}, k), h('td', {}, v))));
      c.appendChild(t);
      c.appendChild(h('p', { class: 'opt-note' }, 'Dica: jogue com fones de ouvido. Muitos sons vêm de outros cômodos — e alguns vêm do cômodo errado.'));
    });
  }

  openNames() {
    const fields = [
      ['rafaela', 'Protagonista (nome)'], ['rafa', 'Apelido dela'], ['wendel', 'Irmão (que gravou a casa)'], ['julia', 'Irmã'], ['pedro', 'Irmão'],
      ['mae', 'Mãe'], ['pai', 'Pai'], ['bento', 'Gato 1'], ['lili', 'Gato 2'], ['sobrenome', 'Sobrenome (opcional)'], ['escola', 'Colégio (opcional)'],
    ];
    this.openSub('<h2>PERSONALIZAR NOMES</h2>', (c) => {
      c.appendChild(h('p', { class: 'opt-note' }, 'Os nomes ficam salvos só neste navegador. Deixe em branco para usar o padrão.'));
      fields.forEach(([k, label]) => {
        const i = h('input', { type: 'text', value: names[k] || '', placeholder: DEFAULT_NAMES[k] || '' });
        i.addEventListener('input', () => { names[k] = i.value; });
        c.appendChild(h('div', { class: 'opt-row' }, h('span', {}, label), i));
      });
      this._onSubClose = () => { saveNames(); el('menu-player-name').textContent = names.rafaela; };
    });
  }

  openCredits() {
    this.openSub('', (c) => {
      c.appendChild(h('div', { class: 'credits' },
        h('h2', {}, 'CRÉDITOS'),
        h('p', {}, T('Feito para {rafaela}, a pedido do irmão, {wendel}.')),
        h('p', {}, 'A casa: ela mesma, a partir de dois vídeos gravados pela família. Planta, móveis e cores reinterpretados à mão.'),
        h('p', {}, T('Elenco: {rafaela} · {wendel} · {julia} · {pedro} · {mae} · {pai} · {bento} e {lili} · Tique-Taque · O Inquilino')),
        h('p', {}, 'Direção, roteiro, programação, sons e música: criados com Claude (IA da Anthropic), com three.js. Todos os sons e imagens são gerados por código.'),
        h('p', { style: 'color:#9b958a' }, 'Três segredos estão escondidos pela casa: um é preto e branco, um toca uma música para quem esqueceu, e um guarda um momento que pode ser desfeito.'),
      ));
    });
  }

  ending(html, onBack) {
    this.showHud(false);
    const e = el('ending');
    e.classList.remove('hidden');
    const inner = el('ending-inner');
    inner.innerHTML = html;
    const b = h('button', { onclick: () => { e.classList.add('hidden'); onBack(); } }, 'Voltar ao menu');
    inner.appendChild(h('div', {}, b));
  }

  loading(v) { el('loading').classList.toggle('hidden', !v); }

  // ------------------------------------------------------------ fundo do menu
  _menuBg() {
    const c = el('menu-bg');
    const ctx = c.getContext('2d');
    let t = 0;
    const draw = () => {
      if (!this.menuOpen) { requestAnimationFrame(draw); return; }
      const w = (c.width = Math.floor(innerWidth / 2)), hh = (c.height = Math.floor(innerHeight / 2));
      t += 1 / 60;
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, w, hh);
      // corredor em perspectiva
      const cx = w / 2, cy = hh * 0.55;
      const vw = w * 0.06, vh = hh * 0.2;
      ctx.strokeStyle = 'rgba(200,190,170,0.18)'; ctx.lineWidth = 1;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (const [sx, sy] of corners) { ctx.beginPath(); ctx.moveTo(cx + sx * vw, cy + sy * vh); ctx.lineTo(cx + sx * w * 0.7, cy + sy * hh * 0.9); ctx.stroke(); }
      for (let k = 1; k < 6; k++) {
        const f = Math.pow(k / 6, 1.6);
        const ww = vw + (w * 0.7 - vw) * f, hh2 = vh + (hh * 0.9 - vh) * f;
        ctx.strokeStyle = `rgba(200,190,170,${0.05 + f * 0.1})`;
        ctx.strokeRect(cx - ww, cy - hh2, ww * 2, hh2 * 2);
      }
      // porta no fim
      ctx.fillStyle = 'rgba(80,40,25,0.8)'; ctx.fillRect(cx - vw * 0.6, cy - vh * 0.9, vw * 1.2, vh * 1.9);
      // figura que às vezes aparece
      const ph = (Math.sin(t * 0.3) + 1) / 2;
      if (ph > 0.8) { ctx.fillStyle = `rgba(0,0,0,${(ph - 0.8) * 5})`; ctx.fillRect(cx - vw * 0.22, cy - vh * 0.75, vw * 0.44, vh * 1.7); ctx.beginPath(); ctx.arc(cx, cy - vh * 0.85, vw * 0.2, 0, Math.PI * 2); ctx.fill(); }
      // ruído VHS
      const img = ctx.getImageData(0, 0, w, hh);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 40; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      ctx.putImageData(img, 0, 0);
      const band = (t * 60) % hh;
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, band, w, 6);
      requestAnimationFrame(draw);
    };
    draw();
  }
}
