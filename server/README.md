# ZAMSTATE Backend Server

Express.js + MongoDB + TypeScript real estate API server

## Features

- 🔐 JWT Authentication & Authorization
- 📁 MongoDB with Mongoose ORM
- ☁️ Cloudinary Integration for Image Uploads
- 🏠 Property Management CRUD
- 📅 Bookings System
- 💬 Messaging Platform
- 🔧 Maintenance Requests
- 💳 Payment Tracking
- 👤 User Management with Roles
- ✅ Input Validation
- 🚀 Async Error Handling

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- Cloudinary Account (optional, for image uploads)

### Environment Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your `.env` file:**
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/zamstate

   # JWT
   JWT_SECRET=your_secure_secret_key_here
   JWT_EXPIRES_IN=7d

   # Cloudinary (Get credentials from: https://cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Server
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174
   ```

3. **Install MongoDB locally (if not using cloud):**
   - Download from: https://www.mongodb.com/try/download/community
   - Start MongoDB: `mongod`

### Install Dependencies

```bash
cd server
npm install
```

### Seed Admin User

```bash
npm run seed
```

This creates an admin account:
- **Email:** `admin@zamstate.com`
- **Password:** `Admin@123456`

### Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
 - `POST /api/auth/request-password-reset` - Request password reset (body: `{ email }`)
 - `POST /api/auth/reset-password` - Reset password (body: `{ token, password }`)
 - `GET /api/auth/verify-email?token=...` - Verify user email via token (redirects to frontend)
 - `POST /api/auth/resend-verification` - Resend verification email (body: `{ email }`)

### Properties
- `GET /api/properties` - List all properties (with pagination & filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (requires auth)
- `PUT /api/properties/:id` - Update property (requires auth)
- `DELETE /api/properties/:id` - Delete property (requires auth)
- `GET /api/properties/:id/bookings` - Get property bookings

## API Request Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zamstate.com",
    "password": "Admin@123456"
  }'
```

### Get Properties (with filters)
```bash
curl http://localhost:5000/api/properties?type=apartment&township=Lusaka&page=1&limit=10
```

### Create Property
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Modern Apartment",
    "description": "Beautiful 2-bedroom apartment",
    "price": 3500,
    "currency": "ZMW",
    "type": "apartment",
    "location": {
      "address": "123 Main Street",
      "township": "Lusaka",
      "city": "Lusaka",
      "province": "Lusaka"
    }
  }'
```

## Database Models

### User
- email, firstName, lastName, phone
- password (hashed)
- role: tenant | owner | agent | investor | admin
- isVerified, avatar, bio

### Property
- title, description, price, currency
- type: apartment | house | office | land | commercial
- status: available | rented | sold | maintenance
- location, features, images, videos
- owner, agent references

### Booking
- property, tenant, agent references
- date, time, status, notes

### Message & Conversation
- conversationId, sender, content
- attachments with Cloudinary URLs
- readBy tracking

### Maintenance Request
- property, tenant references
- title, description, priority, category
- status, images, assignedTo, costs

### Payment
- amount, currency, type, method
- status: pending | processing | completed | failed | refunded
- payer, payee, property/booking/maintenance references

## Build & Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` or `mongo`
- Check `MONGODB_URI` in `.env`
- Ensure port 27017 is not blocked

### Cloudinary Upload Errors
- Verify credentials in `.env`
- Check file size limits
- Ensure CORS is configured on Cloudinary

### JWT Token Errors
- Token may be expired (check `JWT_EXPIRES_IN`)
- Verify `JWT_SECRET` matches in all requests
- Clear browser storage and login again

## Technologies

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Cloudinary** - Cloud storage
- **Multer** - File uploads
- **TypeScript** - Type safety
- **Express-validator** - Input validation

## Email / SMTP Setup

This project uses Nodemailer with Brevo (Sendinblue) SMTP by default. Set the following environment variables in your `.env`:

```env
# Brevo SMTP
BREVO_USER=your_brevo_smtp_username
BREVO_PASS=your_brevo_smtp_password_or_api_key
BREVO_FROM=verified-sender@example.com
BREVO_HOST=smtp-relay.brevo.com
BREVO_PORT=587

# Frontend client URL (used for links in emails)
CLIENT_URL=http://localhost:5173
```

Notes:
- Use `BREVO_FROM` as a verified sender in your Brevo account.
- Tokens: password reset tokens expire in 15 minutes; verification tokens expire in 24 hours.
- For higher volume, upgrade your Brevo plan — the code works with SMTP credentials regardless of tier.

## License

MIT
