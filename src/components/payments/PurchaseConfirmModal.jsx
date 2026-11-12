import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Modal from '@/components/ui/Modal';
import PaymentStatusTracker from './PaymentStatusTracker';
import ConfigureStep from './purchase-modal/ConfigureStep';
import PaymentStep from './purchase-modal/PaymentStep';
import CertificateStep from './purchase-modal/CertificateStep';

export const PurchaseConfirmModal = ({ credit, creditId, onClose, onPurchaseComplete }) => {
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
    verification: 'Demo · Verra VM0042 methodology, not registered',
    vintage: '2025/2026'
  };

  const [step, setStep] = useState('configure'); // 'configure' | 'payment' | 'tracking' | 'certificate'
  const [txId, setTxId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSerial, setCopiedSerial] = useState(false);

  // Corporate Details
  const [companyName, setCompanyName] = useState('Apex Footwear Ltd');
  const [taxBin, setTaxBin] = useState('BIN-002941829-0101');
  const [scopeType, setScopeType] = useState('Scope 1 (Direct Facility Fuel & Gas Combustion)');
  const [retireImmediately, setRetireImmediately] = useState(true);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('mfs');
  const [mfsProvider, setMfsProvider] = useState('bKash');
  const [mfsNumber, setMfsNumber] = useState('01712984521');
  const [mfsOTP, setMfsOTP] = useState('');
  const [mfsStep, setMfsStep] = useState('number');

  // Card details
  const [cardName, setCardName] = useState('Apex Corporate Treasury');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('782');

  // Certificate generated details
  const certificateSerial = `DEMO-CZBD-RET-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const verificationHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const settlementDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // 97% direct farmer remittance
  const farmerRemittance = Math.round(activeCredit.price * 0.97);
  const registryFee = activeCredit.price - farmerRemittance;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(verificationHash);
    setCopiedSerial(true);
    setTimeout(() => setCopiedSerial(false), 2000);
  };

  const handleInitiatePayment = () => {
    if (paymentMethod === 'mfs') {
      if (mfsStep === 'number') {
        if (!mfsNumber || mfsNumber.length < 11) {
          alert('Please enter an 11-digit mobile wallet number.');
          return;
        }
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setMfsStep('otp');
        }, 800);
        return;
      }

      if (mfsStep === 'otp') {
        if (!mfsOTP || mfsOTP.length < 4) {
          alert('Please enter the 4-6 digit OTP sent to your device.');
          return;
        }
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setTxId(`TXN-CZBD-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      setStep('tracking');
    }, 1200);
  };

  const handleTrackingComplete = () => {
    if (onPurchaseComplete) {
      onPurchaseComplete({
        credit: activeCredit,
        companyName,
        taxBin,
        scopeType,
        certificateSerial,
        verificationHash,
        amount: activeCredit.price,
        farmerShare: farmerRemittance
      });
    }
    setStep('certificate');
  };

  const handlePrint = () => {
    window.print();
  };

  const stepTitles = {
    configure: 'Corporate Settlement: Configure Allocation',
    payment: 'Corporate Settlement: Payment Authorization',
    tracking: 'Real-Time Settlement Pipeline',
    certificate: 'Official Retirement Certificate'
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={stepTitles[step]}
      subtitle="Demo mode · Simulated retirement and MFS remittance"
      size="lg"
    >
      {step === 'configure' && (
        <ConfigureStep
          isLight={isLight}
          activeCredit={activeCredit}
          farmerRemittance={farmerRemittance}
          companyName={companyName}
          setCompanyName={setCompanyName}
          taxBin={taxBin}
          setTaxBin={setTaxBin}
          scopeType={scopeType}
          setScopeType={setScopeType}
          retireImmediately={retireImmediately}
          setRetireImmediately={setRetireImmediately}
          onProceed={() => setStep('payment')}
        />
      )}

      {step === 'payment' && (
        <PaymentStep
          isLight={isLight}
          activeCredit={activeCredit}
          farmerRemittance={farmerRemittance}
          registryFee={registryFee}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          mfsProvider={mfsProvider}
          setMfsProvider={setMfsProvider}
          mfsNumber={mfsNumber}
          setMfsNumber={setMfsNumber}
          mfsOTP={mfsOTP}
          setMfsOTP={setMfsOTP}
          mfsStep={mfsStep}
          cardName={cardName}
          setCardName={setCardName}
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          cardExpiry={cardExpiry}
          setCardExpiry={setCardExpiry}
          cardCvc={cardCvc}
          setCardCvc={setCardCvc}
          isProcessing={isProcessing}
          onBack={() => setStep('configure')}
          onInitiatePayment={handleInitiatePayment}
        />
      )}

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

          <PaymentStatusTracker transactionId={txId} onComplete={handleTrackingComplete} />

          <div className="text-center pt-4">
            <button
              onClick={() => setStep('certificate')}
              className="text-xs text-emerald underline font-mono hover:text-emerald/80 cursor-pointer"
            >
              Skip Animation to Receipt →
            </button>
          </div>
        </div>
      )}

      {step === 'certificate' && (
        <CertificateStep
          isLight={isLight}
          companyName={companyName}
          taxBin={taxBin}
          activeCredit={activeCredit}
          farmerRemittance={farmerRemittance}
          settlementDate={settlementDate}
          scopeType={scopeType}
          certificateSerial={certificateSerial}
          verificationHash={verificationHash}
          copiedSerial={copiedSerial}
          handleCopyHash={handleCopyHash}
          handlePrint={handlePrint}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};

export default PurchaseConfirmModal;
