import React from 'react';
import BiomassStatCards from './biomass/BiomassStatCards';
import BiomassVerraStrip from './biomass/BiomassVerraStrip';
import BiomassHorizonChart from './biomass/BiomassHorizonChart';

export function BiomassOverviewPanel(props) {
  const {
    isLight,
    loadingDashboard,
    dashboardData,
    selectedMetric,
    setSelectedMetric,
    selectedHorizon,
    setSelectedHorizon,
    hoveredQuarter,
    setHoveredQuarter,
    setActiveTab
  } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <BiomassStatCards
        isLight={isLight}
        loadingDashboard={loadingDashboard}
        dashboardData={dashboardData}
      />

      <BiomassVerraStrip
        isLight={isLight}
        dashboardData={dashboardData}
        setActiveTab={setActiveTab}
      />

      <BiomassHorizonChart
        isLight={isLight}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        selectedHorizon={selectedHorizon}
        setSelectedHorizon={setSelectedHorizon}
        hoveredQuarter={hoveredQuarter}
        setHoveredQuarter={setHoveredQuarter}
      />
    </div>
  );
}

export default BiomassOverviewPanel;
