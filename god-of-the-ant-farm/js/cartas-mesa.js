'use strict';
// ============================================================
//  As Tabuletas no mundo (a quarta onda da taverna, T5 — D-864
//  a D-869): quem joga, onde, com que baralho e por quanto. O
//  resultado é do mundo (D-669): cada partida é resolvida no
//  passo do mundo, pela regra pura do cartas.js e pelo G.hash da
//  partida, da rodada e de quem joga — nunca pelo que só se vê;
//  a tela só mostra o que o mundo decidiu.
//   - Os fregueses jogam entre si (o ato `jogo-cartas`): à mesa
//     da taverna, quem é de jogar (a índole: o expansivo, o que
//     arrisca, o ambicioso), com o baralho da casa — o do povo, no
//     material que ele teve (G.Inv: o kit do lugar) —, e a aposta
//     de cada um no pote (o lugar 'k:' do livro), pela bolsa da
//     casa; quem vence leva o pote, pelo livro.
//   - O corpo do deus pede pelas mãos (G.Possess.apply): desafia
//     quem está à mesa, escolhe a aposta, joga, dobra, desiste —
//     cada pedido feito pelo mundo no passo dele.
//   - O trapaceiro (D-866): quem tem pouca honestidade (a índole)
//     esconde uma tabuleta na manga (o ato `trapaca`); quem está
//     atento à mesa percebe, e vem a confusão (`trapaca-pega`): a
//     partida acaba, o pote vai para quem foi enganado, o laço
//     quebra e a fama cai. O corpo também pode tentar, com o risco.
//   - O torneio da noite de festa (D-867): a porta
//     G.Cartas.torneio(b, o), que a festa da taverna chama; cada
//     vitória à mesa naquela noite conta, a inscrição vai ao pote
//     do torneio, e no fechamento o campeão leva o prêmio.
//  Para quem desenha: G.Cartas.atMesa(b, mesa) — o que está na mesa
//  (puro); G.Cartas.ato(v), o que a pessoa faz no jogo.
// ============================================================
(function (G) {
  const C = G.Cartas, A = G.Act, D = G.Depot, E = G.Eco; if (!C || !A || !D || !E) return;
  const S_ = () => G.S; const EPS = 1e-6;
  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100, r4 = x => Math.round(x * 1e4) / 1e4;
  const ax = (v, k) => (G.Indole ? G.Indole.ax(v, k) : 50) / 99;
  const H = C.hash;
  const T = () => G.Taverna;
  // os números do mundo (D-865)
  C.OLHA = 12;        // (segundos entre duas olhadas de uma mesa: começa ali um jogo?)
  C.JOGO_P = 0.5;     // (a chance, pelo hash da mesa e da olhada, de quem quer jogar começar)
  C.JOGA = 0.5;       // (quem é de jogar: o índice da índole, de 0 a 1)
  C.RODADA_T = 2.6;   // (segundos do mundo que uma rodada dos fregueses leva — escolher, virar, comentar —: a partida inteira, o tempo de uma caneca, como os ossinhos)
  C.APOSTA = 0.1;     // (a aposta de cada um, na moeda do povo; o ousado põe até o dobro)
  C.HON = 0.32;       // (abaixo disso de honestidade, quem joga pode esconder uma na manga)
  C.FIM_T = 6;        // (segundos que a mesa mostra o fim)
  C.CONFUSAO = 7;     // (segundos da confusão de um trapaceiro pego)
  C.INSCRICAO = 0.1;  // (a inscrição no torneio da festa)
  C.MAX = 4;          // (jogos ao mesmo tempo numa taverna)

  // ------------------------------ o registro (S.cartas, no save) ------------------------------
  // j: as partidas, pelo id — { id, b, op, g, quem: [a, b], corpo (o lado do corpo, −1 nenhum), s (o estado da regra), aposta, pago:
  // [n, n], pote (o que está no lugar 'k:'), prox (a próxima rodada dos fregueses), fase ('jogo' | 'fim'), fimT, trap, conf, tor };
  // tor: os torneios da noite, pela taverna — { id, b, dia, pote, pagos: { ref: n }, vit: { id: n }, gl: { id: n } }; n: as contas
  const st = () => { const S = S_(); if (!S.cartas || typeof S.cartas !== 'object') S.cartas = { j: {}, tor: {}, n: {} }; return S.cartas; };
  C.estado = () => (S_() && S_().cartas) || null;
  const conta = (k, n) => { const c = st().n; c[k] = (c[k] || 0) + (n || 1); };
  const jogos = () => { const J = st().j; return Object.keys(J).map(k => J[k]).sort((a, b) => a.id - b.id); };
  const jogoDe = id => { const s = S_() && S_().cartas; if (!s) return null; return s.j[id] || null; };
  const torPorId = id => { const s = S_() && S_().cartas; if (!s) return null; for (const k of Object.keys(s.tor)) if (s.tor[k].id === id) return s.tor[k]; return null; };
  C.jogo = id => jogoDe(id);
  // (onde está cada um: a partida viva de uma pessoa)
  C.de = function (v) { if (!v) return null; for (const j of jogos()) if (j.quem.includes(v.id) && (j.fase === 'jogo' || (S_().clock - (j.fimT || 0) < C.FIM_T))) return j; return null; };
  C.vivoDe = function (v) { if (!v) return null; for (const j of jogos()) if (j.fase === 'jogo' && j.quem.includes(v.id)) return j; return null; };

  // ------------------------------ o pote: um lugar do livro ('k:', o jogo ou o torneio) ------------------------------
  // só moedas; quem o tem é o povo da taverna; o que entra e sai dele vai pelo G.Depot, com a causa — a aposta, o pote ganho, o pote
  // devolvido, a inscrição e o prêmio do torneio (regra 392)
  const potOf = id => jogoDe(id) || torPorId(id);
  D.addKind('k', {
    obj: id => potOf(id),
    get: (o, k) => (k === 'moedas' ? o.pote || 0 : 0),
    room: (o, k) => (k === 'moedas' ? Infinity : 0),
    take: (o, k, n) => { o.pote = r4((o.pote || 0) - n); },
    put: (o, rec) => { o.pote = r4((o.pote || 0) + rec.n); },
    list: o => (o.pote > EPS ? { moedas: o.pote } : {}),
    owner: o => { const b = S_().buildings.get(o.b); return { fac: b ? G.Village.facOfSet(b.set) : 0, bld: o.b }; },
    all: () => { const s = S_() && S_().cartas; if (!s) return []; return Object.keys(s.j).map(k => s.j[k]).concat(Object.keys(s.tor).map(k => s.tor[k])); },
  });
  const moeda = b => !!b && E.coinage(G.Village.facOfSet(b.set));
  const tem = (v, n) => !!v && D.get(E.coinRef(v), 'moedas') + EPS >= n;
  const dinheiro = (b, n) => (G.Falas ? G.Falas.price((G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ || 'classico', n) : String(n));
  C.preco = (b, n) => dinheiro(b, n);
  // (a aposta de um lado entra no pote, pelo livro)
  function poe(j, i, n) { if (!(n > EPS)) return true; const v = S_().villagers.get(j.quem[i]); if (!v || !tem(v, n)) return false; const r = D.move(E.coinRef(v), 'k:' + j.id, 'moedas', n, { code: 'aposta', by: v.id }); if (!r.ok) return false; j.pago[i] = r4(j.pago[i] + r.n); conta('apostado', r.n); return true; }
  // (o pote sai: tudo para quem venceu, ou cada um recebe de volta o que pôs)
  function paga(j) {
    if (!(j.pote > EPS)) return; const w = j.s.fim ? j.s.fim.w : -1; const S = S_();
    if (w >= 0) { const v = S.villagers.get(j.quem[w]); if (v) { const r = D.move('k:' + j.id, E.coinRef(v), 'moedas', j.pote, { code: 'pote', by: v.id }); if (r.ok) conta('ganho', r.n); } }
    for (const i of [0, 1]) { if (!(j.pote > EPS)) break; const v = S.villagers.get(j.quem[i]); const n = Math.min(j.pote, j.pago[i]); if (v && n > EPS) D.move('k:' + j.id, E.coinRef(v), 'moedas', n, { code: 'pote-volta', by: v.id }); }
    // (quem pôs já não existe — morreu no meio —: o que sobra vai ao armazém do povo da taverna, pelo livro)
    if (j.pote > EPS) { const b = S.buildings.get(j.b); const fid = b ? G.Village.facOfSet(b.set) : 0; if (fid && G.Fac.get(fid)) D.move('k:' + j.id, 'f:' + fid, 'moedas', j.pote, { code: 'pote-volta' }); }
  }

  // ------------------------------ o baralho de verdade (D-868) ------------------------------
  // o baralho da casa é o do povo dela, no material que ele teve (o kit do lugar, G.Inv: o papiro do Egito, o amate do asteca, a cera
  // do romano, o barro grego, a madeira do norte — ou a madeira de sempre); o de quem joga, o que o corpo leva na mochila
  const It = () => G.Itens;
  C.baralhoCasa = function (b) { const fid = b ? G.Village.facOfSet(b.set) : 0; if (!fid || !G.Inv || !G.Inv.madeBy) return null; return G.Inv.madeBy('baralho', fid); };
  C.baralhoDe = function (v) { if (!v || !G.Inv || !G.Inv.bag) return null; const bag = G.Inv.bag(v); for (const k of Object.keys(bag).sort()) if (bag[k] >= 1 && k.split('.')[0] === 'baralho') return k; return null; };
  // (o povo das tabuletas de um baralho: o do povo de quem o fez — o da casa, o povo da taverna; o do corpo, o povo do corpo)
  const civDe = v => (G.Fac.civOfV ? G.Fac.civOfV(v) : v.civ) || 'classico';
  const civOk = c => (C.DECKS[c] ? c : 'classico');

  // ------------------------------ a índole de quem joga (D-864) ------------------------------
  // quem é de jogar: o expansivo, o que não se prende às regras, o ambicioso, o curioso; o ousado arrisca — gasta os deuses cedo, dobra,
  // aceita —; o honesto não trapaceia; o atento percebe a manga (e quem bebeu, menos)
  C.jogador = v => 0.38 * ax(v, 'ext') + 0.24 * (1 - ax(v, 'con')) + 0.22 * ax(v, 'amb') + 0.16 * ax(v, 'abe');
  C.ousado = v => Math.max(0, Math.min(1, 0.3 * (1 - ax(v, 'neu')) + 0.26 * ax(v, 'ext') + 0.24 * (1 - ax(v, 'con')) + 0.2 * ax(v, 'amb')));
  // (a bebida no juízo: o grau do G.Ebrio — alegre, bêbado, tonto, desmaiado: 0 a 4 —, a T2)
  const ebrio = v => (v && G.Ebrio && G.Ebrio.grau ? G.Ebrio.grau(v) / 4 : 0);
  C.atento = v => Math.max(0, Math.min(1, 0.14 + 0.5 * ax(v, 'con') + 0.18 * ax(v, 'abe') - 0.55 * ebrio(v)));
  const indDe = v => ({ ousado: v ? C.ousado(v) : 0.5 });

  // ------------------------------ uma partida começa ------------------------------
  function nova(b, op, g, a, o, aposta, corpo, tor) {
    const S = S_(); const id = S.nextId++;
    const civ = [civOk(corpo === 0 && C.baralhoDe(a) ? civDe(a) : civDe(a)), civOk(civDe(o))];
    const s = C.nova({ id, seed: Math.imul(id, 2654435761 | 0) ^ Math.imul(op ? op.id : 1, 97), civ, quem: [a.id, o.id], aposta });
    const j = { id, b: b.id, op: op ? op.id : 0, g: String(g), quem: [a.id, o.id], corpo, s, aposta, pago: [0, 0], pote: 0, t0: r1(S.clock), prox: r1(S.clock + C.RODADA_T), fase: 'jogo', fimT: 0, trap: null, conf: null, tor: tor ? tor.id : 0 };
    st().j[id] = j;
    if (aposta > EPS && !(poe(j, 0, aposta) && poe(j, 1, aposta))) { j.s.fim = { w: -1, por: 'sem-moeda' }; fecha(j); return null; }
    conta('jogos'); if (corpo >= 0) conta('corpo');
    if (tor) { for (const v of [a, o]) inscreve(tor, v); }
    return j;
  }
  // (o fim: o pote pago, a mesa mostra o fim por uns segundos; o laço de quem jogou junto, a vitória no torneio)
  function fecha(j) {
    if (j.fase === 'fim') return; const S = S_(); j.fase = 'fim'; j.fimT = r1(S.clock); if (!j.s.fim) j.s.fim = { w: -1, por: 'fechou' };
    paga(j);
    const a = S.villagers.get(j.quem[0]), o = S.villagers.get(j.quem[1]);
    if (a && o && G.Lacos && j.s.fim.por !== 'trapaca' && j.s.hist.length >= 2) G.Lacos.ato(a, o, 'jogo');
    if (j.tor && j.s.fim.w >= 0) { const t = torPorId(j.tor); if (t) { const w = S.villagers.get(j.quem[j.s.fim.w]); if (w) { t.vit[w.id] = (t.vit[w.id] || 0) + 1; t.gl[w.id] = (t.gl[w.id] || 0) + j.s.p[j.s.fim.w].gl; } } }
    conta('fim-' + j.s.fim.por);
  }

  // ------------------------------ a rodada dos fregueses ------------------------------
  // as duas inteligências escolhem (a que é vista escolhe antes), quem quer dobra no começo — o outro aceita ou desiste —, o
  // trapaceiro talvez esconda uma na manga, e a rodada se resolve; tudo pelo hash e pela índole, no passo do mundo
  function rodada(j) {
    const S = S_(); const s = j.s; const P = j.quem.map(id => S.villagers.get(id)); const ind = P.map(indDe);
    C.abre(s);
    for (const i of [0, 1]) { if (s.dobra || s.fim) break; if (C.iaDobra(s, i, ind[i]) && tem(P[i], j.aposta * s.x)) dobra(j, i, C.iaAceita(s, 1 - i, ind[1 - i])); }
    if (s.fim) return fecha(j);
    for (let k = 0; k < 2; k++) { const i = C.vez(s); if (i < 0) break; C.joga(s, i, C.ia(s, i, ind[i])); }
    for (const i of [0, 1]) if (!s.fim && trapaceia(j, i, P)) return fecha(j);
    conta('rodadas'); C.resolve(s);
    if (s.fim) fecha(j); else j.prox = r1(S.clock + C.RODADA_T);
  }
  // (dobrar: quem dobra e quem aceita põem cada um a aposta de agora outra vez no pote; quem não aceita — ou não tem com que — desiste)
  function dobra(j, i, aceita) {
    const s = j.s; if (!C.dobra(s, i)) return false; const n = j.aposta * s.x;
    const S = S_(); const o = S.villagers.get(j.quem[1 - i]);
    const ok = aceita && tem(o, n) && tem(S.villagers.get(j.quem[i]), n) && poe(j, i, n) && poe(j, 1 - i, n);
    C.responde(s, 1 - i, ok); conta(ok ? 'dobras' : 'recusas'); return ok;
  }
  // a manga (D-866): quem tem pouca honestidade, perdendo ou numa rodada grande, uma vez na partida — pelo hash —, troca a tabuleta
  // pela melhor do monte (o ato `trapaca`); quem olha a mesa — o outro, e quem está sentado com eles — percebe pelo que tem de atento
  // (e menos, bebido), cada um pelo hash dele: pego, a confusão (`trapaca-pega`), e a partida acaba com o pote para o enganado
  function trapaceia(j, i, P) {
    const s = j.s; const v = P[i]; if (!v || j.corpo === i || j.trap) return false;
    const hon = ax(v, 'hon'); if (hon >= C.HON) return false;
    const q = s.p[i], o = s.p[1 - i]; const motivo = q.gl < o.gl || C.OF[s.r] >= 3; if (!motivo) return false;
    if (H(j.id, s.r * 7 + i, 4127) >= (C.HON - hon) / C.HON * 0.7) return false;
    const tr = C.manga(s, i); if (!tr) return false;
    j.trap = { lado: i, r: s.r, de: tr.de, por: tr.por, pega: 0, t: r1(S_().clock) }; conta('trapacas');
    const quem = olhos(j, 1 - i); let pega = null;
    for (const w of quem) if (H(j.id, s.r * 13 + w.id, 6151) < C.atento(w)) { pega = w; break; }
    if (!pega) return false;
    return pego(j, i, pega);
  }
  // (quem olha a mesa: o outro jogador primeiro, depois quem está sentado à mesma mesa, acordado, por id)
  function olhos(j, lado) {
    const S = S_(); const out = []; const o = S.villagers.get(j.quem[lado]); if (o) out.push(o);
    const op = A.get(j.op); const d = op && op.data; if (!d || !d.mesa) return out;
    for (const id of Object.keys(d.mesa).map(Number).sort((a, b) => a - b)) { if (j.quem.includes(id)) continue; const m = d.mesa[id]; if (!m || String(m.g) !== j.g || m.zz || m.body) continue; const w = S.villagers.get(id); if (w && w.age >= 10) out.push(w); }
    return out;
  }
  function pego(j, i, w) {
    const S = S_(); const s = j.s; const v = S.villagers.get(j.quem[i]); const vit = S.villagers.get(j.quem[1 - i]);
    j.trap.pega = w.id; j.conf = { de: v ? v.id : 0, por: w.id, vit: vit ? vit.id : 0, ate: r1(S.clock + C.CONFUSAO) };
    s.fim = { w: 1 - i, por: 'trapaca' }; s.hist.push({ r: s.r, trapaca: i, pega: w.id });
    if (v && vit && G.Lacos) { G.Lacos.ato(v, vit, 'trapaca'); if (w !== vit) G.Lacos.ato(v, w, 'trapaca'); }
    if (v && G.Fama && G.Fama.feito) G.Fama.feito(v, 'mentiu');
    if (v && G.Falas && G.Falas.say) G.Falas.say(w, 'cartas_trapaca', { nome: v.name });
    conta('pegos'); return true;
  }

  // ------------------------------ as mesas da taverna (o passo do mundo, uma vez por segundo) ------------------------------
  // quem quer jogar a cada olhada de uma mesa: sentado (esperando ou entre as rodadas), de mãos livres, acordado, sem briga, fora dos
  // ossinhos, com idade, de jogar pela índole; os dois de mais vontade (o id no empate), se o hash da mesa e da olhada deixar
  const gk = g => { const t = String(g); let h = 7; for (let i = 0; i < t.length; i++) h = (Math.imul(h, 31) + t.charCodeAt(i)) | 0; return h; };
  function mesas(op, b) {
    const S = S_(); const d = op.data; if (!d || !d.mesa || !T() || !T().aberta(b) || d.fecha) return;
    if (!C.baralhoCasa(b)) return; // (sem baralho na casa, nenhuma tabuleta)
    const vivos = jogos().filter(j => j.op === op.id && j.fase === 'jogo'); if (vivos.length >= C.MAX) return;
    const tor = torneioDe(b); const olha = tor ? C.OLHA * 0.6 : C.OLHA; const k = Math.floor(S.clock / olha);
    const grupos = new Map();
    for (const id of Object.keys(d.mesa).map(Number).sort((a, c) => a - c)) {
      const m = d.mesa[id]; if (!m || !m.g || m.body || m.corpo || m.zz || !(m.st === 2 || m.st === 5)) continue;
      const v = S.villagers.get(id); if (!v || !v.task || v.task.type !== 'tavern' || v.task.op !== op.id || v.age < 14 || (v.carry && v.carry.n > EPS)) continue;
      if (T().brawling && T().brawling(v)) continue; if (C.vivoDe(v)) continue;
      // (com tempo para a partida antes da hora de ir para casa: a partida inteira dos fregueses, em fração do dia)
      if (T().leaveOf && S.time > T().leaveOf(v, b) - C.RODADA_T * (C.RODADAS + 1) / G.DAY_LEN) continue;
      const jo = d.jogo && d.jogo[m.g]; if (jo && jo.quem && jo.quem.includes(id)) continue;
      const sc = C.jogador(v); if (sc < (tor ? C.JOGA - 0.08 : C.JOGA)) continue;
      let L = grupos.get(String(m.g)); if (!L) grupos.set(String(m.g), L = []); L.push([v, sc]);
    }
    const look = st().olhou || (st().olhou = {});
    for (const [g, L] of [...grupos].sort((a, c) => (a[0] < c[0] ? -1 : a[0] > c[0] ? 1 : 0))) {
      if (L.length < 2 || vivos.some(j => j.g === g)) continue;
      const key = op.id + ':' + g; if (look[key] === k) continue; look[key] = k;
      if (H(op.id, gk(g), k * 31 + 7) >= (tor ? C.JOGO_P + 0.25 : C.JOGO_P)) continue;
      L.sort((x, y) => y[1] - x[1] || x[0].id - y[0].id); const a = L[0][0], o = L[1][0];
      // (a aposta: a de quem arrisca menos dos dois, entre uma e duas vezes a de sempre; sem moeda no povo, ou sem com que, a seco; no
      // torneio, a inscrição é a aposta)
      let ap = 0; if (moeda(b) && !tor) { ap = r2(C.APOSTA * (1 + Math.min(C.ousado(a), C.ousado(o)))); if (!tem(a, ap) || !tem(o, ap)) ap = tem(a, C.APOSTA) && tem(o, C.APOSTA) ? C.APOSTA : 0; }
      const j = nova(b, op, g, a, o, ap, -1, tor); if (j) vivos.push(j);
      if (vivos.length >= C.MAX) break;
    }
    // (uma olhada esquecida de uma mesa de outro dia não pesa: a lista guarda só as das tavernas de hoje)
    if (Object.keys(look).length > 200) for (const kk of Object.keys(look)) if (!A.get(+kk.split(':')[0]) || !A.live(A.get(+kk.split(':')[0]))) delete look[kk];
  }
  // (a partida ainda tem onde ser jogada: a taverna aberta, os dois à mesa — o corpo sentado na taverna; o freguês na sua mesa)
  function valida(j) {
    const S = S_(); const op = A.get(j.op); const b = S.buildings.get(j.b);
    if (!op || !A.live(op) || !b || !T() || !T().aberta(b)) return 'fechou';
    const d = op.data;
    for (const i of [0, 1]) { const v = S.villagers.get(j.quem[i]); if (!v) return 'abandono';
      if (j.corpo === i) { if (!A.isBody(v) || v.inside !== b.id) return 'desiste-corpo'; continue; }
      const m = d.mesa[v.id]; if (!m || m.st < 2 || m.st === 6 || m.st === 9 || !v.task || v.task.type !== 'tavern' || v.task.op !== op.id) return 'abandono'; }
    return null;
  }
  C.passo = function () {
    const S = S_(); if (!S) return;
    for (const j of jogos()) {
      if (j.fase === 'fim') { if (S.clock - j.fimT >= C.FIM_T && !(j.pote > EPS)) delete st().j[j.id]; else if (j.pote > EPS) paga(j); continue; }
      const why = valida(j);
      if (why) { if (why === 'desiste-corpo') C.desiste(j.s, j.corpo); else j.s.fim = { w: -1, por: why }; fecha(j); continue; }
      if (j.corpo < 0 && S.clock >= j.prox) rodada(j);
    }
    for (const op of A.all()) { if (op.def !== 'taverna' || !A.live(op)) continue; const b = S.buildings.get(op.at); if (b) mesas(op, b); }
    for (const k of Object.keys(st().tor)) fimTorneio(st().tor[k]);
    if (st().conf) delete st().conf;
  };
  G.worldHooks.push(() => { if (A.hooks && A.hooks.tick && !A.hooks.tick.includes(C.passo)) A.hooks.tick.push(C.passo); });
  if (A.hooks && A.hooks.tick && !A.hooks.tick.includes(C.passo)) A.hooks.tick.push(C.passo);

  // ------------------------------ o torneio da noite de festa (D-867) ------------------------------
  // a porta que a festa da taverna chama (a T1, pelo b.festa): abre o torneio desta noite, com o prêmio que a casa põe (o: { premio,
  // de: quem paga — pelo livro, da bolsa dele }); cada partida da noite naquela taverna é do torneio — a inscrição de cada jogador vai
  // ao pote dele, uma vez —, e cada vitória conta; no fechamento, quem mais venceu (a glória no empate, o id depois) leva o pote
  C.torneio = function (b, o) {
    if (!G.inSim || !b || b.type !== 'taverna') return null; const S = S_(); const T0 = st().tor;
    let t = T0[b.id]; if (t && t.dia === S.day) return t;
    if (t) fimTorneio(t, true);
    t = T0[b.id] = { id: S.nextId++, b: b.id, dia: S.day, pote: 0, pagos: {}, vit: {}, gl: {}, insc: [] };
    o = o || {}; const de = o.de ? (typeof o.de === 'object' ? o.de : S.villagers.get(o.de)) : null;
    if (de && o.premio > EPS && moeda(b) && tem(de, o.premio)) { const ref = E.coinRef(de); if (D.move(ref, 'k:' + t.id, 'moedas', o.premio, { code: 'torneio', by: de.id }).ok) t.pagos[ref] = r4((t.pagos[ref] || 0) + o.premio); }
    conta('torneios'); return t;
  };
  const torneioDe = b => { const t = st().tor[b.id]; return t && t.dia === S_().day ? t : null; };
  C.torneioDe = b => { const s = S_() && S_().cartas; const t = s && b && s.tor[b.id]; return t && t.dia === S_().day ? t : null; };
  function inscreve(t, v) {
    if (t.insc.includes(v.id)) return; t.insc.push(v.id); const b = S_().buildings.get(t.b);
    if (moeda(b) && tem(v, C.INSCRICAO)) { const ref = E.coinRef(v); if (D.move(ref, 'k:' + t.id, 'moedas', C.INSCRICAO, { code: 'torneio', by: v.id }).ok) t.pagos[ref] = r4((t.pagos[ref] || 0) + C.INSCRICAO); }
  }
  function fimTorneio(t, ja) {
    const S = S_(); const b = S.buildings.get(t.b); const aberto = b && T() && T().aberta(b) && t.dia === S.day;
    if (aberto && !ja) return; if (jogos().some(j => j.tor === t.id && j.fase === 'jogo') && !ja) return;
    const ids = Object.keys(t.vit).map(Number).sort((x, y) => (t.vit[y] - t.vit[x]) || ((t.gl[y] || 0) - (t.gl[x] || 0)) || x - y);
    const w = ids.length ? S.villagers.get(ids[0]) : null;
    if (w && t.pote > EPS) { D.move('k:' + t.id, E.coinRef(w), 'moedas', t.pote, { code: 'torneio', by: w.id }); if (G.Fama && G.Fama.feito) G.Fama.feito(w, 'nome'); conta('campeoes');
      if (b && G.Village && G.Village.log) G.Village.log(`${w.name} venceu o torneio de tabuletas da festa${S.settlements.get(b.set) ? ' em ' + S.settlements.get(b.set).name : ''}, com ${t.vit[w.id]} ${t.vit[w.id] === 1 ? 'vitória' : 'vitórias'}.`, 'gold', b.x, b.y); }
    else if (w) conta('campeoes');
    // (sem campeão — ninguém venceu —: cada um recebe de volta o que pôs)
    for (const ref of Object.keys(t.pagos).sort()) { if (!(t.pote > EPS)) break; const n = Math.min(t.pote, t.pagos[ref]); if (n > EPS && D.exists(ref)) D.move('k:' + t.id, ref, 'moedas', n, { code: 'torneio' }); }
    if (t.pote > EPS && b) { const fid = G.Village.facOfSet(b.set); if (fid && G.Fac.get(fid)) D.move('k:' + t.id, 'f:' + fid, 'moedas', t.pote, { code: 'torneio' }); }
    t.campeao = w ? w.id : 0; if (!(t.pote > EPS)) delete st().tor[t.b];
  }

  // ------------------------------ o corpo à mesa (pelas mãos: G.Possess.apply, D-869) ------------------------------
  // o que o corpo pode agora (só lê: a tela pergunta): sentado a uma mesa de taverna aberta, com o baralho da casa (ou o seu), e alguém à
  // mesa de jogar e livre; a aposta que se pode
  const sentado = v => { const s = T() && T().corpo ? T().corpo(v) : null; return s && s.open && s.seat ? s : null; };
  function quemJoga(v, s, oId) {
    const S = S_(); const op = A.get(s.op); const d = op && op.data; const me = d && d.mesa[v.id]; if (!me || !me.g) return [];
    const out = [];
    for (const id of Object.keys(d.mesa).map(Number).sort((a, b) => a - b)) { if (id === v.id) continue; const m = d.mesa[id]; if (!m || String(m.g) !== String(me.g) || m.body || m.corpo || m.zz || m.st < 2 || m.st === 6 || m.st === 9) continue; const o = S.villagers.get(id); if (!o || o.age < 14 || C.vivoDe(o)) continue; if (oId && o.id !== oId) continue; out.push(o); }
    // (quem mais gosta de jogar primeiro; e quem gosta do corpo)
    const quer = o => C.jogador(o) + afeto(o, v) * 0.002;
    return out.sort((a, b) => quer(b) - quer(a) || a.id - b.id);
  }
  // (aceita jogar com o corpo: quem é de jogar, ou gosta dele; pela aposta, quem a pode pagar e não arrisca menos do que ela pede)
  // (o afeto de um pelo outro — o laço, G.Lacos.sente —, 0 sem laço)
  const afeto = (o, v) => { const t = G.Lacos && G.Lacos.sente ? G.Lacos.sente(o, v) : null; return t && Number.isFinite(t.afeto) ? t.afeto : 0; };
  function aceita(o, v, ap) { if (C.jogador(o) < C.JOGA - 0.18 && afeto(o, v) <= 20) return 'não é de jogo'; if (ap > EPS && !tem(o, ap)) return 'não tem com que apostar'; if (ap > C.APOSTA * (1.2 + 2 * C.ousado(o))) return 'acha a aposta alta demais'; return null; }
  C.podeCorpo = function (v, oId) {
    const s = sentado(v); if (!s) return { ok: false, why: 'Sente-se a uma mesa da taverna.' };
    const b = S_().buildings.get(s.b); const casa = C.baralhoCasa(b), meu = C.baralhoDe(v);
    if (!casa && !meu) return { ok: false, why: 'Não há baralho aqui.' };
    const j = C.vivoDe(v); if (j) return { ok: true, jogo: j.id, b: s.b };
    const L = quemJoga(v, s, oId); if (!L.length) return { ok: false, why: oId ? 'Já está noutro jogo, ou não está à sua mesa.' : 'Ninguém à sua mesa para jogar.' };
    const moedas = moeda(b); const tenho = moedas ? D.get(E.coinRef(v), 'moedas') : 0;
    const apostas = moedas ? [0, C.APOSTA, r2(C.APOSTA * 2), r2(C.APOSTA * 4)].filter(n => n <= tenho + EPS) : [0];
    return { ok: true, o: L[0].id, todos: L.map(o => o.id), apostas, moeda: moedas, baralho: meu || casa, b: s.b };
  };
  const bodyOk = v => !!G.inSim && !!v && A.isBody(v);
  C.desafia = function (v, oId, ap) {
    if (!bodyOk(v)) return { ok: false, why: '' }; const c = C.podeCorpo(v, oId); if (!c.ok) return c; if (c.jogo) return { ok: true, jogo: c.jogo };
    const S = S_(); const o = S.villagers.get(c.o); ap = Math.max(0, +ap || 0); if (!c.moeda) ap = 0;
    if (ap > EPS && !tem(v, ap)) return { ok: false, why: 'Falta dinheiro para essa aposta.' };
    if (ap > EPS && E.coinRef(v) === E.coinRef(o)) ap = 0; // (da mesma casa: joga-se a seco)
    const nao = aceita(o, v, ap); const nome = G.Possess.knows.call(v, o);
    if (G.Possess.dealt) G.Possess.dealt({ to: o.id });
    if (nao) { if (G.Falas && G.Falas.say) G.Falas.say(o, 'cartas_nao', {}); return { ok: false, why: `${G.cap(nome)} ${nao}.` }; }
    const s = sentado(v); const op = A.get(s.op); const b = S.buildings.get(s.b); const me = op.data.mesa[v.id];
    const j = nova(b, op, me.g, v, o, ap, 0, torneioDe(b)); if (!j) return { ok: false, why: 'Não deu: falta dinheiro.' };
    abreCorpo(j); if (G.Falas && G.Falas.say) G.Falas.say(o, 'cartas_sim', {});
    return { ok: true, jogo: j.id, msg: `${G.cap(nome)} aceita${ap > EPS ? `: ${dinheiro(b, ap)} cada um no pote` : ', a seco'}.` };
  };
  // (a rodada abre para o corpo: a compra; quem joga com ele pode pedir para dobrar; e, se é ele quem mostra primeiro, já escolhe)
  function abreCorpo(j) {
    const s = j.s; if (s.fim) return; const S = S_(); const ai = 1 - j.corpo; const o = S.villagers.get(j.quem[ai]); const ind = indDe(o);
    C.abre(s);
    if (!s.dobra && C.iaDobra(s, ai, ind) && tem(o, j.aposta * s.x) && tem(S.villagers.get(j.quem[j.corpo]), j.aposta * s.x)) C.dobra(s, ai);
    if (!s.dobra && s.vis === ai && !s.lance[ai]) C.joga(s, ai, C.ia(s, ai, ind));
  }
  const meu = (v, gid) => { const j = jogoDe(gid); return j && j.fase === 'jogo' && j.corpo >= 0 && j.quem[j.corpo] === v.id ? j : null; };
  // o lance do corpo: a tabuleta escolhida (e, se pediu, a da manga — o risco é dele); quem joga com ele escolhe a sua (sem ver a do
  // corpo, a não ser pela visão), e a rodada se resolve. Devolve o registro da rodada para a tela mostrar
  C.lance = function (v, gid, id, manga) {
    if (!bodyOk(v)) return { ok: false, why: '' }; const j = meu(v, gid); if (!j) return { ok: false, why: 'O jogo acabou.' };
    const s = j.s; const me = j.corpo, ai = 1 - me; const S = S_(); const o = S.villagers.get(j.quem[ai]);
    if (s.dobra) return { ok: false, why: 'Responda primeiro ao pedido de dobrar.' };
    if (!C.joga(s, me, id)) return { ok: false, why: 'Essa tabuleta não pode agora.' };
    let tr = null;
    if (manga) { tr = C.manga(s, me); if (tr) { j.trap = { lado: me, r: s.r, de: tr.de, por: tr.por, pega: 0, t: r1(S.clock) }; conta('trapacas');
      // (quem olha a mesa percebe: o outro pelo que tem de atento; o corpo bebido se atrapalha e é visto mais)
      const extra = 0.3 * ebrio(v); for (const w of olhos(j, ai)) if (H(j.id, s.r * 17 + w.id, 8807) < Math.min(0.95, C.atento(w) + extra)) { pego(j, me, w); fecha(j); return { ok: true, pego: 1, por: w.id, msg: `${G.cap(G.Possess.knows.call(v, w))} viu a tabuleta saindo da manga!` }; } } }
    if (!s.lance[ai]) C.joga(s, ai, C.ia(s, ai, indDe(o)));
    if (G.Possess.dealt) G.Possess.dealt({ to: o.id });
    conta('rodadas'); const rec = C.resolve(s);
    if (s.fim) fecha(j); else abreCorpo(j);
    return { ok: true, rec, manga: tr ? 1 : 0, fim: s.fim ? Object.assign({}, s.fim) : null };
  };
  C.dobrar = function (v, gid) {
    if (!bodyOk(v)) return { ok: false, why: '' }; const j = meu(v, gid); if (!j) return { ok: false, why: 'O jogo acabou.' };
    const s = j.s; const me = j.corpo, ai = 1 - me; const S = S_(); const o = S.villagers.get(j.quem[ai]);
    if (!C.podeDobrar(s, me)) return { ok: false, why: s.dobrou[me] ? 'Você já dobrou nesta partida.' : 'Agora não se pode dobrar.' };
    if (!tem(v, j.aposta * s.x)) return { ok: false, why: 'Falta dinheiro para dobrar.' };
    const ok = dobra(j, me, C.iaAceita(s, ai, indDe(o)));
    if (s.fim) { fecha(j); return { ok: true, desistiu: 1, msg: `${G.cap(G.Possess.knows.call(v, o))} não aceita e desiste: o pote é seu.` }; }
    // (a vez de quem mostra primeiro, se for o outro)
    if (s.vis === ai && !s.lance[ai]) C.joga(s, ai, C.ia(s, ai, indDe(o)));
    return { ok: true, aceitou: ok ? 1 : 0, msg: `${G.cap(G.Possess.knows.call(v, o))} aceita: a aposta dobra.` };
  };
  C.respondeCorpo = function (v, gid, sim) {
    if (!bodyOk(v)) return { ok: false, why: '' }; const j = meu(v, gid); if (!j) return { ok: false, why: 'O jogo acabou.' };
    const s = j.s; const me = j.corpo, ai = 1 - me; if (!s.dobra || s.dobra.de !== ai) return { ok: false, why: 'Ninguém pediu para dobrar.' };
    const S = S_(); const o = S.villagers.get(j.quem[ai]); const n = j.aposta * s.x;
    if (sim && !(tem(v, n) && tem(o, n))) return { ok: false, why: 'Falta dinheiro para aceitar.' };
    if (sim) { poe(j, ai, n); poe(j, me, n); } C.responde(s, me, !!sim); conta(sim ? 'dobras' : 'recusas');
    if (s.fim) { fecha(j); return { ok: true, msg: 'Você desiste: o pote vai para o outro.' }; }
    if (s.vis === ai && !s.lance[ai]) C.joga(s, ai, C.ia(s, ai, indDe(o)));
    return { ok: true, msg: 'Aceito: a aposta dobra.' };
  };
  C.desisteCorpo = function (v, gid) {
    if (!bodyOk(v)) return { ok: false, why: '' }; const j = meu(v, gid); if (!j) return { ok: false, why: 'O jogo acabou.' };
    C.desiste(j.s, j.corpo); fecha(j); return { ok: true, msg: 'Você se levanta da partida: o pote vai para o outro.' };
  };

  // ------------------------------ o que se lê (puro) ------------------------------
  // o que a pessoa faz no jogo agora: o trapaceiro pego, na confusão; quem foi enganado, gritando; quem joga ou acabou de jogar
  C.ato = function (v) {
    const s = S_() && S_().cartas; if (!s || !v) return ''; const now = S_().clock;
    for (const k of Object.keys(s.j)) { const j = s.j[k]; if (!j.quem.includes(v.id)) continue;
      if (j.conf && now < j.conf.ate) { if (j.conf.de === v.id) return 'trapaca-pega'; if (j.conf.vit === v.id) return 'shout'; }
      if (j.fase === 'jogo') return j.trap && j.trap.lado === j.quem.indexOf(v.id) && !j.trap.pega && now - j.trap.t < 2.5 ? 'trapaca' : 'jogo-cartas';
      if (now - j.fimT < C.FIM_T) return 'jogo-cartas'; }
    return '';
  };
  // (quem está no meio de uma partida não pede outra rodada nem vai embora por falta de conversa: a mesa o segura)
  C.prende = v => { const s = S_() && S_().cartas; if (!s || !v) return false; for (const k of Object.keys(s.j)) { const j = s.j[k]; if (j.fase === 'jogo' && j.quem.includes(v.id)) return true; } return false; };
  // o que está numa mesa, para quem desenha (o 3D, o som, a vista do deus), no molde que a T7 lê (D-884): mesa — quantas tabuletas há
  // na mesa (as postas nesta rodada, viradas; sem nenhuma posta, as duas da rodada de antes, abertas) —, maos — quantos têm tabuletas na
  // mão (em leque) —, monte — quantas sobram nos dois montes —, mat — o material das tabuletas (o baralho da casa, ou o do corpo); e o
  // resto, para quem quiser: a partida, quem joga e de que povo, as tabuletas da mesa (cartas), a glória, o pote, quem venceu
  const MAT_DE = k => { const m = k ? String(k).split('.')[1] : ''; return m || 'madeira'; };
  C.atMesa = function (b, mesa) {
    const s = S_() && S_().cartas; if (!s || !b) return null; const id = b.id || b;
    for (const k of Object.keys(s.j)) { const j = s.j[k]; if (j.b !== id || j.g !== String(mesa)) continue;
      const q = j.s; const last = q.hist.length ? q.hist[q.hist.length - 1] : null; const bb = S_().buildings.get(j.b);
      const postas = (q.lance[0] ? 1 : 0) + (q.lance[1] ? 1 : 0); const abertas = last && last.c ? last.c.slice() : [];
      const v0 = j.corpo >= 0 ? S_().villagers.get(j.quem[j.corpo]) : null; const bar = (v0 && C.baralhoDe(v0)) || (bb ? C.baralhoCasa(bb) : null);
      return { mesa: postas || abertas.length, maos: (q.p[0].mao.length ? 1 : 0) + (q.p[1].mao.length ? 1 : 0), monte: q.p[0].monte.length + q.p[1].monte.length, mat: MAT_DE(bar),
        jogo: j.id, quem: j.quem.slice(), civ: q.civ.slice(), r: q.r, fase: j.fase, cartas: postas ? [] : abertas, postas: [!!q.lance[0], !!q.lance[1]], nMao: [q.p[0].mao.length, q.p[1].mao.length], nMonte: [q.p[0].monte.length, q.p[1].monte.length], gl: [q.p[0].gl, q.p[1].gl], pote: j.pote || 0, vence: q.fim ? q.fim.w : -2, por: q.fim ? q.fim.por : '', baralho: bar, trapaca: !!(j.conf && S_().clock < j.conf.ate) };
    }
    return null;
  };
  C.mesasDe = b => { const s = S_() && S_().cartas; if (!s || !b) return []; return Object.keys(s.j).map(k => s.j[k]).filter(j => j.b === b.id).map(j => j.g); };
  // (a partida do corpo, como a tela a mostra — o que o corpo sabe: a sua mão, as tabuletas na mesa, a do outro só quando à vista)
  C.doCorpo = function (v) {
    const j = v && C.de(v); if (!j || j.corpo < 0 || j.quem[j.corpo] !== v.id) return null; const q = j.s; const me = j.corpo, ai = 1 - me; const S = S_(); const b = S.buildings.get(j.b);
    return { jogo: j.id, me, ai, o: j.quem[ai], fase: j.fase, r: q.r, of: C.OF.slice(), pote: j.pote || 0, aposta: j.aposta, x: q.x, mao: q.p[me].mao.slice(), monte: [q.p[me].monte.length, q.p[ai].monte.length], maoOutro: q.p[ai].mao.length,
      gl: [q.p[me].gl, q.p[ai].gl], potePedras: q.pote, vis: q.vis === me ? 'eu' : q.vis === ai ? 'outro' : '', aberta: q.vis === me && q.lance[ai] ? q.lance[ai] : null, posta: !!q.lance[me], dobra: q.dobra ? (q.dobra.de === me ? 'eu' : 'outro') : '',
      podeDobrar: C.podeDobrar(q, me) && j.aposta > 0, hist: q.hist.slice(-8), fim: q.fim ? Object.assign({}, q.fim, { meu: q.fim.w === me ? 1 : q.fim.w === ai ? -1 : 0 }) : null, civ: [q.civ[me], q.civ[ai]], bonus: q.p[me].bonus, mal: q.p[me].mal, desc: [q.p[me].desc.length, q.p[ai].desc.length],
      preco: n => (b ? dinheiro(b, n) : String(n)), moeda: moeda(b), baralho: C.baralhoDe(v) || (b ? C.baralhoCasa(b) : null), trap: j.trap && j.trap.lado === me ? Object.assign({}, j.trap) : null, n: q.hist.length };
  };

  // ------------------------------ o laço do jogo e o da trapaça (a sociedade) ------------------------------
  // (registrados quando a sociedade existe: o soc-lacos.js carrega depois deste arquivo)
  const lacos = () => { if (G.Lacos && G.Lacos.tipo) { G.Lacos.tipo('jogo', { a: [3, 2, 0, 1], b: [3, 2, 0, 1], frente: 1 }); G.Lacos.tipo('trapaca', { a: [0, 0, 0, 0], b: [-12, -24, -4, -2], frente: 1 }); } };
  G.worldHooks.push(lacos); lacos();

  // ------------------------------ o save ------------------------------
  // as partidas e os torneios vão inteiros (números, textos e listas: a regra os lê como estão); um save de antes não tem nada; um
  // registro danificado é largado — e o pote dele, se havia, vai ao armazém do povo da taverna no primeiro passo (nada some)
  const num = x => typeof x === 'number' && isFinite(x);
  const lista = L => Array.isArray(L) && L.every(x => typeof x === 'string' && !!C.card(x));
  function saoDe(q) { return q && Array.isArray(q.p) && q.p.length === 2 && q.p.every(p => p && lista(p.monte) && lista(p.mao) && lista(p.desc) && num(p.gl)) && Array.isArray(q.civ) && num(q.r) && Array.isArray(q.lance) && Array.isArray(q.hist); }
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { const s = S_().cartas; if (s && (Object.keys(s.j).length || Object.keys(s.tor).length || Object.keys(s.n).length)) out.cartas = JSON.parse(JSON.stringify({ j: s.j, tor: s.tor, n: s.n })); },
    load(o) {
      const S = S_(); const c = o && o.cartas; if (!c || typeof c !== 'object') { delete S.cartas; return; }
      const out = { j: {}, tor: {}, n: {} }; const perdido = [];
      for (const k of Object.keys(c.j || {})) { const j = c.j[k]; if (j && num(j.id) && Array.isArray(j.quem) && j.quem.length === 2 && saoDe(j.s) && num(j.b)) { if (!Array.isArray(j.pago)) j.pago = [0, 0]; out.j[j.id] = j; } else if (j && num(j.pote) && j.pote > 0) perdido.push(j); }
      for (const k of Object.keys(c.tor || {})) { const t = c.tor[k]; if (t && num(t.id) && num(t.b) && num(t.dia)) { t.pagos = t.pagos && typeof t.pagos === 'object' ? t.pagos : {}; t.vit = t.vit || {}; t.gl = t.gl || {}; t.insc = Array.isArray(t.insc) ? t.insc : []; out.tor[t.b] = t; } }
      for (const k of Object.keys(c.n || {})) if (num(c.n[k])) out.n[k] = c.n[k];
      S.cartas = out; void perdido;
    },
  });
  G.worldHooks.push(() => { /* (o registro mora no G.S: um mundo novo começa sem ele, um save o traz) */ });
})(window.G);
