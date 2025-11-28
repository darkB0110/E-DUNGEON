
import React from 'react';
import { BattleState } from '../types';
import { Swords, Trophy } from 'lucide-react';

interface BattleOverlayProps {
  battle: BattleState;
}

const BattleOverlay: React.FC<BattleOverlayProps> = ({ battle }) => {
  if (!battle.isActive) return null;

  const totalScore = battle.myScore + battle.opponentScore;
  const myPercentage = totalScore === 0 ? 50 : (battle.myScore / totalScore) * 100;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-30 pointer-events-none">
      
      {/* Timer Badge */}
      <div className="flex justify-center mb-2">
         <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white font-black text-xl px-6 py-1 rounded-b-xl shadow-lg border-x border-b border-white/20 flex items-center gap-2">
            <Swords size={20} className="animate-pulse" />
            <span>{formatTime(battle.timeLeft)}</span>
         </div>
      </div>

      <div className="flex items-center justify-between mb-1 text-xs font-bold text-white drop-shadow-md">
         <span className="text-red-500">ME: {battle.myScore}</span>
         <span className="text-blue-500">{battle.opponentName}: {battle.opponentScore}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-white/20 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
         {/* My Bar (Red) */}
         <div 
           className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-500 ease-out flex items-center justify-start pl-2"
           style={{ width: `${myPercentage}%` }}
         >
         </div>

         {/* Opponent Bar (Blue) */}
         <div 
           className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-800 to-blue-500 transition-all duration-500 ease-out"
           style={{ width: `${100 - myPercentage}%` }}
         >
         </div>

         {/* Lightning/VS Divider */}
         <div 
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-black text-[10px] border-2 border-black z-10 shadow-xl transition-all duration-500"
            style={{ left: `calc(${myPercentage}% - 16px)` }}
         >
            VS
         </div>
      </div>

      {/* Winning Indicator */}
      {battle.myScore > battle.opponentScore && (
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-yellow-500 animate-bounce">
              <Trophy size={24} className="drop-shadow-lg" />
          </div>
      )}
      {battle.opponentScore > battle.myScore && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-blue-400 animate-bounce">
              <Trophy size={24} className="drop-shadow-lg" />
          </div>
      )}
    </div>
  );
};

export default BattleOverlay;
