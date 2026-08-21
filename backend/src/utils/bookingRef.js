const crypto = require('crypto');

const generateBookingRef = () => {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex characters
  return `TKB-${year}-${randomChars}`;
};

module.exports = { generateBookingRef };
