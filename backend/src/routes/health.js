const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ticket Booking Backend API is healthy and operational',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

module.exports = router;
