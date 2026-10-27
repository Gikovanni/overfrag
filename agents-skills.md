# Codex skills — FPS Web Multiplayer

Six custom Agent Skills for a cartoony Three.js + Rapier + Colyseus browser FPS (6–12 players, casual).

## Install

Copy the `.agents/skills/` directory into the ROOT of your Git repository, preserving subfolders. Open the project in Codex. Skills are then available to Codex when relevant; you can explicitly request one using `$threejs-fps`, `$fps-movement`, `$weapon-system`, `$multiplayer-netcode`, `$rapier-physics`, or `$game-testing`. If your Codex environment uses a different skill discovery path, use its configured project-skills directory.

## Prompts

- `Use $fps-movement and $rapier-physics to implement sprint -> slide -> jump with fixed-timestep physics. First inspect the existing code and report affected files.`
- `Use $multiplayer-netcode to build an authoritative 12-player Colyseus room with prediction, reconciliation and remote interpolation. Keep the protocol typed.`
- `Use $weapon-system and $threejs-fps to implement a rifle with GLB reload animation, ADS and server-validated hitscan.`
- `Use $game-testing to add smoke and integration tests for 12 concurrent simulated players at 100 ms RTT.`

## Notes

- These are custom guidance files, not installed libraries or executable plugins.
- Skills must be reconciled with your actual repo, versions and established conventions.
- Keep authoritative simulation and combat on the server.
- Consider adding root `AGENTS.md` for repo-wide standards and architecture overview.
