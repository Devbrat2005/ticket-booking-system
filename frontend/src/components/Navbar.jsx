import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { Armchair, Film, Music, Search, LayoutDashboard, Shield, LogOut, User, Menu, X, Sparkles, Ticket } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Ticket Booking Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logo}
              alt="Ticket Booking"
              className="h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-violet-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </Link>

            <Link
              to="/events?type=MOVIE"
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                location.pathname === '/events' && location.search.includes('type=MOVIE')
                  ? 'text-violet-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4 text-violet-400" />
              Movies
            </Link>

            <Link
              to="/events?type=CONCERT"
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                location.pathname === '/events' && location.search.includes('type=CONCERT')
                  ? 'text-pink-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4 text-pink-400" />
              Concerts
            </Link>

            <Link
              to="/events"
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                isActive('/events') && !location.search ? 'text-violet-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              Events
            </Link>

            {user && user.role === 'CUSTOMER' && (
              <Link
                to="/my-bookings"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/my-bookings') ? 'text-violet-400 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                My Bookings
              </Link>
            )}

            {user && (user.role === 'ORGANISER' || user.role === 'ADMIN') && (
              <Link
                to="/organiser"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/organiser') ? 'text-violet-400 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                Organiser
              </Link>
            )}

            {user && user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/admin') ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin
              </Link>
            )}
          </div>

          {/* User Profile & Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#151C2C] border border-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                    <span className="text-[10px] text-violet-400 font-mono uppercase font-bold">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-300 hover:text-white px-4 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Drawer Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#151C2C] border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 py-2"
          >
            Home
          </Link>
          <Link
            to="/events?type=MOVIE"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 py-2"
          >
            Movies
          </Link>
          <Link
            to="/events?type=CONCERT"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 py-2"
          >
            Concerts
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 py-2"
          >
            Events
          </Link>

          {user && user.role === 'CUSTOMER' && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 py-2"
            >
              My Bookings
            </Link>
          )}

          {user && (user.role === 'ORGANISER' || user.role === 'ADMIN') && (
            <Link
              to="/organiser"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 py-2"
            >
              Ticket Booking Organiser
            </Link>
          )}

          {user && user.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 py-2"
            >
              Ticket Booking Admin
            </Link>
          )}

          <div className="pt-4 border-t border-gray-800">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-sm font-bold text-rose-400 py-2"
              >
                Logout ({user.name})
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-gray-800 text-white font-bold text-sm rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-violet-600 text-white font-bold text-sm rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
