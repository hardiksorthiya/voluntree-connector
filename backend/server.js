const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Volunteer Connect API Server',
    version: '1.0.0',
    status: 'running',
    docs: '/apis-docs'
  });
});

// API Documentation Route
app.get('/apis-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// Health Check Routes
app.use('/api/health', require('./routes/health'));

// API Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes registered');
} catch (error) {
  console.error('❌ Error loading auth routes:', error);
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✅ Users routes registered');
} catch (error) {
  console.error('❌ Error loading users routes:', error);
}

try {
  app.use('/api/permissions', require('./routes/permissions'));
  console.log('✅ Permissions routes registered');
} catch (error) {
  console.error('❌ Error loading permissions routes:', error);
}

try {
  app.use('/api/roles', require('./routes/roles'));
  console.log('✅ Roles routes registered');
} catch (error) {
  console.error('❌ Error loading roles routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler - must be last
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  // Don't log 404 for static files or favicon
  if (!req.path.includes('.') && req.path !== '/favicon.ico') {
    console.log(`   Available API routes: /api/auth, /api/users, /api/permissions, /api/roles`);
  }
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/apis-docs`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🏠 API Root: http://localhost:${PORT}/api`);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error(`\n💡 Solutions:`);
    console.error(`   1. Kill the process using port ${PORT}:`);
    console.error(`      Windows: netstat -ano | findstr :${PORT}`);
    console.error(`      Then: taskkill /PID <PID> /F`);
    console.error(`   2. Or use a different port by setting PORT in .env file`);
    console.error(`   3. Or change the port in server.js\n`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

