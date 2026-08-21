const Waitlist = require('../models/Waitlist');
const WaitlistOffer = require('../models/WaitlistOffer');
const ShowSeat = require('../models/ShowSeat');
const Event = require('../models/Event');
const { triggerWaitlistAllocation } = require('../services/waitlistService');
const { emitSeatUpdate } = require('../config/socket');

const joinWaitlist = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { category } = req.body;

    if (!category || !['Premium', 'Standard'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Valid category (Premium or Standard) is required' });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status === 'CANCELLED') {
      return res.status(404).json({ success: false, message: 'Active event not found' });
    }

    // Check if customer already on waitlist for this event & category
    const existing = await Waitlist.findOne({
      customerId: req.user._id,
      eventId,
      category,
      status: { $in: ['WAITING', 'OFFERED'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You are already on the waitlist for ${category} seats (Position #${existing.position})`,
        data: { waitlist: existing },
      });
    }

    // Determine FIFO position
    const currentMax = await Waitlist.countDocuments({ eventId, category, status: 'WAITING' });
    const position = currentMax + 1;

    const waitlist = await Waitlist.create({
      customerId: req.user._id,
      eventId,
      category,
      position,
      status: 'WAITING',
    });

    res.status(201).json({
      success: true,
      message: `Successfully joined ${category} waitlist at position #${position}`,
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
};

const getWaitlistStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const entries = await Waitlist.find({
      eventId,
      customerId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { waitlist: entries },
    });
  } catch (error) {
    next(error);
  }
};

const getOfferByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const offer = await WaitlistOffer.findOne({ token })
      .populate({
        path: 'eventId',
        populate: { path: 'venueId', select: 'name location' },
      })
      .populate('showSeatId')
      .populate('customerId', 'name email');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Waitlist offer not found or invalid token' });
    }

    const now = new Date();
    const isExpired = offer.expiresAt <= now || offer.status === 'EXPIRED';

    res.json({
      success: true,
      data: {
        offer: {
          id: offer._id,
          token: offer.token,
          event: offer.eventId,
          seat: offer.showSeatId,
          category: offer.category,
          status: offer.status,
          expiresAt: offer.expiresAt,
          isExpired,
          customer: offer.customerId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const acceptWaitlistOffer = async (req, res, next) => {
  try {
    const { token } = req.params;

    const offer = await WaitlistOffer.findOne({ token, customerId: req.user._id });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Waitlist offer not found or you are not authorized' });
    }

    if (offer.status !== 'OFFERED') {
      return res.status(400).json({ success: false, message: `Offer is no longer active (Status: ${offer.status})` });
    }

    if (new Date() >= offer.expiresAt) {
      offer.status = 'EXPIRED';
      await offer.save();
      return res.status(400).json({ success: false, message: 'This waitlist offer has expired.' });
    }

    const showSeat = await ShowSeat.findById(offer.showSeatId);
    if (!showSeat || showSeat.status === 'BOOKED') {
      return res.status(409).json({ success: false, message: 'The offered seat is no longer available.' });
    }

    // Ensure seat is HELD by customer for checkout
    showSeat.status = 'HELD';
    showSeat.holdBy = req.user._id;
    showSeat.holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Give 10 min checkout window
    await showSeat.save();

    res.json({
      success: true,
      message: 'Offer accepted! You can now complete checkout for your reserved seat.',
      data: {
        eventId: offer.eventId,
        seatIds: [showSeat._id],
        offerToken: token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const declineWaitlistOffer = async (req, res, next) => {
  try {
    const { token } = req.params;

    const offer = await WaitlistOffer.findOne({ token, customerId: req.user._id });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    offer.status = 'DECLINED';
    await offer.save();

    await Waitlist.findByIdAndUpdate(offer.waitlistId, { status: 'CANCELLED' });

    // Release seat back to AVAILABLE & pass to next in line
    await ShowSeat.findByIdAndUpdate(offer.showSeatId, {
      status: 'AVAILABLE',
      holdBy: null,
      holdExpiresAt: null,
    });

    emitSeatUpdate(offer.eventId, {
      seatId: offer.showSeatId,
      status: 'AVAILABLE',
    });

    // Trigger allocation for next candidate
    await triggerWaitlistAllocation(offer.eventId, offer.category, offer.showSeatId);

    res.json({
      success: true,
      message: 'Offer declined. The seat has been offered to the next waitlisted customer.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinWaitlist,
  getWaitlistStatus,
  getOfferByToken,
  acceptWaitlistOffer,
  declineWaitlistOffer,
};
