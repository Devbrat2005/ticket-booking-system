const crypto = require('crypto');
const Waitlist = require('../models/Waitlist');
const WaitlistOffer = require('../models/WaitlistOffer');
const ShowSeat = require('../models/ShowSeat');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendWaitlistOfferEmail } = require('./emailService');
const { emitSeatUpdate } = require('../config/socket');

/**
 * Trigger waitlist allocation when a seat becomes available for an event & category.
 */
const triggerWaitlistAllocation = async (eventId, category, releasedShowSeatId) => {
  try {
    // 1. Check if the released seat is actually AVAILABLE or can be held for waitlist
    const showSeat = await ShowSeat.findById(releasedShowSeatId);
    if (!showSeat || showSeat.status === 'BOOKED') {
      return null;
    }

    // 2. Find the top FIFO waiting customer for this event & category
    const topWaitlist = await Waitlist.findOne({
      eventId,
      category,
      status: 'WAITING',
    }).sort({ position: 1, createdAt: 1 });

    if (!topWaitlist) {
      // No one on waitlist, seat stays AVAILABLE
      return null;
    }

    const customer = await User.findById(topWaitlist.customerId);
    const event = await Event.findById(eventId);
    if (!customer || !event) {
      return null;
    }

    // 3. Atomically update seat status to HELD for waitlist offer
    const offerMinutes = Number(process.env.WAITLIST_OFFER_MINUTES) || 5;
    const expiresAt = new Date(Date.now() + offerMinutes * 60 * 1000);
    const token = crypto.randomBytes(24).toString('hex');

    const updatedSeat = await ShowSeat.findOneAndUpdate(
      {
        _id: showSeat._id,
        $or: [{ status: 'AVAILABLE' }, { status: 'HELD', holdExpiresAt: { $lte: new Date() } }],
      },
      {
        $set: {
          status: 'HELD',
          holdBy: topWaitlist.customerId,
          holdExpiresAt: expiresAt,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!updatedSeat) {
      // Seat was grabbed concurrently by someone else
      return null;
    }

    // 4. Update waitlist status to OFFERED
    topWaitlist.status = 'OFFERED';
    await topWaitlist.save();

    // 5. Create WaitlistOffer document
    const offer = await WaitlistOffer.create({
      waitlistId: topWaitlist._id,
      customerId: topWaitlist.customerId,
      eventId: eventId,
      showSeatId: updatedSeat._id,
      seatId: updatedSeat.seatId,
      category: category,
      expiresAt: expiresAt,
      token: token,
      status: 'OFFERED',
    });

    // 6. Send email notification
    sendWaitlistOfferEmail({
      customerName: customer.name,
      customerEmail: customer.email,
      eventTitle: event.title,
      category: category,
      seatLabel: updatedSeat.label,
      offerToken: token,
      expiresAt: expiresAt,
    }).catch((err) => console.error('Waitlist email error:', err));

    // 7. Broadcast seat status via Socket.IO
    emitSeatUpdate(eventId, {
      seatId: updatedSeat._id,
      label: updatedSeat.label,
      status: 'HELD',
      holdExpiresAt: expiresAt,
    });

    return offer;
  } catch (error) {
    console.error('Error in triggerWaitlistAllocation:', error);
    return null;
  }
};

module.exports = {
  triggerWaitlistAllocation,
};
