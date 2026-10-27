import { Room, type Client } from '@colyseus/core';
import {
  FIXED_STEP_MS,
  getSpawnPoint,
  MESSAGE,
  NETWORK,
  parsePlayerName,
} from '@overfrag/shared';
import { GameState, PlayerSchema } from '@overfrag/shared/schema';
import { RoomSimulation } from '../simulation/RoomSimulation.js';

export class GameRoom extends Room<{ state: GameState }> {
  override maxClients = NETWORK.maxPlayers;
  override state = new GameState();
  private simulation?: RoomSimulation;
  private readonly spawnSlots = new Map<string, number>();

  override async onCreate(): Promise<void> {
    this.patchRate = 1_000 / NETWORK.patchHz;
    this.maxMessagesPerSecond = NETWORK.maxMessagesPerSecond;
    this.simulation = await RoomSimulation.create();
    this.onMessage(MESSAGE.ping, (client, nonce: unknown) => {
      if (typeof nonce === 'number' && Number.isFinite(nonce))
        client.send(MESSAGE.pong, nonce);
    });
    // Inputs de gameplay serão registrados com validação e fila na fase F03.
    this.setSimulationInterval((deltaMs) => {
      this.simulation?.advance(deltaMs, () => {
        this.state.tick++;
      });
    }, FIXED_STEP_MS);
  }

  override onJoin(client: Client, options: unknown): void {
    let slot = 0;
    const occupied = new Set(this.spawnSlots.values());
    while (occupied.has(slot)) slot++;
    this.spawnSlots.set(client.sessionId, slot);
    const player = new PlayerSchema();
    player.name = parsePlayerName(
      typeof options === 'object' && options !== null && 'name' in options
        ? options.name
        : undefined,
    );
    Object.assign(player, getSpawnPoint(slot));
    this.state.players.set(client.sessionId, player);
  }

  override onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
    this.spawnSlots.delete(client.sessionId);
  }

  override onDispose(): void {
    this.simulation?.dispose();
  }
}
