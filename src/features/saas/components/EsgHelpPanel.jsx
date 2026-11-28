import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const EsgHelpPanel = (props) => {
  const {
    faqOpen,
    toggleFaq,
    showToast
  } = props;

  return (
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-fg-primary">FAQ & GHG Guidelines</h2>
          <p className="text-sm text-fg-secondary mt-1 font-sans">Understand Scope definitions and carbon tracking calculations.</p>
        </div>

        {/* Accordion */}
        <div className="space-y-4 border-t border-border-subtle pt-4">
          {[
            {
              q: "What is Scope 1 Direct Emissions?",
              a: "Scope 1 emissions are direct greenhouse gas emissions from sources that are owned or controlled by the company. Examples include emissions from combustion in owned boilers, diesel generators, furnaces, and corporate vehicles."
            },
            {
              q: "What is Scope 2 Indirect Electricity Emissions?",
              a: "Scope 2 accounts for greenhouse gas emissions from the generation of purchased electricity, steam, heating, and cooling consumed by the reporting company. Location-based Scope 2 multiplies purchased kWh by the grid's average emission rate; a CDM combined margin is a project-baseline metric and is not used. CarbonOS ships no default Bangladesh grid factor: each factor is cited and approved by a second person."
            },
            {
              q: "What is Scope 3 Value Chain Emissions?",
              a: "Scope 3 emissions are a consequence of the activities of the company, but occur from sources not owned or controlled by it. Examples include employee business commutes, supplier raw material logistics (plastic, glass), and third party flights."
            }
          ].map((item, idx) => (
            <div key={idx} className="border border-border-subtle rounded-xl overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center p-4 bg-bg-muted text-left text-xs font-sans font-bold text-fg-primary rounded-none h-auto min-h-0"
                rightIcon={faqOpen[idx] ? <ChevronUp className="w-4 h-4 text-fg-secondary" /> : <ChevronDown className="w-4 h-4 text-fg-secondary" />}
              >
                <span>{item.q}</span>
              </Button>
              {faqOpen[idx] && (
                  <div className="p-4 bg-bg-surface border-t border-border-subtle text-xs font-sans text-fg-secondary leading-relaxed">
                    {item.a}
                  </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */ }
            < div className = "border-t border-border-subtle pt-6 space-y-4" >
              <h3 className="font-sans font-bold text-sm text-fg-primary">Need help with auditing?</h3>
              <p className="text-xs text-fg-secondary font-sans">Our certified ESG specialists are available to review your corporate data streams.</p>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => showToast("A support request has been sent. An ESG auditor will reach out soon.", "success")}
              >
                Consult Carbon Zero BD Specialists
              </Button>
            </div>

      </div>
      );
};

      export default EsgHelpPanel;
