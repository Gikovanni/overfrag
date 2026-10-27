// 16 bits altos: membership; 16 bits baixos: grupos aceitos.
export const COLLISION = {
  world: (0x0001 << 16) | 0x0003,
  player: (0x0002 << 16) | 0x0003,
} as const;
