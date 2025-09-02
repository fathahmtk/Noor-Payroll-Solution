import React, { useState, useEffect } from 'react';
import type { User, View } from '../../types';
import { getAlerts } from '../../services/api';
import NotificationsPanel from './NotificationsPanel';
import { useAppContext } from '../../AppContext';

interface TopNavBarProps {
  user: User;
  onNavigate: (view: View) => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ user, onNavigate }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState<{ expiringDocs: any[], pendingLeaves: any[] }>({ expiringDocs: [], pendingLeaves: [] });
  const { currentUser } = useAppContext();

  useEffect(() => {
    if (!currentUser?.tenantId) return;
    
    const fetchAlertData = async () => {
      const data = await getAlerts(currentUser.tenantId);
      setAlerts(data);
      setAlertCount(data.expiringDocs.length + data.pendingLeaves.length);
    };

    fetchAlertData();
    const interval = setInterval(fetchAlertData, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.length > 2 ? initials.substring(0, 2) : initials;
  };

  return (
    <div className="bg-brand-light border-b border-slate-200 px-6 py-2 flex items-center justify-between z-40">
      <div className="flex items-center">
         <span className="text-2xl mr-3" role="img" aria-label="Qatar Flag">🇶🇦</span>
         <h1 className="text-lg font-bold text-brand-dark hidden sm:block">{user.companyName}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="relative text-nav-icon hover:text-brand-primary p-2 rounded-full hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex items-center justify-center text-[9px] text-white rounded-full h-4 w-4 bg-red-500 border-2 border-white top-[-4px] right-[-4px]">
                    {alertCount}
                </span>
              </span>
            )}
          </button>
          {isPanelOpen && <NotificationsPanel alerts={alerts} onClose={() => setIsPanelOpen(false)} onNavigate={onNavigate} />}
        </div>

        <div className="flex items-center space-x-2">
           <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-sm ring-2 ring-offset-1 ring-brand-primary/50">
             {getInitials(user.name)}
           </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-brand-dark">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;