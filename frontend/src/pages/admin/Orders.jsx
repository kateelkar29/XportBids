import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', progress: '', vessel_mmsi: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {};
      if (updateData.status) payload.status = updateData.status;
      if (updateData.progress) payload.progress = updateData.progress;
      if (updateData.vessel_mmsi) payload.vessel_mmsi = parseInt(updateData.vessel_mmsi);

      await axios.put(`/admin/orders/${selectedOrder.id}`, payload);
      toast.success('Order updated successfully');
      setOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
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
        <h1 data-testid="orders-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Orders Management</h1>
        <p className="text-slate-600">Process and track all orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No orders to display.</p>
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
                    setUpdateData({
                      status: order.status,
                      progress: order.progress,
                      vessel_mmsi: order.vessel_mmsi?.toString() || '',
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid={`edit-order-btn-${order.id}`} className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
                      <Edit className="mr-2 h-4 w-4" /> Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg rounded-none">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold uppercase">Update Order</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="status" className="uppercase text-xs font-bold tracking-wider">Status</Label>
                        <Select value={updateData.status} onValueChange={(value) => setUpdateData({ ...updateData, status: value })}>
                          <SelectTrigger data-testid="order-status-select" className="h-10 rounded-none mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="vessel_mmsi" className="uppercase text-xs font-bold tracking-wider">Vessel MMSI</Label>
                        <Input
                          data-testid="vessel-mmsi-input"
                          id="vessel_mmsi"
                          type="number"
                          value={updateData.vessel_mmsi}
                          onChange={(e) => setUpdateData({ ...updateData, vessel_mmsi: e.target.value })}
                          className="h-10 rounded-none mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="progress" className="uppercase text-xs font-bold tracking-wider">Progress Update</Label>
                        <Textarea
                          data-testid="order-progress-input"
                          id="progress"
                          value={updateData.progress}
                          onChange={(e) => setUpdateData({ ...updateData, progress: e.target.value })}
                          className="rounded-none mt-1 min-h-[100px]"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold"
                      >
                        {updating ? 'UPDATING...' : 'UPDATE ORDER'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Importer ID</p>
                  <p className="text-slate-600">{order.importer_id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Manufacturer ID</p>
                  <p className="text-slate-600">{order.manufacturer_id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Vessel MMSI</p>
                  <p className="text-slate-600">{order.vessel_mmsi || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Last Updated</p>
                  <p className="text-slate-600">{new Date(order.updated_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                <p className="text-xs uppercase font-semibold text-slate-600 mb-2">Current Progress</p>
                <p className="text-sm text-[#0F172A]">{order.progress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;