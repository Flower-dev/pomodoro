"use client"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PHASES, type Phase } from "@/lib/constants"
import type { TimerStatus } from "@/hooks/usePomodoro"

interface PhaseTheme {
  cardText:    string
  cardText2:   string
  accent:      string
  accentDim:   string
  trackColor:  string
  btnBg:       string
  btnFg:       string
  borderColor: string
}

interface ModeSelectorProps {
  phase:    Phase
  status:   TimerStatus
  onSelect: (p: Phase) => void
  theme:    PhaseTheme
}

const MODE_SHORT: Record<Phase, string> = {
  focus:         "Focus",
  "short-break": "Short",
  "long-break":  "Long",
}

export function ModeSelector({ phase, status, onSelect, theme }: ModeSelectorProps) {
  const isActive = status === "running"

  const pill = (p: Phase, onClick?: () => void) => {
    const isSelected = p === phase
    return (
      <button
        key={p}
        onClick={!isSelected ? onClick : undefined}
        className="px-4 py-1.5 rounded-full font-bold transition-all select-none active:scale-95"
        style={{
          fontFamily:    "var(--font-nunito)",
          background:    isSelected ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.15)",
          color:         isSelected ? theme.btnFg : "rgba(255,255,255,0.8)",
          cursor:        isSelected ? "default" : "pointer",
          border:        "none",
          fontSize:      "0.75rem",
          letterSpacing: "0.03em",
          boxShadow:     isSelected ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
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
                background:   "#ffffff",
                border:       "none",
                color:        "#1a2a1a",
                borderRadius: "1.5rem",
                boxShadow:    "0 24px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)",
                fontFamily:   "var(--font-nunito)",
              }}>
                <AlertDialogHeader>
                  <AlertDialogTitle style={{
                    fontFamily: "var(--font-nunito)",
                    fontWeight: 800,
                    color:      "#1a2a1a",
                    fontSize:   "1.1rem",
                  }}>
                    Switch mode?
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{
                    color:    "#6a8070",
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-nunito)",
                  }}>
                    Your current session won&apos;t be saved to your stats.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{
                    background:   "#f4f4f2",
                    border:       "none",
                    color:        "#1a2a1a",
                    borderRadius: "0.875rem",
                    fontFamily:   "var(--font-nunito)",
                    fontWeight:   700,
                  }}>
                    Keep going
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onSelect(p)}
                    style={{
                      background:   theme.btnFg,
                      color:        "#ffffff",
                      fontWeight:   800,
                      borderRadius: "0.875rem",
                      fontFamily:   "var(--font-nunito)",
                      border:       "none",
                    }}
                  >
                    Switch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
        return (
          <div key={p}>
            {pill(p, () => onSelect(p))}
          </div>
        )
      })}
    </div>
  )
}
