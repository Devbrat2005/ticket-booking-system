import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import HoldTimer from '../components/HoldTimer';
import { CreditCard, ShieldCheck, Ticket, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const event = location.state?.event;
  const heldSeats = location.state?.heldSeats || [];
  const holdExpiresAt = location.state?.holdExpiresAt;
  const offerToken = location.state?.offerToken;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardName, setCardName] = useState('Alex Johnson');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  if (!event || heldSeats.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">No Seats Held for Checkout</h2>
        <p className="text-xs text-slate-400 mt-2">Please select seats from the seat map first.</p>
        <Link to="/events" className="text-indigo-400 text-xs font-semibold mt-4 inline-block">
          &larr; Browse Catalog
        </Link>
      </div>
    );
  }

  const totalAmount = heldSeats.reduce((sum, s) => sum + s.price, 0);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/bookings', {
        eventId: event._id,
        seatIds: heldSeats.map((s) => s.id),
        offerToken: offerToken || undefined,
      });

      const { booking } = res.data.data;

      // Trigger celebratory confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Navigate to Booking Confirmation Page
      navigate('/booking-confirmation', {
        state: { booking },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to={`/events/${event._id}/select-seats`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Seat Map
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Summary & Mock Payment Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 glass-panel rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              Order Summary
            </h2>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-white">{event.title}</h3>
              <p className="text-xs text-slate-400">
                {event.venueId?.name} &bull; {event.date} at {event.startTime}
              </p>
            </div>

            {/* Seats List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Reserved Seats
              </span>
              <div className="space-y-2">
                {heldSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-400 text-sm">{seat.label}</span>
                      <span className="text-slate-400 ml-2">({seat.category})</span>
                    </div>
                    <span className="font-bold text-emerald-400">${seat.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated Payment Section */}
          <div className="p-6 glass-panel rounded-2xl space-y-6 border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Mock Payment Confirmation
                </h3>
                <p className="text-xs text-slate-400">Safe sandbox checkout simulation</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                Demo Mode
              </span>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Name on Card</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Card Number (Simulated)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Clicking pay will immediately generate your unique booking reference & QR ticket.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Payment...' : `Pay $${totalAmount} & Confirm Booking`}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Hold TTL Timer & Info */}
        <div className="space-y-6">
          <div className="p-6 glass-panel rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Active Hold Timer</h3>
            <HoldTimer expiresAt={holdExpiresAt} />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your seats are locked strictly for this session. If timer expires before payment confirmation, seats will automatically release to other customers.
            </p>
          </div>

          <div className="p-6 glass-panel rounded-2xl space-y-3 text-xs">
            <span className="font-bold text-slate-200 block uppercase font-mono">Total Breakdown</span>
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({heldSeats.length} seats)</span>
              <span>${totalAmount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Booking Fee</span>
              <span className="text-emerald-400">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
              <span>Total</span>
              <span className="text-emerald-400">${totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
