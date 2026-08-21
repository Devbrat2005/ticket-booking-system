import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Ticket, Calendar, MapPin, XCircle, Eye, AlertCircle, CheckCircle, Clock, Armchair } from 'lucide-react';

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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
        <p className="text-xs text-slate-400">Loading your BookSeat tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0F19]">
      <div>
        <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
        <p className="text-sm text-slate-400 mt-1">View your confirmed BookSeat ticket passes and QR codes</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">You haven't placed any event bookings on BookSeat yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div
                key={booking._id}
                className={`bg-[#151C2C] p-6 rounded-3xl space-y-4 border transition-all ${
                  isCancelled ? 'border-rose-950/60 opacity-60' : 'border-gray-800 hover:border-violet-500/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-violet-400 tracking-wider block uppercase">
                      REF: {booking.bookingReference}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{booking.eventId?.title || 'Event'}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full ${
                      isCancelled ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>{booking.eventId?.venueId?.name || 'Venue'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>{booking.eventId?.date} at {booking.eventId?.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Seats: {booking.seats.map((s) => `${s.label} (${s.category})`).join(', ')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Paid</span>
                    <span className="text-lg font-extrabold text-white">${booking.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3.5 py-2 bg-[#0B0F19] border border-gray-800 hover:border-violet-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-violet-400" />
                      View Ticket
                    </button>

                    {!isCancelled && (
                      <button
                        disabled={cancellingId === booking._id}
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-3.5 py-2 bg-rose-950/40 border border-rose-900 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BookSeat Ticket Pass Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151C2C] border border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-violet-400 tracking-wider block">
                REF: {selectedBooking.bookingReference}
              </span>
              <h3 className="text-xl font-bold text-white">{selectedBooking.eventId?.title}</h3>
            </div>

            <div className="bg-white p-5 rounded-2xl text-center shadow-xl border border-gray-200">
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
              <p className="font-bold text-white">Show this QR code at the venue entrance.</p>
              <p className="text-slate-400">Seats: {selectedBooking.seats.map((s) => `${s.label} (${s.category})`).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
