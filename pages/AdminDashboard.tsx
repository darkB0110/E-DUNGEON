

import React, { useState, useEffect } from 'react';
import { User, Performer, PerformerStatus, Violation, WithdrawalRequest } from '../types';
import { backend } from '../services/backend';
import { ShieldAlert, Users, Video, PlusCircle, LogOut, Eye, Coins, CheckCircle, Lock, FileText, UserCheck, AlertTriangle, DollarSign, X } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onEnterGhostMode: (performer: Performer) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onEnterGhostMode }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FANS' | 'MODELS' | 'APPROVALS' | 'FINANCE' | 'RISKS'>('OVERVIEW');
  const [fans, setFans] = useState<User[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [pendingModels, setPendingModels] = useState<User[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  
  // Model Create Form
  const [newModelName, setNewModelName] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allFans = await backend.user.getAll();
    const allPerformers = await backend.performers.getAll();
    const pending = await backend.performers.getPending();
    const activeViolations = await backend.admin.getViolations();
    const pendingWithdrawals = await backend.withdrawals.getPending();
    
    setFans(allFans);
    setPerformers(allPerformers);
    setPendingModels(pending);
    setViolations(activeViolations);
    setWithdrawals(pendingWithdrawals);
  };

  const handleGrantTokens = async (userId: string) => {
     await backend.admin.grantAccess(userId, 1000);
     alert("Granted 1000 tokens invisibly.");
     loadData();
  };

  const handleApproveModel = async (userId: string) => {
      if(window.confirm("Approve this model and grant full creator access?")) {
          await backend.admin.approveModel(userId);
          alert("Model Verified.");
          loadData();
      }
  };
  
  const handleApproveWithdrawal = async (requestId: string) => {
      if (window.confirm("Approve payment and release funds?")) {
          await backend.withdrawals.approve(requestId);
          loadData();
      }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
      if (window.confirm("Reject payment and refund tokens to model balance?")) {
          await backend.withdrawals.reject(requestId);
          loadData();
      }
  };

  const handleManualAddModel = async () => {
      if (!newModelName) return;
      const newPerformer: Performer = {
          id: `manual-${Date.now()}`,
          name: newModelName,
          tags: ['Featured'],
          viewers: 0,
          thumbnail: `https://picsum.photos/seed/${newModelName}/400/600`,
          status: PerformerStatus.OFFLINE,
          description: 'Manually added by Admin',
          isAi: false,
          subscriptionPrice: 50,
          unlockPrice: 10,
          privateRoomPrice: 100,
          spyPrice: 20,
          kickPrice: 100,
          rating: 5,
          ratingCount: 0,
          content: [],
          albums: [],
          merch: [],
          games: [],
          earnings: 0,
          blockedRegions: [],
          bannedUsers: [],
          country: 'Unknown',
          toyConnected: false
      };
      await backend.performers.manualAdd(newPerformer);
      alert("Model added manually.");
      setNewModelName('');
      loadData();
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
       <div className="flex justify-between items-center border-b border-green-900 pb-4 mb-8">
          <div className="flex items-center gap-3">
             <ShieldAlert size={32} />
             <h1 className="text-3xl font-bold tracking-widest uppercase">Master Admin Terminal</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 hover:text-white">
             <LogOut size={20} /> Terminate Session
          </button>
       </div>

       <div className="flex gap-4 mb-8 overflow-x-auto">
          {['OVERVIEW', 'FANS', 'MODELS', 'APPROVALS', 'FINANCE', 'RISKS'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-6 py-2 border ${activeTab === tab ? 'bg-green-900/30 border-green-500 text-white' : 'border-green-900 text-green-700 hover:border-green-500'}`}
             >
                {tab}
                {tab === 'APPROVALS' && pendingModels.length > 0 && (
                    <span className="ml-2 bg-yellow-600 text-black font-bold text-[10px] px-1.5 rounded-full">{pendingModels.length}</span>
                )}
                {tab === 'FINANCE' && withdrawals.length > 0 && (
                    <span className="ml-2 bg-blue-600 text-white font-bold text-[10px] px-1.5 rounded-full">{withdrawals.length}</span>
                )}
                {tab === 'RISKS' && violations.length > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full animate-pulse">{violations.length}</span>
                )}
             </button>
          ))}
       </div>

       {activeTab === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-green-900 p-6 rounded bg-black">
                 <h3 className="text-gray-500 uppercase text-xs mb-2">Total Users</h3>
                 <div className="text-4xl font-bold">{fans.length}</div>
              </div>
              <div className="border border-green-900 p-6 rounded bg-black">
                 <h3 className="text-gray-500 uppercase text-xs mb-2">Active Models</h3>
                 <div className="text-4xl font-bold">{performers.length}</div>
              </div>
              <div className="border border-green-900 p-6 rounded bg-black">
                 <h3 className="text-gray-500 uppercase text-xs mb-2">Live Streams</h3>
                 <div className="text-4xl font-bold">{performers.filter(p => p.status === 'LIVE' || p.status === 'PRIVATE').length}</div>
              </div>

              {violations.length > 0 && (
                  <div className="col-span-full bg-red-900/10 border border-red-500 p-6 rounded">
                      <div className="flex items-center gap-3 text-red-500 mb-4">
                          <AlertTriangle size={24} />
                          <h3 className="font-bold text-xl uppercase">Active Security Threats Detected</h3>
                      </div>
                      <div className="text-sm text-red-300">
                          {violations.length} incidents of AI Deepfakes or Banned Content detected recently. Check 'RISKS' tab.
                      </div>
                  </div>
              )}

              <div className="col-span-full mt-8">
                 <h3 className="text-white font-bold mb-4 uppercase flex items-center gap-2"><Eye/> Active Surveillance</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {performers.filter(p => p.status !== 'OFFLINE').map(p => (
                       <div key={p.id} className="border border-green-800 p-4 relative group">
                          <div className="absolute top-2 right-2 flex gap-1">
                             <span className={`w-2 h-2 rounded-full ${p.status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                          </div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.viewers} viewers</div>
                          <button 
                             onClick={() => onEnterGhostMode(p)}
                             className="mt-4 w-full border border-green-500 text-green-500 hover:bg-green-500 hover:text-black py-1 text-xs font-bold uppercase"
                          >
                             Ghost Watch
                          </button>
                       </div>
                    ))}
                    {performers.filter(p => p.status !== 'OFFLINE').length === 0 && (
                        <div className="text-gray-600 italic">No active signals detected.</div>
                    )}
                 </div>
              </div>
           </div>
       )}

       {activeTab === 'RISKS' && (
           <div className="space-y-4">
               <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest"><ShieldAlert/> Security Violations Log</h3>
               {violations.length === 0 && <p className="text-gray-500 italic">System secure. No active threats.</p>}
               {violations.map((v, i) => (
                   <div key={i} className="bg-red-950/20 border border-red-500 p-4 rounded flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">{v.type}</span>
                               <span className="text-red-400 font-bold">{v.performerName}</span>
                           </div>
                           <p className="text-gray-300 text-sm">{v.details}</p>
                           <div className="text-xs text-gray-500 mt-2">{new Date(v.timestamp).toLocaleString()}</div>
                       </div>
                       <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded">
                           RESOLVE / BAN
                       </button>
                   </div>
               ))}
           </div>
       )}

       {activeTab === 'FANS' && (
           <div className="space-y-4">
               {fans.map(fan => (
                  <div key={fan.id} className="border border-green-900 p-4 flex justify-between items-center hover:bg-green-900/10">
                      <div>
                         <div className="font-bold text-white">{fan.username}</div>
                         <div className="text-xs text-gray-500">{fan.email} • {fan.tokens} Tokens</div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => handleGrantTokens(fan.id)} className="flex items-center gap-1 border border-green-700 px-3 py-1 text-xs hover:bg-green-900">
                             <Coins size={12}/> +1000 T
                         </button>
                         <button className="flex items-center gap-1 border border-blue-700 text-blue-500 px-3 py-1 text-xs hover:bg-blue-900">
                             <CheckCircle size={12}/> Grant VIP
                         </button>
                      </div>
                  </div>
               ))}
           </div>
       )}
       
       {activeTab === 'FINANCE' && (
           <div className="space-y-4">
               <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase tracking-widest"><DollarSign /> Payout Requests</h3>
               {withdrawals.length === 0 && <p className="text-gray-500 italic">No pending withdrawal requests.</p>}
               
               {withdrawals.map(wd => (
                   <div key={wd.id} className="border border-blue-500/50 p-6 bg-blue-500/5 flex justify-between items-center">
                       <div>
                           <div className="text-xl font-bold text-white mb-1">{wd.performerName}</div>
                           <div className="flex gap-4 text-sm text-gray-400">
                               <span>{wd.amountTokens} Tokens</span>
                               <span className="text-green-500 font-bold">${wd.amountUsd.toFixed(2)} USD</span>
                               <span className="text-blue-400">{wd.method}</span>
                           </div>
                           <div className="text-xs text-gray-500 mt-2 font-mono bg-black/50 p-2 rounded">
                               {wd.details}
                           </div>
                       </div>
                       <div className="flex gap-2">
                           <button 
                             onClick={() => handleApproveWithdrawal(wd.id)}
                             className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 flex items-center gap-2"
                           >
                              <CheckCircle size={16} /> RELEASE FUNDS
                           </button>
                           <button 
                             onClick={() => handleRejectWithdrawal(wd.id)}
                             className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-4 py-2 flex items-center gap-2"
                           >
                              <X size={16} /> REJECT
                           </button>
                       </div>
                   </div>
               ))}
           </div>
       )}

       {activeTab === 'APPROVALS' && (
           <div className="space-y-4">
               <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FileText/> Pending Applications</h3>
               {pendingModels.length === 0 && <p className="text-gray-500 italic">No pending applications.</p>}
               {pendingModels.map(model => (
                  <div key={model.id} className="border border-yellow-500/50 p-6 bg-yellow-500/5">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <div className="text-xl font-bold text-white">{model.username}</div>
                              <div className="text-sm text-gray-400">{model.email}</div>
                          </div>
                          <div className="bg-yellow-500 text-black px-2 py-1 text-xs font-bold rounded">PENDING REVIEW</div>
                      </div>
                      
                      {model.realInfo && (
                          <div className="grid grid-cols-2 gap-4 mb-6 bg-black p-4 border border-green-900/50">
                              <div>
                                  <div className="text-xs text-gray-500 uppercase">Legal Name</div>
                                  <div className="text-white">{model.realInfo.realName}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-500 uppercase">Date of Birth</div>
                                  <div className="text-white">{model.realInfo.dob} (Age: {model.realInfo.age})</div>
                              </div>
                              <div className="col-span-2">
                                  <div className="text-xs text-gray-500 uppercase">Address</div>
                                  <div className="text-white">{model.realInfo.address}</div>
                              </div>
                          </div>
                      )}

                      <div className="flex gap-3">
                          <button 
                             onClick={() => handleApproveModel(model.id)}
                             className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-bold"
                          >
                             <UserCheck size={18} /> APPROVE APPLICATION
                          </button>
                          <button className="flex items-center gap-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2 font-bold">
                             REJECT
                          </button>
                      </div>
                  </div>
               ))}
           </div>
       )}

       {activeTab === 'MODELS' && (
           <div className="space-y-8">
               <div className="border border-green-900 p-6 max-w-md">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><PlusCircle/> Manual Model Injection</h3>
                  <div className="space-y-3">
                     <input 
                       type="text" 
                       value={newModelName}
                       onChange={e => setNewModelName(e.target.value)}
                       placeholder="Model Name" 
                       className="w-full bg-black border border-green-800 p-2 text-white focus:outline-none"
                     />
                     <button onClick={handleManualAddModel} className="w-full bg-green-700 text-black font-bold py-2 hover:bg-green-600">CREATE ENTITY</button>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {performers.map(p => (
                      <div key={p.id} className="border border-green-900 p-3 opacity-70 hover:opacity-100">
                         <img src={p.thumbnail} className="w-full h-32 object-cover mb-2 grayscale hover:grayscale-0" />
                         <div className="font-bold text-xs">{p.name}</div>
                         <div className="text-[10px] text-gray-500">{p.status}</div>
                      </div>
                  ))}
               </div>
           </div>
       )}
    </div>
  );
};

export default AdminDashboard;