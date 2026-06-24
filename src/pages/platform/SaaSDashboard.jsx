import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Bell, 
  FileText, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Compass, 
  Trash2, 
  Loader2,
  Calendar,
  Users,
  Grid,
  TrendingDown,
  Building,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const SaaSDashboard = () => {
  const navigate = useNavigate();

  // Calculator inputs state
  const [inputs, setInputs] = useState({
    diesel: '',
    petrol: '',
    lpg: '',
    electricity: '',
    employees: '',
    airTravel: '',
    truckTransport: '',
    rawMaterials: ''
  });

  // Calculation results state
  const [results, setResults] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // GHG Protocol Emission Factors
  const EF = {
    diesel: 2.68, // kg CO2e / Liter
    petrol: 2.31, // kg CO2e / Liter
    lpg: 2.98, // kg CO2e / kg
    electricity: 0.55, // kg CO2e / kWh (Bangladesh grid average)
    employees: 0.40, // tCO2e / employee / year average commute
    airTravel: 0.12, // kg CO2e / km
    truckTransport: 0.20, // kg CO2e / ton-km
    rawMaterials: 2.50 // tCO2e / ton (composite raw materials)
  };

  // Perform emissions calculations
  const calculateEmissions = (vals) => {
    const dVal = parseFloat(vals.diesel) || 0;
    const pVal = parseFloat(vals.petrol) || 0;
    const lVal = parseFloat(vals.lpg) || 0;
    const eVal = parseFloat(vals.electricity) || 0;
    const empVal = parseFloat(vals.employees) || 0;
    const airVal = parseFloat(vals.airTravel) || 0;
    const truckVal = parseFloat(vals.truckTransport) || 0;
    const rawVal = parseFloat(vals.rawMaterials) || 0;

    // Scope 1: Direct emissions (fuels converted to tons by dividing by 1000)
    const scope1 = ((dVal * EF.diesel) + (pVal * EF.petrol) + (lVal * EF.lpg)) / 1000;

    // Scope 2: Purchased Electricity (kWh converted to tons by dividing by 1000)
    const scope2 = (eVal * EF.electricity) / 1000;

    // Scope 3: Value Chain emissions (commutes in tons, travel/freight converted, raw materials in tons)
    const scope3 = (empVal * EF.employees) + 
                   ((airVal * EF.airTravel) / 1000) + 
                   ((truckVal * EF.truckTransport) / 1000) + 
                   (rawVal * EF.rawMaterials);

    const total = scope1 + scope2 + scope3;

    setResults({
      scope1: parseFloat(scope1.toFixed(2)),
      scope2: parseFloat(scope2.toFixed(2)),
      scope3: parseFloat(scope3.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  // Handle manual inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...inputs, [name]: value };
    setInputs(updated);
    calculateEmissions(updated);
    setIsVerified(false); // Reset verification sign on manual edit
  };

  // Simulate drag and drop file upload
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setUploadedFile(file.name);
      setIsVerified(false);
    }
  };

  // Run AI simulated extraction
  const handleTrackEmissions = () => {
    if (!uploadedFile) {
      alert("Please upload/drag-and-drop a financial dashboard or utility bill spreadsheet first.");
      return;
    }

    setIsUploading(true);

    // Simulate AI parsing duration
    setTimeout(() => {
      const extractedInputs = {
        diesel: '12400',
        petrol: '4500',
        lpg: '1850',
        electricity: '142000',
        employees: '148',
        airTravel: '78000',
        truckTransport: '34500',
        rawMaterials: '540'
      };

      setInputs(extractedInputs);
      calculateEmissions(extractedInputs);
      setIsUploading(false);
      setIsVerified(true); // Display verification seal
    }, 2200);
  };

  // Clear inputs
  const clearCalculator = () => {
    const cleared = {
      diesel: '',
      petrol: '',
      lpg: '',
      electricity: '',
      employees: '',
      airTravel: '',
      truckTransport: '',
      rawMaterials: ''
    };
    setInputs(cleared);
    setUploadedFile(null);
    setIsVerified(false);
    setResults({ scope1: 0, scope2: 0, scope3: 0, total: 0 });
  };

  // Initial calculations
  useEffect(() => {
    calculateEmissions(inputs);
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-[#F8F9FA] text-[#1E293B] flex">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-[240px] bg-white border-r border-[#E2E8F0] p-6 hidden lg:flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F291B] flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-[#4ADE80]" />
            </div>
            <span className="font-sans font-bold text-lg text-[#0F291B] tracking-tight">CarbonZero</span>
          </div>

          {/* Menu Sections */}
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[9px] text-[#94A3B8] uppercase tracking-wider block px-2 mb-2 font-bold">Menu</span>
              <nav className="space-y-1">
                {[
                  { name: 'Dashboard', icon: Grid },
                  { name: 'Tasks', icon: CheckCircle, badge: '12+' },
                  { name: 'Calendar', icon: Calendar },
                  { name: 'Analytics', icon: BarChart2 },
                  { name: 'Team', icon: Users }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#0D2B1A]/10 text-[#0F291B]' 
                          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F291B]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F291B]' : 'text-[#94A3B8]'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <span className="font-mono text-[9px] text-[#94A3B8] uppercase tracking-wider block px-2 mb-2 font-bold">General</span>
              <nav className="space-y-1">
                {[
                  { name: 'Settings', icon: Settings },
                  { name: 'Help', icon: HelpCircle },
                  { name: 'Logout', icon: LogOut }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => item.name === 'Logout' ? navigate('/') : null}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-sans font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F291B] transition-all"
                    >
                      <Icon className="w-4 h-4 text-[#94A3B8]" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Promo Card */}
        <div className="bg-gradient-to-br from-[#0F291B] to-[#1C4E34] text-white p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full"></div>
          <h4 className="font-sans font-bold text-xs mb-1">Track ESG on the go</h4>
          <p className="text-[10px] text-white/70 mb-3 leading-relaxed">Download our mobile companion app to sync emissions feeds.</p>
          <button className="bg-white text-[#0F291B] font-sans font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors w-full">
            Download App
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#E2E8F0] pb-6">
          
          {/* Search Task */}
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search reports or tasks... (⌘F)" 
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-sans placeholder-[#94A3B8] focus:outline-none focus:border-[#0F291B] bg-white text-[#1E293B]"
            />
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            
            {/* Top action buttons */}
            <div className="flex items-center space-x-2">
              <button className="bg-[#0F291B] hover:bg-[#1A4B31] text-white font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1.5">
                <span>+ Add Project</span>
              </button>
              <button 
                onClick={() => {
                  const inputEl = document.getElementById('drag-file-input');
                  if (inputEl) inputEl.click();
                }}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F291B] font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Import Data
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-[#E2E8F0]">
              <button className="relative p-1.5 rounded-full hover:bg-white text-[#64748B] hover:text-[#0F291B] transition-colors">
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]"></span>
                <Bell className="w-4.5 h-4.5" />
              </button>
              
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                    alt="User profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-sans font-bold text-xs text-[#0F291B]">Totok Michael</div>
                  <div className="text-[10px] text-[#64748B] font-mono">michael@carbonzero.io</div>
                </div>
              </div>
            </div>
            
          </div>
        </header>

        {/* Dashboard Title & Introduction */}
        <div>
          <h1 className="font-sans font-bold text-3xl text-[#0F291B]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1 font-sans">Plan, prioritize, and verify your corporate emissions with ease.</p>
        </div>

        {/* 3. KPI Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Emissions */}
          <div className="bg-[#0F291B] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between aspect-[1.6]">
            <div>
              <div className="font-mono text-[9px] text-[#A7F3D0] uppercase tracking-wider font-bold mb-3">Total Carbon footprint</div>
              <div className="font-sans font-bold text-3xl lg:text-4xl tracking-tight">
                {results.total} <span className="text-xs font-mono font-normal">tCO2e</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[10px] text-[#4ADE80] font-mono bg-white/10 px-2.5 py-1 rounded-full flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                38% reduced
              </span>
              <span className="text-[9px] text-[#A7F3D0] font-sans">vs last year</span>
            </div>
          </div>

          {/* Card 2: Scope 1 */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between aspect-[1.6]">
            <div>
              <div className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold mb-3">Scope 1 (Direct)</div>
              <div className="font-sans font-bold text-3xl tracking-tight text-[#0F291B]">
                {results.scope1} <span className="text-xs font-mono font-normal text-[#64748B]">tCO2e</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-[10px] text-[#64748B]">
              <span>Boilers, Generators, Vehicles</span>
              <span className="font-mono font-bold text-amber">
                {results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>

          {/* Card 3: Scope 2 */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between aspect-[1.6]">
            <div>
              <div className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold mb-3">Scope 2 (Electricity)</div>
              <div className="font-sans font-bold text-3xl tracking-tight text-[#0F291B]">
                {results.scope2} <span className="text-xs font-mono font-normal text-[#64748B]">tCO2e</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-[10px] text-[#64748B]">
              <span>Purchased Grid Power</span>
              <span className="font-mono font-bold text-emerald">
                {results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>

          {/* Card 4: Scope 3 */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-between aspect-[1.6]">
            <div>
              <div className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold mb-3">Scope 3 (Value Chain)</div>
              <div className="font-sans font-bold text-3xl tracking-tight text-[#0F291B]">
                {results.scope3} <span className="text-xs font-mono font-normal text-[#64748B]">tCO2e</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-[10px] text-[#64748B]">
              <span>Supply Chain & Commutes</span>
              <span className="font-mono font-bold text-purple-600">
                {results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Main Two Column Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Calculator & File Dropzone) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Scope Emissions Calculator Module */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-4">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#0F291B]">GHG Protocol Emissions Calculator</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-sans">Input raw values or upload utility invoices to extract footprint.</p>
                </div>
                <button 
                  onClick={clearCalculator}
                  className="font-mono text-[10px] text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 px-3 py-1 rounded transition-colors"
                >
                  Clear Data
                </button>
              </div>

              {/* Scope Calculator Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Scope 1 Column */}
                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-[#0F291B] uppercase tracking-wider font-bold pb-2 border-b border-[#F1F5F9]">
                    Scope 1 (Direct)
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Diesel (Liters)</label>
                      <input 
                        type="number"
                        name="diesel"
                        value={inputs.diesel}
                        onChange={handleInputChange}
                        placeholder="e.g. 10000"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Petrol (Liters)</label>
                      <input 
                        type="number"
                        name="petrol"
                        value={inputs.petrol}
                        onChange={handleInputChange}
                        placeholder="e.g. 5000"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">LPG (Kg)</label>
                      <input 
                        type="number"
                        name="lpg"
                        value={inputs.lpg}
                        onChange={handleInputChange}
                        placeholder="e.g. 1500"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Scope 2 Column */}
                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-[#0F291B] uppercase tracking-wider font-bold pb-2 border-b border-[#F1F5F9]">
                    Scope 2 (Indirect)
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Grid Power (kWh)</label>
                      <input 
                        type="number"
                        name="electricity"
                        value={inputs.electricity}
                        onChange={handleInputChange}
                        placeholder="e.g. 100000"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Scope 3 Column */}
                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-[#0F291B] uppercase tracking-wider font-bold pb-2 border-b border-[#F1F5F9]">
                    Scope 3 (Value Chain)
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Employees (Commute)</label>
                      <input 
                        type="number"
                        name="employees"
                        value={inputs.employees}
                        onChange={handleInputChange}
                        placeholder="e.g. 150"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Air Travel (Km)</label>
                      <input 
                        type="number"
                        name="airTravel"
                        value={inputs.airTravel}
                        onChange={handleInputChange}
                        placeholder="e.g. 50000"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Truck Freight (T-Km)</label>
                      <input 
                        type="number"
                        name="truckTransport"
                        value={inputs.truckTransport}
                        onChange={handleInputChange}
                        placeholder="e.g. 20000"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] font-sans uppercase mb-1">Raw Materials (Tons)</label>
                      <input 
                        type="number"
                        name="rawMaterials"
                        value={inputs.rawMaterials}
                        onChange={handleInputChange}
                        placeholder="e.g. 400"
                        className="w-full text-xs font-mono p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B]"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* AI Document Dropzone & Extraction controls */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              
              <div>
                <h3 className="font-sans font-bold text-lg text-[#0F291B] flex items-center">
                  <FileText className="w-5 h-5 text-emerald mr-2" />
                  AI Document Footprint Extractor
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                  Upload your annual financial dashboard, expenses report, or utility spreadsheets. CarbonZero AI will scan and populate the parameters.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-8 text-center bg-[#F8F9FA]/50 hover:bg-[#F1F5F9]/50 transition-colors cursor-pointer relative"
              >
                <input 
                  type="file" 
                  id="drag-file-input"
                  onChange={handleFileDrop}
                  className="hidden" 
                  accept=".csv,.xlsx,.xls,.pdf"
                />
                <div onClick={() => document.getElementById('drag-file-input').click()} className="space-y-3">
                  <Upload className="w-10 h-10 text-[#64748B] mx-auto animate-none" />
                  <div className="text-xs font-bold text-[#0F291B]">
                    {uploadedFile ? `Uploaded: ${uploadedFile}` : "Drag & Drop Financial spreadsheets or bills here"}
                  </div>
                  <div className="text-[10px] text-[#64748B]">Supports PDF, XLSX, CSV (Max 25MB)</div>
                </div>
              </div>

              {/* Controls & Verification Sign */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Track Emissions simulated button */}
                <button
                  onClick={handleTrackEmissions}
                  disabled={isUploading}
                  className="bg-[#10B981] hover:bg-[#059669] disabled:bg-[#94A3B8] text-white font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>AI Extracting Data...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4 text-white" />
                      <span>Track Emissions</span>
                    </>
                  )}
                </button>

                {/* Audit Verification Seal */}
                {isVerified && (
                  <div className="flex items-center space-x-2.5 bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-2 rounded-xl text-[#065F46] animate-none">
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                    <div className="text-left leading-none">
                      <div className="font-mono text-[9px] uppercase tracking-wider font-bold">Audit Status</div>
                      <div className="font-sans font-bold text-xs">CARBONOS VERIFIED</div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right Column (Reminders, Offset and Team) */}
          <div className="space-y-8">
            
            {/* Offset Options Panel */}
            <div className="bg-[#0F291B] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between h-[230px]">
              <div className="space-y-2">
                <div className="font-mono text-[9px] text-[#A7F3D0] uppercase tracking-wider font-bold">EMISSIONS COMPENSATIONS</div>
                <h3 className="font-sans font-bold text-lg leading-tight">Offset Your Footprint</h3>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Purchase certified Bangladeshi carbon credits directly on our registry to mitigate your calculated corporate emissions debt.
                </p>
              </div>

              <button
                onClick={() => navigate('/platform/marketplace')}
                className="bg-[#4ADE80] hover:bg-[#22C55E] text-[#0F291B] font-sans font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>Browse Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reminders / To-dos */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#F1F5F9]">
                <h3 className="font-sans font-bold text-sm text-[#0F291B]">Verification Tasks</h3>
                <span className="bg-[#E2E8F0] text-[#0F291B] text-[9px] font-bold px-2 py-0.5 rounded-full">3 left</span>
              </div>
              
              <ul className="space-y-3 font-sans text-xs">
                <li className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" defaultChecked className="mt-0.5 border-[#E2E8F0] rounded" />
                    <span className="text-[#64748B] line-through">Upload Q2 Boiler Fuel statements</span>
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" defaultChecked={isVerified} className="mt-0.5 border-[#E2E8F0] rounded" />
                    <span className={isVerified ? "text-[#64748B] line-through" : "text-[#1E293B]"}>Verify Scope 3 Cargo Commutes</span>
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" className="mt-0.5 border-[#E2E8F0] rounded" />
                    <span>Purchase offsets for raw materials (plastic)</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Team Members */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#F1F5F9]">
                <h3 className="font-sans font-bold text-sm text-[#0F291B]">ESG Audit Team</h3>
                <button className="text-[10px] font-sans font-semibold text-emerald hover:underline">Add Member</button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Alexandra B.", role: "Lead ESG Auditor", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" },
                  { name: "Edwin A.", role: "Carbon Credit Specialist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" },
                  { name: "Isaac O.", role: "IoT Hardware Engineer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" }
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-7 h-7 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left leading-none">
                        <div className="font-sans font-bold text-xs text-[#0F291B]">{member.name}</div>
                        <div className="text-[9px] text-[#64748B] font-mono mt-0.5">{member.role}</div>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald/10 text-emerald border border-emerald/20 px-2 py-0.5 rounded uppercase font-bold">Active</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default SaaSDashboard;
