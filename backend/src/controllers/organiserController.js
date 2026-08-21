const Event = require('../models/Event');
const Booking = require('../models/Booking');
const ShowSeat = require('../models/ShowSeat');

const getOrganiserStats = async (req, res, next) => {
  try {
    const organiserId = req.user._id;

    const events = await Event.find({ organiserId }).populate('venueId', 'name');
    const eventIds = events.map((e) => e._id);

    // Total bookings & revenue aggregation
    const bookingAggregate = await Booking.aggregate([
      { $match: { eventId: { $in: eventIds }, status: 'CONFIRMED' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          totalTicketsSold: { $sum: { $size: '$seats' } },
        },
      },
    ]);

    const totalRevenue = bookingAggregate.length > 0 ? bookingAggregate[0].totalRevenue : 0;
    const totalBookings = bookingAggregate.length > 0 ? bookingAggregate[0].totalBookings : 0;
    const totalTicketsSold = bookingAggregate.length > 0 ? bookingAggregate[0].totalTicketsSold : 0;

    // Per-event summary details
    const eventSummaries = [];

    for (const event of events) {
      const seats = await ShowSeat.find({ eventId: event._id });
      const capacity = seats.length;
      const soldSeats = seats.filter((s) => s.status === 'BOOKED').length;
      const heldSeats = seats.filter((s) => s.status === 'HELD').length;
      const availableSeats = seats.filter((s) => s.status === 'AVAILABLE').length;

      const eventBookings = await Booking.aggregate([
        { $match: { eventId: event._id, status: 'CONFIRMED' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
      ]);

      const revenue = eventBookings.length > 0 ? eventBookings[0].revenue : 0;
      const bookingCount = eventBookings.length > 0 ? eventBookings[0].count : 0;

      eventSummaries.push({
        id: event._id,
        title: event.title,
        type: event.type,
        date: event.date,
        venue: event.venueId ? event.venueId.name : 'N/A',
        capacity,
        soldSeats,
        heldSeats,
        availableSeats,
        revenue,
        bookingCount,
        status: event.status,
      });
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalEvents: events.length,
          upcomingEvents: events.filter((e) => new Date(e.date) >= new Date()).length,
          totalBookings,
          totalTicketsSold,
          totalRevenue,
        },
        eventSummaries,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEventSummary = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('venueId');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'ADMIN' && event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const seats = await ShowSeat.find({ eventId });
    const bookings = await Booking.find({ eventId, status: 'CONFIRMED' }).populate('customerId', 'name email');

    res.json({
      success: true,
      data: {
        event,
        seatStats: {
          total: seats.length,
          booked: seats.filter((s) => s.status === 'BOOKED').length,
          held: seats.filter((s) => s.status === 'HELD').length,
          available: seats.filter((s) => s.status === 'AVAILABLE').length,
        },
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganiserStats,
  getEventSummary,
};
