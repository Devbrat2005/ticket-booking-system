# Ticket Booking System 🎟️

A complete, production-ready full-stack ticket booking platform for movies and concerts featuring interactive real-time seat maps, 10-minute hold TTL with concurrency lock protection, automatic hold release, tokenized FIFO category waitlists, QR code generation, Nodemailer ticket dispatch, and role-based dashboards (Customer, Organiser, Admin).

---

## 1. Project Overview & Features

- **Visual Real-Time Seat Map**: Interactive seat map distinguishing Available, Selected, Held, and Booked seats across Premium and Standard categories.
- **Seat Hold & 10-Minute TTL**: Atomically reserves selected seats for 10 minutes (`HOLD_TTL_MINUTES=10`).
- **Strict Concurrency Protection**: Database-level atomic queries (`findOneAndUpdate`) preventing race conditions when two users select the exact same seat simultaneously.
- **Automated Hold Expiry**: Cron-based background cleanup sweep returning abandoned/expired holds back to `AVAILABLE`.
- **FIFO Category Waitlist & Offers**: Automatic queueing for sold-out seat categories. Upon booking cancellation, top FIFO candidate receives a time-limited token offer link (`/waitlist/offer/:token`).
- **QR Ticket & Email Dispatch**: Generates base64 PNG QR code containing `{"bookingReference": "TKB-2026-XXXXXX"}` and dispatches rich HTML emails via Nodemailer.
- **Socket.IO Real-Time Synchronization**: Instantly broadcasts seat locks, releases, and bookings to all connected clients viewing that event room (`event:<eventId>`).
- **Role-Based Authorization**: Enforces strict JWT & role middleware across `CUSTOMER`, `ORGANISER`, and `ADMIN`.

---

## 2. Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router v6, Axios, Socket.IO Client, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, Socket.IO, qrcode, Nodemailer, node-cron.
- **Testing**: Jest & Supertest in-memory test runner.

---

## 3. Architecture & Folder Structure

```
ticket booking/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, socket.js)
│   │   ├── models/ (User.js, Venue.js, Seat.js, Event.js, ShowSeat.js, Booking.js, Waitlist.js, WaitlistOffer.js)
│   │   ├── controllers/ (authController.js, eventController.js, venueController.js, seatController.js, bookingController.js, waitlistController.js, organiserController.js, adminController.js)
│   │   ├── routes/ (auth.js, events.js, venues.js, seats.js, bookings.js, waitlist.js, organiser.js, admin.js, health.js)
│   │   ├── middleware/ (auth.js, role.js, errorHandler.js)
│   │   ├── services/ (qrService.js, emailService.js, waitlistService.js, expiryService.js)
│   │   ├── utils/ (bookingRef.js)
│   │   ├── jobs/ (ttlCleanupJob.js)
│   │   ├── seed.js
│   │   └── server.js
│   ├── tests/ (system.test.js)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar.jsx, VisualSeatMap.jsx, HoldTimer.jsx, ProtectedRoute.jsx)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── pages/ (Home.jsx, Events.jsx, EventDetail.jsx, SeatSelection.jsx, Checkout.jsx, BookingConfirmation.jsx, MyBookings.jsx, WaitlistOfferPage.jsx, OrganiserDashboard.jsx, CreateEvent.jsx, AdminDashboard.jsx, ManageVenues.jsx, ManageUsers.jsx, Login.jsx, Register.jsx)
│   │   ├── services/ (api.js, socket.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── README.md
└── SYSTEM_DESIGN.md
```

---

## 4. Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ticket-booking
JWT_SECRET=supersecretjwtkey_ticketbooking_2026
CORS_ORIGIN=http://localhost:5173
HOLD_TTL_MINUTES=10
WAITLIST_OFFER_MINUTES=5

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=dev@example.com
EMAIL_PASSWORD=devpassword
EMAIL_FROM="Ticket Booking System <noreply@ticketbooking.com>"
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 5. Local Setup & Installation

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed Database
Ensure MongoDB is running locally or provide a MongoDB Atlas URI in `backend/.env`.
```bash
cd backend
npm run seed
```

### Step 3: Run Test Suite
```bash
cd backend
npm test
```

### Step 4: Launch Applications
```bash
# Terminal 1 - Backend Server
cd backend
npm run dev

# Terminal 2 - Frontend Application
cd frontend
npm run dev
```

Visit the app at `http://localhost:5173`.

---

## 6. Default Demo Test Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `password123` | Venue Seat Grid Builder, User Manager, System Stats |
| **ORGANISER** | `organiser@example.com` | `password123` | Event Creation, Category Pricing, Revenue Summary |
| **CUSTOMER** | `customer@example.com` | `password123` | Seat Hold, Checkout, QR Passes, Booking History, Waitlist |
| **CUSTOMER 2** | `customer2@example.com` | `password123` | Concurrency Testing & Waitlist Offers |

---

## 7. API Documentation Summary

### AUTH
- `POST /api/auth/register` - Register User
- `POST /api/auth/login` - Authenticate & Get JWT
- `GET /api/auth/me` - Current User Profile

### EVENTS & SEATS
- `GET /api/events` - Catalog Search & Multi-Filter
- `GET /api/events/:id` - Event Details
- `POST /api/events` - Create Event (Organiser/Admin)
- `GET /api/events/:eventId/seats` - Real-Time Seat Map Grid
- `POST /api/events/:eventId/seats/hold` - Atomic Seat Lock
- `POST /api/events/:eventId/seats/release` - Release Seat Lock

### BOOKINGS & WAITLIST
- `POST /api/bookings` - Confirm Booking & Generate QR Ticket
- `GET /api/bookings/my` - User Booking History
- `POST /api/bookings/:id/cancel` - Cancel Booking & Auto-Assign Waitlist
- `POST /api/waitlist/events/:eventId/waitlist` - Join Category Waitlist
- `GET /api/waitlist/offers/:token` - View Time-Limited Offer
- `POST /api/waitlist/offers/:token/accept` - Redeem Offer
- `POST /api/waitlist/offers/:token/decline` - Decline Offer

---

## 8. Deployment Guide

- **Frontend (Vercel)**: Set `VITE_API_URL` and `VITE_SOCKET_URL` environment variables pointing to deployed backend. Build command: `npm run build`.
- **Backend (Render / Railway)**: Deploy Node.js Express server. Add environment variables `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`.
- **Database (MongoDB Atlas)**: Set IP Access Whitelist `0.0.0.0/0` or cloud host IP.
