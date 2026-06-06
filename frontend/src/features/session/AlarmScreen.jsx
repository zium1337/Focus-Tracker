import React, { useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';

export default function AlarmScreen() {
  const { dismissAlarm, stopSession } = useSession();
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.loop = true;
    audioRef.current.play().catch(err => console.log("Audio play blocked:", err));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-red-500/20 backdrop-blur-xs flex flex-col items-center justify-start pt-48 z-50 p-4 animate-pulse">

      <div className="max-w-2xl w-full bg-white border border-red-200 rounded-2xl p-8 shadow-2xl text-center space-y-6">

        <div className="text-6xl mb-2">
          🚨
        </div>
        <div className="flex justify-center">
          <img
            src = "/cat-study.jpeg"
            alt="Focus warning"
            className="w-28 h-28 object-cover rounded-xl shadow-md border border-slate-100"
          />
        </div>
        <h1 className="text-2xl font-black text-red-600 tracking-tight uppercase">
          Distraction Detected!
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed">
          Focus on your work. <br />
          <strong>Put your phone away and look at your work!</strong>
        </p>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={dismissAlarm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            I am back! Continue focusing
          </button>

          <button
            onClick={stopSession}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            I give up, end this session
          </button>
        </div>

      </div>
    </div>
  );
}