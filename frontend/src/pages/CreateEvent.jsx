import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Film, Calendar, Clock, MapPin, DollarSign, AlertCircle, ArrowLeft, Plus } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('MOVIE');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState('2026-09-20');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:30');

  const [premiumPrice, setPremiumPrice] = useState(50);
  const [standardPrice, setStandardPrice] = useState(25);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await API.get('/venues');
        setVenues(res.data.data.venues);
        if (res.data.data.venues.length > 0) {
          setVenueId(res.data.data.venues[0]._id);
        }
      } catch (err) {
        console.error('Failed to load venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await API.post('/events', {
        title,
        type,
        description,
        image,
        venueId,
        date,
        startTime,
        endTime,
        categoryPricing: {
          Premium: Number(premiumPrice),
          Standard: Number(standardPrice),
        },
      });

      navigate('/organiser');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link to="/organiser" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        Back to Organiser Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-3xl border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Plus className="w-6 h-6 text-indigo-400" />
            Create New Event
          </h1>
          <p className="text-xs text-slate-400">Configure show timing, venue selection, and category pricing</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Avatar 3 IMAX Release"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="MOVIE">MOVIE</option>
                <option value="CONCERT">CONCERT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Select Venue</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {venues.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.location})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Event Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event overview and highlights..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Cover Image URL (Optional)</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Pricing Config */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Category-Wise Ticket Pricing ($)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-amber-400 font-bold block">Premium Price</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block">Standard Price</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={standardPrice}
                  onChange={(e) => setStandardPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono mt-1"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-indigo-600/30"
          >
            {submitting ? 'Initializing Show Seats...' : 'Publish Event & Initialize Seats'}
          </button>
        </form>
      </div>
    </div>
  );
}
