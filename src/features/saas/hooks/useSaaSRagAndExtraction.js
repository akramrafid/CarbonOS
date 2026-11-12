import { useState } from 'react';
import { extractESGFromDocument, parseDocumentTextToEsgParams } from '../../../lib/esgDocumentExtractor';
import { esgFetch } from '../../../lib/esgApi';

const SAMPLE_TEXT = `Dexterity Textiles Ltd Q2 Audit Statement DEPZ TX-8491. High Speed Diesel generator: 14,200 Liters. Fleet octane petrol: 4,800 Liters. Commercial LPG: 1,950 kg. DESCO Grid active electricity: 156,000 kWh. Workforce: 148 employees. Overseas marketing flights: 82,000 km. Outward truck freight: 39,000 ton-km. Purchased raw cotton fabric yarn: 580 metric tons. Total Invoiced Spend: BDT 14,850,000.`;

export const useSaaSRagAndExtraction = ({
  inputs,
  setInputs,
  ef,
  setEf,
  calculateEmissions,
  setTasks,
  setNotifications,
  showToast
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);

  // Carbon Zero BD ESG Multi-Corpus RAG State
  const [extractionResult, setExtractionResult] = useState(null);
  const [showExtractionEvidence, setShowExtractionEvidence] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragCorpus, setRagCorpus] = useState('all');
  const [ragResponse, setRagResponse] = useState(null);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isSyncingFactors, setIsSyncingFactors] = useState(false);
  const [extractionStep, setExtractionStep] = useState(1);

  const executeAIExtraction = async (fileOrName = "ESG_Statement_Q2_2026.xlsx") => {
    setIsUploading(true);
    const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
    showToast(`Extracting activity data from ${fileName}...`, "info");

    try {
      let data = null;
      if (typeof fileOrName !== 'string' && fileOrName instanceof File) {
        try {
          data = await extractESGFromDocument(fileOrName);
        } catch (clientErr) {
          console.warn("Client ESG extraction note:", clientErr);
        }
        if (!data || !data.details?.length) {
          const formData = new FormData();
          formData.append('file', fileOrName);
          data = await esgFetch('/api/esg/extract-footprint', { method: 'POST', body: formData });
        }
      } else {
        const parsed = parseDocumentTextToEsgParams(SAMPLE_TEXT, fileName);
        data = {
          filename: `${fileName} (DEMO SAMPLE)`,
          overall_confidence: null,
          extraction_method: "demo-sample",
          review_status: "DEMO_SAMPLE",
          summary: "Demo sample data for a fictional company. Not customer data and not verified.",
          parameters: parsed.parameters,
          details: parsed.details,
          spendBdt: parsed.spendBdt
        };
      }

      if (!data || !data.details?.length) {
        throw new Error("No activity quantities were found in the document.");
      }

      const newParams = { ...data.parameters };
      const newInputs = { ...inputs };
      for (const key of ['diesel', 'petrol', 'lpg', 'electricity', 'employees', 'airTravel', 'truckTransport', 'rawMaterials']) {
        if (newParams[key] !== undefined) newInputs[key] = String(newParams[key]);
      }
      if (data.spendBdt) newInputs.spendBdt = data.spendBdt;

      setInputs(newInputs);
      calculateEmissions(newInputs, ef);
      setExtractionResult(data);
      setShowExtractionEvidence(true);
      setExtractionStep(2);
      setTasks(prev => prev.map(t => t.id === 2 ? { ...t, completed: true } : t));
      setNotifications(prev => [
        { id: Date.now(), text: `Extracted ${data.details.length} value(s) from ${fileName} — review required`, read: false, time: "Just now" },
        ...prev
      ]);
      showToast(`Extracted ${data.details.length} value(s). Review each value before use.`, "success");
    } catch (err) {
      showToast(`Extraction failed: ${err.message || "unknown error."} Enter values manually.`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
    if (file) {
      setUploadedFile(file.name);
      setUploadedFileObj(file);
      showToast(`Selected file: ${file.name}. Initializing Carbon Zero BD RAG pipeline...`, "info");
      await executeAIExtraction(file);
      if (e.target && e.target.value !== undefined) {
        e.target.value = '';
      }
    }
  };

  const executeRagQuery = async (overrideQuery = null) => {
    const q = overrideQuery || ragQuery;
    if (!q || !q.trim()) return;

    setIsRagLoading(true);
    setRagQuery(q);

    try {
      const data = await esgFetch('/api/esg/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, corpus: ragCorpus, top_k: 5 })
      });
      setRagResponse(data);
    } catch (err) {
      setRagResponse({
        query: q,
        answer: `The ESG assistant is unavailable: ${err.message} No answer was generated.`,
        confidence: null,
        citations: [],
        corpus: ragCorpus,
        model_used: "unavailable",
        insufficient_data: true,
        latency_ms: null
      });
    } finally {
      setIsRagLoading(false);
    }
  };

  const syncOfficialFactors = async () => {
    setIsSyncingFactors(true);
    try {
      const factors = await esgFetch('/api/esg/emission-factors');
      const newEf = { ...ef };
      factors.forEach(item => {
        const name = item.fuel_or_activity.toLowerCase();
        if (name.includes("diesel")) newEf.diesel = item.factor_value;
        if (name.includes("petrol")) newEf.petrol = item.factor_value;
        if (name.includes("lpg")) newEf.lpg = item.factor_value;
        if (name.includes("commute")) newEf.employees = item.factor_value;
        if (name.includes("air")) newEf.airTravel = item.factor_value;
        if (name.includes("truck")) newEf.truckTransport = item.factor_value;
        if (name.includes("raw")) newEf.rawMaterials = item.factor_value;
      });
      setEf(newEf);
      showToast(`Loaded ${factors.length} factor(s) from the ESG factor table. Citations are not yet independently validated.`, "success");
    } catch (e) {
      showToast(`Factors not updated: ${e.message}`, "error");
    } finally {
      setIsSyncingFactors(false);
    }
  };

  return {
    isUploading,
    uploadedFile,
    setUploadedFile,
    uploadedFileObj,
    setUploadedFileObj,
    extractionResult,
    setExtractionResult,
    showExtractionEvidence,
    setShowExtractionEvidence,
    ragQuery,
    setRagQuery,
    ragCorpus,
    setRagCorpus,
    ragResponse,
    setRagResponse,
    isRagLoading,
    selectedCitation,
    setSelectedCitation,
    isSyncingFactors,
    extractionStep,
    setExtractionStep,
    executeAIExtraction,
    handleFileDrop,
    executeRagQuery,
    syncOfficialFactors
  };
};
