import { createGameServer } from './app.js';

const port = Number(process.env.PORT ?? 2567);
if (!Number.isInteger(port) || port < 1 || port > 65_535)
  throw new Error('PORT inválida.');
const server = createGameServer();
await server.listen(port);
console.info(`Overfrag: http://localhost:${port} (health: /health)`);
