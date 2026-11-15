// the words of the world: chronicle, story chapters, loglines/titles, legends, lore chapters, biographies (living and dead)
const S = G.S; const texts = [];
const add = (src, t) => { if (typeof t === 'string' && t) texts.push([src, t]); else if (t !== undefined && t !== null && typeof t !== 'string') texts.push([src, '¤NÃO-TEXTO¤ ' + JSON.stringify(t).slice(0, 80)]); };
for (const h of S.history) add('crônica', h.txt);
if (S.saga) for (const st of S.saga.stories) { add('título', st.title); add('logline', st.logline); for (const c of st.chapters) { add('capítulo:' + st.type, c.txt); if (c.h) add('cap-título:' + st.type, c.h); } if (st.end && st.end.txt) add('desfecho:' + st.type, st.end.txt); }
const lo = S.lore; if (lo) { for (const l of lo.legends || []) { add('lenda-título', l.title); for (const t of l.text || []) add('lenda', t); } for (const c of lo.chapters || []) { const t = c.txt || c.text || c.lines || c; if (Array.isArray(t)) t.forEach(x => add('lore-cap', x)); else add('lore-cap', t); } add('lore-mundo', lo.world); for (const m of lo.myth || []) add('mito', m); }
let bios = 0; for (const v of [...S.villagers.values(), ...S.dead.values()]) for (const e of v.bio || []) { bios++; try { add('bio', G.Life.bioLine(v, e)); } catch (er) { texts.push(['bio', '¤ERRO¤ ' + e[1] + ' ' + er.message]); } }
const RX = [
  ['undefined', /undefined/], ['NaN', /\bNaN\b/], ['null', /\bnull\b/], ['[object', /\[object/], ['${', /\$\{/], ['¤', /¤/],
  ['espaço duplo', /\S  +\S/], ['espaço antes de pontuação', / [,.;:!?](?!\.)/], ['pontuação dupla', /[,;:]\s*[,;:.]|\.\.(?!\.)/], ['vírgula+ponto', /,\./],
  ['de o/a', /\bde (o|a|os|as) /i], ['em o/a', /\bem (o|a|os|as) /i], ['por o/a', /\bpor (o|a|os|as) /], ['a a ', /(^|[^\p{L}])a a(?![\p{L}])/u], ['palavra repetida', /(^|[^\p{L}])(\p{L}{3,}) \2(?![\p{L}])/iu],
  ['início minúsculo', /^[a-zà-ú]/], ['sem nome', /\b(de|para|com|por) (,|\.|$)/], ['número estranho', /\d\.\d{3,}/], ['-1', /(^|\s)-1\b/], ['vazio', /^\s*$/],
];
const hits = {}; const ex = {};
for (const [src, t] of texts) for (const [k, rx] of RX) if (rx.test(t)) { const kk = k + ' @ ' + src.split(':')[0]; hits[kk] = (hits[kk] || 0) + 1; if (!ex[kk] || ex[kk].length < 3) (ex[kk] = ex[kk] || []).push(t.slice(0, 220)); }
const bySrc = {}; for (const [src] of texts) { const k = src.split(':')[0]; bySrc[k] = (bySrc[k] || 0) + 1; }
return { n: texts.length, bios, bySrc, hits, ex };
