'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
    DndContext, closestCenter, DragEndEvent,
    PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { List, Calendar, BarChart2, Search, Timer, LogOut, Download } from 'lucide-react'
import type { Task, TaskStatus, SessionUser, Subtask } from '@/types'
import { DashboardStats } from '@/components/DashboardStats'
import { TaskForm } from '@/components/TaskForm'
import { TaskFilters } from '@/components/TaskFilters'
import { TaskCard } from '@/components/TaskCard'
import { ExportModal } from '@/components/ExportModal'
import { StreakBadge } from '@/components/StreakBadge'
import { LevelBadge } from '@/components/LevelBadge'
import { AchievementsModal } from '@/components/AchievementsModal'
import { CalendarView } from '@/components/CalendarView'
import { Analytics } from '@/components/Analytics'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PomodoroTimer } from '@/components/PomodoroTimer'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { playSuccessSound } from '@/lib/audio'
import Image from 'next/image'

type FilterType = TaskStatus | 'ALL' | 'OVERDUE'
type ViewType = 'LIST' | 'CALENDAR' | 'ANALYTICS'

function isOverdue(task: Task) {
    if (!task.deadline || task.status === 'DONE') return false
    return new Date(task.deadline) < new Date()
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<SessionUser | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [filter, setFilter] = useState<FilterType>('ALL')
    const [view, setView] = useState<ViewType>('LIST')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [showExport, setShowExport] = useState(false)
    const [showTimer, setShowTimer] = useState(false)
    const [showAchievements, setShowAchievements] = useState(false)
    const [combo, setCombo] = useState(0)
    const lastDoneRef = useRef<number>(0)
    const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const fetchTasks = useCallback(async () => {
        const res = await fetch('/api/tasks')
        if (res.status === 401) { router.push('/'); return }
        const data = await res.json()
        setTasks(data.tasks || [])
    }, [router])

    const fetchUser = useCallback(async () => {
        const res = await fetch('/api/auth/me')
        const { user } = await res.json()
        if (user) setUser(user)
        else router.push('/')
    }, [router])

    useEffect(() => {
        let mounted = true
        fetchUser().then(() => {
            if (mounted) fetchTasks().then(() => setLoading(false))
        })

        const channel = supabase
            .channel(`tasks:${user?.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${user?.id}`,
                },
                (payload) => {
                    if (mounted) fetchTasks()
                }
            )
            .subscribe()
        realtimeRef.current = channel

        return () => {
            mounted = false
            realtimeRef.current?.unsubscribe()
        }
    }, [fetchTasks, fetchUser, user?.id])

    const handleAdd = async (data: {
        title: string; description: string; status: TaskStatus; deadline: string
        priority: 'LOW' | 'MEDIUM' | 'HIGH'; tags: string[]
    }) => {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success('เพิ่มงานเรียบร้อยแล้ว ✨')
        } else {
            toast.error('ไม่สามารถเพิ่มงานได้ กรุณาลองใหม่')
        }
        await fetchTasks()
    }

    const handleStatusChange = async (id: string, status: TaskStatus) => {
        const res = await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })
        if (res.ok) {
            if (status === 'DONE') {
                playSuccessSound()
                
                // Combo logic
                const now = Date.now()
                let newCombo = 1
                if (now - lastDoneRef.current < 10 * 60 * 1000) { // 10 minutes window
                    newCombo = combo + 1
                }
                setCombo(newCombo)
                lastDoneRef.current = now

                const comboMsg = newCombo > 1 ? ` (${newCombo}x Combo! 🔥)` : ''
                toast.success(`งานเสร็จสิ้น! +10 XP 🎉${comboMsg}`)
                fetchUser()
            } else {
                toast.info('อัปเดตสถานะแล้ว')
                setCombo(0) // Reset combo if task is undone
            }
        }
        await fetchTasks()
    }

    const handleEdit = async (id: string, title: string, description?: string) => {
        const res = await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description }),
        })
        if (res.ok) toast.success('แก้ไขข้อมูลเรียบร้อย')
        await fetchTasks()
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        if (res.ok) toast.success('ลบงานเรียบร้อยแล้ว')
        await fetchTasks()
    }

    const handleUpdateSubtasks = async (id: string, subtasks: Subtask[]) => {
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtasks }),
        })
        await fetchTasks()
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = tasks.findIndex(t => t.id === active.id)
        const newIndex = tasks.findIndex(t => t.id === over.id)
        const reordered = arrayMove(tasks, oldIndex, newIndex)
        setTasks(reordered)
        await Promise.all(reordered.map((t, i) =>
            fetch(`/api/tasks/${t.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sort_order: i }),
            })
        ))
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
    }

    const overdueCount = tasks.filter(isOverdue).length
    const filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        if (!matchesSearch) return false

        if (filter === 'ALL') return true
        if (filter === 'OVERDUE') return isOverdue(t)
        return t.status === filter
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/40 dark:bg-zinc-950 flex items-center justify-center">
                <div className="text-violet-500 text-sm font-medium animate-pulse">กำลังโหลดข้อมูล...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-16 font-sans selection:bg-violet-600 selection:text-white dark:selection:bg-violet-500 dark:selection:text-white">
            {/* Header */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                            <Image
                                src="/favicon.ico"
                                alt="ExTaskX Logo"
                                width={20}
                                height={20}
                                className="w-9 h-9"
                            />
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-bold">ExTaskX</span>
                            <span className="text-sm text-indigo-600 dark:text-indigo-400 rounded-full bg-indigo-200/40 dark:bg-zinc-800 px-2 py-1">
                                @{user?.username}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden md:flex items-center gap-2 pr-4 border-r border-zinc-200 dark:border-zinc-800 h-8">
                            <div className="cursor-pointer hover:opacity-80 transition-all active:scale-95" onClick={() => setShowAchievements(true)}>
                                <LevelBadge level={user?.level || 1} xp={user?.xp || 0} />
                            </div>
                            <StreakBadge />
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                            <ThemeToggle />
                            <button 
                                onClick={() => setShowTimer(!showTimer)}
                                className={`p-2 rounded-lg transition-all ${showTimer ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                                title="Pomodoro Timer"
                            >
                                <Timer className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowExport(true)}
                                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
                                title="Export CSV"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <button onClick={logout}
                            className="hidden sm:flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-red-500 bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 rounded-xl transition-all border border-zinc-200/50 dark:border-zinc-700/50 hover:border-red-200">
                            <LogOut className="w-3.5 h-3.5" />
                            ออก
                        </button>
                    </div>
                </div>
                
                {/* Mobile Info Bar */}
                <div className="md:hidden px-4 py-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">@{user?.username}</div>
                    <div className="flex items-center gap-2 scale-90 origin-right">
                        <div className="cursor-pointer" onClick={() => setShowAchievements(true)}>
                            <LevelBadge level={user?.level || 1} xp={user?.xp || 0} />
                        </div>
                        <StreakBadge />
                    </div>
                </div>
            </div>

            <div className={`mx-auto px-4 pt-8 space-y-10 transition-all duration-500 ${view === 'LIST' ? 'max-w-3xl' : 'max-w-6xl'}`}>
               
                {showTimer && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4"
                    >
                        <PomodoroTimer />
                    </motion.div>
                )}

                {/* Main Unified Toolbar */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <button
                                onClick={() => setView('LIST')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                    view === 'LIST' ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                <List className="w-4 h-4" />
                                <span>รายการ</span>
                            </button>
                            <button
                                onClick={() => setView('CALENDAR')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                    view === 'CALENDAR' ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                                <span>ปฏิทิน</span>
                            </button>
                            <button
                                onClick={() => setView('ANALYTICS')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                    view === 'ANALYTICS' ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                <BarChart2 className="w-4 h-4" />
                                <span>สถิติ</span>
                            </button>
                        </div>

                        {view === 'LIST' && (
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหางานหรือแท็ก..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300/50 dark:focus:border-violet-500 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                        )}
                    </div>

                    <DashboardStats tasks={tasks} />
                </div>

                {view === 'LIST' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskForm onAdd={handleAdd} />
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-gradient-to-b from-violet-600 to-indigo-500 rounded-full" />
                                    งานของคุณ
                                    <span className="text-sm font-bold text-zinc-400 ml-2">{filtered.length}</span>
                                </h2>
                                <TaskFilters current={filter} overdueCount={overdueCount} onChange={setFilter} />
                            </div>

                            {/* Task List */}
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {filtered.length === 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[2rem]"
                                                >
                                                    <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-4">
                                                        📭
                                                    </div>
                                                    <div className="text-zinc-900 dark:text-zinc-100 font-bold">ไม่พบรายการงาน</div>
                                                    <div className="text-zinc-400 text-sm mt-1">ลองเปลี่ยนฟิลเตอร์หรือเพิ่มงานใหม่</div>
                                                </motion.div>
                                            )}
                                            {filtered.map(task => (
                                                <motion.div
                                                    key={task.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        className="active:cursor-grabbing"
                                                    >
                                                        <TaskCard
                                                            task={task}
                                                            onStatusChange={handleStatusChange}
                                                            onEdit={handleEdit}
                                                            onDelete={handleDelete}
                                                            onUpdateSubtasks={handleUpdateSubtasks}
                                                        />
                                                    </motion.div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                )}

                {view === 'CALENDAR' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CalendarView tasks={tasks} />
                    </div>
                )}

                {view === 'ANALYTICS' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Analytics tasks={tasks} />
                    </div>
                )}
            </div>

            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
            
            <AchievementsModal 
                isOpen={showAchievements} 
                onClose={() => setShowAchievements(false)} 
                level={user?.level || 1}
                xp={user?.xp || 0}
            />
        </main>
    )
}
