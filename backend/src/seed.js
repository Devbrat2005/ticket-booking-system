const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Venue = require('./models/Venue');
const Seat = require('./models/Seat');
const Event = require('./models/Event');
const ShowSeat = require('./models/ShowSeat');
const Booking = require('./models/Booking');
const Waitlist = require('./models/Waitlist');
const WaitlistOffer = require('./models/WaitlistOffer');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticket-booking';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collection data
    await User.deleteMany({});
    await Venue.deleteMany({});
    await Seat.deleteMany({});
    await Event.deleteMany({});
    await ShowSeat.deleteMany({});
    await Booking.deleteMany({});
    await Waitlist.deleteMany({});
    await WaitlistOffer.deleteMany({});

    console.log('Cleared existing database records.');

    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    });

    const organiser = await User.create({
      name: 'Apex Entertainment',
      email: 'organiser@example.com',
      passwordHash,
      role: 'ORGANISER',
    });

    const customer1 = await User.create({
      name: 'Alex Johnson',
      email: 'customer@example.com',
      passwordHash,
      role: 'CUSTOMER',
    });

    const customer2 = await User.create({
      name: 'Sarah Smith',
      email: 'customer2@example.com',
      passwordHash,
      role: 'CUSTOMER',
    });

    console.log('Created default users (Admin, Organiser, Customer, Customer2)');

    // 2. Create Venues
    const venue1 = await Venue.create({
      name: 'Grand Cinema Hall',
      location: 'Downtown Cultural Center, Block A',
      description: 'Ultra-HD IMAX screen with Dolby Atmos 7.1 surround sound surround seat arrangement.',
      seatLayout: {
        totalRows: 4,
        seatsPerRow: 6,
        categoryConfig: [
          { category: 'Premium', rows: ['A', 'B'] },
          { category: 'Standard', rows: ['C', 'D'] },
        ],
      },
      createdBy: admin._id,
    });

    const venue2 = await Venue.create({
      name: 'Symphony Open-Air Arena',
      location: 'Metropolitan Park, Stadium District',
      description: 'Massive open-air concert venue with acoustic stage setup.',
      seatLayout: {
        totalRows: 4,
        seatsPerRow: 8,
        categoryConfig: [
          { category: 'Premium', rows: ['A', 'B'] },
          { category: 'Standard', rows: ['C', 'D'] },
        ],
      },
      createdBy: admin._id,
    });

    console.log('Created sample venues (Grand Cinema Hall & Symphony Open-Air Arena)');

    // Helper to generate physical seats for venue
    const createSeatsForVenue = async (venue) => {
      const rows = ['A', 'B', 'C', 'D'].slice(0, venue.seatLayout.totalRows);
      const seats = [];
      const premiumRows = venue.seatLayout.categoryConfig.find((c) => c.category === 'Premium')?.rows || ['A', 'B'];

      for (const row of rows) {
        const category = premiumRows.includes(row) ? 'Premium' : 'Standard';
        for (let num = 1; num <= venue.seatLayout.seatsPerRow; num++) {
          const prefix = category === 'Premium' ? 'P' : 'S';
          const formattedNum = num < 10 ? `0${num}` : `${num}`;
          seats.push({
            venueId: venue._id,
            row,
            number: num,
            label: `${prefix}-${row}${formattedNum}`,
            category,
          });
        }
      }
      return await Seat.insertMany(seats);
    };

    const seatsVenue1 = await createSeatsForVenue(venue1);
    const seatsVenue2 = await createSeatsForVenue(venue2);

    console.log(`Created ${seatsVenue1.length + seatsVenue2.length} physical venue seats`);

    // 3. Create Events
    const movieEvent = await Event.create({
      title: 'Interstellar IMAX Special',
      type: 'MOVIE',
      description: 'Experience Christopher Nolan masterpiece in IMAX 70mm film format with remastered audio.',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
      venueId: venue1._id,
      date: '2026-09-15',
      startTime: '19:30',
      endTime: '22:30',
      categoryPricing: {
        Premium: 35,
        Standard: 20,
      },
      organiserId: organiser._id,
      status: 'ACTIVE',
    });

    const concertEvent = await Event.create({
      title: 'Coldplay Live in Concert',
      type: 'CONCERT',
      description: 'Music of the Spheres World Tour featuring lasers, wristbands, and electrifying live performances.',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1000',
      venueId: venue2._id,
      date: '2026-10-01',
      startTime: '20:00',
      endTime: '23:00',
      categoryPricing: {
        Premium: 120,
        Standard: 65,
      },
      organiserId: organiser._id,
      status: 'ACTIVE',
    });

    console.log('Created sample events (Interstellar IMAX & Coldplay Concert)');

    // Helper to generate ShowSeats for event
    const createShowSeats = async (event, venueSeats) => {
      const showSeats = venueSeats.map((seat) => {
        const price = seat.category === 'Premium' ? event.categoryPricing.Premium : event.categoryPricing.Standard;
        return {
          eventId: event._id,
          seatId: seat._id,
          row: seat.row,
          number: seat.number,
          label: seat.label,
          category: seat.category,
          price,
          status: 'AVAILABLE',
          holdBy: null,
          holdExpiresAt: null,
        };
      });
      return await ShowSeat.insertMany(showSeats);
    };

    await createShowSeats(movieEvent, seatsVenue1);
    await createShowSeats(concertEvent, seatsVenue2);

    console.log('Initialized show seats for all events successfully!');
    console.log('----------------------------------------------------');
    console.log('Seed Complete! Use these test credentials to log in:');
    console.log('ADMIN:     admin@example.com     / password123');
    console.log('ORGANISER: organiser@example.com / password123');
    console.log('CUSTOMER:  customer@example.com  / password123');
    console.log('CUSTOMER2: customer2@example.com / password123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
