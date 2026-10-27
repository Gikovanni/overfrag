import RAPIER from '@dimforge/rapier3d-compat';
import { COLLISION } from '../config/collision.js';
import { FIXED_STEP_SECONDS, MOVEMENT } from '../config/game.js';
import type { InputCommand } from '../protocol/messages.js';
import type { MovementState, Vec3 } from '../types/world.js';

const IDENTITY = { x: 0, y: 0, z: 0, w: 1 };

export interface CharacterSnapshot {
  position: Vec3;
  velocity: Vec3;
  grounded: boolean;
  crouched: boolean;
  movement: MovementState;
}

/** Um personagem por instância. O dono do mundo chama world.step() após preparar todos. */
export class CharacterController {
  private readonly body: RAPIER.RigidBody;
  private readonly collider: RAPIER.Collider;
  private readonly controller: RAPIER.KinematicCharacterController;
  private readonly standingShape = new RAPIER.Capsule(
    MOVEMENT.standingHalfHeight,
    MOVEMENT.capsuleRadius,
  );
  private readonly crouchingShape = new RAPIER.Capsule(
    MOVEMENT.crouchingHalfHeight,
    MOVEMENT.capsuleRadius,
  );
  private readonly velocity: Vec3 = { x: 0, y: 0, z: 0 };
  private grounded = false;
  private crouched = false;
  private movement: MovementState = 'airborne';
  private slideRemaining = 0;
  private slideCooldown = 0;
  private slideX = 0;
  private slideZ = 0;
  private effectiveSpeed = 0;
  private disposed = false;

