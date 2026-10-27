import type { Vec3 } from '../types/world.js';

export interface ArenaBox {
  id: string;
  center: Vec3;
  halfExtents: Vec3;
  color: number;
}

// Fonte única para as malhas do cliente e colisores fixos do servidor.
export const ARENA_BOXES: readonly ArenaBox[] = [
  {
    id: 'floor',
    center: { x: 0, y: -0.5, z: 0 },
    halfExtents: { x: 16, y: 0.5, z: 16 },
    color: 0x536b68,
  },
  {
    id: 'north',
    center: { x: 0, y: 2, z: -16 },
    halfExtents: { x: 16, y: 2, z: 0.5 },
    color: 0x243e48,
  },
  {
    id: 'south',
    center: { x: 0, y: 2, z: 16 },
    halfExtents: { x: 16, y: 2, z: 0.5 },
    color: 0x243e48,
  },
  {
    id: 'east',
    center: { x: 16, y: 2, z: 0 },
    halfExtents: { x: 0.5, y: 2, z: 16 },
    color: 0x243e48,
  },
  {
    id: 'west',
    center: { x: -16, y: 2, z: 0 },
    halfExtents: { x: 0.5, y: 2, z: 16 },
    color: 0x243e48,
  },
  {
    id: 'cover-a',
    center: { x: -4, y: 1, z: -3 },
    halfExtents: { x: 2, y: 1, z: 1 },
    color: 0xf3b55b,
  },
  {
    id: 'cover-b',
    center: { x: 4, y: 1.5, z: -6 },
    halfExtents: { x: 1.5, y: 1.5, z: 2 },
    color: 0x65bdac,
  },
];

export function getSpawnPoint(slot: number): Vec3 {
  return { x: (slot % 4) * 3 - 4.5, y: 0.9, z: 6 + Math.floor(slot / 4) * 3 };
}
