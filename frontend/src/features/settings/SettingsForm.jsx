import React, {useState} from 'react';
import {useSession} from "../../context/SessionContext";

// glowne f. i stany z context
export default function SettingsForm() {
    const {
        duration,
        setDuration,
        bannedUrls,
        addUrl,
        removeUrl,
        startSession
    } = useSession();

    const [urlInput, setUrlInput] = useState('');
    const handleAddUrlSubmit = (e) => {
        e.preventDefault();
        if (urlInput.trim()) {
            addUrl(urlInput.trim().toLowerCase());
            setUrlInput('');
        }
    };
   return (
    <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Session Configuration
      </h2>
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Study Duration: <span className="text-red-400 font-bold">{duration} minutes</span>
        </label>
        <input
          type="range"
          min="5"
          max="120"
          step="5"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>5 min</span>
          <span>120 min</span>
        </div>
      </div>
        <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Banned Websites / Apps
        </label>

        <form onSubmit={handleAddUrlSubmit} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="e.g., facebook.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
          />
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors"
          >
              Add
          </button>
        </form>
        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {bannedUrls.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-2">
              No websites banned yet. Focus is clean!
            </p>
          ) : (
            bannedUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300"
              >
                <span>{url}</span>
                  <button
                  onClick={() => removeUrl(url)}
                  className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
            ))
          )}
            </div>
      </div>
      <button
        onClick={startSession}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-500/20 text-center"
      >
          Start Focus Session
      </button>
    </div>
  );
}
