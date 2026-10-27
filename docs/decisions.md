# Decisões da base

- Manter o monorepo modular da arquitetura, sem banco, Redis ou microsserviços.
- Usar o nome técnico `overfrag`, correspondente ao remoto existente; nome de produto pode ser alterado.
- Colyseus 0.18 alinhado entre core, SDK, transporte e schema. Usar `defineServer`,
  `defineRoom` e schemas com `schema()`/`t.*`, sem decorators para evitar configuração divergente.
- `shared` compilado para ESM com declarações; consumidores importam o pacote pelo workspace.
- Schema e Rapier têm subpaths separados para que importar constantes não inicialize física no cliente.
- Arena descrita em dados compartilhados: visual e colisões usam as mesmas dimensões.
- Um mundo Rapier por sala, timestep explícito de 1/30 s e descarte em `onDispose`.
- O accumulator limita catch-up a cinco passos por atualização. Telemetria de tempo descartado
  existe no helper; sua exposição no servidor é uma tarefa F03, antes dos testes de carga.
- O servidor inicial não registra inputs de gameplay. O contrato existe para evolução,
  sem simular autoridade de movimento enquanto o controlador não foi implementado.
- Reconexão e condição mínima de início ainda não aplicadas; sala base aceita 1–12 conexões para smoke.
- Limite de mensagens por cliente aplicado desde a sala base; validação e orçamento de comandos
  de gameplay virão junto do processamento de inputs.
- Documentos originais e skills preservados. Principal `master` confirmada pelo usuário;
  features em branches com commits locais validados. Push/PR/merge dependem de solicitação.
- F01 usa o controlador compartilhado no treino local. Entrar na sala pausa o treino;
  não envia posições locais nem simula movimentação oficial antes de F03.
- Rapier do cliente é carregado sob demanda. A câmera interpola poses do passo fixo;
  o mouse altera apenas a orientação visual e os comandos seguintes.
- O HUD recebe métricas a cada 200 ms, sem re-render React por frame.
- Playwright roda Chromium com SwiftShader para smoke de WebGL e pointer lock.
  Servidores dos testes usam portas isoladas; testes não substituem avaliação de feel ou perfil em GPU real.

Referências verificadas durante a preparação:
[Colyseus Server](https://docs.colyseus.io/server),
[Room](https://docs.colyseus.io/room),
[State](https://docs.colyseus.io/state),
[Rapier JS](https://www.rapier.rs/docs/user_guides/javascript/getting_started_js/),
[Vite](https://vite.dev/guide/).

Testes de navegador: [Playwright webServer](https://playwright.dev/docs/test-webserver)
e [instalação do Chromium](https://playwright.dev/docs/browsers).
