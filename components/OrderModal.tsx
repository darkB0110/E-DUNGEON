
import React, { useState } from 'react';
import { X, Send, Video, Image, Mic, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Order, Performer } from '../types';

interface OrderModalProps {
  onClose: () => void;
  performer?: Performer; // If creating new order
  existingOrder?: Order; // If viewing existing
  onSubmit?: (order: Partial<Order>) => void;
  onUpdateStatus?: (orderId: string, status: any, price?: number) => void;
  isModelView?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({ 
  onClose, 
  performer, 
  existingOrder, 
  onSubmit, 
  onUpdateStatus,
  isModelView 
}) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'VIDEO'|'PHOTO'|'AUDIO'>('VIDEO');
  const [priceSet, setPriceSet] = useState(500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        type,
        description,
        status: 'PENDING'
      });
    }
  };

  const statusColors = {
    'PENDING': 'text-yellow-500 bg-yellow-500/10',
    'ACCEPTED': 'text-blue-500 bg-blue-500/10',
    'COMPLETED': 'text-green-500 bg-green-500/10',
    'REJECTED': 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dungeon-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X />
        </button>

        <div className="p-6 border-b border-white/5 bg-dungeon-900/50">
           <h2 className="text-xl font-display font-bold text-white">
             {existingOrder ? 'Order Details' : 'Request Custom Content'}
           </h2>
           {performer && <p className="text-sm text-gray-400">For {performer.name}</p>}
        </div>

        <div className="p-6">
           {existingOrder ? (
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <div className={`px-2 py-1 rounded text-xs font-bold ${statusColors[existingOrder.status]}`}>
                     {existingOrder.status}
                   </div>
                   <div className="text-gray-400 text-xs">
                     {new Date(existingOrder.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <div className="bg-black/30 p-3 rounded border border-white/5">
                   <p className="text-gray-300 text-sm italic">"{existingOrder.description}"</p>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                   <span className="text-gray-400 text-sm">Type</span>
                   <span className="text-white font-bold text-sm flex items-center gap-1">
                      {existingOrder.type === 'VIDEO' && <Video size={14}/>}
                      {existingOrder.type === 'PHOTO' && <Image size={14}/>}
                      {existingOrder.type}
                   </span>
                </div>

                {existingOrder.price && (
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-sm">Price</span>
                     <span className="text-yellow-500 font-bold">{existingOrder.price} Tokens</span>
                   </div>
                )}

                {/* Model Actions */}
                {isModelView && existingOrder.status === 'PENDING' && (
                   <div className="mt-4 pt-4 border-t border-white/10">
                      <label className="text-xs text-gray-400 block mb-1">Set Price (Tokens)</label>
                      <div className="flex gap-2">
                        <input 
                           type="number" 
                           value={priceSet} 
                           onChange={e => setPriceSet(Number(e.target.value))}
                           className="bg-black border border-white/10 rounded px-2 py-1 text-white w-24"
                        />
                        <button 
                           onClick={() => onUpdateStatus && onUpdateStatus(existingOrder.id, 'ACCEPTED', priceSet)}
                           className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-xs"
                        >
                           Accept
                        </button>
                        <button 
                           onClick={() => onUpdateStatus && onUpdateStatus(existingOrder.id, 'REJECTED')}
                           className="px-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-xs"
                        >
                           Reject
                        </button>
                      </div>
                   </div>
                )}
                
                {/* Fan Actions */}
                {!isModelView && existingOrder.status === 'ACCEPTED' && (
                    <button className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-2 rounded mt-2">
                       Pay {existingOrder.price} Tokens
                    </button>
                )}

                {existingOrder.status === 'COMPLETED' && existingOrder.deliveryUrl && (
                   <div className="mt-4">
                      <img src={existingOrder.deliveryUrl} className="w-full rounded-lg border border-white/10" alt="Delivery"/>
                      <a href={existingOrder.deliveryUrl} download className="block text-center text-dungeon-accent text-xs mt-2 hover:underline">Download Content</a>
                   </div>
                )}
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Content Type</label>
                  <div className="flex gap-2">
                     {['VIDEO', 'PHOTO', 'AUDIO'].map((t) => (
                       <button
                         key={t}
                         type="button"
                         onClick={() => setType(t as any)}
                         className={`flex-1 py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${type === t ? 'bg-dungeon-accent border-dungeon-accent text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}
                       >
                          {t === 'VIDEO' && <Video size={18}/>}
                          {t === 'PHOTO' && <Image size={18}/>}
                          {t === 'AUDIO' && <Mic size={18}/>}
                          <span className="text-[10px] font-bold">{t}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Instructions</label>
                  <textarea 
                     required
                     className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-dungeon-accent focus:outline-none"
                     rows={4}
                     placeholder="Describe exactly what you want..."
                     value={description}
                     onChange={e => setDescription(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                     Be specific. The model will review this and set a price.
                  </p>
               </div>

               <button type="submit" className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                  <Send size={16} /> Submit Request
               </button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
