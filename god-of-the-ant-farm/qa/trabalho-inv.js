// trabalho-inv: as regras do verificador para os ofícios do corpo (20g: D-425 a D-433) — carregado depois do qa/qa.js (QA.more),
// juntado a ele pelo qa/junta-inv.js. Lê o mundo e o que o G.Inv e o G.Trabalho dizem (só leitura). O sistema «trabalho»:
//   · o que se segura é de verdade (D-426): quem tem as coisas do ofício feitas verdade (equip.kit: o corpo do deus, e quem ele foi)
//     segura na mão só uma coisa da própria mochila — nunca a ferramenta do ofício que não tem (S2);
//   · nenhum trabalho sem a ferramenta que ele pede: o corpo no meio de um golpe de um trabalho que não se faz sem ferramenta
//     (cortar, quebrar, minerar, esfolar) tem uma do tipo — na mochila; a resposta do mundo no contato confere de novo (S2);
//   · o trabalho segurado (G.Trabalho.chain: golpe atrás de golpe) só existe com um corpo vivido (S3);
//   · a carga que o trabalho do corpo pôs nas mãos veio pelo livro: a comida nas mãos do corpo não é de origem desconhecida — a
//     fruta, o peixe, a carne, o grão daquele campo (G.Origem) (S3);
//   · os gestos dos ofícios (onde o 3D está carregado): os atos do mundo que eles tomam — o machado de quem corta, a picareta de
//     quem quebra pedra, a foice de quem colhe — mostram o gesto novo, para o corpo e para as pessoas do mundo (S4).
(function () {
  if (!window.QA || !QA.more) return;
  const TOOL_ONLY = { cortar: 1, quebrar: 1, minerar: 1, esfolar: 1 };
  QA.more.push(function (add, s) {
    const Inv = G.Inv, It = G.Itens, Tr = G.Trabalho; if (!Inv || !It) return;
    // (what anyone with real things holds in the hand: a thing of their own bag — never the trade's unseen tool)
    for (const v of s.villagers.values()) {
      const e = v.equip; if (!e || typeof e !== 'object' || !e.kit) continue;
      const h = Inv.held(v); const b = v.mochila && typeof v.mochila === 'object' ? v.mochila : {};
      for (const sl of ['mao', 'outra']) { const k = h[sl]; if (k && It.THINGS.has(k) && !(b[k] >= 1)) add('trabalho', 2, `${v.name} #${v.id}: segura ${k} na ${sl === 'mao' ? 'mão' : 'outra mão'} sem tê-lo (o ato ${v.act || '—'}; D-426)`, v.id); }
    }
    if (!Tr) return;
    const a = s.avatar && s.villagers.get(s.avatar.id);
    const cur = Tr.now ? Tr.now() : null;
    if (a && cur && TOOL_ONLY[cur.id] && G.Avatar && G.Avatar.busy && G.Avatar.busy()) {
      const t = Tr.tool(a, cur.id); if (!t.key) add('trabalho', 2, `${a.name} #${a.id}: no meio de «${cur.id}» sem a ferramenta que ele pede (D-426)`, a.id);
    }
    if (Tr.chain && Tr.chain() && !a) add('trabalho', 3, 'o trabalho segurado continua sem um corpo vivido', 0);
    if (a && a.carry && a.carry.k === 'food' && a.carry.n > 1e-6 && G.Origem && Tr.last) {
      const l = Tr.last(); const p = G.Origem.parts('v:' + a.id, 'food');
      if (l && l.ok && (p['?'] || 0) > 1e-4 && ['colher', 'pescar', 'esfolar', 'ceifar'].includes(l.id)) add('trabalho', 3, `${a.name} #${a.id}: ${p['?']} da comida nas mãos de origem desconhecida depois de «${l.id}» (o trabalho dá pelo livro, com a origem)`, a.id);
    }
    const A3 = G.Anim3D; if (A3 && A3.CLIP_OF && A3.CLIPS && A3.CLIPS.machado) {
      for (const [act, c] of [['chop', 'machado'], ['cut', 'machado'], ['mine', 'picareta'], ['harvest', 'ceifar']]) if (A3.CLIP_OF[act] !== c) add('trabalho', 4, `o ato «${act}» mostra o clipe «${A3.CLIP_OF[act]}», não o gesto do ofício «${c}» (D-428)`, 0);
    }
  });
})();
