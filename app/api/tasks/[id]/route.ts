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
  
  // Fetch current task to check status change
  const { data: currentTask } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', id)
    .single()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status
  if (body.deadline !== undefined) updates.deadline = body.deadline
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order
  if (body.subtasks !== undefined) updates.subtasks = body.subtasks

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Gamification: Award XP for completing a task
  if (currentTask && currentTask.status !== 'DONE' && body.status === 'DONE') {
    const { data: userData } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', user.id)
        .single()
    
    if (userData) {
        const newXp = userData.xp + 10
        const newLevel = Math.floor(newXp / 100) + 1
        
        await supabase
            .from('users')
            .update({ xp: newXp, level: newLevel })
            .eq('id', user.id)
    }
  }

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