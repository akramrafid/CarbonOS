import React from 'react';

export const cos30 = 0.8660254;
export const sin30 = 0.5;

export const rawCubes = [
  // Bottom layer (z = -1)
  { x: -1, y: -1, z: -1 },
  { x: 0, y: -1, z: -1 },
  { x: 1, y: -1, z: -1 },
  { x: -1, y: 0, z: -1 },
  { x: 0, y: 0, z: -1, glow: 'emerald' },
  { x: 1, y: 0, z: -1 },
  { x: -1, y: 1, z: -1 },
  { x: 0, y: 1, z: -1 },
  { x: 1, y: 1, z: -1 },

  // Middle layer (z = 0)
  { x: -1, y: -1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0, glow: 'cyan' },
  { x: -1, y: 1, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },

  // Top layer (z = 1)
  { x: -1, y: -1, z: 1 },
  { x: 0, y: -1, z: 1 },
  { x: 1, y: -1, z: 1 },
  { x: -1, y: 0, z: 1, glow: 'emerald' },
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: -1, y: 1, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
];

export const activeCubes = rawCubes.filter(c => {
  const dist = Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.z);
  return dist <= 2;
});

export const sortedCubes = [...activeCubes].sort((a, b) => (a.x + a.y - a.z) - (b.x + b.y - b.z));

export const leftNodes = [
  { id: 1, y: 130, title: "Project Onboarding Portal", to: "/platform/project-onboarding" },
  { id: 2, y: 230, title: "MRV Dashboard", to: "/platform/mrv-dashboard" },
  { id: 3, y: 330, title: "Carbon Registry System", to: "/platform/carbon-registry" },
  { id: 4, y: 430, title: "Verification Workflow Engine", to: "/platform/verification-workflow" },
  { id: 5, y: 530, title: "Carbon Marketplace", to: "/platform/marketplace" },
  { id: 6, y: 630, title: "AI Fraud Detection", to: "/platform/ai-detection" },
];

export const rightNodes = [
  { id: 7, y: 230, title: "99.9% Verified Credits" },
  { id: 8, y: 330, title: "Automated Compliance" },
  { id: 9, y: 430, title: "Global Market Access" },
  { id: 10, y: 530, title: "Traceable Lifecycle" },
];

export function renderCube(cube, index, w = 28, centerOffsetX = 700, centerOffsetY = 380) {
  const { x, y, z, glow } = cube;
  const cx = centerOffsetX + (x - y) * w * cos30;
  const cy = centerOffsetY + (x + y) * w * sin30 - z * w;

  let topFill = 'url(#cubeTop)';
  let leftFill = 'url(#cubeLeft)';
  let rightFill = 'url(#cubeRight)';

  if (glow === 'emerald') {
    topFill = 'url(#glowEmeraldTop)';
    leftFill = 'url(#glowEmeraldLeft)';
    rightFill = 'url(#glowEmeraldRight)';
  } else if (glow === 'cyan') {
    topFill = 'url(#glowCyanTop)';
    leftFill = 'url(#glowCyanLeft)';
    rightFill = 'url(#glowCyanRight)';
  }

  const topPath = `M ${cx} ${cy} L ${cx - w * cos30} ${cy - w * sin30} L ${cx} ${cy - w} L ${cx + w * cos30} ${cy - w * sin30} Z`;
  const leftPath = `M ${cx} ${cy} L ${cx - w * cos30} ${cy - w * sin30} L ${cx - w * cos30} ${cy + w * sin30} L ${cx} ${cy + w} Z`;
  const rightPath = `M ${cx} ${cy} L ${cx + w * cos30} ${cy - w * sin30} L ${cx + w * cos30} ${cy + w * sin30} L ${cx} ${cy + w} Z`;

  return (
    <g key={index} className={glow ? 'animate-pulse' : ''} style={glow ? { animationDuration: '2s', animationDelay: `${index * 0.25}s` } : {}}>
      <path d={leftPath} fill={leftFill} stroke="rgba(4, 10, 6, 0.4)" strokeWidth="0.5" />
      <path d={rightPath} fill={rightFill} stroke="rgba(4, 10, 6, 0.4)" strokeWidth="0.5" />
      <path d={topPath} fill={topFill} stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.5" />
    </g>
  );
}
