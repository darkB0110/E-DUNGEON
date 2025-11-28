
import React, { useState } from 'react';
import { TipMenuItem } from '../types';
import { DollarSign, ChevronRight, ChevronLeft } from 'lucide-react';

interface TipMenuProps {
  items: TipMenuItem[];
  onSelect: (item: TipMenuItem) => void;
}

const TipMenu: React.FC<TipMenuProps> = ({ items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!items || items.length === 0) return null;

  return (
    <div className={`absolute left-0 top-1/2 -translate-y-1/2 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
       <div className="bg-black/80 backdrop-blur-md border-r border-y border-white/10 rounded-r-xl overflow-hidden shadow-2xl flex">
          <div className="w-64 max-h-[60vh] overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-dungeon-800">
             <div className="px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 mb-1">
                Tip Menu
             </div>
             {items.map((item, idx) => (
               <button 
                 key={idx}
                 onClick={() => onSelect(item)}
                 className="w-full text-left p-3 rounded-lg hover:bg-dungeon-accent/20 hover:border-dungeon-accent/50 border border-transparent transition-all group relative overflow-hidden"
               >
                  <div className="flex justify-between items-center relative z-10">
                     <span className="text-white font-bold text-sm group-hover:text-dungeon-accent">{item.label}</span>
                     <span className="bg-white/10 text-yellow-500 text-xs font-bold px-2 py-1 rounded group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        {item.price}
                     </span>
                  </div>
               </button>
             ))}
          </div>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 bg-dungeon-900/80 hover:bg-dungeon-accent flex items-center justify-center border-l border-white/10 transition-colors"
          >
             <ChevronLeft size={14} className="text-white" />
          </button>
       </div>
       
       {!isOpen && (
          <button 
             onClick={() => setIsOpen(true)}
             className="absolute left-full top-1/2 -translate-y-1/2 bg-dungeon-accent text-white p-2 rounded-r-lg shadow-lg hover:bg-rose-700 transition-colors"
          >
             <DollarSign size={20} />
          </button>
       )}
    </div>
  );
};

export default TipMenu;
