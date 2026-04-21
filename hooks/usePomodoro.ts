"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  DURATIONS,
  CYCLES_BEFORE_LONG_BREAK,
  type Phase,
} from "@/lib/constants"
import { useSound } from "@/hooks/useSound"
import { useStats } from "@/hooks/useStats"
import type { Session } from "@/lib/storage"

export type TimerStatus = "idle" | "running" | "paused" | "completed"

export function usePomodoro() {
  const [phase, setPhase] = useState<Phase>("focus")
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [remaining, setRemaining] = useState(DURATIONS.focus)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const startTimestampRef = useRef<number | null>(null)
  const remainingAtPauseRef = useRef<number>(DURATIONS.focus)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { playNotification } = useSound()
  const { addSession, ...statsRest } = useStats()

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const nextPhase = useCallback(
    (currentPhase: Phase, cycles: number): { phase: Phase; cycles: number } => {
      if (currentPhase !== "focus") {
        return { phase: "focus", cycles }
      }
      const newCycles = cycles + 1
      if (newCycles >= CYCLES_BEFORE_LONG_BREAK) {
        return { phase: "long-break", cycles: 0 }
      }
      return { phase: "short-break", cycles: newCycles }
    },
    []
  )

  // Tick logic
  useEffect(() => {
    if (status !== "running") return

    intervalRef.current = setInterval(() => {
      if (startTimestampRef.current === null) return
      const elapsed = (Date.now() - startTimestampRef.current) / 1000
      const newRemaining = remainingAtPauseRef.current - elapsed

      if (newRemaining <= 0) {
        clearTick()
        setRemaining(0)
        setStatus("completed")
      } else {
        setRemaining(newRemaining)
      }
    }, 500)

    return () => clearTick()
  }, [status, clearTick])

  // Handle completed
  useEffect(() => {
    if (status !== "completed") return

    playNotification()

    if (phase === "focus") {
      const session: Session = {
        id: crypto.randomUUID(),
        startedAt: startTimestampRef.current
          ? startTimestampRef.current
          : Date.now() - DURATIONS.focus * 1000,
        duration: DURATIONS.focus,
        phase: "focus",
      }
      addSession(session)
    }

    const timeout = setTimeout(() => {
      setCyclesCompleted((prev) => {
        const { phase: np, cycles: nc } = nextPhase(phase, prev)
        setPhase(np)
        setRemaining(DURATIONS[np])
        remainingAtPauseRef.current = DURATIONS[np]
        startTimestampRef.current = null
        setStatus("idle")
        return nc
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [status, phase, playNotification, addSession, nextPhase])

  const start = useCallback(() => {
    startTimestampRef.current = Date.now()
    setStatus("running")
  }, [])

  const pause = useCallback(() => {
    clearTick()
    remainingAtPauseRef.current = remaining
    setStatus("paused")
  }, [clearTick, remaining])

  const reset = useCallback(() => {
    clearTick()
    startTimestampRef.current = null
    remainingAtPauseRef.current = DURATIONS[phase]
    setRemaining(DURATIONS[phase])
    setStatus("idle")
  }, [clearTick, phase])

  const selectPhase = useCallback(
    (p: Phase) => {
      clearTick()
      startTimestampRef.current = null
      setPhase(p)
      setRemaining(DURATIONS[p])
      remainingAtPauseRef.current = DURATIONS[p]
      setStatus("idle")
    },
    [clearTick]
  )

  return {
    phase,
    status,
    remaining,
    cyclesCompleted,
    start,
    pause,
    reset,
    selectPhase,
    stats: statsRest,
    clearSessions: statsRest.clearSessions,
  }
}
