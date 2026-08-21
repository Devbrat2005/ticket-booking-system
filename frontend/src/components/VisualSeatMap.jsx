import React from 'react';
import { Armchair } from 'lucide-react';

export default function VisualSeatMap({ seats, selectedSeatIds, onToggleSeat, currentUserId }) {
  // Group seats by Row (e.g. A, B, C, D)
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  const getSeatStyle = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (seat.status === 'BOOKED') {
      return 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed opacity-40';
    }

    if (seat.status === 'HELD') {
      if (seat.isMyHold || (seat.holdBy && seat.holdBy === currentUserId)) {
        return 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-600/40 font-extrabold scale-105';
      }
      return 'bg-rose-950/40 border-rose-900/80 text-rose-500 cursor-not-allowed';
    }

    if (isSelected) {
      return 'bg-emerald-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/40 scale-105 font-extrabold ring-2 ring-emerald-400/50';
    }

    if (seat.category === 'Premium') {
      return 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 cursor-pointer';
    }

    // Standard Available
    return 'bg-[#0B0F19] border-gray-800 text-slate-300 hover:bg-violet-600/20 hover:border-violet-500 cursor-pointer';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 bg-[#151C2C] border border-gray-800 rounded-3xl shadow-2xl space-y-8">
      
      {/* Curved Screen / Stage Arc Header */}
      <div className="text-center space-y-2">
        <div className="w-4/5 mx-auto h-3 bg-gradient-to-r from-violet-600 via-pink-500 to-violet-600 rounded-t-full shadow-[0_12px_25px_-5px_rgba(124,58,237,0.5)]"></div>
        <p className="text-[10px] font-extrabold font-mono tracking-widest text-slate-400 uppercase pt-1">
          STAGE / SCREEN DIRECTION
        </p>
      </div>

      {/* Seat Matrix Grid */}
      <div className="space-y-4 overflow-x-auto pb-4 pt-2">
        {rows.map((rowName) => {
          const rowSeats = seats.filter((s) => s.row === rowName).sort((a, b) => a.number - b.number);
          const isPremiumRow = rowSeats.some((s) => s.category === 'Premium');

          return (
            <div key={rowName} className="flex items-center justify-center gap-3 min-w-max">
              {/* Row Label */}
              <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                {rowName}
              </span>

              {/* Row Seats */}
              <div className="flex items-center gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isClickable = seat.status === 'AVAILABLE' || (seat.status === 'HELD' && seat.isMyHold);

                  return (
                    <button
                      key={seat.id}
                      disabled={!isClickable}
                      onClick={() => onToggleSeat(seat)}
                      className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${getSeatStyle(
                        seat
                      )}`}
                      title={`${seat.label} - ${seat.category} ($${seat.price}) [${seat.status}]`}
                    >
                      <span className="text-[10px] font-mono leading-none font-bold">
                        {seat.label}
                      </span>
                      <span className="text-[9px] opacity-80 leading-none mt-0.5 font-mono">
                        ${seat.price}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Tag */}
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  isPremiumRow ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-gray-900 text-slate-500'
                }`}
              >
                {isPremiumRow ? 'VIP' : 'STD'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Seat State Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0B0F19] border border-gray-700"></div>
          <span className="text-slate-300">Standard ($)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/30 border border-amber-500/50"></div>
          <span className="text-amber-300 font-semibold">Premium VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-300"></div>
          <span className="text-emerald-400 font-bold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-950/40 border border-rose-900"></div>
          <span className="text-rose-400">Held by Other</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-900 border border-gray-800"></div>
          <span className="text-gray-500">Booked</span>
        </div>
      </div>
    </div>
  );
}
