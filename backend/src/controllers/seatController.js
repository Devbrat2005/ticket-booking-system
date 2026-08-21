const ShowSeat = require('../models/ShowSeat');
const Event = require('../models/Event');
const { cleanupEventExpiredHolds } = require('../services/expiryService');
const { emitSeatUpdate } = require('../config/socket');

/**
 * Get all seats for an event, cleaning up expired holds on-the-fly.
 */
const getEventSeats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Perform on-the-fly cleanup of expired holds for this event
    await cleanupEventExpiredHolds(eventId);

    const showSeats = await ShowSeat.find({ eventId }).sort({ row: 1, number: 1 });

    const formattedSeats = showSeats.map((seat) => {
      // Mask holdBy unless requested by the holding user
      const isMyHold = req.user && seat.holdBy && seat.holdBy.toString() === req.user._id.toString();

      return {
        id: seat._id,
        seatId: seat.seatId,
        row: seat.row,
        number: seat.number,
        label: seat.label,
        category: seat.category,
        price: seat.price,
        status: seat.status,
        isMyHold,
        holdExpiresAt: seat.holdExpiresAt,
      };
    });

    res.json({
      success: true,
      data: { seats: formattedSeats },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atomically hold one or more seats for a customer.
 */
const holdSeats = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { seatIds } = req.body; // Array of ShowSeat IDs

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one seat ID must be provided',
      });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status === 'CANCELLED') {
      return res.status(404).json({ success: false, message: 'Active event not found' });
    }

    const ttlMinutes = Number(process.env.HOLD_TTL_MINUTES) || 10;
    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const successfullyHeldSeats = [];
    const failedSeats = [];

    for (const seatId of seatIds) {
      // Atomic update query ensuring seat status is either AVAILABLE OR (HELD and holdExpiresAt <= now)
      const updatedSeat = await ShowSeat.findOneAndUpdate(
        {
          _id: seatId,
          eventId: eventId,
          $or: [
            { status: 'AVAILABLE' },
            { status: 'HELD', holdExpiresAt: { $lte: now } },
            { status: 'HELD', holdBy: req.user._id }, // Renew hold for same user
          ],
        },
        {
          $set: {
            status: 'HELD',
            holdBy: req.user._id,
            holdExpiresAt: holdExpiresAt,
          },
          $inc: { version: 1 },
        },
        { new: true }
      );

      if (updatedSeat) {
        successfullyHeldSeats.push(updatedSeat);
        // Emit Socket.IO event for real-time seat lock
        emitSeatUpdate(eventId, {
          seatId: updatedSeat._id,
          label: updatedSeat.label,
          status: 'HELD',
          holdExpiresAt,
        });
      } else {
        failedSeats.push(seatId);
      }
    }

    if (failedSeats.length > 0) {
      // Rollback any seats held during this batch if partial failure
      if (successfullyHeldSeats.length > 0) {
        const heldIds = successfullyHeldSeats.map((s) => s._id);
        await ShowSeat.updateMany(
          { _id: { $in: heldIds }, holdBy: req.user._id },
          {
            $set: {
              status: 'AVAILABLE',
              holdBy: null,
              holdExpiresAt: null,
            },
            $inc: { version: 1 },
          }
        );

        // Notify socket of rollback
        for (const s of successfullyHeldSeats) {
          emitSeatUpdate(eventId, {
            seatId: s._id,
            label: s.label,
            status: 'AVAILABLE',
          });
        }
      }

      return res.status(409).json({
        success: false,
        message: 'One or more selected seats are no longer available or already held by another customer.',
        data: { failedSeats },
      });
    }

    res.json({
      success: true,
      message: `Successfully held ${successfullyHeldSeats.length} seat(s) for ${ttlMinutes} minutes`,
      data: {
        heldSeats: successfullyHeldSeats.map((s) => ({
          id: s._id,
          label: s.label,
          category: s.category,
          price: s.price,
        })),
        holdExpiresAt,
        ttlMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicitly release held seats by a customer.
 */
const releaseSeats = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { seatIds } = req.body;

    if (!seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({ success: false, message: 'seatIds array is required' });
    }

    const result = await ShowSeat.updateMany(
      {
        _id: { $in: seatIds },
        eventId: eventId,
        holdBy: req.user._id,
        status: 'HELD',
      },
      {
        $set: {
          status: 'AVAILABLE',
          holdBy: null,
          holdExpiresAt: null,
        },
        $inc: { version: 1 },
      }
    );

    // Emit real-time updates
    for (const seatId of seatIds) {
      emitSeatUpdate(eventId, {
        seatId,
        status: 'AVAILABLE',
      });
    }

    res.json({
      success: true,
      message: `Released ${result.modifiedCount} seat(s)`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventSeats,
  holdSeats,
  releaseSeats,
};
