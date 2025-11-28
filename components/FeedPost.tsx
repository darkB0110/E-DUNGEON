
import React from 'react';
import { FeedPost } from '../types';
import { Heart, MessageCircle, DollarSign, Lock } from 'lucide-react';

interface FeedPostProps {
  post: FeedPost;
  isUnlocked: boolean;
  onUnlock: (post: FeedPost) => void;
  onLike: (postId: string) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, isUnlocked, onUnlock, onLike }) => {
  const isContentVisible = !post.isLocked || isUnlocked;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="bg-dungeon-900 border border-white/5 rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <img src={post.performerAvatar} alt={post.performerName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
        <div>
           <div className="text-white font-bold text-sm">{post.performerName}</div>
           <div className="text-gray-500 text-xs">{formatTime(post.timestamp)}</div>
        </div>
      </div>

      {/* Content */}
      <div className="relative bg-black min-h-[200px] flex items-center justify-center">
         {post.type === 'TEXT' ? (
             <div className="p-6 text-center text-white text-lg font-display">{post.caption}</div>
         ) : (
             <>
               <img 
                 src={post.mediaUrl} 
                 alt="Content" 
                 className={`w-full max-h-[500px] object-cover ${isContentVisible ? '' : 'blur-xl opacity-50'}`} 
               />
               {!isContentVisible && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4">
                       <Lock className="text-dungeon-accent w-8 h-8 mb-2" />
                       <div className="text-white font-bold mb-4">Unlock Post</div>
                       <button 
                         onClick={() => onUnlock(post)}
                         className="bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-all shadow-lg"
                       >
                           Unlock for {post.unlockPrice} Tokens
                       </button>
                   </div>
               )}
             </>
         )}
      </div>

      {/* Actions */}
      <div className="p-4">
         <div className="flex gap-4 mb-3">
             <button onClick={() => onLike(post.id)} className={`flex items-center gap-1 ${post.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}>
                 <Heart className={post.isLiked ? 'fill-current' : ''} size={20} />
                 <span className="text-xs font-bold">{post.likes}</span>
             </button>
             <button className="flex items-center gap-1 text-gray-400 hover:text-white">
                 <MessageCircle size={20} />
                 <span className="text-xs font-bold">{post.comments}</span>
             </button>
             <button className="flex items-center gap-1 text-gray-400 hover:text-yellow-500 ml-auto">
                 <DollarSign size={20} />
                 <span className="text-xs font-bold">Tip</span>
             </button>
         </div>
         {post.type !== 'TEXT' && <p className="text-sm text-gray-300"><span className="font-bold text-white mr-2">{post.performerName}</span>{post.caption}</p>}
      </div>
    </div>
  );
};

export default FeedPost;
