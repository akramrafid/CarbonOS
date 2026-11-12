import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Tabs } from '../../../../components/ui/Tabs';

import InvoiceUploadStep from './InvoiceUploadStep';
import InvoiceHeadlineAndDonut from './InvoiceHeadlineAndDonut';
import InvoiceCategoriesGrid from './InvoiceCategoriesGrid';
import InvoiceEvidenceTable from './InvoiceEvidenceTable';
import AddCustomItemModal from './AddCustomItemModal';
import RefineCategoryModal from './RefineCategoryModal';

export const InvoiceFootprintSection = ({
  isLight,
  extractionStep = 1,
  setExtractionStep,
  extractionResult,
  executeAIExtraction,
  isUploading,
  handleFileDrop,
  uploadedFile,
  uploadedFileObj,
  activeMatrix,
  unitMode,
  setUnitMode,
  donutHoveredId,
  setDonutHoveredId,
  isAddCustomModalOpen,
  setIsAddCustomModalOpen,
  newCustomItem,
  setNewCustomItem,
  handleAddCustomItem,
  customItems,
  handleDeleteCustomItem,
  editingCategory,
  setEditingCategory,
  handleSaveCategoryAdjustment
}) => {
  return (
    <Card className="p-6 lg:p-8 space-y-6">
      {/* Header & Badges */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${
        isLight ? 'border-carbon-border' : 'border-[#122418]'
      }`}>
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald" />
            <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              ESG SaaS Footprint Intake
            </h3>
          </div>
          <p className={`text-xs mt-0.5 font-sans ${isLight ? 'text-[#41634E]' : 'text-mist'}`}>
            Upload corporate bills, utility statements, or fuel spreadsheets. Carbon Zero BD RAG scans documents, matches national DoE emission factors, and calculates multi-category carbon metrics.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <Badge variant="emerald" size="sm">
            <Sparkles className="w-3 h-3 mr-1 inline text-emerald" />
            Multi-Corpus RAG Active
          </Badge>
          <Badge variant="neutral" size="sm">DoE 2023 Factors</Badge>
        </div>
      </div>

      {/* 3-Step Interactive Process Navigation Bar */}
      <div className={`p-1.5 rounded-2xl border ${
        isLight ? 'bg-[#F4F6F4] border-carbon-border' : 'bg-[#040906] border-[#152B1D]'
      }`}>
        <Tabs
          tabs={[
            { id: 1, label: "1. Ingest & Upload" },
            { id: 2, label: "2. Refine & Categorize" },
            { id: 3, label: "3. Evidence" }
          ]}
          activeTab={extractionStep}
          onChange={setExtractionStep}
          className="w-full justify-between"
        />
      </div>

      {/* STEP 1: Upload & Document Intake */}
      {extractionStep === 1 && (
        <InvoiceUploadStep
          isLight={isLight}
          executeAIExtraction={executeAIExtraction}
          isUploading={isUploading}
          handleFileDrop={handleFileDrop}
          uploadedFile={uploadedFile}
          uploadedFileObj={uploadedFileObj}
          setExtractionStep={setExtractionStep}
          extractionResult={extractionResult}
        />
      )}

      {/* Headline & Donut (Accessible in Steps 1 & 2) */}
      <InvoiceHeadlineAndDonut
        isLight={isLight}
        activeMatrix={activeMatrix}
        unitMode={unitMode}
        setUnitMode={setUnitMode}
        setIsAddCustomModalOpen={setIsAddCustomModalOpen}
        donutHoveredId={donutHoveredId}
        setDonutHoveredId={setDonutHoveredId}
      />

      {/* STEP 2: Refine & Analyze Categories */}
      {extractionStep === 2 && (
        <InvoiceCategoriesGrid
          isLight={isLight}
          activeMatrix={activeMatrix}
          unitMode={unitMode}
          setEditingCategory={setEditingCategory}
          setIsAddCustomModalOpen={setIsAddCustomModalOpen}
          customItems={customItems}
          handleDeleteCustomItem={handleDeleteCustomItem}
        />
      )}

      {/* STEP 3: Evidence Snippets & Audit Trail */}
      {extractionStep === 3 && (
        <InvoiceEvidenceTable
          isLight={isLight}
          extractionResult={extractionResult}
          executeAIExtraction={executeAIExtraction}
        />
      )}

      {/* Modals */}
      <AddCustomItemModal
        isOpen={isAddCustomModalOpen}
        onClose={() => setIsAddCustomModalOpen(false)}
        newCustomItem={newCustomItem}
        setNewCustomItem={setNewCustomItem}
        handleAddCustomItem={handleAddCustomItem}
        isLight={isLight}
      />

      <RefineCategoryModal
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={handleSaveCategoryAdjustment}
      />
    </Card>
  );
};

export default InvoiceFootprintSection;
