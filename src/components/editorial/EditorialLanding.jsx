import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../context/ThemeContext';
import { getPrefersReducedMotion } from '../../lib/motion';
import { footerConfig } from '../../config/footer.config';
import RequestDemoModal from '../RequestDemoModal';
import EditorialHeroCanvas from './EditorialHeroCanvas';
import EditorialHeroPipeline from './EditorialHeroPipeline';
import EditorialModuleModal from './EditorialModuleModal';
import EditorialFrameworkCarousel from './EditorialFrameworkCarousel';
import {
  EditorialLiveTelemetry,
  EditorialClientShowcase,
  EditorialSectorFocus,
  EditorialPricing,
} from './EditorialSections';
import './editorial.css';

gsap.registerPlugin(ScrollTrigger);

const LOADER_LABELS = [
  'CALIBRATING BASELINE',
  'GHG SCOPE 1–3',
  'VERRA VM0047',
  'ZERO LINE LOCKED',
];

// Primary Top Navbar keeps ONLY these 4 items; everything else lives inside the corner-expanding Menu
const PRIMARY_NAV_ITEMS = [
  { id: 'platform', key: 'nav.platform', defaultLabel: 'Platform', to: '/platform/saas-dashboard' },
  { id: 'carbonCredit', key: 'nav.carbonCredit', defaultLabel: 'Carbon Credit', to: '/carbon-monitoring' },
  { id: 'marketplace', key: 'nav.marketplace', defaultLabel: 'Marketplace', to: '/platform/marketplace' },
  { id: 'registry', key: 'nav.carbonRegistry', defaultLabel: 'Carbon Registry', to: '/platform/carbon-registry' },
];

// Remaining routes & homepage sections placed inside the corner-spreading Menu
const MENU_EXTRA_ITEMS = [
  { id: 'farmersAi', key: 'nav.farmersAi', defaultLabel: 'Farmers AI & HarvestGuard', meta: 'ON-DEVICE CROP VISION', to: '/farmers-ai' },
  { id: 'esgIntake', key: 'nav.esgIntake', defaultLabel: 'ESG Utility Bill Intake', meta: 'DESCO · TITAS · SHA-256', to: '/platform/esg' },
  { id: 'mrvTelemetry', key: 'nav.mrvTelemetry', defaultLabel: 'MRV Ground Telemetry', meta: 'IOT · EDDY COVARIANCE', to: '/platform/mrv-dashboard' },
  { id: 'verification', key: 'nav.verification', defaultLabel: 'Audit & Verification Queue', meta: 'DUAL-CONTROL WORKFLOW', to: '/platform/verification-workflow' },
  { id: 'onboarding', key: 'nav.onboarding', defaultLabel: 'Project Onboarding Portal', meta: 'PIN & GIS BOUNDARIES', to: '/platform/project-onboarding' },
  { id: 'sectors', key: 'nav.sectors', defaultLabel: 'Priority Carbon Sectors', meta: '06 BANGLADESH CORRIDORS', hash: '#sectors' },
  { id: 'clients', key: 'nav.clients', defaultLabel: 'Corporate Reference Profiles', meta: '07 SECTOR BASELINES', hash: '#clients' },
  { id: 'process', key: 'nav.framework', defaultLabel: 'Process & Sovereign Framework', meta: '5-STEP ROADMAP', hash: '#process' },
  { id: 'pricing', key: 'nav.pricing', defaultLabel: 'Node Licensure & Pricing', meta: 'STARTER · ENTERPRISE · SOVEREIGN', hash: '#pricing' },
  { id: 'howItWorks', key: 'footer.links.howItWorks', defaultLabel: 'How Carbon Zero Works', meta: 'FIELD TO REGISTRY GUIDE', to: '/how-it-works' },
  { id: 'technology', key: 'footer.links.technology', defaultLabel: 'Technology Architecture', meta: 'SENTINEL · LORAWAN · LEDGER', to: '/technology' },
  { id: 'contact', key: 'nav.contact', defaultLabel: 'Contact & Onboarding', meta: 'INSTITUTIONAL DESK', hash: '#contact' },
];

// 4 Auto-Playing Hero Concept Titles covering the whole CarbonOS / Carbon Zero BD project
const HERO_CONCEPT_SLIDES = [
  {
    id: 'national-exchange',
    kicker: '01 / NATIONAL CARBON INFRASTRUCTURE',
    lines: ['BANGLADESH’S', 'CARBON LEDGER', '& EXCHANGE'],
    bnLines: ['বাংলাদেশের', 'কার্বন অবকাঠামো', 'ও এক্সচেঞ্জ'],
    lead: 'Digitizing, tracing, and securing Bangladesh’s carbon asset pipeline from 1M+ smallholder rural farmers directly to institutional ESG registries.',
  },
  {
    id: 'corporate-esg',
    kicker: '02 / CORPORATE ESG & SCOPE 1–3 LEDGER',
    lines: ['AUTOMATED', 'UTILITY INTAKE', 'TO AUDIT'],
    bnLines: ['স্বয়ংক্রিয়', 'ইউটিলিটি বিল', 'ও অডিট লেজার'],
    lead: 'Ingest DESCO, DPDC, BPDB, and Titas Gas bills with deterministic OCR, cited IPCC 2006 factors, and dual-control reviewer sign-off.',
  },
  {
    id: 'satellite-dmrv',
    kicker: '03 / ORBITAL & FIELD GROUND TRUTH',
    lines: ['SENTINEL-2', 'BIOMASS &', 'FIELD dMRV'],
    bnLines: ['স্যাটেলাইট', 'বায়োমাস ও', 'ফিল্ড ডিএমআরভি'],
    lead: 'Cross-verify Sundarbans blue carbon, Rangpur AWD rice methane, and Sylhet solar corridors with multi-spectral NDVI/SAR and IoT sensors.',
  },
  {
    id: 'direct-settlement',
    kicker: '04 / SOVEREIGN REGISTRY & GROWER PAYOUTS',
    lines: ['CALIBRATED', 'TOWARD', 'NET ZERO'],
    bnLines: ['ক্যালিব্রেটেড', 'নেট জিরো', 'কার্বন লাইন'],
    lead: 'Hash-chained registry serials with 97% direct settlement to smallholder mobile wallets via bKash and Nagad rails.',
  },
];

