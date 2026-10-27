import { schema, t, type SchemaType } from '@colyseus/schema';
import { PLAYER } from '../config/game.js';

export const PlayerSchema = schema(
  {
    name: t.string().default('Recruta'),
    x: t.float32().default(0),
    y: t.float32().default(0.9),
    z: t.float32().default(0),
    yaw: t.float32().default(0),
    pitch: t.float32().default(0),
    health: t.uint8().default(PLAYER.maxHealth),
    lastProcessedSequence: t.number().default(-1),
  },
  'PlayerSchema',
);
export type PlayerSchema = SchemaType<typeof PlayerSchema>;

export const GameState = schema(
  {
    players: t.map(PlayerSchema),
    tick: t.number().default(0),
    phase: t.string().default('waiting'),
  },
  'GameState',
);
export type GameState = SchemaType<typeof GameState>;
