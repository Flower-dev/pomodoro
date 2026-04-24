"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { usePomodoro, type TimerStatus } from "@/hooks/usePomodoro"
import { type Phase } from "@/lib/constants"
import { TimerDisplay, formatTime } from "@/components/timer/TimerDisplay"
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

type ThemeKey  = keyof typeof PHASE_THEME
type BlobTheme = { blobDark: string; blobMid: string; blobLight: string }

// ── Full-screen blob background ───────────────────────────────────────────────
function FullScreenDecorations({ theme }: { theme: BlobTheme }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {/* ── Large pills ── */}
        <rect x="1180" y="-120" width="160" height="380" rx="80"
          fill={theme.blobDark}
          transform="rotate(25 1260 70)"
          style={{ animation: "blob-float-slow 16s ease-in-out infinite" }}
        />
        <rect x="-80" y="640" width="150" height="340" rx="75"
          fill={theme.blobMid}
          transform="rotate(-20 -5 810)"
          style={{ animation: "blob-float 13s ease-in-out infinite 1.5s" }}
        />
        <rect x="60" y="200" width="110" height="260" rx="55"
          fill={theme.blobDark}
          transform="rotate(12 115 330)"
          opacity="0.7"
          style={{ animation: "blob-float-slow 18s ease-in-out infinite 3s" }}
        />
        <rect x="1260" y="400" width="100" height="230" rx="50"
          fill={theme.blobMid}
          transform="rotate(-15 1310 515)"
          opacity="0.75"
          style={{ animation: "blob-float 12s ease-in-out infinite 2s" }}
        />
        <rect x="600" y="780" width="120" height="200" rx="60"
          fill={theme.blobLight}
          transform="rotate(8 660 880)"
          opacity="0.6"
          style={{ animation: "blob-float 10s ease-in-out infinite 0.8s" }}
        />
        {/* Small pill — top center */}
        <rect x="640" y="-30" width="80" height="180" rx="40"
          fill={theme.blobMid}
          transform="rotate(-8 680 60)"
          opacity="0.5"
          style={{ animation: "blob-float-slow 15s ease-in-out infinite 4s" }}
        />

        {/* ── 4-petal flowers ── */}
        {/* Bottom-right flower — large */}
        <g transform="translate(1340, 820)" style={{ animation: "blob-float 10s ease-in-out infinite 0.5s" }}>
          <circle cx="0"   cy="-42" r="36" fill={theme.blobLight} />
          <circle cx="42"  cy="0"   r="36" fill={theme.blobLight} />
          <circle cx="0"   cy="42"  r="36" fill={theme.blobLight} />
          <circle cx="-42" cy="0"   r="36" fill={theme.blobLight} />
        </g>
        {/* Top-left flower — medium */}
        <g transform="translate(120, 100)" opacity="0.75" style={{ animation: "blob-float 8s ease-in-out infinite 2.5s" }}>
          <circle cx="0"   cy="-28" r="24" fill={theme.blobMid} />
          <circle cx="28"  cy="0"   r="24" fill={theme.blobMid} />
          <circle cx="0"   cy="28"  r="24" fill={theme.blobMid} />
          <circle cx="-28" cy="0"   r="24" fill={theme.blobMid} />
        </g>
        {/* Mid-bottom flower */}
        <g transform="translate(400, 820)" opacity="0.5" style={{ animation: "blob-float 11s ease-in-out infinite 1s" }}>
          <circle cx="0"   cy="-20" r="17" fill={theme.blobDark} />
          <circle cx="20"  cy="0"   r="17" fill={theme.blobDark} />
          <circle cx="0"   cy="20"  r="17" fill={theme.blobDark} />
          <circle cx="-20" cy="0"   r="17" fill={theme.blobDark} />
        </g>
        {/* Right-mid small flower */}
        <g transform="translate(1380, 360)" opacity="0.45" style={{ animation: "blob-float 9s ease-in-out infinite 4s" }}>
          <circle cx="0"   cy="-16" r="13" fill={theme.blobLight} />
          <circle cx="16"  cy="0"   r="13" fill={theme.blobLight} />
          <circle cx="0"   cy="16"  r="13" fill={theme.blobLight} />
          <circle cx="-16" cy="0"   r="13" fill={theme.blobLight} />
        </g>
        {/* Top-center small flower */}
        <g transform="translate(720, 60)" opacity="0.5" style={{ animation: "blob-float 7s ease-in-out infinite 1.2s" }}>
          <circle cx="0"   cy="-14" r="12" fill={theme.blobLight} />
          <circle cx="14"  cy="0"   r="12" fill={theme.blobLight} />
          <circle cx="0"   cy="14"  r="12" fill={theme.blobLight} />
          <circle cx="-14" cy="0"   r="12" fill={theme.blobLight} />
        </g>

        {/* ── Accent circles ── */}
        <circle cx="200" cy="820" r="22" fill={theme.blobDark}  opacity="0.5"
          style={{ animation: "blob-float 9s ease-in-out infinite 3.5s" }} />
        <circle cx="1200" cy="160" r="18" fill={theme.blobMid} opacity="0.55"
          style={{ animation: "blob-float-slow 14s ease-in-out infinite 0.7s" }} />
        <circle cx="900" cy="780" r="16" fill={theme.blobDark} opacity="0.4"
          style={{ animation: "blob-float 8s ease-in-out infinite 2.2s" }} />
      </svg>
    </div>
  )
}

