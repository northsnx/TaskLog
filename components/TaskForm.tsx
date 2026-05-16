'use client'
import { useState } from 'react'
import type { TaskStatus } from '@/types'

interface Props {
    onAdd: (data: {
        title: string
        status: TaskStatus
        deadline: string
        priority: 'LOW' | 'MEDIUM' | 'HIGH'
        tags: string[]
    }) => Promise<void>
}

export function TaskForm({ onAdd }: Props) {
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState<TaskStatus>('TODO')
    const [deadline, setDeadline] = useState('')
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [adding, setAdding] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        setAdding(true)
        await onAdd({ title: title.trim(), status, deadline, priority, tags })
        setTitle('')
        setDeadline('')
        setTags([])
        setTagInput('')
        setAdding(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <span className="text-zinc-400">✨</span> เพิ่มงานใหม่
            </h2>

            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ชื่องาน..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                required
            />

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all flex-none cursor-pointer">
                    <option value="TODO">TODO</option>
                    <option value="DOING">DOING</option>
                    <option value="DONE">DONE</option>
                </select>

                <select value={priority} onChange={e => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all flex-none cursor-pointer">
                    <option value="LOW">▽ Low</option>
                    <option value="MEDIUM">◈ Medium</option>
                    <option value="HIGH">▲ High</option>
                </select>

                <input
                    type="datetime-local"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all flex-1"
                />

                <button type="submit" disabled={adding}
                    className="bg-zinc-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 text-sm flex-none shadow-sm w-full sm:w-auto">
                    {adding ? 'กำลังเพิ่ม...' : 'เพิ่มงาน'}
                </button>
            </div>

            <div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map(tag => (
                            <span key={tag} className="text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => setTags(t => t.filter(x => x !== tag))}
                                    className="text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <input
                    type="text"
                    placeholder="เพิ่ม Tag แล้วกด Enter (ไม่บังคับ)"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                            e.preventDefault()
                            setTags(t => [...new Set([...t, tagInput.trim()])])
                            setTagInput('')
                        }
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
            </div>
        </form>
    )
}