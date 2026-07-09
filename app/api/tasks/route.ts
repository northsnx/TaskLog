import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

function getUser() {
    // We'll call this inside the handler
}

export async function GET() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session_user')
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = JSON.parse(session.value)

    const { data, error } = await supabase
        .from('tasklog_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tasks: data })
}

export async function POST(req: NextRequest) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session_user')
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = JSON.parse(session.value)

    const { title, description, status, deadline, priority, tags } = await req.json()

    const { data, error } = await supabase
        .from('tasklog_tasks')
        .insert({
            user_id: user.id,
            title,
            description,
            status,
            deadline: deadline || null,
            priority: priority || 'MEDIUM',  // เพิ่ม
            tags: tags || [],                 // เพิ่ม
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ task: data })
}