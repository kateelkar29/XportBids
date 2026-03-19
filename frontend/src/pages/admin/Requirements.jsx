import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AdminRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/admin/requirements');
      setRequirements(response.data);
    } catch (error) {
      toast.error('Failed to fetch requirements');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requirementId, newStatus) => {
    try {
      await axios.put(`/admin/requirements/${requirementId}/status?status=${newStatus}`);
      toast.success('Status updated successfully');
      fetchRequirements();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="requirements-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Requirements Management</h1>
        <p className="text-slate-600">Review and manage all import requirements</p>
      </div>

      {requirements.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No requirements to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requirements.map((req) => (
            <div key={req.id} data-testid="requirement-card" className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase text-[#0F172A] mb-1">HSN: {req.hsn_code}</h3>
                  <p className="text-sm text-slate-600">Quantity: {req.quantity} units</p>
                </div>
                <div className="w-64">
                  <Select value={req.status} onValueChange={(value) => updateStatus(req.id, value)}>
                    <SelectTrigger data-testid={`status-select-${req.id}`} className="h-10 rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="open_for_bidding">Open for Bidding</SelectItem>
                      <SelectItem value="contracted">Contracted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Quality Requirements</p>
                  <p className="text-slate-600">{req.quality_requirements}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Shipping Terms</p>
                  <p className="text-slate-600">{req.shipping_terms}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Port Details</p>
                  <p className="text-slate-600">{req.port_details}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Destination</p>
                  <p className="text-slate-600">{req.destination_details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRequirements;