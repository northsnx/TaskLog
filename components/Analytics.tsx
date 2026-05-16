// components/Analytics.tsx — ใช้ recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Minimal Task type used by this component
type Task = {
  status: string
  created_at: string
  updated_at: string
}

// สร้าง data จาก tasks
function getWeeklyData(tasks: Task[]) {
  const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return {
      day: days[d.getDay()],
      done: tasks.filter(t => t.status === 'DONE' && t.updated_at.startsWith(dateStr)).length,
      added: tasks.filter(t => t.created_at.startsWith(dateStr)).length,
    }
  })
}

export function Analytics({ tasks }: { tasks: Task[] }) {
  const data = getWeeklyData(tasks)
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">📊 สรุป 7 วันที่ผ่านมา</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barGap={2}>
          <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
          />
          <Bar dataKey="added" name="เพิ่ม" fill="#3f3f46" radius={[4, 4, 0, 0]} />
          <Bar dataKey="done" name="เสร็จ" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-600 inline-block"/>เพิ่ม</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block"/>เสร็จ</span>
      </div>
    </div>
  )
}