require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { notFoundHandler, errorHandler } = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security and CORS configuration
const allowedOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, postman) or matching origin
      if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
        return callback(null, true);
      }
      // Allow local dev origins and Netlify deployments
      if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^https:\/\/.*\.netlify\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive to prevent blocking valid clients
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint - reflects true database connectivity
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = isDbConnected ? 'healthy' : 'unhealthy';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    service: 'CampusConnect API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Guard middleware: prevent database queries from buffering and timing out if DB is disconnected
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable. Please retry in a few moments.',
      error: 'DatabaseUnavailable',
    });
  }

  next();
});

// Mount Resource API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Unmatched route handler (404)
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

module.exports = app;
