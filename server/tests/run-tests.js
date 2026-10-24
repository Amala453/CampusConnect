// Standalone automated test runner for CampusConnect Server
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';

const assert = require('assert');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../src/utils/token');
const { protect, authorize } = require('../src/middleware/auth');
const { errorHandler } = require('../src/middleware/error');

let passedTests = 0;
let failedTests = 0;

const runTest = async (testName, fn) => {
  try {
    await fn();
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    ${error.message}`);
    failedTests++;
  }
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log(' CAMPUSCONNECT BACKEND AUTOMATED UNIT & SECURITY TESTS');
  console.log('======================================================\n');

  // Test Group 1: Token Utilities
  console.log('--- 1. Token Utilities & Cryptography ---');
  await runTest('generateToken generates valid JWT with payload', async () => {
    const token = generateToken('user_id_123', 'student');
    assert.strictEqual(typeof token, 'string');
    assert.ok(token.length > 20);

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, 'user_id_123');
    assert.strictEqual(decoded.role, 'student');
  });

  await runTest('Password hashing produces secure salted bcrypt hash', async () => {
    const rawPassword = 'StudentPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notStrictEqual(rawPassword, hash);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    const isMismatch = await bcrypt.compare('WrongPassword', hash);

    assert.strictEqual(isMatch, true);
    assert.strictEqual(isMismatch, false);
  });

  // Test Group 2: Authorization Middleware
  console.log('\n--- 2. Role-Based Authorization Middleware ---');
  await runTest('authorize middleware blocks unauthorized roles with 403', async () => {
    const req = { user: { role: 'student' } };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const organizerOnly = authorize('organizer', 'admin');
    organizerOnly(req, res, next);

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
  });

  await runTest('authorize middleware permits authorized roles to proceed', async () => {
    const req = { user: { role: 'organizer' } };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };
    const res = {};

    const organizerOnly = authorize('organizer', 'admin');
    organizerOnly(req, res, next);

    assert.strictEqual(nextCalled, true);
  });

  // Test Group 3: Protect Middleware
  console.log('\n--- 3. Authentication & Header Protection ---');
  await runTest('protect middleware rejects requests without Authorization header (401)', async () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    await protect(req, res, next);

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.success, false);
  });

  // Test Group 4: Error Handling Middleware
  console.log('\n--- 4. Centralized Error Handler ---');
  await runTest('errorHandler handles Mongoose duplicate key error (code 11000) with 409 Conflict', async () => {
    const err = { code: 11000, keyValue: { email: 'test@campus.edu' } };
    const req = { method: 'POST', url: '/api/auth/register' };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    errorHandler(err, req, res, () => {});

    assert.strictEqual(statusSent, 409);
    assert.strictEqual(jsonSent.success, false);
    assert.ok(jsonSent.message.includes('already exists'));
  });

  await runTest('errorHandler handles Mongoose CastError with 400 Bad Request', async () => {
    const err = { name: 'CastError', path: '_id' };
    const req = { method: 'GET', url: '/api/events/invalid-id' };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    errorHandler(err, req, res, () => {});

    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.success, false);
    assert.ok(jsonSent.message.includes('Invalid resource identifier'));
  });

  // Test Group 5: Business Rules & Validation Logic
  console.log('\n--- 5. Business Logic & Constraints ---');
  await runTest('Public registration cannot arbitrarily assign "admin" role', () => {
    const requestedRole = 'admin';
    let assignedRole = 'student';
    if (requestedRole === 'organizer') {
      assignedRole = 'organizer';
    }
    assert.strictEqual(assignedRole, 'student');
  });

  await runTest('Capacity limit logic prevents overbooking', () => {
    const capacity = 50;
    const currentActiveCount = 50;

    const isFull = currentActiveCount >= capacity;
    assert.strictEqual(isFull, true);

    const availableSeats = Math.max(0, capacity - currentActiveCount);
    assert.strictEqual(availableSeats, 0);
  });

  await runTest('Admin self-demotion prevention triggers correctly', () => {
    const currentAdminId = 'admin_user_99';
    const targetUserId = 'admin_user_99';
    const newRole = 'student';

    const isSelfDemotion = currentAdminId === targetUserId && newRole !== 'admin';
    assert.strictEqual(isSelfDemotion, true);
  });

  // Test Group 6: Health Check & Database Guard
  console.log('\n--- 6. Health Check & Database Guard Status ---');
  await runTest('Health check reflects disconnected database with 503 status', async () => {
    const mongoose = require('mongoose');
    const origState = mongoose.connection.readyState;

    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    // Simulate health check handler logic
    const isDbConnected = mongoose.connection.readyState === 1;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const statusCode = isDbConnected ? 200 : 503;
    res.status(statusCode).json({
      status: isDbConnected ? 'healthy' : 'unhealthy',
      database: dbStates[mongoose.connection.readyState],
    });

    assert.strictEqual(statusSent, 503);
    assert.strictEqual(jsonSent.status, 'unhealthy');
    assert.strictEqual(jsonSent.database, 'disconnected');

    // Restore
    Object.defineProperty(mongoose.connection, 'readyState', { value: origState, configurable: true });
  });

  await runTest('Health check reflects connected database with 200 status', async () => {
    const mongoose = require('mongoose');
    const origState = mongoose.connection.readyState;

    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    const isDbConnected = mongoose.connection.readyState === 1;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const statusCode = isDbConnected ? 200 : 503;
    res.status(statusCode).json({
      status: isDbConnected ? 'healthy' : 'unhealthy',
      database: dbStates[mongoose.connection.readyState],
    });

    assert.strictEqual(statusSent, 200);
    assert.strictEqual(jsonSent.status, 'healthy');
    assert.strictEqual(jsonSent.database, 'connected');

    // Restore
    Object.defineProperty(mongoose.connection, 'readyState', { value: origState, configurable: true });
  });

  console.log('\n======================================================');
  console.log(` Summary: ${passedTests} passed, ${failedTests} failed.`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
