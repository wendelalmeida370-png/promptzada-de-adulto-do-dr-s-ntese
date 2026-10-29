'use strict';
// ============================================================
//  The sea, as a god reads it (key O):
//    Expedições   who went, why, with what, where they are, what they found;
//                 the book of each voyage, chapter by chapter, and its track
//    Frotas       the fleets at war: admiral, ships (hull, sail, mast, fire),
//                 crews and soldiers aboard, morale, mission, the battles
//    Conhecimento the world as ONE people knows it — the islands they have
//                 seen, walked, mapped; the tales they believe; the sea their
//                 ships crossed; what they fear (a taboo), what they love
// ============================================================
(function (G) {
  const SU = G.SeaUI = {};
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const F = id => G.Fac.get(id) || { name: '?', id };
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const I = k => (G.ICON && G.ICON[k]) || '';
  const flag = id => (G.UI && G.UI.flag ? G.UI.flag(id, 'mini') : '');
  const P = id => G.person(id);
  const ship = id => G.S.ships.find(o => o.id === id) || null;
  const K = () => G.Know, X = () => G.Expe, Fl = () => G.Fleets;
  const COMPASS = '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4l2.6 8L12 20l-2.6-8z" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="#fff"/></svg>';
  if (G.ICON && !G.ICON.compass) G.ICON.compass = COMPASS;
  let view = { tab: 'exp', fac: 0, exp: 0 };

  function bar(v, cls, txt) { return `<span class="wz-bar"><span class="${cls || ''}" style="width:${G.clamp(v, 0, 100)}%"></span><em>${txt}</em></span>`; }
  const ST = { prep: 'Preparando no cais', reunir: 'Reunindo a tripulação', embarque: 'Embarcando', partida: 'Zarpando', viagem: 'No mar', aproximacao: 'Aproximando-se de uma costa', desembarque: 'Desembarcando', exploracao: 'Explorando em terra', contato: 'Frente a frente com outro povo', reembarque: 'Voltando aos navios', volta: 'Voltando para casa', chegada: 'Chegando em casa', fundacao: 'Fundando a colônia' };
  const STATUS = { voltou: 'Voltou', perdida: 'Perdida — ninguém sabe', naufragada: 'Naufragou', cancelada: 'Cancelada', colonia: 'Fundou uma colônia', ativa: '' };
  const SCALE = { so: 'Sozinho no mar', media: 'Expedição de patrono', grande: 'Expedição do Estado' };
  const SPONSOR = { proprio: 'por conta própria', mercador: 'patrocínio de mercador', mestre: 'patrocínio do mestre pescador', patrono: 'patrocínio particular', governante: 'patrocínio do governante' };
  const WHY = { ferro: 'procurar ferro', ouro: 'procurar ouro', terra: 'achar terra para viver', pesqueiro: 'achar pesqueiros', povo: 'achar um povo de que se fala', monstro: 'ver o monstro de que se fala', curiosidade: 'ver o que há além do horizonte', rival: 'não ficar atrás dos vizinhos', gloria: 'glória para quem governa', busca: 'procurar quem se perdeu', expansao: 'ocupar boa terra', porto: 'ter um porto perto do inimigo' };
  const DISC = { r: 'map', o: 'star', sp: 'paw', f: 'eye', w: 'wave' };

  // ------------------------------ expeditions ------------------------------
  function expCard(e) {
    const S = G.S; const lead = P(e.leader); const sp = P(e.sponsor); const live = X().live(e);
    const crew = live ? X().alive(e) : []; const flagS = ship(e.flag);
    const ab = crew.length || 1;
    const days = e.prov / (ab * 2);
    const homeD = flagS ? G.dist(flagS.x, flagS.y, e.moor[0], e.moor[1]) : 0;
    const at = flagS && live ? [flagS.x, flagS.y] : e.landAt && live ? e.landAt : null;
    const disc = (e.disc || []).slice(-6);
    const roles = []; if (e.roles.cart && P(e.roles.cart)) roles.push('cartógrafo'); if (e.roles.nat && P(e.roles.nat)) roles.push('naturalista'); if ((e.roles.sold || []).length) roles.push(`${e.roles.sold.filter(id => G.S.villagers.has(id)).length} soldados`); if ((e.roles.col || []).length) roles.push(`${e.roles.col.length} colonos`);
    const shipsL = e.ships.map(ship).filter(Boolean).map(s => `${esc(G.Naval.title(s))}${s.st === 'build' ? ` <small>(no estaleiro, ${Math.round((s.prog || 0) * 100)}%)</small>` : ''}`);
    return `<div class="wz-army sea-card ${live ? '' : 'done'}" style="--fc:${G.Fac.hex(e.fac)}">
      <div class="wz-ah">${flag(e.fac)}<b>${esc(e.name)}</b><span class="wz-ph">${esc(live ? ST[e.st] || e.st : STATUS[e.status] || e.status)}</span>
        <button class="wz-go" data-m="sea-exp" data-id="${e.id}" title="O livro da viagem">${I('book')}</button>
        ${at ? `<button class="wz-go" data-m="sea-goto" data-x="${at[0].toFixed(1)}" data-y="${at[1].toFixed(1)}" title="Ir até">${I('eye')}</button>` : ''}</div>
      <div class="wz-al">${I('crown')}<span>${lead ? `Líder: <a data-m="person" data-id="${lead.id}">${esc(lead.name)}</a>${lead.dead ? ' †' : ''}` : `Líder: ${esc(e.leaderName)}`}${sp && sp.id !== e.leader ? ` · patrono: <a data-m="person" data-id="${sp.id}">${esc(sp.name)}</a>` : ` · ${esc(SPONSOR[e.sponsorKind] || '')}`}</span></div>
      <div class="wz-al">${I('compass')}<span>${esc(SCALE[e.scale] || '')}${e.kind === 'colonia' ? ' — colonização' : ''} · para ${esc(WHY[e.obj.why] || e.obj.why || 'explorar')}, rumo ao ${esc(e.dirw || 'mar')}${e.obj.txt ? ` <small>(“${esc(e.obj.txt.slice(0, 90))}”)</small>` : ''}</span></div>
      <div class="wz-al">${I('ship')}<span>${shipsL.join(', ') || '—'} · ${live ? crew.length : e.crew.length} ${(live ? crew.length : e.crew.length) === 1 ? 'pessoa' : 'pessoas'}${roles.length ? ' (' + roles.join(', ') + ')' : ''}${e.lost.length ? ` · <b>${e.lost.length}</b> ${e.lost.length > 1 ? 'mortos' : 'morto'}` : ''}</span></div>
      ${live && e.st !== 'prep' ? `<div class="wz-meters"><span>Provisões ${bar(Math.min(100, days / Math.max(0.3, e.dur || 1) * 50), days < (e.dur || 1) * 0.4 ? 'red' : days < (e.dur || 1) * 0.8 ? 'orange' : 'green', days >= 0.1 ? days.toFixed(1) + ' dias' : 'acabando')}</span><span>Moral ${bar(e.morale, e.morale < 35 ? 'red' : e.morale < 55 ? 'orange' : 'green', Math.round(e.morale) + '')}</span>${homeD ? `<span>Longe de casa ${bar(Math.min(100, homeD), '', Math.round(homeD) + ' léguas')}</span>` : ''}</div>` : ''}
      ${live && e.st === 'prep' ? `<div class="wz-meters"><span>Provisões no cais ${bar(e.prov / Math.max(1, e.provT) * 100, '', Math.round(e.prov) + ' / ' + e.provT)}</span></div>` : ''}
      ${disc.length ? `<div class="wz-al">${I('star')}<span>${disc.map(d => `${I(DISC[d.k] || 'star')} ${esc(cap1(d.txt))}`).join(' · ')}</span></div>` : ''}
      ${live ? `<div class="sea-btns">${flagS ? `<button data-m="sea-follow" data-id="${flagS.id}">${I('eye')} Seguir</button>` : ''}${lead && !lead.dead ? `<button data-m="person" data-id="${lead.id}">Ver líder</button>` : ''}</div>` : ''}
    </div>`;
  }
  function tabExp() {
    const all = (G.S.exps || []).slice().reverse();
    const live = all.filter(e => X().live(e)), past = all.filter(e => !X().live(e) && e.status !== 'cancelada');
    return `${live.length ? `<h4 class="wz-h">No mar agora</h4><div class="wz-armies">${live.map(expCard).join('')}</div>` : `<p class="muted">Nenhuma expedição em curso. Os povos só se lançam ao mar quando alguma coisa os empurra: falta de ferro, gente demais, um boato, um governante ambicioso — ou alguém que não aguenta mais olhar o horizonte.</p>`}
      ${past.length ? `<h4 class="wz-h">Viagens passadas</h4><div class="wz-armies">${past.slice(0, 24).map(expCard).join('')}</div>` : ''}
      ${castaways()}`;
  }
  function castaways() {
    const L = (G.S.castaways || []).filter(c => !c.done && c.ids.some(id => G.S.villagers.has(id)));
    if (!L.length) return '';
    return `<h4 class="wz-h">Náufragos</h4><div class="wz-events">${L.map(c => `<div>${flag(c.fac)} ${c.ids.map(P).filter(Boolean).map(v => `<a data-m="person" data-id="${v.id}">${esc(v.name)}</a>`).join(', ')} — náufragos ${esc(G.Expe.ofN(c.title || 'de um barco'))}, há ${Math.max(1, Math.round(G.S.day - c.d))} ${G.S.day - c.d >= 2 ? 'anos' : 'ano'}${c.raft > 0 ? ` · jangada ${Math.round(c.raft * 100)}%` : ''} <button class="wz-go sm" data-m="sea-goto" data-x="${c.x}" data-y="${c.y}">${I('eye')}</button></div>`).join('')}</div>`;
  }
  // why this people is not at sea right now (read from the same rules the people follows)
  function seaNow(f, p) {
    const w = X().why ? X().why(f) : null; if (!w) return '';
    const S = G.S; const sv = p.saveWood && p.saveWood.until > S.day ? p.saveWood : null;
    const txt = sv ? `Decidiram uma viagem: juntando madeira para o casco (${Math.round(f.stock.wood)} de ${sv.need}).`
      : w.gate === 'sem navegação' ? 'Ainda não sabem navegar.'
      : w.gate === 'sem porto' ? 'Ainda não têm porto.'
      : w.gate === 'porto sem saída para o mar aberto' ? 'O porto dá numa água fechada: nenhuma viagem longa sai dali.'
      : w.gate === 'gente de menos' ? 'Gente de menos para tirar alguém do trabalho e mandar ao mar.'
      : w.gate === 'já há uma viagem no mar' ? 'Já há uma viagem no mar: esperam notícias antes de mandar outra.'
      : w.gate === 'nenhum motivo' ? 'Nada os chama para longe agora: pescam e vivem.'
      : w.gate === 'descansando da última' ? 'A última viagem voltou há pouco.'
      : w.p ? `Pensam em ir (${w.p > 0.35 ? 'logo' : w.p > 0.15 ? 'quando a coragem vier' : 'algum dia, talvez'}).` : '';
    return txt ? `<div class="wz-al muted">${I('ship')}<span>${esc(txt)}</span></div>` : '';
  }
  // the book of one voyage: every chapter, and the track over the sea
  SU.openExp = function (id) {
    const e = X().get(id); if (!e) return SU.open('exp');
    view.exp = id;
    G.UI.openModal(`<h2>${I('ship')} ${esc(e.name)}</h2>
      ${expCard(e)}
      <canvas class="sea-track" id="sea-track" width="560" height="240"></canvas>
      <h4 class="wz-h">O livro da viagem</h4><div class="sea-book">${e.log.map((c, k) => `<div class="sea-ch"><em>${k + 1}. ${esc(c.h)} <small>· dia ${c.d}</small></em><p>${esc(c.txt)}</p></div>`).join('')}</div>
      <div class="mbtns"><button data-m="sea-open">O mar</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide wz-modal sea-modal');
    requestAnimationFrame(() => drawMap(document.getElementById('sea-track'), e.fac, { exp: e }));
  };

  // ------------------------------ fleets ------------------------------
  function shipRow(s) {
    const ab = G.Naval.aboardOf(s); const sol = ab.filter(v => v.role === 'guerreiro' || (v.task && v.task.army)).length; const cap = ab.filter(v => v.captive).length;
    const dmg = []; if (s.mast === 0) dmg.push('mastro partido'); if ((s.sail === undefined ? 100 : s.sail) < 60) dmg.push('vela rasgada'); if (s.burn > 0) dmg.push('em chamas!'); if ((s.flood || 0) > 20) dmg.push('fazendo água');
    return `<div class="sea-ship"><span>${I(s.kind === 'transporte' ? 'boat' : 'ship')} <b>${esc(cap1(G.Naval.title(s)))}</b></span>
      <span>${bar(s.hp / s.maxHp * 100, s.hp < s.maxHp * 0.35 ? 'red' : s.hp < s.maxHp * 0.6 ? 'orange' : 'green', 'casco ' + Math.round(s.hp / s.maxHp * 100) + '%')}</span>
      <small>${ab.length} a bordo${sol ? ` · ${sol} soldados` : ''}${cap ? ` · ${cap} prisioneiros` : ''}${dmg.length ? ' · ' + dmg.join(', ') : ''}${s.grapple ? ' · abordando!' : ''}</small></div>`;
  }
  function fleetCard(fl) {
    const S = G.S; const cmd = P(fl.cmd); const ships = fl.ships.map(ship).filter(Boolean);
    const a = fl.army && G.Wars.army(fl.army); const w = G.Wars.get(fl.war);
    const crew = ships.reduce((n, s) => n + G.Naval.aboardOf(s).length, 0);
    const c = ships[0];
    const stTxt = { reunir: 'Tripulando os navios', partir: 'Pronta para zarpar', embarque: 'Embarcando o exército', travessia: 'Atravessando o mar', desembarque: 'Desembarcando na praia inimiga', espera: 'Ao largo da praia, de guarda', reembarque: 'Recolhendo os soldados', navegar: 'Navegando', posto: fl.mission === 'bloqueio' ? 'No bloqueio' : 'Em posição', combate: 'EM BATALHA', retirada: 'Em retirada', casa: 'Voltando ao porto', fim: 'Dispersada' }[fl.st] || fl.st;
    return `<div class="wz-army ${Fl().live(fl) ? '' : 'done'}" style="--fc:${G.Fac.hex(fl.fac)}">
      <div class="wz-ah">${flag(fl.fac)}<b>${esc(cap1(fl.name))}</b><span class="wz-ph">${esc(stTxt)}</span>${c ? `<button class="wz-go" data-m="sea-goto" data-x="${c.x.toFixed(1)}" data-y="${c.y.toFixed(1)}" title="Ir até a frota">${I('eye')}</button>` : ''}</div>
      <div class="wz-al">${I('crown')}<span>${cmd ? `${esc(cap1(Fl().admTitle(fl, cmd)))} <a data-m="person" data-id="${cmd.id}">${esc(cmd.name)}</a>${cmd.dead ? ' †' : ''}` : 'Sem comandante'}</span></div>
      <div class="wz-al">${I('star')}<span>Missão: ${esc(Fl().MISSION[fl.mission] || fl.mission)} · formação: ${esc(Fl().FORM[fl.form] || fl.form)}${a ? ` · leva <a data-m="wz-war" data-id="${fl.war}">${esc(a.name)}</a>` : ''}${w ? ` · ${esc(w.name)}` : ''}</span></div>
      <div class="wz-meters"><span>Moral ${bar(fl.morale, fl.morale < 30 ? 'red' : fl.morale < 55 ? 'orange' : 'green', Math.round(fl.morale) + '')}</span><span>${ships.length} navios · ${crew} a bordo</span>${fl.sunk || fl.taken ? `<span>${fl.sunk ? fl.sunk + ' perdidos' : ''}${fl.taken ? (fl.sunk ? ' · ' : '') + fl.taken + ' tomados' : ''}</span>` : ''}</div>
      <div class="sea-ships">${ships.map(shipRow).join('')}</div>
      ${c && Fl().live(fl) ? `<div class="sea-btns"><button data-m="sea-follow" data-id="${c.id}">${I('eye')} Seguir a capitânia</button>${w ? `<button data-m="wz-war" data-id="${w.id}">Ver a guerra</button>` : ''}</div>` : ''}
    </div>`;
  }
  function tabFleets() {
    const all = (G.S.fleets || []).slice().reverse(); const live = all.filter(f => Fl().live(f)), past = all.filter(f => !Fl().live(f)).slice(0, 8);
    const bts = (G.Wars.state().battles || []).filter(b => b.naval && b.started).slice().reverse().slice(0, 12);
    return `${live.length ? `<h4 class="wz-h">Frotas no mar</h4><div class="wz-armies">${live.map(fleetCard).join('')}</div>` : `<p class="muted">Nenhuma frota de guerra no mar. Em tempo de paz, os navios de guerra ficam ancorados, sem tripulação.</p>`}
      ${bts.length ? `<h4 class="wz-h">Batalhas no mar</h4><div class="wz-events">${bts.map(b => { const fs = Object.keys(b.sides).map(Number); return `<div><b>${esc(cap1(b.name))}</b> <em>dia ${b.d}${b.open ? ' · AGORA' : ''}</em> — ${fs.map(k => { const s = b.sides[k]; return `${flag(k)}${esc(F(k).name)} ${s.ships} navios${s.sunk ? `, ${s.sunk} afundados` : ''}${s.taken ? `, ${s.taken} tomados` : ''}`; }).join(' × ')}${b.open ? '' : ` · ${b.winner ? 'o mar ficou com ' + esc(F(b.winner).name) : 'sem vencedor'} · ${fs.reduce((n, k) => n + b.sides[k].dead, 0)} mortos`} <button class="wz-go sm" data-m="sea-goto" data-x="${b.x}" data-y="${b.y}">${I('eye')}</button></div>`; }).join('')}</div>` : ''}
      ${past.length ? `<h4 class="wz-h">Frotas que voltaram</h4><div class="wz-armies">${past.map(fleetCard).join('')}</div>` : ''}`;
  }

  // ------------------------------ what one people knows ------------------------------
  function tabKnow() {
    const fs = G.Fac.all(); if (!fs.length) return '';
    if (!view.fac || !G.Fac.get(view.fac)) view.fac = (G.UI.viewFac && G.Fac.get(G.UI.viewFac) ? G.UI.viewFac : fs[0].id);
    const f = G.Fac.get(view.fac); const c = K().counts(f.id); const p = X().prof(f);
    const rs = K().regions().filter(K().big);
    const rows = rs.map(r => ({ r, s: K().state(f.id, r) })).filter(q => q.s > 0).sort((a, b) => b.s - a.s);
    const rum = K().rumorsOf(f.id).slice(0, 10);
    const ores = (G.S.ores || []).filter(o => K().knowsOre(f.id, o.id));
    const taboo = p.taboo && p.taboo.until > G.S.day ? p.taboo : null;
    const pr = X().pressure(f); const prTxt = Object.keys(pr).filter(k => pr[k] > 0.15).map(k => ({ ferro: 'falta ferro', ouro: 'quer ouro', terra: 'a terra ficou pequena', comida: 'fome', madeira: 'falta madeira', pesca: 'pesqueiros esgotados', rival: 'os vizinhos navegam', gloria: 'governante ambicioso' })[k]).filter(Boolean);
    return `<div class="sea-facs">${fs.map(o => `<button class="${o.id === f.id ? 'on' : ''}" data-m="sea-fac" data-id="${o.id}">${flag(o.id)}${esc(o.name)}</button>`).join('')}</div>
      <div class="sea-know">
        <canvas class="sea-kmap" id="sea-kmap" width="560" height="300"></canvas>
        <div class="sea-kside">
          <div class="wz-nums"><span>${I('map')}<b>${c.conhecidas}</b> terras conhecidas</span><span>${I('scroll')}<b>${c.boatos}</b> só de boato</span><span>${I('eye')}<b>${c.desconhecidas}</b> que nunca viram</span><span>${I('wave')}<b>${c.mar}</b> trechos de mar navegados</span></div>
          <h4 class="wz-h">Um povo e o mar</h4>
          <div class="sea-prof">
            <span>Afinidade com o mar ${bar(p.aff * 100, '', Math.round(p.aff * 100) + '')}</span>
            <span>Curiosidade ${bar(p.cur * 100, '', Math.round(p.cur * 100) + '')}</span>
            <span>Expansionismo ${bar(p.exp * 100, '', Math.round(p.exp * 100) + '')}</span>
            <span>Coragem para o risco ${bar(p.risk * 100, '', Math.round(p.risk * 100) + '')}</span>
          </div>
          <div class="wz-al muted">${p.n || 0} expedições · ${p.won || 0} com descobertas · ${p.lost || 0} perdidas${p.saved ? ' · já foi salvo pelo mar numa fome' : ''}${p.era ? ` · <b>${p.era === 'expansao' ? 'era de navegações' : 'de costas para o mar'}</b>` : ''}</div>
          ${taboo ? `<div class="wz-treaty">${I('skull')}<span>Tabu: ninguém navega para o <b>${esc(taboo.dir)}</b> (${taboo.n} expedições não voltaram de lá).</span></div>` : ''}
          ${prTxt.length ? `<div class="wz-al">${I('star')}<span>O que empurra para o mar: ${esc(prTxt.join(', '))}.</span></div>` : ''}
          ${seaNow(f, p)}
        </div>
      </div>
      ${rows.length ? `<h4 class="wz-h">Terras que ${esc(f.name)} conhece</h4><div class="wz-events">${rows.map(q => `<div><b>${esc(cap1(K().name(q.r)))}</b> <em>${esc(K().ST[q.s])}</em> · ${q.r.kind}${(() => { const e = K().of(f.id).r[q.r.key]; return e && e.via ? ` · ${esc(e.via)}` : ''; })()} <button class="wz-go sm" data-m="sea-goto" data-x="${q.r.cx.toFixed(1)}" data-y="${q.r.cy.toFixed(1)}">${I('eye')}</button></div>`).join('')}</div>` : ''}
      ${ores.length ? `<div class="wz-al">${I('star')}<span>Veios que conhecem: ${(() => { const n = {}; for (const o of ores) { const k = K().of(f.id).o[o.id]; const t = k && k.claim !== o.kind ? `${esc(k.claim)} <small>(acham)</small>` : esc(o.kind); n[t] = (n[t] || 0) + 1; } return Object.entries(n).map(([t, c]) => c > 1 ? `${t} (${c} veios)` : t).join(', '); })()}</span></div>` : ''}
      ${rum.length ? `<h4 class="wz-h">Boatos em que acreditam</h4><div class="wz-events">${rum.map(r => { const e = r.by[f.id]; return `<div>“${esc(cap1(r.claim))}” <em>${Math.round(e.conf * 100)}% de crédito · ${esc(r.origin.name ? 'contou ' + r.origin.name : r.origin.what || '')}${e.end ? (e.ok ? ' · confirmado' : ' · desmentido') : ''}</em></div>`; }).join('')}</div>` : ''}`;
  }

  // ------------------------------ the map, as one people knows it ------------------------------
  const BASE = { 3: [214, 196, 146], 4: [118, 160, 82], 5: [130, 172, 86], 6: [146, 140, 126], 2: [86, 140, 176] };
  let mapCache = { key: '', img: null };
  function drawMap(cv, fid, o) {
    if (!cv || !G.S || !K()) return; o = o || {};
    const N = G.N; const S = G.S; const ctx = cv.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W0 = cv.clientWidth || 560, H0 = cv.clientHeight || 300; cv.width = W0 * dpr; cv.height = H0 * dpr;
    const kn = K().of(fid); const rs = K().regions(); const CW = Math.ceil(N / K().CELL);
    // the image of the world, N×N, then laid on its side like the god's view
    const key = fid + ':' + S.day + ':' + Object.keys(kn.c).length + ':' + Object.keys(kn.r).length;
    let img = mapCache.key === key ? mapCache.img : null;
    if (!img) {
      img = document.createElement('canvas'); img.width = N; img.height = N; const ic = img.getContext('2d'); const id = ic.createImageData(N, N); const px = id.data;
      const stOf = new Int8Array(rs.length); rs.forEach((r, k) => { stOf[k] = K().state(fid, r); });
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; const t = S.type[i]; let c;
        if (t <= 1) { const seen = kn.c[Math.floor(y / K().CELL) * CW + Math.floor(x / K().CELL)]; c = seen ? (t === 0 ? [44, 92, 132] : [66, 126, 164]) : [26, 34, 48]; }
        else { const ci = K().compAt(i); const s = ci >= 0 ? stOf[ci] : 0; if (s >= 3) c = BASE[t] || [120, 160, 90]; else if (s === 2) c = [118, 112, 98]; else if (s === 1) c = [62, 58, 52]; else c = [26, 34, 48]; }
        const k = i * 4; px[k] = c[0]; px[k + 1] = c[1]; px[k + 2] = c[2]; px[k + 3] = 255;
      }
      ic.putImageData(id, 0, 0); mapCache = { key, img };
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#141a24'; ctx.fillRect(0, 0, cv.width, cv.height);
    const s = Math.min(cv.width / (2 * N), cv.height / N) * 0.98; const ox = cv.width / 2, oy = (cv.height - N * s) / 2;
    const P2 = (x, y) => [ox + (x - y) * s, oy + (x + y) * s / 2];
    ctx.setTransform(s, s / 2, -s, s / 2, ox, oy); ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 0, 0); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // what is on it: towns, veins, wrecks, tales, tracks
    ctx.font = `${11 * dpr}px Georgia, serif`; ctx.textAlign = 'center';
    for (const set of S.settlements.values()) { const own = set.fac === fid; const r = K().at(set.cx, set.cy); const known = own || (kn.f[set.fac] && r && K().state(fid, r) >= 2); if (!known) continue; const p = P2(set.cx, set.cy); ctx.fillStyle = G.Fac.hex(set.fac); ctx.beginPath(); ctx.arc(p[0], p[1], 3.2 * dpr, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f4ecd8'; ctx.fillText(set.name, p[0], p[1] - 6 * dpr); }
    for (const ore of S.ores || []) { const k = kn.o[ore.id]; if (!k) continue; const p = P2(ore.x, ore.y); ctx.fillStyle = k.claim === 'ouro' ? '#f2c14e' : '#3a3a40'; ctx.fillRect(p[0] - 2.5 * dpr, p[1] - 2.5 * dpr, 5 * dpr, 5 * dpr); ctx.strokeStyle = '#f4ecd8'; ctx.lineWidth = dpr * 0.7; ctx.strokeRect(p[0] - 2.5 * dpr, p[1] - 2.5 * dpr, 5 * dpr, 5 * dpr); }
    for (const w of S.wrecks || []) { if (!kn.w[w.id]) continue; const p = P2(w.x, w.y); ctx.strokeStyle = '#e8c08a'; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); ctx.moveTo(p[0] - 3 * dpr, p[1] - 3 * dpr); ctx.lineTo(p[0] + 3 * dpr, p[1] + 3 * dpr); ctx.moveTo(p[0] + 3 * dpr, p[1] - 3 * dpr); ctx.lineTo(p[0] - 3 * dpr, p[1] + 3 * dpr); ctx.stroke(); }
    for (const rm of K().rumorsOf(fid)) { if (rm.x === undefined || rm.by[fid].end) continue; const p = P2(rm.x, rm.y); ctx.fillStyle = 'rgba(244,220,140,0.95)'; ctx.font = `bold ${14 * dpr}px Georgia, serif`; ctx.fillText('?', p[0], p[1] + 5 * dpr); ctx.font = `${11 * dpr}px Georgia, serif`; }
    for (const r of rs) { if (!K().big(r) || !K().named(r) || K().state(fid, r) < 3) continue; const p = P2(r.cx, r.cy); ctx.fillStyle = 'rgba(255,248,230,0.9)'; ctx.font = `italic ${10 * dpr}px Georgia, serif`; ctx.fillText(K().name(r), p[0], p[1] + 12 * dpr); ctx.font = `${11 * dpr}px Georgia, serif`; }
    const tracks = (S.exps || []).filter(e => e.fac === fid && (o.exp ? e === o.exp : (e.status === 'voltou' || X().live(e)))).slice(-8);
    for (const e of tracks) { if (!e.track || e.track.length < 2) continue; ctx.strokeStyle = e === o.exp ? '#ffd27a' : 'rgba(255,220,150,0.55)'; ctx.lineWidth = (e === o.exp ? 2 : 1.2) * dpr; ctx.setLineDash([4 * dpr, 3 * dpr]); ctx.beginPath(); e.track.forEach((q, k) => { const p = P2(q[0], q[1]); if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.setLineDash([]); const s0 = ship(e.flag); if (s0 && X().live(e)) { const p = P2(s0.x, s0.y); ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(p[0], p[1], 3 * dpr, 0, Math.PI * 2); ctx.fill(); } }
    // the legend
    ctx.textAlign = 'left'; ctx.font = `${10 * dpr}px sans-serif`; const L = [['#26303f', 'desconhecido'], ['#3e3a34', 'boato'], ['#76705f', 'avistado'], ['#76a052', 'explorado'], ['#427ea4', 'mar navegado']];
    L.forEach(([c, t], k) => { const y = cv.height - (L.length - k) * 14 * dpr - 4 * dpr; ctx.fillStyle = c; ctx.fillRect(8 * dpr, y, 10 * dpr, 10 * dpr); ctx.fillStyle = '#e8e0cc'; ctx.fillText(t, 22 * dpr, y + 9 * dpr); });
  }
  SU.drawMap = drawMap;

  // ------------------------------ the panel ------------------------------
  SU.open = function (tab) {
    if (!G.S || !K() || !X()) return;
    if (tab) view.tab = tab;
    const T = [['exp', 'Expedições', 'ship'], ['fleets', 'Frotas', 'sword'], ['know', 'Conhecimento', 'map']];
    const body = view.tab === 'fleets' ? tabFleets() : view.tab === 'know' ? tabKnow() : tabExp();
    G.UI.openModal(`<h2>${COMPASS} O Mar</h2>
      <div class="sea-tabs">${T.map(([k, n, ic]) => `<button class="${view.tab === k ? 'on' : ''}" data-m="sea-tab" data-t="${k}">${I(ic)} ${n}</button>`).join('')}</div>
      ${body}
      <div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide wz-modal sea-modal');
    if (view.tab === 'know') requestAnimationFrame(() => drawMap(document.getElementById('sea-kmap'), view.fac));
  };
  SU.click = function (m, b) {
    if (m === 'sea-open') SU.open();
    else if (m === 'sea-tab') SU.open(b.dataset.t);
    else if (m === 'sea-fac') { view.fac = +b.dataset.id; SU.open('know'); }
    else if (m === 'sea-exp') SU.openExp(+b.dataset.id);
    else if (m === 'sea-goto') { G.UI.closeModal(); G.Render.cam.follow = 0; G.Render.panTo(+b.dataset.x, +b.dataset.y); G.Render.cam.tz = Math.max(G.Render.cam.tz, 1.6); }
    else if (m === 'sea-follow') { const s = ship(+b.dataset.id); G.UI.closeModal(); if (s) { G.Render.panTo(s.x, s.y); G.Render.cam.follow = s.id; G.UI.select(s); G.Render.cam.tz = Math.max(G.Render.cam.tz, 1.8); } }
  };
  // the lines in a person's panel
  SU.personLine = function (v) {
    if (!X() || v.dead) return v.voyages ? `<div class="doing">${I('ship')} ${v.voyages} ${v.voyages > 1 ? 'viagens' : 'viagem'} pelo mar.</div>` : '';
    const e = X().memberOf(v.id); let h = '';
    if (e) h += `<div class="doing">${I('ship')} ${esc(cap1(X().roleOf(v, e)))} d${e.name.match(/^(A|As) /) ? 'a ' + esc(e.name.replace(/^(A|As) /, '')) : 'a expedição ' + esc(e.name)} <button class="wz-go sm" data-m="sea-exp" data-id="${e.id}">${I('book')}</button></div>`;
    if (v.wrecked) h += `<div class="doing">${I('wave')} Náufrag${v.g === 'f' ? 'a' : 'o'} ${esc(X().ofN(v.wrecked.name))}.</div>`;
    if (v.guestOf) h += `<div class="doing">${I('heart')} Vei${v.g === 'f' ? 'o' : 'o'} de longe, de ${esc(F(v.guestOf.from).name)}.</div>`;
    if (!e && v.voyages) h += `<div class="doing">${I('ship')} ${v.voyages} ${v.voyages > 1 ? 'viagens' : 'viagem'} pelo mar.</div>`;
    return h;
  };
  // the ship's panel (the inspector): who is aboard, what is broken, what it belongs to
  SU.shipHTML = function (s) {
    const ab = G.Naval.aboardOf(s); const f = G.Fac.get(s.fac);
    const e = s.exp && X().get(s.exp); const fl = s.fleet && Fl() && Fl().get(s.fleet);
    const dmg = []; if (s.mast === 0) dmg.push('mastro partido'); if ((s.sail === undefined ? 100 : s.sail) < 60) dmg.push(`vela rasgada (${Math.round(s.sail)}%)`); if (s.burn > 0) dmg.push('em chamas'); if ((s.flood || 0) > 10) dmg.push(`água no porão (${Math.round(s.flood)}%)`);
    const cls = s.kind === 'pesca' && G.Fishers ? G.Fishers.cls(s) : null;
    return `${s.st === 'build' ? `<div class="doing">No estaleiro: ${Math.round((s.prog || 0) * 100)}% do casco</div>` : ''}
      ${dmg.length ? `<div class="doing">${I('flame')} ${esc(dmg.join(' · '))}</div>` : ''}
      ${cls ? `<div class="meta">${esc(cap1(cls.noun))} para ${cls.crew} pescadores</div>` : ''}
      ${e ? `<div class="doing">${I('ship')} D${e.name.match(/^(A|As) /) ? 'a ' + esc(e.name.replace(/^(A|As) /, '')) : 'a expedição ' + esc(e.name)} <button class="wz-go sm" data-m="sea-exp" data-id="${e.id}">${I('book')}</button></div>` : ''}
      ${fl ? `<div class="doing">${I('sword')} D${fl.name.startsWith('a ') ? 'a ' + esc(fl.name.slice(2)) : fl.name.startsWith('o') ? esc(fl.name) : 'a frota'} · ${esc(Fl().MISSION[fl.mission] || '')} <button class="wz-go sm" data-m="sea-tab" data-t="fleets">${I('eye')}</button></div>` : ''}
      ${s.news && s.news.length ? `<div class="meta">Traz notícias para casa (${s.news.length})</div>` : ''}
      ${f ? '' : ''}`;
  };
})(window.G);
