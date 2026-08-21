import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VisualSeatMap from '../components/VisualSeatMap';
import HoldTimer from '../components/HoldTimer';
import { ShoppingBag, AlertCircle, Sparkles, Lock, ArrowRight, UserPlus, Clock } from 'lucide-react';

export default function SeatSelection() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [heldSeats, setHeldSeats] = useState([]); // Currently held seats by user
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState('');
  const [waitlistCategory, setWaitlistCategory] = useState('Premium');

  const fetchSeats = async () => {
    try {
      const res = await API.get(`/events/${eventId}/seats`);
      setSeats(res.data.data.seats);
    } catch (err) {
      console.error('Failed to load seats:', err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const eventRes = await API.get(`/events/${eventId}`);
        setEvent(eventRes.data.data.event);

        await fetchSeats();

        // Subscribe to Socket.IO room for this event
        socket.emit('join_event', eventId);

        socket.on('seat_status_updated', (data) => {
          // Update seats state dynamically when Socket event received
          setSeats((prev) =>
            prev.map((s) => (s.id === data.seatId ? { ...s, status: data.status, holdExpiresAt: data.holdExpiresAt } : s))
          );
        });
      } catch (err) {
        setError('Failed to initialize event seat map');
      } finally {
        setLoading(false);
      }
    };

    initPage();

    return () => {
      socket.emit('leave_event', eventId);
      socket.off('seat_status_updated');
    };
  }, [eventId]);

  const handleToggleSeat = (seat) => {
    setError('');

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  // Execute Seat Hold API
  const handleHoldSeats = async () => {
    if (selectedSeatIds.length === 0) return;
    setError('');
    setHolding(true);

    try {
      const res = await API.post(`/events/${eventId}/seats/hold`, {
        seatIds: selectedSeatIds,
      });

      const { heldSeats: newlyHeld, holdExpiresAt: expires, ttlMinutes } = res.data.data;
      setHeldSeats(newlyHeld);
      setHoldExpiresAt(expires);

      // Navigate to Checkout page with held seats state
      navigate(`/events/${eventId}/checkout`, {
        state: {
          event,
          heldSeats: newlyHeld,
          holdExpiresAt: expires,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'One or more seats could not be held.';
      setError(msg);
      // Refresh seat map to reflect current database locks
      fetchSeats();
      setSelectedSeatIds([]);
    } finally {
      setHolding(false);
    }
  };

  // Join Category Waitlist
  const handleJoinWaitlist = async (category) => {
    try {
      setWaitlistSuccess('');
      setError('');
      const res = await API.post(`/waitlist/events/${eventId}/waitlist`, { category });
      setWaitlistSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join waitlist');
    }
  };

  // Calculate pricing breakdown
  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  // Check if seats of a category are sold out
  const isPremiumSoldOut = seats.length > 0 && seats.filter((s) => s.category === 'Premium' && s.status === 'AVAILABLE').length === 0;
  const isStandardSoldOut = seats.length > 0 && seats.filter((s) => s.category === 'Standard' && s.status === 'AVAILABLE').length === 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Loading real-time seat matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Event Top Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 glass-panel rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-mono">
              {event?.type}
            </span>
            <h1 className="text-xl font-bold text-white">{event?.title}</h1>
          </div>
          <p className="text-xs text-slate-400">
            {event?.venueId?.name} &bull; {event?.date} at {event?.startTime}
          </p>
        </div>

        {holdExpiresAt && (
          <HoldTimer expiresAt={holdExpiresAt} onExpire={() => fetchSeats()} />
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {waitlistSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{waitlistSuccess}</span>
        </div>
      )}

      {/* Visual Seat Layout */}
      <VisualSeatMap
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={handleToggleSeat}
        currentUserId={user?._id}
      />

      {/* Waitlist Drawer if Sold Out */}
      {(isPremiumSoldOut || isStandardSoldOut) && (
        <div className="p-6 glass-panel rounded-2xl border-pink-500/30 space-y-4">
          <div className="flex items-center gap-3 text-pink-400">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Sold-Out Category Waitlist Available</h3>
          </div>
          <p className="text-xs text-slate-300">
            Some seat categories are currently fully held or booked. Join the waitlist to receive an exclusive email link when a cancellation occurs!
          </p>
          <div className="flex flex-wrap gap-3">
            {isPremiumSoldOut && (
              <button
                onClick={() => handleJoinWaitlist('Premium')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-600/20"
              >
                <UserPlus className="w-4 h-4" />
                Join Premium Waitlist
              </button>
            )}
            {isStandardSoldOut && (
              <button
                onClick={() => handleJoinWaitlist('Standard')}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
              >
                <UserPlus className="w-4 h-4" />
                Join Standard Waitlist
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Sticky Checkout Bar */}
      <div className="sticky bottom-4 z-40 p-5 glass-panel rounded-2xl border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Selected Seats</span>
            <span className="text-lg font-extrabold text-white">
              {selectedSeatIds.length > 0
                ? selectedSeatsList.map((s) => s.label).join(', ')
                : 'None Selected'}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Payable</span>
            <span className="text-2xl font-black text-emerald-400">${totalPrice}</span>
          </div>
        </div>

        <button
          disabled={selectedSeatIds.length === 0 || holding}
          onClick={handleHoldSeats}
          className={`flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-xl ${
            selectedSeatIds.length > 0 && !holding
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {holding ? 'Holding Seats...' : 'Hold & Proceed to Checkout'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
