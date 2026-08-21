const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    seatLayout: {
      totalRows: { type: Number, required: true },
      seatsPerRow: { type: Number, required: true },
      categoryConfig: [
        {
          category: { type: String, enum: ['Premium', 'Standard'], required: true },
          rows: [{ type: String }], // e.g. ['A', 'B']
        },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venue', venueSchema);
