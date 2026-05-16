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
import { List, Calendar, BarChart2 } from 'lucide-react'
import type { Task, TaskStatus, SessionUser } from '@/types'
import { DashboardStats } from '@/components/DashboardStats'
import { TaskForm } from '@/components/TaskForm'
import { TaskFilters } from '@/components/TaskFilters'
import { TaskCard } from '@/components/TaskCard'
import { ExportModal } from '@/components/ExportModal'
import { StreakBadge } from '@/components/StreakBadge'
import { CalendarView } from '@/components/CalendarView'
import { Analytics } from '@/components/Analytics'

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
    const [loading, setLoading] = useState(true)
    const [showExport, setShowExport] = useState(false)
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

    useEffect(() => {
        let mounted = true
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(({ user }) => {
                if (!user || !mounted) { router.push('/'); return }
                setUser(user)
                fetchTasks().then(() => setLoading(false))

                const channel = supabase
                    .channel(`tasks:${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'tasks',
                            filter: `user_id=eq.${user.id}`,
                        },
                        (payload) => {
                            console.log('Realtime event:', payload)
                            if (mounted) fetchTasks()
                        }
                    )
                    .on(
                        'broadcast',
                        { event: 'refresh' },
                        () => {
                            console.log('Broadcast refresh event received')
                            if (mounted) fetchTasks()
                        }
                    )
                    .subscribe((status) => {
                        console.log('Realtime status:', status)
                    })
                realtimeRef.current = channel
            })
        return () => {
            mounted = false
            realtimeRef.current?.unsubscribe()
            realtimeRef.current = null
        }
    }, [fetchTasks, router])

    const handleAdd = async (data: {
        title: string; status: TaskStatus; deadline: string
        priority: 'LOW' | 'MEDIUM' | 'HIGH'; tags: string[]
    }) => {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        await fetchTasks()
        realtimeRef.current?.send({
            type: 'broadcast',
            event: 'refresh',
            payload: {}
        })
    }

    const handleStatusChange = async (id: string, status: TaskStatus) => {
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })
        await fetchTasks()
        realtimeRef.current?.send({
            type: 'broadcast',
            event: 'refresh',
            payload: {}
        })
    }

    const handleEdit = async (id: string, title: string) => {
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        })
        await fetchTasks()
        realtimeRef.current?.send({
            type: 'broadcast',
            event: 'refresh',
            payload: {}
        })
    }

    const handleDelete = async (id: string) => {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        await fetchTasks()
        realtimeRef.current?.send({
            type: 'broadcast',
            event: 'refresh',
            payload: {}
        })
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
        realtimeRef.current?.send({
            type: 'broadcast',
            event: 'refresh',
            payload: {}
        })
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
    }

    const overdueCount = tasks.filter(isOverdue).length
    const filtered = tasks.filter(t => {
        if (filter === 'ALL') return true
        if (filter === 'OVERDUE') return isOverdue(t)
        return t.status === filter
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-zinc-500 text-sm font-medium animate-pulse">กำลังโหลดข้อมูล...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-900 pb-16 font-sans">
            {/* Header */}
            <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight text-zinc-900">📋 Daily Task Log</span>
                        <span className="text-zinc-500 text-sm bg-zinc-100 px-2 py-0.5 rounded-full">@{user?.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <StreakBadge />
                        <button onClick={() => setShowExport(true)}
                            className="text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                            📥 Export CSV
                        </button>
                        <button onClick={logout}
                            className="text-xs font-medium text-zinc-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors">
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mx-auto px-4 pt-8 space-y-8 transition-all duration-500 ${view === 'LIST' ? 'max-w-3xl' : 'max-w-5xl'}`}>
                <DashboardStats tasks={tasks} />

                {/* View Switcher */}
                <div className="flex justify-center">
                    <div className="inline-flex bg-zinc-200/50 p-1 rounded-2xl border border-zinc-200 shadow-inner">
                        <button
                            onClick={() => setView('LIST')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'LIST' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        >
                            <List className="w-4 h-4" />
                            รายการ
                        </button>
                        <button
                            onClick={() => setView('CALENDAR')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'CALENDAR' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            ปฏิทิน
                        </button>
                        <button
                            onClick={() => setView('ANALYTICS')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'ANALYTICS' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        >
                            <BarChart2 className="w-4 h-4" />
                            สถิติ
                        </button>
                    </div>
                </div>

                {view === 'LIST' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskForm onAdd={handleAdd} />
                        <TaskFilters current={filter} overdueCount={overdueCount} onChange={setFilter} />

                        {/* Task List */}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {filtered.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 bg-white border border-zinc-200 border-dashed rounded-2xl">
                                            <span className="text-4xl mb-3">📭</span>
                                            <div className="text-zinc-400 text-sm font-medium">ไม่มีงานในหมวดหมู่นี้</div>
                                        </div>
                                    )}
                                    {filtered.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onStatusChange={handleStatusChange}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
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
        </main>
    )
}