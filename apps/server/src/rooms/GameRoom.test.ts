import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { Client, type Room } from '@colyseus/sdk';
import { MESSAGE, NETWORK } from '@overfrag/shared';
import type { GameState } from '@overfrag/shared/schema';
import { createGameServer } from '../app.js';
import {
  GameConnection,
  type ConnectionView,
} from '../../../client/src/game/network/GameConnection.js';

let server: ReturnType<typeof createGameServer>;
let endpoint: string;
const connections: Room<GameState>[] = [];

beforeAll(async () => {
  server = createGameServer();
  await server.listen(0, '127.0.0.1');
  const address = server.transport.server?.address();
  if (!address || typeof address === 'string')
    throw new Error('Servidor sem porta de teste.');
  endpoint = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await Promise.allSettled(connections.splice(0).map((room) => room.leave()));
});

afterAll(async () => {
  await server?.gracefullyShutdown(false);
});

it('conecta dois clientes, replica spawn/ticks, responde ping e remove quem sai', async () => {
  const health = await fetch(`${endpoint}/health`);
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({
    status: 'ok',
    service: 'overfrag-server',
  });

  const first = await new Client(endpoint).joinOrCreate<GameState>(
    NETWORK.roomName,
    { name: 'Alpha' },
  );
  connections.push(first);
  const second = await new Client(endpoint).joinOrCreate<GameState>(
    NETWORK.roomName,
    { name: 'Bravo' },
  );
  connections.push(second);
  expect(first.roomId).toBe(second.roomId);
  await expect.poll(() => first.state?.players.size).toBe(2);
  await expect.poll(() => second.state?.players.size).toBe(2);
  expect(first.state.players.get(first.sessionId)?.name).toBe('Alpha');
  expect(first.state.players.get(second.sessionId)?.name).toBe('Bravo');
  expect(first.state.players.get(first.sessionId)?.x).not.toBe(
    first.state.players.get(second.sessionId)?.x,
  );
  await expect.poll(() => first.state.tick).toBeGreaterThan(0);

  let pong: unknown;
  first.onMessage(MESSAGE.pong, (value: unknown) => {
    pong = value;
  });
  first.send(MESSAGE.ping, 123);
  await expect.poll(() => pong).toBe(123);

  await second.leave();
  connections.splice(connections.indexOf(second), 1);
  await expect.poll(() => first.state.players.size).toBe(1);
  expect(first.state.players.has(second.sessionId)).toBe(false);
});

it('publica o primeiro estado da sala pelo adaptador usado pela interface', async () => {
  vi.stubEnv('VITE_SERVER_URL', endpoint);
  const connection = new GameConnection();
  let view: ConnectionView | undefined;
  try {
    await connection.connect(
      'Interface',
      () => undefined,
      (next) => {
        view = next;
      },
      () => undefined,
    );
    await expect.poll(() => view?.players).toBe(1);
    expect(view?.roomId).toBeTruthy();
  } finally {
    connection.dispose();
    vi.unstubAllEnvs();
  }
});
