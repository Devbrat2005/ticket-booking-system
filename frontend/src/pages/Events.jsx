import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { Search, Filter, Calendar, MapPin, Film, Music, ArrowUpDown, ArrowRight, RotateCcw, Star } from 'lucide-react';

export default function Events() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0F19]">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Event Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">Discover upcoming movie screenings and live tour performances</p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151C2C] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Two Column Layout: Filter Panel (Left) & Cards Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 bg-[#151C2C] border border-gray-800 p-6 rounded-3xl space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-violet-400" />
              Filter & Sort
            </h3>
            {(search || type || venueId || date) && (
              <button
                onClick={clearFilters}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Event Type Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">Show Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">All Categories</option>
                <option value="MOVIE">Movies Only</option>
                <option value="CONCERT">Concerts Only</option>
              </select>
            </div>

            {/* Venue Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">Venue Location</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">All Venues</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">Filter by Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Sorting */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="date">Date (Earliest First)</option>
                <option value="date_desc">Date (Latest First)</option>
                <option value="name">Title (A to Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Events Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-3xl bg-[#151C2C] animate-pulse border border-gray-800"></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4">
              <Film className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Matching Events Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearFilters}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="group rounded-3xl overflow-hidden glass-card glass-card-hover flex flex-col justify-between"
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
                          className={`text-[10px] font-extrabold uppercase font-mono px-3 py-1 rounded-full ${
                            event.type === 'MOVIE' ? 'bg-violet-600 text-white' : 'bg-pink-600 text-white'
                          }`}
                        >
                          {event.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span className="truncate">{event.venueId?.name || 'Venue'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span>{event.date} at {event.startTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">From</span>
                        <span className="text-lg font-black text-emerald-400">${event.categoryPricing?.Standard}</span>
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-lg shadow-violet-600/20"
                      >
                        Select Seats
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
