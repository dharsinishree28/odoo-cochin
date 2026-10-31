import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function BalanceWaveCard({ stats }) {
  const [period, setPeriod] = useState('Monthly');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-charcoal">Balance</h2>
          <span className="flex items-center gap-1 bg-sage-light text-sage-deep text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3 stroke-[3]" />
            On track
          </span>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none bg-transparent text-xs font-medium text-slate-muted hover:text-charcoal pr-5 pl-2 py-1 rounded-full cursor-pointer focus:outline-none"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-muted absolute right-1 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Metric Mini Stat Boxes */}
      <div className="flex items-center gap-4 mb-6">
        {/* Saves Box */}
        <div className="bg-[#FAF9F5] rounded-2xl p-3 px-4 shadow-sm border border-[#ECECE6]">
          <p className="text-[11px] text-slate-muted font-medium">Saves</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-charcoal">
              {stats?.saves_rate || '43.50'}%
            </span>
            <span className="text-[11px] font-bold text-sage-deep bg-sage-light px-1.5 py-0.5 rounded-full">
              +{stats?.saves_change || '2.45'}%
            </span>
          </div>
        </div>

        {/* Balance Box */}
        <div className="bg-[#FAF9F5] rounded-2xl p-3 px-4 shadow-sm border border-[#ECECE6]">
          <p className="text-[11px] text-slate-muted font-medium">Balance</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-charcoal">
              ${stats?.balance?.toLocaleString() || '52,422'}
            </span>
            <span className="text-[11px] font-bold text-alert-roseText bg-alert-rose px-1.5 py-0.5 rounded-full">
              {stats?.balance_change || '-4.75'}%
            </span>
          </div>
        </div>
      </div>

      {/* Organic Sage Wave SVG Chart (matching reference) */}
      <div className="w-full h-28 relative mt-auto pt-2">
        <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#486351" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#486351" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Shaded Area */}
          <path
            d="M 0 85 
               C 30 85, 45 40, 75 40 
               C 105 40, 115 110, 145 110 
               C 175 110, 190 75, 220 75 
               C 250 75, 275 80, 310 80 
               C 340 80, 370 70, 410 70 
               C 450 70, 470 65, 500 65 
               L 500 120 L 0 120 Z"
            fill="url(#waveGradient)"
          />

          {/* Stroke Line */}
          <path
            d="M 0 85 
               C 30 85, 45 40, 75 40 
               C 105 40, 115 110, 145 110 
               C 175 110, 190 75, 220 75 
               C 250 75, 275 80, 310 80 
               C 340 80, 370 70, 410 70 
               C 450 70, 470 65, 500 65"
            fill="none"
            stroke="#5C7C66"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
