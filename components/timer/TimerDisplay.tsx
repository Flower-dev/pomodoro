"use client"

import { motion } from "motion/react"
import { DURATIONS, type Phase } from "@/lib/constants"

interface PhaseTheme {
  cardText:   string
  cardText2:  string
  accent:     string
  trackColor: string
  glowColor:  string
}

interface TimerDisplayProps {
  remaining:   number
  phase:       Phase
  isCompleted: boolean
  theme:       PhaseTheme
}

function formatTime(seconds: number): string {
  const s   = Math.max(0, Math.ceil(seconds))
  const m   = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

const SIZE = 256
const CX   = SIZE / 2
const CY   = SIZE / 2
const R    = 106
const C    = 2 * Math.PI * R

function tipPosition(progress: number) {
  const angle = (progress * 360 - 90) * (Math.PI / 180)
  return {
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
  }
}

export function TimerDisplay({ remaining, phase, isCompleted, theme }: TimerDisplayProps) {
  const total      = DURATIONS[phase]
  const progress   = Math.max(0, Math.min(1, remaining / total))
  const dashOffset = C * (1 - progress)
  const tip        = tipPosition(progress)

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
      role="timer"
      aria-label={`${formatTime(remaining)} remaining`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {/* Soft white glow for the arc */}
          <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Dot glow */}
          <filter id="dot-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Subtle radial inner light */}
          <radialGradient id="inner-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Inner ambient radial */}
        <circle cx={CX} cy={CY} r={R - 10} fill="url(#inner-light)" />

        {/* Track ring */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={theme.trackColor}
          strokeWidth={3}
        />

        {/* Ghost glow arc */}
        {progress > 0.01 && (
          <motion.circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={theme.accent}
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.6, ease: "linear" }}
            filter="url(#arc-glow)"
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: "rotate(-90deg)",
              opacity: 0.35,
            }}
          />
        )}

        {/* Main progress arc */}
        <motion.circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={theme.accent}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={C}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: "linear" }}
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: "rotate(-90deg)",
          }}
        />

        {/* Tip dot with glow */}
        {progress > 0.01 && (
          <>
            <motion.circle
              r={11}
              fill={theme.accent}
              animate={{ cx: tip.x, cy: tip.y }}
              transition={{ duration: 0.6, ease: "linear" }}
              filter="url(#dot-glow)"
              style={{ opacity: 0.4 }}
            />
            <motion.circle
              r={7}
              fill={theme.accent}
              animate={{ cx: tip.x, cy: tip.y }}
              transition={{ duration: 0.6, ease: "linear" }}
            />
          </>
        )}
      </svg>

      {/* Time text */}
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
          className="tabular-nums leading-none"
          style={{
            fontFamily:    "var(--font-dm-mono), monospace",
            fontSize:      "clamp(3.4rem, 13vw, 4.4rem)",
            fontWeight:    400,
            color:         "#ffffff",
            letterSpacing: "-0.03em",
            textShadow:    "0 2px 16px rgba(0,0,0,0.15)",
          }}
        >
          {formatTime(remaining)}
        </motion.span>
      </motion.div>
    </div>
  )
}
