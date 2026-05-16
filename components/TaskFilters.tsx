// 'use client'
// import type { TaskStatus } from '@/types'

// type FilterType = TaskStatus | 'ALL' | 'OVERDUE'

// interface Props {
//   current: FilterType
//   overdueCount: number
//   onChange: (f: FilterType) => void
// }

// export function TaskFilters({ current, overdueCount, onChange }: Props) {
//   return (
//     <div className="flex gap-2 flex-wrap">
//       {(['ALL', 'TODO', 'DOING', 'DONE', 'OVERDUE'] as const).map(f => (
//         <button
//           key={f}
//           onClick={() => onChange(f)}
//           className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
//             current === f ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
//           } ${f === 'OVERDUE' && overdueCount > 0 ? 'ring-1 ring-red-500' : ''}`}
//         >
//           {f === 'OVERDUE' ? `⚠️ สายแล้ว (${overdueCount})` : f}
//         </button>
//       ))}
//     </div>
//   )
// }

'use client'
import type { TaskStatus } from '@/types'

type FilterType = TaskStatus | 'ALL' | 'OVERDUE'

interface Props {
  current: FilterType
  overdueCount: number
  onChange: (f: FilterType) => void
}

export function TaskFilters({ current, overdueCount, onChange }: Props) {
  return (
    <div className="flex gap-2.5 flex-wrap">
      {(['ALL', 'TODO', 'DOING', 'DONE', 'OVERDUE'] as const).map(f => {
        const isActive = current === f
        const isOverdueAlert = f === 'OVERDUE' && overdueCount > 0

        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isActive
                ? isOverdueAlert
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                : isOverdueAlert
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 shadow-sm'
            }`}
          >
            {f === 'OVERDUE' 
              ? `⚠️ สายแล้ว ${overdueCount > 0 ? `(${overdueCount})` : ''}` 
              : f === 'ALL' 
                ? 'ทั้งหมด' 
                : f}
          </button>
        )
      })}
    </div>
  )
}