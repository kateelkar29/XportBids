import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, FileText, DollarSign, ShoppingBag, Settings } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AdminHome from './Home';
import AdminRequirements from './Requirements';
import AdminBids from './Bids';
import AdminOrders from './Orders';

const AdminDashboard = () => {
  const menuItems = [
    { path: '', label: 'Dashboard', icon: <Home size={20} strokeWidth={1.5} />, testId: 'nav-dashboard' },
    { path: '/requirements', label: 'Requirements', icon: <FileText size={20} strokeWidth={1.5} />, testId: 'nav-requirements' },
    { path: '/bids', label: 'Bids', icon: <DollarSign size={20} strokeWidth={1.5} />, testId: 'nav-bids' },
    { path: '/orders', label: 'Orders', icon: <ShoppingBag size={20} strokeWidth={1.5} />, testId: 'nav-orders' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar items={menuItems} basePath="/admin" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="requirements" element={<AdminRequirements />} />
          <Route path="bids" element={<AdminBids />} />
          <Route path="orders" element={<AdminOrders />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;