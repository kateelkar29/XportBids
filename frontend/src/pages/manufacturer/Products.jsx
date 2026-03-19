import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ManufacturerProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specifications: '',
    quantity: 0,
    quality: '',
    certifications: '',
    packaging: '',
    production_capacity: '',
    export_countries: '',
    moq: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/manufacturers/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        certifications: formData.certifications.split(',').map(c => c.trim()),
        export_countries: formData.export_countries.split(',').map(c => c.trim()),
      };
      await axios.post('/manufacturers/products', payload);
      toast.success('Product added successfully');
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        specifications: '',
        quantity: 0,
        quality: '',
        certifications: '',
        packaging: '',
        production_capacity: '',
        export_countries: '',
        moq: 0,
      });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 data-testid="products-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Products</h1>
          <p className="text-slate-600">Manage your product catalog</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-product-dialog-btn" className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
              <Plus className="mr-2 h-5 w-5" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold uppercase">Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name" className="uppercase text-xs font-bold tracking-wider">Product Name</Label>
                  <Input
                    data-testid="product-name-input"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description" className="uppercase text-xs font-bold tracking-wider">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-none mt-1 min-h-[80px]"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="specifications" className="uppercase text-xs font-bold tracking-wider">Specifications</Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    className="rounded-none mt-1 min-h-[80px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="uppercase text-xs font-bold tracking-wider">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="moq" className="uppercase text-xs font-bold tracking-wider">MOQ</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="quality" className="uppercase text-xs font-bold tracking-wider">Quality</Label>
                  <Input
                    id="quality"
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="certifications" className="uppercase text-xs font-bold tracking-wider">Certifications (comma-separated)</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    placeholder="ISO 9001, CE, FDA"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="packaging" className="uppercase text-xs font-bold tracking-wider">Packaging</Label>
                  <Input
                    id="packaging"
                    value={formData.packaging}
                    onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="production_capacity" className="uppercase text-xs font-bold tracking-wider">Production Capacity</Label>
                  <Input
                    id="production_capacity"
                    value={formData.production_capacity}
                    onChange={(e) => setFormData({ ...formData, production_capacity: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    placeholder="10000 units/month"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="export_countries" className="uppercase text-xs font-bold tracking-wider">Export Countries (comma-separated)</Label>
                  <Input
                    id="export_countries"
                    value={formData.export_countries}
                    onChange={(e) => setFormData({ ...formData, export_countries: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    placeholder="USA, UK, Germany"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold"
              >
                {saving ? 'ADDING...' : 'ADD PRODUCT'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No products yet. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} data-testid="product-card" className="bg-white border border-[#E2E8F0] p-6 hover:border-[#F97316]/20 transition-colors">
              <h3 className="text-lg font-bold uppercase text-[#0F172A] mb-2">{product.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{product.description}</p>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Quality:</span> {product.quality}</p>
                <p><span className="font-semibold">Quantity:</span> {product.quantity}</p>
                <p><span className="font-semibold">MOQ:</span> {product.moq}</p>
                <p><span className="font-semibold">Certifications:</span> {product.certifications.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManufacturerProducts;