const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get complete real-time platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const organizersCount = await User.countDocuments({ role: 'organizer' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });

    const totalRegistrations = await Registration.countDocuments({ status: 'registered' });
    const cancelledRegistrations = await Registration.countDocuments({ status: 'cancelled' });
    const totalAttended = await Registration.countDocuments({
      status: 'registered',
      attended: true,
    });

    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((totalAttended / totalRegistrations) * 100)
        : 0;

    // Category breakdown
    const categoryAgg = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: studentsCount,
          organizers: organizersCount,
          admins: adminsCount,
        },
        events: {
          total: totalEvents,
          published: publishedEvents,
          draft: draftEvents,
          cancelled: cancelledEvents,
        },
        registrations: {
          active: totalRegistrations,
          cancelled: cancelledRegistrations,
          attended: totalAttended,
          attendanceRate,
        },
        categoryBreakdown: categoryAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with optional filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { department: searchRegex }];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (e.g., student to organizer or vice versa)
// @route   PATCH /api/admin/users/:userId/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed values: student, organizer, admin.',
      });
    }

    // Protection against self-demotion
    if (req.user._id.toString() === userId && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Self-lockout protection: You cannot demote your own admin account.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (deactivate/activate)
// @route   PATCH /api/admin/users/:userId/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Self-lockout protection
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Self-lockout protection: You cannot deactivate your own admin account.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events across all organizers for administrative oversight
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEventsAdmin = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email department')
      .sort({ createdAt: -1 });

    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const activeRegistrations = await Registration.countDocuments({
          event: ev._id,
          status: 'registered',
        });
        const attendedCount = await Registration.countDocuments({
          event: ev._id,
          status: 'registered',
          attended: true,
        });

        const evObj = ev.toObject();
        evObj.registeredCount = activeRegistrations;
        evObj.attendedCount = attendedCount;
        return evObj;
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate an event (approve, reject, cancel)
// @route   PATCH /api/admin/events/:eventId/moderate
// @access  Private (Admin)
const moderateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { isApproved, status } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (isApproved !== undefined) event.isApproved = Boolean(isApproved);
    if (status && ['draft', 'published', 'cancelled'].includes(status)) {
      event.status = status;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event moderation status updated successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getAllEventsAdmin,
  moderateEvent,
};
