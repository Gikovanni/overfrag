import { describe, expect, it } from 'vitest';
import { FixedStep } from './FixedStep.js';

describe('simulação independente do render', () => {
  it.each([30, 60, 144])(
    'mantém 30 ticks em um segundo renderizando a %i FPS',
    (fps) => {
      const loop = new FixedStep(1 / 30);
      let ticks = 0;
      for (let i = 0; i < fps; i++) loop.advance(1 / fps, () => ticks++);
      expect(ticks).toBe(30);
      expect(loop.droppedSeconds).toBe(0);
    },
  );
  it('limita o backlog e registra tempo descartado após uma pausa', () => {
    const loop = new FixedStep(1 / 30, 5);
    expect(loop.advance(2, () => undefined)).toBe(5);
    expect(loop.droppedSeconds).toBeCloseTo(55 / 30);
    expect(loop.alpha).toBeLessThan(1);
  });
  it('ignora deltas inválidos', () => {
    const loop = new FixedStep(1 / 30);
    for (const delta of [-1, NaN, Infinity])
      expect(
        loop.advance(delta, () => {
          throw new Error('não deve executar');
        }),
      ).toBe(0);
  });
});
