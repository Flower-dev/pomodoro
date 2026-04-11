'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Restaurant } from '@/lib/types';
import { useRestaurants } from '@/hooks/use-restaurants';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useFilters } from '@/hooks/use-filters';
import { SpinnerView } from '@/components/spinner-view';
import { RestaurantList } from '@/components/restaurant-list';
import { RestaurantForm } from '@/components/restaurant-form';

type Tab = 'spin' | 'list' | 'edit';

export default function Home() {
  const { restaurants, add, update, remove, incrementRecurrence } = useRestaurants();
  const geo = useGeolocation();
  const { filters, setFilters, resetFilters, filteredRestaurants, categories } =
    useFilters(restaurants, geo.position);

  const [tab, setTab] = useState<Tab>('spin');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Request geolocation on mount (once)
  const [geoRequested, setGeoRequested] = useState(false);
  useEffect(() => {
    if (!geoRequested && typeof navigator !== 'undefined' && navigator.geolocation) {
      setGeoRequested(true);
      geo.requestPosition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoRequested]);

  const handleEdit = useCallback((r: Restaurant) => {
    setEditingRestaurant(r);
    setTab('edit');
  }, []);

  const handleAdd = useCallback(() => {
    setEditingRestaurant(null);
    setTab('edit');
  }, []);

  const handleSave = useCallback(
    (data: Omit<Restaurant, 'id'>) => {
      if (editingRestaurant) {
        update(editingRestaurant.id, data);
      } else {
        add(data);
      }
      setEditingRestaurant(null);
      setTab('list');
    },
    [editingRestaurant, update, add]
  );

  const handleCancel = useCallback(() => {
    setEditingRestaurant(null);
    setTab('list');
  }, []);

  return (
    <div className="min-h-screen bg-cream text-ink relative flex flex-col">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-terracotta via-burgundy to-sage" />

      {/* Header */}
      <header className="relative z-10 border-b border-parchment">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-warm-gray font-semibold mb-1">
              Tirage au sort culinaire
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-black italic text-ink tracking-tight leading-none">
              Qu&apos;est-ce qu&apos;on mange&nbsp;?
            </h1>
          </div>
          <nav className="flex items-center gap-1" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'spin'}
              onClick={() => setTab('spin')}
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                tab === 'spin'
                  ? 'text-terracotta bg-terracotta/8'
                  : 'text-warm-gray hover:text-ink'
              }`}
            >
              La Roulette
              {tab === 'spin' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-terracotta rounded-full" />
              )}
            </button>
            <button
              role="tab"
              aria-selected={tab === 'list' || tab === 'edit'}
              onClick={() => setTab('list')}
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                tab === 'list' || tab === 'edit'
                  ? 'text-sage-dark bg-sage/8'
                  : 'text-warm-gray hover:text-ink'
              }`}
            >
              Mes Adresses
              <span className="ml-1.5 text-xs text-warm-gray">
                {restaurants.length}
              </span>
              {(tab === 'list' || tab === 'edit') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sage rounded-full" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-5 sm:px-8 py-8 flex-1 flex flex-col">
          {tab === 'spin' && (
            <SpinnerView
              filteredRestaurants={filteredRestaurants}
              allRestaurants={restaurants}
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              categories={categories}
              geolocationAvailable={geo.position !== null}
              userPosition={geo.position}
              incrementRecurrence={incrementRecurrence}
            />
          )}

          {tab === 'list' && (
            <RestaurantList
              restaurants={restaurants}
              filteredRestaurants={filteredRestaurants}
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              categories={categories}
              geolocationAvailable={geo.position !== null}
              userPosition={geo.position}
              onEdit={handleEdit}
              onDelete={remove}
              onAdd={handleAdd}
            />
          )}

          {tab === 'edit' && (
            <RestaurantForm
              restaurant={editingRestaurant}
              onSave={handleSave}
              onCancel={handleCancel}
              onRequestPosition={geo.requestPosition}
              userPosition={geo.position}
              geoLoading={geo.loading}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-parchment py-4 text-center">
        <p className="text-[11px] text-warm-gray tracking-wide">
          Fait avec gourmandise — {restaurants.length} restaurants au compteur
        </p>
      </footer>
    </div>
  );
}
