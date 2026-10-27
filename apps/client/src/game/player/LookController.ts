import type { PerspectiveCamera } from 'three';

export class LookController {
  private readonly onClick = () => {
    if (document.pointerLockElement !== this.canvas) {
      const request = this.canvas.requestPointerLock();
      request?.catch(() => {
        /* O usuário pode cancelar o pointer lock. */
      });
    }
  };

  private readonly onMove = (event: MouseEvent) => {
    if (document.pointerLockElement !== this.canvas) return;
    this.camera.rotation.y -= event.movementX * 0.002;
    this.camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.camera.rotation.x - event.movementY * 0.002),
    );
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: PerspectiveCamera,
  ) {
    camera.rotation.order = 'YXZ';
    canvas.addEventListener('click', this.onClick);
    document.addEventListener('mousemove', this.onMove);
  }

  dispose(): void {
    this.canvas.removeEventListener('click', this.onClick);
    document.removeEventListener('mousemove', this.onMove);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }
}
