import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag } from 'lucide-react';

const ImporterOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/importers/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders');
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
        <h1 data-testid="orders-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">My Orders</h1>
        <p className="text-slate-600">Track your import orders</p>
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
              <h3 className="text-xl font-bold uppercase text-[#0F172A] mb-2">Order #{order.id.substring(0, 8)}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Status</p>
                  <p className="text-slate-600">{order.status}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] mb-1">Vessel MMSI</p>
                  <p className="text-slate-600">{order.vessel_mmsi || 'Not assigned'}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                <p className="text-xs uppercase font-semibold text-slate-600 mb-2">Current Progress</p>
                <p className="text-sm text-[#0F172A]">{order.progress}</p>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p>Last Updated: {new Date(order.updated_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImporterOrders;