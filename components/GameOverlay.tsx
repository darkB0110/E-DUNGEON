
import React, { useEffect, useState } from 'react';
import { Game } from '../types';
import { Dice5, Trophy } from 'lucide-react';

interface GameOverlayProps {
  game: Game;
  onComplete: () => void;
  resultIndex?: number; // Pre-determined result for the wheel
  diceValue?: number; // Pre-determined result for dice
}

const GameOverlay: React.FC<GameOverlayProps> = ({ game, onComplete, resultIndex = 0, diceValue = 20 }) => {
  const [spinning, setSpinning] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (game.type === 'WHEEL' && game.options) {
      // Calculate rotation to land on resultIndex
      // Each slice is 360 / length
      const sliceDeg = 360 / game.options.length;
      const targetDeg = 360 * 5 + (360 - (resultIndex * sliceDeg)); // Spin 5 times then land
      
      setTimeout(() => setRotation(targetDeg), 100);
      
      const spinDuration = 3000;
      setTimeout(() => {
        setSpinning(false);
        setShowResult(true);
        setTimeout(onComplete, 3000); // Show result for 3s
      }, spinDuration);
    } 
    else if (game.type === 'DICE') {
      const rollDuration = 2000;
      setTimeout(() => {
        setSpinning(false);
        setShowResult(true);
        setTimeout(onComplete, 3000);
      }, rollDuration);
    }
  }, [game, resultIndex, onComplete]);

  if (game.type === 'WHEEL' && game.options) {
    const sliceAngle = 360 / game.options.length;

    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="relative">
           {/* Pointer */}
           <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-white text-4xl drop-shadow-lg">▼</div>
           
           {/* Wheel */}
           <div 
             className="w-64 h-64 rounded-full border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative bg-dungeon-950 transition-transform cubic-bezier(0.25, 1, 0.5, 1)"
             style={{ 
               transform: `rotate(${rotation}deg)`,
               transitionDuration: '3s'
             }}
           >
             {game.options.map((opt, i) => (
                <div 
                  key={opt.id}
                  className="absolute w-full h-full left-0 top-0 origin-center"
                  style={{ transform: `rotate(${i * sliceAngle}deg)` }}
                >
                   <div 
                     className="w-full h-full border-r border-white/20 origin-bottom-center absolute"
                     style={{ 
                       backgroundColor: opt.color,
                       clipPath: 'polygon(50% 50%, 100% 0, 100% 0)' // Simple clip (imperfect for dynamic slices but works for visual)
                     }}
                   >
                     {/* Better CSS Conic Gradient approach is usually preferred but this is a quick visual mock */}
                   </div>
                   {/* Label */}
                   <div 
                      className="absolute left-1/2 top-4 -translate-x-1/2 text-white font-bold text-xs uppercase drop-shadow-md text-center w-12 -rotate-90 origin-center"
                      style={{ transform: `rotate(${sliceAngle/2}deg) translateX(-50%)`}}
                   >
                      {/* Note: positioning text in slices via simple HTML/CSS is tricky without SVG. 
                          Using a simplified overlay for the text */}
                   </div>
                </div>
             ))}
             {/* Use SVG for proper sectors */}
             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {game.options.map((opt, i) => {
                   const startAngle = i * sliceAngle;
                   const endAngle = (i + 1) * sliceAngle;
                   // Convert polar to cartesian
                   const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                   const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                   const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                   const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
                   
                   const d = `M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`;
                   return (
                     <path key={opt.id} d={d} fill={opt.color} stroke="white" strokeWidth="0.5" />
                   );
                })}
             </svg>
             {/* Labels overlay */}
             {game.options.map((opt, i) => {
                const angle = i * sliceAngle + sliceAngle / 2;
                return (
                  <div 
                    key={opt.id}
                    className="absolute w-full text-center text-[10px] font-bold text-white drop-shadow-md"
                    style={{ 
                       top: '50%', 
                       left: '50%',
                       transform: `translate(-50%, -50%) rotate(${angle}deg) translate(35%)`
                    }}
                  >
                    {opt.label}
                  </div>
                )
             })}
           </div>
           
           {/* Center Cap */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 shadow-xl z-10">
              <span className="text-black font-bold text-xs">SPIN</span>
           </div>

           {/* Result Popup */}
           {showResult && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-4 rounded-xl border border-dungeon-accent animate-in fade-in zoom-in duration-300 z-30 text-center whitespace-nowrap shadow-[0_0_30px_rgba(225,29,72,0.6)]">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-bounce" />
                <div className="text-sm text-gray-400 uppercase font-bold">Winner</div>
                <div className="text-2xl font-bold text-dungeon-accent">{game.options[resultIndex].label}</div>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (game.type === 'DICE') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 pointer-events-none">
         <div className="text-center">
            {spinning ? (
               <Dice5 className="w-32 h-32 text-white animate-spin duration-700" />
            ) : (
               <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border-4 border-dungeon-accent shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-bounce">
                  <span className="text-6xl font-bold text-black">{diceValue}</span>
               </div>
            )}
            
            {showResult && (
              <div className="mt-8 bg-black/80 px-6 py-2 rounded-full border border-white/20 animate-in slide-in-from-bottom">
                 <span className="text-xl font-bold text-white uppercase tracking-widest">Rolled {diceValue}!</span>
              </div>
            )}
         </div>
      </div>
    );
  }

  return null;
};

export default GameOverlay;
