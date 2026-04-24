"use client"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatsCard } from "@/components/stats/StatsCard"
import { SessionChart } from "@/components/stats/SessionChart"

interface PhaseTheme {
  cardText:    string
  cardText2:   string
  accent:      string
  accentDim?:  string
  trackColor:  string
  borderColor: string
  btnBg:       string
  btnFg:       string
}

interface StatsDashboardProps {
  todayCount:     number
  totalMinutes:   number
  currentStreak:  number
  bestStreak:     number
  last7Days:      { date: string; count: number }[]
  accentColor:    string
  onClear:        () => void
  theme:          PhaseTheme
}

function formatMinutes(m: number): { value: string; sub: string } {
  if (m < 60) return { value: String(m), sub: "min" }
  const h   = Math.floor(m / 60)
  const rem = m % 60
  return { value: `${h}h`, sub: rem > 0 ? `${rem}m` : "" }
}

export function StatsDashboard({
  todayCount, totalMinutes, currentStreak, bestStreak,
  last7Days, onClear, theme,
}: StatsDashboardProps) {
  const time = formatMinutes(totalMinutes)

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      <div className="grid grid-cols-2 gap-2">
        <StatsCard label="Today"  value={todayCount}    sub={todayCount === 1 ? "session" : "sessions"} theme={theme} />
        <StatsCard label="Total"  value={time.value}    sub={time.sub}                                  theme={theme} />
        <StatsCard label="Streak" value={currentStreak} sub={currentStreak === 1 ? "day" : "days"}      theme={theme} />
        <StatsCard label="Best"   value={bestStreak}    sub={bestStreak === 1 ? "day" : "days"}         theme={theme} />
      </div>

      <SessionChart data={last7Days} theme={theme} />

      <div className="mt-auto pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="font-bold py-2 px-4 rounded-full transition-all hover:opacity-80 active:scale-95"
              style={{
                color:      "rgba(255,255,255,0.65)",
                background: "rgba(255,255,255,0.12)",
                border:     "1.5px solid rgba(255,255,255,0.2)",
                cursor:     "pointer",
                fontFamily: "var(--font-nunito)",
                fontSize:   "0.72rem",
                letterSpacing: "0.04em",
              }}
            >
              Clear data
            </button>
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
                Clear all data?
              </AlertDialogTitle>
              <AlertDialogDescription style={{
                color:    "#6a8070",
                fontFamily: "var(--font-nunito)",
              }}>
                All sessions and statistics will be permanently deleted.
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
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onClear} style={{
                background:   "hsl(0 70% 55%)",
                color:        "#ffffff",
                fontWeight:   800,
                borderRadius: "0.875rem",
                fontFamily:   "var(--font-nunito)",
                border:       "none",
              }}>
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
