
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  setLoading(false)
  if (!res.ok) {
    setError(data.error || 'Something went wrong')
  } else {
    // เปลี่ยนจาก router.push เป็น window.location
    window.location.href = '/dashboard'
  }
}

  return (
    <main className="min-h-screen flex bg-white">
      {/* ด้านซ้าย: รูปภาพ (ซ่อนในมือถือ แสดงบนจอขนาด lg ขึ้นไป) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2564&auto=format&fit=crop"
          alt="Workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* เลเยอร์สีดำบางๆ ทับรูป เพื่อให้ดูพรีเมียมขึ้น (ลบออกได้ถ้าไม่ชอบ) */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-indigo-900/20 to-transparent"></div> */}
      </div>

      {/* ด้านขวา: ฟอร์ม Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/50">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm">
          <div className="mb-8 text-center">
            <Image
              src="/favicon.ico"
              alt="ExTaskX Logo"
              width={52}
              height={52}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">ExTaskX</h1>
            <p className="text-zinc-500 mt-2 text-sm">จัดการงานของคุณได้อย่างมีประสิทธิภาพ</p>
          </div>

          <div className="flex mb-8 bg-zinc-100 rounded-xl p-1.5">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-400/50 transition-all placeholder:text-zinc-400"
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">รหัสผ่าน (Password)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pr-12 text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2 shadow-md shadow-violet-200 active:scale-[0.98]"
            >
              {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}