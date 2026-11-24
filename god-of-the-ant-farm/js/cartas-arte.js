'use strict';
// ============================================================
//  A arte das Tabuletas (G.CartasArte; a quarta onda da taverna,
//  T5 — D-862, D-863): cada tabuleta pintada por código, em SVG e
//  CSS, sem nada buscado (o jogo abre de file://). Cada povo pinta
//  do seu jeito, como as artes de verdade de cada um:
//   - o grego, em figuras negras sobre a terracota, com o meandro;
//   - o egípcio, de perfil e chapado, no lápis-lazúli e no ouro,
//     com o friso de blocos, o disco alado e o lótus;
//   - o nórdico, entalhado e pintado na madeira escura, com o nó
//     trançado e as cantoneiras de ferro;
//   - o asteca, como nos códices: o contorno grosso e as cores
//     chapadas, o turquesa, o vermelho e o ouro, a greca em degraus;
//   - o romano, em relevo de ouro sobre o vermelho pompeiano, na
//     moldura de mármore com o louro;
//   - o clássico (os Titãs), em bronze dourado sobre a noite de
//     antes do mundo, com as estrelas e a voluta.
//  Cada tabuleta tem a sua figura (ART: a chave da tabuleta → o
//  desenho, a regra 393), a sua moldura, a sua raridade que se vê
//  (o brilho de folha da lendária, o brilho vivo da única) e o seu
//  verso. Só se vê: não lê o mundo nem sorteia (regra 3).
// ============================================================
(function (G) {
  const A = G.CartasArte = {};
  const C = () => G.Cartas;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------ os pincéis de cada povo ------------------------------
  // os papéis das cores de uma figura: k o corpo, h o cabelo e as penas, a o ouro e o enfeite, w o branco, r o vermelho, t o turquesa,
  // b o azul, g o verde, l as linhas de dentro (a incisão do grego, a sombra do entalhe, o contorno do códice), o o contorno das
  // pinturas chapadas (o egípcio e o asteca), sk a pele
  const ST = A.ESTILO = {
    grego: { nome: 'figuras negras', k: '#1c120b', h: '#1c120b', a: '#8f2a17', w: '#f1e6cf', r: '#8f2a17', t: '#1c120b', b: '#1c120b', g: '#1c120b', sk: '#1c120b', skf: '#f1e6cf', l: '#d9864c', lw: 1.3, o: '', bg: ['#e7955a', '#c86a33', '#a9501f'], ink: '#1c120b', paper: '#d8804a' },
    egipcio: { nome: 'pintura chapada', k: '#a4492a', h: '#1d2f6e', a: '#d9a62a', w: '#f4ecd6', r: '#a63a24', t: '#2aa198', b: '#1f3d8a', g: '#3f7a4a', sk: '#a4492a', skf: '#d79a55', l: '#22180e', lw: 1.4, o: 'stroke="#22180e" stroke-width="1.6" stroke-linejoin="round"', bg: ['#f3e5bd', '#e6cf95', '#cfae67'], ink: '#22180e', paper: '#ecd9a4' },
    nordico: { nome: 'entalhe pintado', k: '#ead5a6', h: '#c8a06a', a: '#dba64a', w: '#f7ecd2', r: '#a8352a', t: '#6f9e8f', b: '#4c6f8c', g: '#6f8f5a', sk: '#ead5a6', skf: '#ead5a6', l: '#2a170b', lw: 1.5, o: 'stroke="#2a170b" stroke-width="1.1" stroke-linejoin="round"', bg: ['#2c3a4a', '#1b2430', '#10151c'], ink: '#2a170b', paper: '#4a2f1b', sombra: 'rgba(42, 23, 11, .26)' },
    asteca: { nome: 'códice', k: '#c8784c', h: '#1b120b', a: '#e9b53b', w: '#f5ead2', r: '#c2352a', t: '#1aa196', b: '#2c68b0', g: '#4f9a3a', sk: '#c8784c', skf: '#d99260', l: '#140b06', lw: 2, o: 'stroke="#140b06" stroke-width="2.6" stroke-linejoin="round"', bg: ['#ead6a6', '#d9bd85', '#c19a5e'], ink: '#140b06', paper: '#c79c69' },
    romano: { nome: 'relevo de ouro', k: 'url(#ctOuroR)', h: 'url(#ctOuroR2)', a: '#f6e2a0', w: '#f8efd8', r: '#7d1510', t: '#3f7f86', b: '#2d4f86', g: '#55703a', sk: 'url(#ctOuroR)', skf: 'url(#ctOuroR)', l: '#5d3a10', lw: 1.3, o: 'stroke="#4a2c08" stroke-width=".8" stroke-linejoin="round"', bg: ['#a32418', '#851710', '#5c0d09'], ink: '#4a2c08', paper: '#ece4d4', sombra: 'rgba(80, 40, 4, .28)' },
    classico: { nome: 'bronze dourado', k: 'url(#ctOuroC)', h: 'url(#ctOuroC2)', a: '#ffe7a6', w: '#fff3d2', r: '#c4503a', t: '#7fd3d0', b: '#6a8ad8', g: '#8fbf7a', sk: 'url(#ctOuroC)', skf: 'url(#ctOuroC)', l: '#2a1c06', lw: 1.3, o: 'stroke="#2a1c06" stroke-width=".8" stroke-linejoin="round"', bg: ['#2d2a62', '#191842', '#0b0b22'], ink: '#2a1c06', paper: '#2a2440', sombra: 'rgba(16, 10, 30, .32)' },
  };
  // (o povo da tabuleta, e o pincel dele; uma tabuleta de outro povo — o furto — pinta-se com o pincel dela)
  const stOf = povo => ST[povo] || ST.classico;

  // ------------------------------ as figuras: os traços de cada coisa ------------------------------
  // cada traço devolve SVG nas coordenadas da janela da tabuleta (200 × 180), no pincel P; t: uma transformação ('' sem nenhuma)
  const f = (d, fill, P, ex) => `<path d="${d}" fill="${fill}" ${P.o}${ex ? ' ' + ex : ''}/>`;
  const ln = (d, P, w, col) => `<path d="${d}" fill="none" stroke="${col || P.l}" stroke-width="${w || P.lw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const g = (t, s) => `<g${t ? ` transform="${t}"` : ''}>${s}</g>`;
  const circ = (x, y, r, fill, P, ex) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${P ? P.o : ''}${ex ? ' ' + ex : ''}/>`;
  const F = A.FIG = {};

  // o busto de perfil, virado para a direita (o deus, o herói): o ombro, o pescoço, a cabeça; o: { fem, barba, cabelo, elmo, coroa,
  // olho, pele } — os enfeites vêm depois, por cima
  const BUSTO = 'M24 180C28 160 42 150 58 146C70 143 79 140 83 133C80 126 77 118 75 108C70 92 71 72 81 58C91 45 105 39 118 39C131 39 139 47 139 60L140 68L143 74L151 86C152 89 150 91 147 91L143 92C144 94 145 96 144 98L139 100C142 101 143 103 142 105C143 111 141 115 138 118C134 122 128 123 124 125L124 137C132 145 148 150 162 156C171 161 175 170 177 180Z';
  const BUSTO_F = 'M30 180C34 162 46 153 60 149C71 146 80 142 84 135C81 127 78 119 76 109C71 93 72 73 82 59C92 46 106 40 118 40C130 40 138 48 138 60L139 68L141 74L148 85C149 88 147 90 144 90L141 91C142 93 143 95 142 97L138 99C140 100 141 102 140 104C140 109 138 113 135 115C131 118 127 119 124 121L124 136C131 143 145 149 158 155C166 159 170 169 172 180Z';
  F.busto = function (P, o) {
    o = o || {}; const fem = !!o.fem; let s = '';
    const sk = o.pele || (fem ? P.skf : P.sk);
    // (o cabelo de trás: o comprido da mulher, a nuca do homem)
    if (o.cabelo === 'longo') s += f('M76 70C66 92 64 122 70 150C76 162 92 164 100 156C96 136 96 112 100 92Z', P.h, P);
    s += f(fem ? BUSTO_F : BUSTO, sk, P);
    // (o volume dos que pintam em relevo — o entalhe do norte, o ouro de Roma, o bronze dos Titãs —: a sombra do lado de trás da cabeça e do ombro)
    if (P.sombra) s += `<path d="M24 180C28 160 42 150 58 146C70 143 79 140 83 133C80 126 77 118 75 108C70 92 71 72 81 58C88 48 98 42 108 40C100 52 96 66 96 82C96 100 100 116 104 130C100 140 92 150 82 160C72 170 66 176 64 180Z" fill="${P.sombra}"/><path d="M118 118C126 122 132 128 136 132L124 137L124 125Z" fill="${P.sombra}"/>`;
    // (a orelha, o olho, a sobrancelha, a boca: as linhas de dentro)
    s += ln('M101 79C96 76 93 82 95 88C97 93 101 94 103 91', P, P.lw);
    s += o.olho === 'egipcio' ? `${f('M118 66C123 62 130 62 135 66C130 69 123 70 118 66Z', P.w, P, '')}${circ(128, 66, 2.4, P.ink)}${ln('M135 66L141 66M118 67C122 72 116 76 118 80', P, 1.4)}` : `${f('M121 66C125 63 131 63 135 66C131 68 125 68 121 66Z', P.l === '#d9864c' ? P.l : P.w, P, '')}${circ(130, 65.6, 1.6, P.ink)}`;
    s += ln('M119 59C124 55 132 55 137 58', P, P.lw * 1.2);
    if (!fem) s += ln('M136 101L141 101', P, P.lw);
    // (a barba: a cheia e crespa dos deuses velhos, a pontuda, a curta)
    if (o.barba === 'cheia') s += f('M106 86C110 98 124 102 134 104C143 109 147 120 145 133C142 147 129 156 115 154C101 152 93 139 95 125C96 111 100 96 106 86Z', P.h, P) + ln('M108 112C113 116 118 114 120 120M104 126C110 130 116 128 118 136M112 140C118 144 126 142 130 148M124 116C130 120 136 118 140 124M126 130C132 134 138 132 141 138', P, P.lw);
    else if (o.barba === 'ponta') s += f('M110 92C116 100 126 102 136 106C140 114 140 124 134 138L126 132C118 124 110 112 110 92Z', P.h, P) + ln('M116 104C120 112 124 118 130 126', P, P.lw);
    else if (o.barba === 'egipcia') s += f('M134 116L140 116L141 140L135 142Z', P.h, P) + ln('M135 122L140 122M135 128L141 128M135 134L141 134', P, 1, P.a);
    // (o cabelo de cima)
    if (o.cabelo === 'crespo') s += f('M78 104C68 84 70 58 86 46C98 36 118 34 132 42C138 46 140 52 139 58C126 52 112 54 104 62C96 70 95 86 98 100C92 106 84 108 78 104Z', P.h, P) + ln('M86 58C90 54 96 56 96 62M84 74C88 70 94 72 93 78M88 90C92 86 97 88 96 94M102 48C106 44 112 46 112 52M116 44C120 40 126 42 126 48', P, P.lw);
    else if (o.cabelo === 'longo' || o.cabelo === 'coque') s += f('M80 100C70 80 74 56 90 46C104 37 124 37 134 46C138 50 139 54 138 58C124 52 110 54 102 62C95 70 96 86 98 98C92 102 86 104 80 100Z', P.h, P) + ln('M92 54C100 50 110 50 118 52M88 66C94 62 102 62 106 64M86 80C90 76 96 76 98 80', P, P.lw);
    if (o.cabelo === 'coque') s += circ(74, 66, 13, P.h, P) + ln('M66 62C70 58 78 58 82 64', P, P.lw);
    if (o.cabelo === 'curto') s += f('M80 96C72 80 74 58 88 48C100 40 120 38 132 44C137 47 139 52 139 57C126 52 112 54 105 60C98 68 97 82 99 94C92 98 86 100 80 96Z', P.h, P);
    return s;
  };
  // os enfeites da cabeça, por cima do busto
  F.elmo = function (P, o) { // (o coríntio dos gregos, com a crista de crina)
    o = o || {}; let s = '';
    if (o.crista !== false) s += f('M70 40C84 14 116 6 140 16C152 21 158 30 158 40C150 30 136 26 122 28C104 30 86 36 76 46Z', o.cor || P.r, P) + ln('M80 36C92 24 112 18 132 20M86 40C98 30 116 26 134 26', P, P.lw);
    s += f('M74 104C66 80 70 52 90 40C106 31 128 32 140 44C146 50 148 58 147 66L141 68L134 64C126 62 120 66 120 72L124 96C126 104 132 108 140 108L138 118C124 124 104 124 92 118C84 114 78 110 74 104Z', o.metal || P.k, P);
    s += ln('M82 64C94 54 116 52 136 58M120 72C116 80 118 90 124 96', P, P.lw * 1.2) + ln('M90 46C96 42 104 40 112 40', P, P.lw, P.w);
    return s;
  };
  F.elmoAsa = function (P, o) { // (o elmo de asas da valquíria; o nórdico de verdade não tinha chifres)
    let s = f('M78 72C78 50 96 38 116 38C134 38 144 50 144 66L140 70C120 64 98 66 80 76Z', P.a, P) + f('M100 70L104 90L110 90L112 68Z', P.a, P);
    s += f('M80 58C66 46 56 30 58 14C66 26 74 32 86 38C78 30 74 22 76 12C84 24 90 32 98 38Z', P.w, P) + ln('M66 26C72 34 78 40 86 44M74 22C80 30 86 36 94 40', P, P.lw);
    return s + ln('M82 62C100 54 122 54 142 62', P, P.lw);
  };
  F.louro = function (P, o) { // (a coroa de louro, nas folhas do ouro)
    o = o || {}; const col = o.cor || P.a; let s = ''; const L = [[84, 92, -60], [82, 80, -75], [84, 68, -95], [90, 57, -115], [99, 49, -135], [110, 44, -150], [122, 42, -165], [133, 45, 175]];
    for (const [x, y, a] of L) s += `<ellipse cx="${x}" cy="${y}" rx="7.5" ry="3.2" transform="rotate(${a} ${x} ${y})" fill="${col}" ${P.o}/>`;
    return s + ln('M86 98C80 74 92 50 118 43C128 41 134 43 138 46', P, 1.2, col);
  };
  F.diadema = (P, o) => f('M84 58C98 44 120 40 138 48L136 54C120 48 100 50 88 62Z', (o && o.cor) || P.a, P) + circ(112, 47, 3.2, P.r, P);
  F.nemes = function (P, o) { // (o lenço listrado dos faraós e dos deuses do Egito)
    o = o || {}; const c1 = o.c1 || P.a, c2 = o.c2 || P.b; let s = f('M82 46C96 34 122 32 138 44L140 62L122 60C108 60 100 68 100 80L98 128C88 132 74 128 66 118L72 82C72 64 74 54 82 46Z', c1, P);
    for (let i = 0; i < 6; i++) s += ln(`M${72 + i * 0.4} ${84 + i * 7}L${98} ${84 + i * 7}`, P, 2.6, c2);
    for (let i = 0; i < 4; i++) s += ln(`M${92 + i * 11} ${44 - i}L${96 + i * 10} ${60}`, P, 2.6, c2);
    return s;
  };
  F.coroaDupla = function (P) { // (a dupla coroa do Alto e do Baixo Egito)
    return f('M92 54L92 18C92 10 104 8 108 16L110 44L126 44L126 24C130 22 134 26 134 30L132 56C118 50 104 50 92 54Z', P.w, P) + f('M90 56L88 30L98 30L100 44L128 44L130 30L138 28L136 58C122 52 104 52 90 56Z', P.r, P) + ln('M128 30C136 22 146 22 150 30', P, 1.6, P.a);
  };
  F.disco = (P, x, y, r, o) => { o = o || {}; let s = circ(x, y, r, o.cor || P.r, P); if (o.cobra !== false) s += f(`M${x - r * 0.2} ${y + r}C${x - r * 0.7} ${y + r * 1.1} ${x - r * 0.9} ${y + r * 0.6} ${x - r * 0.6} ${y + r * 0.4}C${x - r * 0.4} ${y + r * 0.2} ${x - r * 0.5} ${y - r * 0.2} ${x - r * 0.3} ${y - r * 0.1}`, P.a, P); return s; };
  F.colar = (P, o) => { o = o || {}; let s = f('M78 146C92 160 128 164 150 154L156 166C128 178 90 174 70 158Z', o.c1 || P.a, P); s += ln('M76 152C94 166 128 168 152 160', P, 2.4, o.c2 || P.t) + ln('M73 156C92 171 128 173 154 164', P, 1.4, o.c3 || P.r); return s; };
  F.cocar = function (P, o) { // (o cocar de penas de quetzal e de águia: o leque atrás da cabeça)
    o = o || {}; const n = o.n || 9; let s = '';
    for (let i = 0; i < n; i++) { const a = -150 + i * (100 / (n - 1)); const r = Math.PI * a / 180; const x2 = 104 + Math.cos(r) * 80, y2 = 70 + Math.sin(r) * 80; const col = i % 3 === 0 ? P.t : i % 3 === 1 ? P.g : P.r;
      s += f(`M104 70L${(x2 + Math.cos(r + 0.15) * 8).toFixed(1)} ${(y2 + Math.sin(r + 0.15) * 8).toFixed(1)}Q${(x2 + Math.cos(r) * 14).toFixed(1)} ${(y2 + Math.sin(r) * 14).toFixed(1)} ${(x2 + Math.cos(r - 0.15) * 8).toFixed(1)} ${(y2 + Math.sin(r - 0.15) * 8).toFixed(1)}Z`, col, P) + ln(`M${(104 + Math.cos(r) * 30).toFixed(1)} ${(70 + Math.sin(r) * 30).toFixed(1)}L${(x2 + Math.cos(r) * 8).toFixed(1)} ${(y2 + Math.sin(r) * 8).toFixed(1)}`, P, 1.2, P.w); }
    return s + f('M80 60C92 44 120 42 138 52L136 62C118 56 98 58 84 68Z', P.a, P) + circ(104, 52, 5, P.t, P);
  };
  // (o olho grande de frente: Odin, Hórus, a visão)
  F.olho = (P, x, y, s, o) => { o = o || {}; const k = s / 20; return f(`M${x - 20 * k} ${y}C${x - 10 * k} ${y - 12 * k} ${x + 10 * k} ${y - 12 * k} ${x + 20 * k} ${y}C${x + 10 * k} ${y + 12 * k} ${x - 10 * k} ${y + 12 * k} ${x - 20 * k} ${y}Z`, o.branco || P.w, P) + circ(x, y, 7 * k, o.iris || P.b, P) + circ(x, y, 3 * k, P.ink); };

  // ------------------------------ as coisas que eles seguram ------------------------------
  F.raio = (P, t, o) => g(t, f('M22 0L4 34L16 34L6 66L34 22L20 22L32 0Z', (o && o.cor) || P.a, P, 'stroke-linejoin="round"') + ln('M20 6L10 28', P, 1.2, P.w));
  F.martelo = (P, t) => g(t, f('M-4 0H44V24H-4Z', P.k === P.ink ? P.a : P.k, P) + f('M12 24H28L26 88H14Z', P.h, P) + f('M10 88H30V98H10Z', P.a, P) + ln('M2 8H40M2 16H40', P, P.lw) + ln('M20 30V82', P, P.lw));
  F.lanca = (P, t, o) => { o = o || {}; const L = o.len || 150; return g(t, f(`M-2 0L2 0L2 ${L}L-2 ${L}Z`, o.haste || P.h, P) + f(`M0 -26C6 -14 6 -4 4 2L-4 2C-6 -4 -6 -14 0 -26Z`, o.ponta || P.a, P)); };
  F.tridente = (P, t, o) => g(t, f('M-2 0H2V150H-2Z', (o && o.haste) || P.h, P) + f('M-22 -6C-22 6 -14 12 0 12C14 12 22 6 22 -6L18 -6C18 2 12 6 4 6L4 -6L-4 -6L-4 6C-12 6 -18 2 -18 -6Z', (o && o.cor) || P.a, P) + f('M-22 -6L-20 -24L-16 -6ZM-2 -6L0 -30L2 -6ZM16 -6L20 -24L22 -6Z', (o && o.cor) || P.a, P));
  F.bidente = (P, t) => g(t, f('M-2 0H2V150H-2Z', P.h, P) + f('M-12 -4C-12 6 12 6 12 -4L9 -4C9 1 -9 1 -9 -4Z', P.a, P) + f('M-12 -4L-10 -26L-7 -4ZM7 -4L10 -26L12 -4Z', P.a, P));
  F.escudo = (P, t, o) => { o = o || {}; const r = o.r || 30; let s = circ(0, 0, r, o.cor || P.r, P) + circ(0, 0, r * 0.78, 'none', null, `stroke="${o.aro || P.a}" stroke-width="${r * 0.08}"`) + circ(0, 0, r * 0.22, o.umbo || P.a, P); if (o.cruz) s += ln(`M0 ${-r * 0.75}V${r * 0.75}M${-r * 0.75} 0H${r * 0.75}`, P, r * 0.12, o.cruz); if (o.sinal) s += o.sinal; return g(t, s); };
  F.espada = (P, t, o) => g(t, f('M-4 0L4 0L3 70L0 80L-3 70Z', (o && o.cor) || P.w, P) + f('M-14 -4H14V2H-14Z', P.a, P) + f('M-3 -26H3V-4H-3Z', P.h, P) + circ(0, -29, 4, P.a, P) + ln('M0 4V70', P, 0.8, P.l));
  F.machado = (P, t) => g(t, f('M-2 0H3V110H-2Z', P.h, P) + f('M3 4C20 2 32 -6 36 -16C40 4 40 28 34 44C30 32 18 24 3 24Z', P.w, P) + ln('M8 8C20 8 28 0 32 -6', P, 1, P.l));
  F.arco = (P, t) => g(t, ln('M0 -60C30 -40 30 40 0 60', P, 5, P.h) + ln('M0 -60L0 60', P, 1.2, P.w));
  F.caduceu = (P, t) => g(t, f('M-2 -50H2V70H-2Z', P.a, P) + ln('M0 -40C14 -30 -14 -16 0 -6C14 4 -14 18 0 28C14 38 -14 52 0 60', P, 3.2, P.k === P.ink ? P.w : P.g) + ln('M0 -40C-14 -30 14 -16 0 -6C-14 4 14 18 0 28C-14 38 14 52 0 60', P, 3.2, P.k === P.ink ? P.r : P.t) + f('M0 -50C-14 -60 -28 -58 -34 -50C-24 -50 -12 -46 0 -44ZM0 -50C14 -60 28 -58 34 -50C24 -50 12 -46 0 -44Z', P.w, P));
  F.lira = (P, t) => g(t, f('M-26 30C-34 0 -30 -30 -16 -44L-10 -40C-20 -26 -22 2 -16 30ZM26 30C34 0 30 -30 16 -44L10 -40C20 -26 22 2 16 30Z', P.h, P) + f('M-30 -40H30V-34H-30Z', P.a, P) + f('M-20 28H20C22 40 -22 40 -20 28Z', P.k, P) + ln('M-10 -34V30M-4 -34V30M2 -34V30M8 -34V30', P, 0.9, P.w));
  F.ankh = (P, t, o) => g(t, f('M-4 0H4V40H-4ZM-18 -2H18V6H-18ZM0 -2C-12 -4 -14 -30 0 -34C14 -30 12 -4 0 -2ZM0 -9C6 -11 6 -26 0 -27C-6 -26 -6 -11 0 -9Z', (o && o.cor) || P.a, P, 'fill-rule="evenodd"'));
  F.cajado = (P, t) => g(t, f('M-2 0H3V96H-2Z', P.a, P) + f('M3 0C3 -14 -10 -20 -18 -12C-22 -8 -20 -2 -14 -2C-10 -2 -10 -8 -12 -9C-4 -12 0 -6 -2 0Z', P.b, P) + ln('M-2 20H3M-2 40H3M-2 60H3M-2 80H3', P, 2, P.b));
  F.mangual = (P, t) => g(t, f('M-2 0H3V60H-2Z', P.a, P) + [0, 1, 2].map(i => f(`M${2 + i * 4} 0C${8 + i * 6} -6 ${14 + i * 6} -2 ${18 + i * 6} 6L${14 + i * 6} 8C${10 + i * 5} 2 ${6 + i * 4} 2 ${2 + i * 4} 4Z`, i % 2 ? P.b : P.r, P)).join(''));
  F.balanca = (P, t) => g(t, f('M-2 -50H2V30H-2ZM-14 30H14V36H-14Z', P.a, P) + f('M-46 -44H46V-40H-46Z', P.a, P) + ln('M-42 -40L-54 -6M-42 -40L-30 -6M42 -40L30 -6M42 -40L54 -6', P, 1.2, P.a) + f('M-58 -6H-26C-28 4 -56 4 -58 -6ZM26 -6H58C56 4 28 4 26 -6Z', P.a, P) + f('M36 -16C40 -26 48 -30 50 -28C48 -22 42 -16 36 -16Z', P.w, P) + circ(-42, -14, 6, P.r, P));
  F.pena = (P, t, o) => g(t, f('M0 40C-10 14 -10 -20 0 -40C10 -20 10 14 0 40Z', (o && o.cor) || P.w, P) + ln('M0 40V-38M0 -20L-6 -26M0 -6L-7 -13M0 8L-7 1M0 -20L6 -26M0 -6L7 -13M0 8L7 1', P, 1, P.l));
  F.chifre = (P, t) => g(t, f('M-30 20C-20 0 0 -18 26 -24L32 -14C10 -8 -8 6 -18 26Z', P.w, P) + f('M26 -24L32 -14L40 -18L34 -28Z', P.a, P) + ln('M-22 12C-10 0 6 -10 24 -16', P, 1, P.l) + ln('M-14 4L-10 10M-4 -4L0 2M6 -10L10 -4', P, 1.4, P.a));
  F.corrente = (P, t, n) => { let s = ''; for (let i = 0; i < (n || 5); i++) s += `<ellipse cx="${i * 14}" cy="0" rx="9" ry="5" fill="none" stroke="${P.k === P.ink ? P.w : '#8a8d92'}" stroke-width="3.4" transform="rotate(${i % 2 ? 0 : 0} ${i * 14} 0)"/>`; return g(t, s); };
  F.estrela = (P, x, y, r, col) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.42 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${col}"/>`; };
  F.sol = (P, x, y, r, o) => { o = o || {}; let s = ''; const n = o.n || 16; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const a1 = a - Math.PI / n * 0.55, a2 = a + Math.PI / n * 0.55; s += f(`M${(x + Math.cos(a1) * r).toFixed(1)} ${(y + Math.sin(a1) * r).toFixed(1)}L${(x + Math.cos(a) * r * (o.raio || 1.55)).toFixed(1)} ${(y + Math.sin(a) * r * (o.raio || 1.55)).toFixed(1)}L${(x + Math.cos(a2) * r).toFixed(1)} ${(y + Math.sin(a2) * r).toFixed(1)}Z`, i % 2 ? (o.c2 || P.a) : (o.c1 || P.r), P); } return s + circ(x, y, r, o.cor || P.a, P); };
  F.lua = (P, x, y, r, col) => `<path d="M${x} ${y - r}A${r} ${r} 0 1 0 ${x} ${y + r}A${r * 0.75} ${r} 0 1 1 ${x} ${y - r}Z" fill="${col || P.w}" ${P.o}/>`;
  F.ondas = (P, y, n, col, w) => { let d = ''; for (let k = 0; k < (n || 3); k++) { const yy = y + k * 12; d += `M-10 ${yy}`; for (let x = -10; x < 210; x += 20) d += `Q${x + 5} ${yy - 7} ${x + 10} ${yy}T${x + 20} ${yy}`; } return ln(d, null, w || 3, col); };
  F.chamas = (P, x, y, s, o) => { o = o || {}; const k = s / 40; return f(`M${x} ${y}C${x - 22 * k} ${y - 10 * k} ${x - 26 * k} ${y - 34 * k} ${x - 10 * k} ${y - 52 * k}C${x - 10 * k} ${y - 38 * k} ${x - 4 * k} ${y - 32 * k} ${x} ${y - 30 * k}C${x - 2 * k} ${y - 46 * k} ${x + 6 * k} ${y - 62 * k} ${x + 16 * k} ${y - 70 * k}C${x + 12 * k} ${y - 52 * k} ${x + 26 * k} ${y - 40 * k} ${x + 24 * k} ${y - 20 * k}C${x + 22 * k} ${y - 8 * k} ${x + 12 * k} ${y} ${x} ${y}Z`, o.c1 || P.r, P) + f(`M${x} ${y - 4 * k}C${x - 10 * k} ${y - 10 * k} ${x - 10 * k} ${y - 24 * k} ${x - 2 * k} ${y - 34 * k}C${x} ${y - 24 * k} ${x + 6 * k} ${y - 22 * k} ${x + 8 * k} ${y - 30 * k}C${x + 14 * k} ${y - 22 * k} ${x + 12 * k} ${y - 8 * k} ${x} ${y - 4 * k}Z`, o.c2 || P.a, P); };

  // ------------------------------ os bichos ------------------------------
  // (o lobo, de perfil, rosnando: Fenrir, a Loba, o lobo do Ragnarök)
  F.lobo = (P, t, o) => { o = o || {}; const c = o.cor || P.k; const dk = o.escuro || P.h;
    let q = f('M28 180C32 146 42 118 60 96C66 86 72 78 78 72L86 20L106 58C114 56 124 57 132 60L152 70L184 76C190 77 193 82 191 87C189 92 184 94 178 94L152 99L174 104C177 106 176 110 172 111L146 118L151 127L138 122L141 133L128 126L127 137C120 150 116 166 114 180Z', c, P);
    q += f('M89 32L101 57L93 59Z', dk, P) + f('M153 97L178 94L175 102L156 103Z', P.ink === '#1c120b' ? P.r : '#3a1a12', P);
    q += f('M157 97L160 103L163 96L167 102L170 95L174 101L177 94Z', P.w, P, 'stroke-width=".6"') + f('M158 103L161 99L164 104L168 99L171 104Z', P.w, P, 'stroke-width=".6"');
    q += f('M123 66C127 61 136 61 140 66C135 70 128 71 123 66Z', o.olho || P.a, P, 'stroke-width=".8"') + circ(132, 66, 1.8, P.ink) + circ(188, 82, 3.6, P.ink);
    q += ln('M126 60L148 70M150 84L180 86M68 102C64 118 62 134 64 150M82 94C78 112 78 130 82 148M96 100C94 116 96 130 100 142M112 104C110 116 112 126 116 134', P, P.lw);
    return g(t, q); };
  // (a serpente em S, com as escamas: Jörmungandr, Apófis, a naja, a de fogo)
  F.serpente = (P, t, o) => { o = o || {}; const c = o.cor || P.k, c2 = o.ventre || P.a; const body = 'M20 150C40 168 80 168 96 146C110 126 96 102 112 84C126 68 150 70 162 58C172 48 170 34 160 28C152 24 144 28 142 36';
    let s = ln(body, P, o.w || 18, P.ink === '#1c120b' || !P.o ? c : P.ink) + ln(body, P, (o.w || 18) - 5, c) + ln(body, P, 3, c2);
    s += f('M138 30C140 18 156 12 168 18C178 22 182 32 176 38C170 44 156 44 146 40Z', c, P) + circ(164, 26, 2.6, o.olho || P.a) + f('M178 34L192 30L186 36L192 40L178 38Z', P.r, P);
    for (let i = 0; i < 9; i++) { const x = 30 + i * 16, y = i < 3 ? 158 - i * 4 : i < 5 ? 130 - (i - 3) * 20 : 86 - (i - 5) * 10; s += ln(`M${x - 4} ${y - 3}Q${x} ${y + 3} ${x + 4} ${y - 3}`, P, 1, P.l); }
    return g(t, s); };
  // (a serpente que morde a cauda, em círculo: Jörmungandr, o tempo)
  F.ouroboros = (P, cx, cy, r, o) => { o = o || {}; const c = o.cor || P.k; let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${P.o ? P.ink : c}" stroke-width="${r * 0.3}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${r * 0.24}"/>`;
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; s += ln(`M${(cx + Math.cos(a) * (r - r * 0.08)).toFixed(1)} ${(cy + Math.sin(a) * (r - r * 0.08)).toFixed(1)}L${(cx + Math.cos(a + 0.12) * (r + r * 0.08)).toFixed(1)} ${(cy + Math.sin(a + 0.12) * (r + r * 0.08)).toFixed(1)}`, P, 1, P.l); }
    s += f(`M${cx + r * 0.72} ${cy - r * 0.72}C${cx + r * 0.95} ${cy - r * 1.05} ${cx + r * 1.35} ${cy - r * 0.9} ${cx + r * 1.3} ${cy - r * 0.55}C${cx + r * 1.25} ${cy - r * 0.25} ${cx + r * 0.98} ${cy - r * 0.2} ${cx + r * 0.88} ${cy - r * 0.35}Z`, c, P) + circ(cx + r * 1.08, cy - r * 0.72, r * 0.07, o.olho || P.a);
    return s; };
  // (o cavalo, de perfil, a galope: Sleipnir — com oito patas —, Pégaso — com as asas —, os do carro)
  F.cavalo = (P, t, o) => { o = o || {}; const c = o.cor || P.k, cr = o.crina || P.h; let q = '';
    // (as pernas a galope: a da frente estendida, a outra dobrada; a de trás esticada, a outra debaixo — e as de Sleipnir, em dobro)
    const legs = (dx, col) => f(`M${136 + dx} 100L${146 + dx} 104C${158 + dx} 112 ${168 + dx} 122 ${180 + dx} 128L${186 + dx} 137L${177 + dx} 139L${171 + dx} 133C${158 + dx} 126 ${146 + dx} 118 ${134 + dx} 110Z`, col, P)
      + f(`M${122 + dx} 104L${132 + dx} 106C${134 + dx} 118 ${130 + dx} 128 ${124 + dx} 136L${128 + dx} 146L${119 + dx} 147L${116 + dx} 137C${120 + dx} 128 ${122 + dx} 116 ${120 + dx} 106Z`, col, P)
      + f(`M${58 + dx} 98L${68 + dx} 104C${56 + dx} 116 ${40 + dx} 126 ${26 + dx} 132L${18 + dx} 141L${12 + dx} 135L${20 + dx} 127C${32 + dx} 120 ${46 + dx} 110 ${54 + dx} 100Z`, col, P)
      + f(`M${72 + dx} 104L${82 + dx} 106C${88 + dx} 118 ${90 + dx} 130 ${88 + dx} 142L${92 + dx} 151L${83 + dx} 152L${80 + dx} 143C${80 + dx} 132 ${78 + dx} 120 ${72 + dx} 110Z`, col, P);
    if (o.oito) q += legs(9, cr);
    q += legs(0, c);
    q += f('M42 84C26 80 12 92 6 114C16 104 24 100 30 100C24 108 22 116 24 124C32 110 38 102 46 96Z', cr, P);
    q += f('M40 100C38 84 50 74 70 72C92 70 112 70 128 64C140 58 148 46 156 34L168 18L172 9L177 20C183 22 188 28 192 36L199 52C199 57 195 60 190 59L182 58C176 60 170 66 166 74C162 90 150 104 128 108C104 110 74 110 56 106C46 104 40 104 40 100Z', c, P);
    q += f('M126 66C138 58 146 46 156 32L161 26L164 31C156 46 148 60 136 70ZM120 66C128 60 134 52 140 44L144 48C138 56 132 64 126 70Z', cr, P);
    q += circ(181, 32, 2.2, o.olho || P.w) + circ(193, 51, 1.6, P.ink) + ln('M62 80C82 76 104 76 124 72M150 76C146 88 138 96 128 100M60 96C78 100 100 100 120 98', P, P.lw);
    if (o.asas) q += f('M108 70C98 44 100 16 124 0C124 16 130 22 142 24C132 30 134 38 146 40C134 46 136 54 146 58C132 60 122 64 116 72Z', o.asa || P.w, P) + ln('M114 62C114 44 118 26 126 10M120 66C124 52 130 42 140 32M124 68C130 60 136 54 144 50', P, 1.2, P.ink === '#1c120b' ? P.l : P.l);
    return g(t, q); };
  // (a ave de perfil, de asas abertas ou fechadas: o corvo, a águia, o falcão, o ganso, o íbis, a coruja de frente)
  F.ave = (P, t, o) => { o = o || {}; const c = o.cor || P.k; let q = '';
    if (o.abertas) { // (a ave de frente, de asas abertas — a águia do estandarte, a que voa —: as penas em leque, a cabeça de perfil)
      for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) { const a = (sd < 0 ? Math.PI : 0) + sd * (-0.22 - i * 0.2); const L = 34 + i * 7; const x0 = 100 + sd * 8, y0 = 72; const x1 = x0 + Math.cos(a) * L, y1 = y0 - Math.abs(Math.sin(a)) * L; const nx = -Math.sin(a) * 5, ny = Math.cos(a) * 5;
        q += f(`M${x0} ${y0}Q${(x0 + x1) / 2 + nx} ${(y0 + y1) / 2 + ny} ${x1.toFixed(1)} ${y1.toFixed(1)}Q${(x0 + x1) / 2 - nx} ${(y0 + y1) / 2 - ny} ${x0} ${y0 + 6}Z`, c, P); }
      for (let i = 0; i < 5; i++) { const a = Math.PI / 2 + (i - 2) * 0.22; q += f(`M100 120Q${100 + Math.cos(a) * 18 - 4} ${120 + Math.sin(a) * 18} ${(100 + Math.cos(a) * 34).toFixed(1)} ${(120 + Math.sin(a) * 34).toFixed(1)}Q${100 + Math.cos(a) * 18 + 4} ${120 + Math.sin(a) * 18} 100 120Z`, c, P); }
      q += f('M90 62C82 72 82 96 88 114C90 124 95 130 100 134C105 130 110 124 112 114C118 96 118 72 110 62Z', c, P) + f('M92 58C90 44 99 36 110 38C118 40 122 46 122 51L134 56L122 59C118 64 108 66 100 64Z', c, P);
      q += circ(110, 48, 2, o.olho || P.a) + ln('M94 80C98 86 102 86 106 80M94 94C98 100 102 100 106 94M95 108C98 113 102 113 105 108', P, P.lw) + f('M92 132L86 142L94 138L96 146L100 138L104 146L106 138L114 142L108 132Z', P.a, P);
      return g(t, q); }
    // (a ave pousada, de perfil: o corvo, o ganso, o íbis, o beija-flor — o bico pelo jeito dela)
    q += f('M40 150L58 128C60 104 76 86 100 80C112 76 118 66 122 58C128 46 142 42 152 48C158 52 160 58 159 62L160 64C158 90 150 108 128 118C110 126 92 128 74 130L52 152Z', c, P);
    const bico = o.bico === 'curvo' ? 'M156 58C172 60 186 72 190 92C182 80 170 70 156 68Z' : o.bico === 'ganso' ? 'M157 56L178 62C180 66 176 70 158 68Z' : 'M157 55L186 66L158 70Z';
    q += f(bico, o.bicoCor || (P.ink === '#1c120b' ? P.k : P.a), P);
    q += f('M68 104C86 90 112 88 134 96C124 110 104 118 82 120Z', o.asa || (P.o ? P.h : c), P) + ln('M80 112C96 104 112 102 128 100M90 118C104 112 116 110 126 108', P, P.lw);
    q += circ(146, 56, 2.6, o.olho || P.a) + ln('M100 128L96 146M90 146L100 146M110 126L112 146M106 146L118 146', P, 2, P.ink === '#1c120b' ? P.k : P.ink);
    return g(t, q); };
  F.coruja = (P, t, o) => g(t, f('M60 150C50 120 52 80 70 62C66 50 68 40 74 34C80 44 86 46 100 46C114 46 120 44 126 34C132 40 134 50 130 62C148 80 150 120 140 150Z', (o && o.cor) || P.k, P) + circ(86, 72, 11, P.w, P) + circ(114, 72, 11, P.w, P) + circ(86, 72, 5, P.a) + circ(114, 72, 5, P.a) + f('M96 82L104 82L100 92Z', P.a, P) + ln('M74 108C84 112 92 112 100 108C108 112 116 112 126 108M76 124C86 128 94 128 100 124C106 128 114 128 124 124', P, P.lw));
  F.touro = (P, t, o) => g(t, f('M60 60C40 44 24 20 30 4C38 20 50 30 68 36ZM140 60C160 44 176 20 170 4C162 20 150 30 132 36Z', P.w, P) + f('M64 40C80 32 120 32 136 40C150 50 148 76 138 94C132 118 120 140 100 146C80 140 68 118 62 94C52 76 50 50 64 40Z', (o && o.cor) || P.k, P) + f('M82 122C90 132 110 132 118 122C116 136 108 142 100 142C92 142 84 136 82 122Z', P.r, P) + circ(78, 70, 4, P.r) + circ(122, 70, 4, P.r) + ln('M88 132A3 3 0 1 0 89 132M112 132A3 3 0 1 0 113 132M80 56C90 52 110 52 120 56M100 60V100', P, P.lw));
  F.escaravelho = (P, t, o) => g(t, f('M-6 -40C-4 -46 4 -46 6 -40L4 -34H-4Z', P.k, P) + f('M-18 -34C-10 -40 10 -40 18 -34C22 -28 22 -22 18 -20H-18C-22 -22 -22 -28 -18 -34Z', P.b, P) + f('M0 -20C-24 -20 -30 0 -28 20C-26 40 -12 52 0 52C12 52 26 40 28 20C30 0 24 -20 0 -20Z', P.b, P) + ln('M0 -20V52M-24 -6C-14 -8 -6 -6 0 0M24 -6C14 -8 6 -6 0 0', P, 1.4, P.a) + ln('M-26 0L-44 -10M-27 18L-46 22M-20 40L-34 54M26 0L44 -10M27 18L46 22M20 40L34 54', P, 3, P.ink) + f('M-30 -20C-50 -40 -70 -36 -78 -24C-60 -26 -44 -20 -30 -10ZM30 -20C50 -40 70 -36 78 -24C60 -26 44 -20 30 -10Z', P.t, P));
  F.crocodilo = (P, t, o) => g(t, f('M10 96C30 84 60 80 90 80C120 80 150 78 176 70C186 68 192 72 190 78C176 84 156 88 140 92C150 96 170 98 186 100C190 104 188 108 180 110C150 112 120 110 96 110C70 112 40 114 10 120Z', (o && o.cor) || P.k, P) + ln('M140 92C150 92 166 94 186 98', P, 1.4, P.w) + circ(150, 80, 2.4, P.a) + ln('M30 92L34 86M50 88L54 82M70 86L74 80M90 84L94 78M110 84L114 78', P, 2, P.l) + f('M40 112L36 132L46 132L50 112ZM90 110L88 130L98 130L100 110Z', (o && o.cor) || P.k, P));
  F.gato = (P, t, o) => g(t, f('M70 150C60 120 62 96 74 80C70 60 72 40 80 28L92 46C98 44 106 44 112 46L124 28C132 40 134 60 130 80C142 96 144 120 134 150Z', (o && o.cor) || P.k, P) + f('M84 66C88 62 94 62 96 66C92 70 88 70 84 66ZM108 66C110 62 116 62 120 66C116 70 112 70 108 66Z', P.a, P) + f('M98 80L106 80L102 86Z', P.r, P) + ln('M86 86L70 82M86 90L70 92M118 86L134 82M118 90L134 92', P, 1, P.w) + circ(102, 120, 8, 'none', null, `stroke="${P.a}" stroke-width="3"`));
  F.leao = (P, t, o) => g(t, f('M30 100C24 70 42 44 70 36C84 22 108 20 124 30C146 34 166 52 168 76C172 98 160 120 140 130C130 146 104 152 86 144C60 140 36 124 30 100Z', (o && o.juba) || P.h, P) + f('M68 60C80 50 116 48 132 58C150 70 150 96 140 112C130 128 116 134 100 134C84 134 70 128 62 112C54 96 56 70 68 60Z', (o && o.cor) || P.k, P) + f('M84 78C88 74 94 74 96 78C92 82 88 82 84 78ZM108 78C110 74 116 74 120 78C116 82 112 82 108 78Z', P.a, P) + f('M94 96H110L102 106Z', P.ink === '#1c120b' ? P.r : P.ink, P) + ln('M102 106V114M92 118C98 122 106 122 112 118', P, P.lw));

  // (o deus de cabeça de falcão, de perfil, à moda do Egito: Hórus, Rá — o corpo, o pescoço, a cabeça e o bico, a marca do olho)
  F.falcao = (P, cor) => `<path d="M58 180C62 160 72 150 84 146L82 100C80 70 90 52 108 48C124 44 136 52 142 66L160 80C164 86 160 90 154 88L138 84C132 92 128 104 128 116L126 140C138 148 152 152 162 160C168 166 170 172 172 180Z" fill="${cor}" ${P.o}/><path d="M152 82L172 96C162 98 152 94 146 88Z" fill="${P.a}" ${P.o}/>` + circ(128, 68, 4.4, P.w, P) + circ(129, 68, 2.2, P.ink) + ln('M124 74C120 84 128 90 122 98M134 72L140 80', P, 2);
  // (a cabeça de serpente na ponta de um pescoço: Tifão, a Hidra — a cabeça, o olho, a língua bífida)
  F.cabSerp = (P, x, y, a, k, col) => { k = k || 1; const d = (a * 180 / Math.PI).toFixed(0); return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${d}) scale(${k})"><path d="M-4 -6C4 -8 14 -5 16 0C14 5 4 8 -4 6Z" fill="${col || P.k}" ${P.o}/><circle cx="6" cy="-2.4" r="1.6" fill="${P.r}"/><path d="M16 0L23 0M23 0L26 -2.4M23 0L26 2.4" stroke="${P.r}" stroke-width="1.2" fill="none"/></g>`; };
  // ------------------------------ o fundo da janela ------------------------------
  // a cena de cada tabuleta: o céu dos deuses, o mar, o fogo, a noite, a terra, o mundo dos mortos, a aurora — no jeito de cada povo
  function fundo(povo, cena, uid) {
    const P = stOf(povo); const b = P.bg; let s = `<rect x="-2" y="-2" width="204" height="184" fill="url(#ctBg-${povo})"/>`;
    const tint = { mar: '#2b6c86', fogo: '#b5401f', noite: '#0e1030', terra: '#5d6b2f', mortos: '#1a1414', aurora: '#d98a6a', ceu: null, ouro: '#d4a33a' }[cena];
    if (povo === 'grego') { // (a terracota lisa do vaso, com a linha do chão e o friso de baixo)
      if (cena === 'mortos' || cena === 'noite') s += '<rect x="-2" y="-2" width="204" height="184" fill="#1c120b" opacity=".35"/>';
      s += '<rect x="-2" y="160" width="204" height="2.4" fill="#1c120b"/><rect x="-2" y="166" width="204" height="16" fill="#1c120b"/>';
      let m = ''; for (let x = 0; x < 200; x += 14) m += `M${x} 178V170H${x + 10}V176H${x + 5}V173`; s += ln(m, P, 1.6, '#d9864c');
    } else if (povo === 'egipcio') { // (o céu de lápis com as estrelas de ouro, ou a parede caiada com o Nilo embaixo)
      if (cena === 'ceu' || cena === 'noite' || cena === 'mortos') { s += `<rect x="-2" y="-2" width="204" height="184" fill="${cena === 'mortos' ? '#14183a' : '#1c3576'}"/>`; for (let i = 0; i < 26; i++) s += F.estrela(P, (i * 37 % 196) + 2, (i * 53 % 150) + 4, 3.2, '#e0b53e'); }
      if (cena === 'mar' || cena === 'terra') s += `<rect x="-2" y="150" width="204" height="34" fill="#2a7a8a"/>${ln('M-4 158Q6 152 16 158T36 158T56 158T76 158T96 158T116 158T136 158T156 158T176 158T196 158T216 158M-4 168Q6 162 16 168T36 168T56 168T76 168T96 168T116 168T136 168T156 168T176 168T196 168T216 168', P, 1.6, '#a7e0dc')}`;
      if (cena === 'fogo' || cena === 'ouro') s += '<rect x="-2" y="-2" width="204" height="184" fill="#d9a62a" opacity=".35"/>';
      s += '<rect x="-2" y="174" width="204" height="8" fill="#22180e"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<rect x="${i * 17}" y="175.5" width="14" height="5" fill="${['#1f3d8a', '#d9a62a', '#a63a24', '#2aa198'][i % 4]}"/>`).join('');
    } else if (povo === 'nordico') { // (a madeira pintada: a noite com a aurora, o mar de inverno, o mato escuro)
      if (cena === 'ceu' || cena === 'noite' || cena === 'aurora') s += `<path d="M-4 70C40 30 80 70 120 40C150 20 180 40 210 20V-4H-4Z" fill="#3f8f7a" opacity=".45"/><path d="M-4 92C50 56 90 96 130 64C160 44 190 60 210 46V20C180 40 150 20 120 40C80 70 40 30 -4 70Z" fill="#7ac3a0" opacity=".25"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => circ((i * 47 % 196) + 2, (i * 29 % 70) + 4, 1.1, '#f2e6c0')).join('');
      if (cena === 'mar') s += `<rect x="-2" y="120" width="204" height="64" fill="#1d3a4c"/>${F.ondas(P, 128, 4, '#8fb8c4', 2.2)}`;
      if (cena === 'terra' || cena === 'mortos') s += '<path d="M-4 184V140L14 120L26 136L40 104L56 132L70 110L84 140L100 100L118 136L134 114L148 138L164 106L180 134L196 116L206 130V184Z" fill="#0f161a" opacity=".9"/>';
      if (cena === 'fogo') s += '<rect x="-2" y="-2" width="204" height="184" fill="#a8352a" opacity=".35"/>' + F.chamas(P, 30, 184, 60, { c1: '#a8352a', c2: '#dba64a' }) + F.chamas(P, 170, 184, 70, { c1: '#a8352a', c2: '#dba64a' });
      s += '<path d="M-4 176H206V184H-4Z" fill="#2a170b"/>';
    } else if (povo === 'asteca') { // (o amate, com o sol vermelho, a água de espirais, a noite do Mictlan)
      if (cena === 'ceu' || cena === 'ouro') s += F.sol(P, 100, 64, 40, { n: 20, raio: 2.6, c1: '#e9b53b', c2: '#c2352a', cor: 'none' }).replace(/stroke="#140b06" stroke-width="2.6"/g, 'stroke="none"') + `<circle cx="100" cy="64" r="58" fill="#ead6a6" opacity=".55"/>`;
      if (cena === 'mar') s += `<rect x="-2" y="110" width="204" height="74" fill="#2c68b0"/>` + [20, 60, 100, 140, 180].map(x => ln(`M${x - 14} 150C${x - 14} 134 ${x + 10} 134 ${x + 10} 146C${x + 10} 154 ${x - 2} 154 ${x - 2} 147`, P, 2.2, '#f5ead2')).join('') + ln('M-4 112Q12 102 28 112T60 112T92 112T124 112T156 112T188 112T220 112', P, 3, '#1aa196');
      if (cena === 'mortos' || cena === 'noite') s += '<rect x="-2" y="-2" width="204" height="184" fill="#1b120b" opacity=".82"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => circ((i * 41 % 190) + 6, (i * 67 % 120) + 8, 3, '#f5ead2', null, 'opacity=".8"')).join('');
      if (cena === 'fogo') s += '<rect x="-2" y="-2" width="204" height="184" fill="#c2352a" opacity=".3"/>';
      if (cena === 'terra') s += '<rect x="-2" y="140" width="204" height="44" fill="#4f9a3a" opacity=".55"/>';
      s += '<rect x="-2" y="174" width="204" height="8" fill="#140b06"/>';
    } else if (povo === 'romano') { // (o vermelho de Pompeia, a linha de ouro, a faixa negra de baixo; o mar de Netuno, a noite de Plutão)
      if (cena === 'mar') s += '<rect x="-2" y="-2" width="204" height="184" fill="#1f5a66"/>';
      if (cena === 'mortos' || cena === 'noite') s += '<rect x="-2" y="-2" width="204" height="184" fill="#16100e"/>';
      if (cena === 'terra') s += '<rect x="-2" y="-2" width="204" height="184" fill="#5d6b2f" opacity=".5"/>';
      if (cena === 'fogo') s += '<rect x="-2" y="-2" width="204" height="184" fill="#d06a1e" opacity=".3"/>';
      s += '<rect x="8" y="8" width="184" height="152" fill="none" stroke="#e7c36a" stroke-width="1.4" opacity=".75"/><rect x="-2" y="164" width="204" height="20" fill="#120c0a"/>' + ln('M10 172H190', P, 1, '#e7c36a');
    } else { // (o clássico: a noite de antes do mundo, as estrelas, a nebulosa)
      s += `<circle cx="140" cy="50" r="90" fill="${tint || '#5a3a8a'}" opacity=".28"/><circle cx="40" cy="150" r="70" fill="#2a6a8a" opacity=".22"/>`;
      for (let i = 0; i < 40; i++) s += circ((i * 37 % 198) + 1, (i * 61 % 176) + 2, (i % 5 === 0 ? 1.6 : 0.8), '#fff3d2', null, `opacity="${0.4 + (i % 3) * 0.25}"`);
    }
    if (tint && povo !== 'egipcio' && povo !== 'romano' && povo !== 'classico' && povo !== 'asteca' && povo !== 'nordico') s += `<rect x="-2" y="-2" width="204" height="184" fill="${tint}" opacity=".16"/>`;
    return s;
  }

  // ------------------------------ as figuras de cada tabuleta (regra 393) ------------------------------
  // a chave → [a cena do fundo, o desenho (P → SVG)]. Toda tabuleta das C.DECKS tem a sua linha aqui; a figura é a do mito: os
  // atributos que o povo pintava em cada uma (o martelo e o raio de Thor, os corvos e a lança de Odin, o tridente de Poseidon…)
  const ART = A.ART = {};
  const def = (id, cena, fn) => { ART[id] = [cena, fn]; };
  const b = F.busto;
  // ---- o norte ----
  def('nordico.odin', 'ceu', P => F.lanca(P, 'translate(176 18) rotate(8)', { len: 160 }) + F.ave(P, 'translate(-26 -14) scale(.5)', { cor: '#1a1a1e', olho: P.a }) + b(P, { barba: 'cheia', cabelo: 'longo' }) + f('M76 66C86 46 112 38 134 46L136 56C120 50 100 52 86 62Z', '#3a3d42', P) + f('M84 52C100 36 128 36 142 50L138 56C124 46 104 46 90 58Z', '#5a5d62', P) + f('M117 60C121 56 132 56 137 61L136 70C130 72 122 72 117 68Z', P.ink, P) + F.ave(P, 'translate(122 102) scale(.42)', { cor: '#1a1a1e', olho: P.a }));
  def('nordico.thor', 'ceu', P => F.raio(P, 'translate(150 8) scale(1.2)', { cor: '#dba64a' }) + F.raio(P, 'translate(12 16) scale(.8) rotate(-12)', { cor: '#dba64a' }) + b(P, { barba: 'cheia', cabelo: 'longo', pele: '#ead5a6' }) + f('M78 54C88 38 112 32 132 40L134 48C118 42 98 44 84 58Z', '#8a8d92', P) + g('translate(146 96) rotate(-24)', F.martelo(P, '')));
  def('nordico.loki', 'fogo', P => F.chamas(P, 100, 176, 110, { c1: '#a8352a', c2: '#dba64a' }) + b(P, { barba: 'ponta', cabelo: 'curto' }) + f('M86 50C78 36 82 22 92 14C92 26 98 32 106 36C104 24 112 14 124 10C120 22 126 32 136 40C126 38 104 40 86 50Z', '#a8352a', P) + F.serpente(P, 'translate(150 80) scale(.32) rotate(20)', { cor: '#6f9e8f' }) + F.serpente(P, 'translate(10 70) scale(.32) rotate(-30)', { cor: '#6f9e8f' }));
  def('nordico.fenrir', 'noite', P => F.lua(P, 162, 38, 22, '#f2e6c0') + F.lobo(P, 'translate(0 10)', { cor: '#c8b08a', olho: '#dba64a' }) + F.corrente(P, 'translate(36 150) rotate(-14)', 6));
  def('nordico.jormungandr', 'mar', P => F.ouroboros(P, 100, 84, 56, { cor: '#6f9e8f' }) + circ(100, 84, 30, '#1d3a4c', null) + F.ondas(P, 74, 2, '#8fb8c4', 1.6));
  def('nordico.ragnarok', 'fogo', P => F.sol(P, 100, 70, 30, { c1: '#a8352a', c2: '#dba64a', cor: '#dba64a' }) + F.lobo(P, 'translate(10 40) scale(.75)', { cor: '#2a170b', olho: '#dba64a' }) + '<path d="M-4 184V150L30 140L60 156L100 136L140 154L170 138L206 150V184Z" fill="#2a170b"/>');
  def('nordico.heimdall', 'aurora', P => `<path d="M-10 180C10 80 190 80 210 180" fill="none" stroke="#a8352a" stroke-width="7"/><path d="M-2 180C16 92 184 92 202 180" fill="none" stroke="#dba64a" stroke-width="6"/><path d="M6 180C22 104 178 104 194 180" fill="none" stroke="#6f9e8f" stroke-width="6"/><path d="M14 180C28 116 172 116 186 180" fill="none" stroke="#4c6f8c" stroke-width="6"/>` + b(P, { barba: 'ponta', cabelo: 'longo' }) + F.chifre(P, 'translate(150 120) scale(1.3)'));
  def('nordico.freyja', 'aurora', P => f('M30 160C10 120 14 70 50 40C46 70 56 90 76 100ZM170 160C190 120 186 70 150 40C154 70 144 90 124 100Z', '#c8a06a', P) + b(P, { fem: true, cabelo: 'longo' }) + F.colar(P, { c1: '#dba64a', c2: '#a8352a', c3: '#f7ecd2' }) + F.diadema(P, { cor: '#dba64a' }));
  def('nordico.tyr', 'terra', P => F.espada(P, 'translate(160 50) rotate(10)', {}) + b(P, { barba: 'curta', cabelo: 'curto' }) + f('M78 60C86 40 112 34 134 42L136 52C120 46 98 48 84 64Z', '#8a8d92', P) + f('M104 60L106 92L114 92L114 58Z', '#8a8d92', P) + F.lobo(P, 'translate(-30 96) scale(.45)', { cor: '#2a170b' }));
  def('nordico.valquiria', 'ceu', P => F.lanca(P, 'translate(166 24) rotate(6)', { len: 150 }) + b(P, { fem: true, cabelo: 'longo' }) + F.elmoAsa(P) + F.escudo(P, 'translate(150 150)', { r: 26, cor: '#a8352a', aro: '#dba64a', cruz: '#f7ecd2' }));
  def('nordico.berserker', 'fogo', P => F.machado(P, 'translate(30 40) rotate(-20)') + F.machado(P, 'translate(170 30) scale(-1 1) rotate(-20)') + b(P, { barba: 'cheia', cabelo: 'longo' }) + f('M70 70C66 46 84 22 110 20C136 18 152 36 150 60L142 66C138 50 126 40 112 40C94 40 82 52 80 70Z', '#6b4a2a', P) + circ(92, 30, 6, '#6b4a2a', P) + circ(132, 30, 6, '#6b4a2a', P) + circ(118, 50, 2.2, '#dba64a'));
  def('nordico.sleipnir', 'ceu', P => F.cavalo(P, 'translate(-4 14)', { oito: true, cor: '#ead5a6', crina: '#c8a06a' }) + ln('M10 160H190', P, 2, '#dba64a'));
  def('nordico.corvos', 'noite', P => F.lua(P, 100, 50, 36, '#f2e6c0') + F.ave(P, 'translate(-20 18) scale(.75)', { cor: '#1a1a1e', olho: '#dba64a' }) + F.ave(P, 'translate(186 34) scale(-.75 .75)', { cor: '#1a1a1e', olho: '#dba64a' }));
  def('nordico.yggdrasil', 'aurora', P => `<circle cx="100" cy="86" r="70" fill="none" stroke="#dba64a" stroke-width="2.4"/>` + f('M94 160C96 132 92 112 84 100C70 104 50 100 40 88C56 92 72 90 82 82C70 70 64 56 66 40C76 56 86 64 96 66C94 50 98 34 106 22C110 40 108 54 106 66C118 62 130 52 136 38C138 56 128 72 116 82C128 88 146 90 162 84C150 98 130 104 114 100C108 114 106 132 108 160Z', '#ead5a6', P) + f('M60 172C76 162 90 156 96 150H106C114 156 128 162 144 172Z', '#ead5a6', P) + [0, 1, 2, 3, 4, 5, 6].map(i => circ(60 + i * 14, 40 + (i % 3) * 18 + (i > 3 ? 10 : 0), 9, '#6f8f5a', P)).join(''));
  def('nordico.jotunn', 'terra', P => f('M40 180C40 140 50 110 70 96C60 80 60 54 76 40C92 26 120 26 134 40C150 54 148 80 138 96C156 110 164 140 164 180Z', '#9fb4c0', P) + f('M76 60C84 52 92 52 96 58C90 64 82 64 76 60ZM108 58C112 52 122 52 128 60C122 64 114 64 108 58Z', '#f7ecd2', P) + f('M80 84C90 96 112 96 122 84C120 104 112 116 100 116C88 116 80 104 80 84Z', '#e8f2f6', P) + ln('M92 70L96 80M110 70L106 80M70 120L80 132M128 120L118 132', P, 1.6) + [30, 60, 150, 176].map(x => f(`M${x} 0L${x + 6} 26L${x + 12} 0Z`, '#cfe3ea', P)).join(''));
  def('nordico.einherjar', 'ceu', P => F.escudo(P, 'translate(100 110)', { r: 54, cor: '#a8352a', aro: '#dba64a', umbo: '#8a8d92', sinal: '<path d="M-40 -6L40 -6L40 6L-40 6Z" fill="#f7ecd2"/>' }) + F.espada(P, 'translate(40 30) rotate(-35)', {}) + F.espada(P, 'translate(160 30) rotate(35)', {}) + F.chifre(P, 'translate(100 40) scale(.8)'));
  def('nordico.escudeira', 'terra', P => b(P, { fem: true, cabelo: 'longo' }) + f('M82 54C92 38 116 32 134 42L136 52C120 46 100 48 88 62Z', '#8a8d92', P) + F.escudo(P, 'translate(150 130)', { r: 40, cor: '#4c6f8c', aro: '#dba64a', umbo: '#8a8d92', cruz: '#f7ecd2' }));
  def('nordico.draugr', 'mortos', P => f('M20 180C40 130 160 130 180 180Z', '#1f2a24', P) + f('M70 140C62 110 66 80 80 64C76 50 80 40 90 34C102 28 118 30 126 40C134 50 132 62 126 70C138 86 140 114 132 140Z', '#b7c4b0', P) + circ(98, 58, 6, '#7ac3a0') + circ(118, 58, 6, '#7ac3a0') + f('M104 72L112 72L108 80Z', '#2a170b', P) + ln('M96 88H122M100 88V94M106 88V94M112 88V94M118 88V94', P, 1.4) + ln('M84 100L76 120M128 100L136 120', P, 1.4));
  def('nordico.runas', 'aurora', P => [[50, 70, 'M-8 -14V14M-8 -14L8 0M-8 0L8 14'], [100, 60, 'M0 -16V16M-10 -10L10 10M10 -10L-10 10'], [150, 70, 'M-8 -14V14M8 -14V14M-8 -2L8 2'], [72, 128, 'M0 -14V14M0 -14L10 -4M0 -4L10 6'], [128, 128, 'M-8 14L0 -14L8 14']].map(([x, y, r]) => f(`M${x - 18} ${y - 22}C${x - 10} ${y - 30} ${x + 14} ${y - 28} ${x + 20} ${y - 18}C${x + 26} ${y} ${x + 18} ${y + 24} ${x} ${y + 26}C${x - 16} ${y + 26} ${x - 24} ${y + 4} ${x - 18} ${y - 22}Z`, '#b9a880', P) + g(`translate(${x} ${y})`, ln(r, P, 3, '#a8352a'))).join(''));
  def('nordico.fimbulvetr', 'noite', P => { let s = circ(100, 70, 26, '#cfe3ea', null, 'opacity=".55"'); for (let a = 0; a < 6; a++) s += g(`translate(100 92) rotate(${a * 60})`, ln('M0 0V-60M0 -36L-12 -48M0 -36L12 -48M0 -18L-9 -27M0 -18L9 -27', P, 4.2, '#f7ecd2')); return s + '<path d="M-4 184V160C30 150 60 166 100 154C140 144 170 160 206 152V184Z" fill="#e8f2f6"/>'; });
  // ---- os gregos ----
  def('grego.zeus', 'ceu', P => F.raio(P, 'translate(146 2) scale(1.45) rotate(8)', { cor: P.k }) + b(P, { barba: 'cheia', cabelo: 'crespo' }) + F.louro(P, { cor: P.r }) + F.ave(P, 'translate(-16 100) scale(.5)', {}));
  def('grego.poseidon', 'mar', P => F.tridente(P, 'translate(160 34) rotate(6)') + b(P, { barba: 'cheia', cabelo: 'crespo' }) + F.diadema(P, { cor: P.r }) + `<path d="M10 150C20 136 34 136 40 146C34 140 28 142 26 150C40 152 46 162 36 168C28 160 16 162 10 150Z" fill="${P.k}"/>` + ln('M-4 128Q10 120 24 128T52 128', P, 2, P.k));
  def('grego.hades', 'mortos', P => F.bidente(P, 'translate(162 30) rotate(6)') + b(P, { barba: 'cheia', cabelo: 'crespo' }) + f('M80 50C92 36 116 32 136 40L138 46L130 44L126 36L120 42L114 34L108 42L102 36L98 44L90 40L86 50Z', P.r, P) + g('translate(-6 92) scale(.5)', F.lobo(P, '', {})));
  def('grego.hermes', 'ceu', P => F.caduceu(P, 'translate(160 70)') + b(P, { cabelo: 'curto' }) + f('M70 56C76 40 104 30 130 36C146 40 152 48 150 54C130 48 100 50 78 62Z', P.k, P) + f('M76 52C62 40 54 26 58 14C64 26 72 32 82 40Z', P.w, P) + ln('M62 24C66 32 72 38 80 44', P, 1, P.k));
  def('grego.atena', 'ceu', P => F.lanca(P, 'translate(168 24) rotate(6)', { len: 150 }) + b(P, { fem: true, pele: P.w, cabelo: 'longo' }) + F.elmo(P, { cor: P.r }) + F.coruja(P, 'translate(110 118) scale(.36)', { cor: P.k }) + `<circle cx="38" cy="150" r="26" fill="${P.k}"/><circle cx="38" cy="150" r="11" fill="${P.w}"/><path d="M30 146C34 142 42 142 46 146M32 154C36 158 40 158 44 154" stroke="${P.k}" stroke-width="1.4" fill="none"/>`);
  def('grego.apolo', 'aurora', P => F.sol(P, 100, 60, 26, { c1: P.k, c2: P.r, cor: P.k, n: 18 }) + b(P, { cabelo: 'coque' }) + F.louro(P, { cor: P.r }) + F.lira(P, 'translate(160 130) scale(.8)'));
  def('grego.ares', 'fogo', P => F.lanca(P, 'translate(36 20) rotate(-8)', { len: 150 }) + b(P, { barba: 'ponta', cabelo: 'curto' }) + F.elmo(P, { cor: P.r }) + F.escudo(P, 'translate(158 136)', { r: 34, cor: P.k, aro: P.l, umbo: P.r }));
  def('grego.medusa', 'noite', P => { let q = ''; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const x1 = 100 + Math.cos(a) * 46, y1 = 82 + Math.sin(a) * 46, x2 = 100 + Math.cos(a + 0.25) * 70, y2 = 82 + Math.sin(a + 0.25) * 70; q += ln(`M${(100 + Math.cos(a) * 30).toFixed(1)} ${(82 + Math.sin(a) * 30).toFixed(1)}Q${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, P, 5, P.k) + circ(x2, y2, 4.6, P.k) + circ(x2 + Math.cos(a + 1.8) * 2, y2 + Math.sin(a + 1.8) * 2, 1, P.l); }
    return q + circ(100, 82, 42, P.k) + ln('M70 62C80 56 90 58 94 64M106 64C110 58 120 56 130 62M66 100C76 108 84 112 88 112M134 100C124 108 116 112 112 112', P, 1.6) + circ(84, 74, 10, P.w) + circ(116, 74, 10, P.w) + circ(84, 74, 4, P.k) + circ(116, 74, 4, P.k) + `<path d="M74 98C86 108 114 108 126 98L122 112C110 120 90 120 78 112Z" fill="${P.w}"/><path d="M92 104C94 116 98 128 100 134C102 128 106 116 108 104Z" fill="${P.r}"/><path d="M80 102L84 116L88 104ZM120 102L116 116L112 104Z" fill="${P.w}"/>` + ln('M98 80L100 92L102 80', P, 1.6) + `<path d="M30 180C40 150 70 136 100 136C130 136 160 150 170 180Z" fill="${P.k}"/>`; });
  def('grego.heracles', 'terra', P => b(P, { barba: 'cheia', cabelo: 'crespo' }) + F.leao(P, 'translate(52 -8) scale(.62)', { cor: P.k, juba: P.k }) + f('M150 40C158 36 166 40 168 50L162 150C160 158 150 158 148 150Z', P.k, P) + ln('M154 60L162 64M152 80L162 84M152 100L161 104M151 120L160 124', P, 1.4, P.l));
  def('grego.perseu', 'ceu', P => F.espada(P, 'translate(36 40) rotate(-20)', { cor: P.w }) + b(P, { cabelo: 'curto' }) + f('M74 54C80 38 104 30 128 34C144 38 150 46 148 52C128 46 100 48 80 60Z', P.k, P) + f('M80 50C66 38 58 24 62 12C68 24 76 30 86 38Z', P.w, P) + `<g transform="translate(150 122)"><path d="M-22 -6C-22 -24 22 -24 22 -6C22 14 12 24 0 24C-12 24 -22 14 -22 -6Z" fill="${P.w}"/>${[0, 1, 2, 3, 4].map(i => ln(`M${-18 + i * 9} -18C${-22 + i * 9} -30 ${-14 + i * 9} -34 ${-16 + i * 9} -44`, P, 3, P.k)).join('')}<circle cx="-8" cy="-4" r="3" fill="${P.k}"/><circle cx="8" cy="-4" r="3" fill="${P.k}"/></g>`);
  def('grego.aquiles', 'fogo', P => F.lanca(P, 'translate(170 20) rotate(8)', { len: 150 }) + b(P, { cabelo: 'curto' }) + F.elmo(P, { cor: P.k }) + `<path d="M24 180C30 166 40 160 50 160C60 160 66 168 64 180Z" fill="${P.r}"/><path d="M42 166L46 172" stroke="${P.w}" stroke-width="2"/>`);
  def('grego.minotauro', 'mortos', P => { let s = ''; for (let i = 0; i < 4; i++) s += `<rect x="${20 + i * 18}" y="${20 + i * 18}" width="${160 - i * 36}" height="${140 - i * 36}" fill="none" stroke="${P.k}" stroke-width="4" opacity=".5"/>`; return s + F.touro(P, 'translate(0 10)', { cor: P.k }); });
  def('grego.odisseu', 'mar', P => `<path d="M10 132C40 146 160 146 190 132L198 116L180 128C140 136 60 136 22 128L4 114Z" fill="${P.k}"/><circle cx="30" cy="128" r="3" fill="${P.l}"/><path d="M100 134V36M58 50H142" stroke="${P.k}" stroke-width="4"/><path d="M62 52H138L134 104H66Z" fill="${P.w}"/><path d="M80 52V104M100 52V104M120 52V104" stroke="${P.k}" stroke-width="1.4"/><circle cx="100" cy="108" r="6" fill="${P.k}"/><path d="M94 114H106L104 132H96Z" fill="${P.k}"/><path d="M92 112L108 124M108 112L92 124" stroke="${P.r}" stroke-width="1.6"/>` + [30, 50, 70, 130, 150, 170].map(x => `<path d="M${x} 140L${x - 8} 158" stroke="${P.k}" stroke-width="2"/>`).join('') + F.ave(P, 'translate(146 8) scale(.26)', { cor: P.k }) + F.ave(P, 'translate(18 14) scale(.24)', { cor: P.k }) + ln('M-4 162Q12 154 28 162T60 162T92 162T124 162T156 162T188 162T220 162', P, 2, P.k));
  def('grego.cerbero', 'mortos', P => [[-30, -4, 0.62], [40, -24, 0.66], [100, 4, 0.62]].map(([x, y, k]) => g(`translate(${x} ${y}) scale(${k})`, F.lobo(P, '', { cor: P.k, olho: P.r }))).join('') + F.corrente(P, 'translate(30 160)', 9));
  def('grego.hoplita', 'terra', P => F.lanca(P, 'translate(170 10) rotate(10)', { len: 160 }) + F.escudo(P, 'translate(90 100)', { r: 66, cor: P.k, aro: P.l, umbo: P.k, sinal: `<path d="M-20 -30C-10 -40 10 -40 20 -30C10 -24 10 -10 20 0C10 10 -10 10 -20 0C-10 -10 -10 -24 -20 -30Z" fill="${P.r}"/>` }) + g('translate(40 -44) scale(.65)', F.elmo(P, { cor: P.r })));
  def('grego.ciclope', 'terra', P => `<path d="M40 180C40 130 54 100 76 86C66 66 70 40 90 30C110 20 136 30 142 52C148 70 140 84 132 92C152 106 162 136 162 180Z" fill="${P.k}"/>` + F.olho(P, 108, 56, 18, { branco: P.w, iris: P.r }) + `<path d="M150 70L196 40L190 54L158 82Z" fill="${P.k}"/>`);
  def('grego.hidra', 'mar', P => { let s = ''; for (let i = 0; i < 5; i++) { const x = 30 + i * 35; s += ln(`M100 170C${x} 140 ${x - 10} 100 ${x + 6} ${70 - Math.abs(2 - i) * 10}`, P, 9, P.k) + circ(x + 8, 64 - Math.abs(2 - i) * 10, 9, P.k) + f(`M${x + 14} ${62 - Math.abs(2 - i) * 10}L${x + 26} ${60 - Math.abs(2 - i) * 10}L${x + 14} ${68 - Math.abs(2 - i) * 10}Z`, P.r, P); } return s + `<ellipse cx="100" cy="170" rx="60" ry="16" fill="${P.k}"/>`; });
  def('grego.pegaso', 'ceu', P => F.cavalo(P, 'translate(-6 20)', { asas: true, cor: P.k, crina: P.k, asa: P.k }) + F.estrela(P, 30, 30, 8, P.w) + F.estrela(P, 60, 16, 5, P.w));
  def('grego.delfos', 'aurora', P => `<path d="M60 170L80 110H120L140 170H130L114 120H86L70 170Z" fill="${P.k}"/><path d="M66 106H134C134 96 120 90 100 90C80 90 66 96 66 106Z" fill="${P.k}"/>` + F.chamas(P, 100, 90, 54, { c1: P.r, c2: P.w }) + ln('M70 60C80 44 72 30 84 20M120 60C126 44 118 30 130 18', P, 2.2, P.k));
  def('grego.pandora', 'noite', P => `<path d="M60 170C54 140 58 106 74 92H126C142 106 146 140 140 170Z" fill="${P.k}"/><path d="M72 92C72 84 80 80 100 80C120 80 128 84 128 92Z" fill="${P.k}"/><path d="M66 120H134M64 140H136" stroke="${P.l}" stroke-width="1.6"/>${[[70, 50], [96, 30], [126, 46], [150, 22], [46, 24]].map(([x, y]) => ln(`M100 80Q${(x + 100) / 2} ${y + 30} ${x} ${y}`, P, 2, P.r)).join('')}` + F.estrela(P, 100, 62, 9, P.w));
  // ---- o Egito ----
  def('egipcio.ra', 'ouro', P => F.sol(P, 100, 26, 22, { n: 18, raio: 1.5, c1: P.a, c2: P.r, cor: P.r }) + f('M84 22C80 30 82 40 88 44L92 40C88 36 88 28 92 24Z', P.a, P) + F.falcao(P, '#c98a2a') + f('M84 56C96 46 116 44 128 52L118 62C108 56 98 58 92 66L90 120C84 124 76 122 70 116L74 80C74 68 78 60 84 56Z', P.b, P) + [0, 1, 2, 3, 4].map(i => ln(`M${74 + i} ${86 + i * 7}L90 ${86 + i * 7}`, P, 2.4, P.a)).join('') + F.colar(P) + F.ankh(P, 'translate(172 116)'));
  def('egipcio.horus', 'ceu', P => F.coroaDupla(P) + F.falcao(P, '#3a5a8a') + F.colar(P) + F.ankh(P, 'translate(36 120)'));
  def('egipcio.osiris', 'terra', P => `<path d="M62 180C66 160 78 150 92 146L90 120C82 112 80 98 82 86C80 70 84 56 94 48L92 18C92 8 104 6 108 16L112 40C120 44 126 54 126 66L130 74L134 82C134 86 130 88 126 88L124 94C124 104 120 114 112 120L112 146C124 150 136 158 140 180Z" fill="#3f7a4a" ${P.o}/><path d="M86 44C84 32 86 22 92 18L94 46ZM112 42C116 30 120 22 126 20L120 48Z" fill="${P.a}" ${P.o}/>` + circ(114, 70, 3.6, P.w, P) + circ(115, 70, 1.8, P.ink) + `<path d="M118 100L122 100L124 128L118 130Z" fill="${P.a}" ${P.o}/>` + F.colar(P) + F.cajado(P, 'translate(150 74) rotate(-12)') + F.mangual(P, 'translate(40 80) rotate(20)'));
  def('egipcio.seth', 'fogo', P => `<path d="M60 180C64 160 74 150 86 146L84 106C80 82 88 64 104 58L102 30L108 30L112 56L118 56L124 28L130 28L126 60C134 64 140 74 144 84L176 100C178 104 174 108 170 106L140 100C136 110 130 118 124 122L122 144C134 150 148 156 154 180Z" fill="#a63a24" ${P.o}/>` + circ(124, 78, 3.4, P.w, P) + circ(125, 78, 1.6, P.ink) + F.colar(P) + `<path d="M20 120C30 110 40 112 44 120C40 130 30 132 20 120Z" fill="${P.a}" ${P.o}/>` + ln('M10 40C40 30 60 50 90 36M120 26C140 14 170 24 190 12', P, 2.4, P.a));
  def('egipcio.isis', 'ceu', P => f('M40 120C10 100 0 70 4 40C24 56 40 60 60 62C44 70 40 80 44 92ZM160 120C190 100 200 70 196 40C176 56 160 60 140 62C156 70 160 80 156 92Z', P.t, P) + ln('M10 52C24 64 40 70 56 70M8 70C24 82 38 86 50 88M190 52C176 64 160 70 144 70M192 70C176 82 162 86 150 88', P, 1.4, P.a) + b(P, { fem: true, olho: 'egipcio', pele: P.skf }) + F.nemes(P, { c1: P.b, c2: P.a }) + `<path d="M104 40H122V34H108V24H122V18H104Z" fill="${P.a}" ${P.o}/>` + F.colar(P));
  def('egipcio.anubis', 'mortos', P => F.balanca(P, 'translate(100 140) scale(.6)') + `<path d="M58 180C62 160 72 150 84 146L84 104C80 80 88 66 102 60L98 20L112 50L118 50L122 18L126 60C132 64 138 72 142 80L172 92C176 96 174 100 168 100L140 98C134 108 128 116 122 120L122 142C134 148 148 154 154 180Z" fill="#1a1a20" ${P.o}/><path d="M104 28L108 46L114 46Z" fill="${P.a}"/>` + circ(124, 76, 3.4, P.a, P) + circ(124.6, 76, 1.5, P.ink) + ln('M140 98L172 94', P, 1.2, P.a) + F.colar(P));
  def('egipcio.thoth', 'noite', P => F.lua(P, 140, 30, 18, P.a) + `<path d="M60 180C64 160 74 150 86 146L84 106C80 82 90 66 106 62C120 58 132 64 138 76C146 92 162 110 176 136C166 132 152 116 140 102L130 96C128 106 124 114 120 118L120 142C132 148 146 154 152 180Z" fill="#e8e4da" ${P.o}/>` + circ(118, 76, 3.4, P.ink) + F.nemes(P, { c1: P.b, c2: P.a }).replace(/M82 46C96 34 122 32 138 44L140 62L122 60C108 60 100 68 100 80L98 128C88 132 74 128 66 118L72 82C72 64 74 54 82 46Z/, 'M84 76C86 64 92 58 100 58L104 84L100 128C88 132 74 128 66 118L72 92C74 84 78 78 84 76Z') + F.colar(P) + `<path d="M20 100H44V150H20Z" fill="${P.w}" ${P.o}/><path d="M24 110H40M24 118H40M24 126H36M24 134H40" stroke="${P.ink}" stroke-width="1.4"/>`);
  def('egipcio.ammit', 'mortos', P => F.balanca(P, 'translate(100 100) scale(1.15)') + `<path d="M44 92C38 84 40 74 48 70C56 66 62 72 62 78C68 74 76 76 76 84C76 94 60 104 44 92Z" fill="${P.r}" ${P.o} transform="translate(-12 -4) scale(.8)"/>` + F.crocodilo(P, 'translate(96 76) scale(.55)', { cor: '#3f7a4a' }) + F.leao(P, 'translate(-14 96) scale(.45)', { cor: '#d9a62a', juba: '#a4492a' }));
  def('egipcio.sekhmet', 'fogo', P => F.disco(P, 100, 26, 22, { cor: P.r }) + F.leao(P, 'translate(10 6) scale(.9)', { cor: P.a, juba: '#a4492a' }) + `<path d="M40 180C46 160 60 152 76 150L124 150C140 152 154 160 160 180Z" fill="${P.b}" ${P.o}/>` + F.colar(P));
  def('egipcio.bastet', 'ouro', P => F.gato(P, 'translate(0 14)', { cor: '#2a2a2e' }) + F.ankh(P, 'translate(170 96)') + F.ankh(P, 'translate(30 96)'));
  def('egipcio.esfinge', 'terra', P => `<path d="M20 150L72 64L124 150Z" fill="#e2c27a" ${P.o}/><path d="M72 64L124 150H98Z" fill="#c9a45a" ${P.o}/><path d="M104 150L146 84L188 150Z" fill="#e2c27a" ${P.o}/>` + `<path d="M10 168V150C10 136 22 128 40 128L112 128C122 118 124 102 120 92C118 76 128 64 142 62C158 60 170 70 172 86L174 112C176 124 178 136 178 150L196 152V168Z" fill="#d9a85a" ${P.o}/><path d="M132 62C140 54 162 54 172 64L176 92L164 86C160 78 150 76 144 82L140 100L130 96Z" fill="${P.b}" ${P.o}/>` + [0, 1, 2].map(i => ln(`M${134 + i * 2} ${70 + i * 9}L${142 + i * 2} ${70 + i * 9}`, P, 2, P.a)).join('') + circ(158, 90, 2.4, P.ink) + ln('M154 100L162 100M24 150C40 146 60 146 80 150M120 150C140 146 160 146 178 150', P, 1.6));
  def('egipcio.bennu', 'aurora', P => F.sol(P, 100, 70, 34, { c1: P.r, c2: P.a, cor: P.a }) + F.chamas(P, 100, 178, 70, { c1: P.r, c2: P.a }) + F.ave(P, 'translate(10 20) scale(.9)', { cor: '#5aa0b0', bico: 'curvo' }));
  def('egipcio.nilo', 'mar', P => [40, 70, 130, 160].map((x, i) => `<path d="M${x} 150C${x - 2} 120 ${x - 4} 96 ${x} 74" stroke="${P.g}" stroke-width="3" fill="none"/><path d="M${x} 76C${x - 16} 66 ${x - 18} 50 ${x - 10} 44C${x - 4} 54 ${x + 4} 54 ${x + 10} 44C${x + 18} 50 ${x + 16} 66 ${x} 76Z" fill="${i % 2 ? P.g : P.t}" ${P.o}/>`).join('') + `<path d="M100 150V60" stroke="${P.g}" stroke-width="3"/><path d="M100 62C88 52 86 36 100 26C114 36 112 52 100 62Z" fill="#e8a0b0" ${P.o}/>` + `<rect x="-2" y="118" width="204" height="70" fill="#2a6aa0" opacity=".9"/>` + F.ondas(P, 128, 4, '#a7e0dc', 2.4) + F.ankh(P, 'translate(100 104) scale(.7)'));
  def('egipcio.sobek', 'mar', P => F.disco(P, 100, 24, 18, { cor: P.r }) + `<path d="M56 180C60 160 70 150 84 146L82 106C80 86 88 74 100 70L176 74C182 76 182 82 176 84L132 92L176 96C180 98 180 102 174 104L128 104C124 112 120 118 116 122L116 142C128 148 142 154 148 180Z" fill="#3f7a4a" ${P.o}/>` + circ(110, 78, 3, P.a, P) + ln('M140 88L144 84M152 88L156 84M164 88L168 84', P, 1.6, P.w) + F.nemes(P, { c1: P.a, c2: P.b }).replace(/M82 46C96 34 122 32 138 44L140 62L122 60C108 60 100 68 100 80L98 128C88 132 74 128 66 118L72 82C72 64 74 54 82 46Z/, 'M80 84C82 76 88 72 96 72L100 88L98 128C88 132 74 128 66 118L72 96C74 90 76 86 80 84Z') + F.colar(P));
  def('egipcio.escriba', 'terra', P => b(P, { olho: 'egipcio' }) + F.nemes(P, { c1: P.w, c2: P.w }) + `<path d="M120 150H180V176H120Z" fill="${P.w}" ${P.o}/><path d="M126 158H174M126 166H168" stroke="${P.ink}" stroke-width="1.4"/><path d="M150 120L176 150" stroke="${P.r}" stroke-width="3"/>`);
  def('egipcio.medjay', 'terra', P => F.arco(P, 'translate(160 90)') + b(P, { olho: 'egipcio' }) + f('M80 54C92 40 118 36 136 46L138 56C122 50 100 52 86 62Z', '#1d1a16', P) + F.pena(P, 'translate(84 30) scale(.5) rotate(-20)', { cor: P.w }));
  def('egipcio.carro', 'terra', P => `<circle cx="80" cy="140" r="28" fill="none" stroke="${P.a}" stroke-width="6"/><path d="M80 112V168M52 140H108M60 120L100 160M100 120L60 160" stroke="${P.a}" stroke-width="3"/><path d="M70 110H120L130 130H66Z" fill="${P.r}" ${P.o}/>` + F.cavalo(P, 'translate(40 -10) scale(.8)', { cor: '#f4ecd6', crina: P.b }) + F.arco(P, 'translate(90 70) scale(.6)'));
  def('egipcio.uraeus', 'ouro', P => F.disco(P, 100, 24, 16, { cor: P.r, cobra: false }) + `<ellipse cx="100" cy="162" rx="54" ry="12" fill="${P.g}" ${P.o}/><ellipse cx="100" cy="150" rx="40" ry="10" fill="${P.g}" ${P.o}/><path d="M100 44C130 44 150 72 146 104C142 124 124 136 100 140C76 136 58 124 54 104C50 72 70 44 100 44Z" fill="${P.g}" ${P.o}/><path d="M100 58C118 58 130 78 128 102C126 116 114 126 100 128C86 126 74 116 72 102C70 78 82 58 100 58Z" fill="${P.a}" ${P.o}/><ellipse cx="100" cy="48" rx="14" ry="11" fill="${P.g}" ${P.o}/>` + circ(94, 46, 2.2, P.r) + circ(106, 46, 2.2, P.r) + ln('M100 70V120M88 76C92 90 92 104 88 116M112 76C108 90 108 104 112 116M80 88H120M80 104H120', P, 1.6, P.b));
  def('egipcio.khepri', 'aurora', P => F.disco(P, 100, 36, 24, { cor: P.r, cobra: false }) + F.escaravelho(P, 'translate(100 104)'));
  def('egipcio.apofis', 'noite', P => F.serpente(P, 'translate(0 10)', { cor: '#5a3a8a', ventre: P.a, w: 22 }) + `<path d="M150 150L176 120L180 128L158 156Z" fill="${P.a}" ${P.o}/>` + F.disco(P, 40, 40, 14, { cor: P.r, cobra: false }));
  // ---- os astecas ----
  const xochi = (P, x, y, r) => [0, 1, 2, 3].map(i => circ(x + Math.cos(i * Math.PI / 2) * r * 0.6, y + Math.sin(i * Math.PI / 2) * r * 0.6, r * 0.5, P.r, P)).join('') + circ(x, y, r * 0.4, P.a, P);
  def('asteca.quetzalcoatl', 'ceu', P => { let s = ''; const body = 'M10 160C40 176 80 170 92 146C104 120 80 100 96 80C112 60 146 68 158 52';
    s += ln(body, P, 26, P.ink) + ln(body, P, 21, P.g) + ln(body, P, 6, P.a); for (let i = 0; i < 14; i++) { const x = 16 + i * 10, y = i < 5 ? 166 - i * 2 : i < 9 ? 150 - (i - 5) * 18 : 84 - (i - 9) * 6; s += f(`M${x} ${y}l-6 -18l10 6z`, i % 2 ? P.t : P.r, P); }
    s += f('M148 56C150 38 166 30 180 36C192 42 194 56 186 64L166 70C158 70 150 66 148 56Z', P.g, P) + circ(172, 46, 4, P.w, P) + circ(173, 46, 2, P.ink) + f('M186 60L198 66L184 70Z', P.r, P);
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.38; s += f(`M164 44L${(164 + Math.cos(a) * 44).toFixed(1)} ${(44 + Math.sin(a) * 44).toFixed(1)}L${(164 + Math.cos(a + 0.2) * 38).toFixed(1)} ${(44 + Math.sin(a + 0.2) * 38).toFixed(1)}Z`, i % 2 ? P.t : P.g, P); }
    return s; });
  def('asteca.huitzilopochtli', 'ceu', P => F.cocar(P, { n: 9 }) + b(P, { cabelo: 'curto' }) + f('M108 60H146V74H108Z', P.b, P) + f('M108 82H146V92H108Z', P.a, P) + f('M138 44C150 36 166 36 178 42C170 46 158 48 146 50Z', P.t, P) + F.serpente(P, 'translate(130 100) scale(.36) rotate(-30)', { cor: P.t, ventre: P.a }) + `<path d="M30 140L60 170" stroke="${P.ink}" stroke-width="8"/><path d="M30 140L60 170" stroke="${P.t}" stroke-width="5"/>`);
  def('asteca.tlaloc', 'mar', P => { let s = `<path d="M40 170V60C40 30 60 18 100 18C140 18 160 30 160 60V170Z" fill="${P.b}" ${P.o}/>`;
    s += `<circle cx="74" cy="66" r="20" fill="${P.w}" ${P.o}/><circle cx="126" cy="66" r="20" fill="${P.w}" ${P.o}/><circle cx="74" cy="66" r="10" fill="${P.ink}"/><circle cx="126" cy="66" r="10" fill="${P.ink}"/><path d="M94 66C94 58 106 58 106 66" fill="none" stroke="${P.ink}" stroke-width="3"/>`;
    s += f('M60 106C70 96 84 100 100 100C116 100 130 96 140 106C132 116 120 118 100 118C80 118 68 116 60 106Z', P.r, P) + [72, 84, 116, 128].map(x => f(`M${x} 112L${x + 4} 132L${x + 8} 112Z`, P.w, P)).join('');
    s += [56, 100, 144].map(x => ln(`M${x} 140C${x - 8} 150 ${x + 8} 156 ${x} 166`, P, 3, P.w)).join('') + f('M60 18C70 4 90 0 100 8C110 0 130 4 140 18Z', P.t, P);
    return s; });
  def('asteca.tezcatlipoca', 'noite', P => { let s = b(P, { cabelo: 'curto', pele: '#e9b53b' }); s += ln('M100 62H146M100 76H146M100 90H146', P, 7, P.ink);
    s += `<circle cx="160" cy="140" r="24" fill="${P.ink}" ${P.o}/><circle cx="160" cy="140" r="17" fill="#3a3a44"/><path d="M150 130C156 126 166 128 168 134" stroke="#9aa" stroke-width="2" fill="none"/>`;
    s += [0, 1, 2].map(i => ln(`M${150 + i * 10} 112C${144 + i * 10} 100 ${156 + i * 10} 92 ${150 + i * 10} 80`, P, 3.2, '#9a9aa4')).join('') + f('M70 168C64 150 66 136 76 128L84 150Z', P.a, P);
    return s; });
  def('asteca.coatlicue', 'terra', P => { let s = `<path d="M50 180L60 90H140L150 180Z" fill="${P.g}" ${P.o}/>`; for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) s += ln(`M${62 + i * 22 + (r % 2) * 11} ${100 + r * 20}C${70 + i * 22 + (r % 2) * 11} ${94 + r * 20} ${78 + i * 22 + (r % 2) * 11} ${106 + r * 20} ${84 + i * 22 + (r % 2) * 11} ${100 + r * 20}`, P, 4, P.t);
    s += [80, 120].map(x => f(`M${x - 18} 90C${x - 22} 60 ${x - 12} 40 ${x} 36C${x + 12} 40 ${x + 18} 60 ${x + 14} 90Z`, P.g, P) + circ(x + 4, 52, 3.4, P.a, P) + f(`M${x + 10} 64L${x + 18} 66L${x + 10} 70Z`, P.r, P)).join('');
    return s + `<path d="M56 96C70 104 130 104 144 96" stroke="${P.r}" stroke-width="5" fill="none"/>` + xochi(P, 100, 120, 10); });
  def('asteca.tonatiuh', 'ouro', P => { let s = F.sol(P, 100, 86, 46, { n: 16, raio: 1.75, c1: P.r, c2: P.a, cor: P.a });
    s += circ(100, 86, 36, P.r, P) + circ(100, 86, 28, P.a, P) + `<circle cx="88" cy="80" r="5" fill="${P.w}" ${P.o}/><circle cx="112" cy="80" r="5" fill="${P.w}" ${P.o}/><path d="M88 98C96 106 104 106 112 98" fill="${P.r}" ${P.o}/><path d="M96 100L100 116L104 100Z" fill="${P.w}" ${P.o}/>`;
    return s + [[100, 20], [160, 86], [100, 152], [40, 86]].map(([x, y]) => f(`M${x - 8} ${y - 8}H${x + 8}V${y + 8}H${x - 8}Z`, P.t, P)).join(''); });
  def('asteca.mictlantecuhtli', 'mortos', P => { let s = F.cocar(P, { n: 7 }).replace(/#1aa196/g, '#f5ead2'); s += `<path d="M70 120C60 92 66 56 92 44C118 32 146 46 148 76C150 96 142 112 130 120L126 136H80Z" fill="${P.w}" ${P.o}/>`;
    s += `<circle cx="96" cy="78" r="11" fill="${P.ink}"/><circle cx="128" cy="78" r="11" fill="${P.ink}"/><circle cx="96" cy="78" r="3" fill="${P.r}"/><circle cx="128" cy="78" r="3" fill="${P.r}"/><path d="M108 92L114 102H104Z" fill="${P.ink}"/>`;
    return s + ln('M86 116H136M92 110V122M100 110V122M108 110V122M116 110V122M124 110V122M132 110V122', P, 2) + `<path d="M50 180C56 156 76 140 100 140C124 140 144 156 150 180Z" fill="${P.w}" ${P.o}/>` + ln('M80 150V180M100 146V180M120 150V180', P, 2.4); });
  def('asteca.xipe', 'terra', P => b(P, { cabelo: 'curto', pele: '#d99260' }) + ln('M108 54C102 70 102 90 108 106M120 52C116 70 116 92 122 108', P, 2.4, P.r) + f('M80 54C92 40 116 36 136 44L138 52C120 46 100 48 86 62Z', P.r, P) + [0, 1, 2, 3, 4].map(i => f(`M${150 + (i % 2) * 14} ${60 + i * 22}C${144 + (i % 2) * 14} ${70 + i * 22} ${156 + (i % 2) * 14} ${80 + i * 22} ${162 + (i % 2) * 14} ${70 + i * 22}C${166 + (i % 2) * 14} ${62 + i * 22} ${158 + (i % 2) * 14} ${54 + i * 22} ${150 + (i % 2) * 14} ${60 + i * 22}Z`, P.a, P)).join(''));
  def('asteca.aguia', 'ceu', P => b(P, { cabelo: 'curto' }) + f('M70 70C66 44 86 22 116 22C140 22 156 38 158 56L188 76C176 82 162 80 152 74C144 90 128 96 116 96C112 80 100 70 86 70Z', P.w, P) + f('M154 58L188 76L160 72Z', P.a, P) + circ(144, 50, 4, P.ink) + ln('M84 40C96 34 112 32 128 36M80 56C94 50 110 50 124 52', P, 1.6) + `<path d="M160 120L190 90L196 98L168 128Z" fill="${P.t}" ${P.o}/>` + [0, 1, 2].map(i => f(`M${174 + i * 6} ${98 - i * 6}l4 -6l4 6z`, P.ink, P)).join(''));
  def('asteca.jaguar', 'noite', P => b(P, { cabelo: 'curto' }) + f('M70 74C64 44 84 20 116 20C144 20 160 40 160 64C160 82 150 94 136 98L130 84C120 80 112 82 106 90C96 84 86 80 78 82Z', P.a, P) + [[90, 34], [110, 30], [132, 36], [148, 52], [80, 56], [100, 52], [124, 52], [144, 70]].map(([x, y]) => circ(x, y, 3.6, P.ink, null) + `<circle cx="${x}" cy="${y}" r="6.4" fill="none" stroke="${P.ink}" stroke-width="1.6"/>`).join('') + f('M128 64C134 60 142 62 144 68C138 70 132 70 128 64Z', P.w, P) + `<path d="M150 150L160 60" stroke="${P.ink}" stroke-width="8"/><path d="M150 150L160 60" stroke="#8a5a3a" stroke-width="5"/>` + [0, 1, 2, 3].map(i => f(`M${152 + i * 2} ${130 - i * 20}l8 2l-8 4z`, '#1b1b22', P)).join(''));
  def('asteca.xochiquetzal', 'terra', P => b(P, { fem: true, cabelo: 'longo', pele: '#d99260' }) + [[50, 40], [150, 40], [36, 110], [164, 110], [100, 18]].map(([x, y]) => xochi(P, x, y, 12)).join('') + f('M78 48C92 30 122 28 138 40L140 50C122 42 100 44 86 58Z', P.r, P) + F.ave(P, 'translate(130 108) scale(.32)', { cor: P.t }));
  def('asteca.ahuizotl', 'mar', P => f('M20 120C30 96 60 84 90 86C110 70 136 66 156 76L178 70L170 86C178 94 178 104 170 110L140 112C120 124 90 128 60 124C46 140 30 150 14 150C24 142 30 132 30 124Z', '#5a4a3a', P) + f('M14 150C8 146 4 138 8 130C16 136 20 142 14 150Z', P.a, P) + circ(156, 88, 3.6, P.a, P) + circ(156, 88, 1.6, P.ink) + [0, 1, 2, 3, 4, 5].map(i => ln(`M${50 + i * 16} 92L${46 + i * 16} 84`, P, 2, P.ink)).join(''));
  def('asteca.cipactli', 'terra', P => F.crocodilo(P, 'translate(0 8)', { cor: P.g }) + [30, 60, 90, 120].map(x => f(`M${x} 88L${x + 8} 72L${x + 16} 88Z`, P.t, P)).join('') + `<path d="M-4 184V150C40 140 160 140 206 150V184Z" fill="${P.a}" ${P.o} opacity=".6"/>`);
  def('asteca.chalchiuhtlicue', 'mar', P => b(P, { fem: true, cabelo: 'longo', pele: '#d99260' }) + f('M78 50C92 32 120 30 138 42L140 54C120 46 100 48 86 62Z', P.t, P) + [86, 100, 114, 128].map((x, i) => circ(x, 44 - (i % 2) * 2, 4, P.w, P)).join('') + f('M60 150C80 140 120 140 150 150L156 180H54Z', P.t, P) + ln('M70 160H146M66 170H150', P, 2, P.w));
  def('asteca.xiuhcoatl', 'fogo', P => F.serpente(P, 'translate(0 6)', { cor: P.t, ventre: P.r, w: 22 }) + F.chamas(P, 176, 40, 26, { c1: P.r, c2: P.a }) + [40, 70, 100].map(x => F.chamas(P, x, 170, 14, { c1: P.r, c2: P.a })).join(''));
  def('asteca.macuahuitl', 'terra', P => b(P, { cabelo: 'curto' }) + f('M80 54C92 40 118 36 136 46L138 56C122 50 100 52 86 62Z', P.r, P) + `<path d="M150 170L160 40C164 34 172 34 172 42L166 170Z" fill="#8a5a3a" ${P.o}/>` + [0, 1, 2, 3, 4, 5].map(i => f(`M${160 - i * 0.2} ${50 + i * 18}l-8 4l8 6zM${170 - i * 0.2} ${50 + i * 18}l8 4l-8 6z`, '#1b1b22', P)).join('') + F.escudo(P, 'translate(48 140)', { r: 28, cor: P.t, aro: P.a, umbo: P.w }));
  def('asteca.xolotl', 'mortos', P => f('M30 150C30 120 46 98 70 92C72 70 84 52 100 48L108 30L116 48C132 48 150 60 156 76L176 84C170 96 158 98 146 96C142 110 132 120 120 124L118 150Z', '#7a4a2a', P) + circ(126, 70, 4, P.a, P) + circ(126, 70, 2, P.ink) + f('M110 36L112 22L122 42Z', P.r, P) + `<path d="M118 150L178 150" stroke="${P.a}" stroke-width="4"/>` + F.estrela(P, 40, 34, 10, P.w));
  def('asteca.sacerdote', 'fogo', P => `<path d="M10 180L30 120H170L190 180Z" fill="#7a6a5a" ${P.o}/>` + [0, 1, 2, 3].map(i => ln(`M${22 + i * 4} ${168 - i * 14}H${178 - i * 4}`, P, 2)).join('') + `<path d="M60 120L70 70H130L140 120Z" fill="${P.r}" ${P.o}/>` + F.chamas(P, 100, 70, 40, { c1: P.r, c2: P.a }) + `<path d="M92 40C84 30 90 18 100 24C110 18 116 30 108 40L100 48Z" fill="${P.r}" ${P.o}/>`);
  def('asteca.fogonovo', 'noite', P => `<circle cx="100" cy="90" r="60" fill="none" stroke="${P.a}" stroke-width="3" stroke-dasharray="6 6"/>` + F.chamas(P, 100, 150, 90, { c1: P.r, c2: P.a }) + `<path d="M60 160L140 160L130 172H70Z" fill="#8a5a3a" ${P.o}/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => circ(100 + Math.cos(i * 0.785) * 76, 90 + Math.sin(i * 0.785) * 76, 4, P.w, P)).join(''));
  def('asteca.eclipse', 'mortos', P => F.sol(P, 100, 80, 42, { n: 16, raio: 1.6, c1: P.r, c2: P.a, cor: P.a }) + `<circle cx="112" cy="74" r="40" fill="${P.ink}"/>` + [[30, 140], [150, 150], [60, 30]].map(([x, y]) => `<g transform="translate(${x} ${y}) scale(.4)"><path d="M-20 -30C-30 -10 -24 20 0 30C24 20 30 -10 20 -30C10 -40 -10 -40 -20 -30Z" fill="${P.w}" ${P.o}/><circle cx="-8" cy="-8" r="6" fill="${P.ink}"/><circle cx="8" cy="-8" r="6" fill="${P.ink}"/></g>`).join(''));
  // ---- os romanos ----
  def('romano.jupiter', 'ceu', P => F.raio(P, 'translate(148 4) scale(1.4) rotate(6)', { cor: P.a }) + b(P, { barba: 'cheia', cabelo: 'crespo' }) + F.louro(P, { cor: '#4d6a2a' }) + F.ave(P, 'translate(-10 92) scale(.55)', { abertas: false }));
  def('romano.marte', 'fogo', P => F.lanca(P, 'translate(34 20) rotate(-8)', { len: 150, ponta: P.a }) + b(P, { barba: 'curta', cabelo: 'curto' }) + F.elmo(P, { cor: P.r, metal: P.k }) + `<path d="M140 120H184V176H140Z" fill="${P.r}" ${P.o}/><path d="M162 124V172M144 148H180" stroke="${P.a}" stroke-width="3"/>`);
  def('romano.netuno', 'mar', P => F.tridente(P, 'translate(160 30) rotate(6)', { cor: P.a }) + b(P, { barba: 'cheia', cabelo: 'crespo' }) + `<path d="M10 160C20 136 50 128 70 140C60 136 50 140 48 150C60 150 66 160 60 170C46 166 32 170 10 160Z" fill="${P.a}" ${P.o}/>` + F.ondas(P, 172, 1, '#a6d6da', 2));
  def('romano.jano', 'ceu', P => b(P, { barba: 'cheia', cabelo: 'curto' }) + g('translate(200 0) scale(-1 1)', b(P, { barba: 'cheia', cabelo: 'curto' })) + `<path d="M78 34H122L118 40H82Z" fill="${P.a}" ${P.o}/>` + `<path d="M90 120L110 120L112 180H88Z" fill="${P.k}" ${P.o}/>` + F.estrela(P, 100, 24, 8, P.a));
  def('romano.minerva', 'ceu', P => F.lanca(P, 'translate(170 24) rotate(6)', { len: 150, ponta: P.a }) + b(P, { fem: true, cabelo: 'longo' }) + F.elmo(P, { cor: P.r, metal: P.k }) + F.coruja(P, 'translate(-4 106) scale(.4)', { cor: P.k }));
  def('romano.plutao', 'mortos', P => b(P, { barba: 'cheia', cabelo: 'crespo' }) + f('M80 50C92 36 116 32 136 40L138 46L130 44L126 36L120 42L114 34L108 42L102 36L98 44L90 40L86 50Z', P.a, P) + `<path d="M140 150C150 134 176 134 186 150L180 176H146Z" fill="${P.a}" ${P.o}/>` + [148, 160, 172].map(x => circ(x, 140, 6, P.a, P)).join('') + `<path d="M150 112L178 112L174 132H154Z" fill="${P.r}" ${P.o}/>`);
  def('romano.vulcano', 'fogo', P => F.chamas(P, 46, 176, 50, { c1: '#c4501a', c2: P.a }) + b(P, { barba: 'cheia', cabelo: 'curto' }) + f('M80 54C92 40 118 36 136 46L136 54C120 48 100 50 86 62Z', P.r, P) + `<path d="M130 150H190L184 160H170L174 176H146L150 160H136Z" fill="#3a3a40" ${P.o}/>` + g('translate(150 70) rotate(30) scale(.7)', F.martelo(P, '')));
  def('romano.lupa', 'terra', P => F.lobo(P, 'translate(0 -10)', { cor: P.k, olho: P.r }) + `<circle cx="66" cy="150" r="12" fill="${P.w}" ${P.o}/><circle cx="96" cy="152" r="12" fill="${P.w}" ${P.o}/><path d="M50 166C56 156 76 156 82 166ZM80 168C86 158 106 158 112 168Z" fill="${P.w}" ${P.o}/>` + ln('M-4 172Q20 166 40 172T80 172T120 172T160 172T200 172', P, 2, '#a6d6da'));
  def('romano.romulo', 'terra', P => b(P, { barba: 'curta', cabelo: 'curto' }) + F.louro(P, { cor: '#4d6a2a' }) + `<path d="M136 160L178 120L184 126L146 166Z" fill="${P.a}" ${P.o}/><path d="M176 122C186 112 194 112 194 120C188 122 184 124 182 128Z" fill="${P.a}" ${P.o}/>` + ln('M20 172C60 168 100 170 140 166', P, 3, P.a));
  def('romano.remo', 'terra', P => g('translate(200 0) scale(-1 1)', b(P, { barba: 'curta', cabelo: 'curto' })) + `<path d="M10 120H190V128H10Z" fill="${P.w}" opacity=".5"/>` + [0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${12 + i * 26}" y="128" width="22" height="12" fill="none" stroke="${P.a}" stroke-width="1.2" opacity=".7"/>`).join('') + F.espada(P, 'translate(40 60) rotate(-30)', { cor: P.w }));
  def('romano.venus', 'mar', P => `<path d="M30 170C40 120 70 96 100 96C130 96 160 120 170 170Z" fill="${P.w}" ${P.o}/>` + [0, 1, 2, 3, 4, 5, 6].map(i => ln(`M100 170L${40 + i * 20} ${120 - Math.sin(i * 0.52) * 20}`, P, 1.6, P.l)).join('') + b(P, { fem: true, cabelo: 'coque' }).replace('<path', '<path transform="translate(0 -30) scale(1)"') + F.ave(P, 'translate(140 10) scale(.36)', { cor: P.w }));
  def('romano.vesta', 'fogo', P => `<path d="M40 170H160V178H40ZM50 110H150V120H50Z" fill="${P.w}" ${P.o}/>` + [56, 80, 104, 128].map(x => `<rect x="${x}" y="120" width="12" height="50" fill="${P.w}" ${P.o}/>`).join('') + `<path d="M50 110C60 80 140 80 150 110Z" fill="${P.a}" ${P.o}/>` + F.chamas(P, 100, 168, 34, { c1: '#d06a1e', c2: P.a }) + F.chamas(P, 100, 84, 40, { c1: '#d06a1e', c2: P.a }));
  def('romano.augure', 'ceu', P => b(P, { cabelo: 'curto' }) + `<path d="M76 62C80 40 104 30 128 34C140 36 146 44 146 54C128 48 104 50 84 66Z" fill="${P.w}" ${P.o}/>` + `<path d="M150 140C150 120 164 110 176 114C170 120 168 130 172 140" fill="none" stroke="${P.a}" stroke-width="3"/>` + [[30, 30, 0.3], [56, 16, 0.24], [170, 30, 0.28], [150, 10, 0.2]].map(([x, y, k]) => F.ave(P, `translate(${x} ${y}) scale(${k})`, { abertas: true, cor: '#1a1410' })).join(''));
  def('romano.gladiador', 'terra', P => b(P, { cabelo: 'curto' }) + `<path d="M74 96C66 70 76 46 100 40C124 34 142 46 146 66L148 104C130 108 104 108 88 104Z" fill="${P.k}" ${P.o}/>` + [0, 1, 2, 3].map(i => circ(112 + i * 8, 76, 2.4, P.ink)).join('') + [0, 1, 2].map(i => circ(116 + i * 8, 86, 2.4, P.ink)).join('') + `<path d="M90 40C100 20 130 18 146 30L138 44C126 34 110 34 100 42Z" fill="${P.r}" ${P.o}/>` + F.espada(P, 'translate(170 80) rotate(20)', { cor: P.w }) + `<path d="M12 120H56V176H12Z" fill="${P.r}" ${P.o}/>`);
  def('romano.legionario', 'terra', P => `<path d="M50 44H150V176H50Z" fill="${P.r}" ${P.o}/><path d="M100 54V166M60 110H140" stroke="${P.a}" stroke-width="4"/><circle cx="100" cy="110" r="14" fill="${P.a}" ${P.o}/>` + [0, 1, 2, 3].map(i => ln(`M${64 + i * 24} 64L${74 + i * 24} 84M${64 + i * 24} 132L${74 + i * 24} 152`, P, 2.4, P.a)).join('') + F.espada(P, 'translate(172 56) rotate(14)', { cor: P.w }) + F.lanca(P, 'translate(28 30) rotate(-6)', { len: 140, ponta: P.w }));
  def('romano.pretoriano', 'noite', P => b(P, { cabelo: 'curto' }) + F.elmo(P, { cor: '#f0e0c0', metal: P.k }) + `<path d="M140 100L176 100L180 176H136Z" fill="${P.r}" ${P.o}/><path d="M148 116C156 110 164 110 170 116C166 132 160 140 158 150C156 140 150 132 148 116Z" fill="${P.a}" ${P.o}/>`);
  def('romano.fauno', 'terra', P => b(P, { barba: 'ponta', cabelo: 'crespo' }) + f('M90 44C84 28 86 14 94 6C96 20 100 30 106 38ZM120 40C126 26 136 18 146 16C140 28 134 38 128 46Z', P.a, P) + `<g transform="translate(150 120) rotate(-30)">${[0, 1, 2, 3, 4].map(i => `<rect x="${i * 8}" y="0" width="7" height="${46 - i * 6}" fill="${P.a}" ${P.o}/>`).join('')}</g>`);
  def('romano.gansos', 'noite', P => `<path d="M20 160H180V176H20Z" fill="${P.w}" opacity=".4"/>` + F.ave(P, 'translate(10 40) scale(.6)', { cor: P.w }) + F.ave(P, 'translate(80 50) scale(.6)', { cor: P.w }) + F.lua(P, 160, 40, 20, P.a));
  def('romano.triunfo', 'ouro', P => `<path d="M30 176V70H170V176H136V110C136 90 120 80 100 80C80 80 64 90 64 110V176Z" fill="${P.w}" ${P.o}/><path d="M24 60H176V70H24Z" fill="${P.a}" ${P.o}/>` + F.louro(P, { cor: '#4d6a2a' }).replace(/<ellipse/g, '<ellipse transform-origin="100 70"') + F.estrela(P, 100, 36, 12, P.a) + `<path d="M76 128H124" stroke="${P.a}" stroke-width="2"/>`);
  def('romano.idos', 'mortos', P => F.lua(P, 140, 40, 22, P.w) + `<path d="M40 176V90H60V176ZM80 176V90H100V176ZM120 176V90H140V176Z" fill="${P.w}" ${P.o} opacity=".6"/><path d="M30 80H150V90H30Z" fill="${P.w}" ${P.o} opacity=".6"/>` + [0, 1, 2].map(i => F.espada(P, `translate(${70 + i * 30} ${30 + i * 8}) rotate(${-30 + i * 30})`, { cor: '#d0d0d8' })).join('') + `<path d="M60 160C80 150 120 150 140 160" stroke="${P.r}" stroke-width="6" fill="none"/>`);
  // ---- os Titãs (o clássico) ----
  def('classico.cronos', 'noite', P => `<path d="M30 120C60 40 140 40 170 120" fill="none" stroke="${P.a}" stroke-width="3"/>` + `<path d="M150 20C180 20 196 50 186 76L170 70C178 52 168 36 150 34Z" fill="${P.k}" ${P.o}/><path d="M150 34L120 150" stroke="${P.h}" stroke-width="5"/>` + b(P, { barba: 'cheia', cabelo: 'longo' }) + F.ouroboros(P, 46, 150, 20, { cor: P.k }));
  def('classico.tifao', 'fogo', P => { let q = ''; for (let i = 0; i < 9; i++) { const a = -2.95 + i * 0.36; const ex = 100 + Math.cos(a) * 76, ey = 116 + Math.sin(a) * 92; q += ln(`M100 118Q${(100 + Math.cos(a - 0.3) * 46).toFixed(1)} ${(116 + Math.sin(a - 0.3) * 50).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, P, 7, '#7a5418') + ln(`M100 118Q${(100 + Math.cos(a - 0.3) * 46).toFixed(1)} ${(116 + Math.sin(a - 0.3) * 50).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, P, 5, P.a) + F.cabSerp(P, ex, ey, a, 1.1, 'url(#ctOuroC)'); }
    return q + `<path d="M46 180C52 140 74 116 100 116C126 116 148 140 154 180Z" fill="${P.k}" ${P.o}/>` + F.raio(P, 'translate(14 110) scale(.6) rotate(-20)', { cor: P.w }) + F.raio(P, 'translate(160 100) scale(.5) rotate(20)', { cor: P.w }); });

  def('classico.gaia', 'terra', P => b(P, { fem: true, cabelo: 'longo' }) + `<path d="M-4 184V140C40 120 80 150 120 132C150 120 180 130 206 124V184Z" fill="#3a5a2a" ${P.o}/>` + [30, 170, 150].map(x => `<path d="M${x} 130V100" stroke="${P.k}" stroke-width="3"/><circle cx="${x}" cy="94" r="12" fill="#5a8a3a" ${P.o}/>`).join('') + f('M80 52C92 36 118 32 136 42L138 50C120 44 100 46 86 60Z', '#5a8a3a', P));
  def('classico.prometeu', 'noite', P => b(P, { barba: 'ponta', cabelo: 'crespo' }) + `<path d="M150 140L156 100" stroke="${P.h}" stroke-width="5"/>` + F.chamas(P, 156, 100, 40, { c1: P.r, c2: P.a }) + F.ave(P, 'translate(-20 0) scale(.6)', { abertas: true, cor: '#3a3a5a' }) + F.corrente(P, 'translate(20 160) rotate(-6)', 5));
  def('classico.nix', 'noite', P => `<path d="M10 170C20 100 50 60 100 50C150 60 180 100 190 170C160 140 130 130 100 130C70 130 40 140 10 170Z" fill="#141434" ${P.o}/>` + b(P, { fem: true, cabelo: 'longo' }) + [[40, 120], [60, 100], [150, 104], [170, 124], [30, 150], [180, 156]].map(([x, y]) => F.estrela(P, x, y, 5, P.w)).join('') + F.lua(P, 100, 24, 14, P.w));
  def('classico.helio', 'aurora', P => F.sol(P, 100, 70, 36, { n: 20, c1: P.a, c2: '#ffb860', cor: 'url(#ctOuroC)' }) + `<circle cx="88" cy="64" r="4" fill="${P.ink}"/><circle cx="112" cy="64" r="4" fill="${P.ink}"/><path d="M90 82C96 88 104 88 110 82" stroke="${P.ink}" stroke-width="2.4" fill="none"/>` + F.cavalo(P, 'translate(-20 96) scale(.5)', { cor: P.k }) + F.cavalo(P, 'translate(110 96) scale(.5)', { cor: P.k }));
  def('classico.oceano', 'mar', P => b(P, { barba: 'cheia', cabelo: 'longo' }) + `<path d="M76 44C72 30 80 18 92 16L96 34ZM126 36C128 22 138 14 150 14L140 40Z" fill="${P.k}" ${P.o}/>` + `<rect x="-2" y="140" width="204" height="44" fill="#1a3a6a" opacity=".8"/>` + F.ondas(P, 148, 3, '#7fd3d0', 2.4));
  def('classico.atlas', 'noite', P => `<circle cx="100" cy="54" r="50" fill="#1a2a5a" ${P.o}/>` + [0, 1, 2].map(i => `<ellipse cx="100" cy="54" rx="50" ry="${14 + i * 14}" fill="none" stroke="${P.a}" stroke-width="1.2" opacity=".7"/>`).join('') + `<path d="M50 54H150M100 4V104" stroke="${P.a}" stroke-width="1.2" opacity=".7"/>` + [[80, 40], [120, 66], [100, 26], [68, 66], [130, 38]].map(([x, y]) => F.estrela(P, x, y, 4, P.w)).join('') + `<path d="M40 104C46 96 56 94 64 98L74 120L66 128ZM160 104C154 96 144 94 136 98L126 120L134 128Z" fill="${P.k}" ${P.o}/>` + `<g transform="translate(28 74) scale(.72)">${b(P, { barba: 'cheia', cabelo: 'crespo' })}</g>`);

  def('classico.temis', 'aurora', P => F.balanca(P, 'translate(100 110) scale(1.1)') + b(P, { fem: true, cabelo: 'longo' }).replace('<path', '<path transform="translate(0 0)"').slice(0, 0) + F.espada(P, 'translate(30 60) rotate(-10)', { cor: P.w }) + `<path d="M84 30H116V40H84Z" fill="${P.w}" ${P.o}/>`);
  def('classico.mnemosine', 'noite', P => b(P, { fem: true, cabelo: 'coque' }) + [[30, 40], [50, 20], [160, 30], [176, 56], [30, 80], [170, 100], [40, 130], [160, 140], [100, 14]].map(([x, y], i) => F.estrela(P, x, y, 5 + (i % 3), P.a)).join(''));
  def('classico.quimera', 'fogo', P => F.leao(P, 'translate(30 20) scale(.8)', { cor: P.k, juba: P.h }) + `<path d="M26 60C20 40 30 26 40 24L42 40C36 44 34 52 36 60Z" fill="${P.k}" ${P.o}/>` + F.serpente(P, 'translate(110 100) scale(.4) rotate(-20)', { cor: P.k }) + F.chamas(P, 170, 110, 30, { c1: P.r, c2: P.a }));
  def('classico.equidna', 'mortos', P => b(P, { fem: true, cabelo: 'longo' }).replace(/M24 180[^"]*Z|M30 180[^"]*Z/, 'M80 140C80 120 84 110 90 100C84 92 80 80 80 68C80 50 96 40 116 40C130 40 138 48 138 60L139 68L141 74L148 85C149 88 147 90 144 90L141 91C142 93 143 95 142 97L138 99C140 100 141 102 140 104C140 109 138 113 135 115C131 118 127 119 124 121L124 136Z') + ln('M100 140C60 150 40 176 80 176C120 176 160 170 180 150', P, 18, P.k));
  def('classico.hecatonquiro', 'noite', P => { let q = ''; for (let i = 0; i < 12; i++) { const a = -Math.PI + 0.12 + i * ((Math.PI - 0.24) / 11); const x2 = 100 + Math.cos(a) * 84, y2 = 112 + Math.sin(a) * 84; q += ln(`M100 112L${x2.toFixed(1)} ${y2.toFixed(1)}`, P, 7, '#7a5418') + ln(`M100 112L${x2.toFixed(1)} ${y2.toFixed(1)}`, P, 5, P.a) + `<g transform="translate(${x2.toFixed(1)} ${y2.toFixed(1)}) rotate(${(a * 180 / Math.PI + 90).toFixed(0)})"><path d="M-5 2C-6 -4 -5 -10 -3 -12L-2 -5L0 -13L1 -5L3 -12L4 -5L6 -9C7 -4 6 1 4 3Z" fill="url(#ctOuroC)" ${P.o}/></g>`; }
    return q + `<path d="M48 180C54 132 76 104 100 104C124 104 146 132 152 180Z" fill="${P.k}" ${P.o}/>` + [74, 100, 126].map((x, i) => b(P, { barba: 'cheia', cabelo: 'crespo' }).replace('', '') && `<g transform="translate(${x - 26} ${62 - (i === 1 ? 10 : 0)}) scale(.26)">${b(P, { barba: 'cheia', cabelo: 'crespo' })}</g>`).join(''); });

  def('classico.selene', 'noite', P => `<circle cx="100" cy="70" r="54" fill="#d8dcf0" opacity=".9"/><circle cx="118" cy="62" r="54" fill="#191842"/>` + b(P, { fem: true, cabelo: 'longo' }).replace('<path', '<path transform="translate(0 20) scale(1)"') + F.lua(P, 114, 30, 12, P.w));
  def('classico.gigante', 'terra', P => `<path d="M60 30C70 6 120 2 140 24C150 36 146 52 132 58C116 64 80 62 66 52C58 46 56 38 60 30Z" fill="#7a7a8a" ${P.o}/><path d="M76 30C86 22 104 20 118 26M70 44C88 50 112 50 132 42" stroke="#4a4a5a" stroke-width="2" fill="none"/>` + `<path d="M40 180C42 150 52 128 66 116L64 84L56 62L68 58L76 80L84 96C88 92 94 90 100 90C106 90 112 92 116 96L124 80L132 58L144 62L136 84L134 116C148 128 158 150 160 180Z" fill="${P.k}" ${P.o}/><path d="M100 90C92 90 86 82 86 72C86 62 92 56 100 56C108 56 114 62 114 72C114 82 108 90 100 90Z" fill="${P.k}" ${P.o}/>` + circ(94, 70, 2, P.r) + circ(106, 70, 2, P.r) + ln('M70 140C60 150 50 166 44 180M130 140C140 150 150 166 156 180M82 120C90 126 110 126 118 120', P, 1.6) + ln('M40 180C30 170 22 160 26 148M160 180C170 170 178 160 174 148', P, 7, P.k));

  def('classico.curetes', 'terra', P => [40, 100, 160].map((x, i) => F.escudo(P, `translate(${x} ${120 - (i % 2) * 14})`, { r: 26, cor: P.r, aro: P.a, umbo: P.k }) + F.lanca(P, `translate(${x + 20} ${40 - (i % 2) * 14}) rotate(${-20 + i * 20})`, { len: 100 })).join('') + `<circle cx="100" cy="40" r="14" fill="${P.w}" opacity=".6"/>`);
  def('classico.ninfa', 'terra', P => b(P, { fem: true, cabelo: 'longo' }) + [30, 160].map(x => `<path d="M${x} 180V60" stroke="#3a5a2a" stroke-width="6"/>` + [0, 1, 2].map(i => `<ellipse cx="${x + (i % 2 ? 12 : -12)}" cy="${80 + i * 26}" rx="14" ry="6" fill="#5a8a3a" ${P.o}/>`).join('')).join('') + `<path d="M40 176C60 166 140 166 160 176" stroke="#7fd3d0" stroke-width="4" fill="none"/>`);
  def('classico.hesperides', 'aurora', P => `<path d="M96 180V100" stroke="${P.h}" stroke-width="10"/>` + `<circle cx="100" cy="70" r="60" fill="#2a5a2a" ${P.o}/>` + [[70, 50], [120, 40], [140, 80], [80, 90], [104, 70], [60, 74]].map(([x, y]) => circ(x, y, 9, P.k, P) + `<path d="M${x} ${y - 9}L${x + 4} ${y - 14}" stroke="#2a5a2a" stroke-width="2"/>`).join('') + F.serpente(P, 'translate(110 100) scale(.42)', { cor: P.k }));
  def('classico.eos', 'aurora', P => `<rect x="-2" y="100" width="204" height="84" fill="#ff9a70" opacity=".35"/>` + F.sol(P, 100, 140, 34, { n: 20, c1: '#ffb860', c2: P.a, cor: P.a }) + `<path d="M-4 184V150C60 140 140 140 206 150V184Z" fill="#191842"/>` + [0, 1, 2, 3, 4].map(i => `<path d="M${40 + i * 30} 40C${46 + i * 30} 30 ${60 + i * 30} 30 ${64 + i * 30} 40C${60 + i * 30} 48 ${46 + i * 30} 48 ${40 + i * 30} 40Z" fill="#ff9ab0" opacity=".8"/>`).join(''));
  def('classico.erebo', 'mortos', P => { let s = ''; for (let i = 0; i < 6; i++) s += `<circle cx="100" cy="90" r="${80 - i * 13}" fill="${['#0b0b22', '#141030', '#1c1438', '#241840', '#2a1c48', '#000'][i]}"/>`; return s + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${100 + Math.cos(i * 0.785) * 30} ${90 + Math.sin(i * 0.785) * 30}Q${100 + Math.cos(i * 0.785 + 0.5) * 60} ${90 + Math.sin(i * 0.785 + 0.5) * 60} ${100 + Math.cos(i * 0.785 + 0.2) * 84} ${90 + Math.sin(i * 0.785 + 0.2) * 84}" stroke="${P.a}" stroke-width="1.4" fill="none" opacity=".6"/>`).join('') + F.olho(P, 100, 90, 14, { branco: '#2a2440', iris: P.r }); });

  // ------------------------------ a moldura de cada povo ------------------------------
  // a tabuleta é 250 × 350; a janela da figura, 200 × 180 a partir de (25, 28); a faixa do nome embaixo dela; o painel do poder
  const W = 250, Hh = 350;
  function friso(povo) { // (o ornamento que corre na faixa de fora, 12 de largura)
    const P = stOf(povo);
    if (povo === 'grego') { let d = ''; for (let x = 18; x < 232; x += 14) d += `M${x} 10V3H${x + 10}V8H${x + 5}V5.5`; let e = ''; for (let x = 18; x < 232; x += 14) e += `M${x} 340V347H${x + 10}V342H${x + 5}V344.5`; return `<path d="${d}${e}" fill="none" stroke="#d9864c" stroke-width="1.5"/>`; }
    if (povo === 'egipcio') { let s = ''; for (let x = 14; x < 236; x += 9) s += `<rect x="${x}" y="3" width="6" height="7" fill="${['#1f3d8a', '#a63a24', '#2aa198'][Math.round(x / 9) % 3]}"/><rect x="${x}" y="340" width="6" height="7" fill="${['#1f3d8a', '#a63a24', '#2aa198'][Math.round(x / 9) % 3]}"/>`; for (let y = 16; y < 336; y += 9) s += `<rect x="3" y="${y}" width="7" height="6" fill="${['#1f3d8a', '#a63a24', '#2aa198'][Math.round(y / 9) % 3]}"/><rect x="240" y="${y}" width="7" height="6" fill="${['#1f3d8a', '#a63a24', '#2aa198'][Math.round(y / 9) % 3]}"/>`; return s; }
    if (povo === 'nordico') { let d = ''; for (let x = 16; x < 234; x += 16) d += `M${x} 9C${x + 4} 2 ${x + 12} 2 ${x + 16} 9M${x} 3C${x + 4} 10 ${x + 12} 10 ${x + 16} 3`; let e = d.replace(/(\d+(\.\d+)?) (\d+)/g, (m, a, b, c) => `${a} ${+c + 338}`); return `<path d="${d}${e}" fill="none" stroke="#1c1008" stroke-width="3.4"/><path d="${d}${e}" fill="none" stroke="#e7cc97" stroke-width="1.5"/>`; }
    if (povo === 'asteca') { let d = ''; for (let x = 16; x < 234; x += 16) d += `M${x} 10V6H${x + 4}V3H${x + 12}V7H${x + 8}`; let e = d.replace(/V(\d+)/g, (m, a) => `V${347 - (a - 3)}`).replace(/M(\d+) (\d+)/g, (m, a, b) => `M${a} ${347 - (b - 3)}`); return `<path d="${d}${e}" fill="none" stroke="#3fd0c3" stroke-width="2"/>`; }
    if (povo === 'romano') { let s = ''; for (let x = 22; x < 230; x += 12) s += `<ellipse cx="${x}" cy="6.5" rx="5" ry="2.2" transform="rotate(${x % 24 ? 20 : -20} ${x} 6.5)" fill="#c9a24a"/><ellipse cx="${x}" cy="343.5" rx="5" ry="2.2" transform="rotate(${x % 24 ? -20 : 20} ${x} 343.5)" fill="#c9a24a"/>`; return s; }
    let d = ''; for (let x = 18; x < 232; x += 16) d += `M${x} 9C${x} 3 ${x + 8} 3 ${x + 8} 7C${x + 8} 9 ${x + 5} 9 ${x + 5} 7`; let e = d.replace(/(\d+(\.\d+)?) (\d+)/g, (m, a, b, c) => `${a} ${+c + 335}`); return `<path d="${d}${e}" fill="none" stroke="#e8c878" stroke-width="1.4"/>`;
  }
  // (a janela da figura: a forma dela em cada povo — o arco romano, os cantos em degrau do asteca, o friso reto do grego…)
  const JANELA = {
    grego: 'M25 28H225V208H25Z',
    egipcio: 'M25 40Q25 28 37 28H213Q225 28 225 40V208H25Z',
    nordico: 'M25 44Q25 28 41 28H209Q225 28 225 44V192Q225 208 209 208H41Q25 208 25 192Z',
    asteca: 'M33 28H217V36H225V200H217V208H33V200H25V36H33Z',
    romano: 'M25 208V88C25 50 70 28 125 28C180 28 225 50 225 88V208Z',
    classico: 'M25 38Q25 28 35 28H215Q225 28 225 38V198Q225 208 215 208H35Q25 208 25 198Z',
  };
  A.JANELA = JANELA;
  function moldura(povo, rar) {
    const P = stOf(povo); let s = '';
    // (a tabuleta em si: o material de cada povo — a madeira, o barro, a cera, o amate, o papiro —, com o seu veio)
    s += `<rect x="0" y="0" width="${W}" height="${Hh}" rx="14" fill="url(#ctBase-${povo})"/>`;
    s += friso(povo);
    // (a borda de dentro, a janela e o painel do texto)
    const inner = { grego: '#1c120b', egipcio: '#d9a62a', nordico: '#2a170b', asteca: '#140b06', romano: '#c9a24a', classico: '#c9a55a' }[povo];
    s += `<rect x="12" y="12" width="${W - 24}" height="${Hh - 24}" rx="7" fill="none" stroke="${inner}" stroke-width="2"/>`;
    s += `<path d="${JANELA[povo]}" fill="none" stroke="${inner}" stroke-width="4"/>`;
    // (o painel do poder: o fundo claro onde se lê)
    const pan = { grego: '#e8a06a', egipcio: '#f3e5bd', nordico: '#e9d6ac', asteca: '#efdcae', romano: '#f4ede0', classico: '#efe3c4' }[povo];
    s += `<rect x="25" y="232" width="200" height="98" rx="5" fill="${pan}" stroke="${inner}" stroke-width="2"/>`;
    // (os enfeites dos cantos e do alto)
    if (povo === 'egipcio') s += `<g transform="translate(125 20)"><path d="M-40 4C-28 -6 -14 -4 -8 2H8C14 -4 28 -6 40 4C28 2 18 6 10 8H-10C-18 6 -28 2 -40 4Z" fill="#d9a62a" stroke="#22180e" stroke-width="1"/><circle r="7" fill="#a63a24" stroke="#22180e" stroke-width="1"/></g>`;
    if (povo === 'nordico') for (const [x, y, sx, sy] of [[12, 12, 1, 1], [238, 12, -1, 1], [12, 338, 1, -1], [238, 338, -1, -1]]) s += `<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M-6 -6H34L26 4H4V26L-6 34Z" fill="#5a5d62" stroke="#1a1a1e" stroke-width="1.4"/><circle cx="4" cy="4" r="2.6" fill="#a9aeb5"/><circle cx="20" cy="0" r="2" fill="#a9aeb5"/><circle cx="0" cy="20" r="2" fill="#a9aeb5"/></g>`;
    if (povo === 'asteca') for (const [x, y] of [[14, 14], [236, 14], [14, 336], [236, 336]]) s += `<circle cx="${x}" cy="${y}" r="9" fill="#e9b53b" stroke="#140b06" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#1aa196"/>`;
    if (povo === 'romano') for (const [x, y] of [[14, 14], [236, 14], [14, 336], [236, 336]]) s += `<circle cx="${x}" cy="${y}" r="8" fill="url(#ctOuroR)" stroke="#5d3a10" stroke-width="1"/>${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${x}" cy="${y - 4}" rx="1.8" ry="3.4" transform="rotate(${i * 60} ${x} ${y})" fill="#f6e2a0"/>`).join('')}`;
    if (povo === 'classico') for (const [x, y] of [[14, 14], [236, 14], [14, 336], [236, 336]]) s += F.estrela(P, x, y, 9, '#e8c878');
    if (povo === 'grego') for (const [x, y, r] of [[14, 14, 0], [236, 14, 90], [14, 336, 270], [236, 336, 180]]) s += `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0C6 -6 10 -2 8 4C14 2 16 8 10 10C4 12 0 8 0 0Z" fill="#d9864c"/></g>`;
    // (a raridade: a joia de baixo — o bronze, a prata, o ouro, o rubi de ouro, o diamante que muda de cor)
    s += gema(rar);
    return s;
  }
  function gema(rar) {
    const c = { comum: ['#9a6a3a', '#6a4422'], incomum: ['#dfe4ea', '#8a96a4'], rara: ['#ffd76a', '#b5821e'], lendaria: ['#ff7a5a', '#9a1e12'], unica: ['#ffffff', '#8a5ad8'] }[rar] || ['#9a6a3a', '#6a4422'];
    const d = rar === 'unica' ? 'M125 337L133 345L125 353L117 345Z' : rar === 'lendaria' ? 'M125 338L132 345L125 352L118 345Z' : null;
    return d ? `<path d="${d}" fill="url(#ctGema-${rar})" stroke="#1a1008" stroke-width="1.2"/>` : `<circle cx="125" cy="345" r="${rar === 'rara' ? 5.4 : 4.6}" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.6"/>`;
  }
  // (o medalhão da força, no canto de cima: o escudo redondo do grego e do nórdico, o cartucho do egípcio, o sol do asteca, a coroa do
  // romano, a estrela dos titãs)
  function medalha(povo) {
    if (povo === 'grego') return '<circle cx="36" cy="36" r="24" fill="#1c120b" stroke="#d9864c" stroke-width="2.4"/><circle cx="36" cy="36" r="19" fill="none" stroke="#d9864c" stroke-width="1"/>';
    if (povo === 'egipcio') return '<ellipse cx="36" cy="38" rx="20" ry="26" fill="#f4ecd6" stroke="#d9a62a" stroke-width="4"/><ellipse cx="36" cy="38" rx="20" ry="26" fill="none" stroke="#22180e" stroke-width="1.2"/><path d="M20 66H52" stroke="#d9a62a" stroke-width="4"/>';
    if (povo === 'nordico') return '<circle cx="36" cy="36" r="25" fill="#a8352a" stroke="#1a1a1e" stroke-width="2"/><path d="M36 11A25 25 0 0 1 61 36H36ZM36 61A25 25 0 0 1 11 36H36Z" fill="#ead5a6"/><circle cx="36" cy="36" r="25" fill="none" stroke="#5a5d62" stroke-width="3"/><circle cx="36" cy="36" r="15" fill="#5a5d62" stroke="#1a1a1e" stroke-width="1.4"/>';
    if (povo === 'asteca') return `${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return `<path d="M${(36 + Math.cos(a - 0.3) * 20).toFixed(1)} ${(36 + Math.sin(a - 0.3) * 20).toFixed(1)}L${(36 + Math.cos(a) * 31).toFixed(1)} ${(36 + Math.sin(a) * 31).toFixed(1)}L${(36 + Math.cos(a + 0.3) * 20).toFixed(1)} ${(36 + Math.sin(a + 0.3) * 20).toFixed(1)}Z" fill="${i % 2 ? '#c2352a' : '#e9b53b'}" stroke="#140b06" stroke-width="1.6"/>`; }).join('')}<circle cx="36" cy="36" r="20" fill="#1aa196" stroke="#140b06" stroke-width="2.4"/>`;
    if (povo === 'romano') return `<circle cx="36" cy="36" r="21" fill="#851710" stroke="#c9a24a" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = -Math.PI * 0.95 + i * (Math.PI * 1.9 / 11); return `<ellipse cx="${(36 + Math.cos(a) * 24).toFixed(1)}" cy="${(36 + Math.sin(a) * 24).toFixed(1)}" rx="5" ry="2.4" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${(36 + Math.cos(a) * 24).toFixed(1)} ${(36 + Math.sin(a) * 24).toFixed(1)})" fill="url(#ctOuroR)" stroke="#5d3a10" stroke-width=".6"/>`; }).join('')}`;
    return `${F.estrela(null, 36, 36, 30, '#c9a55a')}<circle cx="36" cy="36" r="17" fill="#191842" stroke="#e8c878" stroke-width="1.6"/>`;
  }
  A.medalha = medalha;

  // ------------------------------ os símbolos: o tipo e o poder ------------------------------
  const ICO = A.ICONE = {
    deus: '<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    criatura: '<path d="M6 20c0-4 3-6 6-6s6 2 6 6zM5 12a2.4 3 0 1 0 .1 0M19 12a2.4 3 0 1 0 .1 0M9 7a2.4 3 0 1 0 .1 0M15 7a2.4 3 0 1 0 .1 0"/>',
    heroi: '<path d="M5 13c0-5 3-9 7-9s7 4 7 9l-2 7h-3v-6h-4v6H7z"/>',
    pressagio: '<path d="M12 2l2.6 6.6L22 9l-5.6 4.6L18 21l-6-3.8L6 21l1.6-7.4L2 9l7.4-.4z"/>',
    golpe: '<path d="M4 6h10v6H4zM8 12h3l-1 10H9z"/><path d="M17 4l4-2M18 9h4M17 14l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    raio: '<path d="M13 2L5 13h6l-2 9 9-12h-6l3-8z"/>',
    troca: '<path d="M4 8h12l-3-3M20 16H8l3 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    egide: '<path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z"/>',
    visao: '<path d="M2 12c3-5 7-7 10-7s7 2 10 7c-3 5-7 7-10 7s-7-2-10-7z"/><circle cx="12" cy="12" r="3.4" fill="#fff8e6"/>',
    mare: '<path d="M2 10c3-3 5-3 7 0s4 3 6 0 5-3 7 0v4c-3-3-5-3-7 0s-4 3-6 0-4-3-7 0z"/><path d="M2 18c3-3 5-3 7 0s4 3 6 0 5-3 7 0" fill="none" stroke="currentColor" stroke-width="2"/>',
    pesagem: '<path d="M11 3h2v15h4v2H7v-2h4zM4 6h16v2H4z"/><path d="M5 8l-3 6h6zM19 8l-3 6h6z"/>',
    renasce: '<path d="M12 22c-5 0-8-3-8-7 0-3 2-5 3-8 1 2 2 3 3 3 0-3 1-6 4-8 0 3 2 5 4 7 1 1 2 3 2 6 0 4-3 7-8 7z"/>',
    furia: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 0-6 1-9z"/>',
    legiao: '<path d="M3 20V9l3-3 3 3v11zM9.5 20V7l2.5-3 2.5 3v13zM15 20V9l3-3 3 3v11z"/>',
    bando: '<circle cx="8" cy="8" r="3.4"/><circle cx="16" cy="8" r="3.4"/><path d="M2 20c0-4 3-7 6-7s6 3 6 7zM10 20c0-4 3-7 6-7s6 3 6 7z"/>',
    alto: '<path d="M2 20l7-12 4 6 3-4 6 10z"/><circle cx="18" cy="5" r="2.6"/>',
    sacrificio: '<path d="M12 21C6 16 3 13 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 4-3 7-9 12z"/>',
    compra: '<path d="M6 3h10l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 9v8M7 13h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    colhe: '<path d="M12 22V9M12 9c-3-1-5-4-5-7 3 1 5 3 5 7zM12 9c3-1 5-4 5-7-3 1-5 3-5 7zM12 15c-3-1-5-3-6-6 3 0 5 2 6 6zM12 15c3-1 5-3 6-6-3 0-5 2-6 6z"/>',
    furto: '<path d="M5 12V6a1.5 1.5 0 0 1 3 0v5V4a1.5 1.5 0 0 1 3 0v7V5a1.5 1.5 0 0 1 3 0v6V7a1.5 1.5 0 0 1 3 0v8c0 4-3 7-7 7-3 0-5-2-6-4l-3-5a1.4 1.4 0 0 1 2.4-1.4z"/>',
    devora: '<path d="M2 6l3 4 3-4 3 4 3-4 3 4 3-4 2 3v9H2V9z"/><path d="M4 18l2-3 2 3 2-3 2 3 2-3 2 3 2-3 2 3" fill="#fff8e6"/>',
    presagio: '<path d="M12 2l2.6 6.6L22 9l-5.6 4.6L18 21l-6-3.8L6 21l1.6-7.4L2 9l7.4-.4z"/>',
    maldicao: '<path d="M12 2a9 9 0 1 0 9 11A7 7 0 0 1 12 2z"/><path d="M14 9l1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L11 11.3l2-.3z" fill="#fff8e6"/>',
    firme: '<path d="M3 21l3-9 4-3 3 2 4-5 4 15z"/>',
    juiz: '<path d="M12 2c-1 6-1 12 0 20 1-8 1-14 0-20z" stroke="currentColor" stroke-width="3"/><path d="M8 7c2 1 3 3 4 6M16 7c-2 1-3 3-4 6" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    oferenda: '<path d="M12 21C6 16 3 13 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 4-3 7-9 12z"/><path d="M12 3v4" stroke="currentColor" stroke-width="2"/>',
  };
  A.icone = (k, cls) => (ICO[k] ? `<svg class="${cls || 'ct-ico'}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICO[k]}</svg>` : '');

  // ------------------------------ as tintas guardadas (os defs, uma vez por página) ------------------------------
  function defs() {
    let s = '<linearGradient id="ctOuroR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".35" stop-color="#e9be5a"/><stop offset=".7" stop-color="#b98428"/><stop offset="1" stop-color="#f3d27a"/></linearGradient>';
    s += '<linearGradient id="ctOuroR2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2b55a"/><stop offset="1" stop-color="#8e5f1c"/></linearGradient>';
    s += '<linearGradient id="ctOuroC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".4" stop-color="#e3bd68"/><stop offset=".75" stop-color="#a87a2e"/><stop offset="1" stop-color="#f6dc8e"/></linearGradient>';
    s += '<linearGradient id="ctOuroC2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b062"/><stop offset="1" stop-color="#7a5418"/></linearGradient>';
    s += '<linearGradient id="ctGema-lendaria" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd2b0"/><stop offset=".5" stop-color="#e2402a"/><stop offset="1" stop-color="#7a120c"/></linearGradient>';
    s += '<linearGradient id="ctGema-unica" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff8ff"/><stop offset=".33" stop-color="#ffd0ff"/><stop offset=".66" stop-color="#fff2a8"/><stop offset="1" stop-color="#9ab8ff"/></linearGradient>';
    // (o material de cada tabuleta: o fundo e o veio)
    const BASE = {
      grego: ['#c9733c', '#a5541f', '#8a4214'], egipcio: ['#e0b64a', '#c7942a', '#9a6a16'], nordico: ['#5d3a20', '#45291a', '#2c1a0e'],
      asteca: ['#b5262a', '#951c1f', '#6e1416'], romano: ['#f4efe6', '#ddd5c8', '#bdb3a4'], classico: ['#3a3048', '#2a2236', '#171222'],
    };
    for (const p of Object.keys(BASE)) { const c = BASE[p]; s += `<linearGradient id="ctBase-${p}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>`; const bg = stOf(p).bg; s += `<radialGradient id="ctBg-${p}" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${bg[0]}"/><stop offset=".65" stop-color="${bg[1]}"/><stop offset="1" stop-color="${bg[2]}"/></radialGradient>`; }
    for (const p of Object.keys(JANELA)) s += `<clipPath id="ctJan-${p}"><path d="${JANELA[p]}"/></clipPath>`;
    return `<svg id="ct-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>${s}</defs></svg>`;
  }
  A.defs = defs;
  // (as tintas na página, uma vez: as tabuletas as leem pelo nome)
  A.pronto = function (doc) { doc = doc || (typeof document !== 'undefined' ? document : null); if (!doc || doc.getElementById('ct-defs')) return; const d = doc.createElement('div'); d.innerHTML = defs(); doc.body.appendChild(d.firstChild); };

  // ------------------------------ a tabuleta inteira ------------------------------
  // a face: a moldura do povo, a janela com o fundo e a figura, o medalhão — o texto (o nome, a força, o poder) vem por cima, em HTML
  // (A.html), para ler com a letra do jogo no tamanho da tela. Guardada por chave: a mesma figura é a mesma corda
  const memo = new Map();
  A.face = function (id) {
    if (memo.has(id)) return memo.get(id);
    const c = C() && C().card(id); if (!c) return '';
    const P = stOf(c.povo); const art = ART[id]; const cena = art ? art[0] : 'ceu';
    let fig = ''; try { fig = art ? art[1](P) : ''; } catch (e) { fig = ''; if (G.modErr) G.modErr.Tabuletas = (G.modErr.Tabuletas || 0) + 1; }
    const s = `<svg class="ct-art" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${moldura(c.povo, c.rar)}<g clip-path="url(#ctJan-${c.povo})"><g transform="translate(25 28)">${fundo(c.povo, cena)}${fig}</g></g><path d="${JANELA[c.povo]}" fill="none" stroke="${{ grego: '#1c120b', egipcio: '#d9a62a', nordico: '#2a170b', asteca: '#140b06', romano: '#c9a24a', classico: '#c9a55a' }[c.povo]}" stroke-width="3"/>${medalha(c.povo)}</svg>`;
    memo.set(id, s); return s;
  };
  // o verso de cada povo: o emblema no meio, o ornamento em volta, o nome do jogo
  const VERSO = {
    grego: P => `${F.sol(P, 125, 160, 34, { n: 12, c1: '#1c120b', c2: '#1c120b', cor: '#1c120b' })}<circle cx="125" cy="160" r="22" fill="#d9864c"/>${g('translate(91 120) scale(.36)', F.coruja(P, '', { cor: '#1c120b' }))}`,
    egipcio: P => `<g transform="translate(125 160)"><path d="M-70 0C-50 -20 -24 -18 -14 -8H14C24 -18 50 -20 70 0C50 -6 30 2 16 6H-16C-30 2 -50 -6 -70 0Z" fill="#d9a62a" stroke="#22180e" stroke-width="1.4"/><circle r="16" fill="#a63a24" stroke="#22180e" stroke-width="1.4"/></g>${F.olho(P, 125, 214, 22, { iris: '#1f3d8a' })}`,
    nordico: P => { const tri = r => { const pts = [0, 1, 2].map(k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 3 + r; return [(Math.cos(a) * 44).toFixed(1), (Math.sin(a) * 44).toFixed(1)]; }); return `M${pts[0].join(' ')}L${pts[1].join(' ')}L${pts[2].join(' ')}Z`; };
      const d = [0, 0.7, 1.4].map(r => tri(r)).join(''); let runas = ''; const R = ['M0 -5V5M0 -5L4 -2M0 -1L4 2', 'M-2 -5V5M-2 -5L3 -2V5', 'M0 -5V5M0 -3L3 0L0 3', 'M-2 -5V5M-2 -5L3 -1L-2 3', 'M0 -5V5M-3 -2L3 2M3 -2L-3 2', 'M-3 -5L3 5M3 -5L-3 5', 'M0 -5V5M0 -5L-3 -2M0 -5L3 -2', 'M-3 5L0 -5L3 5'];
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 - Math.PI / 2; runas += `<path d="${R[i % R.length]}" fill="none" stroke="#e7cc97" stroke-width="1.3" stroke-linecap="round" transform="translate(${(Math.cos(a) * 74).toFixed(1)} ${(Math.sin(a) * 74).toFixed(1)}) rotate(${(a * 180 / Math.PI + 90).toFixed(0)})"/>`; }
      return `<g transform="translate(125 168)"><circle r="86" fill="#2a1a0e" stroke="#1c1008" stroke-width="3"/><circle r="64" fill="none" stroke="#e7cc97" stroke-width="1.4"/><circle r="84" fill="none" stroke="#e7cc97" stroke-width="1.4"/>${runas}<path d="${d}" fill="none" stroke="#1c1008" stroke-width="10" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e7cc97" stroke-width="4.4" stroke-linejoin="round"/></g>`; },
    asteca: P => `${F.sol(P, 125, 168, 44, { n: 16, raio: 1.7, c1: '#c2352a', c2: '#e9b53b', cor: '#e9b53b' })}<circle cx="125" cy="168" r="30" fill="#1aa196" stroke="#140b06" stroke-width="2.6"/><circle cx="125" cy="168" r="14" fill="#c2352a" stroke="#140b06" stroke-width="2.6"/>`,
    romano: P => `<g transform="translate(125 168)"><circle r="54" fill="#851710" stroke="#c9a24a" stroke-width="3"/>${[...Array(18)].map((_, i) => { const a = i / 18 * Math.PI * 2; return `<ellipse cx="${(Math.cos(a) * 46).toFixed(1)}" cy="${(Math.sin(a) * 46).toFixed(1)}" rx="7" ry="3" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${(Math.cos(a) * 46).toFixed(1)} ${(Math.sin(a) * 46).toFixed(1)})" fill="url(#ctOuroR)"/>`; }).join('')}<text y="9" text-anchor="middle" font-family="Cinzel, serif" font-weight="800" font-size="26" fill="#f6e2a0" letter-spacing="2">SPQR</text></g>`,
    classico: P => `${F.estrela(P, 125, 168, 54, '#c9a55a')}<circle cx="125" cy="168" r="30" fill="#191842" stroke="#e8c878" stroke-width="2"/>${F.ouroboros(stOf('classico'), 125, 168, 18, { cor: 'url(#ctOuroC)' })}`,
  };
  const mverso = new Map();
  A.verso = function (povo) {
    povo = ST[povo] ? povo : 'classico'; if (mverso.has(povo)) return mverso.get(povo); const P = stOf(povo);
    const inner = { grego: '#1c120b', egipcio: '#d9a62a', nordico: '#2a170b', asteca: '#140b06', romano: '#c9a24a', classico: '#c9a55a' }[povo];
    const fill = { grego: '#d9864c', egipcio: '#1c3576', nordico: '#3a2414', asteca: '#e6cf9e', romano: '#a32418', classico: '#191842' }[povo];
    const ink = { grego: '#1c120b', egipcio: '#e0b53e', nordico: '#e7cc97', asteca: '#140b06', romano: '#f6e2a0', classico: '#e8c878' }[povo];
    let pat = ''; if (povo === 'egipcio') for (let i = 0; i < 34; i++) pat += F.estrela(P, 30 + (i * 37 % 190), 30 + (i * 59 % 290), 3, '#e0b53e');
    if (povo === 'classico') for (let i = 0; i < 50; i++) pat += circ(26 + (i * 37 % 198), 26 + (i * 53 % 298), i % 6 ? 0.9 : 1.6, '#fff3d2', null, 'opacity=".7"');
    if (povo === 'asteca') { let d = ''; for (let y = 40; y < 320; y += 22) for (let x = 30; x < 220; x += 22) d += `M${x} ${y}h6v-6h6v12h-6`; pat += `<path d="${d}" fill="none" stroke="#c2352a" stroke-width="1.6" opacity=".35"/>`; }
    if (povo === 'grego') { let d = ''; for (let y = 60; y < 300; y += 60) { for (let x = 30; x < 220; x += 14) d += `M${x} ${y}V${y - 7}H${x + 10}V${y - 2}H${x + 5}V${y - 4.5}`; } pat += `<path d="${d}" fill="none" stroke="#1c120b" stroke-width="1.4" opacity=".35"/>`; }
    if (povo === 'nordico') pat += `<path d="M25 40H225M25 320H225" stroke="#1c1008" stroke-width="2"/>`;
    if (povo === 'romano') pat += `<rect x="40" y="40" width="170" height="270" fill="none" stroke="#c9a24a" stroke-width="1.4"/>`;
    const s = `<svg class="ct-art" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="${W}" height="${Hh}" rx="14" fill="url(#ctBase-${povo})"/>${friso(povo)}<rect x="12" y="12" width="${W - 24}" height="${Hh - 24}" rx="7" fill="${fill}" stroke="${inner}" stroke-width="2"/>${pat}${VERSO[povo](P)}<text x="125" y="290" text-anchor="middle" font-family="Cinzel, serif" font-weight="800" font-size="19" letter-spacing="4" fill="${ink}">TABULETAS</text></svg>`;
    mverso.set(povo, s); return s;
  };

  // ------------------------------ a tabuleta em HTML (a tela e a folha leem esta) ------------------------------
  // o (opções): { cls — classes a mais —, f — a força agora, se a rodada a mudou —, mini — sem o texto do poder (a mão no celular) }
  A.html = function (id, o) {
    o = o || {}; const c = C() && C().card(id); if (!c) return '';
    const f0 = Number.isFinite(o.f) ? o.f : c.f; const ch = f0 > c.f ? ' up' : f0 < c.f ? ' down' : '';
    const pw = c.p ? `<div class="ct-pw">${A.icone(c.p, 'ct-pi')}<span><b>${esc(c.pnome)}${c.n > 1 || (c.n && c.p !== 'compra' && c.p !== 'colhe') ? ' ' + c.n : ''}:</b> ${esc(c.txt)}</span></div>` : '<div class="ct-pw none"><span>Sem poder: só a força.</span></div>';
    return `<div class="ct-card ct-p-${c.povo} ct-r-${c.rar}${o.cls ? ' ' + o.cls : ''}" data-id="${esc(id)}">${A.face(id)}<div class="ct-foil"></div><div class="ct-f${ch}">${f0}</div><div class="ct-tipo" title="${esc(C().TIPO_NOME[c.tipo])}">${A.icone(c.tipo, 'ct-ti')}</div><div class="ct-nome" style="--nf:${c.nome.length <= 10 ? 7.2 : c.nome.length <= 13 ? 6.3 : c.nome.length <= 16 ? 5.4 : 4.7}cqw"><span>${esc(c.nome)}</span></div>${pw}<div class="ct-mito">${esc(c.mito)}</div><div class="ct-rar">${esc(C().RAR_NOME[c.rar])}</div></div>`;
  };
  A.htmlVerso = (povo, cls) => `<div class="ct-card ct-verso ct-p-${ST[povo] ? povo : 'classico'}${cls ? ' ' + cls : ''}">${A.verso(povo)}</div>`;
  // (para as provas: quais tabuletas não têm a sua figura, ou cuja figura falha)
  A.check = function () { const out = []; const D = C() ? C().DECKS : {}; for (const p of Object.keys(D)) for (const c of D[p]) { const a = ART[c.id]; if (!a) { out.push(c.id + ': sem figura'); continue; } let s = ''; try { s = a[1](stOf(p)); } catch (e) { out.push(c.id + ': ' + e.message); continue; } if (s.length < 200) out.push(c.id + ': figura vazia'); } return out; };
})(window.G);
