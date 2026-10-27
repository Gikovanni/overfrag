---
name: game-testing
description: Design automated and manual tests for Three.js browser FPS gameplay, Colyseus multiplayer and Rapier movement under latency.
---

# FPS game testing

## Use when
Writing unit, integration, browser or multiplayer load tests, smoke checks, regression scenarios or performance instrumentation.

## Test pyramid
1. Unit: shared movement state transitions, input sanitization, damage/fire rate, ammo, reload, match rules.
2. Integration: authoritative Colyseus room updates, Rapier collisions, network command sequencing, respawn and reconnection.
3. Browser E2E: Playwright for menu, lobby, connection, HUD and input plumbing; WebGL/Pointer Lock constraints require explicit browser/headless support checks.
4. Multi-client scenarios: scripted bots or controllable clients to simulate 2/6/12 players and fault conditions.
5. Manual/visual QA: mouse look, feel of sliding, animation transitions, ADS, responsiveness and visual artifacts.

## Implementation workflow
1. Discover existing test framework and scripts; add minimum dependencies necessary.
2. Define deterministic test fixtures: seeded randomization, fixed timestep, predictable map and test-only player inputs.
3. Test movement at render rates 30/60/144 and with network RTT 50/100/200 ms, jitter, disconnects and command bursts.
4. Verify anti-cheat invariants: bounded movement speed, valid ammo/fire rate, line-of-sight, server-only damage.
5. Record metrics for render FPS/p95 frame time, server tick p95, RTT/jitter, state correction magnitude, inbound/outbound bytes.
6. For browser tests, capture screenshots/video/traces only when environment supports them and avoid claims of rendered success without evidence.
7. Report exactly which commands/tests ran, failures, unverified assumptions and next steps.

## Minimum regression suite
- Connect two clients, spawn, move and observe correct interpolation.
- Sprint -> slide -> jump -> land with obstacle; no collision bypass.
- Fire empty weapon, reload, cancel reload, switch weapon.
- Two users exchange hits; no client-authoritative HP modification.
- Disconnect mid-match and enforce reconnection/cleanup policy.
- Simulate 12 clients and verify server remains within defined tick budget.

## Constraints
- Never claim automated WebGL visual coverage from DOM-only tests.
- Do not hide flaky tests or relax assertions without explaining why.
- Separate functional correctness from feel/balance testing.
- Avoid putting production secrets into screenshots, traces or test fixtures.

## Deliverables
Provide a test matrix, runnable commands, pass/fail evidence and performance findings.
