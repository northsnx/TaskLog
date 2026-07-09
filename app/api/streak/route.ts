import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session_user')
  if (!session) return NextResponse.json({ streak: 0 })
  const user = JSON.parse(session.value)

  // บันทึกวันนี้
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('tasklog_user_activity')
    .upsert({ user_id: user.id, activity_date: today })

  // ดึง activity ทั้งหมด
  const { data } = await supabase
    .from('tasklog_user_activity')
    .select('activity_date')
    .eq('user_id', user.id)
    .order('activity_date', { ascending: false })

  // นับ streak
  let streak = 0
  const check = new Date()
  for (const row of data || []) {
    const expected = new Date(check.toDateString())
    const actual = new Date(row.activity_date)
    if (actual.getTime() === expected.getTime()) {
      streak++
      check.setDate(check.getDate() - 1)
    } else break
  }

  return NextResponse.json({ streak })
}