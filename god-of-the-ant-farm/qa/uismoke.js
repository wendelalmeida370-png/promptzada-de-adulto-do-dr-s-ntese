// open every panel of the game in a lived world; look for broken text in what the player sees
const S = G.S; const out = []; const bad = /undefined|\bNaN\b|\[object |\bnull\b|\$\{|Infinity/;
const shown = el => { if (!el) return false; const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.classList.contains('hidden') && (el.offsetWidth || el.offsetHeight); };
const vis = () => { const parts = []; for (const el of document.querySelectorAll('#modal, #inspector, #chronicle, #saga, #saga-track, #dev, .modal')) if (shown(el)) parts.push(el.innerText || ''); return parts.join('\n'); };
const check = (name, fn) => {
  let err = null; try { fn(); } catch (e) { err = e.message + ' ' + (e.stack || '').split('\n')[1]; }
  const t = vis(); const lines = t.split('\n').filter(l => bad.test(l));
  out.push({ name, err, chars: t.length, bad: lines.slice(0, 4).map(l => l.slice(0, 160)) });
};
const checkA = async (name, fn) => { let err = null; try { fn(); } catch (e) { err = e.message; } await new Promise(r => setTimeout(r, 250)); const ins = document.querySelector('#inspector'); const t = (ins ? ins.textContent : '') + '\n' + vis(); out.push({ name, err, chars: t.length, bad: t.split('\n').filter(l => bad.test(l)).slice(0, 4).map(l => l.slice(0, 160)) }); };
const close = () => { try { G.UI.closeModal(); } catch (e) { } };
check('reinos', () => G.UI.openRealms()); close();
for (const f of G.Fac.all().slice(0, 4)) { check('reino ' + f.name, () => { G.UI.openRealms(); const b = document.querySelector(`[data-m="realm"][data-id="${f.id}"]`) || document.querySelector('[data-m="realm"]'); if (b) b.click(); }); close(); }
check('guerras', () => G.WarsUI.open()); close();
for (const w of (S.wz ? S.wz.wars : []).slice(-4)) { check('guerra ' + w.name, () => G.WarsUI.openWar(w.id)); close(); }
for (const a of (S.wz ? S.wz.armies : []).slice(-4)) { check('exército ' + a.name, () => G.WarsUI.openArmy(a.id)); close(); }
for (const t of ['exps', 'fleets', 'know']) { check('mar ' + t, () => G.SeaUI.open(t)); close(); }
for (const e of (S.exps || []).slice(-4)) { check('expedição ' + e.name, () => G.SeaUI.openExp(e.id)); close(); }
for (const t of ['genese', 'cronicas', 'lendas', 'povos', 'geografia', 'cavernas', 'bestiario', 'profecias']) { check('livro ' + t, () => G.Lore.openBook(t)); close(); }
check('histórias', () => G.Stories.open()); close();
for (const s of (S.saga ? S.saga.stories : []).slice(-8)) { check('história ' + s.type + ' ' + s.title, () => G.Stories.openStory(s.id)); close(); }
const people = [...S.villagers.values()]; const sample = [people[0], people[Math.floor(people.length / 2)], people[people.length - 1], ...[...S.dead.values()].slice(-3)].filter(Boolean);
for (const v of sample) { check('bio ' + v.name, () => G.UI.openBio(v.id)); close(); check('árvore ' + v.name, () => G.UI.openTree(v.id)); close(); }
for (const v of people.slice(0, 3)) { await checkA('painel pessoa ' + v.name, () => { G.UI.select(v); G.UI.refresh && G.UI.refresh(); G.UI.update(0.5, true); }); }
for (const b of [...S.buildings.values()].filter((b, i, a) => i % Math.max(1, Math.floor(a.length / 6)) === 0).slice(0, 6)) await checkA('painel prédio ' + b.type, () => { G.UI.select(b); G.UI.update(0.5, true); });
for (const a of [...S.animals.values()].slice(0, 3)) await checkA('painel bicho ' + a.kind, () => { G.UI.select(a); G.UI.update(0.5, true); });
for (const sh of S.ships.slice(0, 3)) await checkA('painel navio ' + sh.kind, () => { G.UI.select(sh); G.UI.update(0.5, true); });
G.UI.select(null);
await checkA('painel aberto num estado de guerra', () => { const w = (S.wz ? S.wz.armies : []).find(a => !a.done); const v = w && w.members.map(id => S.villagers.get(id)).find(Boolean); if (v) G.UI.select(v); });
G.UI.select(null);
check('estatísticas', () => G.UI.openStats()); close();
check('ajuda', () => G.UI.openHelp()); close();
check('pausa', () => G.UI.openPause()); close();
check('som', () => G.UI.openSound()); close();
check('avançar no tempo', () => G.Skip.open()); close();
check('modo dev', () => G.Dev.toggle(true)); for (const t of ['tempo', 'povos', 'guerra', 'mar', 'historias', 'raros', 'params', 'inspecao']) check('dev ' + t, () => { G.Dev.tab = t; G.Dev.show(true); }); try { G.Dev.toggle(false); } catch (e) { }
return { n: out.length, problems: out.filter(o => o.err || o.bad.length), empty: out.filter(o => !o.chars).map(o => o.name) };
