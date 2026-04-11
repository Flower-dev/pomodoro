'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import type { Restaurant, Filters } from '@/lib/types';
import { weightedRandom } from '@/lib/weighted-random';
import { Stars } from '@/components/stars';
import { BudgetBadge } from '@/components/budget-badge';
import { DistanceBadge } from '@/components/distance-badge';
import { FilterBar } from '@/components/filter-bar';
import { cn } from '@/lib/utils';

interface SpinnerViewProps {
  filteredRestaurants: Restaurant[];
  allRestaurants: Restaurant[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  categories: string[];
  geolocationAvailable: boolean;
  userPosition: { lat: number; lng: number } | null;
  incrementRecurrence: (id: string) => void;
}

export function SpinnerView({
  filteredRestaurants,
  allRestaurants,
  filters,
  setFilters,
  resetFilters,
  categories,
  geolocationAvailable,
  userPosition,
  incrementRecurrence,
}: SpinnerViewProps) {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Orbiting emojis from eligible restaurants
  const orbitEmojis = useMemo(() => {
    const emojis = filteredRestaurants.slice(0, 8).map((r) => r.emoji);
    if (emojis.length === 0) return [];
    return emojis;
  }, [filteredRestaurants]);

  const handleSpin = useCallback(() => {
    if (isSpinning || filteredRestaurants.length === 0) return;
    setIsSpinning(true);
    setIsDone(false);
    setSelected(null);

    const totalTicks = 18;
    let currentTick = 0;

    const tick = () => {
      const pick = weightedRandom(filteredRestaurants);
      setSelected(pick);
      currentTick++;

      if (currentTick >= totalTicks) {
        const finalPick = weightedRandom(filteredRestaurants);
        setSelected(finalPick);
        setIsSpinning(false);
        setIsDone(true);
      } else {
        const delay = 50 + currentTick * 18;
        timeoutRef.current = setTimeout(tick, delay);
      }
    };

    timeoutRef.current = setTimeout(tick, 50);
  }, [isSpinning, filteredRestaurants]);

  const handleRespin = useCallback(() => {
    setIsDone(false);
    setSelected(null);
    setTimeout(() => handleSpin(), 120);
  }, [handleSpin]);

  const handleAccept = useCallback(() => {
    if (selected) {
      incrementRecurrence(selected.id);
      setSelected(null);
      setIsDone(false);
    }
  }, [selected, incrementRecurrence]);

  const eligible = filteredRestaurants.length;
  const hasFilters =
    filters.categories.length > 0 ||
    filters.budget.length > 0 ||
    filters.maxDistance !== null ||
    filters.maxRecurrence !== null;

  return (
    <section className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto flex-1 justify-center py-4">
      {/* Eligible count + filter toggle */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all duration-200',
            hasFilters
              ? 'text-terracotta border-terracotta/25 bg-terracotta/5'
              : 'text-warm-gray border-parchment bg-cream-dark/50 hover:border-warm-gray/30 hover:text-ink-muted'
          )}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Filtres
          {hasFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
          )}
        </button>
        <span
          className={cn(
            'text-xs font-semibold px-3 py-1.5 rounded-lg',
            eligible === 0
              ? 'text-burgundy bg-burgundy/8'
              : 'text-sage-dark bg-sage/8'
          )}
        >
          {eligible} restaurant{eligible !== 1 ? 's' : ''} {eligible !== 1 ? 'eligibles' : 'eligible'}
        </span>
      </div>

      {/* Collapsible filters */}
      {showFilters && (
        <div className="w-full rounded-xl border border-parchment bg-white p-4 shadow-sm animate-fade-up">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            categories={categories}
            geolocationAvailable={geolocationAvailable}
          />
        </div>
      )}

