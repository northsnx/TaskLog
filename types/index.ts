export type TaskStatus = 'TODO' | 'DOING' | 'DONE'

export interface Subtask {
    id: string
    title: string
    completed: boolean
}

export interface User {
    id: string
    username: string
    xp: number
    level: number
    created_at: string
}

export interface Task {
    id: string
    user_id: string
    title: string
    status: TaskStatus
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    tags: string[]
    deadline: string | null
    subtasks?: Subtask[]
    created_at: string
    updated_at: string
}

export interface SessionUser {
    id: string
    username: string
    xp: number
    level: number
}