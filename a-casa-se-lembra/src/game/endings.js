// Os cinco finais: um bom, um ruim e três secretos. O registro fica só neste navegador.
const EKEY = 'casa-se-lembra/endings/v1';

export const ENDINGS = [
  {
    id: 'casa', kind: 'bom', title: 'A Casa Se Lembra',
    blurb: 'Você gravou o Inquilino e apagou o vídeo. A família voltou com o sol.',
    hint: 'Enfrente o que sai da TV. E não guarde o que ele deixou para trás.',
  },
  {
    id: 'inquilino', kind: 'ruim', title: 'O Inquilino',
    blurb: 'Ele ganhou um cômodo que ninguém lembra. É um ótimo inquilino. Nunca faz barulho.',
    hint: 'Aceite o que ele oferece. Ou guarde o que devia apagar.',
  },
  {
    id: 'semsinal', kind: 'secreto', title: 'Sem Sinal',
    blurb: 'Você não respondeu, não consertou nada e não abriu a porta. A casa não precisou esconder ninguém.',
    hint: 'Na segunda noite você já sabe quem manda as mensagens. Responda como só a família responderia.',
  },
  {
    id: 'achados', kind: 'secreto', title: 'Achados e Perdidos',
    blurb: 'Alguém lembrou o nome do Morador de Antes. E ele lembrou do Inquilino.',
    hint: 'Alguém lá embaixo esqueceu o próprio nome. A câmera não esquece. Diga esse nome na hora certa.',
  },
  {
    id: 'horanenhuma', kind: 'secreto', title: 'A Hora Nenhuma',
    blurb: 'Com o relógio-ovo, você desfez o momento em que a casa foi mostrada a um desconhecido.',
    hint: 'Um balde respira muito longe no tempo. Com o relógio certo no bolso, um dia vai ser a hora.',
  },
];
export const KIND_LABEL = { bom: 'FINAL BOM', ruim: 'FINAL RUIM', secreto: 'FINAL SECRETO' };

export function seenEndings() {
  try { return JSON.parse(localStorage.getItem(EKEY)) || {}; } catch (e) { return {}; }
}
export function unlockEnding(id, info = {}) {
  const all = seenEndings();
  const isNew = !all[id];
  all[id] = { ...(all[id] || {}), at: all[id] ? all[id].at : new Date().toISOString(), last: new Date().toISOString(), count: ((all[id] && all[id].count) || 0) + 1, ...info };
  try { localStorage.setItem(EKEY, JSON.stringify(all)); } catch (e) { /* sem armazenamento */ }
  return isNew;
}
export function endingsCount() { return Object.keys(seenEndings()).filter((k) => ENDINGS.some((e) => e.id === k)).length; }
export function anyEnding() { return endingsCount() > 0; }
