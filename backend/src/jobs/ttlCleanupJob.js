const cron = require('node-cron');
const { cleanupExpiredHolds } = require('../services/expiryService');

let isRunning = false;

const startTTLJob = () => {
  // Run every 15 seconds: '*/15 * * * * *'
  cron.schedule('*/15 * * * * *', async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await cleanupExpiredHolds();
    } catch (err) {
      console.error('Error during TTL cron execution:', err);
    } finally {
      isRunning = false;
    }
  });

  console.log('⏰ TTL Hold & Waitlist Expiry Cron Job initialized (running every 15 seconds)');
};

module.exports = { startTTLJob };
