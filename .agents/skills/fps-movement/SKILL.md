---
name: fps-movement
description: Implement COD-inspired movement including sprint, tactical sprint, slide, crouch, jump, air control and optional bunny hop with network prediction.
---

# FPS movement controller

## Use when
Building or tuning player movement, sprint, tactical sprint, slide, jump, crouch, air control, bunny-hop behavior or camera feedback.

## Project context
Fast casual browser FPS with 6–12 players. Rapier character collision. Colyseus server authority. Gameplay simulation uses fixed steps; client may predict movement.

## State and inputs
Use explicit movement states (grounded, airborne, crouched, sliding, sprinting) or a small deterministic state machine; define priorities and legal transitions. Treat user inputs as commands with sequence/tick and button edges, not teleported positions.

## Implementation workflow
1. Locate shared movement configuration and existing Rapier character controller. Define units and parameters in one place: walk/sprint speeds, acceleration, friction, jump impulse, gravity, slide entry threshold, slide decay/duration, slope limits, crouch capsule height, air control.
2. Sample inputs separately from simulation. Step movement at fixed timestep using a consistent coordinate system and stable collision calls.
3. Implement acceleration, deceleration, friction and ground detection. Avoid directly modifying visual camera pose as the physics body.
4. Sprint/tactical sprint: validate conditions and transitions; keep stamina optional, not assumed.
5. Slide: only enter from valid state/speed; apply friction and incline behavior; prevent repeated slide-speed exploits. Distinguish camera crouch from collider size adjustment.
6. Jump: grounded/coyote time/jump buffer only if enabled. Air control must not bypass max-speed constraints. Make bunny hopping an explicit design choice with a configurable cap.
7. Simulate locally for input responsiveness; send sequenced inputs; integrate server snapshots and replay unacknowledged inputs through multiplayer-netcode.
8. Interpolate remote player presentation only; do not interpolate a local predicted body as if remote.
9. Use camera bob, FOV kick and landing feedback on the client, with accessibility toggles where helpful.

## Constraints
- Server validates allowed movement and collision. Never accept unrestricted position updates.
- Don't rely on variable render delta for movement physics or change simulation tick based on client FPS.
- Avoid hardcoding movement constants across client/server.
- Do not promise bit-identical Rapier simulations; reconcile divergences.

## Acceptance tests
- Consistent traversal distance at 30/60/144 rendering FPS.
- Sprint -> slide -> jump and crouch transitions have no penetration or speed spikes.
- Slopes, stairs, ceilings and obstacles behave consistently.
- 50/100/200 ms latency and jitter produce manageable reconciliation corrections.
- Invalid sprint/slide/jump messages do not allow speed hacks.

## Deliverables
Document state transition rules, tunable constants, and test commands/scenarios.
