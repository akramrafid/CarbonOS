import React from 'react';
import { Database, ShieldAlert, Sprout, ShieldCheck, ArrowUpRight, ArrowRight } from 'lucide-react';
import { m } from 'framer-motion';
import { WORKFLOW_DETAILS } from './cropsData';

export function WorkflowCards({
  lang,
  text,
  containerVariants,
  itemVariants
}) {
  const workflowSteps = [
    { icon: <Database size={32} />, label: text.workflowData, color: "text-lime-400", bg: "bg-lime-400/10", details: WORKFLOW_DETAILS[lang][0] },
    { icon: <ShieldAlert size={32} />, label: text.workflowWarning, color: "text-orange-400", bg: "bg-orange-400/10", details: WORKFLOW_DETAILS[lang][1] },
    { icon: <Sprout size={32} />, label: text.workflowAction, color: "text-black", bg: "bg-lime-400", details: WORKFLOW_DETAILS[lang][2] },
    { icon: <ShieldCheck size={32} />, label: text.workflowSaved, color: "text-green-400", bg: "bg-green-400/10", details: WORKFLOW_DETAILS[lang][3] }
  ];

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="mb-14 relative"
    >
      {/* [COMMENTED OUT FOR PERSONAL REFERENCE — removed full-section ambient blur blob] */}

        <m.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-center text-fg-primary mb-4 tracking-tight">
          {text.solutionTitle}
        </m.h2>
          <m.p variants={itemVariants} className="text-lg text-fg-secondary text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            {text.solutionDesc}
          </m.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, idx) => {
              const isSolidCard = idx === 2;
              return (
                <m.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-8 rounded-[28px] text-left transition-[background-color,border-color,box-shadow,transform] duration-300 relative flex flex-col justify-between min-h-[280px] group border
                ${isSolidCard
                        ? 'bg-accent text-fg-inverse border-accent shadow-lg hover:scale-[1.02]'
                        : 'bg-bg-surface border-border-subtle hover:border-accent/50 hover:scale-[1.02] hover:bg-bg-elevated text-fg-primary'
                    }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className={`text-sm font-black tracking-widest uppercase ${isSolidCard ? 'text-fg-inverse/75' : 'text-fg-muted'}`}>
                          {idx + 1 === 1 ? '01' : idx + 1 === 2 ? '02' : idx + 1 === 3 ? '03' : '04'}
                        </div>
                          <div className={`p-2.5 rounded-full ${isSolidCard ? 'bg-fg-inverse/15 text-fg-inverse' : 'bg-accent/10 text-emerald-700 dark:text-lime-400 border border-accent/25 group-hover:bg-accent group-hover:text-fg-inverse group-hover:border-transparent'} transition-colors duration-300`}>
                            {isSolidCard ? <ArrowUpRight size={18} /> : step.icon}
                          </div>
                        </div>

                          <h3 className={`text-xl font-bold tracking-tight mb-2 ${isSolidCard ? 'text-fg-inverse' : 'text-fg-primary'}`}>
                            {step.label}
                          </h3>

                            <p className={`text-sm leading-relaxed ${isSolidCard ? 'text-fg-inverse/90 font-medium' : 'text-fg-secondary'}`}>
                              {step.details}
                            </p>
                          </div>

                            <div className={`pt-6 mt-6 border-t ${isSolidCard ? 'border-fg-inverse/20 text-fg-inverse' : 'border-border-subtle text-fg-primary'} flex items-center justify-between`}>
                              <span className="text-xs font-bold uppercase tracking-wider">
                                {isSolidCard ? (lang === 'en' ? 'Get Advice' : 'পরামর্শ নিন') : (lang === 'en' ? 'Active' : 'চলমান')}
                              </span>
                              <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </m.div>
                          );
        })}
                      </div>
                    </m.div>
                    );
}

                    export default WorkflowCards;
