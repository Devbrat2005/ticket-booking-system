import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Calendar, Clock, MapPin, Film, Tag, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data.data.event);
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-96 rounded-2xl bg-slate-900 animate-pulse"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <Link to="/events" className="text-indigo-400 text-sm mt-4 inline-block">
          &larr; Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Event Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border-slate-800">
        <div className="h-80 sm:h-96 relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 space-y-4">
            <span
              className={`text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full ${
                event.type === 'MOVIE' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
              }`}
            >
              {event.type}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white">{event.title}</h1>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Date</p>
                <p className="text-sm font-bold text-white">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Time</p>
                <p className="text-sm font-bold text-white">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Venue</p>
                <p className="text-sm font-bold text-white">{event.venueId?.name}</p>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">About the Event</h3>
            <p className="text-slate-300 leading-relaxed text-sm">{event.description}</p>
          </div>

          {/* Pricing Tier */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white">Category Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Premium Category
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">VIP Rows with prime viewing angles</p>
                </div>
                <span className="text-2xl font-black text-amber-300">${event.categoryPricing?.Premium}</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Standard Category
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">Regular seating layout</p>
                </div>
                <span className="text-2xl font-black text-slate-200">${event.categoryPricing?.Standard}</span>
              </div>
            </div>
          </div>

          {/* Book Action */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-time seat holds backed by 10-minute hold TTL lock</span>
            </div>

            <Link
              to={`/events/${event._id}/select-seats`}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              Select Seats Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
