"use client"

import { motion, AnimatePresence } from "motion/react"
import type { TimerStatus } from "@/hooks/usePomodoro"
import type { Phase } from "@/lib/constants"

interface PhaseTheme {
  cardText: string
  cardText2: string
  btnBg: string
  btnFg: string
  trackColor: string
}

interface TimerControlsProps {
  status: TimerStatus
  phase: Phase
  onStart: () => void
  onPause: () => void
  onReset: () => void
  theme: PhaseTheme
}

export function TimerControls({ status, onStart, onPause, onReset, theme }: TimerControlsProps) {
  const isRunning = status === "running"
  const showReset = status !== "idle"

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Large circular play/pause button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse ring when running */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              key="pulse"
              className="absolute rounded-full pointer-events-none"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.35, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              style={{
                width: 72,
                height: 72,
                background: theme.btnBg,
              }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={isRunning ? onPause : onStart}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 72,
            height: 72,
            background: theme.btnBg,
            cursor: "pointer",
            boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
          }}
          aria-label={isRunning ? "Pause" : "Start"}
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
                // Pause icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.btnFg}>
                  <rect x="6" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                // Play icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.btnFg} style={{ marginLeft: 3 }}>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Label */}
      <span
        className="text-sm font-semibold"
        style={{ color: theme.cardText2, fontFamily: "var(--font-nunito)" }}
      >
        {isRunning ? "Pause" : status === "paused" ? "Resume" : "Start"}
      </span>

      {/* Reset — subtle text button */}
      <AnimatePresence>
        {showReset && (
          <motion.button
            onClick={onReset}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium px-3 py-1 rounded-full transition-opacity hover:opacity-70"
            style={{
              color: theme.cardText2,
              background: theme.trackColor,
              cursor: "pointer",
              fontFamily: "var(--font-nunito)",
            }}
          >
            Reset
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
