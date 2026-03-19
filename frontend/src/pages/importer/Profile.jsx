import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ImporterProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    country: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/importers/profile');
      setProfile(response.data);
      setFormData({
        company_name: response.data.company_name,
        address: response.data.address,
        country: response.data.country,
        phone: response.data.phone,
        email: response.data.email,
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
        await axios.put('/importers/profile', formData);
        toast.success('Profile updated successfully');
      } else {
        await axios.post('/importers/profile', formData);
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
        <h1 data-testid="profile-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Company Profile</h1>
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
            <Input
              data-testid="address-input"
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-10 rounded-none border-[#E2E8F0] mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="country" className="uppercase text-xs font-bold tracking-wider">Country</Label>
            <Input
              data-testid="country-input"
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="h-10 rounded-none border-[#E2E8F0] mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="uppercase text-xs font-bold tracking-wider">Phone</Label>
            <Input
              data-testid="phone-input"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-10 rounded-none border-[#E2E8F0] mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="uppercase text-xs font-bold tracking-wider">Contact Email</Label>
            <Input
              data-testid="email-input"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

export default ImporterProfile;