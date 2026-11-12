# as sabotagens da prova da casa cheia (qa/casa-cheia.js, o agente H dos Bairros Vivos — L-718, D-220 a D-224): cada uma desfaz
# uma parte do conserto numa cópia do jogo; uso: sab-H.py <pasta da cópia> <nome>      (pelo sab-run.sh do líder)
import sys, io
d, name = sys.argv[1], sys.argv[2]
def sub(p, a, b, n=1):
    t = io.open(d + '/' + p, encoding='utf-8').read(); assert t.count(a) == n, (p, a[:70], t.count(a)); io.open(d + '/' + p, 'w', encoding='utf-8').write(t.replace(a, b))
C, V = 'js/act-casa.js', 'js/villagers.js'
S = {
 # s1: o plano de antes — a casa vazia só serve com camas para a família inteira (a família de sete nunca toma a casa de seis)
 's1': lambda: sub(C, "(room(b) || (share ? fam.length / beds(b) <= now + EPS : beds(b) > mine));", "room(b);"),
 # s2: a casa vazia do povo não é dada a quem não tem o preço
 's2': lambda: sub(C, "      if (rd.kind === 'cede' && cede(v, fam, rd.b, set, rd.pays, why)) { left(); return { ok: true, b: rd.b, ceded: 1, price: rd.pays }; }\n", ""),
 # s3: dada de graça — a família não paga o que tem além do pouco que guarda
 's3': lambda: sub(C, "    if (plan.free) return { kind: 'cede', b: plan.free, pays: pays(plan.price) };", "    if (plan.free) return { kind: 'cede', b: plan.free, pays: 0 };"),
 # s4: a família paga tudo o que tem — sem guardar o pouco que guarda
 's4': lambda: sub(C, "    const pays = n => r2(Math.min(n, Math.max(0, shareOf(v, fam) - K.KEEP)));", "    const pays = n => r2(Math.min(n, Math.max(0, shareOf(v, fam))));"),
 # s5: sem a troca — a família sozinha fica com as duas casas
 's5': lambda: sub(C, "    if (swap) { from.dono = 0; from.custo = 0; from.aluga = null; from.poupa = null; }\n", ""),
 # s6: sem paciência — a cabana das mãos no primeiro dia
 's6': lambda: sub(C, "wait: o.now ? 0 : Math.max(0, K.HANDS_DAYS - (S.day - since)),", "wait: 0,"),
 # s7: sem as mãos — a família que não junta o preço só junta, como antes
 's7': lambda: sub(C, "      if (rd.kind === 'maos' && !rd.wait) { const b = raiseByHand(v, fam, set, rd.type, rd.pays, why); if (b) { left(); return { ok: true, b, hands: 1, price: b.encomenda.paid }; } chao = S.day; }\n", ""),
 # s8: os construtores do povo pegam a obra das mãos da família
 's8': lambda: sub(V, "      if (b.encomenda && b.encomenda.maos) continue;\n", ""),
 # s9: o dia de trabalho da família não pergunta pela sua obra — ninguém a levanta
 's9': lambda: sub(V, "    if (!v.captive && G.Casa && G.Casa.handsTask) { const t = G.Casa.handsTask(v); if (t) return t; }\n", ""),
 # s10: a obra das mãos conta nas duas obras pagas dos construtores
 's10': lambda: sub(C, "if (b.set === set.id && b.encomenda && !b.encomenda.maos && !b.built) open++;", "if (b.set === set.id && b.encomenda && !b.built) open++;"),
 # s11: a cabana em qualquer chão — sem pedir a metade barata da cidade
 's11': lambda: sub(C, "      pos = V.findSite(set, type, cheap);", "      pos = V.findSite(set, type);"),
 # s12: a madeira guardada para os navios conta como sobra
 's12': lambda: sub(C, "    return Math.max(0, Math.min(G.Fac.free(set.id, k), D.free('f:' + fid, k)) - wait);", "    return Math.max(0, D.free('f:' + fid, k) - wait);"),
 # s13: a madeira que as outras cabanas esperam conta como sobra
 's13': lambda: sub(C, "    return Math.max(0, Math.min(G.Fac.free(set.id, k), D.free('f:' + fid, k)) - wait);", "    return Math.max(0, Math.min(G.Fac.free(set.id, k), D.free('f:' + fid, k)));"),
 # s14: sem madeira de sobra, a obra começa assim mesmo
 's14': lambda: sub(C, "    const cost = G.BDEF[HAND].cost; for (const k in cost) if (K.spare(set, k) + EPS < cost[k]) return 'madeira';\n", ""),
 # s15: a obra das mãos sem mãos fica órfã — nem a morte nem o dia da cidade a passam aos construtores
 's15': lambda: (
   sub(C, "if (!hands(b).length) b.encomenda.maos = 0; else if (!b.encomenda.fam.includes(b.dono)) b.dono = b.encomenda.by; HW = null; }", "if (hands(b).length && !b.encomenda.fam.includes(b.dono)) b.dono = b.encomenda.by; HW = null; }"),
   sub(C, "    handsDay(set); // (a family's own work with no grown hands of the family left: the people's builders', D-222)\n", "")),
 # s16: morto quem a encomendou, a obra das mãos fica sem dono até ficar de pé
 's16': lambda: sub(C, " else if (!b.encomenda.fam.includes(b.dono)) b.dono = b.encomenda.by; HW = null; }", " HW = null; }"),
 # s17: a família sozinha na casa que tem também levanta uma cabana
 's17': lambda: sub(C, "    if (!share) return 'so';", "    if (0) return 'so';"),
 # s18: sem teto para as cabanas de mãos em obra numa cidade
 's18': lambda: sub(C, "    if (open >= K.MAX_HANDS) return 'obras';\n", ""),
 # s19: a cabana também para quem viveria nela mais apertado do que está
 's19': lambda: sub(C, "    if (!(fam.length / G.BDEF[HAND].housing <= now + EPS)) return 'pequena';", "    if (0) return 'pequena';"),
 # s20: o dia da cidade decide pela família do corpo
 's20': lambda: sub(C, "    for (const [v] of K.queue(set)) { if (K.family(v).some(m => m.age >= 16 && A.isBody(m))) continue; const r = K.order(v); if (r.ok) break; }", "    for (const [v] of K.queue(set)) { const r = K.order(v); if (r.ok) break; }"),
 # s21: a estrada lida escreve — a tela marca a casa que junta
 's21': lambda: sub(C, "    const no = noHands(v, fam, set, occ, plan.share); if (no) return { kind: '', why: no };", "    const no = noHands(v, fam, set, occ, plan.share); { const hh = S.buildings.get(v.home); if (hh && !hh.poupa) hh.poupa = { by: v.id, alvo: 1, d: S.day, why }; else if (hh && hh.poupa) hh.poupa.d = S.day; } if (no) return { kind: '', why: no };"),
 # s22: o save perde a marca das mãos — depois do load a obra é dos construtores
 's22': lambda: sub('js/save.js', "delete o.res; delete o._sg;", "delete o.res; delete o._sg; if (o.encomenda && o.encomenda.maos) o.encomenda = Object.assign({}, o.encomenda, { maos: 0 });"),
 # s23: o povo sem moeda também vai pela estrada nova
 's23': lambda: sub(C, "    if (!set || !crowded(why) || !coinPeople(set)) return { kind: '' };", "    if (!set || !crowded(why)) return { kind: '' };"),
 # s24: sem chão, a obra «começa» sem lote — a falta de chão não é dita nem guardada
 's24': lambda: sub(C, " } chao = S.day; }", " } }"),
 # s25: a casa vazia do povo que aparece depois não interrompe a paciência — a família espera os dias mesmo com casa para ela
 's25': lambda: sub(C, "      if (rd.kind === 'cede' && cede(v, fam, rd.b, set, rd.pays, why)) {", "      if (rd.kind === 'cede' && h && h.poupa && S.day - h.poupa.d >= K.HANDS_DAYS && cede(v, fam, rd.b, set, rd.pays, why)) {"),
 # s26: a pergunta de antes da L-719 — só quem está escrito na obra «espera» a casa: o par que chega depois pede outra
 's26': lambda: sub(C, "      if (ids.length > 1 && b.encomenda.fam.some(id => ids.includes(id))) return b;\n", ""),
 # s27: o par que chegou depois não trabalha na cabana da família — só quem está escrito
 's27': lambda: sub(C, "    const id = handWorks().get(v.id) || (q && q.home === v.home ? handWorks().get(q.id) : 0);", "    const id = handWorks().get(v.id);"),
 # s28: de pé a cabana, só muda quem estava escrito — o par que chegou depois fica na casa cheia
 's28': lambda: sub(C, "    const fam = famNow(o).filter(v => !v.captive && v.set === b.set);", "    const fam = o.fam.map(P).filter(v => v && !v.captive && v.set === b.set);"),
}
S[name]()
