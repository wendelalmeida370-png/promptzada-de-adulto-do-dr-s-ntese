'use strict';
// ============================================================
//  Politics: rulers & dynasties, governments, loyalty,
//  secession, coups, revolutions, tyranny — and diplomacy
//  between peoples (contact, opinion, war, peace, alliances,
//  envoys, caravans, marriages, vassals)
// ============================================================
(function (G) {
  let N = G.N;
  G.mapHooks.push(n => { N = n; });
  const P = G.Politics = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const key = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  P.key = key;

  // ------------------------------ vocabulary ------------------------------
  P.GOV = {
    tribo: { name: 'Tribo', title: ['Chefe', 'Chefe'] },
    chefia: { name: 'Chefia', title: ['Grão-Chefe', 'Grã-Chefe'] },
    reino: { name: 'Reino', title: ['Rei', 'Rainha'] },
    teocracia: { name: 'Teocracia', title: ['Sumo-Sacerdote', 'Suma-Sacerdotisa'] },
    tirania: { name: 'Tirania', title: ['Tirano', 'Tirana'] },
    conselho: { name: 'Conselho', title: ['Conselheiro-Mor', 'Conselheira-Mor'] },
    livre: { name: 'Povo Livre', title: ['Porta-Voz', 'Porta-Voz'] },
  };
  P.GOV_DESC = {
    tribo: 'Um pequeno grupo guiado pelos mais respeitados.',
    chefia: 'Um chefe forte governa, e seus filhos herdam o poder.',
    reino: 'Uma dinastia governa. A coroa passa de pais para filhos.',
    teocracia: 'Os sacerdotes governam em seu nome. A devoção é lei.',
    tirania: 'Um só governa pelo medo: execuções, trabalho forçado, cativos.',
    conselho: 'Depois da revolução, o poder é dividido. Ninguém é cativo.',
    livre: 'Ex-cativos que juraram nunca mais usar correntes.',
  };
  const EPI = {
    fundador: ['o Fundador', 'a Fundadora'], conquistador: ['o Conquistador', 'a Conquistadora'], cruel: ['o Cruel', 'a Cruel'],
    sanguinario: ['o Sanguinário', 'a Sanguinária'], pio: ['o Pio', 'a Pia'], pacifico: ['o Pacífico', 'a Pacífica'],
    libertador: ['o Libertador', 'a Libertadora'], usurpador: ['o Usurpador', 'a Usurpadora'], grande: ['o Grande', 'a Grande'],
    breve: ['o Breve', 'a Breve'], velho: ['o Velho', 'a Velha'], ungido: ['o Ungido', 'a Ungida'], bravo: ['o Bravo', 'a Brava'],
    rebelde: ['o Rebelde', 'a Rebelde'], correntes: ['o das Correntes', 'a das Correntes'], justo: ['o Justo', 'a Justa'],
    construtor: ['o Construtor', 'a Construtora'], sabio: ['o Sábio', 'a Sábia'],
    escolhido: ['o Escolhido', 'a Escolhida'], profeta: ['o Profeta', 'a Profetisa'],
  };
  const EPI_RANK = { breve: 0, velho: 1, fundador: 2, justo: 3, sabio: 3, construtor: 3, pacifico: 3, pio: 4, grande: 4, bravo: 4, rebelde: 5, usurpador: 5, ungido: 6, correntes: 6, profeta: 5, escolhido: 7, cruel: 6, libertador: 7, conquistador: 8, sanguinario: 9 };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
  P.epithet = v => (v && v.ep && EPI[v.ep] ? EPI[v.ep][v.g === 'f' ? 1 : 0] : '');
  P.GOV.imperio = { name: 'Império', title: ['Imperador', 'Imperatriz'] };
  P.GOV_DESC.imperio = 'Muitas cidades sob uma só coroa. Poder, prestígio — e cobiça.';
  P.govName = f => G.Civ.govName(f) || (P.GOV[f.gov] || P.GOV.tribo).name;
  P.title = (f, v) => G.Civ.govTitle(f, v) || (P.GOV[f.gov] || P.GOV.tribo).title[v && v.g === 'f' ? 1 : 0];
  P.regnal = v => v.name + (v.ord > 1 ? ' ' + (ROMAN[v.ord] || v.ord) : '');
  P.fullName = v => P.regnal(v) + (v.ep ? ', ' + P.epithet(v) : '');
  P.styled = (f, v) => (v ? P.title(f, v) + ' ' + P.fullName(v) : 'ninguém');
  P.ruler = f => (f && f.leader ? G.S.villagers.get(f.leader) : null);
  P.isRuler = v => { const f = G.Fac.ofV(v); return !!f && f.leader === v.id; };
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');

  // ------------------------------ personalities ------------------------------
  P.persona = function (v) {
    if (!v) return { agg: 0.45, cru: 0.3, pie: 0.5, amb: 0.5 };
    if (v.pe) return v.pe;
    const h = k => G.hash(v.id * 7919 + k * 104729 + 17);
    const tr = v.traits || [];
    const bias = G.S.temper === 'belicoso' ? 0.18 : G.S.temper === 'pacifico' ? -0.22 : 0;
    const cb = (G.CIVS[v.civ] && G.CIVS[v.civ].persona) || { agg: 0, cru: 0, pie: 0, amb: 0 };
    let agg = 0.1 + h(1) * 0.75 + bias + cb.agg, cru = h(2) * 0.75 + bias * 0.5 + cb.cru, pie = 0.1 + h(3) * 0.75 + cb.pie, amb = 0.1 + h(4) * 0.8 + cb.amb;
    if (tr.includes('Corajoso')) agg += 0.2;
    if (tr.includes('Medroso')) agg -= 0.25;
    if (tr.includes('Devoto')) pie += 0.3;
    if (tr.includes('Cético')) pie -= 0.3;
    if (tr.includes('Romântico') || tr.includes('Sociável')) { cru -= 0.15; agg -= 0.05; }
    if (tr.includes('Trabalhador') || tr.includes('Curioso')) amb += 0.12;
    if (tr.includes('Preguiçoso')) amb -= 0.15;
    const c = x => Math.round(G.clamp(x, 0, 1) * 100) / 100;
    v.pe = { agg: c(agg), cru: c(cru), pie: c(pie), amb: c(amb) };
    return v.pe;
  };
  P.leaderPe = f => (G.Powers && G.Powers.lawPe ? G.Powers.lawPe(f, P.persona(P.ruler(f))) : P.persona(P.ruler(f)));
  P.personaWords = function (v) {
    const p = P.persona(v); const f = v.g === 'f'; const w = [];
    if (p.agg > 0.66) w.push(f ? 'belicosa' : 'belicoso'); else if (p.agg < 0.3) w.push(f ? 'pacífica' : 'pacífico');
    if (p.cru > 0.66) w.push('cruel'); else if (p.cru < 0.22) w.push('clemente');
    if (p.pie > 0.68) w.push(f ? 'devota' : 'devoto'); else if (p.pie < 0.22) w.push(f ? 'cética' : 'cético');
    if (p.amb > 0.72) w.push(f ? 'ambiciosa' : 'ambicioso');
    return w;
  };
  P.bump = function (v, k, d) { if (!v) return; const p = P.persona(v); p[k] = Math.round(G.clamp(p[k] + d, 0, 1) * 100) / 100; };

  // ------------------------------ members ------------------------------
  function adultsOf(fid) { const out = []; for (const v of G.S.villagers.values()) if (!v.captive && v.age >= 18 && v.age < 75 && G.Fac.idOfV(v) === fid) out.push(v); return out; }
  P.adultsOf = adultsOf;
  const isKin = (a, b) => !!a && !!b && (a.mother === b.id || a.father === b.id || b.mother === a.id || b.father === a.id || (a.mother && a.mother === b.mother) || (a.father && a.father === b.father) || a.partner === b.id);
  function prestige(v, f) {
    const pe = P.persona(v);
    return Math.min(v.age, 58) * 0.5 + v.courage * 14 + pe.amb * 10 + (v.kills || 0) * 2 + (v.hero ? 12 : 0) + (v.st ? v.st.built * 0.5 : 0)
      + (f.gov === 'teocracia' && (v.role === 'sacerdote' || v.traits.includes('Devoto')) ? 15 : 0) + G.R() * 6;
  }
  const DYNASTIC_GOV = { chefia: 1, reino: 1, tirania: 1, imperio: 1 };
  // a republic elects its consuls; everyone else passes the crown within the family
  const dyn = f => !!DYNASTIC_GOV[f.gov] && !(f.gov === 'reino' && f.civ === 'romano');
  P.dynastic = dyn;
  P.heirOf = function (f, old) {
    const S = G.S; if (!old) return null;
    const ok = v => v && !v.captive && v.age >= 16 && G.Fac.idOfV(v) === f.id;
    const kids = (old.kids || []).map(id => S.villagers.get(id)).filter(ok).sort((a, b) => b.age - a.age);
    if (kids.length) return kids[0];
    for (const v of S.villagers.values()) if (ok(v) && v.id !== old.id && ((old.mother && v.mother === old.mother) || (old.father && v.father === old.father))) return v;
    const p = S.villagers.get(old.partner); if (ok(p)) return p;
    return null;
  };
  P.pickLeader = function (f, exclude) {
    const S = G.S;
    const old = G.person(f.leader) || G.person(exclude);
    if (dyn(f)) { const h = P.heirOf(f, old); if (h && h.id !== exclude) return h; }
    let best = null, bs = -1e9;
    for (const v of adultsOf(f.id)) { if (v.id === exclude) continue; const s = prestige(v, f); if (s > bs) { bs = s; best = v; } }
    if (!best) for (const v of S.villagers.values()) if (!v.captive && v.age >= 12 && G.Fac.idOfV(v) === f.id && v.id !== exclude) { best = v; break; }
    return best;
  };

  // ------------------------------ reigns ------------------------------
  P.crown = function (f, v, how, quiet) {
    const S = G.S;
    if (!v) { f.leader = 0; return; }
    f.leader = v.id;
    if (!v.reigned) {
      const same = f.rulers.filter(r => r.name === v.name).length;
      v.ord = same ? same + 1 : 0;
      v.reigned = f.id;
    }
    f.rulers.push({ id: v.id, name: v.name, g: v.g, ord: v.ord || 0, from: S.day, how: how || 'escolha' });
    G.Life && G.Life.bio(v, 'ruler', f.name);
    if (f.rulers.length > 40) f.rulers.splice(0, f.rulers.length - 40);
    f.legit = how === 'golpe' ? 25 : how === 'revolucao' ? 70 : how === 'ungido' ? 100 : how === 'heranca' ? 75 : 60;
    if (how === 'golpe') P.earn(f, v, 'usurpador', true);
    if (how === 'revolucao') P.earn(f, v, 'libertador', true);
    if (how === 'ungido') P.earn(f, v, 'ungido', true);
    if (how === 'secessao') P.earn(f, v, 'rebelde', true);
    P.checkGov(f, true, how);
    f.rulers[f.rulers.length - 1].title = P.title(f, v);
    if (!quiet && (how === 'heranca' || how === 'escolha') && successionCrisis(f, v)) return;
    if (quiet) return;
    const t = P.title(f, v).toLowerCase();
    if (how === 'heranca') log(`${P.regnal(v)} herdou o poder e agora é ${t} de ${f.name}.`, 'crown', v.x, v.y);
    else if (how === 'escolha') log(`${f.name} escolheu ${P.regnal(v)} como ${t}.`, 'crown', v.x, v.y);
    else if (how === 'ungido') log(`Tocad${oa(v)} por você, ${v.name} tornou-se ${t} de ${f.name}.`, 'crown', v.x, v.y);
  };
  P.endReign = function (f, how) {
    const S = G.S;
    const r = f.rulers[f.rulers.length - 1];
    const v = G.person(f.leader);
    if (r && r.id === f.leader && r.to === undefined) {
      r.to = S.day; r.end = how;
      if (v) {
        const len = S.day - r.from;
        if (!v.ep) { if (len < 2) v.ep = 'breve'; else if (v.age >= 68) v.ep = 'velho'; else if (f.rulers.length === 1) v.ep = 'fundador'; }
        if (v.ep) r.ep = P.epithet(v);
      }
    }
    f.leader = 0;
  };
  P.earn = function (f, v, k, quiet) {
    if (!v || !EPI[k]) return;
    if (v.ep && (EPI_RANK[v.ep] || 0) >= (EPI_RANK[k] || 0)) return;
    v.ep = k;
    const r = f.rulers[f.rulers.length - 1]; if (r && r.id === v.id) r.ep = P.epithet(v);
    if (!quiet) log(`O povo de ${f.name} passou a chamar ${v.g === 'f' ? 'sua' : 'seu'} ${P.title(f, v).toLowerCase()} de ${P.fullName(v)}.`, 'crown', v.x, v.y);
  };

  // a contested succession: an ambitious lord of another village refuses the new ruler
  function successionCrisis(f, heir) {
    const S = G.S; const cap = G.Fac.capitalOf(f.id); if (!cap) return false;
    const sets = G.Fac.settlementsOf(f.id).filter(s => s !== cap && freePopOfSet(s.id) >= 8);
    if (!sets.length || S.day < 10) return false;
    let best = null, bs = 0, bset = null;
    for (const v of S.villagers.values()) {
      if (v.captive || v.age < 22 || v.age > 64 || v === heir) continue;
      const s = sets.find(o => o.id === v.set); if (!s) continue;
      const pe = P.persona(v); if (pe.amb < 0.6) continue;
      const sc = pe.amb + v.courage * 0.5 + (isKin(v, heir) ? 0.3 : 0) + (100 - s.loyalty) / 200;
      if (sc > bs) { bs = sc; best = v; bset = s; }
    }
    if (!best) return false;
    const chance = 0.18 + (heir.age < 25 ? 0.18 : 0) + (f.gov === 'tirania' ? 0.15 : 0) + (bset.loyalty < 50 ? 0.15 : 0);
    if (G.R() > chance) return false;
    log(`Crise de sucessão em ${f.name}! ${best.name}, de ${bset.name}, não aceitou ${P.regnal(heir)} e proclamou-se soberan${oa(best)}.`, 'split', bset.cx, bset.cy);
    S.stats.successionWars = (S.stats.successionWars || 0) + 1;
    P.secede(bset, best, true);
    return true;
  }

  // ------------------------------ government ------------------------------
  P.baseGov = function (f) {
    const pop = G.Fac.pop(f.id), sets = G.Fac.settlementsOf(f.id).length;
    if (((sets >= 3 && pop >= 70) || ((f.st.conquests || 0) >= 2 && pop >= 50)) && f.era >= 4) return 'imperio';
    if ((f.era >= 4 && pop >= 30) || (sets >= 2 && pop >= 36)) return 'reino';
    if (f.era >= 2 && pop >= 16) return 'chefia';
    return 'tribo';
  };
  const RANK = { tribo: 0, chefia: 1, reino: 2, imperio: 3 };
  P.checkGov = function (f, crowning, how) {
    const v = P.ruler(f); const pe = P.persona(v);
    let g = f.gov || 'tribo';
    const base = P.baseGov(f);
    if (RANK[g] !== undefined && RANK[base] > RANK[g]) g = base;
    if (crowning && v) {
      if (how === 'revolucao') g = 'conselho';
      else if (how === 'golpe' && pe.cru > 0.45) g = 'tirania';
      else if (g === 'conselho' || g === 'livre') { /* free peoples keep their councils */ }
      else if (pe.cru > 0.72 && base !== 'tribo') g = 'tirania';
      else if (pe.pie > 0.72 && G.Fac.has(f.id, 'temple')) g = 'teocracia';
      else if (g === 'tirania' || g === 'teocracia') g = base;
    }
    if (g !== f.gov) { const old = f.gov; f.gov = g; onGovChange(f, old, v); }
  };
  function onGovChange(f, old, v) {
    const S = G.S; const c = G.Fac.capitalOf(f.id); const x = c ? c.cx : undefined, y = c ? c.cy : undefined;
    const st = v ? P.styled(f, v) : '';
    if (!old) return;
    switch (f.gov) {
      case 'chefia': log(`${f.name} deixou de ser uma simples tribo: agora é uma chefia${v ? ', e ' + st + ' governa' : ''}.`, 'crown', x, y); break;
      case 'reino':
        if (f.civ === 'romano') log(`${f.name} expulsou os reis e fundou a República. ${st ? st + ' governa, eleit' + oa(v) + ' pelo povo.' : ''}`, 'crown', x, y);
        else log(`${f.name} tornou-se ${f.civ === 'asteca' ? 'um senhorio' : 'um reino'}. ${st ? st + ' foi coroad' + oa(v) + '.' : ''}`, 'crown', x, y);
        G.Village.milestone('kingdom', f.civ === 'romano' ? 'Nasce uma república' : 'Nasce um reino', `${f.name} agora é ${P.govName(f)}.`, 'crown');
        if (G.Fac.all().length > 1) G.UI && G.UI.toast(P.govName(f), `${f.name}: ${v ? P.styled(f, v) : 'um novo governo'}.`, 'crown');
        G.Lore && G.Lore.note('gov', { fac: f.id, gov: 'reino' });
        break;
      case 'imperio':
        log(f.civ === 'romano' ? `A República caiu: nasce o Império de ${f.name}. ${st} é ${v && v.g === 'f' ? 'a primeira' : 'o primeiro'} a usar a coroa de louros.` : `${f.name} tornou-se ${P.govName(f)}. ${st} reina sobre muitas cidades.`, 'crown', x, y);
        G.Village.milestone('empire', 'Nasce um império', `${f.name} agora é ${P.govName(f)}.`, 'crown');
        G.UI && G.UI.toast(P.govName(f), `${f.name} se ergue como império.`, 'crown');
        G.Lore && G.Lore.note('gov', { fac: f.id, gov: 'imperio' });
        break;
      case 'teocracia': log(`${f.name} tornou-se uma teocracia: ${st} governa em seu nome.`, 'faith', x, y); break;
      case 'tirania':
        log(`A tirania começou em ${f.name}: ${st} governa pelo medo.`, 'tyrant', x, y);
        G.UI && G.UI.toast('Tirania', `${st} governa ${f.name} com mão de ferro.`, 'tyrant');
        break;
      case 'conselho': log(`${f.name} agora é governad${G.Fac.oa(f)} por um conselho.`, 'crown', x, y); break;
      default: if (old === 'tirania') log(`A tirania acabou em ${f.name}.`, 'crown', x, y);
    }
    if (f.gov === 'conselho' || f.gov === 'livre') G.War && G.War.freeAllOf(f, 'abolicao');
    if (S.stats) S.stats.govChanges = (S.stats.govChanges || 0) + 1;
  }

  // ------------------------------ loyalty & stability ------------------------------
  function freePopOfSet(sid) { let n = 0; for (const v of G.S.villagers.values()) if (v.set === sid && !v.captive) n++; return n; }
  P.freePopOfSet = freePopOfSet;
  function updateLoyalty(f, dt) {
    const S = G.S; const cap = G.Fac.capitalOf(f.id); if (!cap) return;
    const pe = P.leaderPe(f);
    const pop = G.Fac.pop(f.id);
    const hungry = f.stock.food < pop * 0.5;
    const war = G.Fac.enemiesOf(f.id).length > 0;
    let sum = 0, n = 0;
    // Greek poleis crave independence; Roman roads and law bind provinces
    const dl = G.Civ.t(f.id, 'distLoyal'), assim = G.Civ.t(f.id, 'assimilate');
    for (const s of G.Fac.settlementsOf(f.id)) {
      let t = 68 + G.Civ.t(f.id, 'loyalty', 0) + (G.Civ.has(f.id, 'filosofia') ? 4 : 0);
      if (s === cap) t += 20;
      else {
        let far = Math.min(26, Math.max(0, G.dist(s.cx, s.cy, cap.cx, cap.cy) - 12) * 0.9);
        // big realms breed local pride: old, distant villages want their own way
        far += Math.min(16, Math.max(0, pop - 50) * 0.15);
        far += Math.min(14, Math.max(0, S.day - s.founded - 6) * 0.35);
        if (G.City && G.City.linked(s)) far *= 0.6;
        t -= far * dl;
      }
      if (G.City) t += G.City.loyaltyBonus(s);
      if (G.Eco) t += G.Eco.loyaltyMod(s, f);
      if (hungry) t -= 18;
      t -= f.weariness * 0.3;
      if (f.gov === 'tirania') t -= 16 + pe.cru * 12; else t -= pe.cru * 8;
      if (f.gov === 'conselho' || f.gov === 'livre') t += 6;
      if (s.conq) t -= Math.max(0, 40 - (S.day - s.conq) * 5 * assim);
      if (s.origFac && s.origFac !== s.fac) t -= 10 / assim;
      t += (f.legit - 60) * 0.25;
      if (s.discord > 0) { t -= 60; s.discord -= dt; }
      if (s.blessed > 0) { t += 25; s.blessed -= dt; }
      if (s.loyalty === undefined) s.loyalty = 60;
      s.loyalty = G.clamp(s.loyalty + (t - s.loyalty) * Math.min(1, dt * 0.012), 0, 100);
      const sp = freePopOfSet(s.id); sum += s.loyalty * sp; n += sp;
    }
    f.stab = n ? sum / n * 0.75 + f.legit * 0.25 : 50;
    f.legit = Math.min(100, f.legit + dt * 0.012);
    f.terror = Math.max(0, (f.terror || 0) - dt * 0.04);
    f.weariness = war ? Math.min(100, f.weariness + dt * 0.015) : Math.max(0, f.weariness - dt * 0.06);
  }

  // ------------------------------ lifecycle ------------------------------
  P.setupFaction = function (f) {
    if (!f.gov) f.gov = 'tribo';
    if (!f.rulers) f.rulers = [];
    if (f.legit === undefined) f.legit = 60;
    if (f.stab === undefined) f.stab = 60;
    if (!f.terror) f.terror = 0;
    if (!f.weariness) f.weariness = 0;
    if (!f.st) f.st = {};
    for (const k of ['kills', 'deaths', 'conquests', 'captives', 'massacres', 'battles', 'lost', 'executions', 'freed']) if (f.st[k] === undefined) f.st[k] = 0;
    if (f.attackCD === undefined) f.attackCD = 60;
  };
  P.init = function () {
    for (const f of G.Fac.all()) {
      P.setupFaction(f);
      const v = P.pickLeader(f);
      P.crown(f, v, 'fundacao', true);
    }
  };
  P.afterLoad = function () {
    for (const f of G.S.factions.values()) {
      P.setupFaction(f);
      f.coup = null; f.rev = null; f.revolt = null; f.exec = null;
      if (f.alive && (!f.leader || !G.S.villagers.has(f.leader))) { f.leader = 0; P.crown(f, P.pickLeader(f), 'escolha', true); }
    }
    G.War && G.War.reset();
  };
  function ensureLeader(f) {
    const S = G.S;
    const v = S.villagers.get(f.leader);
    if (v && !v.captive && G.Fac.idOfV(v) === f.id) return;
    if (f.leader) {
      const old = G.person(f.leader);
      const why = v && v.captive ? 'capturado' : v ? 'partiu' : 'morte';
      if (v && v.captive) log(`${P.styled(f, v)} foi capturad${oa(v)}! ${f.name} precisa de um novo líder.`, 'chain', v.x, v.y);
      P.endReign(f, why);
      const h = P.pickLeader(f, old ? old.id : 0);
      P.crown(f, h, dyn(f) && isKin(h, old) ? 'heranca' : 'escolha');
    } else {
      const h = P.pickLeader(f);
      if (h) P.crown(f, h, 'escolha');
    }
  }
  const DEATH_TXT = {
    old: 'morreu de velhice', hunger: 'morreu de fome', sick: 'sucumbiu à doença', fire: 'morreu num incêndio', wolf: ['foi morto por lobos', 'foi morta por lobos'],
    boar: ['foi morto por um javali', 'foi morta por um javali'], lightning: ['foi fulminado por um raio', 'foi fulminada por um raio'],
    meteor: ['foi esmagado por um meteoro', 'foi esmagada por um meteoro'], fall: 'caiu das mãos de deus', drown: 'se afogou', war: 'tombou em batalha',
    massacre: ['foi massacrado', 'foi massacrada'], arrow: ['foi atingido por uma flecha', 'foi atingida por uma flecha'], execution: ['foi executado', 'foi executada'],
    coup: ['foi assassinado', 'foi assassinada'],
  };
  const deathTxt = (cause, v) => { const d = DEATH_TXT[cause] || 'morreu'; return Array.isArray(d) ? d[v.g === 'f' ? 1 : 0] : d; };
  P.onDeath = function (v, cause, killerId, byGod) {
    const S = G.S;
    const killer = killerId ? S.villagers.get(killerId) : null;
    for (const f of S.factions.values()) {
      if (!f.alive || f.leader !== v.id) continue;
      const dt = deathTxt(cause, v);
      const coup = killer && killer.coup === f.id && G.Fac.idOfV(killer) === f.id;
      const rev = f.rev && killer && (killer.rebel === f.id);
      if (coup) {
        P.endReign(f, 'golpe');
        log(`Golpe em ${f.name}! ${killer.name} matou ${P.styled(f, v)} e tomou o poder.`, 'tyrant', v.x, v.y);
        G.UI && G.UI.toast('Golpe de estado', `${killer.name} derrubou ${P.regnal(v)} em ${f.name}.`, 'tyrant');
        for (const o of S.villagers.values()) if (o.coup === f.id) o.coup = 0;
        f.coup = null;
        P.crown(f, killer, 'golpe', true);
        S.stats.coups = (S.stats.coups || 0) + 1;
        continue;
      }
      if (rev) {
        P.endReign(f, 'revolucao');
        const lead = S.villagers.get(f.rev.leader) || killer;
        log(`O tirano caiu! ${P.styled(f, v)} foi mort${oa(v)} pelo próprio povo de ${f.name}.`, 'tyrant', v.x, v.y);
        G.UI && G.UI.toast('Revolução', `${f.name} derrubou ${v.g === 'f' ? 'sua tirana' : 'seu tirano'}.`, 'tyrant');
        endRevolution(f);
        P.crown(f, lead, 'revolucao', true);
        log(`${lead.name} lidera agora ${f.name}, governad${G.Fac.oa(f)} por um conselho.`, 'crown', lead.x, lead.y);
        S.stats.revolutions = (S.stats.revolutions || 0) + 1;
        continue;
      }
      if (byGod && f.gov === 'tirania') {
        log(`O céu respondeu: ${P.styled(f, v)} ${dt}. ${f.name} celebra em silêncio.`, 'bolt', v.x, v.y);
        G.UI && G.UI.toast('O tirano caiu', `Você derrubou ${P.regnal(v)}.`, 'tyrant');
        for (const o of S.villagers.values()) if (!o.captive && G.Fac.idOfV(o) === f.id) { o.devotion = Math.min(100, o.devotion + 18); o.fear = Math.min(100, o.fear + 10); }
        if (G.Events && G.Events.onTyrantFall) G.Events.onTyrantFall(f);
      } else log(`${P.styled(f, v)} ${dt}${cause === 'old' ? ' aos ' + Math.floor(v.age) + ' anos' : ''}.`, cause === 'old' ? 'grave' : 'crown', v.x, v.y);
      P.endReign(f, cause === 'execution' ? 'executado' : cause === 'war' || cause === 'arrow' ? 'batalha' : 'morte');
      const h = P.pickLeader(f, v.id);
      P.crown(f, h, dyn(f) && isKin(h, v) ? 'heranca' : 'escolha');
    }
    // conspirators and rebel leaders
    if (v.coup) { const f = G.Fac.get(v.coup); if (f && f.coup && f.coup.by === v.id) { log(`A conspiração de ${v.name} contra ${P.styled(f, P.ruler(f))} terminou com sua morte.`, 'crown', v.x, v.y); for (const o of S.villagers.values()) if (o.coup === f.id) o.coup = 0; f.coup = null; } }
    if (v.hero && cause !== 'old') log(`O herói ${v.name} ${cause === 'war' || cause === 'arrow' || cause === 'massacre' ? 'tombou em combate' : 'morreu'}. Tinha ${v.kills || 0} vitórias.`, 'war', v.x, v.y);
  };

  // ------------------------------ coups ------------------------------
  function checkCoup(f) {
    if (f.coup || f.rev || f.exec) return;
    const ruler = P.ruler(f); if (!ruler) return;
    const control = f.stab + (f.gov === 'tirania' ? f.terror * 0.5 : 0);
    if (control > 44 || G.Fac.pop(f.id) < 10) return;
    if (G.R() > (44 - control) / 44 * 0.22) return;
    let best = null, bs = 0;
    for (const v of adultsOf(f.id)) {
      if (v === ruler || v.id === ruler.partner || (ruler.kids || []).includes(v.id) || v.age > 60 || v.hp < 60) continue;
      // (someone who swore to see the ruler pay is among the first to listen to a conspiracy)
      const grudge = G.Stories && G.Stories.foeOf(v) === ruler.id;
      const pe = P.persona(v); const s = pe.amb * 1.2 + v.courage * 0.6 + (v.kills || 0) * 0.05 + (v.role === 'guerreiro' ? 0.3 : 0) + (grudge ? 0.6 : 0);
      if ((pe.amb > 0.62 || (grudge && pe.amb > 0.4)) && s > bs) { bs = s; best = v; }
    }
    if (best) P.startCoup(f, best);
  }
  P.startCoup = function (f, u) {
    const ruler = P.ruler(f); if (!ruler || u === ruler) return;
    u.coup = f.id; f.coup = { by: u.id, t: 0 };
    G.Vg.endTask(u); G.Vg.setTask(u, { type: 'combat', id: ruler.id, pri: 4.7, coup: true, any: true, cause: 'coup', kind: 'combat' });
    let k = 0;
    for (const v of adultsOf(f.id)) {
      if (k >= 2) break;
      if (v !== u && v !== ruler && v.id !== ruler.partner && !isKin(v, ruler) && (P.persona(v).amb > 0.5 || (G.Stories && G.Stories.foeOf(v) === ruler.id)) && G.dist(v.x, v.y, u.x, u.y) < 18 && G.R() < 0.5) {
        v.coup = f.id; G.Vg.setTask(v, { type: 'combat', id: ruler.id, pri: 4.6, coup: true, any: true, cause: 'coup', kind: 'combat' }); k++;
      }
    }
    for (const v of adultsOf(f.id)) if (v.role === 'guerreiro' && !v.coup && v !== ruler && G.dist(v.x, v.y, ruler.x, ruler.y) < 16 && G.R() < 0.6) G.Vg.setTask(v, { type: 'combat', id: u.id, pri: 4.6, guard: true, any: true, kind: 'combat' });
    log(`Conspiração em ${f.name}! ${u.name}${k ? ' e ' + k + (k > 1 ? ' cúmplices' : ' cúmplice') : ''} tentam derrubar ${P.styled(f, ruler)}.`, 'tyrant', ruler.x, ruler.y);
    G.UI && G.UI.notice(`Conspiração em ${f.name}: ${u.name} quer o trono!`, 'tyrant');
  };
  function coupTick(f, dt) {
    if (!f.coup) return;
    const S = G.S; f.coup.t += dt;
    const u = S.villagers.get(f.coup.by); const ruler = P.ruler(f);
    if (!u || !ruler) { f.coup = null; return; }
    if (f.coup.t > 70 || (u.task && u.task.type !== 'combat' && f.coup.t > 8)) {
      log(`O golpe de ${u.name} fracassou.`, 'crown', u.x, u.y);
      for (const o of S.villagers.values()) if (o.coup === f.id) o.coup = 0;
      f.coup = null;
      if (P.persona(ruler).cru > 0.45) P.execute(f, u, 'por traição');
      else { u.courage *= 0.7; P.bump(u, 'amb', -0.3); }
    } else if (u.task && u.task.type !== 'combat') G.Vg.setTask(u, { type: 'combat', id: ruler.id, pri: 4.7, coup: true, any: true, cause: 'coup', kind: 'combat' });
  }

  // ------------------------------ revolutions ------------------------------
  function checkRevolution(f) {
    if (f.gov !== 'tirania' || f.rev || f.coup) return;
    const control = f.stab + f.terror * 0.5;
    if (control > 32 || G.Fac.pop(f.id) < 12) return;
    if (G.R() > 0.25) return;
    P.startRevolution(f);
  }
  P.startRevolution = function (f) {
    const S = G.S; const tyrant = P.ruler(f); if (!tyrant) return;
    const adults = adultsOf(f.id).filter(v => v !== tyrant && !isKin(v, tyrant));
    adults.sort((a, b) => (P.persona(b).amb + b.courage) - (P.persona(a).amb + a.courage));
    const lead = adults[0]; if (!lead) return;
    const rebels = [lead];
    for (const v of adults) { if (v === lead) continue; if (v.role === 'guerreiro' && G.R() < 0.55) continue; if (G.R() < 0.55) rebels.push(v); }
    for (const v of S.villagers.values()) if (v.captive && G.Fac.idOfV(v) === f.id && v.age >= 16 && v.hp > 50 && G.R() < 0.7) rebels.push(v);
    f.rev = { leader: lead.id, rebels: rebels.map(v => v.id), t: 0 };
    for (const v of rebels) { v.rebel = f.id; G.Vg.setTask(v, { type: 'combat', id: tyrant.id, pri: 4.7, rebel: true, any: true, cause: 'war', kind: 'combat' }); }
    for (const v of adultsOf(f.id)) {
      if (v.rebel || v.role !== 'guerreiro') continue;
      let t = null, bd = 1e9; for (const r of rebels) { const d = G.dist2(v.x, v.y, r.x, r.y); if (d < bd) { bd = d; t = r; } }
      if (t && bd < 30 * 30) G.Vg.setTask(v, { type: 'combat', id: t.id, pri: 4.6, guard: true, any: true, kind: 'combat' });
    }
    log(`Revolução em ${f.name}! ${lead.name} lidera ${rebels.length} rebeldes contra ${P.styled(f, tyrant)}.`, 'tyrant', tyrant.x, tyrant.y);
    G.UI && G.UI.toast('Revolução!', `${f.name} se levanta contra ${tyrant.g === 'f' ? 'a tirana' : 'o tirano'}.`, 'tyrant');
    G.Audio && G.Audio.play('horn');
  };
  function endRevolution(f) {
    const S = G.S;
    if (!f.rev) return;
    for (const id of f.rev.rebels) { const v = S.villagers.get(id); if (v) { v.rebel = 0; if (v.task && v.task.rebel) G.Vg.endTask(v); } }
    f.rev = null;
  }
  function revTick(f, dt) {
    if (!f.rev) return;
    const S = G.S; f.rev.t += dt;
    const tyrant = P.ruler(f); const lead = S.villagers.get(f.rev.leader);
    if (!tyrant) { endRevolution(f); return; }
    if (!lead || f.rev.t > 80) {
      const alive = f.rev.rebels.map(id => S.villagers.get(id)).filter(v => v && !v.captive);
      endRevolution(f);
      let n = 0;
      for (const v of alive.sort(() => G.R() - 0.5)) { if (n >= 3) break; G.FX && G.FX.blood(v.x, v.y); G.Vg.damage(v, 999, 'execution', false, tyrant.id); n++; }
      f.terror = Math.min(100, f.terror + 40); f.st.executions += n;
      log(`A revolução foi esmagada em ${f.name}.${n ? ' ' + P.styled(f, tyrant) + ' mandou executar ' + n + ' rebeldes.' : ''}`, 'massacre', tyrant.x, tyrant.y);
      if (n >= 3) P.earn(f, tyrant, 'sanguinario');
      return;
    }
    for (const id of f.rev.rebels) {
      const v = S.villagers.get(id);
      if (v && (!v.task || v.task.type !== 'combat') && G.dist(v.x, v.y, tyrant.x, tyrant.y) < 30) G.Vg.setTask(v, { type: 'combat', id: tyrant.id, pri: 4.7, rebel: true, any: true, cause: 'war', kind: 'combat' });
    }
  }

  // ------------------------------ tyranny: executions ------------------------------
  const EXEC_REASONS = ['por traição', 'por murmurar contra o trono', 'por esconder comida', 'por rezar ao deus errado', 'só para lembrar a todos quem manda', 'por sonhar com a liberdade', 'por desobediência'];
  function checkTyranny(f) {
    const S = G.S; const ruler = P.ruler(f); if (!ruler || f.exec || f.rev || f.coup) return;
    const pe = P.persona(ruler);
    if (!(f.gov === 'tirania' || pe.cru > 0.82)) return;
    if (S.day - (f.lastExec === undefined ? -9 : f.lastExec) < 1.6 - pe.cru * 0.6) return;
    if (G.R() > 0.3) return;
    const cap = G.Fac.capitalOf(f.id); if (!cap) return;
    const caps = [...S.villagers.values()].filter(v => v.captive && v.set === cap.id && v.age >= 14 && !(v.task && v.task.pri >= 4));
    let victim = null, reason = '';
    if (caps.length && G.R() < 0.45) { victim = G.pick(caps); reason = G.pick(['por desobediência', 'por tentar fugir', 'para servir de exemplo aos outros cativos']); }
    else {
      const c = adultsOf(f.id).filter(v => v !== ruler && v.set === cap.id && !isKin(v, ruler) && v.role !== 'guerreiro');
      if (c.length) { victim = G.pick(c); reason = G.pick(EXEC_REASONS); if (reason.includes('olhar')) reason = `por olhar torto para ${ruler.g === 'f' ? 'a tirana' : 'o tirano'}`; }
    }
    if (victim) { f.lastExec = S.day; P.execute(f, victim, reason); }
  }
  P.execute = function (f, victim, reason) {
    const S = G.S;
    if (!victim || f.exec || !S.villagers.has(victim.id)) return false;
    const cap = G.Fac.capitalOf(f.id); if (!cap) return false;
    const cf = S.buildings.get(cap.campfire);
    const x = cf ? cf.x + 0.5 : cap.cx, y = cf ? cf.y + 0.5 : cap.cy;
    f.exec = { v: victim.id, x, y, t: 0, reason: reason || '', set: cap.id };
    G.Vg.endTask(victim);
    G.Vg.setTask(victim, { type: 'condemned', pri: 6, x: x + 1.2, y: y + 0.7, kind: 'condemned' });
    for (const o of S.villagers.values()) if (o !== victim && o.set === cap.id && o.age >= 6 && G.dist(o.x, o.y, x, y) < 22) G.Vg.give(o, { type: 'assembly', x, y, pri: 1.9, kind: 'assembly' });
    G.UI && G.UI.notice(`${P.styled(f, P.ruler(f))} condenou ${victim.name} à morte ${reason}.`, 'massacre');
    return true;
  };
  function execTick(f, dt) {
    const e = f.exec; if (!e) return;
    const S = G.S; e.t += dt;
    const v = S.villagers.get(e.v);
    if (!v || !v.task || v.task.type !== 'condemned') { f.exec = null; return; }
    if (e.t < 15 && !(v.task.st === 2 && e.t > 9)) return;
    const ruler = P.ruler(f);
    f.exec = null;
    G.FX && G.FX.blood(v.x, v.y); G.FX && G.FX.blood(v.x, v.y);
    G.FX && G.FX.ring(v.x, v.y, 0.2, 2.2, 1, 'rgba(160,20,30,0.8)', 2);
    G.Audio && G.Audio.at(v.x, v.y, 'thud', true);
    const nm = v.name, g = v.g, set = S.settlements.get(e.set);
    G.Vg.damage(v, 999, 'execution', false, ruler ? ruler.id : 0);
    f.terror = Math.min(100, f.terror + 18); f.st.executions = (f.st.executions || 0) + 1;
    S.stats.executions = (S.stats.executions || 0) + 1;
    for (const o of S.villagers.values()) if (G.dist(o.x, o.y, e.x, e.y) < 12) { o.fear = Math.min(100, o.fear + 16); G.Vg.emote(o, 'fear', 2.5); }
    if (set) set.loyalty = Math.max(0, set.loyalty - 6);
    log(`Em ${set ? set.name : f.name}, ${nm} foi executad${g === 'f' ? 'a' : 'o'} por ordem de ${P.styled(f, ruler)} ${e.reason}.`, 'massacre', e.x, e.y);
    if (ruler) { P.bump(ruler, 'cru', 0.03); if (f.st.executions >= 3) P.earn(f, ruler, 'cruel'); }
    for (const o of S.villagers.values()) if (o.task && o.task.type === 'assembly') G.Vg.endTask(o);
  }

  // ------------------------------ secession ------------------------------
  function garrison(s, fid) { let n = 0; for (const v of G.S.villagers.values()) if (v.set === s.id && v.role === 'guerreiro' && !v.captive) n++; return n; }
  function checkSecession(f) {
    const S = G.S; const cap = G.Fac.capitalOf(f.id);
    for (const s of G.Fac.settlementsOf(f.id)) {
      if (s === cap) continue;
      s.lowT = s.loyalty < 24 ? (s.lowT || 0) + 10 : 0;
      if (s.conq && S.day - s.conq < 2.5) continue;
      if (s.lowT < 60) continue;
      const guards = garrison(s, f.id);
      if (guards >= 3 && G.R() < 0.7) continue;
      if (s.origFac && s.origFac !== f.id && s.loyalty < 18 && G.R() < 0.25) { const o = G.Fac.get(s.origFac); if (o && o.alive) { P.revert(s); return; } }
      if (freePopOfSet(s.id) < 7 || S.day - s.founded < 3) continue;
      if (G.R() < 0.04 + 0.18 * (24 - s.loyalty) / 24) { P.secede(s); return; }
    }
  }
  const SPLIT_NAMES = {
    grego: (s, l) => ['Pólis de ' + s, 'Liga de ' + s, 'Pólis Livre de ' + s],
    nordico: (s, l) => ['Jarlado de ' + s, 'Clã de ' + s, l ? 'Casa de ' + l : 'Clã de ' + s],
    egipcio: (s, l) => ['Reino de ' + s, l ? 'Casa de ' + l : 'Nomo de ' + s, 'Nomo de ' + s],
    asteca: (s, l) => ['Altepetl de ' + s, 'Senhorio de ' + s, l ? 'Casa de ' + l : 'Calpulli de ' + s],
    romano: (s, l) => ['República de ' + s, l ? 'Gens de ' + l : 'Colônia de ' + s, 'Colônia de ' + s],
  };
  P.nameFor = function (s, kind, lead, civ) {
    const used = new Set([...G.S.factions.values()].map(f => f.name));
    let opts = kind === 'livre'
      ? ['Povo Liberto', 'Irmandade Livre', 'Clã das Correntes Partidas', s ? 'Povo Livre de ' + s.name : 'Gente Sem Correntes']
      : [s ? 'Povo de ' + s.name : 'Povo Novo', lead ? 'Casa de ' + lead.name : 'Clã Novo', s ? 'Clã de ' + s.name : 'Clã Novo', s ? s.name + ' Livre' : 'Povo Livre'];
    const civOpts = kind !== 'livre' && civ && SPLIT_NAMES[civ] && s;
    if (civOpts) opts = SPLIT_NAMES[civ](s.name, lead && lead.name).concat(opts);
    const start = Math.floor(G.R() * (civOpts ? 3 : opts.length));
    for (let k = 0; k < opts.length; k++) { const n = opts[(start + k) % opts.length]; if (!used.has(n)) return n; }
    return opts[0] + ' ' + (G.S.nextId % 100);
  };
  P.secede = function (s, claimant, succession) {
    const S = G.S; const old = G.Fac.get(s.fac); if (!old) return null;
    const oldRuler = P.ruler(old);
    const nf = G.Fac.create({ parent: old.id, civ: old.civ, stock: { food: 0, wood: 0, stone: 0 } });
    if (old.tech) for (const k in old.tech.known) nf.tech.known[k] = old.tech.known[k];
    P.setupFaction(nf);
    let lead = claimant || null, bs = -1e9;
    if (!lead) for (const v of S.villagers.values()) if (v.set === s.id && !v.captive && v.age >= 18 && v.id !== old.leader) { const sc = prestige(v, nf) + P.persona(v).amb * 10; if (sc > bs) { bs = sc; lead = v; } }
    nf.name = P.nameFor(s, 'secessao', lead, old.civ);
    const share = freePopOfSet(s.id) / Math.max(1, G.Fac.pop(old.id));
    for (const k of ['food', 'wood', 'stone']) { const n = Math.floor(old.stock[k] * share); old.stock[k] -= n; nf.stock[k] += n; }
    s.fac = nf.id; nf.capital = s.id; s.loyalty = 75; s.conq = 0; s.origFac = 0;
    nf.era = G.Fac.eraOf(nf.id);
    nf.gov = old.gov === 'tirania' ? 'conselho' : 'tribo';
    const joined = [];
    const cap = G.Fac.capitalOf(old.id);
    for (const o of G.Fac.settlementsOf(old.id)) {
      if (!cap || o === cap) continue;
      if (o.loyalty < 32 && G.dist(o.cx, o.cy, s.cx, s.cy) < G.dist(o.cx, o.cy, cap.cx, cap.cy)) { o.fac = nf.id; o.loyalty = 60; joined.push(o.name); }
    }
    if (lead) P.crown(nf, lead, 'secessao', true);
    const r = G.Fac.rel(old.id, nf.id); r.met = S.day; r.op = -40; r.grudge = 45;
    for (const o of G.Fac.all()) {
      if (o.id === old.id || o.id === nf.id) continue;
      const ro = G.Fac.rel(old.id, o.id); if (!ro || !ro.met) continue;
      const rn = G.Fac.rel(nf.id, o.id); rn.met = S.day; rn.op = Math.round(ro.op * 0.5 + (ro.st === 'guerra' ? 20 : 0));
    }
    G.Fac.updateTerritory();
    S.stats.secessions = (S.stats.secessions || 0) + 1;
    old.st.lost++;
    log(`Racha em ${old.name}! ${s.name}${joined.length ? ' (com ' + joined.join(', ') + ')' : ''} declarou independência${lead ? ' sob ' + lead.name : ''} e agora é ${nf.name}.`, 'split', s.cx, s.cy);
    G.UI && G.UI.toast(succession ? 'Guerra de sucessão' : 'Racha!', `${s.name} rompeu com ${old.name}.`, 'split');
    G.Audio && G.Audio.play('horn');
    const po = P.persona(oldRuler);
    if (succession || po.agg > 0.5 || old.gov === 'tirania' || G.R() < 0.25) P.declareWar(old, nf, 'secessao');
    return nf;
  };
  P.revert = function (s) {
    const S = G.S; const back = G.Fac.get(s.origFac); const cur = G.Fac.get(s.fac);
    if (!back || !back.alive || !cur) { s.origFac = 0; return; }
    for (const v of S.villagers.values()) if (v.set === s.id && !v.captive && G.R() < 0.5 && v.role === 'guerreiro') { /* the garrison flees home */ const home = G.Fac.capitalOf(cur.id); if (home && home !== s) { v.set = home.id; v.home = 0; G.Vg.setTask(v, { type: 'migrate', pri: 1.6 }); } }
    s.fac = back.id; s.origFac = cur.id; s.conq = 0; s.loyalty = 65;
    log(`${s.name} se rebelou contra ${cur.name} e voltou para ${back.name}.`, 'split', s.cx, s.cy);
    G.UI && G.UI.notice(`${s.name} se libertou de ${cur.name}!`, 'split');
    cur.st.lost++;
    G.Fac.updateTerritory();
    if (!G.Fac.settlementsOf(cur.id).length) P.extinct(cur, back);
  };
  P.extinct = function (f, by) {
    const S = G.S; if (!f.alive) return;
    P.endReign(f, 'queda');
    f.alive = false; f.died = S.day; f.fate = by ? 'conquistad' + G.Fac.oa(f) + ' por ' + by.name : 'desapareceu';
    for (const o of S.factions.values()) { const r = o.rel[f.id]; if (r) { r.st = 'paz'; r.envoy = 0; } }
    G.War && G.War.onExtinct(f);
    S.stats.fallen = (S.stats.fallen || 0) + 1;
    log(`${f.name} deixou de existir${by ? ', conquistad' + G.Fac.oa(f) + ' por ' + by.name : ''}.`, 'massacre');
    G.UI && G.UI.toast('Um povo caiu', `${f.name} desapareceu da história.`, 'massacre');
    if (G.UI && G.UI.viewFac === f.id) G.UI.viewFac = by ? by.id : 0;
  };

  // the last few survivors of a broken people join a neighbour — or surrender to it
  function checkRemnant(f) {
    const S = G.S; const pop = G.Fac.pop(f.id);
    if (pop > 3) { f.remnantT = 0; return; }
    f.remnantT = (f.remnantT || 0) + 10;
    if (f.remnantT < 60) return;
    let best = null, bs = -1e9;
    const cap = G.Fac.capitalOf(f.id);
    for (const o of G.Fac.all()) {
      if (o.id === f.id) continue; const c = G.Fac.capitalOf(o.id); if (!c) continue;
      const r = G.Fac.rel(f.id, o.id); const sc = (r ? r.op : 0) - (cap ? G.dist(cap.cx, cap.cy, c.cx, c.cy) : 0) * 0.5;
      if (sc > bs) { bs = sc; best = o; }
    }
    if (!best) return;
    const dest = G.Fac.capitalOf(best.id); const r = G.Fac.rel(f.id, best.id);
    const enemy = r && r.st === 'guerra';
    const members = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === f.id);
    for (const v of members) {
      G.Vg.endTask(v);
      if (v.captive) { v.captive = null; v.role = null; }
      if (enemy && v.age >= 14) { G.War.enslave(v, f.id, v.set); }
      v.set = dest.id; v.home = 0;
      G.Vg.setTask(v, { type: 'migrate', pri: 1.6, kind: 'migrate' });
    }
    log(enemy ? `Os últimos de ${f.name} se renderam a ${best.name} e foram levados como cativos.` : `Os últimos de ${f.name} deixaram sua terra e foram acolhidos por ${best.name}.`, enemy ? 'chain' : 'settle', dest.cx, dest.cy);
    const sets = G.Fac.settlementsOf(f.id);
    P.extinct(f, enemy ? best : null);
    for (const s of sets) G.Village.abandon(s);
  }

  // ------------------------------ divine interventions ------------------------------
  P.anoint = function (v) {
    const S = G.S; const f = G.Fac.ofV(v); if (!f) return false;
    if (v.captive) { G.War && G.War.liberateAround(v.x, v.y, 6, 'ungido', v); return true; }
    if (v.age < 14) return false;
    if (f.leader === v.id) {
      f.legit = 100; for (const s of G.Fac.settlementsOf(f.id)) s.blessed = G.DAY_LEN;
      P.earn(f, v, 'ungido');
      log(`Você ungiu ${P.styled(f, v)}. Seu reinado agora é sagrado.`, 'crown', v.x, v.y);
      return true;
    }
    const old = P.ruler(f);
    if (old) { log(`Diante do sinal divino, ${P.styled(f, old)} entregou o poder.`, 'crown', old.x, old.y); P.endReign(f, 'deposto'); }
    endRevolution(f); f.coup = null;
    P.crown(f, v, 'ungido');
    for (const s of G.Fac.settlementsOf(f.id)) s.blessed = G.DAY_LEN * 0.6;
    return true;
  };
  P.discord = function (x, y) {
    const S = G.S; let s = null, bd = 1e9;
    for (const o of S.settlements.values()) { const d = G.dist(x, y, o.cx, o.cy); if (d < bd) { bd = d; s = o; } }
    if (!s || bd > 14) return false;
    const f = G.Fac.get(s.fac); if (!f) return false;
    s.discord = G.DAY_LEN * 0.8;
    s.loyalty = Math.max(0, s.loyalty - 35);
    f.legit = Math.max(0, f.legit - 25);
    for (const o of G.Fac.all()) { if (o.id === f.id) continue; const r = G.Fac.rel(f.id, o.id); if (r && r.met) { r.op -= 30; r.grudge = Math.min(100, r.grudge + 15); } }
    let amb = null; for (const v of S.villagers.values()) if (v.set === s.id && !v.captive && v.age >= 18 && v.age < 60 && v.id !== f.leader && (!amb || v.courage > amb.courage)) amb = v;
    if (amb) { P.bump(amb, 'amb', 0.5); }
    log(`Uma sombra de discórdia caiu sobre ${s.name}. Vizinhos se olham com desconfiança.`, 'split', s.cx, s.cy);
    return true;
  };
  P.divinePeace = function () {
    const S = G.S; let n = 0;
    S.divinePeace = G.DAY_LEN * 2.5;
    for (const a of G.Fac.all()) for (const b of G.Fac.all()) {
      if (a.id >= b.id) continue;
      const r = G.Fac.rel(a.id, b.id); if (!r) continue;
      if (r.st === 'guerra') { r.st = 'tregua'; r.truce = G.DAY_LEN * 2.5; r.since = S.day; r.envoy = 0; n++; }
      if (r.met) { r.op = Math.min(100, r.op + 20); r.grudge *= 0.5; }
    }
    G.War && G.War.disbandAll();
    for (const v of S.villagers.values()) if (v.task && (v.task.type === 'combat' || v.task.type === 'band') && !v.task.rebel) { G.Vg.endTask(v); G.Vg.emote(v, 'awe', 3); }
    log(n ? `Paz Divina: as armas caíram das mãos de todos. ${n} ${n > 1 ? 'guerras terminaram' : 'guerra terminou'}.` : 'Paz Divina: um silêncio sagrado cobre o mundo.', 'peace');
    return n;
  };

  // ------------------------------ diplomacy ------------------------------
  const REASON = {
    fome: 'a fome empurra seu povo contra os celeiros alheios', secessao: 'para esmagar os rebeldes', vinganca: 'para vingar seus mortos',
    fronteira: 'por disputas de fronteira', desconfianca: 'por pura desconfiança', divina: 'tomados por uma fúria divina', alianca: 'honrando uma aliança',
    vassalo: 'para romper as correntes da vassalagem', reconquista: 'para retomar uma cidade perdida',
    riqueza: 'pelas riquezas do vizinho', rota: 'para proteger suas caravanas',
  };
  P.alliesOf = fid => G.Fac.all().filter(o => o.id !== fid && G.Fac.rel(fid, o.id) && G.Fac.rel(fid, o.id).st === 'alianca');
  P.strength = function (fid) {
    let s = 0;
    for (const v of G.S.villagers.values()) { if (v.captive || v.age < 16 || v.age >= 62 || G.Fac.idOfV(v) !== fid) continue; s += (v.role === 'guerreiro' ? 1.7 : 0.7) * (0.4 + v.hp / 170); }
    if (G.Fac.has(fid, 'quartel')) s *= 1.15;
    return s;
  };
  P.declareWar = function (a, b, reason) {
    const S = G.S; const r = G.Fac.rel(a.id, b.id); if (!r || r.st === 'guerra' || !a.alive || !b.alive) return;
    r.st = 'guerra'; r.since = S.day; r.by = a.id; r.met = r.met || S.day; r.truce = 0; r.envoy = 0;
    r.op = Math.min(r.op, -30);
    a.attackCD = G.rr(20, 50); b.attackCD = Math.max(b.attackCD || 0, G.rr(50, 110));
    const why = reason === 'ambicao' ? `pela ambição de ${P.styled(a, P.ruler(a))}` : (reason === 'riqueza' || reason === 'rota') && G.Trade && G.Trade._why ? G.Trade._why : REASON[reason] || '';
    if (reason === 'riqueza' || reason === 'rota') { r.riches = G.Trade && G.Trade._why; G.Stories && G.Stories.signal('richesWar', { a: a.id, b: b.id, why: r.riches, reason, k: G.Trade && G.Trade._whyK || '' }); }
    const cb = G.Fac.capitalOf(b.id);
    log(`${a.name} declarou guerra a ${b.name}${why ? ' — ' + why : ''}.`, 'war', cb ? cb.cx : undefined, cb ? cb.cy : undefined);
    if (!S.milestones.firstWar) { G.Village.milestone('firstWar', 'A primeira guerra', `${a.name} contra ${b.name}.`, 'war'); }
    else G.UI && G.UI.toast('Guerra!', `${a.name} contra ${b.name}.`, 'war');
    G.Audio && G.Audio.play('horn');
    S.stats.wars = (S.stats.wars || 0) + 1;
    for (const c of P.alliesOf(b.id)) {
      if (c.id === a.id || G.Fac.atWar(c.id, a.id)) continue;
      const rc = G.Fac.rel(c.id, a.id); if (rc && rc.op > 40) continue;
      log(`${c.name} honrou a aliança e entrou na guerra ao lado de ${b.name}.`, 'ally');
      P.declareWar(c, a, 'alianca');
    }
    G.War && G.War.onWar(a, b);
  };
  function considerWar(a, b, r, str) {
    const S = G.S;
    if (r.st !== 'paz' || !r.met || r.envoy) return;
    const minDay = S.temper === 'pacifico' ? 20 : S.temper === 'belicoso' ? 6 : 12;
    if (S.day < minDay || S.day - r.met < 1 || S.divinePeace > 0) return;
    const pa = P.leaderPe(a); const popA = G.Fac.pop(a.id);
    if (popA < 10 || !P.ruler(a)) return;
    const ratio = str.get(a.id) / Math.max(1, str.get(b.id));
    let want = -r.op / 100 + pa.agg * 0.55 + G.clamp(ratio - 1, -0.5, 1) * 0.3 + r.grudge / 140 - a.weariness / 120;
    if (a.gov === 'tirania') want += 0.15;
    want += pa.amb * 0.25;
    // crowded peoples look at their neighbours' land
    const sets = G.Fac.settlementsOf(a.id).length;
    if (popA > sets * 32) want += 0.15;
    // a small people cannot spare its few grown men: it fights only for a strong reason
    if (popA < 40) want -= (40 - popA) / 40 * 0.4;
    if (b.stock.food > a.stock.food * 2 && b.stock.food > 150) want += 0.08;
    const hungry = a.stock.food < popA * 0.45 && b.stock.food > 50;
    if (hungry) want += 0.3;
    const touch = G.Fac.touch[key(a.id, b.id)] || 0; if (touch > 3) want += Math.min(0.2, touch * 0.02);
    const rebels = b.parent === a.id && S.day - b.founded < 5;
    if (rebels) want += 0.25;
    want -= P.alliesOf(b.id).length * 0.12;
    const lean = G.Stories ? G.Stories.warLean(a, b) : null; if (lean) want += lean.w;
    // the coffee fields, the ivory, the silk of a neighbour this people buys and cannot make
    const cov = G.Trade ? G.Trade.covet(a, b) : null; if (cov) want += cov.w;
    const th = S.temper === 'pacifico' ? 1.2 : S.temper === 'belicoso' ? 0.68 : 0.86;
    if (want > th && G.R() < 0.3) { if (lean && G.Stories) G.Stories._leanStory = lean.story; if (cov && G.Trade) G.Trade._why = cov.why; P.declareWar(a, b, lean ? 'reconquista' : cov && cov.w >= 0.12 ? 'riqueza' : hungry ? 'fome' : rebels ? 'secessao' : r.grudge > 40 ? 'vinganca' : touch > 3 ? 'fronteira' : pa.agg > 0.68 ? 'ambicao' : 'desconfianca'); }
  }
  function considerPeace(a, b, r) {
    const S = G.S;
    if (r.st !== 'guerra' || r.envoy) return;
    if (G.WorldWar && G.WorldWar.locks(a.id, b.id)) return; // the world war: no separate peace yet
    const days = S.day - r.since; if (days < 1 || (r.peaceCD || 0) > S.day) return;
    const [asker, other] = a.weariness >= b.weariness ? [a, b] : [b, a];
    if (asker.weariness < 38 && days < 5) return;
    if (G.R() > 0.35) return;
    P.sendEnvoy(asker, other, 'paz');
  }
  function answerPeace(from, to, r) {
    const S = G.S; const pt = P.leaderPe(to);
    if (G.WorldWar && G.WorldWar.locks(from.id, to.id)) { r.peaceCD = S.day + 3; return false; }
    const sf = P.strength(from.id), st = P.strength(to.id);
    const winning = st > sf * 1.25;
    const score = to.weariness / 100 + (1 - pt.agg) * 0.5 + (winning ? 0.1 : 0.35) + (S.day - r.since) * 0.05 - r.grudge / 200 + (S.divinePeace > 0 ? 1 : 0);
    const cb = G.Fac.capitalOf(to.id);
    if (score < 0.72) { r.peaceCD = S.day + 2 + G.R() * 2; log(`${P.styled(to, P.ruler(to))} recusou a paz oferecida por ${from.name}.`, 'war', cb ? cb.cx : undefined, cb ? cb.cy : undefined); r.op -= 5; return false; }
    let terms = 'sem vencedores';
    if (winning) {
      const food = Math.floor(Math.min(from.stock.food * 0.45, 70)), stone = Math.floor(Math.min(from.stock.stone * 0.4, 30));
      from.stock.food -= food; from.stock.stone -= stone;
      G.Village.addStock('food', food, to.id); G.Village.addStock('stone', stone, to.id);
      terms = food + stone > 0 ? `${from.name} pagou tributo de ${food} comida${stone ? ' e ' + stone + ' pedra' : ''}` : terms;
      if (sf < st * 0.5 && from.st.lost > 0) { r.st = 'vassalo'; r.over = to.id; terms += ` e tornou-se vassalo de ${to.name}`; }
    }
    if (r.st !== 'vassalo') { r.st = 'tregua'; r.truce = G.DAY_LEN * 3; }
    r.since = S.day; r.envoy = 0; r.grudge *= 0.7;
    from.weariness *= 0.5; to.weariness *= 0.5;
    log(`Paz entre ${from.name} e ${to.name}: ${terms}.`, 'peace', cb ? cb.cx : undefined, cb ? cb.cy : undefined);
    G.UI && G.UI.toast('Paz', `${from.name} e ${to.name} baixaram as armas.`, 'peace');
    G.War && G.War.onPeace(from, to);
    if (pt.agg < 0.35) P.earn(to, P.ruler(to), 'pacifico');
    return true;
  }
  function considerAlliance(a, b, r) {
    if (r.envoy) return;
    if (r.st === 'alianca' && r.op < 5 && !(G.WorldWar && G.WorldWar.sameBloc(a.id, b.id))) { r.st = 'paz'; log(`A aliança entre ${a.name} e ${b.name} se desfez.`, 'split'); return; }
    if (r.st !== 'paz' || r.op < 55 || G.R() > 0.12) return;
    if (P.leaderPe(a).agg > 0.85) return;
    P.sendEnvoy(a, b, 'alianca');
  }
  function answerAlliance(from, to, r) {
    if (r.op < 45 || P.leaderPe(to).agg > 0.85) { log(`${to.name} recusou a aliança com ${from.name}.`, 'envoy'); return false; }
    r.st = 'alianca'; r.since = G.S.day; r.friend = Math.min(100, r.friend + 30);
    log(`${from.name} e ${to.name} selaram uma aliança.`, 'ally');
    G.UI && G.UI.toast('Aliança', `${from.name} e ${to.name} agora são aliados.`, 'ally');
    royalMarriage(from, to, r);
    return true;
  }
  function royalMarriage(a, b, r) {
    const S = G.S; const ra = P.ruler(a), rb = P.ruler(b); if (!ra || !rb) return;
    const single = (ruler, f) => (ruler.kids || []).map(id => S.villagers.get(id)).filter(v => v && !v.partner && !v.captive && v.age >= 17 && v.age <= 42 && G.Fac.idOfV(v) === f.id);
    const ka = single(ra, a), kb = single(rb, b);
    for (const x of ka) for (const y of kb) {
      if (x.g === y.g) continue;
      const [stay, move, mf] = P.strength(a.id) >= P.strength(b.id) ? [x, y, a] : [y, x, b];
      const dest = S.settlements.get(stay.set);
      move.set = stay.set; move.home = 0; G.Vg.endTask(move); G.Vg.setTask(move, { type: 'migrate', pri: 1.6 });
      move.partner = stay.id; stay.partner = move.id; move.widow = 0; stay.widow = 0;
      r.marr = (r.marr || 0) + 2; r.friend = Math.min(100, r.friend + 20);
      log(`Casamento real: ${x.name}, de ${a.name}, uniu-se a ${y.name}, de ${b.name}. ${move.name} foi viver em ${dest ? dest.name : mf.name}.`, 'heart', dest ? dest.cx : undefined, dest ? dest.cy : undefined);
      return;
    }
  }
  P.sendEnvoy = function (from, to, msg) {
    const S = G.S; const r = G.Fac.rel(from.id, to.id); if (!r) return;
    const cap = G.Fac.capitalOf(from.id), dest = G.Fac.capitalOf(to.id);
    if (!cap || !dest) return;
    let best = null, bs = -1e9;
    for (const v of S.villagers.values()) {
      if (v.set !== cap.id || v.captive || v.age < 18 || v.age > 60 || v.id === from.leader || v.hp < 50) continue;
      if (v.task && v.task.pri >= 3) continue;
      const s = (v.traits.includes('Sociável') ? 3 : 0) + (v.role === 'guerreiro' ? -2 : 0) + G.R();
      if (s > bs) { bs = s; best = v; }
    }
    if (!best) { P.deliver(from, to, msg, null); return; }
    r.envoy = best.id; r.envoyDay = S.day;
    G.Vg.endTask(best);
    G.Vg.setTask(best, { type: 'envoy', to: to.id, from: from.id, msg, pri: 3.1, kind: 'envoy' });
    const txt = { paz: 'levando uma proposta de paz', alianca: 'propondo uma aliança', contato: 'levando presentes' }[msg] || '';
    if (msg !== 'contato') G.UI && G.UI.notice(`Um emissário de ${from.name} partiu para ${to.name}, ${txt}.`, 'envoy');
  };
  // the envoy arrived (or there was nobody to send): the message is delivered
  P.deliver = function (from, to, msg, envoy) {
    const S = G.S; const r = G.Fac.rel(from.id, to.id); if (!r || !from.alive || !to.alive) return;
    r.envoy = 0;
    const pt = P.leaderPe(to); const cb = G.Fac.capitalOf(to.id);
    if (envoy && msg !== 'contato' && pt.cru > 0.75 && r.op < -35 && G.R() < 0.6) {
      const ruler = P.ruler(to);
      log(`O emissário ${envoy.name}, de ${from.name}, foi executado por ordem de ${P.styled(to, ruler)}.`, 'massacre', envoy.x, envoy.y);
      G.FX && G.FX.blood(envoy.x, envoy.y);
      G.Vg.damage(envoy, 999, 'execution', false, ruler ? ruler.id : 0);
      r.grudge = Math.min(100, r.grudge + 30); r.op -= 20;
      if (r.st !== 'guerra') P.declareWar(from, to, 'vinganca');
      return;
    }
    if (msg === 'contato') {
      const gift = Math.floor(Math.min(12, from.stock.food * 0.15));
      from.stock.food -= gift; G.Village.addStock('food', gift, to.id);
      r.op = Math.min(100, r.op + 12); r.friend = Math.min(100, r.friend + 10);
      log(`Um emissário de ${from.name} trouxe presentes para ${to.name}${gift ? ' (' + gift + ' de comida)' : ''}.`, 'envoy', cb ? cb.cx : undefined, cb ? cb.cy : undefined);
    } else if (msg === 'paz') { if (r.st === 'guerra') answerPeace(from, to, r); }
    else if (msg === 'alianca') { if (r.st === 'paz') answerAlliance(from, to, r); }
  };
  function considerTrade(a, b, r) {
    const S = G.S;
    if (!(r.st === 'paz' || r.st === 'alianca' || r.st === 'vassalo') || r.op < -15 || r.envoy) return;
    if ((r.tradeDay || 0) > S.day) return;
    if (G.Fac.pop(a.id) < 10) return;
    const capA = G.Village.cap(a.id);
    const give = ['food', 'wood', 'stone'].find(k => a.stock[k] > Math.max(50, capA * 0.55) && b.stock[k] < 40);
    if (!give) return;
    const want = ['food', 'wood', 'stone'].filter(k => k !== give).sort((x, y) => b.stock[y] - b.stock[x])[0];
    if (!want || b.stock[want] < 25) return;
    if (G.R() > 0.4) return;
    const cap = G.Fac.capitalOf(a.id), dest = G.Fac.capitalOf(b.id); if (!cap || !dest) return;
    let tr = null;
    for (const v of S.villagers.values()) if (v.set === cap.id && !v.captive && v.age >= 18 && v.age < 55 && v.id !== a.leader && v.role !== 'guerreiro' && (!v.task || v.task.pri < 2) && !v.carry) { tr = v; if (!v.partner) break; }
    if (!tr) return;
    r.tradeDay = S.day + 1 + G.R();
    const n = Math.min(14, Math.floor(a.stock[give] * 0.2));
    if (n < 4) return;
    a.stock[give] -= n;
    G.Vg.endTask(tr);
    tr.carry = { k: give, n };
    G.Vg.setTask(tr, { type: 'trade', to: b.id, from: a.id, give, n, want, pri: 1.8, kind: 'trade' });
  }
  P.tradeArrive = function (v, t) {
    const S = G.S; const a = G.Fac.get(t.from), b = G.Fac.get(t.to); if (!a || !b || !b.alive) return false;
    const r = G.Fac.rel(a.id, b.id); if (!r || r.st === 'guerra') return false;
    if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, b.id); v.carry = null; }
    // merchant peoples and coinage get better deals
    const deal = 1.1 * G.Civ.t(a.id, 'trade') * (G.Civ.has(a.id, 'moeda') ? 1.2 : 1);
    const m = Math.min(Math.floor(t.n * deal), Math.floor(b.stock[t.want] * 0.35));
    if (m > 0) { b.stock[t.want] -= m; v.carry = { k: t.want, n: m }; }
    r.op = Math.min(100, r.op + 5); r.friend = Math.min(100, r.friend + 4); r.trade = (r.trade || 0) + 1;
    const MAT = { food: 'comida', wood: 'madeira', stone: 'pedra' };
    if (r.trade <= 1 || G.R() < 0.25) log(`Uma caravana de ${a.name} trocou ${MAT[t.give]} por ${MAT[t.want]} com ${b.name}.`, 'trade', v.x, v.y);
    if (!S.milestones.firstTrade) G.Village.milestone('firstTrade', 'Comércio', `${a.name} e ${b.name} começaram a negociar.`, 'trade');
    // love across borders
    if (!v.partner && v.age >= 17 && v.age <= 45 && G.R() < 0.3) {
      let o = null; for (const x of S.villagers.values()) if (x.set === G.Fac.capitalOf(b.id)?.id && !x.partner && !x.captive && x.g !== v.g && x.age >= 17 && x.age <= 45 && Math.abs(x.age - v.age) < 14 && x.id !== b.leader) { o = x; break; }
      if (o) {
        if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, b.id); v.carry = null; }
        v.partner = o.id; o.partner = v.id; v.widow = 0; o.widow = 0; v.set = o.set; v.home = 0;
        r.marr = (r.marr || 0) + 1; r.op = Math.min(100, r.op + 8);
        G.FX && G.FX.hearts(v.x, v.y);
        log(`O amor atravessou fronteiras: ${v.name}, mercador${v.g === 'f' ? 'a' : ''} de ${a.name}, casou-se com ${o.name} e ficou em ${b.name}.`, 'heart', v.x, v.y);
        return 'stay';
      }
    }
    return true;
  };
  function skirmish(a, b, r) {
    if (r.st !== 'paz' || r.op > -30 || !(G.Fac.touch[key(a.id, b.id)] > 0) || G.R() > 0.1) return;
    const S = G.S; let pa = null, pb = null, bd = 64;
    for (const x of S.villagers.values()) {
      if (x.captive || x.age < 16 || x.age >= 60 || G.Fac.idOfV(x) !== a.id || (x.task && x.task.pri >= 2)) continue;
      for (const y of S.villagers.values()) {
        if (y.captive || y.age < 16 || y.age >= 60 || G.Fac.idOfV(y) !== b.id || (y.task && y.task.pri >= 2)) continue;
        const d = G.dist2(x.x, x.y, y.x, y.y); if (d < bd) { bd = d; pa = x; pb = y; }
      }
    }
    if (!pa) return;
    G.Vg.setTask(pa, { type: 'combat', id: pb.id, pri: 4, skirmish: true, any: true, kind: 'combat' });
    G.Vg.setTask(pb, { type: 'combat', id: pa.id, pri: 4, skirmish: true, any: true, kind: 'combat' });
    G.Vg.emote(pa, 'angry', 2.5); G.Vg.emote(pb, 'angry', 2.5);
    r.grudge = Math.min(100, r.grudge + 6);
    log(`Escaramuça na fronteira: ${pa.name}, de ${a.name}, e ${pb.name}, de ${b.name}, se atracaram.`, 'war', pa.x, pa.y);
  }
  function vassalTick(a, b, r) {
    if (r.st !== 'vassalo') return;
    const over = G.Fac.get(r.over); const vas = over === a ? b : a; if (!over || !vas) return;
    for (const k of ['food', 'stone']) { const n = Math.floor(vas.stock[k] * 0.1); if (n > 0) { vas.stock[k] -= n; G.Village.addStock(k, n, over.id); } }
    const pv = P.leaderPe(vas);
    if (P.strength(vas.id) > P.strength(over.id) * 0.9 && pv.agg > 0.45 && G.R() < 0.35) { r.st = 'paz'; r.over = 0; P.declareWar(vas, over, 'vassalo'); }
  }

  // ------------------------------ contact & opinion ------------------------------
  P.meet = function (a, b) {
    const S = G.S; const r = G.Fac.rel(a.id, b.id); if (!r || r.met) return;
    r.met = S.day;
    const pa = P.leaderPe(a), pb = P.leaderPe(b);
    r.op = Math.round(15 - (pa.agg + pb.agg) * 18 + G.rr(-10, 10));
    const ca = G.Fac.capitalOf(a.id), cb = G.Fac.capitalOf(b.id);
    const mx = ca && cb ? (ca.cx + cb.cx) / 2 : undefined, my = ca && cb ? (ca.cy + cb.cy) / 2 : undefined;
    log(`${a.name} e ${b.name} se encontraram pela primeira vez.`, 'eye', mx, my);
    if (!S.milestones.contact) G.Village.milestone('contact', 'Primeiro contato', `${a.name} descobriu que não está só.`, 'eye');
    else G.UI && G.UI.notice(`${a.name} encontrou ${b.name}.`, 'eye');
    const giver = pa.agg <= pb.agg ? a : b;
    if (P.persona(P.ruler(giver)).agg < 0.6 && !r.gifted) { r.gifted = 1; P.sendEnvoy(giver, giver === a ? b : a, 'contato'); }
  };
  function checkContact() {
    const S = G.S; const fs = G.Fac.all();
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j]; const r = G.Fac.rel(a.id, b.id); if (!r || r.met) continue;
      let met = (G.Fac.touch[key(a.id, b.id)] || 0) > 0;
      if (!met) for (const s of G.Fac.settlementsOf(a.id)) for (const o of G.Fac.settlementsOf(b.id)) { const d = G.dist(s.cx, s.cy, o.cx, o.cy); if (d < (s.radius || 8) + (o.radius || 8) + (G.W.sameLand(s.cx, s.cy, o.cx, o.cy) ? 8 : -4)) met = true; }
      if (!met && G.Fac.terrFac) for (const v of S.villagers.values()) {
        const fv = G.Fac.idOfV(v); if (fv !== a.id && fv !== b.id) continue;
        const o = G.Fac.ownerAt(v.x | 0, v.y | 0); if (o && o !== fv && (o === a.id || o === b.id)) { met = true; break; }
      }
      if (met) P.meet(a, b);
    }
  }
  function opinionTarget(a, b, r) {
    let t = r.friend - r.grudge - 6;
    t -= Math.min(25, (G.Fac.touch[key(a.id, b.id)] || 0) * 0.6);
    const la = P.leaderPe(a), lb = P.leaderPe(b);
    t -= (la.agg + lb.agg - 0.9) * 20;
    if ((a.gov === 'tirania') !== (b.gov === 'tirania')) t -= 10;
    if (a.gov === 'teocracia' && b.gov === 'teocracia') t += 8;
    if (a.parent === b.id || b.parent === a.id) t -= 10;
    t += Math.min(25, (r.trade || 0) * 3) + Math.min(20, (r.marr || 0) * 7);
    if (r.st === 'alianca') t += 15;
    for (const e of G.Fac.enemiesOf(a.id)) if (G.Fac.atWar(b.id, e.id)) { t += 20; break; }
    const caps = G.War ? G.War.captivesBetween(a.id, b.id) : 0;
    t -= Math.min(30, caps * 3);
    return G.clamp(t, -100, 100);
  }
  function drift(dt) {
    const fs = G.Fac.all();
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j]; const r = G.Fac.rel(a.id, b.id); if (!r || !r.met) continue;
      r.grudge = Math.max(0, r.grudge - dt * 0.06);
      r.friend = Math.max(0, r.friend - dt * 0.04);
      r.trade = Math.max(0, (r.trade || 0) - dt * 0.0015);
      r.op += (opinionTarget(a, b, r) - r.op) * Math.min(1, dt * 0.012);
      r.op = G.clamp(r.op, -100, 100);
      if (r.st === 'tregua') { r.truce -= dt; if (r.truce <= 0) { r.st = 'paz'; log(`A trégua entre ${a.name} e ${b.name} terminou.`, 'peace'); } }
      if (r.envoy && G.S.day - (r.envoyDay || 0) > 2) r.envoy = 0;
    }
  }
  function decisions() {
    const fs = G.Fac.all(); if (fs.length < 2) return;
    const str = new Map(fs.map(f => [f.id, P.strength(f.id)]));
    for (const a of fs) for (const b of fs) {
      if (a === b) continue;
      const r = G.Fac.rel(a.id, b.id); if (!r || !r.met) continue;
      considerWar(a, b, r, str);
      considerTrade(a, b, r);
      if (a.id < b.id) { considerPeace(a, b, r); considerAlliance(a, b, r); skirmish(a, b, r); }
    }
  }
  P.onNewDay = function () {
    const fs = G.Fac.all();
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) { const r = G.Fac.rel(fs[i].id, fs[j].id); if (r) vassalTick(fs[i], fs[j], r); }
    for (const f of fs) {
      const v = P.ruler(f); if (!v) continue;
      const r = f.rulers[f.rulers.length - 1]; const len = r ? G.S.day - r.from : 0;
      if (f.era >= 6 && len >= 10 && G.Fac.pop(f.id) >= 90 && !f.hadGreat) { f.hadGreat = 1; P.earn(f, v, 'grande'); }
      if (f.gov === 'teocracia' && len >= 4) P.earn(f, v, 'pio');
      if (len >= 12 && P.persona(v).cru < 0.3) P.earn(f, v, 'justo');
    }
  };

  // ------------------------------ extra buildings for the planner ------------------------------
  P.planExtra = function (set, fac, c, want, pop) {
    const S = G.S; const isCap = G.Fac.capitalOf(fac.id) === set;
    const pe = P.leaderPe(fac);
    const atWar = G.Fac.enemiesOf(fac.id).length > 0;
    const metAny = G.Fac.all().some(o => o.id !== fac.id && G.Fac.rel(fac.id, o.id) && G.Fac.rel(fac.id, o.id).met);
    const allPop = G.Fac.pop(fac.id);
    if (isCap && !c.quartel && metAny && fac.era >= 2 && allPop >= 20 && (atWar || pe.agg > 0.55 || fac.gov === 'tirania' || fac.st.battles > 0) && !G.Fac.has(fac.id, 'quartel')) want[atWar ? 'unshift' : 'push']('quartel');
    if (metAny && (atWar || fac.st.battles > 0 || fac.st.lost > 0) && (c.torre || 0) < 1 + Math.floor(pop / 26) && pop >= 10 && fac.stock.stone >= 8 && !(c.siteTypes && c.siteTypes.torre)) want[atWar ? 'unshift' : 'push']('torre');
    let caps = 0; for (const v of S.villagers.values()) if (v.captive && v.set === set.id) caps++;
    if (caps >= 3 && !c.cercado && !(c.siteTypes && c.siteTypes.cercado)) want.push('cercado');
  };

  // ------------------------------ update ------------------------------
  let t1 = 0, t3 = 0, t10 = 0;
  P.update = function (dt) {
    const S = G.S; if (!S) return;
    if (S.divinePeace > 0) S.divinePeace -= dt;
    t1 += dt; t3 += dt; t10 += dt;
    if (t1 >= 1) {
      const d = t1; t1 = 0;
      for (const f of G.Fac.all()) { P.setupFaction(f); ensureLeader(f); updateLoyalty(f, d); coupTick(f, d); revTick(f, d); execTick(f, d); f.atWarN = G.Fac.enemiesOf(f.id).length; }
    }
    if (t3 >= 3) { const d = t3; t3 = 0; checkContact(); drift(d); }
    if (t10 >= 10) {
      t10 = 0;
      decisions();
      for (const f of G.Fac.all()) { P.checkGov(f, false); checkSecession(f); if (!f.alive) continue; checkCoup(f); checkRevolution(f); checkTyranny(f); if (G.Fac.all().length > 1) checkRemnant(f); }
    }
  };
})(window.G);
