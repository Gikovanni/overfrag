export const NETWORK = {
  roomName: 'game',
  simulationHz: 30,
  patchHz: 20,
  inputHz: 30,
  interpolationMs: 100,
  maxPlayers: 12,
  minPlayersToStart: 6,
  maxInputQueue: 60,
  maxMessagesPerSecond: 90,
} as const;

export const FIXED_STEP_SECONDS = 1 / NETWORK.simulationHz;
export const FIXED_STEP_MS = 1_000 / NETWORK.simulationHz;
export const PLAYER = {
  maxHealth: 100,
  eyeHeight: 1.65,
  crouchedEyeHeight: 1.05,
} as const;

// Metros, segundos e radianos. Parâmetros iniciais para calibrar na fase 1.
export const MOVEMENT = {
  walkSpeed: 5,
  crouchSpeed: 2.5,
  sprintSpeed: 8,
  tacticalSprintSpeed: 10,
  acceleration: 30,
  friction: 10,
  gravity: -24,
  jumpSpeed: 8,
  capsuleRadius: 0.35,
  standingHalfHeight: 0.55,
  crouchingHalfHeight: 0.25,
  slideMinSpeed: 6,
  slideDurationSeconds: 0.75,
  slideDeceleration: 6,
  slideCooldownSeconds: 0.5,
  airControl: 0.2,
  maxAirSpeed: 8,
  terminalFallSpeed: 30,
  groundStickSpeed: 2,
  controllerOffset: 0.01,
  maxSlopeRadians: Math.PI / 4,
  stepHeight: 0.3,
  stepMinWidth: 0.2,
  snapToGroundDistance: 0.2,
  coyoteTimeSeconds: 0,
  jumpBufferSeconds: 0,
  bunnyHopEnabled: false,
} as const;
