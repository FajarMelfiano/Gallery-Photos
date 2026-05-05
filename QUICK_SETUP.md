# 🚀 Photo Gallery - Complete Setup Guide

## Status: Database Tables Not Found

Anda melihat error `Could not find the table 'public.categories'` karena database tables belum dibuat di Supabase.

## ⚡ Quick Setup (2 minutes)

### Step 1: Buka Supabase Dashboard

Go to: **https://supabase.com/dashboard**

Select your project (Project ID: dari SUPABASE_URL di .env)

### Step 2: Buka SQL Editor

Di sidebar kiri, klik: **SQL Editor** → **New Query**

### Step 3: Copy SQL Setup

Option A (Easy - Copy from terminal):
```bash
cat scripts/sql-setup.sql
```

Option B (Manual):
- File sudah ada di: `backend/scripts/sql-setup.sql`
- Buka dan copy semua content

### Step 4: Paste & Execute

1. Paste SQL ke SQL Editor di Supabase
2. Click tombol **"Run"** (atau Ctrl+Enter)
3. Tunggu sebentar sampai selesai ✅

### Step 5: Start Server

Kembali ke terminal dan run:

```bash
npm start
```

Server harusnya mulai normal tanpa database error!

---

## 🎯 Verification

Buka browser:
- **Gallery**: http://localhost:5000
- **Admin**: http://localhost:5000/admin

Login dengan:
- Username: `admin`
- Password: `admin123`

---

## 📝 SQL Queries

### Option 1: Auto Generate SQL

```bash
node scripts/db-init.js
```

Script ini akan show SQL yang perlu di-execute.

### Option 2: Manual Copy

```bash
# Show SQL in terminal
cat scripts/sql-setup.sql

# Or open file
nano scripts/sql-setup.sql
```

### Option 3: Direct View

File SQL ada di: `backend/scripts/sql-setup.sql`

---

## 🔧 Available Commands

```bash
# Check database status
node scripts/db-init.js

# Show SQL to run
cat scripts/sql-setup.sql

# Start server (after DB setup)
npm start

# Development with auto-reload
npm run dev

# Full setup wizard
npm run setup

# Check project setup
npm run setup:check
```

---

## 🛠️ Troubleshooting

### Error: "Could not find table"
- ✓ Run `node scripts/db-init.js`
- ✓ Execute SQL shown
- ✓ Restart server

### Error: "Connection refused"
- ✓ Check `.env` file has SUPABASE credentials
- ✓ Verify SUPABASE_URL is correct
- ✓ Check internet connection

### SQL Execution Failed in Supabase
- ✓ Try executing one query at a time (without BEGIN/COMMIT)
- ✓ Check for syntax errors
- ✓ Ensure table names don't have conflicts

### Still Not Working?
- [ ] Verify .env has all 3 SUPABASE keys
- [ ] Test connection: `node scripts/db-init.js`
- [ ] Check Supabase project is active
- [ ] Try manual SQL in Supabase UI

---

## 📚 Next Steps

1. ✅ Setup database tables (this guide)
2. ✅ Start server: `npm start`
3. ⭐ Explore admin dashboard: http://localhost:5000/admin
4. 🚀 Deploy to Vercel (see VERCEL_DEPLOYMENT.md)

---

## 🆘 Need Help?

### If SQL doesn't work in Supabase:

Try running WITHOUT BEGIN/COMMIT:

```sql
CREATE TABLE IF NOT EXISTS public.categories (
  id bigserial primary key,
  name text not null unique,
  icon text default '📁',
  created_at timestamp with time zone default current_timestamp
);

CREATE TABLE IF NOT EXISTS public.photos (
  id bigserial primary key,
  title text not null,
  description text,
  drive_id text not null,
  image_url text not null,
  category_id bigint not null references public.categories(id) on delete cascade,
  created_at timestamp with time zone default current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_photos_category_id ON public.photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

INSERT INTO public.categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.photos (title, description, drive_id, image_url, category_id) 
VALUES (
  'Beautiful Sunset',
  'A stunning sunset over the mountains',
  '1example_id_1',
  'https://drive.google.com/uc?export=view&id=1example_id_1',
  1
)
ON CONFLICT DO NOTHING;
```

---

## ✨ Done!

After executing SQL, just run `npm start` dan gallery siap digunakan! 🎉
