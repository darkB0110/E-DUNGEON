

import { Performer, PerformerStatus, CategoryGroup, Story, Quest, FeedPost, Order, Campaign, ToyControl, Notification, TipMenuItem, LeaderboardEntry, Game, Album, MerchItem } from './types';

export const ADMIN_WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Replace with your wallet

// FINANCIAL CONSTANTS
export const MIN_WITHDRAWAL_TOKENS = 2000; // Models must earn this much before requesting payout
export const TOKEN_PAYOUT_RATE = 0.05; // $0.05 per token paid out to model (After platform fees)

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Body Parts",
    items: ["Feet", "Hands", "Legs", "Abs", "Back", "Eyes"]
  },
  {
    name: "Vibe",
    items: ["Mistress", "Goth", "E-Girl", "Nurse", "Latex", "Outdoors"]
  },
  {
    name: "Acts",
    items: ["Domination", "Submission", "Roleplay", "JOI", "ASMR"]
  }
];

export const FETISH_CATEGORIES = [
  "Featured", "BDSM", "Latex", "Feet", "Goth", "Roleplay", "Anime", "Mature", "Teen (18+)", "BBW", "Trans", "Couples", "VR", "Furries", "Gaming"
];

export const COUNTRIES = [
  "All Countries", "USA", "UK", "Canada", "Germany", "France", "Spain", "Brazil", "Russia", "Japan", "Australia", "Colombia", "Romania"
];

export const COUNTRY_FLAGS: Record<string, string> = {
  "USA": "🇺🇸", "UK": "🇬🇧", "Canada": "🇨🇦", "Germany": "🇩🇪", "France": "🇫🇷",
  "Spain": "🇪🇸", "Brazil": "🇧🇷", "Russia": "🇷🇺", "Japan": "🇯🇵", "Australia": "🇦🇺",
  "Colombia": "🇨🇴", "Romania": "🇷🇴", "Unknown": "🏳️"
};

export const DEFAULT_TIP_MENU: TipMenuItem[] = [
    { label: "Blow Kiss", price: 25 },
    { label: "Flash", price: 100 },
    { label: "Spank", price: 50 },
    { label: "Oil Up", price: 200 },
    { label: "Say Name", price: 50 },
    { label: "Feet Show", price: 75 }
];

export const MOCK_PERFORMERS: Performer[] = [
  {
    id: '1',
    name: 'Mistress Vayda',
    tags: ['Domme', 'Latex', 'Boots'],
    viewers: 1240,
    thumbnail: 'https://picsum.photos/seed/vayda/400/600',
    status: PerformerStatus.LIVE,
    description: 'Kneel before your queen. Interactive toys enabled.',
    isAi: true,
    subscriptionPrice: 50,
    unlockPrice: 25,
    privateRoomPrice: 150,
    spyPrice: 25,
    kickPrice: 200,
    rating: 4.9,
    ratingCount: 320,
    content: [
      { id: 'c1', type: 'IMAGE', url: 'https://picsum.photos/seed/c1/400/600', isLocked: true, price: 50, title: 'Latex Shine' },
      { id: 'c2', type: 'VIDEO', url: 'https://picsum.photos/seed/c2/400/600', isLocked: true, price: 100, title: 'Worship Session' },
    ],
    albums: [],
    merch: [
        { id: 'm1', name: 'Worn Panties', price: 500, image: 'https://picsum.photos/seed/panties/200', type: 'PHYSICAL', stock: 1 },
        { id: 'm2', name: 'Custom Video', price: 1000, image: 'https://picsum.photos/seed/vid/200', type: 'DIGITAL' }
    ],
    games: [
        { id: 'g1', type: 'WHEEL', title: 'Wheel of Pain', description: 'Spin to decide my punishment', price: 50, options: [{id:'1', label:'Spank', color:'red'}, {id:'2', label:'Gag', color:'black'}] }
    ],
    earnings: 2500, // Mock earnings above threshold
    blockedRegions: [],
    bannedUsers: [],
    country: "Germany",
    hideCountry: false,
    toyConnected: true,
    toyControls: [
        { id: 't1', label: 'Low Vibe', duration: 5, intensity: 5, price: 25, icon: 'ZAP' },
        { id: 't2', label: 'Pulse', duration: 10, intensity: 10, price: 50, icon: 'PULSE' },
        { id: 't3', label: 'MAX', duration: 15, intensity: 20, price: 100, icon: 'EXPLOSION' }
    ],
    squadPartner: { id: '2', name: 'Lady Raven', thumbnail: 'https://picsum.photos/seed/raven/400/600' },
    squadUnlockPrice: 90,
    tipMenu: DEFAULT_TIP_MENU,
    watermarkEnabled: true,
    watermarkText: "DGN-VAYDA-SECURE"
  },
  {
    id: '2',
    name: 'Lady Raven',
    tags: ['Goth', 'Feet', 'Tattoo'],
    viewers: 850,
    thumbnail: 'https://picsum.photos/seed/raven/400/600',
    status: PerformerStatus.LIVE,
    description: 'Dark fantasies and deep conversations.',
    isAi: false,
    subscriptionPrice: 30,
    unlockPrice: 15,
    privateRoomPrice: 100,
    spyPrice: 20,
    kickPrice: 100,
    rating: 4.7,
    ratingCount: 150,
    content: [],
    albums: [],
    merch: [],
    games: [],
    earnings: 0,
    blockedRegions: [],
    bannedUsers: [],
    country: "USA",
    toyConnected: false,
    squadPartner: { id: '1', name: 'Mistress Vayda', thumbnail: 'https://picsum.photos/seed/vayda/400/600' },
    tipMenu: DEFAULT_TIP_MENU,
    watermarkEnabled: false
  },
  {
    id: '3',
    name: 'Kitsune VR',
    tags: ['Anime', 'Cosplay', 'Gaming'],
    viewers: 2100,
    thumbnail: 'https://picsum.photos/seed/kitsune/400/600',
    status: PerformerStatus.PRIVATE,
    description: 'VR ready streams. Join me in the metaverse.',
    isAi: true,
    subscriptionPrice: 75,
    unlockPrice: 30,
    privateRoomPrice: 200,
    spyPrice: 50,
    kickPrice: 500,
    rating: 5.0,
    ratingCount: 500,
    content: [],
    albums: [],
    merch: [],
    games: [],
    earnings: 0,
    blockedRegions: ['North America'], // Geoblocked mock
    bannedUsers: [],
    country: "Japan",
    toyConnected: true,
    tipMenu: DEFAULT_TIP_MENU,
    watermarkEnabled: true,
    watermarkText: "DGN-KITSUNE-VR"
  },
  {
    id: '4',
    name: 'Goddess Iza',
    tags: ['BBW', 'Worship', 'Humiliation'],
    viewers: 450,
    thumbnail: 'https://picsum.photos/seed/iza/400/600',
    status: PerformerStatus.OFFLINE,
    description: 'Pay tribute.',
    isAi: false,
    subscriptionPrice: 40,
    unlockPrice: 20,
    privateRoomPrice: 120,
    spyPrice: 20,
    kickPrice: 150,
    rating: 4.8,
    ratingCount: 200,
    content: [],
    albums: [],
    merch: [],
    games: [],
    earnings: 0,
    blockedRegions: [],
    bannedUsers: [],
    country: "Brazil",
    toyConnected: false,
    tipMenu: DEFAULT_TIP_MENU
  }
];

