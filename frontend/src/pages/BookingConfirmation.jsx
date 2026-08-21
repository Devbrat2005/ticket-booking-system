import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, Calendar, MapPin, Mail, Download, Home, Armchair } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No Booking Confirmation Found</h2>
        <Link to="/my-bookings" className="text-violet-400 text-xs font-bold inline-block">
          View My Bookings &rarr;
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#0B0F19]">
      
      {/* Success Banner Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">✓ Booking Confirmed</h1>
        <p className="text-base font-bold text-violet-300">Your BookSeat ticket is ready.</p>
      </div>

      {/* Digital BookSeat Ticket Pass Card */}
      <div className="bg-[#151C2C] border border-violet-500/30 rounded-3xl overflow-hidden shadow-2xl">
        
        <div className="bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-pink-900/90 p-8 border-b border-gray-800 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Armchair className="w-4 h-4 text-violet-300" />
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-violet-200">
                Official BookSeat Ticket Pass
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{booking.eventTitle}</h2>
            <p className="text-xs text-slate-200 mt-1">{booking.venueName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-300 block uppercase font-mono">Reference Code</span>
            <span className="text-xl font-black text-cyan-400 font-mono tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Show Date & Time</p>
                <p className="text-sm font-bold text-white">{booking.date} &bull; {booking.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Reserved Seats</p>
                <p className="text-sm font-bold text-emerald-400">
                  {booking.seats?.map((s) => `${s.label} (${s.category})`).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Email Dispatched</p>
                <p className="text-xs text-slate-300">Contains entry QR code pass</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Total Paid</p>
              <p className="text-2xl font-black text-white">${booking.totalAmount}</p>
            </div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl space-y-2 shadow-xl border border-gray-200">
            <img
              src={booking.qrCodeData}
              alt="Ticket QR Code"
              className="w-48 h-48 mx-auto"
            />
            <p className="text-xs font-mono font-extrabold text-slate-900 tracking-widest pt-1">
              {booking.bookingReference}
            </p>
            <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">
              Show this QR code at the venue entrance.
            </p>
          </div>

        </div>

        <div className="p-6 bg-[#0B0F19] border-t border-gray-800 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#151C2C] border border-gray-800 text-slate-200 hover:text-white text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-violet-400" /> Print Ticket
            </button>
            <Link
              to="/my-bookings"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#151C2C] border border-gray-800 text-slate-200 hover:text-white text-xs font-bold transition-colors"
            >
              <Ticket className="w-4 h-4 text-emerald-400" /> View My Bookings
            </Link>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>

      </div>

    </div>
  );
}
