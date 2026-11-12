import React from 'react';
import { Package, Sliders, Trash2, Plus } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { IconButton } from '../../../../components/ui/IconButton';
import { Badge } from '../../../../components/ui/Badge';

export const InvoiceCategoriesGrid = ({
  isLight,
  activeMatrix = { categories: [] },
  unitMode = 'tonnes',
  setEditingCategory,
  setIsAddCustomModalOpen,
  customItems = [],
  handleDeleteCustomItem
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
            All 9 Activity & Invoiced Expense Categories
          </h4>
          <p className={`text-[11px] ${isLight ? 'text-[#41634E]' : 'text-mist'}`}>
            Categorized under GHG Protocol Corporate Standard & Bangladesh DoE Emission Factors
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddCustomModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5 text-emerald" />}
        >
          Add Custom Line Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeMatrix.categories.map((cat) => {
          const IconComp = cat.icon || Package;
          return (
            <Card
              key={cat.id}
              className="p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <div className="leading-tight">
                      <div className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                        {cat.name}
                      </div>
                      <Badge variant="neutral" size="sm" className="mt-0.5">
                        {cat.scope}
                      </Badge>
                    </div>
                  </div>

                  <IconButton
                    icon={<Sliders className="w-3.5 h-3.5" />}
                    aria-label={`Refine category ${cat.name}`}
                    onClick={() => setEditingCategory(cat)}
                    className="min-h-[32px] min-w-[32px] p-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-inherit">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-mist">
                      Spend (BDT)
                    </span>
                    <div className={`text-xs font-bold font-mono tabular-nums ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      ৳ {cat.spendBdt?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-mist">
                      Emissions
                    </span>
                    <div className="text-xs font-bold font-mono text-emerald tabular-nums">
                      {unitMode === 'tonnes' ? `${cat.carbonTonnes} t` : `${cat.carbonKg?.toLocaleString() || 0} kg`}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-mist">Share</span>
                    <span className="font-bold text-emerald">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200/30 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-inherit flex justify-between items-center text-[10px] font-mono text-mist">
                <span>Activity Qty</span>
                <span className="font-bold">{cat.quantity?.toLocaleString() || 0} {cat.unit}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Custom Invoiced Additions Table */}
      {customItems.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-emerald" />
              <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                isLight ? 'text-[#0F2417]' : 'text-white'
              }`}>
                Custom Invoiced Additions ({customItems.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-mist">
              Live calculated into total footprint
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b text-[10px] uppercase font-mono text-mist border-inherit">
                  <th className="py-2">Description</th>
                  <th>Category</th>
                  <th>Scope</th>
                  <th>Spend (BDT)</th>
                  <th>Quantity</th>
                  <th>Emissions</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {customItems.map((item) => (
                  <tr key={item.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                    <td className={`py-2 font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                      {item.name}
                    </td>
                    <td className="capitalize text-mist">
                      {item.categoryId?.replace('_', ' ')}
                    </td>
                    <td>
                      <Badge variant="emerald" size="sm">{item.scope}</Badge>
                    </td>
                    <td className="font-mono tabular-nums">
                      ৳ {item.spendBdt?.toLocaleString() || 0}
                    </td>
                    <td className="font-mono text-mist">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="font-mono font-bold text-emerald">
                      +{unitMode === 'tonnes' ? (item.carbonKg / 1000).toFixed(3) : item.carbonKg?.toLocaleString()} {unitMode === 'tonnes' ? 't' : 'kg'}
                    </td>
                    <td className="text-right">
                      <IconButton
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        aria-label={`Delete custom line item ${item.name}`}
                        onClick={() => handleDeleteCustomItem(item.id)}
                        className="text-red-500 hover:text-red-400 min-h-[32px] min-w-[32px] p-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InvoiceCategoriesGrid;
