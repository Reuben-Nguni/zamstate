# ZAMSTATE Full Stack Setup Guide

Complete setup instructions for running both frontend and backend together.

## Project Structure

```
ZAMSTATE REACT/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── utils/               # API client service
│   └── App.tsx
├── server/                   # Backend (Express + MongoDB)
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   ├── config/          # DB, Cloudinary
│   │   ├── utils/           # JWT, helpers
│   │   └── seeds/           # Data seeding
│   └── package.json
└── package.json
```

## Prerequisites

1. **Node.js & npm** (v18+)
2. **MongoDB** (local or Atlas cloud)
3. **Cloudinary Account** (for image uploads) - https://cloudinary.com

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/zamstate
JWT_SECRET=your_secure_key_here_change_in_production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Windows (after installation)
net start MongoDB

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and add to `.env`

### 4. Seed Admin User

```bash
npm run seed
```

Output:
```
✅ Admin user seeded successfully
Admin credentials:
Email: admin@zamstate.com
Password: Admin@123456
```

### 5. Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected successfully
```

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in 917 ms
  ➜  Local:   http://localhost:5173/
```

## Testing the Full Stack

### 1. Register New User

Visit: `http://localhost:5173/register`

Fill form:
- First Name: John
- Last Name: Doe
- Email: john@example.com
- Phone: +260211234567
- Password: Test@1234
- Select role: Tenant

Expected result:
- User created in MongoDB
- JWT token returned
- Redirected to dashboard
- Toast notification: "Registration successful!"

### 2. Login

Visit: `http://localhost:5173/login`

Use admin credentials:
- Email: `admin@zamstate.com`
- Password: `Admin@123456`

Expected result:
- Token stored in localStorage
- User profile displayed
- Redirected to dashboard

### 3. Create Property (Admin Only)

After logging in as admin, go to Properties page and create a property:
- Title: "Beautiful Apartment in Lusaka"
- Type: Apartment
- Price: 3500
- Location: Lusaka
- Features: 2 bedrooms, 1 bathroom, 80m²

Expected result:
- Loading spinner displayed during upload
- Images uploaded to Cloudinary
- Property listed on page
- Toast notification: "Property created successfully!"

### 4. Test Loading Spinners

Make API calls while watching the UI:
- Register/Login will show button spinner
- Property creation shows full-page loader during image upload
- List views show skeleton or spinner while loading

## API Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zamstate.com",
    "password": "Admin@123456"
  }'
```

### Get Properties
```bash
curl http://localhost:5000/api/properties?page=1&limit=10
```

### Get Profile (requires token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/profile
```

## Cloudinary Setup (Optional for Image Uploads)

1. Sign up: https://cloudinary.com/users/register/free
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `server/.env`

## Troubleshooting

### Frontend can't reach backend

**Problem:** Network errors when calling API
**Solution:**
- Ensure backend is running on port 5000
- Check `CORS_ORIGIN` in `server/.env` includes your frontend URL
- Clear browser cache & localStorage

### MongoDB Connection Error

**Problem:** `MongoError: connect ECONNREFUSED 127.0.0.1:27017`
**Solution:**
- Verify MongoDB is running: `mongosh` or `mongo`
- Check MONGODB_URI in .env
- For cloud: verify IP whitelist in MongoDB Atlas

### Admin Seed Fails

**Problem:** `Authentication failed` or duplicate key error
**Solution:**
```bash
# Clear database (MongoDB)
mongo
# In mongo shell:
use zamstate
db.dropDatabase()

# Then re-run seed:
npm run seed
```

### Images Not Uploading

**Problem:** Cloudinary credentials error
**Solution:**
- Verify credentials in `server/.env`
- Test Cloudinary API: https://cloudinary.com/api_playground
- Check file size (max 10MB default)

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::5000`
**Solution:**
```bash
# macOS/Linux: Find and kill process
lsof -i :5000
kill -9 <PID>

# Windows: Use Task Manager or:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Production Deployment

### Build Frontend
```bash
npm run build
```

### Build Backend
```bash
cd server
npm run build
npm start
```

### Environment Variables for Production

Update `.env` with:
```env
NODE_ENV=production
JWT_SECRET=use_a_strong_random_key
MONGODB_URI=your_production_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
PORT=your_production_port
CORS_ORIGIN=your_production_domain.com
```

## Frontend Features

✅ Responsive design (Bootstrap + custom CSS)
✅ Form validation (React Hook Form + Zod)
✅ Loading spinners during API calls
✅ Toast notifications (react-hot-toast)
✅ Protected routes (authentication)
✅ Animations (Framer Motion)
✅ State management (Zustand)
✅ API client with interceptors

## Backend Features

✅ JWT authentication
✅ Role-based authorization
✅ MongoDB with Mongoose
✅ Image uploads to Cloudinary
✅ Input validation (express-validator)
✅ Error handling middleware
✅ CORS enabled
✅ Admin seeding script

## Common Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production

# Backend
cd server
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm run seed         # Seed admin user
npm start            # Start production server

# Database
npm run migrate      # Run migrations (if set up)
```

## Getting Help

- Check server logs: Terminal running `npm run dev`
- Check browser console: F12 → Console tab
- Check browser network: F12 → Network tab
- MongoDB: `mongosh` to inspect database
- Backend endpoints: http://localhost:5000/api/health

## Next Steps

1. ✅ User authentication working
2. ✅ Admin user seeded
3. ✅ Loading spinners implemented
4. Build remaining API endpoints (Bookings, Messages, Maintenance, Payments)
5. Add real estate search filters
6. Implement payment processing
7. Add image gallery with Cloudinary
8. Deploy to production (Vercel/Netlify frontend, Heroku/Railway backend)

---

**Happy coding! 🚀**
