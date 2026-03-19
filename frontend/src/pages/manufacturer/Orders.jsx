import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ManufacturerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/manufacturers/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await axios.put(`/manufacturers/orders/${selectedOrder.id}/progress?progress=${encodeURIComponent(progress)}`);
      toast.success('Order progress updated');
      setOpen(false);
      setProgress('');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="orders-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">My Orders</h1>
        <p className="text-slate-600">Track and update your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No orders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order.id} data-testid="order-card" className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase text-[#0F172A] mb-1">Order #{order.id.substring(0, 8)}</h3>
                  <p className="text-sm text-slate-600">Status: <span className="font-semibold">{order.status}</span></p>
                </div>
                <Dialog open={open && selectedOrder?.id === order.id} onOpenChange={(isOpen) => {
                  setOpen(isOpen);
                  if (isOpen) {
                    setSelectedOrder(order);
                    setProgress(order.progress);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid={`update-progress-btn-${order.id}`} className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
                      <Truck className="mr-2 h-4 w-4" /> Update Progress
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg rounded-none">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold uppercase">Update Order Progress</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProgress} className="space-y-4 mt-4">
                      <Textarea
                        data-testid="progress-input"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        className="rounded-none min-h-[120px]"
                        placeholder="Enter current order status and progress details..."
                        required
                      />
                      <Button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold"
                      >
                        {updating ? 'UPDATING...' : 'UPDATE PROGRESS'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                <p className="text-xs uppercase font-semibold text-slate-600 mb-2">Current Progress</p>
                <p className="text-sm text-[#0F172A]">{order.progress}</p>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p>Updated: {new Date(order.updated_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManufacturerOrders;