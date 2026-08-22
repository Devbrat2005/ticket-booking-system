const Venue = require('../models/Venue');
const Seat = require('../models/Seat');
const Event = require('../models/Event');

const createVenue = async (req, res, next) => {
  try {
    const { name, location, description, seatLayout } = req.body;

    if (!name || !location || !seatLayout || !seatLayout.totalRows || !seatLayout.seatsPerRow) {
      return res.status(400).json({
        success: false,
        message: 'Name, location, totalRows, and seatsPerRow are required',
      });
    }

    const venue = await Venue.create({
      name,
      location,
      description: description || '',
      seatLayout: {
        totalRows: Number(seatLayout.totalRows),
        seatsPerRow: Number(seatLayout.seatsPerRow),
        categoryConfig: seatLayout.categoryConfig || [
          { category: 'Premium', rows: ['A', 'B'] },
          { category: 'Standard', rows: ['C', 'D', 'E', 'F'] },
        ],
      },
      createdBy: req.user._id,
    });

    // Auto-generate physical Seats for this venue
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, venue.seatLayout.totalRows);
    const seatsToInsert = [];

    const premiumRows = venue.seatLayout.categoryConfig.find((c) => c.category === 'Premium')?.rows || ['A', 'B'];

    for (const row of rows) {
      const category = premiumRows.includes(row) ? 'Premium' : 'Standard';
      for (let num = 1; num <= venue.seatLayout.seatsPerRow; num++) {
        const prefix = category === 'Premium' ? 'P' : 'S';
        const formattedNum = num < 10 ? `0${num}` : `${num}`;
        const label = `${prefix}-${row}${formattedNum}`;
        seatsToInsert.push({
          venueId: venue._id,
          row,
          number: num,
          label,
          category,
        });
      }
    }

    await Seat.insertMany(seatsToInsert);

    res.status(201).json({
      success: true,
      message: 'Venue and physical seats created successfully',
      data: { venue, seatCount: seatsToInsert.length },
    });
  } catch (error) {
    next(error);
  }
};

const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { venues },
    });
  } catch (error) {
    next(error);
  }
};

const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    const seats = await Seat.find({ venueId: venue._id }).sort({ row: 1, number: 1 });

    res.json({
      success: true,
      data: { venue, seats },
    });
  } catch (error) {
    next(error);
  }
};

const updateVenue = async (req, res, next) => {
  try {
    const { name, location, description } = req.body;
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (name) venue.name = name;
    if (location) venue.location = location;
    if (description !== undefined) venue.description = description;

    await venue.save();

    res.json({
      success: true,
      message: 'Venue updated successfully',
      data: { venue },
    });
  } catch (error) {
    next(error);
  }
};

const deleteVenue = async (req, res, next) => {
  try {
    const venueId = req.params.id;

    // Check if any events reference this venue
    const activeEvents = await Event.countDocuments({ venueId, status: { $ne: 'CANCELLED' } });
    if (activeEvents > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete venue that has active events assigned to it',
      });
    }

    await Seat.deleteMany({ venueId });
    await Venue.findByIdAndDelete(venueId);

    res.json({
      success: true,
      message: 'Venue and associated seats deleted safely',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
};
