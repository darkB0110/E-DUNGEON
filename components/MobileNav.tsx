
import React from 'react';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';

interface MobileNavProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ onNavigate, activePage }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dungeon-950 border-t border-white/10 px-6 py-3 flex justify-between items-center z-50 safe-area-bottom">
      <button 
        onClick={() => onNavigate('HOME')}
        className={`flex flex-col items-center gap-1 ${activePage === 'HOME' ? 'text-dungeon-accent' : 'text-gray-500'}`}
      >
        <Home size={24} />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      
      <button 
        onClick={() => onNavigate('SEARCH')}
        className={`flex flex-col items-center gap-1 ${activePage === 'SEARCH' ? 'text-dungeon-accent' : 'text-gray-500'}`}
      >
        <Search size={24} />
        <span className="text-[10px] font-bold">Search</span>
      </button>

      <button 
        onClick={() => onNavigate('CREATE')}
        className="flex flex-col items-center gap-1 text-gray-500 hover:text-white"
      >
        <PlusCircle size={32} className="text-white fill-dungeon-accent" />
      </button>

      <button 
        onClick={() => onNavigate('MESSAGES')}
        className={`flex flex-col items-center gap-1 ${activePage === 'MESSAGES' ? 'text-dungeon-accent' : 'text-gray-500'}`}
      >
        <MessageSquare size={24} />
        <span className="text-[10px] font-bold">Chat</span>
      </button>

      <button 
        onClick={() => onNavigate('PROFILE')}
        className={`flex flex-col items-center gap-1 ${activePage === 'PROFILE' ? 'text-dungeon-accent' : 'text-gray-500'}`}
      >
        <User size={24} />
        <span className="text-[10px] font-bold">You</span>
      </button>
    </div>
  );
};

export default MobileNav;
