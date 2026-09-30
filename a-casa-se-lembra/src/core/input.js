// Teclado + mouse com pointer lock.
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set();
    this.pressed = new Set();
    this.mdx = 0;
    this.mdy = 0;
    this.lmb = false;
    this.rmb = false;
    this.lclick = false;
    this.wheel = 0;
    this.locked = false;
    this.enabled = true;
    this.listeners = [];
    this.onLockChange = null;

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
        if (e.code === 'Escape' || e.code === 'Enter') this._emit(e);
        return;
      }
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
      this._emit(e);
    });
    window.addEventListener('keyup', (e) => { this.down.delete(e.code); });
    window.addEventListener('blur', () => { this.down.clear(); this.lmb = this.rmb = false; });
    // modo sem travar o cursor: só quando a pessoa escolhe (opção "Mouse" ou botão da tela de clique).
    // Antes ele ligava sozinho depois de duas recusas do navegador (ex.: voltar menos de 1 s depois do ESC)
    // e ficava ligado pra sempre, com a câmera "desregulada".
    this.free = false;
    this.pending = false; // pedido de trava em andamento
    this.lockFails = 0;
    this.onLockFail = null;
    this.cx = 0; this.cy = 0; // posição do cursor (-1..1), usada no modo sem travar
    document.addEventListener('pointerlockerror', () => { if (this.pending) this._failed(); });
    document.addEventListener('mousemove', (e) => {
      this.cx = (e.clientX / Math.max(1, innerWidth)) * 2 - 1;
      this.cy = (e.clientY / Math.max(1, innerHeight)) * 2 - 1;
      if (!this.locked) return;
      // alguns navegadores geram picos enormes ao travar o mouse
      if (Math.abs(e.movementX) > 400 || Math.abs(e.movementY) > 400) return;
      this.mdx += e.movementX;
      this.mdy += e.movementY;
    });
    document.addEventListener('mousedown', (e) => {
      if (!this.locked) return;
      if (e.button === 0) { this.lmb = true; this.lclick = true; }
      if (e.button === 2) this.rmb = true;
    });
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.lmb = false;
      if (e.button === 2) this.rmb = false;
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('wheel', (e) => { if (this.locked) this.wheel += Math.sign(e.deltaY); }, { passive: true });
    document.addEventListener('pointerlockchange', () => {
      if (this.free) return;
      this.pending = false;
      this.locked = document.pointerLockElement === this.canvas;
      if (this.locked) this.lockFails = 0;
      if (!this.locked) { this.lmb = this.rmb = false; this.down.clear(); }
      if (this.onLockChange) this.onLockChange(this.locked);
    });
  }
  _failed() {
    if (this.free) return;
    this.pending = false;
    this.lockFails++;
    if (this.onLockFail) this.onLockFail(this.lockFails);
  }
  setFree(v) {
    if (this.free === !!v) return;
    this.free = !!v;
    if (this.free && document.pointerLockElement) document.exitPointerLock();
    this.locked = false;
    this.pending = false;
  }

  onKey(fn) { this.listeners.push(fn); }
  _emit(e) { for (const fn of this.listeners) fn(e); }

  lock() {
    if (this.free) { this.locked = true; return; }
    if (this.locked || this.pending) return;
    if (!this.canvas.requestPointerLock) { this._failed(); return; }
    this.pending = true;
    try {
      const p = this.canvas.requestPointerLock();
      // no Chrome a recusa chega pela promessa e pelo evento pointerlockerror; _failed ignora a repetida
      if (p && p.catch) p.catch(() => { if (this.pending) this._failed(); });
    } catch (e) { this._failed(); }
  }
  unlock() {
    if (this.free) { this.locked = false; return; }
    this.pending = false;
    if (document.pointerLockElement) document.exitPointerLock();
  }

  key(code) { return this.down.has(code); }
  hit(code) { return this.pressed.has(code); }

  endFrame() {
    this.pressed.clear();
    this.mdx = 0;
    this.mdy = 0;
    this.lclick = false;
    this.wheel = 0;
  }
}
