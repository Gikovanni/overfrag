import { describe, expect, it } from 'vitest';
import { isInputCommand } from '@overfrag/shared';
import { InputState } from './InputState.js';

describe('buffer de input', () => {
  it('preserva uma pressão curta entre ticks e não repete jump segurado', () => {
    const input = new InputState();
    input.key('Space', true);
    input.key('Space', false);
    expect(input.sample(0).buttons.jump).toBe(true);
    expect(input.sample(1).buttons.jump).toBe(false);
    input.key('Space', true);
    expect(input.sample(2).buttons.jump).toBe(true);
    input.key('Space', true); // Repetição do sistema operacional.
    expect(input.sample(3).buttons.jump).toBe(false);
  });
  it('normaliza diagonal, cancela opostos e mantém comandos válidos e sequenciados', () => {
    const input = new InputState();
    input.key('KeyW', true);
    input.key('KeyD', true);
    input.key('ShiftLeft', true);
    const command = input.sample(15);
    expect(Math.hypot(command.moveX, command.moveZ)).toBeCloseTo(1);
    expect(command.buttons.sprint).toBe(true);
    expect(isInputCommand(command)).toBe(true);
    input.key('KeyS', true);
    input.key('KeyA', true);
    const next = input.sample(16);
    expect(next.sequence).toBe(command.sequence + 1);
    expect(next.moveX).toBe(0);
    expect(next.moveZ).toBe(0);
  });
  it('consome slide uma vez e limpa teclas/botões ao perder foco', () => {
    const input = new InputState();
    for (const code of ['KeyC', 'ControlLeft', 'Mouse0', 'KeyW'])
      input.key(code, true);
    expect(input.sample(0).buttons.slide).toBe(true);
    expect(input.sample(1).buttons.slide).toBe(false);
    input.clear();
    expect(input.sample(2)).toMatchObject({
      moveX: 0,
      moveZ: 0,
      buttons: { crouch: false, fire: false, slide: false },
    });
  });
  it('limita pitch e mantém yaw válido mesmo após várias voltas', () => {
    const input = new InputState();
    input.look(100_000, 100_000);
    expect(input.pitch).toBe(-Math.PI / 2);
    expect(isInputCommand(input.sample(0))).toBe(true);
  });
});
