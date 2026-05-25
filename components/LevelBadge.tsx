'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface Props {
    level: number
    xp: number
}

export function LevelBadge({ level, xp }: Props) {
    const xpInLevel = xp % 100
    const progress = xpInLevel

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 px-3 h-8 rounded-xl shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <div className="flex items-center gap-1.5 border-r border-zinc-100 dark:border-zinc-700/50 pr-3">
                <div className="w-5 h-5 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                    <Trophy className="w-3 h-3" />
                </div>
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-none">Lv.{level}</span>
            </div>
            
            <div className="flex flex-col justify-center gap-0.5 w-12">
                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-amber-500 rounded-full"
                    />
                </div>
            </div>
        </div>
    )
}
