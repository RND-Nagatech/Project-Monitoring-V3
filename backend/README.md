# Inquiry Monitoring System - Backend

Backend API untuk sistem monitoring inquiry menggunakan Node.js, Express.js, dan MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 atau lebih baru)
- MongoDB (local atau MongoDB Atlas)
- npm atau yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env` file dan sesuaikan konfigurasi
   - Pastikan MongoDB URI sudah benar

3. **Seed Database (Opsional):**
   ```bash
   npm run seed
   ```

4. **Start Server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

Server akan berjalan di `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/update-profile` - Update user profile

### Inquiries
- `GET /api/inquiries` - Get all inquiries (dengan pagination & filtering)
- `GET /api/inquiries/:id` - Get single inquiry
- `POST /api/inquiries` - Create new inquiry (Helpdesk only)
- `PUT /api/inquiries/:id` - Update inquiry
- `DELETE /api/inquiries/:id` - Delete inquiry (Helpdesk only)
- `GET /api/inquiries/stats/overview` - Get inquiry statistics

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete uploaded file

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Sertakan token di header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 User Roles & Permissions

1. **Helpdesk** - Membuat dan mengelola inquiry
2. **Produksi** - Memproses inquiry teknis
3. **QC** - Quality control dan testing
4. **Finance** - Mengelola pembayaran

## 🗃️ Database Schema

### User
```javascript
{
  user_id: String (unique),
  name: String,
  role: Enum ['produksi', 'qc', 'finance', 'helpdesk'],
  password: String (hashed),
  isActive: Boolean
}
```

### Inquiry
```javascript
{
  nomor_whatsapp_customer: String,
  nama_toko: String,
  deskripsi: String,
  status: Enum [...],
  type: Enum ['berbayar', 'gratis'],
  fee: Number,
  divisi: String,
  divisi_notes: String,
  attachments: Array,
  created_by: String,
  // ... role tracking fields
}
```

## 🛠️ Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server dengan nodemon
- `npm run seed` - Seed database dengan dummy users

### Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/inquiry_monitoring
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
MAX_FILE_SIZE=5000000
FILE_UPLOAD_PATH=./uploads
```

## 📁 Project Structure
```
backend/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # Uploaded files
├── server.js        # Main server file
├── seed.js          # Database seeder
├── .env             # Environment variables
└── package.json
```

## 🔍 Testing API

Gunakan tools seperti Postman atau Thunder Client untuk testing API endpoints.

**Login Example:**
```json
POST /api/auth/login
{
  "user_id": "help001",
  "password": "password123"
}
```

## 🚨 Error Handling

API mengembalikan response dengan format konsisten:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {...}, // jika success
  "errors": [...] // jika validation error
}
```

## 📝 Notes

- Pastikan MongoDB sudah running sebelum start server
- File uploads disimpan di folder `uploads/`
- JWT token expire dalam 7 hari (dapat dikonfigurasi)
- Password di-hash menggunakan bcrypt