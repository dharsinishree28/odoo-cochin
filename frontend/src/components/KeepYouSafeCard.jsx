import React from 'react';
import { Fingerprint } from 'lucide-react';

export default function KeepYouSafeCard({ onOpenSecurity }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col items-center justify-center text-center">
      {/* Fingerprint glyph matching reference */}
      <div className="w-14 h-14 rounded-full bg-[#EBF1ED] flex items-center justify-center text-sage-deep mb-3">
        <Fingerprint className="w-8 h-8 stroke-[1.8]" />
      </div>

      <h3 className="text-base font-bold text-charcoal tracking-tight">
        Keep you safe!
      </h3>
      <p className="text-xs text-slate-muted mt-1 max-w-[200px]">
        Update your security password and role access controls
      </p>

      {/* Sage Green Pill Button from reference */}
      <button
        onClick={onOpenSecurity}
        className="mt-4 bg-[#587B64] hover:bg-sage-deep text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition-all"
      >
        Update Your Security
      </button>
    </div>
  );
}
