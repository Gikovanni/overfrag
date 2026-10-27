# Overfrag

Base de FPS multiplayer web com Three.js, React, Rapier e Colyseus.
Arquitetura em [fps_web_multiplayer_arquitetura.md](fps_web_multiplayer_arquitetura.md)
e backlog em [docs/implementation-plan.md](docs/implementation-plan.md).

## Executar

Requisitos: Node.js 22.13+ (linha 22), 24 ou 26+ e pnpm 10.34.9.

```sh
pnpm install
pnpm dev
```

Se o pnpm não estiver instalado ou o Corepack local falhar:

```sh
npx --yes pnpm@10.34.9 install
npx --yes pnpm@10.34.9 dev
```

- Cliente: <http://localhost:5173>
- Servidor: <http://localhost:2567>
- Health check: <http://localhost:2567/health>

Os padrões funcionam sem `.env`. Para personalizar, copie `apps/client/.env.example`
para `apps/client/.env` e/ou `apps/server/.env.example` para `apps/server/.env`.
Variáveis `VITE_*` são públicas no bundle. Reinicie o processo ao editar `.env`.

Abra duas abas, use nomes diferentes e conecte ambas. A contagem deve ser igual
nas duas; os avatares são cápsulas estáticas. Clique na arena para controlar o olhar
e pressione Esc para liberar o cursor. A rotação da câmera ainda é somente local.

## O que a base já faz

- Workspace com TypeScript estrito, lint, formatação, build e testes.
- Cena de arena greybox, câmera com pointer lock e descarte de recursos.
- Sala com até 12 conexões, spawn por sessão, remoção na saída e patches de estado.
- Simulação Rapier a passo fixo, com piso, paredes e coberturas compartilhados com o visual.
- Interface de conexão, estado da sala, contagem de jogadores, tick e RTT.
- Contrato de input e validador, configurações de movimento e rifle centralizadas.

Ainda não há controlador de personagem, movimentação, colisão de jogadores,
prediction, reconciliation, interpolação, tiros, animações GLB, partidas ou reconexão
implementados. Os números de vida no schema e as configurações são fundação para essas features.
O limite de 12 conexões não equivale a uma validação de carga com 12 jogadores.

## Organização

```text
apps/client/src/game/   core, player, weapons, animation, physics, network
apps/client/src/ui/     interface React
apps/client/public/assets/  maps, weapons, characters, audio
apps/server/src/        rooms, simulation, combat, matchmaking
packages/shared/src/   config, protocol, simulation, types
docs/                  plano, decisões e matriz de testes
```

Shared é compilado antes dos consumidores; `pnpm dev` mantém seu build em watch.
O servidor observa `shared/dist`; o cliente recebe atualizações pelo Vite.
O build estático fica em `apps/client/dist`; o servidor em `apps/server/dist`.
Para executar o servidor compilado, mantenha o workspace e suas dependências instaladas:

```sh
pnpm build
pnpm --filter @overfrag/server start
```

## Validação

```sh
pnpm check
pnpm format:check
```

`pnpm check` roda typecheck, ESLint, testes unitários/integração e build.
Veja os cenários manuais e limites da cobertura em [docs/testing.md](docs/testing.md).
Dependências resolvidas ficam fixadas no `pnpm-lock.yaml`.

## Avisos de PR no Discord

O workflow `.github/workflows/discord-pr.yml` avisa quando um PR para `master`
é aberto, reaberto, fica pronto para revisão ou é integrado. Rascunhos aguardam
ficar prontos para revisão; fechar sem merge não gera aviso.

Configure o secret de Actions `DISCORD_WEBHOOK_URL` com a URL original do Discord,
sem `/github` no final, e desative o webhook nativo em Settings → Webhooks para
evitar mensagens duplicadas. A mensagem inclui título, link, autor, branches e
descrição; textos longos mostram uma prévia com link para o conteúdo completo.

O job atende branches do próprio repositório, sem checkout ou execução do código
do PR. Forks são ignorados; PRs do Dependabot normalmente não recebem o secret.
Menções automáticas ficam desabilitadas. Falhas aparecem na aba Actions sem
imprimir a URL; reexecutar um job já entregue pode duplicar a mensagem.