const WORK_ROWS = [
  {
    idx: '01',
    pillarTag: 'FLAGSHIP 01 · CORPORATE ESG',
    vizType: 'esg',
    title: 'Corporate ESG & Utility Bill Accounting',
    meta: 'GHG PROTOCOL · ISO 14064-1 · DESCO · TITAS GAS · DUAL-CONTROL',
    hoverTag: 'OPEN WORKSPACE →',
    to: '/platform/saas-dashboard',
    what: 'Scope 1, 2 & 3 enterprise emissions workspace with native utility invoice OCR and RAG source provenance.',
    how: 'Deterministic rules + LLM-assisted extraction bind raw DESCO/DPDC/Titas bills to immutable calculation snapshots where Preparer ≠ Approver.',
    coreIdea: 'Audit-grade corporate carbon accounting grounded strictly in primary documents and cited IPCC 2006 / national factors — never synthetic defaults.',
  },
  {
    idx: '02',
    pillarTag: 'FLAGSHIP 02 · SATELLITE & FIELD dMRV',
    vizType: 'dmrv',
    title: 'GIS Biomass & Orbital dMRV Studio',
    meta: 'SENTINEL-1/2 · NASA GEDI LIDAR · VERRA VM0047 · IOT TELEMETRY',
    hoverTag: 'OPEN dMRV MAP →',
    to: '/carbon-monitoring',
    what: 'Multi-sensor satellite biomass estimation, canopy change detection, and ground station IoT telemetry across Bangladesh.',
    how: 'Fuses Sentinel-1 SAR backscatter, Sentinel-2 L2A NDVI/NDWI, GEDI LiDAR, and Khulna/Rangpur/Sundarbans ground sensors with conformal prediction intervals.',
    coreIdea: 'Verifiable orbital and field ground truth that catches spatial overlap and leakage automatically before credits are issued.',
  },
  {
    idx: '03',
    pillarTag: 'FLAGSHIP 03 · CARBON REGISTRY',
    vizType: 'registry',
    title: 'Sovereign Carbon Registry & Serial Ledger',
    meta: 'SHA-256 HASH CHAIN · ARTICLE 6.2 · CAD TRUST · RETIREMENT',
    hoverTag: 'INSPECT REGISTRY →',
    to: '/platform/carbon-registry',
    what: 'Tamper-evident carbon credit serialization, LoA authorization tracking, BTR/AEF tables, and retirement registry.',
    how: 'Links verified dMRV monitoring bundles to append-only hash-chained serials with AOI polygon overlap checks and UNFCCC Article 6.2 export adapters.',
    coreIdea: 'Eliminating double counting across domestic corporate insetting and international ITMO transfers through cryptographic lineage.',
  },
  {
    idx: '04',
    pillarTag: 'MODULE 04 · BILL INTAKE ENGINE',
    vizType: 'esg',
    title: 'ESG Utility Bill Intake & RAG Assistant',
    meta: '5-STEP WIZARD · BOUNDING BOX · SHA-256 EVIDENCE Q&A',
    hoverTag: 'LAUNCH BILL INTAKE →',
    to: '/platform/esg',
    what: 'Guided multi-step utility bill ingestion paired with tenant-scoped RAG evidence inspection and document comparison.',
    how: 'Isolates private PDFs/CSVs per tenant SQL boundary and lets auditors trace every Scope answer back to exact indexed passages and SHA-256 digests.',
    coreIdea: 'Source-backed explainability: AI assists evidence discovery, while deterministic Python Decimal math calculates the ledger.',
  },
  {
    idx: '05',
    pillarTag: 'MODULE 05 · MRV TELEMETRY',
    vizType: 'dmrv',
    title: 'National MRV Ground Telemetry',
    meta: 'LORAWAN · EDDY COVARIANCE · CEMS STACK FEED',
    hoverTag: 'OPEN MRV TERMINAL →',
    to: '/platform/mrv-dashboard',
    what: 'Real-time environmental ground truth spanning solar irrigation, AWD rice methane, mangrove flux towers, and kiln CEMS.',
    how: 'Streams calibrated MQTT/HTTP sensor packets alongside regional baseline drift alerts and continuous station health checks.',
    coreIdea: 'Continuous physical sensing backing digital registry claims rather than annual spreadsheet self-reporting.',
  },
  {
    idx: '06',
    pillarTag: 'MODULE 06 · OFFTAKE EXCHANGE',
    vizType: 'registry',
    title: 'Carbon Offtake Marketplace',
    meta: 'WHOLESALE ORDER BOOK · ESCROW SETTLEMENT · 97% RAIL',
    hoverTag: 'EXPLORE LISTINGS →',
    to: '/platform/marketplace',
    what: 'Direct primary & forward offtake marketplace connecting vetted Bangladesh project developers with corporate buyers.',
    how: 'Matches serialized vintages with buyer ESG deficits while routing settlement proceeds via tracked MFS disbursement rails.',
    coreIdea: 'Transparent price discovery and direct 97% community value retention instead of opaque broker markups.',
  },
  {
    idx: '07',
    pillarTag: 'MODULE 07 · VERIFICATION QUEUE',
    vizType: 'esg',
    title: 'Audit Verification & AI Change Detection',
    meta: 'DUAL-CONTROL WORKFLOW · ANOMALY SCORING · VVB SIGN-OFF',
    hoverTag: 'OPEN VERIFICATION →',
    to: '/platform/verification-workflow',
    what: 'Structured validation & verification body (VVB) sign-off console and canopy anomaly triage queue.',
    how: 'Enforces separation of duties on every evidence item and flags statistical outliers across optical and field reports.',
    coreIdea: 'Making independent VVB review fast, deterministic, and evidence-complete from day one.',
  },
  {
    idx: '08',
    pillarTag: 'MODULE 08 · SMALLHOLDER ECOSYSTEM',
    vizType: 'dmrv',
    title: 'Farmers AI & HarvestGuard Coop',
    meta: 'ON-DEVICE ONNX VISION · FLOOD/CYCLONE RISK · bKASH/NAGAD',
    hoverTag: 'LAUNCH FIELD TOOL →',
    to: '/farmers-ai',
    what: 'Edge ONNX crop disease diagnostics, parametric weather risk maps, and cooperative MFS payout tracking for rural growers.',
    how: 'Runs quantized crop vision models offline in the field while syncing GPS-tagged resilience batches to cooperative risk dashboards.',
    coreIdea: 'Rewarding 1M+ rural farmers directly for verified soil, rice methane, and clean-energy climate action.',
  },
];

const INSTITUTIONAL_FACTS = [
  { key: 'JURISDICTION', val: 'Dhaka, Bangladesh (23.81°N)' },
  { key: 'STANDARDS', val: 'GHG Protocol · ISO 14064-1 · VM0047' },
  { key: 'PAYOUT RAIL MODEL', val: '97% Direct Participant Share' },
  { key: 'BUILD STATUS', val: 'Demo / Pilot Platform Environment' },
];

