import React, { createContext, useContext, useState} from "react";
const SessionContext= createContext(null);

// stan apki, status sesji, czas, lista zbanowanych stron
export const SessionProvider = ({children}) => {
    const [status, setStatus] = useState('IDLE');
    const [duration, setDuration] = useState(25);
    const [bannedUrls, setBannedUrls] = useState([]);
//zarzadzanie stanem
const [alarmCount, setAlarmCount] = useState(0);

const addUrl = (url) => {
    if (url && !bannedUrls.includes(url)) {
        setBannedUrls([...bannedUrls,url])
    }
};
const removeUrl = (urlToRemove) => {
    setBannedUrls(bannedUrls.filter(url => url !== urlToRemove))
}
const startSession = async () => {
    setAlarmCount(0);
    setStatus('ACTIVE');
}
const stopSession = () => {setStatus('IDLE');};
const triggerAlarm = () => {
    setAlarmCount(prev=>prev + 1);
    setStatus('ALARM');};
const dismissAlarm = () => {setStatus('ACTIVE');};
const finishSession = () => { setStatus('FINISHED')};

return (
    <SessionContext value={{
        status, duration, bannedUrls, alarmCount,
        setDuration, addUrl, removeUrl,
        startSession, stopSession, triggerAlarm, dismissAlarm,finishSession
    }}>
            {children}
        </SessionContext>
    );
};
export const useSession = () => {
    return useContext(SessionContext);
};