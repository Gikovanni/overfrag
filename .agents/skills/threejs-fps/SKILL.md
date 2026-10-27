---
name: threejs-fps
description: Build and review browser FPS rendering with Three.js, viewmodels, GLB animation, camera and performance.
---

# Three.js FPS rendering

## Use when
Implementing or reviewing the 3D scene, first-person camera, weapon viewmodel, loading assets, animation playback or render performance.

## Project context
Web cartoon-style casual FPS, 6–12 players per match. Three.js + TypeScript on the client, React for menus/HUD, Rapier for physics, Colyseus for networking. Keep rendering separate from simulation and networking.

## Implementation workflow
1. Inspect existing render loop, camera hierarchy, loaders and disposals; reuse project conventions.
2. Create a single renderer and an animation frame loop; use frame delta only for visual smoothing, and never couple authoritative gameplay to render FPS.
3. Use GLTFLoader for GLB/GLTF. Validate model scale, axes, transforms, named animation clips and rig compatibility.
4. Attach first-person weapon viewmodel to a dedicated camera or camera rig. Prefer separate viewmodel render pass/layer when clipping/FOV needs differ from the world; avoid drawing weapons through walls.
5. Use AnimationMixer per animated root. Cache AnimationAction per clip, configure LoopOnce/clampWhenFinished as appropriate, and cross-fade between compatible states.
6. Drive animation state with events from game systems (fire, reload, sprint, equip), never infer damage or ammo from visual animation frames.
7. Keep weapon sway, bob, camera shake and recoil visual-only. Apply local interpolation independent of authoritative physics.
8. Optimize through shared geometry/materials, culling, texture compression, LOD where justified, capped dynamic lights and avoiding per-frame allocations. Dispose geometry/textures/mixers/listeners on teardown.

## Constraints
- Never trust Three.js mesh coordinates as the authoritative multiplayer hitbox.
- Do not run Rapier steps or send network messages from per-object render callbacks.
- Avoid recreating mixer/actions, geometry or event listeners inside the animation loop.
- Avoid forced React re-renders for each frame; keep realtime game state in engine-side structures.

## Validation
- Models load without warnings; idle/fire/reload/equip/inspect transition without snapping.
- ADS aligns muzzle and sight across intended aspect ratios.
- Remote animation states work without syncing each bone.
- Rendering tested with performance profiling at representative map complexity and 12 avatars.
- Asset lifecycle cleans up when leaving a match.

## Deliverables
Summarize touched files, asset requirements, performance implications, and explicit manual test steps.