const QUICK_MODULE_LINKS = [
  { label: 'Project Onboarding Portal', to: '/platform/project-onboarding' },
  { label: 'AI Change Detection', to: '/platform/ai-detection' },
  { label: 'SDG Impact & MFS Payouts', to: '/platform/impact' },
  { label: 'HarvestGuard Coop', to: '/harvestguard/dashboard' },
  { label: 'How Carbon Zero Works', to: '/how-it-works' },
  { label: 'Technology Stack', to: '/technology' },
];

const COMPARE_UNMEASURED = [
  {
    key: 'UTILITY DATA',
    val: 'Fragmented utility PDFs & unlinked spreadsheets without audit trails.',
  },
  {
    key: 'GRID FACTORS',
    val: 'Assumed regional defaults circulating without table citations.',
  },
  {
    key: 'GOVERNANCE',
    val: 'Single-user edits where author and approver share the same session.',
  },
  {
    key: 'PROVENANCE',
    val: 'Static project claims with unverified overlap and double-count risk.',
  },
];

const COMPARE_VERIFIED = [
  {
    key: 'UTILITY DATA',
    val: 'Tenant-scoped intake bound to SHA-256 document verification digests.',
  },
  {
    key: 'GRID FACTORS',
    val: 'Approved IPCC 2006 & cited national factors — no fallback guesswork.',
  },
  {
    key: 'GOVERNANCE',
    val: 'Dual-control sign-off where preparer and verifier are separate actors.',
  },
  {
    key: 'PROVENANCE',
    val: 'Append-only hash chain & Verra VM0047 uncertainty dossier output.',
  },
];

const ROADMAP_STEPS = [
  {
    num: '01 / PROJECT REGISTRATION',
    title: 'PROJECT REGISTRATION',
    desc: 'Submit PIN and project design documents adhering to the Bangladesh National Carbon Market Framework.',
    metrics: ['GIS Boundary Maps', 'Baseline Emissions', 'Additionality Proof'],
  },
  {
    num: '02 / MRV DATA COLLECTION',
    title: 'MRV DATA COLLECTION',
    desc: 'Continuous data stream combining IoT sensors, satellite imagery (NDVI), and field reports.',
    metrics: ['Live Carbon Feed', 'Anomaly Detection', 'AI Verification'],
  },
  {
    num: '03 / AUDIT & VERIFICATION',
    title: 'AUDIT & VERIFICATION',
    desc: 'Independent assessment by accredited third-party verifiers using our dual-control verification workflow engine.',
    metrics: ['Risk Score', 'Document Audit', 'Final Approval'],
  },
  {
    num: '04 / REGISTRY ISSUANCE',
    title: 'REGISTRY ISSUANCE',
    desc: 'Recording unique carbon credits with serialized IDs directly onto the sovereign Carbon Zero BD registry.',
    metrics: ['Unique IDs', 'Vintage Assignment', 'Ownership Record'],
  },
  {
    num: '05 / MARKETPLACE TRADING',
    title: 'MARKETPLACE TRADING',
    desc: 'Order-book matching between verified project developers and corporate buyers with 97% direct settlement rail.',
    metrics: ['Spot Pricing', 'Transfer Execution', 'Retirement'],
  },
];

/* [COMMENTED OUT FOR PERSONAL REFERENCE — extracted into EditorialFrameworkCarousel.jsx]
const FRAMEWORK_PILLARS = [...];
*/

