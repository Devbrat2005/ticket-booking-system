require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const User = require('../src/models/User');
const Venue = require('../src/models/Venue');
const Seat = require('../src/models/Seat');
const Event = require('../src/models/Event');
const ShowSeat = require('../src/models/ShowSeat');
const Booking = require('../src/models/Booking');
const Waitlist = require('../src/models/Waitlist');
const WaitlistOffer = require('../src/models/WaitlistOffer');
const { cleanupExpiredHolds } = require('../src/services/expiryService');

let adminToken, organiserToken, customer1Token, customer2Token;
let customer1Id, customer2Id;
let sampleEventId, sampleVenueId, sampleSeatId;

beforeAll(async () => {
  const defaultUri = process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace('/ticket_booking', '/ticket_booking_test')
    : 'mongodb://127.0.0.1:27017/ticket-booking-test';
  const uri = process.env.MONGODB_URI_TEST || defaultUri;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // Clean collections
  await User.deleteMany({});
  await Venue.deleteMany({});
  await Seat.deleteMany({});
  await Event.deleteMany({});
  await ShowSeat.deleteMany({});
  await Booking.deleteMany({});
  await Waitlist.deleteMany({});
  await WaitlistOffer.deleteMany({});
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
});

describe('1. Authentication & Role Authorization', () => {
  it('should register Customer, Organiser, and Admin accounts', async () => {
    // Admin
    const resAdmin = await request(app).post('/api/auth/register').send({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    });
    expect(resAdmin.statusCode).toBe(201);
    adminToken = resAdmin.body.data.token;

    // Organiser
    const resOrg = await request(app).post('/api/auth/register').send({
      name: 'Test Organiser',
      email: 'org@test.com',
      password: 'password123',
      role: 'ORGANISER',
    });
    expect(resOrg.statusCode).toBe(201);
    organiserToken = resOrg.body.data.token;

    // Customer 1
    const resC1 = await request(app).post('/api/auth/register').send({
      name: 'Customer One',
      email: 'c1@test.com',
      password: 'password123',
      role: 'CUSTOMER',
    });
    expect(resC1.statusCode).toBe(201);
    customer1Token = resC1.body.data.token;
    customer1Id = resC1.body.data.user.id;

    // Customer 2
    const resC2 = await request(app).post('/api/auth/register').send({
      name: 'Customer Two',
      email: 'c2@test.com',
      password: 'password123',
      role: 'CUSTOMER',
    });
    expect(resC2.statusCode).toBe(201);
    customer2Token = resC2.body.data.token;
    customer2Id = resC2.body.data.user.id;
  });

  it('should login user and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'c1@test.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject unauthorized access to protected endpoints', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(401);
  });

  it('should reject non-admin users from creating venues', async () => {
    const res = await request(app)
      .post('/api/venues')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ name: 'Unauthorized Venue', location: 'City' });
    expect(res.statusCode).toBe(403);
  });
});

