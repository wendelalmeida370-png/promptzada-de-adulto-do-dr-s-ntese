# as sabotagens da prova da casa por dentro (qa/casa-dentro.js, o agente G dos Bairros Vivos): cada uma desfaz uma parte do
# conserto numa cópia do jogo; uso: sab-G.py <pasta da cópia> <nome>      (pelo sab-run.sh do líder)
import sys, io
d, name = sys.argv[1], sys.argv[2]
def sub(p, a, b, n=1):
    t = io.open(d + '/' + p, encoding='utf-8').read(); assert t.count(a) == n, (p, a[:70], t.count(a)); io.open(d + '/' + p, 'w', encoding='utf-8').write(t.replace(a, b))
S = {
 # s1: a mesa fora do núcleo — o lugar de comer volta a ser o que sobra: nada guardado antes das camas, e sem lugar a casa fica sem
 's1': lambda: (
   sub('js/int-familias.js', "    const keepEat = () => { if (round || P.items.some(it => it.res === 1)) return; if (!keepAt(LEAST[0], LEAST[1], LEAST[2], 1)) { P.lack = 1; P.errs.push('sem lugar para a família comer'); } };",
       "    const keepEat = () => {};"),
   sub('js/int-familias.js', "      if (!keepAt(LEAST[0], LEAST[1], LEAST[2], 1)) { P.lack = 1; P.errs.push('sem lugar para a família comer'); }\n    };", "    };")),
 # s2: o motor aceita de novo a peça onde o corpo não cabe (T-446): o put sem a prova do corpo
 's2': lambda: sub('js/interiors.js', " && this.bodyFits(lv, it, f.steal)) return it;", ") return it;"),
 # s3: o depósito curto — a nave do armazém e do celeiro com a largura de antes do L-499, sem contar o corredor das tulhas
 's3': lambda: sub('js/int-trabalho.js', "const hi = PR.aisle ? Math.min(3.2, I[2] - I[0] - 0.35 - 2 * PR.aisle) : 3.2;", "const hi = 3.2;"),
 # s4: o alcance atravessa parede de novo (T-446): o lugar de uso alcançado por uma célula do outro lado
 's4': lambda: sub('js/interiors.js', "  const wallBetween = (g, n, ax, az, bx, bz) => {", "  const wallBetween = (g, n, ax, az, bx, bz) => { return false;"),
 # s5: a segunda rodada da prova de uma família repete as doze primeiras (L-890)
 's5': lambda: sub('js/interiors.js', "function make(b, rec, famId, probe, relax, from) { return run(makeG(b, rec, famId, probe, relax, from)); }", "function make(b, rec, famId, probe, relax, from) { return run(makeG(b, rec, famId, probe, relax)); }"),
 # s6: a chave da planta sem a gramática: o lugar que o corpo tinha nas mãos num save de antes fica nas mãos, numa peça que é outra
 's6': lambda: sub('js/interiors.js', " + ':' + (rec.fx || []).length + ':g' + In.VERSION;", " + ':' + (rec.fx || []).length;"),
 # s7: a casa cheia demais sem o último chão — quem sobra dorme de pé, à porta (L-891)
 's7': lambda: sub('js/interiors.js', "      if (lie) for (const f of floorPts(t)) {\n        if (discs.some(d => d.lv === f.lv && Math.hypot(d.x - f.x, d.z - f.z) < 0.34)", "      if (0) for (const f of floorPts(t)) {\n        if (discs.some(d => d.lv === f.lv && Math.hypot(d.x - f.x, d.z - f.z) < 0.34)"),
 # s8: o save de agora não diz a gramática das plantas (intG): todo load julga os registros de novo
 's8': lambda: sub('js/interiors.js', "save(out) { out.intG = In.VERSION; }", "save(out) { }"),
 # s9: sentado num assento que não existe — o lugar no chão em volta do fogo e da esteira com a pose de quem senta num banco
 's9': lambda: sub('js/interiors.js', "    const give = (v, e, st) => { if (ON_GROUND[st] && (ITEMS[e.it.kind] || {}).chao) st = ON_GROUND[st];", "    const give = (v, e, st) => {"),
}
S[name]()
print('sabotagem', name, 'aplicada')
