# ZAMSTATE Quick Reference

## 🚀 Quick Start

### Windows Users
```bash
# Double-click this file:
start.bat
```

### macOS/Linux Users
```bash
chmod +x start.sh
./start.sh
```

### Manual Start (Both Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run seed
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

---

## 📍 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

## 👤 Default Admin Account

| Field | Value |
|-------|-------|
| Email | admin@zamstate.com |
| Password | Admin@123456 |
| Role | admin |

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Complete setup instructions |
| `BACKEND_INTEGRATION_SUMMARY.md` | What was built |
| `server/README.md` | Backend API documentation |
| `server/.env` | Backend configuration |
| `src/utils/api.ts` | Frontend API client |
| `src/components/common/Loader.tsx` | Loading spinner |

---

## 🔧 Common Commands

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend
```bash
cd server
npm run dev       # Start dev server
npm run build     # Compile TypeScript
npm run seed      # Seed admin user
npm start         # Run production build
```

---

## 🌐 API Endpoints

### Auth
```
POST /api/auth/register       - Register user
POST /api/auth/login          - Login user
GET  /api/auth/profile        - Get profile
PUT  /api/auth/profile        - Update profile
```

### Properties
```
GET    /api/properties              - List properties
GET    /api/properties/:id          - Get property
POST   /api/properties              - Create property
PUT    /api/properties/:id          - Update property
DELETE /api/properties/:id          - Delete property
GET    /api/properties/:id/bookings - Get bookings
```

---

## 💾 Database Setup

### Option 1: Local MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod

# Verify
mongosh
```

### Option 2: MongoDB Atlas (Cloud)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `server/.env` as `MONGODB_URI`

---

## 📸 Cloudinary Setup (For Image Uploads)

1. Sign up: https://cloudinary.com/users/register/free
2. Get from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add to `server/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

---

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/zamstate
JWT_SECRET=your_secure_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

---

## 🎯 Testing Flow

1. **Register** → http://localhost:5173/register
   - Create new account
   - See spinner during signup
   - Get toast notification

2. **Login** → http://localhost:5173/login
   - Use admin or created account
   - Token stored in localStorage
   - Spinner shows during auth

3. **View Dashboard**
   - User profile displayed
   - Authenticated routes accessible
   - Token sent in API requests

4. **Create Property** (Admin only)
   - Upload images (to Cloudinary)
   - See loading spinner
   - Property saved to MongoDB

---

## ❌ Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `lsof -i :5000` then `kill -9 <PID>` |
| Port 5173 in use | Close other Vite servers |
| MongoDB error | Run `mongosh` to verify connection |
| CORS error | Check `CORS_ORIGIN` in `.env` |
| Token error | Clear localStorage: `localStorage.clear()` |
| Image upload fails | Verify Cloudinary credentials in `.env` |
| Admin seed fails | `db.dropDatabase()` in mongosh, re-seed |

---

## 📦 What's Included

✅ Express REST API  
✅ MongoDB database  
✅ JWT authentication  
✅ Cloudinary integration  
✅ Loading spinners  
✅ Toast notifications  
✅ Form validation  
✅ Error handling  
✅ Admin user seeding  
✅ Role-based access control  

---

## 🎨 Frontend Features

- React 19 with TypeScript
- Responsive Bootstrap design
- Framer Motion animations
- React Hook Form validation
- Zod schema validation
- Zustand state management
- react-hot-toast notifications
- Protected routes
- Type-safe API calls

---

## 🔌 Backend Features

- Express.js server
- MongoDB with Mongoose
- JWT tokens (7 day expiry)
- bcryptjs password hashing
- Multer file uploads
- Cloudinary storage
- Input validation
- Error middleware
- CORS enabled
- Admin seeding

---

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Check `BACKEND_INTEGRATION_SUMMARY.md` for architecture
3. Look at server logs during `npm run dev`
4. Check browser console (F12)
5. Check browser network tab (F12)
6. Run health check: `http://localhost:5000/api/health`

---

## ✨ Next Steps

After basic testing:
1. Create more API endpoints (Bookings, Messages, etc.)
2. Build property search filters
3. Implement payment system
4. Add real estate features
5. Deploy to production

---

**Version: 1.0.0**  
**Last Updated: January 31, 2026**  
**Status: ✅ Ready for Testing**
