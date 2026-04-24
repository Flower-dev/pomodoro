"use client"

interface PhaseTheme {
  cardText:    string
  cardText2:   string
  accent:      string
  trackColor:  string
  borderColor: string
}

interface StatsCardProps {
  label: string
  value: string | number
  sub?:  string
  theme: PhaseTheme
}

export function StatsCard({ label, value, sub, theme }: StatsCardProps) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.14)",
        border:     "1.5px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(4px)",
      }}
    >
      <span
        className="font-bold uppercase"
        style={{
          color:         "rgba(255,255,255,0.65)",
          fontFamily:    "var(--font-nunito)",
          fontSize:      "0.6rem",
          letterSpacing: "0.16em",
        }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className="tabular-nums leading-none font-bold"
          style={{
            color:      "#ffffff",
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize:   "clamp(1.7rem, 6vw, 2.1rem)",
            fontWeight: 400,
            textShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            className="font-semibold"
            style={{
              color:      "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-nunito)",
              fontSize:   "0.72rem",
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}
