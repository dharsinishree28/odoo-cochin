import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalLayout from '../components/PortalLayout';
import AdminPortal from './AdminPortal';
import { 
  LayoutGrid, 
  Package, 
  Calendar, 
  Tag, 
  Users, 
  UserCheck, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function AdminPortalWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract section from URL (e.g. /admin/dashboard or /admin/products)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || 'dashboard';

  const [activeNav, setActiveNav] = useState(currentSection);

  useEffect(() => {
    const section = location.pathname.split('/').filter(Boolean)[1];
    if (section) {
      setActiveNav(section);
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  function handleNavChange(newNav) {
    setActiveNav(newNav);
    navigate(`/admin/${newNav}`);
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'plans', label: 'Subscription Plans', icon: Calendar },
    { id: 'offers', label: 'Offers & Rules', icon: Tag },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'customers', label: 'Customer Directory', icon: UserCheck },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <PortalLayout
      title="Admin Portal"
      subtitle="Executive management of products, plans, offers, staff, and financial reports"
      sidebarItems={sidebarItems}
      activeNav={activeNav}
      setActiveNav={handleNavChange}
    >
      <AdminPortal activeNav={activeNav} />
    </PortalLayout>
  );
}
