import React from 'react';
import { Search, X, Grid, List } from 'lucide-react';
import { SECTORS } from './marketplaceData';

export function MarketplaceFilterBar({
  isLight = false,
  selectedSector,
  setSelectedSector,
  searchQuery,
  setSearchQuery,
  selectedStandard,
  setSelectedStandard,
  selectedRegion,
  setSelectedRegion,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) {
  return (
    <div className="space-y-4">
      {/* Sector Pill Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {SECTORS.map((sec) => {
          const isSelected = selectedSector === sec.key;
          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setSelectedSector(sec.key)}
              className={`px-4 py-2.5 rounded-xl font-sans text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 border cursor-pointer ${isSelected
                  ? 'bg-emerald text-carbon border-emerald shadow-[0_0_15px_rgba(0,200,83,0.3)] font-bold'
                  : isLight
                    ? 'bg-white border-border-strong text-fg-secondary hover:border-emerald/40 hover:bg-slate-50'
                    : 'bg-bg-canvas border-white/10 text-slate-300 hover:border-emerald/30 hover:bg-white/5'
                }`}
            >
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search, Filter Bar & View Toggle */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-bg-surface border-border-strong"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project title, farmer name, region, or serial ID (e.g. BD-2026-CR-000142)..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:border-accent bg-bg-canvas border-border-subtle text-fg-primary placeholder:text-fg-muted"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Standard Dropdown */}
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-accent cursor-pointer bg-bg-canvas border-border-subtle text-fg-primary"
          >
            <option value="ALL">All Standards</option>
            <option value="VERRA">Verra VCS</option>
            <option value="GOLD">Gold Standard</option>
          </select>

          {/* Division Dropdown */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-accent cursor-pointer bg-bg-canvas border-border-subtle text-fg-primary"
          >
            <option value="ALL">All Divisions</option>
            <option value="Khulna">Khulna Division</option>
            <option value="Rangpur">Rangpur Division</option>
            <option value="Chittagong">Chittagong Division</option>
            <option value="Dhaka">Dhaka Division</option>
            <option value="Sylhet">Sylhet Division</option>
            <option value="Rajshahi">Rajshahi Division</option>
            <option value="Barisal">Barisal Division</option>
            <option value="Mymensingh">Mymensingh Division</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-emerald cursor-pointer ${isLight ? 'bg-bg-canvas border-slate-200 text-fg-primary' : 'bg-bg-canvas border-white/10 text-slate-200'
              }`}
          >
            <option value="FEATURED">Featured Offsets</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
            <option value="TONNAGE_DESC">Volume: High to Low</option>
            <option value="NEWEST">Newest Minted</option>
          </select>

          {/* View Mode Toggle */}
          <div
            className={`flex items-center p-1 rounded-xl border ${isLight ? 'bg-bg-canvas border-slate-200' : 'bg-bg-canvas border-white/10'
              }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-emerald text-carbon shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              title="Grid Cards View"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-emerald text-carbon shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              title="Order Book Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketplaceFilterBar;
