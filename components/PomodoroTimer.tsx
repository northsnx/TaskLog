'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain, Music2, Settings2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { playStartSound, playSuccessSound } from '@/lib/audio'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer } from 'lucide-react'

type TimerMode = 'FOCUS' | 'BREAK'

export function PomodoroTimer() {
    const [mode, setMode] = useState<TimerMode>('FOCUS')
    const [focusDuration, setFocusDuration] = useState(25)
    const [breakDuration, setBreakDuration] = useState(5)
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [ambience, setAmbience] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Sync timeLeft when durations change and timer is NOT active
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60)
        }
    }, [focusDuration, breakDuration, mode, isActive])

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            handleComplete()
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isActive, timeLeft])

    const handleComplete = () => {
        setIsActive(false)
        if (timerRef.current) clearInterval(timerRef.current)
        playSuccessSound()
        
        const nextMode = mode === 'FOCUS' ? 'BREAK' : 'FOCUS'
        setMode(nextMode)
        setTimeLeft(nextMode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60)
        
        toast.success(mode === 'FOCUS' ? 'ได้เวลาพักแล้ว! ☕' : 'กลับไปลุยงานกันต่อ! 🚀', {
            description: mode === 'FOCUS' ? 'คุณเก่งมากที่โฟกัสจนจบเซสชั่น' : 'สู้ๆ นะครับ',
        })
    }

    const toggleTimer = () => {
        if (!isActive) playStartSound()
        setIsActive(!isActive)
    }

    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60)
    }

    const switchMode = (newMode: TimerMode) => {
        setIsActive(false)
        setMode(newMode)
        setTimeLeft(newMode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none">
                        <Timer className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none">Focus Timer</h3>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{mode}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setAmbience(!ambience)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all border",
                            ambience 
                                ? "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:text-zinc-100"
                        )}
                        title="Ambient Sound"
                    >
                        <Music2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all border",
                            isSettingsOpen 
                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900" 
                                : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:text-zinc-100"
                        )}
                        title="Settings"
                    >
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    {!isSettingsOpen ? (
                        <motion.div 
                            key="timer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl mb-8">
                                <button
                                    onClick={() => switchMode('FOCUS')}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        mode === 'FOCUS' 
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                >
                                    Focus
                                </button>
                                <button
                                    onClick={() => switchMode('BREAK')}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        mode === 'BREAK' 
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                >
                                    Break
                                </button>
                            </div>

                            <div className="text-center mb-10">
                                <div className="text-7xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 tabular-nums">
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    {mode === 'FOCUS' ? <Brain className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                                    {mode === 'FOCUS' ? 'Time to Focus' : 'Short Break'}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleTimer}
                                    className={cn(
                                        "flex items-center gap-3 px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
                                        isActive 
                                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-none" 
                                            : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-zinc-200 dark:shadow-none"
                                    )}
                                >
                                    {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                    {isActive ? 'Pause' : 'Start'}
                                </button>
                                <button
                                    onClick={resetTimer}
                                    className="p-4 rounded-[1.5rem] bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:text-zinc-100 transition-all active:scale-95"
                                    title="Reset"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-6 py-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Focus (Min)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="60"
                                        value={focusDuration}
                                        onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Break (Min)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="30"
                                        value={breakDuration}
                                        onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
                            >
                                <Check className="w-4 h-4" />
                                บันทึกการตั้งค่า
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ambience && (
                <div className="hidden">
                    <audio loop autoPlay src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
                </div>
            )}
        </div>
    )
}
