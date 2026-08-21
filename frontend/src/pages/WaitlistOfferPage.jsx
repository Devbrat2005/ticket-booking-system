import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import HoldTimer from '../components/HoldTimer';
import { Ticket, Sparkles, Clock, AlertCircle, CheckCircle, ArrowRight, Zap, Armchair } from 'lucide-react';

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
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
        <p className="text-xs text-slate-400">Verifying BookSeat waitlist token...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 bg-[#151C2C] border border-gray-800 rounded-3xl mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Offer Expired or Invalid</h2>
        <p className="text-xs text-slate-400">{error || 'This waitlist offer link is no longer active.'}</p>
        <Link to="/events" className="text-violet-400 text-xs font-bold inline-block">
          &larr; Browse Available Events
        </Link>
      </div>
    );
  }

  if (declineMessage) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 bg-[#151C2C] border border-gray-800 rounded-3xl mt-12">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Offer Declined</h2>
        <p className="text-xs text-slate-300">{declineMessage}</p>
        <Link to="/events" className="text-violet-400 text-xs font-bold inline-block">
          &larr; Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8 bg-[#0B0F19]">
      <div className="bg-[#151C2C] p-8 rounded-3xl border border-pink-500/50 space-y-6 text-center shadow-2xl glow-pink">
        <div className="w-16 h-16 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mx-auto shadow-lg shadow-pink-500/20 animate-bounce">
          <Zap className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-extrabold uppercase px-3.5 py-1 rounded-full bg-pink-950 text-pink-300 border border-pink-800 tracking-wider">
            Urgent BookSeat Offer
          </span>
          <h1 className="text-3xl font-black text-white mt-3">Your Seat Is Available!</h1>
          <p className="text-xs text-slate-300 mt-1">A seat has become available for you on BookSeat.</p>
        </div>

        {/* Reserved Seat Details */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-gray-800 space-y-3 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono uppercase">Event</span>
            <span className="font-bold text-white truncate max-w-[200px]">{offer.event?.title}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono uppercase">Category</span>
            <span className="font-bold text-amber-400">{offer.category}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono uppercase">Reserved Seat</span>
            <span className="font-mono font-bold text-violet-400 text-sm">{offer.seat?.label}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-gray-800 pt-3">
            <span className="text-slate-400 font-mono uppercase">Time Remaining</span>
            <HoldTimer expiresAt={offer.expiresAt} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            disabled={actionLoading || offer.isExpired}
            onClick={handleAcceptOffer}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2"
          >
            {actionLoading ? 'Processing...' : 'Accept & Book'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            disabled={actionLoading}
            onClick={handleDeclineOffer}
            className="w-full py-3 bg-[#0B0F19] hover:bg-gray-900 text-rose-400 font-bold text-xs rounded-2xl border border-gray-800 transition-colors"
          >
            Decline Offer & Pass to Next Customer
          </button>
        </div>
      </div>
    </div>
  );
}
