// movimento-inv: as regras do verificador do movimento do corpo (20b, D-355 a D-369) — carregado depois do qa/qa.js (QA.more),
// juntado a ele pelo qa/junta-inv.js. Lê o controle do corpo que o deus vive (G.Avatar.state(): a memória da vista de um corpo
// que anda) e o mundo — nenhuma pergunta muda nada. Sem corpo vivido, nada a dizer. O sistema «movimento»:
//   · os números do controle são números (S2): o lugar, a altura, o rumo, a velocidade, o giro, a aceleração, o fôlego — um NaN ali
//     leva o corpo do mundo (v.x, v.y) para lugar nenhum;
//   · o corpo do controle é o do mundo (S2): onde o controle tem o corpo é onde o mundo o tem (a menos de um passo: o mundo o escreve
//     a cada passo do corpo);
//   · o fôlego entre 0 e o máximo da pessoa, e sem fôlego só com menos da parte que o devolve (S3, D-361);
//   · a altura desenhada nunca a mais de 0,7 m dos pés (S3, D-356); a esquiva e o pivô com a fase entre 0 e 1 e um tempo (S3, D-363);
//   · o passo nomeado é um dos cinco (S4, D-367).
(function () {
  if (!window.QA || !QA.more) return;
  const GAITS = { parado: 1, andar: 1, trote: 1, disparada: 1, agachado: 1 };
  const rule = function (add, s) {
    const Av = G.Avatar; const a = s.avatar; if (!Av || !Av.on || !a || !Av.state) return;
    const b = Av.state(); if (!b || b.id !== a.id) return; const v = s.villagers.get(a.id); if (!v) return;
    const nm = `${v.name} #${v.id}, o corpo do deus`;
    const nums = { X: b.X, Y: b.Y, Z: b.Z, yaw: b.yaw, vx: b.vx, vz: b.vz, vy: b.vy, yOff: b.yOff, turnV: b.turnV, accX: b.accX, accZ: b.accZ, stamina: b.stamina, yawV: b.yawV };
    const bad = Object.keys(nums).filter(k => nums[k] !== undefined && !Number.isFinite(nums[k]));
    if (bad.length) { add('movimento', 2, `${nm}: o controle tem números que não são números (${bad.join(', ')})`, v.id); return; }
    const L = G.Space ? G.Space.TILE : 4; const off = Math.hypot(b.X / L - v.x, b.Z / L - v.y) * L;
    if (off > 0.75 && !v.held && !v.aboard) add('movimento', 2, `${nm}: o controle o tem a ${off.toFixed(2)} m de onde o mundo o tem`, v.id);
    const max = b.caps ? b.caps.stamina : 100;
    if (b.stamina < -1e-6 || b.stamina > max + 1e-6) add('movimento', 3, `${nm}: o fôlego ${b.stamina.toFixed(1)} fora de 0–${max}`, v.id);
    if (b.winded && b.stamina >= max * ((Av.TUNE && Av.TUNE.winded) || 0.4) + 1) add('movimento', 3, `${nm}: sem fôlego com ${b.stamina.toFixed(1)} de ${max}`, v.id);
    if (Math.abs(b.yOff || 0) > 0.71) add('movimento', 3, `${nm}: a altura desenhada a ${b.yOff.toFixed(2)} m dos pés`, v.id);
    for (const [k, q] of [['esquiva', b.dodge], ['pivô', b.pivot]]) if (q && !(q.u >= 0 && q.u <= 1 && Number.isFinite(q.t) && q.dur > 0)) add('movimento', 3, `${nm}: a ${k} com a fase ${q.u} e o tempo ${q.t}/${q.dur}`, v.id);
    if (b.dodge && b.loco !== 'dodge') add('movimento', 3, `${nm}: uma esquiva guardada fora da esquiva (${b.loco})`, v.id);
    if (b.gait !== undefined && !GAITS[b.gait]) add('movimento', 4, `${nm}: o passo «${b.gait}» não é um dos cinco`, v.id);
  };
  QA.more.push(rule); QA.movimento = rule;
})();
