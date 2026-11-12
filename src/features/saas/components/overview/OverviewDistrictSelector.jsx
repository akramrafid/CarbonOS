import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { BANGLADESH_DISTRICTS } from '../../constants';

export const OverviewDistrictSelector = ({
  isLight,
  selectedDistrict,
  setSelectedDistrict,
  showToast
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <h2 className={`font-sans font-black text-2xl lg:text-3xl tracking-tight ${
            isLight ? 'text-[#0F2417]' : 'text-white'
          }`}>
            ESG Progress
          </h2>
          <Badge variant="emerald" dot>Live Active</Badge>
        </div>
        <p className={`text-xs font-sans ${isLight ? 'text-[#557361]' : 'text-mist'}`}>
          Plan, prioritize, and verify your corporate emissions with ease.
        </p>
      </div>

      {/* Bangladesh Geolocation Selector Pill */}
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border self-start md:self-auto shadow-sm ${
        isLight ? 'bg-white border-carbon-border' : 'bg-[#08130C] border-[#152B1D]'
      }`}>
        <MapPin className="w-3.5 h-3.5 text-emerald" />
        <span className={`text-[11px] font-sans ${isLight ? 'text-[#557361]' : 'text-mist'}`}>District:</span>
        <select 
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            showToast?.(`District branch updated to ${e.target.value}.`, "info");
          }}
          className={`text-xs font-sans font-bold border-none bg-transparent focus:ring-0 cursor-pointer ${
            isLight ? 'text-[#0F2417]' : 'text-white'
          }`}
        >
          {BANGLADESH_DISTRICTS.map(dist => (
            <option key={dist} value={dist} className={isLight ? 'bg-white text-[#0F2417]' : 'bg-[#08130C] text-white'}>
              {dist}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OverviewDistrictSelector;