      {/* ── The Plate ── */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Outer plate ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 transition-all duration-500',
            isDone
              ? 'border-terracotta/40 shadow-[0_0_40px_rgba(199,92,46,0.12)]'
              : 'border-parchment'
          )}
        />

        {/* Decorative inner ring */}
        <div
          className={cn(
            'absolute inset-4 rounded-full border transition-all duration-500',
            isDone ? 'border-terracotta/20' : 'border-parchment/60'
          )}
        />

        {/* Pattern ring with dots */}
        <div className="absolute inset-3 rounded-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute w-1 h-1 rounded-full transition-colors duration-500',
                isDone ? 'bg-terracotta/30' : 'bg-parchment'
              )}
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 15}deg) translateY(-${128 - 14}px) translate(-50%, -50%)`,
              }}
            />
          ))}
        </div>

        {/* Orbiting emojis */}
        {!isDone && orbitEmojis.map((emoji, i) => (
          <span
            key={`${emoji}-${i}`}
            className={cn(
              'absolute text-xl sm:text-2xl transition-all duration-300 pointer-events-none',
              isSpinning ? 'opacity-20 blur-[1px]' : 'opacity-60'
            )}
            style={{
              top: '50%',
              left: '50%',
              ['--orbit-start' as string]: `${(360 / orbitEmojis.length) * i}deg`,
              ['--orbit-radius' as string]: '105px',
              animation: isSpinning
                ? `orbit ${1.2 - i * 0.05}s linear infinite`
                : `orbit ${8 + i * 0.5}s linear infinite`,
              transformOrigin: '0 0',
              marginTop: '-0.5em',
              marginLeft: '-0.5em',
            }}
          >
            {emoji}
          </span>
        ))}

        {/* Center content */}
        <div
          className={cn(
            'relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500',
            isDone
              ? 'bg-white shadow-xl scale-105'
              : isSpinning
                ? 'bg-cream-dark'
                : 'bg-white shadow-md'
          )}
        >
          {isDone && selected ? (
            <div className="animate-scale-in text-center px-2">
              <span className="text-4xl sm:text-5xl block mb-1">{selected.emoji}</span>
            </div>
          ) : isSpinning && selected ? (
            <span className="text-4xl sm:text-5xl animate-wiggle">{selected.emoji}</span>
          ) : (
            <div className="text-center">
              <span className="text-3xl sm:text-4xl block mb-2">🍽️</span>
              <span className="text-[10px] text-warm-gray font-medium uppercase tracking-widest">
                Pret ?
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Result card (appears below plate on done) */}
      {isDone && selected && (
        <div className="w-full text-center animate-fade-up">
          <div className="inline-block">
            <h2 className="font-heading text-2xl sm:text-3xl font-black italic text-ink tracking-tight">
              {selected.name}
            </h2>
            <div className="h-px w-12 mx-auto bg-terracotta/40 my-2" />
            <p className="text-xs text-warm-gray uppercase tracking-[0.2em] font-semibold">
              {selected.category}
            </p>
          </div>
          <p className="text-sm text-ink-muted mt-2 max-w-xs mx-auto leading-relaxed">
            {selected.description}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <Stars count={selected.appreciation} className="text-sm" />
            <BudgetBadge budget={selected.budget} />
            <DistanceBadge
              restaurantCoords={selected.coords}
              userPosition={userPosition}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-2 justify-center">
            <span className="text-[11px] text-warm-gray">Frequence</span>
            <Stars count={selected.recurrence} className="text-[11px]" />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isDone && !isSpinning && eligible === 0 && (
        <div className="text-center">
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
      )}

      {/* Action buttons */}
      {isDone && selected ? (
        <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={handleRespin}
            className="group flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm border border-parchment text-ink-muted hover:border-warm-gray hover:text-ink bg-white transition-all active:scale-[0.97] shadow-sm"
          >
            <svg className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Relancer
          </button>
          <button
            onClick={handleAccept}
            className="group flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-terracotta text-white hover:bg-terracotta-dark transition-all active:scale-[0.97] shadow-md shadow-terracotta/20"
          >
            <span className="group-hover:scale-110 transition-transform inline-block">
              🎉
            </span>
            On y va !
          </button>
        </div>
      ) : (
        <button
          onClick={handleSpin}
          disabled={isSpinning || eligible === 0}
          className={cn(
            'group relative px-10 py-3.5 rounded-lg font-bold text-base tracking-wide transition-all duration-300 active:scale-[0.97]',
            isSpinning || eligible === 0
              ? 'bg-parchment text-warm-gray cursor-not-allowed'
              : 'bg-terracotta text-white hover:bg-terracotta-dark shadow-lg shadow-terracotta/20 hover:shadow-xl hover:shadow-terracotta/30'
          )}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-plate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              En cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Lancer la roulette
            </span>
          )}
        </button>
      )}

      {/* Bottom stats */}
      {!isDone && !isSpinning && (
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-warm-gray">
            <strong className="text-ink-muted font-semibold">{allRestaurants.length}</strong> restaurants
          </span>
          <span className="w-px h-3 bg-parchment" />
          <span className="text-xs text-warm-gray">
            <strong className="text-ink-muted font-semibold">{categories.length}</strong> categories
          </span>
        </div>
      )}
    </section>
  );
}
