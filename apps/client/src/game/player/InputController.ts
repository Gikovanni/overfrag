import { InputState } from './InputState.js';

const CAPTURED_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'KeyC',
  'KeyR',
]);

export class InputController {
  readonly state = new InputState();
  private readonly onClick = () => {
    if (!this.active) {
      this.canvas.requestPointerLock()?.catch(() => {
        /* Esc pode cancelar a solicitação. */
      });
    }
  };
  private readonly onMove = (event: MouseEvent) => {
    if (this.active) this.state.look(event.movementX, event.movementY);
  };
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.active && event.code === 'Escape') {
      document.exitPointerLock();
      this.clear();
      return;
    }
    if (!this.active || !CAPTURED_KEYS.has(event.code)) return;
    event.preventDefault();
    this.state.key(event.code, true);
  };
  private readonly onKeyUp = (event: KeyboardEvent) => {
    if (this.active && CAPTURED_KEYS.has(event.code)) event.preventDefault();
    this.state.key(event.code, false);
  };
  private readonly onMouseDown = (event: MouseEvent) => {
    if (this.active) this.state.key(`Mouse${event.button}`, true);
  };
  private readonly onMouseUp = (event: MouseEvent) =>
    this.state.key(`Mouse${event.button}`, false);
  private readonly clear = () => this.state.clear();
  private readonly onVisibility = () => {
    if (document.hidden) this.clear();
  };
  private readonly onContextMenu = (event: Event) => {
    if (this.active) event.preventDefault();
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    canvas.addEventListener('click', this.onClick);
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.clear);
    document.addEventListener('visibilitychange', this.onVisibility);
    canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('blur', this.clear);
  }

  get active(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  dispose(): void {
    this.clear();
    this.canvas.removeEventListener('click', this.onClick);
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('pointerlockchange', this.clear);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('blur', this.clear);
    if (this.active) document.exitPointerLock();
  }
}
