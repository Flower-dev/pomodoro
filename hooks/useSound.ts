"use client"

import { useCallback, useRef } from "react"

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const playNotification = useCallback(() => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext()
      }
      const ctx = ctxRef.current

      // Two-tone chime: 880Hz then 660Hz
      const play = (freq: number, startAt: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, startAt)
        gain.gain.setValueAtTime(0, startAt)
        gain.gain.linearRampToValueAtTime(0.4, startAt + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
        osc.start(startAt)
        osc.stop(startAt + duration)
      }

      const now = ctx.currentTime
      play(880, now, 0.3)
      play(660, now + 0.32, 0.4)
    } catch {
      // Web Audio API unavailable — silent no-op
    }
  }, [])

  return { playNotification }
}
