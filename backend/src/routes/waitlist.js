const express = require('express');
const router = express.Router();
const { joinWaitlist, getWaitlistStatus, getOfferByToken, acceptWaitlistOffer, declineWaitlistOffer } = require('../controllers/waitlistController');
const { authenticateToken } = require('../middleware/auth');

router.post('/events/:eventId/waitlist', authenticateToken, joinWaitlist);
router.get('/events/:eventId/waitlist/status', authenticateToken, getWaitlistStatus);

router.get('/offers/:token', getOfferByToken);
router.post('/offers/:token/accept', authenticateToken, acceptWaitlistOffer);
router.post('/offers/:token/decline', authenticateToken, declineWaitlistOffer);

module.exports = router;
