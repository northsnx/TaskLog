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
    <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 px-3 h-8 rounded-xl shadow-sm transition-all hover:bg-orange-100/50 dark:hover:bg-orange-500/20">
      <span className="text-sm">🔥</span>
      <span className="text-orange-600 dark:text-orange-500 font-black text-xs leading-none">{streak} Days</span>
    </div>
  )
}