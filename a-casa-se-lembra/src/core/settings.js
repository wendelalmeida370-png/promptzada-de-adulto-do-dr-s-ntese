// Opções e nomes personalizáveis. Tudo fica só no navegador (localStorage).
const SKEY = 'casa-se-lembra/settings/v1';
const NKEY = 'casa-se-lembra/names/v1';

export const DEFAULT_SETTINGS = {
  master: 0.9,
  music: 0.8,
  sfx: 1.0,
  voices: 0.9,
  sensitivity: 1.0,
  invertY: false,
  fov: 72,
  shake: 1.0, // intensidade do tremor de câmera (0..1)
  scare: 2, // 0 = sem jump scares, 1 = suaves, 2 = completos
  flashes: true, // luzes piscando / flashes fortes
  tts: true, // vozes sintetizadas pelo navegador
  quality: 'auto', // auto | low | high
  storyMode: false, // perseguições não te pegam
};

export const DEFAULT_NAMES = {
  rafaela: 'Rafaela',
  rafa: 'Rafa',
  wendel: 'Wendel',
  julia: 'Júlia',
  mae: 'Josi',
  pai: 'Henrique',
  pedro: 'Pedro',
  bento: 'Bento',
  lili: 'Lili',
  sobrenome: '',
  escola: '',
};

function load(key, defs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...defs };
    return { ...defs, ...JSON.parse(raw) };
  } catch (e) {
    return { ...defs };
  }
}

export const settings = load(SKEY, DEFAULT_SETTINGS);
export const names = load(NKEY, DEFAULT_NAMES);

export function saveSettings() {
  try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (e) { /* armazenamento indisponível */ }
}
export function saveNames() {
  for (const k of Object.keys(DEFAULT_NAMES)) {
    if (typeof names[k] !== 'string') names[k] = DEFAULT_NAMES[k];
    names[k] = names[k].trim().slice(0, 40);
    if (!names[k] && k !== 'sobrenome' && k !== 'escola') names[k] = DEFAULT_NAMES[k];
  }
  try { localStorage.setItem(NKEY, JSON.stringify(names)); } catch (e) { /* armazenamento indisponível */ }
}

// Troca {rafa}, {wendel}... pelos nomes configurados.
export function T(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => {
    if (k === 'RAFA') return names.rafa.toUpperCase();
    if (k === 'RAFAELA') return names.rafaela.toUpperCase();
    if (k === 'nomecompleto') return (names.rafaela + (names.sobrenome ? ' ' + names.sobrenome : '')).trim();
    if (k === 'colegio') return names.escola ? names.escola : 'o colégio';
    return names[k] !== undefined ? names[k] : m;
  });
}
