export const MESSAGE = { input: 'input', ping: 'ping', pong: 'pong' } as const;

export interface InputCommand {
  sequence: number;
  tick: number;
  moveX: number;
  moveZ: number;
  yaw: number;
  pitch: number;
  buttons: {
    jump: boolean;
    sprint: boolean;
    crouch: boolean;
    slide: boolean;
    fire: boolean;
    ads: boolean;
    reload: boolean;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedNumber(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

export function isInputCommand(value: unknown): value is InputCommand {
  if (!isRecord(value) || !isRecord(value.buttons)) return false;
  const buttons = value.buttons;
  return (
    Number.isSafeInteger(value.sequence) &&
    boundedNumber(value.sequence, 0, Number.MAX_SAFE_INTEGER) &&
    Number.isSafeInteger(value.tick) &&
    boundedNumber(value.tick, 0, Number.MAX_SAFE_INTEGER) &&
    boundedNumber(value.moveX, -1, 1) &&
    boundedNumber(value.moveZ, -1, 1) &&
    Math.hypot(value.moveX, value.moveZ) <= 1.000001 &&
    boundedNumber(value.yaw, -Math.PI, Math.PI) &&
    boundedNumber(value.pitch, -Math.PI / 2, Math.PI / 2) &&
    ['jump', 'sprint', 'crouch', 'slide', 'fire', 'ads', 'reload'].every(
      (key) => typeof buttons[key] === 'boolean',
    )
  );
}

export function parsePlayerName(value: unknown): string {
  if (typeof value !== 'string') return 'Recruta';
  return (
    value
      .replace(/[\p{C}<>]/gu, '')
      .trim()
      .slice(0, 20) || 'Recruta'
  );
}