export function EditorialLanding() {
  const { theme, mode, setTheme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const rootRef = useRef(null);
  const loaderRef = useRef(null);
  const counterElRef = useRef(null);
  const loaderLabelRef = useRef(null);
  const wipeAfterRef = useRef(null);
  const wipeProgressRef = useRef(null);
  const compareRef = useRef(null);
  const processRef = useRef(null);
  const processLineRef = useRef(null);
  const cursorDotRef = useRef(null);
  const floatLabelRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const mobileToggleRef = useRef(null);

  const [zeroReading, setZeroReading] = useState('0.00');
  const [floatText, setFloatText] = useState('VIEW →');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [openFooterCol, setOpenFooterCol] = useState('platform');
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [activePreviewModule, setActivePreviewModule] = useState(() => WORK_ROWS[0]);
  const [factsSlideIdx, setFactsSlideIdx] = useState(0);
  const [factsPaused, setFactsPaused] = useState(false);
  const [bdKineticActive, setBdKineticActive] = useState(true);
  const previewHoverTimerRef = useRef(null);

  const isBengali = i18n.language === 'bn';
  const activeHeroSlide = HERO_CONCEPT_SLIDES[heroSlideIdx] || HERO_CONCEPT_SLIDES[0];
  const activeLines = isBengali ? activeHeroSlide.bnLines : activeHeroSlide.lines;

  const handleHeroRipple = () => {
    setZeroReading('0.00*');
    window.setTimeout(() => setZeroReading('0.00'), 550);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(isBengali ? 'en' : 'bn');
  };

  // Auto-play the 4 Hero Project Concept Titles (pauses when tab hidden or reduced-motion active)
  useEffect(() => {
    if (getPrefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setHeroSlideIdx((prev) => (prev + 1) % HERO_CONCEPT_SLIDES.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, []);

  // Auto-carousel for Institutional Footer Facts
  useEffect(() => {
    if (factsPaused || getPrefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setFactsSlideIdx((prev) => (prev + 1) % INSTITUTIONAL_FACTS.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [factsPaused]);

  const scheduleModulePreview = (item) => {
    if (previewHoverTimerRef.current) window.clearTimeout(previewHoverTimerRef.current);
    previewHoverTimerRef.current = window.setTimeout(() => {
      setActivePreviewModule(item);
    }, 120);
  };

  const scheduleModulePreviewClose = () => {
    if (previewHoverTimerRef.current) window.clearTimeout(previewHoverTimerRef.current);
  };

  const keepModulePreviewOpen = () => {
    if (previewHoverTimerRef.current) window.clearTimeout(previewHoverTimerRef.current);
  };

  // Smoothly scroll to hash anchors (#sectors, #pricing, #platform, #process, etc.)
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const timer = window.setTimeout(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({
          behavior: getPrefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  // Corner-spreading menu scroll lock + Escape + Tab focus trap
  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && mobileDrawerRef.current) {
        const focusable = mobileDrawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const focusTimer = window.setTimeout(() => {
      const firstItem = mobileDrawerRef.current?.querySelector('button:not([disabled]), a[href]');
      firstItem?.focus();
    }, 80);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // GSAP Loader, Pinned Clip-Path Wipe, Scroll-Drawn Process Spine, Fine-Pointer Dot & Work Hover
  useEffect(() => {
    const reduced = getPrefersReducedMotion();
    const rootEl = rootRef.current;
    if (!rootEl || reduced) {
      document.documentElement.classList.remove('anim');
      return undefined;
    }

    document.documentElement.classList.add('anim');
    const isFine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
    const cleanups = [];

    const ctx = gsap.context(() => {
      // 1. Calibration loader (000 -> 100) slides up, then headline lines rise from masked wrappers
      const counter = { value: 0 };
      const heroLines = rootEl.querySelectorAll('.ed-hero-title .ed-line-inner');

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.to(counter, {
        value: 100,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.round(counter.value);
          if (counterElRef.current) {
            counterElRef.current.textContent = String(val).padStart(3, '0');
          }
          if (loaderLabelRef.current) {
            const labelIdx = Math.min(
              LOADER_LABELS.length - 1,
              Math.floor((val / 100) * LOADER_LABELS.length)
            );
            loaderLabelRef.current.textContent = LOADER_LABELS[labelIdx];
          }
        },
      })
        .to(loaderRef.current, {
          yPercent: -100,
          duration: 0.58,
          ease: 'power4.inOut',
          onComplete: () => {
            if (loaderRef.current) loaderRef.current.style.pointerEvents = 'none';
          },
        })
        .to(
          heroLines,
          {
            y: '0%',
            duration: 0.65,
            stagger: 0.08,
            ease: 'power4.out',
            onComplete: () => {
              // Remove initial class gate on hero title lines so subsequent auto-playing titles render immediately
              rootEl.classList.add('ed-hero-unlocked');
            },
          },
          '-=0.2'
        );

      // 2. Pinned two-state scrubbed clip-path wipe (>= 861px only)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 861px)', () => {
        if (!compareRef.current || !wipeAfterRef.current) return undefined;

        gsap.set(wipeAfterRef.current, { clipPath: 'inset(0% 100% 0% 0%)' });

        gsap.to(wipeAfterRef.current, {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: compareRef.current,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (wipeProgressRef.current) {
                const pct = Math.round(self.progress * 100);
                wipeProgressRef.current.textContent = `CALIBRATION ${String(pct).padStart(2, '0')}%`;
              }
            },
          },
        });
      });

      cleanups.push(() => mm.revert());

      // 3. One scroll-drawn SVG line across the Process / Roadmap section
      if (processRef.current && processLineRef.current) {
        const line = processLineRef.current;
        const len = typeof line.getTotalLength === 'function' ? line.getTotalLength() : 1000;
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 72%',
            end: 'bottom 80%',
            scrub: true,
          },
        });
      }

      // 4. Fine-pointer only: custom cursor dot, restrained magnetic pills (±5px), work row label
      if (isFine && cursorDotRef.current && floatLabelRef.current) {
        const dot = cursorDotRef.current;
        const floatEl = floatLabelRef.current;

        const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.16, ease: 'power3.out' });
        const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.16, ease: 'power3.out' });
        const moveFloatX = gsap.quickTo(floatEl, 'x', { duration: 0.22, ease: 'power3.out' });
        const moveFloatY = gsap.quickTo(floatEl, 'y', { duration: 0.22, ease: 'power3.out' });

        const handleWindowMove = (e) => {
          dot.classList.add('is-visible');
          moveDotX(e.clientX);
          moveDotY(e.clientY);
          moveFloatX(e.clientX + 18);
          moveFloatY(e.clientY - 14);
        };

        window.addEventListener('pointermove', handleWindowMove, { passive: true });
        cleanups.push(() => window.removeEventListener('pointermove', handleWindowMove));

        const magneticEls = rootEl.querySelectorAll('[data-magnetic]');
        magneticEls.forEach((btn) => {
          const pullX = gsap.quickTo(btn, 'x', { duration: 0.25, ease: 'power3.out' });
          const pullY = gsap.quickTo(btn, 'y', { duration: 0.25, ease: 'power3.out' });

          const onMove = (ev) => {
            const r = btn.getBoundingClientRect();
            const dx = (ev.clientX - (r.left + r.width / 2)) * 0.16;
            const dy = (ev.clientY - (r.top + r.height / 2)) * 0.16;
            pullX(Math.max(-5, Math.min(5, dx)));
            pullY(Math.max(-4, Math.min(4, dy)));
            dot.classList.add('is-expanded');
          };
          const onLeave = () => {
            pullX(0);
            pullY(0);
            dot.classList.remove('is-expanded');
          };
          btn.addEventListener('pointermove', onMove, { passive: true });
          btn.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            btn.removeEventListener('pointermove', onMove);
            btn.removeEventListener('pointerleave', onLeave);
          });
        });

        const workRows = rootEl.querySelectorAll('.ed-work-row');
        workRows.forEach((row) => {
          const onEnter = () => {
            const tag = row.getAttribute('data-hover-tag') || 'OPEN →';
            setFloatText(tag);
            floatEl.classList.add('is-visible');
            dot.classList.add('is-expanded');
          };
          const onLeave = () => {
            floatEl.classList.remove('is-visible');
            dot.classList.remove('is-expanded');
          };
          row.addEventListener('pointerenter', onEnter);
          row.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            row.removeEventListener('pointerenter', onEnter);
            row.removeEventListener('pointerleave', onLeave);
          });
        });
      }

      const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 160);
      cleanups.push(() => window.clearTimeout(refreshTimer));
    }, rootRef);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
      document.documentElement.classList.remove('anim');
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: getPrefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  return (
    <div
      ref={rootRef}
      className={`ed-root ${isBengali ? 'ed-lang-bn' : ''}`}
      data-editorial-theme={theme}
    >
      {/* Calibration Loader (000 -> 100) */}
      <div ref={loaderRef} className="ed-loader" aria-hidden="true">
        <div className="ed-loader-top">
          <span className="ed-mono">CARBON ZERO BD · PROTOCOL v2.4</span>
          <span ref={loaderLabelRef} className="ed-mono">
            CALIBRATING BASELINE
          </span>
        </div>
        <div className="ed-loader-count-row">
          <span ref={counterElRef} className="ed-loader-digits">
            000
          </span>
          <span className="ed-mono">ZERO LINE CALIBRATION</span>
        </div>
      </div>

      {/* Fine-Pointer Custom Cursor Dot & Pointer-Following Row Label */}
      <div ref={cursorDotRef} className="ed-cursor-dot" aria-hidden="true" />
      <div ref={floatLabelRef} className="ed-float-label ed-mono" aria-hidden="true">
        {floatText}
      </div>

      {/* 1. Single Clean Sticky Navbar: Brand + 4 Primary Links + Corner Menu Trigger */}
      <header className="ed-nav">
        <div className="ed-container ed-nav-inner">
          <div className="ed-nav-brand-wrap">
            <Link to="/" className="ed-brand">
              <span>
                CARBON ZERO <span className="ed-accent-text">BD</span>
              </span>
            </Link>
            <span className="ed-calibration-cell ed-mono" title="Hero Zero Line Delta">
              Δ <strong>{zeroReading}</strong> tCO₂e
            </span>
          </div>

          {/* Exactly 4 Primary Links in Main Navbar */}
          <nav className="ed-nav-links" aria-label="Primary platform navigation">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link key={item.id} to={item.to} className="ed-nav-link">
                {t(item.key, item.defaultLabel)}
              </Link>
            ))}
          </nav>

          <div className="ed-nav-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="ed-pill ed-pill--subtle ed-pill--compact"
              aria-label={theme === 'dark' ? 'Switch to light paper mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? 'Paper' : 'Dark'}
            </button>

            <button
              ref={mobileToggleRef}
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="ed-corner-menu"
              className={`ed-pill ${isMenuOpen ? 'ed-pill--accent' : 'ed-pill--subtle'} ed-menu-trigger`}
            >
              <span>{isMenuOpen ? 'Close ✕' : 'Menu ≡'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Corner-Spreading Full-Screen Menu Overlay (Slowly expands from top-right corner across screen) */}
      <div
        ref={mobileDrawerRef}
        id="ed-corner-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Full navigation menu"
        aria-hidden={!isMenuOpen}
        className={`ed-corner-menu ${isMenuOpen ? 'is-open' : ''}`}
      >
        <div className="ed-container ed-drawer-inner">
          <div className="ed-drawer-head">
            <div className="ed-nav-brand-wrap">
              <span className="ed-brand">
                CARBON ZERO <span className="ed-accent-text">BD</span>
              </span>
              <span className="ed-mono ed-muted-text">SYSTEM DIRECTORY &amp; CONTROLS</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                mobileToggleRef.current?.focus();
              }}
              className="ed-pill ed-pill--accent"
            >
              Close Menu ✕
            </button>
          </div>

          {/* Mobile-only Primary 4 Links (shown only below 900px where top nav links hide) */}
          <div className="ed-drawer-primary-mobile">
            <span className="ed-mono ed-accent-text">CORE PLATFORM</span>
            <div className="ed-drawer-primary-grid">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="ed-pill ed-pill--subtle"
                >
                  {t(item.key, item.defaultLabel)} →
                </Link>
              ))}
            </div>
          </div>

          {/* All Remaining Modules, Sections & Resources */}
          <div className="ed-drawer-body-grid">
            <nav className="ed-drawer-links" aria-label="Extended modules and sections">
              {MENU_EXTRA_ITEMS.map((item, idx) => {
                const num = String(idx + 1).padStart(2, '0');
                return item.to ? (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="ed-drawer-link"
                  >
                    <span className="ed-mono ed-muted-text">{num}</span>
                    <span className="ed-drawer-link-title">{t(item.key, item.defaultLabel)}</span>
                    <span className="ed-mono ed-drawer-link-meta">{item.meta}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <a
                    key={item.id}
                    href={item.hash}
                    onClick={() => setIsMenuOpen(false)}
                    className="ed-drawer-link"
                  >
                    <span className="ed-mono ed-muted-text">{num}</span>
                    <span className="ed-drawer-link-title">{t(item.key, item.defaultLabel)}</span>
                    <span className="ed-mono ed-drawer-link-meta">{item.meta}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                );
              })}
            </nav>

            <aside className="ed-drawer-sidebar">
              <div className="ed-drawer-box">
                <span className="ed-mono ed-accent-text">LANGUAGE / ভাষা</span>
                <p className="ed-drawer-box-sub">
                  Switch interface between English and Bengali script.
                </p>
                <button type="button" onClick={toggleLanguage} className="ed-pill ed-pill--subtle">
                  {isBengali ? 'Switch to English (EN)' : 'বাংলায় পরিবর্তন করুন (বাংলা)'}
                </button>
              </div>

              <div className="ed-drawer-box">
                <span className="ed-mono ed-accent-text">SURFACE THEME</span>
                <div className="ed-theme-pills" role="radiogroup" aria-label="Color theme mode">
                  {[
                    { id: 'light', label: 'Paper' },
                    { id: 'dark', label: 'Dark' },
                    { id: 'system', label: 'System' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={mode === opt.id}
                      onClick={(e) => setTheme(opt.id, e)}
                      className={`ed-pill ed-pill--subtle ed-pill--compact ${
                        mode === opt.id ? 'is-filter-active' : ''
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ed-drawer-box">
                <span className="ed-mono ed-accent-text">ENTERPRISE ACCESS</span>
                <div className="ed-drawer-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDemoModalOpen(true);
                    }}
                    className="ed-pill"
                  >
                    {t('nav.requestDemo', '[Request Demo]')}
                  </button>
                  <Link
                    to="/platform/esg"
                    onClick={() => setIsMenuOpen(false)}
                    className="ed-pill ed-pill--accent"
                  >
                    Login to ESG Portal →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <main id="main-content">
        {/* 2. Hero with Background Landscape Image + Zero-Line Canvas + 4 Auto-Playing Concept Titles + Right Pipeline Board */}
        <section id="hero" className="ed-hero">
          {/* Restored Hero Background Landscape Photography + Theme-Adaptive Contrast Scrim */}
          <div
            className="ed-hero-bg-photo"
            style={{ backgroundImage: 'url("/hero_landscape.png")' }}
            aria-hidden="true"
          />
          <div className="ed-hero-bg-scrim" aria-hidden="true" />

          <EditorialHeroCanvas theme={theme} onRipple={handleHeroRipple} />

          <div className="ed-container ed-hero-grid">
            {/* Left Column: 4 Auto-Playing Project Concept Titles */}
            <div className="ed-hero-copy">
              <div className="ed-hero-kicker-bar">
                <span className="ed-mono ed-accent-text">
                  {activeHeroSlide.kicker}
                </span>
                <span className="ed-mono ed-muted-text">97% DIRECT PAYOUT</span>
              </div>

              <h1 key={activeHeroSlide.id} className="ed-hero-title">
                {activeLines.map((line, idx) => (
                  <span key={line} className="ed-line-mask">
                    <span className="ed-line-inner">
                      {line}
                      {idx === activeLines.length - 1 && (
                        <span className="ed-accent-text">.</span>
                      )}
                    </span>
                  </span>
                ))}
              </h1>

              {/* 4-Concept Autoplay Switcher Pills */}
              <div
                className="ed-hero-concept-tabs"
                role="tablist"
                aria-label="CarbonOS project concept highlights"
              >
                {HERO_CONCEPT_SLIDES.map((slide, idx) => {
                  const isActive = idx === heroSlideIdx;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setHeroSlideIdx(idx)}
                      className={`ed-hero-tab-btn ed-mono ${isActive ? 'is-active' : ''}`}
                    >
                      0{idx + 1}
                    </button>
                  );
                })}
                <span className="ed-mono ed-muted-text ed-hero-tab-hint">
                  AUTO-CALIBRATING CONCEPT · {heroSlideIdx + 1}/4
                </span>
              </div>

              <p className="ed-hero-lead">{activeHeroSlide.lead}</p>

              <div className="ed-hero-buttons">
                <Link
                  to="/platform/marketplace"
                  data-magnetic
                  className="ed-pill ed-pill--accent"
                >
                  Explore Credit Listings →
                </Link>
                <Link to="/platform/carbon-registry" data-magnetic className="ed-pill">
                  Registry Terminal
                </Link>
                <Link to="/platform/saas-dashboard" className="ed-pill ed-pill--subtle">
                  Enterprise ESG Portal →
                </Link>
              </div>

              <ul className="ed-hero-proofs" aria-label="Verification safeguards">
                <li className="ed-mono">Cited, second-person-approved factors only</li>
                <li className="ed-mono">Every ledger line traceable to its source evidence</li>
                <li className="ed-mono">Labelled NOT ASSURED until an independent verifier signs</li>
              </ul>
            </div>

            {/* Right Column: Corporate SaaS Pipeline Interactive Diagram Board */}
            <div className="ed-hero-pipeline-col">
              <EditorialHeroPipeline />
            </div>
          </div>

          <div id="hero-sentinel" className="ed-sentinel" aria-hidden="true" />
        </section>

        {/* 3. Giant Outlined Marquee Bands (Authentic CarbonOS Identity) */}
        <section className="ed-marquee" aria-label="CarbonOS infrastructure standards and guarantees">
          <div className="ed-marquee-band">
            <div className="ed-marquee-track">
              <span className="ed-marquee-text">
                DESCO · DPDC · BPDB · TITAS GAS OCR · DUAL-CONTROL SCOPE 1–3 LEDGER · PREPARER ≠ APPROVER ·
              </span>
              <span className="ed-marquee-text" aria-hidden="true">
                DESCO · DPDC · BPDB · TITAS GAS OCR · DUAL-CONTROL SCOPE 1–3 LEDGER · PREPARER ≠ APPROVER ·
              </span>
            </div>
          </div>
          <div className="ed-marquee-band">
            <div className="ed-marquee-track ed-marquee-track--reverse">
              <span className="ed-marquee-text ed-marquee-text--solid-accent">
                VERRA VM0047 SENTINEL-2 dMRV · SUNDARBANS BLUE CARBON · RANGPUR AWD · 97% MFS GROWER RAIL · SHA-256 REGISTRY ·
              </span>
              <span className="ed-marquee-text ed-marquee-text--solid-accent" aria-hidden="true">
                VERRA VM0047 SENTINEL-2 dMRV · SUNDARBANS BLUE CARBON · RANGPUR AWD · 97% MFS GROWER RAIL · SHA-256 REGISTRY ·
              </span>
            </div>
          </div>
        </section>

        {/* 4. Pinned Two-State Scrubbed Clip-Path Section */}
        <section
          ref={compareRef}
          id="compare"
          className="ed-compare"
          aria-label="Baseline calibration comparison"
        >
          <div className="ed-compare-stage">
            <div className="ed-compare-layer ed-compare-layer--before">
              <div className="ed-container">
                <div className="ed-compare-head">
                  <div>
                    <span className="ed-mono">STATE 01 / FRAGMENTED REPORTING REALITY</span>
                    <h2 className="ed-compare-title">UNMEASURED</h2>
                    <p className="ed-compare-sub">
                      Across Bangladesh factories and field corridors, utility invoices arrive as
                      unstructured PDFs, spreadsheets lack IPCC 2006 factor citations, and single-actor
                      sign-offs leave audits fragile before international verifiers.
                    </p>
                  </div>
                  <span className="ed-mono">BEFORE CALIBRATION</span>
                </div>
                <div className="ed-compare-rows">
                  {COMPARE_UNMEASURED.map((row) => (
                    <div key={row.key} className="ed-compare-row">
                      <span className="ed-mono">{row.key}</span>
                      <p className="ed-compare-row-val">{row.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={wipeAfterRef}
              className="ed-compare-layer ed-compare-layer--after ed-inverted"
            >
              <div className="ed-container">
                <div className="ed-compare-head">
                  <div>
                    <span className="ed-mono ed-accent-text">STATE 02 / CARBONOS ZERO LINE LOCKED</span>
                    <h2 className="ed-compare-title">
                      VERIFIED<span className="ed-accent-text">.</span>
                    </h2>
                    <p className="ed-compare-sub">
                      CarbonOS locks DESCO, DPDC, and Titas Gas activity data to SHA-256 evidence
                      digests, dual-control Preparer ≠ Approver governance, and Sentinel-2 + Verra
                      VM0047 conformal uncertainty bounds ready for external VVB inspection.
                    </p>
                  </div>
                  <span ref={wipeProgressRef} className="ed-mono">
                    CALIBRATION 100%
                  </span>
                </div>
                <div className="ed-compare-rows">
                  {COMPARE_VERIFIED.map((row) => (
                    <div key={row.key} className="ed-compare-row">
                      <span className="ed-mono ed-accent-text">{row.key}</span>
                      <p className="ed-compare-row-val">{row.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Work List / System Index (Sticky Header + Scroll-Stacking Cards + Hover/Tap Preview Modal) */}
        <section id="platform" className="ed-work">
          <div id="work" className="ed-container">
            <div className="ed-section-header ed-sticky-header">
              <div>
                <span className="ed-mono ed-accent-text">
                  THREE FLAGSHIP PRODUCTS · ESG · dMRV · CARBON REGISTRY
                </span>
                <h2 className="ed-section-title">SYSTEM INDEX</h2>
              </div>
              <span className="ed-mono">08 DEPLOYABLE WORKSPACES</span>
            </div>
            <p className="ed-section-sub ed-section-sub--lead">
              Flagship enterprise ESG, satellite dMRV, and carbon registry cores supported by
              five specialized workflow modules — hover or inspect any layer to preview how it runs.
            </p>

            <div className="ed-work-stack-layout">
              <div className="ed-work-stack">
                {WORK_ROWS.map((item, index) => (
                  <article
                    key={item.idx}
                    onMouseEnter={() => scheduleModulePreview(item)}
                    onMouseLeave={scheduleModulePreviewClose}
                    className={`ed-work-stack-card ${index < 3 ? 'is-flagship' : ''} ${
                      activePreviewModule?.idx === item.idx ? 'is-active-hover' : ''
                    }`}
                    style={{ '--stack-index': index }}
                  >
                    <div className="ed-work-card-head">
                      <div className="ed-work-card-title-group">
                        <span className="ed-work-idx ed-mono">{item.idx}</span>
                        <div>
                          <span className="ed-mono ed-accent-text">{item.pillarTag}</span>
                          <h3 className="ed-work-name">{item.title}</h3>
                        </div>
                      </div>

                      <div className="ed-work-card-actions">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreviewModule((curr) =>
                              curr?.idx === item.idx ? null : item
                            )
                          }
                          className="ed-pill ed-pill--subtle ed-pill--compact ed-mono"
                        >
                          {activePreviewModule?.idx === item.idx ? 'Hide Preview' : 'Preview Architecture'}
                        </button>
                        <Link
                          to={item.to}
                          data-hover-tag={item.hoverTag}
                          className="ed-pill ed-pill--accent ed-pill--compact"
                        >
                          Open →
                        </Link>
                      </div>
                    </div>

                    <p className="ed-work-card-what">{item.what}</p>

                    <div className="ed-work-card-details">
                      <div>
                        <span className="ed-mono ed-muted-text">HOW CARBONOS HANDLES IT</span>
                        <p>{item.how}</p>
                      </div>
                      <div>
                        <span className="ed-mono ed-muted-text">CORE IDEA</span>
                        <p>{item.coreIdea}</p>
                      </div>
                    </div>

                    <div className="ed-work-card-foot ed-mono ed-muted-text">
                      <span>{item.meta}</span>
                    </div>
                  </article>
                ))}
              </div>

              <EditorialModuleModal
                moduleItem={activePreviewModule}
                onClose={() => setActivePreviewModule(null)}
                onMouseEnter={keepModulePreviewOpen}
                onMouseLeave={scheduleModulePreviewClose}
              />
            </div>

            <div className="ed-quick-links" aria-label="Additional platform routes">
              <span className="ed-mono ed-muted-text">MORE MODULES:</span>
              {QUICK_MODULE_LINKS.map((q) => (
                <Link key={q.to} to={q.to} className="ed-pill ed-pill--subtle ed-pill--compact">
                  {q.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Live Ecological Telemetry (Interactive Station Selector) */}
        <EditorialLiveTelemetry />

        {/* 7. Sector Reference Profiles (Interactive Client Category Filter) */}
        <EditorialClientShowcase />

        {/* 8. High-Integrity Priority Carbon Sectors */}
        <EditorialSectorFocus />

        {/* 9. Inverted Process: Sovereign Philosophy + 5-Step Roadmap (Scroll-Drawn SVG Line) + Framework Pillars */}
        <section ref={processRef} id="process" className="ed-process ed-inverted">
          <div id="framework" className="ed-container">
            {/* Sovereign Manifesto Band with Kinetic Scatter -> Organized Lock BANGLADESH. */}
            <div className="ed-philosophy-band">
              <span className="ed-mono ed-accent-text">
                SOVEREIGN ARCHITECTURE · PRIMARY SOURCE CITATIONS
              </span>
              <p className="ed-philosophy-kicker">
                Most climate software is built for Geneva boardrooms. Carbon Zero BD is built for
              </p>
              <h2
                className={`ed-philosophy-bangladesh ed-bd-kinetic ${
                  bdKineticActive ? 'is-organized' : 'is-scattered'
                }`}
                onMouseEnter={() => setBdKineticActive(false)}
                onMouseLeave={() => setBdKineticActive(true)}
                onClick={() => setBdKineticActive((prev) => !prev)}
                aria-label="BANGLADESH."
              >
                {'BANGLADESH.'.split('').map((ch, idx) => {
                  const sx = ((idx % 4) - 1.5) * 18;
                  const sy = (idx % 2 === 0 ? -1 : 1) * (10 + (idx % 3) * 6);
                  const sr = (idx % 2 === 0 ? -1 : 1) * (6 + (idx % 4) * 3);
                  return (
                    <span
                      key={`${ch}-${idx}`}
                      className={`ed-bd-char ${ch === '.' ? 'ed-accent-text' : ''}`}
                      style={{
                        '--char-index': idx,
                        '--scatter-x': sx,
                        '--scatter-y': sy,
                        '--scatter-rot': sr,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </h2>
              <p className="ed-philosophy-statement">
                You are not a carbon science company. You are climate infrastructure — software,
                automation, and field knowledge anchored in Khulna, Rangpur, Sylhet, and Dhaka.
              </p>
            </div>

            <div className="ed-process-sticky-zone">
              <div className="ed-section-header ed-sticky-header ed-sticky-header--inv">
                <div>
                  <span className="ed-mono ed-accent-text">PROCESS OVERVIEW · 5-STEP ROADMAP</span>
                  <h2 className="ed-section-title">HOW CARBON ZERO BD WORKS</h2>
                </div>
                <span className="ed-mono">DUAL-CONTROL LEDGER ENGINE</span>
              </div>

              <div className="ed-process-grid">
                <div className="ed-process-rail" aria-hidden="true">
                  <svg className="ed-process-svg" viewBox="0 0 28 1000" preserveAspectRatio="none">
                    <line x1="14" y1="0" x2="14" y2="1000" className="ed-process-track-bg" />
                    <line
                      ref={processLineRef}
                      x1="14"
                      y1="0"
                      x2="14"
                      y2="1000"
                      className="ed-process-track-line"
                    />
                  </svg>
                </div>

                <div className="ed-process-steps ed-process-steps--stack">
                  {ROADMAP_STEPS.map((step, idx) => (
                    <div
                      key={step.num}
                      className="ed-process-step ed-process-step--card"
                      style={{ '--step-stack': idx }}
                    >
                      <div>
                        <span className="ed-mono ed-accent-text">{step.num}</span>
                        <h3 className="ed-process-step-title">{step.title}</h3>
                      </div>
                      <div className="ed-process-step-body">
                        <p className="ed-process-step-desc">{step.desc}</p>
                        <div className="ed-process-tags">
                          {step.metrics.map((tag) => (
                            <span key={tag} className="ed-process-tag ed-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ed-container ed-fw-wrap">
            {/* 3 Framework Alignment Pillars Auto-Carousel */}
            <EditorialFrameworkCarousel />
          </div>
        </section>

        {/* 10. Predictable Scaling Pricing */}
        <EditorialPricing />

        {/* 11. Contact (Footer Background Image + Mailto Link + Auto-Carousel Facts + Centered CARBONZERO Wordmark) */}
        <section id="contact" className="ed-contact">
          <div
            className="ed-contact-bg-photo"
            style={{ backgroundImage: 'url("/footer_landscape.png")' }}
            aria-hidden="true"
          />
          <div className="ed-contact-bg-scrim" aria-hidden="true" />

          <div className="ed-container ed-contact-inner">
            <div className="ed-contact-top">
              <span className="ed-mono">INITIATE AUDIT OR INSTITUTIONAL ONBOARDING</span>
              {/* Placeholder contact mailbox — see docs/copy-needed.md to confirm final production address */}
              <a href="mailto:hello@carbonzerobd.com" data-magnetic className="ed-contact-mail">
                hello@carbonzerobd.com
              </a>

              <div className="ed-hero-buttons">
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  data-magnetic
                  className="ed-pill ed-pill--accent"
                >
                  Schedule Enterprise Briefing →
                </button>
                <Link to="/platform/saas-dashboard" data-magnetic className="ed-pill">
                  Launch ESG Portal →
                </Link>
                <Link to="/platform/carbon-registry" className="ed-pill">
                  Registry Terminal
                </Link>
                <Link to="/company/api-docs" className="ed-pill">
                  Developer API
                </Link>
              </div>
            </div>

            {/* Auto-Carousel Institutional Facts Strip */}
            <div
              className="ed-facts-carousel"
              onMouseEnter={() => setFactsPaused(true)}
              onMouseLeave={() => setFactsPaused(false)}
            >
              <div className="ed-facts-grid">
                {INSTITUTIONAL_FACTS.map((fact, idx) => (
                  <div
                    key={fact.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setFactsPaused(true);
                      setFactsSlideIdx(idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFactsPaused(true);
                        setFactsSlideIdx(idx);
                      }
                    }}
                    className={`ed-fact-cell ${factsSlideIdx === idx ? 'is-highlighted' : ''}`}
                  >
                    <span className="ed-mono">{fact.key}</span>
                    <p className="ed-fact-val">{fact.val}</p>
                  </div>
                ))}
              </div>
              <div className="ed-facts-carousel-bar">
                <span className="ed-mono ed-accent-text">
                  {INSTITUTIONAL_FACTS[factsSlideIdx]?.key}:{' '}
                  {INSTITUTIONAL_FACTS[factsSlideIdx]?.val}
                </span>
                <div className="ed-facts-dots" role="tablist" aria-label="Footer metadata highlight">
                  {INSTITUTIONAL_FACTS.map((fact, idx) => (
                    <button
                      key={fact.key}
                      type="button"
                      role="tab"
                      aria-selected={factsSlideIdx === idx}
                      aria-label={fact.key}
                      onClick={() => {
                        setFactsPaused(true);
                        setFactsSlideIdx(idx);
                      }}
                      className={`ed-facts-dot ${factsSlideIdx === idx ? 'is-active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ed-container ed-wordmark-crop ed-wordmark-crop--centered" aria-hidden="true">
            <span className="ed-wordmark-text ed-wordmark-text--centered">CARBONZERO</span>
          </div>
        </section>
      </main>

      {/* 12. Full 4-Column Config-Driven Footer (All 19 App Routes + Controls Preserved) */}
      <footer className="ed-footer">
        <div className="ed-container">
          <div className="ed-footer-top">
            <div className="ed-footer-brand">
              <Link to={footerConfig.brand.homeRoute} className="ed-brand">
                <span>
                  CARBON ZERO <span className="ed-accent-text">BD</span>
                </span>
              </Link>
              <p className="ed-footer-mission">
                {t(footerConfig.brand.missionKey, footerConfig.brand.missionDefault)}
              </p>
            </div>

            <div className="ed-footer-controls">
              <button
                type="button"
                onClick={toggleLanguage}
                className="ed-pill ed-pill--subtle ed-pill--compact ed-mono"
              >
                {isBengali ? 'English (EN)' : 'বাংলা'}
              </button>

              <div className="ed-theme-pills" role="radiogroup" aria-label="Footer color theme">
                {[
                  { id: 'light', label: 'Paper' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'system', label: 'System' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === opt.id}
                    onClick={(e) => setTheme(opt.id, e)}
                    className={`ed-pill ed-pill--subtle ed-pill--compact ${
                      mode === opt.id ? 'is-filter-active' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleBackToTop}
                className="ed-pill ed-pill--subtle ed-pill--compact"
              >
                {t('footer.backToTop', 'Top')} ↑
              </button>
            </div>
          </div>

          {/* Desktop / Tablet 4-Column Links */}
          <nav className="ed-footer-cols" aria-label="Footer navigation">
            {footerConfig.columns.map((col) => (
              <div key={col.id} className="ed-footer-col">
                <h3 className="ed-mono ed-muted-text ed-footer-col-title">
                  {t(col.titleKey, col.defaultTitle)}
                </h3>
                <ul className="ed-footer-list">
                  {col.links.map((link) => (
                    <li key={link.id}>
                      <Link to={link.to} className="ed-footer-link">
                        {t(link.labelKey, link.defaultLabel)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Mobile Accordion Columns (< 640px) */}
          <nav className="ed-footer-accordions" aria-label="Mobile footer navigation">
            {footerConfig.columns.map((col) => {
              const isOpen = openFooterCol === col.id;
              const panelId = `ed-footer-acc-${col.id}`;
              return (
                <div key={col.id} className="ed-footer-acc">
                  <button
                    type="button"
                    onClick={() => setOpenFooterCol((prev) => (prev === col.id ? null : col.id))}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="ed-footer-acc-btn ed-mono"
                  >
                    <span>{t(col.titleKey, col.defaultTitle)}</span>
                    <span>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <ul id={panelId} className="ed-footer-list ed-footer-acc-list">
                      {col.links.map((link) => (
                        <li key={link.id}>
                          <Link to={link.to} className="ed-footer-link">
                            {t(link.labelKey, link.defaultLabel)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="ed-footer-bottom ed-mono ed-muted-text">
            <span>
              © {currentYear}{' '}
              {t(
                footerConfig.brand.copyrightEntityKey,
                footerConfig.brand.copyrightEntityDefault
              )}
              . {t('footer.rights', 'All rights reserved.')}
            </span>
            <span>CARBONOS · BANGLADESH NATIONAL dMRV &amp; ESG INFRASTRUCTURE</span>
          </div>
        </div>
      </footer>

      <RequestDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

export default EditorialLanding;
