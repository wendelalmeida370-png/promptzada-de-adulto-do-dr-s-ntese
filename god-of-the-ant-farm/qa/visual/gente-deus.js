// gente-deus: the person in the god's view and in the 3D, side by side (22a wave 2 — D-640): the same skin, the same hair with
// its grey, the same height, from one source (G.Feicao) — in Node, the simulation of qa/nodemundo.js with three.js and the 3D's
// own files after it (as qa/roupa.js loads them), the god's drawing on a canvas that records what it is asked to paint:
//   d1  a cor        the skin and the hair the god paints (near and far) are the 3D's (People3D.look), for every age
//   d2  a altura     two grown people of one people: the god's figure and the 3D's body in the same ratio (the gene's ±8%)
//   d3  o grisalho   the same person at 30, 55 and 80: the god paints the grey the 3D draws, none before the gene's age
//   d4  só desenha   a thousand people painted by the god: the world the same to the last number (the save, the people)
//   d5  o morto      the dead in their painter's colours (L-1678): the grey of the dead's portrait, the rot, what the fire left —
//                    never the living skin over them; the fresh corpse in the skin and the grey the 3D gives it
//   node qa/visual/gente-deus.js [mundo]          (ONLY=d1,d3 runs some)
const fs = require('fs'), path = require('path');
const M = require('../nodemundo.js');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
const all = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
global.atob = global.atob || (s => Buffer.from(s, 'base64').toString('binary'));
global.performance = global.performance || { now: () => Date.now() };
const G = M.load({ qa: true, extra: all.slice(all.indexOf('js/lib/three.min.js')) });
global.THREE = window.THREE;
G.Realm.shapes(); G.Build3D.init(THREE, G.Realm);
const scene = new THREE.Scene(); const realm = Object.assign(Object.create(G.Realm), { scene: () => scene, renderer: () => null, camera: () => null });
G.People3D.init(THREE, realm);
const P3 = G.People3D, Fe = G.Feicao;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | gente-deus ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const run = k => !ONLY.length || ONLY.includes(k);
M.pronto(process.argv[2] || 'metropole');
const S = G.S;
// (a canvas that keeps the colours it is asked to fill or stroke with, and the scales it is asked for)
const canvas = () => { const paint = [], scales = []; const fn = () => proxy;
  const proxy = new Proxy(function () { }, { get(t, k) { if (k === 'paint') return paint; if (k === 'scales') return scales; if (typeof k === 'symbol') return undefined; if (k === 'scale') return (a, b) => { scales.push([a, b]); return proxy; }; return fn; },
    set(t, k, v) { if (k === 'fillStyle' || k === 'strokeStyle') paint.push(String(v).toLowerCase()); return true; }, apply() { return proxy; } });
  return proxy; };
const god = (v, lod) => { const c = canvas(); G.Art.villager(c, Object.assign({}, v, { act: '', moving: false, inside: 0, sleeping: false, emo: null, task: null }), 0, 0, 0, !!lod); return c; };
const people = [...S.villagers.values()].filter(v => !v.headless).sort((a, b) => a.id - b.id);

