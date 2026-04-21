"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { usePomodoro } from "@/hooks/usePomodoro"
import { TimerDisplay } from "@/components/timer/TimerDisplay"
import { TimerControls } from "@/components/timer/TimerControls"
import { ModeSelector } from "@/components/timer/ModeSelector"
import { StatsDashboard } from "@/components/stats/StatsDashboard"

type View = "timer" | "stats"

// Phase-based card theming
const PHASE_THEME = {
  focus: {
    pageBg: "#7aab8a",
    cardBg: "#ffffff",
    cardText: "#2a4535",
    cardText2: "#7a9e87",
    accent: "#3d704e",
    trackColor: "rgba(61,112,78,0.12)",
    btnBg: "#3d704e",
    btnFg: "#ffffff",
    dotFilled: "#3d704e",
    dotEmpty: "rgba(61,112,78,0.18)",
  },
  "short-break": {
    pageBg: "#5c8a6e",
    cardBg: "#3d6b4a",
    cardText: "#ffffff",
    cardText2: "rgba(255,255,255,0.55)",
    accent: "#ffffff",
    trackColor: "rgba(255,255,255,0.18)",
    btnBg: "#ffffff",
    btnFg: "#3d6b4a",
    dotFilled: "#ffffff",
    dotEmpty: "rgba(255,255,255,0.25)",
  },
  "long-break": {
    pageBg: "#4a7a5c",
    cardBg: "#2d5a3d",
    cardText: "#ffffff",
    cardText2: "rgba(255,255,255,0.55)",
    accent: "#ffffff",
    trackColor: "rgba(255,255,255,0.18)",
    btnBg: "#ffffff",
    btnFg: "#2d5a3d",
    dotFilled: "#ffffff",
    dotEmpty: "rgba(255,255,255,0.25)",
  },
}

// Phase icons (SVG paths, inline)
function PhaseIcon({ phase, color }: { phase: string; color: string }) {
  if (phase === "focus") {
    // Monitor / work icon
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }
  if (phase === "short-break") {
    // Sprout / plant icon
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" />
        <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z" />
        <path d="M12 12C12 8 15 5 19 5c0 4-3 7-7 7z" />
      </svg>
    )
  }
  // Long break — coffee cup
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  )
}

const PHASE_LABEL: Record<string, string> = {
  focus: "Work Mode",
  "short-break": "Short Break",
  "long-break": "Long Break",
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

  const theme = PHASE_THEME[phase]

  return (
    <motion.main
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-5 py-8"
      animate={{ background: theme.pageBg }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Card */}
      <motion.div
        className="w-full max-w-[340px] flex flex-col"
        animate={{ background: theme.cardBg }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        style={{
          borderRadius: "2.5rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          overflow: "hidden",
          minHeight: "580px",
        }}
      >
        <AnimatePresence mode="wait">
          {view === "timer" ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 px-8 pt-8 pb-10 gap-6"
            >
              {/* Header: back arrow (decorative) + cycle dots + stats button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setView("stats")}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-60"
                  style={{ background: theme.trackColor, cursor: "pointer" }}
                  aria-label="View stats"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.cardText2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Cycle dots */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const filled = i < cyclesCompleted
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
                          width: filled ? 10 : 9,
                          height: filled ? 10 : 9,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )
                  })}
                </div>

                <div style={{ width: 32 }} />
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

              {/* Mode label + icon */}
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-3"
              >
                <span
                  className="text-base font-semibold tracking-wide"
                  style={{ color: theme.cardText, fontFamily: "var(--font-nunito)" }}
                >
                  {PHASE_LABEL[phase]}
                </span>
                <div style={{ opacity: 0.7 }}>
                  <PhaseIcon phase={phase} color={theme.cardText} />
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
              className="flex flex-col flex-1 px-8 pt-8 pb-10 gap-5"
              style={{ color: theme.cardText }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("timer")}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-60"
                  style={{ background: theme.trackColor, cursor: "pointer" }}
                  aria-label="Back to timer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.cardText2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span
                  className="text-base font-bold"
                  style={{ color: theme.cardText, fontFamily: "var(--font-nunito)" }}
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
