import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Armchair, User, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'ORGANISER') navigate('/organiser');
      else navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-[#0B0F19]">
      
      {/* Left Column: Split Screen Banner */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-violet-950 via-[#151C2C] to-[#0B0F19] p-12 flex-col justify-between border-r border-gray-800">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1500"
            alt="BookSeat Concert Visual"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
            <Armchair className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black">
            <span className="text-white">Book</span>
            <span className="gradient-text-brand">Seat</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Book Your Seat. Enjoy Your Moment.
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Your Seat. <span className="gradient-text-brand">Your Experience.</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create your BookSeat account to unlock live ticket bookings, real-time visual seat grids, and waitlist offers.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          &copy; 2026 BookSeat. All rights reserved.
        </div>
      </div>

      {/* Right Column: Registration Card */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-[#151C2C] p-8 sm:p-10 rounded-3xl border border-gray-800 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Create your BookSeat account</h2>
            <p className="text-xs text-slate-400">Join BookSeat ticket platform</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 font-mono text-xs"
              >
                <option value="CUSTOMER">CUSTOMER (Book & View Tickets)</option>
                <option value="ORGANISER">ORGANISER (Create & Manage Shows)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-violet-600/25 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
