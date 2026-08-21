import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

export default function HoldTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      const seconds = Math.max(0, Math.floor(diff / 1000));
      setTimeLeft(seconds);

      if (seconds <= 0 && onExpire) {
        onExpire();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeLeft <= 60;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold border transition-colors ${
        isLowTime
          ? 'bg-rose-950/60 border-rose-600/80 text-rose-400 animate-pulse'
          : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
      }`}
    >
      {isLowTime ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Timer className="w-4 h-4 text-indigo-400" />}
      <span>Hold Expires: {formatted}</span>
    </div>
  );
}
