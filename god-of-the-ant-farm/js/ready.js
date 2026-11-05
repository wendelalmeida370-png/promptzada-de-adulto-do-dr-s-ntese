'use strict';
// ============================================================
//  Ready-made worlds: worlds the game itself already lived, with
//  its own time skip (qa/prontos.js), shipped beside it in worlds/.
//  Opening one is loading a save: the same rules, the same future
//  it would have had — only the waiting is gone. Each file is a
//  script (it loads from a server and from a folder on the disk
//  alike); the small list says what each world is before it loads.
// ============================================================
(function (G) {
  const Rd = G.Ready = { meta: {}, data: {} };
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // (the order of the menu, and what each world is for)
  Rd.INFO = {
    cidade: { name: 'A primeira cidade', sub: 'Praças, casas de pedra e comércio: a bênção acabou de terminar e os vizinhos se olham.' },
    metropole: { name: 'A primeira metrópole', sub: 'Palácios, teatros e aquedutos. Reinos grandes, prontos para as grandes guerras.' },
    mega: { name: 'A primeira megalópole', sub: 'Um mar de telhados: a maior cidade que este mundo já viu.' },
    mundial: { name: 'Guerra mundial', sub: 'O mundo acabou de se partir em blocos. As alianças fecharam, os exércitos marcham.' },
    anos100: { name: '100 anos', sub: 'Um século de história sem a mão de deus: reinos, guerras, dinastias.' },
    anos500: { name: '500 anos', sub: 'O mesmo mundo, quatro séculos depois: impérios que nasceram e caíram.' },
    anos1000: { name: '1000 anos', sub: 'Um milênio inteiro de reinos, guerras e lendas.' },
  };
  Rd.list = m => { Object.assign(Rd.meta, m); };
  Rd.got = (key, str) => { Rd.data[key] = str; };
  // a script from the worlds folder (the list, or one world)
  function fetchScript(file, ok, fail) {
    const s = document.createElement('script'); s.src = 'worlds/' + file + '.js';
    s.onload = () => { s.remove(); ok(); }; s.onerror = () => { s.remove(); fail(); };
    document.head.appendChild(s);
  }
  let listed = false;
  Rd.open = function (fromGame) {
    if (!listed) { fetchScript('lista', () => { listed = true; Rd.open(fromGame); }, () => G.UI.toast('Mundos prontos', 'A lista dos mundos não veio junto com o jogo.', 'skull')); return; }
    const TI = G.City.TIERS;
    const cards = Object.entries(Rd.INFO).filter(([k]) => Rd.meta[k]).map(([k, w]) => {
      const m = Rd.meta[k]; const c = m.city;
      const facts = [`ano ${m.day}`, `${m.pop} almas`, `${m.peoples} ${m.peoples === 1 ? 'povo' : 'povos'}`, `mapa ${m.N}×${m.N}`].join(' · ');
      const big = c ? `${esc(c.name)}, ${TI[c.tier].toLowerCase()} de ${c.pop}` : '';
      return `<button class="rd-world" data-m="ready-go" data-k="${k}"><b>${esc(w.name)}</b><span>${esc(w.sub)}</span><em>${facts}${big ? '<br>a maior: ' + big : ''}${m.ww ? '<br>' + esc(m.ww) : ''}</em></button>`;
    }).join('');
    Rd.fromGame = !!fromGame;
    G.UI.openModal(`<h2>Mundos prontos</h2>
      <p class="sk-lead">Mundos que o jogo já viveu sozinho, ano por ano, com as mesmas regras de sempre. Escolha um e você chega na hora — sem esperar os anos passarem.${fromGame ? ' O mundo atual será substituído.' : ''}</p>
      <div class="rd-worlds">${cards || '<p class="muted center">Nenhum mundo pronto veio junto com o jogo.</p>'}</div>
      <div class="mbtns"><button data-m="close">Voltar</button></div>`, 'wide ready-modal');
  };
  Rd.load = function (key) {
    const w = Rd.INFO[key]; if (!w) return;
    G.UI.openModal(`<h2>${esc(w.name)}</h2><p class="sk-lead center">Abrindo o mundo…</p>`, 'ready-modal');
    const go = () => {
      // (one paint first, so the god sees the world being opened)
      setTimeout(() => {
        let o = null; try { o = JSON.parse(Rd.data[key]); } catch (e) { o = null; }
        delete Rd.data[key]; // (the text is heavy: once read, the world itself is what is kept)
        if (!o) { G.UI.closeModal(); G.UI.toast('Mundos prontos', 'Este mundo veio danificado.', 'skull'); return; }
        G.Main.openSave(o, `${w.name}: ano ${o.day}, ${o.villagers.length} habitantes. O mundo é seu.`);
      }, 30);
    };
    if (Rd.data[key]) go();
    else fetchScript(key, () => (Rd.data[key] ? go() : fail()), fail);
    function fail() { G.UI.closeModal(); G.UI.toast('Mundos prontos', 'Este mundo não veio junto com o jogo.', 'skull'); }
  };
})(window.G);
