
import React, { useState } from 'react';
import { FETISH_CATEGORIES, COUNTRIES, MOCK_FEED_POSTS } from '../constants';
import ModelCard from '../components/ModelCard';
import StoriesBar from '../components/StoriesBar';
import FeedPost from '../components/FeedPost';
import { Performer, User, FeedPost as FeedPostType } from '../types';
import { Search, Globe, ChevronDown, Grid, List } from 'lucide-react';

interface HomeProps {
  onPerformerSelect: (p: Performer) => void;
  currentUser?: User | null;
  onUnlockPost?: (post: FeedPostType) => void;
  performers: Performer[];
}

const Home: React.FC<HomeProps> = ({ onPerformerSelect, currentUser, onUnlockPost, performers }) => {
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'DISCOVER' | 'FEED'>('DISCOVER');

  const filteredPerformers = performers.filter(p => {
    const matchesCategory = selectedCategory === 'Featured' || p.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
    const matchesCountry = selectedCountry === 'All Countries' || p.country === selectedCountry;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesCountry && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Stories Bar */}
      <StoriesBar currentUser={currentUser || null} />

      {/* Hero Banner (Only on Discover) */}
      {viewMode === 'DISCOVER' && (
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-dungeon-950 via-dungeon-900/80 to-transparent z-10" />
            <img 
            src="https://picsum.photos/1200/400?grayscale" 
            alt="Banner" 
            className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
                ENTER THE <span className="text-dungeon-accent">DUNGEON</span>
            </h2>
            <p className="text-gray-300 max-w-xl text-lg mb-8">
                Experience the next generation of interactive streaming. 
                Real connections. Unlimited fantasies.
            </p>
            <div className="flex gap-4">
                <button className="bg-dungeon-accent hover:bg-rose-700 text-white px-8 py-3 rounded-md font-bold transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]">
                JOIN FREE
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-md font-bold backdrop-blur-sm transition-all border border-white/10">
                BROWSE CAMS
                </button>
            </div>
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-4">
          <button 
             onClick={() => setViewMode('DISCOVER')}
             className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${viewMode === 'DISCOVER' ? 'text-white border-b-2 border-dungeon-accent' : 'text-gray-500 hover:text-white'}`}
          >
             <Grid size={16} /> Discover
          </button>
          <button 
             onClick={() => setViewMode('FEED')}
             className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${viewMode === 'FEED' ? 'text-white border-b-2 border-dungeon-accent' : 'text-gray-500 hover:text-white'}`}
          >
             <List size={16} /> Following Feed
          </button>
      </div>

      {viewMode === 'DISCOVER' ? (
        <>
            {/* Filters/Search */}
            <div className="sticky top-0 bg-dungeon-950/95 backdrop-blur z-30 py-4 border-b border-white/5 space-y-4">
                
                {/* Top Bar: Search & Country */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Categories (Desktop Horizontal Scroll) */}
                    <div className="flex-1 w-full overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2 pb-2">
                        {FETISH_CATEGORIES.map((filter, idx) => (
                            <button 
                            key={filter}
                            onClick={() => setSelectedCategory(filter)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === filter ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                            >
                            {filter}
                            </button>
                        ))}
                    </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto shrink-0">
                    {/* Country Filter */}
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <select 
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="appearance-none bg-dungeon-900 border border-white/10 rounded-full pl-10 pr-8 py-2 text-sm text-white focus:outline-none focus:border-dungeon-accent/50 cursor-pointer"
                        >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-3 h-3 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models or tags..." 
                        className="w-full bg-dungeon-900 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-dungeon-accent/50"
                        />
                    </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredPerformers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredPerformers.map(performer => (
                    <ModelCard 
                    key={performer.id} 
                    performer={performer} 
                    onClick={onPerformerSelect}
                    isFavorite={currentUser?.favorites.includes(performer.id)}
                    isFollowing={currentUser?.following.includes(performer.id)}
                    />
                ))}
                </div>
            ) : (
                <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No performers found matching your dark desires.</p>
                <button 
                    onClick={() => { setSelectedCategory('Featured'); setSelectedCountry('All Countries'); setSearchQuery(''); }}
                    className="mt-4 text-dungeon-accent hover:underline"
                >
                    Clear Filters
                </button>
                </div>
            )}
        </>
      ) : (
          <div className="max-w-2xl mx-auto">
             {MOCK_FEED_POSTS.map(post => (
                 <FeedPost 
                    key={post.id} 
                    post={post} 
                    isUnlocked={currentUser?.unlockedPosts?.includes(post.id) || false}
                    onUnlock={(p) => onUnlockPost && onUnlockPost(p)}
                    onLike={(id) => console.log('like', id)}
                 />
             ))}
             <div className="text-center py-8 text-gray-500 text-sm">
                 You're caught up! Follow more models to see their posts here.
             </div>
          </div>
      )}
    </div>
  );
};

export default Home;
