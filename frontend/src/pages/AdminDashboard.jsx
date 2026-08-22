import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Users, Building2, Calendar, Ticket, Shield, ArrowRight, Activity, DollarSign, Armchair } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data.data.stats);
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
        <p className="text-xs text-slate-400">Loading Ticket Booking admin stats...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0F19]">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Ticket Booking Admin</h1>
          <p className="text-sm text-slate-400">Global system metrics, user authorization, and venue grid management</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase font-bold">Total Platform Users</span>
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-4xl font-black text-white">{stats?.users?.total || 0}</p>
          <div className="flex gap-4 text-xs font-mono text-slate-400 pt-1">
            <span>Customers: {stats?.users?.customers || 0}</span>
            <span>Organisers: {stats?.users?.organisers || 0}</span>
          </div>
        </div>

        <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase font-bold">Registered Venues</span>
            <Building2 className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-4xl font-black text-white">{stats?.venues?.total || 0}</p>
          <span className="text-xs font-mono text-pink-400 font-bold">Active seating auditoriums</span>
        </div>

        <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase font-bold">System Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-black text-emerald-400">${stats?.revenue || 0}</p>
          <span className="text-xs font-mono text-slate-400">{stats?.bookings?.confirmed || 0} confirmed ticket passes</span>
        </div>

      </div>

      {/* Admin Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="p-8 bg-[#151C2C] border border-violet-500/30 rounded-3xl space-y-4 shadow-xl">
          <Building2 className="w-10 h-10 text-violet-400" />
          <h2 className="text-xl font-bold text-white">Venue Grid Management</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Create cinema auditoriums and concert halls. Configure rows, seats per row, and category allocations.
          </p>
          <Link
            to="/admin/venues"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            Manage Venues
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-8 bg-[#151C2C] border border-pink-500/30 rounded-3xl space-y-4 shadow-xl">
          <Users className="w-10 h-10 text-pink-400" />
          <h2 className="text-xl font-bold text-white">User Accounts & Roles</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            View user profiles, change role permissions (Customer, Organiser, Admin), or manage account status.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            Manage Users
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
}
