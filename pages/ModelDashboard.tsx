
import React, { useState, useEffect } from 'react';
import { User, PerformerStatus, Game, GameOption, Order, Campaign, WithdrawalRequest } from '../types';
import { Upload, DollarSign, Lock, Image, Video, Save, Bot, ShieldAlert, ShoppingBag, Globe, Power, Ban, UserX, Zap, MessageSquare, Copyright, Disc, Trash2, Download, Users, Wand2, EyeOff, Share2, Copy, Gamepad2, Plus, Dice5, FolderOpen, Mail, ListChecks, ArrowLeft, Wifi, Fingerprint, Loader as LoaderIcon, Wallet, Swords, AlertCircle, CheckCircle } from 'lucide-react';
import { generateContentTags, generateWatermarkID } from '../services/geminiService';
import { safetyService } from '../services/safetyService';
import OrderModal from '../components/OrderModal';
import { MOCK_ORDERS, MIN_WITHDRAWAL_TOKENS, TOKEN_PAYOUT_RATE } from '../constants';
import { backend } from '../services/backend';

interface ModelDashboardProps {
  user: User;
  onLogout: () => void;
}

const ModelDashboard: React.FC<ModelDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONTENT' | 'GAMES' | 'ORDERS' | 'CAMPAIGNS' | 'PAYOUTS' | 'SETTINGS'>('OVERVIEW');
  const [status, setStatus] = useState<PerformerStatus>(PerformerStatus.OFFLINE);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  // Settings
  const [hideCountry, setHideCountry] = useState(false);
  const [toyConnected, setToyConnected] = useState(true); // Mock initial state
  
  // New Features
  const [aiWatermark, setAiWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSaveRecording, setShowSaveRecording] = useState(false);
  
  // Content Safety
  const [scanningContent, setScanningContent] = useState(false);
  const [scanResult, setScanResult] = useState<{safe: boolean, reason?: string} | null>(null);
  
  // Squad Stream
  const [squadEnabled, setSquadEnabled] = useState(false);

  // Battle Mode
  const [battleActive, setBattleActive] = useState(false);

  // Content Upload Form
  const [uploadDesc, setUploadDesc] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaignText, setNewCampaignText] = useState('');
  const [newCampaignPrice, setNewCampaignPrice] = useState(50);
  
  // Real Earnings & Payouts
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState('CRYPTO');
  const [withdrawDetails, setWithdrawDetails] = useState('');

  // Games State
  const [games, setGames] = useState<Game[]>([
     { id: 'g1', type: 'WHEEL', title: 'Spin The Wheel', description: 'Test your luck', price: 50, options: [{id:'1', label:'Flash', color:'#ec4899'}, {id:'2', label:'Spank', color:'#ef4444'}] }
  ]);
  const [newGameType, setNewGameType] = useState<'WHEEL' | 'DICE'>('WHEEL');
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGamePrice, setNewGamePrice] = useState(50);

  // Albums State
  const [albums, setAlbums] = useState([{id: 'a1', title: 'My First Album', count: 0}]);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  useEffect(() => {
     loadData();
  }, [activeTab]); // Refresh when tab changes

  const loadData = async () => {
      const dbCampaigns = await backend.campaigns.getAll(user.id);
      setCampaigns(dbCampaigns);
      
      const performers = await backend.performers.getAll();
      const me = performers.find(p => p.id === user.id);
      if (me) {
          setCurrentEarnings(me.earnings);
          // Sync live status from DB
          setStatus(me.status);
      }

      const wds = await backend.withdrawals.getByUser(user.id);
      setWithdrawals(wds);
      
      // Load current model settings (mocked for now, would come from backend)
      setWatermarkText(`DGN-${user.username.toUpperCase()}-SECURE`);
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleLive = () => {
    if (status === PerformerStatus.LIVE) {
        setStatus(PerformerStatus.OFFLINE);
        if (isRecording) handleStopRecording();
        if (battleActive) setBattleActive(false);
    } else {
        setStatus(PerformerStatus.LIVE);
    }
  };

  const toggleBattle = () => {
      if (battleActive) {
          setBattleActive(false);
          // In real app, call backend to stop battle
      } else {
          setBattleActive(true);
          // In real app, call backend to find opponent and start
          alert("PK Battle Started! Opponent: Lady Raven");
      }
  };

  const handleRecordToggle = () => {
      if (isRecording) handleStopRecording();
      else {
          setIsRecording(true);
          setRecordingTime(0);
      }
  };

  const handleStopRecording = () => {
      setIsRecording(false);
      setShowSaveRecording(true);
  };

  const handleSaveRecording = () => {
      alert("Recording saved to your Content Library!");
      setShowSaveRecording(false);
      setRecordingTime(0);
  };

  const handleDeleteRecording = () => {
      if(window.confirm("Discard recording?")) {
        setShowSaveRecording(false);
        setRecordingTime(0);
      }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      setScanningContent(true);
      setScanResult(null);

      // PERFORM DEEPFAKE / AI CHECK
      const result = await safetyService.scanContent(file);
      setScanningContent(false);

      if (!result.safe) {
          setScanResult({ safe: false, reason: result.reason });
          
          // Log violation
          backend.admin.logViolation({
              id: `v-${Date.now()}`,
              performerId: user.id,
              performerName: user.username,
              type: 'DEEPFAKE',
              severity: 'HIGH',
              timestamp: Date.now(),
              details: `Attempted upload of unsafe content: ${file.name}. Reason: ${result.reason}`,
              resolved: false
          });
          
          alert(`SECURITY ALERT: ${result.reason}. The Admin has been notified.`);
          setSelectedFile(null); // Clear file
      } else {
          setScanResult({ safe: true });
      }
  };

  const handleGenerateTags = async () => {
     if (!uploadDesc) return alert("Please enter a description first.");
     setAiProcessing(true);
     const tags = await generateContentTags(uploadDesc);
     setGeneratedTags(tags);
     setAiProcessing(false);
  };
  
  const handleGenerateWatermark = async () => {
      setAiProcessing(true);
      const id = await generateWatermarkID(user.username);
      setWatermarkText(id);
      setAiProcessing(false);
  };

  const handleAddGame = () => {
    if (!newGameTitle) return;
    const newGame: Game = {
        id: `g-${Date.now()}`,
        type: newGameType,
        title: newGameTitle,
        description: 'Custom Game',
        price: newGamePrice,
        options: newGameType === 'WHEEL' ? [
            { id: '1', label: 'Option 1', color: '#3b82f6' },
            { id: '2', label: 'Option 2', color: '#ef4444' }
        ] : undefined
    };
    setGames([...games, newGame]);
    setNewGameTitle('');
  };

  const handleUpdateOrderStatus = (orderId: string, status: any, price?: number) => {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status, price: price || o.price } : o));
      setSelectedOrder(null);
  };

  const handleSendCampaign = async () => {
     if (!newCampaignText) return;
     const newCamp: Campaign = {
        id: `cp-${Date.now()}`,
        performerId: user.id,
        text: newCampaignText,
        unlockPrice: newCampaignPrice,
        sentTo: 1450, // Mock sub count
        openRate: 0,
        revenue: 0,
        createdAt: Date.now()
     };
     
     await backend.campaigns.create(newCamp);
     setCampaigns([newCamp, ...campaigns]);
     setNewCampaignText('');
     alert(`Campaign sent to 1,450 subscribers!`);
  };

  const handleRequestWithdrawal = async () => {
      const amount = parseInt(withdrawAmount);
      if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

      try {
          await backend.withdrawals.request(user.id, amount, withdrawMethod, withdrawDetails);
          alert("Withdrawal requested successfully! Admin approval pending.");
          setWithdrawAmount('');
          loadData(); // Refresh earnings and history
      } catch (e: any) {
          alert(`Failed: ${e.message}`);
      }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate payout progress
  const payoutProgress = Math.min(100, (currentEarnings / MIN_WITHDRAWAL_TOKENS) * 100);

  return (
    <div className="p-6 md:p-8 space-y-8 relative">
      <button 
        onClick={onLogout} // Acts as back/logout for now to reset view
        className="absolute top-6 left-6 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white transition-colors flex items-center gap-2 group z-20 md:hidden"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <button className="hidden md:inline">Back</button>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4 pl-0 md:pl-0 mt-8 md:mt-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Creator Studio</h1>
          <p className="text-gray-400 text-sm">Welcome back, <span className="text-dungeon-accent">{user.username}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Squad Mode Toggle */}
           <button 
              onClick={() => setSquadEnabled(!squadEnabled)}
              className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${squadEnabled ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
           >
              <Users size={12} /> Squad Stream: {squadEnabled ? 'READY' : 'OFF'}
           </button>

           <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Earnings (70% Share)</span>
              <span className="text-xl font-bold text-yellow-500 font-mono">{currentEarnings.toLocaleString()} T</span>
           </div>
           
           {status === PerformerStatus.LIVE && (
              <button 
                onClick={handleRecordToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all border ${isRecording ? 'bg-white text-red-600 border-red-600' : 'bg-black/40 text-gray-300 border-white/10 hover:text-white'}`}
              >
                  <Disc className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                  {isRecording ? formatTime(recordingTime) : 'REC'}
              </button>
           )}

           <button 
             onClick={toggleLive}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${status === PerformerStatus.LIVE ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-green-600 hover:bg-green-700 text-white'}`}
           >
             <Power className="w-5 h-5" />
             {status === PerformerStatus.LIVE ? 'END STREAM' : 'GO LIVE'}
           </button>

           <button onClick={onLogout} className="text-sm text-gray-500 hover:text-white underline hidden md:block">Log Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-dungeon-800">
         {['OVERVIEW', 'CONTENT', 'GAMES', 'ORDERS', 'CAMPAIGNS', 'PAYOUTS', 'SETTINGS'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-dungeon-accent text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
           >
             {tab === 'GAMES' && <Gamepad2 size={16} />}
             {tab === 'ORDERS' && <ListChecks size={16} />}
             {tab === 'CAMPAIGNS' && <Mail size={16} />}
             {tab === 'PAYOUTS' && <Wallet size={16} />}
             {tab}
           </button>
         ))}
      </div>

      <div className="bg-dungeon-900/30 border border-white/5 rounded-xl p-6 min-h-[400px]">
        
        {activeTab === 'OVERVIEW' && (
           <div className="space-y-6">
               <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                     <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Total Earnings</h3>
                     <div className="text-3xl font-bold text-white">{currentEarnings.toLocaleString()} T</div>
                     <div className="text-xs text-green-500 mt-2">70% Revenue Share Applied</div>
                  </div>
               </div>

               {/* Battle Controls */}
               {status === PerformerStatus.LIVE && (
                  <div className="bg-gradient-to-r from-red-900/40 to-blue-900/40 border border-white/10 p-6 rounded-xl flex justify-between items-center">
                      <div>
                          <h3 className="text-white font-bold text-lg flex items-center gap-2"><Swords className="text-white"/> PK Battle Mode</h3>
                          <p className="text-sm text-gray-400">Challenge another model to a 5-minute tip war.</p>
                      </div>
                      <button 
                        onClick={toggleBattle}
                        className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-transform ${battleActive ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                      >
                         {battleActive ? 'END BATTLE' : 'START BATTLE'}
                      </button>
                  </div>
               )}
           </div>
        )}

        {/* ... Rest of existing tabs (PAYOUTS, ORDERS, SETTINGS, CAMPAIGNS, GAMES, CONTENT) ... */}
        {activeTab === 'PAYOUTS' && (
           <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                  {/* Withdrawal Request */}
                  <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                          <Wallet className="text-green-500"/> Request Payout
                      </h3>
                      
                      <div className="mb-6 p-4 bg-green-900/10 border border-green-900/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-400">Available Balance:</span>
                              <span className="text-xl font-bold text-white">{currentEarnings.toLocaleString()} T</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-sm text-gray-400">Est. Value (USD):</span>
                              <span className="text-xl font-bold text-green-500">${(currentEarnings * TOKEN_PAYOUT_RATE).toFixed(2)}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-black/50 rounded-full h-2 mb-2 overflow-hidden border border-white/10">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${payoutProgress >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${payoutProgress}%` }}
                              />
                          </div>
                          
                          {currentEarnings < MIN_WITHDRAWAL_TOKENS ? (
                              <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                                  <AlertCircle size={14} />
                                  Min. {MIN_WITHDRAWAL_TOKENS} tokens required ({MIN_WITHDRAWAL_TOKENS - currentEarnings} more needed).
                              </div>
                          ) : (
                              <div className="flex items-center gap-2 text-xs text-green-500 font-bold">
                                  <CheckCircle size={14} />
                                  Threshold met. You can request a payout.
                              </div>
                          )}
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="text-xs text-gray-400 uppercase font-bold">Amount to Withdraw (Tokens)</label>
                              <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded p-2 text-white mt-1 disabled:opacity-50"
                                placeholder={`Min ${MIN_WITHDRAWAL_TOKENS}`}
                                disabled={currentEarnings < MIN_WITHDRAWAL_TOKENS}
                              />
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 uppercase font-bold">Method</label>
                              <select 
                                value={withdrawMethod}
                                onChange={e => setWithdrawMethod(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded p-2 text-white mt-1"
                              >
                                  <option value="CRYPTO">Crypto (ETH/USDT)</option>
                                  <option value="BANK">Bank Transfer (SWIFT)</option>
                                  <option value="PAYPAL">PayPal</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 uppercase font-bold">Payment Details</label>
                              <input 
                                type="text"
                                value={withdrawDetails}
                                onChange={e => setWithdrawDetails(e.target.value)}
                                placeholder="Wallet Address or IBAN"
                                className="w-full bg-black border border-white/10 rounded p-2 text-white mt-1"
                              />
                          </div>
                          <button 
                            onClick={handleRequestWithdrawal}
                            disabled={currentEarnings < MIN_WITHDRAWAL_TOKENS || !withdrawAmount || !withdrawDetails}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
                          >
                              {currentEarnings < MIN_WITHDRAWAL_TOKENS ? <Lock size={16}/> : <Wallet size={16}/>}
                              Submit Request
                          </button>
                      </div>
                  </div>

                  {/* History */}
                  <div>
                      <h3 className="text-white font-bold mb-4">Payout History</h3>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {withdrawals.length === 0 && <p className="text-gray-500">No withdrawal history.</p>}
                          {withdrawals.map(wd => (
                              <div key={wd.id} className="bg-dungeon-950 border border-white/10 p-4 rounded-lg flex justify-between items-center">
                                  <div>
                                      <div className="font-bold text-white">{wd.amountTokens} Tokens <span className="text-gray-500">(${wd.amountUsd.toFixed(2)})</span></div>
                                      <div className="text-xs text-gray-500">{new Date(wd.requestedAt).toLocaleDateString()} via {wd.method}</div>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                      wd.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                                      wd.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                  }`}>
                                      {wd.status}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
           </div>
        )}

        {activeTab === 'ORDERS' && (
           <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-bold text-lg">Custom Requests</h3>
                 <div className="text-sm text-gray-400">Manage orders from fans</div>
              </div>
              <div className="grid gap-3">
                 {orders.map(order => (
                    <div key={order.id} className="bg-black/40 border border-white/10 rounded-lg p-4 flex justify-between items-center hover:border-dungeon-accent/50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-2 h-12 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-500' : order.status === 'ACCEPTED' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          <div>
                             <div className="text-white font-bold">{order.type} for {order.fanName}</div>
                             <div className="text-gray-400 text-xs truncate max-w-md">{order.description}</div>
                          </div>
                       </div>
                       <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded"
                       >
                          View Details
                       </button>
                    </div>
                 ))}
                 {orders.length === 0 && <p className="text-gray-500">No active orders.</p>}
              </div>
           </div>
        )}

        {activeTab === 'SETTINGS' && (
            <div className="space-y-6 max-w-2xl">
                <h3 className="text-white font-bold text-lg">Stream & Privacy Settings</h3>
                
                {/* Privacy */}
                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <h4 className="text-gray-300 font-bold mb-3">Privacy</h4>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                           <Globe size={18} className="text-gray-400" />
                           <div className="text-sm">
                               <div className="text-white font-bold">Ghost Mode</div>
                               <div className="text-xs text-gray-500">Hide your country flag from viewers</div>
                           </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={hideCountry} 
                          onChange={e => setHideCountry(e.target.checked)} 
                          className="toggle-checkbox"
                        />
                    </div>
                </div>

                {/* AI Watermark */}
                <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/30">
                    <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2"><Fingerprint size={18}/> AI Watermark Protection</h4>
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-sm">
                            <div className="text-white font-bold">Content Watermarking</div>
                            <div className="text-xs text-gray-500 max-w-xs mb-2">Automatically overlay a unique, dynamic ID on your streams and content to prevent theft.</div>
                            <div className="bg-black/40 p-2 rounded border border-white/10 font-mono text-[10px] text-gray-400">
                                Current ID: <span className="text-blue-400">{watermarkText || 'Generating...'}</span>
                            </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={aiWatermark} 
                          onChange={e => setAiWatermark(e.target.checked)} 
                          className="toggle-checkbox"
                        />
                    </div>
                    <button 
                       onClick={handleGenerateWatermark}
                       disabled={aiProcessing}
                       className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/50 px-3 py-1.5 rounded hover:bg-blue-500/20 flex items-center gap-2"
                    >
                       <Wand2 size={12} /> {aiProcessing ? 'Generating...' : 'Regenerate Watermark ID'}
                    </button>
                </div>

                {/* Lovense / Toys */}
                <div className="bg-pink-500/5 p-4 rounded-lg border border-pink-500/30">
                    <h4 className="text-pink-400 font-bold mb-3 flex items-center gap-2"><Zap size={18}/> Interactive Toys</h4>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm">
                            <div className="text-white font-bold">Lovense Integration</div>
                            <div className="text-xs text-gray-500">Allow fans to vibrate your toys with tokens</div>
                        </div>
                        <button 
                           onClick={() => setToyConnected(!toyConnected)}
                           className={`px-4 py-2 rounded text-xs font-bold transition-colors ${toyConnected ? 'bg-green-600 text-white' : 'bg-white/10 text-white'}`}
                        >
                           {toyConnected ? 'CONNECTED' : 'CONNECT TOY'}
                        </button>
                    </div>
                    {toyConnected && (
                       <div className="text-xs text-gray-400 flex items-center gap-2 bg-black/40 p-2 rounded">
                          <Wifi size={12} className="text-green-500" /> Lush 3 connected via Bluetooth
                       </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'CAMPAIGNS' && (
           <div className="flex flex-col md:flex-row gap-8">
              {/* New Campaign */}
              <div className="w-full md:w-1/3 bg-black/40 p-6 rounded-xl border border-white/5">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Mail size={16}/> New Mass Message</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs text-gray-400 uppercase font-bold">Message Text</label>
                         <textarea 
                            className="w-full bg-black border border-white/10 rounded p-2 text-white h-32" 
                            placeholder="Hey subs! Unlock this exclusive video..."
                            value={newCampaignText}
                            onChange={e => setNewCampaignText(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="text-xs text-gray-400 uppercase font-bold">Unlock Price</label>
                         <input 
                            type="number" 
                            className="w-full bg-black border border-white/10 rounded p-2 text-white" 
                            value={newCampaignPrice}
                            onChange={e => setNewCampaignPrice(Number(e.target.value))}
                         />
                     </div>
                     <button onClick={handleSendCampaign} className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-2 rounded shadow-lg">
                        Send to All Subscribers
                     </button>
                 </div>
              </div>

              {/* History */}
              <div className="flex-1">
                 <h3 className="text-white font-bold mb-4">Campaign History</h3>
                 <div className="space-y-3">
                    {campaigns.map(camp => (
                       <div key={camp.id} className="bg-dungeon-900 border border-white/10 rounded-lg p-4">
                           <div className="flex justify-between items-start mb-2">
                              <div className="text-white font-bold truncate max-w-xs">"{camp.text}"</div>
                              <div className="text-green-500 font-bold text-sm">+{camp.revenue} T</div>
                           </div>
                           <div className="flex justify-between text-xs text-gray-400">
                              <span>Sent to: {camp.sentTo}</span>
                              <span>Price: {camp.unlockPrice}</span>
                              <span>Open Rate: {camp.openRate}%</span>
                           </div>
                       </div>
                    ))}
                    {campaigns.length === 0 && <p className="text-gray-500">No campaigns sent yet.</p>}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'GAMES' && (
           <div className="space-y-8">
               <div className="flex flex-col md:flex-row gap-8">
                   {/* Create Game */}
                   <div className="w-full md:w-1/3 bg-black/40 p-6 rounded-xl border border-white/5">
                       <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Plus size={16}/> Add New Game</h3>
                       <div className="space-y-4">
                           <div>
                               <label className="text-xs text-gray-400 uppercase font-bold">Game Type</label>
                               <div className="flex gap-2 mt-1">
                                   <button onClick={() => setNewGameType('WHEEL')} className={`flex-1 py-2 rounded border ${newGameType === 'WHEEL' ? 'bg-dungeon-accent border-dungeon-accent text-white' : 'border-white/10 text-gray-400'}`}>Wheel</button>
                                   <button onClick={() => setNewGameType('DICE')} className={`flex-1 py-2 rounded border ${newGameType === 'DICE' ? 'bg-dungeon-accent border-dungeon-accent text-white' : 'border-white/10 text-gray-400'}`}>Dice</button>
                               </div>
                           </div>
                           <div>
                               <label className="text-xs text-gray-400 uppercase font-bold">Title</label>
                               <input type="text" className="w-full bg-black border border-white/10 rounded p-2 text-white" value={newGameTitle} onChange={e => setNewGameTitle(e.target.value)} placeholder="e.g. Wheel of Kink" />
                           </div>
                           <div>
                               <label className="text-xs text-gray-400 uppercase font-bold">Price (Tokens)</label>
                               <input type="number" className="w-full bg-black border border-white/10 rounded p-2 text-white" value={newGamePrice} onChange={e => setNewGamePrice(Number(e.target.value))} />
                           </div>
                           <button onClick={handleAddGame} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded">Create Game</button>
                       </div>
                   </div>

                   {/* Existing Games */}
                   <div className="flex-1 grid gap-4">
                       {games.map(game => (
                           <div key={game.id} className="bg-dungeon-900 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                               <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white/5">
                                       {game.type === 'WHEEL' ? <Zap className="text-yellow-500" /> : <Dice5 className="text-blue-500" />}
                                   </div>
                                   <div>
                                       <h4 className="text-white font-bold">{game.title}</h4>
                                       <div className="text-xs text-gray-400">{game.type} • {game.price} Tokens</div>
                                   </div>
                               </div>
                               <button className="text-gray-500 hover:text-white"><Share2 size={16} /></button>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
        )}

        {activeTab === 'CONTENT' && (
          <div className="space-y-6">
             {/* Album Management */}
             <div className="flex items-center gap-4 mb-4">
                 <h3 className="text-white font-bold text-lg">Your Albums</h3>
                 <button onClick={() => {
                     const title = prompt("Album Title:");
                     if(title) setAlbums([...albums, {id: `a-${Date.now()}`, title, count: 0}]);
                 }} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded flex items-center gap-1">
                     <Plus size={12} /> New Album
                 </button>
             </div>
             
             <div className="flex gap-4 overflow-x-auto pb-2">
                 {albums.map(album => (
                     <div key={album.id} className="min-w-[150px] bg-black/40 border border-white/10 p-3 rounded-lg cursor-pointer hover:border-dungeon-accent">
                         <FolderOpen className="text-dungeon-accent w-8 h-8 mb-2" />
                         <div className="text-white font-bold text-sm truncate">{album.title}</div>
                         <div className="text-xs text-gray-500">{album.count} items</div>
                     </div>
                 ))}
             </div>

             <hr className="border-white/5 my-6" />

             {/* Upload Area */}
             <div className={`border-2 border-dashed rounded-xl p-8 transition-colors bg-black/20 relative ${scanResult?.safe === false ? 'border-red-500 bg-red-900/10' : 'border-white/10 hover:border-dungeon-accent/30'}`}>
               
               {scanningContent && (
                   <div className="absolute inset-0 bg-black/80 backdrop-blur z-10 flex flex-col items-center justify-center">
                       <LoaderIcon className="w-10 h-10 text-dungeon-accent animate-spin mb-4" />
                       <h3 className="text-white font-bold">Scanning Content</h3>
                       <p className="text-xs text-gray-400">Checking for Deepfakes & Unauthorized AI...</p>
                   </div>
               )}

               <div className="flex flex-col md:flex-row gap-8">
                   <div className="flex-1 text-center border-r border-white/10 pr-8">
                       <Upload className={`w-12 h-12 mx-auto mb-3 ${scanResult?.safe === false ? 'text-red-500' : 'text-gray-500'}`} />
                       <h3 className="text-lg font-bold text-white">Upload Media</h3>
                       
                       <div className="flex gap-3 justify-center mt-4">
                           <label className="bg-white/10 px-4 py-2 rounded text-sm hover:bg-white/20 cursor-pointer">
                              Select File
                              <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*"/>
                           </label>
                       </div>
                       
                       {selectedFile && (
                           <div className="mt-4 text-xs font-bold text-gray-300">
                               {selectedFile.name}
                               {scanResult && scanResult.safe && <span className="text-green-500 ml-2">✓ Verified Safe</span>}
                           </div>
                       )}

                       {scanResult && !scanResult.safe && (
                           <div className="mt-4 bg-red-500/10 border border-red-500 p-3 rounded text-left">
                               <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-1">
                                   <ShieldAlert size={14}/> SECURITY VIOLATION
                               </div>
                               <p className="text-xs text-red-300">{scanResult.reason}</p>
                               <p className="text-[10px] text-red-400 mt-2">Upload blocked. Admin notified.</p>
                           </div>
                       )}
                   </div>
                   
                   <div className="flex-1 space-y-4">
                       <h4 className="text-white font-bold text-sm uppercase">Details</h4>
                       <textarea 
                         className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white focus:border-dungeon-accent focus:outline-none"
                         rows={2}
                         placeholder="Description..."
                         value={uploadDesc}
                         onChange={(e) => setUploadDesc(e.target.value)}
                       />
                       
                       <select 
                          className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white"
                          value={selectedAlbum}
                          onChange={(e) => setSelectedAlbum(e.target.value)}
                       >
                           <option value="">No Album (Uncategorized)</option>
                           {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                       </select>
                       
                       <div className="flex items-center gap-2">
                           <button 
                             onClick={handleGenerateTags}
                             disabled={aiProcessing}
                             className="text-xs bg-dungeon-accent/20 text-dungeon-accent border border-dungeon-accent/50 px-3 py-1.5 rounded hover:bg-dungeon-accent/30 flex items-center gap-2"
                           >
                             <Wand2 size={12} /> {aiProcessing ? 'Analyzing...' : 'Auto-Tags'}
                           </button>
                           {aiWatermark && (
                               <div className="text-xs text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                   <Fingerprint size={12}/> AI Watermark Applied
                               </div>
                           )}
                       </div>
                       
                       <button 
                          disabled={!selectedFile || (scanResult?.safe === false)}
                          className="w-full bg-white text-black font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           Publish Content
                       </button>
                   </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {showSaveRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dungeon-900 border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Stream Recording Ended</h3>
                <p className="text-gray-400 text-sm mb-6">Duration: {formatTime(recordingTime)}</p>
                <div className="space-y-3">
                    <button onClick={handleSaveRecording} className="w-full bg-dungeon-accent text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Save size={16} /> Save to Content</button>
                    <button onClick={handleDeleteRecording} className="w-full border border-red-900/50 text-red-500 font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Trash2 size={16} /> Delete</button>
                </div>
            </div>
        </div>
      )}

      {selectedOrder && (
         <OrderModal 
            existingOrder={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateOrderStatus}
            isModelView={true}
         />
      )}
    </div>
  );
};

export default ModelDashboard;
