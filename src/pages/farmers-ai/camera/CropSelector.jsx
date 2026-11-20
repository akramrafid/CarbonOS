import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sprout, Leaf, Trees } from 'lucide-react';
import { CROPS } from './cameraData';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';

const CROP_ICON_MAP = {
  Sprout,
  Leaf,
  Trees,
};

export function CropSelector({ species, onSelectSpecies }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 180;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8 bg-white/5 border border-white/10 p-4 rounded-3xl relative overflow-hidden">
      <div className="text-white/50 text-xs font-bold mb-3 uppercase tracking-wider flex items-center justify-between px-1">
        <span>Target Crop / ফসল নির্বাচন করুন</span>
        <span className="text-lime-400 font-extrabold capitalize bg-lime-400/10 border border-lime-400/20 px-3 py-0.5 rounded-full text-[11px] tracking-wide">
          {species}
        </span>
      </div>
      
      {/* Swipeable List with Fade Gradient Overlays & Scroll Buttons */}
      <div className="relative flex items-center">
        {/* Left Arrow Button */}
        <IconButton
          icon={<ChevronLeft size={16} />}
          aria-label="Scroll crops left"
          onClick={() => scroll('left')}
          className="absolute left-0 z-20 min-h-[32px] min-w-[32px] w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white"
        />

        {/* Swipeable List Wrapper */}
        <div className="relative w-full overflow-hidden mx-8">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-carbon to-transparent pointer-events-none z-10" />
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-carbon to-transparent pointer-events-none z-10" />
          
          <div 
            ref={scrollContainerRef}
            className="crop-scroll-container flex space-x-2.5 overflow-x-auto pb-1 relative w-full scroll-smooth select-none"
          >
            {CROPS.map((crop) => {
              const isSelected = species === crop.id;
              const CropIcon = CROP_ICON_MAP[crop.icon] || Sprout;
              return (
                <Button
                  key={crop.id}
                  variant={isSelected ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onSelectSpecies(crop.id)}
                  className={`shrink-0 ${isSelected ? '!border-lime-400/50 !bg-lime-400/15 !text-lime-400' : 'text-white/70'}`}
                >
                  <CropIcon size={14} className="mr-1.5 text-lime-400 shrink-0" />
                  <span>{crop.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        <IconButton
          icon={<ChevronRight size={16} />}
          aria-label="Scroll crops right"
          onClick={() => scroll('right')}
          className="absolute right-0 z-20 min-h-[32px] min-w-[32px] w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white"
        />
      </div>
    </div>
  );
}

export default CropSelector;
