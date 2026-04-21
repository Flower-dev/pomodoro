"use client"

import { motion } from "motion/react"

interface Bar { date: string; count: number }

interface PhaseTheme {
  cardText2: string
  accent: string
  trackColor: string
}

interface SessionChartProps {
  data: Bar[]
  theme: PhaseTheme
}

export function SessionChart({ data, theme }: SessionChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex flex-col gap-3">
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: theme.cardText2, fontFamily: "var(--font-nunito)" }}
      >
        Last 7 days
      </span>
      <div className="flex items-end gap-1.5 h-16">
        {data.map((d, i) => {
          const isToday = i === data.length - 1
          const pct = d.count === 0 ? 6 : Math.max(14, (d.count / max) * 100)
          const barColor = theme.accent === "#ffffff"
            ? (d.count > 0 ? (isToday ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)") : "rgba(255,255,255,0.1)")
            : (d.count > 0 ? (isToday ? theme.accent : `${theme.accent}55`) : theme.trackColor)

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-full flex items-end" style={{ height: "48px" }}>
                <motion.div
                  className="w-full rounded-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: `${pct}%`,
                    background: barColor,
                    transformOrigin: "bottom",
                    minHeight: 3,
                  }}
                />
              </div>
              <span
                className="text-[9px] font-semibold capitalize"
                style={{
                  color: isToday ? (theme.accent === "#ffffff" ? "rgba(255,255,255,0.9)" : theme.accent) : theme.cardText2,
                  fontFamily: "var(--font-nunito)",
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
