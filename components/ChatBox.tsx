
import React, { useState, useEffect, useRef } from 'react';
import { Send, Gift, Smile, Languages, Globe, Settings2, Lock, DollarSign, Pin } from 'lucide-react';
import { ChatMessage, Performer } from '../types';
import { generateCharacterResponse, translateText } from '../services/geminiService';

interface ChatBoxProps {
  performer: Performer;
  externalMessage?: string | null;
  readOnly?: boolean;
  onTip?: (amount: number, label: string) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh', label: 'Chinese' },
  { code: 'sw', label: 'Swahili' },
];

const ChatBox: React.FC<ChatBoxProps> = ({ performer, externalMessage, readOnly = false, onTip }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [targetLang, setTargetLang] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'sys-1',
        sender: 'System',
        text: `Welcome to ${performer.name}'s Dungeon. Be respectful or be banned.`,
        isSystem: true,
        timestamp: Date.now()
      }
    ]);
  }, [performer]);

  // Handle external messages (like kicks/bans)
  useEffect(() => {
    if (externalMessage) {
      setMessages(prev => [...prev, {
        id: 'ext-' + Date.now(),
        sender: 'System',
        text: externalMessage,
        isSystem: true,
        timestamp: Date.now()
      }]);
    }
  }, [externalMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (readOnly || !inputValue.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    if (performer.isAi) {
      setIsTyping(true);
      const history = messages.slice(-5).map(m => `${m.sender}: ${m.text}`);
      
      let responseText = await generateCharacterResponse(
        performer.name,
        performer.description,
        newUserMsg.text,
        history
      );

      if (autoTranslate && targetLang !== 'en') {
        responseText = await translateText(responseText, targetLang);
      }

      setIsTyping(false);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: performer.name,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    }
  };

  const handleQuickTip = (price: number, label: string) => {
    if (readOnly) return;
    if (onTip) {
      onTip(price, label);
      // Optimistic system message
      setMessages(prev => [...prev, {
        id: 'tip-' + Date.now(),
        sender: 'System',
        text: `You tipped ${price} T for ${label}`,
        isSystem: true,
        isTip: true,
        tipAmount: price,
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dungeon-950 border-l border-white/5 relative">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-dungeon-900/50 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
        <h3 className="text-gray-200 font-bold text-sm tracking-wider uppercase">
          Live Chat {readOnly && <span className="text-dungeon-accent text-xs">(Spy Mode)</span>}
        </h3>
        
        {/* Settings Toggle */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* Pinned Tip Menu */}
      {performer.tipMenu && performer.tipMenu.length > 0 && (
        <div className="bg-dungeon-900/80 border-b border-white/5 p-2 shrink-0">
          <div className="flex items-center gap-2 mb-2 px-1">
             <Pin size={12} className="text-dungeon-accent" />
             <span className="text-[10px] font-bold text-dungeon-accent uppercase tracking-widest">Tip Menu</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
             {performer.tipMenu.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickTip(item.price, item.label)}
                  disabled={readOnly}
                  className="flex items-center gap-2 bg-white/5 hover:bg-dungeon-accent hover:text-white border border-white/10 rounded-full px-3 py-1.5 transition-all whitespace-nowrap group disabled:opacity-50"
                >
                   <span className="text-xs font-bold text-gray-200 group-hover:text-white">{item.label}</span>
                   <span className="text-[10px] font-bold bg-black/40 text-yellow-500 px-1.5 rounded-full border border-yellow-500/30 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent">
                     {item.price}
                   </span>
                </button>
             ))}
          </div>
        </div>
      )}

      {/* Translation Settings Overlay */}
      {showSettings && (
         <div className="absolute top-14 left-0 right-0 bg-dungeon-900 border-b border-white/10 p-4 z-20 shadow-xl">
             <div className="flex items-center justify-between mb-3">
               <span className="text-xs font-bold text-white flex items-center gap-2">
                 <Languages size={14} /> Auto-Translation
               </span>
               <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="toggle" 
                    id="toggle" 
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-dungeon-accent right-4"
                  />
                  <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${autoTranslate ? 'bg-dungeon-accent' : 'bg-gray-700'}`}></label>
               </div>
             </div>
             
             {autoTranslate && (
               <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Translate Incoming To:</label>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
               </div>
             )}
         </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center my-4' : 'items-start'}`}>
            {msg.isSystem ? (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border text-center ${msg.isTip ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-dungeon-accent/10 border-dungeon-accent/20 text-dungeon-accent/80'}`}>
                {msg.text}
              </span>
            ) : (
              <div className="break-words max-w-[90%]">
                <span className={`text-xs font-bold mr-2 ${msg.sender === performer.name ? 'text-dungeon-accent' : 'text-gray-400'}`}>
                  {msg.sender}:
                </span>
                <span className={`text-sm ${msg.sender === performer.name ? 'text-white' : 'text-gray-300'}`}>
                  {msg.text}
                </span>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
           <div className="flex items-center gap-1 pl-2">
             <span className="text-xs text-dungeon-accent font-bold">{performer.name} is typing</span>
             <div className="flex gap-1">
               <span className="w-1 h-1 bg-dungeon-accent rounded-full animate-bounce"></span>
               <span className="w-1 h-1 bg-dungeon-accent rounded-full animate-bounce delay-75"></span>
               <span className="w-1 h-1 bg-dungeon-accent rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        
        {autoTranslate && (
          <div className="text-[10px] text-center text-gray-600 italic mt-2 sticky bottom-0 bg-dungeon-950/80 p-1">
            Translating to {LANGUAGES.find(l => l.code === targetLang)?.label}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-dungeon-900 border-t border-white/5 shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          {readOnly && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center border border-dungeon-accent/30">
               <div className="text-xs font-bold text-white flex items-center gap-1">
                  <Lock size={12} className="text-dungeon-accent"/> Chat locked in Spy Mode
               </div>
            </div>
          )}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={readOnly ? "Spying..." : "Say something nice..."}
            disabled={readOnly}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-dungeon-accent/50 focus:ring-1 focus:ring-dungeon-accent/50 transition-all placeholder-gray-600 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={readOnly}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-dungeon-accent transition-colors disabled:opacity-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
