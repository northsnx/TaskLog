// 'use client'
// import type { Task } from '@/types'

// function isOverdue(task: Task) {
//   if (!task.deadline || task.status === 'DONE') return false
//   return new Date(task.deadline) < new Date(new Date().toDateString())
// }

// export function DashboardStats({ tasks }: { tasks: Task[] }) {
//   const todo = tasks.filter(t => t.status === 'TODO').length
//   const doing = tasks.filter(t => t.status === 'DOING').length
//   const done = tasks.filter(t => t.status === 'DONE').length
//   const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0

//   return (
//     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
//       <div className="grid grid-cols-4 gap-3 mb-4">
//         {[
//           { label: 'TODO',    value: todo,         color: 'text-zinc-300' },
//           { label: 'DOING',   value: doing,        color: 'text-blue-400' },
//           { label: 'DONE',    value: done,         color: 'text-green-400' },
//           { label: 'ทั้งหมด', value: tasks.length, color: 'text-white' },
//         ].map(s => (
//           <div key={s.label} className="text-center">
//             <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
//             <div className="text-zinc-500 text-xs mt-0.5">{s.label}</div>
//           </div>
//         ))}
//       </div>
//       <div className="space-y-1.5">
//         <div className="flex justify-between text-xs text-zinc-500">
//           <span>ความคืบหน้า</span>
//           <span>{progress}%</span>
//         </div>
//         <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'
import type { Task } from '@/types'

function isOverdue(task: Task) {
  if (!task.deadline || task.status === 'DONE') return false
  return new Date(task.deadline) < new Date(new Date().toDateString())
}

export function DashboardStats({ tasks }: { tasks: Task[] }) {
  const todo = tasks.filter(t => t.status === 'TODO').length
  const doing = tasks.filter(t => t.status === 'DOING').length
  const done = tasks.filter(t => t.status === 'DONE').length
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'TODO',    value: todo,         color: 'text-zinc-600' },
          { label: 'DOING',   value: doing,        color: 'text-blue-600' },
          { label: 'DONE',    value: done,         color: 'text-emerald-600' },
          { label: 'ทั้งหมด', value: tasks.length, color: 'text-zinc-900' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-zinc-600">
          <span>ความคืบหน้า</span>
          <span className="text-zinc-900">{progress}%</span>
        </div>
        <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}