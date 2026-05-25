'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    GripVertical,
    Edit3,
    Calendar,
    Clock,
    ChevronDown,
    ListTodo,
    Flame,
    Minus,
    ArrowUp,
} from 'lucide-react'

import type { Task, TaskStatus, Subtask } from '@/types'
import { cn } from '@/lib/utils'

// ── Priority ──────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
    LOW: {
        label: 'Low',
        pill: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        icon: Minus,
    },
    MEDIUM: {
        label: 'Medium',
        pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        icon: ArrowUp,
    },
    HIGH: {
        label: 'High',
        pill: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        icon: Flame,
    },
}

// ── Status ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    TODO: {
        label: 'To Do',
        pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        left: 'bg-slate-400',
    },
    DOING: {
        label: 'In Progress',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        left: 'bg-blue-500',
    },
    DONE: {
        label: 'Done',
        pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        left: 'bg-emerald-500',
    },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseDBDate(d: string) {
    return new Date(
        d.includes('Z') || d.includes('+') ? d : d.replace(' ', 'T')
    )
}

function isOverdue(task: Task) {
    if (!task.deadline || task.status === 'DONE') return false
    return parseDBDate(task.deadline) < new Date()
}

function fmtDate(d: string) {
    return parseDBDate(d).toLocaleString('th-TH', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function fmtRel(d: string) {
    const s = Math.floor((Date.now() - parseDBDate(d).getTime()) / 1000)

    if (s < 60) return 'เมื่อกี้'

    const m = Math.floor(s / 60)
    if (m < 60) return `${m} นาที`

    const h = Math.floor(m / 60)
    if (h < 24) return `${h} ชั่วโมง`

    const day = Math.floor(h / 24)
    if (day < 7) return `${day} วัน`

    return parseDBDate(d).toLocaleDateString('th-TH', {
        month: 'short',
        day: 'numeric',
    })
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    task: Task
    onStatusChange: (id: string, status: TaskStatus) => void
    onEdit: (id: string, title: string, description?: string) => void
    onDelete: (id: string) => void
    onUpdateSubtasks: (id: string, subtasks: Subtask[]) => void
}

// ─────────────────────────────────────────────────────────────────────────────
export function TaskCard({
    task,
    onStatusChange,
    onEdit,
    onDelete,
    onUpdateSubtasks,
}: Props) {
    const [editing, setEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(task.title)
    const [editDescription, setEditDescription] = useState(task.description || '')
    const [showDelete, setShowDelete] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [newSubtask, setNewSubtask] = useState('')

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const overdue = isOverdue(task)
    const subtasks = task.subtasks || []

    const done = subtasks.filter((s) => s.completed).length

    const progress =
        subtasks.length > 0 ? (done / subtasks.length) * 100 : 0

    const isDone = task.status === 'DONE'
    const isDoing = task.status === 'DOING'

    const PIcon = PRIORITY_CONFIG[task.priority].icon
    const statusCfg = STATUS_CONFIG[task.status]
    const priorityCfg = PRIORITY_CONFIG[task.priority]

    const handleSave = () => {
        if (editTitle.trim()) {
            onEdit(task.id, editTitle.trim(), editDescription.trim())
        }

        setEditing(false)
    }

    const addSubtask = (e: React.FormEvent) => {
        e.preventDefault()

        if (!newSubtask.trim()) return

        onUpdateSubtasks(task.id, [
            ...subtasks,
            {
                id: crypto.randomUUID(),
                title: newSubtask.trim(),
                completed: false,
            },
        ])

        setNewSubtask('')
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.45 : 1,
            }}
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-3xl border',
                    'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl',
                    'transition-all duration-300',
                    'hover:-translate-y-1 hover:shadow-2xl',
                    'shadow-sm',
                    overdue && !isDone
                        ? 'border-rose-200 dark:border-rose-800/60'
                        : 'border-zinc-200 dark:border-zinc-800',
                    isDone && 'opacity-75'
                )}
            >
                {/* Left stripe */}
                <div
                    className={cn(
                        'absolute left-0 inset-y-0 w-1',
                        statusCfg.left
                    )}
                />

                {/* Progress */}
                {subtasks.length > 0 && (
                    <div className="mx-6 mt-4 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6 }}
                            className={cn(
                                'h-full rounded-full',
                                isDone
                                    ? 'bg-emerald-500'
                                    : isDoing
                                        ? 'bg-blue-500'
                                        : 'bg-zinc-500'
                            )}
                        />
                    </div>
                )}

                <div className="px-6 py-5 md:px-6 md:py-4">
                    {/* ── Top ───────────────────────────────────────── */}
                    <div className="flex items-start gap-4">

                        {/* Checkbox */}
                        <button
                            onClick={() =>
                                onStatusChange(task.id, isDone ? 'TODO' : 'DONE')
                            }
                            className={cn(
                                'mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition-all active:scale-90',
                                isDone
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400'
                            )}
                        >
                            {isDone && <CheckCircle2 className="h-5 w-5" />}
                        </button>

                                <div className="min-w-0 flex-1">
                            {editing ? (
                                <div className="flex flex-col gap-3">
                                    <input
                                        autoFocus
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="ชื่อหัวข้อ..."
                                        className="w-full border-b border-zinc-900 bg-transparent pb-1 text-lg font-bold text-zinc-900 outline-none dark:border-zinc-100 dark:text-zinc-100"
                                    />

                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="รายละเอียด..."
                                        className="w-full min-h-[80px] bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 resize-none"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={() => setEditing(false)}
                                            className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p
                                        className={cn(
                                            'text-lg font-bold leading-relaxed tracking-tight md:text-xl',
                                            isDone
                                                ? 'text-zinc-400 line-through'
                                                : 'text-zinc-800 dark:text-zinc-100',
                                            overdue &&
                                            !isDone &&
                                            'text-rose-600 dark:text-rose-400'
                                        )}
                                    >
                                        {task.title}
                                    </p>
                                    
                                    {task.description && (
                                        <p className={cn(
                                            "text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2",
                                            isDone && "line-through opacity-60"
                                        )}>
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right badges */}
                        {!editing && (
                            <div className="ml-2 flex flex-none items-center gap-2">

                                {/* Priority */}
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm md:text-sm',
                                        priorityCfg.pill
                                    )}
                                >
                                    <PIcon className="h-3.5 w-3.5" />
                                    {priorityCfg.label}
                                </span>

                                {/* Status */}
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm md:text-sm',
                                        statusCfg.pill
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            statusCfg.left
                                        )}
                                    />
                                    {statusCfg.label}
                                </span>

                                {/* Overdue */}
                                {overdue && !isDone && (
                                    <span className="inline-flex items-center rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm md:text-sm">
                                        ⚠️เกินเวลา
                                    </span>
                                )}

                                {/* Drag */}
                                <div
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab rounded-xl p-2 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-zinc-800"
                                >
                                    <GripVertical className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Meta ─────────────────────────────────────── */}
                    <div className=" flex flex-wrap items-center gap-4 pl-11 text-sm text-zinc-500 dark:text-zinc-400">
                        {task.deadline && (
                            <span
                                className={cn(
                                    'flex items-center gap-1.5',
                                    overdue && !isDone && 'text-rose-500'
                                )}
                            >
                                <Calendar className="h-4 w-4" />
                                {fmtDate(task.deadline)}
                            </span>
                        )}

                        {subtasks.length > 0 && (
                            <span className="flex items-center gap-1.5">
                                <ListTodo className="h-4 w-4" />
                                {done}/{subtasks.length}
                            </span>
                        )}

                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {fmtRel(task.created_at)}
                        </span>
                    </div>

                    {/* ── Tags ─────────────────────────────────────── */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 pl-11">
                            {task.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-300"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ── Expanded ─────────────────────────────────── */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-5 space-y-2 border-t border-zinc-100 pt-5 pl-11 dark:border-zinc-800">
                                    {/* Subtasks */}
                                    {subtasks.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="group/sub flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                                        >
                                            <button
                                                onClick={() => {
                                                    const updated = subtasks.map((s) =>
                                                        s.id === sub.id
                                                            ? {
                                                                ...s,
                                                                completed: !s.completed,
                                                            }
                                                            : s
                                                    )

                                                    onUpdateSubtasks(task.id, updated)
                                                }}
                                                className={cn(
                                                    'flex-none transition-colors',
                                                    sub.completed
                                                        ? 'text-emerald-500'
                                                        : 'text-zinc-300 dark:text-zinc-600'
                                                )}
                                            >
                                                {sub.completed ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    <Circle className="h-5 w-5" />
                                                )}
                                            </button>

                                            <span
                                                className={cn(
                                                    'flex-1 text-sm leading-relaxed md:text-base',
                                                    sub.completed
                                                        ? 'text-zinc-400 line-through'
                                                        : 'text-zinc-700 dark:text-zinc-200'
                                                )}
                                            >
                                                {sub.title}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    onUpdateSubtasks(
                                                        task.id,
                                                        subtasks.filter((s) => s.id !== sub.id)
                                                    )
                                                }
                                                className="opacity-0 transition-all group-hover/sub:opacity-100 text-zinc-300 hover:text-rose-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add subtask */}
                                    <form
                                        onSubmit={addSubtask}
                                        className="flex gap-3 pt-2"
                                    >
                                        <input
                                            value={newSubtask}
                                            onChange={(e) =>
                                                setNewSubtask(e.target.value)
                                            }
                                            placeholder="เพิ่มรายละเอียด..."
                                            className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-600 md:text-base"
                                        />

                                        <button
                                            type="submit"
                                            disabled={!newSubtask.trim()}
                                            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
                                        >
                                            เพิ่ม
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Bottom ───────────────────────────────────── */}
                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status */}
                            <select
                                value={task.status}
                                onChange={(e) =>
                                    onStatusChange(
                                        task.id,
                                        e.target.value as TaskStatus
                                    )
                                }
                                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all cursor-pointer appearance-none"
                            >
                                <option value="TODO">📌 TODO</option>
                            <option value="DOING">⚡ DOING</option>
                            <option value="DONE">✅ DONE</option>
                            </select>

                            {/* Edit */}
                            <button
                                onClick={() => {
                                    setEditing(true)
                                    setEditTitle(task.title)
                                    setEditDescription(task.description || '')
                                }}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                <Edit3 className="h-4 w-4" />
                                แก้ไข
                            </button>

                            {/* Subtasks */}
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                {subtasks.length > 0 ? (
                                    <>
                                        <ListTodo className="h-4 w-4" />
                                        {Math.round(progress)}%
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        เพิ่มรายการ
                                    </>
                                )}

                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        expanded && 'rotate-180'
                                    )}
                                />
                            </button>
                        </div>

                        {/* Delete */}
                        <button
                            onClick={() => setShowDelete(true)}
                            className="rounded-xl p-2 text-zinc-300 transition-all hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Delete Modal ───────────────────────────────── */}
            <AnimatePresence>
                {showDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-7 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                ลบงานนี้?
                            </p>

                            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                                &quot;{task.title}&quot;
                                จะถูกลบออกจากรายการอย่างถาวร
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowDelete(false)}
                                    className="flex-1 rounded-2xl py-3 text-sm font-bold text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    onClick={() => {
                                        onDelete(task.id)
                                        setShowDelete(false)
                                    }}
                                    className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600"
                                >
                                    ยืนยันลบ
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}