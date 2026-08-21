const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Seat = require('../models/Seat');
const ShowSeat = require('../models/ShowSeat');

const createEvent = async (req, res, next) => {
  try {
    const { title, type, description, image, venueId, date, startTime, endTime, categoryPricing } = req.body;

    if (!title || !type || !description || !venueId || !date || !startTime || !endTime || !categoryPricing) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, type, description, venueId, date, startTime, endTime, categoryPricing) are required',
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Selected venue not found' });
    }

    const event = await Event.create({
      title,
      type,
      description,
      image: image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=1000',
      venueId,
      date,
      startTime,
      endTime,
      categoryPricing: {
        Premium: Number(categoryPricing.Premium) || 50,
        Standard: Number(categoryPricing.Standard) || 25,
      },
      organiserId: req.user._id,
      status: 'ACTIVE',
    });

    // Generate ShowSeat records for this event
    const venueSeats = await Seat.find({ venueId });
    const showSeatsToInsert = venueSeats.map((seat) => {
      const price = seat.category === 'Premium' ? event.categoryPricing.Premium : event.categoryPricing.Standard;
      return {
        eventId: event._id,
        seatId: seat._id,
        row: seat.row,
        number: seat.number,
        label: seat.label,
        category: seat.category,
        price,
        status: 'AVAILABLE',
        holdBy: null,
        holdExpiresAt: null,
      };
    });

    await ShowSeat.insertMany(showSeatsToInsert);

    res.status(201).json({
      success: true,
      message: 'Event created and show seats initialized successfully',
      data: { event, totalSeats: showSeatsToInsert.length },
    });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { search, type, date, venueId, sortBy } = req.query;
    const filter = { status: { $ne: 'CANCELLED' } };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (type && ['MOVIE', 'CONCERT'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }

    if (date) {
      filter.date = date;
    }

    if (venueId) {
      filter.venueId = venueId;
    }

    let sortOption = { date: 1, startTime: 1 };
    if (sortBy === 'name') {
      sortOption = { title: 1 };
    } else if (sortBy === 'date_desc') {
      sortOption = { date: -1 };
    }

    const events = await Event.find(filter).populate('venueId', 'name location').sort(sortOption);

    res.json({
      success: true,
      data: { events },
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('venueId', 'name location seatLayout').populate('organiserId', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check permissions (Organiser owns event OR user is Admin)
    if (req.user.role !== 'ADMIN' && event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update events created by you' });
    }

    const { title, description, image, date, startTime, endTime, categoryPricing } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (image) event.image = image;
    if (date) event.date = date;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (categoryPricing) {
      if (categoryPricing.Premium) event.categoryPricing.Premium = Number(categoryPricing.Premium);
      if (categoryPricing.Standard) event.categoryPricing.Standard = Number(categoryPricing.Standard);

      // Update seat prices for AVAILABLE seats
      await ShowSeat.updateMany({ eventId: event._id, category: 'Premium', status: 'AVAILABLE' }, { price: event.categoryPricing.Premium });
      await ShowSeat.updateMany({ eventId: event._id, category: 'Standard', status: 'AVAILABLE' }, { price: event.categoryPricing.Standard });
    }

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

const cancelEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'ADMIN' && event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only cancel events created by you' });
    }

    event.status = 'CANCELLED';
    await event.save();

    res.json({
      success: true,
      message: 'Event cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  cancelEvent,
};
