
import React, { useState } from 'react';
import { User } from '../types';
import Loader from '../components/Loader';
import { Camera, LogIn, ArrowLeft, Chrome } from 'lucide-react';
import { backend } from '../services/backend';

interface AuthFanProps {
  onLogin: (user: User) => void;
  onSwitchToModel: () => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

const AuthFan: React.FC<AuthFanProps> = ({ onLogin, onSwitchToModel, onSwitchToLogin, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    consent: false
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) return;
    setLoading(true);
    setError('');

    try {
      const newUser = await backend.auth.register({
        id: '', // Backend assigns ID
        username: formData.username,
        email: formData.email,
        role: 'FAN',
        tokens: 100, // Signup bonus
        subscriptions: [],
        favorites: [],
        following: [],
        unlockedStreams: [],
        unlockedContent: [],
        purchasedMerch: []
      });
      onLogin(newUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
      setLoading(true);
      try {
          // This simulates Google returning a user context
          const user = await backend.auth.loginWithGoogle('FAN');
          onLogin(user);
      } catch (e) {
          setError("Google Sign-up failed.");
          setLoading(false);
      }
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4 relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm hidden md:inline">Back</span>
      </button>

      <div className="w-full max-w-md bg-dungeon-900/50 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
        <h2 className="text-3xl font-display font-bold text-center mb-2 text-white">Join the <span className="text-dungeon-accent">Cult</span></h2>
        <p className="text-center text-gray-400 mb-8">Create your fan profile</p>

        {loading ? (
          <Loader text="SUMMONING PROFILE..." />
        ) : (
          <div className="space-y-4">
             {/* Google Sign In */}
            <button 
                type="button"
                onClick={handleGoogleSignup}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 mb-4"
            >
                <Chrome size={20} className="text-blue-600" /> 
                Continue with Gmail
            </button>

            <div className="flex items-center gap-4 text-xs text-gray-500 uppercase font-bold">
                <div className="h-px bg-white/10 flex-1"></div>
                OR
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-xs text-center font-bold">{error}</div>}
                
                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
                <input 
                    type="password" 
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                />
                </div>

                <div className="flex items-start gap-2 pt-2">
                <input 
                    type="checkbox" 
                    id="consent"
                    required
                    checked={formData.consent}
                    onChange={e => setFormData({...formData, consent: e.target.checked})}
                    className="mt-1"
                />
                <label htmlFor="consent" className="text-xs text-gray-400">
                    I confirm I am over 18 years of age and consent to the data processing agreement and terms of service.
                </label>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                <button 
                    type="submit" 
                    className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                >
                    CREATE ACCOUNT
                </button>
                </div>
                
                <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                <button 
                    type="button" 
                    onClick={onSwitchToModel}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                    <Camera size={14} /> BECOME A MODEL
                </button>
                
                <div className="flex justify-between items-center text-xs">
                    <button 
                    type="button" 
                    onClick={onSwitchToLogin}
                    className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                    <LogIn size={12} /> Already have an account? Log In
                    </button>
                </div>
                </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFan;
