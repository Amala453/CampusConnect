require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

let server = null;

const startServer = async () => {
  // Connect to MongoDB before starting to accept HTTP requests
  try {
    await connectDB();
  } catch (err) {
    console.error(
      `[Server Startup Error] Could not establish initial database connection: ${err.message}`
    );
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[Server] Starting HTTP listener in degraded state to serve health checks while database recovers.'
      );
    }
  }

  server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` CampusConnect API Server Running`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  return server;
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception] ${err.name}: ${err.message}`);
});

module.exports = app;
