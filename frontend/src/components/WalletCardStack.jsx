import React from 'react';
import { Plus } from 'lucide-react';

export default function WalletCardStack({ onAddCard }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      {/* Left Copy & CTA */}
      <div className="max-w-xs z-10">
        <h3 className="text-lg font-bold text-charcoal tracking-tight">
          Available Credit Card in Wallet
        </h3>
        <p className="text-xs text-slate-muted mt-2 leading-relaxed">
          Manage saved payment methods, billing auto-pay, and recurring subscription settlements securely.
        </p>

        <button
          onClick={onAddCard}
          className="mt-5 inline-flex items-center gap-1.5 bg-sage-deep text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-sage-primary shadow-sm transition-all"
        >
          <span>Add New Card</span>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: 3D Stacked Overlapping Cards (matching reference image) */}
      <div className="relative w-56 h-36 shrink-0 mt-4 md:mt-0">
        {/* Card 1: Frosted Top Card */}
        <div className="absolute top-0 right-4 w-44 h-24 rounded-2xl bg-gradient-to-br from-[#D9E2DC]/80 to-[#C6D2C9]/60 backdrop-blur-md p-3 text-slate-muted shadow-lg border border-white/40 transform -rotate-6">
          <p className="text-[8px] uppercase tracking-wider font-semibold">Master Card</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-charcoal">•••• 4234</span>
            <span className="text-[8px]">08/28</span>
          </div>
        </div>

        {/* Card 2: Mid Sage Card */}
        <div className="absolute top-4 right-8 w-44 h-24 rounded-2xl bg-gradient-to-br from-[#4E6C58] to-[#395343] p-3 text-white shadow-xl transform -rotate-2">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold tracking-wider">OLIVIA WHITE</span>
            <div className="w-4 h-4 rounded-full bg-white/20"></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest">•••• 1234</span>
            <span className="text-[8px] text-white/80">06/27</span>
          </div>
        </div>

        {/* Card 3: Bottom Dark Card */}
        <div className="absolute top-9 right-12 w-44 h-24 rounded-2xl bg-gradient-to-br from-[#232925] to-[#141715] p-3 text-white shadow-2xl transform rotate-3">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-semibold tracking-wider text-slate-subtle">BRIGHTLOOP CORP</span>
            <div className="flex -space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]/80 inline-block"></span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest">1234 1234 1234</span>
            <span className="text-[8px] text-slate-subtle">09/29</span>
          </div>
        </div>
      </div>
    </div>
  );
}
