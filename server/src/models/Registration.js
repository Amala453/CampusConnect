const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['registered', 'cancelled'],
        message: '{VALUE} is not a valid registration status',
      },
      default: 'registered',
    },
    attended: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations for the same user and event
registrationSchema.index({ student: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ student: 1, status: 1 });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
