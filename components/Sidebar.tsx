


import React, { useState } from 'react';
import { Radio, Flame, Sparkles, Glasses, Settings, User as UserIcon, Heart, PlusCircle, Coins, LogIn, ChevronDown, ChevronRight, LogOut, MessageSquare, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { CATEGORY_GROUPS } from '../constants';

interface SidebarProps {
  onNavigate: () => void;
  currentUser: User | null;
  onAuth: (type: 'FAN' | 'MODEL') => void;
  onLogin: () => void;
  onOpenWallet: () => void;
  onOpenDashboard?: () => void;
  onOpenFanDashboard?: () => void;
  onSelectCategory?: (category: string) => void;
  onMessages?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNavigate, 
  currentUser, 
  onAuth, 
  onLogin, 
  onOpenWallet, 
  onOpenDashboard,
  onOpenFanDashboard,
  onSelectCategory,
  onMessages
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const menuItems = [
    { label: 'Live Cams', icon: Radio, active: true, action: onNavigate },
    { label: 'Trending', icon: Flame, active: false, action: () => {} },
    { label: 'New Blood', icon: Sparkles, active: false, action: () => {} },
    { label: 'VR Lounge', icon: Glasses, active: false, action: () => {} },
  ];

  if (currentUser && onMessages) {
    menuItems.push({ label: 'Messages', icon: MessageSquare, active: false, action: onMessages });
  }

  const toggleGroup = (name: string) => {
    setExpandedGroup(expandedGroup === name ? null : name);
  };

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-white/5 bg-dungeon-950 h-full fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={onNavigate}>
        <div className="w-8 h-8 bg-dungeon-accent rounded-sm shadow-[0_0_15px_rgba(225,29,72,0.6)] flex items-center justify-center">
            <Flame className="text-white w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider font-display text-white">
          DUNGEON
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-dungeon-800">
        
        {/* Main Menu */}
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              item.active 
                ? 'bg-dungeon-800 text-dungeon-accent border border-dungeon-accent/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.active ? 'animate-pulse-slow' : 'group-hover:text-dungeon-accent'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Categories Collapsible */}
        <div className="mt-6 mb-2 px-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Discover
          </div>
          <div className="space-y-1">
             {CATEGORY_GROUPS.map((group) => (
               <div key={group.name} className="overflow-hidden">
                 <button 
                    onClick={() => toggleGroup(group.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                 >
                    <span>{group.name}</span>
                    {expandedGroup === group.name ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                 </button>
                 
                 {expandedGroup === group.name && (
                   <div className="pl-4 pr-2 pb-2 pt-1 grid grid-cols-2 gap-1 bg-black/20 rounded-b-lg mb-2">
                      {group.items.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => onSelectCategory && onSelectCategory(cat)}
                          className="text-left text-xs text-gray-500 hover:text-dungeon-accent px-2 py-1 truncate transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Guest View */}
        {!currentUser && (
          <div className="mt-8 px-4 py-6 bg-dungeon-900/50 rounded-xl border border-white/5 mx-2">
               <h4 className="text-white font-bold mb-2">Join the Community</h4>
               <p className="text-xs text-gray-400 mb-4">Interact with models, buy tokens, and unlock content.</p>
               
               <button onClick={onLogin} className="w-full bg-white text-black text-sm font-bold py-2 rounded mb-2 transition-colors hover:bg-gray-200 flex items-center justify-center gap-2">
                 <LogIn size={14} /> Log In
               </button>

               <button onClick={() => onAuth('FAN')} className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2 rounded mb-2 transition-colors">
                 Sign Up
               </button>
               
               <button onClick={() => onAuth('MODEL')} className="w-full text-dungeon-accent text-xs font-bold hover:underline flex items-center justify-center gap-1 mt-2">
                 <PlusCircle size={12}/> Become a Model
               </button>
            </div>
        )}
      </nav>

      {/* User / Model Footer Profile */}
      {currentUser && (
        <div className="p-4 border-t border-white/5 bg-dungeon-900/30">
          <div className="flex flex-col gap-3">
             
             {/* Fan Wallet Display */}
             {currentUser.role !== 'MODEL' && currentUser.role !== 'ADMIN' && (
               <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-yellow-500/20">
                 <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold">
                    <Coins size={14} />
                    <span>BALANCE</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-white font-bold">{currentUser.tokens} T</span>
                   <button onClick={onOpenWallet} className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded hover:bg-yellow-400">
                     ADD
                   </button>
                 </div>
               </div>
             )}

             {/* Profile Row */}
             <button 
                onClick={currentUser.role === 'MODEL' ? onOpenDashboard : (currentUser.role === 'ADMIN' ? onNavigate : onOpenFanDashboard)} // Admin goes to main view/dash logic handles reroute
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group w-full text-left"
             >
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dungeon-accent to-dungeon-800 flex items-center justify-center shadow-lg border border-white/10 group-hover:border-dungeon-accent/50 transition-colors">
                  {currentUser.role === 'MODEL' ? (
                     <Settings className="text-white w-5 h-5" />
                  ) : currentUser.role === 'ADMIN' ? (
                     <ShieldAlert className="text-white w-5 h-5" />
                  ) : (
                     <UserIcon className="text-white w-5 h-5" />
                  )}
               </div>
               <div className="flex-1 overflow-hidden">
                 <div className="text-sm font-bold text-white truncate group-hover:text-dungeon-accent transition-colors">
                   {currentUser.username}
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                    {currentUser.role === 'FAN' ? 'My Profile & Settings' : currentUser.role === 'MODEL' ? 'Creator Dashboard' : 'Master Admin'}
                 </div>
               </div>
             </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
