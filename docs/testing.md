# Matriz de validação

## Automatizado nesta base

| Camada       | Comportamento                                                                                     | Comando                        |
| ------------ | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| Tipos e lint | Contratos e convenções de cliente/servidor/shared                                                 | `pnpm typecheck` e `pnpm lint` |
| Unitário     | Input inválido, números não finitos, eixos, botões e nomes                                        | `pnpm test`                    |
| Unitário     | 30 ticks/s com render a 30/60/144 FPS; backlog limitado                                           | `pnpm test`                    |
| Física       | Corpo dinâmico colide com piso compartilhado Rapier                                               | `pnpm test`                    |
| Movimento    | Cápsula, chão, teto, rampa, escadas, parede fina, slide/pulo, cooldown e sensores                 | `pnpm test`                    |
| Input/câmera | Bordas entre ticks, normalização, foco, orientação, câmera interpolada e reset                    | `pnpm test`                    |
| Integração   | Health, dois clientes, sala comum, spawn, patches, ping, cleanup e primeiro snapshot na interface | `pnpm test`                    |
| Navegador    | WebGL com screenshots, pointer lock, teclado, estados de movimento e duas interfaces              | `pnpm test:e2e`                |
| Build        | Shared, servidor Node ESM e bundle Vite                                                           | `pnpm build`                   |

Os testes atuais não validam combate, desempenho em GPU real ou com 12 jogadores,
nem comportamento de movimento online sob latência artificial. O Chromium dos
testes usa SwiftShader; screenshots confirmam conteúdo renderizado e mudança da
câmera, sem comparação visual com uma imagem de referência aprovada.

## Playwright

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Instalação do navegador é necessária uma vez por versão do Playwright. A suíte
usa portas 4173/2568 e encerra seus servidores ao terminar. Não reutiliza serviços
externos nem o `pnpm dev` nas portas usuais. Relatório: `playwright-report/index.html`.
Screenshots/traces ficam em `test-results/`, ignorados pelo Git.

## Smoke manual do scaffold

1. Rodar `pnpm dev` e abrir `http://localhost:5173` em duas abas.
2. Confirmar arena visível e ausência de erro WebGL no console.
3. Clicar na arena, mover o mouse e usar Esc para liberar o cursor.
   Testar WASD, Shift → C → Espaço, aterrissagem e Ctrl. Confirmar que não se
   levanta sob o teto roxo e que rampas/escadas respeitam os limites do controlador.
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

## Evidência da base e de F01

- A base possuía 20 testes. F01 expandiu a suíte Vitest para 40, incluindo movimento, input e câmera local.
- Playwright acrescenta três cenários Chromium: render/movimento/Esc, cadeia de estados e duas interfaces conectadas.
- `pnpm dev` iniciou Vite e servidor Colyseus no ambiente Windows com Node 22.17.
- O smoke de navegador usa Chromium instalado pelo Playwright, sem depender de navegador conectado ao chat. Avaliação de feel permanece manual.
- Rapier é carregado em chunk separado; Three.js e o módulo de física ainda podem gerar aviso de chunk acima de 500 kB. O aviso não impede o build e não representa medição de tempo de carregamento.

Verificação de F01: `pnpm check` aprovado (40 testes Vitest, typecheck, ESLint e
build); `pnpm format:check` aprovado; `pnpm test:e2e` aprovado (3 cenários Chromium).
O screenshot de caminhada foi inspecionado e mostra a arena renderizada.
O build mediu aproximadamente 933 kB no bundle principal (258 kB gzip) e
4,34 MB no chunk de física compat/WASM (1,67 MB gzip). Reduzir esse download
permanece uma tarefa de otimização; não foi medido desempenho em rede lenta.
