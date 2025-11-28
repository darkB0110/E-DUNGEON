
import React, { useState } from 'react';
import { Performer, PerformerStatus, ContentItem, MerchItem, Order, TipMenuItem } from '../types';
import { COUNTRY_FLAGS } from '../constants';
import { Lock, Play, ShoppingBag, Heart, Share2, Video, ArrowLeft, X, Eye, Plus, Clapperboard, FolderOpen, Image as ImageIcon, Send } from 'lucide-react';
import OrderModal from '../components/OrderModal';
import TipMenu from '../components/TipMenu';
import Watermark from '../components/Watermark';

interface ProfileProps {
  performer: Performer;
  onEnterRoom: (performer: Performer) => void;
  onUnlockContent: (content: ContentItem) => void;
  onBuyMerch: (merch: MerchItem) => void;
  onBack: () => void;
  isUnlocked: (contentId: string) => boolean;
  isFavorite?: boolean;
  isFollowing?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleFollow?: (id: string) => void;
  onRequestCustom?: (order: Partial<Order>) => void;
  onTip?: (amount: number) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  performer, 
  onEnterRoom, 
  onUnlockContent, 
  onBuyMerch, 
  onBack,
  isUnlocked,
  isFavorite,
  isFollowing,
  onToggleFavorite,
  onToggleFollow,
  onRequestCustom,
  onTip
}) => {
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ALBUMS' | 'MERCH'>('ALL');
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  const flag = (!performer.hideCountry && performer.country) ? COUNTRY_FLAGS[performer.country] : null;

  // Filter content based on view
  const displayContent = selectedAlbumId 
    ? performer.content.filter(c => c.albumId === selectedAlbumId)
    : performer.content;

  const handleCreateOrder = (order: Partial<Order>) => {
      if (onRequestCustom) onRequestCustom(order);
      setShowOrderModal(false);
      alert("Request Sent! Check your profile for updates.");
  };

  const handleTipSelect = (item: TipMenuItem) => {
      if (onTip) {
          onTip(item.price);
          alert(`Tipped ${item.price} tokens for ${item.label}!`);
      }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Tip Menu Overlay */}
      <div className="fixed left-0 top-0 h-screen w-0 z-50 pointer-events-none flex flex-col justify-center">
         <div className="relative pointer-events-auto">
            <TipMenu items={performer.tipMenu || []} onSelect={handleTipSelect} />
         </div>
      </div>

      {/* Cover */}
      <div className="h-64 md:h-80 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dungeon-950 z-10" />
        <img 
          src={performer.content[0]?.url || performer.thumbnail} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-60 blur-sm"
        />
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-20 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm hidden md:inline">Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 items-end md:items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dungeon-950 overflow-hidden shadow-2xl relative bg-black">
            <img src={performer.thumbnail} alt={performer.name} className="w-full h-full object-cover" />
            {performer.status === PerformerStatus.LIVE && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-dungeon-950 rounded-full animate-pulse"></div>
            )}
             {performer.status === PerformerStatus.PRIVATE && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-amber-500 border-2 border-dungeon-950 rounded-full flex items-center justify-center">
                 <Lock size={12} className="text-black"/>
              </div>
            )}
          </div>

          <div className="flex-1 mb-2">
            <h1 className="text-4xl font-display font-bold text-white mb-1 flex items-center gap-2">
               {performer.name}
               {flag && <span className="text-2xl">{flag}</span>}
            </h1>
            <p className="text-gray-400 text-sm max-w-lg mb-3">{performer.description}</p>
            <div className="flex gap-2">
              {performer.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase bg-white/10 px-2 py-1 rounded text-gray-300 border border-white/5">{tag}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4 w-full md:w-auto flex-wrap">
             {performer.status === PerformerStatus.LIVE && (
               <button onClick={() => onEnterRoom(performer)} className="flex-1 md:flex-none bg-dungeon-accent hover:bg-rose-700 text-white px-8 py-3 rounded-lg font-bold animate-pulse flex items-center justify-center gap-2">
                 <Video size={18} /> WATCH LIVE
               </button>
             )}
             {performer.status === PerformerStatus.PRIVATE && (
               <button onClick={() => onEnterRoom(performer)} className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.4)]">
                 <Eye size={18} /> PEEK / SPY
               </button>
             )}
             <button onClick={() => setShowOrderModal(true)} className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                 <Send size={18} /> REQUEST CUSTOM
             </button>
             <button onClick={() => onToggleFollow && onToggleFollow(performer.id)} className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold ${isFollowing ? 'bg-dungeon-accent text-white' : 'bg-white/10 text-white'}`}>
                {isFollowing ? <span className="text-xs">FOLLOWING</span> : <Plus size={20} />}
             </button>
             <button onClick={() => onToggleFavorite && onToggleFavorite(performer.id)} className={`p-3 rounded-lg transition-colors ${isFavorite ? 'bg-pink-600 text-white' : 'bg-white/10 text-white'}`}>
               <Heart className={isFavorite ? 'fill-current' : ''} />
             </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5 mt-8 pb-4 text-sm font-bold text-gray-500 overflow-x-auto">
           <button onClick={() => { setActiveTab('ALL'); setSelectedAlbumId(null); }} className={`px-2 pb-4 -mb-4.5 border-b-2 transition-colors ${activeTab === 'ALL' && !selectedAlbumId ? 'text-white border-dungeon-accent' : 'border-transparent hover:text-white'}`}>ALL CONTENT</button>
           <button onClick={() => { setActiveTab('ALBUMS'); setSelectedAlbumId(null); }} className={`px-2 pb-4 -mb-4.5 border-b-2 transition-colors ${activeTab === 'ALBUMS' || selectedAlbumId ? 'text-white border-dungeon-accent' : 'border-transparent hover:text-white'}`}>ALBUMS</button>
           <button onClick={() => { setActiveTab('MERCH'); setSelectedAlbumId(null); }} className={`px-2 pb-4 -mb-4.5 border-b-2 transition-colors ${activeTab === 'MERCH' ? 'text-white border-dungeon-accent' : 'border-transparent hover:text-white'}`}>SHOP</button>
        </div>

        <div className="mt-8">
           {selectedAlbumId && (
               <div className="mb-6 flex items-center gap-2">
                   <button onClick={() => setSelectedAlbumId(null)} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-bold">
                       <ArrowLeft size={16} /> Back to Albums
                   </button>
                   <span className="text-gray-600">/</span>
                   <span className="text-white font-bold">{performer.albums.find(a => a.id === selectedAlbumId)?.title}</span>
               </div>
           )}

           {activeTab === 'MERCH' && (
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {performer.merch.map(item => (
                     <div key={item.id} className="bg-dungeon-900 border border-white/10 rounded-xl overflow-hidden group">
                        <div className="aspect-square relative">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                           {item.type === 'AUCTION' && (
                              <div className="absolute top-2 right-2 bg-dungeon-accent text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                                 LIVE BID
                              </div>
                           )}
                        </div>
                        <div className="p-4">
                           <h4 className="text-white font-bold mb-1">{item.name}</h4>
                           <div className="flex justify-between items-center">
                              <span className="text-yellow-500 font-bold">{item.price} Tokens</span>
                              <button onClick={() => onBuyMerch(item)} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded">
                                 {item.type === 'AUCTION' ? 'BID NOW' : 'BUY'}
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
                  {performer.merch.length === 0 && <p className="col-span-full text-gray-500">No items available.</p>}
               </div>
           )}

           {activeTab === 'ALBUMS' && !selectedAlbumId ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {performer.albums.map(album => (
                       <div 
                         key={album.id} 
                         onClick={() => setSelectedAlbumId(album.id)}
                         className="aspect-square bg-dungeon-900 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-dungeon-accent group relative"
                       >
                           {album.coverUrl ? (
                               <img src={album.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={album.title} />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-black/40">
                                   <FolderOpen size={48} className="text-gray-600" />
                               </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                               <h4 className="text-white font-bold">{album.title}</h4>
                               <span className="text-xs text-gray-400">{album.itemCount} items</span>
                           </div>
                       </div>
                   ))}
                   {performer.albums.length === 0 && <p className="text-gray-500 col-span-full">No albums created.</p>}
               </div>
           ) : (
               activeTab !== 'MERCH' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayContent.map(item => {
                        const locked = item.isLocked && !isUnlocked(item.id);
                        return (
                        <div key={item.id} className="group relative aspect-[3/4] bg-dungeon-900 rounded-xl overflow-hidden border border-white/5 hover:border-dungeon-accent/50 transition-all shadow-lg cursor-pointer"
                             onClick={() => locked ? setPreviewContent(item) : alert("Viewing content...")}>
                            
                            {/* Image/Thumbnail */}
                            <img 
                            src={item.url || performer.thumbnail} 
                            alt={item.title}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${locked ? 'blur-md grayscale-[50%]' : ''}`} 
                            />
                            
                            {/* Watermark Preview */}
                            {performer.watermarkEnabled && !locked && (
                                <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                                   <Watermark text={performer.watermarkText || 'DUNGEON PROTECTED'} visible={true} className="!opacity-20 !static" />
                                </div>
                            )}
                            
                            {/* Locked Overlay */}
                            {locked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/60 transition-colors duration-300 z-10">
                                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-dungeon-accent shadow-[0_0_15px_rgba(225,29,72,0.4)] mb-2 group-hover:scale-110 transition-transform">
                                        <Lock className="w-6 h-6 text-dungeon-accent" />
                                    </div>
                                    <div className="flex flex-col items-center opacity-90 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-sm tracking-wider drop-shadow-md">PREVIEW</span>
                                        <span className="text-yellow-500 font-bold text-xs mt-1 bg-black/60 px-2 py-0.5 rounded border border-white/10">{item.price} Tokens</span>
                                    </div>
                                </div>
                            )}

                            {/* Content Info (Bottom Gradient) */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20">
                                <div className="text-white font-bold text-sm truncate flex items-center justify-between">
                                    <span>{item.title}</span>
                                </div>
                                <div className="text-xs text-gray-400 uppercase flex items-center gap-1 mt-1">
                                    {item.type === 'VIDEO' ? <Play size={10} className="fill-current" /> : <ImageIcon size={10} />} 
                                    {item.type}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    {displayContent.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                        No content available in this section.
                        </div>
                    )}
                </div>
               )
           )}
        </div>
      </div>

      {previewContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dungeon-950 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative">
            <button onClick={() => setPreviewContent(null)} className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-white/10 text-white p-2 rounded-full transition-colors"><X size={20} /></button>
            
            <div className="relative aspect-[3/4] bg-black group overflow-hidden">
                <img src={previewContent.url || performer.thumbnail} className="w-full h-full object-cover filter blur-xl opacity-50 scale-110 transition-all duration-1000" alt="Preview"/>
                
                {performer.watermarkEnabled && (
                    <Watermark text={performer.watermarkText || 'PROTECTED CONTENT'} visible={true} className="!opacity-30" />
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 pointer-events-none text-center">
                   <div className="w-16 h-16 bg-dungeon-900/80 rounded-full flex items-center justify-center mb-4 border border-dungeon-accent shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                      <Lock className="w-8 h-8 text-dungeon-accent" />
                   </div>
                   <h3 className="text-white font-bold text-xl mb-2">Unlock Content</h3>
                   <p className="text-gray-400 text-xs max-w-[200px]">
                      This {previewContent.type.toLowerCase()} is locked. Pay to reveal the full uncensored version.
                   </p>
                </div>
            </div>

            <div className="p-6 bg-dungeon-900 border-t border-white/5 space-y-4 relative z-20">
                <div className="flex justify-between items-center text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                   <span className="text-gray-400 font-medium">Unlock Price</span>
                   <span className="text-yellow-500 font-bold text-lg flex items-center gap-1">
                      {previewContent.price} <span className="text-xs text-yellow-500/70">TOKENS</span>
                   </span>
                </div>
                <button 
                  onClick={() => { onUnlockContent(previewContent); setPreviewContent(null); }} 
                  className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                >
                   <Lock size={18} /> CONFIRM UNLOCK
                </button>
                <p className="text-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">Secure Transaction</p>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && (
         <OrderModal 
            performer={performer}
            onClose={() => setShowOrderModal(false)}
            onSubmit={handleCreateOrder}
         />
      )}
    </div>
  );
};

export default Profile;
