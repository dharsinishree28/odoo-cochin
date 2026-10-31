import React from 'react';

export default function TransfersListCard({ transfers, onViewAll }) {
  const items = transfers || [
    { name: "From Anna Jones", time: "Today, 14:34", change: "+2.45%", positive: true },
    { name: "To Carlos Brown III", time: "Today, 15:23", change: "-4.75%", positive: false },
    { name: "From Joel Cannan", time: "Today, 17:54", change: "+2.45%", positive: true },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-charcoal">Your Transfers</h3>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-xs font-semibold text-sage-deep hover:underline"
          >
            View all
          </button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-[#F0F3F1]">
        {items.map((t, idx) => (
          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-charcoal">{t.name}</p>
              <p className="text-[11px] text-slate-muted mt-0.5">{t.time}</p>
            </div>
            
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                t.positive 
                  ? 'bg-sage-light text-sage-deep' 
                  : 'bg-alert-rose text-alert-roseText'
              }`}
            >
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
