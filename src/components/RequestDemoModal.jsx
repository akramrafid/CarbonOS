import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // [COMMENTED OUT FOR PERSONAL REFERENCE — /api/request-demo/ endpoint does not exist; prepare transparent local mailto draft instead of faking submission]
    // try {
    //   const response = await fetch('/api/request-demo/', {
    //     method: 'POST', ...
    //   });
    //   ...
    // } catch {
    //   setStatus('success');
    // }
    setStatus('success');
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Request Enterprise Demo"
      subtitle="Speak with a carbon markets & ESG compliance specialist."
      size="lg"
    >
      {status === 'success' ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-sans font-bold text-xl text-white">
            Briefing Inquiry Prepared Locally
          </h3>
          <p className="font-sans text-sm text-mist max-w-md mx-auto">
            This demo UI does not auto-transmit form leads to a CRM server. Open your email client below to send the pre-filled inquiry for {formData.company || 'your organization'}.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:contact@carbonzerobd.com?subject=${encodeURIComponent(`CarbonOS Briefing Request — ${formData.company || formData.fullName}`)}&body=${encodeURIComponent(`Name: ${formData.fullName}\nWork Email: ${formData.workEmail}\nOrganization: ${formData.company}\nInterest: ${formData.interest}\nScale: ${formData.scale}\nNotes: ${formData.details}`)}`}
              className="inline-flex items-center justify-center rounded-xl bg-emerald px-5 py-2.5 text-xs font-semibold text-fg-inverse hover:bg-emerald/90 transition-colors"
            >
              Open Pre-filled Email
            </a>
            <Button variant="secondary" onClick={handleReset}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-mist mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Tanvir Hossain"
                className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-mist mb-1">Work Email *</label>
              <input
                type="email"
                name="workEmail"
                required
                value={formData.workEmail}
                onChange={handleChange}
                placeholder="tanvir@enterprise.com.bd"
                className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-mist mb-1">Organization *</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Apex Group / Beximco"
                className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-mist mb-1">Direct Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880 1712-345678"
                className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-mist mb-1">Primary Interest</label>
              <select
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-carbon text-white cursor-pointer"
              >
                <option value="esg-accounting">Corporate ESG & Dual Scope 2</option>
                <option value="mrv-satellite">Satellite dMRV Ground Truth</option>
                <option value="carbon-registry">Sovereign Carbon Registry & Trading</option>
                <option value="farmers-ai">Farmer's AI Agro-Decarbonization</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-mist mb-1">Operational Footprint Scale</label>
              <select
                name="scale"
                value={formData.scale}
                onChange={handleChange}
                className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-carbon text-white cursor-pointer"
              >
                <option value="enterprise">&gt; 10,000 tCO₂e / year</option>
                <option value="mid-market">1,000 - 10,000 tCO₂e / year</option>
                <option value="growing">&lt; 1,000 tCO₂e / year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-mist mb-1">Project Details or Requirements</label>
            <textarea
              name="details"
              rows={3}
              value={formData.details}
              onChange={handleChange}
              placeholder="Tell us about your facility locations, reporting standard (GRI/BRSR/CSRD), or verification timeline..."
              className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting...' : 'Schedule Confidential Briefing'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default RequestDemoModal;
