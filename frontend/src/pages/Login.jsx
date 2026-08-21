import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Armchair, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'ORGANISER') {
        navigate('/organiser');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-[#0B0F19]">
      
      {/* Left Column: Split Screen Visual Banner */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-violet-950 via-[#151C2C] to-[#0B0F19] p-12 flex-col justify-between border-r border-gray-800">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=1500"
            alt="BookSeat Cinema Visual"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> BookSeat Platform
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Your Seat. <span className="gradient-text-brand">Your Experience.</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Access your BookSeat reservations, track active 10-minute hold TTLs, and receive instant QR ticket passes.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          &copy; 2026 BookSeat. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-[#151C2C] p-8 sm:p-10 rounded-3xl border border-gray-800 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Welcome to BookSeat</h2>
            <p className="text-xs text-slate-400">Sign in to manage your ticket reservations</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-violet-600/25 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-6 border-t border-gray-800 space-y-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 text-center">
              1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => setPreset('customer@example.com')}
                className="py-2 px-2 rounded-xl bg-[#0B0F19] border border-gray-800 text-slate-300 hover:border-violet-500 font-mono font-bold"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setPreset('organiser@example.com')}
                className="py-2 px-2 rounded-xl bg-[#0B0F19] border border-gray-800 text-slate-300 hover:border-purple-500 font-mono font-bold"
              >
                Organiser
              </button>
              <button
                type="button"
                onClick={() => setPreset('admin@example.com')}
                className="py-2 px-2 rounded-xl bg-[#0B0F19] border border-gray-800 text-slate-300 hover:border-amber-500 font-mono font-bold"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-bold hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
