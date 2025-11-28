
import { User, Performer, Order, FeedPost, DirectMessage, Campaign, MessageThread, Violation, Notification, WithdrawalRequest } from '../types';
import { MOCK_PERFORMERS, MOCK_FEED_POSTS, MOCK_ORDERS, MOCK_NOTIFICATIONS, MIN_WITHDRAWAL_TOKENS, TOKEN_PAYOUT_RATE } from '../constants';

const DB_KEY = 'dungeon_db_v1';
const SESSION_KEY = 'dungeon_session_v1';

interface DB {
  users: User[];
  performers: Performer[];
  orders: Order[];
  posts: FeedPost[];
  messages: DirectMessage[];
  campaigns: Campaign[];
  violations: Violation[];
  notifications: Notification[];
  withdrawals: WithdrawalRequest[];
}

const getDB = (): DB => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) return JSON.parse(stored);
  
  // Seed initial data
  const initialDB: DB = {
    users: [],
    performers: MOCK_PERFORMERS,
    orders: MOCK_ORDERS,
    posts: MOCK_FEED_POSTS,
    messages: [],
    campaigns: [],
    violations: [],
    notifications: MOCK_NOTIFICATIONS,
    withdrawals: []
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
  return initialDB;
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const backend = {
  init: () => {
    getDB();
  },

  auth: {
    login: async (email: string, password: string): Promise<User | null> => {
      await new Promise(r => setTimeout(r, 800));

      // MASTER ADMIN CHECK
      if (email === 'admin@dungeon.com' && password === 'masterkey') {
         const adminUser: User = {
             id: 'MASTER-ADMIN',
             username: 'MASTER',
             email: 'admin@dungeon.com',
             role: 'ADMIN',
             tokens: 999999999,
             subscriptions: [],
             favorites: [],
             following: [],
             unlockedStreams: [],
             unlockedContent: [],
             purchasedMerch: []
         };
         localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
         return adminUser;
      }
      
      const db = getDB();
      const user = db.users.find(u => (u.email === email || u.username === email)); 
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    },

    loginWithGoogle: async (role: 'FAN' | 'MODEL' = 'FAN'): Promise<User> => {
       await new Promise(r => setTimeout(r, 1500));
       
       const db = getDB();
       const googleEmail = "google_user@gmail.com";
       
       let user = db.users.find(u => u.email === googleEmail);

       if (!user) {
           user = {
               id: `google-${Date.now()}`,
               username: "Google User",
               email: googleEmail,
               role: role,
               tokens: role === 'FAN' ? 100 : 0,
               isVerified: role === 'MODEL' ? false : true,
               subscriptions: [],
               favorites: [],
               following: [],
               unlockedStreams: [],
               unlockedContent: [],
               purchasedMerch: [],
               referralCode: `DGN-${Math.random().toString(36).substring(7).toUpperCase()}`,
               referralCount: 0,
               referralEarnings: 0,
               realInfo: role === 'MODEL' ? {
                   realName: 'Google User',
                   gender: 'Not Specified',
                   address: 'Pending Update'
               } : undefined
           };
           db.users.push(user);
           
           if (role === 'MODEL') {
               const newPerformer: Performer = {
                    id: user.id,
                    name: user.username,
                    tags: ['New'],
                    viewers: 0,
                    thumbnail: 'https://picsum.photos/seed/google/400/600',
                    status: 'OFFLINE' as any,
                    description: 'Google verified account',
                    isAi: false,
                    subscriptionPrice: 50,
                    unlockPrice: 10,
                    privateRoomPrice: 100,
                    spyPrice: 25,
                    kickPrice: 100,
                    rating: 5.0,
                    ratingCount: 0,
                    content: [],
                    albums: [],
                    merch: [],
                    games: [],
                    earnings: 0,
                    blockedRegions: [],
                    bannedUsers: [],
                    country: 'Unknown',
                    toyConnected: false,
                    safetyScore: 100
               };
               db.performers.push(newPerformer);
           }
           saveDB(db);
       }

       localStorage.setItem(SESSION_KEY, JSON.stringify(user));
       return user;
    },

    register: async (user: User): Promise<User> => {
      await new Promise(r => setTimeout(r, 1000));
      const db = getDB();
      
      if (db.users.find(u => u.email === user.email)) {
        throw new Error("Email already registered");
      }

      const newUser = { 
          ...user, 
          id: `${user.role.toLowerCase()}-${Date.now()}`,
          referralCode: `DGN-${Math.random().toString(36).substring(7).toUpperCase()}`,
          referralCount: 0,
          referralEarnings: 0
      };
      
      db.users.push(newUser);
      
      if (user.role === 'MODEL') {
        const newPerformer: Performer = {
            id: newUser.id,
            name: user.username,
            tags: ['New'],
            viewers: 0,
            thumbnail: 'https://picsum.photos/seed/new/400/600',
            status: 'OFFLINE' as any,
            description: 'New creator',
            isAi: false,
            subscriptionPrice: 50,
            unlockPrice: 10,
            privateRoomPrice: 100,
            spyPrice: 25,
            kickPrice: 100,
            rating: 5.0,
            ratingCount: 0,
            content: [],
            albums: [],
            merch: [],
            games: [],
            earnings: 0,
            blockedRegions: [],
            bannedUsers: [],
            country: user.realInfo?.address.split(',').pop()?.trim() || 'Unknown',
            toyConnected: false,
            safetyScore: 100
        };
        db.performers.push(newPerformer);
      }

      saveDB(db);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    },

    logout: () => {
      localStorage.removeItem(SESSION_KEY);
    },

    getCurrentUser: (): User | null => {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const sessionUser = JSON.parse(stored) as User;
      if (sessionUser.role === 'ADMIN') return sessionUser;
      const db = getDB();
      const freshUser = db.users.find(u => u.id === sessionUser.id);
      return freshUser || null;
    }
  },

  transactions: {
    process: async (fanId: string, performerId: string, amount: number, type: string = 'GENERIC'): Promise<{ success: boolean; updatedUser: User | null }> => {
        // AUTOMATED 70/30 SPLIT LOGIC
        const db = getDB();
        const user = db.users.find(u => u.id === fanId);
        const performer = db.performers.find(p => p.id === performerId);

        if (!user) return { success: false, updatedUser: null };
        if (user.role === 'ADMIN') return { success: true, updatedUser: user }; // Admins free

        if (user.tokens >= amount) {
            // 1. Deduct from Fan
            user.tokens -= amount;

            // 2. Calculate Split
            const modelShare = Math.ceil(amount * 0.70); // 70% to Model
            const platformShare = amount - modelShare;   // 30% to Platform

            // 3. Credit Model
            if (performer) {
                performer.earnings += modelShare;
            }

            // 4. Credit Platform (Admin)
            // We credit the first ADMIN found or a master wallet
            const admin = db.users.find(u => u.role === 'ADMIN' || u.id === 'MASTER-ADMIN');
            if (admin) {
                admin.tokens += platformShare;
            }

            saveDB(db);
            
            // Update Session if it's the current user
            const sessionUserStr = localStorage.getItem(SESSION_KEY);
            if (sessionUserStr) {
                const sessionUser = JSON.parse(sessionUserStr);
                if (sessionUser.id === fanId) {
                   localStorage.setItem(SESSION_KEY, JSON.stringify(user));
                }
            }

            return { success: true, updatedUser: user };
        }

        return { success: false, updatedUser: null };
    }
  },

  withdrawals: {
      request: async (performerId: string, amountTokens: number, method: string, details: string): Promise<boolean> => {
          const db = getDB();
          const performer = db.performers.find(p => p.id === performerId);
          
          if (!performer) throw new Error("Performer not found");
          
          if (performer.earnings < amountTokens) {
              throw new Error("Insufficient earnings");
          }

          if (performer.earnings < MIN_WITHDRAWAL_TOKENS) {
              throw new Error(`Minimum balance of ${MIN_WITHDRAWAL_TOKENS} tokens required to initiate withdrawal.`);
          }

          if (amountTokens < MIN_WITHDRAWAL_TOKENS) {
              throw new Error(`Minimum withdrawal amount is ${MIN_WITHDRAWAL_TOKENS} tokens.`);
          }

          // Deduct tokens immediately to put into "Escrow"
          performer.earnings -= amountTokens;
          
          const request: WithdrawalRequest = {
              id: `wd-${Date.now()}`,
              performerId: performer.id,
              performerName: performer.name,
              amountTokens: amountTokens,
              amountUsd: amountTokens * TOKEN_PAYOUT_RATE,
              status: 'PENDING',
              requestedAt: Date.now(),
              method,
              details
          };

          db.withdrawals.unshift(request);
          saveDB(db);
          return true;
      },
      
      approve: async (requestId: string) => {
          const db = getDB();
          const req = db.withdrawals.find(r => r.id === requestId);
          if (req) {
              req.status = 'APPROVED';
              req.processedAt = Date.now();
              saveDB(db);
          }
      },

      reject: async (requestId: string) => {
          const db = getDB();
          const req = db.withdrawals.find(r => r.id === requestId);
          if (req && req.status === 'PENDING') {
              req.status = 'REJECTED';
              req.processedAt = Date.now();
              
              // REFUND TOKENS TO MODEL
              const performer = db.performers.find(p => p.id === req.performerId);
              if (performer) {
                  performer.earnings += req.amountTokens;
              }
              
              saveDB(db);
          }
      },

      getPending: async (): Promise<WithdrawalRequest[]> => {
          return getDB().withdrawals.filter(w => w.status === 'PENDING');
      },
      
      getAll: async (): Promise<WithdrawalRequest[]> => {
          return getDB().withdrawals;
      },

      getByUser: async (userId: string): Promise<WithdrawalRequest[]> => {
          return getDB().withdrawals.filter(w => w.performerId === userId);
      }
  },

  user: {
    update: async (updatedUser: User) => {
      if (updatedUser.role === 'ADMIN') return;
      const db = getDB();
      const index = db.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        db.users[index] = updatedUser;
        saveDB(db);
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser)); 
      }
    },
    addTokens: async (userId: string, amount: number) => {
       const db = getDB();
       const user = db.users.find(u => u.id === userId);
       if (user) {
         user.tokens += amount;
         saveDB(db);
         return user;
       }
       throw new Error("User not found");
    },
    getAll: async (): Promise<User[]> => {
        return getDB().users.filter(u => u.role === 'FAN');
    }
  },

  notifications: {
      getAll: async (): Promise<Notification[]> => {
          return getDB().notifications;
      },
      create: async (n: Notification) => {
          const db = getDB();
          db.notifications.unshift(n);
          saveDB(db);
      }
  },

  performers: {
    getAll: async (): Promise<Performer[]> => {
      return getDB().performers;
    },
    update: async (performer: Performer) => {
       const db = getDB();
       const idx = db.performers.findIndex(p => p.id === performer.id);
       if(idx !== -1) {
         db.performers[idx] = performer;
         saveDB(db);
       }
    },
    manualAdd: async (performer: Performer) => {
        const db = getDB();
        db.performers.push(performer);
        saveDB(db);
    },
    getPending: async (): Promise<User[]> => {
       return getDB().users.filter(u => u.role === 'MODEL' && !u.isVerified);
    }
  },

  messages: {
    getThreads: async (userId: string): Promise<MessageThread[]> => {
       const db = getDB();
       const involved = db.messages.filter(m => m.senderId === userId || m.receiverId === userId);
       
       const user = db.users.find(u => u.id === userId);
       let campaignMessages: DirectMessage[] = [];
       
       if (user && user.role === 'FAN') {
           user.subscriptions.forEach(subId => {
               const modelCampaigns = db.campaigns.filter(c => c.performerId === subId);
               modelCampaigns.forEach(camp => {
                   campaignMessages.push({
                       id: camp.id,
                       senderId: camp.performerId,
                       receiverId: userId,
                       text: camp.text,
                       timestamp: camp.createdAt,
                       isLocked: true,
                       unlockPrice: camp.unlockPrice,
                       mediaUrl: camp.mediaUrl,
                       isRead: false,
                       isCampaign: true
                   });
               });
           });
       }

       const allMsgs = [...involved, ...campaignMessages].sort((a,b) => b.timestamp - a.timestamp);
       
       const threadMap = new Map<string, MessageThread>();
       
       for (const msg of allMsgs) {
           const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
           if (!threadMap.has(otherId)) {
               let participant = db.performers.find(p => p.id === otherId);
               let role = 'MODEL';
               let name = participant?.name || 'Unknown';
               let avatar = participant?.thumbnail || '';

               if (!participant) {
                   const fan = db.users.find(u => u.id === otherId);
                   name = fan?.username || 'Unknown';
                   avatar = 'https://picsum.photos/100'; 
                   role = fan?.role || 'FAN';
               }

               threadMap.set(otherId, {
                   id: otherId,
                   participant: { id: otherId, name, avatar, role: role as any },
                   lastMessage: msg.isLocked ? '🔒 Content Locked' : msg.text,
                   unreadCount: 0,
                   timestamp: msg.timestamp
               });
           }
           const thread = threadMap.get(otherId)!;
           if (!msg.isRead && msg.receiverId === userId) {
               thread.unreadCount++;
           }
       }
       return Array.from(threadMap.values());
    },

    getHistory: async (userId: string, otherId: string): Promise<DirectMessage[]> => {
        const db = getDB();
        const involved = db.messages.filter(m => 
            (m.senderId === userId && m.receiverId === otherId) || 
            (m.senderId === otherId && m.receiverId === userId)
        );

        const campaigns = db.campaigns.filter(c => c.performerId === otherId);
        const campaignMessages: DirectMessage[] = campaigns.map(camp => ({
             id: camp.id,
             senderId: camp.performerId,
             receiverId: userId,
             text: camp.text,
             timestamp: camp.createdAt,
             isLocked: true,
             unlockPrice: camp.unlockPrice,
             mediaUrl: camp.mediaUrl,
             isRead: true,
             isCampaign: true
        }));

        const merged = [...involved, ...campaignMessages].sort((a,b) => a.timestamp - b.timestamp);
        return merged;
    },

    send: async (msg: DirectMessage) => {
        const db = getDB();
        db.messages.push(msg);
        saveDB(db);
    },

    unlock: async (userId: string, messageId: string, cost: number) => {
        // Use transaction logic for message unlock too
        const db = getDB();
        const msg = db.messages.find(m => m.id === messageId);
        const performerId = msg ? msg.senderId : 'unknown'; // Simplified
        
        // We'll call process logic manually or refactor this. 
        // For simplicity, reusing manual logic here but ideally should use transactions.process
        
        const user = db.users.find(u => u.id === userId);
        const performer = db.performers.find(p => p.id === performerId);

        if (user && user.tokens >= cost) {
            user.tokens -= cost;
            
            // 70/30 Split
            const modelShare = Math.ceil(cost * 0.70);
            const platformShare = cost - modelShare;
            
            if (performer) performer.earnings += modelShare;
            
            const admin = db.users.find(u => u.role === 'ADMIN');
            if(admin) admin.tokens += platformShare;

            if (!user.unlockedMessages) user.unlockedMessages = [];
            user.unlockedMessages.push(messageId);
            
            saveDB(db);
            return true;
        }
        return false;
    }
  },

  campaigns: {
      create: async (campaign: Campaign) => {
          const db = getDB();
          db.campaigns.push(campaign);
          saveDB(db);
      },
      getAll: async (performerId: string): Promise<Campaign[]> => {
          return getDB().campaigns.filter(c => c.performerId === performerId).sort((a,b) => b.createdAt - a.createdAt);
      }
  },

  orders: {
    create: async (order: Order) => {
       const db = getDB();
       db.orders.push(order);
       saveDB(db);
    },
    getByPerformer: async (performerId: string): Promise<Order[]> => {
       return getDB().orders.filter(o => o.performerId === performerId);
    }
  },
  
  admin: {
      grantAccess: async (fanId: string, tokens: number) => {
          const db = getDB();
          const user = db.users.find(u => u.id === fanId);
          if (user) {
              user.tokens += tokens;
              saveDB(db);
          }
      },
      grantSub: async (fanId: string, performerId: string) => {
        const db = getDB();
        const user = db.users.find(u => u.id === fanId);
        if (user && !user.subscriptions.includes(performerId)) {
            user.subscriptions.push(performerId);
            saveDB(db);
        }
      },
      approveModel: async (userId: string) => {
          const db = getDB();
          const user = db.users.find(u => u.id === userId);
          if (user && user.role === 'MODEL') {
              user.isVerified = true;
              saveDB(db);
          }
      },
      logViolation: async (violation: Violation) => {
          const db = getDB();
          db.violations.unshift(violation);
          // Auto-Notify Admin of Security Event
          db.notifications.unshift({
            id: `n-${Date.now()}`,
            title: `SECURITY ALERT: ${violation.type}`,
            message: `User ${violation.performerName} flagged. ${violation.details}`,
            type: 'SECURITY',
            timestamp: Date.now(),
            read: false
          });
          saveDB(db);
      },
      getViolations: async (): Promise<Violation[]> => {
          return getDB().violations;
      }
  }
};
