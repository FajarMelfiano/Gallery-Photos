# Vercel Deployment Guide

## Prerequisites
- Backend folder dengan struktur baru (frontend sudah di public/)
- Semua environment variables sudah di .env.example
- Sudah test di local (npm run dev)

## Option 1: Deploy dari GitHub (Recommended)

### Step 1: Push ke GitHub
```bash
git add .
git commit -m "Migrate to Supabase with monolithic structure"
git push origin main
```

### Step 2: Connect ke Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Choose "photo-gallery" (atau folder root)
5. Di "Root Directory", set ke `backend/`

### Step 3: Set Environment Variables
Di Vercel Settings → Environment Variables, tambahkan:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=production
```

### Step 4: Deploy
Click "Deploy" dan tunggu selesai (~2-3 menit)

## Option 2: Deploy menggunakan Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd backend
vercel --prod
```

### Step 4: Add Environment Variables
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
```

### Step 5: Re-deploy
```bash
vercel --prod
```

## Deployment Checklist

- [ ] Environment variables sudah set di Vercel
- [ ] SUPABASE_SERVICE_ROLE_KEY digunakan di backend (bukan di frontend)
- [ ] Frontend files ada di backend/public/
- [ ] .env tidak committed ke GitHub
- [ ] package.json sudah include @supabase/supabase-js
- [ ] Database tables sudah dibuat di Supabase

## Verify Deployment

Setelah deploy, test endpoints:

```bash
# Replace with your Vercel URL
VERCEL_URL=your-project.vercel.app

curl https://$VERCEL_URL/api/photos
curl https://$VERCEL_URL/api/categories
```

## Custom Domain (Optional)

1. Di Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Monitoring

1. Buka Vercel Dashboard
2. Select project
3. View logs dan analytics

## Troubleshooting

### Error: Cannot find module '@supabase/supabase-js'
- Check package.json termasuk dependency ini
- Run `npm install` dan push ulang

### Error: SUPABASE_URL not found
- Verify environment variables di Vercel Dashboard
- Redeploy setelah setting variables

### Frontend returning 404
- Verify `backend/public/` folder ada
- Check `server.js` line serving static files

### CORS Error di Frontend
- CORS sudah enabled di backend
- Check frontend calling correct API URL

## Rollback
```bash
vercel rollback
```

## Performance Optimization

1. Enable caching di Vercel settings
2. Use Supabase connection pooling
3. Add CDN untuk static files (automatic di Vercel)

## Security Notes

- SUPABASE_SERVICE_ROLE_KEY hanya di backend (jangan expose ke frontend)
- SUPABASE_KEY (anon key) bisa di frontend untuk future features
- Change default admin credentials sebelum production
- Enable RLS (Row Level Security) di Supabase untuk production

## Monitoring & Logs

```bash
# View live logs
vercel logs [project-name] --follow

# View build logs
vercel logs [project-name] --build
```
