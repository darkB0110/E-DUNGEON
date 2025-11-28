
import React, { useEffect, useState, useRef } from 'react';
import { Performer, User, MerchItem, Game, PerformerStatus, ToyControl, BattleState } from '../types';
import ChatBox from '../components/ChatBox';
import GameOverlay from '../components/GameOverlay';
import Watermark from '../components/Watermark';
import BattleOverlay from '../components/BattleOverlay';
import { safetyService } from '../services/safetyService';
import { backend } from '../services/backend';
import { X, Heart, Share2, Gift, UserPlus, Check, Star, ShoppingBag, Lock, Video, Volume2, VolumeX, LogOut, Users, Skull, Zap, Radio, Target, Gamepad2, Mic, MicOff, ArrowLeft, Eye, Activity, Wifi, Crown, ShieldAlert, StopCircle, Sword, Glasses } from 'lucide-react';

interface RoomProps {
  performer: Performer;
  currentUser: User | null;
  onExit: () => void;
  onSubscribe: (performerId: string) => void;
  onTip: (amount: number) => void;
  onOpenWallet: () => void;
  onToggleFavorite: (performerId: string) => void;
  onRate: (performerId: string, rating: number) => void;
  onEnterPrivate: (performer: Performer) => void;
  onDeductTokens: (amount: number) => boolean; 
  isPrivateMode?: boolean;
}

interface Participant {
  id: string;
  name: string;
  isVip: boolean;
  isSpy?: boolean;
}

