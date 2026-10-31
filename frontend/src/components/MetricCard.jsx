import React from 'react';
import { Users, Coins, ArrowUpRight } from 'lucide-react';

export function MetricStrip({ stats, onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Spent this month / Active Subscriptions */}
      <div 
        onClick={() => onCardClick?.('subscriptions')}
        className="bg-white rounded-3xl p-5 shadow-soft border border-[#E2E6E3] flex items-center justify-between cursor-pointer hover:border-sage-border hover:shadow-elevated transition-all"
      >
        <div>
          <p className="text-xs font-medium text-slate-muted">Spent this month</p>
          <h3 className="text-2xl font-bold text-charcoal mt-1 tracking-tight">
            ${stats?.spent_this_month?.toFixed(1) || '682.5'}
          </h3>
        </div>
        {/* Mini vertical bar chart in sage green matching screenshot */}
        <div className="flex items-end gap-1.5 h-8">
          <span className="w-1.5 bg-[#D4DFD7] rounded-full h-3"></span>
          <span className="w-1.5 bg-sage-deep rounded-full h-7"></span>
          <span className="w-1.5 bg-sage-deep rounded-full h-5"></span>
          <span className="w-1.5 bg-[#D4DFD7] rounded-full h-4"></span>
          <span className="w-1.5 bg-sage-deep rounded-full h-8"></span>
        </div>
      </div>

      {/* 2. New clients */}
      <div 
        onClick={() => onCardClick?.('users')}
        className="bg-white rounded-3xl p-5 shadow-soft border border-[#E2E6E3] flex items-center justify-between cursor-pointer hover:border-sage-border hover:shadow-elevated transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EBF0EC] flex items-center justify-center text-sage-deep">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-muted">New clients</p>
            <h3 className="text-2xl font-bold text-charcoal mt-0.5 tracking-tight">
              {stats?.new_clients || 321}
            </h3>
          </div>
        </div>
        {/* Mini curved sparkline */}
        <div className="w-14 h-6">
          <svg viewBox="0 0 50 20" className="w-full h-full text-slate-muted fill-none stroke-current stroke-2">
            <path d="M 0 15 Q 20 18, 30 10 T 50 4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 3. Earnings */}
      <div 
        onClick={() => onCardClick?.('billing')}
        className="bg-white rounded-3xl p-5 shadow-soft border border-[#E2E6E3] flex items-center gap-3.5 cursor-pointer hover:border-sage-border hover:shadow-elevated transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-alert-gold flex items-center justify-center text-alert-goldText">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-muted">Earnings</p>
          <h3 className="text-2xl font-bold text-charcoal mt-0.5 tracking-tight">
            ${stats?.earnings?.toFixed(2) || '350.40'}
          </h3>
        </div>
      </div>

      {/* 4. Featured Solid Deep Sage "Activity" Card */}
      <div 
        onClick={() => onCardClick?.('analytics')}
        className="bg-sage-deep text-white rounded-3xl p-5 shadow-elevated flex items-center justify-between cursor-pointer hover:bg-[#344b3c] transition-all"
      >
        <div>
          <p className="text-xs font-medium text-sage-light/80">Activity</p>
          <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">
            ${stats?.activity_total?.toFixed(2) || '540.50'}
          </h3>
        </div>
        {/* White curved wave matching screenshot */}
        <div className="w-20 h-8">
          <svg viewBox="0 0 70 25" className="w-full h-full fill-none stroke-white stroke-[2.5]">
            <path d="M 2 15 Q 18 2, 32 18 T 68 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
