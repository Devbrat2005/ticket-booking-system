const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true, // e.g. "P01", "S01", "A1"
    },
    category: {
      type: String,
      enum: ['Premium', 'Standard'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

seatSchema.index({ venueId: 1, label: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
