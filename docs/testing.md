# Matriz de validação

## Automatizado nesta base

| Camada       | Comportamento                                                                                     | Comando                        |
| ------------ | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| Tipos e lint | Contratos e convenções de cliente/servidor/shared                                                 | `pnpm typecheck` e `pnpm lint` |
| Unitário     | Input inválido, números não finitos, eixos, botões e nomes                                        | `pnpm test`                    |
| Unitário     | 30 ticks/s com render a 30/60/144 FPS; backlog limitado                                           | `pnpm test`                    |
| Física       | Corpo dinâmico colide com piso compartilhado Rapier                                               | `pnpm test`                    |
| Integração   | Health, dois clientes, sala comum, spawn, patches, ping, cleanup e primeiro snapshot na interface | `pnpm test`                    |
| Build        | Shared, servidor Node ESM e bundle Vite                                                           | `pnpm build`                   |

Os testes atuais não validam movimentação de personagem, combate, renderização WebGL,
pointer lock, desempenho com 12 jogadores ou comportamento sob latência artificial.
Essas funcionalidades exigem as etapas previstas no plano.

## Smoke manual do scaffold

1. Rodar `pnpm dev` e abrir `http://localhost:5173` em duas abas.
2. Confirmar arena visível e ausência de erro WebGL no console.
3. Clicar na arena, mover o mouse e usar Esc para liberar o cursor.
4. Conectar com nomes diferentes: mesma sala, dois jogadores e RTT numérico.
5. Sair em uma aba: a outra passa a mostrar um jogador e remove a cápsula remota.
6. Conectar/sair repetidamente e redimensionar a janela; verificar ausência de loops/listeners acumulados.
7. Parar o servidor: a interface deve voltar para offline; tentar conectar e verificar o erro visível.

## Matriz futura por feature

| Feature     | Cenários obrigatórios                                                                      |
| ----------- | ------------------------------------------------------------------------------------------ |
| Movimento   | 30/60/144 FPS; sprint/slide/jump/land; teto, escadas, rampas e paredes finas               |
| Rede        | 2/6/12 clientes; RTT 50/100/200 ms; jitter; mensagens repetidas e bursts; quedas           |
| Combate     | Cadência, arma vazia, reload/cancel/equip, paredes, origem falsa e dano apenas no servidor |
| Partida     | Preparação, timer, vitória, empate, abandono, reconexão e reset                            |
| Recursos    | Entrar/sair repetidamente; memória, mundos WASM, timers e listeners                        |
| Performance | p95/p99 do tick e frame time; RTT/jitter; correções; CPU/memória e bytes/jogador           |

Feel de movimento, alinhamento ADS e animações precisam de avaliação manual/visual.
Não declarar cobertura visual a partir de testes apenas de DOM ou de conexão.

## Resultado da validação inicial

- 20 testes automatizados: protocolo, timestep, colisão Rapier e integração real com Colyseus, incluindo o adaptador da interface.
- Typecheck, ESLint e build dos três pacotes verificados.
- `pnpm dev` iniciou Vite e servidor Colyseus no ambiente Windows com Node 22.17.
- Não havia navegador conectado às ferramentas da sessão; WebGL e pointer lock precisam do smoke manual acima.
- O bundle inicial inclui Three.js e gera aviso de chunk acima de 500 kB (aproximadamente 925 kB minificado / 256 kB gzip). Divisão e carregamento sob demanda podem ser avaliados com as próximas features; o aviso não impede o build.
