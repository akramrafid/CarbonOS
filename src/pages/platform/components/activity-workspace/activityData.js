/**
 * Activity & Evidence Data Generators & Helpers
 * ISO 14064-1 & GHG Protocol verification activity models.
 */
import { getEvidenceTemplates, getActivityTemplates } from './activitySeedData';

export const fmt = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Generates verified production-grade activity records and linked evidence
 * for a given corporate client profile based on their baseline data and facilities.
 */
export const generateClientActivityData = (client) => {
  if (!client) return { activities: [], evidenceList: [] };

  const facilities = client.facilities || [
    { name: "Primary Headquarters & Operations", location: "Dhaka", type: "Corporate Office" }
  ];
  const b = client.baselineInputs || {};

  const dieselQty = parseFloat(b.diesel) || 3000;
  const petrolQty = parseFloat(b.petrol) || 1500;
  const lpgQty = parseFloat(b.lpg) || 600;
  const elecQty = parseFloat(b.electricity) || 75000;
  const empQty = parseFloat(b.employees) || 80;
  const airQty = parseFloat(b.airTravel) || 25000;
  const truckQty = parseFloat(b.truckTransport) || 30000;
  const rawQty = parseFloat(b.rawMaterials) || 200;

  const evidenceList = getEvidenceTemplates(client, elecQty, dieselQty, petrolQty, truckQty);

  const activities = getActivityTemplates(client, facilities, {
    dieselQty,
    petrolQty,
    lpgQty,
    elecQty,
    empQty,
    airQty,
    truckQty,
    rawQty
  });

  return { activities, evidenceList };
};
