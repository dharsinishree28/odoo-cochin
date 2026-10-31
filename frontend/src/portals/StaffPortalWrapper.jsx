import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || 'dashboard';

  const [activeNav, setActiveNav] = useState(currentSection);

  useEffect(() => {
    const section = location.pathname.split('/').filter(Boolean)[1];
    if (section) {
      setActiveNav(section);
    } else {
      navigate('/staff/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  function handleNavChange(newNav) {
    setActiveNav(newNav);
    navigate(`/staff/${newNav}`);
  }

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
      setActiveNav={handleNavChange}
    >
      <StaffPortal activeNav={activeNav} />
    </PortalLayout>
  );
}
