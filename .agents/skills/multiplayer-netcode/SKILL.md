---
name: multiplayer-netcode
description: Build Colyseus authoritative rooms with prediction, reconciliation, remote interpolation and lag-compensated FPS combat.
---

# Colyseus multiplayer netcode

## Use when
Implementing rooms, player state replication, input processing, prediction/reconciliation, interpolation, lag compensation, matchmaking or reconnection.

## Baseline configuration (measure, do not hardcode as universal)
- Up to 12 players per room.
- Server fixed simulation: 30 Hz (33.33 ms).
- State patches: target 20 Hz (50 ms), configured through Colyseus room APIs as appropriate for installed version.
- Input commands: approximately 30 Hz or compact batches tied to tick sequence.
- Remote interpolation buffer: initially ~100 ms; tune using measured jitter.
- Render: independent 60+ FPS when possible.

## Implementation workflow
1. Inspect installed Colyseus version and docs/API before choosing room lifecycle, schema, rates or optional netcode helpers. Do not invent APIs.
2. Define typed network input commands (sequence, intended simulation tick, move axis, aim, buttons). Enforce ranges and rate limits server-side.
3. Authoritative room owns lifecycle, simulation, spawn, collisions, combat, ammo, score and match clock. Clients never send authoritative world positions/damage.
4. Fixed-timestep simulation consumes inputs in sequence. Handle missing/late inputs safely. Track last processed sequence per player.
5. Client runs prediction using compatible movement rules and stores unconfirmed inputs. On authoritative ack, correct state and replay pending inputs; smooth only visual correction.
6. Remote entities interpolate between buffered, timestamped authoritative snapshots; clamp extrapolation and teleports. Keep rendering independent from network arrivals.
7. For shots, rewind bounded target hitbox history using validated timestamps; enforce maximum rewind window, LOS, weapon range and rate limits.
8. Send deltas for persistent state, messages for one-shot effects; prioritize nearby/relevant state if profiling requires it.
9. Implement join, leave, disconnect, reconnect timeout, respawn, match end and room disposal; do not leak intervals/listeners.
10. Collect metrics: server tick execution time, drift, bytes/player, RTT, jitter, correction magnitude, disconnects and hit validation latency.

## Constraints
- Server authority is mandatory for movement/combat outcomes.
- WebSockets/TCP introduce head-of-line blocking; don't assume UDP semantics.
- Never depend on unsynchronized client wall-clock time as authoritative.
- Shared types are not validation: check incoming data at runtime.
- Do not imply engine physics are deterministic across all devices.

## Test scenarios
- 2, 6 and 12 clients; ping 50/100/200 ms with jitter and packet loss simulation.
- Disconnections/reconnections, duplicates and out-of-order application-level sequences.
- Sprint/slide/jump under latency, stationary and moving target shots.
- Invalid inputs and attempts to exceed speed, ammo, or firing limits.

## Deliverables
Explain message protocol, tick/patch frequencies, authority boundaries, metrics and tradeoffs.
