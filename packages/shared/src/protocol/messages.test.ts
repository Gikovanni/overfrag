import { describe, expect, it } from 'vitest';
import {
  isInputCommand,
  parsePlayerName,
  type InputCommand,
} from './messages.js';

const input: InputCommand = {
  sequence: 1,
  tick: 1,
  moveX: 0,
  moveZ: -1,
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

describe('validação de comandos recebidos', () => {
  it('aceita intenção de movimento válida', () => {
    expect(isInputCommand(input)).toBe(true);
  });
  it.each([
    null,
    [],
    { ...input, sequence: -1 },
    { ...input, tick: 1.5 },
    { ...input, moveX: Infinity },
    { ...input, moveZ: NaN },
    { ...input, moveX: 1, moveZ: 1 },
    { ...input, yaw: 4 },
    { ...input, buttons: {} },
    { ...input, buttons: { ...input.buttons, fire: 'true' } },
  ])('rejeita payload inválido: %j', (payload) => {
    expect(isInputCommand(payload)).toBe(false);
  });
  it('normaliza o nome de exibição e limita seu tamanho', () => {
    expect(parsePlayerName('  <Teste>\n  ')).toBe('Teste');
    expect(parsePlayerName({})).toBe('Recruta');
    expect(parsePlayerName('a'.repeat(100))).toHaveLength(20);
  });
});
