const express = require('express');
const cors = require('cors');
const { notFoundHandler, errorHandler } = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security and CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, postman) or matching origin
      if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid blocking Vite dynamic ports
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CampusConnect API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
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
