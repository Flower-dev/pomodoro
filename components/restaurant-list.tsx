'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/types';
import type { Filters } from '@/lib/types';
import { Stars } from '@/components/stars';
import { BudgetBadge } from '@/components/budget-badge';
import { DistanceBadge } from '@/components/distance-badge';
import { FilterBar } from '@/components/filter-bar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RestaurantListProps {
  restaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  categories: string[];
  geolocationAvailable: boolean;
  userPosition: { lat: number; lng: number } | null;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function RestaurantList({
  restaurants,
  filteredRestaurants,
  filters,
  setFilters,
  resetFilters,
  categories,
  geolocationAvailable,
  userPosition,
  onEdit,
  onDelete,
  onAdd,
}: RestaurantListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);

  // Empty state
  if (restaurants.length === 0) {
    return (
      <section className="w-full flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-20 h-20 rounded-full bg-cream-dark border border-parchment flex items-center justify-center text-4xl">
          🍽️
        </div>
        <div className="text-center">
          <h2 className="font-heading text-xl font-black italic text-ink mb-2">
            Aucun restaurant
          </h2>
          <p className="text-sm text-warm-gray max-w-xs leading-relaxed">
            Commence par ajouter tes adresses preferees pour pouvoir lancer le tirage !
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-3 rounded-lg font-bold text-sm bg-terracotta text-white hover:bg-terracotta-dark shadow-md shadow-terracotta/15 transition-all active:scale-[0.97]"
        >
          + Ajouter mon premier restaurant
        </button>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-black italic text-ink tracking-tight">
            Mes Adresses
          </h2>
          <p className="text-xs text-warm-gray mt-0.5">
            {filteredRestaurants.length} sur {restaurants.length} affiche{restaurants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-parchment bg-white p-4 shadow-sm">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          categories={categories}
          geolocationAvailable={geolocationAvailable}
        />
      </div>

      {/* Empty filter result */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-gray text-sm mb-3">
            Aucun restaurant ne correspond aux filtres
          </p>
          <button
            onClick={resetFilters}
            className="text-xs text-terracotta hover:text-terracotta-dark font-semibold transition-colors underline underline-offset-2"
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : (
        /* Restaurant cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredRestaurants.map((r, i) => (
            <article
              key={r.id}
              className="group relative bg-white rounded-xl border border-parchment p-4 hover:border-warm-gray/40 hover:shadow-md transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start gap-3">
                {/* Emoji */}
                <span className="text-3xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                  {r.emoji}
                </span>

                <div className="min-w-0 flex-1">
                  {/* Name & Category */}
                  <h3 className="font-heading font-bold text-ink text-[15px] italic truncate">
                    {r.name}
                  </h3>
                  <p className="text-[10px] text-warm-gray uppercase tracking-[0.15em] font-semibold">
                    {r.category}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <Stars count={r.appreciation} className="text-xs" />
                    <BudgetBadge budget={r.budget} />
                    <DistanceBadge
                      restaurantCoords={r.coords}
                      userPosition={userPosition}
                    />
                  </div>
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(r)}
                  className="p-1.5 rounded-md text-sage hover:text-sage-dark hover:bg-sage/10 transition-colors"
                  aria-label={`Modifier ${r.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(r)}
                  className="p-1.5 rounded-md text-burgundy/60 hover:text-burgundy hover:bg-burgundy/8 transition-colors"
                  aria-label={`Supprimer ${r.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={onAdd}
        className="w-full px-4 py-3.5 rounded-xl border-2 border-dashed border-parchment hover:border-terracotta/30 hover:bg-terracotta/3 transition-all duration-200 text-warm-gray hover:text-terracotta font-semibold text-sm active:scale-[0.99]"
      >
        + Ajouter un restaurant
      </button>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {deleteTarget?.name} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Le restaurant sera definitivement supprime de ta liste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
