
import React, { useState } from 'react';
import { User } from '../types';
import Loader from '../components/Loader';
import { Lock, User as UserIcon, UserPlus, ArrowLeft, Chrome } from 'lucide-react';
import { backend } from '../services/backend';

interface LoginProps {
  onLogin: (user: User) => void;
  onSignup: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await backend.auth.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
     setLoading(true);
     setError('');
     try {
         const user = await backend.auth.loginWithGoogle('FAN');
         onLogin(user);
     } catch (e) {
         setError('Google Authentication Failed');
         setLoading(false);
     }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-dungeon-950 relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm hidden md:inline">Back</span>
      </button>

      <div className="w-full max-w-md bg-black/40 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white tracking-wider">DUNGEON</h1>
            <p className="text-gray-500 text-sm mt-2">Enter the realm.</p>
        </div>

        {loading ? (
          <div className="py-12">
            <Loader text="AUTHENTICATING..." />
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="text-red-500 text-xs text-center font-bold bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}
            
            {/* Google Sign In */}
            <button 
                type="button"
                onClick={handleGoogleLogin}
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Email or Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-dungeon-accent focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-dungeon-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
            >
              LOG IN
            </button>

            <button 
              type="button"
              onClick={onSignup} 
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={18} /> CREATE ACCOUNT
            </button>

            <div className="flex justify-between items-center text-xs mt-4">
               <button type="button" onClick={onBack} className="text-gray-500 hover:text-white">Cancel</button>
               <button type="button" className="text-dungeon-accent hover:underline">Forgot Password?</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
