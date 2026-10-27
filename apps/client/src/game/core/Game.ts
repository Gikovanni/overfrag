import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { ARENA_BOXES, PLAYER } from '@overfrag/shared';
import type { GameState } from '@overfrag/shared/schema';
import { LookController } from '../player/LookController.js';

export class Game {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(75, 1, 0.05, 120);
  private readonly resizeObserver: ResizeObserver;
  private readonly look: LookController;
  private readonly avatars = new Map<
    string,
    Mesh<CapsuleGeometry, MeshStandardMaterial>
  >();
  private readonly avatarGeometry = new CapsuleGeometry(0.35, 1.1, 4, 8);
  private readonly avatarMaterial = new MeshStandardMaterial({
    color: 0xffbd66,
    roughness: 0.8,
  });
  private localSessionId: string | undefined;

  constructor(private readonly container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.append(this.renderer.domElement);
    this.scene.background = new Color(0x9cc8cf);
    this.scene.fog = new Fog(0x9cc8cf, 25, 85);
    this.scene.add(new HemisphereLight(0xe4f9ff, 0x35473c, 2.5));
    const sun = new DirectionalLight(0xffedcf, 3);
    sun.position.set(8, 15, 4);
    this.scene.add(sun);
    for (const box of ARENA_BOXES) {
      const geometry = new BoxGeometry(
        box.halfExtents.x * 2,
        box.halfExtents.y * 2,
        box.halfExtents.z * 2,
      );
      const mesh = new Mesh(
        geometry,
        new MeshStandardMaterial({ color: box.color, roughness: 0.9 }),
      );
      mesh.position.set(box.center.x, box.center.y, box.center.z);
      this.scene.add(mesh);
    }
    this.camera.position.set(0, PLAYER.eyeHeight, 10);
    this.look = new LookController(this.renderer.domElement, this.camera);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.resize();
    this.renderer.setAnimationLoop(() =>
      this.renderer.render(this.scene, this.camera),
    );
  }

  private readonly resize = () => {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  setNetworkState(state: GameState, sessionId: string): void {
    const local = state.players.get(sessionId);
    if (local && this.localSessionId !== sessionId) {
      this.camera.position.set(
        local.x,
        local.y + PLAYER.eyeHeight - 0.9,
        local.z,
      );
      this.localSessionId = sessionId;
    }
    const visible = new Set<string>();
    state.players.forEach((player, id) => {
      if (id === sessionId) return;
      visible.add(id);
      let avatar = this.avatars.get(id);
      if (!avatar) {
        avatar = new Mesh(this.avatarGeometry, this.avatarMaterial);
        this.avatars.set(id, avatar);
        this.scene.add(avatar);
      }
      avatar.position.set(player.x, player.y, player.z);
      avatar.rotation.y = player.yaw;
    });
    for (const [id, avatar] of this.avatars) {
      if (!visible.has(id)) {
        this.scene.remove(avatar);
        this.avatars.delete(id);
      }
    }
  }

  clearPlayers(): void {
    for (const avatar of this.avatars.values()) this.scene.remove(avatar);
    this.avatars.clear();
    this.localSessionId = undefined;
    this.camera.position.set(0, PLAYER.eyeHeight, 10);
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.look.dispose();
    this.clearPlayers();
    this.scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const material of materials) material.dispose();
      }
    });
    this.avatarGeometry.dispose();
    this.avatarMaterial.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
