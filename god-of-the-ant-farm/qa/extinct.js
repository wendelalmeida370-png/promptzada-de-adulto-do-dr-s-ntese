// the end of the world: everyone dies; the empty world must still run, draw, open its panels, skip time, save and load
const S = () => G.S; const out = { steps: [] }; const wait = ms => new Promise(r => setTimeout(r, ms));
const step = async (name, fn) => { let err = null; try { await fn(); } catch (e) { err = e.message + ' | ' + (e.stack || '').split('\n')[1]; } const mods = Object.assign({}, G.modErr); for (const k in G.modErr) delete G.modErr[k]; out.steps.push({ name, err, mods: Object.keys(mods).length ? mods : undefined }); };
const dead0 = S().dead.size;
await step('todos morrem', () => { for (const v of [...S().villagers.values()]) G.Village.kill(v, 'god', true); });
out.left = S().villagers.size;
await step('um ano vazio', () => QA.run(1));
await step('verificador', () => { out.viol = QA.check().filter(q => q.sev <= 2).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`).slice(0, 10); });
await step('painéis', async () => {
  const tries = [() => G.UI.openRealms(), () => G.WarsUI.open(), () => G.SeaUI.open('exps'), () => G.SeaUI.open('know'), () => G.Stories.open(), () => G.UI.openStats(), () => G.Lore.openBook('cronicas'), () => G.Lore.openBook('povos'), () => G.Lore.openBook('lendas')];
  const d = [...S().dead.values()].slice(-2); for (const v of d) { tries.push(() => G.UI.openBio(v.id)); tries.push(() => G.UI.openTree(v.id)); }
  const bad = /undefined|\bNaN\b|\[object |\$\{|Infinity/; out.panelText = [];
  for (const f of tries) { f(); await wait(30); const m = document.querySelector('#modal'); const t = m ? m.innerText : ''; for (const l of t.split('\n')) if (bad.test(l)) out.panelText.push(l.slice(0, 140)); G.UI.closeModal(); }
  for (const b of [...S().buildings.values()].slice(0, 4)) { G.UI.select(b); G.UI.update(0.5, true); } G.UI.select(null);
});
await step('quadros: superfície, subterrâneo, cinema, foto', async () => {
  for (let k = 0; k < 20; k++) G.Render.frame(0.016);
  if (S().ug) { G.Render.setUnder(1); for (let k = 0; k < 10; k++) G.Render.frame(0.016); G.Render.setUnder(0); }
  G.Cinema.start(); for (let k = 0; k < 30; k++) { G.Cinema.update && G.Cinema.update(0.1); G.Render.frame(0.016); } G.Cinema.stop();
  G.Photo.start(); for (let k = 0; k < 5; k++) G.Render.frame(0.016); G.Photo.stop();
  G.Minimap.update(1); G.UI.update(0.5, true);
});
await step('avançar no tempo', async () => { G.Skip.start('anos25', 'livre'); let t = 0; while (G.Skip.on && t < 120) { await wait(500); t++; } out.skip = { on: !!G.Skip.on, day: S().day }; if (G.Skip.on && G.Skip.stop) G.Skip.stop(); });
await step('save/load', () => { const t = QA.roundTrip(); out.trip = t.diff && t.diff.length ? t.diff.slice(0, 3) : 'igual'; });
await step('continuar pelo menu', () => { G.Save.save(true); G.Main.toMenu(); G.Main.continueGame(); out.cont = { mode: G.Main.mode, pop: S().villagers.size, day: S().day }; G.UI.setSpeed(0); });
await step('mais um ano', () => QA.run(1));
await step('mundo novo depois', () => { G.Main.newGame({ type: 'ilha', size: 64, tribes: 2 }); G.UI.setSpeed(0); G.Main.mode = 'game'; QA.run(1); out.after = { pop: S().villagers.size, viol: QA.check().filter(q => q.sev <= 2).length }; });
out.deadMore = S().dead.size - dead0;
return out;
