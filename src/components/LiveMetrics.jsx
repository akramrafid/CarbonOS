import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertCircle, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LiveMetrics = () => {
  const containerRef = useRef(null);
  const BLYNK_TOKEN = "wwKSjCxjjeox9NoiH1hkiet359mok4Wf";

  const [metrics, setMetrics] = useState({
    temp: null,
    hum: null,
    air: null,
    co2: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const AIR_GOOD_MAX = 250;
  const AIR_WARN_MAX = 450;
  
  const CO2_GOOD_MAX = 1000;
  const CO2_WARN_MAX = 2000;

  const getAirStatus = (raw) => {
    if (raw === null || isNaN(raw)) return { text: "Waiting...", style: "text-mist bg-white/5 border-white/10", bgClass: "bg-[#0D2B1A]/30 border-emerald/20" };
    if (raw <= AIR_GOOD_MAX) return { text: "GOOD", style: "text-emerald bg-emerald/10 border-emerald/20", bgClass: "bg-[#0D2B1A]/30 border-emerald/20" };
    if (raw <= AIR_WARN_MAX) return { text: "MODERATE", style: "text-amber-400 bg-amber-400/10 border-amber-400/20", bgClass: "bg-amber-950/20 border-amber-500/20" };
    return { text: "POOR", style: "text-rose-500 bg-rose-500/10 border-rose-500/20", bgClass: "bg-rose-950/20 border-rose-500/20" };
  };

  const getCO2Status = (raw) => {
    if (raw === null || isNaN(raw)) return { text: "Waiting...", style: "text-mist bg-white/5 border-white/10", bgClass: "bg-[#0D2B1A]/30 border-emerald/20" };
    if (raw <= CO2_GOOD_MAX) return { text: "EXCELLENT", style: "text-emerald bg-emerald/10 border-emerald/20", bgClass: "bg-[#0D2B1A]/30 border-emerald/20" };
    if (raw <= CO2_WARN_MAX) return { text: "FAIR", style: "text-amber-400 bg-amber-400/10 border-amber-400/20", bgClass: "bg-amber-950/20 border-amber-500/20" };
    return { text: "HIGH", style: "text-rose-500 bg-rose-500/10 border-rose-500/20", bgClass: "bg-rose-950/20 border-rose-500/20" };
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`https://blynk.cloud/external/api/getAll?token=${BLYNK_TOKEN}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      setMetrics({
        temp: parseFloat(data.v0),
        hum: parseFloat(data.v1),
        air: parseInt(data.v2),
        co2: parseInt(data.v3)
      });
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching Blynk data:", err);
      setError("Unable to connect to Blynk Cloud server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);

    let ctx = gsap.context(() => {
      gsap.fromTo('.metric-card', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power3.out', 
          stagger: 0.14,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, containerRef);

    return () => {
      clearInterval(interval);
      ctx.revert();
    };
  }, []);

  const airStatus = getAirStatus(metrics.air);
  const co2Status = getCO2Status(metrics.co2);

  return (
    <section ref={containerRef} className="w-full bg-[#040A06] py-24 px-6 lg:px-12 relative overflow-hidden border-t border-white/5">
      {/* Decorative pulse glow animation stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseLive {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); opacity: 0.8; }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); opacity: 1; }
        }
        .pulse-live-dot {
          animation: pulseLive 2s infinite;
        }
      ` }} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="font-mono text-xs text-emerald tracking-[0.25em] px-4 py-1.5 bg-[#0D2B1A]/40 border border-[#00C853]/25 rounded-full uppercase font-bold inline-flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald pulse-live-dot"></span>
              <span>ESP8266 Live Telemetry</span>
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            IoT Air Quality Monitor
          </h2>
          <div className="flex justify-center items-center space-x-2 mt-4 text-xs font-mono text-mist/60">
            <span>Server: blynk.cloud</span>
            <span>•</span>
            <span>Sync: 5s intervals</span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span className="text-emerald">Updated: {lastUpdated}</span>
              </>
            )}
          </div>
        </div>

        {/* Error Alert Bar */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/25 rounded-xl p-4 flex items-center space-x-3 text-rose-400">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-xs font-mono">{error} Showing cached telemetry data.</span>
          </div>
        )}

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Temperature */}
          <div className="metric-card bg-[#080F0B] border border-white/5 backdrop-blur-md rounded-[1.5rem] p-8 shadow-lg group relative overflow-hidden transition-all duration-300 hover:border-emerald/30">
            <span className="font-mono text-[10px] text-mist/40 uppercase tracking-widest block mb-2 font-bold">
              Temperature
            </span>
            <div className="mb-4 flex items-baseline">
              <span className="font-mono text-4xl lg:text-5xl text-cyan-400 font-bold leading-none">
                {metrics.temp !== null ? metrics.temp.toFixed(1) : "--"}
              </span>
              <span className="font-mono text-xl text-mist/60 ml-1">°C</span>
            </div>
            <div className="text-[10px] font-mono text-mist/50 border border-white/5 rounded-full px-2.5 py-1 w-fit bg-white/5">
              Live from DHT Sensor
            </div>
          </div>

          {/* Card 2: Humidity */}
          <div className="metric-card bg-[#080F0B] border border-white/5 backdrop-blur-md rounded-[1.5rem] p-8 shadow-lg group relative overflow-hidden transition-all duration-300 hover:border-emerald/30">
            <span className="font-mono text-[10px] text-mist/40 uppercase tracking-widest block mb-2 font-bold">
              Humidity
            </span>
            <div className="mb-4 flex items-baseline">
              <span className="font-mono text-4xl lg:text-5xl text-cyan-400 font-bold leading-none">
                {metrics.hum !== null ? metrics.hum.toFixed(1) : "--"}
              </span>
              <span className="font-mono text-xl text-mist/60 ml-1">%</span>
            </div>
            <div className="text-[10px] font-mono text-mist/50 border border-white/5 rounded-full px-2.5 py-1 w-fit bg-white/5">
              Relative air density
            </div>
          </div>

          {/* Card 3: Air Quality */}
          <div className={`metric-card border backdrop-blur-md rounded-[1.5rem] p-8 shadow-lg group relative overflow-hidden transition-all duration-500 ${airStatus.bgClass}`}>
            <span className="font-mono text-[10px] text-mist/40 uppercase tracking-widest block mb-2 font-bold">
              Air Quality
            </span>
            <div className="mb-4 flex items-baseline">
              <span className="font-mono text-4xl lg:text-5xl text-amber font-bold leading-none">
                {metrics.air !== null ? metrics.air : "--"}
              </span>
              <span className="font-mono text-xs text-mist/60 ml-1">raw</span>
            </div>
            <div className={`text-[10px] font-mono border rounded-full px-2.5 py-1 w-fit font-bold uppercase tracking-wider ${airStatus.style}`}>
              {airStatus.text}
            </div>
          </div>

          {/* Card 4: CO2 */}
          <div className={`metric-card border backdrop-blur-md rounded-[1.5rem] p-8 shadow-lg group relative overflow-hidden transition-all duration-500 ${co2Status.bgClass}`}>
            <span className="font-mono text-[10px] text-mist/40 uppercase tracking-widest block mb-2 font-bold">
              CO2 Level
            </span>
            <div className="mb-4 flex items-baseline">
              <span className="font-mono text-4xl lg:text-5xl text-amber font-bold leading-none">
                {metrics.co2 !== null ? metrics.co2 : "--"}
              </span>
              <span className="font-mono text-sm text-mist/60 ml-1">ppm</span>
            </div>
            <div className={`text-[10px] font-mono border rounded-full px-2.5 py-1 w-fit font-bold uppercase tracking-wider ${co2Status.style}`}>
              {co2Status.text}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LiveMetrics;
