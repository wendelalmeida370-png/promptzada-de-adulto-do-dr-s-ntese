// ordens: a caça da ordem secreta (L-662, D-148) — provocada de propósito.   node qa/ordens.js [mundo]
// A ordem marcava o seu homem para calar uma testemunha uma vez e não olhava mais: se a caça parava sem matar (o prazo, o sono,
// a festa, o lar, um bando), a testemunha ficava no limbo — nem calada nem falando —, e só um load mandava caçar de novo (os
// mundos prontos da geração 18 guardavam homens marcados para três e quatro testemunhas). Agora a caça vale enquanto o homem
// está nela, a testemunha cuja caça parou espera a ordem um intervalo (G.Secrets.RETRY) e é caçada de novo, e o save guarda as
// caças como estão. o1 o save de antes (o mundo pronto): as marcas sem caça por trás saem e cada testemunha espera a ordem — o
// load não manda caçar ninguém; o2 a caça cortada (a mão da prova tira o homem dela, como a festa, o sono ou o lar tiram): no
// olhar seguinte a testemunha fica sem caçador e esperando, nenhuma caça nela antes da hora, e caça nova quando a hora chega
// (as outras caças da ordem nesse meio-tempo cortadas também, para o homem estar livre; se ela vai por outro caminho — a ordem
// a deixa falar, ela morre —, o caso se arma noutra caça, até três vezes); o3 a mesma vida com e sem um save/load
// no meio: o load devolve as caças como estavam (a marca, a espera, quem segue quem e há quanto tempo), e nas duas vidas o corte
// da mesma caça no mesmo instante limpa a mesma marca no mesmo olhar e a ordem manda o mesmo homem atrás da mesma testemunha no
// mesmo olhar; e o verificador limpo, e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'mega';
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | ordens ${name} | ${info}`); if (!c) fails.push(name); };
const socs = () => (G.S.secrets && G.S.secrets.socs) || [];
const pending = () => { const out = []; for (const q of socs()) for (const w of q.wit || []) if (w.fate === 'calar' && !w.done) out.push({ q, w }); return out; };
const stalks = () => [...G.S.villagers.values()].filter(v => v.task && v.task.type === 'stalk');
const secret = () => QA.check().filter(x => x.sys === 'secret').map(x => `[S${x.sev}] ${x.msg}`);
// the hunts as the save must keep them: each witness's mark and wait, who follows whom and for how long
const snap = () => JSON.stringify({
  wit: pending().map(({ q, w }) => [q.id, w.id, w.hunter || 0, w.next || 0]).sort((a, b) => a[1] - b[1]),
  st: stalks().map(v => [v.id, v.task.target, v.task.soc, v.task.w || 0, v.task.inq || 0, v.task.st || 0, v.task.age || 0]).sort((a, b) => a[0] - b[0]),
});
const RETRY = () => G.Secrets.RETRY();
// (the man the order would send — its most cruel, as the order chooses —, and what holds him: for the message)
const man = q => { const v = G.Secrets.membersOf(q).filter(o => o.id !== q.master && !o.captive && !o.held && !o.aboard && o.age < 60).sort((a, b) => (G.Politics.persona(b).cru + G.Politics.persona(b).agg) - (G.Politics.persona(a).cru + G.Politics.persona(a).agg))[0]; return v ? `#${v.id}${v.jail ? ' preso' : ''}, ${v.task ? v.task.type + ' ' + (v.task.pri || 0) : 'sem afazer'}, fome ${Math.round(v.hunger)}` : 'nenhum'; };
// (the ready world's own save, read before any load touches it: what it kept)
const raw = (() => { const data = {}; const got = G.Ready.got; G.Ready.got = (k, s) => { data[k] = s; }; try { M.run('worlds/' + WORLD + '.js'); } finally { G.Ready.got = got; } return JSON.parse(data[WORLD]); })();
const rawMarks = []; if (raw.secrets) for (const q of raw.secrets.socs) for (const w of q.wit || []) if (w.fate === 'calar' && !w.done && w.hunter) rawMarks.push(w.id);
const bad = [];
const live = (secs, each) => { for (let k = 0; k < Math.round(secs * 10); k++) { M.viver(0.1); if (each && each(k) === true) return true; if (k % 100 === 0) { const w = secret(); if (w.length) bad.push(w[0]); } } return false; };

