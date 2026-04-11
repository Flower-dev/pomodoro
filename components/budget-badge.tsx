'use client';

import { cn } from '@/lib/utils';

const LABELS: Record<1 | 2 | 3, string> = {
  1: '€',
  2: '€€',
  3: '€€€',
};

const COLORS: Record<1 | 2 | 3, string> = {
  1: 'text-sage-dark bg-sage/8 border-sage/20',
  2: 'text-terracotta bg-terracotta/8 border-terracotta/20',
  3: 'text-burgundy bg-burgundy/8 border-burgundy/20',
};

interface BudgetBadgeProps {
  budget: 1 | 2 | 3;
  className?: string;
}

export function BudgetBadge({ budget, className }: BudgetBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border tracking-wide',
        COLORS[budget],
        className
      )}
    >
      {LABELS[budget]}
    </span>
  );
}
