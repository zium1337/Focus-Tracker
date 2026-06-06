import React from 'react';
import { useSession } from '../../context/SessionContext';

export default function StatsSummary() {
  const { duration, alarmCount, stopSession } = useSession();

  const focusScore = Math.max(100 - (alarmCount * 15), 10); // każdy alarm zabiera 15 punktów skupienia

  return (
    <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-6">

      <div>
        <span className="text-4xl">🏆</span>
        <h2 className="text-2xl font-bold text-white mt-2">Session Completed!</h2>
        <p className="text-slate-400 text-sm">Good job keeping up with your goals.</p>
      </div>
      <hr className="border-slate-800" />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase">Time Focused</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{duration} min</p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase">Distractions</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{alarmCount} times</p>
        </div>
      </div>

      <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-left">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-400">Focus Score:</span>
          <span className={`text-sm font-bold ${focusScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
            {focusScore}%
          </span>
        </div>
      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${focusScore > 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${focusScore}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 italic text-center">
          {focusScore > 80 ? "Great! Your phone didn't distract you too much." : "Try to lock in more next time."}
        </p>
      </div>
      <button
        onClick={stopSession} // resetuje stan do IDLE i wraca do formularza
        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-colors border border-slate-700 text-sm"
      >
        Back to Dashboard
      </button>

    </div>
  );
}