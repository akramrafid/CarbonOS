import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Download, 
  Printer, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  QrCode, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import PaymentStatusTracker from './PaymentStatusTracker';
import { useTheme } from '../../context/ThemeContext';

const PurchaseConfirmModal = ({ credit, creditId, onClose, onPurchaseComplete }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Fallback credit object if only creditId was passed
  const activeCredit = credit || {
    id: creditId || 'BD-2026-CR-000142',
    type: 'Solar Irrigation Network',
    region: 'Khulna (Coastal Belt)',
    tonnage: 1.4,
    price: 15400,
    pricePerTonne: 11000,
    status: 'AVAILABLE',
    farmer: 'Rahim Uddin (Coop #12)',
    verification: 'Verra VCS (VM0042)',
    vintage: '2025/2026'
  };

  const [step, setStep] = useState('configure'); // 'configure' | 'payment' | 'tracking' | 'certificate'
  const [txId, setTxId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSerial, setCopiedSerial] = useState(false);

  // Corporate Details
  const [companyName, setCompanyName] = useState('Apex Footwear Ltd');
  const [taxBin, setTaxBin] = useState('BIN-002941829-0101');
  const [scopeType, setScopeType] = useState('Scope 1 (Direct Facility Fuel)');
  const [retireImmediately, setRetireImmediately] = useState(true);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('mfs'); // 'mfs' | 'card' | 'wire'
  const [mfsProvider, setMfsProvider] = useState('bKash'); // 'bKash' | 'Nagad' | 'Rocket'
  const [mfsNumber, setMfsNumber] = useState('01712984521');
  const [mfsOTP, setMfsOTP] = useState('');
  const [mfsStep, setMfsStep] = useState('number'); // 'number' | 'otp'

  // Card details
  const [cardName, setCardName] = useState('Apex Corporate Treasury');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('782');

  // Certificate generated details
  const certificateSerial = `CZBD-RET-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const verificationHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const settlementDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // 97% direct farmer remittance
  const farmerRemittance = Math.round(activeCredit.price * 0.97);
  const registryFee = activeCredit.price - farmerRemittance; // 3%

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(verificationHash);
    setCopiedSerial(true);
    setTimeout(() => setCopiedSerial(false), 2000);
  };

  const handleInitiatePayment = () => {
    if (paymentMethod === 'mfs') {
      if (mfsStep === 'number') {
        if (!mfsNumber || mfsNumber.length < 11) {
          alert("Please enter an 11-digit mobile wallet number.");
          return;
        }
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setMfsStep('otp');
        }, 800);
      } else {
        if (!mfsOTP || mfsOTP.length < 4) {
          alert("Please enter the verification code sent to your mobile.");
          return;
        }
        executeTransaction();
      }
    } else {
      executeTransaction();
    }
  };

  const executeTransaction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newTxId = `TXN-CZBD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setTxId(newTxId);
      setIsProcessing(false);
      setStep('tracking');
    }, 900);
  };

  const handleTrackingComplete = () => {
    if (retireImmediately) {
      setStep('certificate');
    }
    if (onPurchaseComplete) {
      onPurchaseComplete(activeCredit.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative border my-8 transition-colors ${
        isLight 
          ? 'bg-white border-[#dbf0ea]' 
          : 'bg-[#080F0B] border-emerald/30 shadow-[0_0_50px_rgba(0,200,83,0.15)]'
      }`}>

        {/* Modal Header */}
        <div className={`px-6 py-4.5 border-b flex justify-between items-center ${
          isLight ? 'bg-[#f2f3ee] border-[#dbf0ea]' : 'bg-[#0D2B1A]/40 border-white/10'
        }`}>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse"></span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-emerald">
                  CARBON ZERO BD
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-emerald/10 text-emerald-800' : 'bg-emerald/20 text-emerald'
                }`}>
                  INSTITUTIONAL SETTLEMENT
                </span>
              </div>
              <h2 className={`text-lg font-bold ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                {step === 'configure' && "1. Order & Attribution Setup"}
                {step === 'payment' && "2. Institutional Payment Gateway"}
                {step === 'tracking' && "3. Real-Time Settlement Pipeline"}
                {step === 'certificate' && "Official Carbon Retirement Certificate"}
              </h2>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className={`p-2 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: CONFIGURE ATTRIBUTION */}
          {step === 'configure' && (
            <div className="space-y-5">
              {/* Credit Summary Card */}
              <div className={`p-4 rounded-xl border ${
                isLight ? 'bg-[#f2f3ee]/60 border-[#dbf0ea]' : 'bg-[#040A06] border-emerald/20'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded mr-2">
                      {activeCredit.verification}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {activeCredit.id}</span>
                    <h3 className={`text-base font-bold mt-1 ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                      {activeCredit.type}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] text-slate-400 block">TOTAL SETTLEMENT</span>
                    <span className="font-bold text-xl text-emerald">৳{activeCredit.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">VOLUME</span>
                    <span className={`font-semibold ${isLight ? 'text-[#181414]' : 'text-white'}`}>{activeCredit.tonnage} tCO₂e</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">ORIGIN & PRODUCER</span>
                    <span className={`font-semibold truncate block ${isLight ? 'text-[#181414]' : 'text-white'}`}>{activeCredit.region}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">97% FARMER REMITTANCE</span>
                    <span className="font-semibold text-emerald font-mono">৳{farmerRemittance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Corporate Buyer Form */}
              <div className="space-y-3.5">
                <h4 className={`text-xs font-mono font-bold tracking-wider uppercase ${isLight ? 'text-[#181414]' : 'text-white/80'}`}>
                  Corporate Beneficiary Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Company / Entity Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full p-2.5 text-xs rounded-lg border font-medium focus:outline-none focus:border-emerald ${
                        isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#040A06] border-white/10 text-white'
                      }`}
                      placeholder="e.g. Beximco Textiles PLC"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Tax Identification / BIN</label>
                    <input 
                      type="text" 
                      value={taxBin}
                      onChange={(e) => setTaxBin(e.target.value)}
                      className={`w-full p-2.5 text-xs rounded-lg border font-mono focus:outline-none focus:border-emerald ${
                        isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#040A06] border-white/10 text-white'
                      }`}
                      placeholder="BIN-000000000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">GHG Protocol Scope Allocation</label>
                  <select 
                    value={scopeType}
                    onChange={(e) => setScopeType(e.target.value)}
                    className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none focus:border-emerald ${
                      isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#040A06] border-white/10 text-white'
                    }`}
                  >
                    <option value="Scope 1 (Direct Facility Fuel)">Scope 1: Direct Boiler, Generator & Vehicle Fuel</option>
                    <option value="Scope 2 (Market-Based Electricity)">Scope 2: Grid Electricity (Bangladesh National Factor: 0.550 kg CO₂e/kWh)</option>
                    <option value="Scope 3 (Supply Chain & Raw Materials)">Scope 3: Upstream Raw Materials & Supply Chain (EU CBAM Compliant)</option>
                    <option value="Voluntary Corporate Carbon Neutrality">Voluntary: Corporate Net Zero 2026 Commitment</option>
                  </select>
                </div>

                <div className={`p-3 rounded-lg border flex items-start space-x-3 ${
                  isLight ? 'bg-[#dbf0ea]/40 border-[#dbf0ea]' : 'bg-[#0D2B1A]/20 border-emerald/20'
                }`}>
                  <input 
                    type="checkbox" 
                    id="retireImmediately"
                    checked={retireImmediately}
                    onChange={(e) => setRetireImmediately(e.target.checked)}
                    className="mt-0.5 text-emerald focus:ring-emerald rounded"
                  />
                  <label htmlFor="retireImmediately" className="text-xs cursor-pointer">
                    <span className={`font-semibold block ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                      Instantly Retire & Mint Official MoEFCC Certificate
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Permanently retire these credits on the Bangladesh National Registry to prevent double-counting and generate audit proof.
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setStep('payment')}
                className="w-full py-3.5 bg-emerald text-carbon font-bold font-sans rounded-xl hover:bg-emerald/90 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,200,83,0.3)] hover:shadow-[0_0_25px_rgba(0,200,83,0.5)]"
              >
                <span>Continue to Payment (৳{activeCredit.price.toLocaleString()})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 'payment' && (
            <div className="space-y-5">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Institutional Payment Rails
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('mfs')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center space-y-1 ${
                      paymentMethod === 'mfs' 
                        ? 'border-emerald bg-emerald/10 text-emerald' 
                        : isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <Smartphone size={18} />
                    <span className="text-xs font-bold block">Mobile Banking</span>
                    <span className="text-[10px] text-slate-400">bKash / Nagad</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center space-y-1 ${
                      paymentMethod === 'card' 
                        ? 'border-emerald bg-emerald/10 text-emerald' 
                        : isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span className="text-xs font-bold block">Corporate Card</span>
                    <span className="text-[10px] text-slate-400">Visa / Amex</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center space-y-1 ${
                      paymentMethod === 'wire' 
                        ? 'border-emerald bg-emerald/10 text-emerald' 
                        : isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <Building2 size={18} />
                    <span className="text-xs font-bold block">Bank Wire / RTGS</span>
                    <span className="text-[10px] text-slate-400">BACS Clearing</span>
                  </button>
                </div>
              </div>

              {/* MFS Tab Content */}
              {paymentMethod === 'mfs' && (
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isLight ? 'bg-[#f2f3ee]/80 border-[#dbf0ea]' : 'bg-[#040A06] border-emerald/20'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div className="flex space-x-2">
                      {['bKash', 'Nagad', 'Rocket'].map(provider => (
                        <button
                          key={provider}
                          type="button"
                          onClick={() => setMfsProvider(provider)}
                          className={`text-xs px-2.5 py-1 rounded font-bold transition-colors ${
                            mfsProvider === provider 
                              ? 'bg-emerald text-carbon' 
                              : isLight ? 'bg-white text-slate-700' : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded">
                      Direct-to-Farmer Pipeline
                    </span>
                  </div>

                  {mfsStep === 'number' ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-slate-400">
                        {mfsProvider} Corporate / Merchant Account Number
                      </label>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          maxLength="11"
                          value={mfsNumber}
                          onChange={(e) => setMfsNumber(e.target.value.replace(/\D/g, ''))}
                          className={`w-full p-2.5 text-xs font-mono rounded-lg border focus:outline-none focus:border-emerald ${
                            isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                          }`}
                          placeholder="017XXXXXXXX"
                        />
                        <button
                          type="button"
                          onClick={() => setMfsNumber('01712984521')}
                          className="px-2.5 py-1 text-[10px] font-mono bg-white/10 rounded hover:bg-white/20 text-slate-300 shrink-0"
                        >
                          Use Demo No
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Funds settle instantaneously with 97% direct disbursement to {activeCredit.farmer}'s wallet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-slate-400">
                        Enter 6-Digit SMS OTP sent to {mfsNumber}
                      </label>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          maxLength="6"
                          value={mfsOTP}
                          onChange={(e) => setMfsOTP(e.target.value.replace(/\D/g, ''))}
                          className={`w-full p-2.5 text-sm font-mono tracking-widest text-center rounded-lg border focus:outline-none focus:border-emerald ${
                            isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                          }`}
                          placeholder="••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setMfsOTP('729401')}
                          className="px-3 py-1 text-[10px] font-mono bg-emerald/20 text-emerald rounded hover:bg-emerald/30 shrink-0"
                        >
                          Auto-Fill Demo OTP
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Simulated SMS verification code for Bangladesh Mobile Financial Services.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Card Tab Content */}
              {paymentMethod === 'card' && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-[#f2f3ee]/80 border-[#dbf0ea]' : 'bg-[#040A06] border-emerald/20'
                }`}>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className={`w-full p-2 text-xs rounded border ${
                        isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Corporate Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className={`w-full p-2 text-xs font-mono rounded border ${
                        isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Expiry</label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className={`w-full p-2 text-xs font-mono rounded border ${
                          isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">CVC / CVV</label>
                      <input 
                        type="password" 
                        maxLength="4"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className={`w-full p-2 text-xs font-mono rounded border ${
                          isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wire Tab Content */}
              {paymentMethod === 'wire' && (
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                  isLight ? 'bg-[#f2f3ee]/80 border-[#dbf0ea]' : 'bg-[#040A06] border-emerald/20'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="font-mono font-bold text-emerald">Bangladesh Bank RTGS Escrow Account</span>
                    <span className="text-[10px] text-slate-400 font-mono">BACS Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">BENEFICIARY</span>
                      <span className="font-semibold text-white">Carbon Zero BD Escrow A/C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">BANK NAME</span>
                      <span className="font-semibold text-white">Standard Chartered BD / Motijheel</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">ACCOUNT NUMBER</span>
                      <span className="font-semibold text-emerald">01-8492041-01</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">ROUTING NUMBER</span>
                      <span className="font-semibold text-white">215260849</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
              }`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carbon Offset Subtotal ({activeCredit.tonnage} tCO₂e):</span>
                  <span className="font-mono">৳{activeCredit.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald">
                  <span>Direct Farmer Disbursal (97%):</span>
                  <span className="font-mono font-bold">৳{farmerRemittance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>MoEFCC Registry Verification & Gas Fee (3%):</span>
                  <span className="font-mono">৳{registryFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm">
                  <span>Total Amount Due:</span>
                  <span className="text-emerald font-mono">৳{activeCredit.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('configure')}
                  className={`px-4 py-3 rounded-xl font-medium text-xs border ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-emerald text-carbon font-bold font-sans text-xs rounded-xl hover:bg-emerald/90 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,200,83,0.3)] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Authorizing Payment...</span>
                  ) : paymentMethod === 'mfs' ? (
                    mfsStep === 'number' ? `Continue with ${mfsProvider}` : `Confirm & Disburse ৳${activeCredit.price.toLocaleString()}`
                  ) : (
                    `Authorize ৳${activeCredit.price.toLocaleString()} Payment`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LIVE TRACKING */}
          {step === 'tracking' && (
            <div className="py-2 space-y-6">
              <div className="text-center">
                <span className="font-mono text-xs text-emerald tracking-widest uppercase">
                  SMART CONTRACT EXECUTION PIPELINE
                </span>
                <h3 className={`text-xl font-bold mt-1 ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                  Settling 97% to Farmer Wallet
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting corporate capital directly to Bangladesh's climate frontlines.
                </p>
              </div>

              <PaymentStatusTracker 
                transactionId={txId} 
                onComplete={handleTrackingComplete}
              />

              <div className="text-center pt-4">
                <button
                  onClick={() => setStep('certificate')}
                  className="text-xs text-emerald underline font-mono hover:text-emerald/80"
                >
                  Skip Animation to Certificate →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RETIREMENT CERTIFICATE */}
          {step === 'certificate' && (
            <div className="space-y-5 animate-fade-in">
              {/* Certificate Border Box */}
              <div className={`p-6 rounded-2xl border-2 relative overflow-hidden ${
                isLight 
                  ? 'bg-gradient-to-b from-white to-[#f2f3ee] border-emerald/40 shadow-xl' 
                  : 'bg-gradient-to-b from-[#080F0B] to-[#040A06] border-emerald/50 shadow-[0_0_40px_rgba(0,200,83,0.2)]'
              }`}>
                {/* Certificate Watermark / Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald/5 rounded-full blur-2xl pointer-events-none"></div>

                {/* Top Badge */}
                <div className="flex justify-between items-start border-b border-emerald/20 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald font-bold block">
                        SOVEREIGN CLIMATE REGISTRY
                      </span>
                      <h3 className="serif-drama text-lg font-bold text-white tracking-wide">
                        Certificate of Carbon Retirement
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] text-slate-400 block">SERIAL NUMBER</span>
                    <span className="font-mono text-xs font-bold text-emerald">{certificateSerial}</span>
                  </div>
                </div>

                {/* Certificate Statement */}
                <div className="space-y-3 text-xs leading-relaxed my-4">
                  <p className="text-slate-300">
                    This official certificate certifies that <strong className="text-white underline">{companyName}</strong> (BIN: {taxBin}) has permanently retired and neutralized:
                  </p>

                  {/* Highlight Box */}
                  <div className={`p-3.5 rounded-xl border text-center my-3 ${
                    isLight ? 'bg-emerald/5 border-emerald/20' : 'bg-[#0D2B1A]/40 border-emerald/30'
                  }`}>
                    <span className="font-mono text-3xl font-bold text-emerald block">
                      {activeCredit.tonnage} <span className="text-lg">tCO₂e</span>
                    </span>
                    <span className="text-[11px] font-sans text-slate-300">
                      Verified Metric Tonnes of Carbon Dioxide Equivalent
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px]">ORIGIN PROJECT</span>
                      <span className="text-white font-sans font-semibold">{activeCredit.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">RURAL PRODUCER</span>
                      <span className="text-white font-sans font-semibold">{activeCredit.farmer} ({activeCredit.region})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">STANDARD & METHODOLOGY</span>
                      <span className="text-emerald">{activeCredit.verification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">SETTLEMENT DATE</span>
                      <span className="text-white">{settlementDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">GHG PROTOCOL ALLOCATION</span>
                      <span className="text-slate-300 truncate block">{scopeType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">MOBILE BANKING REMITTANCE</span>
                      <span className="text-emerald">৳{farmerRemittance.toLocaleString()} (97% Disbursed)</span>
                    </div>
                  </div>

                  {/* Cryptographic Proof */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <div className="truncate mr-2">
                      <span className="text-slate-500 block">ON-CHAIN VERIFICATION HASH</span>
                      <span className="text-slate-400 truncate block">{verificationHash}</span>
                    </div>
                    <button
                      onClick={handleCopyHash}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 shrink-0"
                      title="Copy Proof Hash"
                    >
                      {copiedSerial ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Footer seal */}
                <div className="flex items-center justify-between pt-3 border-t border-emerald/20 text-[10px] text-slate-400">
                  <span>Ministry of Environment, Forest and Climate Change (MoEFCC) S.R.O. 349 Aligned</span>
                  <span className="font-bold text-emerald">Verified by Carbon Zero BD</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handlePrint}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold font-sans text-xs border flex items-center justify-center space-x-2 transition-colors ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  <Printer size={14} />
                  <span>Print Certificate</span>
                </button>

                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-emerald text-carbon font-bold font-sans text-xs rounded-xl hover:bg-emerald/90 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,200,83,0.3)]"
                >
                  <CheckCircle2 size={14} />
                  <span>Return to Marketplace</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PurchaseConfirmModal;
