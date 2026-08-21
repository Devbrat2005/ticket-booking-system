import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import HoldTimer from '../components/HoldTimer';
import { Ticket, Sparkles, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function WaitlistOfferPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [declineMessage, setDeclineMessage] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await API.get(`/waitlist/offers/${token}`);
        setOffer(res.data.data.offer);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired waitlist offer token.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [token]);

  const handleAcceptOffer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const res = await API.post(`/waitlist/offers/${token}/accept`);
      const { eventId, seatIds, offerToken } = res.data.data;

      // Fetch event & seat details to populate Checkout state
      const eventRes = await API.get(`/events/${eventId}`);
      const seatsRes = await API.get(`/events/${eventId}/seats`);

      const heldSeat = seatsRes.data.data.seats.find((s) => s.id === seatIds[0]);

      navigate(`/events/${eventId}/checkout`, {
        state: {
          event: eventRes.data.data.event,
          heldSeats: [heldSeat],
          holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          offerToken,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const res = await API.post(`/waitlist/offers/${token}/decline`);
      setDeclineMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline offer.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Verifying waitlist ticket token...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 glass-panel rounded-3xl mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Offer Expired or Invalid</h2>
        <p className="text-xs text-slate-400">{error || 'This waitlist offer link is no longer valid.'}</p>
        <Link to="/events" className="text-indigo-400 text-xs font-bold inline-block">
          &larr; Browse Available Events
        </Link>
      </div>
    );
  }

  if (declineMessage) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 glass-panel rounded-3xl mt-12">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Offer Declined</h2>
        <p className="text-xs text-slate-300">{declineMessage}</p>
        <Link to="/events" className="text-indigo-400 text-xs font-bold inline-block">
          &larr; Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <div className="glass-panel p-8 rounded-3xl border-pink-500/40 space-y-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mx-auto shadow-lg shadow-pink-500/20 animate-pulse">
          <Sparkles className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-pink-950 text-pink-300 border border-pink-800">
            Exclusive Waitlist Ticket Offer
          </span>
          <h1 className="text-2xl font-black text-white mt-3">{offer.event?.title}</h1>
          <p className="text-xs text-slate-300 mt-1">{offer.event?.venueId?.name}</p>
        </div>

        {/* Seat Offer Info */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 uppercase font-mono">Seat Category</span>
            <span className="font-bold text-amber-400">{offer.category}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 uppercase font-mono">Reserved Seat</span>
            <span className="font-mono font-bold text-indigo-400">{offer.seat?.label}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
            <span className="text-slate-400 uppercase font-mono">Time Remaining</span>
            <HoldTimer expiresAt={offer.expiresAt} />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            disabled={actionLoading || offer.isExpired}
            onClick={handleAcceptOffer}
            className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2"
          >
            {actionLoading ? 'Processing...' : 'Accept Offer & Proceed to Checkout'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            disabled={actionLoading}
            onClick={handleDeclineOffer}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-rose-400 font-semibold text-xs rounded-2xl border border-slate-800 transition-colors"
          >
            Decline Offer & Pass to Next Customer
          </button>
        </div>
      </div>
    </div>
  );
}
