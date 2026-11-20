export const PIPELINE_STEPS = [
  {
    title: "Upload",
    sub: "Utility Bill & Fuel Memo Intake",
    desc: "Upload DESCO, DPDC, BPDB, REB, or Titas Gas utility bills and diesel generator fuel memos as PDF, JPG, or CSV files.",
    statusText: "Active: Document Upload",
  },
  {
    title: "Processing",
    sub: "OCR Field Extraction & Factor Matching",
    desc: "Deterministic and OCR parsers extract meter readings (kWh, m³, liters), flag low-confidence fields for human review, and apply cited IPCC 2006 and national grid emission factors.",
    statusText: "Active: Field Extraction",
  },
  {
    title: "Audit",
    sub: "Dual-Control Verification Ledger",
    desc: "Every emission line links back to the source invoice and SHA-256 document hash, enforcing separate preparer and approver sign-off before ledger posting.",
    statusText: "Active: Verification Audit",
  },
  {
    title: "Export",
    sub: "Structured Compliance Export",
    desc: "Export audit-traceable inventories formatted for GHG Protocol Scope 1 and 2 corporate reporting and ISO 14064-1 verification packs.",
    statusText: "Active: Generating Reports",
  }
];
