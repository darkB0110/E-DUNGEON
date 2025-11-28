
export enum PerformerStatus {
  LIVE = 'LIVE',
  OFFLINE = 'OFFLINE',
  PRIVATE = 'PRIVATE',
  BANNED = 'BANNED'
}

export interface ContentItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  isLocked: boolean;
  price: number;
  title: string;
  description?: string;
  siteWatermarked?: boolean;
  albumId?: string; // Group content
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  itemCount: number;
  description?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'PHYSICAL' | 'DIGITAL' | 'AUCTION';
  stock?: number;
  currentBid?: number;
  endTime?: number;
  bidderCount?: number;
}

export interface FeedPost {
  id: string;
  performerId: string;
  performerName: string;
  performerAvatar: string;
  timestamp: number;
  caption: string;
  type: 'IMAGE' | 'VIDEO' | 'TEXT';
  mediaUrl?: string;
  isLocked: boolean;
  unlockPrice?: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Story {
  id: string;
  performerId: string;
  performerName: string;
  thumbnail: string;
  mediaUrl: string;
  expiresAt: number;
  isSeen: boolean;
}

export interface GameOption {
  id: string;
  label: string;
  color: string;
}

export interface Game {
  id: string;
  type: 'WHEEL' | 'DICE';
  title: string;
  description: string;
  price: number;
  options?: GameOption[]; // For wheel
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';

export interface Order {
  id: string;
  fanId: string;
  fanName: string;
  performerId: string;
  type: 'VIDEO' | 'PHOTO' | 'AUDIO';
  description: string;
  status: OrderStatus;
  price?: number;
  deliveryUrl?: string;
  createdAt: number;
}

export interface Campaign {
  id: string;
  performerId: string;
  text: string;
  mediaUrl?: string;
  unlockPrice: number;
  sentTo: number; // Count of users
  openRate: number; // Percentage
  revenue: number;
  createdAt: number;
}

export interface ToyControl {
  id: string;
  label: string;
  duration: number; // seconds
  intensity: number; // 0-20
  price: number;
  icon?: 'ZAP' | 'WAVE' | 'PULSE' | 'EXPLOSION';
}

export interface BattleState {
  isActive: boolean;
  opponentName: string;
  opponentAvatar: string;
  myScore: number;
  opponentScore: number;
  timeLeft: number; // Seconds
}

export interface Performer {
  id: string;
  name: string;
  tags: string[];
  viewers: number;
  thumbnail: string;
  status: PerformerStatus;
  description: string;
  isAi: boolean;
  subscriptionPrice: number;
  unlockPrice: number; 
  privateRoomPrice: number; 
  spyPrice: number; 
  kickPrice: number; 
  rating: number; 
  ratingCount: number;
  content: ContentItem[];
  albums: Album[]; 
  merch: MerchItem[];
  games: Game[]; 
  earnings: number; 
  blockedRegions: string[]; 
  bannedUsers: { userId: string; until: number }[];
  country: string;
  hideCountry?: boolean;
  toyConnected: boolean;
  toyControls?: ToyControl[]; // Configured vibration patterns
  squadPartner?: { id: string; name: string; thumbnail: string };
  squadUnlockPrice?: number; // Combined price for squad stream
  nftRequired?: string;
  currentTipGoal?: {
    label: string;
    targetAmount: number;
    currentAmount: number;
  };
  battle?: BattleState;
  tipMenu?: TipMenuItem[];
  watermarkEnabled?: boolean;
  watermarkText?: string;
  safetyScore?: number; // 0-100, lower is better
  lastViolation?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
  isTip?: boolean;
  tipAmount?: number;
  timestamp: number;
}

export interface MessageThread {
  id: string;
  participant: { id: string; name: string; avatar: string; role: UserRole };
  lastMessage: string;
  unreadCount: number;
  timestamp: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isLocked?: boolean;
  unlockPrice?: number;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  isRead: boolean;
  isCampaign?: boolean; // If generated from a mass blast
}

export type UserRole = 'GUEST' | 'FAN' | 'MODEL' | 'ADMIN';

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardTokens: number;
  progress: number;
  total: number;
  isClaimed: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  tokens: number;
  isVerified?: boolean;
  subscriptions: string[];
  favorites: string[];
  following: string[];
  unlockedStreams: string[];
  unlockedContent: string[];
  unlockedPosts?: string[];
  unlockedMessages?: string[]; 
  purchasedMerch: string[];
  settings?: {
    autoTranslate: boolean;
    preferredLanguage: string;
    geoNotifications?: boolean;
    emailFrequency?: 'INSTANT' | 'DAILY' | 'NONE';
  };
  cryptoWallet?: string;
  realInfo?: {
    realName: string;
    dob?: string;
    age?: number;
    gender: string;
    address: string;
  };
  quests?: Quest[];
  referralCode?: string; // Unique code for this user
  referredBy?: string; // ID of user who referred them
  referralEarnings?: number; // Tokens earned from referrals
  referralCount?: number;
}

export type ViewState = 'HOME' | 'ROOM' | 'PROFILE' | 'PRIVATE_ROOM' | 'AUTH_FAN' | 'AUTH_MODEL' | 'LOGIN' | 'MODEL_DASHBOARD' | 'FAN_DASHBOARD' | 'ADMIN_DASHBOARD' | 'MESSAGES' | 'VERIFICATION_PENDING';

export interface RoomContextType {
  currentPerformer: Performer | null;
  enterRoom: (performer: Performer) => void;
  leaveRoom: () => void;
}

export type PaymentMethod = 'VISA' | 'MPESA' | 'AIRTEL' | 'MTN' | 'CRYPTO';

export interface CategoryGroup {
  name: string;
  items: string[];
}

export interface TipMenuItem {
  label: string;
  price: number;
  icon?: string;
}

export interface FilterOptions {
  category: string;
  country: string;
  priceRange: [number, number];
  isAi: boolean | null;
  status: PerformerStatus | 'ALL';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'TIP' | 'MESSAGE' | 'SYSTEM' | 'LIVE' | 'SECURITY';
  timestamp: number;
  read: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalTips: number;
  rank: number;
}

export interface Violation {
  id: string;
  performerId: string;
  performerName: string;
  type: 'DEEPFAKE' | 'AI_GENERATED' | 'BANNED_CONTENT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
  details: string;
  resolved: boolean;
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WithdrawalRequest {
  id: string;
  performerId: string;
  performerName: string;
  amountTokens: number;
  amountUsd: number;
  status: WithdrawalStatus;
  requestedAt: number;
  processedAt?: number;
  method: string; // e.g., 'Crypto', 'Bank'
  details: string; // Wallet address etc.
}
