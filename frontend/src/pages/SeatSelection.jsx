import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VisualSeatMap from '../components/VisualSeatMap';
import HoldTimer from '../components/HoldTimer';
import { AlertCircle, Sparkles, ArrowRight, UserPlus, Clock, Film, MapPin, Calendar, CheckCircle, Armchair } from 'lucide-react';

export default function SeatSelection() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [heldSeats, setHeldSeats] = useState([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState('');

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

        socket.emit('join_event', eventId);

        socket.on('seat_status_updated', (data) => {
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

  const handleHoldSeats = async () => {
    if (selectedSeatIds.length === 0) return;
    setError('');
    setHolding(true);

    try {
      const res = await API.post(`/events/${eventId}/seats/hold`, {
        seatIds: selectedSeatIds,
      });

      const { heldSeats: newlyHeld, holdExpiresAt: expires } = res.data.data;
      setHeldSeats(newlyHeld);
      setHoldExpiresAt(expires);

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
      fetchSeats();
      setSelectedSeatIds([]);
    } finally {
      setHolding(false);
    }
  };

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

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  const isPremiumSoldOut = seats.length > 0 && seats.filter((s) => s.category === 'Premium' && s.status === 'AVAILABLE').length === 0;
  const isStandardSoldOut = seats.length > 0 && seats.filter((s) => s.category === 'Standard' && s.status === 'AVAILABLE').length === 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
        <p className="text-xs text-slate-400">Loading Ticket Booking visual grid & live locks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0B0F19]">
      
      {/* Event Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-[#151C2C] border border-gray-800 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-white font-mono tracking-wider">
              Ticket Booking Selection &bull;
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/30 font-mono">
              {event?.type}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{event?.title}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-violet-400" /> {event?.venueId?.name} &bull; <Calendar className="w-3.5 h-3.5 text-pink-400" /> {event?.date} at {event?.startTime}
          </p>
        </div>

        {holdExpiresAt && (
          <div className="flex items-center gap-2">
            <HoldTimer expiresAt={holdExpiresAt} onExpire={() => fetchSeats()} />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {waitlistSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{waitlistSuccess}</span>
        </div>
      )}

      {/* Main Seat Map Grid */}
      <VisualSeatMap
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={handleToggleSeat}
        currentUserId={user?._id}
      />

      {/* Waitlist Drawer if Category Sold Out */}
      {(isPremiumSoldOut || isStandardSoldOut) && (
        <div className="p-6 bg-[#151C2C] border border-pink-500/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-pink-400">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Sold-Out Category Waitlist Active</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            One or more categories are currently fully reserved. Join the waitlist to receive an automated email offer when a booking is cancelled!
          </p>
          <div className="flex flex-wrap gap-3">
            {isPremiumSoldOut && (
              <button
                onClick={() => handleJoinWaitlist('Premium')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-600/20"
              >
                <UserPlus className="w-4 h-4" /> Join VIP Waitlist
              </button>
            )}
            {isStandardSoldOut && (
              <button
                onClick={() => handleJoinWaitlist('Standard')}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
              >
                <UserPlus className="w-4 h-4" /> Join Standard Waitlist
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Booking Bar */}
      <div className="sticky bottom-4 z-40 p-5 bg-[#151C2C]/95 backdrop-blur-md border border-violet-500/30 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Selected Seats</span>
            <span className="text-lg font-black text-white">
              {selectedSeatIds.length > 0
                ? selectedSeatsList.map((s) => s.label).join(', ')
                : 'None Selected'}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Amount</span>
            <span className="text-2xl font-black text-emerald-400">${totalPrice}</span>
          </div>
        </div>

        <button
          disabled={selectedSeatIds.length === 0 || holding}
          onClick={handleHoldSeats}
          className={`flex items-center gap-2 font-extrabold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-xl ${
            selectedSeatIds.length > 0 && !holding
              ? 'bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white shadow-violet-600/30 hover:scale-105'
              : 'bg-gray-800 text-slate-500 cursor-not-allowed border border-gray-700'
          }`}
        >
          {holding ? 'Locking Seats...' : 'Continue to Checkout'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
