const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { startTTLJob } = require('./jobs/ttlCleanupJob');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const venueRoutes = require('./routes/venues');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookings');
const waitlistRoutes = require('./routes/waitlist');
const organiserRoutes = require('./routes/organiser');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
initSocket(io);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events/:eventId/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/organiser', organiserRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Ticket Booking Platform API',
    docs: '/api/health',
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Ticket Booking Backend Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    
    // Asynchronously connect database & start TTL job
    connectDB()
      .then(() => {
        startTTLJob();
      })
      .catch((err) => {
        console.warn(`[SERVER WARN] Database not connected yet (${err.message}). API server is running on port ${PORT}.`);
      });
  });
}

module.exports = { app, server };
