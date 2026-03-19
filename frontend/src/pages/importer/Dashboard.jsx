import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, FileText, DollarSign, ShoppingBag, Ship, HelpCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ImporterHome from './Home';
import ImporterProfile from './Profile';
import ImporterRequirements from './Requirements';
import ImporterOrders from './Orders';
import ImporterVesselTracking from './VesselTracking';

const ImporterDashboard = () => {
  const menuItems = [
    { path: '', label: 'Dashboard', icon: <Home size={20} strokeWidth={1.5} />, testId: 'nav-dashboard' },
    { path: '/profile', label: 'Profile', icon: <Home size={20} strokeWidth={1.5} />, testId: 'nav-profile' },
    { path: '/requirements', label: 'Requirements', icon: <FileText size={20} strokeWidth={1.5} />, testId: 'nav-requirements' },
    { path: '/orders', label: 'My Orders', icon: <ShoppingBag size={20} strokeWidth={1.5} />, testId: 'nav-orders' },
    { path: '/vessel-tracking', label: 'Vessel Tracking', icon: <Ship size={20} strokeWidth={1.5} />, testId: 'nav-vessel-tracking' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar items={menuItems} basePath="/importer" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<ImporterHome />} />
          <Route path="profile" element={<ImporterProfile />} />
          <Route path="requirements" element={<ImporterRequirements />} />
          <Route path="orders" element={<ImporterOrders />} />
          <Route path="vessel-tracking" element={<ImporterVesselTracking />} />
        </Routes>
      </div>
    </div>
  );
};

export default ImporterDashboard;