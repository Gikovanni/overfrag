import { useEffect, useRef, useState } from 'react';
import { NETWORK } from '@overfrag/shared';
import { Game, type PerformanceView } from '../game/core/Game.js';
import {
  GameConnection,
  type ConnectionView,
} from '../game/network/GameConnection.js';

export function App() {
  const viewport = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const connection = useRef<GameConnection | null>(null);
  const [name, setName] = useState('Recruta');
  const [status, setStatus] = useState<'offline' | 'connecting' | 'online'>(
    'offline',
  );
  const [view, setView] = useState<ConnectionView | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceView | null>(null);
  const [sensitivity, setSensitivity] = useState(0.002);

  useEffect(() => {
    let cancelled = false;
    void Game.create(viewport.current!, (next) => {
      if (!cancelled) setMetrics(next);
    })
      .then((next) => {
        if (cancelled) {
          next.dispose();
          return;
        }
        game.current = next;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            'Não foi possível iniciar a arena. Confira o suporte a WebGL e recarregue a página.',
          );
      });
    return () => {
      cancelled = true;
      connection.current?.dispose();
      game.current?.dispose();
      connection.current = null;
      game.current = null;
    };
  }, []);

  useEffect(() => {
    game.current?.setSensitivity(sensitivity);
  }, [sensitivity, ready]);

  async function connect() {
    if (status !== 'offline' || !ready) return;
    setError('');
    setStatus('connecting');
    const next = new GameConnection();
    connection.current = next;
    try {
      await next.connect(
        name,
        (state, sessionId) => game.current?.setNetworkState(state, sessionId),
        setView,
        () => {
          game.current?.clearPlayers();
          setView(null);
          setStatus('offline');
        },
      );
      if (connection.current === next) setStatus('online');
    } catch {
      next.dispose();
      if (connection.current === next) {
        setStatus('offline');
        setError('Conexão indisponível. Verifique se o servidor está rodando.');
      }
    }
  }

  function disconnect() {
    connection.current?.dispose();
    connection.current = null;
    game.current?.clearPlayers();
    setView(null);
    setStatus('offline');
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          OVER<span>FRAG</span>
        </a>
        <span className="badge">Base de desenvolvimento · v0.1</span>
      </header>
      <div className="workspace">
        <aside className="panel">
          <p className="eyebrow">Campo de testes / 01</p>
          <h1>A próxima partida começa aqui.</h1>
          <p className="description">
            Explore a pista no treino local. Ao conectar à sala, você entra na
            prévia de conexões; o movimento online chega na próxima etapa.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void connect();
            }}
          >
            <label htmlFor="name">Nome do jogador</label>
            <input
              id="name"
              maxLength={20}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={status !== 'offline'}
            />
            {status === 'online' ? (
              <button type="button" onClick={disconnect}>
                Sair da sala
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void connect();
                }}
                disabled={status === 'connecting' || !ready}
              >
                {status === 'connecting' ? 'Conectando…' : 'Conectar à arena →'}
              </button>
            )}
          </form>
          <p className="error" role="status">
            {error}
          </p>
          <dl className="stats">
            <div>
              <dt>Conexão</dt>
              <dd>
                {status === 'online'
                  ? 'Online'
                  : status === 'connecting'
                    ? 'Conectando'
                    : 'Offline'}
              </dd>
            </div>
            <div>
              <dt>Jogadores</dt>
              <dd>
                {view?.players ?? 0} / {NETWORK.maxPlayers}
              </dd>
            </div>
            <div>
              <dt>RTT</dt>
              <dd>{view?.rttMs == null ? '—' : `${view.rttMs} ms`}</dd>
            </div>
            <div>
              <dt>Tick do servidor</dt>
              <dd>{view?.tick ?? '—'}</dd>
            </div>
          </dl>
          {view && <p className="room">Sala: {view.roomId}</p>}
          <label htmlFor="sensitivity">Sensibilidade do mouse</label>
          <input
            id="sensitivity"
            type="range"
            min="0.0005"
            max="0.006"
            step="0.0001"
            value={sensitivity}
            onChange={(event) => setSensitivity(Number(event.target.value))}
          />
          <p className="hint">
            Clique na arena para jogar. WASD: mover · Shift: correr · Espaço:
            pular · Ctrl: agachar · C: slide.
            <br />
            Esc libera o cursor. Rampas verdes, escadas azuis e teto roxo testam
            colisões.
          </p>
        </aside>
        <section className="arena" aria-label="Prévia 3D da arena">
          <div className="viewport" ref={viewport} />
          {!ready && (
            <div className="loading" role="status">
              {error ? 'Arena indisponível' : 'Preparando arena…'}
            </div>
          )}
          <div className="arena-label">
            <span className="dot" /> ARENA / GREYBOX
          </div>
          <div className="crosshair" aria-hidden="true">
            +
          </div>
          {metrics && (
            <div className="performance" aria-label="Métricas de movimento">
              <span>
                {metrics.fps} FPS · Física {metrics.physicsMs.toFixed(2)} ms
              </span>
              <span data-testid="movement">
                {metrics.online
                  ? 'Sala estática'
                  : `${metrics.speed.toFixed(1)} m/s · ${MOVEMENT_LABELS[metrics.movement]}`}
              </span>
              {!metrics.online && metrics.droppedSeconds > 0 && (
                <span>
                  Pausa acumulada: {metrics.droppedSeconds.toFixed(1)} s
                </span>
              )}
            </div>
          )}
          <div className="arena-footer">
            {view ? 'Sala online · movimento em breve' : 'Treino local'}
            <span>30 Hz simulação · 20 Hz patches</span>
          </div>
        </section>
      </div>
    </main>
  );
}

const MOVEMENT_LABELS = {
  grounded: 'No chão',
  airborne: 'No ar',
  crouched: 'Agachado',
  sliding: 'Deslizando',
  sprinting: 'Correndo',
};
