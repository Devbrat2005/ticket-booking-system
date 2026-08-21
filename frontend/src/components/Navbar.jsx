import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Film, Calendar, LayoutDashboard, LogOut, User, Shield, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Ticketify
              </span>
              <span className="text-[10px] block font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Live Booking Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/events"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/events') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              Explore Events
            </Link>

            {user && user.role === 'CUSTOMER' && (
              <Link
                to="/my-bookings"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/my-bookings') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>
            )}

            {user && (user.role === 'ORGANISER' || user.role === 'ADMIN') && (
              <Link
                to="/organiser"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/organiser') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Organiser Portal
              </Link>
            )}

            {user && user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                    <span className="text-[10px] text-indigo-400 font-mono font-medium">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
