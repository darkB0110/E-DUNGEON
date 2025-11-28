

import React from 'react';
import { MOCK_STORIES } from '../constants';
import { User } from '../types';
import { Plus } from 'lucide-react';

interface StoriesBarProps {
  currentUser: User | null;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ currentUser }) => {
  // Filter stories:
  // 1. If user is guest, show all (or trending).
  // 2. If user is fan, show only subscribed/followed performers.
  // 3. If user is model, show their own + followed.
  
  const visibleStories = MOCK_STORIES.filter(story => {
    if (!currentUser) return true; // Guest sees all
    if (currentUser.role === 'MODEL' && story.performerId === currentUser.id) return true; // See own story
    
    // Check following and subscriptions
    const isFollowing = currentUser.following?.includes(story.performerId);
    const isSubscribed = currentUser.subscriptions?.includes(story.performerId);
    
    return isFollowing || isSubscribed;
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
      {/* Create Story Button - Only for Models */}
      {currentUser?.role === 'MODEL' && (
        <div className="flex flex-col items-center gap-1 cursor-pointer group min-w-[72px]">
          <div className="w-16 h-16 rounded-full bg-dungeon-800 border-2 border-white/10 flex items-center justify-center group-hover:border-dungeon-accent transition-colors relative">
            <Plus className="text-white w-6 h-6" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-dungeon-accent rounded-full flex items-center justify-center border border-black text-white font-bold text-xs">+</div>
          </div>
          <span className="text-[10px] text-gray-400 font-bold">Your Story</span>
        </div>
      )}

      {/* Stories List */}
      {visibleStories.length > 0 ? (
        visibleStories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer group min-w-[72px]">
            <div className={`w-16 h-16 rounded-full p-[2px] ${story.isSeen ? 'bg-gray-700' : 'bg-gradient-to-tr from-dungeon-accent to-purple-500'}`}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
                 <img src={story.thumbnail} alt={story.performerName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] text-gray-300 font-bold truncate w-16 text-center">{story.performerName}</span>
          </div>
        ))
      ) : (
        currentUser && (
          <div className="text-gray-500 text-xs flex items-center h-16 px-4 italic">
            Follow models to see their stories here...
          </div>
        )
      )}
    </div>
  );
};

export default StoriesBar;