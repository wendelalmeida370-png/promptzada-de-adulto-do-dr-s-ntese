'use strict';
// ============================================================
//  The wars, as a god reads them: every war with its cause, its aims, the
//  men it called, the dead it cost, the armies in the field (commander,
//  companies, morale, the wagons), the battles and the sieges — and a
//  button to go and see each of them.
// ============================================================
(function (G) {
  const WU = G.WarsUI = {};
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const F = id => G.Fac.get(id) || { name: '?', id };
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const I = k => (G.ICON && G.ICON[k]) || '';
  const flag = id => (G.UI && G.UI.flag ? G.UI.flag(id, 'mini') : '');
  const PHASE = { mobilizar: 'Convocando — a leva se reúne', reunir: 'Formando as companhias', marcha: 'Em marcha', acampado: 'Acampado para a noite', batalha: 'Em batalha', cerco: 'Sitiando a cidade', assalto: 'No assalto', guerrilha: 'Em guerrilha', posicao: 'Em posição', retorno: 'Voltando para casa', retirada: 'Em retirada', dispersado: 'Dispersado' };
  const HOW = { rendicao: 'rendeu-se', assalto: 'tomada de assalto', socorro: 'rompido pelo socorro', levantado: 'levantado', queda: 'caiu' };
  let view = { war: 0, army: 0 };

  function bar(v, cls, txt) { return `<span class="wz-bar"><span class="${cls || ''}" style="width:${G.clamp(v, 0, 100)}%"></span><em>${txt}</em></span>`; }
  function days(w) { const t1 = w.end ? w.t1 || G.S.clock : G.S.clock; return Math.max(0, Math.round((t1 - w.t0) / G.DAY_LEN * 10) / 10); }
  // who is ahead: the battles, the cities, the dead
  function situation(w) {
    if (w.end) return w.treaty ? `${cap1(w.treaty.name)}: ${w.treaty.winner ? 'vitória de ' + F(w.treaty.winner).name : 'ninguém venceu'}` : 'Acabou';
    const sa = w.a.reduce((s, k) => s + G.Wars.score(w, k), 0), sb = w.b.reduce((s, k) => s + G.Wars.score(w, k), 0);
    const d = sa - sb; const A = F(w.a[0]), B = F(w.b[0]);
    const camp = G.Wars.active().length && G.Wars.liveArmies;
    void camp;
    if (Math.abs(d) < 2) return 'Equilíbrio: ninguém leva vantagem ainda';
    const lead = d > 0 ? A : B; return `Vantagem ${G.Wars.ofF(lead)}${Math.abs(d) > 8 ? ' — e larga' : ''}`;
  }
  function sideBlock(w, ids, label) {
    return `<div class="wz-side"><div class="wz-sh">${label}</div>${ids.map(k => {
      const f = F(k); const s = w.side[k] || {}; const g = w.goals[k] || {};
      return `<div class="wz-fac" style="--fc:${G.Fac.hex(k)}"><div class="wz-fn">${flag(k)}<b>${esc(f.name)}</b>${f.alive === false ? ' <em>(caiu)</em>' : ''}</div>
        <div class="wz-goal">${I('crown')}<span>Quer ${esc(g.txt || '—')}${w.goalMet && w.goalMet[k] ? ' <b class="ok">— conseguiu</b>' : ''}</span></div>
        <div class="wz-nums">
          <span title="Convocados ao longo da guerra">${I('pop')}<b>${s.mob || 0}</b> convocados</span>
          <span title="Mortos">${I('grave')}<b>${s.dead || 0}</b> mortos</span>
          <span title="Feridos">${I('heal')}<b>${s.wounded || 0}</b> feridos</span>
          <span title="Capturados pelo inimigo">${I('chain')}<b>${s.captured || 0}</b> cativos</span>
          ${s.deserted ? `<span title="Desertores">${I('split')}<b>${s.deserted}</b> ${s.deserted > 1 ? 'desertores' : 'desertor'}</span>` : ''}
          <span title="Batalhas vencidas / perdidas">${I('sword')}<b>${s.won || 0}</b>–<b>${s.lost || 0}</b> batalhas</span>
          ${s.taken || s.lostSets ? `<span title="Cidades tomadas / perdidas">${I('city')}<b>+${s.taken || 0}</b> / <b>−${s.lostSets || 0}</b> cidades</span>` : ''}
          ${s.raids ? `<span title="Incursões">${I('flame')}<b>${s.raids}</b> incursões</span>` : ''}
        </div>
        <div class="wz-exh">Desgaste ${bar(s.exh || 0, (s.exh || 0) > 65 ? 'red' : (s.exh || 0) > 40 ? 'orange' : '', (s.exh || 0) + '%')}</div>
      </div>`;
    }).join('')}</div>`;
  }
  function compLine(a) { const c = G.Wars.composition(a); const t = G.Wars.compTxt(c); return t || '—'; }
  function armyCard(a, full) {
    const S = G.S; const f = F(a.fac); const gen = G.person(a.gen); const tgt = S.settlements.get(a.target);
    const b = a.band ? G.War.bands.get(a.band) : null; const n = b ? b.members.length : a.members.length;
    const sup = G.Wars.supplyDays(a); const w = G.Wars.get(a.war);
    const lead = gen && !gen.dead ? gen : (b && S.villagers.get(b.members[0])) || null;
    const mission = a.role === 'defesa' ? (a.relief ? `romper o cerco de ${tgt ? tgt.name : '?'}` : `defender ${tgt ? tgt.name : '?'}`) : (w && w.goals[a.fac] ? w.goals[a.fac].txt : `atacar ${tgt ? tgt.name : '?'}`);
    const T0 = G.Army.TITLES[f.civ || 'classico'] || G.Army.TITLES.classico;
    const title = gen ? T0.gen[gen.g === 'f' ? 1 : 0] : '';
    return `<div class="wz-army ${a.done ? 'done' : ''}" style="--fc:${G.Fac.hex(a.fac)}">
      <div class="wz-ah">${flag(a.fac)}<b>${esc(cap1(a.name))}</b><span class="wz-ph">${esc(PHASE[a.phase] || a.phase)}</span>
        ${lead && !a.done ? `<button class="wz-go" data-m="wz-goto" data-x="${lead.x.toFixed(1)}" data-y="${lead.y.toFixed(1)}" data-pid="${lead.id}" title="Ir até o exército">${I('eye')}</button>` : ''}</div>
      <div class="wz-al">${I('crown')}<span>${gen ? `${esc(title)} <a data-m="leader" data-id="${gen.id}">${esc(gen.name)}</a>${gen.dead ? ' †' : ''}` : '—'}</span></div>
      <div class="wz-al">${I('sword')}<span><b>${n}</b>${a.n0 && a.n0 !== n ? ` de ${a.n0}` : ''} soldados · ${esc(compLine(a))}</span></div>
      ${full || !a.done ? `<div class="wz-al">${I('star')}<span>Missão: ${esc(mission)}</span></div>` : ''}
      ${!a.done && a.phase !== 'mobilizar' ? `<div class="wz-meters"><span>Moral ${bar(a.morale, a.morale < 35 ? 'red' : a.morale < 55 ? 'orange' : 'green', Math.round(a.morale) + '')}</span>${a.role !== 'defesa' || a.relief ? `<span>Suprimentos ${bar(Math.min(100, sup / 3 * 100), sup < 0.6 ? 'red' : sup < 1.5 ? 'orange' : 'green', sup >= 0.1 ? sup.toFixed(1) + ' dias' : 'vazio')}</span>` : ''}</div>` : ''}
      ${a.dead || a.deserted || a.battles.length ? `<div class="wz-al muted">${a.dead ? a.dead + ' mortos' : ''}${a.deserted ? (a.dead ? ' · ' : '') + a.deserted + (a.deserted > 1 ? ' desertores' : ' desertor') : ''}${a.battles.length ? ((a.dead || a.deserted) ? ' · ' : '') + a.battles.length + (a.battles.length > 1 ? ' batalhas' : ' batalha') : ''}${a.wagons && (a.role !== 'defesa' || a.relief) ? ' · ' + a.wagons + (a.wagons > 1 ? ' carroças' : ' carroça') : ''}</div>` : ''}
    </div>`;
  }
  function battleRow(bt) {
    const facs = Object.keys(bt.sides).map(Number);
    const dead = facs.reduce((s, k) => s + bt.sides[k].dead, 0), cap = facs.reduce((s, k) => s + bt.sides[k].captured, 0), wd = facs.reduce((s, k) => s + bt.sides[k].wounded, 0);
    const kind = { batalha: 'Batalha', escaramuca: 'Escaramuça', confronto: 'Confronto', refrega: 'Refrega' }[bt.kind] || '';
    return `<div class="wz-bt ${bt.open ? 'live' : ''}"><div class="wz-btn">${I('sword')}<b>${esc(cap1(bt.name))}</b><em>dia ${bt.d}${bt.open ? ' · AGORA' : ''}</em>
        <button class="wz-go" data-m="wz-goto" data-x="${bt.x}" data-y="${bt.y}" title="Ir até o lugar">${I('eye')}</button></div>
      <div class="wz-btf">${facs.map(k => { const s = bt.sides[k]; return `<span style="--fc:${G.Fac.hex(k)}">${flag(k)}${esc(F(k).name)} <b>${s.n}</b>${s.genName ? ` <small>sob ${esc(s.genName)}</small>` : ''}${s.dead || s.captured || s.fled ? ` <small>(${[s.dead ? s.dead + 'm' : '', s.wounded ? s.wounded + 'f' : '', s.captured ? s.captured + 'c' : '', s.fled ? s.fled + ' fugiram' : ''].filter(Boolean).join(' ')})</small>` : ''}</span>`; }).join('<i>×</i>')}</div>
      <div class="wz-al muted">${kind}${bt.open ? '' : ` · ${bt.winner ? 'vitória ' + G.Wars.ofF(F(bt.winner)) : 'sem vencedor'} · ${dead} mortos${wd ? ', ' + wd + ' feridos' : ''}${cap ? ', ' + cap + ' capturados' : ''}${bt.genFell ? ' · tombou ' + esc(bt.genFell.join(', ')) : ''}`}</div></div>`;
  }
  function siegeRow(sg) {
    const set = G.S.settlements.get(sg.set); const L = set && set.larder;
    const d = sg.end ? sg.days || 1 : Math.round((G.S.clock - sg.t0) / G.DAY_LEN * 10) / 10;
    return `<div class="wz-bt ${sg.end ? '' : 'live'}"><div class="wz-btn">${I('ram')}<b>${esc(cap1(sg.name))}</b><em>${sg.end ? `dia ${sg.start}–${sg.end}` : `há ${d} ${d === 1 ? 'dia' : 'dias'}`}</em>
      ${set ? `<button class="wz-go" data-m="wz-goto" data-x="${set.cx}" data-y="${set.cy}" title="Ir até a cidade">${I('eye')}</button>` : ''}</div>
      <div class="wz-al muted">${flag(sg.att)}${esc(F(sg.att).name)} cerca ${esc(set ? set.name : '?')} ${G.Wars.ofF(F(sg.def)).replace(/^d/, 'd')}${sg.end ? ` · ${HOW[sg.how] || sg.how}` : L ? ` · comida dentro dos muros: ${Math.max(0, Math.round(L.food))}${L.food <= 0 ? ' — a fome começou' : ''}` : ''}</div></div>`;
  }
  function warCard(w) {
    const A = w.a.map(F), B = w.b.map(F);
    const live = G.Wars.liveArmies ? w.armies.map(G.Wars.army).filter(a => a && !a.done).length : 0;
    const dead = Object.values(w.side).reduce((s, q) => s + q.dead, 0);
    return `<button class="wz-card ${w.end ? 'over' : ''}" data-m="wz-war" data-id="${w.id}">
      <div class="wz-cn">${I('sword')}<b>${esc(cap1(w.name))}</b><em>${w.end ? `dia ${w.start}–${w.end}` : `há ${days(w)} ${days(w) === 1 ? 'dia' : 'dias'}`}</em></div>
      <div class="wz-cs">${A.map(f => flag(f.id) + esc(f.name)).join(', ')} <i>contra</i> ${B.map(f => flag(f.id) + esc(f.name)).join(', ')}</div>
      <div class="wz-cc muted">${esc(cap1(w.cause.txt))}</div>
      <div class="wz-cc">${esc(situation(w))} · ${dead} mortos · ${w.battles.length} ${w.battles.length === 1 ? 'batalha' : 'batalhas'}${w.sieges.length ? ' · ' + w.sieges.length + (w.sieges.length > 1 ? ' cercos' : ' cerco') : ''}${live ? ` · <b>${live} ${live > 1 ? 'exércitos' : 'exército'} em campo</b>` : ''}</div>
    </button>`;
  }
  function tensionHTML() {
    const T = G.Wars.state().tension; const out = [];
    for (const k in T) { const t = T[k]; if (t.stage < 1) continue; const [a, b] = k.split('-').map(Number); const fa = G.Fac.get(a), fb = G.Fac.get(b); if (!fa || !fb || !fa.alive || !fb.alive || G.Fac.atWar(a, b)) continue; out.push([t.v, `<div class="wz-ten s${t.stage}">${flag(a)}${esc(fa.name)} <i>×</i> ${flag(b)}${esc(fb.name)} <b>${G.Wars.STAGE_TXT[t.stage]}</b>${bar(t.v, t.stage >= 3 ? 'red' : t.stage >= 2 ? 'orange' : '', Math.round(t.v) + '')}</div>`]); }
    return out.sort((p, q) => q[0] - p[0]).map(x => x[1]).join('');
  }
  WU.open = function (warId) {
    if (!G.S || !G.Wars) return;
    view.war = warId || 0; view.army = 0;
    const all = G.Wars.state().wars.slice().reverse();
    if (view.war) return WU.openWar(view.war);
    const act = all.filter(w => !w.end), past = all.filter(w => w.end);
    const ten = tensionHTML();
    G.UI.openModal(`<h2>${I('sword')} Guerras</h2>
      ${act.length ? `<h4 class="wz-h">Em curso</h4><div class="wz-list">${act.map(warCard).join('')}</div>` : `<p class="muted">Nenhuma guerra em curso.</p>`}
      ${ten ? `<h4 class="wz-h">Tensões</h4><div class="wz-tens">${ten}</div>` : ''}
      ${past.length ? `<h4 class="wz-h">Guerras passadas</h4><div class="wz-list">${past.slice(0, 30).map(warCard).join('')}</div>` : ''}
      <div class="mbtns"><button data-m="wz-realms">Reinos</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide wz-modal');
  };
  WU.openWar = function (id) {
    const w = G.Wars.get(id); if (!w) return WU.open();
    view.war = id;
    const armies = w.armies.map(G.Wars.army).filter(Boolean);
    const live = armies.filter(a => !a.done), gone = armies.filter(a => a.done).slice(-6).reverse();
    const bts = w.battles.map(G.Wars.battle).filter(Boolean).slice().reverse();
    const sgs = w.sieges.slice().reverse();
    const occ = [...G.S.settlements.values()].filter(s => s.occ && s.occ.war === w.id);
    G.UI.openModal(`<h2>${I('sword')} ${esc(cap1(w.name))}</h2>
      <div class="wz-top"><div><b>${w.end ? `Do dia ${w.start} ao dia ${w.end}` : `Começou no dia ${w.start} · ${days(w)} ${days(w) === 1 ? 'dia' : 'dias'} de guerra`}</b>${w.surprise ? ' · <em>ataque de surpresa</em>' : ''}</div>
        <div class="wz-cause">${I('scroll')}<span><b>Por quê:</b> ${esc(cap1(w.cause.txt))}.</span></div>
        <div class="wz-sit ${w.end ? 'over' : ''}">${esc(situation(w))}</div>
        ${w.treaty && w.treaty.terms.length ? `<div class="wz-treaty">${I('dove')}<span>${esc(cap1(w.treaty.terms.join('; ')))}.</span></div>` : ''}
        ${(w.peaces || []).map(p => `<div class="wz-treaty muted">${I('dove')}<span>${esc(F(p.a).name)} e ${esc(F(p.b).name)} fizeram ${esc(p.name)} no dia ${p.d}.</span></div>`).join('')}
      </div>
      <div class="wz-sides">${sideBlock(w, w.a, 'Atacantes')}${sideBlock(w, w.b, 'Defensores')}</div>
      ${live.length ? `<h4 class="wz-h">Exércitos em campo</h4><div class="wz-armies">${live.map(a => armyCard(a, true)).join('')}</div>` : ''}
      ${occ.length ? `<h4 class="wz-h">Cidades ocupadas</h4><div class="wz-occ">${occ.map(s => `<span>${flag(s.occ.by)}${esc(s.name)} <small>ocupada desde o dia ${s.occ.day} · lealdade ${Math.round(s.loyalty || 0)}%${s.occ.garrison ? ' · ' + s.occ.garrison + ' de guarnição' : ''}</small> <button class="wz-go" data-m="wz-goto" data-x="${s.cx}" data-y="${s.cy}">${I('eye')}</button></span>`).join('')}</div>` : ''}
      ${sgs.length ? `<h4 class="wz-h">Cercos</h4>${sgs.map(siegeRow).join('')}` : ''}
      ${bts.length ? `<h4 class="wz-h">Batalhas</h4>${bts.filter(b => b.kind !== 'refrega').slice(0, 20).map(battleRow).join('')}` : ''}
      ${gone.length ? `<h4 class="wz-h">Exércitos que já voltaram</h4><div class="wz-armies">${gone.map(a => armyCard(a, false)).join('')}</div>` : ''}
      <h4 class="wz-h">Crônica da guerra</h4><div class="wz-events">${w.events.slice().reverse().slice(0, 40).map(e => `<div><em>dia ${e.d}</em> ${esc(e.txt)}${e.x !== undefined ? ` <button class="wz-go sm" data-m="wz-goto" data-x="${e.x}" data-y="${e.y}">${I('eye')}</button>` : ''}</div>`).join('')}</div>
      <div class="mbtns"><button data-m="wz-open">Todas as guerras</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide wz-modal');
  };
  WU.openArmy = function (armyId) {
    const a = G.Wars.army(armyId); if (!a) return;
    WU.openWar(a.war);
  };
  WU.click = function (m, b) {
    if (m === 'wz-open') WU.open();
    else if (m === 'wz-war') WU.openWar(+b.dataset.id);
    else if (m === 'wz-realms') G.UI.openRealms();
    else if (m === 'wz-goto') {
      G.UI.closeModal(); G.Render.cam.follow = 0;
      const p = b.dataset.pid && G.S.villagers.get(+b.dataset.pid);
      if (p) { G.UI.select(p); G.Render.panTo(p.x, p.y); } else G.Render.panTo(+b.dataset.x, +b.dataset.y);
      G.Render.cam.tz = Math.max(G.Render.cam.tz, 1.3);
    }
  };
  // the line in a soldier's (or veteran's) panel
  WU.personLine = function (v) {
    if (!G.Wars || v.dead) return v.vet ? `<div class="doing">${I('sword')} Veteran${v.g === 'f' ? 'a' : 'o'} de ${v.vet} ${v.vet > 1 ? 'batalhas' : 'batalha'}.</div>` : '';
    const a = G.Wars.armyOf(v);
    let html = '';
    if (a) {
      const b = a.band ? G.War.bands.get(a.band) : null; const n = b ? b.members.length : a.members.length;
      const gen = G.person(a.gen); const sup = G.Wars.supplyDays(a);
      html += `<div class="doing wz-pl">${I('sword')} <b>${esc(cap1(a.name))}</b> · ${n} soldados${gen && gen.id !== v.id ? ` · sob <a data-pid="${gen.id}">${esc(gen.name)}</a>` : gen ? ' · <b>no comando</b>' : ''}${a.phase !== 'mobilizar' ? ` · moral ${Math.round(a.morale)}${a.role !== 'defesa' || a.relief ? ` · comida para ${sup.toFixed(1)} dias` : ''}` : ''} <button class="wz-go sm" data-act="wz-army" data-id="${a.id}" title="Ver a guerra">${I('scroll')}</button></div>`;
    }
    if (v.wound && G.S.day - v.wound.d < 3) html += `<div class="doing">${I('heal')} Ferid${v.g === 'f' ? 'a' : 'o'} ${v.wound.sev === 'grave' ? 'gravemente' : 'de leve'} ${(G.Wars.battle(v.wound.bt) || {}).name ? 'n' + G.Wars.battle(v.wound.bt).name.replace(/^(a|o) /, (m, x) => x + ' ') : 'em combate'}.</div>`;
    if (v.vet && !a) html += `<div class="doing">${I('sword')} Veteran${v.g === 'f' ? 'a' : 'o'} de ${v.vet} ${v.vet > 1 ? 'batalhas' : 'batalha'}.</div>`;
    if (v.task && v.task.type === 'refugio') { const to = G.S.settlements.get(v.task.to); html += `<div class="doing">${I('migrate')} Refugiad${v.g === 'f' ? 'a' : 'o'} da guerra${to ? ' em ' + esc(to.name) : ''}.</div>`; }
    return html;
  };
})(window.G);
