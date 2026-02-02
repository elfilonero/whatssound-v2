export interface FufyLevel {
  level: number;
  name: string;
  emoji: string;
  minDays: number;
  maxDays: number; // Infinity for last level
  scale: number;   // CSS scale factor
}

export interface FufyAccessory {
  emoji: string;
  name: string;
  requiredDays: number;
}

export const FUFY_LEVELS: FufyLevel[] = [
  { level: 1, name: 'Fufy bebé', emoji: '🐱', minDays: 0, maxDays: 6, scale: 0.85 },
  { level: 2, name: 'Fufy joven', emoji: '😺', minDays: 7, maxDays: 29, scale: 1.0 },
  { level: 3, name: 'Fufy adulto', emoji: '😸', minDays: 30, maxDays: 99, scale: 1.1 },
  { level: 4, name: 'Fufy legendario', emoji: '🐱‍👤', minDays: 100, maxDays: Infinity, scale: 1.15 },
];

export const FUFY_ACCESSORIES: FufyAccessory[] = [
  { emoji: '🎀', name: 'Lacito', requiredDays: 7 },
  { emoji: '🎩', name: 'Sombrero', requiredDays: 14 },
  { emoji: '👑', name: 'Corona', requiredDays: 30 },
  { emoji: '✨', name: 'Brillo', requiredDays: 60 },
  { emoji: '🌟', name: 'Estrella legendaria', requiredDays: 100 },
];

export function getFufyLevel(streak: number): FufyLevel {
  for (let i = FUFY_LEVELS.length - 1; i >= 0; i--) {
    if (streak >= FUFY_LEVELS[i].minDays) return FUFY_LEVELS[i];
  }
  return FUFY_LEVELS[0];
}

export function getUnlockedAccessories(streak: number): FufyAccessory[] {
  return FUFY_ACCESSORIES.filter(a => streak >= a.requiredDays);
}

export function getNextLevel(streak: number): FufyLevel | null {
  const current = getFufyLevel(streak);
  const idx = FUFY_LEVELS.indexOf(current);
  return idx < FUFY_LEVELS.length - 1 ? FUFY_LEVELS[idx + 1] : null;
}

export function getLevelProgress(streak: number): number {
  const current = getFufyLevel(streak);
  const next = getNextLevel(streak);
  if (!next) return 1; // max level
  const range = next.minDays - current.minDays;
  const progress = streak - current.minDays;
  return Math.min(progress / range, 1);
}
