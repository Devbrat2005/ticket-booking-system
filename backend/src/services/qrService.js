const QRCode = require('qrcode');

const generateTicketQR = async (bookingReference) => {
  try {
    const payload = JSON.stringify({ bookingReference });
    // Returns Data URL string (data:image/png;base64,...)
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 250,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code for ticket');
  }
};

module.exports = { generateTicketQR };
