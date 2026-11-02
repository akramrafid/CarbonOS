import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CheckCircle2, 
  Building2, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

const INITIAL_FORM = {
  fullName: '',
  workEmail: '',
  phone: '',
  company: '',
  organizationType: 'corporate-esg',
  scale: 'mid-market',
  interest: 'esg-accounting',
  details: '',
};

export const RequestDemoModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [errorMessage, setErrorMessage] = useState('');

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.workEmail.trim() || !formData.company.trim()) {
      setErrorMessage('Please fill in your name, work email, and company.');
      return;
    }

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.workEmail.trim())) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    setStatus('submitting');

    setTimeout(() => {
      try {
        const storedLeads = JSON.parse(localStorage.getItem('carbonzero_demo_leads') || '[]');
        storedLeads.push({
          ...formData,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('carbonzero_demo_leads', JSON.stringify(storedLeads));
      } catch {
        // Continue even if localStorage is inaccessible
      }

      setStatus('success');
    }, 750);
  };

  const handleResetAndClose = () => {
    setStatus('idle');
    setFormData(INITIAL_FORM);
    setErrorMessage('');
    onClose();
  };

  const handleGoToDashboard = () => {
    handleResetAndClose();
    navigate('/platform/saas-dashboard');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div 
        className="bg-[#051108] border border-emerald/30 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,200,83,0.18)] relative max-h-[90vh] overflow-y-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/40 text-emerald flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,200,83,0.25)]">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald bg-emerald/10 border border-emerald/20 px-3 py-1 rounded-full">
                Request Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
                We're Ready to Partner
              </h2>
              <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.fullName}</strong>. Our enterprise team has received your details for <strong className="text-emerald">{formData.company}</strong>. We will contact you at <strong className="text-white">{formData.workEmail}</strong> within 24 hours with your tailored demo environment.
              </p>
            </div>

            <div className="bg-[#0A1F13] border border-emerald/20 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald">
                <ShieldCheck size={14} />
                <span>Next Steps: ISO 14064 & Article 6 Alignment</span>
              </div>
              <p className="text-xs text-white/60">
                You can immediately explore the live ESG & dMRV telemetry preview while we prepare your custom corporate tenant.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto font-sans font-bold text-sm bg-emerald hover:bg-emerald-400 text-carbon px-6 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(0,200,83,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Explore Live ESG Dashboard</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto font-sans text-sm text-white/70 hover:text-white px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="mb-6 space-y-2 pr-8">
              <div className="inline-flex items-center space-x-1.5 font-mono text-[11px] text-emerald bg-emerald/10 border border-emerald/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Enterprise & Project Partnership</span>
              </div>
              <h2 id="demo-modal-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Request Platform Demo
              </h2>
              <p className="text-xs sm:text-sm text-white/60">
                Tell us about your organization to get access to Bangladesh's national carbon MRV and corporate ESG operating system.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/80">
                    Full Name <span className="text-emerald">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Mohammad Tanveer"
                      required
                      className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/80">
                    Work Email <span className="text-emerald">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleChange}
                      placeholder="tanveer@enterprise.com.bd"
                      required
                      className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company / Organization Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/80">
                    Organization / Company <span className="text-emerald">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Apex Holdings Ltd."
                      required
                      className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/80">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+880 1700-000000"
                      className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Type / Work Objective */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/80">
                    Primary Objective
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all cursor-pointer"
                  >
                    <option value="esg-accounting" className="bg-[#051108] text-white">
                      Corporate ESG & Scope 1-3 Accounting
                    </option>
                    <option value="project-developer" className="bg-[#051108] text-white">
                      Carbon Credit Project Developer (Solar/Rice/Mangrove)
                    </option>
                    <option value="credit-buyer" className="bg-[#051108] text-white">
                      Buy Verified Carbon Credits (Offtaker)
                    </option>
                    <option value="supply-chain" className="bg-[#051108] text-white">
                      RMG / Factory Supply Chain Compliance
                    </option>
                    <option value="dmrv-iot" className="bg-[#051108] text-white">
                      IoT & Satellite dMRV Integration
                    </option>
                    <option value="other" className="bg-[#051108] text-white">
                      Other Strategic Collaboration
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/80">
                    Estimated Scale / Scope
                  </label>
                  <select
                    name="scale"
                    value={formData.scale}
                    onChange={handleChange}
                    className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all cursor-pointer"
                  >
                    <option value="enterprise" className="bg-[#051108] text-white">
                      Enterprise (&gt;10,000 tCO₂e / year)
                    </option>
                    <option value="mid-market" className="bg-[#051108] text-white">
                      Mid-Market (1,000 – 10,000 tCO₂e / year)
                    </option>
                    <option value="growing" className="bg-[#051108] text-white">
                      Growing Business (&lt;1,000 tCO₂e / year)
                    </option>
                    <option value="pipeline" className="bg-[#051108] text-white">
                      New Climate Project Developer
                    </option>
                    <option value="audit-gov" className="bg-[#051108] text-white">
                      Auditor / VVB / Government / Research
                    </option>
                  </select>
                </div>
              </div>

              {/* Specific Requirements / Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/80">
                  Project Details or Requirements <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="details"
                  rows={3}
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Share details about your facilities, upcoming reporting deadlines, or carbon project locations..."
                  className="w-full bg-[#030B05] border border-white/10 focus:border-emerald/60 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald/60 transition-all resize-none"
                />
              </div>

              {/* Trust Badge */}
              <div className="flex items-center space-x-2 text-[11px] text-white/50 pt-1">
                <ShieldCheck size={14} className="text-emerald shrink-0" />
                <span>NDA protected. Your operational emissions data is kept strictly private.</span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full font-sans font-bold text-sm bg-emerald hover:bg-emerald-400 text-carbon py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,200,83,0.3)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-carbon" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Demo Request</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDemoModal;

