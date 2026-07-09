import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const { data, error } = await supabase
    .from('tasklog_users')
    .insert({ username, password })
    .select('id, username')
    .single()

  if (error) {
    console.error('Registration error:', error)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set('session_user', JSON.stringify({ id: data.id, username: data.username }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ user: data })
}