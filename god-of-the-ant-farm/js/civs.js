'use strict';
// ============================================================
//  Civilizations: Greeks, Norse, Egyptians, Aztecs, Romans.
//  Names, colours, look, historical traits that change the
//  simulation, government titles, units, buildings and myths.
// ============================================================
(function (G) {
  const C = G.Civ = {};

  G.CIVS = {
    grego: {
      id: 'grego', name: 'Gregos', sing: ['Grego', 'Grega'], adj: 'grega', colors: [1, 9, 7, 4],
      blurb: 'Pólis orgulhosas, navegadores e filósofos. Pesquisam rápido e colonizam o mar — mas suas cidades adoram ser independentes.',
      peoples: ['Pólis de Argos', 'Liga de Tebas', 'Pólis de Corinto', 'Liga de Delos', 'Pólis de Mileto', 'Pólis de Esparta', 'Liga Aqueia', 'Pólis de Rodes'],
      cities: ['Argos', 'Delfos', 'Tebas', 'Corinto', 'Mileto', 'Olímpia', 'Elêusis', 'Siracusa', 'Rodes', 'Naxos', 'Pilos', 'Ítaca', 'Cnossos', 'Mégara', 'Éfeso', 'Samos', 'Lesbos', 'Micenas', 'Atenas', 'Esmirna', 'Tirinto', 'Dodona'],
      namesF: ['Ariadne', 'Helena', 'Cassandra', 'Penélope', 'Dafne', 'Ismênia', 'Alcmena', 'Xântipe', 'Teodora', 'Calista', 'Zoé', 'Irene', 'Melina', 'Níobe', 'Safo', 'Electra', 'Hipátia', 'Aspásia', 'Clio', 'Talia', 'Febe', 'Lêda'],
      namesM: ['Leônidas', 'Aquiles', 'Heitor', 'Temístocles', 'Péricles', 'Sólon', 'Tales', 'Nikos', 'Dimitri', 'Alexios', 'Ícaro', 'Teseu', 'Jasão', 'Castor', 'Egeu', 'Timeu', 'Ájax', 'Nestor', 'Creonte', 'Dion', 'Filipe', 'Heráclito'],
      skin: ['#efcfae', '#e2b690', '#d3a077', '#c08a5e'], hair: ['#2b1d14', '#3a2618', '#4a3020', '#171210', '#6e4a2c'],
      cloth: '#efe9dc', trim: '#3f6fb0',
      traits: { research: 1.3, naval: 1.2, trade: 1.15, faith: 1.05, farm: 0.95, distLoyal: 1.35, armor: 0.9, colonize: 1.4 },
      persona: { agg: 0, cru: -0.05, pie: 0.05, amb: 0.08 },
      techOrder: ['navegacao', 'escrita', 'bronze', 'filosofia', 'moeda', 'alvenaria', 'arco', 'roda', 'engenharia', 'ferro'],
      techCost: { filosofia: 0.55, navegacao: 0.7, escrita: 0.85 },
      gov: {
        tribo: ['Tribo', 'Chefe', 'Chefe'], chefia: ['Chefia', 'Basileu', 'Basilissa'], reino: ['Reino', 'Rei', 'Rainha'], imperio: ['Hegemonia', 'Hegemon', 'Hegemon'],
        teocracia: ['Oráculo', 'Hierofante', 'Pítia'], tirania: ['Tirania', 'Tirano', 'Tirana'], conselho: ['Democracia', 'Arconte', 'Arconte'],
      },
      units: { guerreiro: ['Hoplita', 'Hoplita'], arqueiro: ['Arqueiro', 'Arqueira'], elite: 'Falange', ship: 'Trirreme', trader: 'Nau mercante' },
      bnames: { quarteirao: 'Bairro de Casas de Pátio', praca: 'Ágora', teatro: 'Teatro', biblioteca: 'Academia', palacio: 'Palácio', maravilha: 'Acrópole', monument: 'Estátua do Deus', temple: 'Templo', quartel: 'Ginásio Militar', banhos: 'Banhos', mercado: 'Empório', aqueduto: 'Aqueduto', celeiro: 'Celeiro', sobrado: 'Casa de Pátio', insula: 'Casa Grande', doca: 'Porto' },
      god: ['o Pai do Céu Sem Nome', 'Aquele que Habita o Éter', 'o Olímpico Oculto'],
      chronicler: 'os aedos',
    },
    nordico: {
      id: 'nordico', name: 'Nórdicos', sing: ['Nórdico', 'Nórdica'], adj: 'nórdica', colors: [2, 10, 11, 7],
      blurb: 'Clãs do norte: navegadores temíveis, caçadores e pescadores. Saqueiam costas em barcos-dragão e lutam sem medo.',
      peoples: ['Clã de Hrafn', 'Jarlado de Skagi', 'Clã de Ymir', 'Filhos de Skaldi', 'Jarlado de Hedeby', 'Clã do Lobo Cinzento', 'Jarlado de Birka', 'Clã de Uppsala'],
      cities: ['Hedeby', 'Birka', 'Uppsala', 'Kaupang', 'Ribe', 'Jelling', 'Trondheim', 'Skagen', 'Lindholm', 'Gotland', 'Roskilde', 'Vestfold', 'Hlaðir', 'Sigtuna', 'Vik', 'Tunsberg', 'Aros', 'Borg'],
      namesF: ['Astrid', 'Sigrid', 'Freydis', 'Ingrid', 'Gudrun', 'Thyra', 'Helga', 'Ragnhild', 'Solveig', 'Brynhild', 'Liv', 'Runa', 'Eir', 'Aslaug', 'Hilda', 'Signy', 'Tove', 'Frida'],
      namesM: ['Bjorn', 'Ragnar', 'Erik', 'Leif', 'Ivar', 'Harald', 'Ulf', 'Sven', 'Olaf', 'Gunnar', 'Halfdan', 'Torvald', 'Sigurd', 'Knut', 'Egil', 'Hakon', 'Orm', 'Rollo', 'Arne', 'Snorri'],
      skin: ['#f6dcc6', '#efcfb4', '#e8c3a4', '#dcb391'], hair: ['#d9b26a', '#c79a4a', '#a8652e', '#8c3a1d', '#e8d49a', '#6e4a2c'],
      cloth: '#7a6a5a', trim: '#b33a2a',
      traits: { naval: 1.5, fish: 1.3, hunt: 1.25, farm: 0.82, war: 1.15, courage: 0.15, raid: 1.6, research: 0.85, expansion: 1.2, colonize: 1.5 },
      persona: { agg: 0.1, cru: 0.04, pie: -0.05, amb: 0.05 },
      techOrder: ['navegacao', 'arco', 'bronze', 'ferro', 'roda', 'alvenaria', 'escrita', 'moeda', 'engenharia', 'filosofia'],
      techCost: { navegacao: 0.45, ferro: 0.7, arco: 0.8 },
      startTech: ['navegacao'],
      gov: {
        tribo: ['Clã', 'Chefe', 'Chefe'], chefia: ['Jarlado', 'Jarl', 'Jarla'], reino: ['Reino', 'Rei', 'Rainha'], imperio: ['Grande Reino', 'Alto-Rei', 'Alta-Rainha'],
        teocracia: ['Godord', 'Gode', 'Gídia'], tirania: ['Tirania', 'Tirano', 'Tirana'], conselho: ['Thing', 'Falador da Lei', 'Faladora da Lei'],
      },
      units: { guerreiro: ['Huscarl', 'Donzela do Escudo'], arqueiro: ['Arqueiro', 'Arqueira'], elite: 'Berserker', ship: 'Barco-dragão', trader: 'Knarr' },
      bnames: { quarteirao: 'Salões do Clã', praca: 'Thing', teatro: 'Salão do Hidromel', biblioteca: 'Casa dos Escaldos', palacio: 'Salão do Jarl', maravilha: 'Salão de Valhala', monument: 'Pedra Rúnica', temple: 'Templo de Madeira', quartel: 'Salão dos Guerreiros', banhos: 'Sauna', mercado: 'Feira', aqueduto: 'Canal', celeiro: 'Silo', house: 'Casa Longa', sobrado: 'Casa Longa Grande', insula: 'Salão de Família', doca: 'Estaleiro' },
      god: ['Aquele-que-Observa', 'o Pai das Tempestades', 'o Viajante do Céu'],
      chronicler: 'os escaldos',
    },
    egipcio: {
      id: 'egipcio', name: 'Egípcios', sing: ['Egípcio', 'Egípcia'], adj: 'egípcia', colors: [0, 4, 9, 11],
      blurb: 'Filhos do rio. Colheitas fartas junto à água, fé profunda, faraós venerados e obras de pedra que desafiam o tempo.',
      peoples: ['Casa de Amon', 'Reino do Nilo Alto', 'Casa de Rá', 'Reino de Mênfis', 'Casa de Ptá', 'Reino de Tebas', 'Casa de Hórus', 'Reino de Saís'],
      cities: ['Mênfis', 'Tebas', 'Karnak', 'Luxor', 'Abidos', 'Saís', 'Heliópolis', 'Edfu', 'Assuã', 'Dendera', 'Amarna', 'Gizé', 'Tânis', 'Buto', 'Hieracômpolis', 'Kom Ombo', 'Elefantina', 'Faium'],
      namesF: ['Nefertari', 'Nefertiti', 'Hatshepsut', 'Meritamon', 'Ankhesen', 'Tiye', 'Nebet', 'Isetnofret', 'Neferu', 'Kiya', 'Mutemwia', 'Sitamun', 'Tauret', 'Henut', 'Nubet', 'Meresankh'],
      namesM: ['Ahmose', 'Khufu', 'Amenhotep', 'Ramsés', 'Seti', 'Tutmés', 'Imhotep', 'Djoser', 'Horemheb', 'Senusret', 'Khafre', 'Menkaure', 'Narmer', 'Ptahhotep', 'Sneferu', 'Kamose'],
      skin: ['#c99569', '#b8804f', '#a8744c', '#8f5f3a'], hair: ['#151515', '#1f1712', '#2b1d14'],
      cloth: '#f1ead6', trim: '#2f8f8a',
      traits: { farm: 1.15, riverFarm: 1.6, faith: 1.35, build: 1.15, growth: 1.1, naval: 0.75, war: 0.95, research: 1.1, loyalty: 8, distLoyal: 0.9 },
      persona: { agg: -0.05, cru: 0.03, pie: 0.2, amb: 0.1 },
      techOrder: ['escrita', 'alvenaria', 'roda', 'arco', 'engenharia', 'moeda', 'bronze', 'navegacao', 'filosofia', 'ferro'],
      techCost: { escrita: 0.5, alvenaria: 0.6, engenharia: 0.8 },
      startTech: ['escrita'],
      gov: {
        tribo: ['Nomo', 'Nomarca', 'Nomarca'], chefia: ['Nomo Unido', 'Nomarca', 'Nomarca'], reino: ['Reino', 'Faraó', 'Faraó'], imperio: ['Império', 'Faraó', 'Faraó'],
        teocracia: ['Teocracia', 'Sumo-Sacerdote de Amon', 'Divina Adoradora'], tirania: ['Tirania', 'Faraó Tirano', 'Faraó Tirana'], conselho: ['Conselho dos Escribas', 'Vizir', 'Vizira'],
      },
      units: { guerreiro: ['Guerreiro de Mênfis', 'Guerreira de Mênfis'], arqueiro: ['Arqueiro Núbio', 'Arqueira Núbia'], elite: 'Carro de Guerra', ship: 'Barca de Guerra', trader: 'Barca de Papiro' },
      bnames: { quarteirao: 'Bairro dos Artesãos', praca: 'Pátio do Templo', teatro: 'Jardim Sagrado', biblioteca: 'Casa da Vida', palacio: 'Palácio do Faraó', maravilha: 'Grande Pirâmide', monument: 'Obelisco', temple: 'Templo de Pilonos', quartel: 'Quartel do Faraó', banhos: 'Lago Sagrado', mercado: 'Mercado do Rio', aqueduto: 'Canal de Irrigação', celeiro: 'Celeiro Real', sobrado: 'Casa de Dois Andares', insula: 'Casa de Nobres', doca: 'Cais' },
      god: ['o Sol Oculto', 'Aquele que Faz o Rio Subir', 'o Olho do Céu'],
      chronicler: 'os escribas',
    },
    asteca: {
      id: 'asteca', name: 'Astecas', sing: ['Asteca', 'Asteca'], adj: 'asteca', colors: [4, 2, 8, 0],
      blurb: 'Guerreiros-águia e jaguar, mercados vibrantes e jardins sobre a água. Na guerra florida, preferem capturar a matar — para oferecer ao deus.',
      peoples: ['Altepetl de Tenoch', 'Senhorio de Tlacopan', 'Altepetl de Texcoco', 'Senhorio de Tlaxcala', 'Altepetl de Culhuacan', 'Senhorio de Xochimilco', 'Altepetl de Cholula', 'Senhorio de Chalco'],
      cities: ['Tenochtitlan', 'Texcoco', 'Tlacopan', 'Tlatelolco', 'Xochimilco', 'Chalco', 'Cholula', 'Tlaxcala', 'Culhuacan', 'Azcapotzalco', 'Coyoacan', 'Tula', 'Malinalco', 'Tepoztlan', 'Huexotzinco', 'Mixquic'],
      namesF: ['Xochitl', 'Citlali', 'Itzel', 'Yaretzi', 'Nenetl', 'Tlalli', 'Ameyali', 'Izel', 'Metztli', 'Xiuhtonal', 'Tonantzin', 'Papan', 'Coatlicue', 'Chalchiuitl', 'Atzi', 'Miztli'],
      namesM: ['Cuauhtémoc', 'Tenoch', 'Itzcóatl', 'Nezahualcóyotl', 'Tlacaélel', 'Axayácatl', 'Ahuízotl', 'Tízoc', 'Moctezuma', 'Ocelotl', 'Xiuhcoatl', 'Tochtli', 'Citlalin', 'Mazatl', 'Cuetlachtli', 'Tezcatl'],
      skin: ['#c08a5e', '#b07a4f', '#a06c44', '#8f5f3a'], hair: ['#151515', '#1a1512', '#241a14'],
      cloth: '#e8dcc0', trim: '#2fae8f',
      traits: { capture: 2.2, faith: 1.2, farm: 1.1, trade: 1.25, war: 1.1, naval: 0.55, growth: 1.1, research: 0.95, sacrifice: 1 },
      persona: { agg: 0.05, cru: 0.1, pie: 0.15, amb: 0.05 },
      techOrder: ['arco', 'moeda', 'escrita', 'alvenaria', 'bronze', 'engenharia', 'roda', 'navegacao', 'filosofia', 'ferro'],
      techCost: { moeda: 0.55, arco: 0.7, alvenaria: 0.8 },
      gov: {
        tribo: ['Calpulli', 'Chefe', 'Chefe'], chefia: ['Altepetl', 'Tlatoani', 'Cihuatlatoani'], reino: ['Senhorio', 'Tlatoani', 'Cihuatlatoani'], imperio: ['Império Mexica', 'Huey Tlatoani', 'Huey Cihuatlatoani'],
        teocracia: ['Teocracia', 'Sumo-Sacerdote', 'Suma-Sacerdotisa'], tirania: ['Tirania', 'Tirano', 'Tirana'], conselho: ['Conselho', 'Cihuacoatl', 'Cihuacoatl'],
      },
      units: { guerreiro: ['Guerreiro-Jaguar', 'Guerreira-Jaguar'], arqueiro: ['Lançador de Átlatl', 'Lançadora de Átlatl'], elite: 'Guerreiro-Águia', ship: 'Acalli de Guerra', trader: 'Canoa mercante' },
      bnames: { quarteirao: 'Calpulli', praca: 'Tianguis', teatro: 'Campo de Pelota', biblioteca: 'Calmécac', palacio: 'Palácio do Tlatoani', maravilha: 'Templo Mayor', monument: 'Pedra do Sol', temple: 'Pirâmide', quartel: 'Casa dos Guerreiros', banhos: 'Temazcal', mercado: 'Mercado', aqueduto: 'Aqueduto', celeiro: 'Celeiro', farm: 'Milharal', chinampa: 'Chinampa', sobrado: 'Casa de Adobe', insula: 'Casa dos Pochteca', doca: 'Embarcadouro' },
      god: ['a Serpente do Céu', 'o Espelho Fumegante', 'o Senhor do Dia e da Noite'],
      chronicler: 'os códices',
    },
    romano: {
      id: 'romano', name: 'Romanos', sing: ['Romano', 'Romana'], adj: 'romana', colors: [2, 0, 10, 7],
      blurb: 'Engenheiros e legionários. Estradas, aquedutos, fortes e leis. Conquistam, assimilam e transformam vencidos em cidadãos.',
      peoples: ['República de Lavínio', 'Gens Júlia', 'República de Alba', 'Gens Cornélia', 'República de Óstia', 'Gens Cláudia', 'República de Tíbur', 'Gens Flávia'],
      cities: ['Roma', 'Óstia', 'Alba Longa', 'Lavínio', 'Tíbur', 'Cápua', 'Pompeia', 'Aquileia', 'Ravena', 'Verona', 'Arímino', 'Brundísio', 'Tarento', 'Neápolis', 'Mediolano', 'Ancona', 'Préneste', 'Túsculo'],
      namesF: ['Júlia', 'Lívia', 'Cornélia', 'Aurélia', 'Cláudia', 'Otávia', 'Agripina', 'Lucrécia', 'Valéria', 'Túlia', 'Flávia', 'Antônia', 'Pompeia', 'Faustina', 'Sabina', 'Messalina'],
      namesM: ['Marco', 'Caio', 'Lúcio', 'Tito', 'Públio', 'Quinto', 'Sexto', 'Aulo', 'Décimo', 'Cneu', 'Sérvio', 'Otávio', 'Flávio', 'Graco', 'Máximo', 'Túlio', 'Druso', 'Cássio'],
      skin: ['#efcfae', '#e2b690', '#d3a077', '#c08a5e'], hair: ['#2b1d14', '#3a2618', '#4a3020', '#171210'],
      cloth: '#e8dcc6', trim: '#8e2f2f',
      traits: { build: 1.25, war: 1.1, armor: 0.8, assimilate: 2.2, loyalty: 5, distLoyal: 0.6, research: 1.05, faith: 0.9, expansion: 1.25, trade: 1.1, roads: 1 },
      persona: { agg: 0.05, cru: 0.02, pie: 0, amb: 0.12 },
      techOrder: ['alvenaria', 'bronze', 'engenharia', 'roda', 'escrita', 'moeda', 'arco', 'ferro', 'navegacao', 'filosofia'],
      techCost: { engenharia: 0.5, alvenaria: 0.6, roda: 0.7 },
      gov: {
        tribo: ['Tribo', 'Chefe', 'Chefe'], chefia: ['Monarquia', 'Rei', 'Rainha'], reino: ['República', 'Cônsul', 'Cônsul'], imperio: ['Império', 'Imperador', 'Imperatriz'],
        teocracia: ['Colégio Pontifício', 'Pontífice Máximo', 'Pontífice Máxima'], tirania: ['Ditadura', 'Ditador', 'Ditadora'], conselho: ['Senado', 'Príncipe do Senado', 'Princesa do Senado'],
      },
      units: { guerreiro: ['Legionário', 'Legionária'], arqueiro: ['Sagitário', 'Sagitária'], elite: 'Legião', ship: 'Galera', trader: 'Corbita' },
      bnames: { quarteirao: 'Bloco de Ínsulas', praca: 'Fórum', teatro: 'Arena', biblioteca: 'Biblioteca', palacio: 'Palácio', maravilha: 'Coliseu', monument: 'Coluna Triunfal', temple: 'Templo', quartel: 'Castro', banhos: 'Termas', mercado: 'Macelo', aqueduto: 'Aqueduto', celeiro: 'Hórreo', house: 'Domus', sobrado: 'Domus Grande', insula: 'Ínsula', doca: 'Porto', torre: 'Torre de Vigia', muralha: 'Muralha' },
      god: ['o Numen Supremo', 'o Genius do Mundo', 'o Júpiter Oculto'],
      chronicler: 'os analistas',
    },
  };
  C.IDS = Object.keys(G.CIVS);

  // ------------------------------ lookups ------------------------------
  C.get = id => G.CIVS[id] || null;
  C.ofFac = fid => { const f = G.Fac && G.Fac.get(fid); return f && f.civ ? G.CIVS[f.civ] : null; };
  C.idOfFac = fid => { const f = G.Fac && G.Fac.get(fid); return f && f.civ ? f.civ : null; };
  C.ofSet = sid => { const s = G.S.settlements.get(sid); return s ? C.ofFac(s.fac) : null; };
  C.ofV = v => C.ofSet(v.set);
  // mechanical trait of a people (1 when neutral)
  C.t = function (fid, k, def) {
    const c = C.ofFac(fid); const d = def === undefined ? 1 : def;
    const base = c && c.traits[k] !== undefined ? c.traits[k] : d;
    // divine laws, golden ages and curses bend a people's nature
    const f = G.Fac && G.Fac.get(fid);
    if (f && (f.law || f.golden > 0 || f.curse > 0) && G.Powers && G.Powers.traitMod) return base * G.Powers.traitMod(f, k);
    return base;
  };
  C.tV = (v, k, def) => { const s = G.S.settlements.get(v.set); return C.t(s ? s.fac : 0, k, def); };
  C.nearRiver = function (x, y, r) {
    const S = G.S, N = G.N; const cx = Math.floor(x), cy = Math.floor(y);
    for (let yy = Math.max(0, cy - r); yy <= Math.min(N - 1, cy + r); yy++) for (let xx = Math.max(0, cx - r); xx <= Math.min(N - 1, cx + r); xx++)
      if (S.type[yy * N + xx] === G.T.RIVER) return true;
    return false;
  };
  // grammatical gender of a building name: 'a' (a Praça, a Ágora) or 'o' (o Fórum, o Coliseu)
  const FEM = new Set(['pirâmide', 'acrópole', 'torre', 'pedra', 'muralha', 'ínsula', 'domus', 'casa', 'ágora', 'sauna', 'estátua', 'coluna', 'feira', 'academia', 'biblioteca', 'chinampa', 'arena', 'praça', 'fogueira', 'cabana', 'oficina', 'fazenda', 'doca', 'ponte', 'estrada', 'rua', 'termas', 'barca', 'galera', 'trirreme', 'nau', 'canoa', 'pedra rúnica', 'caixa', 'cisterna', 'fortaleza', 'maravilha', 'sede', 'hegemonia', 'cidade', 'metrópole', 'aldeia', 'vila']);
  G.gen = function (name) {
    let w = String(name).toLowerCase().split(' ');
    if (w[0] === 'grande' && w[1]) w = w.slice(1);
    if (FEM.has(w[0])) return 'a';
    return /a$/.test(w[0]) ? 'a' : 'o';
  };
  C.bname = function (type, civ) {
    const c = G.CIVS[civ];
    return (c && c.bnames[type]) || (G.BDEF[type] ? G.BDEF[type].name : type);
  };
  C.unitName = v => (G.Siege ? G.Siege.unitName(v) : null);

  // ------------------------------ names ------------------------------
  C.personName = function (civ, g, used) {
    const c = G.CIVS[civ];
    const pool = c ? (g === 'f' ? c.namesF : c.namesM) : (g === 'f' ? G.NAMES_F : G.NAMES_M);
    for (let k = 0; k < 14; k++) { const n = G.pick(pool); if (!used || !used.has(n)) return n; }
    return G.pick(pool);
  };
  C.cityName = function (civ) {
    const S = G.S; const c = G.CIVS[civ];
    const used = new Set([...S.settlements.values()].map(s => s.name).concat(S.usedNames || []));
    const pool = c ? c.cities : G.SETTLEMENT_NAMES;
    let n = pool.find(x => !used.has(x));
    if (!n) { const base = G.pick(pool); n = base + ' ' + ['Nova', 'Menor', 'do Norte', 'do Sul', 'Alta', 'Baixa'][S.nextId % 6]; }
    (S.usedNames = S.usedNames || []).push(n);
    return n;
  };
  C.peopleName = function (civ) {
    const c = G.CIVS[civ]; if (!c) return null;
    const used = new Set([...G.S.factions.values()].map(f => f.name));
    const n = c.peoples.find(x => !used.has(x));
    return n || null;
  };
  C.pickColor = function (civ) {
    const used = new Set([...G.S.factions.values()].filter(f => f.alive).map(f => f.ci));
    const c = G.CIVS[civ];
    if (c) for (const ci of c.colors) if (!used.has(ci)) return ci;
    for (let ci = 0; ci < 12; ci++) if (!used.has(ci)) return ci;
    return 0;
  };
  // pick civilizations for a new world (explicit choices first, then distinct random ones)
  C.assign = function (choices, n) {
    const out = []; const pool = C.IDS.slice().sort(() => G.R() - 0.5);
    for (let k = 0; k < n; k++) {
      const want = choices && choices[k];
      if (want && G.CIVS[want]) out.push(want);
      else { const free = pool.filter(id => !out.includes(id) && !(choices || []).includes(id)); out.push(free.length ? free[0] : G.pick(C.IDS)); }
    }
    return out;
  };

  // ------------------------------ governments ------------------------------
  C.govName = function (f) {
    const c = G.CIVS[f.civ]; const g = f.gov || 'tribo';
    if (c && c.gov[g]) return c.gov[g][0];
    return null;
  };
  C.govTitle = function (f, v) {
    const c = G.CIVS[f.civ]; const g = f.gov || 'tribo';
    if (c && c.gov[g]) return c.gov[g][v && v.g === 'f' ? 2 : 1];
    return null;
  };

  // ------------------------------ technology ------------------------------
  G.TECH = {
    roda: { name: 'A Roda', desc: 'Carroças levam bens entre cidades; carros de guerra.', cost: 45 },
    escrita: { name: 'A Escrita', desc: 'Escribas registram a história; bibliotecas; pesquisa mais rápida.', cost: 55 },
    navegacao: { name: 'Navegação', desc: 'Portos, barcos de pesca, navios mercantes e de guerra.', cost: 55 },
    arco: { name: 'Arco e Flecha', desc: 'Arqueiros no exército e sobre as muralhas.', cost: 45 },
    bronze: { name: 'Bronze', desc: 'Armas e escudos melhores: +15% em combate.', cost: 70 },
    alvenaria: { name: 'Alvenaria', desc: 'Muralhas de pedra, ruas calçadas, casas de dois andares.', cost: 65 },
    moeda: { name: 'A Moeda', desc: 'Mercados e rotas de comércio que rendem mais.', cost: 70 },
    engenharia: { name: 'Engenharia', desc: 'Aquedutos, estradas entre cidades, aríetes e catapultas.', cost: 110 },
    filosofia: { name: 'Filosofia', desc: 'Academias; pesquisa rápida; cidades mais leais.', cost: 120 },
    ferro: { name: 'Ferro', desc: 'Exércitos ainda mais fortes: +15% em combate.', cost: 150 },
  };
  C.has = (fid, tech) => { const f = G.Fac.get(fid); return !!(f && f.tech && f.tech.known[tech]); };
  C.hasV = (v, tech) => { const s = G.S.settlements.get(v.set); return !!s && C.has(s.fac, tech); };
  C.initTech = function (f) {
    if (f.tech) return;
    const c = G.CIVS[f.civ];
    f.tech = { known: {}, cur: null, pts: 0 };
    if (c && c.startTech) for (const t of c.startTech) f.tech.known[t] = G.S.day;
  };
  C.techCost = function (f, t) {
    const c = G.CIVS[f.civ]; const base = G.TECH[t].cost;
    const known = Object.keys(f.tech.known).length;
    return base * (c && c.techCost[t] ? c.techCost[t] : 1) * (1 + known * 0.15);
  };
  C.nextTech = function (f) {
    const c = G.CIVS[f.civ];
    const order = c ? c.techOrder : Object.keys(G.TECH);
    return order.find(t => !f.tech.known[t]) || null;
  };
  C.learn = function (f, t, how) {
    if (!f.tech || f.tech.known[t]) return false;
    f.tech.known[t] = G.S.day;
    if (f.tech.cur === t) { f.tech.cur = null; f.tech.pts = 0; }
    const cap = G.Fac.capitalOf(f.id);
    const txt = how === 'divina' ? `Um sonho enviado por você revelou a ${f.name} o segredo: ${G.TECH[t].name}.`
      : how === 'contato' ? `${f.name} aprendeu com seus vizinhos: ${G.TECH[t].name}.`
      : `${f.name} dominou uma nova arte: ${G.TECH[t].name}.`;
    G.Village.log(txt, 'tech', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    if (G.UI && G.UI.viewFac === f.id) G.UI.notice(`Nova descoberta: ${G.TECH[t].name}.`, 'tech');
    G.Lore && G.Lore.note('tech', { fac: f.id, tech: t, how });
    return true;
  };
  // research points: people, scribes, libraries and philosophy
  C.research = function (dt) {
    const S = G.S;
    const libs = {};
    for (const b of S.buildings.values()) if (b.built && (b.type === 'biblioteca' || b.type === 'teatro')) { const fid = G.Village.facOfSet(b.set); libs[fid] = (libs[fid] || 0) + (b.type === 'biblioteca' ? 1 : 0.4); }
    for (const f of G.Fac.all()) {
      C.initTech(f);
      const pop = G.Fac.pop(f.id);
      const acad = f.tech.known.filosofia ? 1 : 0;
      const rate = (0.015 + pop * 0.0011 + (libs[f.id] || 0) * 0.05) * C.t(f.id, 'research') * (f.tech.known.escrita ? 1.2 : 1) * (1 + acad * 0.25) * (f.golden > 0 ? 1.5 : 1) * (S.blessed ? 1.5 : 1);
      if (!f.tech.cur) f.tech.cur = C.nextTech(f);
      if (!f.tech.cur) continue;
      f.tech.pts += rate * dt;
      if (f.tech.pts >= C.techCost(f, f.tech.cur)) C.learn(f, f.tech.cur);
    }
  };
  // knowledge spreads between peoples that trade or live in peace
  C.diffuse = function () {
    const fs = G.Fac.all();
    for (const a of fs) for (const b of fs) {
      if (a === b || !a.tech || !b.tech) continue;
      const r = G.Fac.rel(a.id, b.id); if (!r || !r.met || r.st === 'guerra') continue;
      const chance = 0.012 + Math.min(0.06, (r.trade || 0) * 0.006) + (r.st === 'alianca' ? 0.05 : 0) + (r.vassal ? 0.04 : 0);
      if (G.R() > chance) continue;
      const t = Object.keys(b.tech.known).find(k => !a.tech.known[k]);
      if (t) C.learn(a, t, 'contato');
    }
  };
  let tRes = 0, tDiff = 0;
  C.update = function (dt) {
    tRes += dt; tDiff += dt;
    if (tRes >= 2) { C.research(tRes); tRes = 0; }
    if (tDiff >= 30) { tDiff = 0; C.diffuse(); }
  };
})(window.G);
