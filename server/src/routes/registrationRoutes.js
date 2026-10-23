const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
  markAttendance,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// Student routes
router.post('/:eventId', protect, authorize('student'), registerForEvent);
router.patch('/:registrationId/cancel', protect, authorize('student', 'admin'), cancelRegistration);
router.get('/my-registrations', protect, authorize('student'), getMyRegistrations);

// Organizer & Admin routes
router.get(
  '/events/:eventId/participants',
  protect,
  authorize('organizer', 'admin'),
  getEventParticipants
);
router.patch(
  '/:registrationId/attendance',
  protect,
  authorize('organizer', 'admin'),
  markAttendance
);

module.exports = router;
