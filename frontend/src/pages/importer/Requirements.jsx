import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Eye, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ImporterRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [open, setOpen] = useState(false);
  const [quotationsOpen, setQuotationsOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    material: '',
    hsn_code: '',
    quantity: 0,
    quality_requirements: '',
    port_details: '',
    destination_details: '',
    shipping_terms: '',
    certification_requirements: '',
    payment_details: '',
    additional_info: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // AI Assistant states
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/importers/requirements');
      setRequirements(response.data);
    } catch (error) {
      toast.error('Failed to fetch requirements');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async (requirementId) => {
    try {
      const response = await axios.get(`/importers/quotations/${requirementId}`);
      setQuotations(response.data);
    } catch (error) {
      toast.error('Failed to fetch quotations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/importers/requirements', formData);
      toast.success('Requirement posted successfully');
      setOpen(false);
      setFormData({
        hsn_code: '',
        quantity: 0,
        quality_requirements: '',
        port_details: '',
        destination_details: '',
        shipping_terms: '',
        certification_requirements: '',
        payment_details: '',
        additional_info: '',
      });
      fetchRequirements();
    } catch (error) {
      toast.error('Failed to post requirement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContract = async (requirementId, bidId) => {
    try {
      await axios.post(`/importers/orders?requirement_id=${requirementId}&bid_id=${bidId}`);
      toast.success('Order contracted successfully');
      setQuotationsOpen(false);
      fetchRequirements();
    } catch (error) {
      toast.error('Failed to contract order');
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiInput.trim()) {
      toast.error('Please enter your requirement');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await axios.post('/ai/generate-tender', {
        simple_requirement: aiInput
      });
      
      const aiData = response.data;
      
      // Populate form with AI-generated data
      setFormData({
        category: aiData.category,
        material: aiData.material,
        hsn_code: aiData.hsn_code,
        quantity: parseInt(aiData.quantity) || 0,
        quality_requirements: aiData.quality_requirements,
        port_details: aiData.port_details,
        destination_details: 'To be specified',
        shipping_terms: aiData.shipping_terms,
        certification_requirements: aiData.certifications,
        payment_details: 'As per agreement',
        additional_info: `Product: ${aiData.product_name}\n\nDescription: ${aiData.product_description}\n\nPackaging: ${aiData.packaging_requirements}\n\nQuality Standards: ${aiData.quality_standards}\n\nSuggested Timeline: ${aiData.suggested_delivery_timeline}`,
      });
      
      setShowAiAssistant(false);
      toast.success('AI generated tender details! Review and edit as needed.');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate tender. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 data-testid="requirements-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Requirements</h1>
          <p className="text-slate-600">Post and manage import requirements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="post-requirement-btn" className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 px-6 rounded-none uppercase font-bold">
              <Plus className="mr-2 h-5 w-5" /> Post Requirement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold uppercase">Post New Requirement</DialogTitle>
              <p className="text-sm text-slate-600 mt-2">Create a professional tender manually or use AI assistance</p>
            </DialogHeader>

            {/* AI Assistant Toggle */}
            {!showAiAssistant ? (
              <Alert className="bg-[#FFF7ED] border-[#F97316] mt-4">
                <Sparkles className="h-5 w-5 text-[#F97316]" />
                <AlertDescription className="ml-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#0F172A]">Need help creating your tender? Try our AI Assistant!</span>
                    <Button
                      data-testid="open-ai-assistant-btn"
                      type="button"
                      onClick={() => setShowAiAssistant(true)}
                      className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-8 px-4 rounded-none uppercase font-bold text-xs"
                    >
                      <Wand2 className="mr-1 h-4 w-4" /> Use AI
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] border-2 border-[#F97316] p-6 mt-4 rounded-none">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-[#F97316]" />
                  <h3 className="text-lg font-bold uppercase text-[#0F172A]">AI Tender Assistant</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Describe your product requirement in simple terms. Our AI will generate a professional tender specification.
                </p>
                <div className="space-y-3">
                  <Textarea
                    data-testid="ai-input-textarea"
                    placeholder='Example: "Need 20,000 cotton t-shirts for US market" or "Looking for industrial water pumps, capacity 100HP"'
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="rounded-none border-[#F97316] min-h-[100px] bg-white"
                  />
                  <div className="flex gap-3">
                    <Button
                      data-testid="generate-ai-tender-btn"
                      type="button"
                      onClick={handleGenerateWithAi}
                      disabled={aiGenerating}
                      className="flex-1 bg-[#F97316] text-white hover:bg-[#ea6a0f] h-10 rounded-none uppercase font-bold"
                    >
                      {aiGenerating ? (
                        <>
                          <Wand2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Generate Tender
                        </>
                      )}
                    </Button>
                    <Button
                      data-testid="cancel-ai-btn"
                      type="button"
                      onClick={() => setShowAiAssistant(false)}
                      className="bg-white border-2 border-[#0F172A] text-[#0F172A] hover:bg-slate-100 h-10 px-6 rounded-none uppercase font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="uppercase text-xs font-bold tracking-wider">Product Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    placeholder="e.g., Textiles, Electronics"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="material" className="uppercase text-xs font-bold tracking-wider">Material (Optional)</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    placeholder="e.g., Cotton, Steel"
                  />
                </div>
                <div>
                  <Label htmlFor="hsn_code" className="uppercase text-xs font-bold tracking-wider">HSN Code</Label>
                  <Input
                    data-testid="hsn-code-input"
                    id="hsn_code"
                    value={formData.hsn_code}
                    onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                    className="h-10 rounded-none mt-1"
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
                <div className="col-span-2">
                  <Label htmlFor="quality_requirements" className="uppercase text-xs font-bold tracking-wider">Quality Requirements</Label>
                  <Textarea
                    id="quality_requirements"
                    value={formData.quality_requirements}
                    onChange={(e) => setFormData({ ...formData, quality_requirements: e.target.value })}
                    className="rounded-none mt-1 min-h-[80px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="port_details" className="uppercase text-xs font-bold tracking-wider">Port Details</Label>
                  <Input
                    id="port_details"
                    value={formData.port_details}
                    onChange={(e) => setFormData({ ...formData, port_details: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination_details" className="uppercase text-xs font-bold tracking-wider">Destination</Label>
                  <Input
                    id="destination_details"
                    value={formData.destination_details}
                    onChange={(e) => setFormData({ ...formData, destination_details: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="shipping_terms" className="uppercase text-xs font-bold tracking-wider">Shipping Terms (FOB, CNF, CIF)</Label>
                  <Input
                    id="shipping_terms"
                    value={formData.shipping_terms}
                    onChange={(e) => setFormData({ ...formData, shipping_terms: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    placeholder="e.g., FOB"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="certification_requirements" className="uppercase text-xs font-bold tracking-wider">Certification Requirements</Label>
                  <Textarea
                    id="certification_requirements"
                    value={formData.certification_requirements}
                    onChange={(e) => setFormData({ ...formData, certification_requirements: e.target.value })}
                    className="rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="payment_details" className="uppercase text-xs font-bold tracking-wider">Payment Details</Label>
                  <Input
                    id="payment_details"
                    value={formData.payment_details}
                    onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
                    className="h-10 rounded-none mt-1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="additional_info" className="uppercase text-xs font-bold tracking-wider">Additional Information</Label>
                  <Textarea
                    id="additional_info"
                    value={formData.additional_info}
                    onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                    className="rounded-none mt-1"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 rounded-none uppercase font-bold"
              >
                {submitting ? 'POSTING...' : 'POST REQUIREMENT'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {requirements.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No requirements yet. Post your first requirement to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requirements.map((req) => (
            <div key={req.id} data-testid="requirement-card" className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase text-[#0F172A] mb-1">HSN: {req.hsn_code}</h3>
                  <p className="text-sm text-slate-600">Quantity: {req.quantity} | Status: <span className="font-semibold">{req.status}</span></p>
                </div>
                <Dialog open={quotationsOpen && selectedReq?.id === req.id} onOpenChange={(isOpen) => {
                  setQuotationsOpen(isOpen);
                  if (isOpen) {
                    setSelectedReq(req);
                    fetchQuotations(req.id);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid={`view-quotations-btn-${req.id}`} className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-10 px-6 rounded-none uppercase font-bold">
                      <Eye className="mr-2 h-4 w-4" /> View Quotations
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl rounded-none">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold uppercase">Quotations</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      {quotations.length === 0 ? (
                        <p className="text-center text-slate-600 py-8">No quotations received yet.</p>
                      ) : (
                        quotations.map((quote) => (
                          <div key={quote.id} className="border border-[#E2E8F0] p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-bold text-lg text-[#0F172A]">${quote.price.toFixed(2)}</p>
                                <p className="text-sm text-slate-600">Delivery: {quote.delivery_time}</p>
                              </div>
                              {req.status === 'open_for_bidding' && (
                                <Button
                                  data-testid={`contract-btn-${quote.id}`}
                                  onClick={() => handleContract(req.id, quote.id)}
                                  className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-8 px-4 rounded-none uppercase font-bold text-xs"
                                >
                                  Contract
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{quote.terms}</p>
                          </div>
                        ))
                      )}
                    </div>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImporterRequirements;