
import React, { useEffect, useState } from 'react';
import { Bell, DollarSign, MessageSquare, Info, X, ShieldAlert } from 'lucide-react';
import { backend } from '../services/backend';
import { Notification } from '../types';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
       const data = await backend.notifications.getAll();
       setNotifications(data);
    };
    fetchNotifs();
    // Poll for updates every 10s
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-16 left-4 w-80 bg-dungeon-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-5">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <Bell size={14} className="text-dungeon-accent" /> Notifications
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={14} /></button>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-dungeon-accent/5' : ''}`}>
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'TIP' ? 'bg-yellow-500/10 text-yellow-500' : 
                  notif.type === 'MESSAGE' ? 'bg-blue-500/10 text-blue-500' : 
                  notif.type === 'SECURITY' ? 'bg-red-500/10 text-red-500' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {notif.type === 'TIP' && <DollarSign size={14} />}
                  {notif.type === 'MESSAGE' && <MessageSquare size={14} />}
                  {(notif.type === 'SYSTEM' || notif.type === 'LIVE') && <Info size={14} />}
                  {notif.type === 'SECURITY' && <ShieldAlert size={14} />}
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold mb-0.5">{notif.title}</h4>
                  <p className="text-gray-400 text-[10px] leading-tight">{notif.message}</p>
                  <span className="text-[9px] text-gray-600 mt-1 block">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">
            No new notifications.
          </div>
        )}
      </div>
      
      <div className="p-2 bg-black/40 border-t border-white/5 text-center">
        <button className="text-[10px] text-dungeon-accent hover:underline">Mark all as read</button>
      </div>
    </div>
  );
};

export default NotificationPanel;
