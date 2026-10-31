import React from 'react';
import { Search, MessageSquare, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HeaderBar({ 
  currentUser, 
  currentPortal, 
  searchQuery, 
  setSearchQuery,
  onOpenNotifications 
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
      {/* Welcome Title & Subtext */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight">
            Hello, {currentUser?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sage-light text-sage-dark uppercase border border-line">
            {currentPortal || currentUser?.role} Portal
          </span>
        </div>
        <p className="text-slate-muted text-sm mt-1">
          Explore information and activity about your subscriptions and quotations
        </p>
      </div>

      {/* Right Controls: Search Pill, Notifications & Logout */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Search Pill Input */}
        <div className="relative flex items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-soft border border-[#E2E6E3] w-56 md:w-64 focus-within:ring-2 focus-within:ring-sage-mid/30 transition-all">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-muted/60 text-charcoal"
          />
          <button className="w-7 h-7 rounded-full bg-charcoal text-white flex items-center justify-center shrink-0 hover:bg-black transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Bell */}
        <button 
          onClick={onOpenNotifications || (() => alert("All recurring schedules are in sync."))}
          className="relative w-10 h-10 rounded-full bg-white border border-[#E2E6E3] shadow-soft flex items-center justify-center text-charcoal hover:bg-[#F2F5F3] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[1.8]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-status-alertText bg-status-alertBg hover:bg-status-alertBg/80 transition-colors border border-status-alertText/20 shadow-soft"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
