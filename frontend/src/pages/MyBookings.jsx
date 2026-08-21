import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Ticket, Calendar, MapPin, XCircle, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      setBookings(res.data.data.bookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Released seats will be offered to the waitlist.')) {
      return;
    }

    setCancellingId(bookingId);
    setMessage('');
    setError('');

    try {
      const res = await API.post(`/bookings/${bookingId}/cancel`);
      setMessage(res.data.message);
      fetchBookings();
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Loading your booking history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">My Booking History</h1>
        <p className="text-sm text-slate-400">View and manage your confirmed ticket reservations</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl space-y-4">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">You haven't placed any show reservations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div
                key={booking._id}
                className={`glass-panel p-6 rounded-2xl space-y-4 border transition-all ${
                  isCancelled ? 'border-rose-950/40 opacity-60' : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider block">
                      REF: {booking.bookingReference}
                    </span>
                    <h3 className="text-lg font-bold text-white">{booking.eventId?.title || 'Event'}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold font-mono uppercase px-2.5 py-1 rounded-full ${
                      isCancelled ? 'bg-rose-950/80 text-rose-400 border border-rose-800' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{booking.eventId?.venueId?.name || 'Venue'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{booking.eventId?.date} at {booking.eventId?.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Seats: {booking.seats.map((s) => s.label).join(', ')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Paid</span>
                    <span className="text-base font-bold text-white">${booking.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 px-3"
                    >
                      <Eye className="w-4 h-4 text-indigo-400" />
                      View Pass
                    </button>

                    {!isCancelled && (
                      <button
                        disabled={cancellingId === booking._id}
                        onClick={() => handleCancelBooking(booking._id)}
                        className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/60 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 px-3"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket QR Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider">
                REF: {selectedBooking.bookingReference}
              </span>
              <h3 className="text-xl font-bold text-white">{selectedBooking.eventId?.title}</h3>
            </div>

            <div className="bg-white p-4 rounded-2xl text-center shadow-lg">
              <img
                src={selectedBooking.qrCodeData}
                alt="Ticket QR Code"
                className="w-48 h-48 mx-auto"
              />
              <p className="text-xs font-mono font-extrabold text-slate-900 mt-2">
                {selectedBooking.bookingReference}
              </p>
            </div>

            <div className="text-xs space-y-1 text-slate-300 text-center">
              <p>Show this code at venue entrance.</p>
              <p className="text-slate-500">Seats: {selectedBooking.seats.map((s) => `${s.label} (${s.category})`).join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
