# 📋 Sistem Monitoring Inquiry

Sistem manajemen inquiry berbasis web untuk perusahaan yang mengelola permintaan pelanggan dengan workflow multi-role dan tracking status yang komprehensif.

## 🎯 **Overview**

Aplikasi ini dirancang untuk mengelola proses inquiry dari awal hingga selesai dengan sistem role-based yang terstruktur:
- **Helpdesk**: Membuat dan mengelola inquiry awal
- **Produksi**: Memproses inquiry teknis
- **QC (Quality Control)**: Melakukan quality assurance
- **Finance**: Mengelola aspek pembayaran

## 🛠️ **Tech Stack**

### Frontend
- **React 18** dengan TypeScript
- **Tailwind CSS** untuk styling
- **React Quill** untuk rich text editor
- **Lucide React** untuk icons
- **Vite** sebagai build tool

### Backend
- **Node.js** dengan Express.js
- **MongoDB** dengan Mongoose ODM
- **JWT** untuk authentication
- **Multer** untuk file upload
- **bcryptjs** untuk password hashing

## ✨ **Fitur Utama**

### 🔐 **Authentication & Authorization**
- Login dengan role-based access
- JWT token authentication
- Password hashing dengan bcrypt

### 📝 **Inquiry Management**
- **Rich Text Editor** untuk deskripsi inquiry
- **File Upload** dengan drag & drop
- **Status Tracking** dengan 9 status berbeda
- **Search & Filter** berdasarkan berbagai kriteria
- **Pagination** untuk handling data besar

### 👥 **Multi-Role Workflow**
- **Helpdesk**: Create, edit, delete inquiry
- **Produksi**: Process inquiry, update status
- **QC**: Quality control dengan 2 level (on going QA, on progress QA)
- **Finance**: Payment management

### 📊 **Dashboard & Reporting**
- **Real-time Statistics** untuk semua status
- **Inquiry Overview** dengan visual cards
- **Status Distribution** tracking

### 📎 **File Management**
- Upload multiple files (PDF, images, documents)
- Secure file storage
- File preview capabilities

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16+)
- MongoDB (local atau MongoDB Atlas)
- npm atau yarn

### Installation

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd inquiry-monitoring-system
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../  # kembali ke root
   npm install
   ```

4. **Environment Configuration:**

   **Backend (.env):**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/inquiry_monitoring
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5000000
   FILE_UPLOAD_PATH=./uploads
   ```

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Setup Database:**
   ```bash
   cd backend
   npm run seed  # Create dummy users
   ```

6. **Start Development Servers:**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

7. **Access Application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 🔑 **Default Login Credentials**

| Role | User ID | Password |
|------|---------|----------|
| Helpdesk | help001 | password123 |
| Produksi | prod001 | password123 |
| QC | qc001 | password123 |
| Finance | fin001 | password123 |

## 📋 **Workflow Inquiry**

```
1. PENDING → 2. PROGRESS → 3. ON GOING QA → 4. ON PROGRESS QA
                    ↓                    ↓
              5. READY FOR UPDATE → 6. PAID OFF → 7. SELESAI
                    ↓
              8. BATAL (dari status manapun)
```

### Status Descriptions:
- **Pending**: Inquiry baru dibuat, menunggu proses
- **Progress**: Sedang diproses oleh produksi
- **On Going QA**: Dalam proses quality assurance awal
- **On Progress QA**: Quality assurance sedang berlangsung
- **Ready for Update**: Siap untuk diupdate oleh QC
- **Paid Off**: Pembayaran sudah lunas
- **Selesai**: Inquiry sudah selesai diproses
- **Batal**: Inquiry dibatalkan

## 📡 **API Documentation**

