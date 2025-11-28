
import React, { useState } from 'react';
import { User } from '../types';
import Loader from '../components/Loader';
import { Upload, CheckCircle, ShieldCheck, User as UserIcon, MapPin, Calendar, ArrowLeft, FileText, Camera, RefreshCw, Chrome } from 'lucide-react';
import { COUNTRIES } from '../constants';
import { backend } from '../services/backend';

interface AuthModelProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const AuthModel: React.FC<AuthModelProps> = ({ onLogin, onBack }) => {
  const [step, setStep] = useState<'FORM' | 'DETAILS' | 'VERIFY' | 'SUCCESS'>('FORM');
  const [verifying, setVerifying] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  
  // Basic Account
  const [basicData, setBasicData] = useState({
    stageName: '',
    email: '',
    password: '',
  });

  // Verification Data
  const [verifyData, setVerifyData] = useState({
    realName: '',
    dob: '',
    gender: 'Female',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    consentAge: false,
    consentContract: false,
    consentW9: false
  });

  // Document Upload Status
  const [docs, setDocs] = useState({
    idFront: false,
    idBack: false,
    selfie: false
  });
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Calculate max date for 18+ (Today minus 18 years)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('DETAILS');
  };

  const handleGoogleSignup = async () => {
     setLoadingGoogle(true);
     try {
         // Create a Model account via Google
         // Note: This will likely be "Verification Pending" state immediately
         const user = await backend.auth.loginWithGoogle('MODEL');
         onLogin(user);
     } catch (e) {
         setLoadingGoogle(false);
         alert("Google Sign-in failed");
     }
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(verifyData.dob);
    if (age < 18) {
      alert("Strict Age Gate: You must be at least 18 years old to join.");
      return;
    }
    if (!verifyData.consentAge || !verifyData.consentContract || !verifyData.consentW9) return;
    setStep('VERIFY');
  };

  const simulateUpload = (type: 'idFront' | 'idBack' | 'selfie') => {
    setUploadingDoc(type);
    setTimeout(() => {
      setDocs(prev => ({ ...prev, [type]: true }));
      setUploadingDoc(null);
    }, 1500);
  };

  const handleFinalSubmit = () => {
    if (!docs.idFront || !docs.idBack || !docs.selfie) {
      alert("Please upload all required documents to proceed.");
      return;
    }

    setVerifying(true);
    // Simulate ID verification API
    setTimeout(() => {
      setVerifying(false);
      setStep('SUCCESS');
    }, 3000);
  };

  const finishRegistration = async () => {
    try {
     const newUser = await backend.auth.register({
        id: '', // Backend assigns
        username: basicData.stageName,
        email: basicData.email,
        role: 'MODEL',
        tokens: 0,
        isVerified: false, // Set to FALSE for approval
        subscriptions: [],
        favorites: [],
        following: [],
        unlockedStreams: [],
        unlockedContent: [],
        purchasedMerch: [],
        realInfo: {
            realName: verifyData.realName,
            dob: verifyData.dob,
            age: calculateAge(verifyData.dob),
            gender: verifyData.gender,
            address: `${verifyData.street}, ${verifyData.city}, ${verifyData.state} ${verifyData.zip}, ${verifyData.country}`
        }
      });
      onLogin(newUser);
    } catch (e) {
      alert("Error creating account");
    }
  };

  if (loadingGoogle) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-dungeon-950">
              <Loader text="SYNCING WITH GOOGLE..." />
          </div>
      )
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4 relative py-12">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm hidden md:inline">Back</span>
      </button>

      <div className="w-full max-w-xl bg-dungeon-900/50 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        
        {step === 'FORM' && (
          <>
             <h2 className="text-3xl font-display font-bold text-center mb-2 text-white">Become a <span className="text-dungeon-accent">Creator</span></h2>
             <p className="text-center text-gray-400 mb-8">Sign up & start monetizing</p>
             
             {/* Google Sign In */}
             <button 
                type="button"
                onClick={handleGoogleSignup}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 mb-6"
            >
                <Chrome size={20} className="text-blue-600" /> 
                Continue with Gmail
            </button>
             
            <div className="flex items-center gap-4 text-xs text-gray-500 uppercase font-bold mb-6">
                <div className="h-px bg-white/10 flex-1"></div>
                OR USE EMAIL
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

             <form onSubmit={handleBasicSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stage Name</label>
                  <input type="text" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none" 
                    value={basicData.stageName} onChange={e => setBasicData({...basicData, stageName: e.target.value})} placeholder="e.g. Mistress V" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                  <input type="email" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none" 
                     value={basicData.email} onChange={e => setBasicData({...basicData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
                  <input type="password" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-dungeon-accent focus:outline-none" 
                     value={basicData.password} onChange={e => setBasicData({...basicData, password: e.target.value})} />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button type="submit" className="w-full bg-dungeon-accent hover:bg-rose-700 text-white font-bold py-3 rounded-lg">
                    NEXT: IDENTITY DETAILS
                  </button>
                </div>
             </form>
          </>
        )}

        {step === 'DETAILS' && (
          <>
             <h2 className="text-2xl font-display font-bold text-center mb-2 text-white">Legal Verification</h2>
             <p className="text-center text-gray-400 text-sm mb-6">Your personal data is encrypted and used solely for age verification and payouts.</p>
             <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Legal Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                        <input type="text" required className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white text-sm" 
                           placeholder="Matches ID"
                           value={verifyData.realName} onChange={e => setVerifyData({...verifyData, realName: e.target.value})} />
                      </div>
                   </div>
                   <div className="w-1/3">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        required 
                        max={maxDate}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm" 
                        value={verifyData.dob} 
                        onChange={e => setVerifyData({...verifyData, dob: e.target.value})} 
                      />
                   </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender</label>
                    <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm"
                        value={verifyData.gender} onChange={e => setVerifyData({...verifyData, gender: e.target.value})}>
                            <option>Female</option>
                            <option>Male</option>
                            <option>Trans Female</option>
                            <option>Trans Male</option>
                            <option>Non-Binary</option>
                            <option>Couple</option>
                    </select>
                </div>

                <div className="space-y-3 pt-2">
                   <label className="block text-xs font-bold text-gray-400 uppercase">Physical Address</label>
                   <input type="text" required placeholder="Street Address" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm" 
                       value={verifyData.street} onChange={e => setVerifyData({...verifyData, street: e.target.value})} />
                   
                   <div className="flex gap-2">
                      <input type="text" required placeholder="City" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm" 
                         value={verifyData.city} onChange={e => setVerifyData({...verifyData, city: e.target.value})} />
                      <input type="text" required placeholder="State/Prov" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm" 
                         value={verifyData.state} onChange={e => setVerifyData({...verifyData, state: e.target.value})} />
                   </div>
                   <div className="flex gap-2">
                      <input type="text" required placeholder="Zip/Postal" className="w-1/3 bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm" 
                         value={verifyData.zip} onChange={e => setVerifyData({...verifyData, zip: e.target.value})} />
                      <select required className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm"
                         value={verifyData.country} onChange={e => setVerifyData({...verifyData, country: e.target.value})}>
                          {COUNTRIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2 pt-2 bg-black/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" required checked={verifyData.consentAge} onChange={e => setVerifyData({...verifyData, consentAge: e.target.checked})} />
                    <label className="text-xs text-gray-400">I confirm I am 18 years of age or older.</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" required checked={verifyData.consentContract} onChange={e => setVerifyData({...verifyData, consentContract: e.target.checked})} />
                    <label className="text-xs text-gray-400">I agree to the Model Contract & Platform Terms.</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" required checked={verifyData.consentW9} onChange={e => setVerifyData({...verifyData, consentW9: e.target.checked})} />
                    <label className="text-xs text-gray-400">I certify my Tax info (W-9/W-8BEN) is correct.</label>
                  </div>
                </div>

                <div className="flex gap-3">
                   <button type="button" onClick={() => setStep('FORM')} className="flex-1 bg-white/5 text-gray-300 py-3 rounded-lg font-bold">Back</button>
                   <button type="submit" className="flex-1 bg-dungeon-accent text-white py-3 rounded-lg font-bold">Next: Documents</button>
                </div>
             </form>
          </>
        )}

        {step === 'VERIFY' && (
          <div className="text-center">
             {verifying ? (
               <Loader text="VALIDATING IDENTITY..." />
             ) : (
               <div className="space-y-6">
                 <div className="flex justify-center">
                    <ShieldCheck className="w-12 h-12 text-dungeon-accent" />
                 </div>
                 <h2 className="text-2xl font-bold text-white">Document Verification</h2>
                 <p className="text-gray-400 text-sm px-4">
                   Please provide a valid Government ID to prove your age and identity.
                 </p>
                 
                 <div className="space-y-3">
                    {/* ID Front */}
                    <div 
                        onClick={() => !docs.idFront && simulateUpload('idFront')}
                        className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer ${docs.idFront ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-dungeon-accent'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.idFront ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                {uploadingDoc === 'idFront' ? <RefreshCw className="animate-spin w-5 h-5"/> : docs.idFront ? <CheckCircle size={20}/> : <FileText size={20}/>}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white text-sm">Government ID (Front)</div>
                                <div className="text-xs text-gray-500">Visible photo & text</div>
                            </div>
                        </div>
                        {!docs.idFront && <Upload size={16} className="text-gray-500" />}
                    </div>

                    {/* ID Back */}
                    <div 
                        onClick={() => !docs.idBack && simulateUpload('idBack')}
                        className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer ${docs.idBack ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-dungeon-accent'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.idBack ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                {uploadingDoc === 'idBack' ? <RefreshCw className="animate-spin w-5 h-5"/> : docs.idBack ? <CheckCircle size={20}/> : <FileText size={20}/>}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white text-sm">Government ID (Back)</div>
                                <div className="text-xs text-gray-500">Scan of barcode/text</div>
                            </div>
                        </div>
                        {!docs.idBack && <Upload size={16} className="text-gray-500" />}
                    </div>

                    {/* Selfie */}
                    <div 
                        onClick={() => !docs.selfie && simulateUpload('selfie')}
                        className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer ${docs.selfie ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-dungeon-accent'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.selfie ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                {uploadingDoc === 'selfie' ? <RefreshCw className="animate-spin w-5 h-5"/> : docs.selfie ? <CheckCircle size={20}/> : <Camera size={20}/>}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white text-sm">Verification Selfie</div>
                                <div className="text-xs text-gray-500">Holding ID next to face</div>
                            </div>
                        </div>
                        {!docs.selfie && <Upload size={16} className="text-gray-500" />}
                    </div>
                 </div>

                 <div className="flex gap-3">
                    <button onClick={() => setStep('DETAILS')} className="flex-1 text-sm text-gray-500 hover:text-white py-3">Back</button>
                    <button 
                        onClick={handleFinalSubmit} 
                        disabled={!docs.idFront || !docs.idBack || !docs.selfie || !!uploadingDoc}
                        className="flex-1 bg-dungeon-accent disabled:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg"
                    >
                        Submit for Review
                    </button>
                 </div>
               </div>
             )}
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center space-y-6">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
               <CheckCircle className="w-10 h-10 text-green-500" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white">Application Received</h2>
               <p className="text-gray-400 text-sm mt-2">
                 Welcome to the Dungeon, {basicData.stageName}. Your documents have been submitted securely.
               </p>
             </div>
             <button onClick={finishRegistration} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 shadow-lg transform hover:scale-[1.02] transition-transform">
               CHECK APPLICATION STATUS
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModel;
