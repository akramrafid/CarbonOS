import React, { useState, useMemo } from 'react';
import PurchaseConfirmModal from '../payments/PurchaseConfirmModal';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { INITIAL_CREDITS } from './marketplaceData';
import { MarketplaceHero } from './MarketplaceHero';
import { MarketplaceFilterBar } from './MarketplaceFilterBar';
import { MarketplaceGrid } from './MarketplaceGrid';
import { MarketplaceTable } from './MarketplaceTable';
import { MrvDossierModal } from './MrvDossierModal';

export const MarketplaceBrowse = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Selected state
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [inspectCredit, setInspectCredit] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedVintage, setSelectedVintage] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const [credits, setCredits] = useState(INITIAL_CREDITS);

  // Copy ID helper
  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    showToast(`Copied serial ID: ${id}`, 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter & Search Logic
  const filteredCredits = useMemo(() => {
    return credits
      .filter((credit) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          credit.type.toLowerCase().includes(q) ||
          credit.farmer.toLowerCase().includes(q) ||
          credit.region.toLowerCase().includes(q) ||
          credit.id.toLowerCase().includes(q) ||
          credit.verification.toLowerCase().includes(q);

        const matchesSector = selectedSector === 'ALL' || credit.sector === selectedSector;

        const matchesStandard =
          selectedStandard === 'ALL' ||
          (selectedStandard === 'VERRA'
            ? credit.verification.includes('Verra')
            : selectedStandard === 'GOLD'
              ? credit.verification.includes('Gold Standard')
              : selectedStandard === 'DOE'
                ? credit.verification.includes('DoE')
                : true);

        const matchesRegion = selectedRegion === 'ALL' || credit.division === selectedRegion;
        const matchesVintage = selectedVintage === 'ALL' || credit.vintage === selectedVintage;

        return matchesSearch && matchesSector && matchesStandard && matchesRegion && matchesVintage;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        if (sortBy === 'TONNAGE_DESC') return b.tonnage - a.tonnage;
        if (sortBy === 'NEWEST') return b.id.localeCompare(a.id);
        return 0;
      });
  }, [credits, searchQuery, selectedSector, selectedStandard, selectedRegion, selectedVintage, sortBy]);

  // Bulk selection handling
  const handleToggleSelectBatch = (id) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatchIds.length === filteredCredits.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(filteredCredits.map((c) => c.id));
    }
  };

  // Calculate bulk summary
  const bulkSelectedCredits = useMemo(() => {
    return credits.filter((c) => selectedBatchIds.includes(c.id));
  }, [credits, selectedBatchIds]);

  const bulkTotalTonnage = bulkSelectedCredits.reduce((acc, c) => acc + c.tonnage, 0).toFixed(1);
  const bulkTotalPrice = bulkSelectedCredits.reduce((acc, c) => acc + c.price, 0);

  // Purchase completion
  const handlePurchaseSuccess = (creditId) => {
    setCredits((prev) =>
      prev.map((c) => (c.id === creditId ? { ...c, status: 'RETIRED' } : c))
    );
    setToastMessage(`Demo only: credit ${creditId} was not retired or registered anywhere.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProceedBulkCheckout = () => {
    const first = credits.find((c) => c.id === selectedBatchIds[0]);
    if (first) {
      setSelectedCredit({
        ...first,
        tonnage: parseFloat(bulkTotalTonnage),
        price: bulkTotalPrice,
        type: `Bulk Basket: ${selectedBatchIds.length} Projects (${first.type} + others)`
      });
    }
  };

  return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 text-fg-primary transition-colors duration-300">
          {/* 1. Hero & Real-time Spot Ticker */}
          <MarketplaceHero isLight={isLight} />

          {/* 2. Search, Filter Bar & View Toggle */}
          <MarketplaceFilterBar
            isLight={isLight}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedStandard={selectedStandard}
            setSelectedStandard={setSelectedStandard}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Results Counter & Active Filter summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-muted px-1 font-mono">
              <div>
                Showing <strong className="text-emerald">{filteredCredits.length}</strong> available carbon lots{' '}
                {searchQuery && <span> matching "{searchQuery}"</span>}
              </div>
              <div className="flex items-center space-x-3">
                <span>Minimum purchase: 0.1 tCO₂e</span>
                <span>•</span>
                <span className="text-emerald">Instant Retirement Available</span>
              </div>
            </div>

            {/* 3. View Mode: Grid Cards */}
            {viewMode === 'grid' && (
              <MarketplaceGrid
                isLight={isLight}
                credits={filteredCredits}
                copiedId={copiedId}
                onCopyId={handleCopyId}
                onInspectCredit={setInspectCredit}
                onSelectCredit={setSelectedCredit}
              />
            )}

            {/* 4. View Mode: Order Book (Table View) */}
            {viewMode === 'table' && (
              <MarketplaceTable
                isLight={isLight}
                credits={filteredCredits}
                selectedBatchIds={selectedBatchIds}
                onToggleSelectBatch={handleToggleSelectBatch}
                onSelectAll={handleSelectAll}
                onInspectCredit={setInspectCredit}
                onSelectCredit={setSelectedCredit}
                bulkTotalTonnage={bulkTotalTonnage}
                bulkTotalPrice={bulkTotalPrice}
                onClearBulkSelection={() => setSelectedBatchIds([])}
                onProceedBulkCheckout={handleProceedBulkCheckout}
              />
            )}

          {/* 5. MRV Dossier Modal */}
          <MrvDossierModal
            inspectCredit={inspectCredit}
            onClose={() => setInspectCredit(null)}
            onPurchaseThisCredit={setSelectedCredit}
            isLight={isLight}
          />

          {/* 6. Purchase & Settlement Modal */}
          {selectedCredit && (
            <PurchaseConfirmModal
              credit={selectedCredit}
              creditId={selectedCredit.id}
              onClose={() => setSelectedCredit(null)}
              onPurchaseComplete={handlePurchaseSuccess}
            />
          )}
        </div>
        );
};

        export default MarketplaceBrowse;
