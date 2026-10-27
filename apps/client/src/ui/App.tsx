import { useEffect, useRef, useState } from 'react';
import { NETWORK } from '@overfrag/shared';
import { Game } from '../game/core/Game.js';
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

  useEffect(() => {
    try {
      game.current = new Game(viewport.current!);
    } catch {
      setError(
        'Não foi possível iniciar o WebGL. Confira o suporte do navegador.',
      );
    }
    return () => {
      connection.current?.dispose();
      game.current?.dispose();
      connection.current = null;
      game.current = null;
    };
  }, []);

  async function connect() {
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
            Arena para validar a cena e a conexão multiplayer. Movimentação e
            combate chegam nas próximas etapas.
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
              <button disabled={status === 'connecting'}>
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
          <p className="hint">
            Clique na arena para olhar com o mouse.
            <br />
            Pressione Esc para liberar o cursor.
          </p>
        </aside>
        <section className="arena" aria-label="Prévia 3D da arena">
          <div className="viewport" ref={viewport} />
          <div className="arena-label">
            <span className="dot" /> ARENA / GREYBOX
          </div>
          <div className="crosshair" aria-hidden="true">
            +
          </div>
          <div className="arena-footer">
            {view ? 'Sala conectada' : 'Prévia local'}
            <span>30 Hz simulação · 20 Hz patches</span>
          </div>
        </section>
      </div>
    </main>
  );
}