const Room: React.FC<RoomProps> = ({ 
  performer, 
  currentUser, 
  onExit, 
  onSubscribe, 
  onTip, 
  onOpenWallet,
  onToggleFavorite,
  onRate,
  onEnterPrivate,
  onDeductTokens,
  isPrivateMode = false
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes free
  const [activeTab, setActiveTab] = useState<'CHAT' | 'SHOP' | 'GUESTS' | 'TOY' | 'GAMES' | 'LEADERBOARD'>('CHAT');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [micMuted, setMicMuted] = useState(false); 
  const [privateRoomTime, setPrivateRoomTime] = useState(0);
  const [spyTime, setSpyTime] = useState(0);
  const [roomNotification, setRoomNotification] = useState<string | null>(null);
  
  // Audio Visualization State
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Spy State
  const [isSpying, setIsSpying] = useState(false);

  // VR State
  const [isVRMode, setIsVRMode] = useState(false);

  // Game State
  const [activeGame, setActiveGame] = useState<{ game: Game, result: number } | null>(null);

  // Battle State (Local Simulation based on Performer trigger)
  // In a real app, this would come from `performer.battle` prop via websocket
  const [battleState, setBattleState] = useState<BattleState | undefined>(performer.battle);

  // Toy State
  const [toyVibrating, setToyVibrating] = useState(false);
  const [toyIntensity, setToyIntensity] = useState(0);
  const toyTimeoutRef = useRef<any>(null);

  // Safety State
  const [securityAlert, setSecurityAlert] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([
      { id: 'p1', name: 'DarkKnight99', isVip: true },
      { id: 'p2', name: 'SlaveToRhythm', isVip: false },
  ]);

  const isAdmin = currentUser?.role === 'ADMIN';

  const isSubscribed = currentUser?.subscriptions.includes(performer.id);
  // Admin Bypass: Unlock everything
  const isUnlocked = isAdmin || currentUser?.unlockedStreams.includes(performer.id) || isSubscribed || isPrivateMode || isSpying;
  const showLockOverlay = !isAdmin && timeLeft <= 0 && !isUnlocked && !isPrivateMode && !isSpying;
  const isSquadMode = !!performer.squadPartner && !isPrivateMode && !isSpying;
  
  // Detect if the room is truly private and we are outside looking in
  const isRoomStatusPrivate = performer.status === PerformerStatus.PRIVATE;
  // Admin Bypass: Can see private rooms without overlay
  const showPrivateOverlay = !isAdmin && isRoomStatusPrivate && !isPrivateMode && !isSpying;

  // Determine if the current user is the model broadcasting
  const isBroadcaster = currentUser?.id === performer.id || currentUser?.role === 'MODEL';

  // --- BATTLE SIMULATION ---
  // If the model triggers a battle from dashboard, we simulate the opponent logic here for the prototype
  useEffect(() => {
     // Check if we should start a mock battle
     // In this prototype, we'll auto-start one if the performer object has battleActive set in DB (mocked here by local state for demo)
     if (!battleState && Math.random() > 0.9 && !isPrivateMode) {
         // Randomly start a battle for demo purposes if not active
         setBattleState({
             isActive: true,
             opponentName: 'Lady Raven',
             opponentAvatar: 'https://picsum.photos/seed/raven/100',
             myScore: 0,
             opponentScore: 0,
             timeLeft: 300
         });
     }
  }, []);

  useEffect(() => {
      if (battleState && battleState.isActive) {
          const interval = setInterval(() => {
              setBattleState(prev => {
                  if (!prev || prev.timeLeft <= 0) return prev;
                  // Simulate opponent getting points
                  const opponentGain = Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0;
                  return {
                      ...prev,
                      timeLeft: prev.timeLeft - 1,
                      opponentScore: prev.opponentScore + opponentGain
                  };
              });
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [battleState]);

  // --- REAL MICROPHONE VISUALIZATION ---
  useEffect(() => {
    if (isBroadcaster && !micMuted) {
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          
          source.connect(analyser);
          analyser.fftSize = 32;
          
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          sourceRef.current = source;
          
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            setAudioLevel(average); // 0 to 255
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          };
          
          updateAudioLevel();
        } catch (err) {
          console.error("Mic Access Denied or Error", err);
        }
      };
      
      initAudio();
    } else {
      // Stop visualization if muted or not broadcaster
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setAudioLevel(0);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isBroadcaster, micMuted]);


  // --- SECURITY: DEEPFAKE SCANNING ---
  useEffect(() => {
    // Only run this check if the user is the broadcaster sending the stream
    // In a real WebRTC setup, this would tap into the canvas/stream
    if (!isBroadcaster || performer.status !== PerformerStatus.LIVE) return;

    const scanInterval = setInterval(async () => {
        const result = await safetyService.scanStreamFrame(performer.id);
        
        if (!result.safe) {
            // DEEPFAKE DETECTED
            setSecurityAlert(true);
            
            // Log violation
            backend.admin.logViolation({
              id: `v-live-${Date.now()}`,
              performerId: performer.id,
              performerName: performer.name,
              type: 'DEEPFAKE',
              severity: 'HIGH',
              timestamp: Date.now(),
              details: `Live stream terminated. ${result.reason}`,
              resolved: false
            });

            // Terminate Stream (Simulated)
            alert(`CRITICAL SECURITY ALERT: ${result.reason}\n\nYour stream has been terminated to protect the platform. Admin has been notified.`);
            onExit();
        }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(scanInterval);
  }, [isBroadcaster, performer.status, performer.id, onExit]);


  // Add current user to list as spy if applicable
  useEffect(() => {
    // ADMIN INVISIBILITY: Do not add to list
    if (isAdmin) return;

    if (currentUser && isSpying) {
        setParticipants(prev => {
            if (prev.find(p => p.id === currentUser.id)) return prev;
            return [...prev, { id: currentUser.id, name: currentUser.username, isVip: false, isSpy: true }];
        });
    } else if (currentUser && !isSpying) {
        setParticipants(prev => prev.filter(p => p.id !== currentUser.id));
    }
  }, [isSpying, currentUser, isAdmin]);

  // Simulate spies joining if current user is the model (Visual feedback for Broadcaster)
  useEffect(() => {
    if (isBroadcaster && isPrivateMode) {
        // Simulate a fan entering spy mode after 5 seconds
        const timeout = setTimeout(() => {
            setParticipants(prev => {
                if(prev.find(p => p.name === 'SilentWatcher')) return prev;
                return [...prev, { id: 'spy-bot', name: 'SilentWatcher', isVip: false, isSpy: true }];
            });
            setRoomNotification("SilentWatcher is peeking (Spy Mode)");
            setTimeout(() => setRoomNotification(null), 4000);
        }, 5000);
        return () => clearTimeout(timeout);
    }
  }, [isBroadcaster, isPrivateMode]);

  useEffect(() => {
    if (isAdmin || isPrivateMode || isUnlocked || showPrivateOverlay) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPrivateMode, isUnlocked, showPrivateOverlay, isAdmin]);

  // Billing for Private Mode (Full)
  // Logic: First minute charged upfront in handlePrivateRequest. This interval starts after mount.
  useEffect(() => {
    if (isAdmin || !isPrivateMode) return; // Admin pays nothing
    const billingInterval = setInterval(() => {
        const success = onDeductTokens(performer.privateRoomPrice);
        if (!success) {
            alert("Insufficient tokens. Closing session.");
            onExit();
        } else {
            setPrivateRoomTime(t => t + 1);
            setRoomNotification(`-${performer.privateRoomPrice} Tokens (Minute ${privateRoomTime + 2})`);
            setTimeout(() => setRoomNotification(null), 3000);
        }
    }, 60000); 
    return () => clearInterval(billingInterval);
  }, [isPrivateMode, performer.privateRoomPrice, onDeductTokens, onExit, isAdmin, privateRoomTime]);

  // Billing for Spy Mode (Reduced)
  useEffect(() => {
    if (isAdmin || !isSpying) return; // Admin pays nothing
    
    // Timer to deduct tokens every minute (starting 60s after entry)
    const billingInterval = setInterval(() => {
        const success = onDeductTokens(performer.spyPrice);
        if (!success) {
            alert("Insufficient tokens for Spy Mode. Closing view.");
            setIsSpying(false);
            setSpyTime(0);
        } else {
             setSpyTime(prev => prev + 1);
             setRoomNotification(`Spy Mode: -${performer.spyPrice} Tokens (Minute ${spyTime + 2})`);
             setTimeout(() => setRoomNotification(null), 3000);
        }
    }, 60000); 

    return () => clearInterval(billingInterval);
  }, [isSpying, performer.spyPrice, onDeductTokens, isAdmin, spyTime]);

  const handleUnlock = () => {
    if (isAdmin) { alert("Admin Bypass"); return; }
    if (!currentUser) return alert("Please login");
    
    // Determine Price (Normal or Squad)
    const price = isSquadMode ? (performer.squadUnlockPrice || performer.unlockPrice * 1.5) : performer.unlockPrice;

    if (currentUser.tokens >= price) {
      if(onDeductTokens(price)) alert("Stream Unlocked!");
    } else {
      onOpenWallet();
    }
  };

  const handlePrivateRequest = () => {
      if (isAdmin) { onEnterPrivate(performer); return; }
      if (!currentUser) return alert("Login required");
      if (performer.nftRequired) return alert(`Access Denied. Need ${performer.nftRequired} NFT.`);
      
      const cost = performer.privateRoomPrice;

      if (currentUser.tokens < cost) {
          if (confirm(`Insufficient tokens. This private room costs ${cost} Tokens/min. Go to wallet?`)) {
              onOpenWallet();
          }
          return;
      }

      // Explicit confirmation for payment
      if (confirm(`Join Private Live Room?\n\nPrice: ${cost} Tokens/min\n\nThe first minute will be charged immediately.`)) {
          // Deduct the first minute upfront
          const success = onDeductTokens(cost);
          if (success) {
              setRoomNotification(`Joined Private Room. -${cost} Tokens`);
              setPrivateRoomTime(0);
              onEnterPrivate(performer);
          } else {
              onOpenWallet();
          }
      }
  };

  const handleSpy = () => {
      if (isAdmin) { setIsSpying(true); return; }
      if (!currentUser) return alert("Login required");
      
      // Initial deduction logic for Spy Mode
      if (currentUser.tokens >= performer.spyPrice) {
          if (confirm(`Start Spying?\n\nPrice: ${performer.spyPrice} Tokens/min (charged now).`)) {
            if (onDeductTokens(performer.spyPrice)) {
                setIsSpying(true);
                setSpyTime(0);
                setRoomNotification(`Spy Mode Activated. -${performer.spyPrice} tokens.`);
                setTimeout(() => setRoomNotification(null), 3000);
            } else {
                onOpenWallet();
            }
          }
      } else {
          onOpenWallet();
      }
  };

  const handleStopSpying = () => {
      setIsSpying(false);
      setSpyTime(0);
  };

  const handlePlayGame = (game: Game) => {
      if (!isAdmin && !currentUser) return onOpenWallet();
      if (onDeductTokens(game.price)) {
          let result = 0;
          if (game.type === 'WHEEL' && game.options) {
              result = Math.floor(Math.random() * game.options.length);
          } else {
              result = Math.floor(Math.random() * 20) + 1;
          }

          setActiveGame({ game, result });
          if(!isAdmin) onTip(game.price);
          
          const gameName = game.type === 'WHEEL' ? 'spun the wheel' : 'rolled the dice';
          const userName = isAdmin ? 'The Master' : currentUser?.username;
          setRoomNotification(`${userName} ${gameName}!`);
          setTimeout(() => setRoomNotification(null), 3000);
      } else {
          onOpenWallet();
      }
  };

  const handleActivateToy = (control: ToyControl) => {
     if (!isAdmin && !currentUser) return onOpenWallet();
     if (onDeductTokens(control.price)) {
         if(!isAdmin) onTip(control.price);
         setRoomNotification(`${isAdmin ? 'Admin' : currentUser?.username} activated ${control.label}!`);
         
         // Visual Feedback
         if (toyTimeoutRef.current) clearTimeout(toyTimeoutRef.current);
         setToyVibrating(true);
         setToyIntensity(control.intensity);
         
         toyTimeoutRef.current = setTimeout(() => {
             setToyVibrating(false);
             setToyIntensity(0);
             setRoomNotification(null);
         }, control.duration * 1000);

     } else {
         onOpenWallet();
     }
  };

  const handleMenuTip = (amount: number, label: string) => {
      if (onDeductTokens(amount)) {
          onTip(amount);
          
          // Update Battle Score if Active
          if (battleState && battleState.isActive) {
              setBattleState(prev => prev ? ({ ...prev, myScore: prev.myScore + amount }) : undefined);
          }

          setRoomNotification(`${currentUser?.username} tipped ${amount} for ${label}`);
          setTimeout(() => setRoomNotification(null), 3000);
      } else {
          onOpenWallet();
      }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine current unlock price for display
  const displayUnlockPrice = isSquadMode ? (performer.squadUnlockPrice || performer.unlockPrice * 1.5) : performer.unlockPrice;

  // VR Mode Renderer Helper
  const renderVRVideo = () => (
      <div className="flex w-full h-full">
          {/* Left Eye */}
          <div className="w-1/2 h-full border-r-2 border-black relative overflow-hidden">
               <img src={performer.thumbnail} className={`w-full h-full object-cover ${isSpying ? 'brightness-75' : ''}`} />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl drop-shadow-lg">
                   LEFT EYE
               </div>
          </div>
          {/* Right Eye */}
          <div className="w-1/2 h-full relative overflow-hidden">
               <img src={performer.thumbnail} className={`w-full h-full object-cover ${isSpying ? 'brightness-75' : ''}`} />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl drop-shadow-lg">
                   RIGHT EYE
               </div>
          </div>
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
              <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-bold animate-pulse">
                  VR MODE ACTIVE - INSERT PHONE INTO HEADSET
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row">
      {/* Back Button (Realistic) */}
      <div className="absolute top-4 left-4 z-50">
        <button 
            onClick={onExit}
            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full border border-white/10 transition-colors group"
        >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold hidden md:inline">Back</span>
        </button>
      </div>
      
      {isAdmin && (
          <div className="absolute top-4 left-24 z-50 bg-green-500 text-black px-4 py-2 rounded-full font-mono text-xs font-bold animate-pulse">
              GHOST MODE ACTIVE
          </div>
      )}

      {/* Left: Video Player */}
      <div className="flex-1 relative bg-zinc-900 flex flex-col">
        <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-black ${isSquadMode ? 'grid grid-cols-2 gap-0.5' : ''}`}>
           
           {isVRMode ? (
               renderVRVideo()
           ) : (
             <>
               {/* Game Overlay */}
                {activeGame && (
                    <GameOverlay 
                        game={activeGame.game} 
                        resultIndex={activeGame.result}
                        diceValue={activeGame.result}
                        onComplete={() => setActiveGame(null)} 
                    />
                )}

                {/* PK Battle Overlay */}
                {battleState && <BattleOverlay battle={battleState} />}
                
                {/* AI Watermark */}
                <Watermark 
                    text={performer.watermarkText || `DGN-${performer.name.toUpperCase().replace(/\s/g,'')}-ID`}
                    visible={performer.watermarkEnabled || false}
                />

                {showPrivateOverlay ? (
                    // PRIVATE ROOM OVERLAY (For external viewers)
                    <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4">
                        <Lock className="w-16 h-16 text-amber-500 mb-4 animate-pulse" />
                        <h2 className="text-3xl font-bold text-white mb-2">Private Session in Progress</h2>
                        <p className="text-gray-400 mb-8 text-center max-w-md">This model is currently in a 1-on-1 private show. You can join the queue or peek inside.</p>
                        
                        <div className="flex flex-col gap-4 w-full max-w-sm">
                            <button 
                                onClick={handleSpy}
                                className="bg-dungeon-900 hover:bg-dungeon-800 border border-white/20 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Eye className="text-gray-400 group-hover:text-white" />
                                    <div className="text-left">
                                        <div className="text-sm group-hover:text-dungeon-accent">Spy Mode</div>
                                        <div className="text-[10px] text-gray-500">Peek without interaction</div>
                                    </div>
                                </div>
                                <div className="text-yellow-500 font-mono">{performer.spyPrice} T/min</div>
                            </button>

                            <button 
                                onClick={handlePrivateRequest}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between group transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                            >
                                <div className="flex items-center gap-3">
                                    <Video className="text-white" />
                                    <div className="text-left">
                                        <div className="text-sm">Join Private</div>
                                        <div className="text-[10px] text-white/70">Full audio/video/chat</div>
                                    </div>
                                </div>
                                <div className="text-white font-mono">{performer.privateRoomPrice} T/min</div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Main View */}
                        <div className={`relative w-full h-full group/video ${toyVibrating ? 'animate-[pulse_0.2s_ease-in-out_infinite]' : ''}`}>
                            <img 
                                src={performer.thumbnail} 
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${showLockOverlay ? 'blur-xl opacity-30' : 'opacity-100'} ${toyVibrating ? 'scale-[1.02]' : 'scale-100'} ${isSpying ? 'brightness-75 grayscale-[20%]' : ''}`} 
                                alt="bg"
                            />
                            
                            {/* Private Mode Banner (Overlay on top of video, not replacing it) */}
                            {isPrivateMode && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-50">
                                    <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-dungeon-glow/20">
                                        <h2 className="text-2xl font-display font-bold text-white/50 mb-1">PRIVATE SESSION</h2>
                                        <p className="text-dungeon-glow/80 font-mono animate-pulse uppercase tracking-widest text-xs">Encrypted • 1-on-1</p>
                                    </div>
                                </div>
                            )}

                            {/* Live Indicator */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end">
                                {isSpying && (
                                    <div className="bg-blue-600/90 px-3 py-1.5 rounded text-xs font-bold text-white flex items-center gap-2 shadow-lg animate-pulse border border-white/20">
                                        <Eye size={14} /> SPYING MODE ({formatTime(spyTime * 60)})
                                    </div>
                                )}
                                {isPrivateMode ? (
                                    <div className="bg-amber-500 px-2 py-1 rounded text-xs font-bold text-black animate-pulse w-fit flex items-center gap-1">
                                        <Lock size={10} /> PRIVATE
                                    </div>
                                ) : (
                                    <div className="bg-dungeon-accent px-2 py-1 rounded text-xs font-bold text-white animate-pulse w-fit">LIVE</div>
                                )}
                                
                                {toyVibrating && (
                                    <div className="bg-pink-500/90 px-3 py-1.5 rounded text-xs font-bold text-white animate-bounce flex items-center gap-2 w-fit shadow-[0_0_15px_rgba(236,72,153,0.6)] border border-pink-400/50">
                                        <Zap size={14} className="fill-current text-yellow-300" /> 
                                        <span className="tracking-widest">VIBRATING: {toyIntensity * 5}%</span>
                                    </div>
                                )}
                                {/* Broadcaster Mic Status */}
                                {isBroadcaster && (
                                    <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-2 ${micMuted ? 'bg-red-500 text-white' : 'bg-green-500/80 text-white'}`}>
                                        {micMuted ? <MicOff size={12}/> : <Mic size={12}/>}
                                        {micMuted ? 'MIC OFF' : (
                                            <div className="flex items-end gap-0.5 h-3">
                                                <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.min(100, Math.max(20, audioLevel))}%` }}></div>
                                                <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.min(100, Math.max(30, audioLevel * 0.8))}%` }}></div>
                                                <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.min(100, Math.max(20, audioLevel * 0.5))}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {isBroadcaster && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded text-[10px] text-blue-300 flex items-center gap-1">
                                    <ShieldAlert size={10} className="animate-pulse" />
                                    AI Safety Monitor Active
                                </div>
                            )}

                            {isSquadMode && (
                                <div className="absolute bottom-20 left-4 bg-purple-600/80 px-2 py-1 rounded text-[10px] font-bold text-white">
                                MAIN CAM
                                </div>
                            )}
                        </div>

                        {/* Squad View (Partner) */}
                        {isSquadMode && performer.squadPartner && (
                            <div className="relative w-full h-full border-l border-white/10 group/video2">
                                <img 
                                    src={performer.squadPartner.thumbnail} 
                                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${showLockOverlay ? 'blur-xl opacity-30' : 'opacity-100'}`}
                                    alt="partner"
                                />
                                <div className="absolute top-4 right-4 bg-purple-600 px-2 py-1 rounded text-xs font-bold text-white animate-pulse w-fit shadow-lg flex items-center gap-1">
                                    <Users size={12}/> SQUAD PARTNER
                                </div>
                                <div className="absolute bottom-20 left-4 text-white font-bold drop-shadow-md text-sm">
                                    {performer.squadPartner.name}
                                </div>
                            </div>
                        )}

                        {!isUnlocked && !showLockOverlay && (
                            <div className="absolute top-16 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs font-bold text-white z-20">
                                FREE: <span className="text-dungeon-accent">{formatTime(timeLeft)}</span>
                            </div>
                        )}

                        {showLockOverlay && (
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="text-center p-8 bg-black/80 backdrop-blur-md rounded-2xl border border-dungeon-accent/30 max-w-md mx-4 shadow-[0_0_50px_rgba(225,29,72,0.3)]">
                                    {isSquadMode ? (
                                        <>
                                        <div className="flex justify-center -space-x-4 mb-4">
                                            <img src={performer.thumbnail} className="w-16 h-16 rounded-full border-4 border-black"/>
                                            <img src={performer.squadPartner?.thumbnail} className="w-16 h-16 rounded-full border-4 border-black"/>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Squad Stream Preview Ended</h2>
                                        <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">Dual Cam Experience</p>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-12 h-12 text-dungeon-accent mx-auto mb-4" />
                                            <h2 className="text-2xl font-bold text-white mb-2">Preview Ended</h2>
                                        </>
                                    )}
                                    
                                    <button onClick={handleUnlock} className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-lg mt-4 transition-all transform hover:scale-105">
                                        UNLOCK ({displayUnlockPrice} TOKENS)
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
             </>
           )}
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-40">
           <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
              <div className="text-white font-bold text-lg flex items-center gap-2">
                 {performer.name}
                 {isSquadMode && performer.squadPartner && (
                     <span className="text-sm font-normal text-purple-400"> + {performer.squadPartner.name}</span>
                 )}
              </div>
              
              <div className="flex items-center gap-4">
                 
                 {/* VR Toggle */}
                 <button 
                    onClick={() => setIsVRMode(!isVRMode)}
                    className={`bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors ${isVRMode ? 'bg-dungeon-accent' : ''}`}
                    title="Toggle VR / Cardboard Mode"
                 >
                     <Glasses size={20} />
                 </button>

                 {/* Audio Controls */}
                 {isBroadcaster ? (
                    // Model Controls
                    <button 
                        onClick={() => setMicMuted(!micMuted)} 
                        className={`p-2 rounded-full transition-colors ${micMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        title="Toggle Microphone"
                    >
                        {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                 ) : (
                    // Fan Controls
                    <div className="flex items-center gap-2 group/volume bg-black/40 p-2 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                        <button 
                            onClick={() => setIsMuted(!isMuted)} 
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            {isMuted || volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                        </button>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={isMuted ? 0 : volume}
                            onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                            className="w-0 group-hover/volume:w-24 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-dungeon-accent"
                        />
                    </div>
                 )}

                 {/* Stop Spying Button */}
                 {isSpying && (
                     <button onClick={handleStopSpying} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg">
                        <StopCircle size={14} /> STOP SPYING
                     </button>
                 )}

                 {/* Private Button */}
                 {!isPrivateMode && !isBroadcaster && !showPrivateOverlay && !isSquadMode && (
                     <button onClick={handlePrivateRequest} className="bg-dungeon-glow hover:bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        <Video size={14} /> PRIVATE
                     </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {!isVRMode && (
        <div className="w-full md:w-80 lg:w-96 flex flex-col h-[40vh] md:h-full bg-dungeon-950 border-l border-white/10 relative z-50">
            <div className="flex border-b border-white/5 bg-dungeon-950 overflow-x-auto">
            <button onClick={() => setActiveTab('CHAT')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold ${activeTab === 'CHAT' ? 'text-white border-b-2 border-dungeon-accent bg-white/5' : 'text-gray-500'}`}>CHAT</button>
            {performer.toyConnected && (
                <button onClick={() => setActiveTab('TOY')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold ${activeTab === 'TOY' ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-500/10' : 'text-gray-500'}`}>TOY</button>
            )}
            <button onClick={() => setActiveTab('GAMES')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold ${activeTab === 'GAMES' ? 'text-white border-b-2 border-dungeon-accent bg-white/5' : 'text-gray-500'}`}>GAMES</button>
            <button onClick={() => setActiveTab('LEADERBOARD')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold ${activeTab === 'LEADERBOARD' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-white/5' : 'text-gray-500'}`}>TOP</button>
            <button onClick={() => setActiveTab('SHOP')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold ${activeTab === 'SHOP' ? 'text-white border-b-2 border-dungeon-accent bg-white/5' : 'text-gray-500'}`}>SHOP</button>
            <button onClick={() => setActiveTab('GUESTS')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold ${activeTab === 'GUESTS' ? 'text-white border-b-2 border-dungeon-accent bg-white/5' : 'text-gray-500'}`}>USERS</button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-dungeon-950">
            {activeTab === 'CHAT' && (
                <ChatBox 
                performer={performer} 
                externalMessage={roomNotification} 
                readOnly={isSpying && !isAdmin} 
                onTip={handleMenuTip}
                />
            )}
            
            {/* LOVENSE / TOY TAB */}
            {activeTab === 'TOY' && (
                <div className="h-full overflow-y-auto p-4 space-y-6">
                    <div className="text-center bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                            <Zap size={32} className="text-pink-500 fill-current" />
                        </div>
                        <h3 className="text-white font-bold text-lg">Teledildonics Active</h3>
                        <p className="text-xs text-pink-400 flex items-center justify-center gap-1 mt-1">
                            <Wifi size={12} /> Lovense Connected
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 uppercase font-bold text-center">Select Vibration Pattern</p>
                        <div className="grid grid-cols-2 gap-3">
                            {performer.toyControls?.map(control => (
                                <button 
                                key={control.id}
                                onClick={() => handleActivateToy(control)}
                                disabled={!isAdmin && (isSpying || toyVibrating)}
                                className={`bg-dungeon-900 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-500/5 transition-all group disabled:opacity-50 ${toyVibrating ? 'cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-pink-500 font-bold group-hover:scale-110 transition-transform">
                                    {control.icon === 'ZAP' && <Zap size={24}/>}
                                    {control.icon === 'WAVE' && <Activity size={24}/>}
                                    {control.icon === 'PULSE' && <Radio size={24}/>}
                                    {control.icon === 'EXPLOSION' && <Target size={24}/>}
                                    </div>
                                    <div className="text-white font-bold text-sm">{control.label}</div>
                                    <div className="text-[10px] text-gray-400">{control.duration}s • Intensity {control.intensity}</div>
                                    <div className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full mt-1">
                                        {isAdmin ? 'FREE' : `${control.price} T`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {toyVibrating && (
                        <div className="text-center text-pink-500 font-bold text-sm animate-bounce">
                        Toy is vibrating! Wait for cooldown...
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'GAMES' && (
                <div className="h-full overflow-y-auto p-4 space-y-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Interactive Games</h3>
                    <p className="text-gray-500 text-xs mb-4">Trigger a game for the whole room to see.</p>
                    
                    {performer.games.map(game => (
                        <div key={game.id} className="bg-gradient-to-br from-dungeon-900 to-black border border-white/10 rounded-xl p-4 relative overflow-hidden group">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-dungeon-accent/20 flex items-center justify-center text-dungeon-accent">
                                        {game.type === 'WHEEL' ? <Zap size={20} /> : <Gamepad2 size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{game.title}</h4>
                                        <p className="text-[10px] text-gray-400">{game.description}</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handlePlayGame(game)}
                                disabled={!isAdmin && isSpying}
                                className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                PLAY ({isAdmin ? 'FREE' : `${game.price} T`})
                            </button>
                        </div>
                    ))}
                    {performer.games.length === 0 && <p className="text-gray-500 text-sm">No games configured.</p>}
                </div>
            )}

            {activeTab === 'LEADERBOARD' && (
                <div className="h-full overflow-y-auto p-4 flex flex-col items-center pt-12">
                    {/* Crown & Avatar */}
                    <div className="relative mb-8">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                                <Crown size={64} className="text-yellow-500 fill-yellow-500/20 animate-bounce drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]" />
                        </div>
                        <div className="w-32 h-32 rounded-full border-4 border-yellow-500 p-1 bg-black shadow-[0_0_50px_rgba(234,179,8,0.3)] relative z-0">
                            <img src="https://picsum.photos/seed/king/200" alt="King" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest border border-white whitespace-nowrap shadow-lg">
                            King of the Room
                        </div>
                    </div>
                    
                    {/* User Info */}
                    <h3 className="text-2xl font-bold text-white mb-1">WhaleKing_99</h3>
                    <div className="text-yellow-500 font-mono text-xl font-bold mb-8 bg-yellow-500/10 px-4 py-1 rounded border border-yellow-500/20">
                        50,000 T
                    </div>
                    
                    {/* CTA */}
                    <div className="w-full bg-white/5 border border-white/5 rounded-xl p-6 text-center">
                        <p className="text-gray-400 text-sm mb-4">
                            Only one can rule the Dungeon. Tip big to claim the throne and demand attention.
                        </p>
                        <button 
                            onClick={() => onTip(1000)}
                            disabled={!isAdmin && isSpying}
                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sword size={18} /> USURP THE THRONE
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'SHOP' && (
                <div className="h-full overflow-y-auto p-4 space-y-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Store</h3>
                    {performer.merch.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/5 rounded-lg p-3 flex gap-3">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">{item.name}</div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-yellow-500 font-bold text-sm">{item.price} T</div>
                                    <button onClick={() => onTip(item.price)} disabled={!isAdmin && isSpying} className="bg-dungeon-accent text-white text-[10px] font-bold px-2 py-1 rounded disabled:opacity-50">BUY</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'GUESTS' && (
                <div className="h-full overflow-y-auto p-4 space-y-2">
                    {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                            {p.isSpy ? <Eye size={14} className="text-blue-400"/> : <div className="w-2 h-2 rounded-full bg-green-500"/>}
                            <span className="text-sm font-bold text-gray-200">{p.name}</span>
                            {p.isSpy && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded uppercase">Spy</span>}
                        </div>
                    </div>
                    ))}
                    {/* Admin can see hidden count maybe? */}
                    {isAdmin && <div className="text-xs text-green-500 mt-2 italic">You are ghost watching. Not visible in list.</div>}
                </div>
            )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Room;
