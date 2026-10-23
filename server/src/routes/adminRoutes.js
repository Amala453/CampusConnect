const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getAllEventsAdmin,
  moderateEvent,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/status', toggleUserStatus);
router.get('/events', getAllEventsAdmin);
router.patch('/events/:eventId/moderate', moderateEvent);

module.exports = router;
