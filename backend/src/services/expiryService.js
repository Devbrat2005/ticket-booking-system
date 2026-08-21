const ShowSeat = require('../models/ShowSeat');
const WaitlistOffer = require('../models/WaitlistOffer');
const Waitlist = require('../models/Waitlist');
const { emitSeatUpdate } = require('../config/socket');
const { triggerWaitlistAllocation } = require('./waitlistService');

/**
 * Sweeps expired HELD seats and returns them to AVAILABLE,
 * or triggers waitlist allocation if waitlist exists for that category.
 */
const cleanupExpiredHolds = async () => {
  try {
    const now = new Date();

    // 1. Process expired waitlist offers first
    const expiredOffers = await WaitlistOffer.find({
      status: 'OFFERED',
      expiresAt: { $lte: now },
    });

    for (const offer of expiredOffers) {
      offer.status = 'EXPIRED';
      await offer.save();

      // Mark original waitlist entry as EXPIRED
      await Waitlist.findByIdAndUpdate(offer.waitlistId, { status: 'EXPIRED' });

      // Release seat back to AVAILABLE temporarily
      await ShowSeat.findByIdAndUpdate(offer.showSeatId, {
        $set: {
          status: 'AVAILABLE',
          holdBy: null,
          holdExpiresAt: null,
        },
        $inc: { version: 1 },
      });

      emitSeatUpdate(offer.eventId, {
        seatId: offer.showSeatId,
        status: 'AVAILABLE',
      });

      // Try allocating to next waitlisted customer
      await triggerWaitlistAllocation(offer.eventId, offer.category, offer.showSeatId);
    }

    // 2. Find ordinary expired HELD seats (that are not active waitlist offers)
    const expiredSeats = await ShowSeat.find({
      status: 'HELD',
      holdExpiresAt: { $lte: now },
    });

    for (const seat of expiredSeats) {
      // Check if this hold belongs to an active waitlist offer
      const activeOffer = await WaitlistOffer.findOne({
        showSeatId: seat._id,
        status: 'OFFERED',
        expiresAt: { $gt: now },
      });

      if (activeOffer) {
        continue; // Active waitlist offer still running
      }

      // Reset seat to AVAILABLE
      const updated = await ShowSeat.findOneAndUpdate(
        {
          _id: seat._id,
          status: 'HELD',
          holdExpiresAt: { $lte: now },
        },
        {
          $set: {
            status: 'AVAILABLE',
            holdBy: null,
            holdExpiresAt: null,
          },
          $inc: { version: 1 },
        },
        { new: true }
      );

      if (updated) {
        emitSeatUpdate(updated.eventId, {
          seatId: updated._id,
          label: updated.label,
          status: 'AVAILABLE',
        });

        // Trigger waitlist allocation if waitlist exists for this event & category
        await triggerWaitlistAllocation(updated.eventId, updated.category, updated._id);
      }
    }
  } catch (error) {
    console.error('Error in cleanupExpiredHolds service:', error);
  }
};

/**
 * On-the-fly cleanup for a specific event's seats when requested by an API endpoint.
 */
const cleanupEventExpiredHolds = async (eventId) => {
  try {
    const now = new Date();
    const expiredSeats = await ShowSeat.find({
      eventId,
      status: 'HELD',
      holdExpiresAt: { $lte: now },
    });

    for (const seat of expiredSeats) {
      const activeOffer = await WaitlistOffer.findOne({
        showSeatId: seat._id,
        status: 'OFFERED',
        expiresAt: { $gt: now },
      });

      if (activeOffer) continue;

      await ShowSeat.findOneAndUpdate(
        {
          _id: seat._id,
          status: 'HELD',
          holdExpiresAt: { $lte: now },
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
    }
  } catch (error) {
    console.error('Error in cleanupEventExpiredHolds:', error);
  }
};

module.exports = {
  cleanupExpiredHolds,
  cleanupEventExpiredHolds,
};
