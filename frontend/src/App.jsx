import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import WaitlistOfferPage from './pages/WaitlistOfferPage';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import ManageVenues from './pages/ManageVenues';
import ManageUsers from './pages/ManageUsers';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/waitlist/offer/:token" element={<WaitlistOfferPage />} />

          {/* Customer Routes */}
          <Route
            path="/events/:eventId/select-seats"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ORGANISER', 'ADMIN']}>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/checkout"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ORGANISER', 'ADMIN']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ORGANISER', 'ADMIN']}>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ORGANISER', 'ADMIN']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Organiser Routes */}
          <Route
            path="/organiser"
            element={
              <ProtectedRoute allowedRoles={['ORGANISER', 'ADMIN']}>
                <OrganiserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organiser/create-event"
            element={
              <ProtectedRoute allowedRoles={['ORGANISER', 'ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/venues"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageVenues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="glass-panel border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 Ticketify Inc. Production-Grade Concurrency Seat Booking Engine.</p>
      </footer>
    </div>
  );
}
