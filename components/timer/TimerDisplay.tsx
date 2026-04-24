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

export function formatTime(seconds: number): string {
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

function PhaseIcon({ phase, color, size = 18 }: { phase: Phase; color: string; size?: number }) {
  if (phase === "focus") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }
  if (phase === "short-break") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22V12" />
        <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z" />
        <path d="M12 12C12 8 15 5 19 5c0 4-3 7-7 7z" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  )
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
          <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="dot-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="inner-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={R - 10} fill="url(#inner-light)" />

        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={theme.trackColor}
          strokeWidth={3}
        />

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

      {/* Large phase icon at center */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center justify-center select-none"
      >
        <PhaseIcon phase={phase} color="rgba(255,255,255,0.9)" size={52} />
      </motion.div>
    </div>
  )
}
