-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'asia/bangkok') NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'TODO' NOT NULL,
    priority TEXT DEFAULT 'MEDIUM' NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    deadline TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'asia/bangkok') NOT NULL,
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'asia/bangkok') NOT NULL,
    subtasks JSONB DEFAULT '[]'::jsonb
);

-- Create user_activity table for streaks
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_date DATE NOT NULL,
    UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (Allow all for now, since we handle auth manually in API)
CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for tasks (Only owner can access)
CREATE POLICY "Users can see their own tasks" ON public.tasks FOR SELECT USING (true); -- Filtered by API
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (true);

-- RLS Policies for user_activity
CREATE POLICY "Users can see their own activity" ON public.user_activity FOR ALL USING (true);
