
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

const AgeGate: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('dungeon_age_verified');
    if (!verified) {
      setIsVisible(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('dungeon_age_verified', 'true');
    setIsVisible(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dungeon-950 border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dungeon-accent to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-dungeon-accent/10 rounded-full blur-3xl"></div>

        <ShieldAlert className="w-16 h-16 text-dungeon-accent mx-auto mb-6" />
        
        <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-wider">RESTRICTED ACCESS</h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          This website contains age-restricted materials including nudity and strong language. 
          By entering, you confirm that you are at least 18 years of age (or the age of majority in your jurisdiction) 
          and consent to viewing such content.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleVerify}
            className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2"
          >
            <Check size={20} /> I AM 18 OR OLDER - ENTER
          </button>
          
          <button 
            onClick={handleExit}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white font-bold py-3 rounded-xl transition-colors text-xs"
          >
            I AM UNDER 18 - EXIT
          </button>
        </div>
        
        <div className="mt-6 text-[10px] text-gray-600">
          Dungeon complies with 18 U.S.C. § 2257 Record Keeping Requirements Compliance Statement.
        </div>
      </div>
    </div>
  );
};

export default AgeGate;
