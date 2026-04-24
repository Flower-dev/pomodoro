"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { usePomodoro } from "@/hooks/usePomodoro"
import { TimerDisplay } from "@/components/timer/TimerDisplay"
import { TimerControls } from "@/components/timer/TimerControls"
import { ModeSelector } from "@/components/timer/ModeSelector"
import { StatsDashboard } from "@/components/stats/StatsDashboard"

type View = "timer" | "stats"

// Memphis/Pop theme — bold colored cards, white text, organic blobs
const PHASE_THEME = {
  focus: {
    pageBg:      "hsl(350 65% 82%)",
    cardBg:      "hsl(12 70% 53%)",
    cardText:    "#ffffff",
    cardText2:   "rgba(255,255,255,0.65)",
    accent:      "#ffffff",
    accentDim:   "rgba(255,255,255,0.75)",
    trackColor:  "rgba(255,255,255,0.18)",
    glowColor:   "rgba(255,255,255,0.22)",
    btnBg:       "#ffffff",
    btnFg:       "hsl(12 70% 44%)",
    dotFilled:   "#ffffff",
    dotEmpty:    "rgba(255,255,255,0.25)",
    borderColor: "rgba(255,255,255,0.28)",
    blobDark:    "hsl(8 65% 42%)",
    blobMid:     "hsl(20 80% 68%)",
    blobLight:   "hsl(350 55% 76%)",
  },
  "short-break": {
    pageBg:      "hsl(152 38% 72%)",
    cardBg:      "hsl(152 52% 24%)",
    cardText:    "#ffffff",
    cardText2:   "rgba(255,255,255,0.65)",
    accent:      "#ffffff",
    accentDim:   "rgba(255,255,255,0.75)",
    trackColor:  "rgba(255,255,255,0.18)",
    glowColor:   "rgba(255,255,255,0.22)",
    btnBg:       "#ffffff",
    btnFg:       "hsl(152 52% 20%)",
    dotFilled:   "#ffffff",
    dotEmpty:    "rgba(255,255,255,0.25)",
    borderColor: "rgba(255,255,255,0.28)",
    blobDark:    "hsl(152 58% 16%)",
    blobMid:     "hsl(162 48% 40%)",
    blobLight:   "hsl(152 32% 56%)",
  },
  "long-break": {
    pageBg:      "hsl(200 52% 78%)",
    cardBg:      "hsl(200 52% 54%)",
    cardText:    "#ffffff",
    cardText2:   "rgba(255,255,255,0.65)",
    accent:      "#ffffff",
    accentDim:   "rgba(255,255,255,0.75)",
    trackColor:  "rgba(255,255,255,0.18)",
    glowColor:   "rgba(255,255,255,0.22)",
    btnBg:       "#ffffff",
    btnFg:       "hsl(200 52% 28%)",
    dotFilled:   "#ffffff",
    dotEmpty:    "rgba(255,255,255,0.25)",
    borderColor: "rgba(255,255,255,0.28)",
    blobDark:    "hsl(200 55% 38%)",
    blobMid:     "hsl(190 58% 70%)",
    blobLight:   "hsl(200 42% 78%)",
  },
}

type ThemeKey = keyof typeof PHASE_THEME
type BlobTheme = {
  blobDark: string
  blobMid: string
  blobLight: string
}

// Decorative Memphis/Pop organic blob shapes
function CardDecorations({ theme }: { theme: BlobTheme }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ borderRadius: "2.5rem", overflow: "hidden" }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 340 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Large pill — top right, dark shade, rotated */}
        <rect
          x="262" y="-58"
          width="82" height="196"
          rx="41"
          fill={theme.blobDark}
          transform="rotate(22 303 40)"
          style={{ animation: "blob-float-slow 14s ease-in-out infinite" }}
        />

        {/* Medium pill — bottom left, mid shade */}
        <rect
          x="-44" y="408"
          width="72" height="162"
          rx="36"
          fill={theme.blobMid}
          transform="rotate(-18 -8 489)"
          style={{ animation: "blob-float 11s ease-in-out infinite 2s" }}
        />

        {/* 4-petal flower — bottom right, light shade */}
        <g
          transform="translate(280, 528)"
          style={{ animation: "blob-float 9s ease-in-out infinite 0.5s" }}
        >
          <circle cx="0"   cy="-23" r="19" fill={theme.blobLight} />
          <circle cx="23"  cy="0"   r="19" fill={theme.blobLight} />
          <circle cx="0"   cy="23"  r="19" fill={theme.blobLight} />
          <circle cx="-23" cy="0"   r="19" fill={theme.blobLight} />
        </g>

        {/* Small accent circle — top left */}
        <circle
          cx="46" cy="76" r="14"
          fill={theme.blobLight}
          opacity="0.55"
          style={{ animation: "blob-float 7s ease-in-out infinite 1s" }}
        />

        {/* Tiny flower — mid-card right edge */}
        <g transform="translate(328, 290)" opacity="0.45">
          <circle cx="0"   cy="-12" r="10" fill={theme.blobMid} />
          <circle cx="12"  cy="0"   r="10" fill={theme.blobMid} />
          <circle cx="0"   cy="12"  r="10" fill={theme.blobMid} />
          <circle cx="-12" cy="0"   r="10" fill={theme.blobMid} />
        </g>
      </svg>
    </div>
  )
}

