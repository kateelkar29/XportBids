import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, DollarSign, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ImporterHome = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ requirements: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, requirementsRes, ordersRes] = await Promise.all([
        axios.get('/importers/profile').catch(() => ({ data: null })),
        axios.get('/importers/requirements'),
        axios.get('/importers/orders'),
      ]);
      
      setProfile(profileRes.data);
      setStats({
        requirements: requirementsRes.data.length,
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
        <h1 data-testid="dashboard-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Importer Dashboard</h1>
        <p className="text-slate-600">Manage your import requirements and orders</p>
      </div>

      {!profile ? (
        <div className="bg-white border border-[#E2E8F0] p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
          <p className="text-slate-600 mb-4">Set up your company profile to start posting requirements.</p>
          <Link to="/importer/profile">
            <Button data-testid="setup-profile-btn" className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
              Setup Profile
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#0F172A]">{profile.company_name}</h2>
          <p className="text-sm text-slate-600">{profile.country} | {profile.email}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div data-testid="requirements-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.requirements}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Total Requirements</p>
        </div>

        <div data-testid="orders-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.orders}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Active Orders</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">-</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Quotations Received</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold uppercase text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/importer/requirements">
              <Button data-testid="post-requirement-btn" className="w-full justify-start bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold text-sm">
                Post New Requirement
              </Button>
            </Link>
            <Link to="/importer/vessel-tracking">
              <Button data-testid="track-vessel-btn" className="w-full justify-start bg-white border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#F8FAFC] h-10 rounded-none uppercase font-bold text-sm">
                Track Vessels
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold uppercase text-[#0F172A] mb-4">Platform Features</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>• Post detailed import requirements with HSN codes</p>
            <p>• Receive competitive quotations from manufacturers</p>
            <p>• Track vessel movements in real-time</p>
            <p>• Monitor order progress and updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImporterHome;