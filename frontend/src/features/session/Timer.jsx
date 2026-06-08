import React, { useState, useEffect, useRef } from "react";
import { useSession } from "../../context/SessionContext";
import { getStatusApi } from "../../AppService";

export default function Timer() {
  const { duration, stopSession, triggerAlarm, finishSession } = useSession();
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(true);
  //kamerka
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 300, height: 300 },
        }); //prosba o uruchomienie kamerki bez dzwieku
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error. Something went wrong with the camera:", err);
      }
    }
    startCamera();
    //po wyjsciu z sesji kamerka jest wylaczana
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  //zegar
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      finishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);
  //monitor ml
  useEffect(() => {
    let statusCheckInterval = null;
    if (isActive) {
      statusCheckInterval = setInterval(async () => {
        try {
          const data = await getStatusApi();
          if (data.is_alarm_active === true) {
            triggerAlarm();
          }
        } catch (error) {
          console.error("Error occured while getting status: ", err);
        }
      }, 1000);
    }
    return () => clearInterval(statusCheckInterval);
  }, [isActive, triggerAlarm]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  return (
    <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
        Session in Progress
      </span>
      <div className="flex justify-center my-4">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-green-400 shadow-inner bg-slate-100 transition-all">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-green-600 text-[9px] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            Live Cam
          </div>
        </div>
      </div>
      <div className="text-6xl font-mono font-bold text-white my-8 tracking-tighter">
        {formatTime(secondsLeft)}
      </div>

      <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-1000"
          style={{ width: `${(secondsLeft / (duration * 60)) * 100}%` }}
        ></div>
      </div>

      <div className="flex flex-col gap-3">
        {/* przycisk do testowania alarmu */}
        <button
          onClick={triggerAlarm}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-xl text-sm border border-slate-700 transition-colors"
        >
          Test alarm - symulation
        </button>
        <button
          onClick={stopSession}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 px-4 rounded-xl border border-red-500/20 transition-all text-sm"
        >
          Give Up / Stop Session
        </button>
      </div>
    </div>
  );
}
