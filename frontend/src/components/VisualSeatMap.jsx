import React from 'react';
import { Armchair, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function VisualSeatMap({ seats, selectedSeatIds, onToggleSeat, currentUserId }) {
  // Group seats by Row (e.g. A, B, C, D)
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  const getSeatStyle = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (seat.status === 'BOOKED') {
      return 'bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed opacity-50';
    }

    if (seat.status === 'HELD') {
      if (seat.isMyHold || (seat.holdBy && seat.holdBy === currentUserId)) {
        return 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 font-bold';
      }
      return 'bg-rose-950/40 border-rose-800/80 text-rose-400 cursor-not-allowed';
    }

    if (isSelected) {
      return 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-105 font-bold';
    }

    if (seat.category === 'Premium') {
      return 'bg-amber-950/30 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 cursor-pointer';
    }

    // Standard Available
    return 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-indigo-600/20 hover:border-indigo-500 cursor-pointer';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 glass-panel rounded-2xl">
      {/* Screen Representation */}
      <div className="mb-10 text-center">
        <div className="w-3/4 mx-auto h-3 bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-t-full shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)]"></div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
          SCREEN / STAGE THIS WAY
        </p>
      </div>

      {/* Seat Grid */}
      <div className="space-y-4 mb-8 overflow-x-auto pb-4">
        {rows.map((rowName) => {
          const rowSeats = seats.filter((s) => s.row === rowName).sort((a, b) => a.number - b.number);
          const isPremiumRow = rowSeats.some((s) => s.category === 'Premium');

          return (
            <div key={rowName} className="flex items-center justify-center gap-3 min-w-max">
              {/* Row Label */}
              <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                {rowName}
              </span>

              {/* Seats in Row */}
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
                      <span className="text-[9px] opacity-80 leading-none mt-0.5">
                        ${seat.price}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Tag */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase font-mono ${
                  isPremiumRow ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPremiumRow ? 'VIP' : 'STD'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Seat Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-900 border border-slate-700"></div>
          <span className="text-slate-300">Standard Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/30 border border-amber-500/50"></div>
          <span className="text-amber-300 font-medium">Premium Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-400"></div>
          <span className="text-emerald-300 font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-950/40 border border-rose-800"></div>
          <span className="text-rose-400">Held by Other</span>
        </div>
      </div>
    </div>
  );
}
