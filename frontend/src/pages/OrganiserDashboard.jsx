import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Film, Calendar, Ticket, DollarSign, Plus, Eye, BarChart3, TrendingUp, Users, Sparkles, Armchair } from 'lucide-react';

export default function OrganiserDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [eventSummaries, setEventSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganiserData = async () => {
      try {
        const res = await API.get('/organiser/events');
        setMetrics(res.data.data.metrics);
        setEventSummaries(res.data.data.eventSummaries);
      } catch (err) {
        console.error('Failed to load organiser dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganiserData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
        <p className="text-xs text-slate-400">Loading BookSeat organiser stats...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0F19]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Armchair className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-black uppercase text-violet-400 font-mono tracking-widest">
              MANAGEMENT PORTAL
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">BookSeat Organiser</h1>
          <p className="text-sm text-slate-400 mt-1">Show performance, ticket allocation analytics, and total revenue</p>
        </div>
        <Link
          to="/organiser/create-event"
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-violet-600/30 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </Link>
      </div>

      {/* Aggregate Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 bg-[#151C2C] border border-violet-500/30 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-violet-400">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Events</span>
            <Film className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-white">{metrics?.totalEvents || 0}</p>
          <span className="text-xs font-mono text-violet-400 font-bold">{metrics?.upcomingEvents || 0} upcoming shows</span>
        </div>

        <div className="p-6 bg-[#151C2C] border border-purple-500/30 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Tickets Sold</span>
            <Ticket className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-white">{metrics?.totalTicketsSold || 0}</p>
          <span className="text-xs font-mono text-purple-400 font-bold">{metrics?.totalBookings || 0} completed orders</span>
        </div>

        <div className="p-6 bg-[#151C2C] border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Revenue</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-emerald-400">${metrics?.totalRevenue || 0}</p>
          <span className="text-xs font-mono text-emerald-300 font-bold">Backend aggregate total</span>
        </div>

        <div className="p-6 bg-[#151C2C] border border-pink-500/30 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Bookings</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-white">{metrics?.totalBookings || 0}</p>
          <span className="text-xs font-mono text-pink-400 font-bold">Live checkouts</span>
        </div>

      </div>

      {/* Per-Event Breakdown Table */}
      <div className="bg-[#151C2C] border border-gray-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          Event Performance & Seat Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4 rounded-l-xl">Event Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Venue</th>
                <th className="p-4 text-center">Capacity</th>
                <th className="p-4 text-center">Sold Seats</th>
                <th className="p-4 text-center">Available</th>
                <th className="p-4 text-right rounded-r-xl">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {eventSummaries.map((item) => (
                <tr key={item.id} className="hover:bg-[#0B0F19]/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                        item.type === 'MOVIE' ? 'bg-violet-600/30 text-violet-300' : 'bg-pink-600/30 text-pink-300'
                      }`}
                    >
                      {item.type}
                    </span>
                    {item.title}
                  </td>
                  <td className="p-4 font-mono">{item.date}</td>
                  <td className="p-4 text-slate-400">{item.venue}</td>
                  <td className="p-4 text-center font-bold text-white">{item.capacity}</td>
                  <td className="p-4 text-center font-bold text-emerald-400">{item.soldSeats}</td>
                  <td className="p-4 text-center font-bold text-violet-300">{item.availableSeats}</td>
                  <td className="p-4 text-right font-black text-emerald-400 text-sm">${item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
