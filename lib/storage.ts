import { STORAGE_KEY } from "@/lib/constants"

export type Session = {
  id: string
  startedAt: number
  duration: number
  phase: "focus"
}

let memoryFallback: Session[] = []

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Session[]
  } catch {
    return memoryFallback
  }
}

export function saveSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    memoryFallback = sessions
  }
}

export function clearStoredSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  memoryFallback = []
}
