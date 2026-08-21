const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, createBooking);
router.get('/my', authenticateToken, getMyBookings);
router.get('/:id', authenticateToken, getBookingById);
router.post('/:id/cancel', authenticateToken, cancelBooking);

module.exports = router;
