'use strict';
// ============================================================
//  DiarioUI: the page of a life's diary (§39) — what the person
//  means to do, has promised, is doing, found, heard, lived, and
//  could take up here — read from the world's own record of it
//  (G.Act.diary: only what the person knows; nothing the god
//  knows and they do not). Each line says where it came from (the
//  house, the stall, the quay, the biography, a rumour of the
//  people) and the day. The same page over the body's eyes (a
//  panel of the Modo Encarnado: its key, its button) and in the
//  god's view (the person's page, read only). A kind of the diary
//  with nothing in it is not shown: the page never promises what
//  the world does not have. It organises a life, it does not run
//  it: a goal may be let go — asked of the world by the body's
//  hands (Possess.apply), done by the world in its step by its own
//  rule —, never written from here.
// ============================================================
(function (G) {
  const DU = G.DiarioUI = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the kinds of the diary, in the order a life reads them (§39), and how many lines of each the page shows
  const KINDS = [
    ['goals', 'Objetivos', 8], ['promises', 'Compromissos', 8], ['doing', 'Em andamento', 8], ['found', 'Descobertas', 8],
    ['rumors', 'Ouvi dizer, sem confirmação', 6], ['memories', 'Memórias', 12], ['consequencias', 'Consequências das decisões', 6], ['options', 'Possibilidades por aqui', 6],
  ];
  DU.KINDS = KINDS.map(k => k[0]);
  // (where a line came from, in the person's words: the system that noted it — src —, or what it is)
  const SRC = { 'casa-nova': 'a casa nova', casa: 'a casa', banca: 'a banca', biografia: 'a biografia', nota: 'anotação', rumor: 'ouvido pelo povo', livro: 'o livro-razão', promessa: 'uma promessa', objetivo: 'objetivo', atividade: 'atividade', descoberta: 'descoberta', memória: 'memória', possibilidade: 'possibilidade' };
  const SEC = { goals: 'objetivo', promises: 'promessa', doing: 'atividade', found: 'descoberta', rumors: 'ouvido pelo povo', memories: 'memória', consequencias: 'decisão', options: 'possibilidade' };
  const actName = id => { const d = G.Act && G.Act.DEFS && G.Act.DEFS[id]; return ((d && d.name) || id || '').toLowerCase(); };
  function originOf(k, e) {
    const s = e.origem || e.src;
    if (s) return SRC[s] || String(s);
    if (e.biz) return 'a banca';
    if (e.op && G.Act && G.Act.get) { const op = G.Act.get(e.op); if (op) return 'atividade: ' + actName(op.def); }
    if (k === 'options' && e.def) return 'o que a cidade tem: ' + actName(e.def);
    return SEC[k] || k;
  }
  // (how sure the people are of a rumour, in words)
  const sure = c => (!(c >= 0) ? '' : c >= 0.75 ? 'quase certo' : c >= 0.5 ? 'provável' : c >= 0.25 ? 'duvidoso' : 'pouco crível');
  const when = d => { const S = G.S; if (!S || !(d >= 0)) return ''; return d === S.day ? 'hoje' : d === S.day - 1 ? 'ontem' : 'dia ' + d; };
  // (the same thing told twice — a note and the biography's line for it — is one line)
  const norm = t => String(t || '').toLowerCase().replace(/[.!…\s]+$/, '').replace(/\s+/g, ' ').trim();

  // the diary of a person, as the page reads it: the kinds the world has lines of, each line with its origin — only read
  // (the world's record: G.Act.diary; the god's knowledge never joins it)
  DU.data = function (v) {
    if (!v || !G.Act || !G.Act.diary) return null;
    const d = G.Act.diary(v); const out = [];
    for (const [k, title, max] of KINDS) {
      const L = (d[k] || []).filter(e => e && e.txt); if (!L.length) continue;
      const seen = new Set(); let lines = [];
      for (const e of L) { const n = norm(e.txt); if (seen.has(n)) continue; seen.add(n); lines.push(e); }
      // (the newest first, but the goals, the promises and the work at hand in the order the world keeps them)
      if (k === 'memories' || k === 'rumors' || k === 'consequencias' || k === 'found') lines.sort((a, b) => (b.day || 0) - (a.day || 0));
      lines = lines.slice(0, max).map(e => ({ k, txt: e.txt, day: e.day, origin: originOf(k, e), drop: e.drop || '', prog: e.prog, conf: k === 'rumors' ? e.conf : undefined, st: e.st }));
      out.push({ k, title, lines });
    }
    return out;
  };

  // the page (HTML), for the body's panel (o.mine: the body's own — a goal may be let go from it) or the god's view
  // (o.god: the person's page, read only). Returns { html, lines } — lines in the order of their data-i
  DU.page = function (v, o) {
    o = o || {}; const S = G.S; const secs = DU.data(v) || []; const lines = [];
    let h = '';
    for (const sec of secs) {
      h += `<div class="dl-sec" data-k="${sec.k}"><label>${esc(sec.title)}</label>`;
      for (const e of sec.lines) {
        const i = lines.length; lines.push(e);
        const meta = [e.origin, e.k === 'rumors' && sure(e.conf), when(e.day)].filter(Boolean).join(' · ');
        h += `<div class="dl-e" data-i="${i}"><div class="dl-t">${esc(e.txt)}</div>`;
        if (e.prog >= 0 && e.prog <= 1) h += `<i class="dl-p"><b style="width:${Math.round(e.prog * 100)}%"></b></i>`;
        h += `<div class="dl-o">${esc(meta)}${o.mine && DU.canDrop(e) ? ` <button data-c="drop" data-i="${i}" title="O personagem muda de ideia: o mundo decide no seu passo">Deixar de lado</button>` : ''}</div></div>`;
      }
      h += '</div>';
    }
    if (!secs.length) h = `<div class="dl-none">${o.god ? 'Nada anotado na vida desta pessoa ainda.' : 'Nada anotado ainda.'}</div>`;
    const head = `<div class="dl-head"><span>${S ? 'Dia ' + S.day : ''}</span> · ${o.god ? `o que ${esc(v.name)} sabe, viveu e pretende` : 'o que você sabe, viveu e pretende'}</div>`;
    return { html: head + h, lines };
  };

  // a goal let go: asked of the world by the body's hands, done by the world in its step by its own rule — the door each kind
  // of goal names (drop); the answer comes in the ask ({ ok, msg } or { ok: false, why }). Never written from the page
  const DOORS = {
    'casa-nova': () => G.Possess.apply(w => G.Casa.giveUp(w)), // (the new house, for now: D-061)
  };
  DU.ask = function (line) { const f = line && DOORS[line.drop]; return f && G.Possess.body() ? f() : null; };
  DU.canDrop = line => !!(line && DOORS[line.drop]);
})(window.G);
