import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, DollarSign, ShoppingBag, Users } from 'lucide-react';

const AdminHome = () => {
  const [stats, setStats] = useState({ requirements: 0, bids: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requirementsRes, bidsRes, ordersRes] = await Promise.all([
        axios.get('/admin/requirements'),
        axios.get('/admin/bids'),
        axios.get('/admin/orders'),
      ]);
      
      setStats({
        requirements: requirementsRes.data.length,
        bids: bidsRes.data.length,
        orders: ordersRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="dashboard-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Platform management and oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div data-testid="requirements-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.requirements}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Total Requirements</p>
        </div>

        <div data-testid="bids-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.bids}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Total Bids</p>
        </div>

        <div data-testid="orders-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.orders}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Total Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold uppercase text-[#0F172A] mb-4">Platform Overview</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>• Manage all import requirements and enquiries</p>
            <p>• Review and approve manufacturer bids</p>
            <p>• Process orders and update logistics</p>
            <p>• Monitor platform activity and performance</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold uppercase text-[#0F172A] mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>• {stats.requirements} requirements posted by importers</p>
            <p>• {stats.bids} bids submitted by manufacturers</p>
            <p>• {stats.orders} orders in progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;