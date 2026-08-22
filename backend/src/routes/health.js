const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ticket Booking Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
