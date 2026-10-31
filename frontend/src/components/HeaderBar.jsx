import React from 'react';
import { Search, MessageSquare, Bell, Shield, Briefcase, UserCheck } from 'lucide-react';

export default function HeaderBar({ 
  currentUser, 
  currentPortal, 
  setCurrentPortal, 
  searchQuery, 
  setSearchQuery,
  onOpenNotifications 
}) {
  const portals = [
    { id: 'admin', label: 'Admin', icon: Shield, desc: 'Products, Rules & Finance' },
    { id: 'staff', label: 'Staff', icon: Briefcase, desc: 'Sales, Quotes & Billing' },
    { id: 'customer', label: 'Customer', icon: UserCheck, desc: 'Subscriptions & Invoices' }
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
      {/* Welcome Title & Subtext */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight">
          Hello, {currentUser?.full_name?.split(' ')[0] || 'Carlic'}!
        </h1>
        <p className="text-slate-muted text-sm mt-1">
          Explore information and activity about your subscriptions and quotations
        </p>
      </div>

      {/* Right Controls: Portal Switcher, Search Pill & Notification Icons */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Portal Switcher Pill */}
        <div className="bg-white p-1 rounded-full shadow-soft border border-[#E2E6E3] flex items-center">
          {portals.map((p) => {
            const Icon = p.icon;
            const isSelected = currentPortal === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentPortal(p.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-sage-deep text-white shadow-sm'
                    : 'text-slate-muted hover:text-charcoal hover:bg-[#F2F5F3]'
                }`}
                title={p.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Pill Input from Reference */}
        <div className="relative flex items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-soft border border-[#E2E6E3] w-56 md:w-64 focus-within:ring-2 focus-within:ring-sage-mid/30 transition-all">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-charcoal placeholder:text-slate-subtle focus:outline-none pr-2"
          />
          <button 
            className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center shrink-0 hover:bg-sage-deep transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Chat / Inquiries Pill */}
        <button 
          className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-soft border border-[#E2E6E3] text-charcoal hover:bg-[#F2F5F3] transition-colors"
          title="Customer Inquiries & Messages"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-alert-roseText rounded-full ring-2 ring-white"></span>
        </button>

        {/* Notification Bell Pill */}
        <button 
          onClick={onOpenNotifications}
          className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-soft border border-[#E2E6E3] text-charcoal hover:bg-[#F2F5F3] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
