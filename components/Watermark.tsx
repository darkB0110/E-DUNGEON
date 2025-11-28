
import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface WatermarkProps {
  text: string;
  visible: boolean;
  className?: string;
}

const Watermark: React.FC<WatermarkProps> = ({ text, visible, className = "" }) => {
  const [position, setPosition] = useState({ x: 10, y: 10 });
  
  // Subtle movement effect to prevent removal
  useEffect(() => {
    if (!visible) return;
    
    const moveInterval = setInterval(() => {
      // Random position within a 5% range to keep it floating but not distracting
      const newX = Math.max(5, Math.min(90, position.x + (Math.random() * 2 - 1)));
      const newY = Math.max(5, Math.min(90, position.y + (Math.random() * 2 - 1)));
      setPosition({ x: newX, y: newY });
    }, 5000);

    return () => clearInterval(moveInterval);
  }, [visible, position]);

  if (!visible) return null;

  return (
    <div 
      className={`absolute z-[100] pointer-events-none select-none flex items-center gap-1 opacity-40 mix-blend-screen ${className}`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transition: 'all 5s ease-in-out'
      }}
    >
        <ShieldCheck size={12} className="text-white/50" />
        <span className="text-[10px] font-mono font-bold text-white/50 tracking-widest uppercase">
            {text}
        </span>
    </div>
  );
};

export default Watermark;