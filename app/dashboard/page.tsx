'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus, SessionUser } from '@/types'

const STATUS_CONFIG = {
  TODO: { label: 'TODO', color: 'bg-zinc-700 text-zinc-200', dot: 'bg-zinc-400' },
  DOING: { label: 'DOING', color: 'bg-blue-900/60 text-blue-300', dot: 'bg-blue-400' },
  DONE: { label: 'DONE', color: 'bg-green-900/60 text-green-300', dot: 'bg-green-400' },
}

function isOverdue(task: Task) {
  if (!task.deadline || task.status === 'DONE') return false
  return new Date(task.deadline) < new Date(new Date().toDateString())
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<TaskStatus | 'ALL' | 'OVERDUE'>('ALL')
  const [loading, setLoading] = useState(true)

  // Add task form
  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<TaskStatus>('TODO')
  const [newDeadline, setNewDeadline] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Export modal
  const [showExport, setShowExport] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>('ALL')
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')

  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setTasks(data.tasks || [])
  }, [router])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => {
        if (!user) { router.push('/'); return }
        setUser(user)
        fetchTasks().then(() => setLoading(false))

        // Realtime subscription
        const channel = supabase
          .channel(`tasks:${user.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${user.id}`,
          }, () => fetchTasks())
          .subscribe()
        realtimeRef.current = channel
      })

    return () => {
      realtimeRef.current?.unsubscribe()
    }
  }, [fetchTasks, router])

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), status: newStatus, deadline: newDeadline }),
    })
    setNewTitle('')
    setNewDeadline('')
    setAdding(false)
  }

  const updateStatus = async (id: string, status: TaskStatus) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim() }),
    })
    setEditingId(null)
  }

  const deleteTask = async (id: string) => {
    if (!confirm('ลบงานนี้?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (exportStatus !== 'ALL') params.set('status', exportStatus)
    if (exportFrom) params.set('from', exportFrom)
    if (exportTo) params.set('to', exportTo)
    window.location.href = `/api/tasks/export?${params}`
    setShowExport(false)
  }

  // Stats
  const todo = tasks.filter(t => t.status === 'TODO').length
  const doing = tasks.filter(t => t.status === 'DOING').length
  const done = tasks.filter(t => t.status === 'DONE').length
  const overdue = tasks.filter(isOverdue).length
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  // Filtered tasks
  const filtered = tasks.filter(t => {
    if (filter === 'ALL') return true
    if (filter === 'OVERDUE') return isOverdue(t)
    return t.status === filter
  })

  const nextStatus: Record<TaskStatus, TaskStatus> = { TODO: 'DOING', DOING: 'DONE', DONE: 'TODO' }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">📋 Task Log</span>
            <span className="text-zinc-500 text-sm">/ {user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowExport(true)} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors">
              📥 Export CSV
            </button>
            <button onClick={logout} className="text-xs text-zinc-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">

        {/* Dashboard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'TODO', value: todo, color: 'text-zinc-300' },
              { label: 'DOING', value: doing, color: 'text-blue-400' },
              { label: 'DONE', value: done, color: 'text-green-400' },
              { label: 'ทั้งหมด', value: tasks.length, color: 'text-white' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>ความคืบหน้า</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">+ เพิ่มงานใหม่</h2>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="ชื่องาน..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            required
          />
          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as TaskStatus)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 flex-none"
            >
              <option value="TODO">TODO</option>
              <option value="DOING">DOING</option>
              <option value="DONE">DONE</option>
            </select>
            <input
              type="date"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 flex-1"
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-white text-zinc-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm flex-none"
            >
              {adding ? '...' : 'เพิ่ม'}
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'TODO', 'DOING', 'DONE', 'OVERDUE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              } ${f === 'OVERDUE' && overdue > 0 ? 'ring-1 ring-red-500' : ''}`}
            >
              {f === 'OVERDUE' ? `⚠️ สายแล้ว (${overdue})` : f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-zinc-600 py-12 text-sm">ไม่มีงานในหมวดนี้</div>
          )}
          {filtered.map(task => {
            const overdue = isOverdue(task)
            const cfg = STATUS_CONFIG[task.status]
            return (
              <div
                key={task.id}
                className={`bg-zinc-900 border rounded-2xl p-4 transition-all ${
                  overdue ? 'border-red-900/60 bg-red-950/10' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(task.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none"
                        />
                        <button onClick={() => saveEdit(task.id)} className="text-xs bg-white text-zinc-900 px-3 py-1 rounded-lg font-medium">บันทึก</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-zinc-500 px-2">ยกเลิก</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${overdue ? 'text-red-300' : 'text-white'}`}>
                          {overdue && '⚠️ '}{task.title}
                        </span>
                        {overdue && <span className="text-xs text-red-500">เลย deadline แล้ว!</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                      {task.deadline && (
                        <span className={overdue ? 'text-red-500' : ''}>
                          📅 {task.deadline}
                        </span>
                      )}
                      <span>เพิ่มเมื่อ {task.created_at.split('T')[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/60">
                  <button
                    onClick={() => updateStatus(task.id, nextStatus[task.status])}
                    className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    → {nextStatus[task.status]}
                  </button>
                  <button
                    onClick={() => { setEditingId(task.id); setEditTitle(task.title) }}
                    className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs text-red-500 hover:text-red-400 bg-zinc-800 hover:bg-red-950/40 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-white">📥 Export CSV</h3>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">สถานะ</label>
              <select
                value={exportStatus}
                onChange={e => setExportStatus(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="TODO">TODO</option>
                <option value="DOING">DOING</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Deadline จาก</label>
                <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Deadline ถึง</label>
                <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowExport(false)} className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleExport} className="flex-1 bg-white text-zinc-900 font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-100 transition-colors">
                ดาวน์โหลด
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}