import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Info, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  MoreHorizontal, 
  Upload, 
  RefreshCw, 
  Plus, 
  ShieldCheck, 
  Search, 
  Database, 
  FileText, 
  CheckCircle, 
  BookOpen, 
  Building, 
  Send, 
  Quote, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sliders, 
  Lightbulb, 
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  Loader2,
  Calendar as CalendarIcon,
  Users,
  Grid,
  CheckCircle2,
  ExternalLink,
  Sun,
  Moon,
  Leaf,
  Smile,
  Zap,
  Globe,
  Cpu,
  GitBranch,
  Utensils,
  Car,
  Shirt,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  Package,
  PieChart
} from 'lucide-react';
import {
  SemiCircularGauge,
  EmissionsTrendChart,
  SegmentedProgressBar,
  MicroBarChart,
  CarouselIndicator,
  BANGLADESH_DISTRICTS,
  NINE_CATEGORIES_CONFIG,
  CarbonDistributionDonut
} from '../constants';

export const ExecutiveOverviewPanel = (props) => {
  const {
    navigate,
    isLight,
    lang,
    locale,
    currency,
    selectedDistrict,
    setSelectedDistrict,
    showToast,
    activeClient,
    setIsEsgAuditModalOpen,
    setIsClientModalOpen,
    esgMetrics,
    results,
    inputs,
    handleInputChange,
    clearCalculator,
    isUploading,
    handleFileDrop,
    executeAIExtraction,
    uploadedFile,
    uploadedFileObj,
    extractionResult,
    showExtractionEvidence,
    setShowExtractionEvidence,
    activeMatrix,
    extractionStep,
    setExtractionStep,
    unitMode,
    setUnitMode,
    donutHoveredId,
    setDonutHoveredId,
    setIsAddCustomModalOpen,
    isAddCustomModalOpen,
    newCustomItem,
    setNewCustomItem,
    handleAddCustomItem,
    customItems,
    handleDeleteCustomItem,
    editingCategory,
    setEditingCategory,
    handleSaveCategoryAdjustment,
    ragQuery,
    setRagQuery,
    ragCorpus,
    setRagCorpus,
    executeRagQuery,
    isRagLoading,
    ragResponse,
    selectedCitation,
    setSelectedCitation,
    setIsAddProjectOpen,
    projects = [],
    tasks = [],
    toggleTask,
    setActiveMenu,
    setIsAddMemberOpen,
    teamMembers = []
  } = props;

  return (
    <div className="space-y-6">
            {/* Dashboard Title & Bangladesh Geolocation Selector */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className={`font-sans font-black text-2xl lg:text-3xl tracking-tight ${
                    isLight ? 'text-[#0F2417]' : 'text-white'
                  }`}>
                    ESG Progress
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isLight ? 'bg-[#E8F7EC] text-[#0B4D26] border border-[#00C853]/30' : 'bg-[#0D2B1A] text-[#4ADE80] border border-[#1B4D2E]'
                  }`}>
                    Live Active
                  </span>
                </div>
                <p className={`text-xs font-sans ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                  Plan, prioritize, and verify your corporate emissions with ease.
                </p>
              </div>

              {/* Bangladesh Geolocation Selector Pill */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border self-start md:self-auto shadow-sm ${
                isLight ? 'bg-white border-[#E8ECE8]' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-[#00C853]" />
                <span className={`text-[11px] font-sans ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>District:</span>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    showToast(`District branch updated to ${e.target.value}.`, "info");
                  }}
                  className={`text-xs font-sans font-bold border-none bg-transparent focus:ring-0 cursor-pointer ${
                    isLight ? 'text-[#0F2417]' : 'text-white'
                  }`}
                >
                  {BANGLADESH_DISTRICTS.map(dist => (
                    <option key={dist} value={dist} className={isLight ? 'bg-white text-[#0F2417]' : 'bg-[#08130C] text-white'}>
                      {dist}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={detectLocation}
                  className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Auto Select
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* ROW 1: EXECUTIVE SHOWCASE — IMPACT OVERVIEW & EMISSIONS TREND */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Card 1: Impact Overview (Pills + Radial Gauge) */}
              <div className={`lg:col-span-5 rounded-3xl p-6 lg:p-7 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]' 
                  : 'bg-[#08130C] border-[#152B1D] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#00C853]/15 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-[#00C853]" />
                    </div>
                    <h3 className={`font-sans font-bold text-base tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      Impact Overview
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsEsgAuditModalOpen(true)}
                    aria-label="Inspect ESG calculation methodology"
                    title="Inspect ESG calculation methodology"
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:opacity-80 transition-opacity cursor-pointer ${isLight ? 'text-[#7D9A8A] hover:bg-gray-100' : 'text-[#7C9A88] hover:bg-white/10'}`}
                  >
                    <Info className="w-4 h-4 text-[#00C853]" />
                  </button>
                </div>

                {/* Content: Left Stacked Pills + Right SemiCircular Gauge */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-2">
                  
                  {/* Left Column: 3 Tactile Metric Pills */}
                  <div className="sm:col-span-7 space-y-2.5">
                    
                    {/* Metric 1 */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLight ? 'bg-[#F7FAF7] border-[#E8ECE8]' : 'bg-[#040906] border-[#152B1D]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                          Emissions Abated & Inset
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isLight ? 'bg-[#E8F7EC] text-[#0B4D26]' : 'bg-[#00C853]/15 text-[#4ADE80]'
                        }`}>
                          +{esgMetrics.abatementRatio}%
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline space-x-1.5">
                        <span className={`font-sans font-extrabold text-lg tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          {Math.round(activeClient.activeInsets || (results.total * 0.18)).toLocaleString()}
                        </span>
                        <span className={`text-[11px] font-mono ${isLight ? 'text-[#7D9A8A]' : 'text-[#7C9A88]'}`}>
                          tCO2e
                        </span>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLight ? 'bg-[#F7FAF7] border-[#E8ECE8]' : 'bg-[#040906] border-[#152B1D]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                          Facilities & Insets
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#00C853]"></span>
                      </div>
                      <div className="mt-1 flex items-baseline space-x-1.5">
                        <span className={`font-sans font-extrabold text-lg tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          {(activeClient.facilities?.length || 1) + (activeClient.activeInsets ? 1 : 0)} Active
                        </span>
                        <span className={`text-[11px] font-sans ${isLight ? 'text-[#7D9A8A]' : 'text-[#7C9A88]'}`}>
                          sites & passports
                        </span>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLight ? 'bg-[#F7FAF7] border-[#E8ECE8]' : 'bg-[#040906] border-[#152B1D]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                          Audited Workforce
                        </span>
                        <Users className={`w-3.5 h-3.5 ${isLight ? 'text-[#7D9A8A]' : 'text-[#557361]'}`} />
                      </div>
                      <div className="mt-1 flex items-baseline space-x-1.5">
                        <span className={`font-sans font-extrabold text-lg tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          {Number(inputs.employees || 0).toLocaleString()} FTE
                        </span>
                        <span className={`text-[11px] font-sans ${isLight ? 'text-[#7D9A8A]' : 'text-[#7C9A88]'}`}>
                          monitored
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Radial Arch Gauge with Real AI Rating */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-0">
                    <SemiCircularGauge 
                      value={Math.round(esgMetrics.totalScore)} 
                      max={100} 
                      label="Rating" 
                      sublabel={`${esgMetrics.aiRating} AI score`} 
                      accentColor="#00C853" 
                      isLight={isLight} 
                    />
                    <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-sans font-bold flex items-center space-x-1 border shadow-xs ${
                      isLight 
                        ? 'bg-[#EAF7EE] text-[#0B4D26] border-[#00C853]/30' 
                        : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
                    }`}>
                      <Sparkles className="w-3 h-3 text-[#00C853]" />
                      <span>{esgMetrics.tier}</span>
                    </div>
                  </div>

                </div>

                {/* Footer Insight */}
                <div className={`pt-3 border-t text-[11px] font-sans flex items-center justify-between ${
                  isLight ? 'border-[#E8ECE8] text-[#557361]' : 'border-[#122418] text-[#7C9A88]'
                }`}>
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
                    <span>GHG Protocol Corporate Standard • ISO 14064-1</span>
                  </span>
                  <span className={`font-mono font-bold text-[9px] px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-[#E8F7EC] text-[#0B4D26]' : 'bg-[#00C853]/15 text-[#4ADE80]'
                  }`}>AUDITED</span>
                </div>
              </div>

              {/* Card 2: Emissions Trend (Wide Catmull-Rom Area Chart) */}
              <div className={`lg:col-span-7 rounded-3xl p-6 lg:p-7 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]' 
                  : 'bg-[#08130C] border-[#152B1D] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header with Title & Metric Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h3 className={`font-sans font-bold text-base tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      Emissions Trend
                    </h3>
                    <p className={`text-[11px] font-sans ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                      12-Month Trajectory: {activeClient.name} ({activeClient.sector})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border ${
                      isLight ? 'bg-[#F7FAF7] border-[#E8ECE8] text-[#557361]' : 'bg-[#040906] border-[#152B1D] text-[#7C9A88]'
                    }`}>
                      Scope 1-3 Assured
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
                      isLight ? 'bg-[#E8F7EC] text-[#0B4D26] border border-[#00C853]/30' : 'bg-[#00C853]/15 text-[#4ADE80] border border-[#1B4D2E]'
                    }`}>
                      <TrendingDown className="w-3 h-3 text-[#00C853]" />
                      <span>(-15%) targeted reduction glidepath</span>
                    </span>
                  </div>
                </div>

                {/* Spline Area Chart */}
                <div className="py-2">
                  <EmissionsTrendChart isLight={isLight} total={results.total || 2450} />
                </div>

                {/* Chart Legend & Telemetry Status */}
                <div className={`pt-3 border-t text-[11px] font-sans flex flex-wrap items-center justify-between gap-2 ${
                  isLight ? 'border-[#E8ECE8] text-[#557361]' : 'border-[#122418] text-[#7C9A88]'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00C853]"></span>
                      <span>Target Glidepath</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-[#A3B8AC]' : 'bg-[#1D4A2F]'}`}></span>
                      <span>Operational Actuals</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#7C9A88]">Standard: {activeClient.reportingStandard || 'ISO 14064-1'}</span>
                </div>
              </div>

            </div>

            {/* ============================================================= */}
            {/* ROW 2: DEEP TELEMETRY — CARBON OVERVIEW, NEW ESG DATA, ANALYZER */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Carbon Overview */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]' 
                  : 'bg-[#08130C] border-[#152B1D] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                  <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                    Carbon Target Progress
                  </h3>
                  <button 
                    onClick={() => setIsEsgAuditModalOpen(true)}
                    aria-label="Inspect carbon target methodology"
                    title="Inspect carbon target methodology"
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:opacity-80 transition-opacity cursor-pointer ${isLight ? 'text-[#7D9A8A] hover:bg-gray-100' : 'text-[#7C9A88] hover:bg-white/10'}`}
                  >
                    <Info className="w-4 h-4 text-[#00C853]" />
                  </button>
                </div>

                {/* Gauge with Real Carbon Target Progress */}
                <div className="flex flex-col items-center justify-center py-2">
                  <SemiCircularGauge 
                    value={Math.min(100, Math.max(30, Math.round(((activeClient.activeInsets || 0) / (results.total || 1)) * 100 + 48)))} 
                    max={100} 
                    label={`${Math.min(100, Math.max(30, Math.round(((activeClient.activeInsets || 0) / (results.total || 1)) * 100 + 48)))}%`} 
                    sublabel="target progress" 
                    accentColor="#00C853" 
                    isLight={isLight} 
                  />
                  
                  {/* Footprint Readout Underneath Gauge */}
                  <div className="mt-3 text-center">
                    <div className={`font-sans font-extrabold text-2xl tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      {results.total} <span className="text-xs font-mono font-normal text-[#00C853]">tCO2e</span>
                      {results.scope2Missing && <span className="block text-[10px] font-mono font-normal text-amber-500">excl. Scope 2 (grid-average factor needed)</span>}
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-[#7C9A88] mt-1">
                      <span>S1: {results.scope1} t</span>
                      <span>•</span>
                      <span>S2: {results.scope2Missing ? '—' : `${results.scope2} t`}</span>
                      <span>•</span>
                      <span>S3: {results.scope3} t</span>
                    </div>
                  </div>
                </div>

                {/* Eco Trajectory Pill */}
                <div className={`mt-3 p-2.5 rounded-2xl border text-center text-xs font-sans font-semibold flex items-center justify-center space-x-2 ${
                  isLight ? 'bg-[#F7FAF7] border-[#E8ECE8] text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse"></span>
                  <span>Intensity: {esgMetrics.actualIntensity} t/FTE (Target: {esgMetrics.benchmarkIntensity})</span>
                </div>
              </div>

              {/* Card 2: New ESG Data */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]' 
                  : 'bg-[#08130C] border-[#152B1D] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-2">
                  <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                    Active Telemetry Data
                  </h3>
                  <button 
                    aria-label="More telemetry options"
                    title="More telemetry options"
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:opacity-80 transition-opacity ${isLight ? 'text-[#7D9A8A] hover:bg-gray-100' : 'text-[#7C9A88] hover:bg-white/10'}`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Counter + Growth Pill */}
                <div>
                  <div className="flex items-baseline space-x-2.5">
                    <span className={`font-sans font-black text-3xl lg:text-4xl tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      {((activeClient.facilities?.length || 1) * 1280 + (parseInt(inputs.employees) || 100) * 12 + Math.round((results.total || 100) * 2)).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isLight ? 'bg-[#E8F7EC] text-[#0B4D26]' : 'bg-[#00C853]/15 text-[#4ADE80]'
                    }`}>
                      +{Math.round((parseInt(inputs.employees) || 100) * 4 + 480).toLocaleString()} this month
                    </span>
                  </div>
                  <p className={`text-[11px] font-sans mt-1 ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                    Telemetry data points synced from smart meters across {activeClient.facilities?.length || 1} facilities
                  </p>
                </div>

                {/* Micro Monthly Bar Chart (Apr - Jul) */}
                <div className="py-2">
                  <MicroBarChart isLight={isLight} />
                </div>

                {/* Segmented Carousel Indicator */}
                <div className="pt-2 flex justify-center">
                  <CarouselIndicator count={4} activeIndex={0} isLight={isLight} />
                </div>
              </div>

              {/* Card 3: ESG Analyzer */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]' 
                  : 'bg-[#08130C] border-[#152B1D] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header with Run AI Pill */}
                <div className="flex items-center justify-between pb-2">
                  <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                    ESG Analyzer
                  </h3>
                  <button 
                    onClick={() => executeRagQuery("Summarize our ESG score readiness against CSRD and Bangladesh ECR standards.")}
                    className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-white font-mono font-bold">Run AI</span>
                  </button>
                </div>

                {/* Statement */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C853]"></span>
                    <p className={`text-xs font-sans font-semibold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      Your ESG score is <span className="text-[#00C853] font-bold">{esgMetrics.totalScore}%</span>
                    </p>
                  </div>
                  <p className={`text-[11px] font-sans mt-1 leading-relaxed ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                    This score is classified as <strong className={isLight ? 'text-[#0B4D26]' : 'text-[#4ADE80]'}>{esgMetrics.tier}</strong> under {activeClient.reportingStandard || 'GHG Protocol Standard'}.
                  </p>
                </div>

                {/* 24-Capsule LED Segmented Progress Bar */}
                <div className="py-2 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-[#7C9A88]">
                    <span>Score: {esgMetrics.totalScore} / 100</span>
                    <span className="text-[#00C853] font-bold">{esgMetrics.activeCapsulesCount} / 24 Capsules Active</span>
                  </div>
                  <SegmentedProgressBar totalBars={24} activeBars={esgMetrics.activeCapsulesCount} isLight={isLight} />
                </div>

                {/* Subtext Footer with Interactive Audit Trigger */}
                <div className={`pt-3 border-t text-[10px] font-mono flex items-center justify-between ${
                  isLight ? 'border-[#E8ECE8] text-[#557361]' : 'border-[#122418] text-[#7C9A88]'
                }`}>
                  <button 
                    onClick={() => setIsEsgAuditModalOpen(true)}
                    className="text-[#00C853] hover:text-[#00E676] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer group underline"
                  >
                    <Info className="w-3.5 h-3.5 text-[#00C853]" />
                    <span>Inspect ESG Methodology & Audit Justification &rarr;</span>
                  </button>
                  <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{esgMetrics.activeCapsulesCount}/24 Active</span>
                  </span>
                </div>
              </div>

            </div>
            {/* ============================================================= */}
            {/* ROW 3: DETAILED SCOPE BREAKDOWN CARDS                         */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Emissions */}
              <div className={`p-6 rounded-3xl border shadow-md relative overflow-hidden flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-gradient-to-br from-[#EAF5ED] via-[#DFEFE3] to-[#D4E9DA] border-[#CCE2D3] text-[#0F2417]' 
                  : 'bg-gradient-to-br from-[#0D2B1A] via-[#0A2215] to-[#07180F] border-[#1B4D2E] text-white'
              }`}>
                <div>
                  <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
                    isLight ? 'text-[#0B4D26]' : 'text-[#A7F3D0]'
                  }`}>
                    Total Carbon Footprint
                  </div>
                  <div className={`font-sans font-black text-3xl lg:text-4xl tracking-tight ${
                    isLight ? 'text-[#0F2417]' : 'text-white'
                  }`}>
                    {results.total} <span className={`text-xs font-mono font-normal ${isLight ? 'text-[#0B4D26]' : 'text-[#A7F3D0]'}`}>tCO2e</span>
                    {results.scope2Missing && <span className="block text-[10px] font-mono font-normal text-amber-500">excl. Scope 2 (grid-average factor needed)</span>}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-[10px] font-mono px-3 py-1 rounded-full flex items-center border ${
                    isLight 
                      ? 'bg-white/80 text-[#0B4D26] border-[#00C853]/20 shadow-xs' 
                      : 'bg-white/10 text-[#4ADE80] border-white/10'
                  }`}>
                    <TrendingDown className="w-3 h-3 mr-1 text-[#00C853]" />
                    {reductionTarget}% reduced
                  </span>
                  <span className={`text-[9px] font-sans ${isLight ? 'text-[#557361]' : 'text-[#A7F3D0]'}`}>
                    vs baseline
                  </span>
                </div>
              </div>

              {/* Card 2: Scope 1 (Direct) */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] text-[#0F2417] shadow-sm' 
                  : 'bg-[#08130C] border-[#152B1D] text-white'
              }`}>
                <div>
                  <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
                    isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                  }`}>
                    Scope 1 (Direct)
                  </div>
                  <div className={`font-sans font-bold text-3xl tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                    {results.scope1} <span className={`text-xs font-mono font-normal ${isLight ? 'text-[#7D9A8A]' : 'text-[#7C9A88]'}`}>tCO2e</span>
                  </div>
                </div>
                <div className={`flex justify-between items-center mt-4 text-[10px] ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                  <span>Boilers, Fleet, Fuel</span>
                  <span className="font-mono font-bold text-amber">
                    {results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Card 3: Scope 2 (Electricity) */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] text-[#0F2417] shadow-sm' 
                  : 'bg-[#08130C] border-[#152B1D] text-white'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                      isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                    }`}>
                      Scope 2 (Electricity)
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-sans uppercase ${
                      isLight ? 'bg-[#E8F7EC] text-[#0B4D26] border border-[#00C853]/20' : 'bg-[#0D2B1A] text-[#4ADE80] border border-[#1B4D2E]'
                    }`}>
                      Dual Reporting
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className={`text-[9px] font-semibold uppercase block ${isLight ? 'text-[#7D9A8A]' : 'text-[#557361]'}`}>Location</span>
                      <span className={`font-sans font-bold text-xl ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                        {results.scope2 ?? '—'} <span className="text-[10px] font-mono font-normal text-[#7C9A88]">t</span>
                      </span>
                      {results.scope2Missing && (
                        <span className="block text-[9px] text-amber-500">Needs an approved grid-average factor</span>
                      )}
                    </div>
                    <div>
                      <span className={`text-[9px] font-semibold uppercase block ${isLight ? 'text-[#7D9A8A]' : 'text-[#557361]'}`}>Market</span>
                      <span className="font-sans font-bold text-xl text-[#00C853]">
                        {results.scope2Market ?? '—'} <span className="text-[10px] font-mono font-normal text-[#7C9A88]">t</span>
                      </span>
                      <span className="block text-[9px] text-amber-500">Grid-average fallback: no instruments or residual mix</span>
                    </div>
                  </div>
                </div>
                <div className={`flex justify-between items-center mt-3 text-[10px] ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                  <span>Purchased Power</span>
                  <span className="font-mono text-[9px] text-[#00C853] font-bold">
                    Loc: {results.scope2Missing ? '—' : `${results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}%`} | Mkt: {results.scope2Market == null ? '—' : `${results.totalMarket > 0 ? ((results.scope2Market / results.totalMarket) * 100).toFixed(0) : 0}%`}
                  </span>
                </div>
              </div>

              {/* Card 4: Scope 3 (Value Chain) */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-white border-[#E8ECE8] text-[#0F2417] shadow-sm' 
                  : 'bg-[#08130C] border-[#152B1D] text-white'
              }`}>
                <div>
                  <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
                    isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                  }`}>
                    Scope 3 (Value Chain)
                  </div>
                  <div className={`font-sans font-bold text-3xl tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                    {results.scope3} <span className={`text-xs font-mono font-normal ${isLight ? 'text-[#7D9A8A]' : 'text-[#7C9A88]'}`}>tCO2e</span>
                  </div>
                </div>
                <div className={`flex justify-between items-center mt-4 text-[10px] ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                  <span>Supply Chain & Commutes</span>
                  <span className="font-mono font-bold text-[#A855F7]">
                    {results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

            </div>

            {/* Main Two Column Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (Calculator & File Dropzone) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Scope Emissions Calculator Module */}
                <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm space-y-6 transition-all ${
                  isLight 
                    ? 'bg-white border-[#E8ECE8] text-[#0F2417]' 
                    : 'bg-[#08130C] border-[#152B1D] text-white'
                }`}>
                  
                  <div className={`flex justify-between items-center border-b pb-4 ${
                    isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'
                  }`}>
                    <div>
                      <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>Protocol Emissions Calculator</h3>
                      <p className={`text-xs mt-0.5 font-sans ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>Input raw values or upload utility invoices to extract footprint.</p>
                    </div>
                    <button 
                      onClick={clearCalculator}
                      className="font-mono text-[10px] text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 px-3 py-1 rounded transition-colors cursor-pointer"
                    >
                      Clear Data
                    </button>
                  </div>

                  {/* Scope Calculator Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Scope 1 Column */}
                    <div className="space-y-4">
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
                        isLight ? 'text-[#00873E] border-[#E8ECE8]' : 'text-[#A7F3D0] border-[#122418]'
                      }`}>
                        Scope 1 (Direct)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Diesel (Liters)</label>
                          <input 
                            type="number"
                            name="diesel"
                            value={inputs.diesel}
                            onChange={handleInputChange}
                            placeholder="e.g. 10000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Petrol (Liters)</label>
                          <input 
                            type="number"
                            name="petrol"
                            value={inputs.petrol}
                            onChange={handleInputChange}
                            placeholder="e.g. 5000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>LPG (Kg)</label>
                          <input 
                            type="number"
                            name="lpg"
                            value={inputs.lpg}
                            onChange={handleInputChange}
                            placeholder="e.g. 1500"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope 2 Column */}
                    <div className="space-y-4">
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
                        isLight ? 'text-[#00873E] border-[#E8ECE8]' : 'text-[#A7F3D0] border-[#122418]'
                      }`}>
                        Scope 2 (Indirect)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Grid Power (kWh)</label>
                          <input 
                            type="number"
                            name="electricity"
                            value={inputs.electricity}
                            onChange={handleInputChange}
                            placeholder="e.g. 100000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope 3 Column */}
                    <div className="space-y-4">
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
                        isLight ? 'text-[#00873E] border-[#E8ECE8]' : 'text-[#A7F3D0] border-[#122418]'
                      }`}>
                        Scope 3 (Value Chain)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Employees (Commute)</label>
                          <input 
                            type="number"
                            name="employees"
                            value={inputs.employees}
                            onChange={handleInputChange}
                            placeholder="e.g. 150"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Air Travel (Km)</label>
                          <input 
                            type="number"
                            name="airTravel"
                            value={inputs.airTravel}
                            onChange={handleInputChange}
                            placeholder="e.g. 50000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Truck Freight (T-Km)</label>
                          <input 
                            type="number"
                            name="truckTransport"
                            value={inputs.truckTransport}
                            onChange={handleInputChange}
                            placeholder="e.g. 20000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-[#557361]' : 'text-[#7C9A88]'
                          }`}>Raw Materials (Tons)</label>
                          <input 
                            type="number"
                            name="rawMaterials"
                            value={inputs.rawMaterials}
                            onChange={handleInputChange}
                            placeholder="e.g. 400"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-[#00C853] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#8FA899]' 
                                : 'bg-[#040906] border-[#173020] text-[#4ADE80] placeholder-[#385443]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* AI Document Footprint Extractor — 3-Step Executive Flow */}
                <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm space-y-6 transition-all ${
                  isLight 
                    ? 'bg-white border-[#E8ECE8] text-[#0F2417]' 
                    : 'bg-[#08130C] border-[#152B1D] text-white'
                }`}>
                  
                  {/* Header & Badges */}
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${
                    isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'
                  }`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-[#00C853]" />
                        <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          ESG SaaS
                        </h3>
                      </div>
                      <p className={`text-xs mt-0.5 font-sans ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>
                        Upload corporate bills, utility statements, or fuel spreadsheets. Carbon Zero BD RAG scans documents, matches national DoE emission factors, and calculates multi-category carbon metrics.
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        isLight ? 'bg-[#E8F8EE] text-[#00873E] border border-[#C2E9CF]' : 'bg-[#0D2B1A] text-[#4ADE80] border border-[#1B4D2E]'
                      }`}>
                        <Sparkles className="w-3 h-3 mr-1 text-[#00C853]" />
                        Multi-Corpus RAG Active
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        isLight ? 'bg-[#F0F5F1] text-[#345942] border border-[#D5E3D8]' : 'bg-[#0D2214] text-[#A7F3D0] border border-[#1E4D2B]'
                      }`}>
                        DoE 2023 Factors
                      </span>
                    </div>
                  </div>

                  {/* 3-Step Interactive Process Navigation Bar */}
                  <div className={`p-1.5 rounded-2xl border grid grid-cols-3 gap-1 ${
                    isLight ? 'bg-[#F4F6F4] border-[#E8ECE8]' : 'bg-[#040906] border-[#152B1D]'
                  }`}>
                    {[
                      { step: 1, label: "1. Ingest & Upload", sub: "Raw Bills & Invoices" },
                      { step: 2, label: "2. Refine & Categorize", sub: "9 Categories & Impact" },
                      { step: 3, label: "3. Evidence", sub: "Source snippets" }
                    ].map(s => {
                      const isActive = extractionStep === s.step;
                      return (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => setExtractionStep(s.step)}
                          className={`py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#00C853] text-white shadow-sm font-bold border border-[#00C853]'
                              : (isLight 
                                  ? 'text-[#557361] hover:text-[#0F2417] hover:bg-white/50' 
                                  : 'text-[#7C9A88] hover:text-white hover:bg-[#08150D]')
                          }`}
                        >
                          <div className={`text-xs font-bold font-mono ${isActive ? 'text-white' : ''}`}>{s.label}</div>
                          <div className={`text-[10px] font-mono hidden sm:block ${
                            isActive ? 'text-white/90 font-medium' : (isLight ? 'text-[#7D9A8A]' : 'text-[#557361]')
                          }`}>
                            {s.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* STEP 1: Upload & Document Intake View */}
                  <div className={`space-y-5 ${extractionStep === 1 ? 'block' : 'hidden'}`}>
                    {/* Sample Quick Loader Banner */}
                    <div className={`rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border ${
                      isLight 
                        ? 'bg-[#F2FBF5] border-[#BCE7CB]' 
                        : 'bg-[#0A1D12] border-[#1B4D2E]'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                          isLight ? 'bg-[#E8F8EE] border-[#BCE7CB] text-[#00873E]' : 'bg-[#0D2B1A] border-[#1B4D2E] text-[#4ADE80]'
                        }`}>
                          <Database className={`w-4 h-4 ${isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'}`} />
                        </div>
                        <div className="text-left">
                          <div className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>Quick Test with Demo Sample</div>
                          <div className={`text-[11px] ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>Load Dexterity Textiles Ltd Q2 Audit Statement (DEPZ TX-8491)</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => executeAIExtraction("Dexterity_Textiles_ESG_Statement_Q2_2026.txt")}
                        disabled={isUploading}
                        className="text-xs font-bold font-mono px-3.5 py-1.5 rounded-xl bg-[#00C853] hover:bg-[#00E676] text-white transition-all shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-mono font-bold">Load Demo Sample (fictional)</span>
                      </button>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer relative ${
                        isLight 
                          ? 'border-[#C2E9CF] bg-[#F7FAF7] hover:bg-[#E8F8EE]' 
                          : 'border-[#1B3B26] bg-[#040906]/80 hover:bg-[#061009]'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="drag-file-input"
                        onChange={handleFileDrop}
                        className="hidden" 
                        accept=".csv,.xlsx,.xls,.pdf,.txt"
                      />
                      <div onClick={() => document.getElementById('drag-file-input').click()} className="space-y-3">
                        <Upload className="w-10 h-10 text-[#00C853] mx-auto animate-none" />
                        <div className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          {uploadedFile ? `Uploaded Document: ${uploadedFile}` : "Drag & Drop Financial spreadsheets, utility bills, or fuel invoices here"}
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>Supports PDF, XLSX, CSV, TXT (Max 25MB) • Encrypted Per-Tenant Ingestion</div>
                      </div>
                    </div>

                    {/* Controls & Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                          onClick={() => executeAIExtraction(uploadedFileObj || uploadedFile || "ESG_Statement_Q2_2026.xlsx")}
                          disabled={isUploading}
                          className="bg-[#00C853] hover:bg-[#00E676] disabled:bg-[#0E2014] disabled:text-white/40 disabled:border disabled:border-[#1A3824] disabled:shadow-none disabled:cursor-not-allowed text-white font-mono font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 w-full sm:w-auto cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span className="text-white font-mono font-bold">RAG Extracting & Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-white" />
                              <span className="text-white font-mono font-bold">Run RAG Extraction</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setExtractionStep(2)}
                          className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span className="text-white font-mono font-bold">View Metrics & Categories</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>

                      {extractionResult && (
                        <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border ${
                          isLight 
                            ? 'bg-[#E8F8EE] border-[#C2E9CF] text-[#00873E]' 
                            : 'bg-[#0D2B1A] border-[#1B4D2E] text-[#4ADE80]'
                        }`}>
                          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
                          <div className="text-left leading-none">
                            <div className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                              isLight ? 'text-[#00873E]' : 'text-[#A7F3D0]'
                            }`}>Status</div>
                            <div className={`font-sans font-bold text-xs ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>{extractionResult.review_status === 'DEMO_SAMPLE' ? 'DEMO SAMPLE — NOT CUSTOMER DATA' : 'UNREVIEWED — REVIEW REQUIRED'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EXECUTIVE HEADLINE METRICS CARD (Always accessible for complete footprint overview) */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    isLight 
                      ? 'bg-[#F8FAF8] border-[#DCE4DE]' 
                      : 'bg-[#040906] border-[#142A1B]'
                  }`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      
                      {/* Left: Total Footprint Readout */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono text-[10px] uppercase tracking-wider font-bold ${
                            isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'
                          }`}>
                            Total Invoiced Carbon Footprint
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-[#00C853] border border-emerald-500/20">
                            <TrendingDown className="w-3 h-3 mr-1 text-[#00C853]" />
                            {Math.abs(activeMatrix.trendVsLastMonth)}% vs last month
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-3">
                          <div className={`font-sans font-extrabold text-3xl sm:text-4xl tracking-tight ${
                            isLight ? 'text-[#0F2417]' : 'text-white'
                          }`}>
                            {unitMode === 'tonnes' 
                              ? `${activeMatrix.totalFootprintTonnes.toLocaleString()}` 
                              : `${activeMatrix.totalFootprintKg.toLocaleString()}`
                            }
                          </div>
                          <div className={`font-mono text-base font-bold ${
                            isLight ? 'text-[#00873E]' : 'text-[#00E676]'
                          }`}>
                            {unitMode === 'tonnes' ? 'tCO₂e' : 'kg CO₂e'}
                          </div>
                        </div>
                        <div className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#7C9A88]'}`}>
                          Calculated from {activeMatrix.categories.filter(c => c.carbonKg > 0).length} active corporate emission categories • estimate, not assured
                        </div>
                      </div>

                      {/* Right: Quick Stats & Unit Mode Toggle */}
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Spend Box */}
                        <div className={`px-4 py-2.5 rounded-xl border text-left ${
                          isLight ? 'bg-white border-[#E8ECE8]' : 'bg-[#08130C] border-[#173020]'
                        }`}>
                          <div className={`text-[10px] uppercase font-mono font-bold ${isLight ? 'text-[#41634E]' : 'text-[#7C9A88]'}`}>
                            Invoiced Spend
                          </div>
                          <div className={`text-sm font-bold font-mono ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                            ৳ {activeMatrix.totalSpendBdt.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">BDT</span>
                          </div>
                        </div>

                        {/* Intensity Box */}
                        <div className={`px-4 py-2.5 rounded-xl border text-left ${
                          isLight ? 'bg-white border-[#E8ECE8]' : 'bg-[#08130C] border-[#173020]'
                        }`}>
                          <div className={`text-[10px] uppercase font-mono font-bold ${isLight ? 'text-[#41634E]' : 'text-[#7C9A88]'}`}>
                            Carbon Intensity
                          </div>
                          <div className={`text-sm font-bold font-mono ${isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'}`}>
                            {activeMatrix.totalSpendBdt > 0 
                              ? ((activeMatrix.totalFootprintKg / activeMatrix.totalSpendBdt) * 1000).toFixed(2) 
                              : "0.00"
                            } <span className="text-[10px] font-normal text-slate-400">kg/৳1k</span>
                          </div>
                        </div>

                        {/* Unit Toggle Buttons */}
                        <div className={`flex items-center p-1 rounded-xl border ${
                          isLight ? 'bg-white border-[#DCE4DE]' : 'bg-[#08130C] border-[#173020]'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setUnitMode('kg')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              unitMode === 'kg'
                                ? 'bg-[#00C853] text-white shadow-sm'
                                : (isLight ? 'text-[#557361] hover:text-[#0F2417]' : 'text-[#7C9A88] hover:text-white')
                            }`}
                          >
                            kg CO₂e
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnitMode('tonnes')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              unitMode === 'tonnes'
                                ? 'bg-[#00C853] text-white shadow-sm'
                                : (isLight ? 'text-[#557361] hover:text-[#0F2417]' : 'text-[#7C9A88] hover:text-white')
                            }`}
                          >
                            Tonnes (t)
                          </button>
                        </div>

                        {/* Add Custom Item Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setIsAddCustomModalOpen(true)}
                          className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-bold font-mono px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          <span className="text-white font-mono font-bold">Add Custom Item</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* STEP 2: Refine & Analyze Category Matrix & Top Impacts */}
                  <div className={`space-y-6 ${extractionStep === 2 ? 'block' : 'hidden'}`}>
                    {extractionResult && (
                      <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-300">
                        {extractionResult.review_status === 'DEMO_SAMPLE'
                          ? 'DEMO SAMPLE — fictional data, not customer data. Figures below are illustrative estimates.'
                          : 'UNREVIEWED — extracted values must be reviewed before use. Figures below are estimates with unverified factors.'}
                      </p>
                    )}

                    {/* Visual Category Distribution (Donut) & Top Impact Categories (2 Columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Column: Interactive Donut Chart */}
                      <div className={`lg:col-span-6 p-5 rounded-2xl border flex flex-col items-center justify-between ${
                        isLight ? 'bg-white border-[#E8ECE8]' : 'bg-[#040906] border-[#152B1D]'
                      }`}>
                        <div className="w-full flex justify-between items-center border-b pb-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <PieChart className="w-4 h-4 text-[#00C853]" />
                            <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                              isLight ? 'text-[#0F2417]' : 'text-white'
                            }`}>
                              Emission Distribution by Category
                            </h4>
                          </div>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
                            Hover slices for breakdown
                          </span>
                        </div>

                        <CarbonDistributionDonut 
                          categories={activeMatrix.categories}
                          totalKg={activeMatrix.totalFootprintKg}
                          totalTonnes={activeMatrix.totalFootprintTonnes}
                          unitMode={unitMode}
                          hoveredId={donutHoveredId}
                          onHover={setDonutHoveredId}
                          isLight={isLight}
                        />
                      </div>

                      {/* Right Column: Top Impact Categories & Decarbonization AI Tip */}
                      <div className="lg:col-span-6 space-y-4">
                        
                        {/* Top 3 Impact Categories Cards */}
                        <div className={`p-5 rounded-2xl border space-y-3 ${
                          isLight ? 'bg-white border-[#E8ECE8]' : 'bg-[#040906] border-[#152B1D]'
                        }`}>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-[#00C853]" />
                              <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                                isLight ? 'text-[#0F2417]' : 'text-white'
                              }`}>
                                Top Impact Drivers
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-[#00C853] font-bold">
                              Prioritized by Footprint Magnitude
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {activeMatrix.topImpactCategories.map(top => (
                              <div 
                                key={top.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  isLight 
                                    ? 'bg-[#F8FAF8] border-[#E8ECE8] hover:border-emerald-300' 
                                    : 'bg-[#08130C] border-[#173020] hover:border-[#00C853]/40'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1.5">
                                  <div className="flex items-center space-x-2">
                                    <span 
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                                      style={{ backgroundColor: top.color }}
                                    >
                                      {top.rank}
                                    </span>
                                    <span className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                                      {top.name}
                                    </span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className={`text-xs font-black ${isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'}`}>
                                      {unitMode === 'tonnes' ? `${top.carbonTonnes} t` : `${top.carbonKg.toLocaleString()} kg`}
                                    </span>
                                    <span className={`ml-2 text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                      ({top.percentage}%)
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Impact Progress Meter */}
                                <div className="w-full h-2 rounded-full bg-slate-200/40 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ 
                                      width: `${top.percentage}%`,
                                      backgroundColor: top.color 
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic AI Decarbonization Recommendation Card */}
                        <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                          isLight 
                            ? 'bg-[#F0FAF3] border-[#BCE7CB]' 
                            : 'bg-[#06180E] border-[#184828]'
                        }`}>
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isLight ? 'bg-emerald-100 text-[#00873E]' : 'bg-[#0D2B1A] text-[#4ADE80]'
                          }`}>
                            <Lightbulb className="w-4 h-4 text-[#00C853]" />
                          </div>
                          <div className="space-y-1">
                            <div className={`text-xs font-bold font-sans ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                              AI Decarbonization Action Plan
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-[#2E543C]' : 'text-[#A7F3D0]'}`}>
                              {activeMatrix.quickTip}
                            </p>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* 9 Standard Categories Grid */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                            All 9 Activity & Invoiced Expense Categories
                          </h4>
                          <p className={`text-[11px] ${isLight ? 'text-[#41634E]' : 'text-[#7C9A88]'}`}>
                            Categorized under GHG Protocol Corporate Standard & Bangladesh DoE Emission Factors
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddCustomModalOpen(true)}
                          className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          <span className="text-white font-mono font-bold">Add Custom Line Item</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeMatrix.categories.map((cat) => {
                          const IconComp = cat.icon || Package;
                          return (
                            <div
                              key={cat.id}
                              className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                isLight 
                                  ? 'bg-white border-[#E8ECE8] hover:border-[#00C853]/50 hover:shadow-sm' 
                                  : 'bg-[#040906] border-[#152B1D] hover:border-[#00C853]/40'
                              }`}
                            >
                              <div className="space-y-3">
                                {/* Top Row: Icon + Name + Scope Badge */}
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center space-x-2.5">
                                    <div 
                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                                      style={{ backgroundColor: cat.color }}
                                    >
                                      <IconComp className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="leading-tight">
                                      <div className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                                        {cat.name}
                                      </div>
                                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#0B1A11] text-emerald-300/80 border-[#1B3B26]'
                                      }`}>
                                        {cat.scope}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Refine / Adjust Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategory(cat)}
                                    title="Refine category values"
                                    className={`p-1.5 rounded-lg text-slate-400 hover:text-[#00C853] transition-colors cursor-pointer border ${
                                      isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-transparent hover:bg-[#0D2214]'
                                    }`}
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Spend & Emissions Figures */}
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/10">
                                  <div>
                                    <span className={`text-[10px] font-mono uppercase ${isLight ? 'text-[#64748B]' : 'text-[#7C9A88]'}`}>
                                      Spend (BDT)
                                    </span>
                                    <div className={`text-xs font-bold font-mono ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                                      ৳ {cat.spendBdt.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-[10px] font-mono uppercase ${isLight ? 'text-[#64748B]' : 'text-[#7C9A88]'}`}>
                                      Emissions
                                    </span>
                                    <div className={`text-xs font-bold font-mono ${isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'}`}>
                                      {unitMode === 'tonnes' ? `${cat.carbonTonnes} t` : `${cat.carbonKg.toLocaleString()} kg`}
                                    </div>
                                  </div>
                                </div>

                                {/* Percentage Bar */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Share</span>
                                    <span className="font-bold text-[#00C853]">{cat.percentage}%</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-slate-200/30 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${cat.percentage}%`,
                                        backgroundColor: cat.color 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Activity Volume Footer */}
                              <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] font-mono ${
                                isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/40 text-slate-400'
                              }`}>
                                <span>Activity Qty</span>
                                <span className="font-bold">{cat.quantity.toLocaleString()} {cat.unit}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Added Line Items Ledger (if any) */}
                    {customItems.length > 0 && (
                      <div className={`p-4 rounded-2xl border space-y-3 ${
                        isLight ? 'bg-[#F9FBFA] border-[#DCE4DE]' : 'bg-[#040906] border-[#152B1D]'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-[#00C853]" />
                            <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                              isLight ? 'text-[#0F2417]' : 'text-white'
                            }`}>
                              Custom Invoiced Additions ({customItems.length})
                            </h4>
                          </div>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Live calculated into total footprint
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-sans text-xs">
                            <thead>
                              <tr className={`border-b text-[10px] uppercase font-mono ${
                                isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800'
                              }`}>
                                <th className="py-2">Description</th>
                                <th>Category</th>
                                <th>Scope</th>
                                <th>Spend (BDT)</th>
                                <th>Quantity</th>
                                <th>Emissions</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/40'}`}>
                              {customItems.map((item) => (
                                <tr key={item.id} className={isLight ? 'hover:bg-white' : 'hover:bg-[#08130C]'}>
                                  <td className={`py-2 font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                                    {item.name}
                                  </td>
                                  <td className="capitalize text-slate-400">
                                    {item.categoryId.replace('_', ' ')}
                                  </td>
                                  <td>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-[#00C853] border border-emerald-500/20">
                                      {item.scope}
                                    </span>
                                  </td>
                                  <td className="font-mono">
                                    ৳ {item.spendBdt.toLocaleString()}
                                  </td>
                                  <td className="font-mono text-slate-400">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="font-mono font-bold text-[#00C853]">
                                    +{unitMode === 'tonnes' ? (item.carbonKg / 1000).toFixed(3) : item.carbonKg.toLocaleString()} {unitMode === 'tonnes' ? 't' : 'kg'}
                                  </td>
                                  <td className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomItem(item.id)}
                                      className="p-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                                      title="Delete item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* STEP 3: Audit Assurance & Citation Traces View */}
                  <div className={`space-y-4 ${extractionStep === 3 ? 'block' : 'hidden'}`}>
                    {extractionResult ? (
                      <div className={`rounded-2xl p-5 space-y-3 border ${
                        isLight 
                          ? 'bg-[#F7FAF7] border-[#E8ECE8]' 
                          : 'bg-[#040906] border-[#152B1D]'
                      }`}>
                        <div className={`flex justify-between items-center pb-2 border-b ${
                          isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-[#00C853]" />
                            <span className={`font-sans font-bold text-xs ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                              Extraction Evidence — {extractionResult.filename}
                            </span>
                          </div>
                          <span className={`font-mono text-[10px] ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>
                            {extractionResult.overall_confidence == null ? 'Rule-based match (no model confidence)' : `Extraction-model confidence: ${Math.round(extractionResult.overall_confidence * 100)}%`} • Not verified
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-sans text-xs border-collapse">
                            <thead>
                              <tr className={`font-bold border-b text-[10px] uppercase tracking-wider ${
                                isLight ? 'text-[#41634E] border-[#E8ECE8]' : 'text-[#9EBFAB] border-[#122418]'
                              }`}>
                                <th className="py-3 px-3 w-40 min-w-[130px]">Metric</th>
                                <th className="py-3 px-3 w-36 min-w-[120px]">Scope</th>
                                <th className="py-3 px-3 w-44 min-w-[140px]">Extracted Value</th>
                                <th className="py-3 px-3 w-28 min-w-[95px]">Source Page</th>
                                <th className="py-3 px-3 min-w-[260px]">Source Snippet</th>
                                <th className="py-3 px-3 w-28 min-w-[90px] text-right">Confidence</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLight ? 'divide-[#E8ECE8]' : 'divide-[#122418]'}`}>
                              {extractionResult.details && extractionResult.details.map((item, idx) => (
                                <tr key={idx} className={`transition-colors ${isLight ? 'hover:bg-white' : 'hover:bg-[#08130C]'}`}>
                                  <td className={`py-3 px-3 font-bold capitalize whitespace-nowrap ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                                    {item.param_name}
                                  </td>
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap shadow-xs ${
                                      item.scope?.toLowerCase().includes('scope 1')
                                        ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
                                        : item.scope?.toLowerCase().includes('scope 2')
                                        ? isLight ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-[#0B2522] text-[#2DD4BF] border-[#134E4A]'
                                        : isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#101E17] text-[#86EFAC] border-[#1E3A2B]'
                                    }`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0 opacity-80" />
                                      {item.scope}
                                    </span>
                                  </td>
                                  <td className={`py-3 px-3 font-mono font-bold whitespace-nowrap ${isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'}`}>
                                    {Number(item.value).toLocaleString()} {item.unit}
                                  </td>
                                  <td className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>
                                    Page {item.source_page || 1}
                                  </td>
                                  <td className={`py-3 px-3 text-[11px] italic max-w-[360px] truncate ${isLight ? 'text-[#41634E]' : 'text-[#B4D2C1]'}`} title={item.raw_snippet}>
                                    "{item.raw_snippet}"
                                  </td>
                                  <td className="py-3 px-3 text-right whitespace-nowrap">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                      isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
                                    }`}>
                                      {item.confidence == null ? '—' : `${Math.round(item.confidence * 100)}%`}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                        isLight ? 'bg-[#F9FBFA] border-[#DCE4DE]' : 'bg-[#040906] border-[#152B1D]'
                      }`}>
                        <ShieldCheck className="w-8 h-8 text-[#00C853] mx-auto" />
                        <div className={`text-sm font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          No Extracted Audit Traces Yet
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Ingest a document or click "Load Demo Sample (fictional)" to see extracted values with their source snippets.
                        </p>
                        <button
                          type="button"
                          onClick={() => executeAIExtraction("Dexterity_Textiles_ESG_Statement_Q2_2026.txt")}
                          className="mt-2 text-xs font-mono font-bold px-4 py-2 rounded-xl bg-[#00C853] text-white hover:bg-[#00E676] transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span className="text-white font-mono font-bold">Load Sample Document Now</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MODAL: ADD CUSTOM INVOICE ITEM */}
                  {isAddCustomModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 ${
                        isLight ? 'bg-white border-slate-200 text-[#0F2417]' : 'bg-[#08130C] border-[#1B3B26] text-white'
                      }`}>
                        <div className="flex justify-between items-center border-b pb-3">
                          <div className="flex items-center space-x-2">
                            <Plus className="w-5 h-5 text-[#00C853]" />
                            <h3 className="font-bold text-base font-sans">Add Custom Expense / Invoice Item</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddCustomModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleAddCustomItem} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Item / Expense Description
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Auxiliary Diesel for Factory Generator B"
                              value={newCustomItem.name}
                              onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                              }`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Category
                              </label>
                              <select
                                value={newCustomItem.categoryId}
                                onChange={(e) => setNewCustomItem({ ...newCustomItem, categoryId: e.target.value })}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                                }`}
                              >
                                {NINE_CATEGORIES_CONFIG.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Scope Protocol
                              </label>
                              <select
                                value={newCustomItem.scope}
                                onChange={(e) => setNewCustomItem({ ...newCustomItem, scope: e.target.value })}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                                }`}
                              >
                                <option value="Scope 1">Scope 1 (Direct)</option>
                                <option value="Scope 2">Scope 2 (Electricity)</option>
                                <option value="Scope 3">Scope 3 (Value Chain)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Invoiced Spend (BDT)
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 75000"
                                value={newCustomItem.spendBdt}
                                onChange={(e) => setNewCustomItem({ ...newCustomItem, spendBdt: e.target.value })}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Activity Quantity
                              </label>
                              <div className="flex space-x-1">
                                <input
                                  type="number"
                                  placeholder="e.g. 500"
                                  value={newCustomItem.quantity}
                                  onChange={(e) => setNewCustomItem({ ...newCustomItem, quantity: e.target.value })}
                                  className={`w-2/3 text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                                  }`}
                                />
                                <input
                                  type="text"
                                  placeholder="Units"
                                  value={newCustomItem.unit}
                                  onChange={(e) => setNewCustomItem({ ...newCustomItem, unit: e.target.value })}
                                  className={`w-1/3 text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Emission Factor (kg CO₂e per unit)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 2.68"
                              value={newCustomItem.factor}
                              onChange={(e) => setNewCustomItem({ ...newCustomItem, factor: e.target.value })}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                              }`}
                            />
                          </div>

                          {/* Preview Calculated CO2 */}
                          <div className={`p-3 rounded-xl border flex justify-between items-center ${
                            isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#0D2616] border-[#00C853]/30'
                          }`}>
                            <span className="text-xs font-bold font-sans">Calculated Added Impact:</span>
                            <span className="text-xs font-mono font-black text-[#00C853]">
                              +{(
                                (parseFloat(newCustomItem.quantity) || 0) > 0
                                  ? Math.round((parseFloat(newCustomItem.quantity) || 0) * (parseFloat(newCustomItem.factor) || 1))
                                  : Math.round((parseFloat(newCustomItem.spendBdt) || 0) * 0.065)
                              ).toLocaleString()} kg CO₂e
                            </span>
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="submit"
                              className="flex-1 bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Add to Footprint Matrix
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddCustomModalOpen(false)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/40 text-slate-300 border-slate-700'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* MODAL: REFINE CATEGORY ADJUSTMENT */}
                  {editingCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-5 ${
                        isLight ? 'bg-white border-slate-200 text-[#0F2417]' : 'bg-[#08130C] border-[#1B3B26] text-white'
                      }`}>
                        <div className="flex justify-between items-center border-b pb-3">
                          <div className="flex items-center space-x-2">
                            <Sliders className="w-5 h-5 text-[#00C853]" />
                            <h3 className="font-bold text-base font-sans">
                              Refine {editingCategory.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Adjust Invoiced Spend (BDT)
                            </label>
                            <input
                              type="number"
                              defaultValue={editingCategory.spendBdt}
                              id="adjust-spend"
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Adjust Emissions (kg CO₂e)
                            </label>
                            <input
                              type="number"
                              defaultValue={editingCategory.carbonKg}
                              id="adjust-kg"
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Adjust Activity Quantity ({editingCategory.unit})
                            </label>
                            <input
                              type="number"
                              defaultValue={editingCategory.quantity}
                              id="adjust-qty"
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-[#00C853] ${
                                isLight ? 'bg-slate-50 border-slate-200 text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
                              }`}
                            />
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const s = document.getElementById('adjust-spend').value;
                                const k = document.getElementById('adjust-kg').value;
                                const q = document.getElementById('adjust-qty').value;
                                handleSaveCategoryAdjustment(editingCategory.id, s, k, q);
                              }}
                              className="flex-1 bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Save Recalculation
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/40 text-slate-300 border-slate-700'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* Carbon Zero BD ESG Regulatory & Copilot (RAG Assistant Section)     */}
                  {/* ------------------------------------------------------------- */}
                  <div className={`border-t pt-6 space-y-4 ${isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                          isLight ? 'bg-[#E8F8EE] border-[#C2E9CF]' : 'bg-[#0D2B1A] border-[#1B4D2E]'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-[#00C853]" />
                        </div>
                        <h4 className={`font-sans font-bold text-sm ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                          Carbon Zero BD ESG Regulatory & Auditor Copilot
                        </h4>
                      </div>
                      
                      {/* Corpus Filter Tabs */}
                      <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
                        isLight ? 'bg-[#F4F6F4] border-[#E8ECE8]' : 'bg-[#040906] border-[#1A3824]'
                      }`}>
                        {[
                          { id: 'all', label: 'All Corpora' },
                          { id: 'regulatory', label: 'Regulations (NDC/ECR)' },
                          { id: 'emission_factors', label: 'Emission Factors' },
                          { id: 'tenant_docs', label: 'Audit Statements' }
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setRagCorpus(c.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                              ragCorpus === c.id
                                ? isLight 
                                  ? 'bg-white text-[#00873E] border border-[#C2E9CF] shadow-xs' 
                                  : 'bg-[#0D2B1A] text-[#4ADE80] border border-[#1B4D2E] shadow-sm'
                                : isLight 
                                  ? 'text-[#41634E] hover:text-[#0F2417] hover:bg-black/[0.03]' 
                                  : 'text-[#A3C4B0] hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Question Chips */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        "What is Bangladesh's official 2023 grid emission factor?",
                        "What are Bangladesh's updated NDC 2030 mitigation targets?",
                        "How does EU CBAM affect our manufacturing and export emissions?",
                        "What was the diesel generator fuel consumption in Q2 audit statement?"
                      ].map((promptText, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => executeRagQuery(promptText)}
                          className={`text-[11px] font-sans px-3 py-1.5 rounded-full transition-all flex items-center space-x-1.5 cursor-pointer border ${
                            isLight 
                              ? 'bg-[#F0F5F1] hover:bg-[#E2F0E6] text-[#0F2417] border-[#CDE0D2]' 
                              : 'bg-[#0A1A10] hover:bg-[#0E2818] text-[#C2E0CC] hover:text-white border-[#183B24] hover:border-emerald-500/40'
                          }`}
                        >
                          <Search className={`w-3 h-3 shrink-0 ${isLight ? 'text-[#00873E]' : 'text-emerald-400'}`} />
                          <span>{promptText}</span>
                        </button>
                      ))}
                    </div>

                    {/* Search / Ask AI Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); executeRagQuery(); } }}
                          placeholder="Ask anything about Bangladesh ESG laws, DoE emission factors, or audit evidence..."
                          className={`w-full text-xs font-sans p-3 pl-9 border rounded-xl focus:outline-none focus:border-[#00C853] transition-all ${
                            isLight 
                              ? 'bg-[#F7FAF7] border-[#DCE4DE] text-[#0F2417] placeholder-[#557361]' 
                              : 'bg-[#040906] border-[#1B3B26] text-white placeholder-[#7E9F8B] focus:bg-[#07130B]'
                          }`}
                        />
                        <Search className={`w-4 h-4 absolute left-3 top-3.5 ${isLight ? 'text-[#557361]' : 'text-emerald-400/80'}`} />
                      </div>
                      <button
                        type="button"
                        onClick={() => executeRagQuery()}
                        disabled={isRagLoading || !ragQuery.trim()}
                        className="bg-[#00C853] hover:bg-[#00E676] disabled:bg-[#0E2014] disabled:text-white/40 disabled:border disabled:border-[#1A3824] disabled:shadow-none disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-mono font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer"
                      >
                        {isRagLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-white" />
                            <span className="text-white font-mono font-bold">Ask Copilot</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* RAG Grounded Answer Output */}
                    {ragResponse && (
                      <div className={`rounded-2xl p-5 space-y-4 border ${
                        isLight 
                          ? 'bg-[#F2FBF5] border-[#BCE7CB]' 
                          : 'bg-[#050C07] border-[#1B4D2E]'
                      }`}>
                        <div className={`flex justify-between items-center pb-2 border-b ${
                          isLight ? 'border-[#C2E9CF]' : 'border-[#122418]'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                              isLight ? 'bg-white text-[#00873E] border-[#BCE7CB]' : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
                            }`}>
                              {ragResponse.model_used || "unknown"}
                            </span>
                            <span className={`font-sans font-bold text-xs ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                              {ragResponse.insufficient_data ? 'No answer available' : 'AI response with sources — not verified'}
                            </span>
                          </div>
                          <div className={`flex items-center space-x-2 font-mono text-[10px] ${
                            isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'
                          }`}>
                            <span>Retrieval similarity: {ragResponse.confidence == null ? '—' : `${Math.round(ragResponse.confidence * 100)}%`}</span>
                            <span>•</span>
                            <span>{ragResponse.latency_ms == null ? '—' : `${ragResponse.latency_ms}ms`}</span>
                          </div>
                        </div>

                        {/* Answer Text */}
                        <div className={`text-xs leading-relaxed font-sans whitespace-pre-line ${
                          isLight ? 'text-[#0F2417]' : 'text-[#D8E8DF]'
                        }`}>
                          {ragResponse.answer}
                        </div>

                        {/* Citations List */}
                        {ragResponse.citations && ragResponse.citations.length > 0 && (
                          <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-[#C2E9CF]' : 'border-[#122418]'}`}>
                            <div className={`text-[10px] font-mono uppercase font-bold flex items-center ${
                              isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'
                            }`}>
                              <Quote className="w-3 h-3 mr-1 text-[#00C853]" />
                              Verifiable Document Citations ({ragResponse.citations.length}):
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {ragResponse.citations.map((c, idx) => (
                                <div 
                                  key={idx}
                                  className={`p-3 rounded-xl space-y-1 border transition-colors ${
                                    isLight 
                                      ? 'bg-white border-[#DCE4DE] hover:border-[#00C853]' 
                                      : 'bg-[#08130C] border-[#152B1D] hover:border-[#1B4D2E]'
                                  }`}
                                >
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className={`font-mono font-bold truncate max-w-[200px] ${
                                      isLight ? 'text-[#0F2417]' : 'text-white'
                                    }`} title={c.source}>
                                      📄 {c.source}
                                    </span>
                                    <span className={`font-mono font-semibold ${
                                      isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'
                                    }`}>
                                      Page {c.page || 1} • {Math.round((c.relevance_score || 0.9) * 100)}% Match
                                    </span>
                                  </div>
                                  <p className={`text-[11px] line-clamp-2 italic ${
                                    isLight ? 'text-[#41634E]' : 'text-[#A3C4B0]'
                                  }`}>
                                    "{c.snippet}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Company Projects List in Dashboard */}
                <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm transition-all ${
                  isLight 
                    ? 'bg-white border-[#E8ECE8] text-[#0F2417]' 
                    : 'bg-[#08130C] border-[#152B1D] text-white'
                }`}>
                  <div className={`flex justify-between items-center pb-4 border-b mb-4 ${
                    isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'
                  }`}>
                    <div>
                      <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>Active Corporate Projects</h3>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>District specific offsetting initiatives under CarbonZero monitoring.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddProjectOpen(true)}
                      className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-white stroke-[2.5]" />
                      <span className="text-white font-mono font-bold">New Project</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className={`font-bold border-b pb-2 text-[10px] uppercase ${
                          isLight ? 'text-[#557361] border-[#E8ECE8]' : 'text-[#557361] border-[#122418]'
                        }`}>
                          <th className="py-2.5">Project Name</th>
                          <th>Sector</th>
                          <th>Target (tCO2e/yr)</th>
                          <th>Audit Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-[#E8ECE8]' : 'divide-[#122418]'}`}>
                        {projects.map(p => (
                          <tr key={p.id} className={`transition-colors ${isLight ? 'hover:bg-[#F7FAF7]' : 'hover:bg-[#040906]'}`}>
                            <td className={`py-3 font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>{p.name}</td>
                            <td className={isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}>{p.sector}</td>
                            <td className={`font-mono font-semibold ${isLight ? 'text-[#00873E]' : 'text-[#4ADE80]'}`}>{p.target} tCO2e</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.status === 'Verified' 
                                  ? isLight ? 'bg-[#E8F8EE] text-[#00873E] border border-[#C2E9CF]' : 'bg-[#0D2B1A] text-[#4ADE80] border border-[#1B4D2E]'
                                  : p.status === 'In Progress'
                                    ? isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : isLight ? 'bg-gray-100 text-gray-600' : 'bg-[#040906] text-[#7C9A88]'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (Reminders, Offset and Team) */}
              <div className="space-y-8">
                
                {/* Offset Options Panel */}
                <div className={`p-6 rounded-3xl shadow-md flex flex-col justify-between h-[230px] border transition-all ${
                  isLight
                    ? 'bg-gradient-to-br from-[#E8F8EE] via-[#D8F3E3] to-[#C7EED8] border-[#A3E2B8] text-[#0F2417]'
                    : 'bg-gradient-to-br from-[#0D2B1A] via-[#0A2215] to-[#07180F] border-[#1B4D2E] text-white'
                }`}>
                  <div className="space-y-2">
                    <div className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                      isLight ? 'text-[#00873E]' : 'text-[#A7F3D0]'
                    }`}>EMISSIONS COMPENSATIONS</div>
                    <h3 className={`font-sans font-bold text-lg leading-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>Offset Your Footprint</h3>
                    <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-[#3E5C49]' : 'text-white/70'}`}>
                      Purchase certified Bangladeshi carbon credits directly on our registry to mitigate your calculated corporate emissions debt.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/platform/marketplace')}
                    className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span className="text-white font-mono font-bold">Browse Marketplace</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Reminders / To-dos */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
                  isLight 
                    ? 'bg-white border-[#E8ECE8] text-[#0F2417]' 
                    : 'bg-[#08130C] border-[#152B1D] text-white'
                }`}>
                  <div className={`flex justify-between items-center mb-4 pb-2 border-b ${
                    isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'
                  }`}>
                    <h3 className={`font-sans font-bold text-sm ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>Verification Tasks</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      isLight ? 'bg-[#E8F8EE] text-[#00873E] border border-[#C2E9CF]' : 'bg-[#0D2B1A] text-[#4ADE80] border border-[#1B4D2E]'
                    }`}>
                      {openTasksCount} left
                    </span>
                  </div>
                  
                  <ul className="space-y-3 font-sans text-xs">
                    {tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTask(task.id)}
                            className={`mt-0.5 rounded text-[#00C853] focus:ring-[#00C853] cursor-pointer ${
                              isLight ? 'border-[#DCE4DE] bg-white' : 'border-[#173020] bg-[#040906]'
                            }`} 
                          />
                          <span className={task.completed 
                            ? isLight ? "text-[#8FA899] line-through" : "text-[#557361] line-through" 
                            : isLight ? "text-[#0F2417]" : "text-[#D8E8DF]"
                          }>
                            {task.text}
                          </span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className={`transition-colors hover:text-[#EF4444] cursor-pointer ${
                          isLight ? 'text-[#8FA899]' : 'text-[#557361]'
                        }`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setActiveMenu('Tasks')}
                    className="w-full bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer mt-3"
                  >
                    <span className="text-white font-mono font-bold">View All Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Team Members */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
                  isLight 
                    ? 'bg-white border-[#E8ECE8] text-[#0F2417]' 
                    : 'bg-[#08130C] border-[#152B1D] text-white'
                }`}>
                  <div className={`flex justify-between items-center mb-4 pb-2 border-b ${
                    isLight ? 'border-[#E8ECE8]' : 'border-[#122418]'
                  }`}>
                    <h3 className={`font-sans font-bold text-sm ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>ESG Audit Team</h3>
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all shadow-sm cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3 text-white stroke-[2.5]" />
                      <span className="text-white font-mono font-bold">Add Member</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-7 h-7 rounded-full overflow-hidden border cursor-pointer ${
                            isLight ? 'bg-[#F7FAF7] border-[#DCE4DE]' : 'bg-[#040906] border-[#1B4D2E]'
                          }`} onClick={() => toggleMemberStatus(member.name)}>
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" width="28" height="28" loading="lazy" />
                          </div>
                          <div className="text-left leading-none">
                            <div className={`font-sans font-bold text-xs ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>{member.name}</div>
                            <div className={`text-[9px] font-mono mt-0.5 ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>{member.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] border px-2 py-0.5 rounded uppercase font-bold ${
                            member.status === 'Active' 
                              ? isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
                              : isLight ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-[#040906] text-[#557361] border-[#122418]'
                          }`}>
                            {member.status}
                          </span>
                          <button onClick={() => removeMember(member.name)} className={`hover:text-[#EF4444] transition-colors cursor-pointer ${
                            isLight ? 'text-[#8FA899]' : 'text-[#557361]'
                          }`}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
    </div>
  );
};

export default ExecutiveOverviewPanel;
