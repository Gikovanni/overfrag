import { expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { createArenaPhysics } from './physics.js';

it('a arena Rapier impede um corpo dinâmico de atravessar o piso', async () => {
  const world = await createArenaPhysics();
  try {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 3, 0),
    );
    world.createCollider(RAPIER.ColliderDesc.ball(0.25), body);
    for (let tick = 0; tick < 120; tick++) world.step();
    expect(body.translation().y).toBeGreaterThan(0.2);
    expect(body.translation().y).toBeLessThan(0.3);
  } finally {
    world.free();
  }
});
