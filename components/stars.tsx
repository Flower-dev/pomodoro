'use client';

import { cn } from '@/lib/utils';

interface StarsProps {
  count: number;
  onChange?: (value: number) => void;
  className?: string;
}

export function Stars({ count, onChange, className }: StarsProps) {
  const interactive = !!onChange;

  return (
    <span
      className={cn('inline-flex gap-0.5', className)}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? undefined : `Note : ${count} sur 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const active = i < count;
        const value = i + 1;

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(value)}
              className={cn(
                'transition-all duration-150 cursor-pointer',
                active ? 'text-terracotta opacity-100 scale-100' : 'text-parchment opacity-60 scale-90',
                'hover:scale-125 hover:opacity-100'
              )}
              aria-label={`Note ${value} sur 5`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={i}
            className={cn(
              'transition-opacity',
              active ? 'text-terracotta opacity-100' : 'text-parchment opacity-40'
            )}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
