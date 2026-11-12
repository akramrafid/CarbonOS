import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ShoppingCart, Terminal, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <main className={`min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-28 relative overflow-hidden font-sans transition-colors duration-300 ${
      isLight ? 'bg-[#f2f3ee] text-[#181414]' : 'bg-carbon text-registry'
    }`}>
      
      {/* Ambient Radial Mesh Gradients */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${
        isLight ? 'bg-emerald-500/5' : 'bg-emerald/10'
      }`}></div>
      <div className={`absolute bottom-10 right-10 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
        isLight ? 'bg-amber-500/5' : 'bg-amber/5'
      }`}></div>

      <div className="max-w-2xl w-full text-center relative z-10">
        
        {/* Terminal Header Tag */}
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full mb-8 backdrop-blur-md shadow-xs ${
          isLight
            ? 'bg-[#dbf0ea] border border-[#166534]/30 text-[#166534]'
            : 'bg-emerald/10 border border-emerald/25 text-emerald'
        }`}>
          <ShieldAlert size={14} className={isLight ? 'text-[#166534]' : 'text-emerald'} />
          <span className="font-mono text-xs uppercase tracking-widest font-semibold">
            Status 404 // Registry Node Unresolved
          </span>
        </div>

        {/* Big 404 (Rendered cleanly without GPU Skia filter box artifacts) */}
        <div className="flex items-center justify-center font-sans font-extrabold text-7xl sm:text-9xl tracking-tight mb-4 select-none">
          <span className={isLight ? 'text-[#181414]' : 'text-white'}>4</span>
          <span className={`serif-drama italic px-2 ${isLight ? 'text-[#166534]' : 'text-emerald'}`}>
            0
          </span>
          <span className={isLight ? 'text-[#181414]' : 'text-white'}>4</span>
        </div>

        <PageHeader
          title="Sovereign Registry Node Not Found"
          description="The requested asset pathway, smart contract ledger node, or platform view does not exist or has been migrated."
          align="center"
          className="border-none mb-4 pb-0"
        />

        {/* Attempted Route Display */}
        <div className={`inline-flex items-center space-x-2 border px-4 py-2 rounded-xl font-mono text-xs mb-10 shadow-xs ${
          isLight 
            ? 'bg-white border-[#dbf0ea] text-slate-700' 
            : 'bg-black/40 border-white/10 text-white/70'
        }`}>
          <span className={`font-bold ${isLight ? 'text-[#166534]' : 'text-emerald'}`}>GET</span>
          <span className={`font-medium ${isLight ? 'text-[#181414]' : 'text-white/90'}`}>{location.pathname}</span>
          <span className="text-rose-500 font-semibold">[404 NULL]</span>
        </div>

        {/* Primary Rescue CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={16} />}
          >
            <span>Go Back</span>
          </Button>

          <Link
            to="/"
            className="keep-white inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#166534] hover:bg-[#14532d] dark:bg-emerald dark:hover:bg-emerald/90 text-white dark:text-[#040A06] text-sm font-bold shadow-[0_0_25px_rgba(0,200,83,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/platform/marketplace"
            className={`inline-flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15'
            }`}
          >
            <ShoppingCart size={16} className={isLight ? 'text-[#166534]' : 'text-emerald'} />
            <span>Marketplace</span>
          </Link>
        </div>

        {/* Helpful Alternate Portals */}
        <div className={`pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-left ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <Link
            to="/platform/saas-dashboard"
            className={`p-4 rounded-2xl border transition-all group flex items-center space-x-3.5 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-[#dbf0ea] hover:border-[#166534]/40 shadow-xs'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald/30'
            }`}
          >
            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${
              isLight ? 'bg-[#dbf0ea] text-[#166534]' : 'bg-emerald/10 text-emerald'
            }`}>
              <LayoutDashboard size={18} />
            </div>
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                Enterprise ESG Portal
              </div>
              <div className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                Corporate GHG accounting & audit
              </div>
            </div>
          </Link>

          <Link
            to="/platform/carbon-registry"
            className={`p-4 rounded-2xl border transition-all group flex items-center space-x-3.5 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-[#dbf0ea] hover:border-[#166534]/40 shadow-xs'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald/30'
            }`}
          >
            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${
              isLight ? 'bg-[#dbf0ea] text-[#166534]' : 'bg-emerald/10 text-emerald'
            }`}>
              <Terminal size={18} />
            </div>
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-[#181414]' : 'text-white'}`}>
                National Registry Terminal
              </div>
              <div className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                Live telemetry & verified serials
              </div>
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
};

export default NotFound;
