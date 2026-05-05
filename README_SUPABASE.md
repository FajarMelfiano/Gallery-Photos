# 📸 Photo Gallery - Supabase Edition

Modern photo gallery web application dengan admin dashboard. Dioptimalkan untuk deployment di Vercel dengan database Supabase.

## ✨ Features

- 🎨 Modern, responsive gallery design
- 👨‍💼 Admin panel untuk manage fotos dan kategori
- 🔐 JWT authentication untuk admin
- 🗂️ Category management
- 🖼️ Google Drive image integration
- ⚡ Fast PostgreSQL database (Supabase)
- 🚀 Optimized untuk Vercel deployment

## 🏗️ Project Structure

```
backend/
├── public/                 # Frontend static files (previously frontend/)
│   ├── index.html         # Main gallery page
│   ├── pages/
│   │   ├── admin-login.html
│   │   └── admin-dashboard.html
│   ├── css/               # Stylesheets
│   └── js/                # Frontend scripts
│
├── routes/                # API routes
│   ├── auth.js           # Login & authentication
│   ├── photos.js         # Photo CRUD operations
│   └── categories.js     # Category CRUD operations
│
├── data/
│   └── supabase-db.js    # Database operations (Supabase)
│
├── config/
│   └── supabase.js       # Supabase client configuration
│
├── middleware/
│   └── auth.js           # JWT authentication middleware
│
├── server.js             # Express server
├── package.json
├── .env.example          # Environment variables template
├── .gitignore
├── vercel.json           # Vercel configuration
├── start.sh              # Start script (macOS/Linux)
├── START.bat             # Start script (Windows)
│
├── SUPABASE_SETUP.md     # Detailed Supabase setup guide
├── MIGRATION_GUIDE.md    # Migration from JSON to Supabase
└── VERCEL_DEPLOYMENT.md  # Vercel deployment guide
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- Supabase account ([free tier](https://supabase.com))

### 2. Clone & Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install
```

### 3. Configure Supabase
Ikuti panduan di [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 4. Edit .env
```bash
# Edit .env dengan kredensial Supabase Anda
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=5000
```

### 5. Start Server
```bash
# macOS/Linux
./start.sh

# Windows
START.bat

# Manual
npm start
```

Server akan berjalan di `http://localhost:5000`

### 6. Access
- 🖼️ Gallery: http://localhost:5000
- 👨‍💼 Admin: http://localhost:5000/admin

**Default credentials:**
- Username: `admin`
- Password: `admin123`

## 📚 API Endpoints

### Photos
- `GET /api/photos` - Get all photos
- `GET /api/photos/:id` - Get photo by ID
- `POST /api/photos` - Add photo (admin only)
- `PUT /api/photos/:id` - Update photo (admin only)
- `DELETE /api/photos/:id` - Delete photo (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Add category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

## 🌍 Database Schema

### categories table
```sql
- id (BIGSERIAL) - Primary key
- name (TEXT) - Category name
- icon (TEXT) - Emoji icon
- created_at (TIMESTAMP)
```

### photos table
```sql
- id (BIGSERIAL) - Primary key
- title (TEXT) - Photo title
- description (TEXT) - Photo description
- drive_id (TEXT) - Google Drive file ID
- image_url (TEXT) - Image URL
- category_id (BIGINT) - Foreign key to categories
- created_at (TIMESTAMP)
```

## 🎯 Development

### Development mode dengan auto-reload
```bash
npm run dev
```

### Build untuk production
```bash
npm install
```

### Lint & Format (if configured)
```bash
npm run lint
```

## 🚀 Deployment

### Deploy ke Vercel

**Option 1: Automatic (Recommended)**
1. Push ke GitHub
2. Buka https://vercel.com/new
3. Import GitHub repository
4. Set root directory ke `backend/`
5. Add environment variables (lihat `.env.example`)
6. Deploy!

**Option 2: Vercel CLI**
```bash
npm install -g vercel
cd backend
vercel --prod
```

Detailed guide di [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 🔄 Migration dari JSON ke Supabase

Jika Anda punya project lama dengan db.json, lihat [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 🐛 Troubleshooting

### Server won't start
```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database connection error
- Check `.env` file exists
- Verify SUPABASE_URL dan credentials
- Check network connection

### Port already in use
```bash
# Change port di .env
PORT=3001
```

### Admin login fails
- Check ADMIN_USERNAME dan ADMIN_PASSWORD di `.env`
- Default: admin / admin123

## 📖 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete Supabase configuration
- [Migration Guide](./MIGRATION_GUIDE.md) - Migrate from old system
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Deploy to production

## 🛠️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| SUPABASE_URL | Supabase project URL | https://xxxxx.supabase.co |
| SUPABASE_KEY | Anon key | eyJhbGciOiJIUzI1NiIs... |
| SUPABASE_SERVICE_ROLE_KEY | Service role secret | eyJhbGciOiJIUzI1NiIs... |
| JWT_SECRET | JWT signing secret | your_secret_key |
| ADMIN_USERNAME | Admin username | admin |
| ADMIN_PASSWORD | Admin password | admin123 |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.3",
  "body-parser": "^1.20.2",
  "@supabase/supabase-js": "^2.38.0"
}
```

## 🔐 Security

- JWT tokens untuk authentication
- Environment variables untuk sensitive data
- CORS enabled
- Input validation on all endpoints
- Middleware untuk protect admin routes

## 📝 License

ISC

## 🤝 Contributing

Pull requests welcome!

## 📞 Support

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com)
- [Vercel Docs](https://vercel.com/docs)

---

**Made with ❤️ using Supabase & Vercel**

> 🎯 Tip: Untuk production, change default admin credentials dan gunakan strong JWT secret!
