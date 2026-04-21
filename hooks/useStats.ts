"use client"

import { useState, useCallback } from "react"
import {
  getSessions,
  saveSessions,
  clearStoredSessions,
  type Session,
} from "@/lib/storage"

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function computeStats(sessions: Session[]) {
  const today = new Date()

  const todayCount = sessions.filter((s) =>
    isSameDay(new Date(s.startedAt), today)
  ).length

  const totalMinutes = Math.floor(
    sessions.reduce((acc, s) => acc + s.duration, 0) / 60
  )

  // Build set of days with at least one session (YYYY-MM-DD)
  const daySet = new Set<string>()
  for (const s of sessions) {
    const d = new Date(s.startedAt)
    daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
  }

  // Current streak: count consecutive days ending today
  let currentStreak = 0
  const cursor = new Date(today)
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`
    if (!daySet.has(key)) break
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Best streak: scan all days in sorted order
  const sortedDays = Array.from(daySet)
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number)
      return new Date(y, m, d).getTime()
    })
    .sort((a, b) => a - b)

  let bestStreak = 0
  let run = 0
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      run = 1
    } else {
      const diff = (sortedDays[i] - sortedDays[i - 1]) / (1000 * 60 * 60 * 24)
      run = diff === 1 ? run + 1 : 1
    }
    bestStreak = Math.max(bestStreak, run)
  }

  // Last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const count = sessions.filter((s) => isSameDay(new Date(s.startedAt), d)).length
    return {
      date: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      count,
    }
  })

  return { todayCount, totalMinutes, currentStreak, bestStreak, last7Days }
}

export function useStats() {
  const [sessions, setSessions] = useState<Session[]>(() => getSessions())

  const stats = computeStats(sessions)

  const addSession = useCallback((session: Session) => {
    setSessions((prev) => {
      const next = [...prev, session]
      saveSessions(next)
      return next
    })
  }, [])

  const clearSessions = useCallback(() => {
    clearStoredSessions()
    setSessions([])
  }, [])

  return { sessions, ...stats, addSession, clearSessions }
}
