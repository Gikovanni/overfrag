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
- Documentos originais e skills preservados; sem commits, pushes ou mudanças de branch nesta etapa.

Referências verificadas durante a preparação:
[Colyseus Server](https://docs.colyseus.io/server),
[Room](https://docs.colyseus.io/room),
[State](https://docs.colyseus.io/state),
[Rapier JS](https://www.rapier.rs/docs/user_guides/javascript/getting_started_js/),
[Vite](https://vite.dev/guide/).
