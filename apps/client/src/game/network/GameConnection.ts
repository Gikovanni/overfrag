import { Client, type Room } from '@colyseus/sdk';
import { MESSAGE, NETWORK } from '@overfrag/shared';
import type { GameState } from '@overfrag/shared/schema';

export interface ConnectionView {
  roomId: string;
  players: number;
  tick: number;
  rttMs: number | null;
}

export class GameConnection {
  private room: Room<GameState> | undefined;
  private pingTimer: ReturnType<typeof setInterval> | undefined;
  private disposed = false;

  async connect(
    name: string,
    onState: (state: GameState, sessionId: string) => void,
    onView: (view: ConnectionView) => void,
    onLeave: () => void,
  ): Promise<void> {
    const endpoint = import.meta.env.VITE_SERVER_URL || 'http://localhost:2567';
    const room = await new Client(endpoint).joinOrCreate<GameState>(
      NETWORK.roomName,
      { name },
    );
    if (this.disposed) {
      await room.leave();
      return;
    }
    this.room = room;
    let rttMs: number | null = null;
    const publish = () => {
      // O handshake pode terminar antes de o primeiro snapshot ser decodificado.
      if (this.disposed || !room.state?.players) return;
      onState(room.state, room.sessionId);
      onView({
        roomId: room.roomId,
        players: room.state.players.size,
        tick: room.state.tick,
        rttMs,
      });
    };
    room.onStateChange(publish);
    room.onMessage(MESSAGE.pong, (sent: number) => {
      rttMs = Math.round(performance.now() - sent);
    });
    room.onLeave(() => {
      this.stopPing();
      if (!this.disposed) onLeave();
    });
    this.pingTimer = setInterval(
      () => room.send(MESSAGE.ping, performance.now()),
      1_000,
    );
    publish();
  }

  private stopPing(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = undefined;
  }

  dispose(): void {
    this.disposed = true;
    this.stopPing();
    if (this.room) {
      void this.room.leave().catch(() => undefined);
      this.room = undefined;
    }
  }
}
