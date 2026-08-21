import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Film, Calendar, Ticket, DollarSign, Plus, Eye, BarChart3, TrendingUp, Users } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Create Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Organiser Dashboard</h1>
          <p className="text-sm text-slate-400">Event performance, ticket analytics, and revenue summary</p>
        </div>
        <Link
          to="/organiser/create-event"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </Link>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 glass-panel rounded-2xl space-y-2 border-indigo-500/20">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-400">Total Events</span>
            <Film className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{metrics?.totalEvents || 0}</p>
          <span className="text-[10px] text-indigo-300">{metrics?.upcomingEvents || 0} upcoming</span>
        </div>

        <div className="p-6 glass-panel rounded-2xl space-y-2 border-purple-500/20">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-400">Tickets Sold</span>
            <Ticket className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{metrics?.totalTicketsSold || 0}</p>
          <span className="text-[10px] text-purple-300">Across {metrics?.totalBookings || 0} bookings</span>
        </div>

        <div className="p-6 glass-panel rounded-2xl space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-400">Total Revenue</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-emerald-400">${metrics?.totalRevenue || 0}</p>
          <span className="text-[10px] text-emerald-300">Backend aggregate total</span>
        </div>

        <div className="p-6 glass-panel rounded-2xl space-y-2 border-pink-500/20">
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-400">Confirmed Orders</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{metrics?.totalBookings || 0}</p>
          <span className="text-[10px] text-pink-300">Live completed checkouts</span>
        </div>
      </div>

      {/* Per-Event Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Event Revenue & Seat Allocation Summary
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4 rounded-l-xl">Event Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Venue</th>
                <th className="p-4 text-center">Capacity</th>
                <th className="p-4 text-center">Sold Seats</th>
                <th className="p-4 text-center">Available</th>
                <th className="p-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {eventSummaries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                        item.type === 'MOVIE' ? 'bg-indigo-600/30 text-indigo-300' : 'bg-purple-600/30 text-purple-300'
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
                  <td className="p-4 text-center font-bold text-indigo-300">{item.availableSeats}</td>
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
