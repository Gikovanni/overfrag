# Overfrag — convenções do repositório

Leia `fps_web_multiplayer_arquitetura.md` e `docs/implementation-plan.md` antes
de implementar features. As skills do projeto ficam em `.agents/skills`.

- Monorepo pnpm: `apps/client`, `apps/server`, `packages/shared`.
- Cliente: Three.js para apresentação, React para interface; não atualizar React a cada frame.
- Servidor Colyseus: autoridade de movimento, colisões, armas, dano, vida, respawn e placar.
- Shared: protocolo, validação, configurações e simulação compatível; sem dependências de React/Three.js.
- Metros, segundos e radianos; campos com `Ms` usam milissegundos. Eixo Y aponta para cima.
- Simulação 30 Hz, patches 20 Hz, inputs 30 Hz, buffer remoto inicial 100 ms.
- Nunca aceitar posições, dano ou acertos enviados pelo cliente como verdade.
- Validar payloads em runtime; tipos TypeScript não validam tráfego de rede.
- Colyseus 0.18: conferir as APIs da versão instalada antes de copiar exemplos antigos.
- Rapier não garante determinismo perfeito entre plataformas: prever reconciliação.
- Liberar mundos, geometrias, materiais, listeners, timers e animation loops no teardown.
- Configurações de armas e movimento ficam somente em `packages/shared/src/config`.
- Use imports relativos com extensão `.js` no TypeScript ESM.
- Antes de concluir mudanças: `pnpm check` e `pnpm format:check`.
- Testes devem cobrir comportamento e invariantes, sem alegar validação visual de WebGL em testes de DOM.
- Preserve arquivos locais existentes; não publicar, fazer merge ou criar PR sem solicitação.
- A inicialização foi feita em um Git sem commits na branch `master`; alinhar a principal
  antes de aplicar o fluxo da skill `basic-gitflow` em uma entrega futura com Git.
