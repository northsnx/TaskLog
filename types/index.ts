export type TaskStatus = 'TODO' | 'DOING' | 'DONE'

export interface User {
  id: string
  username: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  status: TaskStatus
  deadline: string | null
  created_at: string
  updated_at: string
}

export interface SessionUser {
  id: string
  username: string
}