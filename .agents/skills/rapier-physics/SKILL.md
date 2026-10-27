---
name: rapier-physics
description: Implement and validate Rapier 3D collision worlds, character controller, raycasts and fixed-step simulation for a browser FPS.
---

# Rapier physics for FPS

## Use when
Adding or changing 3D collision geometry, character controller, collision layers, raycasts, ground detection, steps/slopes and physics simulation.

## Project context
Three.js renders; Rapier owns collision simulation; Colyseus server is authoritative. Client has compatible local prediction world where needed.

## Implementation workflow
1. Verify exact @dimforge/rapier3d(-compat) package and API surface in the current project.
2. Initialize physics once per world. Map authored level geometry into efficient fixed colliders (avoid unnecessary triangle meshes on moving bodies).
3. Choose a capsule-based character representation and Rapier character controller or kinematic motion solver; configure slopes, step height, snap to ground and autostep explicitly.
4. Move via controller-computed translation/collision result, not raw mesh position teleporting. Synchronize rendering from simulation results.
5. Step on fixed tick. Explicitly set timestep where supported; keep server and client settings as equivalent as possible.
6. Establish collision groups for world, player, projectiles, hitboxes and triggers. Use sensors for triggers, not solid colliders.
7. Implement raycasts for line of sight, ground checks and server-authoritative hitscan. Apply filters to ignore shooter's own collider and non-target layers.
8. Manage object creation/removal lifecycle and handle world disposal on match teardown.
9. Instrument penetration, stuck detection, high-velocity tunneling, stair/ledge behavior and edge cases with sloped terrain.

## Constraints
- Do not mix visual world transforms and Rapier collision transforms without an explicit synchronization contract.
- Client raycast may give provisional effects, but only server raycast decides damage.
- Do not use a triangle mesh for every small moving prop by default.
- Reconciliation remains necessary even with matching timestep and physics parameters.

## Acceptance tests
- Stable movement at fixed steps under variable render FPS.
- No tunneling through thin walls during sprint/slide.
- Correct head clearance while standing up from crouch.
- Slopes/steps/stairs and moving platforms follow defined design limits.
- Raycasts honor collision groups and exclude intended colliders.

## Deliverables
Describe collider shapes/layers, controller settings, fixed-step configuration and performance implications.