describe('2. Venue & Event Creation', () => {
  it('should allow Admin to create a venue', async () => {
    const res = await request(app)
      .post('/api/venues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Cinema',
        location: 'City Center',
        seatLayout: {
          totalRows: 2,
          seatsPerRow: 4,
          categoryConfig: [
            { category: 'Premium', rows: ['A'] },
            { category: 'Standard', rows: ['B'] },
          ],
        },
      });
    expect(res.statusCode).toBe(201);
    sampleVenueId = res.body.data.venue._id;
  });

  it('should allow Organiser to create an Event and generate ShowSeats', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organiserToken}`)
      .send({
        title: 'Test Movie Night',
        type: 'MOVIE',
        description: 'Fun film screening',
        venueId: sampleVenueId,
        date: '2026-10-10',
        startTime: '18:00',
        endTime: '20:00',
        categoryPricing: { Premium: 50, Standard: 30 },
      });

    expect(res.statusCode).toBe(201);
    sampleEventId = res.body.data.event._id;

    // Verify ShowSeats created
    const seatsRes = await request(app).get(`/api/events/${sampleEventId}/seats`);
    expect(seatsRes.statusCode).toBe(200);
    expect(seatsRes.body.data.seats.length).toBe(8); // 2 rows * 4 seats
    sampleSeatId = seatsRes.body.data.seats[0].id;
  });
});

describe('3. Seat Hold & Concurrency Control', () => {
  it('should allow Customer 1 to hold a seat', async () => {
    const res = await request(app)
      .post(`/api/events/${sampleEventId}/seats/hold`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ seatIds: [sampleSeatId] });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.heldSeats.length).toBe(1);
  });

  it('CRITICAL CONCURRENCY TEST: should reject Customer 2 when attempting to hold the same seat simultaneously', async () => {
    const res = await request(app)
      .post(`/api/events/${sampleEventId}/seats/hold`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ seatIds: [sampleSeatId] });

    expect(res.statusCode).toBe(409); // Conflict response
    expect(res.body.success).toBe(false);
  });

  it('should automatically release expired holds when TTL expires', async () => {
    await ShowSeat.findByIdAndUpdate(sampleSeatId, {
      holdExpiresAt: new Date(Date.now() - 5000),
    });

    await cleanupExpiredHolds();

    const seat = await ShowSeat.findById(sampleSeatId);
    expect(seat.status).toBe('AVAILABLE');
    expect(seat.holdBy).toBeNull();
  });
});

describe('4. Booking Confirmation, QR, Email & Cancellation', () => {
  let createdBookingId;

  it('should confirm booking for held seat and generate QR & bookingReference', async () => {
    await request(app)
      .post(`/api/events/${sampleEventId}/seats/hold`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ seatIds: [sampleSeatId] });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ eventId: sampleEventId, seatIds: [sampleSeatId] });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.booking.bookingReference).toMatch(/^TKB-2026-/);
    expect(res.body.data.booking.qrCodeData).toContain('data:image/png;base64');
    createdBookingId = res.body.data.booking.id;

    const seat = await ShowSeat.findById(sampleSeatId);
    expect(seat.status).toBe('BOOKED');
  });

  it('should prevent user from accessing another user booking', async () => {
    const res = await request(app)
      .get(`/api/bookings/${createdBookingId}`)
      .set('Authorization', `Bearer ${customer2Token}`);
    expect(res.statusCode).toBe(403);
  });

  it('should cancel booking and release seat back to AVAILABLE', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdBookingId}/cancel`)
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.statusCode).toBe(200);

    const seat = await ShowSeat.findById(sampleSeatId);
    expect(seat.status).toBe('AVAILABLE');
  });
});

describe('5. Waitlist Queue & Time-Limited Token Offer Flow', () => {
  it('should allow Customer 2 to join waitlist for Premium category', async () => {
    const res = await request(app)
      .post(`/api/events/${sampleEventId}/waitlist`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ category: 'Premium' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.waitlist.position).toBe(1);
  });

  it('should trigger waitlist auto-offer when a booking is cancelled or seat released', async () => {
    await request(app)
      .post(`/api/events/${sampleEventId}/seats/hold`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ seatIds: [sampleSeatId] });

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ eventId: sampleEventId, seatIds: [sampleSeatId] });

    const bookingId = bookRes.body.data.booking.id;

    await request(app)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customer1Token}`);

    const offer = await WaitlistOffer.findOne({ customerId: customer2Id, eventId: sampleEventId });
    expect(offer).not.toBeNull();
    expect(offer.status).toBe('OFFERED');
    expect(offer.token).toBeDefined();

    const offerRes = await request(app).get(`/api/waitlist/offers/${offer.token}`);
    expect(offerRes.statusCode).toBe(200);
    expect(offerRes.body.data.offer.status).toBe('OFFERED');
  });
});
