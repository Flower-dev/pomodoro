'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Restaurant, Filters } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/types';
import { haversineDistance } from '@/lib/distance';

export function useFilters(
  restaurants: Restaurant[],
  userPosition: { lat: number; lng: number } | null
) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Filtre catégorie
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(r.category)
      ) {
        return false;
      }

      // Filtre budget
      if (filters.budget.length > 0 && !filters.budget.includes(r.budget)) {
        return false;
      }

      // Filtre récurrence max
      if (
        filters.maxRecurrence !== null &&
        r.recurrence > filters.maxRecurrence
      ) {
        return false;
      }

      // Filtre distance
      if (
        filters.maxDistance !== null &&
        userPosition !== null &&
        r.coords !== null
      ) {
        const dist = haversineDistance(userPosition, r.coords);
        if (dist > filters.maxDistance) return false;
      } else if (filters.maxDistance !== null && r.coords === null) {
        // Pas de coords → exclu quand le filtre distance est actif
        return false;
      }

      return true;
    });
  }, [restaurants, filters, userPosition]);

  const categories = useMemo(
    () => [...new Set(restaurants.map((r) => r.category))].sort(),
    [restaurants]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    setFilters,
    resetFilters,
    filteredRestaurants,
    categories,
  };
}
