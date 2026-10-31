import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalLayout from '../components/PortalLayout';
import CustomerPortal from './CustomerPortal';
import { 
  LayoutGrid, 
  CreditCard, 
  FileText, 
  Receipt, 
  Clock, 
  User, 
  LogOut 
} from 'lucide-react';

export default function CustomerPortalWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split('/').filter(Boolean);
  // e.g. ['customer', 'dashboard'] or ['customer', 'plans'] or ['customer', 'offers', '1']
  const rawSection = pathParts[1] || 'dashboard';
  const offerId = rawSection === 'offers' ? pathParts[2] : null;
  const currentSection = rawSection === 'offers' ? 'offer-details' : rawSection;

  const [activeNav, setActiveNav] = useState(currentSection);

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const sec = parts[1];
    if (!sec) {
      navigate('/customer/dashboard', { replace: true });
    } else if (sec === 'offers') {
      setActiveNav('offer-details');
    } else {
      setActiveNav(sec);
    }
  }, [location.pathname, navigate]);

  function handleNavChange(newNav) {
    setActiveNav(newNav);
    navigate(`/customer/${newNav}`);
  }

  // Sidebar items as specified in Requirement 4 (no Browse Offers menu item)
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'plans', label: 'Choose Subscription', icon: CreditCard },
    { id: 'quotations', label: 'My Quotations', icon: FileText },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'receipts', label: 'Payment Receipts', icon: Receipt },
    { id: 'history', label: 'Purchase History', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <PortalLayout
      title="Customer Portal"
      subtitle="Self-service subscription management, quotation reviews, and receipts"
      sidebarItems={sidebarItems}
      activeNav={activeNav === 'offer-details' ? 'dashboard' : activeNav}
      setActiveNav={handleNavChange}
    >
      <CustomerPortal 
        activeNav={activeNav} 
        offerId={offerId}
        onNavigate={handleNavChange}
      />
    </PortalLayout>
  );
}
