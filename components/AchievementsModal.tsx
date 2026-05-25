'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Target, Zap, Shield, Flame } from 'lucide-react'

interface Badge {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    unlocked: boolean
    color: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    level: number
    xp: number
}

export function AchievementsModal({ isOpen, onClose, level, xp }: Props) {
    const badges: Badge[] = [
        {
            id: 'beginner',
            title: 'เริ่มต้นเส้นทาง',
            description: 'ถึงเลเวล 1',
            icon: <Star className="w-6 h-6" />,
            unlocked: level >= 1,
            color: 'bg-blue-500'
        },
        {
            id: 'focused',
            title: 'ผู้มุ่งมั่น',
            description: 'ถึงเลเวล 5',
            icon: <Target className="w-6 h-6" />,
            unlocked: level >= 5,
            color: 'bg-emerald-500'
        },
        {
            id: 'pro',
            title: 'มืออาชีพ',
            description: 'ถึงเลเวล 10',
            icon: <Zap className="w-6 h-6" />,
            unlocked: level >= 10,
            color: 'bg-amber-500'
        },
        {
            id: 'master',
            title: 'ปรมาจารย์',
            description: 'ถึงเลเวล 20',
            icon: <Shield className="w-6 h-6" />,
            unlocked: level >= 20,
            color: 'bg-purple-500'
        },
        {
            id: 'legend',
            title: 'ตำนาน',
            description: 'ถึงเลเวล 50',
            icon: <Flame className="w-6 h-6" />,
            unlocked: level >= 50,
            color: 'bg-red-500'
        }
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" /> เหรียญตราเกียรติยศ
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors text-2xl">×</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {badges.map((badge) => (
                                    <div 
                                        key={badge.id}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                            badge.unlocked 
                                                ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700' 
                                                : 'bg-zinc-100/30 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800 opacity-40 grayscale'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${badge.unlocked ? badge.color : 'bg-zinc-400'}`}>
                                            {badge.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{badge.title}</div>
                                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{badge.description}</div>
                                        </div>
                                        {badge.unlocked && (
                                            <div className="ml-auto text-emerald-500">
                                                <Shield className="w-4 h-4 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">สถานะปัจจุบัน</div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Level {level}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">{xp} XP ทั้งหมด</div>
                                    <div className="text-xs text-zinc-400">อีก {100 - (xp % 100)} XP เพื่อไปต่อ</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
