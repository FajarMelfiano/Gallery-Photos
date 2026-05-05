# 🚀 Setup Supabase untuk Photo Gallery

## Step 1: Buat Project Supabase

1. Go to [supabase.com](https://supabase.com)
2. Sign in atau create account
3. Klik "New Project"
4. Isi nama project, password, dan pilih region
5. Tunggu project selesai dibuat (~2 menit)

## Step 2: Create Database Tables

Masuk ke Supabase Dashboard, buka SQL Editor dan jalankan query berikut:

### Create Categories Table
```sql
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Create Photos Table
```sql
CREATE TABLE photos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  drive_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Insert Sample Data (Optional)
```sql
INSERT INTO categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️');
```

## Step 3: Get Credentials

1. Buka Settings → API
2. Copy:
   - **Project URL** → SUPABASE_URL
   - **Anon Key** → SUPABASE_KEY (untuk frontend)
   - **Service Role Secret** → SUPABASE_SERVICE_ROLE_KEY (untuk backend)

## Step 4: Configure Environment

Di folder backend, buat/edit file `.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

## Step 6: Run Server

```bash
# Development dengan auto-reload
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:5000`

## Step 7: Deploy ke Vercel

### Option A: Using Vercel CLI

```bash
npm install -g vercel
cd backend
vercel
```

### Option B: Using Vercel Dashboard

1. Push project ke GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project dari GitHub
4. Set environment variables:
   - SUPABASE_URL
   - SUPABASE_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
5. Deploy

## Verification

Cek apakah setup berhasil:

```bash
# Check if server running
curl http://localhost:5000

# Check API
curl http://localhost:5000/api/photos
curl http://localhost:5000/api/categories
```

## Troubleshooting

### Error: "SUPABASE_URL dan SUPABASE_KEY tidak ditemukan"
- Pastikan file `.env` sudah di-create di folder backend
- Pastikan kredensial sudah benar

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
cd backend
npm install
```

### Error: "Permission denied" on install.sh
```bash
chmod +x backend/install.sh
./backend/install.sh
```

## File Structure Baru

```
backend/
├── public/               # Frontend static files
│   ├── index.html
│   ├── pages/
│   ├── css/
│   └── js/
├── routes/              # API routes
│   ├── auth.js
│   ├── photos.js
│   └── categories.js
├── data/
│   └── supabase-db.js  # Supabase operations
├── config/
│   └── supabase.js     # Supabase client
├── middleware/
│   └── auth.js
├── package.json
├── server.js
├── .env.example
└── install.sh
```

## API Endpoints

Semua endpoint API tetap sama:

- `GET /api/photos` - Get all photos
- `GET /api/photos/:id` - Get photo by ID
- `POST /api/photos` - Add photo (admin)
- `PUT /api/photos/:id` - Update photo (admin)
- `DELETE /api/photos/:id` - Delete photo (admin)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Add category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify token

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| SUPABASE_URL | Supabase project URL | https://xxxxx.supabase.co |
| SUPABASE_KEY | Anon key untuk browser | eyJhbGciOiJIUzI1NiIs... |
| SUPABASE_SERVICE_ROLE_KEY | Service role key untuk server | eyJhbGciOiJIUzI1NiIs... |
| JWT_SECRET | Secret untuk JWT tokens | your_secret_key_123 |
| ADMIN_USERNAME | Admin username | admin |
| ADMIN_PASSWORD | Admin password | admin123 |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