  constructor(
    private readonly world: RAPIER.World,
    spawn: Vec3,
  ) {
    this.body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        spawn.x,
        spawn.y,
        spawn.z,
      ),
    );
    this.collider = world.createCollider(
      RAPIER.ColliderDesc.capsule(
        MOVEMENT.standingHalfHeight,
        MOVEMENT.capsuleRadius,
      ).setCollisionGroups(COLLISION.player),
      this.body,
    );
    this.controller = world.createCharacterController(
      MOVEMENT.controllerOffset,
    );
    this.controller.setUp({ x: 0, y: 1, z: 0 });
    this.controller.setMaxSlopeClimbAngle(MOVEMENT.maxSlopeRadians);
    this.controller.setMinSlopeSlideAngle(MOVEMENT.maxSlopeRadians);
    this.controller.setSlideEnabled(true);
    this.controller.setApplyImpulsesToDynamicBodies(false);
  }

  prepareStep(input: InputCommand): void {
    const dt = FIXED_STEP_SECONDS;
    const jumping = input.buttons.jump && this.grounded;
    this.slideCooldown = Math.max(0, this.slideCooldown - dt);
    if (this.slideRemaining > 0 && (jumping || !this.grounded)) this.endSlide();
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (
      input.buttons.slide &&
      !jumping &&
      this.grounded &&
      this.slideRemaining === 0 &&
      this.slideCooldown === 0 &&
      this.effectiveSpeed >= MOVEMENT.slideMinSpeed &&
      speed >= MOVEMENT.slideMinSpeed
    ) {
      this.slideRemaining = MOVEMENT.slideDurationSeconds;
      this.slideX = this.velocity.x / speed;
      this.slideZ = this.velocity.z / speed;
    }

    this.setCrouched(this.slideRemaining > 0 || input.buttons.crouch);
    const sprinting = input.buttons.sprint && input.moveZ < 0 && !this.crouched;
    if (this.slideRemaining > 0) {
      // Slide conserva a velocidade de entrada; pressionar novamente nunca adiciona impulso.
      const slideSpeed = Math.max(0, speed - MOVEMENT.slideDeceleration * dt);
      this.velocity.x = this.slideX * slideSpeed;
      this.velocity.z = this.slideZ * slideSpeed;
      this.slideRemaining = Math.max(0, this.slideRemaining - dt);
      if (this.slideRemaining === 0) this.endSlide();
    } else {
      const targetSpeed = this.crouched
        ? MOVEMENT.crouchSpeed
        : sprinting
          ? MOVEMENT.sprintSpeed
          : MOVEMENT.walkSpeed;
      const length = Math.max(1, Math.hypot(input.moveX, input.moveZ));
      const localX = input.moveX / length;
      const localZ = input.moveZ / length;
      const targetX =
        (localX * Math.cos(input.yaw) + localZ * Math.sin(input.yaw)) *
        targetSpeed;
      const targetZ =
        (-localX * Math.sin(input.yaw) + localZ * Math.cos(input.yaw)) *
        targetSpeed;
      const hasInput = localX !== 0 || localZ !== 0;
      const acceleration = this.grounded
        ? hasInput
          ? MOVEMENT.acceleration
          : MOVEMENT.friction
        : hasInput
          ? MOVEMENT.acceleration * MOVEMENT.airControl
          : 0;
      const differenceX = targetX - this.velocity.x;
      const differenceZ = targetZ - this.velocity.z;
      const difference = Math.hypot(differenceX, differenceZ);
      const factor =
        difference === 0 ? 0 : Math.min(1, (acceleration * dt) / difference);
      this.velocity.x += differenceX * factor;
      this.velocity.z += differenceZ * factor;
    }
    const maxSpeed = this.grounded
      ? MOVEMENT.sprintSpeed
      : MOVEMENT.maxAirSpeed;
    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (planarSpeed > maxSpeed) {
      this.velocity.x *= maxSpeed / planarSpeed;
      this.velocity.z *= maxSpeed / planarSpeed;
    }
    this.velocity.y = jumping
      ? MOVEMENT.jumpSpeed
      : this.grounded
        ? -MOVEMENT.groundStickSpeed
        : Math.max(
            -MOVEMENT.terminalFallSpeed,
            this.velocity.y + MOVEMENT.gravity * dt,
          );

    if (this.grounded && !jumping && !this.crouched) {
      this.controller.enableAutostep(
        MOVEMENT.stepHeight,
        MOVEMENT.stepMinWidth,
        false,
      );
    } else {
      this.controller.disableAutostep();
    }
    if (this.grounded && !jumping) {
      this.controller.enableSnapToGround(MOVEMENT.snapToGroundDistance);
    } else {
      this.controller.disableSnapToGround();
    }
    this.controller.computeColliderMovement(
      this.collider,
      {
        x: this.velocity.x * dt,
        y: this.velocity.y * dt,
        z: this.velocity.z * dt,
      },
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS,
      COLLISION.player,
    );
    const delta = this.controller.computedMovement();
    this.effectiveSpeed = Math.hypot(delta.x, delta.z) / dt;
    const position = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: position.x + delta.x,
      y: position.y + delta.y,
      z: position.z + delta.z,
    });
    this.grounded = this.controller.computedGrounded() && !jumping;
    // Não realimentar ruído do solver no momentum (especialmente no contato com o piso).
    if (
      this.grounded ||
      (this.velocity.y > 0 && delta.y < this.velocity.y * dt - 0.001)
    )
      this.velocity.y = 0;
    this.movement = !this.grounded
      ? 'airborne'
      : this.slideRemaining > 0
        ? 'sliding'
        : this.crouched
          ? 'crouched'
          : sprinting
            ? 'sprinting'
            : 'grounded';
  }

  private setCrouched(requested: boolean): void {
    if (requested === this.crouched) return;
    const position = this.body.translation();
    const heightChange =
      MOVEMENT.standingHalfHeight - MOVEMENT.crouchingHalfHeight;
    const next = {
      x: position.x,
      y: position.y + (requested ? -heightChange : heightChange),
      z: position.z,
    };
    if (
      !requested &&
      this.world.intersectionWithShape(
        next,
        IDENTITY,
        this.standingShape,
        RAPIER.QueryFilterFlags.EXCLUDE_SENSORS,
        COLLISION.player,
        this.collider,
        this.body,
      )
    )
      return;
    this.crouched = requested;
    this.collider.setShape(
      requested ? this.crouchingShape : this.standingShape,
    );
    // A cápsula e o body continuam concêntricos; mudar a altura preserva os pés.
    this.body.setTranslation(next, true);
    this.body.setNextKinematicTranslation(next);
    this.world.propagateModifiedBodyPositionsToColliders();
    this.collider.setTranslation(next);
  }

  private endSlide(): void {
    this.slideRemaining = 0;
    this.slideCooldown = MOVEMENT.slideCooldownSeconds;
  }

  snapshot(): CharacterSnapshot {
    return {
      position: this.body.translation(),
      velocity: { ...this.velocity },
      grounded: this.grounded,
      crouched: this.crouched,
      movement: this.movement,
    };
  }

  reset(position: Vec3): void {
    this.body.setTranslation(position, true);
    this.body.setNextKinematicTranslation(position);
    this.collider.setShape(this.standingShape);
    this.collider.setTranslationWrtParent({ x: 0, y: 0, z: 0 });
    Object.assign(this.velocity, { x: 0, y: 0, z: 0 });
    this.grounded = false;
    this.crouched = false;
    this.movement = 'airborne';
    this.slideRemaining = 0;
    this.slideCooldown = 0;
    this.effectiveSpeed = 0;
    this.world.propagateModifiedBodyPositionsToColliders();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.world.removeCharacterController(this.controller);
    this.world.removeRigidBody(this.body);
  }
}
