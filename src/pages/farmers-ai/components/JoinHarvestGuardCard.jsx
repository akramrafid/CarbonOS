import React from 'react';
import { LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';

export function JoinHarvestGuardCard({
  isInline,
  onBack,
  name,
  setName,
  phone,
  setPhone,
  password,
  setPassword,
  lang,
  setLang,
  handleRegister
}) {
  return (
    <div className={`flex items-center justify-center w-full ${isInline ? 'py-4' : 'min-h-screen pt-12 pb-8 sm:pt-16 sm:pb-12 px-4'}`}>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[32px] w-full max-w-md shadow-2xl hover:border-lime-400/25 transition-all duration-300">
        {isInline && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft size={16} />}
            className="text-white/50 hover:text-white mb-6 font-semibold"
          >
            Back
          </Button>
        )}
        <div className="text-center mb-8">
          {isInline ? (
            <>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Join HarvestGuard</h2>
              <p className="text-white/60 text-sm">Register your offline profile</p>
            </>
          ) : (
            <PageHeader
              title="Join HarvestGuard"
              description="Register your offline profile"
              align="center"
              borderBottom={false}
              className="border-none mb-0 pb-0"
            />
          )}
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-bold mb-1.5">Name / নাম</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-[#CCFF00]/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-bold mb-1.5">Phone / মোবাইল</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-[#CCFF00]/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-bold mb-1.5">Password / পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-[#CCFF00]/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-bold mb-1.5">Language / ভাষা</label>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-all"
            >
              <option value="bn" className="bg-carbon text-white">বাংলা (Bangla)</option>
              <option value="en" className="bg-carbon text-white">English</option>
            </select>
          </div>
          <Button
            type="submit"
            variant={isInline ? 'secondary' : 'primary'}
            size="lg"
            className="w-full mt-6"
            leftIcon={<LogIn size={20} />}
          >
            Create Offline Profile
          </Button>
        </form>
      </div>
    </div>
  );
}

export default JoinHarvestGuardCard;
