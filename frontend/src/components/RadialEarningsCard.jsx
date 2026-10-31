import React from 'react';

export default function RadialEarningsCard({ stats }) {
  const percentage = stats?.earnings_profit_progress || 80;
  // Arc parameters for semi-circle: 180 degrees
  const radius = 64;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold text-charcoal">Earnings</h2>
        <p className="text-xs text-slate-muted mt-1">Total Expense</p>
        <h3 className="text-2xl font-extrabold text-charcoal mt-0.5 tracking-tight">
          ${stats?.earnings_total_expense?.toLocaleString() || '6,078.76'}
        </h3>
        <p className="text-xs text-slate-muted mt-1">
          Profit is <span className="font-semibold text-charcoal">34% More</span> than last Month
        </p>
      </div>

      {/* Semi-circular radial gauge matching screenshot */}
      <div className="relative flex flex-col items-center justify-center pt-4 pb-2">
        <svg className="w-44 h-24 overflow-visible" viewBox="0 0 160 90">
          {/* Background Track Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#E5EBE6"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Active Sage Green Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#5C7C66"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute bottom-2 text-center">
          <span className="text-xl font-extrabold text-charcoal tracking-tight">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
