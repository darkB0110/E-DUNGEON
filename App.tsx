
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Room from './pages/Room';
import Profile from './pages/Profile';
import AuthFan from './pages/AuthFan';
import AuthModel from './pages/AuthModel';
import Login from './pages/Login';
import ModelDashboard from './pages/ModelDashboard';
import FanDashboard from './pages/FanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WalletModal from './components/WalletModal';
import Messages from './pages/Messages';
import MobileNav from './components/MobileNav';
import AgeGate from './components/AgeGate';
import NotificationPanel from './components/NotificationPanel';
import VerificationPending from './components/VerificationPending';
import { Performer, ViewState, User, ContentItem, MerchItem, FeedPost, Order } from './types';
import { MOCK_QUESTS } from './constants';
import { Menu } from 'lucide-react';
import { backend } from './services/backend';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [currentPerformer, setCurrentPerformer] = useState<Performer | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [performers, setPerformers] = useState<Performer[]>([]);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Initialize Backend
  useEffect(() => {
    backend.init();
    const sessionUser = backend.auth.getCurrentUser();
    if (sessionUser) {
        setCurrentUser(sessionUser);
        // Handle pending redirect on load
        if (sessionUser.role === 'MODEL' && !sessionUser.isVerified) {
            setViewState('VERIFICATION_PENDING');
        }
    }

    const loadData = async () => {
       const allPerformers = await backend.performers.getAll();
       setPerformers(allPerformers);
    };
    loadData();
  }, []);

  // Navigation Handlers
  const handlePerformerSelect = (performer: Performer) => {
    if (currentUser?.role !== 'ADMIN' && performer.blockedRegions.includes('North America')) { 
      alert("This content is not available in your region.");
      return;
    }
    setCurrentPerformer(performer);
    setViewState('PROFILE');
  };

  const handleEnterRoom = (performer: Performer) => {
    setCurrentPerformer(performer);
    setViewState('ROOM');
  };

  const handleEnterPrivate = (performer: Performer) => {
    setCurrentPerformer(performer);
    setViewState('PRIVATE_ROOM');
  };

  const handleExitRoom = () => {
    if (currentUser?.role === 'ADMIN') {
        setViewState('ADMIN_DASHBOARD');
    } else if (currentPerformer) {
      setViewState('PROFILE');
    } else {
      setViewState('HOME');
    }
  };

  const handleBackToHome = () => {
    setCurrentPerformer(null);
    setViewState('HOME');
    setIsMobileMenuOpen(false);
  };

  const handleMobileNav = (page: string) => {
    if (page === 'HOME') handleBackToHome();
    if (page === 'SEARCH') setViewState('HOME');
    if (page === 'MESSAGES') {
        if (!currentUser) setViewState('LOGIN');
        else setViewState('MESSAGES');
    }
    if (page === 'PROFILE') {
        if (!currentUser) setViewState('LOGIN');
        else if (currentUser.role === 'MODEL') {
             if (!currentUser.isVerified) setViewState('VERIFICATION_PENDING');
             else setViewState('MODEL_DASHBOARD');
        }
        else if (currentUser.role === 'ADMIN') setViewState('ADMIN_DASHBOARD');
        else setViewState('FAN_DASHBOARD');
    }
    if (page === 'CREATE') {
         if (!currentUser) setViewState('AUTH_MODEL');
         else if (currentUser.role === 'MODEL') {
             if (!currentUser.isVerified) setViewState('VERIFICATION_PENDING');
             else setViewState('MODEL_DASHBOARD');
         }
         else alert("Sign up as a model to create content!");
    }
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
        setViewState('ADMIN_DASHBOARD');
    } else if (user.role === 'MODEL' && !user.isVerified) {
        setViewState('VERIFICATION_PENDING');
    } else {
        setViewState(user.role === 'MODEL' ? 'MODEL_DASHBOARD' : 'HOME');
    }
  };

  const handleLogout = () => {
    backend.auth.logout();
    setCurrentUser(null);
    setViewState('HOME');
  };

  const handleAuthStart = (type: 'FAN' | 'MODEL') => {
    setViewState(type === 'FAN' ? 'AUTH_FAN' : 'AUTH_MODEL');
  };
  
  const handleLoginStart = () => {
      setViewState('LOGIN');
  };

  // User Actions
  const handlePurchaseTokens = async (amount: number) => {
    if (currentUser) {
      const updatedUser = await backend.user.addTokens(currentUser.id, amount);
      setCurrentUser(updatedUser);
      alert(`Successfully added ${amount} tokens to your wallet!`);
    } else {
      alert("Please login to buy tokens.");
      setViewState('LOGIN');
    }
  };

  // Unified Transaction Handler
  const handleDeductTokens = (amount: number): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === 'ADMIN') return true;

      if (!currentPerformer) {
          console.error("No active performer to credit");
          return false;
      }

      // Check balance first (Optimistic UI)
      if (currentUser.tokens >= amount) {
          // Perform Backend Transaction (70/30 Split)
          backend.transactions.process(currentUser.id, currentPerformer.id, amount, 'ROOM_ACTION')
            .then((result) => {
                if(result.success && result.updatedUser) {
                    setCurrentUser(result.updatedUser);
                }
            });

          // Optimistically update local state immediately so UI doesn't lag
          setCurrentUser({ ...currentUser, tokens: currentUser.tokens - amount });
          return true;
      }
      return false;
  };

  const handleSubscribe = async (performerId: string) => {
    if (currentUser) {
      if (currentUser.subscriptions.includes(performerId)) return;
      if (currentUser.role === 'ADMIN') {
         alert("Admin Subscription Activated (Free)");
         return;
      }
      
      const performer = performers.find(p => p.id === performerId);
      const COST = performer?.subscriptionPrice || 50;

      if (currentUser.tokens >= COST) {
         // Process Transaction
         const result = await backend.transactions.process(currentUser.id, performerId, COST, 'SUBSCRIPTION');
         
         if (result.success && result.updatedUser) {
             // Add subscription locally
             const updatedUser = {
                ...result.updatedUser,
                subscriptions: [...result.updatedUser.subscriptions, performerId]
             };
             backend.user.update(updatedUser);
             setCurrentUser(updatedUser);
             alert("Subscribed successfully!");
         } else {
             alert("Transaction failed");
         }
      } else {
        setIsWalletOpen(true);
      }
    } else {
      setViewState('LOGIN');
    }
  };

  const handleUnlockContent = async (content: ContentItem) => {
    if (!currentUser) {
      setViewState('LOGIN');
      return;
    }
    if (currentUser.role === 'ADMIN') {
        alert("Admin Unlock Override");
        return;
    }

    if (!currentPerformer) return;

    if (currentUser.tokens >= content.price) {
      const result = await backend.transactions.process(currentUser.id, currentPerformer.id, content.price, 'CONTENT_UNLOCK');
      
      if (result.success && result.updatedUser) {
        const updatedUser = {
            ...result.updatedUser,
            unlockedContent: [...(result.updatedUser.unlockedContent || []), content.id]
        };
        backend.user.update(updatedUser);
        setCurrentUser(updatedUser);
        alert("Content unlocked!");
      }
    } else {
      setIsWalletOpen(true);
    }
  };

  const handleUnlockPost = async (post: FeedPost) => {
    if (!currentUser) return setViewState('LOGIN');
    if (currentUser.role === 'ADMIN') return;

    const price = post.unlockPrice || 0;
    if (currentUser.tokens >= price) {
        // Must use post.performerId here as it might not be currentPerformer
        const result = await backend.transactions.process(currentUser.id, post.performerId, price, 'POST_UNLOCK');
        
        if (result.success && result.updatedUser) {
            const updatedUser = {
                ...result.updatedUser,
                unlockedPosts: [...(result.updatedUser.unlockedPosts || []), post.id]
            };
            backend.user.update(updatedUser);
            setCurrentUser(updatedUser);
            alert("Post Unlocked!");
        }
    } else {
        setIsWalletOpen(true);
    }
  };

  const handleBuyMerch = async (merch: MerchItem) => {
    if (!currentUser) {
      setViewState('LOGIN');
      return;
    }
    if (currentUser.role === 'ADMIN') {
        alert("Admin Purchase Simulation (No Charge)");
        return;
    }
    if (!currentPerformer) return;

    if (currentUser.tokens >= merch.price) {
      const result = await backend.transactions.process(currentUser.id, currentPerformer.id, merch.price, 'MERCH_BUY');

      if (result.success && result.updatedUser) {
        const updatedUser = {
            ...result.updatedUser,
            purchasedMerch: [...(result.updatedUser.purchasedMerch || []), merch.id]
        };
        backend.user.update(updatedUser);
        setCurrentUser(updatedUser);
        alert(`Purchased ${merch.name}! Check your email for details.`);
      }
    } else {
      setIsWalletOpen(true);
    }
  };

  const handleTip = async (amount: number) => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN') return;
      if (!currentPerformer) return;

      if (currentUser.tokens >= amount) {
        // Process Tip Transaction
        const result = await backend.transactions.process(currentUser.id, currentPerformer.id, amount, 'TIP');
        
        if (result.success && result.updatedUser) {
            const updatedUser = {
                ...result.updatedUser,
                // If tip equals unlock price, auto-unlock the stream logic
                unlockedStreams: (amount === currentPerformer.unlockPrice) 
                  ? [...(result.updatedUser.unlockedStreams || []), currentPerformer.id] 
                  : (result.updatedUser.unlockedStreams || [])
            };
            backend.user.update(updatedUser);
            setCurrentUser(updatedUser);
        }
      } else {
        setIsWalletOpen(true);
      }
    } else {
      setViewState('LOGIN');
    }
  };

  const handleToggleFavorite = (performerId: string) => {
    if (!currentUser) return;
    const isFav = currentUser.favorites?.includes(performerId);
    const updatedUser = {
      ...currentUser,
      favorites: isFav 
        ? currentUser.favorites.filter(id => id !== performerId)
        : [...(currentUser.favorites || []), performerId]
    };
    backend.user.update(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleToggleFollow = (performerId: string) => {
    if (!currentUser) {
       alert("Sign up to follow this model!");
       return;
    }
    const isFollowing = currentUser.following?.includes(performerId);
    const updatedUser = {
      ...currentUser,
      following: isFollowing
        ? currentUser.following.filter(id => id !== performerId)
        : [...(currentUser.following || []), performerId]
    };
    backend.user.update(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleRate = (performerId: string, rating: number) => {
    if (!currentUser) return;
    alert(`Rated ${rating} stars!`);
  };

  const handleClaimReward = (questId: string, reward: number) => {
    if (!currentUser) return;
    const currentQuests = currentUser.quests || [...MOCK_QUESTS];
    const updatedQuests = currentQuests.map(q => 
      q.id === questId ? { ...q, isClaimed: true } : q
    );

    const updatedUser = {
      ...currentUser,
      tokens: currentUser.tokens + reward,
      quests: updatedQuests
    };
    backend.user.update(updatedUser);
    setCurrentUser(updatedUser);
    alert(`Quest Complete! You earned ${reward} tokens.`);
  };

  const handleRequestCustom = (order: Partial<Order>) => {
    if (!currentUser || !currentPerformer) return;
    const newOrder: Order = {
       id: `o-${Date.now()}`,
       fanId: currentUser.id,
       fanName: currentUser.username,
       performerId: currentPerformer.id,
       type: order.type || 'VIDEO',
       description: order.description || '',
       status: 'PENDING',
       createdAt: Date.now()
    };
    backend.orders.create(newOrder);
  };

  const isContentUnlocked = (contentId: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.unlockedContent?.includes(contentId) || false;
  };

  return (
    <div className="min-h-screen bg-dungeon-950 text-gray-200 font-sans selection:bg-dungeon-accent selection:text-white">
      <AgeGate />
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dungeon-950 border-b border-white/5 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <Menu className="w-6 h-6 text-gray-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
           <span className="font-display font-bold text-xl tracking-wider text-white">DUNGEON</span>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && currentUser.role !== 'ADMIN' && (
            <div 
              onClick={() => setIsWalletOpen(true)}
              className="text-xs font-bold text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/10 cursor-pointer"
            >
              {currentUser.tokens} 🪙
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-dungeon-800 border border-white/10 overflow-hidden">
             {currentUser ? (
               <div className="w-full h-full flex items-center justify-center bg-dungeon-accent text-white font-bold text-xs">
                 {currentUser.username[0].toUpperCase()}
               </div>
             ) : (
               <div className="w-full h-full bg-gray-700" onClick={handleLoginStart} />
             )}
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-16 md:pt-0">
        {viewState !== 'ADMIN_DASHBOARD' && viewState !== 'VERIFICATION_PENDING' && (
            <Sidebar 
            onNavigate={handleBackToHome} 
            currentUser={currentUser}
            onAuth={handleAuthStart}
            onLogin={handleLoginStart}
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenDashboard={() => setViewState('MODEL_DASHBOARD')}
            onOpenFanDashboard={() => setViewState('FAN_DASHBOARD')}
            onSelectCategory={(cat) => { setViewState('HOME'); }}
            onMessages={() => setViewState('MESSAGES')}
            />
        )}

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 md:hidden">
             <div className="p-4 flex justify-end">
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">Close</button>
             </div>
             <div className="p-8">
               <Sidebar 
                 onNavigate={() => { handleBackToHome(); setIsMobileMenuOpen(false); }} 
                 currentUser={currentUser}
                 onAuth={(t) => { handleAuthStart(t); setIsMobileMenuOpen(false); }}
                 onLogin={() => { handleLoginStart(); setIsMobileMenuOpen(false); }}
                 onOpenWallet={() => { setIsWalletOpen(true); setIsMobileMenuOpen(false); }}
                 onOpenDashboard={() => { setViewState('MODEL_DASHBOARD'); setIsMobileMenuOpen(false); }}
                 onOpenFanDashboard={() => { setViewState('FAN_DASHBOARD'); setIsMobileMenuOpen(false); }}
                 onMessages={() => { setViewState('MESSAGES'); setIsMobileMenuOpen(false); }}
               />
             </div>
          </div>
        )}

        <main className={`flex-1 transition-all duration-300 ${viewState !== 'ADMIN_DASHBOARD' && viewState !== 'VERIFICATION_PENDING' ? 'md:ml-64' : ''} relative overflow-y-auto bg-dungeon-950`}>
          {viewState === 'HOME' && (
            <Home 
              onPerformerSelect={handlePerformerSelect}
              currentUser={currentUser}
              onUnlockPost={handleUnlockPost}
              performers={performers} 
            />
          )}

          {viewState === 'PROFILE' && currentPerformer && (
             <Profile 
               performer={currentPerformer}
               onEnterRoom={handleEnterRoom}
               onBack={handleBackToHome}
               onUnlockContent={handleUnlockContent}
               onBuyMerch={handleBuyMerch}
               isUnlocked={isContentUnlocked}
               isFavorite={currentUser?.favorites.includes(currentPerformer.id)}
               isFollowing={currentUser?.following.includes(currentPerformer.id)}
               onToggleFavorite={handleToggleFavorite}
               onToggleFollow={handleToggleFollow}
               onRequestCustom={handleRequestCustom}
               onTip={handleTip}
             />
          )}

          {(viewState === 'ROOM' || viewState === 'PRIVATE_ROOM') && currentPerformer && (
            <Room 
              performer={currentPerformer} 
              currentUser={currentUser}
              onExit={handleExitRoom}
              onSubscribe={handleSubscribe}
              onTip={handleTip}
              onOpenWallet={() => setIsWalletOpen(true)}
              onToggleFavorite={handleToggleFavorite}
              onRate={handleRate}
              onEnterPrivate={handleEnterPrivate}
              onDeductTokens={handleDeductTokens}
              isPrivateMode={viewState === 'PRIVATE_ROOM'}
            />
          )}

          {viewState === 'AUTH_FAN' && (
             <AuthFan 
               onLogin={handleLogin} 
               onSwitchToModel={() => setViewState('AUTH_MODEL')}
               onSwitchToLogin={() => setViewState('LOGIN')}
               onBack={handleBackToHome}
             />
          )}

          {viewState === 'AUTH_MODEL' && (
             <AuthModel 
                onLogin={handleLogin}
                onBack={handleBackToHome}
             />
          )}

          {viewState === 'LOGIN' && (
             <Login 
                onLogin={handleLogin} 
                onSignup={() => setViewState('AUTH_FAN')}
                onBack={handleBackToHome}
             />
          )}

          {viewState === 'MODEL_DASHBOARD' && currentUser && (
              <ModelDashboard 
                 user={currentUser}
                 onLogout={handleLogout}
              />
          )}

          {viewState === 'FAN_DASHBOARD' && currentUser && (
              <FanDashboard 
                 user={currentUser}
                 onLogout={handleLogout}
                 onBack={handleBackToHome}
                 onOpenWallet={() => setIsWalletOpen(true)}
                 onClaimQuest={handleClaimReward}
              />
          )}

          {viewState === 'ADMIN_DASHBOARD' && (
              <AdminDashboard 
                 onLogout={handleLogout}
                 onEnterGhostMode={handleEnterRoom}
              />
          )}

          {viewState === 'VERIFICATION_PENDING' && (
              <VerificationPending onLogout={handleLogout} />
          )}

          {viewState === 'MESSAGES' && (
              <Messages 
                 currentUser={currentUser}
                 onBack={handleBackToHome}
              />
          )}
        </main>
      </div>

      {isWalletOpen && (
        <WalletModal 
          onClose={() => setIsWalletOpen(false)} 
          onPurchase={handlePurchaseTokens}
        />
      )}

      {currentUser && currentUser.role !== 'ADMIN' && viewState !== 'ROOM' && viewState !== 'PRIVATE_ROOM' && (
         <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
            <NotificationPanel onClose={() => {}} />
         </div>
      )}

      <MobileNav 
        activePage={viewState}
        onNavigate={handleMobileNav}
      />
    </div>
  );
};

export default App;
