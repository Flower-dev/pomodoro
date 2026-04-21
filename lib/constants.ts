export const DURATIONS = {
  focus: 25 * 60,        // 1500s
  "short-break": 5 * 60, // 300s
  "long-break": 15 * 60, // 900s
} as const

export const PHASES = ["focus", "short-break", "long-break"] as const
export type Phase = (typeof PHASES)[number]

export const PHASE_LABELS: Record<Phase, string> = {
  focus: "Focus",
  "short-break": "Pause courte",
  "long-break": "Pause longue",
}

export const PHASE_COLORS: Record<Phase, string> = {
  focus: "#6366f1",        // indigo
  "short-break": "#10b981", // emerald
  "long-break": "#a78bfa",  // violet
}

export const CYCLES_BEFORE_LONG_BREAK = 4
export const STORAGE_KEY = "pomo_sessions"
