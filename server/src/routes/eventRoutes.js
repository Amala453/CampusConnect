const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  getMyOrganizedEvents,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes for organizers and admins
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.get(
  '/organizer/my-events',
  protect,
  authorize('organizer', 'admin'),
  getMyOrganizedEvents
);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.patch('/:id/cancel', protect, authorize('organizer', 'admin'), cancelEvent);

module.exports = router;
