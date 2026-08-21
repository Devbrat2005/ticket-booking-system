import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Shield, Users, MapPin, Film, DollarSign, Plus, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-extrabold text-white">System Administration</h1>
          </div>
          <p className="text-sm text-slate-400">Global venue layout management, user role management, system metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/venues"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-amber-600/20 hover:scale-105 transition-all"
          >
            <MapPin className="w-5 h-5" />
            Manage Venues & Seat Layouts
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 glass-panel hover:bg-slate-800 text-slate-200 font-bold text-sm px-6 py-3 rounded-2xl transition-all"
          >
            <Users className="w-5 h-5 text-indigo-400" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 glass-panel rounded-2xl space-y-2 border-amber-500/20">
          <span className="text-xs font-mono uppercase font-bold text-slate-400">Total Users</span>
          <p className="text-3xl font-black text-white">{stats?.users?.total || 0}</p>
          <div className="flex gap-2 text-[10px] text-amber-300 font-mono">
            <span>Cust: {stats?.users?.customers}</span> &bull;
            <span>Org: {stats?.users?.organisers}</span> &bull;
            <span>Admin: {stats?.users?.admins}</span>
          </div>
        </div>

        <div className="p-6 glass-panel rounded-2xl space-y-2 border-indigo-500/20">
          <span className="text-xs font-mono uppercase font-bold text-slate-400">Configured Venues</span>
          <p className="text-3xl font-black text-white">{stats?.venues?.total || 0}</p>
          <span className="text-[10px] text-indigo-300">With physical seat maps</span>
        </div>

        <div className="p-6 glass-panel rounded-2xl space-y-2 border-purple-500/20">
          <span className="text-xs font-mono uppercase font-bold text-slate-400">System Events</span>
          <p className="text-3xl font-black text-white">{stats?.events?.total || 0}</p>
          <span className="text-[10px] text-purple-300">{stats?.events?.active} currently active</span>
        </div>

        <div className="p-6 glass-panel rounded-2xl space-y-2 border-emerald-500/20">
          <span className="text-xs font-mono uppercase font-bold text-slate-400">Platform Revenue</span>
          <p className="text-3xl font-black text-emerald-400">${stats?.bookings?.totalSystemRevenue || 0}</p>
          <span className="text-[10px] text-emerald-300">{stats?.bookings?.totalTicketsSold || 0} total tickets sold</span>
        </div>
      </div>
    </div>
  );
}
