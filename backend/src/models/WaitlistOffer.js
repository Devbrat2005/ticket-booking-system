const mongoose = require('mongoose');

const waitlistOfferSchema = new mongoose.Schema(
  {
    waitlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Waitlist',
      required: true,
      index: true,
    },
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
    showSeatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShowSeat',
      required: true,
    },
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
    },
    category: {
      type: String,
      enum: ['Premium', 'Standard'],
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    status: {
      type: String,
      enum: ['OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'OFFERED',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WaitlistOffer', waitlistOfferSchema);
