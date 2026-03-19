import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, FileText, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ManufacturerHome = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ products: 0, bids: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, productsRes, bidsRes, ordersRes] = await Promise.all([
        axios.get('/manufacturers/profile').catch(() => ({ data: null })),
        axios.get('/manufacturers/products'),
        axios.get('/manufacturers/bids'),
        axios.get('/manufacturers/orders'),
      ]);
      
      setProfile(profileRes.data);
      setStats({
        products: productsRes.data.length,
        bids: bidsRes.data.length,
        orders: ordersRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async (checked) => {
    try {
      await axios.post(`/manufacturers/availability?is_available=${checked}`);
      setProfile({ ...profile, is_available: checked });
      toast.success(`Availability set to ${checked ? 'Available' : 'Unavailable'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="dashboard-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Manufacturer Dashboard</h1>
        <p className="text-slate-600">Manage your products and orders</p>
      </div>

      {!profile ? (
        <div className="bg-white border border-[#E2E8F0] p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
          <p className="text-slate-600 mb-4">Set up your company profile to start listing products and bidding on orders.</p>
          <Link to="/manufacturer/profile">
            <Button data-testid="setup-profile-btn" className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
              Setup Profile
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">{profile.company_name}</h2>
              <p className="text-sm text-slate-600">{profile.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium uppercase text-slate-600">Factory Availability</span>
              <Switch
                data-testid="availability-toggle"
                checked={profile.is_available}
                onCheckedChange={handleAvailabilityToggle}
              />
              <span className={`text-sm font-bold uppercase ${profile.is_available ? 'text-green-600' : 'text-red-600'}`}>
                {profile.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div data-testid="products-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.products}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Total Products</p>
        </div>

        <div data-testid="bids-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.bids}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Active Bids</p>
        </div>

        <div data-testid="orders-stat-card" className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="h-10 w-10 text-[#F97316]" strokeWidth={1.5} />
            <span className="text-3xl font-bold text-[#0F172A]">{stats.orders}</span>
          </div>
          <p className="text-sm uppercase font-semibold text-slate-600">Ongoing Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold uppercase text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/manufacturer/products">
              <Button data-testid="add-product-btn" className="w-full justify-start bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold text-sm">
                Add New Product
              </Button>
            </Link>
            <Link to="/manufacturer/requirements">
              <Button data-testid="view-requirements-btn" className="w-full justify-start bg-white border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#F8FAFC] h-10 rounded-none uppercase font-bold text-sm">
                View Requirements
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold uppercase text-[#0F172A] mb-4">Platform Insights</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>• List your products with detailed specifications and certifications</p>
            <p>• Bid on import requirements that match your capabilities</p>
            <p>• Track order progress and update status in real-time</p>
            <p>• Toggle availability when your factory capacity changes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerHome;