export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type MovementState =
  'grounded' | 'airborne' | 'crouched' | 'sliding' | 'sprinting';
export type WeaponState = 'idle' | 'firing' | 'reloading' | 'equipping' | 'ads';
