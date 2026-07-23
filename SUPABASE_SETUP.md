# Supabase Integration Setup Guide

This guide will help you connect the Barangay 178 Safety Campaign Management System to your Supabase project.

## Prerequisites

- A Supabase project (create one at https://supabase.com)
- Node.js and npm installed

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
3. Copy the following值:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (this is your anon/public key)

## Step 2: Configure Environment Variables

1. Create a `.env` file in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the contents of `database/supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

This will create all necessary tables:
- `users` - User profiles and roles
- `campaigns` - Safety campaigns
- `content` - Campaign content (text, images, audio)
- `voice_announcements` - TTS voice recordings
- `notifications` - User notifications
- `feedback` - User feedback on campaigns
- `surveys` - Community surveys
- `survey_questions` - Survey questions
- `survey_responses` - User survey responses
- `audit_logs` - System audit trail
- `emergency_info` - Emergency information
- `settings` - System settings

## Step 4: Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email settings as needed (SMTP for production)

## Step 5: Enable Row Level Security (RLS)

The schema SQL already enables RLS and sets up policies, but verify:

1. Go to **Authentication** → **Policies**
2. Check that policies exist for each table
3. Policies are configured to:
   - Allow users to view/edit their own profiles
   - Allow admins to view all users
   - Allow public to view published campaigns
   - Allow staff to manage campaigns they created
   - Allow users to view their own notifications

## Step 6: Create Initial Admin User

You'll need to create the first admin user manually:

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password for your admin
4. After creation, go to **Table Editor** → **users**
5. Find the user and update the `role` field to `admin`

## Step 7: Test the Integration

1. Restart the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Try registering a new user at `http://localhost:5173/register`
3. Check if the user appears in Supabase **Authentication** → **Users**
4. Check if the user profile appears in **Table Editor** → **users**

## Step 8: Create Test Data (Optional)

To test the system with sample data, you can insert test records:

```sql
-- Insert test campaigns
INSERT INTO public.campaigns (title, description, status, campaign_type, created_by) VALUES
  ('Fire Safety Awareness', 'Learn about fire prevention and safety measures.', 'published', 'safety', (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
  ('Community Clean-up Drive', 'Join us for a community clean-up event.', 'published', 'environment', (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1));

-- Insert test notifications
INSERT INTO public.notifications (recipient_id, title, message, type, status) VALUES
  ((SELECT id FROM public.users WHERE role = 'public' LIMIT 1), 'New Campaign Available', 'Check out our new fire safety campaign!', 'campaign', 'unread');
```

## Troubleshooting

### Connection Errors
- Verify your `.env` file has the correct Supabase URL and anon key
- Check that your Supabase project is not paused
- Ensure your network allows connections to Supabase

### Authentication Errors
- Verify email provider is enabled in Supabase Auth settings
- Check RLS policies allow the operations you're trying
- Ensure user roles are set correctly in the `users` table

### Database Errors
- Run the schema SQL again to ensure all tables exist
- Check that RLS policies are properly configured
- Verify table names match exactly (case-sensitive)

## API Migration Notes

The system has been migrated from a mock/Laravel backend to Supabase:

- **Authentication**: Now uses Supabase Auth instead of mock auth
- **Users**: Stored in `public.users` table with role-based access
- **Campaigns**: Full CRUD operations via Supabase
- **Content**: Campaign content managed through Supabase
- **Notifications**: Real-time notifications via Supabase
- **Feedback**: User feedback stored in Supabase
- **Surveys**: Survey system integrated with Supabase

The existing API layer (`src/lib/api.js`) now uses Supabase helpers, so your frontend code doesn't need to change.

## Next Steps

1. Set up Supabase Storage for file uploads (images, audio files)
2. Configure Supabase Edge Functions for AI text generation and TTS
3. Set up Supabase Realtime for live notifications
4. Configure email templates in Supabase Auth
5. Set up custom domains for production

## Support

For issues with:
- **Supabase**: Check https://supabase.com/docs
- **This project**: Review the code in `src/lib/supabase.js` for helper functions