### Authentication Endpoints
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - Register new user
GET    /api/auth/me            - Get current user
PUT    /api/auth/update-profile - Update user profile
```

### Inquiry Endpoints
```
GET    /api/inquiries           - Get all inquiries (with pagination/filtering)
GET    /api/inquiries/:id       - Get single inquiry
POST   /api/inquiries           - Create new inquiry (Helpdesk only)
PUT    /api/inquiries/:id       - Update inquiry
DELETE /api/inquiries/:id       - Delete inquiry (Helpdesk only)
GET    /api/inquiries/stats/overview - Get statistics
```

### File Upload Endpoints
```
POST   /api/upload/single       - Upload single file
POST   /api/upload/multiple     - Upload multiple files
DELETE /api/upload/:filename    - Delete uploaded file
```

### Request/Response Examples

**Login:**
```json
POST /api/auth/login
{
  "user_id": "help001",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "user_id": "help001",
      "name": "Lisa Helpdesk",
      "role": "helpdesk"
    },
    "token": "jwt_token_here"
  }
}
```

**Create Inquiry:**
```json
POST /api/inquiries
Authorization: Bearer <jwt_token>
{
  "nomor_whatsapp_customer": "081234567890",
  "nama_toko": "Toko Berkah Jaya",
  "deskripsi": "<p>Permintaan sistem kasir...</p>",
  "type": "berbayar",
  "fee": 500000
}
```

## 🗄️ **Database Schema**

### User Collection
```javascript
{
  user_id: String,     // Unique identifier
  name: String,        // Full name
  role: String,        // produksi|qc|finance|helpdesk
  password: String,    // Hashed password
  isActive: Boolean,   // Account status
  timestamps: true     // createdAt, updatedAt
}
```

### Inquiry Collection
```javascript
{
  nomor_whatsapp_customer: String,
  nama_toko: String,
  deskripsi: String,           // HTML content
  status: String,              // Current status
  type: String,                // berbayar|gratis
  fee: Number,                 // Price if berbayar
  divisi: String,              // Current division
  divisi_notes: String,        // Division notes
  attachments: [{              // File attachments
    id: String,
    name: String,
    url: String,
    type: String,             // pdf|image
    size: Number
  }],
  // Tracking fields
  created_by: String,
  qc_by: String,
  produksi_by: String,
  finance_by: String,
  helpdesk_by: String,
  edited_by: String,
  edited_at: Date,
  timestamps: true
}
```

## 🎨 **UI/UX Features**

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts untuk berbagai screen size
- Touch-friendly interactions

### Modern UI Components
- Clean card-based layouts
- Consistent color schemes per status
- Smooth animations dan transitions
- Custom dropdowns tanpa native browser styling

### User Experience
- Real-time form validation
- Loading states dan error handling
- Intuitive navigation
- Contextual action menus

## 🔧 **Development**

### Project Structure
```
inquiry-monitoring-system/
├── backend/                    # Express.js API server
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth middleware
│   ├── uploads/               # File storage
│   ├── server.js              # Main server
│   └── package.json
├── src/                       # React frontend
│   ├── components/            # React components
│   ├── context/               # React context
│   ├── data/                  # Dummy data
│   ├── types/                 # TypeScript types
│   └── main.tsx               # App entry point
├── public/                    # Static assets
├── package.json               # Frontend dependencies
└── README.md
```

### Available Scripts

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend:**
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm run seed     # Seed database with dummy data
```

## 🚀 **Deployment**

### Backend Deployment
1. Setup MongoDB database (local atau cloud)
2. Configure environment variables
3. Build and deploy to server (Heroku, Railway, VPS, etc.)
4. Setup reverse proxy (nginx) jika perlu

### Frontend Deployment
1. Build production assets: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure API base URL untuk production

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong_production_secret_key
VITE_API_URL=https://your-api-domain.com/api

# Frontend
VITE_API_URL=https://your-api-domain.com/api
```

## 🔒 **Security Features**

- **JWT Authentication** dengan expiration
- **Password Hashing** menggunakan bcrypt
- **Input Validation** dengan express-validator
- **File Upload Security** dengan type/size validation
- **CORS Configuration** untuk cross-origin requests
- **Role-based Access Control** untuk API endpoints

## 📈 **Performance Optimizations**

- **Database Indexing** untuk query optimization
- **Pagination** untuk handling large datasets
- **File Compression** untuk uploads
- **Lazy Loading** untuk components
- **Code Splitting** untuk bundle optimization

## 🐛 **Troubleshooting**

### Common Issues

**MongoDB Connection Error:**
- Pastikan MongoDB service sedang running
- Check MONGODB_URI di .env file
- Untuk MongoDB Atlas, pastikan IP whitelist sudah dikonfigurasi

**JWT Token Issues:**
- Pastikan JWT_SECRET sudah dikonfigurasi
- Check token expiration (default 7 hari)

**File Upload Issues:**
- Pastikan folder `uploads/` memiliki write permission
- Check MAX_FILE_SIZE configuration

**CORS Issues:**
- Pastikan frontend URL sudah ditambahkan di CORS configuration

## 🤝 **Contributing**

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

Untuk pertanyaan atau support, silakan hubungi tim development atau buat issue di repository ini.

---

**Built with ❤️ for efficient inquiry management workflow**