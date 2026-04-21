"use client"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PHASES, type Phase } from "@/lib/constants"
import type { TimerStatus } from "@/hooks/usePomodoro"

interface PhaseTheme {
  cardText: string
  cardText2: string
  accent: string
  trackColor: string
  btnBg: string
}

interface ModeSelectorProps {
  phase: Phase
  status: TimerStatus
  onSelect: (p: Phase) => void
  theme: PhaseTheme
}

const MODE_SHORT: Record<Phase, string> = {
  focus: "Work",
  "short-break": "Short",
  "long-break": "Long",
}

export function ModeSelector({ phase, status, onSelect, theme }: ModeSelectorProps) {
  const isActive = status === "running"

  const pill = (p: Phase) => {
    const isSelected = p === phase
    return (
      <button
        key={p}
        className="px-3 py-1 rounded-full text-xs font-semibold transition-all select-none"
        style={{
          fontFamily: "var(--font-nunito)",
          background: isSelected ? theme.btnBg : theme.trackColor,
          color: isSelected ? (theme.btnBg === "#ffffff" ? "#3d704e" : "#ffffff") : theme.cardText2,
          cursor: isSelected ? "default" : "pointer",
          border: "none",
          opacity: isSelected ? 1 : 0.75,
        }}
        aria-pressed={isSelected}
      >
        {MODE_SHORT[p]}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {PHASES.map((p) => {
        if (isActive && p !== phase) {
          return (
            <AlertDialog key={p}>
              <AlertDialogTrigger asChild>
                <div>{pill(p)}</div>
              </AlertDialogTrigger>
              <AlertDialogContent style={{
                background: "#ffffff",
                border: "none",
                color: "#2a4535",
                borderRadius: "1.5rem",
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                fontFamily: "var(--font-nunito)",
              }}>
                <AlertDialogHeader>
                  <AlertDialogTitle style={{ fontFamily: "var(--font-nunito)", fontWeight: 700 }}>
                    Switch mode?
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{ color: "#7a9e87", fontSize: "0.875rem" }}>
                    Your current session won&apos;t be saved to your stats.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{
                    background: "rgba(61,112,78,0.08)",
                    border: "none",
                    color: "#2a4535",
                    borderRadius: "0.75rem",
                    fontFamily: "var(--font-nunito)",
                    fontWeight: 600,
                  }}>
                    Keep going
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => onSelect(p)} style={{
                    background: "#3d704e",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "0.75rem",
                    fontFamily: "var(--font-nunito)",
                  }}>
                    Switch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
        return <div key={p}>{pill(p)}</div>
      })}
    </div>
  )
}
