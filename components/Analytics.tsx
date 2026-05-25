'use client'
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts'
import type { Task } from '@/types'

const COLORS = {
    TODO: '#71717a',    // zinc-500
    DOING: '#2563eb',   // blue-600
    DONE: '#10b981',    // emerald-500
}

function ActivityHeatmap({ tasks }: { tasks: Task[] }) {
    const today = new Date()
    const daysToShow = 90
    const dates = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (daysToShow - 1 - i))
        return d.toISOString().split('T')[0]
    })

    const data = dates.reduce((acc, date) => {
        acc[date] = tasks.filter(t => t.status === 'DONE' && t.updated_at.startsWith(date)).length
        return acc
    }, {} as Record<string, number>)

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800'
        if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/40'
        if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700'
        return 'bg-emerald-600 dark:bg-emerald-500'
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                <span>🔥</span> กิจกรรมย้อนหลัง 90 วัน
            </h3>
            <div className="flex flex-wrap gap-1.5">
                {dates.map(date => (
                    <div 
                        key={date}
                        title={`${date}: ${data[date]} งาน`}
                        className={`w-3 h-3 rounded-sm ${getIntensity(data[date])} transition-colors cursor-help`}
                    />
                ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-medium text-zinc-400">
                <span>น้อย</span>
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
                </div>
                <span>มาก</span>
            </div>
        </div>
    )
}

function getWeeklyData(tasks: Task[]) {
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() - (6 - i))
        return d
    })

    return last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0]
        return {
            day: days[date.getDay()],
            done: tasks.filter(t => t.status === 'DONE' && t.updated_at.startsWith(dateStr)).length,
            added: tasks.filter(t => t.created_at.startsWith(dateStr)).length,
        }
    })
}

function getStatusData(tasks: Task[]) {
    const todo = tasks.filter(t => t.status === 'TODO').length
    const doing = tasks.filter(t => t.status === 'DOING').length
    const done = tasks.filter(t => t.status === 'DONE').length

    return [
        { name: 'TODO', value: todo, color: COLORS.TODO },
        { name: 'DOING', value: doing, color: COLORS.DOING },
        { name: 'DONE', value: done, color: COLORS.DONE },
    ].filter(item => item.value > 0)
}

export function Analytics({ tasks }: { tasks: Task[] }) {
    const weeklyData = getWeeklyData(tasks)
    const statusData = getStatusData(tasks)

    return (
        <div className="space-y-6">
            <ActivityHeatmap tasks={tasks} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <span>📊</span> กิจกรรมในรอบ 7 วัน
                    </h3>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barGap={4}>
                                <XAxis 
                                    dataKey="day" 
                                    tick={{ fill: '#71717a', fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f4f4f5' }}
                                    contentStyle={{ 
                                        background: 'var(--card)', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '12px', 
                                        fontSize: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="added" name="เพิ่ม" fill="#e4e4e7" className="dark:fill-zinc-800" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="done" name="เสร็จ" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-6 text-xs font-medium text-zinc-500 dark:text-zinc-400 justify-center">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 inline-block"/>เพิ่มงาน
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>เสร็จสิ้น
                        </span>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <span>🎯</span> สัดส่วนสถานะงาน
                    </h3>
                    <div className="h-[240px] w-full">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ percent }) => (percent != null ? `${(percent * 100).toFixed(0)}%` : '')}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ 
                                            background: 'var(--card)', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '12px', 
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        align="center"
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-400 text-sm italic">
                                ไม่มีข้อมูลสถานะ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}