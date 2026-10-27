import { afterEach, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { COLLISION } from '../config/collision.js';
import { FIXED_STEP_SECONDS, MOVEMENT } from '../config/game.js';
import type { InputCommand } from '../protocol/messages.js';
import { FixedStep } from './FixedStep.js';
import { CharacterController } from './CharacterController.js';
import { createArenaPhysics } from './physics.js';

const idle: InputCommand = {
  sequence: 0,
  tick: 0,
  moveX: 0,
  moveZ: 0,
  yaw: 0,
  pitch: 0,
  buttons: {
    jump: false,
    sprint: false,
    crouch: false,
    slide: false,
    fire: false,
    ads: false,
    reload: false,
  },
};
const worlds: RAPIER.World[] = [];
afterEach(() => {
  for (const world of worlds.splice(0)) world.free();
});

async function fixture(spawn = { x: 0, y: 0.92, z: 8 }) {
  const world = await createArenaPhysics();
  worlds.push(world);
  const player = new CharacterController(world, spawn);
  const step = (input: InputCommand = idle, ticks = 1) => {
    for (let i = 0; i < ticks; i++) {
      player.prepareStep(input);
      world.step();
    }
    return player.snapshot();
  };
  step(idle, 5);
  return { world, player, step };
}

describe('controlador de personagem Rapier', () => {
  it('não inicia slide apenas por empurrar uma parede sem deslocamento real', async () => {
    const { step } = await fixture({ x: 0, y: 0.92, z: -10 });
    const run = {
      ...idle,
      moveZ: -1,
      buttons: { ...idle.buttons, sprint: true },
    };
    step(run, 120);
    const state = step({ ...run, buttons: { ...run.buttons, slide: true } });
    expect(state.movement).not.toBe('sliding');
  });
  it('sobe os degraus da pista e permanece apoiado', async () => {
    const { step } = await fixture({ x: 4, y: 0.92, z: 0 });
    const state = step({ ...idle, moveX: 1 }, 30);
    expect(state.position.x).toBeGreaterThan(7.5);
    expect(state.position.y).toBeGreaterThan(1.4);
    expect(state.grounded).toBe(true);
  });

  it('sobe a rampa permitida sem atravessar a superfície', async () => {
    const { player, step } = await fixture({ x: -13.5, y: 0.92, z: -7 });
    let highest = 0;
    for (let i = 0; i < 36; i++) {
      const state = step({ ...idle, moveX: 1 });
      highest = Math.max(highest, state.position.y);
    }
    expect(player.snapshot().position.x).toBeGreaterThan(-10);
    expect(highest).toBeGreaterThan(2);
  });

  it('não escala rampa acima do limite e não atravessa parede fina', async () => {
    const { player, step } = await fixture({ x: -13.5, y: 0.92, z: -12 });
    const blocked = step({ ...idle, moveX: 1 }, 90);
    expect(blocked.position.x).toBeLessThan(-10.7);
    expect(blocked.position.y).toBeLessThan(1.2);
    player.reset({ x: 6, y: 0.92, z: -9 });
    step(idle, 5);
    const wall = step(
      {
        ...idle,
        moveZ: -1,
        yaw: -Math.PI / 2,
        buttons: { ...idle.buttons, sprint: true },
      },
      90,
    );
    expect(wall.position.x).toBeGreaterThan(10.4);
    expect(wall.position.x).toBeLessThan(10.62);
  });

  it('slide expira e exige cooldown mesmo recebendo comandos repetidos', async () => {
    const { step } = await fixture({ x: 0, y: 0.92, z: 12 });
    const run = {
      ...idle,
      moveZ: -1,
      buttons: { ...idle.buttons, sprint: true },
    };
    step(run, 20);
    const slide = { ...run, buttons: { ...run.buttons, slide: true } };
    expect(step(slide).movement).toBe('sliding');
    expect(step(slide, 24).movement).not.toBe('sliding');
    expect(step(slide, 5).movement).not.toBe('sliding');
  });

  it('cai, encontra o piso e permanece estável', async () => {
    const { step } = await fixture({ x: 0, y: 5, z: 8 });
    const state = step(idle, 120);
    expect(state.grounded).toBe(true);
    expect(state.position.y).toBeCloseTo(0.91, 2);
    expect(state.velocity.y).toBe(0);
  });

  it.each([30, 60, 144])(
    'percorre a mesma distância com render a %i FPS',
    async (fps) => {
      const { player, step } = await fixture();
      const start = player.snapshot().position;
      const clock = new FixedStep(FIXED_STEP_SECONDS);
      const input = { ...idle, moveZ: -1 };
      for (let frame = 0; frame < fps * 2; frame++)
        clock.advance(1 / fps, () => {
          step(input);
        });
      expect(start.z - player.snapshot().position.z).toBeCloseTo(9.6667, 2);
      expect(player.snapshot().grounded).toBe(true);
    },
  );

  it('normaliza diagonais, respeita yaw e desacelera quando solta as teclas', async () => {
    const { player, step } = await fixture();
    step({ ...idle, moveX: 1, moveZ: -1 }, 12);
    let state = player.snapshot();
    expect(Math.hypot(state.velocity.x, state.velocity.z)).toBeCloseTo(
      MOVEMENT.walkSpeed,
      2,
    );
    player.reset({ x: 0, y: 0.92, z: 8 });
    step(idle, 5);
    step({ ...idle, moveZ: -1, yaw: Math.PI / 2 }, 20);
    state = step(idle, 30);
    expect(state.position.x).toBeLessThan(-2);
    expect(state.position.z).toBeCloseTo(8);
    expect(Math.hypot(state.velocity.x, state.velocity.z)).toBeLessThan(0.01);
  });

  it('impede atravessar a parede mesmo correndo por vários segundos', async () => {
    const { step } = await fixture({ x: 0, y: 0.92, z: -10 });
    const state = step(
      { ...idle, moveZ: -1, buttons: { ...idle.buttons, sprint: true } },
      180,
    );
    expect(state.position.z).toBeGreaterThan(-15.16);
    expect(state.position.z).toBeLessThan(-15);
    expect(state.grounded).toBe(true);
  });

  it('pula somente no chão e volta a aterrissar', async () => {
    const { step } = await fixture();
    const jump = { ...idle, buttons: { ...idle.buttons, jump: true } };
    expect(step(jump).grounded).toBe(false);
    const apex = step(jump, 5); // Mesmo um cliente repetindo jump não ganha impulso no ar.
    expect(apex.velocity.y).toBeLessThan(MOVEMENT.jumpSpeed);
    expect(apex.position.y).toBeGreaterThan(1.8);
    const landed = step(idle, 90);
    expect(landed.grounded).toBe(true);
    expect(landed.position.y).toBeCloseTo(0.91, 2);
  });

  it('não permite levantar sob teto baixo e preserva a posição dos pés', async () => {
    const { world, player, step } = await fixture({ x: 0, y: 0.92, z: 4 });
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(2, 0.2, 2)
        .setTranslation(0, 1.5, 0)
        .setCollisionGroups(COLLISION.world),
    );
    world.step();
    const crouch = {
      ...idle,
      moveZ: -1,
      buttons: { ...idle.buttons, crouch: true },
    };
    step(crouch, 36);
    expect(player.snapshot().position.z).toBeLessThan(2);
    expect(
      player.snapshot().position.y -
        MOVEMENT.crouchingHalfHeight -
        MOVEMENT.capsuleRadius,
    ).toBeCloseTo(0.01, 2);
    expect(step(idle, 5).crouched).toBe(true);
    step({ ...idle, moveZ: 1, buttons: crouch.buttons }, 50);
    expect(step(idle, 5).crouched).toBe(false);
  });

  it('slide exige velocidade e não ganha impulso com repetição; aceita slide → jump → land', async () => {
    const { player, step } = await fixture({ x: 0, y: 0.92, z: 12 });
    const slide = { ...idle, buttons: { ...idle.buttons, slide: true } };
    expect(step(slide).movement).not.toBe('sliding');
    step(
      { ...idle, moveZ: -1, buttons: { ...idle.buttons, sprint: true } },
      20,
    );
    const before = Math.hypot(
      player.snapshot().velocity.x,
      player.snapshot().velocity.z,
    );
    expect(step(slide).movement).toBe('sliding');
    const sliding = step(slide, 4);
    expect(Math.hypot(sliding.velocity.x, sliding.velocity.z)).toBeLessThan(
      before,
    );
    expect(sliding.crouched).toBe(true);
    const jumping = step({ ...idle, buttons: { ...idle.buttons, jump: true } });
    expect(jumping.movement).toBe('airborne');
    expect(jumping.velocity.y).toBeGreaterThan(0);
    expect(
      Math.hypot(jumping.velocity.x, jumping.velocity.z),
    ).toBeLessThanOrEqual(MOVEMENT.maxAirSpeed + 0.01);
    expect(step(idle, 90).grounded).toBe(true);
  });

  it('colisões ignoram sensores e descartam corpo e controlador', async () => {
    const { world, player, step } = await fixture();
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(5, 2, 0.1)
        .setTranslation(0, 2, 6)
        .setSensor(true),
    );
    world.step();
    expect(step({ ...idle, moveZ: -1 }, 30).position.z).toBeLessThan(4);
    const count = world.bodies.len();
    player.dispose();
    player.dispose();
    expect(world.bodies.len()).toBe(count - 1);
    expect(() => world.step()).not.toThrow();
  });
});
