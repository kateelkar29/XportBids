import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await axios.get('/admin/bids');
      setBids(response.data);
    } catch (error) {
      toast.error('Failed to fetch bids');
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
        <h1 data-testid="bids-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Bids Management</h1>
        <p className="text-slate-600">Review all manufacturer bids</p>
      </div>

      {bids.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No bids to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid) => (
            <div key={bid.id} data-testid="bid-card" className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">${bid.price.toFixed(2)}</p>
                  <p className="text-sm text-slate-600">Delivery: {bid.delivery_time}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-none ${
                  bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bid.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{bid.terms}</p>
              <p className="text-xs text-slate-500">Req ID: {bid.requirement_id.substring(0, 8)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBids;