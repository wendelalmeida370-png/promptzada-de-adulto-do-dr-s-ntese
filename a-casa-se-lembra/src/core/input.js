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
    this.free = false; // modo alternativo: navegador não deixou travar o mouse
    this.lastGesture = -1e9;
    this.lockFails = 0;
    window.addEventListener('mousedown', () => { this.lastGesture = performance.now(); }, true);
    document.addEventListener('pointerlockerror', () => {
      // só desiste da trava se ela falhar logo depois de cliques de verdade (ex.: iframe sem permissão)
      if (performance.now() - this.lastGesture < 1000) this.lockFails++;
      if (!this.free && this.lockFails >= 2) { this.free = true; this.locked = true; if (this.onLockChange) this.onLockChange(true, true); }
    });
    document.addEventListener('mousemove', (e) => {
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
      this.locked = document.pointerLockElement === this.canvas;
      if (!this.locked) { this.lmb = this.rmb = false; this.down.clear(); }
      if (this.onLockChange) this.onLockChange(this.locked);
    });
  }

  onKey(fn) { this.listeners.push(fn); }
  _emit(e) { for (const fn of this.listeners) fn(e); }

  lock() {
    if (this.free) { this.locked = true; return; }
    if (this.locked) return;
    try {
      const p = this.canvas.requestPointerLock({ unadjustedMovement: false });
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* ignorado */ }
  }
  unlock() { if (this.free) { this.locked = false; return; } if (document.pointerLockElement) document.exitPointerLock(); }

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
