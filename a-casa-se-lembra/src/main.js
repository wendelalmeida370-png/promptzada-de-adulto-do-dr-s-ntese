// Ponto de entrada. Mostra erros na tela para facilitar relatos de problema.
import { Game } from './game/game.js';

function showError(msg) {
  const e = document.getElementById('err');
  if (!e) return;
  e.classList.remove('hidden');
  e.textContent = 'Erro: ' + msg + '\n(Tente recarregar a página. Se persistir, use Chrome, Edge ou Firefox atualizados.)';
}
window.addEventListener('error', (ev) => showError(ev.message + (ev.filename ? ' @ ' + ev.filename.split('/').pop() + ':' + ev.lineno : '')));
window.addEventListener('unhandledrejection', (ev) => showError(String(ev.reason && ev.reason.stack ? ev.reason.stack : ev.reason)));

function boot() {
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) { showError('Seu navegador não suporta WebGL.'); return; }
    window.__casa = new Game();
  } catch (e) {
    console.error(e);
    showError(e && e.stack ? e.stack : String(e));
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
