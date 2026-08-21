import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Filter, Calendar, MapPin, Film, Music, ArrowUpDown, Tag } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await API.get('/venues');
        setVenues(res.data.data.venues);
      } catch (err) {
        console.error('Error loading venues:', err);
      }
    };
    fetchVenues();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (venueId) params.append('venueId', venueId);
      if (date) params.append('date', date);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await API.get(`/events?${params.toString()}`);
      setEvents(res.data.data.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, type, venueId, date, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setType('');
    setVenueId('');
    setDate('');
    setSortBy('date');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Event Catalog</h1>
        <p className="text-sm text-slate-400">Discover upcoming blockbuster movies and live concert shows</p>
      </div>

      {/* Filter Bar */}
      <div className="p-5 glass-panel rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Event Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types (Movie & Concert)</option>
            <option value="MOVIE">Movies Only</option>
            <option value="CONCERT">Concerts Only</option>
          </select>

          {/* Venue Filter */}
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Venues</option>
            {venues.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="date">Sort by Date (Asc)</option>
            <option value="date_desc">Sort by Date (Desc)</option>
            <option value="name">Sort by Title (A-Z)</option>
          </select>
        </div>

        {(search || type || venueId || date) && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Filters active</span>
            <button
              onClick={clearFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl space-y-4">
          <Film className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Events Found</h3>
          <p className="text-sm text-slate-400">Try clearing your filters or search term.</p>
          <button
            onClick={clearFilters}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event._id}
              className="group rounded-2xl overflow-hidden glass-panel border-slate-800/80 hover:border-indigo-500/50 transition-all hover:-translate-y-1.5 duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                        event.type === 'MOVIE' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 text-xs text-slate-300 pt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{event.venueId?.name || 'Venue'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{event.date} at {event.startTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">From</span>
                    <span className="text-lg font-black text-emerald-400">${event.categoryPricing?.Standard}</span>
                  </div>
                  <Link
                    to={`/events/${event._id}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
