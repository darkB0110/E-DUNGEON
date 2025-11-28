

import React, { useState } from 'react';
import { User, Quest } from '../types';
import { MOCK_PERFORMERS, MOCK_QUESTS } from '../constants';
import { User as UserIcon, LogOut, Coins, CreditCard, Heart, Video, Bell, Globe, Sword, CheckCircle, Gift, ArrowLeft, Share2, Copy } from 'lucide-react';

interface FanDashboardProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
  onOpenWallet: () => void;
  onClaimQuest: (questId: string, reward: number) => void;
}

const FanDashboard: React.FC<FanDashboardProps> = ({ user, onLogout, onBack, onOpenWallet, onClaimQuest }) => {
  const subscribedModels = MOCK_PERFORMERS.filter(p => user.subscriptions.includes(p.id));
  const favoriteModels = MOCK_PERFORMERS.filter(p => user.favorites.includes(p.id));
  
  // Use mock quests or user quests
  const quests = user.quests || MOCK_QUESTS;

  const [settings, setSettings] = useState({
      geoNotify: user.settings?.geoNotifications ?? false,
      frequency: user.settings?.emailFrequency ?? 'INSTANT'
  });

  const copyReferral = () => {
      navigator.clipboard.writeText(`https://dungeon.com/ref/${user.referralCode}`);
      alert("Referral link copied! Share it to earn 5% of all tokens bought by friends.");
  };

  return (
    <div className="p-6 md:p-8 space-y-8 pb-20 relative">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white transition-colors flex items-center gap-2 group z-20"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm hidden md:inline">Back</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4 pl-0 md:pl-28">
        <div className="flex items-center gap-4 mt-8 md:mt-0">
          <div className="w-20 h-20 rounded-full bg-dungeon-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-dungeon-900">
             {user.username.substring(0,2).toUpperCase()}
          </div>
          <div>
             <h1 className="text-3xl font-display font-bold text-white">{user.username}</h1>
             <p className="text-gray-400 text-sm">Level 5 Cultist • <span className="text-dungeon-accent">VIP Member</span></p>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={onOpenWallet} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
             <Coins size={16} /> Balance: {user.tokens} T
           </button>
           <button onClick={onLogout} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
             <LogOut size={16} /> Logout
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Referral Program - NEW */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-dungeon-900/50 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden group col-span-full md:col-span-2 lg:col-span-1">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Share2 size={120} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Share2 className="text-indigo-400"/> Affiliate Program
             </h3>
             <p className="text-gray-300 text-sm mb-4">
                 Earn 5% lifetime commissions on tokens purchased by users you invite.
             </p>
             <div className="bg-black/40 p-3 rounded-lg border border-white/10 flex items-center justify-between mb-4">
                 <code className="text-indigo-400 font-mono font-bold">dungeon.com/ref/{user.referralCode || 'Generate'}</code>
                 <button onClick={copyReferral} className="p-2 hover:bg-white/10 rounded-full text-white">
                     <Copy size={16} />
                 </button>
             </div>
             <div className="flex gap-4">
                 <div className="text-center">
                     <div className="text-2xl font-bold text-white">{user.referralCount || 0}</div>
                     <div className="text-[10px] text-gray-500 uppercase">Invites</div>
                 </div>
                 <div className="text-center">
                     <div className="text-2xl font-bold text-yellow-500">{user.referralEarnings || 0} T</div>
                     <div className="text-[10px] text-gray-500 uppercase">Earned</div>
                 </div>
             </div>
          </div>

          {/* Dungeon Quests */}
          <div className="bg-dungeon-900/50 border border-dungeon-accent/30 rounded-xl p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sword size={80} />
             </div>
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sword className="text-dungeon-accent"/> Daily Quests
             </h3>
             <div className="space-y-4">
                 {quests.map(quest => (
                     <div key={quest.id} className="bg-black/40 rounded-lg p-3 border border-white/5">
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <h4 className="text-white font-bold text-sm">{quest.title}</h4>
                                 <p className="text-gray-500 text-xs">{quest.description}</p>
                             </div>
                             <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20 flex items-center gap-1">
                                <Coins size={10} /> +{quest.rewardTokens}
                             </div>
                         </div>
                         <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                             <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-dungeon-accent to-purple-600 transition-all duration-1000"
                                style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                             />
                         </div>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-gray-400">{quest.progress} / {quest.total}</span>
                            {quest.isClaimed ? (
                                <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><CheckCircle size={10}/> Claimed</span>
                            ) : quest.progress >= quest.total ? (
                                <button 
                                  onClick={() => onClaimQuest(quest.id, quest.rewardTokens)}
                                  className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded animate-pulse hover:bg-green-700"
                                >
                                  Claim Reward
                                </button>
                            ) : null}
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* Subscriptions */}
          <div className="bg-dungeon-900/50 border border-white/5 rounded-xl p-6">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="text-dungeon-accent"/> Active Subscriptions
             </h3>
             {subscribedModels.length > 0 ? (
                 <div className="space-y-3">
                    {subscribedModels.map(model => (
                        <div key={model.id} className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                           <img src={model.thumbnail} className="w-10 h-10 rounded-full object-cover" alt={model.name}/>
                           <div className="flex-1">
                               <div className="text-white font-bold text-sm">{model.name}</div>
                               <div className="text-gray-500 text-xs">Renewing soon</div>
                           </div>
                           <button className="text-xs text-red-500 hover:text-white px-2 py-1">Cancel</button>
                        </div>
                    ))}
                 </div>
             ) : (
                 <p className="text-gray-500 text-sm italic py-4 text-center">No active subscriptions.</p>
             )}
          </div>

          {/* Favorites */}
          <div className="bg-dungeon-900/50 border border-white/5 rounded-xl p-6">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="text-dungeon-accent"/> Favorites
             </h3>
             {favoriteModels.length > 0 ? (
                 <div className="space-y-3">
                    {favoriteModels.map(model => (
                        <div key={model.id} className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                           <img src={model.thumbnail} className="w-10 h-10 rounded-full object-cover" alt={model.name}/>
                           <div className="flex-1">
                               <div className="text-white font-bold text-sm">{model.name}</div>
                               <div className="flex items-center gap-1 text-[10px] text-green-500">
                                  <div className={`w-2 h-2 rounded-full ${model.status === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                  {model.status}
                               </div>
                           </div>
                           <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors">Visit</button>
                        </div>
                    ))}
                 </div>
             ) : (
                 <p className="text-gray-500 text-sm italic py-4 text-center">No favorites yet.</p>
             )}
          </div>
          
           {/* Notifications Settings */}
          <div className="bg-dungeon-900/50 border border-white/5 rounded-xl p-6">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="text-dungeon-accent"/> Notifications
             </h3>
             <div className="space-y-4">
                 <div className="flex items-start justify-between">
                     <div>
                         <div className="text-sm text-white font-bold flex items-center gap-2">
                             <Globe size={14} /> Geo-Fenced Alerts
                         </div>
                         <div className="text-xs text-gray-500">Only notify when models go live in your optimal time window.</div>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={settings.geoNotify} 
                       onChange={e => setSettings({...settings, geoNotify: e.target.checked})}
                       className="toggle-checkbox"
                     />
                 </div>

                 <div className="border-t border-white/5 pt-3">
                     <label className="text-xs text-gray-400 font-bold uppercase">Email Frequency</label>
                     <select 
                       value={settings.frequency}
                       onChange={e => setSettings({...settings, frequency: e.target.value as any})}
                       className="w-full mt-2 bg-black border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-dungeon-accent"
                     >
                         <option value="INSTANT">Instant (When live)</option>
                         <option value="DAILY">Daily Digest</option>
                         <option value="NONE">None</option>
                     </select>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default FanDashboard;