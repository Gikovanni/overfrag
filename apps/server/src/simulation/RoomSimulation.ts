import { FixedStep, FIXED_STEP_SECONDS } from '@overfrag/shared';
import { createArenaPhysics } from '@overfrag/shared/physics';

export class RoomSimulation {
  private readonly clock = new FixedStep(FIXED_STEP_SECONDS);

  private constructor(
    private readonly world: Awaited<ReturnType<typeof createArenaPhysics>>,
  ) {}

  static async create(): Promise<RoomSimulation> {
    return new RoomSimulation(await createArenaPhysics());
  }

  advance(deltaMs: number, onTick: () => void): void {
    this.clock.advance(deltaMs / 1_000, () => {
      this.world.step();
      onTick();
    });
  }

  dispose(): void {
    this.world.free();
  }
}
