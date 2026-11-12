import React from 'react';
import { Sparkles, Search, Send, Loader2, Quote, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Tabs } from '../../../../components/ui/Tabs';

export const EsgAiRagSection = ({
  isLight,
  ragQuery = '',
  setRagQuery,
  ragCorpus = 'all',
  setRagCorpus,
  executeRagQuery,
  isRagLoading = false,
  ragResponse,
  selectedCitation,
  setSelectedCitation
}) => {
  return (
    <div className={`border-t pt-6 space-y-4 ${isLight ? 'border-carbon-border' : 'border-border-subtle'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md border flex items-center justify-center bg-emerald/15 border-emerald/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald" />
          </div>
          <h4 className={`font-sans font-bold text-sm ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Carbon Zero BD ESG Regulatory & Auditor Copilot
          </h4>
        </div>
        
        {/* Corpus Filter Tabs */}
        <Tabs
          tabs={[
            { id: 'all', label: 'All Corpora' },
            { id: 'regulatory', label: 'Regulations (NDC/ECR)' },
            { id: 'emission_factors', label: 'Emission Factors' },
            { id: 'tenant_docs', label: 'Audit Statements' }
          ]}
          activeTab={ragCorpus}
          onChange={setRagCorpus}
          size="sm"
        />
      </div>

      {/* Quick Question Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          "What is Bangladesh's official 2023 grid emission factor?",
          "What are Bangladesh's updated NDC 2030 mitigation targets?",
          "How does EU CBAM affect our manufacturing and export emissions?",
          "What was the diesel generator fuel consumption in Q2 audit statement?"
        ].map((promptText, i) => (
          <Button
            key={i}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => executeRagQuery(promptText)}
            leftIcon={<Search className="w-3 h-3 shrink-0 text-emerald" />}
            className="text-[11px] h-auto min-h-0 py-1.5 px-3 rounded-full"
          >
            {promptText}
          </Button>
        ))}
      </div>

      {/* Search / Ask AI Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); executeRagQuery(); } }}
            placeholder="Ask anything about Bangladesh ESG laws, DoE emission factors, or audit evidence..."
            icon={<Search className="w-4 h-4 text-mist" />}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => executeRagQuery()}
          disabled={isRagLoading || !ragQuery.trim()}
          loading={isRagLoading}
          icon={<Send className="w-3.5 h-3.5" />}
        >
          Ask Copilot
        </Button>
      </div>

      {/* RAG Grounded Answer Output */}
      {ragResponse && (
        <div className={`rounded-2xl p-5 space-y-4 border ${
          isLight ? 'bg-bg-muted border-emerald/30' : 'bg-bg-canvas border-border-subtle'
        }`}>
          <div className={`flex justify-between items-center pb-2 border-b ${
            isLight ? 'border-emerald/20' : 'border-border-subtle'
          }`}>
            <div className="flex items-center space-x-2">
              <Badge variant="emerald" size="sm">
                {ragResponse.model_used || "unknown"}
              </Badge>
              <span className={`text-xs font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Grounded ESG Synthesis
              </span>
            </div>
            {ragResponse.latency_ms && (
              <span className="font-mono text-[10px] text-mist">
                {ragResponse.latency_ms}ms
              </span>
            )}
          </div>

          <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-fg-primary' : 'text-fg-primary'}`}>
            {ragResponse.answer}
          </p>

          {/* Citations */}
          {ragResponse.citations && ragResponse.citations.length > 0 && (
            <div className="pt-2 border-t border-inherit space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-mist block">
                Verification Citations ({ragResponse.citations.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {ragResponse.citations.map((c, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedCitation(selectedCitation === i ? null : i)}
                    leftIcon={<BookOpen className="w-3 h-3 text-emerald" />}
                    className="text-[10px] font-mono h-auto min-h-0 py-1 px-2.5"
                  >
                    {c.source || `Citation ${i + 1}`}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EsgAiRagSection;
