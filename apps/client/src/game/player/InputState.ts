import type { InputCommand } from '@overfrag/shared';

/** Buffer de eventos: bordas sobrevivem entre frames até serem consumidas por um tick. */
export class InputState {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<string>();
  private sequence = 0;
  yaw = 0;
  pitch = 0;
  sensitivity = 0.002;

  key(code: string, down: boolean): void {
    if (down) {
      if (!this.held.has(code)) this.pressed.add(code);
      this.held.add(code);
    } else this.held.delete(code);
  }

  look(dx: number, dy: number): void {
    this.yaw =
      ((((this.yaw - dx * this.sensitivity + Math.PI) % (2 * Math.PI)) +
        2 * Math.PI) %
        (2 * Math.PI)) -
      Math.PI;
    this.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.pitch - dy * this.sensitivity),
    );
  }

  sample(tick: number): InputCommand {
    const has = (...codes: string[]) =>
      codes.some((code) => this.held.has(code));
    const x =
      Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft'));
    const z = Number(has('KeyS', 'ArrowDown')) - Number(has('KeyW', 'ArrowUp'));
    const length = Math.max(1, Math.hypot(x, z));
    const input: InputCommand = {
      sequence: this.sequence++,
      tick,
      moveX: x / length,
      moveZ: z / length,
      yaw: this.yaw,
      pitch: this.pitch,
      buttons: {
        jump: this.pressed.has('Space'),
        slide: this.pressed.has('KeyC'),
        reload: this.pressed.has('KeyR'),
        sprint: has('ShiftLeft', 'ShiftRight'),
        crouch: has('ControlLeft', 'ControlRight'),
        fire: has('Mouse0'),
        ads: has('Mouse2'),
      },
    };
    this.pressed.clear();
    return input;
  }

  clear(): void {
    this.held.clear();
    this.pressed.clear();
  }
}
