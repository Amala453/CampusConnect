const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: [
          'Technical',
          'Cultural',
          'Sports',
          'Workshop',
          'Seminar',
          'Club Activity',
          'Other',
        ],
        message: '{VALUE} is not a supported event category',
      },
      default: 'Technical',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required (e.g. 10:00 AM)'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1 participant'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event organizer reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'published',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searching and filtering
eventSchema.index({ date: 1, category: 1, status: 1 });
eventSchema.index({ organizer: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
