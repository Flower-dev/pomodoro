'use client';

import { useState, useCallback } from 'react';
import type { Restaurant } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import initialData from '@/data/restaurants.json';

function seedRestaurants(): Restaurant[] {
  return (initialData.restaurants as unknown as Restaurant[]).map((r) => ({
    ...r,
    budget: r.budget ?? (2 as const),
    coords: r.coords ?? null,
  }));
}

function getInitialRestaurants(): Restaurant[] {
  // SSR guard: localStorage n'existe pas côté serveur
  if (typeof window === 'undefined') return seedRestaurants();
  const stored = loadFromStorage();
  if (stored && stored.length > 0) return stored;
  const seed = seedRestaurants();
  saveToStorage(seed);
  return seed;
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getInitialRestaurants);

  const persistUpdate = useCallback(
    (updater: (prev: Restaurant[]) => Restaurant[]) => {
      setRestaurants((prev) => {
        const next = updater(prev);
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const add = useCallback((data: Omit<Restaurant, 'id'>) => {
    const newRestaurant: Restaurant = { id: String(Date.now()), ...data };
    persistUpdate((prev) => [...prev, newRestaurant]);
  }, [persistUpdate]);

  const update = useCallback((id: string, data: Partial<Restaurant>) => {
    persistUpdate((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  }, [persistUpdate]);

  const remove = useCallback((id: string) => {
    persistUpdate((prev) => prev.filter((r) => r.id !== id));
  }, [persistUpdate]);

  const incrementRecurrence = useCallback((id: string) => {
    persistUpdate((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, recurrence: Math.min(r.recurrence + 1, 5) } : r
      )
    );
  }, [persistUpdate]);

  return { restaurants, add, update, remove, incrementRecurrence };
}
