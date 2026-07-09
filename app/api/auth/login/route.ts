import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const { data, error } = await supabase
    .from('tasklog_users')
    .select('id, username')
    .eq('username', username)
    .eq('password', password)
    .single()

    console.log('LOGIN DEBUG:', { username, data, error })

  if (error || !data) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('session_user', JSON.stringify({ id: data.id, username: data.username }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ user: data })
}