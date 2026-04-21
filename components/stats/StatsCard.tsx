"use client"

interface PhaseTheme {
  cardText: string
  cardText2: string
  accent: string
  trackColor: string
}

interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  theme: PhaseTheme
}

export function StatsCard({ label, value, sub, theme }: StatsCardProps) {
  return (
    <div
      className="flex flex-col gap-1.5 p-4 rounded-2xl"
      style={{ background: theme.trackColor }}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: theme.cardText2, fontFamily: "var(--font-nunito)" }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-extrabold tabular-nums leading-none"
          style={{ color: theme.accent === "#ffffff" ? theme.cardText : theme.accent, fontFamily: "var(--font-nunito)" }}
        >
          {value}
        </span>
        {sub && (
          <span
            className="text-xs font-medium"
            style={{ color: theme.cardText2 }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}
