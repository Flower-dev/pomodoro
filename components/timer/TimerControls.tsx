"use client"

import { motion, AnimatePresence } from "motion/react"
import type { TimerStatus } from "@/hooks/usePomodoro"
import type { Phase } from "@/lib/constants"

interface PhaseTheme {
  cardText:   string
  cardText2:  string
  btnBg:      string
  btnFg:      string
  accent:     string
  glowColor:  string
  trackColor: string
}

interface TimerControlsProps {
  status:  TimerStatus
  phase:   Phase
  onStart: () => void
  onPause: () => void
  onReset: () => void
  theme:   PhaseTheme
}

export function TimerControls({ status, onStart, onPause, onReset, theme }: TimerControlsProps) {
  const isRunning = status === "running"
  const showReset = status !== "idle"

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Play/pause button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse ring */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              key="pulse"
              className="absolute rounded-full pointer-events-none"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              style={{
                width:      78,
                height:     78,
                background: "transparent",
                border:     "2px solid rgba(255,255,255,0.5)",
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={isRunning ? onPause : onStart}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.91 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width:      78,
            height:     78,
            background: theme.btnBg,
            cursor:     "pointer",
            boxShadow:  "0 8px 28px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)",
            border:     "none",
          }}
          aria-label={isRunning ? "Pause timer" : status === "paused" ? "Resume timer" : "Start timer"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isRunning ? "pause" : "play"}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isRunning ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.btnFg} aria-hidden="true">
                  <rect x="5" y="4" width="4.5" height="16" rx="2" />
                  <rect x="14.5" y="4" width="4.5" height="16" rx="2" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.btnFg} style={{ marginLeft: 3 }} aria-hidden="true">
                  <polygon points="5,3 20,12 5,21" />
                </svg>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Label */}
      <span
        className="font-bold tracking-widest uppercase"
        style={{
          color:         "rgba(255,255,255,0.7)",
          fontFamily:    "var(--font-nunito)",
          fontSize:      "0.62rem",
          letterSpacing: "0.18em",
        }}
        aria-live="polite"
      >
        {isRunning ? "Pause" : status === "paused" ? "Resume" : "Start"}
      </span>

      {/* Reset button */}
      <AnimatePresence>
        {showReset && (
          <motion.button
            onClick={onReset}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-semibold px-4 py-1.5 rounded-full transition-all hover:opacity-80 active:scale-95"
            style={{
              color:      "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.12)",
              border:     "1.5px solid rgba(255,255,255,0.22)",
              cursor:     "pointer",
              fontFamily: "var(--font-nunito)",
              fontSize:   "0.7rem",
              letterSpacing: "0.04em",
            }}
            aria-label="Reset timer"
          >
            Reset
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