// ---------------- o1 the save of before: its marks have no hunt behind them; they go, and the load sends nobody hunting ----------------
M.pronto(WORLD);
const t0 = G.S.clock; const p0 = pending();
{
  // (the witnesses the save kept marked: none marked now, each waiting for the order; one the save kept unmarked is the step's)
  const was = new Set(rawMarks); const kept = p0.filter(x => was.has(x.w.id));
  const marked = p0.filter(x => x.w.hunter).length, waiting = kept.filter(x => Math.abs(x.w.next - (t0 + RETRY())) < 1e-6).length, sent = stalks().filter(v => v.task.w).length;
  // (and no hunt on them in the first looks of the order: the wait is the step's rule, not a hunt the load decided)
  let early = 0; live(9, () => { early = Math.max(early, stalks().filter(v => was.has(v.task.w)).length); });
  ok(`o1 ${WORLD}`, rawMarks.length > 0 && marked === 0 && waiting === kept.length && kept.length === rawMarks.length && sent === 0 && early === 0 && !secret().length,
    `o save do mundo pronto guardava ${rawMarks.length} testemunha(s) a calar com caçador marcado, sem caça nenhuma (a tarefa não ia no save); depois do load: ${marked} marcada(s), ${waiting} de ${kept.length} esperando a ordem até ${Math.round(t0 + RETRY())} s (agora ${Math.round(t0)}), ${sent} caça(s) mandada(s) pelo load, ${early} nelas nos primeiros 9 s`);
}

// ---------------- o2 a hunt cut: the next look leaves the witness waiting; a new hunt only when the time comes ----------------
// (a witness may go another way meanwhile — she talks when the order has no man for her, she dies —: the case is armed again on
// another hunt, up to three times; the order's man held by something weightier — a feast, a band — waits, the rule of L-456)
let H = null, W = null, Q = null; const tried = [], seen = new Set();
for (let at = 0; at < 3; at++) {
  H = null; live(RETRY() + 120, () => { const v = stalks().find(x => x.task.w && !seen.has(x.task.w)); if (v) { H = v; W = v.task.w; Q = socs().find(q => q.id === v.task.soc); return true; } });
  if (!H) { tried.push(`nenhuma caça nova em ${Math.round(RETRY() + 120)} s (testemunhas a calar: ${pending().length})`); break; }
  seen.add(W);
  const wOf = () => (Q.wit || []).find(x => x.id === W);
  const c0 = G.S.clock; const h0 = H.id; G.Vg.endTask(H); // (the test's hand takes the man from the hunt, as the feast, the bed or the home take him)
  let c1 = null, next = null, retried = null, early = null; const others = [];
  live(4, () => { const w = wOf(); if (w && !w.hunter) { c1 = G.S.clock; next = w.next; return true; } });
  if (c1 !== null) {
    // (until the wait is over and beyond: no hunt on her before it; the order's other hunts cut too, its man free)
    live(next - G.S.clock + RETRY(), () => {
      for (const v of stalks()) {
        if (v.task.soc !== Q.id) continue;
        if (v.task.w === W) { if (G.S.clock < next - 1e-6) early = G.S.clock; else { retried = { c: G.S.clock, h: v.id }; return true; } }
        else { others.push(v.task.w); G.Vg.endTask(v); }
      }
      const w = wOf(); if (!w || w.done || w.fate !== 'calar') return true;
    });
  }
  // (another way: she talked, she died — or the order has no man of its own to send but its master, busy: it waits on him)
  const w = wOf(); const noMan = man(Q) === 'nenhum'; const away = !retried && (!w || w.done || w.fate !== 'calar' || noMan);
  const look = c1 !== null && Math.abs(next - (c1 + RETRY())) < 1e-6 && c1 - c0 <= 3.11;
  const txt = `${Q.name}: #${h0} atrás da testemunha #${W}, cortado em ${c0.toFixed(1)} s; ${c1 === null ? 'NENHUM OLHAR LIMPOU A MARCA (o limbo)' : `o olhar de ${c1.toFixed(1)} s a deixou sem caçador, esperando até ${next.toFixed(1)} s (${(next - c1).toFixed(0)} s)`}; ${early !== null ? `CAÇA NOVA ANTES DA HORA (${early.toFixed(1)} s)` : 'nenhuma caça nela antes da hora'}; ${retried ? `caça nova em ${retried.c.toFixed(1)} s por #${retried.h}, ${(retried.c - next).toFixed(1)} s depois da hora` : away ? `ela foi por outro caminho (${!w ? 'saiu da lista' : w.done ? 'resolvida' : w.fate !== 'calar' ? 'a ordem a deixou falar' : 'a ordem sem outro homem que o mestre para mandar'})` : `NENHUMA CAÇA NOVA em ${Math.round(RETRY())} s depois da hora (o homem da ordem: ${man(Q)})`}${others.length ? ` (cortadas também ${others.length} caça(s) da ordem nesse meio-tempo: #${others.join(', #')})` : ''}`;
  tried.push(txt);
  if (!look || early !== null || !away) { ok(`o2 ${WORLD}`, look && early === null && !!retried, tried.join(' · ')); break; }
  if (at === 2) ok(`o2 ${WORLD}`, false, tried.join(' · ') + ' — três testemunhas por outro caminho');
}
if (!H && tried.length) ok(`o2 ${WORLD}`, false, tried.join(' · '));

