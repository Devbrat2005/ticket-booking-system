import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Calendar, Clock, MapPin, Film, Tag, ArrowRight, ShieldCheck, Ticket, Star, Sparkles } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [seatStats, setSeatStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data.data.event);

        // Fetch seat stats
        const seatsRes = await API.get(`/events/${id}/seats`);
        const seats = seatsRes.data.data.seats;
        const available = seats.filter((s) => s.status === 'AVAILABLE').length;
        setSeatStats({ total: seats.length, available });
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
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-[450px] rounded-3xl bg-[#151C2C] animate-pulse border border-gray-800"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <Link to="/events" className="text-violet-400 text-xs font-bold inline-block">
          &larr; Return to Event Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0F19]">
      
      {/* Banner & Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-card border-gray-800 shadow-2xl">
        <div className="h-96 sm:h-[420px] relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151C2C] via-[#151C2C]/60 to-transparent"></div>
          
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span
              className={`text-xs font-extrabold uppercase font-mono px-3.5 py-1.5 rounded-full shadow-lg ${
                event.type === 'MOVIE' ? 'bg-violet-600 text-white' : 'bg-pink-600 text-white'
              }`}
            >
              {event.type}
            </span>
            <span className="bg-[#0B0F19]/80 backdrop-blur-md px-3 py-1 rounded-full text-amber-400 text-xs font-bold border border-gray-700 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 Rating
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8 space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">{event.title}</h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-400" /> {event.venueId?.name} ({event.venueId?.location})
            </p>
          </div>
        </div>

        {/* Two-Column Desktop Content Section */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Description & Metadata */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Showtimes & Venue Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#0B0F19] border border-gray-800">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-violet-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Show Date</p>
                  <p className="text-sm font-bold text-white">{event.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-pink-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Showtime</p>
                  <p className="text-sm font-bold text-white">{event.startTime} - {event.endTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Seat Availability</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {seatStats ? `${seatStats.available} / ${seatStats.total} Seats` : 'Available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">About the Show</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{event.description}</p>
            </div>

            {/* Category Pricing Cards */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="text-lg font-bold text-white">Ticket Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                      Premium Category (VIP)
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">Prime viewing row with extra legroom</p>
                  </div>
                  <span className="text-2xl font-black text-amber-300">${event.categoryPricing?.Premium}</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B0F19] border border-gray-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Standard Category
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">Regular auditorium seating grid</p>
                  </div>
                  <span className="text-2xl font-black text-slate-200">${event.categoryPricing?.Standard}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Booking Box CTA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0B0F19] border border-violet-500/30 space-y-6 shadow-2xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Starting Price</span>
                <span className="text-3xl font-black text-emerald-400">${event.categoryPricing?.Standard}</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10-Minute Hold Lock protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Interactive visual seat selector</span>
                </div>
              </div>

              <Link
                to={`/events/${event._id}/select-seats`}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2"
              >
                Select Seats Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
