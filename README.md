# BookSeat 🎟️

**Your Seat. Your Experience.**

A production-ready full-stack ticket booking platform for movies, concerts, and live events. Built with real-time seat selection, 10-minute hold TTL, concurrency protection, tokenized FIFO waitlists, QR code passes, and Nodemailer notifications.

---

## 1. Brand Identity & Features

- **Official Brand Name**: BookSeat
- **Tagline**: *"Your Seat. Your Experience."*
- **Alternative Tagline**: *"Book Your Seat. Enjoy Your Moment."*
- **Interactive Seat Map**: Live visual seat matrix distinguishing Available, Selected, Held, and Booked states.
- **10-Minute Seat Lock (TTL)**: Atomic reservation locks preventing double-booking during checkout.
- **Strict Concurrency Locks**: Atomic MongoDB queries (`findOneAndUpdate`) guaranteeing race-condition safety.
- **Automated Hold Expiry**: Cron-based background worker (`ttlCleanupJob.js`) returning abandoned seat holds back to `AVAILABLE`.
- **FIFO Category Waitlist**: Category-specific queueing with 5-minute tokenized email offer links (`/waitlist/offer/:token`).
- **QR Ticket Pass**: Generates base64 PNG QR code encoding `{"bookingReference": "TKB-2026-XXXXXX"}` with Nodemailer HTML dispatch.
- **Socket.IO Synchronization**: Real-time event rooms (`event:<eventId>`) broadcasting seat state updates across all connected clients.
- **Role-Based Portals**: Dedicated experience for Customer (`/my-bookings`), Organiser (`/organiser`), and Admin (`/admin`).

---

## 2. Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router v6, Axios, Socket.IO Client, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, Socket.IO, qrcode, Nodemailer, node-cron.
- **Testing**: Jest & Supertest in-memory test runner.

---

## 3. Architecture & Repository Structure

```
ticket booking/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, socket.js)
│   │   ├── models/ (User.js, Venue.js, Seat.js, Event.js, ShowSeat.js, Booking.js, Waitlist.js, WaitlistOffer.js)
│   │   ├── controllers/ (authController.js, eventController.js, seatController.js, bookingController.js, waitlistController.js, etc.)
│   │   ├── routes/ (auth.js, events.js, seats.js, bookings.js, waitlist.js, health.js)
│   │   ├── services/ (qrService.js, emailService.js, waitlistService.js, expiryService.js)
│   │   ├── jobs/ (ttlCleanupJob.js)
│   │   ├── seed.js
│   │   └── server.js
│   ├── tests/ (system.test.js)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar.jsx, VisualSeatMap.jsx, HoldTimer.jsx, ProtectedRoute.jsx)
│   │   ├── pages/ (Home.jsx, Events.jsx, EventDetail.jsx, SeatSelection.jsx, Checkout.jsx, BookingConfirmation.jsx, MyBookings.jsx, WaitlistOfferPage.jsx, OrganiserDashboard.jsx, AdminDashboard.jsx, etc.)
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
EMAIL_FROM="BookSeat <noreply@bookseat.com>"
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 5. Local Setup & Quick Start

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Seed database
cd ../backend && npm run seed

# 3. Start backend API server (Terminal 1)
npm run dev

# 4. Start frontend web app (Terminal 2)
cd ../frontend && npm run dev
```

Visit the app at **`http://localhost:5173`**.

---

## 6. Pre-configured Demo Test Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `password123` | BookSeat Admin (Venues, Users, System Stats) |
| **ORGANISER** | `organiser@example.com` | `password123` | BookSeat Organiser (Event Creation, Revenue Analytics) |
| **CUSTOMER** | `customer@example.com` | `password123` | Customer Seat Holds, Checkout, QR Passes, Bookings |

---

## 7. License & Rights

&copy; 2026 BookSeat. All rights reserved.
