import { RICE_POTATO_TREATMENTS } from './treatmentDbRicePotato';
import { TOMATO_MAIZE_TREATMENTS } from './treatmentDbTomatoMaize';
import { FRUIT_ORCHARD_TREATMENTS } from './treatmentDbFruitOrchard';

export const TREATMENT_DB = {
  ...RICE_POTATO_TREATMENTS,
  ...TOMATO_MAIZE_TREATMENTS,
  ...FRUIT_ORCHARD_TREATMENTS,
};

export const URGENCY_CONFIG = {
  low:      { label: 'Low Risk',      color: 'text-lime-400', bg: 'bg-lime-400/10', border: 'border-lime-400/20', dot: 'bg-lime-400' },
  medium:   { label: 'Act Soon',      color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', dot: 'bg-yellow-400' },
  high:     { label: 'Act Quickly',   color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', dot: 'bg-orange-400' },
  critical: { label: 'Urgent Action', color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    dot: 'bg-red-400'    }
};

export default TREATMENT_DB;
