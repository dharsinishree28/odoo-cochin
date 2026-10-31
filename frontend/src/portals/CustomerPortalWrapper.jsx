import React, { useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import CustomerPortal from './CustomerPortal';
import { 
  LayoutGrid, 
  CreditCard, 
  Tag, 
  FileText, 
  Receipt, 
  User, 
  LogOut 
} from 'lucide-react';

export default function CustomerPortalWrapper() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'subscriptions', label: 'My Subscription', icon: CreditCard },
    { id: 'offers', label: 'Browse Offers', icon: Tag },
    { id: 'quotations', label: 'My Quotations', icon: FileText },
    { id: 'payments', label: 'Payment History', icon: Receipt },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <PortalLayout
      title="Customer Portal"
      subtitle="Self-service subscription management, quotation reviews, and receipts"
      sidebarItems={sidebarItems}
      activeNav={activeNav}
      setActiveNav={setActiveNav}
    >
      <CustomerPortal activeNav={activeNav} />
    </PortalLayout>
  );
}
