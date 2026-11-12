import { Sparkles, Leaf, Droplets, Sun, Flame, Factory } from 'lucide-react';
import { DEMO_CREDITS_PART_1 } from './marketplaceSeedData1';
import { DEMO_CREDITS_PART_2 } from './marketplaceSeedData2';

export const INITIAL_CREDITS = [...DEMO_CREDITS_PART_1, ...DEMO_CREDITS_PART_2];

export const SECTORS = [
  { key: 'ALL', label: 'All Projects', icon: Sparkles },
  { key: 'Agriculture & AWD', label: '🌾 AWD Rice Methane', icon: Leaf },
  { key: 'Nature-Based', label: '🌊 Blue Carbon & Mangrove', icon: Droplets },
  { key: 'Renewable Energy', label: '☀️ Solar & Clean Energy', icon: Sun },
  { key: 'Clean Cooking', label: '🍲 Clean Cookstoves', icon: Flame },
  { key: 'Industrial Efficiency', label: '🏭 Industry & Waste', icon: Factory }
];
