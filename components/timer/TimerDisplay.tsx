"use client"

import { motion } from "motion/react"
import { DURATIONS, type Phase } from "@/lib/constants"

interface PhaseTheme {
  cardText: string
  cardText2: string
  accent: string
  trackColor: string
}

interface TimerDisplayProps {
  remaining: number
  phase: Phase
  isCompleted: boolean
  theme: PhaseTheme
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const R = 98
const C = 2 * Math.PI * R

// Tip dot position (clockwise from top)
function tipPosition(progress: number) {
  const angle = (progress * 360 - 90) * (Math.PI / 180)
  return {
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
  }
}

export function TimerDisplay({ remaining, phase, isCompleted, theme }: TimerDisplayProps) {
  const total = DURATIONS[phase]
  const progress = Math.max(0, Math.min(1, remaining / total))
  const dashOffset = C * (1 - progress)
  const tip = tipPosition(progress)

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute"
        style={{ overflow: "visible" }}
      >
        {/* Track ring */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={theme.trackColor}
          strokeWidth={2.5}
        />

        {/* Progress arc */}
        <motion.circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={theme.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={C}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: "linear" }}
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: "rotate(-90deg)",
          }}
        />

        {/* Moving dot at tip */}
        {progress > 0.01 && (
          <motion.circle
            r={6}
            fill={theme.accent}
            animate={{ cx: tip.x, cy: tip.y }}
            transition={{ duration: 0.6, ease: "linear" }}
          />
        )}
      </svg>

      {/* Time text, centered */}
      <motion.div
        className="relative z-10 flex flex-col items-center select-none"
        animate={isCompleted ? { scale: [1, 1.05, 0.97, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          key={`${phase}-${isCompleted}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="tabular-nums font-bold leading-none"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: "clamp(3rem, 13vw, 4rem)",
            color: theme.cardText,
            letterSpacing: "-0.02em",
          }}
        >
          {formatTime(remaining)}
        </motion.span>
      </motion.div>
    </div>
  )
}