if (run('d1')) {
  let n = 0, bad = []; const byAge = { criança: 0, adulto: 0, velho: 0 };
  for (const v of people) { const L = P3.look(v); const near = god(v), far = god(v, true); n++;
    byAge[v.age < 13 ? 'criança' : v.age < 55 ? 'adulto' : 'velho']++;
    const sk = L.skin.toLowerCase(), hr = L.hair.toLowerCase(), f = Fe.of(v);
    if (!f || f.skin.toLowerCase() !== sk) bad.push(`#${v.id}: a feição ${f && f.skin} e o 3D ${sk}`);
    else if (!near.paint.includes(sk) || !far.paint.includes(sk)) bad.push(`#${v.id}: a pele ${sk} não pintada pelo deus (perto ${near.paint.includes(sk)}, longe ${far.paint.includes(sk)})`);
    else if (!near.paint.includes(hr)) bad.push(`#${v.id}: o cabelo ${hr} do 3D não pintado pelo deus (pintou ${[...new Set(near.paint)].slice(0, 6).join(' ')})`); }
  ok('d1 a cor', !bad.length && n > 100, `${n} pessoas (${Object.entries(byAge).map(([k, x]) => x + ' ' + k).join(', ')}): a pele e o cabelo do deus são os do 3D${bad.length ? ' — ' + bad.length + ' diferentes: ' + bad.slice(0, 3).join(' · ') : ''}`);
}
if (run('d2')) {
  const ad = people.filter(v => v.age >= 25 && v.age < 50 && v.g === 'm'); let worst = 0, pairs = 0, ex = '';
  for (let k = 0; k + 1 < ad.length && pairs < 60; k += 2) { const a = ad[k], b = ad[k + 1]; const sa = god(a).scales[0], sb = god(b).scales[0]; if (!sa || !sb) continue;
    const r3 = P3.look(a).s / P3.look(b).s, rg = sa[1] / sb[1]; const e = Math.abs(r3 / rg - 1); pairs++; if (e > worst) { worst = e; ex = `#${a.id}/#${b.id}: 3D ${r3.toFixed(3)}, deus ${rg.toFixed(3)}`; } }
  ok('d2 a altura', pairs > 20 && worst < 0.005, `${pairs} pares de homens adultos: a razão das alturas no deus é a do 3D (o maior desvio ${(worst * 100).toFixed(2)}%${ex ? ', ' + ex : ''})`);
}
if (run('d3')) {
  let bad = [], greyN = 0, n = 0;
  for (const v0 of people.filter(v => v.age >= 20 && v.age < 40).slice(0, 80)) for (const a of [30, 55, 80]) { const v = Object.assign({}, v0, { age: a }); const L = P3.look(v), f = Fe.of(v); n++;
    const hr = L.hair.toLowerCase(); if (!god(v).paint.includes(hr)) bad.push(`#${v.id} aos ${a}: o 3D ${hr}`); if (f.greyT > 0) greyN++; if (a < f.cinza && f.greyT > 0) bad.push(`#${v.id} grisalho aos ${a}, o gene diz ${f.cinza.toFixed(0)}`); }
  ok('d3 o grisalho', !bad.length && greyN > 0, `${n} retratos (80 pessoas aos 30, 55 e 80): ${greyN} grisalhos, o deus pinta o cinza do 3D, nunca antes da idade do gene${bad.length ? ' — ' + bad.slice(0, 3).join(' · ') : ''}`);
}
if (run('d4')) {
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const w = () => [hash(G.Save.serialize()), hash(JSON.stringify([...S.villagers.values()].map(v => [v.id, v.x, v.y, v.age, v.genoma]))), JSON.stringify(S.rng)].join('|');
  const a = w(); for (const v of people.slice(0, 1000)) { god(v); god(v, true); } const b = w();
  ok('d4 só desenha', a === b, `${Math.min(1000, people.length)} pessoas pintadas duas vezes pelo deus: o save, as pessoas e o acaso do mundo ${a === b ? 'iguais' : 'MUDARAM'}`);
}
if (run('d5')) {
  const res = []; const v0 = people.find(v => v.age >= 25 && v.age < 50 && !v.lost && v.genoma && !v.inside && !v.aboard), f0 = Fe.of(v0), live = f0.skin.toLowerCase();
  // (the portrait of one dead, as the panel paints it: a copy marked dead, in grey)
  const pv = Object.assign({}, v0, { dead: true, skin: '#c8c0b0', hair: '#9a948a' }); const cp = god(pv);
  res.push(['o retrato do morto em cinza', cp.paint.includes('#c8c0b0') && cp.paint.includes('#9a948a') && !cp.paint.includes(live)]);
  // (a corpse the world leaves: the painter's copy fresh in the 3D's skin and hair; rotting, the painter's colour; burnt, the fire's)
  G.Village.kill(v0, 'war'); const c = G.Carnage.byVid(v0.id);
  if (!c) res.push(['o corpo no chão', false]);
  else { const L = G.Carnage.paintLook(c), L3 = P3.look(c.look); const fresh = god(L);
    res.push(['o corpo fresco na pele e no cabelo do 3D', L.skin.toLowerCase() === L3.skin.toLowerCase() && L.hair.toLowerCase() === L3.hair.toLowerCase() && fresh.paint.includes(L3.skin.toLowerCase())]);
    L.skin = '#8a9a72'; const rot = god(L); res.push(['o corpo apodrecendo na cor do pintor', rot.paint.includes('#8a9a72') && !rot.paint.includes(live)]);
    const keep = [c.pose, c.look.skin]; c.pose = 'burnt'; c.look.skin = '#3a2a24'; const Lb = G.Carnage.paintLook(c); const burnt = god(Lb);
    res.push(['o queimado na cor do fogo', Lb.skin === '#3a2a24' && burnt.paint.includes('#3a2a24') && !burnt.paint.includes(live)]); c.pose = keep[0]; c.look.skin = keep[1]; }
  ok('d5 o morto', res.every(r => r[1]), res.map(([n, b]) => `${n}: ${b ? 'sim' : 'NÃO'}`).join(' · '));
}
const mod = Object.keys(G.modErr || {}); ok('sem erro de módulo', !mod.length, mod.length ? mod.join(', ') : 'limpo');
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
