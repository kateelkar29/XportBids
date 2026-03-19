import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ManufacturerRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [open, setOpen] = useState(false);
  const [bidData, setBidData] = useState({ price: '', delivery_time: '', terms: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/manufacturers/requirements');
      setRequirements(response.data);
    } catch (error) {
      toast.error('Failed to fetch requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/manufacturers/bids', {
        requirement_id: selectedReq.id,
        price: parseFloat(bidData.price),
        delivery_time: bidData.delivery_time,
        terms: bidData.terms,
      });
      toast.success('Bid submitted successfully');
      setOpen(false);
      setBidData({ price: '', delivery_time: '', terms: '' });
    } catch (error) {
      toast.error('Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="requirements-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Open Requirements</h1>
        <p className="text-slate-600">Browse and bid on import requirements</p>
      </div>

      {requirements.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No open requirements at the moment.</p>
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
                <Dialog open={open && selectedReq?.id === req.id} onOpenChange={(isOpen) => {
                  setOpen(isOpen);
                  if (isOpen) setSelectedReq(req);
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid={`bid-btn-${req.id}`} className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
                      <Send className="mr-2 h-4 w-4" /> Submit Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl rounded-none">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold uppercase">Submit Your Bid</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitBid} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="price" className="uppercase text-xs font-bold tracking-wider">Price (USD)</Label>
                        <Input
                          data-testid="bid-price-input"
                          id="price"
                          type="number"
                          step="0.01"
                          value={bidData.price}
                          onChange={(e) => setBidData({ ...bidData, price: e.target.value })}
                          className="h-10 rounded-none mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery_time" className="uppercase text-xs font-bold tracking-wider">Delivery Time</Label>
                        <Input
                          data-testid="bid-delivery-input"
                          id="delivery_time"
                          value={bidData.delivery_time}
                          onChange={(e) => setBidData({ ...bidData, delivery_time: e.target.value })}
                          className="h-10 rounded-none mt-1"
                          placeholder="e.g., 30 days"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="terms" className="uppercase text-xs font-bold tracking-wider">Terms & Conditions</Label>
                        <Textarea
                          data-testid="bid-terms-input"
                          id="terms"
                          value={bidData.terms}
                          onChange={(e) => setBidData({ ...bidData, terms: e.target.value })}
                          className="rounded-none mt-1 min-h-[100px]"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold"
                      >
                        {submitting ? 'SUBMITTING...' : 'SUBMIT BID'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
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
                <div className="col-span-2">
                  <p className="font-semibold text-[#0F172A] mb-1">Certification Requirements</p>
                  <p className="text-slate-600">{req.certification_requirements}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManufacturerRequirements;