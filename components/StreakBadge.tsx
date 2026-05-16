'use client'
import { useEffect, useState } from 'react'

export function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/streak')
      .then(r => r.json())
      .then(d => setStreak(d.streak))
  }, [])

  if (streak === null) return null

  return (
    <div className="flex items-center gap-1.5 bg-orange-400/40 border border-orange-900/50 px-3 py-1.5 rounded-full">
      <span className="text-lg">🔥</span>
      <span className="text-orange-600 font-bold text-sm">{streak}</span>
      <span className="text-orange-600 text-xs">วันต่อเนื่อง</span>
    </div>
  )
}