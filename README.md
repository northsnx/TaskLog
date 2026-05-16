# 📋 Daily Task Log

> แอปจัดการงานประจำวัน — เปิดใช้งานได้ทันทีผ่าน URL จริง รองรับหลายผู้ใช้ ข้อมูลแยกกันชัดเจน พร้อมระบบวิเคราะห์และปฏิทินอัจฉริยะ

🔗 **Live Demo:** [https://tasklog.northsnx.site/](https://tasklog.northsnx.site/)

username: northsnx  // password:948999  หรือสามารถสร้างใหม่ได้
---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts](https://recharts.org/) (Data Visualization) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Realtime** | Supabase Broadcast & Postgres Changes |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) |
| **Deploy** | [Vercel](https://vercel.com/) |

---

## ✨ Features (Highlight)

- **🔄 Multi-Tab Realtime Sync** — อัพเดตข้อมูลทันทีในทุกแท็บเมื่อมีการเปลี่ยนแปลง (ใช้ Supabase Broadcast)
- **📅 Calendar View** — มุมมองปฏิทินที่ช่วยให้เห็น Deadline ของงานในแต่ละเดือนได้อย่างชัดเจน
- **📊 Analytics Dashboard** — กราฟวิเคราะห์กิจกรรมย่อยในรอบ 7 วัน และสัดส่วนสถานะงานในรูปแบบ Donut Chart
- **✅ Sub-tasks (Checklist)** — แตกงานใหญ่เป็นขั้นตอนย่อยๆ พร้อมระบบติดตามความคืบหน้า (Progress Indicator)
- **🌗 View Switcher** — สลับมุมมองระหว่าง List, Calendar และ Analytics ได้อย่างลื่นไหลพร้อม Animation
- **⏰ Smart Overdue System** — ระบบแจ้งเตือนงานเกินกำหนดแบบ Real-time ตามเวลาประเทศไทย (UTC+7)
- **🐾 Drag to Reorder** — จัดลำดับความสำคัญของงานได้ง่ายๆ ด้วยการลากวาง
- **🔐 Secure Auth** — ระบบ Login/Register พร้อมปุ่ม Show/Hide Password และความปลอดภัยระดับ Database (RLS)
- **📥 Export CSV** — ส่งออกข้อมูลงานทั้งหมดรองรับภาษาไทย

---

## 🤖 ใช้ AI ตรงไหนบ้าง

โปรเจกต์นี้สร้างขึ้นโดยใช้ **Gemini CLI / Claude / Codex / ChatGPT** เป็นผู้ช่วยหลักในการพัฒนาแบบ **Auto-Edit**:

| ส่วนของงาน | บทบาทของ AI (Gemini CLI) |
|---|---|
| **Real-time Sync** | ออกแบบและวางระบบ Supabase Broadcast เพื่อให้เกิดการซิงค์ข้อมูลข้ามแท็บโดยไม่ต้องรีเฟรช |
| **New Features** | พัฒนาหน้า Calendar View และ Analytics Dashboard ตั้งแต่ศูนย์จนใช้งานได้จริง |
| **Complex Logic** | แก้ไขปัญหา Timezone Offset (UTC+7) ที่ซับซ้อนระหว่าง Database และ Browser |
| **Sub-tasks System** | ออกแบบโครงสร้างข้อมูลแบบ JSONB และสร้าง UI Checklist ที่มีการคำนวณ Progress อัตโนมัติ |
| **UI/UX Polishing** | ปรับปรุงหน้า Login/Register เพิ่มไอคอนและฟีเจอร์ความสะดวกสบาย (Show Password) |
| **Linting & Quality** | ตรวจสอบและแก้ไข Lint errors อัตโนมัติเพื่อให้โค้ดสะอาดและพร้อม Deploy |

---

## 🗂️ โครงสร้างโปรเจกต์

```
/app
  /api
    /auth/login, logout, me, register
    /tasks
      /route.ts
      /[id]/route.ts
      /export/route.ts
    /streak/route.ts
  /dashboard/page.tsx
  /page.tsx
/components
  Analytics.tsx       # ระบบกราฟสถิติ
  CalendarView.tsx    # มุมมองปฏิทิน
  TaskCard.tsx        # การ์ดงานหลัก (รวม Sub-tasks)
  TaskForm.tsx        # ฟอร์มเพิ่มงาน (รองรับ UTC+7)
  ...
/lib
  supabase.ts         # Supabase Client
/types
  index.ts            # Type Definitions
```

---

## 🛠️ วิธี Run Local

```bash
# 1. Clone repo
git clone https://github.com/yourusername/task-log.git
cd task-log

# 2. ติดตั้ง dependencies
npm install

# 3. สร้างไฟล์ .env.local และใส่ค่าจาก Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 4. รันโปรเจกต์
npm run dev
```

---

## 🗄️ Database Setup (Supabase)

รัน SQL นี้ใน SQL Editor เพื่อเริ่มต้นระบบ:

```sql
-- สำหรับตารางหลัก (อัพเดตเป็นเวลาไทย)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

-- เปลี่ยนชนิดคอลัมน์เพื่อให้เก็บเวลาไทยได้แม่นยำ
ALTER TABLE tasks ALTER COLUMN deadline TYPE TIMESTAMP;
ALTER TABLE tasks ALTER COLUMN created_at TYPE TIMESTAMP;
ALTER TABLE tasks ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'asia/bangkok');

-- เปิดใช้งาน Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

---

## 📦 Deploy

- **Platform:** Vercel (Auto-deploy via GitHub)
- **DB Hosting:** Supabase
