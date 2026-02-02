export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_feed', name: 'Primera comida', emoji: '🍽️', description: 'Alimentaste a Fufy por primera vez' },
  { id: 'streak_3', name: '3 días seguidos', emoji: '🔥', description: 'Fufy lleva 3 días contento' },
  { id: 'streak_7', name: 'Una semana', emoji: '⭐', description: '¡7 días seguidos cuidando a Fufy!' },
  { id: 'streak_30', name: 'Mejor amigo', emoji: '🏆', description: '¡30 días seguidos! Fufy te adora' },
  { id: 'streak_100', name: 'Inseparables', emoji: '💎', description: '100 días juntos' },
  { id: 'early_bird', name: 'Madrugador', emoji: '🌅', description: 'Alimentaste a Fufy antes de las 8AM' },
  { id: 'night_owl', name: 'Noctámbulo', emoji: '🌙', description: 'Cuidaste a Fufy después de las 22h' },
  { id: 'all_three', name: 'Día completo', emoji: '🎯', description: 'Desayuno, comida y cena en un día' },
  { id: 'play_10', name: 'Juguetón', emoji: '🎾', description: '10 sesiones de juego con Fufy' },
  { id: 'pet_10', name: 'Cariñoso', emoji: '💕', description: '10 mimos a Fufy' },
];
