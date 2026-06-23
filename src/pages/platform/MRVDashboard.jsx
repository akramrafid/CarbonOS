import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const MRVDashboard = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/farmers-ai/api/mrv/carbon-health-trends/')
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          setTrends(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch trends", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">MRV Dashboard</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">Real-time Measurement, Reporting, and Verification data feeds.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10">
        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans font-bold text-2xl text-registry flex items-center">
              <span className="pulse-dot mr-3"></span>
              Live Telemetry
            </h2>
            <span className="font-mono text-[10px] text-emerald bg-emerald/10 px-2 py-1 rounded">SYSTEM: NOMINAL</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">ACTIVE IOT NODES</div>
              <div className="font-mono text-xl text-registry">12,408</div>
            </div>
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">LAST SATELLITE PASS</div>
              <div className="font-mono text-xl text-registry">14 mins ago</div>
            </div>
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">tCO2e MITIGATED TODAY</div>
              <div className="font-mono text-xl text-emerald">450.2</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stream Data */}
            <div className="p-6 bg-[#0D2B1A]/50 border border-emerald/10 rounded-xl font-mono text-xs text-mist flex flex-col h-full">
              <div className="text-amber mb-4">&gt;&gt; INCOMING DATA STREAM</div>
              <div className="space-y-3 flex-1">
                <div>[NODE-84A] Solar output matched expected baseline. (+2.1 tCO2e)</div>
                <div>[NODE-92C] Cookstove usage confirmed via thermal sensor. (+0.4 tCO2e)</div>
                <div>[SAT-GEO] Mangrove boundary scan complete. Zero deforestation detected.</div>
                <div className="text-emerald">[FARMER-AI] Diagnosis logged. field_id: 1102 (healthy)</div>
              </div>
            </div>

            {/* Farmer's AI Carbon Asset Alerts */}
            <div className="p-6 bg-[#040A06] border border-purple-500/20 rounded-xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-[10px] text-purple-400 tracking-wider">CARBON ASSET HEALTH ALERTS</div>
                <span className="flex items-center text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                  TIER B (PERENNIALS)
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2">
                {loading ? (
                  <div className="flex items-center justify-center h-20"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
                ) : trends.length === 0 ? (
                  <div className="text-xs text-gray-500 font-mono text-center mt-4 border border-gray-800 p-4 rounded-lg">NO TIER B DIAGNOSIS DATA YET</div>
                ) : (
                  trends.map((t, i) => (
                    <div key={i} className={`p-3 border rounded-lg flex items-start ${t.risk_percentage > 20 ? 'bg-red-500/10 border-red-500/20' : t.risk_percentage > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald/10 border-emerald/20'}`}>
                      {t.risk_percentage > 0 ? <AlertTriangle className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${t.risk_percentage > 20 ? 'text-red-400' : 'text-orange-400'}`} /> : <CheckCircle className="w-4 h-4 text-emerald mr-2 shrink-0 mt-0.5" />}
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                           <div className={`text-xs font-semibold ${t.risk_percentage > 20 ? 'text-red-200' : t.risk_percentage > 0 ? 'text-orange-200' : 'text-emerald'}`}>Region: {t.region.toUpperCase()}</div>
                           <div className="text-xs font-mono text-white">{t.risk_percentage}% At Risk</div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1">Total Tier B scans: {t.total_diagnoses} | At risk: {t.at_risk_count}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRVDashboard;
