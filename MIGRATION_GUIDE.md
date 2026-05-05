# Migration Guide: From Local JSON to Supabase

## Summary of Changes

Proyek ini telah dimigrasikan dari database JSON lokal ke Supabase dengan struktur folder yang lebih simpel untuk deployment Vercel.

## What's Changed

### 1. Database Layer ✅
- **Before**: File `data/db.js` menggunakan file system (db.json)
- **After**: File `data/supabase-db.js` menggunakan Supabase PostgreSQL

### 2. Project Structure ✅
- **Before**: 
  ```
  backend/
  frontend/
  ```
- **After**: 
  ```
  backend/
  ├── public/      (previously frontend/)
  ├── routes/
  └── ...
  ```

### 3. Async Operations ✅
- Routes sekarang menggunakan `async/await` untuk operasi database
- Error handling lebih baik dengan try-catch

### 4. Environment Configuration ✅
- Buat `.env` file berdasarkan `.env.example`
- Semua kredensial sekarang di environment variables

## Migration Steps

### 1. Setup Supabase Project
Ikuti panduan di [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 2. Create Tables di Supabase
Jalankan SQL queries yang disediakan di SUPABASE_SETUP.md

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env dengan kredensial Supabase Anda
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Test Server
```bash
npm run dev
```

## Breaking Changes

### Frontend API URLs
**Tidak ada perubahan!** - Frontend tetap calling `/api/` endpoints yang sama

### Database Columns
Penamaan column Supabase menggunakan snake_case:
```javascript
// Before (JSON)
photo.driveId
photo.imageUrl

// After (Supabase)
photo.drive_id  (database)
// Tapi API response tetap: photo.driveId (converted)
```

## Data Migration dari JSON ke Supabase

Jika Anda punya data lama di `db.json`, Anda bisa migrate dengan script ini:

```bash
node scripts/migrate-from-json.js
```

(Opsional - script akan dibuat jika diperlukan)

## Testing

Setelah setup, test API endpoints:

```bash
# Get all photos
curl http://localhost:5000/api/photos

# Get all categories
curl http://localhost:5000/api/categories

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Performance Notes

- Supabase PostgreSQL jauh lebih cepat dari JSON file
- Real-time capabilities bisa ditambahkan nanti
- Scalable untuk production use

## Next Steps (Optional)

1. **Real-time Updates**: Gunakan Supabase realtime untuk live updates
2. **Authentication**: Ganti ke Supabase Auth untuk admin login
3. **Storage**: Gunakan Supabase Storage untuk image uploads
4. **Backup**: Configure automated backups di Supabase Dashboard

## Rollback (Jika Diperlukan)

Jika perlu kembali ke JSON:
1. Restore dari git: `git checkout backend/routes/` dan `git checkout backend/data/`
2. Update `server.js` untuk serve dari `../frontend`
3. Uninstall Supabase: `npm uninstall @supabase/supabase-js`

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Community: https://discord.gg/supabase
