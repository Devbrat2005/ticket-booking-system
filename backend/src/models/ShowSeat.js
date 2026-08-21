const mongoose = require('mongoose');

const showSeatSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
      index: true,
    },
    row: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Premium', 'Standard'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'HELD', 'BOOKED'],
      default: 'AVAILABLE',
      required: true,
      index: true,
    },
    holdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

showSeatSchema.index({ eventId: 1, seatId: 1 }, { unique: true });
showSeatSchema.index({ eventId: 1, status: 1 });
showSeatSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model('ShowSeat', showSeatSchema);
