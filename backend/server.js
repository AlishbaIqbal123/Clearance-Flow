/**
 * University Clearance Management System
 * Main Server Entry Point
 * 
 * @author University IT Department
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const studentRoutes = require('./routes/student.routes');
const departmentRoutes = require('./routes/department.routes');
const clearanceRoutes = require('./routes/clearance.routes');
const adminRoutes = require('./routes/admin.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const communicationRoutes = require('./routes/communication.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { authenticate } = require('./middleware/auth.middleware');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time updates
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting — relaxed for development; tighten in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost during development
    const ip = req.ip || req.connection?.remoteAddress || '';
    return process.env.NODE_ENV !== 'production' && (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');
  }
});
app.use('/api/', limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'University Clearance Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      students: '/api/students',
      departments: '/api/departments',
      clearance: '/api/clearance',
      admin: '/api/admin',
      analytics: '/api/analytics',
      communication: '/api/communication'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/students', authenticate, studentRoutes);
app.use('/api/departments', authenticate, departmentRoutes);
app.use('/api/clearance', authenticate, clearanceRoutes);
app.use('/api/clearance-requests', authenticate, clearanceRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/communication', authenticate, communicationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'University Clearance Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room based on user role and ID
  socket.on('join', (data) => {
    const { userId, role, departmentId } = data;
    
    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);
    if (departmentId) socket.join(`dept:${departmentId}`);
    
    console.log(`Socket ${socket.id} joined rooms:`, { userId, role, departmentId });
  });

  // Handle clearance status updates
  socket.on('clearance-update', (data) => {
    socket.to(`user:${data.studentId}`).emit('clearance-status-changed', data);
    socket.to(`dept:${data.departmentId}`).emit('new-clearance-request', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error Handling Middleware
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
  =========================================
  🎓 University Clearance Management System
  =========================================
  Server running on port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  API URL: http://localhost:${PORT}/api
  Health Check: http://localhost:${PORT}/health
  Database: Supabase (PostgreSQL)
  =========================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = { app, io };