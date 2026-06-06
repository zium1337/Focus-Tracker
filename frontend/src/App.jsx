import React from 'react';
import { useSession } from './context/SessionContext';
import SettingsForm from './features/settings/SettingsForm';
import Timer from './features/session/Timer';
import AlarmScreen from './features/session/AlarmScreen';
import StatsSummary from './features/stats/StatsSummary';

function App() {
  const { status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-500 to-orange-500 text-slate-800 flex flex-col items-center justify-start p-4 pt-8 sm:pt-12 md:pt-20 transition-all duration-300">

      <header className="mb-12 text-center z-10">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
         Focus Tracker
    </h1>
        <p className="text-white/80 text-sm mt-1">
          Put your phone down and lock in on the work.
        </p>
      </header>

      <div className="w-full flex justify-center z-10">
        {status === 'IDLE' && <SettingsForm />}
        {status === 'ACTIVE' && <Timer />}
        {status === 'FINISHED' && <StatsSummary />}
      </div>

      {status === 'ALARM' && <AlarmScreen />}
    </div>
  );
}

export default App;