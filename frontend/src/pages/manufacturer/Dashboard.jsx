import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, Package, FileText, ShoppingBag, ToggleLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ManufacturerHome from './Home';
import ManufacturerProfile from './Profile';
import ManufacturerProducts from './Products';
import ManufacturerRequirements from './Requirements';
import ManufacturerOrders from './Orders';

const ManufacturerDashboard = () => {
  const menuItems = [
    { path: '', label: 'Dashboard', icon: <Home size={20} strokeWidth={1.5} />, testId: 'nav-dashboard' },
    { path: '/profile', label: 'Profile', icon: <Home size={20} strokeWidth={1.5} />, testId: 'nav-profile' },
    { path: '/products', label: 'Products', icon: <Package size={20} strokeWidth={1.5} />, testId: 'nav-products' },
    { path: '/requirements', label: 'Bid on Orders', icon: <FileText size={20} strokeWidth={1.5} />, testId: 'nav-requirements' },
    { path: '/orders', label: 'My Orders', icon: <ShoppingBag size={20} strokeWidth={1.5} />, testId: 'nav-orders' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar items={menuItems} basePath="/manufacturer" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<ManufacturerHome />} />
          <Route path="profile" element={<ManufacturerProfile />} />
          <Route path="products" element={<ManufacturerProducts />} />
          <Route path="requirements" element={<ManufacturerRequirements />} />
          <Route path="orders" element={<ManufacturerOrders />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;