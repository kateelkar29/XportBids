import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ManufacturerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    factory_address: '',
    warehouse_address: '',
    bank_account: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/manufacturers/profile');
      setProfile(response.data);
      setFormData({
        company_name: response.data.company_name,
        address: response.data.address,
        factory_address: response.data.factory_address,
        warehouse_address: response.data.warehouse_address,
        bank_account: response.data.bank_account,
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (profile) {
        await axios.put('/manufacturers/profile', formData);
        toast.success('Profile updated successfully');
      } else {
        await axios.post('/manufacturers/profile', formData);
        toast.success('Profile created successfully');
      }
      fetchProfile();
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="profile-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">
          Company Profile
        </h1>
        <p className="text-slate-600">Manage your company information</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="company_name" className="uppercase text-xs font-bold tracking-wider">Company Name</Label>
            <Input
              data-testid="company-name-input"
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="h-10 rounded-none border-[#E2E8F0] mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="uppercase text-xs font-bold tracking-wider">Address</Label>
            <Textarea
              data-testid="address-input"
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="rounded-none border-[#E2E8F0] mt-2 min-h-[80px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="factory_address" className="uppercase text-xs font-bold tracking-wider">Factory Address</Label>
            <Textarea
              data-testid="factory-address-input"
              id="factory_address"
              value={formData.factory_address}
              onChange={(e) => setFormData({ ...formData, factory_address: e.target.value })}
              className="rounded-none border-[#E2E8F0] mt-2 min-h-[80px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="warehouse_address" className="uppercase text-xs font-bold tracking-wider">Warehouse Address</Label>
            <Textarea
              data-testid="warehouse-address-input"
              id="warehouse_address"
              value={formData.warehouse_address}
              onChange={(e) => setFormData({ ...formData, warehouse_address: e.target.value })}
              className="rounded-none border-[#E2E8F0] mt-2 min-h-[80px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="bank_account" className="uppercase text-xs font-bold tracking-wider">Bank Account Details</Label>
            <Input
              data-testid="bank-account-input"
              id="bank_account"
              value={formData.bank_account}
              onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
              className="h-10 rounded-none border-[#E2E8F0] mt-2"
              required
            />
          </div>

          <Button
            data-testid="save-profile-btn"
            type="submit"
            disabled={saving}
            className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-12 px-8 rounded-none uppercase font-bold tracking-wider shadow-[4px_4px_0px_0px_rgba(15,23,42,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {saving ? 'SAVING...' : (profile ? 'UPDATE PROFILE' : 'CREATE PROFILE')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ManufacturerProfile;