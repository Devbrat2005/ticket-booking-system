const Booking = require('../models/Booking');
const ShowSeat = require('../models/ShowSeat');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const WaitlistOffer = require('../models/WaitlistOffer');
const { generateBookingRef } = require('../utils/bookingRef');
const { generateTicketQR } = require('../services/qrService');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { triggerWaitlistAllocation } = require('../services/waitlistService');
const { emitSeatUpdate } = require('../config/socket');

const createBooking = async (req, res, next) => {
  try {
    const { eventId, seatIds, offerToken } = req.body;

    if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'eventId and array of seatIds are required',
      });
    }

    const event = await Event.findById(eventId).populate('venueId');
    if (!event || event.status === 'CANCELLED') {
      return res.status(404).json({ success: false, message: 'Event not found or cancelled' });
    }

    const now = new Date();

    // Verify seats are currently HELD by this user and not expired
    const showSeats = await ShowSeat.find({
      _id: { $in: seatIds },
      eventId: eventId,
      status: 'HELD',
      holdBy: req.user._id,
      holdExpiresAt: { $gt: now },
    });

    if (showSeats.length !== seatIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more seats are no longer held by you or your hold has expired.',
      });
    }

    // Calculate total amount
    const totalAmount = showSeats.reduce((sum, seat) => sum + seat.price, 0);

    // Generate unique booking reference
    const bookingReference = generateBookingRef();

    // Generate QR code data URL
    const qrCodeData = await generateTicketQR(bookingReference);

    // Create Booking record
    const booking = await Booking.create({
      bookingReference,
      customerId: req.user._id,
      eventId: event._id,
      seats: showSeats.map((seat) => ({
        showSeatId: seat._id,
        seatId: seat.seatId,
        label: seat.label,
        category: seat.category,
        price: seat.price,
      })),
      totalAmount,
      status: 'CONFIRMED',
      qrCodeData,
      bookedAt: now,
    });

    // Atomically convert HELD -> BOOKED
    for (const seat of showSeats) {
      await ShowSeat.findByIdAndUpdate(seat._id, {
        $set: {
          status: 'BOOKED',
          bookingId: booking._id,
          holdBy: null,
          holdExpiresAt: null,
        },
        $inc: { version: 1 },
      });

      // Emit Socket.IO seat status update
      emitSeatUpdate(eventId, {
        seatId: seat._id,
        label: seat.label,
        status: 'BOOKED',
      });
    }

    // If booking was fulfilled via a waitlist offer token, mark offer ACCEPTED
    if (offerToken) {
      await WaitlistOffer.findOneAndUpdate(
        { token: offerToken, customerId: req.user._id },
        { status: 'ACCEPTED', bookingId: booking._id }
      );
    }

    // Dispatch confirmation email (non-blocking)
    sendBookingConfirmationEmail({
      customerName: req.user.name,
      customerEmail: req.user.email,
      bookingReference,
      eventTitle: event.title,
      venueName: event.venueId.name,
      date: event.date,
      time: `${event.startTime} - ${event.endTime}`,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      qrCodeData,
    }).catch((err) => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking: {
          id: booking._id,
          bookingReference: booking.bookingReference,
          eventTitle: event.title,
          venueName: event.venueId.name,
          date: event.date,
          time: `${event.startTime} - ${event.endTime}`,
          seats: booking.seats,
          totalAmount: booking.totalAmount,
          qrCodeData: booking.qrCodeData,
          bookedAt: booking.bookedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate({
        path: 'eventId',
        populate: { path: 'venueId', select: 'name location' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'eventId',
        populate: { path: 'venueId', select: 'name location' },
      })
      .populate('customerId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or Admin/Organiser access
    if (req.user.role === 'CUSTOMER' && booking.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this booking.' });
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership
    if (req.user.role === 'CUSTOMER' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own bookings' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // 1. Mark booking as CANCELLED
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    await booking.save();

    // 2. Release associated seats back to AVAILABLE & trigger waitlist
    for (const seatInfo of booking.seats) {
      const showSeat = await ShowSeat.findByIdAndUpdate(
        seatInfo.showSeatId,
        {
          $set: {
            status: 'AVAILABLE',
            bookingId: null,
            holdBy: null,
            holdExpiresAt: null,
          },
          $inc: { version: 1 },
        },
        { new: true }
      );

      if (showSeat) {
        // Emit Socket.IO seat release
        emitSeatUpdate(booking.eventId, {
          seatId: showSeat._id,
          label: showSeat.label,
          status: 'AVAILABLE',
        });

        // Trigger waitlist auto-allocation for this seat category
        await triggerWaitlistAllocation(booking.eventId, showSeat.category, showSeat._id);
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats released and waitlist allocation checked.',
      data: { bookingId: booking._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