// ── Phase icon ────────────────────────────────────────────────────────────────
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

// ── Shared cycle dots ─────────────────────────────────────────────────────────
function CycleDots({ cyclesCompleted, status, phase, theme }: {
  cyclesCompleted: number
  status: TimerStatus
  phase: Phase
  theme: typeof PHASE_THEME[ThemeKey]
}) {
  return (
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
              width:     filled ? 9 : 8,
              height:    filled ? 9 : 8,
              boxShadow: filled ? "0 0 8px rgba(255,255,255,0.6)" : "none",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )
      })}
    </div>
  )
}

// ── Glass panel styles (shared) ───────────────────────────────────────────────
const glassPanelStyle: React.CSSProperties = {
  background:           "rgba(255,255,255,0.10)",
  backdropFilter:       "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border:               "1.5px solid rgba(255,255,255,0.28)",
  borderRadius:         "2.5rem",
  overflow:             "hidden",
  boxShadow:            "0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
}

// ── Timer panel content ───────────────────────────────────────────────────────
function TimerPanel({
  phase, status, remaining, cyclesCompleted,
  theme, onShowStats, start, pause, reset, addTime, selectPhase,
  hideStatsBtn,
}: {
  phase: Phase
  status: TimerStatus
  remaining: number
  cyclesCompleted: number
  theme: typeof PHASE_THEME[ThemeKey]
  onShowStats?: () => void
  start: () => void
  pause: () => void
  reset: () => void
  addTime: (seconds: number) => void
  selectPhase: (p: Phase) => void
  hideStatsBtn?: boolean
}) {
  return (
    <div className="flex flex-col flex-1 px-7 pt-7 pb-9 gap-5 relative" style={{ zIndex: 10 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {!hideStatsBtn ? (
          <button
            onClick={onShowStats}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-80 active:scale-95"
            style={{
              background:    "rgba(255,255,255,0.18)",
              border:        "1.5px solid rgba(255,255,255,0.28)",
              cursor:        "pointer",
              backdropFilter:"blur(4px)",
            }}
            aria-label="View stats"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6"  y1="20" x2="6"  y2="14" />
            </svg>
          </button>
        ) : (
          <div style={{ width: 36 }} aria-hidden="true" />
        )}

        <CycleDots cyclesCompleted={cyclesCompleted} status={status} phase={phase} theme={theme} />

        <div style={{ width: 36 }} aria-hidden="true" />
      </div>

      {/* Arc timer (icon only at center) */}
      <div className="flex justify-center">
        <TimerDisplay
          remaining={remaining}
          phase={phase}
          isCompleted={status === "completed"}
          theme={theme}
        />
      </div>

      {/* Phase label */}
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
            background:    "rgba(255,255,255,0.15)",
            border:        "1.5px solid rgba(255,255,255,0.25)",
            backdropFilter:"blur(4px)",
          }}
        >
          <PhaseIcon phase={phase} color="rgba(255,255,255,0.9)" />
          <span className="text-sm font-bold" style={{ color: "#ffffff", fontFamily: "var(--font-nunito)", letterSpacing: "0.02em" }}>
            {PHASE_LABEL[phase]}
          </span>
        </div>
      </motion.div>

      {/* Mode selector */}
      <ModeSelector
        phase={phase}
        status={status}
        onSelect={selectPhase}
        theme={theme}
      />

      {/* Time digits — between mode selector and controls */}
      <motion.div
        className="flex justify-center"
        animate={status === "completed" ? { scale: [1, 1.06, 0.97, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          key={`${phase}-${status === "completed"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="tabular-nums leading-none select-none"
          style={{
            fontFamily:    "var(--font-nunito), system-ui, sans-serif",
            fontSize:      "clamp(3.0rem, 14vw, 4.0rem)",
            fontWeight:    800,
            color:         "#ffffff",
            letterSpacing: "-0.01em",
            textShadow:    "0 2px 20px rgba(0,0,0,0.15)",
          }}
          aria-live="off"
        >
          {formatTime(remaining)}
        </motion.span>
      </motion.div>

      {/* Controls + +5 min */}
      <div className="flex flex-col items-center gap-3 mt-auto">
        <TimerControls
          status={status}
          phase={phase}
          onStart={start}
          onPause={pause}
          onReset={reset}
          theme={theme}
        />

        {/* +5 min — focus only, not completed */}
        <AnimatePresence>
          {phase === "focus" && status !== "completed" && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => addTime(300)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold select-none"
              style={{
                background:    "rgba(255,255,255,0.13)",
                border:        "1.5px solid rgba(255,255,255,0.28)",
                backdropFilter:"blur(4px)",
                cursor:        "pointer",
                color:         "rgba(255,255,255,0.85)",
                fontFamily:    "var(--font-nunito)",
                fontSize:      "0.72rem",
                letterSpacing: "0.06em",
              }}
              aria-label="Add 5 minutes to focus session"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              5 min
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Stats panel content ───────────────────────────────────────────────────────
function StatsPanel({
  theme, stats, clearSessions, onBack, hideBackBtn,
}: {
  theme: typeof PHASE_THEME[ThemeKey]
  stats: ReturnType<typeof usePomodoro>["stats"]
  clearSessions: () => void
  onBack?: () => void
  hideBackBtn?: boolean
}) {
  return (
    <div
      className="flex flex-col flex-1 px-7 pt-7 pb-9 gap-5 relative"
      style={{ zIndex: 10, color: theme.cardText }}
    >
      <div className="flex items-center gap-3">
        {!hideBackBtn ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-80 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.18)",
              border:     "1.5px solid rgba(255,255,255,0.28)",
              cursor:     "pointer",
            }}
            aria-label="Back to timer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : (
          <div style={{ width: 36 }} aria-hidden="true" />
        )}
        <span
          className="font-bold tracking-widest uppercase"
          style={{ color: "#ffffff", fontFamily: "var(--font-nunito)", fontSize: "0.78rem", letterSpacing: "0.14em" }}
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
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function PomodoroApp() {
  const [view, setView] = useState<View>("timer")

  const {
    phase, status, remaining, cyclesCompleted,
    start, pause, reset, addTime, selectPhase, stats, clearSessions,
  } = usePomodoro()

  const theme = PHASE_THEME[phase as ThemeKey]

  return (
    <motion.main
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-4 py-8 relative"
      animate={{ backgroundColor: theme.cardBg }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* Full-screen blob pattern — always visible */}
      <FullScreenDecorations theme={theme} />

      {/* ── Unique card — responsive width ──────────────────────────────────── */}
      <div
        className="w-full flex justify-center"
        style={{ position: "relative", zIndex: 10 }}
      >
        <motion.div
          className="w-full flex flex-col"
          style={{
            ...glassPanelStyle,
            maxWidth: "clamp(340px, 90vw, 520px)",
            minHeight: "clamp(580px, 80vh, 720px)",
          }}
        >
          <AnimatePresence mode="wait">
            {view === "timer" ? (
              <motion.div
                key="timer"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col flex-1"
              >
                <TimerPanel
                  phase={phase} status={status} remaining={remaining}
                  cyclesCompleted={cyclesCompleted} theme={theme}
                  onShowStats={() => setView("stats")}
                  start={start} pause={pause} reset={reset} addTime={addTime}
                  selectPhase={selectPhase}
                />
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col flex-1"
              >
                <StatsPanel
                  theme={theme} stats={stats} clearSessions={clearSessions}
                  onBack={() => setView("timer")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.main>
  )
}
