import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session_user')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = JSON.parse(session.value)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('tasklog_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status && status !== 'ALL') query = query.eq('status', status)
  if (from) query = query.gte('deadline', from)
  if (to) query = query.lte('deadline', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date().toISOString().split('T')[0]
  const rows = [
    ['ลำดับ', 'ชื่องาน', 'สถานะ', 'Deadline', 'วันที่เพิ่ม'],
    ...(data || []).map((t, i) => [
      i + 1,
      t.title,
      t.status,
      t.deadline || '-',
      t.created_at.split('T')[0],
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')

  // เพิ่ม BOM ข้างหน้า
const bom = '\uFEFF'
const csvWithBom = bom + csv

return new NextResponse(csvWithBom, {
  headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename=tasks_${today}.csv`,
  },
})
}