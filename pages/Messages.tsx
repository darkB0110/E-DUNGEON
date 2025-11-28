


import React, { useState, useEffect, useRef } from 'react';
import { Mail, Search, Paperclip, Send, Image, DollarSign, Lock, ArrowLeft, Video, Check, Coins } from 'lucide-react';
import { User, MessageThread, DirectMessage } from '../types';
import { backend } from '../services/backend';

interface MessagesProps {
  currentUser: User | null;
  onBack: () => void;
}

const Messages: React.FC<MessagesProps> = ({ currentUser, onBack }) => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Attachments State
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [attachmentPrice, setAttachmentPrice] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
       loadThreads();
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeThreadId && currentUser) {
        loadHistory(activeThreadId);
    }
  }, [activeThreadId, currentUser]);

  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const loadThreads = async () => {
     if (!currentUser) return;
     const t = await backend.messages.getThreads(currentUser.id);
     setThreads(t);
  };

  const loadHistory = async (otherId: string) => {
      if (!currentUser) return;
      const msgs = await backend.messages.getHistory(currentUser.id, otherId);
      setMessages(msgs);
  };

  const handleSendMessage = async () => {
      if (!currentUser || !activeThreadId || (!inputText && !attachmentType)) return;

      const newMsg: DirectMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          receiverId: activeThreadId,
          text: inputText,
          timestamp: Date.now(),
          isRead: false,
          isLocked: attachmentPrice > 0,
          unlockPrice: attachmentPrice > 0 ? attachmentPrice : undefined,
          mediaUrl: attachmentType ? `https://picsum.photos/seed/${Date.now()}/400/300` : undefined,
          mediaType: attachmentType || undefined
      };

      await backend.messages.send(newMsg);
      setMessages([...messages, newMsg]);
      setInputText('');
      setAttachmentType(null);
      setAttachmentPrice(0);
      setShowAttachModal(false);
      
      // Update thread preview immediately
      setThreads(prev => prev.map(t => t.id === activeThreadId ? {
          ...t, 
          lastMessage: newMsg.isLocked ? '🔒 Locked Content' : newMsg.text,
          timestamp: newMsg.timestamp 
      } : t));
  };

  const handleUnlockMessage = async (msg: DirectMessage) => {
      if (!currentUser || !msg.unlockPrice) return;
      
      if (currentUser.role === 'ADMIN' || backend.auth.getCurrentUser()?.unlockedMessages?.includes(msg.id)) {
          alert("Already unlocked or Admin override");
          return;
      }

      if (window.confirm(`Unlock this content for ${msg.unlockPrice} Tokens?`)) {
          const success = await backend.messages.unlock(currentUser.id, msg.id, msg.unlockPrice);
          if (success) {
              // Refresh user to get updated token balance/unlocked list
              const updatedUser = backend.auth.getCurrentUser(); // Fetch fresh state
              // Force refresh messages view? Or just local state update?
              // Ideally pass setCurrentUser up or re-fetch
              alert("Unlocked!");
              // Hacky local update for UI
              const updatedMsg = { ...msg, isLocked: false }; // Only visually for now, backend logic handles real check
              setMessages(msgs => msgs.map(m => m.id === msg.id ? { ...m, isLocked: false } : m));
          } else {
              alert("Insufficient funds!");
          }
      }
  };

  // Helper to check if message is unlocked
  const isMsgUnlocked = (msg: DirectMessage) => {
      if (!msg.isLocked) return true;
      if (currentUser?.role === 'ADMIN') return true;
      if (currentUser?.id === msg.senderId) return true;
      if (currentUser?.unlockedMessages?.includes(msg.id)) return true;
      return false;
  };

  const activeParticipant = threads.find(t => t.id === activeThreadId)?.participant;

  return (
    <div className="flex h-screen bg-dungeon-950 pt-16 md:pt-0">
       {/* Thread List */}
       <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/5 bg-black/20">
             <div className="flex items-center gap-3 mb-4">
                 <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
                     <ArrowLeft size={20} />
                 </button>
                 <h2 className="text-white font-bold text-lg flex items-center gap-2"><Mail size={20}/> Messages</h2>
             </div>
             
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"/>
                <input type="text" placeholder="Search..." className="w-full bg-dungeon-900 border border-white/10 rounded-full pl-9 py-2 text-sm text-white focus:outline-none focus:border-dungeon-accent"/>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {threads.length === 0 && (
                 <div className="p-8 text-center text-gray-500 text-sm">No messages yet.</div>
             )}
             {threads.map(thread => (
                <div 
                   key={thread.id} 
                   onClick={() => setActiveThreadId(thread.id)}
                   className={`p-4 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 ${activeThreadId === thread.id ? 'bg-white/10' : ''}`}
                >
                   <div className="relative">
                      <img src={thread.participant.avatar} className="w-12 h-12 rounded-full object-cover" alt="Avatar" />
                      {thread.unreadCount > 0 && <div className="absolute top-0 right-0 w-4 h-4 bg-dungeon-accent rounded-full border-2 border-black flex items-center justify-center text-[8px] text-white font-bold">{thread.unreadCount}</div>}
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                         <h4 className="font-bold text-white text-sm">{thread.participant.name}</h4>
                         <span className="text-[10px] text-gray-500">{new Date(thread.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-400'}`}>
                          {thread.lastMessage}
                      </p>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Chat Area */}
       <div className={`flex-1 flex flex-col bg-black/40 ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
           {activeThreadId && activeParticipant ? (
               <>
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-dungeon-900/50">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setActiveThreadId(null)} className="md:hidden text-white">
                              <ArrowLeft size={20} />
                          </button>
                          <img src={activeParticipant.avatar} className="w-8 h-8 rounded-full object-cover"/>
                          <div>
                              <h3 className="text-white font-bold">{activeParticipant.name}</h3>
                              <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"/> Online</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                      {messages.map(msg => {
                          const isMe = msg.senderId === currentUser?.id;
                          const unlocked = isMsgUnlocked(msg);

                          return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-dungeon-accent text-white rounded-tr-none' : 'bg-dungeon-800 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                    
                                    {/* Media Attachment */}
                                    {msg.mediaUrl && (
                                        <div className="mb-2 rounded-lg overflow-hidden relative">
                                            <div className={`relative ${!unlocked ? 'blur-lg' : ''}`}>
                                                <img src={msg.mediaUrl} className="max-w-full h-auto" />
                                            </div>
                                            
                                            {!unlocked && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                                                    <Lock size={24} className="text-dungeon-accent mb-1"/>
                                                    <span className="text-xs font-bold text-white uppercase mb-2">PPV Content</span>
                                                    <button 
                                                        onClick={() => handleUnlockMessage(msg)}
                                                        className="bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-1.5 px-4 rounded-full text-xs flex items-center gap-1 shadow-lg"
                                                    >
                                                        Unlock {msg.unlockPrice} T
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                    <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        {isMe && <Check size={10}/>}
                                    </div>
                                 </div>
                              </div>
                          );
                      })}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-dungeon-900 border-t border-white/5">
                      {showAttachModal && (
                          <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-auto md:w-96 bg-dungeon-950 border border-white/10 rounded-xl p-4 shadow-2xl z-20">
                             <div className="flex justify-between items-center mb-3">
                                 <h4 className="text-white font-bold text-sm">Attach Media (PPV)</h4>
                                 <button onClick={() => setShowAttachModal(false)}><ArrowLeft size={16} className="text-gray-500 hover:text-white"/></button>
                             </div>
                             
                             <div className="flex gap-2 mb-4">
                                <button 
                                   onClick={() => setAttachmentType('IMAGE')}
                                   className={`flex-1 py-3 rounded border flex flex-col items-center gap-1 ${attachmentType === 'IMAGE' ? 'bg-dungeon-accent border-dungeon-accent text-white' : 'bg-black border-white/10 text-gray-400'}`}
                                >
                                   <Image size={18}/> <span className="text-xs">Photo</span>
                                </button>
                                <button 
                                   onClick={() => setAttachmentType('VIDEO')}
                                   className={`flex-1 py-3 rounded border flex flex-col items-center gap-1 ${attachmentType === 'VIDEO' ? 'bg-dungeon-accent border-dungeon-accent text-white' : 'bg-black border-white/10 text-gray-400'}`}
                                >
                                   <Video size={18}/> <span className="text-xs">Video</span>
                                </button>
                             </div>

                             <div className="mb-4">
                                 <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Price (0 for free)</label>
                                 <div className="relative">
                                     <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                                     <input 
                                       type="number" 
                                       value={attachmentPrice}
                                       onChange={e => setAttachmentPrice(Number(e.target.value))}
                                       className="w-full bg-black border border-white/10 rounded-lg pl-8 py-2 text-white text-sm"
                                     />
                                 </div>
                             </div>
                             
                             <button 
                                onClick={handleSendMessage}
                                className="w-full bg-white text-black font-bold py-2 rounded"
                             >
                                Send Attachment
                             </button>
                          </div>
                      )}

                      <div className="flex gap-2 items-end">
                         <button 
                            onClick={() => setShowAttachModal(!showAttachModal)}
                            className={`p-3 rounded-full transition-colors ${attachmentType ? 'bg-dungeon-accent text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                         >
                             {attachmentType ? <Check size={20}/> : <Paperclip size={20}/>}
                         </button>
                         <div className="flex-1 bg-black border border-white/10 rounded-2xl flex items-center">
                             <input 
                                type="text" 
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Message..." 
                                className="w-full bg-transparent border-none px-4 py-3 text-sm text-white focus:outline-none focus:ring-0"
                             />
                             <button className="p-2 mr-2 text-gray-400 hover:text-white">
                                <DollarSign size={20}/>
                             </button>
                         </div>
                         <button 
                            onClick={handleSendMessage}
                            disabled={!inputText && !attachmentType}
                            className="bg-dungeon-accent hover:bg-rose-700 text-white p-3 rounded-full disabled:opacity-50 transition-all"
                         >
                            <Send size={20}/>
                         </button>
                      </div>
                  </div>
               </>
           ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                   <Mail size={48} className="mb-4 opacity-50"/>
                   <p>Select a conversation to start chatting</p>
               </div>
           )}
       </div>
    </div>
  );
};

export default Messages;