import {
  FixedStep,
  FIXED_STEP_SECONDS,
  MOVEMENT,
  PLAYER,
  type InputCommand,
  type Vec3,
} from '@overfrag/shared';
import {
  CharacterController,
  createArenaPhysics,
  type CharacterSnapshot,
} from '@overfrag/shared/physics';

const SPAWN = {
  x: 0,
  y:
    MOVEMENT.standingHalfHeight +
    MOVEMENT.capsuleRadius +
    MOVEMENT.controllerOffset,
  z: 10,
};

export class LocalSimulation {
  private clock = new FixedStep(FIXED_STEP_SECONDS);
  private readonly character: CharacterController;
  private previous: CharacterSnapshot;
  private current: CharacterSnapshot;
  private tick = 0;
  physicsMs = 0;
  speed = 0;

  private constructor(
    private readonly world: Awaited<ReturnType<typeof createArenaPhysics>>,
  ) {
    this.character = new CharacterController(world, SPAWN);
    this.current = this.character.snapshot();
    this.previous = this.current;
  }

  static async create(): Promise<LocalSimulation> {
    return new LocalSimulation(await createArenaPhysics());
  }

  advance(deltaSeconds: number, sample: (tick: number) => InputCommand): void {
    const start = performance.now();
    const steps = this.clock.advance(deltaSeconds, () => {
      this.previous = this.current;
      this.character.prepareStep(sample(this.tick++));
      this.world.step();
      this.current = this.character.snapshot();
      this.speed =
        Math.hypot(
          this.current.position.x - this.previous.position.x,
          this.current.position.z - this.previous.position.z,
        ) / FIXED_STEP_SECONDS;
    });
    if (steps > 0) this.physicsMs = (performance.now() - start) / steps;
  }

  private eyeY(state: CharacterSnapshot): number {
    const halfHeight = state.crouched
      ? MOVEMENT.crouchingHalfHeight
      : MOVEMENT.standingHalfHeight;
    const eyeHeight = state.crouched
      ? PLAYER.crouchedEyeHeight
      : PLAYER.eyeHeight;
    return state.position.y - halfHeight - MOVEMENT.capsuleRadius + eyeHeight;
  }

  writeCameraPosition(target: Vec3): void {
    const alpha = this.clock.alpha;
    target.x =
      this.previous.position.x +
      (this.current.position.x - this.previous.position.x) * alpha;
    target.y =
      this.eyeY(this.previous) +
      (this.eyeY(this.current) - this.eyeY(this.previous)) * alpha;
    target.z =
      this.previous.position.z +
      (this.current.position.z - this.previous.position.z) * alpha;
  }

  get state(): CharacterSnapshot {
    return this.current;
  }
  get droppedSeconds(): number {
    return this.clock.droppedSeconds;
  }

  reset(): void {
    this.character.reset(SPAWN);
    this.current = this.character.snapshot();
    this.previous = this.current;
    this.clock = new FixedStep(FIXED_STEP_SECONDS);
    this.speed = 0;
    this.physicsMs = 0;
    this.tick = 0;
  }

  dispose(): void {
    this.character.dispose();
    this.world.free();
  }
}
