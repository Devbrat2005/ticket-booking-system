import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import HoldTimer from '../components/HoldTimer';
import { CreditCard, ShieldCheck, Ticket, AlertCircle, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
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
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No Seats Held for Checkout</h2>
        <p className="text-xs text-slate-400">Please select seats from the BookSeat map first.</p>
        <Link to="/events" className="text-violet-400 text-xs font-bold inline-block">
          &larr; Browse BookSeat Catalog
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

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0F19]">
      <Link
        to={`/events/${event._id}/select-seats`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Seat Selection
      </Link>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Complete Your Booking</h1>
          <p className="text-xs text-slate-400 mt-1">Review reserved seats and complete payment simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Order Summary & Sandbox Payment Form */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-violet-400" />
              BookSeat Order Summary
            </h2>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-gray-800 space-y-1.5">
              <h3 className="text-base font-bold text-white">{event.title}</h3>
              <p className="text-xs text-slate-400">
                {event.venueId?.name} &bull; {event.date} at {event.startTime}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Reserved Seats ({heldSeats.length})
              </span>
              <div className="space-y-2">
                {heldSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex justify-between items-center p-3.5 rounded-xl bg-[#0B0F19] border border-gray-800 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-violet-400 text-sm">{seat.label}</span>
                      <span className="text-slate-400 ml-2">({seat.category})</span>
                    </div>
                    <span className="font-bold text-emerald-400">${seat.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#151C2C] border border-violet-500/30 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  BookSeat Payment Simulation
                </h3>
                <p className="text-xs text-slate-400">Secure checkout sandbox</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                Demo Mode
              </span>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
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
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Card Number (Simulated)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-emerald-500/30 text-xs text-slate-300 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Confirming booking will instantly generate your official BookSeat ticket reference and scannable QR pass.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Payment...' : `Confirm Booking ($${totalAmount})`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Timer & Breakdown */}
        <div className="space-y-6">
          <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-400" /> Active Seat Lock Timer
            </h3>
            <HoldTimer expiresAt={holdExpiresAt} />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your seats are temporarily locked. If the timer expires before payment confirmation, seats will automatically release back into the pool.
            </p>
          </div>

          <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-3 text-xs">
            <span className="font-bold text-white block uppercase font-mono border-b border-gray-800 pb-2">
              Pricing Breakdown
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({heldSeats.length} seats)</span>
              <span className="font-bold text-white">${totalAmount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service Fee</span>
              <span className="text-emerald-400 font-bold">$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-white text-base pt-3 border-t border-gray-800">
              <span>Total Amount</span>
              <span className="text-emerald-400 font-black">${totalAmount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
