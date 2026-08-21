import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Ticket, Sparkles, ShieldCheck, Zap, ArrowRight, Film, Music, MapPin, Calendar } from 'lucide-react';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/events');
        setFeaturedEvents(res.data.data.events.slice(0, 3));
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Next-Gen Live Ticket Booking Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Reserve Seats <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Instantly</span> with Real-Time Lock & Waitlist
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Experience seamless cinema & concert seat holds, live Socket.IO state synchronization, automated 10-minute TTL expiry, and tokenized waitlist escalation.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/events"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
          >
            Explore Events Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-base px-8 py-4 rounded-2xl transition-all border-slate-700"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Featured Shows & Concerts</h2>
            <p className="text-sm text-slate-400">Handpicked upcoming premium events</p>
          </div>
          <Link to="/events" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All Events &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div
                key={event._id}
                className="group rounded-2xl overflow-hidden glass-panel border-slate-800/80 hover:border-indigo-500/50 transition-all hover:-translate-y-1.5 duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
                        event.type === 'MOVIE' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{event.title}</h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{event.venueId?.name || 'Venue'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{event.date} at {event.startTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">From</span>
                      <span className="text-lg font-black text-emerald-400">${event.categoryPricing.Standard}</span>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Book Seat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl glass-panel space-y-4 border-indigo-500/20">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">10-Minute Hold TTL</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Selected seats are atomically reserved for 10 minutes. Abandoned checkouts release automatically back into the pool.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass-panel space-y-4 border-purple-500/20">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Concurrency Locked</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Database-level atomic conditional queries ensure two customers can never hold or book the exact same seat simultaneously.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass-panel space-y-4 border-pink-500/20">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Tokenized FIFO Waitlist</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sold-out categories support automated waitlist escalation with time-limited email offers when a booking is cancelled.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
