'use client';

import { cn } from '@/lib/utils';
import type { Filters } from '@/lib/types';

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  categories: string[];
  geolocationAvailable: boolean;
  className?: string;
}

const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
];

const RECURRENCE_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

export function FilterBar({
  filters,
  setFilters,
  resetFilters,
  categories,
  geolocationAvailable,
  className,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.budget.length > 0 ||
    filters.maxDistance !== null ||
    filters.maxRecurrence !== null;

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: next });
  };

  const toggleBudget = (b: 1 | 2 | 3) => {
    const next = filters.budget.includes(b)
      ? filters.budget.filter((x) => x !== b)
      : [...filters.budget, b];
    setFilters({ ...filters, budget: next });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-warm-gray uppercase tracking-[0.15em]">
          Filtres
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-terracotta hover:text-terracotta-dark transition-colors underline underline-offset-2"
          >
            Reinitialiser
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {/* Categories */}
        {categories.map((cat) => {
          const active = filters.categories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200',
                active
                  ? 'bg-terracotta/10 border-terracotta/25 text-terracotta'
                  : 'bg-cream border-parchment text-warm-gray hover:border-warm-gray/30 hover:text-ink-muted'
              )}
            >
              {cat}
              {active && ' ×'}
            </button>
          );
        })}

        {/* Visual separator */}
        {categories.length > 0 && (
          <div className="w-px h-6 bg-parchment self-center mx-0.5" />
        )}

        {/* Budget */}
        {([1, 2, 3] as const).map((b) => {
          const active = filters.budget.includes(b);
          const labels = { 1: '€', 2: '€€', 3: '€€€' } as const;
          const activeColors = {
            1: 'bg-sage/10 border-sage/30 text-sage-dark',
            2: 'bg-terracotta/10 border-terracotta/25 text-terracotta',
            3: 'bg-burgundy/10 border-burgundy/25 text-burgundy',
          };
          return (
            <button
              key={b}
              onClick={() => toggleBudget(b)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-200',
                active
                  ? activeColors[b]
                  : 'bg-cream border-parchment text-warm-gray hover:border-warm-gray/30 hover:text-ink-muted'
              )}
            >
              {labels[b]}
            </button>
          );
        })}

        {/* Distance */}
        <div className="relative">
          <select
            value={filters.maxDistance ?? ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxDistance: e.target.value ? Number(e.target.value) : null,
              })
            }
            disabled={!geolocationAvailable}
            className={cn(
              'appearance-none px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 bg-cream border-parchment pr-6 cursor-pointer',
              !geolocationAvailable
                ? 'text-parchment cursor-not-allowed opacity-50'
                : filters.maxDistance !== null
                  ? 'text-sage-dark border-sage/30 bg-sage/10'
                  : 'text-warm-gray hover:border-warm-gray/30 hover:text-ink-muted'
            )}
          >
            <option value="">Distance</option>
            {DISTANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                ≤ {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-warm-gray text-[8px]">
            ▼
          </div>
        </div>

        {/* Recurrence */}
        <div className="relative">
          <select
            value={filters.maxRecurrence ?? ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxRecurrence: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={cn(
              'appearance-none px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 bg-cream border-parchment pr-6 cursor-pointer',
              filters.maxRecurrence !== null
                ? 'text-burgundy border-burgundy/25 bg-burgundy/8'
                : 'text-warm-gray hover:border-warm-gray/30 hover:text-ink-muted'
            )}
          >
            <option value="">Frequence</option>
            {RECURRENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                ≤ {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-warm-gray text-[8px]">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
}
