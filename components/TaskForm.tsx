'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

import type { TaskStatus } from '@/types'

interface Props {
  onAdd: (data: {
    title: string
    description: string
    status: TaskStatus
    deadline: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    tags: string[]
  }) => Promise<void>
}

export function TaskForm({ onAdd }: Props) {
  const [expanded, setExpanded] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH'
  >('MEDIUM')

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [adding, setAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    setAdding(true)

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        status,
        deadline,
        priority,
        tags,
      })

      setTitle('')
      setDescription('')
      setDeadline('')
      setTags([])
      setTagInput('')

      // close after add
      setExpanded(false)
    } finally {
      setAdding(false)
    }
  }

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


  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white/90 shadow-sm backdrop-blur-xl transition-all dark:border-zinc-800 dark:bg-zinc-900/90">

      {/* ── Compact Header ───────────────────────── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-[2rem]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Plus className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              เพิ่มงานใหม่
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              กดเพื่อสร้าง Task ใหม่
            </p>
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ── Expand Form ─────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.25,
            }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-6 pb-6 pt-2"
            >
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="วันนี้คุณต้องการทำอะไร?"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-base font-bold text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
                required
              />

              {/* Description */}
              <div className="space-y-2">
                <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ใส่รายละเอียดเพิ่มเติมที่นี่..."
                  className="w-full min-h-[100px] rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm font-medium text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 resize-none"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* Status */}
                <div className="space-y-2">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  สถานะ
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as TaskStatus
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 transition-all focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
                  >
                    <option value="TODO">
                      📌 TODO
                    </option>

                    <option value="DOING">
                      ⚡ DOING
                    </option>

                    <option value="DONE">
                      ✅ DONE
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                    ความสำคัญ
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value as
                          | 'LOW'
                          | 'MEDIUM'
                          | 'HIGH'
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 transition-all focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
                  >
                    <option value="LOW">
                      ▽ Low
                    </option>

                    <option value="MEDIUM">
                      ◈ Medium
                    </option>

                    <option value="HIGH">
                      ▲ High
                    </option>
                  </select>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                    กำหนดส่ง
                  </label>

                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(e.target.value)
                    }
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 transition-all focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Tags
                </label>

                <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">

                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-black uppercase text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      #{tag}

                      <button
                        type="button"
                        onClick={() =>
                          setTags((t) =>
                            t.filter(
                              (x) => x !== tag
                            )
                          )
                        }
                        className="opacity-60 transition hover:opacity-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    placeholder="เพิ่มแท็ก..."
                    value={tagInput}
                    onChange={(e) =>
                      setTagInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        tagInput.trim()
                      ) {
                        e.preventDefault()

                        setTags((t) => [
                          ...new Set([
                            ...t,
                            tagInput.trim(),
                          ]),
                        ])

                        setTagInput('')
                      }
                    }}
                    className="min-w-[120px] flex-1 bg-transparent text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={adding}
                className="w-full rounded-2xl bg-zinc-900 py-4 text-base font-black text-white shadow-xl shadow-zinc-200 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
              >
                {adding
                  ? 'กำลังสร้างงาน...'
                  : 'สร้างงานใหม่'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}