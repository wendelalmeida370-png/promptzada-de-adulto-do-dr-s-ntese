# as sabotagens da segunda rodada da casa cheia (qa/casa-cheia.js c17 a c22; o agente H dos Bairros Vivos — D-235 a D-238,
# L-973, L-974): cada uma desfaz uma parte do conserto numa cópia do jogo; uso: sab-H2.py <pasta da cópia> <nome>
# (pelo sab-run.sh do líder; as da primeira rodada: sab-H.py)
import sys, io
d, name = sys.argv[1], sys.argv[2]
def sub(p, a, b, n=1):
    t = io.open(d + '/' + p, encoding='utf-8').read(); assert t.count(a) == n, (p, a[:70], t.count(a)); io.open(d + '/' + p, 'w', encoding='utf-8').write(t.replace(a, b))
C, V, So = 'js/act-casa.js', 'js/village.js', 'js/social.js'
S = {
 # t1: os moços da casa não vão juntos — cada um por si
 't1': lambda: sub(C, "    return [v].concat(rest.slice(0, G.BDEF[HAND].housing - 1));", "    return [v];"),
 # t2: sem a paciência — a cabana dos moços no primeiro dia
 't2': lambda: sub(C, "wait: now ? 0 : Math.max(0, K.HANDS_DAYS - (S.day - (mark ? mark.d : S.day))),", "wait: 0,"),
 # t3: o dono da cabana dos moços é quem o dia perguntou (o mais moço), não o mais velho deles
 't3': lambda: sub(C, "raiseByHand(eldest(rd.mates), rd.mates, set, rd.type, rd.pays, why, true)", "raiseByHand(v, rd.mates, set, rd.type, rd.pays, why, true)"),
 # t4: um só levanta sempre — sem a regra da casa com o dobro
 't4': lambda: sub(C, "      if (g.length < 2 && (occ.get(h.id) || 0) < 2 * beds(h)) return { kind: '', why: 'um' };\n", ""),
 # t5: a família sozinha, perguntada depois, toma a marca da casa — a paciência dos moços recomeça todo dia
 't5': lambda: sub(C, "      if (h && !theirs) { h.poupa = {", "      if (h) { h.poupa = {"),
 # t6: na fila de uma casa cheia, o mais moço primeiro, seja família ou solteiro (a fila de antes)
 't6': lambda: sub(C, "      l.sort((a, b) => rk.get(a) - rk.get(b) || eldest(a[0]) - eldest(b[0]) || a[0].id - b[0].id);", "      l.sort((a, b) => eldest(a[0]) - eldest(b[0]) || a[0].id - b[0].id);"),
 # t7: nenhuma casa vazia do povo é guardada para a família
 't7': lambda: sub(C, "    const out = new Map(); const occ = occupancy(); const coin = coinPeople(set);\n", "    const out = new Map(); const occ = occupancy(); const coin = coinPeople(set); if (out) return out;\n"),
 # t8: o repartidor de casas não pergunta — o solteiro vai para a casa de mais lugar, guardada ou não
 't8': lambda: sub(V, " && !(alone && kept(b))) best = b;", ") best = b;"),
 # t9: o bolso de quem tem teto fica no bolso
 't9': lambda: sub(C, "    pocket(set); // (the purse of who has a roof again: into the house's pot, L-973)\n", ""),
 # t10: o que o ladrão levou e ainda deve vai junto para o pote
 't10': lambda: sub(C, "  const ownPurse = (v, loot) => Math.floor(((v.purse || 0) - (loot.get(v.id) || 0)) * 100) / 100;", "  const ownPurse = (v, loot) => Math.floor((v.purse || 0) * 100) / 100;"),
 # t11: a família ao relento não tem as duas estradas (como antes)
 't11': lambda: sub(C, "    const out = why === 'rua';\n    if (!set", "    const out = false;\n    if (!set"),
 # t12: a família ao relento espera a paciência dos dois dias
 't12': lambda: sub(C, "    return Object.assign(hand(fam, since(fam), o.now || out), { out });", "    return Object.assign(hand(fam, since(fam), o.now), { out });"),
 # t13: a família que levanta a sua cabana também levanta um barraco
 't13': lambda: sub(So, " && !(G.Casa && G.Casa.waiting && G.Casa.waiting(v)));", ");"),
 # t14: ao relento, as moedas da família não se juntam na mão de quem o dia pergunta
 't14': lambda: sub(C, "    gather(v, fam); // (out of doors, the family's coins in one hand: L-973)\n", ""),
 # t15: o par de quem pode morar na sede não é da sede (a regra de antes): entra pelo repartidor e sai pela porta da sede
 't15': lambda: sub(C, "    return mate(v) || (v.age < 16 && [P(v.mother), P(v.father)].some(q => !!q && mate(q)));", "    return fam(v) || fam(P(v.partner)) || fam(P(v.mother)) || fam(P(v.father)) || (!!v.mother && kids.includes(v.mother)) || (!!v.father && kids.includes(v.father));"),
 # t16: ao relento com o preço e os construtores cheios, a família espera os construtores
 't16': lambda: sub(C, "    if (coin && why === 'rua') { const rd = K.road(v, { fam, set, occ, plan, why });", "    if (coin && why === 'rua' && !set) { const rd = K.road(v, { fam, set, occ, plan, why });"),
 # t17: morto o mais velho, a cabana dos moços é do primeiro escrito, não do mais velho dos que ficam
 't17': lambda: sub(C, "b.encomenda.by = (L.length ? eldest(L).id : b.encomenda.fam[0]) || 0;", "b.encomenda.by = b.encomenda.fam[0] || 0;"),
 # t18: o save perde a marca dos moços
 't18': lambda: sub('js/save.js', "delete o.res; delete o._sg;", "delete o.res; delete o._sg; if (o.encomenda && o.encomenda.mocos) o.encomenda = Object.assign({}, o.encomenda, { mocos: 0 });"),
 # t19: os moços vão por esta estrada mesmo esperando casa ou tendo deixado a casa nova para depois — conferido pelo corpo
 # entre eles: o dia decide pelo corpo (o corpo não sai da lista dos que vão juntos)
 't19': lambda: sub(C, "leaver(o, h) && !A.isBody(o) && !K.waiting(o)", "leaver(o, h) && !K.waiting(o)"),
}
S[name]()
