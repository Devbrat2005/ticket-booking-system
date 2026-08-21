const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return null;
};

const sendBookingConfirmationEmail = async ({ customerName, customerEmail, bookingReference, eventTitle, venueName, date, time, seats, totalAmount, qrCodeData }) => {
  const transporter = createTransporter();
  const seatsList = seats.map((s) => `${s.label} (${s.category})`).join(', ');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
      <h1 style="color: #6366f1; margin-bottom: 8px;">🎟️ BookSeat Confirmation</h1>
      <p style="font-size: 16px; color: #94a3b8;">Hi ${customerName}, your BookSeat ticket is confirmed!</p>

      <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Booking Reference:</strong> <span style="color: #38bdf8; font-family: monospace; font-size: 16px;">${bookingReference}</span></p>
        <p style="margin: 6px 0;"><strong>Event:</strong> ${eventTitle}</p>
        <p style="margin: 6px 0;"><strong>Venue:</strong> ${venueName}</p>
        <p style="margin: 6px 0;"><strong>Date & Time:</strong> ${date} at ${time}</p>
        <p style="margin: 6px 0;"><strong>Seats:</strong> ${seatsList}</p>
        <p style="margin: 6px 0;"><strong>Total Paid:</strong> $${totalAmount}</p>
      </div>

      <div style="text-align: center; margin: 24px 0; background: #ffffff; padding: 16px; border-radius: 8px; display: inline-block;">
        <img src="${qrCodeData}" alt="BookSeat QR Ticket" style="width: 200px; height: 200px;" />
        <p style="color: #0f172a; font-family: monospace; margin-top: 8px; font-weight: bold;">${bookingReference}</p>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">Show this QR code at the venue entrance. Thank you for booking with BookSeat!</p>
    </div>
  `;

  if (!transporter) {
    console.warn(`\n[EMAIL SERVICE DEV WARNING] Email credentials not configured. Skipping SMTP dispatch.`);
    console.warn(`[BOOKSEAT TICKET FOR ${customerEmail}] Ref: ${bookingReference} | Seats: ${seatsList} | Total: $${totalAmount}\n`);
    return { status: 'DEV_LOGGED', bookingReference };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BookSeat" <noreply@bookseat.com>',
      to: customerEmail,
      subject: `Your BookSeat Ticket is Confirmed 🎟️ - ${eventTitle} [${bookingReference}]`,
      html: htmlContent,
    });
    console.log(`BookSeat booking confirmation email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send BookSeat email to ${customerEmail}:`, error.message);
    return { status: 'FAILED', error: error.message };
  }
};

const sendWaitlistOfferEmail = async ({ customerName, customerEmail, eventTitle, category, seatLabel, offerToken, expiresAt }) => {
  const transporter = createTransporter();
  const offerUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/waitlist/offer/${offerToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
      <h1 style="color: #ec4899; margin-bottom: 8px;">🔥 Your Seat Is Available on BookSeat!</h1>
      <p style="font-size: 16px; color: #94a3b8;">Hi ${customerName},</p>
      <p style="font-size: 15px;">A seat has become available for you on BookSeat! A <strong>${category}</strong> seat (${seatLabel}) is ready for <strong>${eventTitle}</strong>.</p>

      <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899;">
        <p style="margin: 6px 0;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 6px 0;"><strong>Reserved Seat:</strong> ${seatLabel}</p>
        <p style="margin: 6px 0; color: #f43f5e;"><strong>Offer Expires At:</strong> ${new Date(expiresAt).toLocaleTimeString()}</p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${offerUrl}" style="background: #ec4899; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept & Book</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">If not accepted before expiry, this offer will automatically pass to the next customer on the BookSeat waitlist.</p>
    </div>
  `;

  if (!transporter) {
    console.warn(`\n[EMAIL SERVICE DEV WARNING] Email credentials not configured. Skipping SMTP waitlist dispatch.`);
    console.warn(`[BOOKSEAT WAITLIST OFFER FOR ${customerEmail}] Event: ${eventTitle} | Seat: ${seatLabel} | Link: ${offerUrl}\n`);
    return { status: 'DEV_LOGGED', offerToken };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BookSeat" <noreply@bookseat.com>',
      to: customerEmail,
      subject: `BookSeat Waitlist Ticket Offer: Action Required 🎟️ - ${eventTitle}`,
      html: htmlContent,
    });
    console.log(`BookSeat waitlist offer email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send BookSeat waitlist email to ${customerEmail}:`, error.message);
    return { status: 'FAILED', error: error.message };
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendWaitlistOfferEmail,
};
