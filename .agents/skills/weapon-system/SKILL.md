---
name: weapon-system
description: Implement first-person weapon firing, server-validated hitscan, recoil, ADS, reload, inventory and animation coordination.
---

# FPS weapon system

## Use when
Creating or modifying firing, weapon configurations, ADS, recoil, reload, equip/holster, hitmarkers and first-person weapon animations.

## Project context
Cartoon-style casual multiplayer FPS. Client displays weapon effects immediately; server decides ammo, hit validation, damage and kills.

## Architecture
- Shared: weapon identifiers, damage, fire rate, clip capacity, reload timing, spread/range and typed fire/reload commands.
- Client: input binding, viewmodel, camera/visual recoil, shot feedback, muzzle flash, audio, predicted ammo UI.
- Server: authoritative equipped weapon, ammo, fire-rate enforcement, reload state, raycast/hitbox validation, damage and kill events.

## Implementation workflow
1. Inspect existing weapon model and data contracts. Keep values in shared configuration; server owns the effective values.
2. Implement explicit states (idle, firing, reloading, equipping, ADS) with interruptibility rules and legal transitions.
3. For hitscan, send shot input/sequence, time reference and intent; server bounds timestamp and validates origin, facing, ammo, fire rate and range before authoritative raycast.
4. Use an explicit hitbox layer; distinguish visual mesh from gameplay collider. Include obstacle checks and friendly-fire rules.
5. ADS: align sights through local viewmodel transform and camera FOV interpolation; store server-relevant ADS state only where it affects mechanics.
6. Recoil: separate visual camera kick and server-relevant shot direction/spread; deterministic seeded spread if required by netcode.
7. Reload: server records start/end, checks ammo reserves and interruption. Animation should follow state rather than grant ammo when a clip completes.
8. Send compact weapon events to remote clients, not animation-bone transforms or every particle.
9. Ensure audio and particles are pooled/cleaned up; support animation cancel/crossfade appropriately.

## Constraints
- Never apply damage based solely on local raycasts or client hit reports.
- Do not assume animation clip names; inspect asset metadata and map clips explicitly.
- Avoid uncapped rapid-fire from repeated input events; enforce fire cadence on server tick/time.
- No synchronous network request per rendered frame.

## Validation
- Fire rate consistent under varying FPS and packet bursts.
- Reload cancel/equip and ADS during other states follow spec.
- Ammo cannot become negative or exceed capacity; late/repeated commands are handled.
- Shooting through walls and spoofed fire origins are rejected.
- Local shot response feels immediate; remote players see coherent effects.

## Deliverables
Provide weapon config examples, network message schema, animation mapping and gameplay tests.
