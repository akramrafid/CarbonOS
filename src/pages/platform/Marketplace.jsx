/* [COMMENTED OUT FOR PERSONAL REFERENCE — unused Marketplace placeholder page; App.jsx routes /platform/marketplace to components/marketplace/MarketplaceBrowse.jsx]
import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const Marketplace = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Carbon Marketplace"
          description="Connect directly with buyers and trade emissions reductions."
          badge={<Badge variant="emerald">PLATFORM</Badge>}
          align="center"
        />

        <Card variant="featured" className="p-8 md:p-12 mt-12">
          <div className="flex justify-between items-end border-b border-emerald/20 pb-4 mb-6">
            <h2 className="font-sans font-bold text-2xl text-registry">Spot Prices</h2>
            <div className="font-mono text-xs text-emerald bg-emerald/10 px-2 py-1 rounded">LIVE TRADING</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-bg-canvas border border-emerald/10 rounded-lg">
              <div>
                <div className="font-sans font-bold text-registry">BD Solar VCU</div>
                <div className="font-mono text-[10px] text-mist">Vintage 2024-2025</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-emerald">৳1,450 / tCO2e</div>
                <div className="font-sans text-[10px] text-mist/70">Vol: 14,500</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-bg-canvas border border-emerald/10 rounded-lg">
              <div>
                <div className="font-sans font-bold text-registry">BD Cookstove VER</div>
                <div className="font-mono text-[10px] text-mist">Vintage 2025</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-emerald">৳950 / tCO2e</div>
                <div className="font-sans text-[10px] text-mist/70">Vol: 2,100</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button variant="primary" size="lg" className="w-full">
              Enter Exchange Platform
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Marketplace;
*/
export default function MarketplaceArchived() {
  return null;
}
