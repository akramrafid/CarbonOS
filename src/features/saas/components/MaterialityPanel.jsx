import React from 'react';
import { Compass } from 'lucide-react';

export const MaterialityPanel = (props) => {
  const {
    materialityScores,
    setMaterialityScores,
    showToast
  } = props;

  return (
          <div className="bg-[#08130C] border border-[#152B1D] rounded-3xl p-6 lg:p-8 shadow-xl space-y-6 text-white">
            <div>
              <h1 className="font-sans font-bold text-3xl text-white">Double Materiality Assessment</h1>
              <p className="text-sm text-[#7C9A88] mt-1 font-sans">
                Identify and prioritize key ESG issues based on their Impact Materiality and Financial Materiality (CSRD/ESRS aligned).
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Matrix Plot (Visual Grid) */}
              <div className="xl:col-span-1 bg-[#040906] rounded-2xl p-6 border border-[#152B1D] flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-bold text-sm text-white mb-4">Double Materiality Matrix</h3>
                  <div className="relative w-full aspect-square bg-carbon border-l border-b border-forest grid grid-cols-5 grid-rows-5">
                    {/* Matrix Labels */}
                    <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 text-[9px] font-mono uppercase text-[#7C9A88] font-bold">Impact Materiality →</div>
                    <div className="absolute -left-14 top-1/2 transform -translate-y-1/2 rotate-90 text-[9px] font-mono uppercase text-[#7C9A88] font-bold">Financial Materiality →</div>
                    
                    {/* Materiality threshold line (dashed red) */}
                    <div className="absolute inset-0 border-t border-r border-dashed border-red-400 pointer-events-none" style={{ left: '40%', top: '40%' }}>
                      <span className="absolute right-2 top-2 text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider bg-[#040906]/90 px-1 rounded">Material Threshold</span>
                    </div>

                    {/* Plotted Topics */}
                    {Object.entries(materialityScores).map(([key, topic]) => {
                      // Map 1-5 to percentage coordinates
                      const xPercent = (topic.impact - 0.5) * 20; 
                      const yPercent = (5.5 - topic.financial) * 20; // invert y for top-origin
                      
                      const isMaterial = topic.impact >= 3 && topic.financial >= 3;

                      return (
                        <div 
                          key={key}
                          className={`absolute w-4 h-4 rounded-full cursor-pointer flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-md transition-all hover:scale-125 ${
                            isMaterial ? 'bg-[#00C853] border-2 border-emerald-400' : 'bg-[#334155] border-2 border-[#1B4D2E]'
                          }`}
                          style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                          title={`${topic.name} (Impact: ${topic.impact}, Financial: ${topic.financial})`}
                          onClick={() => showToast(`Selected: ${topic.name}. Impact: ${topic.impact}, Financial: ${topic.financial}`, "info")}
                        >
                          <span className="text-[7px] text-black font-bold">{topic.name.charAt(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[10px] text-[#7C9A88] mt-10 leading-relaxed font-sans">
                  * Dark green dots with emerald borders represent <span className="text-[#4ADE80] font-semibold">Material Topics</span> which exceed the ESRS threshold (≥ 3.0 on both dimensions) and must be included in your ESG disclosures.
                </div>
              </div>

              {/* Slider Controls */}
              <div className="xl:col-span-2 space-y-6">
                <h3 className="font-sans font-bold text-sm text-white border-b border-[#152B1D] pb-2">Rate ESG Topics</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(materialityScores).map(([key, topic]) => (
                    <div key={key} className="p-4 bg-[#040906] rounded-xl border border-[#152B1D] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-sans font-bold text-xs text-white">{topic.name}</h4>
                          <p className="text-[10px] text-[#7C9A88] mt-0.5 font-sans leading-relaxed">{topic.description}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          topic.impact >= 3 && topic.financial >= 3
                            ? 'bg-[#00C853]/20 text-[#4ADE80] border border-[#00C853]/30'
                            : 'bg-white/5 text-[#7C9A88]'
                        }`}>
                          {topic.impact >= 3 && topic.financial >= 3 ? 'Material' : 'Non-Material'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#7C9A88] font-mono">
                            <span>Impact Materiality</span>
                            <span className="font-bold text-[#4ADE80]">{topic.impact} / 5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={topic.impact}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setMaterialityScores(prev => ({
                                ...prev,
                                [key]: { ...prev[key], impact: val }
                              }));
                            }}
                            className="w-full h-1 bg-[#152B1D] rounded-lg appearance-none cursor-pointer accent-[#00C853]"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#7C9A88] font-mono">
                            <span>Financial Materiality</span>
                            <span className="font-bold text-[#4ADE80]">{topic.financial} / 5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={topic.financial}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setMaterialityScores(prev => ({
                                ...prev,
                                [key]: { ...prev[key], financial: val }
                              }));
                            }}
                            className="w-full h-1 bg-[#152B1D] rounded-lg appearance-none cursor-pointer accent-[#00C853]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
  );
};

export default MaterialityPanel;
