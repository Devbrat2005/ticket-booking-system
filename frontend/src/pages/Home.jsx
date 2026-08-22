import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import logo from '../assets/logo.png';
import { Search, Film, Music, ShieldCheck, Zap, Ticket, Clock, MapPin, Calendar, Sparkles, ArrowRight, Star, Armchair } from 'lucide-react';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/events');
        setFeaturedEvents(res.data.data.events);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/events');
    }
  };

  const filteredEvents = featuredEvents.filter((ev) => {
    if (activeCategory === 'MOVIES') return ev.type === 'MOVIE';
    if (activeCategory === 'CONCERTS') return ev.type === 'CONCERT';
    return true;
  });

  return (
    <div className="space-y-20 pb-20 bg-[#0B0F19]">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-12">
        {/* Background Backdrop Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=2000"
            alt="Cinematic Venue Backdrop"
            className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-[#0B0F19]/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-transparent to-[#0B0F19]"></div>
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider shadow-xl shadow-violet-600/10 font-mono">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Official Ticket Booking Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-none">
            Your Seat. <span className="gradient-text-brand">Your Experience.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Book tickets for your favorite movies, concerts, and live events. Real-time seat locks, 10-minute hold TTL, instant QR passes, and automated waitlists.
          </p>

          {/* Search & Action CTAs */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative group">
            <div className="flex items-center bg-[#151C2C] border border-gray-800 rounded-2xl p-2 shadow-2xl focus-within:border-violet-500 transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search movies, concerts, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-bold text-sm px-7 py-3 rounded-xl transition-all shadow-lg shadow-violet-600/30 shrink-0"
              >
                Explore Events
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Link
              to="/events"
              className="bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-violet-600/30 flex items-center gap-2 hover:scale-105 transition-all"
            >
              Explore Events
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/events"
              className="bg-[#151C2C] hover:bg-gray-800 border border-gray-800 text-slate-200 hover:text-white font-bold text-sm px-7 py-3.5 rounded-2xl transition-all"
            >
              View Upcoming Shows
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURED EVENTS CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Featured Movies & Concerts</h2>
            <p className="text-sm text-slate-400 mt-1">Book your seats for trending blockbuster screenings and live stadium acts</p>
          </div>

          <div className="flex items-center gap-2 bg-[#151C2C] p-1.5 rounded-xl border border-gray-800 text-xs font-bold">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeCategory === 'ALL' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Shows
            </button>
            <button
              onClick={() => setActiveCategory('MOVIES')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeCategory === 'MOVIES' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveCategory('CONCERTS')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeCategory === 'CONCERTS' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Concerts
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-[#151C2C] animate-pulse border border-gray-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="group rounded-3xl overflow-hidden glass-card glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151C2C] via-transparent to-transparent opacity-90"></div>
                    
                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase font-mono px-3 py-1 rounded-full shadow-lg ${
                          event.type === 'MOVIE' ? 'bg-violet-600 text-white' : 'bg-pink-600 text-white'
                        }`}
                      >
                        {event.type}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0B0F19]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-400 text-xs font-bold border border-gray-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      4.9
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-gray-800/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="truncate">{event.venueId?.name || 'Venue'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
                        <span>{event.date} at {event.startTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Starting From</span>
                      <span className="text-xl font-black text-emerald-400">${event.categoryPricing?.Standard}</span>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center gap-1.5"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. WHY CHOOSE TICKET BOOKING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Why Book Your Seats With Ticket Booking</h2>
          <p className="text-sm text-slate-400">Engineered with real-time seat locks and automated waitlist escalation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-7 rounded-3xl glass-card space-y-4 border-violet-500/20">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Real-Time Seat Locks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive visual seat map with instant Socket.IO state synchronization across concurrent users.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-card space-y-4 border-purple-500/20">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">10-Minute Hold TTL</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Atomically holds selected seats for 10 minutes during checkout. Unpaid holds release automatically.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-card space-y-4 border-pink-500/20">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Instant QR Tickets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates unique ticket references with scannable QR code passes emailed directly to your inbox.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-card space-y-4 border-emerald-500/20">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Automated Waitlist</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sold-out categories trigger tokenized FIFO email offers when bookings are cancelled.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="border-t border-gray-800/80 bg-[#0B0F19] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-800">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Ticket Booking" className="h-8 w-auto object-contain" />
            </Link>
            <div className="flex flex-wrap gap-6 text-xs text-slate-400 font-semibold">
              <Link to="/events?type=MOVIE" className="hover:text-white transition-colors">Movies</Link>
              <Link to="/events?type=CONCERT" className="hover:text-white transition-colors">Concerts</Link>
              <Link to="/events" className="hover:text-white transition-colors">Events</Link>
              <Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 font-mono">
            &copy; 2026 Ticket Booking. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
