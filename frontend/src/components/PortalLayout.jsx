import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Search, 
  Bell, 
  ShieldCheck, 
  User, 
  Layers, 
  CreditCard, 
  FileText, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function PortalLayout({ 
  title, 
  subtitle, 
  sidebarItems, 
  activeNav, 
  setActiveNav, 
  children 
}) {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row antialiased font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-canvas-card border-r border-line flex flex-col justify-between shrink-0 p-5 md:h-screen md:sticky md:top-0">
        <div>
          {/* Brand Logo & Back to Site */}
          <div className="flex items-center justify-between pb-5 border-b border-line mb-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-sage-dark text-white flex items-center justify-center shadow-soft group-hover:rotate-45 transition-transform duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 2zm0 15a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 17zm9.25-6.25a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zM6.25 10.75a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zm11.72-6.52a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1 1.77 0zM7.8 14.43a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1 1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zm10.17 3.54a1.25 1.25 0 0 1-1.77 0l-1.77-1.77a1.25 1.25 0 0 1 1.77-1.77l1.77 1.77a1.25 1.25 0 0 1 0 1.77zM7.8 7.8a1.25 1.25 0 0 1-1.77 0L4.26 6.03a1.25 1.25 0 0 1 1.77-1.77L7.8 6.03a1.25 1.25 0 0 1 0 1.77z"/>
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-sm text-ink block leading-none">Brightloop</span>
                <span className="text-[9px] font-bold text-sage-dark uppercase tracking-widest">
                  {user?.role?.toUpperCase()} PORTAL
                </span>
              </div>
            </Link>

            <Link 
              to="/" 
              title="View Public Website" 
              className="text-ink-subtle hover:text-ink p-1 rounded-md hover:bg-canvas transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'logout') {
                      handleLogout();
                    } else {
                      setActiveNav(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sage-dark text-white shadow-soft font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-sage-light text-sage-dark'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at Bottom */}
        <div className="pt-4 border-t border-line mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-sage-light text-sage-dark flex items-center justify-center font-bold text-xs shrink-0 border border-line">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-ink truncate">{user?.full_name}</p>
                <p className="text-[10px] text-ink-subtle truncate capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-subtle hover:text-status-alertText hover:bg-status-alertBg transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Portal Switcher Pills */}
          <div className="p-2 bg-canvas rounded-xl border border-line">
            <p className="text-[9px] font-bold text-ink-subtle uppercase tracking-wider mb-1 text-center">
              Switch Portal View
            </p>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={async () => {
                  const u = await quickSwitch('admin');
                  navigate('/admin');
                }}
                className={`py-1 text-[10px] font-bold rounded text-center transition-colors ${
                  user?.role === 'admin' ? 'bg-sage-dark text-white shadow-soft' : 'bg-white hover:bg-sage-light text-ink'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={async () => {
                  const u = await quickSwitch('staff');
                  navigate('/staff');
                }}
                className={`py-1 text-[10px] font-bold rounded text-center transition-colors ${
                  user?.role === 'staff' ? 'bg-sage-dark text-white shadow-soft' : 'bg-white hover:bg-sage-light text-ink'
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={async () => {
                  const u = await quickSwitch('customer');
                  navigate('/customer');
                }}
                className={`py-1 text-[10px] font-bold rounded text-center transition-colors ${
                  user?.role === 'customer' ? 'bg-sage-dark text-white shadow-soft' : 'bg-white hover:bg-sage-light text-ink'
                }`}
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-canvas-card border-b border-line px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Hello, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              {subtitle || `Welcome to your Brightloop ${user?.role} portal`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search records, orders..."
                className="bg-canvas border border-line rounded-full pl-8 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-2.5 top-2.5" />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => alert("All recurring schedules and active quotas are in sync.")}
              className="w-8 h-8 rounded-full bg-canvas border border-line flex items-center justify-center text-ink hover:text-sage-dark transition-colors"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
