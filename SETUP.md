# Home Harbour — Week 1 Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd /path/to/home-harbour
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yrahqcleujkleofnzebo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key_from_supabase>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_from_supabase>
```

**To get keys from Supabase:**
1. Go to https://app.supabase.com
2. Select your `home-harbour` project
3. Navigate to Settings → API
4. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. For `SUPABASE_SERVICE_ROLE_KEY`, go to Settings → API and look for the service role key (keep this secret!)

### 3. Run Database Migrations

Execute the SQL schema in Supabase:

1. Go to your Supabase project → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `migrations/001_schema.sql`
4. Paste into the query editor
5. Click "Run"

**Or use the ready-made prompt for Supabase AI:**

```
I have a home-harbour app with a migration file.
Execute this SQL to set up the database schema with full RLS policies:

[paste contents of migrations/001_schema.sql here]

The schema includes:
- households, users, pantry_items, usage_logs, shopping_lists, item_requests
- Complete Row Level Security policies
- All necessary indexes and constraints
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Create Your First Account

1. Click "Create Account"
2. Fill in:
   - Household Name (e.g., "My Home")
   - Your Name
   - Email & Password
3. Click "Create Account"
4. You'll be redirected to the pantry page

---

## Project Structure (Week 1 Complete)

```
✅ COMPLETED:
├── app/
│   ├── layout.tsx                    # Root layout with AuthProvider
│   ├── (auth)/
│   │   ├── layout.tsx               # Auth page wrapper
│   │   ├── login/page.tsx           # Login form
│   │   └── signup/page.tsx          # Sign-up with household creation
│   └── (dashboard)/
│       ├── layout.tsx               # Protected dashboard with nav/sidebar
│       ├── pantry/page.tsx          # Pantry items list (basic)
│       ├── shopping-lists/page.tsx  # Shopping lists (stub)
│       ├── reports/page.tsx         # Reports dashboard (stub)
│       └── settings/page.tsx        # Household settings (stub)
├── components/
│   ├── protected-route.tsx          # Auth guard
│   ├── navbar.tsx                   # Top navigation
│   └── sidebar.tsx                  # Left sidebar nav
├── context/
│   └── auth-context.tsx             # Auth state + household
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase instance
│   │   └── server.ts               # Server-side (for API routes)
│   └── types/
│       └── index.ts                # Full TypeScript interfaces
├── migrations/
│   └── 001_schema.sql              # Complete database schema with RLS
├── styles/
│   └── globals.css                 # Tailwind CSS setup
├── package.json                     # Updated deps
├── tsconfig.json                    # TypeScript config
├── next.config.js                   # Next.js config
├── tailwind.config.js               # Tailwind config
└── .env.local.example               # Environment template

⏳ COMING IN WEEK 2-3:
  - Photo upload component
  - Pantry CRUD with full UI
  - Quick usage FAB
  - Shopping list generation
  - Request items modal
```

---

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Fix:** Make sure `.env.local` has the correct Supabase URL and keys. Check that the file is NOT in `.gitignore` (it should be).

### RLS Policy Errors on Database Access

**Fix:** Ensure all RLS policies were created by running the full `001_schema.sql` migration. RLS should be enabled on all tables.

### Auth Not Working / Always Redirects to Login

**Fix:**
1. Check that your Supabase auth is enabled (should be by default)
2. Try signing up with a new account
3. Check browser console for errors

### Email/Password Issues

**Fix:** Supabase requires:
- Email with valid format
- Password at least 6 characters
- Unique email per account

---

## Next Steps (Week 2)

Week 1 is complete! You now have:
- ✅ Supabase database with complete schema
- ✅ Auth (signup/login)
- ✅ Protected dashboard routes
- ✅ Basic navigation

**Week 2 deliverables:**
1. Pantry CRUD endpoints (`POST /api/pantry-items`, `GET`, `PUT`, `DELETE`)
2. Photo upload (`POST /api/pantry-items/[id]/photo`)
3. Quick usage FAB component
4. Pantry list UI with items
5. Usage logging modal

---

## Architecture Notes

- **Auth:** Supabase Auth (magic link & password coming later)
- **Database:** PostgreSQL with Row-Level Security (RLS)
- **State:** React Context for auth/household, React Query for server state
- **Auth-to-DB:** When user signs up:
  1. Supabase Auth creates user in `auth.users`
  2. Our code creates record in `users` table
  3. RLS policies limit DB access to user's household

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Database Schema:** See `migrations/001_schema.sql`

Happy coding! 🏠
