import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session_user')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = JSON.parse(session.value)
  const { id } = await params

  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.title !== undefined) updates.title = body.title
  if (body.status !== undefined) updates.status = body.status
  if (body.deadline !== undefined) updates.deadline = body.deadline

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session_user')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = JSON.parse(session.value)
  const { id } = await params

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}