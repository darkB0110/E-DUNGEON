
import React from 'react';
import { Clock, ShieldCheck, LogOut } from 'lucide-react';

interface VerificationPendingProps {
  onLogout: () => void;
}

const VerificationPending: React.FC<VerificationPendingProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-dungeon-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dungeon-900/50 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
            <Clock className="w-10 h-10 text-yellow-500 animate-pulse" />
        </div>

        <h1 className="text-2xl font-display font-bold text-white mb-2">Verification Pending</h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Your application to become a Creator is currently under review by our compliance team. 
          This process typically takes 24-48 hours. You will be notified via email once approved.
        </p>

        <div className="bg-black/30 p-4 rounded-lg border border-white/5 mb-8 text-left">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-green-500 w-5 h-5" />
              <span className="text-white font-bold text-sm">Documents Submitted</span>
           </div>
           <p className="text-xs text-gray-500 ml-8">
              We are verifying your Government ID and Tax Information (W-9).
           </p>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> LOGOUT
        </button>
      </div>
    </div>
  );
};

export default VerificationPending;