export const MOCK_STORIES: Story[] = [
  { id: 's1', performerId: '1', performerName: 'Mistress Vayda', thumbnail: 'https://picsum.photos/seed/s1/100', mediaUrl: 'https://picsum.photos/seed/s1/400/800', expiresAt: Date.now() + 3600000, isSeen: false },
  { id: 's2', performerId: '3', performerName: 'Kitsune VR', thumbnail: 'https://picsum.photos/seed/s2/100', mediaUrl: 'https://picsum.photos/seed/s2/400/800', expiresAt: Date.now() + 7200000, isSeen: true },
];

export const MOCK_QUESTS: Quest[] = [
    { id: 'q1', title: 'First Blood', description: 'Tip your first 100 tokens', rewardTokens: 50, progress: 0, total: 100, isClaimed: false },
    { id: 'q2', title: 'Voyeur', description: 'Watch 10 minutes of streams', rewardTokens: 25, progress: 5, total: 10, isClaimed: false },
    { id: 'q3', title: 'Collector', description: 'Unlock 3 premium posts', rewardTokens: 100, progress: 1, total: 3, isClaimed: false }
];

export const MOCK_FEED_POSTS: FeedPost[] = [
    { 
        id: 'fp1', 
        performerId: '1', 
        performerName: 'Mistress Vayda', 
        performerAvatar: 'https://picsum.photos/seed/vayda/100', 
        timestamp: Date.now() - 3600000, 
        caption: 'New latex set just dropped 🖤 Unlock to see the full shine.', 
        type: 'IMAGE', 
        mediaUrl: 'https://picsum.photos/seed/latex/600/600', 
        isLocked: true, 
        unlockPrice: 25, 
        likes: 120, 
        comments: 45 
    },
    { 
        id: 'fp2', 
        performerId: '3', 
        performerName: 'Kitsune VR', 
        performerAvatar: 'https://picsum.photos/seed/kitsune/100', 
        timestamp: Date.now() - 7200000, 
        caption: 'Going live in 1 hour! Get your headsets ready.', 
        type: 'TEXT', 
        isLocked: false, 
        likes: 890, 
        comments: 120 
    }
];

export const MOCK_ORDERS: Order[] = [
    { id: 'o1', fanId: 'f1', fanName: 'SubBoi99', performerId: '1', type: 'VIDEO', description: 'Say my name while stepping on cake.', status: 'PENDING', createdAt: Date.now() - 100000 },
    { id: 'o2', fanId: 'f2', fanName: 'FootLover', performerId: '1', type: 'PHOTO', description: 'Soles close up.', status: 'COMPLETED', price: 500, deliveryUrl: 'https://picsum.photos/seed/feet/400', createdAt: Date.now() - 500000 }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Mistress Vayda is Live', message: 'Your favorite domme just started streaming.', type: 'LIVE', timestamp: Date.now(), read: false },
  { id: 'n2', title: 'Order Completed', message: 'Your custom video request is ready.', type: 'SYSTEM', timestamp: Date.now() - 3600000, read: false },
  { id: 'n3', title: 'New Message', message: 'Lady Raven sent you a private message.', type: 'MESSAGE', timestamp: Date.now() - 7200000, read: true }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'u1', username: 'WhaleKing', totalTips: 50000, rank: 1 },
  { userId: 'u2', username: 'SimpLord', totalTips: 35000, rank: 2 },
  { userId: 'u3', username: 'PayPig99', totalTips: 20000, rank: 3 }
];