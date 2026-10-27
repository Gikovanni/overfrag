export const WEAPONS = {
  rifle: {
    damage: 25,
    roundsPerMinute: 600,
    magazineSize: 30,
    reserveAmmo: 90,
    reloadMs: 2_000,
    rangeMeters: 150,
  },
} as const;

export type WeaponId = keyof typeof WEAPONS;
