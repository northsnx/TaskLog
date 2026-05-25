import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session_user')
  if (!session) return NextResponse.json({ user: null })
  
  const sessionData = JSON.parse(session.value)
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, xp, level')
    .eq('id', sessionData.id)
    .single()

  if (error || !user) return NextResponse.json({ user: null })
  
  return NextResponse.json({ user })
}