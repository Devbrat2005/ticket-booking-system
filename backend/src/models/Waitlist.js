const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Premium', 'Standard'],
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['WAITING', 'OFFERED', 'EXPIRED', 'FULFILLED', 'CANCELLED'],
      default: 'WAITING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

waitlistSchema.index({ eventId: 1, category: 1, status: 1, position: 1 });
waitlistSchema.index({ customerId: 1, eventId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
