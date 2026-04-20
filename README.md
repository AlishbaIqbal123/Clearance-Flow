# University Clearance Management System

A comprehensive, production-ready web application for managing student clearance processes across multiple university departments. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with optional Supabase integration.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-v18+-green.svg)

---

## Features

### Multi-Role Authentication System
- **Admin**: Full system control, analytics, user management
- **Students**: Clearance submission, status tracking, department contact
- **Department Staff**: Request review, approval/rejection with remarks
- **HODs**: Department oversight, student management

### Clearance Workflow
- Step-by-step clearance process across departments
- Real-time status updates
- Progress tracking with visual indicators
- Document upload and management
- Comment system for communication

### Department Management
- Configurable departments (Academic, Finance, Library, Transport, Hostel, etc.)
- Custom clearance requirements per department
- Contact information with WhatsApp/email integration
- Office hours and location details

### Communication System
- Email notifications for status changes
- WhatsApp click-to-chat integration
- In-app messaging and comments
- Bulk notification system

### Analytics & Reporting
- Dashboard with key metrics
- Department-wise statistics
- Processing time analytics
- Exportable reports (CSV/JSON)

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Password encryption with bcrypt
- Account lockout after failed attempts
- Input validation and sanitization

---

## Tech Stack

### Frontend
- React.js 18+
- TypeScript
- Vite (Build tool)
- Tailwind CSS
- shadcn/ui components
- Socket.io-client (Real-time updates)

### Backend
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io (Real-time communication)
- Multer (File uploads)

### Optional Integrations
- **Supabase**: Authentication, real-time database, storage
- **Google Apps Script**: Email automation
- **Cloudinary**: File storage
- **Nodemailer**: Email notifications

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB v6 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/university-clearance-system.git
cd university-clearance-system
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

4. **Seed Database (Optional)**
```bash
cd backend
npm run seed
```

### Default Login Credentials (Demo/Seeding)

| Role | Username (Email/ID) | Initial Password | Login Pattern |
|------|----------|----------|---------------|
| **Admin** | `admin@university.edu.pk` | `Admin@123` | Email + Secret Password |
| **Staff** | `ahmed.khan@university.edu.pk` | `Staff@123` | Email + Assigned Password |
| **Student** | `student1@university.edu.pk` | `FA20-BCS-001` | **Email** + **Registration Number** |

> [!NOTE]
> For students, the default login pattern uses the **assigned university email** as the username and their **Registration Number** (e.g., FA20-BCS-001) as the initial password. Students are prompted to change their password upon first login.

---

## Project Structure

```
university-clearance-system/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── utils/            # Helper functions
│   ├── .env.example      # Environment template
│   ├── package.json
│   └── server.js         # Entry point
│
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── sections/     # Page sections
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── documentation/
│   ├── API_DOCUMENTATION.md
│   ├── SUPABASE_INTEGRATION_GUIDE.md
│   ├── GOOGLE_APPS_SCRIPT_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
│
└── README.md
```

---

## API Documentation

Comprehensive API documentation is available in [documentation/API_DOCUMENTATION.md](documentation/API_DOCUMENTATION.md).

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Staff/Admin login |
| `/api/auth/student/login` | POST | Student login |
| `/api/auth/change-password` | POST | Change password |
| `/api/admin/dashboard` | GET | Admin dashboard stats |
| `/api/admin/students` | GET/POST | Student management |
| `/api/admin/departments` | GET/POST | Department management |
| `/api/students/dashboard` | GET | Student dashboard |
| `/api/students/clearance-request` | POST | Submit clearance |
| `/api/departments/requests` | GET | Department requests |
| `/api/departments/requests/:id/status` | PUT | Update status |
| `/api/clearance/statistics` | GET | Clearance stats |
| `/api/analytics/overview` | GET | Analytics overview |

---

## Database Schema

### Core Collections

#### Users (Staff/Admin)
- Personal information
- Role and department assignment
- Authentication details
- Account status

#### Students
- Academic information
- Contact details
- Clearance status
- Department association

#### Departments
- Department details
- Contact information
- Clearance configuration
- Staff assignments

#### Clearance Requests
- Request lifecycle
- Department-wise status
- Documents and comments
- Timeline tracking

---

## Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/university_clearance
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## System Handover & Production Setup

To hand over the system to university authorities, follow these transition steps:

### 1. Administrative Account Transfer
- **Update Admin Email**: Change the default `admin@university.edu.pk` to the official university registrar or IT head's email.
- **Reset Password**: Generate a new, high-entropy password for the primary admin account.
- **Role Assignment**: Use the Admin Dashboard to create accounts for specific HODs and Department Officers using their official credentials.

### 2. Student Data Integration
- **Bulk Import**: Use the `.csv` bulk import feature in the Admin Dashboard to populate the system with actual student records.
- **Login Pattern**: Ensure all imported students are aware of the login standard:
    - **Username**: Official University Email
    - **Default Password**: Student Registration Number
- **First Login Policy**: The system is configured with `isFirstLogin: true` by default, forcing students to set a private password immediately.

### 3. Production Infrastructure
- **Supabase Hardening**: Run the `supabase_hardening.sql` script to enable Row Level Security (RLS) and optimize database performance.
- **Environment Variables**: Update `.env` files with production-grade secrets, official SMTP (email) credentials, and the live domain URL.
- **SSL/HTTPS**: Ensure the Vercel deployment or custom server has SSL certificates active for secure data transmission.

### 4. Department Configuration
- Assign official department heads (HODs) to their respective modules (Finance, Library, etc.).
- Update contact numbers and WhatsApp links for real-time student support.

---

## Deployment

Detailed deployment instructions are available in [documentation/DEPLOYMENT_GUIDE.md](documentation/DEPLOYMENT_GUIDE.md).

### Quick Deployment Steps

1. **Prepare Server**
   - Ubuntu 22.04 LTS recommended
   - Node.js 18+, MongoDB 6+
   - Nginx reverse proxy

2. **Deploy Backend**
```bash
cd backend
npm install --production
pm2 start ecosystem.config.js
```

3. **Deploy Frontend**
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder via Nginx
```

4. **Setup SSL**
```bash
sudo certbot --nginx -d your-domain.com
```

---

## Integration Guides

### Supabase Integration
For authentication, real-time features, and storage: [SUPABASE_INTEGRATION_GUIDE.md](documentation/SUPABASE_INTEGRATION_GUIDE.md)

### Google Apps Script
For university email automation: [GOOGLE_APPS_SCRIPT_GUIDE.md](documentation/GOOGLE_APPS_SCRIPT_GUIDE.md)

---

## Screenshots

### Admin Dashboard
- Analytics overview
- User management
- Department configuration
- Clearance monitoring

### Student Portal
- Clearance submission
- Status tracking
- Department contact
- Document upload

### Department Portal
- Request queue
- Approval workflow
- Student verification
- Communication tools

---

## Security

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Account lockout after 5 failed attempts
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

---

## Performance

- Database indexing for fast queries
- Pagination for large datasets
- Gzip compression
- Static asset caching
- PM2 cluster mode for multi-core utilization

---

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support, email support@university.edu.pk or join our Slack channel.

---

## Acknowledgments

- Built for universities and educational institutions
- Inspired by modern clearance management needs
- Designed with scalability and security in mind

---

*Last Updated: April 2024*