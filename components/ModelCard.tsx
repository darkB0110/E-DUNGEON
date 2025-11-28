
import React from 'react';
import { Performer, PerformerStatus } from '../types';
import { COUNTRY_FLAGS } from '../constants';
import { Eye, Star, Lock, Heart, Plus, Users, Zap } from 'lucide-react';

interface ModelCardProps {
  performer: Performer;
  onClick: (p: Performer) => void;
  isFavorite?: boolean;
  isFollowing?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleFollow?: (id: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ 
  performer, 
  onClick, 
  isFavorite, 
  isFollowing, 
  onToggleFavorite, 
  onToggleFollow 
}) => {
  const flag = (!performer.hideCountry && performer.country) ? COUNTRY_FLAGS[performer.country] : null;

  const handleAction = (e: React.MouseEvent, action: 'FAV' | 'FOLLOW') => {
    e.stopPropagation();
    if (action === 'FAV' && onToggleFavorite) onToggleFavorite(performer.id);
    if (action === 'FOLLOW' && onToggleFollow) onToggleFollow(performer.id);
  };

  // Enforce character limit for description
  const truncateDescription = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  return (
    <div 
      onClick={() => onClick(performer)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-dungeon-900 border border-white/5 hover:border-dungeon-accent/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[0_0_25px_rgba(225,29,72,0.15)]"
    >
      {/* Image Container */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={performer.thumbnail} 
          alt={performer.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-95 group-hover:brightness-105"
        />
        
        {/* Overlays - Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dungeon-950 via-transparent to-black/30 opacity-90" />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {performer.status === PerformerStatus.LIVE && (
            <div className="bg-dungeon-accent/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(225,29,72,0.5)] ring-1 ring-white/20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          {performer.status === PerformerStatus.PRIVATE && (
            <div className="bg-amber-500/90 backdrop-blur-md text-black text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ring-1 ring-black/20">
              <Lock size={8} /> PRIVATE
            </div>
          )}
          {performer.squadPartner && (
            <div className="bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ring-1 ring-white/20">
               <Users size={8} /> SQUAD
            </div>
          )}
          {performer.toyConnected && (
            <div className="bg-pink-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ring-1 ring-white/20">
               <Zap size={8} className="fill-current" /> TOY
            </div>
          )}
        </div>

         {/* Country & AI */}
         <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            {flag && (
               <span className="text-xl drop-shadow-md hover:scale-125 transition-transform" title={performer.country}>{flag}</span>
            )}
            {performer.isAi && (
                <div className="bg-dungeon-glow/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                AI
                </div>
            )}
         </div>

         {/* Action Buttons - Modern Glassmorphism */}
         <div className="absolute bottom-[100px] right-3 flex flex-col gap-2 z-20">
            <button 
              onClick={(e) => handleAction(e, 'FOLLOW')}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all duration-300 shadow-lg ${isFollowing ? 'bg-dungeon-accent text-white border-dungeon-accent shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-black/40 text-white border-white/20 hover:bg-white/20 hover:border-white/40'}`}
              title={isFollowing ? "Unfollow" : "Follow"}
            >
               <Plus className={`w-5 h-5 ${isFollowing ? 'rotate-45' : ''} transition-transform`} strokeWidth={3} />
            </button>
            <button 
              onClick={(e) => handleAction(e, 'FAV')}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all duration-300 shadow-lg ${isFavorite ? 'bg-pink-600 text-white border-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'bg-black/40 text-white border-white/20 hover:bg-white/20 hover:border-white/40'}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
               <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={isFavorite ? 0 : 2.5} />
            </button>
         </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-12">
        <div className="flex justify-between items-end mb-1">
          <h3 className="text-white font-bold text-lg leading-tight group-hover:text-dungeon-accent transition-colors flex items-center gap-1 drop-shadow-sm">
            {performer.name}
          </h3>
          <div className="flex flex-col items-end">
             <div className="flex items-center text-yellow-500 gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">{performer.rating.toFixed(1)}</span>
             </div>
          </div>
        </div>
        
        {/* Description with Character Limit */}
        <p className="text-gray-400 text-[10px] leading-tight mb-3 line-clamp-2 h-8">
           {truncateDescription(performer.description, 60)}
        </p>
        
        <div className="flex items-center justify-between">
            <div className="flex gap-1 overflow-hidden">
                {performer.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] uppercase tracking-wide px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5 truncate">
                    {tag}
                    </span>
                ))}
            </div>
            <div className="flex items-center text-gray-400 text-[10px] gap-1 shrink-0">
               <Eye className="w-3 h-3" />
               <span>{performer.viewers.toLocaleString()}</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
