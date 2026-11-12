import React from 'react';
import { Database, ShieldAlert, Sprout, ShieldCheck, ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { WORKFLOW_DETAILS } from './cropsData';

export function WorkflowCards({
  lang,
  text,
  containerVariants,
  itemVariants
}) {
  const workflowSteps = [
    { icon: <Database size={32} />, label: text.workflowData, color: "text-[#CCFF00]", bg: "bg-[#CCFF00]/10", details: WORKFLOW_DETAILS[lang][0] },
    { icon: <ShieldAlert size={32} />, label: text.workflowWarning, color: "text-orange-400", bg: "bg-orange-400/10", details: WORKFLOW_DETAILS[lang][1] },
    { icon: <Sprout size={32} />, label: text.workflowAction, color: "text-black", bg: "bg-[#CCFF00]", details: WORKFLOW_DETAILS[lang][2] },
    { icon: <ShieldCheck size={32} />, label: text.workflowSaved, color: "text-green-400", bg: "bg-green-400/10", details: WORKFLOW_DETAILS[lang][3] }
  ];

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="mb-32 relative"
    >
      <div className="absolute inset-0 bg-[#CCFF00]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-center text-white mb-4 tracking-tight">
        {text.solutionTitle}
      </motion.h2>
      <motion.p variants={itemVariants} className="text-lg text-white/60 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
        {text.solutionDesc}
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {workflowSteps.map((step, idx) => {
          const isSolidCard = idx === 2;
          return (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className={`p-8 rounded-[28px] text-left transition-all duration-300 relative flex flex-col justify-between min-h-[280px] group border
                ${isSolidCard 
                  ? 'bg-[#CCFF00] text-black border-transparent shadow-[0_15px_30px_rgba(204,255,0,0.15)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(204,255,0,0.25)]' 
                  : 'bg-white/5 border-white/10 hover:border-[#CCFF00]/40 hover:scale-[1.02] hover:bg-white/10 text-white'
                }`}
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className={`text-sm font-black tracking-widest uppercase ${isSolidCard ? 'text-black/50' : 'text-white/40'}`}>
                    {idx + 1 === 1 ? '01' : idx + 1 === 2 ? '02' : idx + 1 === 3 ? '03' : '04'}
                  </div>
                  <div className={`p-2.5 rounded-full ${isSolidCard ? 'bg-black text-[#CCFF00]' : 'bg-white/5 text-[#CCFF00] border border-white/10 group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-transparent'} transition-all duration-300`}>
                    {isSolidCard ? <ArrowUpRight size={18} /> : step.icon}
                  </div>
                </div>

                <h3 className={`text-xl font-bold tracking-tight mb-2 ${isSolidCard ? 'text-black' : 'text-white'}`}>
                  {step.label}
                </h3>

                <p className={`text-sm leading-relaxed ${isSolidCard ? 'text-black/80 font-medium' : 'text-white/60'}`}>
                  {step.details}
                </p>
              </div>

              <div className={`pt-6 mt-6 border-t ${isSolidCard ? 'border-black/10' : 'border-white/10'} flex items-center justify-between`}>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isSolidCard ? (lang === 'en' ? 'Get Advice' : 'পরামর্শ নিন') : (lang === 'en' ? 'Active' : 'চলমান')}
                </span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default WorkflowCards;
