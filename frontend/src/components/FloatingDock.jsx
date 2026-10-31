import React from 'react';
import { 
  LayoutGrid, 
  CreditCard, 
  BarChart3, 
  Building2, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function FloatingDock({ activeTab, setActiveTab, currentPortal, currentUser, onLogout, onOpenSettings }) {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'quotations', icon: CreditCard, label: 'Quotations & Offers' },
    { id: 'subscriptions', icon: BarChart3, label: 'Subscriptions' },
    { id: 'catalog', icon: Building2, label: 'Products & Plans' },
    { id: 'users', icon: Users, label: 'Team & Clients' },
    { id: 'billing', icon: Calendar, label: 'Invoices & Billing' },
  ];

  return (
    <aside className="w-[72px] shrink-0 flex flex-col items-center justify-between bg-white rounded-full py-6 px-3 shadow-soft border border-[#E2E6E3] h-[calc(100vh-48px)] sticky top-6">
      {/* Brand Glyph */}
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-sage-deep hover:rotate-45 transition-transform duration-300"
          title="Brightloop Software"
        >
          {/* Sunburst Asterisk icon from reference */}
          <svg className="w-8 h-8 text-sage-deep" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 2zm0 15a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 17zm9.25-6.25a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zM6.25 10.75a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zm11.72-6.52a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zM7.8 14.43a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zm10.17 3.54a1.25 1.25 0 0 1-1.77 0l-1.77-1.77a1.25 1.25 0 0 1 1.77-1.77l1.77 1.77a1.25 1.25 0 0 1 0 1.77zM7.8 7.8a1.25 1.25 0 0 1-1.77 0L4.26 6.03a1.25 1.25 0 0 1 1.77-1.77L7.8 6.03a1.25 1.25 0 0 1 0 1.77z"/>
          </svg>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group ${
                  isActive 
                    ? 'bg-charcoal text-white shadow-md' 
                    : 'text-slate-muted hover:text-charcoal hover:bg-[#F2F5F3]'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[1.8]" />
                
                {/* Tooltip on hover */}
                <span className="absolute left-16 bg-charcoal text-white text-xs font-medium py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t border-[#EDF1EE] w-full">
        <button
          onClick={onOpenSettings}
          title="Security & System Settings"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-muted hover:text-charcoal hover:bg-[#F2F5F3] transition-colors"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
        <button
          onClick={onLogout}
          title="Sign Out"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-muted hover:text-alert-roseText hover:bg-alert-rose transition-colors"
        >
          <LogOut className="w-5 h-5 stroke-[1.8]" />
        </button>
        
        {/* User avatar with status dot */}
        <div className="relative mt-1 cursor-pointer" title={`${currentUser?.full_name} (${currentPortal})`}>
          <img 
            src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
            alt={currentUser?.full_name || "User"}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-sage-light"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4E9F6E] border-2 border-white rounded-full"></span>
        </div>
      </div>
    </aside>
  );
}