// Phase icons — stroke white
function PhaseIcon({ phase, color }: { phase: string; color: string }) {
  if (phase === "focus") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }
  if (phase === "short-break") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22V12" />
        <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z" />
        <path d="M12 12C12 8 15 5 19 5c0 4-3 7-7 7z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  )
}

const PHASE_LABEL: Record<string, string> = {
  focus:         "Focus",
  "short-break": "Short Break",
  "long-break":  "Long Break",
}

export default function PomodoroApp() {
  const [view, setView] = useState<View>("timer")
  const {
    phase,
    status,
    remaining,
    cyclesCompleted,
    start,
    pause,
    reset,
    selectPhase,
    stats,
    clearSessions,
  } = usePomodoro()

  const theme = PHASE_THEME[phase as ThemeKey]

  return (
    <motion.main
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-5 py-8"
      animate={{ backgroundColor: theme.pageBg }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
      style={{ backgroundColor: theme.pageBg }}
    >
      {/* Card */}
      <motion.div
        className="w-full max-w-[340px] flex flex-col relative"
        animate={{ backgroundColor: theme.cardBg }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        style={{
          borderRadius: "2.5rem",
          overflow: "hidden",
          minHeight: "600px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.14)",
        }}
      >
        {/* Memphis blob decorations */}
        <CardDecorations theme={theme} />

        <AnimatePresence mode="wait">
          {view === "timer" ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 px-7 pt-7 pb-9 gap-5 relative"
              style={{ zIndex: 10 }}
            >
              {/* Header: stats button + cycle dots */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setView("stats")}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-80 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1.5px solid rgba(255,255,255,0.28)",
                    cursor: "pointer",
                    backdropFilter: "blur(4px)",
                  }}
                  aria-label="View stats"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6"  y1="20" x2="6"  y2="14" />
                  </svg>
                </button>

                {/* Cycle dots */}
                <div className="flex items-center gap-2" aria-label={`${cyclesCompleted} of 4 cycles completed`}>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const filled  = i < cyclesCompleted
                    const partial = i === cyclesCompleted && status === "running" && phase === "focus"
                    return (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        animate={{
                          background: filled
                            ? theme.dotFilled
                            : partial
                              ? `conic-gradient(${theme.dotFilled} 50%, ${theme.dotEmpty} 0)`
                              : theme.dotEmpty,
                          width:  filled ? 9 : 8,
                          height: filled ? 9 : 8,
                          boxShadow: filled ? "0 0 8px rgba(255,255,255,0.6)" : "none",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )
                  })}
                </div>

                <div style={{ width: 36 }} aria-hidden="true" />
              </div>

              {/* Arc timer */}
              <div className="flex justify-center">
                <TimerDisplay
                  remaining={remaining}
                  phase={phase}
                  isCompleted={status === "completed"}
                  theme={theme}
                />
              </div>

              {/* Phase label + icon */}
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <PhaseIcon phase={phase} color="rgba(255,255,255,0.9)" />
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: "#ffffff",
                      fontFamily: "var(--font-nunito)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {PHASE_LABEL[phase]}
                  </span>
                </div>
              </motion.div>

              {/* Mode selector */}
              <ModeSelector phase={phase} status={status} onSelect={selectPhase} theme={theme} />

              {/* Controls */}
              <div className="flex justify-center mt-auto">
                <TimerControls
                  status={status}
                  phase={phase}
                  onStart={start}
                  onPause={pause}
                  onReset={reset}
                  theme={theme}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 px-7 pt-7 pb-9 gap-5 relative"
              style={{ zIndex: 10, color: theme.cardText }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("timer")}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-80 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1.5px solid rgba(255,255,255,0.28)",
                    cursor: "pointer",
                  }}
                  aria-label="Back to timer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span
                  className="font-bold tracking-widest uppercase"
                  style={{
                    color: "#ffffff",
                    fontFamily: "var(--font-nunito)",
                    fontSize: "0.78rem",
                    letterSpacing: "0.14em",
                  }}
                >
                  Statistics
                </span>
              </div>

              <StatsDashboard
                todayCount={stats.todayCount}
                totalMinutes={stats.totalMinutes}
                currentStreak={stats.currentStreak}
                bestStreak={stats.bestStreak}
                last7Days={stats.last7Days}
                accentColor={theme.accent}
                onClear={clearSessions}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.main>
  )
}
