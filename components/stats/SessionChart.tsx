"use client"

import { motion } from "motion/react"

interface Bar { date: string; count: number }

interface PhaseTheme {
  cardText2:  string
  accent:     string
  trackColor: string
}

interface SessionChartProps {
  data:  Bar[]
  theme: PhaseTheme
}

export function SessionChart({ data, theme }: SessionChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex flex-col gap-3">
      <span
        className="font-bold uppercase"
        style={{
          color:         "rgba(255,255,255,0.65)",
          fontFamily:    "var(--font-nunito)",
          fontSize:      "0.6rem",
          letterSpacing: "0.16em",
        }}
      >
        Last 7 days
      </span>

      <div
        className="flex items-end gap-1.5 px-0.5"
        style={{ height: "84px" }}
        role="img"
        aria-label="Bar chart of sessions over the last 7 days"
      >
        {data.map((d, i) => {
          const isToday = i === data.length - 1
          const pct     = d.count === 0 ? 5 : Math.max(14, (d.count / max) * 100)

          const barBg = d.count > 0
            ? (isToday ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)")
            : "rgba(255,255,255,0.1)"

          const shadow = isToday && d.count > 0
            ? "0 4px 12px rgba(255,255,255,0.3)"
            : "none"

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-full flex items-end" style={{ height: "62px" }}>
                <motion.div
                  className="w-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height:          `${pct}%`,
                    background:      barBg,
                    transformOrigin: "bottom",
                    minHeight:       3,
                    borderRadius:    "4px 4px 2px 2px",
                    boxShadow:       shadow,
                  }}
                  aria-label={`${d.date}: ${d.count} sessions`}
                />
              </div>
              <span
                className="font-bold capitalize"
                style={{
                  color:         isToday ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                  fontFamily:    "var(--font-nunito)",
                  fontSize:      "0.58rem",
                  letterSpacing: "0.04em",
                }}
              >
                {d.date.replace(".", "").slice(0, 2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
