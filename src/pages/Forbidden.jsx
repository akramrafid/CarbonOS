import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, Lock, ShieldAlert, KeyRound, Building2, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

export const Forbidden = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const reason = searchParams.get('reason') || 'insufficient_clearance';
  const requiredRole = searchParams.get('required') || searchParams.get('role');

  const getReasonText = () => {
    switch (reason) {
      case 'unauthenticated':
      case 'auth_required':
        return 'Sign-in is required to access this workspace.';
      case 'token_expired':
        return 'Your active authentication token has expired. Please re-authenticate.';
      case 'role_unauthorized':
      case 'insufficient_clearance':
      default:
        return 'Your account does not have permission to access this workspace.';
    }
  };

  return (
    <div
      className={`min-h-[85dvh] flex items-center justify-center px-4 sm:px-6 py-10 md:py-16 relative overflow-hidden font-sans transition-colors duration-300 ${
        isLight ? 'bg-bg-canvas text-fg-primary' : 'bg-carbon text-registry'
      }`}
    >
      {/* [COMMENTED OUT FOR PERSONAL REFERENCE — removed decorative ambient blur layers & nested main wrapper] */}

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Terminal Header Tag */}
        <div
          className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full mb-8 backdrop-blur-md shadow-xs ${
            isLight
              ? 'bg-amber-50 border border-amber-300 text-amber-800'
              : 'bg-amber/10 border border-amber/25 text-amber'
          }`}
        >
          <Lock size={14} className={isLight ? 'text-amber-800' : 'text-amber'} />
          <span className="font-mono text-xs uppercase tracking-widest font-semibold">
            Status 403 // Access Restriction
          </span>
        </div>

        {/* Big 403 Numerals */}
        <div className="flex items-center justify-center font-sans font-extrabold text-7xl sm:text-9xl tracking-tight mb-4 select-none">
          <span className={isLight ? 'text-fg-primary' : 'text-white'}>4</span>
          <span className={`serif-drama italic px-2 ${isLight ? 'text-amber-600' : 'text-amber'}`}>
            0
          </span>
          <span className={isLight ? 'text-fg-primary' : 'text-white'}>3</span>
        </div>

        <PageHeader
          title="Access Restricted"
          description={getReasonText()}
          align="center"
          className="border-none mb-4 pb-0"
        />

        {/* Diagnostic Metadata Pill */}
        <div
          className={`inline-flex flex-wrap items-center justify-center gap-2 border px-4 py-2 rounded-xl font-mono text-xs mb-8 shadow-xs max-w-lg mx-auto ${
            isLight
              ? 'bg-white border-slate-200 text-slate-700'
              : 'bg-black/40 border-white/10 text-white/70'
          }`}
        >
          <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber'}`}>PATH:</span>
          <span className={`font-medium ${isLight ? 'text-fg-primary' : 'text-white/90'}`}>
            {location.pathname}
          </span>
          {requiredRole && (
            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
              REQUIRED: {requiredRole}
            </span>
          )}
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
            to="/platform/esg"
            className={`inline-flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-semibold transition-[background-color,transform] hover:scale-[1.02] active:scale-[0.98] ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15'
            }`}
          >
            <KeyRound size={16} className={isLight ? 'text-accent' : 'text-emerald'} />
            <span>Switch Persona</span>
          </Link>
        </div>

        {/* Alternate Navigation Portals */}
        <div
          className={`pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-left ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <Link
            to="/platform/saas-dashboard"
            className={`p-4 rounded-2xl border transition-colors group flex items-center space-x-3.5 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald/30'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${
                isLight ? 'bg-emerald-50 text-accent' : 'bg-emerald/10 text-emerald'
              }`}
            >
              <Building2 size={18} />
            </div>
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Enterprise Overview
              </div>
              <div className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                Scope 1, 2 &amp; 3 Emissions Workspace
              </div>
            </div>
          </Link>

          <Link
            to="/platform/carbon-registry"
            className={`p-4 rounded-2xl border transition-colors group flex items-center space-x-3.5 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald/30'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${
                isLight ? 'bg-emerald-50 text-accent' : 'bg-emerald/10 text-emerald'
              }`}
            >
              <Terminal size={18} />
            </div>
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Public Registry Terminal
              </div>
              <div className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                Open telemetry &amp; authorized serials
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;

