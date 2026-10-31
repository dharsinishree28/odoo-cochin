import React, { useState, useEffect } from 'react';
import FloatingDock from './components/FloatingDock';
import HeaderBar from './components/HeaderBar';
import { MetricStrip } from './components/MetricCard';
import BalanceWaveCard from './components/BalanceWaveCard';
import RadialEarningsCard from './components/RadialEarningsCard';
import ProfileCard from './components/ProfileCard';
import WalletCardStack from './components/WalletCardStack';
import TransfersListCard from './components/TransfersListCard';
import KeepYouSafeCard from './components/KeepYouSafeCard';
import AdminPortal from './portals/AdminPortal';
import StaffPortal from './portals/StaffPortal';
import CustomerPortal from './portals/CustomerPortal';
import AuthModal from './components/AuthModal';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPortal, setCurrentPortal] = useState('admin'); // 'admin', 'staff', 'customer'
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    full_name: 'Carlic Bolomboy',
    email: 'carlic@gmail.com',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const data = await api.getDashboardAnalytics();
      setDashboardStats(data);
    } catch (err) {
      console.warn("Analytics API loading:", err.message);
    }
  }

  // Handle switching portals
  function handlePortalChange(portal) {
    setCurrentPortal(portal);
    if (portal === 'admin') {
      setCurrentUser({
        id: 1,
        full_name: 'Carlic Bolomboy',
        email: 'carlic@gmail.com',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
    } else if (portal === 'staff') {
      setCurrentUser({
        id: 2,
        full_name: 'Sarah Jenkins',
        email: 'sarah.sales@brightloop.com',
        role: 'staff',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      });
    } else if (portal === 'customer') {
      setCurrentUser({
        id: 3,
        full_name: 'Anna Jones',
        email: 'anna.jones@acmecorp.com',
        role: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#EDECE7] p-4 md:p-6 flex gap-6 antialiased font-sans">
      {/* Floating Left Dock Navigation */}
      <FloatingDock 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentPortal={currentPortal}
        currentUser={currentUser}
        onLogout={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] overflow-hidden">
        {/* Header Bar */}
        <HeaderBar 
          currentUser={currentUser}
          currentPortal={currentPortal}
          setCurrentPortal={handlePortalChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNotifications={() => alert("All subscriptions and billing schedules are synchronized.")}
        />

        {/* Dynamic Content Views */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Top Metric Strip (Spent, Clients, Earnings, Solid Deep Sage Card) */}
            <MetricStrip 
              stats={dashboardStats?.reference_kpis} 
              onCardClick={(tab) => setActiveTab(tab)}
            />

            {/* Middle Section: Balance Wave Card (2 cols), Radial Earnings (1 col), Profile Card (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <BalanceWaveCard stats={dashboardStats?.reference_kpis} />
              </div>
              <div>
                <RadialEarningsCard stats={dashboardStats?.reference_kpis} />
              </div>
              <div>
                <ProfileCard user={currentUser} stats={dashboardStats?.reference_kpis} />
              </div>
            </div>

            {/* Bottom Section: Credit Card Wallet, Transfers List, Keep You Safe */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <WalletCardStack onAddCard={() => alert("Credit Card added to Brightloop Wallet")} />
              </div>
              <div>
                <TransfersListCard 
                  transfers={dashboardStats?.reference_kpis?.transfers} 
                  onViewAll={() => setActiveTab('billing')}
                />
              </div>
              <div>
                <KeepYouSafeCard onOpenSecurity={() => setIsAuthOpen(true)} />
              </div>
            </div>

            {/* Dedicated Portal Section below Dashboard */}
            <div className="mt-8 pt-8 border-t border-[#DDE4DF]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-charcoal">
                    {currentPortal === 'admin' ? 'Executive Administration Portal' : currentPortal === 'staff' ? 'Staff Quotation & Billing Workspace' : 'Customer Self-Service Portal'}
                  </h2>
                  <p className="text-xs text-slate-muted">
                    {currentPortal === 'admin' ? 'Manage Brightloop plans, products with variants (+560 Odoo brand), taxes, discount rules, and staff permissions.' : currentPortal === 'staff' ? 'Build quotes from templates, advance subscription lifecycles, and run batch billing.' : 'Manage subscriptions, accept quotation offers, and inspect invoice receipts.'}
                  </p>
                </div>
              </div>

              {currentPortal === 'admin' && <AdminPortal onRefreshStats={loadDashboardData} />}
              {currentPortal === 'staff' && <StaffPortal />}
              {currentPortal === 'customer' && <CustomerPortal currentCustomer={currentUser} />}
            </div>
          </div>
        ) : activeTab === 'quotations' ? (
          <StaffPortal />
        ) : activeTab === 'subscriptions' ? (
          currentPortal === 'customer' ? <CustomerPortal currentCustomer={currentUser} /> : <StaffPortal />
        ) : activeTab === 'catalog' ? (
          <AdminPortal onRefreshStats={loadDashboardData} />
        ) : activeTab === 'users' ? (
          <AdminPortal onRefreshStats={loadDashboardData} />
        ) : (
          <StaffPortal />
        )}
      </main>

      {/* Auth & Security Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setCurrentPortal(user.role);
          loadDashboardData();
        }}
        currentPortal={currentPortal}
      />
    </div>
  );
}
