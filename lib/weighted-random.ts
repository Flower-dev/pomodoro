import type { Restaurant } from './types';

/**
 * Tirage pondéré : poids = appreciation * (6 - recurrence)
 * Garde : poids minimum de 1 pour les restaurants à recurrence >= 5
 */
export function weightedRandom(restaurants: Restaurant[]): Restaurant {
  const weights = restaurants.map((r) => {
    const raw = r.appreciation * (6 - r.recurrence);
    return Math.max(raw, 1);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < restaurants.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return restaurants[i];
  }
  return restaurants[restaurants.length - 1];
}
