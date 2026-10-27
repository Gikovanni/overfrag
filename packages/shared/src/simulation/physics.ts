import RAPIER from '@dimforge/rapier3d-compat';
import { ARENA_BOXES } from '../config/arena.js';
import { FIXED_STEP_SECONDS, MOVEMENT } from '../config/game.js';
import { COLLISION } from '../config/collision.js';

export { CharacterController } from './CharacterController.js';
export type { CharacterSnapshot } from './CharacterController.js';

let initialization: Promise<void> | undefined;

export async function createArenaPhysics(): Promise<RAPIER.World> {
  initialization ??= RAPIER.init();
  await initialization;
  const world = new RAPIER.World({ x: 0, y: MOVEMENT.gravity, z: 0 });
  world.timestep = FIXED_STEP_SECONDS;
  for (const { center, halfExtents, rotationZ = 0 } of ARENA_BOXES) {
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
        .setTranslation(center.x, center.y, center.z)
        .setRotation({
          x: 0,
          y: 0,
          z: Math.sin(rotationZ / 2),
          w: Math.cos(rotationZ / 2),
        })
        .setCollisionGroups(COLLISION.world),
    );
  }
  // Inicializa o broad phase antes de consultas do character controller.
  world.step();
  return world;
}
