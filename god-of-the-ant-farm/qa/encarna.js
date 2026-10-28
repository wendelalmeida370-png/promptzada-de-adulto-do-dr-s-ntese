// encarna: node qa/encarna.js [pasta das fotos] — o Modo Encarnado provocado de propósito, com os casos ruins
// (o 3D roda de verdade, com o WebGL do navegador sem GPU — SwiftShader: é lento, os tempos aqui são o piso, não o jogo)
//  e1  (prova 50) cidade real — na metrópole: cada prédio perto do corpo está no lugar e na terra que o mundo diz; o chão 3D
//      é a altura do mundo; o corpo anda pelo caminho real até o mercado e até o porto, sem atravessar nada
//  e2  (prova 51) personagem real — mesma pessoa (id, nome, família, casa) antes e depois; a IA volta; a biografia lembra
//  e3  (prova 52) o mundo continua — enquanto encarnado (e dormindo, o tempo correndo), longe dali o mundo acontece: tudo fica
//  e4  (prova 53) troca de personagem — A, Deus, B; e B → C de dentro; ninguém duplicado; a IA de A volta; histórias intactas
//  e5  (prova 54) morte — pelo fogo, pela fome e numa queda: morre de verdade, o controle acaba, o deus volta, a biografia e a crônica contam
//  e6  (prova 55) terreno — plano, ladeira, estrada, bosque, costa, entre prédios: pulos, colisões, câmera; nunca dentro de nada;
//      o mundo leva o corpo longe e a câmera vai junto (sem voar atrás dele por dentro das casas)
//  e7  (prova 56) save/load A–E — antes, durante (volta encarnado), depois, após andar muito, após a morte; save danificado
//  e8  (prova 57) estresse — 30 idas e voltas (com saves), caminhada longa (chunks), salto de 10 anos: memória e erros
//  e9  casos ruins — capturado por inimigos, levado a um navio, a terra afunda sob os pés, um prédio nasce em cima, a guerra
//      chama, uma cena quer o corpo; e as mãos mudando o mundo: lenha, frutas, pedra, armazém, comida, obra, templo, a cama
//  e10 interface — o botão Encarnar (e o motivo quando não pode), a tecla I, a ficha com os dados reais, o menu, as teclas
//  e11 o 3D bonito é o mesmo mundo — o chão pintado casa por casa como o mundo é (ruas, roças, mar) e seguindo-o quando muda;
//      as plantas que balançam e os padrões das paredes e telhados nas geometrias; o fogo solta fumaça e faíscas; a árvore
//      derrubada cai e deita (nunca de pé e caída ao mesmo tempo); quem está perto vira a cabeça para o corpo; com o mundo
//      parado, o desenho não mexe no acaso nem no relógio do mundo
//  e12 o que o mundo tem, o 3D mostra — o dragão (voando onde o mundo diz, soprando fogo, dormindo no tesouro, os ossos),
//      a tocha do corpo à noite, as carroças com o boi, os bichos do mar, a chuva de ouro, os mortos onde caíram, o campo
//      de capim só onde o chão do mundo tem capim
//  e13 o corpo no mundo — escala uma pedra grande (anda por cima e desce do outro lado; a parede de uma casa não), senta e
//      levanta, acena e é respondido, bebe no rio (o mar é salgado), faz carinho num bicho manso, cata o ouro do chão; os
//      feitos entram na biografia
//  e14 o corpo na água — a água sobe pelas pernas (mais lento), funda ele nada (o mundo o deixa lá, o deus o vê nadar),
//      o fôlego acaba nadando, a ordem do mundo de nadar não tira o corpo, salvar no meio do mar, voltar à praia, o vau
//      do rio, e sem fôlego se afoga de verdade (morte do mundo, crônica, o deus volta)
//  e15 os braços e o coração — de dia (a noite passa antes: T-036): acenar e ser respondido; a conversa faz a pessoa parar; o abraço na família (o corpo chega perto, os dois se abraçam),
//      consolar quem está de luto (o luto diminui), a pessoa morrendo no meio do abraço, salvar no meio; dançar e quem entra
//      na dança; pescar com as mãos no vau (só na água, mãos livres, levado para longe no meio, o peixe daquela água)
//  e16 a apresentação nunca à frente do mundo (adendo §5) — as caixas desenhadas no cais são as do mundo, e o estivador que
//      as descarrega só tem uma nas mãos quando o mundo a pôs lá; com o menu aberto o 3D desenha sem mexer no cais nem no
//      relógio, e o golpe pedido espera; o que o corpo leva ao armazém está desenhado nas mãos enquanto o mundo o tem nelas
//  e17 o estivador encarnado — na metrópole, de dia, um barco descarrega: o estivador é chamado ao cais; a linha da descarga
//      e o marcador nas caixas de verdade (de costas para elas, a seta na borda da tela); segue o marcador, «E — Pegar a
//      caixa» junto da pilha, pega; o marcador passa à porta do armazém, «Levar ao armazém do porto»; guarda: o estoque, a
//      paga na casa e a conta dele como as de um estivador; as fotos da HUD com o marcador
//  e18 entrar e sair de casa de verdade (Etapa 2) — a porta fechada desenhada no vão, as mãos a abrem e a folha gira como o
//      mundo a tem, o corpo entra (o mundo o tem dentro), o olho num cômodo e nunca numa parede, quem está em casa onde a
//      planta põe, a escada inteira com o alçapão abrindo, salvar e carregar dentro, o deus tira a casa com o corpo nela
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'encarna'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  // (every listener put on the page is counted: going up and down a hundred times must not pile them up)
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } window.__L = 0; const a = EventTarget.prototype.addEventListener; EventTarget.prototype.addEventListener = function () { window.__L++; return a.apply(this, arguments); }; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  for (const w of ['cidade', 'metropole']) await page.addScriptTag({ path: path.join(ROOT, 'worlds', w + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | encarna ${name} | ${info}`); if (!cond) fails.push(name); };
  // (the logic runs at the light quality — the browser draws 3D in software, slowly; the photos at the medium one)
  const shot = async name => {
    // (10 frames at the medium quality before the photo: the 3D drawn by software is heavier since v33 — T-032)
    await page.evaluate(() => { if (G.Modes.state !== 'GOD') { G.Realm.setQuality('media'); for (let k = 0; k < 10; k++) G.Main.frameFor(33); } });
    try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000 }); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); }
    await page.evaluate(() => G.Realm.setQuality('baixa'));
  };
  await page.evaluate(() => {
    const E = window.__E = {
      fresh(w) { G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true; E.base = new Set(QA.check().filter(e => e.sev <= 3).map(E.qk)); },
      qk: e => e.id + '|' + e.msg.replace(/\s*\([^)]*\)\s*$/, ''),
      qa: () => QA.check().filter(e => e.sev <= 2 && !E.base.has(E.qk(e))).map(e => `${e.id}/S${e.sev}: ${e.msg}`),
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33); } return c() ? max : -1; },
      enter(v) { if (!G.Modes.enter(v)) return false; return E.until(() => G.Modes.state === 'INC', 300) >= 0; },
      leave() { if (G.Modes.state === 'INC') G.Modes.leave('deus'); return E.until(() => G.Modes.state === 'GOD', 400) >= 0; },
      town: k => [...G.S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[k || 0],
      adults: (s, f) => [...G.S.villagers.values()].filter(o => (!s || o.set === s.id) && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok && (!f || f(o))),
      body: () => G.Possess.body(),
      // the body walked along the world's own path to (x, y) — the camera turned toward each next step, W held
      walkTo(x, y, max, run) {
        const v = E.body(); const st = G.Avatar.state(); if (!v || !st) return { ok: false, why: 'sem corpo' };
        const p = G.W.findPath(v.x, v.y, x, y, true, 30000); if (!p) return { ok: false, why: 'sem caminho' };
        let i = 0, bad = 0, under = 0, still = 0, last = [v.x, v.y], k = 0, camIn = 0;
        for (; k < (max || 1500); k++) {
          const w = p[Math.min(i, p.length - 1)]; const dx = w[0] - v.x, dy = w[1] - v.y; const d = Math.hypot(dx, dy);
          if (d < 0.3) { if (i >= p.length - 1) break; i++; continue; }
          G.Cam3D.yaw = Math.atan2(dy, dx); G.Input3D.down.frente = true; G.Input3D.down.correr = !!run;
          G.Main.frameFor(33);
          if (!G.W.walkableXY(v.x, v.y)) bad++;
          if (st.Y < G.Avatar.floorAt(st.X, st.Z) - 0.05) under++;
          const c = G.Realm.camera().position; if (G.Cam3D.solid(c.x, c.y, c.z)) camIn++;
          if (k % 60 === 59) { if (G.dist(last[0], last[1], v.x, v.y) < 0.15) still++; else still = 0; last = [v.x, v.y]; if (still >= 3) break; }
        }
        G.Input3D.down.frente = false; G.Input3D.down.correr = false; E.f(4);
        const end = p[p.length - 1];
        return { ok: G.dist(v.x, v.y, end[0], end[1]) < 0.8, frames: k, steps: p.length, bad, under, camIn, stuck: still >= 3, d: +(G.dist(v.x, v.y, end[0], end[1]) * 4).toFixed(1) };
      },
      // the box of a building against the world's footprint and ground (metres)
      fits(b) {
        const B = G.Build3D.bounds(b); if (!B) return null; const L = G.Space.TILE;
        const cx = (b.x + b.w / 2) * L, cz = (b.y + b.h / 2) * L; const mx = (B.lo[0] + B.hi[0]) / 2, mz = (B.lo[2] + B.hi[2]) / 2;
        const out = Math.max(b.x * L - B.lo[0], B.hi[0] - (b.x + b.w) * L, b.y * L - B.lo[2], B.hi[2] - (b.y + b.h) * L);
        return { off: Math.hypot(mx - cx, mz - cz), out, floats: B.lo[1] - B.ground[1], sunk: B.ground[0] - B.floor };
      },
    };
  });
  const E = (fn, arg) => page.evaluate(fn, arg);
  // (one part alone, or a few: ONLY=e9,e10 — the parts after e2 live in the 'cidade' world, loaded once if e2 is skipped)
  const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); let city = false;
  const need = async k => { if (ONLY.length && !ONLY.includes(k)) return false; if (k === 'e2') city = true; else if (k !== 'e1' && k !== 'e8' && !city) { await E(() => __E.fresh('cidade')); city = true; } return true; };

  if (await need('e1')) {
  // ================================ e1: the real city (metropole) ================================
  {
    const r = await E(() => {
      __E.fresh('metropole'); const S = G.S;
      // (the biggest town with a market and a port: the walk goes across it, from one to the other)
      const has = (s, f) => [...S.buildings.values()].some(b => b.set === s.id && b.built && f(b));
      const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id)).find(t => has(t, b => b.type === 'doca') && has(t, b => b.type === 'mercado' || b.type === 'feira')) || __E.town();
      const market = [...S.buildings.values()].find(b => b.set === s.id && b.built && (b.type === 'mercado' || b.type === 'feira'));
      const dock = [...S.buildings.values()].find(b => b.set === s.id && b.built && b.type === 'doca');
      const m = market || [...S.buildings.values()].find(b => b.set === s.id && b.built && b.type === 'storehouse');
      const v = __E.adults(s).sort((a, c) => G.dist2(a.x, a.y, m.x, m.y) - G.dist2(c.x, c.y, m.x, m.y))[0];
      window.__v = v; window.__m = m; window.__dock = dock;
      G.UI.select(v); G.Render.cam.follow = v.id; __E.f(10);
      const inn = __E.enter(v);
      // every building within 48 m of the body: in its place, on its ground
      const near = [...S.buildings.values()].filter(b => G.dist(b.x + b.w / 2, b.y + b.h / 2, v.x, v.y) < 12);
      const PART = { farm: 1, horta: 1, plantacao: 1, vinhedo: 1, pomar: 1, cemetery: 1, apiario: 1, mercado: 1, feira: 1, mercado_negro: 1, campfire: 1, curral: 1, cercado: 1, ruin: 1 };
      let bad = []; for (const b of near) { const f = __E.fits(b); if (!f) continue; if (b.type !== 'doca' && ((!PART[b.type] && f.off > 1.2) || f.out > 1.6)) bad.push(`${b.type}#${b.id} fora ${f.off.toFixed(1)}/${f.out.toFixed(1)}m`); if (f.floats > 0.35) bad.push(`${b.type}#${b.id} flutua ${f.floats.toFixed(2)}m`); if (f.sunk > 0.05) bad.push(`${b.type}#${b.id} afundado`); }
      // the ground of the near chunks is the world's own heights, vertex by vertex — carved only inside a river, by the one
      // bed the feet stand on too (Space.bedDrop, v35); nowhere else a step of difference (T-037)
      const st = G.Avatar.state(); const ms = G.Realm.nearOf(st.X, st.Z); let err = 0, nv = 0, carved = 0;
      if (ms && ms[0]) { const P = ms[0].geometry.attributes.position.array; for (let k = 0; k < P.length; k += 3) { const x = P[k] / 4, y = P[k + 2] / 4; const bed = G.Space.bedDrop(x, y); if (bed > 0) carved++; const h = G.W.hAt(x, y) * 1.5 - bed; err = Math.max(err, Math.abs(P[k + 1] - h)); nv++; } }
      const roads = (() => { let n = 0; for (let y = 0; y < G.N; y++) for (let x = 0; x < G.N; x++) if (S.road[y * G.N + x] && G.dist(x, y, v.x, v.y) < 10) n++; return n; })();
      return { town: s.name, pop: G.Village.pop(s.id), v: v.name, inn, near: near.length, bad, err, nv, carved, market: market ? market.type : 'storehouse', dock: !!dock, roads, chunks: G.Realm.chunkCount() };
    });
    ok('e1 entra na metrópole', r.inn, `${r.v} em ${r.town} (${r.pop} hab.) · chunks ${JSON.stringify(r.chunks)}`);
    ok('e1 prédios no lugar e no chão', r.near >= 8 && !r.bad.length, `${r.near} prédios a menos de 48 m; problemas: ${r.bad.slice(0, 4).join('; ') || 'nenhum'}`);
    ok('e1 o chão 3D é a altura do mundo', r.nv > 500 && r.err < 0.02, `${r.nv} vértices (${r.carved} no leito de um rio), erro máximo ${r.err.toFixed(4)} m`);
    await shot('e1-mercado');
    const w = await E(() => { const m = window.__m; const d = G.Vg.door(m); return { w: __E.walkTo(d[0], d[1], 1800), qa: __E.qa() }; });
    ok('e1 anda pelas ruas até o mercado', w.w.ok && !w.w.bad && !w.w.under && !w.w.camIn, `${JSON.stringify(w.w)} · roads perto: ${r.roads}`);
    await shot('e1-no-mercado');
    if (r.dock) {
      const d = await E(() => { const b = window.__dock; const p = G.Vg.door(b); const f = __E.fits(b); const sea = (() => { for (let y = b.y - 1; y <= b.y + b.h; y++) for (let x = b.x - 1; x <= b.x + b.w; x++) if (G.W.inb(x, y) && G.S.type[y * G.N + x] <= G.T.SEA) return true; return false; })(); return { w: __E.walkTo(p[0], p[1], 2400, true), sea, f }; });
      ok('e1 o porto fica na costa e se chega a ele a pé', d.sea && d.w.ok && !d.w.bad && !d.w.camIn, `cais junto do mar: ${d.sea} · ${JSON.stringify(d.w)}`);
      await shot('e1-porto');
      // across the town: from the port to the farthest door of the town the feet can reach (40 m or more: the world's path
      // is smoothed into straight legs, so the proof is the distance, not the number of corners)
      const x = await E(() => { const v = __E.body(); const s = G.S.settlements.get(v.set); let far = null, fd = 0; for (const b of G.S.buildings.values()) { if (b.set !== v.set || !b.built) continue; const p = G.Vg.door(b); if (!G.W.reaches(v, p[0], p[1])) continue; const dd = G.dist(p[0], p[1], v.x, v.y); if (dd > fd && dd < 40) { fd = dd; far = p; } } return far ? { to: +(fd * 4).toFixed(0), w: __E.walkTo(far[0], far[1], 3600, true) } : null; });
      ok('e1 atravessa a cidade a pé, entre os prédios reais', x && x.w.ok && !x.w.bad && !x.w.under && !x.w.camIn && x.to >= 40, JSON.stringify(x));
      await shot('e1-atravessou');
    } else ok('e1 o porto fica na costa e se chega a ele a pé', true, 'a maior cidade não tem cais (nada a provar)');
    const q = await E(() => ({ qa: __E.qa(), err: JSON.stringify(G.modErr) }));
    ok('e1 verificador', !q.qa.length && q.err === '{}', `${q.qa.slice(0, 3).join(' · ') || 'limpo'} · erros de módulo ${q.err}`);
  }

  }
  if (await need('e2')) {
  // ================================ e2: the real person ================================
  const e2 = await E(() => {
    __E.fresh('cidade'); const s = __E.town();
    const v = __E.adults(s, o => o.mother && o.bio && o.bio.length >= 3).sort((a, b) => (b.kids.length - a.kids.length))[0];
    const id0 = { id: v.id, name: v.name, mother: v.mother, father: v.father, partner: v.partner, kids: v.kids.slice(), home: v.home, set: v.set, role: v.role, age: v.age, bio: (v.bio || []).length, stories: G.Stories ? G.Stories.of(v.id).map(x => x.id).sort().join(',') : '' };
    const inn = __E.enter(v); const inTask = v.task && v.task.type;
    const st = G.Avatar.state(); const x0 = v.x, y0 = v.y;
    G.Input3D.down.frente = true; G.Cam3D.yaw = 0.7; __E.f(140); G.Input3D.down.frente = false; __E.f(10);
    const moved = G.dist(x0, y0, v.x, v.y) * 4; const at = { x: v.x, y: v.y };
    const n = G.S.villagers.size; let same = 0; for (const o of G.S.villagers.values()) if (o.id === v.id) same++;
    const left = __E.leave();
    const o = G.S.villagers.get(id0.id);
    // (the moment the god's view is back: the person is exactly where the body was left)
    const atGod = G.dist(at.x, at.y, o.x, o.y) * 4;
    const ai = __E.until(() => o.task && o.task.type !== 'avatar', 120) >= 0;
    return { inn, inTask, moved, left, n, same, alive: !!o, same2: o === v, id0, after: o && { name: o.name, mother: o.mother, father: o.father, partner: o.partner, kids: o.kids.slice(), home: o.home, set: o.set, role: o.role, age: o.age, stories: G.Stories ? G.Stories.of(o.id).map(x => x.id).sort().join(',') : '' }, task: o && o.task && o.task.type, ai, sel: G.UI.selected && G.UI.selected.id === o.id, leftAt: atGod, bio: G.Life.bioList(o).slice(-1)[0], avatar: !!G.S.avatar, qa: __E.qa() };
  });
  ok('e2 encarna uma pessoa real', e2.inn && e2.inTask === 'avatar', `${e2.id0.name} #${e2.id0.id}, ${Math.floor(e2.id0.age)} anos, ${e2.id0.kids.length} filhos, ${e2.id0.bio} memórias`);
  ok('e2 anda com ela', e2.moved > 6, `${e2.moved.toFixed(1)} m em 4,6 s`);
  ok('e2 a mesma pessoa depois (id, família, casa, povo)', e2.alive && e2.same2 && e2.same === 1 && JSON.stringify([e2.id0.name, e2.id0.mother, e2.id0.father, e2.id0.partner, e2.id0.kids, e2.id0.home, e2.id0.set, e2.id0.role]) === JSON.stringify([e2.after.name, e2.after.mother, e2.after.father, e2.after.partner, e2.after.kids, e2.after.home, e2.after.set, e2.after.role]) && e2.after.age > e2.id0.age, `mesmo objeto: ${e2.same2}; idade ${e2.id0.age.toFixed(3)} → ${e2.after && e2.after.age.toFixed(3)}; histórias ${e2.id0.stories || '-'} → ${e2.after && e2.after.stories || '-'}`);
  ok('e2 volta ao Modo Deus: exatamente onde foi deixada, selecionada; depois a IA de novo', e2.left && !e2.avatar && e2.ai && e2.sel && e2.leftAt < 0.05, `a ${e2.leftAt.toFixed(2)} m de onde o jogador a deixou quando o Modo Deus voltou; tarefa depois: ${e2.task}`);
  ok('e2 a biografia lembra', !!e2.bio && /guiad/.test(e2.bio.txt), e2.bio ? e2.bio.txt : '-');
  ok('e2 verificador', !e2.qa.length, e2.qa.slice(0, 3).join(' · ') || 'limpo');
  await shot('e2-volta-deus');

  }
  if (await need('e3')) {
  // ================================ e3: the world goes on ================================
  const e3 = await E(() => {
    const S = G.S; const s = __E.town(); const v = __E.adults(s)[0];
    __E.enter(v);
    const far = [...S.villagers.values()].filter(o => G.dist(o.x, o.y, v.x, v.y) > 40 && o.age > 10)[0];
    const f0 = far && { id: far.id, x: far.x, y: far.y, age: far.age };
    const t0 = { day: S.day, clock: S.clock, births: S.stats.births || 0, deaths: S.stats.deaths || 0, logN: S.logN, built: [...S.buildings.values()].filter(b => b.built).length };
    let farNews = 0; const hook = (e) => { if (Number.isFinite(e.x) && G.dist(e.x, e.y, v.x, v.y) > 30) farNews++; }; G.Possess.onLog.push(hook);
    v.energy = 5; G.Possess.sleep(v); const slept = v.sleeping;
    // (a tired body sleeps; whenever it wakes it is put back to bed: the nights pass quickly, as they do for the player)
    for (let k = 0; k < 600; k++) { if (!v.sleeping) { v.energy = 5; G.Possess.sleep(v); } G.Main.frameFor(100); }
    G.Possess.onLog.splice(G.Possess.onLog.indexOf(hook), 1);
    const awake = !v.sleeping || (G.Possess.wake(v), true);
    const t1 = { day: S.day, clock: S.clock, births: S.stats.births || 0, deaths: S.stats.deaths || 0, logN: S.logN };
    const entries = S.history.filter(e => e.n > t0.logN).map(e => e.n);
    const fo = far && S.villagers.get(far.id) || (far && S.dead.get(far.id));
    __E.leave();
    const stillThere = entries.every(n => S.history.some(e => e.n === n));
    return { slept, awake, t0, t1, farNews, entries: entries.length, stillThere, far: f0 && fo ? { moved: fo.dead ? 'morreu' : G.dist(f0.x, f0.y, fo.x, fo.y).toFixed(1), aged: fo.dead ? '-' : (fo.age - f0.age).toFixed(2) } : null, clockAfter: S.clock, qa: __E.qa() };
  });
  ok('e3 o tempo passa no corpo (dormir acelera)', e3.slept && e3.t1.clock > e3.t0.clock + 200, `relógio ${e3.t0.clock.toFixed(0)} → ${e3.t1.clock.toFixed(0)} s; dia ${e3.t0.day} → ${e3.t1.day}`);
  ok('e3 longe dali o mundo acontece', e3.entries > 0 && (e3.t1.births > e3.t0.births || e3.t1.deaths > e3.t0.deaths) && e3.far && e3.far.moved !== '0.0', `${e3.entries} linhas novas na crônica (${e3.farNews} a mais de 120 m); nascimentos ${e3.t0.births}→${e3.t1.births}, mortes ${e3.t0.deaths}→${e3.t1.deaths}; alguém a 160 m andou ${e3.far && e3.far.moved} casas e envelheceu ${e3.far && e3.far.aged}`);
  ok('e3 de volta a Deus, nada desfeito', e3.stillThere && e3.clockAfter >= e3.t1.clock, `crônica intacta; relógio ${e3.clockAfter.toFixed(0)}`);
  ok('e3 verificador', !e3.qa.length, e3.qa.slice(0, 3).join(' · ') || 'limpo');

  }
  if (await need('e4')) {
  // ================================ e4: another person ================================
  const e4 = await E(() => {
    const S = G.S; const s = __E.town(); const [a, b] = __E.adults(s);
    const stA = G.Stories ? G.Stories.of(a.id).map(x => x.id).join(',') : '';
    __E.enter(a); __E.f(30); __E.leave();
    const aiA = __E.until(() => a.task && a.task.type !== 'avatar', 120) >= 0;
    __E.enter(b);
    const bOk = S.avatar && S.avatar.id === b.id && b.task.type === 'avatar';
    const aOk = S.villagers.get(a.id) === a && a.task && a.task.type !== 'avatar';
    // from inside: B → C (the card's button)
    const c = __E.adults(s).find(o => o.id !== a.id && o.id !== b.id);
    const sw = G.Modes.switchTo(c); __E.f(40);
    const cOk = S.avatar && S.avatar.id === c.id && c.task.type === 'avatar' && (!b.task || b.task.type !== 'avatar');
    const aiB = __E.until(() => b.task && b.task.type !== 'avatar', 120) >= 0;
    __E.leave();
    const ids = new Set(); let dup = 0; for (const o of S.villagers.values()) { if (ids.has(o.id)) dup++; ids.add(o.id); }
    let marks = 0; for (const o of S.villagers.values()) if (o.task && o.task.type === 'avatar') marks++;
    return { aiA, bOk, aOk, sw, cOk, aiB, dup, marks, stA, stA2: G.Stories ? G.Stories.of(a.id).map(x => x.id).join(',') : '', bioA: G.Life.bioList(a).slice(-1)[0].txt, bioB: G.Life.bioList(b).slice(-1)[0].txt, qa: __E.qa(), names: [a.name, b.name, c.name] };
  });
  ok('e4 A, Deus, B: os dois existem, a IA de A voltou, B tem o corpo', e4.aiA && e4.bOk && e4.aOk, `${e4.names[0]} → ${e4.names[1]}`);
  ok('e4 de dentro, B → C: a IA de B volta, C tem o corpo', e4.sw && e4.cOk && e4.aiB, `${e4.names[1]} → ${e4.names[2]}`);
  ok('e4 ninguém duplicado, nenhuma marca sobrando, histórias intactas', !e4.dup && !e4.marks && e4.stA === e4.stA2, `duplicados ${e4.dup}, marcas ${e4.marks}; histórias de A: ${e4.stA || '-'} → ${e4.stA2 || '-'}; bio A: ${e4.bioA}`);
  ok('e4 verificador', !e4.qa.length, e4.qa.slice(0, 3).join(' · ') || 'limpo');

  }
  if (await need('e5')) {
  // ================================ e5: death ================================
  const e5 = await E(() => {
    const out = {};
    // (and a fall of 40 m: the body lifted over its ground, as off the edge of a high drop — the controller's own landing hurts)
    for (const [k, how] of [['fogo', v => G.Vg.damage(v, 999, 'fire', false)], ['fome', v => { v.hunger = 100; v.hp = 0.6; }], ['queda', () => { G.Avatar.state().Y += 40; }]]) {
      // (after a load the world is a new object: always G.S, never a copy kept from before)
      const S = G.S; const s = __E.town();
      const v = __E.adults(s)[0]; const id = v.id; __E.enter(v);
      how(v);
      const seq = []; for (let i = 0; i < 900; i++) { G.Main.frameFor(33); if (seq[seq.length - 1] !== G.Modes.state) seq.push(G.Modes.state); if (G.Modes.state === 'GOD' && i > 10) break; }
      const rec = S.dead.get(id);
      const line = S.history.slice(-8).find(e => e.txt.includes(rec ? rec.name : '?') && /deus vivendo/.test(e.txt));
      const sv = G.Save.serialize(); let loaded = true; try { G.Save.apply(JSON.parse(sv)); } catch (e) { loaded = false; }
      __E.base = new Set(QA.check().filter(e => e.sev <= 3).map(__E.qk));
      out[k] = { seq, dead: !!rec && !S.villagers.has(id), cause: rec && rec.cause, avatar: !!S.avatar, mode: G.Modes.state, bio: rec && rec.bio ? G.Life.bioLine(rec, rec.bio[rec.bio.length - 1]) : null, line: line ? line.txt : null, loaded, deadAfter: !!G.S.dead.get(id), avAfter: !!G.S.avatar };
    }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  for (const k of ['fogo', 'fome', 'queda']) { const r = e5[k]; const by = k === 'fogo' ? 'pelo fogo' : k === 'fome' ? 'pela fome' : 'numa queda'; ok(`e5 morte ${by}: morre de verdade, o deus volta`, r.dead && !r.avatar && r.mode === 'GOD' && r.seq.join('>').includes('DYING>TO_GOD>GOD') && (k !== 'queda' || r.cause === 'queda'), `${r.seq.join(' > ')} · causa ${r.cause}`); ok(`e5 morte ${by}: biografia e crônica contam; o save carrega`, !!r.bio && !!r.line && r.loaded && r.deadAfter && !r.avAfter, `${r.bio} · ${r.line}`); }
  ok('e5 verificador', !e5.qa.length && e5.err === '{}', `${e5.qa.slice(0, 3).join(' · ') || 'limpo'} · erros de módulo ${e5.err}`);
  await shot('e5-depois-da-morte');

  }
  if (await need('e6')) {
  // ================================ e6: the terrain ================================
  const e6 = await E(() => {
    const S = G.S; const W = G.W; const N = G.N; const T = G.T;
    const s = __E.town(); const v = __E.adults(s)[0]; __E.enter(v); const st = G.Avatar.state();
    const reach = (x, y) => W.walkableXY(x, y) && W.reachesTown(v, s) !== undefined && W.canWalk ? true : W.walkableXY(x, y);
    const near = (f, R) => { let best = null, bd = 1e9; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { const i = y * N + x; if (!W.walkable(i) || !f(i, x, y)) continue; if (G.W.reaches && !G.W.reaches(v, x + 0.5, y + 0.5)) continue; const d = G.dist2(x, y, v.x, v.y); if (d < bd && d < (R || 60) * (R || 60)) { bd = d; best = [x + 0.5, y + 0.5]; } } return best; };
    const trees = (x, y) => { let n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (W.inb(x + dx, y + dy) && S.treeAt[(y + dy) * N + x + dx]) n++; return n; };
    const sea = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => W.inb(x + a, y + b) && S.type[(y + b) * N + x + a] <= T.SEA && !(S.dry && S.dry[(y + b) * N + x + a]));
    const blockedN = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => W.inb(x + a, y + b) && W.blocked((y + b) * N + x + a)).length;
    const places = {
      plano: near((i, x, y) => S.slope[i] < 0.3 && !trees(x, y) && !blockedN(x, y) && S.type[i] >= T.GRASS),
      ladeira: near(i => S.slope[i] > 1.1 && S.type[i] >= T.SAND),
      estrada: near(i => S.road[i] > 0 && S.type[i] !== T.RIVER),
      bosque: near((i, x, y) => trees(x, y) >= 6, 90),
      costa: near((i, x, y) => sea(x, y) && S.type[i] >= T.SAND, 90),
      'entre prédios': near((i, x, y) => blockedN(x, y) >= 2),
    };
    const out = {};
    for (const k in places) {
      const p = places[k]; if (!p) { out[k] = null; continue; }
      G.Avatar.place(p[0], p[1]); __E.f(6);
      let bad = 0, under = 0, high = 0, camIn = 0, camLow = 0, jumps = 0, maxUp = 0, wet = 0, inWater = 0, marked = 0;
      const dirs = k === 'costa' ? (() => { const x = Math.floor(p[0]), y = Math.floor(p[1]); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (W.inb(x + a, y + b) && S.type[(y + b) * N + x + a] <= T.SEA) return [Math.atan2(b, a), Math.atan2(b, a) + 0.4, Math.atan2(b, a) - 0.4]; return [0]; })() : [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      for (const yaw of dirs) {
        G.Cam3D.yaw = yaw; G.Input3D.down.frente = true;
        for (let i = 0; i < 45; i++) {
          if (i === 20) { G.Avatar.input.jump = true; jumps++; }
          G.Main.frameFor(33);
          const fl = G.Avatar.floorAt(st.X, st.Z); maxUp = Math.max(maxUp, st.Y - fl);
          // (in the sea the world knows the body is there — its mark 'afloat', D-026 — whether it swims, wades or stands on the
          // shore's slope inside a sea tile; the feet never under the bed, never in the air but swimming)
          const inSea = S.type[W.idx(v.x, v.y)] <= T.SEA && !(S.dry && S.dry[W.idx(v.x, v.y)]); const swim = G.Avatar.swimming(), known = G.Possess.afloat(v);
          if (inSea) { wet++; if (swim || G.Avatar.wade() > 0) inWater++; if (known) marked++; } if (!W.walkableXY(v.x, v.y) && !(inSea && known)) bad++; if (st.Y < fl - 0.05) under++; if (st.Y > fl + 1.6 && !swim) high++;
          const c = G.Realm.camera().position; if (G.Cam3D.solid(c.x, c.y, c.z)) camIn++; if (c.y < G.W.hAt(c.x / 4, c.z / 4) * 1.5) camLow++;
        }
      }
      G.Input3D.down.frente = false; __E.f(10);
      out[k] = { at: p.map(n => +n.toFixed(1)), bad, under, high, camIn, camLow, maxUp: +maxUp.toFixed(2), wet, inWater, marked, still: st.speed };
    }
    // pressed against a wall: never stuck — turning away, the body walks
    const pb = places['entre prédios']; let unstuck = null;
    if (pb) {
      G.Avatar.place(pb[0], pb[1]); __E.f(6); const x = Math.floor(pb[0]), y = Math.floor(pb[1]);
      const d = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([a, b]) => W.inb(x + a, y + b) && W.blocked((y + b) * N + x + a));
      G.Cam3D.yaw = Math.atan2(d[1], d[0]); G.Input3D.down.frente = true; __E.f(60);
      const p0 = [v.x, v.y]; const inWall = !W.walkableXY(v.x, v.y);
      G.Cam3D.yaw += Math.PI; __E.f(40); G.Input3D.down.frente = false; __E.f(6);
      unstuck = { inWall, away: G.dist(p0[0], p0[1], v.x, v.y) * 4 };
    }
    // the world carries the body far (a scene, a load, a building rising where it stood): the eye goes along at once —
    // never easing after it through the houses on the way, never left inside one (L-106)
    let warp = null;
    if (pb) {
      const far = Object.values(places).filter(Boolean).sort((a, b) => G.dist2(b[0], b[1], pb[0], pb[1]) - G.dist2(a[0], a[1], pb[0], pb[1]))[0];
      G.Avatar.place(far[0], far[1]); __E.f(30); G.Avatar.place(pb[0], pb[1]);
      let camIn = 0, gap = 0, inside = 0;
      for (let i = 0; i < 12; i++) {
        G.Main.frameFor(33); const c = G.Realm.camera().position; if (G.Cam3D.solid(c.x, c.y, c.z)) camIn++; if (G.Cam3D.inside) inside++;
        if (i === 0) { const a = G.Cam3D.last.at; gap = Math.hypot(a[0] - st.X, a[2] - st.Z); }
      }
      warp = { from: +(G.dist(far[0], far[1], pb[0], pb[1]) * 4).toFixed(1), gap: +gap.toFixed(2), camIn, inside };
    }
    return { out, unstuck, warp, qa: __E.qa() };
  });
  for (const k in e6.out) { const r = e6.out[k]; if (!r) { ok(`e6 terreno: ${k}`, true, 'não há este tipo de lugar por perto (nada a provar)'); continue; } ok(`e6 terreno: ${k}`, !r.bad && !r.under && !r.high && !r.camIn && !r.camLow && (k === 'costa' ? r.wet === r.marked : !r.wet) && r.maxUp > 0.4, JSON.stringify(r)); }
  ok('e6 encostado num prédio, nunca preso', e6.unstuck && !e6.unstuck.inWall && e6.unstuck.away > 1.5, JSON.stringify(e6.unstuck));
  ok('e6 o mundo leva o corpo longe: a câmera vai junto, sem atravessar casas', !e6.warp || (!e6.warp.camIn && !e6.warp.inside && e6.warp.gap < 1), e6.warp ? JSON.stringify(e6.warp) : 'não há prédios por perto (nada a provar)');
  ok('e6 verificador', !e6.qa.length, e6.qa.slice(0, 3).join(' · ') || 'limpo');
  await shot('e6-terreno');

  }
  if (await need('e7')) {
  // ================================ e7: save and load A–E ================================
  const e7 = await E(() => {
    const S = G.S; const Sv = G.Save; const out = {};
    __E.leave();
    const s = __E.town(); const v = __E.adults(s)[0]; const id = v.id;
    const load = str => { Sv.apply(JSON.parse(str)); __E.f(4); };
    // A) before
    const A = Sv.serialize(); load(A); out.A = { avatar: !!G.S.avatar, mode: G.Modes.state };
    // B) while incarnated: it opens incarnated
    __E.enter(G.S.villagers.get(id)); const b0 = G.S.villagers.get(id); const pB = [b0.x, b0.y];
    const B = Sv.serialize(); load(B); const b1 = G.S.villagers.get(id);
    out.B = { avatar: G.S.avatar && G.S.avatar.id, task: b1 && b1.task && b1.task.type, mode: G.Modes.state, at: b1 ? G.dist(pB[0], pB[1], b1.x, b1.y) : -1, hud: (document.querySelector('#inc-hud .ih-name') || {}).textContent };
    // D) after walking far
    const w = (() => { const x0 = b1.x, y0 = b1.y; G.Input3D.down.frente = true; G.Input3D.down.correr = true; G.Cam3D.yaw = 1.1; __E.f(240); G.Input3D.down.frente = false; G.Input3D.down.correr = false; __E.f(8); return G.dist(x0, y0, b1.x, b1.y) * 4; })();
    const pD = [b1.x, b1.y]; const D = Sv.serialize(); load(D); const d1 = G.S.villagers.get(id);
    out.D = { walked: w, at: d1 ? G.dist(pD[0], pD[1], d1.x, d1.y) : -1, avatar: G.S.avatar && G.S.avatar.id, mode: G.Modes.state };
    // C) after leaving
    __E.leave(); const C = Sv.serialize(); load(C); const c1 = G.S.villagers.get(id);
    out.C = { avatar: !!G.S.avatar, mode: G.Modes.state, task: c1 && c1.task ? c1.task.type : null };
    // E) after the body's death
    __E.enter(c1); G.Vg.damage(c1, 999, 'fire', false); __E.until(() => G.Modes.state === 'GOD', 400);
    const Es = Sv.serialize(); load(Es); out.E = { avatar: !!G.S.avatar, dead: !!G.S.dead.get(id), alive: G.S.villagers.has(id), mode: G.Modes.state };
    // a damaged save: the body's record pointing at nobody, garbage in its lists — loads clean, in the god's eyes
    const o = JSON.parse(B); o.avatar = { id: 987654, kind: 'dragao', asks: 'x', deeds: { conversa: 'muitas' }, seen: [null, 3], met: ['a'] };
    let dmg = true; try { G.Save.apply(o); __E.f(4); } catch (e) { dmg = false; } out.dmg = { loaded: dmg, avatar: !!G.S.avatar, mode: G.Modes.state };
    const o2 = JSON.parse(B); o2.avatar.asks = [{ txt: 5 }, null, { type: 'muster', txt: 'ok' }]; o2.avatar.deeds = { lenha: 3, bogus: 9, entrega: NaN };
    G.Save.apply(o2); __E.f(4); out.dmg2 = { avatar: G.S.avatar && G.S.avatar.id, asks: G.S.avatar && G.S.avatar.asks.length, deeds: G.S.avatar && JSON.stringify(G.S.avatar.deeds), mode: G.Modes.state };
    __E.base = new Set(QA.check().filter(e => e.sev <= 3).map(__E.qk));
    __E.leave();
    out.qa = __E.qa();
    return out;
  });
  ok('e7 A: save antes de encarnar', !e7.A.avatar && e7.A.mode === 'GOD', JSON.stringify(e7.A));
  ok('e7 B: save encarnado volta encarnado, no mesmo lugar', !!e7.B.avatar && e7.B.task === 'avatar' && e7.B.mode === 'INC' && e7.B.at < 0.01 && !!e7.B.hud, JSON.stringify(e7.B));
  ok('e7 C: save depois de desencarnar', !e7.C.avatar && e7.C.mode === 'GOD' && e7.C.task !== 'avatar', JSON.stringify(e7.C));
  ok('e7 D: depois de andar muito, a pessoa está onde ficou', e7.D.walked > 15 && e7.D.at < 0.01 && !!e7.D.avatar && e7.D.mode === 'INC', JSON.stringify(e7.D));
  ok('e7 E: depois da morte do corpo', !e7.E.avatar && e7.E.dead && !e7.E.alive && e7.E.mode === 'GOD', JSON.stringify(e7.E));
  ok('e7 save danificado: carrega limpo', e7.dmg.loaded && !e7.dmg.avatar && e7.dmg.mode === 'GOD' && e7.dmg2.asks === 1 && e7.dmg2.deeds === '{"lenha":3}', `${JSON.stringify(e7.dmg)} · ${JSON.stringify(e7.dmg2)}`);
  ok('e7 verificador', !e7.qa.length, e7.qa.slice(0, 3).join(' · ') || 'limpo');

  }
  if (await need('e9')) {
  // ================================ e9: the bad cases, and the hands changing the world ================================
  const e9 = await E(() => {
    const S = G.S; const out = {}; const s = __E.town();
    // captured by enemies (the war's own capture): the body is the captor's now
    { const v = __E.adults(s)[0]; __E.enter(v); const foe = __E.adults(null, o => o.set !== v.set)[0] || __E.adults(s)[1]; G.War.capture(v, foe, null); __E.until(() => G.Modes.state === 'GOD', 400); out.capture = { avatar: !!S.avatar, task: v.task && v.task.type, captive: !!v.captive, mode: G.Modes.state }; }
    // taken aboard a ship (Naval.board): the incarnation ends with it
    { const v = __E.adults(s)[0]; const sh = S.ships[0]; if (sh) { __E.enter(v); G.Naval.board(v, sh); const k = __E.until(() => !S.avatar, 60); const aboard = v.aboard === sh.id; __E.until(() => G.Modes.state === 'GOD', 400); out.ship = { released: k >= 0, avatar: !!S.avatar, aboard, mode: G.Modes.state }; if (v.aboard) G.Naval.unboard(v); } else out.ship = null; }
    // a building rises where the body stands: the world moves the body; the body follows the world
    // (someone standing on dry ground: the ship's part before may leave its person in the sea, and a house raised over a
    // swimmer — who is not pulled out, D-026 — proves nothing)
    { const v = __E.adults(s, o => !o.aboard && !o.inside && G.W.walkableXY(o.x, o.y))[0] || __E.adults(s)[0]; __E.enter(v); __E.f(4); const x = Math.floor(v.x), y = Math.floor(v.y);
      const b = G.Village.addBuilding('house', x, y, v.set, true); if (b) G.W.touchWalk && G.W.touchWalk(); __E.f(60, 50);
      out.building = { made: !!b, onIt: b ? (v.x >= b.x && v.x < b.x + b.w && v.y >= b.y && v.y < b.y + b.h && b.blocks) : null, walk: G.W.walkableXY(v.x, v.y), avatar: S.avatar && S.avatar.id === v.id };
      // the same on a ford (L-150): the water under the new building is no water to swim in — the building stops the feet, so
      // the world moves the body out like anyone (the swimmer's mark is for open water, which the world leaves alone, D-026)
      { const T = G.T, N = G.N; let at = null;
        for (let r = 1; r < 60 && !at; r++) for (let dy = -r; dy <= r && !at; dy++) for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = Math.floor(v.x) + dx, y = Math.floor(v.y) + dy; if (!G.W.inb(x, y)) continue;
          const i = y * N + x; if (S.type[i] === T.RIVER && G.W.walkable(i) && !S.road[i] && !S.occ[i] && G.W.reaches(v, x + 0.5, y + 0.5)) { at = [x, y]; break; } }
        if (at && G.Avatar.place(at[0] + 0.5, at[1] + 0.5)) { __E.f(6); const a0 = G.Possess.afloat(v);
          const f = G.Village.addBuilding('house', at[0], at[1], v.set, true); if (f) G.W.touchWalk && G.W.touchWalk();
          const on = () => !!f && v.x >= f.x && v.x < f.x + f.w && v.y >= f.y && v.y < f.y + f.h && f.blocks;
          const k = __E.until(() => !on(), 120, 50);
          out.ford = { at, made: !!f, before: a0, frames: k, onIt: on(), walk: G.W.walkableXY(v.x, v.y), afloat: G.Possess.afloat(v), avatar: S.avatar && S.avatar.id === v.id };
        } else out.ford = null; }
      // the ground sinks into the sea under the feet (the god's own reshaping): the water takes the body
      // (since v35 the player swims — D-026: who can swim stays in the body, afloat; who cannot, the water takes, and the god returns)
      const L = G.Powers.reshape; let sank = false; if (L) { L(Math.floor(v.x), Math.floor(v.y), 2.5, -1); sank = true; }
      const swims = !!(G.Possess.caps && G.Possess.caps(v).swim);
      __E.until(() => swims ? G.Possess.afloat(v) : G.Modes.state === 'GOD', 400, 50);
      out.sink = { sank, swims, afloat: G.Possess.afloat(v), avatar: !!S.avatar, alive: S.villagers.has(v.id), task: S.villagers.has(v.id) && v.task ? v.task.type : null, mode: G.Modes.state };
      // (and the next parts begin from the god, not from a body in the sea)
      __E.leave();
    }
    // the war calls, a scene wants the body: asked, not taken
    { const v = __E.adults(s, o => !o.inside)[2] || __E.adults(s)[0]; __E.enter(v);
      G.Vg.setTask(v, { type: 'muster', pri: 6 }); G.Vg.give(v, { type: 'fire', pri: 4 }); __E.f(4);
      const sc = G.Scene && G.Scene.list ? null : null; void sc;
      const asks = G.Possess.calls().map(q => q.type); const kept = v.task && v.task.type === 'avatar';
      out.calls = { asks, kept, hud: (document.querySelector('#inc-hud .ih-calls') || {}).textContent };
      // the hands: a tree felled with the woodcutters' felling, its wood carried to the people's store
      const tr = [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && !t.claim && G.W.reaches(v, t.x, t.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0];
      // (the body brought within arm's reach, as a player walks up to it: on the side the world's path arrives from,
      // a metre and a little from the thing — or on the spot, for a door)
      const near = (x, y, at) => { const p = G.W.findPath(v.x, v.y, x, y, true, 30000); if (!p) return false; const e = p.length ? p[p.length - 1] : [x, y]; let px = e[0], py = e[1]; // (an empty path: already there)
        if (!at) { const d = Math.hypot(e[0] - x, e[1] - y) || 1; for (const r of [0.3, 0.4, 0.22, 0.5]) { const qx = x + (e[0] - x) / d * r, qy = y + (e[1] - y) / d * r; if (G.W.walkableXY(qx, qy)) { px = qx; py = qy; break; } } } else { px = x; py = y; }
        G.Avatar.place(px, py); __E.f(6); G.Avatar.state().yaw = Math.atan2(y - v.y, x - v.x); return true; };
      const R = {};
      if (tr && near(tr.x, tr.y)) {
        v.carry = null; // (empty hands for the axe: a woodcutter taken with a full load is told "your hands are full")
        const chop0 = tr.chop; let swings = 0;
        // (the very tree: the provider's own target, so a passer-by does not take the prompt in the test)
        const T = { id: 'arvore', t: { tr, X: tr.x * 4, Z: tr.y * 4 } };
        for (let k = 0; k < 20 && tr.stage === 'grow'; k++) { const r = G.Interact.run(T); if (!r || !r.ok) { R.why = r && r.msg; break; } swings++; __E.until(() => !G.Avatar.busy(), 120); }
        __E.until(() => tr.stage === 'log', 300, 50);
        for (let k = 0; k < 4 && !v.carry && tr.stage === 'log'; k++) { G.Interact.run(T); __E.until(() => !G.Avatar.busy(), 120); }
        R.tree = { swings, chop0, felled: tr.stage === 'log' || tr.stage === 'stump', carry: v.carry ? v.carry.k + ':' + v.carry.n : null, why: R.why || null };
        const sh = G.Village.nearestDropoff(v.x, v.y, v.set); const stock0 = G.Fac.stockV(v).wood;
        if (sh && v.carry) { const d = G.Vg.door(sh); near(d[0], d[1], true); G.Interact.run({ id: 'porta', t: { b: sh, X: d[0] * 4, Z: d[1] * 4 } }); __E.until(() => !G.Avatar.busy(), 120); }
        R.store = { stock0, stock1: G.Fac.stockV(v).wood, carry: !!v.carry };
        // a meal at the store: the stock gives it, the hunger goes
        const sh2 = G.Village.nearestDropoff(v.x, v.y, v.set); const d2 = sh2 && G.Vg.door(sh2); if (d2) near(d2[0], d2[1], true);
        // (the stock read at the meal itself, in the world's step: over the frames of the meal the people's own deliveries come
        // into the same store — the stock as a whole may well grow — T-077)
        v.hunger = 70; const f0 = G.Fac.stockV(v).food; let ate = false, took = null; const act0 = G.Avatar.act;
        G.Avatar.act = function (o) { if (o && o.vact === 'eat' && o.op) { const op0 = o.op; o.op = w => { const st = (G.Army && G.Army.larder(w)) || G.Fac.stockV(w); const a = st.food; const r = op0(w); took = [a, st.food]; return r; }; } return act0.apply(this, arguments); };
        try { if (sh2) { const r = G.Interact.run({ id: 'porta', t: { b: sh2, X: d2[0] * 4, Z: d2[1] * 4 } }); __E.until(() => !G.Avatar.busy(), 160); ate = v.hunger < 70; R.mealMsg = r && r.msg; } } finally { G.Avatar.act = act0; }
        R.meal = { ate, took, food: [f0, G.Fac.stockV(v).food], hunger: v.hunger };
      }
      // berries
      // (a bush someone is picking is theirs until they are done — «X está colhendo aqui»: the next free one, up to four — T-172)
      const picking = b => { const o = b.claim && b.claim !== v.id ? S.villagers.get(b.claim) : null; return !!(o && o.task && o.task.id === b.id); };
      const bus = [...S.bushes.values()].filter(b => b.berries >= 2 && G.W.reaches(v, b.x, b.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y)).slice(0, 4);
      // (the picker's time for a load: 2.2 s of the world ÷ workMul — at the body's pace, two hundred frames and more: L-133)
      for (const bu of bus) { if (picking(bu) || !near(bu.x, bu.y) || picking(bu)) continue; const n0 = bu.berries; v.hunger = 60; const r = G.Interact.run({ id: 'arbusto', t: { bu, X: bu.x * 4, Z: bu.y * 4 } }); __E.until(() => !G.Avatar.busy(), 500); R.berries = { before: n0, after: bu.berries, hunger: v.hunger, msg: r && r.msg }; break; }
      // a rock broken the quarrymen's way: its stone leaves it, into the arms; then carried to a building going up (a well
      // the town plans by its own rule, if none of its works wants stone): the work's need falls by what was brought
      { v.carry = null; // (empty hands for the rock)
        const ro = [...S.rocks.values()].filter(r => r.stone >= 2 && !r.claim && G.W.reaches(v, r.x, r.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0];
        // (stroke after stroke, as one holding E: the quarryman's load comes at his 3.8 s of work — L-133)
        if (ro && near(ro.x, ro.y)) { const s0 = ro.stone; let r = null, n = 0; for (; n < 16 && !(v.carry && v.carry.k === 'stone') && S.rocks.has(ro.id); n++) { r = G.Interact.run({ id: 'pedra', t: { r: ro, X: ro.x * 4, Z: ro.y * 4 } }); if (!r || !r.ok) break; __E.until(() => !G.Avatar.busy(), 200); } __E.f(2);
          R.rock = { before: s0, after: S.rocks.has(ro.id) ? ro.stone : 0, carry: v.carry ? v.carry.k + ':' + v.carry.n : null, strokes: n, msg: r && r.msg }; }
        if (v.carry && v.carry.k === 'stone') {
          const work = b => !b.built && b.need && b.need.stone > 0 && b.set === v.set && G.W.reaches(v, ...G.Vg.door(b));
          const set = S.settlements.get(v.set); const ob = [...S.buildings.values()].filter(work)[0] || (set && G.Village.startProject(set, 'well'));
          if (ob && work(ob)) { const d = G.Vg.door(ob); near(d[0], d[1], true); const cx = G.clamp(v.x, ob.x, ob.x + ob.w), cy = G.clamp(v.y, ob.y, ob.y + ob.h); G.Avatar.state().yaw = Math.atan2(cy - v.y, cx - v.x);
            const n0 = ob.need.stone; const r = G.Interact.run({ id: 'obra', t: { b: ob, X: cx * 4, Z: cy * 4 } }); __E.until(() => !G.Avatar.busy(), 160);
            R.obra = { type: ob.type, before: n0, after: ob.need.stone, carry: !!v.carry, msg: r && r.msg };
          } else R.obra = { none: true };
        }
      }
      // a prayer at the temple of the body's town: the devotion grows, and the faith (room for both: the god's faith tops at 999,
      // where a rich world's ready save already is — T-171)
      { const tp = [...S.buildings.values()].filter(b => b.type === 'temple' && b.built && b.set === v.set && G.W.reaches(v, ...G.Vg.door(b)))[0];
        // (the faithful's five seconds of the world before the temple: at the body's pace, four hundred frames and more — L-133)
        if (tp) { const d = G.Vg.door(tp); near(d[0], d[1], true); v.devotion = Math.min(v.devotion, 80); G.S.faith = Math.min(G.S.faith, 900); const d0 = v.devotion, f0 = G.S.faith; const r = G.Interact.run({ id: 'porta', t: { b: tp, X: d[0] * 4, Z: d[1] * 4 } }); __E.until(() => !G.Avatar.busy(), 900); R.temple = { before: d0, after: v.devotion, faith: +(G.S.faith - f0).toFixed(2), msg: r && r.msg }; } else R.temple = null; }
      // home through its door, tired: the body goes in and lies down (the world's sleep), and gets up and out by the door again
      { const h = S.buildings.get(v.home);
        if (h && h.built && G.W.reaches(v, ...G.Vg.door(h))) { const d = G.Vg.door(h); near(d[0], d[1], true); v.energy = 30; const r = G.Interact.run({ id: 'porta', t: { b: h, X: d[0] * 4, Z: d[1] * 4 } }); __E.until(() => !G.Avatar.busy(), 120);
          R.home = { inside: v.inside === h.id, sleeping: !!v.sleeping, msg: r && r.msg }; G.Possess.wake(v); __E.f(6); R.home.out = !v.inside && !v.sleeping && G.W.walkableXY(v.x, v.y); } else R.home = null; }
      // a talk: up to someone, E — the card is theirs, and they answer with a line over their head (seen by the god too)
      { const o = [...S.villagers.values()].filter(x => x.id !== v.id && !x.inside && !x.sleeping && x.age >= 6 && !x.aboard && G.W.reaches(v, x.x, x.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0];
        if (o) { near(o.x, o.y); G.Avatar.state().yaw = Math.atan2(o.y - v.y, o.x - v.x); __E.f(8); const b = G.Interact.best(); G.IncUI.use(); __E.f(4);
          const card = document.querySelector('#inc-card'); const said = G.Talk && G.Talk.list.find(t => t.id === (b && b.t.o ? b.t.o.id : -1));
          R.talk = { best: b && b.id, label: b && b.label, card: card && !card.classList.contains('hidden') ? (card.querySelector('h3') || {}).textContent : null, said: said ? said.txt : null, name: b && b.t.o ? b.t.o.name : null };
          G.IncUI.closeAll(); G.Modes.setPanel(null); } }
      // a scene that wants the body is refused (it is not taken from the player)
      if (G.Scene && G.Scene.H && G.Scene.H.take) R.scene = G.Scene.H.take({ id: -1, taken: new Map() }, v) === false;
      out.hands = R; out.deeds = Object.assign({}, S.avatar ? S.avatar.deeds : {});
      __E.leave(); out.bio = G.Life.bioList(v).slice(-1)[0].txt;
    }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  ok('e9 capturado por inimigos: o corpo vai com o mundo', e9.capture && !e9.capture.avatar && e9.capture.captive && e9.capture.mode === 'GOD', JSON.stringify(e9.capture));
  ok('e9 levado a um navio: a encarnação acaba', !e9.ship || (e9.ship.released && !e9.ship.avatar && e9.ship.aboard && e9.ship.mode === 'GOD'), JSON.stringify(e9.ship));
  ok('e9 um prédio nasce em cima: o mundo move o corpo, o corpo segue', e9.building.made && !e9.building.onIt && e9.building.walk && e9.building.avatar, JSON.stringify(e9.building));
  ok('e9 um prédio nasce em cima de um vau: não é água de nadar, o mundo tira o corpo de lá (L-150)', !e9.ford || (e9.ford.made && !e9.ford.before && !e9.ford.onIt && e9.ford.walk && !e9.ford.afloat && e9.ford.avatar), JSON.stringify(e9.ford));
  ok('e9 a terra afunda sob os pés: quem sabe nadar nada, encarnado (D-026); quem não sabe, a água leva e o deus volta', e9.sink.sank && e9.sink.alive && (e9.sink.swims ? e9.sink.avatar && e9.sink.afloat : !e9.sink.avatar && e9.sink.mode === 'GOD'), JSON.stringify(e9.sink));
  ok('e9 a guerra e o fogo chamam: viram chamados, o corpo fica', e9.calls.kept && e9.calls.asks.includes('muster') && e9.calls.asks.includes('fire') && /armas/.test(e9.calls.hud || ''), JSON.stringify(e9.calls));
  const H = e9.hands;
  ok('e9 mãos: a árvore cai pelo corte, a lenha vai para os braços', H.tree && H.tree.felled && /^wood:/.test(H.tree.carry || ''), JSON.stringify(H.tree));
  ok('e9 mãos: a lenha entra no estoque do povo', H.store && H.store.stock1 > H.store.stock0 && !H.store.carry, JSON.stringify(H.store));
  ok('e9 mãos: comer no armazém tira do estoque e mata a fome', H.meal && H.meal.ate && !!H.meal.took && H.meal.took[1] < H.meal.took[0], JSON.stringify(H.meal));
  ok('e9 mãos: as frutas saem do arbusto', !H.berries || (H.berries.after < H.berries.before), JSON.stringify(H.berries));
  ok('e9 mãos: a pedra quebrada vai para os braços', H.rock && H.rock.after < H.rock.before && /^stone:/.test(H.rock.carry || ''), JSON.stringify(H.rock));
  ok('e9 mãos: a pedra levada à obra entra nela', H.obra && !H.obra.none && H.obra.after < H.obra.before && !H.obra.carry, JSON.stringify(H.obra));
  ok('e9 mãos: rezar no templo — a devoção e a fé do fiel', H.temple === null || (H.temple.after > H.temple.before && H.temple.faith > 0), H.temple === null ? 'a cidade não tem templo ao alcance (nada a provar)' : JSON.stringify(H.temple));
  ok('e9 mãos: em casa pela porta, dorme; acorda e sai pela porta', H.home === null || (H.home.inside && H.home.sleeping && H.home.out), H.home === null ? 'sem casa ao alcance (nada a provar)' : JSON.stringify(H.home));
  ok('e9 conversar: a ficha é da pessoa, ela responde (o balão também no Modo Deus)', H.talk && H.talk.best === 'pessoa' && H.talk.card && H.talk.card.startsWith(H.talk.name) && !!H.talk.said, JSON.stringify(H.talk));
  ok('e9 uma cena não toma o corpo', H.scene !== false, String(H.scene));
  ok('e9 os feitos entram na biografia', /cortou 1 árvore/.test(e9.bio) && /levou ao armazém/.test(e9.bio) && /conversou com 1 pessoa/.test(e9.bio) && /quebrou \d pedras?/.test(e9.bio) && /levou às obras 1 carga/.test(e9.bio) && (!H.temple || /rezou 1 vez/.test(e9.bio)) && (!H.home || /dormiu 1 noite/.test(e9.bio)), `${JSON.stringify(e9.deeds)} · ${e9.bio}`);
  ok('e9 verificador', !e9.qa.length && e9.err === '{}', `${e9.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e9.err}`);

  }
  if (await need('e10')) {
  // ================================ e10: the interface ================================
  const e10 = await E(() => {
    const S = G.S; const s = __E.town(); const out = {}; __E.leave(); // (from the god's view, whatever the part before left)
    // (at night everyone is in bed: the god waits for the morning, at 8×)
    if (!__E.adults(s, o => o.mother).length) { G.UI.setSpeed(8); __E.until(() => __E.adults(s, o => o.mother).length > 0, 2000, 100); G.UI.setSpeed(1); }
    const v = __E.adults(s, o => o.mother)[0]; G.UI.select(v); __E.f(4);
    const btn = document.querySelector('#inspector button[data-act=incarnate]'); out.btn = btn ? !btn.disabled : null;
    const baby = [...S.villagers.values()].find(o => o.age < 3); if (baby) { G.UI.select(baby); __E.f(4); const b2 = document.querySelector('#inspector button[data-act=incarnate]'); out.baby = b2 ? { disabled: b2.disabled, why: b2.title } : null; }
    G.UI.select(v); __E.f(4); document.querySelector('#inspector button[data-act=incarnate]').click(); __E.until(() => G.Modes.state === 'INC', 300);
    out.clicked = G.Modes.state === 'INC' && S.avatar && S.avatar.id === v.id;
    out.hud = document.querySelector('#inc-hud .ih-name').textContent;
    // the card of the mother, as the world knows her
    const m = G.person(v.mother); const card = G.Interact.personCard(v, null); out.card = { parents: card.parents.join(' e '), mother: m ? m.name : null };
    // the menu: Esc opens it, the world pauses; the keys can be changed
    const c0 = S.clock; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); __E.f(10); out.menu = { open: G.Modes.menuOpen(), paused: S.clock === c0 };
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); __E.f(4); out.menu.closed = !G.Modes.menuOpen();
    G.Input3D.rebind('pular', 'j'); out.rebind = G.Input3D.actionOf('j') === 'pular' && G.Input3D.actionOf(' ') !== 'pular'; G.Input3D.resetBinds();
    // the key G goes back up
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' })); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'g' })); __E.until(() => G.Modes.state === 'GOD', 400); out.gkey = G.Modes.state === 'GOD';
    // the key I, in the god's view: someone near the middle of the screen
    G.UI.select(null); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' })); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' })); out.ikey = G.Modes.state !== 'GOD'; __E.until(() => G.Modes.state === 'INC', 300);
    // the fingers: a thumb on the left half pushed up walks the body forward; the on-screen buttons show
    { const cv = G.Realm.canvas(); const b = G.Possess.body(); const x0 = b.x, y0 = b.y;
      const T = (id, x, y) => new Touch({ identifier: id, target: cv, clientX: x, clientY: y });
      cv.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [T(1, 200, 450)], touches: [T(1, 200, 450)], cancelable: true, bubbles: true }));
      cv.dispatchEvent(new TouchEvent('touchmove', { changedTouches: [T(1, 200, 380)], touches: [T(1, 200, 380)], cancelable: true, bubbles: true }));
      __E.f(60);
      cv.dispatchEvent(new TouchEvent('touchend', { changedTouches: [T(1, 200, 380)], touches: [], cancelable: true, bubbles: true })); __E.f(4);
      const tb = document.querySelector('#inc-hud .ih-touch');
      out.touch = { walked: +(G.dist(x0, y0, b.x, b.y) * 4).toFixed(1), buttons: !!tb && !tb.classList.contains('hidden') };
    }
    __E.leave();
    return out;
  });
  ok('e10 o botão Encarnar no painel da pessoa (e o motivo quando não pode)', e10.btn === true && (!e10.baby || (e10.baby.disabled && /pequen/.test(e10.baby.why))) && e10.clicked, JSON.stringify({ btn: e10.btn, baby: e10.baby, clicked: e10.clicked, hud: e10.hud }));
  ok('e10 a ficha diz quem são os pais (dos registros do mundo)', e10.card.mother && e10.card.parents.includes(e10.card.mother), JSON.stringify(e10.card));
  ok('e10 Esc abre o menu e pausa; as teclas mudam; G volta; I encarna', e10.menu.open && e10.menu.paused && e10.menu.closed && e10.rebind && e10.gkey && e10.ikey, JSON.stringify({ menu: e10.menu, rebind: e10.rebind, g: e10.gkey, i: e10.ikey }));
  ok('e10 no toque: o polegar à esquerda anda, os botões aparecem', e10.touch.walked > 2 && e10.touch.buttons, JSON.stringify(e10.touch));

  }
  if (await need('e11')) {
  // ================================ e11: the looks of the 3D, and that they are the world's ================================
  const e11 = await E(() => {
    __E.fresh('cidade'); const S = G.S, N = G.N, T = G.T; const K = G.Ground3D.K; const out = {};
    const s = __E.town(); const v = __E.adults(s)[0]; out.inn = __E.enter(v); __E.f(30); const b = __E.body();
    // the ground's picture: round the body, and every street, field and sea tile of the map
    out.near = G.Ground3D.check(b.x, b.y, 30, 400);
    let road = 0, roadOk = 0, farm = 0, farmOk = 0, sea = 0, seaOk = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; const t = G.Ground3D.texel(x, y); if (!t) continue; const burnt = S.burnt[i] > 0 || S.scar[i] > 0;
      if (S.road[i] && S.type[i] > T.RIVER && !burnt) { road++; if (t[3] === K.gravel || t[3] === K.paved || t[3] === K.highway) roadOk++; }
      const bb = S.occ[i] && S.buildings.get(S.occ[i]); if (bb && bb.type === 'farm' && !S.road[i] && !burnt && S.type[i] > T.RIVER) { farm++; if (t[3] === K.field) farmOk++; }
      if (S.type[i] <= T.SEA) { sea++; if (t[3] === K.bed) seaOk++; }
    }
    out.map = { road: [roadOk, road], farm: [farmOk, farm], sea: [seaOk, sea] };
    // the picture follows the world: a tile near the body scorched, and its texel turns to ash a few frames later
    let spot = null; for (let r = 2; r < 9 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r; dx++) { const x = Math.floor(b.x) + dx, y = Math.floor(b.y) + dy; if (!G.W.inb(x, y)) continue; const i = y * N + x; if ((S.type[i] === T.GRASS || S.type[i] === T.MEADOW) && !S.occ[i] && !S.road[i] && !S.treeAt[i] && !S.objAt[i]) { spot = [x, y, i]; break; } }
    if (spot) { const k0 = G.Ground3D.texel(spot[0], spot[1])[3]; S.burnt[spot[2]] = 80; const fr = __E.until(() => G.Ground3D.texel(spot[0], spot[1])[3] === K.burnt, 160); out.burn = { before: k0, frames: fr, after: G.Ground3D.texel(spot[0], spot[1])[3], burnt: K.burnt }; S.burnt[spot[2]] = 0; }
    // the plants that sway and the stuff of the walls: in the geometries of the near world
    let plants = 0, swayed = 0, solid = 0, noAP = 0, pat = 0, all = 0; const M = G.Realm.mats();
    G.Realm.scene().traverse(o => { if (!o.isMesh || !o.geometry || o.isInstancedMesh) return; const g = o.geometry;
      if (o.material === M.plant) { plants++; if (g.attributes.aK) swayed++; }
      if (o.material === M.solid) { solid++; const a = g.attributes.aP; if (!a) { noAP++; return; } for (let k = 0; k < a.count; k++) if (a.array[k] > 0) pat++; all += a.count; } });
    out.geo = { plants, swayed, solid, noAP, share: all ? +(pat / all).toFixed(2) : 0 };
    // (and the houses near the body: each with the walls and the roof of its people — planks and turf in the north, tiles in Rome)
    const hs = [...S.buildings.values()].filter(q => q.built && (q.type === 'house' || q.type === 'hut' || q.type === 'sobrado') && G.dist(q.x, q.y, b.x, b.y) < 30).slice(0, 6);
    out.houses = hs.map(q => { const r = G.Build3D.patsOf(q); return { id: q.id, ok: !!(r.pats[r.wall] && r.pats[r.roof]), wall: r.wall, roof: r.roof, pats: r.pats }; });
    // fire near the body: smoke and sparks rise; the points stay numbers in their pool
    // (what burns here: a tree, a bush — in the cold the grass does not take fire)
    let fs = null; for (let r = 2; r < 12 && !fs; r++) for (let dy = -r; dy <= r && !fs; dy++) for (let dx = -r; dx <= r; dx++) { const x = Math.floor(b.x) + dx, y = Math.floor(b.y) + dy; if (!G.W.inb(x, y)) continue; const i = y * N + x; const fu = G.Nature.fuel(i); if (fu && fu !== 'building' && fu !== 'crop') { fs = i; break; } }
    if (fs !== null) { const p0 = G.FX3D.particles || 0; const lit = G.Nature.ignite(fs, 0.9); __E.f(45); out.fire = { lit, before: p0, after: G.FX3D.particles, burning: S.fire[fs] > 0, check: G.FX3D.check() }; G.Nature.extinguish(fs, 9); }
    // a tree near the body felled by the world: drawn falling, then lying — and the falling picture gone
    const tr = [...S.trees.values()].filter(t => t.stage === 'grow' && t.size > 0.5).sort((p, q) => G.dist2(p.x, p.y, b.x, b.y) - G.dist2(q.x, q.y, b.x, b.y))[0];
    if (tr && G.dist(tr.x, tr.y, b.x, b.y) < 18) { G.Nature.fellTree(tr, 1); __E.f(3); const during = G.FX3D.fallingN(); const fr = __E.until(() => tr.stage !== 'fall', 300); __E.f(3); out.fall = { during, frames: fr, after: G.FX3D.fallingN(), stage: tr.stage, check: G.FX3D.check() }; }
    // someone standing in front of the body turns their head to it
    // the head turned to the body: the rule (in front, near, idle or talking — not behind, not far, not bent over work)
    // and the living people round the body who stand in front of it
    { const F = G.People3D.lookFor; const av0 = { X: 2, Z: 1 };
      out.lookRule = { front: +F(0, 0, 0, av0, 'idle').toFixed(2), behind: F(0, 0, 0, { X: -2, Z: 0 }, 'idle'), far: F(0, 0, 0, { X: 9, Z: 0 }, 'talk'), work: F(0, 0, 0, av0, 'low'), side: +F(Math.PI / 2, 0, 0, { X: 0, Z: 3 }, 'talk').toFixed(2) };
      const av = G.People3D.avatar; let n = 0, good = 0; __E.f(20);
      for (const p of G.People3D.walkers) { const vs = G.People3D.visOf(p[7]); if (!vs || !av) continue; const want = F(vs.yaw, p[0], p[2], av, vs.st); if (!want) continue; n++; if (Math.abs((vs.pose.lookY || 0) - want) < 0.35 || Math.sign(vs.pose.lookY || 0) === Math.sign(want)) good++; }
      out.look = { n, good }; }
    // the drawing leaves the world alone: with the world paused (the menu), a second of frames changes neither its chance nor its clock
    G.Modes.menu(true); __E.f(2); const r0 = JSON.stringify(S.rng), c0 = S.clock; __E.f(30); out.still = { rng: JSON.stringify(S.rng) === r0, clock: S.clock === c0 }; G.Modes.menu(false);
    out.people = G.People3D.check(); __E.leave(); out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  ok('e11 o chão do 3D pinta o que o mundo tem (perto do corpo, ruas, roças, mar; nenhuma neve na água ou no quente, nenhum branco do frio sob o capim)', e11.inn && e11.near.n > 300 && e11.near.bad <= 2 && e11.near.snowBad === 0 && e11.near.paleBad === 0 && e11.map.road[0] === e11.map.road[1] && e11.map.road[1] > 0 && e11.map.farm[0] === e11.map.farm[1] && e11.map.sea[0] === e11.map.sea[1], JSON.stringify({ near: e11.near, map: e11.map }));
  ok('e11 o chão segue o mundo: a casa queimada vira cinza', e11.burn && e11.burn.frames >= 0 && e11.burn.after === e11.burn.burnt, JSON.stringify(e11.burn));
  ok('e11 plantas que balançam, paredes e telhados com o material do povo', e11.geo.plants > 0 && e11.geo.swayed === e11.geo.plants && e11.geo.solid > 0 && !e11.geo.noAP && e11.houses.length > 0 && e11.houses.every(h => h.ok), JSON.stringify(e11.geo) + ' · casas: ' + e11.houses.map(h => `#${h.id} ${h.ok ? 'ok' : 'parede ' + h.wall + '/telhado ' + h.roof + ' em ' + JSON.stringify(h.pats)}`).join(', '));
  ok('e11 o fogo solta fumaça e faíscas', e11.fire && e11.fire.lit && e11.fire.after > e11.fire.before + 10 && !e11.fire.check.length, e11.fire ? JSON.stringify(e11.fire) : 'nada que queime perto');
  ok('e11 a árvore derrubada cai e deita', !e11.fall || (e11.fall.during === 1 && e11.fall.after === 0 && e11.fall.stage === 'log' && !e11.fall.check.length), e11.fall ? JSON.stringify(e11.fall) : 'nenhuma árvore perto (nada a provar)');
  ok('e11 quem está na frente vira a cabeça para o corpo', Math.abs(e11.lookRule.front + 0.46) < 0.02 && !e11.lookRule.behind && !e11.lookRule.far && !e11.lookRule.work && Math.abs(e11.lookRule.side) < 0.02 && (!e11.look.n || e11.look.good >= e11.look.n * 0.7), JSON.stringify({ regra: e11.lookRule, perto: e11.look }));
  ok('e11 com o mundo parado, o desenho não mexe no mundo', e11.still.rng && e11.still.clock, JSON.stringify(e11.still));
  ok('e11 verificador', !e11.qa.length && e11.err === '{}' && !e11.people.length, `${e11.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e11.err} · ${e11.people.join(' · ')}`);
  }
  if (await need('e12')) {
  // ================================ e12: what the world has, the 3D shows ================================
  const e12 = await E(() => {
    __E.fresh('cidade'); const S = G.S, N = G.N, T = G.T, P = G.Powers; const TL = G.Space.TILE, HM = G.Space.HM; const out = {};
    const s = __E.town(); const v = __E.adults(s)[0]; out.inn = __E.enter(v); __E.f(20); const b = __E.body(); const st = G.Avatar.state();
    const near = (f, R) => { let best = null, bd = 1e9; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { const i = y * N + x; if (!f(i, x, y)) continue; const d = G.dist2(x, y, b.x, b.y); if (d < bd && d < (R || 80) ** 2) { bd = d; best = [x + 0.5, y + 0.5]; } } return best; };
    // the dragon: woken by the god's power, brought over the body, flying, breathing, asleep on its hoard; then its bones
    P.dragon(b.x, b.y); const d = (S.dragons || [])[S.dragons.length - 1]; out.dragon = null;
    if (d) {
      // (the world paused — the menu — so the dragon stays as set: what is tested is the drawing of it)
      d.x = b.x + 6; d.y = b.y; d.h = G.W.groundH(d.x, d.y) + 9; d.st = 'caca'; G.Modes.menu(true); __E.f(8);
      const L1 = G.Dragon3D.drawnList(); const r = L1[0];
      out.dragon = { drawn: L1.length, off: r ? Math.hypot(r.X - d.x * TL, r.Z - d.y * TL) : 99, dy: r ? Math.abs(r.Y - d.h * HM) : 99, mode: r && r.mode };
      const p0 = G.FX3D.particles; d.breath = 1; d.st = 'passe'; __E.f(10); const L2 = G.Dragon3D.drawnList(); out.dragon.breath = { on: !!(L2[0] && L2[0].breathing), parts: G.FX3D.particles - p0, light: G.Dragon3D.breath };
      d.breath = 0; d.st = 'dorme'; d.x = d.lx = b.x + 5; d.y = d.ly = b.y + 2; d.h = G.W.groundH(d.x, d.y); d.alt = 0; d.hoard = 40; __E.f(8);
      const L3 = G.Dragon3D.drawnList(); out.dragon.sleep = { mode: L3[0] && L3[0].mode, coins: G.Dragon3D.coins };
      S.dragons.splice(S.dragons.indexOf(d), 1); S.dragonBones = S.dragonBones || []; S.dragonBones.push({ id: S.nextId++, x: b.x + 4, y: b.y - 3, hd: 0.5, name: d.name, hue: d.hue, day: S.day }); __E.f(4);
      out.dragon.bones = G.Dragon3D.bones; out.dragon.after = G.Dragon3D.drawn; G.Modes.menu(false); __E.f(2);
    }
    // night: the body carries a torch, and so do some who walk; its flame burns and lights round it
    const t0 = S.time; S.time = 0.86; G.Input3D.down.frente = true; __E.f(16); G.Input3D.down.frente = false; __E.f(4);
    out.night = { torch: !!(G.People3D.avatar && G.People3D.avatar.look.torch), flames: G.People3D.flames.length, drawn: G.FX3D.torches };
    S.time = t0; __E.f(4); out.day = { torch: !!(G.People3D.avatar && G.People3D.avatar.look.torch) };
    // the carts on the roads: the body taken beside one
    const c = (S.carts || [])[0]; out.cart = null;
    if (c) { const p = near((i, x, y) => G.W.walkable(i) && G.dist(x + 0.5, y + 0.5, c.x, c.y) < 5, 400); if (p) { G.Avatar.place(p[0], p[1]); __E.f(6); out.cart = { bed: G.Things3D.n.bed || 0, ox: G.Things3D.n.ox || 0, carts: S.carts.length }; } }
    // the beasts of the sea: one by the shore if the sea has none near
    const shore = near((i, x, y) => G.W.walkable(i) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, q]) => S.type[(y + q) * N + x + a] <= T.SEA), 400);
    out.sea = null;
    if (shore) {
      G.Avatar.place(shore[0], shore[1]); __E.f(4);
      const w = near((i, x, y) => S.type[i] <= T.SEA && G.dist(x, y, shore[0], shore[1]) > 3, 30);
      if (w) { const a = G.Animals.spawn ? G.Animals.spawn('dolphin', w[0], w[1]) : null; __E.f(6); out.sea = { spawned: !!a, drawn: G.Things3D.n.sea || 0 }; }
    }
    // the god's gifts over the town: gold falling and heaped, wine leaping from a well
    const set = __E.town(); const tp = near((i, x, y) => G.W.walkable(i) && G.dist(x + 0.5, y + 0.5, set.cx, set.cy) < 6, 400); if (tp) G.Avatar.place(tp[0], tp[1]); __E.f(2);
    P.goldrain(set.cx, set.cy); __E.f(30); out.gold = { rains: (S.gifts && S.gifts.rains.length) || 0, coins: G.Things3D.n.coin || 0 };
    // the dead where they fell: a man of the town struck down near the body
    // (one on land, the nearest: one who dies at sea leaves no body on the shore; the body goes to stand beside them)
    const bb = __E.body(); const onLand = q => q !== bb && q.age >= 18 && !q.inside && !q.aboard && !q.jail && G.W.walkableXY(q.x, q.y);
    const o = [...S.villagers.values()].filter(onLand).sort((p, q) => G.dist(p.x, p.y, bb.x, bb.y) - G.dist(q.x, q.y, bb.x, bb.y))[0];
    out.dead = null; if (o) { if (G.dist(o.x, o.y, bb.x, bb.y) > 6) G.Avatar.place(o.x + 0.6, o.y) || G.Avatar.place(o.x, o.y + 0.6) || G.Avatar.place(o.x, o.y); __E.f(2);
      G.Vg.damage(o, 9999, 'war', true); __E.f(10); out.dead = { gone: !S.villagers.has(o.id), corpses: G.Carnage.view().corpses.length, drawn: G.People3D.dead }; }
    // the grass round the body: at the medium quality a field of blades, where the world's ground grows grass and nowhere else
    G.Realm.setQuality('media'); __E.f(24); // (the picture round the body is painted again, four rows a frame)
    let bad = 0, n = 0; const gm = G.Ground3D.grassMap(); const gd = gm && gm.image.data; const badAt = [];
    if (gd) for (let y = Math.max(0, Math.floor(b.y) - 20); y < Math.min(N, Math.floor(b.y) + 20); y++) for (let x = Math.max(0, Math.floor(b.x) - 20); x < Math.min(N, Math.floor(b.x) + 20); x++) { const i = y * N + x; if (!(S.occ[i] || S.road[i] || S.type[i] <= T.RIVER)) continue; n++; if (gd[i * 4] > 0) { bad++; if (badAt.length < 3) { const bb = S.occ[i] && S.buildings.get(S.occ[i]); badAt.push([x, y, bb ? bb.type : S.road[i] ? 'rua' : 'água', gd[i * 4]]); } } }
    out.grass = { on: G.Grass3D.on, clumps: G.Grass3D.clumps, checked: n, onBad: bad, badAt };
    G.Realm.setQuality('baixa');
    out.check = [].concat(G.Dragon3D.check(), G.Things3D.check(), G.People3D.check());
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  const D = e12.dragon;
  ok('e12 o dragão do mundo voa no 3D onde o mundo diz', D && D.drawn >= 1 && D.off < 0.6 && D.dy < 0.6 && D.mode === 'fly', JSON.stringify(D));
  ok('e12 o sopro do dragão: fogo do focinho ao chão, e a luz dele', D && D.breath.on && D.breath.parts > 20 && D.breath.light > 0, D ? JSON.stringify(D.breath) : '-');
  ok('e12 o dragão dorme no covil sobre o tesouro; morto, ficam os ossos', D && D.sleep.mode === 'sleep' && D.sleep.coins > 10 && D.bones >= 1 && D.after === 0, D ? JSON.stringify({ sleep: D.sleep, bones: D.bones, after: D.after }) : '-');
  ok('e12 à noite o corpo leva uma tocha acesa (de dia não)', e12.night.torch && e12.night.flames >= 1 && e12.night.drawn >= 1 && !e12.day.torch, JSON.stringify({ night: e12.night, day: e12.day }));
  ok('e12 as carroças das estradas aparecem, com o boi', !e12.cart || (e12.cart.bed >= 1 && e12.cart.ox >= 1), e12.cart ? JSON.stringify(e12.cart) : 'não há carroças neste mundo (nada a provar)');
  ok('e12 os bichos do mar aparecem na água', !e12.sea || !e12.sea.spawned || e12.sea.drawn >= 1, e12.sea ? JSON.stringify(e12.sea) : 'sem costa por perto');
  ok('e12 a chuva de ouro do deus cai também no 3D', e12.gold.rains >= 1 && e12.gold.coins >= 20, JSON.stringify(e12.gold));
  ok('e12 os mortos ficam onde caíram', !e12.dead || (e12.dead.gone && e12.dead.corpses >= 1 && e12.dead.drawn >= 1), e12.dead ? JSON.stringify(e12.dead) : 'ninguém por perto');
  ok('e12 o campo de capim: aceso na qualidade média, nunca em rua, casa ou água', e12.grass.on && e12.grass.clumps > 1000 && e12.grass.checked > 20 && e12.grass.onBad === 0, JSON.stringify(e12.grass));
  ok('e12 verificador', !e12.qa.length && e12.err === '{}' && !e12.check.length, `${e12.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e12.err} · ${e12.check.join(' · ')}`);
  await shot('e12-o-mundo-no-3d');
  }
  if (await need('e13')) {
  // ================================ e13: the body's new ways: climbing, sitting, waving, drinking, stroking ================================
  const e13 = await E(() => {
    __E.fresh('cidade'); const S = G.S, N = G.N, T = G.T; const HM = G.Space.HM, TL = G.Space.TILE; const out = {};
    const s = __E.town(); const v = __E.adults(s)[0]; out.inn = __E.enter(v); __E.f(10); const p0 = [v.x, v.y]; const st = G.Avatar.state(); const A = () => S.avatar.deeds;
    const TU = G.Avatar.TUNE; const fl = (x, y) => G.Avatar.floorAt((x + 0.5) * TL, (y + 0.5) * TL);
    // a boulder in the way: a big stone set on open flat ground near the body (the feet stand on its faces: G.Space.stoneTop)
    const flat = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = (y + dy) * N + x + dx; if (!G.W.walkable(j) || S.occ[j] || S.treeAt[j] || S.objAt[j] || S.road[j] || S.type[j] === T.RIVER) return false; } return Math.abs(fl(x - 2, y) - fl(x + 2, y)) < 0.8 && Math.abs(fl(x, y - 2) - fl(x, y + 2)) < 0.8; };
    let spot = null; for (let r = 2; r < 40 && !spot; r++) for (let k = 0; k < r * 8 && !spot; k++) { const a = k / (r * 8) * Math.PI * 2; const x = Math.round(v.x + Math.cos(a) * r), y = Math.round(v.y + Math.sin(a) * r); if (x > 4 && y > 4 && x < N - 5 && y < N - 5 && flat(x, y) && G.W.reaches(v, x + 0.5, y + 0.5)) spot = [x, y]; }
    out.climb = null;
    if (spot) {
      const rk = G.Nature.addRock(spot[0] + 0.5, spot[1] + 0.5, 40); const st0 = G.Space.stones(rk)[0]; const top = G.Space.stoneTop(st0.X, st0.Z); const g0 = G.W.hAt(rk.x, rk.y) * HM;
      // (from the west, three metres off, pushing east: up its face with the hands, along the top, and down the other side)
      G.Avatar.place(rk.x - 3 / TL, rk.y); __E.f(4); G.Cam3D.yaw = 0; G.Cam3D.pitch = 0.2; G.Input3D.down.frente = true;
      const y0 = st.Y; let bad = 0, climbF = 0, sunk = 0, maxY = -1e9, onTop = 0; const d0 = A().escalada || 0;
      for (let k = 0; k < 150; k++) { G.Main.frameFor(33); st.yaw = 0; const b = __E.body(); if (!G.W.walkableXY(b.x, b.y)) bad++; if (G.Avatar.climbing()) climbF++; if (!G.Avatar.climbing() && st.Y < G.Avatar.floorAt(st.X, st.Z) - 0.1) sunk++; maxY = Math.max(maxY, st.Y); if (!G.Avatar.climbing() && G.Space.stoneTop(st.X, st.Z) > g0 + 0.9 && Math.abs(st.Y - G.Space.stoneTop(st.X, st.Z)) < 0.05) onTop++; }
      G.Input3D.down.frente = false; __E.f(10);
      out.climb = { top: +(top - g0).toFixed(2), rose: +(maxY - y0).toFixed(2), climbF, onTop, deed: (A().escalada || 0) - d0, past: +(st.X - st0.X).toFixed(2), down: +(st.Y - G.Avatar.floorAt(st.X, st.Z)).toFixed(2), hurt: st.hurt || 0, bad, sunk, cam: G.Cam3D.inside };
      G.Nature.removeRock(rk); __E.f(2);
    }
    // a house wall is no ledge: pushing against it, the body stays at its foot
    out.tooHigh = null; let wallAt = null;
    for (const bd of S.buildings.values()) { if (wallAt || bd.ruin || bd.w > 3) continue; const y = bd.y + Math.floor(bd.h / 2), x = bd.x - 1; if (G.W.inb(x, y) && G.W.walkable(y * N + x) && !S.objAt[y * N + x] && !S.treeAt[y * N + x] && G.W.reaches(v, x + 0.5, y + 0.5)) wallAt = [x, y]; }
    if (wallAt) {
      G.Avatar.place(wallAt[0] + 0.3, wallAt[1] + 0.5); __E.f(4); G.Cam3D.yaw = 0; G.Input3D.down.frente = true; const y0 = st.Y; let bad = 0, climbF = 0; const d0 = A().escalada || 0;
      for (let k = 0; k < 60; k++) { G.Main.frameFor(33); st.yaw = 0; const b = __E.body(); if (!G.W.walkableXY(b.x, b.y)) bad++; if (G.Avatar.climbing()) climbF++; }
      G.Input3D.down.frente = false; __E.f(4);
      out.tooHigh = { rose: +(st.Y - y0).toFixed(2), climbF, deed: (A().escalada || 0) - d0, bad, x: +__E.body().x.toFixed(2), wall: wallAt[0] + 1 };
    }
    // sitting on the ground; walking gets the body up
    G.Avatar.place(p0[0], p0[1]); __E.f(4); out.sit = { ok: G.Avatar.sit() }; __E.f(20); out.sit.anim = st.anim;
    G.Input3D.down.frente = true; __E.f(30); G.Input3D.down.frente = false; out.sit.after = st.anim; out.sit.moved = st.speed > 0.2 || st.anim === 'walk';
    __E.f(10);
    // a wave: the body waves, those standing near wave back
    const p = G.Avatar.pos(); out.wave = { ok: G.Avatar.wave() }; __E.f(3); out.wave.anim = st.anim; out.wave.near = G.People3D.greet(p.X, p.Z); __E.f(50);
    // water: drunk from a river or lake; the sea is salt
    const nearT = f => { let best = null, bd = 1e9; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { const i = y * N + x; if (!G.W.walkable(i) || S.type[i] === T.RIVER) continue; if (!f(x, y)) continue; const d = G.dist2(x, y, v.x, v.y); if (d < bd) { bd = d; best = [x + 0.5, y + 0.5]; } } return best; };
    const by = k => (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => G.W.inb(x + a, y + b) && (k === 'sea' ? S.type[(y + b) * N + x + a] <= T.SEA : S.type[(y + b) * N + x + a] === T.RIVER && !S.road[(y + b) * N + x + a]));
    // (the nearest one, as the prompt would choose: a tile is 4 m, the water two tiles off on the diagonal is out of the arms' reach)
    const near = ts => ts.sort((p, q) => Math.hypot(p.X - st.X, p.Z - st.Z) - Math.hypot(q.X - st.X, q.Z - st.Z));
    out.drink = null; const rv = nearT(by('river'));
    if (rv) { G.Avatar.place(rv[0], rv[1]); __E.f(4); const ctx = G.Interact.ctx(); const pr = G.Interact.list.find(q => q.id === 'agua'); const ts = near(pr.find(ctx).filter(t => !t.sea)); const d0 = A().agua || 0;
      if (ts.length) { st.yaw = Math.atan2(ts[0].Z - st.Z, ts[0].X - st.X); __E.f(1); const r = G.Interact.run({ id: 'agua', t: ts[0] }); __E.until(() => !G.Avatar.busy(), 200); out.drink = { ran: !!(r && r.ok), deed: (A().agua || 0) - d0, msg: r && r.msg }; } }
    out.salt = null; const sp = nearT(by('sea'));
    if (sp) { G.Avatar.place(sp[0], sp[1]); __E.f(4); const ctx = G.Interact.ctx(); const pr = G.Interact.list.find(q => q.id === 'agua'); const ts = near(pr.find(ctx).filter(t => t.sea)); if (ts.length) { st.yaw = Math.atan2(ts[0].Z - st.Z, ts[0].X - st.X); __E.f(1); const r = G.Interact.run({ id: 'agua', t: ts[0] }); out.salt = { ok: !!(r && r.ok), msg: r && r.msg }; } }
    // a tame beast: stroked
    G.Avatar.place(p0[0], p0[1]); __E.f(4); const b = __E.body(); const a = G.Animals.spawn('ovelha', b.x + 0.4, b.y);
    out.pet = null; if (a) { a.dom = true; __E.f(2); const ctx = G.Interact.ctx(); const pr = G.Interact.list.find(q => q.id === 'carinho'); const ts = near(pr.find(ctx)); const d0 = A().carinho || 0;
      if (ts.length) { st.yaw = Math.atan2(ts[0].Z - st.Z, ts[0].X - st.X); __E.f(1); const r = G.Interact.run({ id: 'carinho', t: ts[0] }); __E.until(() => !G.Avatar.busy(), 200); out.pet = { ran: !!(r && r.ok), deed: (A().carinho || 0) - d0 }; } else out.pet = { found: 0 }; }
    // gold on the ground (the god's rain, a dragon's hoard): picked up before the others get there — into the house, or the hands
    G.Avatar.place(p0[0], p0[1]); __E.f(4);
    { const b = __E.body(); const h = G.Eco.homeOf(b); const c0 = h ? h.coin || 0 : b.purse || 0; const k0 = b.carry && b.carry.k === 'ouro' ? b.carry.n : 0;
      G.Powers.spillGold(b.x + 0.5, b.y, 12, G.Fac.idOfV(b), 'um teste'); const ctx = G.Interact.ctx(); const pr = G.Interact.list.find(q => q.id === 'ouro'); const ts = near(pr.find(ctx)); const d0 = A().ouro || 0;
      out.gold = { piles: ts.length };
      if (ts.length) { const id = ts[0].q.id; st.yaw = Math.atan2(ts[0].Z - st.Z, ts[0].X - st.X); __E.f(1); const r = G.Interact.run({ id: 'ouro', t: ts[0] }); __E.until(() => !G.Avatar.busy(), 200); const h2 = G.Eco.homeOf(b);
        out.gold = { piles: ts.length, ran: !!(r && r.ok), msg: r && r.msg, gone: !G.Powers.goldPiles().some(q => q.id === id), deed: (A().ouro || 0) - d0, coin: +((h2 ? h2.coin || 0 : b.purse || 0) - c0).toFixed(2), carry: +((b.carry && b.carry.k === 'ouro' ? b.carry.n : 0) - k0).toFixed(2), coinage: G.Powers.coinage(b) }; } }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  ok('e13 uma pedra grande no caminho: o corpo a escala com as mãos, anda por cima e desce do outro lado', e13.climb && e13.climb.climbF > 5 && e13.climb.deed >= 1 && e13.climb.onTop > 3 && e13.climb.rose > e13.climb.top - 0.3 && e13.climb.past > 1 && Math.abs(e13.climb.down) < 0.06 && !e13.climb.hurt && !e13.climb.bad && !e13.climb.sunk, JSON.stringify(e13.climb));
  ok('e13 a parede de uma casa não se escala', !e13.tooHigh || (!e13.tooHigh.deed && !e13.tooHigh.climbF && !e13.tooHigh.bad && e13.tooHigh.rose < 0.3 && e13.tooHigh.x < e13.tooHigh.wall), e13.tooHigh ? JSON.stringify(e13.tooHigh) : 'nenhuma casa ao alcance (nada a provar)');
  ok('e13 sentar no chão (X) e levantar andando', e13.sit.ok && e13.sit.anim === 'rest' && e13.sit.after !== 'rest' && e13.sit.moved, JSON.stringify(e13.sit));
  ok('e13 acenar (V): o corpo acena e quem está perto responde', e13.wave.ok && e13.wave.anim === 'wave', JSON.stringify(e13.wave));
  ok('e13 beber água no rio; o mar é salgado', (!e13.drink || (e13.drink.ran && e13.drink.deed === 1)) && (!e13.salt || (!e13.salt.ok && /salgada/.test(e13.salt.msg))), JSON.stringify({ drink: e13.drink, salt: e13.salt }));
  ok('e13 fazer carinho num bicho manso', !e13.pet || (e13.pet.ran && e13.pet.deed === 1), JSON.stringify(e13.pet));
  ok('e13 catar ouro do chão: some do chão, vai para a casa (ou para as mãos) e entra na biografia', e13.gold.piles > 0 && e13.gold.ran && e13.gold.gone && e13.gold.deed >= 1 && (e13.gold.coinage ? e13.gold.coin > 0 : e13.gold.carry > 0), JSON.stringify(e13.gold));
  ok('e13 verificador', !e13.qa.length && e13.err === '{}', `${e13.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e13.err}`);
  }
  if (await need('e14')) {
  // ================================ e14: the body in the water: wading, swimming, the breath, the world's own order, a save, drowning ================================
  const e14 = await E(() => {
    __E.fresh('cidade'); let S = G.S; const N = G.N, T = G.T, TL = G.Space.TILE; const out = {};
    const s = __E.town(); const v = __E.adults(s)[0]; out.inn = __E.enter(v); __E.f(10); let st = G.Avatar.state(); const id = v.id;
    const body = () => S.villagers.get(id);
    // a beach: sand the world walks on, the sea beyond it growing deep within a straight line, nothing solid in the way
    let best = null;
    for (let y = 3; y < N - 3 && !best; y++) for (let x = 3; x < N - 3 && !best; x++) { const i = y * N + x; if (!G.W.walkable(i) || S.type[i] !== T.SAND || !G.W.reaches(v, x + 0.5, y + 0.5)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let ok = true, deep = -1; for (let k = 1; k <= 7; k++) { const X = (x + 0.5 + dx * k) * TL, Z = (y + 0.5 + dy * k) * TL; const sf = G.Space.surface(X, Z); if (sf.kind === 'cliff' || sf.kind === 'building' || sf.kind === 'wall' || sf.kind === 'edge') { ok = false; break; } const d = G.Avatar.waterAt(X, Z) - G.Avatar.floorAt(X, Z); if (d > 1.6) { deep = k; break; } } if (ok && deep > 0) { best = { x, y, dx, dy, deep }; break; } } }
    out.beach = best; if (!best) { out.qa = __E.qa(); out.err = JSON.stringify(G.modErr); return out; }
    const yaw0 = Math.atan2(best.dy, best.dx);
    // (every frame: never where the world would not have it — out of the water and off the walkable ground, unmarked in the
    // water, under the floor, the eye inside something)
    const watch = o => { const b = body(); if (!b) return; const ti = G.W.idx(b.x, b.y); const wet = S.type[ti] <= T.RIVER; if (!G.W.walkableXY(b.x, b.y) && !(wet && G.Possess.afloat(b))) o.bad++; if (G.Possess.afloat(b) && G.W.walkableXY(b.x, b.y)) o.bad++;
      if (st.loco !== 'swim' && st.loco !== 'climb' && st.Y < G.Avatar.floorAt(st.X, st.Z) - 0.05) o.under++; if (G.Cam3D.inside) o.cam++; if (st.loco === 'swim' && b.act !== 'swim') o.act++; };
    // 1. from the sand into the sea: the water climbs the legs and slows them; deep enough, it swims (the world leaves it, the god sees it swim)
    G.Avatar.place(best.x + 0.5, best.y + 0.5); __E.f(6); G.Cam3D.yaw = yaw0; G.Input3D.down.frente = true;
    const a = { bad: 0, under: 0, cam: 0, act: 0, landSp: 0, wadeSp: 0, maxWade: 0, swimAt: -1, st0: 0, st1: 0 };
    for (let k = 0; k < 420; k++) { G.Main.frameFor(33); watch(a); if (k === 12) a.landSp = st.speed; if (st.loco === 'ground') { a.maxWade = Math.max(a.maxWade, st.wade); if (st.wade > 0.55 && st.wade < 0.65) a.wadeSp = st.speed; }
      if (st.loco === 'swim' && a.swimAt < 0) { a.swimAt = k; a.st0 = st.stamina; } if (a.swimAt >= 0 && k - a.swimAt === 60) { a.st1 = st.stamina; break; } }
    G.Input3D.down.frente = false; __E.f(4);
    a.afloat = G.Possess.afloat(body()); a.avatar = !!S.avatar; a.anim = st.anim; a.loco = st.loco;
    a.overWater = +(G.Avatar.pos().Y + (G.Avatar.pos().head || 0) - G.Avatar.waterAt(st.X, st.Z)).toFixed(2);
    out.into = a;
    // 2. the world's own order to someone in the sea (the watchdog's "swim for the shore"): the body stays the player's, swimming
    if (st.loco === 'swim') { G.Vg.setTask(body(), { type: 'swim', pri: 6 }); __E.f(30); out.order = { avatar: !!S.avatar && S.avatar.id === id, task: body() && body().task && body().task.type, afloat: G.Possess.afloat(body()), loco: st.loco }; }
    // 3. a save and a load in the middle of the sea: it opens swimming, marked, where it was
    if (st.loco === 'swim') { const b = body(); const p0 = [b.x, b.y]; const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); S = G.S; __E.f(12); st = G.Avatar.state(); const b1 = body();
      out.load = { avatar: !!S.avatar && S.avatar.id === id, mode: G.Modes.state, at: b1 ? +G.dist(p0[0], p0[1], b1.x, b1.y).toFixed(2) : -1, afloat: G.Possess.afloat(b1), loco: st && st.loco }; }
    // 4. back to the beach: swimming, then the bed under the feet — wading — then the sand; the mark goes, the breath comes back
    if (st) { G.Cam3D.yaw = yaw0 + Math.PI; G.Input3D.down.frente = true; const r = { bad: 0, under: 0, cam: 0, act: 0, waded: 0, land: -1 };
      let low = st.stamina; for (let k = 0; k < 520; k++) { G.Main.frameFor(33); watch(r); low = Math.min(low, st.stamina); if (st.loco === 'ground' && st.wade > 0.1) r.waded++; if (G.W.walkableXY(body().x, body().y) && st.wade < 0.02 && r.land < 0) r.land = k; if (r.land >= 0 && k - r.land > 15) break; }
      G.Input3D.down.frente = false; __E.f(40); r.breath = +(st.stamina - low).toFixed(1); r.afloat = G.Possess.afloat(body()); r.loco = st.loco; out.back = r; }
    // 5. a ford: a river shallow enough to walk — the water at the shins or the knees, slower, never swimming
    { let ford = null; for (let y = 2; y < N - 2 && !ford; y++) for (let x = 2; x < N - 2 && !ford; x++) { const i = y * N + x; if (S.type[i] !== T.RIVER || S.deep[i] || S.road[i] || !G.W.walkable(i) || !G.W.reaches(body(), x + 0.5, y + 0.5)) continue; ford = [x + 0.5, y + 0.5]; }
      if (ford) { G.Avatar.place(ford[0], ford[1]); __E.f(10); out.ford = { wade: +st.wade.toFixed(2), loco: st.loco, afloat: G.Possess.afloat(body()) }; } else out.ford = null; }
    // 6. out of breath far from the shore: it goes under and drowns — the world's death (cause: drowned), and the god again
    G.Avatar.place(best.x + 0.5, best.y + 0.5); __E.f(6); G.Cam3D.yaw = yaw0; G.Input3D.down.frente = true; __E.until(() => st.loco === 'swim', 420); __E.f(30); G.Input3D.down.frente = false;
    out.drown = { swimming: st.loco === 'swim' };
    if (st.loco === 'swim') { const hp0 = body().hp; st.stamina = 0; __E.f(30); out.drown.hpFell = +(hp0 - (body() ? body().hp : 0)).toFixed(1); out.drown.anim = st.anim; out.drown.sank = +(G.Avatar.waterAt(st.X, st.Z) - st.Y).toFixed(2);
      out.drown.drowning = document.querySelector('#inc-hud') ? document.querySelector('#inc-hud').classList.contains('drowning') : null;
      const k = __E.until(() => G.Modes.state === 'GOD', 900); const rec = S.dead.get(id);
      Object.assign(out.drown, { k, dead: !!rec && !S.villagers.has(id), cause: rec && rec.cause, mode: G.Modes.state, avatar: !!S.avatar, corpse: G.Carnage.view().corpses.some(c => c.vid === id), told: S.history.slice(-30).some(e => /afogou/.test(e.txt) && e.txt.includes(rec ? rec.name : '?')) }); }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  ok('e14 há uma praia de onde se entra no mar', !!e14.beach, JSON.stringify(e14.beach));
  if (e14.beach) {
    const a = e14.into;
    ok('e14 entrando no mar: a água sobe pelas pernas e as deixa mais lentas; funda, o corpo nada', a.maxWade > 0.6 && a.wadeSp > 0 && a.wadeSp < a.landSp * 0.85 && a.swimAt > 0 && a.loco === 'swim' && a.anim !== 'walk', JSON.stringify(a));
    ok('e14 nadando: o mundo o deixa lá (a marca de quem nada), o deus o vê nadar, a cabeça fica fora d\'água, nunca dentro do chão nem a câmera dentro de nada', a.afloat && a.avatar && !a.bad && !a.under && !a.cam && !a.act && a.overWater > 0.1, JSON.stringify(a));
    ok('e14 nadando o fôlego vai acabando', a.st0 - a.st1 > 2, JSON.stringify({ st0: a.st0, st1: a.st1 }));
    ok('e14 a ordem do mundo de nadar para a margem não tira o corpo do jogador', !e14.order || (e14.order.avatar && e14.order.task === 'avatar' && e14.order.afloat && e14.order.loco === 'swim'), JSON.stringify(e14.order));
    ok('e14 salvar e carregar no meio do mar: continua nadando, onde estava', !e14.load || (e14.load.avatar && e14.load.mode === 'INC' && e14.load.at < 0.05 && e14.load.afloat && e14.load.loco === 'swim'), JSON.stringify(e14.load));
    ok('e14 de volta à praia: nada, depois pisa no fundo, sai andando; a marca some e o fôlego volta', e14.back && e14.back.waded > 5 && e14.back.land > 0 && !e14.back.afloat && e14.back.loco === 'ground' && e14.back.breath > 0 && !e14.back.bad && !e14.back.under && !e14.back.cam, JSON.stringify(e14.back));
    ok('e14 no vau do rio a água fica nas canelas ou nos joelhos e não se nada', !e14.ford || (e14.ford.wade > 0.02 && e14.ford.wade < 0.9 && e14.ford.loco === 'ground' && !e14.ford.afloat), JSON.stringify(e14.ford));
    const d = e14.drown || {};
    ok('e14 sem fôlego longe da margem: afunda, a vida cai e a tela escurece', d.swimming && d.hpFell > 0 && d.anim === 'drown' && d.sank > 0.1 && d.drowning === true, JSON.stringify(d));
    ok('e14 e se afoga de verdade: a morte do mundo (afogado), na crônica, sem corpo na praia, e o deus volta', d.dead && d.cause === 'drown' && d.mode === 'GOD' && !d.avatar && !d.corpse && d.told, JSON.stringify(d));
  }
  ok('e14 verificador', !e14.qa.length && e14.err === '{}', `${e14.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e14.err}`);
  }
  if (await need('e15')) {
  // ================================ e15: the arms and the heart: a hug, comfort, a dance, a fish caught by hand ================================
  const e15 = await E(() => {
    __E.fresh('cidade'); let S = G.S; const N = G.N, T = G.T, TL = G.Space.TILE; const out = {};
    // (the saved town opens in the small hours, everyone asleep: the god lets the night pass first, until the town is up)
    G.UI.setSpeed(4); const up = () => S.time > 0.25 && S.time < 0.6 && [...S.villagers.values()].filter(q => !q.sleeping && !q.inside).length > S.villagers.size * 0.4;
    out.morning = __E.until(up, 3000); G.UI.setSpeed(1); out.time = +S.time.toFixed(2);
    const free = q => !q.sleeping && !q.inside && !q.aboard && !q.jail && !q.held && !q.air && !q.ug && q.age >= 2 && q.fear <= 40 && G.W.walkableXY(q.x, q.y);
    const kinOf = o => [...S.villagers.values()].filter(q => q !== o && G.Possess.kin(o, q) && free(q) && q.age >= 6 && (!q.task || q.task.pri <= 1));
    const s = __E.town(); const v = __E.adults(s, o => kinOf(o).length > 0)[0] || __E.adults(s)[0];
    out.inn = __E.enter(v); __E.f(10); let st = G.Avatar.state(); const id = v.id; const body = () => S.villagers.get(id); const A = () => S.avatar.deeds;
    // (the body set down beside someone, on the ground the world walks, facing them)
    const beside = o => { for (const [dx, dy] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4]]) if (G.Avatar.place(o.x + dx, o.y + dy)) { __E.f(2); st.yaw = Math.atan2(o.y - body().y, o.x - body().x); __E.f(1); return true; } return false; };
    const watch = (o, r) => { const b = body(); if (!b) return; if (!G.W.walkableXY(b.x, b.y)) r.bad++; if (st.Y < G.Avatar.floorAt(st.X, st.Z) - 0.05) r.under++; if (o && S.villagers.has(o.id)) { r.minD = Math.min(r.minD, +(G.dist(b.x, b.y, o.x, o.y) * TL).toFixed(2)); if (o.act === 'hug') r.held++; const vs = G.People3D.visOf(o.id); if (vs && vs.st === 'hug') r.drawn++; } if (st.anim === 'hug') r.arms++; };
    // 1. one's own: a word first — they stop to talk — then, on their card, the hug: the body steps up, both hold each other
    // (the world may call them away in the middle — the day's festival, a fire: then the arms let go and nothing counts; the
    // next of the family is tried, up to three)
    out.hug = null; out.called = [];
    for (const k of kinOf(body()).slice(0, 3)) {
      if (!S.villagers.has(k.id) || !beside(k)) continue;
      const r0 = G.Interact.run({ id: 'pessoa', t: { o: k, X: k.x * TL, Z: k.y * TL } }); __E.f(2);
      const talk = { ok: !!(r0 && r0.ok), task: k.task && k.task.type, toBody: !!(k.task && k.task.id === id), wait: k.task && k.task.wait, pri: k.task && k.task.pri };
      G.IncUI.card(r0.card, r0.said); const btn = document.querySelector('#inc-card [data-c="hug"]'); const can = G.Interact.canHug(body(), k); const d0 = A().abraco || 0;
      const r = { bad: 0, under: 0, minD: 99, held: 0, drawn: 0, arms: 0 };
      if (btn && !btn.disabled) btn.click();
      // (who let go first: they, called away while the body still held them — or the body, at the end of the hug)
      let away = null; const fr = __E.until(() => { watch(k, r); if (!away && G.Avatar.busy() && S.villagers.has(k.id) && !(k.task && k.task.hug)) away = k.task ? k.task.type : 'nenhuma'; return !G.Avatar.busy(); }, 400); const panel = G.Modes.panel();
      if (panel) { G.IncUI.closeAll(); G.Modes.setPanel(null); }
      __E.f(4); Object.assign(r, { talk, label: can.label, can: can.ok, btn: !!btn, frames: fr, deed: (A().abraco || 0) - d0, kin: G.Possess.kin(body(), k), panel, after: k.task ? k.task.type + (k.task.hug ? '+hug' : '') : null });
      // (called away before the hug was over: the body let go at once, the hug did not count)
      // (the hug that never closed — called away before or while the arms were round them — is the world's call, not a hug)
      if (!r.deed) { out.called.push(Object.assign(r, { away: away || r.after })); continue; }
      out.hug = r; break;
    }
    // 2. a stranger in mourning: the hug consoles — the grief eases; and a stranger who grieves nothing is offered no hug
    const strangers = [...S.villagers.values()].filter(q => q !== body() && !G.Possess.kin(body(), q) && free(q) && q.age >= 14 && (!q.task || q.task.pri <= 1) && G.W.reaches(body(), q.x, q.y));
    strangers.sort((p, q) => G.dist(p.x, p.y, body().x, body().y) - G.dist(q.x, q.y, body().x, body().y));
    const o = strangers[0]; out.comfort = null; out.cold = null;
    if (o) {
      out.cold = G.Interact.canHug(body(), o); o.mourn = G.DAY_LEN;
      if (beside(o)) { const c = G.Interact.canHug(body(), o); const m0 = o.mourn; const d0 = A().consolo || 0; const r = { bad: 0, under: 0, minD: 99, held: 0, drawn: 0, arms: 0 };
        const h = G.Interact.hug(o); __E.until(() => { watch(o, r); return !G.Avatar.busy(); }, 400); __E.f(2);
        out.comfort = Object.assign(r, { label: c.label, ok: !!(h && h.ok), eased: +(m0 - o.mourn).toFixed(1), want: +(G.DAY_LEN * 0.35).toFixed(1), deed: (A().consolo || 0) - d0 }); }
    }
    // 3. the bad cases: the other dies in the arms (no deed, no error); a save and a load in the middle of a hug
    const k2 = kinOf(body())[0] || strangers[1]; out.dies = null;
    if (k2) { if (!k2.mourn && !G.Possess.kin(body(), k2)) k2.mourn = G.DAY_LEN; if (beside(k2)) { const d0 = (A().abraco || 0) + (A().consolo || 0); const h = G.Interact.hug(k2); __E.f(20); G.Vg.damage(k2, 9999, 'war', true); const fr = __E.until(() => !G.Avatar.busy(), 400); __E.f(10);
      out.dies = { ok: !!(h && h.ok), gone: !S.villagers.has(k2.id), frames: fr, deed: (A().abraco || 0) + (A().consolo || 0) - d0, avatar: !!S.avatar && S.avatar.id === id, mode: G.Modes.state }; } }
    const k3 = strangers.find(q => S.villagers.has(q.id) && q !== o && q !== k2); out.saved = null;
    if (k3 && beside(k3)) { k3.mourn = G.DAY_LEN; const d0 = A().consolo || 0; const h = G.Interact.hug(k3); __E.f(15); const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); S = G.S; __E.f(150); st = G.Avatar.state(); const q = S.villagers.get(k3.id);
      out.saved = { ok: !!(h && h.ok), avatar: !!S.avatar && S.avatar.id === id, mode: G.Modes.state, busy: G.Avatar.busy(), deed: (S.avatar ? S.avatar.deeds.consolo || 0 : -1) - d0, task: q && q.task ? q.task.type + (q.task.hug ? '+hug' : '') : null }; }
    // 4. a dance (B): whoever is free and merry near the body joins in; walking stops it; the others go back to their lives
    const merry = [...S.villagers.values()].filter(q => q !== body() && free(q) && q.age >= 3 && q.hunger < 90 && !(q.sick > 0) && (!q.task || q.task.pri <= 0.6) && (q.age < 14 || (q.traits || []).includes('Sociável') || q.id % 3 === 0 || G.Possess.kin(body(), q)) && G.W.reaches(body(), q.x, q.y));
    merry.sort((p, q) => G.dist(p.x, p.y, body().x, body().y) - G.dist(q.x, q.y, body().x, body().y));
    out.dance = { near: merry.length }; out.wave = null;
    // (a wave in the daylight, beside someone: they wave back — e13 waves in the night, with no one about: T-036)
    if (merry[0] && beside(merry[0])) { G.Input3D.onAction('acenar'); let most = 0; for (let k = 0; k < 60; k++) { G.Main.frameFor(33); let n = 0; for (const q of S.villagers.values()) { const vs = G.People3D.visOf(q.id); if (q !== body() && vs && vs.st === 'wave') n++; } most = Math.max(most, n); } out.wave = { most, deed: A().aceno || 0 }; __E.f(10); }
    if (merry[0] && beside(merry[0])) {
      const d0 = A().danca || 0; G.Input3D.onAction('dancar'); __E.f(20);
      const joined = [...S.villagers.values()].filter(q => q.task && q.task.type === 'talk' && q.task.dance && q.task.id === id);
      const drawn = joined.filter(q => { const vs = G.People3D.visOf(q.id); return vs && vs.st === 'dance'; }).length;
      Object.assign(out.dance, { on: G.Avatar.dancing(), anim: st.anim, joined: joined.length, acts: joined.filter(q => q.act === 'dance').length, drawn, deed: (A().danca || 0) - d0 });
      const x0 = body().x, y0 = body().y; G.Input3D.down.frente = true; __E.f(20); G.Input3D.down.frente = false; __E.f(4);
      out.dance.stopped = !G.Avatar.dancing(); out.dance.walked = +(G.dist(x0, y0, body().x, body().y) * TL).toFixed(2);
      __E.f(400); out.dance.still = joined.filter(q => S.villagers.has(q.id) && q.task && q.task.dance).length;
    }
    // 5. a fish by hand, in a ford: offered only with the feet in the water; the hands full, not; the world's dice and the water's own fish
    let ford = null; for (let y = 2; y < N - 2 && !ford; y++) for (let x = 2; x < N - 2 && !ford; x++) { const i = y * N + x; if (S.type[i] !== T.RIVER || S.deep[i] || S.road[i] || (S.ice && S.ice[i]) || !G.W.walkable(i) || !G.W.reaches(body(), x + 0.5, y + 0.5)) continue; ford = [x + 0.5, y + 0.5, i]; }
    out.fish = null; out.dry = null;
    { const b = body(); let dry = null; for (let r = 1; r < 12 && !dry; r++) for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) { const x = b.x + dx, y = b.y + dy; if (G.W.inb(x, y) && G.W.walkableXY(x, y) && S.type[G.W.idx(x, y)] !== T.RIVER) { dry = [x, y]; break; } }
      if (dry) { G.Avatar.place(dry[0], dry[1]); __E.f(6); const ctx = G.Interact.ctx(); out.dry = { wade: +G.Avatar.wade().toFixed(2), found: G.Interact.list.find(q => q.id === 'peixe').find(ctx).length, at: dry }; } }
    if (ford) {
      G.Avatar.place(ford[0], ford[1]); __E.f(12); const b = body(); b.carry = null; const pr = G.Interact.list.find(q => q.id === 'peixe');
      const f = { wade: +G.Avatar.wade().toFixed(2), tries: 0, caught: null, deed0: A().pesca || 0 };
      // (hands already full of wood: not)
      b.carry = { k: 'wood', n: 2 }; { const ctx = G.Interact.ctx(); const t = pr.find(ctx)[0]; f.full = t ? pr.can(ctx, t) : null; } b.carry = null;
      // (the world carries the body off while the hands are in the water — to the dry ground: the fishing is left undone)
      if (out.dry) { const ctx = G.Interact.ctx(); const t = pr.find(ctx)[0]; if (t) { const r = G.Interact.run({ id: 'peixe', t }); __E.f(10); G.Avatar.place(out.dry.at[0], out.dry.at[1]); const fr = __E.until(() => !G.Avatar.busy(), 300); __E.f(4); f.moved = { ran: !!(r && r.ok), frames: fr, carry: !!(b.carry && b.carry.n > 0), deed: (A().pesca || 0) - f.deed0 }; G.Avatar.place(ford[0], ford[1]); __E.f(12); } }
      for (let k = 0; k < 20 && !(b.carry && b.carry.fish); k++) { const ctx = G.Interact.ctx(); const t = pr.find(ctx)[0]; if (!t) break; const best = G.Interact.best(); if (k === 0) f.best = best && best.id; const r = G.Interact.run({ id: 'peixe', t }); f.tries++; if (!r || !r.ok) { f.fail = r && r.msg; break; } __E.until(() => !G.Avatar.busy(), 300); }
      if (b.carry && b.carry.fish) { const F = G.Waters.FISH[b.carry.fish]; f.caught = { fish: b.carry.fish, k: b.carry.k, n: b.carry.n, known: !!F, river: !!F && (F.where.includes('river') || F.where.includes('lake') || F.where.includes('mud')) }; }
      f.deed = (A().pesca || 0) - f.deed0;
      // (carried to the store as any fisher's load: the store's door offers to put it away)
      out.fish = f;
    }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  const H = e15.hug;
  ok('e15 com a família: a conversa faz a pessoa parar; no cartão dela, Abraçar — o corpo chega perto e os dois se abraçam (no mundo e no 3D)', H && H.talk.ok && H.talk.task === 'talk' && H.talk.toBody && H.btn && H.can && /^Abraçar/.test(H.label) && H.minD < 1 && H.arms > 20 && H.held > 5 && H.drawn > 5 && H.deed === 1 && !H.panel && !H.bad && !H.under && H.after !== 'talk+hug', JSON.stringify(H));
  ok('e15 chamada pelo mundo no meio do abraço (uma festa, um incêndio): o corpo solta na hora e o abraço não conta', e15.called.every(c => c.deed === 0 && c.arms < 70 && !c.bad && c.away !== 'talk+hug'), JSON.stringify(e15.called));
  ok('e15 consolar quem está de luto: o luto diminui; um estranho sem luto não recebe abraço', e15.comfort && e15.comfort.ok && /^Consolar/.test(e15.comfort.label) && e15.comfort.eased > e15.comfort.want * 0.8 && e15.comfort.deed === 1 && !e15.comfort.bad && e15.cold && !e15.cold.ok && !e15.cold.label, JSON.stringify({ comfort: e15.comfort, cold: e15.cold }));
  ok('e15 a pessoa morre no meio do abraço: nada quebra, o feito não conta, o corpo segue', !e15.dies || (e15.dies.ok && e15.dies.gone && e15.dies.frames >= 0 && e15.dies.deed === 0 && e15.dies.avatar && e15.dies.mode === 'INC'), JSON.stringify(e15.dies));
  ok('e15 salvar e carregar no meio de um abraço: volta encarnado, sem o feito em dobro', !e15.saved || (e15.saved.ok && e15.saved.avatar && e15.saved.mode === 'INC' && !e15.saved.busy && e15.saved.deed <= 1), JSON.stringify(e15.saved));
  const Dn = e15.dance;
  ok('e15 dançar (B): o corpo dança, quem está livre por perto entra na dança, andar para, e depois todos voltam à vida', Dn.near === 0 || (Dn.on && Dn.anim === 'dance' && Dn.joined >= 1 && Dn.acts >= 1 && Dn.drawn >= 1 && Dn.deed === 1 && Dn.stopped && Dn.walked > 0.5 && Dn.still === 0), JSON.stringify(Dn));
  ok('e15 acenar de dia, ao lado de alguém: quem está perto acena de volta', !e15.wave || (e15.wave.most >= 1 && e15.wave.deed >= 1), JSON.stringify(e15.wave));
  ok('e15 pescar com as mãos: só com os pés na água; com as mãos cheias, não; levado para longe no meio, não pesca; o peixe é o daquela água e entra na biografia', e15.dry && e15.dry.found === 0 && (!e15.fish || (e15.fish.wade > 0.12 && e15.fish.full && !e15.fish.full.ok && (!e15.fish.moved || (e15.fish.moved.ran && e15.fish.moved.frames <= 3 && !e15.fish.moved.carry && e15.fish.moved.deed === 0)) && e15.fish.best === 'peixe' && e15.fish.caught && e15.fish.caught.known && e15.fish.caught.river && e15.fish.deed >= 1)), JSON.stringify({ dry: e15.dry, fish: e15.fish }));
  ok('e15 verificador', !e15.qa.length && e15.err === '{}', `${e15.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e15.err}`);
  await shot('e15-abraco-danca-pesca');
  }
  if (await need('e16')) {
  // ================================ e16: the presentation never ahead of the world (the adendo's §5, in the 3D) ================================
  const e16 = await E(() => {
    __E.fresh('cidade'); const S = G.S, T = G.T, TL = G.Space.TILE; const out = {}; const P3 = G.People3D;
    const wet = (x, y) => { const i = G.W.idx(x, y); const t = S.type[i]; return (t === T.RIVER && !S.road[i] && !(S.ice && S.ice[i])) || (t <= T.SEA && !(S.dry && S.dry[i])); };
    const docks = [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id); for (const d of docks) G.Naval.dockInfo(d);
    const dock = docks.find(d => { const p = P3.crateSpot(d); return p && !wet(p[0], p[1]) && G.W.walkableXY(p[0], p[1]); });
    out.dock = dock ? dock.id : null; if (!dock) { out.qa = __E.qa(); out.err = JSON.stringify(G.modErr); return out; }
    const sp = P3.crateSpot(dock);
    // (the quay's crates, as a boat sets them down)
    dock.crates = []; for (let k = 0; k < 6; k++) dock.crates.push({ id: S.nextId++, k: 'food', n: 4, col: '#a8c0d0', fish: 'arenque', boat: 0, op: 0 });
    const v = __E.adults(__E.town(), o => G.W.reaches(o, sp[0], sp[1]))[0] || __E.adults(__E.town())[0]; out.inn = __E.enter(v); if (!G.Avatar.place(sp[0] + 0.3, sp[1] + 0.3)) G.Avatar.place(sp[0], sp[1]); __E.f(20);
    const ids = () => dock.crates.map(c => c.id).sort((a, b) => a - b).join(',');
    const drawnIds = () => P3.lying.filter(e => e[5] === dock.id).map(e => e[4]).sort((a, b) => a - b).join(',');
    out.drawn = { world: ids(), drawn: drawnIds() };
    // 1. the menu open: the world stands still; the 3D draws on, and only reads — the quay, its record, the clock
    { const snap = () => JSON.stringify([dock.crates, dock._dock, dock.wd]); const s0 = snap(), c0 = S.clock; G.Modes.menu(true); __E.f(60); const s1 = snap(), c1 = S.clock; G.Modes.menu(false); __E.f(4);
      out.still = { quay: s0 === s1, clock: c0 === c1, drawn: drawnIds() === ids() }; }
    // 2. a stroke asked with the menu open waits: the tree as it was, until the world goes on
    { const b = __E.body(); const tr = [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && t.size >= 0.8 && !t.claim && G.W.reaches(b, t.x, t.y)).sort((p, q) => G.dist2(p.x, p.y, b.x, b.y) - G.dist2(q.x, q.y, b.x, b.y))[0];
      out.stroke = null;
      // (a step from the trunk, on the side the world's path comes from)
      if (tr) { const p = G.W.findPath(b.x, b.y, tr.x, tr.y, true, 30000); const e = p && p.length ? p[p.length - 1] : [tr.x, tr.y]; const d = Math.hypot(e[0] - tr.x, e[1] - tr.y) || 1;
        for (const k of [0.3, 0.4, 0.22, 0.5]) if (G.Avatar.place(tr.x + (e[0] - tr.x) / d * k, tr.y + (e[1] - tr.y) / d * k)) break; __E.f(4); G.Avatar.state().yaw = Math.atan2(tr.y - b.y, tr.x - b.x); b.carry = null;
        const c0 = tr.chop; const r = G.Interact.run({ id: 'arvore', t: { tr, X: tr.x * TL, Z: tr.y * TL } }); G.Modes.menu(true); __E.f(90); const during = tr.chop; G.Modes.menu(false); __E.until(() => !G.Avatar.busy(), 200); __E.f(2);
        out.stroke = { ran: !!(r && r.ok), during: +(during - c0).toFixed(3), after: +(tr.chop - c0).toFixed(3) }; } }
    // 3. a load carried to the store: drawn in the hands while the world has it in them, never after
    { const b = __E.body(); const sh = G.Village.nearestDropoff(b.x, b.y, b.set); out.carry = null;
      if (sh && G.Village.facOfSet(sh.set) === G.Fac.idOfV(b)) { const d = G.Vg.door(sh); G.Avatar.place(d[0], d[1]); __E.f(6); G.Avatar.state().yaw = Math.atan2(d[1] - b.y, d[0] - b.x); b.carry = { k: 'wood', n: 3 }; b.hunger = 5; __E.f(4);
        let bad = 0, held = 0, frames = 0; const r = G.Interact.run({ id: 'porta', t: { b: sh, X: d[0] * TL, Z: d[1] * TL } });
        for (let k = 0; k < 300; k++) { G.Main.frameFor(33); frames++; const A = P3.avatar; const H = A && A.look && A.look.held && A.look.held.grip !== 'chao'; const W = !!(b.carry && b.carry.n > 0); if (H) held++; if (H && !W) bad++; if (!G.Avatar.busy() && k > 4) break; }
        __E.f(4); const A = P3.avatar; out.carry = { ran: !!(r && r.ok), msg: r && r.msg, frames, held, bad, after: !!(A && A.look && A.look.held), world: !!(b.carry && b.carry.n > 0) }; } }
    // 4. a docker unloading the quay (the unloading of act-porto.js, by day: the world's own errand for it, Porto.work): at every
    // frame the crates drawn on the quay are the world's, and a crate is drawn in hands only as many as the world has in hands
    { const o = __E.adults(__E.town(), q => q.id !== v.id && G.W.reaches(q, sp[0], sp[1]))[0]; out.docker = null;
      if (o) { const near = G.W.nearestLand(sp[0] + 0.6, sp[1], 3) || sp; o.x = near[0]; o.y = near[1]; o.path = null; o.carry = null;
        G.inSim++; S.time = 0.15; G.Porto.work(o, dock, G.Vg.H); G.inSim--; // (the god's hand: the day, and the errand the world gives a docker)
        const r = { frames: 0, extra: 0, ghost: 0, lifts: 0, n0: dock.crates.length };
        for (let k = 0; k < 900 && dock.crates.length > r.n0 - 2; k++) { G.Main.frameFor(33); r.frames++;
          const world = new Set(dock.crates.map(c => c.id)); for (const e of P3.lying) if (e[5] === dock.id && !world.has(e[4])) r.ghost++;
          // (whoever the world has holding a thing the 3D draws as a crate — the crates of the quays, the gear's box)
          let carriers = 0; for (const q of S.villagers.values()) { if (!(q.carry && q.carry.n > 0) && !q.gear) continue; const h = P3.look(q).held; if (h && (h.form === 'caixa' || h.form === 'caixaPeixe')) carriers++; }
          const lying = P3.lying.filter(e => e[3] === 'caixa' || e[3] === 'caixaPeixe').length; const drawn = (P3.helds().find(h => h[0] === 'caixaPeixe') || [0, 0])[1] + (P3.helds().find(h => h[0] === 'caixa') || [0, 0])[1];
          if (drawn > lying + carriers) r.extra++; if (o.act === 'lift') r.lifts++; }
        r.n1 = dock.crates.length; r.task = o.task ? o.task.type : null; out.docker = r; } }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr); __E.leave();
    return out;
  });
  ok('e16 há um cais com as caixas em terra seca', !!e16.dock, String(e16.dock));
  if (e16.dock) {
    ok('e16 as caixas desenhadas no cais são as do mundo, uma a uma', e16.drawn.world === e16.drawn.drawn && e16.drawn.world.length > 0, JSON.stringify(e16.drawn));
    ok('e16 com o menu aberto o 3D desenha só lendo: o cais, o registro dele e o relógio como estavam', e16.still.quay && e16.still.clock && e16.still.drawn, JSON.stringify(e16.still));
    ok('e16 o golpe pedido com o menu aberto espera; com o mundo de volta, corta', !e16.stroke || (e16.stroke.ran && e16.stroke.during === 0 && e16.stroke.after > 0), JSON.stringify(e16.stroke));
    ok('e16 a carga levada ao armazém está nas mãos só enquanto o mundo a tem nelas', !e16.carry || (e16.carry.ran && e16.carry.held > 5 && e16.carry.bad === 0 && !e16.carry.after && !e16.carry.world), JSON.stringify(e16.carry));
    ok('e16 o estivador descarregando: nenhuma caixa desenhada que o mundo não tenha, nenhuma nas mãos a mais', !e16.docker || (e16.docker.ghost === 0 && e16.docker.extra === 0 && e16.docker.lifts > 0 && e16.docker.n1 < e16.docker.n0), JSON.stringify(e16.docker));
  }
  ok('e16 verificador', !e16.qa || (!e16.qa.length && e16.err === '{}'), `${(e16.qa || []).slice(0, 3).join(' · ') || 'limpo'} · ${e16.err}`);
  await shot('e16-cais');
  }
  if (await need('e17')) {
  // ================================ e17: the docker lived by the god, from the call to the pay ================================
  // (the world as the docker finds it: a town of the metropolis with a quay and its harbour warehouse, by day; a boat's catch
  // landed on the clean quay — the world's own door for it, Porto.landCatch —; a stevedore of the town lived, at the door of the
  // warehouse he works for, a stone's throw from the quay)
  const e17a = await E(() => {
    __E.fresh('metropole'); const S = G.S, W = G.W, TL = G.Space.TILE, A = G.Act, P = G.Porto, D = G.Depot; const out = {};
    const god = f => { G.inSim++; const r = f(); G.inSim--; return r; };
    const dry = (x, y) => { const i = W.idx(x, y); const t = S.type[i]; return !((t === G.T.RIVER && !S.road[i]) || t <= G.T.SEA) && W.walkableXY(x, y); };
    const porters = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'estivador').length;
    const towns = [...S.settlements.values()].filter(s => [...S.buildings.values()].some(b => b.set === s.id && b.type === 'armazem' && b.built)).sort((a, b) => porters(b) - porters(a) || a.id - b.id);
    let dock = null;
    for (const s of towns) { for (const d of [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) { const sp = god(() => G.Fishers.crateSpot(d)); const st = god(() => P.destOf({ at: d.id, fac: G.Village.facOfSet(d.set), x: d.x + 1, y: d.y + 1, data: {} })); if (sp && dry(sp[0], sp[1]) && st && st.type === 'armazem' && god(() => P.access(d, st))) { dock = d; break; } } if (dock) break; }
    out.dock = dock ? dock.id : null; if (!dock) return out;
    const fid = G.Village.facOfSet(dock.set);
    god(() => { for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && A.live(op)) A.end(op, 'cancel', 'teste'); for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + fid, c.k, c.n, { code: 'teste', part: true }); dock.crates = []; S.time = 0.15; });
    const sp = god(() => G.Fishers.crateSpot(dock));
    const v = [...S.villagers.values()].filter(o => o.set === dock.set && o.role === 'estivador' && !(o.carry && o.carry.n > 0) && G.Possess.can(o).ok && A.able(o) && W.reaches(o, sp[0], sp[1])).sort((a, b) => a.id - b.id)[0];
    out.who = v ? v.name : null; if (!v) return out;
    // (where the docker comes from: the door of the warehouse, a stone's throw from the quay — or a point one walks to from there)
    const door0 = G.Vg.door(god(() => P.destOf({ at: dock.id, fac: fid, x: dock.x + 1, y: dock.y + 1, data: {} }))); const dd = G.dist(door0[0], door0[1], sp[0], sp[1]) * TL;
    let start = dd > 8 && dd < 24 ? door0 : null; for (let r = 4; r <= 5 && !start; r += 0.5) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const x = sp[0] + Math.cos(a) * r, y = sp[1] + Math.sin(a) * r; if (dry(x, y) && W.canWalk(sp[0], sp[1], x, y, false)) { start = [x, y]; break; } } // (a place one walks to from the crates: not beside it)
    if (!start) return out;
    out.inn = __E.enter(v); if (!out.inn) return out; G.Avatar.place(start[0], start[1]); __E.f(10);
    // (with its back to the quay: the mark is an arrow on the edge of the picture, toward it)
    G.Cam3D.yaw = Math.atan2(start[1] - sp[1], start[0] - sp[0]); G.Avatar.state().yaw = G.Cam3D.yaw;
    const op = god(() => { P.landCatch(dock, 'food', 32, 'arenque', '#a8c0d0', 0); return P.opAt(dock); }); out.op = op ? op.id : null; if (!op) return out;
    __E.f(30);
    const hud = sel => document.querySelector('#inc-hud ' + sel);
    const vis = el => !!el && !el.classList.contains('hidden');
    const dr = () => { const ids = new Set(dock.crates.filter(c => c.op === op.id).map(c => c.id)); return G.People3D.lyingOf(dock.id).filter(e => ids.has(e[4])); };
    out.crates = { world: dock.crates.filter(c => c.op === op.id).length, drawn: dr().length };
    out.call = (hud('.ih-calls') || {}).textContent || ''; out.want = `O cais precisa de braços: há caixas de peixe para levar ${G.Possess.toB(P.destOf(op))}.`;
    out.line = vis(hud('.ih-lead')) ? hud('.ih-lead').textContent : '';
    out.back = G.IncUI.markAt ? Object.assign({}, G.IncUI.markAt) : null; out.backVis = vis(hud('.ih-mark')) && hud('.ih-mark').classList.contains('off');
    window.__e17 = { dock: dock.id, op: op.id, v: v.id, sp, fid }; out.fid = fid;
    return out;
  });
  ok('e17 a metrópole tem um cais com armazém do porto e um estivador para viver', !!(e17a.dock && e17a.who && e17a.inn && e17a.op), JSON.stringify({ dock: e17a.dock, who: e17a.who, op: e17a.op }));
  if (e17a.op) {
    ok('e17 o barco descarrega: as caixas de verdade no cais, desenhadas uma a uma', e17a.crates.world >= 4 && e17a.crates.drawn === e17a.crates.world, JSON.stringify(e17a.crates));
    ok('e17 o estivador encarnado é chamado ao cais, na tela', e17a.call.includes(e17a.want), `«${e17a.call}»`);
    ok('e17 a linha discreta da descarga, com a distância', /^Descarga no cais: caixas de peixe esperando · \d+ m$/.test(e17a.line.trim()), `«${e17a.line.trim()}»`);
    ok('e17 de costas para o cais, o marcador é uma seta na borda da tela', e17a.backVis && !!e17a.back && e17a.back.off, JSON.stringify(e17a.back));
    // turned toward the quay: the mark over the pile, where the 3D draws the crates
    const e17b = await E(() => {
      const X = window.__e17; const S = G.S, TL = G.Space.TILE; const dock = S.buildings.get(X.dock); const v = __E.body(); const out = {};
      G.Cam3D.yaw = Math.atan2(X.sp[1] - v.y, X.sp[0] - v.x); G.Avatar.state().yaw = G.Cam3D.yaw; __E.f(12);
      const L = G.IncUI.lead(); const m = G.IncUI.markAt; out.m = m ? Object.assign({}, m) : null;
      if (L && m) { const p = new THREE.Vector3(L.X, L.Y, L.Z).project(G.Realm.camera()); out.px = [(p.x * 0.5 + 0.5) * window.innerWidth, (-p.y * 0.5 + 0.5) * window.innerHeight]; }
      const ids = new Set(dock.crates.filter(c => c.op === X.op).map(c => c.id)); const dr = G.People3D.lyingOf(dock.id).filter(e => ids.has(e[4]));
      if (L && dr.length) out.off = Math.hypot(L.X - dr.reduce((a, e) => a + e[0], 0) / dr.length, L.Z - dr.reduce((a, e) => a + e[2], 0) / dr.length);
      return out;
    });
    ok('e17 virado para o cais, o marcador fica sobre as caixas desenhadas', !!e17b.m && !e17b.m.off && !!e17b.px && Math.hypot(e17b.m.x - e17b.px[0], e17b.m.y - e17b.px[1]) < 2 && e17b.off < 0.3, JSON.stringify(e17b));
    await shot('e17-marcador');
    // following the mark: along the world's path to the crates, until the prompt says it; E; the crate in the hands
    const e17c = await E(() => {
      const X = window.__e17; const S = G.S, TL = G.Space.TILE; const dock = S.buildings.get(X.dock); const v = __E.body(); const out = {}; const op = G.Act.get(X.op);
      // (along the world's path to the quay's spot for the crates — the mark is over the pile drawn around it —, as a player walks
      // up to it, the camera turned toward each next step: the first moment the prompt is the crate's, how far the nearest crate is)
      const prompt = () => { const el = document.querySelector('#inc-hud .ih-prompt'); return el && !el.classList.contains('hidden') ? el.querySelector('span').textContent : ''; };
      const st = G.Avatar.state(); const nearC = () => G.People3D.lyingOf(dock.id).reduce((m, e) => Math.min(m, Math.hypot(e[0] - st.X, e[2] - st.Z)), 99);
      const pth = G.W.findPath(v.x, v.y, X.sp[0], X.sp[1], true, 30000); out.steps = pth ? pth.length : 0; out.dist = 99;
      const pts = (pth || []).map(w => [w[0] * TL, w[1] * TL]).concat(pth ? [[X.sp[0] * TL, X.sp[1] * TL]] : []);
      walk: for (const [PX, PZ] of pts) for (let k = 0; k < 300; k++) { if (Math.hypot(PX - st.X, PZ - st.Z) < 0.35) break; G.Cam3D.yaw = Math.atan2(PZ - st.Z, PX - st.X); G.Input3D.down.frente = true; G.Main.frameFor(33); if (/^Pegar /.test(prompt())) { out.dist = nearC(); break walk; } }
      G.Input3D.down.frente = false; __E.f(6);
      out.prompt = prompt();
      const n0 = dock.crates.filter(c => c.op === X.op).length;
      // (a porter may take the crate offered between the key and the contact — the world says so —: E again, as a player does)
      // (each E told: the world's answer to it, and what the HUD said)
      out.tries = 0; out.said = []; const t0 = G.IncUI.toast; G.IncUI.toast = (t, d) => { out.said.push(t); return t0(t, d); };
      for (; out.tries < 3 && /^Pegar /.test(prompt()) && !(v.carry && v.carry.n > 0); out.tries++) { let res = null; G.IncUI.use(); __E.until(() => { const a = G.Avatar.actNow(); if (a && a.res) res = a.res; return !G.Avatar.busy(); }, 600); __E.f(6); out.said.push('#' + (out.tries + 1) + ' ' + (res ? (res.ok ? 'ok' : 'não: ' + (res.why || '(calado)')) : 'sem resposta')); }
      G.IncUI.toast = t0;
      out.carry = v.carry ? { k: v.carry.k, n: v.carry.n, op: v.carry.op } : null; out.n = [n0, dock.crates.filter(c => c.op === X.op).length];
      out.held = (G.People3D.look(v).held || {}).form || null;
      __E.f(12); const L = G.IncUI.lead(); out.lead = L ? { step: L.step, txt: L.txt, b: L.b } : null; out.line = document.querySelector('#inc-hud .ih-lead').textContent;
      const dest = G.Porto.destOf(op); out.dest = dest ? dest.id : null; out.want = `Levar ${G.Possess.toB(dest)}`;
      return out;
    });
    ok('e17 seguindo o marcador até a pilha, «E — Pegar a caixa…» aparece ao chegar a uns 2,5 m das caixas desenhadas', /^Pegar a caixa/.test(e17c.prompt) && e17c.dist <= 2.7 && e17c.dist >= 1.5, `«${e17c.prompt}» a ${e17c.dist.toFixed(2)} m da caixa mais perto (${e17c.steps} passos do caminho); E ${e17c.tries} vez(es): ${e17c.said.join(' / ')}`);
    ok('e17 pega: a caixa de peixe nas mãos (do mundo e desenhada), uma a menos no cais', !!e17c.carry && e17c.carry.op === e17a.op && e17c.n[1] === e17c.n[0] - 1 && e17c.held === 'caixaPeixe', JSON.stringify({ carry: e17c.carry, n: e17c.n, held: e17c.held }));
    ok('e17 com a caixa nas mãos, o marcador passa à porta do armazém: «Levar ao armazém do porto»', !!e17c.lead && e17c.lead.step === 'levar' && e17c.lead.b === e17c.dest && e17c.lead.txt === e17c.want && e17c.line.startsWith(e17c.want), `«${e17c.line}»`);
    await shot('e17-levar');
    // to the store's door, following the mark; E: the crate goes in as a docker's
    const e17d = await E(() => {
      const X = window.__e17; const S = G.S, TL = G.Space.TILE, D = G.Depot; const v = __E.body(); const op = G.Act.get(X.op); const out = {};
      const dest = G.Porto.destOf(op); const door = G.Vg.door(dest); out.walk = __E.walkTo(door[0], door[1], 900);
      const prompt = () => { const el = document.querySelector('#inc-hud .ih-prompt'); return el && !el.classList.contains('hidden') ? el.querySelector('span').textContent : ''; };
      for (let k = 0; k < 120 && !/^Guardar /.test(prompt()); k++) { G.Cam3D.yaw = Math.atan2(door[1] * TL - G.Avatar.state().Z, door[0] * TL - G.Avatar.state().X); G.Input3D.down.frente = Math.hypot(door[0] * TL - G.Avatar.state().X, door[1] * TL - G.Avatar.state().Z) > 0.5; G.Main.frameFor(33); }
      G.Input3D.down.frente = false; __E.f(6); out.prompt = prompt();
      const c = v.carry; const n = c ? c.n : 0, k = c ? c.k : 'food'; const payee = v.home && D.exists('h:' + v.home) ? 'h:' + v.home : 'p:' + v.id;
      const led0 = D.ledger().length ? D.ledger()[D.ledger().length - 1][0] : 0; const st0 = v.st[k] || 0; const stock0 = D.get('f:' + X.fid, k); const coin0 = D.get(payee, 'moedas');
      if (/^Guardar /.test(out.prompt)) { G.IncUI.use(); __E.until(() => !G.Avatar.busy(), 600); __E.f(6); }
      const mine = D.ledger().filter(e => e[0] > led0 && e[7] === X.op && e[9] === v.id);
      const dep = mine.find(e => e[8] === 'depositar'), pay = mine.find(e => e[8] === 'paga');
      out.r = { n, carry: !!v.carry, dep: dep ? [dep[3], dep[4], dep[6]] : null, pay: pay ? [pay[4], pay[5], pay[6]] : null, due: Math.round(G.Porto.payOf(k, n) * 100) / 100, coin: G.Eco.coinage(X.fid), tally: [st0, v.st[k] || 0], stockUp: Math.round((D.get('f:' + X.fid, k) - stock0) * 100) / 100, coinUp: Math.round((D.get(payee, 'moedas') - coin0) * 100) / 100, payee };
      __E.f(10); out.lead = G.IncUI.lead() ? G.IncUI.lead().txt : null;
      out.qa = __E.qa(); out.err = JSON.stringify(G.modErr); __E.leave();
      return out;
    });
    const r = e17d.r;
    ok('e17 seguindo o marcador até a porta, «E — Guardar a caixa…»', /^Guardar a caixa/.test(e17d.prompt), `«${e17d.prompt}»; caminhada ${JSON.stringify(e17d.walk)}`);
    // (by the ledger: the crate from the hands into the people's stock, the pay from the treasury to the house — the stock and the
    // purse also move by others' doings meanwhile, told beside it)
    ok('e17 guarda como um estivador: o estoque do povo, a paga na casa, a conta dele', !r.carry && !!r.dep && r.dep[1] === 'f:' + e17a.fid && Math.abs(r.dep[2] - r.n) < 1e-6 && (!r.coin || (!!r.pay && r.pay[0] === r.payee && r.pay[1] === 'moedas' && Math.abs(r.pay[2] - r.due) < 1e-6)) && Math.abs(r.tally[1] - r.tally[0] - r.n) < 1e-6, JSON.stringify(r));
    ok('e17 verificador', !e17d.qa.length && e17d.err === '{}', `${e17d.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e17d.err}`);
  }
  }
  if (await need('e18')) {
  // ================================ e18: into a house for real — its inside drawn (Etapa 2) ================================
  const e18 = await E(() => {
    __E.fresh('metropole'); const S = G.S, In = G.Interiors, Sp = G.Space, TL = Sp.TILE, B3 = G.Build3D; const out = {};
    // (a house with a plan, its door on a street, a stair up from its ground floor, a grown-up of it who can be lived)
    let H = null;
    for (const b of [...S.buildings.values()].filter(q => q.built && In.has(q) && (q.type === 'house' || q.type === 'sobrado') && In.planDoor(q)).sort((a, c) => a.id - c.id)) {
      const p = Sp.planNow(b); if (!p || !p.entrance || !p.stairs.some(s => s.kind === 'escada' && s.lv0 === (p.entrance.lv || 0))) continue;
      const v = __E.adults(null, o => o.home === b.id && !o.sleeping).sort((a, c) => a.id - c.id)[0]; if (v) { H = { b, p, v }; break; } }
    if (!H) return { none: true };
    const { b, p, v } = H; const d = In.planDoor(b); G.Vg.endTask(v); v.inside = 0; v.x = d[0]; v.y = d[1]; v.path = null;
    if (!__E.enter(v)) return { none: 'não encarnou' }; __E.f(8);
    out.house = `${b.type}#${b.id} ${b.style} ${p.fam}`; window.__h = H;
    const st = G.Avatar.state(); const e = p.entrance; const D = [b.x * TL + e.x, b.y * TL + e.z];
    const lf = () => { const o = B3.opened().find(q => q.id === b.id); const k = o ? p.doors.filter(q => q.kind !== 'vao').findIndex(q => q.id === e.door) : -1; return o ? { open: true, leaf: k >= 0 ? o.leaves[k] : null, cuts: o.cuts } : { open: false }; };
    // 1. the door shut by the world: the house drawn open by its door, the leaf in the opening
    G.Possess.apply(w => { In.useDoor(b, e.door, 'fechar', w); return { ok: true }; }); __E.f(40);
    out.shut = Object.assign(lf(), { state: In.doorState(b, e.door).state });
    // (the door's wall, and the way into the house square to it; the body walked as a player holds the stick, the frames with the
    // eye inside a wall counted)
    const dd = p.doors[e.door], w = p.walls[dd.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
    if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz < 0) { nx = -nx; nz = -nz; }
    let camIn = 0; const go = (x, z, max) => { for (let k = 0; k < max; k++) { const X = b.x * TL + x, Z = b.y * TL + z; const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < 0.12) break; G.Cam3D.yaw = Math.atan2(dz, dx); G.Input3D.down.frente = true; G.Main.frameFor(33); const c = G.Realm.camera().position; if (G.Cam3D.solid(c.x, c.y, c.z)) camIn++; } G.Input3D.down.frente = false; __E.f(6); };
    // 2. up to the door, as a player walks up to it — from the plan's doorstep (Interiors.planDoor: where the world's people stand
    // to go in, up to two metres out) to a step from it, facing it —; the hands open it (E, the world in its step): the leaf
    // turns into the room, the opening free — the cut
    go(e.x - nx * 0.6, e.z - nz * 0.6, 200); camIn = 0;
    let best = null; for (let k = 0; k < 30 && !(best && best.id === 'portaPlanta'); k++) { G.Cam3D.yaw = Math.atan2(D[1] - st.Z, D[0] - st.X); best = G.Interact.best(); G.Main.frameFor(33); }
    if (best && best.id === 'portaPlanta') G.Interact.run(best); __E.until(() => !G.Avatar.busy(), 120); __E.f(40);
    out.open = Object.assign(lf(), { state: In.doorState(b, e.door).state, label: best && best.label, d: +Math.hypot(D[0] - st.X, D[1] - st.Z).toFixed(2) });
    // 3. in through it, square to its wall: the world has it inside; the eye in a room, never in a wall
    go(e.x - nx * 0.6, e.z - nz * 0.6, 200); go(e.x + nx * 1.3, e.z + nz * 1.3, 300); __E.f(30);
    const c = G.Realm.camera().position; const cx = c.x - b.x * TL, cz = c.z - b.y * TL; const R = p.shell.r;
    out.inside = { v: v.inside === b.id, lv: G.Possess.level(), camIn, camRoom: cx > R[0] && cx < R[2] && cz > R[1] && cz < R[3] && !G.Cam3D.solid(c.x, c.y, c.z), open: B3.isOpen(b.id) };
    // 4. who is at home stands, sits, lies where Interiors puts them — drawn there
    const home = [...S.villagers.values()].filter(o => o.inside === b.id && o !== v);
    out.people = { n: home.length, placed: home.filter(o => { const q = B3.openPlace(o); return q && q.X > b.x * TL && q.X < (b.x + b.w) * TL && q.Z > b.y * TL && q.Z < (b.y + b.h) * TL; }).length };
    // 5. up the stair from its foot (the flight whole): its lid, where it has one, lifts while the body goes through
    const s = p.stairs.find(q => q.kind === 'escada' && q.lv0 === G.Possess.level());
    if (s) { const n = p.grid.n, cs = p.grid.cs; const fits = (x, z) => { for (const [ax, az] of [[0, 0], [0.32, 0], [-0.32, 0], [0, 0.32], [0, -0.32]]) { const q = Sp.indoor(b.x * TL + x + ax, b.y * TL + z + az, G.Possess.level(), b.id); if (!q || !q.walk) return false; } return true; };
      const cell = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)]; const [sx, sz] = cell(st.X - b.x * TL, st.Z - b.y * TL), [tx, tz] = cell(s.a[0], s.a[1]); const prev = new Map(); const key = (x, z) => z * n + x; const q = [[sx, sz]]; prev.set(key(sx, sz), null);
      for (let i = 0; i < q.length; i++) { const [x, z] = q[i]; if (x === tx && z === tz) break; for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + ax, Z = z + az; if (X < 0 || Z < 0 || X >= n || Z >= n || prev.has(key(X, Z))) continue; if (!(X === tx && Z === tz) && !fits((X + 0.5) * cs, (Z + 0.5) * cs)) continue; prev.set(key(X, Z), [x, z]); q.push([X, Z]); } }
      const path = []; if (prev.has(key(tx, tz))) { let cur = [tx, tz]; while (cur) { path.unshift([(cur[0] + 0.5) * cs, (cur[1] + 0.5) * cs]); cur = prev.get(key(cur[0], cur[1])); } }
      for (const pt of path) go(pt[0], pt[1], 120);
      // (up: the stick held along the flight from its foot)
      let lid = 0, flown = 0; const dir = Math.atan2(s.dir[1], s.dir[0]);
      for (let k = 0; k < 400 && G.Possess.level() === s.lv0; k++) { G.Cam3D.yaw = dir; G.Input3D.down.frente = true; G.Main.frameFor(33); const f = G.Avatar.flight(); if (f) flown++; const o = B3.opened().find(qq => qq.id === b.id); if (o && o.lids.some(x => x > 0.3)) lid++; }
      G.Input3D.down.frente = false; __E.f(20);
      out.up = { path: path.length, lv: G.Possess.level(), want: s.lv1, flown, lid, hole: !!s.hole, camIn }; }
    // 6. saved and loaded in the house: inside still, drawn open again
    { const sv = G.Save.serialize(); G.Save.apply(JSON.parse(sv)); __E.until(() => G.Modes.state === 'INC', 400); __E.until(() => B3.isOpen(b.id), 200); __E.f(10);
      const v2 = G.Possess.body(); out.load = { body: !!v2, inside: !!v2 && v2.inside === b.id, lv: G.Possess.level(), open: B3.isOpen(b.id), err: JSON.stringify(G.modErr) }; }
    out.qa = __E.qa(); out.err = JSON.stringify(G.modErr); out.sounds = G.Audio ? !!G.Audio.play : false;
    return out;
  });
  if (e18.none) ok('e18 há uma casa com planta, escada e morador', false, String(e18.none));
  else {
    ok('e18 a casa e o morador', true, e18.house);
    ok('e18 a porta fechada: a casa desenhada aberta pela porta, a folha no vão', e18.shut.open && e18.shut.state !== 'aberta' && e18.shut.leaf !== null && Math.abs(e18.shut.leaf) < 0.05 && e18.shut.cuts > 0, JSON.stringify(e18.shut));
    ok('e18 as mãos abrem a porta: a folha gira para dentro como o mundo a tem', e18.open.state === 'aberta' && e18.open.leaf !== null && Math.abs(e18.open.leaf) > 1.2, JSON.stringify(e18.open));
    ok('e18 entra: o mundo o tem dentro; o olho num cômodo, nunca numa parede', e18.inside.v && e18.inside.open && e18.inside.camRoom && e18.inside.camIn === 0, JSON.stringify(e18.inside));
    ok('e18 quem está em casa está onde a planta põe (desenhado)', e18.people.placed === e18.people.n, JSON.stringify(e18.people));
    if (e18.up) ok('e18 sobe a escada inteira; o alçapão abre enquanto passa', e18.up.lv === e18.up.want && e18.up.flown > 5 && (!e18.up.hole || e18.up.lid > 0), JSON.stringify(e18.up));
    if (e18.load) ok('e18 salvar e carregar dentro de casa: dentro ainda, desenhada aberta', e18.load.body && e18.load.inside && e18.load.open && e18.load.err === '{}', JSON.stringify(e18.load));
  }
  await shot('e18-dentro');
  // 7. the god takes the house away with the body in it: the inside given back, the body out on firm ground, nothing broken
  const e18b = await E(() => {
    const H = window.__h; const v = G.Possess.body(); if (!H || !v) return null; const b = G.S.buildings.get(H.b.id); if (!b) return null; const was = v.inside === b.id;
    G.Village.destroyBuilding(b, 'deus'); __E.f(60);
    return { was, inside: v.inside, open: G.Build3D.isOpen(b.id), opened: G.Build3D.opened().length, ground: G.W.walkableXY(v.x, v.y) || G.Possess.afloat(v), err: JSON.stringify(G.modErr), qa: __E.qa() };
  });
  if (e18b) ok('e18 o deus tira a casa com o corpo dentro: o interior some, o corpo fora em chão firme', !e18b.open && !e18b.inside && e18b.ground && e18b.err === '{}', JSON.stringify(e18b));
  ok('e18 verificador', !e18.qa || (!e18.qa.length && e18.err === '{}'), `${(e18.qa || []).slice(0, 3).join(' · ') || 'limpo'} · ${e18.err}`);
  }
  if (await need('e8')) {
  // ================================ e8: stress (last: it is the longest) ================================
  const e8 = await E(() => {
    __E.fresh('metropole'); const S = G.S;
    const s = __E.town(); const pool = __E.adults(null).filter((o, i) => i % 7 === 0).slice(0, 40);
    const roots = () => document.querySelectorAll('#inc-root').length;
    const trip = (v, save) => { if (!G.Modes.enter(v)) return false; __E.until(() => G.Modes.state === 'INC', 300, 100); __E.f(6, 50); if (save) { G.Save.apply(JSON.parse(G.Save.serialize())); __E.f(6); } G.Modes.leave('deus'); __E.until(() => G.Modes.state === 'GOD', 300, 100); return true; };
    // (the first descent builds what stays — the 3D canvas, its listeners, the far pictures: measured after it)
    trip(pool[0]); const god0 = G.Realm.memory().live; const L0 = window.__L;
    const mem = []; let fails = 0, saves = 0;
    for (let k = 1; k <= 30; k++) {
      const v = G.S.villagers.get(pool[k % pool.length].id); if (!v || !G.Possess.can(v).ok) continue;
      if (!trip(v, k % 5 === 4)) { fails++; continue; } if (k % 5 === 4) saves++;
      const m = G.Realm.memory(); mem.push([m.live, m.geometries]);
    }
    const L1 = window.__L;
    // a long walk, running, along the world's own path to the farthest door the feet reach: the near pictures are made
    // ahead and thrown away behind; at most the disc that is kept (37 at the light quality) is ever held
    const v = __E.adults(s)[0]; __E.enter(v); const st0 = G.Realm.stats; const b0 = st0.builds, r0 = st0.rebuilds;
    let far = null, fd = 0; for (const b of S.buildings.values()) { if (!b.built) continue; const d = G.Vg.door(b); const dd = G.dist(d[0], d[1], v.x, v.y); if (dd > fd && dd < 50 && G.W.reaches(v, d[0], d[1])) { fd = dd; far = d; } }
    let maxNear = 0, maxLive = 0; const watch = () => { maxNear = Math.max(maxNear, G.Realm.chunkCount().near); maxLive = Math.max(maxLive, G.Realm.memory().live); };
    const f0 = G.Main.frameFor; G.Main.frameFor = ms => { f0(ms); watch(); };
    const p0 = G.Realm.stats.parts; const w = far ? __E.walkTo(far[0], far[1], 4500, true) : null;
    G.Main.frameFor = f0;
    const walk = { to: +(fd * 4).toFixed(0), ok: w && w.ok, frames: w && w.frames, maxNear, maxLive, built: G.Realm.stats.builds - b0, rebuilt: G.Realm.stats.rebuilds - r0, parts: G.Realm.stats.parts - p0, ms: Math.round(G.Realm.stats.ms) };
    // (L-099) a house raised far from the body, and the world's counters moving, change nothing in the pictures near it
    { const b = __E.body(); const C = 16, cx = Math.floor(b.x / C), cy = Math.floor(b.y / C); const keys = []; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keys.push([cx + dx, cy + dy]);
      const sig = () => keys.map(([x, y]) => JSON.stringify(G.Realm.sigOf(x, y))).join('|'); const s0 = sig();
      let spot = null; for (let y = 2; y < G.N - 2 && !spot; y++) for (let x = 2; x < G.N - 2; x++) { const i = y * G.N + x; if (Math.max(Math.abs(Math.floor(x / C) - cx), Math.abs(Math.floor(y / C) - cy)) >= 4 && G.W.walkable(i) && !S.occ[i] && !S.road[i] && S.type[i] === G.T.GRASS) { spot = [x, y]; break; } }
      const hb = spot && G.Village.addBuilding('hut', spot[0], spot[1], b.set, true); G.W.touchWalk(); S.typeVer = (S.typeVer || 0) + 1;
      walk.farHouse = !!hb && sig() === s0; if (hb) { G.Village.removeBuilding(hb); G.W.touchWalk(); } }
    // the frame's cost, in the biggest town, with the near world built (the medium quality, then the light one)
    G.Realm.setQuality('media'); __E.f(40, 33);
    const times = []; for (let k = 0; k < 90; k++) { const t0 = performance.now(); G.Main.frameFor(16); times.push(performance.now() - t0); }
    times.sort((a, b) => a - b); const near = G.People3D.count, beasts = G.People3D.beasts, info = G.Realm.memory();
    G.Realm.setQuality('baixa'); const tl = []; for (let k = 0; k < 60; k++) { const t0 = performance.now(); G.Main.frameFor(16); tl.push(performance.now() - t0); } tl.sort((a, b) => a - b);
    __E.leave(); walk.godAfter = G.Realm.memory().live;
    return { fails, saves, mem, god0, L0, L1, roots: roots(), walk, frame: { med: times[45], p95: times[85], calls: info.calls, tris: info.tris, people: near, beasts }, low: { med: tl[30], p95: tl[57] } };
  });
  // the years skipped after (the skip lives in slices of its own, between the browser's turns: waited for, not looped)
  const sk = await page.evaluate(() => new Promise(res => {
    const d0 = G.S.day, t0 = performance.now(); G.Skip.start('anos10', 'livre');
    const tick = () => { if (G.Skip.on && performance.now() - t0 < 1500000) return setTimeout(tick, 400); const on = G.Skip.on; if (on) G.Skip.stop(); G.UI.closeModal(); res({ on, d0, d1: G.S.day, s: Math.round((performance.now() - t0) / 1000) }); };
    tick();
  }));
  const again = await E(() => { const v = __E.adults(null)[0] || [...G.S.villagers.values()].find(o => o.age >= 18 && G.Possess.can(o).ok); const ok = !!v && __E.enter(v); __E.leave(); return { ok, qa: __E.qa(), err: JSON.stringify(G.modErr) }; });
  e8.qa = again.qa; e8.err = again.err;
  const g = e8.mem.map(m => m[0]);
  ok('e8 30 idas e voltas (6 com save no meio): sem acúmulo', !e8.fails && e8.mem.length >= 25 && Math.max(...g) - Math.min(...g) <= 6 && Math.abs(g[g.length - 1] - e8.god0) <= 6 && e8.roots === 1, `geometrias no Modo Deus: ${e8.god0} depois da 1ª descida; ${g.slice(0, 3).join(',')} … ${g.slice(-3).join(',')} nas voltas; saves ${e8.saves}; HUD ${e8.roots}`);
  ok('e8 sem ouvintes acumulados', e8.L1 - e8.L0 <= 2, `ouvintes novos em 30 voltas (depois da 1ª descida): ${e8.L1 - e8.L0}`);
  ok('e8 caminhada longa: chunks vêm e vão, a memória fica', e8.walk.ok && e8.walk.to >= 150 && e8.walk.maxNear <= 37 && e8.walk.built >= 8 && Math.abs(e8.walk.godAfter - e8.god0) <= 6, JSON.stringify(e8.walk));
  ok('e8 uma casa erguida longe não refaz os pedaços perto do corpo (L-099)', e8.walk.farHouse, String(e8.walk.farHouse));
  ok('e8 salto de 10 anos depois, e encarna de novo', !sk.on && sk.d1 - sk.d0 >= 9 && again.ok, JSON.stringify(Object.assign({}, sk, { again: again.ok })));
  console.log(`DESEMPENHO | encarna | metrópole, perto do corpo: ${e8.frame.people} pessoas e ${e8.frame.beasts} bichos desenhados, ${e8.frame.calls} chamadas, ${e8.frame.tris} triângulos; quadro inteiro (simulação + 3D, WebGL por software): mediana ${e8.frame.med.toFixed(1)} ms, p95 ${e8.frame.p95.toFixed(1)} ms; qualidade leve: ${e8.low.med.toFixed(1)} / ${e8.low.p95.toFixed(1)} ms; o salto de 10 anos: ${sk.s} s`);
  ok('e8 verificador', !e8.qa.length && e8.err === '{}', `${e8.qa.slice(0, 3).join(' · ') || 'limpo'} · ${e8.err}`);

  }
  ok('sem erros de página', !errs.length, errs.slice(0, 4).join(' || ') || 'nenhum');
  console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
