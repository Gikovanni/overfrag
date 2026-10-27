import { expect, it } from 'vitest';
import { InputState } from '../player/InputState.js';
import { LocalSimulation } from './LocalSimulation.js';

it('interpola a câmera sem modificar a física e reseta uma sessão agachada', async () => {
  const simulation = await LocalSimulation.create();
  const input = new InputState();
  const camera = { x: 0, y: 0, z: 0 };
  try {
    simulation.advance(1 / 30, (tick) => input.sample(tick));
    input.key('KeyW', true);
    input.key('ControlLeft', true);
    for (let i = 0; i < 30; i++)
      simulation.advance(1 / 30, (tick) => input.sample(tick));
    expect(simulation.state.crouched).toBe(true);
    simulation.writeCameraPosition(camera);
    expect(camera.y).toBeCloseTo(1.06, 1);
    const position = { ...simulation.state.position };
    for (let i = 0; i < 100; i++) simulation.writeCameraPosition(camera);
    expect(simulation.state.position).toEqual(position);
    input.clear();
    simulation.reset();
    simulation.writeCameraPosition(camera);
    expect(camera.z).toBe(10);
    expect(simulation.state.crouched).toBe(false);
    expect(simulation.speed).toBe(0);
    simulation.advance(1 / 30, (tick) => input.sample(tick));
    expect(simulation.state.grounded).toBe(true);
  } finally {
    simulation.dispose();
  }
});
