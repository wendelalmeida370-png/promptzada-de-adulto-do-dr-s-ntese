// Camadas de visibilidade. Cada "olhar" vê um conjunto diferente:
//  olho      -> L.EYE
//  câmera    -> L.EYE + L.SPIRIT + L.CAMONLY
//  vídeo     -> L.VIDEO + L.SPIRIT   (a casa como foi gravada)
//  espelhos  -> L.MIRROR             (a memória da própria casa)
//  CCTV (TV) -> L.CCTV
export const L = { EYE: 1, VIDEO: 2, MIRROR: 3, SPIRIT: 4, CCTV: 5, CAMONLY: 6 };

const MAP = { e: L.EYE, v: L.VIDEO, m: L.MIRROR, s: L.SPIRIT, c: L.CCTV, k: L.CAMONLY };

// spec: string com letras e/v/m/s/c. 'evmc' = objeto comum.
export function vis(obj, spec) {
  obj.traverse((o) => {
    o.layers.disableAll();
    for (const ch of spec) if (MAP[ch]) o.layers.enable(MAP[ch]);
    o.userData.vis = spec;
  });
  return obj;
}

export const COMMON = 'evmc';

// aplica a visibilidade padrão a tudo que ainda está só na camada 0
export function defaultVis(root) {
  root.traverse((o) => {
    if (o.isLight) { o.layers.enableAll(); return; }
    if (o.userData.vis === undefined && o.layers.mask === 1) {
      o.layers.disableAll();
      for (const ch of COMMON) o.layers.enable(MAP[ch]);
    }
  });
}
