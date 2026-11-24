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
    <div className={`min-h-[85dvh] flex items-center justify-center px-4 sm:px-6 py-10 md:py-16 relative overflow-hidden font-sans transition-colors duration-300 ${
      isLight ? 'bg-bg-canvas text-fg-primary' : 'bg-carbon text-registry'
    }`}>
      {/* [COMMENTED OUT FOR PERSONAL REFERENCE — removed decorative ambient blur layers & nested main wrapper] */}

      <div className="max-w-2xl w-full text-center relative z-10">
        
        {/* Terminal Header Tag */}
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full mb-8 backdrop-blur-md shadow-xs ${
          isLight
            ? 'bg-accent-muted border border-border-strong/30 text-accent'
            : 'bg-emerald/10 border border-emerald/25 text-emerald'
        }`}>
          <ShieldAlert size={14} className={isLight ? 'text-accent' : 'text-emerald'} />
          <span className="font-mono text-xs uppercase tracking-widest font-semibold">
            Status 404 // Registry Node Unresolved
          </span>
        </div>

        {/* Big 404 (Rendered cleanly without GPU Skia filter box artifacts) */}
        <div className="flex items-center justify-center font-sans font-extrabold text-7xl sm:text-9xl tracking-tight mb-4 select-none">
          <span className={isLight ? 'text-fg-primary' : 'text-white'}>4</span>
          <span className={`serif-drama italic px-2 ${isLight ? 'text-accent' : 'text-emerald'}`}>
            0
          </span>
          <span className={isLight ? 'text-fg-primary' : 'text-white'}>4</span>
        </div>

        <PageHeader
          title="Page Not Found"
          description="The requested page or workspace route does not exist or has been moved."
          align="center"
          className="border-none mb-4 pb-0"
        />

        {/* Attempted Route Display */}
        <div className={`inline-flex items-center space-x-2 border px-4 py-2 rounded-xl font-mono text-xs mb-10 shadow-xs ${
          isLight 
            ? 'bg-white border-border-strong text-slate-700' 
            : 'bg-black/40 border-white/10 text-white/70'
        }`}>
          <span className={`font-bold ${isLight ? 'text-accent' : 'text-emerald'}`}>GET</span>
          <span className={`font-medium ${isLight ? 'text-fg-primary' : 'text-white/90'}`}>{location.pathname}</span>
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
            className="keep-white inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-active dark:bg-emerald dark:hover:bg-emerald/90 text-white dark:text-fg-inverse text-sm font-bold shadow-[0_0_25px_rgba(0,200,83,0.3)] transition-[background-color,transform] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/platform/marketplace"
            className={`inline-flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-semibold transition-[background-color,transform] hover:scale-[1.02] active:scale-[0.98] ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15'
            }`}
          >
            <ShoppingCart size={16} className={isLight ? 'text-accent' : 'text-emerald'} />
            <span>Marketplace</span>
          </Link>
        </div>

        {/* Helpful Alternate Portals */}
        <div className={`pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-left ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <Link
            to="/platform/saas-dashboard"
            className={`p-4 rounded-2xl border transition-colors group flex items-center space-x-3.5 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-border-strong hover:border-border-strong/40 shadow-xs'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald/30'
            }`}
          >
            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${
              isLight ? 'bg-accent-muted text-accent' : 'bg-emerald/10 text-emerald'
            }`}>
              <LayoutDashboard size={18} />
            </div>
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Enterprise ESG Portal
              </div>
              <div className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                Corporate GHG accounting &amp; audit
              </div>
            </div>
          </Link>

          <Link
            to="/platform/carbon-registry"
            className={`p-4 rounded-2xl border transition-colors group flex items-center space-x-3.5 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-border-strong hover:border-border-strong/40 shadow-xs'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald/30'
            }`}
          >
            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${
              isLight ? 'bg-accent-muted text-accent' : 'bg-emerald/10 text-emerald'
            }`}>
              <Terminal size={18} />
            </div>
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                National Registry Terminal
              </div>
              <div className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                Live telemetry &amp; verified serials
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
