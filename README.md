# 📋 Daily Task Log

> แอปจัดการงานประจำวัน — เปิดใช้งานได้ทันทีผ่าน URL จริง รองรับหลายผู้ใช้ ข้อมูลแยกกันชัดเจน

🔗 **Live Demo:** [https://tasklog.northsnx.site/](https://tasklog.northsnx.site/)

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Font | [Prompt](https://fonts.google.com/specimen/Prompt) — Google Fonts |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Realtime | Supabase Realtime (postgres_changes) |
| Drag & Drop | [@dnd-kit](https://dndkit.com/) |
| Deploy | [Vercel](https://vercel.com/) |

---

## ✨ Features

- **Auth** — สมัคร / เข้าสู่ระบบด้วย Username + Password ข้อมูลของแต่ละคนแยกกันสมบูรณ์
- **Task Management** — เพิ่ม / แก้ไข / ลบงาน พร้อม Status (TODO / DOING / DONE) Priority และ Tags
- **Deadline Tracking** — แสดงงานที่เลย deadline ด้วยสีแดง พร้อม badge เตือน
- **Dashboard** — สรุปจำนวนงานแต่ละสถานะ + Progress bar
- **Realtime Sync** — เปิด 2 tab พร้อมกัน แก้ไขใน tab หนึ่ง อีก tab อัปเดตทันที
- **Drag to Reorder** — ลากเรียงลำดับงานได้
- **Streak Counter** — นับวันที่ใช้งานต่อเนื่อง 🔥
- **Export CSV** — export งานพร้อมกรองตามสถานะและช่วงวันที่ รองรับภาษาไทย

---

## 🤖 ใช้ AI ตรงไหนบ้าง

โปรเจกต์นี้พัฒนาร่วมกับ **Claude (Anthropic) / Gemini / Codex / ChatGPT** ตลอดกระบวนการ:

| ส่วน | รายละเอียด |
|---|---|
| Architecture | ออกแบบโครงสร้างไฟล์ Next.js App Router และแบ่ง component |
| Database Schema | สร้าง SQL schema สำหรับ Supabase รวมถึง RLS policies |
| API Routes | เขียน route handlers ทั้งหมด (auth, tasks, streak, export) |
| UI Components | เขียน TaskCard, TaskForm, DashboardStats, ExportModal ฯลฯ |
| Bug Fixing | แก้ปัญหา timezone (UTC vs Asia/Bangkok), cookie session, realtime subscription |
| Refactoring | แยก component ออกจาก page เพื่อให้โค้ดสะอาดขึ้น |

---

## 🗂️ โครงสร้างโปรเจกต์

```
/app
  /api
    /auth
      /login/route.ts
      /register/route.ts
      /logout/route.ts
      /me/route.ts
    /tasks
      /route.ts
      /[id]/route.ts
      /export/route.ts
    /streak/route.ts
  /dashboard/page.tsx
  /page.tsx
/components
  TaskCard.tsx
  TaskForm.tsx
  TaskFilters.tsx
  DashboardStats.tsx
  ExportModal.tsx
  StreakBadge.tsx
/lib
  supabase.ts
/types
  index.ts
```

---

## 🛠️ วิธี Run Local

```bash
# 1. Clone repo
git clone https://github.com/yourusername/task-log.git
cd task-log

# 2. ติดตั้ง dependencies
npm install

# 3. สร้างไฟล์ .env.local
cp .env.example .env.local
# แล้วใส่ค่า Supabase URL และ Anon Key

# 4. รัน development server
npm run dev
```

---

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🗄️ Database Setup

รัน SQL นี้ใน Supabase SQL Editor:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('TODO', 'DOING', 'DONE')) DEFAULT 'TODO',
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'MEDIUM',
  tags TEXT[] DEFAULT '{}',
  deadline DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  UNIQUE(user_id, activity_date)
);

-- Disable RLS (auth handled server-side via cookies)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity DISABLE ROW LEVEL SECURITY;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

---

## 📦 Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. Import repo ใน [Vercel](https://vercel.com/)
3. เพิ่ม Environment Variables ใน Vercel Dashboard
4. Deploy — เสร็จแล้ว 🎉