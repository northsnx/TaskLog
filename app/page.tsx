'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">📋 Task Log</h1>
          <p className="text-zinc-400 mt-1 text-sm">จัดการงานของคุณ</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex mb-6 bg-zinc-800 rounded-xl p-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="ชื่อผู้ใช้"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="รหัสผ่าน"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-zinc-900 font-semibold py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'กำลังโหลด...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}