// ---------------- o3 the same life with and without a save and a load in the middle: the same hunts ----------------
{
  const hunting = stalks().find(v => v.task.w && (!Q || v.task.soc === Q.id)) || stalks().find(v => v.task.w);
  if (!hunting) ok(`o3 ${WORLD}`, false, 'nenhuma caça em andamento para salvar no meio');
  else {
    const hid = hunting.id, wid = hunting.task.w, sid = hunting.task.soc;
    const str = G.Save.serialize(); const A0 = snap(); const T = G.S.clock;
    // one life: 5 s on, the hunt cut by the test's hand, and until the order sends a man after a witness again (or 60 s)
    const run = () => {
      live(5); const h = G.S.villagers.get(hid); const cut = G.S.clock; if (h) G.Vg.endTask(h);
      const q = socs().find(x => x.id === sid); let clear = null, nxt = null, sent = null;
      live(60, () => {
        const w = (q.wit || []).find(x => x.id === wid);
        if (clear === null && w && !w.hunter) { clear = G.S.clock; nxt = w.next; }
        const v = clear !== null && stalks().find(x => x.task.soc === sid && x.task.w);
        if (v) { sent = { c: G.S.clock, h: v.id, w: v.task.w }; return true; }
      });
      return { cut, clear, nxt, sent, end: snap() };
    };
    const A = run();
    G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0);
    const B0 = snap(); const B = run();
    const same = (x, y) => x === y || (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) < 1e-6);
    const sameSent = (!A.sent && !B.sent) || (A.sent && B.sent && A.sent.h === B.sent.h && A.sent.w === B.sent.w && same(A.sent.c, B.sent.c));
    const n1 = x => (Number.isFinite(x) ? x.toFixed(1) : '-');
    const say = r => `marca limpa em ${r.clear === null ? 'NUNCA' : n1(r.clear) + ' s'}, espera até ${n1(r.nxt)}; ${r.sent ? `#${r.sent.h} atrás de #${r.sent.w} em ${n1(r.sent.c)} s` : 'nenhuma caça nova em 60 s'}`;
    ok(`o3 ${WORLD}`, B0 === A0 && same(A.clear, B.clear) && same(A.nxt, B.nxt) && sameSent,
      `salvo em ${T.toFixed(1)} s com #${hid} atrás de #${wid}; o load devolveu as caças ${B0 === A0 ? 'como estavam' : 'DIFERENTES: ' + A0.slice(0, 160) + ' ≠ ' + B0.slice(0, 160)}; sem save: ${say(A)} · com save: ${say(B)}`);
  }
}
const e = M.erros(); const errs = e.console.filter(l => /error|warn/.test(l));
ok('verificador e erros', !bad.length && !secret().length && !Object.keys(e.mod).length && !errs.length, `ordens: ${bad.length ? bad.slice(0, 2).join(' · ') : 'limpo'}; erros de módulo ${JSON.stringify(e.mod)}; console ${errs.length ? errs.slice(0, 3).join(' | ') : 'limpo'}`);
console.log(fails.length ? `ORDENS: ${fails.length} FALHOU (${fails.join(', ')})` : 'ORDENS: ok');
process.exit(fails.length ? 1 : 0);
