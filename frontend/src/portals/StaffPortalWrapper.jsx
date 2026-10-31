import React, { useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import StaffPortal from './StaffPortal';
import { 
  LayoutGrid, 
  FileText, 
  PlusCircle, 
  RefreshCw, 
  User, 
  LogOut 
} from 'lucide-react';

export default function StaffPortalWrapper() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'requests', label: 'Quotation Requests', icon: FileText },
    { id: 'create', label: 'Create Quotation', icon: PlusCircle },
    { id: 'tracking', label: 'Quotation Tracking', icon: RefreshCw },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <PortalLayout
      title="Staff Portal"
      subtitle="Sales operations, quotation proposals, and automated billing runs"
      sidebarItems={sidebarItems}
      activeNav={activeNav}
      setActiveNav={setActiveNav}
    >
      <StaffPortal activeNav={activeNav} />
    </PortalLayout>
  );
}
