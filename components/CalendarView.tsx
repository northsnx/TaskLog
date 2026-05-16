'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@/types'

interface Props {
    tasks: Task[]
}

export function CalendarView({ tasks }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDayOfMonth.getDate()
    const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => null)

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const monthName = currentDate.toLocaleString('th-TH', { month: 'long' })
    const thaiYear = year + 543

    const getTasksForDay = (day: number) => {
        return tasks.filter(task => {
            if (!task.deadline) return false
            const d = new Date(task.deadline)
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
        })
    }

    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

    return (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <span>📅</span> {monthName} {thaiYear}
                </h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200 shadow-sm">
                        <ChevronLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200 shadow-sm">
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden">
                {dayNames.map(d => (
                    <div key={d} className="bg-zinc-50 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
                
                {paddingDays.map((_, i) => (
                    <div key={`padding-${i}`} className="bg-zinc-50 h-32" />
                ))}

                {days.map(day => {
                    const dayTasks = getTasksForDay(day)
                    const isToday = new Date().getDate() === day && 
                                   new Date().getMonth() === month && 
                                   new Date().getFullYear() === year

                    return (
                        <div key={day} className="bg-white h-32 p-2 group hover:bg-zinc-50 transition-colors relative">
                            <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full ${
                                isToday ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 group-hover:text-zinc-900'
                            }`}>
                                {day}
                            </span>
                            
                            <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                                {dayTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className={`text-[10px] px-2 py-1 rounded-md truncate font-medium border ${
                                            task.status === 'DONE' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                        }`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}