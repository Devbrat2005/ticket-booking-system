const express = require('express');
const router = express.Router({ mergeParams: true });
const { getEventSeats, holdSeats, releaseSeats } = require('../controllers/seatController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getEventSeats);
router.post('/hold', authenticateToken, holdSeats);
router.post('/release', authenticateToken, releaseSeats);

module.exports = router;
