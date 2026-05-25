// 'use client'
// import { useState } from 'react'

// interface Props {
//   onClose: () => void
// }

// export function ExportModal({ onClose }: Props) {
//   const [status, setStatus]   = useState('ALL')
//   const [from, setFrom]       = useState('')
//   const [to, setTo]           = useState('')

//   const handleExport = () => {
//     const params = new URLSearchParams()
//     if (status !== 'ALL') params.set('status', status)
//     if (from) params.set('from', from)
//     if (to) params.set('to', to)
//     window.location.href = `/api/tasks/export?${params}`
//     onClose()
//   }

//   return (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
//       <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
//         <h3 className="font-semibold text-white">📥 Export CSV</h3>
//         <div>
//           <label className="text-xs text-zinc-400 mb-1 block">สถานะ</label>
//           <select value={status} onChange={e => setStatus(e.target.value)}
//             className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
//             <option value="ALL">ทั้งหมด</option>
//             <option value="TODO">TODO</option>
//             <option value="DOING">DOING</option>
//             <option value="DONE">DONE</option>
//           </select>
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//           <div>
//             <label className="text-xs text-zinc-400 mb-1 block">Deadline จาก</label>
//             <input type="date" value={from} onChange={e => setFrom(e.target.value)}
//               className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
//           </div>
//           <div>
//             <label className="text-xs text-zinc-400 mb-1 block">Deadline ถึง</label>
//             <input type="date" value={to} onChange={e => setTo(e.target.value)}
//               className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
//           </div>
//         </div>
//         <div className="flex gap-2 pt-1">
//           <button onClick={onClose}
//             className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition-colors">
//             ยกเลิก
//           </button>
//           <button onClick={handleExport}
//             className="flex-1 bg-white text-zinc-900 font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-100 transition-colors">
//             ดาวน์โหลด
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
}

export function ExportModal({ onClose }: Props) {
  const [status, setStatus] = useState('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handleExport = () => {
    const params = new URLSearchParams()

    if (status !== 'ALL') params.set('status', status)
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    window.location.href = `/api/tasks/export?${params}`
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      
      {/* Modal */}
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              📥 Export CSV
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              ดาวน์โหลดข้อมูล Task ตามเงื่อนไข
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
              สถานะงาน
            </label>

            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            >
              <option value="ALL">📋 ทั้งหมด</option>
              <option value="TODO">📌 TODO</option>
              <option value="DOING">⚡ DOING</option>
              <option value="DONE">✅ DONE</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                วันที่เริ่มต้น
              </label>

              <input
                type="datetime-local"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                วันที่สิ้นสุด
              </label>

              <input
                type="datetime-local"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 py-3 rounded-xl text-sm font-medium transition-all"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleExport}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            ดาวน์โหลด CSV
          </button>
        </div>
      </div>
    </div>
  )
}