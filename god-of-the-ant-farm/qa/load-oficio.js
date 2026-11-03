// load-oficio: o load não redistribui os ofícios (L-419) — provocado de propósito.   node qa/load-oficio.js [mundo pronto]
// O load refazia os ofícios de toda cidade como o passo do mundo os refaz (Village.forceUpdate): os perigos por perto, a
// procura dos ofícios, quem sobra e quem falta — a partir do que o save guarda, que tem a posição de um bicho ao centésimo de
// casa. Um lobo a um fio dentro das vinte casas de uma cidade, salvo a um fio fora, tirava um caçador da conta, e a caçadora
// virava feirante no load (o m3 do motim.js com a junção do Patch 2: Helena de Mileto). O load agora devolve os ofícios como
// foram salvos e só conserta o que não cabe mais; quem os redistribui é o passo do mundo, quatro segundos depois.
// o1 um lobo a um fio dentro das vinte casas de uma cidade, os ofícios assentados com ele: a ida e volta pelo save não muda
//    ofício nenhum (QA.roundTrip igual); o2 o lobo morto depois do load: o passo do mundo devolve a cidade ao que ela queria
//    sem ele (quem redistribui é o passo); o3 um ofício que não existe mais, no save, é consertado no load, e só ele muda;
//    e o verificador limpo, nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const world = process.argv[2] || 'cidade';
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | load-oficio ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = sec => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 30 === 0) watch(); } watch(); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
M.pronto(world); M.viver(2);
const S = () => G.S;
const adults = s => [...S().villagers.values()].filter(v => v.set === s.id && !v.captive && v.age >= 16 && v.age < 62);
const hunters = s => adults(s).filter(v => v.role === 'cacador').length;
const roles = () => { let t = ''; for (const v of S().villagers.values()) t += v.id + ':' + (v.role || '') + ';'; return t; };
const settle = () => god(() => { for (let k = 0, prev = null; k < 30; k++) { G.Village.forceUpdate(); const r = roles(); if (r === prev) break; prev = r; } });
const r2 = n => Math.round(n * 100) / 100;
// (the wolves a hair inside the town's twenty tiles, at the four quarters of its centre: 19.996 tiles, which the save's
// hundredth makes 20.00 — out of the count, `dist < 20`)
const wolfAt = (s, k) => [[s.cx + 19.996, s.cy], [s.cx - 19.996, s.cy], [s.cx, s.cy + 19.996], [s.cx, s.cy - 19.996]][k];
settle();
// a town where the beasts a hair near it mean one more hunter (the town's centre on the hundredth, so the save moves them out):
// the first by id, with the fewest wolves that do it — one, two or three, put by the god's hand. One was the rule, and a
// ready world has no town where one more beast asks a hunter: the generation-10 «cidade» has Mênfis with five beasts near it,
// Tenochtitlan and Hedeby with three (a town counts three at most), and Roma with none but its hands too few — a second
// hunter for one beast gives way to the wood and the forage, and for two beasts it does not (village.js, the trades). T-324
let town = null, base = 0, wolves = [];
for (const s of [...S().settlements.values()].filter(q => adults(q).length >= 7 && r2(q.cx) === q.cx && r2(q.cy) === q.cy).sort((a, b) => a.id - b.id)) {
  const h0 = hunters(s); const put = [];
  for (let k = 0; k < 3; k++) {
    const [x, y] = wolfAt(s, k); if (!G.W.inb(x, y)) break;
    put.push(god(() => G.Animals.spawn('wolf', x, y, { age: 6 }))); settle();
    if (hunters(s) > h0) { town = s; base = h0; wolves = put; break; }
  }
  if (town) break;
  god(() => { for (const w of put) S().animals.delete(w.id); }); settle();
}
if (!town) { ok('o1 o lobo a um fio das vinte casas: a ida e volta não muda ofício', false, 'precondição: nenhuma cidade onde até três lobos a mais pedem um caçador a mais'); process.exit(1); }
const d0 = Math.max(...wolves.map(w => G.dist(w.x, w.y, town.cx, town.cy)));
// o1: the round trip — the settled town, saved and loaded: the same trades
{ const h1 = hunters(town); const trip = QA.roundTrip(); const t = S().settlements.get(town.id);
  const d1 = Math.min(...wolves.map(w => { const wb = S().animals.get(w.id); return wb ? G.dist(wb.x, wb.y, t.cx, t.cy) : -1; }));
  ok('o1 o lobo a um fio das vinte casas: a ida e volta não muda ofício', !trip.diff.length && d0 < 20 && d1 >= 20,
    `${t.name}: ${wolves.length > 1 ? `os lobos ${wolves.map(w => '#' + w.id).join(', ')} a até` : `o lobo #${wolves[0].id} a`} ${d0.toFixed(3)} casas do centro (no save, a ${wolves.length > 1 ? 'no mínimo ' : ''}${d1.toFixed(3)}: fora da conta); ${h1} caçadores com ${wolves.length > 1 ? 'eles' : 'ele'} (${base} sem); o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}`);
}
// o2: who deals the trades out anew is the world's step — the wolves dead after the load, the town wants back what it wanted
{ const t = S().settlements.get(town.id); const h1 = hunters(t); god(() => { for (const w of wolves) S().animals.delete(w.id); }); live(6);
  ok('o2 o passo do mundo redistribui os ofícios depois do load', hunters(t) === base, `${t.name}: ${h1} caçadores no load, ${hunters(t)} seis segundos depois, sem ${wolves.length > 1 ? 'os lobos' : 'o lobo'} (sem ${wolves.length > 1 ? 'eles' : 'ele'} a cidade quer ${base})`);
}
// o3: a trade the game no longer has, in the save: mended at the load — and nobody else changes
{ settle(); const str = G.Save.serialize(); const o = JSON.parse(str); const t = S().settlements.get(town.id);
  const v = adults(t).sort((a, b) => a.id - b.id)[0]; const before = new Map([...S().villagers.values()].map(q => [q.id, q.role]));
  const row = o.villagers.find(q => q.id === v.id); row.role = 'oficio-que-nao-existe';
  god(() => { G.UI.select(null); G.Save.apply(o); });
  const w = S().villagers.get(v.id); const others = [...S().villagers.values()].filter(q => q.id !== v.id && before.get(q.id) !== q.role);
  ok('o3 um ofício que não existe mais, no save, é consertado no load', !!w && !!w.role && w.role !== 'oficio-que-nao-existe' && !others.length,
    `${v.name}#${v.id}: «oficio-que-nao-existe» no save → «${w ? w.role : '-'}» no load; os outros que mudaram: ${others.length ? others.slice(0, 3).map(q => `${q.name} ${before.get(q.id)}→${q.role}`).join(', ') : 'ninguém'}`);
}
const e = M.erros(); const mods = Object.keys(e.mod);
console.log(`${mods.length || e.console.length ? 'FALHOU' : 'PASSOU'} | load-oficio erros | módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 3).join(' · ') || 'nada'}`);
if (mods.length || e.console.length) fails.push('erros');
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
