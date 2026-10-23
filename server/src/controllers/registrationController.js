const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register logged-in student for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status !== 'published' || !event.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available for this event.',
      });
    }

    if (new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for an event that has already passed.',
      });
    }

    // Check for existing registration
    let existingRegistration = await Registration.findOne({
      student: studentId,
      event: eventId,
    });

    if (existingRegistration && existingRegistration.status === 'registered') {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }

    // Verify seat capacity atomically
    const currentActiveCount = await Registration.countDocuments({
      event: eventId,
      status: 'registered',
    });

    if (currentActiveCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event capacity reached. No additional seats are currently available.',
      });
    }

    let registration;
    if (existingRegistration && existingRegistration.status === 'cancelled') {
      // Reactivate previous cancelled registration
      existingRegistration.status = 'registered';
      existingRegistration.registeredAt = new Date();
      existingRegistration.attended = false;
      registration = await existingRegistration.save();
    } else {
      registration = await Registration.create({
        student: studentId,
        event: eventId,
        status: 'registered',
      });
    }

    // Keep denormalized count in sync
    event.registeredCount = currentActiveCount + 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a student's event registration
// @route   PATCH /api/registrations/:registrationId/cancel
// @access  Private (Student)
const cancelRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    // Ownership check: must be the student who registered or an admin
    if (
      registration.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot cancel another student’s registration.',
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration is already cancelled.',
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement event registeredCount
    const activeCount = await Registration.countDocuments({
      event: registration.event,
      status: 'registered',
    });

    await Event.findByIdAndUpdate(registration.event, {
      registeredCount: activeCount,
    });

    res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations of the logged-in student
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email department',
        },
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all participants/registrations for a specific event
// @route   GET /api/registrations/events/:eventId/participants
// @access  Private (Organizer, Admin)
const getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Ownership check
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view participants for this event.',
      });
    }

    const participants = await Registration.find({ event: eventId })
      .populate('student', 'name email department studentId')
      .sort({ registeredAt: 1 });

    const totalActive = participants.filter((p) => p.status === 'registered').length;
    const totalAttended = participants.filter((p) => p.status === 'registered' && p.attended).length;

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        capacity: event.capacity,
        totalActive,
        totalAttended,
      },
      count: participants.length,
      participants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark student attendance for an event
// @route   PATCH /api/registrations/:registrationId/attendance
// @access  Private (Organizer, Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { attended } = req.body;

    if (attended === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide attended status (true or false).',
      });
    }

    const registration = await Registration.findById(registrationId).populate('event');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    if (registration.status !== 'registered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot record attendance for a cancelled registration.',
      });
    }

    // Check ownership of event
    if (
      registration.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to mark attendance for this event.',
      });
    }

    registration.attended = Boolean(attended);
    await registration.save();

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${registration.attended ? 'Present' : 'Absent'}.`,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
  markAttendance,
};
