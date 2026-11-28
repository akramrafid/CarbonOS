import React from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Sprout, Leaf, Trees } from 'lucide-react';
import { CROPS_DATA } from './cropsData';

const CROP_ICON_MAP = {
  Sprout,
  Leaf,
  Trees,
};

export function SupportedCropsSection({
  lang,
  text,
  selectedCrop,
  onSelectCrop,
  containerVariants,
  itemVariants
}) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="mb-16 relative z-10"
    >
        <m.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-center text-fg-primary mb-4 tracking-tight">
          {text.cropsTitle}
        </m.h2>
          <m.p variants={itemVariants} className="text-lg text-fg-secondary text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            {text.cropsSubtitle}
          </m.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {CROPS_DATA.map((crop) => {
              const CropIcon = CROP_ICON_MAP[crop.icon] || Sprout;
              return (
                <m.button
                  key={crop.id}
                  variants={itemVariants}
                  onClick={() => onSelectCrop(selectedCrop === crop.id ? null : crop.id)}
                  className={`p-6 rounded-3xl border text-left transition-colors duration-300 relative overflow-hidden group cursor-pointer ${selectedCrop === crop.id
                        ? 'bg-accent/10 border-accent shadow-lg scale-[1.02]'
                        : 'bg-bg-surface border-border-subtle hover:bg-bg-elevated hover:border-border-strong hover:scale-[1.01]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center mb-4 text-accent transform group-hover:scale-105 transition-transform duration-300">
                      <CropIcon size={22} />
                    </div>
                      <h4 className="text-xl font-bold text-fg-primary mb-1 tracking-tight">
                        {lang === 'en' ? crop.nameEn : crop.nameBn}
                      </h4>
                        <p className="text-xs text-fg-secondary font-medium capitalize">
                          {crop.diseasesEn.length} {text.diseasesDetected}
                        </p>
                      </m.button>
                      );
        })}
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedCrop && (
                      <m.div
                        key={selectedCrop}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-bg-surface border border-accent/30 p-6 md:p-8 rounded-3xl shadow-xl relative"
                      >
                        {(() => {
                          const crop = CROPS_DATA.find(c => c.id === selectedCrop);
                          if (!crop) return null;
                          const SelectedIcon = CROP_ICON_MAP[crop.icon] || Sprout;
                          return (
                            <div>
                              <div className="flex items-center space-x-3 mb-6">
                                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                                    <SelectedIcon size={20} />
                                  </div>
                                    <h3 className="text-2xl font-bold text-accent tracking-tight">
                                      {lang === 'en' ? crop.nameEn : crop.nameBn} {lang === 'en' ? 'Diagnostics' : 'রোগ তালিকা'}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  {(lang === 'en' ? crop.diseasesEn : crop.diseasesBn).map((disease, idx) => (
                                      <div key={idx} className="bg-bg-elevated border border-border-subtle px-4 py-3.5 rounded-2xl flex items-center space-x-3 text-fg-primary hover:border-accent/40 transition-colors duration-200">
                                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                                        <span className="font-semibold text-sm capitalize tracking-wide">{disease.replace(/_/g, ' ')}</span>
                                      </div>
                    ))}
                                    </div>
                </div>
                                );
            })()}
                              </m.div>
        )}
                            </AnimatePresence>
    </m.div>
                    );
}

                    export default SupportedCropsSection;
