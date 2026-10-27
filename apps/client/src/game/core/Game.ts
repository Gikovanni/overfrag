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
import {
  ARENA_BOXES,
  MOVEMENT,
  PLAYER,
  type MovementState,
} from '@overfrag/shared';
import type { GameState } from '@overfrag/shared/schema';
import { InputController } from '../player/InputController.js';
import type { LocalSimulation } from '../physics/LocalSimulation.js';

export interface PerformanceView {
  fps: number;
  physicsMs: number;
  speed: number;
  movement: MovementState;
  droppedSeconds: number;
  online: boolean;
  inputActive: boolean;
}

export class Game {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(75, 1, 0.05, 120);
  private readonly resizeObserver: ResizeObserver;
  private readonly input: InputController;
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
  private lastFrame: number | undefined;
  private metricSeconds = 0;
  private metricFrames = 0;
  private disposed = false;

  static async create(
    container: HTMLElement,
    onMetrics: (view: PerformanceView) => void,
  ): Promise<Game> {
    const { LocalSimulation } = await import('../physics/LocalSimulation.js');
    const simulation = await LocalSimulation.create();
    try {
      return new Game(container, simulation, onMetrics);
    } catch (error) {
      simulation.dispose();
      throw error;
    }
  }

  private constructor(
    private readonly container: HTMLElement,
    private readonly simulation: LocalSimulation,
    private readonly onMetrics: (view: PerformanceView) => void,
  ) {
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
      mesh.rotation.z = box.rotationZ ?? 0;
      this.scene.add(mesh);
    }
    this.camera.position.set(0, PLAYER.eyeHeight, 10);
    this.camera.rotation.order = 'YXZ';
    this.input = new InputController(this.renderer.domElement);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.resize();
    this.renderer.setAnimationLoop(this.frame);
  }

  private readonly frame = (timeMs: number) => {
    const delta =
      this.lastFrame === undefined
        ? 0
        : Math.max(0, (timeMs - this.lastFrame) / 1_000);
    this.lastFrame = timeMs;
    const online = this.localSessionId !== undefined;
    if (!online) {
      this.simulation.advance(delta, (tick) => this.input.state.sample(tick));
      this.simulation.writeCameraPosition(this.camera.position);
    }
    this.camera.rotation.x = this.input.state.pitch;
    this.camera.rotation.y = this.input.state.yaw;
    this.renderer.render(this.scene, this.camera);
    this.metricFrames++;
    this.metricSeconds += delta;
    if (this.metricSeconds >= 0.2) {
      this.onMetrics({
        fps: Math.round(this.metricFrames / this.metricSeconds),
        physicsMs: online ? 0 : this.simulation.physicsMs,
        speed: online ? 0 : this.simulation.speed,
        movement: this.simulation.state.movement,
        droppedSeconds: this.simulation.droppedSeconds,
        online,
        inputActive: this.input.active,
      });
      this.metricFrames = 0;
      this.metricSeconds = 0;
    }
  };

  setSensitivity(sensitivity: number): void {
    if (Number.isFinite(sensitivity))
      this.input.state.sensitivity = Math.max(
        0.0005,
        Math.min(0.006, sensitivity),
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
        local.y +
          PLAYER.eyeHeight -
          MOVEMENT.standingHalfHeight -
          MOVEMENT.capsuleRadius,
        local.z,
      );
      this.localSessionId = sessionId;
      this.input.state.clear();
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
    if (!this.disposed) {
      this.simulation.reset();
      this.input.state.clear();
      this.lastFrame = undefined;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.input.dispose();
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
    this.simulation.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
