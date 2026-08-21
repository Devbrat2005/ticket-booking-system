import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, Calendar, MapPin, Mail, ArrowRight, Download } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">No Booking Confirmation Found</h2>
        <Link to="/my-bookings" className="text-indigo-400 text-xs font-semibold mt-4 inline-block">
          View My Bookings &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
        <p className="text-sm text-slate-300">
          Your tickets have been secured and sent to your email address.
        </p>
      </div>

      {/* Ticket Pass Card */}
      <div className="glass-panel rounded-3xl border-indigo-500/30 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-slate-900 p-8 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 font-mono block">
              Official Digital Ticket
            </span>
            <h2 className="text-2xl font-black text-white">{booking.eventTitle}</h2>
            <p className="text-xs text-slate-300 mt-1">{booking.venueName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Reference Code</span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Showtime</p>
                <p className="text-sm font-bold text-white">{booking.date} &bull; {booking.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Reserved Seats</p>
                <p className="text-sm font-bold text-emerald-400">
                  {booking.seats?.map((s) => `${s.label} (${s.category})`).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Email Status</p>
                <p className="text-xs text-slate-300">Ticket sent with QR attachment</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Total Paid</p>
              <p className="text-2xl font-black text-white">${booking.totalAmount}</p>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="text-center p-6 bg-white rounded-2xl space-y-2 shadow-xl">
            <img
              src={booking.qrCodeData}
              alt="Ticket QR Code"
              className="w-48 h-48 mx-auto"
            />
            <p className="text-xs font-mono font-extrabold text-slate-900 tracking-widest">
              {booking.bookingReference}
            </p>
            <p className="text-[10px] text-slate-500">Scan at entrance for entry authorization</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap justify-between items-center gap-4">
          <Link
            to="/my-bookings"
            className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300"
          >
            Go to My Bookings History
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/events"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
          >
            Browse More Shows
          </Link>
        </div>
      </div>
    </div>
  );
}
