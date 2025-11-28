
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Check, ShieldCheck, Bitcoin, Wallet, ArrowRight } from 'lucide-react';
import Loader from './Loader';
import { PaymentMethod } from '../types';

interface WalletModalProps {
  onClose: () => void;
  onPurchase: (amount: number) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose, onPurchase }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('VISA');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'PHONE_INPUT' | 'PROCESSING' | 'CRYPTO_CONNECT'>('SELECT');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  
  // Real Crypto Prices State
  const [cryptoPrices, setCryptoPrices] = useState<{bitcoin: {usd: number}, ethereum: {usd: number}} | null>(null);

  useEffect(() => {
    // Fetch live prices from CoinGecko Free API
    const fetchPrices = async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
            const data = await res.json();
            setCryptoPrices(data);
        } catch (e) {
            console.error("Failed to fetch crypto prices");
        }
    };
    fetchPrices();
  }, []);

  const packages = [
    { tokens: 100, price: 4.99 },
    { tokens: 500, price: 19.99, popular: true },
    { tokens: 1000, price: 34.99 },
    { tokens: 5000, price: 149.99 },
  ];

  const methods: { id: PaymentMethod; label: string; color: string; icon: any }[] = [
    { id: 'VISA', label: 'Visa / Mastercard', color: 'bg-blue-600', icon: CreditCard },
    { id: 'MPESA', label: 'M-Pesa', color: 'bg-green-600', icon: Smartphone },
    { id: 'AIRTEL', label: 'Airtel Money', color: 'bg-red-600', icon: Smartphone },
    { id: 'MTN', label: 'MTN Mobile', color: 'bg-yellow-500 text-black', icon: Smartphone },
    { id: 'CRYPTO', label: 'Crypto / NFT', color: 'bg-orange-500', icon: Bitcoin },
  ];

  const handleBuy = (tokens: number) => {
    setSelectedPackage(tokens);
    if (selectedMethod === 'VISA') {
      processPayment(tokens);
    } else if (selectedMethod === 'CRYPTO') {
      setStep('CRYPTO_CONNECT');
    } else {
      setStep('PHONE_INPUT');
    }
  };

  const processPayment = (tokens: number) => {
    setStep('PROCESSING');
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onPurchase(tokens);
      setLoading(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dungeon-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X />
        </button>
        
        <div className="p-6 bg-gradient-to-b from-dungeon-900 to-dungeon-950 border-b border-white/5">
          <h2 className="text-2xl font-display font-bold text-white mb-1">Replenish Tokens</h2>
          <p className="text-gray-400 text-sm">Secure USD & Crypto payments.</p>
        </div>

        {step === 'PROCESSING' ? (
          <div className="h-80 flex flex-col items-center justify-center p-6 text-center">
            <Loader text={`Confirming ${selectedMethod}...`} />
            <p className="text-xs text-gray-500 mt-4">Please wait...</p>
          </div>
        ) : step === 'CRYPTO_CONNECT' ? (
           <div className="p-6 space-y-6 text-center">
             <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/50">
               <Wallet className="text-orange-500 w-8 h-8" />
             </div>
             <h3 className="text-white font-bold text-xl">Connect Wallet</h3>
             <p className="text-gray-400 text-sm">Pay anonymously using Bitcoin, ETH, or USDT.</p>
             
             {cryptoPrices && selectedPackage && (
                 <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm">
                     <div className="flex justify-between text-gray-300">
                         <span>BTC Price:</span>
                         <span className="text-white font-mono">${cryptoPrices.bitcoin.usd.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-gray-300">
                         <span>ETH Price:</span>
                         <span className="text-white font-mono">${cryptoPrices.ethereum.usd.toLocaleString()}</span>
                     </div>
                     <hr className="border-white/10 my-2" />
                     <div className="flex justify-between text-dungeon-accent font-bold">
                         <span>Total (ETH):</span>
                         <span>Ξ {((packages.find(p => p.tokens === selectedPackage)?.price || 0) / cryptoPrices.ethereum.usd).toFixed(6)}</span>
                     </div>
                 </div>
             )}

             <button onClick={() => processPayment(selectedPackage!)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <Bitcoin size={18} /> Pay with MetaMask / WalletConnect
             </button>
             <button onClick={() => setStep('SELECT')} className="text-sm text-gray-500 hover:text-white">Back</button>
           </div>
        ) : step === 'PHONE_INPUT' ? (
           <div className="p-6 space-y-6">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${methods.find(m => m.id === selectedMethod)?.color}`}>
                   <Smartphone className="text-white w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg">Enter {methods.find(m => m.id === selectedMethod)?.label} Number</h3>
                <p className="text-gray-400 text-sm">We will send a payment prompt to your phone.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+254..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none font-mono text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setStep('SELECT')} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-lg font-bold">
                    Back
                 </button>
                 <button 
                    onClick={() => selectedPackage && processPayment(selectedPackage)}
                    disabled={!phoneNumber}
                    className="flex-1 bg-dungeon-accent hover:bg-rose-700 text-white py-3 rounded-lg font-bold disabled:opacity-50"
                 >
                    Pay
                 </button>
              </div>
           </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Payment Method Selector */}
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Payment Method</label>
               <div className="grid grid-cols-3 gap-2">
                  {methods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2 ${selectedMethod === method.id ? 'bg-white/10 border-dungeon-accent text-white' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'}`}
                    >
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${method.color}`}>
                          <method.icon className={`w-4 h-4 ${method.id === 'MTN' ? 'text-black' : 'text-white'}`} />
                       </div>
                       <span className="text-[10px] font-bold text-center leading-tight">{method.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.tokens}
                  onClick={() => handleBuy(pkg.tokens)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${pkg.popular ? 'bg-dungeon-900/50 border-dungeon-accent/50 hover:bg-dungeon-900' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 group-hover:bg-yellow-500/20">
                      <span className="text-yellow-500 font-bold">T</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white">{pkg.tokens} Tokens</div>
                      {pkg.popular && <span className="text-[10px] text-dungeon-accent uppercase font-bold tracking-wider">Most Popular</span>}
                    </div>
                  </div>
                  <div className="font-bold text-xl text-white">
                    ${pkg.price}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4 items-center justify-center text-gray-500 text-xs mt-4">
              <span className="flex items-center gap-1"><ShieldCheck size={12}/> SSL Secure</span>
              <span className="flex items-center gap-1">NFT Gated</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
