import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Ship, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Content */}
        <div className="lg:col-span-6 flex flex-col justify-center px-8 md:px-16 py-20 bg-[#0F172A]">
          <div className="max-w-xl">
            <p data-testid="hero-subtitle" className="text-xs font-mono uppercase tracking-wider text-[#F97316] mb-4">B2B GLOBAL TRADE PLATFORM</p>
            <h1 data-testid="hero-title" className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter mb-6">
              Connect.
              <br />
              Trade.
              <br />
              Grow.
            </h1>
            <p data-testid="hero-description" className="text-lg text-slate-400 mb-8 leading-relaxed">
              Streamline international trade operations. Connect manufacturers with importers. Track shipments in real-time. Manage orders efficiently.
            </p>
            <div className="flex gap-4">
              <Link to="/register">
                <Button 
                  data-testid="get-started-btn"
                  className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-12 px-8 rounded-none uppercase font-bold tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(249,115,22,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  GET STARTED <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  data-testid="login-btn"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-none uppercase font-bold tracking-wider text-sm"
                >
                  LOGIN
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div 
          className="lg:col-span-6 relative bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 100%), url('https://images.unsplash.com/photo-1632517306067-b54ab4d1f98d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwxfHxjb250YWluZXIlMjBzaGlwJTIwb2NlYW4lMjBsb2dpc3RpY3N8ZW58MHx8fHwxNzczMzMyODU0fDA&ixlib=rb-4.1.0&q=85')`
          }}
        >
          <div className="absolute inset-0 flex items-end p-8 md:p-16">
            <div className="text-white">
              <p className="text-xs font-mono uppercase tracking-wider mb-2">TRUSTED BY GLOBAL TRADERS</p>
              <p className="text-2xl font-bold">Real-time vessel tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-8 md:px-16 py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <h2 data-testid="features-heading" className="text-3xl font-semibold uppercase tracking-tight text-[#0F172A] mb-12 text-center">Three Powerful Interfaces</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Manufacturer Card */}
            <div data-testid="manufacturer-feature-card" className="bg-white border border-[#E2E8F0] p-8 hover:border-[#F97316]/20 transition-colors">
              <Package className="h-12 w-12 text-[#F97316] mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-medium uppercase text-[#0F172A] mb-4">Manufacturers</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Create detailed company profiles</li>
                <li>• List products with certifications</li>
                <li>• Bid on import requirements</li>
                <li>• Manage orders & track progress</li>
                <li>• Toggle availability status</li>
              </ul>
            </div>

            {/* Importer Card */}
            <div data-testid="importer-feature-card" className="bg-white border border-[#E2E8F0] p-8 hover:border-[#F97316]/20 transition-colors">
              <Ship className="h-12 w-12 text-[#F97316] mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-medium uppercase text-[#0F172A] mb-4">Importers</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Post detailed requirements</li>
                <li>• Review manufacturer quotations</li>
                <li>• Contract orders directly</li>
                <li>• Real-time vessel tracking</li>
                <li>• Monitor order progress</li>
              </ul>
            </div>

            {/* Admin Card */}
            <div data-testid="admin-feature-card" className="bg-white border border-[#E2E8F0] p-8 hover:border-[#F97316]/20 transition-colors">
              <Users className="h-12 w-12 text-[#F97316] mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-medium uppercase text-[#0F172A] mb-4">Admin</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• View all enquiries & requirements</li>
                <li>• Manage bidding process</li>
                <li>• Process orders & logistics</li>
                <li>• Draft inco terms</li>
                <li>• Monitor platform activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-8 md:px-16 py-20 bg-[#0F172A] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-6">Ready to scale your trade operations?</h2>
          <p className="text-lg text-slate-400 mb-8">Join the platform connecting global manufacturers and importers.</p>
          <Link to="/register">
            <Button 
              data-testid="cta-register-btn"
              className="bg-[#F97316] text-white hover:bg-[#ea6a0f] h-12 px-10 rounded-none uppercase font-bold tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(249,115,22,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              CREATE ACCOUNT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;