// lar-inv: as regras do verificador para a vida em casa (P1, Patch 2) — quem está dentro de uma casa e por quê, quem dorme
// e como, quem está fora de casa à noite sem afazer, quem cuida dos pequenos de dia (um por casa, e nenhuma criança presa
// em casa sem ele), o bebê nos braços certos ao alcance (D-074), a despensa pelo livro-razão; e, no estado canônico, quem
// está em casa
// (a ida e volta pelo save não pode tirar ninguém da cama: D-073). Carregado depois do qa/qa.js (QA.more / QA.canonMore);
// o junta-inv.js o leva para dentro do qa.js. Lê os campos do mundo direto; a planta, pelas portas do G.Interiors.
(function () {
  if (!window.QA || !QA.more) return;
  const r2 = x => Math.round(x * 100) / 100;
  const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  // (what keeps someone in a house: asleep, the evening at home, sheltering from a storm, the end of the day's work, hiding
  // from an enemy, a secret meeting in a house that is a front, the god's body)
  const IN_OK = { sleep: 1, lar: 1, shelter: 1, goHome: 1, hide: 1, conclave: 1, avatar: 1 };
  // (the pantries changed outside the ledger by the files of other owners still name their places: T-130 — the rule says
  // so at S4 until they close; then it is S2)
  const PANTRY_SEV = 4;
  let night0 = new Map(), night0S = null; // (since when each grown one has been out at night with nothing to do)
  let held0 = new Map(), held0S = null; // (since when each little one has been kept at home by day with nobody minding)
  let baby0 = new Map(), baby0S = null; // (since when each baby has been in the wrong arms — or in none — with the right ones within reach)
  let pan = new Map(), panS = null; const moved = new Map(); // (each pantry at the last look; what the ledger moved since)
  QA.more.push(function (add, s) {
    const Lr = G.Lar; if (!Lr) return;
    const body = s.avatar ? s.avatar.id : 0; const In = G.Interiors;
    // ---- inside a house only with a cause; asleep there only to sleep, and lying down
    for (const v of s.villagers.values()) {
      // (a building's id; the underground's mark — caves.js, UGIN — is the caves' own)
      if (!(v.inside > 0) || v.id === body || v.ug) continue;
      const b = s.buildings.get(v.inside); const nm = `${v.name} #${v.id}`;
      if (!b) { add('lar', 2, `${nm}: dentro de um prédio que não existe (${v.inside})`, v.id); continue; }
      // (at prayer inside the temple: at a place of prayer of its plan — the mats, the benches, the altar for the priest —, never
      // standing anywhere: L-224. Only where the plan is made)
      if (b.type === 'temple') {
        const t = v.task;
        if (t && t.type === 'pray' && t.inT === b.id && t.st === 2 && In && In.ready && In.ready(b) && In.placeOf) { const q = In.placeOf(v); if (!(q && (q.use === 'rezar' || q.use === 'sentar' || (t.priest && q.use === 'oficiar')))) add('lar', 3, `${nm}: rezando em ${b.type}#${b.id} fora de um lugar de rezar da planta (${q ? q.use || q.pose : 'sem lugar'})`, v.id); }
        continue;
      }
      if (!housing(b)) continue;
      // (a baby: in the arms of who carries it, or at home — the house keeps the baby nobody is free to hold, babyUpdate)
      if (v.age < 2) { const c = s.villagers.get(v.carrier); const m = s.villagers.get(v.mother); if (!(c && c.inside === b.id) && v.home !== b.id && !(m && m.home === b.id)) add('lar', 3, `o bebê ${nm} está dentro de ${b.type}#${b.id} sem quem o carrega, e não é a casa dele`, v.id); continue; }
      const t = v.task;
      if (!t || !IN_OK[t.type]) { add('lar', 2, `${nm}: dentro de ${b.type}#${b.id} sem motivo (${t ? 'tarefa ' + t.type : 'sem tarefa'})`, v.id); continue; }
      if (t.type === 'lar' && (t.home !== b.id || t.st !== 2 || !Lr.WHAT[t.what])) add('lar', 3, `${nm}: «${t.what}» da casa ${t.home} (passo ${t.st}) dentro de ${b.type}#${b.id}`, v.id);
      if (v.sleeping && t.type !== 'sleep') add('lar', 2, `${nm}: dormindo dentro de ${b.type}#${b.id} na tarefa ${t.type}`, v.id);
      // (asleep, the plan's place for them is lying down — on the bed, or on the floor —, never standing: L-228. Only where the
      // plan is already made: the checker does not make plans for every house it looks at)
      if (v.sleeping && In && In.ready && In.ready(b) && In.placeOf) { const q = In.placeOf(v); if (q && q.pose !== 'deitado') add('lar', 3, `${nm}: dormindo ${q.pose} em ${b.type}#${b.id} (o lugar da planta não é de deitar)`, v.id); }
    }
    // ---- after dark, a grown one with a house, awake and out of it with nothing to do, for more than 30 s of the world (a
    // night outdoors is not an evening at home: L-225 — the tavern, the watch, a feast, the war, the sea are causes; a stroll is not)
    const night = s === G.S && G.isNight ? G.isNight() : false;
    if (night0S !== s) { night0S = s; night0 = new Map(); }
    const now = new Map();
    if (night) for (const v of s.villagers.values()) {
      if (v.age < 16 || !v.home || v.inside || v.sleeping || v.captive || v.jail || v.aboard || v.ug || v.held || v.air || v.id === body || v.wrecked || v.guestOf) continue;
      const h = s.buildings.get(v.home); if (!h || !h.built || h.type === 'ruin') continue;
      const t = v.task; if (t && t.type !== 'wander' && t.type !== 'idle') continue;
      const since = night0.has(v.id) ? night0.get(v.id) : s.clock; now.set(v.id, since);
      if (s.clock - since > 30) add('lar', 3, `${v.name} #${v.id}: fora de casa à noite sem afazer há ${Math.round(s.clock - since)} s (${t ? t.type : 'sem tarefa'}${Lr.sleepy(v) ? ', na hora de dormir' : ''})`, v.id);
    }
    night0 = now;
    // ---- by day, one of the house minds the little ones at home — one per house —, and a little one stays at home past the
    // day's while (12 s) only while someone minds them there: none kept at home by a minder who is gone (the request's 3.1)
    const day = s === G.S && G.isNight && G.isEvening ? !G.isNight() && !G.isEvening() : false;
    if (held0S !== s) { held0S = s; held0 = new Map(); }
    const held = new Map();
    if (day) {
      const care = new Map();
      for (const v of s.villagers.values()) { const t = v.task; if (t && t.type === 'lar' && t.what === 'cuidar' && t.st === 2 && v.inside === t.home) { const a = care.get(t.home) || []; a.push(v); care.set(t.home, a); } }
      for (const [hid, a] of care) { const long = a.filter(o => o.actT > 3); if (long.length > 1) add('lar', 3, `casa #${hid}: ${long.length} cuidando dos pequenos ao mesmo tempo (${long.map(o => `${o.name} #${o.id}`).join(', ')})`); }
      for (const v of s.villagers.values()) {
        const t = v.task; if (v.age >= 7 || v.id === body || !t || t.type !== 'lar' || t.st !== 2 || (t.what !== 'conversar' && t.what !== 'descansar') || !(v.actT > 12) || care.has(t.home)) continue;
        const since = held0.has(v.id) ? held0.get(v.id) : s.clock; held.set(v.id, since);
        if (s.clock - since > 5) add('lar', 3, `${v.name} #${v.id}: criança presa em casa (#${t.home}) de dia há ${Math.round(v.actT)} s, sem ninguém da casa cuidando`, v.id);
      }
    }
    held0 = held;
    // ---- a baby changes arms where it is (D-074): alone at home with one of its house there who can hold it, or in the arms
    // of another with the mother or the father within reach who can — for more than 3 s of the world (the hand-over looks
    // once a second) —; the body the player lives keeps the baby it holds
    if (baby0S !== s) { baby0S = s; baby0 = new Map(); }
    const bnow = new Map(); const Vg = G.Vg;
    if (Vg && Vg.canHold && Vg.babyReach) for (const b of s.villagers.values()) {
      if (b.age >= 2 || b.captive || b.ug) continue;
      let wrong = '';
      if (!b.carrier) { if (b.inside > 0) for (const o of s.villagers.values()) if (o.id !== body && o.home && o.home === b.home && o.age >= 16 && o.age < 70 && o.set === b.set && Vg.canHold(o) && Vg.babyReach(b, o)) { wrong = `sozinho em casa com ${o.name} #${o.id} ali, que pode segurá-lo`; break; } }
      else if (b.carrier !== b.mother && b.carrier !== b.father && b.carrier !== body) { const p = [s.villagers.get(b.mother), s.villagers.get(b.father)].find(o => o && o.id !== body && o.set === b.set && Vg.canHold(o) && Vg.babyReach(b, o)); if (p) wrong = `no colo de #${b.carrier} com ${p.name} #${p.id} (${p.id === b.mother ? 'a mãe' : 'o pai'}) ao alcance`; }
      if (!wrong) continue;
      const since = baby0.has(b.id) ? baby0.get(b.id) : s.clock; bnow.set(b.id, since);
      if (s.clock - since > 3) add('lar', 3, `o bebê ${b.name} #${b.id}: ${wrong}, há ${Math.round(s.clock - since)} s`, b.id);
    }
    baby0 = bnow;
    // ---- whoever is at a feast is at one under way, in a part of it (L-222: a save no longer ends a festival)
    if (G.Fest && G.Fest.list) {
      const fl = new Map(G.Fest.list().map(f => [f.id, f]));
      for (const v of s.villagers.values()) { const t = v.task; if (!t || t.type !== 'fest') continue; const f = fl.get(t.fid); if (!f) add('lar', 2, `${v.name} #${v.id}: na festa #${t.fid}, que não existe`, v.id); else if (!f.parts.includes(v.id)) add('lar', 3, `${v.name} #${v.id}: na festa #${t.fid} sem estar entre os dela`, v.id); }
    }
    // ---- the pantry moves only by the ledger: each house's food now = at the last look + what the ledger moved in and out
    if (panS !== s) { panS = s; pan = new Map(); moved.clear(); }
    for (const b of s.buildings.values()) {
      if (!housing(b)) continue;
      const n = b.pantry || 0; const p = pan.get(b.id);
      if (p !== undefined) { const m = moved.get(b.id) || 0; if (Math.abs(n - (p + m)) > 0.01) add('lar', PANTRY_SEV, `${b.type}#${b.id}: a despensa foi de ${r2(p)} para ${r2(n)} e o livro moveu ${r2(m)} — mudou fora do livro-razão (T-130)`); }
      pan.set(b.id, n);
    }
    moved.clear();
  });
  // (the ledger's lines of food in and out of the houses, between two looks)
  if (G.Depot) G.Depot.onMove.push(e => {
    if (e[5] !== 'food') return;
    const at = (ref, k) => { if (typeof ref === 'string' && ref[0] === 'h' && ref[1] === ':') { const id = +ref.slice(2); moved.set(id, (moved.get(id) || 0) + k * e[6]); } };
    at(e[3], -1); at(e[4], 1);
  });
  if (G.worldHooks) G.worldHooks.push(() => { night0 = new Map(); night0S = null; held0 = new Map(); held0S = null; baby0 = new Map(); baby0S = null; pan = new Map(); panS = null; moved.clear(); });
  // (who is at home — asleep, in the evening at home, sheltering — and who sleeps outdoors, is the same after a save and a
  // load: the round trip that takes anyone out of bed is seen — D-073, L-220)
  QA.canonMore.push(['lar', () => {
    const s = G.S; if (!s || !G.Lar) return null; const body = s.avatar ? s.avatar.id : 0; const out = [];
    for (const v of [...s.villagers.values()].sort((a, c) => a.id - c.id)) {
      if (v.id === body || v.age < 2 || v.captive || v.jail || v.aboard || v.ug) continue; const t = v.task;
      const b = v.inside ? s.buildings.get(v.inside) : null;
      if (b && housing(b) && b.built && b.type !== 'ruin' && t && (t.type === 'sleep' || (t.type === 'lar' && t.st === 2 && b.id === v.home) || (t.type === 'shelter' && b.id === v.home))) out.push([v.id, b.id, v.sleeping ? 1 : 0, t.type, t.what || '']);
      else if (b && b.type === 'temple' && b.built && t && t.type === 'pray' && t.st === 2 && t.inT === b.id) out.push([v.id, b.id, 0, 'pray', t.priest ? 'sacerdote' : '']); // (at prayer inside the temple: L-224)
      else if (!v.inside && v.sleeping && t && t.type === 'sleep' && t.st >= 2) out.push([v.id, 0, 1, 'sleep', '']);
    }
    return out;
  }]);
  // (the festivals under way, their stage and their people in their parts, the same after a save and a load — L-222)
  QA.canonMore.push(['festas', () => {
    if (!G.S || !G.Fest || !G.Fest.list) return null; const s = G.S;
    return G.Fest.list().slice().sort((a, c) => a.id - c.id).map(f => [f.id, f.key, f.set, f.stage, f.parts.filter(id => { const v = s.villagers.get(id); return v && v.task && v.task.type === 'fest' && v.task.fid === f.id; }).sort((a, c) => a - c).join('.')]);
  }]);
})();
