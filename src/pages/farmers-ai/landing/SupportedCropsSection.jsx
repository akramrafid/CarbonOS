import React from 'react';
import { motion } from 'framer-motion';
import { CROPS_DATA } from './cropsData';

export function SupportedCropsSection({
  lang,
  text,
  selectedCrop,
  onSelectCrop,
  containerVariants,
  itemVariants
}) {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="mb-32 relative z-10"
    >
      <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-center text-white mb-4 tracking-tight">
        {text.cropsTitle}
      </motion.h2>
      <motion.p variants={itemVariants} className="text-lg text-white/60 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
        {text.cropsSubtitle}
      </motion.p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {CROPS_DATA.map((crop) => (
          <motion.button
            key={crop.id}
            variants={itemVariants}
            onClick={() => onSelectCrop(selectedCrop === crop.id ? null : crop.id)}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
              selectedCrop === crop.id
                ? 'bg-lime-400/10 border-lime-400 shadow-[0_0_25px_rgba(204,255,0,0.15)] scale-[1.02]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{crop.icon}</div>
            <h4 className="text-xl font-bold text-white mb-1 tracking-tight">
              {lang === 'en' ? crop.nameEn : crop.nameBn}
            </h4>
            <p className="text-xs text-white/40 font-medium capitalize">
              {crop.diseasesEn.length} {text.diseasesDetected}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Interactive Collapsible Detail Panel */}
      {selectedCrop && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-lime-400/10 to-transparent border border-lime-400/20 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 blur-3xl rounded-full pointer-events-none" />
          {(() => {
            const crop = CROPS_DATA.find(c => c.id === selectedCrop);
            if (!crop) return null;
            return (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl">{crop.icon}</span>
                  <h3 className="text-2xl font-bold text-lime-400 tracking-tight">
                    {lang === 'en' ? crop.nameEn : crop.nameBn} {lang === 'en' ? 'Diagnostics' : 'রোগ তালিকা'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(lang === 'en' ? crop.diseasesEn : crop.diseasesBn).map((disease, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl flex items-center space-x-3 text-white/80 hover:text-white hover:border-lime-400/30 transition-all duration-200">
                      <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                      <span className="font-semibold text-sm capitalize tracking-wide">{disease.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}

export default SupportedCropsSection;
