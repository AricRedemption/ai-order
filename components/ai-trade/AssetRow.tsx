import React from 'react';
import { Asset } from './types';

interface AssetRowProps {
  asset: Asset;
  isLast: boolean;
}

export const AssetRow: React.FC<AssetRowProps> = ({ asset, isLast }) => {
  return (
    <div className={`flex items-center justify-between py-5 ${!isLast ? 'border-b border-dashed border-gray-100' : ''}`}>
      <div className="flex items-center">
        {/* Rank - Lowest Hierarchy: Reduced to 11px */}
        <span className="w-7 text-[11px] font-bold text-gray-300 mr-2 tabular-nums">
          #{asset.rank}
        </span>

        {/* Icon - Visual Anchor */}
        <div className="w-[46px] h-[46px] rounded-[18px] bg-slate-50 border border-slate-100 flex items-center justify-center mr-4 shadow-sm">
          <span className="text-base font-black text-slate-400">{asset.letter}</span>
        </div>

        {/* Name and Category */}
        <div className="flex flex-col justify-center">
          {/* Name - Primary Hierarchy: Reduced to 15px */}
          <span className="font-black text-[#162361] text-[15px] leading-none tracking-tight mb-1.5">
            {asset.name}
          </span>
          {/* Category - Secondary Hierarchy: Reduced to 9px */}
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">
            {asset.category}
          </span>
        </div>
      </div>

      {/* Price and Change */}
      <div className="flex flex-col items-end justify-center">
        {/* Price - Primary Hierarchy: Reduced to 15px */}
        <span className="font-black text-[#162361] text-[15px] leading-none tracking-tight mb-1.5 tabular-nums">
          {asset.price}
        </span>
        
        {/* Change - Secondary Hierarchy: Reduced to 11px */}
        <div className={`flex items-center text-[11px] font-bold ${asset.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          <span className="mr-1">
            {asset.isPositive ? (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 0L8 6H0L4 0Z" />
              </svg>
            ) : (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L0 0H8L4 6Z" />
              </svg>
            )}
          </span>
          <span className="tabular-nums">{asset.change}</span>
        </div>
      </div>
    </div>
  );
};
