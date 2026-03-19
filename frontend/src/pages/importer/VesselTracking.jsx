import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Ship, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ImporterVesselTracking = () => {
  const [mmsi, setMmsi] = useState('');
  const [vesselData, setVesselData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!mmsi) {
      toast.error('Please enter MMSI number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/vessels/track/${mmsi}`);
      setVesselData(response.data);
      toast.success('Vessel location updated');
    } catch (error) {
      toast.error('Failed to track vessel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 data-testid="vessel-tracking-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Vessel Tracking</h1>
        <p className="text-slate-600">Track your shipments in real-time</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] p-6 mb-6">
        <form onSubmit={handleTrack} className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="mmsi" className="uppercase text-xs font-bold tracking-wider mb-2 block">Vessel MMSI Number</Label>
            <Input
              data-testid="mmsi-input"
              id="mmsi"
              type="number"
              value={mmsi}
              onChange={(e) => setMmsi(e.target.value)}
              className="h-10 rounded-none"
              placeholder="Enter MMSI number"
              required
            />
          </div>
          <Button
            data-testid="track-vessel-btn"
            type="submit"
            disabled={loading}
            className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold mt-6"
          >
            <Search className="mr-2 h-4 w-4" /> {loading ? 'TRACKING...' : 'TRACK'}
          </Button>
        </form>
      </div>

      {vesselData ? (
        <>
          <div className="bg-white border border-[#E2E8F0] p-6 mb-6">
            <h3 className="text-lg font-bold uppercase text-[#0F172A] mb-4">Vessel Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-600">MMSI</p>
                <p className="text-[#0F172A]">{vesselData.mmsi}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600">Speed</p>
                <p className="text-[#0F172A]">{vesselData.speed} knots</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600">Heading</p>
                <p className="text-[#0F172A]">{vesselData.heading}°</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600">Status</p>
                <p className="text-[#0F172A] capitalize">{vesselData.status}</p>
              </div>
            </div>
          </div>

          <div data-testid="vessel-map" className="bg-white border border-[#E2E8F0] p-0" style={{ height: '500px' }}>
            <MapContainer
              center={[vesselData.latitude, vesselData.longitude]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[vesselData.latitude, vesselData.longitude]}>
                <Popup>
                  <div>
                    <p className="font-bold">MMSI: {vesselData.mmsi}</p>
                    <p>Speed: {vesselData.speed} knots</p>
                    <p>Status: {vesselData.status}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </>
      ) : (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <Ship className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Enter MMSI number to track vessel location</p>
        </div>
      )}
    </div>
  );
};

export default ImporterVesselTracking;