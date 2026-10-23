const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all published events with filtering, search, and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { search, category, upcoming, page = 1, limit = 10 } = req.query;

    const query = {
      status: 'published',
      isApproved: true,
    };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter upcoming only (by default or if requested)
    if (upcoming === 'true' || upcoming === undefined) {
      // Show events from today onwards
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      query.date = { $gte: startOfToday };
    }

    // Search in title and description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { venue: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email department')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name email department'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found with the requested ID.',
      });
    }

    // Calculate real-time active registration count
    const activeRegistrations = await Registration.countDocuments({
      event: event._id,
      status: 'registered',
    });

    const eventData = event.toObject();
    eventData.registeredCount = activeRegistrations;
    eventData.availableSeats = Math.max(0, event.capacity - activeRegistrations);

    res.status(200).json({
      success: true,
      event: eventData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, venue, capacity, status } = req.body;

    if (!title || !description || !category || !date || !time || !venue || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, date, time, venue, capacity.',
      });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date format.',
      });
    }

    // Ensure capacity is a valid positive integer
    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Event capacity must be a positive number of seats.',
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      date: eventDate,
      time: time.trim(),
      venue: venue.trim(),
      capacity: parsedCapacity,
      organizer: req.user._id,
      status: status === 'draft' ? 'draft' : 'published',
      isApproved: true,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer, Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Ownership check: must be the organizer who created it OR an admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to modify this event.',
      });
    }

    const { title, description, category, date, time, venue, capacity, status } = req.body;

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (category) event.category = category;
    if (date) event.date = new Date(date);
    if (time) event.time = time.trim();
    if (venue) event.venue = venue.trim();
    if (status) event.status = status;

    if (capacity !== undefined) {
      const parsedCapacity = parseInt(capacity, 10);
      if (isNaN(parsedCapacity) || parsedCapacity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be at least 1.',
        });
      }
      // Ensure capacity is not reduced below already registered count
      const activeRegistrations = await Registration.countDocuments({
        event: event._id,
        status: 'registered',
      });
      if (parsedCapacity < activeRegistrations) {
        return res.status(400).json({
          success: false,
          message: `Cannot lower capacity to ${parsedCapacity}. There are already ${activeRegistrations} active registrations.`,
        });
      }
      event.capacity = parsedCapacity;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an event
// @route   PATCH /api/events/:id/cancel
// @access  Private (Organizer, Admin)
const cancelEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to cancel this event.',
      });
    }

    event.status = 'cancelled';
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event marked as cancelled.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events created by the logged in organizer
// @route   GET /api/events/organizer/my-events
// @access  Private (Organizer, Admin)
const getMyOrganizedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ date: -1 });

    // Fetch registration and attendance metrics for each event
    const eventsWithMetrics = await Promise.all(
      events.map(async (ev) => {
        const totalRegistered = await Registration.countDocuments({
          event: ev._id,
          status: 'registered',
        });
        const totalAttended = await Registration.countDocuments({
          event: ev._id,
          status: 'registered',
          attended: true,
        });

        const evObj = ev.toObject();
        evObj.registeredCount = totalRegistered;
        evObj.attendedCount = totalAttended;
        evObj.availableSeats = Math.max(0, ev.capacity - totalRegistered);
        return evObj;
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithMetrics.length,
      events: eventsWithMetrics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  getMyOrganizedEvents,
};
