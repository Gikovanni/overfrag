import { defineServer } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { rooms } from './matchmaking/rooms.js';

export function createGameServer() {
  return defineServer({
    transport: new WebSocketTransport(),
    rooms,
    greet: false,
    express: (app) => {
      app.get('/health', (_request, response) => {
        response.json({ status: 'ok', service: 'overfrag-server' });
      });
    },
  });
}
