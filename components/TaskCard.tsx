'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import type { Task, TaskStatus, Subtask } from '@/types'

const STATUS_CONFIG = {
    TODO: { label: 'TODO', color: 'bg-zinc-100 text-zinc-600 border border-zinc-200' },
    DOING: { label: 'DOING', color: 'bg-blue-50 text-blue-600 border border-blue-200' },
    DONE: { label: 'DONE', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
}

const PRIORITY_CONFIG = {
    LOW: { label: 'Low', color: 'text-zinc-500 bg-zinc-100', icon: '▽' },
    MEDIUM: { label: 'Medium', color: 'text-amber-600 bg-amber-50', icon: '◈' },
    HIGH: { label: 'High', color: 'text-red-600 bg-red-50', icon: '▲' },
}

function parseDBDate(dateString: string) {
    if (!dateString.includes('Z') && !dateString.includes('+')) {
        return new Date(dateString.replace(' ', 'T'))
    }
    return new Date(dateString)
}

function isOverdue(task: Task) {
    if (!task.deadline || task.status === 'DONE') return false
    const deadline = parseDBDate(task.deadline)
    return deadline < new Date()
}

function formatDisplayDate(dateString: string) {
    const date = parseDBDate(dateString)
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }) + ' น.'
}

function formatRelativeTime(dateString: string) {
    const now = new Date()
    const date = parseDBDate(dateString)
    const diffMs = now.getTime() - date.getTime()
    const seconds = Math.floor(diffMs / 1000)

    if (seconds < 30) return 'เมื่อสักครู่'
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    if (days === 1) return 'เมื่อวาน'
    if (days < 7) return `${days} วันที่แล้ว`

    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

interface Props {
    task: Task
    onStatusChange: (id: string, status: TaskStatus) => void
    onEdit: (id: string, title: string) => void
    onDelete: (id: string) => void
    onUpdateSubtasks: (id: string, subtasks: Subtask[]) => void
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete, onUpdateSubtasks }: Props) {
    const [editing, setEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(task.title)
    const [showDelete, setShowDelete] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [newSubtask, setNewSubtask] = useState('')

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

    const overdue = isOverdue(task)
    const cfg = STATUS_CONFIG[task.status]
    const subtasks = task.subtasks || []
    const completedSubtasks = subtasks.filter(s => s.completed).length

    const handleSave = () => {
        if (editTitle.trim()) onEdit(task.id, editTitle.trim())
        setEditing(false)
    }

    const toggleSubtask = (subId: string) => {
        const updated = subtasks.map(s => 
            s.id === subId ? { ...s, completed: !s.completed } : s
        )
        onUpdateSubtasks(task.id, updated)
    }

    const addSubtask = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubtask.trim()) return
        const newItem: Subtask = {
            id: crypto.randomUUID(),
            title: newSubtask.trim(),
            completed: false
        }
        onUpdateSubtasks(task.id, [...subtasks, newItem])
        setNewSubtask('')
    }

    const deleteSubtask = (subId: string) => {
        const updated = subtasks.filter(s => s.id !== subId)
        onUpdateSubtasks(task.id, updated)
    }

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
        >
            <div className={`bg-white border rounded-3xl p-5 shadow-sm transition-all hover:shadow-md ${overdue ? 'border-red-300 bg-red-50/50' : 'border-zinc-200'
                }`}>
                <div className="flex items-start gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing pt-0.5 select-none touch-none flex-none transition-colors"
                    >
                        🐾
                    </div>

                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleSave()
                                        if (e.key === 'Escape') setEditing(false)
                                    }}
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                                />
                                <button onClick={handleSave} className="text-xs bg-zinc-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-zinc-800 transition-colors">
                                    บันทึก
                                </button>
                                <button onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:text-zinc-900 px-2 transition-colors">
                                    ยกเลิก
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-base font-semibold ${overdue ? 'text-red-600' : 'text-zinc-900'}`}>
                                    {overdue && '⚠️ '}{task.title}
                                </span>
                                {overdue && <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full">เลยกำหนด!</span>}
                                {subtasks.length > 0 && (
                                    <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-zinc-200">
                                        ✅ {completedSubtasks}/{subtasks.length}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs font-medium text-zinc-500">
                            {task.deadline && (
                                <span>
                                    📅 {formatDisplayDate(task.deadline)}
                                </span>
                            )}
                            <span>🕒 {formatRelativeTime(task.created_at)}</span>
                        </div>

                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {task.tags.map(tag => (
                                    <span key={tag} className="text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-600 px-2.5 py-0.5 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-none">
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className={`p-2 rounded-xl transition-all ${expanded ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                            title={expanded ? 'ปิด Checklist' : 'เปิด Checklist'}
                        >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_CONFIG[task.priority].color}`}>
                            {PRIORITY_CONFIG[task.priority].icon} {PRIORITY_CONFIG[task.priority].label}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {expanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Checklist</div>
                        <div className="space-y-1">
                            {subtasks.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2 group p-1.5 hover:bg-zinc-50 rounded-xl transition-colors">
                                    <button 
                                        onClick={() => toggleSubtask(sub.id)}
                                        className={`flex-none transition-colors ${sub.completed ? 'text-emerald-500' : 'text-zinc-300 hover:text-zinc-400'}`}
                                    >
                                        {sub.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <span className={`flex-1 text-sm transition-all ${sub.completed ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                                        {sub.title}
                                    </span>
                                    <button 
                                        onClick={() => deleteSubtask(sub.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={addSubtask} className="flex gap-2">
                            <div className="relative flex-1">
                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input 
                                    type="text"
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    placeholder="เพิ่มขั้นตอนย่อย..."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={!newSubtask.trim()}
                                className="bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
                            >
                                เพิ่ม
                            </button>
                        </form>
                    </div>
                )}

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100">
                    <select
                        value={task.status}
                        onChange={(e) =>
                            onStatusChange(task.id, e.target.value as TaskStatus)
                        }
                        className="text-xs font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-2 rounded-xl transition-all shadow-sm outline-none cursor-pointer"
                    >
                        <option value="TODO">📌 TODO</option>
                        <option value="DOING">⚡ DOING</option>
                        <option value="DONE">✅ DONE</option>
                    </select>
                    <button onClick={() => { setEditing(true); setEditTitle(task.title) }}
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-2 rounded-xl transition-all shadow-sm">
                        ✏️ แก้ไข
                    </button>
                    <button
                        onClick={() => setShowDelete(true)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 bg-white border border-red-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-all shadow-sm ml-auto"
                    >
                        🗑️ ลบ
                    </button>
                </div>
            </div>

            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl mx-auto mb-4">
                            🗑️
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 text-center">
                            ลบงานนี้?
                        </h3>
                        <p className="text-sm text-zinc-500 text-center mt-2 leading-relaxed">
                            คุณแน่ใจหรือไม่ว่าต้องการลบ
                            <br />
                            <span className="font-medium text-zinc-700">
                                &quot;{task.title}&quot;
                            </span>
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDelete(false)}
                                className="flex-1 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 py-3 rounded-xl text-sm font-medium transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(task.id)
                                    setShowDelete(false)
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm"
                            >
                                ลบเลย
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
