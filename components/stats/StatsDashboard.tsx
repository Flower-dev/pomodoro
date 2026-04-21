"use client"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatsCard } from "@/components/stats/StatsCard"
import { SessionChart } from "@/components/stats/SessionChart"

interface PhaseTheme {
  cardText: string
  cardText2: string
  accent: string
  trackColor: string
  btnBg: string
  btnFg: string
}

interface StatsDashboardProps {
  todayCount: number
  totalMinutes: number
  currentStreak: number
  bestStreak: number
  last7Days: { date: string; count: number }[]
  accentColor: string
  onClear: () => void
  theme: PhaseTheme
}

function formatMinutes(m: number): { value: string; sub: string } {
  if (m < 60) return { value: String(m), sub: "min" }
  const h = Math.floor(m / 60)
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
        <StatsCard label="Today"       value={todayCount}    sub={todayCount === 1 ? "session" : "sessions"} theme={theme} />
        <StatsCard label="Total"       value={time.value}    sub={time.sub} theme={theme} />
        <StatsCard label="Streak"      value={currentStreak} sub={currentStreak === 1 ? "day" : "days"} theme={theme} />
        <StatsCard label="Best"        value={bestStreak}    sub={bestStreak === 1 ? "day" : "days"} theme={theme} />
      </div>

      <SessionChart data={last7Days} theme={theme} />

      <div className="mt-auto pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="text-xs font-semibold py-2 px-4 rounded-full transition-opacity hover:opacity-70"
              style={{
                color: theme.cardText2,
                background: theme.trackColor,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-nunito)",
              }}
            >
              Clear data
            </button>
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
                Clear all data?
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: "#7a9e87" }}>
                All sessions and statistics will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel style={{
                background: "rgba(61,112,78,0.08)", border: "none",
                color: "#2a4535", borderRadius: "0.75rem",
                fontFamily: "var(--font-nunito)", fontWeight: 600,
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onClear} style={{
                background: "#e05c5c", color: "#fff",
                fontWeight: 700, borderRadius: "0.75rem",
                fontFamily: "var(--font-nunito)",
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
