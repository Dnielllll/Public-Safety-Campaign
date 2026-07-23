# Design and Development of a Safety Campaign Management System
### for Barangay 178, Camarin, North Caloocan City
### with AI-Based Voice Automation using Google Cloud Text-to-Speech

## 1. Purpose

Text-to-Speech converts written public safety announcements into spoken audio.
This feature improves accessibility for senior citizens, visually impaired
residents, and individuals who prefer listening over reading. It also
supports voice announcements during emergencies and community events.

The system also includes an AI Safety Assistant (Chatbot) that helps residents get quick safety tips, emergency procedures, and guides them on how to submit concerns to the barangay.

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Language | JavaScript |
| API | Supabase Client |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Version Control | Git + GitHub |

## 3. Project Structure

```
barangay178-ssms/
├── frontend/                  React + Vite + Tailwind + shadcn/ui SPA
│   ├── src/
│   │   ├── components/ui/     shadcn-style primitives (Button, Card, Badge, Input, etc.)
│   │   ├── components/        AIChatbot.jsx
│   │   ├── layouts/            AdminLayout, StaffLayout, PublicLayout
│   │   ├── pages/
│   │   │   ├── admin/          Admin Subsystem (User Management, etc.)
│   │   │   ├── staff/          Staff Subsystem
│   │   │   └── public/         Public User Subsystem (Register, Login, Dashboard)
│   │   ├── lib/                Supabase client (supabase.js), AI helpers
│   │   ├── hooks/               useAuth (Supabase session management)
│   │   ├── routes/              route guards (RequireAuth, RequireRole)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            shadcn CSS variable theme (Barangay Daylight)
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env.local
│
├── database/                   Supabase SQL scripts
│   ├── supabase-schema.sql     Complete database schema
│   ├── create-admin-user.sql   (Deprecated) Old admin creation script
│   ├── run-in-supabase.sql     Migration for Supabase Auth + BPM tables
│   └── create-rpc-function.sql RPC for creating users via SQL (bypasses auth restrictions)
│
└── docs/
    ├── ERD.md                       Entity relationship overview
    └── MODULES.md                   Full module-to-role mapping (11 processes)
```

## 4. Roles

1. **Admin** — full control: users, campaigns, approvals, distribution,
   analytics, audit trail, system settings, AI/TTS configuration.
2. **Staff** — drafts campaigns/content, uses AI assistant, submits for
   approval, monitors notifications/feedback, limited reports.
3. **Public User (Resident)** — views campaigns, listens to AI voice
   announcements, receives notifications, submits feedback/surveys, views
   emergency information.

## 5. Getting Started

### Prerequisites
- Node.js and npm
- Supabase account and project

### Setup
1. **Create Supabase Project**
   - Go to https://supabase.com and create a new project
   - Copy your project URL and anon key

2. **Configure Environment Variables**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   Update `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Setup Database (Run in Supabase SQL Editor)**
   - Run `database/supabase-schema.sql` to create all core tables.
   - Run `database/run-in-supabase.sql` to apply the Auth triggers, remove plaintext passwords, and add BPM tables.
   - Run `database/create-rpc-function.sql` to enable the `create_user_by_admin` RPC function for Staff creation.

4. **Configure Supabase Auth Settings**
   - Go to **Authentication -> Providers -> Email**
   - **Enable email provider**: ON
   - **Confirm email**: OFF (Allows immediate login without email verification)
   - **Restrict email domains**: Leave empty (clear any domain restrictions)
   - Go to **Authentication -> Policies / Configuration**
   - **Allow new users to sign up**: ON

5. **Start Development Server**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173 in your browser
